// gesetz-proto.cjs — DER PROTOTYP DES GESETZES (koordination vision/bau/entscheid.md §1.1/§1.2), nur im Spike, kein Spiel-Code.
// Jede Konstante aus entscheid.md §1.1 wörtlich; was der Entscheid NICHT festlegt, steht unten als SPIKE-SCHLIESSUNG (Annahme,
// benannt) — das ist selbst ein Befund: ohne diese Schließungen rechnet das Gesetz kein Haus.
"use strict";

// ── §1.1 wörtlich ─────────────────────────────────────────────────────────────────────────────
const BAU_GESETZ = Object.freeze({
    kmod: 0.8, gammaM: 1.3, kdef: 0.6, psi2: 0.3, gammaG: 1.35, gammaQ: 1.5, wInst: 300, wFin: 250,
    gDecke: 1.5, qWohnen: 2.0, sockel: 0.30, wandSchlank: 25, sigma0: 1.2, diele: 0.06, zopf: 0.70,
    deckung: { biber: [30, 0.75], schindel: [22, 0.25], reet: [45, 0.7], hohlpfanne: [35, 0.75], moench: [22, 0.75], lehmflach: [2, 1.5], flach: [2, 0.3] },
    klasse: [0.5, 0.9], wohl: [0.44, 1.0, 1.8], kinder: [2, 2.5, 3],
    schlafM2: 2.5, kammerM2: 1.5, herdraum: [9, 2], kueche: [9, 14], stube: [8, 2], stubeAb: 1300, kuecheAb: 1700,
    hofstaette: [15, 30], dichte: [150, 250],
    licht: [[1500, 2.0], [1800, 2.2], [1900, 2.6], [1e9, 2.4]],
    bruestung: [[1900, 0.7], [1e9, 0.8]],
    lichtAnteil: [[1500, 1 / 12], [1800, 1 / 10], [1e9, 1 / 8]],
    scheibe: [[1500, 0.12], [1700, 0.25], [1900, 0.5], [1e9, 9]],
    kaminUeberFirst: 0.4, heizgrenze: 15,
});
// drei Holz-Zeilen (entscheid §1.1 unten: eiche D30, kiefer/tanne C24 nach EN 338, unsicher; Werte aus entwurf-stoff-statik §1.1)
const HOLZ = { eiche: { E: 11000e6, fmk: 30e6, rho: 640 }, kiefer: { E: 11000e6, fmk: 24e6, rho: 420 }, tanne: { E: 11000e6, fmk: 24e6, rho: 420 } };
// LEUTE_GESETZ.nutz 0,7 (FC:9526) bleibt gelesen (Entwurf B 1.1 `nutz`)
const NUTZ = 0.7;

// ── SPIKE-SCHLIESSUNGEN (der Entscheid nennt sie nicht; jede benannt) ──────────────────────────────
const SCHLIESSUNG = Object.freeze({
    // S1 Balkenabstand e: BAU_GESETZ trägt KEIN e (entscheid §1.1); Entwurf A rechnete gesetz.cjs mit 0,85 (Sparrenteilung FC:778)
    eBalken: 0.85,
    // S2 Stamm-Durchmesser je Art: nur Eiche 0,258 m benannt (entscheid §1.1 „ohne Anker“); Kiefer/Tanne ohne Wert → dieselbe Zahl
    stammD: { eiche: 0.258, kiefer: 0.258, tanne: 0.258 },
    // S3 Heimat-Ort (das Labor, ortGesetz(null)): Eiche, s_k 1,51 kN/m² (Entwurf A §2)
    ort: { holz: "eiche", d: 0.258, sk: 1.51 },
    // S4 Geschosse aus Fläche und Los-Breite: der Entscheid lässt Packer capK/capL/F0/Mindestfuß/Klammer fallen (§2 D1) und nennt
    //    keinen Ersatz für die Wahl von st bei F = W·D·st. Schließung: das kleinste st, dessen Tiefe ≤ dZiel (B leiht dMax 11, Blatt b)
    dZiel: 11,
    dMin: 4, // Tiefe nie unter 4 m (die untere Würfel-Klammer FC:2209; ohne sie fiele eine 15-m-Front auf 2 m Tiefe)
    // S5 Kammern je Haushalt: Entwurf B rechnet 1/3/6 ohne Formel → arm 1, sonst ⌈Köpfe/2⌉
    kammern: (koepfe, klasse) => (klasse === 0 ? 1 : Math.ceil(koepfe / 2)),
    // S6 Klasse: „Quantil-Grenzen“ — gelesen als Rang-Quantil von q im Plan (50/40/10 %); wörtlich q < 0,5 | < 0,9 gäbe ~2 % reich
    klasseNachRang: true,
});

