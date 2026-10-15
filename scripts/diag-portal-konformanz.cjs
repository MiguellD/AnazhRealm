#!/usr/bin/env node
// diag-portal-konformanz.cjs — DIE KONFORMITÄTS-PROBE DER PORTAL-BRÜCKE (W1 c + e, gate:portal-konformanz).
//
// Das Protokoll (enter · ready · dsl · event · exit) hat EINEN Richter: die Heimat. Die Probe bootet die echte Heimat
// (index.html, Null-Renderer, keine Foundry) und betritt JEDE Welt über den echten Weg (Bibliothek →
// `obtainPortalForWorld` → `_buildPortalOverlay`, die übersetzte Welt über `acceptTranslatedManifest` +
// `buildTranslatedWorld` mit gestubbtem LLM). Gemessen wird nur, was die Heimat KONSUMIERT, und was die Welt sichtbar
// tut (Journal der Heimat, Zustand der Welt-UI):
//   K1 ready      die Heimat empfängt die ready-Meldung der Welt (der Handshake schließt); das SOLL des Manifests
//                 steht in WELTEN (`manifest: true`), nie in der Existenz der Datei: eine Soll-Welt liefert ihr
//                 worlds/<id>/manifest.json (Form: schemaVersion 1.0 · id · label · dsl) und die Heimat steht danach auf
//                 Stufe „nativ" mit dem Label und jedem Wort (die Welt las ihr Manifest und meldete es im ready — Konsum
//                 statt Quelltext-Zitat); fehlt es ihr, ist K1 rot beim Namen, ebenso ein Manifest ohne Soll-Zeile
//   K2 endlich    der Handshake endet: die Heimat schickt höchstens drei enter (about:blank · load · erste ready),
//                 und während der Reise einer SCHLEUSE schickt sie kein enter mehr (kein Urteil der Probe wartet eine
//                 Uhr ab: eine Marke läuft hinter allem Geschickten durch die Schlange der Welt und zurück, in EINER
//                 CDP-Rundreise mit der Tat davor und der Lesung danach — `schleuse`)
//   K3 Quelle     eine FREMDE Seite (Geschwister-Frame der Heimat) schickt der Welt dieselbe Nachricht — die Welt
//                 nimmt sie nicht an (event.source !== parent), nichts wirkt
//   K4 wirkt      die Heimat schickt die chain-Form des Worts über ihren echten Weiterleiter (`_portalRouteDsl`): die
//                 Welt wirkt sichtbar (Journal-Ereignis bzw. Zustand der UI) — bei begegnung der Ko-Präsenz-Eintritt
//   K5 Esc        Esc in der Welt bringt den Spieler heim (die Heimat schließt das Overlay)
//   K6 fehlerfrei die Welt wirft keinen Seiten-Fehler
//   K7 mitgebracht die Welt zeigt, was der Reisende mitbringt (W13 V2, der enter-Payload der Heimat): skeleton die
//                 Seele, das eigene Material als TEXT (Markup im Namen bleibt Text) mit gesäuberter Farbe, das eigene
//                 Werkzeug und den Vibe-Pass; fluid und terrain den Vibe-Pass am Namen des Reisenden
// Dazu zwei RATSCHEN (spec/vertraege/ratsche.json — Ist darf nur fallen, Soll daneben):
//   dslEinzelwort  der Spieler tippt EIN Wort in die Konsole (`processChatCommand`, die Heimat schickt die flache Form
//                  ["w"]): wirkt es sichtbar oder bleibt die Welt stumm? (Synthese §0.1: 7 Studios lasen op[0] je
//                  Element — aus "gt" wurde "g"; seit der Studio-Hülle K41 liest EIN Adapter das Programm ganz: 0/7)
//   readyEcho      die Welt beantwortet jedes enter mit einer neuen ready (13 Brücken-Kopien, zwei Dialekte — seit der
//                  Hülle EINE Brücke für 10 Welten, die ready einmal; 0/7)
// Eine Welt, die neu stumm oder neu Echo ist, ist rot; eine geheilte ebenfalls, bis ihre Zeile im selben Commit fällt.
//
//   node scripts/diag-portal-konformanz.cjs --selftest   die alten Defekte eingespielt (begegnung ohne Quellen-Prüfung,
//                                                        die Heimat beantwortet JEDE ready und die Brücke der Hülle
//                                                        spricht wieder den Echo-Dialekt, die Hülle liest op[0] je
//                                                        Element, skeleton und terrain ohne Manifest — der Server
//                                                        antwortet 404 —, fluid meldet ihr Manifest ohne „flut", die
//                                                        garage trägt eins ohne Soll-Zeile) → jede Wand wird rot und
//                                                        nennt den Täter; die TRÄGE klang (3 s Bau zwischen ihrer
//                                                        ready und den enter) hält die Ratsche readyEcho — ein
//                                                        Uhr-Fenster las an der fachwerk „ready 1 · enter 3"
//   node scripts/diag-portal-konformanz.cjs              alle Welten gegen K1–K6 und die Ratschen
// Port über PORTAL_KONFORMANZ_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4563.
"use strict";
const { statikServer, starteBrowser, halteBis } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORTAL_KONFORMANZ_PORT || 4563);
const RATSCHE_PFAD = path.join(ROOT, "spec", "vertraege", "ratsche.json");
// Die Frist der ersten ready: das Körper-Studio baut seinen Menschen, bevor die Brücke meldet (von allen Welten am
// längsten; wie lange, misst der OMEN) — die Frist ist ein Deckel gegen den Hänger, keine Messung.
const READY_FRIST_MS = 120000;

