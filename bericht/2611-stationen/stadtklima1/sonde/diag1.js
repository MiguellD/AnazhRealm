const st = r.state; const U = st.atmoUniforms;
const aus = { naesseAm: typeof r._naesseAm, U: !!U, dachLage: !!(U && U.dachLage), schattenSonne: !!(U && U.schattenSonne), auge: r._lodAuge && r._lodAuge(), wahl: r._dachWahl && { im: r._dachWahl.im, raus: (r._dachWahl.raus||[]).length }, archs: (st.architectures||[]).length, tod: st.timeOfDay, weather: st.weather };
if (U && U.dachLage && U.schattenSonne) {
  const uhr = st.timeOfDay;
  try {
    st.timeOfDay = 0.45;
    const wfK = r._weatherFieldFor("sunny");
    r._schattenTakt(r.constructor._trockenAnteil(wfK));
    const S = U.schattenSonne.value, h = Math.hypot(S.x, S.z) || 1;
    aus.sonne = [S.x, S.y, S.z, S.w].map((v) => +v.toFixed(3));
    aus.R = r.constructor._trockenRate(wfK);
    aus.plaetze = [];
    for (let i = 0; i < U.dachLage.length; i++) {
      const L = U.dachLage[i].value, M = U.dachMass[i].value;
      const e = Math.hypot(M.x, M.y);
      const o = (k) => { const x = L.x + (k * S.x / h) * (e + 2), z = L.y + (k * S.z / h) * (e + 2); return [x, r._terrainSaatY(x, z, true) + 0.05, z]; };
      const [pS, pO] = [o(-1), o(1)];
      aus.plaetze.push({ i, L: [L.x, L.y].map((v) => +v.toFixed(1)), M: [M.x, M.y, M.z].map((v) => +v.toFixed(2)), e: +e.toFixed(2), yS: +pS[1].toFixed(2), sS: r._hausSchatten(...pS), sO: r._hausSchatten(...pO) });
    }
  } finally { st.timeOfDay = uhr; r._schattenTakt(r.constructor._trockenAnteil(r._weatherFieldFor(st.weather))); }
}
return aus;
