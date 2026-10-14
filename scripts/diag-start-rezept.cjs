// diag-start-rezept.cjs — DIE WAND DES EINEN START-REZEPTS (gate:start-rezept, 05.10.): jede Linse, die WebGPU fährt,
// holt ihre Browser-Schalter aus scripts/lib/software-gpu.cjs. Befund: 13 Skripte trugen eigene Kopien in 5 Varianten;
// auf dem Linux-Runner starb das Gerät an der fehlenden Swapchain-Ablage, unter Windows fuhren sieben „WebGPU"-Linsen
// still den WebGL2-Rückfall (die Vulkan-Kopie liefert dort keinen Adapter). Rein statisch, kein Browser.
//   W1  kein Skript unter scripts/ trägt `--enable-unsafe-webgpu` oder `--use-webgpu-adapter` als String-Literal
//       (Kommentare dürfen die Schalter nennen; ein Literal heißt: eine eigene Schalter-Liste) — außer dem Rezept
//   W2  das Rezept selbst: Linux trägt die Swapchain-Schalter, Windows trägt keinen Vulkan-/ANGLE-Schalter; die Weiche
//       (13.10., K39) gibt der CI und `LINSE_GPU=software` swiftshader, lokal unter Windows den Hardware-Adapter
//   W3  keine Linse ruft das swiftshader-Rezept (`softwareWebGpuArgs`) an der Weiche vorbei — der Rückweg ist LINSE_GPU
//   W4  jede Linse an der Weiche nennt ihren Adapter: je Aufruf von `linsenWebGpuArgs()` ein `adapterZeile(…)`
//   --selftest: ein eingeschmuggeltes Literal (auch ein eigenes Adapter-Literal) wird genannt, eine Kommentar-Erwähnung
//   nicht; eine Linse am swiftshader-Rezept vorbei und eine Linse ohne Adapter-Zeile werden genannt
"use strict";
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs, echteWebGpuArgs, linsenGpu, linsenWebGpuArgs, LINUX_SWAPCHAIN } = require("./lib/software-gpu.cjs");

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

