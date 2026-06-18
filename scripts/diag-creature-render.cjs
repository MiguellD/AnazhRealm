// V18.262 — Diag: der KREATUR-RENDER-HEBEL (gemessen, der nächste nach V18.260).
// Die Kreatur-Gruppe rendert pro Skin-Wesen 1 Haut + 6 Gesichts-Sub-Meshes
// (2 Augen + 2 Funken + 2 Ohren), alle STATISCH (jenseits parts.length, kein
// Motion-Role). Dieser Test zählt die echten Draw-Calls pro Kreatur:
//   - NEAR  = die Meshes, die für eine nahe Kreatur rendern (Build-Zeit-Zahl,
//             frustum-unabhängig: own-visible Mesh mit allen Vorfahren visible).
//   - FAR   = dieselbe Zählung, nachdem die Gesichts-LOD ausgelöst ist
//             (_creatureFaceLOD.visible=false jenseits CREATURE_FACE_LOD_DIST·L).
//
// Akzeptanz (V18.262): Skin-Kreatur NEAR ≤ 4 (1 Haut + ≤3 gemergte Gesichts-
// Meshes statt 7), FAR = 1 (nur die Haut). Vor dem Hebel: NEAR=7, FAR=7.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4331,
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
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto("http://127.0.0.1:" + PORT + "/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const s = performance.now();
        while (performance.now() - s < 18000) {
            const r = window.anazhRealm;
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((z) => setTimeout(z, 16));
        }
    });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm,
            pm = r.state.playerMesh;
        const A = window.anazhRealm.constructor;
        // Render-Meshes EINER Kreatur: own-visible Mesh, dessen Vorfahren (bis
        // zur Gruppe) alle visible sind — die Gruppe selbst zwingen wir visible
        // (das ist das Frustum-Culling, ein orthogonaler Lauf). So zählt es
        // exakt die Draw-Calls, die für DIESE Kreatur an den Renderer gingen.
        const renderMeshes = (g) => {
            const wasVisible = g.visible;
            g.visible = true;
            let n = 0;
            g.traverse((node) => {
                if (!node.isMesh) return;
                let cur = node,
                    ok = true;
                while (cur && cur !== g.parent) {
                    if (!cur.visible) {
                        ok = false;
                        break;
                    }
                    cur = cur.parent;
                }
                if (ok) n++;
            });
            g.visible = wasVisible;
            return n;
        };
        // Pro Soul EINE Kreatur spawnen + nah am Spieler vermessen.
        const out = { perSoul: {}, baseline: {} };
        const souls = A.CREATURE_SOUL_NAMES || ["wesen", "sprite", "geist", "glutwesen"];
        // Vorhandene Kreaturen wegräumen, damit die Messung sauber ist.
        while (r.state.creatures.length) r.removeCreature(r.state.creatures[0]);
        r.state.maxCreatures = 200;
        for (const soul of souls) {
            const c = r.spawnCreatureAt(pm.position.x + 3, pm.position.y, pm.position.z + 3, "happy", soul);
            if (!c) {
                out.perSoul[soul] = { error: "spawn-null" };
                continue;
            }
            const near = renderMeshes(c);
            const hasFaceLOD = !!(c.userData && c.userData._creatureFaceLOD);
            // FAR simulieren: die Gesichts-LOD ausblenden (wenn vorhanden).
            let far = near;
            if (hasFaceLOD) {
                c.userData._creatureFaceLOD.visible = false;
                far = renderMeshes(c);
                c.userData._creatureFaceLOD.visible = true;
            }
            // skin-Soul?
            const soulDef = A.CREATURE_SOULS[soul];
            out.perSoul[soul] = { near, far, hasFaceLOD, skin: !!(soulDef && soulDef.skin) };
            r.removeCreature(c);
        }
        // Aggregat: ein realistischer Spawn von 28 Kreaturen (ambient-Mix: die
        // nicht-predator Souls, wie der echte Picker; gewichtet wie die Welt).
        const ambient = souls.filter((s) => !(A.CREATURE_SOULS[s] && A.CREATURE_SOULS[s].predator));
        const spawned = [];
        for (let i = 0; i < 28; i++) {
            const soul = ambient[i % ambient.length];
            const a = (i / 28) * 6.28,
                d = 4 + (i % 7);
            const c = r.spawnCreatureAt(
                pm.position.x + Math.cos(a) * d,
                pm.position.y,
                pm.position.z + Math.sin(a) * d,
                "happy",
                soul
            );
            if (c) spawned.push(c);
        }
        let nearTotal = 0,
            farTotal = 0;
        for (const c of spawned) {
            nearTotal += renderMeshes(c);
            const fl = c.userData && c.userData._creatureFaceLOD;
            if (fl) {
                fl.visible = false;
                farTotal += renderMeshes(c);
                fl.visible = true;
            } else farTotal += renderMeshes(c);
        }
        out.spawnCount = spawned.length;
        out.nearTotalDrawCalls = nearTotal;
        out.farTotalDrawCalls = farTotal;
        out.avgNear = +(nearTotal / Math.max(1, spawned.length)).toFixed(2);
        out.avgFar = +(farTotal / Math.max(1, spawned.length)).toFixed(2);
        for (const c of spawned) r.removeCreature(c);
        return out;
    });
    await browser.close();
    server.close();
    console.log("\n===== KREATUR-RENDER-DRAW-CALLS (V18.262) =====\n");
    console.log("  Pro Soul (eine Kreatur, nah am Spieler):");
    for (const soul of Object.keys(rep.perSoul)) {
        const s = rep.perSoul[soul];
        if (s.error) {
            console.log("    " + soul.padEnd(10) + " FEHLER: " + s.error);
            continue;
        }
        console.log(
            "    " +
                soul.padEnd(10) +
                " NEAR=" +
                s.near +
                "  FAR=" +
                s.far +
                "  faceLOD=" +
                s.hasFaceLOD +
                "  skin=" +
                s.skin
        );
    }
    console.log("\n  Aggregat — realistischer 28-Kreatur-Spawn (ambient-Mix):");
    console.log("    Kreaturen: " + rep.spawnCount);
    console.log("    Draw-Calls NEAR: " + rep.nearTotalDrawCalls + "  (Ø " + rep.avgNear + "/Kreatur)");
    console.log("    Draw-Calls FAR:  " + rep.farTotalDrawCalls + "  (Ø " + rep.avgFar + "/Kreatur)");
    console.log("\n===============================================\n");
    try {
        fs.writeFileSync(path.join(root, "artifacts", "diag-creature-render.json"), JSON.stringify(rep, null, 2));
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-creature-render.json", JSON.stringify(rep, null, 2));
        } catch (_e2) {}
    }
    process.exit(0);
})();
