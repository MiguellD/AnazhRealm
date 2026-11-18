// AnazhRealm — leben-core.js: DAS GESETZ DES LEBENS (Welle 1 „leben-erbe“, Entscheid im Zweig koordination, vision/leben/entscheid §1–§4).
//
// Ein Lebewesen ist eine ADRESSE (Art · Individuum · Ahn), trägt ein ERBE (Zuchtwert-Vektor `a` nach dem Infinitesimal-Modell
// aus Mutter und Vater), und sein Leib ist PHYSIK seines Erbes über das Alter (Masse M∞ = M̄_Art·e^(a+e), Wachstum nach
// West–Brown–Enquist, Lebensdauer ∝ M^0,20). Die Auslese liest dieselben Kräfte wie heute, wählt Opfer und Mutter aber nach dem
// Leib (fastenRang, rissGewicht, lebensdauerS, reifeS). Das Gesetz gehört keiner Gattung: Tier (tetrapoda), Pflanze (phyto) und
// der Stammbaum lesen DASSELBE Erbe — darum ein eigener Kern.
//
// REIN: kein Zustand, keine Wanduhr, kein eigener Zufall, kein THREE. Der Zufall bleibt in den Strömen des Wirts (der Takt-Strom
// `_faunaRng("bestand:"+key+"@"+R.t)` für Segregation und Mutation, `_rollGenome(id, "erbe")` für die Umwelt-Streuung e); der
// Kern bekommt Gleichverteilte u ∈ [0, 1) bzw. Normalverteilte n und rechnet nur. Falsche Eingaben brechen LAUT (throw).
//
// ── DIE SIGNATUREN (EINGEFROREN ab Welle 1, Bahn B1 — B2 und B3 bauen parallel dagegen) ──────────────────────────────────────
//   Ein Erbe ist ein VEKTOR: `a`, `e` und jedes `n*` sind Arrays der Länge gesetz().achsen.length, Stelle i = Achse i
//   (Reihenfolge = Byte-Vertrag; Welle 1: eine Achse, [lnM]). Normalverteilte n kommen aus `normal(u1, u2)`.
//
//   gesetz()                               → LEBEN_GESETZ
//   normal(u1, u2)                         → N(0,1)            Box-Muller, u ∈ [0, 1) wie die Ströme sie liefern
//   gruender(n)                            → a  = √VA·n        (Einwanderer, unbekannter Vater)
//   kind(aM, aV, nSeg, nMut, nVater)       → a  = (aM + aV')/2 + √(VA/2)·nSeg + √(vmJeVE·VE)·nMut,  aV' = aV ?? gruender(nVater)
//   umwelt(n)                              → e  = √VE·n        (je Individuum fest, nie vererbt)
//   masseAdult(Mbar, a, e)                 → kg  Mbar·e^(a+e)  (die Achse lnM)
//   lebensdauerS(M∞)                       → s   refS·(M∞/refKg)^0,20
//   tau(M∞)                                → s   τ_ref·(M∞/refKg)^0,25
//   masseZurZeit(M∞, alterS)               → kg  M∞·[1 − (1 − q^¼)·e^(−alterS/tau(M∞))]⁴
//   reifeS(M∞)                             → s   tau(M∞)·ln((1−q^¼)/(1−reifeMasse^¼))
//   alterZurMasse(M∞, m)                   → s   die Umkehr von masseZurZeit: 0 für m ≤ q·M∞, Infinity für m ≥ M∞ (additiv)
//   fastenRang(m)                          → m^0,25            (relativ; der Kleinste zuerst)
//   rissGewicht(m)                         → m                 (Energie-Ertrag des Jägers ∝ Masse)
//   spanne()                               → [q^⅓·e^(−4·sdP/3), e^(4·sdP/3)]   die Größen-Grenzen DES GESETZES (bs)
//   artId(wurzel, pfad = "")               → wurzel + (pfad ? "/" + pfad : "")  Welle 1: pfad leer, die Wurzel ist die Gattung
//   indId(key, tS, j)                      → key + ":" + tS + ":" + j
//   selbsttest()                           → { steigung, steigungAus, masseMonoton, reifeTreffer, lebenWolf }
//       steigung     Regression Kind auf Eltern-Mittel (Phänotyp lnM) über 10⁵ Paare, Soll h2 0,46 ± 0,02
//       steigungAus  dieselbe Regression mit `gruender` statt `kind` (die Mutante), Soll 0 ± 0,02
//       masseMonoton masseZurZeit steigt streng über das Leben (0 … lebensdauerS), danach nie fallend, nie über M∞ (vier Massen)
//       reifeTreffer masseZurZeit(M, 0) = q·M und masseZurZeit(M, reifeS(M)) = 0,9·M auf 1e−9 (relativ), die Umkehr
//                    alterZurMasse(M, 0,9·M) = reifeS(M) ebenso
//       lebenWolf    lebensdauerS(64) (Soll 2100)
//     Verfehlt eine Zahl ihr Soll, wirft selbsttest() mit dem Namen des Felds (fail-closed); sonst liefert es die Zahlen.
//
// bs eines Tiers (die Skala des Gusses): bs = (masseZurZeit(M∞, alterS) / M_guss)^⅓, M_guss = Masse des gegossenen Anker-Leibs
// = M̄_Art in Welle 1 — das mittlere erwachsene Tier IST der Guss (bs = 1).
//
// GESETZ-KERN (studio-vertrag §9): STUDIO_VERTRAG = 1 und FUNKTION = 1 — keine Rezepte, keine Gestalt.
(function (root) {
    "use strict";

    const VERSION = 1;

    // ── 1.1 DIE KONSTANTEN — jede mit Anker; „unsicher“ = Wert gewählt im Band der Literatur ──────────────────────────────────
    const LEBEN_GESETZ = Object.freeze({
        // Reihenfolge = Byte-Vertrag; eine Achse tritt NUR mit Leser UND Auslese ein.
        //   h2: Mousseau & Roff 1987 (Heredity 59:181), Morphologie ~0,46
        //   sdP: Massen-CV 10–30 % in einer Population (Yablokov 1974) — unsicher
        achsen: Object.freeze([Object.freeze({ name: "lnM", h2: 0.46, sdP: 0.2 })]),
        vmJeVE: 1e-3, // Mutations-Varianz je Generation V_M/V_E (Houle, Morikawa & Lynch 1996; Lynch & Walsh 1998) — unsicher
        lebenExp: 0.2, // t_max ∝ M^0,20 (Sacher 1959; Calder 1984)
        wachsExp: 0.25, // ontogenetisches Wachstum (m/M)^¼ = 1 − (1 − q^¼)·e^(−t/τ), τ ∝ M^¼ (West, Brown & Enquist 2001, Nature 413:628)
        fastenExp: 0.25, // Fasten-Ausdauer ∝ M^0,25 (Lindstedt & Boyce 1985)
        geburtAnteil: 0.06, // q = m0/M∞ (Blueweiss et al. 1978, Huftier-Ordnung) — unsicher, für Nesthocker (Wolf, Bär) zu groß
        reifeMasse: 0.9, // reif ⇔ m ≥ 0,9·M∞ (Definition der Reife auf der WBE-Kurve)
        reifeAnteil: 0.2, // Eichung: der Anker-Wolf ist reif bei 0,2·t_max (Charnov 1993, α/t_max 0,1–0,25) — unsicher
        refKg: 64, // DER Zeit-Anker der Welt: der Wolf (KAMPF.refKg, tetrapoda-core.js) …
        refS: 2100, // … lebt die bisherige Spiel-Spanne (35 min, bis leben-erbe der eine Alterstod jeder Art). Die eine Raffung der Welt — unsicher
    });

    // Abgeleitet (kein eigener Stellwert): je Achse VA = h2·sdP², VE = (1−h2)·sdP²; die Wachstums-Konstante q^¼ und das
    // Reife-Maß ln((1−q^¼)/(1−reifeMasse^¼)); τ_ref = reifeAnteil·refS / Reife-Maß (= 420 s / 2,967 = 141,6 s).
    const G = LEBEN_GESETZ;
    const ACHSEN = G.achsen.length;
    const VA = G.achsen.map((x) => x.h2 * x.sdP * x.sdP);
    const VE = G.achsen.map((x) => (1 - x.h2) * x.sdP * x.sdP);
    const SD_A = VA.map(Math.sqrt);
    const SD_SEG = VA.map((v) => Math.sqrt(v / 2));
    const SD_MUT = VE.map((v) => Math.sqrt(G.vmJeVE * v));
    const SD_E = VE.map(Math.sqrt);
    const LN_M = G.achsen.findIndex((x) => x.name === "lnM");
    const Q_W = Math.pow(G.geburtAnteil, G.wachsExp); // q^¼
    const REIFE_MASS = Math.log((1 - Q_W) / (1 - Math.pow(G.reifeMasse, G.wachsExp)));
    const TAU_REF = (G.reifeAnteil * G.refS) / REIFE_MASS;

    function zahl(x, wer) {
        if (typeof x !== "number" || !Number.isFinite(x)) throw new Error("leben-core: " + wer + " ist keine endliche Zahl (" + x + ")");
        return x;
    }
    function masse(M, wer) {
        if (!(zahl(M, wer) > 0)) throw new Error("leben-core: " + wer + " ist keine positive Masse (" + M + ")");
        return M;
    }
    function vektor(v, wer) {
        if (!Array.isArray(v) || v.length !== ACHSEN) throw new Error("leben-core: " + wer + " ist kein Vektor der Länge " + ACHSEN);
        for (let i = 0; i < ACHSEN; i++) zahl(v[i], wer + "[" + i + "]");
        return v;
    }

    // ── 1.2 DIE FUNKTIONEN ─────────────────────────────────────────────────────────────────────────────────────────────────────
    function gesetz() {
        return LEBEN_GESETZ;
    }

    // Box-Muller: u ∈ [0, 1) (die Ströme liefern [0, 1)); 1 − u1 ∈ (0, 1] hält den Logarithmus endlich.
    function normal(u1, u2) {
        if (!(zahl(u1, "u1") >= 0 && u1 < 1) || !(zahl(u2, "u2") >= 0 && u2 < 1))
            throw new Error("leben-core: normal braucht u ∈ [0, 1) (" + u1 + ", " + u2 + ")");
        return Math.sqrt(-2 * Math.log(1 - u1)) * Math.cos(2 * Math.PI * u2);
    }

    function gruender(n) {
        vektor(n, "n");
        const a = new Array(ACHSEN);
        for (let i = 0; i < ACHSEN; i++) a[i] = SD_A[i] * n[i];
        return a;
    }

    // Infinitesimal-Modell: das Eltern-Mittel plus die Segregation (Varianz VA/2) plus die Mutation (V_M = vmJeVE·VE).
    // Ohne Vater (aV null/undefined) zieht der Vater einen Gründer-Zug aus nVater.
    function kind(aM, aV, nSeg, nMut, nVater) {
        vektor(aM, "aM");
        const v = aV == null ? gruender(nVater) : vektor(aV, "aV");
        vektor(nSeg, "nSeg");
        vektor(nMut, "nMut");
        const a = new Array(ACHSEN);
        for (let i = 0; i < ACHSEN; i++) a[i] = (aM[i] + v[i]) / 2 + SD_SEG[i] * nSeg[i] + SD_MUT[i] * nMut[i];
        return a;
    }

    function umwelt(n) {
        vektor(n, "n");
        const e = new Array(ACHSEN);
        for (let i = 0; i < ACHSEN; i++) e[i] = SD_E[i] * n[i];
        return e;
    }

    function masseAdult(Mbar, a, e) {
        masse(Mbar, "Mbar");
        vektor(a, "a");
        vektor(e, "e");
        return Mbar * Math.exp(a[LN_M] + e[LN_M]);
    }

    function lebensdauerS(M) {
        return G.refS * Math.pow(masse(M, "M∞") / G.refKg, G.lebenExp);
    }

    function tau(M) {
        return TAU_REF * Math.pow(masse(M, "M∞") / G.refKg, G.wachsExp);
    }

    function masseZurZeit(M, alterS) {
        if (!(zahl(alterS, "alterS") >= 0)) throw new Error("leben-core: alterS < 0 (" + alterS + ")");
        const w = 1 - (1 - Q_W) * Math.exp(-alterS / tau(M));
        return M * w * w * w * w;
    }

    function reifeS(M) {
        return tau(M) * REIFE_MASS;
    }

    // Die Umkehr des Wachstums: das Alter, in dem der Leib eines Tiers mit M∞ die Masse m trägt — 0 für m ≤ q·M∞ (nicht
    // kleiner als geboren), Infinity für m ≥ M∞ (ausgewachsen: das Alter sagt die Masse nicht mehr).
    function alterZurMasse(M, m) {
        const x = Math.pow(masse(m, "m") / masse(M, "M∞"), G.wachsExp);
        if (x <= Q_W) return 0;
        if (x >= 1) return Infinity;
        return tau(M) * Math.log((1 - Q_W) / (1 - x));
    }

    function fastenRang(m) {
        return Math.pow(masse(m, "m"), G.fastenExp);
    }

    function rissGewicht(m) {
        return masse(m, "m");
    }

    // Die Größen-Grenzen des Gesetzes in bs (Skala des Gusses): das Neugeborene am −4σ-Tier bis das +4σ-Erwachsene.
    function spanne() {
        const s = G.achsen[LN_M].sdP;
        return [Math.cbrt(G.geburtAnteil) * Math.exp((-4 * s) / 3), Math.exp((4 * s) / 3)];
    }

    function artId(wurzel, pfad) {
        if (typeof wurzel !== "string" || !wurzel) throw new Error("leben-core: artId ohne Wurzel");
        const p = pfad == null ? "" : String(pfad);
        return wurzel + (p ? "/" + p : "");
    }

    function indId(key, tS, j) {
        if (key == null || key === "") throw new Error("leben-core: indId ohne Region");
        zahl(tS, "tS");
        if (!(Number.isInteger(j) && j >= 0)) throw new Error("leben-core: indId j ist keine Lauf-Nummer (" + j + ")");
        return key + ":" + tS + ":" + j;
    }

    // ── SELBSTTEST — der Prüf-Strom (mulberry32, feste Saat) lebt NUR hier, nie in einer Gesetz-Funktion ──────────────────────
    function selbsttest() {
        let s = 0x1eb3e;
        const u = () => {
            s = (s + 0x6d2b79f5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const nv = () => {
            const n = new Array(ACHSEN);
            for (let i = 0; i < ACHSEN; i++) n[i] = normal(u(), u());
            return n;
        };
        // 10⁵ Paare: die Streuung der Steigung ist 0,013 bei 10⁴ Paaren (gemessen über 200 Saaten, 12 % außerhalb ±0,02) —
        // bei 10⁵ ist sie 0,004, das Band ±0,02 liegt bei ~5σ.
        const PAARE = 100000;
        // Eltern-Kind-Regression des Phänotyps lnM = a + e (Mbar = 1): Steigung Kind auf Eltern-Mittel = h2.
        const regression = (zeuge) => {
            let sx = 0, sy = 0, sxx = 0, sxy = 0;
            for (let k = 0; k < PAARE; k++) {
                const aM = gruender(nv()), aV = gruender(nv());
                const pM = Math.log(masseAdult(1, aM, umwelt(nv())));
                const pV = Math.log(masseAdult(1, aV, umwelt(nv())));
                const pK = Math.log(masseAdult(1, zeuge(aM, aV), umwelt(nv())));
                const x = (pM + pV) / 2;
                sx += x; sy += pK; sxx += x * x; sxy += x * pK;
            }
            return (sxy - (sx * sy) / PAARE) / (sxx - (sx * sx) / PAARE);
        };
        const steigung = regression((aM, aV) => kind(aM, aV, nv(), nv(), nv()));
        const steigungAus = regression(() => gruender(nv()));
        let masseMonoton = true;
        let reifeTreffer = true;
        for (const M of [15, 64, 94, 335]) {
            // streng steigend über das Leben (0 … lebensdauerS), danach nie fallend und nie über M∞ (die Asymptote sättigt in double)
            const leben = lebensdauerS(M);
            let vor = masseZurZeit(M, 0);
            for (let k = 1; k <= 600; k++) {
                const m = masseZurZeit(M, (3 * leben * k) / 600);
                if (k <= 200 ? !(m > vor) : !(m >= vor)) masseMonoton = false;
                if (!(m <= M)) masseMonoton = false;
                vor = m;
            }
            if (Math.abs(masseZurZeit(M, 0) / (G.geburtAnteil * M) - 1) > 1e-9) reifeTreffer = false;
            if (Math.abs(masseZurZeit(M, reifeS(M)) / (G.reifeMasse * M) - 1) > 1e-9) reifeTreffer = false;
            // die Umkehr trifft das Alter zurück (alterZurMasse ∘ masseZurZeit = Identität im Wachstum)
            if (Math.abs(alterZurMasse(M, masseZurZeit(M, reifeS(M))) / reifeS(M) - 1) > 1e-9) reifeTreffer = false;
        }
        const lebenWolf = lebensdauerS(64);
        const h2 = G.achsen[LN_M].h2;
        const fehl = [];
        if (!(Math.abs(steigung - h2) <= 0.02)) fehl.push("steigung " + steigung);
        if (!(Math.abs(steigungAus) <= 0.02)) fehl.push("steigungAus " + steigungAus);
        if (!masseMonoton) fehl.push("masseMonoton");
        if (!reifeTreffer) fehl.push("reifeTreffer");
        if (!(Math.abs(lebenWolf - G.refS) <= 1e-9)) fehl.push("lebenWolf " + lebenWolf);
        if (fehl.length) throw new Error("leben-core selbsttest ROT: " + fehl.join(" · "));
        return { steigung, steigungAus, masseMonoton, reifeTreffer, lebenWolf };
    }

    const api = Object.freeze({
        VERSION: VERSION,
        STUDIO_VERTRAG: 1, // G4.3 — EINE Versions-Semantik
        FUNKTION: 1, // studio-vertrag §9 — ein Gesetz-Kern: reine Funktionen, keine Rezepte, keine Gestalt
        gesetz: gesetz,
        normal: normal,
        gruender: gruender,
        kind: kind,
        umwelt: umwelt,
        masseAdult: masseAdult,
        lebensdauerS: lebensdauerS,
        tau: tau,
        masseZurZeit: masseZurZeit,
        reifeS: reifeS,
        alterZurMasse: alterZurMasse,
        fastenRang: fastenRang,
        rissGewicht: rissGewicht,
        spanne: spanne,
        artId: artId,
        indId: indId,
        selbsttest: selbsttest,
    });
    root.__lebenCore = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
