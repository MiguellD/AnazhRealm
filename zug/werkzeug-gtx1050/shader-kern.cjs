// shader-kern.cjs <lauf.json> — der Fragment-Text der Standard-Stoffe nach Teilen (FREI_SHADER=1): am kleinsten Text die Zahl der
// Bindungen je Art (Schatten-Tiefen 2D / Würfel, Vergleichs-Sampler, Texturen, Uniform-Blöcke), die Aufrufe je Abtast-Art und
// die Zeichen der Zeilen, die eine Bindung oder einen daraus abgeleiteten Wert lesen (ein Maß, kein Beweis); dazu das Paar mit
// dem kleinsten Unterschied: jede verschiedene Zeile ganz, mit den Zeichen, an denen sie auseinandergehen.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const P = b.pipes.filter((e) => /MeshStandard/.test(e[2]) && e[1] > 0);
const S = b.shader || {};
const F = [...new Set(P.map((e) => e[4]))].map((k) => [k, S[k] || "", P.filter((e) => e[4] === k).map((e) => e[2].replace("renderPipeline_MeshStandardNodeMaterial_", "#")).join(",")]);
F.sort((x, y) => x[1].length - y[1].length);
const zaehl = (t, re) => (t.match(re) || []).length;
console.log("--- je Fragment-Text: Bindungen und Abtastungen");
for (const [k, t, wer] of F) {
    console.log(
        wer.padEnd(9) + String(t.length).padStart(7) + " Z · Tiefe-2D " + zaehl(t, /: texture_depth_2d;/g) + " · Tiefe-2D-Reihe " + zaehl(t, /: texture_depth_2d_array;/g) + " · Tiefe-Würfel " + zaehl(t, /: texture_depth_cube;/g) +
            " · Textur-2D " + zaehl(t, /: texture_2d<f32>;/g) + " · Reihe " + zaehl(t, /: texture_2d_array<f32>;/g) + " · Würfel " + zaehl(t, /: texture_cube<f32>;/g) + " · 3D " + zaehl(t, /: texture_3d<f32>;/g) +
            " · Aufrufe: textureSampleCompare(Level) " + zaehl(t, /textureSampleCompare(Level)?\s*\(/g) + " · textureSample(Level|Grad|Bias) " + zaehl(t, /textureSample(Level|Grad|Bias)?\s*\(/g) + " · textureLoad " + zaehl(t, /textureLoad\s*\(/g) +
            " · Zeilen " + t.split("\n").length
    );
}
// der kleinste Text: main nach Abschnitten — die Zeilen mit einem Schatten-Vergleich und die Zeilen dazwischen
const t = F[0][1];
const main = t.slice(t.indexOf("fn main"));
const zeilen = main.split("\n");
const mit = (re) => zeilen.filter((z) => re.test(z));
const z1 = (l) => l.reduce((a, x) => a + x.length + 1, 0);
console.log("--- der kleinste Text " + F[0][2] + ": main " + main.length + " Zeichen in " + zeilen.length + " Zeilen");
console.log("Zeilen mit textureSampleCompare: " + mit(/textureSampleCompare/).length + " = " + z1(mit(/textureSampleCompare/)) + " Zeichen");
console.log("Zeilen mit textureSample/Load (ohne Compare): " + mit(/texture(Sample(Level|Grad|Bias)?|Load)\s*\(/).filter((z) => !/textureSampleCompare/.test(z)).length + " = " + z1(mit(/texture(Sample(Level|Grad|Bias)?|Load)\s*\(/).filter((z) => !/textureSampleCompare/.test(z))) + " Zeichen");
const lang = zeilen.map((z, i) => [z.length, i, z]).sort((x, y) => y[0] - x[0]).slice(0, 8);
console.log("die längsten Zeilen in main: " + lang.map((e) => e[0]).join(" · ") + " — zusammen " + lang.reduce((a, e) => a + e[0], 0) + " Zeichen");
for (const e of lang.slice(0, 4)) console.log("  [" + e[0] + "] " + e[2].trim().slice(0, 260) + " …");
// Uniform-Blöcke: die Namen der Strukturen und ihre Feldzahl
for (const m of t.matchAll(/struct (\w+) \{([^}]*)\}/g)) console.log("struct " + m[1] + ": " + m[2].split(",").filter((x) => x.trim()).length + " Felder");
// das ähnlichste Paar, ganz
const glatt = (x) => x.replace(/\b(nodeUniform|nodeVar|nodeVarying|nodeAttribute|NodeBuffer_|nodeConst)\d+/g, "$1N").replace(/@(binding|group|location)\(\s*\d+\s*\)/g, "@$1(N)").split("\n").map((s) => s.trim()).filter(Boolean);
const G = F.map(([k, tt, wer]) => [wer, glatt(tt)]);
let best = null;
for (let i = 0; i < G.length; i++)
    for (let j = i + 1; j < G.length; j++) {
        const [a, c] = [new Map(), new Map()];
        for (const x of G[i][1]) a.set(x, (a.get(x) || 0) + 1);
        for (const x of G[j][1]) c.set(x, (c.get(x) || 0) + 1);
        const nurA = [...a].filter(([x, n]) => n > (c.get(x) || 0)).map(([x]) => x);
        const nurC = [...c].filter(([x, n]) => n > (a.get(x) || 0)).map(([x]) => x);
        if (!best || nurA.length + nurC.length < best[0]) best = [nurA.length + nurC.length, G[i][0], G[j][0], nurA, nurC];
    }
console.log("--- das ähnlichste Paar " + best[1] + " ↔ " + best[2] + " (" + best[0] + " Zeilen), jede ganz");
const gemeinsamerKopf = (x, y) => { let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return i; };
for (const x of best[3]) {
    const partner = best[4].map((y) => [gemeinsamerKopf(x, y), y]).sort((p, q) => q[0] - p[0])[0];
    if (partner && partner[0] > 40) console.log("  A/B gleich bis Zeichen " + partner[0] + " von " + x.length + "/" + partner[1].length + ":\n    A …" + x.slice(Math.max(0, partner[0] - 60), partner[0] + 240) + "\n    B …" + partner[1].slice(Math.max(0, partner[0] - 60), partner[0] + 240));
    else console.log("  nur A: " + x.slice(0, 300));
}
for (const y of best[4]) if (!best[3].some((x) => gemeinsamerKopf(x, y) > 40)) console.log("  nur B: " + y.slice(0, 300));
