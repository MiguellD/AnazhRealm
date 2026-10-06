// diag-idle-gpu-churn.cjs — DIE STEHENDE LINSE gegen die V18.322-Fehlerklasse (Gesetz #0):
// „eine pro-Frame/periodisch neu kompilierte GPU-Pipeline im Steady-State". Der Bug, der 50+
// Versionen überlebte (scene.environment-Identitäts-Churn → Recompile-Cascade = der Idle-Freeze),
// war für das Gate STRUKTURELL unsichtbar: der Null-Renderer stubt den GPU-Pfad UND
// _ensureSkyEnvironment hat ein `if (_isHeadlessNull) return` VOR dem PMREM. Diese Linse läuft
// auf dem ECHTEN Renderer (swiftshader) und zählt `createRenderPipeline`/`linkProgram` (WebGPU
// bzw. WebGL2-Fallback) — beide hardware-unabhängig im MECHANISMUS (Dawn ruft es auch unter
// swiftshader). VERDIKT: nach Warmup darf weder reines Idle noch eine Env-Regenerierung eine
// einzige Pipeline NEU kompilieren. Schlägt das fehl → exit≠0 → die CI macht den Build ROT,
// bevor irgendwer den Freeze spürt. Die Struktur trägt die Disziplin, nicht das Gedächtnis.
//
// Lauf: node scripts/diag-idle-gpu-churn.cjs   (CI: npm run gpu-lens)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
// Port über IDLE_GPU_CHURN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4395.
const PORT = Number(process.env.IDLE_GPU_CHURN_PORT || 4395);
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
// generöse Schwelle: ein Recompile-CASCADE ist Dutzende+ (Sky-Env-Bug war ~270/Regen); ein paar
// Erst-Compile-Nachzügler im Idle-Fenster (eine neue Animations-/LOD-Variante) sind kein Churn.
// Gezählt werden WIEDERHOLUNGS-Compiles (derselbe Fingerabdruck ein zweites Mal); Erst-Compiles neuer Objekte
// einer streamenden Welt sind Nachzügler, kein Churn — über KASKADE fällt aber jedes Fenster rot, auch mit lauter
// neuen Quelltexten (eine Kaskade ist Dutzende+).
const IDLE_THRESHOLD = 8; // reines Idle (kein Env-Trigger) — sollte ~0 sein
const REGEN_THRESHOLD = 4; // Env-Regenerierung — MUSS ~0 sein (die scharfe Wand gegen V18.322)
const KASKADE = 40; // Gesamt-Compiles je Fenster, egal ob neu oder wiederholt
let laufenderRuf = "-"; // der benannte evaluate, der gerade läuft — ein Frist-Riss nennt ihn
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 }); // klein → schnelle Rasterung; Compile ist res-unabhängig
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; console.log("[PAGE-ERROR]", pageErr); });
    // DAS HOLZ DER LINSE (gemessen 03.10.): sie rastert auf der CPU (swiftshader) — für Software-Holz sieht die Welt
    // selbst „kienspan" vor (Ring 2, keine Schatten, kein Fern-Wasser; die Auto-Wahl erkennt es nur unter WebGPU, der
    // WebGL2-Rückfall fuhr „voll"). Auf „voll" kostete ein Szenen-Render 7–110 s und jeder schwere Erst-Compile 50–70 s:
    // die Linse lief 21–65 min. Ihr Gegenstand bleibt ganz: Wiederholungs-Compiles im Leerlauf und bei der Env-
    // Regenerierung (Hauptpass); Churn im Schattenpass sieht sie auf diesem Holz nicht.
    await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // JEDER AUFRUF HAT EINEN NAMEN (CI 37122984563: die Linse riss nach 860 s die Protokoll-Frist und sagte nicht, in
    // welchem Aufruf). `ruf` misst jeden evaluate, nennt jeden über LANG_MS beim Namen (mit seinen Compiles), und der
    // Crash-Pfad nennt den Aufruf, der die Frist riss.
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    const LANG_MS = 20000;
    let maxRuf = { ms: 0, name: "-" };
    const ruf = async (name, fn, ...args) => {
        laufenderRuf = name;
        const t0 = Date.now();
        const v = await page.evaluate(fn, ...args);
        const ms = Date.now() - t0;
        if (ms > maxRuf.ms) maxRuf = { ms, name: name + (v && v.label ? " · " + v.label : "") };
        if (ms > LANG_MS) log(`langer Aufruf: ${name} — ${Math.round(ms / 1000)} s${v && v.cc != null ? ` · ${v.cc} Compiles` : ""}${v && v.label ? ` · ${v.label}` : ""}`);
        laufenderRuf = "-";
        return v;
    };

    // SETTLE in kurzen Schritten (Node treibt, Node hält die Wand von 240 s): ein einziger evaluate mit der ganzen
    // Settle-Schleife lag mit seiner Wand dicht an der Protokoll-Frist. Gerendert wird gestubbt (Tempo).
    await ruf("Settle-Start", () => {
        window.__settle = { start: performance.now(), stubbed: false, lastSize: -1, stableFor: 0, done: false, sz: 0 };
    });
    for (;;) {
        const st = await ruf("Settle-Schritt", async () => {
            const S = window.__settle;
            const t0 = performance.now();
            while (!S.done && performance.now() - t0 < 4000) {
                const r = window.anazhRealm;
                if (r && !S.stubbed && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                    r.state.postProcessingFailed = true;
                    // P0 (Bühnen-Ordnung, 09.07.) — die Bühne für diese Linse VOR-latchen: sie misst
                    // Steady-State-Idle-Churn, nicht die Boot-Ordnung. Ohne Latch könnte das Bühnen-
                    // Prädikat mitten im 16-Frame-Mess-Fenster schließen → Fern-Deko (Planeten/Sterne)
                    // + Bake-Queue kompilierten neue Pipelines = falsches ❌ (Boot-Transient, kein Churn).
                    r.state._buehneStand = true;
                    S.stubbed = true;
                }
                if (r && r.state && r.state.rendererReady && typeof r._gameLoopTick === "function") {
                    try { r._gameLoopTick(performance.now()); } catch (_e) {}
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    S.sz = sz;
                    if (sz === S.lastSize) S.stableFor++; else { S.stableFor = 0; S.lastSize = sz; }
                    // RUHE heißt auch: die Foundry hat geliefert (keine offenen Worker-Aufträge, Ingest leer) — sonst
                    // streamen schwere Stoffe NACH dem Warmup herein, und jeder späte Erst-Compile kostet auf
                    // swiftshader 50–70 s in EINEM Aufruf (gemessen 03.10.: 4 späte Compiles = 286 s).
                    const f = r._foundry;
                    const foundryRuhig = !f || ((!f.pending || f.pending.size === 0) && !(r._foundryIngestQueue && r._foundryIngestQueue.length));
                    // die Chunk-Schwelle folgt dem Ring des Holzes (kienspan: Ring 2 = 25 Chunks; voll: Ring 4)
                    const ring = r.state.chunkRingRadius || 2;
                    const soll = Math.min(31, (2 * ring + 1) * (2 * ring + 1));
                    if (sz >= soll && S.stableFor > 30 && (foundryRuhig || performance.now() - S.start > 180000)) S.done = true;
                }
                await new Promise((res) => setTimeout(res, 6));
            }
            return { done: S.done, ms: performance.now() - S.start, sz: S.sz };
        });
        if (st.done || st.ms > 240000) { log(`Settle: ${st.sz} Chunks nach ${Math.round(st.ms / 1000)} s${st.done ? "" : " (Wand)"}`); break; }
    }
    await ruf("Settle-Drain", () => {
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });

    // PHASE 1 — Compiler auf Prototyp-Ebene wrappen + Warmup (alle Pipelines EINMAL kompilieren)
    const setup = await ruf("Setup", async () => {
        const r = window.anazhRealm, s = r.state;
        if (!s.rendererReady || !window.__origRender) return { err: "renderer nicht bereit" };
        if (s.renderer._isHeadlessNull) return { err: "Null-Renderer — die Linse braucht den ECHTEN Renderer (sonst blind, das ist der ganze Punkt)" };
        // WIEDERHOLUNG vs. ERST-COMPILE (Befund CI 36718459377): auf dem langsamen Runner erreichte der Warmup nie
        // Ruhe — die streamende Welt brachte neue Objekte, deren ERST-Compiles zählte Check B als Env-Churn (6 Stacks,
        // alle _renderObjectDirect). Die V18.322-Klasse ist ein WIEDERHOLTER Compile: dieselbe Pipeline (derselbe
        // Quelltext, derselbe Zustand) noch einmal, weil ein Cache-Schlüssel seine Identität verliert. Darum trägt
        // jeder Compile seinen Fingerabdruck; `wdh` zählt die schon gesehenen.
        window.__cc = { gpuPipeline: 0, glLink: 0, wdh: 0 };
        const gesehen = new Set();
        const zaehle = (fp) => {
            window.__ccLaenge = fp.length; // die Quelltext-Länge des letzten Programms — der Name des Schweren
            const wdh = gesehen.has(fp);
            if (wdh) window.__cc.wdh++; else gesehen.add(fp);
            if (window.__ccSpur) window.__ccSpur.push((wdh ? "[WDH] " : "[neu] ") + (new Error().stack || "").split("\n").slice(3, 10).join(" | "));
        };
        if (typeof GPUDevice !== "undefined" && GPUDevice.prototype) {
            const code = new WeakMap();
            const oM = GPUDevice.prototype.createShaderModule;
            if (typeof oM === "function") GPUDevice.prototype.createShaderModule = function (d) { const m = oM.call(this, d); try { code.set(m, (d && d.code) || ""); } catch (_e) {} return m; };
            for (const m of ["createRenderPipeline", "createRenderPipelineAsync"]) {
                const o = GPUDevice.prototype[m];
                if (typeof o === "function") GPUDevice.prototype[m] = function (d, ...rest) {
                    window.__cc.gpuPipeline++;
                    let fp = "?";
                    try { fp = JSON.stringify([code.get(d.vertex && d.vertex.module), d.vertex && d.vertex.entryPoint, code.get(d.fragment && d.fragment.module), d.fragment && d.fragment.entryPoint, d.fragment && d.fragment.targets, d.primitive, d.depthStencil, d.multisample, d.vertex && d.vertex.buffers]); } catch (_e) {}
                    zaehle(fp);
                    return o.call(this, d, ...rest);
                };
            }
        }
        if (typeof WebGL2RenderingContext !== "undefined" && WebGL2RenderingContext.prototype && WebGL2RenderingContext.prototype.linkProgram) {
            const o = WebGL2RenderingContext.prototype.linkProgram;
            WebGL2RenderingContext.prototype.linkProgram = function (prog) {
                window.__cc.glLink++;
                let fp = "?";
                try { fp = (this.getAttachedShaders(prog) || []).map((sh) => this.getShaderSource(sh)).join("\n----\n"); } catch (_e) {}
                zaehle(fp);
                return o.call(this, prog);
            };
        }
        let backend = "?";
        try { const b = s.renderer.backend; if (b) backend = b.isWebGPUBackend ? "WebGPU" : b.isWebGLBackend ? "WebGL2" : (b.constructor && b.constructor.name) || "?"; } catch (_e) {}
        s.renderer.render = window.__origRender;
        s.postProcessingFailed = true;
        // Der App-Loop RUHT: die Linse treibt ihre Frames selbst (sonst rendert er parallel mit und
        // verdoppelt die Compile-Last auf dem langsamen Runner).
        if (typeof s.renderer.setAnimationLoop === "function") s.renderer.setAnimationLoop(null);
        const cam = s.camera, pm = s.playerMesh;
        if (cam && pm) { cam.position.set(pm.position.x, pm.position.y + 1.6, pm.position.z); cam.lookAt(pm.position.x + 30, pm.position.y + 1, pm.position.z); cam.updateMatrixWorld(true); }
        try { r._ensureSkyEnvironment(true); } catch (_e) {}
        const cnt = () => window.__cc.gpuPipeline + window.__cc.glLink;
        window.__cnt = cnt;
        // DER SCHLÜSSEL-WARMUP (CI 37077860950 · 37122984563): auf swiftshader kostet EIN schwerer Erst-Compile
        // 50–90 s, und ein Aufruf trägt die Summe seiner neuen Programme — der erste volle Frame trug 265 (WebGL2),
        // eine 16er-Scheibe noch mehrere. Ein Programm folgt aus Objekt-Art · Stoff · Attribut-Satz; je Aufruf
        // rendert die Linse die Objekte EINES noch kalten Schlüssels allein (Hauptbild UND Kaskaden, derselbe
        // `_loopRender`) und hört nach dem ersten Schlüssel auf, der kompiliert hat (oder nach 8 s): kein Aufruf
        // trägt mehr als EINEN kompilierenden Schlüssel, gleich wie groß die Welt oder wie langsam das Holz ist.
        const schluessel = (o) => {
            const ms = Array.isArray(o.material) ? o.material : [o.material];
            const g = o.geometry;
            const at = g && g.attributes ? Object.keys(g.attributes).sort().join(",") : "";
            return [o.type, ms.map((m) => (m ? m.id : "-")).join(","), at, g && g.index ? 1 : 0].join("|");
        };
        const name = (o) => {
            const m = Array.isArray(o.material) ? o.material[0] : o.material;
            const pfad = [];
            for (let p = o; p && pfad.length < 3; p = p.parent) {
                const u = p.userData || {};
                const z = p.name || u.foundryKind || u.kind;
                if (z && pfad[pfad.length - 1] !== z) pfad.push(z);
            }
            return `${o.type}:${(m && (m.name || m.type)) || "?"}${pfad.length ? " in " + pfad.join(" < ") : ""}`;
        };
        const warm = new Set();
        window.__schwer = [];
        window.__warmSchritt = () => {
            const objs = [];
            s.scene.traverse((o) => { if ((o.isMesh || o.isPoints || o.isLine || o.isSprite) && o.visible) objs.push(o); });
            const kalt = new Map();
            for (const o of objs) {
                const k = schluessel(o);
                if (warm.has(k)) continue;
                if (!kalt.has(k)) kalt.set(k, []);
                kalt.get(k).push(o);
            }
            const t0 = performance.now(), c0 = cnt();
            let n = 0, label = "";
            for (const [k, liste] of kalt) {
                const an = new Set();
                for (const o of liste) for (let p = o; p; p = p.parent) an.add(p);
                const vorher = objs.map((o) => o.visible);
                for (const o of objs) o.visible = an.has(o);
                // die Kaskaden rendern nur auf Markierung (autoUpdate aus) — ungemarkt kompilierten die Schatten-
                // Programme erst im ersten vollen Frame (gemessen: 70 Compiles in EINEM Render, 122 s)
                r._schattenAlleNeu();
                const k0 = cnt(), z0 = performance.now();
                try { r._loopRender(performance.now()); } catch (_e) {}
                objs.forEach((o, i) => (o.visible = vorher[i]));
                warm.add(k);
                n++;
                if (cnt() > k0) {
                    label = `${name(liste[0])} ×${liste.length} · ${Math.round((window.__ccLaenge || 0) / 1024)} KB Quelltext`;
                    window.__schwer.push({ label, ms: performance.now() - z0, cc: cnt() - k0 });
                    break;
                }
                if (performance.now() - t0 > 8000) break;
            }
            return { rest: kalt.size - n, n, cc: cnt() - c0, label };
        };
        // DER TAKT RENDERT NICHT: `_gameLoopTick` ist der ganze Spiel-Loop und ruft `_loopRender` selbst (gemessen
        // 03.10.: jeder Takt-Compile kam aus `loop → _loopRender` — die Erst-Compiles hereinstreamender Objekte, VOR
        // jedem Warmup, bis 437 s in EINEM Aufruf; und jeder Linsen-Frame renderte doppelt). Die Linse legt den
        // Render für die Dauer des Takts still; gerendert wird erst, wenn der Schlüssel-Warmup die Neuen kennt.
        window.__takt = () => {
            const c0 = cnt();
            const eigen = Object.prototype.hasOwnProperty.call(r, "_loopRender");
            const echt = r._loopRender;
            r._loopRender = function () {};
            try { r._gameLoopTick(performance.now()); } catch (_e) {} finally { if (eigen) r._loopRender = echt; else delete r._loopRender; }
            return { cc: cnt() - c0 };
        };
        window.__bild = () => { const c0 = cnt(); try { r._loopRender(performance.now()); } catch (_e) {} return { tot: cnt(), cc: cnt() - c0 }; };
        return { backend };
    });
    // Warmup: erst die kalten Schlüssel (je Aufruf höchstens einer, der kompiliert), dann Frames — JE FRAME ein
    // Takt-Aufruf, der Schlüssel-Warmup für alles, was der Takt hereinstreamte, und ein Bild-Aufruf (Node treibt,
    // Node hält die Frist; CI 36681658740). 10 Pflicht-Frames, dann DER DAUERZUSTAND: weiter, bis 8 Frames in Folge
    // NICHTS kompilieren (höchstens 80, Wand 240 s) — Erst-Compile-Nachzügler landen im Warmup, echter Churn
    // kompiliert JEDEN Frame und fällt im Idle-Fenster rot.
    const warmNeu = async (wo) => {
        let schritte = 0;
        for (;;) {
            const w = await ruf(`Schlüssel-Warmup (${wo})`, () => window.__warmSchritt());
            schritte++;
            if (w.rest === 0) return schritte;
        }
    };
    const frame = async (wo) => {
        await ruf(`Takt (${wo})`, () => window.__takt());
        await warmNeu(wo);
        return (await ruf(`Bild (${wo})`, () => window.__bild())).tot;
    };
    if (!setup.err) {
        setup.scheiben = await warmNeu("Warmup");
        log(`Schlüssel-Warmup: ${setup.scheiben} Aufrufe`);
        for (let i = 0; i < 10; i++) await frame(`Warmup-Frame ${i}`);
        const nachStart = await ruf("Zähler", () => window.__cnt());
        let ruhig = 0,
            extra = 0,
            stand = nachStart;
        const t0 = Date.now();
        while (ruhig < 8 && extra < 80 && Date.now() - t0 < 240000) {
            const v = await frame(`Ruhe-Frame ${extra}`);
            extra++;
            ruhig = v === stand ? ruhig + 1 : 0;
            stand = v;
        }
        Object.assign(setup, { warmupCompiles: stand, nachzuegler: stand - nachStart, warmupExtra: extra, ruhe: ruhig >= 8 });
        setup.schwer = await ruf("Schwer-Liste", () => window.__schwer.sort((a, b) => b.ms - a.ms).slice(0, 5).map((z) => `${z.label} ${Math.round(z.ms / 1000)} s/${z.cc}`));
    }
    if (setup.err) { await browser.close(); server.close(); console.error("⛔ LINSE NICHT LAUFFÄHIG:", setup.err); process.exit(1); }
    if (setup.warmupCompiles === 0) { await browser.close(); server.close(); console.error("⛔ LINSE UNGÜLTIG: 0 Warmup-Compiles → der Zähler greift nicht (kein Compiler gewrappt) → die Linse wäre blind grün."); process.exit(1); }

    // CHECK A — REINES IDLE: nach Warmup N Idle-Frames; KEINE Pipeline darf neu kompilieren. Je Frame kurze,
    // benannte Aufrufe (dieselbe Klasse wie der Warmup-Bruch CI 36681658740: 16 Frames in einem evaluate sprengen
    // auf langsamem Holz die Protokoll-Frist). Der Schlüssel-Warmup im Frame zählt mit: ein Wiederholungs-Compile
    // dort ist derselbe Churn (ein Stoff verlor seine Identität).
    const stand = () => ruf("Zähler", () => ({ tot: window.__cnt(), wdh: window.__cc.wdh }));
    const a0 = await stand();
    for (let i = 0; i < 16; i++) await frame(`Idle-Frame ${i}`);
    const a1 = await stand();
    const idle = { gesamt: a1.tot - a0.tot, wdh: a1.wdh - a0.wdh };

    // CHECK B — ENV-REGENERIERUNG (die scharfe V18.322-Wand): die Himmelsfarbe wechselt (wie die
    // Tag-Nacht-Uhr es im Stehen tut) → die Env regeneriert. Eine KORREKTE Implementierung nutzt
    // das Target wieder (stabile Identität → 0 Recompiles); der alte Churn rekompilierte ~270/Regen.
    // SELBSTTEST (--selbsttest-churn): die V18.322-Klasse künstlich zurück — jede Regenerierung eine NEUE
    // Env-Identität. Die Linse MUSS dann rot werden (sonst wäre sie blind).
    if (process.argv.includes("--selbsttest-churn")) await ruf("Selbsttest-Schalter", () => (window.__selbsttestChurn = true));
    const regen = { gesamt: 0, wdh: 0, spur: [] };
    const hatUni = await ruf("Env-Probe", () => { const u = window.anazhRealm.state.skyboxUniforms; window.__ccSpur = []; return !!(u && u.nebulaColor); });
    if (!hatUni) regen.err = "keine skyboxUniforms.nebulaColor";
    else {
        const b0 = await stand();
        for (const c of [[0.85, 0.55, 0.30], [0.55, 0.75, 0.95], [0.30, 0.10, 0.15], [0.70, 0.80, 0.70]]) {
            await ruf(`Env-Regenerierung ${c.join(",")}`, (c) => {
                const r = window.anazhRealm, s = r.state;
                s.skyboxUniforms.nebulaColor.value.setRGB(c[0], c[1], c[2]);
                s._skyEnvLastRegenMs = -1e9; // die Raten-Drossel umgehen → echte Regenerierung erzwingen
                try { r._ensureSkyEnvironment(true); } catch (_e) {}
                if (window.__selbsttestChurn && s.scene && s.scene.environment) s.scene.environment = s.scene.environment.clone();
                try { r._loopRender(performance.now()); } catch (_e) {}
            }, c);
        }
        const b1 = await stand();
        Object.assign(regen, { gesamt: b1.tot - b0.tot, wdh: b1.wdh - b0.wdh });
        regen.spur = await ruf("Env-Spur", () => { const sp = window.__ccSpur.slice(0, 8); window.__ccSpur = null; return sp; });
    }
    setup.maxRuf = maxRuf;

    await browser.close();
    server.close();
    console.log("===== STEHENDE LINSE — Idle/Env-GPU-Pipeline-Churn (echter Renderer) =====\n");
    if (pageErr) { console.error("⛔ Page-Error während des Laufs:", pageErr); process.exit(1); }
    if (regen.err) { console.error("⛔ LINSE NICHT LAUFFÄHIG:", regen.err); process.exit(1); }
    if (regen.spur && regen.spur.length) {
        console.log("  Compiles im Env-Fenster (Aufrufer):");
        for (const z of regen.spur) console.log("    · " + z.replace(/https?:\/\/127\.0\.0\.1:\d+\//g, "").slice(0, 400));
    }
    console.log(`  Backend: ${setup.backend}  ·  Schlüssel-Warmup: ${setup.scheiben} Aufrufe  ·  längster Aufruf ${Math.round(setup.maxRuf.ms / 1000)} s (Frist 300 s): ${setup.maxRuf.name}  ·  Warmup-Compiles (einmalig): ${setup.warmupCompiles}  ·  davon Nachzügler bis zur Ruhe: ${setup.nachzuegler} in ${setup.warmupExtra} Extra-Frames${setup.ruhe ? "" : " (RUHE NIE ERREICHT)"}`);
    console.log(`  Schwerste Erst-Compiles (Schlüssel · Zeit/Programme): ${(setup.schwer || []).join(" · ") || "—"}\n`);
    const idleOk = idle.wdh <= IDLE_THRESHOLD && idle.gesamt <= KASKADE;
    const regenOk = regen.wdh <= REGEN_THRESHOLD && regen.gesamt <= KASKADE;
    console.log(`  CHECK A — reines Idle (16 Frames):      ${idle.wdh} Wiederholungs-Compiles (Schwelle ≤${IDLE_THRESHOLD}) · ${idle.gesamt - idle.wdh} Erst-Compiles (gesamt ≤${KASKADE})  ${idleOk ? "✅" : "❌ CHURN"}`);
    console.log(`  CHECK B — Env-Regenerierung (4 Farben): ${regen.wdh} Wiederholungs-Compiles (Schwelle ≤${REGEN_THRESHOLD}) · ${regen.gesamt - regen.wdh} Erst-Compiles (gesamt ≤${KASKADE})  ${regenOk ? "✅" : "❌ RECOMPILE-CASCADE (die V18.322-Klasse!)"}`);
    console.log("");
    if (idleOk && regenOk) {
        console.log("✅ KEINE Steady-State-Pipeline-Rekompilierung — der periodische Idle-Freeze KANN nicht zurückkehren,");
        console.log("   ohne diese Linse rot zu machen. (Die Struktur trägt die Disziplin, nicht das Gedächtnis.)");
        process.exit(0);
    }
    console.log("⛔ GPU-PIPELINE-CHURN IM STEADY-STATE — eine Operation kompiliert pro Frame/Regen neu.");
    console.log("   Das ist die V18.322-Fehlerklasse (ein per-Drift wechselndes scene.environment ODER eine andere");
    console.log("   pro-Frame neu allokierte Render-Ressource). Heile sie identitäts-stabil + rate-gedeckelt,");
    console.log("   NICHT durch Wegdrosseln des Symptoms. (CLAUDE.md: Rendering · scene.environment IDENTITÄTS-STABIL.)");
    process.exit(2);
})().catch((e) => { console.error(`⛔ Crash im Aufruf „${laufenderRuf}":`, e); process.exit(1); });
