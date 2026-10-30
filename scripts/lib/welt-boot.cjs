// welt-boot.cjs — DER EINE WELT-BOOT jeder Linse: Server, Browser und Fehler-Sammler leben EINMAL:
//   statikServer()   der Statik-Server der Welt (Wurzel des Repos, `/` → index.html, nie aus der Wurzel heraus)
//   starteBrowser()  der Browser über die EINE Adapter-Weiche (Rezepte: null · webgl · linse · echt, software-gpu.cjs)
//                    + der FEHLER-SAMMLER an jeder Seite: pageerror (auch unbehandelte Rejections), console.error,
//                    Absturz der Seite, Trennung des Browsers ohne Abbau — jeder Fehler macht den Lauf ROT mit Namen,
//                    nie Exit 0 (die Wache sitzt am Prozess-Ende: ein Exit 0 mit gesammeltem Fehler wird Exit 1);
//                    eine Linse trägt KEINEN eigenen pageerror-Sammler daneben (gate:welt-boot nennt jeden Zwilling beim Namen)
//   halteBis()       eine Taste halten, bis ihr Ereignis eintritt (nie nach der Wanduhr, gate:apparat Klinge 5)
//   buehne()         die Bühne (Mittag · Sonne · Sommer, scripts/lib/ausgabe-aufnahme.cjs)
//   uferStellen      (Seite) ein Leser der Szenen-Tiefe im Blick, der zeichnet: das Wasser am Bach der Mess-Wiese
//   DIE STALL-AKTE ein Hänger der Seite steht mit Täter im Log (unten); `--selbsttest` (gate:welt-boot) beweist es
// Die Wand: gate:altlasten DIE BOOT-WAND — ein Start außerhalb dieser Datei ist ROT, die Liste der noch eigenen Starts
// darf nur schrumpfen.
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { linsenWebGpuArgs, linsenWebglArgs, echteWebGpuArgs, adapterZeile, zeitZeile } = require("./software-gpu.cjs");
const { ohneKommentare, ast, wandere, zeileVon } = require("./stamm.cjs");

// DER EINE SCHLAF (`await sleep(ms)`): in Node der Export, in jeder Seite derselbe Text als `window.sleep` (`WARTEN_SEITE`) —
// eine Probe schläft in beiden Welten mit demselben Ruf, ein eigenes `new Promise((r) => setTimeout(r, ms))` ist ein Zwilling
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// DIE EINE WELT JEDER SEITE (`r`, `st`): jede Seite trägt `r` (window.anazhRealm) und `st` (ihr Zustand, den nur der Konstruktor
// setzt) als Getter (`WARTEN_SEITE`, vor jedem Skript) — eine Seiten-Funktion liest Welt und Zustand bei diesen Namen, ein eigenes
// `const r = window.anazhRealm` / `const st = r.state` ist ein Zwilling (872 Bindungen fielen in w3u-nachfolge); wer einen
// der Namen schreibt (ein fremdes Skript), bekommt eine gewöhnliche Variable
const weltR = `for (const [n, f] of [["r", () => window.anazhRealm], ["st", () => window.anazhRealm && window.anazhRealm.state]]) Object.defineProperty(window, n, { get: f, set: (v) => Object.defineProperty(window, n, { value: v, writable: true }), configurable: true });`;
// DIE UHR DES LAUFS (`const log = laufUhr()`): jede Zeile trägt die Sekunden seit dem Ruf — je Linse ein eigenes `T0` samt
// eigenem log war ein Zwilling
const laufUhr =
    (T0 = Date.now()) =>
    (z) =>
        console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);

