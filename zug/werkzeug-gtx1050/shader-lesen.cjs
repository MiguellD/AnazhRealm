// shader-lesen.cjs <lauf.json> — die Fragment-Texte der Standard-Stoff-Pipelines (FREI_SHADER=1): nach dem Glätten der laufenden
// Nummern (nodeUniform12 → nodeUniformN, nodeVar7 → nodeVarN, binding/group/location) der Anteil der Zeilen, den ALLE teilen, je
// Text sein eigener Rest, und je Paar die Zahl verschiedener Zeilen — unterscheiden sich die Programme im Bau oder nur in Nummern?
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const P = b.pipes.filter((e) => /MeshStandard/.test(e[2]) && e[1] > 0);
const S = b.shader || {};
const glatt = (t) =>
    t
        .replace(/\b(nodeUniform|nodeVar|nodeVarying|nodeAttribute|NodeBuffer_|nodeConst)\d+/g, "$1N")
        .replace(/@(binding|group|location)\(\s*\d+\s*\)/g, "@$1(N)")
        .split(/\n/)
        .map((x) => x.trim())
        .filter(Boolean);
const zaehl = (z) => {
    const m = new Map();
    for (const x of z) m.set(x, (m.get(x) || 0) + 1);
    return m;
};
const F = [...new Set(P.map((e) => e[4]))].map((k) => [k, glatt(S[k] || ""), P.filter((e) => e[4] === k).map((e) => e[2].replace("renderPipeline_MeshStandardNodeMaterial_", "#")).join(",")]);
const bytes = (l) => l.reduce((a, x) => a + x.length + 1, 0);
// der gemeinsame Kern: je Zeile die kleinste Häufigkeit über alle Texte
const M = F.map(([, z]) => zaehl(z));
const kern = [];
for (const [x, n] of M[0]) {
    const k = Math.min(n, ...M.slice(1).map((m) => m.get(x) || 0));
    for (let i = 0; i < k; i++) kern.push(x);
}
console.log(F.length + " Fragment-Texte · der Kern, den alle teilen (geglättet): " + kern.length + " Zeilen = " + bytes(kern) + " Zeichen");
for (const [k, z, wer] of F) console.log(k.padEnd(18) + " " + wer.padEnd(10) + " Zeilen " + z.length + " = " + bytes(z) + " Zeichen · über dem Kern " + (bytes(z) - bytes(kern)) + " (" + Math.round((100 * (bytes(z) - bytes(kern))) / bytes(z)) + " %)");
console.log("--- je Paar: Zeilen, die nur einer von beiden trägt (geglättet)");
for (let i = 0; i < F.length; i++) {
    const zeile = [];
    for (let j = 0; j < F.length; j++) {
        if (i === j) { zeile.push("   ·"); continue; }
        let d = 0;
        for (const [x, n] of M[i]) d += Math.max(0, n - (M[j].get(x) || 0));
        for (const [x, n] of M[j]) d += Math.max(0, n - (M[i].get(x) || 0));
        zeile.push(String(d).padStart(4));
    }
    console.log(F[i][2].padEnd(10) + zeile.join(" "));
}
// das ähnlichste Paar: was unterscheidet sie?
let best = null;
for (let i = 0; i < F.length; i++)
    for (let j = i + 1; j < F.length; j++) {
        const a = [...M[i]].filter(([x, n]) => n > (M[j].get(x) || 0)).map(([x]) => x);
        const c = [...M[j]].filter(([x, n]) => n > (M[i].get(x) || 0)).map(([x]) => x);
        if (!best || a.length + c.length < best[0]) best = [a.length + c.length, F[i][2], F[j][2], a, c];
    }
console.log("--- das ähnlichste Paar " + best[1] + " ↔ " + best[2] + ": " + best[0] + " Zeilen");
for (const x of best[3].slice(0, 10)) console.log("  A: " + x.slice(0, 170));
for (const x of best[4].slice(0, 10)) console.log("  B: " + x.slice(0, 170));
