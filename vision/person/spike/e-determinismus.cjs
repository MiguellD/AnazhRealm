// e-determinismus.cjs — Probe e (gesetz.md §7): zwei getrennte Prozesse mit demselben Samen geben byte-gleiche Ausgaben der Proben
// a-Treue, b, c, d (ohne Zeitfelder); ein anderer Same gibt andere. Jede Probe läuft im Kind-Prozess, kein geteilter Zustand.
"use strict";
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { same, band, wahr, schreiben, zeigen } = require("./probe.cjs");
const sha = (x) => crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");

function kind(s) {
    const teile = {
        a: require("./a-kosten.cjs").lauf(s, { kosten: false }).det,
        b: require("./b-volk.cjs").lauf(s).det,
        c: require("./c-tag.cjs").lauf(s).det,
        d: require("./d-bewegung.cjs").lauf(s).det,
    };
    const out = { gesamt: sha(teile) };
    for (const k of Object.keys(teile)) out[k] = sha(teile[k]);
    return out;
}
function prozess(s) {
    const p = spawnSync(process.execPath, [__filename, "--kind", "--same=" + s], { encoding: "utf8", maxBuffer: 1 << 20 });
    if (p.status !== 0) throw new Error("e: Kind-Prozess " + s + " brach ab: " + p.stderr);
    return JSON.parse(p.stdout);
}
if (process.argv.includes("--kind")) {
    process.stdout.write(JSON.stringify(kind(same())));
} else if (require.main === module) {
    const s = same(), anders = s + "-2";
    const l1 = prozess(s), l2 = prozess(s), l3 = prozess(anders);
    const pruef = [
        wahr("gleicher Same, zwei Prozesse: sha256 gleich", l1.gesamt === l2.gesamt, true),
        ...["a", "b", "c", "d"].map((k) => wahr("gleicher Same: " + k + " gleich", l1[k] === l2[k], true)),
        wahr("anderer Same: sha256 verschieden", l1.gesamt !== l3.gesamt, true),
        ...["a", "b", "c", "d"].map((k) => band("anderer Same: " + k + " verschieden (1 = ja)", l1[k] !== l3[k] ? 1 : 0, 0, 1)),
    ];
    zeigen(pruef);
    schreiben("e", { probe: "e Determinismus", same: s, anders, pruef, lauf1: l1, lauf2: l2, anderer: l3 });
}
