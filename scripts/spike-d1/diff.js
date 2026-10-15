// Bild-Vergleich in der Seite: MODUS "merke:<name>" legt die letzte Aufnahme (`__letzteAufnahme`, RGBA aus dem Ausgabe-Pfad)
// ab, "vergleiche:<a>:<b>" zählt die Abweichung zweier abgelegter Bilder.
const D = window.__d1bilder || (window.__d1bilder = {});
const [was, a, b] = MODUS.split(":");
if (was === "merke") {
    D[a] = window.__letzteAufnahme.slice();
    return { gemerkt: a, bytes: D[a].length };
}
const x = D[a],
    y = D[b];
if (!x || !y || x.length !== y.length) return { fehler: "Bilder fehlen/ungleich" };
let gleich = 0,
    maxD = 0,
    sum = 0,
    px1 = 0,
    px4 = 0,
    px16 = 0;
const n = x.length / 4;
for (let p = 0; p < n; p++) {
    let m = 0;
    for (let c = 0; c < 3; c++) {
        const d = Math.abs(x[p * 4 + c] - y[p * 4 + c]);
        sum += d;
        if (d > m) m = d;
    }
    if (m === 0) gleich++;
    if (m > maxD) maxD = m;
    if (m > 1) px1++;
    if (m > 4) px4++;
    if (m > 16) px16++;
}
return {
    a,
    b,
    pixel: n,
    byteGleich: gleich === n,
    anteilUngleich: +(1 - gleich / n).toFixed(5),
    maxD,
    mittelD: +(sum / (n * 3)).toFixed(4),
    ueber1: +(px1 / n).toFixed(5),
    ueber4: +(px4 / n).toFixed(5),
    ueber16: +(px16 / n).toFixed(5),
};
