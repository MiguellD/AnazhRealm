// D1-Spike: der Vertex-Anteil am VRAM, je Attribut-Name und Klasse (nach `werkbank puffer`, also nach GC + gezaehltem Frame).
const st = r.state;
const rend = st.renderer;
const be = rend.backend;
const reg = rend.info.memoryMap;
const wer = new Map(); // Attribut -> {name, klasse}
const merke = (a, name, kl) => {
    if (!a) return;
    const x = a.isInterleavedBufferAttribute ? a.data : a;
    if (!wer.has(a)) wer.set(a, { name, kl });
    if (x !== a && !wer.has(x)) wer.set(x, { name, kl });
};
const geo = (g, kl) => {
    if (!g || !g.attributes) return;
    for (const k in g.attributes) merke(g.attributes[k], k, kl);
    if (g.index) merke(g.index, "index", kl);
};
st.scene.traverse((o) => {
    if (!o.geometry && !o.isInstancedMesh) return;
    const kl = r._taeterKlasse(o);
    geo(o.geometry, kl);
    if (o.geometry && o.geometry.__instanzQuelle) geo(o.geometry.__instanzQuelle, kl);
    if (o.isInstancedMesh) {
        merke(o.instanceMatrix, "instanceMatrix", kl);
        merke(o.instanceColor, "instanceColor", kl);
    }
});
const cache = r._foundry && r._foundry.cache;
if (cache)
    for (const [key, g] of cache) {
        if (!g || typeof g !== "object") continue;
        const kl = "ruhend:" + String(key).split("|")[0];
        for (const ch of g.children || []) geo(ch.geometry, kl);
        const fl = g._foundryFlat;
        if (fl && Array.isArray(fl.leaves))
            for (const lf of fl.leaves) {
                geo(lf.geom, kl);
                geo(lf._schattenGeom, kl);
            }
    }
const fam = (kl) => {
    const m = /^(f|fimp|fscatter):([^:|]+)/.exec(kl);
    if (m) {
        const rz = r._foundry && r._foundry.recipes ? r._foundry.recipes[m[2]] : null;
        return m[1] + ":" + (rz && rz.kind ? rz.kind : m[2]);
    }
    return kl.split(/[:|]/)[0];
};
const jeTyp = {},
    jeName = {},
    jeKlName = {},
    jeForm = {};
let sum = 0,
    vertex = 0,
    sparPos = 0,
    sparNor = 0,
    sparUv = 0,
    sparFarbe = 0,
    nVert = 0;
for (const [a, v] of reg) {
    if (!a || a.isTexture || !v || typeof v !== "object" || !/ttributes$/.test(v.type || "")) continue;
    const d = be.get(a.isInterleavedBufferAttribute ? a.data : a);
    const b = d && d.buffer ? d.buffer.size : v.size || 0;
    sum += b;
    jeTyp[v.type] = (jeTyp[v.type] || 0) + b;
    if (v.type !== "attributes") continue;
    const inst = a.isInstancedBufferAttribute === true;
    const w = wer.get(a) || { name: "?", kl: "?" };
    const nm = inst ? "inst:" + w.name : w.name;
    if (!inst) vertex += b;
    jeName[nm] = (jeName[nm] || 0) + b;
    const kk = fam(w.kl) + " " + nm;
    jeKlName[kk] = (jeKlName[kk] || 0) + b;
    const arr = a.isInterleavedBufferAttribute ? a.data.array : a.array;
    const form = (arr && arr.constructor.name) + "x" + a.itemSize + (a.normalized ? "n" : "");
    jeForm[nm + " " + form] = (jeForm[nm + " " + form] || 0) + b;
    if (inst || !arr || arr.constructor !== Float32Array) continue;
    const n = a.count;
    if (w.name === "position") {
        sparPos += b - n * 8;
        nVert += n;
    } else if (w.name === "normal" && a.itemSize === 3) sparNor += b - n * 4;
    else if (w.name === "uv" && a.itemSize === 2) sparUv += b - n * 4;
    else if (w.name === "color" && a.itemSize === 3) sparFarbe += b - n * 8;
}
const mb = (x) => +(x / 1048576).toFixed(2);
const top = (o, n) =>
    Object.entries(o)
        .sort((x, y) => y[1] - x[1])
        .slice(0, n)
        .map(([k, b]) => k + " " + mb(b));
const V = window.__vram || {};
return {
    vramMB: mb((V.puffer || 0) + (V.texturen || 0)),
    abgriffPufferMB: mb(V.puffer || 0),
    abgriffTexturenMB: mb(V.texturen || 0),
    infoTotalMB: mb(rend.info.memory.total),
    attributeMB: mb(sum),
    jeTyp: Object.fromEntries(Object.entries(jeTyp).map(([k, b]) => [k, mb(b)])),
    vertexMB: mb(vertex),
    vertexAnteilVram: +(vertex / ((V.puffer || 0) + (V.texturen || 0))).toFixed(3),
    vertexAnteilPuffer: +(vertex / (V.puffer || 1)).toFixed(3),
    vertices: nVert,
    sparbarMB: { position16: mb(sparPos), normale8: mb(sparNor), uv16: mb(sparUv), farbeHalf: mb(sparFarbe) },
    jeName: top(jeName, 20),
    jeKlasseName: top(jeKlName, 30),
    jeForm: top(jeForm, 20),
};
