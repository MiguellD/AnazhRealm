// c-mess.cjs — Zensus PLANET (c) klima-wetter: rechnet die Größen aus den Kernen am Baum nach (nur lesen).
// Aufruf: node c-mess.cjs [Pfad zum Baum]
"use strict";
const path = require("path");
const W = process.argv[2] || "/home/user/AnazhRealm";
require(path.join(W, "gelaende-core.js"));
require(path.join(W, "phyto-core.js"));
const G = globalThis.__gelaendeCore;
const P = globalThis.__phytoCore;
const out = {};
const r = (v, n = 4) => Math.round(v * 10 ** n) / 10 ** n;

// 1) Die Tafel der Heimat
const O = G.ortGesetz(null);
out.klimaHeute = O.klimaHeute;
out.kuehlungKJeM = O.kuehlungKJeM;
out.kuehlung_vs_065 = r(O.kuehlungKJeM / 0.0065, 2);
out.stauchung_sv = r(0.0065 / O.kuehlungKJeM, 5);
out.spendeMm = O.klimaHeute.spendeMm;
out.wuchsHeimat = O.wuchs;

// 2) Das Temperatur-Feld: hängt es an x, z? (Signatur: temperaturFeld(L, y, traeg) — kein x, z)
const L = { waterLevel: 0, ort: O };
const T = (y, saison, uhr, wetter) => G.temperatur(L, y, saison, uhr, 0, wetter);
out.temperatur = {
    meer_sommer_mittag: r(T(0, 0.375, 0.5)),
    meer_sommer_15uhr: r(T(0, 0.375, 0.625)),
    meer_sommer_3uhr: r(T(0, 0.375, 0.125)),
    meer_winter_15uhr: r(T(0, 0.875, 0.625)),
    meer_winter_3uhr: r(T(0, 0.875, 0.125)),
    h100_sommer_tagesmittel: r(T(100, 0.375, 0.375)) /* Uhr 0,375: cos(2π·(−0,25)) = 0, die Tages-Welle steht auf 0 */,
    h162_5_sommer_tagesmittel: r(T(162.5, 0.375, 0.375)),
    h200_winter_3uhr: r(T(200, 0.875, 0.125)),
    sturm_meer_sommer_15uhr: r(T(0, 0.375, 0.625, P.WX_GESETZ.sturm)),
    regen_meer_sommer_15uhr: r(T(0, 0.375, 0.625, P.WX_GESETZ.regen)),
    jahresmittel_meer: (O.klimaHeute.sommer + O.klimaHeute.winter) / 2,
    jahresamplitude: (O.klimaHeute.sommer - O.klimaHeute.winter) / 2,
};
const F = G.temperaturFeld(L, 50, 0);
out.feld_y50 = F;

// 3) Schnee: die Linie des Pegels zur Sommer- und Winter-Mitte, Versatz, Pegel an der Mess-Höhe
out.schnee = {
    linie_sommer: r(G.schneeLinie(L, 0.375), 2),
    linie_winter: r(G.schneeLinie(L, 0.875), 2),
    linie_fruehling: r(G.schneeLinie(L, 0.125), 2),
    linie_herbst: r(G.schneeLinie(L, 0.625), 2),
    versatz_winter: G.schneeVersatz(L, 0.875),
    null_grad_sommer_m: r(O.klimaHeute.sommer / O.kuehlungKJeM, 2),
    null_grad_jahr_m: r(((O.klimaHeute.sommer + O.klimaHeute.winter) / 2) / O.kuehlungKJeM, 2),
    pegel_meer_winter_mitte_m: r(G.schneePegel(L, 0, 0.875), 4),
};
{
    let lo = Infinity,
        loS = 0;
    for (let i = 0; i < 365; i++) {
        const s = i / 365;
        const y = G.schneeLinie(L, s);
        if (y < lo) [lo, loS] = [y, s];
    }
    out.schnee.linie_min_jahr = r(lo, 2);
    out.schnee.linie_min_saison = r(loS, 4);
    out.schnee.tage_mit_schnee_am_meer = (() => {
        let n = 0;
        for (let i = 0; i < 365; i++) if (G.schneePegel(L, 0, i / 365) >= 0.05) n++;
        return n;
    })();
}

