const ART = "__ART__";
const at = r._impostorAtlas();
const z = [...at.zellen.values()].find((q) => q && q.preset === ART && q.variant === 0);
if (!z) return { fehler: "keine Zelle", keys: [...at.zellen.keys()].slice(0, 10) };
const tex = r._karteGpuTexturen(at);
if (!tex) return { fehler: "keine GPU-Texturen" };
const t = tex[0];
const dev = r.state.renderer.backend.device;
const out = {};
for (const k of [0, 1, 2]) {
  const w = at.masse.w >> k, h = at.masse.h >> k;
  const bx = Math.ceil(w / 4), by = Math.ceil(h / 4);
  const bpr = Math.ceil((bx * 8) / 256) * 256;
  const buf = dev.createBuffer({ size: bpr * by, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const enc = dev.createCommandEncoder();
  enc.copyTextureToBuffer({ texture: t, mipLevel: k, origin: { x: 0, y: 0, z: z.idx } }, { buffer: buf, bytesPerRow: bpr, rowsPerImage: by }, { width: bx * 4, height: by * 4, depthOrArrayLayers: 1 });
  dev.queue.submit([enc.finish()]);
  await buf.mapAsync(GPUMapMode.READ);
  const u = new Uint8Array(buf.getMappedRange().slice(0));
  buf.unmap();
  buf.destroy();
  // BC1 dekodieren: nur die Alpha (3-Farben-Modus, Index 3 = leer)
  const a = new Uint8Array(w * h);
  for (let j = 0; j < by; j++)
    for (let i = 0; i < bx; i++) {
      const o = j * bpr + i * 8;
      const c0 = u[o] | (u[o + 1] << 8), c1 = u[o + 2] | (u[o + 3] << 8);
      const bits = u[o + 4] | (u[o + 5] << 8) | (u[o + 6] << 16) | (u[o + 7] << 24);
      for (let q = 0; q < 16; q++) {
        const idx = (bits >>> (2 * q)) & 3;
        const x = i * 4 + (q & 3), y = j * 4 + (q >> 2);
        if (x < w && y < h) a[y * w + x] = c0 <= c1 && idx === 3 ? 0 : 1;
      }
    }
  let s = ""; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
  out["k" + k] = { w, h, b64: btoa(s) };
}
return { idx: z.idx, fmt: at.fmt, ring: at.ringe.ringe[1], out };
