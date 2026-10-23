#!/usr/bin/env node
// diag-studio-huelle.cjs — DIE WAND DER STUDIO-HÜLLE (Studio-Welle 1, K41; Welle 2, K47 die terrain-Familie; Synthese §2.1
// W4a, gate:studio-huelle).
//
// EIN UI-Modul (worlds/huelle/huelle.js) trägt die Regler, die Sitzung (Undo/Redo · Same · Sperre), die Kosten-Leiste
// und die Portal-Brücke aller umgestiegenen Studios UND der Welt-Werkstatt. Die Wand nennt jede Kopie beim Namen:
//   H1 Hand-Regler    ein <input type="range"> von Hand in worlds/<welt>/index.html, ein `type = "range"` in einer Shell
//                     oder in den Werkstatt-Dateien des Stamms (am Regler-Glied) — der EINE Generator ist AnazhHuelle.regler
//   H2 Brücken-Kopie  eine eigene ready-Meldung (`type: "ready"`) oder ein Element-Adapter (`op[0]` je Element des
//                     Programms) außerhalb der Hülle — die EINE Brücke ist AnazhHuelle.bruecke
//   H3 Umstieg        (D3: die Text-Präsenz fiel) die Brücke beweist gate:portal-konformanz je Betreten (readyEcho), die
//                     Sitzung je Studio der Gang (--engine: Strg+Z nimmt den Schieber zurück)
//   H4 Labor = Welt   ein Ofen-Studio (MESHFREI-Kern, die Welt bäckt seine Gestalt über BAKERS_BY_KIND) zeigt den Ofen-Körper
//                     (K45: das tetrapoda-Labor zeigte 1 299 852 △ gegen die Welt-Zeile 62 000, K45-2: das koerperstudio-Labor
//                     332 645 △ gegen 40 000) — am Verhalten im Gang (--engine): L0 der Kosten-Leiste über der Welt-Zeile ist ROT.
//   H5 Ziel-Bild      jede Welt der Hülle trägt ihr Panorama (die Tor-Membran der Heimat liest es, D8) im Export
//                     worlds/tor-ziele.json, gebacken an den Quellen von HEUTE (Stempel SHA-256, `?v=` fällt); ohne
//                     Bild benannt: die übersetzte Welt (ihre Szene reist im enter) und die sandgesicherten
//   H6 EINE ENGINE    (Netz, --engine) die Studio-SEITE worlds/<welt>/index.html im Browser, gezählt ihre Anfragen: eine
//                     Engine-Kopie im Studio-Baum (worlds/*/lib/) oder das r160-UMD (vendor/three.min.js) ist ROT beim
//                     Namen, wer three lädt, lädt die der Welt (vendor/three.webgpu, r184); lädt die Seite die Welt
//                     (index.html, stamm/), ist die isolierte Bühne aufgelöst — ROT. Wer noch fremd lädt, steht in der Ratsche.
// Ausgenommen, benannt: die zwei sandgesicherten Welten begegnung + schwarm (CSP default-src 'none': sie laden kein
// Skript, ihr Protokoll richtet gate:portal-konformanz). Die terrain-Familie (terrain + gelaende) trägt seit K47 keine
// Ausnahme mehr.
//
//   node scripts/diag-studio-huelle.cjs --selftest   die Täter eingespielt (je Wand H1–H6 die Fälle in `selbsttest`) → rot beim Namen
//   node scripts/diag-studio-huelle.cjs              der Baum gegen H1–H5
//   node scripts/diag-studio-huelle.cjs --panorama [welt,…]   H5: je Welt der Hülle ihr Ziel-Bild backen (worlds/<welt>/panorama.f16,
//                                                    der Stempel in worlds/tor-ziele.json); auf der echten GPU (Lehre 17)
//   node scripts/diag-studio-huelle.cjs --engine     DER GANG je Seite der Hülle: ihre Anfragen (H6), ihre Sitzung (H3),
//                                                    die L0 eines Ofen-Labors (H4); Port STUDIO_HUELLE_PORT (8742)
"use strict";
const { statikServer, starteBrowser, ROOT } = require("./lib/welt-boot.cjs");
const { istHardwareAdapter } = require("./lib/software-gpu.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

// Die Welten auf der Hülle (Studios mit Reglern + die Nebenwelten mit der Brücke allein) und das Gelände-Studio, das als
// Panel über der Welt-Engine lebt (index.html?studio=gelaende: keine eigene Shell, keine Brücke — die Heimat IST die Welt).
const STUDIOS = ["garage", "schmiede", "portale", "klang", "fachwerk", "koerperstudio", "tetrapoda", "terrain"];
const NEBENWELTEN = ["skeleton", "fluid", "translated"];
const GELAENDE = "worlds/gelaende/studio.js";
const AUSGENOMMEN = {
    begegnung: "sandgesichert (CSP default-src 'none'), Protokoll: gate:portal-konformanz",
    schwarm: "sandgesichert (CSP default-src 'none'), Protokoll: gate:portal-konformanz",
};
// H4 — die Ofen-Studios: kind = der BAKERS_BY_KIND-Schlüssel; der Gang liest ihre L0 an der Kosten-Leiste (keine Ausnahme).
const OFEN_STUDIOS = { tetrapoda: { kind: "kreatur" }, koerperstudio: { kind: "koerper" } };
const HAND_RANGE_HTML = /<input\b[^>]*\btype\s*=\s*["']?range\b/gi;
const HAND_RANGE_JS = /\.type\s*=\s*["']range["']|\btype\s*:\s*["']range["']|<input[^>]*type\s*=\s*\\?["']?range/g;
const READY_LITERAL = /type\s*:\s*["']ready["']/g;
const ELEMENT_ADAPTER = /\(\s*op\s*&&\s*op\s*\[\s*0\s*\]\s*\)/g;
// H6 — EINE ENGINE: die Pfade der Anfragen einer Seite; die Ratsche nennt, wer noch fremd lädt (sie zieht nur an).
const ENGINE_FREMD = /^\/(?:worlds\/[^/]+\/lib\/[^/]+|vendor\/three\.min\.js)$/;
const ENGINE_EINE = "/vendor/three.webgpu.min.js";
const WELT_GELADEN = /^\/(?:index\.html)?$|^\/stamm\//;
const ENGINE_RATSCHE = { schmiede: "r128", portale: "r128", fachwerk: "r128", koerperstudio: "r128", tetrapoda: "r128", terrain: "r128", fluid: "r183", translated: "r130" };
// Der Spruch des Gangs (pure Funktion, Gang UND Selbsttest): `netz` je Seite die Pfade ihrer Anfragen (H6), `seiten` je Seite
// ihre Sitzung (H3: der erste Hüllen-Schieber an seinen Rand, Strg+Z — der Wert kehrt zurück) und die gezeigte L0 eines
// Ofen-Studios gegen seine Welt-Zeile (H4, die Kosten-Leiste „N / Deckel △").
function pruefeGang(netz, seiten = {}) {
    const rot = [];
    for (const [id, pfade] of Object.entries(netz)) {
        const fremd = [...new Set(pfade.filter((p) => ENGINE_FREMD.test(p)))];
        const welt = pfade.filter((p) => WELT_GELADEN.test(p));
        const ratsche = ENGINE_RATSCHE[id];
        if (welt.length)
            rot.push(`H6 ${id}: die Seite lädt die Welt (${welt.slice(0, 2).join(", ")}) — ein Studio bleibt die isolierte Bühne, nie ein Modus der offenen Welt`);
        if (fremd.length && !ratsche)
            rot.push(`H6 ${id}: die Seite lädt eine fremde Engine (${fremd.slice(0, 3).join(", ")}) statt der EINEN der Welt (${ENGINE_EINE}, r184)`);
        else if (!fremd.length && ratsche)
            rot.push(`H6 ${id}: lädt keine fremde Engine mehr (${ratsche} fiel) — die Ratsche zieht an, ${id} fällt aus ENGINE_RATSCHE`);
        else if (!fremd.length && pfade.some((p) => /^\/vendor\/three/.test(p)) && !pfade.includes(ENGINE_EINE))
            rot.push(`H6 ${id}: three aus vendor/ ohne ${ENGINE_EINE} — die Welt rendert WebGPU r184`);
    }
    for (const [id, { undo: u, l0, zeile }] of Object.entries(seiten)) {
        if (!u && STUDIOS.includes(id)) rot.push(`H3 ${id}: das Studio trägt keine Sitzung (kein Hüllen-Schieber mit Strg+Z)`);
        else if (u && !(u.nach === u.vor && u.mitte !== u.vor))
            rot.push(`H3 ${id}: die Sitzung ist stumm (Schieber ${u.vor} → ${u.mitte}, Strg+Z → ${u.nach}) — das Rückgängig der Hülle wirkt nicht`);
        if (OFEN_STUDIOS[id] && !(l0 <= zeile))
            rot.push(`H4 ${id}: Labor L0 ${l0} △ über der Welt-Zeile ${zeile} — das Labor zeigt nicht den Ofen-Körper`);
    }
    return rot;
}
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

// Die Werkstatt-Dateien des Stamms: die Dateien, die die Regler-Glieder der Werkstatt tragen (am Glied, nie am Datei-Namen).
const REGLER_GLIED = "_workshopRenderStudioParams";
const WERKSTATT = new Set(["_workshopRenderRecipePanel", REGLER_GLIED].map((m) => stammLib.dateiVon(ROOT, m)));
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
    for (const rel of WERKSTATT) karte[rel] = fs.readFileSync(path.join(ROOT, rel), "utf8");
    if (fs.existsSync(path.join(ROOT, TOR_ZIELE))) karte[TOR_ZIELE] = fs.readFileSync(path.join(ROOT, TOR_ZIELE), "utf8");
    return karte;
}

function pruefe(karte) {
    const rot = [];
    // VERALTET sperrt nicht (D8-Merge, wie K5): ein Panorama, dessen Quellen sich seither änderten, steht benannt
    // „veraltet“, bis jemand backt (`--panorama`) — sonst sperrte jede Welle an einer Studio-Quelle, der Hülle oder einem Kern check:statik
    const veraltet = [];
    const zahl = { handRegler: 0, bruecken: [] };
    // H1/H2 sind Absenzen über den EINEN Helfer (stammLib.fehlt, kommentarfrei): der Text der Karte, der Täter mit Datei und
    // Zeile; ein eingespielter Täter des Selbsttests liest dieselbe Karte.
    const fehltIn = (rel, rx) => stammLib.fehlt(null, rx, { datei: rel, wandel: karte[rel] });
    for (const rel of Object.keys(karte)) {
        const m = /^worlds\/([^/]+)\//.exec(rel);
        const welt = m ? m[1] : null;
        if (welt === "huelle" || !/\.(html|js)$/.test(rel)) continue;
        const ausgenommen = welt && AUSGENOMMEN[welt];
        // H1 — Hand-Regler
        if (!fehltIn(rel, /\.html$/.test(rel) ? HAND_RANGE_HTML : HAND_RANGE_JS)) {
            zahl.handRegler++;
            rot.push(`H1 ${stammLib.fehlt.wo}: ein Hand-Regler (der EINE Generator ist AnazhHuelle.regler)`);
        }
        if (!welt) continue;
        // H2 — Brücken-Kopie
        if (!fehltIn(rel, READY_LITERAL)) {
            zahl.bruecken.push(`${welt}${ausgenommen ? " (" + ausgenommen.split(/[:(,]/)[0].trim() + ")" : ""}`);
            if (!ausgenommen) rot.push(`H2 ${stammLib.fehlt.wo}: eine eigene ready-Meldung (die EINE Brücke ist AnazhHuelle.bruecke)`);
        }
        if (!fehltIn(rel, ELEMENT_ADAPTER))
            rot.push(`H2 ${stammLib.fehlt.wo}: Element-Adapter op[0] (aus "gt" wird "g") — der DSL-Adapter der Hülle liest das Programm ganz`);
    }
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
                veraltet.push(`H5 ${id}: das Panorama ist veraltet (Stempel ${String(e.stempel).slice(0, 12)} ≠ Quellen ${String(heute).slice(0, 12)}) — ${bitte}`);
            else zahl.panorama++;
        }
        for (const key of Object.keys(welten))
            if (!soll.some((id) => key === `worlds/${id}/index.html`)) rot.push(`H5 ${key}: ein Panorama ohne Welt der Hülle (verwaist)`);
        for (const [id, grund] of Object.entries(OHNE_PANORAMA))
            if (!ohne[`worlds/${id}/index.html`]) rot.push(`H5 ${id}: steht nicht benannt unter ohne (${grund})`);
        for (const key of Object.keys(ohne))
            if (!Object.keys(OHNE_PANORAMA).some((id) => key === `worlds/${id}/index.html`)) rot.push(`H5 ${key}: unter ohne, aber keine ausgenommene Welt`);
    }
    return { rot, zahl, veraltet };
}

function bericht(zahl) {
    console.log(`  Hand-Regler: ${zahl.handRegler} (die terrain-Familie ohne Ausnahme)`);
    console.log(`  eigene ready-Meldungen: ${zahl.bruecken.length} (${zahl.bruecken.join(", ") || "—"}) + die EINE der Hülle`);
    console.log(`  Labor = Welt (H4): ${Object.keys(OFEN_STUDIOS).join(", ")} — die L0 der Kosten-Leiste urteilt der Gang (--engine)`);
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
            soll: /^H1 worlds\/garage\/index\.html:\d+ .*: ein Hand-Regler/,
        },
        {
            name: "H1 ein Werkstatt-Schieber von Hand im Stamm (das Werkstatt-Modul)",
            rel: stammLib.dateiVon(ROOT, REGLER_GLIED),
            vor: /(_workshopRenderStudioParams\([^)]*\) \{)/,
            nach: '$1\n        const _t = document.createElement("input");\n        _t.type = "range";',
            soll: new RegExp(`^H1 ${stammLib.dateiVon(ROOT, REGLER_GLIED)}:\\d+ .*: ein Hand-Regler`),
        },
        {
            name: "H2 eine eigene ready in der schmiede",
            rel: "worlds/schmiede/schmiede.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'window.parent.postMessage({ type: "ready", world: "schmiede" }, "*");\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/schmiede\/schmiede\.js:\d+ .*: eine eigene ready/,
        },
        {
            name: "H2 der Element-Adapter in der klang (op[0] je Element)",
            rel: "worlds/klang/klang.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'var __t = function (op) { return String((op && op[0]) || op || ""); };\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/klang\/klang\.js:\d+ .*: Element-Adapter/,
        },
        {
            name: "H1 ein Hand-Regler im Gelände-Studio",
            rel: GELAENDE,
            vor: "AnazhHuelle.regler(",
            nach: 'd.innerHTML = `<input type="range">`;\nAnazhHuelle.regler(',
            soll: /^H1 worlds\/gelaende\/studio\.js:\d+ .*: ein Hand-Regler/,
        },
        {
            name: "H2 eine eigene ready im terrain-Labor",
            rel: "worlds/terrain/phytogenesis.js",
            vor: "AnazhHuelle.bruecke(",
            nach: 'foundryPost({ type: "ready", world: "terrain" });\nAnazhHuelle.bruecke(',
            soll: /^H2 worlds\/terrain\/phytogenesis\.js:\d+ .*: eine eigene ready/,
        },
        {
            name: "H5 eine Quelle der garage ändert sich, ihr Panorama bleibt (veraltet)",
            rel: "worlds/garage/garage.js",
            vor: /$/, // ankerfrei: ein Kommentar am Ende der Quelle
            nach: "\n/* ein neuer Look */",
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
        const treffer = [...r.rot, ...r.veraltet].find((x) => f.soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${f.name}${treffer ? " — " + treffer : " — nicht rot (" + (r.rot[0] || "grün") + ")"}`);
        if (!treffer) ok = false;
    }
    // H3/H4/H6 — der Spruch des Gangs (dieselbe pure Funktion): die Ratsche fremd, die garage auf der EINEN Engine
    const eine = ["/vendor/three-bootstrap.js", "/vendor/three.module.min.js", ENGINE_EINE];
    const r128 = "/worlds/terrain/lib/three-r128.min.js";
    const netz = Object.fromEntries([...STUDIOS, ...NEBENWELTEN].map((id) => [id, ENGINE_RATSCHE[id] ? [r128] : id === "garage" ? eine : []]));
    const undo = { vor: "1", mitte: "2", nach: "1" }, ofen = { tetrapoda: { l0: 54894, zeile: 62000 }, koerperstudio: { l0: 30000, zeile: 40000 } };
    const seiten = Object.fromEntries(STUDIOS.map((id) => [id, { undo, ...ofen[id] }])); // jedes Studio mit Sitzung, die Ofen-Labore unter der Zeile
    const gangFaelle = [
        ["H6 die garage lädt r128 aus der terrain-Familie", { garage: [r128, "/worlds/terrain/lib/OrbitControls.js"] }, /^H6 garage: die Seite lädt eine fremde Engine \(\/worlds\/terrain\/lib\/three-r128/],
        ["H6 die garage auf r184 ohne WebGPU", { garage: ["/vendor/three.module.min.js"] }, /^H6 garage: three aus vendor\/ ohne/],
        ["H6 die klang lädt das r160-UMD", { klang: ["/vendor/three.min.js"] }, /^H6 klang: die Seite lädt eine fremde Engine \(\/vendor\/three\.min\.js/],
        ["H6 die garage aufgelöst in die Welt (index.html?studio=garage)", { garage: ["/index.html", "/stamm/dirigent-kern.js", ...eine] }, /^H6 garage: die Seite lädt die Welt/],
        ["H6 die schmiede lädt keine Kopie mehr (die Ratsche zieht an)", { schmiede: eine }, /^H6 schmiede: lädt keine fremde Engine mehr/],
        ["H3 die Sitzung der garage bleibt stumm", {}, /^H3 garage: die Sitzung ist stumm/, { garage: { undo: { vor: "1", mitte: "2", nach: "2" } } }],
        ["H3 die schmiede verliert ihre Sitzung ganz (nie still)", {}, /^H3 schmiede: das Studio trägt keine Sitzung/, { schmiede: {} }],
        ["H4 das tetrapoda-Labor zeigt 1 299 852 △ (K45)", {}, /^H4 tetrapoda: Labor L0/, { tetrapoda: { l0: 1299852, zeile: 62000 } }],
        ["H4 die Kosten-Leiste des koerperstudio nennt keine L0 (nie grün auf der leeren Zeile)", {}, /^H4 koerperstudio: Labor L0 undefined/, { koerperstudio: {} }],
    ];
    const gangBasis = pruefeGang(netz, seiten);
    if (gangBasis.length) console.log("❌ SELBST-TEST Gang Ausgangslage: " + gangBasis[0]);
    for (const [name, patch, soll, seitenPatch] of gangFaelle) {
        const treffer = pruefeGang(Object.assign({}, netz, patch), Object.assign({}, seiten, seitenPatch)).find((x) => soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST ${name}${treffer ? " — " + treffer : " — nicht rot"}`);
        if (!treffer) ok = false;
    }
    return ok && !gangBasis.length;
}

