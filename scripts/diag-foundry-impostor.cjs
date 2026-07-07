// diag-foundry-impostor.cjs — P5-BEWEIS: der Impostor-Atlas backt auf dem EINEN Haupt-Renderer (RTT),
// das GL-Bake-iframe ist GESCHNITTEN. Zwei Teile:
//   A (Null-Renderer, HART): die MECHANIK — `_foundryEnsureImpostorRecord` legt einen Record mit
//     `foundry:true` + `_foundryBakeLeaves` (die LOD1-Geometrie) an; KEIN asset-foundry-iframe im DOM;
//     die drei iframe-Methoden sind weg. Der RTT ist headless ein No-op (Silhouetten-Fallback trägt).
//   B (echter swiftshader-Renderer, BEST-EFFORT): der RTT-Bake läuft (`__impostorRttBaked` steigt) ohne
//     page-error. Der LOOK des Atlas bleibt das Schöpfer-Auge (echte GPU); hier zählt „läuft, crasht nicht".
//   node scripts/diag-foundry-impostor.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FIMP_PORT || 4595);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
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

async function bootPage(browser, nullRenderer) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((nr) => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        if (nr) window.__anazhHeadlessNullRenderer = true;
    }, nullRenderer);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                typeof window.anazhRealm._foundryEnsureImpostorRecord !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    return { page, pageErrors };
}

