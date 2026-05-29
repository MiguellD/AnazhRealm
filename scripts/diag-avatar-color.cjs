// Diagnose V12.0-f.x — Avatar-Weiß-Bug: driftet material.color zu Weiß (Logik)
// oder bleibt korrekt (Render-Bug)? Headless liest material.color deterministisch,
// unabhängig vom Renderer.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4317;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Game-Loop pumpen bis der Avatar gebaut ist (Worldgen async).
    await page.evaluate(async () => {
        const start = performance.now();
        const deadline = start + 20000;
        while (performance.now() < deadline) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* pageerror-Listener fängt */
                }
                if (r.state && r.state.playerMesh) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { materials: [], ticks: [], structure: [] };
        // Material-Struktur des Avatars dumpen.
        const seen = new Set();
        r.state.playerMesh.traverse((node) => {
            const tag = `${node.type}${node.isMesh ? "(mesh)" : ""}${node.isSprite ? "(sprite)" : ""}`;
            const matInfo = node.material
                ? {
                      cls: node.material.constructor && node.material.constructor.name,
                      isMeshToon: !!node.material.isMeshToonMaterial,
                      hasColor: !!node.material.color,
                      color: node.material.color ? node.material.color.getHexString() : null,
                      hasGradient: !!node.material.gradientMap,
                      hasColorNode: !!node.material.colorNode,
                      vertexColors: !!node.material.vertexColors,
                      emissive: node.material.emissive ? node.material.emissive.getHexString() : null,
                      shared: node.material.uuid,
                  }
                : null;
            out.structure.push({ tag, name: node.name || "", mat: matInfo });
            if (node.material && node.material.color && !seen.has(node.material.uuid)) {
                seen.add(node.material.uuid);
                out.materials.push({ uuid: node.material.uuid, baseColor: node.material.color.getHexString() });
            }
        });
        // Player-Emotionen + statTags (Aura-Hue-Quelle).
        out.emotions = r.state.player && r.state.player.emotions ? { ...r.state.player.emotions } : null;
        out.statTags = r.state.player && r.state.player.statTags ? { ...r.state.player.statTags } : null;
        out.hp = r.state.player ? { hp: r.state.player.hp, hpMax: r.state.player.hpMax } : null;
        // Aura-Tick mehrfach laufen lassen + Farbe pro Tick lesen.
        const readColors = () => {
            const cols = [];
            const s = new Set();
            r.state.playerMesh.traverse((node) => {
                if (node.isMesh && node.material && node.material.color && !s.has(node.material.uuid)) {
                    s.add(node.material.uuid);
                    cols.push(node.material.color.getHexString());
                }
            });
            return cols;
        };
        out.ticks.push({ tick: 0, colors: readColors() });
        if (typeof r.tickPlayerAura === "function") {
            for (let i = 1; i <= 30; i++) {
                r.tickPlayerAura();
                if (i <= 5 || i % 5 === 0) out.ticks.push({ tick: i, colors: readColors() });
            }
        } else {
            out.ticks.push({ tick: "NO_tickPlayerAura_method", colors: [] });
        }
        // _auraBaseColor-Cache inspizieren.
        out.auraBaseCaches = [];
        r.state.playerMesh.traverse((node) => {
            if (node.isMesh && node.material) {
                out.auraBaseCaches.push({
                    matBase: node.material.userData ? node.material.userData._auraBaseColor : "no-userData",
                    nodeBase: node.userData ? node.userData._auraBaseColor : "no-userData",
                });
            }
        });
        return out;
    });
    console.log("\n========= AVATAR-COLOR-DIAGNOSE =========\n");
    console.log("HP:", JSON.stringify(report.hp));
    console.log("Emotionen:", JSON.stringify(report.emotions));
    console.log("statTags:", JSON.stringify(report.statTags));
    console.log("\n--- Material-Struktur (Avatar-Traverse) ---");
    for (const s of report.structure) {
        console.log(`  ${s.tag} "${s.name}"`, s.mat ? JSON.stringify(s.mat) : "(kein Material)");
    }
    console.log("\n--- Unique Materials mit color ---");
    for (const m of report.materials) console.log(`  ${m.uuid.slice(0, 8)} base=#${m.baseColor}`);
    console.log("\n--- Farb-Verlauf über Aura-Ticks (Drift-Test) ---");
    for (const t of report.ticks) console.log(`  tick ${t.tick}: [${t.colors.map((c) => "#" + c).join(", ")}]`);
    console.log("\n--- _auraBaseColor-Caches ---");
    for (const c of report.auraBaseCaches)
        console.log(
            `  matBase=${typeof c.matBase === "number" ? "#" + c.matBase.toString(16) : c.matBase}  nodeBase=${typeof c.nodeBase === "number" ? "#" + c.nodeBase.toString(16) : c.nodeBase}`
        );
    console.log("\n=========================================\n");
    await browser.close();
    server.close();
})();
