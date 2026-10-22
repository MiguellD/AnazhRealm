// k1-wer.cjs — wer nimmt die Blöcke? Dasselbe Profil und derselbe Ursprung wie echt-k1 (Port 7904), W gehalten, alle 1,5 s ein
// stein_block 6 m rechts + ein Graben 5 m links (wie echt-k1); je saveState die Zahl der Blöcke, jeder removeArchitecture-Ruf mit Stapel.
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
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(async () => { while (!(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa)) await new Promise((r) => setTimeout(r, 250)); });
    await page.bringToFront();
    await page.evaluate(() => {
        const r = window.anazhRealm, P = Object.getPrototypeOf(r), st = r.state;
        const blk = () => (st.architectures || []).filter((a) => a.type === "stein_block").length;
        window.__wer = { saves: [], weg: [], spawn: [] };
        const sv = P.saveState; P.saveState = function () { window.__wer.saves.push([performance.now() | 0, blk()]); return sv.apply(this, arguments); };
        const rm = P.removeArchitecture; P.removeArchitecture = function (e) { if (e && e.type === "stein_block") window.__wer.weg.push([performance.now() | 0, String(new Error().stack).split("\n").slice(2, 7).map((z) => z.trim().slice(0, 90))]); return rm.apply(this, arguments); };
        const sp = P.spawnArchitecture; P.spawnArchitecture = function (t) { const v = sp.apply(this, arguments); if (t === "stein_block") window.__wer.spawn.push([performance.now() | 0, !!v, blk()]); return v; };
        // auch ein direktes Kürzen der Liste: wer die Länge senkt, ohne removeArchitecture
        let vor = blk(); const iv = setInterval(() => { const n = blk(); if (n < vor) window.__wer.weg.push([performance.now() | 0, "Liste " + vor + " -> " + n]); vor = n; }, 100);
    });
    if (process.env.START_Z) await page.evaluate(async (x, z) => { const r = window.anazhRealm, p = r.state.playerMesh.position; p.set(x, r._terrainMacroSurfaceY(x, z) + 1, z); for (let i = 0; i < 120; i++) await new Promise((f) => requestAnimationFrame(f)); }, +process.env.START_X, +process.env.START_Z);
    const cdp = await page.target().createCDPSession();
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: 960, y: 540, button: "left", clickCount: 1 });
    await new Promise((r) => setTimeout(r, 500));
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", code: "KeyW", key: "w", windowsVirtualKeyCode: 87, text: "w" });
    const bauer = setInterval(() => page.evaluate(() => { const r = window.anazhRealm, p = r.state.playerMesh.position;
        r.spawnArchitecture("stein_block", { x: p.x + 6, y: r._terrainMacroSurfaceY(p.x + 6, p.z), z: p.z }, { silent: true });
        r.carveVoxelSphere(p.x - 5, r._terrainMacroSurfaceY(p.x - 5, p.z), p.z, 1.5); }).catch(() => {}), 1500);
    await new Promise((r) => setTimeout(r, 25000));
    clearInterval(bauer);
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", code: "KeyW", key: "w", windowsVirtualKeyCode: 87 });
    await new Promise((r) => setTimeout(r, 6000));
    const w = await page.evaluate(() => Object.assign(window.__wer, { pos: window.anazhRealm.state.playerMesh.position.toArray().map((v) => +v.toFixed(1)), genesis: window.anazhRealm.GENESIS_PLATZ || window.anazhRealm.constructor.GENESIS_PLATZ || null }));
    console.log(JSON.stringify(w, null, 1));
    await browser.close(); server.close(); process.exit(0);
})().catch((e) => { console.error("FEHLER", e && e.stack); process.exit(1); });
