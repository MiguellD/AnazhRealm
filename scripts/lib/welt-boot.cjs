// welt-boot.cjs — DER EINE WELT-BOOT jeder Linse: Server, Browser und Fehler-Sammler leben EINMAL:
//   statikServer()   der Statik-Server der Welt (Wurzel des Repos, `/` → index.html, nie aus der Wurzel heraus)
//   starteBrowser()  der Browser über die EINE Adapter-Weiche (Rezepte: null · webgl · linse · echt, software-gpu.cjs)
//                    + der FEHLER-SAMMLER an jeder Seite: pageerror (auch unbehandelte Rejections), console.error,
//                    Absturz der Seite, Trennung des Browsers ohne Abbau — jeder Fehler macht den Lauf ROT mit Namen,
//                    nie Exit 0 (die Wache sitzt am Prozess-Ende: ein Exit 0 mit gesammeltem Fehler wird Exit 1)
//   oeffneWelt()     Seite laden und auf die Welt warten (anazhRealm mit _gameLoopTick), wahlweise Null-Renderer
//   halteBis()       eine Taste halten, bis ihr Ereignis eintritt (nie nach der Wanduhr, gate:apparat Klinge 5)
//   buehne()         die Bühne (Mittag · Sonne · Sommer, scripts/lib/ausgabe-aufnahme.cjs)
//   uferStellen      (Seite) ein Leser der Szenen-Tiefe im Blick, der zeichnet: das Wasser am Bach der Mess-Wiese
//   DIE STALL-AKTE   (K67) jede Seite trägt einen Puls (1 s) und Stempel (Programm-/Pipeline-Bau, synchrone GL-Rückfragen);
//                    steht der Puls ≥ 20 s oder läuft ein Seiten-Aufruf in seine Frist, schreibt die Lib die Akte ins Log:
//                    offene Aufrufe, letzter Puls mit Phase, Stempel, CPU je Prozess (unter Linux die Fäden des GPU-
//                    Prozesses: swiftshader-Raster `Thread<NN>`, CrGpuMain, ANGLE-Link), der JS-Stapel (Debugger.pause),
//                    Konsole, Chrome-Stderr und das URTEIL (JS-SCHLEIFE · NATIV · GPU-PROZESS · VERKLEMMUNG · AWAIT)
//                    — `node scripts/lib/welt-boot.cjs --selbsttest` (gate:welt-boot) beweist, dass sie den Täter nennt
// Die Wand: gate:altlasten DIE BOOT-WAND — ein Start außerhalb dieser Datei ist ROT, die Liste der noch eigenen Starts
// darf nur schrumpfen.
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { linsenWebGpuArgs, linsenWebglArgs, echteWebGpuArgs, adapterZeile, zeitZeile } = require("./software-gpu.cjs");
const { ohneKommentare, ast, wandere, zeileVon } = require("./stamm.cjs");

// DAS EINE __codeOf (PFLICHT-OFFEN D3): jede Seite jedes Welt-Boots trägt vor ihrem ersten Skript `window.__codeOf` (der
// Code einer Funktion oder eines Quelltexts ohne Kommentare: der EINE Stripper aus stamm.cjs, als Text übertragen) und
// `window.__dokuOf` (ungestrippt, für Marker, die per Definition im Kommentar wohnen — nie rohes .toString(), gate:apparat).
// Bis D3a baute jede Linse ihr eigenes (18 Einbauten); die Wand: gate:betriebsgesetz STRIPPER-WAND.
// `window.__fehlt(fn, re)` ist der EINE Absenz-Helfer (D3d, Zwilling `stammLib.fehlt`): true = das Muster fehlt im Code ohne
// Kommentare, `fn` eine Funktion oder eine Liste davon; was keine Funktion ist, wirft (eine Absenz an einem Toten misst nichts).
// DAS EINE WARTEN DER LINSEN (K-WANDUHR, Lehre 26: eine Wand urteilt in Bau-Ereignissen, nie in Wanduhr-Sekunden) — drei
// Seiten-Funktionen, als Text in jede Seite (`WARTEN_SEITE`, in CODE_OF_SEITE und der Ausgabe-Aufnahme):
// `window.__seitenTakt()` ist der Takt der Seite: ein Bild ihres Loops, ruht er, ein Takt von Hand.
async function seitenTakt() {
    const r = window.anazhRealm;
    const vor = r._weltStand ? r._weltStand.takte : -1;
    await new Promise((ok) => requestAnimationFrame(ok));
    if ((r._weltStand ? r._weltStand.takte : -1) === vor) r._gameLoopTick(performance.now());
}
// DAS EINE EINSCHWINGEN jeder Linse (`await window.__weltStehtNach(takt, max)`): Takt um Takt, bis die Welt steht (A9
// `_weltSteht`) und das Buch da ist (`_bepflanzungWartet`) — nie eine eigene Heuristik (die Ring-Zahl
// steht, während die Nah-Wiese auf ihr Gras wartet). `takt(n)` ist der Takt der Linse; ohne ihn der Takt der Seite (ein Bild ihres Loops, ruht er,
// ein Takt). Mindestens ein Takt: ein Ortswechsel regt sich erst im Takt. Der Regler hält, solange sie schwingt — in JEDEM
// Pfad: sein Schritt weckt die Fege-Takte, und die Welt steht erst, wenn jeder seine Runde zu Ende ging (bis K-WANDUHR hielt
// er nur headless; unter swiftshader atmete der PID am Genesis-Ring, die Welt stand nie, CI 39439645378). Der Deckel `max`
// zählt nur Takte ohne Offenes (`_weltOffen`, das Buch); dann wirft er.
async function weltStehtNach(takt, max) {
    const r = window.anazhRealm;
    const st = r.state;
    const W = () => r._weltStand || {};
    const steht = () => r._weltSteht() && !r._bepflanzungWartet();
    const regler = st.perfRegulator;
    st.perfRegulator = false;
    let n = 0;
    try {
        for (let k = 0, o; !(n && steht()) && k < (max || 1800); n++) {
            await (takt || window.__seitenTakt)(n);
            o = r._weltOffen();
            if (!(o.foundry + o.chunks + o.wald) && !r._bepflanzungWartet()) k++;
            if (n % 5 === 4) await new Promise((ok) => setTimeout(ok, 10));
        }
    } finally {
        st.perfRegulator = regler;
    }
    if (!steht())
        throw new Error(
            `DIE WELT STEHT NICHT nach ${n} Takten: ` +
                (r._bepflanzungWartet() ? "das Buch fehlt" : `Ruhe ${W().ruhe | 0}, zuletzt brach sie: ${W().grund}`)
        );
    return n;
}
// DAS EINE WARTEN AUF EINEN BAU (`await window.__gebautNach(e, { takt, fertig, bau, max })`): Takt um Takt, bis der Bau steht
// (`fertig()`, sonst `_archIsRendered(e)`) — vor jedem Takt ruft `bau(n)` ihn (ein Eintrag ohne `bau`: `_rebuildArchitectureMesh(e)`,
// der Rewarm-Weg von Hand); `takt(n)` wie oben. `e` ist ein Eintrag oder der NAME dessen, was die Welt bauen soll (ein Asset,
// eine Stufe, ein Chunk — `fertig` sagt, wann es steht). Der Deckel `max` zählt nur Takte, in denen die Welt nichts offen hat
// (`_weltOffen`: Foundry, Chunks, Wald): solange sie baut, wartet die Linse auf ihr Ereignis, nie auf die Uhr; steht es danach
// nicht, wirft sie beim Namen (bis K-WANDUHR fuhr gate:fahr-leben F4 unter Last durch eine Kiefer ohne Körper, CI 39456065212,
// und 130 Schleifen urteilten nach 3–300 s Wanduhr).
async function gebautNach(e, { takt, fertig, bau, max, offen, warum } = {}) {
    const r = window.anazhRealm;
    const steht = fertig || (() => r._archIsRendered(e));
    const baue = bau || (e && typeof e === "object" ? () => r._rebuildArchitectureMesh(e) : () => {});
    let n = 0;
    try {
        for (
            const weiter = window.__deckel(
                typeof e === "string" ? e : e ? `${e.type}#${e.id}` : "kein Eintrag",
                max,
                offen
            );
            (baue(n), !steht()) && weiter();
            n++
        ) {
            await (takt || window.__seitenTakt)(n);
            await new Promise((ok) => setTimeout(ok)); // die Antwort des Workers landet zwischen zwei Takten
        }
    } catch (f) {
        // `warum()` nennt das Teil-Prädikat, das nicht steht
        if (warum) f.message += ` — ${warum()}`;
        throw f;
    }
    return n;
}
// DER EINE DECKEL jeder wartenden Schleife (`for (const weiter = window.__deckel(name, max, offen); weiter(); )`): je Gang
// zählt er nur, wenn die Welt nichts offen hat (`_weltOffen`) und die Linse nichts (`offen()`); nach `max` (120) solcher
// Gänge wirft er beim Namen — die Schleife wartet auf ihr Ereignis, nie auf die Uhr. `offen === false`: jeder Gang zählt (die
// Linse treibt ihren Takt selbst, ein ewig Offenes der Welt hält sie nicht).
function deckel(name, max, offen) {
    let n = 0,
        k = 0;
    return () => {
        const r = window.anazhRealm;
        const o = r && r._weltOffen ? r._weltOffen() : { foundry: 1, chunks: 0, wald: 0 };
        if ((offen === false || (!(o.foundry + o.chunks + o.wald) && !(offen && offen()))) && ++k > (max || 120))
            throw new Error(
                `DER BAU STEHT NICHT: ${name} nach ${n} Takten — ${offen === false ? "die Linse zählte jeden Gang" : "die Welt hat nichts mehr offen"}`
            );
        return ++n > 0;
    };
}
// DIE WELT IST DA (`await window.__weltDa((r) => bedingung)`): bis der Stamm lebt (`_gameLoopTick`) und die Bedingung gilt — ohne
// Frist: hängt der Boot, nennt ihn die Stall-Akte samt der Bedingung, auf die er wartet (`__weltDaWartet`, im Puls jeder
// Sekunde; bis K-WANDUHR trug jede Linse ihre Schleife mit 30–300 s Wanduhr, 34×).
async function weltDa(bed) {
    window.__weltDaWartet = bed ? String(bed).replace(/\s+/g, " ").slice(0, 160) : "den Stamm";
    for (let r; !((r = window.anazhRealm) && typeof r._gameLoopTick === "function" && (!bed || bed(r)));)
        await new Promise((ok) => setTimeout(ok, 50));
    window.__weltDaWartet = null;
    return window.anazhRealm;
}
const WARTEN_SEITE = `window.__seitenTakt = ${seitenTakt}; window.__weltStehtNach = ${weltStehtNach}; window.__gebautNach = ${gebautNach}; window.__deckel = ${deckel}; window.__weltDa = ${weltDa};`;
const CODE_OF_SEITE = `window.__codeOf = ((oK) => (f) => oK(String(f)))(${ohneKommentare}); window.__dokuOf = (f) => String(f); window.__fehlt = (f, re) => [].concat(f).every((g, i) => { if (typeof g !== "function") throw new Error("__fehlt: Glied " + i + " ist keine Funktion (" + typeof g + ") — die Absenz misst nichts"); re.lastIndex = 0; return !re.test(window.__codeOf(g)); }); ${WARTEN_SEITE}`;

