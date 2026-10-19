const st = r.state;
const e = st.architectures.find((a) => a.id === st.player.mountedArch);
return { geritten: !!e, inst: !!(e && e.instanced), weg: +(window.__fahrWeg || 0).toFixed(1), pos: e && [Math.round(e.position.x), Math.round(e.position.z)], v: +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(1), sicht: st.cameraMode };
