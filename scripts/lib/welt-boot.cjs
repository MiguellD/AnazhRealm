// welt-boot.cjs — DER EINE WELT-BOOT jeder Linse (14.10., Z2b-1). Vorher startete jede Linse Server und Browser selbst:
// 153 Dateien in scripts/ mit eigenem Start, 122 Kopien desselben Statik-Servers samt Mime-Tafel, 60 Kopien von vier
// Browser-Rezepten — und jede Linse sammelte Seitenfehler nach eigenem Gusto oder gar nicht: gate:nah-fern stürzte seit
// K16 ab und meldete Exit 0. Hier lebt der Start EINMAL:
//   statikServer()   der Statik-Server der Welt (Wurzel des Repos, `/` → index.html, nie aus der Wurzel heraus)
//   starteBrowser()  der Browser über die EINE Adapter-Weiche (Rezepte: null · webgl · linse · echt, software-gpu.cjs)
//                    + der FEHLER-SAMMLER an jeder Seite: pageerror (auch unbehandelte Rejections), console.error,
//                    Absturz der Seite, Trennung des Browsers ohne Abbau — jeder Fehler macht den Lauf ROT mit Namen,
//                    nie Exit 0 (die Wache sitzt am Prozess-Ende: ein Exit 0 mit gesammeltem Fehler wird Exit 1)
//   oeffneWelt()     Seite laden und auf die Welt warten (anazhRealm mit _gameLoopTick), wahlweise Null-Renderer
//   buehne()         die Bühne (Mittag · Sonne · Sommer, scripts/lib/ausgabe-aufnahme.cjs)
//   DIE STALL-AKTE   (K67) jede Seite trägt einen Puls (1 s) und Stempel (Programm-/Pipeline-Bau, synchrone GL-Rückfragen);
//                    steht der Puls ≥ 20 s oder läuft ein Seiten-Aufruf in seine Frist, schreibt die Lib die Akte ins Log:
//                    offene Aufrufe, letzter Puls mit Phase, Stempel, CPU je Prozess, der JS-Stapel (Debugger.pause),
//                    Konsole, Chrome-Stderr und das URTEIL (JS-SCHLEIFE · NATIV · GPU-PROZESS · VERKLEMMUNG · AWAIT)
//                    — `node scripts/lib/welt-boot.cjs --selbsttest` (gate:welt-boot) beweist, dass sie den Täter nennt
// Die Wand: gate:altlasten DIE BOOT-WAND — ein Start außerhalb dieser Datei ist ROT, die Liste der noch eigenen Starts
// darf nur schrumpfen.
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { linsenWebGpuArgs, linsenWebglArgs, echteWebGpuArgs, adapterZeile, zeitZeile } = require("./software-gpu.cjs");

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
                .then((inhalt) => (res.setHeader("Content-Type", typ), res.end(inhalt)), (e) => bruch(res, p, e));
        }
        if (p === "/") p = start;
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            const roh = err ? null : data;
            Promise.resolve()
                .then(() => (wandle ? wandle(p, roh) : roh))
                .then((inhalt) => {
                    if (inhalt == null) return ((res.statusCode = 404), res.end());
                    res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
                    if (keinCache) res.setHeader("Cache-Control", "no-store");
                    res.end(inhalt);
                }, (e) => bruch(res, p, e));
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
    if (!REZEPTE[art]) throw new Error(`welt-boot: unbekanntes Rezept "${art}" — erlaubt: ${Object.keys(REZEPTE).join(" · ")}`);
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
const sammlung = { fehler: [], erwartet: null, wache: false };

function melde(art, text) {
    const t = String(text || "").split("\n").slice(0, 3).join(" | ").slice(0, 400);
    if (sammlung.erwartet && sammlung.erwartet.test(t)) return;
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
// Befund 14./15.10.: vier volle CI-Läufe rissen auf swiftshader-Linux an „Runtime.callFunctionOn timed out" bzw. einem
// Navigations-Timeout — 300 s Stille, kein Name. Die Akte nennt den Täter: der PULS der Seite (ein Binding, das die
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
        for (const m of ["getProgramParameter", "getShaderParameter", "readPixels", "getBufferSubData", "finish", "getError", "clientWaitSync", "checkFramebufferStatus"]) {
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
        for (const m of ["createRenderPipeline", "createRenderPipelineAsync", "createComputePipeline", "createComputePipelineAsync"]) {
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
            stempel(`Pipeline ${(m && (m.name || m.type)) || "?"} · ${(o && (o.name || o.type)) || "?"}`);
            return crp.apply(this, arguments);
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
        } else t.push("anazhRealm —");
        t.push(`programme ${Z.programme}`, `gl-sync ${Z.sync}`);
        if (Z.letzt) t.push(`zuletzt ${Z.letzt}`);
        return t.join(" · ");
    };
    sende("puls", "Dokument beginnt");
    setInterval(() => sende("puls", phase()), 1000);
}

