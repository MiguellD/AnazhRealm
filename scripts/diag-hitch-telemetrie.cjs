// diag-hitch-telemetrie.cjs — DIE HITCH-LINSE (das-feld-zeichnet §5.1): beweist
// KONSUM der vier neuen Flugschreiber-Zähler (LongTasks · GC/Heap-Delta ·
// Pipeline-Compiles · Upload-Bytes), nie bloße Existenz (Lehre 5). Ein ECHTER
// WebGPU-Lauf (swiftshader-Vulkan, wie diag-blick.cjs — KEIN Null-Renderer):
// der Boot SELBST ist der Konsum-Beweis (Warm-Compile erzeugt Pipelines,
// Chunk-Uploads erzeugen writeBuffer-Bytes, swiftshader erzeugt LongTasks).
//
//   node scripts/diag-hitch-telemetrie.cjs
//   Exit 0 = alle Bänder GRÜN (inkl. Selbst-Test: ein Fake-Trace ohne die neuen
//   Felder MUSS rot melden) · Exit 1 = mindestens ein Band ROT (mit Diagnose).
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Port der Linse (4463 — neben diag-blick 4461, nie der save-server 4312).
const PORT = Number(process.env.HITCH_PORT || 4463);
// Laufzeit nach dem Welt-Settle: ~15 s echte Loop-Zeit, damit Sekunden-Grenzen,
// EWMA und Ringe wirklich GEFÜLLT sind (nicht nur initialisiert).
const LAUFZEIT_MS = 15000;
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

