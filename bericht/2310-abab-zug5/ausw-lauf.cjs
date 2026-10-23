// je Boot die Größen eines `lauf` (Datei-Muster <dir>/<zelle>-<boot>-<suffix>.txt): fps, Frame p95/p99/max, CPU-Takt p50/p95, Belegung p95,
// außer Takt p95, GPU-Durchsatz p50, Befehle Mittel/p95, Dreiecke Mittel/p95, VRAM jetzt; Mittel je Seite + Δ + 2σ gepoolt (n=2)
const fs = require("fs");
const [dir, zelle, suffix] = process.argv.slice(2);
const lies = (f) => { try { const t = fs.readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); return j.ergebnis || j; } catch (_) { return null; } };
const G = {
  fps: (e) => e.fps, "Frame p95": (e) => e.frameMs.p95, "Frame p99": (e) => e.frameMs.p99, "Frame max": (e) => e.frameMs.max,
  "CPU-Takt p50": (e) => e.cpuTaktMs.p50, "CPU-Takt p95": (e) => e.cpuTaktMs.p95,
  "Belegung p95": (e) => e.belegung && e.belegung.belegungMs.p95, "außer Takt p95": (e) => e.belegung && e.belegung.ausserTaktMs.p95,
  "GPU-Durchsatz p50": (e) => e.gpuDurchsatzMs && e.gpuDurchsatzMs.p50,
  "Befehle Mittel": (e) => e.befehle.mittel, "Befehle p95": (e) => e.befehle.p95,
  "Dreiecke Mittel": (e) => e.dreiecke.mittel, "Dreiecke p95": (e) => e.dreiecke.p95, "VRAM": (e) => e.vramMB.jetzt,
};
const boots = fs.readdirSync(dir).filter((f) => f.startsWith(zelle + "-") && f.endsWith("-" + suffix + ".txt")).map((f) => f.slice(zelle.length + 1, zelle.length + 3)).filter((b) => /^[AB][0-9]$/.test(b)).sort();
const E = Object.fromEntries(boots.map((b) => [b, lies(`${dir}/${zelle}-${b}-${suffix}.txt`)]));
const m = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const v = (a) => { const q = m(a); return a.reduce((x, y) => x + (y - q) ** 2, 0) / Math.max(1, a.length - 1); };
console.log(`| Größe | ${boots.join(" | ")} | A | B | Δ | 2σΔ |\n|---|${boots.map(() => "---|").join("")}---|---|---|---|`);
for (const [k, f] of Object.entries(G)) {
  const w = boots.map((b) => { try { const x = f(E[b]); return Number.isFinite(x) ? x : NaN; } catch (_) { return NaN; } });
  const a = w.filter((x, i) => boots[i][0] === "A" && Number.isFinite(x)), b = w.filter((x, i) => boots[i][0] === "B" && Number.isFinite(x));
  if (!a.length || !b.length) { console.log(`| ${k} | ${w.join(" | ")} | – | – | – | – |`); continue; }
  const s = Math.sqrt((v(a) + v(b)) / 2) * Math.sqrt(1 / a.length + 1 / b.length);
  const r = (x) => (Math.abs(x) >= 1000 ? Math.round(x) : +x.toFixed(2));
  console.log(`| ${k} | ${w.map(r).join(" | ")} | ${r(m(a))} | ${r(m(b))} | ${r(m(b) - m(a))} | ${r(2 * s)} |`);
}
