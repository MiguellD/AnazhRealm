// SCRATCH (wird nicht committet): erkundet die Szene um den Spieler, headless.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const PORT = Number(process.env.X_PORT || 8000);
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
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
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    page.on("pageerror", (e) => console.log("PAGEERR", (e.message || String(e)).split("\n")[0]));
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const dl0 = performance.now() + 90000;
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0) await sleep(100);
        const r = window.anazhRealm;
        const st = r.state;
        const tick = async (n, ms) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(ms || 30);
            }
        };
        await r._foundryAwaitBook(45000);
        const tB = performance.now();
        const dlW = performance.now() + 90000;
        while (r._weltbildFehlt().length && performance.now() < dlW) await tick(5, 60);
        const tW = performance.now() - tB;
        const P = st.playerMesh.position.clone();
        const res = { P: [P.x, P.y, P.z], tW, meshes: [] };
        st.scene.updateMatrixWorld(true);
        const v = new THREE.Vector3();
        const m4 = new THREE.Matrix4();
        st.scene.traverseVisible((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
            const g = o.geometry;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const n = o.isInstancedMesh ? o.count : 1;
            let naechst = Infinity;
            for (let i = 0; i < n; i++) {
                m4.copy(o.matrixWorld);
                if (o.isInstancedMesh) {
                    const im = new THREE.Matrix4().fromArray(o.instanceMatrix.array, i * 16);
                    m4.multiply(im);
                }
                v.copy(g.boundingSphere.center).applyMatrix4(m4);
                const sc = m4.getMaxScaleOnAxis();
                const d = v.distanceTo(P) - g.boundingSphere.radius * sc;
                if (d < naechst) naechst = d;
            }
            if (naechst > 15) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            res.meshes.push({
                name: o.name,
                typ: o.isInstancedMesh ? "inst" : o.isSkinnedMesh ? "skin" : "mesh",
                n,
                verts: g.attributes.position.count,
                d: +naechst.toFixed(1),
                kinds: mats.map((m) => (m && m.userData && m.userData.foundryKind) || (m && m.type) || "?"),
                mask: mats.map((m) => !!(m && m.maskNode)),
                ud: Object.keys(o.userData || {}).slice(0, 6),
                eltern: o.parent ? o.parent.name || o.parent.type : null,
            });
        });
        return res;
    });
    console.log(JSON.stringify(out, null, 1).slice(0, 20000));
    console.log("Laufzeit", ((Date.now() - t0) / 1000).toFixed(1), "s");
    await browser.close();
    server.close();
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
