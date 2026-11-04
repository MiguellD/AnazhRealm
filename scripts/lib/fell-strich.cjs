// fell-strich.cjs — DER STRICH DES SCHALEN-FELLS AUS DER GEOMETRIE (haar.K1, w10-figur): das Rechenmodell der Fell-Schale ohne GPU.
// Eine Haut-Ebene, schief im Raster der Wurzeln (nie achsparallel), Blick senkrecht; je Pixel der Szene (Skala 0,75, die EINE
// Skala `SZENE_SKALA`) 3 × 3 Proben, je Probe die oberste Schale t = s/6 (s = 5 … 1, die äußerste fällt im Ofen), deren Locke
// das Gesetz trägt — die Wurzel unter ihr um den Lean der Schale längs des Kamms versetzt (foundry-core TIER_FELL.kamm 0,6 × Länge
// × t²) —, ihr Ton Wurzel → Spitze (FELL_SCHALE); das Bild bilinear auf die Ausgabe und in sRGB, der Strich aus abnahme-urteil
// `klassenMasse` (derselbe Tensor wie die Station). Die Locke selbst ist die Referenz des Kerns (tetrapoda `fellLocke`), nie
// eine Kopie. Das Raster aus dem Guss des Wolfs (Wurzel × 79,2 Zellen je Einheit, Dichte-Median 1,21, Länge ~4 Zellen);
// Arm 0,7 m: ~3 Pixel der Ausgabe je Zelle, Third 4 m: ~0,7. Das Modell zeigt nur das Fell — Licht, Muster und Umriss fehlen:
// es liest den Hebel des Gesetzes. Geeicht am Verhältnis: rund → Strich 4 hob das Modell ×1,53, die Radeon 0,28 → 0,43 (×1,53);
// die Radeon liest ~0,85 × Modell.
"use strict";
const { klassenMasse } = require("./abnahme-urteil.cjs");

const SKALA = 0.75;
const LAGE_KAMM = 0.6; // foundry-core TIER_FELL.kamm (der Lean zur Spitze × Länge)
const srgb = (v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.min(1, v), 1 / 2.4) - 0.055));

// o: { K (tetrapoda-Kern), gesetz (frei: ein anderes FELL_SCHALE), zellenJePx, lenZ, kammWinkel, n, dichte, off }
function fellBild(o) {
    const K = o.K;
    const FS = o.gesetz || K.FELL_SCHALE;
    const n = o.n || 160,
        nr = Math.round(n * SKALA),
        zpr = o.zellenJePx / SKALA,
        SS = 3;
    const N = [0.31, 0.22, 0.92].map((v, _i, a) => v / Math.hypot(...a));
    const e1 = [N[1], -N[0], 0].map((v, _i, a) => v / Math.hypot(...a));
    const e2 = [N[1] * e1[2] - N[2] * e1[1], N[2] * e1[0] - N[0] * e1[2], N[0] * e1[1] - N[1] * e1[0]];
    const a = o.kammWinkel || 0;
    const kamm = e1.map((v, i) => Math.cos(a) * v + Math.sin(a) * e2[i]);
    const off = o.off || [37.3, 11.7, 5.1];
    const lin = new Float32Array(nr * nr);
    for (let y = 0; y < nr; y++)
        for (let x = 0; x < nr; x++) {
            let acc = 0;
            for (let sy = 0; sy < SS; sy++)
                for (let sx = 0; sx < SS; sx++) {
                    const u = (x + (sx + 0.5) / SS) * zpr,
                        v = (y + (sy + 0.5) / SS) * zpr;
                    let c = FS.wurzel * 0.9; // die Haut unter dem Fell
                    for (let s = 5; s >= 1; s--) {
                        const t = s / 6,
                            lk = (o.lenZ || 4) * t * t * LAGE_KAMM;
                        const w = [0, 1, 2].map((i) => off[i] + u * e1[i] + v * e2[i] - kamm[i] * lk);
                        if (K.fellLocke(w, t, o.dichte || 1.21, kamm, o.gesetz)) {
                            c = FS.wurzel + (FS.spitze - FS.wurzel) * t;
                            break;
                        }
                    }
                    acc += c;
                }
            lin[y * nr + x] = (acc / (SS * SS)) * 0.18;
        }
    const u8 = new Uint8Array(n * n * 4),
        m = new Uint8Array(n * n);
    const L = (i, j) => lin[Math.min(nr - 1, j) * nr + Math.min(nr - 1, i)];
    for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
            const fx = Math.max(0, (x + 0.5) * SKALA - 0.5),
                fy = Math.max(0, (y + 0.5) * SKALA - 0.5);
            const x0 = Math.floor(fx),
                y0 = Math.floor(fy),
                ax = fx - x0,
                ay = fy - y0;
            const v = (1 - ax) * (1 - ay) * L(x0, y0) + ax * (1 - ay) * L(x0 + 1, y0) + (1 - ax) * ay * L(x0, y0 + 1) + ax * ay * L(x0 + 1, y0 + 1);
            const g = srgb(v),
                p = y * n + x;
            u8[p * 4] = g;
            u8[p * 4 + 1] = Math.round(g * 0.8);
            u8[p * 4 + 2] = Math.round(g * 0.6);
            u8[p * 4 + 3] = 255;
            m[p] = x > 2 && y > 2 && x < n - 3 && y < n - 3 ? 1 : 0;
        }
    return { u8, m, n };
}
// der Strich je Abstand: das Mittel über vier Kamm-Richtungen
function fellStrich(o) {
    let s = 0;
    const W = [0.2, 0.9, 1.6, 2.4];
    for (const a of W) {
        const b = fellBild(Object.assign({}, o, { kammWinkel: a }));
        s += klassenMasse(b.u8, b.m, b.n, b.n).strich;
    }
    return +(s / W.length).toFixed(4);
}
module.exports = { fellBild, fellStrich, ZELLEN_JE_PX: { arm: 1 / 3.0, third: 1 / 0.69 }, RADEON_JE_MODELL: 0.85 };