// Je Welt: das Wort, das der Spieler in die Konsole tippt, und woran man sieht, dass es wirkt. `ui` = Zustand der
// Welt-UI (same-origin: Selektor + Feld + Soll, der echte UI-Pfad der Studios); ohne `ui` = das Journal der Heimat
// (die Welt antwortet mit einem Ereignis). begegnung versteht keine DSL (dsl []), ihre Wirkung ist der Ko-Präsenz-
// Eintritt eines Gefährten (peer-join → Ereignis). `manifest: true` ist das SOLL der nativen Stufe: die Welt trägt ihr
// worlds/<id>/manifest.json, liest es selbst und meldet es im ready (K1).
const WELTEN = [
    { id: "skeleton", manifest: true, wort: "skybox_color 2a0a3a", mitgebracht: "voll" },
    { id: "fluid", manifest: true, wort: "flut", zusatz: stromZeichnet, mitgebracht: "pass" },
    { id: "terrain", manifest: true, wort: "fichte", mitgebracht: "pass" },
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
    const route = (w) => schleuse(page, "heimat", null, { route: [[w], w] });
    await route("probefahrt");
    const hud = await fr.evaluate(() => {
        const h = document.getElementById("hud");
        // sichtbar = berechnet nicht „none" (die Garage darf den HUD als block oder flex zeigen); dann gibt W Gas
        return !!h && getComputedStyle(h).display !== "none";
    });
    // W hält, bis der Tacho steigt — nie nach der Uhr (gate:apparat Klinge 3: auf dem CPU-Raster kommen in 1,6 s wenige Frames)
    const halt = await halteBis(fr, {
        druck: () => fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }))),
        los: () => fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }))),
        ziel: () => {
            const el = document.querySelector("#hud #spd");
            const v = el ? parseInt(el.textContent, 10) : 0;
            return v > 0 ? v : false;
        },
        frist: 30000,
    });
    const spd = halt.erreicht ? halt.wert : 0;
    await route("werkstatt");
    return { ok: hud && spd > 0, notiz: `Probefahrt: HUD ${hud ? "sichtbar" : "fehlt"}, Tacho ${spd} nach ${halt.ms} ms W` };
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

// K7 — WAS DER REISENDE MITBRINGT (statt der Regex-Proben „skeleton.js hat renderBrought / textContent / 0xffffff",
// „index.html trägt das Mitgebracht-Panel", „fluid + phytogenesis zeigen avatar.fingerprint"): nach dem Boot legt die
// Probe ein eigenes Material (Name mit Markup, Farbe über 24 Bit) und ein eigenes Werkzeug in den Zustand der Heimat;
// der enter-Payload (`_portalEnterPayload`) trägt sie mit dem Vibe-Pass in die Welt, die Welt-UI zeigt sie.
const MITGEBRACHT = { material: "<b>Konformanz-Glut</b>", farbe: 0x1fabcdef, randSoll: "rgb(171, 205, 239)", werkzeug: "Konformanz-Feile" };

