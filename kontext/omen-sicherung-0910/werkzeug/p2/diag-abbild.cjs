// Diagnose des Tiefen-Abbilds in der laufenden Welt: node diag-abbild.cjs <port> "<px,py>;<px,py>..."
// Liest das Abbild an Schirm-Pixeln zurück und stellt die Entfernung daneben, die der Strahl durch dieses Pixel bis zum
// Boden (Voxel-Oberfläche) und bis zum Wasserspiegel hat.
const http = require("http");
const [port, punkte] = process.argv.slice(2);
const code = `
const rend = r.state.renderer, cam = r.state.camera, be = rend.backend, dev = be.device;
const knoten = r._szeneTiefeKnoten; const ab = knoten && knoten.value;
if (!ab || !be.has(ab)) return { fehler: "kein Abbild" };
const g = be.get(ab).texture;
const bpr = Math.ceil((g.width * 4) / 256) * 256;
const buf = dev.createBuffer({ size: bpr * g.height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
const enc = dev.createCommandEncoder(); enc.copyTextureToBuffer({ texture: g }, { buffer: buf, bytesPerRow: bpr }, [g.width, g.height]);
dev.queue.submit([enc.finish()]); await buf.mapAsync(GPUMapMode.READ);
const f = new Float32Array(buf.getMappedRange().slice(0)); buf.unmap(); buf.destroy();
const db = rend.getDrawingBufferSize(new T.Vector2());
const out = { abbild: [g.width, g.height], leinwand: [db.x, db.y], near: cam.near, far: cam.far, punkte: [] };
const ray = new T.Raycaster();
for (const [px, py] of ${JSON.stringify(punkte.split(";").map((p) => p.split(",").map(Number)))}) {
  const d = f[Math.floor(py / 2) * (bpr / 4) + Math.floor(px / 2)];
  const vz = (cam.far * cam.near) / (cam.far - d * (cam.far - cam.near));
  ray.setFromCamera(new T.Vector2((px / db.x) * 2 - 1, -(py / db.y) * 2 + 1), cam);
  const o = ray.ray.origin, v = ray.ray.direction;
  const fwd = new T.Vector3(); cam.getWorldDirection(fwd); const cosA = v.dot(fwd);
  let boden = null; for (let t = 0.5; t < 600; t += 0.25) { const x = o.x + v.x * t, y = o.y + v.y * t, z = o.z + v.z * t; if (y <= r._voxelSurfaceY(x, z)) { boden = t; break; } }
  let wasser = null; for (let t = 0.5; t < 600; t += 0.25) { const x = o.x + v.x * t, y = o.y + v.y * t, z = o.z + v.z * t; const w = r._waterLevelAt(x, z); if (Number.isFinite(w) && w > -2 && y <= w) { wasser = t; break; } }
  out.punkte.push({ px, py, d: +d.toFixed(6), abbildM: +(vz / cosA).toFixed(2), bodenM: boden, wasserM: wasser });
}
return out;`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
    let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => console.log(JSON.stringify(JSON.parse(d), null, 1)));
});
req.end(JSON.stringify({ code }));
