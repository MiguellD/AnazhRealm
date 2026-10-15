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
//                     bauMensch · morphAuf · fellStreu · haarStreu · kleidZonen · surfaceNets in der Shell — K45: das tetrapoda-
//                     Labor zeigte 1 299 852 △ gegen die Welt-Zeile 62 000, K45-2: das koerperstudio-Labor 332 645 △ gegen
//                     40 000). Im Bild (--bild) ist L0 der Kosten-Leiste über der Budget-Zeile ROT. Keine Ausnahme.
//   H5 Ziel-Bild      jede Welt der Hülle trägt ihr Panorama (die Tor-Membran der Heimat liest es, D8) im Export
//                     worlds/tor-ziele.json, gebacken an den Quellen von HEUTE (Stempel SHA-256, `?v=` fällt); ohne
//                     Bild benannt: die übersetzte Welt (ihre Szene reist im enter) und die sandgesicherten
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
//   node scripts/diag-studio-huelle.cjs              der Baum gegen H1–H5
//   node scripts/diag-studio-huelle.cjs --panorama [welt,…]   H5: je Welt der Hülle ihr Ziel-Bild backen (worlds/<welt>/panorama.f16,
//                                                    der Stempel in worlds/tor-ziele.json); LINSE_GPU=software wie die CI
//   node scripts/diag-studio-huelle.cjs --bild <ordner> [--name vorher|nachher]
//                                                    je Studio die Shell im echten Browser (Hardware-Adapter): ein
//                                                    Schuss + die Seiten-Zählung (Schieber gesamt · davon Hülle · Undo
//                                                    wirkt · Kosten-Leiste zeigt Zahlen); Port STUDIO_HUELLE_PORT (8742)
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
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
// Der eigene Leib = ein Ruf des Bau-Gesetzes in der Shell (Teile-Baum, Morph, Streu, Kleid-Zonen, Hüllen-Maschine) — nur der Ofen
// ruft sie. Keine Ausnahme mehr (K45-2: das Körper-Labor baut über BAKERS_BY_KIND.koerper, die Kleid-Gewichte leben im Ofen).
const EIGENBAU = /\b(?:bauTier|bauMensch|morphAuf|fellStreu|haarStreu|kleidZonen|surfaceNets)\s*\(/g;
const OFEN_STUDIOS = { tetrapoda: { kind: "kreatur", eigenbau: EIGENBAU }, koerperstudio: { kind: "koerper", eigenbau: EIGENBAU } };
const HAND_RANGE_HTML = /<input\b[^>]*\btype\s*=\s*["']?range\b/gi;
const HAND_RANGE_JS = /\.type\s*=\s*["']range["']|\btype\s*:\s*["']range["']|<input[^>]*type\s*=\s*\\?["']?range/g;
const READY_LITERAL = /type\s*:\s*["']ready["']/g;
const ELEMENT_ADAPTER = /\(\s*op\s*&&\s*op\s*\[\s*0\s*\]\s*\)/g;
// H5 — DAS ZIEL-BILD (D8, „Das Tor als Fenster"): jede Welt der Hülle rendert ihr Panorama in IHRER Welt (die Brücke
// `panorama-bitte` → `AnazhHuelle.panorama`, Labor = Welt), gebacken je SHA ihrer Quellen (`--panorama`) und geliefert als
// Datei; die Heimat liest sie (stamm `_torZielBuendel`) und bootet nie eine Ziel-Welt. Die Karte `worlds/tor-ziele.json` nennt je
// Welt Datei und Stempel = SHA-256 über index.html und jede lokale Quelle, die sie lädt (Skript, Stil; `?v=` fällt — die
// Version allein macht kein neues Bild). Ein Stempel, der nicht die Quellen von HEUTE trägt, ist ROT beim Namen; die
// ausgenommenen Welten stehen benannt unter `ohne`.
const TOR_ZIELE = "worlds/tor-ziele.json";
// Ohne Ziel-Bild, benannt: die sandgesicherten Welten (kein Skript, kein Renderer) und die übersetzte Welt (ihre Szene ist
// Spieler-Daten und reist erst im enter — vor dem Betreten hat sie kein Bild; jedes Tor auf sie zeigt kein Fenster).
const OHNE_PANORAMA = Object.assign(
    { translated: "die Szene ist Spieler-Daten und reist erst im enter (stamm PORTAL_TRANSLATED_WORLD) — vor dem Betreten kein Bild" },
    AUSGENOMMEN
);
const PANO = { format: 1, w: 512, h: 256 };
const panoDatei = (id) => `worlds/${id}/panorama.f16`;
const crypto = require("crypto");
// Die Quellen einer Welt in der Reihe ihrer index.html (rel zur Wurzel); `lies(rel)` liest Text (die Karte oder die Platte).
function quellenDerWelt(id, lies) {
    const basis = `worlds/${id}`;
    const html = lies(`${basis}/index.html`);
    if (html == null) return null;
    const rels = [`${basis}/index.html`];
    const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"'?#]+)|<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=\s*["']([^"'?#]+)/gi;
    for (let m = re.exec(html); m; m = re.exec(html)) {
        const q = m[1] || m[2];
        if (/^(?:[a-z][\w+.-]*:)?\/\//i.test(q)) continue;
        const rel = path.posix.normalize(path.posix.join(basis, q));
        if (!rels.includes(rel)) rels.push(rel);
    }
    return rels;
}
function panoramaStempel(id, lies) {
    const rels = quellenDerWelt(id, lies);
    if (!rels) return null;
    const h = crypto.createHash("sha256");
    h.update(`panorama ${PANO.format} ${PANO.w}x${PANO.h}\n`);
    for (const rel of rels) {
        const t = lies(rel);
        if (t == null) return null;
        h.update(`${rel}\n${crypto.createHash("sha256").update(t.replace(/\?v=[\w.-]+/g, "")).digest("hex")}\n`);
    }
    return h.digest("hex");
}
const liesAus = (karte) => (rel) => {
    if (Object.prototype.hasOwnProperty.call(karte, rel)) return karte[rel];
    const f = path.join(ROOT, rel);
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
};

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
    if (fs.existsSync(path.join(ROOT, TOR_ZIELE))) karte[TOR_ZIELE] = fs.readFileSync(path.join(ROOT, TOR_ZIELE), "utf8");
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
    // H5 — das Ziel-Bild je Welt, gebacken an den Quellen von heute
    let K = null;
    try {
        K = JSON.parse(karte[TOR_ZIELE]);
    } catch (e) {
        rot.push(`H5 ${TOR_ZIELE}: ${karte[TOR_ZIELE] == null ? "fehlt" : "kein JSON (" + e.message + ")"} — node scripts/diag-studio-huelle.cjs --panorama`);
    }
    zahl.panorama = 0;
    if (K) {
        if (K.format !== PANO.format || K.w !== PANO.w || K.h !== PANO.h)
            rot.push(`H5 ${TOR_ZIELE}: Format ${K.format} ${K.w}×${K.h} statt ${PANO.format} ${PANO.w}×${PANO.h}`);
        const welten = K.welten || {},
            ohne = K.ohne || {};
        const lies = liesAus(karte);
        const soll = [...STUDIOS, ...NEBENWELTEN].filter((id) => !OHNE_PANORAMA[id]);
        for (const id of soll) {
            const key = `worlds/${id}/index.html`;
            const e = welten[key];
            const bitte = `node scripts/diag-studio-huelle.cjs --panorama ${id}`;
            if (!e) {
                rot.push(`H5 ${id}: kein Panorama im Export (${TOR_ZIELE}) — ${bitte}`);
                continue;
            }
            if (e.datei !== panoDatei(id)) rot.push(`H5 ${id}: die Datei heißt ${e.datei} statt ${panoDatei(id)}`);
            const f = path.join(ROOT, e.datei || panoDatei(id));
            const groesse = fs.existsSync(f) ? fs.statSync(f).size : -1;
            if (groesse !== PANO.w * PANO.h * 8)
                rot.push(`H5 ${id}: ${e.datei} trägt ${groesse < 0 ? "keine Datei" : groesse + " Bytes"} statt ${PANO.w * PANO.h * 8} (rgba16float ${PANO.w}×${PANO.h}) — ${bitte}`);
            const heute = panoramaStempel(id, lies);
            if (e.stempel !== heute)
                rot.push(`H5 ${id}: das Panorama ist veraltet (Stempel ${String(e.stempel).slice(0, 12)} ≠ Quellen ${String(heute).slice(0, 12)}) — ${bitte}`);
            else zahl.panorama++;
        }
        for (const key of Object.keys(welten))
            if (!soll.some((id) => key === `worlds/${id}/index.html`)) rot.push(`H5 ${key}: ein Panorama ohne Welt der Hülle (verwaist)`);
        for (const [id, grund] of Object.entries(OHNE_PANORAMA))
            if (!ohne[`worlds/${id}/index.html`]) rot.push(`H5 ${id}: steht nicht benannt unter ohne (${grund})`);
        for (const key of Object.keys(ohne))
            if (!Object.keys(OHNE_PANORAMA).some((id) => key === `worlds/${id}/index.html`)) rot.push(`H5 ${key}: unter ohne, aber keine ausgenommene Welt`);
    }
    return { rot, zahl };
}

function bericht(zahl) {
    console.log(`  Hand-Regler: ${zahl.handRegler} (die terrain-Familie ohne Ausnahme)`);
    console.log(`  eigene ready-Meldungen: ${zahl.bruecken.length} (${zahl.bruecken.join(", ") || "—"}) + die EINE der Hülle`);
    console.log(`  Labor = Welt (H4): ${Object.keys(OFEN_STUDIOS).join(", ")} zeigen den Ofen-Körper (keine Ausnahme)`);
    console.log(`  Ziel-Bild (H5): ${zahl.panorama} von ${STUDIOS.length + NEBENWELTEN.length - Object.keys(OHNE_PANORAMA).filter((id) => !AUSGENOMMEN[id]).length} Panoramen an den Quellen von heute (${TOR_ZIELE}), ohne: ${Object.keys(OHNE_PANORAMA).join(", ")}`);
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
            vor: /(_workshopRenderStudioParams\([^)]*\) \{)/,
            nach: '$1\n        const _t = document.createElement("input");\n        _t.type = "range";',
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
            name: "H4 das koerperstudio-Labor baut seinen eigenen Menschen (bauMensch + Haar-Streu)",
            rel: "worlds/koerperstudio/koerperstudio.js",
            vor: "BAKERS_BY_KIND.koerper(",
            nach: "KC.bauMensch(F);KC.haarStreu(params);BAKERS_BY_KIND.koerper(",
            soll: /^H4 koerperstudio: baut einen eigenen Leib \((?:bauMensch\( · haarStreu\(|haarStreu\( · bauMensch\()\)/,
        },
        {
            name: "H4 das koerperstudio-Labor ohne den Bäcker der Welt (foundry-core)",
            rel: "worlds/koerperstudio/index.html",
            vor: '<script src="../../foundry-core.js?v=',
            nach: '<script src="../../foundry-zwilling.js?v=',
            soll: /^H4 koerperstudio: lädt foundry-core nicht/,
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
        {
            name: "H5 eine Quelle der garage ändert sich, ihr Panorama bleibt (veraltet)",
            rel: "worlds/garage/garage.js",
            vor: "AnazhHuelle.bruecke(",
            nach: "/* ein neuer Look */ AnazhHuelle.bruecke(",
            soll: /^H5 garage: das Panorama ist veraltet/,
        },
        {
            name: "H5 eine geteilte Quelle (die Hülle) ändert sich — jede Welt veraltet",
            rel: "worlds/huelle/huelle.js",
            vor: "function panorama(",
            nach: "function panoramaNeu() {}\n    function panorama(",
            soll: /^H5 skeleton: das Panorama ist veraltet/,
        },
        {
            name: "H5 die Version allein macht kein neues Bild (?v= fällt) — die fachwerk bleibt grün",
            rel: "worlds/fachwerk/index.html",
            vor: /\?v=[0-9.]+/g,
            nach: "?v=99.999.9",
            soll: null,
            nichtRot: /^H5 fachwerk/,
        },
        {
            name: "H5 der Export ohne die fachwerk",
            rel: TOR_ZIELE,
            vor: '"worlds/fachwerk/index.html": {',
            nach: '"worlds/fachwerk-fort/index.html": {',
            soll: /^H5 fachwerk: kein Panorama im Export/,
        },
        {
            name: "H5 eine ausgenommene Welt nicht benannt (begegnung fehlt unter ohne)",
            rel: TOR_ZIELE,
            vor: '"worlds/begegnung/index.html":',
            nach: '"worlds/begegnung-fort/index.html":',
            soll: /^H5 begegnung: steht nicht benannt unter ohne/,
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
        const am = f.vor instanceof RegExp; // ein Methoden-Kopf am NAMEN (gate:apparat Klinge 3)
        if (!t || !(am ? f.vor.test(t) : t.includes(f.vor))) {
            console.log(`❌ SELBST-TEST ${f.name} — Fundstelle fehlt (${f.rel}: ${String(f.vor).slice(0, 40)})`);
            ok = false;
            continue;
        }
        const karte = Object.assign({}, echt, { [f.rel]: am ? t.replace(f.vor, f.nach) : t.split(f.vor).join(f.nach) });
        const r = pruefe(karte);
        if (f.nichtRot) {
            const falsch = r.rot.find((x) => f.nichtRot.test(x));
            console.log(`${falsch ? "❌" : "✅"} SELBST-TEST ${f.name}${falsch ? " — rot: " + falsch : ""}`);
            if (falsch) ok = false;
            continue;
        }
        const treffer = r.rot.find((x) => f.soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${f.name}${treffer ? " — " + treffer : " — nicht rot (" + (r.rot[0] || "grün") + ")"}`);
        if (!treffer) ok = false;
    }
    return ok;
}

// ── DAS BILD: je Studio die Shell im echten Browser, ein Schuss + die Zählung der Seite ──
async function bild(ordner, name) {
    const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742);
    const s = statikServer();
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    fs.mkdirSync(ordner, { recursive: true });
    const browser = await starteBrowser({ art: "echt", frist: 240000, zusatz: ["--use-angle=d3d11", "--window-size=1600,900"] });
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
            if (OFEN_STUDIOS[id]) {
                const n = l0 ? +l0[1].replace(/\./g, "") : NaN,
                    deckel = l0 ? +l0[2].replace(/\./g, "") : NaN;
                z.laborWelt = { l0: n, zeile: deckel };
                if (!(n <= deckel)) {
                    console.log(`❌ H4 ${id}: Labor L0 ${n} △ über der Welt-Zeile ${deckel} — das Labor zeigt nicht den Ofen-Körper`);
                    process.exitCode = 1;
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

// ── DAS ZIEL-BILD BACKEN (H5, `--panorama [welt,…]`): je Welt der Hülle ihre Seite in einem Rahmen (die Heimat ist eine leere
// Seite derselben Herkunft), ihre Brücke meldet `ready`, die Welt wächst, dann `panorama-bitte` → `panorama` (Halbfloat-Texel aus
// IHREM Renderer, `AnazhHuelle.panorama`). Die Datei `worlds/<welt>/panorama.f16` (rgba16float 512 × 256, Zeile 0 unten) und ihr
// Stempel in `worlds/tor-ziele.json`. Der Adapter folgt der Weiche der WebGL-Linsen (LINSE_GPU=software: swiftshader wie die
// CI, ohne GPU-Schloss). Port STUDIO_HUELLE_PORT (8742).
async function panoramaBacken(nur) {
    const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742);
    const s = statikServer({ seiten: { "/__panorama.html": '<!DOCTYPE html><meta charset="utf-8"><title>Panorama</title><body style="margin:0"></body>' } });
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    const kp = path.join(ROOT, TOR_ZIELE);
    const K = fs.existsSync(kp) ? JSON.parse(fs.readFileSync(kp, "utf8")) : {};
    const neu = { format: PANO.format, w: PANO.w, h: PANO.h, welten: K.welten || {}, ohne: {} };
    for (const [id, grund] of Object.entries(OHNE_PANORAMA)) neu.ohne[`worlds/${id}/index.html`] = grund;
    for (const k of Object.keys(neu.welten)) if (!k.startsWith("worlds/") || OHNE_PANORAMA[k.split("/")[1]]) delete neu.welten[k];
    const browser = await starteBrowser({ art: "webgl", frist: 300000, zusatz: ["--window-size=1400,900"] });
    const lies = liesAus({});
    let rot = 0;
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        const fehler = [];
        page.on("pageerror", (e) => fehler.push(String((e && e.message) || e).split("\n")[0].slice(0, 160)));
        await page.goto(`http://127.0.0.1:${PORT}/__panorama.html`, { waitUntil: "load" });
        const adapter = await page.evaluate(() => {
            const g = document.createElement("canvas").getContext("webgl2");
            const d = g && g.getExtension("WEBGL_debug_renderer_info");
            return g ? String(d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER)) : "kein webgl2";
        });
        console.log(`Panorama backen auf ${adapter}`);
        for (const id of [...STUDIOS, ...NEBENWELTEN]) {
            if (OHNE_PANORAMA[id] || (nur && !nur.includes(id))) continue;
            const t0 = Date.now();
            const reift = id === "koerperstudio" || id === "fachwerk" || id === "terrain" ? 9000 : 4000;
            try {
                const P = await page.evaluate(
                    (url, reift, frist) =>
                        new Promise((ja, nein) => {
                            const f = document.createElement("iframe");
                            f.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:720px;border:0";
                            const reqId = `backen-${Date.now()}`;
                            const ende = (e, x) => {
                                clearTimeout(uhr);
                                removeEventListener("message", hoer);
                                f.remove();
                                if (e) nein(e);
                                else ja(x);
                            };
                            const hoer = (ev) => {
                                if (ev.source !== f.contentWindow) return;
                                const m = ev.data;
                                if (!m || typeof m !== "object") return;
                                if (m.type === "ready")
                                    setTimeout(() => f.contentWindow.postMessage({ type: "panorama-bitte", reqId }, "*"), reift);
                                else if (m.type === "panorama" && m.reqId === reqId) {
                                    if (m.fehler) return ende(new Error(`die Welt meldet: ${m.fehler}`));
                                    const u8 = new Uint8Array(m.daten.buffer, m.daten.byteOffset, m.daten.byteLength);
                                    let b = "";
                                    for (let i = 0; i < u8.length; i += 0x8000) b += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
                                    ende(null, { w: m.w, h: m.h, b64: btoa(b) });
                                }
                            };
                            const uhr = setTimeout(() => ende(new Error(`kein Panorama nach ${frist / 1000} s`)), frist);
                            addEventListener("message", hoer);
                            f.src = url;
                            document.body.appendChild(f);
                        }),
                    `/worlds/${id}/index.html`,
                    reift,
                    180000
                );
                const buf = Buffer.from(P.b64, "base64");
                if (P.w !== PANO.w || P.h !== PANO.h || buf.length !== PANO.w * PANO.h * 8)
                    throw new Error(`das Panorama trägt ${P.w}×${P.h} (${buf.length} Bytes) statt ${PANO.w}×${PANO.h}`);
                const u16 = new Uint16Array(buf.buffer, buf.byteOffset, buf.length / 2);
                let hell = 0;
                for (let i = 0; i < u16.length; i += 4) if ((u16[i] & 0x7fff) + (u16[i + 1] & 0x7fff) + (u16[i + 2] & 0x7fff) > 0) hell++;
                if (hell < (PANO.w * PANO.h) / 4) throw new Error(`das Panorama ist leer (${hell} Texel mit Licht)`);
                fs.writeFileSync(path.join(ROOT, panoDatei(id)), buf);
                neu.welten[`worlds/${id}/index.html`] = { datei: panoDatei(id), stempel: panoramaStempel(id, lies), adapter };
                console.log(`  ✅ ${id.padEnd(14)} ${panoDatei(id)} · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${hell} Texel mit Licht`);
            } catch (e) {
                rot++;
                console.log(`  ❌ ${id.padEnd(14)} ${(e && e.message) || e}${fehler.length ? " · Seite: " + fehler.slice(-2).join(" | ") : ""}`);
            }
            fehler.length = 0;
        }
    } finally {
        await browser.close();
        s.close();
    }
    const sortiert = {};
    for (const k of Object.keys(neu.welten).sort()) sortiert[k] = neu.welten[k];
    neu.welten = sortiert;
    fs.writeFileSync(kp, JSON.stringify(neu, null, 4) + "\n");
    if (rot) process.exitCode = 1;
}

(async () => {
    const a = process.argv;
    if (a.includes("--panorama")) {
        const n = a[a.indexOf("--panorama") + 1];
        await panoramaBacken(n && !n.startsWith("--") ? n.split(",") : null);
        return;
    }
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
