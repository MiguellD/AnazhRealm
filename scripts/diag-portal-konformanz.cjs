#!/usr/bin/env node
// diag-portal-konformanz.cjs — DIE KONFORMITÄTS-PROBE DER PORTAL-BRÜCKE (W1 c + e, gate:portal-konformanz).
//
// Das Protokoll (enter · ready · dsl · event · exit) hat EINEN Richter: die Heimat. Die Probe bootet die echte Heimat
// (index.html, Null-Renderer, keine Foundry) und betritt JEDE Welt über den echten Weg (Bibliothek →
// `obtainPortalForWorld` → `_buildPortalOverlay`, die übersetzte Welt über `acceptTranslatedManifest` +
// `buildTranslatedWorld` mit gestubbtem LLM). Gemessen wird nur, was die Heimat KONSUMIERT, und was die Welt sichtbar
// tut (Journal der Heimat, Zustand der Welt-UI):
//   K1 ready      die Heimat empfängt die ready-Meldung der Welt (der Handshake schließt)
//   K2 endlich    der Handshake endet: die Heimat schickt höchstens drei enter (about:blank · load · erste ready)
//   K3 Quelle     eine FREMDE Seite (Geschwister-Frame der Heimat) schickt der Welt dieselbe Nachricht — die Welt
//                 nimmt sie nicht an (event.source !== parent), nichts wirkt
//   K4 wirkt      die Heimat schickt die chain-Form des Worts über ihren echten Weiterleiter (`_portalRouteDsl`): die
//                 Welt wirkt sichtbar (Journal-Ereignis bzw. Zustand der UI) — bei begegnung der Ko-Präsenz-Eintritt
//   K5 Esc        Esc in der Welt bringt den Spieler heim (die Heimat schließt das Overlay)
//   K6 fehlerfrei die Welt wirft keinen Seiten-Fehler
// Dazu zwei RATSCHEN (spec/vertraege/ratsche.json — Ist darf nur fallen, Soll daneben):
//   dslEinzelwort  der Spieler tippt EIN Wort in die Konsole (`processChatCommand`, die Heimat schickt die flache Form
//                  ["w"]): wirkt es sichtbar oder bleibt die Welt stumm? (Synthese §0.1: 7 Studios lesen op[0] je
//                  Element — aus "gt" wird "g")
//   readyEcho      die Welt beantwortet jedes enter mit einer neuen ready (13 Brücken-Kopien, zwei Dialekte)
// Eine Welt, die neu stumm oder neu Echo ist, ist rot; eine geheilte ebenfalls, bis ihre Zeile im selben Commit fällt.
//
//   node scripts/diag-portal-konformanz.cjs --selftest   die alten Defekte eingespielt (begegnung ohne Quellen-Prüfung,
//                                                        die Heimat beantwortet JEDE ready, skeleton liest op[0] je
//                                                        Element) → jede Wand wird rot und nennt den Täter
//   node scripts/diag-portal-konformanz.cjs              alle Welten gegen K1–K6 und die Ratschen
// Port über PORTAL_KONFORMANZ_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4563.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORTAL_KONFORMANZ_PORT || 4563);
const RATSCHE_PFAD = path.join(ROOT, "spec", "vertraege", "ratsche.json");
// Die Frist der ersten ready: das Körper-Studio baut seinen Menschen, bevor die Brücke meldet (von allen Welten am
// längsten; wie lange, misst der OMEN) — die Frist ist ein Deckel gegen den Hänger, keine Messung.
const READY_FRIST_MS = 120000;
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

