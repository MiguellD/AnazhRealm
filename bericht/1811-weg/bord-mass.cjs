// bord-mass.cjs <lauf-ordner> — w28-weg-koerper, Bedingung 1: die Breite des Schattens am Bord im Bild `bord-oben.png`
// (9 m senkrecht über der Fahrbahn, die Straße läuft im Bild von unten nach oben) gegen hochM × (−n · s.xz) ÷ s.y.
// Liest netz.json (erg.bord: Sonne, Querschnitt der Karte, Gesetz, Richtung der Straße, Schirm) und das PNG (eigener Leser,
// 8 Bit RGB/RGBA, ohne Zeilensprung). Urteil je Bord: GRÜN (±25 %), ROT, LEER (Soll unter einem Pixel).
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const D = process.argv[2];
const erg = JSON.parse(fs.readFileSync(path.join(D, "netz.json"), "utf8"));
const B = erg.bord;
if (!B) throw new Error("netz.json trägt kein `bord` (Lauf ohne WEG_BORD)");

function png(datei) {
    const b = fs.readFileSync(datei);
    let o = 8, w = 0, h = 0, typ = 0;
    const teile = [];
    while (o < b.length) {
        const n = b.readUInt32BE(o), t = b.toString("latin1", o + 4, o + 8);
        if (t === "IHDR") { w = b.readUInt32BE(o + 8); h = b.readUInt32BE(o + 12); typ = b[o + 17]; if (b[o + 16] !== 8 || b[o + 20] !== 0) throw new Error("PNG: nur 8 Bit ohne Zeilensprung"); }
        if (t === "IDAT") teile.push(b.subarray(o + 8, o + 8 + n));
        o += 12 + n;
    }
    const k = typ === 6 ? 4 : typ === 2 ? 3 : 0;
    if (!k) throw new Error("PNG: Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(teile)), z = w * k, px = Buffer.alloc(h * z);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (z + 1)], q = y * (z + 1) + 1, d = y * z;
        for (let i = 0; i < z; i++) {
            const a = i >= k ? px[d + i - k] : 0, u = y ? px[d - z + i] : 0, c = y && i >= k ? px[d - z + i - k] : 0;
            let v = roh[q + i];
            if (f === 1) v += a;
            else if (f === 2) v += u;
            else if (f === 3) v += (a + u) >> 1;
            else if (f === 4) { const p = a + u - c, pa = Math.abs(p - a), pb = Math.abs(p - u), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
            px[d + i] = v & 255;
        }
    }
    return { w, h, k, px };
}
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const P = png(path.join(D, "bord-oben.png"));
// das Profil quer zur Straße: je Spalte das Mittel der linearen Helligkeit über das freie Mittelband des Schirms (ohne HUD)
const [y0, y1] = [Math.round(P.h * 0.3), Math.round(P.h * 0.72)];
const prof = new Float64Array(P.w);
for (let x = 0; x < P.w; x++) {
    let s = 0;
    for (let y = y0; y < y1; y++) { const o = (y * P.w + x) * P.k; s += 0.2126 * lin(P.px[o]) + 0.7152 * lin(P.px[o + 1]) + 0.0722 * lin(P.px[o + 2]); }
    prof[x] = s / (y1 - y0);
}
const pxJeM = (erg["bord-oben"] && erg["bord-oben"].schirm ? erg["bord-oben"].schirm.pxJeM : erg.boot.schirm.pxJeM) / B.hoch;
// die Borde aus der Karte: wo die Lage zum Bord ½ kreuzt (d quer zur Straße, + nach links der Fahrtrichtung: (−uz, ux))
const borde = [];
for (let i = 0; i + 1 < B.quer.length; i++) {
    const [d0, , f0] = B.quer[i], [d1, , f1] = B.quer[i + 1];
    if ((f0 - 0.5) * (f1 - 0.5) < 0) borde.push({ d: d0 + ((0.5 - f0) / (f1 - f0)) * (d1 - d0), innen: f1 > f0 ? 1 : -1 });
}
const h = B.gesetz ? B.gesetz.hochM : 0;
const [sx, sy, sz] = B.sonne, [ux, uz] = B.u;
const aus = { ordner: path.basename(D), sonne: B.sonne.map((v) => +v.toFixed(3)), hoeheGrad: +((Math.asin(sy) * 180) / Math.PI).toFixed(1), hochM: h, pxJeM: +pxJeM.toFixed(1), borde: [] };
// die Seite des Schirms: +d liegt links oder rechts — beide Lesarten, es gilt die mit dem dunkleren Band am Soll-Bord
const lies = (seite) =>
    borde.map((b) => {
        // n zeigt in die Fahrbahn: quer (−uz, ux) · innen; der Schatten fällt, wenn das Licht (−s.xz) mit n läuft
        const [nx, nz] = [-uz * b.innen, ux * b.innen];
        const soll = Math.max(0, h * -(nx * sx + nz * sz)) / Math.max(sy, 0.05);
        // JE ZEILE des Bilds: der Bord der Karte liegt im Bild um einige Pixel neben seiner Soll-Lage (die Achse wandert, die Linie
        // wellt) — das Band sind die dunklen Pixel (unter 0,55 × Fahrbahn: der Schatten trägt 0,42, die Fugen der Köpfe bleiben darüber) im Fenster −0,3 … +0,9 m um den Bord; die Breite ist
        // der Median über die Zeilen.
        const xb = P.w / 2 + seite * b.d * pxJeM, r = seite * b.innen; // Schritt im Bild in die Fahrbahn
        const Y = (x, y) => { let t = 0; for (let j = -4; j <= 4; j++) { const o = ((y + j) * P.w + x) * P.k; t += 0.2126 * lin(P.px[o]) + 0.7152 * lin(P.px[o + 1]) + 0.0722 * lin(P.px[o + 2]); } return t / 9; }; // 9 Zeilen längs gemittelt: die Fugen der Köpfe heben sich auf
        const breiten = [], helle = [], rinnen = [];
        for (let y = y0; y < y1; y += 9) {
            const an = (m) => { const x = Math.round(xb + r * m * pxJeM); return x >= 0 && x < P.w ? Y(x, y) : -1; };
            let hs = 0, hn = 0;
            for (let m = 0.95; m <= 1.3; m += 1 / pxJeM) { const v = an(m); if (v >= 0) { hs += v; hn++; } }
            const hl = hn ? hs / hn : 0;
            // die ZAHL der dunklen Pixel im Fenster (ein heller Kopf im Schatten bricht keinen Lauf), ohne die Flanke des Bords, die das
            // Auge aus `hoch` Metern über der Achse sieht (hochM × |d| ÷ hoch)
            let best = -(h * Math.abs(b.d) / B.hoch) * pxJeM;
            for (let m = -0.3; m <= 0.9; m += 1 / pxJeM) { const v = an(m); if (v >= 0 && v < 0.55 * hl) best++; }
            best = Math.max(0, best);
            breiten.push(best); helle.push(hl); rinnen.push(hl ? an(0.24) / hl : 0);
        }
        const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
        const [n, hell] = [med(breiten), med(helle)];
        const ref = () => med(rinnen) * (hell || 1);
        return { d: +b.d.toFixed(2), sollM: +soll.toFixed(3), istM: +(n / pxJeM).toFixed(3), hell: +hell.toFixed(4), rinne: +(ref() / (hell || 1)).toFixed(2), zeilen: breiten.length };
    });
const [L, Rr] = [lies(1), lies(-1)];
const fehler = (a) => a.reduce((s, b) => s + Math.abs(b.istM - b.sollM), 0);
aus.seite = fehler(L) <= fehler(Rr) ? 1 : -1;
aus.borde = aus.seite === 1 ? L : Rr;
// DAS URTEIL je Bord. Die Forderung der Linse hängt NICHT am Gesetz des Baums: steht die Sonne tief (≤ 25°) und quer zum Bord
// (|n · s.xz| ≥ 0,7 der Waagrechten), trägt die Fahrstraße ein Band von ≥ 10 cm — sonst ROT „kein Band“ (die Mutante hochM → 0).
// Soll unter einem Pixel: LEER (die Mutante Sonne im Zenit), nie GRÜN. Ein Bord im Schlagschatten (unter 0,35 × der hellsten
// Fahrbahn-Seite) ist nicht gemessen.
const hellMax = Math.max(...aus.borde.map((b) => b.hell));
const flach = Math.hypot(sx, sz) || 1;
aus.borde.forEach((b, k) => {
    const o = borde[k], quer = Math.max(0, -((-uz * o.innen * sx + ux * o.innen * sz) / flach));
    const pflicht = aus.hoeheGrad <= 25 && quer >= 0.7;
    b.urteil = b.hell < 0.35 * hellMax ? "IM SCHLAGSCHATTEN (nicht gemessen)"
        : pflicht && b.istM < 0.1 ? "ROT kein Band (tiefe Sonne quer verlangt ≥ 0,10 m)"
        : b.sollM < 1 / pxJeM ? (b.istM <= 4 / pxJeM ? "LEER" : "ROT")
        : Math.abs(b.istM - b.sollM) <= 0.25 * b.sollM ? "GRÜN" : "ROT";
});
console.log(JSON.stringify(aus));
