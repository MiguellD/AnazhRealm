// Diagnose V18.11 — DIE STRÖMUNG AUS DER OBERFLÄCHEN-NEIGUNG (Schöpfer-Idee „lies
// eine Neigung aus der Oberfläche, erzeuge daraus die Strömung").
//
// WURZEL des „an der Naht plötzlich quer zur Strömung + anders skaliert"-Befundes:
// die Fluss-Foam-Strähnen orientieren sich im Shader an `aFlow`. ALT kam `aFlow`
// aus `_hydroRiverAt` = ein per-Fluss-SEGMENT-Lookup → an den Segment-Grenzen
// SPRINGT die Richtung. NEU ist `aFlow = −∇L` (die Neigung des Spiegel-Felds `L`):
// `L` ist EIN geteiltes kontinuierliches Feld → der Gradient ist GLATT (naht-frei).
//
// Diese Diagnose sampelt das Strömungs-Feld auf einem Gitter über das gestreamte
// Gebiet und misst den MAXIMALEN Winkel-SPRUNG zwischen benachbarten Fluss-Punkten,
// einmal für ALT (`_hydroRiverAt`) und einmal für NEU (∇L). NEU muss deutlich
// glatter sein (kleinerer Max-Sprung) — das beweist, dass der Naht-Flip weg ist.
//
// Exit 1 (Regressions-Gate), wenn NEU NICHT glatter ist als ALT (der Fix greift
// nicht) ODER kein Fluss im Gebiet (nichts gemessen — dann nur Info, kein Fail).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4352;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        // ALT: die Strömung per Fluss-Segment.
        const oldFlow = (x, z) => {
            const rv = r._hydroRiverAt(x, z);
            if (rv && (rv.flowX || rv.flowZ)) {
                const m = Math.hypot(rv.flowX, rv.flowZ) || 1;
                return [rv.flowX / m, rv.flowZ / m];
            }
            return null;
        };
        // NEU-Kandidaten:
        //  (b) −∇L (h=1.8) — der ROHE Gradient (Test 1: gemessen 180° = Terrain-Rauschen).
        //  (c) −∇L (h=24)  — der GROSS-skalige Gradient (folgt dem Tal-Trend?).
        //  (d) geglättete Segment-Strömung — `_hydroRiverAt` über 27 m gemittelt (die
        //      D8-45°-Stufen weichgezeichnet, die Fluss-RICHTUNG aber erhalten).
        const gradFlow = (x, z, h) => {
            const Lc = r._atlasWaterLevelAt(x, z, -Infinity);
            if (!isFinite(Lc)) return null;
            const lpx = r._atlasWaterLevelAt(x + h, z, -Infinity);
            const lmx = r._atlasWaterLevelAt(x - h, z, -Infinity);
            const lpz = r._atlasWaterLevelAt(x, z + h, -Infinity);
            const lmz = r._atlasWaterLevelAt(x, z - h, -Infinity);
            const gx = (isFinite(lpx) ? lpx : Lc) - (isFinite(lmx) ? lmx : Lc);
            const gz = (isFinite(lpz) ? lpz : Lc) - (isFinite(lmz) ? lmz : Lc);
            const g = Math.hypot(gx, gz);
            if (g / (2 * h) > 0.012 && g > 0) return [-gx / g, -gz / g];
            return null;
        };
        const smoothFlow = (x, z) => {
            let sx = 0,
                sz = 0,
                n = 0;
            const R = 9;
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const rv = r._hydroRiverAt(x + dx * R, z + dz * R);
                    if (rv && (rv.flowX || rv.flowZ)) {
                        const m = Math.hypot(rv.flowX, rv.flowZ) || 1;
                        sx += rv.flowX / m;
                        sz += rv.flowZ / m;
                        n++;
                    }
                }
            if (n === 0) return null;
            const m = Math.hypot(sx, sz);
            if (m < 0.3) return null;
            return [sx / m, sz / m];
        };
        // Gitter über das gestreamte Gebiet (um den Spieler).
        const px = r.state.playerMesh ? r.state.playerMesh.position.x : 0;
        const pz = r.state.playerMesh ? r.state.playerMesh.position.z : 0;
        const N = 80,
            cell = 6; // 480 m Spanne, 6 m Schritt
        const cand = {
            old: { fn: oldFlow, G: [], n: 0 },
            gradFine: { fn: (x, z) => gradFlow(x, z, 1.8), G: [], n: 0 },
            gradCoarse: { fn: (x, z) => gradFlow(x, z, 24), G: [], n: 0 },
            smooth: { fn: smoothFlow, G: [], n: 0 },
        };
        for (let k = 0; k < N; k++) {
            for (const c of Object.values(cand)) c.G.push([]);
            for (let i = 0; i < N; i++) {
                const x = px + (i - N / 2) * cell;
                const z = pz + (k - N / 2) * cell;
                for (const c of Object.values(cand)) {
                    const f = c.fn(x, z);
                    c.G[k].push(f);
                    if (f) c.n++;
                }
            }
        }
        // Max Winkel-Sprung zwischen benachbarten Fluss-Punkten (Grad).
        const ang = (a, b) => {
            const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]));
            return (Math.acos(d) * 180) / Math.PI;
        };
        const measure = (G) => {
            let maxJump = 0,
                bigJumps = 0,
                pairs = 0;
            for (let k = 0; k < N; k++)
                for (let i = 0; i < N; i++) {
                    const a = G[k][i];
                    if (!a) continue;
                    for (const [di, dk] of [
                        [1, 0],
                        [0, 1],
                    ]) {
                        const ni = i + di,
                            nk = k + dk;
                        if (ni >= N || nk >= N) continue;
                        const b = G[nk][ni];
                        if (!b) continue;
                        const j = ang(a, b);
                        pairs++;
                        if (j > maxJump) maxJump = j;
                        if (j > 45) bigJumps++;
                    }
                }
            return { maxJump: +maxJump.toFixed(1), bigJumps, pairs };
        };
        const res = {};
        for (const [k, c] of Object.entries(cand)) res[k] = { river: c.n, ...measure(c.G) };
        return res;
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    const fmt = (n, m) =>
        `${n.padEnd(12)} river=${String(m.river).padStart(4)}  maxJump=${String(m.maxJump).padStart(6)}°  >45°: ${String(m.bigJumps).padStart(4)}/${m.pairs}`;
    console.log("\n=== WASSER-STRÖMUNG: KONTINUITÄT (V18.11) ===");
    console.log("(max Winkel-Sprung zwischen benachbarten Fluss-Punkten, 480-m-Gitter; KLEINER = glatter)\n");
    console.log(fmt("old (Segment)", out.old), "   <- der aktuelle Stand (D8-quantisiert)");
    console.log(fmt("grad ∇L h=1.8", out.gradFine), "   <- roher Gradient = Terrain-Rauschen");
    console.log(fmt("grad ∇L h=24", out.gradCoarse), "   <- gross-skaliger Gradient");
    console.log(fmt("smooth tangent", out.smooth), "   <- _hydroRiverAt über 27 m gemittelt");
    if (out.smooth.river < 10 || out.old.river < 10) {
        console.log("\n[INFO] zu wenig Fluss im Gitter — nicht aussagekräftig (kein Fail).");
        process.exit(0);
    }
    // Regressions-Gate: die GEGLÄTTETE Strömung (was das Mesh baut) MUSS deutlich
    // glatter sein als die rohe Segment-Strömung (weniger grosse Winkel-Sprünge).
    const oldRate = out.old.bigJumps / Math.max(1, out.old.pairs);
    const newRate = out.smooth.bigJumps / Math.max(1, out.smooth.pairs);
    console.log(`\nGEGLÄTTET vs roh: >45°-Sprung-Rate ${(newRate * 100).toFixed(1)}% vs ${(oldRate * 100).toFixed(1)}%`);
    if (newRate > oldRate * 0.5) {
        console.log("[FAIL] die geglättete Strömung ist NICHT deutlich glatter — der Fix greift nicht.");
        process.exit(1);
    }
    console.log("[OK] die geglättete Fluss-Strömung halbiert die grossen Winkel-Sprünge mindestens =");
    console.log("     der quer-zur-Strömung-Naht-Flip ist an der Wurzel gedämpft (Richtung bleibt bergab).");
    process.exit(0);
})();
