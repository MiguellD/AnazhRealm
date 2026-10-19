// 1910 S6-Takt UMSCHALTER: der Verband AN — jedes in vb-aus.js gemerkte Glied trägt wieder seinen Verband.
const S = window.__vbStash;
let n = 0;
if (S) {
    for (const [c, vb] of S) if (c && c.userData && r.state.creatures.includes(c)) {
        c.userData.verband = vb;
        n++;
    }
    S.clear();
}
let glieder = 0;
for (const c of r.state.creatures) if (c && c.userData && c.userData.verband != null) glieder++;
return { an: n, glieder };
