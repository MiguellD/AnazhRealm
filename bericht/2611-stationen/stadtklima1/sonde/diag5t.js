// der Spieler im Dorf der Probe (Pose der Station: 32 m vor der Mitte), die Welt liefert ihre nahen Stufen; danach das
// Pfützen-Stück der Station wörtlich mit dem echten Auge — und die Decken der Hüllen im Dorf
const st = r.state;
const D = [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.key === window.__dorfDerProbe);
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
const pm = st.playerMesh.position;
const vor = [pm.x, pm.y, pm.z];
const ziel = ARG.ziel || "mitte";
const [x, z] = ziel === "pose" ? [D.ox, D.oz + 32] : [D.ox + 3, D.oz + 3];
pm.set(x, r._terrainSaatY(x, z, true) + 1, z);
const decken = () => (st.architectures || []).filter((e) => e._hausHuelle && e.position && Math.hypot(e.position.x - D.ox, e.position.z - D.oz) <= 64).map((e) => (Array.isArray(e._hausHuelle.decken) ? e._hausHuelle.decken.length : -1));
const t0 = performance.now();
let d = decken();
while (performance.now() - t0 < ARG.ms && !(d.length && d.every((n) => n >= 0) && r._dachWahl && (r._dachWahl.im || []).length)) { await window.__werkTakt(); d = decken(); }
const warte = Math.round(performance.now() - t0);
let schatten = null;
const U = st.atmoUniforms;
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
const aus = { ziel, warte, deckenJeHaus: d, im: (r._dachWahl && r._dachWahl.im) || [], schatten: schatten ? schatten.verh : 0, pfuetze: schatten };
if (ARG.zurueck) pm.set(...vor);
return aus;
