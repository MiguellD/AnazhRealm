// linse-v2.cjs — SPIKE v2 (BAU-ZENSUS Runde 2): der PRÜFER, von anderer Hand als der Bau (Bau = Entwurf A grundriss-a.cjs).
// Er liest nur GEOMETRIE (Balken-Stücke, Auflager-Linien, Ständer, Öffnungen) und rechnet nichts aus dem Bauplan nach.
//   S-a  Balkenlinie über L_max: je Balken-Stück die größte Spannweite zwischen zwei Auflagern, die es unter sich hat.
//   S-b  Ständer trifft Tür ∪ Loch ∪ Lauf-Lichtraum ∪ Podest 0,9 m (Treppenpfosten zählen mit, wenn sie im Podest stehen).
// Drei Quellen derselben Form: (1) der Grundriss-Prototyp (ausGrundriss), (2) die Mutante „Balken auf jedem Ständer“
// (FC:466–470 heute: volle Tiefe, nur Außenwände tragen), (3) das gebaute HAUS des Kerns (ausHaus, Meshes der Balkenlage).
"use strict";
const POST = 0.16, PODEST = 0.9, E_BALKEN = 0.85; // belegt FC:179 post · FC:254 NORM.podest · S1 e 0,85 (gewählt, Runde 1)
const muss = (v, n) => { if (v === undefined || v === null || (typeof v === "number" && !Number.isFinite(v))) throw new Error("linse: es fehlt " + n); return v; };

// ── S-a: Spannweite je Balken-Stück ──────────────────────────────────────────────────────────────
// joists: [{u, a, b, wa, wb}] (Stück von s=a bis s=b an der Lage u; wa/wb = Ende am Wechsel des Treppenlochs, gilt als getragen)
// supports: [{s, u0, u1}] (tragende Linie quer zum Balken bei s, von u0 bis u1)
function spannweiten(joists, supports, Lmax) {
    muss(Lmax, "Lmax");
    const z = { stuecke: 0, ueber: 0, endeFrei: 0, maxSpann: 0 };
    for (const j of joists) {
        z.stuecke++;
        // eine Linie endet auf einem Ständer (post 0,16): sie trägt bis zu seiner Außenkante, ± post/2
        const pts = supports.filter((L) => j.u >= L.u0 - POST / 2 && j.u <= L.u1 + POST / 2 && L.s >= j.a - 0.25 && L.s <= j.b + 0.25).map((L) => Math.min(j.b, Math.max(j.a, L.s)));
        if (j.wa) pts.push(j.a); if (j.wb) pts.push(j.b);
        pts.sort((x, y) => x - y);
        if (!pts.length || pts[0] > j.a + 0.25 || pts[pts.length - 1] < j.b - 0.25) z.endeFrei++;
        let sp = 0; const P = [j.a, ...pts, j.b].sort((x, y) => x - y);
        // ein freies Ende zählt als Kragarm bis zum ersten Auflager: die Spannweite ist dann die Strecke vom Ende zum Auflager
        for (let i = 1; i < P.length; i++) sp = Math.max(sp, P[i] - P[i - 1]);
        if (!pts.length) sp = j.b - j.a;
        z.maxSpann = Math.max(z.maxSpann, sp);
        if (sp > Lmax + 1e-6) z.ueber++;
    }
    return z;
}