const ROOT = path.resolve(__dirname, "..", "..");

const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

// Der Statik-Server: liefert die Datei unter der Wurzel (Query fällt), `/` heißt `start`; außerhalb der Wurzel 403, fehlt
// die Datei 404. `seiten` liefert eigene Seiten nach Pfad (Text, Puffer oder Funktion des Requests, auch als Promise; der
// Typ nach der Endung des Pfads, ohne Endung text/html), `keinCache` setzt no-store. `wandle(pfad, daten)` ist der EINE
// Haken der Selbsttests (Patch auf die Basis-Zeile, Überlagerung einer anderen Wurzel, Verzögerung): er bekommt die Bytes
// der Datei (null, wenn sie fehlt) und gibt die ausgelieferten zurück (auch als Promise; null heißt 404). Ein Wurf im Haken
// oder in einer Seite ist 500 und ein Fehler der Linse beim Namen (der Fehler-Sammler).
function statikServer({ root = ROOT, start = "/index.html", seiten = null, keinCache = false, wandle = null } = {}) {
    const bruch = (res, p, e) => {
        melde("server", `${p}: ${(e && (e.stack || e.message)) || e}`);
        res.statusCode = 500;
        res.end();
    };
    return http.createServer((req, res) => {
        let p;
        try {
            p = decodeURIComponent(req.url.split("?")[0]);
        } catch (_e) {
            res.statusCode = 400;
            return res.end();
        }
        if (seiten && Object.prototype.hasOwnProperty.call(seiten, p)) {
            const s = seiten[p];
            const typ = MIME[path.extname(p)] || "text/html";
            return Promise.resolve()
                .then(() => (typeof s === "function" ? s(req) : s))
                .then(
                    (inhalt) => (res.setHeader("Content-Type", typ), res.end(inhalt)),
                    (e) => bruch(res, p, e)
                );
        }
        if (p === "/") p = start;
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            const roh = err ? null : data;
            Promise.resolve()
                .then(() => (wandle ? wandle(p, roh) : roh))
                .then(
                    (inhalt) => {
                        if (inhalt == null) return ((res.statusCode = 404), res.end());
                        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
                        if (keinCache) res.setHeader("Cache-Control", "no-store");
                        res.end(inhalt);
                    },
                    (e) => bruch(res, p, e)
                );
        });
    });
}

// Die Browser-Rezepte. null: kein GPU-Prozess (die Seite setzt __anazhHeadlessNullRenderer) · webgl: WebGL2 an der
// Weiche (lokal ANGLE auf der Karte, die CI und jede Zeit-Linse swiftshader) · standard: Chromes eigene Wahl headless ·
// linse: WebGPU an der Weiche (lokal die Karte, die CI und jede Zeit-Linse swiftshader) · echt: der Hardware-Adapter.
// `zeit: true` sagt der Weiche: diese Linse urteilt über eine Zeit (K39-2, software-gpu.cjs DIE ZEIT-ACHSE).
const REZEPTE = {
    null: () => ["--no-sandbox", "--disable-gpu"],
    webgl: (o) => linsenWebglArgs(process.env, process.platform, o),
    standard: () => ["--no-sandbox", "--disable-setuid-sandbox"],
    linse: (o) => linsenWebGpuArgs(process.env, process.platform, o),
    echt: () => echteWebGpuArgs(),
};
// DIE KLASSE DER CI (K61): diese Rezepte zeichnen mit einem Echt-Renderer (swiftshader am Läufer, die echte GPU am Messplatz)
// — null und standard nicht (der Null-Renderer bzw. Chromes eigene Wahl ohne Adapter-Schalter). Eine Gruppe der vollen
// Batterie trägt CI_KLASSE (check.yml, matrix.klasse): in einer CPU-Gruppe ist ein Echt-Rezept ROT beim Namen — die
// CPU-Gruppen laufen damit nachweislich ohne Echt-Renderer, die GPU-Gruppen sind die Arbeit eines GPU-Läufers.
const GPU_REZEPTE = ["linse", "webgl", "echt"];

// Die Start-Optionen aus dem Rezept: `frist` = protocolTimeout (ms), `zusatz` = weitere Schalter hinter dem Rezept,
// `viewport` = defaultViewport, `profil` = userDataDir; `headless` steht, wenn nichts gesagt ist (echt: mit Fenster nur,
// wenn gesagt).
function browserOptionen({ art, frist, zusatz = [], headless = true, viewport, profil, dumpio, zeit = false } = {}) {
    if (!REZEPTE[art])
        throw new Error(`welt-boot: unbekanntes Rezept "${art}" — erlaubt: ${Object.keys(REZEPTE).join(" · ")}`);
    const o = { headless };
    if (profil != null) o.userDataDir = profil;
    if (frist != null) o.protocolTimeout = frist;
    if (viewport !== undefined) o.defaultViewport = viewport;
    if (dumpio != null) o.dumpio = dumpio;
    o.args = [...REZEPTE[art]({ zeit }), ...zusatz];
    return o;
}

