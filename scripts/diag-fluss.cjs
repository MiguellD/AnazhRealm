#!/usr/bin/env node
// diag-fluss.cjs — DIE FLUSS-WAND: der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.
// Die Transport-Schale (`_foundrySchale`, im Worker VOR dem Studio) trägt Platte · Konsum-Wand · Index-Verengung · Transfer.
//
// STATISCH (Node, über den EINEN Absenz-Helfer `stammLib.fehlt`) — die Wache des Gefallenen: der Asset-Store lebt NUR in der
//   Schale (S2b) · kein `_foundryVariantCount` · kein Samen-Literal im Vorrat · EIN Streu-Same · keine Saison-Flip-Maschine ·
//   S9 KEIN ASYNCHRONER ABRUF IM STUDIO-FADEN: Start und Schale holen nur mit dem EINEN synchronen Abruf (`_foundryHole`),
//   kein Kern und keine Brücke des Manifests ruft fetch oder import() — eine asynchrone Antwort an den Faden steht hinter
//   den Skript-Stempeln der Seite an (GTX 1050 kalt, echter Renderer: das Buch 36,8 s nach der Navigation statt 4,8 s)
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
const { statikServer, starteBrowser, ROOT: root, hauptLauf, pruefer, selbsttestEnde, wandEnde, jsonLesen, SELBSTTEST, stammLib, nullWelt } = require("./lib/welt-boot.cjs");

// Port über FLUSS_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4561.
const PORT = Number(process.env.FLUSS_PORT || 4561);

