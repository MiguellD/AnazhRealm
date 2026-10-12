// Treiber: nur die WURF-Probe aus diag-regler-wirkt.cjs (ohne den Haupt-Lauf), Zeit und Urteil. Arg: [art]
const fs = require("fs"), path = require("path");
const wt = process.cwd();
const src = fs.readFileSync(path.join(wt, "scripts/diag-regler-wirkt.cjs"), "utf8");
const cut = src.lastIndexOf("(async () => {");
const Module = require("module");
const m = new Module(path.join(wt, "scripts/diag-regler-wirkt.cjs"));
m.filename = path.join(wt, "scripts/diag-regler-wirkt.cjs");
m.paths = Module._nodeModulePaths(path.join(wt, "scripts"));
const art = process.argv[2] || null;
m._compile(src.slice(0, cut) + `
(async () => {
  const t0 = Date.now();
  let w = null;
  await runWithWorker(PORT, async (h) => { w = await wurfMessen(h, ${JSON.stringify(art)} ? { nurArt: ${JSON.stringify(art)} } : {}); });
  wurfBericht(w);
  const rot = wurfUrteil(w.zeilen);
  for (const r of rot.slice(0, 12)) console.log("ROT " + r);
  const quelle = fs.readFileSync(STAMM_PFAD, "utf8");
  const tq = quelle.replace('return zwilling < eigen ? "zwilling" : "selbst";', 'return "zwilling";');
  const rt = wurfUrteil(wurfRichten(w.zeilen, stammRegel(tq)));
  console.log("Täter rot: " + rt.length + " — " + rt.slice(0, 3).join(" · "));
  for (const z of w.zeilen.filter((x) => /orders=9/.test(x.wo))) console.log("  orders=9 " + z.art + " " + z.wo + " eigen " + z.eigen + " zwilling " + z.zwilling + " von " + z.von + (z.ueberZeile ? " (über Zeile)" : ""));
  console.log("Zeit " + ((Date.now() - t0) / 1000).toFixed(1) + " s · rot " + rot.length);
  process.exit(rot.length ? 1 : 0);
})();`, m.filename);
