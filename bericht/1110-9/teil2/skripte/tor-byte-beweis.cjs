// Byte-Beweis 1110-9: alles von porta-core außer den Röhren und Ringen der Tore bleibt byte-gleich.
// argv: root, porta-core vorher, porta-core nachher. Lädt jede Fassung in einen frischen globalThis-Slot.
const path = require("path"), crypto = require("crypto");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
function lade(datei) {
    delete require.cache[require.resolve(datei)];
    delete globalThis.__portaCore;
    require(datei);
    return globalThis.__portaCore;
}
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex").slice(0, 16);
const json = (x) => JSON.stringify(x, (k, v) => (typeof v === "function" ? "fn:" + v.length : v));
function geoBytes(geo) {
    const h = crypto.createHash("sha256");
    for (const k of Object.keys(geo.attributes).sort()) { h.update(k); h.update(Buffer.from(geo.attributes[k].array.buffer, geo.attributes[k].array.byteOffset, geo.attributes[k].array.byteLength)); }
    if (geo.index) h.update(Buffer.from(geo.index.array.buffer, geo.index.array.byteOffset, geo.index.array.byteLength));
    return h.digest("hex").slice(0, 16);
}
function matBytes(m) {
    if (!m) return "-";
    const a = Array.isArray(m) ? m : [m];
    return sha(a.map((x) => json({ t: x.type, c: x.color && x.color.getHex(), e: x.emissive && x.emissive.getHex(), ei: x.emissiveIntensity, r: x.roughness, me: x.metalness, o: x.opacity, tr: x.transparent, s: x.side, u: x.uniforms ? Object.keys(x.uniforms).sort().map((k) => [k, x.uniforms[k].value && x.uniforms[k].value.toArray ? x.uniforms[k].value.toArray() : x.uniforms[k].value]) : null, v: x.vertexShader && sha(x.vertexShader), f: x.fragmentShader && sha(x.fragmentShader) })).join("|"));
}
function aufnahme(PC) {
    const A = { daten: {}, rechnung: {}, bau: {} };
    for (const [k, v] of Object.entries(PC)) if (typeof v !== "function") A.daten[k] = k === "TOR_HUELLE" ? "(Tafel, eigene Zeile)" : sha(json(v));
    for (const [id, pre] of Object.entries(PC.PRESETS)) {
        const gp = PC.gateParams(pre), R = {};
        const versuch = (n, f) => { try { R[n] = sha(json(f())); } catch (e) { R[n] = "wirft " + e.message.slice(0, 40); } };
        versuch("gateParams", () => gp);
        versuch("deriveGate", () => PC.deriveGate(gp));
        versuch("membranUniforms", () => PC.membranUniforms(gp));
        versuch("membranPalette", () => PC.membranPalette(gp));
        versuch("messen", () => PC.messen(pre.s));
        versuch("archProfile", () => PC.archProfile(gp));
        A.rechnung[id] = R;
        for (const [seed, ov] of [[7, null], [12345, null]]) {
            const g = PC.buildInstance(id, seed, 0, ov);
            g.updateMatrixWorld(true);
            const L = [];
            g.traverse((o) => { L.push({ typ: o.isMesh ? o.geometry.type : o.type, name: o.name, mw: sha(json(o.matrixWorld.elements)), geo: o.isMesh ? geoBytes(o.geometry) : "-", mat: o.isMesh ? matBytes(o.material) : "-", vis: o.visible, rO: o.renderOrder, ud: sha(json(o.userData || {})) }); });
            A.bau[id + "-s" + seed] = L;
        }
    }
    return A;
}
const V = aufnahme(lade(process.argv[3]));
const N = aufnahme(lade(process.argv[4]));
let gleich = 0, ungleich = [];
for (const k of Object.keys(V.daten)) (V.daten[k] === N.daten[k] ? gleich++ : ungleich.push("daten." + k));
for (const id of Object.keys(V.rechnung)) for (const k of Object.keys(V.rechnung[id])) (V.rechnung[id][k] === N.rechnung[id][k] ? gleich++ : ungleich.push(`rechnung.${id}.${k}`));
const wirft = Object.values(N.rechnung).flatMap((R) => Object.values(R)).filter((v) => /^wirft/.test(v)).length;
console.log(`Rechnungen je Rezept: ${Object.keys(N.rechnung.drachentor).join(" · ")} — davon werfen ${wirft} (vorher wie nachher dieselbe Antwort)`);
console.log(`Daten und Rechnungen: ${gleich} gleich, ${ungleich.length} ungleich ${ungleich.join(" ")}`);
let objekte = 0, rr = 0, rrGeo = 0, sonst = 0, sonstGleich = 0, rahmenGleich = 0, abw = [];
for (const k of Object.keys(V.bau)) {
    const a = V.bau[k], b = N.bau[k];
    if (a.length !== b.length) { abw.push(`${k}: ${a.length} != ${b.length} Objekte`); continue; }
    for (let i = 0; i < a.length; i++) {
        objekte++;
        const x = a[i], y = b[i];
        const rahmen = x.typ === y.typ && x.name === y.name && x.mw === y.mw && x.mat === y.mat && x.vis === y.vis && x.rO === y.rO && x.ud === y.ud;
        if (rahmen) rahmenGleich++; else abw.push(`${k}#${i} ${x.typ}: Rahmen`);
        if (x.typ === "TubeGeometry" || x.typ === "TorusGeometry") { rr++; if (x.geo !== y.geo) rrGeo++; }
        else { sonst++; if (x.geo === y.geo) sonstGleich++; else abw.push(`${k}#${i} ${x.typ}: Geometrie`); }
    }
}
console.log(`Bau (7 Tore × 2 Saaten): ${objekte} Objekte · Rahmen (Typ, Name, Weltmatrix, Material, Sicht, Reihenfolge, userData) gleich ${rahmenGleich}/${objekte}`);
console.log(`  übrige Geometrie (Kasten, Zylinder, Membran, Form …) byte-gleich ${sonstGleich}/${sonst} · Röhren und Ringe ${rr}, davon neu geteilt ${rrGeo}`);
console.log(abw.length ? "ABWEICHUNG: " + abw.slice(0, 12).join(" · ") : "keine Abweichung außerhalb der Röhren und Ringe");
const T0 = lade(process.argv[3]).TOR_HUELLE, T1 = lade(process.argv[4]).TOR_HUELLE, td = [];
let tz = 0;
for (const id of Object.keys(T0)) { const a = [T0[id].oberkante, ...T0[id].seiten.flat()], b = [T1[id].oberkante, ...T1[id].seiten.flat()]; a.forEach((v, j) => { tz++; if (v !== b[j]) td.push(`${id}[${j}] ${v}→${b[j]}`); }); }
console.log(`TOR_HUELLE: ${tz} Zahlen, ${td.length} geändert ${td.join(" · ")}`);
