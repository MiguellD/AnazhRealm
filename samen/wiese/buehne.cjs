// WEGWERF (w28-samen-wiese): die Streiflicht-Bühne. EINE Seite (three r184 WebGLRenderer aus /vendor, swiftshader genügt für
// die Form), die Geometrie als Puffer bekommt und sie nackt (grau, Lambert + Schatten) oder in ihrer Ecken-Farbe zeichnet.
// Kein Stoff der Welt, kein Wind, keine Narbe: hier steht NUR die Form im Licht.
"use strict";
const fs = require("fs");
const path = require("path");
const { statikServer, starteBrowser } = require("../../scripts/lib/welt-boot.cjs");

const SEITE = `<!doctype html><meta charset="utf-8"><title>samen-wiese</title>
<style>html,body{margin:0;background:#000}canvas{display:block}</style><body>
<script src="/phyto-core.js"></script>
<script type="module">
import * as THREE from "/vendor/three.module.min.js";
const W = 1120, H = 630;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
const b64 = (s, T) => { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new T(u.buffer); };
const GEO = new Map();
// der EINE Blatt-Atlas des Kerns (phyto-core bakeLeafAtlasCanvas) — die Karten der Krone schneiden an ihm aus (alphaTest 0,5)
let ATLAS = null;
const atlas = () => {
  if (!ATLAS) { ATLAS = new THREE.CanvasTexture(window.__phytoCore.bakeLeafAtlasCanvas(document)); ATLAS.colorSpace = THREE.SRGBColorSpace; }
  return ATLAS;
};
// ein Teil: { position, normal?, color?, index } als base64 (Float32 / Uint32)
window.__geo = (key, teile) => {
  const liste = teile.map((t) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(b64(t.position, Float32Array), 3));
    if (t.color) g.setAttribute("color", new THREE.BufferAttribute(b64(t.color, Float32Array), 3));
    if (t.index) g.setIndex(new THREE.BufferAttribute(b64(t.index, Uint32Array), 1));
    if (t.uv) g.setAttribute("uv", new THREE.BufferAttribute(b64(t.uv, Float32Array), 2));
    if (t.normal) g.setAttribute("normal", new THREE.BufferAttribute(b64(t.normal, Float32Array), 3));
    else g.computeVertexNormals();
    return { g, art: t.art || "", doppel: t.doppel !== false };
  });
  GEO.set(key, liste);
  return liste.reduce((s, t) => s + (t.g.index ? t.g.index.count : t.g.attributes.position.count) / 3, 0);
};
// spec: { objekte: [{ key, inst: [x,y,z,rot,s, r,g,b, ...] }], kamera: { pos, ziel, fov }, sonne: { elev, azim }, farbe, boden, himmel, reich }
window.__zeige = (spec) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(spec.himmel || 0x9fb4c8);
  const sonne = new THREE.DirectionalLight(0xfff1dc, spec.staerke || 3.2);
  const e = (spec.sonne.elev * Math.PI) / 180, a = (spec.sonne.azim * Math.PI) / 180;
  const z = spec.kamera.ziel, R = spec.reich || 6;
  sonne.position.set(z[0] + Math.cos(e) * Math.cos(a) * 40, z[1] + Math.sin(e) * 40, z[2] + Math.cos(e) * Math.sin(a) * 40);
  sonne.target.position.set(z[0], z[1], z[2]);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(4096, 4096);
  Object.assign(sonne.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 90 });
  sonne.shadow.bias = -0.0004;
  sonne.shadow.normalBias = spec.normalBias == null ? 0.004 : spec.normalBias;
  scene.add(sonne, sonne.target);
  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x4a4438, spec.fuell == null ? 0.55 : spec.fuell));
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: spec.boden || 0x5a5248 }));
  boden.rotation.x = -Math.PI / 2;
  boden.receiveShadow = true;
  scene.add(boden);
  let tris = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (const o of spec.objekte) {
    const n = o.inst.length / 8;
    for (const t of GEO.get(o.key)) {
      if (spec.ohne && spec.ohne.includes(t.art)) continue;
      const mat = new THREE.MeshLambertMaterial({
        color: spec.farbe && t.g.attributes.color ? 0xffffff : (o.grau || 0xb4b4b4),
        vertexColors: !!(spec.farbe && t.g.attributes.color),
        side: t.doppel ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (t.art === "foliageTex" && t.g.attributes.uv) { mat.map = atlas(); mat.alphaTest = 0.5; if (!spec.farbe) mat.color.set(0x8f968a); }
      const im = new THREE.InstancedMesh(t.g, mat, n);
      for (let i = 0; i < n; i++) {
        const I = o.inst, k = i * 8;
        q.setFromAxisAngle(up, I[k + 3]);
        m4.compose(new THREE.Vector3(I[k], I[k + 1], I[k + 2]), q, new THREE.Vector3(I[k + 4], I[k + 4], I[k + 4]));
        im.setMatrixAt(i, m4);
        if (spec.farbe) im.setColorAt(i, new THREE.Color(I[k + 5], I[k + 6], I[k + 7]));
      }
      im.castShadow = im.receiveShadow = true;
      im.frustumCulled = false;
      scene.add(im);
      tris += ((t.g.index ? t.g.index.count : t.g.attributes.position.count) / 3) * n;
    }
  }
  const cam = new THREE.PerspectiveCamera(spec.kamera.fov || 60, W / H, 0.05, 600);
  cam.position.set(...spec.kamera.pos);
  cam.lookAt(...z);
  renderer.render(scene, cam);
  scene.traverse((x) => { if (x.material) x.material.dispose(); if (x.isInstancedMesh) x.dispose(); });
  sonne.shadow.map && sonne.shadow.map.dispose();
  return { tris, calls: renderer.info.render.calls };
};
// die Pixel des letzten Bilds (für Maße): RGBA von unten nach oben
window.__pixel = () => {
  const gl = renderer.getContext(), buf = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return { w: W, h: H, b64: btoa(s) };
};
window.__bereit = true;
</script></body>`;

