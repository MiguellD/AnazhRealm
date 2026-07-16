// diag-render-bundle.cjs — T3-SONDE: trägt das vendored three r184 (WebGPURenderer)
// echte RenderBundles (THREE.BundleGroup)? Mini-Probe mit ECHTEM Renderer
// (swiftshader-Vulkan, dieselben Flags wie diag-blick): eine synthetische Szene
// aus N "Regionen" (je 1 BatchedMesh + M Einzel-Meshes) wird EINMAL ohne und
// EINMAL mit BundleGroups gerendert. Gemessen wird:
//   (1) EXISTENZ: BundleGroup exportiert + backend.beginBundle vorhanden
//   (2) SUBMIT-KOSTEN: CPU-ms von renderer.render() vorher/nachher
//   (3) DC: renderer.info.render.drawCalls je Frame (Bundle-Replay zählt nicht neu)
//   (4) KORREKTHEIT: Pixel-Substanz beider Pfade vergleichbar
//   (5) SEMANTIK: was lebt im gecachten Bundle? (Objekt-Matrix · BatchedMesh-
//       setMatrixAt · InstancedMesh-instanceMatrix · addInstance+needsUpdate)
// Exit 0 = Bundles funktionieren + Semantik-Antworten liegen vor.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.BUNDLE_PORT || 4471);
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json" };

const PROBE_HTML = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{
 "three":"/vendor/three.module.min.js",
 "three/webgpu":"/vendor/three.webgpu.min.js",
 "three/tsl":"/vendor/three.tsl.min.js"}}</script>