// DER FEHLER-SAMMLER: eine Liste je Prozess, die Wache am Prozess-Ende. Harmlos ist nur, was der Page-Error-Wächter seit
// V18.359 als harmlos kennt (Netz/Favicon/save-server im headless-Kontext) und was die Linse als `erwartet` nennt.
const HARMLOS = /favicon|net::ERR|Failed to load resource|save-server|localhost:|127\.0\.0\.1:\d+\/api/i;
const KOSTEN = /^\[budget\] |BUDGET-BRUCH /;
const sammlung = { fehler: [], erwartet: null, wache: false, selbsttest: null };

function melde(art, text) {
    const t = String(text || "")
        .split("\n")
        .slice(0, 3)
        .join(" | ")
        .slice(0, 400);
    if (sammlung.erwartet && sammlung.erwartet.test(t)) return;
    // ab `selbsttest(name)` setzt die Linse ihren Täter selbst: was die Seite dann meldet, steht laut als SELBSTTEST, kein Fehler der Welt
    if (sammlung.selbsttest && (art === "console.error" || art === "pageerror"))
        return console.log(`[welt-boot] SELBSTTEST ${sammlung.selbsttest} ${art}: ${t}`);
    sammlung.fehler.push(`${art}: ${t}`);
    console.log(`[welt-boot] FEHLER ${art}: ${t}`);
}

function wacheAnProzessEnde() {
    if (sammlung.wache) return;
    sammlung.wache = true;
    process.on("exit", (code) => {
        if (!sammlung.fehler.length) return;
        console.log(`[welt-boot] ROT — ${sammlung.fehler.length} Fehler der Welt:`);
        for (const f of sammlung.fehler.slice(0, 12)) console.log(`  · ${f}`);
        if (code === 0) process.exitCode = 1;
    });
}

function fehlerSammler(page) {
    if (!page || page.__weltBootSammler) return page;
    page.__weltBootSammler = true;
    page.on("pageerror", (e) => melde("pageerror", (e && (e.stack || e.message)) || e));
    page.on("error", (e) => melde("absturz", (e && e.message) || e));
    page.on("console", (m) => {
        if (m.type() !== "error") return;
        const t = m.text();
        if (HARMLOS.test(t)) return;
        // Ein Budget-Bruch ist ein KOSTEN-Urteil mit eigenem Richter (gate:asset-contract je Fall, regler-wirkt je Regler),
        // kein Absturz der Welt: er steht laut im Lauf, beim Namen und mit seinem Richter, und färbt nur seinen Richter.
        if (KOSTEN.test(t)) return console.log(`[welt-boot] KOSTEN (Richter gate:asset-contract): ${t.slice(0, 300)}`);
        melde("console.error", t);
    });
    return page;
}

// ── DIE STALL-AKTE (K67) ────────────────────────────────────────────────────────────────────────────────────────────
// Ein Hänger der Seite („Runtime.callFunctionOn timed out", Navigations-Timeout) hat einen Namen. Die Akte nennt den Täter: der PULS der Seite (ein Binding, das die
// Seite jede Sekunde ruft, mit ihrer Phase) zeigt, ob der Haupt-Thread lebt; die STEMPEL gehen EAGER hinaus, bevor ein
// Aufruf blockieren kann (das Binding wartet nicht auf das Ende der Aufgabe); Debugger.pause unterbricht eine JS-Schleife
// und liefert ihren Stapel (ein nativer Block antwortet nicht — dann sprechen CPU je Prozess, Stempel und Stderr).
const AKTE_SEITEN = new Set();
const akten = [];
let akteN = 0;
let akteUhr = null;

const sek = (ms) => (ms / 1000).toFixed(1);
const ring = (liste, eintrag, n) => (liste.push(eintrag), liste.length > n && liste.splice(0, liste.length - n));
const kurz = (x) =>
    String(typeof x === "function" ? x.name || x.toString() : x)
        .replace(/\s+/g, " ")
        .slice(0, 90);

// Die Seite: Puls, Phase und Stempel (als Quelltext injiziert; läuft vor jedem Skript der Seite).
function pulsSeite() {
    if (window.top !== window || window.__weltPulsAn || typeof window.__weltPuls !== "function") return;
    window.__weltPulsAn = true;
    const B = window.__weltPuls;
    const Z = { programme: 0, sync: 0, letzt: "", syncLetzt: "" };
    const sende = (art, text) => {
        try {
            B(`${art}\t${String(text).slice(0, 300)}`);
        } catch (_e) {
            // das Binding ist fort: die Seite geht
        }
    };
    const stempel = (text) => ((Z.letzt = text), sende("stempel", text));
    const G = window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype;
    if (G) {
        const lp = G.linkProgram;
        G.linkProgram = function () {
            stempel(`gl.linkProgram #${++Z.programme}`);
            return lp.apply(this, arguments);
        };
        // die synchronen Rückfragen an den GPU-Prozess (der Haupt-Thread wartet auf die Antwort): Stempel beim Namenswechsel
        for (const m of [
            "getProgramParameter",
            "getShaderParameter",
            "readPixels",
            "getBufferSubData",
            "finish",
            "getError",
            "clientWaitSync",
            "checkFramebufferStatus",
        ]) {
            const o = G[m];
            if (typeof o !== "function") continue;
            G[m] = function () {
                Z.sync++;
                if (m !== Z.syncLetzt) ((Z.syncLetzt = m), sende("stempel", `gl.${m} (synchron #${Z.sync})`));
                return o.apply(this, arguments);
            };
        }
    }
    const D = window.GPUDevice && window.GPUDevice.prototype;
    if (D)
        for (const m of [
            "createRenderPipeline",
            "createRenderPipelineAsync",
            "createComputePipeline",
            "createComputePipelineAsync",
        ]) {
            const o = D[m];
            if (typeof o !== "function") continue;
            D[m] = function (d) {
                stempel(`gpu.${m} #${++Z.programme} ${(d && d.label) || ""}`);
                return o.apply(this, arguments);
            };
        }
    // der Stoff-Name je Pipeline am Backend der Welt (r184 createRenderPipeline(renderObject)), sobald es steht
    const stoffHaken = () => {
        const st = window.anazhRealm && window.anazhRealm.state;
        const be = st && st.renderer && st.renderer.backend;
        if (!be || be.__weltPulsHaken || typeof be.createRenderPipeline !== "function") return;
        be.__weltPulsHaken = true;
        const crp = be.createRenderPipeline;
        be.createRenderPipeline = function (ro) {
            const m = ro && ro.material;
            const o = ro && ro.object;
            const p = ro && ro.pipeline;
            const len = (s) => (s && typeof s.code === "string" ? s.code.length : "?");
            const lichter =
                ro && ro.lightsNode && typeof ro.lightsNode.getLights === "function"
                    ? ro.lightsNode.getLights().length
                    : "?";
            const name = `${(m && (m.name || m.type)) || "?"} · ${(o && (o.name || o.type)) || "?"}`;
            stempel(
                `Pipeline ${name} · vs ${len(p && p.vertexProgram)} fs ${len(p && p.fragmentProgram)} Zeichen · ${lichter} Lichter`
            );
            const t0 = performance.now();
            const aus = crp.apply(this, arguments);
            const ms = performance.now() - t0;
            if (ms >= 500) sende("stempel", `Pipeline ${name} stand nach ${(ms / 1000).toFixed(1)} s (synchron)`);
            return aus;
        };
    };
    const phase = () => {
        stoffHaken();
        const st = window.anazhRealm && window.anazhRealm.state;
        const t = [document.readyState];
        if (document.visibilityState === "hidden") t.push("verborgen");
        if (st) {
            t.push(`renderer ${st.rendererReady === true ? "bereit" : "—"}`, `weltbild ${st._weltbildDa ? "da" : "—"}`);
            if (st.flightRecorder) t.push(`frames ${st.flightRecorder.frames}`);
            const W = window.anazhRealm._weltStand; // worauf das Einschwingen wartet (`__weltStehtNach`), beim Namen
            if (W) t.push(`welt ${W.takte} Takte · Ruhe ${W.ruhe} · zuletzt ${W.grund}`);
        } else t.push("anazhRealm —");
        if (window.__weltDaWartet) t.push(`__weltDa wartet auf ${window.__weltDaWartet}`);
        t.push(`programme ${Z.programme}`, `gl-sync ${Z.sync}`);
        if (Z.letzt) t.push(`zuletzt ${Z.letzt}`);
        return t.join(" · ");
    };
    sende("puls", "Dokument beginnt");
    setInterval(() => sende("puls", phase()), 1000);
}

