// diag-look-measure.cjs — die SUBSTANZ-Wahrheit hinter dem Schöpfer-Bild (KEIN Render → schnell).
// Warum ist der Boden ROT? Reflektieren die Metalle den Himmel (scene.environment)? Wie dunkel ist PBR?
//   node scripts/diag-look-measure.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4379;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 120000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // 3×3-Ring, settlen OHNE Render (schnell)
    await page.evaluate(async () => {
        let stub = false,
            last = -1,
            stable = 0;
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state) {
                if (r.state.chunkRingRadius !== 1) r.state.chunkRingRadius = 1;
                if (!stub && r.state.renderer) {
                    r.state.renderer.render = function () {};
                    if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                    r.state.postProcessingFailed = true;
                    stub = true;
                }
            }
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last && sz >= 9) stable++;
                else ((stable = 0), (last = sz));
                if (sz >= 9 && stable > 30) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state,
            o = {};
        o.world = (s.worldMeta && s.worldMeta.name) || "?";
        o.weather = s.weather;
        o.mood = s.dominantEmotion || (s.emotions && Object.keys(s.emotions).reduce((a, b) => (s.emotions[a] > s.emotions[b] ? a : b)));
        // (1) scene.environment — reflektieren Metalle den Himmel?
        r._ensureSkyEnvironment && r._ensureSkyEnvironment(true);
        const env = s.scene && s.scene.environment;
        o.envSet = !!(env && env.isTexture);
        o.envFailed = !!s._skyEnvFailed;
        if (env && env.image && env.image.data) {
            const d = env.image.data;
            let mx = 0;
            for (let i = 0; i < d.length; i += 4) mx = Math.max(mx, d[i], d[i + 1], d[i + 2]);
            o.envMaxByte = mx; // wie hell ist die Env (0..255)? dunkle Env → dunkle Metalle
        }
        // (2) der BODEN — warum rot? Feld + die gerechnete Vertex-Farbe am Spieler-Chunk
        const pm = s.playerMesh;
        const px = pm ? pm.position.x : 0,
            pz = pm ? pm.position.z : 0;
        const f = r.worldFieldAt(px, pz);
        o.field = { lebendig: +f.lebendig.toFixed(2), dichte: +f.dichte.toFixed(2), glut: +f.glut.toFixed(2), magieleitung: +f.magieleitung.toFixed(2) };
        // die echte Vertex-Farbe eines geladenen Terrain-Chunks (Mittel über ein Sample)
        let gcol = null;
        for (const [, entry] of s.voxelChunks) {
            const m = entry && (entry.mesh || entry.terrainMesh);
            const geo = m && m.geometry;
            const ca = geo && geo.getAttribute && geo.getAttribute("color");
            if (ca && ca.count > 50) {
                let rr = 0,
                    gg = 0,
                    bb = 0,
                    nn = 0;
                for (let i = 0; i < ca.count; i += Math.max(1, (ca.count / 200) | 0)) {
                    rr += ca.getX(i);
                    gg += ca.getY(i);
                    bb += ca.getZ(i);
                    nn++;
                }
                gcol = [+(rr / nn).toFixed(3), +(gg / nn).toFixed(3), +(bb / nn).toFixed(3)];
                break;
            }
        }
        o.groundColorAvg = gcol; // [r,g,b] — ist r >> g,b? dann lava/glut-dominiert
        // (3) PBR-Dunkelheit: ambient + hemisphere-Intensität (der Schatten-Floor für Nicht-Metalle)
        o.ambient = s.ambientLight ? +s.ambientLight.intensity.toFixed(2) : null;
        o.hemi = s.hemiLight ? +s.hemiLight.intensity.toFixed(2) : null;
        o.sun = s.directionalLight ? +s.directionalLight.intensity.toFixed(2) : null;
        o.materialMode = s.atmosphere && s.atmosphere.materialMode;
        return out0(o);
        function out0(x) {
            return x;
        }
    });
    console.log("\n=== Substanz-Messung (Welt " + out.world + ", Wetter " + out.weather + ", Mood " + out.mood + ") ===");
    console.log("materialMode      :", out.materialMode);
    console.log("scene.environment :", out.envSet, "envMaxByte=" + (out.envMaxByte ?? "?") + " (255=hell; <120=Metalle dunkel)", out.envFailed ? "FAILED" : "");
    console.log("Boden-Feld@Spieler:", JSON.stringify(out.field));
    console.log("Boden-Farbe Ø     :", JSON.stringify(out.groundColorAvg), out.groundColorAvg && out.groundColorAvg[0] > out.groundColorAvg[1] * 1.3 ? "→ ROT-dominiert (lava/glut)" : "");
    console.log("Licht ambient/hemi/sun:", out.ambient, "/", out.hemi, "/", out.sun, "(PBR-Schatten-Floor für Nicht-Metalle)");
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();
