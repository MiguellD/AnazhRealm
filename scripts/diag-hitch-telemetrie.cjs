// diag-hitch-telemetrie.cjs — DIE HITCH-LINSE (das-feld-zeichnet §5.1): beweist
// KONSUM der vier Flugschreiber-Zähler (LongTasks · GC/Heap-Delta ·
// Pipeline-Compiles · Upload-Bytes), nie bloße Existenz (Lehre 5), und DIE ERST-ZEICHNUNG: kein Frame trägt eine
// synchrone Pipeline der Welt, ein Bundle-Bürger steht nach seiner fertigen Pipeline wieder in der Aufnahme, Beweis-
// Aufnahme und Absage nennen ihren Täter — jede Probe mit ihrem Gegen-Lauf, der rot sein MUSS (die Bänder unten). Ein
// ECHTER WebGPU-Lauf (swiftshader-Vulkan, Software-Holz kienspan): der Boot SELBST ist der Konsum-Beweis.
//
//   node scripts/diag-hitch-telemetrie.cjs --teil=1|2
//   DIE ZWEI TEILE (je eine Welt, je eine CI-Gruppe): Teil 1 trägt den Boot-Konsum (Bänder 1–5, Konsum im Boot, Selbst-Test), die
//   Probe mit ihrem Gegen-Lauf, den Neubau und den Bundle-Neubau; Teil 2 in einer eigenen Welt den Bundle-Gegen-Lauf ohne
//   Anmeldung, den hängenden Fehler-Scope (er bleibt der letzte Bürger-Test: sein Stummel lässt jedes popErrorScope offen),
//   die Beweis-Aufnahme, die Absage und die WebGL2-Weiche. Jedes Band urteilt in GENAU einem Teil (den Seiten-Fehler urteilt der EINE Sammler in welt-boot).
//   Exit 0 = alle Bänder GRÜN (inkl. Selbst-Test: ein Fake-Trace ohne die neuen
//   Felder MUSS rot melden) · Exit 1 = mindestens ein Band ROT (mit Diagnose).
"use strict";
const { statikServer, starteBrowser, hauptLauf, sleep } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

// Port der Linse (4463 — neben diag-blick 4461, nie der save-server 4312).
// Laufzeit nach dem Welt-Settle: ~15 s echte Loop-Zeit, damit Sekunden-Grenzen,
// EWMA und Ringe wirklich GEFÜLLT sind (nicht nur initialisiert).
const LAUFZEIT_MS = 15000;
// Die Frist JE BAU der Erst-Zeichnungs-Wand (`ruf`): so lange darf EIN Pipeline-Bau im Flug sein (swiftshader am Läufer:
// 1–292 s je Pipeline), bevor die Wand den GPU-Prozess für hängend erklärt. HITCH_BAU_FRIST_S verkürzt sie für die Probe der
// Wand selbst (die Summe einer Probe darf jede Frist übersteigen, solange jeder Bau sich erfüllt).
const BAU_FRIST_MS = Number(process.env.HITCH_BAU_FRIST_S || 600) * 1000;
const BUNDLE_FRAMES = 2;
const TEIL = Number((process.argv.find((a) => a.startsWith("--teil=")) || "--teil=0").slice(7));
if (![1, 2].includes(TEIL)) throw new Error(`--teil=${TEIL}: erlaubt 1 oder 2`);
const IN = (t) => TEIL === t;
const server = statikServer();

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
    // die Erst-Zeichnung reist im selben Pipeline-Block (Bauten · verschoben · asynchron · offen).
    if (!pp || typeof pp.erstBauN !== "number" || typeof pp.erstPipeAsync !== "number" || typeof pp.erstVerschoben !== "number")
        maengel.push("steadyState.pipelines {erstBauN,erstVerschoben,erstPipeAsync} fehlt oder ist nicht numerisch");
    if (!trace.steadyState || typeof trace.steadyState.uploadKBProS !== "number")
        maengel.push("steadyState.uploadKBProS fehlt oder ist nicht numerisch");
    return maengel;
}

// DIE BAU-UHR (K25, vor dem ersten Skript der Seite): jeder Pipeline-Bau des Geräts (createRenderPipelineAsync ·
// createComputePipelineAsync, am Prototyp — auch der Abgriff des Stamms `_erstAbsageWache` ruft ihn) steht im Flug, bis
// sein Versprechen sich erfüllt oder absagt. Die Uhr der Wand ist dieser Bau, nie die Sekunde des Runners
// (swiftshader übersetzt eine Pipeline in 1 s oder in über 120 s).
function bauUhrInstall() {
    if (typeof GPUDevice === "undefined" || window.__bauUhr) return;
    const U = { imFlug: new Map(), angelegt: 0, gebaut: 0, abgesagt: 0, maxMs: 0, summeMs: 0 };
    const haken = (name) => {
        const roh = GPUDevice.prototype[name];
        if (typeof roh !== "function") return;
        GPUDevice.prototype[name] = function (d) {
            const p = roh.call(this, d);
            const t0 = performance.now();
            U.angelegt++;
            U.imFlug.set(p, { name: d?.label || name, t0 });
            const ende = (ok) => {
                const ms = performance.now() - t0;
                U.imFlug.delete(p);
                if (ok) U.gebaut++;
                else U.abgesagt++;
                U.summeMs += ms;
                if (ms > U.maxMs) U.maxMs = ms;
            };
            p.then(
                () => ende(true),
                () => ende(false)
            );
            return p;
        };
    };
    haken("createRenderPipelineAsync");
    haken("createComputePipelineAsync");
    window.__bauUhr = U;
}

