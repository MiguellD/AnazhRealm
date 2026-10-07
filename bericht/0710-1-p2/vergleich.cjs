// Bild-Vergleich vorher ↔ nachher gegen den Rausch-Boden zweier Boots desselben Stands.
// node vergleich.cjs <ordner> <A1> <A2> <B1> <B2>   (Unterordner mit gleichnamigen PNGs, 1920×1080)
// Je Blick: MSSIM (8×8-Blöcke, Wang 2004, wie diag-look-golden) über das ganze Bild und über den Boden (untere 60 %,
// ohne den ziehenden Himmel), mittlere |ΔLuma| und der Anteil der Pixel mit |ΔLuma| > 8 im Boden — und die FARBE: der
// Anteil der 16×16-Blöcke im Boden, deren Farbton (Mittel von R−G und B−G) um mehr als 6 springt (reine Luma übersah
// 07.10. das türkise Becken: 99/131/116 → 114/166/147 trägt fast dieselbe Helligkeit).
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function png(datei) {
    const b = fs.readFileSync(datei);
    let o = 8,
        w = 0,
        h = 0,
        typ = 0;
    const idat = [];
    while (o < b.length) {
        const n = b.readUInt32BE(o);
        const t = b.toString("ascii", o + 4, o + 8);
        const d = b.subarray(o + 8, o + 8 + n);
        if (t === "IHDR") {
            w = d.readUInt32BE(0);
            h = d.readUInt32BE(4);
            if (d[8] !== 8) throw new Error("nur 8 bit");
            typ = d[9];
        } else if (t === "IDAT") idat.push(d);
        else if (t === "IEND") break;
        o += 12 + n;
    }
    const kan = typ === 6 ? 4 : typ === 2 ? 3 : 0;
    if (!kan) throw new Error("Farbtyp " + typ);
    const roh = zlib.inflateSync(Buffer.concat(idat));
    const zeile = w * kan;
    const px = new Uint8Array(h * zeile);
    let vor = new Uint8Array(zeile);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (zeile + 1)];
        const z = roh.subarray(y * (zeile + 1) + 1, (y + 1) * (zeile + 1));
        const aus = px.subarray(y * zeile, (y + 1) * zeile);
        for (let x = 0; x < zeile; x++) {
            const a = x >= kan ? aus[x - kan] : 0,
                bb = vor[x],
                c = x >= kan ? vor[x - kan] : 0;
            let v = z[x];
            if (f === 1) v += a;
            else if (f === 2) v += bb;
            else if (f === 3) v += (a + bb) >> 1;
            else if (f === 4) {
                const p = a + bb - c,
                    pa = Math.abs(p - a),
                    pb = Math.abs(p - bb),
                    pc = Math.abs(p - c);
                v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
            }
            aus[x] = v & 255;
        }
        vor = aus;
    }
    const L = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++)
        L[i] = (0.2126 * px[i * kan] + 0.7152 * px[i * kan + 1] + 0.0722 * px[i * kan + 2]) / 255;
    return { w, h, L, px, kan };
}

function mssim(a, b, w, y0, y1) {
    const c1 = 0.01 ** 2,
        c2 = 0.03 ** 2,
        win = 8;
    let s = 0,
        n = 0;
    for (let by = y0; by + win <= y1; by += win)
        for (let bx = 0; bx + win <= w; bx += win) {
            let sa = 0,
                sb = 0;
            for (let y = 0; y < win; y++)
                for (let x = 0; x < win; x++) {
                    const i = (by + y) * w + bx + x;
                    sa += a[i];
                    sb += b[i];
                }
            const ma = sa / 64,
                mb = sb / 64;
            let va = 0,
                vb = 0,
                cv = 0;
            for (let y = 0; y < win; y++)
                for (let x = 0; x < win; x++) {
                    const i = (by + y) * w + bx + x;
                    const da = a[i] - ma,
                        db = b[i] - mb;
                    va += da * da;
                    vb += db * db;
                    cv += da * db;
                }
            va /= 63;
            vb /= 63;
            cv /= 63;
            s += ((2 * ma * mb + c1) * (2 * cv + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2));
            n++;
        }
    return s / n;
}