// Je Welt: das Wort, das der Spieler in die Konsole tippt, und woran man sieht, dass es wirkt. `ui` = Zustand der
// Welt-UI (same-origin: Selektor + Feld + Soll, der echte UI-Pfad der Studios); ohne `ui` = das Journal der Heimat
// (die Welt antwortet mit einem Ereignis). begegnung versteht keine DSL (dsl []), ihre Wirkung ist der Ko-Präsenz-
// Eintritt eines Gefährten (peer-join → Ereignis).
const WELTEN = [
    { id: "skeleton", wort: "skybox_color 2a0a3a" },
    { id: "fluid", wort: "flut", zusatz: stromZeichnet },
    { id: "terrain", wort: "fichte" },
    { id: "garage", wort: "supersport", ui: { sel: "#presets button.on", feld: "text", soll: "Supersport" }, zusatz: probefahrt },
    { id: "portale", wort: "maschine", ui: { sel: "#presets button.active", feld: "text", soll: "Maschine" } },
    { id: "schmiede", wort: "degen", ui: { sel: "#presets button.on", feld: "text", soll: "Degen" } },
    { id: "fachwerk", wort: "tudor", ui: { sel: "#pK", feld: "value", soll: "tudor" } },
    { id: "klang", wort: "trap", ui: { sel: "#presets .presetBtn.active", feld: "text", soll: "Trap" } },
    { id: "koerperstudio", wort: "wut", ui: { sel: "#emotions button.active", feld: "text", soll: "Wut" } },
    { id: "tetrapoda", wort: "hirsch", ui: { sel: "#presets button.active", feld: "text", soll: "Hirsch" } },
    { id: "schwarm", wort: "schwaermen" },
    { id: "begegnung", wort: null },
    { id: "translated", wort: "sturm" },
];
// Das Wort „probefahrt" der Garage (aus smoke-labs übernommen, das mit der Form [[w]] fuhr, die die Heimat nie sendet):
// die Heimat schickt es (chain-Form, der echte Weiterleiter), die Garage schaltet in den Fahr-Modus (HUD sichtbar), W
// beschleunigt — der Tacho steigt (carPhys + FAHR aus vehicle-core treiben das Labor) —, „werkstatt" schaltet zurück.
async function probefahrt(page, fr) {
    const route = (w) => page.evaluate((x) => window.anazhRealm._portalRouteDsl(["chain", [x]], x, () => {}), w);
    await route("probefahrt");
    await warte(600);
    const hud = await fr.evaluate(() => {
        const h = document.getElementById("hud");
        return !!h && h.style.display === "block";
    });
    await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" })));
    await warte(1600);
    const spd = await fr.evaluate(() => {
        window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
        const el = document.querySelector("#hud #spd");
        return el ? parseInt(el.textContent, 10) : -1;
    });
    await route("werkstatt");
    await warte(600);
    return { ok: hud && spd > 0, notiz: `Probefahrt: HUD ${hud ? "sichtbar" : "fehlt"}, Tacho ${spd}` };
}

// Die Strom-Welt zeichnet (statt der Regex-Probe „densityTexture/addSplat/uBackdrop stehen im Quelltext"): ihre Engine
// meldet keinen Rückfall (WebGL2 + HalfFloat-Ziele stehen), und das Bild im Portal bewegt sich (zwei Aufnahmen des
// Overlay-iframe unterscheiden sich).
async function stromZeichnet(page, fr) {
    const hud = await fr.evaluate(() => {
        const h = document.getElementById("hud-line");
        return h ? h.textContent : "";
    });
    const rueckfall = /konnte nicht starten|Render-Fehler/.test(hud);
    const el = await page.$("#portal-overlay iframe.portal-frame");
    const a = el ? await el.screenshot({ encoding: "base64" }) : "";
    await warte(400);
    const b = el ? await el.screenshot({ encoding: "base64" }) : "";
    const bewegt = !!a && a !== b;
    return { ok: !rueckfall && bewegt, notiz: `Strom zeichnet: ${rueckfall ? "Rückfall — " + hud : "Engine steht"}, Bild ${bewegt ? "bewegt" : "steht"}` };
}

// Die übersetzte Welt: Manifest + die Szene, die das gestubbte LLM liefert (die Säuberung bleibt die echte).
const UEBERSETZT = {
    manifest: { id: "konformanz-lava", label: "Konformanz-Lava", desc: "Eine glühende Probe-Welt.", dsl: ["sturm"] },
    szene: {
        sky: { top: "#0d1330", bottom: "#e0a060" },
        ground: { kind: "hills", color: "#3a2a20" },
        objects: [{ shape: "octahedron", color: "#ff5020", count: 12, area: 40, size: 2, height: 4, spin: true }],
        ambient: { kind: "embers", color: "#ffa040" },
        dslEffects: { sturm: { sky: "#401010", fogShift: 0.5, lightShift: -0.3, burst: 20 } },
    },
};

