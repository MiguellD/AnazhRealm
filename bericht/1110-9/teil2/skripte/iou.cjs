// IoU der Tor-Masken zweier Sitzungen je Blick (Hauptbild = koerper, Schatten = wurf). Die Rausch-Pixel beider Sitzungen
// (leer gegen leer2 derselben Welt: Bäume ohne Stufen-Stempel driften ohne Takt), um 2 px geweitet, zählen in keiner Maske.
//   node iou.cjs <ordnerA> <ordnerB> [--json datei]
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const [A, B] = process.argv.slice(2);
const ji = process.argv.indexOf("--json");
const ladeM = (o, n) => new Uint8Array(zlib.inflateSync(fs.readFileSync(path.join(o, n))));
const meta = JSON.parse(fs.readFileSync(path.join(A, "masken.json"), "utf8"));
const zeilen = [];
for (const z of meta) {
    const { w, h } = z;
    const nA = ladeM(A, `${z.blick}-maske-rausch.bin`), nB = ladeM(B, `${z.blick}-maske-rausch.bin`);
    const N = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!nA[i] && !nB[i]) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
            const yy = y + dy, xx = x + dx;
            if (yy >= 0 && yy < h && xx >= 0 && xx < w) N[yy * w + xx] = 1;
        }
    }
    const zeile = { blick: z.blick, rauschAusgenommen: N.reduce((s, v) => s + v, 0) };
    for (const art of ["koerper", "wurf"]) {
        // Fleck-Filter für den Schatten: ein Pixel zählt nur mit ≥ 3 Masken-Nachbarn im 3×3 (Einzelpixel flackern zwischen zwei Läufen
        // derselben Welt in Membran und Baum-Dunkel: B1 gegen B2 bei 2,6 m 986 Pixel nur in B1, die Fläche des Wurfs ist zusammenhängend)
        const fleck = (m) => { if (art !== "wurf") return m; const o = new Uint8Array(m.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!m[i]) continue; let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < w && yy >= 0 && yy < h && m[yy * w + xx]) n++; } if (n >= 3) o[i] = 1; } return o; };
        const a = fleck(ladeM(A, `${z.blick}-maske-${art}.bin`)), b = fleck(ladeM(B, `${z.blick}-maske-${art}.bin`));
        let schnitt = 0, verein = 0, nurA = 0, nurB = 0, pa = 0, pb = 0;
        for (let i = 0; i < a.length; i++) {
            if (N[i]) continue;
            if (a[i]) pa++;
            if (b[i]) pb++;
            if (a[i] && b[i]) schnitt++;
            if (a[i] || b[i]) verein++;
            if (a[i] && !b[i]) nurA++;
            if (b[i] && !a[i]) nurB++;
        }
        // mit 1 px Toleranz (Lehre 0710-12): ein Pixel nur in A zählt nicht als Abweichung, wenn B im 3×3-Nachbarn trägt, und umgekehrt
        // Toleranz: Hauptbild 1 px, Schatten 2 px (die Schatten-Kante wandert zwischen zwei Läufen derselben Welt um 1–2 px: ein Texel der
        // nahen Kaskade bei 30 m; B1 gegen B2 bei 30 m mit 1 px 0,968)
        const tol = art === "wurf" ? 2 : 1;
        const nah = (m, i) => { const x = i % w, y = (i / w) | 0; for (let dy = -tol; dy <= tol; dy++) for (let dx = -tol; dx <= tol; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < w && yy >= 0 && yy < h && m[yy * w + xx]) return true; } return false; };
        let fern = 0;
        for (let i = 0; i < a.length; i++) { if (N[i] || a[i] === b[i]) continue; if (a[i] ? !nah(b, i) : !nah(a, i)) fern++; }
        zeile[art] = { iou: verein ? +(schnitt / verein).toFixed(4) : null, iouTol: verein ? +(1 - fern / verein).toFixed(4) : null, pxA: pa, pxB: pb, nurA, nurB, fern };
    }
    zeilen.push(zeile);
    console.log(`${z.blick}: Hauptbild IoU ${zeile.koerper.iou} · ±1 px ${zeile.koerper.iouTol} (A ${zeile.koerper.pxA} · B ${zeile.koerper.pxB} px; nur A ${zeile.koerper.nurA}, nur B ${zeile.koerper.nurB}) · Schatten IoU ${zeile.wurf.iou} · ±2 px ${zeile.wurf.iouTol} (A ${zeile.wurf.pxA} · B ${zeile.wurf.pxB} px; nur A ${zeile.wurf.nurA}, nur B ${zeile.wurf.nurB}) · Rausch ausgenommen ${zeile.rauschAusgenommen} px`);
}
if (ji > 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify(zeilen, null, 1));
