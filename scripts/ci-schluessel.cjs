// ci-schluessel.cjs — DIE CACHE-SCHLÜSSEL DER CI: was ein Cache trägt, und nichts sonst — nie die Projektversion (sie
// gab je Versions-Stufe einen neuen Schlüssel und lud den Chrome in jedem Job neu):
//   npm     der sha256 über `packages` ohne den Wurzel-Eintrag, über dessen Abhängigkeits-Felder und lockfileVersion
//   chrome  die Version von puppeteer-core (sie pinnt die Chrome-Revision des postinstall)
// gate:ci-deckung (V) SCHLÜSSEL hält die Form und fährt `schluessel()` gegen Lockfiles, die sich nur in der Version unterscheiden.
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
