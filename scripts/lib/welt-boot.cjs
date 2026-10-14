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
// Die Wand: gate:altlasten DIE BOOT-WAND — ein Start außerhalb dieser Datei ist ROT, die Liste der noch eigenen Starts
// darf nur schrumpfen.
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { linsenWebGpuArgs, echteWebGpuArgs, adapterZeile } = require("./software-gpu.cjs");

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

// Die Browser-Rezepte. null: kein GPU-Prozess (die Seite setzt __anazhHeadlessNullRenderer) · webgl: WebGL2 auf
// swiftshader (ANGLE) · standard: Chromes eigene Wahl headless · linse: WebGPU an der Weiche (lokal die Karte, die CI swiftshader) · echt: der Hardware-Adapter.
const REZEPTE = {
    null: () => ["--no-sandbox", "--disable-gpu"],
    webgl: () => ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    standard: () => ["--no-sandbox", "--disable-setuid-sandbox"],
    linse: () => linsenWebGpuArgs(),
    echt: () => echteWebGpuArgs(),
};

// Die Start-Optionen aus dem Rezept: `frist` = protocolTimeout (ms), `zusatz` = weitere Schalter hinter dem Rezept,
// `viewport` = defaultViewport, `profil` = userDataDir; `headless` steht, wenn nichts gesagt ist (echt: mit Fenster nur,
// wenn gesagt).
function browserOptionen({ art, frist, zusatz = [], headless = true, viewport, profil, dumpio } = {}) {
    if (!REZEPTE[art]) throw new Error(`welt-boot: unbekanntes Rezept "${art}" — erlaubt: ${Object.keys(REZEPTE).join(" · ")}`);
    const o = { headless };
    if (profil != null) o.userDataDir = profil;
    if (frist != null) o.protocolTimeout = frist;
    if (viewport !== undefined) o.defaultViewport = viewport;
    if (dumpio != null) o.dumpio = dumpio;
    o.args = [...REZEPTE[art](), ...zusatz];
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

// Der Browser über die EINE Weiche, jede Seite am Fehler-Sammler, die Linse nennt ihren Adapter.
async function starteBrowser(opts = {}) {
    const puppeteer = require("puppeteer");
    if (opts.erwartet) sammlung.erwartet = opts.erwartet;
    wacheAnProzessEnde();
    const browser = await puppeteer.launch(browserOptionen(opts));
    let abbau = false;
    const zu = browser.close.bind(browser);
    browser.close = (...a) => ((abbau = true), zu(...a));
    browser.on("disconnected", () => {
        if (!abbau) melde("absturz", "Browser getrennt ohne Abbau");
    });
    const neu = browser.newPage.bind(browser);
    browser.newPage = async (...a) => fehlerSammler(await neu(...a));
    for (const p of await browser.pages()) fehlerSammler(p);
    browser.on("targetcreated", async (t) => {
        if (t.type() !== "page") return;
        try {
            fehlerSammler(await t.page());
        } catch (_e) {
            // ein Ziel, das vor dem Anheften stirbt, meldet sich über disconnected/close
        }
    });
    // jede WebGPU-Linse nennt den Adapter, den der Browser WIRKLICH liefert (gate:start-rezept W4)
    if (opts.art === "linse" || opts.art === "echt") await adapterZeile(browser);
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
    HARMLOS,
    statikServer,
    browserOptionen,
    starteBrowser,
    fehlerSammler,
    warteAufWelt,
    oeffneWelt,
    buehne,
    gesammelteFehler: () => sammlung.fehler.slice(),
};
