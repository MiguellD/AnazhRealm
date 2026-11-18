#!/usr/bin/env node
// SPIKE „Tier-Leib-Raum“ (nur lesend gegen das Repo). Lädt die Ofen-Kerne wie gate:tier-anatomie (welt-boot fadenScope,
// three r184 im node-vm) und misst:
//  (1) TOPOLOGIE  — Primitiv-Baum von bauTier und die gegossene Hülle (BAKERS_BY_KIND.kreatur) über Gattungen und Dial-Schritte
//  (2) LINEARITÄT — Formziele als Differenzen am Refit (der Weg des Menschen, foundry __leibRaumRefit) gegen den echten Refit
//  (3) SKELETT    — Gelenk-Lagen und Haut-Gewichte unter derselben Mischung
//  (2b) BAUPLAN   — dieselbe Messung an einer KOPIE des Gattungs-Kerns im Scratch-vm (Hals 12 · Rute 10 fest, w als Achse)
//  (4) PREIS      — Floats je Individuum, Tafel-MB je Bauplan, Rate des Refits
// Aufruf: node leibraum.cjs [--repo <pfad>] [--schnell] [--rahmen-roh] [--nur-topologie]   (~30–45 s, ein Faden, kein GPU)
// Maßstab: tetrapoda MASSSTAB 1/3 m je Einheit, jede mm-Zahl beim Maßstab des Ziels (Wolf H 2,4 E ≈ 0,8 m).
"use strict";
const path = require("path");
const t0 = Date.now();
const arg = (n, d) => {
    const i = process.argv.indexOf(n);
    return i > 0 ? process.argv[i + 1] : d;
};
const REPO = arg("--repo", "C:/Users/micha/AnazhRealm-profiband");
const SCHNELL = process.argv.includes("--schnell");
const { fadenScope, OFEN_KERNE } = require(path.join(REPO, "scripts/lib/welt-boot.cjs"));
let sb = fadenScope(OFEN_KERNE);
let TC = sb.__tetrapodaCore;
let T = sb.THREE;
const MJE = TC.MASSSTAB.meterJeEinheit; // 1/3 m je Einheit
const mm = (u) => u * MJE * 1000;
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const ARTEN = ["wolf", "fox", "bear", "deer"];
const log = (...a) => console.log(...a);
log(`# Spike Tier-Leib-Raum — Kerne geladen in ${Date.now() - t0} ms (Maßstab ${MJE.toFixed(4)} m/E)`);

// ── der Baum eines Dial-Satzes: dieselben Fabriken wie bakeTierInstance (foundry-core.js:8236–8257), nur grobes Raster ──
function baum(dials) {
    const mat = {};
    const M = (k) => mat[k] || (mat[k] = Object.assign(new T.MeshBasicMaterial(), { userData: { __klasse: k } }));
    const F = {
        gruppe: () => new T.Group(),
        kugel: (r, k, sc) => {
            const m = new T.Mesh(new T.SphereGeometry(r, 4, 3), M(k));
            if (sc) m.scale.set(sc[0], sc[1], sc[2]);
            return m;
        },
        zylinder: (rt, rb, h, k) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, 4, 1), M(k)),
        kugelFein: (r, k) => (k === "hornhaut" ? new T.Group() : new T.Mesh(new T.SphereGeometry(r, 4, 3), M(k))),
        v3: (x, y, z) => new T.Vector3(x, y, z),
        richte: (node, dir) => node.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize()),
        fellSchweif: () => {},
    };
    const B = TC.bauTier(F, dials);
    const root = B.teile.wolf;
    root.updateMatrixWorld(true);
    // die Gelenk-Namen wie bakeTierInstance :8299–8330
    const namen = ["wolf", "legFL", "legFR", "legHL", "legHR", "flU", "flL", "flP", "frU", "frL", "frP", "hlT", "hlC", "hlP",
        "hrT", "hrC", "hrP", "headGroup", "jawGroup", "earL", "earR", "lidTL", "lidTR", "tailRoot"];
    const nodeName = new Map();
    for (const n of namen) if (B.teile[n]) nodeName.set(B.teile[n], n);
    (B.tailSegs || []).forEach((s, i) => nodeName.set(s, "tailSeg" + i));
    const gelenkVon = (n) => {
        for (let c = n; c; c = c.parent) if (nodeName.has(c)) return nodeName.get(c);
        return "wolf";
    };
    let meshes = 0;
    const klassen = {};
    root.traverse((o) => {
        if (o.isMesh) {
            meshes++;
            const k = o.material.userData.__klasse;
            klassen[k] = (klassen[k] || 0) + 1;
        }
    });
    const gelenke = {};
    const wp = new T.Vector3();
    for (const [node, nm] of nodeName) gelenke[nm] = node.getWorldPosition(wp).toArray();
    return { B, root, nodeName, gelenkVon, meshes, klassen, gelenke, H: B.masse.H };
}
// die Primitive der Grobstufe (Stufe 1: der ganze Leib samt Kopf in EINER Haut, __tierHaut :8414–8428), mit dem Raster-Ziel
function prims(b) {
    const TH = sb.TIER_HAUT;
    let vox = TH.voxFern * b.H;
    const blend = TH.blend * b.H;
    let P = sb.__tierPrims(b.root, b.root, () => true, vox, blend, b.gelenkVon);
    let feld = sb.__tierFeld(P, vox, blend);
    const dr = 2 * sb.__tierKanten(feld.f, feld.nx, feld.ny, feld.nz);
    if (dr > TH.dreieckeFern) {
        for (const p of P) p.node.userData.__nichtGiessen = false;
        vox *= Math.sqrt(dr / TH.dreieckeFern);
        P = sb.__tierPrims(b.root, b.root, () => true, vox, blend, b.gelenkVon);
        feld = sb.__tierFeld(P, vox, blend);
    }
    for (const p of P) p.blend = blend; // __leibRaumFeld liest p.blend (sonst die Verrundung des Menschen)
    // DER RAHMEN TRÄGT DEN RADIUS (`--rahmen-roh` schaltet es für die Gegenprobe ab): __leibRaumRefit trägt eine Ecke mit
    // Mi_q⁻¹·Mi_p — der Radius r der Kugel steht NICHT in Mi (er ist ein Parameter der Geometrie, bauTier :4258 s(r, …)), also
    // trägt der Refit eine Ecke beim kleineren Leib um r_p statt r_q vom Zentrum weg. Mi/r (die drei oberen Zeilen) und r = 1
    // ändern das Feld nicht (der Abstand ist homogen in Mi und r: (|Mi·x| − r)/|Miᵀ·q̂|), aber der Rahmen trägt jetzt die Größe.
    if (!RAHMEN_ROH)
        for (const p of P) {
            const M = Float64Array.from(p.Mi);
            for (let col = 0; col < 4; col++) for (let row = 0; row < 3; row++) M[col * 4 + row] /= p.r;
            p.Mi = M;
            p.r = 1;
        }
    return { P, vox, blend, feld };
}
let RAHMEN_ROH = process.argv.includes("--rahmen-roh");
const dialsVon = (art, ov) => Object.assign({}, TC.GATTUNGEN[art], ov || {});

