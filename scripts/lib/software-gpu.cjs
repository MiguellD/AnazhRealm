// software-gpu.cjs — DAS EINE START-REZEPT für jede Linse, die WebGPU fährt.
//   · Linux (CI-Runner): mit Dawns swiftshader-Adapter allein findet der GPU-Prozess keine Ablage für die Canvas-Swapchain
//     und das Gerät stirbt beim ersten getCurrentTexture; von sieben Rezepten trug genau eines (480 Frames ohne Verlust):
//     Vulkan im GPU-Prozess auf swiftshader + ANGLE auf swiftshader + keine Vulkan-Oberfläche (LINUX_SWAPCHAIN).
//   · Windows: genau diese Schalter liefern KEINEN Adapter (der Renderer fiele still auf WebGL2); dort trägt nur Dawns Schalter.
// DIE WEICHE: lokal fährt jede Linse den HARDWARE-Adapter, die CI (env CI=true) swiftshader; `LINSE_GPU=software` ist der
// Rückweg für Paritäts-Läufe, `LINSE_GPU=hardware` erzwingt die Karte (nur unter Windows gemessen). Jede Linse nennt ihren
// Adapter (`adapterZeile`), damit kein Bericht ein swiftshader-Ergebnis als Radeon ausgibt.
// DIE ZEIT-ACHSE: eine Linse OHNE Zeit-Urteil fährt lokal die Karte (auch die WebGL-Familie), eine MIT (`zeit: true`)
// swiftshader wie die CI — ihr Band ist dort geeicht. Die WebGL-Linse auf der Karte trägt WebGL2 wie auf swiftshader.
// Die Wand: gate:start-rezept (scripts/diag-start-rezept.cjs).
"use strict";

const path = require("path");

// DER CPU-COMPOSITOR: auf swiftshader rastert der GPU-Prozess auch jedes Compositor-Bild auf der CPU; eine endlose
// CSS-Animation hielt die Raster-Fäden voll, jeder synchrone Programm-Bau wartete dahinter (Raster-CPU p90 771 → 254 s). Die
// Linse wünscht weniger Bewegung, die Seite hält dann jede Deko-Animation an (index.html, prefers-reduced-motion).
const CPU_COMPOSITOR = ["--force-prefers-reduced-motion"];
// DIE INFO-SAMMLUNG DES BROWSERS: 120 s nach seinem Start sammelt Chrome einmal die Dawn-Info für seine Metriken (Feature
// `CollectWebGPUSupportMetrics`, `gpu_info_collector::CollectDawnInfo`) auf dem Haupt-Faden des GPU-Prozesses, der so lange
// keinen Auftrag einer Seite abarbeitet — Radeon 890M 26.10.: 217 ms; der eine GPU-Hänger je Sitzung der Station profiband.K4
// lag in 50 von 50 Sitzungen 118,6–119,2 s nach dem Seiten-Start, mitten im Mess-Fenster jedes frischen Linsen-Browsers.
const OHNE_INFO_SAMMLUNG = ["--disable-features=CollectWebGPUSupportMetrics"];
const BASIS = ["--no-sandbox", "--disable-setuid-sandbox", "--enable-unsafe-swiftshader", ...CPU_COMPOSITOR, ...OHNE_INFO_SAMMLUNG];
// Linux: die Swapchain braucht die Vulkan-Ablage des GPU-Prozesses (swiftshader), ANGLE auf swiftshader, keine Oberfläche.
const LINUX_SWAPCHAIN = ["--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--disable-vulkan-surface"];

// WebGPU auf dem Software-Renderer (swiftshader, CPU-Raster) — für die Plattform, auf der der Prozess läuft.
function softwareWebGpuArgs(plattform = process.platform) {
    const a = [...BASIS, "--enable-unsafe-webgpu", "--use-webgpu-adapter=swiftshader"];
    if (plattform === "linux") a.push(...LINUX_SWAPCHAIN);
    return a;
}

// WebGPU auf der ECHTEN GPU (Hardware-Adapter).
function echteWebGpuArgs() {
    return ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", ...OHNE_INFO_SAMMLUNG];
}

// WebGL2 auf swiftshader (ANGLE) — die CI und jede Zeit-Linse der WebGL-Familie.
function softwareWebglArgs() {
    return ["--use-angle=swiftshader", ...BASIS];
}

// WebGL2 auf der Karte (ANGLE am Treiber); navigator.gpu fällt, die Welt wählt wie auf swiftshader ihren WebGL2-Rückfall.
function hardwareWebglArgs() {
    return ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blocklist", "--disable-blink-features=WebGPU", ...OHNE_INFO_SAMMLUNG];
}

// DIE EINE WEICHE: "software" (swiftshader) oder "hardware"; `zeit`: ein ms-/fps-Urteil fährt swiftshader wie die CI, außer
// LINSE_GPU sagt es; `karte` (der Job `echt`, K65): die Karte ohne Zeit.
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

// DIE ADAPTER-ZEILE: der Adapter, den der Browser WIRKLICH liefert, als erste Zeile nach dem Start (eine eigene Probe-Seite, file://);
// `webgl`: der WebGL2-Renderer (ANGLE) statt des WebGPU-Adapters.
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
    zeitZeile,
    adapterZeile,
    istHardwareAdapter,
    LINUX_SWAPCHAIN,
};