async function mitgebrachtPruefen(page, fr, art) {
    const pl = await page.evaluate(() => window.anazhRealm._portalEnterPayload());
    const notiz = [];
    if (!pl.fingerprint) notiz.push("der enter-Payload trägt keinen Vibe-Pass");
    if (art === "pass") {
        const name = await fr.evaluate(() => {
            const e = document.getElementById("avatar-name");
            return e ? e.textContent : null;
        });
        const soll = pl.name + " · " + pl.fingerprint;
        if (name !== soll) notiz.push(`der Name des Reisenden zeigt „${name}" statt „${soll}"`);
        return { ok: !notiz.length, notiz };
    }
    if (!(pl.materials || []).some((m) => m.name === MITGEBRACHT.material)) notiz.push("das eigene Material reist nicht im enter-Payload");
    const sicht = await fr.evaluate(() => {
        const q = (id) => document.getElementById(id);
        const b = q("brought");
        const seele = document.querySelector("#brought-soul b");
        const vl = q("vibe-line");
        return {
            verborgen: !b || b.hidden,
            seele: seele ? seele.textContent : null,
            mats: [...document.querySelectorAll("#brought-mats .brought-chip")].map((c) => ({ text: c.textContent, kinder: c.childElementCount, rand: c.style.borderColor })),
            tools: [...document.querySelectorAll("#brought-tools .brought-chip")].map((c) => c.textContent),
            vibe: vl && !vl.hidden ? vl.textContent : null,
        };
    });
    if (sicht.verborgen) notiz.push("das Mitgebracht-Panel bleibt verborgen");
    if (sicht.seele !== pl.soul.label) notiz.push(`die Seele zeigt „${sicht.seele}" statt „${pl.soul.label}"`);
    const chip = sicht.mats.find((c) => c.text === MITGEBRACHT.material || c.text === "Konformanz-Glut");
    if (!chip) notiz.push("das eigene Material fehlt im Panel");
    else {
        if (chip.text !== MITGEBRACHT.material || chip.kinder) notiz.push("der Material-Name wird als Markup gerendert, nicht als Text");
        if (chip.rand !== MITGEBRACHT.randSoll) notiz.push(`die Material-Farbe ist nicht gesäubert (${chip.rand})`);
    }
    if (!sicht.tools.includes("⚒ " + MITGEBRACHT.werkzeug)) notiz.push("das eigene Werkzeug fehlt im Panel");
    if (sicht.vibe !== "Vibe-Pass · " + pl.fingerprint) notiz.push(`die Vibe-Zeile zeigt „${sicht.vibe}"`);
    return { ok: !notiz.length, notiz };
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
// Die Heimat vor dem Schnitt: JEDE ready bekommt ein enter zur Antwort (das Ping-Pong mit den Echo-Studios) — eingespielt
// an der garage (die träge klang unten misst die Uhr, nicht das Ping-Pong). Ausgeliefert in der Stamm-Datei, die die Zeile
// trägt (scripts/lib/stamm.cjs `dateiMit`; trägt sie keine, die erste — dort meldet der Selbsttest die fehlende Fundstelle).
const HEIMAT_PINGPONG = [
    "if (!po.enterAufReady) {\n                    po.enterAufReady = true;\n                    this._portalSendEnter();\n                }",
    'if (!po.enterAufReady || String(po.world || "").includes("/garage/")) this._portalSendEnter();\n                po.enterAufReady = true;',
];
const TAETER = {
    // begegnung vor dem Schnitt: der message-Handler prüft die Quelle nicht.
    "worlds/begegnung/index.html": [["if (event.source !== window.parent) return;\n", ""]],
    [stammLib.dateiMit(ROOT, HEIMAT_PINGPONG[0]) || stammLib.dateien(ROOT)[0]]: [HEIMAT_PINGPONG],
    // DIE EINE BRÜCKE (Studio-Hülle K41) mit den alten Defekten der 13 Kopien: (a) der Element-Adapter — die Elemente des
    // Programms je einzeln (aus ["w", arg] wird "w", arg): das Einzelwort stumm, die chain-Form wirkt; (b) der Echo-
    // Dialekt — jedes enter bekommt eine neue ready (das Ping-Pong mit der Heimat-Täterin an der garage, die träge klang);
    // (c) das unvollständige Manifest — das welt-eigene Wort fehlt im ready (fluid ohne „flut" → K1 rot beim Namen); (d) s. u.
    "worlds/huelle/huelle.js": [
        ['} else if (m.type === "dsl") wirke(m.program);', '} else if (m.type === "dsl") m.program.forEach(function (op) { wirke(op); });'],
        [
            'if (m.type === "enter") {\n                if (opt.enter)',
            'if (m.type === "enter") {\n                bereit(opt.dsl ? { label: opt.label, dsl: opt.dsl } : {});\n                if (opt.enter)',
        ],
        // (d) die Brücke ohne Quellen-Prüfung — eine fremde Seite steuert jede Welt der Hülle (K3 rot, auch am UI-Pfad)
        ["if (ev.source !== eltern) return;\n            var m = ev.data;", "var m = ev.data;"],
        [
            "var dsl = m && Array.isArray(m.dsl) ? m.dsl : null;",
            'var dsl = m && Array.isArray(m.dsl) ? m.dsl.filter(function (w) { return w !== "flut"; }) : null;',
        ],
    ],
    // das Mitgebrachte als Markup statt als Text → K7 rot
    "worlds/skeleton/skeleton.js": [['chip.textContent = String((m && m.name) || "?");', 'chip.innerHTML = String((m && m.name) || "?");']],
    // klang TRÄGE wie die fachwerk auf dem CI-Runner (V18.540, Lauf 38138358932: „fachwerk ready 1 · enter 3", die
    // Ratsche meldete „readyEcho geheilt"): die Brücke meldet ready, der Boot läuft noch 0,6 s weiter und stellt dann
    // 3 s Bau in die Schlange (sechs Aufgaben zu 0,5 s) — VOR die enter der Heimat; ein Bild hält das load der Welt 5 s
    // auf. Die Probe sah die ready, ihr Uhr-Fenster endete im Bau, und ihr Zähler lief zwischen zwei Bau-Aufgaben, vor
    // der Antwort. Das Echo ist eine Eigenschaft der Welt, kein Urteil der Uhr. (Eingespielt an der LEICHTEN Echo-Welt
    // klang: die Trägheit ist der Täter, nicht die Welt — die fachwerk kostete den Selbsttest auf dem Runner 54 s, Lauf
    // 38146486287.)
    // (Die Brücke der Hülle meldet ihre ready synchron im Aufruf; danach läuft der Boot 0,6 s weiter und stellt den Bau in die
    // Schlange — das Echo spricht die Brücken-Täterin oben.)
    "worlds/klang/klang.js": [
        [
            'AnazhHuelle.bruecke({\n    welt: "klang",',
            'document.body.appendChild(new Image()).src = "/__traege.gif";\nwindow.addEventListener("message", function (ev) {\n    if (ev.source === window && ev.data && ev.data.__bau) for (var t1 = Date.now(); Date.now() - t1 < 500; );\n});\nsetTimeout(function () {\n    for (var t0 = Date.now(); Date.now() - t0 < 600; );\n    for (var b = 0; b < 6; b++) window.postMessage({ __bau: 1 }, "*");\n}, 0);\nAnazhHuelle.bruecke({\n    welt: "klang",',
        ],
    ],
};
// Die Soll-Welten verlieren ihr Manifest: der Server antwortet 404 (vorher fielen skeleton und terrain still auf die
// Registry-Wörter zurück, und K1 blieb grün) → K1 rot, die Welt beim Namen.
const TAETER_WEG = ["worlds/skeleton/manifest.json", "worlds/terrain/manifest.json"];
// Ein Manifest ohne Soll-Zeile: die garage (kein `manifest` in WELTEN) liefert eins → K1 rot.
const TAETER_UNTER = { "worlds/garage/manifest.json": { schemaVersion: "1.0", id: "garage", label: "Garage", dsl: ["supersport"] } };

// Was der Server unter einem Pfad ausliefert (null = 404): die Welt im Browser und K1 lesen DIESELBEN Bytes.
function ausliefern(rel, taeter, fehlend) {
    if (taeter && TAETER_WEG.includes(rel)) return null;
    if (taeter && TAETER_UNTER[rel]) return Buffer.from(JSON.stringify(TAETER_UNTER[rel]), "utf8");
    let data;
    try {
        data = fs.readFileSync(path.join(ROOT, rel));
    } catch {
        return null;
    }
    if (taeter && TAETER[rel]) {
        let t = data.toString("utf8");
        for (const [alt, neu] of TAETER[rel]) {
            if (!t.includes(alt)) fehlend.push(rel + ": " + alt.slice(0, 50));
            t = t.split(alt).join(neu);
        }
        data = Buffer.from(t, "utf8");
    }
    return data;
}

function server(taeter) {
    const fehlend = [];
    // Welche 404-Täter die Welt im Browser traf (sie fragte ihr Manifest und bekam keins).
    const weg = new Set();
    const s = statikServer({
        root: ROOT,
        seiten: {
            // DIE FREMDE SEITE: ein Geschwister-Frame der Heimat (same-origin), der der Welt im Auftrag der Probe eine
            // Nachricht schickt — als SEINE (event.source = dieser Frame, nie der Eltern-Frame der Welt).
            "/__fremd.html":
                '<!doctype html><meta charset="utf-8"><script>window.addEventListener("message",function(ev){' +
                'if(ev.source!==parent||!ev.data||!ev.data.__fremd)return;' +
                'var f=parent.document.querySelector("#portal-overlay iframe.portal-frame");' +
                'if(f&&f.contentWindow)f.contentWindow.postMessage(ev.data.nachricht,"*");});</script>',
            // Das träge Bild der klang-Täterin: es kommt nach 5 s (ein leeres GIF), so lange wartet das load der Welt.
            ...(taeter
                ? { "/__traege.gif": () => new Promise((r) => setTimeout(() => r(Buffer.from("R0lGODlhAQABAAAAACw=", "base64")), 5000)) }
                : {}),
        },
        wandle: (p) => {
            const rel = path.relative(ROOT, path.join(ROOT, p)).split(path.sep).join("/");
            if (taeter && TAETER_WEG.includes(rel)) weg.add(rel);
            return ausliefern(rel, taeter, fehlend);
        },
    });
    return { s, fehlend, weg };
}

// Manifeste im Baum, deren Welt keine Zeile in WELTEN hat: die Probe betritt sie nie, ihr Soll fehlt → rot.
function manifestOhneZeile(welten) {
    const d = path.join(ROOT, "worlds");
    return fs
        .readdirSync(d)
        .filter((id) => fs.existsSync(path.join(d, id, "manifest.json")) && !welten.some((w) => w.id === id))
        .sort();
}

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// ── in der Heimat: eine Welt betreten (der echte Weg) und den Kanal zählen
async function betreten(page, welt) {
    hinFrame = null;
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
            const k = (window.__k = { typen: {}, n: 0, enters: 0, geladen: 0, t0: performance.now(), ersteReady: null });
            if (window.__kSpy) window.removeEventListener("message", window.__kSpy, true);
            window.__kSpy = (ev) => {
                const po = r._portalOverlay;
                if (!po || !po.iframe || ev.source !== po.iframe.contentWindow) return;
                const d = ev.data || {};
                if (d.__schleuse) return;
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
            // Das load der Welt (das about:blank davor lädt synchron beim Einhängen, vor diesem Hörer): der load-Hörer
            // der Heimat steht vor diesem und hat sein enter geschickt, wenn er zählt.
            if (r._portalOverlay) r._portalOverlay.iframe.addEventListener("load", () => k.geladen++);
            return { ok: true, label: r._portalOverlay && r._portalOverlay.label, worldId: id };
        },
        welt,
        UEBERSETZT
    );
}

