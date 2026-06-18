// diag-referenz-vermessen.cjs — DIE REFERENZ VERMESSEN (statt mit dem Auge raten):
//   lädt die Écorché-Referenzbilder (referenz/*.webp) via Chrome in ein Canvas, liest die Pixel,
//   trennt Körper/Hintergrund per FLOOD-FILL vom Rand (robust gegen creme≈grau-Farbnähe),
//   segmentiert im Körper Muskel(rot)/Knochen(beige)/Shorts und MISST:
//     - den Körper-Umriss (Halbbreite je Höhen-Band, normiert) = die Proportionen
//     - die Muskel-/Knochen-Verteilung je Band (die vertikalen Muskel-Grenzen)
//     - ein grobes ASCII-Bild zur Segmentierungs-Kontrolle
//   Ausgabe KÖRPER-NORMIERT (y=1 Scheitel … 0 Sohle; x in Körperhöhen).
//   Aufruf: node scripts/diag-referenz-vermessen.cjs [front|seite|34|ober|ruecken]
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const which = process.argv[2] || "front";
const MAP = {
    front: "anatomie-front.webp",
    seite: "anatomie-seite.webp",
    "34": "anatomie-34.webp",
    ober: "anatomie-detail-oberkoerper.webp",
    ruecken: "anatomie-detail-ruecken-bein.webp",
};
const file = MAP[which] || which;
const fp = path.join(root, "referenz", file);
if (!fs.existsSync(fp)) {
    console.error("nicht gefunden:", fp);
    process.exit(1);
}
const b64 = fs.readFileSync(fp).toString("base64");

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.setContent(`<canvas id="c"></canvas>`);
        const data = await page.evaluate(async (b64) => {
            const img = new Image();
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = "data:image/webp;base64," + b64;
            });
            const W = img.naturalWidth,
                H = img.naturalHeight;
            const c = document.getElementById("c");
            c.width = W;
            c.height = H;
            const ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const px = ctx.getImageData(0, 0, W, H).data;
            const R = (i) => px[i * 4] / 255,
                G = (i) => px[i * 4 + 1] / 255,
                B = (i) => px[i * 4 + 2] / 255;
            // ── FLOOD-FILL Hintergrund vom Rand: ein Pixel ist „bg-fähig", wenn es hell + neutral/kühl
            //    ist (NICHT warm-cremig wie Knochen, NICHT rot wie Muskel, NICHT dunkel). Der Körper-Blob
            //    ist umschlossen → wird nicht erreicht. ──
            const bgEligible = (i) => {
                const r = R(i), g = G(i), b = B(i);
                const bright = (r + g + b) / 3, sat = Math.max(r, g, b) - Math.min(r, g, b);
                return bright > 0.5 && sat < 0.2 && r - b < 0.04; // neutral/kühl-hell = Himmel/Boden
            };
            const isBg = new Uint8Array(W * H);
            const stack = [];
            for (let x = 0; x < W; x++) {
                stack.push(x); // top row
                stack.push((H - 1) * W + x); // bottom row
            }
            for (let y = 0; y < H; y++) {
                stack.push(y * W); // left col
                stack.push(y * W + W - 1); // right col
            }
            while (stack.length) {
                const i = stack.pop();
                if (isBg[i]) continue;
                if (!bgEligible(i)) continue;
                isBg[i] = 1;
                const x = i % W, y = (i / W) | 0;
                if (x > 0) stack.push(i - 1);
                if (x < W - 1) stack.push(i + 1);
                if (y > 0) stack.push(i - W);
                if (y < H - 1) stack.push(i + W);
            }
            // ── Klassifikation im Vordergrund ──
            // 0 bg,1 muskel(rot),2 knochen(creme),3 shorts(weiß),4 dunkel
            const cls = new Uint8Array(W * H);
            for (let i = 0; i < W * H; i++) {
                if (isBg[i]) { cls[i] = 0; continue; }
                const r = R(i), g = G(i), b = B(i);
                const bright = (r + g + b) / 3, sat = Math.max(r, g, b) - Math.min(r, g, b);
                if (bright < 0.28) cls[i] = 4; // dunkel (Haar/Nasenknorpel/Schatten)
                else if (r - g > 0.05 && r - b > 0.08) cls[i] = 1; // muskel
                else if (bright > 0.8 && sat < 0.12) cls[i] = 3; // shorts (sehr hell neutral)
                else cls[i] = 2; // knochen/creme (der Rest im Körper)
            }
            // ── Bounding-Box des Vordergrunds ──
            let minX = W, maxX = 0, minY = H, maxY = 0;
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++)
                    if (!isBg[y * W + x]) {
                        if (x < minX) minX = x; if (x > maxX) maxX = x;
                        if (y < minY) minY = y; if (y > maxY) maxY = y;
                    }
            const bh = maxY - minY || 1;
            const cxImg = (minX + maxX) / 2;
            // ── 40 Höhen-Bänder ──
            const NB = 40;
            const bands = [];
            for (let bi = 0; bi < NB; bi++) {
                const y0 = Math.round(minY + (bi / NB) * bh);
                const y1 = Math.round(minY + ((bi + 1) / NB) * bh);
                let lft = W, rgt = 0, m = 0, k = 0, sh = 0, n = 0;
                for (let y = y0; y < y1; y++)
                    for (let x = 0; x < W; x++) {
                        const t = cls[y * W + x];
                        if (t === 0) continue;
                        if (x < lft) lft = x; if (x > rgt) rgt = x;
                        n++;
                        if (t === 1) m++; else if (t === 2) k++; else if (t === 3) sh++;
                    }
                bands.push({
                    bi,
                    yTop: 1 - (y0 - minY) / bh,
                    halfW: n ? Math.max(cxImg - lft, rgt - cxImg) / bh : 0,
                    fullW: n ? (rgt - lft) / bh : 0,
                    musc: n ? m / n : 0,
                    bone: n ? k / n : 0,
                    shorts: n ? sh / n : 0,
                    fill: n,
                });
            }
            // ── ASCII 48×50 ──
            const AW = 48, AH = 50;
            const ascii = [];
            for (let ay = 0; ay < AH; ay++) {
                let row = "";
                const sy = Math.round(minY + (ay / AH) * bh);
                for (let ax = 0; ax < AW; ax++) {
                    const sx = Math.round(minX + (ax / AW) * (maxX - minX));
                    const t = cls[sy * W + sx];
                    row += t === 1 ? "#" : t === 2 ? ":" : t === 3 ? "o" : t === 4 ? "@" : " ";
                }
                ascii.push(row);
            }
            return { W, H, minX, maxX, minY, maxY, bh, bands, ascii };
        }, b64);

        console.log(`\n══ REFERENZ-VERMESSUNG: referenz/${file}  (${data.W}×${data.H}) ══`);
        console.log(`Körper-Box px: x[${data.minX}..${data.maxX}] y[${data.minY}..${data.maxY}]  Höhe=${data.bh}px  Breite=${data.maxX - data.minX}px (${((data.maxX - data.minX) / data.bh).toFixed(2)}× der Höhe)`);
        console.log(`\n  Band yScheitel halbBreite fullBreite  Musk% Kno% Sho%  (#=Muskel :=Knochen)`);
        for (const b of data.bands) {
            const bar = "#".repeat(Math.round(b.musc * 16)) + ":".repeat(Math.round(b.bone * 16)) + "o".repeat(Math.round(b.shorts * 16));
            console.log(
                `  ${String(b.bi).padStart(2)}   ${b.yTop.toFixed(3)}    ${b.halfW.toFixed(3)}    ${b.fullW.toFixed(3)}   ${(b.musc * 100).toFixed(0).padStart(3)} ${(b.bone * 100).toFixed(0).padStart(3)} ${(b.shorts * 100).toFixed(0).padStart(3)}  ${bar}`,
            );
        }
        console.log(`\n  ASCII (Muskel=# Knochen=: Shorts=o Dunkel=@):`);
        for (const r of data.ascii) console.log("   " + r);
        console.log("");
    } finally {
        await browser.close();
    }
})();
