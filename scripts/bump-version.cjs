#!/usr/bin/env node
"use strict";
// bump-version.cjs — setzt ALLE Versions-Träger in EINEM Schritt (npm run bump -- 18.492.0).
// Die Klasse, die es schliesst: 18 stale ?v=-Buster + ein stale CLAUDE.md-Stand-Kopf
// (V18.491.52–.637 wurden von Hand gestempelt, die Hälfte der Träger blieb liegen —
// gate:altlasten fing es erst hinterher). Träger: package.json · package-lock.json ·
// AnazhRealm.VERSION · jedes ?v= in index.html + worlds/*/index.html · der
// CLAUDE.md-Stand-Kopf (nur die Versionszahl, der Text bleibt).
// Ohne Argument: --check meldet jede Abweichung (Exit 1), schreibt nichts.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const arg = process.argv[2];
const check = !arg || arg === "--check";
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const ziel = check ? pkg.version : arg;
if (!/^\d+\.\d+\.\d+$/.test(ziel)) {
    console.error(`Version "${ziel}" ist kein x.y.z`);
    process.exit(2);
}

const befunde = [];
function traeger(rel, ersetzen) {
    const p = path.join(root, rel);
    if (!fs.existsSync(p)) return;
    const alt = fs.readFileSync(p, "utf8");
    const neu = ersetzen(alt);
    if (neu !== alt) {
        befunde.push(rel);
        if (!check) fs.writeFileSync(p, neu);
    }
}

traeger("package.json", (s) => s.replace(/("version":\s*")[^"]+(")/, `$1${ziel}$2`));
traeger("package-lock.json", (s) => {
    const j = JSON.parse(s);
    j.version = ziel;
    if (j.packages && j.packages[""]) j.packages[""].version = ziel;
    return JSON.stringify(j, null, 4) + "\n";
});
traeger("anazhRealm.js", (s) => s.replace(/(AnazhRealm\.VERSION = ")[0-9.]+(";)/, `$1${ziel}$2`));
const htmls = ["index.html"];
for (const d of fs.readdirSync(path.join(root, "worlds"))) {
    const h = path.join("worlds", d, "index.html");
    if (fs.existsSync(path.join(root, h))) htmls.push(h);
}
for (const h of htmls) traeger(h, (s) => s.replace(/\?v=[0-9]+\.[0-9]+(?:\.[0-9]+)?/g, `?v=${ziel}`));
traeger("CLAUDE.md", (s) => s.replace(/^(## Stand \(V)[0-9.]+/m, `$1${ziel}`));

if (check) {
    if (befunde.length) {
        console.log(`❌ Versions-Träger weichen von package.json ${ziel} ab: ${befunde.join(", ")}`);
        process.exit(1);
    }
    console.log(`✅ alle Versions-Träger tragen ${ziel}`);
} else {
    console.log(`Version ${ziel} gesetzt in: ${befunde.join(", ") || "(nichts zu tun)"}`);
}
