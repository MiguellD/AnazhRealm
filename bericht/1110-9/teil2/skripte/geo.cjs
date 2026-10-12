// 1110-9 Teil 2 — der Tor-Tausch in EINER Welt: die Geometrie jeder Tor-Gruppe (archInstanceGroups `f:<gestalt>|…`, Leaf-
// Raum; Rahmen, Matrizen und Leaves sind vorher wie nachher byte-gleich, p3/tor/zahlen/byte-beweis.txt) aus der Welt A
// gezogen und in der Welt B je Mesh gesetzt — die Bild-Paare sehen so dieselbe Welt (Wolken, Bäume, Strom), nur das Tor wechselt.
//   node geo.cjs dump  <port> <ordner>      Welt A: je Gruppe Attribute + Index als base64 → <ordner>/<n>.json
//   node geo.cjs laden <port> <ordner>      Welt B: die Dumps laden (die eigene Geometrie bleibt als „B“)
//   node geo.cjs setze <port> A|B           Welt B: alle Tor-Gruppen auf A bzw. B
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const [cmd, port, arg] = process.argv.slice(2);
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
const KOPF = `
const st = r.state;
const G = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor"];
const torKeys = () => [...st.archInstanceGroups.keys()].filter((k) => G.some((n) => String(k).startsWith("f:" + n + "|"))).sort();
const b64 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
`;
(async () => {
    if (cmd === "dump") {
        fs.mkdirSync(arg, { recursive: true });
        const keys = (await rufe("/eval", { code: KOPF + "return torKeys();" })).ergebnis;
        let bytes = 0;
        for (let i = 0; i < keys.length; i++) {
            const d = (await rufe("/eval", { code: KOPF + `
const g = st.archInstanceGroups.get(${JSON.stringify(keys[i])});
const geo = g.mesh.geometry;
const attrs = [];
for (const [name, a] of Object.entries(geo.attributes)) {
    if (a.isInterleavedBufferAttribute) throw new Error("verschränkt: " + name);
    attrs.push({ name, itemSize: a.itemSize, normalized: !!a.normalized, typ: a.array.constructor.name, b64: b64(new Uint8Array(a.array.buffer, a.array.byteOffset, a.array.byteLength)) });
}
const ix = geo.index ? { typ: geo.index.array.constructor.name, b64: b64(new Uint8Array(geo.index.array.buffer, geo.index.array.byteOffset, geo.index.array.byteLength)) } : null;
return { key: ${JSON.stringify(keys[i])}, attrs, index: ix, drawRange: [geo.drawRange.start, geo.drawRange.count], groups: geo.groups, morph: Object.keys(geo.morphAttributes || {}).length };` })).ergebnis;
            if (!d || !d.attrs) throw new Error("Dump " + keys[i] + ": " + JSON.stringify(d).slice(0, 200));
            const s = JSON.stringify(d);
            bytes += s.length;
            fs.writeFileSync(path.join(arg, String(i).padStart(3, "0") + ".json"), s);
        }
        console.log(`DUMP ${keys.length} Tor-Gruppen, ${(bytes / 1048576).toFixed(1)} MB → ${arg}`);
    } else if (cmd === "laden") {
        const dateien = fs.readdirSync(arg).filter((n) => /^\d+\.json$/.test(n)).sort();
        const hier = (await rufe("/eval", { code: KOPF + "window.__torGeo = window.__torGeo || { A: new Map(), B: new Map() }; for (const k of torKeys()) if (!window.__torGeo.B.has(k)) window.__torGeo.B.set(k, st.archInstanceGroups.get(k).mesh.geometry); return torKeys();" })).ergebnis;
        let n = 0, fehlt = [];
        for (const f of dateien) {
            const d = JSON.parse(fs.readFileSync(path.join(arg, f), "utf8"));
            if (!hier.includes(d.key)) { fehlt.push(d.key); continue; }
            const e = (await rufe("/eval", { code: KOPF + `
const d = ${JSON.stringify(d)};
const T = window.THREE;
const geo = new T.BufferGeometry();
const roh = (typ, s) => { const u = unb64(s); const C = globalThis[typ]; return new C(u.buffer, 0, u.byteLength / C.BYTES_PER_ELEMENT); };
for (const a of d.attrs) geo.setAttribute(a.name, new T.BufferAttribute(roh(a.typ, a.b64), a.itemSize, a.normalized));
if (d.index) geo.setIndex(new T.BufferAttribute(roh(d.index.typ, d.index.b64), 1));
// JSON trägt Infinity als null: ohne die Rückführung zeichnete die getauschte Gruppe 0 Ecken (der erste Lauf, W-A1 70 px)
geo.setDrawRange(d.drawRange[0], d.drawRange[1] == null ? Infinity : d.drawRange[1]);
for (const gr of d.groups || []) geo.addGroup(gr.start, gr.count, gr.materialIndex);
geo.computeBoundingSphere(); geo.computeBoundingBox();
const B = window.__torGeo.B.get(d.key);
const gleich = Object.keys(B.attributes).sort().join(",") === Object.keys(geo.attributes).sort().join(",");
window.__torGeo.A.set(d.key, geo);
return { gleich, ecken: geo.attributes.position.count, eckenB: B.attributes.position.count };` })).ergebnis;
            if (!e || !e.gleich) throw new Error("Attribute ungleich bei " + d.key + ": " + JSON.stringify(e));
            n++;
        }
        console.log(`GELADEN ${n} von ${dateien.length} Gruppen, ${hier.length} Tor-Gruppen in der Welt${fehlt.length ? ", ohne Partner: " + fehlt.join(" ") : ""}`);
        if (n !== hier.length || fehlt.length) process.exit(1);
    } else if (cmd === "setze") {
        const e = (await rufe("/eval", { code: KOPF + `
const Z = window.__torGeo[${JSON.stringify(arg)}];
let n = 0, ecken = 0;
for (const k of torKeys()) {
    const g = st.archInstanceGroups.get(k), geo = Z.get(k);
    if (!geo) throw new Error("ohne Geometrie: " + k);
    g.mesh.geometry = geo;
    g.mesh.boundingSphere = null; g.mesh.boundingBox = null;
    const p = g.mesh.parent; if (p && p.isBundleGroup) p.needsUpdate = true;
    n++; ecken += geo.attributes.position.count * (g.mesh.count || 1);
}
window.__torGeoStand = ${JSON.stringify(arg)};
return { n, ecken };` })).ergebnis;
        console.log(`GESETZT ${arg}: ${JSON.stringify(e)}`);
    } else throw new Error("dump | laden | setze");
})().catch((e) => { console.error("FEHLER", e.message); process.exit(2); });
