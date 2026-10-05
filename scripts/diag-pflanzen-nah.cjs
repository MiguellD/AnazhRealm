// diag-pflanzen-nah.cjs — DIE LINSE DES PFLANZEN-NAHBILDS (05.10., Gebot 10: die Linse nennt den Täter beim NAMEN).
// Befund der Blick-Tour V18.530 (Bilder 01/02/04/05/06): die Birken-Rinde gipsweiß, der Hasel-Busch ein Haufen breiter
// Papier-Streifen, das Laub auf Armlänge meterlange flache Blätter mit harter dunkler Rippe, die Blume nah eine flache
// Scheibe. Jede Probe liest die GELIEFERTEN Puffer über die echte Foundry-Naht (asset-worker-harness: dieselben Kerne
// wie Labor und Welt; die Welt liest nur Vertex-Farben — Lehre 19), je Art der Klasse, nicht das bequeme Beispiel:
//
//  (R) RINDE je Baum-Art (Welt-Gestalt 1, Nah-Stufe L0): die flächen-gewichtete lineare Albedo (Y) des Stamms im Band
//      y ∈ [0,12 H, 0,35 H] liegt im Band ihres Rinden-Typs (RINDEN_BAND). Die Birke (papery) dazu: Lentizellen
//      (Flächen-Anteil Y < 0,12 im Stamm-Band), die schwarze Fuß-Borke (y ∈ [0,005 H, 0,05 H]) und die dunklen Zweige
//      (Rinde über 0,7 H). Vorher: Birke 0,83, kein Strich, weißer Fuß, weiße Zweige.
//  (G) GITTER — das Ringel-Maß des Stamm-Strangs: je Spalte die zweite Differenz der Ring-Luminanz über das Stamm-Band,
//      relativ zur Luminanz. Ein Muster über dem Nyquist des Ring-Gitters (die Plattenrisse der Fichte: 1,95 Ringe je
//      Periode, Mikro-Rauschen je Ring zufällig) faltet in Ringel-Bänder: vorher Fichte/Tanne 0,44/0,42, Eiche 0,32,
//      Karst 0,37. Die lebenden Laub- und Nadel-Rinden halten ≤ RINGEL_MAX; die Birke trägt ihre Zeilen absichtlich,
//      das Totholz seine Zerfalls-Flecken (3D-Rauschen, kein periodischer Term) — beide stehen benannt außerhalb.
//  (S) STRAUCH (Nah-Stufe L1, Gestalt 1): die Krone sind Karten aus dem EINEN Atlas (foliageTex, keine Klinge) und das
//      Reisig trägt ≥ REISIG_MIN der Dreiecke. Vorher: 8 820 Klingen-Dreiecke, Rinde 24 %.
//  (B) BLUME (L0, Gestalten 1/2): die Blütenblätter tragen den Saftmal-Verlauf — je Blatt Luminanz Spitze : Grund im
//      Mittel ≥ SAFTMAL_MIN. Vorher: eine Farbe je Blatt (1,0).
//  (M) BLATT-MASS (Laub-Bäume L0 und der Strauch L1, Gestalt 1): die Länge eines Atlas-Blatts in der Welt =
//      mittlere Karten-Kante (aus den gelieferten Quads, ÷ kern) × ZWEIG_BLATT.laenge/256 × Welt-Skala im Band
//      BLATT_BAND. Vorher 1,4–1,7 m (Rosetten), dann 0,37–0,49 m (Zweig mit 27-px-Blättern).
//  (N) NADEL-MASS (Koniferen L0, Gestalt 1): die Länge einer Atlas-Nadel in der Welt = mittlere Kante der
//      Nadel-Karte × NADEL_ZWEIG.nadel/256 × Welt-Skala ≤ NADEL_MAX_M. Vorher (Striche von 40–94 px) 0,17–0,44 m.
//  (K) KEINE KLINGEN-KRONE in einer Baum-L1 (Gestalt 1): die Trauer-Klinge las auf 12–26 m als Papier-Streifen
//      (Blick-Tour Bild 01, Raycast f:weide|1|1:2) — jede L1-Krone ist Karte oder Strähne. Vorher Weide 3 344 Dreiecke.
//  (U) UNTERSEITE — die Blatt-Unterseite (phyto-core BLATT_UNTERSEITE) hat ihre zwei Leser: den Laub-Shader des Labors
//      (foundry-core) und den Laub-Stoff der Welt (anazhRealm).
// SELBSTTEST: jede Probe MUSS an einer kranken Kopie der gemessenen Puffer feuern (gipsweiße Birke, Ringel-Stamm,
// Klingen-Strauch, einfarbige Blüte, Blatt ×3, Strauch-Blatt ×½, Nadel ×3, Klingen-L1, Leser entfernt) — die Linse
// ist nie vakuös.
//
//   npm run gate:pflanzen-nah            (PFLANZEN_PORT, Vorgabe 4548)
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");
require("../phyto-core.js");
const PC = globalThis.__phytoCore;
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PFLANZEN_PORT || 4548);

