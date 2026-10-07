// diag-hitch-telemetrie.cjs — DIE HITCH-LINSE (das-feld-zeichnet §5.1): beweist
// KONSUM der vier Flugschreiber-Zähler (LongTasks · GC/Heap-Delta ·
// Pipeline-Compiles · Upload-Bytes), nie bloße Existenz (Lehre 5). Band 7
// (Welle K): DIE ERST-ZEICHNUNG — die erste Zeichnung eines neuen Stoffs in der
// Welt-Szene baut seine Knoten im Pass, je Render-Aufruf höchstens einen (weitere nur
// unter ERST_BAU_MS), und lässt seine Pipeline asynchron entstehen; kein Frame trägt
// eine synchrone Pipeline der Welt (die Hänger-Klasse: 1,4–4,2 s Warten an der
// Radeon, „GPU: Pipeline synchron (haupt tier:baer)"). Die Probe stellt drei neue
// Stoffe vor die Kamera (Konsum: alle drei zeichnen), der Gegen-Lauf derselben Probe
// auf dem Vendor-Weg MUSS rot sein (synchrone Pipeline, mehrere Bauten in einem
// Aufruf). Ein ECHTER WebGPU-Lauf (swiftshader-Vulkan, Software-Holz kienspan —
// KEIN Null-Renderer): der Boot SELBST ist der Konsum-Beweis (die Erst-Zeichnung
// baut und kompiliert, Chunk-Uploads erzeugen writeBuffer-Bytes, swiftshader
// erzeugt LongTasks).
//
//   node scripts/diag-hitch-telemetrie.cjs
//   Exit 0 = alle Bänder GRÜN (inkl. Selbst-Test: ein Fake-Trace ohne die neuen
//   Felder MUSS rot melden) · Exit 1 = mindestens ein Band ROT (mit Diagnose).
"use strict";
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
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
    // Welle K — die Erst-Zeichnung reist im selben Pipeline-Block (Bauten · verschoben · asynchron · offen).
    if (!pp || typeof pp.erstBauN !== "number" || typeof pp.erstPipeAsync !== "number" || typeof pp.erstVerschoben !== "number")
        maengel.push("steadyState.pipelines {erstBauN,erstVerschoben,erstPipeAsync} fehlt oder ist nicht numerisch");
    if (!trace.steadyState || typeof trace.steadyState.uploadKBProS !== "number")
        maengel.push("steadyState.uploadKBProS fehlt oder ist nicht numerisch");
    return maengel;
}

