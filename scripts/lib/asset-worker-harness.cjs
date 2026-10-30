// asset-worker-harness.cjs — die EINE geteilte Browser-Worker-Naht für P1 (Gesetz #0).
// Bootet den Studio-Generator als Web-Worker (dieselben Dateien wie worlds/terrain/index.html,
// self.__PHYTO_FOUNDRY_WORKER=true) in EINER swiftshader-Chromium-Seite und reicht dem Node-
// Aufrufer eine `build(msg)`-Funktion: sie schickt eine build-asset-Anfrage an den Worker und
// gibt die Antwort ZURÜCK mit jedem Vertex-Attribut als base64 des rohen Puffers — byte-genau
// serialisierbar durch die page.evaluate-Grenze (Float32Array übersteht sie sonst nicht).
//
// mint-asset-goldens.cjs (schreibt die eingefrorenen Goldens) UND diag-asset-contract.cjs (das
// Dauer-Gate) LESEN diese eine Datei — kein zweiter Boot-Pfad, der driften kann.
const { statikServer, starteBrowser, ausDatei, path, crypto } = require("./welt-boot.cjs");
const { installiereDrift, FUNKTIONEN } = require("./plattform-probe.cjs");
const { rasterDreieck } = require("./kronen-linse.cjs");

const ROOT = path.resolve(__dirname, "..", "..");

// der Boot ist MANIFEST-GETRIEBEN wie die Produktion
// (anazhRealm._ensureAssetFoundry liest cores.manifest.json + injiziert
// self.__anazhCores): die lib der Kerne → alle Kern-Skripte in Manifest-Reihenfolge
// → die Foundry-Brücke zuletzt (K42: keine Labor-Shell, keine Labor-Szene) — ALLES
// aus dem Manifest. So trägt das Harness-Buch ALLE Gattungen (tor/klinge/haus/
// kreatur …), nicht nur die Pflanzen — EINE Quelle, kein hartkodierter Zweitpfad.
// (Die Pflanzen-Goldens bleiben byte-identisch — gate:asset-contract ist der stehende Beweis.)
const CORES_MANIFEST = ausDatei(path.join(ROOT, "cores.manifest.json"), true);
const WORKER_SCRIPTS = (() => {
    const rel = [];
    for (const core of CORES_MANIFEST) if (core && Array.isArray(core.lib)) for (const s of core.lib) rel.push("/" + s);
    for (const core of CORES_MANIFEST) if (core && Array.isArray(core.scripts)) for (const s of core.scripts) rel.push("/" + s);
    for (const core of CORES_MANIFEST) if (core && typeof core.bruecke === "string" && core.bruecke) rel.push("/" + core.bruecke);
    return rel;
})();
// Der Boot-Quelltext des Foundry-Workers als JS-AUSDRUCK für den Seiten-Kontext (location.origin) — das Harness, der
// Bäcker-Kanal und die Fahrzeug-Ferne setzen DIESEN ein (`const boot = ${WORKER_BOOT};`), kein zweiter Boot-Text. Die
// Brücke startet sich selbst (Foundry-Modus, Kanal-Hörer, ready) — kein init() hinter den importScripts.
const WORKER_BOOT =
    '"self.__PHYTO_FOUNDRY_WORKER=true;" + "self.__anazhCores=" + JSON.stringify(' +
    JSON.stringify(CORES_MANIFEST) +
    ') + ";" + "importScripts(" + ' +
    JSON.stringify(WORKER_SCRIPTS) +
    '.map((p) => JSON.stringify(location.origin + p)).join(",") + ");"';

