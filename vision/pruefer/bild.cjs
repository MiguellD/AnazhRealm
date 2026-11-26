// bild.cjs — DAS EINE BILD-WERKZEUG des Blind-Prüfers (R11, 26.11.): Zuschnitt und Normierung auf EIN Pixelmaß, die GESTUFTE STÖRUNG
// (Detail-Verlust · Unschärfe · Tontrennung in 4 Stufen) und der Kontaktbogen — alles auf EINEM 2D-Canvas im headless-Browser mit
// --disable-gpu (keine GPU-Arbeit, kein Schloss). EIN Browser je Lauf, eigene PID, am Ende geschlossen.
//
// WARUM: ein Paar aus zwei Quellen verrät seine Herkunft an der Form (Pixelmaß, Kodierer, Rand, Signatur, Schärfe des Skalierers),
// bevor ein Prüfer die Sache ansieht. Jedes Bild eines Blatts läuft darum durch DENSELBEN Weg: `schnitt` je Kante weg (Rand,
// Signatur, Bildunterschrift), Mitte im Seitenmaß des Ziels, optional über EINE gemeinsame Zwischenbreite `vor` (gleiche Schärfe,
// wenn eine Quelle nur klein vorliegt), dann die Stufe der Störung, dann JPEG 0,9 aus demselben Kodierer.
// Die Stufen (bei 480 px Breite): 0 unberührt · 1 leicht · 2 mittel · 3 stark · 4 sehr stark — je Stufe Detail-Verlust (herunter- und
// wieder heraufskaliert um `detail`), Unschärfe (`blur` px) und Tontrennung (`ton` Stufen je Kanal). Die Ordnung ist das Gesetz:
// eine höhere Stufe ist in jedem der drei Maße stärker gestört.
"use strict";
const STUFEN = [null, { detail: 1.4, blur: 0.8, ton: 64 }, { detail: 2, blur: 1.6, ton: 32 }, { detail: 3, blur: 2.8, ton: 16 }, { detail: 5, blur: 4.5, ton: 8 }];
const RAND = 20; // Arbeitsrand in px: die Unschärfe blutet an der Kante aus — er fällt bei JEDEM Bild weg, auch bei Stufe 0 (gleiche Geometrie)
const url = (b) => "data:image/" + (b[0] === 0x89 ? "png" : "jpeg") + ";base64," + b.toString("base64");
const puffer = (u) => Buffer.from(u.slice(u.indexOf(",") + 1), "base64");

