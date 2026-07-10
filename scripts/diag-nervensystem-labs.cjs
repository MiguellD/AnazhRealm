// diag-nervensystem-labs.cjs — DER ε-BEWEIS DER DREI MESHFREI-DOMÄNEN (Katalysator-
// Bogen W-A6/W-A7; Studio-Vertrag §8): klang · koerper · kreatur docken NUR über
// Daten an (Manifest-Zeilen + MESHFREI-Kerne; KEINE KIND_POLICY-Zeile — keine
// Katalog-Blueprints, die Rezepte erscheinen als Studio-Rezepte der Werkstatt).
//   S (statisch, Node): Manifest trägt klang/koerper/tetrapoda (ns-Kerne) · die
//     drei Kerne deklarieren MESHFREI=1 · KIND_POLICY trägt BEWUSST keine
//     klang/koerper/kreatur-Zeile · die KLANG_HOST_RECIPE-Daten-Zeile existiert ·
//     der build-asset-Dispatch der Brücke guardet typeof buildInstance (MESHFREI-
//     Kerne können den Mesh-Kanal strukturell nicht betreten).
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch trägt lofi/wolf/mensch
//     mit fx.klang/fx.motion · paramsByKind trägt klang/koerper/kreatur (W-A1-
//     Regler-Straße) · KEINE Auto-Blueprints dieser kinds (must-ignore am
//     Chokepoint) · die Studio-Rezepte-Liste der Werkstatt führt sie (sichtbar/
//     regelbar) · DER EINE AUDIO-KONSUMENT LEBT: _klangStudioPreset liest das
//     Genesis-lofi-Genre, _lofiChordDurationMs fährt das Studio-Tempo (78 bpm →
//     ~3077 ms) und fällt ohne Rezept byte-alt auf 4000 ms (LOFI_BPM 60).
//   --selftest: injizierte Verletzungen machen die statischen Gesetze rot.
//   node scripts/diag-nervensystem-labs.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_LABS_PORT || 4437);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