// STATISCH — die Wache des Gefallenen über den EINEN Absenz-Helfer (`stammLib.fehlt`, kommentar-frei; `wandel` färbt den
// Stamm im Selbsttest): der Asset-Store nur in der Schale, der Streu-Same nur in `_scatterRohSame` (die Engstellen leben —
// die Schale läuft unten im Worker, der Same in der Klon-Linse).
// S9: fetch( und import( — außer dem Blob-Modul der Engine (`import(modul(…))`, ein Blob fragt den Code-Cache nicht)
const ASYNC_ABRUF = /\bfetch\s*\(|\bimport\s*\(\s*(?!modul\()/;
const FADEN_DATEIEN = [...new Set(jsonLesen("cores.manifest.json").flatMap((c) => [].concat(c.scripts || [], c.bruecke || [])))];
function statisch(wandel, wandelDatei) {
    const F = (name, glied, re) => [name, stammLib.fehlt(glied, re, wandel), stammLib.fehlt.wo || ""];
    const dateien = FADEN_DATEIEN.every((datei) => stammLib.fehlt(null, ASYNC_ABRUF, { datei, wandel: wandelDatei }));
    const dateiWo = stammLib.fehlt.wo || "";
    return [
        F("S9a der Studio-Faden holt nur synchron: kein fetch, kein import() von http in Start und Schale", ["_foundryStart", "_foundrySchale"], ASYNC_ABRUF),
        [`S9b kein Kern und keine Brücke des Manifests ruft asynchron ab (${FADEN_DATEIEN.length} Dateien)`, FADEN_DATEIEN.length > 0 && dateien, dateiWo],
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
// Der EINE Abruf des Fadens, wie der Boot-Blob ihn der Schale gibt (`cfg.hole`, `AnazhRealm._foundryHole`)
function holeVon() {
    const { AnazhRealm: A } = stammLib.ladeKlasse(root);
    return A._foundryHole.toString();
}

// Der Deckel der Platte, wie der Boot ihn der Schale gibt (`cfg.deckel`, `AnazhRealm.FOUNDRY_PLATTE_DECKEL`)
function deckelVon() {
    const { AnazhRealm: A } = stammLib.ladeKlasse(root);
    return A.FOUNDRY_PLATTE_DECKEL;
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
    const rc = jsonLesen("spec/asset-contract/v1/golden/render-config.json");
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
            async (schale, studio, hole, deckel) => {
                const o = location.origin;
                const neu = (format, platte, b) => {
                    const cfg = {
                        lesen: ["position", "normal", "color", "uv"],
                        ecken: [1, 3],
                        format,
                        platte,
                        deckel,
                        kerne: [{ id: "basis", ns: null, basis: true, urls: [o + "/kern.js"] }].concat(
                            b ? [{ id: "a", ns: "__aKern", urls: [o + "/a.js"] }, { id: "b", ns: "__bKern", urls: [o + b] }] : []
                        ),
                        wirt: [o + "/kern.js"],
                    };
                    // DIE QUELLE DES WIRTS (w28-faden-quelle): der Abruf des Fadens liest jede Datei aus den Blobs, die der Wirt
                    // reicht (`self.__anazhQuelle`) — das Doppel des Wirts holt sie hier einmal und legt sie vor die Schale; eine
                    // Datei, die nicht antwortet, trägt die Quelle nicht (wie `_quelleFaden`)
                    const texte = {};
                    for (const u of new Set([...cfg.kerne.flatMap((k) => k.urls), ...cfg.wirt])) {
                        const x = new XMLHttpRequest();
                        x.open("GET", u, false);
                        x.send();
                        if (x.status === 200) texte[u] = x.responseText;
                    }
                    const quelle = "globalThis.__anazhQuelle = new Map(Object.entries(" + JSON.stringify(texte) + ").map(([u, t]) => [u, new Blob([t])]));";
                    const boot = quelle + "(function " + schale + ")(Object.assign(" + JSON.stringify(cfg) + ", { hole: function " + hole + " }));" + studio;
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
                    return { w, frag, warte };
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
                // V15 DIE PLATTE FÄLLT LAUT (w28-weltbild-kalt): eine Quelle, die der Faden nicht holt (der Kern b unter /fehlt.js,
                // 404), meldet die Schale EINMAL beim Namen (`platte-fiel`), und der Faden baut weiter im Studio — nie still
                // ohne Platte (mit einem Gesetzbuch des Spielers fiel so die Platte jedes Boots, ohne dass ein Lauf es sagte).
                const L = neu(5, true, "/fehlt.js");
                const laut = await new Promise((res) => {
                    L.warte.set("platte-fiel", res);
                    setTimeout(() => res(null), 4000);
                });
                const l1 = await bau(L, "l1", "x", { platte: "x|1|0" });
                aus.platteLaut = !!laut && String(laut.grund).includes("fehlt.js") && !!l1 && !l1.platte && l1.meshes.length === 2;
                aus.platteLautZeile = laut ? String(laut.grund).slice(0, 90) : "keine Meldung";
                L.w.terminate();
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
                return aus;
            },
            schaleSrc.replace(/^ {4}static /, ""),
            STUDIO,
            holeVon(),
            deckelVon()
        );
    } finally {
        await browser.close();
        server.close();
    }
}

// DIE PLATTE FEIN (w28-platte-fein; echter Worker + echte IndexedDB, die Schale aus dem Stamm + ein Studio-Double mit vier
// Kernen): eine gebackene Sache hängt an den Kernen, die ihr Bau LAS — nie an einem, den ein Quelltext nur nennt —, und
// zwei Fassungen eines Kerns liegen nebeneinander, bis der Deckel nach Alter und Gewicht urteilt. DIE GEFAHR BEIM NAMEN:
// ein ALTES Ding unter neuem Gesetz, still. Das Doppel trägt sie: der Bau von `kl` (Art des Kerns a) liest das Gesetz von
// b beim Namen (`self.__bKern.wert`, wie foundry-core die Hüllen-Maschine des Körper-Kerns für die Tier-Haut) und schreibt
// es in seine Bytes; die Datei der Basis NENNT `__bKern` und `__cKern`, ohne dass ein Bau von `ka` sie je liest (wie
// foundry-core `__koerperCore` nennt, und jede Eiche hing daran). Die Kern-Liste hält das Doppel einmal, wie die Brücke
// (`__zweitKerne`): Aufzählen ist kein Lesen. Vier Fahrten im Buch-Faden — Fassung b, Landung b2, zurück b, wieder b2:
//   V9  die Lese-Spur: jede Lieferung nennt die Kerne, die ihr Bau las (Basis · Eigner · gelesen)
//   V16 eine Landung in b baut nur ihre Leser neu (kl, kb) — ka, das Dorf und die Karte von ka kommen von der Platte
//   V17 KEIN ALTES DING UNTER NEUEM GESETZ (der Byte-Richter): kl trägt nach der Landung den Wert von b2, seine Karte fehlt
//   V18 zwei Fassungen nebeneinander: zurück auf b und wieder auf b2 kommt alles von der Platte, je Fassung ihre Bytes
//   V19 der Deckel: das fremde Format fällt, eine Fassung erst nach `tage` ohne Boot, der sie treffen konnte, über dem
//       Gewicht die älteste zuerst — nie, was heute trifft
// `varianten`: { Name: Schalen-Text } — der Stand und im Selbsttest seine Mutanten, alle in EINEM Browser.
const STUDIO_FEIN = `
let gebaut = 0;
self.__aKern = { PRESETS: { ka: {}, kl: {} }, exportSettlement() {} };
self.__bKern = { PRESETS: { kb: {} }, wert: __B_WERT__ };
self.__cKern = { PRESETS: { kc: {} } };
const LISTE = [self.__aKern, self.__bKern, self.__cKern];
self.onmessage = (e) => {
    const m = e.data;
    if (m.type === "build-asset") {
        gebaut++;
        const wert = m.presetId === "kl" ? self.__bKern.wert : m.presetId === "kb" ? LISTE[1].wert : 1;
        self.postMessage({ type: "asset", world: "terrain", cv: 1, reqId: m.reqId, presetId: m.presetId, seed: m.seed, lod: m.lod | 0,
            meshes: [{ kind: "bark", mat: {}, position: { array: new Float32Array([wert, 0, 0, 0, 1, 0, 0, 0, 1]), itemSize: 3 }, index: new Uint32Array([0, 1, 2]) }] });
    } else if (m.type === "export-settlement") self.postMessage({ type: "settlement", reqId: m.reqId, plan: { n: ++gebaut } });
};`;
const FEIN_SEITEN = {
    "/": "<!doctype html><meta charset=utf-8><title>platte fein</title>",
    "/kern.js": "// die Basis — sie NENNT __bKern und __cKern (kein Bau von ka liest sie)",
    "/a.js": "// a",
    "/b.js": "// b",
    "/b2.js": "// b neu",
    "/c.js": "// c",
};
async function FEIN_LAUF(schale, studio, hole, deckel) {
    const o = location.origin;
    const aus = {};
    const lese = (q) => new Promise((ok) => ((q.onsuccess = () => ok(q.result)), (q.onerror = q.onblocked = () => ok(null))));
    await lese(indexedDB.deleteDatabase("anazhFoundryAssets"));
    const texte = {};
    for (const p of ["/kern.js", "/a.js", "/b.js", "/b2.js", "/c.js"]) {
        const x = new XMLHttpRequest();
        x.open("GET", o + p, false);
        x.send();
        texte[o + p] = x.responseText;
    }
    const quelle = "globalThis.__anazhQuelle = new Map(Object.entries(" + JSON.stringify(texte) + ").map(([u, t]) => [u, new Blob([t])]));";
    // `fassung`: "b" | "b2" (die Datei des Kerns b und der Wert seines Gesetzes, 11 | 22) · `uhr`: Tage, um die die Uhr des
    // Fadens vorgeht · `mb`: der Gewichts-Deckel dieses Fadens · jeder Faden heißt „buch" (je Seite einer: er hält den Deckel)
    const neu = (fassung, { uhr = 0, mb = deckel && deckel.mb } = {}) => {
        const cfg = {
            lesen: ["position", "normal", "color", "uv"],
            ecken: [1, 3],
            format: 7,
            platte: true,
            deckel: deckel && { mb, tage: deckel.tage },
            kerne: [
                { id: "basis", ns: null, basis: true, urls: [o + "/kern.js"] },
                { id: "a", ns: "__aKern", urls: [o + "/a.js"] },
                { id: "b", ns: "__bKern", urls: [o + "/" + fassung + ".js"] },
                { id: "c", ns: "__cKern", urls: [o + "/c.js"] },
            ],
            wirt: [o + "/kern.js"],
        };
        const vor = uhr ? "{ const jetzt = Date.now; Date.now = () => jetzt() + " + uhr * 864e5 + "; }" : "";
        const boot = vor + quelle + "(function " + schale + ")(Object.assign(" + JSON.stringify(cfg) + ", { hole: function " + hole + " }));" + studio.replace("__B_WERT__", fassung === "b" ? 11 : 22); // prettier-ignore
        const w = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })), { name: "buch" });
        const warte = new Map();
        w.onmessage = (e) => {
            const fn = warte.get(e.data.reqId);
            if (fn) (warte.delete(e.data.reqId), fn(e.data));
        };
        const frag = (msg) => new Promise((res) => (warte.set(msg.reqId, res), w.postMessage(msg), setTimeout(() => res(null), 8000)));
        return { w, frag };
    };
    // die Platte von der Seite aus gelesen (dieselbe Datenbank): ihre Schlüssel, und das Warten auf einen Stand (≤ 4 s)
    const auf = indexedDB.open("anazhFoundryAssets", 1);
    auf.onupgradeneeded = () => auf.result.createObjectStore("assets");
    const db = await lese(auf);
    const st = (art) => db.transaction("assets", art).objectStore("assets");
    const schluessel = () => lese(st("readonly").getAllKeys()).then((k) => (k || []).map(String));
    const bis = async (steht) => {
        for (let i = 0; i < 40; i++) {
            const k = await schluessel().catch(() => []);
            if (steht(k)) return k;
            await sleep(100);
        }
        return schluessel();
    };
    const karteRest = (p) => "fimp|bc|" + p + "|1";
    // EINE FAHRT: ka · kl · kb · das Dorf · die Karten von ka und kl; wo die Platte eine Karte nicht trug, backt der Wirt sie
    // aus dem Körper, den er eben bekam, und legt sie ab (`koerper`: der Rest dieses Körpers) — die Fahrt endet, wenn sie liegt
    const fahrt = async (fassung, nr, opt) => {
        const W = neu(fassung, opt);
        const koerper = (p) => W.frag({ type: "build-asset", reqId: p + nr, presetId: p, seed: 1, lod: 0, platte: p + "|1|0" });
        const karte = (p) => W.frag({ type: "karte", reqId: "c" + p + nr, presetId: p, platte: karteRest(p), jahr: 0 });
        const r = { ka: await koerper("ka"), kl: await koerper("kl"), kb: await koerper("kb") };
        r.dorf = await W.frag({ type: "export-settlement", reqId: "d" + nr, dp: { n: 1 } });
        [r.cKa, r.cKl] = [await karte("ka"), await karte("kl")];
        const vorher = await schluessel();
        for (const [c, p] of [[r.cKa, "ka"], [r.cKl, "kl"]]) // prettier-ignore
            if (c && !c.karte) {
                W.w.postMessage({ type: "karte-ablage", presetId: p, platte: karteRest(p), koerper: p + "|1|0", karte: { bytes: new Uint8Array(8), frame: {}, jahr: 0 } }); // prettier-ignore
                await bis((k) => k.filter((x) => x.includes(karteRest(p))).length > vorher.filter((x) => x.includes(karteRest(p))).length);
            }
        W.w.terminate();
        return r;
    };
    const K = (r) => (r && r.liefer ? r.liefer.kerne.join() : "?");
    const weg = (r) => (!r ? "keine Antwort" : r.platte ? "Platte" : r.bau ? "gebaut" : r.type === "karte" ? "fehlt" : "leer");
    const wert = (r) => (r && r.meshes && r.meshes[0] ? r.meshes[0].position.array[0] : null);
    const zeile = (g) => `ka ${weg(g.ka)} · kl ${weg(g.kl)} (Wert ${wert(g.kl)}) · kb ${weg(g.kb)} · Dorf ${weg(g.dorf)} · Karte ka ${weg(g.cKa)} · Karte kl ${weg(g.cKl)}`; // prettier-ignore
    const [g1, g2] = [await fahrt("b", 1), await fahrt("b2", 2)];
    aus.spur = K(g1.ka) === "a,basis" && K(g1.kl) === "a,b,basis" && K(g1.kb) === "b,basis" && K(g1.dorf) === "a,basis";
    aus.spurZeile = `ka [${K(g1.ka)}] · kl [${K(g1.kl)}] · kb [${K(g1.kb)}] · Dorf [${K(g1.dorf)}] — Soll ka [a,basis] · kl [a,b,basis] · kb [b,basis] · Dorf [a,basis]`; // prettier-ignore
    aus.fein = !!(g2.ka?.platte && g2.dorf?.platte && g2.cKa?.karte && g2.kl?.bau && g2.kb?.bau);
    aus.feinZeile = "nach der Landung in b: " + zeile(g2);
    aus.frisch = wert(g1.kl) === 11 && wert(g2.kl) === 22 && !!g2.cKl && !g2.cKl.karte;
    aus.frischZeile =
        wert(g2.kl) === 22 && g2.cKl && !g2.cKl.karte
            ? `kl trägt den Wert des neuen Gesetzes (${wert(g2.kl)}), seine Karte fehlt`
            : `ALT UNTER NEUEM GESETZ: kl ${weg(g2.kl)} mit Wert ${wert(g2.kl)} (das Gesetz von b sagt 22), Karte kl ${weg(g2.cKl)} — Schlüssel [${K(g2.kl)}]`;
    const [g3, g4] = [await fahrt("b", 3), await fahrt("b2", 4)];
    const ganz = (g) => !!(g.ka?.platte && g.kl?.platte && g.kb?.platte && g.dorf?.platte && g.cKa?.karte && g.cKl?.karte);
    aus.generationen = ganz(g3) && ganz(g4) && wert(g3.kl) === 11 && wert(g4.kl) === 22;
    aus.generationenZeile = `zurück auf b: ${zeile(g3)} ‖ wieder b2: ${zeile(g4)}`;
    // V19 DER DECKEL. Die Paare der zwei Fassungen von b im Schlüssel (`b:<sha16>`), das fremde Format und sein Stempel
    if (!deckel) return Object.assign(aus, { deckel: false, deckelZeile: "der Stamm trägt keinen Deckel der Platte (FOUNDRY_PLATTE_DECKEL)" });
    const sha = async (t) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t))), (x) => x.toString(16).padStart(2, "0")).join("").slice(0, 16); // prettier-ignore
    const [B1, B2] = ["b:" + (await sha(texte[o + "/b.js"])), "b:" + (await sha(texte[o + "/b2.js"]))];
    const hat = (k, s) => k.some((x) => x.includes(s));
    const fremdes = (k) => k.some((x) => x.startsWith("f5|") || x === "__stamp");
    await lese(st("readwrite").put({ meshes: [] }, "f5|basis:0000~alt|1|0"));
    await lese(st("readwrite").put("f5|basis:0000", "__stamp"));
    // (a) heute, b2 gilt: das fremde Format fällt, beide Fassungen bleiben
    let W = neu("b2");
    let k = await bis((x) => !fremdes(x));
    const a = !fremdes(k) && hat(k, B1) && hat(k, B2);
    W.w.terminate();
    // (b) `tage` + 10 später, b2 gilt: die Fassung b, die so lange kein Boot treffen konnte, fällt — b2 und ka bleiben
    W = neu("b2", { uhr: deckel.tage + 10 });
    k = await bis((x) => !hat(x, B1));
    const b = !hat(k, B1) && hat(k, B2) && hat(k, "~ka|1|0~");
    W.w.terminate();
    // (c) die Fassung b kehrt zurück (kl und kb bauen neu), zwei Tage später gilt b2 unter einem Deckel, der gerade trägt, was
    // heute trifft: die ältere Fassung fällt, nie die geltende
    const g5 = await fahrt("b", 5, { uhr: deckel.tage + 11 });
    k = await schluessel();
    const waage = k.filter((x) => /^g\d+~/.test(x));
    const gewichte = await lese(st("readonly").getAll(IDBKeyRange.bound("g", "g￿")));
    const heute = waage.reduce((s, x, i) => s + (x.includes(B1) ? 0 : Number(gewichte[i]) || 0), 0);
    W = neu("b2", { uhr: deckel.tage + 13, mb: (heute + 0.5) / 1048576 });
    const k2 = await bis((x) => !hat(x, B1));
    const c = hat(k, B1) && g5.kl?.bau === true && heute > 0 && !hat(k2, B1) && hat(k2, B2) && hat(k2, "~ka|1|0~");
    W.w.terminate();
    aus.deckel = a && b && c;
    aus.deckelZeile = `fremdes Format ${a ? "fällt, beide Fassungen bleiben" : "BLEIBT oder eine Fassung fiel"} · nach ${deckel.tage + 10} Tagen ${b ? "fällt die Fassung, die keiner traf" : "KEIN Urteil nach Alter"} · über dem Gewicht (${heute} B tragen, was heute trifft) ${c ? "fällt die ältere Fassung zuerst" : "KEIN Urteil nach Gewicht"}`; // prettier-ignore
    db.close();
    return aus;
}
async function platteFein(varianten) {
    const server = statikServer({ seiten: FEIN_SEITEN });
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard" });
    try {
        const page = await browser.newPage();
        await server.zeige(page, undefined, "", "load");
        const aus = {};
        for (const [name, src] of Object.entries(varianten))
            aus[name] = await page.evaluate(FEIN_LAUF, src.replace(/^ {4}static /, ""), STUDIO_FEIN, holeVon(), deckelVon() || null);
        return aus;
    } finally {
        await browser.close();
        server.close();
    }
}
const FEIN = [
    ["V9 die Lese-Spur: jede Lieferung hängt an den Kernen, die ihr Bau las (Basis · Eigner · beim Namen gelesen), nie an einem genannten", "spur"],
    ["V16 eine Landung baut nur ihre Leser neu: neuer Kern b → kl (las b) und kb neu, ka · das Dorf · die Karte von ka von der Platte", "fein"],
    ["V17 kein altes Ding unter neuem Gesetz: der Körper, der b las, kommt nach der Landung frisch, seine Karte backt neu", "frisch"],
    ["V18 zwei Fassungen nebeneinander: zurück auf b und wieder auf b2 kommt alles von der Platte, je Fassung ihre Bytes", "generationen"],
    ["V19 der Deckel der Platte urteilt nach Alter und Gewicht: das fremde Format fällt, eine Fassung erst über dem Deckel, nie was heute trifft", "deckel"],
];

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
    // W9 DER ZEUGE DER LESE-SPUR (w28-platte-fein): läuft im Studio-Faden VOR Start und Schale, unabhängig von beiden. Sobald
    // die Kerne des Servers stehen (der erste importScripts-Ruf des Starts, vor der Brücke), liegt jeder Namensraum hinter
    // einem Proxy, der je Studio-Lauf zählt, welchen Kern JEMAND las — die Brücke über ihre Liste, ein Kern den anderen beim
    // Namen. Kein Lesen ist die Frage nach der Zugehörigkeit (trägt der Kern die Art `PRESETS[id]`, den Dorf-Export?): ihre
    // Antwort steht als Eigner im Schlüssel. Jede Antwort eines Studio-Laufs (`bau`) trägt, was der Zeuge sah (`zeuge`).
    const zeuge = function () {
        const gelesen = new Set();
        let laeuft = false;
        const merk = (id) => laeuft && gelesen.add(id);
        const roh = self.postMessage.bind(self);
        self.postMessage = function (m, a, b) {
            if (m && typeof m === "object" && m.bau === true) m.zeuge = [...gelesen].sort();
            return b === undefined ? (a === undefined ? roh(m) : roh(m, a)) : roh(m, a, b);
        };
        // die Schale ruft das Studio über `self.onmessage` — der Lauf dazwischen ist der Bau
        let studio = null;
        let p = self;
        while (p && !Object.getOwnPropertyDescriptor(p, "onmessage")) p = Object.getPrototypeOf(p);
        const eigen = Object.getOwnPropertyDescriptor(p, "onmessage");
        const lauf = function (ev) {
            gelesen.clear();
            laeuft = true;
            try {
                return studio.call(self, ev);
            } finally {
                laeuft = false;
            }
        };
        Object.defineProperty(self, "onmessage", { configurable: true, get: () => (studio ? lauf : null), set: (h) => ((studio = h), eigen.set.call(self, h)) }); // prettier-ignore
        const laden = self.importScripts.bind(self);
        let rufe = 0;
        self.importScripts = function (...u) {
            const aus = laden(...u);
            if (rufe++ === 0)
                for (const c of self.__anazhCores || []) {
                    const kern = c.ns && self[c.ns];
                    if (!kern || typeof kern !== "object") continue;
                    const id = c.id || c.ns;
                    const fest = (t, k) => ((k = Object.getOwnPropertyDescriptor(t, k)), !!k && !k.configurable && !k.writable);
                    const arten =
                        kern.PRESETS && !fest(kern, "PRESETS")
                            ? new Proxy(kern.PRESETS, {
                                  get: (t, k, r) => (k in t && merk(id), Reflect.get(t, k, r)),
                                  has: (t, k) => (k in t && merk(id), k in t),
                                  getOwnPropertyDescriptor: (t, k) => (Object.prototype.hasOwnProperty.call(t, k) && merk(id), Reflect.getOwnPropertyDescriptor(t, k)), // prettier-ignore
                                  ownKeys: (t) => (merk(id), Reflect.ownKeys(t)),
                              })
                            : null;
                    self[c.ns] = new Proxy(kern, {
                        get(t, k) {
                            if (k === "PRESETS" && (arten || !t.PRESETS)) return arten || t.PRESETS;
                            if (k === "exportSettlement" && typeof t[k] !== "function") return t[k];
                            merk(id);
                            return Reflect.get(t, k, t);
                        },
                    });
                }
            return aus;
        };
    };
    const B0 = window.Blob;
    const B1 = function (teile, opt) {
        if (Array.isArray(teile) && typeof teile[0] === "string" && teile[0].includes("_foundrySchale")) teile = ["(" + zeuge + ")();" + teile[0].replace('"platte":false', '"platte":true')].concat(teile.slice(1));
        return new B0(teile, opt);
    };
    B1.prototype = B0.prototype;
    window.Blob = B1;
    const W0 = window.Worker;
    const fl = (window.__fl = { posts: [], antworten: [], faeden: 0, reist: new Set(), spur: [] });
    window.Worker = class extends W0 {
        constructor(u, o) {
            super(u, o);
            this.__flNr = fl.faeden++;
            this.addEventListener("message", (e) => {
                const m = e.data;
                // W7: jeder Attribut-Name, der über den Kanal reist (die Wand der Schale im echten Boot)
                if (m?.type === "asset" && Array.isArray(m.meshes))
                    for (const x of m.meshes) for (const k in x || {}) if (x[k]?.array) fl.reist.add(k);
                if (m?.type === "asset")
                    fl.antworten.push({ w: this.__flNr, vorrat: m.vorrat === true, leer: !m.meshes.length, p: m.presetId });
                // W9: jeder Studio-Lauf mit seiner Liefer-Marke (die Kerne im Schlüssel) und dem, was der Zeuge sah
                if (m?.bau === true && m.liefer) fl.spur.push({ rest: m.liefer.rest, kerne: m.liefer.kerne, zeuge: m.zeuge || null });
            });
        }
        postMessage(m, t) {
            if (m?.type === "build-asset")
                fl.posts.push({ p: m.presetId, s: m.seed, l: m.lod, ov: !!m.ov, w: this.__flNr, id: m.reqId });
            return t ? super.postMessage(m, t) : super.postMessage(m);
        }
    };
};
const WELT_MESSEN = async () => {
    await __weltDa(); // der Ring wächst nach dem Erwachen des Boots (die Tiere stehen, ehe der Takt läuft)
    for (const weiter = __deckel("der Ring am Fluss", 6000); weiter(); ) {
        if (r && typeof r._gameLoopTick === "function") {
            __handTakt();
            if (st.voxelChunks && st.voxelChunks.size >= 25) break;
        }
        await sleep(6);
    }
    const f = r._ensureAssetFoundry();
    await __weltDa(() => !(f && !f.ready));
    const pump = (n) => __streuTakte(n, 8);
    await pump(300);
    for (const weiter = __deckel("die Foundry-Schlange", 600); weiter(); ) {
        await pump(20);
        if (!f._vorrat && !f.warte?.length && f.pending.size === 0) break;
    }
    // der Ofen-Vorrat ist Boot-Arbeit (`_ofenPrefetchKreaturen`, nach dem ersten Bild): jeder Boot misst, bis er steht —
    // sonst trägt der schnellere Zweit-Boot ihn ins Fenster, und der erste legte ihn nie auf die Platte
    for (const weiter = __deckel("der Ofen-Vorrat", 600); !r._ofenVorratSteht && weiter(); ) await pump(20);
    await pump(60);
    const fl = window.__fl;
    const cfg = AnazhRealm._studioRenderConfig;
    const G = cfg?.lod?.budget ? cfg.lod.budget.gestalten : null;
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
        spur: fl.spur, // W9: je Studio-Lauf die Kerne im Schlüssel gegen den Zeugen
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
    const lesen = AnazhRealm.FOUNDRY_LESEN,
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
    const instanziert = () => (st.architectures || []).filter((e) => e?.instFoundry && e.instanced).length;
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
            name: st.season,
            praesenz,
            laub,
        },
    };
};