// (1) aus dem Grundriss-Prototyp: je Decke über Geschoss k die Balken je Band, e 0,85; am Loch geschnitten (Wechsel)
function ausGrundriss(R) {
    const t = muss(R.treppe, "treppe"), decken = [];
    const lochU = [t.u0 - POST / 2, t.u1 + POST / 2], lochS = [t.s0, t.s1];
    for (const G of R.geschosse) {
        const joists = [], supports = [];
        for (const w of G.waende) if (w.dir === "u" && w.tragend) supports.push({ s: w.at, u0: w.a0, u1: w.a1 });
        for (const z of G.unterzuege) supports.push({ s: z.s, u0: z.u0, u1: z.u1 });
        const hatLoch = G.k < R.st - 1; // die Decke über k trägt das Loch des Laufs k → k+1 (das Dach hat in A keinen Lauf)
        // der Balken ist eine LINIE über die ganze Spannrichtung (Durchlaufträger); er trägt, wo eine tragende Linie unter ihm liegt —
        // die Bänder des Bauplans liest der Prüfer NICHT (eine unterbrochene Linie gibt die Summe beider Felder als Spannweite)
        // ein Balken, der an einer tragenden Wand gleicher Richtung anliegt (|Δu| < post), liegt AUF ihr (Streichbalken) — kein Feld
        const streich = G.waende.filter((w) => w.dir === "s" && w.tragend);
        for (let u = E_BALKEN / 2; u < R.Lu; u += E_BALKEN) {
            if (streich.some((w) => Math.abs(w.at - u) < POST && w.a0 <= 1e-3 && w.a1 >= R.Ls - 1e-3)) continue;
            if (hatLoch && u > lochU[0] && u < lochU[1]) {
                if (lochS[0] > 0.06) joists.push({ u, a: 0, b: lochS[0], wb: true });
                if (R.Ls - lochS[1] > 0.06) joists.push({ u, a: lochS[1], b: R.Ls, wa: true });
            } else joists.push({ u, a: 0, b: R.Ls });
        }
        decken.push({ k: G.k, oben: G.k === R.st - 1, joists, supports });
    }
    return decken;
}
// (2) die Mutante „Balken auf jedem Ständer“ (FC:466–470): je Ständer-Lage u ein Balken über die volle Tiefe, getragen nur von den Außenwänden
function mutanteJederStaender(R) {
    return R.geschosse.map((G) => {
        const us = [...new Set(G.staender.map((p) => +p.u.toFixed(3)))].sort((a, b) => a - b);
        return { k: G.k, joists: us.map((u) => ({ u, a: 0, b: R.Ls })), supports: [{ s: 0, u0: 0, u1: R.Lu }, { s: R.Ls, u0: 0, u1: R.Lu }] };
    });
}
// (3) aus dem gebauten HAUS: Balken = Box balkenB × balkenH, lang in z; Auflager = liegende Boxen lang in x (Rähm, Schwelle) auf der Höhe
function ausHaus(group, P) {
    const bB = muss(P.balkenB, "P.balkenB"), bH = muss(P.balkenH, "P.balkenH");
    group.updateMatrixWorld(true);
    const joists = [], liegend = [];
    group.traverse((m) => {
        if (!m.isMesh || !m.geometry || m.geometry.type !== "BoxGeometry") return;
        const p = m.geometry.parameters, e = m.matrixWorld.elements, x = e[12], y = e[13], z = e[14];
        if (m.rotation && (m.rotation.x || m.rotation.y || m.rotation.z)) return;
        if (Math.abs(p.width - bB) < 1e-4 && Math.abs(p.height - bH) < 1e-4 && p.depth > 0.5) joists.push({ u: x, a: z - p.depth / 2, b: z + p.depth / 2, y });
        else if (p.width > 0.5 && p.depth < 0.35 && p.height < 0.35) liegend.push({ s: z, u0: x - p.width / 2, u1: x + p.width / 2, y });
    });
    // Auflager: liegende Boxen, deren Höhe die Balken-Höhe berührt (Rähm unter/neben dem Balken, |Δy| < 0,3 m)
    const lagen = [...new Set(joists.map((j) => +j.y.toFixed(2)))];
    return lagen.map((y) => ({ y, joists: joists.filter((j) => Math.abs(j.y - y) < 0.02), supports: liegend.filter((L) => Math.abs(L.y - y) < 0.3) }));
}

