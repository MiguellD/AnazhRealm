// rest-fn.cjs <roh.json> [system] — in den Takten ab p95 (und der Mitte) die Selbst-Zeit je Funktion eines Systems (Vorgabe
// Rest) mit der Kette ihrer Stamm-Rahmen: was die Klassierung nicht nennt.
const fs = require("fs");
const { SYSTEME: SYS } = require(__dirname + "/system-tafel.cjs");
const [datei, wahl = "Rest", wo = "spitze"] = process.argv.slice(2);
const { roh, spur } = JSON.parse(fs.readFileSync(datei, "utf8"));
const p = spur.profil,
    knoten = new Map();
for (const n of p.nodes) knoten.set(n.id, { n, eltern: null });
for (const n of p.nodes) for (const c of n.children || []) if (knoten.has(c)) knoten.get(c).eltern = n.id;
    for (const n of p.nodes) if (n.parent != null && knoten.has(n.parent)) knoten.get(n.id).eltern = n.parent;
const zeiten = new Float64Array(p.samples.length);
let t = p.startTime;
for (let i = 0; i < p.samples.length; i++) zeiten[i] = t += p.timeDeltas[i] || 0;
const cache = new Map();
const system = (id) => {
    if (cache.has(id)) return cache.get(id);
    const k = knoten.get(id);
    const fn = k.n.callFrame.functionName || "";
    let s = fn === "(garbage collector)" ? "GC" : null;
    for (const [nm, re] of SYS) if (!s && re.test(fn)) s = nm;
    if (!s) s = k.eltern == null ? "Rest" : system(k.eltern);
    cache.set(id, s);
    return s;
};
const kette = (id) => {
    const ks = [];
    for (let x = id; x != null; x = knoten.get(x).eltern) {
        const c = knoten.get(x).n.callFrame;
        if (c.functionName) ks.push(c.functionName);
    }
    return ks.slice(0, 7).reverse().join(" › ");
};
const T = roh.takte,
    nT = T.t.length;
const versatz = spur.marken.map((m, i) => m - T.c0[i] * 1000).sort((x, y) => x - y)[nT >> 1];
const cpus = [];
for (let i = 0; i < nT; i++) if (T.g[i]) cpus.push(T.c1[i] - T.c0[i]);
const sortiert = cpus.slice().sort((a, b) => a - b);
const s95 = sortiert[Math.floor(0.95 * sortiert.length)];
const s40 = sortiert[Math.floor(0.4 * sortiert.length)];
const s60 = sortiert[Math.floor(0.6 * sortiert.length)];
const summe = {};
let n = 0;
for (let i = 0; i < nT; i++) {
    if (!T.g[i]) continue;
    const c = T.c1[i] - T.c0[i];
    if (wo === "spitze" ? c < s95 : c < s40 || c > s60) continue;
    n++;
    const lo = T.c0[i] * 1000 + versatz,
        hi = T.c1[i] * 1000 + versatz;
    const ps = [];
    for (let s = 0; s < zeiten.length; s++) if (zeiten[s] >= lo && zeiten[s] < hi) ps.push(p.samples[s]);
    const g = c / ps.length;
    for (const id of ps) if (system(id) === wahl) summe[kette(id)] = (summe[kette(id)] || 0) + g;
}
console.log(`${wahl} in ${n} Takten (${wo}), ms je Takt:`);
for (const [k, v] of Object.entries(summe).sort((a, b) => b[1] - a[1]).slice(0, 45)) console.log((v / n).toFixed(2).padStart(7) + "  " + k);
