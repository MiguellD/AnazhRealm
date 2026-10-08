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
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
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
    // DER TÄTER BEIM NAMEN (CI 37588394666: „Takt (Idle-Frame 13)" riss die Frist von 300 s und nannte nur den Aufruf):
    // jeder Compile außerhalb des Schlüssel-Warmups meldet sich mit Programm-Größe und Aufrufer, BEVOR er kompiliert — die
    // Konsole erreicht Node auch, wenn der Aufruf danach die Frist reißt. Der Schlüssel-Warmup nennt seine Schlüssel selbst.
    page.on("console", (m) => { const t = m.text(); if (t.startsWith("[Linse]")) console.log(`  ${t.slice(0, 600)} — im Aufruf „${laufenderRuf}"`); });
    // DAS HOLZ DER LINSE (gemessen 03.10.): sie rastert auf der CPU (swiftshader) — für Software-Holz sieht die Welt
    // selbst „kienspan" vor (Ring 2, keine Schatten, kein Fern-Wasser; die Auto-Wahl erkennt es nur unter WebGPU, der
    // WebGL2-Rückfall fuhr „voll"). Auf „voll" kostete ein Szenen-Render 7–110 s und jeder schwere Erst-Compile 50–70 s:
    // die Linse lief 21–65 min. Ihr Gegenstand bleibt ganz: Wiederholungs-Compiles im Leerlauf und bei der Env-
    // Regenerierung (Hauptpass); Churn im Schattenpass sieht sie auf diesem Holz nicht.
    // DIE BÜHNE DER LINSE (Lehre 17; Mess-Lehre der Welle L): die Welt der Messung wächst nicht nach der Wand-Uhr. Bis zur
    // Gegenprüfung 07.10. (Runde 3) zog das Wetter nach 120 s Spielzeit weiter, und das Start-Dorf wuchs, sobald ein Frame
    // Luft hatte, mitten in den Warmup: auf dem langsamen Runner kam die Linse über die 120-s-Marke (der erste Erst-Compile
    // 26-30 s statt 3 s), der Wetter-Takt hing 282 s, der Regen kompilierte 42 s, der Sternen-Himmel 71 s — 427-554 s je
    // Lauf statt 75 s, zwei von drei Läufen rissen die Protokoll-Frist. Gemessen wird der Leerlauf EINER Welt: das Start-Dorf
    // steht vor dem Warmup (der Settle wartet auf es), Mittag, Sonne, die Saison fest, der Wetter-Zug hält; die Bühnen-Wand
    // am Ende nennt jede Drift beim Namen. Das Wetter hält die EINE Wetter-Wache der Bühne (scripts/lib/ausgabe-aufnahme.cjs:
    // die Uhr des Auto-Zugs eingefroren unter 0, `_setWeather` verweigert dann JEDEN Zug — Auto-Zug, Emotion, Nexus, Gesetz,
    // Mitspieler); bis zur Welle K hielt die Linse eine eigene Uhr (je Takt auf 0), an der jeder andere Schreiber vorbeikam.
    // Ihr Spion nennt den Schreiber einer Drift beim Namen.
    const SELBSTTEST_BUEHNE = process.argv.includes("--selbsttest-buehne");
    const SELBSTTEST_RUHE = process.argv.includes("--selbsttest-ruhe");
    // SELBSTTEST der Programm-Wache: mitten im Warmup läuft ein Programm, das ein Dorf baut — die Wache MUSS es anhalten
    // (die Bühne hält, die Wache nennt es), sonst ist sie vakuös.
    const SELBSTTEST_PROGRAMM = process.argv.includes("--selbsttest-programm");
    await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(AUSGABE_INSTALL);

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
                    r.state.autoSeason = false; // die Saison hält (Bühne)
                    window.__wetterHalten(); // das Wetter hält (die EINE Wetter-Wache)
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
                    // und das Start-Dorf steht (gewachsen oder kein Fleck) — es wächst nie in den Warmup hinein
                    const wm = r.state.worldMeta || {};
                    const dorfSteht =
                        !!r._autoSettlementStartHopeless ||
                        (!!(wm.settlementCells && wm.settlementCells.start) && !r._autoSettlementQueue && !r._autoSettlementPendingKey);
                    S.dorf = dorfSteht;
                    if (sz >= soll && S.stableFor > 30 && ((foundryRuhig && dorfSteht) || performance.now() - S.start > 180000)) S.done = true;
                }
                await new Promise((res) => setTimeout(res, 6));
            }
            return { done: S.done, ms: performance.now() - S.start, sz: S.sz, dorf: S.dorf };
        });
        if (st.done || st.ms > 240000) { log(`Settle: ${st.sz} Chunks nach ${Math.round(st.ms / 1000)} s, Start-Dorf ${st.dorf ? "steht" : "wächst noch"}${st.done ? "" : " (Wand)"}`); break; }
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
            if (!window.__imWarm) {
                // der Aufrufer im Stamm (die Vendor-Rahmen sind minifiziert): der erste Vendor-Rahmen und die ersten Stamm-Rahmen
                const lim = Error.stackTraceLimit;
                Error.stackTraceLimit = 40;
                const z = (new Error().stack || "").split("\n").slice(3).map((x) => x.trim().replace(/^at /, "").replace(/ \(.*/, ""));
                Error.stackTraceLimit = lim;
                const stamm = z.filter((x) => /AnazhRealm\.|anazhRealm\.js/.test(x)).slice(0, 4);
                // und das OBJEKT, dessen Zeichnung kompiliert (der Haken an renderObject unten): Art · Stoff · Pfad
                const ob = window.__ccObjekt;
                let lichter = 0;
                try { window.anazhRealm.state.scene.traverseVisible((o) => { if (o.isLight) lichter++; }); } catch (_e) {}
                const wer = ob ? ` · Objekt ${window.__ccName ? window.__ccName(ob) : ob.type} · sichtbare Lichter ${lichter}` : "";
                console.log("[Linse] Compile außerhalb des Schlüssel-Warmups (" + (wdh ? "Wiederholung" : "neu") + ", " + Math.round(fp.length / 1024) + " KB): " + [z[0]].concat(stamm.length ? stamm : z.slice(1, 6)).join(" < ") + wer);
            }
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
        // die Bühne: Mittag, Sonne, ohne Übergang — VOR dem Warmup (die Umgebung malt sich gleich danach aus diesem Himmel).
        // Die Sonne setzt der Halter selbst (`__wetterSetzen`: der eine Zug, den der Halt durchlässt, danach hält die Uhr).
        window.__wetterSetzen("sunny");
        s.timeOfDay = 0.5;
        if (s.world) s.world.timeOfDay = 0.5;
        window.__buehneStand = () => ({ wetter: s.weather, uebergang: !!s.weatherTransition, saison: s.season, zeit: s.timeOfDay, bauten: (s.architectures || []).length });
        window.__buehne0 = window.__buehneStand();
        window.__wetterSeq0 = window.__wetterBuch(0).seq;
        // DAS BAU-BUCH (CI 37643706020: „Bauten 147 → 146" ohne Täter): die beiden Schreiber der Bau-Menge (`spawnArchitecture`
        // legt an, `removeArchitecture` nimmt weg; `state.architectures` schreibt sonst nur das Laden) buchen ab der Bühne
        // je Wirkung Art, Typ und die Spiel-Rahmen des Stapels — eine Drift der Bauten trägt ihren Täter beim Namen.
        window.__bauBuch = [];
        const werBau = () => {
            const zeilen = String(new Error().stack || "").split("\n");
            const namen = [];
            for (const l of zeilen) {
                if (!/anazhRealm\.js/.test(l)) continue;
                const m = /at (?:async )?(?:new )?([^\s(]+) \(/.exec(l);
                namen.push(m ? m[1].replace(/^(AnazhRealm|Object)\./, "") : "(anonym)");
            }
            return namen.slice(0, 6).join(" ← ") || "Sonde (kein Spiel-Rahmen)";
        };
        for (const [weg, art] of [["spawnArchitecture", "an"], ["removeArchitecture", "weg"]]) {
            const roh = r[weg];
            r[weg] = function (...a) {
                const n0 = (s.architectures || []).length;
                const v = roh.apply(this, a);
                const n1 = (s.architectures || []).length;
                if (n1 !== n0 && window.__bauBuch.length < 20) {
                    const e = art === "an" ? v : a[0];
                    window.__bauBuch.push(`${art} ${(e && e.type) || "?"} durch ${werBau()}`);
                }
                return v;
            };
        }
        // DIE PROGRAMM-WACHE (CI 37705797642: „Bauten 149 → 156 an haus_griechisch durch visit ← spawn_fractal ← dslEval ←
        // random ← dslEval ← chain"): die Welt schreibt sich selbst — Nexus, stehende Regeln, Emotionen, Fähigkeiten — und
        // jeder Weg geht durch die EINE Auswertung `dslEval`. Unter der Bühne (die eingefrorene Uhr des Wetter-Zugs,
        // `__wetterSetzen`) hält das Spiel dort jeden Welt-Akt selbst (`_messHalt`, 0710-7) — der Welt-Akt-Spion bucht Quelle und
        // Op jedes gehaltenen und jedes, der trotzdem durchging; die Bühnen-Wand nennt beide. Bis 08.10. überschrieb die Linse
        // `dslEval` selbst (ein Zwilling des Halts, der jedes Programm schluckte).
        window.__weltaktSpion();
        window.__weltaktSeq0 = window.__weltaktBuch(0).seq;
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
        // DAS OBJEKT JEDES COMPILES beim Namen: der Haken an renderObject trägt das Objekt der laufenden Zeichnung
        window.__ccName = name;
        const roRoh = s.renderer.renderObject;
        s.renderer.renderObject = function (o) {
            const vor = window.__ccObjekt;
            window.__ccObjekt = o;
            try { return roRoh.apply(this, arguments); } finally { window.__ccObjekt = vor; }
        };
        // DIE ERST-ZEICHNUNG (Welle K, `_configureRenderer`) baut je Render-Aufruf höchstens EINEN Stoff (die übrigen
        // verschiebt sie in den nächsten Aufruf) und zeichnet ein Objekt ab dem Bild, in dem seine Pipeline steht. Ein
        // Schlüssel, dessen eines Bild noch verschob oder auf eine Pipeline wartete, ist nicht warm: seine verschobenen
        // Bauten kompilierten sonst im Leerlauf — gemessen am Zweig welle-k-haenger in 3 von 3 CI-Läufen (a20e1444,
        // 0febe3ef, 7a41911b): „Bild (Idle-Frame 1)" über die Frist von 300 s, ein Erst-Compile außerhalb des Warmups.
        // Er bleibt kalt und rendert im nächsten Schritt wieder allein (je Aufruf weiter höchstens EIN kompilierender
        // Schlüssel); ein Schlüssel, der nach WARM_VERSUCHE Bildern noch nicht zeichnet, steht beim Namen im Urteil.
        const E = r._erstZeichnung || null;
        const WARM_VERSUCHE = 40;
        const versuche = new Map();
        window.__nieWarm = [];
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
                const v0 = E ? E.verschoben : 0,
                    w0 = E ? E.wartetN : 0;
                window.__imWarm = true;
                try { r._loopRender(performance.now()); } catch (_e) {} finally { window.__imWarm = false; }
                let lichter = 0;
                s.scene.traverseVisible((o) => { if (o.isLight) lichter++; });
                objs.forEach((o, i) => (o.visible = vorher[i]));
                const v = (versuche.get(k) || 0) + 1;
                versuche.set(k, v);
                const unruhig = !!E && (E.verschoben !== v0 || E.wartetN !== w0);
                if (!unruhig) warm.add(k);
                else if (v >= WARM_VERSUCHE) {
                    warm.add(k);
                    window.__nieWarm.push(`${name(liste[0])} ×${liste.length} (nach ${v} Bildern: verschoben ${E.verschoben - v0}, wartend ${E.wartetN - w0})`);
                }
                n++;
                if (cnt() > k0) {
                    label = `${name(liste[0])} ×${liste.length} · ${Math.round((window.__ccLaenge || 0) / 1024)} KB Quelltext · Lichter ${lichter}`;
                    window.__schwer.push({ label, ms: performance.now() - z0, cc: cnt() - k0 });
                    break;
                }
                if (performance.now() - t0 > 8000) break;
            }
            let rest = 0;
            for (const k of kalt.keys()) if (!warm.has(k)) rest++;
            return { rest, n, cc: cnt() - c0, label };
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
            if (!window.__buehneLos) {
                window.__wetterHalten(); // das Wetter hält (die EINE Wetter-Wache)
                s.timeOfDay = window.__buehne0.zeit; // Mittag hält (ein Takt rückt die Uhr bis 1 s vor)
            }
            try { r._gameLoopTick(performance.now()); } catch (_e) {} finally { if (eigen) r._loopRender = echt; else delete r._loopRender; }
            return { cc: cnt() - c0 };
        };
        // je Bild auch der Stand der Erst-Zeichnung (Bauten · verschoben · wartende Draws · offene Pipelines): die Ruhe vor dem
        // Leerlauf verlangt, dass sie still steht — nichts baut, nichts verschiebt, kein Draw wartet
        window.__bild = () => {
            const c0 = cnt();
            try { r._loopRender(performance.now()); } catch (_e) {}
            const E = r._erstZeichnung;
            // der wartende Draw beim Namen: das Label seiner Pipeline (WebGPU, `_erstWartet`) oder der Stoff ihres Programms
            const p = E ? E.wartetAuf : null;
            const wartet = p ? (E.namen && E.namen.get(p)) || `${(p.fragmentProgram && p.fragmentProgram.name) || "(Stoff ohne Namen)"}#${p.fragmentProgram ? p.fragmentProgram.id : "?"}` : null;
            // SELBSTTEST (--selbsttest-ruhe): eine Erst-Zeichnung, die je Bild einen Bau verschiebt — die Ruhe kommt nie
            const stoer = window.__selbsttestRuhe ? `|verschoben+${(window.__ruheStoer = (window.__ruheStoer || 0) + 1)}` : "";
            return { tot: cnt(), cc: cnt() - c0, erst: E ? `${E.bauN}|${E.verschoben}|${E.wartetN}${stoer}` : stoer, offen: E ? E.offen.size : 0, wartet };
        };
        return { backend };
    });
    // Warmup: erst die kalten Schlüssel (je Aufruf höchstens einer, der kompiliert), dann Frames — JE FRAME ein
    // Takt-Aufruf, der Schlüssel-Warmup für alles, was der Takt hereinstreamte, und ein Bild-Aufruf (Node treibt,
    // Node hält die Frist; CI 36681658740). 10 Pflicht-Frames, dann DER DAUERZUSTAND: weiter, bis 8 Frames in Folge
    // NICHTS kompilieren (höchstens 80, Wand 240 s) — Erst-Compile-Nachzügler landen im Warmup, echter Churn
    // kompiliert JEDEN Frame und fällt im Idle-Fenster rot.
    // DIE ERST-ZEICHNUNG (Welle K, `_configureRenderer`): eine erste Zeichnung kompiliert ihre Pipeline ASYNCHRON — der
    // Compile läuft im GPU-Prozess weiter, und der nächste Aufruf, der präsentiert, trüge alle offenen zusammen (CI auf
    // c307587b: 21 Warmup-Aufrufe in 11 s, dann „Bild (Ruhe-Frame 1)" über 300 s). Nach jedem kompilierenden Aufruf wartet
    // Node in kurzen Abfragen (reines JS, kein GPU-Ruf), bis keine Pipeline mehr offen ist: jeder Aufruf trägt weiter
    // höchstens die Compiles seines EINEN Schlüssels.
    const abwarten = async (wo) => {
        const t0 = Date.now();
        laufenderRuf = `Pipelines abwarten (${wo})`;
        for (;;) {
            const offen = await page.evaluate(() => {
                const E = window.anazhRealm._erstZeichnung;
                return E ? E.offen.size : 0;
            });
            if (offen === 0) break;
            if (Date.now() - t0 > 600000) {
                log(`nach 600 s noch ${offen} Pipelines offen (${wo})`);
                break;
            }
            await new Promise((res) => setTimeout(res, 500));
        }
        const ms = Date.now() - t0;
        if (ms > LANG_MS) log(`Pipelines abgewartet (${wo}): ${Math.round(ms / 1000)} s`);
        laufenderRuf = "-";
    };
    const warmNeu = async (wo) => {
        let schritte = 0;
        for (;;) {
            const w = await ruf(`Schlüssel-Warmup (${wo})`, () => window.__warmSchritt());
            schritte++;
            if (w.cc > 0) await abwarten(`Schlüssel-Warmup (${wo})`);
            if (w.rest === 0) return schritte;
        }
    };
    const frame = async (wo) => {
        await ruf(`Takt (${wo})`, () => window.__takt());
        await warmNeu(wo);
        const b = await ruf(`Bild (${wo})`, () => window.__bild());
        if (b.cc > 0) await abwarten(`Bild (${wo})`);
        return b;
    };
    // DAS BAU-BUDGET DER ERST-ZEICHNUNG IM WARMUP: im Spiel baut sie je Render-Aufruf einen Stoff (AnazhRealm.ERST_BAU_MS)
    // und verschiebt den Rest — ein Bundle mit N ungebauten Bürgern nimmt N-mal neu auf. Im Warmup der Linse tropften so die
    // Bauten, die der Schlüssel-Warmup nicht deckt (bauSatz, creature, dorf-rauch — auf dem Vendor-Weg ebenso Nachzügler),
    // über viele Bilder, und jeder späte Compile bezahlte den aufgestauten swiftshader-Rückstand aller Bilder davor (lokal
    // 37-245 s je Aufruf, CI 37674425050 636 s Lauf und eine Bühnen-Drift; derselbe Code auf dem Vendor-Weg: alle Nachzügler
    // in Warmup-Frame 0/1, längster Aufruf 9 s). Der Warmup baut darum ohne Budget (alles im ersten vollen Bild, wie der
    // Vendor); vor der Ruhe gilt wieder das Budget des Spiels — Ruhe und Leerlauf messen das Spiel.
    if (!setup.err) await ruf("Erst-Budget aus (Warmup)", () => { const C = window.anazhRealm.constructor; window.__erstBudget = C.ERST_BAU_MS; C.ERST_BAU_MS = Infinity; });
    if (!setup.err) {
        setup.scheiben = await warmNeu("Warmup");
        log(`Schlüssel-Warmup: ${setup.scheiben} Aufrufe`);
        for (let i = 0; i < 10; i++) {
            // SELBSTTEST: die Uhr der Welt läuft frei und der Wetter-Zug wird fällig — die Bühnen-Wand MUSS rot werden
            if (SELBSTTEST_BUEHNE && i === 5) await ruf("Selbsttest-Bühne", () => { window.__buehneLos = true; window.anazhRealm.state.weatherEffectTime = 1e6; });
            if (SELBSTTEST_PROGRAMM && i === 5) await ruf("Selbsttest-Programm", () => { window.anazhRealm.dslRun(["spawn_village", ["near_player"]], { source: "selbsttest" }); });
            await frame(`Warmup-Frame ${i}`);
        }
        await ruf("Erst-Budget zurück", () => { window.anazhRealm.constructor.ERST_BAU_MS = window.__erstBudget; });
        const nachStart = await ruf("Zähler", () => window.__cnt());
        // DIE RUHE vor dem Leerlauf: 8 Bilder in Folge ohne Compile UND ohne Arbeit der Erst-Zeichnung (sie baut je Render-
        // Aufruf einen Stoff und verschiebt den Rest; ein Bild ohne Compile kann ihr noch verschobene Bauten lassen, die erst
        // im Leerlauf kompilierten). Was danach noch kompiliert, ist echter Leerlauf-Churn und steht beim Namen.
        let ruhig = 0,
            extra = 0,
            stand = nachStart,
            erstStand = "",
            letztes = null;
        if (SELBSTTEST_RUHE) await ruf("Selbsttest-Ruhe", () => (window.__selbsttestRuhe = true));
        const t0 = Date.now();
        while (ruhig < 8 && extra < 80 && Date.now() - t0 < 240000) {
            const b = await frame(`Ruhe-Frame ${extra}`);
            extra++;
            ruhig = b.tot === stand && b.erst === erstStand && b.offen === 0 ? ruhig + 1 : 0;
            if (ruhig === 0) letztes = { b, vorTot: stand, vorErst: erstStand };
            stand = b.tot;
            erstStand = b.erst;
        }
        Object.assign(setup, { warmupCompiles: stand, nachzuegler: stand - nachStart, warmupExtra: extra, ruhe: ruhig >= 8 });
        // DIE VERFEHLTE RUHE beim Namen (Gegenprüfung K haenger): was das letzte unruhige Bild bewegte — Compiles, der Stand
        // der Erst-Zeichnung (gebaut|verschoben|wartend, offene Pipelines) und der wartende Draw
        if (!setup.ruhe && letztes) {
            const { b, vorTot, vorErst } = letztes;
            setup.ruheBefund =
                `nach ${extra} Bildern in ${Math.round((Date.now() - t0) / 1000)} s: im letzten unruhigen Bild ${b.tot - vorTot} Compiles, ` +
                `Erst-Zeichnung gebaut|verschoben|wartend ${vorErst || "-"} → ${b.erst || "-"}, offene Pipelines ${b.offen}, ` +
                `wartender Draw ${b.wartet || "keiner"}`;
        }
        setup.schwer = await ruf("Schwer-Liste", () => window.__schwer.sort((a, b) => b.ms - a.ms).slice(0, 5).map((z) => `${z.label} ${Math.round(z.ms / 1000)} s/${z.cc}`));
        setup.nieWarm = await ruf("Nie-warm-Liste", () => window.__nieWarm.slice(0, 8));
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
    // DIE BÜHNEN-WAND: hielt die Welt still? Jede Drift (Wetter, Übergang, Saison, Tageszeit, Bauten) beim Namen.
    const buehne = await ruf("Bühne", () => ({ vor: window.__buehne0, nach: window.__buehneStand(), wetter: window.__wetterBuch(window.__wetterSeq0), bau: window.__bauBuch, welt: window.__weltaktBuch(window.__weltaktSeq0) }));
    const kipp = [];
    // das Buch der Wache seit der Bühne: wer das Wetter drehte (Schreiber oder roh, mit Quelle und Spiel-Rahmen) und wen sie
    // verweigerte (die Wache hielt — keine Drift, aber beim Namen)
    const wb = (buehne.wetter && buehne.wetter.buch) || [];
    const dreher = wb.filter((e) => e.art !== "verweigert").map((e) => `${e.von} → ${e.zu} durch ${e.quelle || e.art} (${e.stapel})`);
    const verweigert = wb.filter((e) => e.art === "verweigert").map((e) => `${e.quelle} → ${e.zu}`);
    // das Buch des Welt-Halts seit der Bühne: gehaltene Welt-Akte (keine Drift, beim Namen) und durchgelaufene (die Täter)
    const wa = (buehne.welt && buehne.welt.buch) || [];
    const weltGehalten = wa.filter((e) => e.art === "verweigert").map((e) => `${e.quelle}: ${e.op}`);
    const weltDurch = wa.filter((e) => e.art === "durch").map((e) => `${e.op} durch ${e.quelle} (${e.stapel})`);
    if (!buehne.welt || buehne.welt.blind) kipp.push("der Welt-Akt-Spion ist blind (das Spiel nennt keine Welt-Akte)");
    if (weltDurch.length) kipp.push(`Welt-Akt unter der Bühne: ${weltDurch.slice(0, 4).join(" · ")}`);
    if (buehne.vor && buehne.nach) {
        const v = buehne.vor, n = buehne.nach;
        if (n.wetter !== v.wetter) kipp.push(`Wetter ${v.wetter} → ${n.wetter}${dreher.length ? " [" + dreher.join(" · ") + "]" : ""}`);
        else if (dreher.length) kipp.push(`Wetter gedreht: ${dreher.join(" · ")}`);
        if (n.uebergang) kipp.push("Wetter-Übergang läuft");
        if (n.saison !== v.saison) kipp.push(`Saison ${v.saison} → ${n.saison}`);
        if (Math.abs(n.zeit - v.zeit) > 0.02) kipp.push(`Tageszeit ${v.zeit} → ${Math.round(n.zeit * 1000) / 1000}`);
        const bau = buehne.bau || [];
        if (n.bauten !== v.bauten || bau.length) kipp.push(`Bauten ${v.bauten} → ${n.bauten}${bau.length ? " [" + bau.join(" · ") + "]" : ""}`);
    } else kipp.push("kein Bühnen-Stand gelesen");

    await browser.close();
    server.close();
    console.log("===== STEHENDE LINSE — Idle/Env-GPU-Pipeline-Churn (echter Renderer) =====\n");
    if (pageErr) { console.error("⛔ Page-Error während des Laufs:", pageErr); process.exit(1); }
    console.log(`  Bühne: ${kipp.length ? "GEKIPPT — " + kipp.join(" · ") : "hielt (Wetter, Saison, Tageszeit, Bauten unverändert)"}${verweigert.length ? ` · die Wetter-Wache verweigerte ${verweigert.length} Zug/Züge: ${verweigert.slice(0, 6).join(" · ")}` : ""}${weltGehalten.length ? ` · der Welt-Halt hielt ${weltGehalten.length} Welt-Akt(e) an: ${weltGehalten.slice(0, 6).join(" · ")}` : ""}`);
    if (SELBSTTEST_PROGRAMM) {
        const gehalten = weltGehalten.some((z) => z.startsWith("selbsttest:"));
        console.log(gehalten && !kipp.length ? "✅ SELBSTTEST GRÜN — der Welt-Halt hielt das Dorf an, die Bühne hielt." : "⛔ SELBSTTEST ROT — der Welt-Halt ist vakuös.");
        process.exit(gehalten && !kipp.length ? 0 : 1);
    }
    if (kipp.length) { console.error("⛔ BÜHNE GEKIPPT: die Welt der Messung driftete — " + kipp.join(" · ")); process.exit(1); }
    if (regen.err) { console.error("⛔ LINSE NICHT LAUFFÄHIG:", regen.err); process.exit(1); }
    if (regen.spur && regen.spur.length) {
        console.log("  Compiles im Env-Fenster (Aufrufer):");
        for (const z of regen.spur) console.log("    · " + z.replace(/https?:\/\/127\.0\.0\.1:\d+\//g, "").slice(0, 400));
    }
    console.log(`  Backend: ${setup.backend}  ·  Schlüssel-Warmup: ${setup.scheiben} Aufrufe  ·  längster Aufruf ${Math.round(setup.maxRuf.ms / 1000)} s (Frist 300 s): ${setup.maxRuf.name}  ·  Warmup-Compiles (einmalig): ${setup.warmupCompiles}  ·  davon Nachzügler bis zur Ruhe: ${setup.nachzuegler} in ${setup.warmupExtra} Extra-Frames${setup.ruhe ? "" : " (RUHE NIE ERREICHT)"}`);
    console.log(`  Schwerste Erst-Compiles (Schlüssel · Zeit/Programme): ${(setup.schwer || []).join(" · ") || "—"}\n`);
    // ein Schlüssel, dessen Objekte im Warmup nie zeichneten (die Erst-Zeichnung verschob oder wartete weiter): beim Namen
    if (setup.nieWarm && setup.nieWarm.length) { console.error("⛔ ERST-ZEICHNUNG IM WARMUP NIE GEZEICHNET: " + setup.nieWarm.join(" · ")); process.exit(1); }
    // ohne Ruhe misst der Leerlauf den Warmup, nicht den Leerlauf: rot, mit dem, was nicht zur Ruhe kam
    if (!setup.ruhe) { console.error("⛔ RUHE NIE ERREICHT (8 Bilder ohne Compile und ohne Arbeit der Erst-Zeichnung): " + (setup.ruheBefund || "kein unruhiges Bild gelesen")); process.exit(1); }
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
