// 1710-n B4: EIN Instrument-Eingriff, byte-gleich an beiden Seiten — die Kalt-Zeile nimmt ein CPU-Profil (0,5 ms) des
// Haupt-Fadens bis zum ersten Weltbild auf und legt es neben die JSON (<roh>.cpuprofile). node profil-patch.cjs <baum> …
"use strict";
const fs = require("fs");
const path = require("path");
const A1 = "        await page.evaluateOnNewDocument(KALT_PROBE);\n";
const N1 =
    A1 +
    "        // OMEN 1710-n (B4-ABAB): CPU-Profil 0,5 ms bis zum Weltbild, die Selbstzeit je Funktion gegen die Radeon-Zahl\n" +
    "        const cdpN = await page.target().createCDPSession();\n" +
    '        await cdpN.send("Profiler.enable");\n' +
    '        await cdpN.send("Profiler.setSamplingInterval", { interval: 500 });\n' +
    '        await cdpN.send("Profiler.start");\n';
const A2 = "            if (da) break;\n        }\n";
const N2 =
    A2 +
    "        {\n" +
    '            const { profile } = await cdpN.send("Profiler.stop");\n' +
    '            const j = OPT("--json", null);\n' +
    '            if (j) fs.writeFileSync(path.resolve(j).replace(/\\.json$/, "") + ".cpuprofile", JSON.stringify(profile));\n' +
    "        }\n";
for (const baum of process.argv.slice(2)) {
    const f = path.join(baum, "scripts", "diag-boot-stage.cjs");
    let s = fs.readFileSync(f, "utf8");
    if (s.includes("OMEN 1710-n")) {
        console.log(f, "schon gepatcht");
        continue;
    }
    for (const [a, n] of [
        [A1, N1],
        [A2, N2],
    ]) {
        if (s.split(a).length !== 2) throw new Error(`${f}: Anker nicht eindeutig: ${JSON.stringify(a)}`);
        s = s.replace(a, n);
    }
    fs.writeFileSync(f, s);
    console.log(f, "gepatcht");
}
