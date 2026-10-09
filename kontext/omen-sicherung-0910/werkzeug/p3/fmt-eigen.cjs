// Übernimmt aus `prettier` nur die Hunks, die eigene (gegen HEAD geänderte) Zeilen berühren — Skripte außerhalb des
// format:check-Scopes tragen fremde Abweichungen, die bleiben stehen.
// node fmt-eigen.cjs <datei>   (im Worktree)
"use strict";
const fs = require("fs");
const { execFileSync } = require("child_process");
const f = process.argv[2];
const jetzt = fs.readFileSync(f, "utf8");
const schoen = execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prettier", "--stdin-filepath", f], {
    input: jetzt,
    shell: process.platform === "win32",
    maxBuffer: 1 << 28,
}).toString();
const eigen = [];
const gd = execFileSync("git", ["diff", "-U0", "HEAD", "--", f], { maxBuffer: 1 << 28 }).toString();
for (const m of gd.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const s = +m[1];
    const n = m[2] === undefined ? 1 : +m[2];
    if (n > 0) eigen.push([s, s + n - 1]);
}
// zeilenweiser Diff jetzt → schoen (LCS über Zeilen ist zu teuer; prettier ändert lokal: Anker-Suche)
const A = jetzt.split("\n");
const B = schoen.split("\n");
const aus = [];
let i = 0;
let j = 0;
let uebernommen = 0;
let gelassen = 0;
while (i < A.length || j < B.length) {
    if (i < A.length && j < B.length && A[i] === B[j]) {
        aus.push(A[i]);
        i++;
        j++;
        continue;
    }
    // die nächste gemeinsame Zeile suchen (Fenster 80)
    let best = null;
    for (let d = 1; d < 160 && !best; d++)
        for (let a = 0; a <= d; a++) {
            const b = d - a;
            if (i + a < A.length && j + b < B.length && A[i + a] === B[j + b] && A[i + a].trim().length > 2) {
                best = [a, b];
                break;
            }
        }
    if (!best) throw new Error("kein Anker bei Zeile " + (i + 1));
    const [a, b] = best;
    const von = i + 1;
    const bis = i + Math.max(a, 1);
    const trifft = eigen.some(([s, e]) => s <= bis && e >= von);
    if (trifft) {
        for (let k = 0; k < b; k++) aus.push(B[j + k]);
        uebernommen++;
    } else {
        for (let k = 0; k < a; k++) aus.push(A[i + k]);
        gelassen++;
    }
    i += a;
    j += b;
}
fs.writeFileSync(f, aus.join("\n"));
console.log(`${f}: ${uebernommen} eigene Hunks formatiert, ${gelassen} fremde gelassen`);
