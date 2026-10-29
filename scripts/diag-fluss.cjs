#!/usr/bin/env node
// diag-fluss.cjs — DIE FLUSS-WAND: der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.
// Die Transport-Schale (`_foundrySchale`, im Worker VOR dem Studio) trägt Platte · Konsum-Wand · Index-Verengung · Transfer.
//
// STATISCH (Node, über den EINEN Absenz-Helfer `stammLib.fehlt`) — die Wache des Gefallenen: der Asset-Store lebt NUR in der
//   Schale (S2b) · kein `_foundryVariantCount` · kein Samen-Literal im Vorrat · EIN Streu-Same · keine Saison-Flip-Maschine
// KLON-LINSE (Node, die geladene Klasse): `_foundryVariantFor` gegen das Studio-Budget auf 600 × 600 Streu-Zellen — 1/V je
//       Gestalt, Nachbar-/Versatz-16-Gleichheit ≤ 1/V + 0,03 (das alte `h % 16` legte ein 54-m-Klon-Gitter)
// VERHALTEN (Chromium, echter Worker + echte IndexedDB; die Schale aus dem Stamm + ein Studio-Double):
//   V1  Konsum-Wand: aWind fällt, position/color reisen · V2 Uint16-Index ≤ 65 536 Vertices, Uint32 darüber
//   V3  Transfer: der Studio-Puffer ist nach dem Senden abgelöst (byteLength 0)
//   V4  Platte: zweite Anfrage kommt von der Platte, das Studio baut nicht noch einmal
//   V5  nurPlatte (Ship-Hook): Miss = leere Antwort, kein Bau · V6 Format-Wechsel leert die Platte
//   V7  Saison-Nagel · V8 Vorrat (Platte, leere Antwort) · V14 die Platte hält keinen Faden — die Karte reist seit S2
//       nie durch den Kanal (sie backt im Welt-Renderer, `_karteWeltBacken`)
// S7f die Stempel-Probe: ein UI-Edit am Labor lässt den Stempel stehen, ein Brücken-Edit bewegt ihn. Der Boot selbst (die
//   Schale vorn, Laden und Stempel allein aus dem Manifest, keine Labor-Datei) ist ein LAUF: gate:pack-contract `bootLauf`
//   (B3a; vorher S3 · S7a · S7e · W4 · W5)
// WELT-SONDE (Null-Renderer, echter Studio-Worker, Platte an): W1 Gestalten je Art = Budget, 0 Karten-Art-L2,
//   0 LRU-Räumungen im Boot · W2 ein Saison-Wechsel baut 0 · W3 der Zweit-Boot baut ≤ 5 MB neu · W6 DIE WERK-FÄDEN:
//   auf 16 Kernen wird jeder Werk-Faden bereit und baut, jeder Auftrag reist in seiner Bahn (`w<k>_`, `_foundryBahn`) ·
//   W7 FOUNDRY_LESEN ist genau, was `_foundryBuildMesh` liest, und im Boot reist nichts außerhalb der Wand · W8 der
//   Fahrzeug-Vorrat wärmt nur die Platte
//
//   node scripts/diag-fluss.cjs [--selftest]          (npm run gate:fluss)
"use strict";
const { statikServer, starteBrowser, ROOT: root, hauptLauf, pruefer, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

// Port über FLUSS_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4561.
const PORT = Number(process.env.FLUSS_PORT || 4561);

// STATISCH — die Wache des Gefallenen über den EINEN Absenz-Helfer (`stammLib.fehlt`, kommentar-frei; `wandel` färbt den
// Stamm im Selbsttest): der Asset-Store nur in der Schale, der Streu-Same nur in `_scatterRohSame` (die Engstellen leben —
// die Schale läuft unten im Worker, der Same in der Klon-Linse).
function statisch(wandel) {
    const F = (name, glied, re) => [name, stammLib.fehlt(glied, re, wandel), stammLib.fehlt.wo || ""];
    return [
        F("S2b der Asset-Store lebt NUR in der Schale", { ausser: "_foundrySchale" }, /anazhFoundryAssets/),
        F("S4a kein _foundryVariantCount (die Varianten-Wahl liest das Studio-Budget)", null, /_foundryVariantCount/),
        F("S4b kein Samen-/Karten-Literal im Vorrat", "_foundryPrefetchLibrary", /<=\s*16\b|seeds:\s*\[1, 2/),
        F("S4c EIN Streu-Same (die Formel lebt nur in _scatterRohSame)", { ausser: "_scatterRohSame" }, /\*\s*73856093\)\s*\^\s*\(cellZ\s*\*\s*19349663\)/),
        F(
            "S5b die Saison-Flip-Maschine ist fort (_foundrySeasonChanged · _drainSeasonFlip · SEASON_FLIP_PER_TICK · _seasonTint)",
            null,
            /_foundrySeasonChanged|_drainSeasonFlip|SEASON_FLIP_PER_TICK|_seasonTint\b|_seasonFlipQueue/
        ),
    ];
}
// Die Schale der GELADENEN Klasse, wie die Brücke sie in den Worker gibt (`AnazhRealm._foundrySchale.toString()`,
// studio-bruecke): ihr Text ist die Messung, die im echten Worker läuft — nie ein Zitat.
function schaleVon() {
    const { AnazhRealm: A } = stammLib.ladeKlasse(root);
    return A._foundrySchale.toString();
}

// DIE KLON-LINSE: die Varianten-Wahl des Stamms (`_foundryVariantFor` + `_foundryGestalten` +
// `_foundryGestaltSame`, an der geladenen Klasse) gegen das eingefrorene Studio-Budget (render-config-Golden) auf dem echten
// Streu-Gitter (`_scatterRohSame`, 600 × 600 Zellen). (a) Der rohe Same: je Art trägt jede ihrer T Gestalten (die V
// Bestand-Gestalten und der Solitär V+1 einer Baum-Art, phyto-core `solitaerGestalt`) 1/T ± 0,03, die Nachbar- sowie die
// 16-Zellen-Versatz-Gleichheit bleibt ≤ 1/T + 0,03 — das alte `h % 16` (untere Bits) legte ein Klon-Gitter. (b) Das
// Eimer-Urteil des Orts: im Bestand wählt der Same 1..V (je 1/V ± 0,03), frei steht immer der Solitär T; eine Art ohne
// Solitär behält ihren Samen.
// K42 — DIE STEMPEL-PROBE: der Platten-Stempel (die Formel der Schale, in Node nachgerechnet: pack-kanon computeStamp)
// bleibt bei einem UI-Edit am Pflanzen-Labor gleich und springt bei einem Edit an der Brücke. `lies` (DARF) färbt eine
// Quelle für den Selbsttest.
const LABOR_SHELL = "worlds/terrain/phytogenesis.js";
function stempelProbe(lies) {
    const PK = require("./lib/pack-kanon.cjs");
    const roh = (rel) => (lies && lies(rel)) || fs.readFileSync(path.join(root, rel), "utf8");
    const man = JSON.parse(roh("cores.manifest.json"));
    const br = (man.find((c) => c && typeof c.bruecke === "string") || {}).bruecke || null;
    const mit = (ziel, zusatz) => PK.computeStamp(root, (rel) => (rel === ziel ? roh(rel) + zusatz : lies && lies(rel)));
    const basis = mit(null, "");
    const labor = mit(LABOR_SHELL, "\n// UI-Edit am Labor (Stempel-Probe)\n");
    const bruecke = br ? mit(br, "\n// Edit an der Brücke (Stempel-Probe)\n") : basis;
    return [
        [
            "S7f die Stempel-Probe: ein UI-Edit am Pflanzen-Labor lässt den Platten-Stempel stehen, ein Brücken-Edit bewegt ihn",
            !!br && labor === basis && bruecke !== basis,
            `Stempel ${basis.slice(0, 12)} · Labor-Edit ${labor.slice(0, 12)} · Brücken-Edit ${bruecke.slice(0, 12)}`,
        ],
    ];
}

// Die Klon-Linse ruft die Methoden der GELADENEN Klasse (`stammLib.ladeKlasse`: Kerne wie index.html, dann der Stamm) —
// `teile` trägt im Selbsttest einen gebrochenen Stamm; der Solitär und der Kern-Wert kommen aus den echten Statiken.
function gestalten(teile) {
    const rc = JSON.parse(
        fs.readFileSync(path.join(root, "spec", "asset-contract", "v1", "golden", "render-config.json"), "utf8")
    );
    const G = rc && rc.lod && rc.lod.budget && rc.lod.budget.gestalten;
    const { AnazhRealm: A } = stammLib.ladeKlasse(root, teile ? { teile } : {});
    if (!G || typeof A.prototype._foundryVariantFor !== "function")
        return { ok: false, detail: "Budget oder Varianten-Wahl fehlt", arten: {} };
    A._studioRenderConfig = { lod: { budget: { gestalten: G } } };
    const r = Object.create(A.prototype);
    const arten = {};
    let ok = true;
    for (const zeile of Object.keys(G)) {
        // '*' trägt jede Pflanzen-/Fels-Art ohne eigene Zeile (Findling, Blume …); die Rezepte der Zweit-Kerne (Haus,
        // Fahrzeug, Tor …) zählen seit W8 ihre Gestalten im EIGENEN Gesetzbuch (zusatzBudget, gate:studio-vertrag).
        const sp = zeile === "*" ? "findling" : zeile;
        const V = G[zeile];
        const T = r._foundryGestalten(sp);
        const solo = T > V;
        const H = new Array(T + 1).fill(0);
        const HB = new Array(V + 1).fill(0);
        let n = 0,
            nb = 0,
            o16 = 0,
            raus = 0,
            eimerRaus = 0,
            freiNichtSolo = 0,
            ohneSoloAnders = 0;
        const g = (x, z) => r._foundryVariantFor(r._scatterRohSame(x, z, 0), sp);
        for (let x = -300; x < 300; x++)
            for (let z = -300; z < 300; z++) {
                const roh = r._scatterRohSame(x, z, 0);
                const gx = g(x, z);
                if (!(gx >= 1 && gx <= T)) raus++;
                else H[gx]++;
                n++;
                if (gx === g(x + 1, z)) nb++;
                if (gx === g(x + 16, z)) o16++;
                if (solo) {
                    const b = r._foundryVariantFor(
                        r._foundryGestaltSame(roh, sp, () => false),
                        sp
                    );
                    if (!(b >= 1 && b <= V)) eimerRaus++;
                    else HB[b]++;
                    if (
                        r._foundryVariantFor(
                            r._foundryGestaltSame(roh, sp, () => true),
                            sp
                        ) !== T
                    )
                        freiNichtSolo++;
                } else if (r._foundryGestaltSame(roh, sp, () => true) !== roh) ohneSoloAnders++;
            }
        const anteil = H.slice(1).map((h) => h / n);
        const bestand = HB.slice(1).map((h) => h / n);
        const artOk =
            raus === 0 &&
            eimerRaus === 0 &&
            freiNichtSolo === 0 &&
            ohneSoloAnders === 0 &&
            (T < 2 ||
                (anteil.every((a) => Math.abs(a - 1 / T) <= 0.03) &&
                    nb / n <= 1 / T + 0.03 &&
                    o16 / n <= 1 / T + 0.03)) &&
            (!solo || V < 2 || bestand.every((a) => Math.abs(a - 1 / V) <= 0.03));
        arten[zeile === "*" ? "*(findling)" : sp] = {
            V,
            T,
            nachbar: +(nb / n).toFixed(3),
            versatz16: +(o16 / n).toFixed(3),
            raus,
            eimerRaus,
            freiNichtSolo,
            ohneSoloAnders,
            ok: artOk,
        };
        if (!artOk) ok = false;
    }
    return { ok, arten };
}

// Das Studio-Double: antwortet auf build-asset wie die Brücke (frische Puffer, aWind + Uint32-Index), zählt Bauten
// und meldet, ob sein letzter Puffer nach dem Senden abgelöst ist (= übertragen statt kopiert). Es merkt sich die
// Saison, die es sah (der Saison-Nagel).
const STUDIO = `
let gebaut = 0, letzte = null;
const saisons = [];
self.onmessage = (e) => {
    const m = e.data;
    if (m.type === "build-asset") saisons.push(m.season === undefined ? "-" : m.season);
    if (m.type === "build-asset") {
        gebaut++;
        // "lang" baut 1,5 s synchron (V14)
        if (m.presetId === "lang") {
            const bis = Date.now() + 1500;
            while (Date.now() < bis) {}
        }
        const pos = new Float32Array(9);
        letzte = pos;
        const gross = new Float32Array(70000 * 3);
        self.postMessage({ type: "asset", world: "terrain", cv: 1, reqId: m.reqId, presetId: m.presetId, seed: m.seed, lod: m.lod | 0,
            meshes: [
                { kind: "bark", mat: {}, position: { array: pos, itemSize: 3 }, color: { array: new Float32Array(9), itemSize: 3 },
                  aWind: { array: new Float32Array(9), itemSize: 3 }, index: new Uint32Array([0, 1, 2]) },
                { kind: "foliage", mat: {}, position: { array: gross, itemSize: 3 }, index: new Uint32Array([0, 1, 69999]) },
            ] });
    } else if (m.type === "frage")
        self.postMessage({ type: "antwort", gebaut, saisons: saisons.slice(), abgeloest: letzte ? letzte.byteLength === 0 : null });
};`;

async function verhalten(schaleSrc) {
    const server = statikServer({
        seiten: {
            "/": "<!doctype html><meta charset=utf-8><title>fluss</title>",
            "/kern.js": "// kern",
        },
    });
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard" });
    try {
        const page = await browser.newPage();
        await server.zeige(page, undefined, "", "load");
        return await page.evaluate(
            async (schale, studio) => {
                const neu = (format, platte) => {
                    const cfg = {
                        lesen: ["position", "normal", "color", "uv"],
                        format,
                        platte,
                        manifestText: "[]",
                        stempelUrls: [location.origin + "/kern.js"],
                    };
                    const boot = "(function " + schale + ")(" + JSON.stringify(cfg) + ");" + studio;
                    const w = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
                    const warte = new Map();
                    w.onmessage = (e) => {
                        const k = e.data.reqId || e.data.type;
                        const fn = warte.get(k);
                        if (fn) {
                            warte.delete(k);
                            fn(e.data);
                        }
                    };
                    const frag = (msg, k) =>
                        new Promise((res) => {
                            warte.set(k || msg.reqId, res);
                            w.postMessage(msg);
                            setTimeout(() => res(null), 8000);
                        });
                    return { w, frag };
                };
                const aus = {};
                const A = neu(2, true);
                const a1 = await A.frag({ type: "build-asset", reqId: "a1", presetId: "x", seed: 1, lod: 0 });
                const m0 = a1 && a1.meshes[0];
                const m1 = a1 && a1.meshes[1];
                aus.wand = !!(m0 && !m0.aWind && m0.position && m0.color);
                aus.u16 = !!(m0 && m0.index instanceof Uint16Array);
                aus.u32 = !!(m1 && m1.index instanceof Uint32Array);
                const q1 = await A.frag({ type: "frage" }, "antwort");
                aus.transfer = !!(q1 && q1.abgeloest === true);
                const key = "x|1|0";
                const b1 = await A.frag({
                    type: "build-asset",
                    reqId: "b1",
                    presetId: "x",
                    seed: 1,
                    lod: 0,
                    platte: key,
                });
                await sleep(400);
                const b2 = await A.frag({
                    type: "build-asset",
                    reqId: "b2",
                    presetId: "x",
                    seed: 1,
                    lod: 0,
                    platte: key,
                });
                const q2 = await A.frag({ type: "frage" }, "antwort");
                aus.platte = !!(
                    b1 &&
                    !b1.platte &&
                    b2 &&
                    b2.platte === true &&
                    b2.meshes.length === 2 &&
                    q2 &&
                    q2.gebaut === 2
                );
                aus.platteSchlank = !!(
                    b2 &&
                    b2.meshes[0] &&
                    !b2.meshes[0].aWind &&
                    b2.meshes[0].index instanceof Uint16Array
                );
                const c1 = await A.frag({
                    type: "build-asset",
                    reqId: "c1",
                    presetId: "y",
                    seed: 1,
                    lod: 0,
                    platte: "y|1|0",
                    nurPlatte: true,
                });
                const q3 = await A.frag({ type: "frage" }, "antwort");
                aus.nurPlatte = !!(c1 && c1.meshes.length === 0 && q3 && q3.gebaut === 2);
                A.w.terminate();
                const B = neu(3, true);
                const d1 = await B.frag({
                    type: "build-asset",
                    reqId: "d1",
                    presetId: "x",
                    seed: 1,
                    lod: 0,
                    platte: key,
                });
                aus.format = !!(d1 && !d1.platte && d1.meshes.length === 2);
                B.w.terminate();
                // V7 DER SAISON-NAGEL: ein Herbst-Körper (ohne Platte) erreicht das Studio als
                // Sommer — jeder Bau ist Golden-Sommer, die Farbe trägt der Host.
                const C = neu(3, false);
                await C.frag({ type: "build-asset", reqId: "s1", presetId: "x", seed: 2, lod: 1, season: "autumn" });
                const q4 = await C.frag({ type: "frage" }, "antwort");
                aus.nagel = !!(
                    q4 &&
                    q4.saisons.length === 1 &&
                    q4.saisons.every((s) => s === "summer")
                );
                C.w.terminate();
                // V8 DER VORRAT: ein Vorrats-Auftrag baut einmal, schreibt die Platte und antwortet LEER; der nächste
                // Abruf desselben Körpers kommt von der Platte, ein zweiter Vorrat baut nicht.
                const D = neu(3, true);
                const v1 = await D.frag({
                    type: "build-asset",
                    reqId: "v1",
                    presetId: "gt",
                    seed: 7,
                    lod: 0,
                    platte: "gt|7|0",
                    vorrat: true,
                });
                await sleep(400);
                const v2 = await D.frag({
                    type: "build-asset",
                    reqId: "v2",
                    presetId: "gt",
                    seed: 7,
                    lod: 0,
                    platte: "gt|7|0",
                    vorrat: true,
                });
                const v3 = await D.frag({
                    type: "build-asset",
                    reqId: "v3",
                    presetId: "gt",
                    seed: 7,
                    lod: 0,
                    platte: "gt|7|0",
                });
                const q5 = await D.frag({ type: "frage" }, "antwort");
                aus.vorrat = !!(
                    v1 &&
                    v1.meshes.length === 0 &&
                    v2 &&
                    v2.meshes.length === 0 &&
                    v3 &&
                    v3.platte === true &&
                    v3.meshes.length === 2 &&
                    q5 &&
                    q5.gebaut === 1
                );
                D.w.terminate();
                // V8b ohne Platte wärmt der Vorrat nichts: leere Antwort, KEIN Bau.
                const E = neu(3, false);
                const v4 = await E.frag({
                    type: "build-asset",
                    reqId: "v4",
                    presetId: "gt",
                    seed: 7,
                    lod: 0,
                    platte: "gt|7|0",
                    vorrat: true,
                });
                const q6 = await E.frag({ type: "frage" }, "antwort");
                aus.vorratOhnePlatte = !!(v4 && v4.meshes.length === 0 && q6 && q6.gebaut === 0);
                E.w.terminate();
                // V14 DIE PLATTE HÄLT KEINEN FADEN: zwei Fäden auf EINER Platte (die Werk-Fäden, `_foundryHelfer`). Der
                // eine baut lang (1,5 s synchron); der andere baut währenddessen zwei Körper — der zweite liest erst
                // nach dem Platten-Put des ersten. Hielte der lange Faden seine Lese-Transaktion durch den Bau offen,
                // wartete der Put und mit ihm der zweite Körper bis nach dem langen Bau.
                const H = neu(3, true);
                const Wk = neu(3, true);
                const tH0 = performance.now();
                let tLang = null;
                const koerper = (w, id, presetId) =>
                    w.frag({ type: "build-asset", reqId: id, presetId, seed: 1, lod: 0, platte: presetId + "|1|0" });
                const lang = koerper(H, "kh1", "lang").then((k) => {
                    tLang = performance.now() - tH0;
                    return k;
                });
                await sleep(300);
                const wf1 = await koerper(Wk, "wf1", "f1");
                const wf2 = await koerper(Wk, "wf2", "f2");
                const tWerk = performance.now() - tH0;
                const kLang = await lang;
                aus.faden = !!(wf1 && wf2 && kLang && kLang.meshes.length === 2 && tLang != null && tWerk < tLang);
                aus.fadenMs = { werk: Math.round(tWerk), lang: tLang == null ? null : Math.round(tLang) };
                H.w.terminate();
                Wk.w.terminate();
                return aus;
            },
            schaleSrc.replace(/^ {4}static /, ""),
            STUDIO
        );
    } finally {
        await browser.close();
        server.close();
    }
}

// DIE WELT-SONDE (Chromium, Null-Renderer, der ECHTE Studio-Worker hinter der echten Schale): die Spiel-Welt bootet,
// streamt und kommt zur Ruhe; jeder Körper-Auftrag an den Foundry-Worker und jede Antwort wird gezählt.
// W1 GESTALTEN: jede Natur-Art bestellt nur Samen 1..V ihres Budgets, Karten-Records je Art = V.
// W2 SAISON: ein Wechsel auf Herbst baut nichts (0 Aufträge, 0 entfernte Instanzen), die Uniform uSeasonMul dreht.
const WELT_HAKEN = () => {
    window.__anazhHeadlessNullRenderer = true;
    // W6: eine Maschine mit 16 Kernen — die Werk-Fäden folgen den Kernen (`_foundryHelfer`), der CI-Läufer hat 4
    Object.defineProperty(Navigator.prototype, "hardwareConcurrency", { configurable: true, get: () => 16 });
    // Die Platte AN unter dem Null-Renderer (nur in dieser Sonde): der Boot-Blob der Transport-Schale trägt
    // cfg.platte=false (gate-deterministisch); hier wird er true — der Host schickt seine Schlüssel ohnehin immer, die
    // Schale entscheidet. So misst die Sonde den Zweit-Boot mit echter IndexedDB im echten Studio-Worker.
    const B0 = window.Blob;
    const B1 = function (teile, opt) {
        if (Array.isArray(teile) && typeof teile[0] === "string" && teile[0].indexOf("_foundrySchale") >= 0) {
            teile = [teile[0].replace('"platte":false', '"platte":true')].concat(teile.slice(1));
        }
        return new B0(teile, opt);
    };
    B1.prototype = B0.prototype;
    window.Blob = B1;
    const W0 = window.Worker;
    const fl = (window.__fl = { posts: [], antworten: [], faeden: 0, reist: new Set() });
    const bytes = (m) => {
        let b = 0;
        const seen = new Set();
        const add = (a) => {
            if (a && ArrayBuffer.isView(a) && !seen.has(a.buffer)) {
                seen.add(a.buffer);
                b += a.byteLength;
            }
        };
        if (Array.isArray(m.meshes))
            for (const x of m.meshes) {
                if (!x) continue;
                for (const k in x) if (x[k] && x[k].array) add(x[k].array);
                add(x.index);
            }
        if (m.payload) {
            add(m.payload.albedo);
            add(m.payload.normal);
        }
        return b;
    };
    window.Worker = class extends W0 {
        constructor(u, o) {
            super(u, o);
            this.__flNr = fl.faeden++;
            this.addEventListener("message", (e) => {
                const m = e.data;
                // W7: jeder Attribut-Name, der über den Kanal reist (die Wand der Schale im echten Boot)
                if (m && m.type === "asset" && Array.isArray(m.meshes))
                    for (const x of m.meshes) for (const k in x || {}) if (x[k] && x[k].array) fl.reist.add(k);
                if (m && (m.type === "asset" || m.type === "impostor"))
                    fl.antworten.push({
                        w: this.__flNr,
                        id: m.reqId,
                        t: m.type,
                        platte: m.platte === true,
                        vorrat: m.vorrat === true,
                        bytes: bytes(m),
                        p: m.presetId,
                        s: m.seed,
                        l: m.lod,
                    });
            });
        }
        postMessage(m, t) {
            if (m && m.type === "build-asset")
                fl.posts.push({ t: m.type, p: m.presetId, s: m.seed, l: m.lod, ov: !!m.ov, w: this.__flNr, id: m.reqId });
            return t ? super.postMessage(m, t) : super.postMessage(m);
        }
    };
};
const WELT_MESSEN = async () => {
    await window.__weltDa(); // der Ring wächst nach dem Erwachen des Boots (die Tiere stehen, ehe der Takt läuft)
    for (const weiter = window.__deckel("der Ring am Fluss", 6000); weiter(); ) {
        if (r && typeof r._gameLoopTick === "function") {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            if (r.state.voxelChunks && r.state.voxelChunks.size >= 25) break;
        }
        await sleep(6);
    }
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => !!(!(f && !f.ready)));
    const pump = async (n) => {
        for (let i = 0; i < n; i++) {
            r.state._frameOverBudget = false;
            try {
                r._gameLoopTick(performance.now());
                const pp = r.state.playerMesh && r.state.playerMesh.position;
                if (pp) r._tickScatterStreaming(pp);
            } catch {}
            await sleep(8);
        }
    };
    await pump(300);
    for (const weiter = window.__deckel("die Foundry-Schlange", 600); weiter(); ) {
        await pump(20);
        if (!f._vorrat && !(f.warte && f.warte.length) && f.pending.size === 0) break;
    }
    // der Ofen-Vorrat ist Boot-Arbeit (`_ofenPrefetchKreaturen`, nach dem ersten Bild): jeder Boot misst, bis er steht —
    // sonst trägt der schnellere Zweit-Boot ihn ins Fenster, und der erste legte ihn nie auf die Platte
    for (const weiter = window.__deckel("der Ofen-Vorrat", 600); !r._ofenVorratSteht && weiter(); ) await pump(20);
    await pump(60);
    const fl = window.__fl;
    const cfg = r.constructor._studioRenderConfig;
    const G = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget.gestalten : null;
    const T = {};
    for (const sp of ["eiche", "fichte", "birke", "tanne", "weide", "mammut", "strauch"])
        T[sp] = r._foundryGestalten(sp);
    const samen = {};
    for (const x of fl.posts)
        if (x.t === "build-asset" && !x.ov) (samen[x.p] = samen[x.p] || []).includes(x.s) || samen[x.p].push(x.s);
    const karten = {};
    for (const k of r._kartenAtlas ? r._kartenAtlas.zellen.keys() : [])
        if (k.startsWith("fimp:") && !k.startsWith("fimp:g:")) {
            const sp = k.slice(5).split("|")[0];
            karten[sp] = (karten[sp] || 0) + 1;
        }
    const MB = (arr) => arr.reduce((a, x) => a + x.bytes, 0) / 1048576;
    const gebaut = fl.antworten.filter((x) => !x.platte);
    const boot = {
        posts: fl.posts.length,
        antworten: fl.antworten.length,
        // tote Fracht: L2-Geometrie einer Karten-Art (Baum/Strauch) — ihre Fernstufe ist die Karte, kein Leser liest sie
        kartenArtL2: fl.posts.filter((x) => x.t === "build-asset" && x.l === 2 && r._foundryPresetIsTree(x.p)).length,
        // ein Boot räumt nie im LRU (der Deckel trägt den ganzen Boot)
        lru: f.lruEvicted ? f.lruEvicted.size : 0,
        cache: f.cache.size,
        gebautMB: MB(gebaut),
        gebautN: gebaut.length,
        platteMB: MB(fl.antworten.filter((x) => x.platte)),
        platteN: fl.antworten.filter((x) => x.platte).length,
        gebautListe: gebaut
            .filter((x) => x.bytes > 0)
            .slice(0, 12)
            .map((x) => `${x.p}|${x.s}|${x.l}`),
    };
    // W6 — DIE WERK-FÄDEN: je Bahn (das Werk k = 0, jeder Helfer k) ihre Aufträge, Antworten und jede Nummer, die eine
    // fremde Bahn nennt (die Pumpe schrieb `w<k>_` falsch) oder die `_foundryBahn` falsch liest
    const nrVon = (w) => (w && Number.isInteger(w.__flNr) ? w.__flNr : -1);
    const bahnen = [{ k: 0, nr: nrVon(f.worker), bereit: true }].concat(
        (f.helfer || []).map((h) => ({ k: h.k, nr: nrVon(h.w), bereit: h.bereit === true }))
    );
    for (const b of bahnen) {
        const ps = fl.posts.filter((x) => x.t === "build-asset" && x.w === b.nr);
        b.posts = ps.length;
        b.antworten = fl.antworten.filter((x) => x.t === "asset" && x.w === b.nr).length;
        b.fremd = ps
            .filter((x) => {
                const m = /w(\d+)_\d+$/.exec(String(x.id));
                return (m ? Number(m[1]) : 0) !== b.k || r._foundryBahn(String(x.id)) !== (b.k ? "werk" + b.k : "werk");
            })
            .map((x) => String(x.id))
            .slice(0, 4);
    }
    boot.werk = { kerne: navigator.hardwareConcurrency, bahnen };
    if (window.__flussNurBoot) return { boot, bootMB: MB(fl.antworten) };
    // W7 DIE WAND IST DER LESER: ein Mesh mit jedem Wand-Namen und den toten aWind · aCenter · aType zählt, was
    // `_foundryBuildMesh` liest — die Menge muss FOUNDRY_LESEN sein, und was im Boot reist, steht in der Wand
    const lesen = r.constructor.FOUNDRY_LESEN,
        gelesen = new Set(),
        pm = { kind: "bark" };
    for (const k of lesen.concat(["aWind", "aCenter", "aType"])) {
        const a = new Float32Array(k === "position" ? 9 : 12);
        pm[k] = { get array() { return gelesen.add(k), a; } }; // prettier-ignore
    }
    r._foundryBuildMesh(pm);
    // W8 der Fahrzeug-Vorrat wärmt nur die Platte: je kritische Art eine leere Antwort mit vorrat
    const krit = (r._foundryLibrarySpec().critical || {}).species || [];
    const vorrat = {
        arten: krit.length,
        kalt: krit.filter((sp) => !fl.antworten.some((x) => x.p === sp && x.vorrat && x.bytes === 0)),
    };
    const instanziert = () => (r.state.architectures || []).filter((e) => e && e.instFoundry && e.instanced).length;
    // W2 — der Saison-Wechsel. Erst ein KONTROLL-Fenster gleicher Länge ohne Wechsel (die ruhende Welt bestellt nichts —
    // sonst misst W2 nichts), dann der Wechsel: Aufträge an den Worker und NEUE Foundry-Cache-Schlüssel danach. Instanz-
    // Entfernungen zählen nur zur Auskunft (LOD-/Streu-Churn läuft auch ohne Saison).
    let removes = 0;
    const origRemove = r._archInstanceRemove.bind(r);
    r._archInstanceRemove = function (e) {
        removes++;
        return origRemove(e);
    };
    const nK = fl.posts.length;
    await pump(150);
    const kontrolle = { posts: fl.posts.length - nK, removes };
    removes = 0;
    const su = r._ensureSeasonUniforms();
    const mul0 = [su.uSeasonMul.value.r, su.uSeasonMul.value.g, su.uSeasonMul.value.b];
    const n0 = fl.posts.length;
    const inst0 = instanziert();
    const schluessel0 = new Set(f.cache.keys());
    r.setSeason("herbst");
    await pump(150);
    r._archInstanceRemove = origRemove;
    const mul1 = [su.uSeasonMul.value.r, su.uSeasonMul.value.g, su.uSeasonMul.value.b];
    return {
        G,
        T,
        samen,
        karten,
        wand: { lesen: [...lesen], gelesen: [...gelesen], reist: [...fl.reist] },
        vorrat,
        boot,
        bootMB: fl.antworten.reduce((a, x) => a + x.bytes, 0) / 1048576,
        saison: {
            kontrolle,
            posts: fl.posts.length - n0,
            neueSchluessel: [...f.cache.keys()].filter((k) => !schluessel0.has(k)).length,
            removes,
            inst0,
            inst1: instanziert(),
            mul0,
            mul1,
            name: r.state.season,
        },
    };
};

