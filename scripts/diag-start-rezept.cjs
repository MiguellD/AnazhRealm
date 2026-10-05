// diag-start-rezept.cjs — DIE WAND DES EINEN START-REZEPTS (gate:start-rezept, 05.10.): jede Linse, die WebGPU fährt,
// holt ihre Browser-Schalter aus scripts/lib/software-gpu.cjs. Befund: 13 Skripte trugen eigene Kopien in 5 Varianten;
// auf dem Linux-Runner starb das Gerät an der fehlenden Swapchain-Ablage, unter Windows fuhren sieben „WebGPU"-Linsen
// still den WebGL2-Rückfall (die Vulkan-Kopie liefert dort keinen Adapter). Rein statisch, kein Browser.
//   W1  kein Skript unter scripts/ trägt `--enable-unsafe-webgpu` oder `--use-webgpu-adapter` als String-Literal
//       (Kommentare dürfen die Schalter nennen; ein Literal heißt: eine eigene Schalter-Liste) — außer dem Rezept
//   W2  das Rezept selbst: Linux trägt die Swapchain-Schalter, Windows trägt keinen Vulkan-/ANGLE-Schalter
//   --selftest: ein eingeschmuggeltes Literal wird genannt, eine Kommentar-Erwähnung nicht
"use strict";
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs, LINUX_SWAPCHAIN } = require("./lib/software-gpu.cjs");

const ROOT = path.resolve(__dirname, "..");
const REZEPT = path.join("scripts", "lib", "software-gpu.cjs");
const REZEPT_NAME = "scripts/lib/software-gpu.cjs";
const LITERAL = /["']--(enable-unsafe-webgpu|use-webgpu-adapter)\b/g;

function dateien(dir) {
    const aus = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) aus.push(...dateien(p));
        else if (/\.(c|m)?js$/.test(e.name)) aus.push(p);
    }
    return aus;
}

// Zeilen-Kommentare und Block-Kommentare fallen, bevor gesucht wird (ein Kommentar erzählt, ein Literal startet).
function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

function funde(name, src) {
    const f = [];
    const zeilen = ohneKommentare(src).split("\n");
    zeilen.forEach((z, i) => {
        for (const m of z.matchAll(LITERAL)) f.push(`${name}:${i + 1} ${m[0]}`);
    });
    return f;
}

function wand() {
    const w1 = [];
    for (const p of dateien(path.join(ROOT, "scripts"))) {
        const rel = path.relative(ROOT, p);
        if (rel === REZEPT || rel === path.join("scripts", "diag-start-rezept.cjs")) continue;
        w1.push(...funde(rel.split(path.sep).join("/"), fs.readFileSync(p, "utf8")));
    }
    const linux = softwareWebGpuArgs("linux");
    const win = softwareWebGpuArgs("win32");
    const w2 = [];
    for (const s of LINUX_SWAPCHAIN) if (!linux.includes(s)) w2.push(`Linux ohne ${s}`);
    for (const s of win) if (/^--(use-vulkan|use-angle|enable-features=Vulkan)/.test(s)) w2.push(`Windows mit ${s} (kein Adapter)`);
    if (!win.includes("--use-webgpu-adapter=swiftshader")) w2.push("Windows ohne Dawns swiftshader-Adapter");
    return { w1, w2 };
}

if (process.argv.includes("--selftest")) {
    const rot = funde("schmuggel.cjs", 'const b = await puppeteer.launch({ args: ["--no-sandbox", "--enable-unsafe-webgpu"] });');
    const kommentar = funde("kommentar.cjs", "// fährt `--use-webgpu-adapter=swiftshader` (s. Rezept)\nconst x = 1; // \"--enable-unsafe-webgpu\" im Kommentar");
    const ok = rot.length === 1 && kommentar.length === 0;
    console.log(`${ok ? "✅" : "❌"} SELBST-TEST: Literal genannt (${rot.join(" | ") || "—"}) · Kommentar still (${kommentar.length})`);
    process.exit(ok ? 0 : 1);
}

const { w1, w2 } = wand();
if (w1.length || w2.length) {
    for (const f of w1) console.log(`❌ W1 eigene Schalter-Liste: ${f} — nimm softwareWebGpuArgs()/echteWebGpuArgs() aus ${REZEPT_NAME}`);
    for (const f of w2) console.log(`❌ W2 Rezept: ${f}`);
    process.exit(1);
}
console.log(`✅ gate:start-rezept: kein Skript trägt eigene WebGPU-Schalter · Rezept Linux ${softwareWebGpuArgs("linux").length} / Windows ${softwareWebGpuArgs("win32").length} Schalter`);
