// 1810 S6: die Uhr des KI-Takts (Seiten-Code für `werkbank eval`, r = Welt): EIN Wrapper an der Instanz um `updateCreatures`
// (der Aufruf im Spiel-Takt `_loopWeatherAndGrowth`, dieselbe Spanne wie die Phase „creatures" der Sense-Uhr) sammelt die ms je
// Aufruf; `kreatur-uhr-lesen.js` liest und leert. Kein Proxy (Lehre 11.10.), zwei performance.now() je Takt auf beiden Seiten.
const P = Object.getPrototypeOf(r);
const u = (window.__kiUhr = { ms: [], n: 0 });
r.updateCreatures = function (dt) {
    const t0 = performance.now();
    const e = P.updateCreatures.call(this, dt);
    u.ms.push(performance.now() - t0);
    u.n++;
    return e;
};
return { an: true };
