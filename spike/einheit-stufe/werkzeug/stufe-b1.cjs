// stufe-b1: je Vorlage und Stufe das Umschalt-Bild — Maske = Pixel, an denen L0 oder Lk vom Bild ohne Objekt (E, nur der Werfer)
// um mehr als MASKE/255 Luma abweicht; B1 = Anteil der Masken-Pixel, an denen L0 und Lk um mehr als 8/255 Luma auseinander liegen
// node stufe-b1.cjs <ordner> [MASKE=4]
const fs = require("fs"), path = require("path");
const { pngLesen } = require("C:/AnazhRealm/scripts/lib/abnahme-urteil.cjs");
const [dir, maskeS = "4"] = process.argv.slice(2);
const MASKE = +maskeS, SCHWELLE = 8;
const datei = (n) => [n + ".png", n + "-rot.png"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
const luma = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
const faelle = [...new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => f.replace(/-(E|A2|A|B)(-rot)?\.png$/, "")))].sort();
const zeilen = [];
for (const f of faelle) {
    const [E, A, B] = ["E", "A", "B"].map((s) => pngLesen(fs.readFileSync(datei(`${f}-${s}`))));
    const A2f = datei(`${f}-A2`), A2 = A2f ? pngLesen(fs.readFileSync(A2f)) : null;
    let maske = 0, anders = 0, stark = 0, rauschen = 0;
    for (let p = 0; p < A.W * A.H; p++) {
        const i = p * 4, a = luma(A.u8, i), b = luma(B.u8, i), e = luma(E.u8, i);
        if (!(Math.abs(a - e) > MASKE || Math.abs(b - e) > MASKE)) continue;
        maske++;
        const d = Math.abs(a - b);
        if (d > SCHWELLE) anders++;
        if (d > 32) stark++;
        if (A2 && Math.abs(a - luma(A2.u8, i)) > SCHWELLE) rauschen++;
    }
    const anteil = anders / maske;
    zeilen.push({ fall: f, maske, anders, anteil: +(100 * anteil).toFixed(2), stark: +(100 * stark / maske).toFixed(2), b1: anteil <= 0.01 ? "hält" : "REISST", rauschen: A2 ? +(100 * rauschen / maske).toFixed(2) : null });
}
for (const z of zeilen) console.log(`${z.fall.padEnd(28)} Maske ${String(z.maske).padStart(8)} px · über 8/255 ${String(z.anders).padStart(7)} = ${String(z.anteil).padStart(6)} % (über 32/255 ${z.stark} %) · B1 ${z.b1}${z.rauschen != null ? ` · Rauschen L0↔L0 ${z.rauschen} %` : ""}`);
fs.writeFileSync(path.join(dir, "b1.json"), JSON.stringify({ maske: MASKE, schwelle: SCHWELLE, zeilen }, null, 1));
