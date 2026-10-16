// software-gpu.cjs — DAS EINE START-REZEPT für jede Linse, die WebGPU fährt (05.10.). Vorher trug jedes Skript seine
// eigene Schalter-Liste (13 Kopien in 5 Varianten), und jede Variante war auf EINER Plattform falsch:
//   · Linux (CI-Runner, Chrome 148, Labor-Branch diag/linux-geraet): mit nur Dawns swiftshader-Adapter findet der
//     GPU-Prozess keine Ablage für die Canvas-Swapchain — shared_image_factory „Could not find SharedImageBackingFactory
//     … WebgpuSwapChainTexture, RGBA_8888" → „SharedImageStub: Unable to create shared image" → crashpad-Schnappschuss →
//     das Gerät stirbt beim ersten getCurrentTexture (device.lost „destroyed · Device was destroyed", danach „Instance
//     dropped" für jeden offenen popErrorScope/mapAsync). Eine nackte WebGPU-Seite ohne Spiel verlor es nach 0,57 s.
//     Von sieben Rezepten trug genau eines die Swapchain (480 Frames ohne Verlust): Vulkan im GPU-Prozess auf swiftshader
//     + ANGLE auf swiftshader + keine Vulkan-Oberfläche. Ohne ANGLE-swiftshader (Vulkan + ANGLE-Vulkan), mit Graphite,
//     mit chrome-headless-shell, unter Xvfb mit Fenster: das Gerät starb jedes Mal.
//   · Windows (Chrome for Testing): genau diese Schalter liefern KEINEN Adapter („No available adapters", der Renderer
//     fiel still auf WebGL2 — sieben Linsen, die „echtes WebGPU" im Kommentar trugen, fuhren so den Rückfall); dort trägt
//     nur Dawns Schalter, und `--use-angle=swiftshader` daneben nimmt den Adapter wieder weg.
// DIE WEICHE (13.10., K39): lokal fährt jede Linse den HARDWARE-Adapter, die CI (env CI=true) swiftshader. Auf swiftshader
// kostete ein Pipeline-Bau 42–292 s und die Arbeiter-CPU lag voll, während die Radeon stillstand. `LINSE_GPU=software`
// ist der ausdrückliche Rückweg für Paritäts-Läufe (`LINSE_GPU=hardware` erzwingt die Karte). Hardware gilt nur unter
// Windows, wo das Rezept gemessen ist; anderswo fährt die Linse swiftshader. Jede Linse nennt ihren Adapter
// (`adapterZeile`), damit kein Bericht ein swiftshader-Ergebnis als Radeon ausgibt. Zeit-Linsen (gpu-bank, band, ABAB,
// jedes ms-Urteil) laufen nur unter dem GPU-Schloss — die Weiche ändert daran nichts.
// DIE ZEIT-ACHSE (14.10., K39-2): die Weiche fragt zwei Dinge — WO (CI oder lokal) und WAS die Linse urteilt. Eine Linse
// OHNE Zeit-Urteil (Bild, Zählung, Struktur) fährt lokal die Karte, auch die WebGL-Familie (68 Linsen fuhren bis hier
// ANGLE auf swiftshader, die Radeon stand still); eine Linse MIT Zeit-Urteil (`zeit: true`, ein ms-/fps-Richter ohne
// GPU-Schloss) fährt swiftshader wie die CI — ihr Band ist dort geeicht, und die geteilte Karte fälscht jede Zeit.
// Die WebGL-Linse auf der Karte trägt WebGL2 wie auf swiftshader (navigator.gpu fällt, die Welt wählt ihren Rückfall).
// Die Wand: gate:start-rezept (scripts/diag-start-rezept.cjs) — kein anderes Skript trägt die Schalter als Literal, keine
// Linse ruft das swiftshader-Rezept an der Weiche vorbei, jede Linse an der Weiche nennt ihren Adapter, W5 die Zeit-Zeile.
"use strict";

const path = require("path");

// DER CPU-COMPOSITOR (15.10., K67): auf swiftshader rastert der GPU-Prozess auch jedes Compositor-Bild auf der CPU, und
// eine endlose CSS-Animation hält den Compositor im Takt, auch wenn der Haupt-Thread steht. Das Glimmen des Ladeschirms
// hielt die vier Raster-Fäden des Läufers (`Thread<NN>`, die Stall-Akte nennt sie) voll; jeder synchrone Programm-Bau der
// Seite wartete dahinter — gate:webgl-probe 60–340 s, Risse bei 300 s. Diagnose 6 (38692263047, je Arm 32 Läufe): mit
// Glimmen 5 über 120 s, Raster-CPU p90 771 s; ohne 0 über 120 s, p90 254 s. Die Linse wünscht weniger Bewegung, die Seite
// hält dann jede Deko-Animation an (index.html, prefers-reduced-motion).
const CPU_COMPOSITOR = ["--force-prefers-reduced-motion"];
const BASIS = ["--no-sandbox", "--disable-setuid-sandbox", "--enable-unsafe-swiftshader", ...CPU_COMPOSITOR];
// Linux: die Swapchain braucht die Vulkan-Ablage des GPU-Prozesses (swiftshader), ANGLE auf swiftshader, keine Oberfläche.
const LINUX_SWAPCHAIN = ["--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--disable-vulkan-surface"];