// 4) Das Wetter der Front: Anteile über die Zeit an (0, 0) für die Saat der Vorgabe, und wie oft das Wort je Zug wechselt
const saat = "anazh-realm-seed";
const Z = 120;
const N = 20000;
const zaehl = { klar: 0, nebel: 0, bewoelkt: 0, regen: 0, sturm: 0 };
let wechsel = 0;
let vor = null;
let regenSumme = 0;
for (let k = 0; k < N; k++) {
    const w = P.wetterAt(saat, 0, 0, k * Z).zeile;
    zaehl[w]++;
    regenSumme += P.WX_GESETZ[w].rain;
    if (vor !== null && w !== vor) wechsel++;
    vor = w;
}
out.front_anteile_00 = Object.fromEntries(Object.entries(zaehl).map(([k, v]) => [k, r(v / N, 3)]));
out.front_wechsel_je_zug = r(wechsel / (N - 1), 3);
out.regen_mittel_00_20000 = r(regenSumme / N, 4);
let rm = 0;
for (let k = 0; k < 2000; k++) rm += P.WX_GESETZ[P.wetterAt(saat, 0, 0, k * Z).zeile].rain;
out.regen_mittel_REGEN_KLIMA_ZUEGE = r(rm / 2000, 4);
// Die Dauer eines Fensters gleichen Worts in Zügen
// Räumlich: dasselbe Wort an zwei Orten im Abstand d (quer und längs der Grundrichtung) zur selben Zeit
const g = P.windGrund(saat);
const gleichAnteil = (d, quer) => {
    let s = 0;
    const M = 4000;
    for (let k = 0; k < M; k++) {
        const t = k * 37;
        const a = P.wetterAt(saat, 0, 0, t).zeile;
        const bx = quer ? -g.z * d : g.x * d;
        const bz = quer ? g.x * d : g.z * d;
        const b = P.wetterAt(saat, bx, bz, t).zeile;
        if (a === b) s++;
    }
    return r(s / M, 3);
};
out.gleiches_wort = {
    laengs_1km: gleichAnteil(1000, false),
    laengs_3km: gleichAnteil(3000, false),
    laengs_10km: gleichAnteil(10000, false),
    quer_3km: gleichAnteil(3000, true),
    quer_10km: gleichAnteil(10000, true),
};
// über Saaten: die Verteilung (wie der Kommentar phyto-core:4312)
const zs = { klar: 0, nebel: 0, bewoelkt: 0, regen: 0, sturm: 0 };
let zn = 0;
for (let s = 0; s < 300; s++)
    for (let i = 0; i < 400; i++) {
        const w = P.wetterAt("s" + s, (i % 20) * 777 - 7000, Math.floor(i / 20) * 913 - 9000, i * 61.3).zeile;
        zs[w]++;
        zn++;
    }
out.front_anteile_300saaten = Object.fromEntries(Object.entries(zs).map(([k, v]) => [k, r(v / zn, 3)]));

// 5) Der Wind: m/s je Zeile (Mitte der Böe, Form 1, Wob 1), Böe max; Mäander
const B = P.WIND_GESETZ.boe;
out.wind_ms_mitte = Object.fromEntries(
    Object.entries(P.WX_GESETZ).map(([k, v]) => [k, r(v.wind * B.mitte * P.WIND_FELD.sturmMS, 2)])
);
out.wind_ms_boe_max = Object.fromEntries(
    Object.entries(P.WX_GESETZ).map(([k, v]) => [k, r(v.wind * 1.18 * (B.mitte + B.amp) * P.WIND_FELD.sturmMS * 1.2, 2)])
);
out.wind_maeander_grad = r(((0.5 + 0.22) * 180) / Math.PI, 1);
out.windGrund_heimat = g;
out.boe_wellenlaenge_m = r((2 * Math.PI) / B.k, 1);
out.boe_periode_s = r((2 * Math.PI) / B.omega, 2);
out.regen_drift_ms_je_einheit = 7;
out.wind_ms_je_einheit_mitte = r(B.mitte * P.WIND_FELD.sturmMS, 2);

// 6) Die Stufen der Front am Ort: Δ regenQuote ±0,1 → Weg der Stufe
out.wetterVersatz_beispiel = (() => {
    const o = { regenQuote: 0.1, sturmQuote: 0.05 };
    let a = 0,
        b = 0;
    const M = 20000;
    for (let k = 0; k < M; k++) {
        const w0 = P.wetterAt(saat, 0, 0, k * Z).zeile;
        const w1 = P.wetterAt(saat, 0, 0, k * Z, o).zeile;
        if (w0 === "regen" || w0 === "sturm") a++;
        if (w1 === "regen" || w1 === "sturm") b++;
    }
    return { nass_heimat: r(a / M, 3), nass_mit_delta_0_1: r(b / M, 3) };
})();

// 7) Die Uhren: Jahr der Saison (2400 s) gegen den Tag der Uhr (60 min) gegen die Tage der Physik (365)
out.uhren = {
    jahr_s: 2400,
    tag_s: 60 * 60,
    jahre_je_tag: r(3600 / 2400, 3),
    jahrTage_physik: G.TEMPERATUR.jahrTage,
    pegel_tag_s: 3600,
    wetter_zug_s: 120,
    zuege_je_jahr: 2400 / 120,
};

// 8) ortWuchs der Heimat: nadel, sand an tJ = 7 °C
out.ortWuchs_heimat_sand = O.wuchs.sand;

