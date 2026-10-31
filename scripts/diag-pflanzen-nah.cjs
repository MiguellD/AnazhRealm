// diag-pflanzen-nah.cjs — DIE LINSE DES PFLANZEN-NAHBILDS (Gebot 10: die Linse nennt den Täter beim NAMEN). Jede Probe liest die GELIEFERTEN Puffer über die echte Foundry-Naht (asset-worker-harness: dieselben Kerne
// wie Labor und Welt; die Welt liest nur Vertex-Farben — Lehre 19), je Art der Klasse, nicht das bequeme Beispiel:
//
//  (R) RINDE je Baum-Art (Welt-Gestalt 1, Nah-Stufe L0): die flächen-gewichtete lineare Albedo (Y) des Stamms im Band
//      y ∈ [0,12 H, 0,35 H] liegt im Band ihres Rinden-Typs (RINDEN_BAND). Die Birke (papery) dazu: Lentizellen
//      (Flächen-Anteil Y < 0,12 im Stamm-Band), die schwarze Fuß-Borke (y ∈ [0,005 H, 0,05 H]) und die dunklen Zweige
//      (Rinde über 0,7 H).
//  (G) GITTER — das Ringel-Maß des Stamm-Strangs: je Spalte die zweite Differenz der Ring-Luminanz über das Stamm-Band,
//      relativ zur Luminanz. Ein Muster über dem Nyquist des Ring-Gitters (die Plattenrisse der Fichte: 1,95 Ringe je
//      Periode, Mikro-Rauschen je Ring zufällig) faltet in Ringel-Bänder. Die lebenden Laub- und Nadel-Rinden halten ≤ RINGEL_MAX; die Birke trägt ihre Zeilen absichtlich,
//      das Totholz seine Zerfalls-Flecken (3D-Rauschen, kein periodischer Term) — beide stehen benannt außerhalb.
//  (S) STRAUCH (Gestalt 1, beide Gitter-Stufen — die Nah-Stufe L0 und seit Welle 6 die Mittel-Stufe L1): die Krone sind
//      Karten aus dem EINEN Atlas (foliageTex, keine Klinge) und das Reisig trägt ≥ REISIG_MIN der Dreiecke.
//  (B) BLUME (L0, Gestalten 1/2): die Blütenblätter tragen den Saftmal-Verlauf — je Blatt Luminanz Spitze : Grund im
//      Mittel ≥ SAFTMAL_MIN.
//  (M) BLATT-MASS (Laub-Bäume L0 und der Strauch L0/L1, Gestalt 1): die Länge eines Atlas-Blatts in der Welt =
//      mittlere Karten-Kante (aus den gelieferten Quads, ÷ kern) × Blatt-Länge des Zweigs der Zelle (Baum ZWEIG_BLATT,
//      Strauch ZWEIG_GROSS) / BLATT_ATLAS_ZELLE × Welt-Skala im Band
//      BLATT_BAND.
//  (N) NADEL-MASS (Koniferen L0, Gestalt 1): die Länge einer Atlas-Nadel in der Welt. Die Nadel sitzt im Wedel (Zelle 3,
//      WEDEL_ZWEIG — der Nadel-Ast als Strähne): mittlere Wedel-Länge (die Kante längs der Bahn, ÷ kern) ×
//      WEDEL_ZWEIG.nadel/BLATT_ATLAS_ZELLE × Welt-Skala ≤ NADEL_MAX_M.
//  (K) KEINE KLINGEN-KRONE in einer Baum-L1 (Gestalt 1): jede L1-Krone ist Karte oder Strähne.
//  (V) VOLUMEN — die Normale der Krone: jede Laub-Stufe eines Baums und Strauchs (L0, L1) trägt die
//      Normale der Krone (phyto-core kronenNormalen) — aus 8 Peilungen zeigt die GELICHTETE Normale der nahen Kronen-Hälfte
//      aus der Krone hinaus (Anteil nach innen ≤ KRONE_WEG_MAX). Gelichtet ist, was die Leser tun: lesen Welt-Stoff, Labor und Bäcker der
//      Karte die Normale flip-frei (`_laubStoffNormale` = normalViewGeometry · injectWind `krone` · der Normal-Pass), ist sie
//      die Normale; sonst kehrt r184 sie auf jeder Rückseite (front ? n : −n). Dazu das EINE Gesetz: der Grammatik-Baum der
//      Werkstatt legt dieselbe Normale (`_kronenNormalenAuf` → kronenNormalen), keine zweite Kronen-Normale im Stamm.
//  (W) WEIDE — jede Karte der Trauer-Krone (L0 und L1) liest die Weiden-Zelle (BLATT_ATLAS_WEIDE: lanzettliche Blätter an
//      der hängenden Rute).
//  (Z) KORN — das Kanten-Flimmern der Laub-Karte in der Mittelsicht: die Zelle als Karte auf dem Schirm, trilinear,
//      alphaTest 0,5, das Pixel als Mittel der Halton-Unterproben der zeitlichen Auflösung; Δ-Luma (Laub gegen Himmel)
//      zwischen zwei Bildern mit ½-Pixel-Versatz an der Eichen-Krone auf 25 m ≤ KORN_MAX, die
//      Deckung je λ 1…3 = Stufe 0 ± 0,1 (nah = fern). Konsum-Leser: der Laub-Stoff (`_blattAtlasProbe`).
//  (H) HÖHEN-ZENSUS je Art: der Altbestand in der Spanne der Natur, H/D in Brusthöhe im Bestands-Band.
//  (F) FRACHT — der Wirt lädt den Atlas als Fracht seines Formats (phyto-core blattAtlasFracht: BC3 ab Stufe 0, rgba ab
//      Stufe 1), das Labor das blutende Bild. Je Format, Zelle und Zell-Größe (≥ FRACHT_MIN_ZELLE px) wird die GPU
//      nachgerechnet (sRGB-Dekodierung je Texel, bilinear linear, alphaTest 0,5) und der EINE Leser der Welt angewandt
//      (gefiltertes rgb ÷ alpha ÷ wert): Luminanz und Deckung der Welt = Labor (± FRACHT_TOL). Dazu die Quelle: der Leser
//      `_blattAtlasProbe` teilt durch alpha, und `userData.wert` liest sonst niemand.
//  (T) TEPPICH — die Halm-Deckung der Wiese: je gelieferte Gras-Stufe (L1, L2) und Gestalt die Vorlage nach dem
//      Wiesen-Gesetz gekachelt (Raster understory.grassStep, Jitter ±0,34, Drehung, Skala placement.scale.gras ·
//      0,7…1,4, volle Wiese) und parallel unter TEPPICH_NEIGUNG projiziert (der Boden 4,4 m vor dem Ego-Auge): der Anteil
//      des Bodens, den Halme decken, ≥ TEPPICH_MIN. Konsum-Leser: die Nah-Wiese (`_nahWieseSenken`) und der Studio-Wald (grassT).
//      DIE GRASNARBE (K70, Soll-Tafel boden-nah laiWirk ≥ 1,7): die Schwellen tragen die geschlossene Narbe, und der Halm
//      WURZELT — die tiefste Ecke der Vorlage liegt am Boden (≤ FUSS_MAX der Büschel-Höhe).
//  (Q) DER HALM (w4-wiese-nah, HALM_GESETZ): je gelieferte Gras-Stufe die Quer-Koordinate in Adern, die Spitze als EINE Ecke,
//      die Narbe als Blatt-Fläche des Büschels im Band der Grasländer, die Ährchen der Ähre (schlank); dazu der Pixel als
//      Filter (Rippe und Ader auf Armlänge ≥ 90 %, fern < 1 %). Vorher (main 715754fc): 0 Fußzeilen in Adern, Narbe 1 (die
//      Längs-Koordinate), Ähre Breite ÷ Länge 0,29–0,35 (das Papier-Fähnchen); nachher 101/121 · 1,86/2,51 · 0,042.
// SELBSTTEST: jede Probe MUSS an einer kranken Kopie der gemessenen Puffer feuern (gipsweiße Birke, Ringel-Stamm,
// Klingen-Strauch, einfarbige Blüte, Blatt ×3, Strauch-Blatt ×½, Nadel ×3, Klingen-L1, Leser entfernt, BC1 gerade gelesen,
// Atlas-Leser ohne ÷ alpha, Narbe × 2, Quer 0…1, Spitze gestutzt, Fähnchen-Ähre, Filter aus) — die Linse
// ist nie vakuös.
//
//   npm run gate:pflanzen-nah            (PFLANZEN_PORT, Vorgabe 4548)
"use strict";
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");
const { hauptLauf, wandEnde, path, stammLib } = require("./lib/welt-boot.cjs");
require("../phyto-core.js");
const PC = globalThis.__phytoCore;
const ROOT = path.resolve(__dirname, "..");
// die Oktave der Blatt-Farbe, wie die Welt sie trägt (die Klasse geladen, nie ihr Text; D3c)
const OKTAVE = stammLib.ladeKlasse(ROOT).AnazhRealm.BLATT_FARBE_OKTAVE;
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
            nor: m.attrs.normal ? f32(m.attrs.normal.b64) : null,
            cen: m.attrs.aCenter ? f32(m.attrs.aCenter.b64) : null,
            wind: m.attrs.aWind ? f32(m.attrs.aWind.b64) : null,
            idx: m.index ? u32(m.index) : null,
        }));
}
const { luma709, srgbLin } = require("./lib/abnahme-urteil.cjs");
const Y = (c, i) => luma709(c, i * 3);
const kreuz = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
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
// u in [zelle/4, (zelle+1)/4].
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
// (T) Die Wiese aus EINER Vorlage nach dem Gesetz der Nah-Wiese gekachelt (`_nahWieseKachelBueschel`: Raster, Jitter
// ±0,34, Drehung, Skala 0,7…1,4; hier volle Wiese) und parallel unter `neigung` Grad auf die Blick-Ebene projiziert; das
// Fenster ist das Bild des Boden-Quadrats [−1, 1]² m, Raster 5 mm, die Kacheln reichen 3 m weit (jeder Halm, der ins
// Fenster ragt). Rückgabe: der gedeckte Anteil des Fensters.
const TEPPICH_NEIGUNG = 20;
// vorher L1 0,425/0,504 · L2 0,322/0,415, K56 L1 0,901/0,954 · L2 0,586/0,702, K70 L1 0,996/0,999 · L2 0,959/0,980
const TEPPICH_MIN = { 1: 0.97, 2: 0.9 };
const FUSS_MAX = 0.01;
// Der Fuß der Halme: je Halm-Fußzeile (ihr Wind-Hub 0, aWind.x — die Ähre wiegt mit ihrer Spitze; grün) ihre Höhe über der
// Grundebene der Vorlage (der Ofen setzt die tiefste Ecke auf 0); das 90. Perzentil in Teilen der Büschel-Höhe.
const halmFuss = (t, k) => t.wind && t.col && t.wind[k * 3] === 0 && t.col[k * 3 + 1] > t.col[k * 3];
function teppichFuss(T) {
    let hi = -Infinity,
        lo = Infinity;
    const fuss = [];
    for (const t of T) {
        if (!t.idx) continue;
        for (let k = 0; k < t.pos.length / 3; k++) {
            const y = t.pos[k * 3 + 1];
            hi = Math.max(hi, y);
            lo = Math.min(lo, y);
            if (halmFuss(t, k)) fuss.push(y);
        }
    }
    if (!fuss.length || !(hi > lo)) return Infinity;
    fuss.sort((a, b) => a - b);
    return (fuss[Math.floor(fuss.length * 0.9)] - lo) / (hi - lo);
}
function teppichDeckung(T, step, skala, neigung = TEPPICH_NEIGUNG) {
    const e = (neigung * Math.PI) / 180,
        se = Math.sin(e),
        ce = Math.cos(e);
    const RES = 0.005,
        NU = Math.round(2 / RES),
        NV = Math.round((2 * se) / RES),
        bild = new Uint8Array(NU * NV);
    const pu = [0, 0, 0],
        pv = [0, 0, 0];
    for (let gj = Math.ceil(-3 / step); gj * step <= 3; gj++)
        for (let gi = Math.ceil(-3 / step); gi * step <= 3; gi++) {
            const w = PC.mulberry32(((gi * 73856093) ^ (gj * 19349663) ^ 0x6a09e667) >>> 0 || 1);
            const cx = gi * step + (w() - 0.5) * 0.68,
                cz = gj * step + (w() - 0.5) * 0.68,
                s = skala * (0.7 + w() * 0.7),
                rot = w() * Math.PI * 2,
                c = Math.cos(rot) * s,
                sn = Math.sin(rot) * s;
            for (const t of T) {
                if (!t.idx) continue;
                const P = t.pos,
                    I = t.idx;
                for (let k = 0; k < I.length; k += 3) {
                    for (let q = 0; q < 3; q++) {
                        const o = I[k + q] * 3,
                            x = cx + c * P[o] + sn * P[o + 2],
                            z = cz - sn * P[o] + c * P[o + 2];
                        pu[q] = (x + 1) / RES;
                        pv[q] = (P[o + 1] * s * ce - z * se + se) / RES;
                    }
                    const u0 = Math.max(0, Math.floor(Math.min(pu[0], pu[1], pu[2]))),
                        u1 = Math.min(NU - 1, Math.ceil(Math.max(pu[0], pu[1], pu[2]))),
                        v0 = Math.max(0, Math.floor(Math.min(pv[0], pv[1], pv[2]))),
                        v1 = Math.min(NV - 1, Math.ceil(Math.max(pv[0], pv[1], pv[2])));
                    if (u0 > u1 || v0 > v1) continue;
                    const fl = (pu[1] - pu[0]) * (pv[2] - pv[0]) - (pv[1] - pv[0]) * (pu[2] - pu[0]);
                    if (Math.abs(fl) < 1e-9) continue;
                    for (let v = v0; v <= v1; v++)
                        for (let u = u0; u <= u1; u++) {
                            const x = u + 0.5,
                                y = v + 0.5;
                            const a = ((pu[1] - x) * (pv[2] - y) - (pv[1] - y) * (pu[2] - x)) / fl,
                                b = ((pu[2] - x) * (pv[0] - y) - (pv[2] - y) * (pu[0] - x)) / fl;
                            if (a >= 0 && b >= 0 && a + b <= 1) bild[v * NU + u] = 1;
                        }
                }
            }
        }
    let n = 0;
    for (let i = 0; i < bild.length; i++) n += bild[i];
    return n / bild.length;
}
function teppichUrteil(fall, T, lod, step, skala) {
    const d = teppichDeckung(T, step, skala),
        min = TEPPICH_MIN[lod],
        fuss = teppichFuss(T);
    const v =
        min != null && d >= min
            ? []
            : [`${fall}: Halm-Deckung des Bodens unter ${TEPPICH_NEIGUNG}° ${d.toFixed(3)} < ${min} (Büschel auf glattem Grün)`];
    if (!(fuss <= FUSS_MAX))
        v.push(`${fall}: der Halm schwebt — sein Fuß steht ${(100 * fuss).toFixed(1)} % der Büschel-Höhe über dem Boden`);
    return { v, m: { teppich: d, fuss } };
}
// (Q) DER HALM (w4-wiese-nah, phyto-core HALM_GESETZ) an den gelieferten Puffern je Gras-Stufe und Gestalt: am Fuß zählt
// uv.x die Adern der Breite (Breite × Welt-Skala ÷ aderM = 2|u| ± 1 %), jeder Halm endet in EINER Ecke (u 0), uv.y (die
// Narbe) ist am Fuß die Blatt-Fläche des Büschels je Raster-Zelle (± 1 %) im Band der Grasländer (LAI 0,5–4: 1,71 ± 1,19,
// Asner, Scurlock & Hicke 2003, Global Ecol. Biogeogr. 12:191), jede Ähre trägt die Ährchen ihrer Budget-Zeile, schlank
// (Breite ÷ Länge ≤ 0,08; das Papier-Fähnchen der Rispe 0,25). Konsum-Leser: der Halm-Stoff der Welt (`_halmStoff`,
// Laub-Licht mit Narbe) und der Labor-Shader (foundry-core injectWind).
function halmUrteil(fall, t, rc, lod, S) {
    const { pos: p, uv, cen: c, idx: I } = t, n = rc.lod.budget.grass[lod].aehre.aehrchen, ae = new Map(); // prettier-ignore
    const d = (a, b) => [0, 1, 2].map((x) => p[b * 3 + x] - p[a * 3 + x]);
    let quer = 0, fuesse = 0, spitzen = 0, A = 0; // prettier-ignore
    for (let k = 0; k < uv.length / 2; k++)
        if (!c[k * 3 + 1]) {
            // der Halm hängt am Fuß seines Büschels (aCenter.y 0): die Fußzeile trägt den Wind-Hub 0, die Spitze u 0
            spitzen += !uv[k * 2];
            if (t.wind[k * 3] || !(uv[k * 2] < 0)) continue;
            fuesse++;
            quer += Math.abs((Math.hypot(...d(k, k + 1)) * S) / PC.HALM_GESETZ.aderM / uv[k * 2 + 2] / 2 - 1) > 0.01;
        }
    for (let i = 0; i < I.length; i += 3) {
        const [b, x, y] = I.slice(i, i + 3), fl = Math.hypot(...kreuz(d(b, x), d(b, y))) / 2, a = c.slice(b * 3, b * 3 + 3); // prettier-ignore
        A += fl;
        if (!a[1]) continue;
        // je Anker (die Spitze des Stängels): Ährchen, Breite (die Höhe über der Achse), Länge (die fernste Spitze)
        const e = uv[x * 2] > 0 ? y : x, z = ae.get(a.join()) || [0, 0, 0]; // prettier-ignore
        ae.set(a.join(), [z[0] + 1, Math.max(z[1], (2 * fl) / Math.hypot(...d(b, e))), Math.max(z[2], Math.hypot(...p.slice(e * 3, e * 3 + 3).map((q, j) => q - a[j])))]); // prettier-ignore
    }
    const lam = A * (S / rc.understory.grassStep) ** 2, fuss = Math.max(...uv.filter((_, i) => i % 2)), aeh = [...ae.values()]; // prettier-ignore
    return [
        (!fuesse || quer || spitzen !== fuesse) && `${quer} von ${fuesse} Halmen zählen am Fuß nicht ihre Adern, ${spitzen} Spitzen-Ecken`,
        !(Math.abs(fuss / lam - 1) <= 0.01 && fuss >= 0.5 && fuss <= 4) && `Narbe am Fuß ${fuss.toFixed(3)} ≠ Blatt-Fläche ${lam.toFixed(3)} je Zelle`,
        (!aeh.length || aeh.some(([m, w, l]) => m !== n || w / l > 0.08)) && `${aeh.length} Ähren nicht je ${n} schlanke Ährchen`,
    ].filter(Boolean).map((x) => `${fall}: ${x}`); // prettier-ignore
}
// DER PIXEL ALS FILTER (phyto-core halmFilter): die Welle quer über eine Ader (u 20–21, wo der Kiel flach ist) trägt auf
// Armlänge (0,1 Adern je Pixel) ≥ 90 % ihrer Höhe, fern (1,5) < 1 % — Detail je Pixel, nie Flimmern. Die Konstanten des
// Gesetzes gegen die Literatur (Kiel 20,1° in 15–30°, Rippen 0,7 mm in 0,5–1, Rauheit 0,55 in 0,45–0,71, K 0,385 und 0,50 in
// 0,3–0,55, K des Himmels 0,70 in 0,6–0,8) rechnet der Rumpf von w4-wiese-nah; das Bild auf Armlänge urteilt die GPU.
function halmPixelUrteil(quer = PC.halmQuer) {
    const Z = PC.WIND_ZAHLEN, H = PC.HALM_GESETZ; // prettier-ignore
    const welle = (f, fw, amp) => ((y) => (Math.max(...y) - Math.min(...y)) / 2 / amp)([...Array(41).keys()].map((i) => f(Z, 20 + i / 40, fw))); // prettier-ignore
    return [[quer, H.rippe, "Rippe"], [PC.halmAder, H.ader, "Ader"]].flatMap(([f, amp, n]) => [
        welle(f, 0.1, amp) < 0.9 && `${n} auf Armlänge ${welle(f, 0.1, amp).toFixed(3)} < 0,9 ihrer Welle`,
        welle(f, 1.5, amp) > 0.01 && `${n} fern ${welle(f, 1.5, amp).toFixed(3)} > 0,01 (Flimmern)`,
    ]).filter(Boolean); // prettier-ignore
}
// (V) DIE NORMALE DER KRONE — gelichtet, wie die Leser lesen (flipFrei), aus 8 Peilungen (Höhe 0,25) über der nahen Hälfte.
const KRONE_WEG_MAX = 0.05;
// Seit T2 lichtet die Laubkrone je Ast-Partie (phyto-core kronenPartien): die Linse wächst dasselbe Skelett, ordnet
// jede Ecke über ihren Anker (aCenter, ±1e-3) Blatt und Partie zu und peilt gegen die Kasten-Mitte IHRER Partie.
function partienDerKrone(f, pre, sk) {
    const P = pre && pre.kind === "tree" ? Object.assign(PC.treeParams(pre.s, f.seed, f.lod, pre, sk), f.ov) : null;
    if (!P || P.conifer || (P.trop || 0) >= 0.55) return null;
    const n = PC.growSkeleton(Object.assign({}, P, { leafBudget: 20000 }), PC.mulberry32(Math.floor(f.seed) >>> 0));
    const partie = PC.kronenPartien(n.runMeta), L = n.leaves.slice().sort((a, b) => a.pos[0] - b.pos[0]); // prettier-ignore
    const suche = (c, i) => {
        let lo = 0, hi = L.length, best = -1, d2 = 1e-6; // prettier-ignore
        while (lo < hi) L[(lo + hi) >> 1].pos[0] < c[i] - 1e-3 ? (lo = ((lo + hi) >> 1) + 1) : (hi = (lo + hi) >> 1);
        for (let j = lo; j < L.length && L[j].pos[0] <= c[i] + 1e-3; j++) {
            const q = (L[j].pos[0] - c[i]) ** 2 + (L[j].pos[1] - c[i + 1]) ** 2 + (L[j].pos[2] - c[i + 2]) ** 2;
            if (q < d2) (d2 = q), (best = partie(L[j].run));
        }
        return best;
    };
    const out = new Map(), box = new Map(); // prettier-ignore
    f.T.forEach((t, ti) => {
        if ((t.kind !== "foliage" && t.kind !== "foliageTex") || !t.cen) return;
        const pa = new Int32Array(t.cen.length / 3), C = t.cen; // prettier-ignore
        for (let i = 0; i < pa.length; i++) {
            const k = 3 * i;
            pa[i] = i && C[k] === C[k - 3] && C[k + 1] === C[k - 2] && C[k + 2] === C[k - 1] ? pa[i - 1] : suche(C, k);
            const b = box.get(pa[i]) || box.set(pa[i], [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]).get(pa[i]);
            for (let a = 0; a < 3; a++) (b[a] = Math.min(b[a], t.pos[k + a])), (b[a + 3] = Math.max(b[a + 3], t.pos[k + a]));
        }
        out.set(ti, pa);
    });
    out.mitten = new Map([...box].map(([p, b]) => [p, [0, 1, 2].map((a) => (b[a] + b[a + 3]) / 2)]));
    return out;
}
function kroneUrteil(fall, T, flipFrei, partien) {
    const v = [],
        m = {};
    for (const [ti, t] of T.entries()) {
        if ((t.kind !== "foliage" && t.kind !== "foliageTex") || !t.nor || !t.idx) continue;
        const P = t.pos,
            N = t.nor,
            I = t.idx;
        const pa = partien ? partien.get(ti) : null,
            mitten = pa && partien.mitten;
        const ohne = !partien ? 0 : pa ? pa.filter((x) => x < 0).length : P.length / 3;
        if (ohne) v.push(`${fall} ${t.kind}: ${ohne} Ecken ohne Partie (ohne Anker aCenter oder Blatt des Skeletts)`);
        const mn = [Infinity, Infinity, Infinity],
            mx = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < P.length; i += 3)
            for (let a = 0; a < 3; a++) {
                mn[a] = Math.min(mn[a], P[i + a]);
                mx[a] = Math.max(mx[a], P[i + a]);
            }
        const c0 = [0, 1, 2].map((a) => (mn[a] + mx[a]) / 2);
        let nah = 0,
            weg = 0;
        for (let k = 0; k < 8; k++) {
            const w0 = (k / 8) * 2 * Math.PI,
                e = [Math.cos(w0), 0.25, Math.sin(w0)];
            for (let q = 0; q + 2 < I.length; q += 3) {
                const a = I[q] * 3,
                    b = I[q + 1] * 3,
                    d = I[q + 2] * 3;
                const c = pa ? mitten.get(pa[I[q]]) : c0;
                if (!c) continue;
                const pc = [0, 1, 2].map((j) => (P[a + j] + P[b + j] + P[d + j]) / 3 - c[j]);
                if (pc[0] * e[0] + pc[1] * e[1] + pc[2] * e[2] <= 0) continue;
                nah++;
                const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]],
                    e2 = [P[d] - P[a], P[d + 1] - P[a + 1], P[d + 2] - P[a + 2]];
                const fl = kreuz(e1, e2);
                const vorn = fl[0] * e[0] + fl[1] * e[1] + fl[2] * e[2] > 0;
                const n = [0, 1, 2].map((j) => N[a + j] + N[b + j] + N[d + j]);
                const sg = flipFrei || vorn ? 1 : -1;
                // nach INNEN: die gelichtete Normale zeigt in die Krone (gegen die Lage des Dreiecks zur Mitte)
                if (sg * (n[0] * pc[0] + n[1] * pc[1] + n[2] * pc[2]) < 0) weg++;
            }
        }
        if (!nah) continue;
        const anteil = weg / nah;
        m["weg:" + t.kind] = anteil;
        if (anteil > KRONE_WEG_MAX)
            v.push(
                `${fall} ${t.kind}: ${(100 * anteil).toFixed(1)} % der nahen Dreiecke lichten nach innen (> ${100 * KRONE_WEG_MAX} %) — ` +
                    (!flipFrei ? "der Leser kehrt die Normale der Krone auf der Rückseite" : pa ? "die Krone lichtet nicht je Ast-Partie" : "die Krone trägt keine Normale der Krone") // prettier-ignore
            );
    }
    return { v, m };
}

