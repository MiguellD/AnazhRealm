const st = r.state; const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0; const t = new Float32Array(7);
const quadrate = [];
for (let X = -3000; X <= 3000; X += 150) for (let Z = -3000; Z <= 3000; Z += 150) {
  let d = 0, n = 0, nass = 0;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const x = X - 60 + i * 40, z = Z - 60 + j * 40; const y = r._terrainMacroSurfaceY(x, z, false);
    if (!(y > wl + 1)) { nass++; continue; }
    r._fernFarbeTeile(x, y, z, t); d += t[6]; n++;
  }
  if (nass === 0 && n) quadrate.push([X, Z, +(d / n).toFixed(3)]);
}
const w = quadrate.map((q) => q[2]).sort((a, b) => a - b);
return { welt: "Mess-Wiese-Welt (Standard)", raster: "150 m, je 16 Punkte, nur trockene Quadrate", n: w.length, min: w[0], q10: w[Math.floor(0.1 * (w.length - 1))], median: w[w.length >> 1], max: w[w.length - 1], unter05: w.filter((v) => v < 0.5).length, lichteste: quadrate.sort((a, b) => a[2] - b[2]).slice(0, 10) };
