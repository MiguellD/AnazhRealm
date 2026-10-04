#!/usr/bin/env node
// diag-fluss.cjs — DIE FLUSS-WAND (V18.511): der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.
// Befund 02.10. (Fluss-Linse, Mess-Wiese): 262 Studio-Assets = 404 MB liefen beim Boot durch den Haupt-Thread —
// Klon beim Empfang Σ 600 ms, IDB-Put-Serialisierung Σ 3,7 s (max 207 ms), Gets hinter Schreib-Transaktionen
// (Median 3,3 s); 32 % der Bytes (aWind · aCenter · aType) las niemand. Seit V18.511 trägt die Transport-Schale
// (`_foundrySchale`, läuft im Worker VOR dem Studio) Platte · Konsum-Wand · Index-Verengung · Transfer.
//
// STATISCH (Node, gestrippter Stamm):
//   S1  FOUNDRY_LESEN == die Attribute, die `_foundryBuildMesh` liest (keine Seite mehr, keine weniger)
//   S2  der Haupt-Thread fasst den Asset-Store nie an: „anazhFoundryAssets" lebt NUR in der Schale,
//       `_foundryIdbInit/_foundryIdbGet/_foundryIdbPut` sind fort
//   S3  der Worker-Boot stellt die Schale voran und reicht ihr FOUNDRY_LESEN + FOUNDRY_PLATTE_FORMAT
//   S4  GESTALTEN (V18.527): jede Varianten-Wahl trägt ihre Art · der Vorrat wärmt 1..V · EIN Streu-Same, die
//       Promotion trägt ihn
// KLON-LINSE (Node): `_foundryVariantFor` gegen das Studio-Budget auf 600 × 600 Streu-Zellen — 1/V je Gestalt,
//       Nachbar-/Versatz-16-Gleichheit ≤ 1/V + 0,03 (das alte `h % 16` legte ein 54-m-Klon-Gitter)
// VERHALTEN (Chromium, echter Worker + echte IndexedDB; die Schale aus dem Stamm + ein Studio-Double):
//   V1  Konsum-Wand: aWind fällt, position/color reisen · V2 Uint16-Index ≤ 65 536 Vertices, Uint32 darüber
//   V3  Transfer: der Studio-Puffer ist nach dem Senden abgelöst (byteLength 0)
//   V4  Platte: zweite Anfrage kommt von der Platte, das Studio baut nicht noch einmal
//   V5  nurPlatte (Ship-Hook): Miss = leere Antwort, kein Bau · V6 Format-Wechsel leert die Platte
//   V7  Saison-Nagel · V8 Vorrat (Platte, leere Antwort) · V9 Karten auf der Platte (V18.527)
// STATISCH (V18.527): S5 keine Saison in Schlüssel/Auftrag, Flip-Maschine fort · S6 keine tote Fracht · S7 der
//   Stempel hasht die Shells, jeder Welt-Körper schickt seinen Schlüssel, Karten tragen `karte|…`
// WELT-SONDE (Null-Renderer, echter Studio-Worker, Platte an): W1 Gestalten je Art = Budget, 0 Karten-Art-L2,
//   0 LRU-Räumungen im Boot · W2 ein Saison-Wechsel baut 0 · W3 der Zweit-Boot baut ≤ 5 MB neu
//
//   node scripts/diag-fluss.cjs [--selftest]          (npm run gate:fluss)
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT || 4561);
const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\"'`])\/\/.*$/gm, "$1");
function methode(src, kopf) {
    const a = src.indexOf("\n    " + kopf);
    if (a < 0) return null;
    const b = src.indexOf("\n    }\n", a);
    return b < 0 ? null : src.slice(a + 1, b + 6);
}

