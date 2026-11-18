// Gegenrechnung des Koordinators-Auftrags Punkt 4: eigene PBR-Neutral-Implementierung nach der Khronos-Spezifikation
// (startCompression 0,8 − 0,04, desaturation 0,15), sRGB-OETF, Luma 709, HSV-Sättigung — unabhängig von spike-auge.cjs.
function neutral(c) {
  const sc = 0.8 - 0.04, d = 0.15;
  let [r, g, b] = c;
  const x = Math.min(r, g, b);
  const off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  r -= off; g -= off; b -= off;
  const peak = Math.max(r, g, b);
  if (peak < sc) return [r, g, b];
  const dd = 1 - sc, np = 1 - (dd * dd) / (peak + dd - sc);
  r *= np / peak; g *= np / peak; b *= np / peak;
  const gg = 1 - 1 / (d * (peak - np) + 1);
  return [r + (np - r) * gg, g + (np - g) * gg, b + (np - b) * gg];
}
const oetf = (v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };
function bild(lin) { const s = neutral(lin).map((v) => Math.round(255 * oetf(v))); const mx = Math.max(...s), mn = Math.min(...s);
  return { s, luma: 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2], sat: mx ? 1 - mn / mx : 0 }; }
// Farbrichtung: Licht 2000 K (linear R:G:B ≈ 1 : 0,28 : 0,008 — B/R aus dem Vor-Spike 0,0079) × Albedo des Grases, drei Annahmen
const faelle = { 'Gras grün (0,10/0,16/0,04)': [0.10, 0.16, 0.04], 'Gras fahl (0,18/0,20/0,10)': [0.18, 0.20, 0.10], 'weiße Karte (0,5/0,5/0,5)': [0.5, 0.5, 0.5] };
const licht = [1, 0.28, 0.008];
for (const [n, a] of Object.entries(faelle)) {
  const dir = a.map((v, i) => v * licht[i]); let aus = [];
  for (let e = -8; e <= 8; e += 0.05) { const k = Math.pow(2, e); const b = bild(dir.map((v) => v * k * 40)); aus.push({ e, ...b }); }
  const band = aus.filter((o) => o.luma >= 90 && o.luma <= 150);
  const minS = Math.min(...band.map((o) => o.sat)), maxS = Math.max(...band.map((o) => o.sat));
  const erst = aus.find((o) => o.sat <= 0.75 && o.luma > 20);
  console.log(n, '| Sättigung im Band Luma 90–150:', minS.toFixed(2), '…', maxS.toFixed(2), '| Sättigung ≤ 0,75 zuerst bei Luma', erst ? erst.luma.toFixed(0) + ' sRGB ' + erst.s.join('/') : 'nie');
}
