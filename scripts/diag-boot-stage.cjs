#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-boot-stage.cjs — „VOLLE BÜHNE" ALS PRÜFBARES PRÄDIKAT + ZEITLEISTE (W2)
//
// DONE-Kriterium 2 der Studio-Paritäts-Mission („Boot ≤3 s bis volle Bühne")
// war bis W2 PROSAISCH — niemand hatte definiert, was „volle Bühne" IST, kein
// Skript maß sie. Hier ist sie ein PRÄDIKAT aus kanonischen Quellen (nichts
// hartkodiert — die Impostor-Erwartung leitet sich aus der Bibliothek ab, die
// V18.419-Auto-Blueprint-Klasse macht jede feste Zahl stale):
//   RING    _activeRingRadius ≥ Ziel (der Weitblick hängt daran)
//   GRAS    pendingGrass leer            WASSER  pendingWaterIso leer
//   STREU   keine Region._deferredFoundry (der stille Saug ist durch)
//   BIBLIO  Foundry ready + Prefetch fertig
//   IMPOST  Bake-Queue leer + kein Bake pending (non-headless; der Null-
//           Renderer no-opt den RTT-Bake gate-treu → Term dort übersprungen)
//   NEBEL   fog.far settled + geöffnet (kein Ramp-Kappen mehr)
// Zeitleiste: t(Kontrolle) / t(Bibliothek) / t(Ring) / t(Impostoren) / t(Bühne)
// in TICKS (Mechanik-Reihenfolge, hardware-unabhängig) + Wall-Clock (Container-
// Anhalt; die Schöpfer-GPU-Zahl liefert W8). --selftest beweist die Linse feuert
// (eine injizierte deferierte Region macht das Prädikat rot).
//   node scripts/diag-boot-stage.cjs [--selftest]
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4406;
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