// (F) DIE FRACHT — die GPU nachgerechnet: sRGB-Byte → linear je Texel, bilinear (clamp), alphaTest 0,5.
const FRACHT_MIN_ZELLE = 8;
const FRACHT_TOL = 0.03;
const LIN8 = Float64Array.from({ length: 256 }, (_, c) => srgbLin(c)); // die EINE sRGB-Kurve (abnahme-urteil)
// je Zelle: Deckung (Anteil der Proben über dem alphaTest) und die Luminanz des Lesers relativ zu Y(wert);
// `teilen`: der Leser teilt das gefilterte rgb durch alpha (die Welt), sonst liest er es gerade (das Labor, blutend).
function frachtStufe(m, wert, teilen) {
    const W = m.width,
        H = m.height,
        d = m.data,
        Z = W / 4;
    const yw = luma709(wert);
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
// wie der BC1-Pfad gelesen wird — true = geteilt (die Welt), false = gerade.
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
// (Z) DAS KANTEN-FLIMMERN der Laub-Karte in der Mittelsicht: die Zelle des Atlas als Karte auf dem Schirm
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
// (Z2) DAS FARB-KORN der Laub-Karte in der Mittelsicht: das Kanten-Korn (oben) misst die Deckung, das Bild
// der Welt flimmerte aber IN der Krone — Radeon, Ausgabe-Pfad, Eiche 25 m nur L1: Δ-Luma 3,41 je Pixel, davon 2,54 im
// Kronen-Inneren; dieselbe Krone mit flacher Farbe (Atlas-Alpha, ohne Atlas-rgb) 2,04, das Innere 0,97 (K20n10/g1). Der
// Täter ist das Detail der Atlas-FARBE unter zwei Pixeln. Messname: die Krone als Karte (wie oben), je voll deckendem
// Pixel die Luma der Farbe (rgb ÷ alpha, wie der Leser `_blattAtlasProbe`) über die Halton-Unterproben, die deckend
// sind; Farb-Korn = Σ|ΔL| / Σ L beim ½-Pixel-Versatz. Die Farbe liest ihre Stufe λ + Oktave (AnazhRealm.BLATT_FARBE_OKTAVE,
// aus dem Stamm gelesen), die Deckung λ. Ziel: Farb-Korn der Welt ≤ FARB_KORN_ANTEIL × Farb-Korn ohne Oktave.
const FARB_KORN_ANTEIL = 0.5;
function farbKornReihe(mips, zBasis) {
    const stufe = (m, c, u, v) => {
        const W = m.width,
            H = m.height,
            d = m.data;
        const x = ((c + u) / 4) * W - 0.5,
            y = v * H - 0.5;
        const x0 = Math.floor(x),
            y0 = Math.floor(y),
            fx = x - x0,
            fy = y - y0;
        let l = 0,
            a = 0;
        for (let q = 0; q < 4; q++) {
            const dx = q & 1,
                dy = q >> 1;
            const w = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy);
            const o = (Math.min(H - 1, Math.max(0, y0 + dy)) * W + Math.min(W - 1, Math.max(0, x0 + dx))) * 4;
            l += w * (0.2126 * LIN8[d[o]] + 0.7152 * LIN8[d[o + 1]] + 0.0722 * LIN8[d[o + 2]]);
            a += (w * d[o + 3]) / 255;
        }
        return [l, a];
    };
    const versatz = Math.log2(PC.BLATT_ATLAS_ZELLE / zBasis);
    const probe = (lam, c, u, v) => {
        const l = Math.max(0, lam - versatz),
            l0 = Math.min(mips.length - 1, Math.floor(l)),
            l1 = Math.min(mips.length - 1, l0 + 1),
            f = l - Math.floor(l);
        const p0 = stufe(mips[l0], c, u, v);
        if (l1 === l0 || f === 0) return p0;
        const p1 = stufe(mips[l1], c, u, v);
        return [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f];
    };
    return (lambda, oktave) => {
        const N = Math.max(4, Math.round(PC.BLATT_ATLAS_ZELLE / Math.pow(2, lambda)));
        const pixel = (px, py) => {
            let s = 0;
            for (const [hx, hy] of KORN_HALTON) {
                const u = (px + hx) / N,
                    v = (py + hy) / N;
                if (probe(lambda, 0, u, v)[1] < kornSchwelle()) return null; // nur voll deckende Pixel: das Innere
                const [l, a] = probe(lambda + oktave, 0, u, v);
                s += l / Math.max(a, 1e-3);
            }
            return s / KORN_HALTON.length;
        };
        let d = 0,
            summe = 0;
        for (let j = 0; j < N; j++)
            for (let i = 0; i < N; i++) {
                const l1 = pixel(i, j),
                    l2 = pixel(i + 0.5, j + 0.5);
                if (l1 == null || l2 == null) continue;
                d += Math.abs(l1 - l2);
                summe += (l1 + l2) / 2;
            }
        return summe > 0 ? d / summe : 0;
    };
}
function farbKornUrteil(fr, bcFmt, lambdaKrone, oktave) {
    const v = [],
        m = {};
    const bc = fr.bc.mips.map((x) => ({
        width: x.width,
        height: x.height,
        data: PC.bcDekodiere(x.data, x.width, x.height, bcFmt),
    }));
    for (const [fmt, mips] of [
        ["bc", bc],
        ["rgba", fr.rgba.mips],
    ]) {
        const r = farbKornReihe(mips, mips[0].width / 4);
        const ohne = r(lambdaKrone, 0),
            welt = r(lambdaKrone, oktave);
        m[fmt] = { ohne, welt };
        if (!(welt <= FARB_KORN_ANTEIL * ohne))
            v.push(
                `Farb-Korn ${fmt}: die Eichen-Krone auf 25 m (λ ${lambdaKrone.toFixed(2)}, Oktave ${oktave}) ${welt.toFixed(4)} > ${FARB_KORN_ANTEIL} × ${ohne.toFixed(4)} (ohne Oktave) — der Täter: _blattAtlasProbe liest die Farbe in der Stufe der Deckung`
            );
    }
    return { v, m };
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
// (H) DER HÖHEN-ZENSUS: die Welt-Höhe einer Art = Höhe der gelieferten L0 × Welt-Skala × Größe des Wald-Gesetzes
// (phyto-core forestTreeSize); der Altbestand sind die herrschenden Bäume (Größe p75 … p98 über die Bestandsdichte).
// Die Spannen der Natur (Steckbriefe; nordstern §4.5): Buche 30–45, Fichte 30–50, Stieleiche 15–35, Birke 15–25 m.
// H/D: Höhe durch den Stamm-Durchmesser in Brusthöhe (1,3 m Welt) — scale-frei, Bestand 40–100.
const HOEHE_SPANNE = { buche: [30, 45], fichte: [30, 50], eiche: [15, 35], birke: [15, 25] };
const HD_BESTAND = [40, 100];
function altbestandGroesse() {
    const rng = PC.mulberry32(0x2545f491);
    const s = [];
    for (let i = 0; i < 4000; i++) s.push(PC.forestTreeSize(rng, i / 4000));
    s.sort((x, y) => x - y);
    return [s[Math.floor(0.75 * s.length)], s[Math.floor(0.98 * s.length)]];
}
function brustDurchmesser(T, yWelt, skala) {
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
// DER SOLITÄR (K20, nordstern §4.5 „Solitär gedrungener", Soll-Bild Solitäreiche Marbach: tiefer Kronenansatz, kurzer dicker
// Stamm): die Gestalt mit FREISTAND (ov freistand, die Gestalt V der Welt) trägt höchstens SOLITAER_HD × das H/D ihres Bestands,
// und wo der Bestand seine Krone hebt (Kronenansatz ≥ 0,1 — der tiefste Nicht-Rinden-Punkt je Höhe), setzt ihre Krone
// mindestens 0,05 tiefer an (die Birke trägt schon im Bestand Zweige am Fuß).
const SOLITAER_HD = 0.6;
// Der Kronenansatz des Solitärs (tiefstes Blatt ÷ Höhe, Solitäreiche Marbach): tief, aber über einem kurzen Stamm —
// unter 0,08 steht die Krone als Busch auf dem Boden, über 0,35 trägt er den Bestands-Schaft.
const SOLITAER_ANSATZ = [0.08, 0.35];
function kronenAnsatz(T) {
    let lo = Infinity;
    for (const t of T) if (t.kind !== "bark") for (let i = 1; i < t.pos.length; i += 3) lo = Math.min(lo, t.pos[i]);
    return lo;
}
function solitaerUrteil(roh, skala) {
    const v = [],
        m = {};
    for (const art of Object.keys(HOEHE_SPANNE)) {
        const b = roh[`${art}-s1-L0`],
            f = roh[`${art}-s1-L0-frei`];
        if (!b || !f) {
            v.push(`Solitär ${art}: nicht gebaut`);
            continue;
        }
        const hB = hoehe(b.T) * skala(art),
            hF = hoehe(f.T) * skala(art);
        const dB = brustDurchmesser(b.T, 1.3, skala(art)),
            dF = brustDurchmesser(f.T, 1.3, skala(art));
        const hdB = dB > 0 ? hB / dB : 0,
            hdF = dF > 0 ? hF / dF : Infinity;
        const kaB = kronenAnsatz(b.T) / hoehe(b.T),
            kaF = kronenAnsatz(f.T) / hoehe(f.T);
        m[art] =
            `${hF.toFixed(1)} m · H/D ${hdF.toFixed(0)} (Bestand ${hdB.toFixed(0)}) · Kronenansatz ${kaF.toFixed(2)} (Bestand ${kaB.toFixed(2)})`;
        if (!(hdF <= SOLITAER_HD * hdB))
            v.push(
                `Solitär ${art}: H/D ${hdF.toFixed(0)} nicht gedrungen (Bestand ${hdB.toFixed(0)}, Soll ≤ ${(SOLITAER_HD * hdB).toFixed(0)})`
            );
        if (!(kaF >= SOLITAER_ANSATZ[0] && kaF <= SOLITAER_ANSATZ[1]))
            v.push(
                `Solitär ${art}: Kronenansatz ${kaF.toFixed(2)} ausserhalb ${SOLITAER_ANSATZ.join("–")} (${kaF < SOLITAER_ANSATZ[0] ? "kein Stamm unter der Krone" : "die Krone sitzt hoch"})`
            );
    }
    return { v, m };
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
        const D = brustDurchmesser(f.T, 1.3, skala(art));
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
// (H) DIE KRONE DES PFLANZ-GESETZES (T2): der Abstand des Walds liest die gewachsene Krone (phyto-core FOREST_PACK.crown) — je
// Laub-Art der Tafel der sichtbare L0-Radius (Gestalt 1: Karten-Stichproben mit Atlas-Alpha ≥ 0,5, halbe Breite über 8 Azimute
// × Welt-Skala) binnen ±12 %; die Kegel-Krone der Koniferen ist ein eigenes Gesetz.
const KRONE_W = [0, 1, 2, 3, 4, 5, 6].flatMap((s) => [...Array(7 - s).keys()].map((r) => [1 - (s + r) / 6, s / 6, r / 6]));
function pflanzKroneUrteil(roh, skala, a, nadel) {
    const v = [], m = {}, px = (u, n) => Math.min(n - 1, Math.max(0, Math.floor(u * n))); // prettier-ignore
    for (const [art, soll] of Object.entries(PC.FOREST_PACK.crown)) {
        const f = roh[`${art}-s1-L0`], lo = Array(8).fill(Infinity), hi = Array(8).fill(-Infinity); // prettier-ignore
        if (nadel(art) || !f) continue;
        for (const t of f.T.filter((t) => t.kind === "foliageTex"))
            for (let i = 0; i < t.idx.length; i += 3)
                for (const w of KRONE_W) {
                    const at = (A, n, j) => w[0] * A[t.idx[i] * n + j] + w[1] * A[t.idx[i + 1] * n + j] + w[2] * A[t.idx[i + 2] * n + j]; // prettier-ignore
                    if (a.data[(px(at(t.uv, 2, 1), a.height) * a.width + px(at(t.uv, 2, 0), a.width)) * 4 + 3] < 128) continue;
                    for (let k = 0, u; k < 8; k++)
                        (u = at(t.pos, 3, 0) * Math.cos((k * Math.PI) / 8) + at(t.pos, 3, 2) * Math.sin((k * Math.PI) / 8)), (lo[k] = Math.min(lo[k], u)), (hi[k] = Math.max(hi[k], u)); // prettier-ignore
                }
        const ist = (hi.reduce((q, h, k) => q + h - lo[k], 0) / 16) * skala(art);
        m[art] = `${ist.toFixed(2)} m (Tafel ${soll})`;
        if (!(Math.abs(ist / soll - 1) <= 0.12)) v.push(`Krone ${art}: gewachsen ${ist.toFixed(2)} m, Tafel ${soll} m`);
    }
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


// (WI) DER WIND — das Wind-Gesetz des Kerns (phyto-core WIND_GESETZ · windSchlankheit · windAusschlag) gegen die gelieferte
// Gestalt und seine Leser:
//   f0   je Baum-Art (L0, Gestalt 1): f0 = kF · D / H² mit D = Stamm-Durchmesser in 1,3 m Welt-Höhe (der Ring des Stamm-
//        Strangs, gemessen von DIESER Linse) und H = Welt-Höhe — gegen das f0, das der Welt-Stoff rechnet (kF · δ / H, δ aus
//        der gelieferten Gestalt über `windSchlankheit`, den Leser von `_baumWindDaten`): ± F0_TOL.
//   GLIED der Ausschlag je Glied (Stamm-Spitze, Ast-Hebel, Blatt) über 20 s: Sturm (Wind-Zeile 1) zu Brise (0,06) ≥ STURM_BRISE,
//        und die Leiter der Frequenzen Stamm < Ast < Blatt.
const F0_TOL = 0.3;
const STURM_BRISE = 3;
function stammDurchmesser(T, yT) {
    const S = stammRinge(T);
    if (!S) return null;
    let best = null;
    for (const x of S.ringe) if (!best || Math.abs(x.y - yT) < Math.abs(best.y - yT)) best = x;
    const p = S.t.pos;
    let cx = 0,
        cz = 0;
    const n = S.R1 - 1;
    for (let j = 0; j < n; j++) {
        cx += p[(best.r * S.R1 + j) * 3];
        cz += p[(best.r * S.R1 + j) * 3 + 2];
    }
    cx /= n;
    cz /= n;
    let r = 0;
    for (let j = 0; j < n; j++) r += Math.hypot(p[(best.r * S.R1 + j) * 3] - cx, p[(best.r * S.R1 + j) * 3 + 2] - cz);
    return (2 * r) / n;
}
function gliedAusschlag(f0, H, U) {
    const A = PC.WIND_ZAHLEN;
    const m = { stamm: 0, ast: 0, blatt: 0 };
    for (let t = 0; t < 20; t += 0.005) {
        const e = { t, U, g: 1, f0, H, zeta: 1, rho: 0, phi: 0, psi: 1 };
        const s = PC.windAusschlag(A, e, true);
        const a = PC.windAusschlag(A, Object.assign({}, e, { zeta: 0.8, rho: 0.3 }), true);
        const s8 = PC.windAusschlag(A, Object.assign({}, e, { zeta: 0.8 }), true);
        m.stamm = Math.max(m.stamm, Math.abs(s.quer));
        m.ast = Math.max(m.ast, Math.hypot(a.quer - s8.quer, a.hoch - s8.hoch));
        m.blatt = Math.max(m.blatt, Math.abs(s.flattern));
    }
    return m;
}
// `deltaMul` (Selbsttest): eine Welt, die ein falsches δ liest.
function windUrteil(fall, T, skala, deltaMul) {
    const v = [];
    const H = hoehe(T) * skala;
    const D = stammDurchmesser(T, 1.3 / skala);
    if (!(D > 0)) return { v: [`${fall}: kein Stamm-Strang für den Wind`], m: {} };
    const Dw = D * skala;
    const W = PC.WIND_GESETZ;
    const f0mess = (W.kF * Dw) / (H * H);
    const rinde = T.find((t) => t.kind === "bark");
    const dWelt = PC.windSchlankheit(rinde && rinde.pos, hoehe(T), skala);
    if (!(dWelt > 0)) return { v: [`${fall}: die Welt findet keinen Stamm-Ring (windSchlankheit)`], m: {} };
    const f0welt = (W.kF * dWelt * (deltaMul || 1)) / H;
    if (Math.abs(f0welt / f0mess - 1) > F0_TOL)
        v.push(
            `${fall}: f0 der Welt ${f0welt.toFixed(2)} Hz ≠ Gesetz ${f0mess.toFixed(2)} Hz (D ${Dw.toFixed(2)} m, H ${H.toFixed(1)} m)`
        );
    const sturm = gliedAusschlag(f0welt, H, 1);
    const brise = gliedAusschlag(f0welt, H, 0.06);
    for (const g of ["stamm", "ast", "blatt"])
        if (!(sturm[g] >= STURM_BRISE * brise[g]))
            v.push(
                `${fall}: ${g} im Sturm ${sturm[g].toFixed(3)} m nur ${(sturm[g] / brise[g]).toFixed(2)}× die Brise`
            );
    const fAst = W.ast.faktor * f0welt,
        fBl = Math.max(W.blatt.f, W.blatt.ueberAst * fAst);
    if (!(f0welt < fAst && fAst < fBl)) v.push(`${fall}: Leiter Stamm < Ast < Blatt gebrochen`);
    return {
        v,
        m: {
            f0: f0welt,
            f0Gesetz: f0mess,
            "Stamm Sturm/Brise m": `${sturm.stamm.toFixed(3)}/${brise.stamm.toFixed(4)}`,
            "Blatt Sturm/Brise m": `${sturm.blatt.toFixed(3)}/${brise.blatt.toFixed(4)}`,
        },
    };
}

hauptLauf(async () => {
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
        const fall = async (presetId, lod, seed, ov) => {
            const k = `${presetId}-s${seed}-L${lod}${ov ? "-frei" : ""}`;
            const msg = { presetId, lod, seed, season: "summer" };
            if (ov) msg.ov = ov;
            roh[k] = { presetId, lod, seed, ov, T: teile((await build(msg)).meshes) };
        };
        for (const p of baeume) await fall(p, 0, 1);
        for (const p of Object.keys(HOEHE_SPANNE)) await fall(p, 0, 1, { freistand: 1 });
        for (const p of baeume) await fall(p, 1, 1);
        await fall("birke", 0, 2);
        for (const p of Object.keys(buch).filter((x) => art(x) === "shrub"))
            for (const l of [0, 1]) await fall(p, l, 1);
        for (const p of Object.keys(buch).filter((x) => art(x) === "flower"))
            for (const s of [1, 2]) await fall(p, 0, s);
        // (T) jede gelieferte Gras-Stufe, beide Gestalten der Nah-Wiese
        for (const p of Object.keys(buch).filter((x) => art(x) === "grass"))
            for (const l of rc.lod.kindStages.grass) for (const s of [1, 2]) await fall(p, l, s);
    });
    const pl = rc.placement || {};
    // Die Welt-Skala der Art: placement.scale, der Wald-Zusatzfaktor treeScaleMul NUR für Bäume (foundry-core).
    const skala = (p) => (pl.scale && pl.scale[p]) * (buch[p] && buch[p].kind === "tree" ? pl.treeScaleMul || 1 : 1);
    const zeilen = [];
    const ergebnis = {};
    for (const [k, f] of Object.entries(roh)) {
        const kind = buch[f.presetId].kind;
        // Rinde und Nadel-Art sind der Phänotyp der Art (K24: phyto-core artPhaenotyp aus Reglern und Phänotyp-Zeile).
        const ph = kind === "tree" || kind === "shrub" ? PC.artPhaenotyp(buch[f.presetId].s, buch[f.presetId]) : {};
        let u = { v: [], m: {} };
        const trauerArt = buch[f.presetId].s && buch[f.presetId].s.trop >= 0.55;
        if (kind === "tree" && f.lod === 1) u = klingenL1(k, f.T);
        else if (kind === "tree") {
            u = rindeUrteil(k, f.T, ph.barkType, f.presetId !== "totholz");
            if (f.seed === 1) {
                const w = windUrteil(k, f.T, skala(f.presetId));
                u.v.push(...w.v);
                Object.assign(u.m, w.m);
            }
            // Die Trauer-L0 trägt Strähnen (gestreckte Zellen) — ihr Blatt-Maß ist kein Karten-Maß.
            const trauer = buch[f.presetId].s && buch[f.presetId].s.trop >= 0.55;
            if (!trauer && f.T.some((t) => t.kind === "foliageTex")) {
                const b = ph.conifer ? nadelMass(k, f.T, skala(f.presetId)) : blattMass(k, f.T, skala(f.presetId));
                u.v.push(...b.v);
                Object.assign(u.m, b.m);
            }
        } else if (kind === "shrub") {
            u = strauchUrteil(k, f.T);
            const b = blattMass(k, f.T, skala(f.presetId), PC.ZWEIG_GROSS);
            u.v.push(...b.v);
            Object.assign(u.m, b.m);
        } else if (kind === "flower") u = bluetenUrteil(k, f.T);
        else if (kind === "grass") {
            u = teppichUrteil(k, f.T, f.lod, rc.understory.grassStep, skala(f.presetId));
            u.v.push(...halmUrteil(k, f.T.find((x) => x.kind === "grass"), rc, f.lod, skala(f.presetId)));
        }
        if (kind === "tree" || kind === "shrub") {
            const kv = kroneUrteil(k, f.T, true, partienDerKrone(f, buch[f.presetId], skala(f.presetId)));
            u.v.push(...kv.v);
            Object.assign(u.m, kv.m);
        }
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
    console.log("Pflanzen-Nahbild (gelieferte Puffer, Welt-Gestalt):\n" + zeilen.join("\n"));
    // (Q) der Pixel als Filter des Halms
    const hp = halmPixelUrteil();
    fails.push(...hp);
    console.log("Halm-Filter (Rippe · Ader, Armlänge ↔ fern): " + (hp.join(" · ") || "Detail je Pixel"));
    // (F) die Fracht je Format gegen das Labor, und der EINE Leser in der Quelle.
    const fracht = frachtReihen(bild);
    fails.push(...frachtUrteil(fracht));
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
        const fk = farbKornUrteil(frK, frK.bc.format || "bc1", lamKrone, OKTAVE);
        fails.push(...fk.v);
        console.log(
            `Farb-Korn (Σ|ΔL|/ΣL im Kronen-Inneren, ½-Pixel-Versatz; Oktave ${OKTAVE}): ` +
                Object.entries(fk.m)
                    .map(([f, x]) => `${f} ${x.welt.toFixed(4)} (ohne Oktave ${x.ohne.toFixed(4)})`)
                    .join(" · ") +
                ` — Ziel ≤ ${FARB_KORN_ANTEIL} × ohne`
        );
    }

    // (H) der Höhen-Zensus je Art gegen die Spanne der Natur, und H/D.
    const hz = hoehenUrteil(roh, skala);
    fails.push(...hz.v);
    const nadel = (p) => !buch[p] || PC.artPhaenotyp(buch[p].s, buch[p]).conifer, pk = pflanzKroneUrteil(roh, skala, bild.mips[0], nadel); // prettier-ignore
    fails.push(...pk.v);
    console.log(`Krone des Pflanz-Gesetzes (Laub, L0 Gestalt 1): ${Object.entries(pk.m).map((e) => e.join(" ")).join(" · ")}`);
    const so = solitaerUrteil(roh, skala);
    fails.push(...so.v);
    console.log(
        "Solitär (FREISTAND, Größe 1):\n" +
            Object.keys(HOEHE_SPANNE)
                .map((a) => `  ${a}: ${so.m[a] || "—"}`)
                .join("\n")
    );
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
    // (V) die Normale der Krone nach innen (gekehrt), der kehrende Leser, der Welt-Stoff mit Seite, die Kuppel des Wirts zurück
    if (tanne) {
        const innen = tanne.T.map((t) =>
            (t.kind === "foliage" || t.kind === "foliageTex") && t.nor ? Object.assign({}, t, { nor: t.nor.map((x) => -x) }) : t
        );
        st.push(["Krone nach innen", kroneUrteil("innen", innen, true).v.length > 0]);
        st.push(["Leser kehrt die Krone", kroneUrteil("kehrt", tanne.T, false).v.length > 0]);
    } else st.push(["Tanne gebaut", false]);
    // (V) die Laubkrone als EINE gelichtet (K68, vor T2): dieselben Karten der Eiche, ihre Normalen neu aus dem einen Ellipsoid
    if (eiche) {
        const eine = eiche.T.map((t) => ((t.kind === "foliage" || t.kind === "foliageTex") && t.nor ? Object.assign({}, t, { nor: Float32Array.from(t.nor) }) : t)); // prettier-ignore
        PC.kronenNormalen(eine.filter((t) => t.kind === "foliage" || t.kind === "foliageTex").map((t) => ({ pos: Float32Array.from(t.pos), nor: t.nor })));
        const pa = partienDerKrone(eiche, buch.eiche, skala("eiche"));
        st.push(["Laubkrone als EINE gelichtet", !!pa && kroneUrteil("eine", eine, true, pa).v.length > 0]);
    } else st.push(["Eiche gebaut", false]);
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
    // (H) an kranken Kopien des Zensus: die Buche gestaucht auf 0,6 ihrer Höhe (der Wald von gestern, 18–27 m) und
    // ihr Stamm in x/z × 4 (der Stamm vor dem Welt-Maß, H/D 15) — beide MÜSSEN die Buche beim Namen nennen.
    {
        const verzerrt = (T, ky, kxz) =>
            T.map((t) => {
                if (!t.pos) return t;
                const p = Float32Array.from(t.pos);
                for (let i = 0; i < p.length; i += 3) {
                    p[i] *= kxz;
                    p[i + 1] *= ky;
                    p[i + 2] *= kxz;
                }
                return Object.assign({}, t, { pos: p });
            });
        const krank = (ky, kxz) => {
            const r2 = Object.assign({}, roh);
            if (roh["buche-s1-L0"])
                r2["buche-s1-L0"] = Object.assign({}, roh["buche-s1-L0"], {
                    T: verzerrt(roh["buche-s1-L0"].T, ky, kxz),
                });
            return hoehenUrteil(r2, skala).v;
        };
        st.push(["Höhe gestaucht (Buche × 0,6)", krank(0.6, 1).some((x) => /^Höhe buche:/.test(x))]);
        st.push(["Stamm × 4 (Buche H/D)", krank(1, 4).some((x) => /^H\/D buche:/.test(x))]);
        const rk = Object.assign({}, roh, { "eiche-s1-L0": { T: verzerrt(roh["eiche-s1-L0"].T, 1, 1.4) } });
        st.push(["Krone × 1,4 (Eiche)", pflanzKroneUrteil(rk, skala, bild.mips[0], nadel).v.some((x) => /^Krone eiche:/.test(x))]);
        // der kranke Solitär: die Bestandsgestalt an seiner Stelle (FREISTAND ungelesen) muss beim Namen feuern
        const r3 = Object.assign({}, roh);
        if (roh["eiche-s1-L0"]) r3["eiche-s1-L0-frei"] = roh["eiche-s1-L0"];
        st.push(["Solitär = Bestand (Eiche)", solitaerUrteil(r3, skala).v.some((x) => /^Solitär eiche:/.test(x))]);
        // der Busch-Solitär: die Krone des Solitärs auf den Boden gesenkt (kein Stamm unter ihr) muss beim Namen feuern
        const fr = roh["eiche-s1-L0-frei"];
        if (fr) {
            const lo = kronenAnsatz(fr.T);
            const T = fr.T.map((t) =>
                t.kind === "bark"
                    ? t
                    : Object.assign({}, t, { pos: Array.from(t.pos, (v, i) => (i % 3 === 1 ? v - lo : v)) })
            );
            const r4 = Object.assign({}, roh, { "eiche-s1-L0-frei": Object.assign({}, fr, { T }) });
            st.push([
                "Busch-Solitär (Eiche)",
                solitaerUrteil(r4, skala).v.some((x) => /^Solitär eiche: Kronenansatz .*kein Stamm/.test(x)),
            ]);
        }
    }
    if (eiche)
        st.push(["Welt-δ ×0,5 (f0 gegen das Gesetz)", windUrteil("halb", eiche.T, skala("eiche"), 0.5).v.length > 0]);
    // (T) der Büschel auf 30 % seiner Weite gestaucht (das Bild vor K56: 0,15 m auf dem 0,72-m-Raster)
    const gras1 = roh["gras-s1-L1"];
    if (gras1) {
        const T = gras1.T.map((t) => {
            const p = Float32Array.from(t.pos);
            for (let i = 0; i < p.length; i += 3) (p[i] *= 0.3), (p[i + 2] *= 0.3);
            return Object.assign({}, t, { pos: p });
        });
        st.push([
            "Büschel gestaucht (0,3)",
            teppichUrteil("gestaucht", T, 1, rc.understory.grassStep, skala("gras")).v.length > 0,
        ]);
        // (T) die Fußzeile jedes zweiten Halms um ein Zehntel der Büschel-Höhe angehoben (das Bild vor K70: der Fuß eine
        // Segment-Länge über dem Grund, je Halm nach seiner Länge — der Ofen setzt nur den tiefsten auf 0)
        const hiG = hoehe(gras1.T);
        let n = 0;
        const hoch = gras1.T.map((t) => {
            const p = Float32Array.from(t.pos);
            for (let k = 0; k < p.length / 3; k++) if (halmFuss(t, k) && Math.floor(n++ / 2) % 2) p[k * 3 + 1] += hiG * 0.1;
            return Object.assign({}, t, { pos: p });
        });
        st.push([
            "Halm schwebt (+0,1)",
            teppichUrteil("schwebt", hoch, 1, rc.understory.grassStep, skala("gras")).v.some((x) => /schwebt/.test(x)),
        ]);
        // (Q) der Halm an kranken Kopien — die Narbe × 2, die alte Quer-Koordinate 0…1, die gestutzte Spitze, die Ährchen × 8
        // breit (das Fähnchen) — und die Rippe ohne Filter
        const g = gras1.T.find((x) => x.kind === "grass");
        const q = (fn) => {
            const k = { ...g, uv: g.uv.slice(), pos: g.pos.slice() };
            fn(k.uv, k.pos);
            return halmUrteil("krank", k, rc, 1, skala("gras")).length > 0;
        };
        st.push(
            ["Narbe × 2", q((uv) => uv.forEach((x, i) => i % 2 && (uv[i] = 2 * x)))],
            ["Quer 0…1", q((uv) => uv.forEach((x, i) => i % 2 || (uv[i] = x < 0 ? 0 : 1)))],
            ["Spitze gestutzt", q((uv) => uv.forEach((x, i) => i % 2 || x || (uv[i] = 1e-3)))],
            ["Fähnchen-Ähre", q((uv, P) => g.idx.forEach((j, i) => g.cen[j * 3 + 1] && uv[j * 2] > 0 && [0, 1, 2].forEach((x) => (P[j * 3 + x] += 7 * (P[j * 3 + x] - P[g.idx[i - (i % 3)] * 3 + x])))))], // prettier-ignore
            ["Filter aus", halmPixelUrteil((Z, u) => PC.halmQuer(Z, u, 0)).length > 0]
        );
    } else st.push(["Gras-Fall fehlt", false]);
    console.log("Selbsttest: " + st.map(([n, ok]) => `${n} ${ok ? "✅" : "❌"}`).join(" · "));
    if (st.some(([, ok]) => !ok)) fails.push("Selbsttest der Pflanzen-Linse feuert nicht");

    console.log(
        "=== PFLANZEN-NAHBILD — Rinde · Gitter · Strauch · Blüte · Blatt- und Nadel-Maß · L1-Krone · Fracht · Wind · Teppich · Halm ==="
    );
    wandEnde(fails, `${Object.keys(roh).length} Fälle.`);
});
