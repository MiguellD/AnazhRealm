const st = r.state;
const f = () => ({ t: st.spielZeit, frame: st.renderer && st.renderer.info && st.renderer.info.render ? st.renderer.info.render.frame : null, tod: st.timeOfDay });
const a = f(); await new Promise((res) => setTimeout(res, 3000)); const b = f();
const D = [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.key === window.__dorfDerProbe);
const h = (st.architectures || []).filter((e) => e.type && e.type.startsWith("haus_") && e.position && Math.hypot(e.position.x - D.ox, e.position.z - D.oz) <= 64);
return { a, b, takt: typeof window.__werkTakt, haeuser: h.map((e) => ({ lod: e._lodLevel, served: e._servedLod, stufe: e._hausHuelle && e._hausHuelle.stufe, keys: e._hausHuelle ? Object.keys(e._hausHuelle) : null, d: Math.round(Math.hypot(e.position.x - st.playerMesh.position.x, e.position.z - st.playerMesh.position.z)) })) };
