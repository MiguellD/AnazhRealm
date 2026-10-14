// 1310-14: DIE SEITEN-WACHE NACH DEM SCHNITT DES MONOLITHEN — bisher prüfte der Harnisch die EINE Datei anazhRealm.js (curl |
// sha256sum). Jetzt liest er die ausgelieferte index.html, folgt jedem lokalen <script src> (Stamm-Zonen, Kerne, Worker-Starter)
// und vergleicht jede ausgelieferte Datei byte-genau mit dem Arbeitsbaum; der Fingerabdruck ist der SHA über index.html und
// alle Skripte in Lade-Reihenfolge. node fingerabdruck.cjs <arbeitsbaum> [http://localhost:4312] → "<sha16> <n Skripte>
// <n stamm>", Exit 3 bei jeder Abweichung (die Datei beim Namen).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const [wt, seite = "http://localhost:4312"] = process.argv.slice(2);
(async () => {
    const hole = async (p) => Buffer.from(await (await fetch(seite + "/" + p)).arrayBuffer());
    const index = await hole("index.html");
    const fehler = [];
    const pruefe = (rel, buf) => {
        const f = path.join(wt, rel);
        if (!fs.existsSync(f)) return fehler.push(`${rel}: fehlt im Arbeitsbaum`);
        if (!fs.readFileSync(f).equals(buf)) fehler.push(`${rel}: ausgeliefert ≠ Arbeitsbaum`);
    };
    pruefe("index.html", index);
    const srcs = [...index.toString("utf8").matchAll(/<script[^>]*\bsrc="([^"]+)"/g)]
        .map((m) => m[1].split("?")[0])
        .filter((s) => !/^(https?:)?\/\//.test(s));
    const h = crypto.createHash("sha256").update(index);
    for (const s of srcs) {
        const rel = s.replace(/^\.?\//, "");
        const buf = await hole(rel);
        pruefe(rel, buf);
        h.update(rel).update(buf);
    }
    const stamm = srcs.filter((s) => /stamm\//.test(s) || /anazhRealm\.js$/.test(s)).length;
    console.log(`${h.digest("hex").slice(0, 16)} ${srcs.length} ${stamm}`);
    if (fehler.length) {
        console.error("SEITEN-WACHE ROT: " + fehler.join(" · "));
        process.exit(3);
    }
})().catch((e) => {
    console.error("SEITEN-WACHE ROT: " + e.message);
    process.exit(3);
});