// DER BAU-FINGERABDRUCK — die EINE Quelle für jeden Bau über die echte Brücke (die Seite per toString, Node direkt): die
// Plattform-Probe (`__probeLauf`, kippt ein Byte unter ±1 ULP?) und gate:regler-wirkt (`__bauHashListe`, bewegt ein Regler den Bau?).
// SHA-256 über jedes gelieferte Byte jedes Teils, die Felder in Schlüssel-Ordnung — Vertex-Attribute (Name, itemSize,
// Bytes), Index (Bytes), alles andere als JSON (Teil-Art, Stoff, Wurf, Tür-Scharnier, Gelenk, Seh-Klasse …); der Beipack
// (kind "__…" ohne Positions-Puffer) zählt nicht. Dazu `teile`, `bytes` und `nichtEndlich` (NaN/Inf in den
// Fließkomma-Puffern: ein Bau, der rechnet, aber nicht rechnen kann, ist gebrochen). Bis zur Kette V18.534 trugen zwei
// Zweige je einen Hasher (SHA-256 über Art · Stoff · Wurf · Puffer, FNV-1a über alle Felder) — zwei Wahrheiten über
// „derselbe Bau".
async function bauAbdruck(meshes) {
  const enc = new TextEncoder();
  const stuecke = [];
  let teile = 0, bytes = 0, nichtEndlich = 0;
  const text = (x) => stuecke.push(enc.encode(String(x) + String.fromCharCode(0)));
  const puffer = (arr) => {
    const u = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    stuecke.push(u);
    bytes += u.length;
    if (arr instanceof Float32Array || arr instanceof Float64Array)
      for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nichtEndlich++;
  };
  for (const m of meshes || []) {
    if (!m || (typeof m.kind === "string" && m.kind.startsWith("__") && !(m.position && m.position.array))) continue;
    teile++;
    for (const k of Object.keys(m).sort()) {
      const v = m[k];
      text(k);
      if (v && v.array && v.itemSize) { text(v.itemSize); puffer(v.array); }
      else if (k === "index" && v && v.buffer) puffer(v);
      else text(JSON.stringify(v === undefined ? null : v));
    }
  }
  let n = 0;
  for (const t of stuecke) n += t.length;
  const alles = new Uint8Array(n);
  let o = 0;
  for (const t of stuecke) { alles.set(t, o); o += t.length; }
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", alles));
  return { hash: Array.from(h, (b) => b.toString(16).padStart(2, "0")).join(""), teile, bytes, nichtEndlich };
}
// DAS BILD DES BAUS (studios.K1, das Schlupfloch der Karte: „ein Regler verschiebt Bytes, aber nicht das Bild (0,1 mm), und
// zählte am Hash") — die EINE Quelle für Brücke und Ofen (die Seite per toString). Ein Raster des gebauten Werks aus der
// Vorschau-Pose der Bühne (Gier 0,6 und ihr Gegenblick, Neigung 0,32), ortho im Rahmen des GRUND-Baus (`rahmen` des Grunds an
// jeden Rand: eine Größe wirkt), je Dreieck die Albedo (Vertex-Farbe linear, sonst Stoff-Farbe) unter EINEM festen Licht plus
// Glut (emissive) und Leucht-Gesetz (Farbe × leucht), belichtet nach dem Gesetz der Welt (BELICHTUNG: die 18-%-Karte im vollen
// Licht trifft die Tonkurve mit zielKarte 0,44) durch ihre Kurve (Khronos PBR Neutral), sRGB-Luma in 8 Bit (0 = leer). `abstand(a, b)`: je Ansicht der Anteil der Gestalt-Pixel (Vereinigung beider
// Bilder), deren Luma um mehr als 18 springt oder die nur in einem stehen; das Maximum der Ansichten.
function bauBild(teile, rahmen) {
  const N = 160, K = 0.44 / 0.18, L = [0.42, 0.8, 0.43].map((x, _, l) => x / Math.hypot(...l));
  const neutral = (c) => {
    const x = Math.min(...c), v = c.map((y) => y - (x < 0.08 ? x - 6.25 * x * x : 0.04)), pk = Math.max(...v);
    if (pk < 0.76) return v;
    const np = 1 - 0.0576 / (pk - 0.52), g = 1 - 1 / (0.15 * (pk - np) + 1);
    return v.map((y) => ((y * np) / pk) * (1 - g) + np * g);
  };
  if (!rahmen) {
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (const t of teile) t.pos.forEach((v, i) => ((lo[i % 3] = Math.min(lo[i % 3], v)), (hi[i % 3] = Math.max(hi[i % 3], v))));
    if (!(hi[0] >= lo[0])) return { rahmen: null, bilder: [] };
    rahmen = { c: lo.map((v, k) => (v + hi[k]) / 2), r: Math.max(1e-3, Math.hypot(...hi.map((v, k) => v - lo[k])) / 2) };
  }
  const bilder = [0.6, 0.6 + Math.PI].map((gier) => {
    // die Achsen der Ansicht (rechts, oben, zum Auge), das Licht in ihnen
    const [cp, sp, cg, sg] = [Math.cos(0.32), Math.sin(0.32), Math.cos(gier), Math.sin(gier)];
    const A = [[cg, 0, -sg], [-sp * sg, cp, -sp * cg], [sg * cp, sp, cg * cp]], Lv = A.map((a) => a[0] * L[0] + a[1] * L[1] + a[2] * L[2]);
    const bild = new Uint8Array(N * N), tiefe = new Float32Array(N * N).fill(-Infinity);
    for (const t of teile) {
      const n = t.pos.length / 3, q = new Float32Array(n * 3), I = t.index || Uint32Array.from({ length: n }, (_, i) => i);
      for (let v = 0; v < n; v++)
        for (let a = 0; a < 3; a++) q[v * 3 + a] = (((t.pos[v * 3] - rahmen.c[0]) * A[a][0] + (t.pos[v * 3 + 1] - rahmen.c[1]) * A[a][1] + (t.pos[v * 3 + 2] - rahmen.c[2]) * A[a][2]) * 0.475 * N) / rahmen.r + (a < 2 ? N / 2 : 0);
      for (let f = 0; f + 2 < I.length; f += 3) {
        const [X, Y, Z] = [0, 1, 2].map((k) => [I[f], I[f + 1], I[f + 2]].map((v) => q[v * 3 + k]));
        const nv = [(Y[1] - Y[0]) * (Z[2] - Z[0]) - (Z[1] - Z[0]) * (Y[2] - Y[0]), (Z[1] - Z[0]) * (X[2] - X[0]) - (X[1] - X[0]) * (Z[2] - Z[0]), (X[1] - X[0]) * (Y[2] - Y[0]) - (Y[1] - Y[0]) * (X[2] - X[0])];
        const licht = 0.25 + 0.75 * Math.abs((nv[0] * Lv[0] + nv[1] * Lv[1] + nv[2] * Lv[2]) / Math.hypot(...nv));
        const alb = [0, 1, 2].map((k) => (t.farbe ? [I[f], I[f + 1], I[f + 2]].reduce((s, v) => s + t.farbe[v * t.fs + k], 0) / 3 : t.grund[k]));
        const lin = neutral(alb.map((x, k) => K * (x * (licht + (t.glutK || 0)) + (t.leucht ? t.leucht[k] : 0))));
        const Yl = Math.min(1, Math.max(0, 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]));
        const wert = 1 + Math.round(254 * (Yl <= 0.0031308 ? 12.92 * Yl : 1.055 * Math.pow(Yl, 1 / 2.4) - 0.055));
        rasterDreieck(X[0], Y[0], X[1], Y[1], X[2], Y[2], { nu: N, nv: N }, (i, l0, l1, l2) => {
          const z = l0 * Z[0] + l1 * Z[1] + l2 * Z[2];
          if (z > tiefe[i]) [tiefe[i], bild[i]] = [z, wert];
        });
      }
    }
    return bild;
  });
  const abstand = (A, B) =>
    Math.max(0, ...A.map((a, k) => {
      let [u, s] = [0, 0];
      a.forEach((x, i) => (x || B[k][i]) && (u++, (s += !x || !B[k][i] || Math.abs(x - B[k][i]) > 18)));
      return u ? s / u : 0;
    }));
  return { rahmen, bilder, abstand };
}
// das Bild in der Seite samt seinem Raster (die Brücken-Seite hier, der Ofen der Werkstatt in gate:regler-wirkt)
const BAU_BILD_QUELLE = `(() => { const rasterDreieck = ${rasterDreieck}; return ${bauBild}; })()`;
// Die Teile eines Brücken-Baus für das Bild: was das Auge sieht (der Wurf-Teil „schatten" und der Beipack nicht).
function bauTeile(meshes) {
  return (meshes || [])
    .filter((m) => m && m.position && m.position.array && m.teil !== "schatten")
    .map((m) => {
      const mat = m.mat || {}, grund = mat.color || [0.7, 0.7, 0.7];
      const glut = mat.emissive ? mat.emissive.map((x) => x * (mat.emissiveIntensity || 1)) : null;
      return { pos: m.position.array, index: m.index || null, farbe: m.color ? m.color.array : null, fs: m.color ? m.color.itemSize : 3, grund, leucht: glut, glutK: mat.leucht || 0 };
    });
}