// Die Soll-Bänder (lineare Luminanz Y, Tageslicht-Albedo): Betulin-Weiß der Birke 0,40–0,55 (mit Strichen im Mittel
// darunter), jede andere Rinde 0,06–0,25 (diag-albedo-zensus) — mit Rand.
const RINDEN_BAND = { birch: [0.3, 0.55], andere: [0.05, 0.3] };
const BIRKE = { strichMin: 0.04, strichMax: 0.45, fussMax: 0.16, zweigMax: 0.25 };
const RINGEL_MAX = 0.25;
const REISIG_MIN = 0.5;
const SAFTMAL_MIN = 1.4;
const BLATT_BAND = [0.04, 0.3]; // m in der Welt (Natur: Hasel 0,06–0,12, Eiche 0,10–0,15, Birke 0,04–0,07)
const NADEL_MAX_M = 0.05; // m in der Welt (Natur: Fichte 0,015–0,025, Tanne 0,02–0,03)

const f32 = (b64) => {
    const b = Buffer.from(b64, "base64");
    return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
};
const u32 = (b64) => {
    const b = Buffer.from(b64, "base64");
    return new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4);
};
function teile(meshes) {
    return (meshes || [])
        .filter((m) => m.attrs && m.attrs.position)
        .map((m) => ({
            kind: m.kind,
            pos: f32(m.attrs.position.b64),
            col: m.attrs.color ? f32(m.attrs.color.b64) : null,
            uv: m.attrs.uv ? f32(m.attrs.uv.b64) : null,
            idx: m.index ? u32(m.index) : null,
        }));
}
const Y = (c, i) => 0.2126 * c[i * 3] + 0.7152 * c[i * 3 + 1] + 0.0722 * c[i * 3 + 2];
function hoehe(T) {
    let hi = 0;
    for (const t of T) for (let i = 1; i < t.pos.length; i += 3) hi = Math.max(hi, t.pos[i]);
    return hi;
}
// Flächen-gewichtete Albedo der Rinden-Dreiecke, deren Schwerpunkt in [y0, y1] liegt; dazu der Flächen-Anteil Y < dunkel.
function rindenBand(T, y0, y1, dunkel) {
    let A = 0,
        s = 0,
        d = 0;
    for (const t of T) {
        if (t.kind !== "bark" || !t.col || !t.idx) continue;
        const p = t.pos,
            c = t.col,
            I = t.idx;
        for (let k = 0; k < I.length; k += 3) {
            const a = I[k],
                b = I[k + 1],
                e = I[k + 2];
            const cy = (p[a * 3 + 1] + p[b * 3 + 1] + p[e * 3 + 1]) / 3;
            if (cy < y0 || cy > y1) continue;
            const ux = p[b * 3] - p[a * 3],
                uy = p[b * 3 + 1] - p[a * 3 + 1],
                uz = p[b * 3 + 2] - p[a * 3 + 2];
            const vx = p[e * 3] - p[a * 3],
                vy = p[e * 3 + 1] - p[a * 3 + 1],
                vz = p[e * 3 + 2] - p[a * 3 + 2];
            const fl = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
            if (!(fl > 0)) continue;
            const y = (Y(c, a) + Y(c, b) + Y(c, e)) / 3;
            A += fl;
            s += y * fl;
            if (y < dunkel) d += fl;
        }
    }
    return A > 0 ? { Y: s / A, dunkel: d / A } : null;
}
// Der Stamm-Strang: das erste Rinden-Teil beginnt mit ihm (Ring für Ring, R+1 Vertices — die Saumspalte trifft Spalte 0).
function stammRinge(T) {
    const t = T.find((x) => x.kind === "bark");
    if (!t || !t.col) return null;
    const p = t.pos;
    let R1 = 0;
    for (let i = 1; i < 400 && i * 3 < p.length; i++)
        if (Math.hypot(p[i * 3] - p[0], p[i * 3 + 1] - p[1], p[i * 3 + 2] - p[2]) < 1e-3) {
            R1 = i + 1;
            break;
        }
    if (!R1) return null;
    const ringe = [];
    for (let r = 0; (r + 1) * R1 <= p.length / 3; r++) {
        let y = 0;
        for (let j = 0; j < R1 - 1; j++) y += p[(r * R1 + j) * 3 + 1];
        y /= R1 - 1;
        if (ringe.length && y < ringe[ringe.length - 1].y - 1e-4) break;
        ringe.push({ r, y });
    }
    return { t, R1, ringe };
}
function ringel(S, H) {
    if (!S) return null;
    const band = S.ringe.filter((x) => x.y > 0.1 * H && x.y < 0.4 * H);
    let s2 = 0,
        sL = 0;
    for (let k = 1; k < band.length - 1; k++)
        for (let j = 0; j < S.R1 - 1; j++) {
            const a = Y(S.t.col, band[k - 1].r * S.R1 + j),
                b = Y(S.t.col, band[k].r * S.R1 + j),
                c = Y(S.t.col, band[k + 1].r * S.R1 + j);
            s2 += Math.abs(c - 2 * b + a);
            sL += b;
        }
    return sL > 0 ? s2 / sL : null;
}