async function oeffne() {
    let puppeteer;
    try { puppeteer = require("puppeteer"); } catch (e) { throw new Error("puppeteer fehlt: NODE_PATH auf die node_modules des Spiel-Klons setzen (das Repo trägt es, keine neue Abhängigkeit)"); }
    const browser = await puppeteer.launch({ headless: true, args: ["--disable-gpu", "--disable-extensions", "--no-first-run"] });
    const seite = await browser.newPage();
    await seite.setJavaScriptEnabled(true);
    await seite.goto("about:blank");
    return {
        pid: browser.process() ? browser.process().pid : null,
        // ein Bild → JPEG im Maß w×h; o: { w, h, stufe 0–4, schnitt 0…0.2 (Anteil je Kante), vor (Zwischenbreite in px oder 0) }
        norm: async (b, o) => puffer(await seite.evaluate(async (u, o, S, P) => {
            const img = new Image(); img.src = u; await img.decode();
            const W = o.w + 2 * P, H = o.h + 2 * P, r = W / H;
            let sx = img.naturalWidth * o.schnitt, sy = img.naturalHeight * o.schnitt, sw = img.naturalWidth - 2 * sx, sh = img.naturalHeight - 2 * sy;
            if (sw / sh > r) { const n = sh * r; sx += (sw - n) / 2; sw = n; } else { const n = sw / r; sy += (sh - n) / 2; sh = n; }
            const c = (w, h) => { const k = document.createElement("canvas"); k.width = Math.max(1, Math.round(w)); k.height = Math.max(1, Math.round(h)); const x = k.getContext("2d"); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; return [k, x]; };
            let [a, x] = c(W, H);
            if (o.vor) { const [v, vx] = c(o.vor, o.vor / r); vx.drawImage(img, sx, sy, sw, sh, 0, 0, v.width, v.height); x.drawImage(v, 0, 0, v.width, v.height, 0, 0, W, H); }
            else x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
            if (S) {
                if (S.detail > 1) { const [k, kx] = c(W / S.detail, H / S.detail); kx.drawImage(a, 0, 0, k.width, k.height); x.drawImage(k, 0, 0, k.width, k.height, 0, 0, W, H); }
                if (S.blur) { const [k, kx] = c(W, H); kx.filter = "blur(" + S.blur + "px)"; kx.drawImage(a, 0, 0); kx.filter = "none"; a = k; x = kx; }
                if (S.ton < 256) { const d = x.getImageData(0, 0, W, H), q = 255 / (S.ton - 1); for (let i = 0; i < d.data.length; i += 4) for (let j = 0; j < 3; j++) d.data[i + j] = Math.round(Math.round(d.data[i + j] / q) * q); x.putImageData(d, 0, 0); }
            }
            const [z, zx] = c(o.w, o.h);
            zx.drawImage(a, P, P, o.w, o.h, 0, 0, o.w, o.h);
            return z.toDataURL("image/jpeg", 0.9);
        }, url(b), { schnitt: 0.06, vor: 0, stufe: 0, ...o }, STUFEN[o.stufe || 0], RAND)),
        // der Kontaktbogen: zellen [{ b: Buffer, text }] in `spalten` Spalten, jede Zelle tw×th, die Nummer steht im Bild
        kontakt: async (zellen, o) => puffer(await seite.evaluate(async (Z, o) => {
            const k = document.createElement("canvas"), zeilen = Math.ceil(Z.length / o.spalten);
            k.width = o.spalten * o.tw; k.height = zeilen * o.th;
            const x = k.getContext("2d"); x.fillStyle = "#222"; x.fillRect(0, 0, k.width, k.height); x.imageSmoothingQuality = "high"; x.font = "bold 13px sans-serif";
            for (let i = 0; i < Z.length; i++) {
                const img = new Image(); img.src = Z[i].u; await img.decode();
                const px = (i % o.spalten) * o.tw, py = Math.floor(i / o.spalten) * o.th;
                x.drawImage(img, px + 1, py + 1, o.tw - 2, o.th - 2);
                x.fillStyle = "rgba(0,0,0,0.65)"; x.fillRect(px + 1, py + 1, x.measureText(Z[i].text).width + 8, 17); x.fillStyle = "#fff"; x.fillText(Z[i].text, px + 5, py + 14);
            }
            return k.toDataURL("image/jpeg", 0.8);
        }, zellen.map((z) => ({ u: url(z.b), text: z.text })), o)),
        // die Buntheit eines Bilds (mittlerer Abstand der Kanäle, 0 = schwarz-weiß): ein Schwarz-Weiß-Foto verrät seine Klasse an der Form
        bunt: (b) => seite.evaluate(async (u) => {
            const img = new Image(); img.src = u; await img.decode();
            const k = document.createElement("canvas"); k.width = k.height = 32;
            const x = k.getContext("2d"); x.drawImage(img, 0, 0, 32, 32);
            const d = x.getImageData(0, 0, 32, 32).data; let s = 0;
            for (let i = 0; i < d.length; i += 4) s += Math.abs(d[i] - d[i + 1]) + Math.abs(d[i + 1] - d[i + 2]);
            return s / (d.length / 4);
        }, url(b)),
        zu: () => browser.close(),
    };
}
module.exports = { oeffne, STUFEN };
