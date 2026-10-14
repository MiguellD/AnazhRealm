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
// Die Wand: gate:start-rezept (scripts/diag-start-rezept.cjs) — kein anderes Skript trägt die Schalter als Literal, keine
// Linse ruft das swiftshader-Rezept an der Weiche vorbei, jede Linse an der Weiche nennt ihren Adapter.
"use strict";

const path = require("path");

const BASIS = ["--no-sandbox", "--disable-setuid-sandbox", "--enable-unsafe-swiftshader"];
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

// DIE EINE WEICHE: "software" (swiftshader) oder "hardware" (der Adapter der Maschine).
function linsenGpu(env = process.env, plattform = process.platform) {
    if (env.LINSE_GPU === "software" || env.LINSE_GPU === "hardware") return env.LINSE_GPU;
    if (env.LINSE_GPU) throw new Error(`LINSE_GPU=${env.LINSE_GPU} — erlaubt sind software und hardware`);
    if (env.CI === "true") return "software";
    return plattform === "win32" ? "hardware" : "software";
}

// Die Schalter jeder Linse — die 40 Linsen rufen nur diese Funktion.
function linsenWebGpuArgs(env = process.env, plattform = process.platform) {
    return linsenGpu(env, plattform) === "hardware" ? echteWebGpuArgs() : softwareWebGpuArgs(plattform);
}

// DIE ADAPTER-ZEILE: der Adapter, den der gestartete Browser WIRKLICH liefert (vendor/architecture), als erste Zeile nach
// dem Start. Eine eigene Probe-Seite (file:// ist ein sicherer Kontext, about:blank trägt kein navigator.gpu), danach zu.
async function adapterZeile(browser) {
    const seite = await browser.newPage();
    let info;
    try {
        await seite.goto("file:///" + path.join(__dirname, "adapter-probe.html").split(path.sep).join("/"));
        info = await seite.evaluate(async () => {
            if (!navigator.gpu) return { fehlt: "kein navigator.gpu" };
            const a = await navigator.gpu.requestAdapter();
            if (!a) return { fehlt: "kein Adapter" };
            const i = a.info || {};
            return { vendor: i.vendor || "?", architecture: i.architecture || "?" };
        });
    } finally {
        await seite.close();
    }
    console.log(`[linse-gpu] ${info.fehlt || info.vendor + "/" + info.architecture}`);
    return info;
}

module.exports = { softwareWebGpuArgs, echteWebGpuArgs, linsenGpu, linsenWebGpuArgs, adapterZeile, LINUX_SWAPCHAIN };
