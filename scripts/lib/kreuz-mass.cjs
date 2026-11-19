// kreuz-mass.cjs — DAS KREUZ VOR DER SCHEIBE (licht-eine-skala): steht das Fenster-Kreuz dunkel vor der leuchtenden
// Scheibe? Ein Bild-Maß auf der 8-Bit-Ausgabe, ohne Welt.
//
//   Luma   je Pixel Rec.709 der 8-Bit-Werte ÷ 255 (abnahme-urteil `luma709`, die EINE Luma der Linsen)
//   Median je Pixel der Median seines FENSTER×FENSTER-Fensters (der Rand von FENSTER/2 Pixeln zählt nicht)
//   MASKE  „Scheibe“ = jedes Pixel, dessen Median ≥ SCHEIBE_AB ist — dort leuchtet die Umgebung, das Kreuz ist dünner
//          als das halbe Fenster und fällt aus dem Median
//   Wert   d = (Median − L) / Median — wie tief das Pixel unter seiner leuchtenden Umgebung steht (Kreuz heller: d < 0)
//   Maß    das Mittel der stärksten ANTEIL der d (mindestens eines)
//
// Die Ratsche 0,307 (haus/dorf-nacht-sprosse) gilt an DIESER Maske; die ältere Zahl 0,168 stammt von einer anderen Maske
// und ist kein Widerspruch. n = 0 (keine Scheibe im Bild) ist ROT beim Aufrufer, nie ein stiller Wert — `mass` ist dann null.
//
//   kreuzMass({ W, H, u8 }, { fenster, scheibeAb, anteil }?) → { mass, n }     (u8 RGBA, wie abnahme-urteil `pngLesen`)
"use strict";
const { luma709 } = require("./abnahme-urteil.cjs");

const FENSTER = 13;
const SCHEIBE_AB = 0.45;
const ANTEIL = 0.05;

function kreuzMass({ W, H, u8 }, { fenster = FENSTER, scheibeAb = SCHEIBE_AB, anteil = ANTEIL } = {}) {
    const ch = u8.length / (W * H);
    const L = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) L[p] = luma709(u8, p * ch) / 255;
    const r = fenster >> 1;
    const fen = new Float32Array(fenster * fenster);
    const mitte = (fen.length - 1) >> 1;
    const ds = [];
    for (let y = r; y < H - r; y++)
        for (let x = r; x < W - r; x++) {
            // der Median liegt genau dann ≥ scheibeAb, wenn mindestens (Fenster − mitte) Werte es tun — erst zählen, nur
            // die Scheibe sortiert (dasselbe Maß, die dunkle Fläche kostet keine Sortierung)
            let k = 0,
                hell = 0;
            for (let j = -r; j <= r; j++)
                for (let i = -r; i <= r; i++) {
                    const v = (fen[k++] = L[(y + j) * W + x + i]);
                    if (v >= scheibeAb) hell++;
                }
            if (hell < fen.length - mitte) continue;
            const m = fen.sort()[mitte];
            ds.push((m - L[y * W + x]) / m);
        }
    if (!ds.length) return { mass: null, n: 0 };
    ds.sort((a, b) => b - a);
    const k = Math.max(1, Math.floor(ds.length * anteil));
    let s = 0;
    for (let i = 0; i < k; i++) s += ds[i];
    return { mass: s / k, n: ds.length };
}

module.exports = { kreuzMass, FENSTER, SCHEIBE_AB, ANTEIL };
