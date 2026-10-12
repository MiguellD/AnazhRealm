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
//  (S) STRAUCH (Gestalt 1, beide Gitter-Stufen — die Nah-Stufe L0 und seit Welle 6 die Mittel-Stufe L1): die Krone sind
//      Karten aus dem EINEN Atlas (foliageTex, keine Klinge) und das Reisig trägt ≥ REISIG_MIN der Dreiecke. Vorher:
//      8 820 Klingen-Dreiecke, Rinde 24 %.
//  (B) BLUME (L0, Gestalten 1/2): die Blütenblätter tragen den Saftmal-Verlauf — je Blatt Luminanz Spitze : Grund im
//      Mittel ≥ SAFTMAL_MIN. Vorher: eine Farbe je Blatt (1,0).
//  (M) BLATT-MASS (Laub-Bäume L0 und der Strauch L0/L1, Gestalt 1): die Länge eines Atlas-Blatts in der Welt =
//      mittlere Karten-Kante (aus den gelieferten Quads, ÷ kern) × Blatt-Länge des Zweigs der Zelle (Baum ZWEIG_BLATT,
//      Strauch ZWEIG_GROSS) / BLATT_ATLAS_ZELLE × Welt-Skala im Band
//      BLATT_BAND. Vorher 1,4–1,7 m (Rosetten), dann 0,37–0,49 m (Zweig mit 27-px-Blättern).
//  (N) NADEL-MASS (Koniferen L0, Gestalt 1): die Länge einer Atlas-Nadel in der Welt. Seit S3 (09.10.) sitzt die Nadel im
//      Wedel (Zelle 3, WEDEL_ZWEIG — der Nadel-Ast als Strähne): mittlere Wedel-Länge (die Kante längs der Bahn, ÷ kern) ×
//      WEDEL_ZWEIG.nadel/BLATT_ATLAS_ZELLE × Welt-Skala ≤ NADEL_MAX_M. Vorher (Striche von 40–94 px) 0,17–0,44 m.
//  (K) KEINE KLINGEN-KRONE in einer Baum-L1 (Gestalt 1): die Trauer-Klinge las auf 12–26 m als Papier-Streifen
//      (Blick-Tour Bild 01, Raycast f:weide|1|1:2) — jede L1-Krone ist Karte oder Strähne. Vorher Weide 3 344 Dreiecke.
//  (U) UNTERSEITE — die Blatt-Unterseite (phyto-core BLATT_UNTERSEITE) hat ihre zwei Leser: den Laub-Shader des Labors
//      (foundry-core) und den Laub-Stoff der Welt (anazhRealm).
//  (W) WEIDE — jede Karte der Trauer-Krone (L0 und L1) liest die Weiden-Zelle (BLATT_ATLAS_WEIDE: lanzettliche Blätter an
//      der hängenden Rute). Vorher die Großblatt-Zelle: runde Hasel-Blätter an der Weide (Prüfer W5, Bild weide-8m).
//  (Z) KORN — das Kanten-Flimmern der Laub-Karte in der Mittelsicht (K20): die Zelle als Karte auf dem Schirm, trilinear,
//      alphaTest 0,5, das Pixel als Mittel der Halton-Unterproben der zeitlichen Auflösung; Δ-Luma (Laub gegen Himmel)
//      zwischen zwei Bildern mit ½-Pixel-Versatz an der Eichen-Krone auf 25 m ≤ KORN_MAX (50 % von vorher 0,166), die
//      Deckung je λ 1…3 = Stufe 0 ± 0,1 (nah = fern). Konsum-Leser: der Laub-Stoff (`_blattAtlasProbe`).
//  (H) HÖHEN-ZENSUS je Art (K20): der Altbestand in der Spanne der Natur, H/D in Brusthöhe im Bestands-Band.
//  (F) FRACHT — der Wirt lädt den Atlas als Fracht seines Formats (phyto-core blattAtlasFracht: BC3 ab Stufe 0, rgba ab
//      Stufe 1), das Labor das blutende Bild. Je Format, Zelle und Zell-Größe (≥ FRACHT_MIN_ZELLE px) wird die GPU
//      nachgerechnet (sRGB-Dekodierung je Texel, bilinear linear, alphaTest 0,5) und der EINE Leser der Welt angewandt
//      (gefiltertes rgb ÷ alpha ÷ wert): Luminanz und Deckung der Welt = Labor (± FRACHT_TOL). Dazu die Quelle: der Leser
//      `_blattAtlasProbe` teilt durch alpha, und `userData.wert` liest sonst niemand. Vorher (BC1 ohne Teilen): Laub
//      Y 0,96 → 0,84 je Stufe, die Nadel-Zelle 0,86 — die Welt dunkler als Labor und L2-Karte (Prüfer W5).
// SELBSTTEST: jede Probe MUSS an einer kranken Kopie der gemessenen Puffer feuern (gipsweiße Birke, Ringel-Stamm,
// Klingen-Strauch, einfarbige Blüte, Blatt ×3, Strauch-Blatt ×½, Nadel ×3, Klingen-L1, Leser entfernt, BC1 gerade gelesen,
// Atlas-Leser ohne ÷ alpha) — die Linse
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
const BLATT_BAND = [0.04, 0.16]; // m in der Welt (Natur: Hasel 0,06–0,12, Eiche 0,10–0,15, Birke 0,04–0,07)
const NADEL_MAX_M = 0.03; // m in der Welt (Natur: Fichte 0,015–0,025, Tanne 0,02–0,03)

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
                    Math.abs(uv[(k + 2 * i) * 2 + 1] - i / (KLINGE - 1)) <= 1 / 8192; // das Byte-Raster am Ausgang: 2^-12
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
// `zweig`: der Zweig der Zelle, die die Karte liest (Baum: ZWEIG_BLATT, Strauch: ZWEIG_GROSS — das Blatt-Mass der Art).
function blattMass(fall, T, skala, zweig) {
    const kante = kartenKante(T);
    if (!kante) return { v: [`${fall}: keine Laub-Karte`], m: {} };
    const blatt =
        (kante / PC.BLATT_ATLAS_BREIT.kern) * ((zweig || PC.ZWEIG_BLATT).laenge / PC.BLATT_ATLAS_ZELLE) * skala;
    return {
        v:
            blatt >= BLATT_BAND[0] && blatt <= BLATT_BAND[1]
                ? []
                : [`${fall}: Blatt ${blatt.toFixed(3)} m außerhalb [${BLATT_BAND.join(", ")}] m`],
        m: { blatt },
    };
}
function nadelMass(fall, T, skala) {
    // die Wedel-Länge: Kante 1→2 der Strähnen-Karte (längs der Bahn; Kante 0→1 ist ihre Breite)
    let sL = 0,
        nL = 0;
    for (const t of T) {
        if (t.kind !== "foliageTex") continue;
        const p = t.pos;
        for (let i = 0; i + 11 < p.length; i += 12) {
            sL += Math.hypot(p[i + 6] - p[i + 3], p[i + 7] - p[i + 4], p[i + 8] - p[i + 5]);
            nL++;
        }
    }
    const kante = nL ? sL / nL : 0;
    if (!kante) return { v: [`${fall}: kein Wedel`], m: {} };
    const nadel = (kante / PC.BLATT_ATLAS_WEDEL.kern) * (PC.WEDEL_ZWEIG.nadel / PC.BLATT_ATLAS_ZELLE) * skala;
    return { v: nadel <= NADEL_MAX_M ? [] : [`${fall}: Nadel ${nadel.toFixed(3)} m > ${NADEL_MAX_M} m`], m: { nadel } };
}
// (K) die L1-Krone eines Baums trägt keine Klinge (kind "foliage").
// (W) DIE WEIDE trägt Weiden-Blätter: jede Karte der Trauer-Krone (L0 und L1) liest die Weiden-Zelle (BLATT_ATLAS_WEIDE),
// u in [zelle/4, (zelle+1)/4]. Vorher (Prüfer W5, Bild weide-8m) las sie die Großblatt-Zelle — runde Hasel-Blätter.
function weidenZelle(fall, T) {
    const z = PC.BLATT_ATLAS_WEIDE.zelle;
    let n = 0,
        aus = 0;
    for (const t of T) {
        if (t.kind !== "foliageTex" || !t.uv) continue;
        for (let i = 0; i < t.uv.length; i += 2) {
            n++;
            if (t.uv[i] < z / 4 - 1e-6 || t.uv[i] > (z + 1) / 4 + 1e-6) aus++;
        }
    }
    return {
        v: n && !aus ? [] : [`${fall}: ${aus} von ${n} Karten-Ecken lesen nicht die Weiden-Zelle ${z}`],
        m: { weidenEcken: n },
    };
}
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