const zaehler = (page) => page.evaluate(() => window.__konformanz.zaehler());

async function zaehlerAus(page) {
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (Object.prototype.hasOwnProperty.call(r, "_portalSendEnter")) delete r._portalSendEnter;
        if (window.__kSpy) window.removeEventListener("message", window.__kSpy, true);
        window.__kSpy = null;
    });
}

//// DIE SCHLEUSE — kein Urteil über die Brücke wartet eine Uhr ab. Nachrichten an dasselbe Fenster laufen in EINER Schlange
// (HTML: posted-message task source, FIFO). Die Probe schickt der Welt eine Marke auf dem Weg, den sie prüft (Heimat →
// Welt bzw. Heimat → fremde Seite → Welt), die Welt reicht sie der Heimat zurück: kommt sie an, hat die Welt alles davor
// Geschickte gelesen, und was sie dabei der Heimat antwortete, hat die Heimat vor der Marke gelesen — auf jedem Rechner
// gleich, wie träge der Faden auch ist. (Das Uhr-Fenster von 1,5 s las auf dem Runner „fachwerk ready 1 · enter 3": der
// Zähler stand in der Schlange vor den Antworten, die Ratsche meldete „readyEcho geheilt".) Die Frist ist der Deckel
// gegen den Hänger, rot beim Namen, nie die Messung.
// EINE CDP-Rundreise je Schleuse: die Tat, die Marke hin und zurück und die Lesung davor und danach laufen in EINEM
// page.evaluate der Heimat; was nur die Welt sieht (ihre UI, ihr Esc — das Portal ist ein sandboxed null-origin-iframe),
// tut ihr Rück-Hörer beim Lesen der Marke, eingehängt einmal je Welt. Jede CDP-Rundreise wartet hinter dem Bild, das die
// Welt auf demselben Faden rastert: auf dem Runner (swiftshader) trugen sechs je Schleuse den Portal-Schritt von 5:47 auf
// 14:06 min (Lauf 38143068586); die Zeile jeder Welt nennt ihre Zeit und ihre Schleusen.
const SCHLEUSE_FRIST_MS = 60000;
let schleuseNr = 0;
let schleusenZeit = { n: 0, ms: 0 };
let hinFrame = null;