// Das Urteil über die Welt-Sonde (rein — der Selbsttest füttert es mit Bruch-Daten).
function urteilWelt(d) {
    const aus = [];
    const pruef = (name, ok, detail) => aus.push([name, !!ok, detail || ""]);
    pruef(
        "W0 die Sonde misst (Budget im Buch, Boot bestellt, Foundry-Bäume stehen)",
        d.G && d.boot.posts >= 50 && d.saison.inst0 >= 5,
        `Boot ${d.boot.posts} Aufträge · ${d.saison.inst0} Bäume`
    );
    const raus = [];
    const kartenFalsch = [];
    for (const sp of ["eiche", "fichte", "birke", "tanne", "weide", "mammut", "strauch"]) {
        const V = d.G && Number.isInteger(d.G[sp]) ? d.G[sp] : null;
        if (V == null) {
            raus.push(sp + " ohne Budget");
            continue;
        }
        const T = d.T && Number.isInteger(d.T[sp]) ? d.T[sp] : V; // samt Solitär V+1 (`_foundryGestalten`)
        for (const s of d.samen[sp] || []) if (!(s >= 1 && s <= V)) raus.push(`${sp}|${s}`);
        // Die Karte bestellt ihr Leser: eine Art ohne Leser im Bild hat keine Karte, keine Art mehr als ihre Gestalten
        // (Budget samt Solitär, K20).
        if ((d.karten[sp] || 0) > T) kartenFalsch.push(`${sp} ${d.karten[sp] || 0}>${T}`);
    }
    pruef("W1a jede Baum-/Strauch-Art bestellt nur ihre Gestalten 1..V", !raus.length, raus.slice(0, 6).join(" · "));
    pruef(
        "W1b Karten-Records je Art ≤ ihre Gestalten (Budget samt Solitär; die Karte bestellt ihr Leser)",
        !kartenFalsch.length,
        kartenFalsch.join(" · ")
    );
    pruef(
        "W1c keine tote Fracht: 0 L2-Körper einer Karten-Art bestellt (die Fernstufe ist die Karte)",
        d.boot.kartenArtL2 === 0,
        `${d.boot.kartenArtL2} Aufträge`
    );
    pruef(
        "W1d ein Boot räumt nie im LRU (FOUNDRY_CACHE_CAP trägt den ganzen Boot)",
        d.boot.lru === 0,
        `${d.boot.lru} Räumungen · ${d.boot.cache} Körper im Cache`
    );
    const z = d.zweit && d.zweit.boot;
    pruef(
        "W3 der Zweit-Boot kommt von der Platte: Kanal-Neubau ≤ 5 MB, die Platte trägt den Boot",
        z && z.gebautMB <= 5 && z.platteN >= 50,
        z
            ? `Erst-Boot gebaut ${d.boot.gebautMB.toFixed(1)} MB · Zweit-Boot gebaut ${z.gebautMB.toFixed(2)} MB ` +
                  `(${z.gebautN} Antworten), von der Platte ${z.platteMB.toFixed(1)} MB (${z.platteN})` +
                  (z.gebautListe.length ? ` · neu: ${z.gebautListe.join(" ")}` : "")
            : "kein Zweit-Boot gemessen"
    );
    const s = d.saison;
    pruef(
        "W2a der Saison-Wechsel baut nichts (0 Aufträge, 0 neue Körper-Schlüssel; Kontroll-Fenster ruhig)",
        s.kontrolle.posts === 0 && s.posts === 0 && s.neueSchluessel === 0,
        `Kontrolle ${s.kontrolle.posts} Aufträge · nach dem Wechsel ${s.posts} Aufträge, ${s.neueSchluessel} neue Schlüssel ` +
            `(Auskunft: entfernt ${s.kontrolle.removes}→${s.removes}, Instanzen ${s.inst0}→${s.inst1})`
    );
    const dreh = Math.abs(s.mul1[0] - s.mul0[0]) + Math.abs(s.mul1[1] - s.mul0[1]) + Math.abs(s.mul1[2] - s.mul0[2]);
    pruef(
        "W2b die Farbe dreht: uSeasonMul ändert sich (Sommer → Herbst), der Name folgt",
        dreh > 0.3 && s.name === "autumn",
        `(${s.mul0.map((v) => v.toFixed(2)).join(",")}) → (${s.mul1.map((v) => v.toFixed(2)).join(",")}) · ${s.name}`
    );
    const wk = d.boot && d.boot.werk;
    const bahnen = (wk && wk.bahnen) || [];
    pruef(
        "W6 die Werk-Fäden: auf 16 Kernen bauen mehrere Fäden, jeder wird bereit und baut, jeder Auftrag reist in seiner Bahn und kommt zurück",
        bahnen.length >= 2 &&
            bahnen.every((b) => b.bereit && b.posts > 0 && b.antworten >= b.posts && !(b.fremd && b.fremd.length)),
        `${wk ? wk.kerne : "?"} Kerne · ${bahnen.length} Fäden: ` +
            bahnen
                .map(
                    (b) =>
                        `werk${b.k || ""} ${b.bereit ? "" : "nicht bereit, "}${b.posts} Aufträge/${b.antworten} Antworten` +
                        (b.fremd && b.fremd.length ? ` fremde Nummern ${b.fremd.join(" ")}` : "")
                )
                .join(" · ") +
            (bahnen.length < 2 ? " — Täter _foundryHelfer: kein Helfer neben dem Werk" : "")
    );
    const w = d.wand || { lesen: [], gelesen: [], reist: [] };
    const fehlt = w.gelesen.filter((k) => !w.lesen.includes(k)).concat(w.lesen.filter((k) => !w.gelesen.includes(k)));
    const fremd = w.reist.filter((k) => !w.lesen.includes(k));
    pruef(
        "W7 FOUNDRY_LESEN ist genau, was `_foundryBuildMesh` liest, und im Boot reist nichts außerhalb der Wand",
        w.gelesen.length > 0 && w.reist.includes("position") && !fehlt.length && !fremd.length,
        `Wand ≠ Leser: [${fehlt.join(",")}] · reist ohne Leser: [${fremd.join(",")}]`
    );
    const vr = d.vorrat || { arten: 0, kalt: [] };
    pruef(
        "W8 der Fahrzeug-Vorrat wärmt nur die Platte (je kritische Art eine leere Antwort)",
        vr.arten > 0 && !vr.kalt.length,
        `${vr.arten} Arten` + (vr.kalt.length ? ` · ohne leere Vorrats-Antwort: ${vr.kalt.join(" ")}` : "")
    );
    return aus;
}

