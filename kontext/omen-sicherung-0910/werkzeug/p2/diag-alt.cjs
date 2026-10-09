// Diagnose der ALTEN Szenen-Tiefe (r184 ViewportDepthTextureNode, Klon depth24plus) in der laufenden Welt:
// node diag-alt.cjs <port> "<px,py>;..."  — der Klon wird per Pass in r32float gelesen.
const http = require("http");
const [port, punkte] = process.argv.slice(2);
const code = `
const rend = r.state.renderer, cam = r.state.camera, be = rend.backend, dev = be.device;
const knoten = r._szeneTiefeKnoten; const klon = knoten && knoten.value;
if (!klon || !be.has(klon) || !be.get(klon).texture) return { fehler: "kein Klon", typ: klon && klon.constructor && klon.constructor.name };
const q = be.get(klon).texture;
const ziel = dev.createTexture({ size: [q.width, q.height], format: "r32float", usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
const modul = dev.createShaderModule({ code: "@group(0) @binding(0) var t: texture_depth_2d;\\n@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f { let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u)); return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0); }\\n@fragment fn fs(@builtin(position) p: vec4f) -> @location(0) vec4f { return vec4f(textureLoad(t, vec2i(p.xy), 0), 0.0, 0.0, 1.0); }" });
const pipe = dev.createRenderPipeline({ layout: "auto", vertex: { module: modul, entryPoint: "vs" }, fragment: { module: modul, entryPoint: "fs", targets: [{ format: "r32float" }] }, primitive: { topology: "triangle-list" } });
const grp = dev.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: q.createView({ aspect: "depth-only" }) }] });
const bpr = Math.ceil((q.width * 4) / 256) * 256;
const buf = dev.createBuffer({ size: bpr * q.height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
const enc = dev.createCommandEncoder();
const pass = enc.beginRenderPass({ colorAttachments: [{ view: ziel.createView(), loadOp: "clear", storeOp: "store", clearValue: [1, 0, 0, 1] }] });
pass.setPipeline(pipe); pass.setBindGroup(0, grp); pass.draw(3); pass.end();
enc.copyTextureToBuffer({ texture: ziel }, { buffer: buf, bytesPerRow: bpr }, [q.width, q.height]);
dev.queue.submit([enc.finish()]); await buf.mapAsync(GPUMapMode.READ);
const f = new Float32Array(buf.getMappedRange().slice(0)); buf.unmap(); buf.destroy(); ziel.destroy();
const out = { klon: [q.width, q.height, q.format], punkte: [] };
const fwd = new T.Vector3(); cam.getWorldDirection(fwd); const ray = new T.Raycaster(); const db = rend.getDrawingBufferSize(new T.Vector2());
for (const [px, py] of ${JSON.stringify(punkte.split(";").map((p) => p.split(",").map(Number)))}) {
  const d = f[py * (bpr / 4) + px];
  ray.setFromCamera(new T.Vector2((px / db.x) * 2 - 1, -(py / db.y) * 2 + 1), cam);
  const vz = (cam.far * cam.near) / (cam.far - d * (cam.far - cam.near));
  out.punkte.push({ px, py, d: +d.toFixed(6), altM: +(vz / ray.ray.direction.dot(fwd)).toFixed(2) });
}
return out;`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
    let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => console.log(JSON.stringify(JSON.parse(d))));
});
req.end(JSON.stringify({ code }));