// GEWERBE (entscheid §1.1: 11 Zeilen; Entwurf B füllt tageloehner, baecker, kaufmann, ackerbuerger — die übrigen 7 sind SPIKE-ANNAHMEN)
// raeume: [id, m² netto, geschoss eg|og|keller|dach|getrennt]
const GEWERBE = {
    tageloehner: { gruppe: "unter", gesinde: 0, raeume: [] },
    ackerbuerger: { gruppe: "acker", gesinde: 2, raeume: [["stall", 25, "eg"], ["scheune", 60, "getrennt"]] },
    baecker: { gruppe: "lebensmittel", gesinde: 3, raeume: [["backstube", 18, "eg"], ["laden", 6, "eg"], ["mehlkammer", 8, "og"], ["holzlege", 6, "getrennt"]] },
    kaufmann: { gruppe: "handel", gesinde: 6, raeume: [["diele", 30, "eg"], ["kontor", 14, "eg"], ["lager", 80, "dach"], ["keller", 40, "keller"]] },
    schmied: { gruppe: "handwerk", gesinde: 2, raeume: [["werkstatt", 30, "eg"]] }, // Annahme
    wirt: { gruppe: "lebensmittel", gesinde: 3, raeume: [["gaststube", 40, "eg"], ["gastkammern", 30, "og"], ["keller", 30, "keller"]] }, // Annahme
    gerber: { gruppe: "handwerk", gesinde: 1, raeume: [["werkraum", 25, "eg"], ["trockenboden", 30, "dach"]] }, // Annahme
    weber: { gruppe: "handwerk", gesinde: 1, raeume: [["webstube", 20, "eg"]] }, // Annahme
    brauer: { gruppe: "lebensmittel", gesinde: 4, raeume: [["sudhaus", 35, "eg"], ["keller", 40, "keller"]] }, // Annahme
    kraemer: { gruppe: "handel", gesinde: 1, raeume: [["laden", 12, "eg"], ["lager", 10, "eg"]] }, // Annahme
    geistlich: { gruppe: "kirche", gesinde: 1, raeume: [["studierstube", 12, "og"]] }, // Annahme
};
// GEWERBE_ANTEIL[band][gruppe] — Entwurf B nennt nur Spannen (tageloehner 0,2–0,4 · handwerk 0,4–0,6 · lebensmittel ~0,1 · handel
// 0,02–0,08); die Zahlen hier sind SPIKE-ANNAHMEN in diesen Spannen, Dorf mit Ackerbürgern
const GEWERBE_ANTEIL = {
    dorf: { handel: 0.03, lebensmittel: 0.05, handwerk: 0.12, acker: 0.5, unter: 0.3 },
    stadt: { handel: 0.05, lebensmittel: 0.1, handwerk: 0.45, acker: 0.1, unter: 0.3 },
};
const GRUPPE_GEWERBE = { handel: ["kaufmann", "kraemer"], lebensmittel: ["baecker", "brauer", "wirt"], handwerk: ["schmied", "weber", "gerber"], acker: ["ackerbuerger"], unter: ["tageloehner"] };
// die Rolle des Loses heute → sein Gewerbe (die LAGE der Grammatik: platz · seite · kirche) — SPIKE-ABBILDUNG
const ROLLE_GEWERBE = { gasthaus: "wirt", schmiede: "schmied", kaufhaus: "kaufmann", kontor: "kaufmann", backhaus: "baecker", werkstatt: "weber", gerberei: "gerber", patrizierhaus: "kaufmann", wohnturm: "kaufmann", pfarrhaus: "geistlich" };
// Rollen ohne Haushalt: bleiben benannte Maß-Zeilen (entscheid §2 „Was ausdrücklich BLEIBT“, Punkt 11)
const SONDERBAU = new Set(["kirche", "burg", "scheune", "halle", "turm", "rathaus", "kapelle", "bergfried", "torhaus", "zeughaus", "speicher", "zunfthaus"]);