// Die Urteile — reine Funktionen über gemessene Puffer (der Selbsttest füttert sie mit kranken Kopien).
function rindeUrteil(fall, T, typ, lebend) {
    const v = [];
    const H = hoehe(T);
    const st = rindenBand(T, 0.12 * H, 0.35 * H, 0.12);
    const band = RINDEN_BAND[typ === "birch" ? "birch" : "andere"];
    const m = { Y: st && st.Y, dunkel: st && st.dunkel };
    if (!st || st.Y < band[0] || st.Y > band[1])
        v.push(`${fall} (${typ}): Stamm-Albedo ${st ? st.Y.toFixed(3) : "—"} außerhalb [${band.join(", ")}]`);
    if (typ === "birch") {
        const fuss = rindenBand(T, 0.005 * H, 0.05 * H, 0.12),
            zweig = rindenBand(T, 0.7 * H, H, 0.12);
        m.fuss = fuss && fuss.Y;
        m.zweig = zweig && zweig.Y;
        if (!st || st.dunkel < BIRKE.strichMin || st.dunkel > BIRKE.strichMax)
            v.push(
                `${fall}: Lentizellen ${st ? (st.dunkel * 100).toFixed(1) : "—"} % der Stamm-Fläche, Soll ${BIRKE.strichMin * 100}–${BIRKE.strichMax * 100} %`
            );
        if (!fuss || fuss.Y > BIRKE.fussMax)
            v.push(`${fall}: Fuß-Borke ${fuss ? fuss.Y.toFixed(3) : "—"} > ${BIRKE.fussMax}`);
        if (!zweig || zweig.Y > BIRKE.zweigMax)
            v.push(`${fall}: Zweig-Rinde ${zweig ? zweig.Y.toFixed(3) : "—"} > ${BIRKE.zweigMax}`);
    } else if (lebend) {
        const g = ringel(stammRinge(T), H);
        m.ringel = g;
        if (g == null || g > RINGEL_MAX)
            v.push(
                `${fall} (${typ}): Ringel ${g == null ? "—" : g.toFixed(3)} > ${RINGEL_MAX} (Muster über dem Ring-Gitter)`
            );
    }
    return { v, m };
}
function strauchUrteil(fall, T) {
    const v = [];
    const tris = (k) => T.filter((t) => t.kind === k).reduce((s, t) => s + (t.idx ? t.idx.length / 3 : 0), 0);
    const alle = T.reduce((s, t) => s + (t.idx ? t.idx.length / 3 : 0), 0);
    const reisig = tris("bark") / Math.max(1, alle);
    if (tris("foliage") > 0 || tris("foliageTex") === 0)
        v.push(
            `${fall}: Krone aus ${tris("foliage")} Klingen-Dreiecken, ${tris("foliageTex")} Karten-Dreiecken (Soll: nur Karten)`
        );
    if (reisig < REISIG_MIN)
        v.push(`${fall}: Reisig ${(reisig * 100).toFixed(0)} % der Dreiecke < ${REISIG_MIN * 100} %`);
    return { v, m: { reisig, karten: tris("foliageTex"), klingen: tris("foliage") } };
}
// Die Blütenblätter im Laub-Teil der Blume: jede Klinge (buildLeafBlades) ist eine Folge von 2·15 Vertices mit
// uv = (0|1, i/14) — die Linse findet sie an diesem Muster (Scheibenblüten und Kopf tragen es nicht) und misst je Blatt
// die Luminanz Spitze : Grund.
const KLINGE = 15;
function bluetenUrteil(fall, T) {
    const t = T.find((x) => x.kind === "foliage");
    const r = [];
    if (t && t.col && t.uv) {
        const uv = t.uv,
            n = uv.length / 2;
        for (let k = 0; k + 2 * KLINGE <= n; k++) {
            let ok = true;
            for (let i = 0; i < KLINGE && ok; i++)
                ok =
                    uv[(k + 2 * i) * 2] === 0 &&
                    uv[(k + 2 * i + 1) * 2] === 1 &&
                    Math.abs(uv[(k + 2 * i) * 2 + 1] - i / (KLINGE - 1)) < 1e-6;
            if (!ok) continue;
            const g = (Y(t.col, k) + Y(t.col, k + 1)) / 2,
                s = (Y(t.col, k + 2 * KLINGE - 2) + Y(t.col, k + 2 * KLINGE - 1)) / 2;
            r.push(s / Math.max(1e-6, g));
            k += 2 * KLINGE - 1;
        }
    }
    const m = r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0;
    return {
        v:
            m >= SAFTMAL_MIN
                ? []
                : [`${fall}: Blütenblatt Spitze/Grund ${m.toFixed(2)} < ${SAFTMAL_MIN} (${r.length} Blätter)`],
        m: { saftmal: m, blaetter: r.length },
    };
}
// Die mittlere Kante der Karten-Quads (je 4 Vertices, Ecke 0 → 1) eines Laub-Teils.
function kartenKante(T) {
    let s = 0,
        n = 0;
    for (const t of T) {
        if (t.kind !== "foliageTex") continue;
        const p = t.pos;
        for (let i = 0; i + 11 < p.length; i += 12) {
            s += Math.hypot(p[i + 3] - p[i], p[i + 4] - p[i + 1], p[i + 5] - p[i + 2]);
            n++;
        }
    }
    return n ? s / n : 0;
}
function blattMass(fall, T, skala) {
    const kante = kartenKante(T);
    if (!kante) return { v: [`${fall}: keine Laub-Karte`], m: {} };
    const blatt = (kante / PC.BLATT_ATLAS_BREIT.kern) * (PC.ZWEIG_BLATT.laenge / 256) * skala;
    return {
        v:
            blatt >= BLATT_BAND[0] && blatt <= BLATT_BAND[1]
                ? []
                : [`${fall}: Blatt ${blatt.toFixed(3)} m außerhalb [${BLATT_BAND.join(", ")}] m`],
        m: { blatt },
    };
}
function nadelMass(fall, T, skala) {
    const kante = kartenKante(T);
    if (!kante) return { v: [`${fall}: keine Nadel-Karte`], m: {} };
    const nadel = (kante / PC.BLATT_ATLAS_NADEL.kern) * (PC.NADEL_ZWEIG.nadel / 256) * skala;
    return { v: nadel <= NADEL_MAX_M ? [] : [`${fall}: Nadel ${nadel.toFixed(3)} m > ${NADEL_MAX_M} m`], m: { nadel } };
}
// (K) die L1-Krone eines Baums trägt keine Klinge (kind "foliage").
function klingenL1(fall, T) {
    const n = T.filter((t) => t.kind === "foliage").reduce((s, t) => s + (t.idx ? t.idx.length / 3 : 0), 0);
    return { v: n ? [`${fall}: L1-Krone aus ${n} Klingen-Dreiecken (Papier-Streifen)`] : [], m: { klingen: n } };
}
function unterseiteUrteil(quellen) {
    const v = [];
    for (const [datei, text] of Object.entries(quellen))
        if (!/__phytoCore\.BLATT_UNTERSEITE/.test(text)) v.push(`${datei} liest BLATT_UNTERSEITE nicht`);
    return v;
}

