// GEGNER Zwilling und Schluessel (15.11.): Heimat -> Ziel -> Heimat ueber die EINE Tuer (_weltBetreten -> _weltWechsel),
// das Ziel traegt die Ort-Saat und (Modus delta) den Wildnis-Term der Tafel "heiss-trocken" (ENTSCHEID-REISE §3) als Erbgut
// - genau das Gesetz, das Schnitt 2 am Ziel erzeugt. Gezaehlt: Schluessel der Heimat in der Platte vorher / nach dem Ziel /
// nach der Heimkehr, Treffer der Platte an den Proben der Heimat nach der Heimkehr. Null-Renderer, Platte per Haken an.
//   node scripts/gegner-platte.cjs delta|gleich
const { statikServer, nullWelt, hauptLauf } = require("./lib/welt-boot.cjs");
const server = statikServer();
const MODUS = process.argv[2] || "delta";
async function job(page, fn, arg) {
    await page.evaluate((src, a) => {
        window.__jobDone = false;
        const f = new Function("return (" + src + ")")();
        Promise.resolve().then(() => f(a)).then((o) => { window.__jobOut = o; window.__jobDone = true; })
            .catch((e) => { window.__jobOut = { err: String(e && e.stack || e).split("\n").slice(0, 3).join(" | ") }; window.__jobDone = true; });
    }, fn.toString(), arg === undefined ? null : arg);
    await page.waitForFunction(() => window.__jobDone, { timeout: 0, polling: 400 });
    return page.evaluate(() => window.__jobOut);
}
async function seite(arg) {
    /* eslint-disable no-undef */
    const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
    const welt = async (seed) => {
        for (let i = 0; i < 2400; i++) {
            const st = r.state;
            if (st && st.worldMeta && (!seed || st.worldMeta.seed === seed) && st.voxelWorkerReady && st.voxelWorkerWorldgenSynced && !r._weltTausch) return st;
            await sleep(50);
        }
        throw new Error("die Welt kam nicht (" + seed + ")");
    };
    const platte = (frage) => new Promise((ok) => {
        const req = indexedDB.open("anazhChunkMesh", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("chunks");
        req.onsuccess = () => { const db = req.result; const tx = db.transaction("chunks", "readonly"); const l = frage(tx.objectStore("chunks")); tx.oncomplete = () => { db.close(); ok(l()); }; };
        req.onerror = () => ok(null);
    });
    const zaehle = (prefix) => platte((os) => { const k = os.getAllKeys(); const s = os.get("__stamp"); return () => ({ alle: k.result.length, heimat: k.result.filter((x) => String(x).startsWith(prefix + "|")).length, stempel: s.result }); });
    const pump = async (cx, cz) => {
        for (let i = 0; i < 2400; i++) { const e = r.state.voxelChunks && r.state.voxelChunks.get(cx + "," + cz); if (e && (e.mesh || e.empty)) return e; r._ensureVoxelChunkAt(cx, cz, 0); await sleep(25); }
        return null;
    };
    const kandidaten = () => {
        const st = r.state, { span } = r._voxelChunkConfig(0), pm = st.playerMesh;
        const pcx = pm ? Math.floor(pm.position.x / span) : 0, pcz = pm ? Math.floor(pm.position.z / span) : 0, c = [];
        for (let k = 24; k < 72; k++) { const w = (k * Math.PI) / 4; const cx = pcx + (k >> 3) * Math.round(Math.cos(w)), cz = pcz + (k >> 3) * Math.round(Math.sin(w)); if (!(st.voxelChunks && st.voxelChunks.has(cx + "," + cz)) && r._chunkFootprintEditFrei(cx, cz)) c.push([cx, cz]); }
        return c;
    };
    if (arg.schritt === "heimat") {
        const st = await welt();
        const probes = [];
        for (const [cx, cz] of kandidaten()) { const e = await pump(cx, cz); if (e && e.mesh) probes.push([cx, cz]); if (probes.length >= 4) break; }
        await sleep(800);
        r.saveState();
        return { seed: st.worldMeta.seed, worldId: st.worldMeta.worldId, erbgut: r._erbgut().hash, probes, platte: await zaehle(st.worldMeta.seed) };
    }
    if (arg.schritt === "ziel") {
        const heim = r.state.worldMeta;
        const meta = { seed: arg.seed + "@17.09_61.93_0", name: "gegner-ziel", genVersion: 9 };
        if (arg.modus === "delta") meta.gesetz = { gelaende: { terme: [{ art: "wildnis", land: 0.544, hoehe: 0.899, rauhLambda: 2650, trog: 0.355, ks: 6, tafel: 0.195 }] } };
        const ab = r._weltBetreten({ worldMeta: meta });
        if (!ab.ok) return { err: "Tuer: " + ab.reason };
        await r.erwacht;
        const st = await welt(meta.seed);
        let gebaut = 0;
        for (const [cx, cz] of kandidaten()) { const e = await pump(cx, cz); if (e && e.mesh) gebaut++; if (gebaut >= 2) break; }
        await sleep(800);
        return { zielId: ab.worldId, seed: st.worldMeta.seed, erbgut: r._erbgut().hash, heimId: heim.worldId, gebaut, platte: await zaehle(arg.seed) };
    }
    if (arg.schritt === "heim") {
        r._weltWechsel(arg.heimId);
        await r.erwacht;
        const st = await welt(arg.seed);
        const vor = r.state._chunkIdbHits | 0;
        let gebaut = 0;
        for (const [cx, cz] of arg.probes) { const e = await pump(cx, cz); if (e && e.mesh) gebaut++; }
        await sleep(800);
        const byKey = st._chunkIdbHitByKey || new Map();
        return { seed: st.worldMeta.seed, erbgut: r._erbgut().hash, gebaut, treffer: (st._chunkIdbHits | 0) - vor, trefferJe: arg.probes.map(([x, z]) => byKey.get(x + "," + z + ",0") | 0), platte: await zaehle(arg.seed) };
    }
}
hauptLauf(async () => {
    const { browser, page } = await nullWelt(server, { frist: 300000, vor: () => (window.__anazhChunkIdb = true) }, 60000);
    const a = await job(page, seite, { schritt: "heimat" });
    console.log("HEIMAT", JSON.stringify(a));
    if (a.err) process.exit(1);
    const b = await job(page, seite, { schritt: "ziel", seed: a.seed, modus: MODUS });
    console.log("ZIEL  ", JSON.stringify(b));
    if (b.err) process.exit(1);
    const c = await job(page, seite, { schritt: "heim", seed: a.seed, heimId: a.worldId, probes: a.probes });
    console.log("HEIM  ", JSON.stringify(c));
    await browser.close();
    server.close();
    process.exit(0);
});
