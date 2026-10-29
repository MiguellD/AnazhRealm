// ci-klasse.cjs — DIE KLASSE EINES CI-SCHRITTS: braucht er einen Echt-Renderer? Der run-Text wird über package.json bis
// auf die Befehle aufgelöst, jedes `node <datei>` samt seinen lokalen `require` nach dem Rezept an der Weiche durchsucht
// (welt-boot `starteBrowser({ art })`): ein Echt-Rezept (GPU_REZEPTE) ohne Bedingung macht ihn `gpu`; im Zweig
// (`art: X ? "linse" : "null"`) entscheidet der Befehl, ob er X setzt (Schalter oder Umgebung) — sonst `bedingt`. Der Richter
// ist die Laufzeit: die Weiche nennt ein Echt-Rezept in einer CPU-Gruppe ROT und eines, das nie zeichnet.
"use strict";
const { GPU_REZEPTE, ausDatei, path, fs } = require("./welt-boot.cjs");

const ROOT = path.resolve(__dirname, "..", "..");
const ART = /\bart:\s*([^\n,}]+)/g;
const REZEPT_RE = new RegExp(`["'](${GPU_REZEPTE.join("|")})["']`);

// die Befehle eines run-Texts: `npm run x` wird über die Skripte aufgelöst (&& · ; · Zeilen trennen)
function befehle(text, skripte, tiefe = 0) {
    const out = [];
    for (const b of String(text || "")
        .split(/&&|\|\||;|\n/)
        .map((x) => x.trim())
        .filter(Boolean)) {
        const m = /^npm run ([\w:.-]+)/.exec(b);
        if (m && typeof skripte[m[1]] === "string" && tiefe < 16) out.push(...befehle(skripte[m[1]], skripte, tiefe + 1));
        else out.push(b);
    }
    return out;
}

// das Rezept einer Datei und ihrer lokalen requires: { klasse: "gpu" | "bedingt" | null, wo }
// trägt der Befehl die Bedingung X des Zweigs? true · false · null (nicht zu lesen)
// (der Schalter der Weiche `SELBSTTEST` aus welt-boot IST `--selftest`, direkt im Zweig oder über einen Namen)
function bedingungIm(t, ausdruck, befehl) {
    const m = /^\s*\(?\s*([A-Za-z_$][\w$]*)\s*\?/.exec(ausdruck);
    const def = m && (m[1] === "SELBSTTEST" ? [, m[1]] : new RegExp(`(?:const|let|var)\\s+${m[1]}\\s*=\\s*([^;\\n]+)`).exec(t));
    if (!def) return null;
    const text = def[1].replace(/\bSELBSTTEST\b/g, '"--selftest"');
    const schalter = [...text.matchAll(/["'](--[\w-]+)["']/g)].map((x) => x[1]);
    const env = [...text.matchAll(/process\.env\.(\w+)/g)].map((x) => x[1]);
    if (!schalter.length && !env.length) return null;
    const worte = String(befehl || "").split(/\s+/);
    return schalter.some((x) => worte.includes(x)) || env.some((x) => worte.some((w) => w.startsWith(x + "=")));
}

function klasseDerDatei(datei, lies, gesehen = new Set(), befehl = "") {
    if (gesehen.has(datei)) return { klasse: null };
    gesehen.add(datei);
    const t = lies(datei);
    if (t == null) return { klasse: null };
    let bedingt = null;
    for (const m of t.matchAll(ART)) {
        if (!REZEPT_RE.test(m[1])) continue;
        const wo = `${path.relative(ROOT, datei).replace(/\\/g, "/")} (art: ${m[1].trim()})`;
        // jeder Zweig ein Echt-Rezept (`ECHT ? "echt" : "linse"`) ist so fest wie keiner
        const zweige = [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]);
        if (!/\?/.test(m[1]) || zweige.every((z) => GPU_REZEPTE.includes(z))) return { klasse: "gpu", wo };
        // der Zweig `X ? <Echt> : "null"` (oder `X ? "null" : <Echt>`): der Befehl entscheidet X
        const dann = /\?\s*["'](null|standard)["']\s*:/.test(m[1]);
        const an = dann || /:\s*["'](null|standard)["']\s*\)?\s*$/.test(m[1]) ? bedingungIm(t, m[1], befehl) : null;
        if (an !== null && an !== dann) return { klasse: "gpu", wo: wo + " — der Befehl entscheidet die Bedingung" };
        if (an !== null) continue;
        bedingt = bedingt || { klasse: "bedingt", wo };
    }
    for (const m of t.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) {
        let f = path.resolve(path.dirname(datei), m[1]);
        if (!/\.c?js$/.test(f)) f += ".cjs";
        const k = klasseDerDatei(f, lies, gesehen, befehl);
        if (k.klasse === "gpu") return { klasse: "gpu", wo: `${path.relative(ROOT, datei).replace(/\\/g, "/")} → ${k.wo}` };
        if (k.klasse === "bedingt") bedingt = bedingt || k;
    }
    return bedingt || { klasse: null };
}

const liesPlatte = (f) => (fs.existsSync(f) ? ausDatei(f) : null);

// die Klasse eines Schritts (run-Text): "gpu" schlägt "bedingt" schlägt "cpu"
function klasseDesLaufs(run, skripte, lies = liesPlatte, root = ROOT) {
    let bedingt = null;
    for (const b of befehle(run, skripte)) {
        const m = /\bnode\s+(?:--\S+\s+)*([\w./-]+\.c?js)\b/.exec(b);
        if (!m) continue;
        const k = klasseDerDatei(path.resolve(root, m[1]), lies, new Set(), b);
        if (k.klasse === "gpu") return k;
        if (k.klasse === "bedingt") bedingt = bedingt || k;
    }
    return bedingt || { klasse: "cpu" };
}

// DIE LÄUFER-PLÄTZE des Kontos: höchstens 20 Jobs zugleich — die EINE Zahl für die Waage und das Verteilen.
const LAEUFER_PLAETZE = 20;
// DER GROSSE SCHRITT (CW): über 5 min Median braucht er eine eigene Karte, nie die Waage (sie nennt ihn beim Namen)
const GROSS_S = 300;

module.exports = { GPU_REZEPTE, GROSS_S, LAEUFER_PLAETZE, befehle, klasseDesLaufs };