// ── DIE TÄTER des Selbsttests: die alten Defekte, eingespielt am Server (Text-Ersatz an der Quelle). Fehlt die
// Fundstelle, ist der Selbsttest rot — die Linse wandert mit dem Code.
const TAETER = {
    // begegnung vor dem Schnitt: der message-Handler prüft die Quelle nicht.
    "worlds/begegnung/index.html": [["if (event.source !== window.parent) return;\n", ""]],
    // die Heimat vor dem Schnitt: JEDE ready bekommt ein enter zur Antwort (das Ping-Pong mit den Echo-Studios).
    "anazhRealm.js": [["if (!po.enterAufReady) {\n                    po.enterAufReady = true;\n                    this._portalSendEnter();\n                }", "this._portalSendEnter();"]],
    // skeleton mit dem Studio-Adapter: die Elemente des Programms je einzeln (aus ["w", arg] wird "w", arg).
    "worlds/skeleton/skeleton.js": [["applyDsl(msg.program);", "msg.program.forEach(function (op) { applyDsl(op); });"]],
};

function server(taeter) {
    const fehlend = [];
    const s = http.createServer((req, res) => {
        let p = decodeURIComponent(req.url.split("?")[0]);
        if (p === "/") p = "/index.html";
        if (p === "/__fremd.html") {
            // DIE FREMDE SEITE: ein Geschwister-Frame der Heimat (same-origin), der der Welt im Auftrag der Probe eine
            // Nachricht schickt — als SEINE (event.source = dieser Frame, nie der Eltern-Frame der Welt).
            res.setHeader("Content-Type", "text/html");
            return res.end(
                '<!doctype html><meta charset="utf-8"><script>window.addEventListener("message",function(ev){' +
                    'if(ev.source!==parent||!ev.data||!ev.data.__fremd)return;' +
                    'var f=parent.document.querySelector("#portal-overlay iframe.portal-frame");' +
                    'if(f&&f.contentWindow)f.contentWindow.postMessage(ev.data.nachricht,"*");});</script>'
            );
        }
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            const rel = path.relative(ROOT, fp).split(path.sep).join("/");
            if (taeter && TAETER[rel]) {
                let t = data.toString("utf8");
                for (const [alt, neu] of TAETER[rel]) {
                    if (!t.includes(alt)) fehlend.push(rel + ": " + alt.slice(0, 50));
                    t = t.split(alt).join(neu);
                }
                data = Buffer.from(t, "utf8");
            }
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    return { s, fehlend };
}

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// ── in der Heimat: eine Welt betreten (der echte Weg) und den Kanal zählen
async function betreten(page, welt) {
    return page.evaluate(
        async (welt, uebersetzt) => {
            const r = window.anazhRealm;
            if (r._portalOverlay) r.exitPortal();
            let id = welt.id;
            if (id === "translated") {
                const acc = r.acceptTranslatedManifest(uebersetzt.manifest);
                if (!acc.ok) return { fehler: "acceptTranslatedManifest: " + acc.reason };
                const orig = r.llmCall;
                r.llmCall = async () => ({ raw: JSON.stringify(uebersetzt.szene) });
                try {
                    const b = await r.buildTranslatedWorld(acc.id);
                    if (!b.ok) return { fehler: "buildTranslatedWorld: " + b.reason };
                } finally {
                    r.llmCall = orig;
                }
                id = acc.id;
            }
            const ob = r.obtainPortalForWorld(id);
            if (!ob.ok) return { fehler: "obtainPortalForWorld: " + ob.reason };
            const meta = r.state.blueprints[ob.blueprint].portalMeta;
            // Zähler: was die Welt der Heimat schickt (Quelle = das Portal-iframe) und wie oft die Heimat enter sendet
            // (eine delegierende Zähl-Hülle, nach der Messung entfernt).
            const k = (window.__k = { typen: {}, n: 0, enters: 0, t0: performance.now(), ersteReady: null });
            if (window.__kSpy) window.removeEventListener("message", window.__kSpy, true);
            window.__kSpy = (ev) => {
                const po = r._portalOverlay;
                if (!po || !po.iframe || ev.source !== po.iframe.contentWindow) return;
                const d = ev.data || {};
                const t = d.type || (d.__anazhNet ? "net" : "?");
                k.typen[t] = (k.typen[t] || 0) + 1;
                k.n++;
                if (t === "ready" && k.ersteReady === null) k.ersteReady = Math.round(performance.now() - k.t0);
                if (t === "ready" && Array.isArray(d.dsl) && d.dsl.length) k.readyDsl = true;
            };
            window.addEventListener("message", window.__kSpy, true);
            const orig = r._portalSendEnter;
            r._portalSendEnter = function () {
                k.enters++;
                return orig.apply(this, arguments);
            };
            r._buildPortalOverlay(meta, { computeRole: "host" });
            return { ok: true, label: r._portalOverlay && r._portalOverlay.label, worldId: id };
        },
        welt,
        UEBERSETZT
    );
}

async function zaehler(page) {
    return page.evaluate(() => {
        const r = window.anazhRealm;
        const po = r._portalOverlay;
        const k = window.__k;
        return {
            readys: k.typen.ready || 0,
            typen: k.typen,
            enters: k.enters,
            ersteReady: k.ersteReady,
            readyDsl: !!k.readyDsl,
            offen: !!po,
            stufe: po ? po.manifestStage : null,
            dsl: po && Array.isArray(po.dsl) ? po.dsl.slice() : null,
        };
    });
}

async function zaehlerAus(page) {
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (Object.prototype.hasOwnProperty.call(r, "_portalSendEnter")) delete r._portalSendEnter;
        if (window.__kSpy) window.removeEventListener("message", window.__kSpy, true);
        window.__kSpy = null;
    });
}

