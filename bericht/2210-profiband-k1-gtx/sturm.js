// 2210 Profiband K1 Zelle STURM: das Spieler-Wort „stormy“ hält jede Bühne der Messung (wie regen.js), dazu 50 Tiere frei im Ring
// 15–60 m um den Spieler (spawnCreatureAt, die Seele des Spiels), die Kappe der Tiere angehoben
const st = r.state, p = st.playerMesh.position, h = (x, z) => r.getTerrainHeightAt(x, z);
if (!window.__sturmHuelle) {
    const b = window.__buehne;
    window.__buehne = (o) => b(Object.assign({ wetter: "stormy" }, o || {}));
    window.__sturmHuelle = true;
}
window.__buehne();
const vor = st.creatures.length;
st.maxCreatures = Math.max(st.maxCreatures || 0, vor + 50);
let n = 0, saat = 11;
const zufall = () => (saat = (saat * 1664525 + 1013904223) >>> 0) / 4294967296;
for (let i = 0; i < 400 && n < 50; i++) {
    const w = zufall() * 2 * Math.PI, d = 15 + 45 * zufall(), x = p.x + d * Math.cos(w), z = p.z + d * Math.sin(w);
    if (typeof r._landAt === "function" && !r._landAt(x, z, 0.3)) continue;
    if (r.spawnCreatureAt(x, h(x, z) + 0.3, z, "happy")) n++;
}
return { wetter: st.weather, tiere: st.creatures.length, neu: n, vorher: vor, kappe: st.maxCreatures };