// W3 + W4 je Datei: am swiftshader-Rezept vorbei (ein Aufruf) · Weichen-Starts ohne Adapter-Zeile (Zahl gegen Zahl).
function weichenFunde(name, src) {
    const code = ohneKommentare(src);
    const vorbei = (code.match(/\bsoftwareWebGpuArgs\s*\(/g) || []).length;
    const starts = (code.match(/\blinsenWebGpuArgs\s*\(/g) || []).length;
    const zeilen = (code.match(/\badapterZeile\s*\(/g) || []).length;
    return {
        w3: vorbei ? [`${name}: ${vorbei}× softwareWebGpuArgs() — nimm linsenWebGpuArgs(), der Rückweg ist LINSE_GPU=software`] : [],
        w4:
            starts > zeilen
                ? [`${name}: ${starts} Start(s) an der Weiche, ${zeilen} Adapter-Zeile(n) — nach dem Start await adapterZeile(browser)`]
                : [],
    };
}

function wand() {
    const w1 = [];
    const w3 = [];
    const w4 = [];
    for (const p of dateien(path.join(ROOT, "scripts"))) {
        const rel = path.relative(ROOT, p);
        if (rel === REZEPT || rel === path.join("scripts", "diag-start-rezept.cjs")) continue;
        const name = rel.split(path.sep).join("/");
        const src = fs.readFileSync(p, "utf8");
        w1.push(...funde(name, src));
        const wf = weichenFunde(name, src);
        w3.push(...wf.w3);
        w4.push(...wf.w4);
    }
    const linux = softwareWebGpuArgs("linux");
    const win = softwareWebGpuArgs("win32");
    const w2 = [];
    for (const s of LINUX_SWAPCHAIN) if (!linux.includes(s)) w2.push(`Linux ohne ${s}`);
    for (const s of win) if (/^--(use-vulkan|use-angle|enable-features=Vulkan)/.test(s)) w2.push(`Windows mit ${s} (kein Adapter)`);
    if (!win.includes("--use-webgpu-adapter=swiftshader")) w2.push("Windows ohne Dawns swiftshader-Adapter");
    // die Weiche: die CI und der Rückweg fahren swiftshader, lokal unter Windows der Hardware-Adapter
    const gleich = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
    if (linsenGpu({ CI: "true" }, "win32") !== "software") w2.push("Weiche: CI=true fährt nicht swiftshader");
    if (linsenGpu({ LINSE_GPU: "software" }, "win32") !== "software") w2.push("Weiche: LINSE_GPU=software fährt nicht swiftshader");
    if (linsenGpu({}, "win32") !== "hardware") w2.push("Weiche: lokal unter Windows nicht der Hardware-Adapter");
    if (!gleich(linsenWebGpuArgs({ CI: "true" }, "linux"), softwareWebGpuArgs("linux"))) w2.push("Weiche: CI-Linux nicht das swiftshader-Rezept");
    if (!gleich(linsenWebGpuArgs({}, "win32"), echteWebGpuArgs())) w2.push("Weiche: lokal nicht das Hardware-Rezept");
    return { w1, w2, w3, w4 };
}

if (process.argv.includes("--selftest")) {
    const rot = funde("schmuggel.cjs", 'const b = await puppeteer.launch({ args: ["--no-sandbox", "--enable-unsafe-webgpu"] });');
    const adapter = funde("adapter.cjs", 'const b = await puppeteer.launch({ args: [...linsenWebGpuArgs(), "--use-webgpu-adapter=d3d12"] });');
    const kommentar = funde("kommentar.cjs", "// fährt `--use-webgpu-adapter=swiftshader` (s. Rezept)\nconst x = 1; // \"--enable-unsafe-webgpu\" im Kommentar");
    const vorbei = weichenFunde("vorbei.cjs", "const b = await puppeteer.launch({ args: softwareWebGpuArgs() });\nawait adapterZeile(b);");
    const stumm = weichenFunde("stumm.cjs", "const b = await puppeteer.launch({ args: linsenWebGpuArgs() });\n// await adapterZeile(b) nur im Kommentar");
    const recht = weichenFunde("recht.cjs", "const b = await puppeteer.launch({ args: linsenWebGpuArgs() });\nawait adapterZeile(b);");
    const ok =
        rot.length === 1 &&
        adapter.length === 1 &&
        kommentar.length === 0 &&
        vorbei.w3.length === 1 &&
        stumm.w4.length === 1 &&
        recht.w3.length + recht.w4.length === 0;
    console.log(
        `${ok ? "✅" : "❌"} SELBST-TEST: Literal genannt (${rot.join(" | ") || "—"}) · eigenes Adapter-Literal genannt (${adapter.join(" | ") || "—"})` +
            ` · Kommentar still (${kommentar.length}) · am Rezept vorbei genannt (${vorbei.w3.length}) · ohne Adapter-Zeile genannt (${stumm.w4.length})` +
            ` · rechte Linse still (${recht.w3.length + recht.w4.length})`
    );
    process.exit(ok ? 0 : 1);
}

const { w1, w2, w3, w4 } = wand();
if (w1.length || w2.length || w3.length || w4.length) {
    for (const f of w1) console.log(`❌ W1 eigene Schalter-Liste: ${f} — nimm linsenWebGpuArgs()/echteWebGpuArgs() aus ${REZEPT_NAME}`);
    for (const f of w2) console.log(`❌ W2 Rezept: ${f}`);
    for (const f of w3) console.log(`❌ W3 am Rezept vorbei: ${f}`);
    for (const f of w4) console.log(`❌ W4 Adapter ungenannt: ${f}`);
    process.exit(1);
}
console.log(
    `✅ gate:start-rezept: kein Skript trägt eigene WebGPU-Schalter · jede Linse an der Weiche nennt ihren Adapter` +
        ` · Rezept Linux ${softwareWebGpuArgs("linux").length} / Windows ${softwareWebGpuArgs("win32").length} Schalter` +
        ` · Weiche hier: ${linsenGpu()}`
);