// ===== TEIL S: die statischen Gesetze =====
function staticLaws(anazhSrc, brueckeSrc, manifestSrc, cores) {
    const anazhNC = stripComments(anazhSrc);
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch (_e) {}
    for (const id of ["klang", "koerper", "tetrapoda"]) {
        const c = Array.isArray(manifest) ? manifest.find((x) => x && x.id === id) : null;
        out.push([
            `S1: das Manifest traegt den ${id}-Kern (ns-Zeile)`,
            !!c && Array.isArray(c.scripts) && typeof c.ns === "string" && c.ns.length > 0,
        ]);
    }
    for (const [file, src] of cores) {
        out.push([`S2: ${file} deklariert MESHFREI = 1 (§8.1 — components-only)`, /MESHFREI\s*=\s*1/.test(src)]);
        out.push([
            `S2b: ${file} traegt KEIN buildInstance (der Host bleibt der Ofen)`,
            !/function buildInstance\(/.test(stripComments(src)),
        ]);
    }
    // Nachlese-Welle (V9.56-i — die Probe ankert auf der DEFINITIONS-Form): das
    // Gesetz gilt dem KIND_POLICY-BLOCK selbst; ein `klang: Object.freeze(...)`
    // anderswo (WORLD_REGISTRY.klang, das Klang-Portal) ist legitim und darf die
    // Linse nicht auslösen.
    const kpStart = anazhNC.indexOf("AnazhRealm.KIND_POLICY = Object.freeze({");
    const kpEnd = kpStart >= 0 ? anazhNC.indexOf("AnazhRealm.PLACE_MODES", kpStart) : -1;
    const kpBlock = kpStart >= 0 && kpEnd > kpStart ? anazhNC.slice(kpStart, kpEnd) : "";
    out.push([
        "S3: KIND_POLICY traegt BEWUSST keine klang/koerper/kreatur-Zeile (keine Katalog-Blueprints)",
        kpBlock.length > 0 &&
            !/\bklang:\s*Object\.freeze/.test(kpBlock) &&
            !/\bkoerper:\s*Object\.freeze/.test(kpBlock) &&
            !/\bkreatur:\s*Object\.freeze/.test(kpBlock),
    ]);
    out.push([
        'S4: die KLANG_HOST_RECIPE-Daten-Zeile existiert ("lofi")',
        /KLANG_HOST_RECIPE\s*=\s*"lofi"/.test(anazhNC),
    ]);
    out.push([
        "S5: der build-asset-Dispatch der Bruecke guardet typeof buildInstance (MESHFREI kann den Mesh-Kanal nicht betreten)",
        /typeof zk\.kern\.buildInstance === "function"/.test(stripComments(brueckeSrc)),
    ]);
    // Nachlese-Welle (W-A6-Erstkonsument): die Motion-Daten-Zeilen existieren
    // (MOTION_HOST_RECIPE + die Zustands→Profil-Tabelle — kein if, M8).
    out.push([
        'S6: die MOTION_HOST_RECIPE-Daten-Zeile existiert ("wolf") + MOTION_PROFILE_MAP (Tabelle, kein if)',
        /MOTION_HOST_RECIPE\s*=\s*"wolf"/.test(anazhNC) && /MOTION_PROFILE_MAP\s*=\s*Object\.freeze/.test(anazhNC),
    ]);
    return out;
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const brueckeSrc = fs.readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8");
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");
    const cores = ["klang-core.js", "koerper-core.js", "tetrapoda-core.js"].map((f) => [
        f,
        fs.readFileSync(path.join(root, f), "utf8"),
    ]);

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Labs-Linse feuert ===");
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "klang"));
        const s1 = staticLaws(anazhSrc, brueckeSrc, brokenManifest, cores).find((l) => l[0].includes("klang-Kern"));
        check("Selbst-Test 1: klang-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        const brokenCore = cores.map(([f, s]) => [
            f,
            f === "klang-core.js" ? s.replace(/MESHFREI = 1/g, "MESHFREI = 0") : s,
        ]);
        const s2 = staticLaws(anazhSrc, brueckeSrc, manifestSrc, brokenCore).find((l) =>
            l[0].includes("klang-core.js deklariert")
        );
        check("Selbst-Test 2: MESHFREI=0 injiziert -> S2 feuert", s2 && s2[1] === false);
        const brokenAnazh = anazhSrc.replace('KLANG_HOST_RECIPE = "lofi"', 'KLANG_HOST_RECIPE = "techno"');
        const s4 = staticLaws(brokenAnazh, brueckeSrc, manifestSrc, cores).find((l) => l[0].startsWith("S4"));
        check("Selbst-Test 3: KLANG_HOST_RECIPE verstellt -> S4 feuert", s4 && s4[1] === false);
        const brokenMotion = anazhSrc.replace('MOTION_HOST_RECIPE = "wolf"', 'MOTION_HOST_RECIPE = "bear"');
        const s6 = staticLaws(brokenMotion, brueckeSrc, manifestSrc, cores).find((l) => l[0].startsWith("S6"));
        check("Selbst-Test 4: MOTION_HOST_RECIPE verstellt -> S6 feuert", s6 && s6[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS LABS (klang · koerper · kreatur) — TEIL S: die statischen Gesetze ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, brueckeSrc, manifestSrc, cores)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { b: {}, k: {}, w: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.lofi && f.recipes.wolf && f.recipes.mensch) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        // ===== B: das Buch traegt die drei Domänen als DATEN =====
        const lofi = f && f.recipes ? f.recipes.lofi : null;
        const wolf = f && f.recipes ? f.recipes.wolf : null;
        const mensch = f && f.recipes ? f.recipes.mensch : null;
        res.b.lofiKind = lofi && lofi.kind;
        res.b.lofiBpm = lofi && lofi.fx && lofi.fx.klang ? lofi.fx.klang.bpm : null;
        res.b.lofiScale = lofi && lofi.fx && lofi.fx.klang ? JSON.stringify(lofi.fx.klang.scale) : null;
        res.b.wolfKind = wolf && wolf.kind;
        res.b.wolfMotion = !!(
            wolf &&
            wolf.fx &&
            wolf.fx.motion &&
            wolf.fx.motion.presets &&
            wolf.fx.motion.presets.flee
        );
        res.b.wolfCpg = !!(wolf && wolf.fx && wolf.fx.motion && Array.isArray(wolf.fx.motion.cpgCoupling));
        res.b.menschKind = mensch && mensch.kind;
        res.b.menschMotion = !!(
            mensch &&
            mensch.fx &&
            mensch.fx.motion &&
            mensch.fx.motion.presets &&
            mensch.fx.motion.presets.run
        );
        res.b.klangCount =
            f && f.recipes ? Object.keys(f.recipes).filter((k) => f.recipes[k].kind === "klang").length : 0;
        res.b.params =
            f && f.paramsByKind
                ? {
                      klang: Array.isArray(f.paramsByKind.klang) ? f.paramsByKind.klang.length : -1,
                      koerper: Array.isArray(f.paramsByKind.koerper) ? f.paramsByKind.koerper.length : -1,
                      kreatur: Array.isArray(f.paramsByKind.kreatur) ? f.paramsByKind.kreatur.length : -1,
                  }
                : null;
        // must-ignore am Chokepoint: KEINE Auto-Blueprints dieser kinds.
        // must-ignore-Probe an der HERKUNFTS-MARKE: ein Auto-Blueprint traegt
        // _foundryAutoSpecies (der Chokepoint stempelt sie) — KEINER darf auf ein
        // Rezept der drei MESHFREI-kinds zeigen (die pre-existierenden Avatar-
        // Koerper koerper_human/phoenix/dragon sind KEINE Auto-Blueprints).
        res.b.autoBpOffenders = [];
        for (const n in r.state.blueprints || {}) {
            const bp = r.state.blueprints[n];
            const src = bp && bp._foundryAutoSpecies;
            if (!src || !f.recipes || !f.recipes[src]) continue;
            const k = f.recipes[src].kind;
            if (k === "klang" || k === "koerper" || k === "kreatur") res.b.autoBpOffenders.push(n);
        }
        res.b.noAutoBps = res.b.autoBpOffenders.length === 0;
        // ===== K: DER EINE AUDIO-KONSUMENT (Lofi liest das Studio-Tempo) =====
        try {
            const emo = r.state.player.emotions;
            const s0 = emo.sorrow;
            emo.sorrow = 0;
            res.k.studio = r._klangStudioPreset() ? r._klangStudioPreset().bpm : null;
            res.k.durStudio = r._lofiChordDurationMs();
            // W-A7-VERTIEFUNG (Nachlese-Welle): die SKALA führt das Studio-Rezept —
            // der EINE skalen-bewusste Ton-Mapper faltet (mod Skalenlaenge + Oktave).
            res.k.scaleStudio = JSON.stringify(r._lofiActiveScale());
            res.k.semi2Studio = r._lofiScaleSemitone(2); // Blues: scale[2] = 5
            res.k.semi6Studio = r._lofiScaleSemitone(6); // 6-Ton-Skala: idx 6 = Oktav-Wurzel +12
            res.k.chord0Studio = JSON.stringify(r._lofiChordFromDegree(0)); // [0,5,7,12]
            // Frequenz als ZAHL: der 2. Akkord-Ton (Halbton 5 ueber A2=110) = 110*2^(5/12).
            res.k.freq1Studio = r._lofiChordFreqs(r._lofiChordFromDegree(0), false)[1];
            // Rezept kurz VERSTECKEN (Sicherung + Wiederherstellung — die Gate-Hook-Disziplin):
            const prev = f.recipes.lofi;
            delete f.recipes.lofi;
            res.k.durFallback = r._lofiChordDurationMs();
            res.k.scaleFallbackIsConst = r._lofiActiveScale() === window.anazhRealm.constructor.LOFI_SCALE; // byte-alt: DIESELBE Referenz
            res.k.semi2Fallback = r._lofiScaleSemitone(2); // A-Moll: 3
            res.k.chord0Fallback = JSON.stringify(r._lofiChordFromDegree(0)); // [0,3,7,10]
            f.recipes.lofi = prev;
            res.k.durRestored = r._lofiChordDurationMs();
            res.k.semi2Restored = r._lofiScaleSemitone(2);
            emo.sorrow = s0;
        } catch (e) {
            res.k.err = (e && e.message) || String(e);
        }
        // ===== M: DER MOTION-ERSTKONSUMENT (die Schwanz-Rolle liest fx.motion) =====
        try {
            res.m = {};
            const pi = r._motionStudioProfile(false); // idle
            const pm = r._motionStudioProfile(true); // moving -> joy (MOTION_PROFILE_MAP)
            res.m.idle = pi ? { tailRate: pi.tailRate, tailAmp: pi.tailAmp } : null;
            res.m.moving = pm ? { tailRate: pm.tailRate, tailAmp: pm.tailAmp } : null;
            // KONSUM (Verhaltens-Zahl): eine synthetische Schwanz-Rolle durch den EINEN
            // Animator — mit Studio-Profil sin(t*0.5)*0.10, byte-alt sin(t*2.2)*0.28.
            const mkGroup = () => ({
                children: [{ rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } }],
                userData: {},
            });
            const roles = [{ role: "schwanz", phase: 0 }];
            const g1 = mkGroup();
            r._animateCompoundMotion(g1, roles, 1, 0, false);
            res.m.tailStudio = g1.children[0].rotation.y;
            const prevWolf = f.recipes.wolf;
            delete f.recipes.wolf;
            const g2 = mkGroup();
            r._animateCompoundMotion(g2, roles, 1, 0, false);
            res.m.tailFallback = g2.children[0].rotation.y;
            f.recipes.wolf = prevWolf;
            const g3 = mkGroup();
            r._animateCompoundMotion(g3, roles, 1, 0, false);
            res.m.tailRestored = g3.children[0].rotation.y;
            // Source-Probe am lebenden Symbol: der Animator RUFT den Studio-Leser.
            const src = window.__codeOf
                ? window.__codeOf(r._animateCompoundMotion)
                : r._animateCompoundMotion.toString();
            res.m.consumes = /_motionStudioProfile/.test(src);
        } catch (e) {
            res.m = res.m || {};
            res.m.err = (e && e.message) || String(e);
        }
        // ===== W: die Werkstatt-Sichtbarkeit (Studio-Rezepte-Liste, W-A1-Straße) =====
        try {
            const ids = r._workshopStudioRecipeIds();
            res.w.lofi = ids.includes("lofi");
            res.w.wolf = ids.includes("wolf");
            res.w.mensch = ids.includes("mensch");
        } catch (e) {
            res.w.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check('B: das LIVE-Buch traegt lofi als kind "klang"', out.b.lofiKind === "klang", String(out.b.lofiKind));
    check(
        "B: fx.klang reist (bpm 78, Blues-Skala aus der EINEN Lab-Formel)",
        out.b.lofiBpm === 78 && out.b.lofiScale === "[0,3,5,6,7,10]",
        `bpm=${out.b.lofiBpm} scale=${out.b.lofiScale}`
    );
    check("B: alle 22 Genesis-Genres im Buch", out.b.klangCount === 22, String(out.b.klangCount));
    check(
        'B: wolf als kind "kreatur" mit fx.motion (Profile + CPG)',
        out.b.wolfKind === "kreatur" && out.b.wolfMotion === true && out.b.wolfCpg === true
    );
    check(
        'B: mensch als kind "koerper" mit fx.motion (10 Profile inkl. run)',
        out.b.menschKind === "koerper" && out.b.menschMotion === true
    );
    check(
        "B: die B4-Regler-Tabellen reisen (paramsByKind klang=7 · koerper=8 · kreatur=5)",
        !!out.b.params && out.b.params.klang === 7 && out.b.params.koerper === 8 && out.b.params.kreatur === 5,
        JSON.stringify(out.b.params)
    );
    check(
        "B: KEINE Auto-Blueprints der drei kinds (must-ignore am Chokepoint)",
        out.b.noAutoBps === true,
        (out.b.autoBpOffenders || []).join(",")
    );
    check(
        "K: _klangStudioPreset liest das Genesis-lofi-Genre (bpm 78)",
        out.k.studio === 78,
        out.k.err || String(out.k.studio)
    );
    check(
        "K: _lofiChordDurationMs faehrt das STUDIO-Tempo (78 bpm -> ~3077 ms)",
        Math.abs(out.k.durStudio - (60000 / 78) * 4) < 1,
        String(out.k.durStudio)
    );
    check(
        "K: ohne Rezept faellt das Tempo byte-alt auf LOFI_BPM (4000 ms) — fail-soft G4.1",
        Math.abs(out.k.durFallback - 4000) < 1,
        String(out.k.durFallback)
    );
    check("K: nach der Wiederherstellung wieder Studio-Tempo", Math.abs(out.k.durRestored - out.k.durStudio) < 1);
    check(
        "K2 (W-A7-Vertiefung): _lofiActiveScale liest die Studio-Blues-Skala [0,3,5,6,7,10]",
        out.k.scaleStudio === "[0,3,5,6,7,10]",
        String(out.k.scaleStudio)
    );
    check(
        "K2: der EINE Ton-Mapper faltet (scale[2]=5 · idx 6 = Oktav-Wurzel 12 · Akkord i = [0,5,7,12])",
        out.k.semi2Studio === 5 && out.k.semi6Studio === 12 && out.k.chord0Studio === "[0,5,7,12]",
        `semi2=${out.k.semi2Studio} semi6=${out.k.semi6Studio} chord=${out.k.chord0Studio}`
    );
    check(
        "K2: die Frequenz ist die Studio-Zahl (2. Akkord-Ton = 110·2^(5/12) ≈ 146.83 Hz)",
        Math.abs(out.k.freq1Studio - 110 * Math.pow(2, 5 / 12)) < 0.01,
        String(out.k.freq1Studio)
    );
    check(
        "K2: versteckt → byte-alt (LOFI_SCALE-REFERENZ · semi2=3 · Akkord [0,3,7,10]) · wiederhergestellt → Studio",
        out.k.scaleFallbackIsConst === true &&
            out.k.semi2Fallback === 3 &&
            out.k.chord0Fallback === "[0,3,7,10]" &&
            out.k.semi2Restored === 5,
        `fallback semi2=${out.k.semi2Fallback} restored=${out.k.semi2Restored}`
    );
    check(
        "M (W-A6-Erstkonsument): _motionStudioProfile liest idle 0.5/0.10 · moving[joy] 5.5/0.38",
        !!out.m &&
            !!out.m.idle &&
            out.m.idle.tailRate === 0.5 &&
            out.m.idle.tailAmp === 0.1 &&
            !!out.m.moving &&
            out.m.moving.tailRate === 5.5 &&
            out.m.moving.tailAmp === 0.38,
        (out.m && out.m.err) || JSON.stringify(out.m && out.m.idle)
    );
    check(
        "M: KONSUM als ZAHL — Schwanz-Winkel Studio sin(0.5)·0.10, versteckt byte-alt sin(2.2)·0.28, wiederhergestellt Studio",
        !!out.m &&
            Math.abs(out.m.tailStudio - Math.sin(0.5) * 0.1) < 1e-9 &&
            Math.abs(out.m.tailFallback - Math.sin(2.2) * 0.28) < 1e-9 &&
            Math.abs(out.m.tailRestored - Math.sin(0.5) * 0.1) < 1e-9,
        out.m ? `studio=${out.m.tailStudio} fallback=${out.m.tailFallback}` : ""
    );
    check(
        "M: der EINE Animator ruft den Studio-Leser (Source-Probe _animateCompoundMotion → _motionStudioProfile)",
        !!out.m && out.m.consumes === true
    );
    check(
        "W: die Studio-Rezepte-Liste der Werkstatt fuehrt lofi/wolf/mensch (sichtbar/regelbar)",
        out.w.lofi === true && out.w.wolf === true && out.w.mensch === true,
        out.w.err || ""
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE DREI MESHFREI-DOMÄNEN DOCKEN ALS REINE DATEN: Manifest-Zeilen + §8-Kerne, das Buch traegt fx.klang/fx.motion, die Regler-Strasse traegt die Dials, kein Auto-Blueprint entsteht (must-ignore), die Werkstatt zeigt die Rezepte — der EINE Audio-Konsument lebt (Tempo + SKALA durch den einen Ton-Mapper, fail-soft byte-alt) und der Motion-Erstkonsument liest fx.motion (Schwanz-Rolle, KONSUM als Zahl)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("ε-Labs-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
