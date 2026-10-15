// ci-schluessel.cjs — DIE CACHE-SCHLÜSSEL DER CI (K61 CI-Diät): was ein Cache trägt, und nichts sonst.
//
// Befund (Prüfung K61-1): beide Caches der Vorbereitung hingen am Hash von package-lock.json — der puppeteer-Chrome
// (`hashFiles('package-lock.json')`) und der npm-Cache von setup-node (`cache: npm`, derselbe Hash, ohne restore-keys).
// Das Lockfile trägt die Projektversion: jede Versions-Stufe (V18.546.1 → .2 änderte nur `version`) gab einen neuen
// Schlüssel, und der erste Lauf auf integ-probe und main lud den Chrome in jedem Job neu (38629080926: „npm cache is not
// found"; am 14.10. riss der Chrome-Download mit ECONNRESET eine ganze Gruppe, 38588243782). Die Wurzel: der Schlüssel
// hasht mehr als den Inhalt. Darum hier je Cache der Inhalt allein:
//   npm     die Abhängigkeiten des Lockfiles — der sha256 über `packages` ohne den Wurzel-Eintrag (dort stehen Name und
//           Version des Projekts selbst), über die Abhängigkeits-Felder des Wurzel-Eintrags und lockfileVersion
//   chrome  die Version von puppeteer-core (sie pinnt die Chrome-Revision, die das postinstall von puppeteer lädt)
// gate:ci-deckung (V) SCHLÜSSEL hält die Form: kein Cache hasht package.json/package-lock.json, jeder trägt restore-keys,
// setup-node trägt keinen eigenen Cache; sein Selbsttest fährt `schluessel()` gegen zwei Lockfiles, die sich nur in der
// Version unterscheiden (gleich) und in einer Abhängigkeit (verschieden).
//
//   node scripts/ci-schluessel.cjs        schreibt `npm=…` und `chrome=…` nach $GITHUB_OUTPUT (sonst auf stdout)
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ABH_FELDER = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies", "overrides"];

function schluessel(lock) {
    const wurzel = (lock.packages && lock.packages[""]) || {};
    const inhalt = {
        lockfileVersion: lock.lockfileVersion,
        wurzel: Object.fromEntries(ABH_FELDER.filter((f) => wurzel[f] !== undefined).map((f) => [f, wurzel[f]])),
        packages: Object.fromEntries(Object.entries(lock.packages || {}).filter(([k]) => k !== "")),
    };
    const npm = crypto.createHash("sha256").update(JSON.stringify(inhalt)).digest("hex").slice(0, 32);
    const pc = (lock.packages || {})["node_modules/puppeteer-core"];
    if (!pc || !pc.version)
        throw new Error("package-lock.json trägt kein node_modules/puppeteer-core — der Chrome hat keinen Schlüssel");
    return { npm, chrome: pc.version };
}

module.exports = { schluessel };

if (require.main === module) {
    const lock = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package-lock.json"), "utf8"));
    const k = schluessel(lock);
    const zeilen = `npm=${k.npm}\nchrome=${k.chrome}\n`;
    process.stdout.write(zeilen);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, zeilen);
}