// Die Lesungen der Heimat leben EINMAL in ihr (nach dem Boot eingesetzt) — Schleuse, Zähler und Wirkung lesen sie.
function seitenHelfer() {
    const r = window.anazhRealm;
    window.__konformanz = {
        // Die Wirkung in der Heimat: die Journal-Ereignisse der Welt.
        journal() {
            const e = (r.state.worldJournal && r.state.worldJournal.entries) || [];
            return e.filter((x) => x.type === "portal").length;
        },
        zaehler() {
            const po = r._portalOverlay;
            const k = window.__k;
            return {
                readys: k.typen.ready || 0,
                typen: k.typen,
                enters: k.enters,
                geladen: k.geladen,
                ersteReady: k.ersteReady,
                readyDsl: !!k.readyDsl,
                offen: !!po,
                stufe: po ? po.manifestStage : null,
                label: po ? po.label : null,
                dsl: po && Array.isArray(po.dsl) ? po.dsl.slice() : null,
            };
        },
    };
}

// Der Rück-Hörer der Welt (in ihrem Reich, einmal je Welt nach ihrem load; ein Capture-Hörer, er hört jede Nachricht VOR
// ihrer Brücke): er reicht jede Marke der Heimat zurück, gleich von wem (die fremde Seite ist nicht ihr Eltern-Fenster), und
// nur die Marke — die Brücke sieht sie nie. Mit ihr meldet er den Zustand der Welt-UI jetzt und vor der ersten Nachricht
// seit der letzten Marke (vor der Tat, ehe die Brücke sie las); trägt die Marke `esc`, drückt er vorher Esc (was die Welt
// darauf der Heimat schickt, steht dort vor der Marke).
async function rueckHoerer(page, ui) {
    const el = await page.$("#portal-overlay iframe.portal-frame");
    const fr = el && (await el.contentFrame());
    if (!fr) throw new Error("die Schleuse findet keine Welt");
    await fr.evaluate((ui) => {
        if (window.__schleuseHin) return;
        const lies = () => {
            const e = ui && document.querySelector(ui.sel);
            return e ? (ui.feld === "value" ? e.value : (e.textContent || "").trim()) : null;
        };
        let frisch = true;
        let vor = null;
        window.__schleuseHin = (ev) => {
            const d = ev.data;
            if (!d || typeof d.__schleuse !== "string") {
                if (frisch) (vor = lies()), (frisch = false);
                return;
            }
            ev.stopImmediatePropagation();
            if (d.esc) window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            const jetzt = lies();
            window.parent.postMessage({ __schleuse: d.__schleuse, vor: frisch ? jetzt : vor, ui: jetzt }, "*");
            frisch = true;
        };
        window.addEventListener("message", window.__schleuseHin, true);
    }, ui);
    return fr;
}

// weg „heimat" (Heimat → Welt → Heimat) · „fremd" (Heimat → fremde Seite → Welt → Heimat) · „esc" (die Marke trägt Esc).
// tat (in derselben Aufgabe VOR der Marke — in jeder Schlange steht die Marke dahinter): { chat: wort } · { route:
// [programm, wort] } · { peer: nachricht } · { fremd: nachricht }. Zurück: vor/nach ({ journal, ui }), enterImFenster (enter
// der Heimat, während die Marke reiste), zaehler, offen (das Overlay danach).
async function schleuse(page, weg, welt, tat) {
    const t0 = Date.now();
    if (!hinFrame) hinFrame = await rueckHoerer(page, (welt && welt.ui) || null);
    const marke = `schleuse-${++schleuseNr}`;
    const s = await page.evaluate(
        async (m, weg, tat, frist) => {
            const r = window.anazhRealm;
            const K = window.__konformanz;
            const po = r._portalOverlay;
            const w = po && po.iframe && po.iframe.contentWindow;
            if (!w) return { fehlt: true };
            let antwort = null;
            const zurueck = new Promise((ende) => {
                const uhr = setTimeout(() => (window.removeEventListener("message", hoer, true), ende(false)), frist);
                function hoer(ev) {
                    if (!ev.data || ev.data.__schleuse !== m) return;
                    ev.stopImmediatePropagation();
                    antwort = ev.data;
                    clearTimeout(uhr);
                    window.removeEventListener("message", hoer, true);
                    ende(true);
                }
                window.addEventListener("message", hoer, true);
            });
            const journalVor = K.journal();
            const k = window.__kSpy ? window.__k : null;
            const enter0 = k ? k.enters : 0;
            const fremd = document.getElementById("__fremd");
            if (tat && tat.chat) await r.processChatCommand(tat.chat);
            if (tat && tat.route) await r._portalRouteDsl(["chain", tat.route[0]], tat.route[1], () => {});
            if (tat && tat.peer) w.postMessage(tat.peer, "*");
            if (tat && tat.fremd) fremd.contentWindow.postMessage({ __fremd: true, nachricht: tat.fremd }, "*");
            const marke = { __schleuse: m, esc: weg === "esc" };
            if (weg === "fremd") fremd.contentWindow.postMessage({ __fremd: true, nachricht: marke }, "*");
            else w.postMessage(marke, "*");
            const ok = await zurueck;
            return {
                ok,
                vor: { journal: journalVor, ui: antwort ? antwort.vor : null },
                nach: { journal: K.journal(), ui: antwort ? antwort.ui : null },
                enterImFenster: k ? k.enters - enter0 : 0,
                zaehler: k ? K.zaehler() : null,
                offen: !!r._portalOverlay,
            };
        },
        marke,
        weg,
        tat || null,
        SCHLEUSE_FRIST_MS
    );
    schleusenZeit.n++;
    schleusenZeit.ms += Date.now() - t0;
    if (s.fehlt) throw new Error(`die Schleuse (${weg}) findet keine Welt`);
    if (!s.ok) throw new Error(`die Schleuse ${marke} (${weg}) kam binnen ${SCHLEUSE_FRIST_MS / 1000} s nicht zurück`);
    return s;
}

