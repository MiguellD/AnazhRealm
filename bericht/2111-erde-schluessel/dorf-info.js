return (async function dorfInfo(r) {
    const t0 = performance.now();
    const nah = () =>
        (r._bewohnerSiedlungen ? [...r._bewohnerSiedlungen.entries()] : [])
            .map(([k, S]) => ({ k, S }))
            .filter((e) => e.S && Number.isFinite(e.S.ox) && Math.hypot(e.S.ox + 841, e.S.oz + 861) < 450);
    while (performance.now() - t0 < 240000 && (!nah().length || (r._dorfOffen && r._dorfOffen() > 0)))
        await new Promise((ok) => setTimeout(ok, 500));
    await new Promise((ok) => setTimeout(ok, 3000));
    const out = nah().map(({ k, S }) => {
        const P = S.plan || {};
        const kult = {};
        for (const s of P.slots || []) kult[s.kultur] = (kult[s.kultur] || 0) + 1;
        return { k, ox: +S.ox.toFixed(1), oz: +S.oz.toFixed(1), y: +r.getTerrainHeightAt(S.ox, S.oz).toFixed(1), region: P.region, jahr: P.jahr, erde: P.erde || null, kulturen: kult, haeuser: (P.slots || []).length };
    });
    return JSON.stringify({ orte: out, offen: r._dorfOffen ? r._dorfOffen() : null, ms: Math.round(performance.now() - t0) });
})(r);
