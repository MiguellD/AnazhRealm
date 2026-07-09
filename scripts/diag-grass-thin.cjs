#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-grass-thin.cjs — DIE WIESE IST STUDIO-DEFINIERT (npm run gate:grass-thin, N7.4)
//
// Geschichte: V18.363 baute das Gras-Nach-Dünnen (`_tickGrassThin`) für den Alt-Tuft-Pfad;
// V18.422 entschied „im Studio-Regime dünnt die Wiese NIE" (das Studio-Raster trägt die
// volle Dichte bis zur Sichtkante). N7.4 vollzieht den Abschied: der Alt-Tuft-Bauer
// (`_grassBladeTuftGeometry`) und der Gras-Thin-Tick sind GESCHNITTEN — die Wiese IST das
// Studio-Asset (das P4-Gesetz „wenn kein Gras da ist, ist es so", auf das Gras gehoben).
// Ohne Studio-Pipeline (Test-Hook/Worker-lose Einbettung) wird jede Gras-Zelle bewusst
// gras-los verbucht (Nebel-Front zufrieden, kein Deadlock, KEIN Nachbau).
//
// Diese Linse beweist headless (foundry-off-Welt über den globalen Hook):
//   (a) die Welt baut OHNE Studio → JEDE Gras-Zelle ist bewusst gras-los verbucht
//       (voxelChunkGrass: nur null-Einträge · 0 Halm-Instanzen · Lod-Map gefüllt =
//       die Front ist zufrieden) — und KEIN Page-Error (der Schnitt crasht nirgends);
//   (b) QUELLE (kommentar-bereinigt): kein `_grassBladeTuftGeometry`, kein `_tickGrassThin`,
//       die Existenz-Gabel `if (!grassStudio)` steht, die Dichte ist das Studio-Literal 1,
//       der Idle-Pass ruft keinen Gras-Thin mehr.
// Die STUDIO-Wiese selbst (Halm = Studio-Asset, volle Dichte) beweisen der volle
// foundry-ON-Playtest + gate:foundry-warm. GPU-frei.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4331;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
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

// Kommentar-Strip (die V18.267-Falle: ein erklärender Kommentar zitiert das geschnittene
// Symbol → ein naiver Absenz-Grep stolpert). Dieselbe Disziplin wie gate:constitution.
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // N7.4 — die Linse prüft die OHNE-Studio-Welt (der eine Unit-Richter-Hook):
        // dort MUSS die Wiese bewusst gras-los sein (kein Tuft-Nachbau, kein Crash).
        window.__anazhGateNoFoundry = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 150; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const o = {};
            // (a) BEHAVIORAL — die foundry-off-Welt: jede Gras-Zelle bewusst gras-los.
            o.chunks = st.voxelChunks ? st.voxelChunks.size : 0;
            o.grassEntries = st.voxelChunkGrass ? st.voxelChunkGrass.size : 0;
            let nonNull = 0,
                instances = 0;
            if (st.voxelChunkGrass)
                for (const inst of st.voxelChunkGrass.values())
                    if (inst) {
                        nonNull++;
                        instances += inst.count || 0;
                    }
            o.grassNonNull = nonNull;
            o.grassInstances = instances;
            o.lodMapSize = st.voxelChunkGrassLod ? st.voxelChunkGrassLod.size : 0;
            // (b) QUELLE — der Schnitt steht (kommentar-bereinigt, sonst V18.267-Falle).
            const strip = (src) =>
                String(src)
                    .replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
            o.tuftMethodGone = typeof r._grassBladeTuftGeometry === "undefined";
            o.thinMethodGone = typeof r._tickGrassThin === "undefined";
            o.densityMapGone = st.voxelChunkGrassDensity === undefined;
            const buildSrc = strip(r._buildVoxelChunkGrass.toString());
            o.existenzGabel = /if \(!grassStudio\) \{/.test(buildSrc);
            o.dichteLiteral = /const grassDensityScale = 1;/.test(buildSrc);
            o.farFactorLiteral = /const farFactor = 1;/.test(buildSrc);
            o.keinTuftAufruf = !/_grassBladeTuftGeometry/.test(buildSrc);
            const idleSrc = strip(r._tickScatterStreaming.toString());
            o.idleOhneGrasThin = !/_tickGrassThin/.test(idleSrc);
            // der Streu-Thin (V18.280) LEBT weiter — der eine verbliebene Thin-Hebel:
            o.streuThinLebt = /_tickFoliageThin/.test(idleSrc) && typeof r._tickFoliageThin === "function";
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Wiese-Studio-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // Statische Doppel-Wand (Node-seitig, ohne Browser-Umweg): das Symbol lebt nirgends im Stamm.
    const anazhNC = stripComments(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    const staticTuftGone = !/_grassBladeTuftGeometry/.test(anazhNC) && !/GRASS_TUFT_BLADES/.test(anazhNC);
    const staticThinGone = !/_tickGrassThin/.test(anazhNC) && !/voxelChunkGrassDensity/.test(anazhNC);

    const checks = [
        {
            name: `foundry-off-Welt baut (${out.chunks} Chunks) + JEDE Gras-Zelle bewusst gras-los (${out.grassEntries} verbucht, ${out.grassNonNull} non-null, ${out.grassInstances} Halme)`,
            pass: out.chunks > 0 && out.grassEntries > 0 && out.grassNonNull === 0 && out.grassInstances === 0,
        },
        {
            name: `die Front ist zufrieden (Lod-Map ${out.lodMapSize} Einträge — verbucht, nicht übersprungen)`,
            pass: out.lodMapSize > 0 && out.lodMapSize >= out.grassEntries,
        },
        {
            name: "kein Page-Error (der Schnitt crasht nirgends)",
            pass: pageErrors.length === 0,
        },
        {
            name: "Tuft-Bauer + Thin-Tick + Dichte-Map sind geschnitten (Laufzeit + statisch)",
            pass: out.tuftMethodGone && out.thinMethodGone && out.densityMapGone && staticTuftGone && staticThinGone,
        },
        {
            name: "die Existenz-Gabel steht (`if (!grassStudio)`) + Studio-Literale (Dichte 1, farFactor 1) + kein Tuft-Aufruf",
            pass: out.existenzGabel && out.dichteLiteral && out.farFactorLiteral && out.keinTuftAufruf,
        },
        {
            name: "der Idle-Pass ruft keinen Gras-Thin mehr; der Streu-Thin (V18.280) lebt als der eine Hebel",
            pass: out.idleOhneGrasThin && out.streuThinLebt,
        },
    ];
    console.log("\n=== N7.4 — DIE WIESE IST STUDIO-DEFINIERT (der Tuft-Abschied) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));
    if (fails > 0) {
        console.log(`\n❌ ${fails} Prüfung(en) rot`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — die Wiese ist Studio-definiert: ohne Pipeline bewusst gras-los, kein Nachbau.");
    process.exit(0);
})().catch((e) => {
    console.error("⛔", e);
    process.exit(2);
});