// DIE ERST-ZEICHNUNGS-WAND (Seite): Haken und Proben unter `window.__erstWand`; jede Probe ist ein eigener, benannter
// Aufruf aus Node (je unter der Protokoll-Frist — swiftshader kompiliert eine Pipeline in Sekunden).
function erstWandInstall() {
    const r = window.anazhRealm;
    const rend = r.state.renderer;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    // (4b) Welle K — DIE ERST-ZEICHNUNG: drei neue Stoffe vor die Kamera, einmal am EINEN Ort (die Nachbildung von
    // `_renderObjectDirect` am Renderer-Exemplar) und einmal auf dem Vendor-Weg (der Gegen-Lauf, MUSS rot sein). Gezählt
    // am Gerät (createRenderPipeline synchron · …Async) und am Knoten-Bau (Nodes.getForRender ohne Cache-Treffer) je
    // Render-Aufruf der Welt-Szene; ein Haken über renderObject trägt die Szene des laufenden Draws.
    const ESt = r._erstZeichnung || null;
    const res = { erst: null };
    res.erst = {
        daStamm: rend.__anazhErstZeichnung === true && Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect"),
        boot: ESt
            ? { bauN: ESt.bauN, bauMs: Math.round(ESt.bauMs), verschoben: ESt.verschoben, pipeAsync: ESt.pipeAsync }
            : null,
        budgetMs: r.constructor.ERST_BAU_MS,
    };
    const welt = r.state.scene;
    const Z = { cur: null, sync: 0, async: 0, bau: new Map() };
    const GP = GPUDevice.prototype;
    const crp = GP.createRenderPipeline,
        crpa = GP.createRenderPipelineAsync;
    GP.createRenderPipeline = function (d) {
        if (Z.cur === welt) Z.sync++;
        return crp.call(this, d);
    };
    GP.createRenderPipelineAsync = function (d) {
        if (Z.cur === welt) Z.async++;
        return crpa.call(this, d);
    };
    const roRoh = rend.renderObject;
    rend.renderObject = function (o, sc) {
        const vor = Z.cur;
        Z.cur = sc;
        try {
            return roRoh.apply(this, arguments);
        } finally {
            Z.cur = vor;
        }
    };
    const NB = rend._nodes,
        gfr = NB.getForRender;
    NB.getForRender = function (ro, asyncBau) {
        const kalt =
            !asyncBau &&
            this.get(ro).nodeBuilderState === undefined &&
            this.nodeBuilderCache.get(this.getForRenderCacheKey(ro)) === undefined;
        const t0 = performance.now();
        const aus = gfr.apply(this, arguments);
        if (kalt && Z.cur === welt) {
            const k = rend.info.calls;
            const b = Z.bau.get(k) || { n: 0, ms: 0, vorMs: [] };
            b.vorMs.push(b.ms);
            b.n++;
            b.ms += performance.now() - t0;
            Z.bau.set(k, b);
        }
        return aus;
    };
    const TSL = window.THREE.TSL;
    let serie = 0;
    // ein Bild wie im Loop: der Szenen-Pass rendert je Node-Frame (updateBefore FRAME) — ohne den Frame-Schritt der
    // Animations-Schleife zeichnete ein Hand-Aufruf nur das Post-Quad neu (wie gate:post-kette)
    const bild = () => {
        try {
            if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
            r._loopRender(performance.now() / 1000);
        } catch (_e) {
            /* die Linse misst, nie stören */
        }
    };
    // DIE BÜHNE der Proben: die Kamera sieht nur die Proben-Schicht (swiftshader rastert ein Welt-Bild in Sekunden — die
    // Probe misst die Erst-Zeichnung, nie die Welt); die Proben-Objekte liegen in der Welt-Szene, ihr Weg ist der der Welt.
    const SCHICHT = 31;
    const buehne = async (fn) => {
        const cam = r.state.camera;
        const maske = cam.layers.mask;
        cam.layers.set(SCHICHT);
        try {
            return await fn();
        } finally {
            cam.layers.mask = maske;
        }
    };
    // DIE RUHE vor jeder Probe (auf der Bühne): keine Pipeline der Welt ist mehr offen — sie kompiliert sonst neben der
    // Probe (höchstens 60 s).
    const ruhe = async () => {
        const t0 = performance.now();
        while (ESt && ESt.offen.size > 0 && performance.now() - t0 < 60000) {
            bild();
            await sleep(50);
        }
        return Math.round(performance.now() - t0);
    };
    const probe = (vendor) => buehne(() => probeAufDerBuehne(vendor));
    const probeAufDerBuehne = async (vendor) => {
        const ruheMs = await ruhe();
        Z.sync = Z.async = 0;
        Z.bau.clear();
        const eigen = Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect");
        const stamm = rend._renderObjectDirect;
        if (vendor && eigen) delete rend._renderObjectDirect;
        const cam = r.state.camera;
        const dir = new window.THREE.Vector3();
        cam.getWorldDirection(dir);
        const meshes = [];
        const gezeichnet = new Set();
        const drawRoh = rend.backend.draw;
        rend.backend.draw = function (ro) {
            if (ro && ro.object && ro.object.userData.__erstProbe) gezeichnet.add(ro.object);
            return drawRoh.apply(this, arguments);
        };
        for (let i = 0; i < 3; i++) {
            serie++;
            // ein Stoff mit einer eigenen Konstante: ein neues Programm, eine neue Pipeline (unbeleuchtet — swiftshader
            // kompiliert ihn in Sekunden; die Klasse ist dieselbe wie beim Tier, gemessen an der Radeon: haenger --erst)
            const m = new window.THREE.MeshBasicNodeMaterial();
            m.colorNode = TSL.vec3(0.2 + 0.0013 * serie, 0.45, 0.25 + 0.07 * i);
            const mesh = new window.THREE.Mesh(new window.THREE.BoxGeometry(0.6, 0.6, 0.6), m);
            mesh.position.copy(cam.position).addScaledVector(dir, 4);
            mesh.position.x += (i - 1) * 0.8;
            mesh.frustumCulled = false;
            mesh.userData.__erstProbe = true;
            mesh.layers.set(SCHICHT);
            welt.add(mesh);
            meshes.push(mesh);
        }
        let frames = 0;
        const t0 = performance.now();
        try {
            while (gezeichnet.size < meshes.length && performance.now() - t0 < 200000) {
                bild();
                frames++;
                await sleep(20);
            }
        } finally {
            rend.backend.draw = drawRoh;
            if (vendor && eigen) rend._renderObjectDirect = stamm;
            for (const m of meshes) {
                welt.remove(m);
                m.geometry.dispose();
            }
        }
        let maxBau = 0,
            ueberBudget = 0;
        for (const b of Z.bau.values()) {
            maxBau = Math.max(maxBau, b.n);
            for (let j = 1; j < b.vorMs.length; j++) if (b.vorMs[j] >= res.erst.budgetMs) ueberBudget++;
        }
        return {
            sync: Z.sync,
            async: Z.async,
            aufrufeMitBau: Z.bau.size,
            maxBau,
            ueberBudget,
            gezeichnet: gezeichnet.size,
            frames,
            ms: Math.round(performance.now() - t0),
            ruheMs,
        };
    };
    // DER NEUBAU: ein Würfel zeichnet (Erst-Weg), dann wechselt sein Stoff die Variante im selben Pass (ein Alpha-Test:
    // neuer Schlüssel, ein Programm mit Verwerfen — durchsichtig wechselte er in einen anderen Pass, das wäre eine erste
    // Zeichnung).
    // Das Objekt, das schon zu sehen war, zeichnet im NÄCHSTEN Bild (wie der Vendor, im Frame), es blinkt nie aus. Der
    // Gegen-Lauf vergisst, wo es schon zeichnete: dann wartet der Neubau auf seine Pipeline (Blinken).
    const neubau = (vergessen) => buehne(() => neubauAufDerBuehne(vergessen));
    const neubauAufDerBuehne = async (vergessen) => {
        await ruhe();
        serie++;
        const cam = r.state.camera;
        const dir = new window.THREE.Vector3();
        cam.getWorldDirection(dir);
        const m = new window.THREE.MeshBasicNodeMaterial();
        m.colorNode = TSL.vec3(0.6, 0.2 + 0.0017 * serie, 0.3);
        const mesh = new window.THREE.Mesh(new window.THREE.BoxGeometry(0.7, 0.7, 0.7), m);
        mesh.position.copy(cam.position).addScaledVector(dir, 3.5);
        mesh.frustumCulled = false;
        mesh.layers.set(SCHICHT);
        welt.add(mesh);
        let bilder = 0;
        const drawRoh = rend.backend.draw;
        rend.backend.draw = function (ro) {
            if (ro && ro.object === mesh) bilder++;
            return drawRoh.apply(this, arguments);
        };
        const n0 = ESt ? ESt.neubauN : 0;
        const gedaechtnis = ESt ? ESt.gezeichnet : null;
        let sofort = false;
        try {
            const t0 = performance.now();
            while (bilder === 0 && performance.now() - t0 < 200000) {
                bild();
                await sleep(20);
            }
            if (vergessen && ESt) ESt.gezeichnet = new WeakMap();
            m.alphaTest = 0.5;
            m.needsUpdate = true;
            bilder = 0;
            bild();
            sofort = bilder > 0;
        } finally {
            rend.backend.draw = drawRoh;
            if (ESt) ESt.gezeichnet = gedaechtnis;
            welt.remove(mesh);
            mesh.geometry.dispose();
        }
        return { sofort, neubauN: ESt ? ESt.neubauN - n0 : 0 };
    };
    window.__erstWand = {
        stand: () => res.erst,
        probe,
        neubau,
        zurueck: () => Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect"),
    };
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // Echtes WebGPU auf swiftshader — die Schalter je Plattform trägt das EINE Rezept (scripts/lib/software-gpu.cjs).
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    // KEIN Null-Renderer — die Zähler brauchen den echten WebGPU-Pfad (Tap + Pipelines).
    // Software-Holz (Lehre 26): auf „voll" kostet auf swiftshader ein Compile 50–70 s; die Linse prüft Zähler und Gesetz.
    await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });

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
    // Welle K — DIE ERST-ZEICHNUNG: Installation, Probe, Gegen-Lauf, Neubau, Neubau ohne Gedächtnis — je ein Aufruf
    if (out && !out.fatal) {
        const ruf = async (name, fn, arg) => {
            const t0 = Date.now();
            const v = await page.evaluate(fn, arg);
            console.log(`  [Erst-Zeichnung] ${name}: ${Math.round((Date.now() - t0) / 1000)} s`);
            return v;
        };
        await page.evaluate(`(${erstWandInstall.toString()})()`);
        out.erst = await ruf("Stand", () => window.__erstWand.stand());
        out.erst.probe = await ruf("Probe", (v) => window.__erstWand.probe(v), false);
        out.erst.gegen = await ruf("Gegen-Lauf", (v) => window.__erstWand.probe(v), true);
        out.erst.zurueck = await ruf("zurück", () => window.__erstWand.zurueck());
        out.erst.neubau = await ruf("Neubau", (v) => window.__erstWand.neubau(v), false);
        out.erst.neubauGegen = await ruf("Neubau ohne Gedächtnis", (v) => window.__erstWand.neubau(v), true);
    }

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

    // Band 7 — Welle K DIE ERST-ZEICHNUNG: der Boot trug seine ersten Zeichnungen über den EINEN Ort (Konsum), die Probe
    // (drei neue Stoffe) zeichnet ohne synchrone Pipeline der Welt und baut je Render-Aufruf nur unter dem Budget, der
    // Gegen-Lauf derselben Probe auf dem Vendor-Weg ist ROT (sonst wäre die Wand blind).
    const ez = out.erst || {};
    const eb = ez.boot || {};
    band(
        ez.daStamm === true && eb.bauN > 0 && eb.pipeAsync > 0,
        "ERST-ZEICHNUNG (Konsum im Boot)",
        `am Renderer=${ez.daStamm} · Knoten-Bauten im Pass ${eb.bauN} (Σ ${eb.bauMs} ms) · verschoben ${eb.verschoben} · Pipelines asynchron ${eb.pipeAsync}`
    );
    const pr = ez.probe || {};
    band(
        pr.gezeichnet === 3 && pr.sync === 0 && pr.async >= 3 && pr.ueberBudget === 0,
        "ERST-ZEICHNUNG (Probe: drei neue Stoffe — gezeichnet, 0 synchrone Pipelines der Welt, kein Bau über dem Budget)",
        `Ruhe davor ${pr.ruheMs} ms · gezeichnet ${pr.gezeichnet}/3 nach ${pr.frames} Frames (${pr.ms} ms) · synchron ${pr.sync} · asynchron ${pr.async} · ` +
            `Aufrufe mit Bau ${pr.aufrufeMitBau} · max ${pr.maxBau} Bauten je Aufruf · über dem Budget (${ez.budgetMs} ms) ${pr.ueberBudget}`
    );
    const gg = ez.gegen || {};
    band(
        gg.gezeichnet === 3 && gg.sync >= 1 && gg.maxBau >= 2 && ez.zurueck === true,
        "ERST-ZEICHNUNG Gegen-Lauf (der Vendor-Weg MUSS rot sein: synchrone Pipeline, alle Bauten in einem Aufruf)",
        `synchron ${gg.sync} · asynchron ${gg.async} · max ${gg.maxBau} Bauten je Aufruf · über dem Budget ${gg.ueberBudget} · ` +
            `gezeichnet ${gg.gezeichnet}/3 nach ${gg.frames} Frames · der EINE Ort danach zurück=${ez.zurueck}`
    );

    const nb = ez.neubau || {},
        nbg = ez.neubauGegen || {};
    band(
        nb.sofort === true && nb.neubauN >= 1 && nbg.sofort === false,
        "ERST-ZEICHNUNG Neubau (ein gezeichnetes Objekt wechselt die Variante: im nächsten Bild gezeichnet; vergessen MUSS es blinken)",
        `gezeichnet im nächsten Bild ${nb.sofort} · Neubauten ${nb.neubauN} · Gegen-Lauf ohne Gedächtnis gezeichnet ${nbg.sofort}`
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