// Die Wirkung, die man sieht: Journal-Ereignisse der Welt in der Heimat + (same-origin) der Zustand der Welt-UI.
async function zustand(page, welt) {
    const journal = await page.evaluate(() => {
        const r = window.anazhRealm;
        const e = (r.state.worldJournal && r.state.worldJournal.entries) || [];
        return e.filter((x) => x.type === "portal").length;
    });
    let ui = null;
    if (welt.ui) {
        const fr = page.frames().find((f) => f.url().includes("worlds/" + welt.id + "/"));
        ui = fr
            ? await fr
                  .evaluate((u) => {
                      const el = document.querySelector(u.sel);
                      if (!el) return null;
                      return u.feld === "value" ? el.value : (el.textContent || "").trim();
                  }, welt.ui)
                  .catch(() => null)
            : null;
    }
    return { journal, ui };
}
const wirkt = (welt, vor, nach) => (welt.ui ? nach.ui === welt.ui.soll && vor.ui !== welt.ui.soll : nach.journal > vor.journal);
// Auf eine Wirkung warten, bis sie steht oder die Frist um ist (ein Preset-Bau des Labors kann auf dem CPU-Raster
// dauern, bevor die Welt ihr Ereignis schickt) — eine Frist gegen den Hänger, keine Messung.
const WIRKUNG_FRIST_MS = 6000;
async function bisWirkung(page, welt, gut) {
    const t0 = Date.now();
    let n = await zustand(page, welt);
    while (!gut(n) && Date.now() - t0 < WIRKUNG_FRIST_MS) {
        await warte(200);
        n = await zustand(page, welt);
    }
    return n;
}

// Die fremde Seite schickt der Welt eine Nachricht (als ihre eigene).
async function fremdSchicken(page, nachricht) {
    await page.evaluate((n) => {
        const f = document.getElementById("__fremd");
        if (!f) return false;
        f.contentWindow.postMessage({ __fremd: true, nachricht: n }, "*");
        return true;
    }, nachricht);
}

async function fremdBereit(page, port) {
    await page.evaluate(async (url) => {
        if (document.getElementById("__fremd")) return;
        const f = document.createElement("iframe");
        f.id = "__fremd";
        f.style.display = "none";
        f.src = url;
        document.body.appendChild(f);
        await new Promise((r) => f.addEventListener("load", r, { once: true }));
    }, "http://127.0.0.1:" + port + "/__fremd.html");
}

