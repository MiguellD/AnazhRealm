// s2b-auge.cjs — das Auge auf die Fernkarten (S2b, OMEN 17.10.): an Genesis Ego und Third je drei Ausgabe-Bilder (1920 × 1080), dazwischen
// je 3 s Spiel-Lauf; danach der Sprung zwischen aufeinanderfolgenden Bildern (Anteil der Pixel mit |Δ| > 24, max über RGB) — ein
// blinkendes Feld steht im Sprung, ein Loch oder eine schwarze Karte im Bild.   node s2b-auge.cjs --praefix <ordner/seite>
"use strict";
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const PRAEFIX = opt("--praefix", "auge"),
    PORT = Number(opt("--port", 4490));
function R(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            { host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d.slice(0, 400) });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(1800000, () => req.destroy(new Error(`${weg}: Frist`)));
        req.end(body);
    });
}
// PNG lesen (8 bit, ohne Interlace, RGB/RGBA) — wie p3/k1610bb/sprung-raster.cjs
function png(datei) {
    const b = fs.readFileSync(datei);
    let o = 8,
        w = 0,
        h = 0,
        typ = 0;
    const idat = [];
    while (o < b.length) {
        const len = b.readUInt32BE(o),
            art = b.toString("ascii", o + 4, o + 8),
            d = b.subarray(o + 8, o + 8 + len);
        if (art === "IHDR") {
            w = d.readUInt32BE(0);
            h = d.readUInt32BE(4);
            typ = d[9];
        } else if (art === "IDAT") idat.push(d);
        else if (art === "IEND") break;
        o += 12 + len;
    }
    const bpp = typ === 6 ? 4 : 3;
    const roh = zlib.inflateSync(Buffer.concat(idat));
    const zeile = w * bpp;
    const out = Buffer.alloc(w * h * 3);
    const vor = Buffer.alloc(zeile);
    let p = 0;
    for (let y = 0; y < h; y++) {
        const f = roh[p++];
        const z = roh.subarray(p, p + zeile);
        p += zeile;
        const cur = Buffer.alloc(zeile);
        for (let x = 0; x < zeile; x++) {
            const a = x >= bpp ? cur[x - bpp] : 0,
                up = vor[x],
                c = x >= bpp ? vor[x - bpp] : 0;
            let v = z[x];
            if (f === 1) v += a;
            else if (f === 2) v += up;
            else if (f === 3) v += (a + up) >> 1;
            else if (f === 4) {
                const pp = a + up - c,
                    pa = Math.abs(pp - a),
                    pb = Math.abs(pp - up),
                    pc = Math.abs(pp - c);
                v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
            }
            cur[x] = v & 255;
        }
        cur.copy(vor);
        for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) out[(y * w + x) * 3 + k] = cur[x * bpp + k];
    }
    return { w, h, px: out };
}
const sprung = (a, b) => {
    let n = 0,
        oben = 0,
        nOben = 0;
    for (let i = 0; i < a.w * a.h; i++) {
        const d = Math.max(Math.abs(a.px[3 * i] - b.px[3 * i]), Math.abs(a.px[3 * i + 1] - b.px[3 * i + 1]), Math.abs(a.px[3 * i + 2] - b.px[3 * i + 2]));
        if (d > 24) n++;
        if (i < (a.w * a.h) / 2) {
            nOben++;
            if (d > 24) oben++;
        }
    }
    return { pct: +((100 * n) / (a.w * a.h)).toFixed(2), obenPct: +((100 * oben) / nOben).toFixed(2) };
};
const schwarz = (a) => {
    let n = 0;
    for (let i = 0; i < a.w * a.h; i++) if (a.px[3 * i] < 8 && a.px[3 * i + 1] < 8 && a.px[3 * i + 2] < 8) n++;
    return +((100 * n) / (a.w * a.h)).toFixed(3);
};
(async () => {
    const aus = { start: new Date().toISOString(), je: {} };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    await R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" });
    await R("/fenster", { w: 1920, h: 1080 });
    for (const sicht of ["ego", "third"]) {
        const um = await R("/umstellen", { ort: "genesis", sicht });
        await R("/eval", { code: "return window.__buehne();" });
        await R("/lauf", { sek: 15, ein: 20, ruhe: 300, regler: "voll", tiere: "frei" });
        const bilder = [];
        for (let k = 1; k <= 3; k++) {
            const datei = `${PRAEFIX}-${sicht}-${k}.png`;
            // `/bild` braucht eine feste Kamera: die Lage der Spiel-Kamera und ein Punkt 50 m längs ihres Blicks
            const kam = await R("/eval", {
                code: "const c = r.state.camera; c.updateMatrixWorld(true); const d = new THREE.Vector3(); c.getWorldDirection(d); const l = c.position.clone().addScaledVector(d, 50); return [c.position.x, c.position.y, c.position.z, l.x, l.y, l.z];",
            });
            const v = (kam && kam.ergebnis) || [];
            if (v.length !== 6) throw new Error(`Kamera ${sicht}: ${JSON.stringify(kam).slice(0, 200)}`);
            const b = await R("/bild", { px: v[0], py: v[1], pz: v[2], lx: v[3], ly: v[4], lz: v[5], w: 1920, h: 1080, datei });
            if (!b || b.fehler || !fs.existsSync(datei)) throw new Error(`/bild ${sicht} ${k}: ${JSON.stringify(b).slice(0, 300)}`);
            bilder.push({ datei, info: { befehle: b && (b.drawCalls || (b.info && b.info.drawCalls)), dreiecke: b && (b.triangles || (b.info && b.info.triangles)), fehler: b && b.fehler } });
            if (k < 3) await R("/lauf", { sek: 3, ein: 1, ruhe: 30, regler: "voll", tiere: "frei" });
        }
        const px = bilder.map((x) => png(x.datei));
        const e = { umstellen: um && (um.ergebnis || um).takte, bilder, schwarzPct: px.map(schwarz), sprung12: sprung(px[0], px[1]), sprung23: sprung(px[1], px[2]) };
        aus.je[sicht] = e;
        log(`${sicht}: schwarz % ${e.schwarzPct.join(" · ")} · Sprung 1→2 ${JSON.stringify(e.sprung12)} · 2→3 ${JSON.stringify(e.sprung23)}`);
    }
    fs.writeFileSync(`${PRAEFIX}.json`, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("s2b-auge FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