// DIE EINE PRÜF-FUNKTION für die Trace-Struktur — der echte Trace UND der
// Fake-Trace des Selbst-Tests laufen durch DENSELBEN Code (kein Parallelpfad).
// Rückgabe: Liste der Mängel (leer = der Trace trägt alle vier Zähler).
function pruefeTraceFelder(trace) {
    const maengel = [];
    if (!trace || typeof trace !== "object") return ["Trace fehlt komplett (null/kein Objekt)"];
    const lt = trace.session && trace.session.longTasks;
    if (!lt || typeof lt.n !== "number" || typeof lt.ms !== "number" || typeof lt.maxMs !== "number")
        maengel.push("session.longTasks {n,ms,maxMs} fehlt oder ist nicht numerisch");
    if (!trace.memory || typeof trace.memory.gcN !== "number")
        maengel.push("memory.gcN fehlt oder ist nicht numerisch");
    const pp = trace.steadyState && trace.steadyState.pipelines;
    if (!pp || typeof pp.total !== "number" || typeof pp.neuProS !== "number")
        maengel.push("steadyState.pipelines {total,neuProS} fehlt oder ist nicht numerisch");
    if (!trace.steadyState || typeof trace.steadyState.uploadKBProS !== "number")
        maengel.push("steadyState.uploadKBProS fehlt oder ist nicht numerisch");
    return maengel;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // Launch-Flags WÖRTLICH aus diag-blick.cjs — echtes WebGPU via swiftshader-Vulkan.
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    // KEIN Null-Renderer — die Zähler brauchen den echten WebGPU-Pfad (Tap + Pipelines).
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const gpu = await page.evaluate(async () => {
        if (!navigator.gpu) return "kein navigator.gpu";
        try {
            const a = await navigator.gpu.requestAdapter();
            return a ? "adapter ok" : "kein adapter";
        } catch (e) {
            return "adapter-wurf: " + (e && e.message);
        }
    });
    console.log("WebGPU-Probe:", gpu);

    const out = await page.evaluate(async (laufzeitMs) => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const res = {};
        const dl = performance.now() + 300000;
        while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await sleep(200);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        // Settle wie diag-blick: Chunks-Plateau (großzügig — swiftshader ist zäh).
        let stable = 0,
            last = -1;
        while (performance.now() < dl) {
            const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            if (sz === last) stable++;
            else {
                stable = 0;
                last = sz;
            }
            if (sz > 20 && stable > 10) break;
            await sleep(500);
        }
        const rend = r.state.renderer;
        if (!rend) return { fatal: "kein Renderer" };
        res.rendererArt = rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?";
        res.headlessNull = !!rend._isHeadlessNull;
        if (rend._isHeadlessNull) return { fatal: "Renderer fiel auf headless-Null zurück — kein echter WebGPU-Lauf" };
        // ~15 s echte Laufzeit: der rAF-Loop läuft; falls die Frames stocken
        // (headless-Drossel), treiben wir den Loop von Hand (wie diag-blick).
        const frGet = () => r.state.flightRecorder || null;
        const framesVor = frGet() ? frGet().frames : 0;
        const tEnde = performance.now() + laufzeitMs;
        while (performance.now() < tEnde) {
            const fr0 = frGet();
            const fBefore = fr0 ? fr0.frames : 0;
            await sleep(1000);
            const fr1 = frGet();
            if (fr1 && fr1.frames === fBefore) {
                // Loop steht — manuell ticken, damit die Sekunden-Grenzen fallen.
                for (let i = 0; i < 30; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {
                        /* die Linse misst, nie stören */
                    }
                    await sleep(30);
                }
            }
        }
        const fr = frGet();
        if (!fr) return { fatal: "kein flightRecorder nach Laufzeit" };
        res.frames = fr.frames;
        res.framesDelta = fr.frames - framesVor;
        // (1) LongTasks: numerisch + gemessene Werte.
        res.lt = {
            ltN: fr.ltN,
            ltMs: fr.ltMs,
            ltMaxMs: fr.ltMaxMs,
            typN: typeof fr.ltN,
            typMs: typeof fr.ltMs,
            accDa: !!(r._ltAcc && typeof r._ltAcc.ms === "number"),
            obsDa: !!r._ltObs,
        };
        // (2) gcRing: existiert + trägt Werte, _heapLast gesetzt.
        let gcNonZero = 0;
        if (fr.gcRing && fr.secRingN) {
            const N = fr.gcRing.length;
            for (let i = 0; i < Math.min(fr.secRingN, N); i++) {
                const v = fr.gcRing[(fr.secRingI - Math.min(fr.secRingN, N) + i + N) % N];
                if (Math.abs(v) > 0.001) gcNonZero++;
            }
        }
        res.gc = {
            ringDa: !!fr.gcRing,
            ringLen: fr.gcRing ? fr.gcRing.length : 0,
            secRingN: fr.secRingN | 0,
            nonZero: gcNonZero,
            heapLast: Number.isFinite(fr._heapLast) ? fr._heapLast : null,
            gcN: fr.gcN,
            memoryApi: !!(performance && performance.memory),
        };
        // (3) Pipelines: der Boot-Warm-Compile ERZEUGT welche — Konsum-Beweis.
        const sns = r.state.perfSense || {};
        res.pipes = {
            pipesN: fr.pipesN,
            total: sns.pipesTotal,
            neuProS: sns.pipesNeuProS,
            cachesSize:
                rend._pipelines && rend._pipelines.caches && typeof rend._pipelines.caches.size === "number"
                    ? rend._pipelines.caches.size
                    : null,
        };
        // (4) Upload-Bytes: der Queue-Tap muss sitzen + kumuliert > 1 MB nach Boot.
        const q = rend.backend && rend.backend.device && rend.backend.device.queue;
        res.up = {
            tapDa: !!(q && q.__anazhTap === true),
            upBytes: fr.upBytes,
            uploadBytesEwma: sns.uploadBytesEwma,
        };
        // (5) Trace direkt bauen (EINE Quelle — kein Warten auf den 4-s-Save).
        let trace = null;
        try {
            trace = r._flightRecorderBuildTrace();
        } catch (e) {
            res.traceWurf = String(e && e.message);
        }
        res.trace = trace
            ? {
                  sessionLongTasks: trace.session && trace.session.longTasks,
                  memoryGcN: trace.memory ? trace.memory.gcN : undefined,
                  steadyPipelines: trace.steadyState && trace.steadyState.pipelines,
                  steadyUploadKBProS: trace.steadyState ? trace.steadyState.uploadKBProS : undefined,
                  session: trace.session
                      ? { longTasks: trace.session.longTasks }
                      : null,
                  memory: trace.memory ? { gcN: trace.memory.gcN } : null,
                  steadyState: trace.steadyState
                      ? {
                            pipelines: trace.steadyState.pipelines,
                            uploadKBProS: trace.steadyState.uploadKBProS,
                        }
                      : null,
              }
            : null;
        return res;
    }, LAUFZEIT_MS);

    await browser.close();
    server.close();

    console.log("\n===== HITCH-TELEMETRIE-LINSE (das-feld-zeichnet §5.1) =====");
    if (!out || out.fatal) {
        console.log("FATAL:", out ? out.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        process.exit(1);
    }
    console.log(
        `Renderer: ${out.rendererArt} · frames=${out.frames} (Δ Laufzeit ${out.framesDelta})` +
            ` · performance.memory=${out.gc.memoryApi ? "da" : "FEHLT"}`
    );

    let rot = 0;
    const band = (ok, name, detail) => {
        console.log(`${ok ? "✅" : "❌"} ${name} — ${detail}`);
        if (!ok) rot++;
    };

    // Band 1 — LongTasks: swiftshader-Boot QUASI SICHER > 0; wenn 0, nur Existenz+Typ.
    const lt = out.lt;
    const ltNumerisch = lt.typN === "number" && lt.typMs === "number" && Number.isFinite(lt.ltMaxMs);
    if (lt.ltN > 0) {
        band(
            ltNumerisch,
            "LONGTASKS (Konsum)",
            `ltN=${lt.ltN} · ltMs=${Math.round(lt.ltMs)} ms · ltMaxMs=${Math.round(lt.ltMaxMs)} ms · Observer=${lt.obsDa}`
        );
    } else {
        band(
            ltNumerisch && lt.accDa,
            "LONGTASKS (nur Existenz+Typ — Boot ohne LongTask, ungewöhnlich)",
            `ltN=0 · Felder numerisch=${ltNumerisch} · Akku installiert=${lt.accDa}`
        );
    }

    // Band 2 — Heap/GC: Ring existiert + _heapLast gesetzt (wo performance.memory da ist).
    const gc = out.gc;
    const gcOk = gc.ringDa && gc.ringLen === 180 && (!gc.memoryApi || Number.isFinite(gc.heapLast));
    band(
        gcOk,
        "HEAP/GC-RING",
        `gcRing[${gc.ringLen}] da=${gc.ringDa} · Sekunden=${gc.secRingN} · nonZero-Slots=${gc.nonZero} · heapLast=${
            gc.heapLast != null ? (gc.heapLast / 1048576).toFixed(0) + " MB" : "—"
        } · gcN=${gc.gcN}`
    );

    // Band 3 — Pipelines: der Boot-Warm-Compile erzeugt Pipelines ⇒ pipesN > 0 ist der Konsum-Beweis.
    const pp = out.pipes;
    band(
        typeof pp.pipesN === "number" && pp.pipesN > 0,
        "PIPELINE-COMPILES (Konsum)",
        `pipesN=${pp.pipesN} · caches.size=${pp.cachesSize} · sense.total=${pp.total} · neuProS=${
            pp.neuProS != null ? (+pp.neuProS).toFixed(2) : "—"
        }`
    );

    // Band 4 — Upload-Bytes: Tap sitzt + kumuliert > 1 MB (Chunks/Assets wurden hochgeladen).
    const up = out.up;
    const upMB = (up.upBytes || 0) / 1048576;
    band(
        up.tapDa && upMB > 1,
        "UPLOAD-BYTES (Konsum)",
        `Tap=${up.tapDa} · kumuliert=${upMB.toFixed(1)} MB · EwmaProFrame=${
            up.uploadBytesEwma != null ? (up.uploadBytesEwma / 1024).toFixed(1) + " KB" : "—"
        }`
    );

    // Band 5 — der Trace trägt alle vier Zähler (dieselbe Prüf-Funktion wie der Selbst-Test).
    const traceMaengel = pruefeTraceFelder(out.trace);
    band(
        traceMaengel.length === 0,
        "TRACE-FELDER (_flightRecorderBuildTrace)",
        traceMaengel.length === 0
            ? `longTasks=${JSON.stringify(out.trace.sessionLongTasks)} · gcN=${out.trace.memoryGcN} · pipelines=${JSON.stringify(
                  out.trace.steadyPipelines
              )} · uploadKBProS=${out.trace.steadyUploadKBProS}`
            : traceMaengel.join(" · ") + (out.traceWurf ? ` · Wurf: ${out.traceWurf}` : "")
    );

    // Band 6 — kein pageerror.
    band(pageErrors.length === 0, "KEIN PAGE-ERROR", pageErrors.length ? pageErrors.slice(0, 3).join(" | ") : "sauber");

    // SELBST-TEST — ein Fake-Trace OHNE die neuen Felder durch DIESELBE Prüf-
    // Funktion: sie MUSS rot melden (sonst wäre die Linse ein Existenz-Theater).
    const fake = { session: { seconds: 1 }, memory: { heapMB: 100 }, steadyState: { frameMsEwma: 16 } };
    const fakeMaengel = pruefeTraceFelder(fake);
    band(
        fakeMaengel.length >= 3,
        "SELBST-TEST (Fake-Trace ohne neue Felder MUSS rot)",
        `gemeldete Mängel=${fakeMaengel.length} (erwartet ≥3): ${fakeMaengel.join(" · ")}`
    );

    console.log(rot === 0 ? "\n✅ GRÜN — alle Hitch-Zähler werden KONSUMIERT." : `\n❌ ROT — ${rot} Band/Bänder gefallen.`);
    process.exit(rot === 0 ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {
        /* Abbau fail-soft */
    }
    process.exit(1);
});