const f32 = (a) => Buffer.from(new Float32Array(a).buffer).toString("base64");
const u32 = (a) => Buffer.from(new Uint32Array(a).buffer).toString("base64");

// ein Brücken-Bau (bau.cjs, JSON) → die Teile der Bühne, in Welt-Metern (× skala)
function teileAusDump(datei, skala = 1, filter = null) {
    const r = JSON.parse(fs.readFileSync(datei, "utf8"));
    const out = [];
    for (const m of r.meshes) {
        if (!m.attrs || !m.attrs.position || m.teil === "schatten") continue;
        if (filter && !filter(m)) continue;
        const pos = new Float32Array(new Uint8Array(Buffer.from(m.attrs.position.b64, "base64")).buffer);
        const p2 = new Float32Array(pos.length);
        for (let i = 0; i < pos.length; i++) p2[i] = pos[i] * skala;
        out.push({
            art: m.kind,
            position: Buffer.from(p2.buffer).toString("base64"),
            normal: m.attrs.normal ? m.attrs.normal.b64 : null,
            color: m.attrs.color && m.attrs.color.itemSize === 3 ? m.attrs.color.b64 : null,
            index: m.index || null,
            uv: m.kind === "foliageTex" && m.attrs.uv ? m.attrs.uv.b64 : null,
            doppel: !m.mat || m.mat.side === 2,
        });
    }
    return out;
}

async function mitBuehne(port, cb) {
    const server = statikServer({ seiten: { "/__samen.html": SEITE } });
    await server.lausche(port);
    const browser = await starteBrowser({ art: "webgl", frist: 240000 });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1120, height: 630, deviceScaleFactor: 1 });
        await page.goto("http://127.0.0.1:" + port + "/__samen.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction("window.__bereit === true", { timeout: 60000 });
        const geo = (key, teile) => page.evaluate((k, t) => window.__geo(k, t), key, teile);
        const zeige = async (spec, datei) => {
            const r = await page.evaluate((s) => window.__zeige(s), spec);
            if (datei) await page.screenshot({ path: datei, type: "png" });
            return r;
        };
        const pixel = async () => {
            const p = await page.evaluate(() => window.__pixel());
            return { w: p.w, h: p.h, daten: Buffer.from(p.b64, "base64") };
        };
        return await cb({ geo, zeige, pixel, page });
    } finally {
        await browser.close();
        server.close();
    }
}

module.exports = { mitBuehne, teileAusDump, f32, u32 };
