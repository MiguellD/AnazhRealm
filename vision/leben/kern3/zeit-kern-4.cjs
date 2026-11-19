// ZEIT-KERN, dritter Gang des Kern-Spikes (19.11., Scratch, nur node): das GESETZ DER ZEIT UND DER JAGD (gesetz-zeit-jagd.md)
// auf der Architektur des ersten Gangs (jaeger-kern.cjs): der Bestand als reine Funktion über ein Raster von Revieren.
// LAUF 4: zeit-kern-3 + SATZ 7 (der Raum). Geschnitten ist NUR der Raum des Wolfs — Bedarf (7a), Abwanderung nach Alter (7b),
// Gründung auf offenem Land · leere Stelle · Bleiben (7c). Die Sätze 3 und 4, die Beute-Seite und die Uhr stehen wie in kern-3.
//
//   anfang(opt)                  → zustand     opt: { W, H, saat, wolf?, nutz? }   (LAUF 4: Satz 7)
//   schritt(zustand, saat, takt) → zustand     EIN Takt; liest nur (zustand, saat, takt); verbraucht den Zustand
//   klon(zustand)                → zustand
//
// DAS GESETZ (sechs Sätze, gesetz-zeit-jagd.md) — wie es hier steht:
//   1. EINE Uhr. Jede Rate steht unten je JAHR (oder je Leben, je Tag) mit Quelle und geht über ZEIT.taktJeJahr in Takte.
//      Die Zeiten des Leibs (Leben, Reife, Wachstum) liest der Kern aus leben-core (∝ M^0,20 / M^0,25, wie heute).
//   2. Je KOPF: Geburt je reifer Kuh (Bernoulli je Kuh je Takt), Tod je Kopf, Bedarf und Fraß je kg^¾. Kein Deckel je Revier.
//   3. (zweite Fassung) Der Riss antwortet auf das VERHÄLTNIS: Riss des Rudels je Takt = Sattheit × V ÷ (V + V½), V = Beute-Köpfe
//      im Rudel-Revier je Wolf. Der Raum bleibt das ganze Rudel-Revier; WELCHER Kopf fällt, zieht die Verwundbarkeit (Alter).
//   4. (zweite Fassung) Der Wolf antwortet auf seine Deckung D = Riss ÷ Erhaltung des letzten Jahres als GRADIENT: Wurf und
//      Überleben stetig in D nach der Anker-Tafel (ANKER), keine Schwelle, keine Fasten-Tage.
//   5. Wolf ÷ Beute ist Probe: kein Verhältnis, keine Pyramide, keine Energie-Bemessung steht im Kern.
//   6. Der Leib (Sekunden) kommt hier nicht vor: der Kern rechnet nur den Bestand.
//   7. Der Raum antwortet auf die Beute. (a) Ein Rudel VERTEIDIGT nur seinen Bedarf: die Reviere, deren Beute seinen Köpfen
//      V_halt = 258 WÄ je Wolf trägt; der Rest seines Reviers ist offenes Land; der Deckel 744 begrenzt nur, was es begehen KANN.
//      (b) Wer wandert, entscheidet das ALTER (2–4 Jahre), nie „voll“, nie „hungert“. (c) Der Wanderer gründet, wo offenes Land
//      einem Paar V_halt trägt (der Halter gibt es ab), sonst füllt er die leere Stelle eines Rudels ohne Paar, sonst bleibt er
//      als Kopf im Geburts-Rudel und sucht im nächsten Takt wieder. Einen Tod auf der Wanderung gibt es nicht.
"use strict";
const path = require("path");
const BAUM = process.env.LEBEN_BAUM || "C:/Users/micha/AnazhRealm-leben";
const L = require(path.join(BAUM, "leben-core.js"));
const Tm = require(path.join(BAUM, "tetrapoda-core.js"));
const T = globalThis.__tetrapodaCore || Tm;

const B = T.BESTAND_GESETZ;
const LG = T.LEBENSRAUM_GESETZ;
const TG = T.VERHALTEN.temperament.gattung;
const WURF = T.VERHALTEN.herde.wurf; // die VERBANDS-Größe (Rudel 3–6, Kahlwild-Rudel 3–7): NUR noch der Anfangs-Bestand (Satz 7b)
const BEUTE_MASSE = T.VERHALTEN.jagd.beuteMasse;
const dietVon = (g) => {
    const d = T.GATTUNGEN[g];
    const x = d && (d.dials ? d.dials.diet : d.diet);
    if (!Number.isFinite(x)) throw new Error("zeit-kern: GATTUNGEN." + g + ".diet fehlt");
    return x;
};
const DIET = { deer: dietVon("deer"), wolf: dietVon("wolf") };
const M_ART = { deer: 94.24042032034154, wolf: 64.01114942302421 }; // die Masse des Gusses (bau/zj-kopf.json)
const M34_ART = { deer: Math.pow(M_ART.deer, 0.75), wolf: Math.pow(M_ART.wolf, 0.75) };
const G = L.gesetz();
const ACHSEN = G.achsen;
const LN_M = ACHSEN.findIndex((x) => x.name === "lnM");
const SEITE = B.revierM * Math.sqrt(Math.PI); // 200,3 m
const ZELLEN = 16;
const HA = (SEITE / 4) ** 2 / 1e4;

// ── DIE EINE UHR ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// refS (leben-core, 2 100 s) ≙ 8 Freiland-Jahre des 64-kg-Wolfs (Gesetz Satz 1) → 26,25 Takte je Jahr, 13,914 Tage je Takt.
const ZEIT = (() => {
    const jahreRef = 8; // Jahre je refS — Gesetz Satz 1 (gesetzt; Spanne der Quellen 4,5 a Yellowstone ↔ 26,6 a t_max)
    const taktJeJahr = G.refS / B.taktS / jahreRef;
    return Object.freeze({ jahreRef, taktJeJahr, tageJeTakt: 365.25 / taktJeJahr, jahrS: taktJeJahr * B.taktS });
})();
const TJ = ZEIT.taktJeJahr;
const TAGE = ZEIT.tageJeTakt;

