// 2210 Profiband K1: der Geher mit Tempo window.__geherV (Standard 4 m/s; Sprint = state.sprintSpeed). Vorlage 1910 F1 (Vorlage p3/n1810/s6/serie.sh, der Geher als Datei statt Inline): 4 m/s geradeaus −z 0 → −60 m und zurück, Haken in
// tickAffordances (Seiten-Code für `werkbank eval`, r = Welt). Zusatz F1: der Geher prüft, dass die Welt seine Lage übernimmt —
// `abwMax` = größter waagrechter Abstand zwischen der Lage beim Eintritt und der zuletzt gesetzten (B interpoliert zwischen den zwei
// jüngsten Sim-Zuständen; ein Rückschreiben der Lage stünde hier), `weg` = der gesetzte Weg in m.
const P = Object.getPrototypeOf(r);
const pm = r.state.playerMesh.position;
const g = (window.__bodenGeher = { x: pm.x, z: pm.z, s: 0, dir: -1, wege: 0, weg: 0, abwMax: 0, n: 0, lx: null, lz: null });
r.tickAffordances = function (dt) {
    if (Number.isFinite(dt) && dt > 0) {
        const p = this.state.playerMesh.position;
        if (g.lx !== null) g.abwMax = Math.max(g.abwMax, Math.hypot(p.x - g.lx, p.z - g.lz));
        const s0 = g.s;
        g.s += g.dir * (window.__geherV || 4) * Math.min(dt, 0.1);
        if (g.s <= -60) {
            g.s = -60;
            g.dir = 1;
            g.wege++;
        }
        if (g.s >= 0) {
            g.s = 0;
            g.dir = -1;
            g.wege++;
        }
        g.weg += Math.abs(g.s - s0);
        p.x = g.x;
        p.z = g.z + g.s;
        g.lx = p.x;
        g.lz = p.z;
        g.n++;
    }
    return P.tickAffordances.call(this, dt);
};
return { ein: true, x: g.x, z: g.z };
