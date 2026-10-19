// 1810 S6: der Tier-Zensus einer Welt (Seiten-Code für `werkbank eval`, r = Welt). Je Welt: Anzahl und Art (die Gattung am
// Körper, wie `tierZahl` der Werkbank), die Würfe (gleiche Art + gleicher Revier-Anker `wanderAnchor` = ein Wurf aus
// `_kreaturWurf`, an A wie an B), die Verbände (B: `userData.verband` = die netId des Leittiers; an A gibt es das Feld nicht),
// die Lage der Gruppe (Spanne = größter Abstand eines Glieds zur Mitte, Abstand der Mitte zum Spieler), der Zustand
// (`_motionZustand`: flucht/schwimmen/…) und die Jäger (`_jagdZiel`). Liest nur, schreibt nichts.
const st = r.state;
const pm = st.playerMesh ? st.playerMesh.position : { x: 0, z: 0 };
const cs = (st.creatures || []).filter((c) => c && c.position);
const arten = {};
const zustand = {};
const wuerfe = new Map();
const verb = new Map();
let jaeger = 0;
for (const c of cs) {
    const u = c.userData || {};
    const art = u.gattung || u.soul || "?";
    arten[art] = (arten[art] || 0) + 1;
    const z = u._motionZustand || "-";
    zustand[z] = (zustand[z] || 0) + 1;
    if (u._jagdZiel != null) jaeger++;
    const a = u.wanderAnchor;
    const wk = art + "@" + (a ? a.x.toFixed(1) + "," + a.z.toFixed(1) : "-");
    if (a) (wuerfe.get(wk) || wuerfe.set(wk, []).get(wk)).push(c);
    if (u.verband != null) (verb.get(u.verband) || verb.set(u.verband, []).get(u.verband)).push(c);
}
const lage = (g) => {
    let mx = 0,
        mz = 0;
    for (const c of g) {
        mx += c.position.x;
        mz += c.position.z;
    }
    mx /= g.length;
    mz /= g.length;
    let sp = 0;
    for (const c of g) sp = Math.max(sp, Math.hypot(c.position.x - mx, c.position.z - mz));
    return { mitte: [+mx.toFixed(1), +mz.toFixed(1)], spanneM: +sp.toFixed(1), spielerM: +Math.hypot(mx - pm.x, mz - pm.z).toFixed(1) };
};
const gruppen = [...wuerfe.entries()]
    .filter(([, g]) => g.length >= 2)
    .map(([k, g]) => Object.assign({ wurf: k, n: g.length }, lage(g)));
const verbaende = [...verb.entries()].map(([vb, g]) => {
    const art = {};
    for (const c of g) {
        const a = (c.userData && (c.userData.gattung || c.userData.soul)) || "?";
        art[a] = (art[a] || 0) + 1;
    }
    const leit = g.some((c) => c.userData && c.userData.netId === vb);
    return Object.assign({ vb: String(vb).slice(0, 12), n: g.length, art, leitLebt: leit }, lage(g));
});
return {
    gesamt: cs.length,
    arten,
    zustand,
    jaeger,
    wuerfeAb2: gruppen.length,
    tiereInWuerfen: gruppen.reduce((s, g) => s + g.n, 0),
    gruppen,
    verbandFeld: cs.some((c) => c.userData && c.userData.verband != null),
    verbaendeAb2: verbaende.filter((v) => v.n >= 2).length,
    verbaende,
    verbaendeMap: r._verbaende ? r._verbaende.size : null,
    spieler: [+pm.x.toFixed(1), +pm.z.toFixed(1)],
};