// Je Seite: Ringe, Puls-Binding, Debugger (nur ohne Zeit-Urteil: ein Debugger färbt keine ms), umhüllte Aufrufe.
function akteAnSeite(page, b) {
    if (!page.__akteBereit)
        page.__akteBereit = Promise.all([page.evaluateOnNewDocument(CODE_OF_SEITE), akteAnlegen(page, b)]);
    return page.__akteBereit;
}
async function akteAnlegen(page, b) {
    const A = (page.__akte = {
        id: ++akteN,
        b,
        konsole: [],
        stempel: [],
        puls: null,
        pulsN: 0,
        offen: new Map(),
        gemeldet: false,
        s: null,
        dbg: false,
        warte: null,
    });
    AKTE_SEITEN.add(page);
    page.on("close", () => AKTE_SEITEN.delete(page));
    page.on("console", (m) => ring(A.konsole, `${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 200)}`, 12));
    for (const n of [
        "goto",
        "reload",
        "evaluate",
        "evaluateHandle",
        "waitForFunction",
        "waitForSelector",
        "waitForNavigation",
        "screenshot",
    ]) {
        const o = page[n];
        if (typeof o !== "function") continue;
        page[n] = function (...a) {
            const auf = { was: `${n}(${kurz(a[0])})`, an: Date.now() };
            A.offen.set(auf, auf);
            return o.apply(this, a).then(
                (v) => (A.offen.delete(auf), v),
                async (e) => {
                    const msg = (e && e.message) || String(e);
                    if ((e && e.name === "TimeoutError") || /timed out/i.test(msg))
                        await akte(
                            page,
                            `${auf.was} riss nach ${sek(Date.now() - auf.an)} s: ${msg.split("\n")[0].slice(0, 160)}`
                        );
                    A.offen.delete(auf);
                    throw e;
                }
            );
        };
    }
    try {
        const s = (A.s = await page.createCDPSession());
        s.on("Runtime.bindingCalled", (e) => e.name === "__weltPuls" && puls(A, e.payload));
        // jede Pause wird gelöst — die eigene (der Stapel) und jede fremde (ein `debugger;`), nie bleibt eine Seite stehen
        s.on("Debugger.paused", (e) => {
            if (A.warte) A.warte(e);
            else if (A.gemeldet) console.log(`[stall-akte] Seite #${A.id}: der Stapel kam spät — ${stapelText(e)}`);
            s.send("Debugger.resume").catch(() => {});
        });
        await s.send("Runtime.enable");
        await s.send("Runtime.addBinding", { name: "__weltPuls" });
        await page.evaluateOnNewDocument(pulsSeite);
        if (b.stapel) (await s.send("Debugger.enable"), (A.dbg = true));
    } catch (e) {
        if (!page.isClosed()) console.log(`[stall-akte] Seite #${A.id} ohne Puls: ${(e && e.message) || e}`);
    }
    if (!akteUhr) {
        akteUhr = setInterval(() => {
            for (const p of AKTE_SEITEN) {
                const P = p.__akte;
                if (p.isClosed() || !P.b.offen) {
                    AKTE_SEITEN.delete(p);
                    continue;
                }
                if (!P.puls || P.gemeldet || / verborgen /.test(` ${P.puls.text} `)) continue;
                const luecke = Date.now() - P.puls.an;
                if (luecke >= P.b.stallMs)
                    akte(p, `der Puls steht seit ${sek(luecke)} s`).catch((e) =>
                        console.log(`[stall-akte] Akte brach: ${e && e.message}`)
                    );
            }
        }, 1000);
        akteUhr.unref();
    }
}

function puls(A, payload) {
    const i = String(payload).indexOf("\t");
    const art = String(payload).slice(0, i);
    const text = String(payload).slice(i + 1);
    if (art !== "puls") return ring(A.stempel, `${new Date().toISOString().slice(11, 23)} ${text}`, 12);
    if (A.gemeldet && A.puls && Date.now() - A.puls.an >= A.b.stallMs)
        console.log(
            `[stall-akte] Seite #${A.id}: der Puls kehrt zurück nach ${sek(Date.now() - A.puls.an)} s — ${text}`
        );
    A.gemeldet = false;
    A.puls = { an: Date.now(), text };
    A.pulsN++;
}

const stapelText = (e) =>
    e.callFrames
        .slice(0, 8)
        .map(
            (f) =>
                `${f.functionName || "(anonym)"} ${String(f.url).split("/").pop().split("?")[0]}:${f.location.lineNumber + 1}`
        )
        .join(" < ");

// DIE FÄDEN DES GPU-PROZESSES (Linux, /proc/<pid>/task): wer dort rechnet, gruppiert nach Faden-Namen — die Raster-Arbeiter
// von swiftshader (`Thread<NN>`), seine Schlange (`Queue<…>`), der Befehls-Faden (`CrGpuMain`), die Link-Arbeiter von ANGLE
// (`ThreadPoolForeg…`), der Compositor (`VizCompositorTh…`). Ticks = utime + stime (Felder 14 und 15, 100 je Sekunde).
function faedenProbe(pid) {
    if (process.platform !== "linux" || !pid) return null;
    const m = new Map();
    try {
        for (const t of fs.readdirSync(`/proc/${pid}/task`)) {
            try {
                const st = fs.readFileSync(`/proc/${pid}/task/${t}/stat`, "utf8");
                const rest = st.slice(st.lastIndexOf(")") + 2).split(" ");
                m.set(t, {
                    name: st.slice(st.indexOf("(") + 1, st.lastIndexOf(")")),
                    ticks: Number(rest[11]) + Number(rest[12]),
                });
            } catch (_e) {
                // der Faden endete zwischen Liste und Lesen
            }
        }
    } catch (_e) {
        return null;
    }
    return m;
}
function faedenText(a, z, ms) {
    if (!a || !z) return null;
    const g = new Map();
    for (const [t, v] of z) {
        const k = v.name.replace(/<[^>]*>$/, "<>").replace(/\d+$/, "");
        const e = g.get(k) || { n: 0, ticks: 0 };
        e.n++;
        e.ticks += v.ticks - ((a.get(t) && a.get(t).ticks) || 0);
        g.set(k, e);
    }
    const z2 = [...g].filter(([, e]) => e.ticks > 0).sort((x, y) => y[1].ticks - x[1].ticks);
    return z2.length
        ? z2
              .slice(0, 6)
              .map(([k, e]) => `${k}${e.n > 1 ? ` ×${e.n}` : ""} ${((e.ticks / (ms / 10)) * 100).toFixed(0)} %`)
              .join(" · ")
        : null;
}

// CPU je Prozess: zwei Proben im Abstand `ms` am Browser (SystemInfo antwortet ohne den Haupt-Thread der Seite), unter Linux
// dazu die Fäden des GPU-Prozesses.
async function cpuDelta(b, ms) {
    if (!b.cdp) return { text: "keine Browser-Sitzung", renderer: 0, gpu: 0, faeden: null };
    const probe = async () => (await b.cdp.send("SystemInfo.getProcessInfo")).processInfo;
    try {
        const pa = await probe();
        const gpuPid = (pa.find((p) => p.type === "GPU") || {}).id;
        const fa = faedenProbe(gpuPid);
        await new Promise((r) => setTimeout(r, ms));
        const fz = faedenProbe(gpuPid);
        const a = new Map(pa.map((p) => [`${p.type} ${p.id}`, p.cpuTime]));
        const z = new Map((await probe()).map((p) => [`${p.type} ${p.id}`, p.cpuTime]));
        const d = [...z].map(([k, v]) => [k, v - (a.get(k) || 0)]).sort((x, y) => y[1] - x[1]);
        const anteil = (typ) => Math.max(0, ...d.filter(([k]) => k.startsWith(typ)).map(([, v]) => v)) / (ms / 1000);
        return {
            text:
                d
                    .filter(([k, v]) => v >= 0.02 || k.startsWith("GPU"))
                    .map(([k, v]) => `${k} ${((v / (ms / 1000)) * 100).toFixed(0)} %`)
                    .join(" · ") || "alles ruht",
            renderer: anteil("renderer"),
            gpu: anteil("GPU"),
            faeden: faedenText(fa, fz, ms),
        };
    } catch (e) {
        return { text: `SystemInfo: ${(e && e.message) || e}`, renderer: 0, gpu: 0, faeden: null };
    }
}

