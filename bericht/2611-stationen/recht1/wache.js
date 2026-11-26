const A = r.constructor, st = r.state;
const o = { x: 842.4867 + 1.2, z: 451.7928 + 0.9 };
const stunde = ((((Number.isFinite(st.timeOfDay) ? st.timeOfDay : 0.5) % 1) + 1) % 1) * 24;
const aus = [];
for (const S of r._bewohnerSiedlungen.values()) for (const b of S.liste || []) {
  if (!b.waffe) continue;
  const p = b.leib && b.leib.position;
  const d = p ? Math.hypot(p.x - o.x, p.z - o.z) : null;
  const e = { rolle: b.rolle, waffe: b.waffe, drinnen: !!b.drinnen, d: d && +d.toFixed(1), amSteuer: !!b.amSteuer, ankunft: !!b.ankunft, ziel: !!b.ziel, weichen: b.weichen ? { ort: [+b.weichen.ort.x.toFixed(1), +b.weichen.ort.z.toFixed(1)], ab: b.weichen.ab, dauer: b.weichen.dauer } : null, imKreis: d !== null && d < A.BEWOHNER.zeugeM };
  if (p && e.imKreis) {
    const nah = A.LEBENSLAUF.wache.nahM, dd = d || 1;
    const q = { x: o.x + ((p.x - o.x) / dd) * nah, z: o.z + ((p.z - o.z) / dd) * nah };
    e.q = [+q.x.toFixed(2), +q.z.toFixed(2)];
    e.land = !!r._landAt(q.x, q.z); e.grundriss = r._imGrundriss(q.x, q.z, 0.5) || null; e.wand = !!r._bewohnerWand(p, q);
    const soll = r._bewohnerSoll(b, stunde); e.sollDrinnen = !!soll.drinnen; e.soll = soll.ziel ? [+soll.ziel.x.toFixed(1), +soll.ziel.z.toFixed(1)] : null;
    e.tempo = b.tempo ?? null; e.wach = b.schlaf ?? b.wach ?? null;
    e.pos = [+p.x.toFixed(2), +p.z.toFixed(2)];
  }
  aus.push(e);
}
return { stunde: +stunde.toFixed(2), wachen: aus };
