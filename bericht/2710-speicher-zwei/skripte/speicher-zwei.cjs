#!/usr/bin/env node
// speicher-zwei.cjs — DIE MESS-BAHN von speicher.K2 Staffel 2 und speicher.K4 Staffel 2 (Karte speicher-zwei, 27.10.).
// Harness-Werkzeug der Stationen (stationen/g6.js, HARNESS-STATIONEN): es fährt das echte Spiel aus dem Spiel-Baum ($BAUM, die
// Linsen-Bibliothek dort: welt-boot · ausgabe-aufnahme · band-urteil · software-gpu) und schreibt sein Ergebnis als JSON.
// Es lebt hier, nicht unter scripts/ des Spiels: die Decke (gate:betriebsgesetz, scripts/ wächst nie) trüge die zwei Bahnen
// nicht (+2 139 Atome). Der Abdruck der Station liest diesen Text nicht — wer ihn ändert, ändert das `# werk` des Befehls.
//
//   BAUM=<spiel> PORT=<p> node speicher-zwei.cjs takt [--echt] --json <aus>   speicher.K2#2
//   BAUM=<spiel> PORT=<p> node speicher-zwei.cjs bild --json <aus>            speicher.K4#2
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const BAUM = path.resolve(process.env.BAUM || process.cwd());
const { statikServer, starteBrowser, nullRenderer, uferStellen } = require(
  path.join(BAUM, "scripts/lib/welt-boot.cjs"),
);
const { AUSGABE_INSTALL } = require(
  path.join(BAUM, "scripts/lib/ausgabe-aufnahme.cjs"),
);
const server = statikServer();

