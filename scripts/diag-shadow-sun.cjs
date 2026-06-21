// SCHATTEN-CACHE-CHECK (V18.305): greift der V18.264-Schatten-Cache im STAND?
// Misst NICHT die rohe Sonnen-Drift (die ist immer >0), sondern den ECHTEN Effekt:
// wie oft setzt `_loopShadowUpdate` `shadowMap.needsUpdate=true`, während der Spieler
// still steht. Vorher (Schwelle 1e-5): jeden Frame (Cache tot). Nachher (Schwelle 4.0):
// nur alle ~30 Frame (hardStale) → der 518k-Dreieck-Schatten-Pass ist ~97% übersprungen.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4376,
    root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((q, s) => {
    let p = q.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        s.statusCode = 403;
        return s.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            s.statusCode = 404;
            return s.end();
        }
        s.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        s.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const b = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const pg = await b.newPage();
    pg.on("pageerror", (e) => console.log("[PE]", (e.message || "").split("\n")[0]));
    await pg.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await pg.evaluate(async () => {
        let st = false;
        const s0 = performance.now();
        let l = -1,
            c = 0;
        while (performance.now() - s0 < 90000) {
            const r = window.anazhRealm;
            if (r && !st && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                st = true;
            }
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === l) c++;
                else {
                    c = 0;
                    l = sz;
                }
                if (sz > 40 && c > 50) break;
            }
            await new Promise((z) => setTimeout(z, 4));
        }
    });
    const out = await pg.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const dl = s.directionalLight,
            pm = s.playerMesh;
        if (!dl) return { err: "no light" };
        // Der Null-Renderer hat keine echte shadowMap → eine Stub-Map unterschieben,
        // damit `_loopShadowUpdate` durchläuft + wir die needsUpdate-Flips zählen.
        if (!s.renderer.shadowMap) s.renderer.shadowMap = { needsUpdate: false };
        // Spieler EINFRIEREN (Stand-Szenario): die Schatten-Kamera folgt der Position,
        // also halten wir px/pz fest, sonst zählt Bewegung als Update.
        const fx = pm ? pm.position.x : 0,
            fz = pm ? pm.position.z : 0;
        const count = (frames) => {
            let updates = 0;
            let maxGap = 0,
                lastUpd = -1;
            for (let i = 0; i < frames; i++) {
                if (pm) {
                    pm.position.x = fx;
                    pm.position.z = fz;
                }
                s.renderer.shadowMap.needsUpdate = false;
                try {
                    r._loopShadowUpdate();
                } catch (_e) {}
                if (s.renderer.shadowMap.needsUpdate) {
                    updates++;
                    if (lastUpd >= 0) maxGap = Math.max(maxGap, i - lastUpd);
                    lastUpd = i;
                }
            }
            return { updates, frames, maxGap };
        };
        // ein paar Frames laufen lassen, damit der Loop die Sonne weiterdreht
        for (let i = 0; i < 5; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
        }
        const stand = count(120);
        return { stand, hasShadowMap: true };
    });
    console.log("\n===== SCHATTEN-CACHE-CHECK: greift der Cache im STAND? =====");
    if (out.err) {
        console.log("  " + out.err);
    } else {
        const st = out.stand;
        const pct = (100 * st.updates) / st.frames;
        console.log(
            `  Schatten-Renders im STAND (Spieler fix): ${st.updates}/${st.frames} Frames  (${pct.toFixed(0)}%)`
        );
        console.log(`  Grösste Lücke zwischen Renders: ${st.maxGap} Frames`);
        if (pct <= 10) {
            console.log(
                `  ✓ CACHE GREIFT: der Schatten-Pass läuft nur ~${pct.toFixed(0)}% der Frames (Staleness alle ~30)`
            );
            console.log(`    → der 518k-Dreieck-Schatten-Pass ist ~${(100 - pct).toFixed(0)}% übersprungen im Stand.`);
        } else if (pct >= 80) {
            console.log(
                `  ⚠ CACHE TOT: der Schatten-Pass läuft fast jeden Frame (${pct.toFixed(0)}%) — die Sonnen-Drift trippt ihn.`
            );
        } else {
            console.log(`  ~ Cache greift teilweise (${pct.toFixed(0)}% der Frames rendern Schatten).`);
        }
    }
    console.log("============================================================");
    await b.close();
    server.close();
    process.exit(0);
})();
