// KANDIDAT (Bahn mischwald, Richter-Sache): ein Leser für karte2.leben.pflanzen.lebenslauf S1 „Höhenhistogramm aus dem Bild gegen
// Ertragstafel“ (`hoehenAbstand`, heute ohneZahl; der Vorschlag der Station: Kolmogorow-Smirnow-Abstand ≤ 0,15). Die Station
// selbst bleibt unberührt. Der Leser misst, was im Bestand steht, gegen die TAFEL — nicht gegen das Pflanz-Gesetz:
//   gemessen: die Höhen des Dachs (die Darts des Wald-Fadens im Kreis lokalM, Höhe = s · hoeheM der Art; der Unterstand
//             `alter` < 1 ist eine jüngere Kohorte unter dem Schirm, das Totholz steht nicht in der Tafel);
//   die Referenz: der Normalwald der Ertragstafel je Art (WBR 86 Tab. 3, Niedersachsen — phyto-core FOREST_ERTRAG.kurven):
//             das Alter gleichverteilt über die Tafel ab der Höhe, in der der Wald zeichnet, die Stammzahl je Alter nach Reineke
//             (N ∝ D^−1,605, D ∝ h: die Gestalt skaliert isometrisch), gemischt nach dem Anteil der Art im Dach;
//   der Abstand: KS = max |F_gemessen − F_Tafel| über die Höhe.
// Zusätzlich `reinekeSteigung` (Sprosse S3 „gegen Ertragstafel“ fasst die Stammzahl): log N gegen log Dq über die Phasen der
// Flecken (phyto-core forestFleckPhase), N je ha Fleck-Fläche.
// Gemessen (Bahn mischwald, die Darts des Wald-Fadens um die Mess-Wiese −280,4/−1045,6, swiftshader-Welt; scratch cand-test):
//   Kreis 150 m (der Kreis der Station): KS 0,293 → 0,142 · Reineke ohne Bezug (+17,4) → −1,83 (9 Klassen, wenige Flecken)
//   Fenster 480 × 480 m (23 ha):         KS 0,289 → 0,059 · Reineke ohne Bezug (−11,6) → −1,454 (Band −1,766…−1,445)
"use strict";
function hoehenAbstand(darts, PC) {
    const HM = {};
    for (const [a, k] of Object.entries(PC.FOREST_ERTRAG.kurven)) HM[a] = k.hoeheM;
    const dach = darts.filter((d) => d.sp !== "baum_totholz" && !(d.alter < 1) && PC.forestErtragKurve(d.sp));
    if (dach.length < 30) return { hoehenAbstand: null, nicht: "nur " + dach.length + " Bäume im Dach" };
    const h = dach.map((d) => d.s * HM[PC.forestErtragKurve(d.sp).name]).sort((a, b) => a - b);
    // die Referenz je Art: Alter in 1-a-Schritten über [A0, Aend], Gewicht h^−1,605, die Art nach ihrem Anteil
    const anteil = new Map();
    for (const d of dach) {
        const n = PC.forestErtragKurve(d.sp).name;
        anteil.set(n, (anteil.get(n) || 0) + 1 / dach.length);
    }
    const ref = [];
    for (const [n, w] of anteil) {
        const K = PC.forestErtragKurve("baum_" + n) || PC.forestErtragKurve(n);
        const pts = [];
        for (let A = K.a0; A <= K.aEnd; A += 1) pts.push(K.R(A) * HM[n]);
        const g = pts.map((x) => Math.pow(x, -1.605));
        const G = g.reduce((s, v) => s + v, 0);
        pts.forEach((x, i) => ref.push([x, (w * g[i]) / G]));
    }
    ref.sort((a, b) => a[0] - b[0]);
    const Fref = (x) => {
        let s = 0;
        for (const [v, w] of ref) if (v <= x) s += w; else break;
        return s;
    };
    let ks = 0;
    for (let i = 0; i < h.length; i++) ks = Math.max(ks, Math.abs((i + 1) / h.length - Fref(h[i])), Math.abs(i / h.length - Fref(h[i] - 1e-9)));
    return { hoehenAbstand: ks, baeumeDach: h.length };
}
function reinekeSteigung(darts, PC, seedInt, flaeche) {
    const NB = 10;
    const n = new Float64Array(NB);
    const d2 = new Float64Array(NB);
    for (const d of darts) {
        if (d.sp === "baum_totholz" || d.alter < 1 || !PC.forestErtragKurve(d.sp)) continue;
        const k = Math.min(NB - 1, Math.floor(PC.forestFleckPhase(d.x, d.z, seedInt) * NB));
        n[k]++;
        d2[k] += d.s * d.s;
    }
    const P = [];
    for (let k = 0; k < NB; k++) if (n[k] > 10 && flaeche[k] > 0) P.push([Math.log10(Math.sqrt(d2[k] / n[k])), Math.log10(n[k] / (flaeche[k] / 1e4))]);
    const mx = P.reduce((s, p) => s + p[0], 0) / P.length;
    const my = P.reduce((s, p) => s + p[1], 0) / P.length;
    let sxy = 0;
    let sxx = 0;
    for (const p of P) (sxy += (p[0] - mx) * (p[1] - my)), (sxx += (p[0] - mx) ** 2);
    return { reinekeSteigung: sxy / sxx, klassen: P.length };
}
module.exports = { hoehenAbstand, reinekeSteigung, SOLL: { hoehenAbstand: 0.15, reineke: [-1.605 * 1.1, -1.605 * 0.9] } };
