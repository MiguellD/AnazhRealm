// playtest-fast.cjs — DER SCHNELLE ITERATIONS-TIER (~60-90 s) gegen den ~10-min-Voll-Gate.
// De-Entropie 17.06.2026: der volle scripts/playtest.cjs (476 Bänder / ~3500 Invarianten) bleibt
// das MERGE-Gate; dieser Tier fängt im DEV-Loop die ~80 % der Regressionen (Crash · Welt baut nicht ·
// Körper/Bauplan baut nicht · Resonanz/Physik unsinnig) in einem Bruchteil der Zeit. Er bootet die
// Welt EINMAL (render-gestubbt, wie der Voll-Playtest) + ein kurzer PLATEAU-Warmup (8 statt 18 Chunks)
// + ~20 SELBST-ENTHALTENE Kern-Checks. KEIN Eingriff in den Monolithen → null Gate-Risiko.
//   node scripts/playtest-fast.cjs        |        npm run playtest:fast
//   PLAYTEST_STRICT=0 → nur reporten (exit 0)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FAST_PORT || 4319);
const STRICT = process.env.PLAYTEST_STRICT !== "0";
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
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const T0 = Date.now();
let pass = 0;
const fails = [];
function check(name, ok) {
    if (ok) {
        pass++;
        console.log("  ✅ " + name);
    } else {
        fails.push(name);
        console.log("  ❌ " + name);
    }
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // [PERF] Skin-Res-Cap vor dem Laden seeden (der Avatar-Isosurface baut sonst ~19 s im Boot);
    // die Checks prüfen „Avatar baut + ist Rig", nicht die Treue → verlustfrei. Siehe playtest.cjs.
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        // GPU-frei: der Mechanik-Tier braucht kein Pixel (niemand wertet headless-
        // Pixel mit Augen aus). Der Null-Renderer macht den Lauf robust gegen
        // swiftshader-Renderer-Crashes. Der LOOK lebt in diag-settled-view.
        window.__anazhHeadlessNullRenderer = true;
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push((e.stack || e.message || String(e)).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/Chunk-Generation-Fehler|WASM-MIME|Vendor-Lib nicht geladen/.test(t))
            errors.push("[console] " + t.slice(0, 120));
    });
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        // ── Init abwarten (wie der Voll-Playtest) ──
        // Das echte „Welt bereit"-Signal ist `_gameLoopTick` als Funktion (startEternalLoop
        // lief, der Boot ist durch) — NICHT `rendererReady` allein: das heißt nur „GPU-Device
        // fertig" (renderer.init().then()). Beim echten Renderer fallen beide zeitlich zusammen
        // (GPU-init ist langsam); beim Null-Renderer resolved init() sofort → rendererReady
        // feuert VOR startEternalLoop → Race. Auf den Loop warten ist renderer-unabhängig korrekt.
        await page.evaluate(async () => {
            // V18.276 — die Boot-Readiness wartet großzügig (wie der volle Gate): auf einem
            // gedrosselten Container dauert Worldgen+Loop-Boot >5 s (gemessen ~5-26 s); ein zu
            // knapper Boot-Deckel → früher Fallback → leerer Warmup. 60 s ist ein reiner
            // Sicherheits-Deckel gegen einen echten Hänger — die Schleife exitet, sobald
            // `_gameLoopTick` da ist (normal ~Sekunden), also kostet er den Schnellfall nichts.
            const dl = performance.now() + 60000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.rendererReady ||
                    typeof window.anazhRealm._gameLoopTick !== "function" ||
                    !window.anazhRealm.state.blueprints) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 100));
        });
        // ── KURZER PLATEAU-WARMUP (render-gestubbt, chirurgisch wie playtest.cjs) ──
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            if (!r || typeof r._gameLoopTick !== "function") return;
            if (r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = function () {
                        return Promise.resolve();
                    };
            }
            r.state.postProcessingFailed = true;
            // (Skin-Res-Cap wird via evaluateOnNewDocument vor dem Laden geseedet — siehe oben.)
            const start = performance.now();
            const TARGET = 4; // schneller Warmup: ein paar Chunks genügen für die Kern-Gesundheit
            const MIN_MS = 3000;
            const PLATEAU_MS = 1500;
            const CAP_MS = 35000;
            // V18.273 — wie der volle Gate: den Worker für den Warmup aushängen →
            // der Ring baut SYNC + deterministisch (load-unabhängig), kein
            // Async-Worker-Hunger unter CPU-Last (s. playtest.cjs-Warmup-Kommentar).
            const _warmupSavedWorker = r.state.voxelWorker;
            r.state.voxelWorker = null;
            let lastBuilt = -1,
                lastGrowth = start;
            for (;;) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const elapsed = performance.now() - start;
                const built = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (built !== lastBuilt) {
                    lastBuilt = built;
                    lastGrowth = performance.now();
                }
                const stable = performance.now() - lastGrowth;
                if ((built >= TARGET && stable >= PLATEAU_MS && elapsed >= MIN_MS) || elapsed >= CAP_MS) break;
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = _warmupSavedWorker;
        });

        // ── KERN-CHECKS (selbst-enthalten, defensiv) ──
        const R = await page.evaluate(() => {
            const out = {};
            const r = window.anazhRealm,
                st = r && r.state;
            const safe = (fn) => {
                try {
                    return fn();
                } catch (e) {
                    return { __err: String((e && e.message) || e) };
                }
            };
            out.stateReachable = !!(r && st);
            out.voxelChunks = st && st.voxelChunks ? st.voxelChunks.size : 0;
            // Terrain-Substanz: mind. ein Chunk trägt surfMap ODER waterCells
            let hasSurf = 0,
                hasWater = 0;
            if (st && st.voxelChunks)
                for (const e of st.voxelChunks.values()) {
                    if (e && e.surfMap) hasSurf++;
                    if (e && e.waterCells) hasWater++;
                }
            out.chunksWithSurf = hasSurf;
            out.chunksWithWater = hasWater;
            out.blueprintCount = st && st.blueprints ? Object.keys(st.blueprints).length : 0;
            // Höhen-Abfrage endlich
            out.terrainHeightFinite = safe(() => {
                const h = r.getTerrainHeightAt(0, 0);
                return typeof h === "number" && isFinite(h);
            });
            // Spieler-Physik-Body
            out.playerBody = !!(st && st.player && (st.playerBody || (st.player && st.player.body)));
            // AVATAR baut (das Rig: SkinnedMesh + Bones) — die System-B-Pipeline
            out.avatar = safe(() => {
                const g = r._buildHumanGroup();
                const rig = g && g.userData && g.userData.rig;
                let skinned = false;
                if (g)
                    g.traverse((o) => {
                        if (o.isSkinnedMesh) skinned = true;
                    });
                return { ok: !!g, hasRig: !!rig, skinned };
            });
            // KREATUR baut (die geteilte Metaball-Pipeline)
            out.creatureWesen = safe(() => {
                const g = r._buildCreatureGroup("wesen");
                return { ok: !!g, children: g ? g.children.length : 0 };
            });
            out.creatureGlut = safe(() => {
                const g = r._buildCreatureGroup("glutwesen");
                return { ok: !!g };
            });
            // KERN-BAUPLÄNE bauen (Werkstatt-Render-Pfad)
            out.blueprintBuilds = safe(() => {
                const names = ["geraet_schwert", "esse", "welt_portal", "ruestung_brustpanzer"];
                const res = {};
                for (const n of names) {
                    const bp = st.blueprints[n];
                    res[n] = bp ? !!r._buildFromBlueprint(bp, 0, undefined, {}) : "missing";
                }
                return res;
            });
            // RESONANZ: built-in Baupläne tragen sinnvolle Rollen (Form×Material → Rolle)
            out.roles = safe(() => {
                const res = {};
                const probe = { geraet_schwert: "weapon", ruestung_brustpanzer: "armor", welt_portal: "portal" };
                for (const n of Object.keys(probe)) {
                    const bp = st.blueprints[n];
                    if (!bp) {
                        res[n] = "missing";
                        continue;
                    }
                    let role = bp.role;
                    if (!role && typeof r.computeBlueprintRole === "function") role = r.computeBlueprintRole(bp);
                    res[n] = role || "?";
                }
                return res;
            });
            // STATS: der Spieler hat sinnvolle Werte (hp in state.player.hp, speed in state.speed)
            out.playerStats = safe(() => {
                let hpMax = null;
                if (typeof r.computePlayerStats === "function") {
                    const cs = r.computePlayerStats();
                    hpMax = cs && cs.stats ? cs.stats.hpMax : null;
                }
                return {
                    hp: st.player ? st.player.hp : null,
                    hpMax,
                    speed: st.speed,
                };
            });
            return out;
        });

        // ── AUSWERTUNG ──
        console.log(`\n=== Schnell-Playtest (Kern-Gesundheit) ===`);
        check("Keine Page-/Console-Fehler (Crash-Wand)", errors.length === 0);
        if (errors.length) errors.slice(0, 5).forEach((e) => console.log("     ⟶ " + e));
        check("window.anazhRealm.state erreichbar", R.stateReachable === true);
        check(`voxelChunks gebaut (${R.voxelChunks} ≥ 1)`, R.voxelChunks >= 1);
        check(`Terrain-Substanz: Chunks mit surfMap (${R.chunksWithSurf} > 0)`, R.chunksWithSurf > 0);
        check(`Baupläne geladen (${R.blueprintCount} > 0)`, R.blueprintCount > 0);
        check("getTerrainHeightAt(0,0) endlich", R.terrainHeightFinite === true);
        const av = R.avatar || {};
        check("AVATAR baut (_buildHumanGroup ohne Crash)", av.ok === true && !av.__err);
        check("AVATAR ist ein Rig (SkinnedMesh + Bones)", av.hasRig === true && av.skinned === true);
        const cw = R.creatureWesen || {};
        check(`KREATUR 'wesen' baut (${cw.children || 0} Teile)`, cw.ok === true && !cw.__err);
        check("KREATUR 'glutwesen' baut", (R.creatureGlut || {}).ok === true && !(R.creatureGlut || {}).__err);
        const bb = R.blueprintBuilds || {};
        const bbOk = !bb.__err && Object.values(bb).every((v) => v === true);
        check("KERN-BAUPLÄNE bauen (Schwert·Esse·Portal·Rüstung)", bbOk);
        if (!bbOk) console.log("     ⟶ " + JSON.stringify(bb));
        const ro = R.roles || {};
        check(
            "RESONANZ: Schwert→weapon · Rüstung→armor · Portal→portal",
            ro.geraet_schwert === "weapon" && ro.ruestung_brustpanzer === "armor" && ro.welt_portal === "portal"
        );
        if (ro.geraet_schwert !== "weapon") console.log("     ⟶ " + JSON.stringify(ro));
        const ps = R.playerStats || {};
        check("Spieler-Stats sinnvoll (hp>0, speed>0)", ps && ps.hp > 0 && ps.speed > 0);
        if (!(ps.hp > 0 && ps.speed > 0)) console.log("     ⟶ " + JSON.stringify(ps));

        console.log(`\nLaufzeit: ${((Date.now() - T0) / 1000).toFixed(0)}s · ${pass} ✅ · ${fails.length} ❌`);
        if (fails.length) {
            console.log(`\n❌ Schnell-Checks fehlgeschlagen:\n  - ${fails.join("\n  - ")}`);
            console.log(`\n(Der volle 'npm run playtest' bleibt das Merge-Gate.)`);
            if (STRICT) {
                await browser.close();
                server.close();
                process.exit(1);
            }
        } else {
            console.log(`\n✅ Kern-Gesundheit OK — für den Merge: 'npm run playtest' (voll).`);
        }
    } catch (e) {
        console.log("FATAL: " + ((e && e.stack) || e));
        await browser.close();
        server.close();
        process.exit(1);
    }
    await browser.close();
    server.close();
})();