// die Kerne ohne Namensraum (die Basis: die Brücke und ihr Kern) — kein Zeuge sieht sie, jede Lieferung liest sie
const BASIS = jsonLesen("cores.manifest.json").filter((c) => !c.ns).map((c) => c.id);
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
        // DIE EINE Gestalten-Zahl der Welt samt Solitär V+1 (`_foundryGestalten`): seit w12-eiche-same ist der Solitär ein
        // Same des Kerns (treeParams) und reist ungeprägt — bis dahin verbarg ihn sein FREISTAND-ov vor W1a, das gegen V maß
        const T = d.T?.[sp] || V;
        for (const s of d.samen[sp] || []) if (!(s >= 1 && s <= T)) raus.push(`${sp}|${s}`);
        // Die Karte bestellt ihr Leser: eine Art ohne Leser im Bild hat keine Karte, keine Art mehr als ihre Gestalten
        // (Budget samt Solitär, K20).
        if ((d.karten[sp] || 0) > T) kartenFalsch.push(`${sp} ${d.karten[sp] || 0}>${T}`);
    }
    pruef("W1a jede Baum-/Strauch-Art bestellt nur ihre Gestalten 1..T", !raus.length, raus.slice(0, 6).join(" · "));
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
    // W9 DIE LESE-SPUR AN DEN ECHTEN KERNEN (w28-platte-fein): je Studio-Lauf des kalten Boots die Kerne im Schlüssel (die
    // Liefer-Marke der Schale) gegen den Zeugen. Ein Kern, den der Zeuge lesen sah und der Schlüssel nicht trägt, ist die
    // GEFAHR beim Namen — nach seiner Landung käme das Ding ALT von der Platte; ein Kern im Schlüssel, den kein Bau las,
    // baut das Ding bei jeder Landung umsonst neu (bis hier: jede Eiche hing am Körper- und am Gelände-Kern, weil
    // foundry-core sie beim Namen nennt). Ohne Messung ROT (Lehre 6).
    const laeufe = ((d.boot && d.boot.spur) || []).filter((e) => Array.isArray(e.zeuge));
    const [stumm, grob] = [[], []];
    for (const e of laeufe) {
        const fehlt = e.zeuge.filter((k) => !e.kerne.includes(k));
        const zuviel = e.kerne.filter((k) => !BASIS.includes(k) && !e.zeuge.includes(k));
        if (fehlt.length) stumm.push(`${e.rest} las ${fehlt.join(",")}`);
        if (zuviel.length) grob.push(`${e.rest} trägt ${zuviel.join(",")}`);
    }
    pruef(
        "W9 die Lese-Spur an den echten Kernen: jeder Studio-Lauf trägt im Schlüssel genau die Kerne, die der Zeuge lesen sah",
        laeufe.length >= 50 && !stumm.length && !grob.length,
        `${laeufe.length} Läufe gemessen — je Spur: ${Object.entries(laeufe.reduce((n, e) => ((n[e.kerne.join(",")] = (n[e.kerne.join(",")] || 0) + 1), n), {})).map(([k, n]) => `${n}× [${k}]`).join(" · ")}` +
            (stumm.length ? ` · DIE SPUR VERSCHWEIGT (nach der Landung käme es alt): ${stumm.length} — ${stumm.slice(0, 4).join(" · ")}` : "") +
            (grob.length ? ` · im Schlüssel, nie gelesen: ${grob.length} — ${grob.slice(0, 4).join(" · ")}` : "")
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
        "W2b die Farbe dreht und das Laub fällt (Sommer → Herbst): uSeasonMul, uLaubPraesenz, Laub über aCenter",
        dreh > 0.3 && s.name === "autumn" && s.praesenz[1] < s.praesenz[0] && s.laub > 0,
        `${s.mul0} → ${s.mul1} · ${s.name} · Präsenz ${s.praesenz} · ${s.laub} Laub-Körper`
    );
    const wk = d.boot && d.boot.werk;
    const bahnen = wk?.bahnen || [];
    pruef(
        "W6 die Werk-Fäden: auf 16 Kernen bauen mehrere Fäden, jeder wird bereit und baut, jeder Auftrag reist in seiner Bahn und kommt zurück",
        bahnen.length >= 2 &&
            bahnen.every((b) => b.bereit && b.posts > 0 && b.antworten >= b.posts && !b.fremd?.length),
        `${wk ? wk.kerne : "?"} Kerne · ${bahnen.length} Fäden: ` +
            bahnen
                .map(
                    (b) =>
                        `werk${b.k || ""} ${b.bereit ? "" : "nicht bereit, "}${b.posts} Aufträge/${b.antworten} Antworten` +
                        (b.fremd?.length ? ` fremde Nummern ${b.fremd.join(" ")}` : "")
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
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 900000, vor: WELT_HAKEN }, 60000);
    try {
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
    ["V15 die Platte fällt laut: eine Quelle, die der Faden nicht holt, meldet die Schale beim Namen, der Bau geht weiter", "platteLaut"],
];

