// p95-gruppen.cjs <roh.json …> — die Täter-Tafel je System (nachgebaut nach w4-stadt-takt2, dieselbe Rechnung): je Lauf der
// CPU-Takt p95, je Gruppe die Spitze (Mittel der Takte ab p95), die Mitte (p40–p60) und die Senkung des p95 ohne die Gruppe.
const fs = require("fs");
const { SYSTEME: SYS } = require(__dirname + "/system-tafel.cjs");
const GRUPPEN = {
    "Bewohner + Leib-Löser": ["Bewohner", "Leib-Löser/Physik", "Tiere/Vögel"],
    Verkehr: ["Verkehr"],
    "Streaming/Ingest Chunks+Bauten": ["Streaming Chunks", "Ingest Bauten", "Satz-Pool", "Upload (Puffer)"],
    Streu: ["Streu"],
    "Stufen-Wahl": ["Stufen-Wahl"],
    "Szenen-Pflege": ["Szene: Kehraus", "Szene: Pass-Wahl", "Szene: Graph r184", "Szenen-Pflege"],
    "Befehls-Kodierung + Knoten-Bau": ["Befehls-Kodierung", "Knoten-Bau"],
    GC: ["GC"],
};
const EINZELN = process.env.EINZELN === "1";
const q = (a, p) => {
    const s = a.slice().sort((x, y) => x - y);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};
const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
const res = {};
const basis = [];
const p50s = [];
const p99s = [];
const spitze = {};
const mitte = {};
const gruppenVon = EINZELN ? Object.fromEntries([...SYS.map((s) => [s[0], [s[0]]]), ["GC", ["GC"]]]) : GRUPPEN;
for (const datei of process.argv.slice(2)) {
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
    const T = roh.takte,
        nT = T.t.length;
    const versatz = spur.marken.map((m, i) => m - T.c0[i] * 1000).sort((x, y) => x - y)[nT >> 1];
    let s0 = 0;
    const takte = [];
    for (let i = 0; i < nT; i++) {
        if (!T.g[i]) continue;
        const lo = T.c0[i] * 1000 + versatz,
            hi = T.c1[i] * 1000 + versatz;
        while (s0 < zeiten.length && zeiten[s0] < lo) s0++;
        const z = {};
        let n = 0;
        for (let s = s0; s < zeiten.length && zeiten[s] < hi; s++) {
            const k = system(p.samples[s]);
            z[k] = (z[k] || 0) + 1;
            n++;
        }
        const cpu = T.c1[i] - T.c0[i];
        for (const k in z) z[k] = (z[k] / n) * cpu;
        const g = {};
        for (const [gn, kl] of Object.entries(gruppenVon)) g[gn] = kl.reduce((a, k) => a + (z[k] || 0), 0);
        g["Rest"] = cpu - Object.values(g).reduce((a, b) => a + b, 0);
        takte.push({ cpu, g });
    }
    const cpus = takte.map((x) => x.cpu);
    const p95 = q(cpus, 0.95),
        p40 = q(cpus, 0.4),
        p60 = q(cpus, 0.6);
    basis.push(p95);
    p50s.push(q(cpus, 0.5));
    p99s.push(q(cpus, 0.99));
    const sp = takte.filter((x) => x.cpu >= p95),
        mi = takte.filter((x) => x.cpu >= p40 && x.cpu <= p60);
    for (const gn of [...Object.keys(gruppenVon), "Rest"]) {
        (res[gn] || (res[gn] = [])).push(p95 - q(takte.map((x) => x.cpu - x.g[gn]), 0.95));
        (spitze[gn] || (spitze[gn] = [])).push(sp.reduce((a, x) => a + x.g[gn], 0) / sp.length);
        (mitte[gn] || (mitte[gn] = [])).push(mi.reduce((a, x) => a + x.g[gn], 0) / mi.length);
    }
}
console.log(
    "CPU-Takt p95 je Lauf: " + basis.map((x) => x.toFixed(1)).join(" · ") + "  (Median " + med(basis).toFixed(1) + ")" +
        "  p50 Median " + med(p50s).toFixed(1) + "  p99 Median " + med(p99s).toFixed(1)
);
console.log("System                              Spitze ms/Takt (Median)  Mitte   p95 ohne es: Senkung je Lauf (Median)");
for (const gn of Object.keys(res).sort((a, b) => med(res[b]) - med(res[a])))
    console.log(
        gn.padEnd(34) + med(spitze[gn]).toFixed(1).padStart(10) + med(mitte[gn]).toFixed(1).padStart(10) + "     " +
            res[gn].map((x) => ("−" + x.toFixed(1)).padStart(7)).join("") + "   (−" + med(res[gn]).toFixed(1) + ")"
    );
