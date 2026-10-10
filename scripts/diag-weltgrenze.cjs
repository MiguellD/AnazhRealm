#!/usr/bin/env node
// gate:weltgrenze — KEIN WELT-ZUSTAND REIST ÜBER EINE WELTGRENZE.
//
// Die Gegenprüfung Runde 2 (10.10.) fand den Spread `{ ...this.state.worldMeta, ...state.worldMeta }` im Restore: jede
// Welt, die ohne Erbgut geladen wurde, behielt das Erbgut, den Anker, die Edits, die Dorf-Zellen und die Stempel der
// Welt davor — über das Welt-Tor „Ersetzen" wurde eine Wildnis-Welt still als Insel gezeichnet und mit dem Erbgut der
// Prüfbühne gespeichert. Diese Linse fährt JEDEN Weg, auf dem eine Welt B die Seite oder den Speicher einer Welt A
// betritt, und nennt jedes Feld von A, das B danach trägt, beim Namen. Die Gegenprüfung Runde 3 fand zwei Wege, auf denen
// der Speicher eine Mischung trägt oder eine Welt verliert: eine Welt ohne worldId lag roh auf dem Platz von A, und der
// Boot vergab vor dem Lesen des Platzes eine neue Id (beide Welten fort); und zwischen `location.reload()` und dem Tod der
// Seite schrieb jeder saveState die lebende Seite unter den Namen von B oder setzte den Aktiv-Zeiger auf A zurück.
//
//   laden               `loadState(B)` in der lebenden Seite (der Engpass jedes Ladens: Boot, „lade zustand")
//   ersetzen[-ohne-id|-ohne-meta]   das Welt-Tor „Ersetzen" (`_weltTorImportReplace`)
//   ersetzen-quota      dasselbe, der Speicher wirft beim Ablegen (Quota): die Seite bleibt laut in A, kein Reload
//   weltpull[-ohne-id|-ohne-meta]   der Snapshot des Hosts (`_p2pApplyWorldSnapshot`, Resync, world-pull)
//   portal              das Adress-Portal (`_enterPortalToAddress` → `joinWorldFromCode` gegen einen Schein-Broker)
//   einladung           der Beitritt per Einladungs-Code (`joinWorldFromCode` → `_importGuestWorld`, Schein-Broker)
//   geburt              „Neue Welt" (`createNewWorld`) — erlaubt ist nur die Positiv-Liste (visibility, creator)
//   reload              B liegt im Speicher, die Seite lädt neu (Boot: Vorlade + Restore; die Formen ohne worldId,
//                       ohne worldMeta, korrupt, nur IndexedDB fährt gate:boot-rettung)
// Dazu je Tür: A trägt nach dem letzten Autosave noch MARKER-A-SPAET (Fortschritt) — die Tür sichert A vor der Sperre.
// Und statisch (Absenz): eine ganze Welt schreibt in den Speicher nur saveState (die lebende) und `_weltAblegen` (die EINE
// Ablage), `location.reload` steht nur in `_weltWechselNeuLaden` — jeder andere Schreiber fällt beim Namen.
//
// Welt A ist die frisch gebootete Standard-Welt (gespeichert), in die die Linse ein Zeichen pflanzt: das Erbgut der
// Prüfbühne (spec/pruefbuehne/welt.json), einen Makro-Anker, ein Edit, Dorf-Zellen, die Stempel von Ring, Vorschau und
// Saat, Rolle, Bann-Liste, Adresse, Region, Rechte, Modus, Sichtbarkeit, ein Feld, das dieser Build nicht kennt, die
// Gedächtnisse der Seite (Anker, Ring, Vorschau, Dorf-Zug) und ein Tier. Welt B ist eine Wildnis-Welt ohne all das, mit
// MARKER-B im Wissen (je Weg auch ohne worldId oder ohne worldMeta). Jede Tür bekommt das RELOAD-FENSTER des Spiels: der
// Server liefert die neue Seite 1,5 s später, ein Edit-Save steht vor der Tür an, danach ein saveState und ein Edit-Save.
// Geprüft werden: das worldMeta der Seite, die Leser (`_erbgut`, `_macroAnker`, der Worker-Spiegel), die Gedächtnisse,
// der Snapshot der Seite, der Speicher-Eintrag von B (byte-gleich mit der abgelegten Datei, wenn die neue Seite startet),
// der Aktiv-Zeiger, MARKER-B in der erwachten Welt und A unter seiner Id (ohne MARKER-B, im Index). Ein Weg, der in der
// Seite bleibt, bekommt den nächsten Schritt des Spiels (Autosave, Reload).
//
//   node scripts/diag-weltgrenze.cjs [--json datei] [--wurzel dir] [--wege laden,ersetzen,...]
//                                      (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-weltgrenze.cjs --selftest   zusätzlich zwei Scheine: der alte Spread am Lade-Engpass (der Weg
//                                      „laden" MUSS rot werden) und saveState ohne die Sperre des Welt-Wechsels (der Weg
//                                      „ersetzen" MUSS rot werden) — beide beim Namen
// Port: WELTGRENZE_PORT (Default 4401). Exit 1 bei einem Befund, einem Page-Error oder einem blinden Selbsttest.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SELBSTTEST = argv.includes("--selftest");
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.WELTGRENZE_PORT) || 4401;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const ALLE_WEGE = [
    "laden",
    "ersetzen",
    "ersetzen-ohne-id",
    "ersetzen-ohne-meta",
    "ersetzen-quota",
    "weltpull",
    "weltpull-ohne-id",
    "weltpull-ohne-meta",
    "portal",
    "einladung",
    "geburt",
    "reload",
];
// Das Reload-Fenster: so lange liefert der Server die neue Seite später (die alte lebt, ihre Timer feuern).
const FENSTER_MS = 1500;
let verzoegerung = 0;
const WEGE = opt("--wege", ALLE_WEGE.join(","))
    .split(",")
    .filter((w) => ALLE_WEGE.includes(w));
