// die Gegenprobe: dasselbe Pfützen-Stück der Station (k2-zusammenspiel.js:1169–1194, wörtlich), das Auge im Dorf der Probe
const st = r.state;
const D = [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.key === window.__dorfDerProbe);
if (!D) return { fehler: "kein Dorf der Probe" };
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
const eigen = Object.prototype.hasOwnProperty.call(r, "_lodAuge");
const lauf = (ax, az) => {
    const y = r._terrainSaatY(ax, az, true);
    r._lodAuge = () => ({ x: ax, y: y + 1.7, z: az });
    r._dachWahl = null;
    r._dachTakt();
    const im = (r._dachWahl && r._dachWahl.im) || [];
    let schatten = null;
    const U = st.atmoUniforms;
    if (typeof r._naesseAm === "function" && U && U.dachLage && U.schattenSonne) {
        const uhr = st.timeOfDay;
        try {
            st.timeOfDay = 0.45;
            const wfK = r._weatherFieldFor("sunny");
            r._schattenTakt(r.constructor._trockenAnteil(wfK));
            const S = U.schattenSonne.value, h = Math.hypot(S.x, S.z) || 1;
            const R = r.constructor._trockenRate(wfK);
            const zeit = (x, y, z) => { for (let q = 0; q < 2e4; q += 5) if (r._naesseAm(x, y, z, q * R) <= 0) return q; return null; };
            for (let i = 0; i < U.dachLage.length && !schatten; i++) {
                const L = U.dachLage[i].value, M = U.dachMass[i].value;
                if (!(M.x > 0)) continue;
                const e = Math.hypot(M.x, M.y);
                const o = (k) => { const x = L.x + (k * S.x / h) * (e + 2), z = L.y + (k * S.z / h) * (e + 2); return [x, r._terrainSaatY(x, z, true) + 0.05, z]; };
                const [pS, pO] = [o(-1), o(1)];
                if (!(r._hausSchatten(...pS) === 1 && r._hausSchatten(...pO) === 0)) continue;
                const [tS, tO] = [zeit(...pS), zeit(...pO)];
                if (tS && tO) schatten = { trockenSchattenS: tS, trockenSonneS: tO, verh: r3(tS / tO), haus: i };
            }
        } finally {
            st.timeOfDay = uhr;
            r._schattenTakt(r.constructor._trockenAnteil(r._weatherFieldFor(st.weather)));
        }
    }
    return { auge: [r3(ax), r3(az)], ab: r3(Math.hypot(ax - D.ox, az - D.oz)), plaetze: im.length, im, schatten: schatten ? schatten.verh : 0, pfuetze: schatten };
};
const pm = st.playerMesh.position;
const aus = { dorf: D.key, ab: r3(Math.hypot(D.ox - pm.x, D.oz - pm.z)), wiese: lauf(pm.x, pm.z), mitte: lauf(D.ox, D.oz), pose: lauf(D.ox, D.oz + 32) };
if (!eigen) delete r._lodAuge;
r._dachWahl = null;
r._dachTakt();
aus.zurueck = { plaetze: ((r._dachWahl && r._dachWahl.im) || []).length };
return aus;