// ── DIE BEUTE (Weißwedel-Äquivalent 94,2 kg) — jede Zahl je Jahr ───────────────────────────────────────────────────────────
const BEUTE = Object.freeze({
    // Kitze je reifer Kuh je Jahr [karg, gut] — Verme 1969, J. Wildl. Manage. 33:881 (Abstract); zwischen karg und gut führt
    // die Äsung des Reviers: gut × (1 − Last ÷ K) + karg × (Last ÷ K), über K karg
    kitzeAdult: [1.36, 1.8],
    kitzeJaehrling: [0.62, 1.63], // Kuh im ersten Jahr nach der Reife (die Alters-Klasse „Jährling“ der Quelle: EIN Jahr breit)
    // Überleben je Jahr OHNE Wolf am Stand Last = K: Kitz (erstes Lebensjahr) 0,59 — Rohm et al. 2007 via FEIS (Sekundär);
    // ab einem Jahr 0,76 — Am. Midl. Nat. 165:426 (2011) (Abstract; adulte Kuh, für den Bock mangels Quelle derselbe Wert).
    // Der Tod läuft über die Äsung: Hazard je Jahr = −ln(Überleben) × Last ÷ K (bei Last = K der Wert der Quelle, leer 0).
    ueberlebenKitz: 0.59,
    ueberlebenAdult: 0.76,
    // Abwanderung im Jährlings-Jahr (EIN Ereignis, wenn der Kopf ein Jahr alt wird): Bock 0,80 · Kuh 0,13 — Crab Orchard NWR
    // via FEIS Ref. [153] (Sekundär). Distanz < 10 km = 50 Revier-Seiten ≥ das ganze Raster: Ziel ist jedes Revier mit
    // Lebensraum, gezogen nach dem freien Platz unter K (K − Last); steht keines unter K, gleichverteilt.
    abwandernBock: 0.8,
    abwandernKuh: 0.13,
    weiblich: 0.5, // Geschlecht 1 : 1 (Auftrag)
    // Fraß je Jahr je (kg ÷ M_Art)^¾ in Feld-Einheiten: BESTAND_GESETZ.fress (T:2198, 0,016 je Takt je Kopf) × 26,25 = 0,42 —
    // Kern-Eichung der Welle w28 (Verbiss je Zelle), KEINE Feld-Quelle: das Feld trägt kein kg. Der Kopf ist jetzt kg^¾.
    frassJeJahr: T.bestandFrass(DIET.deer, B) * ZEIT.taktJeJahr,
});
// ── DER WOLF (64,0 kg) ───────────────────────────────────────────────────────────────────────────────────────────────────────
const WOLF = Object.freeze({
    erhaltung: 0.1925, // kg je Tag je kg^¾: 2,77 kg je Tag am 35-kg-Wolf (FMR) — Głowaciński & Profus 1997, Tab. 5–6 (Volltext)
    sattheit: 0.396, // kg RISS-BRUTTO je Tag je kg^¾ (Lauf 2): 5,7 kg je Tag am 35-kg-Wolf, Yellowstone Frühwinter — Stahler et al. 2006 (Zusammenfassung)
    // HYPOTHESE (Spanne 0,6–0,8): nutzbarer Anteil eines Risses. LAUF 3: nur noch BUCHUNG (gedeckt = nutz × Riss) — keine Rate
    // liest ihn mehr: die Deckung D des Gesetzes ist Riss-brutto ÷ Erhaltung (Sattheit ÷ Erhaltung = 2,057).
    nutz: 0.7,
});
// ── DIE ANTWORT DES RISSES (Satz 3, zweite Fassung) ──────────────────────────────────────────────────────────────────────────
// Riss je Wolf = Plateau × V ÷ (V + V½). V½ = 246 Weißwedel-Äquivalente je Wolf: Isle Royale, 94 Rudel-Winter, a = 4,19e−2,
// h = 0,58 → Halb-Sättigung 41 Elche je Wolf × 6 (Vucetich et al. 2002, Volltext). Hirsch = 1 WÄ je KOPF.
const ANTWORT = Object.freeze({ vHalb: 246 });
// ── DIE ANTWORT DES WOLFS (Satz 4, zweite Fassung): die Anker-Tafel, linear zwischen den Ankern, außerhalb gehalten ─────────
// D = Riss ÷ Erhaltung über das letzte Jahr. Fähen und Föten: Boertje 1992 Tab. 1 · Überleben 0,49 ↔ 0,66 ↔ 0,85 und 2 Rekruten
// je Rudel: Peterson & Page 1988 · Welpen-Überleben 0,75: Hayes 2000 · die Zuordnung der D-Werte: Gesetz (aus Satz 3).
const ANKER = Object.freeze({
    D: [0.6, 1.05, 1.5], // arm · Gleichgewicht · reich
    faehen: [0.66, 0.97, 0.96], // Anteil der Wurf-Tage (Rudel mit Paar), an denen ein Wurf fällt
    welpen: [4.6, 5.7, 6.9], // Welpen je Wurf (der Bruch-Teil fällt als Bernoulli: Erwartung exakt)
    welpeJaehrling: [0, 0.36, 0.75], // Anteil der Welpen, die ein Jahr alt werden
    ueberleben: [0.49, 0.66, 0.85], // Überleben je Jahr ab einem Jahr
});
const ANKER_ANTEIL = { faehen: true, welpeJaehrling: true, ueberleben: true };
function anker(f, D) {
    const [x, y] = [ANKER.D, ANKER[f]];
    let v;
    if (!(D > x[0])) v = y[0];
    else if (D >= x[2]) v = y[2];
    else {
        const i = D < x[1] ? 0 : 1;
        v = y[i] + ((y[i + 1] - y[i]) * (D - x[i])) / (x[i + 1] - x[i]);
    }
    return ANKER_ANTEIL[f] ? Math.min(1, Math.max(0, v)) : v;
}
for (const [f, D, soll] of [["ueberleben", 0.6, 0.49], ["ueberleben", 0.2, 0.49], ["ueberleben", 1.05, 0.66], ["ueberleben", 1.275, 0.755], ["ueberleben", 3, 0.85], ["welpeJaehrling", 0.825, 0.18], ["welpen", 0.825, 5.15], ["faehen", 1.5, 0.96]])
    if (Math.abs(anker(f, D) - soll) > 1e-12) throw new Error("zeit-kern: die Anker-Tafel trägt " + f + "(" + D + ") = " + anker(f, D) + " statt " + soll);