async function pruefeWelt(page, welt, fehlerLog) {
    const aus = { id: welt.id, k: {}, stumm: null, echo: null, notiz: [] };
    const fehlerVor = fehlerLog.length;
    const b = await betreten(page, welt);
    if (!b || !b.ok) {
        aus.k.K1 = false;
        aus.notiz.push((b && b.fehler) || "betreten fehlgeschlagen");
        return aus;
    }
    // K1: auf die ready warten (terrain bootet mehrere Sekunden), dann den Handshake ausklingen lassen.
    const t0 = Date.now();
    let z = await zaehler(page);
    while (!z.readys && Date.now() - t0 < READY_FRIST_MS) {
        await warte(250);
        z = await zaehler(page);
    }
    aus.k.K1 = z.readys > 0;
    if (!aus.k.K1) {
        aus.notiz.push(`keine ready binnen ${READY_FRIST_MS / 1000} s`);
        await zaehlerAus(page);
        return aus;
    }
    await warte(1500);
    z = await zaehler(page);
    // Meldet die Welt ihr Wörterbuch in der ready, übernimmt die Heimat es (Stufe „nativ", `_portalReceiveManifest`).
    if (z.readyDsl && z.stufe !== "nativ") {
        aus.k.K1 = false;
        aus.notiz.push(`die ready trägt ein Wörterbuch, die Heimat steht auf „${z.stufe}"`);
    }
    aus.k.K2 = z.enters <= 3;
    aus.handshake = { readys: z.readys, enters: z.enters, ersteReadyMs: z.ersteReady, stufe: z.stufe };
    if (!aus.k.K2) aus.notiz.push(`Handshake ohne Ende: ${z.enters} enter, ${z.readys} ready in ${Math.round((Date.now() - t0) / 1000)} s`);
    aus.echo = z.readys > 1;
    await zaehlerAus(page);
    // K3: die fremde Seite schickt, was wirken würde (chain-Form bzw. peer-join) — nichts darf wirken.
    await fremdBereit(page, PORT);
    const programm = welt.wort
        ? await page.evaluate((w) => window.anazhRealm._portalParseWorldCommand(w), welt.wort)
        : null;
    if (welt.wort && !programm) {
        aus.notiz.push(`das Wort „${welt.wort}" steht nicht im Wörterbuch der Heimat für diese Welt`);
        aus.k.K4 = false;
    }
    const fremd = programm
        ? { type: "dsl", program: ["chain", programm] }
        : { type: "peer-join", peerId: "fremd-konformanz", name: "Fremder" };
    let vor = await zustand(page, welt);
    await fremdSchicken(page, fremd);
    await warte(1500);
    let nach = await zustand(page, welt);
    aus.k.K3 = !wirkt(welt, vor, nach) && nach.journal === vor.journal;
    if (!aus.k.K3) aus.notiz.push("eine fremde Seite steuert die Welt (event.source ungeprüft)");
    // dslEinzelwort: der Spieler tippt das Wort in die Konsole (die Heimat schickt die flache Form).
    if (programm) {
        vor = nach;
        await page.evaluate((w) => window.anazhRealm.processChatCommand(w), welt.wort);
        nach = await bisWirkung(page, welt, (n) => wirkt(welt, vor, n));
        aus.stumm = !wirkt(welt, vor, nach);
        aus.einzelwort = { programm, vor, nach };
    }
    // K4: die chain-Form über den echten Weiterleiter der Heimat (bzw. der Ko-Präsenz-Eintritt von der Heimat).
    vor = await zustand(page, welt);
    if (programm) {
        await page.evaluate((p, w) => window.anazhRealm._portalRouteDsl(["chain", p], w, () => {}), programm, welt.wort);
    } else {
        await page.evaluate(() => {
            const po = window.anazhRealm._portalOverlay;
            po.iframe.contentWindow.postMessage({ type: "peer-join", peerId: "gefaehrte-konformanz", name: "Gefährtin" }, "*");
        });
    }
    // Die Studios zeigen die chain-Wirkung am Soll-Zustand (nach dem Einzelwort kann er schon stehen).
    const vorK4 = vor;
    const k4Pruef = (n) => (welt.ui ? n.ui === welt.ui.soll : n.journal > vorK4.journal);
    nach = await bisWirkung(page, welt, k4Pruef);
    let k4 = k4Pruef(nach);
    if (!k4) aus.notiz.push("die Heimat-Form chain wirkt nicht sichtbar");
    const fr = page.frames().find((f) => f.url().includes("worlds/" + welt.id + "/"));
    if (welt.zusatz && fr) {
        const z2 = await welt.zusatz(page, fr);
        aus.notiz.push(z2.notiz);
        k4 = k4 && z2.ok;
    }
    if (aus.k.K4 !== false) aus.k.K4 = k4;
    // K5: Esc in der Welt → die Heimat schließt das Overlay.
    if (fr) await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))).catch(() => {});
    await warte(600);
    const offen = await page.evaluate(() => !!window.anazhRealm._portalOverlay);
    aus.k.K5 = !!fr && !offen;
    if (!aus.k.K5) {
        aus.notiz.push(fr ? "Esc bringt nicht heim" : "Welt-Frame nicht gefunden");
        await page.evaluate(() => window.anazhRealm._portalOverlay && window.anazhRealm.exitPortal());
    }
    const fehler = fehlerLog.slice(fehlerVor);
    aus.k.K6 = fehler.length === 0;
    if (!aus.k.K6) aus.notiz.push("Seiten-Fehler: " + fehler.slice(0, 2).join(" | "));
    return aus;
}

