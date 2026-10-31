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
//   V5  nurPlatte (Ship-Hook): Miss = leere Antwort, kein Bau · V6 ein Format-Wechsel baut neu · V9 ein Kern-Wechsel baut nur
//       seine Leser (Körper, Dorf-Export, Karte unter dem Gesetz-SHA ihrer Kerne, pipeline.K4 Stufe 2)
//   V7  Saison-Nagel · V8 Vorrat (Platte, leere Antwort) · V14 die Platte hält keinen Faden — die Karte backt seit S2 im
//       Welt-Renderer (`_karteWeltBacken`), durch den Kanal reisen nur ihre BC-Bytes zur Platte und zurück (V9)
// Der Boot selbst (die Schale vorn, Laden und Stempel je Kern allein aus dem Manifest, keine Labor-Datei) ist ein LAUF:
//   gate:pack-contract `bootLauf` (B3a; vorher S3 · S7a · S7e · W4 · W5, S7f fiel mit pipeline.K4 Stufe 2 an ihn)
// WELT-SONDE (Null-Renderer, echter Studio-Worker, Platte an): W1 Gestalten je Art = Budget, 0 Karten-Art-L2,
//   0 LRU-Räumungen im Boot · W2 ein Saison-Wechsel baut 0, färbt und lässt das Laub fallen · W3 der Zweit-Boot nimmt nach der Liefer-Marke des Spiels die Körper
//   ≥ 95 %, den Blatt-Atlas und den Dorf-Export ganz von der Platte · W6 DIE WERK-FÄDEN:
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
self.__aKern = { PRESETS: { ka: {} }, exportSettlement() {} };
self.__bKern = { PRESETS: { kb: {} } };
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
    } else if (m.type === "export-settlement") self.postMessage({ type: "settlement", reqId: m.reqId, plan: { n: ++gebaut } });
    else if (m.type === "frage")
        self.postMessage({ type: "antwort", gebaut, saisons: saisons.slice(), abgeloest: letzte ? letzte.byteLength === 0 : null });
};`;

async function verhalten(schaleSrc) {
    const server = statikServer({
        seiten: {
            "/": "<!doctype html><meta charset=utf-8><title>fluss</title>",
            "/kern.js": "// kern",
            "/a.js": "// a",
            "/b.js": "// b",
            "/b2.js": "// b neu",
        },
    });
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard" });
    try {
        const page = await browser.newPage();
        await server.zeige(page, undefined, "", "load");
        return await page.evaluate(
            async (schale, studio) => {
                const o = location.origin;
                const neu = (format, platte, b) => {
                    const cfg = {
                        lesen: ["position", "normal", "color", "uv"],
                        jahr: [1, 3],
                        format,
                        platte,
                        kerne: [{ id: "basis", ns: null, basis: true, urls: [o + "/kern.js"] }].concat(
                            b ? [{ id: "a", ns: "__aKern", urls: [o + "/a.js"] }, { id: "b", ns: "__bKern", urls: [o + b] }] : []
                        ),
                        wirt: [o + "/kern.js"],
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
                const bau = (w, reqId, presetId, mehr) => w.frag(Object.assign({ type: "build-asset", reqId, presetId, seed: 1, lod: 0 }, mehr)); // prettier-ignore
                const frage = (w) => w.frag({ type: "frage" }, "antwort");
                const A = neu(2, true);
                const a1 = await bau(A, "a1", "x");
                const [m0, m1] = a1 ? a1.meshes : [];
                aus.wand = !!(m0 && !m0.aWind && m0.position && m0.color);
                aus.u16 = m0?.index instanceof Uint16Array;
                aus.u32 = m1?.index instanceof Uint32Array;
                aus.transfer = (await frage(A))?.abgeloest === true;
                const key = { platte: "x|1|0" };
                const b1 = await bau(A, "b1", "x", key);
                await sleep(400);
                const b2 = await bau(A, "b2", "x", key);
                const q2 = await frage(A);
                aus.platte = !!b1 && !b1.platte && b2?.platte === true && b2.meshes.length === 2 && q2?.gebaut === 2;
                aus.platteSchlank = !!b2?.meshes[0] && !b2.meshes[0].aWind && b2.meshes[0].index instanceof Uint16Array;
                const c1 = await bau(A, "c1", "y", { platte: "y|1|0", nurPlatte: true });
                aus.nurPlatte = c1?.meshes.length === 0 && (await frage(A))?.gebaut === 2;
                A.w.terminate();
                const B = neu(3, true);
                const d1 = await bau(B, "d1", "x", key);
                aus.format = !!d1 && !d1.platte && d1.meshes.length === 2;
                B.w.terminate();
                // V7 DER SAISON-NAGEL: ein Herbst-Körper (ohne Platte) erreicht das Studio als
                // Sommer — jeder Bau ist Golden-Sommer, die Farbe trägt der Host.
                const C = neu(3, false);
                await bau(C, "s1", "x", { seed: 2, lod: 1, season: "autumn" });
                const q4 = await frage(C);
                aus.nagel = q4?.saisons.length === 1 && q4.saisons.every((s) => s === "summer");
                C.w.terminate();
                // V8 DER VORRAT: ein Vorrats-Auftrag baut einmal, schreibt die Platte und antwortet LEER; der nächste
                // Abruf desselben Körpers kommt von der Platte, ein zweiter Vorrat baut nicht.
                const gt = (vorrat) => ({ seed: 7, platte: "gt|7|0", vorrat });
                const D = neu(3, true);
                const v1 = await bau(D, "v1", "gt", gt(true));
                await sleep(400);
                const v2 = await bau(D, "v2", "gt", gt(true));
                const v3 = await bau(D, "v3", "gt", gt());
                aus.vorrat =
                    v1?.meshes.length === 0 && v2?.meshes.length === 0 && v3?.platte === true && v3.meshes.length === 2 && (await frage(D))?.gebaut === 1; // prettier-ignore
                D.w.terminate();
                // V8b ohne Platte wärmt der Vorrat nichts: leere Antwort, KEIN Bau.
                const E = neu(3, false);
                const v4 = await bau(E, "v4", "gt", gt(true));
                aus.vorratOhnePlatte = v4?.meshes.length === 0 && (await frage(E))?.gebaut === 0;
                E.w.terminate();
                // V14 DIE PLATTE HÄLT KEINEN FADEN: zwei Fäden auf EINER Platte (die Werk-Fäden, `_foundryHelfer`). Der
                // eine baut lang (1,5 s synchron); der andere baut währenddessen zwei Körper — der zweite liest erst
                // nach dem Platten-Put des ersten. Hielte der lange Faden seine Lese-Transaktion durch den Bau offen,
                // wartete der Put und mit ihm der zweite Körper bis nach dem langen Bau.
                const H = neu(3, true);
                const Wk = neu(3, true);
                const tH0 = performance.now();
                let tLang = null;
                const koerper = (w, id, presetId) => bau(w, id, presetId, { platte: presetId + "|1|0" });
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
                // V9 DER KERN-WECHSEL baut nur seine Leser (pipeline.K4 Stufe 2): Kern a trägt die Art ka und den Dorf-Export, b
                // die Art kb; ein neuer Text von b (sein SHA springt) baut kb neu — ka, ihre Karte und das Dorf kommen von der Platte
                const dorf = (w, id) => w.frag({ type: "export-settlement", reqId: id, dp: { n: 1, h: new Float32Array([1, 2]) } });
                const karte = { type: "karte", presetId: "ka", platte: "fimp|bc|ka" };
                const K1 = neu(3, true, "/b.js");
                await koerper(K1, "k1", "ka");
                await koerper(K1, "k2", "kb");
                await dorf(K1, "k3");
                K1.w.postMessage(Object.assign({}, karte, { type: "karte-ablage", karte: { bytes: new Uint8Array(8), frame: {} } }));
                await sleep(400);
                K1.w.terminate();
                const K2 = neu(3, true, "/b2.js");
                const [a, b, d, k] = [await koerper(K2, "m1", "ka"), await koerper(K2, "m2", "kb"), await dorf(K2, "m3"), await K2.frag(Object.assign({ reqId: "m4" }, karte))]; // prettier-ignore
                aus.kernWechsel = !!a?.platte && !b?.platte && b?.liefer?.kerne.join() === "b,basis" && !!d?.platte && k?.karte?.bytes.byteLength === 8; // prettier-ignore
                aus.kernWechselZeile = [a, b, d, k].map((x) => x && (x.presetId || x.type) + (x.platte ? " Platte" : " gebaut")).join(" · "); // prettier-ignore
                K2.w.terminate();
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
// W2 SAISON: ein Wechsel auf Herbst baut nichts (0 Aufträge, 0 entfernte Instanzen), die Uniform uSeasonMul dreht, und das
// Laub fällt (vegetation.K5): uLaubPraesenz sinkt, die Laub-Körper tragen den Jahres-Stoff über ihren Jahres-Ecken.
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
    window.Worker = class extends W0 {
        constructor(u, o) {
            super(u, o);
            this.__flNr = fl.faeden++;
            this.addEventListener("message", (e) => {
                const m = e.data;
                // W7: jeder Attribut-Name, der über den Kanal reist (die Wand der Schale im echten Boot)
                if (m && m.type === "asset" && Array.isArray(m.meshes))
                    for (const x of m.meshes) for (const k in x || {}) if (x[k] && x[k].array) fl.reist.add(k);
                if (m && m.type === "asset")
                    fl.antworten.push({ w: this.__flNr, vorrat: m.vorrat === true, leer: !m.meshes.length, p: m.presetId });
            });
        }
        postMessage(m, t) {
            if (m && m.type === "build-asset")
                fl.posts.push({ p: m.presetId, s: m.seed, l: m.lod, ov: !!m.ov, w: this.__flNr, id: m.reqId });
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
        if (!x.ov) (samen[x.p] = samen[x.p] || []).includes(x.s) || samen[x.p].push(x.s);
    const karten = {};
    for (const k of r._kartenAtlas ? r._kartenAtlas.zellen.keys() : [])
        if (k.startsWith("fimp:") && !k.startsWith("fimp:g:")) {
            const sp = k.slice(5).split("|")[0];
            karten[sp] = (karten[sp] || 0) + 1;
        }
    const boot = {
        posts: fl.posts.length,
        antworten: fl.antworten.length,
        // tote Fracht: L2-Geometrie einer Karten-Art (Baum/Strauch) — ihre Fernstufe ist die Karte, kein Leser liest sie
        kartenArtL2: fl.posts.filter((x) => x.l === 2 && r._foundryPresetIsTree(x.p)).length,
        // ein Boot räumt nie im LRU (der Deckel trägt den ganzen Boot)
        lru: f.lruEvicted ? f.lruEvicted.size : 0,
        cache: f.cache.size,
        je: f.lieferung.je, // die Liefer-Marke des Spiels (`_foundryLiefer`): je Art von der Platte · im Werk · im Haupt-Faden
    };
    // W6 — DIE WERK-FÄDEN: je Bahn (das Werk k = 0, jeder Helfer k) ihre Aufträge, Antworten und jede Nummer, die eine
    // fremde Bahn nennt (die Pumpe schrieb `w<k>_` falsch) oder die `_foundryBahn` falsch liest
    const nrVon = (w) => (w && Number.isInteger(w.__flNr) ? w.__flNr : -1);
    const bahnen = [{ k: 0, nr: nrVon(f.worker), bereit: true }].concat(
        (f.helfer || []).map((h) => ({ k: h.k, nr: nrVon(h.w), bereit: h.bereit === true }))
    );
    for (const b of bahnen) {
        const ps = fl.posts.filter((x) => x.w === b.nr);
        b.posts = ps.length;
        b.antworten = fl.antworten.filter((x) => x.w === b.nr).length;
        b.fremd = ps
            .filter((x) => {
                const m = /w(\d+)_\d+$/.exec(String(x.id));
                return (m ? Number(m[1]) : 0) !== b.k || r._foundryBahn(String(x.id)) !== (b.k ? "werk" + b.k : "werk");
            })
            .map((x) => String(x.id))
            .slice(0, 4);
    }
    boot.werk = { kerne: navigator.hardwareConcurrency, bahnen };
    if (window.__flussNurBoot) return { boot };
    // W7 DIE WAND IST DER LESER: ein Mesh mit jedem Wand-Namen und dem toten aWind zählt, was
    // `_foundryBuildMesh` liest — die Menge muss FOUNDRY_LESEN sein, und was im Boot reist, steht in der Wand
    const lesen = r.constructor.FOUNDRY_LESEN,
        gelesen = new Set(),
        pm = { kind: "bark" };
    for (const k of lesen.concat(["aWind"])) {
        const a = new Float32Array(k === "position" ? 9 : 12);
        pm[k] = { get array() { return gelesen.add(k), a; } }; // prettier-ignore
    }
    r._foundryBuildMesh(pm);
    // W8 der Fahrzeug-Vorrat wärmt nur die Platte: je kritische Art eine leere Antwort mit vorrat
    const krit = (r._foundryLibrarySpec().critical || {}).species || [];
    const vorrat = {
        arten: krit.length,
        kalt: krit.filter((sp) => !fl.antworten.some((x) => x.p === sp && x.vorrat && x.leer)),
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
    const pr = () => su.uLaubPraesenz?.value.x;
    const praesenz = [pr()];
    const n0 = fl.posts.length;
    const inst0 = instanziert();
    const schluessel0 = new Set(f.cache.keys());
    r.setSeason("herbst");
    await pump(150);
    r._archInstanceRemove = origRemove;
    const mul1 = [su.uSeasonMul.value.r, su.uSeasonMul.value.g, su.uSeasonMul.value.b];
    // DAS LAUB FÄLLT (vegetation.K5): die Präsenz sinkt, und die Laub-Körper der Welt zeichnen den Stoff des Jahrs über ihren
    // Jahres-Ecken (aCenter · aType, `_jahrEcken`) — die Konsum-Leser beim Namen: `_tickSeason`, `_jahrLage`, die Konsum-Wand
    praesenz.push(pr());
    let laub = 0;
    for (const g of f.cache.values()) for (const c of g?.children || []) laub += !!(c.material?.userData?.jahr && c.geometry.attributes.aCenter); // prettier-ignore
    return {
        G,
        T,
        samen,
        karten,
        wand: { lesen: [...lesen], gelesen: [...gelesen], reist: [...fl.reist] },
        vorrat,
        boot,
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
            praesenz,
            laub,
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
    // die Liefer-Marke des Zweit-Boots: je Art der Anteil von der Platte gegen alles, was im Werk oder Haupt-Faden entstand
    const je = (d.zweit && d.zweit.boot.je) || {};
    const traegt = (k, q) => !!je[k] && je[k].platte >= Math.max(1, q * (je[k].platte + je[k].werk + je[k].haupt));
    pruef(
        "W3 der Zweit-Boot kommt von der Platte: die Körper ≥ 95 %, der Blatt-Atlas und der Dorf-Export ganz (pipeline.K4)",
        traegt("koerper", 0.95) && traegt("blatt-atlas", 1) && traegt("dorf-export", 1),
        JSON.stringify(je)
    );
    const s = d.saison;
    pruef(
        "W2a der Saison-Wechsel baut nichts (0 Aufträge, 0 neue Körper-Schlüssel; Kontroll-Fenster ruhig)",
        s.kontrolle.posts === 0 && s.posts === 0 && s.neueSchluessel === 0,
        `Kontrolle ${s.kontrolle.posts} Aufträge · nach dem Wechsel ${s.posts} Aufträge, ${s.neueSchluessel} neue Schlüssel ` +
            `(Auskunft: entfernt ${s.kontrolle.removes}→${s.removes}, Instanzen ${s.inst0}→${s.inst1})`
    );
    const dreh = require("./lib/abnahme-urteil.cjs").pixelAbstand(s.mul1, s.mul0, 0);
    pruef(
        "W2b die Farbe dreht und das Laub fällt (Sommer → Herbst): uSeasonMul, uLaubPraesenz, Laub über aCenter",
        dreh > 0.3 && s.name === "autumn" && s.praesenz[1] < s.praesenz[0] && s.laub > 0,
        `${s.mul0} → ${s.mul1} · ${s.name} · Präsenz ${s.praesenz} · ${s.laub} Laub-Körper`
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
    ["V6 ein neues Transport-Format baut die Platte neu", "format"],
    ["V7 Saison-Nagel: ein Herbst-Körper erreicht das Studio als Sommer", "nagel"],
    ["V8 Vorrat: einmal gebaut, auf die Platte, leere Antwort; der Abruf trifft die Platte", "vorrat"],
    ["V8b Vorrat ohne Platte: leere Antwort, kein Bau", "vorratOhnePlatte"],
    ["V14 die Platte hält keinen Faden: ein Werk-Faden baut zwei Körper, während ein anderer 1,5 s baut", "faden"],
    ["V9 ein Kern-Wechsel baut nur seine Leser: neuer Kern b → kb neu, ka · ihre Karte · das Dorf von der Platte", "kernWechsel"],
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
            const teile = stammLib.teileVon(root);
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
                boot: { je: { koerper: { platte: 187, werk: 3, haupt: 0 }, "blatt-atlas": { platte: 1, werk: 0, haupt: 0 }, "dorf-export": { platte: 2, werk: 0, haupt: 0 } } }, // prettier-ignore
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
                praesenz: [1, 0.55],
                laub: 12,
            },
        };
        const rot = (d, w) => urteilWelt(d).find((g) => g[0].startsWith(w))[1] === false;
        const mit = (teil, zusatz) => Object.assign({}, gut, { [teil]: Object.assign({}, gut[teil], zusatz) });
        const bahn = (k, bereit, posts, antworten, fremd = []) => ({ k, bereit, posts, antworten, fremd });
        const werk = (...b) => mit("boot", { werk: { kerne: 16, bahnen: [bahn(0, true, 200, 200), ...b] } });
        const zweit = (k, J) => mit("zweit", { boot: { je: Object.assign({}, gut.zweit.boot.je, { [k]: Object.assign({ platte: 0, werk: 0, haupt: 0 }, J) }) } }); // prettier-ignore
        check("Selbst-Test 10a: das Welt-Urteil ist auf gesunden Daten grün", urteilWelt(gut).every((g) => g[1]));
        check("Selbst-Test 10d2: eine Art ohne Leser im Bild hat keine Karte (mammut 0) → W1b grün (K30)", !rot(mit("karten", { mammut: 0 }), "W1b")); // prettier-ignore
        for (const [name, d, w] of [
            ["10w: das Werk baut allein (kein Helfer, der Null-Renderer schloss sie aus)", werk(), "W6"],
            ["10x: ein Helfer wird nie bereit und baut nichts", werk(bahn(1, false, 0, 0)), "W6"],
            ["10y: ein Auftrag reist mit der Nummer einer fremden Bahn (w2_ im Faden 1)", werk(bahn(1, true, 100, 100, ["gw2_17"])), "W6"], // prettier-ignore
            ["10z: ein Helfer bleibt Antworten schuldig", werk(bahn(1, true, 100, 90)), "W6"],
            ["10b: Saison-Wechsel mit 131 Aufträgen / 131 neuen Schlüsseln", mit("saison", { posts: 131, neueSchluessel: 131 }), "W2a"], // prettier-ignore
            ["10e: unruhige Welt (Kontroll-Fenster bestellt — die Sonde misst nicht sauber)", mit("saison", { kontrolle: { posts: 7, removes: 0 } }), "W2a"], // prettier-ignore
            ["10k: das Laub steht im Herbst (die Präsenz bleibt 1)", mit("saison", { praesenz: [1, 1] }), "W2b"],
            ["10c: Eiche bestellt 16 Samen", mit("samen", { eiche: [...Array(16).keys()].map((i) => i + 1) }), "W1a"],
            ["10d: 16 Eichen-Karten", mit("karten", { eiche: 16 }), "W1b"],
            ["10f: 56 Baum-L2-Aufträge im Boot", mit("boot", { kartenArtL2: 56 }), "W1c"],
            ["10g: der Boot räumt 162 Körper im LRU", mit("boot", { lru: 162 }), "W1d"],
            ["10h: der Zweit-Boot baut 170 Körper neu (Saison im Schlüssel, Kern-SHA eines Fremden)", zweit("koerper", { platte: 17, werk: 170 }), "W3"], // prettier-ignore
            ["10i: der Zweit-Boot malt den Blatt-Atlas neu", zweit("blatt-atlas", { werk: 1 }), "W3"],
            ["1: ein Wand-Name ohne Leser (aWind)", mit("wand", { lesen: ["position", "color", "aWind"] }), "W7"],
            ["1b: im Boot reist ein Attribut ohne Leser (aWind)", mit("wand", { reist: ["position", "aWind"] }), "W7"],
            ["22: der Vorrat schickt den Fahrzeug-Körper zum Haupt-Thread", mit("vorrat", { kalt: ["gt"] }), "W8"],
        ])
            check(`Selbst-Test ${name} → ${w} rot`, rot(d, w));
        const ohneVorrat = bruch(
            schale,
            "if (auftrag.vorrat) return roh(Object.assign({}, msg, { meshes: [], vorrat: true }));",
            ""
        );
        const alleKerne = bruch(schale, "stempelVon(huelle(l.eigner))", "stempelVon(kerne.map((k) => k.id))");
        const v9 = await verhalten(alleKerne);
        check("Selbst-Test 23: die Schale stempelt jede Lieferung mit ALLEN Kernen (bis K4#2: ein Kern-Edit leerte die Platte) → V9 rot", v9.kernWechsel === false); // prettier-ignore
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
            k === "faden" && v.fadenMs ? `Werk ${v.fadenMs.werk} ms · lang ${v.fadenMs.lang} ms` : k === "kernWechsel" ? v.kernWechselZeile : ""
        );
    console.log("=== FLUSS-WAND — Welt-Sonde (Null-Renderer, echter Studio-Worker, Boot + Saison-Wechsel) ===");
    const w = await welt();
    console.log(
        `  Boot: ${w.boot.posts} Aufträge · Karten ${JSON.stringify(w.karten)}`
    );
    for (const [n, ok, d] of urteilWelt(w)) check(n, ok, d);
    wandEnde(errs, "der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.");
});
