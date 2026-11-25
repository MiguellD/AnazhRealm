// KANDIDAT für karte2.mensch.wirtschaft.energie#1 („Ofen kostet Holz": Holzstapel sinkt je Schmelze; ohne Holz kein Barren) —
// der Leser für den Koordinator (Zweig rennofen). Er ändert weder Soll noch Richter-Text der Station: er ersetzt nur den
// `K.leser(1, …)`-Ruf in `messe` von F.leiter("mensch.wirtschaft.energie") durch den Ruf unten und trägt `RENNOFEN` in `seite`.
// Gelesen wird der Wirt: `_stoffstromZensus(S)` (stamm/siedlung-bewohner.js) — der Kohle-Stapel am Ofen und die Ofenreisen der
// EINEN Kette (koerper `stoffstromFassen`), sein Gegenlauf ist dieselbe Kette des Kerns mit leerem Stapel.
//
//   seite: { STADT, MUEHLE, RENNOFEN },
//   await K.schritt(1, async () => {
//       const o = await ruf("RENNOFEN", { tage: 7 });
//       H.zeile("Rennofen: " + o.ketten + " Ketten, " + o.reisen + " Ofenreisen in " + o.tage + " Tagen, Stapel " + o.kohle0Kg + " → " + o.kohleKg + " kg, je Schmelze " + o.holz + " kg, Gegenlauf ohne Kohle " + o.ohneHolz + " Barren");
//       if (!o.ketten) return K.leser(1, { n: z().schmieden, fehlt: "kein Rennofen am Messort: " + z().schmieden + " Schmieden, keine Kette (ohne Schmiede oder ohne Fels binnen 420 m trägt der Ort keine)", wo: "stamm/siedlung-bewohner.js _stoffstromAnlegen" });
//       K.zahl(1, { n: o.reisen, werte: { holz: o.holz, ohneHolz: o.ohneHolz }, beleg: o.reisen + " Ofenreisen, " + o.kohleVerbranntKg + " kg Kohle für " + o.erzKg + " kg Erz, " + o.energieMJ + " MJ", taeter: o.ohneHolz > 0 ? "Barren ohne Kohle (koerper stoffstromFassen)" : !(o.holz < 0) ? "der Stapel sinkt nicht je Ofenreise" : null });
//   });
const RENNOFEN = async (r, T, arg) => {
    const KC = window.__koerperCore;
    const ST = globalThis.__schmiedeCore.STOFFSTROM;
    const pm = r.state.playerMesh.position;
    const alle = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan);
    await window.__gebautNach("die Kette des Rennofens am Messort (energie)", {
        fertig: () => alle().some((S) => Array.isArray(S.liste) && S.liste.length > 0),
    });
    const SL = alle()
        .filter((S) => S.stoffstrom)
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    if (!SL.length) return { ketten: 0, reisen: 0, tage: 0 };
    const S = SL[0];
    const Z = S.stoffstrom;
    const tage = Math.max(1, (arg && arg.tage) || 7);
    const echt = r._weltStunde;
    const h0 = echt.call(r);
    let a = null;
    let b = null;
    try {
        r._weltStunde = () => h0;
        a = r._stoffstromZensus(S);
        r._weltStunde = () => h0 + 24 * tage;
        b = r._stoffstromZensus(S);
    } finally {
        r._weltStunde = echt;
    }
    // DER GEGENLAUF: dieselbe Kette des Kerns an Abzügen derselben Öfen, der Stapel leer — gießt sie einen Barren, brennt der Ofen ohne Kohle
    const oefen = Z.K.oefen.map((O) => structuredClone(O));
    const G = KC.stoffstromHalter(oefen, h0, Z.K.ausbeute, Z.K.werkzeugKg, 0, S.plan.seed >>> 0, ST.feuer(1, ST.erz).kohle);
    [G.kohleKg, G.kohle0] = [0, 0];
    KC.stoffstromFassen(G, h0 + 24 * tage);
    // je SCHMELZE: die Ofenreisen, die der Zeitraum geladen hat (die beendeten und die im Schacht) — der Stapel gibt beim Laden
    const reisen = b.reisen + b.imSchacht - (a.reisen + a.imSchacht);
    return {
        ketten: SL.length,
        tage,
        reisen,
        holz: reisen > 0 ? +((b.kohleKg - a.kohleKg) / reisen).toFixed(3) : 0,
        ohneHolz: G.barren,
        ohneHolzLuppeKg: +G.eisen.toFixed(3),
        kohle0Kg: a.kohleKg,
        kohleKg: b.kohleKg,
        kohleVerbranntKg: +(b.kohleVerbranntKg - a.kohleVerbranntKg).toFixed(3),
        erzKg: +(b.erzKg - a.erzKg).toFixed(3),
        eisenKg: +(b.eisenKg - a.eisenKg).toFixed(3),
        energieMJ: +(b.energieMJ - a.energieMJ).toFixed(1),
        haldeKg: [a.haldeKg, b.haldeKg],
        barren: [a.barren, b.barren],
        werkzeug: [a.werkzeug, b.werkzeug],
        kaltH: b.kaltH,
    };
};
module.exports = { RENNOFEN };
