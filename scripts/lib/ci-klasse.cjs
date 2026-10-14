// ci-klasse.cjs — DIE KLASSE EINES CI-SCHRITTS (K61 CI-Diät): braucht er einen Echt-Renderer?
//
// Die volle Batterie trennt ihre Gruppen in CPU und GPU (check.yml `matrix.klasse`): eine GPU-Gruppe ist die Arbeit eines
// GPU-Läufers (später der eigene Läufer am Messplatz), eine CPU-Gruppe läuft auf jedem Läufer. Die Klasse eines Schritts liest
// diese Datei aus seinen Skripten: der run-Text wird über package.json bis auf die Befehle aufgelöst, jedes `node <datei>`
// samt seinen lokalen `require` (scripts/lib …) nach dem Browser-Rezept durchsucht, das es an die EINE Weiche gibt
// (scripts/lib/welt-boot.cjs `starteBrowser({ art })`). Ein Echt-Rezept (GPU_REZEPTE dort: linse · webgl · echt) ohne
// Bedingung macht den Schritt `gpu`; steht es nur in einem Zweig (`art: X ? "linse" : "null"`), entscheidet der Befehl:
// ist X ein Schalter (`argv.includes("--bild")`) oder eine Variable (`process.env.REAL_RENDERER === "1"`), die der Befehl
// setzt, ist er `gpu`, sonst `cpu`; was so nicht zu lesen ist, bleibt `bedingt`. Der Richter ist die Laufzeit: in einer
// CPU-Gruppe meldet die Weiche jedes Echt-Rezept ROT beim Namen (CI_KLASSE).
"use strict";
const fs = require("fs");
const path = require("path");
const { GPU_REZEPTE } = require("./welt-boot.cjs");

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
function bedingungIm(t, ausdruck, befehl) {
    const m = /^\s*\(?\s*([A-Za-z_$][\w$]*)\s*\?/.exec(ausdruck);
    const def = m && new RegExp(`(?:const|let|var)\\s+${m[1]}\\s*=\\s*([^;\\n]+)`).exec(t);
    if (!def) return null;
    const schalter = [...def[1].matchAll(/["'](--[\w-]+)["']/g)].map((x) => x[1]);
    const env = [...def[1].matchAll(/process\.env\.(\w+)/g)].map((x) => x[1]);
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
        // der Zweig `X ? <Echt-Rezepte> : "null"`: der Befehl entscheidet X
        const an = /:\s*["'](null|standard)["']\s*\)?\s*$/.test(m[1]) ? bedingungIm(t, m[1], befehl) : null;
        if (an === true) return { klasse: "gpu", wo: wo + " — der Befehl setzt die Bedingung" };
        if (an === false) continue;
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

const liesPlatte = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);

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

// DIE LÄUFER-PLÄTZE des Kontos: GitHub fährt hier höchstens 20 Jobs zugleich (gemessen über alle Läufe des 14.10.: 20 um
// 20:01:04Z, als 38628488866 und 38628426005 zusammen 32 Jobs trugen — die übrigen warteten bis 344 s). Die EINE Zahl für
// die Waage (gate:ci-deckung (T) PLÄTZE) und das Verteilen (scripts/ci-zeiten.cjs --verteilen).
const LAEUFER_PLAETZE = 20;

module.exports = { GPU_REZEPTE, LAEUFER_PLAETZE, befehle, klasseDerDatei, klasseDesLaufs };