// Je Seite: Ringe, Puls-Binding, Debugger (nur ohne Zeit-Urteil: ein Debugger färbt keine ms), umhüllte Aufrufe.
function akteAnSeite(page, b) {
    if (!page.__akteBereit) page.__akteBereit = akteAnlegen(page, b);
    return page.__akteBereit;
}
async function akteAnlegen(page, b) {
    const A = (page.__akte = { id: ++akteN, b, konsole: [], stempel: [], puls: null, pulsN: 0, offen: new Map(), gemeldet: false, s: null, dbg: false, warte: null });
    AKTE_SEITEN.add(page);
    page.on("close", () => AKTE_SEITEN.delete(page));
    page.on("console", (m) => ring(A.konsole, `${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 200)}`, 12));
    for (const n of ["goto", "reload", "evaluate", "evaluateHandle", "waitForFunction", "waitForSelector", "waitForNavigation", "screenshot"]) {
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
                        await akte(page, `${auf.was} riss nach ${sek(Date.now() - auf.an)} s: ${msg.split("\n")[0].slice(0, 160)}`);
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
        if (b.stapel) ((await s.send("Debugger.enable")), (A.dbg = true));
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
                if (luecke >= P.b.stallMs) akte(p, `der Puls steht seit ${sek(luecke)} s`).catch((e) => console.log(`[stall-akte] Akte brach: ${e && e.message}`));
            }
        }, 1000);
        akteUhr.unref();
    }
}

function puls(A, payload) {
    const i = String(payload).indexOf("\t");
    const art = String(payload).slice(0, i);
    const text = String(payload).slice(i + 1);
    if (art !== "puls") return ring(A.stempel, `${new Date().toISOString().slice(11, 23)} ${text}`, 8);
    if (A.gemeldet && A.puls && Date.now() - A.puls.an >= A.b.stallMs) console.log(`[stall-akte] Seite #${A.id}: der Puls kehrt zurück nach ${sek(Date.now() - A.puls.an)} s — ${text}`);
    A.gemeldet = false;
    A.puls = { an: Date.now(), text };
    A.pulsN++;
}

const stapelText = (e) =>
    e.callFrames
        .slice(0, 8)
        .map((f) => `${f.functionName || "(anonym)"} ${String(f.url).split("/").pop().split("?")[0]}:${f.location.lineNumber + 1}`)
        .join(" < ");

// CPU je Prozess: zwei Proben im Abstand `ms` am Browser (SystemInfo antwortet ohne den Haupt-Thread der Seite).
async function cpuDelta(b, ms) {
    if (!b.cdp) return { text: "keine Browser-Sitzung", renderer: 0, gpu: 0 };
    const probe = async () => new Map((await b.cdp.send("SystemInfo.getProcessInfo")).processInfo.map((p) => [`${p.type} ${p.id}`, p.cpuTime]));
    try {
        const a = await probe();
        await new Promise((r) => setTimeout(r, ms));
        const z = await probe();
        const d = [...z].map(([k, v]) => [k, v - (a.get(k) || 0)]).sort((x, y) => y[1] - x[1]);
        const anteil = (typ) => Math.max(0, ...d.filter(([k]) => k.startsWith(typ)).map(([, v]) => v)) / (ms / 1000);
        return {
            text: d.filter(([k, v]) => v >= 0.02 || k.startsWith("GPU")).map(([k, v]) => `${k} ${(v / (ms / 1000) * 100).toFixed(0)} %`).join(" · ") || "alles ruht",
            renderer: anteil("renderer"),
            gpu: anteil("GPU"),
        };
    } catch (e) {
        return { text: `SystemInfo: ${(e && e.message) || e}`, renderer: 0, gpu: 0 };
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
    else if (luecke < 3000) urteil = `AWAIT — der Haupt-Thread lebt (Puls vor ${sek(luecke)} s), ein Versprechen der Seite kehrt nie zurück; zuletzt ${letzt}`;
    else if (stapel) urteil = `JS-SCHLEIFE — der Haupt-Thread rechnet in ${stapelText(stapel).split(" < ")[0]}`;
    else if (cpu.renderer >= 0.5) urteil = `NATIV — der Haupt-Thread rechnet in einem nativen Aufruf (${(cpu.renderer * 100).toFixed(0)} %, kein JS-Stapel); zuletzt ${letzt}`;
    else if (cpu.gpu >= 0.5) urteil = `GPU-PROZESS — der Haupt-Thread wartet nativ, der GPU-Prozess rechnet (${(cpu.gpu * 100).toFixed(0)} %); zuletzt ${letzt}`;
    else urteil = `VERKLEMMUNG — der Haupt-Thread wartet nativ, kein Prozess rechnet; zuletzt ${letzt}`;
    const z = [`═══ ${path.basename(process.argv[1] || "?")} · Seite #${A.id} ${kurz(page.url())} · ${grund}`];
    for (const o of A.offen.values()) z.push(`offen ${o.was} seit ${sek(Date.now() - o.an)} s`);
    z.push(A.puls ? `Puls ${A.pulsN}×, zuletzt vor ${sek(luecke)} s — ${A.puls.text}` : "Puls nie");
    for (const s of A.stempel) z.push(`Stempel ${s}`);
    z.push(`CPU (2 s) ${cpu.text}`);
    z.push(`Stapel ${stapel ? stapelText(stapel) : fragen ? "keine Pause in 6 s — der Haupt-Thread steht NATIV" : A.dbg ? "(nicht gefragt: der Puls lebt oder die Akte fragte schon)" : "(kein Debugger: Zeit-Linse)"}`);
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
    const b = { stderr: [], cdp: null, stapel: !opts.zeit && opts.art !== "echt", stallMs: opts.stallMs || 20000, offen: true };
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
        const info = await adapterZeile(browser, { webgl: opts.art === "webgl" });
        const rot = zeitZeile({ zeit: !!opts.zeit, art: opts.art, info });
        if (rot) melde("zeit-linse", rot);
    }
    return browser;
}