// DAS EINE __codeOf: jede Seite trägt vor ihrem ersten Skript `window.__codeOf` (Code ohne Kommentare, der EINE Stripper
// aus stamm.cjs), `window.__dokuOf` (ungestrippt, für Marker im Kommentar) und `window.__fehlt(fn, re)` (true = das Muster
// fehlt im Code; was keine Funktion ist, wirft). Die Wand: gate:betriebsgesetz STRIPPER-WAND.
// DAS EINE WARTEN DER LINSEN (K-WANDUHR, Lehre 26: in Bau-Ereignissen, nie in Wanduhr-Sekunden) — Seiten-Funktionen als Text
// in jede Seite (`WARTEN_SEITE`): `window.__seitenTakt()` ist ein Bild des Loops, ruht er, ein Takt von Hand.
async function seitenTakt() {
    const vor = r._weltStand ? r._weltStand.takte : -1;
    await new Promise((ok) => requestAnimationFrame(ok));
    if ((r._weltStand ? r._weltStand.takte : -1) === vor) r._gameLoopTick(performance.now());
}
// DAS EINE EINSCHWINGEN (`await window.__weltStehtNach(takt, max)`): Takt um Takt (`takt(n)` oder der Takt der Seite, mindestens
// einer), bis die Welt steht (`_weltSteht`) und das Buch da ist; der Regler hält, solange sie schwingt. Der Deckel `max` zählt
// nur Takte ohne Offenes (`_weltOffen`); dann wirft er.
async function weltStehtNach(takt, max) {
    const st = r.state;
    const W = () => r._weltStand || {};
    const steht = () => r._weltSteht() && !r._bepflanzungWartet();
    const regler = st.perfRegulator;
    st.perfRegulator = false;
    let n = 0;
    try {
        for (
            const weiter = window.__deckel("die Welt", max || 1800, () => r._bepflanzungWartet());
            !(n && steht()) && weiter();
            n++
        ) {
            await (takt || window.__seitenTakt)(n);
            if (n % 5 === 4) await sleep(10);
        }
    } catch (f) {
        throw new Error(
            `DIE WELT STEHT NICHT nach ${n} Takten: ` +
                (r._bepflanzungWartet() ? "das Buch fehlt" : `Ruhe ${W().ruhe | 0}, zuletzt brach sie: ${W().grund}`) +
                ` (${f.message})`
        );
    } finally {
        st.perfRegulator = regler;
    }
    return n;
}
// DAS EINE WARTEN AUF EINEN BAU (`await window.__gebautNach(e, { takt, fertig, bau, max })`): Takt um Takt, bis `fertig()` (sonst
// `_archIsRendered(e)`) steht; vor jedem Takt ruft `bau(n)` ihn (ohne: `_rebuildArchitectureMesh(e)`). `e` ist ein Eintrag oder
// der NAME dessen, was die Welt bauen soll. Der Deckel `max` zählt nur Takte ohne Offenes (`_weltOffen`); dann wirft sie beim Namen.
async function gebautNach(e, { takt, fertig, bau, max, offen, warum } = {}) {
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
            await sleep(); // die Antwort des Workers landet zwischen zwei Takten
        }
    } catch (f) {
        // `warum()` nennt das Teil-Prädikat, das nicht steht
        if (warum) f.message += ` — ${warum()}`;
        throw f;
    }
    return n;
}
// DER EINE DECKEL jeder wartenden Schleife (`for (const weiter = window.__deckel(name, max, offen); weiter(); )`): er zählt einen
// Gang nur, wenn weder die Welt (`_weltOffen`) noch die Linse (`offen()`) offen hat, und wirft nach `max` (120) beim Namen;
// `offen === false`: jeder Gang zählt. Ein Offenes, das sich 3600 Gänge nicht rührt, wirft beim Namen.
function deckel(name, max, offen) {
    let n = 0,
        k = 0,
        still = 0,
        vor = "";
    return () => {
        const o = r && r._weltOffen ? r._weltOffen() : { welt: 1 };
        const auf = Object.values(o).some(Boolean);
        const jetzt = JSON.stringify(o);
        still = auf && jetzt === vor ? still + 1 : 0;
        vor = jetzt;
        if (still > 3600)
            throw new Error(`DIE WELT HÄNGT: ${name} nach ${n} Takten — offen ${jetzt} ohne Bau-Ereignis`);
        if ((offen === false || (!auf && !(offen && offen()))) && ++k > (max || 120))
            throw new Error(
                `DER BAU STEHT NICHT: ${name} nach ${n} Takten — ${offen === false ? "die Linse zählte jeden Gang" : "die Welt hat nichts mehr offen"}`
            );
        return ++n > 0;
    };
}
// DIE WELT IST DA (`await window.__weltDa((r) => bedingung)`): bis der Stamm lebt (`_gameLoopTick`) und die Bedingung gilt — ohne
// Frist: hängt der Boot, nennt ihn die Stall-Akte samt der Bedingung, auf die er wartet (`__weltDaWartet`, im Puls jeder
// Sekunde).
async function weltDa(bed) {
    window.__weltDaWartet = bed ? String(bed).replace(/\s+/g, " ").slice(0, 160) : "den Stamm";
    // erst das Erwachen des Boots (`erwacht`: init samt der Heimat aus dem Faden) — eine Linse, die vorher taktet, taktet
    // eine halbe Welt (der Spieler fällt, ehe die Tiere geboren sind)
    while (!(r && r.erwacht)) await sleep(50);
    await r.erwacht;
    for (let r; !((r = window.anazhRealm) && typeof r._gameLoopTick === "function" && (!bed || bed(r)));)
        await sleep(50);
    window.__weltDaWartet = null;
    return r;
}
// DER EINE ABDRUCK einer Gestalt (`window.__abdruck(x, alle)`): FNV-1a über die Puffer einer Gruppe (traverse), eines Flats (je
// Geometrie seiner Blätter einmal, ohne Schatten-Zwilling) oder einer Geometrie — die Lage, mit `alle` jedes Attribut und der
// Index (ein Farb-Regler bewegt die Vertex-Farbe, nie die Lage); „hash/Teile".
function abdruck(x, alle) {
    let [h, n] = [0x811c9dc5, 0];
    const ein = (a) => {
        const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        for (let i = 0; i < u.length; i++) h = Math.imul(h ^ u[i], 0x01000193);
    };
    const geo = (g) => {
        const at = g && g.attributes;
        if (!at || !at.position) return;
        n++;
        for (const k of alle ? Object.keys(at).sort() : ["position"]) ein(at[k].array || at[k].data.array);
        if (alle && g.index) ein(g.index.array);
    };
    if (x && x.leaves) for (const g of new Set(x.leaves.filter((l) => !l.shadowTwin).map((l) => l.geom))) geo(g);
    else if (x && x.traverse) x.traverse((o) => geo(o.geometry));
    else geo(x);
    return (h >>> 0).toString(16) + "/" + n;
}
// DER STAND DER LEBENDEN WELT, wie der Speicher-Faden ihn schrieb (`await window.__stand()`): alles Gesendete fest, dann sein JSON
// aus IndexedDB — der Leser jedes Save-Rundlaufs (der Platz im localStorage trägt nur abgelegte und verlassene Welten).
async function stand() {
    await r._speicherStill();
    return (await r._idbGetWorld(r.state.worldMeta.worldId)).json;
}
// DAS BILD ALS PNG: in jeder Seite `window.__png(u8, W, H)` — RGBA-Bytes W×H (ein Schuss, eine Maske) deckend als Daten-URL,
// in Node `pngDatei(datei, url)` schreibt sie; bis dahin baute jede Bild-Linse ihre Leinwand und ihren Puffer selbst
function png(u8, W, H) {
    const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
    const d = Uint8ClampedArray.from(u8.subarray(0, W * H * 4), (v, i) => (i % 4 === 3 ? 255 : v));
    cv.getContext("2d").putImageData(new ImageData(d, W, H), 0, 0);
    return cv.toDataURL("image/png");
}
// ALLE BÜNDEL DER SZENE NEU (`window.__bundlesNeu()`): ein Bündel, das vor einer Sicht-Änderung aufnahm, zeichnet beim nächsten
// Bild neu (eine Linse blendet Klassen aus und ein, die Bühne wechselt)
const bundlesNeu = () => r.state.scene.traverse((o) => o.isBundleGroup && (o.needsUpdate = true));
const pngDatei = (datei, url) => fs.writeFileSync(datei, Buffer.from(url.split(",")[1], "base64"));
const WARTEN_SEITE = `${weltR} window.__png = ${png}; window.__bundlesNeu = ${bundlesNeu}; window.sleep = ${sleep}; window.__seitenTakt = ${seitenTakt}; window.__weltStehtNach = ${weltStehtNach}; window.__gebautNach = ${gebautNach}; window.__deckel = ${deckel}; window.__weltDa = ${weltDa}; window.__abdruck = ${abdruck}; window.__stand = ${stand};`;
const CODE_OF_SEITE = `window.__codeOf = ((oK) => (f) => oK(String(f)))(${ohneKommentare}); window.__dokuOf = (f) => String(f); window.__fehlt = (f, re) => [].concat(f).every((g, i) => { if (typeof g !== "function") throw new Error("__fehlt: Glied " + i + " ist keine Funktion (" + typeof g + ") — die Absenz misst nichts"); re.lastIndex = 0; return !re.test(window.__codeOf(g)); }); ${WARTEN_SEITE}`;