// ════════════════════════ (1) TOPOLOGIE ════════════════════════
log("\n## (1) TOPOLOGIE");
log("### 1a Primitiv-Baum von bauTier je Gattung (Fell-Kugeln = Träger der Haut)");
const sig = {};
for (const art of ARTEN) {
    const b = baum(dialsVon(art));
    const pr = prims(b);
    const A = TC.artGestalt(TC.deriveTierParams(dialsVon(art)));
    sig[art] = { meshes: b.meshes, fell: b.klassen.fell, hals: b.B.neckSegs.length, rute: b.B.tailSegs.length, prims: pr.P.length };
    log(`  ${art.padEnd(5)} Meshes ${b.meshes} · Fell-Kugeln ${b.klassen.fell} · Hals-Glieder ${b.B.neckSegs.length} · Ruten-Glieder ${b.B.tailSegs.length} · Haut-Primitive(L1) ${pr.P.length} · Pfote ${A.bein.pfote} · Ohr ${A.kopf.ohrForm} · Klassen ${JSON.stringify(b.klassen)}`);
}
log("### 1b Dial-Abtastung je Gattung: wo springt die Zahl der Haut-Primitive (±20 % je Dial, 5 Schritte; diet/build ±0,2 absolut)?");
const DIALS = ["size", "neck", "leg", "diet", "build"];
const spruenge = [];
for (const art of ARTEN) {
    const zeile = [];
    for (const k of DIALS) {
        const g = TC.GATTUNGEN[art][k];
        const werte = [];
        for (let s = -2; s <= 2; s++) {
            const v = k === "diet" || k === "build" ? Math.min(1, Math.max(0, g + s * 0.1)) : g * (1 + s * 0.1);
            const b = baum(dialsVon(art, { [k]: v }));
            werte.push(`${b.klassen.fell}/${b.B.neckSegs.length}/${b.B.tailSegs.length}`);
        }
        const verschieden = new Set(werte).size;
        zeile.push(`${k}:${verschieden === 1 ? "fest" : werte.join(" ")}`);
        if (verschieden > 1) spruenge.push(`${art}.${k}`);
    }
    log(`  ${art.padEnd(5)} ${zeile.join(" · ")}   (Fell-Kugeln/Hals/Rute je Schritt)`);
}
log(`  SPRÜNGE der Primitiv-Zahl innerhalb ±20 %: ${spruenge.length ? spruenge.join(", ") : "keine"}`);

log("### 1c Die gegossene Hülle (BAKERS_BY_KIND.kreatur, der Ofen der Welt): Ecken und Index-Länge");
function hullStats(art, lod, ov) {
    const t = Date.now();
    const g = sb.BAKERS_BY_KIND.kreatur(TC, art, 0, lod, ov || null);
    const st = { ms: Date.now() - t, ecken: 0, idx: 0, haut: 0, hautIdx: 0, schale: 0, tris: 0 };
    g.traverse((o) => {
        if (!o.isMesh) return;
        const n = o.geometry.attributes.position.count,
            ix = o.geometry.index ? o.geometry.index.count : n;
        st.ecken += n;
        st.idx += ix;
        st.tris += ix / 3;
        const k = o.material.userData.__klasse;
        if (k === "fell" && o.geometry.attributes.skinWeight && n > 500) {
            st.haut += n;
            st.hautIdx += ix;
            st.indexListe = o.geometry.index.array;
        }
        if (k === "fellSchale") st.schale += n;
    });
    return st;
}
const hull = {};
const hullFaelle = [
    ["wolf", 1, null],
    ["wolf", 1, { size: 2.4 * 1.001 }],
    ["wolf", 1, { build: 0.43 }],
    ["fox", 1, null],
    ["bear", 1, null],
    ["deer", 1, null],
];
if (!SCHNELL) hullFaelle.push(["wolf", 0, null]);
for (const [art, lod, ov] of hullFaelle) {
    const s = hullStats(art, lod, ov);
    const key = `${art} L${lod}${ov ? " " + JSON.stringify(ov) : ""}`;
    hull[key] = s;
    log(`  ${key.padEnd(34)} Haut-Ecken ${String(s.haut).padStart(6)} · Haut-Index ${String(s.hautIdx).padStart(6)} · Schalen-Ecken ${String(s.schale).padStart(6)} · alle Ecken ${String(s.ecken).padStart(6)} · Dreiecke ${Math.round(s.tris)} · Guss ${s.ms} ms`);
}
// gleiche Ecken-Zahl heißt noch nicht gleiche Index-Liste: der kleinste Schritt (size ×1,001 — reine Skala bis auf die Allometrie)
{
    const ia = hull["wolf L1"].indexListe,
        ib = hull[`wolf L1 ${JSON.stringify({ size: 2.4 * 1.001 })}`].indexListe;
    let gleich = ia.length === ib.length;
    for (let i = 0; gleich && i < ia.length; i++) if (ia[i] !== ib[i]) gleich = false;
    log(`  Index-Liste wolf L1 gegen size ×1,001: ${gleich ? "GLEICH" : "VERSCHIEDEN"}`);
}
if (process.argv.includes("--nur-topologie")) process.exit(0);

