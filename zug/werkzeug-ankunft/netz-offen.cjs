// Aufruf: node <ort>/netz-offen.cjs <netlog.json> [muster=voxel-worker] [abMs=5500]   (Lauf mit FREI_CHROME="--log-net-log=<datei>")
// netz-offen.cjs <netlog.json> [muster] [abMs] — aus Chromes Netz-Protokoll: jede Quelle (Anfrage, Cache-Transaktion, …), deren URL
// oder Schlüssel das Muster trifft, mit ihren ersten Ereignissen; dazu jede Quelle ab `abMs`, die bis zum Ende des Protokolls offen
// blieb (ein BEGIN ohne END) — worauf sie wartet.
const fs = require("fs");
const [datei, muster, ab] = [process.argv[2], new RegExp(process.argv[3] || "voxel-worker"), Number(process.argv[4] || 5500)];
let roh = fs.readFileSync(datei, "utf8");
let j;
try {
    j = JSON.parse(roh);
} catch {
    j = JSON.parse(roh.replace(/,\s*$/, "") + "]}");
}
const um = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
const [T, ST] = [um(j.constants.logEventTypes), um(j.constants.logSourceType)];
const ev = j.events;
const t0 = Number(ev[0].time);
const Q = new Map();
for (const e of ev) {
    const id = e.source && e.source.id;
    if (id == null) continue;
    let q = Q.get(id);
    if (!q) Q.set(id, (q = { typ: ST[e.source.type], e: [], url: null }));
    q.e.push(e);
    if (e.params && (e.params.url || e.params.key) && !q.url) q.url = String(e.params.url || e.params.key);
}
const kurz = (n) => n.replace("HTTP_CACHE_", "HC_").replace("URL_REQUEST_", "UR_").replace("DISK_CACHE_", "DC_").replace("HTTP_TRANSACTION_", "HT_");
console.log(`${datei.replace(/^.*[\\/]/, "")}: ${ev.length} Ereignisse bis ${Math.round(Number(ev[ev.length - 1].time) - t0)} ms`);
for (const [id, q] of Q) {
    if (!q.url || !muster.test(q.url)) continue;
    const [von, bis] = [Math.round(Number(q.e[0].time) - t0), Math.round(Number(q.e[q.e.length - 1].time) - t0)];
    if (von < ab) continue;
    console.log(`  #${id} ${q.typ} ${von} → ${bis} · ${q.e.length} Ereignisse · ${q.e.slice(0, 22).map((e) => kurz(T[e.type]) + (e.phase === 1 ? "▶" : e.phase === 2 ? "◀" : "")).join(" ").slice(0, 600)}`);
}
let offen = 0;
for (const [id, q] of Q) {
    const von = Number(q.e[0].time) - t0;
    if (von < ab) continue;
    const st = [];
    for (const e of q.e) {
        if (e.phase === 1) st.push(T[e.type]);
        else if (e.phase === 2) st.pop();
    }
    if (st.length && /URL_REQUEST|HTTP_STREAM|DISK_CACHE|HTTP_CACHE|HTTP_TRANSACTION|SOCKET/.test(st.join()) && offen++ < 30)
        console.log(`  OFFEN #${id} ${q.typ} ab ${Math.round(von)} ${String(q.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 60)} · ${st.map(kurz).join(" > ").slice(0, 200)}`);
}
console.log("offene Quellen ab " + ab + " ms: " + offen);
