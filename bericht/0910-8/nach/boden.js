const st = r.state; const k = st.fernKroneNah; const su = r._ensureSeasonUniforms(); const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
const Y = (a, b, c) => 0.2126 * a + 0.7152 * b + 0.0722 * c;
k.U.bereit.value = 0;
let m;
try { m = await window.__nahFernSicht({}); } finally { k.U.bereit.value = 1; }
const halb = m.halb;
return { halb, orte: m.orte.map((o) => {
  let g = 0, n = 0;
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) {
    const x = Math.round(o.ort[0] - halb + ((i + 0.5) * 2 * halb) / 32), z = Math.round(o.ort[1] - halb + ((j + 0.5) * 2 * halb) / 32);
    const law = r._terrainMacroSurfaceY(x, z, false); const t = r._fernRingTeile(x, z, law, law < wl, true);
    g += Y(t[0], t[1], t[2]); n++;
  }
  return { ort: o.ort, klasse: o.klasse, nahBodenOhneKrone: o.nah.Y, gesetzBoden: +(g / n).toFixed(4), verhaeltnis: +(o.nah.Y / (g / n)).toFixed(3) };
}) };
