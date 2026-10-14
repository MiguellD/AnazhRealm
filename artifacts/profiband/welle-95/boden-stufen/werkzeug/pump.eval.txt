// window.__sp = {x, z}: der Bezugs-Punkt der Stufen-Wahl (der Spieler) — pumpt den Strom, bis jede Stufe steht
const sp = window.__sp; const s = r.state; s.perfTargetMs = 1000;
const p = { x: sp.x, y: r._voxelSurfaceY(sp.x, sp.z), z: sp.z };
if (s.playerMesh) { s.playerMesh.position.x = p.x; s.playerMesh.position.z = p.z; }
const t0 = performance.now(); let ruhig = 0, takte = 0, bau = 0;
while (performance.now() - t0 < 30000) {
  s.chunkRingRadius = 4; s._activeRingRadius = 4;
  const b = r._tickVoxelChunkStreaming(p) || 0; bau += b; takte++;
  if (typeof r._stufeAugeTakt === "function") r._stufeAugeTakt(p);
  await new Promise((o) => setTimeout(o, 25));
  const offen = (s.voxelMeshPending && s.voxelMeshPending.size) || 0;
  if (b === 0 && offen === 0) ruhig++; else ruhig = 0;
  if (ruhig >= 12) break;
}
let versteckt = 0;
if (window.__nurBoden) { const fp = s.feldPass && s.feldPass.mesh; s.scene.traverse((m) => { if (!(m.isMesh || m.isPoints || m.isLine || m.isSprite) || !m.visible) return;
  const k = (m.userData && (m.userData.chunkSatz || m.userData.inventar)) || m.name || "";
  if (k === "boden" || k === "boden-satz" || k === "fern-ring" || k === "himmel" || k === "himmel-sonne" || m === fp) return; m.visible = false; versteckt++; }); }
const je = {}; for (const e of s.voxelChunks.values()) if (e && e.mesh) je["L" + (e.lod || 0)] = (je["L" + (e.lod || 0)] || 0) + 1;
return { versteckt, x: p.x, z: p.z, takte, bau, ms: Math.round(performance.now() - t0), je };