async function welt() {
    const server = statikServer();
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(WELT_HAKEN);
        await server.zeige(page, 60000);
        const erst = await page.evaluate(WELT_MESSEN);
        // W3 DER ZWEIT-BOOT: dieselbe Welt lädt neu (gleicher Browser = dieselbe IndexedDB, derselbe Stempel) — was jetzt
        // noch gebaut wird, hat die Platte verfehlt.
        await page.evaluateOnNewDocument(() => {
            window.__flussNurBoot = true;
        });
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        const zweit = await page.evaluate(WELT_MESSEN);
        return Object.assign({}, erst, { zweit });
    } finally {
        await browser.close();
        server.close();
    }
}

const VERHALTEN = [
    ["V1 Konsum-Wand: aWind fällt, position/color reisen", "wand"],
    ["V2a Index Uint16 bei ≤ 65 536 Vertices", "u16"],
    ["V2b Index bleibt Uint32 darüber", "u32"],
    ["V3 Transfer: der Studio-Puffer ist nach dem Senden abgelöst", "transfer"],
    ["V4 Platte: die zweite Anfrage kommt von der Platte, kein zweiter Bau", "platte"],
    ["V4b die Platte hält die verschlankte Antwort", "platteSchlank"],
    ["V5 nurPlatte: Miss = leere Antwort, kein Bau", "nurPlatte"],
    ["V6 ein neues Transport-Format leert die Platte", "format"],
    ["V7 Saison-Nagel: ein Herbst-Körper erreicht das Studio als Sommer", "nagel"],
    ["V8 Vorrat: einmal gebaut, auf die Platte, leere Antwort; der Abruf trifft die Platte", "vorrat"],
    ["V8b Vorrat ohne Platte: leere Antwort, kein Bau", "vorratOhnePlatte"],
    ["V14 die Platte hält keinen Faden: ein Werk-Faden baut zwei Körper, während ein anderer 1,5 s baut", "faden"],
];