</head><body><script type="module">
import * as THREE from "three";
import * as WEBGPU from "three/webgpu";
window.__probe = (async () => {
  const res = { existenz: {} };
  res.existenz.bundleGroupExport = typeof WEBGPU.BundleGroup === "function";
  if (!res.existenz.bundleGroupExport) return res;
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  document.body.appendChild(canvas);
  const renderer = new WEBGPU.WebGPURenderer({ canvas, antialias: false });
  renderer.setSize(256, 256, false);
  await renderer.init();
  renderer.info.autoReset = false;
  res.existenz.backendBeginBundle = typeof renderer.backend.beginBundle === "function";

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x304050, 30, 300); // vor dem Record — die Pipeline trägt Fog
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(5, 10, 3);
  scene.add(sun);
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
  cam.position.set(0, 26, 60); cam.lookAt(0, 0, 0);
  const rt = new THREE.RenderTarget(256, 256, { depthBuffer: true });
  renderer.setRenderTarget(rt);

  // Szene: R Regionen × (1 BatchedMesh[K Instanzen] + M Meshes) — Submit-Last.
  const R = 24, M = 25, K = 40;
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mats = [];
  for (let i = 0; i < 6; i++) {
    const m = new WEBGPU.MeshStandardNodeMaterial(); m.color = new THREE.Color().setHSL(i / 6, 0.7, 0.5);
    mats.push(m);
  }
  const regions = [];
  const tmpM = new THREE.Matrix4();
  for (let r = 0; r < R; r++) {
    const cx = ((r % 6) - 2.5) * 16, cz = (Math.floor(r / 6) - 1.5) * 16;
    const objs = [];
    const bm = new THREE.BatchedMesh(K + 8, K * 32, K * 48, mats[r % 6]);
    bm.perObjectFrustumCulled = false; bm.frustumCulled = false; bm.sortObjects = false;
    const gid = bm.addGeometry(box);
    for (let k = 0; k < K; k++) {
      const id = bm.addInstance(gid);
      tmpM.makeTranslation(cx + (k % 8) * 1.6 - 6, 0.5 + Math.floor(k / 8) * 1.6, cz + (k % 5) * 1.4 - 3);
      bm.setMatrixAt(id, tmpM);
    }
    objs.push(bm);
    for (let m = 0; m < M; m++) {
      const mesh = new THREE.Mesh(box, mats[(r + m) % 6]);
      mesh.frustumCulled = false;
      mesh.position.set(cx + (m % 5) * 2.2 - 5, 4 + Math.floor(m / 5) * 2.2, cz);
      objs.push(mesh);
    }
    // Ein InstancedMesh je 4. Region (Semantik-Frage 5c)
    if (r % 4 === 0) {
      const im = new THREE.InstancedMesh(box, mats[(r + 3) % 6], 8);
      im.frustumCulled = false;
      for (let i = 0; i < 8; i++) { tmpM.makeTranslation(cx + i * 1.2 - 4, 12, cz); im.setMatrixAt(i, tmpM); }
      im.instanceMatrix.needsUpdate = true;
      objs.push(im);
    }
    for (const o of objs) scene.add(o);
    regions.push({ objs, bm, im: objs.find(o => o.isInstancedMesh) || null });
  }

  const readPix = async () => {
    const px = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, 256, 256);
    const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    let sum = 0, nz = 0; const sig = [];
    for (let i = 0; i < u8.length; i += 4 * 61) { sum += u8[i] + u8[i+1] + u8[i+2]; if (u8[i]+u8[i+1]+u8[i+2] > 12) nz++; sig.push(u8[i]); }
    return { sum, nz, sig };
  };
  const renderN = async (n) => {
    // Warm (Pipelines/Bundles) — dann messen.
    renderer.render(scene, cam); renderer.render(scene, cam);
    await renderer.backend.device.queue.onSubmittedWorkDone();
    renderer.info.reset();
    const t0 = performance.now();
    for (let i = 0; i < n; i++) renderer.render(scene, cam);
    const cpuMs = (performance.now() - t0) / n;
    const dc = renderer.info.render.drawCalls / n;
    await renderer.backend.device.queue.onSubmittedWorkDone();
    return { cpuMs, dc };
  };

  // Phase A — OHNE Bundles.
  res.ohne = await renderN(30);
  res.ohne.pix = await readPix();

  // Phase B — je Region EIN BundleGroup.
  let begins = 0;
  const origBegin = renderer.backend.beginBundle.bind(renderer.backend);
  renderer.backend.beginBundle = (c) => { begins++; return origBegin(c); };
  const bundles = [];
  for (const reg of regions) {
    const bg = new WEBGPU.BundleGroup();
    for (const o of reg.objs) { scene.remove(o); bg.add(o); }
    scene.add(bg);
    bundles.push(bg); reg.bg = bg;
  }
  renderer.render(scene, cam); // Record-Frame
  const beginsRecord = begins; begins = 0;
  res.mit = await renderN(30);
  res.mit.beginsRecord = beginsRecord;
  res.mit.beginsSteady = begins; // 0 erwartet = Replay ohne Re-Record
  res.mit.pix = await readPix();

  // Semantik 5a — Objekt-Matrix im gecachten Bundle bewegen (Uniform-Binding?)
  const probeMesh = regions[0].objs[1];
  probeMesh.position.y += 30; probeMesh.updateMatrixWorld(true);
  renderer.render(scene, cam);
  const pixObjMove = await readPix();
  res.semantik = { objektMatrixLebt: pixObjMove.sum !== res.mit.pix.sum };
  probeMesh.position.y -= 30;

  // Semantik 5b — BatchedMesh.setMatrixAt ohne Version-Bump (matricesTexture?)
  const bm0 = regions[0].bm;
  const mv = new THREE.Matrix4().makeTranslation(0, 40, 0);
  for (let i = 0; i < 40; i++) bm0.setMatrixAt(i, mv);
  renderer.render(scene, cam);
  const pixBmMove = await readPix();
  res.semantik.batchMatrixLebt = pixBmMove.sum !== pixObjMove.sum;

  // Semantik 5c — InstancedMesh.instanceMatrix ohne Bump (Vertex-Attribut?)
  const im0 = regions[0].im;
  if (im0) {
    for (let i = 0; i < 8; i++) im0.setMatrixAt(i, mv);
    im0.instanceMatrix.needsUpdate = true;
    renderer.render(scene, cam);
    const pixImMove = await readPix();
    res.semantik.instMatrixLebt = pixImMove.sum !== pixBmMove.sum;
  }

  // Semantik 5e — KAMERA bewegt sich über gecachten Bundles (der Spiel-Normalfall).
  const pixPreCam = await readPix();
  cam.position.set(40, 10, 40); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true);
  renderer.render(scene, cam);
  const pixCam = await readPix();
  res.semantik.kameraLebt = pixCam.sum !== pixPreCam.sum;
  cam.position.set(0, 26, 60); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true);

  // Semantik 5f — LICHT (Tag/Nacht: Sonnen-Intensität/-Richtung) im gecachten Bundle.
  renderer.render(scene, cam);
  const pixPreLight = await readPix();
  sun.intensity = 0.05; sun.position.set(-5, 2, -3);
  renderer.render(scene, cam);
  const pixLight = await readPix();
  res.semantik.lichtLebt = pixLight.sum !== pixPreLight.sum;
  sun.intensity = 1.2; sun.position.set(5, 10, 3);

  // Semantik 5g — FOG-Uniforms (near/far atmen mit Streaming/Wetter).
  renderer.render(scene, cam);
  const pixPreFog = await readPix();
  scene.fog.near = 1; scene.fog.far = 20;
  renderer.render(scene, cam);
  const pixFog = await readPix();
  res.semantik.fogLebt = pixFog.sum !== pixPreFog.sum;
  scene.fog.near = 30; scene.fog.far = 300;
  renderer.render(scene, cam);

  // Semantik 5d — addInstance + needsUpdate=true → Re-Record zeigt die neue Instanz.
  const before = await readPix();
  const gid0 = 0;
  const nid = bm0.addInstance(gid0);
  bm0.setMatrixAt(nid, new THREE.Matrix4().makeScale(8, 8, 8));
  begins = 0;
  renderer.render(scene, cam); // OHNE Bump — Replay, addInstance darf NICHT erscheinen (dc eingefroren)
  const pixNoBump = await readPix();
  res.semantik.addOhneBumpUnsichtbar = pixNoBump.sum === before.sum;
  regions[0].bg.needsUpdate = true;
  renderer.render(scene, cam); // MIT Bump — Re-Record
  res.semantik.reRecordBegins = begins;
  const pixBump = await readPix();
  res.semantik.addMitBumpSichtbar = pixBump.sum !== pixNoBump.sum;

  return res;
})();
</script></body></html>`;

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/" || p === "/probe.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(PROBE_HTML);
    }
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n").slice(0, 3).join(" | ")));
    await page.goto(`http://127.0.0.1:${PORT}/probe.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const out = await page.evaluate(() => window.__probe.catch((e) => ({ fatal: (e && (e.stack || e.message)) || String(e) })), );
    await browser.close();
    server.close();

    console.log("===== T3-SONDE: RenderBundles (BundleGroup) im vendored r184 =====");
    if (pageErrors.length) console.log("Page-Errors:", pageErrors.slice(0, 3).join(" || "));
    if (!out || out.fatal) { console.log("FATAL:", out && out.fatal); process.exit(1); }
    console.log(JSON.stringify(out, (k, v) => (k === "sig" ? undefined : v), 2));
    const e = out.existenz || {};
    if (!e.bundleGroupExport || !e.backendBeginBundle) {
        console.log("❌ BundleGroup fehlt/Backend ohne beginBundle — Submit-Diät statt Bundles nötig.");
        process.exit(1);
    }
    const ok = out.mit && out.mit.beginsSteady === 0 && out.mit.pix && out.mit.pix.nz > 10 &&
        Math.abs(out.mit.pix.nz - out.ohne.pix.nz) <= Math.max(6, out.ohne.pix.nz * 0.15);
    console.log(ok ? "✅ Bundles funktionieren (Replay stabil, Bild trägt Substanz)." : "❌ Bundle-Replay/Bild inkonsistent.");
    process.exit(ok ? 0 : 1);
})().catch((e) => { console.error("DIAG-FEHLER:", e); try { server.close(); } catch (_e) {} process.exit(1); });
