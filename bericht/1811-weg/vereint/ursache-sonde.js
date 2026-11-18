// ursache-sonde.js — quer über den Graben (x fest, z von Z0 bis Z1 in 0,25 m): die Höhen-Funktion `_voxelSurfaceY`, der EINE
// Leser des gezeichneten Bodens `_bodenSichtAt`, der Strahl durchs Dichtefeld `_fieldRaycast` und der Strahl gegen das Netz
// des Chunks (three Raycaster, wenn greifbar). Dazu der Chunk an der Sohle: Stufe, Schritt, Maß, Schlüssel seines Eintrags.
module.exports = (X, Z0, Z1) => `
const o = { X: ${X}, zeilen: [], chunk: null, three: null };
const vc = r.state.voxelChunks, c0 = r._voxelChunkConfig(0);
const eintrag = (x, z) => vc.get(Math.floor(x / c0.span) + "," + Math.floor(z / c0.span));
const T3 = window.THREE || (window.AnazhRealm && AnazhRealm.THREE) || null;
let RC = null, V3 = null;
try { const cam = r.state.camera; V3 = cam.position.constructor; if (T3 && T3.Raycaster) RC = new T3.Raycaster(); } catch (e) { o.three = String(e); }
const netze = (e) => { const L = []; if (!e) return L; for (const k of Object.keys(e)) { const v = e[k]; if (v && v.isMesh) L.push(v); else if (v && v.isObject3D) v.traverse((m) => m.isMesh && L.push(m)); } return L; };
for (let z = ${Z0}; z <= ${Z1} + 1e-6; z += 0.25) {
    const e = eintrag(o.X, z), aus = {};
    const f = r._voxelSurfaceY(o.X, z), b = r._bodenSichtAt(o.X, z, aus);
    let s = null, n = null;
    try { const h = r._fieldRaycast(o.X, f + 12, z, o.X, f - 12, z, {}); s = h && h.hit ? +h.y.toFixed(2) : null; } catch (x) { s = "F " + String(x).slice(0, 60); }
    if (RC && V3) { try { RC.set(new V3(o.X, f + 12, z), new V3(0, -1, 0)); RC.far = 30; const hit = RC.intersectObjects(netze(e), false); n = hit.length ? +hit[0].point.y.toFixed(2) : null; } catch (x) { n = "F " + String(x).slice(0, 60); } }
    o.zeilen.push([+z.toFixed(2), +f.toFixed(2), b === null ? null : +b.toFixed(2), s, n, e ? e.lod || 0 : null, aus.gruen !== undefined ? +aus.gruen.toFixed(2) : null]);
}
const zm = (${Z0} + ${Z1}) / 2, e = eintrag(o.X, zm);
if (e) { const cfg = r._voxelChunkConfig(e.lod || 0); o.chunk = { lod: e.lod || 0, step: cfg.step, dim: cfg.dim, span: cfg.span, teilung: AnazhRealm.BODEN_KARTE_TEILUNG, felder: Object.keys(e).slice(0, 60), netze: netze(e).map((m) => ({ name: m.name, ecken: m.geometry && m.geometry.attributes.position ? m.geometry.attributes.position.count : null })) }; }
o.stufen = [0, 1, 2, 3].map((l) => { try { const c = r._voxelChunkConfig(l); return { lod: l, step: c.step, dim: c.dim, span: c.span }; } catch (x) { return null; } });
o.erdbau = Object.keys((r.state.worldMeta && r.state.worldMeta.erdbau) || {});
o.raycaster = !!RC;
return o;`;