// Die Deckung des letzten Jahres: gleitend über die letzten FENSTER Takte des Rudels (26,25 Takte je Jahr, gerundet).
const FENSTER = Math.round(ZEIT.taktJeJahr);
// ── DIE JAGD: Verwundbarkeit nach Reife und Alter (zweiter Gang, jagd-kern.cjs:72–81) ───────────────────────────────────────
// LAUF 3: die Quote fällt als ZAHL JE TAKT (der Deckel „Σ Verwundbarkeit ÷ 16 Köpfe je Takt“ ist gelöscht). Es bleibt allein,
// WELCHER Kopf fällt: das Zieh-Gewicht je Kopf wie in Lauf 2 (unreif · Greis 16 gegen bestes Alter 1).
const JAGD = Object.freeze({
    jung: 16, // Mech 1966 (51 Risse, 0 im besten Alter → Quote verwundbar ÷ bestes Alter 16; die ANNAHME des zweiten Gangs)
    greis: 16,
    greisAb: 0.5, // Anteil der Lebensdauer: Mech 1966, gerissen ab 8 von ~16 Jahren
});
// ── DER RAUM (Satz 7): ein Rudel BEGEHT sein Rudel-Revier und VERTEIDIGT darin nur seinen Bedarf ─────────────────────────────
// Die Besitz-Karte des ersten Gangs bleibt: jedes Revier gehört höchstens EINEM Rudel-Revier; ein Rudel-Revier ist
// zusammenhängend (Kanten-Nachbarn), in der Breite gewachsen ab dem Gründungs-Ort; ein Rudel ohne Köpfe gibt frei. Jagd und V
// (Satz 3) lesen weiter das GANZE Rudel-Revier. NEU (Satz 7a): verteidigt ist nur der KERN — der kürzeste Anfang der Liste
// `reviere` (Reihenfolge = vom Gründungs-Ort her in der Breite), dessen Beute dem Rudel V_halt je Kopf trägt; der Rest der
// Liste ist OFFENES Land wie das freie. Offenes Land nimmt, wer es braucht: der Wanderer für ein Paar (7c), ein Rudel, dessen
// Revier seinen Bedarf nicht trägt; der Halter gibt es ab.
// Der Deckel ist der WEG und begrenzt nur noch, was ein Rudel begehen KANN: Tages-Strecke 22,1 (♀) / 27,6 (♂) km × Wiederkehr
// an denselben Ort alle 6 Tage (Jędrzejewski et al. 2001, CJZ 79:1993, Abstract).
const RAUM = (() => {
    const tagesKm = (22.1 + 27.6) / 2;
    const wiederkehrTage = 6;
    return Object.freeze({
        tagesKm,
        wiederkehrTage,
        deckel: Math.floor((tagesKm * 1000 * wiederkehrTage) / SEITE),
        vHalt: 258, // WÄ je Wolf, die ein Rudel verteidigt: das Null-Wachstum von Isle Royale, 43 Elche je Wolf × 6 (Satz 7a)
        paar: 2, // ein Paar gründet (Satz 7c: 2 × V_halt) und ein Rudel braucht zwei Reife für den Wurf (kern-3, Schritt 4)
    });
})();
// ── DIE ABWANDERUNG NACH ALTER (Satz 7b): jeder Kopf trägt EIN Abwander-Alter, einmal aus der Saat gezogen ──────────────────
// 77 % gleichverteilt in 2–4 Jahren (Hayes & Harestad 2000); EIGENE SETZUNG des Auftrags: die übrigen 23 % symmetrisch, je
// 11,5 % gleichverteilt in 1,5–2 und in 4–4,5 Jahren (Mittel der Ziehung 3,0 gegen gelesene 2,9). Jahre der EINEN Uhr.
const ABWANDERN = Object.freeze({ anteil: 0.77, fenster: [2, 4], frueh: [1.5, 2], spaet: [4, 4.5] });
function abwanderAlter(rng) {
    const [u, v] = [rng(), rng()];
    const [a, b] = u < ABWANDERN.anteil ? ABWANDERN.fenster : u < ABWANDERN.anteil + (1 - ABWANDERN.anteil) / 2 ? ABWANDERN.frueh : ABWANDERN.spaet;
    return (a + v * (b - a)) * ZEIT.jahrS;
}

// das Leben-Overlay des Felds (stamm/feld-leben.js:3119–3126) — bleibt, wie der erste Gang es rechnet (Halbwert 8,66 Takte)
const FELD = Object.freeze({ decayPerSec: 0.008, kahl: -1, max: 0.7, epsilon: 0.004 });
const FELD_WURF = Object.freeze({ saat: 1, rehZelle: 9 / 16, sMin: 0.2, sMax: 0.42 }); // das Feld des Spikes (erster Gang)
const LR_REH = T.lebensraum("deer", "wiese", LG);
const aesVon = (s, o) => Math.min(1, Math.max(0, s + o));
const kZelle = (aes) => LR_REH * HA * T.bestandNahrung(DIET.deer, aes, 0);

// das Wachstum von leben-core, inline (EIN exp je Kopf je Takt statt pow) — beim Laden gegen masseZurZeit geprüft
const QW = Math.pow(G.geburtAnteil, G.wachsExp);
const REIFE_MASS = Math.log((1 - QW) / (1 - Math.pow(G.reifeMasse, G.wachsExp)));
function wachse(t) {
    const w = 1 - (1 - QW) * Math.exp(-t.alterS / t.tau);
    const w3 = w * w * w;
    t.ww = w;
    t.kg = t.M * w3 * w;
    t.k34 = t.M34 * w3;
}
for (const M of [40, 64, 94.24, 130])
    for (const a of [0, 10, 100, 463, 2000]) {
        const t = { M, M34: Math.pow(M, 0.75), tau: L.reifeS(M) / REIFE_MASS, alterS: a };
        wachse(t);
        if (Math.abs(t.kg - L.masseZurZeit(M, a)) > 1e-9 * M || Math.abs(t.k34 - Math.pow(t.kg, 0.75)) > 1e-9 * M)
            throw new Error("zeit-kern: das Wachstum ist nicht mehr masseZurZeit von leben-core");
    }
if (Math.abs(L.eignung(ACHSEN.map(() => 0)) - 1) > 1e-12) throw new Error("zeit-kern: eignung(0) ist nicht 1");

// ── DER STROM (erster Gang) ──────────────────────────────────────────────────────────────────────────────────────────────────
function mix(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}
function strom(saat, takt, art, i) {
    let s = mix((saat | 0) + 0x9e3779b9);
    s = mix(s ^ Math.imul(takt + 1, 0x9e3779b1));
    s = mix(s ^ Math.imul(art + 1, 0x85ebca77));
    s = mix(s ^ Math.imul(i + 1, 0xc2b2ae3d));
    return function () {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const normale = (rng) => ACHSEN.map(() => L.normal(rng(), rng()));
function zug(tiere, w, rng) {
    let summe = 0;
    for (let k = 0; k < tiere.length; k++) {
        const x = w(tiere[k]);
        if (x > 0) summe += x;
    }
    if (!(summe > 0)) return null;
    let r = rng() * summe;
    let letzt = null;
    for (let k = 0; k < tiere.length; k++) {
        const x = w(tiere[k]);
        if (!(x > 0)) continue;
        letzt = tiere[k];
        if ((r -= x) < 0) return letzt;
    }
    return letzt;
}
const mutterW = (t) => L.wurfGewicht(t.kg) * t.eig;
const wild = (g, kg) => T.temperamentDerGattung({ diet: DIET[g] }, kg, TG) === "wild";
// die Verwundbarkeit: eine Stufe im Alter — unreif · Greis · sonst 1 (keine Masse: der Riss zieht nicht an der Größen-Erbanlage)
const verwundbar = (t) => (!t.r ? JAGD.jung : t.alterS >= JAGD.greisAb * t.tod ? JAGD.greis : 1);

function tier(g, id, a, e, mutter, alterS, weiblich) {
    const M = L.masseAdult(M_ART[g], a, e);
    const P = Math.log(M / M_ART[g]);
    const t = {
        id,
        g,
        a,
        e,
        m: mutter,
        w: weiblich,
        M,
        M34: Math.pow(M, 0.75),
        Mw: Math.pow(M / M_ART[g], G.wurfExp), // das Wurf-Gewicht der Mutter relativ zur Art (leben-core wurfExp)
        tau: L.reifeS(M) / REIFE_MASS,
        tod: L.lebensdauerS(M),
        reif: L.reifeS(M),
        eig: L.eignung(ACHSEN.map((x, i) => (i === LN_M ? P : 0))),
        alterS,
        kg: 0,
        k34: 0,
        ww: 0,
        r: false,
        jl: false, // ein Jahr alt (Beute: nicht mehr Kitz)
        tot: null,
    };
    wachse(t);
    t.r = t.alterS >= t.reif;
    t.jl = t.alterS >= ZEIT.jahrS;
    return t;
}
// ein Tier des ANFANGS: Gründer-Erbe, erwachsen, das Alter gleichverteilt zwischen Reife und Lebensdauer
function gruenderTier(g, id, rng) {
    const t = tier(g, id, L.gruender(normale(rng)), L.umwelt(normale(rng)), null, 0, rng() < BEUTE.weiblich);
    t.alterS = t.reif + rng() * (t.tod - t.reif);
    wachse(t);
    t.r = true;
    t.jl = true;
    return t;
}

function nachbarn(W, H) {
    const n8 = [];
    const n4 = [];
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
            const a = [];
            const b = [];
            for (let dy = -1; dy <= 1; dy++)
                for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dy) continue;
                    const [xx, yy] = [x + dx, y + dy];
                    if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; // der Rand ist geschlossen
                    a.push(yy * W + xx);
                    if (!dx || !dy) b.push(yy * W + xx);
                }
            n8.push(a);
            n4.push(b);
        }
    return { n8, n4 };
}
const NACHBAR = new Map();
function nachbarVon(W, H) {
    const k = W + "x" + H;
    if (!NACHBAR.has(k)) NACHBAR.set(k, nachbarn(W, H));
    return NACHBAR.get(k);
}
const cheb = (W, a, b) => Math.max(Math.abs((a % W) - (b % W)), Math.abs(Math.floor(a / W) - Math.floor(b / W)));