// ════════════════════════ (2) LINEARITÄT am Refit ════════════════════════
// Der Weg des Menschen (foundry-core __leibRaumTafel :7489, __leibRaumRefit :7421): die Ecken der VORLAGE werden von den
// gepaarten Primitiven getragen und per Newton auf das Nullniveau des Felds des neuen Leibs gelegt. Formziel(d) = Refit(d)/H(d) −
// V0/H0 (die Skala trägt die Instanz-Matrix, die Tafel nur die Form). Gemessen wird die lineare Mischung der Formziele gegen den
// Refit am Ziel (Ecken-Fehler) und — was das Auge sieht — der Abstand der gemischten Ecken von der WAHREN Fläche des Ziels.
let surfaceNets = sb.__koerperCore.surfaceNets;
// jede SCHRITT-te Ecke der Surface-Nets-Vorlage (die Messung braucht keine 3 400 Ecken; ~730 tragen die Verteilung)
const SCHRITT = 3;
function vorlage(art, ov) {
    const b = baum(dialsVon(art, ov));
    const pr = prims(b);
    const F = pr.feld;
    const sn = surfaceNets(F.f, F.nx, F.ny, F.nz, 0, F.lo[0], F.lo[1], F.lo[2], pr.vox);
    const vs = sn.verts.filter((_, i) => i % SCHRITT === 0);
    const V = new Float64Array(vs.length * 3);
    vs.forEach((v, i) => V.set(v, i * 3));
    return { b, pr, V, n: vs.length, nVoll: sn.verts.length };
}
// stabile Kennung je Primitiv: der Platz seines Knotens im Baum (gleiche Struktur ⇒ gleicher Platz)
function kennungen(b, pr) {
    const platz = new Map();
    let i = 0;
    b.root.traverse((o) => platz.set(o, i++));
    for (const p of pr.P) p.ti = platz.get(p.node);
}
// Paarung bei verschiedener Struktur: gierig nach Lage (/H) und Reichweite (/H), nur im selben Gelenk (Rute: tailSeg* als ein Gelenk)
function paareGeometrisch(P0, H0, P1, H1) {
    const gj = (j) => (/^tailSeg/.test(j) ? "rute" : j);
    const kand = [];
    P0.forEach((p, a) =>
        P1.forEach((q, c) => {
            if (gj(p.j) !== gj(q.j)) return;
            const d = Math.hypot(p.c[0] / H0 - q.c[0] / H1, p.c[1] / H0 - q.c[1] / H1, p.c[2] / H0 - q.c[2] / H1) + Math.abs(p.ext / H0 - q.ext / H1);
            kand.push([d, a, c]);
        })
    );
    kand.sort((x, y) => x[0] - y[0]);
    const a0 = new Set(),
        c1 = new Set();
    P0.forEach((p, a) => (p.ti = a));
    P1.forEach((q, c) => (q.ti = 100000 + c));
    let n = 0;
    for (const [, a, c] of kand) {
        if (a0.has(a) || c1.has(c)) continue;
        a0.add(a);
        c1.add(c);
        P1[c].ti = a;
        n++;
    }
    return { gepaart: n, ohne0: P0.length - n, ohne1: P1.length - n };
}
function strukturGleich(b0, b1) {
    return b0.meshes === b1.meshes && b0.B.neckSegs.length === b1.B.neckSegs.length && b0.B.tailSegs.length === b1.B.tailSegs.length;
}
const gjName = (j) => (/^tailSeg/.test(j) ? "rute" : j);
// der Refit der Vorlage T auf den Leib mit den Dials (art, ov): normierte Lage (/H) je Ecke
function refit(Tv, art, ov) {
    const b = baum(dialsVon(art, ov));
    const pr = prims(b);
    let paarung;
    if (strukturGleich(Tv.b, b)) {
        kennungen(b, pr);
        // gleicher Baum, aber ein Primitiv kann unter die Raster-Schwelle fallen (TIER_HAUT.minVox) und fehlt dem Ziel
        const t1 = new Set(pr.P.map((p) => p.ti));
        const fehlt = Tv.pr.P.filter((p) => !t1.has(p.ti)).map((p) => gjName(p.j));
        const t0s = new Set(Tv.pr.P.map((p) => p.ti));
        const neu = pr.P.filter((p) => !t0s.has(p.ti)).map((p) => gjName(p.j));
        paarung = "Baum" + (fehlt.length || neu.length ? ` (der Vorlage fehlt im Ziel: ${fehlt.join(",") || "—"}; neu im Ziel: ${neu.join(",") || "—"})` : "");
    } else {
        const r = paareGeometrisch(Tv.pr.P, Tv.b.H, pr.P, b.H);
        paarung = `Lage (${r.gepaart} gepaart, ${r.ohne0} der Vorlage ohne, ${r.ohne1} des Ziels ohne Partner)`;
    }
    const W = sb.__leibRaumRefit(Tv.V, Tv.pr.P, pr.P, pr.vox);
    if (!paarung.startsWith("Baum")) kennungen(Tv.b, Tv.pr); // die Vorlage bekommt ihre Baum-Kennung zurück
    const N = new Float64Array(W.length);
    for (let i = 0; i < W.length; i++) N[i] = W[i] / b.H;
    return { N, b, pr, paarung, W };
}
// Abstand der Punkte X (normiert, /H) von der wahren Fläche des Ziels: |Feld| am Punkt (das Feld der Ellipsoide ist in erster
// Ordnung der Abstand), in mm beim Maßstab des Ziels
function flaechenAbstand(X, ziel) {
    const H = ziel.b.H,
        out = new Float64Array(X.length / 3);
    for (let i = 0; i < out.length; i++) out[i] = Math.abs(sb.__leibRaumFeld(ziel.pr.P, ziel.pr.vox, X[i * 3] * H, X[i * 3 + 1] * H, X[i * 3 + 2] * H)) * H;
    return out.map((u) => mm(u / H) * 1); // u ist in Einheiten (H herausgerechnet und wieder hinein)
}
function stat(arr) {
    const a = Float64Array.from(arr).sort();
    return { p50: a[Math.floor(a.length * 0.5)], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1] };
}
const fmt = (s) => `p50 ${f1(s.p50)} · p95 ${f1(s.p95)} · max ${f1(s.max)} mm`;
// Ecken-Fehler zweier normierter Lagen, in mm beim Maßstab H
function eckenFehler(A, B, H) {
    const out = new Float64Array(A.length / 3);
    for (let i = 0; i < out.length; i++) out[i] = mm(Math.hypot(A[i * 3] - B[i * 3], A[i * 3 + 1] - B[i * 3 + 1], A[i * 3 + 2] - B[i * 3 + 2]) * H);
    return out;
}
// Deckung: je Punkt der WAHREN Fläche des Ziels (seine Surface-Nets-Ecken) der Abstand zur nächsten gemischten Ecke (Raster-Hash)
function deckung(X, ziel) {
    const H = ziel.b.H,
        F = ziel.pr.feld;
    const sn = surfaceNets(F.f, F.nx, F.ny, F.nz, 0, F.lo[0], F.lo[1], F.lo[2], ziel.pr.vox);
    const C = 0.02;
    const zelle = new Map();
    const key = (x, y, z) => `${Math.floor(x / C)},${Math.floor(y / C)},${Math.floor(z / C)}`;
    for (let i = 0; i < X.length / 3; i++) {
        const k = key(X[i * 3], X[i * 3 + 1], X[i * 3 + 2]);
        (zelle.get(k) || zelle.set(k, []).get(k)).push(i);
    }
    const out = [];
    for (const v of sn.verts) {
        const x = v[0] / H,
            y = v[1] / H,
            z = v[2] / H;
        let best = Infinity;
        for (let r = 1; r <= 6 && best === Infinity; r++) {
            const ix = Math.floor(x / C),
                iy = Math.floor(y / C),
                iz = Math.floor(z / C);
            for (let a = -r; a <= r; a++)
                for (let b2 = -r; b2 <= r; b2++)
                    for (let c = -r; c <= r; c++) {
                        const l = zelle.get(`${ix + a},${iy + b2},${iz + c}`);
                        if (!l) continue;
                        for (const i of l) best = Math.min(best, Math.hypot(X[i * 3] - x, X[i * 3 + 1] - y, X[i * 3 + 2] - z));
                    }
        }
        out.push(mm(best * H));
    }
    return Float64Array.from(out);
}
// Haut-Gewichte (die EINE Regel des Ofens, foundry __primGewichte + __hautGewichte) je Ecke als {Gelenk: Gewicht}
function gewichte(W, pr, b) {
    const H = b.H;
    const R = sb.__primRahmen(pr.P);
    const { zentren, kandidaten } = sb.__primGewichte(pr.P, H, pr.blend, pr.vox, R.lo, R.hi);
    const joints = [...new Set(pr.P.map((p) => p.j))];
    const verts = [];
    for (let i = 0; i < W.length / 3; i++) verts.push([W[i * 3], W[i * 3 + 1], W[i * 3 + 2]]);
    const eW = sb.TIER_HAUT.eW * H;
    const { sIdx, sWgt } = sb.__hautGewichte(verts, zentren, joints, eW * eW, kandidaten);
    const out = [];
    for (let i = 0; i < verts.length; i++) {
        const m = {};
        for (let k = 0; k < 4; k++) if (sWgt[i * 4 + k] > 0) m[joints[sIdx[i * 4 + k]]] = sWgt[i * 4 + k];
        out.push(m);
    }
    return out;
}
const gj = (j) => (/^tailSeg/.test(j) ? "rute" : j);
function gewichtsAbstand(G0, G1) {
    const out = new Float64Array(G0.length);
    for (let i = 0; i < G0.length; i++) {
        const a = {},
            s = new Set();
        for (const [j, w] of Object.entries(G0[i])) ((a[gj(j)] = (a[gj(j)] || 0) + w), s.add(gj(j)));
        const b = {};
        for (const [j, w] of Object.entries(G1[i])) ((b[gj(j)] = (b[gj(j)] || 0) + w), s.add(gj(j)));
        let d = 0;
        for (const j of s) d += Math.abs((a[j] || 0) - (b[j] || 0));
        out[i] = d / 2; // Total-Variation 0 … 1
    }
    return out;
}
// Gelenk-Lagen normiert und ihr Fehler in mm
function gelenkFehler(JA, JB, H) {
    const out = [];
    for (const k of Object.keys(JA)) if (JB[k]) out.push(mm(Math.hypot(JA[k][0] - JB[k][0], JA[k][1] - JB[k][1], JA[k][2] - JB[k][2]) * H));
    return Float64Array.from(out);
}
// DER DREHPUNKT: zeichnet der Satz das Individuum mit den Knochen der Vorlage, dreht jedes Glied um den Drehpunkt der Vorlage —
// der Fehler einer Drehung θ um einen um Δ verschobenen Punkt ist |(I − R)·Δ| = 2·sin(θ/2)·|Δ| (θ = GANG_GESETZ maxWinkel 0,42 rad,
// tetrapoda-core.js:1344); Δ je Gelenk relativ zur Wurzel (die Wurzel verschiebt nur)
const THETA = 0.42;
function drehpunkt(JA, JB, H) {
    let m = 0;
    for (const k of Object.keys(JA)) {
        if (!JB[k] || k === "wolf") continue;
        const d = [0, 1, 2].map((c) => JA[k][c] - JA.wolf[c] - (JB[k][c] - JB.wolf[c]));
        m = Math.max(m, Math.hypot(...d));
    }
    return { delta: mm(m * H), fehler: mm(2 * Math.sin(THETA / 2) * m * H) };
}
const normJ = (b) => Object.fromEntries(Object.entries(b.gelenke).map(([k, v]) => [k, v.map((x) => x / b.H)]));