function pageHtml() {
    return `<!doctype html><meta charset="utf-8"><title>asset-worker</title><body><script src="/phyto-core.js"></script><script>
(() => {
  const S = (window.__AW = { ready: false, error: null });
  const boot = ${WORKER_BOOT};
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
  // DER ATLAS-STECKBRIEF gegen den MALER: der Kern-Maler malt den EINEN Blatt-Atlas hier im
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
      wedel: core.BLATT_ATLAS_WEDEL,
      gross: core.BLATT_ATLAS_GROSS,
      weide: core.BLATT_ATLAS_WEIDE,
    };
  };
  // DIE ATLAS-ALPHA fuer die Bild-Deckung (S7): Stufe 0 des Atlas-Bilds (bakeLeafAtlasBild, Textur-Ordnung — Zeile 0
  // = v 0), nur der Alpha-Kanal; die Karten der Krone lesen sie je Pixel gegen die Schwelle ihres Stoffs.
  window.__atlasAlpha = () => {
    const core = window.__phytoCore;
    const b = core.bakeLeafAtlasBild(document);
    const a = new Uint8Array(b.breite * b.hoehe);
    for (let i = 0; i < a.length; i++) a[i] = b.daten[i * 4 + 3];
    return { w: b.breite, h: b.hoehe, b64: b64(a) };
  };
  // DAS ATLAS-BILD ganz (gate:pflanzen-nah F): jede Mip-Stufe (rgba, Textur-Ordnung) und der Wert — der
  // Aufrufer macht daraus die Fracht des Wirts (phyto-core blattAtlasFracht) und misst Labor gegen Welt je Format.
  window.__atlasBild = () => {
    const b = window.__phytoCore.bakeLeafAtlasBild(document);
    return { wert: b.wert, mips: b.mips.map((m) => ({ w: m.width, h: m.height, b64: b64(m.data) })) };
  };
  // Das Buch trägt das Bild des Blatt-Atlas (S7, Mips als Uint8Array): über die page.evaluate-Grenze reist nur sein Steckbrief.
  window.__aget = (type) => ask({ type }).then((r) => {
    if (r && r.blattAtlas) r.blattAtlas = { breite: r.blattAtlas.breite, hoehe: r.blattAtlas.hoehe, stufen: r.blattAtlas.mips.length, wert: r.blattAtlas.wert };
    return r;
  });
  window.__build = (msg) => ask(Object.assign({ type: "build-asset" }, msg)).then((r) => ({
    presetId: r.presetId, seed: r.seed, lod: r.lod, cv: r.cv,
    budget: r.budget || null, budgetBruch: r.budgetBruch || null,
    meshes: (r.meshes || []).map((m) => {
      const out = { kind: m.kind, mat: m.mat, attrs: {} };
      // Scharnier + Gelenk reisen mit (die Draw-Regel liest sie; der Fingerabdruck nicht).
      if (m.tuer) out.tuer = m.tuer;
      if (m.joint) out.joint = m.joint;
      // Der Schatten-Teil der Baum-L1 (S3, teil "schatten") reist mit und steht im Fingerabdruck.
      if (m.teil !== undefined) out.teil = m.teil;
      for (const k of Object.keys(m)) {
        if (m[k] && m[k].array && m[k].itemSize) out.attrs[k] = { itemSize: m[k].itemSize, b64: b64(m[k].array) };
      }
      if (m.index) out.index = b64(m.index);
      return out;
    }),
  }));
  // DIE PLATTFORM-PROBE IM WORKER (S1 Wände, scripts/lib/plattform-probe.cjs): ein zweiter Worker, erst beim ersten
  // Ruf gebootet, trägt VOR dem Boot den Drift-Schalter (installiereDrift — dieselbe Quelle wie in Node) auf seinem Math.
  // __probeLauf(liste, d, welche, bis, fangen) setzt die Drift, baut jeden Fall und gibt je Fall einen sha256 über die
  // Bytes (kind · mat · Wurf-Teil · Attribute · Index; der Beipack nicht) samt Nenner und gefangener Kern-Zeile zurück.
  let probeAsk = null;
  const probeBoot = () => {
    const quelle =
      "var __drift = (" + ${JSON.stringify(installiereDrift.toString())} + ")(Math, " + ${JSON.stringify(JSON.stringify(FUNKTIONEN))} + ");" +
      "self.addEventListener('message', function (e) { var m = e.data; if (!m) return;" +
      " if (m.type === '__drift') { __drift.setze(m.d, m.welche, m.bis, m.fangen); self.postMessage({ reqId: m.reqId }); e.stopImmediatePropagation(); }" +
      " else if (m.type === '__driftStand') { self.postMessage({ reqId: m.reqId, stand: __drift.stand() }); e.stopImmediatePropagation(); } });" +
      boot;
    const w = new Worker(URL.createObjectURL(new Blob([quelle], { type: "text/javascript" })));
    const pend = new Map();
    let bereit = null;
    const fertigP = new Promise((r) => (bereit = r));
    w.onmessage = (ev) => {
      const m = ev.data;
      if (m && m.type === "ready" && m.world === "terrain") bereit();
      const p = m && pend.get(m.reqId);
      if (p) { pend.delete(m.reqId); p(m); }
    };
    const a = (msg) => new Promise((res) => { const reqId = "d" + seq++; pend.set(reqId, res); w.postMessage(Object.assign({ reqId }, msg)); });
    return fertigP.then(() => a);
  };
  const bauAbdruck = ${bauAbdruck.toString()};
  const bauBild = ${BAU_BILD_QUELLE};
  const bauTeile = ${bauTeile.toString()};
  window.__probeLauf = async (liste, d, welche, bis, fangen) => {
    if (!probeAsk) probeAsk = probeBoot();
    const a = await probeAsk;
    await a({ type: "__drift", d, welche, bis, fangen });
    const r = {};
    for (const c of liste) r[c.key] = (await bauAbdruck((await a(Object.assign({ type: "build-asset" }, c.msg))).meshes)).hash;
    const st = (await a({ type: "__driftStand" })).stand;
    await a({ type: "__drift", d: 0, welche: null });
    return { r, gerufen: st.gerufen, gefangen: st.gefangen };
  };
  // DIE KOSTEN VIELER STUFEN (W8, ohne Puffer-Transport): jede Stufe gebaut über die echte Brücke, gezählt mit
  // DERSELBEN Regel wie Budget-Gesetz und Wirt (phyto-core budgetSippen); die Brücken-Antwort trägt ihren Budget-
  // Bericht mit. Die Liste läuft über einen Arbeits-Pool (dieselbe Boot-Kette je Worker; der erste ist der Haupt-Worker).
  const pool = [ask];
  // je Kern ein Worker, höchstens 4 (pipeline.K3: die Hälfte der Kerne ließ am CI-Läufer mit 4 Kernen zwei leer, Haus 220 s)
  const POOL_N = Math.max(1, Math.min(4, navigator.hardwareConcurrency || 2));
  const poolMehr = (n) => {
    while (pool.length < n) {
      const w = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
      const pend = new Map();
      w.onmessage = (ev) => { const m = ev.data; const p = m && pend.get(m.reqId); if (p) { pend.delete(m.reqId); p(m); } };
      pool.push((msg) => new Promise((res) => { const reqId = "p" + seq++; pend.set(reqId, res); w.postMessage(Object.assign({ reqId }, msg)); }));
    }
  };
  // \`mitAbdruck\` (DARF, je Eintrag true/false): dieselbe Stufe trägt zusätzlich den EINEN Bau-Fingerabdruck
  // (\`bauAbdruck\`) — die Gestalten-Wand liest so jede Gestalt der Zweit-Kerne aus dem Bau, den der Kosten-Zug ohnehin
  // fährt (kein Zweitbau). \`mitTeilen\` (DARF): je Stufe die Teile, wie der Wurf des Wirts sie liest — Art, Seh-Klasse,
  // Deckkraft (das Wurf-Recht \`_teilWirft\` des Stamms) und Dreiecke (budgetSippen je Teil); gate:regler-wirkt WURF.
  // \`bild\` (DARF, je Eintrag null | { basis: Schlüssel } | { gegen: Schlüssel }): das Bild des Baus (\`bauBild\`) — die Basis
  // legt Rahmen und Bild unter ihrem Schlüssel ab (eine eigene, frühere Liste), der Rand misst seinen Abstand im Rahmen der Basis.
  const bilder = new Map();
  window.__kostenListe = async (liste, mitAbdruck, mitTeilen, bild) => {
    poolMehr(POOL_N);
    const out = new Array(liste.length);
    let next = 0;
    await Promise.all(pool.map(async (frag) => {
      while (next < liste.length) {
        const i = next++;
        const r = await frag(Object.assign({ type: "build-asset" }, liste[i]));
        const k = window.__phytoCore.budgetSippen(r.meshes || []);
        // der Beipack der Fernform (S3 haus, N5): die NUR-WURF-Stufe trägt ihre Hülle als __fern (die Fern-Wand prüft sie)
        const fern = (r.meshes || []).find((m) => m && m.kind === "__fern");
        out[i] = { tris: k.tris, draws: k.draws, budget: r.budget || null, budgetBruch: r.budgetBruch || null, fern: fern ? fern.huelle : null };
        if (mitTeilen)
          out[i].teile = (r.meshes || [])
            .filter((m) => m && m.position && m.position.array)
            .map((m) => ({ kind: m.kind, mat: m.mat ? { seh: m.mat.seh, opacity: m.mat.opacity } : null, tris: window.__phytoCore.budgetSippen([m]).tris }));
        if (mitAbdruck && mitAbdruck[i]) {
          const a = await bauAbdruck(r.meshes || []);
          out[i].abdruck = a.teile > 0 ? a.hash : null;
          out[i].bau = a;
        }
        const bi = bild && bild[i];
        if (bi && bi.basis) bilder.set(bi.basis, bauBild(bauTeile(r.meshes)));
        else if (bi && bilder.get(bi.gegen) && bilder.get(bi.gegen).rahmen) {
          const B = bilder.get(bi.gegen);
          out[i].bild = B.abstand(B.bilder, bauBild(bauTeile(r.meshes), B.rahmen).bilder);
        }
      }
    }));
    return out;
  };
  // DER BAU-HASH VIELER STUFEN (W1 d, gate:regler-wirkt): jede Stufe über die echte Brücke gebaut (mit ov, dem
  // Regler-Kanal der Werkstatt), je Stufe der EINE Bau-Fingerabdruck (\`bauAbdruck\`) — kein Puffer-Transport.
  window.__bauHashListe = async (liste) => {
    poolMehr(POOL_N);
    const out = new Array(liste.length);
    let next = 0;
    await Promise.all(pool.map(async (frag) => {
      while (next < liste.length) {
        const i = next++;
        const r = await frag(Object.assign({ type: "build-asset" }, liste[i]));
        out[i] = await bauAbdruck(r.meshes || []);
        // Der Budget-Bruch der Antwort (Studio-Vertrag B2c) reist mit: ein Regler-Wert, der die Stufe über ihre Zeile treibt.
        out[i].budgetBruch = r.budgetBruch ? JSON.stringify(r.budgetBruch).slice(0, 200) : null;
      }
    }));
    return out;
  };
})();
</script></body>`;
}