// ── §1.2 Funktionen ───────────────────────────────────────────────────────────────────────────
const nachJahr = (tab, y) => { for (const [bis, v] of tab) if (y < bis) return v; return tab[tab.length - 1][1]; };
const kreuzholz = (d) => ({ b: d / Math.sqrt(3), h: d * Math.sqrt(2 / 3) });
const vierkant = (d) => d / Math.SQRT2;
function balkenSpann(b, h, holz, e, g, q) {
    const G = BAU_GESETZ, H = HOLZ[holz], I = (b * h * h * h) / 12, W = (b * h * h) / 6, EI = H.E * I;
    const wInst = (g + q) * 1e3 * e, wFin = (g * (1 + G.kdef) + q * (1 + G.psi2 * G.kdef)) * 1e3 * e, wD = (G.gammaG * g + G.gammaQ * q) * 1e3 * e;
    const lInst = Math.cbrt((384 * EI) / (5 * G.wInst * wInst)), lFin = Math.cbrt((384 * EI) / (5 * G.wFin * wFin));
    const fmd = (G.kmod * H.fmk) / G.gammaM, lBieg = Math.sqrt((8 * fmd * W) / wD);
    return { L: Math.min(lInst, lFin, lBieg), lInst, lFin, lBieg };
}
const schiffe = (D, Lmax) => { const n = Math.max(1, Math.ceil(D / Lmax - 1e-9)); return { n, spann: D / n }; };
const geschossH = (baujahr, h) => nachJahr(BAU_GESETZ.licht, baujahr) + h + BAU_GESETZ.diele;
const mu1 = (a) => (a <= 30 ? 0.8 : a >= 60 ? 0 : (0.8 * (60 - a)) / 30);
const schneeLast = (sk, alpha) => mu1(alpha) * sk;
function deckungVon(stil, region, pitchKultur) {
    const sued = region === "mediterran" || region === "antik" || region === "fernost";
    let d = stil === "huette" ? "schindel" : stil === "stroh" ? "reet" : stil === "klinker" ? "hohlpfanne" : stil === "stein" ? (sued ? "moench" : "biber") : stil === "modern" || stil === "glas" ? "flach" : "biber";
    if (stil === "stein" && pitchKultur < BAU_GESETZ.deckung[d][0]) d = "lehmflach";
    return d;
}
const neigung = (deckung, pitchKultur) => Math.max(BAU_GESETZ.deckung[deckung][0], pitchKultur);
const mauerRadius = (E, band) => Math.sqrt(((E / BAU_GESETZ.dichte[band]) * 1e4) / Math.PI);
const losVon = (klasse) => ({ b: BAU_GESETZ.hofstaette[0] / [3, 2, 1][klasse], t: BAU_GESETZ.hofstaette[1] });
const holzDesOrts = (ort) => ort.holz;
function tragwerk(ort, e) {
    const holz = holzDesOrts(ort), d = ort.d, kh = kreuzholz(d), sp = balkenSpann(kh.b, kh.h, holz, e, BAU_GESETZ.gDecke, BAU_GESETZ.qWohnen);
    return { holz, d, b: kh.b, h: kh.h, a: vierkant(d), Lmax: sp.L, lInst: sp.lInst, lFin: sp.lFin, lBieg: sp.lBieg, e };
}
function haushalt(gewerbe, klasse) {
    const G = GEWERBE[gewerbe], kern = 2 + BAU_GESETZ.kinder[klasse];
    return { gewerbe, klasse, wohl: BAU_GESETZ.wohl[klasse], kern, gesinde: G.gesinde, koepfe: kern + G.gesinde };
}
// raumProgramm → [[id, m² netto, geschoss]]
function raumProgramm(H, baujahr) {
    const G = BAU_GESETZ, R = [], k = H.klasse, w = H.wohl;
    const einraum = baujahr < G.stubeAb || (k === 0 && baujahr < G.kuecheAb);
    if (einraum) R.push(["herdraum", G.herdraum[0] + G.herdraum[1] * H.kern, "eg"]);
    else { R.push(["kueche", G.kueche[k === 2 ? 1 : 0], "eg"]); R.push(["stube", G.stube[0] + G.stube[1] * H.kern * Math.min(1.5, w), "eg"]); }
    const nK = SCHLIESSUNG.kammern(H.koepfe, k);
    R.push(["kammern", G.schlafM2 * (1 + w) * H.koepfe + G.kammerM2 * nK, "og", nK]);
    for (const r of GEWERBE[H.gewerbe].raeume) R.push(r.slice());
    return R;
}
// form: Los gibt W, Programm gibt Fläche → st, D (Schließung S4)
function form(R, los, dZiel) {
    let eg = 0, og = 0;
    for (const [, m2, g] of R) { if (g === "eg") eg += m2; else if (g === "og") og += m2; }
    const W = los.b, fuss = (s) => (s === 1 ? (eg + og) / NUTZ : Math.max(eg, og / (s - 1)) / NUTZ);
    // das kleinste st, dessen Tiefe ≤ dZiel; trägt keines (das EG allein ist zu tief), das kleinste st, ab dem mehr Geschosse nichts
    // mehr sparen — dann ist die Tiefe größer als dZiel und das Programm passt NICHT in die Breite seines Loses (`ueberZiel`)
    let s = 0; for (let k = 1; k <= 12; k++) if (fuss(k) / W <= dZiel + 1e-9) { s = k; break; }
    let ueberZiel = false;
    if (!s) { ueberZiel = true; s = 1; while (s < 12 && fuss(s + 1) < fuss(s) - 1e-9) s++; }
    const D = Math.max(SCHLIESSUNG.dMin, Math.round((fuss(s) / W) * 2) / 2);
    return { W, D, st: s, eg, og, netto: eg + og, brutto: fuss(s) * s, dRoh: fuss(s) / W, ueberZiel, groesserAlsLos: D > los.t };
}
// das ganze Haus einer Adresse
function hausVonAdresse(A, ort, opt) {
    const o = Object.assign({ e: SCHLIESSUNG.eBalken, dZiel: SCHLIESSUNG.dZiel }, opt || {});
    const H = haushalt(A.gewerbe, A.klasse), R = raumProgramm(H, A.baujahr), los = losVon(A.klasse), F = form(R, los, o.dZiel);
    const T = tragwerk(ort, o.e), S = schiffe(F.D, T.Lmax), gH = geschossH(A.baujahr, T.h);
    const traufe = BAU_GESETZ.sockel + F.st * gH, deck = deckungVon(A.stil, A.region, A.pitchKultur), nei = neigung(deck, A.pitchKultur);
    const first = traufe + (F.D / 2) * Math.tan((nei * Math.PI) / 180);
    const fensterM2 = nachJahr(BAU_GESETZ.lichtAnteil, A.baujahr) * F.netto, fassade = 2 * (F.W + F.D) * (traufe - BAU_GESETZ.sockel);
    return { H, R, los, F, T, S, gH, traufe, first, deckung: deck, neigung: nei, fensterAnteil: fensterM2 / fassade, fensterM2 };
}
module.exports = { BAU_GESETZ, HOLZ, SCHLIESSUNG, GEWERBE, GEWERBE_ANTEIL, GRUPPE_GEWERBE, ROLLE_GEWERBE, SONDERBAU, nachJahr, kreuzholz, vierkant, balkenSpann, schiffe, geschossH, schneeLast, deckungVon, neigung, mauerRadius, losVon, tragwerk, haushalt, raumProgramm, form, hausVonAdresse };