// DIE AKTE: was offen ist, der Puls, die Stempel, CPU, der Stapel, Konsole, Stderr — und das Urteil beim Namen.
async function akte(page, grund) {
    const A = page.__akte;
    if (!A) return null;
    const schon = A.gemeldet;
    A.gemeldet = true;
    const luecke = A.puls ? Date.now() - A.puls.an : null;
    const cpu = await cpuDelta(A.b, 2000);
    let stapel = null;
    const fragen = A.dbg && !schon && luecke != null && luecke > 2000;
    if (fragen) {
        const pausiert = new Promise((r) => (A.warte = r));
        A.s.send("Debugger.pause").catch(() => {});
        stapel = await Promise.race([pausiert, new Promise((r) => setTimeout(() => r(null), 6000))]);
        A.warte = null;
    }
    const letzt = A.stempel.length ? A.stempel[A.stempel.length - 1] : "kein Stempel";
    let urteil;
    if (!A.puls) urteil = "KEIN PULS — das Dokument lief nie an (Navigation oder Dokument-Start)";
    else if (luecke < 3000)
        urteil = `AWAIT — der Haupt-Thread lebt (Puls vor ${sek(luecke)} s), ein Versprechen der Seite kehrt nie zurück; zuletzt ${letzt}`;
    else if (stapel) urteil = `JS-SCHLEIFE — der Haupt-Thread rechnet in ${stapelText(stapel).split(" < ")[0]}`;
    else if (cpu.renderer >= 0.5)
        urteil = `NATIV — der Haupt-Thread rechnet in einem nativen Aufruf (${(cpu.renderer * 100).toFixed(0)} %, kein JS-Stapel); zuletzt ${letzt}`;
    else if (cpu.gpu >= 0.5)
        urteil = `GPU-PROZESS — der Haupt-Thread wartet nativ, der GPU-Prozess rechnet (${(cpu.gpu * 100).toFixed(0)} %${cpu.faeden ? `: ${cpu.faeden.split(" · ").slice(0, 2).join(" · ")}` : ""}); zuletzt ${letzt}`;
    else urteil = `VERKLEMMUNG — der Haupt-Thread wartet nativ, kein Prozess rechnet; zuletzt ${letzt}`;
    const z = [`═══ ${path.basename(process.argv[1] || "?")} · Seite #${A.id} ${kurz(page.url())} · ${grund}`];
    for (const o of A.offen.values()) z.push(`offen ${o.was} seit ${sek(Date.now() - o.an)} s`);
    z.push(A.puls ? `Puls ${A.pulsN}×, zuletzt vor ${sek(luecke)} s — ${A.puls.text}` : "Puls nie");
    for (const s of A.stempel) z.push(`Stempel ${s}`);
    z.push(`CPU (2 s) ${cpu.text}`);
    if (cpu.faeden) z.push(`Fäden des GPU-Prozesses (2 s) ${cpu.faeden}`);
    if (A.b.last.length) z.push(`Last je 2 s (GPU-Prozess/Renderer %, älteste zuerst) ${A.b.last.join(" · ")}`);
    z.push(
        `Stapel ${stapel ? stapelText(stapel) : fragen ? "keine Pause in 6 s — der Haupt-Thread steht NATIV" : A.dbg ? "(nicht gefragt: der Puls lebt oder die Akte fragte schon)" : "(kein Debugger: Zeit-Linse)"}`
    );
    for (const k of A.konsole) z.push(`Konsole ${k}`);
    for (const l of A.b.stderr.slice(-24)) z.push(`Stderr ${l}`);
    z.push(`URTEIL ${urteil}`);
    console.log(z.map((l) => `[stall-akte] ${l}`).join("\n"));
    const eintrag = { seite: A.id, grund, urteil, stapel: stapel ? stapelText(stapel) : null };
    akten.push(eintrag);
    return eintrag;
}

// Der Browser über die EINE Weiche, jede Seite am Fehler-Sammler, die Linse nennt ihren Adapter.
async function starteBrowser(opts = {}) {
    const puppeteer = require("puppeteer");
    if (opts.erwartet) sammlung.erwartet = opts.erwartet;
    wacheAnProzessEnde();
    if (process.env.CI_KLASSE === "cpu" && GPU_REZEPTE.includes(opts.art))
        melde(
            "klasse",
            `${path.basename(process.argv[1] || "?")} startet das Echt-Rezept „${opts.art}" in einer CPU-Gruppe der CI — der Schritt gehört in eine GPU-Gruppe (check.yml matrix.klasse)`
        );
    const browser = await puppeteer.launch(browserOptionen(opts));
    // die Stall-Akte des Browsers: Stderr-Ring (Chrome, GPU-Prozess), Browser-Sitzung für CPU je Prozess, die Schwelle
    const b = {
        stderr: [],
        cdp: null,
        stapel: !opts.zeit && opts.art !== "echt",
        stallMs: opts.stallMs || 20000,
        offen: true,
    };
    const proc = browser.process();
    if (proc && proc.stderr) {
        let rest = "";
        proc.stderr.on("data", (d) => {
            const z = (rest + d.toString()).split("\n");
            rest = z.pop();
            for (const l of z) if (l.trim()) ring(b.stderr, l.slice(0, 260), 60);
        });
    }
    b.cdp = await browser
        .target()
        .createCDPSession()
        .catch(() => null);
    // die LAST-SPUR: je 2 s die CPU des GPU-Prozesses und des stärksten Renderers (wann begann die Arbeit, auf die die Seite wartet)
    b.last = [];
    if (b.cdp) {
        let vor = null;
        let fVor = null;
        const uhr = setInterval(async () => {
            if (!b.offen) return clearInterval(uhr);
            try {
                const info = (await b.cdp.send("SystemInfo.getProcessInfo")).processInfo;
                const jetzt = new Map(info.map((p) => [`${p.type} ${p.id}`, p.cpuTime]));
                const fJetzt = faedenProbe((info.find((p) => p.type === "GPU") || {}).id);
                if (vor) {
                    const d = (typ) =>
                        Math.max(
                            0,
                            ...[...jetzt].filter(([k]) => k.startsWith(typ)).map(([k, v]) => v - (vor.get(k) || 0))
                        );
                    // unter Linux der stärkste Faden des GPU-Prozesses dazu (wer die Last trägt)
                    const f = faedenText(fVor, fJetzt, 2000);
                    ring(
                        b.last,
                        `${new Date().toISOString().slice(14, 19)} gpu ${((d("GPU") / 2) * 100).toFixed(0)}${f ? ` [${f.split(" · ")[0]}]` : ""}/r ${((d("renderer") / 2) * 100).toFixed(0)}`,
                        30
                    );
                }
                vor = jetzt;
                fVor = fJetzt;
            } catch (_e) {
                // die Browser-Sitzung geht mit dem Browser
            }
        }, 2000);
        uhr.unref();
    }
    let abbau = false;
    const zu = browser.close.bind(browser);
    browser.close = (...a) => ((abbau = true), (b.offen = false), zu(...a));
    browser.on("disconnected", () => {
        b.offen = false;
        if (!abbau) melde("absturz", "Browser getrennt ohne Abbau");
    });
    const neu = browser.newPage.bind(browser);
    browser.newPage = async (...a) => {
        const p = fehlerSammler(await neu(...a));
        await akteAnSeite(p, b);
        return p;
    };
    for (const p of await browser.pages()) await akteAnSeite(fehlerSammler(p), b);
    browser.on("targetcreated", async (t) => {
        if (t.type() !== "page") return;
        try {
            const p = await t.page();
            if (p) await akteAnSeite(fehlerSammler(p), b);
        } catch (_e) {
            // ein Ziel, das vor dem Anheften stirbt, meldet sich über disconnected/close
        }
    });
    // jede GPU-Linse nennt den Adapter, den der Browser WIRKLICH liefert (gate:start-rezept W4), die WebGL-Linse ihren
    // WebGL2-Renderer; die ZEIT-ZEILE (W5): eine Zeit-Linse auf der Karte ist ROT beim Namen
    if (opts.art === "linse" || opts.art === "echt" || opts.art === "webgl") {
        const info = (browser.adapter = await adapterZeile(browser, { webgl: opts.art === "webgl" }));
        const rot = zeitZeile({ zeit: !!opts.zeit, art: opts.art, info });
        if (rot) melde("zeit-linse", rot);
    }
    return browser;
}