// EIN FREIES RUDEL-REVIER ab dem freien Revier, das `von` am nächsten liegt: zusammenhängend (Kanten-Nachbarn), in der Breite
// gewachsen bis zum Deckel des Wegs (RAUM.deckel) — nie in das Revier eines Nachbarn.
function rudelRevier(z, von) {
    const n = z.W * z.H;
    const { n4 } = nachbarVon(z.W, z.H);
    let [start, d] = [-1, Infinity];
    for (let j = 0; j < n; j++)
        if (z.besitz[j] < 0) {
            const dj = cheb(z.W, j, von);
            if (dj < d) [start, d] = [j, dj];
        }
    if (start < 0) return null;
    const marke = new Uint8Array(n);
    const terr = [start];
    marke[start] = 1;
    for (let q = 0; q < terr.length; q++)
        for (const y of n4[terr[q]])
            if (terr.length < RAUM.deckel && z.besitz[y] < 0 && !marke[y]) {
                marke[y] = 1;
                terr.push(y);
            }
    return terr;
}
function rudelNeu(z, terr, ort, wurfAb) {
    // rest = das Riss-Konto (kg): der Rest-Übertrag von Takt zu Takt · fRiss/fErh = die letzten FENSTER Takte (Riss, Erhaltung) · deck = D
    // kern = die Zahl der verteidigten Reviere (der Anfang von `reviere`, Satz 7a) · traegt = das Rudel-Revier trägt den Bedarf
    // (die Buchung von z.frei führt der Rufer: das Land einer Gründung ist frei ODER offenes Land eines Halters)
    const R = { id: z.rudelZahl++, reviere: terr, ort, tiere: [], kg: 0, riss: 0, gedeckt: 0, satt: 0, erh: 0, rest: 0, v: 0, fRiss: [], fErh: [], deck: null, wurfAb, kern: terr.length, traegt: true };
    for (const x of terr) z.besitz[x] = R.id;
    z.rudel.push(R);
    return R;
}
// ── SATZ 7a: der Bedarf und der Kern ─────────────────────────────────────────────────────────────────────────────────────────
// Bedarf = V_halt × Köpfe (ALLE Köpfe des Rudels, wie V in Satz 3; Hirsch = 1 WÄ je Kopf), mindestens der eines Paars; ein
// Rudel ohne Köpfe verteidigt nichts. Kern = der kürzeste Anfang von `reviere`, dessen Beute den Bedarf trägt.
const bedarfVon = (R) => (R.tiere.length ? RAUM.vHalt * Math.max(R.tiere.length, RAUM.paar) : 0);
function kernVon(z, R) {
    const need = bedarfVon(R);
    R.traegt = true;
    if (!(need > 0)) return 0;
    const terr = R.reviere;
    let s = 0;
    for (let q = 0; q < terr.length; q++) {
        s += z.reh[terr[q]].length;
        if (s >= need) return q + 1;
    }
    R.traegt = false; // das ganze Rudel-Revier trägt den Bedarf nicht: alles ist Kern
    return terr.length;
}
// die Karte des offenen Lands (1 = frei oder Land eines Halters über dessen Bedarf); setzt R.kern je Rudel
function offenKarte(z, offen) {
    offen.fill(1);
    for (const R of z.rudel) {
        R.kern = kernVon(z, R);
        const terr = R.reviere;
        for (let q = 0; q < R.kern; q++) offen[terr[q]] = 0;
    }
}
// DIE ABGABE: die Halter `ids` haben offenes Land verloren (z.besitz trägt schon den neuen Halter). Ihr Rest wird neu in der
// Breite ab dem Gründungs-Ort gelesen; was nicht mehr zusammenhängt, wird frei. Der Kern liegt nie im abgegebenen Land.
function gibAb(z, ids, offen, marke) {
    const { n4 } = nachbarVon(z.W, z.H);
    for (const Q of z.rudel) {
        if (!ids.has(Q.id)) continue;
        const alt = Q.reviere;
        if (!Q.tiere.length) {
            // ein Rudel ohne Köpfe (es gibt am Takt-Ende alles frei) behält bis dahin, was ihm keiner nahm
            Q.reviere = alt.filter((x) => z.besitz[x] === Q.id);
            Q.kern = 0;
            continue;
        }
        if (z.besitz[alt[0]] !== Q.id) throw new Error("zeit-kern: der Gründungs-Ort des Rudels " + Q.id + " wurde abgegeben — der Kern ist nie offenes Land");
        const neu = [alt[0]];
        marke[alt[0]] = 1;
        for (let q = 0; q < neu.length; q++)
            for (const y of n4[neu[q]])
                if (z.besitz[y] === Q.id && !marke[y]) {
                    marke[y] = 1;
                    neu.push(y);
                }
        for (const x of alt) if (z.besitz[x] === Q.id && !marke[x]) (z.besitz[x] = -1), z.frei++, (offen[x] = 1);
        for (const x of neu) marke[x] = 0;
        Q.reviere = neu;
        Q.kern = kernVon(z, Q);
        for (let q = 0; q < neu.length; q++) offen[neu[q]] = q < Q.kern ? 0 : 1;
    }
}
// ── SATZ 7c: das Land einer Gründung ─────────────────────────────────────────────────────────────────────────────────────────
// die zusammenhängenden Stücke offenen Lands (Kanten-Nachbarn) und ihre Beute: komp[x] = Stück, Rückgabe = WÄ je Stück
function offeneStuecke(z, offen, komp, stapel) {
    const n = z.W * z.H;
    const { n4 } = nachbarVon(z.W, z.H);
    komp.fill(-1);
    const summe = [];
    for (let j = 0; j < n; j++) {
        if (!offen[j] || komp[j] >= 0) continue;
        const c = summe.length;
        let [s, top] = [0, 0];
        stapel[top++] = j;
        komp[j] = c;
        while (top) {
            const x = stapel[--top];
            s += z.reh[x].length;
            for (const y of n4[x])
                if (offen[y] && komp[y] < 0) {
                    komp[y] = c;
                    stapel[top++] = y;
                }
        }
        summe.push(s);
    }
    return summe;
}
// das Land für ein Paar: ab dem offenen Revier, das `von` am nächsten liegt UND in einem Stück liegt, das einem Paar V_halt
// trägt, in der Breite über offenes Land, bis die Beute 2 × V_halt trägt — höchstens der Deckel des Wegs
function paarLand(z, von, offen, komp, summe, marke) {
    const n = z.W * z.H;
    const { n4 } = nachbarVon(z.W, z.H);
    const need = RAUM.vHalt * RAUM.paar;
    let [start, d] = [-1, Infinity];
    for (let j = 0; j < n; j++)
        if (offen[j] && summe[komp[j]] >= need) {
            const dj = cheb(z.W, j, von);
            if (dj < d) [start, d] = [j, dj];
        }
    if (start < 0) return null;
    const terr = [start];
    marke[start] = 1;
    let s = z.reh[start].length;
    for (let q = 0; q < terr.length && s < need; q++)
        for (const y of n4[terr[q]])
            if (s < need && terr.length < RAUM.deckel && offen[y] && !marke[y]) {
                marke[y] = 1;
                terr.push(y);
                s += z.reh[y].length;
            }
    for (const x of terr) marke[x] = 0;
    return s >= need ? terr : null;
}
// ── SATZ 7a, die andere Hälfte: ein Rudel, dessen Rudel-Revier seinen Bedarf NICHT trägt, begeht das offene Land an seiner
// Grenze (frei oder Land eines Halters über dessen Bedarf — der Halter gibt es ab), in der Breite, bis der Bedarf getragen ist
// oder der Deckel des Wegs erreicht ist. Bestehende Rudel in der Reihenfolge von `dehne` (ältestes zuerst).
function bedarfsLand(z, offen, marke) {
    const { n4 } = nachbarVon(z.W, z.H);
    offenKarte(z, offen);
    for (const R of z.rudel) {
        const terr = R.reviere;
        if (R.traegt || terr.length >= RAUM.deckel) continue;
        const need = bedarfVon(R);
        let s = 0;
        for (let q = 0; q < terr.length; q++) s += z.reh[terr[q]].length;
        let ids = null;
        for (let q = 0; q < terr.length && s < need; q++)
            for (const y of n4[terr[q]])
                if (s < need && terr.length < RAUM.deckel && offen[y]) {
                    const b = z.besitz[y];
                    if (b >= 0) (ids || (ids = new Set())).add(b);
                    else z.frei--;
                    z.besitz[y] = R.id;
                    offen[y] = 0;
                    terr.push(y);
                    s += z.reh[y].length;
                }
        R.kern = terr.length;
        R.traegt = s >= need;
        if (ids) gibAb(z, ids, offen, marke);
    }
}
// ein Rudel unter dem Deckel begeht das freie Land an seiner Grenze (bestehende Rudel zuerst, ältestes zuerst)
function dehne(z) {
    const { n4 } = nachbarVon(z.W, z.H);
    for (const R of z.rudel) {
        if (z.frei <= 0) return;
        const terr = R.reviere;
        for (let q = 0; q < terr.length && terr.length < RAUM.deckel; q++)
            for (const y of n4[terr[q]])
                if (terr.length < RAUM.deckel && z.besitz[y] < 0) {
                    z.besitz[y] = R.id;
                    z.frei--;
                    terr.push(y);
                }
    }
}