const ROOT = path.resolve(__dirname, "..", "..");
// DER STUDIO-KERN in Node: three-r128 (einmal je Prozess — die Kerne bauen gegen das globale THREE) und der Kern `datei` (ab
// der Wurzel) → `globalThis[name]`; `frisch` lädt ihn neu (die Stoffe rechnen ihre Farbe beim ersten Bau). Bis zur Decke
// w3s-sukzession lud jede Linse three und Kern in eigenen Zeilen (fünfzehn Mal).
function studioKern(datei, name, frisch) {
    global.THREE ||= require(path.join(ROOT, "worlds/terrain/lib/three-r128.min.js"));
    if (frisch) delete require.cache[require.resolve(path.join(ROOT, datei))];
    require(path.join(ROOT, datei));
    return globalThis[name];
}
// DER SCOPE EINES FADENS in Node: ein frischer vm-Kontext wie im Foundry-Worker — `self` · `globalThis` · `window` sind das
// globale Objekt, Math das des Gates (die Plattform-Probe erreicht so den Guss) — darin die `quellen` (Pfade ab der Wurzel, je
// Prozess einmal gelesen) der Reihe nach. Bis zur Decke w3s-sukzession baute jede Linse ihn selbst (vier Mal).
const QUELL_TEXT = {};
function fadenScope(quellen) {
    const sb = { console, Math, performance: { now: () => Date.now() }, setTimeout, clearTimeout };
    sb.self = sb.globalThis = sb.window = sb;
    require("vm").createContext(sb);
    for (const f of quellen) require("vm").runInContext((QUELL_TEXT[f] ||= fs.readFileSync(path.join(ROOT, f), "utf8")), sb, { filename: f });
    return sb;
}

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

// Der Statik-Server: die Datei unter der Wurzel (`/` heißt `start`, außerhalb 403, fehlt 404); `seiten` liefert eigene Seiten
// nach Pfad (Text, Puffer, Funktion, auch als Promise), `keinCache` setzt no-store; `wandle(pfad, daten)` ist der EINE Haken der
// Selbsttests (null heißt 404). Ein Wurf im Haken oder in einer Seite ist 500 und ein Fehler beim Namen.
// Der EINE Server-Start und die EINE Welt-Adresse: `await server.lausche(port)` (127.0.0.1, 0 = frei) und
// `server.zeige(seite, frist, rest = "index.html", warte = "domcontentloaded")` fährt die Seite an die Adresse, an der der Server
// WIRKLICH lauscht — eine Linse mit eigenem listen-Versprechen oder eigener 127.0.0.1-Adresse daneben ist ein Zwilling (gate:welt-boot).
function statikServer({ root = ROOT, start = "/index.html", seiten = null, keinCache = false, wandle = null } = {}) {
    const bruch = (res, p, e) => {
        melde("server", `${p}: ${(e && (e.stack || e.message)) || e}`);
        res.statusCode = 500;
        res.end();
    };
    const server = http.createServer((req, res) => {
        let p;
        try {
            p = decodeURIComponent(req.url.split("?")[0]);
        } catch {
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
    server.lausche = (port) => new Promise((ok) => server.listen(port, "127.0.0.1", () => ok(server)));
    server.zeige = (seite, frist, rest = "index.html", warte = "domcontentloaded") =>
        seite.goto(`http://127.0.0.1:${server.address().port}/${rest}`, { waitUntil: warte, timeout: frist });
    return server;
}

// Die Browser-Rezepte: null (kein GPU-Prozess, der Null-Renderer) · webgl (WebGL2 an der Weiche) · standard (Chromes Wahl) ·
// linse (WebGPU an der Weiche: lokal die Karte, die CI swiftshader) · echt (der Hardware-Adapter); `zeit: true` → swiftshader.
const REZEPTE = {
    null: () => ["--no-sandbox", "--disable-gpu"],
    webgl: (o) => linsenWebglArgs(process.env, process.platform, o),
    standard: () => ["--no-sandbox", "--disable-setuid-sandbox"],
    linse: (o) => linsenWebGpuArgs(process.env, process.platform, o),
    echt: () => echteWebGpuArgs(),
};
// DIE KLASSE DER CI: diese Rezepte zeichnen mit einem Echt-Renderer; in einer CPU-Gruppe (CI_KLASSE) ist eines ROT beim Namen,
// eines, das nie zeichnet, in jeder Gruppe (browser.close).
const GPU_REZEPTE = ["linse", "webgl", "echt"];

// Die Start-Optionen: `frist` = protocolTimeout (ms), `zusatz` hinter dem Rezept, `viewport`, `profil` = userDataDir; headless.
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

// DER FEHLER-SAMMLER: eine Liste je Prozess, die Wache am Prozess-Ende. Harmlos ist nur Netz/Favicon/save-server im
// headless-Kontext und was die Linse als `erwartet` nennt.
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
    // ab `selbsttest(name)` setzt die Linse ihren Täter selbst: was die Seite meldet, steht als SELBSTTEST
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
        // ein Budget-Bruch ist ein KOSTEN-Urteil mit eigenem Richter (gate:asset-contract, regler-wirkt), kein Absturz der Welt
        if (KOSTEN.test(t)) return console.log(`[welt-boot] KOSTEN (Richter gate:asset-contract): ${t.slice(0, 300)}`);
        melde("console.error", t);
    });
    return page;
}