// (Z) SPEICHERN KOSTET KEIN BILD (speicher.K2, `--takt [--echt] [--json f]`): die Welt läuft im echten Takt (rAF, der
// Autosave des Spiels alle saveInterval); eine Hülle um jeden Speicher-Schritt des Haupt-Fadens — der Ruf (`saveState`), das
// Zusammensetzen (`_standNachholen`), der Besen (`_standFegen`), der Versand (`schicke`) — summiert je Task das SPEICHER-BILD,
// je rAF-Bild die Speicher-ms darin. Erst frisch, dann nach PERSISTENCE_TAKT_EDITS Gruben (10 000), am Ereignis gesetzt: der
// Zustand „nach 2 h mit 10 000 Edits", nie die Wanduhr. Je Phase (20 Stände) p50/p95/max der Speicher-Bilder und die Bilder
// über 16,7 ms, die das Speichern trägt (ohne seine ms darunter). `--echt`: Fenster und Karte, sonst der Null-Renderer.
const TAKT_EDITS = Number(process.env.PERSISTENCE_TAKT_EDITS || 10000);
async function taktSeite(n, edits) {
  const r = await window.__weltDa(
    (x) => x.state.worldMeta && x.state.worldMeta.worldId && x.state.playerMesh,
  );
  const P = { tiefe: 0, bild: 0 };
  const huelle = (o, name, zaehlt) => {
    const roh = o[name];
    o[name] = function (...a) {
      if (zaehlt && !zaehlt(this)) return roh.apply(this, a);
      const t0 = performance.now();
      P.tiefe++;
      try {
        return roh.apply(this, a);
      } finally {
        const d = performance.now() - t0;
        if (!--P.tiefe && !P.task)
          queueMicrotask(() => (P.B.push(P.task[0]), (P.task = null)));
        if (!P.tiefe)
          ((P.task = P.task || [0]), (P.task[0] += d), (P.bild += d));
      }
    };
  };
  for (const x of ["saveState", "_standNachholen", "_standFegen"]) huelle(r, x);
  huelle(r._speicherZustand(), "schicke", (s) => s.unterwegs && ++P.n);
  const phase = async () => {
    Object.assign(P, { B: [], n: 0, wegen: 0 });
    // das Bild am Zeitstempel seines vsync (rAF): ein Bild über 16,7 ms ist ein verpasster Takt (Toleranz 0,5 ms), das
    // Speichern trägt es, wenn es ohne seine ms darunter bliebe; der Null-Renderer rendert nicht, die Probe trägt den Takt
    const bild = async () => {
      const vor = r._weltStand ? r._weltStand.takte : -1;
      const t = await new Promise(requestAnimationFrame);
      if ((r._weltStand ? r._weltStand.takte : -1) === vor) r._gameLoopTick(t);
      return t;
    };
    P.ueber = 0;
    for (let i = 0, t = await bild(); P.n < n && i < n * 1200; i++, P.bild = 0) {
      const dt = -t + (t = await bild());
      if (dt > 17.2) P.ueber++;
      if (P.bild && dt > 17.2 && dt - P.bild <= 16.7) P.wegen++;
    }
    const [B, q] = [
      P.B.sort((x, y) => x - y),
      (p) => +(P.B[Math.floor(p * (P.B.length - 1))] || 0).toFixed(3),
    ];
    return {
      staende: P.n,
      bilder: B.length,
      p50: q(0.5),
      p95: q(0.95),
      max: q(1),
      ueber: P.ueber,
      wegen: P.wegen,
    };
  };
  const [frisch, p] = [await phase(), r.state.playerMesh.position.clone()];
  for (let i = 0; i < edits; i++) {
    const [x, z] = [
      p.x + (i % 100) * 2 - 100,
      p.z + Math.floor(i / 100) * 2 - 100,
    ];
    r.carveVoxel(x, r._terrainMacroSurfaceY(x, z) - 1, z, 1.5);
    if (i % 100 === 99) await window.__seitenTakt();
  }
  return {
    frisch,
    edits: { ...(await phase()), n: r.state.worldMeta.voxelEdits.length },
  };
}
async function taktLauf(echt = process.argv.includes("--echt")) {
  // die Uhr der Seite auf 5 µs (isoliert; sonst 100 µs — das Soll ist 0,1 ms), wie der Klang-Takt
  server.prependListener("request", (_q, res) =>
    res
      .setHeader("Cross-Origin-Opener-Policy", "same-origin")
      .setHeader("Cross-Origin-Embedder-Policy", "require-corp"),
  );
  const browser = await starteBrowser({
    art: echt ? "echt" : "null",
    headless: !echt,
    frist: 3600000,
  });
  const page = await browser.newPage();
  if (!echt) await nullRenderer(page);
  await server.zeige(page, 120000);
  const j = await page.evaluate(taktSeite, 20, TAKT_EDITS);
  const z = (k, n) => ({
    name: `(Z) ${n}: Speicher-Bild ${JSON.stringify(j[k])} — Soll p95 ≤ 0,1 ms, kein Bild > 16,7 ms durch Speichern`,
    pass:
      j[k].staende >= 20 &&
      j[k].p95 <= 0.1 &&
      j[k].wegen === 0 &&
      !(j[k].n < TAKT_EDITS),
  });
  return [
    j,
    [
      z("frisch", "frisch"),
      z("edits", `nach ${j.edits.n} Edits (Soll ≥ ${TAKT_EDITS})`),
    ],
    browser,
  ];
}
// (B) DIE WIEDERKEHR ZEIGT DIESELBE WELT (speicher.K4, `--bild [--json f]`): am Bach der Mess-Wiese (`uferStellen`: das Wasser
// zeichnet im Blick) setzt der Spieler einen Stein-Block und gräbt eine Grube ans Ufer; die Welt steht, die Bühne (Mittag ·
// Sonne · Sommer, das Wetter das Wort) — Ausgabe-Bild A. Der Stand ist fest (`__stand`), die Seite lädt neu (dasselbe Profil:
// die Wiederkehr), derselbe Ort und Blick, Bild B. Gezählt die Pixel mit |ΔLuma| > 8; der Pflicht-Inhalt: Bau und Grube stehen
// in beiden Bildern im Blick (aus dem Stand), das Wasser zeichnet. Ohne Karte das Software-Holz (`kienspan`).
async function bildSeite(setzen, wasser) {
  const r = window.anazhRealm;
  const [st, p] = [r.state, r.state.playerMesh.position];
  const ort = (vor, quer) => [
    p.x + Math.sin(st.yaw) * vor - Math.cos(st.yaw) * quer,
    p.z + Math.cos(st.yaw) * vor + Math.sin(st.yaw) * quer,
  ];
  const [b, g] = [ort(6, -2.5), ort(9, 2.5)];
  if (setzen)
    r.spawnArchitecture(
      "stein_block",
      { x: b[0], y: r._terrainMacroSurfaceY(...b), z: b[1] },
      { silent: true },
    );
  if (setzen) r.carveVoxel(g[0], r._voxelSurfaceY(...g), g[1], 2);
  // der Blick über das Gras: hinter dem Spieler, steil aufs Ufer (Bau, Grube, Wasser)
  if (st.cameraMode !== "third") r.setCameraMode("third");
  st.pitch = -0.5;
  await window.__weltStehtNach();
  window.__buehne();
  const blick = (l, [x, z]) => {
    const v = new window.THREE.Vector3(
      x,
      r._voxelSurfaceY(x, z) + 0.3,
      z,
    ).project(st.camera);
    return (
      l.some(
        (e) =>
          Math.hypot((e.position || e).x - x, (e.position || e).z - z) < 0.5,
      ) && Math.max(Math.abs(v.x), Math.abs(v.y), v.z) < 1
    );
  };
  const { u8 } = await window.__ausgabeAufnahme(320, 180);
  // das Bild selbst neben die Ausgabe (der Blick des Prüfers, Gebot: das BILD)
  const c = new OffscreenCanvas(320, 180);
  c.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(u8), 320, 180), 0, 0);
  const png = new Uint8Array(await (await c.convertToBlob()).arrayBuffer());
  return {
    png: btoa(Array.from(png, (x) => String.fromCharCode(x)).join("")),
    lage: {
      kamera: st.camera.position.toArray().map((v) => +v.toFixed(3)),
      blick: [+st.yaw.toFixed(4), +st.pitch.toFixed(4)],
      uhr: st.timeOfDay,
      wetter: st.weather,
      tiere: st.creatures.length,
      bauten: st.architectures.length,
      edits: (st.worldMeta.voxelEdits || []).length,
      chunks: st.voxelChunks ? st.voxelChunks.size : 0,
    },
    u8: Array.from(u8),
    pflicht: {
      bau: blick(st.architectures, b),
      grube: blick(st.worldMeta.voxelEdits || [], g),
      wasser,
    },
  };
}
async function bildLauf() {
  const browser = await starteBrowser({
    art: "linse",
    frist: 1800000,
    profil: fs.mkdtempSync(path.join(os.tmpdir(), "k4-")),
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 320, height: 180, deviceScaleFactor: 1 });
  const messort = require(
    path.join(BAUM, "scripts/lib/band-urteil.cjs"),
  ).ladeSpec("wiese").ort.spieler;
  const schuss = async (setzen) => {
    await page.evaluate(AUSGABE_INSTALL);
    const u = await page.evaluate(uferStellen, { messort });
    if (u.fehler) throw new Error(`(B) ${u.fehler}`);
    return page.evaluate(bildSeite, setzen, u.wasser);
  };
  await server.zeige(
    page,
    120000,
    require(path.join(BAUM, "scripts/lib/software-gpu.cjs")).istHardwareAdapter(
      browser.adapter,
    )
      ? "index.html"
      : "index.html?holz=kienspan",
  );
  const A = await schuss(true);
  // DAS RAUSCHEN der Bahn: derselbe Blick noch einmal ohne Neuladen — was hier schon abweicht, ist kein Speicher
  const A2 = await page.evaluate(bildSeite, false, A.pflicht.wasser);
  await page.evaluate(() => (window.anazhRealm.saveState(), window.__stand()));
  await page.reload({ waitUntil: "domcontentloaded" });
  const B = await schuss(false);
  const L = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
  const j = {
    png: { vor: A.png, vor2: A2.png, nach: B.png },
    lage: { vor: A.lage, nach: B.lage },
    diff: 0,
    rauschen: 0,
    vor: A.pflicht,
    nach: B.pflicht,
    adapter: browser.adapter,
  };
  for (let i = 0; i < A.u8.length; i += 4)
    j.diff += Math.abs(L(A.u8, i) - L(B.u8, i)) > 8 ? 400 / A.u8.length : 0;
  for (let i = 0; i < A.u8.length; i += 4)
    j.rauschen += Math.abs(L(A.u8, i) - L(A2.u8, i)) > 8 ? 400 / A.u8.length : 0;
  const ganz = (q) => q.bau && q.grube && q.wasser > 0;
  const name = `(B) bild-diff ${j.diff.toFixed(2)} % an derselben Pose nach dem Neuladen (Soll ≤ 1 %), Pflicht-Inhalt vor`;
  return [
    j,
    [
      {
        name: `${name} ${JSON.stringify(j.vor)} · nach ${JSON.stringify(j.nach)}`,
        pass: j.diff <= 1 && ganz(j.vor) && ganz(j.nach),
      },
    ],
    browser,
  ];
}

(async () => {
  await server.lausche(Number(process.env.PORT || 4580));
  const [j, checks, browser] = await (process.argv[2] === "bild"
    ? bildLauf()
    : taktLauf());
  await browser.close();
  server.close();
  const aus = process.argv.includes("--json") && process.argv[process.argv.indexOf("--json") + 1];
  for (const [k, v] of Object.entries(j.png || {})) aus && fs.writeFileSync(aus.replace(/\.json$/, "") + "-" + k + ".png", Buffer.from(v, "base64"));
  delete j.png;
  if (process.argv.includes("--json"))
    fs.writeFileSync(
      process.argv[process.argv.indexOf("--json") + 1],
      JSON.stringify(j, null, 1),
    );
  for (const c of checks) console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
  process.exit(checks.every((c) => c.pass) ? 0 : 1);
})();