// ── DER GANG (`--engine`, Rezept linse: lokal die GPU, CI swiftshader): je Seite der Hülle EIN Besuch im echten Browser —
// ihre Anfragen (H6), ihre Sitzung (H3) und bei einem Ofen-Studio die L0 der Kosten-Leiste (H4); Spruch: `pruefeGang`. Den
// Schuss einer Seite macht `werkbank start --echt --seite <url>` + `werkbank schirm`; das Gelände-Panel über der Welt bedient
// gate:gelaende-studio Regler für Regler.
async function gang() {
    const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742);
    const s = statikServer();
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "linse", frist: 120000 });
    const netz = {},
        seiten = {};
    try {
        for (const id of [...STUDIOS, ...NEBENWELTEN]) {
            const page = await browser.newPage();
            const pfade = (netz[id] = []); // jeden Seitenfehler nennt der EINE Sammler der Weiche (welt-boot), der Lauf wird rot
            page.on("request", (q) => pfade.push(new URL(q.url()).pathname));
            await page.goto(`http://127.0.0.1:${PORT}/worlds/${id}/index.html`, { waitUntil: "load", timeout: 90000 });
            await new Promise((r) => setTimeout(r, 1500));
            const z = (seiten[id] = await page.evaluate(async () => {
                const inp = [...document.querySelectorAll(".h-regler input")].find((i) => !i.disabled && i.closest("[data-sitzung]"));
                if (!inp) return { undo: null };
                const vor = inp.value;
                inp.value = String(+inp.value === +inp.max ? inp.min : inp.max);
                inp.dispatchEvent(new Event("input", { bubbles: true }));
                await new Promise((res) => setTimeout(res, 900));
                const mitte = inp.value;
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }));
                await new Promise((res) => setTimeout(res, 900));
                return { undo: { vor, mitte, nach: inp.value } };
            }));
            // H4: die Kosten-Leiste nennt die L0 erst, wenn der Ofen gebacken hat — je 500 ms gefragt, bis sie steht
            while (OFEN_STUDIOS[id] && !(z.l0 > 0)) {
                const t = await page.evaluate(() => [...document.querySelectorAll(".h-kosten-zeile")].map((e) => e.textContent).join(" "));
                const m = /([\d.]+) \/ ([\d.]+) △/.exec(t);
                if (m) Object.assign(z, { l0: +m[1].replace(/\./g, ""), zeile: +m[2].replace(/\./g, "") });
                else await new Promise((r) => setTimeout(r, 500));
            }
            await page.close();
            const fremd = [...new Set(pfade.filter((p) => ENGINE_FREMD.test(p)))];
            const engine = fremd.length ? "fremd " + fremd.join(" ") : pfade.includes(ENGINE_EINE) ? "r184 WebGPU" : "ohne three";
            const sitzung = z.undo ? `Schieber ${z.undo.vor} → ${z.undo.mitte}, Strg+Z → ${z.undo.nach}` : "ohne Sitzung"; // den Spruch fällt pruefeGang
            console.log(`  ${id.padEnd(14)} ${String(pfade.length).padStart(3)} Anfragen · ${engine} · ${sitzung}${OFEN_STUDIOS[id] ? ` · L0 ${z.l0} / ${z.zeile} △` : ""}`);
        }
    } finally {
        await browser.close();
        s.close();
    }
    const rot = pruefeGang(netz, seiten);
    for (const x of rot) console.log("❌ " + x);
    const sauber = Object.values(netz).filter((p) => !p.some((x) => ENGINE_FREMD.test(x))).length;
    console.log(`${rot.length ? "❌" : "✅"} DER GANG: ${sauber} von ${Object.keys(netz).length} Seiten ohne fremde Engine (Ratsche ${Object.keys(ENGINE_RATSCHE).join(", ")}) · ${Object.values(seiten).filter((z) => z.undo).length} Sitzungen · ${Object.keys(OFEN_STUDIOS).length} Ofen-Labore`);
    if (rot.length) process.exitCode = 1;
}