function statisch(src) {
    const aus = [];
    const pruef = (name, ok, detail) => aus.push([name, !!ok, detail || ""]);
    const m = src.match(/AnazhRealm\.FOUNDRY_LESEN = (\[[^\]]*\]);/);
    let lesen = null;
    try {
        lesen = m ? JSON.parse(m[1]) : null;
    } catch (_e) {}
    const bau = methode(src, "_foundryBuildMesh(m) {");
    const gelesen = new Set();
    if (bau) {
        const code = strip(bau);
        for (const t of code.matchAll(/\bm\.(\w+)\.array\b/g)) gelesen.add(t[1]);
        for (const t of code.matchAll(/for \(const nm of (\[[^\]]*\])\)/g))
            for (const n of JSON.parse(t[1])) gelesen.add(n);
    }
    const a = lesen ? [...lesen].sort().join(",") : "?";
    const b = [...gelesen].sort().join(",");
    pruef("S1 FOUNDRY_LESEN == Leser von _foundryBuildMesh", lesen && bau && a === b, `Wand [${a}] · Leser [${b}]`);
    const schale = methode(src, "static _foundrySchale(cfg) {");
    const ohneSchale = strip(schale ? src.replace(schale, "") : src);
    pruef("S2a die Schale steht im Stamm", !!schale);
    pruef("S2b der Asset-Store lebt NUR in der Schale", schale && !/anazhFoundryAssets/.test(ohneSchale));
    pruef("S2c die Haupt-Thread-Platte ist fort", !/_foundryIdb(Init|Get|Put)\b/.test(strip(src)));
    const boot = methode(src, "_ensureAssetFoundry() {");
    const bootCode = boot ? strip(boot) : "";
    pruef(
        "S3 der Worker-Boot stellt die Schale voran (FOUNDRY_LESEN + FOUNDRY_PLATTE_FORMAT)",
        /AnazhRealm\._foundrySchale\.toString\(\)/.test(bootCode) &&
            /AnazhRealm\.FOUNDRY_LESEN/.test(bootCode) &&
            /AnazhRealm\.FOUNDRY_PLATTE_FORMAT/.test(bootCode)
    );
    // GESTALTEN (V18.527): die EINE Varianten-Wahl liest das Studio-Budget, jeder Aufrufer reicht seine Art.
    const code = strip(src);
    const einArg = [...code.matchAll(/_foundryVariantFor\(([^()]*)\)/g)].filter((m) => !/,/.test(m[1]));
    pruef(
        "S4a jede Varianten-Wahl trägt ihre Art (_foundryVariantFor(seed, preset)), kein _foundryVariantCount",
        !einArg.length && !/_foundryVariantCount/.test(code),
        einArg.length ? `ein-Argument-Aufruf: ${einArg[0][0]}` : ""
    );
    const pre = methode(src, "async _foundryPrefetchLibrary() {");
    pruef(
        "S4b der Vorrat wärmt die Gestalten 1..V (kein Samen-/Karten-Literal)",
        pre && /_foundryGestalten\(sp\)/.test(strip(pre)) && !/<=\s*16\b|seeds:\s*\[1, 2/.test(strip(pre))
    );
    const formel = (code.match(/\*\s*73856093\)\s*\^\s*\(cellZ\s*\*\s*19349663\)\s*\^\s*\(variantIndex \+ 1\)/g) || [])
        .length;
    const prom = methode(src, "_promoteScatterCell(cellEntry) {");
    pruef(
        "S4c EIN Streu-Same (_scatterFoundrySeed), die Promotion trägt ihn (kein Math.random-Same)",
        formel === 1 && prom && /seed:\s*this\._scatterFoundrySeed\(/.test(strip(prom)),
        `Formel ${formel}×`
    );
    // SAISON (V18.527): kein Körper-/Karten-Schlüssel und kein Auftrag trägt die Saison, die Flip-Maschine ist fort,
    // die Schale nagelt den Sommer auf Körper UND Karten.
    const teil = (k) => {
        const m = methode(src, k);
        return m ? strip(m) : null;
    };
    const saisonfrei = [
        "_foundryKoerperKey(preset, gestalt, lod, ov) {",
        "_foundryKartenKey(preset, gestalt, ov) {",
        "_foundryRequest(presetId, seed, lod, ov, wo) {",
        "_foundryWorkerRequest(",
        "_foundryBakeImpostorRequest(",
        "_foundryEnsureImpostorRecord(",
        "_foundryFlattenFor(",
        "_foundryEntryReady(",
    ].map((k) => [k, teil(k)]);
    const traeger = saisonfrei.filter(([, t]) => !t || /season/i.test(t)).map(([k]) => k.split("(")[0]);
    pruef(
        "S5a kein Körper-/Karten-Schlüssel und kein Auftrag trägt die Saison",
        !traeger.length,
        traeger.length ? "Saison/fehlt in " + traeger.join(", ") : ""
    );
    pruef(
        "S5b die Saison-Flip-Maschine ist fort (_foundrySeasonChanged · _drainSeasonFlip · SEASON_FLIP_PER_TICK · _seasonTint)",
        !/_foundrySeasonChanged|_drainSeasonFlip|SEASON_FLIP_PER_TICK|_seasonTint\b|_seasonFlipQueue/.test(code)
    );
    const sc = schale ? strip(schale) : "";
    pruef(
        "S5c die Schale nagelt den Sommer auf jeden Körper- und Karten-Auftrag",
        /m\.type !== "build-asset" && m\.type !== "bake-impostor"/.test(sc) && /season:\s*"summer"/.test(sc)
    );
    // TOTE FRACHT (V18.527): Karten-Arten bestellen im Vorrat keine Geometrie, die Karte zieht mit echtem Renderer keine
    // Körper-Stufe, der Fahrzeug-Vorrat wärmt nur die Platte.
    const preS = pre ? strip(pre) : "";
    const iSkip = preS.indexOf("if (this._foundryPresetIsTree(sp)) continue;");
    const iReq = preS.indexOf("this._foundryRequest(sp, sd, lod)");
    pruef(
        "S6a der Vorrat bestellt für Karten-Arten keine Geometrie (kein L2-Körper ohne Leser)",
        iSkip >= 0 && iReq > iSkip && !/lods:\s*\[2\]/.test(code)
    );
    const recS = teil("_foundryEnsureImpostorRecord(");
    const iStudio = recS ? recS.indexOf("this._ensureImpostorAtlas(key, null)") : -1;
    const iZug = recS ? recS.indexOf("this._foundryRequest(") : -1;
    pruef(
        "S6b die Karte zieht mit echtem Renderer keine Körper-Stufe (rahmenloser Studio-Record vor jedem _foundryRequest)",
        iStudio >= 0 && iZug > iStudio && /rendR && !rendR\._isHeadlessNull/.test(recS)
    );
    pruef(
        "S6c der Fahrzeug-Vorrat wärmt nur die Platte (_foundryVorrat, die Schale antwortet leer)",
        /this\._foundryVorrat\(sp, sd, lod\)/.test(preS) && /meshes: \[\], vorrat: true/.test(sc)
    );
    // DIE PLATTE TRÄGT DEN ZWEIT-BOOT (V18.527): der Stempel hasht auch die Shells, jeder Welt-Körper schickt seinen
    // Schlüssel (die Schale entscheidet), Karten reisen mit `karte|…` und werden geschrieben.
    pruef(
        "S7a der Stempel hasht die Shells (core.shell — Mesh-Extraktion + Karten-Bäcker)",
        /stempelUrls\.push\(new URL\(core\.shell \+ v, base\)\.href\)/.test(bootCode)
    );
    const reqS = teil("_foundryRequest(presetId, seed, lod, ov, wo) {") || "";
    pruef(
        "S7b jeder Welt-Körper schickt seinen Schlüssel (geprägt mit ov-Hash), die Schale entscheidet über die Platte",
        !/f\.platte/.test(reqS) && /this\._foundryKoerperKey\(presetId, seed, lod, hasOv \? ov : null\)/.test(reqS)
    );
    pruef(
        "S7c Karten tragen ihren Platten-Schlüssel, die Schale schreibt jeden frischen Bake",
        /msg\.platte = "karte\|" \+ this\._foundryKartenKey\(/.test(teil("_foundryBakeImpostorRequest(") || "") &&
            /schreib\(auftrag\.key, \{ payload: p \}\)/.test(sc)
    );
    return { gesetze: aus, schale };
}

// DIE KLON-LINSE (V18.527): die Varianten-Wahl des Stamms (`_foundryVariantFor` + `_foundryGestalten`, als Quelltext
// gezogen) gegen das eingefrorene Studio-Budget (render-config-Golden) auf dem echten Streu-Gitter
// (`_scatterFoundrySeed`, 600 × 600 Zellen): je Art mit V ≥ 2 trägt jede Gestalt 1/V ± 0,03, und die Nachbar-
// sowie die 16-Zellen-Versatz-Gleichheit bleibt ≤ 1/V + 0,03 — das alte `h % 16` (untere Bits) legte ein Klon-
// Gitter (dieselbe Gestalt 16 Zellen weiter). Jede Art liegt im Bereich 1..V.
function gestalten(src) {
    const rc = JSON.parse(
        fs.readFileSync(path.join(root, "spec", "asset-contract", "v1", "golden", "render-config.json"), "utf8")
    );
    const G = rc && rc.lod && rc.lod.budget && rc.lod.budget.gestalten;
    const teile = ["_foundryVariantFor(seed, preset) {", "_foundryGestalten(preset) {", "_scatterFoundrySeed("].map(
        (k) => methode(src, k)
    );
    if (!G || teile.some((t) => !t)) return { ok: false, detail: "Budget oder Methode fehlt", arten: {} };
    const AR = { _studioRenderConfig: { lod: { budget: { gestalten: G } } } };
    const r = new Function("AnazhRealm", "return {" + teile.join(",") + "};")(AR);
    const arten = {};
    let ok = true;
    for (const zeile of Object.keys(G)) {
        const sp = zeile === "*" ? "haus" : zeile; // '*' trägt jede Art ohne eigene Zeile (Haus, Fahrzeug, Tor …)
        const V = G[zeile];
        const H = new Array(V + 1).fill(0);
        let n = 0,
            nb = 0,
            o16 = 0,
            raus = 0;
        for (let x = -300; x < 300; x++)
            for (let z = -300; z < 300; z++) {
                const g = r._foundryVariantFor(r._scatterFoundrySeed(x, z, 0), sp);
                if (!(g >= 1 && g <= V)) raus++;
                else H[g]++;
                n++;
                if (g === r._foundryVariantFor(r._scatterFoundrySeed(x + 1, z, 0), sp)) nb++;
                if (g === r._foundryVariantFor(r._scatterFoundrySeed(x + 16, z, 0), sp)) o16++;
            }
        const anteil = H.slice(1).map((h) => h / n);
        const artOk =
            raus === 0 &&
            (V < 2 ||
                (anteil.every((a) => Math.abs(a - 1 / V) <= 0.03) &&
                    nb / n <= 1 / V + 0.03 &&
                    o16 / n <= 1 / V + 0.03));
        arten[zeile === "*" ? "*(haus)" : sp] = { V, nachbar: +(nb / n).toFixed(3), versatz16: +(o16 / n).toFixed(3), raus, ok: artOk };
        if (!artOk) ok = false;
    }
    return { ok, arten };
}

// Das Studio-Double: antwortet auf build-asset wie die Brücke (frische Puffer, aWind + Uint32-Index), zählt Bauten
// und meldet, ob sein letzter Puffer nach dem Senden abgelöst ist (= übertragen statt kopiert). Es merkt sich die
// Saison, die es sah (der Saison-Nagel), und bäckt Karten (bake-impostor → impostor, frische Pixel-Puffer).
const STUDIO = `
let gebaut = 0, gebacken = 0, letzte = null;
const saisons = [];
self.onmessage = (e) => {
    const m = e.data;
    if (m.type === "build-asset" || m.type === "bake-impostor") saisons.push(m.season === undefined ? "-" : m.season);
    if (m.type === "bake-impostor") {
        gebacken++;
        const albedo = new Uint8Array(128 * 256 * 8 * 4).fill(200), normal = new Uint8Array(128 * 256 * 8 * 4).fill(128);
        self.postMessage({ type: "impostor", world: "terrain", reqId: m.reqId, presetId: m.presetId, seed: m.seed,
            payload: { cw: 128, ch: 256, V: 8, aspect: 0.5, height: 9.5, albedo, normal } });
    } else if (m.type === "build-asset") {
        gebaut++;
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
        self.postMessage({ type: "antwort", gebaut, gebacken, saisons: saisons.slice(), abgeloest: letzte ? letzte.byteLength === 0 : null });
};`;

async function verhalten(schaleSrc) {
    const puppeteer = require("puppeteer");
    const server = http.createServer((req, res) => {
        if (req.url.startsWith("/kern.js")) {
            res.setHeader("Content-Type", "application/javascript");
            return res.end("// kern");
        }
        res.setHeader("Content-Type", "text/html");
        res.end("<!doctype html><meta charset=utf-8><title>fluss</title>");
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${PORT}/`);
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
                const ruhe = (ms) => new Promise((r) => setTimeout(r, ms));
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
                await ruhe(400);
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
                // V7 DER SAISON-NAGEL: ein Herbst-Körper (ohne Platte) und eine Winter-Karte erreichen das Studio als
                // Sommer — jeder Bau ist Golden-Sommer, die Farbe trägt der Host.
                const C = neu(3, false);
                await C.frag({ type: "build-asset", reqId: "s1", presetId: "x", seed: 2, lod: 1, season: "autumn" });
                const k1 = await C.frag({ type: "bake-impostor", reqId: "s2", presetId: "x", seed: 2, season: "winter" });
                const q4 = await C.frag({ type: "frage" }, "antwort");
                aus.nagel = !!(
                    q4 &&
                    q4.saisons.length === 2 &&
                    q4.saisons.every((s) => s === "summer") &&
                    k1 &&
                    k1.payload &&
                    k1.payload.albedo
                );
                C.w.terminate();
                // V8 DER VORRAT: ein Vorrats-Auftrag baut einmal, schreibt die Platte und antwortet LEER; der nächste
                // Abruf desselben Körpers kommt von der Platte, ein zweiter Vorrat baut nicht.
                const D = neu(3, true);
                const v1 = await D.frag({ type: "build-asset", reqId: "v1", presetId: "gt", seed: 7, lod: 0, platte: "gt|7|0", vorrat: true });
                await ruhe(400);
                const v2 = await D.frag({ type: "build-asset", reqId: "v2", presetId: "gt", seed: 7, lod: 0, platte: "gt|7|0", vorrat: true });
                const v3 = await D.frag({ type: "build-asset", reqId: "v3", presetId: "gt", seed: 7, lod: 0, platte: "gt|7|0" });
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
                const v4 = await E.frag({ type: "build-asset", reqId: "v4", presetId: "gt", seed: 7, lod: 0, platte: "gt|7|0", vorrat: true });
                const q6 = await E.frag({ type: "frage" }, "antwort");
                aus.vorratOhnePlatte = !!(v4 && v4.meshes.length === 0 && q6 && q6.gebaut === 0);
                E.w.terminate();
                // V9 KARTEN AUF DIE PLATTE: der erste Bake geht ans Studio und wird geschrieben, der zweite kommt von der
                // Platte (platte:true, die Pixel unversehrt), das Studio bäckt nur einmal.
                const F = neu(3, true);
                const kp1 = await F.frag({ type: "bake-impostor", reqId: "kp1", presetId: "eiche", seed: 2, platte: "karte|eiche|2" });
                await ruhe(400);
                const kp2 = await F.frag({ type: "bake-impostor", reqId: "kp2", presetId: "eiche", seed: 2, platte: "karte|eiche|2" });
                const q7 = await F.frag({ type: "frage" }, "antwort");
                aus.karte = !!(
                    kp1 &&
                    !kp1.platte &&
                    kp1.payload &&
                    kp2 &&
                    kp2.platte === true &&
                    kp2.payload &&
                    kp2.payload.albedo.length === 128 * 256 * 8 * 4 &&
                    kp2.payload.albedo[7] === 200 &&
                    kp2.payload.height === 9.5 &&
                    q7 &&
                    q7.gebacken === 1
                );
                F.w.terminate();
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
// streamt und kommt zur Ruhe; jeder Körper-/Karten-Auftrag an den Foundry-Worker und jede Antwort wird gezählt.
// W1 GESTALTEN: jede Natur-Art bestellt nur Samen 1..V ihres Budgets, Karten-Records je Art = V.
// W2 SAISON: ein Wechsel auf Herbst baut nichts (0 Aufträge, 0 entfernte Instanzen), die Uniform uSeasonMul dreht.
const WELT_HAKEN = () => {
    window.__anazhHeadlessNullRenderer = true;
    // Die Platte AN unter dem Null-Renderer (nur in dieser Sonde): der Boot-Blob der Transport-Schale trägt
    // cfg.platte=false (gate-deterministisch); hier wird er true — der Host schickt seine Schlüssel ohnehin immer, die
    // Schale entscheidet. So misst die Sonde den Zweit-Boot mit echter IndexedDB im echten Studio-Worker.
    const B0 = window.Blob;
    const B1 = function (teile, opt) {
        if (Array.isArray(teile) && typeof teile[0] === "string" && teile[0].indexOf("_foundrySchale") >= 0)
            teile = [teile[0].replace('"platte":false', '"platte":true')].concat(teile.slice(1));
        return new B0(teile, opt);
    };
    B1.prototype = B0.prototype;
    window.Blob = B1;
    const W0 = window.Worker;
    const fl = (window.__fl = { posts: [], antworten: [] });
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
            this.addEventListener("message", (e) => {
                const m = e.data;
                if (m && (m.type === "asset" || m.type === "impostor"))
                    fl.antworten.push({
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
            if (m && (m.type === "build-asset" || m.type === "bake-impostor"))
                fl.posts.push({ t: m.type, p: m.presetId, s: m.seed, l: m.lod, ov: !!m.ov });
            return t ? super.postMessage(m, t) : super.postMessage(m);
        }
    };
};
const WELT_MESSEN = async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const t00 = performance.now();
    while (performance.now() - t00 < 60000) {
        const r = window.anazhRealm;
        if (r && typeof r._gameLoopTick === "function") {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (r.state.voxelChunks && r.state.voxelChunks.size >= 25) break;
        }
        await sleep(6);
    }
    const r = window.anazhRealm;
    const f = r._ensureAssetFoundry();
    const t0 = performance.now();
    while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
    const pump = async (n) => {
        for (let i = 0; i < n; i++) {
            r.state._frameOverBudget = false;
            try {
                r._gameLoopTick(performance.now());
                const pp = r.state.playerMesh && r.state.playerMesh.position;
                if (pp) r._tickScatterStreaming(pp);
            } catch (_e) {}
            await sleep(8);
        }
    };
    await pump(300);
    const tq = performance.now();
    while (performance.now() - tq < 240000) {
        await pump(20);
        if (!f._prefetching && !(f.warte && f.warte.length) && f.pending.size === 0) break;
    }
    await pump(60);
    const fl = window.__fl;
    const cfg = r.constructor._studioRenderConfig;
    const G = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget.gestalten : null;
    const samen = {};
    for (const x of fl.posts)
        if (x.t === "build-asset" && !x.ov) (samen[x.p] = samen[x.p] || []).includes(x.s) || samen[x.p].push(x.s);
    const karten = {};
    for (const k of r._impostorAtlasMap ? r._impostorAtlasMap.keys() : [])
        if (k.startsWith("fimp:")) {
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
    if (window.__flussNurBoot) return { boot, bootMB: MB(fl.antworten) };
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
        samen,
        karten,
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
    pruef("W0 die Sonde misst (Budget im Buch, Boot bestellt, Foundry-Bäume stehen)", d.G && d.boot.posts >= 50 && d.saison.inst0 >= 5, `Boot ${d.boot.posts} Aufträge · ${d.saison.inst0} Bäume`);
    const raus = [];
    const kartenFalsch = [];
    for (const sp of ["eiche", "fichte", "birke", "tanne", "weide", "mammut", "strauch"]) {
        const V = d.G && Number.isInteger(d.G[sp]) ? d.G[sp] : null;
        if (V == null) {
            raus.push(sp + " ohne Budget");
            continue;
        }
        for (const s of d.samen[sp] || []) if (!(s >= 1 && s <= V)) raus.push(`${sp}|${s}`);
        if ((d.karten[sp] || 0) !== V) kartenFalsch.push(`${sp} ${d.karten[sp] || 0}≠${V}`);
    }
    pruef("W1a jede Baum-/Strauch-Art bestellt nur ihre Gestalten 1..V", !raus.length, raus.slice(0, 6).join(" · "));
    pruef("W1b Karten-Records je Art = Budget-Gestalten", !kartenFalsch.length, kartenFalsch.join(" · "));
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
    return aus;
}

async function welt() {
    const puppeteer = require("puppeteer");
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".wasm": "application/wasm",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
    };
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) {
            res.statusCode = 403;
            return res.end();
        }
        fs.readFile(fp, (err, data) => {
            if (err) {
                res.statusCode = 404;
                return res.end();
            }
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        page.on("pageerror", (e) => console.log("  [Seiten-Fehler]", String((e && e.message) || e).split("\n")[0]));
        await page.evaluateOnNewDocument(WELT_HAKEN);
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
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
    ["V7 Saison-Nagel: Herbst-Körper und Winter-Karte erreichen das Studio als Sommer", "nagel"],
    ["V8 Vorrat: einmal gebaut, auf die Platte, leere Antwort; der Abruf trifft die Platte", "vorrat"],
    ["V8b Vorrat ohne Platte: leere Antwort, kein Bau", "vorratOhnePlatte"],
    ["V9 Karten auf der Platte: der zweite Bake kommt von der Platte, das Studio bäckt einmal", "karte"],
];

(async () => {
    const errs = [];
    const check = (name, ok, detail) => {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) errs.push(name);
    };
    if (process.argv.includes("--selftest")) {
        console.log("=== FLUSS-WAND — SELBST-TEST: die Wand feuert auf injizierte Brüche ===");
        const t1 = statisch(stamm.replace('"skinWeight"];', '"skinWeight", "aWind"];')).gesetze.find((g) =>
            g[0].startsWith("S1")
        );
        check("Selbst-Test 1: ein Wand-Name ohne Leser → S1 rot", t1 && !t1[1]);
        const t2 = statisch(
            stamm.replace(
                "    _foundryRequest(presetId, seed, lod, ov, wo) {",
                '    _foundryRequest(presetId, seed, lod, ov, wo) {\n        indexedDB.open("anazhFoundryAssets", 1);'
            )
        ).gesetze.find((g) => g[0].startsWith("S2b"));
        check("Selbst-Test 2: Haupt-Thread öffnet den Asset-Store → S2b rot", t2 && !t2[1]);
        const t5 = gestalten(
            stamm.replace("return 1 + Math.floor((h * V) / 4294967296);", "return (h % V) + 1;")
        );
        check("Selbst-Test 5: Gestalten-Wahl aus den unteren Bits (h % V) → Klon-Linse rot", !t5.ok);
        const t6 = statisch(
            stamm.replace(
                "const variant = this._foundryVariantFor(entry.seed, preset);",
                "const variant = this._foundryVariantFor(entry.seed);"
            )
        ).gesetze.find((g) => g[0].startsWith("S4a"));
        check("Selbst-Test 6: eine Varianten-Wahl ohne Art → S4a rot", t6 && !t6[1]);
        const t7 = statisch(
            stamm.replace(
                "seed: this._scatterFoundrySeed(cellEntry.cellX, cellEntry.cellZ, cellEntry.variantIndex),",
                ""
            )
        ).gesetze.find((g) => g[0].startsWith("S4c"));
        check("Selbst-Test 7: Promotion ohne Zellen-Samen → S4c rot", t7 && !t7[1]);
        const { schale } = statisch(stamm);
        const v1 = await verhalten(schale.replace("return roh(msg, puffer(msg.meshes));", "return roh(msg);"));
        check("Selbst-Test 3: Schale ohne Transfer → V3 rot", v1.transfer === false);
        const v2 = await verhalten(schale.replace("!LESEN.has(k)) delete m[k]", "false) delete m[k]"));
        check("Selbst-Test 4: Schale ohne Konsum-Wand → V1 rot", v2.wand === false);
        const t8 = statisch(
            stamm.replace(
                'return preset + "|" + gestalt + "|" + lod + (ov ?',
                'return preset + "|" + gestalt + "|" + lod + "|" + this.state.season + (ov ?'
            )
        ).gesetze.find((g) => g[0].startsWith("S5a"));
        check("Selbst-Test 8: die Saison im Körper-Schlüssel → S5a rot", t8 && !t8[1]);
        const ohneNagel = schale.replace(
            'const weiter = Object.assign({}, m, { season: "summer" });',
            "const weiter = Object.assign({}, m);"
        );
        const v3 = await verhalten(ohneNagel);
        check("Selbst-Test 9: Schale ohne Saison-Nagel → V7 rot", ohneNagel !== schale && v3.nagel === false);
        // Das Welt-Urteil feuert auf Bruch-Daten (die Sonde selbst misst nur im Haupt-Lauf — ein Boot kostet Minuten).
        const gut = {
            G: { eiche: 2, fichte: 2, birke: 2, tanne: 2, weide: 1, mammut: 1, strauch: 1, "*": 16 },
            samen: { eiche: [1, 2], weide: [1] },
            karten: { eiche: 2, fichte: 2, birke: 2, tanne: 2, weide: 1, mammut: 1, strauch: 1 },
            boot: { posts: 200, antworten: 200, kartenArtL2: 0, lru: 0, cache: 230, gebautMB: 70, gebautN: 190 },
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
        check("Selbst-Test 10a: das Welt-Urteil ist auf gesunden Daten grün", urteilWelt(gut).every((g) => g[1]));
        check(
            "Selbst-Test 10b: Saison-Wechsel mit 131 Aufträgen / 131 neuen Schlüsseln → W2a rot",
            rot(Object.assign({}, gut, { saison: Object.assign({}, gut.saison, { posts: 131, neueSchluessel: 131 }) }), "W2a")
        );
        check(
            "Selbst-Test 10e: unruhige Welt (Kontroll-Fenster bestellt) → W2a rot (die Sonde misst nicht sauber)",
            rot(
                Object.assign({}, gut, { saison: Object.assign({}, gut.saison, { kontrolle: { posts: 7, removes: 0 } }) }),
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
        const t11 = statisch(
            stamm.replace("            if (this._foundryPresetIsTree(sp)) continue;\n            // Boden-Arten", "            // Boden-Arten")
        ).gesetze.find((g) => g[0].startsWith("S6a"));
        check("Selbst-Test 11: Vorrat bestellt wieder Karten-Art-Geometrie → S6a rot", t11 && !t11[1]);
        const ohneVorrat = schale.replace(
            "if (auftrag.vorrat) return roh(Object.assign({}, msg, { meshes: [], vorrat: true }));",
            ""
        );
        const v4 = await verhalten(ohneVorrat);
        check("Selbst-Test 12: Schale schickt den Vorrats-Körper zum Haupt-Thread → V8 rot", ohneVorrat !== schale && v4.vorrat === false);
        const ohneKartenPut = schale.replace("if (karteOk(p)) schreib(auftrag.key, { payload: p });", "");
        const v5 = await verhalten(ohneKartenPut);
        check("Selbst-Test 13: Schale ohne Karten-Put → V9 rot (jeder Boot bäckt die Karte neu)", ohneKartenPut !== schale && v5.karte === false);
        const t14 = statisch(
            stamm.replace(
                "                    for (const core of manifest) {\n                        if (core && typeof core.shell === \"string\" && core.shell)\n                            stempelUrls.push(new URL(core.shell + v, base).href);\n                    }\n",
                ""
            )
        ).gesetze.find((g) => g[0].startsWith("S7a"));
        check("Selbst-Test 14: Stempel ohne Shells → S7a rot", t14 && !t14[1]);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Wand ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Wand feuert auf jede injizierte Bruch-Klasse.");
        process.exit(0);
    }
    console.log("=== FLUSS-WAND — statisch ===");
    const { gesetze, schale } = statisch(stamm);
    for (const [n, ok, d] of gesetze) check(n, ok, d);
    console.log("=== FLUSS-WAND — Klon-Linse (Gestalten aus dem Studio-Budget, 600 × 600 Streu-Zellen) ===");
    const gs = gestalten(stamm);
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
    for (const [n, k] of VERHALTEN) check(n, v[k] === true);
    console.log("=== FLUSS-WAND — Welt-Sonde (Null-Renderer, echter Studio-Worker, Boot + Saison-Wechsel) ===");
    const w = await welt();
    console.log(
        `  Boot: ${w.boot.posts} Aufträge · ${w.bootMB.toFixed(1)} MB Antworten · Karten ${JSON.stringify(w.karten)}`
    );
    for (const [n, ok, d] of urteilWelt(w)) check(n, ok, d);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Gesetz(e) verletzt.`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.");
})().catch((e) => {
    console.error("❌ FEHLER:", e && e.stack ? e.stack : e);
    process.exit(1);
});