log(`  [Zeit Teil 1: ${Date.now() - t0} ms]`);
log("\n## (2) LINEARITÄT — Formziele am Refit (Weg des Menschen) gegen den echten Refit");
const tA = Date.now();
const ERG = {};
// ── die Vorlage Wolf ──
const W0 = vorlage("wolf");
kennungen(W0.b, W0.pr);
let W0N = Float64Array.from(W0.V, (x) => x / W0.b.H);
log(`Vorlage Wolf (Stufe-1-Raster): ${W0.n} Ecken, ${W0.pr.P.length} Primitive, vox ${(W0.pr.vox / W0.b.H).toFixed(4)} H`);
{
    const r = refit(W0, "wolf", null);
    const e = eckenFehler(r.N, W0N, W0.b.H);
    const fa = flaechenAbstand(r.N, r);
    log(`  Selbst-Refit Wolf → Wolf: Ecken-Weg ${fmt(stat(e))} · Abstand zur Fläche ${fmt(stat(fa))}   (der Boden der Methode; Paarung ${r.paarung})`);
    ERG.boden = { ecken: stat(e), flaeche: stat(fa) };
    const dk = deckung(W0N, r);
    log(`  Deckung der Vorlage selbst (Raster-Abstand der Ecken): ${fmt(stat(dk))}`);
    ERG.bodenDeckung = stat(dk);
    {
        // die Rate des Refits (die Tafel kostet Knoten × Ecken × Rate): dreimal derselbe Refit, das Mittel
        const t = Date.now();
        for (let k = 0; k < 3; k++) sb.__leibRaumRefit(W0.V, W0.pr.P, r.pr.P, r.pr.vox);
        ERG.refitMsJe1000 = (Date.now() - t) / 3 / (W0.n / 1000);
        log(`  Rate des Refits: ${ERG.refitMsJe1000.toFixed(0)} ms je 1 000 Ecken (node, ein Faden)`);
    }
    W0N = r.N; // N0: die Vorlage auf IHREM Feld (wie __leibRaumTafel :7530) — jedes Formziel ist Ruhe gegen Ruhe
}
const tRefit = Date.now();