(async () => {
    const fails = [];
    const roh = {};
    let buch = null,
        rc = null;
    await runWithWorker(PORT, async ({ build, getData }) => {
        const b = await getData("get-book");
        buch = b.book || {};
        rc = b.renderConfig || {};
        const art = (p) => buch[p] && buch[p].kind;
        const baeume = Object.keys(buch).filter((p) => art(p) === "tree");
        const fall = async (presetId, lod, seed) => {
            const k = `${presetId}-s${seed}-L${lod}`;
            roh[k] = { presetId, lod, seed, T: teile((await build({ presetId, lod, seed, season: "summer" })).meshes) };
        };
        for (const p of baeume) await fall(p, 0, 1);
        for (const p of baeume) await fall(p, 1, 1);
        await fall("birke", 0, 2);
        for (const p of Object.keys(buch).filter((x) => art(x) === "shrub")) await fall(p, 1, 1);
        for (const p of Object.keys(buch).filter((x) => art(x) === "flower"))
            for (const s of [1, 2]) await fall(p, 0, s);
    });
    const pl = rc.placement || {};
    // Die Welt-Skala der Art: placement.scale, der Wald-Zusatzfaktor treeScaleMul NUR für Bäume (foundry-core).
    const skala = (p) => (pl.scale && pl.scale[p]) * (buch[p] && buch[p].kind === "tree" ? pl.treeScaleMul || 1 : 1);
    const zeilen = [];
    const ergebnis = {};
    for (const [k, f] of Object.entries(roh)) {
        const fx = (buch[f.presetId] && buch[f.presetId].fx) || {};
        const kind = buch[f.presetId].kind;
        let u = { v: [], m: {} };
        if (kind === "tree" && f.lod === 1) u = klingenL1(k, f.T);
        else if (kind === "tree") {
            u = rindeUrteil(k, f.T, fx.barkType || (fx.conifer ? "conifer" : "oak"), f.presetId !== "totholz");
            // Die Trauer-L0 trägt Strähnen (gestreckte Zellen) — ihr Blatt-Maß ist kein Karten-Maß.
            const trauer = buch[f.presetId].s && buch[f.presetId].s.trop >= 0.55;
            if (!trauer && f.T.some((t) => t.kind === "foliageTex")) {
                const b = fx.conifer ? nadelMass(k, f.T, skala(f.presetId)) : blattMass(k, f.T, skala(f.presetId));
                u.v.push(...b.v);
                Object.assign(u.m, b.m);
            }
        } else if (kind === "shrub") {
            u = strauchUrteil(k, f.T);
            const b = blattMass(k, f.T, skala(f.presetId));
            u.v.push(...b.v);
            Object.assign(u.m, b.m);
        } else if (kind === "flower") u = bluetenUrteil(k, f.T);
        ergebnis[k] = u;
        fails.push(...u.v);
        zeilen.push(
            `  ${k}: ` +
                Object.entries(u.m)
                    .filter(([, x]) => x != null)
                    .map(
                        ([n, x]) =>
                            `${n} ${typeof x === "number" ? (n === "dunkel" || n === "reisig" ? (x * 100).toFixed(1) + " %" : Number.isInteger(x) ? x : x.toFixed(3)) : x}`
                    )
                    .join(" · ")
        );
    }
    const quellen = {
        "foundry-core.js": fs.readFileSync(path.join(ROOT, "foundry-core.js"), "utf8"),
        "anazhRealm.js": fs.readFileSync(path.join(ROOT, "anazhRealm.js"), "utf8"),
    };
    fails.push(...unterseiteUrteil(quellen));
    console.log("Pflanzen-Nahbild (gelieferte Puffer, Welt-Gestalt):\n" + zeilen.join("\n"));

    // SELBSTTEST — jede Probe an einer kranken Kopie.
    const kopie = (T) => T.map((t) => Object.assign({}, t, { col: t.col ? Float32Array.from(t.col) : null }));
    const birke = roh["birke-s1-L0"],
        fichte = roh["fichte-s1-L0"],
        strauch = roh["strauch-s1-L1"],
        blume = roh["blume-s1-L0"],
        eiche = roh["eiche-s1-L0"],
        tanne = roh["tanne-s1-L0"],
        weide1 = roh["weide-s1-L1"];
    const skaliert = (T, k) =>
        T.map((t) => {
            if (t.kind !== "foliageTex") return t;
            const p = Float32Array.from(t.pos);
            for (let i = 0; i < p.length; i++) p[i] *= k;
            return Object.assign({}, t, { pos: p });
        });
    const st = [];
    if (birke) {
        const gips = kopie(birke.T);
        for (const t of gips) if (t.kind === "bark" && t.col) t.col.fill(0.85);
        const u = rindeUrteil("gips", gips, "birch", true);
        st.push(["gipsweiße Birke (0,85)", u.v.length >= 3]);
    } else st.push(["Birke gebaut", false]);
    if (fichte) {
        const T = kopie(fichte.T);
        const S = stammRinge(T);
        if (S)
            for (const x of S.ringe) if (x.r % 2) for (let j = 0; j < S.R1 * 3; j++) S.t.col[x.r * S.R1 * 3 + j] *= 0.5;
        st.push([
            "Ringel-Stamm (jeder 2. Ring ×0,5)",
            rindeUrteil("ringel", T, "conifer", true).v.some((x) => x.includes("Ringel")),
        ]);
    } else st.push(["Fichte gebaut", false]);
    if (strauch) {
        const T = strauch.T.map((t) => (t.kind === "foliageTex" ? Object.assign({}, t, { kind: "foliage" }) : t));
        st.push(["Klingen-Strauch", strauchUrteil("klinge", T).v.length > 0]);
    } else st.push(["Strauch gebaut", false]);
    if (blume) {
        const T = kopie(blume.T);
        for (const t of T)
            if (t.kind === "foliage" && t.col) for (let i = 0; i < t.col.length; i += 3) t.col.set([0.6, 0.2, 0.4], i);
        st.push(["einfarbige Blüte", bluetenUrteil("scheibe", T).v.length > 0]);
    } else st.push(["Blume gebaut", false]);
    if (eiche) st.push(["Blatt ×3", blattMass("gross", skaliert(eiche.T, 3), skala("eiche")).v.length > 0]);
    else st.push(["Eiche gebaut", false]);
    if (strauch)
        st.push(["Strauch-Blatt ×½", blattMass("klein", skaliert(strauch.T, 0.5), skala("strauch")).v.length > 0]);
    if (tanne) st.push(["Nadel ×3", nadelMass("lang", skaliert(tanne.T, 3), skala("tanne")).v.length > 0]);
    else st.push(["Tanne gebaut", false]);
    if (weide1)
        st.push([
            "Klingen-L1",
            klingenL1(
                "klinge",
                weide1.T.map((t) => (t.kind === "foliageTex" ? Object.assign({}, t, { kind: "foliage" }) : t))
            ).v.length > 0,
        ]);
    else st.push(["Weide-L1 gebaut", false]);
    st.push([
        "Leser der Unterseite entfernt",
        unterseiteUrteil({ "anazhRealm.js": quellen["anazhRealm.js"].replace(/__phytoCore\.BLATT_UNTERSEITE/g, "X") })
            .length === 1,
    ]);
    console.log("Selbsttest: " + st.map(([n, ok]) => `${n} ${ok ? "✅" : "❌"}`).join(" · "));
    if (st.some(([, ok]) => !ok)) fails.push("Selbsttest der Pflanzen-Linse feuert nicht");

    console.log(
        "=== PFLANZEN-NAHBILD — Rinde · Gitter · Strauch · Blüte · Blatt- und Nadel-Maß · L1-Krone · Unterseite ==="
    );
    if (fails.length) {
        console.error("\n❌ ROT:");
        for (const x of fails.slice(0, 12)) console.error("  • " + x);
        process.exit(1);
    }
    console.log(`\n✅ GRÜN — ${Object.keys(roh).length} Fälle.`);
    process.exit(0);
})().catch((e) => {
    console.error("Gate-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