// runWithWorker(port, async (h) => {...}) — bootet Server+Chromium+Worker, ruft cb mit
// { build, getData }, räumt danach ab. Wirft bei Boot-/Worker-Fehler mit klarer Meldung.
async function runWithWorker(port, cb) {
    const server = statikServer({ seiten: { "/": pageHtml, "/__aw.html": pageHtml } });
    await server.lausche(port);
    const browser = await starteBrowser({ art: "null", frist: 240000 });
    try {
        const page = await browser.newPage();
        await page.goto("http://127.0.0.1:" + port + "/__aw.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction("window.__AW && (window.__AW.ready || window.__AW.error)", {
            timeout: 120000,
            polling: 200,
        });
        const st = await page.evaluate(() => window.__AW);
        if (st.error) throw new Error("WORKER-BOOT: " + st.error);
        if (!st.ready) throw new Error("Worker ready-Timeout");
        const build = (msg) => page.evaluate((m) => window.__build(m), msg);
        // In Scheiben zu 120 Stufen: jede Scheibe ein eigener evaluate (der protocolTimeout gilt je Ruf — 2 224
        // Zweit-Kern-Stufen in EINEM Ruf rissen ihn unter Last).
        // `abdruck` (DARF): (Eintrag) => true, wenn die Stufe auch ihren Bau-Fingerabdruck tragen soll.
        // `mitTeilen` (DARF): je Stufe die Teile für den Wurf (Art, Seh-Klasse, Deckkraft, Dreiecke).
        // `bild` (DARF): (Eintrag) => null | { basis } | { gegen } — das Bild des Baus (eine Basis vor ihren Rändern bauen).
        const kostenListe = async (liste, abdruck, mitTeilen, bild) => {
            const out = [];
            const flags = abdruck ? liste.map((c) => !!abdruck(c)) : null;
            const bi = bild ? liste.map((c) => bild(c) || null) : null;
            for (let i = 0; i < liste.length; i += 120)
                out.push(
                    ...(await page.evaluate(
                        (l, f, t, b) => window.__kostenListe(l, f, t, b),
                        liste.slice(i, i + 120),
                        flags ? flags.slice(i, i + 120) : null,
                        !!mitTeilen,
                        bi ? bi.slice(i, i + 120) : null
                    ))
                );
            return out;
        };
        // Der Bau-Hash vieler Stufen (gate:regler-wirkt), in Scheiben wie die Kosten-Liste.
        const bauHashListe = async (liste) => {
            const out = [];
            for (let i = 0; i < liste.length; i += 120)
                out.push(...(await page.evaluate((l) => window.__bauHashListe(l), liste.slice(i, i + 120))));
            return out;
        };
        const getData = (type) => page.evaluate((t) => window.__aget(t), type);
        const atlas = () => page.evaluate(() => window.__atlas());
        const atlasAlpha = () => page.evaluate(() => window.__atlasAlpha());
        const atlasBild = () => page.evaluate(() => window.__atlasBild());
        // Die Plattform-Probe (S1 Wände): `probeLauf` ist der `lauf` von plattform-probe probeAblauf — liste = [{ key, msg }].
        const probeLauf = (liste) => (d, welche, bis, fangen) =>
            page.evaluate(
                (l, dd, w, b, f) => window.__probeLauf(l, dd, w, b, f),
                liste,
                d,
                welche || null,
                bis == null ? null : bis,
                fangen == null ? -1 : fangen
            );
        const out = await cb({ build, kostenListe, bauHashListe, getData, atlas, atlasAlpha, atlasBild, probeLauf });
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
// (`__skelett` der Kreatur) reisen im selben meshes-Array, SIND
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
        // Der Schatten-Teil (S3): nur wo das Studio ihn nennt (die Baum-L1) — jeder andere Fingerabdruck bleibt byte-alt.
        if (m.teil !== undefined) out.teil = m.teil;
        return out;
    });
}