// ── DAS ZIEL-BILD BACKEN (H5, `--panorama [welt,…]`): je Welt der Hülle ihre Seite in einem Rahmen (die Heimat ist eine leere
// Seite derselben Herkunft), ihre Brücke meldet `ready`, die Welt wächst, dann `panorama-bitte` → `panorama` (Halbfloat-Texel aus
// IHREM Renderer, `AnazhHuelle.panorama`). Die Datei `worlds/<welt>/panorama.f16` (rgba16float 512 × 256, Zeile 0 unten) und ihr
// Stempel in `worlds/tor-ziele.json`. Das Ziel-Bild ist ein Bild-Urteil (Lehre 17): es backt die echte GPU unter dem GPU-Schloss,
// ein Software-Adapter (swiftshader, LINSE_GPU=software) bricht laut. Port STUDIO_HUELLE_PORT (8742).
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
        await page.goto(`http://127.0.0.1:${PORT}/__panorama.html`, { waitUntil: "load" });
        const adapter = String(browser.adapter.renderer || browser.adapter.fehlt); // die Adapter-Zeile der Weiche ([linse-gpu])
        if (!istHardwareAdapter(browser.adapter)) throw new Error(`Panorama auf ${adapter}: das Ziel-Bild backt die echte GPU (Lehre 17)`);
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
                console.log(`  ❌ ${id.padEnd(14)} ${(e && e.message) || e} (die Seitenfehler nennt der Sammler der Weiche)`);
            }
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
    if (a.includes("--engine")) return gang();
    if (a.includes("--selftest")) process.exit(selbsttest() ? 0 : 1);
    const { rot, zahl, veraltet } = pruefe(baum());
    console.log("Studio-Hülle: H1 Hand-Regler · H2 Brücken-Kopie · H3 Umstieg (Studios: " + STUDIOS.join(", ") + "; Nebenwelten: " + NEBENWELTEN.join(", ") + ")");
    bericht(zahl);
    for (const x of veraltet) console.log("⚠ " + x + " (benannt, sperrt nicht)");
    if (rot.length) {
        for (const x of rot) console.log("❌ " + x);
        process.exit(1);
    }
    console.log(`✅ gate:studio-huelle: ${STUDIOS.length} Studios + ${NEBENWELTEN.length} Nebenwelten auf der EINEN Hülle, kein Hand-Regler, keine Brücken-Kopie`);
})().catch((e) => {
    console.error("studio-huelle-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