// Die Wirkung, die man sieht: Journal-Ereignisse der Welt in der Heimat + der Zustand der Welt-UI (die Lesung beim
// Warten auf eine Wirkung, die nach der Schleuse noch reift).
async function zustand(page, welt) {
    const journal = await page.evaluate(() => window.__konformanz.journal());
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
// Auf eine Wirkung warten: die Schleuse ging voraus (was die Welt beim Lesen der Nachricht tut, steht in `n`), dann, bis
// sie steht oder die Frist um ist (ein Preset-Bau des Labors kann auf dem CPU-Raster dauern, bevor die Welt ihr Ereignis
// schickt) — eine Frist gegen den Hänger, keine Messung.
const WIRKUNG_FRIST_MS = 6000;
async function bisWirkung(page, welt, n, gut) {
    const t0 = Date.now();
    while (!gut(n) && Date.now() - t0 < WIRKUNG_FRIST_MS) {
        await warte(200);
        n = await zustand(page, welt);
    }
    return n;
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

async function pruefeWelt(page, welt, fehlerLog, lies) {
    const aus = { id: welt.id, k: {}, stumm: null, echo: null, notiz: [] };
    const fehlerVor = fehlerLog.length;
    const b = await betreten(page, welt);
    if (!b || !b.ok) {
        aus.k.K1 = false;
        aus.notiz.push((b && b.fehler) || "betreten fehlgeschlagen");
        return aus;
    }
    // K1: auf die ready und das load der Welt warten (terrain bootet mehrere Sekunden; nach dem load ist das enter des
    // load-Hörers geschickt), dann klingt der Handshake durch die Schleuse aus, bis die Heimat während der Reise einer
    // Marke kein enter mehr schickt: jedes enter davor ist dann beantwortet, und keine Antwort brachte ein neues (ein
    // Ping-Pong schickt in jeder Reise eins und ist nach dem vierten enter rot, K2).
    const t0 = Date.now();
    let z = await zaehler(page);
    while (!(z.readys && z.geladen) && Date.now() - t0 < READY_FRIST_MS) {
        await warte(250);
        z = await zaehler(page);
    }
    aus.k.K1 = z.readys > 0 && z.geladen > 0;
    if (!aus.k.K1) {
        aus.notiz.push(
            z.readys
                ? `die Welt lädt nicht binnen ${READY_FRIST_MS / 1000} s (kein load)`
                : `keine ready binnen ${READY_FRIST_MS / 1000} s`
        );
        await zaehlerAus(page);
        return aus;
    }
    let s = await schleuse(page, "heimat", welt);
    while (s.enterImFenster && s.zaehler.enters <= 3) s = await schleuse(page, "heimat", welt);
    z = s.zaehler;
    const ruhig = !s.enterImFenster;
    // Meldet die Welt ihr Wörterbuch in der ready, übernimmt die Heimat es (Stufe „nativ", `_portalReceiveManifest`).
    if (z.readyDsl && z.stufe !== "nativ") {
        aus.k.K1 = false;
        aus.notiz.push(`die ready trägt ein Wörterbuch, die Heimat steht auf „${z.stufe}"`);
    }
    // Das Manifest gegen das SOLL in WELTEN, gelesen wie die Welt es liest (dieselben Bytes des Servers): eine Soll-Welt
    // liefert es in Form, meldet es im ready, und die Heimat übernimmt es ganz (Stufe „nativ", Label, jedes Wort);
    // fehlt es ihr, ist K1 rot beim Namen — ebenso ein Manifest einer Welt ohne Soll-Zeile.
    const rel = `worlds/${welt.id}/manifest.json`;
    const roh = lies(rel);
    let m = null;
    try {
        m = roh ? JSON.parse(roh.toString("utf8")) : null;
    } catch {
        m = null;
    }
    const inForm =
        !!m &&
        m.schemaVersion === "1.0" &&
        m.id === welt.id &&
        typeof m.label === "string" &&
        Array.isArray(m.dsl) &&
        m.dsl.length > 0 &&
        m.dsl.every((w) => typeof w === "string");
    if (welt.manifest && !roh) {
        aus.k.K1 = false;
        aus.notiz.push(`das Soll-Manifest fehlt: ${rel} liefert 404, die Heimat steht auf „${z.stufe}"`);
    } else if (!welt.manifest && roh) {
        aus.k.K1 = false;
        aus.notiz.push(`${rel} steht ohne Soll-Zeile (WELTEN trägt kein manifest für ${welt.id})`);
    } else if (welt.manifest && !inForm) {
        aus.k.K1 = false;
        aus.notiz.push(`${rel} ist nicht in Form (schemaVersion 1.0 · id ${welt.id} · label · dsl mit Wörtern)`);
    } else if (welt.manifest) {
        const fehlt = m.dsl.filter((w) => !(z.dsl || []).includes(w));
        if (z.stufe !== "nativ" || z.label !== m.label || fehlt.length) {
            aus.k.K1 = false;
            aus.notiz.push(
                `das Manifest der Welt kommt nicht an: Stufe „${z.stufe}", Label „${z.label}"${fehlt.length ? ", es fehlen " + fehlt.slice(0, 3).join("/") : ""}`
            );
        }
    }
    if (welt.mitgebracht) {
        const frM = page.frames().find((f) => f.url().includes("worlds/" + welt.id + "/"));
        const k7 = frM ? await mitgebrachtPruefen(page, frM, welt.mitgebracht) : { ok: false, notiz: ["Welt-Frame nicht gefunden"] };
        aus.k.K7 = k7.ok;
        aus.notiz.push(...k7.notiz);
    }
    aus.k.K2 = ruhig && z.enters <= 3;
    aus.handshake = { readys: z.readys, enters: z.enters, ersteReadyMs: z.ersteReady, stufe: z.stufe };
    if (!aus.k.K2)
        aus.notiz.push(
            `Handshake ohne Ende: ${z.enters} enter, ${z.readys} ready${ruhig ? "" : ` (während der letzten Schleuse ${s.enterImFenster} enter)`} in ${Math.round((Date.now() - t0) / 1000)} s`
        );
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
    // Der Vorher-Zustand der UI-Wände (K3, Einzelwort) wird VOR der Tat gelesen (je EINE CDP-Rundreise): der Rück-Hörer
    // steht in der Hörer-Reihe der Welt HINTER ihrer Brücke (er kommt nach dem load) — las er „vor" beim Eintreffen der
    // Nachricht, hatte die Brücke schon gewirkt. An der Studio-Hülle gesehen (K41): vor = nach = „Supersport", das
    // wirkende Einzelwort galt als stumm, und K3 war am UI-Pfad blind (eine fremde chain-Form, die wirkt, las vor = nach).
    const vorK3 = await zustand(page, welt);
    const k3 = await schleuse(page, "fremd", welt, { fremd });
    aus.k.K3 = !wirkt(welt, vorK3, k3.nach) && k3.nach.journal === k3.vor.journal;
    if (!aus.k.K3) aus.notiz.push("eine fremde Seite steuert die Welt (event.source ungeprüft)");
    // dslEinzelwort: der Spieler tippt das Wort in die Konsole (die Heimat schickt die flache Form).
    if (programm) {
        const vorEw = await zustand(page, welt);
        const ew = await schleuse(page, "heimat", welt, { chat: welt.wort });
        const nach = await bisWirkung(page, welt, ew.nach, (n) => wirkt(welt, vorEw, n));
        aus.stumm = !wirkt(welt, vorEw, nach);
        aus.einzelwort = { programm, vor: vorEw, nach };
    }
    // K4: die chain-Form über den echten Weiterleiter der Heimat (bzw. der Ko-Präsenz-Eintritt von der Heimat).
    const s4 = await schleuse(
        page,
        "heimat",
        welt,
        programm ? { route: [programm, welt.wort] } : { peer: { type: "peer-join", peerId: "gefaehrte-konformanz", name: "Gefährtin" } }
    );
    // Die Studios zeigen die chain-Wirkung am Soll-Zustand (nach dem Einzelwort kann er schon stehen).
    const vorK4 = s4.vor;
    const k4Pruef = (n) => (welt.ui ? n.ui === welt.ui.soll : n.journal > vorK4.journal);
    const nach = await bisWirkung(page, welt, s4.nach, k4Pruef);
    let k4 = k4Pruef(nach);
    if (!k4) aus.notiz.push("die Heimat-Form chain wirkt nicht sichtbar");
    const fr = page.frames().find((f) => f.url().includes("worlds/" + welt.id + "/"));
    if (welt.zusatz && fr) {
        const z2 = await welt.zusatz(page, fr);
        aus.notiz.push(z2.notiz);
        k4 = k4 && z2.ok;
    }
    if (aus.k.K4 !== false) aus.k.K4 = k4;
    // K5: Esc in der Welt → die Heimat schließt das Overlay. Der Rück-Hörer drückt Esc und reicht die Marke dahinter
    // zurück: kommt sie an, hat die Heimat gelesen, was die Welt auf Esc schickte.
    const offen = fr ? (await schleuse(page, "esc", null)).offen : true;
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
    const { s, fehlend, weg } = server(taeter);
    const lies = (rel) => ausliefern(rel, taeter, []);
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "linse", frist: 180000 });
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
        // Der Vibe-Pass steht (ed25519, asynchron im Boot); dann das Mitgebrachte in den Zustand der Heimat (K7).
        await page
            .waitForFunction(() => !!(window.anazhRealm.state.vibePass && window.anazhRealm.state.vibePass.ready), { timeout: 30000, polling: 200 })
            .catch(() => console.log("  (der Vibe-Pass steht nach 30 s nicht — K7 wird rot)"));
        await page.evaluate((M) => {
            const st = window.anazhRealm.state;
            st.materials[M.material] = { builtIn: false, color: M.farbe, label: M.material, tags: {} };
            st.tools.konformanz_feile = { builtIn: false, label: M.werkzeug, opName: "konformanz_op", opClass: "subtractive" };
        }, MITGEBRACHT);
        const bootFehler = fehlerLog.length;
        if (bootFehler) console.log(`  (Heimat-Boot: ${bootFehler} Seiten-Fehler — ${fehlerLog[0]})`);
        fehlerLog.length = 0;
        await page.evaluate(seitenHelfer);
        for (const w of welten) {
            const t0 = Date.now();
            schleusenZeit = { n: 0, ms: 0 };
            const e = await pruefeWelt(page, w, fehlerLog, lies);
            e.zeit = { s: (Date.now() - t0) / 1000, schleusen: schleusenZeit };
            ergebnisse.push(e);
        }
    } finally {
        await browser.close();
        s.close();
    }
    return { ergebnisse, fehlend, weg };
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
    const k = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"].map((x) => (e.k[x] === undefined ? "·" : e.k[x] ? "✓" : "✗")).join(" ");
    const hs = e.handshake ? ` ready ${e.handshake.readys} · enter ${e.handshake.enters}` : "";
    const ew = e.stumm === null ? "" : e.stumm ? " · Einzelwort STUMM" : " · Einzelwort wirkt";
    // Die Zeit je Welt und ihrer Schleusen (der CI-Schritt trägt sonst nur seine Summe).
    const zt = e.zeit ? ` · ${e.zeit.s.toFixed(1)} s (Schleusen ${e.zeit.schleusen.n}× ${(e.zeit.schleusen.ms / 1000).toFixed(1)} s)` : "";
    console.log(`  ${e.id.padEnd(14)} ${k}${hs}${ew}${e.echo ? " · Echo" : ""}${zt}${e.notiz.length ? " — " + e.notiz.join("; ") : ""}`);
}

