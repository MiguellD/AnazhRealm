#!/usr/bin/env node
// diag-studio-huelle.cjs — DIE WAND DER STUDIO-HÜLLE (Studio-Welle 1, K41; Welle 2, K47 die terrain-Familie; Synthese §2.1
// W4a, gate:studio-huelle).
//
// EIN UI-Modul (worlds/huelle/huelle.js) trägt die Regler, die Sitzung (Undo/Redo · Same · Sperre), die Kosten-Leiste
// und die Portal-Brücke aller umgestiegenen Studios UND der Welt-Werkstatt. Die Wand nennt jede Kopie beim Namen:
//   H1 Hand-Regler    ein <input type="range"> von Hand in worlds/<welt>/index.html, ein `type = "range"` in einer Shell
//                     oder in der Werkstatt-Zone des Stamms (stamm/23*.js) — der EINE Generator ist AnazhHuelle.regler
//   H2 Brücken-Kopie  eine eigene ready-Meldung (`type: "ready"`) oder ein Element-Adapter (`op[0]` je Element des
//                     Programms) außerhalb der Hülle — die EINE Brücke ist AnazhHuelle.bruecke
//   H3 Umstieg        jede umgestiegene Welt lädt ../huelle/huelle.js und ruft die Brücke; jedes Studio dazu Regler,
//                     Sitzung und Kosten-Leiste; die Werkstatt ruft DENSELBEN Generator (kein Zwilling); das Gelände-Studio
//                     (worlds/gelaende/studio.js, ein Panel über der Welt-Engine) ruft Regler, Sitzung und Kosten-Leiste
//                     der Hülle, die die Heimat VOR ihm lädt
//   H4 Labor = Welt   ein Ofen-Studio (MESHFREI-Kern, die Welt bäckt seine Gestalt über BAKERS_BY_KIND) zeigt den Ofen-
//                     Körper: es lädt foundry-core, baut über BAKERS_BY_KIND.<kind> und nie einen eigenen Leib (bauTier ·
//                     bauMensch · fellStreu in der Shell — K45: das tetrapoda-Labor zeigte 1 299 852 △ gegen die Welt-Zeile
//                     62 000). Im Bild (--bild) ist L0 der Kosten-Leiste über der Budget-Zeile ROT.
// Ausgenommen, benannt: die zwei sandgesicherten Welten begegnung + schwarm (CSP default-src 'none': sie laden kein
// Skript, ihr Protokoll richtet gate:portal-konformanz). Die terrain-Familie (terrain + gelaende) trägt seit K47 keine
// Ausnahme mehr.
//
//   node scripts/diag-studio-huelle.cjs --selftest   die Täter eingespielt (ein Hand-Regler in der garage, eine eigene
//                                                    ready in der schmiede, der Element-Adapter in der klang, ein
//                                                    Werkstatt-Schieber im Stamm, die fachwerk ohne Kosten-Leiste, ein
//                                                    Hand-Regler im Gelände-Studio, eine eigene ready im terrain-Labor,
//                                                    das terrain-Labor ohne Sitzung)
//                                                    → jede Wand rot beim Namen
//   node scripts/diag-studio-huelle.cjs              der Baum gegen H1–H3
//   node scripts/diag-studio-huelle.cjs --bild <ordner> [--name vorher|nachher]
//                                                    je Studio die Shell im echten Browser (Hardware-Adapter): ein
//                                                    Schuss + die Seiten-Zählung (Schieber gesamt · davon Hülle · Undo
//                                                    wirkt · Kosten-Leiste zeigt Zahlen); Port STUDIO_HUELLE_PORT (8742)
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
// Die Welten auf der Hülle (Studios mit Reglern + die Nebenwelten mit der Brücke allein) und das Gelände-Studio, das als
// Panel über der Welt-Engine lebt (index.html?studio=gelaende: keine eigene Shell, keine Brücke — die Heimat IST die Welt).
const STUDIOS = ["garage", "schmiede", "portale", "klang", "fachwerk", "koerperstudio", "tetrapoda", "terrain"];
const NEBENWELTEN = ["skeleton", "fluid", "translated"];
const GELAENDE = "worlds/gelaende/studio.js";
const AUSGENOMMEN = {
    begegnung: "sandgesichert (CSP default-src 'none'), Protokoll: gate:portal-konformanz",
    schwarm: "sandgesichert (CSP default-src 'none'), Protokoll: gate:portal-konformanz",
};
// H4 — die Ofen-Studios: kind = der BAKERS_BY_KIND-Schlüssel, eigenbau = der eigene Leib in der Shell (ein Ruf des Bau-Gesetzes).
const OFEN_STUDIOS = { tetrapoda: { kind: "kreatur", eigenbau: /\b(?:bauTier|bauMensch|fellStreu)\s*\(/g } };
// Offen, benannt (kein Grün): das Körper-Labor baut noch seinen eigenen Menschen (bauMensch + Kleid-Gewichte im Labor,
// Synthese §3.6 Nr. 4) — 332 645 △ gegen die Welt-Zeile 40 000; die Wand nennt es in jedem Lauf.
const OFEN_OFFEN = { koerperstudio: "die Kleid-Gewichts-Vererbung lebt im Labor (koerperstudio.js), der Ofen trägt sie noch nicht — Labor L0 332 645 △ gegen die Welt-Zeile 40 000 (der Ofen-Leib seit welle-m-e-leib)" };
const HAND_RANGE_HTML = /<input\b[^>]*\btype\s*=\s*["']?range\b/gi;
const HAND_RANGE_JS = /\.type\s*=\s*["']range["']|\btype\s*:\s*["']range["']|<input[^>]*type\s*=\s*\\?["']?range/g;
const READY_LITERAL = /type\s*:\s*["']ready["']/g;
const ELEMENT_ADAPTER = /\(\s*op\s*&&\s*op\s*\[\s*0\s*\]\s*\)/g;

// Der Baum als Text-Karte (rel → Inhalt): die Wand und ihr Selbsttest lesen DIESELBE Karte.
function baum() {
    const karte = {};
    const w = path.join(ROOT, "worlds");
    for (const id of fs.readdirSync(w)) {
        const d = path.join(w, id);
        if (!fs.statSync(d).isDirectory()) continue;
        for (const f of fs.readdirSync(d)) {
            if (!/\.(html|js)$/.test(f)) continue;
            karte[`worlds/${id}/${f}`] = fs.readFileSync(path.join(d, f), "utf8");
        }
    }
    for (const f of stammLib.dateien(ROOT)) {
        const rel = path.relative(ROOT, f).split(path.sep).join("/");
        if (/^stamm\/23[a-z]?\.js$/.test(rel)) karte[rel] = fs.readFileSync(f, "utf8");
    }
    karte["index.html"] = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    return karte;
}

const zaehl = (t, rx) => (t.match(rx) || []).length;

function pruefe(karte) {
    const rot = [];
    const zahl = { handRegler: 0, bruecken: [], elementAdapter: 0 };
    for (const [rel, t] of Object.entries(karte)) {
        const m = /^worlds\/([^/]+)\//.exec(rel);
        const welt = m ? m[1] : null;
        if (welt === "huelle") continue;
        const ausgenommen = welt && AUSGENOMMEN[welt];
        // H1 — Hand-Regler
        const nH = /\.html$/.test(rel) ? zaehl(t, HAND_RANGE_HTML) : zaehl(t, HAND_RANGE_JS);
        if (nH && rel !== "index.html") {
            zahl.handRegler += nH;
            rot.push(`H1 ${rel}: ${nH} Hand-Regler (der EINE Generator ist AnazhHuelle.regler)`);
        }
        if (!welt) continue;
        // H2 — Brücken-Kopie
        const nR = zaehl(t, READY_LITERAL);
        if (nR) zahl.bruecken.push(`${welt}${ausgenommen ? " (" + ausgenommen.split(/[:(,]/)[0].trim() + ")" : ""}`);
        if (nR && !ausgenommen) rot.push(`H2 ${rel}: ${nR}× eine eigene ready-Meldung (die EINE Brücke ist AnazhHuelle.bruecke)`);
        const nE = zaehl(t, ELEMENT_ADAPTER);
        zahl.elementAdapter += nE;
        if (nE) rot.push(`H2 ${rel}: Element-Adapter op[0] (aus "gt" wird "g") — der DSL-Adapter der Hülle liest das Programm ganz`);
    }
    // H3 — der Umstieg
    for (const id of [...STUDIOS, ...NEBENWELTEN]) {
        const html = karte[`worlds/${id}/index.html`] || "";
        const js = Object.entries(karte)
            .filter(([r]) => r.startsWith(`worlds/${id}/`) && r.endsWith(".js"))
            .map(([, t]) => t)
            .join("\n");
        if (!/<script src="\.\.\/huelle\/huelle\.js\?v=[0-9.]+"><\/script>/.test(html)) rot.push(`H3 ${id}: lädt ../huelle/huelle.js nicht (mit ?v=)`);
        if (!/AnazhHuelle\.bruecke\(/.test(js + html)) rot.push(`H3 ${id}: ruft die Brücke der Hülle nicht (AnazhHuelle.bruecke)`);
        if (!STUDIOS.includes(id)) continue;
        if (!/<link rel="stylesheet" href="\.\.\/huelle\/huelle\.css\?v=[0-9.]+"/.test(html)) rot.push(`H3 ${id}: lädt die Tokens der Hülle nicht (../huelle/huelle.css)`);
        for (const [fn, was] of [
            ["regler", "Regler-Generator"],
            ["sitzung", "Sitzung (Undo/Redo · Same)"],
            ["kosten", "Kosten-Leiste je LOD-Stufe"],
        ])
            if (!new RegExp(`AnazhHuelle\\.${fn}\\(`).test(js)) rot.push(`H3 ${id}: ohne ${was} (AnazhHuelle.${fn})`);
    }
    // H4 — Labor = Welt
    for (const [id, o] of Object.entries(OFEN_STUDIOS)) {
        const html = karte[`worlds/${id}/index.html`] || "";
        const js = Object.entries(karte)
            .filter(([r]) => r.startsWith(`worlds/${id}/`) && r.endsWith(".js"))
            .map(([, t]) => t)
            .join("\n");
        if (!/<script src="\.\.\/\.\.\/foundry-core\.js\?v=[0-9.]+"><\/script>/.test(html)) rot.push(`H4 ${id}: lädt foundry-core nicht (der EINE Bäcker der Welt)`);
        if (!new RegExp(`BAKERS_BY_KIND\\.${o.kind}\\(`).test(js)) rot.push(`H4 ${id}: baut nicht über BAKERS_BY_KIND.${o.kind} (das Labor zeigt den Ofen-Körper)`);
        const eigen = js.match(o.eigenbau) || [];
        if (eigen.length) rot.push(`H4 ${id}: baut einen eigenen Leib (${[...new Set(eigen.map((x) => x.replace(/\s+/g, "")))].join(" · ")}) — ein Zwilling des Ofen-Körpers`);
    }
    zahl.ofenOffen = Object.entries(OFEN_OFFEN).map(([id, g]) => `${id}: ${g}`);
    // das Gelände-Studio: Regler, Sitzung und Kosten-Leiste der Hülle, die die Heimat VOR ihm lädt
    const gel = karte[GELAENDE] || "";
    for (const [fn, was] of [
        ["regler", "Regler-Generator"],
        ["sitzung", "Sitzung (Undo/Redo · Same)"],
        ["kosten", "Kosten-Leiste je LOD-Stufe"],
    ])
        if (!new RegExp(`AnazhHuelle\\.${fn}\\(`).test(gel)) rot.push(`H3 gelaende: ohne ${was} (AnazhHuelle.${fn})`);
    const heim = karte["index.html"] || "";
    const iH = heim.indexOf('src="worlds/huelle/huelle.js?v=');
    const iG = heim.indexOf('src="worlds/gelaende/studio.js?v=');
    if (iG >= 0 && !(iH >= 0 && iH < iG)) rot.push("H3 gelaende: die Heimat lädt worlds/huelle/huelle.js nicht vor worlds/gelaende/studio.js");
    const werkstatt = Object.entries(karte)
        .filter(([r]) => /^stamm\/23/.test(r))
        .map(([, t]) => t)
        .join("\n");
    const generatorRufe = zaehl(werkstatt, /AnazhHuelle\.regler\(/g);
    if (generatorRufe < 2) rot.push(`H3 Werkstatt (stamm/23*): ruft den Generator ${generatorRufe}× (Soll: Rezept-Regler UND Studio-Regler über AnazhHuelle.regler)`);
    if (!/<script src="worlds\/huelle\/huelle\.js\?v=[0-9.]+" defer><\/script>/.test(karte["index.html"] || ""))
        rot.push("H3 index.html: die Heimat lädt worlds/huelle/huelle.js nicht vor dem Stamm");
    return { rot, zahl };
}

function bericht(zahl) {
    console.log(`  Hand-Regler: ${zahl.handRegler} (die terrain-Familie ohne Ausnahme)`);
    console.log(`  eigene ready-Meldungen: ${zahl.bruecken.length} (${zahl.bruecken.join(", ") || "—"}) + die EINE der Hülle`);
    console.log(`  Labor = Welt (H4): ${Object.keys(OFEN_STUDIOS).join(", ")} zeigen den Ofen-Körper · OFFEN benannt: ${(zahl.ofenOffen || []).join(" | ") || "—"}`);
}

// ── SELBSTTEST: die Täter in die Karte gespielt (Fundstelle fehlt → rot, die Linse wandert mit dem Code) ──
function selbsttest() {
    const echt = baum();
    const faelle = [
        {
            name: "H1 ein Hand-Regler in der garage (index.html)",
            rel: "worlds/garage/index.html",
            vor: '<div id="sliders"></div>',
            nach: '<div id="sliders"><input type="range" id="sTaeter" min="0" max="1"></div>',
            soll: /^H1 worlds\/garage\/index\.html: 1 Hand-Regler/,
        },
        {
            name: "H1 ein Werkstatt-Schieber von Hand im Stamm (stamm/23b.js)",
            rel: Object.keys(echt).find((r) => /^stamm\/23b\.js$/.test(r)),
            vor: "_workshopRenderStudioParams(panel, bp) {",
            nach: '_workshopRenderStudioParams(panel, bp) {\n        const _t = document.createElement("input");\n        _t.type = "range";',
            soll: /^H1 stamm\/23b\.js: 1 Hand-Regler/,
        },
        {
            name: "H2 eine eigene ready in der schmiede",
            rel: "worlds/schmiede/schmiede.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'window.parent.postMessage({ type: "ready", world: "schmiede" }, "*");\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/schmiede\/schmiede\.js: 1× eine eigene ready/,
        },
        {
            name: "H2 der Element-Adapter in der klang (op[0] je Element)",
            rel: "worlds/klang/klang.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'var __t = function (op) { return String((op && op[0]) || op || ""); };\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/klang\/klang\.js: Element-Adapter/,
        },
        {
            name: "H3 die fachwerk ohne Kosten-Leiste",
            rel: "worlds/fachwerk/fachwerk.js",
            vor: "AnazhHuelle.kosten(",
            nach: "AnazhHuelle.__kostenFort(",
            soll: /^H3 fachwerk: ohne Kosten-Leiste/,
        },
        {
            name: "H4 das tetrapoda-Labor baut seinen eigenen Leib (bauTier + Fell-Streu)",
            rel: "worlds/tetrapoda/tetrapoda.js",
            vor: "BAKERS_BY_KIND.kreatur(",
            nach: "__tetrapodaCore.fellStreu(P, B.masse, B.fellOrt);__tetrapodaCore.bauTier(F, dials);BAKERS_BY_KIND.kreatur(",
            soll: /^H4 tetrapoda: baut einen eigenen Leib \((?:fellStreu\( · bauTier\(|bauTier\( · fellStreu\()\)/,
        },
        {
            name: "H4 das tetrapoda-Labor ohne den Bäcker der Welt (foundry-core)",
            rel: "worlds/tetrapoda/index.html",
            vor: "<script src=\"../../foundry-core.js?v=",
            nach: "<script src=\"../../foundry-zwilling.js?v=",
            soll: /^H4 tetrapoda: lädt foundry-core nicht/,
        },
        {
            name: "H1 ein Hand-Regler im Gelände-Studio",
            rel: GELAENDE,
            vor: "AnazhHuelle.regler(",
            nach: 'd.innerHTML = `<input type="range">`;\nAnazhHuelle.regler(',
            soll: /^H1 worlds\/gelaende\/studio\.js: \d+ Hand-Regler/,
        },
        {
            name: "H2 eine eigene ready im terrain-Labor",
            rel: "worlds/terrain/phytogenesis.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'foundryPost({ type: "ready", world: "terrain" });\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/terrain\/phytogenesis\.js: 1× eine eigene ready/,
        },
        {
            name: "H3 das terrain-Labor ohne Sitzung",
            rel: "worlds/terrain/phytogenesis.js",
            vor: "AnazhHuelle.sitzung(",
            nach: "AnazhHuelle.__sitzungFort(",
            soll: /^H3 terrain: ohne Sitzung/,
        },
        {
            name: "H3 das Gelände-Studio ohne Kosten-Leiste",
            rel: GELAENDE,
            vor: "AnazhHuelle.kosten(",
            nach: "AnazhHuelle.__kostenFort(",
            soll: /^H3 gelaende: ohne Kosten-Leiste/,
        },
    ];
    let ok = true;
    const basis = pruefe(echt);
    if (basis.rot.length) {
        console.log("❌ SELBST-TEST Ausgangslage: der echte Baum ist schon rot — " + basis.rot[0]);
        ok = false;
    }
    for (const f of faelle) {
        const t = f.rel && echt[f.rel];
        if (!t || !t.includes(f.vor)) {
            console.log(`❌ SELBST-TEST ${f.name} — Fundstelle fehlt (${f.rel}: ${f.vor.slice(0, 40)})`);
            ok = false;
            continue;
        }
        const karte = Object.assign({}, echt, { [f.rel]: t.split(f.vor).join(f.nach) });
        const r = pruefe(karte);
        const treffer = r.rot.find((x) => f.soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${f.name}${treffer ? " — " + treffer : " — nicht rot (" + (r.rot[0] || "grün") + ")"}`);
        if (!treffer) ok = false;
    }
    return ok;
}

// ── DAS BILD: je Studio die Shell im echten Browser, ein Schuss + die Zählung der Seite ──
async function bild(ordner, name) {
    const http = require("http");
    const puppeteer = require("puppeteer");
    const { echteWebGpuArgs } = require("./lib/software-gpu.cjs");
    const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742);
    const MIME = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".wasm": "application/wasm" };
    const s = http.createServer((req, res) => {
        const p = decodeURIComponent(req.url.split("?")[0]);
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    fs.mkdirSync(ordner, { recursive: true });
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 240000, args: [...echteWebGpuArgs(), "--use-angle=d3d11", "--window-size=1600,900"] });
    const zeilen = [];
    // je Studio seine Shell; das Gelände-Studio ist das Panel über der Welt-Engine (gezählt wird nur in ihm)
    const ziele = STUDIOS.map((id) => ({ id, url: `/worlds/${id}/index.html`, wurzel: null, ms: id === "koerperstudio" || id === "fachwerk" || id === "terrain" ? 9000 : 5000 }));
    ziele.push({ id: "gelaende", url: "/index.html?studio=gelaende", wurzel: "#gelaende-studio", ms: 15000 });
    const nur = process.argv.includes("--nur") ? process.argv[process.argv.indexOf("--nur") + 1].split(",") : null;
    try {
        for (const { id, url, wurzel, ms } of ziele) {
            if (nur && !nur.includes(id)) continue;
            const page = await browser.newPage();
            await page.setViewport({ width: 1600, height: 900 });
            const fehler = [];
            page.on("pageerror", (e) => fehler.push(String((e && e.message) || e).split("\n")[0].slice(0, 140)));
            const t0 = Date.now();
            await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: "load", timeout: 180000 });
            if (wurzel) await page.waitForSelector(wurzel, { timeout: 180000 }).catch(() => fehler.push(`${wurzel} erschien nicht in 180 s`));
            // über der Welt-Engine: der Ladeschirm hält jede Taste (stamm _ladeschirmSteht) — die Probe wartet, bis die Welt steht
            if (wurzel)
                await page
                    .waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._ladeschirmSteht === "function" && !window.anazhRealm._ladeschirmSteht(), { timeout: 240000, polling: 500 })
                    .catch(() => fehler.push("der Ladeschirm stand nach 240 s noch"));
            await new Promise((r) => setTimeout(r, ms));
            const z = await page.evaluate(async (wurzel) => {
                const W = (wurzel && document.querySelector(wurzel)) || document;
                const alle = [...W.querySelectorAll('input[type="range"]')];
                const huelle = alle.filter((i) => i.closest(".h-regler"));
                const r = { schieber: alle.length, huelle: huelle.length, sitzung: !!W.querySelector(".h-sitzung"), kosten: null, undo: null, gl: null };
                const k = [...W.querySelectorAll(".h-kosten-text, .h-kosten-zeile")].map((e) => e.textContent.trim()).filter(Boolean);
                r.kosten = k.length ? k.slice(0, 4) : null;
                const c = document.querySelector("canvas");
                if (c) {
                    const g = c.getContext("webgl2") || c.getContext("webgl");
                    const d = g && g.getExtension("WEBGL_debug_renderer_info");
                    r.gl = d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : null;
                }
                // Undo wirkt: der erste Hüllen-Schieber an seinen Rand, dann Strg+Z — der Wert kehrt zurück.
                const inp = huelle.find((i) => !i.disabled && i.closest("[data-sitzung]"));
                if (inp) {
                    const vor = inp.value;
                    inp.value = String(+inp.value === +inp.max ? inp.min : inp.max);
                    inp.dispatchEvent(new Event("input", { bubbles: true }));
                    await new Promise((res) => setTimeout(res, 900));
                    const mitte = inp.value;
                    window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }));
                    await new Promise((res) => setTimeout(res, 900));
                    r.undo = { vor, mitte, nach: inp.value, wirkt: inp.value === vor && mitte !== vor, marke: [...document.querySelectorAll("#presets .on, #presets .active")].map((b) => b.textContent).join("|") };
                }
                return r;
            }, wurzel);
            await new Promise((r) => setTimeout(r, 1500));
            const datei = path.join(ordner, `${name}-${id}.png`);
            await page.screenshot({ path: datei });
            z.fehler = fehler;
            z.ladeS = +((Date.now() - t0) / 1000).toFixed(1);
            zeilen.push({ id, ...z });
            // H4 im Bild: die gezeigte L0 eines Ofen-Studios liegt auf der Welt-Zeile (Kosten-Leiste „N / Deckel △")
            const l0 = /([\d.]+) \/ ([\d.]+) △/.exec((z.kosten || []).find((k) => /△/.test(k)) || "");
            if (OFEN_STUDIOS[id] || OFEN_OFFEN[id]) {
                const n = l0 ? +l0[1].replace(/\./g, "") : NaN,
                    deckel = l0 ? +l0[2].replace(/\./g, "") : NaN;
                z.laborWelt = { l0: n, zeile: deckel };
                if (!(n <= deckel)) {
                    if (OFEN_OFFEN[id]) console.log(`  OFFEN benannt H4 ${id}: Labor L0 ${n} △ über der Welt-Zeile ${deckel}`);
                    else {
                        console.log(`❌ H4 ${id}: Labor L0 ${n} △ über der Welt-Zeile ${deckel} — das Labor zeigt nicht den Ofen-Körper`);
                        process.exitCode = 1;
                    }
                }
            }
            console.log(`  ${id.padEnd(14)} Schieber ${z.schieber} (Hülle ${z.huelle}) · Sitzung ${z.sitzung ? "ja" : "nein"} · Undo ${z.undo ? (z.undo.wirkt ? "wirkt" : "STUMM") : "—"} · Kosten ${z.kosten ? z.kosten[0] : "—"} · Fehler ${fehler.length} · ${z.gl || "?"}`);
            await page.close();
        }
    } finally {
        await browser.close();
        s.close();
    }
    fs.writeFileSync(path.join(ordner, `${name}-zaehlung.json`), JSON.stringify(zeilen, null, 2));
}

(async () => {
    const a = process.argv;
    if (a.includes("--bild")) {
        const i = a.indexOf("--bild");
        const n = a.includes("--name") ? a[a.indexOf("--name") + 1] : "nachher";
        await bild(path.resolve(a[i + 1]), n);
        return;
    }
    if (a.includes("--selftest")) process.exit(selbsttest() ? 0 : 1);
    const { rot, zahl } = pruefe(baum());
    console.log("Studio-Hülle: H1 Hand-Regler · H2 Brücken-Kopie · H3 Umstieg (Studios: " + STUDIOS.join(", ") + "; Nebenwelten: " + NEBENWELTEN.join(", ") + ")");
    bericht(zahl);
    if (rot.length) {
        for (const x of rot) console.log("❌ " + x);
        process.exit(1);
    }
    console.log(`✅ gate:studio-huelle: ${STUDIOS.length} Studios + ${NEBENWELTEN.length} Nebenwelten auf der EINEN Hülle, kein Hand-Regler, keine Brücken-Kopie`);
})().catch((e) => {
    console.error("studio-huelle-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