function anfang(opt) {
    const { W, H, saat } = opt;
    const n = W * H;
    const z = {
        W,
        H,
        takt: 0,
        param: {
            wolf: opt.wolf !== false,
            nutz: opt.nutz == null ? WOLF.nutz : opt.nutz,
        },
        feldC: new Uint8Array(n),
        feldS: new Float64Array(n * ZELLEN),
        feldO: new Float64Array(n * ZELLEN),
        K: new Float64Array(n),
        last: new Float64Array(n),
        reh: [],
        besitz: new Int32Array(n).fill(-1),
        frei: n,
        rudel: [],
        rudelZahl: 0,
        ereignis: null,
    };
    // das Feld ist die WELT: dieselbe für jede Saat
    const fr = strom(FELD_WURF.saat, 0, 9, W * 1000 + H);
    for (let i = 0; i < n; i++) {
        let c = 0;
        for (let k = 0; k < ZELLEN; k++) {
            const [u, s] = [fr(), fr()];
            if (u < FELD_WURF.rehZelle) z.feldS[i * ZELLEN + c++] = FELD_WURF.sMin + s * (FELD_WURF.sMax - FELD_WURF.sMin);
        }
        z.feldC[i] = c;
        let summe = 0;
        for (let k = 0; k < c; k++) summe += kZelle(aesVon(z.feldS[i * ZELLEN + k], 0));
        z.K[i] = B.kopfJeHa * summe;
    }
    for (let i = 0; i < n; i++) {
        const rng = strom(saat, -1, 0, i);
        const list = [];
        const kopf = z.feldC[i] ? WURF.deer[0] + Math.floor(rng() * (WURF.deer[1] - WURF.deer[0] + 1)) : 0;
        for (let j = 0; j < kopf; j++) list.push(gruenderTier("deer", L.indId(String(i), 0, j), rng));
        z.reh.push(list);
    }
    if (z.param.wolf) {
        const rng = strom(saat, -1, 1, 0);
        const reihe = Array.from({ length: n }, (_, i) => i);
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [reihe[i], reihe[j]] = [reihe[j], reihe[i]];
        }
        for (const von of reihe) {
            if (z.besitz[von] >= 0) continue;
            const terr = rudelRevier(z, von);
            if (!terr) break;
            const R = rudelNeu(z, terr, terr[0], rng() * TJ); // der Wurf-Tag des Rudels: gleichverteilt im ersten Jahr
            z.frei -= terr.length;
            const kopf = WURF.wolf[0] + Math.floor(rng() * (WURF.wolf[1] - WURF.wolf[0] + 1));
            for (let j = 0; j < kopf; j++) R.tiere.push(gruenderTier("wolf", L.indId("r" + R.id, 0, j), rng));
        }
        // Satz 7b: auch die Köpfe des Anfangs tragen ein Abwander-Alter (eigener Strom 5: der Anfangs-Bestand bleibt der von kern-3)
        for (const R of z.rudel) {
            const ar = strom(saat, -1, 5, R.id);
            for (const t of R.tiere) t.ab = abwanderAlter(ar);
            R.kern = kernVon(z, R);
        }
    }
    return z;
}