// ── FALL 1: das Individuum ±2σ (Wolf) — Achsen Hals, Bein, Statur, Größe (nur die Allometrie; die Skala trägt die Instanz) ──
// σ: Glied-Längen-CV 5 % (Hals, Bein, Größe), Statur σ 0,05 absolut — gewählt, Band der Morphometrie (unsicher)
const SIG = { neck: 0.263 * 0.05, leg: 0.22 * 0.05, build: 0.05, size: 2.4 * 0.05 };
const achsen = Object.keys(SIG);
const Z = {}; // Formziele je Achse an ±2σ
const Jz = {};
for (const k of achsen)
    for (const s of [-2, 2]) {
        const r = refit(W0, "wolf", { [k]: TC.GATTUNGEN.wolf[k] + s * SIG[k] });
        Z[k + s] = r.N.map((x, i) => x - W0N[i]);
        Jz[k + s] = r.b;
    }
const J0 = normJ(W0.b);
const G0 = gewichte(W0.V, W0.pr, W0.b);
function individuum(vorz) {
    const ov = {};
    for (const k of achsen) ov[k] = TC.GATTUNGEN.wolf[k] + vorz * 2 * SIG[k];
    const echt = refit(W0, "wolf", ov);
    const lin = Float64Array.from(W0N);
    for (const k of achsen) {
        const z = Z[k + vorz * 2];
        for (let i = 0; i < lin.length; i++) lin[i] += z[i];
    }
    const H = echt.b.H;
    const e = eckenFehler(lin, echt.N, H),
        fa = flaechenAbstand(lin, echt),
        weg = eckenFehler(echt.N, W0N, H);
    // Skelett: Gelenke linear gemischt gegen die echten Gelenke
    const Jl = {};
    for (const j of Object.keys(J0)) {
        Jl[j] = J0[j].slice();
        for (const k of achsen) {
            const Jk = normJ(Jz[k + vorz * 2]);
            for (let c = 0; c < 3; c++) Jl[j][c] += Jk[j][c] - J0[j][c];
        }
    }
    const Je = normJ(echt.b);
    const jf = gelenkFehler(Jl, Je, H),
        jw = gelenkFehler(J0, Je, H);
    const G1 = gewichte(echt.W, echt.pr, echt.b);
    const gw = gewichtsAbstand(G0, G1);
    return { e: stat(e), fa: stat(fa), weg: stat(weg), jf: stat(jf), jw: stat(jw), gw: stat(gw), paarung: echt.paarung, dp: drehpunkt(J0, Je, H) };
}
log("### Fall 1 — Individuum Wolf, alle vier Achsen zugleich an ±2σ (die Ecke mit der größten Wechselwirkung); Formziele je Achse an ±2σ");
for (const v of [1, -1]) {
    const r = individuum(v);
    ERG["ind" + v] = r;
    log(`  ${v > 0 ? "+2σ" : "−2σ"}: Weg der Ecken vom Mittel ${fmt(r.weg)}`);
    log(`        lineare Mischung − Refit (Ecke)   ${fmt(r.e)}`);
    log(`        lineare Mischung → wahre Fläche   ${fmt(r.fa)}   (sichtbar)`);
    log(`        Gelenke: Weg ${fmt(r.jw)} · linear gemischt − echt ${fmt(r.jf)} · Drehpunkt relativ zur Wurzel max ${f1(r.dp.delta)} mm → mit den Knochen der Vorlage gedreht (θ 0,42) bis ${f1(r.dp.fehler)} mm`);
    log(`        Haut-Gewichte Vorlage ↔ Ziel (Total-Variation 0…1): p50 ${r.gw.p50.toFixed(3)} · p95 ${r.gw.p95.toFixed(3)} · max ${r.gw.max.toFixed(3)}   (Paarung ${r.paarung})`);
}