// (F) DIE FRACHT — die GPU nachgerechnet: sRGB-Byte → linear je Texel, bilinear (clamp), alphaTest 0,5.
const FRACHT_MIN_ZELLE = 8;
const FRACHT_TOL = 0.03;
const LIN8 = new Float64Array(256);
for (let c = 0; c < 256; c++) {
    const x = c / 255;
    LIN8[c] = x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
// je Zelle: Deckung (Anteil der Proben über dem alphaTest) und die Luminanz des Lesers relativ zu Y(wert);
// `teilen`: der Leser teilt das gefilterte rgb durch alpha (die Welt), sonst liest er es gerade (das Labor, blutend).
function frachtStufe(m, wert, teilen) {
    const W = m.width,
        H = m.height,
        d = m.data,
        Z = W / 4;
    const yw = 0.2126 * wert[0] + 0.7152 * wert[1] + 0.0722 * wert[2];
    const n = Math.min(512, Z * 2);
    const zellen = [];
    for (let c = 0; c < 4; c++) {
        let ok = 0,
            sy = 0;
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const x = ((c + (i + 0.5) / n) / 4) * W - 0.5,
                    y = ((j + 0.5) / n) * H - 0.5;
                const x0 = Math.floor(x),
                    y0 = Math.floor(y),
                    fx = x - x0,
                    fy = y - y0;
                let r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (let q = 0; q < 4; q++) {
                    const dx = q & 1,
                        dy = q >> 1;
                    const w = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy);
                    const o = (Math.min(H - 1, Math.max(0, y0 + dy)) * W + Math.min(W - 1, Math.max(0, x0 + dx))) * 4;
                    r += w * LIN8[d[o]];
                    g += w * LIN8[d[o + 1]];
                    b += w * LIN8[d[o + 2]];
                    a += (w * d[o + 3]) / 255;
                }
                if (a < 0.5) continue;
                ok++;
                const k = teilen ? 1 / Math.max(1e-3, a) : 1;
                sy += (0.2126 * r + 0.7152 * g + 0.0722 * b) * k;
            }
        zellen.push({ dk: ok / (n * n), Y: ok ? sy / ok / yw : 0 });
    }
    return { Z, zellen };
}
// Die Reihen: das Labor (das Bild, gerade) und die Welt je Format (die Fracht, der EINE Leser). `bcLeser` (Selbsttest):
// wie der BC1-Pfad gelesen wird — true = geteilt (die Welt), false = gerade (der Leser vor 05.10.).
function frachtReihen(bild, bcLeser) {
    const fr = PC.blattAtlasFracht(bild, true);
    const stufen = (mips, teilen) =>
        mips.filter((m) => m.width / 4 >= FRACHT_MIN_ZELLE).map((m) => frachtStufe(m, fr.wert, teilen));
    const bc = fr.bc.mips.map((m) => ({
        width: m.width,
        height: m.height,
        data: PC.bcDekodiere(m.data, m.width, m.height, fr.bc.format || "bc1"),
    }));
    return {
        labor: stufen(bild.mips, false),
        welt: { bc: stufen(bc, bcLeser !== false), rgba: stufen(fr.rgba.mips, true) },
    };
}
function frachtUrteil(R) {
    const v = [];
    const lab = new Map(R.labor.map((s) => [s.Z, s]));
    for (const [fmt, reihe] of Object.entries(R.welt))
        for (const s of reihe) {
            const L = lab.get(s.Z);
            if (!L) {
                v.push(`Fracht ${fmt}: Zelle ${s.Z} px ohne Labor-Stufe`);
                continue;
            }
            s.zellen.forEach((z, c) => {
                const l = L.zellen[c];
                if (Math.abs(z.Y - l.Y) > FRACHT_TOL)
                    v.push(
                        `Fracht ${fmt} Zelle ${c} @ ${s.Z} px: Welt Y ${z.Y.toFixed(3)} ≠ Labor ${l.Y.toFixed(3)} (± ${FRACHT_TOL})`
                    );
                if (Math.abs(z.dk - l.dk) > 0.01)
                    v.push(
                        `Fracht ${fmt} Zelle ${c} @ ${s.Z} px: Deckung ${z.dk.toFixed(3)} ≠ Labor ${l.dk.toFixed(3)}`
                    );
            });
        }
    return v;
}
// Die Quelle des Lesers: `_blattAtlasProbe` teilt durch alpha, und `userData.wert` liest nur er (geschrieben wird es
// in `_ensureFoliageClusterAtlas`).
// (Z) DAS KANTEN-FLIMMERN der Laub-Karte in der Mittelsicht (K20, 12.10.): die Zelle des Atlas als Karte auf dem Schirm
// (N × N Pixel), die GPU nachgerechnet — trilinear (Stufe aus dem Texel-Maß je Pixel), bilinear je Stufe, alphaTest 0,5 —
// zweimal, das zweite Bild um ½ Pixel (diagonal) versetzt. Messname: Δ-Luma Laub gegen Himmel (Kontrast 1) = Anteil der
// Pixel der Krone, die beim ½-Pixel-Versatz ihre Deckung wechseln. Die Mittelsicht: λ = 1 … 3 (die 512er-Zelle auf
// 256 … 64 Pixel); die Kopfzahl ist die Krone der Eichen-L1 auf 25 m (1080p, 75°). Die Deckung je λ steht daneben.
const KORN_LAMBDA = [1, 1.5, 2, 2.5, 3];
// Die Unterproben der zeitlichen Auflösung: Halton (2, 3), 8 Stück — der Jitter der TRAANode (r184).
const KORN_HALTON = [];
for (let i = 1; i <= 8; i++) {
    const h = (b) => {
        let f = 1,
            r = 0,
            n = i;
        while (n > 0) {
            f /= b;
            r += f * (n % b);
            n = Math.floor(n / b);
        }
        return r;
    };
    KORN_HALTON.push([h(2), h(3)]);
}
// Die Schwelle des Laub-Stoffs je Schirm-Ort: der alphaTest 0,5 (die Welt zeichnet ohne Raster-Schwelle).
const kornSchwelle = () => 0.5;
// Vorher (integ-probe 858ed586, Rang-Mips mit Orts-Hash, BC1): 0,166 an der Eichen-Krone auf 25 m (λ 1,58) — Ziel ≤ 50 %.
const KORN_MAX = 0.083;
function kornReihe(mips, zBasis) {
    // `mips` je Stufe { width, height, data rgba8 }, 4 Zellen nebeneinander; `zBasis` = Zell-Breite der ersten Stufe.
    const stufeA = (m, c, u, v) => {
        const W = m.width,
            H = m.height,
            d = m.data;
        const x = ((c + u) / 4) * W - 0.5,
            y = v * H - 0.5;
        const x0 = Math.floor(x),
            y0 = Math.floor(y),
            fx = x - x0,
            fy = y - y0;
        let a = 0;
        for (let q = 0; q < 4; q++) {
            const dx = q & 1,
                dy = q >> 1;
            const w = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy);
            a += w * d[(Math.min(H - 1, Math.max(0, y0 + dy)) * W + Math.min(W - 1, Math.max(0, x0 + dx))) * 4 + 3];
        }
        return a / 255;
    };
    const versatz = Math.log2(PC.BLATT_ATLAS_ZELLE / zBasis);
    return (lambda) => {
        const N = Math.max(4, Math.round(PC.BLATT_ATLAS_ZELLE / Math.pow(2, lambda)));
        const l = Math.max(0, lambda - versatz),
            l0 = Math.min(mips.length - 1, Math.floor(l)),
            l1 = Math.min(mips.length - 1, l0 + 1),
            f = l - Math.floor(l);
        const probe = (c, u, v) => {
            const a0 = stufeA(mips[l0], c, u, v);
            return l1 === l0 || f === 0 ? a0 : a0 + (stufeA(mips[l1], c, u, v) - a0) * f;
        };
        // Das Pixel, wie die zeitliche Auflösung es ruhend zeigt: das Mittel über die Halton-Unterproben (TRAANode).
        const pixel = (c, px, py, schwelle) => {
            let k = 0;
            for (const [hx, hy] of KORN_HALTON)
                if (probe(c, (px + hx) / N, (py + hy) / N) >= schwelle(px + hx, py + hy)) k++;
            return k / KORN_HALTON.length;
        };
        const zellen = [];
        for (let c = 0; c < 4; c++) {
            let wechsel = 0,
                krone = 0,
                deckt = 0;
            for (let j = 0; j < N; j++)
                for (let i = 0; i < N; i++) {
                    const k1 = pixel(c, i, j, kornSchwelle),
                        k2 = pixel(c, i + 0.5, j + 0.5, kornSchwelle);
                    deckt += k1;
                    krone += Math.max(k1, k2);
                    wechsel += Math.abs(k1 - k2);
                }
            zellen.push({ flimmern: krone ? wechsel / krone : 0, deckung: deckt / (N * N) });
        }
        return { lambda, N, zellen };
    };
}
// Die Reihen je Format der Welt (die Fracht, wie die GPU sie liest) — `fr` = blattAtlasFracht(bild, true).
function kornReihen(fr, bcFmt) {
    const bc = fr.bc.mips.map((m) => ({
        width: m.width,
        height: m.height,
        data: PC.bcDekodiere(m.data, m.width, m.height, bcFmt),
    }));
    return {
        bc: kornReihe(bc, bc[0].width / 4),
        rgba: kornReihe(fr.rgba.mips, fr.rgba.mips[0].width / 4),
    };
}
// λ der Krone auf `dist` m: die Zelle der Karte in der Welt (Kante ÷ kern × Skala) auf dem Schirm (1080 px, 75°).
function kronenLambda(T, skala, dist) {
    const kante = kartenKante(T);
    if (!kante) return null;
    const zelleM = (kante / PC.BLATT_ATLAS_BREIT.kern) * skala;
    const pxJeM = 1080 / (2 * dist * Math.tan((37.5 * Math.PI) / 180));
    return Math.log2(PC.BLATT_ATLAS_ZELLE / (zelleM * pxJeM));
}
function kornUrteil(reihen, lambdaKrone, deckungLabor) {
    const v = [],
        m = {};
    for (const [fmt, r] of Object.entries(reihen)) {
        const kopf = r(lambdaKrone);
        m[fmt] = kopf.zellen[0].flimmern;
        if (kopf.zellen[0].flimmern > KORN_MAX)
            v.push(
                `Korn ${fmt}: die Eichen-Krone auf 25 m (λ ${lambdaKrone.toFixed(2)}, ${kopf.N} px) flimmert ${kopf.zellen[0].flimmern.toFixed(3)} > ${KORN_MAX}`
            );
        for (const lam of KORN_LAMBDA) {
            const s = r(lam);
            s.zellen.forEach((z, c) => {
                if (deckungLabor && Math.abs(z.deckung - deckungLabor[c]) > 0.1)
                    v.push(
                        `Korn ${fmt} Zelle ${c} λ ${lam}: Deckung ${z.deckung.toFixed(3)} ≠ Stufe 0 ${deckungLabor[c].toFixed(3)} (± 0,1)`
                    );
            });
            m[`${fmt}@${lam}`] = s.zellen.map((z) => `${z.flimmern.toFixed(3)}/${z.deckung.toFixed(2)}`).join(" ");
        }
    }
    return { v, m };
}
// (H) DER HÖHEN-ZENSUS (K20): die Welt-Höhe einer Art = Höhe der gelieferten L0 × Welt-Skala × Größe des Wald-Gesetzes
// (phyto-core forestTreeSize); der Altbestand sind die herrschenden Bäume (Größe p75 … p98 über die Bestandsdichte).
// Die Spannen der Natur (Steckbriefe; nordstern §4.5): Buche 30–45, Fichte 30–50, Stieleiche 15–35, Birke 15–25 m.
// H/D: Höhe durch den Stamm-Durchmesser in Brusthöhe (1,3 m Welt) — scale-frei, Bestand 40–100.
const HOEHE_SPANNE = { buche: [30, 45], fichte: [30, 50], eiche: [15, 35], birke: [15, 25] };
const HD_BESTAND = [40, 100];
function altbestandGroesse() {
    let a = 0x2545f491;
    const rng = () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const s = [];
    for (let i = 0; i < 4000; i++) s.push(PC.forestTreeSize(rng, i / 4000));
    s.sort((x, y) => x - y);
    return [s[Math.floor(0.75 * s.length)], s[Math.floor(0.98 * s.length)]];
}
function stammDurchmesser(T, yWelt, skala) {
    const y = yWelt / skala;
    let sx = 0,
        sz = 0,
        n = 0;
    const pts = [];
    for (const t of T) {
        if (t.kind !== "bark") continue;
        for (let i = 0; i + 2 < t.pos.length; i += 3)
            if (Math.abs(t.pos[i + 1] - y) < 0.15) {
                const x = t.pos[i],
                    z = t.pos[i + 2];
                if (Math.hypot(x, z) > 2) continue; // nur der Stamm um die Achse
                pts.push([x, z]);
                sx += x;
                sz += z;
                n++;
            }
    }
    if (!n) return 0;
    const mx = sx / n,
        mz = sz / n;
    // der Median der Abstände zur Achse: ein tief ansetzender Ast im Fenster verschiebt ihn nicht
    const r = pts.map(([x, z]) => Math.hypot(x - mx, z - mz)).sort((p, q) => p - q)[pts.length >> 1];
    return 2 * r * skala;
}
function hoehenUrteil(roh, skala) {
    const v = [],
        m = {};
    const [s0, s1] = altbestandGroesse();
    for (const [art, sp] of Object.entries(HOEHE_SPANNE)) {
        const f = roh[`${art}-s1-L0`];
        if (!f) {
            v.push(`Höhe: ${art} nicht gebaut`);
            continue;
        }
        const h1 = hoehe(f.T) * skala(art);
        const lo = h1 * s0,
            hi = h1 * s1;
        const D = stammDurchmesser(f.T, 1.3, skala(art));
        const hd = D > 0 ? h1 / D : 0;
        m[art] = `${lo.toFixed(1)}–${hi.toFixed(1)} m (Größe 1: ${h1.toFixed(1)} m) · H/D ${hd.toFixed(0)}`;
        if (lo < sp[0] - 0.5 || hi > sp[1] + 0.5)
            v.push(`Höhe ${art}: Altbestand ${lo.toFixed(1)}–${hi.toFixed(1)} m außerhalb ${sp[0]}–${sp[1]} m`);
        if (!(hd >= HD_BESTAND[0] && hd <= HD_BESTAND[1]))
            v.push(`H/D ${art}: ${hd.toFixed(0)} außerhalb ${HD_BESTAND.join("–")}`);
    }
    m.groesse = `${s0.toFixed(2)}–${s1.toFixed(2)}`;
    return { v, m };
}