async function lauf(welten, taeter) {
    const { s, fehlend } = server(taeter);
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 180000, args: softwareWebGpuArgs() });
    const fehlerLog = [];
    const ergebnisse = [];
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.evaluateOnNewDocument(() => {
            if (window.top !== window) return;
            window.__anazhHeadlessNullRenderer = true;
            window.__anazhGateNoFoundry = true;
        });
        page.on("pageerror", (e) => fehlerLog.push(String((e && e.message) || e).split("\n")[0].slice(0, 160)));
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function" && window.anazhRealm.state.blueprints,
            { timeout: 120000, polling: 200 }
        );
        const bootFehler = fehlerLog.length;
        if (bootFehler) console.log(`  (Heimat-Boot: ${bootFehler} Seiten-Fehler — ${fehlerLog[0]})`);
        fehlerLog.length = 0;
        for (const w of welten) ergebnisse.push(await pruefeWelt(page, w, fehlerLog));
    } finally {
        await browser.close();
        s.close();
    }
    return { ergebnisse, fehlend };
}

function ratscheLesen() {
    const r = JSON.parse(fs.readFileSync(RATSCHE_PFAD, "utf8"));
    for (const b of ["dslEinzelwort", "readyEcho"]) if (!r[b] || !Array.isArray(r[b].welten)) throw new Error(`ratsche.json ohne Block ${b}.welten`);
    return r;
}

function ratscheVergleich(gemessen, bekannt) {
    const b = new Set(bekannt);
    const g = new Set(gemessen);
    return { neu: [...g].filter((x) => !b.has(x)).sort(), geheilt: [...b].filter((x) => !g.has(x)).sort() };
}

function drucke(e) {
    const k = ["K1", "K2", "K3", "K4", "K5", "K6"].map((x) => (e.k[x] === undefined ? "·" : e.k[x] ? "✓" : "✗")).join(" ");
    const hs = e.handshake ? ` ready ${e.handshake.readys} · enter ${e.handshake.enters}` : "";
    const ew = e.stumm === null ? "" : e.stumm ? " · Einzelwort STUMM" : " · Einzelwort wirkt";
    console.log(`  ${e.id.padEnd(14)} ${k}${hs}${ew}${e.echo ? " · Echo" : ""}${e.notiz.length ? " — " + e.notiz.join("; ") : ""}`);
}

