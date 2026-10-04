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
// VERHALTEN (Chromium, echter Worker + echte IndexedDB; die Schale aus dem Stamm + ein Studio-Double):
//   V1  Konsum-Wand: aWind fällt, position/color reisen · V2 Uint16-Index ≤ 65 536 Vertices, Uint32 darüber
//   V3  Transfer: der Studio-Puffer ist nach dem Senden abgelöst (byteLength 0)
//   V4  Platte: zweite Anfrage kommt von der Platte, das Studio baut nicht noch einmal
//   V5  nurPlatte (Ship-Hook): Miss = leere Antwort, kein Bau · V6 Format-Wechsel leert die Platte
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
// und meldet, ob sein letzter Puffer nach dem Senden abgelöst ist (= übertragen statt kopiert).
const STUDIO = `
let gebaut = 0, letzte = null;
self.onmessage = (e) => {
    const m = e.data;
    if (m.type === "build-asset") {
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
    } else if (m.type === "frage") self.postMessage({ type: "antwort", gebaut, abgeloest: letzte ? letzte.byteLength === 0 : null });
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
                const key = "x|1|0|summer";
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
                    platte: "y|1|0|summer",
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

const VERHALTEN = [
    ["V1 Konsum-Wand: aWind fällt, position/color reisen", "wand"],
    ["V2a Index Uint16 bei ≤ 65 536 Vertices", "u16"],
    ["V2b Index bleibt Uint32 darüber", "u32"],
    ["V3 Transfer: der Studio-Puffer ist nach dem Senden abgelöst", "transfer"],
    ["V4 Platte: die zweite Anfrage kommt von der Platte, kein zweiter Bau", "platte"],
    ["V4b die Platte hält die verschlankte Antwort", "platteSchlank"],
    ["V5 nurPlatte: Miss = leere Antwort, kein Bau", "nurPlatte"],
    ["V6 ein neues Transport-Format leert die Platte", "format"],
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
                "    _foundryRequest(presetId, seed, lod, season, ov, wo) {",
                '    _foundryRequest(presetId, seed, lod, season, ov, wo) {\n        indexedDB.open("anazhFoundryAssets", 1);'
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
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Gesetz(e) verletzt.`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Foundry-Kanal kostet den Haupt-Thread nur den Gruppen-Bau.");
})().catch((e) => {
    console.error("❌ FEHLER:", e && e.stack ? e.stack : e);
    process.exit(1);
});
