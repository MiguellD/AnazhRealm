"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const PORT = 8002;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { window.__anazhForceFoundry = true; window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        while (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") await sleep(100);
        const r = window.anazhRealm; const st = r.state;
        const tick = async (n, ms) => { for (let i = 0; i < n; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} await sleep(ms || 30); } };
        await r._foundryAwaitBook(45000);
        await tick(60, 40);
        const res = {};
        for (const [x, z] of [[-744, -1356], [-789, -1331], [-904, -975]]) {
            st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            const dl = performance.now() + 45000; let n = 0;
            while (performance.now() < dl) { await tick(5, 40); n++; if (n >= 6 && !r._weltbildFehlt().length) break; }
            const P = st.playerMesh.position;
            const natur = st.architectures.filter((a) => a && a.position && r._istNatur(a) && Math.hypot(a.position.x - P.x, a.position.z - P.z) < 60);
            let inst = 0, instNah = 0, vis = 0;
            const v = new THREE.Vector3(); const m4 = new THREE.Matrix4();
            st.scene.traverse((o) => {
                if (!o.isInstancedMesh || !o.userData || !o.userData.archInstanceKey) return;
                const k = o.material && o.material.userData ? o.material.userData.foundryKind : null;
                if (k !== "bark") return;
                inst++; if (o.visible) vis++;
                for (let i = 0; i < o.count; i++) { m4.fromArray(o.instanceMatrix.array, i * 16); m4.premultiply(o.matrixWorld); v.setFromMatrixPosition(m4); if (Math.hypot(v.x - P.x, v.z - P.z) < 40) instNah++; }
            });
            const streu = st.nahStreu ? Array.from(st.nahStreu.senken.values()).filter((a) => a.anzahl > 0).map((a) => a.preset) : [];
            res[x + "/" + z] = { y: P.y, fehlt: r._weltbildFehlt(), natur: natur.length, naturTypen: [...new Set(natur.map((a) => a.type))].slice(0, 10), rendered: natur.filter((a) => r._archIsRendered(a)).length, inst, vis, instNah, streu: [...new Set(streu)].slice(0, 20), scatterRegs: st.scatterRegions ? st.scatterRegions.size : null };
        }
        return res;
    });
    console.log(JSON.stringify(out, null, 1));
    await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(2); });