// DIE ERST-ZEICHNUNGS-WAND (Seite): Haken und Proben unter `window.__erstWand`; jede Probe ist ein eigener, benannter
// Aufruf aus Node. Keine Probe trägt eine Sekunden-Frist: jede wartet auf ihr EREIGNIS (`bisEreignis`) und gibt nur auf,
// wenn die Erst-Zeichnung still steht — dann kann nichts mehr kommen.
function erstWandInstall(BUNDLE_FRAMES) {
    const rend = st.renderer;
    const U = window.__bauUhr || null;
    // (4b) DIE ERST-ZEICHNUNG: drei neue Stoffe vor die Kamera, einmal am EINEN Ort (die Nachbildung von
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
        bauUhr: U ? { angelegt: U.angelegt, gebaut: U.gebaut, imFlug: U.imFlug.size } : null,
    };
    const welt = st.scene;
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
            // der Deckel DIESES Aufrufs, wie ihn der EINE Ort gesetzt hat (`E.deckel`: im Spiel ERST_BAU_MS, unter dem
            // Ladeschirm LADE_TAKT_MS) — nie eine Konstante der Linse
            const E = r._erstZeichnung;
            const b = Z.bau.get(k) || { n: 0, ms: 0, vorMs: [], deckel: E ? E.deckel : NaN };
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
            if (rend._nodes?.nodeFrame) rend._nodes.nodeFrame.update();
            r._loopRender();
        } catch {
            /* die Linse misst, nie stören */
        }
    };
    // DIE BÜHNE der Proben: die Kamera sieht nur die Proben-Schicht (swiftshader rastert ein Welt-Bild in Sekunden — die
    // Probe misst die Erst-Zeichnung, nie die Welt); die Proben-Objekte liegen in der Welt-Szene, ihr Weg ist der der Welt.
    const SCHICHT = 31;
    const buehne = async (fn) => {
        const cam = st.camera;
        const maske = cam.layers.mask;
        cam.layers.set(SCHICHT);
        try {
            return await fn();
        } finally {
            cam.layers.mask = maske;
        }
    };
    // DIE EREIGNIS-FRIST jeder Probe: Bilder schalten, bis `ziel()` gilt — oder bis die Erst-Zeichnung STILL steht:
    // STILL_BILDER Bilder hintereinander ohne einen Pipeline-Bau des Geräts im Flug (die Bau-Uhr), ohne neu angelegten
    // Bau, ohne Knoten-Bau und ohne verschobenen Erst-Bau. Dann kann nichts mehr kommen, was `ziel` wahr macht, und die
    // Probe urteilt. Ein langsamer Runner wartet länger, sein Urteil ist dasselbe.
    const STILL_BILDER = 3;
    // DER GEGENDRUCK DER GPU: jedes geschaltete Bild wartet, bis das Gerät seine Arbeit abgegeben hat
    // (`queue.onSubmittedWorkDone`), bevor das nächste kommt — sonst wächst der Rückstau über die Probe, und jeder asynchrone
    // Pipeline-Bau wartet hinter ihm. `gpuStau` trägt die längste Wartezeit je Probe.
    const gpuStau = { maxMs: 0 };
    const gpuTakt = async () => {
        const d = rend.backend && rend.backend.device;
        if (!d || !d.queue || typeof d.queue.onSubmittedWorkDone !== "function") return;
        const t0 = performance.now();
        await d.queue.onSubmittedWorkDone();
        gpuStau.maxMs = Math.max(gpuStau.maxMs, performance.now() - t0);
    };
    const bisEreignis = async (ziel, pauseMs) => {
        let bilder = 0,
            still = 0;
        while (!ziel()) {
            const b0 = ESt ? ESt.bauN : 0,
                v0 = ESt ? ESt.verschoben : 0,
                a0 = U ? U.angelegt : 0;
            bild();
            bilder++;
            await gpuTakt();
            await sleep(pauseMs);
            const ruhig =
                (!U || (U.imFlug.size === 0 && U.angelegt === a0)) &&
                (!ESt || (ESt.bauN === b0 && ESt.verschoben === v0));
            still = ruhig ? still + 1 : 0;
            if (still >= STILL_BILDER) break;
        }
        return bilder;
    };
    // DIE RUHE vor jeder Probe (auf der Bühne): kein Pipeline-Bau des Geräts mehr im Flug und keine Pipeline der Welt
    // offen — sonst übersetzt der GPU-Prozess sie vor der Probe (ein Bau-Rückstau verschob am Runner jede weitere Probe
    // um Minuten). Was nach dem Stillstand noch offen ist, wird nie mehr bereit: die Probe trägt es als `ruheOffen`,
    // das Band urteilt.
    let ruheOffen = 0;
    const ruhe = async () => {
        const t0 = performance.now();
        await bisEreignis(() => (!ESt || ESt.offen.size === 0) && (!U || U.imFlug.size === 0), 50);
        ruheOffen = ESt ? ESt.offen.size : 0;
        const ms = Math.round(performance.now() - t0);
        window.__erstWandRuhe = {
            ms,
            offen: ruheOffen,
            namen: ESt ? [...ESt.offen.keys()].map((p) => ESt.namen.get(p) || "ohne Namen") : [],
        };
        return ms;
    };
    const probe = (vendor) => buehne(() => probeAufDerBuehne(vendor));
    const probeAufDerBuehne = async (vendor) => {
        // DIE PROBE STEHT IM SPIEL: sie misst den Takt, den der Spieler fühlt (der Deckel ERST_BAU_MS je Aufruf). Unter
        // dem Ladeschirm baut der EINE Ort je Aufruf bis LADE_TAKT_MS — am Runner steht er beim Einbau der Wand
        // oft noch (swiftshader); die Probe nimmt ihn für ihre Dauer weg und stellt ihn danach zurück.
        const lade = document.getElementById("ladeschirm");
        const ladeVor = lade ? lade.hidden : null;
        if (lade) lade.hidden = true;
        const imSpiel = !r._ladeTakt();
        const ruheMs = await ruhe();
        Z.sync = Z.async = 0;
        Z.bau.clear();
        const eigen = Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect");
        const stamm = rend._renderObjectDirect;
        if (vendor && eigen) delete rend._renderObjectDirect;
        const meshes = [];
        const gezeichnet = new Set();
        const drawRoh = rend.backend.draw;
        rend.backend.draw = function (ro) {
            if (ro?.object?.userData.__erstProbe) gezeichnet.add(ro.object);
            return drawRoh.apply(this, arguments);
        };
        for (let i = 0; i < 3; i++) {
            serie++;
            // ein Stoff mit einer eigenen Konstante: ein neues Programm, eine neue Pipeline (unbeleuchtet — swiftshader
            // kompiliert ihn in Sekunden; die Klasse ist dieselbe wie beim Tier, gemessen an der Radeon im ABBA der Welle K, 347992564)
            const m = new window.THREE.MeshBasicNodeMaterial();
            m.colorNode = TSL.vec3(0.2 + 0.0013 * serie, 0.45, 0.25 + 0.07 * i);
            const mesh = probeMesh(m, (i - 1) * 0.8, 4);
            mesh.userData.__erstProbe = true;
            welt.add(mesh);
            meshes.push(mesh);
        }
        let frames = 0;
        const t0 = performance.now();
        try {
            frames = await bisEreignis(() => gezeichnet.size >= meshes.length, 20);
        } finally {
            rend.backend.draw = drawRoh;
            if (vendor && eigen) rend._renderObjectDirect = stamm;
            if (lade) lade.hidden = ladeVor;
            for (const m of meshes) {
                welt.remove(m);
                m.geometry.dispose();
            }
        }
        let maxBau = 0,
            ueberBudget = 0;
        const deckel = new Set();
        for (const b of Z.bau.values()) {
            maxBau = Math.max(maxBau, b.n);
            deckel.add(b.deckel);
            for (let j = 1; j < b.vorMs.length; j++) if (!(b.vorMs[j] < b.deckel)) ueberBudget++;
        }
        return {
            sync: Z.sync,
            async: Z.async,
            aufrufeMitBau: Z.bau.size,
            maxBau,
            ueberBudget,
            deckel: [...deckel],
            imSpiel,
            gezeichnet: gezeichnet.size,
            frames,
            ms: Math.round(performance.now() - t0),
            ruheMs,
            ruheOffen,
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
        const cam = st.camera;
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
            await bisEreignis(() => bilder > 0, 20);
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
    // DIE BUNDLE-BÜRGER: ein Bürger, der in einer Aufnahme nicht zeichnen kann, meldet sich in der EINEN Warteschlange an
    // (`_erstWartet`), und sein Bundle nimmt neu auf, sobald die fertige Pipeline in r184s Zustand steht. Zwei Täter:
    // (A) DER NEUBAU BEI OFFENER PIPELINE — B zeichnet in Bundle b2; in EINEM Frame zeichnet A
    // (derselbe Stoff, ein eigenes Bundle b1 davor) zum ersten Mal und der Stoff wechselt die Variante: A legt die neue
    // Pipeline asynchron an, Bs Neubau trifft sie im Cache noch offen (r184 getForRender: Cache-Treffer → e.pipeline=d).
    // (B) DER HÄNGENDE FEHLER-SCOPE — popErrorScope löst nie auf (auf der Spielseite > 5 s, auf Windows-swiftshader nie): ein
    // neuer Stoff in einem Bundle, das Vendor-Versprechen seiner Pipeline erfüllt sich nie. Gemessen: wie viele Frames nach
    // der fertigen Pipeline (r184-Zustand) trägt die Aufnahme des Bundles den Bürger wieder. Der Gegen-Lauf mit stummer
    // Anmeldung MUSS ihn verlieren (sonst wäre die Wand blind).
    const T3 = window.THREE;
    const P3 = rend._pipelines;
    // je Bundle-Gruppe und Aufnahme (Kamera · Kontext): die Objekte ihrer letzten Aufnahme
    const traegt = new Map();
    const traegtIn = (bg, obj) => {
        const je = traegt.get(bg);
        if (je) for (const objs of je.values()) if (objs.has(obj)) return true;
        return false;
    };
    // je Probe-Objekt die Pipeline, an der sein letzter Draw nicht zeichnen konnte
    const wartete = new Map();
    const mitAufnahme = async (fn) => {
        const eigenRb = Object.prototype.hasOwnProperty.call(rend, "_renderBundle");
        const rbRoh = rend._renderBundle;
        rend._renderBundle = function (bundle) {
            const aus = rbRoh.apply(this, arguments);
            const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
            const d = this.backend.get(rb);
            let je = traegt.get(bundle.bundleGroup);
            if (!je) traegt.set(bundle.bundleGroup, (je = new Map()));
            je.set(rb, new Set((d.renderObjects || []).map((ro) => ro.object)));
            if (bundle.bundleGroup.userData.probe) bundle.bundleGroup.userData.probe.n++;
            return aus;
        };
        const travRoh = welt.traverse;
        welt.traverse = function () {
            szeneGang++;
            try {
                return travRoh.apply(this, arguments);
            } finally {
                szeneGang--;
            }
        };
        const irRoh = P3.isReady;
        P3.isReady = function (ro) {
            const ok = irRoh.call(this, ro);
            if (!ok && ro?.object?.userData.__bundleProbe) wartete.set(ro.object, this.get(ro).pipeline);
            return ok;
        };
        try {
            return await fn();
        } finally {
            if (eigenRb) rend._renderBundle = rbRoh;
            else delete rend._renderBundle;
            delete welt.traverse;
            P3.isReady = irRoh;
            traegt.clear();
            wartete.clear();
        }
    };
    const probeMesh = (mat, dx, d) => {
        const cam = st.camera;
        const dir = new T3.Vector3();
        cam.getWorldDirection(dir);
        const m = new T3.Mesh(new T3.BoxGeometry(0.6, 0.6, 0.6), mat);
        m.position.copy(cam.position).addScaledVector(dir, d);
        m.position.x += dx;
        m.frustumCulled = false;
        m.layers.set(SCHICHT);
        m.userData.__bundleProbe = true;
        return m;
    };
    // DAS PROBEN-BÜNDEL zählt jede Zeichnung (`n`) und nimmt nur Marken, die ihm gelten: eine Marke aus dem Gang über die
    // ganze Szene (`traverse` — `_texturAbschied`, wenn ein Atlas wächst) gilt jedem Bündel, nie seinem Bürger; das Bündel
    // schluckt sie und nennt ihren Schreiber (`fremd`), das Urteil gilt allein der Anmeldung
    let szeneGang = 0;
    const buendel = () => {
        const bg = new T3.BundleGroup();
        const P = (bg.userData.probe = { n: 0, fremd: [] });
        Object.defineProperty(bg, "needsUpdate", {
            set(v) {
                if (v !== true) return;
                if (szeneGang === 0) return void this.version++;
                const f = String(new Error().stack).match(/\/(stamm\/[^/?:]+\.js)(?:\?[^:]*)?:(\d+)/);
                P.fremd.push(f ? f[1] + ":" + f[2] : "?");
            },
        });
        return bg;
    };
    // DER FREMDE NEUBAU im Gegen-Lauf: ein Atlas wächst (der echte Weg über `initTexture`) im ersten Bild nach der fertigen
    // Pipeline — am Läufer fiel er in dieses Fenster und spielte den Bürger ohne Anmeldung ins Bündel
    const atlasWaechst = () => {
        const t = new T3.DataTexture(new Uint8Array(16), 2, 2);
        t.needsUpdate = true;
        rend.initTexture(t);
        t.image = { data: new Uint8Array(64), width: 4, height: 4 };
        t.needsUpdate = true;
        rend.initTexture(t);
        t.dispose();
    };
    // bis die Aufnahme des Bundles den Bürger trägt. Bis seine Pipeline steht (r184-Zustand), wartet die Probe auf ihr
    // Ereignis (`bisEreignis`) — steht die Erst-Zeichnung still, ehe sie bereit ist, wird sie es nie. Danach endet sie am
    // Ereignis: der Bürger steht in der Aufnahme, oder r184 zeichnete das Bündel BUNDLE_FRAMES + 1 Bilder ohne ihn (die
    // Anmeldung nimmt im ersten Bild danach neu auf); ein Bild, das das Bündel nicht zeichnet, zählt nie.
    const bisSichtbar = async (bg, obj, atlas) => {
        const t0 = performance.now();
        const P = bg.userData.probe;
        const f0 = P.fremd.length;
        let frames = 0,
            nachBereit = -1,
            bereitMs = -1,
            gezeichnet = 0,
            leer = 0;
        const bereit = () => {
            const pipe = wartete.get(obj);
            if (!pipe) return false;
            const p = rend.backend.get(pipe).pipeline;
            return p != null;
        };
        frames += await bisEreignis(() => traegtIn(bg, obj) || bereit(), 20);
        if (bereit()) {
            nachBereit = 0;
            bereitMs = Math.round(performance.now() - t0);
        }
        while (nachBereit >= 0 && !traegtIn(bg, obj) && gezeichnet <= BUNDLE_FRAMES && leer < STILL_BILDER) {
            const n = P.n;
            if (atlas && nachBereit === 0) atlasWaechst();
            bild();
            frames++;
            nachBereit++;
            if (P.n === n) leer++;
            else [leer, gezeichnet] = [0, gezeichnet + 1];
            await gpuTakt();
            await sleep(20);
        }
        return {
            sichtbar: traegtIn(bg, obj),
            frames,
            framesNachBereit: nachBereit,
            bereitMs,
            ms: Math.round(performance.now() - t0),
            gezeichnet,
            fremd: P.fremd.slice(f0),
        };
    };
    const stumm = () => {
        r._erstWartet = () => {};
    };
    const laut = () => {
        delete r._erstWartet;
    };
    // (A) der Neubau bei offener Pipeline
    const bundleNeubau = (ohneAnmeldung) => buehne(() => mitAufnahme(() => bundleNeubauAufDerBuehne(ohneAnmeldung)));
    const bundleNeubauAufDerBuehne = async (ohneAnmeldung) => {
        const ruheMs = await ruhe();
        serie++;
        const M = new T3.MeshBasicNodeMaterial();
        M.colorNode = TSL.vec3(0.31, 0.47, 0.12 + 0.0011 * serie);
        const b2 = buendel();
        const B = probeMesh(M, 0.45, 4);
        b2.add(B);
        const b1 = buendel();
        const A = probeMesh(M, -0.45, 4);
        b1.add(A);
        welt.add(b2);
        try {
            // (1) B steht im Bundle (seine erste Zeichnung, die Anmeldung trägt sie)
            const stand = await bisSichtbar(b2, B);
            // (2) EIN Frame: A zeichnet zum ersten Mal (b1 vor b2), der Stoff wechselt die Variante, b2 nimmt neu auf
            welt.remove(b2);
            welt.add(b1);
            welt.add(b2);
            M.alphaTest = 0.5;
            M.needsUpdate = true;
            b2.needsUpdate = true;
            wartete.clear();
            if (ohneAnmeldung) stumm();
            bild();
            const pipeA = wartete.get(A),
                pipeB = wartete.get(B);
            // (3) bis die Aufnahme von b2 B wieder trägt
            const nach = await bisSichtbar(b2, B, ohneAnmeldung);
            return {
                ruheMs,
                ruheOffen,
                stand: stand.sichtbar,
                standMs: stand.ms,
                offeneTreffer: !!pipeB && pipeB === pipeA,
                ...nach,
            };
        } finally {
            if (ohneAnmeldung) laut();
            welt.remove(b1);
            welt.remove(b2);
            A.geometry.dispose();
            B.geometry.dispose();
        }
    };
    // (B) der hängende Fehler-Scope: popErrorScope poppt (der Stapel bleibt im Gleichgewicht), sein Versprechen löst nie auf
    const fehlerScope = (ohneAnmeldung) => buehne(() => mitAufnahme(() => fehlerScopeAufDerBuehne(ohneAnmeldung)));
    const fehlerScopeAufDerBuehne = async (ohneAnmeldung) => {
        const ruheMs = await ruhe();
        serie++;
        const GP = GPUDevice.prototype;
        const popRoh = GP.popErrorScope;
        let haengt = 0;
        GP.popErrorScope = function () {
            haengt++;
            popRoh.call(this).catch(() => {});
            return new Promise(() => {});
        };
        const M = new T3.MeshBasicNodeMaterial();
        M.colorNode = TSL.vec3(0.52, 0.18 + 0.0013 * serie, 0.61);
        const bg = buendel();
        const C = probeMesh(M, 0, 3.5);
        bg.add(C);
        welt.add(bg);
        if (ohneAnmeldung) stumm();
        try {
            const nach = await bisSichtbar(bg, C, ohneAnmeldung);
            return { ruheMs, ruheOffen, haengt, ...nach };
        } finally {
            GP.popErrorScope = popRoh;
            if (ohneAnmeldung) laut();
            welt.remove(bg);
            C.geometry.dispose();
        }
    };
    // DIE BEWEIS-AUFNAHME bricht LAUT ab (scripts/lib/ausgabe-aufnahme.cjs): eine Pipeline, die nie bereit wird (eine
    // Attrappe in der Warteschlange), lässt die Aufnahme nach ihrer Frist werfen und nennt sie beim Namen; ohne sie liefert
    // dieselbe Aufnahme ihr Bild mit `erst.offen` 0.
    const aufnahme = () => buehne(() => aufnahmeAufDerBuehne());
    const aufnahmeAufDerBuehne = async () => {
        const ruheMs = await ruhe();
        const attrappe = { vertexProgram: { name: "wand-attrappe" }, cacheKey: "nie-bereit" };
        let wurf = null;
        ESt.offen.set(attrappe, new Set());
        try {
            await window.__ausgabeAufnahme(32, 18, 1, { erstFristMs: 3000, satz: "messung" });
        } catch (e) {
            wurf = String(e?.message || e);
        } finally {
            ESt.offen.delete(attrappe);
        }
        let bild = null;
        try {
            const auf = await window.__ausgabeAufnahme(32, 18, 1, { erstFristMs: 3000, satz: "messung" });
            bild = { pixel: auf.u8.length, erst: auf.info.erst };
        } catch (e) {
            bild = { wurf: String(e?.message || e) };
        }
        return { ruheMs, ruheOffen, wurf, bild };
    };
    // DIE ABSAGE EINER PIPELINE: ein Stummel am Gerät sagt den Bau eines neuen Stoffs ab (r184 verschluckt die Absage,
    // `catch(e){}`) — das Spiel MUSS sie als ERROR `PIPELINE-ABSAGE renderPipeline_<Stoff>_<id>` melden und die Pipeline aus
    // der Warteschlange nehmen, und die Beweis-Aufnahme MUSS beim Namen abbrechen (der Bürger bleibt unsichtbar) — der Bürger
    // steht in einem BÜNDEL wie jeder Leib (mensch.K4, 30.10.: ein abgesagter Bürger des Leib-Bündels fiel still, das Bündel
    // versiegelte ohne ihn, und die Aufnahme stand grün). Dazu die Backend-Weiche: auf WebGL2 meldet sich niemand an (dort
    // ersetzt `_completeCompile` das Datenobjekt, ein Setter feuerte nie), der wartende Draw zählt nur.
    const absage = () => buehne(() => absageAufDerBuehne());
    const absageAufDerBuehne = async () => {
        const ruheMs = await ruhe();
        serie++;
        const GP = GPUDevice.prototype;
        const crpaRoh = GP.createRenderPipelineAsync;
        GP.createRenderPipelineAsync = function (d) {
            if (d && /wand-absage-stoff/.test(d.label || "")) return Promise.reject(new Error("der Stummel der Wand sagt ab"));
            return crpaRoh.call(this, d);
        };
        const zeilen = [];
        const eigenLog = Object.prototype.hasOwnProperty.call(r, "log");
        const logRoh = r.log;
        r.log = function (m, lvl) {
            if (lvl === "ERROR" && /PIPELINE-ABSAGE/.test(String(m))) zeilen.push(String(m));
            return logRoh.apply(this, arguments);
        };
        const M = new T3.MeshBasicNodeMaterial();
        M.name = "wand-absage-stoff";
        M.colorNode = TSL.vec3(0.71, 0.33, 0.09 + 0.0013 * serie);
        const D = probeMesh(M, 0, 3.5);
        const bg = buendel();
        bg.add(D);
        welt.add(bg);
        const a0 = ESt.absagenN || 0;
        // DER EINE MELDER: die Absage geht über die GPU-Wache des Spiels (`_gpuWacheMeldung`) — sie
        // zählt dort, und dieselbe Absage steht genau EINMAL im Log
        const g0 = r._gpuWache ? r._gpuWache.n : 0;
        let wurf = null;
        let offenDanach = -1,
            frames = 0;
        try {
            frames = await bisEreignis(() => zeilen.length > 0, 20);
            for (let i = 0; i < 3; i++) bild();
            offenDanach = ESt.offen.size;
            try {
                await window.__ausgabeAufnahme(32, 18, 1, { erstFristMs: 3000, satz: "messung" });
            } catch (e) {
                wurf = String(e?.message || e);
            }
        } finally {
            GP.createRenderPipelineAsync = crpaRoh;
            if (eigenLog) r.log = logRoh;
            else delete r.log;
            welt.remove(bg);
            D.geometry.dispose();
        }
        // die Backend-Weiche: eine Anmeldung auf WebGL2 trägt sich nicht in die Schlange ein, der wartende Draw zählt
        let webgl = null;
        const n0 = ESt.offen.size,
            w0 = ESt.wartetN;
        const attrappe = { cacheKey: "webgl-attrappe", vertexProgram: { name: "webgl" } };
        r._erstWartet({ isWebGPUBackend: false, isWebGLBackend: true, get: () => ({}) }, attrappe, null);
        webgl = { offenZuwachs: ESt.offen.size - n0, wartetZuwachs: ESt.wartetN - w0 };
        ESt.offen.delete(attrappe);
        const gpuWache = (r._gpuWache ? r._gpuWache.n : 0) - g0;
        return { ruheMs, ruheOffen, zeilen, absagen: (ESt.absagenN || 0) - a0, gpuWache, frames, offenDanach, wurf, webgl };
    };
    window.__erstWand = {
        stand: () => res.erst,
        probe,
        neubau,
        bundleNeubau,
        fehlerScope,
        aufnahme,
        absage,
        zurueck: () => Object.prototype.hasOwnProperty.call(rend, "_renderObjectDirect"),
        gpuStau,
    };
}

hauptLauf(async () => {
    await server.lausche(0);
    // Echtes WebGPU auf swiftshader — die Schalter je Plattform trägt das EINE Rezept (scripts/lib/software-gpu.cjs).
    const browser = await starteBrowser({ art: "linse", frist: 600000, zeit: true }); // Band 1 (LongTasks) ist auf swiftshader geeicht
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    // die Bau-Uhr sitzt vor dem ersten Skript der Seite: jeder Pipeline-Bau des Boots steht in ihr (die Ruhe wartet auch
    // auf ihn)
    await page.evaluateOnNewDocument(bauUhrInstall);
    // KEIN Null-Renderer — die Zähler brauchen den echten WebGPU-Pfad (Tap + Pipelines).
    // Software-Holz (Lehre 26): auf „voll" kostet auf swiftshader ein Compile 50–70 s; die Linse prüft Zähler und Gesetz.
    await server.zeige(page, 60000, "index.html?holz=kienspan");

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
        const res = {};
        await window.__weltDa(() => !!st);
        // Settle wie diag-blick: Chunks-Plateau (großzügig — swiftshader ist zäh).
        let stable = 0,
            last = -1;
        for (const weiter = window.__deckel("der Ring", 600); weiter(); ) {
            const sz = st.voxelChunks ? st.voxelChunks.size : 0;
            if (sz === last) stable++;
            else {
                stable = 0;
                last = sz;
            }
            if (sz > 20 && stable > 10) break;
            await sleep(500);
        }
        const rend = st.renderer;
        if (!rend) return { fatal: "kein Renderer" };
        res.rendererArt = rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?";
        res.headlessNull = !!rend._isHeadlessNull;
        if (rend._isHeadlessNull) return { fatal: "Renderer fiel auf headless-Null zurück — kein echter WebGPU-Lauf" };
        // DIE GERÄTE-GRENZEN (G1): jede Stufen-Grenze, in der das Gerät der Welt unter seinem Adapter bleibt (ohne requiredLimits)
        res.grenzenUnter = await navigator.gpu.requestAdapter({ featureLevel: "compatibility" }).then((a) => Object.keys(Object.getPrototypeOf(a.limits)).filter((k) => /PerShaderStage$/.test(k) && rend.backend.device.limits[k] < a.limits[k]).map((k) => `${k} ${rend.backend.device.limits[k]} < ${a.limits[k]}`)); // prettier-ignore
        // ~15 s echte Laufzeit: der rAF-Loop läuft; falls die Frames stocken
        // (headless-Drossel), treiben wir den Loop von Hand (wie diag-blick).
        const frGet = () => st.flightRecorder || null;
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
                    } catch {
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
            memoryApi: !!performance?.memory,
        };
        // (3) Pipelines: der Boot-Warm-Compile ERZEUGT welche — Konsum-Beweis.
        const sns = st.perfSense || {};
        res.pipes = {
            pipesN: fr.pipesN,
            total: sns.pipesTotal,
            neuProS: sns.pipesNeuProS,
            cachesSize:
                rend._pipelines?.caches && typeof rend._pipelines.caches.size === "number"
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
    }, IN(1) ? LAUFZEIT_MS : 0);
    // DIE ERST-ZEICHNUNG: Installation, Probe, Gegen-Lauf, Neubau, Neubau ohne Gedächtnis — je ein Aufruf
    if (out && !out.fatal) {
        // DIE FRIST GILT JE BAU, NIE JE PROBE: eine Probe ohne Sekunden-Frist — sie läuft auf der Seite als
        // Versprechen, Node fragt in kurzen Aufrufen nach. Gerissen wird nur, wenn EIN Bau länger als BAU_FRIST_MS im Flug
        // ist (der GPU-Prozess hängt: ein Bau, der sich nie erfüllt — er steht beim Namen im Wurf) oder so lange kein Bau-
        // Ereignis kommt, während die Probe läuft.
        const ruf = async (name, fn, arg) => {
            const t0 = Date.now();
            const sek = () => Math.round((Date.now() - t0) / 1000);
            await page.evaluate(
                `(() => { window.__erstWandRuhe = null; if (window.__erstWand) window.__erstWand.gpuStau.maxMs = 0; const lauf = (window.__erstRuf = { fertig: false, wert: undefined, fehler: null });` +
                    ` Promise.resolve().then(() => (${fn.toString()})(${JSON.stringify(arg)})).then(` +
                    `(v) => { lauf.wert = v; lauf.fertig = true; }, (e) => { lauf.fehler = String((e && e.stack) || e); lauf.fertig = true; }); })()`
            );
            let ereignis = null,
                ereignisAm = Date.now(),
                meldungAm = Date.now();
            for (;;) {
                const s = await page
                    .evaluate(() => {
                        const lauf = window.__erstRuf;
                        const U = window.__bauUhr;
                        const jetzt = performance.now();
                        let alt = null;
                        if (U)
                            for (const b of U.imFlug.values())
                                if (!alt || b.t0 < alt.t0) alt = b;
                        return {
                            fertig: lauf.fertig,
                            fehler: lauf.fehler,
                            ereignis: U ? `${U.angelegt}/${U.gebaut}/${U.abgesagt}` : "",
                            imFlug: U ? U.imFlug.size : 0,
                            gebaut: U ? U.gebaut : 0,
                            aeltester: alt ? { name: alt.name, ms: Math.round(jetzt - alt.t0) } : null,
                        };
                    })
                    .catch((e) => {
                        throw new Error(`[Erst-Zeichnung] ${name} nach ${sek()} s: ${e?.message || e}`);
                    });
                if (s.fehler) throw new Error(`[Erst-Zeichnung] ${name} nach ${sek()} s: ${s.fehler}`);
                if (s.fertig) break;
                if (s.ereignis !== ereignis) {
                    ereignis = s.ereignis;
                    ereignisAm = Date.now();
                }
                if (s.aeltester && s.aeltester.ms > BAU_FRIST_MS)
                    throw new Error(
                        `[Erst-Zeichnung] ${name} nach ${sek()} s: der Bau „${s.aeltester.name}" hängt seit ${Math.round(s.aeltester.ms / 1000)} s (Frist je Bau ${BAU_FRIST_MS / 1000} s, ${s.imFlug} im Flug)`
                    );
                if (Date.now() - ereignisAm > BAU_FRIST_MS)
                    throw new Error(
                        `[Erst-Zeichnung] ${name} nach ${sek()} s: kein Bau-Ereignis seit ${Math.round((Date.now() - ereignisAm) / 1000)} s, die Probe steht (Bau-Uhr angelegt/gebaut/abgesagt ${s.ereignis})`
                    );
                if (Date.now() - meldungAm >= 60000) {
                    meldungAm = Date.now();
                    console.log(
                        `  [Erst-Zeichnung] ${name}: ${sek()} s, ${s.imFlug} Bauten im Flug` +
                            (s.aeltester ? ` (ältester „${s.aeltester.name}" seit ${Math.round(s.aeltester.ms / 1000)} s)` : "") +
                            `, Bau-Uhr angelegt/gebaut/abgesagt ${s.ereignis}`
                    );
                }
                await sleep(250);
            }
            const { v, stauMs } = await page.evaluate(() => {
                const w = window.__erstRuf.wert;
                window.__erstRuf = null;
                return { v: w, stauMs: window.__erstWand ? Math.round(window.__erstWand.gpuStau.maxMs) : -1 };
            });
            console.log(`  [Erst-Zeichnung] ${name}: ${sek()} s (GPU-Gegendruck je Bild bis ${stauMs} ms)`);
            const ru = await page.evaluate(() => window.__erstWandRuhe);
            if (ru?.offen)
                console.log(
                    `  [Erst-Zeichnung] ${name}: die Ruhe endete nach ${ru.ms} ms mit ${ru.offen} offenen Pipelines der Welt — ${ru.namen.join(" · ")}`
                );
            return v;
        };
        await page.evaluate(`(${erstWandInstall.toString()})(${BUNDLE_FRAMES})`);
        out.erst = await ruf("Stand", () => window.__erstWand.stand());
        if (IN(1)) {
            out.erst.probe = await ruf("Probe", (v) => window.__erstWand.probe(v), false);
            out.erst.gegen = await ruf("Gegen-Lauf", (v) => window.__erstWand.probe(v), true);
            out.erst.zurueck = await ruf("zurück", () => window.__erstWand.zurueck());
            out.erst.neubau = await ruf("Neubau", (v) => window.__erstWand.neubau(v), false);
            out.erst.neubauGegen = await ruf("Neubau ohne Gedächtnis", (v) => window.__erstWand.neubau(v), true);
            out.erst.bundleNeubau = await ruf("Bundle-Neubau bei offener Pipeline", (v) => window.__erstWand.bundleNeubau(v), false);
        }
        if (IN(2)) {
            out.erst.bundleNeubauGegen = await ruf("Bundle-Neubau ohne Anmeldung", (v) => window.__erstWand.bundleNeubau(v), true);
            // der hängende Fehler-Scope zuletzt: sein Stummel lässt jedes popErrorScope der Probe für immer offen
            out.erst.fehlerScope = await ruf("Hängender Fehler-Scope", (v) => window.__erstWand.fehlerScope(v), false);
            out.erst.fehlerScopeGegen = await ruf("Hängender Fehler-Scope ohne Anmeldung", (v) => window.__erstWand.fehlerScope(v), true);
            await page.evaluate(AUSGABE_INSTALL);
            out.erst.aufnahme = await ruf("Beweis-Aufnahme mit offener Pipeline", () => window.__erstWand.aufnahme());
            out.erst.absage = await ruf("Absage einer Pipeline", () => window.__erstWand.absage());
        }
        out.erst.bauUhrEnde = await page.evaluate(() => {
            const U = window.__bauUhr;
            return U
                ? { angelegt: U.angelegt, gebaut: U.gebaut, abgesagt: U.abgesagt, imFlug: U.imFlug.size, maxMs: Math.round(U.maxMs), summeMs: Math.round(U.summeMs) }
                : null;
        });
    }

    await browser.close();
    server.close();

    console.log("\n===== HITCH-TELEMETRIE-LINSE (das-feld-zeichnet §5.1) =====");
    if (!out || out.fatal) {
        console.log("FATAL:", out ? out.fatal : "?");
        process.exit(1);
    }
    console.log(
        `Renderer: ${out.rendererArt} · frames=${out.frames} (Δ Laufzeit ${out.framesDelta})` +
            ` · performance.memory=${out.gc.memoryApi ? "da" : "FEHLT"}`
    );

    let rot = 0;
    const bandIn = (t) => (IN(t) ? band : () => {});
    const band = (ok, name, detail) => {
        console.log(`${ok ? "✅" : "❌"} ${name} — ${detail}`);
        if (!ok) rot++;
    };

    // Band 1 — LongTasks: swiftshader-Boot QUASI SICHER > 0; wenn 0, nur Existenz+Typ.
    const lt = out.lt;
    const ltNumerisch = lt.typN === "number" && lt.typMs === "number" && Number.isFinite(lt.ltMaxMs);
    if (lt.ltN > 0) {
        bandIn(1)(
            ltNumerisch,
            "LONGTASKS (Konsum)",
            `ltN=${lt.ltN} · ltMs=${Math.round(lt.ltMs)} ms · ltMaxMs=${Math.round(lt.ltMaxMs)} ms · Observer=${lt.obsDa}`
        );
    } else {
        bandIn(1)(
            ltNumerisch && lt.accDa,
            "LONGTASKS (nur Existenz+Typ — Boot ohne LongTask, ungewöhnlich)",
            `ltN=0 · Felder numerisch=${ltNumerisch} · Akku installiert=${lt.accDa}`
        );
    }

    // Band 2 — Heap/GC: Ring existiert + _heapLast gesetzt (wo performance.memory da ist).
    const gc = out.gc;
    const gcOk = gc.ringDa && gc.ringLen === 180 && (!gc.memoryApi || Number.isFinite(gc.heapLast));
    bandIn(1)(
        gcOk,
        "HEAP/GC-RING",
        `gcRing[${gc.ringLen}] da=${gc.ringDa} · Sekunden=${gc.secRingN} · nonZero-Slots=${gc.nonZero} · heapLast=${
            gc.heapLast != null ? (gc.heapLast / 1048576).toFixed(0) + " MB" : "—"
        } · gcN=${gc.gcN}`
    );

    // Band 3 — Pipelines: der Boot-Warm-Compile erzeugt Pipelines ⇒ pipesN > 0 ist der Konsum-Beweis.
    const pp = out.pipes;
    bandIn(1)(
        typeof pp.pipesN === "number" && pp.pipesN > 0,
        "PIPELINE-COMPILES (Konsum)",
        `pipesN=${pp.pipesN} · caches.size=${pp.cachesSize} · sense.total=${pp.total} · neuProS=${
            pp.neuProS != null ? (+pp.neuProS).toFixed(2) : "—"
        }`
    );

    // Band 4 — Upload-Bytes: Tap sitzt + kumuliert > 1 MB (Chunks/Assets wurden hochgeladen).
    const up = out.up;
    const upMB = (up.upBytes || 0) / 1048576;
    bandIn(1)(
        up.tapDa && upMB > 1,
        "UPLOAD-BYTES (Konsum)",
        `Tap=${up.tapDa} · kumuliert=${upMB.toFixed(1)} MB · EwmaProFrame=${
            up.uploadBytesEwma != null ? (up.uploadBytesEwma / 1024).toFixed(1) + " KB" : "—"
        }`
    );

    // Band 5 — der Trace trägt alle vier Zähler (dieselbe Prüf-Funktion wie der Selbst-Test).
    const traceMaengel = pruefeTraceFelder(out.trace);
    bandIn(1)(
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
    // die Bau-Uhr (die Uhr der Ereignis-Fristen) sah die Bauten des Boots und sah Bauten sich erfüllen — ohne sie stünde
    // jede Probe sofort still. Wie viele beim Einbau der Wand schon gebaut waren, ist das Tempo des Runners und urteilt nie.
    const bu = ez.bauUhr || {},
        bue = ez.bauUhrEnde || {};
    bandIn(1)(
        ez.daStamm === true && eb.bauN > 0 && eb.pipeAsync > 0 && bu.angelegt > 0 && bue.gebaut > 0,
        "ERST-ZEICHNUNG (Konsum im Boot)",
        `am Renderer=${ez.daStamm} · Knoten-Bauten im Pass ${eb.bauN} (Σ ${eb.bauMs} ms) · verschoben ${eb.verschoben} · Pipelines asynchron ${eb.pipeAsync} · ` +
            `Bau-Uhr beim Einbau der Wand ${bu.angelegt} angelegt, ${bu.gebaut} gebaut, ${bu.imFlug} im Flug · am Ende ${bue.angelegt} angelegt, ` +
            `${bue.gebaut} gebaut, ${bue.abgesagt} abgesagt, ${bue.imFlug} im Flug, längster Bau ${bue.maxMs} ms (Σ ${bue.summeMs} ms)`
    );
    const pr = ez.probe || {};
    bandIn(1)(
        pr.imSpiel === true &&
            pr.gezeichnet === 3 &&
            pr.sync === 0 &&
            pr.async >= 3 &&
            pr.ueberBudget === 0 &&
            pr.ruheOffen === 0,
        "ERST-ZEICHNUNG (Probe: drei neue Stoffe — gezeichnet, 0 synchrone Pipelines der Welt, kein Bau über dem Budget)",
        `Ruhe davor ${pr.ruheMs} ms (offen danach ${pr.ruheOffen}) · gezeichnet ${pr.gezeichnet}/3 nach ${pr.frames} Frames (${pr.ms} ms) · synchron ${pr.sync} · asynchron ${pr.async} · ` +
            `Aufrufe mit Bau ${pr.aufrufeMitBau} · max ${pr.maxBau} Bauten je Aufruf · über dem Deckel des Aufrufs (${(pr.deckel || []).join("/")} ms, im Spiel ${pr.imSpiel}) ${pr.ueberBudget}`
    );
    const gg = ez.gegen || {};
    bandIn(1)(
        gg.gezeichnet === 3 && gg.sync >= 1 && gg.maxBau >= 2 && ez.zurueck === true,
        "ERST-ZEICHNUNG Gegen-Lauf (der Vendor-Weg MUSS rot sein: synchrone Pipeline, alle Bauten in einem Aufruf)",
        `synchron ${gg.sync} · asynchron ${gg.async} · max ${gg.maxBau} Bauten je Aufruf · über dem Budget ${gg.ueberBudget} · ` +
            `gezeichnet ${gg.gezeichnet}/3 nach ${gg.frames} Frames · der EINE Ort danach zurück=${ez.zurueck}`
    );

    const nb = ez.neubau || {},
        nbg = ez.neubauGegen || {};
    bandIn(1)(
        nb.sofort === true && nb.neubauN >= 1 && nbg.sofort === false,
        "ERST-ZEICHNUNG Neubau (ein gezeichnetes Objekt wechselt die Variante: im nächsten Bild gezeichnet; vergessen MUSS es blinken)",
        `gezeichnet im nächsten Bild ${nb.sofort} · Neubauten ${nb.neubauN} · Gegen-Lauf ohne Gedächtnis gezeichnet ${nbg.sofort}`
    );

    // Die Bundle-Bürger: nach der fertigen Pipeline trägt die Aufnahme den Bürger in höchstens BUNDLE_FRAMES Bildern; der
    // Gegen-Lauf mit stummer Anmeldung verliert ihn (r184 zeichnet das Bündel danach BUNDLE_FRAMES + 1 Bilder ohne ihn).
    const bn = ez.bundleNeubau || {},
        bng = ez.bundleNeubauGegen || {};
    const bnWeg = (x) =>
        `${x.sichtbar ? "sichtbar" : "UNSICHTBAR"} ${x.framesNachBereit} Frames nach der fertigen Pipeline (bereit nach ${x.bereitMs} ms, ` +
        `${x.frames} Frames, ${x.ms} ms, danach gezeichnet ${x.gezeichnet}×)` +
        ` · fremde Marken geschluckt: ${x.fremd?.join(" ") || "keine"}`;
    if (IN(1))
        band(
            bn.stand === true &&
                bn.offeneTreffer === true &&
                bn.sichtbar === true &&
                bn.framesNachBereit >= 0 &&
                bn.framesNachBereit <= BUNDLE_FRAMES &&
                bn.ruheOffen === 0,
            `ERST-ZEICHNUNG Bundle-Neubau bei offener Pipeline (der Bürger steht ≤ ${BUNDLE_FRAMES} Frames nach seiner Pipeline wieder in der Aufnahme)`,
            `B im Bundle ${bn.stand} (${bn.standMs} ms) · Neubau traf die offene Pipeline der Erst-Zeichnung ${bn.offeneTreffer} · ` +
                `${bnWeg(bn)} · Ruhe offen ${bn.ruheOffen}`
        );
    if (IN(2))
        band(
            bng.offeneTreffer === true && bng.sichtbar === false && bng.bereitMs >= 0 && bng.gezeichnet > BUNDLE_FRAMES && bng.fremd?.length > 0,
            "ERST-ZEICHNUNG Bundle-Neubau ohne Anmeldung (der Gegen-Lauf: ohne Anmeldung MUSS der Bürger fehlen)",
            `Treffer ${bng.offeneTreffer}, ${bnWeg(bng)}`
        );
    const fs_ = ez.fehlerScope || {},
        fsg = ez.fehlerScopeGegen || {};
    bandIn(2)(
        fs_.haengt >= 1 &&
            fs_.sichtbar === true &&
            fs_.framesNachBereit >= 0 &&
            fs_.framesNachBereit <= BUNDLE_FRAMES &&
            fs_.ruheOffen === 0 &&
            fsg.haengt >= 1 &&
            fsg.sichtbar === false &&
            fsg.gezeichnet > BUNDLE_FRAMES &&
            fsg.bereitMs >= 0 &&
            fsg.fremd?.length > 0,
        `ERST-ZEICHNUNG hängender Fehler-Scope (das Vendor-Versprechen erfüllt sich nie: der Bürger steht ≤ ${BUNDLE_FRAMES} Frames nach seiner Pipeline in der Aufnahme; ohne Anmeldung MUSS er fehlen)`,
        `popErrorScope hängend ${fs_.haengt}× · ${bnWeg(fs_)} · Ruhe offen ${fs_.ruheOffen} · Gegen-Lauf: hängend ${fsg.haengt}×, ${bnWeg(fsg)}`
    );
    const au = ez.aufnahme || {},
        aub = au.bild || {};
    bandIn(2)(
        typeof au.wurf === "string" &&
            /ERST-ZEICHNUNG OFFEN/.test(au.wurf) &&
            /wand-attrappe \[nie-bereit\]/.test(au.wurf) &&
            aub.pixel === 32 * 18 * 4 &&
            aub.erst &&
            aub.erst.offen === 0,
        "BEWEIS-AUFNAHME bricht laut ab (eine nie bereite Pipeline: Wurf mit ihrem Namen; ohne sie das Bild mit erst.offen 0)",
        `Wurf: ${au.wurf || "KEINER (still)"} · danach ${aub.wurf ? "Wurf " + aub.wurf : `Bild ${aub.pixel} Bytes, erst ${JSON.stringify(aub.erst)}`}`
    );
    const ab = ez.absage || {};
    const abZeile = (ab.zeilen || [])[0] || "";
    bandIn(2)(
        /PIPELINE-ABSAGE renderPipeline_wand-absage-stoff_\d+: der Stummel der Wand sagt ab/.test(abZeile) &&
            ab.absagen >= 1 &&
            ab.gpuWache === ab.absagen &&
            (ab.zeilen || []).length === 1 &&
            ab.offenDanach === 0 &&
            ab.ruheOffen === 0 &&
            typeof ab.wurf === "string" &&
            /renderPipeline_wand-absage-stoff_\d+ \(ABGESAGT\)/.test(ab.wurf),
        "ERST-ZEICHNUNG Absage einer Pipeline (ERROR mit dem Stoff-Namen, aus der Schlange, die Beweis-Aufnahme bricht beim Namen ab)",
        `ERROR: ${abZeile ? abZeile.replace(/^.*\[ERROR\] /, "") : "KEINE (still)"} · Absagen ${ab.absagen} nach ${ab.frames} Frames · ` +
            `GPU-Wache +${ab.gpuWache} (Soll = Absagen, EIN Melder) · Log-Zeilen ${(ab.zeilen || []).length} (Soll 1) · ` +
            `offen danach ${ab.offenDanach} · Aufnahme: ${ab.wurf ? ab.wurf.replace(/^.*offene Pipelines: /, "") : "KEIN Wurf (still)"}`
    );
    const wg = ab.webgl || {};
    bandIn(2)(
        wg.offenZuwachs === 0 && wg.wartetZuwachs === 1,
        "ERST-ZEICHNUNG WebGL2-Weiche (kein Bundle, kein Setter: die Anmeldung trägt sich nicht ein, der wartende Draw zählt)",
        `Schlange +${wg.offenZuwachs} · wartende Draws +${wg.wartetZuwachs}`
    );

    bandIn(1)(Array.isArray(out.grenzenUnter) && !out.grenzenUnter.length, "GERÄTE-GRENZEN (G1: das Gerät der Welt trägt je Stufe die Grenze seines Adapters)", (out.grenzenUnter || ["nicht gemessen"]).join(" · ") || "jede Stufe = Adapter"); // prettier-ignore

    // SELBST-TEST — ein Fake-Trace OHNE die neuen Felder durch DIESELBE Prüf-
    // Funktion: sie MUSS rot melden (sonst wäre die Linse ein Existenz-Theater).
    const fake = { session: { seconds: 1 }, memory: { heapMB: 100 }, steadyState: { frameMsEwma: 16 } };
    const fakeMaengel = pruefeTraceFelder(fake);
    bandIn(1)(
        fakeMaengel.length >= 3,
        "SELBST-TEST (Fake-Trace ohne neue Felder MUSS rot)",
        `gemeldete Mängel=${fakeMaengel.length} (erwartet ≥3): ${fakeMaengel.join(" · ")}`
    );

    console.log(rot === 0 ? "\n✅ GRÜN — alle Hitch-Zähler werden KONSUMIERT." : `\n❌ ROT — ${rot} Band/Bänder gefallen.`);
    process.exit(rot === 0 ? 0 : 1);
});
