// WEGWERF (w28-samen-wiese) — der Stamm-Spike: drei Fälle am selben Baum (Eiche Same 1 Bestand, Same 3 Solitär; L0, echte Brücke).
//   heute     der Bau des Kerns
//   ringe     die naheliegende Gegenprobe: jedes Rinden-Dreieck in vier, die neuen Ecken auf den Kreis ihres Rings gehoben
//             (Mitte der Ring-Mitten, Radius das Mittel der zwei Ecken) — doppelt so viele Seiten und Ringe, dieselbe Form
//   kandidat  der Stamm folgt der Krone, die er trägt: BHD = Kronen-⌀ / 20 (über `ov.trunkMul` der echten Brücke: jeder Ast
//             folgt, da Vinci), dasselbe Skelett, dieselben Dreiecke
// node samen/wiese/spike-stamm.cjs <dump-ordner> [messen]
"use strict";
const fs = require("fs");
const path = require("path");
const { ringe, f32 } = require("./ringe.cjs");
const D = process.argv[2];
const SK = 4.16 * 0.82;
const AUS = __dirname;
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString("base64");

function masse(datei) {
    const r = JSON.parse(fs.readFileSync(datei, "utf8"));
    let H = 0, tris = 0, rinde = 0;
    const ab = [];
    for (const m of r.meshes) {
        if (!m.attrs || !m.attrs.position || m.teil === "schatten") continue;
        const p = f32(m.attrs.position.b64);
        const t = Buffer.from(m.index, "base64").length / 12;
        tris += t;
        if (m.kind === "bark") rinde += t;
        for (let i = 0; i < p.length; i += 3) {
            if (p[i + 1] * SK > H) H = p[i + 1] * SK;
            if (m.kind === "foliageTex") ab.push(Math.hypot(p[i], p[i + 2]) * SK);
        }
    }
    ab.sort((a, b) => a - b);
    const R = ringe(datei, SK).filter((e) => e.n >= 20);
    // der Durchmesser in der Höhe h: linear zwischen den zwei Stamm-Ringen um h
    const dm = (h) => {
        for (let i = 0; i + 1 < R.length; i++) if (R[i].y <= h && R[i + 1].y >= h) return 2 * (R[i].r + ((R[i + 1].r - R[i].r) * (h - R[i].y)) / (R[i + 1].y - R[i].y));
        return NaN;
    };
    const stammRinge = R.filter((e) => e.y >= 0 && e.y < 6.5);
    return { H, tris, rinde, krone: 2 * ab[Math.floor(ab.length * 0.9)], bhd: dm(1.3), d0: dm(0.001), d3: dm(3), d5: dm(5), seiten: R.length ? R[4].n - 1 : 0, ringAbstand: stammRinge.length > 2 ? stammRinge[2].y - stammRinge[1].y : NaN };
}
// die Gegenprobe: 1 → 4 je Rinden-Dreieck, die neuen Ecken auf den Rundstrang
function feiner(teil) {
    const t0 = process.hrtime.bigint();
    const p = f32(teil.attrs.position.b64), c = f32(teil.attrs.aCenter.b64), col = f32(teil.attrs.color.b64);
    const I = new Uint32Array(new Uint8Array(Buffer.from(teil.index, "base64")).buffer);
    const P = Array.from(p), C = Array.from(c), F = Array.from(col), neu = new Map(), J = [];
    const mitte = (a, b) => {
        const k = a < b ? a + "|" + b : b + "|" + a;
        if (neu.has(k)) return neu.get(k);
        const cm = [0, 1, 2].map((x) => (c[a * 3 + x] + c[b * 3 + x]) / 2), pm = [0, 1, 2].map((x) => (p[a * 3 + x] + p[b * 3 + x]) / 2);
        const ra = Math.hypot(p[a * 3] - c[a * 3], p[a * 3 + 1] - c[a * 3 + 1], p[a * 3 + 2] - c[a * 3 + 2]);
        const rb = Math.hypot(p[b * 3] - c[b * 3], p[b * 3 + 1] - c[b * 3 + 1], p[b * 3 + 2] - c[b * 3 + 2]);
        const d = [pm[0] - cm[0], pm[1] - cm[1], pm[2] - cm[2]], l = Math.hypot(...d) || 1, r = (ra + rb) / 2;
        const i = P.length / 3;
        P.push(cm[0] + (d[0] / l) * r, cm[1] + (d[1] / l) * r, cm[2] + (d[2] / l) * r);
        C.push(...cm);
        F.push(...[0, 1, 2].map((x) => (col[a * 3 + x] + col[b * 3 + x]) / 2));
        neu.set(k, i);
        return i;
    };
    for (let t = 0; t < I.length; t += 3) {
        const [a, b, d] = [I[t], I[t + 1], I[t + 2]], ab = mitte(a, b), bd = mitte(b, d), da = mitte(d, a);
        J.push(a, ab, da, ab, b, bd, da, bd, d, ab, bd, da);
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    return { teil: { kind: "bark", mat: teil.mat, attrs: { position: { itemSize: 3, b64: b64(new Float32Array(P)) }, aCenter: { itemSize: 3, b64: b64(new Float32Array(C)) }, color: { itemSize: 3, b64: b64(new Float32Array(F)) } }, index: b64(new Uint32Array(J)) }, ms };
}

(async () => {
    const zahlen = [];
    const faelle = [];
    for (const same of [1, 3]) {
        const heute = path.join(D, `stamm-eiche-s${same}-heute.json`), kand = path.join(D, `stamm-eiche-s${same}-kandidat.json`);
        const fein = path.join(D, `stamm-eiche-s${same}-ringe.json`);
        const r = JSON.parse(fs.readFileSync(heute, "utf8"));
        let ms = 0;
        r.meshes = r.meshes.map((m) => {
            if (m.kind !== "bark" || !m.attrs || !m.attrs.aCenter) return m;
            const f = feiner(m);
            ms += f.ms;
            return f.teil;
        });
        fs.writeFileSync(fein, JSON.stringify(r));
        for (const [name, datei] of [["heute", heute], ["ringe", fein], ["kandidat", kand]]) {
            const m = masse(datei);
            const z = { baum: same === 1 ? "eiche-bestand" : "eiche-solitaer", fall: name, dreiecke: m.tris, rinde: m.rinde, seiten: m.seiten, ringAbstandM: +m.ringAbstand.toFixed(2), hoeheM: +m.H.toFixed(2), bhdM: +m.bhd.toFixed(3), fussM: +m.d0.toFixed(3), d3M: +m.d3.toFixed(3), d5M: +m.d5.toFixed(3), hZuBhd: +(m.H / m.bhd).toFixed(1), bhdZuH: +(m.bhd / m.H).toFixed(4), kroneM: +m.krone.toFixed(2), kroneZuBhd: +(m.krone / m.bhd).toFixed(1), fussZuBhd: +(m.d0 / m.bhd).toFixed(2), nachbearbeitungMs: name === "ringe" ? +ms.toFixed(1) : 0 };
            zahlen.push(z);
            console.log(JSON.stringify(z));
            faelle.push([z.baum, name, datei]);
        }
    }
    fs.writeFileSync(path.join(AUS, "stamm-zahlen.json"), JSON.stringify(zahlen, null, 1));
    if (process.argv[3] === "messen") return;
    const { mitBuehne, teileAusDump } = require("./buehne.cjs");
    await mitBuehne(8796, async ({ geo, zeige }) => {
        const licht = { fuell: 1.5, staerke: 3.0, boden: 0x8c8478 };
        for (const [baum, name, datei] of faelle) {
            const key = baum + name;
            await geo(key, teileAusDump(datei, SK).map((t) => (t.art === "bark" && name === "ringe" ? Object.assign(t, { normal: null }) : t)));
            const o = [{ key, inst: [0, 0, 0, 0, 1, 1, 1, 1] }];
            await zeige(Object.assign({ objekte: o, kamera: { pos: [0, 1.6, -30], ziel: [0, 8, 0], fov: 38 }, sonne: { elev: 22, azim: 200 }, reich: 22, normalBias: 0.03 }, licht), path.join(AUS, `stamm-${baum}-${name}-ganz.png`));
            if (baum === "eiche-bestand") await zeige(Object.assign({ objekte: o, kamera: { pos: [0, 1.6, -3.4], ziel: [0, 1.0, 0], fov: 50 }, sonne: { elev: 16, azim: 250 }, reich: 5, normalBias: 0.01 }, licht), path.join(AUS, `stamm-${baum}-${name}-fuss.png`));
        }
    });
})().catch((e) => { console.error(e); process.exit(1); });
