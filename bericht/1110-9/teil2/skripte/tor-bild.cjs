// 1110-9 Teil 2 — die Bild-Paare der Tore am Ausgabe-Pfad (werkbank bild: Bühne + echter Frame, TRAA-Phase, Himmels-
// und Knoten-Uhr fest). Je Blick fünf Schüsse in EINER Welt: voll (das Bild) · leer (alle Tor-Gestalten weg, die Membran
// bleibt) · koerper (Tore sichtbar, werfen nicht) · wurf (Tore nur in den Kaskaden: Ebene 30, die Hauptkamera sieht sie
// nicht) · leer2 (Rausch-Probe). Maske Hauptbild = |koerper − leer| > T, Maske Schatten = |wurf − leer| > T (Kanal-Maximum).
//   node tor-bild.cjs <werkbank-port> <ordner>
"use strict";
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const [port, ordner] = process.argv.slice(2);
fs.mkdirSync(ordner, { recursive: true });
const T = 10;
const rufe = (url, body) =>
    new Promise((res, rej) => {
        const q = http.request({ host: "127.0.0.1", port: Number(port), path: url, method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error(d.slice(0, 300))); } });
        });
        q.on("error", rej);
        q.end(JSON.stringify(body));
    });
function lies(datei) {
    const b = fs.readFileSync(datei);
    let o = 8, w = 0, h = 0, typ = 0;
    const idat = [];
    while (o < b.length) {
        const n = b.readUInt32BE(o), t = b.toString("ascii", o + 4, o + 8), d = b.subarray(o + 8, o + 8 + n);
        if (t === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); typ = d[9]; }
        else if (t === "IDAT") idat.push(d);
        else if (t === "IEND") break;
        o += 12 + n;
    }
    const kan = typ === 6 ? 4 : 3, roh = zlib.inflateSync(Buffer.concat(idat)), zeile = w * kan, px = new Uint8Array(h * zeile);
    let vor = new Uint8Array(zeile);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (zeile + 1)], z = roh.subarray(y * (zeile + 1) + 1, (y + 1) * (zeile + 1)), aus = px.subarray(y * zeile, (y + 1) * zeile);
        for (let x = 0; x < zeile; x++) {
            const a = x >= kan ? aus[x - kan] : 0, bb = vor[x], c = x >= kan ? vor[x - kan] : 0;
            let v = z[x];
            if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1;
            else if (f === 4) { const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c; }
            aus[x] = v & 255;
        }
        vor = aus;
    }
    return { w, h, kan, px };
}
// Graustufen-PNG (Maske 0/255)
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (buf) => { let c = -1; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function schreibeMaske(datei, w, h, m) {
    const roh = Buffer.alloc(h * (w + 1));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) roh[y * (w + 1) + 1 + x] = m[y * w + x] ? 255 : 0;
    const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
    fs.writeFileSync(datei, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(roh)), chunk("IEND", Buffer.alloc(0))]));
}
function maske(a, b) {
    const n = a.w * a.h, m = new Uint8Array(n);
    let z = 0;
    for (let i = 0; i < n; i++) {
        let d = 0;
        for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(a.px[i * a.kan + k] - b.px[i * b.kan + k]));
        if (d > T) { m[i] = 1; z++; }
    }
    return { m, z };
}
const setup = `
const st = r.state;
const P = Object.getPrototypeOf(r);
window.__anazhAutoSettlement = false;
r._loopSkyboxZeit = function () { if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000; };
r._loopSkyboxZeit();
window.__jitterStart = 0;
if (!window.__A0) { window.__A0 = window.__ausgabeAufnahme; window.__ausgabeAufnahme = function (...a) { if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart; return window.__A0.apply(this, a); }; }
for (const c of st.creatures || []) c.visible = false;
r._loopRender = function () { return P._loopRender.call(this, 1000); };
const nf = st.renderer._nodes.nodeFrame; nf.update = function () { this.frameId++; this.deltaTime = 0; this.time = 1000; };
// die Wind-Uhr fest (Laub und sein Schatten wehten zwischen zwei leeren Schüssen: 13 579 Rausch-Pixel bei 30 m)
const wu = st.windUniforms;
const fest = (u, v) => { if (u) Object.defineProperty(u, "value", { configurable: true, get: () => v, set: () => {} }); };
if (wu) { fest(wu.uWindTime, 1000); fest(wu.uWindStrength, wu.uWindStrength.value); }
if (!window.__wdFest) { window.__wdFest = true; const wd = P._windDirAt; r._windDirAt = function () { return wd.call(this, 1000); }; }
const G = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor"];
const meshes = [];
let tris = 0;
for (const [k, g] of st.archInstanceGroups) if (g && g.mesh && G.some((n) => String(k).startsWith("f:" + n + "|"))) { meshes.push(g.mesh); const geo = g.mesh.geometry; tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3 * (g.mesh.count || 1); }
// der Ur-Zustand EINMAL je Welt (ein zweiter Aufbau nach einem abgebrochenen Lauf läse sonst versteckte Tore als Ur-Zustand)
const orig = window.__torOrig || (window.__torOrig = new Map());
for (const m of meshes) if (!orig.has(m)) orig.set(m, { vis: m.visible, cast: m.castShadow, lay: m.layers.mask });
const kams = new Set();
if (st.csmNode && st.csmNode.lights) for (const l of st.csmNode.lights) if (l.shadow && l.shadow.camera) kams.add(l.shadow.camera);
st.scene.traverse((o) => { if (o.isLight && o.shadow && o.shadow.camera) kams.add(o.shadow.camera); });
for (const c of kams) c.layers.enable(30);
window.__torIso = (modus) => {
    for (const m of meshes) {
        const o = orig.get(m);
        m.visible = modus === "leer" ? false : o.vis;
        m.castShadow = modus === "koerper" ? false : o.cast;
        m.layers.mask = modus === "wurf" ? 1 << 30 : o.lay;
        const p = m.parent;
        if (p && p.isBundleGroup) p.needsUpdate = true;
    }
    return meshes.length;
};
// Die Pflanzen (jede Gestalt mit Stufen-Stempel aLodLevel und die Nah-Wiese) driften zwischen zwei Schüssen ohne Takt
// (Laub und sein Schatten, 6 000 Pixel je Schuss bei 30 m, kumulativ) — für die Masken-Schüsse sind sie aus (Lehre 0710-2).
const torSet = new Set(meshes);
const pfl = [];
const pflOrig = window.__pflOrig || (window.__pflOrig = new Map());
st.scene.traverse((o) => { if ((o.isMesh || o.isInstancedMesh) && !torSet.has(o) && o.geometry && o.geometry.attributes && o.geometry.attributes.aLodLevel) { if (!pflOrig.has(o)) pflOrig.set(o, o.visible); pfl.push([o, pflOrig.get(o)]); } });
window.__pflanzen = (an) => {
    for (const [o, v] of pfl) { o.visible = an ? v : false; const p = o.parent; if (p && p.isBundleGroup) p.needsUpdate = true; }
    if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = !!an;
    return pfl.length;
};
// Die Kaskaden-Box je Blick fest: _kaskadenPassen stellt die nahe Ebene über den höchsten Werfer — ein verstecktes Tor verschob
// sonst das Tiefen-Raster der Kaskade und mit ihm jede Schatten-Kante im Bild (gleiche Gestalt zweimal: Schatten-IoU 30 m 0,97).
window.__kaskadeFest = (an) => { if (an) r._kaskadenPassen = function () {}; else delete r._kaskadenPassen; return typeof r._kaskadenPassen; };
const mem = [];
st.scene.traverse((o) => { if (o.isMesh && o.material && (o.material.userData && o.material.userData.portalMembran || /membran/i.test(o.name || ""))) mem.push(o.name || o.type); });
return { pflanzen: pfl.length, meshes: meshes.length, tris: Math.round(tris), kams: kams.size, hauptLagen: st.camera.layers.mask, membranen: mem.length, version: r.constructor.VERSION, porta: globalThis.__portaCore ? globalThis.__portaCore.PORTAL_RENDER_CONFIG.lod.budget.gate[0].tris : null };`;
const BLICKE = [
    { id: "d2.6", px: 32.6, py: "+1.6", pz: 7.86, lx: 32.6, ly: 57.8, lz: 10.46, satz: "2,6 m vor der maschine (Innenseite), Blick auf Bogen und Membran" },
    { id: "d11", px: 36, py: 59.54, pz: 0, lx: 36, ly: 57.5, lz: 10.46, satz: "der Spieler-Stand in der Ring-Mitte (Plattform), Blick +z: maschine und verkalkt in 11 m" },
    { id: "d30", px: 32.6, py: 72.5, pz: -15.5, lx: 32.6, ly: 57.5, lz: 10.46, satz: "30 m vor der maschine, 30° von oben (26 m waagrecht, 15 m hoch): der Ring über Klang und Plattform, die Tore auf L0 wie im Ring" },
];
(async () => {
    const s = (await rufe("/eval", { code: setup })).ergebnis;
    console.log("Aufbau:", JSON.stringify(s));
    fs.writeFileSync(path.join(ordner, "aufbau.json"), JSON.stringify(s, null, 1));
    if (!s || !s.meshes) process.exit(1);
    const zeilen = [];
    for (const b of BLICKE) {
        const kam = { px: b.px, py: b.py, pz: b.pz, lx: b.lx, ly: b.ly, lz: b.lz, w: 1920, h: 1080 };
        const schuss = async (name, modus, pflanzen) => {
            await rufe("/eval", { code: `window.__pflanzen(${pflanzen ? "true" : "false"}); return window.__torIso(${JSON.stringify(modus)})` });
            const datei = path.resolve(ordner, `${b.id}-${name}.png`);
            const a = await rufe("/bild", Object.assign({}, kam, { datei }));
            return { bild: lies(datei), dc: a.dc, dreiecke: a.dreiecke };
        };
        await rufe("/eval", { code: "return window.__kaskadeFest(false)" });
        await schuss("aufwaermen", "voll", true);
        fs.unlinkSync(path.resolve(ordner, `${b.id}-aufwaermen.png`));
        await rufe("/eval", { code: "return window.__kaskadeFest(true)" });
        const voll = await schuss("voll", "voll", true);
        await schuss("aufwaermen2", "leer", false);
        fs.unlinkSync(path.resolve(ordner, `${b.id}-aufwaermen2.png`));
        const leer = await schuss("leer", "leer", false);
        const koerper = await schuss("koerper", "koerper", false);
        const wurf = await schuss("wurf", "wurf", false);
        const leer2 = await schuss("leer2", "leer", false);
        await rufe("/eval", { code: `window.__pflanzen(true); window.__kaskadeFest(false); return window.__torIso("voll")` });
        const mk = maske(koerper.bild, leer.bild), mw = maske(wurf.bild, leer.bild), mr = maske(leer2.bild, leer.bild);
        const { w, h } = voll.bild;
        schreibeMaske(path.resolve(ordner, `${b.id}-maske-koerper.png`), w, h, mk.m);
        schreibeMaske(path.resolve(ordner, `${b.id}-maske-wurf.png`), w, h, mw.m);
        fs.writeFileSync(path.resolve(ordner, `${b.id}-maske-koerper.bin`), zlib.deflateSync(Buffer.from(mk.m)));
        fs.writeFileSync(path.resolve(ordner, `${b.id}-maske-wurf.bin`), zlib.deflateSync(Buffer.from(mw.m)));
        fs.writeFileSync(path.resolve(ordner, `${b.id}-maske-rausch.bin`), zlib.deflateSync(Buffer.from(mr.m)));
        schreibeMaske(path.resolve(ordner, `${b.id}-maske-rausch.png`), w, h, mr.m);
        const z = { blick: b.id, satz: b.satz, w, h, koerperPx: mk.z, wurfPx: mw.z, rauschPx: mr.z, dc: { voll: voll.dc, leer: leer.dc, koerper: koerper.dc, wurf: wurf.dc }, dreiecke: { voll: voll.dreiecke, leer: leer.dreiecke } };
        zeilen.push(z);
        console.log(JSON.stringify(z));
    }
    fs.writeFileSync(path.join(ordner, "masken.json"), JSON.stringify(zeilen, null, 1));
})().catch((e) => { console.error("FEHLER", e.message); process.exit(2); });
