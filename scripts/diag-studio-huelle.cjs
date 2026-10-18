#!/usr/bin/env node
// diag-studio-huelle.cjs — DIE WAND DER STUDIO-HÜLLE (Studio-Welle 1, K41; Welle 2, K47; Synthese §2.1 W4a, gate:studio-huelle).
// EIN UI-Modul (worlds/huelle/huelle.js) trägt Regler, Sitzung (Undo/Redo · Same · Sperre), Kosten-Leiste und Portal-Brücke
// aller Studios UND der Welt-Werkstatt; die Wand nennt jede Kopie beim Namen (die Gesetze je H an ihrer Konstante unten):
//   H1 Hand-Regler (ein range von Hand, auch im Stamm am Regler-Glied) · H2 Brücken-Kopie (eine eigene ready, ein Element-
//   Adapter op[0]) · H3 Umstieg (gate:portal-konformanz je Betreten; --bild zählt die Schieber) · H4 Labor = Welt (kein eigener
//   Leib im Ofen-Studio; im Bild L0 über der Budget-Zeile ROT) · H5 Ziel-Bild (das Panorama je Welt der Hülle in
//   worlds/tor-ziele.json an den Quellen von HEUTE) · H6 EINE Engine (S1: jedes trusted Studio ein Modus index.html?studio=<x>,
//   ROT in der Ratsche EINE_ENGINE, gezählt „N von 12"; 18.10.: 1 von 12, gelaende → 2 von 12 mit der garage → 3 von 12 mit dem fachwerk (S1-b); fachwerk steht in
//   der Ratsche, ROT bis zum Schnitt S1-b) · H6 im Bild (`--gleich <id>`: das Werk des Modus = dasselbe Werk der Welt).
// Ausgenommen, benannt: die sandgesicherten begegnung + schwarm (CSP default-src 'none', Protokoll: gate:portal-konformanz).
//   node scripts/diag-studio-huelle.cjs [--selftest]   der Baum gegen H1–H6 · die Täter eingespielt → jede Wand rot beim Namen
//   node scripts/diag-studio-huelle.cjs --panorama [welt,…]   H5: je Welt ihr Ziel-Bild backen; LINSE_GPU=software wie die CI
//   node scripts/diag-studio-huelle.cjs --bild <ordner> [--name vorher|nachher]   je Studio die Shell im echten Browser: ein
//       Schuss + die Seiten-Zählung (Schieber gesamt · davon Hülle · Undo · Kosten-Leiste); Port STUDIO_HUELLE_PORT (8742)
//   node scripts/diag-studio-huelle.cjs --gleich <id> <ordner>   H6 im Bild (echter Renderer): die Tor-Seite ohne worlds/*/lib/
//       und auf r184, je Werk der Tafel GLEICH Studio-Bild = Welt-Bild (≤ 2,1 %); Bilder + gleich-<id>.json im Ordner
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
// Die Welten auf der Hülle: die Studios mit Reglern und die Nebenwelten mit der Brücke allein.
const STUDIOS = ["schmiede", "portale", "klang", "koerperstudio", "tetrapoda", "terrain"];
// Die MODI der Welt-Engine (S1, `index.html?studio=<id>`): ihr Tor (stamm `_studioModusBetreten`) steht benannt unter `ohne`.
const MODI = ["gelaende", "garage", "fachwerk"];
const MODUS_TORE = {
    garage: "ein Modus der Welt-Engine — das Tor öffnet die Werkstatt in der Welt (stamm _studioModusBetreten), kein fremdes Bild",
    fachwerk: "ein Modus der Welt-Engine — das Tor öffnet das Fachwerk-Studio in der Welt (stamm _studioModusBetreten), kein fremdes Bild",
};
const zielVon = (id) => (MODUS_TORE[id] ? `index.html?studio=${id}` : `worlds/${id}/index.html`);
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
// H6 — EINE ENGINE (S1, W3): ein trusted Studio ist ein MODUS der Welt-Engine (der Index lädt worlds/<x>/studio.js; keine Shell,
// kein Regal worlds/*/lib/, kein eigener Renderer, Ton, Licht, keine Szene). In der Ratsche EINE_ENGINE ist jeder Bruch ROT,
// wer die Wand hält, ohne in ihr zu stehen, auch (sie wächst je Schnitt); die anderen stehen gezählt mit ihrem ersten Täter.
const HAUPT = "index.html";
const TRUSTED = [...STUDIOS, ...NEBENWELTEN, ...MODI];
const EINE_ENGINE = ["gelaende", "garage", "fachwerk"];
const FREMDES_REGAL_HTML = /<script\b[^>]*\bsrc\s*=\s*["'][^"']*\blib\/[\w.-]+\.js/gi;
const FREMDES_REGAL_JS = /["'`][^"'`\n]*\blib\/[\w.-]+\.js/g;
const EIGENER_RENDERER = /\bnew\s+THREE\.WebGLRenderer\b/g;
const EIGENER_LOOK = /\btoneMapping(?:Exposure)?\s*=(?!=)|\bnew\s+THREE\.(?:Directional|Hemisphere|Ambient|Spot|Point|RectArea)Light\b|\bnew\s+THREE\.Scene\s*\(/g;
const modusTag = (id) => new RegExp(`<script\\b[^>]*\\bsrc\\s*=\\s*["']worlds/${id}/studio\\.js\\b`, "g");
// H6 IM BILD (`--gleich <id>`, S1): das Studio zeigt, was die Welt zeigt. Die Seite, die das Tor öffnet (`zielVon`), lädt nichts
// aus worlds/*/lib/ und zeichnet mit der EINEN three (r184). Je Werk der Tafel baut einmal der Modus (index.html?studio=<id>:
// `__studioModi[id].dorf(dp)`, `zustand()` → { aktiv, kommt, ort, dorf } mit `dorf` = das Ergebnis von `spawnSettlement`) und
// einmal die Welt ohne Studio (index.html: `spawnSettlement({ …dp, position: ort })`, der Spieler am Ort des Studios) dasselbe
// Werk, je auf frischer Seite; beide Bilder aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs, Bühne Mittag · Sonne ·
// Sommer, Tiere und Dorf-Zug gehalten, der Spieler verborgen) unter DERSELBEN Pose (die des Studios, aus den Häusern seines Dorfs) sind EIN
// Bild: Anteil der Pixel mit Kanal-Differenz > 24 ≤ 2,1 % (Rezept bild-diff a626dd20; die Garage 0,04–0,16 %). `mauer`: der Plan,
// den die Welt über ihren EINEN Kanal bekommt (`_foundryRequestSettlement`), trägt die Stadtmauer (das Studio zeigte sie allein).
const GLEICH = {
    fachwerk: [
        { name: "dorf", dp: { seed: 3, nH: 18, epoche: "gruenderzeit" } },
        { name: "stadt-mauer", dp: { seed: 3, nH: 120, epoche: "mittelalter" }, mauer: true },
    ],
};
const GLEICH_MAX = 0.021;
const GLEICH_SCHWELLE = 24;
const REGAL_URL = /\/worlds\/[^/]+\/lib\//;
// DAS URTEIL (pure Funktion; Lauf UND Selbsttest): m = { id, tor: { url, regal, bytes, erste, revision }, modus, werke: [{ name,
// fatal?, mauer?: { soll, segs }, n, px, anteil }], fehler: [] } → die Täter beim Namen, leer = grün
function gleichUrteil(m) {
    const t = [];
    const w = `H6 ${m.id} im Bild`;
    const T = m.tor || {};
    if (!(T.regal === 0)) t.push(`${w}: die Tor-Seite ${T.url} lädt ${T.regal} × worlds/*/lib/ (${T.bytes} B, ${T.erste || "?"}) — die EINE Engine ist vendor r184`);
    if (String(T.revision) !== "184") t.push(`${w}: die Tor-Seite ${T.url} zeichnet mit three r${T.revision} — die EINE Engine ist r184`);
    if (!m.modus) t.push(`${w}: kein Modus (index.html?studio=${m.id} trägt __studioModi.${m.id} nicht ein)`);
    for (const k of m.werke || []) {
        if (k.fatal) {
            t.push(`${w} ${k.name}: ${k.fatal}`);
            continue;
        }
        if (k.mauer && k.mauer.soll && !(k.mauer.segs > 0)) t.push(`${w} ${k.name}: die Welt bekommt keine Stadtmauer (der Plan trägt ${k.mauer.segs} Segmente)`);
        if (!(k.anteil <= GLEICH_MAX))
            t.push(`${w} ${k.name}: Studio ≠ Welt — ${k.n} von ${k.px} Pixeln (${(100 * k.anteil).toFixed(2)} %) über Schwelle ${GLEICH_SCHWELLE}, Soll ≤ ${(100 * GLEICH_MAX).toFixed(1)} %`);
    }
    if ((m.fehler || []).length) t.push(`${w}: Seitenfehler ${m.fehler.slice(0, 2).join(" | ")}`);
    return t;
}
const GLEICH_GESUND = {
    id: "fachwerk",
    tor: { url: "index.html?studio=fachwerk", regal: 0, bytes: 0, revision: "184" },
    modus: true,
    werke: [
        { name: "dorf", n: 120, px: 518400, anteil: 120 / 518400 },
        { name: "stadt-mauer", mauer: { soll: true, segs: 30 }, n: 900, px: 518400, anteil: 900 / 518400 },
    ],
    fehler: [],
};
// H5 — DAS ZIEL-BILD (D8): jede Welt der Hülle rendert ihr Panorama in IHRER Welt (`AnazhHuelle.panorama`), gebacken je SHA
// ihrer Quellen (`--panorama`); die Heimat liest die Datei (stamm `_torZielBuendel`). Die Karte nennt je Welt Datei und Stempel
// (SHA-256 über index.html und jede lokale Quelle, `?v=` fällt); ein Stempel ohne die Quellen von HEUTE ist ROT beim Namen.
const TOR_ZIELE = "worlds/tor-ziele.json";
// Ohne Ziel-Bild, benannt (`ohne`): die sandgesicherten Welten, die übersetzte (ihre Szene reist im enter) und die Modi.
const OHNE_PANORAMA = Object.assign(
    { translated: "die Szene ist Spieler-Daten und reist erst im enter (stamm PORTAL_TRANSLATED_WORLD) — vor dem Betreten kein Bild" },
    AUSGENOMMEN,
    MODUS_TORE
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
    karte[HAUPT] = fs.readFileSync(path.join(ROOT, HAUPT), "utf8");
    if (fs.existsSync(path.join(ROOT, TOR_ZIELE))) karte[TOR_ZIELE] = fs.readFileSync(path.join(ROOT, TOR_ZIELE), "utf8");
    return karte;
}


function pruefe(karte) {
    const rot = [];
    // VERALTET sperrt nicht (Koordinator 15.10., D8-Merge, wie K5): ein Panorama, dessen Quellen sich seither änderten, steht benannt
    // „veraltet“, bis jemand backt (`--panorama`) — sonst sperrte jede Welle an einer Studio-Quelle, der Hülle oder einem Kern check:statik
    const veraltet = [];
    const zahl = { handRegler: 0, bruecken: [], elementAdapter: 0 };
    // H1/H2/H4 sind Absenzen über den EINEN Helfer (stammLib.fehlt, kommentarfrei): der Text der Karte, der Täter mit Datei und
    // Zeile; ein eingespielter Täter des Selbsttests liest dieselbe Karte.
    const fehltIn = (rel, rx) => stammLib.fehlt(null, rx, { datei: rel, wandel: karte[rel] });
    for (const rel of Object.keys(karte)) {
        const m = /^worlds\/([^/]+)\//.exec(rel);
        const welt = m ? m[1] : null;
        if (rel === HAUPT || welt === "huelle" || !/\.(html|js)$/.test(rel)) continue;
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
        if (!fehltIn(rel, ELEMENT_ADAPTER)) {
            zahl.elementAdapter++;
            rot.push(`H2 ${stammLib.fehlt.wo}: Element-Adapter op[0] (aus "gt" wird "g") — der DSL-Adapter der Hülle liest das Programm ganz`);
        }
    }
    // H4 — Labor = Welt (Absenz): kein Ofen-Studio baut einen eigenen Leib; den Ofen-Körper zeigt die Kosten-Leiste im Bild (--bild).
    for (const [id, o] of Object.entries(OFEN_STUDIOS))
        for (const r of Object.keys(karte).filter((x) => x.startsWith(`worlds/${id}/`) && x.endsWith(".js")))
            if (!fehltIn(r, o.eigenbau)) rot.push(`H4 ${id}: baut einen eigenen Leib (${stammLib.fehlt.wo}) — ein Zwilling des Ofen-Körpers`);
    // H6 — EINE Engine: je trusted Studio die Täter beim Namen; ROT nur in der Ratsche, die anderen gezählt
    zahl.eineEngine = [];
    zahl.fremd = [];
    for (const id of TRUSTED) {
        const t = [];
        const dateien = Object.keys(karte).filter((r) => r.startsWith(`worlds/${id}/`) && typeof karte[r] === "string");
        const shell = `worlds/${id}/index.html`;
        if (dateien.includes(shell)) t.push(`H6 ${id}: eigene Shell ${shell} (ein iframe neben der Welt) — der Modus ist index.html?studio=${id}`);
        for (const r of dateien) {
            if (!fehltIn(r, /\.html$/.test(r) ? FREMDES_REGAL_HTML : FREMDES_REGAL_JS))
                t.push(`H6 ${stammLib.fehlt.wo}: lädt eine fremde three (worlds/*/lib/) — die EINE Engine ist vendor r184`);
            if (!fehltIn(r, EIGENER_RENDERER)) t.push(`H6 ${stammLib.fehlt.wo}: ein eigener Renderer — der EINE ist der der Welt`);
            if (!fehltIn(r, EIGENER_LOOK)) t.push(`H6 ${stammLib.fehlt.wo}: ein eigener Look (Ton, Licht, Szene) — die Bühne ist die Welt`);
        }
        if (fehltIn(HAUPT, modusTag(id))) t.push(`H6 ${id}: kein Modus (${HAUPT} lädt worlds/${id}/studio.js nicht)`);
        if (EINE_ENGINE.includes(id)) rot.push(...t);
        else if (!t.length) rot.push(`H6 ${id}: hält die EINE Engine, steht aber nicht in der Ratsche EINE_ENGINE — trag es ein`);
        if (t.length) zahl.fremd.push(`${id} (${t[0].replace(/^H6 /, "").split(" — ")[0]})`);
        else zahl.eineEngine.push(id);
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
            if (!ohne[zielVon(id)]) rot.push(`H5 ${id}: steht nicht benannt unter ohne (${grund})`);
        for (const key of Object.keys(ohne))
            if (!Object.keys(OHNE_PANORAMA).some((id) => key === zielVon(id))) rot.push(`H5 ${key}: unter ohne, aber keine ausgenommene Welt`);
    }
    return { rot, zahl, veraltet };
}

function bericht(zahl) {
    console.log(`  Hand-Regler: ${zahl.handRegler} (die terrain-Familie ohne Ausnahme)`);
    console.log(`  eigene ready-Meldungen: ${zahl.bruecken.length} (${zahl.bruecken.join(", ") || "—"}) + die EINE der Hülle`);
    console.log(`  Labor = Welt (H4): ${Object.keys(OFEN_STUDIOS).join(", ")} zeigen den Ofen-Körper (keine Ausnahme)`);
    console.log(`  EINE Engine (H6): ${zahl.eineEngine.length} von ${TRUSTED.length} trusted Studios (${zahl.eineEngine.join(", ") || "—"}), Ratsche ${EINE_ENGINE.join(", ")}`);
    for (const f of zahl.fremd) console.log(`    fremd: ${f}`);
    console.log(`  Ziel-Bild (H5): ${zahl.panorama} von ${STUDIOS.length + NEBENWELTEN.length - Object.keys(OHNE_PANORAMA).filter((id) => !AUSGENOMMEN[id]).length} Panoramen an den Quellen von heute (${TOR_ZIELE}), ohne: ${Object.keys(OHNE_PANORAMA).join(", ")}`);
}

// ── SELBSTTEST: die Täter in die Karte gespielt (Fundstelle fehlt → rot, die Linse wandert mit dem Code) ──
function selbsttest() {
    const echt = baum();
    const faelle = [
        {
            name: "H1 ein Hand-Regler in der schmiede (index.html)",
            rel: "worlds/schmiede/index.html",
            vor: '<div id="sliders"></div>',
            nach: '<div id="sliders"><input type="range" id="sTaeter" min="0" max="1"></div>',
            soll: /^H1 worlds\/schmiede\/index\.html:\d+ .*: ein Hand-Regler/,
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
            name: "H4 das tetrapoda-Labor baut seinen eigenen Leib (bauTier + Fell-Streu)",
            rel: "worlds/tetrapoda/tetrapoda.js",
            vor: "BAKERS_BY_KIND.kreatur(",
            nach: "__tetrapodaCore.fellStreu(P, B.masse, B.fellOrt);__tetrapodaCore.bauTier(F, dials);BAKERS_BY_KIND.kreatur(",
            soll: /^H4 tetrapoda: baut einen eigenen Leib \(worlds\/tetrapoda\/tetrapoda\.js:\d+ `(?:fellStreu|bauTier)\(`\)/,
        },
        {
            name: "H4 das koerperstudio-Labor baut seinen eigenen Menschen (bauMensch + Haar-Streu)",
            rel: "worlds/koerperstudio/koerperstudio.js",
            vor: "BAKERS_BY_KIND.koerper(",
            nach: "KC.bauMensch(F);KC.haarStreu(params);BAKERS_BY_KIND.koerper(",
            soll: /^H4 koerperstudio: baut einen eigenen Leib \(worlds\/koerperstudio\/koerperstudio\.js:\d+ `(?:bauMensch|haarStreu)\(`\)/,
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
            name: "H5 eine Quelle der schmiede ändert sich, ihr Panorama bleibt (veraltet)",
            rel: "worlds/schmiede/schmiede.js",
            vor: /$/, // ankerfrei: ein Kommentar am Ende der Quelle
            nach: "\n/* ein neuer Look */",
            soll: /^H5 schmiede: das Panorama ist veraltet/,
        },
        {
            name: "H5 eine geteilte Quelle (die Hülle) ändert sich — jede Welt veraltet",
            rel: "worlds/huelle/huelle.js",
            vor: "function panorama(",
            nach: "function panoramaNeu() {}\n    function panorama(",
            soll: /^H5 skeleton: das Panorama ist veraltet/,
        },
        {
            name: "H5 die Version allein macht kein neues Bild (?v= fällt) — die klang bleibt grün",
            rel: "worlds/klang/index.html",
            vor: /\?v=[0-9.]+/g,
            nach: "?v=99.999.9",
            soll: null,
            nichtRot: /^H5 klang/,
        },
        {
            name: "H5 der Export ohne die klang",
            rel: TOR_ZIELE,
            vor: '"worlds/klang/index.html": {',
            nach: '"worlds/klang-fort/index.html": {',
            soll: /^H5 klang: kein Panorama im Export/,
        },
        {
            name: "H5 eine ausgenommene Welt nicht benannt (begegnung fehlt unter ohne)",
            rel: TOR_ZIELE,
            vor: '"worlds/begegnung/index.html":',
            nach: '"worlds/begegnung-fort/index.html":',
            soll: /^H5 begegnung: steht nicht benannt unter ohne/,
        },
        ...[
            ["baut einen eigenen Renderer", "const _r = new THREE.WebGLRenderer({ antialias: true });", "ein eigener Renderer"],
            ["zieht three r128 aus dem terrain-Regal nach", 'document.createElement("script").src = "worlds/terrain/lib/three-r128.min.js";', "lädt eine fremde three"],
            ["setzt sein eigenes ACES (Garage 1,04)", "window.__R.toneMappingExposure = 1.04;", "ein eigener Look"],
        ].map(([was, tat, wort], _i, _a, vor = 'if (such.get("studio") !== "gelaende") return;') => ({
            name: `H6 der Gelände-Modus ${was}`,
            rel: GELAENDE,
            vor,
            nach: `${vor}\n    ${tat}`,
            soll: new RegExp(`^H6 worlds/gelaende/studio\\.js:\\d+ .*: ${wort}`),
        })),
        {
            name: "H6 der Index lädt das Gelände-Studio nicht mehr (kein Modus)",
            rel: HAUPT,
            vor: '<script src="worlds/gelaende/studio.js',
            nach: '<script src="worlds/gelaende/studio-fort.js',
            soll: /^H6 gelaende: kein Modus/,
        },
        {
            name: "H6 die alte Garage-Shell kehrt zurück (r128 aus dem terrain-Regal neben dem Modus)",
            rel: "worlds/garage/index.html",
            neu: '<!doctype html><html><body><script src="../terrain/lib/three-r128.min.js"></script></body></html>\n',
            soll: /^H6 garage: eigene Shell worlds\/garage\/index\.html/,
        },
        {
            name: "H6 die alte Fachwerk-Shell kehrt zurück (r128 aus dem terrain-Regal neben dem Modus)",
            rel: "worlds/fachwerk/index.html",
            neu: '<!doctype html><html><body><script src="../terrain/lib/three-r128.min.js"></script></body></html>\n',
            soll: /^H6 fachwerk: eigene Shell worlds\/fachwerk\/index\.html/,
        },
        // am Ende des Modus angehängt (/$/: keine Fundstelle im Text des Modus, nur die Datei muss stehen)
        ...[
            ["baut einen eigenen Renderer", "const _r = new THREE.WebGLRenderer({ antialias: true });", "ein eigener Renderer"],
            ["setzt sein eigenes ACES (Fachwerk 1,12)", "window.__R.toneMappingExposure = 1.12;", "ein eigener Look"],
            ["baut eine eigene Szene mit eigenem Himmel", "const _s = new THREE.Scene();", "ein eigener Look"],
        ].map(([was, tat, wort]) => ({
            name: `H6 der Fachwerk-Modus ${was}`,
            rel: "worlds/fachwerk/studio.js",
            vor: /$/,
            nach: `\n${tat}\n`,
            soll: new RegExp(`^H6 worlds/fachwerk/studio\\.js:\\d+ .*: ${wort}`),
        })),
        {
            name: "H6 der Index lädt das Fachwerk-Studio nicht mehr (kein Modus)",
            rel: HAUPT,
            vor: '<script src="worlds/fachwerk/studio.js',
            nach: '<script src="worlds/fachwerk/studio-fort.js',
            soll: /^H6 fachwerk: kein Modus/,
        },
        {
            name: "H5 das Garage-Tor fehlt unter ohne (der Modus ohne benanntes Ziel)",
            rel: TOR_ZIELE,
            vor: '"index.html?studio=garage":',
            nach: '"index.html?studio=garage-fort":',
            soll: /^H5 garage: steht nicht benannt unter ohne/,
        },
        {
            name: "H6 die klang hält die Wand, steht aber nicht in der Ratsche",
            rel: HAUPT,
            vor: '<script src="worlds/gelaende/studio.js',
            nach: '<script src="worlds/klang/studio.js?v=1" defer></script>\n        <script src="worlds/gelaende/studio.js',
            dazu: { "worlds/klang/index.html": null, "worlds/klang/klang.js": null, "worlds/klang/studio.js": "(function () {})();\n" },
            soll: /^H6 klang: hält die EINE Engine, steht aber nicht in der Ratsche/,
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
        // `neu`: eine Datei, die der Baum nicht trägt (sie darf nicht schon stehen); `dazu`: weitere Dateien (null = fällt)
        if (f.neu != null ? t != null : !t || !(am ? f.vor.test(t) : t.includes(f.vor))) {
            console.log(`❌ SELBST-TEST ${f.name} — Fundstelle fehlt (${f.rel}: ${String(f.neu != null ? "neu, steht schon" : f.vor).slice(0, 40)})`);
            ok = false;
            continue;
        }
        const karte = Object.assign({}, echt, { [f.rel]: f.neu != null ? f.neu : am ? t.replace(f.vor, f.nach) : t.split(f.vor).join(f.nach) });
        for (const [rel, text] of Object.entries(f.dazu || {})) {
            if (text == null && echt[rel] == null) {
                console.log(`❌ SELBST-TEST ${f.name} — Fundstelle fehlt (${rel} soll fallen, steht nicht im Baum)`);
                ok = false;
            }
            if (text == null) delete karte[rel];
            else karte[rel] = text;
        }
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
    // H6 im Bild (`--gleich`): der gesunde Lauf ist grün, je Bruch nennt das Urteil genau seinen Täter
    const gesund = gleichUrteil(GLEICH_GESUND);
    if (gesund.length) {
        console.log("❌ SELBST-TEST H6 im Bild: der gesunde Lauf ist rot — " + gesund[0]);
        ok = false;
    }
    const mit = (o) => Object.assign(JSON.parse(JSON.stringify(GLEICH_GESUND)), o);
    const werk = (i, o) => {
        const m = mit({});
        Object.assign(m.werke[i], o);
        return m;
    };
    const shell = { url: "worlds/fachwerk/index.html", regal: 1, bytes: 629820, erste: "/worlds/terrain/lib/three-r128.min.js", revision: "128" };
    for (const [name, m, soll] of [
        ["die alte Shell zieht three r128 aus dem terrain-Regal", mit({ tor: shell }), /^H6 fachwerk im Bild: die Tor-Seite worlds\/fachwerk\/index\.html lädt 1 × worlds\/\*\/lib\//],
        ["eine fremde three ohne Regal (gebündelt)", mit({ tor: Object.assign({}, shell, { regal: 0, bytes: 0 }) }), /^H6 fachwerk im Bild: .* three r128/],
        ["kein Modus", mit({ modus: false }), /^H6 fachwerk im Bild: kein Modus/],
        ["ein zweites Dorf im Studio (Bild 5 % anders)", werk(0, { n: 25920, anteil: 0.05 }), /^H6 fachwerk im Bild dorf: Studio ≠ Welt — 25920 von/],
        ["die Welt ohne Stadtmauer", werk(1, { mauer: { soll: true, segs: 0 } }), /^H6 fachwerk im Bild stadt-mauer: die Welt bekommt keine Stadtmauer/],
        ["der Modus stellt kein Dorf", werk(0, { fatal: "der Modus stellt kein Dorf" }), /^H6 fachwerk im Bild dorf: der Modus stellt kein Dorf/],
        ["ein Seitenfehler", mit({ fehler: ["dorfGroup is not defined"] }), /^H6 fachwerk im Bild: Seitenfehler dorfGroup/],
    ]) {
        const treffer = gleichUrteil(m).find((x) => soll.test(x));
        console.log(`${treffer ? "✅" : "❌"} SELBST-TEST H6 im Bild: ${name}${treffer ? " — " + treffer : " — nicht rot (" + (gleichUrteil(m)[0] || "grün") + ")"}`);
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
    const ziele = STUDIOS.map((id) => ({ id, url: `/worlds/${id}/index.html`, wurzel: null, ms: id === "koerperstudio" || id === "terrain" ? 9000 : 5000 }));
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

// ── H6 IM BILD (`--gleich <id> <ordner>`): die Tor-Seite gezählt, je Werk der Tafel ein Studio- und ein Welt-Schuss ──
// Eine Seite: laden (das Netz gezählt), auf die Welt warten, das Werk stellen (Studio: der Modus; Welt: `spawnSettlement` am Ort
// des Studios, der Spieler dort), die Pose setzen (Studio: aus den Häusern, Welt: die des Studios), ein Schuss aus dem Ausgabe-Pfad.
// Gezählt wird die SEITE (ihre Frames), nie der Foundry-Worker der Welt: der zieht an der Basis 8 × three-r128 für jede Welt
// gleich (gemessen 18.10. an index.html, Radeon) — sein Umzug auf vendor r184 ist der letzte Schritt von S1, nicht dieses Studio.
function regalZaehlen(q, liste) {
    if (!REGAL_URL.test(q.url()) || !q.frame()) return;
    const p = new URL(q.url()).pathname;
    liste.push(q.buffer().then((b) => [p, b.length], () => [p, 0]));
}
async function gleichSeite(browser, PORT, { pfad, id, werk, vorgabe, W, H }) {
    const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
    const { warteAufWelt } = require("./lib/welt-boot.cjs");
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    const fehler = [];
    page.on("pageerror", (e) => fehler.push(String((e && e.message) || e).split("\n")[0].slice(0, 140)));
    const regal = [];
    page.on("response", (q) => regalZaehlen(q, regal));
    await page.goto(`http://127.0.0.1:${PORT}/${pfad}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(AUSGABE_INSTALL);
    await warteAufWelt(page, 300000);
    const out = await page.evaluate(
        async (id, dp, vorgabe, W, H) => {
            const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
            const r = window.anazhRealm;
            const dl = performance.now() + 600000;
            const bis = async (fn) => {
                while (!fn() && performance.now() < dl) await sleep(200);
                return fn();
            };
            const o = { revision: window.THREE && window.THREE.REVISION, modus: false };
            if (!(await bis(() => r.state._weltbildDa))) return Object.assign(o, { fatal: "kein erstes Weltbild" });
            o.modus = !!(window.__studioModi && window.__studioModi[id]);
            if (r.state.renderer._isHeadlessNull) return Object.assign(o, { fatal: "Null-Renderer — kein Bild" });
            if (!(await r._foundryAwaitBook(60000)).ok) return Object.assign(o, { fatal: "das Buch kam nicht" });
            window.__anazhAutoSettlement = false; // der Dorf-Zug ruht auf beiden Seiten (sein Takt ist kein Werk des Studios)
            let res;
            if (!vorgabe) {
                if (!o.modus) return o;
                const m = window.__studioModi[id];
                if (typeof m.dorf !== "function") return Object.assign(o, { fatal: `der Modus hat kein dorf(dp)` });
                await m.dorf(dp);
                const steht = () => {
                    const z = m.zustand();
                    return z.aktiv && z.kommt === null && z.dorf && z.dorf.placed > 0 && z.ort;
                };
                if (!(await bis(steht))) return Object.assign(o, { fatal: `der Modus stellt kein Dorf (${JSON.stringify(m.zustand()).slice(0, 160)})` });
                const z = m.zustand();
                res = z.dorf;
                o.ort = { x: z.ort.x, z: z.ort.z };
            } else {
                r.state.playerMesh.position.set(vorgabe.spieler.x, vorgabe.spieler.y, vorgabe.spieler.z);
                const plan = await r._foundryRequestSettlement(dp);
                o.mauer = plan && plan.mauer && Array.isArray(plan.mauer.segs) ? plan.mauer.segs.length : 0;
                res = await r.spawnSettlement(Object.assign({}, dp, { position: vorgabe.ort }));
                if (!res || !(res.placed > 0)) return Object.assign(o, { fatal: `die Welt stellt kein Dorf an ${JSON.stringify(vorgabe.ort)}` });
                o.ort = vorgabe.ort;
            }
            const hs = (res.haeuser || []).map((e) => e.position);
            o.haeuser = hs.length;
            const pm = r.state.playerMesh.position;
            o.spieler = { x: pm.x, y: pm.y, z: pm.z };
            // DIE POSE: die des Studios (aus der Mitte und dem Rand seiner Häuser, 3/4 von Südost, wie das Labor rahmte); die Welt erbt sie
            let pose = vorgabe && vorgabe.pose;
            if (!pose) {
                const mx = hs.reduce((s, p) => s + p.x, 0) / hs.length;
                const mz = hs.reduce((s, p) => s + p.z, 0) / hs.length;
                const R = Math.max(12, ...hs.map((p) => Math.hypot(p.x - mx, p.z - mz)));
                const my = r.getTerrainHeightAt(mx, mz) + 6;
                const d = Math.min(260, R * 2 + 12);
                const [az, el] = [0.62, 0.48];
                pose = { p: [mx + Math.cos(az) * Math.cos(el) * d, my + Math.sin(el) * d, mz + Math.sin(az) * Math.cos(el) * d], ziel: [mx, my, mz] };
            }
            o.pose = pose;
            r.state.playerMesh.visible = false;
            r.kameraFuehren((cam) => {
                cam.position.set(pose.p[0], pose.p[1], pose.p[2]);
                cam.lookAt(pose.ziel[0], pose.ziel[1], pose.ziel[2]);
            });
            window.__tiereHalten();
            window.__buehne();
            for (let i = 0; i < 30; i++) {
                r._gameLoopTick(performance.now());
                await sleep(30);
            }
            await window.__weltStehtNach();
            window.__buehne();
            for (let i = 0; i < 10; i++) {
                r._gameLoopTick(performance.now());
                await sleep(30);
            }
            const px = (await window.__ausgabeAufnahme(W, H, 1)).u8;
            const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const cv = document.createElement("canvas");
            [cv.width, cv.height] = [W, H];
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            img.data.set(u8.subarray(0, W * H * 4));
            ctx.putImageData(img, 0, 0);
            let s = "";
            for (let i = 0; i < W * H * 4; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(W * H * 4, i + 32768)));
            return Object.assign(o, { png: cv.toDataURL("image/png"), roh: btoa(s) });
        },
        id,
        werk ? werk.dp : null,
        vorgabe || null,
        W,
        H
    );
    const liste = await Promise.all(regal);
    out.regal = { n: liste.length, bytes: liste.reduce((s, [, b]) => s + b, 0), erste: liste.length ? liste[0][0] : null };
    out.fehler = fehler;
    await page.close();
    return out;
}
async function gleich(id, ordner) {
    if (!GLEICH[id]) throw new Error(`--gleich ${id}: kein Werk in der Tafel GLEICH (${Object.keys(GLEICH).join(", ")})`);
    const PORT = Number(process.env.STUDIO_HUELLE_PORT || 8742);
    const [W, H] = [960, 540];
    const s = statikServer();
    await new Promise((r) => s.listen(PORT, "127.0.0.1", r));
    fs.mkdirSync(ordner, { recursive: true });
    const browser = await starteBrowser({ art: "linse", frist: 1800000 });
    const modusUrl = `index.html?studio=${id}`;
    const m = { id, tor: null, modus: false, werke: [], fehler: [] };
    try {
        // DIE TOR-SEITE: was das Tor öffnet (`zielVon`) — ist es der Modus, zählt die erste Studio-Seite, sonst die Shell allein
        if (zielVon(id) !== modusUrl) {
            const page = await browser.newPage();
            const regal = [];
            page.on("response", (q) => regalZaehlen(q, regal));
            page.on("pageerror", (e) => m.fehler.push(`${zielVon(id)}: ${String((e && e.message) || e).split("\n")[0].slice(0, 120)}`));
            // „load“: jedes Skript-Tag der Shell ist geladen und gelaufen — das Regal und die three stehen fest
            await page.goto(`http://127.0.0.1:${PORT}/${zielVon(id)}`, { waitUntil: "load", timeout: 180000 });
            const revision = await page.evaluate(() => window.THREE && window.THREE.REVISION);
            const liste = await Promise.all(regal);
            m.tor = { url: zielVon(id), regal: liste.length, bytes: liste.reduce((a, [, b]) => a + b, 0), erste: liste.length ? liste[0][0] : null, revision };
            await page.close();
        }
        for (const werk of GLEICH[id]) {
            const st = await gleichSeite(browser, PORT, { pfad: modusUrl, id, werk, vorgabe: null, W, H });
            if (!m.tor) m.tor = { url: modusUrl, regal: st.regal.n, bytes: st.regal.bytes, erste: st.regal.erste, revision: st.revision };
            m.modus = st.modus;
            m.fehler.push(...st.fehler.map((f) => `Studio ${werk.name}: ${f}`));
            if (!st.modus) break;
            const k = { name: werk.name, mauer: werk.mauer ? { soll: true, segs: null } : null };
            m.werke.push(k);
            if (st.fatal) {
                k.fatal = `Studio: ${st.fatal}`;
                continue;
            }
            const wt = await gleichSeite(browser, PORT, { pfad: "index.html", id, werk, vorgabe: { ort: st.ort, spieler: st.spieler, pose: st.pose }, W, H });
            m.fehler.push(...wt.fehler.map((f) => `Welt ${werk.name}: ${f}`));
            if (k.mauer) k.mauer.segs = wt.mauer;
            if (wt.fatal) {
                k.fatal = `Welt: ${wt.fatal}`;
                continue;
            }
            const [A, B] = [Buffer.from(st.roh, "base64"), Buffer.from(wt.roh, "base64")];
            let n = 0;
            for (let p = 0; p < W * H; p++) {
                let mx = 0;
                for (let c = 0; c < 3; c++) mx = Math.max(mx, Math.abs(A[p * 4 + c] - B[p * 4 + c]));
                if (mx > GLEICH_SCHWELLE) n++;
            }
            Object.assign(k, { n, px: W * H, anteil: n / (W * H), haeuser: [st.haeuser, wt.haeuser], ort: st.ort, pose: st.pose });
            for (const [seite, bild] of [["studio", st.png], ["welt", wt.png]])
                fs.writeFileSync(path.join(ordner, `gleich-${id}-${werk.name}-${seite}.png`), Buffer.from(bild.split(",")[1], "base64"));
            console.log(`  ${werk.name.padEnd(12)} Häuser Studio ${st.haeuser} · Welt ${wt.haeuser}${k.mauer ? ` · Mauer-Segmente im Plan der Welt ${wt.mauer}` : ""} · Bild-Differenz ${n} / ${W * H} px (${((100 * n) / (W * H)).toFixed(2)} %)`);
        }
    } finally {
        await browser.close();
        s.close();
    }
    fs.writeFileSync(path.join(ordner, `gleich-${id}.json`), JSON.stringify(m, null, 2));
    const t = gleichUrteil(m);
    console.log(`  Tor-Seite ${m.tor.url}: ${m.tor.regal} Anfragen auf worlds/*/lib/ (${m.tor.bytes} B${m.tor.erste ? ", " + m.tor.erste : ""}) · three r${m.tor.revision} · Modus ${m.modus ? "ja" : "nein"}`);
    for (const x of t) console.log("❌ " + x);
    if (t.length) process.exitCode = 1;
    else console.log(`✅ H6 ${id} im Bild: die Tor-Seite auf r184 ohne worlds/*/lib/, ${m.werke.length} Werke Studio = Welt (≤ ${(100 * GLEICH_MAX).toFixed(1)} %)`);
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
    for (const [id, grund] of Object.entries(OHNE_PANORAMA)) neu.ohne[zielVon(id)] = grund;
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
            const reift = id === "koerperstudio" || id === "terrain" ? 9000 : 4000;
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
    if (a.includes("--gleich")) {
        const i = a.indexOf("--gleich");
        await gleich(a[i + 1], path.resolve(a[i + 2] || "."));
        return;
    }
    if (a.includes("--selftest")) process.exit(selbsttest() ? 0 : 1);
    const { rot, zahl, veraltet } = pruefe(baum());
    console.log("Studio-Hülle: H1 Hand-Regler · H2 Brücken-Kopie · H3 Umstieg · H6 EINE Engine (Studios: " + STUDIOS.join(", ") + "; Nebenwelten: " + NEBENWELTEN.join(", ") + ")");
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
