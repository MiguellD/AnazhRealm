#!/usr/bin/env node
// buche-verlust.cjs <koord-baum> — die Kriterien, die in stand.json gegenüber dem committeten Stand (HEAD) Punkte verlieren, je mit
// dem Grund ihrer Stationen. Leser: buche.sh (die Wand „die Summe fällt“, 27.10.: Takt 8 buchte 95 statt 112 am Kopf e7a28b06, weil
// die Radeon erst 4 von 29 Stationen gemessen hatte — ungemessen ist kein Verlust).
const { execSync } = require("child_process");
const path = require("path");
const ko = path.resolve(process.argv[2]);
const f = "meisterkarte-quelle/punkte/stand.json";
const alt = JSON.parse(execSync("git show HEAD:" + f, { cwd: ko, maxBuffer: 64 << 20 }).toString()).je;
const neu = JSON.parse(require("fs").readFileSync(path.join(ko, f), "utf8")).je;
const zeilen = [];
for (const [k, a] of Object.entries(alt)) {
    const n = neu[k] || { punkte: 0, stationen: [] };
    if ((n.punkte || 0) >= (a.punkte || 0)) continue;
    const grund = (n.stationen || [])
        .filter((s) => !s.gruen)
        .map((s) => s.id + " " + s.geraet + ": " + String(s.grund || s.zahl || "?").slice(0, 60))
        .join(" · ");
    zeilen.push(k + " " + a.punkte + "→" + (n.punkte || 0) + (grund ? " (" + grund + ")" : ""));
}
console.log(zeilen.length + " Kriterien verlieren: " + zeilen.join(" | "));