// ── FALL 2/3: Wolf → Fuchs, Wolf → Bär (EINE Art-Achse t, die Dials linear in t) ──
function artPfad(nach) {
    const d0 = TC.GATTUNGEN.wolf,
        d1 = TC.GATTUNGEN[nach];
    const ov = (t) => Object.fromEntries(DIALS.map((k) => [k, d0[k] + t * (d1[k] - d0[k])]));
    const R = {};
    for (const t of [0.25, 0.5, 0.75, 1]) R[t] = refit(W0, "wolf", ov(t));
    const Z1 = R[1].N.map((x, i) => x - W0N[i]);
    const Zh = R[0.5].N.map((x, i) => x - W0N[i]);
    const out = { t: {} };
    for (const t of [0.25, 0.5, 0.75]) {
        const echt = R[t];
        const H = echt.b.H;
        // zwei Knoten (0, 1)
        const lin2 = W0N.map((x, i) => x + t * Z1[i]);
        // drei Knoten (0, ½, 1) — stückweise linear wie LEIB_RAUM
        const lin3 = W0N.map((x, i) => (t <= 0.5 ? x + (t / 0.5) * Zh[i] : x + Zh[i] + ((t - 0.5) / 0.5) * (Z1[i] - Zh[i])));
        const w = TC.artGestalt(TC.deriveTierParams(ov(t))).gewichte;
        out.t[t] = {
            w: `wolf ${w.wolf.toFixed(3)} / ${nach} ${w[nach].toFixed(3)}`,
            e2: stat(eckenFehler(lin2, echt.N, H)),
            fa2: stat(flaechenAbstand(lin2, echt)),
            fa3: t === 0.5 ? null : stat(flaechenAbstand(lin3, echt)),
            paarung: echt.paarung,
        };
    }
    // am Ziel selbst: der Refit trägt die Vorlage auf die Fläche — deckt er sie (fehlende Glieder)?
    const z = R[1];
    out.ziel = { fa: stat(flaechenAbstand(z.N, z)), deck: stat(deckung(z.N, z)), paarung: z.paarung, weg: stat(eckenFehler(z.N, W0N, z.b.H)) };
    const Jl = normJ(W0.b),
        Je = normJ(z.b);
    out.ziel.gelenkWeg = stat(gelenkFehler(Jl, Je, z.b.H));
    out.ziel.gw = stat(gewichtsAbstand(G0, gewichte(z.W, z.pr, z.b)));
    return out;
}
for (const nach of ["fox", "bear"]) {
    const r = artPfad(nach);
    ERG[nach] = r;
    log(`### Fall ${nach === "fox" ? 2 : 3} — Wolf → ${nach === "fox" ? "Fuchs" : "Bär"} (Art-Achse t, Dials linear in t)`);
    log(`  am Ziel (t = 1): Paarung ${r.ziel.paarung}`);
    log(`        Weg der Ecken ${fmt(r.ziel.weg)} · Refit → wahre Fläche ${fmt(r.ziel.fa)}`);
    log(`        Deckung der wahren Fläche durch die getragenen Ecken ${fmt(r.ziel.deck)}   (Boden der Vorlage p95 ${f1(ERG.bodenDeckung.p95)})`);
    log(`        Gelenk-Weg ${fmt(r.ziel.gelenkWeg)} · Haut-Gewichte TV p95 ${r.ziel.gw.p95.toFixed(3)} max ${r.ziel.gw.max.toFixed(3)}`);
    for (const [t, x] of Object.entries(r.t))
        log(`  t = ${t}: Art-Gewichte ${x.w} · zwei Knoten: Ecke ${fmt(x.e2)} | Fläche ${fmt(x.fa2)}${x.fa3 ? ` · drei Knoten: Fläche ${fmt(x.fa3)}` : ""}`);
}

// DER TÄTER eines Refits: die Ecken, die nach dem Newton NICHT auf der Fläche liegen (> 10 mm), nach dem Gelenk, das sie in der
// Vorlage trägt — und wie weit ihre tragenden Primitive gepaart waren
function taeter(Tv, r, X) {
    const fa = flaechenAbstand(X || r.N, r);
    const G = gewichte(Tv.V, Tv.pr, Tv.b);
    const zahl = {};
    let n = 0;
    for (let i = 0; i < fa.length; i++) {
        if (!(fa[i] > 10)) continue;
        n++;
        const top = Object.entries(G[i]).sort((a, b) => b[1] - a[1])[0];
        const j = top ? gj(top[0]) : "?";
        zahl[j] = (zahl[j] || 0) + 1;
    }
    const liste = Object.entries(zahl).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([j, c]) => `${j} ${c}`).join(", ");
    return `${n} von ${fa.length} Ecken (${((100 * n) / fa.length).toFixed(1)} %) > 10 mm neben der Fläche — Gelenke: ${liste || "keine"}`;
}
log(`  Täter Wolf → Fuchs (t = 1): ${taeter(W0, refit(W0, "wolf", TC.GATTUNGEN.fox))}`);
log(`  Täter Wolf → Bär  (t = 1): ${taeter(W0, refit(W0, "wolf", TC.GATTUNGEN.bear))}`);

// ── FALL 4: Hirsch-Kalb (großer Kopf über die Schädel-Allometrie size^0,25, lange Beine) — EINE Alters-Achse ──
// Kalb: size 2,8 · q^⅓ (q = 0,06, Entscheid §1.1 → bs 0,39), Bein relativ × 1,4 (gewählt: das Kitz steht auf langen Läufen)
const D0 = vorlage("deer");
kennungen(D0.b, D0.pr);
const D0N = refit(D0, "deer", null).N; // N0 des Hirschs
const kalbOv = (t) => ({ size: 2.8 * (0.391 + 0.609 * t), leg: 0.28 * (1.4 - 0.4 * t) }); // t = 0 Kalb … 1 erwachsen
{
    const R = {};
    for (const t of [0, 0.25, 0.5, 0.75]) R[t] = refit(D0, "deer", kalbOv(t));
    // die Achsen getrennt (Größe allein, Bein allein) am Kalb: Wechselwirkung der beiden
    const nurS = refit(D0, "deer", { size: kalbOv(0).size }),
        nurL = refit(D0, "deer", { leg: kalbOv(0).leg });
    const Zk = R[0].N.map((x, i) => x - D0N[i]),
        Zm = R[0.5].N.map((x, i) => x - D0N[i]);
    const H = R[0].b.H;
    const sum = D0N.map((x, i) => x + (nurS.N[i] - D0N[i]) + (nurL.N[i] - D0N[i]));
    const out = {
        kopf: (() => {
            const p = TC.deriveTierParams(Object.assign({}, TC.GATTUNGEN.deer, kalbOv(0)));
            const a = TC.deriveTierParams(TC.GATTUNGEN.deer);
            return { skullRelKalb: p.skullR / p.size, skullRelAdult: a.skullR / a.size };
        })(),
        paarung: R[0].paarung,
        weg: stat(eckenFehler(R[0].N, D0N, H)),
        faZiel: stat(flaechenAbstand(R[0].N, R[0])),
        deck: stat(deckung(R[0].N, R[0])),
        wechsel: stat(flaechenAbstand(sum, R[0])),
        wechselE: stat(eckenFehler(sum, R[0].N, H)),
        t: {},
        gw: stat(gewichtsAbstand(gewichte(D0.V, D0.pr, D0.b), gewichte(R[0].W, R[0].pr, R[0].b))),
        gelenkWeg: stat(gelenkFehler(normJ(D0.b), normJ(R[0].b), H)),
        dp: drehpunkt(normJ(D0.b), normJ(R[0].b), H),
    };
    for (const t of [0.25, 0.5, 0.75]) {
        const e = R[t];
        const lin2 = D0N.map((x, i) => x + (1 - t) * Zk[i]);
        const lin3 = D0N.map((x, i) => (t >= 0.5 ? x + ((1 - t) / 0.5) * Zm[i] : x + Zm[i] + ((0.5 - t) / 0.5) * (Zk[i] - Zm[i])));
        out.t[t] = { fa2: stat(flaechenAbstand(lin2, e)), e2: stat(eckenFehler(lin2, e.N, e.b.H)), fa3: t === 0.5 ? null : stat(flaechenAbstand(lin3, e)) };
    }
    ERG.kalb = out;
    log("### Fall 4 — Hirsch erwachsen → Kalb (Alters-Achse; Größe 2,8 → 1,09 allometrisch, Bein × 1,4 relativ)");
    log(`  Schädel-Radius / H: erwachsen ${out.kopf.skullRelAdult.toFixed(4)} → Kalb ${out.kopf.skullRelKalb.toFixed(4)} (× ${(out.kopf.skullRelKalb / out.kopf.skullRelAdult).toFixed(2)})`);
    log(`  am Kalb: Paarung ${out.paarung} · Weg der Ecken ${fmt(out.weg)} (beim Maßstab des Kalbs) · Refit → Fläche ${fmt(out.faZiel)}`);
    log(`        Deckung ${fmt(out.deck)} · Gelenk-Weg ${fmt(out.gelenkWeg)} · Drehpunkt-Fehler mit Vorlage-Knochen bis ${f1(out.dp.fehler)} mm · Haut-Gewichte TV p95 ${out.gw.p95.toFixed(3)} max ${out.gw.max.toFixed(3)}`);
    log(`  Täter am Kalb: ${taeter(D0, R[0])}`);
    {
        // GEGENPROBE: derselbe Refit mit dem Rahmen ohne Radius (wie __leibRaumRefit ihn heute für den Menschen liest)
        RAHMEN_ROH = true;
        const Dr = vorlage("deer");
        kennungen(Dr.b, Dr.pr);
        log(`  GEGENPROBE Rahmen ohne Radius (heutiger Refit) am Kalb: ${taeter(Dr, refit(Dr, "deer", kalbOv(0)))}`);
        log(`  GEGENPROBE Rahmen ohne Radius, Wolf → Fuchs: ${(() => { const Wr = vorlage("wolf"); kennungen(Wr.b, Wr.pr); return taeter(Wr, refit(Wr, "wolf", TC.GATTUNGEN.fox)); })()}`);
        RAHMEN_ROH = false;
    }
    log(`  Täter Größe allein: ${taeter(D0, nurS)} · Bein allein: ${taeter(D0, nurL)}`);
    log(`  Wechselwirkung Größe × Bein am Kalb (Summe der Einzel-Formziele − Refit): Ecke ${fmt(out.wechselE)} | Fläche ${fmt(out.wechsel)}`);
    for (const [t, x] of Object.entries(out.t))
        log(`  Alter t = ${t}: zwei Knoten (Kalb, erwachsen): Ecke ${fmt(x.e2)} | Fläche ${fmt(x.fa2)}${x.fa3 ? ` · drei Knoten: Fläche ${fmt(x.fa3)}` : ""}`);
}
log(`  (Refit-Zeit: Selbst-Refit ${tRefit - tA} ms; Teil 2 gesamt ${Date.now() - tA} ms)`);