// Die Deckung der Stufe 0 je Zelle (das Labor-Bild, alphaTest 0,5) — der Maßstab „nah = fern".
function deckungStufe0(bild) {
    const m = bild.mips[0],
        Z = m.width / 4,
        out = [0, 0, 0, 0];
    for (let y = 0; y < m.height; y++)
        for (let x = 0; x < m.width; x++) if (m.data[(y * m.width + x) * 4 + 3] >= 128) out[Math.min(3, (x / Z) | 0)]++;
    return out.map((n) => n / (Z * m.height));
}

function leserUrteil(quelle) {
    const v = [];
    const text = quelle.replace(/\/\/[^\n]*/g, ""); // Kommentare zitieren (Lehre 6) — gezählt wird Code
    const i = text.indexOf("\n    _blattAtlasProbe(");
    const rumpf = i < 0 ? "" : text.slice(i, text.indexOf("\n    }\n", i));
    if (!rumpf) v.push("anazhRealm.js: der Leser _blattAtlasProbe fehlt");
    else if (!/\.rgb\.div\(s\.a\.max\(/.test(rumpf))
        v.push("anazhRealm.js: _blattAtlasProbe teilt rgb nicht durch alpha");
    const leser =
        (text.match(/userData\.wert\b(?!\s*=)/g) || []).length - (/userData\.wert\b(?!\s*=)/.test(rumpf) ? 1 : 0);
    if (leser > 0) v.push(`anazhRealm.js: ${leser} Leser von userData.wert neben _blattAtlasProbe`);
    return v;
}

(async () => {
    const fails = [];
    const roh = {};
    let buch = null,
        rc = null,
        bild = null;
    await runWithWorker(PORT, async ({ build, getData, atlasBild }) => {
        const ab = await atlasBild();
        bild = {
            wert: ab.wert,
            mips: ab.mips.map((m) => ({ width: m.w, height: m.h, data: new Uint8Array(Buffer.from(m.b64, "base64")) })),
        };
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
        for (const p of Object.keys(buch).filter((x) => art(x) === "shrub"))
            for (const l of [0, 1]) await fall(p, l, 1);
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
        const trauerArt = buch[f.presetId].s && buch[f.presetId].s.trop >= 0.55;
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
            const b = blattMass(k, f.T, skala(f.presetId), PC.ZWEIG_GROSS);
            u.v.push(...b.v);
            Object.assign(u.m, b.m);
        } else if (kind === "flower") u = bluetenUrteil(k, f.T);
        if (kind === "tree" && trauerArt) {
            const w = weidenZelle(k, f.T);
            u.v.push(...w.v);
            Object.assign(u.m, w.m);
        }
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
    // (F) die Fracht je Format gegen das Labor, und der EINE Leser in der Quelle.
    const fracht = frachtReihen(bild);
    fails.push(...frachtUrteil(fracht), ...leserUrteil(quellen["anazhRealm.js"]));
    const fz = (s) => s.zellen.map((z) => z.Y.toFixed(3)).join("/");
    console.log(
        "Fracht (Y je Zelle 0/1/2/3 ÷ wert, Labor | BC3 | rgba):\n" +
            fracht.labor
                .map((L) => {
                    const b = fracht.welt.bc.find((s) => s.Z === L.Z),
                        r = fracht.welt.rgba.find((s) => s.Z === L.Z);
                    return `  Zelle ${L.Z} px: ${fz(L)} | ${b ? fz(b) : "—"} | ${r ? fz(r) : "—"}`;
                })
                .join("\n")
    );

    // (Z) das Kanten-Flimmern der Laub-Karte in der Mittelsicht, je Format der Welt.
    const eicheL1 = roh["eiche-s1-L1"];
    const lamKrone = eicheL1 ? kronenLambda(eicheL1.T, skala("eiche"), 25) : null;
    const frK = PC.blattAtlasFracht(bild, true);
    const dk0 = deckungStufe0(bild);
    let korn = null;
    if (lamKrone == null) fails.push("Korn: die Eichen-L1 trägt keine Laub-Karte");
    else {
        korn = kornUrteil(kornReihen(frK, frK.bc.format || "bc1"), lamKrone, dk0);
        fails.push(...korn.v);
        console.log(
            `Korn (Δ-Luma beim ½-Pixel-Versatz / Deckung, Zelle 0 1 2 3; Stufe 0 ${dk0.map((x) => x.toFixed(2)).join(" ")}):\n` +
                `  Eichen-Krone auf 25 m (λ ${lamKrone.toFixed(2)}): bc ${korn.m.bc.toFixed(3)} · rgba ${korn.m.rgba.toFixed(3)} (≤ ${KORN_MAX})\n` +
                KORN_LAMBDA.map((l) => `  λ ${l}: bc ${korn.m["bc@" + l]} | rgba ${korn.m["rgba@" + l]}`).join("\n")
        );
    }

    // (H) der Höhen-Zensus je Art gegen die Spanne der Natur, und H/D.
    const hz = hoehenUrteil(roh, skala);
    fails.push(...hz.v);
    console.log(
        `Höhen (Altbestand, Größe ${hz.m.groesse}):\n` +
            Object.keys(HOEHE_SPANNE)
                .map((a) => `  ${a}: ${hz.m[a]} (Natur ${HOEHE_SPANNE[a].join("–")} m)`)
                .join("\n")
    );

    // SELBSTTEST — jede Probe an einer kranken Kopie.
    const kopie = (T) => T.map((t) => Object.assign({}, t, { col: t.col ? Float32Array.from(t.col) : null }));
    const birke = roh["birke-s1-L0"],
        fichte = roh["fichte-s1-L0"],
        strauch = roh["strauch-s1-L0"],
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
        st.push([
            "Strauch-Blatt ×½",
            blattMass("klein", skaliert(strauch.T, 0.5), skala("strauch"), PC.ZWEIG_GROSS).v.length > 0,
        ]);
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
    if (weide1)
        st.push([
            "Weide in der Großblatt-Zelle",
            weidenZelle(
                "hasel",
                weide1.T.map((t) => {
                    if (t.kind !== "foliageTex" || !t.uv) return t;
                    const uv = Float32Array.from(t.uv);
                    for (let i = 0; i < uv.length; i += 2) uv[i] += 0.25;
                    return Object.assign({}, t, { uv });
                })
            ).v.length > 0,
        ]);
    st.push(["BC gerade gelesen (ohne ÷ alpha)", frachtUrteil(frachtReihen(bild, false)).length > 0]);
    st.push([
        "Leser teilt nicht durch alpha",
        leserUrteil(quellen["anazhRealm.js"].replace(".rgb.div(s.a.max(T.float(1e-3)))", ".rgb")).length > 0,
    ]);
    // Korn: jede Stufe ab 1 je Texel gegen ein Hash-Raster binär geschnitten (die Deckung im Mittel gleich) — die Linse
    // muss das Flimmern nennen.
    if (lamKrone != null) {
        const kornig = (mips) =>
            mips.map((m, k) => {
                if (k === 0) return m;
                const d = new Uint8Array(m.data);
                for (let i = 0; i < d.length; i += 4) {
                    const h = ((Math.imul(i >> 2, 0x9e3779b1) >>> 0) % 251) + 2;
                    d[i + 3] = d[i + 3] >= h ? 255 : 0;
                }
                return { width: m.width, height: m.height, data: d };
            });
        const r = {
            rgba: kornReihe(kornig(frK.rgba.mips), frK.rgba.mips[0].width / 4),
        };
        st.push(["Korn je Texel", kornUrteil(r, lamKrone, null).v.length > 0]);
    }
    console.log("Selbsttest: " + st.map(([n, ok]) => `${n} ${ok ? "✅" : "❌"}`).join(" · "));
    if (st.some(([, ok]) => !ok)) fails.push("Selbsttest der Pflanzen-Linse feuert nicht");

    console.log(
        "=== PFLANZEN-NAHBILD — Rinde · Gitter · Strauch · Blüte · Blatt- und Nadel-Maß · L1-Krone · Unterseite · Fracht ==="
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
