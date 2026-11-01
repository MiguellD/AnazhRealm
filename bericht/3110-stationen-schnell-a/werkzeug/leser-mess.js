// woraus die Mikrosekunde je Ruf `_bodenSichtAt` besteht (Null-Welt an der Mess-Wiese): je Glied 1 Mio. Rufe
const p = r.state.playerMesh.position;
const vc = r.state.voxelChunks;
const N = 1000000;
const t = {};
const mess = (k, f) => { const t0 = performance.now(); let s = 0; for (let i = 0; i < N; i++) s += f(i) || 0; t[k] = Math.round(performance.now() - t0); return s; };
const px = (i) => p.x + (i % 1000) * 0.043, pz = (i) => p.z + Math.floor(i / 1000) * 0.043;
mess("leser", (i) => r._bodenSichtAt(px(i), pz(i)));
mess("config2", (i) => r._voxelChunkConfig(0).span + r._voxelChunkConfig(i & 1).step);
mess("schluessel4", (i) => { const cx = Math.floor(px(i) / 43.2), cz = Math.floor(pz(i) / 43.2); return (vc.get(`${cx},${cz}`) ? 1 : 0) + (vc.get(`${cx - 1},${cz}`) ? 1 : 0) + (vc.get(`${cx},${cz - 1}`) ? 1 : 0) + (vc.get(`${cx - 1},${cz - 1}`) ? 1 : 0); });
const E0 = vc.get(Math.floor(p.x / 43.2) + "," + Math.floor(p.z / 43.2));
mess("stufeMisch", (i) => (r._bodenStufeMisch(E0, Math.floor(p.x / 43.2), Math.floor(p.z / 43.2), px(i), pz(i)) ? 1 : 0));
mess("gewichtAuge", (i) => r._stufeGewichtAuge(E0 ? E0.lod || 0 : 0, px(i), pz(i)));
const lods = {};
for (const e of vc.values()) lods[e.lod || 0] = (lods[e.lod || 0] || 0) + 1;
return { t, lods, saeulen: r.state.saeulenVorlaeufig ? r.state.saeulenVorlaeufig.size : null, teilung: r.constructor.BODEN_KARTE_TEILUNG, ziel: E0 ? !!E0.surfMapZiel : null };
