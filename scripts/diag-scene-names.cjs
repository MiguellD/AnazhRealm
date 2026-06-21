// V18.317 — Diag: WAS SIND DIE 322 NICHT-GEMERGTEN MESHES + macht der GESPEICHERTE Stand die
// Welt schwerer? (Schöpfer: „hast du ein bkup das den bug bringt? eine datei die mein system lädt?"
// + „322 sind nicht gemerged ... bäume offen in die welt gesetzt, synergiebruch?"). Bootet FRISCH,
// zählt die Szene-Meshes nach NAME (welche Art ist nicht-instanced?), lädt DANN anazhRealmState.json
// via loadState(parsed) und zählt erneut → zeigt, ob der Restore die Last bringt, die fresh-Boot-
// Tests NIE sahen. MISS zuerst (V18.260), kein Raten.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4365,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
    const saveJson = fs.existsSync(path.join(root, "anazhRealmState.json")) ? fs.readFileSync(path.join(root, "anazhRealmState.json"), "utf8") : null;
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
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
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const census = () =>
        page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            const scene = s.scene;
            const triOf = (g) => (!g || !g.attributes || !g.attributes.position ? 0 : g.index ? g.index.count / 3 : g.attributes.position.count / 3);
            const nameKey = (node) => {
                let nm = node.name || (node.userData && (node.userData.archInstanceKey || node.userData.blueprintName)) || "";
                if (!nm && node.material) nm = node.material.name || "";
                if (!nm) nm = node.isInstancedMesh ? "(instanced?)" : "(unnamed)";
                return String(nm).replace(/_v\d+.*/, "").replace(/[#@].*/, "").replace(/\d+$/, "").replace(/_lod[012]$/, "");
            };
            const merged = { yes: 0, no: 0 };
            const byName = {}; // name → {meshes, inst, tris, instanced}
            let totalMeshes = 0,
                totalInst = 0,
                totalTris = 0,
                drawCalls = 0;
            scene.traverse((node) => {
                if (!node.isMesh && !node.isInstancedMesh) return;
                let vis = node.visible,
                    cur = node.parent;
                while (cur && vis) {
                    if (!cur.visible) vis = false;
                    cur = cur.parent;
                }
                if (!vis) return;
                const inst = node.isInstancedMesh ? node.count || 0 : 1;
                if (inst === 0) return;
                const tris = triOf(node.geometry) * inst;
                const k = nameKey(node);
                if (!byName[k]) byName[k] = { meshes: 0, inst: 0, tris: 0, instanced: 0, nonInst: 0 };
                const b = byName[k];
                b.tris += tris;
                totalMeshes++;
                drawCalls++;
                totalTris += tris;
                if (node.isInstancedMesh) {
                    b.inst += inst;
                    b.instanced++;
                    totalInst++;
                } else {
                    b.meshes++;
                    b.nonInst++;
                }
                // archMerged?
                let p = node;
                while (p) {
                    if (p.userData && p.userData.archMerged) {
                        merged.yes++;
                        break;
                    }
                    p = p.parent;
                }
                if (!node.isInstancedMesh) {
                    let pm = node,
                        isM = false;
                    while (pm) {
                        if (pm.userData && pm.userData.archMerged) {
                            isM = true;
                            break;
                        }
                        pm = pm.parent;
                    }
                    if (!isM) merged.no++;
                }
            });
            const bpCount = s.blueprints ? (s.blueprints.size != null ? s.blueprints.size : Object.keys(s.blueprints).length) : 0;
            const bpKeys = s.blueprints ? (typeof s.blueprints.keys === "function" ? [...s.blueprints.keys()] : Object.keys(s.blueprints)) : [];
            const grownCount = bpKeys.filter((k) => String(k).startsWith("grown_")).length;
            return {
                totalMeshes,
                totalInst,
                totalTris,
                drawCalls,
                merged,
                world: {
                    architectures: s.architectures ? s.architectures.length : 0,
                    blueprints: bpCount,
                    grownBlueprints: grownCount,
                    creatures: s.creatures ? s.creatures.length : 0,
                    voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
                    sceneChildren: scene.children.length,
                },
                topByMeshes: Object.entries(byName)
                    .sort((a, b) => b[1].nonInst - a[1].nonInst)
                    .slice(0, 20)
                    .map(([k, v]) => [k, v.nonInst, v.instanced, Math.round(v.tris)]),
            };
        });

    const fresh = await census();
    const printC = (out, label) => {
        console.log(`\n===== SZENE-MESHES (${label}) =====`);
        console.log("  Welt: " + JSON.stringify(out.world));
        console.log(`  Meshes ${out.totalMeshes} (draw-calls ${out.drawCalls}) · davon instanced-rows ${out.totalInst} · tris ${(out.totalTris / 1e6).toFixed(2)}M`);
        console.log(`  archMerged-Meshes ${out.merged.yes} · NICHT-gemergte Einzel-Meshes ${out.merged.no}`);
        console.log("  Top nach NICHT-instanced Mesh-Zahl (name | nonInst | instGroups | tris):");
        for (const [k, ni, ig, t] of out.topByMeshes) console.log("    " + String(k).padEnd(28) + String(ni).padStart(5) + " | " + String(ig).padStart(4) + " | " + (t / 1000).toFixed(0) + "k");
    };
    printC(fresh, "FRISCH (wie meine bisherigen Tests)");

    if (saveJson) {
        const loadRes = await page.evaluate((js) => {
            const r = window.anazhRealm;
            let parsed;
            try {
                parsed = JSON.parse(js);
            } catch (e) {
                return { error: "parse: " + e.message };
            }
            try {
                r.loadState(parsed);
            } catch (e) {
                return { error: "loadState: " + (e.stack || e.message).split("\n").slice(0, 2).join(" | ") };
            }
            return { ok: true, version: parsed.version };
        }, saveJson);
        if (loadRes.error) {
            console.log("\n  ⚠️ loadState(anazhRealmState.json) FEHLER: " + loadRes.error);
        } else {
            console.log("\n  loadState(anazhRealmState.json v" + loadRes.version + ") OK → pumpen + settlen ...");
            await page.evaluate(async () => {
                const r = window.anazhRealm;
                for (let i = 0; i < 400; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    if (i % 8 === 0) await new Promise((res) => setTimeout(res, 1));
                }
            });
            const restored = await census();
            printC(restored, "NACH RESTORE deines Spielstands");
            console.log("\n  ===== VERGLEICH =====");
            console.log(`  Meshes ${fresh.totalMeshes} → ${restored.totalMeshes} (Δ ${restored.totalMeshes - fresh.totalMeshes})`);
            console.log(`  Nicht-gemergte Einzel-Meshes ${fresh.merged.no} → ${restored.merged.no} (Δ ${restored.merged.no - fresh.merged.no})`);
            console.log(`  Tris ${(fresh.totalTris / 1e6).toFixed(2)}M → ${(restored.totalTris / 1e6).toFixed(2)}M · Architektur ${fresh.world.architectures} → ${restored.world.architectures} · grown ${fresh.world.grownBlueprints} → ${restored.world.grownBlueprints}`);
        }
    } else {
        console.log("\n  (kein anazhRealmState.json gefunden — nur Fresh-Census)");
    }
    console.log("\n=======================================================\n");
    await browser.close();
    server.close();
    process.exit(0);
})();
