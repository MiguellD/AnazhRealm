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

// V18.470 (Konsum-Matrix) — der Boot ist MANIFEST-GETRIEBEN wie die Produktion
// (anazhRealm._ensureAssetFoundry liest cores.manifest.json + injiziert
// self.__anazhCores): die fixe Studio-lib-Kette → alle Kern-Skripte in
// Manifest-Reihenfolge → die Shells zuletzt. So trägt das Harness-Buch ALLE
// Gattungen (tor/klinge/haus/kreatur …), nicht nur die Pflanzen — EINE Quelle,
// kein hartkodierter Zweitpfad. (Die Pflanzen-Goldens bleiben byte-identisch —
// gate:asset-contract ist der stehende Beweis.)
const CORES_MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "cores.manifest.json"), "utf8"));
const WORKER_SCRIPTS = (() => {
    const rel = [
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
    ];
    for (const core of CORES_MANIFEST) if (core && Array.isArray(core.scripts)) for (const s of core.scripts) rel.push("/" + s);
    for (const core of CORES_MANIFEST) if (core && typeof core.shell === "string" && core.shell) rel.push("/" + core.shell);
    return rel;
})();

function pageHtml() {
    return `<!doctype html><meta charset="utf-8"><title>asset-worker</title><body><script src="/phyto-core.js"></script><script>
(() => {
  const S = (window.__AW = { ready: false, error: null });
  const boot =
    "self.__PHYTO_FOUNDRY_WORKER=true;" +
    "self.__anazhCores=" + JSON.stringify(${JSON.stringify(CORES_MANIFEST)}) + ";" +
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
  // DER ATLAS-STECKBRIEF gegen den MALER (04.10.): der Kern-Maler malt den EINEN Blatt-Atlas hier im
  // Seiten-Kontext — je Zelle (0..2 Breitblatt, 3 Nadel) die Ausdehnung von Alpha>0 um die Zellmitte (Anteil
  // der halben Zelle) und die mittlere Alpha-Deckung der ganzen Zelle.
  window.__atlas = () => {
    const core = window.__phytoCore;
    const cv = core.bakeLeafAtlasCanvas(document);
    const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
    const Z = cv.width / 4, H = cv.height, ext = [0, 0, 0, 0], fill = [0, 0, 0, 0];
    for (let y = 0; y < H; y++) for (let x = 0; x < cv.width; x++) {
      const a = d[(y * cv.width + x) * 4 + 3]; if (!a) continue;
      const c = Math.min(3, Math.floor(x / Z)), lx = x - c * Z;
      const e = Math.max(Math.abs(lx + 0.5 - Z / 2), Math.abs(y + 0.5 - H / 2)) / (Z / 2);
      if (e > ext[c]) ext[c] = e;
      fill[c] += a / 255;
    }
    return {
      ext,
      fill: fill.map((f) => f / (Z * H)),
      steckbrief: core.BLATT_ATLAS_BREIT,
      nadel: core.BLATT_ATLAS_NADEL,
    };
  };
  // DER KARTEN-RUNDLAUF (W6): der Studio-Bäcker bäckt die Karte (Kanal bake-impostor, ohne Schale = das rohe
  // Studio-Payload), der ECHTE Karten-Codec (phyto-core, hier im Seiten-Kontext) kodiert sie zur Atlas-Schicht und
  // dekodiert sie zurück. Gemessen: Alpha-Fehler an der Schwelle, Albedo-PSNR (opake Texel, sRGB), Normalwinkel
  // (Mittel/p95, opake Texel), Mip-Deckung je Stufe gegen Stufe 0 (Codec und — zum Vergleich — die Box-Mip der GPU),
  // die mittlere LINEARE Kronenfarbe (Studio-Eingang gegen die als sRGB dekodierte Schicht). \`stoer\`: "bc1" kippt
  // Bytes der kodierten Albedo (der Selbsttest der Linse).
  window.__karte = (presetId, seed, stoer) => ask({ type: "bake-impostor", presetId, seed }).then((r) => {
    const p = r && r.payload, core = window.__phytoCore;
    if (!p || !p.albedo) return { fehler: "kein Bake" };
    const k = core.karteKodiere(p, "bc");
    if (!k) return { fehler: "Codec lieferte keine Schicht" };
    const M = core.karteMasse(p.cw, p.ch, p.V, p.nt, "bc");
    if (stoer === "bc1") for (let i = 64; i < M.a[0].bytes; i += 97) k.albedo[i] ^= 0x5a;
    const W = M.w, H = M.h, thr = core.KARTEN_GESETZ.schwelle * 255;
    const ref = core.impostorMips(p.albedo, W, H, p.V, core.KARTEN_GESETZ.schwelle, 1).stufen[0].data;
    const dec = core.bcDekodiere(k.albedo.subarray(0, M.a[0].bytes), W, H, "bc1");
    const lin = (b) => { const c = b / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    let alphaFehl = 0, se = 0, n = 0;
    const ein = [0, 0, 0], aus = [0, 0, 0];
    let nOp = 0;
    for (let i = 0; i < W * H; i++) {
      const a0 = p.albedo[i * 4 + 3] >= thr, a1 = dec[i * 4 + 3] >= 128;
      if (a0 !== a1) alphaFehl++;
      if (!a0) continue;
      nOp++;
      for (let c = 0; c < 3; c++) {
        const d = ref[i * 4 + c] - dec[i * 4 + c];
        se += d * d; n++;
        ein[c] += p.albedo[i * 4 + c] / 255;
        aus[c] += lin(dec[i * 4 + c]);
      }
    }
    const psnr = n ? 10 * Math.log10((255 * 255) / Math.max(1e-9, se / n)) : 0;
    // Normale (opake Texel des halben Rasters)
    const nw = M.nw, nh = M.nh;
    const nref = core.normalMips(p.normal, nw, nh, 4, 1)[0].data;
    const ndec = core.bcDekodiere(k.normal.subarray(0, M.n[0].bytes), nw, nh, "bc5");
    const vz = (a, i) => { const x = a[i * 2] / 127.5 - 1, y = a[i * 2 + 1] / 127.5 - 1; return [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))]; };
    const ws = [];
    const nt = p.nt;
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) {
      let op = false;
      for (let dy = 0; dy < nt && !op; dy++) for (let dx = 0; dx < nt; dx++) if (p.albedo[((y * nt + dy) * W + x * nt + dx) * 4 + 3] >= thr) op = true;
      if (!op) continue;
      const a = vz(nref, y * nw + x), b = vz(ndec, y * nw + x);
      const l = Math.hypot(a[0], a[1], a[2]) * Math.hypot(b[0], b[1], b[2]) || 1;
      ws.push((Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / l))) * 180) / Math.PI);
    }
    ws.sort((x, y) => x - y);
    // Mip-Deckung: Codec (dekodiert) und Box-Mip (Alpha-Mittel, dann Schwelle) je Stufe
    const deckung = [], box = [];
    let ba = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) ba[i] = p.albedo[i * 4 + 3] >= thr ? 1 : 0;
    let bw = W, bh = H;
    for (let s = 0; s < M.a.length; s++) {
      const st = M.a[s];
      const d = core.bcDekodiere(k.albedo.subarray(st.off, st.off + st.bytes), st.w, st.h, "bc1");
      let op = 0; for (let i = 0; i < st.w * st.h; i++) if (d[i * 4 + 3] >= 128) op++;
      deckung.push(op / (st.w * st.h));
      let ob = 0; for (let i = 0; i < bw * bh; i++) if (ba[i] >= core.KARTEN_GESETZ.schwelle) ob++;
      box.push(ob / (bw * bh));
      const w2 = bw >> 1, h2 = bh >> 1, nb = new Float32Array(w2 * h2);
      for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++)
        nb[y * w2 + x] = (ba[2 * y * bw + 2 * x] + ba[2 * y * bw + 2 * x + 1] + ba[(2 * y + 1) * bw + 2 * x] + ba[(2 * y + 1) * bw + 2 * x + 1]) / 4;
      ba = nb; bw = w2; bh = h2;
    }
    return {
      alphaFehl, psnr, winkelMittel: ws.reduce((s, x) => s + x, 0) / Math.max(1, ws.length),
      winkelP95: ws.length ? ws[Math.floor(0.95 * (ws.length - 1))] : 0, deckung, box,
      farbe: { ein: ein.map((v) => v / Math.max(1, nOp)), aus: aus.map((v) => v / Math.max(1, nOp)) },
      bytes: k.albedo.length + k.normal.length, opak: k.opak,
    };
  });
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
        const atlas = () => page.evaluate(() => window.__atlas());
        const karte = (presetId, seed, stoer) => page.evaluate((p, sd, st) => window.__karte(p, sd, st), presetId, seed, stoer || null);
        const out = await cb({ build, getData, atlas, karte, pageErrors });
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
// BEIPACK (studio-vertrag §8.4, must-ignore): Pseudo-Einträge `{ kind: "__…" }` ohne Puffer
// (`__skelett` der Kreatur, `__baumGrammatik` des Baums) reisen im selben meshes-Array, SIND
// aber keine Meshes — der Vertrag v1 zählt sie nicht (Leser ohne position-Guard überspringen
// sie). Hier fallen sie aus dem Fingerabdruck, damit Mint UND Gate dieselbe Regel lesen.
function istBeipack(m) {
    return !!m && typeof m.kind === "string" && m.kind.startsWith("__") && !(m.attrs && m.attrs.position);
}
function fingerprintMeshes(meshes) {
    const sha = (b64) => {
        const buf = Buffer.from(b64, "base64");
        return { bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
    };
    return (meshes || []).filter((m) => !istBeipack(m)).map((m) => {
        const out = { kind: m.kind, mat: m.mat, attrs: {} };
        for (const k of Object.keys(m.attrs || {}))
            out.attrs[k] = Object.assign({ itemSize: m.attrs[k].itemSize }, sha(m.attrs[k].b64));
        if (m.index) out.index = sha(m.index);
        return out;
    });
}

module.exports = { runWithWorker, fingerprintMeshes, istBeipack, WORKER_SCRIPTS };