// DIE DREI DATEN-KANÄLE des EINEN Umschlags (get-book) und ihre eingefrorenen JSONs (Feld der Antwort → Golden-Name).
const DATEN_KANAELE = [
    ["book", "recipes"],
    ["worldParams", "world-params"],
    ["renderConfig", "render-config"],
];

// DER KANAL OHNE BROWSER: DIESELBEN Dateien wie der Worker (WORKER_SCRIPTS: lib, Kerne in Manifest-Reihenfolge, die
// Brücke zuletzt) laufen in EINEM Node-vm, und DERSELBE Kanal (`foundryKanal`) antwortet je Frage — der Umschlag (get-book,
// gate:studio-vertrag U) und jeder Bau (build-asset, gate:studio-uebergabe), ~0,6 s statt eines Browser-Boots. Die Leinwand
// des Blatt-Atlas (OffscreenCanvas) schluckt ein Absorber. `quellen`: { "<datei>": "<quelltext>" } ersetzt eine Datei.
function kanalImVm(quellen = {}) {
    const vm = require("vm");
    const absorber = () => {
        const a = new Proxy(function () {}, {
            get: (_t, k) => (k === Symbol.toPrimitive ? () => 0 : a),
            apply: () => a,
            construct: () => a,
        });
        return a;
    };
    const posts = [];
    const ctx = vm.createContext({
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
        OffscreenCanvas: absorber(),
        __anazhCores: CORES_MANIFEST,
        postMessage: (p) => posts.push(p),
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    for (const p of WORKER_SCRIPTS) {
        const f = p.replace(/^\//, "");
        const src = Object.prototype.hasOwnProperty.call(quellen, f)
            ? quellen[f]
            : ausDatei(path.join(ROOT, f));
        vm.runInContext(src, ctx, { filename: f, timeout: 60000 });
    }
    return (msg) => {
        ctx.__frage = Object.assign({ reqId: "vm" + posts.length }, msg);
        vm.runInContext("foundryKanal(__frage)", ctx, { timeout: 60000 });
        return posts.find((p) => p && p.reqId === ctx.__frage.reqId) || null;
    };
}

// DIE ERSTE ABWEICHUNG zweier JSON-Werte beim Pfad: eine Linse, die nur „divergiert" sagt, nennt den Täter nicht — diese
// nennt Schlüssel, Ist und Soll (`lod.zusatzBudget.porta.gate.2.tris: 12500 ≠ 15000`). null = byte-gleich als JSON.
function ersteAbweichung(ist, soll, pfad = "") {
    if (JSON.stringify(ist) === JSON.stringify(soll)) return null;
    const obj = (v) => v !== null && typeof v === "object";
    const wo = pfad || "(Wurzel)";
    if (obj(ist) && obj(soll) && Array.isArray(ist) === Array.isArray(soll)) {
        const ks = Object.keys(soll);
        for (const k of Object.keys(ist)) if (!ks.includes(k)) ks.push(k);
        for (const k of ks) {
            const a = ersteAbweichung(ist[k], soll[k], pfad ? `${pfad}.${k}` : k);
            if (a) return a;
        }
        return { pfad: wo, ist: `Reihe ${Object.keys(ist).join(",")}`, soll: `Reihe ${Object.keys(soll).join(",")}` };
    }
    const kurz = (v) => {
        if (v === undefined) return "fehlt";
        const s = JSON.stringify(v);
        return s.length > 80 ? s.slice(0, 77) + "…" : s;
    };
    return { pfad: wo, ist: kurz(ist), soll: kurz(soll) };
}

module.exports = {
    runWithWorker,
    fingerprintMeshes,
    DATEN_KANAELE,
    kanalImVm,
    bauAbdruck,
    bauBild,
    BAU_BILD_QUELLE,
    ersteAbweichung,
};
