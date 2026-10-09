// Adapter-Sonde (0910-1 B): trägt swiftshader rg11b10ufloat-renderable, und wie rundet er beim Schreiben (1 + ¾ ulp)?
const path = require("path");
const root = process.argv[2];
const puppeteer = require(path.join(root, "node_modules", "puppeteer"));
const { softwareWebGpuArgs } = require(path.join(root, "scripts", "lib", "software-gpu.cjs"));
const SHADER = [
    "@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {",
    "    let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));",
    "    return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);",
    "}",
    "@fragment fn fs() -> @location(0) vec4f { return vec4f(1.01171875, 1.01171875, 1.0234375, 1.0); }",
].join("\n");
(async () => {
    const b = await puppeteer.launch({ headless: true, args: softwareWebGpuArgs() });
    const p = await b.newPage();
    const srv = require("http").createServer((q, s) => s.end("<html></html>"));
    await new Promise((r) => srv.listen(7909, "127.0.0.1", r));
    await p.goto("http://127.0.0.1:7909/");
    const r = await p.evaluate(async (code) => {
        const a = await navigator.gpu.requestAdapter();
        const info = a.info || {};
        const hat = a.features.has("rg11b10ufloat-renderable");
        if (!hat) return { vendor: info.vendor, architecture: info.architecture, rg11b10: false };
        const dev = await a.requestDevice({ requiredFeatures: ["rg11b10ufloat-renderable"] });
        const tex = dev.createTexture({ size: [1, 1], format: "rg11b10ufloat", usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
        const m = dev.createShaderModule({ code });
        const pipe = dev.createRenderPipeline({ layout: "auto", vertex: { module: m, entryPoint: "vs" }, fragment: { module: m, entryPoint: "fs", targets: [{ format: "rg11b10ufloat" }] }, primitive: { topology: "triangle-list" } });
        const buf = dev.createBuffer({ size: 256, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const enc = dev.createCommandEncoder();
        const pass = enc.beginRenderPass({ colorAttachments: [{ view: tex.createView(), loadOp: "clear", clearValue: [0, 0, 0, 0], storeOp: "store" }] });
        pass.setPipeline(pipe);
        pass.draw(3);
        pass.end();
        enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: 256 }, [1, 1]);
        dev.queue.submit([enc.finish()]);
        await buf.mapAsync(GPUMapMode.READ);
        const w = new Uint32Array(buf.getMappedRange())[0];
        return { vendor: info.vendor, architecture: info.architecture, rg11b10: true, roh: w.toString(16), rundung: (w & 0x3f) === 0 ? "gegen null" : "zum naechsten" };
    }, SHADER);
    console.log(JSON.stringify(r));
    await b.close();
    srv.close();
})().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