const BUEHNE = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json"), "utf8"));

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    const sende = () =>
        fs.readFile(fp, (err, data) => {
            if (err) {
                res.statusCode = 404;
                return res.end();
            }
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.setHeader("Cache-Control", "no-store");
            res.end(data);
        });
    if (verzoegerung && p === "/index.html") setTimeout(sende, verzoegerung);
    else sende();
});

// Beim Start JEDER Seite, vor dem Spiel: der Aktiv-Zeiger und sein Speicher-Eintrag (was die alte Seite hinterließ).
function startFang() {
    try {
        const id = localStorage.getItem("anazhRealmActiveWorld");
        window.__grenzeStart = { id, json: id ? localStorage.getItem("anazhRealmState_" + id) : null };
    } catch (_e) {
        window.__grenzeStart = { id: null, json: null };
    }
}

// Die Prüfer in der Seite (überleben jeden Reload: evaluateOnNewDocument).
function seitenPruefer() {
    const T = "GRENZE-A";
    // Die Werte von A ohne Platz für das Zeichen (Aufzählungen): A trägt je einen, den B nie von selbst trägt.
    const A_STUFEN = {
        role: "host",
        regionsActive: true,
        guestRights: "mitschöpfer",
        gameMode: "pfad",
        visibility: "gelistet",
    };
    // Was B ohne eigenen Wert trägt: die Vorlage der Seite (Konstruktor) — die Wege setzen ihre Rolle selbst.
    const VORLAGE = {
        role: "solo",
        regionsActive: false,
        guestRights: "frieden",
        gameMode: "frieden",
        visibility: "privat",
    };
    // Die Pfade, an denen das Zeichen von A steht (Schlüssel oder Wert), gekürzt auf die Ebene des Feldes.
    const pfade = (obj, wurzel, tiefe = 2) => {
        const out = new Set();
        const kurz = (p) =>
            p
                .split(/(?=[.[])/)
                .slice(0, tiefe)
                .join("");
        const geh = (v, p, t) => {
            if (t > 14 || out.size > 60) return;
            if (typeof v === "string") {
                if (v.includes(T)) out.add(kurz(p));
            } else if (Array.isArray(v)) {
                v.forEach((x, i) => geh(x, `${p}[${i}]`, t + 1));
            } else if (v instanceof Set || v instanceof Map) {
                geh(Array.from(v.keys()), p, t + 1);
            } else if (v && typeof v === "object") {
                for (const k of Object.keys(v)) {
                    if (k.includes(T)) out.add(kurz(`${p}.${k}`));
                    geh(v[k], `${p}.${k}`, t + 1);
                }
            }
        };
        geh(obj, wurzel, 0);
        return Array.from(out);
    };
    window.__grenze = {
        T,
        // Welt B: eine Wildnis-Welt ohne Erbgut, Anker, Edits, Dörfer und Stempel — geboren wie jede neue Welt, gebaut,
        // BEVOR A ihr Zeichen trägt.
        // `form`: "voll" · "ohne-id" (worldMeta ohne worldId: ein Minimal-Snapshot) · "ohne-meta" (ein Legacy-Save vor Ring 8).
        bauB(slug, form) {
            const r = window.anazhRealm;
            const b = JSON.parse(JSON.stringify(r._buildEmptyWorldSnapshot(r._generateFreshWorldMeta(slug), false)));
            b.knowledgeBase = ["MARKER-B"];
            if (form === "ohne-id") delete b.worldMeta.worldId;
            if (form === "ohne-meta") delete b.worldMeta;
            return b;
        },
        // B lebt: MARKER-B steht im Zustand der erwachten Seite.
        markerB() {
            return JSON.stringify(window.anazhRealm.buildStateSnapshot()).includes("MARKER-B");
        },
        // A BLEIBT unter seiner Id: sein Platz trägt A (nicht B), der Index kennt A; mit `spaet` auch A's Fortschritt seit
        // dem letzten Autosave (die Tür sichert A vor der Sperre).
        befundeA(aId, spaet) {
            const r = window.anazhRealm;
            const roh = localStorage.getItem(r.worldStorageKey(aId));
            if (!roh) return [`A: unter ${aId} liegt keine Welt mehr`];
            const out = [];
            const s = JSON.parse(roh);
            const id = s.worldMeta && s.worldMeta.worldId;
            if (id !== aId) out.push(`A: der Platz von A trägt die Welt ${id === undefined ? "ohne worldId" : id}`);
            if (roh.includes("MARKER-B")) out.push("A: der Platz von A trägt B (MARKER-B)");
            if (!r.worldsIndexLoad().some((e) => e && e.worldId === aId)) out.push("A: fehlt im Index der Welten");
            if (spaet && !roh.includes("MARKER-A-SPAET"))
                out.push(
                    "A: der Fortschritt seit dem letzten Autosave fehlt (MARKER-A-SPAET) — A wurde vor der Sperre nicht gesichert"
                );
            return out;
        },
        // DAS RELOAD-FENSTER des Spiels: vor der Tür steht ein Edit-Save an (Edit direkt vor dem Ersetzen), nach ihr ein
        // saveState (Loop-Autosave) und ein Edit-Save (Dorf-Rückruf, Settlement-Export).
        fensterVor() {
            window.anazhRealm._scheduleEditSave();
        },
        fensterNach() {
            const r = window.anazhRealm;
            setTimeout(() => {
                try {
                    r.saveState();
                } catch (_e) {
                    /* ein Wurf zählt der Page-Error */
                }
            }, 300);
            r._scheduleEditSave();
        },
        // Welt A trägt ihr Zeichen: jedes welt-eigene Feld, die Gedächtnisse der Seite und ein Tier.
        pflanzeA(buehneErbgut) {
            const r = window.anazhRealm;
            const wm = r.state.worldMeta;
            const anker = Object.assign(r._makeMacroAnker("grenze-a-anker"), { herkunft: T });
            Object.assign(wm, A_STUFEN, {
                erbgut: Object.assign({ herkunft: T }, buehneErbgut),
                macro: anker,
                voxelEdits: [{ x: 12345, y: 10, z: 12345, r: 2, strength: 48, mode: "carve", herkunft: T }],
                settlementCells: { [T]: { seed: 7, nH: 3, x: 12345, z: 12345 }, start: { herkunft: T } },
                genesisPortalRing: T,
                portalPreviewFachwerk: T,
                portalPreviewGarage: T,
                saat: [{ dsl: T }],
                saatGesaet: T,
                bauSame: { [T]: 3 },
                parentWorlds: [T],
                hostInfo: { url: T, roomId: T, peerId: T },
                banList: { peerIds: [T], vibePassKeys: [] },
                worldAddress: { label: T },
                currentRegionKey: T,
                creator: T,
                fusionStrategy: T,
                grenzeFremd: T,
            });
            r._erbgutCache = null;
            r._macroAnkerCache = anker;
            r._genesisRingFertig = true;
            r._portalPreviewFertig = Object.assign(Object.create(null), { fachwerk: true });
            r._autoSettlementRejected = new Set([T]);
            r._autoSettlementStartHopeless = true;
            r._autoSettlementQueue = { plan: { slots: [], name: T }, origin: { x: 0, z: 0 }, idx: 0, cellKey: T };
            r._stlWegeKeys = new Set([T]);
            const pm = r.state.playerMesh;
            const x = pm ? pm.position.x + 6 : 6;
            const z = pm ? pm.position.z + 6 : 6;
            const tier = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 1, z, "happy", null, { precise: true });
            if (tier && tier.userData) tier.userData.name = T;
            return { erbgut: r._erbgut().terme.map((t) => t.art), tier: !!tier };
        },
        // Die lebende Seite in Welt B: jedes Feld von A beim Namen. `ganz` = auch der volle Snapshot der Seite (nach einem
        // Reload; in der Seite trägt das Leben der alten Welt nur der Reload fort, die Türen laden neu).
        befundeLive(erlaubt, ganz) {
            const r = window.anazhRealm;
            const ok = new Set(erlaubt || []);
            const out = [];
            const wm = r.state.worldMeta || {};
            for (const p of pfade(wm, "worldMeta")) if (!ok.has(p)) out.push(p);
            for (const k of Object.keys(A_STUFEN)) {
                const pfad = `worldMeta.${k}`;
                if (ok.has(pfad) || wm[k] !== A_STUFEN[k]) continue;
                out.push(`${pfad} (= ${JSON.stringify(A_STUFEN[k])} von A)`);
            }
            const e = r._erbgut();
            if (!(e.terme.length === 1 && e.terme[0].art === "wildnis"))
                out.push(`Leser _erbgut() [${e.terme.map((t) => t.art).join(", ")}]`);
            for (const p of pfade(r._macroAnker(), "Leser _macroAnker()", 1)) out.push(p);
            const ws = r._voxelWorkerSnapshotState();
            for (const p of pfade(ws, "Worker-Spiegel")) out.push(p);
            if (!(ws.erbgut && ws.erbgut.wildnis === 1)) out.push("Worker-Spiegel.erbgut (keine Wildnis)");
            const ged = {
                _macroAnkerCache: pfade(r._macroAnkerCache, "x").length > 0,
                _genesisRingFertig: r._genesisRingFertig === true,
                _portalPreviewFertig: !!(r._portalPreviewFertig && r._portalPreviewFertig.fachwerk),
                _autoSettlementRejected: !!(r._autoSettlementRejected && r._autoSettlementRejected.has(T)),
                _autoSettlementStartHopeless: r._autoSettlementStartHopeless === true,
                _autoSettlementQueue: !!(r._autoSettlementQueue && r._autoSettlementQueue.cellKey === T),
                _stlWegeKeys: !!(r._stlWegeKeys && r._stlWegeKeys.has(T)),
            };
            for (const k of Object.keys(ged)) if (ged[k]) out.push(`Gedächtnis this.${k}`);
            if (ganz) {
                const snap = r.buildStateSnapshot();
                for (const p of pfade(snap, "Snapshot", 3)) if (!ok.has(p.replace(/^Snapshot\./, ""))) out.push(p);
            }
            return Array.from(new Set(out));
        },
        // Der Speicher-Eintrag von B (die Wahrheit des nächsten Boots).
        befundeSpeicher(weltId, erlaubt) {
            const r = window.anazhRealm;
            const ok = new Set(erlaubt || []);
            const roh = localStorage.getItem(r.worldStorageKey(weltId));
            if (!roh) return [`Speicher: kein Eintrag für ${weltId}`];
            const s = JSON.parse(roh);
            const out = pfade(s, "Speicher", 3).filter((p) => !ok.has(p.replace(/^Speicher\./, "")));
            const wm = s.worldMeta || {};
            for (const k of Object.keys(A_STUFEN)) {
                const pfad = `worldMeta.${k}`;
                if (ok.has(pfad) || wm[k] !== A_STUFEN[k]) continue;
                out.push(`Speicher.${pfad} (= ${JSON.stringify(A_STUFEN[k])} von A)`);
            }
            if (wm.erbgut != null) out.push("Speicher.worldMeta.erbgut");
            return out;
        },
        VORLAGE,
    };
}