function paar(p, q) {
    const { w, h } = p;
    const y0 = Math.floor(h * 0.4);
    let d = 0,
        gross = 0,
        n = 0;
    for (let y = y0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const dv = Math.abs(p.L[i] - q.L[i]) * 255;
            d += dv;
            if (dv > 8) gross++;
            n++;
        }
    const B = 16;
    let bloecke = 0,
        bunt = 0;
    for (let by = y0; by + B <= h; by += B)
        for (let bx = 0; bx + B <= w; bx += B) {
            const m = [p, q].map((I) => {
                let rg = 0,
                    bg = 0;
                for (let y = by; y < by + B; y++)
                    for (let x = bx; x < bx + B; x++) {
                        const i = (y * w + x) * I.kan;
                        rg += I.px[i] - I.px[i + 1];
                        bg += I.px[i + 2] - I.px[i + 1];
                    }
                return [rg / (B * B), bg / (B * B)];
            });
            bloecke++;
            if (Math.max(Math.abs(m[0][0] - m[1][0]), Math.abs(m[0][1] - m[1][1])) > 6) bunt++;
        }
    return {
        farbe: +((100 * bunt) / bloecke).toFixed(2),
        ganz: +mssim(p.L, q.L, w, 0, h).toFixed(4),
        boden: +mssim(p.L, q.L, w, y0, h).toFixed(4),
        dLuma: +(d / n).toFixed(2),
        pct8: +((100 * gross) / n).toFixed(2),
    };
}

const [ordner, A1, A2, B1, B2] = process.argv.slice(2);
const blicke = fs.readdirSync(path.join(ordner, A1)).filter((f) => f.endsWith(".png"));
const paare = [
    ["Rauschen A", A1, A2],
    ["Rauschen B", B1, B2],
    ["A1↔B1", A1, B1],
    ["A2↔B2", A2, B2],
    ["A1↔B2", A1, B2],
    ["A2↔B1", A2, B1],
];
const aus = {};
for (const f of blicke) {
    const bild = {};
    for (const s of [A1, A2, B1, B2]) bild[s] = png(path.join(ordner, s, f));
    aus[f] = {};
    for (const [name, a, b] of paare) aus[f][name] = paar(bild[a], bild[b]);
}
console.log(`Blick      Paar         MSSIM ganz  MSSIM Boden  |ΔLuma| Boden  Pixel >8 (%)  Farbton-Blöcke >6 (%)`);
for (const f of blicke)
    for (const [name] of paare) {
        const e = aus[f][name];
        console.log(
            `${f.replace(".png", "").padEnd(10)} ${name.padEnd(12)} ${String(e.ganz).padStart(10)}  ${String(e.boden).padStart(11)}  ${String(e.dLuma).padStart(13)}  ${String(e.pct8).padStart(12)}  ${String(e.farbe).padStart(21)}`
        );
    }
// Das Urteil: jedes Quer-Paar (A↔B) liegt im Boden nicht tiefer als das schlechtere Rauschen-Paar desselben Blicks minus 0,01.
let rot = 0;
for (const f of blicke) {
    const boden = Math.min(aus[f]["Rauschen A"].boden, aus[f]["Rauschen B"].boden);
    for (const k of ["A1↔B1", "A2↔B2", "A1↔B2", "A2↔B1"])
        if (aus[f][k].boden < boden - 0.01) {
            rot++;
            console.log(`ROT ${f} ${k}: MSSIM Boden ${aus[f][k].boden} unter dem Rausch-Boden ${boden}`);
        }
    // Die Farbe: kein Quer-Paar trägt mehr verschobene Farbton-Blöcke als das doppelte schlechtere Rauschen-Paar + 0,5 Punkte.
    const farbe = Math.max(aus[f]["Rauschen A"].farbe, aus[f]["Rauschen B"].farbe);
    for (const k of ["A1↔B1", "A2↔B2", "A1↔B2", "A2↔B1"])
        if (aus[f][k].farbe > 2 * farbe + 0.5) {
            rot++;
            console.log(`ROT ${f} ${k}: ${aus[f][k].farbe} % Farbton-Blöcke verschoben, Rausch-Boden ${farbe} %`);
        }
}
console.log(rot ? `\n${rot} Paare unter dem Rausch-Boden` : "\nGRÜN — jedes Quer-Paar liegt im Rausch-Boden zweier Boots desselben Stands");
fs.writeFileSync(path.join(ordner, "vergleich.json"), JSON.stringify(aus, null, 1));