function neuEreignis() {
    return {
        geburt: [], // die Geborenen dieses Takts (Tier-Datensätze)
        tod: [], // { t, ursache, wo }
        zug: [], // { t, von, nach, art } — art: "reh" · "beitritt" · "gruendung"
        sucher: 0, // Wölfe, die in diesem Takt suchten (Abwander-Alter erreicht, nicht im Paar) — Satz 7b
        wartend: 0, // davon: nichts gefunden, bleiben als Kopf im Geburts-Rudel — Satz 7c
        reifReh: 0, // Beute-Köpfe, die in diesem Takt reif wurden
        jaehrling: 0, // Beute-Köpfe, die in diesem Takt ein Jahr alt wurden
        reifWolf: 0,
        vaterlos: 0, // Geburten ohne reifen Bock in Revier und Nachbarschaft — keine Geburt
        ohnePaar: 0, // Wurf-Tage eines Rudels ohne zwei Reife
        wurfTag: 0, // Wurf-Tage der Rudel (einer je Rudel je Jahr)
        wurfWolf: 0, // davon mit Wurf
        ohneWurf: 0, // davon mit Paar, aber ohne Wurf (Anteil „Fähen mit Wurf“ der Anker-Tafel an D)
        einwanderung: 0, // Köpfe ohne Eltern nach dem Anfang — per Konstruktion nie erhöht
        jagdTakte: 0, // Rudel-Takte mit jagendem Verband
        erschoepft: 0, // davon: kein greifbarer Kopf mehr im Rudel-Revier, das Riss-Konto blieb offen
        sollKg: 0, // Σ Sattheit × V ÷ (V + V½) der jagenden Rudel (kg je Takt): der Riss, den das Gesetz verlangt
        vSumme: 0, // Σ V (Beute-Köpfe im Rudel-Revier je Wolf) über die jagenden Rudel
        sattKg: 0, // Σ Sattheit aller Rudel (kg je Takt, Riss-brutto — Lauf 2)
        erhKg: 0, // Σ Erhaltung aller Rudel (kg je Takt, verzehrt)
        gedecktKg: 0, // Σ nutz × Riss
        rissKg: 0, // Σ Riss (Lebendmasse)
    };
}
function stirbAn(ev, list, k, ursache, wo) {
    const t = list[k];
    list.splice(k, 1);
    t.tot = ursache;
    ev.tod.push({ t, ursache, wo });
}

const PUFFER = new Map();
function puffer(n) {
    if (!PUFFER.has(n)) PUFFER.set(n, { cum: new Float64Array(n), vw: new Float64Array(n), je: new Float64Array(ZELLEN), offen: new Uint8Array(n), marke: new Uint8Array(n), komp: new Int32Array(n), stapel: new Int32Array(n) });
    return PUFFER.get(n);
}
const LN_KITZ = Math.log(BEUTE.ueberlebenKitz);
const LN_ADULT = Math.log(BEUTE.ueberlebenAdult);
const FRASS_TAKT = BEUTE.frassJeJahr / TJ;