// ── DIE STALL-AKTE: ein Hänger der Seite hat einen Namen — der PULS (ein Binding, je Sekunde mit der Phase) zeigt, ob der
// Haupt-Thread lebt; die STEMPEL gehen hinaus, bevor ein Aufruf blockiert; Debugger.pause liefert den Stapel einer JS-Schleife
// (ein nativer Block antwortet nicht — dann sprechen CPU je Prozess, Stempel und Stderr).
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
        } catch {
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
        const st = r && r.state;
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
        const st = r && r.state;
        const t = [document.readyState];
        if (document.visibilityState === "hidden") t.push("verborgen");
        if (st) {
            t.push(`renderer ${st.rendererReady === true ? "bereit" : "—"}`, `weltbild ${st._weltbildDa ? "da" : "—"}`);
            if (st.flightRecorder) t.push(`frames ${st.flightRecorder.frames}`);
            const W = r._weltStand; // worauf das Einschwingen wartet (`__weltStehtNach`), beim Namen
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

// die Seite merkt, ob sie die GPU nimmt (Gerät, Renderer, Pipeline, Draw — nie die Adapter-Frage)
function zeichnetHaken() {
    const merke = (f) =>
        function (...a) {
            try {
                window.top.__gpuGenutzt = true;
            } catch {
                window.__gpuGenutzt = true;
            }
            return f.apply(this, a);
        };
    for (const K of [
        window.GPUAdapter,
        window.GPUQueue,
        window.GPUDevice,
        window.WebGL2RenderingContext,
        window.WebGLRenderingContext,
    ])
        for (const m of [
            "requestDevice",
            "submit",
            "createRenderPipeline",
            "createComputePipeline",
            "getSupportedExtensions",
            "drawArrays",
            "linkProgram",
        ])
            if (K && K.prototype[m]) K.prototype[m] = merke(K.prototype[m]);
}
// DIE WEICHE: ein Echt-Rezept, dessen Welt-Seiten nie zeichnen, belegt eine GPU-Gruppe (und die Karte) umsonst — ROT beim Namen
async function weicheUrteil(browser, art) {
    const welt = (await browser.pages().catch(() => [])).filter((p) => /^https?:/.test(p.url()));
    const genutzt = async (p) => p.evaluate(() => !!window.__gpuGenutzt).catch(() => true);
    if (!GPU_REZEPTE.includes(art) || !welt.length || (await Promise.all(welt.map(genutzt))).some(Boolean)) return null;
    return `${path.basename(process.argv[1] || "?")} startet „${art}" und zeichnet nie (keine seiner ${welt.length} Seiten arbeitet auf der GPU): das Rezept ist „null"`;
}
// Je Seite: Ringe, Puls-Binding, Debugger (nur ohne Zeit-Urteil: ein Debugger färbt keine ms), umhüllte Aufrufe.
function akteAnSeite(page, b) {
    if (!page.__akteBereit)
        page.__akteBereit = Promise.all([
            page.evaluateOnNewDocument(CODE_OF_SEITE),
            page.evaluateOnNewDocument(zeichnetHaken),
            akteAnlegen(page, b),
        ]);
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

// DIE FÄDEN DES GPU-PROZESSES (Linux, /proc/<pid>/task): wer dort rechnet, nach Faden-Namen (swiftshader `Thread<NN>`,
// `CrGpuMain`, ANGLE, Compositor); Ticks = utime + stime (Felder 14 und 15).
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
            } catch {
                // der Faden endete zwischen Liste und Lesen
            }
        }
    } catch {
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
        await sleep(ms);
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
            } catch {
                // die Browser-Sitzung geht mit dem Browser
            }
        }, 2000);
        uhr.unref();
    }
    let abbau = false;
    const zu = browser.close.bind(browser);
    browser.close = async (...a) => {
        const rot = await weicheUrteil(browser, opts.art);
        if (rot) melde("klasse", rot);
        [abbau, b.offen] = [true, false];
        return zu(...a);
    };
    browser.on("disconnected", () => {
        b.offen = false;
        if (!abbau) melde("absturz", "Browser getrennt ohne Abbau");
    });
    // jede neue Seite — auch die eines eigenen Kontexts — trägt ihre Werkzeuge vor dem ersten Skript (bis w3u-nachfolge hängte
    // `targetcreated` sie an die Kontext-Seite erst nach dem Start ihres ersten Dokuments)
    const angelegt = (neu) => async (...a) => {
        const p = fehlerSammler(await neu(...a));
        await akteAnSeite(p, b);
        return p;
    };
    browser.newPage = angelegt(browser.newPage.bind(browser));
    const kontext = browser.createBrowserContext.bind(browser);
    browser.createBrowserContext = async (...a) => {
        const k = await kontext(...a);
        k.newPage = angelegt(k.newPage.bind(k));
        return k;
    };
    for (const p of await browser.pages()) await akteAnSeite(fehlerSammler(p), b);
    browser.on("targetcreated", async (t) => {
        if (t.type() !== "page") return;
        try {
            const p = await t.page();
            if (p) await akteAnSeite(fehlerSammler(p), b);
        } catch {
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

// Der Null-Renderer (die Seite zeichnet nichts: `__anazhHeadlessNullRenderer`, der Schalter des Stamms; die Foundry baut auch
// ohne Bild, `_foundryEnabled`) — EINMAL hier, jede Linse ohne Bild ruft ihn vor dem Laden;
// `warteAufWelt` wartet, bis die Welt ihren Takt trägt — die EINE Warte jeder Linse.
async function nullRenderer(page) {
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
}
// DIE NULL-SEITE: der Browser im Rezept null und seine erste Seite mit dem Null-Renderer — der Start jeder Linse ohne Bild
// (`opts` wie `starteBrowser`), EINMAL hier statt in jeder Linse.
async function nullSeite(opts) {
    const browser = await starteBrowser(Object.assign({ art: "null" }, opts));
    const page = await browser.newPage();
    await nullRenderer(page);
    return { browser, page };
}
async function warteAufWelt(page, frist = 120000) {
    await page.waitForFunction(() => r && typeof r._gameLoopTick === "function", {
        timeout: frist,
    });
}

// Eine Taste HALTEN, bis `ziel` auf `seite` (Page oder Frame) wahr wird — nie nach der Wanduhr (gate:apparat Klinge 5); `taste`
// über die Tastatur, sonst `druck`/`los`; losgelassen wird immer. → { erreicht, ms, wert }
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

// DER LESER IM BLICK (Seite): der Spieler am Bach der Mess-Wiese, zurück, sobald das Wasser ZEICHNET, das Tiefen-Abbild gezogen
// ist und das Weltbild steht (`welt`: nur diese Terme); `kappe`: die Pixel-Kappe des Holzes.
async function uferStellen(opts) {
    await window.__weltDa(
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
        takt: async () => (fern() || r._ensureFarWaterSheet(), await sleep(100)),
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

// DER PRÜFER EINER LINSE (die Zeile je Urteil): `check(name, ok, detail)` schreibt ✅/❌ und sammelt jedes Rot in `errs`.
function pruefer() {
    const errs = [];
    // ein Detail, das kein Text ist, schreibt die Prüfung selbst als JSON (kein JSON.stringify je Aufrufer)
    const check = (name, ok, detail) => {
        const z = typeof detail === "object" && detail ? JSON.stringify(detail) : detail;
        console.log(`  ${ok ? "✅" : "❌"} ${name}${z ? " — " + z : ""}`);
        if (!ok) errs.push(name);
    };
    return { errs, check, wandEnde };
}

// DAS ENDE EINER WAND: das EINE Urteil (`urteilEnde`) über die gesammelten Verletzungen — ROT mit Exit 1 und jeder
// Verletzung beim Namen, sonst der Grün-Satz mit Exit 0 (kein `process.exit(0)` danach).
function wandEnde(errs, satz) {
    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`, "\n✅ GRÜN — " + satz);
}

// DIE TÄTER-FÄLLE eines Selbsttests ohne Browser: je Fall `[name, tat, muss]` (die Tat an einem frischen `klon()`, ohne eigenen
// klon eine Kopie des grünen Laufs `gruen`) oder `{ name, z, muss }` das Urteil; jedes `muss` (ein Muster oder eine Liste) trifft
// einen Befund, `null` verlangt keinen — sonst steht der Fall beim Namen in `fehler`. `selbsttestEnde` schließt: ROT mit Exit 1,
// sonst der Grün-Satz. `tatAn(pfad, wert)`: die Tat, die wert in z am Pfad „a.b.c" setzt (leer: z selbst).
const tatAn = (pfad, wert) => (z) => Object.assign((pfad ? pfad.split(".") : []).reduce((o, k) => o[k], z), wert);
function taeterFaelle(faelle, urteil, { fehler = [], gruen, klon = () => JSON.parse(JSON.stringify(gruen)) } = {}) {
    for (const f of faelle) {
        const [name, tat, muss] = Array.isArray(f) ? f : [f.name, null, f.muss];
        const z = tat ? klon() : f.z;
        if (tat) tat(z);
        const v = urteil(z);
        const fehlt =
            muss == null ? v.slice(0, v.length && 1) : [].concat(muss).filter((re) => !v.some((s) => re.test(s)));
        for (const re of fehlt) fehler.push(`${name}: die Wand nennt den Täter nicht (${re})`);
        console.log(
            `  ${fehlt.length ? "❌" : "✅"} Selbsttest „${name}" → ${muss == null ? "grün" : "rot"}: ${v.join(" · ") || "(nichts)"}`
        );
    }
    return fehler;
}
function selbsttestEnde(fehler, satz = "jeder injizierte Täter fällt rot und wird beim Namen genannt.") {
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — " + satz);
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
// DER EINE ABSTURZ-FÄNGER: `hauptLauf(async () => …)` fährt den Rumpf eines Skripts; wirft er, nennt die Zeile das Skript beim
// Namen mit dem Stapel, `zuletzt` räumt eigene Kinder-Prozesse, und der Lauf endet mit 2 — nie still grün (Lehre 6)
const hauptLauf = (rumpf, zuletzt) =>
    rumpf().catch((e) => {
        console.error(`${path.basename(process.argv[1] || "-e")} ABSTURZ:`, (e && e.stack) || e);
        if (zuletzt) zuletzt();
        process.exit(2);
    });
// DER EINE ARGUMENT-LESER einer Linse: `argOpt("--port", 4490)` — der Wert hinter dem Schalter, fehlt er (oder folgt ein
// Schalter), die Vorgabe
const argOpt = (k, d) => {
    const a = process.argv;
    const i = a.indexOf(k);
    return i >= 0 && a[i + 1] && !a[i + 1].startsWith("--") ? a[i + 1] : d;
};
// DAS EINE URTEIL AM ENDE einer Linse: `urteilEnde(rot, roteZeile, grueneZeile)` — rot (Zahl, Liste der Länge oder wahr) nennt die
// rote Zeile auf stderr und endet mit Exit 1, sonst die grüne auf stdout mit Exit 0 (Lehre 9: der Exit spricht); eine Zeile, die
// nur auf ihrer Seite gilt (sie liest den Befund), steht als Funktion und wird erst dort gelesen
const urteilEnde = (rot, roteZeile, grueneZeile) => {
    const z = (x) => (typeof x === "function" ? x() : x);
    if (rot) {
        console.error(z(roteZeile));
        process.exit(1);
    }
    console.log(z(grueneZeile));
    process.exit(0);
};
// DER EINE RUF an die Werkbank (POST JSON, ohne Frist; kein JSON: `{ roh }`)
function werkbankRuf(port, weg, nutzlast) {
    return new Promise((res, rej) => {
        const req = http.request(
            { host: "127.0.0.1", port, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(JSON.stringify(nutzlast || {}));
    });
}
// --teil=k/n: Teil k von n Gruppen der CI, ohne --teil null (alles)
function teilAus(argv) {
    const a = argv.find((x) => x.startsWith("--teil="));
    if (!a) return null;
    const m = /^--teil=(\d+)\/(\d+)$/.exec(a);
    if (!m || !(+m[1] >= 1 && +m[1] <= +m[2])) throw new Error(`${a}: erwartet --teil=k/n mit 1 <= k <= n`);
    return { k: +m[1], n: +m[2] };
}
// DIE WERKBANK ALS TOR: `werkbank start`, bereit am Ereignis; jeder Befehl ohne Frist (ein Hänger endet am protocolTimeout der Seite)
function werkbankTor(port, zusatz = []) {
    const cp = require("child_process");
    const wb = path.join(ROOT, "scripts", "werkbank.cjs");
    const env = Object.assign({}, process.env, { WERKBANK_PORT: String(port) });
    const kind = cp.spawn(process.execPath, [wb, "start", "--port", String(port), ...zusatz], { env });
    const tor = {
        log: "",
        rufe: (args, ms) => cp.spawnSync(process.execPath, [wb, ...args], { env, encoding: "utf8", timeout: ms }),
    };
    tor.bereit = new Promise((ok, nein) => {
        for (const s of [kind.stdout, kind.stderr]) s.on("data", (d) => /WERKBANK bereit/.test((tor.log += d)) && ok());
        kind.on("exit", (c) => nein(new Error(`die Werkbank endete vor dem Start (Exit ${c})`)));
    });
    tor.stop = () => (tor.rufe(["stop"], 30000), kind.kill());
    return tor;
}
// wartet, bis `fn(...args)` in der Seite wahr ist (das Ereignis, je 150 ms gefragt), und gibt die Wartezeit zurück — ohne Frist:
// ein Hänger endet an der Frist des Browsers (`frist` = protocolTimeout), die Stall-Akte nennt ihn mit `label`
async function waitFor(page, fn, label, ...args) {
    const t0 = Date.now();
    await page.evaluate((l) => (window.__weltDaWartet = l), label).catch(() => {});
    await page.waitForFunction(fn, { polling: 150, timeout: 0 }, ...args);
    await page.evaluate(() => (window.__weltDaWartet = null)).catch(() => {});
    return Date.now() - t0;
}

// DER BOOT, BIS DIE WELT STEHT (diag-pruefbuehne · diag-worker-dichte; der Null-Renderer: die Probe braucht Main und Worker,
// kein Bild): nach dem Erwachen (`__weltDa`) Takte des Spiels, bis mehr als 4 Chunks stehen und der Worker den Worldgen-
// Stand trägt — {ok, ms, seed}; am Deckel `name` (7,5 s) {ok: false}
function booteWelt(page, name = "der Boot der Welt") {
    return page.evaluate(async (name) => {
        const start = performance.now();
        await window.__weltDa();
        for (const weiter = window.__deckel(name, 7500); weiter();) {
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch {
                    /* der Boot reift */
                }
                const s = r.state;
                if (s && s.voxelChunks && s.voxelChunks.size > 4 && s.voxelWorkerReady && s.voxelWorkerWorldgenSynced)
                    return { ok: true, ms: Math.round(performance.now() - start), seed: s.worldMeta.seed };
            }
            await sleep(16);
        }
        return { ok: false };
    }, name);
}

// ZWEI SEITEN IM MESH (smoke-webrtc · smoke-copresence): save- und signaling-server auf den eigenen Ports (`eigenePorte` der
// Variablen portEnv, signalEnv), im Browser des Aufrufers (sein Rezept) die Seiten A und B (1024×640); beide laden das Spiel, bis init
// durchlief (`_gameLoopTick`: init wartet auf den IndexedDB-Vorlauf, BEVOR es die Welt wählt und die Auto-Verbindung prüft —
// ein Raum-Beitritt davor fiele in init hinein), `vor(seite, i)` läuft vor dem Beitritt (die Namen der Ko-Präsenz), dann
// tritt jede demselben Raum bei (der roomOverride zwingt Seiten verschiedener worldId zusammen), bis beide `meshActive`
// melden (alle Peer-Kanäle offen). Liefert {seiten, peerIds, ende}; `ende` schließt Browser und Server.
async function zweiImMesh(browser, portEnv, signalEnv, raum, vor = async () => {}) {
    const [port, signal] = await eigenePorte(portEnv, signalEnv);
    const env = { PORT: String(port), ANAZH_SIGNALING_PORT: String(signal) };
    const server = [
        await startProc("save-server.js", /läuft/, env),
        await startProc("signaling-server.js", /lauscht/, env),
    ];
    const ende = async () => (await browser.close().catch(() => {}), server.forEach((p) => p.kill()));
    try {
        const [seiten, peerIds] = [[await browser.newPage(), await browser.newPage()], []];
        for (const p of seiten) {
            await p.setViewport({ width: 1024, height: 640 });
            await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        }
        for (const [i, p] of seiten.entries()) {
            const r = () => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function";
            await waitFor(p, r, `Seite ${"AB"[i]} initialisiert`);
            await vor(p, i);
            const beitritt = (url, roomOverride) => {
                const r = window.anazhRealm;
                Object.assign(r.state.p2p, { url, roomOverride });
                r.initP2PSync(null);
                return r.state.p2p.peerId;
            };
            peerIds.push(await p.evaluate(beitritt, `ws://127.0.0.1:${signal}`, raum));
        }
        for (const [i, p] of seiten.entries())
            await waitFor(p, () => r.state.p2p.meshActive === true, `Mesh auf ${"AB"[i]} aktiv`);
        return { seiten, peerIds, ende };
    } catch (e) {
        await ende();
        throw e;
    }
}

// DIE WARTE-WAND der Linsen (gate:altlasten, K-WANDUHR): ROT eine Schleife, die selbst auf einen Bau wartet, eine Wanduhr-Frist
// (`performance.now()`/`Date.now()` im Kopf oder als break/return/throw), ein geschluckter `__gebautNach`; der REST
// (spec/ci/frist-rest.json) schrumpft nur.
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
            } else if (n.type === "CallExpression" && n.callee.property && n.callee.property.name === "catch") {
                const w = n.callee.object;
                const o =
                    w.callee && w.callee.property && w.callee.property.name === "waitForFunction" && w.arguments[1];
                const f = n.arguments[0];
                const wirft = f && hat(f, (c) => c.type === "ThrowStatement");
                if (
                    o &&
                    !wirft &&
                    (o.properties || []).some((p) => p.key && p.key.name === "timeout" && p.value.value !== 0)
                )
                    fristen.add(n);
                else if (
                    hat(w, (c) => c.property && c.property.name === "__gebautNach") &&
                    f &&
                    f.body &&
                    f.body.type === "BlockStatement" &&
                    !f.body.body.length
                )
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
    studioKern,
    fadenScope,
    scanWarteWand,
    ROOT,
    MIME,
    REZEPTE,
    GPU_REZEPTE,
    CODE_OF_SEITE,
    WARTEN_SEITE,
    pngDatei,
    statikServer,
    starteBrowser,
    warteAufWelt,
    nullRenderer,
    nullSeite,
    halteBis,
    buehne,
    uferStellen,
    pruefer,
    taeterFaelle,
    tatAn,
    selbsttestEnde,
    wandEnde,
    startProc,
    eigenePorte,
    sleep,
    laufUhr,
    hauptLauf,
    urteilEnde,
    argOpt,
    waitFor,
    zweiImMesh,
    booteWelt,
    werkbankTor,
    werkbankRuf,
    teilAus,
    selbsttest: (name) => (sammlung.selbsttest = name),
};

// DER SELBSTTEST DER STALL-AKTE (gate:welt-boot, Null-Rezept): eine JS-Schleife steht als JS-SCHLEIFE mit Namen in der Akte, ein
// nie erfülltes Versprechen als AWAIT, ein kurzer Block (0,8 s) trägt KEINE Akte.
async function selbsttest() {
    const seiten = {
        "/ruhig.html":
            "<!doctype html><script>setTimeout(function(){var e=performance.now()+800;while(performance.now()<e){}},300)</script>",
        "/schleife.html":
            "<!doctype html><script>function __stallSchleife(){var e=performance.now()+9000;while(performance.now()<e){}}setTimeout(__stallSchleife,300)</script>",
        "/haenger.html": "<!doctype html><script>window.__nie=function(){return new Promise(function(){})}</script>",
        "/wirft.html": "<!doctype html><script>setTimeout(function(){throw new Error('__seitenWurf')},50)</script>",
    };
    const server = statikServer({ seiten });
    await server.lausche(0);
    const browser = await starteBrowser({ art: "null", frist: 7000, stallMs: 3000 });
    const fall = async (pfad, tu) => {
        const page = await browser.newPage();
        await server.zeige(page, undefined, pfad.slice(1), "load");
        await tu(page);
        const id = page.__akte.id;
        await page.close().catch(() => {});
        return akten.filter((a) => a.seite === id);
    };
    // LANGSAM: der Bau steht nach 3,2 s, das Warten hält; TOT: nichts offen, ROT beim Namen; REGLER: das Einschwingen hält den
    // atmenden Regler und gibt ihn frei (die ruhige Seite, 4,5 s).
    let bau = null;
    const bauProbe = async () => {
        const r = (window.anazhRealm = {
            _weltStand: { takte: 0 },
            offen: 1,
            _gameLoopTick() {},
            _archIsRendered: (e) => !!e.mesh,
        });
        r._rebuildArchitectureMesh = (e) => e.ab != null && performance.now() >= e.ab && (e.mesh = {});
        r._weltOffen = () => ({ foundry: 0, chunks: 0, wald: 0, karten: r.offen });
        const takt = () => sleep(10);
        const langsam = { type: "langsam", id: 1, ab: performance.now() + 3200 };
        const t0 = performance.now();
        const takte = await window.__gebautNach(langsam, { max: 5, takt }).catch((x) => x.message);
        const aus = { langsam: { takte, steht: !!langsam.mesh, ms: Math.round(performance.now() - t0) } };
        r.offen = 0;
        aus.tot = await window.__gebautNach({ type: "tot", id: 2 }, { max: 5, takt }).then(
            (n) => `steht nach ${n} Takten`,
            (x) => x.message
        );
        // HÄNGT: eine Karte bleibt offen und rührt sich nie
        r.offen = 1;
        try {
            for (const weiter = window.__deckel("haenger", 5); weiter(););
        } catch (x) {
            aus.haengt = x.message;
        }
        r.offen = 0;
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
    // DIE WEICHE: ohne GPU-Arbeit ist ein Echt-Rezept ROT beim Namen, EIN Draw-Aufruf (der Haken) trägt es
    const weiche = [];
    let seitenSchlaf = null;
    const ruhig = await fall("/ruhig.html", async (p) => {
        [bau] = await Promise.all([p.evaluate(bauProbe), sleep(4500)]);
        seitenSchlaf = await p.evaluate(async () => (await sleep(1), String(sleep)));
        weiche.push(await weicheUrteil(browser, "echt"));
        await p.evaluate(() => WebGL2RenderingContext.prototype.drawArrays.call(null)).catch(() => {});
        weiche.push(await weicheUrteil(browser, "echt"));
    });
    const schleife = await fall("/schleife.html", async () => {
        for (let i = 0; i < 30 && !akten.some((a) => a.urteil); i++) await sleep(500);
        await sleep(500);
    });
    const haenger = await fall("/haenger.html", (p) => p.evaluate(() => window.__nie()).catch(() => {}));
    // DER EINE SAMMLER: der Wurf einer Seite (auch in einem eigenen Kontext) steht beim Namen in der Liste und macht das
    // Prozess-Ende ROT — ein eigener pageerror-Sammler einer Linse daneben ist ein Zwilling (werkbank.cjs startet sein Fenster selbst)
    const kontext = await browser.createBrowserContext();
    await server.zeige(await kontext.newPage(), undefined, "wirft.html", "load");
    await sleep(400);
    const wurf = sammlung.fehler.filter((f) => f.includes("__seitenWurf"));
    sammlung.fehler = sammlung.fehler.filter((f) => !wurf.includes(f));
    const code = fs
        .readdirSync(path.join(ROOT, "scripts"), { recursive: true })
        .map((f) => f.replace(/\\/g, "/"))
        .filter((f) => /\.cjs$/.test(f) && f !== "lib/welt-boot.cjs")
        .sort()
        .map((f) => [f, ohneKommentare(fs.readFileSync(path.join(ROOT, "scripts", f), "utf8"))]);
    const zwillinge = code.filter(([f, c]) => f !== "werkbank.cjs" && /\.on\("pageerror"/.test(c)).map(([f]) => f);
    // DIE ADRESS-WAND: lauscht eine Linse an einem statikServer selbst oder baut ihre 127.0.0.1-Adresse selbst, ist das ein Zwilling von
    // lausche/zeige; FREMD tragen ihn bis zum Schnitt ihres Besitzers (ein geheilter Eintrag macht die Liste ROT, bis er fällt)
    const adressZwilling = (c) =>
        /statikServer\(/.test(c) &&
        /new Promise\(\(?\w+\)? => \w+\.listen\(|\.goto\(`http:\/\/127\.0\.0\.1:\$\{/.test(c);
    const adressen = code
        .filter(([, c]) => adressZwilling(c))
        .map(([f]) => f)
        .join(", ");
    const FREMD = "werkbank.cjs";
    const gepflanzt = [
        "statikServer(); await new Promise((r) => s.listen(1, r));",
        "statikServer(); p.goto(`http://127.0.0.1:${P}/index.html`);",
    ].filter(adressZwilling).length;
    // DIE FÄNGER-WAND: fängt ein Skript seinen Absturz selbst (`})().catch(…)`/`main().catch(…)` bis process.exit), ist das ein
    // Zwilling von hauptLauf; ci-kopf.cjs fährt allein im sparse-checkout, FREMD tragen ihn bis zum Schnitt ihres Besitzers
    const faengerZwilling = (c) =>
        /(?:\}\)\(\)|\b\w+\(\))\.catch\(\(?\w*\)? => \{(?:(?!\}\);)[^]){0,300}process\.exit/.test(c);
    const faenger = code
        .filter(([, c]) => faengerZwilling(c))
        .map(([f]) => f)
        .join(", ");
    const FAENGER_FREMD = "ci-kopf.cjs";
    const gefangen = [
        "(async () => {})().catch((e) => { console.error(e); process.exit(1); });",
        "main().catch((err) => { console.error(`x ${err}`); process.exitCode = 2; });",
    ].filter(faengerZwilling).length;
    // DIE SCHLAF-WAND: schläft ein Skript mit eigenem Versprechen (`new Promise((r) => setTimeout(r, ms))`, in Node wie in der
    // Seite), ist das ein Zwilling von sleep; am Token-Strom, Strings (gepflanzte Stamm-Proben) zählen nicht; FREMD tragen ihn bis
    // zum Schnitt ihres Besitzers, ci-kopf.cjs fährt allein im sparse-checkout
    const schlafZwilling = (c) =>
        /new Promise \( (?:\( )?(\w+) (?:\) )?=> (?:\{ )?setTimeout \( \1 (?:, (?:[^\s(),{};]+ |\( [^()]*\) )+)?\) (?:; )?(?:\} )?\)/.test(
            [...require("acorn").tokenizer(c, { ecmaVersion: "latest", allowHashBang: true })]
                .map((k) => (/^(string|template|regexp)$/.test(k.type.label) ? "S" : c.slice(k.start, k.end)))
                .join(" ")
        );
    const schlaefer = code
        .filter(([, c]) => schlafZwilling(c))
        .map(([f]) => f)
        .join(", ");
    const SCHLAF_FREMD = "ci-kopf.cjs";
    const geschlafen = [
        "await new Promise((r) => setTimeout(r, 50));",
        "const s = (ms) => new Promise((ok) => { setTimeout(ok, Math.max(ms, 1) * Math.random()); });",
    ].filter(schlafZwilling).length;
    const sturzRuf = `require(${JSON.stringify(__filename)}).hauptLauf(async () => { throw new Error("__sturz"); }, () => console.error("__zuletzt"))`;
    const sturz = require("child_process").spawnSync(process.execPath, ["-e", sturzRuf], { encoding: "utf8" });
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
        [
            /^pageerror: Error: __seitenWurf/.test(wurf[0]),
            `Seiten-Wurf: ${wurf[0] || "KEIN Fehler gesammelt — still grün"}`,
        ],
        [!zwillinge.length, `eigene pageerror-Sammler neben dem EINEN: ${zwillinge.join(", ") || "keiner"}`],
        [
            adressen === FREMD &&
                gepflanzt === 2 &&
                !adressZwilling("statikServer(); await s.lausche(1); s.zeige(p, 1);"),
            `eigene Server-Starts/Welt-Adressen neben lausche/zeige: ${adressen} (FREMD ${FREMD}) · gepflanzt ${gepflanzt}/2 gefasst`,
        ],
        [
            faenger === FAENGER_FREMD &&
                gefangen === 2 &&
                !faengerZwilling("hauptLauf(async () => {}); page.close().catch(() => {}); process.exit(1);") &&
                sturz.status === 2 &&
                /^-e ABSTURZ: Error: __sturz/.test(sturz.stderr) &&
                /__zuletzt/.test(sturz.stderr),
            `eigene Absturz-Fänger neben hauptLauf: ${faenger} (FREMD ${FAENGER_FREMD}) · gepflanzt ${gefangen}/2 gefasst · Sturz Exit ${sturz.status}: ${sturz.stderr.split("\n")[0]}`,
        ],
        [
            schlaefer === SCHLAF_FREMD &&
                geschlafen === 2 &&
                !schlafZwilling(
                    '"new Promise((r) => setTimeout(r, 5))"; new Promise((r) => setTimeout(() => r(1), 5)); new Promise((r) => setTimeout(r, 5, 1));'
                ) &&
                seitenSchlaf === String(sleep),
            `eigene Schlafe neben sleep: ${schlaefer} (FREMD ${SCHLAF_FREMD}) · gepflanzt ${geschlafen}/2 gefasst · die Seite schläft mit ${seitenSchlaf}`,
        ],
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
            `Bau LANGSAM (3,2 s, eine Karte offen): ${bau ? `steht nach ${bau.langsam.takte} Takten, ${bau.langsam.ms} ms` : "kein Befund"}`,
        ],
        [
            !!bau && /^DER BAU STEHT NICHT: tot#2/.test(bau.tot),
            `Bau TOT (nichts offen): ${bau ? bau.tot : "kein Befund"}`,
        ],
        [
            !!bau && /^DIE WELT HÄNGT: haenger nach 3601 Takten — offen .*"karten":1/.test(bau.haengt),
            `Bau HÄNGT: ${bau ? bau.haengt : "kein Befund"}`,
        ],
        [
            !!bau && /^steht nach 30 /.test(bau.regler) && bau.frei,
            `Regler atmet (echter Renderer): ${bau ? `${bau.regler}, danach ${bau.frei ? "frei" : "GEHALTEN"}` : "kein Befund"}`,
        ],
        [
            /^welt-boot.cjs startet „echt" und zeichnet nie/.test(weiche[0]) && weiche[1] === null,
            `Weiche: ${weiche[0]} · nach einem Draw ${weiche[1] || "trägt"}`,
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
    hauptLauf(selbsttest);
}