hauptLauf(async () => {
    const { errs, check } = pruefer();
    if (process.argv.includes("--selftest")) {
        console.log("=== FLUSS-WAND — SELBST-TEST: die Wand feuert auf injizierte Brüche ===");
        // Ein Bruch, dessen Anker im Quelltext fehlt, läuft ins Leere: er bricht den Selbsttest beim Namen.
        const bruch = (quelle, alt, neu, glied = null) => {
            if (!(alt instanceof RegExp ? alt.test(quelle) : quelle.includes(alt))) {
                check(`Selbst-Test-Anker steht im Quelltext: ${String(alt).slice(0, 70)}`, false);
                return quelle;
            }
            return stammLib.ersetze(quelle, glied, alt, neu);
        };
        const t2 = statisch((t) =>
            bruch(t, /(\n {4}_foundryRequest\([^)]*\) \{)/, '$1\n        indexedDB.open("anazhFoundryAssets", 1);')
        ).find((g) => g[0].startsWith("S2b"));
        check("Selbst-Test 2: Haupt-Thread öffnet den Asset-Store → S2b rot", t2 && !t2[1]);
        // die Klon-Linse an einem gebrochenen Stamm: die Datei mit dem Anker trägt den Bruch, die Klasse lädt ihn
        const gebrochen = (alt, neu) => {
            const teile = stammLib.dateien(root).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));
            const t = teile.find((x) => x.text.includes(alt));
            if (t) t.text = t.text.replace(alt, neu);
            else check(`Selbst-Test-Anker steht im Stamm: ${alt.slice(0, 70)}`, false);
            return teile;
        };
        const t5 = gestalten(gebrochen("return 1 + Math.floor((h * V) / 4294967296);", "return (h % V) + 1;"));
        check("Selbst-Test 5: Gestalten-Wahl aus den unteren Bits (h % V) → Klon-Linse rot", !t5.ok);
        const t11e = gestalten(
            gebrochen(
                "const eimer = stehtFrei() ? T - 1 : Math.floor(lage * (T - 1));",
                "const eimer = Math.floor(lage * (T - 1));"
            )
        );
        check("Selbst-Test 11e: das Eimer-Urteil vergisst den Solitär (frei ≠ T) → Klon-Linse rot", !t11e.ok);
        const schale = schaleVon();
        const v1 = await verhalten(bruch(schale, "return roh(msg, puffer(msg.meshes));", "return roh(msg);"));
        check("Selbst-Test 3: Schale ohne Transfer → V3 rot", v1.transfer === false);
        const v2 = await verhalten(bruch(schale, "!LESEN.has(k)) delete m[k]", "false) delete m[k]"));
        check("Selbst-Test 4: Schale ohne Konsum-Wand → V1 rot", v2.wand === false);
        const ohneNagel = bruch(
            schale,
            'const weiter = Object.assign({}, m, { season: "summer" });',
            "const weiter = Object.assign({}, m);"
        );
        const v3 = await verhalten(ohneNagel);
        check("Selbst-Test 9: Schale ohne Saison-Nagel → V7 rot", ohneNagel !== schale && v3.nagel === false);
        // Das Welt-Urteil feuert auf Bruch-Daten (die Sonde selbst misst nur im Haupt-Lauf — ein Boot kostet Minuten).
        const gut = {
            G: { eiche: 2, fichte: 2, birke: 2, tanne: 2, weide: 1, mammut: 1, strauch: 1, "*": 16 },
            T: { eiche: 3, fichte: 3, birke: 3, tanne: 3, weide: 1, mammut: 1, strauch: 1 },
            samen: { eiche: [1, 2], weide: [1] },
            karten: { eiche: 3, fichte: 3, birke: 3, tanne: 3, weide: 1, mammut: 1, strauch: 1 },
            wand: { lesen: ["position", "color"], gelesen: ["color", "position"], reist: ["position", "color"] },
            vorrat: { arten: 2, kalt: [] },
            boot: {
                posts: 200,
                antworten: 200,
                kartenArtL2: 0,
                lru: 0,
                cache: 230,
                gebautMB: 70,
                gebautN: 190,
                werk: {
                    kerne: 16,
                    bahnen: [
                        { k: 0, bereit: true, posts: 60, antworten: 60, fremd: [] },
                        { k: 1, bereit: true, posts: 50, antworten: 50, fremd: [] },
                        { k: 2, bereit: true, posts: 45, antworten: 45, fremd: [] },
                    ],
                },
            },
            zweit: {
                boot: { gebautMB: 0.4, gebautN: 3, platteMB: 69, platteN: 187, gebautListe: ["wolf|0|0"] },
            },
            saison: {
                kontrolle: { posts: 0, removes: 300 },
                posts: 0,
                neueSchluessel: 0,
                removes: 300,
                inst0: 40,
                inst1: 40,
                mul0: [1, 1, 1],
                mul1: [2.2, 0.9, 0.9],
                name: "autumn",
            },
        };
        const rot = (d, w) => urteilWelt(d).find((g) => g[0].startsWith(w))[1] === false;
        const mitWerk = (bahnen) => Object.assign({}, gut, { boot: Object.assign({}, gut.boot, { werk: { kerne: 16, bahnen } }) });
        check(
            "Selbst-Test 10w: das Werk baut allein (kein Helfer, der Null-Renderer schloss sie aus) → W6 rot",
            rot(mitWerk([{ k: 0, bereit: true, posts: 200, antworten: 200, fremd: [] }]), "W6")
        );
        check(
            "Selbst-Test 10x: ein Helfer wird nie bereit und baut nichts → W6 rot",
            rot(
                mitWerk([
                    { k: 0, bereit: true, posts: 200, antworten: 200, fremd: [] },
                    { k: 1, bereit: false, posts: 0, antworten: 0, fremd: [] },
                ]),
                "W6"
            )
        );
        check(
            "Selbst-Test 10y: ein Auftrag reist mit der Nummer einer fremden Bahn (w2_ im Faden 1) → W6 rot",
            rot(
                mitWerk([
                    { k: 0, bereit: true, posts: 100, antworten: 100, fremd: [] },
                    { k: 1, bereit: true, posts: 100, antworten: 100, fremd: ["gw2_17"] },
                ]),
                "W6"
            )
        );
        check(
            "Selbst-Test 10z: ein Helfer bleibt Antworten schuldig → W6 rot",
            rot(
                mitWerk([
                    { k: 0, bereit: true, posts: 100, antworten: 100, fremd: [] },
                    { k: 1, bereit: true, posts: 100, antworten: 90, fremd: [] },
                ]),
                "W6"
            )
        );
        check(
            "Selbst-Test 10a: das Welt-Urteil ist auf gesunden Daten grün",
            urteilWelt(gut).every((g) => g[1])
        );
        check(
            "Selbst-Test 10b: Saison-Wechsel mit 131 Aufträgen / 131 neuen Schlüsseln → W2a rot",
            rot(
                Object.assign({}, gut, { saison: Object.assign({}, gut.saison, { posts: 131, neueSchluessel: 131 }) }),
                "W2a"
            )
        );
        check(
            "Selbst-Test 10e: unruhige Welt (Kontroll-Fenster bestellt) → W2a rot (die Sonde misst nicht sauber)",
            rot(
                Object.assign({}, gut, {
                    saison: Object.assign({}, gut.saison, { kontrolle: { posts: 7, removes: 0 } }),
                }),
                "W2a"
            )
        );
        check(
            "Selbst-Test 10c: Eiche bestellt 16 Samen → W1a rot",
            rot(Object.assign({}, gut, { samen: { eiche: [...Array(16).keys()].map((i) => i + 1) } }), "W1a")
        );
        check(
            "Selbst-Test 10d: 16 Eichen-Karten → W1b rot",
            rot(Object.assign({}, gut, { karten: Object.assign({}, gut.karten, { eiche: 16 }) }), "W1b")
        );
        check(
            "Selbst-Test 10d2: eine Art ohne Leser im Bild hat keine Karte (mammut 0) → W1b grün (K30)",
            !rot(Object.assign({}, gut, { karten: Object.assign({}, gut.karten, { mammut: 0 }) }), "W1b")
        );
        check(
            "Selbst-Test 10f: 56 Baum-L2-Aufträge im Boot → W1c rot",
            rot(Object.assign({}, gut, { boot: Object.assign({}, gut.boot, { kartenArtL2: 56 }) }), "W1c")
        );
        check(
            "Selbst-Test 10g: der Boot räumt 162 Körper im LRU → W1d rot",
            rot(Object.assign({}, gut, { boot: Object.assign({}, gut.boot, { lru: 162 }) }), "W1d")
        );
        check(
            "Selbst-Test 10h: der Zweit-Boot baut 470 MB neu (Saison im Schlüssel, Karten nie auf der Platte) → W3 rot",
            rot(
                Object.assign({}, gut, {
                    zweit: { boot: Object.assign({}, gut.zweit.boot, { gebautMB: 470, platteN: 17 }) },
                }),
                "W3"
            )
        );
        const shellAlsBruecke = (rel) =>
            rel === "cores.manifest.json"
                ? fs
                      .readFileSync(path.join(root, rel), "utf8")
                      .replace('"bruecke": "foundry-bruecke.js"', '"bruecke": "' + LABOR_SHELL + '"')
                : null;
        const W = (zusatz) => Object.assign({}, gut, zusatz);
        check(
            "Selbst-Test 1: ein Wand-Name ohne Leser (aWind) → W7 rot",
            rot(W({ wand: Object.assign({}, gut.wand, { lesen: ["position", "color", "aWind"] }) }), "W7")
        );
        check(
            "Selbst-Test 1b: im Boot reist ein Attribut ohne Leser (aCenter) → W7 rot",
            rot(W({ wand: Object.assign({}, gut.wand, { reist: ["position", "aCenter"] }) }), "W7")
        );
        check(
            "Selbst-Test 22: der Vorrat schickt den Fahrzeug-Körper zum Haupt-Thread → W8 rot",
            rot(W({ vorrat: { arten: 2, kalt: ["gt"] } }), "W8")
        );
        check(
            "Selbst-Test 20: das Manifest nennt die Labor-Shell als Brücke → S7f rot (ein UI-Edit leerte den Cache)",
            stempelProbe(shellAlsBruecke)[0][1] === false
        );
        const ohneVorrat = bruch(
            schale,
            "if (auftrag.vorrat) return roh(Object.assign({}, msg, { meshes: [], vorrat: true }));",
            ""
        );
        const v4 = await verhalten(ohneVorrat);
        check(
            "Selbst-Test 12: Schale schickt den Vorrats-Körper zum Haupt-Thread → V8 rot",
            ohneVorrat !== schale && v4.vorrat === false
        );
        // Der Studio-Lauf direkt aus dem Lese-Erfolg (die alte Schale): die Lese-Transaktion bleibt durch den Bau offen.
        const ohneFaden = bruch(
            schale,
            /bauten\.push\(\(\) => \{\s*(if \(typeof W\.onmessage === "function"\) W\.onmessage\(\{ data: weiter \}\);)\s*\}\);\s*los\(\);/,
            "$1"
        );
        const v8 = await verhalten(ohneFaden);
        check(
            `Selbst-Test 19: Studio-Lauf bei offener Transaktion → V14 rot (Werk ${v8.fadenMs && v8.fadenMs.werk} ms · ` +
                `lang ${v8.fadenMs && v8.fadenMs.lang} ms)`,
            ohneFaden !== schale && v8.faden === false
        );
        selbsttestEnde(errs, "die Wand feuert auf jede injizierte Bruch-Klasse.");
        process.exit(0);
    }
    console.log("=== FLUSS-WAND — statisch ===");
    for (const [n, ok, d] of statisch()) check(n, ok, d);
    const schale = schaleVon();
    for (const [n, ok, d] of stempelProbe()) check(n, ok, d);
    console.log("=== FLUSS-WAND — Klon-Linse (Gestalten aus dem Studio-Budget, 600 × 600 Streu-Zellen) ===");
    const gs = gestalten();
    for (const [sp, a] of Object.entries(gs.arten))
        check(
            `G ${sp}: V=${a.V} · Nachbar ${a.nachbar} · Versatz-16 ${a.versatz16}${a.raus ? " · außerhalb 1..V " + a.raus : ""}`,
            a.ok
        );
    if (!Object.keys(gs.arten).length) check("G die Klon-Linse misst (Budget + Methoden gefunden)", false, gs.detail);
    if (!schale) {
        console.error("\n❌ ROT — keine Schale im Stamm.");
        process.exit(1);
    }
    console.log("=== FLUSS-WAND — Verhalten (echter Worker + IndexedDB) ===");
    const v = await verhalten(schale);
    for (const [n, k] of VERHALTEN)
        check(
            n,
            v[k] === true,
            k === "faden" && v.fadenMs ? `Werk ${v.fadenMs.werk} ms · lang ${v.fadenMs.lang} ms` : ""
        );
    console.log("=== FLUSS-WAND — Welt-Sonde (Null-Renderer, echter Studio-Worker, Boot + Saison-Wechsel) ===");
    const w = await welt();
    console.log(
        `  Boot: ${w.boot.posts} Aufträge · ${w.bootMB.toFixed(1)} MB Antworten · Karten ${JSON.stringify(w.karten)}`
    );
    for (const [n, ok, d] of urteilWelt(w)) check(n, ok, d);
    wandEnde(errs, "der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.");
});