// ════════════════════════ (2b) DER BAUPLAN MIT FESTER ZAHL ════════════════════════
// Was trägt, wenn die Topologie zwischen den Gattungen bricht? Probe an einer KOPIE des Gattungs-Kerns im Scratch-vm (das Repo
// bleibt unberührt): (a) Hals 12 Glieder und Rute 10 Glieder fest je Bauplan (die Länge eines Glieds trägt die Art: segL·segs/10),
// (b) die Art-Gewichte als EIGENE Achse (`__wFest` statt des Gauß-Wurfs aus den Dials, artGewichte :4062). Dann ist der Baum von
// Wolf und Fuchs derselbe (gleiche Wörter: Pfote zehe, Ohr spitz, Fang) — gemessen wird, ob die Achsen w und die fünf Dials sich
// ADDITIV mischen.
log(`  [Zeit bis 2b: ${Date.now() - t0} ms]`);
log("\n## (2b) BAUPLAN MIT FESTER GLIEDER-ZAHL (Kopie des Gattungs-Kerns im Scratch, Hals 12 · Rute 10) und Art-Gewicht als Achse");
{
    const fs = require("fs"),
        vm = require("vm");
    let src = fs.readFileSync(path.join(REPO, "tetrapoda-core.js"), "utf8");
    const ersetze = (a, b) => {
        if (src.split(a).length !== 2) throw new Error("Anker nicht eindeutig: " + a);
        src = src.replace(a, b);
    };
    ersetze("var nN = Math.max(4, Math.ceil(nLen / (0.75 * nR[0])));", "var nN = 12;");
    ersetze("var nSeg = Math.max(1, Math.round(A.schwanz.segs));", "var nSeg = 10, __gl = A.schwanz.segs / 10;");
    ersetze("seg.position.z = -A.schwanz.segL * 1.15 * H;", "seg.position.z = -A.schwanz.segL * __gl * 1.15 * H;");
    ersetze("segG.position.z = i === 0 ? 0 : -A.schwanz.segL * H;", "segG.position.z = i === 0 ? 0 : -A.schwanz.segL * __gl * H;");
    ersetze(
        "function artGewichte(P) {",
        "function artGewichte(P) { var __w = globalThis.__wFest; if (__w) { var __b = null; for (var __k in __w) if (!__b || __w[__k] > __w[__b]) __b = __k; return { w: Object.assign({}, __w), art: __b }; }"
    );
    const alt = { sb, TC, T, surfaceNets };
    const sbP = fadenScope(["phyto-core.js", "koerper-core.js"]);
    vm.runInContext(src, sbP, { filename: "tetrapoda-core.fest.js" });
    vm.runInContext(fs.readFileSync(path.join(REPO, "foundry-core.js"), "utf8"), sbP, { filename: "foundry-core.js" });
    sb = sbP;
    TC = sbP.__tetrapodaCore;
    T = sbP.THREE;
    surfaceNets = sbP.__koerperCore.surfaceNets;
    const setW = (w) => (sbP.__wFest = w);
    setW(null);
    for (const art of ["wolf", "fox", "bear", "deer"]) {
        const b = baum(dialsVon(art));
        log(`  ${art.padEnd(5)} Meshes ${b.meshes} · Hals ${b.B.neckSegs.length} · Rute ${b.B.tailSegs.length}`);
    }
    const WF = vorlage("wolf");
    kennungen(WF.b, WF.pr);
    const N0 = refit(WF, "wolf", null).N;
    const ovT = (t) => Object.fromEntries(DIALS.map((k) => [k, TC.GATTUNGEN.wolf[k] + t * (TC.GATTUNGEN.fox[k] - TC.GATTUNGEN.wolf[k])]));
    // (a) derselbe Pfad wie Fall 2, jetzt mit Baum-Paarung
    const R = {};
    for (const t of [0.25, 0.5, 0.75, 1]) R[t] = refit(WF, "wolf", ovT(t));
    const Z1 = R[1].N.map((x, i) => x - N0[i]);
    log(`  Wolf → Fuchs am Ziel: Paarung ${R[1].paarung} · Refit → Fläche ${fmt(stat(flaechenAbstand(R[1].N, R[1])))} · Deckung ${fmt(stat(deckung(R[1].N, R[1])))}`);
    log(`        ${taeter(WF, R[1])}`);
    const erg2b = { t: {} };
    for (const t of [0.25, 0.5, 0.75]) {
        const lin = N0.map((x, i) => x + t * Z1[i]);
        erg2b.t[t] = stat(flaechenAbstand(lin, R[t]));
        log(`  Dial-Pfad t = ${t} (w aus dem Gauß der Dials): zwei Knoten → Fläche ${fmt(erg2b.t[t])}`);
    }
    // (b) Achsen w (Wolf ↔ Fuchs) und die fünf Dials getrennt, additiv gemischt
    setW({ wolf: 0, fox: 1, bear: 0, deer: 0 });
    const Zw = refit(WF, "wolf", null).N.map((x, i) => x - N0[i]);
    const Zk = {};
    setW({ wolf: 1, fox: 0, bear: 0, deer: 0 });
    for (const k of DIALS) Zk[k] = refit(WF, "wolf", { [k]: TC.GATTUNGEN.fox[k] }).N.map((x, i) => x - N0[i]);
    for (const t of [0.25, 0.5, 1]) {
        setW({ wolf: 1 - t, fox: t, bear: 0, deer: 0 });
        const echt = refit(WF, "wolf", ovT(t));
        const lin = N0.map((x, i) => {
            let v = x + t * Zw[i];
            for (const k of DIALS) v += t * Zk[k][i];
            return v;
        });
        const fa = stat(flaechenAbstand(lin, echt)),
            ee = stat(eckenFehler(lin, echt.N, echt.b.H));
        erg2b["add" + t] = fa;
        log(`  Achsen w + 5 Dials additiv (je Achse EIN Formziel am Fuchs-Wert), t = ${t}: Ecke ${fmt(ee)} | Fläche ${fmt(fa)}`);
        log(`        ${taeter(WF, echt, lin)}`);
    }
    // (c) die Gegenprobe: dieselbe additive Mischung im Kern von main (Gauß-w, Glieder nach Dial) ist nicht definierbar — die
    // Achse w existiert dort nicht; gemessen ist Fall 2 oben.
    setW(null);
    ERG.fest = erg2b;
    ({ sb, TC, T, surfaceNets } = alt);
}

