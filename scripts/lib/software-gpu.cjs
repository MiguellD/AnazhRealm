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
// Die Wand: gate:start-rezept (scripts/diag-start-rezept.cjs) — kein anderes Skript trägt die Schalter als Literal.
"use strict";

const BASIS = ["--no-sandbox", "--disable-setuid-sandbox", "--enable-unsafe-swiftshader"];
// Linux: die Swapchain braucht die Vulkan-Ablage des GPU-Prozesses (swiftshader), ANGLE auf swiftshader, keine Oberfläche.
const LINUX_SWAPCHAIN = ["--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-angle=swiftshader", "--disable-vulkan-surface"];

// WebGPU auf dem Software-Renderer (swiftshader, CPU-Raster) — für die Plattform, auf der der Prozess läuft.
function softwareWebGpuArgs(plattform = process.platform) {
    const a = [...BASIS, "--enable-unsafe-webgpu", "--use-webgpu-adapter=swiftshader"];
    if (plattform === "linux") a.push(...LINUX_SWAPCHAIN);
    return a;
}

// WebGPU auf der ECHTEN GPU (Fenster, Hardware-Adapter) — die Werkbank `--echt`.
function echteWebGpuArgs() {
    return ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist"];
}

module.exports = { softwareWebGpuArgs, echteWebGpuArgs, LINUX_SWAPCHAIN };
