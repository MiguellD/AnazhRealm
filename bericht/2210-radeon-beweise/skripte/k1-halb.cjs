// k1-halb.cjs — die halbe Welt nach dem Tab-Tod beim Namen: dasselbe Profil (profil-echt-k1-kopf), Stand im Speicher gegen
// die geladene Welt — stein_block im JSON (localStorage + IDB) gegen state.architectures direkt nach dem Weltbild und 15 s später,
// dazu je fehlendem Block der Grund aus dem Restore-Log.
const path = require("path");
const WT = process.env.WT;
const puppeteer = require(WT + "/node_modules/puppeteer");
const { echteWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const { statikServer } = require(WT + "/scripts/lib/welt-boot.cjs");
const PORT = 7904, S = process.env.OUT_DIR;
(async () => {
    const server = statikServer({});
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: false, userDataDir: path.join(S, "profil-echt-k1-kopf"), protocolTimeout: 600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 }, args: [...echteWebGpuArgs(), "--window-size=1940,1200"] });
    const page = (await browser.pages())[0];
    const log = [];
    page.on("console", (m) => log.push(m.text()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(async () => { while (!(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa)) await new Promise((r) => setTimeout(r, 250)); });
    const zaehl = () => page.evaluate(async () => {
        const r = window.anazhRealm, st = r.state, id = st.worldMeta.worldId;
        const ls = JSON.parse(localStorage.getItem("anazhRealmState_" + id) || "{}");
        const idb = await new Promise((ok) => { const q = indexedDB.open("anazhRealm"); q.onerror = () => ok(null); q.onsuccess = () => { try { const db = q.result, n = [...db.objectStoreNames]; const t = db.transaction(n[0]).objectStore(n[0]).get(id); t.onsuccess = () => ok({ store: n, v: t.result && JSON.parse(t.result.json) }); t.onerror = () => ok({ store: n }); } catch (e) { ok({ fehler: String(e) }); } }; });
        const blk = (a) => (a || []).filter((x) => x.type === "stein_block");
        const welt = blk(st.architectures), lsB = blk(ls.architectures), idbB = idb && idb.v ? blk(idb.v.architectures) : null;
        const ids = new Set(welt.map((x) => x.id));
        const fehlt = (idbB || lsB).filter((x) => !ids.has(x.id)).map((x) => ({ id: x.id, p: x.position && [x.position.x, x.position.y, x.position.z].map((v) => +(+v).toFixed(2)) }));
        return { welt: welt.length, ls: lsB.length, idb: idbB && idbB.length, store: idb && idb.store, fehlt: fehlt.slice(0, 12), nFehlt: fehlt.length };
    });
    const a = await zaehl();
    await new Promise((r) => setTimeout(r, 15000));
    const b = await zaehl();
    const grund = log.filter((t) => /stein_block|Architektur|abgelehnt|verworfen|weicht|blocked|kollid/i.test(t)).slice(0, 30).map((t) => t.slice(0, 220));
    console.log(JSON.stringify({ sofort: a, nach15s: b, grund }, null, 1));
    await browser.close(); server.close(); process.exit(0);
})().catch((e) => { console.error("FEHLER", e && e.stack); process.exit(1); });