(async () => {
    const SELFTEST = process.argv.includes("--selftest");
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        const navT0 = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        const controlMs = Date.now() - navT0;
        out = await page.evaluate(async (selftest) => {
            const r = window.anazhRealm,
                st = r.state;
            const o = { terms: {}, timeline: {}, selftest: null };
            const headless = !!(st.renderer && st.renderer._isHeadlessNull);
            // ── DAS PRÄDIKAT (jeder Term aus der kanonischen Quelle) ──
            const terms = () => {
                const f = r._foundry;
                const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
                let deferred = 0;
                if (st.scatterRegions)
                    for (const reg of st.scatterRegions.values()) if (reg && reg._deferredFoundry) deferred++;
                const q = r._impostorBakeQueue;
                return {
                    ring: st._activeRingRadius != null && st._activeRingRadius >= ringTarget,
                    grass: !st.pendingGrass || st.pendingGrass.size === 0,
                    water: !st.pendingWaterIso || st.pendingWaterIso.size === 0,
                    streu: deferred === 0,
                    biblio: !!(f && f.ready && !f._prefetching),
                    // Headless no-opt der RTT-Bake (gate-treu) → Term übersprungen, ehrlich markiert.
                    impost: headless ? true : (!q || q.length === 0) && !r._impostorBakePending,
                    _deferredRegions: deferred,
                };
            };
            const fogFar = () => (st.scene && st.scene.fog ? st.scene.fog.far : -1);
            // ── PUMPEN + MEILENSTEINE (Ticks + ms) ──
            const t0 = performance.now();
            let ticks = 0;
            const mark = {};
            let fogPrev = -1,
                fogStable = 0;
            const MAXT = 6000;
            while (ticks < MAXT) {
                try {
                    r._gameLoopTick();
                } catch (_e) {}
                ticks++;
                const T = terms();
                const ff = fogFar();
                if (Math.abs(ff - fogPrev) < 0.5) fogStable++;
                else {
                    fogStable = 0;
                    fogPrev = ff;
                }
                const fogOpen = fogStable > 30 && ff > 60;
                if (!mark.biblio && T.biblio) mark.biblio = { ticks, ms: performance.now() - t0 };
                if (!mark.ring && T.ring) mark.ring = { ticks, ms: performance.now() - t0 };
                if (!mark.impost && T.impost && T.biblio) mark.impost = { ticks, ms: performance.now() - t0 };
                if (T.ring && T.grass && T.water && T.streu && T.biblio && T.impost && fogOpen) {
                    mark.stage = { ticks, ms: performance.now() - t0 };
                    o.terms = T;
                    break;
                }
                if (ticks % 5 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            if (!mark.stage) o.terms = terms();
            o.headless = headless;
            o.fogFar = +fogFar().toFixed(1);
            o.timeline = {
                biblio: mark.biblio || null,
                ring: mark.ring || null,
                impost: mark.impost || null,
                stage: mark.stage || null,
                totalTicks: ticks,
            };
            o.chunks = st.voxelChunks ? st.voxelChunks.size : 0;
            o.impostorRecords = r._impostorAtlasMap ? r._impostorAtlasMap.size : 0;
            // ── SELBST-TEST: eine injizierte deferierte Region macht das Prädikat rot ──
            if (selftest && mark.stage) {
                const map = st.scatterRegions;
                if (map) {
                    const fake = { regX: 9999, regZ: 9999, cells: [], _deferredFoundry: true };
                    map.set("9999,9999", fake);
                    const dirty = terms();
                    map.delete("9999,9999");
                    const clean = terms();
                    o.selftest = { firesOnInject: dirty.streu === false, healsOnClean: clean.streu === true };
                }
            }
            return o;
        }, SELFTEST);
        out.controlMs = controlMs;
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Bühnen-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const tl = out.timeline;
    const fm = (m) => (m ? `Tick ${m.ticks} · ${(m.ms / 1000).toFixed(1)} s` : "— (nicht erreicht)");
    console.log(
        "\n=== VOLLE BÜHNE — das Prädikat + die Zeitleiste (headless-Mechanik; Wall-Clock = Container-Anhalt) ==="
    );
    console.log(`  t(Kontrolle)   nav→Loop ${(out.controlMs / 1000).toFixed(1)} s`);
    console.log(`  t(Bibliothek)  ${fm(tl.biblio)}`);
    console.log(`  t(Ring)        ${fm(tl.ring)}`);
    console.log(
        `  t(Impostoren)  ${fm(tl.impost)}${out.headless ? "  (headless: RTT-Term übersprungen, gate-treu)" : ""}`
    );
    console.log(
        `  t(BÜHNE)       ${fm(tl.stage)}   (${out.chunks} Chunks · ${out.impostorRecords} Impostor-Records · fog.far ${out.fogFar} m)`
    );
    const T = out.terms;
    const checks = [
        { name: `RING erreicht Ziel (${T.ring})`, pass: T.ring === true },
        {
            name: `GRAS aufgeholt (${T.grass}) · WASSER aufgeholt (${T.water})`,
            pass: T.grass === true && T.water === true,
        },
        { name: `STREU konvergiert — keine deferierte Region (${T._deferredRegions})`, pass: T.streu === true },
        {
            name: `BIBLIOTHEK warm (${T.biblio}) · IMPOSTOREN idle (${T.impost})`,
            pass: T.biblio === true && T.impost === true,
        },
        { name: "die BÜHNE wurde erreicht (das Prädikat schloss)", pass: !!tl.stage },
    ];
    if (SELFTEST)
        checks.push({
            name: "SELBST-TEST: injizierte deferierte Region macht das Prädikat rot + heilt nach Entfernen",
            pass: !!(out.selftest && out.selftest.firesOnInject && out.selftest.healsOnClean),
        });
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Bühnen-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die volle Bühne steht nicht (oder die Linse ist stumpf) — Kriterium 2 ist nicht abnehmbar.");
        process.exit(1);
    }
    console.log(`✅ „Volle Bühne" ist jetzt ein Prädikat mit Zeitleiste — Kriterium 2 ist messbar.`);
    process.exit(0);
})();