// WebGPU auf dem Software-Renderer (swiftshader, CPU-Raster) — für die Plattform, auf der der Prozess läuft.
function softwareWebGpuArgs(plattform = process.platform) {
    const a = [...BASIS, "--enable-unsafe-webgpu", "--use-webgpu-adapter=swiftshader"];
    if (plattform === "linux") a.push(...LINUX_SWAPCHAIN);
    return a;
}

// WebGPU auf der ECHTEN GPU (Hardware-Adapter) — die Werkbank `--echt` mit Fenster, jede Linse headless an der Weiche.
function echteWebGpuArgs() {
    return ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist"];
}

// WebGL2 auf swiftshader (ANGLE) — die CI und jede Zeit-Linse der WebGL-Familie.
function softwareWebglArgs() {
    return ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox", ...CPU_COMPOSITOR];
}

// WebGL2 auf der Karte (ANGLE am Treiber); navigator.gpu fällt, damit die Welt wie auf swiftshader ihren WebGL2-Rückfall wählt.
function hardwareWebglArgs() {
    return ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blocklist", "--disable-blink-features=WebGPU"];
}

// DIE EINE WEICHE: "software" (swiftshader) oder "hardware" (der Adapter der Maschine). `zeit`: die Linse urteilt über eine
// Zeit (ms, fps) — sie fährt swiftshader wie die CI, außer LINSE_GPU sagt es; `karte` (der Job `echt`, K65): die Karte ohne Zeit.
function linsenGpu(env = process.env, plattform = process.platform, { zeit = false } = {}) {
    if (env.LINSE_GPU === "software" || env.LINSE_GPU === "hardware") return env.LINSE_GPU;
    if (env.LINSE_GPU === "karte") return zeit || plattform !== "win32" ? "software" : "hardware";
    if (env.LINSE_GPU) throw new Error(`LINSE_GPU=${env.LINSE_GPU} — erlaubt sind software, hardware und karte`);
    if (env.CI === "true" || zeit) return "software";
    return plattform === "win32" ? "hardware" : "software";
}

// Die Schalter jeder WebGPU-Linse (welt-boot `linse`, die Werkbank, die S0-Probe).
function linsenWebGpuArgs(env = process.env, plattform = process.platform, o = {}) {
    return linsenGpu(env, plattform, o) === "hardware" ? echteWebGpuArgs() : softwareWebGpuArgs(plattform);
}

// Die Schalter jeder WebGL-Linse (welt-boot `webgl`).
function linsenWebglArgs(env = process.env, plattform = process.platform, o = {}) {
    return linsenGpu(env, plattform, o) === "hardware" ? hardwareWebglArgs() : softwareWebglArgs();
}

// Software oder Karte am GELIEFERTEN Adapter (nicht am Wunsch): swiftshader/llvmpipe/lavapipe heißen Software.
const SOFTWARE_ADAPTER = /swiftshader|llvmpipe|lavapipe|software|subzero/i;
function istHardwareAdapter(info) {
    return !!info && !info.fehlt && !SOFTWARE_ADAPTER.test(`${info.vendor || ""} ${info.architecture || ""} ${info.renderer || ""}`);
}

// DIE ZEIT-ZEILE (W5): eine Zeit-Linse auf der Karte ist ROT — außer `echt`, dort misst sie unter dem GPU-Schloss.
function zeitZeile({ zeit, art, info }) {
    if (!zeit || art === "echt" || !istHardwareAdapter(info)) return null;
    const a = info.renderer || `${info.vendor}/${info.architecture}`;
    return `Zeit-Linse auf dem Hardware-Adapter (${a}) — ihr Band ist auf swiftshader geeicht, die geteilte Karte fälscht die Zeit; zeit: true fährt swiftshader`;
}

// DIE ADAPTER-ZEILE: der Adapter, den der gestartete Browser WIRKLICH liefert (vendor/architecture), als erste Zeile nach
// dem Start. Eine eigene Probe-Seite (file:// ist ein sicherer Kontext, about:blank trägt kein navigator.gpu), danach zu.
// `webgl`: der WebGL2-Renderer (ANGLE) statt des WebGPU-Adapters — die WebGL-Linse nennt, was SIE zeichnet.
async function adapterZeile(browser, { webgl = false } = {}) {
    const seite = await browser.newPage();
    let info;
    try {
        await seite.goto("file:///" + path.join(__dirname, "adapter-probe.html").split(path.sep).join("/"));
        info = await seite.evaluate(async (gl2) => {
            if (gl2) {
                const gl = document.createElement("canvas").getContext("webgl2");
                if (!gl) return { fehlt: "kein webgl2" };
                const e = gl.getExtension("WEBGL_debug_renderer_info");
                const r = String(e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
                return { vendor: "webgl2", architecture: r.split(",")[1] ? r.split(",")[1].trim() : r, renderer: r };
            }
            if (!navigator.gpu) return { fehlt: "kein navigator.gpu" };
            const a = await navigator.gpu.requestAdapter();
            if (!a) return { fehlt: "kein Adapter" };
            const i = a.info || {};
            return { vendor: i.vendor || "?", architecture: i.architecture || "?" };
        }, webgl);
    } finally {
        await seite.close();
    }
    console.log(`[linse-gpu] ${info.fehlt || info.vendor + "/" + info.architecture}`);
    return info;
}

module.exports = {
    softwareWebGpuArgs,
    echteWebGpuArgs,
    softwareWebglArgs,
    hardwareWebglArgs,
    linsenGpu,
    linsenWebGpuArgs,
    linsenWebglArgs,
    istHardwareAdapter,
    zeitZeile,
    adapterZeile,
    LINUX_SWAPCHAIN,
};
