// diag-gpu-fehler.cjs — DER SELBSTTEST DER GPU-FEHLER-LINSE (Welle L, Befund V-D7; scripts/lib/gpu-fehler.cjs). Die Linse
// muss einen Draw ohne gesetzten Vertex-Slot SYNCHRON mit Pipeline und Pass nennen und die Device-Meldung fangen — sonst
// wäre jede „0 Fehler"-Zahl der Werkbank vakuös. Eine nackte WebGPU-Seite (swiftshader, kein Spiel): eine Pipeline mit
// ZWEI Vertex-Puffern, gesetzt nur Slot 0, ein drawIndexed → die Linse nennt Slot 1; dieselbe Pipeline mit beiden Slots →
// kein Eintrag.
//   node scripts/diag-gpu-fehler.cjs --selftest          Port: GPU_FEHLER_PORT (Standard 4423)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const http = require("http");
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { GPU_FEHLER_INSTALL } = require("./lib/gpu-fehler.cjs");

const PORT = Number(process.env.GPU_FEHLER_PORT || 4423);
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

async function probe() {
    const F = window.__gpuFehler;
    if (!F) return { err: "Abgriff fehlt" };
    const adapter = navigator.gpu && (await navigator.gpu.requestAdapter());
    if (!adapter) return { err: "kein Adapter" };
    const dev = await adapter.requestDevice();
    const code = `@vertex fn vs(@location(0) a: vec3f, @location(1) b: f32) -> @builtin(position) vec4f { return vec4f(a * b, 1.0); }
@fragment fn fs() -> @location(0) vec4f { return vec4f(1.0); }`;
    const mod = dev.createShaderModule({ code });
    const pipe = dev.createRenderPipeline({
        label: "probe_zwei_puffer",
        layout: "auto",
        vertex: {
            module: mod,
            entryPoint: "vs",
            buffers: [
                { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] },
                { arrayStride: 4, attributes: [{ shaderLocation: 1, offset: 0, format: "float32" }] },
            ],
        },
        fragment: { module: mod, entryPoint: "fs", targets: [{ format: "rgba8unorm" }] },
        primitive: { topology: "triangle-list" },
    });
    const tex = dev.createTexture({ size: [4, 4], format: "rgba8unorm", usage: GPUTextureUsage.RENDER_ATTACHMENT });
    const vb0 = dev.createBuffer({ size: 36, usage: GPUBufferUsage.VERTEX });
    const vb1 = dev.createBuffer({ size: 12, usage: GPUBufferUsage.VERTEX });
    const ib = dev.createBuffer({ size: 12, usage: GPUBufferUsage.INDEX });
    const lauf = (beide) => {
        const enc = dev.createCommandEncoder({ label: "probe_encoder" });
        const pass = enc.beginRenderPass({
            label: beide ? "probe_pass_voll" : "probe_pass_luecke",
            colorAttachments: [{ view: tex.createView(), loadOp: "clear", storeOp: "store" }],
        });
        pass.setPipeline(pipe);
        pass.setVertexBuffer(0, vb0);
        if (beide) pass.setVertexBuffer(1, vb1);
        pass.setIndexBuffer(ib, "uint32");
        pass.drawIndexed(3);
        pass.end();
        dev.queue.submit([enc.finish()]);
    };
    lauf(false);
    const nachLuecke = F.draws.length;
    lauf(true);
    const nachVoll = F.draws.length;
    await dev.queue.onSubmittedWorkDone();
    await new Promise((r) => setTimeout(r, 300));
    return { nachLuecke, nachVoll, draw: F.draws[0] || null, device: F.device.slice(0, 2) };
}

(async () => {
    if (!process.argv.includes("--selftest")) {
        console.log("Gebrauch: node scripts/diag-gpu-fehler.cjs --selftest (die Linse selbst fährt in der Werkbank: gpu-fehler)");
        process.exit(0);
    }
    console.log("=== SELBST-TEST: die GPU-Fehler-Linse nennt den Draw ohne Vertex-Slot beim Namen ===");
    const server = http.createServer((req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.end("<!doctype html><title>gpu-fehler</title>");
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(GPU_FEHLER_INSTALL);
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
    const out = await page.evaluate(probe);
    await browser.close();
    server.close();
    if (out.err) check("Probe lief", false, out.err);
    else {
        const d = out.draw || {};
        check(
            "der Draw ohne Slot 1 steht mit Pipeline und Pass im Protokoll",
            out.nachLuecke === 1 && Array.isArray(d.fehlt) && d.fehlt.join() === "1" && d.pipeline === "probe_zwei_puffer" && d.pass === "probe_pass_luecke",
            JSON.stringify(d)
        );
        check("der Draw mit beiden Slots bleibt still", out.nachVoll === 1, `Einträge ${out.nachVoll}`);
        check(
            "die Device-Meldung (uncapturederror) kommt an, mit dem Pass",
            out.device.length >= 1 && /vertex buffer|slot/i.test(out.device[0].msg),
            JSON.stringify(out.device[0] || null).slice(0, 240)
        );
    }
    if (errs.length) {
        console.error("\n❌ SELBST-TEST ROT — die GPU-Fehler-Linse ist vakuös.");
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN — die GPU-Fehler-Linse nennt den fehlenden Vertex-Slot mit Pipeline und Pass.");
    process.exit(0);
})().catch((e) => {
    console.error("GPU-Fehler-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