// Auf die Welt warten: anazhRealm steht mit seinem Takt.
async function warteAufWelt(page, frist = 120000) {
    await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
        timeout: frist,
    });
}

// Die Seite der Welt: Null-Renderer wahlweise, laden, auf die Welt warten.
async function oeffneWelt(
    browser,
    { port, pfad = "/index.html", nullRenderer = false, viewport, frist = 120000, warteBis = "networkidle0", warten = true } = {}
) {
    const page = await browser.newPage();
    if (viewport) await page.setViewport(viewport);
    if (nullRenderer)
        await page.evaluateOnNewDocument(() => {
            window.__anazhHeadlessNullRenderer = true;
        });
    await page.goto(`http://127.0.0.1:${port}${pfad}`, { waitUntil: warteBis, timeout: frist });
    if (warten) await warteAufWelt(page, frist);
    return page;
}

// Die Bühne: Mittag · Sonne · Sommer fest (window.__buehne aus AUSGABE_INSTALL).
async function buehne(page) {
    const { AUSGABE_INSTALL } = require("./ausgabe-aufnahme.cjs");
    const da = await page.evaluate(() => typeof window.__buehne === "function");
    if (!da) await page.evaluate(AUSGABE_INSTALL);
    await page.evaluate(() => window.__buehne());
}

module.exports = {
    ROOT,
    MIME,
    REZEPTE,
    GPU_REZEPTE,
    HARMLOS,
    statikServer,
    browserOptionen,
    starteBrowser,
    fehlerSammler,
    warteAufWelt,
    oeffneWelt,
    buehne,
    gesammelteFehler: () => sammlung.fehler.slice(),
    gesammelteAkten: () => akten.slice(),
};

// DER SELBSTTEST DER STALL-AKTE (gate:welt-boot, Null-Rezept, ~20 s): eine Seite in einer JS-Schleife MUSS als JS-SCHLEIFE
// mit dem Namen der Schleife in der Akte stehen, ein nie erfülltes Versprechen als AWAIT am Fristriss, und eine Seite mit
// einem kurzen Block (0,8 s, unter der Schwelle) darf KEINE Akte tragen.
async function selbsttest() {
    const seiten = {
        "/ruhig.html": "<!doctype html><script>setTimeout(function(){var e=performance.now()+800;while(performance.now()<e){}},300)</script>",
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
    const ruhig = await fall("/ruhig.html", () => warte(4500));
    const schleife = await fall("/schleife.html", async () => {
        for (let i = 0; i < 30 && !akten.some((a) => a.urteil); i++) await warte(500);
        await warte(500);
    });
    const haenger = await fall("/haenger.html", (p) => p.evaluate(() => window.__nie()).catch(() => {}));
    await browser.close();
    server.close();
    const urteile = [
        [ruhig.length === 0, `ruhig (0,8 s Block): keine Akte — ${ruhig.length ? ruhig[0].urteil : "keine"}`],
        [
            schleife.length > 0 && /^JS-SCHLEIFE/.test(schleife[0].urteil) && /__stallSchleife/.test(schleife[0].stapel || ""),
            `Schleife: ${schleife.length ? `${schleife[0].urteil} · Stapel ${schleife[0].stapel}` : "KEINE Akte"}`,
        ],
        [haenger.length > 0 && /^AWAIT/.test(haenger[haenger.length - 1].urteil), `Versprechen: ${haenger.length ? haenger[haenger.length - 1].urteil : "KEINE Akte"}`],
    ];
    console.log("=== STALL-AKTE SELBSTTEST (gate:welt-boot) ===");
    for (const [ok, text] of urteile) console.log(`  ${ok ? "✅" : "❌"} ${text}`);
    const rot = urteile.filter(([ok]) => !ok).length;
    console.log(rot ? `ROT — ${rot} Fall/Fälle ohne Täter-Namen` : "GRÜN — die Akte nennt Schleife und Versprechen beim Namen, ein kurzer Block bleibt still");
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