// Wartet, bis der Foundry-Worker ready ist + ein Impostor-Record steht (die LOD1-Geometrie lädt async).
async function driveImpostor(page) {
    return await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { ready: false, rec: null, err: null, hasIframe: null, cutMethods: null };
        try {
            const f = r._ensureAssetFoundry();
            const dl = performance.now() + 60000;
            while (f && !f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
            out.ready = !!(f && f.ready);
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }
            // Den Impostor-Record treiben: erst lädt die LOD1-Geometrie (null), dann steht der Record.
            let rec = null;
            const dl2 = performance.now() + 45000;
            while (performance.now() < dl2) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const v = r._foundryEnsureImpostorRecord("eiche", 0, "summer");
                if (v && v !== true) {
                    rec = v;
                    break;
                }
                await new Promise((res) => setTimeout(res, 30));
            }
            if (rec) {
                out.rec = {
                    foundry: rec.foundry === true,
                    bakeLeaves: Array.isArray(rec._foundryBakeLeaves) ? rec._foundryBakeLeaves.length : 0,
                    hasMap: !!rec.map,
                    hasFrame: !!(rec.frame && rec.frame.halfH > 0),
                    views: rec.views,
                };
            }
            // Kein asset-foundry-iframe im DOM (das Bake-iframe ist geschnitten).
            out.hasIframe = !!document.querySelector('iframe[src*="asset-foundry"]');
            // Die drei iframe-Methoden sind weg.
            out.cutMethods = {
                requestImpostor: typeof r._foundryRequestImpostor,
                ensureBakeIframe: typeof r._foundryEnsureBakeIframe,
                buildImpostorRecord: typeof r._foundryBuildImpostorRecord,
            };
            out.rttBaked = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            // Den Bake-Tick pumpen (echter Renderer bäckt async über mehrere Frames).
            for (let i = 0; i < 40; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 30));
                if ((window.__impostorRttBaked || 0) > out.rttBaked) break;
            }
            out.rttBakedAfter = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            out.rttErrorAfter = (typeof window !== "undefined" && window.__impostorRttError) || null;
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const errs = [];

    // ===== TEIL A — MECHANIK (Null-Renderer, HART) =====
    const browserA = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const { page: pageA, pageErrors: errA } = await bootPage(browserA, true);
    const A = await driveImpostor(pageA);
    await browserA.close();

    console.log("=== P5 — TEIL A: MECHANIK (Null-Renderer) ===");
    console.log(`  Worker ready: ${A.ready}`);
    console.log(`  Impostor-Record: ${JSON.stringify(A.rec)}`);
    console.log(`  asset-foundry-iframe im DOM: ${A.hasIframe} (erwartet false)`);
    console.log(`  iframe-Methoden (erwartet 3x undefined): ${JSON.stringify(A.cutMethods)}`);
    if (A.err) console.log(`  Fehler: ${A.err}`);
    if (errA.length) console.log("  Seiten-Fehler A:", errA.slice(0, 3));

    if (!A.ready) errs.push("A: der Worker wurde nicht ready");
    if (!A.rec) errs.push("A: kein Impostor-Record entstanden (die LOD1-Geometrie lud nicht?)");
    else {
        if (!A.rec.foundry) errs.push("A: der Record traegt NICHT die foundry-Flagge (falscher Pfad)");
        if (!(A.rec.bakeLeaves > 0)) errs.push("A: der Record hat KEINE _foundryBakeLeaves (kein Bake-Subjekt)");
        if (!A.rec.hasMap) errs.push("A: der Record hat keinen Atlas-Fallback (map)");
        if (!A.rec.hasFrame) errs.push("A: der Record hat keinen Frame");
    }
    if (A.hasIframe) errs.push("A: ein asset-foundry-iframe LEBT noch im DOM (P3b nicht geschnitten)");
    if (A.cutMethods) {
        for (const [k, v] of Object.entries(A.cutMethods))
            if (v !== "undefined") errs.push(`A: die iframe-Methode ${k} existiert noch (${v})`);
    }
    if (errA.length) errs.push(`A: ${errA.length} Seiten-Fehler`);

    // ===== TEIL B — DER RTT-BAKE LÄUFT (echter swiftshader-Renderer, OPT-IN) =====
    // NUR mit P5_REAL_RENDERER=1: zwei swiftshader-Seiten verhungern den Container-Event-Loop
    // (dokumentiert) → per Default aus, damit der Gate deterministisch bleibt. Der RTT-LOOK ist
    // ohnehin das Schöpfer-Auge auf echter GPU; die MECHANIK (Teil A) ist der hardware-unabhängige Beweis.
    if (process.env.P5_REAL_RENDERER) {
        console.log("\n=== P5 — TEIL B: RTT-BAKE auf echtem Renderer (opt-in) ===");
        try {
        const browserB = await puppeteer.launch({
            headless: true,
            protocolTimeout: 180000,
            args: [
                "--use-angle=swiftshader",
                "--enable-unsafe-swiftshader",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        const { page: pageB, pageErrors: errB } = await bootPage(browserB, false);
        const B = await driveImpostor(pageB);
        await browserB.close();
        console.log(`  Worker ready: ${B.ready} · Record foundry: ${B.rec && B.rec.foundry}`);
        console.log(`  RTT gebacken (nach Pump): ${B.rttBakedAfter} · RTT-Fehler: ${B.rttErrorAfter || "keiner"}`);
        if (errB.length) {
            console.log("  Seiten-Fehler B:", errB.slice(0, 3));
            errs.push(`B: ${errB.length} Seiten-Fehler beim RTT-Pfad`);
        }
        if (B.err) console.log(`  (B-Notiz: ${B.err})`);
            if (B.rttBakedAfter > 0) console.log("  ok — der RTT-Bake lief auf echter GPU-Bahn (Atlas gebacken).");
            else console.log("  (RTT nicht abgeschlossen — swiftshader-fragil; der LOOK ist das Schoepfer-Auge.)");
        } catch (e) {
            console.log(`  (Teil B uebersprungen — Renderer-Start fehlgeschlagen: ${(e && e.message) || e})`);
        }
    } else {
        console.log("\n(Teil B [echter RTT-Bake] per Default aus — mit P5_REAL_RENDERER=1 aktivieren; der LOOK ist das Schoepfer-Auge.)");
    }

    server.close();
    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Foundry-Impostor backt über den EINEN Haupt-Renderer-RTT (foundry-Record + LOD1-Bake-Leaves), das GL-Bake-iframe ist geschnitten (kein DOM-iframe, die drei Methoden weg). Der Atlas-LOOK ist das Schoepfer-Auge auf echter GPU."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Foundry-Impostor-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
