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
                // KONVERGENZ: der Avatar IST der Studio-Baum (bauMensch) — kein SkinnedMesh
                // mehr; die Wahrheit ist: Baum-Teile (Meshes) + Gelenk-Gruppen im Rig.
                let meshN = 0;
                if (g)
                    g.traverse((o) => {
                        if (o.isMesh) meshN++;
                    });
                const gelenke = !!(rig && rig.armL && rig.armL.shoulder && rig.legL && rig.legL.knee && rig.head);
                return { ok: !!g, hasRig: !!rig, baum: rig ? rig._baum === true : false, meshN, gelenke };
            });
            // KREATUR baut (der Studio-Baum, KONVERGENZ III)
            out.creatureWesen = safe(() => {
                const g = r._buildCreatureGroup("wesen");
                return { ok: !!g, children: g ? g.children.length : 0 };
            });
            // ALTLASTEN-NULL — glutwesen/sprite/geist sind GEFALLEN: die Seelen-
            // Menge ist exakt die vier ehrlichen Tiere.
            out.creatureGlut = safe(() => {
                const names = (window.AnazhRealm || r.constructor).CREATURE_SOUL_NAMES || [];
                const exakt =
                    names.length === 4 && ["wesen", "wolf", "fuchs", "baer"].every((n) => names.includes(n));
                return { ok: exakt };
            });
            // ERFINDER-WELLE — die NEUEN Tiere (wolf/fuchs/baer aus den tetrapoda-
            // Gattungen) bauen durch DENSELBEN Guss (Konsum-Beweis, nicht Existenz).
            out.creatureTiere = safe(() => {
                const res = {};
                for (const n of ["wolf", "fuchs", "baer"]) {
                    const g = r._buildCreatureGroup(n);
                    res[n] = !!(g && g.children.length);
                }
                return res;
            });
            // SYNERGIE-WELLE — „WERDE DAS TIER": die Tier-Körper sind TRAGBARE
            // soul-Baupläne (der generische embody-Pfad; Konsum = wirklich getragen).
            out.tierKoerper = safe(() => {
                const bp = r.state.blueprints.koerper_wolf;
                const okDef = !!(bp && bp.role === "soul" && Array.isArray(bp.parts) && bp.parts.length >= 10);
                const prev = (r.state.player && r.state.player.soul) || "human";
                let getragen = false;
                if (okDef) {
                    r.applyPlayerSoulFromBlueprint("koerper_wolf");
                    getragen =
                        !!(r.state.player && /koerper_wolf/.test(String(r.state.player.soul))) &&
                        // KONVERGENZ III: der getragene Tier-Leib ist der Studio-BAUM
                        // (ein Wrap-Kind + _tierBaum-Register) — nicht mehr der Compound.
                        !!(
                            r.state.playerMesh &&
                            (r.state.playerMesh.children.length >= 5 ||
                                (r.state.playerMesh.userData && r.state.playerMesh.userData._tierBaum))
                        );
                    r.applyPlayerSoul(prev);
                }
                return { okDef, getragen, hirsch: !!r.state.blueprints.koerper_wesen };
            });
            // ALTLASTEN-NULL — KÖRPER→EIGENSCHAFTEN als ZAHL: die Skelett-Größen
            // differenzieren die getragenen Tier-Körper über die EINE Größen-Fold-
            // Quelle (sizeHpMul): Bär > Wolf > Fuchs in HP, Fuchs > Wolf > Bär im
            // Tempo. Plus: der werde-Alias trägt (wolf→koerper_wolf) und ein
            // gefallener Alt-Name fällt fail-soft auf den Menschen.
            out.koerperStats = safe(() => {
                const prev = (r.state.player && r.state.player.soul) || "human";
                const read = (k) => {
                    r.applyPlayerSoulFromBlueprint(k);
                    const st = r.state.player.stats || {};
                    return { hp: st.hpMax || 0, sp: st.speed || 0 };
                };
                const fu = read("koerper_fuchs");
                const wo = read("koerper_wolf");
                const ba = read("koerper_baer");
                const aliasOk = !!r.applyPlayerSoul("wolf") && /koerper_wolf/.test(String(r.state.player.soul));
                // HERZ/KONVERGENZ III: „werde wolf" IST der Wolf — derselbe
                // Studio-Baum wie die Welt-Kreatur (der _creatureSkin-Wrap deckt
                // den Leib für die 1st-Person-Regel).
                const wolfSkin = (r.state.playerMesh.children || []).some(
                    (c) => c && c.userData && c.userData._creatureSkin
                );
                const softOk = !!r.applyPlayerSoul("phoenix") && r.state.player.soul === "human";
                // HERZ: der MENSCH hängt an derselben Größen-Achse — die
                // koerperstudio-Dials (dieselbe Quelle wie das Rig) tragen
                // Stats: mehr Masse/Höhe → mehr HP, weniger Tempo.
                let menschDials = false;
                const rec = r._foundry && r._foundry.recipes && r._foundry.recipes[r.constructor.KOERPER_HOST_RECIPE];
                if (rec && rec.s) {
                    const saved = JSON.parse(JSON.stringify(rec.s));
                    r.applyPlayerSoul("human");
                    r.recomputePlayerStats();
                    const base = { hp: r.state.player.stats.hpMax, sp: r.state.player.stats.speed };
                    rec.s.height = 1.15;
                    rec.s.mass = 1.0;
                    r.recomputePlayerStats();
                    const big = { hp: r.state.player.stats.hpMax, sp: r.state.player.stats.speed };
                    Object.assign(rec.s, saved);
                    r.recomputePlayerStats();
                    menschDials = big.hp > base.hp && big.sp < base.sp;
                }
                r.applyPlayerSoul(prev);
                return {
                    hpOrder: ba.hp > wo.hp && wo.hp > fu.hp,
                    speedOrder: fu.sp > wo.sp && wo.sp > ba.sp,
                    aliasOk,
                    softOk,
                    wolfSkin,
                    menschDials,
                };
            });
            // KERN-BAUPLÄNE bauen (Werkstatt-Render-Pfad). AUSLÖSCHUNGS-WELLE — der
            // geraet_schwert-Blueprint fiel; seine Judge-Substanz lebt eingefroren in
            // AnazhRealm.KIND_SUBSTANCE (headless: window.AnazhRealm ist undefined →
            // r.constructor.KIND_SUBSTANCE, die dokumentierte V18.259-Falle).
            out.blueprintBuilds = safe(() => {
                const KS = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
                const names = ["esse", "welt_portal", "ruestung_brustpanzer"];
                const res = {};
                res.geraet_schwert = KS.geraet_schwert
                    ? !!r._buildFromBlueprint(
                          {
                              name: "_fast_schwert",
                              parts: JSON.parse(JSON.stringify(KS.geraet_schwert.parts)),
                          },
                          0,
                          undefined,
                          {}
                      )
                    : "missing";
                for (const n of names) {
                    const bp = st.blueprints[n];
                    res[n] = bp ? !!r._buildFromBlueprint(bp, 0, undefined, {}) : "missing";
                }
                return res;
            });
            // RESONANZ: Substanz/Built-ins tragen sinnvolle Rollen (Form×Material → Rolle)
            out.roles = safe(() => {
                const KS = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
                const res = {};
                res.geraet_schwert = KS.geraet_schwert
                    ? r.computeBlueprintRole({ parts: KS.geraet_schwert.parts }) || "?"
                    : "missing";
                const probe = { ruestung_brustpanzer: "armor", welt_portal: "portal" };
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
        check(
            `AVATAR ist der Studio-Baum (bauMensch: ${av.meshN || 0} Teile + Gelenk-Gruppen)`,
            av.hasRig === true && av.baum === true && av.gelenke === true && (av.meshN || 0) > 150
        );
        const cw = R.creatureWesen || {};
        check(`KREATUR 'wesen' baut (${cw.children || 0} Teile)`, cw.ok === true && !cw.__err);
        check("ALTLASTEN-NULL: Seelen = exakt Hirsch·Wolf·Fuchs·Bär", (R.creatureGlut || {}).ok === true && !(R.creatureGlut || {}).__err);
        check(
            "DIE NEUEN TIERE bauen (Wolf·Fuchs·Bär aus den tetrapoda-Gattungen)",
            (R.creatureTiere || {}).wolf === true &&
                (R.creatureTiere || {}).fuchs === true &&
                (R.creatureTiere || {}).baer === true &&
                !(R.creatureTiere || {}).__err
        );
        check(
            "WERDE DAS TIER: koerper_wolf ist tragbar (generischer embody-Pfad) + koerper_wesen/Hirsch existiert",
            (R.tierKoerper || {}).okDef === true &&
                (R.tierKoerper || {}).getragen === true &&
                (R.tierKoerper || {}).hirsch === true &&
                !(R.tierKoerper || {}).__err
        );
        check(
            "KÖRPER→EIGENSCHAFTEN: Bär>Wolf>Fuchs (HP) · Fuchs>Wolf>Bär (Tempo) + werde-Alias + fail-soft",
            (R.koerperStats || {}).hpOrder === true &&
                (R.koerperStats || {}).speedOrder === true &&
                (R.koerperStats || {}).aliasOk === true &&
                (R.koerperStats || {}).softOk === true &&
                !(R.koerperStats || {}).__err
        );
        check(
            "HERZ: werde wolf trägt den Studio-Baum (derselbe Guss wie die Welt-Kreatur)",
            (R.koerperStats || {}).wolfSkin === true && !(R.koerperStats || {}).__err
        );
        check(
            "HERZ: Mensch-Dials tragen Stats (mehr Masse/Höhe → mehr HP, weniger Tempo — EINE Größen-Achse)",
            (R.koerperStats || {}).menschDials === true && !(R.koerperStats || {}).__err
        );
        const bb = R.blueprintBuilds || {};
        const bbOk = !bb.__err && Object.values(bb).every((v) => v === true);
        check("KERN-BAUPLÄNE bauen (Schwert-Substanz·Esse·Portal·Rüstung)", bbOk);
        if (!bbOk) console.log("     ⟶ " + JSON.stringify(bb));
        const ro = R.roles || {};
        check(
            "RESONANZ: Schwert-Substanz→weapon · Rüstung→armor · Portal→portal",
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
