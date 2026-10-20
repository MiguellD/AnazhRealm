// 2010 Bündel FAHRT: was der Fahrer im Lauf gefahren ist (Seiten-Code für `werkbank eval`): Weg, v p10/p50/p90, Anteil der
// Takte mit 8–12 m/s, Wechsel Third ↔ Ego, Ego-Anteil — und ob der Spieler noch sitzt.
const st = r.state;
const F = window.__fahrt || { v: [] };
const e = st.architectures.find((a) => a.id === st.player.mountedArch);
const v = F.v.slice().sort((a, b) => a - b);
const q = (p) => (v.length ? +v[Math.min(v.length - 1, Math.floor(p * v.length))].toFixed(1) : null);
const im = F.v.filter((x) => x >= 8 && x <= 12).length;
return {
    geritten: !!e,
    weg: +F.weg.toFixed(1),
    takte: F.v.length,
    v10: q(0.1),
    v50: q(0.5),
    v90: q(0.9),
    anteil8bis12: v.length ? +(im / v.length).toFixed(3) : null,
    wechsel: F.wechsel,
    egoAnteil: v.length ? +(F.ego / v.length).toFixed(3) : null,
    sicht: st.cameraMode,
};