async function selbsttest() {
    const welten = WELTEN.filter((w) => ["begegnung", "garage", "skeleton"].includes(w.id));
    const { ergebnisse, fehlend } = await lauf(welten, true);
    ergebnisse.forEach(drucke);
    const by = Object.fromEntries(ergebnisse.map((e) => [e.id, e]));
    const ratsche = ratscheLesen();
    const stumm = ergebnisse.filter((e) => e.stumm).map((e) => e.id);
    const v = ratscheVergleich(stumm, ratsche.dslEinzelwort.welten.filter((w) => by[w]));
    const proben = [
        ["Täter-Fundstellen gefunden", !fehlend.length, fehlend.join(" · ")],
        ["K3 rot: begegnung ohne Quellen-Prüfung nimmt den fremden peer-join an", by.begegnung && by.begegnung.k.K3 === false, ""],
        ["K2 rot: die Heimat beantwortet jede ready, garage spielt Ping-Pong", by.garage && by.garage.k.K2 === false, by.garage && by.garage.handshake ? `${by.garage.handshake.enters} enter` : ""],
        ["Ratsche rot: skeleton mit Element-Adapter ist NEU stumm", v.neu.includes("skeleton"), "neu stumm: " + v.neu.join(",")],
        ["Kontrolle: die chain-Form wirkt trotz Element-Adapter (der Täter trifft nur das Einzelwort)", by.skeleton && by.skeleton.k.K4 === true, ""],
    ];
    let ok = true;
    for (const [n, gut, d] of proben) {
        console.log(`${gut ? "✅" : "❌"} SELBST-TEST ${n}${d ? " — " + d : ""}`);
        if (!gut) ok = false;
    }
    return ok;
}

(async () => {
    if (process.argv.includes("--selftest")) process.exit((await selbsttest()) ? 0 : 1);
    const { ergebnisse } = await lauf(WELTEN, false);
    console.log("Portal-Konformanz: K1 ready · K2 endlich · K3 Quelle · K4 wirkt · K5 Esc · K6 fehlerfrei");
    ergebnisse.forEach(drucke);
    const rot = [];
    for (const e of ergebnisse) for (const [k, v] of Object.entries(e.k)) if (v === false) rot.push(`${e.id} ${k}`);
    const ratsche = ratscheLesen();
    const stumm = ergebnisse.filter((e) => e.stumm).map((e) => e.id);
    const echo = ergebnisse.filter((e) => e.echo).map((e) => e.id);
    // Eine Welt ohne Messung (K1 rot) heilt keine Ratsche — sie ist schon rot und bleibt aus dem Vergleich.
    const gemessenS = new Set(ergebnisse.filter((e) => e.stumm !== null).map((e) => e.id));
    const gemessenE = new Set(ergebnisse.filter((e) => e.echo !== null).map((e) => e.id));
    const vS = ratscheVergleich(stumm, ratsche.dslEinzelwort.welten.filter((w) => gemessenS.has(w)));
    const vE = ratscheVergleich(echo, ratsche.readyEcho.welten.filter((w) => gemessenE.has(w)));
    for (const w of vS.neu) rot.push(`${w} dslEinzelwort NEU stumm`);
    for (const w of vS.geheilt) rot.push(`${w} dslEinzelwort geheilt — die Zeile fällt aus spec/vertraege/ratsche.json, die Ratsche sinkt`);
    for (const w of vE.neu) rot.push(`${w} readyEcho NEU`);
    for (const w of vE.geheilt) rot.push(`${w} readyEcho geheilt — die Zeile fällt aus spec/vertraege/ratsche.json, die Ratsche sinkt`);
    const mitDsl = ergebnisse.filter((e) => e.stumm !== null).length;
    console.log(
        `  Ratsche dslEinzelwort: ${mitDsl - stumm.length}/${mitDsl} Welten wirken auf ein Einzelwort · stumm ${stumm.length} (${stumm.join(", ") || "—"}) · Soll ${ratsche.dslEinzelwort.soll}`
    );
    console.log(`  Ratsche readyEcho: ${echo.length} (${echo.join(", ") || "—"}) · Soll ${ratsche.readyEcho.soll}`);
    if (rot.length) {
        for (const x of rot) console.log(`❌ ${x}`);
        process.exit(1);
    }
    console.log(`✅ gate:portal-konformanz: ${ergebnisse.length} Welten K1–K6 grün · Ratschen gehalten`);
    process.exit(0);
})().catch((e) => {
    console.error("portal-konformanz-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