// Der Null-Renderer (die Seite zeichnet nichts: `__anazhHeadlessNullRenderer`, der Schalter des Stamms; `foundry`: die
// Foundry baut auch ohne Bild, `__anazhForceFoundry`) — EINMAL hier, jede Linse ohne Bild ruft ihn vor dem Laden;
// `warteAufWelt` wartet, bis die Welt ihren Takt trägt — die EINE Warte jeder Linse.
async function nullRenderer(page, { foundry = false } = {}) {
    await page.evaluateOnNewDocument((mitFoundry) => {
        if (mitFoundry) window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    }, foundry);
}
async function warteAufWelt(page, frist = 120000) {
    await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
        timeout: frist,
    });
}

// Die Seite der Welt: Null-Renderer wahlweise, laden, auf die Welt warten.
async function oeffneWelt(
    browser,
    {
        port,
        pfad = "/index.html",
        nullRenderer: ohneBild = false,
        viewport,
        frist = 120000,
        warteBis = "networkidle0",
        warten = true,
    } = {}
) {
    const page = await browser.newPage();
    if (viewport) await page.setViewport(viewport);
    if (ohneBild) await nullRenderer(page);
    await page.goto(`http://127.0.0.1:${port}${pfad}`, { waitUntil: warteBis, timeout: frist });
    if (warten) await warteAufWelt(page, frist);
    return page;
}

// Eine Taste HALTEN, bis ihr Ereignis eintritt (`ziel` wird wahr auf `seite`, Page oder Frame) — nie nach der Wanduhr:
// auf dem CPU-Raster der CI läuft der Spieler in derselben Zeit einen Bruchteil des Wegs. `taste` drückt über die Tastatur der Seite; ein Rahmen ohne Tastatur reicht `druck` und
// `los`. Losgelassen wird immer, auch nach der Frist. Die Wand: gate:apparat Klinge 5. → { erreicht, ms, wert } (`wert`:
// was `ziel` im Moment des Ereignisses zurückgab)
async function halteBis(seite, { taste, druck, los, ziel, args = [], frist = 30000 }) {
    const t0 = Date.now();
    await (druck ? druck() : seite.keyboard.down(taste));
    let erreicht = true;
    let wert = null;
    try {
        const h = await seite.waitForFunction(ziel, { timeout: frist, polling: 100 }, ...args);
        wert = await h.jsonValue().catch(() => null);
    } catch {
        erreicht = false;
    } finally {
        await (los ? los() : seite.keyboard.up(taste));
    }
    return { erreicht, ms: Date.now() - t0, wert };
}

// DER LESER IM BLICK (Seite): der Spieler am Ufer des Bachs der Mess-Wiese, Blick übers Wasser (ein Leser der Szenen-Tiefe);
// zurück, sobald das Wasser ZEICHNET (die Erst-Zeichnung trug es ein, sichtbar allein ist Existenz), das Tiefen-Abbild gezogen
// ist und das Weltbild steht (`welt`: nur diese Terme). `kappe`: die Pixel-Kappe des Holzes, wenn gesetzt.
async function uferStellen(opts) {
    const warte = (ms) => new Promise((q) => setTimeout(q, ms));
    const r = await window.__weltDa(
        (w) =>
            w.state.rendererReady &&
            w.state.renderer &&
            w.state.renderer.backend &&
            w.state.camera &&
            w.state.playerMesh
    );
    const st = r.state;
    if (st.renderer.backend.isWebGPUBackend !== true) return { fehler: "kein WebGPU-Backend — die Wand wäre blind" };
    if (opts.kappe != null) st._holzPixelCap = opts.kappe;
    const [mx, mz] = opts.messort;
    let h = null;
    await window.__weltDa((w) => (w._ensureHydroTilesAround(mx, mz, 200), (h = w._hydroFor(mx, mz)) && h.ready));
    let P = null;
    for (const f of (h && h.rivers) || [])
        f.points.forEach((q, i) => {
            const d = Math.hypot(q.x - mx, q.z - mz);
            if (!P || d < P.d) P = { x: q.x, z: q.z, d, f, i };
        });
    if (!P || P.d > 300) return { fehler: "kein Bach an der Mess-Wiese" };
    const a = P.f.points[Math.max(0, P.i - 1)],
        b = P.f.points[Math.min(P.f.points.length - 1, P.i + 1)];
    const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const s = (b.x - a.x) * (mz - P.z) - (b.z - a.z) * (mx - P.x) < 0 ? -1 : 1; // die Normale zeigt zur Mess-Wiese
    const nx = (-(b.z - a.z) / L) * s,
        nz = ((b.x - a.x) / L) * s;
    const ux = P.x + nx * 12,
        uz = P.z + nz * 12;
    st.playerMesh.position.set(ux, r.getTerrainHeightAt(ux, uz) + 1.2, uz);
    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
    st.yaw = Math.atan2(-nx, -nz); // der Blick zum Wasser (`_blickVorn`: vorn = (sin yaw, cos yaw))
    st.pitch = -0.25;
    // DAS RUHENDE WASSER (`_ensureFarWaterSheet`): der ruhende Leser des Holzes voll — das Software-Holz schaltet es ab, sein
    // nahes Wasser frischt je Pass ohnehin auf; ohne das Fern-Wasser stünde kein Leser im Bild, an dem die Klasse hängt.
    st.atmosphere.farWater = null;
    r._ensureFarWaterSheet();
    const E = r._erstZeichnungStand();
    const sichtbaresWasser = () => {
        let n = 0;
        st.scene.traverse((o) => {
            if (o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial && E.gezeichnet.has(o)) n++;
        });
        return n;
    };
    const abbild = () => {
        const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
        return t && t.image ? t.image.width : 0;
    };
    const fern = () => !!(st.farWater && st.farWater.mesh && st.farWater.mesh.parent);
    const welt = (l) => !opts.welt || opts.welt.includes(l.term); // und die Szenen-Tiefe trägt die Welt, nie nur Himmel
    const steht = () => sichtbaresWasser() > 0 && abbild() > 1 && fern() && E.gezeichnet.has(st.farWater.mesh);
    // das EINE Warten (`__gebautNach`): Takt um Takt der Seite, bis Wasser, Abbild und Weltbild stehen (Deckel: Takte ohne Offenes)
    await window.__gebautNach("das Ufer im Blick", {
        fertig: () => steht() && !r._weltbildLuecken(true).some(welt),
        takt: async () => (fern() || r._ensureFarWaterSheet(), await warte(100)),
        max: 600,
        warum: () =>
            `Wasser ${sichtbaresWasser()} · Abbild ${abbild()} · fern ${fern()} gezeichnet ${fern() && E.gezeichnet.has(st.farWater.mesh)} · offen ${r
                ._weltbildLuecken(true)
                .filter(welt)
                .map((l) => l.term)}`,
    });
    return {
        bach: [Math.round(P.x), Math.round(P.z)],
        wasser: sichtbaresWasser(),
        fernWasser: fern() ? st.farWater.quads : 0,
        abbildBreite: abbild(),
    };
}

