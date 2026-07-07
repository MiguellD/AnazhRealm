// asset-worker-harness.cjs — die EINE geteilte Browser-Worker-Naht für P1 (Gesetz #0).
// Bootet den Studio-Generator als Web-Worker (dieselben Dateien wie worlds/terrain/index.html,
// self.__PHYTO_FOUNDRY_WORKER=true) in EINER swiftshader-Chromium-Seite und reicht dem Node-
// Aufrufer eine `build(msg)`-Funktion: sie schickt eine build-asset-Anfrage an den Worker und
// gibt die Antwort ZURÜCK mit jedem Vertex-Attribut als base64 des rohen Puffers — byte-genau
// serialisierbar durch die page.evaluate-Grenze (Float32Array übersteht sie sonst nicht).
//
// mint-asset-goldens.cjs (schreibt die eingefrorenen Goldens) UND diag-asset-contract.cjs (das
// Dauer-Gate) LESEN diese eine Datei — kein zweiter Boot-Pfad, der driften kann. Die WORKER_SCRIPTS
// sind identisch zu diag-foundry-parity.cjs (dort 720/720 byte-bewiesen).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};

// Die Studio-Script-Kette EXAKT wie worlds/terrain/index.html (Reihenfolge trägt: FoliagePass
// extends THREE.Pass braucht EffectComposer davor; phytogenesis liest __phytoCore).
const WORKER_SCRIPTS = [
    "/worlds/terrain/lib/three-r128.min.js",
    "/worlds/terrain/lib/OrbitControls.js",
    "/worlds/terrain/lib/PointerLockControls.js",
    "/worlds/terrain/lib/BufferGeometryUtils.js",
    "/worlds/terrain/lib/CopyShader.js",
    "/worlds/terrain/lib/LuminosityHighPassShader.js",
    "/worlds/terrain/lib/FXAAShader.js",
    "/worlds/terrain/lib/EffectComposer.js",
    "/worlds/terrain/lib/RenderPass.js",
    "/worlds/terrain/lib/MaskPass.js",
    "/worlds/terrain/lib/ShaderPass.js",
    "/worlds/terrain/lib/UnrealBloomPass.js",
    "/phyto-core.js",
    "/worlds/terrain/phytogenesis.js",
];

function pageHtml() {
    return `<!doctype html><meta charset="utf-8"><title>asset-worker</title><body><script>
(() => {
  const S = (window.__AW = { ready: false, error: null });
  const boot =
    "self.__PHYTO_FOUNDRY_WORKER=true;" +
    "importScripts(" + ${JSON.stringify(WORKER_SCRIPTS)}.map((p) => JSON.stringify(location.origin + p)).join(",") + ");" +
    "init();";
  const worker = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
  const pending = new Map();
  let seq = 1;
  worker.onerror = (e) => { S.error = (e && e.message) || "Worker-Fehler"; };
  worker.onmessage = (ev) => {
    const m = ev.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "ready" && m.world === "terrain") S.ready = true;
    const p = pending.get(m.reqId);
    if (p) { pending.delete(m.reqId); p(m); }
  };
  const ask = (msg) => new Promise((res) => {
    const reqId = "q" + seq++;
    pending.set(reqId, res);
    worker.postMessage(Object.assign({ reqId }, msg));
  });
  // rohe Puffer-Bytes -> base64 (byte-genau, page.evaluate-sicher)
  const b64 = (typedArr) => {
    const u = new Uint8Array(typedArr.buffer, typedArr.byteOffset, typedArr.byteLength);
    let s = "";
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  };
  window.__aget = (type) => ask({ type });                 // get-recipes / -world-params / -render-config
  window.__build = (msg) => ask(Object.assign({ type: "build-asset" }, msg)).then((r) => ({
    presetId: r.presetId, seed: r.seed, lod: r.lod, cv: r.cv,
    meshes: (r.meshes || []).map((m) => {
      const out = { kind: m.kind, mat: m.mat, attrs: {} };
      for (const k of Object.keys(m)) {
        if (m[k] && m[k].array && m[k].itemSize) out.attrs[k] = { itemSize: m[k].itemSize, b64: b64(m[k].array) };
      }
      if (m.index) out.index = b64(m.index);
      return out;
    }),
  }));
})();
</script></body>`;
}

// runWithWorker(port, async (h) => {...}) — bootet Server+Chromium+Worker, ruft cb mit
// { build, getData }, räumt danach ab. Wirft bei Boot-/Worker-Fehler mit klarer Meldung.
async function runWithWorker(port, cb) {
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/" || p === "/__aw.html") {
            res.setHeader("Content-Type", "text/html");
            return res.end(pageHtml());
        }
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(port, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        const pageErrors = [];
        page.on("pageerror", (e) => pageErrors.push(String((e && e.message) || e)));
        await page.goto("http://127.0.0.1:" + port + "/__aw.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction("window.__AW && (window.__AW.ready || window.__AW.error)", {
            timeout: 120000,
            polling: 200,
        });
        const st = await page.evaluate(() => window.__AW);
        if (st.error) throw new Error("WORKER-BOOT: " + st.error);
        if (!st.ready) throw new Error("Worker ready-Timeout");
        const build = (msg) => page.evaluate((m) => window.__build(m), msg);
        const getData = (type) => page.evaluate((t) => window.__aget(t), type);
        const out = await cb({ build, getData, pageErrors });
        if (pageErrors.length) throw new Error("Seiten-Fehler: " + pageErrors.slice(0, 3).join(" · "));
        return out;
    } finally {
        await browser.close();
        server.close();
    }
}

// fingerprintMeshes(meshes) — die Meshes (Attribute als base64 vom Worker) in kompakte, byte-exakte
// Fingerabdrücke wandeln: pro Puffer sha256 + Byte-Länge statt der Rohdaten. Ein Golden ist so ~1 KB
// statt Megabytes; sha256 macht einen einzigen abweichenden Byte sicher sichtbar (Kollision
// astronomisch). Für den exakten Byte-Offset einer Divergenz dient der P0-Paritäts-Harness.
// mint + gate LESEN diese eine Funktion (kein zweiter Fingerabdruck-Pfad, der driften kann).
function fingerprintMeshes(meshes) {
    const sha = (b64) => {
        const buf = Buffer.from(b64, "base64");
        return { bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
    };
    return (meshes || []).map((m) => {
        const out = { kind: m.kind, mat: m.mat, attrs: {} };
        for (const k of Object.keys(m.attrs || {}))
            out.attrs[k] = Object.assign({ itemSize: m.attrs[k].itemSize }, sha(m.attrs[k].b64));
        if (m.index) out.index = sha(m.index);
        return out;
    });
}

module.exports = { runWithWorker, fingerprintMeshes, WORKER_SCRIPTS };
