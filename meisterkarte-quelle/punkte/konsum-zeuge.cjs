// DER ZEUGE DES KONSUMS (R6 nach Konsum, punkte.cjs Abschnitt „Konsum“): der Läufer lädt diese Datei in JEDEN node-Prozess der
// Station (NODE_OPTIONS --require, wie gpu-zeuge.cjs) — an jedem SHA, in jede Linse, die Werkbank und den save-server.
// Er nennt, was die Station WIRKLICH ausführte und las:
//   · DER KNOTEN (immer): die Precise Coverage je FUNKTION des Node-Prozesses ab dem Start (binär, V8 `Profiler.startPreciseCoverage`
//     über `inspector`). Eine gerufene Funktion zählt ganz, auch ihr nie genommener Zweig. Ein Funktions-Text, den der Prozess zur
//     LAUFZEIT las (`fn.toString()` — puppeteer schickt so jede Funktion in die Seite), zählt als ausgeführt. Ein Text, den ein Modul
//     BEIM LADEN las (die Linsen-Bibliotheken gießen ihre Seiten-Funktionen dort in Install-Texte: 87 Stellen unter scripts/lib,
//     draw-zaehler.cjs `ZAEHLER_INSTALL` — jeder Lader hätte sonst jede davon „ausgeführt“), zählt erst, wenn der Prozess ihn AUSGIBT:
//     an eine Seite (CDP), an einen Dienst (HTTP — die Probe an die Werkbank), an ein Kind (argv, Umgebung, Eingabe), in eine Datei
//     oder in eine vm. Hält er ihn nur als Konstante, führt ihn niemand aus. (Nicht gesehen: `eval`/`new Function` im Prozess selbst,
//     IPC und stdout — dorthin gießt unter scripts/ am 10.11. keine Stelle einen beim Laden gelesenen Text.)
//   · `skripte`: jedes geladene Skript (Modul des Prozesses, Skript der Seite). Sein KOPF-CODE (alles außerhalb seiner Funktionen:
//     Tafeln, Konstanten, `module.exports`) zählt, sobald es geladen ist — die Faltung der Maschine liest ihn aus dem Parser, nie aus
//     der Coverage: V8 verliert die Skript-Funktion nach der GC (10.11., diag-kopplung an 900c28e6: 9 von 88 Skripten der Seite ohne
//     Eintrag, stamm/gelaende-boden.js ohne seine Skript-Funktion), und mit ihr jede nie gerufene Funktion darunter.
//   · `ganz`: eine Datei, die der Prozess als Text oder Daten SYNCHRON las (readFileSync: JSON, Tafel, ein Text-Scan; das Laden eines
//     Moduls ist kein Text-Lesen, seine Bereiche nennt die Coverage). Asynchrones Lesen ist in diesem Baum das Ausliefern eines
//     Servers (save-server.js, statikServer) und zählt nie: was die Seite lud, nennt die Seite.
//   · `geladen`: ein gelesenes Verzeichnis „pfad/“ („pfad/**“ rekursiv) — eine Datei, die dort dazukommt oder fällt, ändert den Lauf.
//   · `blind`: ein Kind (node, eine Shell), das der Prozess mit einer Umgebung OHNE den Zeugen startete — sein Code bliebe ungenannt.
//   · `npm`: der Prozess IST npm (npm-cli, npx) — nur dann zählt das Befehls-Verzeichnis `scripts` der package.json (jeder Prozess
//     mit puppeteer liest package.json für dessen Einstellung; eine Skript-Zeile mehr ändert seinen Lauf nicht).
//   · DIE SEITE (nur mit PUNKTE_KONSUM_SEITE=1: nie an einer Zeit-Station, nie in der Welt der Sitzung): die Precise Coverage je
//     Funktion jeder Seite und jedes Workers — angeheftet, BEVOR das Ziel läuft (puppeteer schickt runIfWaitingForDebugger nach
//     `sessionattached`) —, ein Skript über das Netz (`geladen`), eine Datei als Text oder Daten (`ganz`: fetch, JSON, Bild, Dokument)
//     und ein Funktions-Text, den die Seite las. Gemessen (10.11., headless): der Zähl-Modus (callCount) nimmt TurboFan — Faktor 2,5
//     auf ruf-lastigem Code —, der Binär-Modus +15 % dort und nichts Messbares an der Last des Spiels (26.10.: 31,6 → 31,7 ms), die
//     Wanduhr eines Boot-lastigen Laufs +7…22 %: darum trägt eine Station mit Zeit-Urteil die Seite nie (ihr Spiel-Pfad urteilt
//     weiter nach dem Glob, `seite: false` beim Namen). Startet ein Prozess einen Browser ohne den Seiten-Zeugen, sagt er es (`browser`).
// DIE FENSTER (die Welt der Sitzung lebt über viele Proben): legt der Läufer `nimm.<k>` in den Ordner, schreibt jeder lebende Prozess
// `<id>.seg.<k>.json` — was er SEIT der letzten Nahme ausführte — und beginnt die Coverage neu (stop + start: der Binär-Modus meldet
// eine Funktion sonst nur beim ersten Mal; gemessen an Node 22). `skripte`, `ganz`, `geladen` und jeder gelesene oder ausgegebene
// Funktions-Text bleiben über die Fenster stehen (ein geladenes Modul, eine gelesene Tafel und eine Funktion, die einmal in der Seite
// liegt, wirken in jedem späteren Fenster).
// Je Prozess `<id>.offen` beim Start und `<id>.json` am Ende = { js: { pfad: { len, bereiche: [[von, bis)] } }, skripte, geladen, ganz,
// warum, browser, seite } (Zeichen-Offsets der Datei im Baum) — ein `.offen` ohne Ende (hart getötet) macht den Konsum der Station ungültig, nie still
// klein. Pfade relativ zum Spiel-Baum PUNKTE_KONSUM_BAUM, ohne node_modules. Er ändert keine Ausgabe.
"use strict";
const KONSUM = process.env.PUNKTE_KONSUM;
const BAUM = process.env.PUNKTE_KONSUM_BAUM;
if (KONSUM && BAUM) {
    const fs = require("fs");
    const path = require("path");
    const { fileURLToPath, pathToFileURL } = require("url");
    const Module = require("module");
    const faden = require("worker_threads");
    const SEITE = process.env.PUNKTE_KONSUM_SEITE === "1";
    const ICH = process.pid + (faden.isMainThread ? "" : "-" + faden.threadId);
    const { readFileSync: lies, readdirSync: liste, writeFileSync: schreibe, existsSync: gibt } = fs;
    const konsum = { js: new Map(), skripte: new Set(), geladen: new Set(), ganz: new Set(), texte: new Set(), wartend: new Set(), ziele: new Set(), browser: false, warum: {}, blind: [] };
    // DIE AUSGABE: jeder Text, den der Prozess aus der Hand gibt — trägt er einen beim Laden gelesenen Funktions-Text, zählt der als ausgeführt
    const { createHash } = require("crypto");
    const gesehen = new Set();
    const ausgabe = (x) => {
        if (!konsum.wartend.size || x == null) return;
        if (typeof x !== "string") {
            if (Buffer.isBuffer(x) && x.length < 4 << 20) return ausgabe(x.toString("utf8"));
            if (Array.isArray(x)) return x.forEach(ausgabe);
            if (typeof x === "object") for (const k of Object.keys(x)) ausgabe(x[k]);
            return;
        }
        if (x.length < 13) return;
        const k = x.length > 256 ? createHash("sha1").update(x).digest("base64") : x;
        if (gesehen.has(k)) return;
        gesehen.add(k);
        for (const t of konsum.wartend) if (t.length <= x.length && x.includes(t)) (konsum.wartend.delete(t), konsum.texte.add(t));
        // ein JSON-Rumpf trägt den Text verpackt
        if (konsum.wartend.size && /^\s*[[{]/.test(x)) try { ausgabe(JSON.parse(x)); } catch (_e) { /* kein JSON */ }
    };
    // eine Datei zählt GANZ — mit dem ersten Grund beim Namen (`warum`, die Faltung zählt ihn)
    const ganz = (p, grund) => (konsum.ganz.add(p), (konsum.warum[p] = konsum.warum[p] || grund));
    const relativ = (abs) => path.relative(BAUM, abs).split(path.sep).join("/");
    const imBaum = (p) => p !== "" && !/^(\.\.|node_modules(\/|$)|\.git(\/|$))/.test(p) && !path.isAbsolute(p);
    const pfadCache = new Map();
    const pfadVon = (wo) => {
        if (pfadCache.has(wo)) return pfadCache.get(wo);
        let p = null;
        try {
            const u = new URL(wo);
            if (u.protocol === "file:") p = relativ(fileURLToPath(u));
            else if (/^https?:$/.test(u.protocol) && /^(127\.0\.0\.1|localhost)$/.test(u.hostname))
                p = decodeURIComponent(u.pathname).slice(1) || "index.html";
        } catch (_e) {
            p = null;
        }
        p = p && imBaum(p) && gibt(path.join(BAUM, p)) ? p : null;
        pfadCache.set(wo, p);
        return p;
    };
    // die Datei im Baum: ihre Länge in Zeichen ist das Maß der Offsets; eine Datei mit BOM zählt ganz
    const eintrag = (p) => {
        if (!konsum.js.has(p)) {
            let len = -1, text = "";
            try {
                text = lies(path.join(BAUM, p), "utf8");
                len = text.charCodeAt(0) === 0xfeff ? -1 : text.length;
            } catch (_e) {
                len = -1;
            }
            konsum.js.set(p, len < 0 ? null : { len, an: new Uint8Array(len), text });
        }
        const e = konsum.js.get(p);
        if (!e) ganz(p, "nicht lesbar oder BOM");
        return e;
    };
    // die Coverage eines Isolats: je Skript die Bereiche nach Größe, der innere übermalt den äußeren (count 0 = nie ausgeführt; V8
    // nennt eine nie gerufene Funktion genau dann, wenn ihre Eltern-Funktion lief). Jedes Skript, das die Coverage nennt, ist geladen
    const male = (skripte) => {
        for (const s of skripte) {
            const p = pfadVon(s.url);
            if (!p) continue;
            if (!/\.[cm]?js$/.test(p)) {
                ganz(p, "Inline-Skript"); // ein Inline-Skript zählt sein Dokument ganz
                continue;
            }
            konsum.skripte.add(p);
            const r = s.functions.flatMap((f) => f.ranges);
            if (!r.some((x) => x.count > 0)) continue;
            const e = eintrag(p, null);
            if (!e) continue;
            if (r.some((x) => x.endOffset > e.len)) {
                ganz(p, "Bereich hinter dem Ende der Datei (" + e.len + " Zeichen)");
                konsum.js.set(p, null);
                continue;
            }
            const neu = new Uint8Array(e.len);
            r.sort((a, b) => b.endOffset - b.startOffset - (a.endOffset - a.startOffset));
            for (const x of r) neu.fill(x.count > 0 ? 1 : 0, x.startOffset, x.endOffset);
            for (let i = 0; i < e.len; i++) e.an[i] |= neu[i];
        }
    };

    // ── die Seite (PUNKTE_KONSUM_SEITE): je Isolat EINE Sitzung (die angehefteten Kinder: die Seite unter ihrem Tab, Worker, Frames)
    const TEXT = `(() => { const b = globalThis.__punkteKonsumText, o = Function.prototype.toString, schon = new Set(); if (b)
        Object.defineProperty(Function.prototype, "toString", { configurable: true, writable: true, value: function toString() {
            const t = o.call(this); if (!schon.has(t)) (schon.add(t), b(t)); return t; } }); })()`;
    const netz = (e) => {
        const p = pfadVon(e.request.url);
        if (p) /\.[cm]?js$/.test(p) && !/^(Fetch|XHR)$/.test(e.type) ? konsum.skripte.add(p) : ganz(p, "Netz " + e.type);
    };
    const ziel = (s, seite) => {
        if (s.parentSession() === s && !seite) return;
        const z = { s, seite, skripte: new Map(), zu: false };
        konsum.ziele.add(z);
        // ein Skript der Seite: geladen; lieferte der Server andere Bytes als die Datei im Baum (`wandle` des Statik-Servers), zählt es ganz
        s.on("Debugger.scriptParsed", (e) => {
            if (!e.url) return;
            z.skripte.set(e.scriptId, e.url);
            const p = pfadVon(e.url);
            if (!p || !/\.[cm]?js$/.test(p)) return;
            konsum.skripte.add(p);
            const d = eintrag(p, null);
            if (d && e.length != null && e.length !== d.len) (ganz(p, "Länge des Skripts " + e.length + " ≠ Datei " + d.len), konsum.js.set(p, null));
        });
        s.on("Network.requestWillBeSent", netz);
        s.on("Runtime.bindingCalled", (e) => e.name === "__punkteKonsumText" && konsum.texte.add(e.payload));
        for (const [m, p] of [
            ["Profiler.enable"],
            ["Profiler.startPreciseCoverage", { callCount: false, detailed: false }],
            ["Debugger.enable"],
            ["Debugger.setSkipAllPauses", { skip: true }],
            ["Network.enable"],
            ["Runtime.addBinding", { name: "__punkteKonsumText" }],
            ["Page.addScriptToEvaluateOnNewDocument", { source: TEXT }],
        ])
            s.send(m, p).catch(() => {});
    };
    // ein Ziel, das ohne Nahme ging (ein beendeter Worker, ein Prozess-Ende ohne Schließen des Browsers): was es nach seiner letzten
    // Nahme ausführte, kennt niemand — jedes seiner Skripte zählt ganz
    const verloren = (z) => {
        for (const u of z.skripte.values()) if (pfadVon(u)) ganz(pfadVon(u), "Ziel ohne Nahme");
    };
    const nimm = async () => {
        for (const z of konsum.ziele)
            if (!z.s.detached)
                try {
                    male((await z.s.send("Profiler.takePreciseCoverage")).result);
                } catch (_e) {
                    verloren(z);
                }
    };
    // vor jedem Schritt der Linse, der Ziele beendet (die Seite schließt; sie lädt neu: ihre Fäden enden mit dem alten Dokument), die Nahme
    const seiten = new WeakSet();
    const seitenZu = (P) => {
        if (seiten.has(P)) return;
        seiten.add(P);
        for (const weg of ["goto", "reload", "setContent", "goBack", "goForward"]) {
            const alt = P[weg];
            if (typeof alt === "function") P[weg] = async function (...a) { await nimm(); return alt.apply(this, a); };
        }
        const zu = P.close;
        P.close = async function (...a) {
            await nimm();
            const c = this._client();
            for (const z of konsum.ziele) z.zu ||= z.s === c || z.s.parentSession() === c || z.seite === this;
            return zu.apply(this, a);
        };
    };
    const anBrowser = async (browser) => {
        const verbindung = (await browser.target().createCDPSession()).connection();
        verbindung.on("sessionattached", (s) => ziel(s));
        verbindung.on("sessiondetached", (s) => {
            for (const z of konsum.ziele) if (z.s === s) (konsum.ziele.delete(z), z.zu || verbindung.zu || verloren(z));
        });
        for (const t of browser.targets())
            if (t.type() === "page") {
                const p = await t.page();
                ziel(await t.createCDPSession(), p);
                seitenZu(Object.getPrototypeOf(p));
            }
        browser.on("targetcreated", (t) => t.type() === "page" && t.page().then((p) => p && seitenZu(Object.getPrototypeOf(p)), () => {}));
        const zu = browser.close.bind(browser);
        browser.close = async (...a) => {
            await nimm();
            verbindung.zu = true;
            for (const z of konsum.ziele) z.zu = true;
            return zu(...a);
        };
        return browser;
    };
    // was der Prozess an eine Seite gibt, geht durch die EINE `send` der CDP-Sitzungen (ihr Prototyp, einmal gefasst)
    let cdpGefasst = false;
    const cdpAusgabe = async (browser) => {
        if (cdpGefasst) return;
        try {
            const s = await browser.target().createCDPSession();
            const P = Object.getPrototypeOf(s), send = P.send;
            P.send = function (methode, params) {
                if (params && konsum.wartend.size) ausgabe(params);
                return send.apply(this, arguments);
            };
            cdpGefasst = true;
            await s.detach().catch(() => {});
        } catch (_e) {
            // ohne die send der Sitzungen bleibt die Ausgabe an die Seite ungesehen: jeder wartende Text zählt (stueck)
            konsum.cdpBlind = true;
        }
    };
    // jeder puppeteer, den ein Modul lädt (die Bündel-Datei und ihr Standard-Objekt tragen je ein gebundenes launch): der Start eines
    // Browsers ist beim Namen (`browser`), mit dem Seiten-Zeugen trägt er die Coverage jeder Seite
    const laden = Module._load;
    const gefasst = new WeakSet();
    Module._load = function () {
        const m = laden.apply(this, arguments);
        for (const o of [m, m && m.default])
            if (o && typeof o.launch === "function" && typeof o.executablePath === "function" && !gefasst.has(o)) {
                gefasst.add(o);
                for (const weg of ["launch", "connect"]) {
                    const start = o[weg];
                    if (typeof start !== "function") continue;
                    o[weg] = async (...a) => {
                        konsum.browser = true;
                        const b = await start.apply(o, a);
                        await cdpAusgabe(b);
                        return SEITE ? anBrowser(b) : b;
                    };
                }
            }
        return m;
    };

    // ── der Node-Prozess: Coverage ab hier, Text-Lesen, Verzeichnisse und gelesene Funktions-Texte
    fs.mkdirSync(KONSUM, { recursive: true });
    schreibe(path.join(KONSUM, ICH + ".offen"), "");
    const sitz = new (require("inspector").Session)();
    sitz.connect();
    sitz.post("Profiler.enable");
    const beginne = () => sitz.post("Profiler.startPreciseCoverage", { callCount: false, detailed: false });
    beginne();
    const modul = new Set();
    let ladeTiefe = 0; // > 0: der Kopf-Code eines Moduls läuft gerade
    for (const x of [".js", ".cjs"].filter((e) => Module._extensions[e])) {
        const o = Module._extensions[x];
        Module._extensions[x] = function (m, f) {
            modul.add(f);
            const p = pfadVon(pathToFileURL(f).href);
            if (p) konsum.skripte.add(p);
            ladeTiefe++;
            try {
                return o.apply(this, arguments);
            } finally {
                ladeTiefe--;
            }
        };
    }
    const wo = (f) => (typeof f === "string" || f instanceof URL ? path.resolve(f instanceof URL ? fileURLToPath(f) : f) : null);
    fs.readFileSync = function (f) {
        const r = lies.apply(this, arguments);
        const p = wo(f) && !modul.delete(wo(f)) && pfadVon(pathToFileURL(wo(f)).href);
        if (p) ganz(p, "gelesen");
        return r;
    };
    fs.readdirSync = function (d) {
        const r = liste.apply(this, arguments);
        const p = wo(d) && relativ(wo(d));
        const tief = arguments[1] && arguments[1].recursive ? "**" : "";
        if (p != null && (p === "" || imBaum(p))) konsum.geladen.add((p || ".") + "/" + tief);
        return r;
    };
    const textVon = Function.prototype.toString;
    Object.defineProperty(Function.prototype, "toString", { configurable: true, writable: true, value: function toString() {
        const t = textVon.call(this);
        if (t.length > 12 && !konsum.texte.has(t) && !t.endsWith("{ [native code] }")) (ladeTiefe > 0 ? konsum.wartend : konsum.texte).add(t);
        return t;
    } });
    // DIE AUSGÄNGE des Prozesses neben der Seite: eine Datei, eine vm, ein Dienst (HTTP-Rumpf, fetch), eine Antwort des eigenen Servers
    for (const weg of ["writeFileSync", "appendFileSync", "writeFile", "appendFile"]) {
        const alt = fs[weg];
        fs[weg] = function (_f, daten) { ausgabe(daten); return alt.apply(this, arguments); };
    }
    for (const weg of ["writeFile", "appendFile"]) {
        const alt = fs.promises[weg];
        fs.promises[weg] = function (_f, daten) { ausgabe(daten); return alt.apply(this, arguments); };
    }
    const vm = require("vm");
    for (const weg of ["runInContext", "runInNewContext", "runInThisContext", "compileFunction"]) {
        const alt = vm[weg];
        vm[weg] = function (code) { ausgabe(code); return alt.apply(this, arguments); };
    }
    vm.Script = new Proxy(vm.Script, { construct(Z, a, neu) { ausgabe(a[0]); return Reflect.construct(Z, a, neu); } });
    const http = require("http");
    for (const K of [http.ClientRequest, http.ServerResponse])
        for (const weg of ["write", "end"]) {
            const alt = K.prototype[weg];
            K.prototype[weg] = function (stueck) { if (typeof stueck === "string" || (K === http.ClientRequest && Buffer.isBuffer(stueck))) ausgabe(stueck); return alt.apply(this, arguments); };
        }
    if (typeof globalThis.fetch === "function") {
        const hole = globalThis.fetch;
        globalThis.fetch = function (_u, o) { if (o && o.body) ausgabe(o.body); return hole.apply(this, arguments); };
    }

    // EINE NAHME des Node-Prozesses → das Roh-Stück; `neu`: das Fenster schließt, die Coverage beginnt neu (die Bereiche des Fensters
    // fallen; die geladenen Skripte, das Gelesene und die Verzeichnisse bleiben)
    const stueck = (neu) => {
        sitz.post("Profiler.takePreciseCoverage", (e, r) => r && male(r.result));
        // die gelesenen Funktions-Texte an ihrem Ort im Baum: je Text EINMAL gesucht (in jedem geladenen Skript), in jedem Stück gemalt
        for (const p of konsum.skripte) eintrag(p);
        for (const t of [...konsum.texte, ...(konsum.cdpBlind ? konsum.wartend : [])]) {
            if (gesucht.has(t)) continue;
            gesucht.add(t);
            for (const [p, e] of konsum.js) if (e) for (let i = e.text.indexOf(t); i >= 0; i = e.text.indexOf(t, i + 1)) textOrte.push([e, i, i + t.length]);
        }
        for (const [e, a, b] of textOrte) e.an.fill(1, a, b);
        const js = {};
        for (const [p, e] of konsum.js) {
            if (!e) continue;
            const b = [];
            for (let i = 0; i < e.len; i++) if (e.an[i]) b.length && b[b.length - 1][1] === i ? b[b.length - 1][1]++ : b.push([i, i + 1]);
            if (b.length) js[p] = { len: e.len, bereiche: b };
        }
        if (neu) {
            sitz.post("Profiler.stopPreciseCoverage");
            beginne();
            // die gelesenen und ausgegebenen Funktions-Texte bleiben stehen: was einmal in der Seite liegt, wirkt in jedem späteren Fenster
            for (const e of konsum.js.values()) if (e) e.an.fill(0);
        }
        return JSON.stringify({ js, skripte: [...konsum.skripte], geladen: [...konsum.geladen], ganz: [...konsum.ganz], warum: konsum.warum, browser: konsum.browser, seite: SEITE,
            npm: /(^|[\\/])(npm-cli\.js|npx-cli\.js|npm|npx)$/.test(process.argv[1] || ""), blind: konsum.blind });
    };
    const gesucht = new Set(), textOrte = [];
    let zu = false;
    function abschluss() {
        if (zu) return;
        zu = true;
        for (const z of konsum.ziele) if (!z.zu) verloren(z);
        schreibe(path.join(KONSUM, ICH + ".json"), stueck(false));
        fs.rmSync(path.join(KONSUM, ICH + ".offen"), { force: true });
    }
    // DER RUF DES LÄUFERS (fs.watch auf den Ordner, ohne den Prozess zu halten): `nimm.<k>` → das Fenster-Stück `<id>.seg.<k>.json`;
    // `<id>.bitte` → der Abschluss vor dem Töten (der Zeuge des Elternteils bittet das Kind vor `kill()`, bis 5 s)
    const beantwortet = new Set();
    const ruf = () => {
        if (zu) return;
        let da;
        try {
            da = liste(KONSUM);
        } catch (_e) {
            return;
        }
        for (const n of da) {
            const m = /^nimm\.([\w-]+)$/.exec(n);
            if (m && !beantwortet.has(n)) {
                beantwortet.add(n);
                const ziel = path.join(KONSUM, ICH + ".seg." + m[1] + ".json");
                schreibe(ziel + ".teil", stueck(true));
                fs.renameSync(ziel + ".teil", ziel);
            }
        }
        if (da.includes(ICH + ".bitte")) (abschluss(), fs.rmSync(path.join(KONSUM, ICH + ".bitte"), { force: true }));
    };
    try {
        fs.watch(KONSUM, { persistent: false }, ruf);
    } catch (_e) {
        // ohne Wache antwortet der Prozess keinem Ruf: der Läufer nennt ihn beim Namen (kein Fenster-Stück)
    }
    if (faden.isMainThread) {
        // EIN KIND OHNE ZEUGEN: startet der Prozess node oder eine Shell mit einer Umgebung, die den Zeugen nicht trägt, läuft dort Code,
        // den niemand nennt — beim Namen (`blind`; die Faltung der Maschine verwirft dann den Konsum des Laufs, nie still klein)
        const kp = require("child_process");
        const traegt = (env) => !env || (env.PUNKTE_KONSUM === KONSUM && /konsum-zeuge\.cjs/.test(env.NODE_OPTIONS || ""));
        const laeufer = (f) => /(^|[\\/])(node|nodejs|bash|sh|zsh|cmd|powershell|pwsh|npm|npx)(\.exe|\.cmd)?$/i.test(String(f || ""));
        const merke = (f, a) => konsum.blind.length < 8 && konsum.blind.push([f, ...(Array.isArray(a) ? a : [])].join(" ").slice(0, 160));
        const starte = kp.ChildProcess.prototype.spawn;
        kp.ChildProcess.prototype.spawn = function (o) {
            const env = o && Array.isArray(o.envPairs) ? Object.fromEntries(o.envPairs.map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)])) : null;
            if (o && laeufer(o.file) && !traegt(env)) merke(o.file, (o.args || []).slice(1));
            if (o) (ausgabe(o.args), ausgabe(env && Object.values(env).filter((v) => v.length > 64)));
            return starte.apply(this, arguments);
        };
        for (const weg of ["spawnSync", "execFileSync", "execSync"]) {
            const alt = kp[weg];
            kp[weg] = function (f, a, o) {
                const opt = [a, o].find((x) => x && typeof x === "object" && !Array.isArray(x));
                if (opt && opt.env && !traegt(opt.env) && (weg === "execSync" || opt.shell || laeufer(f))) merke(f, a);
                ausgabe(f), ausgabe(a), opt && (ausgabe(opt.input), opt.env && ausgabe(Object.values(opt.env).filter((v) => typeof v === "string" && v.length > 64)));
                return alt.apply(this, arguments);
            };
        }
        const toeten = require("child_process").ChildProcess.prototype.kill;
        const bitteVor = (pid) => {
            const bitte = path.join(KONSUM, pid + ".bitte");
            if (!gibt(path.join(KONSUM, pid + ".offen"))) return;
            schreibe(bitte, "");
            for (const frist = Date.now() + 5000; gibt(bitte) && Date.now() < frist; ) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
            fs.rmSync(bitte, { force: true });
        };
        require("child_process").ChildProcess.prototype.kill = function (...a) {
            if (this.pid && this.exitCode == null && a[0] !== 0) bitteVor(this.pid);
            return toeten.apply(this, a);
        };
        const stoss = process.kill;
        process.kill = function (pid, sig) {
            if (pid > 0 && pid !== process.pid && sig !== 0) bitteVor(pid);
            return stoss.apply(this, arguments);
        };
        for (const sig of ["SIGTERM", "SIGINT"])
            process.on(sig, function fang() {
                abschluss();
                if (process.listenerCount(sig) === 1) (process.removeListener(sig, fang), process.kill(process.pid, sig));
            });
    }
    process.on("exit", () => abschluss());
}
