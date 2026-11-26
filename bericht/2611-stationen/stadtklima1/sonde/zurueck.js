// der Spieler zurück an die Wiese (dieselbe Stelle wie die Station ihn findet), die Welt taktet, bis das Dorf seine Fernstufe trägt
const st = r.state, pm = st.playerMesh.position;
pm.set(ARG.x, r._terrainSaatY(ARG.x, ARG.z, true) + 1, ARG.z);
const D = [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.key === window.__dorfDerProbe);
const decken = () => (st.architectures || []).filter((e) => e._hausHuelle && e.position && Math.hypot(e.position.x - D.ox, e.position.z - D.oz) <= 64).map((e) => (Array.isArray(e._hausHuelle.decken) ? e._hausHuelle.decken.length : -1));
const t0 = performance.now(); let n = 0;
while (performance.now() - t0 < ARG.ms) { await window.__werkTakt(); n++; }
r._dachWahl = null; r._dachTakt();
return { takte: n, ms: Math.round(performance.now() - t0), decken: decken(), pool: (r._dachWahl.im || []).length };