async function selbsttest() {
    const welten = WELTEN.filter((w) => ["begegnung", "garage", "skeleton", "fluid", "terrain", "klang"].includes(w.id));
    const { ergebnisse, fehlend, weg } = await lauf(welten, true);
    ergebnisse.forEach(drucke);
    const by = Object.fromEntries(ergebnisse.map((e) => [e.id, e]));
    const ratsche = ratscheLesen();
    const stumm = ergebnisse.filter((e) => e.stumm).map((e) => e.id);
    const v = ratscheVergleich(stumm, ratsche.dslEinzelwort.welten.filter((w) => by[w]));
    const proben = [
        ["Täter-Fundstellen gefunden", !fehlend.length, fehlend.join(" · ")],
        ["K3 rot: begegnung ohne Quellen-Prüfung nimmt den fremden peer-join an", by.begegnung && by.begegnung.k.K3 === false, ""],
        ["K3 rot am UI-Pfad: die Hülle ohne Quellen-Prüfung — die garage nimmt die fremde chain-Form an (der Vorher-Zustand vor der Tat gelesen)", by.garage && by.garage.k.K3 === false, ""],
        ["K2 rot: die Heimat beantwortet jede ready, garage spielt Ping-Pong", by.garage && by.garage.k.K2 === false, by.garage && by.garage.handshake ? `${by.garage.handshake.enters} enter` : ""],
        [
            "Uhr-frei: klang baut nach ihrer ready 3 s, bevor sie die enter liest — die Ratsche readyEcho hält, der Handshake endet",
            by.klang && by.klang.echo === true && by.klang.k.K2 === true,
            by.klang && by.klang.handshake ? `ready ${by.klang.handshake.readys} · enter ${by.klang.handshake.enters}` : "",
        ],
        ["Ratsche rot: die Hülle mit Element-Adapter — skeleton ist NEU stumm", v.neu.includes("skeleton"), "neu stumm: " + v.neu.join(",")],
        ["Kontrolle: die chain-Form wirkt trotz Element-Adapter (der Täter trifft nur das Einzelwort)", by.skeleton && by.skeleton.k.K4 === true, ""],
        ["K7 rot: skeleton rendert den Material-Namen als Markup", by.skeleton && by.skeleton.k.K7 === false, by.skeleton ? by.skeleton.notiz.filter((n) => /Markup/.test(n)).join("") : ""],
        ["404-Täter getroffen: die Welt fragte ihr Manifest und bekam keins", TAETER_WEG.every((r) => weg.has(r)), [...weg].join(" · ")],
        ...["skeleton", "terrain"].map((id) => [
            `K1 rot: ${id} verliert ihr manifest.json (404), die Soll-Welt beim Namen`,
            by[id] && by[id].k.K1 === false && by[id].notiz.some((n) => n.includes(`Soll-Manifest fehlt: worlds/${id}/manifest.json`)),
            by[id] ? by[id].notiz.filter((n) => /Manifest/.test(n)).join("") : "",
        ]),
        ["K1 rot: fluid meldet ihr Manifest ohne „flut“ (die Heimat lernt das Wort nicht)", by.fluid && by.fluid.k.K1 === false && by.fluid.notiz.some((n) => /es fehlen flut/.test(n)), by.fluid ? by.fluid.notiz.filter((n) => /Manifest/.test(n)).join("") : ""],
        ["K1 rot: garage trägt ein manifest.json ohne Soll-Zeile", by.garage && by.garage.k.K1 === false && by.garage.notiz.some((n) => /ohne Soll-Zeile/.test(n)), by.garage ? by.garage.notiz.filter((n) => /Soll-Zeile/.test(n)).join("") : ""],
        ["Soll-Wand rot: ein Manifest im Baum, dessen Welt WELTEN nicht kennt (fluid ohne Zeile)", manifestOhneZeile(WELTEN.filter((w) => w.id !== "fluid")).join() === "fluid", ""],
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
    console.log("Portal-Konformanz: K1 ready (+ Manifest gegen das Soll) · K2 endlich · K3 Quelle · K4 wirkt · K5 Esc · K6 fehlerfrei · K7 mitgebracht");
    ergebnisse.forEach(drucke);
    const rot = [];
    for (const e of ergebnisse) for (const [k, v] of Object.entries(e.k)) if (v === false) rot.push(`${e.id} ${k}`);
    for (const id of manifestOhneZeile(WELTEN)) rot.push(`${id} K1 — worlds/${id}/manifest.json ohne Soll-Zeile in WELTEN`);
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
    console.log(`✅ gate:portal-konformanz: ${ergebnisse.length} Welten K1–K7 grün · Ratschen gehalten`);
    process.exit(0);
})().catch((e) => {
    console.error("portal-konformanz-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