// Die Seite ist erwacht (die Welt bereit). Mit `weltId`: in DIESER Welt — sonst sofort der Name der Welt, in der sie erwachte.
async function bereit(page, weltId) {
    return page.evaluate(async (weltId) => {
        const t0 = performance.now();
        while (performance.now() - t0 < 120000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.worldMeta) {
                const welt = r.state.worldMeta.worldId;
                return { ok: !weltId || welt === weltId, ms: Math.round(performance.now() - t0), welt };
            }
            await new Promise((res) => setTimeout(res, 50));
        }
        const r = window.anazhRealm;
        return { ok: false, haengt: true, welt: r && r.state && r.state.worldMeta ? r.state.worldMeta.worldId : null };
    }, weltId || null);
}

// DIE ABSENZ (statisch, im Stamm des Baums): eine ganze Welt schreibt nur saveState (die lebende) und `_weltAblegen` (die
// EINE Ablage) in den Speicher, `location.reload` steht nur im Welt-Wechsel `_weltWechselNeuLaden`. Jeder andere Ort fällt
// beim Namen seiner Methode.
function absenz() {
    const zeilen = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8").split("\n");
    const methodeAn = (i) => {
        for (let j = i; j >= 0; j--) {
            const m = /^ {4}(?:static |async )*([A-Za-z_$][\w$]*)\(.*\)\s*\{\s*$/.exec(zeilen[j]);
            if (m) return m[1];
        }
        return "?";
    };
    const out = [];
    const pruefe = (re, erlaubt, was) =>
        zeilen.forEach((z, i) => {
            if (!re.test(z) || /^\s*\/\//.test(z)) return;
            const m = methodeAn(i);
            if (!erlaubt.includes(m)) out.push(`${was}: ${m} (anazhRealm.js:${i + 1})`);
        });
    pruefe(
        /localStorage\.setItem\(this\.worldStorageKey\(/,
        ["saveState", "_weltAblegen"],
        "Welt-Schreiber neben der EINEN Ablage"
    );
    pruefe(/location\.reload\(\)/, ["_weltWechselNeuLaden"], "Reload neben dem Welt-Wechsel");
    return out;
}

const TUEREN = new Set(["ersetzen", "weltpull", "portal", "einladung", "geburt"]);

// Ein Weg in einem frischen Browser-Kontext (eigener Speicher): A booten und speichern, B bauen, A zeichnen, den Weg gehen
// (eine Tür im Reload-Fenster), B prüfen und A. `schein`: "spread" (der alte Spread am Lade-Engpass) · "sperre" (saveState
// ohne die Sperre des Welt-Wechsels).
async function fahreWeg(browser, weg, schein) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const rep = { weg, schein, befunde: [], erlaubt: [], boot: [], navigiert: null };
    const basis = weg.split("-")[0];
    const form = weg.endsWith("-ohne-id") ? "ohne-id" : weg.endsWith("-ohne-meta") ? "ohne-meta" : "voll";
    const tuer = TUEREN.has(basis);
    let pageErr = null;
    let phase = "boot A";
    let gemeldet = null;
    page.on("pageerror", (err) => {
        const zeilen = String(err.stack || err.message).split("\n");
        if (!pageErr) pageErr = `[${phase}] ${zeilen.slice(0, 4).join(" | ")}`;
    });
    page.on("framenavigated", (f) => {
        if (f === page.mainFrame() && phase !== "boot A") phase = "nach dem Reload";
    });
    page.on("dialog", (d) => d.accept().catch(() => {}));
    await page.exposeFunction("__grenzeMelde", (x) => {
        gemeldet = x;
    });
    await page.evaluateOnNewDocument(startFang);
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.evaluateOnNewDocument(seitenPruefer);
    const t0 = Date.now();
    const lege = async (fn, ...a) => (await page.evaluate(fn, ...a)) || [];
    try {
        verzoegerung = 0;
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const a = await bereit(page, null);
        rep.boot.push(a.ms);
        if (!a.ok) throw new Error("Welt A nicht bereit nach 120 s");
        phase = "Weg";
        // A ist gespeichert (sein Platz besteht), bevor sie ihr Zeichen trägt
        const aId = await page.evaluate(() => {
            const r = window.anazhRealm;
            r.saveState();
            return r.state.worldMeta.worldId;
        });
        const B = await page.evaluate((f) => window.__grenze.bauB("grenze-b", f), form);
        rep.pflanzung = await page.evaluate((e) => window.__grenze.pflanzeA(e), BUEHNE.worldMeta.erbgut);
        // A's Fortschritt nach dem letzten Autosave: er muss die Tür überleben (auf A's Platz)
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.state.knowledgeBase = (r.state.knowledgeBase || []).concat(["MARKER-A-SPAET"]);
        });
        if (schein === "spread") {
            // DER ALTE SPREAD ZUM SCHEIN: nach jedem Laden mischt sich das worldMeta der alten Welt darunter.
            await page.evaluate(() => {
                const r = window.anazhRealm;
                const roh = r.loadState.bind(r);
                r.loadState = (s) => {
                    const alt = r.state.worldMeta;
                    const e = roh(s);
                    r.state.worldMeta = { ...alt, ...r.state.worldMeta };
                    r._erbgutCache = null;
                    return e;
                };
            });
        }
        if (schein === "sperre") {
            // SAVESTATE OHNE DIE SPERRE ZUM SCHEIN: im Reload-Fenster schreibt die Seite wieder.
            await page.evaluate(() => {
                const r = window.anazhRealm;
                const roh = r.saveState.bind(r);
                r.saveState = () => {
                    const s = r._weltWechselSperre;
                    r._weltWechselSperre = false;
                    try {
                        return roh();
                    } finally {
                        r._weltWechselSperre = s;
                    }
                };
            });
        }
        verzoegerung = tuer || weg === "ersetzen-quota" ? FENSTER_MS : 0;
        const nav =
            tuer || weg === "ersetzen-quota"
                ? page
                      .waitForNavigation({
                          waitUntil: "domcontentloaded",
                          // die gescheiterte Ablage lädt nicht: das Fenster plus der Boot der neuen Seite reicht als Frist
                          timeout: FENSTER_MS + (weg === "ersetzen-quota" ? 2500 : 6000),
                      })
                      .then(() => true)
                      .catch(() => false)
                : Promise.resolve(false);
        const lauf = await page
            .evaluate(
                async (weg, basis, B, aId) => {
                    const r = window.anazhRealm;
                    const g = window.__grenze;
                    const ablage = (id) => ({
                        ziel: id,
                        abgelegt: id ? localStorage.getItem(r.worldStorageKey(id)) : null,
                    });
                    if (basis === "laden") {
                        r.loadState(B);
                        return { inSeite: g.befundeLive([], false).concat(g.befundeA(aId)) };
                    }
                    if (basis === "ersetzen") {
                        if (weg === "ersetzen-quota") {
                            const key = r.worldStorageKey(B.worldMeta.worldId);
                            const roh = Storage.prototype.setItem;
                            Storage.prototype.setItem = function (k, v) {
                                if (k === key) throw new DOMException("Speicher voll (Linse)", "QuotaExceededError");
                                return roh.call(this, k, v);
                            };
                        }
                        g.fensterVor();
                        r.state.pendingImport = { parsed: B, fileName: "grenze-b.json" };
                        r._weltTorImportReplace();
                        const out = ablage(r.activeWorldGet());
                        const chat = document.getElementById("chat-output");
                        out.chat = chat ? chat.textContent.slice(-400) : "";
                        out.liveWelt = r.state.worldMeta.worldId;
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "weltpull") {
                        g.fensterVor();
                        r.state.p2p.pendingWorldSnapshot = true;
                        r._p2pApplyWorldSnapshot("grenze-host", B);
                        const out = ablage(r.activeWorldGet());
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "geburt") {
                        g.fensterVor();
                        const id = r.createNewWorld({ slug: "grenze-geburt", reload: true });
                        const out = ablage(id);
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "portal" || basis === "einladung") {
                        // DER SCHEIN-BROKER: eine WebSocket, die auf world-request den Snapshot von B schickt (das echte
                        // joinWorldFromCode, die echte Gast-Ablage, der echte Rufer `_enterPortalToAddress` bzw. der Code).
                        class ScheinWS {
                            constructor(url) {
                                this.url = url;
                                this.h = {};
                                setTimeout(() => this.feuer("open", {}), 0);
                            }
                            addEventListener(t, f) {
                                (this.h[t] = this.h[t] || []).push(f);
                            }
                            feuer(t, ev) {
                                for (const f of this.h[t] || []) f(ev);
                            }
                            send(d) {
                                const m = JSON.parse(d);
                                if (m.type === "world-request")
                                    setTimeout(
                                        () =>
                                            this.feuer("message", {
                                                data: JSON.stringify({
                                                    type: "world-snapshot",
                                                    peerId: "grenze-host",
                                                    state: B,
                                                }),
                                            }),
                                        0
                                    );
                            }
                            close() {}
                        }
                        window.WebSocket = ScheinWS;
                        const roh = r._importGuestWorld.bind(r);
                        r._importGuestWorld = (...a) => {
                            const id = roh(...a);
                            window.__grenzeMelde(ablage(id));
                            g.fensterNach();
                            return id;
                        };
                        g.fensterVor();
                        const id = B.worldMeta.worldId;
                        if (basis === "portal")
                            await r._enterPortalToAddress(
                                { type: "welt_portal", affordances: { isPortal: true } },
                                { worldId: id, roomId: id, broker: "ws://127.0.0.1:9", label: "grenze-b" }
                            );
                        else await r.joinWorldFromCode(`anazh://127.0.0.1:9/${id}`, { slugHint: "grenze-b" });
                        return {};
                    }
                    if (basis === "reload") {
                        const id =
                            B.worldMeta && B.worldMeta.worldId ? B.worldMeta.worldId : "grenze-platz-" + Date.now();
                        localStorage.setItem(r.worldStorageKey(id), JSON.stringify(B));
                        r.worldsIndexUpsert({
                            worldId: id,
                            slug: "grenze-b",
                            bornAt: Date.now(),
                            lastPlayed: Date.now(),
                        });
                        r.activeWorldSet(id);
                        return { ziel: id };
                    }
                    return {};
                },
                weg,
                basis,
                B,
                aId
            )
            .catch((e) => ({ abbruch: String(e && e.message ? e.message : e) }));
        rep.navigiert = await nav;
        if ((basis === "portal" || basis === "einladung") && gemeldet) Object.assign(lauf, gemeldet);
        if (lauf && lauf.inSeite) for (const f of lauf.inSeite) rep.befunde.push(`in der Seite: ${f}`);
        if (basis === "laden") return rep;
        if (weg === "ersetzen-quota") {
            // KEIN RELOAD OHNE GELUNGENE ABLAGE: die Seite bleibt in A, und sie sagt es.
            if (rep.navigiert) rep.befunde.push("Reload ohne gelungene Ablage — der alte Stand lädt still");
            else {
                const z = await page.evaluate(() => ({
                    zeiger: window.anazhRealm.activeWorldGet(),
                    welt: window.anazhRealm.state.worldMeta.worldId,
                }));
                if (z.zeiger !== aId)
                    rep.befunde.push(`der Aktiv-Zeiger zeigt nach der gescheiterten Ablage auf ${z.zeiger}`);
                if (z.welt !== aId)
                    rep.befunde.push(`die Seite trägt nach der gescheiterten Ablage die Welt ${z.welt}`);
                if (!/fehlgeschlagen/.test(lauf.chat || ""))
                    rep.befunde.push("die gescheiterte Ablage blieb still (kein Satz im Chat)");
                rep.befunde.push(...(await lege((id) => window.__grenze.befundeA(id, true), aId)));
            }
            return rep;
        }
        const ziel = lauf && lauf.ziel;
        if (!ziel) throw new Error(`der Weg nannte keine Ziel-Welt (${JSON.stringify(lauf).slice(0, 160)})`);
        if (basis === "geburt") {
            // DIE POSITIV-LISTE DER GEBURT: die Wahl des Schöpfers reist in die neue Welt (Sichtbarkeit, Schöpfer).
            rep.erlaubt = ["worldMeta.visibility", "worldMeta.creator"];
        }
        if (!rep.navigiert) {
            if (tuer && basis !== "portal" && basis !== "einladung") {
                // in der Seite geblieben: der nächste Schritt des Spiels — der Autosave schreibt, was die Seite trägt
                await page.evaluate(() => window.anazhRealm.saveState()).catch(() => {});
                rep.befunde.push(
                    ...(await lege((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, rep.erlaubt)).map(
                        (f) => `nach dem Autosave: ${f}`
                    )
                );
            }
            // der Rufer lädt neu (die Einladung, der Boot) — oder die nächste Sitzung
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        }
        verzoegerung = 0;
        const b = await bereit(page, ziel);
        rep.boot.push(b.ms);
        if (b.haengt) throw new Error(`die Seite erwachte nicht in 120 s (aktiv: ${b.welt})`);
        const start = await page.evaluate(() => window.__grenzeStart);
        if (tuer) {
            if (start.id !== ziel)
                rep.befunde.push(`nach dem Reload-Fenster zeigt der Aktiv-Zeiger auf ${start.id} statt auf ${ziel}`);
            else if (start.json !== lauf.abgelegt)
                rep.befunde.push(
                    `der Platz von B trägt nach dem Reload-Fenster ${start.json ? start.json.length : 0} Bytes statt der abgelegten ${lauf.abgelegt ? lauf.abgelegt.length : 0} (die Seite schrieb in ihn)`
                );
        }
        rep.befunde.push(
            ...(await lege((id, sp) => window.__grenze.befundeA(id, sp), aId, tuer)).map((f) => `nach dem Reload: ${f}`)
        );
        rep.befunde.push(
            ...(await lege((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, rep.erlaubt)).map(
                (f) => `nach dem Reload: ${f}`
            )
        );
        if (!b.ok) {
            rep.befunde.push(`die Seite erwachte in ${b.welt} statt in der Ziel-Welt ${ziel}`);
        } else {
            if (basis !== "geburt" && !(await page.evaluate(() => window.__grenze.markerB())))
                rep.befunde.push("nach dem Reload: MARKER-B fehlt — B lebt nicht");
            rep.befunde.push(
                ...(await lege((ok) => window.__grenze.befundeLive(ok, true), rep.erlaubt)).map(
                    (f) => `nach dem Reload: ${f}`
                )
            );
        }
    } catch (e) {
        rep.befunde.push(`ABBRUCH: ${e && e.message ? e.message : e}`);
    } finally {
        verzoegerung = 0;
        if (pageErr) rep.befunde.push(`PAGE-ERROR: ${pageErr}`);
        rep.ms = Date.now() - t0;
        rep.befunde = Array.from(new Set(rep.befunde));
        await ctx.close();
    }
    return rep;
}

(async () => {
    const tStart = Date.now();
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("\n========= DIE WELTGRENZE — kein Feld von A reist nach B, keine Welt geht verloren =========");
    console.log(`  Baum: ${root}`);
    const berichte = [];
    let rot = false;
    const abs = absenz();
    if (abs.length) rot = true;
    console.log(
        `  ${abs.length ? "⛔" : "✓"} absenz             ${abs.length ? abs.length + " Befunde" : "ein Schreiber je Rolle (saveState, _weltAblegen), ein Reload (_weltWechselNeuLaden)"}`
    );
    for (const f of abs) console.log(`      ⛔ ${f}`);
    for (const weg of WEGE) {
        const rep = await fahreWeg(browser, weg, null);
        berichte.push(rep);
        const gruen = rep.befunde.length === 0;
        if (!gruen) rot = true;
        const art = rep.navigiert
            ? "die Tür lud neu"
            : weg === "laden"
              ? "blieb in der Seite"
              : weg === "ersetzen-quota"
                ? "kein Reload"
                : "neu geladen";
        console.log(
            `  ${gruen ? "✓" : "⛔"} ${weg.padEnd(18)} ${art} · Boot ${rep.boot.join(" + ")} ms · ${(rep.ms / 1000).toFixed(1)} s${rep.erlaubt.length ? ` · Positiv-Liste ${rep.erlaubt.map((p) => p.split(".")[1]).join(", ")}` : ""} · ${gruen ? "0 Befunde" : rep.befunde.length + " Befunde"}`
        );
        for (const f of rep.befunde) console.log(`      ⛔ ${f}`);
    }
    let selbst = null;
    if (SELBSTTEST) {
        const spread = await fahreWeg(browser, "laden", "spread");
        const sperre = await fahreWeg(browser, "ersetzen", "sperre");
        const namen = spread.befunde.filter((f) => f.startsWith("in der Seite: worldMeta."));
        const fenster = sperre.befunde.filter((f) => /Reload-Fenster|erwachte in/.test(f));
        selbst = { spread: namen, sperre: fenster, befunde: { spread: spread.befunde, sperre: sperre.befunde } };
        console.log(
            `\n  SELBSTTEST 1 (der alte Spread am Lade-Engpass zum Schein): ${namen.length} Felder von A beim Namen — ${namen
                .map((f) => f.replace("in der Seite: ", ""))
                .slice(0, 6)
                .join(", ")}${namen.length > 6 ? " …" : ""}`
        );
        console.log(
            `  SELBSTTEST 2 (saveState ohne die Sperre des Welt-Wechsels zum Schein): ${fenster.length} Befunde — ${fenster.join(" · ")}`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ root, absenz: abs, berichte, selbst }, null, 1));
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.spread.length > 0 && selbst.sperre.length > 0;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: auf keinem Weg trägt B ein Feld von A oder geht eine Welt verloren — und beide Scheine fallen rot beim Namen" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "ein Schein blieb unentdeckt (die Linse ist blind)")}`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? `Auf ${WEGE.length} von ${WEGE.length} Wegen trägt B 0 Felder von A, und keine Welt geht verloren` : "EIN WELT-ZUSTAND REIST ÜBER DIE WELTGRENZE ODER EINE WELT GEHT VERLOREN"}`
        );
    }
    console.log(`  Laufzeit ${((Date.now() - tStart) / 1000).toFixed(1)} s\n`);
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("⛔", e && e.stack ? e.stack : e);
    process.exit(1);
});