// ════════════════════════ (4) PREIS ════════════════════════
log("\n## (4) PREIS je Bauplan (Vierbeiner) und je Individuum");
{
    const w0 = hull["wolf L0"] || { haut: 8936, schale: 13174, ecken: 29616 },
        w1 = hull["wolf L1"];
    // Achsen einer Tier-Tafel: 4 Art-Wurzeln als 3 Achsen (baryzentrisch) + Hals, Bein, Statur, Größe-Allometrie, Alter = 8
    // Achsen; Knoten: Art-Achsen 3 (0, ½, 1), Individuen-Achsen 3 (−2σ, 0, +2σ), Alter 3 → 24 Knoten
    const ACH = 8,
        KN = 24;
    const halb = 2; // Bytes je Halb-Float
    const ecken0 = w0.ecken,
        ecken1 = w1.ecken;
    const mb = (n) => (n * KN * 4 * halb) / 1e6; // RGBA-Texel je Knoten (wie _gangZielTafel), xyz genutzt
    log(`  Ecken der Vorlage: L0 ${ecken0} (Haut ${w0.haut}, Schalen ${w0.schale}) · L1 ${ecken1}`);
    log(`  Tafel (Halb-Float RGBA je Knoten, ${KN} Knoten über ${ACH} Achsen): L0 ${mb(ecken0).toFixed(2)} MB · L1 ${mb(ecken1).toFixed(2)} MB · zusammen ${(mb(ecken0) + mb(ecken1)).toFixed(2)} MB je Bauplan`);
    log(`  nur Haut + L1 (die Schalen tragen ihr Formziel über ihre Wurzel-Ecke): ${(mb(w0.haut) + mb(ecken1)).toFixed(2)} MB`);
    log(`  je Individuum: ${ACH} Floats (Punkt im Raum) = ${Math.ceil(ACH / 4)} RGBA-Texel = ${Math.ceil(ACH / 4) * 16} B (Float32) auf der Ton-Tafel-Zeile; 10⁴ Individuen ${((Math.ceil(ACH / 4) * 16 * 1e4) / 1e6).toFixed(2)} MB`);
    const rate = ERG.refitMsJe1000;
    log(`  Bau der Tafel (Knoten × Ecken × Rate): L1 ${((KN * ecken1 * rate) / 1e6).toFixed(1)} s · L0-Haut ${((KN * w0.haut * rate) / 1e6).toFixed(1)} s · L0 alle ${((KN * ecken0 * rate) / 1e6).toFixed(1)} s je Bauplan (einmal, Faden/Platte)`);
    log(`  heute je ART: 2 Güsse (~0,9 s Faden je Guss, koerper-leib.js:2152) und ~9,6 MB JS je zwei Vorlagen (koerper-leib.js:1326) → 10² Arten ≈ 180 s Faden, ≈ 960 MB`);
    log(`  GPU je Ecke und Bild: ${ACH} Achsen × 2 textureLoad + mix = ${2 * ACH} Lesungen (der Mensch: ${sb.__koerperCore.LEIB_RAUM.achsen.length} Achsen, ${2 * sb.__koerperCore.LEIB_RAUM.achsen.length})`);
    log(`  der Mensch heute: ${sb.__koerperCore.LEIB_RAUM.achsen.length} Achsen, ${sb.__koerperCore.LEIB_RAUM.achsen.reduce((s, a) => s + a.knoten.length, 0)} Knoten`);
}
log(`\n# Laufzeit ${Date.now() - t0} ms`);
