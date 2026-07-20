// selbst-spielen.cjs — ICH SPIELE SELBST (echtes WebGPU): Tag erzwingen, lange
// laufen, Screenshots VOR und NACH der Entlassungs-Frist — das Auge urteilt.
const puppeteer = require("/home/user/AnazhRealm/node_modules/puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4485;
const realRoot = "/home/user/AnazhRealm";
const outDir = "/tmp/claude-0/-home-user-AnazhRealm/477da805-934f-5a54-b233-66f56a758e76/scratchpad";
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(realRoot, p);
    if (!fp.startsWith(realRoot)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("content-type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 480 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const loopErrors = [];
    page.on("console", (m) => {
        const t = m.text();
        if (t.includes("Loop-Frame-Fehler") || t.includes("[ERROR]")) loopErrors.push(t.slice(0, 200));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Boot abwarten + Tag erzwingen:
    await page.evaluate(async () => {
        const dl = performance.now() + 90000;
        while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.playerMesh) && performance.now() < dl)
            await new Promise((r) => setTimeout(r, 300));
        const r = window.anazhRealm;
        if (r.state.world) r.state.world.timeOfDay = 0.5; // Mittag
    });
    const stats = async () => {
        return page.evaluate(() => {
            const r = window.anazhRealm;
            const z = r._flightRecorderHeapZensus();
            const inf = r.state.renderer && r.state.renderer.info;
            return {
                tod: r.state.world ? +r.state.world.timeOfDay.toFixed(2) : null,
                dc: inf && inf.render ? inf.render.drawCalls : null,
                tris: inf && inf.render ? Math.round((inf.render.triangles || 0) / 1000) + "k" : null,
                chunkE: z && z.halter ? z.halter.chunkEntlassenN : null,
                batchE: z && z.halter ? z.halter.batchEntlassenN : null,
                fehlerN: (r.state._loopErrorCount || 0),
            };
        });
    };
    const schuss = async (name) => {
        await page.screenshot({ path: path.join(outDir, name) });
        console.log("SCHUSS", name, JSON.stringify(await stats()), "loopErrs:", loopErrors.length, "pageErrs:", pageErrors.length);
    };
    await new Promise((r) => setTimeout(r, 15000));
    await schuss("spiel-t15.png");
    await new Promise((r) => setTimeout(r, 45000)); // > Gnadenfrist 10s + Streaming
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (r.state.world) r.state.world.timeOfDay = 0.5;
    });
    await schuss("spiel-t60.png");
    await new Promise((r) => setTimeout(r, 60000));
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (r.state.world) r.state.world.timeOfDay = 0.5;
    });
    await schuss("spiel-t120.png");
    if (loopErrors.length) console.log("LOOP-FEHLER (erste 3):", loopErrors.slice(0, 3).join(" || "));
    if (pageErrors.length) console.log("PAGE-FEHLER (erste 3):", pageErrors.slice(0, 3).join(" || "));
    await browser.close();
    server.close();
})();