function schritt(z, saat, takt) {
    if (takt !== z.takt) throw new Error("zeit-kern: schritt(takt " + takt + ") am Zustand des Takts " + z.takt);
    const P = z.param;
    const n = z.W * z.H;
    const { n8 } = nachbarVon(z.W, z.H);
    const ev = (z.ereignis = neuEreignis());
    const tS = (takt + 1) * B.taktS;
    const { cum, vw, je, offen, marke, komp, stapel } = puffer(n);
    const last = z.last;

    // 0 — das Alter, der Leib, die Reife, das erste Jahr; die Last des Reviers = Σ (kg ÷ M_Art)^¾
    const jaehr = [];
    for (let i = 0; i < n; i++) {
        const list = z.reh[i];
        let s = 0;
        for (let k = 0; k < list.length; k++) {
            const t = list[k];
            t.alterS += B.taktS;
            wachse(t);
            if (!t.r && t.alterS >= t.reif) (t.r = true), ev.reifReh++;
            if (!t.jl && t.alterS >= ZEIT.jahrS) (t.jl = true), ev.jaehrling++, jaehr.push(t, i);
            s += t.k34;
        }
        last[i] = s / M34_ART.deer;
    }
    for (const R of z.rudel)
        for (const t of R.tiere) {
            t.alterS += B.taktS;
            wachse(t);
            if (!t.r && t.alterS >= t.reif) (t.r = true), ev.reifWolf++; // die Reife löst keine Abwanderung mehr aus (Satz 7b)
        }

    // 1 — das Feld: das Overlay zerfällt, K liest die Äsung, die Herde äst je kg^¾; der freie Platz unter K (für die Wanderung)
    const zerfall = Math.exp(-FELD.decayPerSec * B.taktS);
    const K = z.K;
    let platz = 0;
    for (let i = 0; i < n; i++) {
        const C = z.feldC[i];
        const b = i * ZELLEN;
        let [summe, jeSumme] = [0, 0];
        for (let c = 0; c < C; c++) {
            let o = z.feldO[b + c] * zerfall;
            if (Math.abs(o) < FELD.epsilon) o = 0;
            z.feldO[b + c] = o;
            const aes = aesVon(z.feldS[b + c], o);
            summe += kZelle(aes);
            jeSumme += je[c] = LR_REH * aes;
        }
        K[i] = B.kopfJeHa * summe;
        const F = last[i] * FRASS_TAKT;
        if (F > 0 && jeSumme > 0)
            for (let c = 0; c < C; c++)
                if (je[c] > 0) z.feldO[b + c] = Math.max(FELD.kahl, Math.min(FELD.max, z.feldO[b + c] - (F * je[c]) / jeSumme));
        if (C && K[i] > last[i]) platz += K[i] - last[i];
        cum[i] = platz;
    }

    // 2 — die Jagd (Satz 3, zweite Fassung): das Rudel begeht sein GANZES Rudel-Revier; der Riss des Takts ist eine MASSE:
    //     Sattheit (Wölfe × Plateau, kg Riss-brutto) × V ÷ (V + V½), V = Beute-Köpfe im Rudel-Revier je Wolf des Rudels.
    //     Die Masse fällt in Köpfe über das Riss-Konto des Rudels (Rest-Übertrag, kein Runden-Gewinn): ein Kopf fällt, solange
    //     das Konto über 0 steht, und zieht sein Gewicht ab. Jeder Riss fällt in ein Revier nach dessen verwundbarem Bestand.
    for (const R of z.rudel) {
        let [jaeger, verband, s34, kg] = [0, 0, 0, 0];
        for (const t of R.tiere) {
            kg += t.kg;
            s34 += t.k34;
            if (wild("wolf", t.kg)) jaeger++, (verband += t.kg);
        }
        R.kg = kg;
        R.riss = 0;
        R.gedeckt = 0;
        R.satt = WOLF.sattheit * s34 * TAGE;
        R.erh = WOLF.erhaltung * s34 * TAGE;
        ev.sattKg += R.satt;
        ev.erhKg += R.erh;
        if (!jaeger) continue;
        ev.jagdTakte++;
        const lim = BEUTE_MASSE * verband; // Beute ist, wer höchstens beuteMasse × die Masse des jagenden Verbands wiegt
        const terr = R.reviere;
        let [tot, koepfe] = [0, 0];
        for (let k = 0; k < terr.length; k++) {
            const list = z.reh[terr[k]];
            let s = 0;
            for (let q = 0; q < list.length; q++) if (list[q].kg <= lim) s += verwundbar(list[q]);
            vw[k] = s;
            tot += s;
            koepfe += list.length;
        }
        const rng = strom(saat, takt, 4, R.id);
        const V = koepfe / R.tiere.length; // Weißwedel-Äquivalente je Wolf: 1 WÄ je Beute-KOPF, je Kopf des Rudels
        const soll = (R.satt * V) / (V + ANTWORT.vHalb);
        R.v = V;
        R.rest += soll;
        ev.sollKg += soll;
        ev.vSumme += V;
        const wahl = (t) => (t.kg <= lim ? verwundbar(t) : 0);
        while (R.rest > 0) {
            let r = rng() * tot;
            let k = -1;
            for (let q = 0; q < terr.length; q++) {
                if (!(vw[q] > 0)) continue;
                k = q;
                if ((r -= vw[q]) < 0) break;
            }
            if (k < 0) {
                ev.erschoepft++;
                break;
            }
            const list = z.reh[terr[k]];
            const o = zug(list, wahl, rng);
            if (!o) {
                tot -= vw[k];
                vw[k] = 0;
                continue;
            }
            const w = verwundbar(o);
            vw[k] = Math.max(0, vw[k] - w);
            tot = Math.max(0, tot - w);
            R.riss += o.kg;
            R.rest -= o.kg;
            R.gedeckt += P.nutz * o.kg;
            R.ort = terr[k];
            stirbAn(ev, list, list.indexOf(o), "jagd", terr[k]);
        }
        ev.rissKg += R.riss;
        ev.gedecktKg += R.gedeckt;
    }

    // 3 — die Beute je Kopf: Hunger (Hazard ∝ Last ÷ K), Alter, Geburt je reifer Kuh
    for (let i = 0; i < n; i++) {
        const list = z.reh[i];
        if (!list.length) continue;
        const rng = strom(saat, takt, 0, i);
        const x = K[i] > 0 ? last[i] / K[i] : Infinity;
        const pK = 1 - Math.exp((LN_KITZ * x) / TJ);
        const pA = 1 - Math.exp((LN_ADULT * x) / TJ);
        const g = x < 1 ? 1 - x : 0;
        const rA = (BEUTE.kitzeAdult[0] + (BEUTE.kitzeAdult[1] - BEUTE.kitzeAdult[0]) * g) / TJ;
        const rJ = (BEUTE.kitzeJaehrling[0] + (BEUTE.kitzeJaehrling[1] - BEUTE.kitzeJaehrling[0]) * g) / TJ;
        let muetter = null;
        for (let k = list.length - 1; k >= 0; k--) {
            const t = list[k];
            if (rng() < (t.jl ? pA : pK)) {
                stirbAn(ev, list, k, "hunger", i);
                continue;
            }
            if (t.alterS > t.tod) {
                stirbAn(ev, list, k, "alter", i);
                continue;
            }
            if (t.r && t.w) {
                // die Rate der Quelle × das Erbe-Gewicht der Mutter (leben-core: Wurf-Gewicht kg^−0,25 relativ zur Art × Eignung)
                const p = ((t.alterS < t.reif + ZEIT.jahrS ? rJ : rA) * t.eig * t.Mw) / t.ww;
                if (rng() < p) (muetter || (muetter = [])).push(t);
            }
        }
        if (muetter) {
            const vaterW = (t) => (t.r && !t.w ? t.eig : 0);
            let j = 0;
            for (const mu of muetter) {
                let va = zug(list, vaterW, rng);
                if (!va) {
                    // der Vater aus der Nachbarschaft (ein reifer Bock der acht Nachbar-Reviere), nie ein Gründer-Zug
                    const kand = [];
                    for (const y of n8[i]) for (const t of z.reh[y]) if (t.r && !t.w) kand.push(t);
                    va = zug(kand, (t) => t.eig, rng);
                }
                if (!va) {
                    ev.vaterlos++;
                    continue;
                }
                const a = L.kind(mu.a, va.a, normale(rng), normale(rng), normale(rng));
                const t = tier("deer", L.indId(String(i), tS, j++), a, L.umwelt(normale(rng)), mu.id, 0, rng() < BEUTE.weiblich);
                list.push(t);
                ev.geburt.push(t);
            }
        }
    }

    // 4 — das Rudel (Satz 4, zweite Fassung): die Deckung D = Riss ÷ Erhaltung über das letzte Jahr (gleitend, FENSTER Takte);
    //     Überleben je Kopf stetig in D (Welpe im ersten Jahr · ab einem Jahr), das Jahres-Überleben als Wurzel je Takt;
    //     das Alter am Lebens-Ende (bleibt); der EINE Wurf je Jahr: Anteil der Würfe und Welpen je Wurf stetig in D
    for (const R of z.rudel) {
        const rng = strom(saat, takt, 1, R.id);
        R.fRiss.push(R.riss);
        R.fErh.push(R.erh);
        if (R.fRiss.length > FENSTER) R.fRiss.shift(), R.fErh.shift();
        let [sRiss, sErh] = [0, 0];
        for (let k = 0; k < R.fRiss.length; k++) (sRiss += R.fRiss[k]), (sErh += R.fErh[k]);
        const D = sErh > 0 ? sRiss / sErh : 0;
        R.deck = D;
        const pWelpe = 1 - Math.pow(anker("welpeJaehrling", D), 1 / TJ);
        const pAb1 = 1 - Math.pow(anker("ueberleben", D), 1 / TJ);
        for (let k = R.tiere.length - 1; k >= 0; k--) {
            const t = R.tiere[k];
            const welpe = t.alterS < ZEIT.jahrS;
            if (rng() < (welpe ? pWelpe : pAb1)) stirbAn(ev, R.tiere, k, welpe ? "welpe" : "deckung", R.ort);
            else if (t.alterS > t.tod) stirbAn(ev, R.tiere, k, "alter", R.ort);
        }
        if (takt >= R.wurfAb) {
            R.wurfAb += TJ;
            ev.wurfTag++;
            const reife = R.tiere.filter((t) => t.r);
            if (reife.length < 2) ev.ohnePaar++;
            else if (!(rng() < anker("faehen", D))) ev.ohneWurf++;
            else {
                ev.wurfWolf++;
                const w = anker("welpen", D);
                let welpen = Math.floor(w);
                if (rng() < w - welpen) welpen++;
                const ar = strom(saat, takt, 5, R.id); // Satz 7b: das Abwander-Alter je Welpe, einmal aus der Saat (eigener Strom)
                for (let k = 0; k < welpen; k++) {
                    const mu = zug(reife, mutterW, rng);
                    const va = zug(reife, (t) => (t === mu ? 0 : t.eig), rng);
                    const a = L.kind(mu.a, va.a, normale(rng), normale(rng), normale(rng));
                    const t = tier("wolf", L.indId("r" + R.id, tS, k), a, L.umwelt(normale(rng)), mu.id, 0, rng() < BEUTE.weiblich);
                    t.ab = abwanderAlter(ar);
                    R.tiere.push(t);
                    ev.geburt.push(t);
                }
            }
        }
    }

    // 5 — die Abwanderung der Beute im Jährlings-Jahr: Bock 0,80 · Kuh 0,13; Ziel nach dem freien Platz unter K
    if (jaehr.length) {
        const rng = strom(saat, takt, 2, 0);
        let habitat = null;
        for (let q = 0; q < jaehr.length; q += 2) {
            const [t, i] = [jaehr[q], jaehr[q + 1]];
            if (t.tot) continue;
            if (!(rng() < (t.w ? BEUTE.abwandernKuh : BEUTE.abwandernBock))) continue;
            let nach;
            if (platz > 0) {
                const u = rng() * platz;
                let [lo, hi] = [0, n - 1];
                while (lo < hi) {
                    const mid = (lo + hi) >> 1;
                    if (cum[mid] > u) hi = mid;
                    else lo = mid + 1;
                }
                nach = lo;
            } else {
                if (!habitat) {
                    habitat = [];
                    for (let j = 0; j < n; j++) if (z.feldC[j]) habitat.push(j);
                }
                nach = habitat[Math.floor(rng() * habitat.length)];
            }
            if (nach === i) continue;
            const list = z.reh[i];
            list.splice(list.indexOf(t), 1);
            z.reh[nach].push(t);
            ev.zug.push({ t, von: i, nach, art: "reh" });
        }
    }

    // 6 — die Abwanderung des Wolfs (Satz 7b, 7c): wer sein Abwander-Alter erreicht hat und nicht zum Paar gehört (die zwei
    //     ältesten Köpfe des Rudels — das Paar wandert nie), SUCHT in jedem Takt, bis er geht:
    //       (1) er füllt die leere Stelle des nächsten Rudels ohne Paar (weniger als zwei Reife — die Paar-Regel des Wurfs);
    //           die Reihenfolge ist die von kern-3 (Beitritt vor Gründung): EIN Kopf gründet, der nächste Sucher macht das Paar;
    //       (2) sonst gründet er, wo offenes Land (frei oder Land eines Halters über dessen Bedarf) einem Paar V_halt trägt;
    //           der Halter gibt das Land ab;
    //       (3) sonst bleibt er als Kopf im Geburts-Rudel (zählt in V und D, isst mit) und sucht im nächsten Takt wieder.
    //     Kein Auslöser „reif“, „hungert“, „voll“; kein Tod auf der Wanderung.
    if (z.rudel.length) {
        let karte = false; // die Karte des offenen Lands dieses Takts (erst beim ersten Sucher gelesen)
        let land = 0; // 0 = die Stücke sind neu zu lesen · 1 = ein Stück trägt ein Paar · −1 = keines
        let summe = null;
        let gesucht = null;
        const paarWae = RAUM.vHalt * RAUM.paar;
        for (const R of z.rudel.slice()) {
            if (R.tiere.length <= RAUM.paar) continue;
            let [p1, p2] = [null, null];
            for (const t of R.tiere) {
                if (!p1 || t.alterS > p1.alterS) [p1, p2] = [t, p1];
                else if (!p2 || t.alterS > p2.alterS) p2 = t;
            }
            for (const t of R.tiere.slice()) {
                if (t === p1 || t === p2 || !(t.alterS >= t.ab) || (gesucht && gesucht.has(t))) continue;
                (gesucht || (gesucht = new Set())).add(t); // jeder Kopf sucht höchstens einmal je Takt
                ev.sucher++;
                let [ziel, d] = [null, Infinity];
                for (const Q of z.rudel) {
                    if (Q === R || !Q.tiere.length) continue;
                    let reife = 0;
                    for (const u of Q.tiere) if (u.r) reife++;
                    if (reife >= RAUM.paar) continue;
                    const dq = cheb(z.W, Q.ort, R.ort);
                    if (dq < d) [ziel, d] = [Q, dq];
                }
                if (ziel) {
                    R.tiere.splice(R.tiere.indexOf(t), 1);
                    ziel.tiere.push(t);
                    ev.zug.push({ t, von: R.ort, nach: ziel.ort, art: "beitritt" });
                    continue;
                }
                if (!karte) offenKarte(z, offen), (karte = true);
                if (land === 0) {
                    summe = offeneStuecke(z, offen, komp, stapel);
                    land = summe.some((s) => s >= paarWae) ? 1 : -1;
                }
                const terr = land > 0 ? paarLand(z, R.ort, offen, komp, summe, marke) : null;
                if (terr) {
                    R.tiere.splice(R.tiere.indexOf(t), 1);
                    const ids = new Set();
                    for (const x of terr) {
                        if (z.besitz[x] >= 0) ids.add(z.besitz[x]);
                        else z.frei--;
                        offen[x] = 0;
                    }
                    const N = rudelNeu(z, terr, terr[0], takt + 1 + TJ);
                    N.tiere.push(t);
                    if (ids.size) gibAb(z, ids, offen, marke);
                    land = 0;
                    ev.zug.push({ t, von: R.ort, nach: N.ort, art: "gruendung" });
                    continue;
                }
                ev.wartend++;
            }
        }
    }
    // 7 — ein Rudel ohne Köpfe gibt sein Revier frei; ein Rudel, dessen Revier seinen Bedarf nicht trägt, begeht das offene
    //     Land an seiner Grenze (Satz 7a); ein Rudel unter dem Deckel begeht das freie Land an seiner Grenze (kern-3);
    //     zuletzt der Kern je Rudel am Stand des Takt-Endes
    if (z.rudel.some((R) => !R.tiere.length)) {
        for (const R of z.rudel)
            if (!R.tiere.length)
                for (const x of R.reviere)
                    if (z.besitz[x] === R.id) (z.besitz[x] = -1), z.frei++;
        z.rudel = z.rudel.filter((R) => R.tiere.length);
    }
    if (z.rudel.length) {
        bedarfsLand(z, offen, marke);
        if (z.frei > 0) dehne(z);
        for (const R of z.rudel) R.kern = kernVon(z, R);
    }
    z.takt = takt + 1;
    return z;
}

const klon = (z) => structuredClone(z);

module.exports = { anfang, schritt, klon, verwundbar, anker, bedarfVon, ABWANDERN, ANTWORT, ANKER, FENSTER, ZEIT, BEUTE, WOLF, JAGD, RAUM, M_ART, B, WURF, BEUTE_MASSE, FELD, FELD_WURF, SEITE, HA, DIET, L, T };