// 9) Die Nässe: Trocknen
const NA = { regenAb: 0.05, benetzenS: 150, verdunstS: 480, sonne: 0.6, wind: 0.4, luft: 0.15, versickern: 0.3, erde: 1 };
const rate = (wf) => ((NA.sonne * wf.sun + NA.wind * wf.wind + NA.luft) * (1 - NA.versickern + NA.versickern * NA.erde)) / NA.verdunstS;
out.naesse_trocken_min = Object.fromEntries(
    ["klar", "bewoelkt", "nebel"].map((k) => [k, r(0.91 / rate(P.WX_GESETZ[k]) / 60, 2)])
);
// 10) Der Regen in Millimetern (PEGEL.regen: Regen 1 = 10 mm/h, Beiwert 0,3 → 0,072 m Abfluss je Spieltag) gegen die Spende
{
    const mittel = out.regen_mittel_REGEN_KLIMA_ZUEGE;
    const mmJeTagBeiEins = (G.PEGEL.regen / 0.3) * 1000; // Niederschlag (nicht Abfluss) bei Regen 1, mm je Spieltag
    out.regen_bilanz = {
        niederschlag_mm_je_tag_bei_regen1: r(mmJeTagBeiEins, 1),
        niederschlag_mm_je_jahr_im_mittel: r(mittel * mmJeTagBeiEins * G.TEMPERATUR.jahrTage, 0),
        abfluss_regen_mm_je_jahr_im_mittel: r(mittel * G.PEGEL.regen * 1000 * G.TEMPERATUR.jahrTage, 0),
        spende_mm_je_jahr: r(G.PEGEL.spende * 1000 * G.TEMPERATUR.jahrTage, 1),
        verhaeltnis_regenabfluss_zu_spende: r((mittel * G.PEGEL.regen) / G.PEGEL.spende, 1),
    };
    // Der Hub über 30 Spieltage nach dem Fenster: der Lauf des Regens der Front an (0, 0), Züge je 120 s mit 45-s-Rampe
    const tagS = 3600;
    const S = [];
    let vorR = null;
    const tage = 60;
    for (let k = 0; k * Z <= tage * tagS; k++) {
        const rr = P.WX_GESETZ[P.wetterAt(saat, 0, 0, k * Z).zeile].rain;
        if (vorR === null) S.push(k * Z, rr);
        else if (rr !== vorR) S.push(k * Z, vorR, k * Z + 45, rr);
        vorR = rr;
    }
    const Lp = { waterLevel: 0, ort: O, hydroGesetz: { kanalTiefe: 0.8, spiegelFreibord: 0.25, dammFreibord: 0.2 } };
    const tf = 0.6,
        krone = 0.2;
    const hubVon = (q) => Math.max(-tf, Math.min(krone, tf * (Math.pow(Math.max(0, 1 + q / G.PEGEL.spende), 0.6) - 1)));
    const klassen = [0, 8, 16, 23];
    const an = Object.fromEntries(klassen.map((j) => [j, 0]));
    const sum = Object.fromEntries(klassen.map((j) => [j, 0]));
    let n = 0;
    for (let t = 31 * tagS; t < tage * tagS; t += 97) {
        const lauf = G.pegelLauf(Lp, S, t, tagS, mittel, null);
        for (const j of klassen) {
            const h = hubVon(lauf.q[j]);
            if (h >= krone - 0.005) an[j]++;
            sum[j] += h;
        }
        n++;
    }
    out.pegel_hub_regen = {
        anteil_an_der_krone: Object.fromEntries(klassen.map((j) => [`j${j}`, r(an[j] / n, 3)])),
        hub_mittel_m: Object.fromEntries(klassen.map((j) => [`j${j}`, r(sum[j] / n, 3)])),
        krone_m: krone,
        proben: n,
    };
}
// 11) Der Zwilling des Planeten: was planet-core an seinem eigenen Anker der Heimat sagen würde (dieselbe Rechnung wie
// voxel-worker.js:1164–1180: planetPlan(samen, PLANET_ERDE) · planetAnker(plan, 0, ortGesetz()) · planetOrt)
{
    require(path.join(W, "planet-core.js"));
    const PC = globalThis.__planetCore;
    const plan = PC.planetPlan(saat, PC.PLANET_ERDE);
    const A = PC.planetAnker(plan, 0, O);
    const o = PC.planetOrt(PC.planetScheibe(plan, 0), A.breite, A.laenge, O, {});
    const grad = (x) => r((x * 180) / Math.PI, 2);
    const wg = P.windGrund(saat);
    out.planet_am_anker = {
        breite_grad: grad(A.breite),
        laenge_grad: grad(A.laenge),
        wertung: r(A.wertung, 4),
        kuesteKm: r(A.kuesteKm, 1),
        klima: Object.fromEntries(Object.entries(o.klima).map(([k, v]) => [k, r(v, 3)])),
        wetter: Object.fromEntries(Object.entries(o.wetter).map(([k, v]) => [k, r(v, 3)])),
        winkel_wind_planet_zu_theta0_grad: r((Math.acos(o.wetter.windX * wg.x + o.wetter.windZ * wg.z) * 180) / Math.PI, 1),
    };
}
console.log(JSON.stringify(out, null, 2));