// Die Bühne: Mittag · Sonne · Sommer fest (window.__buehne aus AUSGABE_INSTALL).
async function buehne(page) {
    const { AUSGABE_INSTALL } = require("./ausgabe-aufnahme.cjs");
    const da = await page.evaluate(() => typeof window.__buehne === "function");
    if (!da) await page.evaluate(AUSGABE_INSTALL);
    await page.evaluate(() => window.__buehne());
}

// DER PRÜFER EINER LINSE (die Zeile je Urteil): `check(name, ok, detail)` schreibt ✅/❌ und sammelt jedes Rot in `errs`
// (bis 18.10. stand derselbe Fünfzeiler in 43 Linsen).
function pruefer() {
    const errs = [];
    const check = (name, ok, detail) => {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) errs.push(name);
    };
    return { errs, check };
}

// DER DIENST ALS KIND (save-server, signaling-server): `script` (relativ zur Wurzel, `vor` davor, in `cwd`) mit `env` — bereit,
// sobald seine Ausgabe `bereit` trifft; endet er vorher, ROT mit seinem Fehler-Wort (EADDRINUSE). Das Urteil fällt am Ereignis,
// nie an einer Frist (K-WANDUHR).
function startProc(script, bereit, env = {}, { vor = [], cwd = ROOT } = {}) {
    return new Promise((resolve, reject) => {
        const proc = require("child_process").spawn(process.execPath, [...vor, path.resolve(ROOT, script)], {
            cwd,
            stdio: ["ignore", "pipe", "pipe"],
            env: Object.assign({}, process.env, env),
        });
        let fehler = "";
        proc.stderr.on("data", (c) => (fehler = (fehler + c).slice(-2000)));
        const ende = (code) => {
            const wort = fehler.match(/\b(E[A-Z]{4,}|Error: [^\n]+)/);
            reject(
                new Error(
                    `${script} endete vor seiner Bereitschaft (Code ${code}): ${wort ? wort[0] : fehler.trim().slice(-200)}`
                )
            );
        };
        proc.stdout.on("data", (chunk) => bereit.test(chunk.toString()) && (proc.off("exit", ende), resolve(proc)));
        proc.on("exit", ende);
        proc.on("error", reject);
    });
}
// DIE EIGENEN PORTS einer Linse mit eigenem Server: je ihre Variable, sonst ein freier des Systems (alle zugleich gehalten) — nie
// 4312/4313, die Server des Schöpfers (lief `npm start`, fiel gate:taille nach 5 s mit „server timeout").
async function eigenePorte(...variablen) {
    const halt = [];
    const frei = () =>
        new Promise((ok, nein) => {
            const s = require("net").createServer();
            halt.push(s);
            s.on("error", nein);
            s.listen(0, "127.0.0.1", () => ok(s.address().port));
        });
    try {
        return await Promise.all(variablen.map((v) => (Number(process.env[v]) > 0 ? Number(process.env[v]) : frei())));
    } finally {
        await Promise.all(halt.map((s) => new Promise((ok) => s.close(() => ok()))));
    }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// wartet, bis `fn(...args)` in der Seite wahr ist (das Ereignis, je 150 ms gefragt), und gibt die Wartezeit zurück — ohne Frist:
// ein Hänger endet an der Frist des Browsers (`frist` = protocolTimeout), die Stall-Akte nennt ihn mit `label` (bis K-WANDUHR
// urteilte jeder Ruf an seiner eigenen Frist, 6–30 s)
async function waitFor(page, fn, label, ...args) {
    const t0 = Date.now();
    await page.evaluate((l) => (window.__weltDaWartet = l), label).catch(() => {});
    await page.waitForFunction(fn, { polling: 150, timeout: 0 }, ...args);
    await page.evaluate(() => (window.__weltDaWartet = null)).catch(() => {});
    return Date.now() - t0;
}

// DIE WARTE-WAND der Linsen (gate:altlasten, K-WANDUHR, Lehre 26: eine Wand urteilt in Bau-Ereignissen, nie in Wanduhr-Sekunden).
// ROT: eine Schleife wartet selbst auf einen Bau (`!e.mesh` …); eine FRIST — die Wanduhr (`performance.now()` / `Date.now()`)
// endet die Schleife, im Kopf oder als `if (…) break|return|throw` im Rumpf; ein `__gebautNach(…).catch(() => {})` schluckt
// den Deckel. Das EINE Warten ist welt-boot `__gebautNach` / `__deckel` (zählt nur Gänge ohne Offenes) und `__weltDa`.
// Der REST (spec/ci/frist-rest.json, je Grund Datei → Zahl) schrumpft nur: Messfenster, deren Maß die Zeit ist.
const BAU = /^(instanced|mesh|instSlots|_hausHuelle)$/;
const hat = (x, f) => {
    let j = false;
    wandere(x, (c) => {
        j = j || !!f(c);
    });
    return j;
};
const uhr = (c) =>
    c.type === "CallExpression" &&
    c.callee.property &&
    c.callee.property.name === "now" &&
    /^(performance|Date)$/.test(c.callee.object.name);
const frist = (t) =>
    hat(
        t,
        (b) => b.type === "BinaryExpression" && /^[<>]=?$/.test(b.operator) && (hat(b.left, uhr) || hat(b.right, uhr))
    );
function scanWarteWand(dateien, rest = Object.assign({}, ...Object.values(require("../../spec/ci/frist-rest.json")))) {
    const errs = [];
    for (const [name, src] of dateien) {
        const schleifen = [];
        const fristen = new Set();
        wandere(ast(src), (n) => {
            if (/^(For|While|DoWhile)Statement$/.test(n.type)) {
                schleifen.push(n);
                if (n.test && frist(n.test)) fristen.add(n);
                const bau =
                    n.test &&
                    hat(
                        n.test,
                        (b) =>
                            b.operator === "!" &&
                            hat(
                                b.argument,
                                (x) => x.object && x.object.type === "Identifier" && BAU.test(x.property.name)
                            )
                    );
                if (bau && name !== "scripts/lib/welt-boot.cjs")
                    errs.push(
                        `Warte-Wand: ${name}:${zeileVon(src, n.start)} wartet selbst auf einen Bau — das EINE Warten ist \`__gebautNach\``
                    );
            } else if (
                n.type === "IfStatement" &&
                frist(n.test) &&
                hat(n.consequent, (c) => /^(Break|Return|Throw)Statement$/.test(c.type))
            ) {
                const s = schleifen.filter((l) => l.body.start <= n.start && n.end <= l.body.end).pop();
                if (s) fristen.add(s);
            } else if (
                n.type === "CallExpression" &&
                n.callee.property &&
                n.callee.property.name === "catch" &&
                hat(n.callee.object, (c) => c.property && c.property.name === "__gebautNach")
            ) {
                const f = n.arguments[0];
                if (f && f.body && f.body.type === "BlockStatement" && !f.body.body.length)
                    errs.push(
                        `Warte-Wand: ${name}:${zeileVon(src, n.start)} schluckt den Deckel von \`__gebautNach\` — er wirft beim Namen`
                    );
            }
        });
        const zeilen = [...fristen].map((n) => zeileVon(src, n.start));
        const soll = rest[name] || 0;
        if (zeilen.length > soll)
            errs.push(
                `Warte-Wand: ${name}:${zeilen.join(",")} urteilt an der Wanduhr (${zeilen.length} Frist-Schleifen, REST ${soll}) — das EINE Warten ist \`__deckel\` / \`__weltDa\``
            );
        else if (zeilen.length < soll)
            errs.push(
                `Warte-Wand: ${name} trägt nur ${zeilen.length} von ${soll} Frist-Schleifen im REST — die Zahl senken (sie schrumpft nur)`
            );
    }
    for (const name of Object.keys(rest))
        if (!dateien.some(([n]) => n === name))
            errs.push(`Warte-Wand: ${name} steht im REST, die Datei fehlt — streichen`);
    return errs;
}

module.exports = {
    scanWarteWand,
    ROOT,
    MIME,
    REZEPTE,
    GPU_REZEPTE,
    CODE_OF_SEITE,
    WARTEN_SEITE,
    statikServer,
    starteBrowser,
    oeffneWelt,
    warteAufWelt,
    nullRenderer,
    halteBis,
    buehne,
    uferStellen,
    pruefer,
    startProc,
    eigenePorte,
    sleep,
    waitFor,
    selbsttest: (name) => (sammlung.selbsttest = name),
};

// DER SELBSTTEST DER STALL-AKTE (gate:welt-boot, Null-Rezept, ~20 s): eine Seite in einer JS-Schleife MUSS als JS-SCHLEIFE
// mit dem Namen der Schleife in der Akte stehen, ein nie erfülltes Versprechen als AWAIT am Fristriss, und eine Seite mit
// einem kurzen Block (0,8 s, unter der Schwelle) darf KEINE Akte tragen.
async function selbsttest() {
    const seiten = {
        "/ruhig.html":
            "<!doctype html><script>setTimeout(function(){var e=performance.now()+800;while(performance.now()<e){}},300)</script>",
        "/schleife.html":
            "<!doctype html><script>function __stallSchleife(){var e=performance.now()+9000;while(performance.now()<e){}}setTimeout(__stallSchleife,300)</script>",
        "/haenger.html": "<!doctype html><script>window.__nie=function(){return new Promise(function(){})}</script>",
    };
    const server = statikServer({ seiten });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const url = (p) => `http://127.0.0.1:${server.address().port}${p}`;
    const browser = await starteBrowser({ art: "null", frist: 7000, stallMs: 3000 });
    const fall = async (pfad, tu) => {
        const page = await browser.newPage();
        await page.goto(url(pfad), { waitUntil: "load" });
        await tu(page);
        const id = page.__akte.id;
        await page.close().catch(() => {});
        return akten.filter((a) => a.seite === id);
    };
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    // LANGSAM (K-WANDUHR): eine Welt im Kleinen, ihr Bau steht nach 3,2 s Wanduhr, die Foundry hat solange einen Auftrag offen —
    // das Warten hält (bis dahin gab gate:fahr-leben nach 3 s auf); TOT: nichts ist offen, der Bau steht nie — ROT beim Namen.
    // REGLER: ein echter Renderer, der Regler atmet je Takt, solange er regelt — das Einschwingen hält ihn in jedem Pfad (die
    // Welt steht nach 30 stillen Takten) und gibt ihn danach frei (bis K-WANDUHR hielt es nur headless: DIE WELT STEHT NICHT).
    // Sie läuft in der ruhigen Seite während ihrer 4,5 s (sie blockt nie: ihr Takt ist ein Versprechen).
    let bau = null;
    const bauProbe = async () => {
        const r = (window.anazhRealm = {
            _weltStand: { takte: 0 },
            offen: 1,
            _gameLoopTick() {},
            _archIsRendered: (e) => !!e.mesh,
        });
        r._rebuildArchitectureMesh = (e) => e.ab != null && performance.now() >= e.ab && (e.mesh = {});
        r._weltOffen = () => ({ foundry: r.offen, chunks: 0, wald: 0 });
        const takt = () => new Promise((ok) => setTimeout(ok, 10));
        const langsam = { type: "langsam", id: 1, ab: performance.now() + 3200 };
        const t0 = performance.now();
        const takte = await window.__gebautNach(langsam, { max: 5, takt });
        const aus = { langsam: { takte, steht: !!langsam.mesh, ms: Math.round(performance.now() - t0) } };
        r.offen = 0;
        aus.tot = await window.__gebautNach({ type: "tot", id: 2 }, { max: 5, takt }).then(
            (n) => `steht nach ${n} Takten`,
            (x) => x.message
        );
        let still = 0;
        r.state = { renderer: {}, perfRegulator: true };
        r._weltSteht = () => still >= 30;
        r._bepflanzungWartet = () => false;
        const atmet = async () => (still = r.state.perfRegulator === false ? still + 1 : 0);
        aus.regler = await window.__weltStehtNach(atmet, 300).then(
            (n) => `steht nach ${n} Takten`,
            (x) => x.message.slice(0, 60)
        );
        aus.frei = r.state.perfRegulator === true;
        return aus;
    };
    const ruhig = await fall(
        "/ruhig.html",
        async (p) => ([bau] = await Promise.all([p.evaluate(bauProbe), warte(4500)]))
    );
    const schleife = await fall("/schleife.html", async () => {
        for (let i = 0; i < 30 && !akten.some((a) => a.urteil); i++) await warte(500);
        await warte(500);
    });
    const haenger = await fall("/haenger.html", (p) => p.evaluate(() => window.__nie()).catch(() => {}));
    await browser.close();
    server.close();
    // BESETZT: ein Server auf einem belegten Port endet — der Start urteilt am Ereignis (EADDRINUSE), nie an einer Frist;
    // die eigenen Ports der Linsen sind nie 4312/4313
    const besetzt = require("net").createServer();
    const [belegt, frei] = await eigenePorte("WELT_BOOT_NIE_GESETZT_A", "WELT_BOOT_NIE_GESETZT_B");
    await new Promise((ok) => besetzt.listen(belegt, "127.0.0.1", ok));
    const t1 = Date.now();
    const start = await startProc("save-server.js", /läuft/, { PORT: String(belegt) }).then(
        (p) => (p.kill(), "bereit"),
        (x) => x.message
    );
    const startMs = Date.now() - t1;
    besetzt.close();
    const urteile = [
        [ruhig.length === 0, `ruhig (0,8 s Block): keine Akte — ${ruhig.length ? ruhig[0].urteil : "keine"}`],
        [
            schleife.length > 0 &&
                /^JS-SCHLEIFE/.test(schleife[0].urteil) &&
                /__stallSchleife/.test(schleife[0].stapel || ""),
            `Schleife: ${schleife.length ? `${schleife[0].urteil} · Stapel ${schleife[0].stapel}` : "KEINE Akte"}`,
        ],
        [
            haenger.length > 0 && /^AWAIT/.test(haenger[haenger.length - 1].urteil),
            `Versprechen: ${haenger.length ? haenger[haenger.length - 1].urteil : "KEINE Akte"}`,
        ],
        [
            !!bau && bau.langsam.steht && bau.langsam.ms >= 3000,
            `Bau LANGSAM (3,2 s, die Foundry offen): ${bau ? `steht nach ${bau.langsam.takte} Takten, ${bau.langsam.ms} ms` : "kein Befund"}`,
        ],
        [
            !!bau && /^DER BAU STEHT NICHT: tot#2/.test(bau.tot),
            `Bau TOT (nichts offen): ${bau ? bau.tot : "kein Befund"}`,
        ],
        [
            !!bau && /^steht nach 30 /.test(bau.regler) && bau.frei,
            `Regler atmet (echter Renderer): ${bau ? `${bau.regler}, danach ${bau.frei ? "frei" : "GEHALTEN"}` : "kein Befund"}`,
        ],
        [/EADDRINUSE/.test(start) && startMs < 5000, `Start auf belegtem Port: ${start} (${startMs} ms)`],
        [![belegt, frei].some((p) => p === 4312 || p === 4313) && belegt !== frei, `eigene Ports ${belegt}, ${frei}`],
    ];
    console.log("=== STALL-AKTE SELBSTTEST (gate:welt-boot) ===");
    for (const [ok, text] of urteile) console.log(`  ${ok ? "✅" : "❌"} ${text}`);
    const rot = urteile.filter(([ok]) => !ok).length;
    console.log(
        rot
            ? `ROT — ${rot} Fall/Fälle ohne Täter-Namen`
            : "GRÜN — die Akte nennt Schleife und Versprechen beim Namen, ein kurzer Block bleibt still; das Warten auf den Bau und der Start eines Servers urteilen am Ereignis"
    );
    process.exitCode = rot ? 1 : 0;
}

if (require.main === module) {
    if (!process.argv.includes("--selbsttest")) {
        console.log("node scripts/lib/welt-boot.cjs --selbsttest");
        process.exit(2);
    }
    selbsttest().catch((e) => {
        console.error("Selbsttest-Fehler:", (e && e.stack) || e);
        process.exit(2);
    });
}