// ── S-b: Ständer gegen Tür, Loch, Lauf-Lichtraum, Podest ─────────────────────────────────────────
function staenderTreffer(R) {
    const t = muss(R.treppe, "treppe"), h = POST / 2, ein = 1e-3;
    const loch = { u0: t.u0, u1: t.u1, s0: t.s0, s1: t.s1 };
    const podest = t.laengs ? [{ u0: t.u0, u1: t.u1, s0: t.s0 - PODEST, s1: t.s0 }, { u0: t.u0, u1: t.u1, s0: t.s1, s1: t.s1 + PODEST }]
        : [{ u0: t.u0 - PODEST, u1: t.u0, s0: t.s0, s1: t.s1 }, { u0: t.u1, u1: t.u1 + PODEST, s0: t.s0, s1: t.s1 }];
    const trifft = (p, a) => p.u + h > a.u0 + ein && p.u - h < a.u1 - ein && p.s + h > a.s0 + ein && p.s - h < a.s1 - ein;
    const innen = (a) => ({ u0: Math.max(a.u0, h), u1: Math.min(a.u1, R.Lu - h), s0: Math.max(a.s0, h), s1: Math.min(a.s1, R.Ls - h) });
    const z = { staender: 0, tuer: 0, loch: 0, podest: 0, pfostenImPodest: 0, wandInsPodest: 0 };
    for (const G of R.geschosse) {
        const tueren = G.tueren.map((d) => (d.dir === "s" ? { u0: d.at - 0.06, u1: d.at + 0.06, s0: d.c - d.w / 2, s1: d.c + d.w / 2 } : { u0: d.c - d.w / 2, u1: d.c + d.w / 2, s0: d.at - 0.06, s1: d.at + 0.06 }));
        for (const p of G.staender) {
            z.staender++;
            if (tueren.some((a) => trifft(p, a))) z.tuer++;
            if (trifft(p, loch)) z.loch++;
            if (podest.some((a) => trifft(p, innen(a)))) { z.podest++; if (p.art === "treppenpfosten") z.pfostenImPodest++; }
            else if (podest.some((a) => trifft(p, a))) z.wandInsPodest++; // Außenwand: das Podest misst bis zur Wand-ACHSE, lichte < 0,9 m
        }
    }
    z.treffer = z.tuer + z.loch + z.podest;
    return z;
}

// Selbsttest: ein Balken über 6 m ohne Mittel-Auflager ist ROT, mit Auflager in der Mitte GRÜN; ein Ständer im Podest wird gezählt
function selbsttest() {
    const a = spannweiten([{ u: 1, a: 0, b: 6 }], [{ s: 0, u0: 0, u1: 5 }, { s: 6, u0: 0, u1: 5 }], 4.59).ueber === 1;
    const b = spannweiten([{ u: 1, a: 0, b: 6 }], [{ s: 0, u0: 0, u1: 5 }, { s: 3, u0: 0, u1: 5 }, { s: 6, u0: 0, u1: 5 }], 4.59).ueber === 0;
    const c = spannweiten([{ u: 1, a: 0, b: 6 }], [{ s: 0, u0: 0, u1: 5 }, { s: 3, u0: 2, u1: 5 }, { s: 6, u0: 0, u1: 5 }], 4.59).ueber === 1; // Auflager deckt u nicht
    const R = { Lu: 4, Ls: 8, treppe: { u0: 1, u1: 1.9, s0: 2, s1: 5, laengs: true }, geschosse: [{ tueren: [], staender: [{ u: 1.4, s: 5.5, art: "wand" }] }] };
    const d = staenderTreffer(R).podest === 1;
    let e = false; try { spannweiten([], [], undefined); } catch (x) { e = /Lmax/.test(x.message); }
    return { gruen: a && b && c && d && e, z: [a, b, c, d, e] };
}
module.exports = { spannweiten, ausGrundriss, mutanteJederStaender, ausHaus, staenderTreffer, selbsttest };