hauptLauf(async () => {
    const { errs, check } = pruefer();
    if (SELBSTTEST) {
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
        const s9 = (wandel, wandelDatei, k) => statisch(wandel, wandelDatei).find((g) => g[0].startsWith(k));
        const t24a = s9((t) => bruch(t, "const text = (u) => new Promise((ok) => ok(cfg.hole(u)));", "const text = (u) => fetch(u).then((r) => r.text());"), undefined, "S9a");
        check("Selbst-Test 24a: die Schale holt ihre Quellen per fetch → S9a rot beim Namen", t24a && !t24a[1] && /fetch/.test(t24a[2]), t24a && t24a[2]);
        const t24b = s9((t) => bruch(t, "return import(modul(motoren[0]))", "return import(motoren[0])"), undefined, "S9a");
        check("Selbst-Test 24b: der Start importiert die Engine von http → S9a rot beim Namen", t24b && !t24b[1] && /import/.test(t24b[2]), t24b && t24b[2]);
        const t24c = s9(undefined, (t) => t + "\nfetch(self.location.href);\n", "S9b");
        check("Selbst-Test 24c: ein Kern ruft fetch → S9b rot beim Namen", t24c && !t24c[1] && /fetch/.test(t24c[2]), t24c && t24c[2]);
        const t24d = s9(undefined, undefined, "S9");
        check("Selbst-Test 24d: der Stand ist grün (S9a)", t24d && t24d[1] === true, t24d && t24d[2]);
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
        const stumm = bruch(schale, ".catch((e) => faellt((e && e.message) || e))", ".catch(() => null)");
        const v25 = await verhalten(stumm);
        check("Selbst-Test 25: die Schale verschluckt den Fall der Platte → V15 rot", stumm !== schale && v25.platteLaut === false, v25.platteLautZeile);
        // Das Welt-Urteil feuert auf Bruch-Daten (die Sonde selbst misst nur im Haupt-Lauf — ein Boot kostet Minuten).
        const gut = {
            G: { eiche: 2, fichte: 2, birke: 2, tanne: 2, weide: 1, mammut: 1, strauch: 1, "*": 16 },
            T: { eiche: 3, fichte: 3, birke: 3, tanne: 3, weide: 1, mammut: 1, strauch: 1 },
            samen: { eiche: [1, 2, 3], weide: [1] },
            karten: { eiche: 3, fichte: 3, birke: 3, tanne: 3, weide: 1, mammut: 1, strauch: 1 },
            wand: { lesen: ["position", "color"], gelesen: ["color", "position"], reist: ["position", "color"] },
            vorrat: { arten: 2, kalt: [] },
            boot: {
                posts: 200,
                antworten: 200,
                kartenArtL2: 0,
                lru: 0,
                cache: 230,
                // W9: 50 Eichen lesen nur die Basis, 5 Wölfe den Körper-Kern (die Hüllen-Maschine), 5 Felsen den Gelände-Kern
                spur: [
                    ...Array.from({ length: 50 }, (_, i) => ({ rest: `eiche|${i}|0`, kerne: ["phyto"], zeuge: [] })),
                    ...Array.from({ length: 5 }, (_, i) => ({ rest: `wolf|${i}|0`, kerne: ["koerper", "phyto", "tetrapoda"], zeuge: ["koerper", "tetrapoda"] })),
                    ...Array.from({ length: 5 }, (_, i) => ({ rest: `findling|${i}|0`, kerne: ["gelaende", "phyto"], zeuge: ["gelaende"] })),
                ],
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
            ["26a: die Lese-Spur verschweigt den Körper-Kern beim Wolf (GEFANGEN: nach der Landung käme er alt)", mit("boot", { spur: gut.boot.spur.map((e) => (e.rest.startsWith("wolf") ? { ...e, kerne: ["phyto", "tetrapoda"] } : e)) }), "W9"], // prettier-ignore
            ["26b: jede Eiche hängt an Körper- und Gelände-Kern, die kein Bau von ihr las (die Text-Suche)", mit("boot", { spur: gut.boot.spur.map((e) => (e.rest.startsWith("eiche") ? { ...e, kerne: ["gelaende", "koerper", "phyto"] } : e)) }), "W9"], // prettier-ignore
            ["26c: der Zeuge maß keinen Lauf", mit("boot", { spur: gut.boot.spur.map((e) => ({ ...e, zeuge: null })) }), "W9"],
            ["10w: das Werk baut allein (kein Helfer, der Null-Renderer schloss sie aus)", werk(), "W6"],
            ["10x: ein Helfer wird nie bereit und baut nichts", werk(bahn(1, false, 0, 0)), "W6"],
            ["10y: ein Auftrag reist mit der Nummer einer fremden Bahn (w2_ im Faden 1)", werk(bahn(1, true, 100, 100, ["gw2_17"])), "W6"], // prettier-ignore
            ["10z: ein Helfer bleibt Antworten schuldig", werk(bahn(1, true, 100, 90)), "W6"],
            ["10b: Saison-Wechsel mit 131 Aufträgen / 131 neuen Schlüsseln", mit("saison", { posts: 131, neueSchluessel: 131 }), "W2a"], // prettier-ignore
            ["10e: unruhige Welt (Kontroll-Fenster bestellt — die Sonde misst nicht sauber)", mit("saison", { kontrolle: { posts: 7, removes: 0 } }), "W2a"], // prettier-ignore
            ["10k: das Laub steht im Herbst (die Präsenz bleibt 1)", mit("saison", { praesenz: [1, 1] }), "W2b"],
            ["10c: Eiche bestellt Same 4 über ihren Solitär hinaus", mit("samen", { eiche: [1, 2, 3, 4] }), "W1a"],
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
        // DIE PLATTE FEIN an ihren Tätern (EIN Browser, je Mutante dieselben Fahrten): der Stand ist grün, jede Mutante fällt
        const pf = await platteFein({
            stand: schale,
            // DIE GEFAHR BEIM NAMEN: die Lese-Spur verschweigt einen gelesenen Kern — kl käme nach der Landung alt von der Platte
            stumm: bruch(schale, "if (spur) spur.add(k.id);", 'if (spur && k.id !== "b") spur.add(k.id);'),
            // die Karte hängt nur an Basis und Eigner, nie an den Kernen ihres Körpers — sie käme alt
            karte: bruch(schale, "l.kerne = leser(l, ids || kerne.map((k) => k.id));", "l.kerne = leser(l, []);"),
            // jede Lieferung hängt an ALLEN Kernen (bis K4#2 leerte ein Kern-Edit die Platte; bis w28-platte-fein jeder genannte)
            alle: bruch(schale, "[...new Set([...immer, ...l.eigner, ...gelesen])].sort();", "kerne.map((k) => k.id).sort();"),
            // der Deckel fegt, was das Gesetz von heute nicht trifft (das Öffnen bis w28-platte-fein)
            fegt: bruch(schale, "if (e.alter > D.tage) weg.push(KOPF + kurz, WAAGE + kurz);", "if (!e.trifft) weg.push(KOPF + kurz, WAAGE + kurz);"),
            // der Deckel kennt kein Gewicht
            leicht: bruch(schale, "if (summe <= D.mb * 1048576) break;", "break;"),
        });
        check("Selbst-Test 23a: die Platte fein ist am Stand grün (V9 · V16 · V17 · V18 · V19)", FEIN.every(([, k]) => pf.stand[k] === true), FEIN.filter(([, k]) => !pf.stand[k]).map(([, k]) => pf.stand[k + "Zeile"]).join(" ‖ ")); // prettier-ignore
        check("Selbst-Test 23b: die Lese-Spur verschweigt einen gelesenen Kern → V17 GEFANGEN (ein altes Ding unter neuem Gesetz)", pf.stumm.frisch === false && pf.stumm.spur === false, pf.stumm.frischZeile); // prettier-ignore
        check("Selbst-Test 23c: die Karte hängt nicht an den Kernen ihres Körpers → V17 GEFANGEN (die alte Karte unter neuem Gesetz)", pf.karte.frisch === false, pf.karte.feinZeile); // prettier-ignore
        check("Selbst-Test 23d: jede Lieferung hängt an ALLEN Kernen → V9 und V16 fallen (eine Landung baut alles neu)", pf.alle.spur === false && pf.alle.fein === false, pf.alle.feinZeile); // prettier-ignore
        check("Selbst-Test 23e: der Deckel fegt, was heute nicht trifft → V18 fällt (die zweite Fassung überlebt das Öffnen nicht)", pf.fegt.generationen === false, pf.fegt.generationenZeile); // prettier-ignore
        check("Selbst-Test 23f: der Deckel kennt kein Gewicht → V19 fällt", pf.leicht.deckel === false, pf.leicht.deckelZeile);
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
            k === "faden" && v.fadenMs ? `Werk ${v.fadenMs.werk} ms · lang ${v.fadenMs.lang} ms` : k === "platteLaut" ? v.platteLautZeile : ""
        );
    console.log("=== FLUSS-WAND — die Platte fein (echter Worker + IndexedDB: Kern liest Kern, zwei Fassungen, der Deckel) ===");
    const pf = (await platteFein({ stand: schale })).stand;
    for (const [n, k] of FEIN) check(n, pf[k] === true, pf[k + "Zeile"]);
    console.log("=== FLUSS-WAND — Welt-Sonde (Null-Renderer, echter Studio-Worker, Boot + Saison-Wechsel) ===");
    const w = await welt();
    console.log(
        `  Boot: ${w.boot.posts} Aufträge · Karten ${JSON.stringify(w.karten)}`
    );
    for (const [n, ok, d] of urteilWelt(w)) check(n, ok, d);
    wandEnde(errs, "der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.");
});
