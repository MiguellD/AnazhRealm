// DER PREIS JE AKT DER DAUER (Leser 2, 26.11.): an der Seite der Werkbank der Heap nach dem Collector (/wirt heap: 3 × GC,
// Runtime.getHeapUsage) vor und nach JEDEM Akt, den die Dauer-Probe in ihr Fenster legt — SEITE.torbau (Haus bauen, Tor hinein und
// heraus, Haus abreißen), SEITE.nacht (die Uhr 0 → 0,5) — je dreimal: wächst der Heap bei jedem Gang gleich, hält das SPIEL (ein Leck
// je Akt); wächst er nur beim ersten, ist es ein einmaliger Aufbau (Shader, Pool, Gesetz-Cache).
//   node akt-heap.cjs <stationen-dir> [akt=torbau,nacht] [n=3]
const http = require("http"), path = require("path");
const PORT = Number(process.env.WERKBANK_PORT || 24600);
const ruf = (weg, b) => new Promise((ok, no) => {
    const d = JSON.stringify(b || {});
    const q = http.request({ host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(d) }, timeout: 300000 }, (r) => {
        let s = "";
        r.on("data", (c) => (s += c));
        r.on("end", () => { try { ok(JSON.parse(s)); } catch (_e) { ok({ roh: s }); } });
    });
    q.on("error", no);
    q.on("timeout", () => q.destroy(new Error("frist " + weg)));
    q.end(d);
});
const st = require(path.resolve(process.argv[2], "g6.js")).find((s) => s.probe && Array.isArray(s.probe.befehl) && s.probe.befehl[3] === "dauer");
const SEITE = JSON.parse(/const SEITE = (\{.*?\}); const PB_ZELLEN/.exec(st.probe.befehl[2])[1]);
const akte = (process.argv[3] || "torbau,nacht").split(","), N = Number(process.argv[4] || 3);
(async () => {
    const lage = await ruf("/eval", { code: "const p = r.state.playerMesh.position; return { ort: [Math.round(p.x), Math.round(p.z)], kreaturen: r.state.creatures.length, uhr: r.state.timeOfDay }" });
    console.log("Seite " + JSON.stringify(lage.ergebnis || lage));
    for (const akt of akte)
        for (let i = 1; i <= N; i++) {
            const vor = await ruf("/wirt", { gib: false, heap: true });
            const t0 = Date.now();
            const o = await ruf("/eval", { code: SEITE[akt] });
            const ms = Date.now() - t0;
            const nach = await ruf("/wirt", { gib: true, heap: true });
            console.log(akt + " " + i + " · " + ms + " ms · " + JSON.stringify(o.ergebnis || o.fehler || o).slice(0, 80) + " · Heap nach dem Collector " + vor.heapVor + " → " + nach.heapNach + " MB (" + (nach.heapNach - vor.heapVor >= 0 ? "+" : "") + (nach.heapNach - vor.heapVor).toFixed(1) + ") · lebend " + (nach.haelt || []).length);
        }
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
