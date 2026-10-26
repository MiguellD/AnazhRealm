// DER ZEUGE DES KONSUMS (R6 in punkte.cjs): der Läufer lädt diese Datei in JEDEN node-Prozess der Station (NODE_OPTIONS
// --require, wie gpu-zeuge.cjs) — an jedem SHA, in jede Linse und die Werkbank, in jeden Browser, den ein Prozess startet.
// Er nennt, was die Station WIRKLICH ausführte und las:
//   · die Precise Coverage (callCount false, detailed true) jeder Seite und jedes Workers — angeheftet, BEVOR das Ziel läuft
//     (puppeteer schickt runIfWaitingForDebugger nach `sessionattached`) — und des Node-Prozesses selbst ab dem Start;
//   · `geladen`: ein Skript über das Netz (zählt über seine Bereiche, ohne sie ganz) und ein gelesenes Verzeichnis „pfad/“
//     („pfad/**“ rekursiv);
//   · `ganz`: eine Datei als Text oder Daten (fetch, JSON, Bild, Dokument, readFileSync) und jedes Skript eines Ziels, das ohne
//     Coverage ging (ein Worker endete, ein Prozess-Wechsel, ein Ende ohne Schließen);
//   · ein Funktions-Text, den eine Seite las (toString, __codeOf), zählt als ausgeführt.
// Je Prozess `<pid>.offen` beim Start und `<pid>.json` = { js: { pfad: { len, bereiche: [[von, bis)] } }, geladen, ganz }
// (Zeichen-Offsets der ausgelieferten Datei) am Ende — ein `.offen` ohne Ende (getötet) macht den Konsum der Station ungültig,
// nie still klein. Pfade relativ zum Spiel-Baum PUNKTE_KONSUM_BAUM, ohne node_modules. Er ändert keine Ausgabe.
"use strict";
const KONSUM = process.env.PUNKTE_KONSUM;
const BAUM = process.env.PUNKTE_KONSUM_BAUM;
if (KONSUM && BAUM) {
    const fs = require("fs");
    const path = require("path");
    const { fileURLToPath, pathToFileURL } = require("url");
    const Module = require("module");
    const { readFileSync: lies, readdirSync: liste, writeFileSync: schreibe } = fs;
    const konsum = { js: new Map(), geladen: new Set(), ganz: new Set(), texte: new Set(), ziele: new Set() };
    const relativ = (abs) => path.relative(BAUM, abs).split(path.sep).join("/");
    const imBaum = (p) => p !== "" && !/^(\.\.|node_modules(\/|$))/.test(p) && !path.isAbsolute(p);
    const pfadVon = (wo) => {
        let p;
        try {
            const u = new URL(wo);
            if (u.protocol === "file:") p = relativ(fileURLToPath(u));
            else if (/^https?:$/.test(u.protocol) && /^(127\.0\.0\.1|localhost)$/.test(u.hostname))
                p = decodeURIComponent(u.pathname).slice(1) || "index.html";
            else return null;
        } catch (_e) {
            return null;
        }
        return imBaum(p) && fs.existsSync(path.join(BAUM, p)) ? p : null;
    };
    const eintrag = (p, len) => {
        if (!konsum.js.has(p)) konsum.js.set(p, { len, an: new Uint8Array(len) });
        const e = konsum.js.get(p);
        return e.len === len ? e : (konsum.ganz.add(p), null);
    };
    // die Coverage eines Isolats: je Skript die Bereiche nach Größe, der innere übermalt den äußeren (count 0 = nie ausgeführt);
    // eine zweite Nahme trägt nur das Neue — die Vereinigung hält alles
    const male = (skripte) => {
        for (const s of skripte) {
            const p = pfadVon(s.url);
            if (!p) continue;
            if (!/\.[cm]?js$/.test(p)) {
                konsum.ganz.add(p); // ein Inline-Skript zählt sein Dokument ganz
                continue;
            }
            const r = s.functions.flatMap((f) => f.ranges);
            const len = Math.max(0, ...r.map((x) => x.endOffset));
            const e = eintrag(p, len);
            if (!e) continue;
            const neu = new Uint8Array(len);
            r.sort((a, b) => b.endOffset - b.startOffset - (a.endOffset - a.startOffset));
            for (const x of r) neu.fill(x.count > 0 ? 1 : 0, x.startOffset, x.endOffset);
            for (let i = 0; i < len; i++) e.an[i] |= neu[i];
        }
    };

    // ── der Browser: je Isolat EINE Sitzung (die angehefteten Kinder: die Seite unter ihrem Tab, Worker, Frames) — die Nahme
    // einer zweiten Sitzung am selben Isolat trüge nur das Delta
    const TEXT = `(() => { const b = globalThis.__punkteKonsumText, o = Function.prototype.toString, schon = new Set(); if (b)
        Object.defineProperty(Function.prototype, "toString", { configurable: true, writable: true, value: function toString() {
            const t = o.call(this); if (!schon.has(t)) (schon.add(t), b(t)); return t; } }); })()`;
    const netz = (e) => {
        const p = pfadVon(e.request.url);
        if (p) konsum[/\.[cm]?js$/.test(p) && !/^(Fetch|XHR)$/.test(e.type) ? "geladen" : "ganz"].add(p);
    };
    const ziel = (s, seite) => {
        if (s.parentSession() === s && !seite) return;
        const z = { s, seite, skripte: new Map(), gesehen: new Set(), zu: false };
        konsum.ziele.add(z);
        s.on("Debugger.scriptParsed", (e) => e.url && z.skripte.set(e.scriptId, e.url));
        s.on("Network.requestWillBeSent", netz);
        s.on("Runtime.bindingCalled", (e) => e.name === "__punkteKonsumText" && konsum.texte.add(e.payload));
        for (const [m, p] of [
            ["Profiler.enable"],
            ["Profiler.startPreciseCoverage", { callCount: false, detailed: true }],
            ["Debugger.enable"],
            ["Network.enable"],
            ["Runtime.addBinding", { name: "__punkteKonsumText" }],
            ["Page.addScriptToEvaluateOnNewDocument", { source: TEXT }],
        ])
            s.send(m, p).catch(() => {});
    };
    // ein Skript, das die Coverage nie trug, zählt ganz; `alle`: das Ziel ging außerhalb eines Schließens (ein beendeter
    // Worker) — was es nach seiner letzten Nahme ausführte, kennt niemand
    const verloren = (z, alle) => {
        for (const [id, u] of z.skripte) if ((alle || !z.gesehen.has(id)) && pfadVon(u)) konsum.ganz.add(pfadVon(u));
    };
    const nimm = async () => {
        for (const z of konsum.ziele)
            if (!z.s.detached)
                try {
                    const r = (await z.s.send("Profiler.takePreciseCoverage")).result;
                    male(r);
                    for (const x of r) z.gesehen.add(x.scriptId);
                } catch (_e) {
                    // ein Ziel im Abbau: seine ungenommenen Skripte fallen ganz
                }
    };
    const seiten = new WeakSet();
    const seitenZu = (P) => {
        if (seiten.has(P)) return;
        seiten.add(P);
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
            for (const z of konsum.ziele) if (z.s === s) (konsum.ziele.delete(z), verloren(z, !z.zu && !verbindung.zu));
        });
        for (const t of browser.targets())
            if (t.type() === "page") {
                const p = await t.page();
                ziel(await t.createCDPSession(), p);
                seitenZu(Object.getPrototypeOf(p));
            }
        browser.on("targetcreated", (t) => t.type() === "page" && t.page().then((p) => p && seitenZu(Object.getPrototypeOf(p)), () => {}));
        const zu = browser.close.bind(browser);
        browser.close = async (...a) => (await nimm(), (verbindung.zu = true), zu(...a));
        return browser;
    };
    // jeder puppeteer, den ein Modul lädt (die Bündel-Datei und ihr Standard-Objekt tragen je ein gebundenes launch)
    const laden = Module._load;
    const gefasst = new WeakSet();
    Module._load = function () {
        const m = laden.apply(this, arguments);
        for (const o of [m, m && m.default])
            if (o && typeof o.launch === "function" && typeof o.executablePath === "function" && !gefasst.has(o)) {
                gefasst.add(o);
                const start = o.launch;
                o.launch = async (...a) => anBrowser(await start.apply(o, a));
            }
        return m;
    };

    // ── der Node-Prozess: Coverage ab hier, Text-Lesen und Verzeichnisse — das Laden eines Moduls ist kein Text-Lesen (seine
    // Bereiche nennt die Coverage)
    fs.mkdirSync(KONSUM, { recursive: true });
    schreibe(path.join(KONSUM, process.pid + ".offen"), "");
    const sitz = new (require("inspector").Session)();
    sitz.connect();
    sitz.post("Profiler.enable");
    sitz.post("Profiler.startPreciseCoverage", { callCount: false, detailed: true });
    const modul = new Set();
    for (const x of [".js", ".cjs"].filter((e) => Module._extensions[e])) {
        const o = Module._extensions[x];
        Module._extensions[x] = function (m, f) {
            modul.add(f);
            return o.apply(this, arguments);
        };
    }
    const wo = (f) => (typeof f === "string" || f instanceof URL ? path.resolve(f instanceof URL ? fileURLToPath(f) : f) : null);
    fs.readFileSync = function (f) {
        const r = lies.apply(this, arguments);
        const p = wo(f) && !modul.delete(wo(f)) && pfadVon(pathToFileURL(wo(f)).href);
        if (p) konsum.ganz.add(p);
        return r;
    };
    fs.readdirSync = function (d) {
        const r = liste.apply(this, arguments);
        const p = wo(d) && relativ(wo(d));
        const tief = arguments[1] && arguments[1].recursive ? "**" : "";
        if (p !== null && (p === "" || imBaum(p))) konsum.geladen.add((p || ".") + "/" + tief);
        return r;
    };
    process.on("exit", () => {
        sitz.post("Profiler.takePreciseCoverage", (e, r) => r && male(r.result));
        for (const z of konsum.ziele) verloren(z, false);
        const texte = [...konsum.texte];
        const js = {};
        for (const [p, e] of konsum.js) {
            const q = lies(path.join(BAUM, p), "utf8");
            if (q.length === e.len)
                for (const t of texte) for (let i = q.indexOf(t); i >= 0; i = q.indexOf(t, i + 1)) e.an.fill(1, i, i + t.length);
            const b = [];
            for (let i = 0; i < e.len; i++) if (e.an[i]) b.length && b[b.length - 1][1] === i ? b[b.length - 1][1]++ : b.push([i, i + 1]);
            js[p] = { len: e.len, bereiche: b };
        }
        schreibe(path.join(KONSUM, process.pid + ".json"), JSON.stringify({ js, geladen: [...konsum.geladen], ganz: [...konsum.ganz] }));
        fs.rmSync(path.join(KONSUM, process.pid + ".offen"), { force: true });
    });
}
