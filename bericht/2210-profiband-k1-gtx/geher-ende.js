// 1910 F1: der Geher endet (geher.js) — Haken weg, Lage und Prüfzahlen.
delete r.tickAffordances;
const g = window.__bodenGeher;
const p = r.state.playerMesh.position;
return g ? { s: +g.s.toFixed(1), wege: g.wege, wegM: +g.weg.toFixed(1), abwMaxM: +g.abwMax.toFixed(3), takte: g.n, lage: [+p.x.toFixed(1), +p.z.toFixed(1)] } : null;
