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
// Die EINE benannte Ausnahme: der Bestand (§2) zieht aus `strom(saat, takt, art, i, wirt.samen)` — am Samen verankert, eine reine Funktion
// seiner vier Zahlen; derselbe (Zustand, saat, takt, welt) gibt denselben Zustand.
//
// ── DIE SIGNATUREN (EINGEFROREN ab Welle 1, Bahn B1 — B2 und B3 bauen parallel dagegen) ──────────────────────────────────────
//   Ein Erbe ist ein VEKTOR: `a`, `e` und jedes `n*` sind Arrays der Länge gesetz().achsen.length, Stelle i = Achse i
//   (Reihenfolge = Byte-Vertrag; Welle 1: eine Achse, [lnM]; erbe-geburt hängt die zweite an: [lnM, scheu]). Normalverteilte n
//   kommen aus `normal(u1, u2)`.
//
//   gesetz()                               → LEBEN_GESETZ
//   normal(u1, u2)                         → N(0,1)            Box-Muller, u ∈ [0, 1) wie die Ströme sie liefern
//   gruender(n)                            → a  = √VA·n        (Einwanderer, unbekannter Vater)
//   kind(aM, aV, nSeg, nMut, nVater)       → a  = (aM + aV')/2 + √(VA/2)·nSeg + √(vmJeVE·VE)·nMut,  aV' = aV ?? gruender(nVater)
//   umwelt(n)                              → e  = √VE·n        (je Individuum fest, nie vererbt)
//   masseAdult(Mbar, a, e)                 → kg  Mbar·e^(a+e)  (die Achse lnM)
//   lebensdauerS(M∞)                       → s   refS·(M∞/refKg)^0,20
//   tau(M∞)                                → s   τ_ref·(M∞/refKg)^0,25
//   streifRadiusM(M, kost)                 → m   √(a·M^b ha / π), kost "pflanze" · "alles" · "fleisch" (additiv, wander-spieltag)
//   masseZurZeit(M∞, alterS)               → kg  M∞·[1 − (1 − q^¼)·e^(−alterS/tau(M∞))]⁴
//   reifeS(M∞)                             → s   tau(M∞)·ln((1−q^¼)/(1−reifeMasse^¼))
//   alterZurMasse(M∞, m)                   → s   die Umkehr von masseZurZeit: 0 für m ≤ q·M∞, Infinity für m ≥ M∞ (additiv)
//   erbeAusLeib(P)                         → { a, e }  ein Leib, dessen Phänotyp P (Vektor, lnM = ln(m/M̄)) gemessen ist, ohne
//                                            Herkunft: a = h²·P, e = (1 − h²)·P — der Erwartungswert von Zuchtwert und Umwelt
//                                            gegeben P (additiv; die Annahme eines Leibs ohne Bestand, kein Wurf, kein Sprung)
//   fastenRang(m)                          → m^0,25            (Fasten-Ausdauer; das Risiko des Hungers ∝ 1/fastenRang)
//   rissGewicht(m)                         → m                 (Energie-Ertrag des Jägers ∝ Masse)
//   wurfGewicht(m)                         → m^−0,25           (Wurf-Rate der Mutter: Haushalt m^¾ je Kind q·m; additiv)
//   eignung(P)                             → exp(−Σ P²/2ω²)    (die Nische der Art um ihr Optimum, ω² = omegaJeVP·sdP²; additiv)
//   spanne()                               → [q^⅓·e^(−4·sdP/3), e^(4·sdP/3)]   die Größen-Grenzen DES GESETZES (bs)
//   artId(wurzel, pfad = "")               → wurzel + (pfad ? "/" + pfad : "")  Welle 1: pfad leer, die Wurzel ist die Gattung
//   indId(key, tS, j)                      → key + ":" + tS + ":" + j
//   ── additiv (erbe-geburt, die zweite Achse `scheu`: das Verhalten ist Erbe — leben.evolution.zivilisation#1) ──
//   achse(name)                            → i   die Stelle der Achse im Vektor (wirft bei einem fremden Namen)
//   merkmal(wert, a, e, name)              → wert·e^(a_i + e_i)  das Maß der Art am Individuum (lnM: masseAdult; scheu: die
//                                            Fluchtdistanz der Gattung × e^P — Kinder scheuer Eltern fliehen früher)
//   fangGewicht(a, e)                      → e^(−scheuFang·P_scheu)  das Gewicht eines Kopfs in der Wahl des Risses: wer früher
//                                            flieht, wird seltener gefasst (die Auslese der Achse; die Nische `eignung` ist ihr Preis)
//   erbeVoll(v, wer?)                      → v'  ein Erbe eines Stands mit 1 … ACHSEN Stellen, die fehlenden als Art-Mittel 0
//                                            (die benannte Wandlung eines Stands von vor einer Achse; jede andere Form wirft)
//   normale(takt, adresse)                 → n   je Achse N(0,1): die Größe (lnM) aus `takt`, dem Strom des Takts (zwei u wie
//                                            vor der zweiten Achse), jede weitere aus `adresse`, dem Strom der Adresse des Kinds —
//                                            der Strom eines Takts bleibt byte-gleich, wie viele Achsen das Gesetz auch trägt
//   ── additiv (Schritt B, das Gesetz der Zeit und der Jagd — §2 unten trägt die Sätze und den Leser `welt`) ──
//   zeitJagd()                             → ZEIT_JAGD         die Werte der sieben Sätze, jede Rate je Jahr mit Quelle
//   anker(f, D, tafel = ZEIT_JAGD.anker)   → die Anker-Tafel des Satzes 4 an der Deckung D (faehen · welpen · welpeJaehrling · ueberleben)
//   strom(saat, takt, art, i, samen)       → () => u ∈ [0, 1)  der am Samen verankerte Strom des Bestands (samen: der Strom des Wirts, `wirt.samen`)
//   bestand(wirt, gesetz = ZEIT_JAGD)      → { ZEIT, RAUM, FENSTER, anfang(opt, welt), schritt(z, saat, takt, welt), klon(z),
//                                              verwundbar(t), bedarfVon(R) }   der Bestand als reine Funktion über ein Raster
//     additiv (C2a, der Gau — der Bestand über EINEM Feld mit Fraß-Schicht und Akten; braucht `wirt.feld`, §2 „DER GAU“):
//       gauFeld({ W, H, S, LR }) → feld · gauAnfang(feld, saat, opt?) → g · gauSchritt(g) · gauBis(g, takt, akte) → g
//       akt(g, { takt, art: "aus" | "ein", id, … }) → wirkte · feldTakt(feld, O, Kap) · feldAesen(feld, O, frass)
//       koepfe(z, i) → { beute, jaeger, rudel } · tiereIn(z, i) → [{ id, g, v, m, w, alterS, kg, M, r, a, e }] · frassAm(g, i, c)
//       gauPack(g) → Uint8Array · gauEntpack(bytes, feld) → g      der Gau als reines Datum (Stand, Mitspieler)
//   selbsttest(samen)                      → { steigung, steigungAus, steigungScheu, streuKind, saatGleich, eichung, masseMonoton,
//                                              reifeTreffer, lebenWolf, streifTelemetrie }
//       steigung     Regression Kind auf Eltern-Mittel (Phänotyp lnM) über 10⁵ Paare, Soll h2 0,46 ± 0,02
//       steigungAus  dieselbe Regression mit `gruender` statt `kind` (die Mutante), Soll 0 ± 0,02
//       steigungScheu dieselbe Regression an der Achse scheu (`merkmal`), Soll ihr h2 0,35 ± 0,02 (erbe-geburt)
//       streuKind    je Achse die Varianz des Kinds um das Eltern-Mittel, Soll VA/2 + V_M ± 5 % (erbe-geburt)
//       saatGleich   gleiche Saat → gleiches Kind Bit für Bit, eine andere Saat ein anderes (erbe-geburt)
//       eichung      mittlere Eignung aller Achsen × EIGNUNG_EICH ÷ die der Größe allein, Soll 1 ± 0,005 (erbe-geburt)
//       masseMonoton masseZurZeit steigt streng über das Leben (0 … lebensdauerS), danach nie fallend, nie über M∞ (vier Massen)
//       reifeTreffer masseZurZeit(M, 0) = q·M und masseZurZeit(M, reifeS(M)) = 0,9·M auf 1e−9 (relativ), die Umkehr
//                    alterZurMasse(M, 0,9·M) = reifeS(M) ebenso, erbeAusLeib(P): a + e = P und a = h²·P
//       lebenWolf    lebensdauerS(64) (Soll 2100)
//       streifTelemetrie  π·streifRadiusM² der Fleischfresser gegen Wolf und Rotfuchs der Telemetrie (Lindstedt 1986, Tab. 1), Soll Faktor ≤ 2
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
        //   scheu (erbe-geburt, die zweite Achse): P = ln(d / d̄) der Fluchtdistanz gegen das Feldmaß der Gattung (tetrapoda
        //     FURCHT_GESETZ.fluchtDistanzM). Leser: die Flucht vor dem Menschen (`merkmal`), Auslese: der Riss (`fangGewicht`) gegen
        //     die Nische (`eignung`: wer flieht, äst weniger). h2: Verhalten im Mittel 0,24 (Dochtermann, Schwab & Sih 2015, Proc. R.
        //     Soc. B 282:20141201), Kühnheit/Erkundung der Kohlmeise 0,22–0,54 (Dingemanse et al. 2002, Anim. Behav. 64:929) —
        //     gewählt 0,35, unsicher. sdP: die Fluchtdistanz streut in einer Population um ±30–50 % (Stankowich & Blumstein 2005,
        //     Proc. R. Soc. B 272:2627) — 0,35, unsicher
        achsen: Object.freeze([Object.freeze({ name: "lnM", h2: 0.46, sdP: 0.2 }), Object.freeze({ name: "scheu", h2: 0.35, sdP: 0.35 })]),
        // Die Fang-Elastizität der Scheu: das Gewicht im Riss ∝ (d / d̄)^−scheuFang — die Beute, die bei doppelter Distanz flieht,
        // gibt dem Jäger den doppelten Weg vor und wird halb so oft gefasst (Ydenberg & Dill 1986, Adv. Study Behav. 16:229: die
        // Ökonomie der Flucht) — gewählt 1, unsicher
        scheuFang: 1,
        vmJeVE: 1e-3, // Mutations-Varianz je Generation V_M/V_E (Houle, Morikawa & Lynch 1996; Lynch & Walsh 1998) — unsicher
        lebenExp: 0.2, // t_max ∝ M^0,20 (Sacher 1959; Calder 1984)
        wachsExp: 0.25, // ontogenetisches Wachstum (m/M)^¼ = 1 − (1 − q^¼)·e^(−t/τ), τ ∝ M^¼ (West, Brown & Enquist 2001, Nature 413:628)
        fastenExp: 0.25, // Fasten-Ausdauer ∝ M^0,25 (Lindstedt & Boyce 1985)
        wurfExp: -0.25, // Wurf-Rate der Mutter ∝ M^−0,25: Haushalt ∝ M^¾ (Kleiber) je Kind q·M (Fenchel 1974, r_max ∝ M^−0,26)
        // Die Nische hält die Art: Eignung exp(−P²/2ω²) um das Optimum der Art (Welle 1: der Guss, P = 0), ω² = omegaJeVP·sdP²
        // (Lande 1976, Evolution 30:314; Kingsolver et al. 2001, Am Nat 157:245: Median |γ| ≈ 0,1 → ω² ≈ 10·VP) — unsicher
        omegaJeVP: 10,
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
    const OMEGA2 = G.achsen.map((x) => G.omegaJeVP * x.sdP * x.sdP);
    const LN_M = G.achsen.findIndex((x) => x.name === "lnM");
    const SCHEU = G.achsen.findIndex((x) => x.name === "scheu");
    // DIE EICHUNG DER RATE (erbe-geburt): die Raten der Quelle (ZEIT_JAGD, Lauf 4) sind das Mittel der Art und geeicht MIT der Nische
    // der Größe — ihre mittlere Eignung im Gleichgewicht der Art (P ~ N(0, sdP²): w̄ = (1 + sdP²/ω²)^−½ = 0,953, Lande 1976) steht
    // in der Eichung. Jede Achse jenseits der Größe trägt ihre Nische RELATIV zu ihrem w̄: die Auslese bleibt, das Mittel der Rate
    // rückt nicht. Gemessen ohne die Eichung (Lauf-4-Gau 48 × 48, Saaten 1 · 2, 1 051 Takte): Geburten der Beute 472 410 → 445 435
    // (−5,7 %), ē 0,950 → 0,902. Der EINE Leser: die Rate der Mutter im Bestand (`bestand`, Satz 3).
    const EIGNUNG_EICH = G.achsen.reduce((f, x, i) => (i === LN_M ? f : f * Math.sqrt(1 + (x.sdP * x.sdP) / OMEGA2[i])), 1);
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

    // DAS STREIFGEBIET (wander-spieltag, additiv; leben.tiere.wanderung#2): die Fläche, die ein Tier der Masse M zum Leben
    // braucht, wächst linear mit der Masse, je Kost ihre Zeile — A = a·M^b ha (M in kg; Lindstedt, Miller & Buskirk 1986, Ecology
    // 67:413: Pflanzenfresser 2,71·M^1,02, N 28 · Allesfresser 3,4·M^0,92, N 7 — Harestad & Bunnell 1979, ihre Gl. 7/8 —,
    // Fleischfresser 170·M^1,03, N 38, Telemetrie, ihre Gl. 10). Die Reichweite um den Anker ist der Radius der Kreis-Fläche
    // √(A/π): der Hirsch (93 kg) 0,94 km, der Wolf (64 kg) 6,3 km. Die Zeit rafft das Spiel (refS), den Raum nie.
    const STREIF_GESETZ = Object.freeze({
        pflanze: Object.freeze({ aHa: 2.71, b: 1.02 }),
        alles: Object.freeze({ aHa: 3.4, b: 0.92 }),
        fleisch: Object.freeze({ aHa: 170, b: 1.03 }),
    });
    function streifRadiusM(M, kost) {
        if (!Object.prototype.hasOwnProperty.call(STREIF_GESETZ, kost)) throw new Error("leben-core: Kost " + kost + " ohne Zeile im Streifgebiet");
        const Z = STREIF_GESETZ[kost];
        return Math.sqrt((Z.aHa * Math.pow(masse(M, "M"), Z.b) * 1e4) / Math.PI);
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

    // Der gemessene Leib ohne Herkunft (die Annahme): Zuchtwert und Umwelt-Streuung als ihr Erwartungswert gegeben den
    // Phänotyp P — die Regression des Infinitesimal-Modells, a = h²·P, e = (1 − h²)·P; a + e = P (der Leib springt nicht).
    function erbeAusLeib(P) {
        vektor(P, "P");
        const a = new Array(ACHSEN),
            e = new Array(ACHSEN);
        for (let i = 0; i < ACHSEN; i++) [a[i], e[i]] = [G.achsen[i].h2 * P[i], (1 - G.achsen[i].h2) * P[i]];
        return { a, e };
    }

    function fastenRang(m) {
        return Math.pow(masse(m, "m"), G.fastenExp);
    }

    function wurfGewicht(m) {
        return Math.pow(masse(m, "m"), G.wurfExp);
    }

    // Die Eignung eines Phänotyps P (Vektor, je Achse die Abweichung vom Optimum der Art) — das Gewicht der Mutter neben ihrer
    // Wurf-Rate: die Nische der Art kostet jede Abweichung (stabilisierende Auslese, Lande 1976).
    function eignung(P) {
        vektor(P, "P");
        let q = 0;
        for (let i = 0; i < ACHSEN; i++) q += (P[i] * P[i]) / (2 * OMEGA2[i]);
        return Math.exp(-q);
    }

    function rissGewicht(m) {
        return masse(m, "m");
    }

    // Die Größen-Grenzen des Gesetzes in bs (Skala des Gusses): das Neugeborene am −4σ-Tier bis das +4σ-Erwachsene.
    function spanne() {
        const s = G.achsen[LN_M].sdP;
        return [Math.cbrt(G.geburtAnteil) * Math.exp((-4 * s) / 3), Math.exp((4 * s) / 3)];
    }

    // DIE ACHSE BEIM NAMEN (erbe-geburt): ihre Stelle im Vektor des Erbes — ein fremder Name bricht laut.
    function achse(name) {
        const i = G.achsen.findIndex((x) => x.name === name);
        if (i < 0) throw new Error("leben-core: das Gesetz trägt keine Achse „" + name + "“");
        return i;
    }
    // DAS MASS DER ART AM INDIVIDUUM: wert·e^(a_i + e_i) — der Phänotyp der Achse als Faktor auf das Maß der Gattung (die Achse
    // lnM: masseAdult; die Achse scheu: die Fluchtdistanz, die ein Kind scheuer Eltern früher fliehen lässt).
    function merkmal(wert, a, e, name) {
        zahl(wert, "wert");
        vektor(a, "a");
        vektor(e, "e");
        const i = achse(name);
        return wert * Math.exp(a[i] + e[i]);
    }
    // DAS ERBE EINES STANDS VON VOR EINER ACHSE (erbe-geburt, die Wandlung — benannt, nie still): ein Vektor endlicher Zahlen mit
    // 1 … ACHSEN Stellen trägt die Achsen, die er nicht kennt, als das Art-Mittel (0); jede andere Form bricht laut. Liefert einen
    // NEUEN Vektor der Länge ACHSEN.
    function erbeVoll(v, wer) {
        if (!Array.isArray(v) || v.length < 1 || v.length > ACHSEN) throw new Error("leben-core: " + (wer || "das Erbe") + " ist kein Vektor mit 1 … " + ACHSEN + " Achsen");
        const aus = new Array(ACHSEN).fill(0);
        for (let i = 0; i < v.length; i++) aus[i] = zahl(v[i], (wer || "das Erbe") + "[" + i + "]");
        return aus;
    }
    // DAS GEWICHT IM RISS (die Auslese der Scheu): (d / d̄)^−scheuFang = e^(−scheuFang·P_scheu) — 1 am Art-Mittel.
    function fangGewicht(a, e) {
        vektor(a, "a");
        vektor(e, "e");
        return Math.exp(-G.scheuFang * (a[SCHEU] + e[SCHEU]));
    }
    // DIE NORMALEN EINES ZUGS (erbe-geburt — die EINE Regel, welcher Strom welche Achse zieht; Bestand und Wirt rufen sie): die
    // Größe aus dem Strom des Takts (`takt`, zwei Gleichverteilte wie in Welle 1), jede weitere Achse aus dem Strom der Adresse
    // des Kinds (`adresse`, je Kind ein eigener) — eine neue Achse verschiebt keinen Zug des Takts, jeder folgende Wurf (Tod,
    // Geschlecht, Mutter, Riss) bleibt, wie er war. Bis zur Regel zog die zweite Achse ihr Paar aus dem Strom des Takts, und jeder
    // Zug danach rückte um zwei (die Probe kaskade: Bär der Saat 8 1,61 → 0,2).
    function normale(takt, adresse) {
        if (typeof takt !== "function" || typeof adresse !== "function") throw new Error("leben-core normale: ohne den Strom des Takts und der Adresse");
        const n = new Array(ACHSEN);
        for (let i = 0; i < ACHSEN; i++) n[i] = i === LN_M ? normal(takt(), takt()) : normal(adresse(), adresse());
        return n;
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

    // ── 2 DER BESTAND — DAS GESETZ DER ZEIT UND DER JAGD (sieben Sätze; Soll S1–S15 und die Läufe 1–4 im Zweig koordination,
    // vision/leben). Der Bestand — Beute-Verbände, Rudel, Reviere, Jahres-Takt — ist EINE reine Funktion über ein Raster von
    // Revieren: Zustand hinein, Zustand heraus. Was die Welt liefert, kommt über den LESER `welt` herein (nie als Kopie):
    //   welt.land(i)   → trägt das Revier i Lebensraum der Beute (begehbares Land)
    //   welt.futter(i) → die Tragfähigkeit K des Reviers i in Köpfen der Beute-Art ((kg ÷ M̄)^¾), im Augenblick des Takts
    // Was der Wirt über die Arten weiß, kommt als `wirt` (Zahlen, im Worker tragbar): taktS, revierSeiteM,
    //   beute { M, verband [min, max], frassJeJahr } · jaeger { M, verband [min, max], beuteMasse, jagdKg }.
    // Hinaus geht mit dem Zustand: z.ereignis (Geburten, Tode, Züge, Summen des Takts) und z.frass (Fraß je Revier in
    // Feld-Einheiten — der Wirt schreibt ihn in seine Welt, der Kern hält kein Feld).
    //   1. EINE Uhr: refS ≙ jahreRef Freiland-Jahre des Anker-Wolfs; jede Rate steht je Jahr und geht über taktJeJahr in Takte.
    //   2. Je KOPF: Geburt je reifer Mutter, Tod je Kopf, Bedarf und Fraß je kg^¾. Kein Deckel je Revier.
    //   3. Der Riss antwortet auf das VERHÄLTNIS: Riss des Rudels je Takt = Sattheit × V ÷ (V + V½), V = Beute-Köpfe im
    //      Rudel-Revier je Kopf des Rudels (1 Weißwedel-Äquivalent je Beute-Kopf); WELCHER Kopf fällt, zieht die Verwundbarkeit.
    //   4. Der Jäger antwortet auf seine Deckung D = Riss ÷ Erhaltung des letzten Jahres als GRADIENT (die Anker-Tafel).
    //   5. Jäger ÷ Beute ist Probe: kein Verhältnis steht hier.   6. Der Leib (Sekunden) kommt hier nicht vor.
    //   7. Der Raum antwortet auf die Beute: ein Rudel verteidigt nur seinen Bedarf (V_halt je Kopf), wandern entscheidet das
    //      Alter, der Wanderer füllt eine leere Stelle, sonst gründet er auf offenem Land, sonst bleibt er.
    const tief = (o) => {
        for (const k in o) if (o[k] && typeof o[k] === "object") tief(o[k]);
        return Object.freeze(o);
    };
    const ZEIT_JAGD = tief({
        jahreRef: 8, // Jahre je refS — Satz 1 (gesetzt; Spanne der Quellen 4,5 a Yellowstone ↔ 26,6 a t_max)
        // DIE BEUTE (Weißwedel-Äquivalent) — jede Zahl je Jahr
        beute: {
            // Kitze je reifer Kuh je Jahr [karg, gut] — Verme 1969, J. Wildl. Manage. 33:881 (Abstract); zwischen karg und gut
            // führt das Futter des Reviers: gut × (1 − Last ÷ K) + karg × (Last ÷ K), über K karg
            kitzeAdult: [1.36, 1.8],
            kitzeJaehrling: [0.62, 1.63], // Kuh im ersten Jahr nach der Reife
            // Überleben je Jahr OHNE Jäger am Stand Last = K: Kitz 0,59 — Rohm et al. 2007 via FEIS (Sekundär); ab einem Jahr
            // 0,76 — Am. Midl. Nat. 165:426 (2011). Der Tod läuft über das Futter: Hazard je Jahr = −ln(Überleben) × Last ÷ K.
            ueberlebenKitz: 0.59,
            ueberlebenAdult: 0.76,
            // Abwanderung im Jährlings-Jahr: Bock 0,80 · Kuh 0,13 — Crab Orchard NWR via FEIS Ref. [153] (Sekundär)
            abwandernBock: 0.8,
            abwandernKuh: 0.13,
            weiblich: 0.5,
        },
        // DER JÄGER (Wolf): kg je Tag je kg^¾
        jaeger: {
            erhaltung: 0.1925, // 2,77 kg je Tag am 35-kg-Wolf (FMR) — Głowaciński & Profus 1997, Tab. 5–6 (Volltext)
            sattheit: 0.396, // Riss-BRUTTO: 5,7 kg je Tag am 35-kg-Wolf, Yellowstone Frühwinter — Stahler et al. 2006
            nutz: 0.7, // HYPOTHESE (0,6–0,8): nutzbarer Anteil eines Risses — nur Buchung (gedeckt = nutz × Riss), keine Rate liest ihn
        },
        // Satz 3: Halb-Sättigung in Weißwedel-Äquivalenten je Wolf — Isle Royale, 94 Rudel-Winter (Vucetich et al. 2002): 41 Elche × 6
        antwort: { vHalb: 246 },
        // Satz 4: die Anker-Tafel (arm · Gleichgewicht · reich), linear dazwischen, außerhalb gehalten. Fähen und Föten: Boertje
        // 1992 Tab. 1 · Überleben und 2 Rekruten je Rudel: Peterson & Page 1988 · Welpen-Überleben 0,75: Hayes 2000 · die
        // Zuordnung der D-Werte ist die des Gesetzes (aus Satz 3), nicht gelesen.
        anker: {
            D: [0.6, 1.05, 1.5],
            faehen: [0.66, 0.97, 0.96], // Anteil der Wurf-Tage (Rudel mit Paar), an denen ein Wurf fällt
            welpen: [4.6, 5.7, 6.9], // Welpen je Wurf (der Bruch-Teil fällt als Bernoulli)
            welpeJaehrling: [0, 0.36, 0.75], // Anteil der Welpen, die ein Jahr alt werden
            ueberleben: [0.49, 0.66, 0.85], // Überleben je Jahr ab einem Jahr
        },
        // die Verwundbarkeit als Zieh-Gewicht (unreif · Greis gegen bestes Alter 1) — Mech 1966; Greis ab der halben Lebensdauer
        jagd: { jung: 16, greis: 16, greisAb: 0.5 },
        // Satz 7: Tages-Strecke 22,1 (♀) / 27,6 (♂) km × Wiederkehr alle 6 Tage (Jędrzejewski et al. 2001) = der Deckel dessen,
        // was ein Rudel begehen KANN; V_halt = das Null-Wachstum von Isle Royale (43 Elche je Wolf × 6); ein Paar gründet
        raum: { tagesKm: (22.1 + 27.6) / 2, wiederkehrTage: 6, vHalt: 258, paar: 2 },
        // Satz 7b: 77 % wandern gleichverteilt mit 2–4 Jahren (Hayes & Harestad 2000); EIGENE SETZUNG: der Rest symmetrisch,
        // je 11,5 % in 1,5–2 und in 4–4,5 Jahren
        abwandern: { anteil: 0.77, fenster: [2, 4], frueh: [1.5, 2], spaet: [4, 4.5] },
    });
    function zeitJagd() {
        return ZEIT_JAGD;
    }
    const ANKER_ANTEIL = { faehen: true, welpeJaehrling: true, ueberleben: true };
    function anker(f, D, tafel) {
        const A = tafel || ZEIT_JAGD.anker;
        const [x, y] = [A.D, A[f]];
        if (!y || f === "D") throw new Error("leben-core: die Anker-Tafel trägt kein Feld " + f);
        let v;
        if (!(D > x[0])) v = y[0];
        else if (D >= x[2]) v = y[2];
        else {
            const i = D < x[1] ? 0 : 1;
            v = y[i] + ((y[i + 1] - y[i]) * (D - x[i])) / (x[i + 1] - x[i]);
        }
        return ANKER_ANTEIL[f] ? Math.min(1, Math.max(0, v)) : v;
    }
    // DER STROM — der EINE Zufall des Bestands, am Samen verankert: (saat, takt, art, i) → Folge Gleichverteilter in [0, 1).
    // Arten: 0 Beute je Revier · 1 Rudel · 2 Abwanderung der Beute · 4 Jagd · 5 Abwander-Alter · 6 Akt · 7 die Adresse eines Kinds
    // (erbe-geburt: die Achsen jenseits der Größe, `normale`) · takt −1 = der Anfang.
    function mix(h) {
        h ^= h >>> 16;
        h = Math.imul(h, 0x85ebca6b);
        h ^= h >>> 13;
        h = Math.imul(h, 0xc2b2ae35);
        h ^= h >>> 16;
        return h >>> 0;
    }
    // DER GENERATOR IST GEREICHT (Ein-Schreiber-Wand, Größe Samen): der Kern hasht nur den Samen aus seinen vier Zahlen, den Strom
    // zieht er aus `samen(same)` des Wirts — der EINE Strom der Welt (samen-core `samenStrom`, im Stamm `_samenStrom`). Ohne
    // `samen` bricht er laut; einen eigenen Generator trägt kein Kern (bis 20.11. stand hier ein mulberry32).
    function strom(saat, takt, art, i, samen) {
        if (typeof samen !== "function") throw new Error("leben-core strom: der Wirt reicht keinen Strom (samen)");
        let s = mix((saat | 0) + 0x9e3779b9);
        s = mix(s ^ Math.imul(takt + 1, 0x9e3779b1));
        s = mix(s ^ Math.imul(art + 1, 0x85ebca77));
        s = mix(s ^ Math.imul(i + 1, 0xc2b2ae3d));
        return samen(s);
    }

    // bestand(wirt, gesetz = ZEIT_JAGD) → { ZEIT, RAUM, FENSTER, anfang(opt, welt), schritt(z, saat, takt, welt), klon(z), verwundbar, bedarfVon }
    //   anfang({ W, H, saat, jaeger?, nutz? }, welt) → Zustand am Takt 0 · schritt verbraucht den Zustand und liefert ihn am
    //   Takt + 1 · derselbe (Zustand, saat, takt, welt) gibt denselben Zustand. Die Karten NACHBAR und PUFFER sind Arbeits-
    //   Speicher je Raster-Größe (kein Wert überlebt einen Schritt).
    function bestand(wirt, gesetz) {
        // `gesetz` fehlt im Spiel: es gilt ZEIT_JAGD. NUR der Selbsttest einer Linse reicht hier seinen Mutanten (EIN Wert verstellt)
        // — ein Wirt, der ein eigenes Gesetz reicht, fährt den Zwilling, den es nicht geben darf.
        const ZJ = gesetz == null ? ZEIT_JAGD : gesetz;
        for (const k in ZEIT_JAGD) if (ZJ[k] == null) throw new Error("leben-core bestand: dem gereichten Gesetz fehlt " + k);
        const ankerZJ = (f, D) => anker(f, D, ZJ.anker);
        if (!wirt || !wirt.beute || !wirt.jaeger) throw new Error("leben-core bestand: der Wirt nennt beute und jaeger");
        // der Strom der Welt, den der Wirt reicht (`samen(same)` → () => u): Seite und Faden reichen samen-core `samenStrom`
        const SAMEN = wirt.samen;
        if (typeof SAMEN !== "function") throw new Error("leben-core bestand: der Wirt reicht keinen Strom (wirt.samen)");
        const spanneVon = (v, wer) => {
            if (!Array.isArray(v) || v.length !== 2 || !Number.isInteger(v[0]) || !Number.isInteger(v[1]) || !(v[0] >= 1 && v[1] >= v[0]))
                throw new Error("leben-core bestand: " + wer + " ist keine Verbands-Spanne [min, max]");
            return [v[0], v[1]];
        };
        const TAKT_S = masse(wirt.taktS, "wirt.taktS");
        const SEITE = masse(wirt.revierSeiteM, "wirt.revierSeiteM");
        const M_ART = { beute: masse(wirt.beute.M, "wirt.beute.M"), jaeger: masse(wirt.jaeger.M, "wirt.jaeger.M") };
        const M34_ART = { beute: Math.pow(M_ART.beute, 0.75), jaeger: Math.pow(M_ART.jaeger, 0.75) };
        // die VERBANDS-Größe: NUR der Anfangs-Bestand (Satz 7b: die Rudel-Größe ist Folge, keine Eingabe)
        const VERBAND = { beute: spanneVon(wirt.beute.verband, "wirt.beute.verband"), jaeger: spanneVon(wirt.jaeger.verband, "wirt.jaeger.verband") };
        const BEUTE_MASSE = masse(wirt.jaeger.beuteMasse, "wirt.jaeger.beuteMasse"); // Beute wiegt höchstens beuteMasse × den jagenden Verband
        const JAGD_KG = masse(wirt.jaeger.jagdKg, "wirt.jaeger.jagdKg"); // ab dieser Masse jagt ein Kopf mit
        const [BEUTE, WOLF, ANTWORT, JAGD, ABWANDERN] = [ZJ.beute, ZJ.jaeger, ZJ.antwort, ZJ.jagd, ZJ.abwandern];
        // DIE EINE UHR (Satz 1)
        const ZEIT = (() => {
            const jahreRef = ZJ.jahreRef;
            const taktJeJahr = G.refS / TAKT_S / jahreRef;
            return Object.freeze({ jahreRef, taktJeJahr, tageJeTakt: 365.25 / taktJeJahr, jahrS: taktJeJahr * TAKT_S });
        })();
        const TJ = ZEIT.taktJeJahr;
        const TAGE = ZEIT.tageJeTakt;
        const FENSTER = Math.round(ZEIT.taktJeJahr); // die Deckung des letzten Jahres: gleitend über FENSTER Takte des Rudels
        const RAUM = Object.freeze({
            deckel: Math.floor((ZJ.raum.tagesKm * 1000 * ZJ.raum.wiederkehrTage) / SEITE),
            vHalt: ZJ.raum.vHalt,
            paar: ZJ.raum.paar,
        });
        const FRASS_TAKT = zahl(wirt.beute.frassJeJahr, "wirt.beute.frassJeJahr") / TJ; // Fraß je Takt je (kg ÷ M̄)^¾ in Feld-Einheiten
        const QW = Q_W;
        function abwanderAlter(rng) {
            const [u, v] = [rng(), rng()];
            const [a, b] = u < ABWANDERN.anteil ? ABWANDERN.fenster : u < ABWANDERN.anteil + (1 - ABWANDERN.anteil) / 2 ? ABWANDERN.frueh : ABWANDERN.spaet;
            return (a + v * (b - a)) * ZEIT.jahrS;
        }
        // das Wachstum (masseZurZeit), inline: EIN exp je Kopf je Takt statt pow — beim Bau gegen masseZurZeit geprüft
        function wachse(t) {
            const w = 1 - (1 - QW) * Math.exp(-t.alterS / t.tau);
            const w3 = w * w * w;
            t.ww = w;
            t.kg = t.M * w3 * w;
            t.k34 = t.M34 * w3;
        }
        for (const M of [40, 64, 94.24, 130])
            for (const a of [0, 10, 100, 463, 2000]) {
                const t = { M, M34: Math.pow(M, 0.75), tau: reifeS(M) / REIFE_MASS, alterS: a };
                wachse(t);
                if (Math.abs(t.kg - masseZurZeit(M, a)) > 1e-9 * M || Math.abs(t.k34 - Math.pow(t.kg, 0.75)) > 1e-9 * M)
                    throw new Error("leben-core bestand: das Wachstum ist nicht mehr masseZurZeit von leben-core");
            }
        if (Math.abs(eignung(G.achsen.map(() => 0)) - 1) > 1e-12) throw new Error("leben-core bestand: eignung(0) ist nicht 1");
        // der Strom der Adresse eines Kinds (Art 7, erbe-geburt): jede Achse jenseits der Größe zieht aus ihm (`normale`)
        const adresse = (saat, takt, id) => strom(saat, takt, 7, kennZahl(id), SAMEN);
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
        const mutterW = (t) => wurfGewicht(t.kg) * t.eig;
        // die Verwundbarkeit: eine Stufe im Alter — unreif · Greis · sonst 1 (keine Masse: der Riss zieht nicht an der Größen-Erbanlage)
        // — mal das Fang-Gewicht der Scheu (`fangGewicht`, erbe-geburt): wer früher flieht, wird seltener gefasst
        const verwundbar = (t) => (!t.r ? JAGD.jung : t.alterS >= JAGD.greisAb * t.tod ? JAGD.greis : 1) * t.fang;

        function tier(g, id, a, e, mutter, alterS, weiblich) {
            const M = masseAdult(M_ART[g], a, e);
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
                tau: reifeS(M) / REIFE_MASS,
                tod: lebensdauerS(M),
                reif: reifeS(M),
                // die Nische über JEDE Achse: die Größe am Leib, die Scheu am Erbe (erbe-geburt — wer flieht, äst weniger)
                eig: eignung(G.achsen.map((x, i) => (i === LN_M ? P : a[i] + e[i]))),
                fang: fangGewicht(a, e),
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
        // ein Tier des ANFANGS: Gründer-Erbe, erwachsen, das Alter gleichverteilt zwischen Reife und Lebensdauer (die Achsen jenseits
        // der Größe aus dem Strom seiner Adresse am Anfang, takt −1)
        function gruenderTier(g, id, rng, saat) {
            const ax = adresse(saat, -1, id);
            const t = tier(g, id, gruender(normale(rng, ax)), umwelt(normale(rng, ax)), null, 0, rng() < BEUTE.weiblich);
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
                s += z.beute[terr[q]].length;
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
                if (z.besitz[alt[0]] !== Q.id) throw new Error("leben-core bestand: der Gründungs-Ort des Rudels " + Q.id + " wurde abgegeben — der Kern ist nie offenes Land");
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
                    s += z.beute[x].length;
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
            let s = z.beute[start].length;
            for (let q = 0; q < terr.length && s < need; q++)
                for (const y of n4[terr[q]])
                    if (s < need && terr.length < RAUM.deckel && offen[y] && !marke[y]) {
                        marke[y] = 1;
                        terr.push(y);
                        s += z.beute[y].length;
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
                for (let q = 0; q < terr.length; q++) s += z.beute[terr[q]].length;
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
                            s += z.beute[y].length;
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

        function anfang(opt, welt) {
            const { W, H, saat } = opt;
            if (!(Number.isInteger(W) && W > 0 && Number.isInteger(H) && H > 0)) throw new Error("leben-core bestand: anfang ohne Raster W × H");
            if (!welt || typeof welt.land !== "function" || typeof welt.futter !== "function") throw new Error("leben-core bestand: der Welt-Leser trägt land(i) und futter(i)");
            const n = W * H;
            const z = {
                W,
                H,
                takt: 0,
                param: {
                    jaeger: opt.jaeger !== false,
                    nutz: opt.nutz == null ? WOLF.nutz : opt.nutz,
                },
                K: new Float64Array(n),
                last: new Float64Array(n),
                frass: new Float64Array(n),
                beute: [],
                besitz: new Int32Array(n).fill(-1),
                frei: n,
                rudel: [],
                rudelZahl: 0,
                ereignis: null,
            };
            for (let i = 0; i < n; i++) {
                const rng = strom(saat, -1, 0, i, SAMEN);
                const list = [];
                const kopf = welt.land(i) ? VERBAND.beute[0] + Math.floor(rng() * (VERBAND.beute[1] - VERBAND.beute[0] + 1)) : 0;
                for (let j = 0; j < kopf; j++) list.push(gruenderTier("beute", indId(String(i), 0, j), rng, saat));
                z.beute.push(list);
            }
            if (z.param.jaeger) {
                const rng = strom(saat, -1, 1, 0, SAMEN);
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
                    const kopf = VERBAND.jaeger[0] + Math.floor(rng() * (VERBAND.jaeger[1] - VERBAND.jaeger[0] + 1));
                    for (let j = 0; j < kopf; j++) R.tiere.push(gruenderTier("jaeger", indId("r" + R.id, 0, j), rng, saat));
                }
                // Satz 7b: auch die Köpfe des Anfangs tragen ein Abwander-Alter (eigener Strom 5)
                for (const R of z.rudel) {
                    const ar = strom(saat, -1, 5, R.id, SAMEN);
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
                sattKg: 0, // Σ Sattheit aller Rudel (kg je Takt, Riss-brutto)
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
            if (!PUFFER.has(n)) PUFFER.set(n, { cum: new Float64Array(n), vw: new Float64Array(n), offen: new Uint8Array(n), marke: new Uint8Array(n), komp: new Int32Array(n), stapel: new Int32Array(n) });
            return PUFFER.get(n);
        }
        const LN_KITZ = Math.log(BEUTE.ueberlebenKitz);
        const LN_ADULT = Math.log(BEUTE.ueberlebenAdult);

        function schritt(z, saat, takt, welt) {
            if (takt !== z.takt) throw new Error("leben-core bestand: schritt(takt " + takt + ") am Zustand des Takts " + z.takt);
            const P = z.param;
            const n = z.W * z.H;
            const { n8 } = nachbarVon(z.W, z.H);
            const ev = (z.ereignis = neuEreignis());
            const tS = (takt + 1) * TAKT_S;
            const { cum, vw, offen, marke, komp, stapel } = puffer(n);
            const last = z.last;

            // 0 — das Alter, der Leib, die Reife, das erste Jahr; die Last des Reviers = Σ (kg ÷ M_Art)^¾
            const jaehr = [];
            for (let i = 0; i < n; i++) {
                const list = z.beute[i];
                let s = 0;
                for (let k = 0; k < list.length; k++) {
                    const t = list[k];
                    t.alterS += TAKT_S;
                    wachse(t);
                    if (!t.r && t.alterS >= t.reif) (t.r = true), ev.reifReh++;
                    if (!t.jl && t.alterS >= ZEIT.jahrS) (t.jl = true), ev.jaehrling++, jaehr.push(t, i);
                    s += t.k34;
                }
                last[i] = s / M34_ART.beute;
            }
            for (const R of z.rudel)
                for (const t of R.tiere) {
                    t.alterS += TAKT_S;
                    wachse(t);
                    if (!t.r && t.alterS >= t.reif) (t.r = true), ev.reifWolf++; // die Reife löst keine Abwanderung mehr aus (Satz 7b)
                }

            // 1 — das Futter: K je Revier liest der Kern vom Leser der Welt; der Fraß der Herde je kg^¾ geht als z.frass hinaus (der
            //     Wirt schreibt ihn in seine Welt); der freie Platz unter K (für die Wanderung)
            const K = z.K;
            let platz = 0;
            for (let i = 0; i < n; i++) {
                const k = welt.futter(i);
                if (!(k >= 0 && k < Infinity)) throw new Error("leben-core bestand: welt.futter(" + i + ") ist keine Tragfähigkeit (" + k + ")");
                K[i] = k;
                z.frass[i] = last[i] * FRASS_TAKT;
                if (welt.land(i) && K[i] > last[i]) platz += K[i] - last[i];
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
                    if (t.kg >= JAGD_KG) jaeger++, (verband += t.kg);
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
                    const list = z.beute[terr[k]];
                    let s = 0;
                    for (let q = 0; q < list.length; q++) if (list[q].kg <= lim) s += verwundbar(list[q]);
                    vw[k] = s;
                    tot += s;
                    koepfe += list.length;
                }
                const rng = strom(saat, takt, 4, R.id, SAMEN);
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
                    const list = z.beute[terr[k]];
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
                const list = z.beute[i];
                if (!list.length) continue;
                const rng = strom(saat, takt, 0, i, SAMEN);
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
                        // die Rate der Quelle × das Erbe-Gewicht der Mutter (leben-core: Wurf-Gewicht kg^−0,25 relativ zur Art × Eignung,
                        // jede Achse jenseits der Größe relativ zu ihrem Mittel: EIGNUNG_EICH, erbe-geburt)
                        const p = ((t.alterS < t.reif + ZEIT.jahrS ? rJ : rA) * t.eig * EIGNUNG_EICH * t.Mw) / t.ww;
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
                            for (const y of n8[i]) for (const t of z.beute[y]) if (t.r && !t.w) kand.push(t);
                            va = zug(kand, (t) => t.eig, rng);
                        }
                        if (!va) {
                            ev.vaterlos++;
                            continue;
                        }
                        const id = indId(String(i), tS, j++);
                        const ax = adresse(saat, takt, id);
                        const a = kind(mu.a, va.a, normale(rng, ax), normale(rng, ax), normale(rng, ax));
                        const t = tier("beute", id, a, umwelt(normale(rng, ax)), mu.id, 0, rng() < BEUTE.weiblich);
                        list.push(t);
                        ev.geburt.push(t);
                    }
                }
            }

            // 4 — das Rudel (Satz 4, zweite Fassung): die Deckung D = Riss ÷ Erhaltung über das letzte Jahr (gleitend, FENSTER Takte);
            //     Überleben je Kopf stetig in D (Welpe im ersten Jahr · ab einem Jahr), das Jahres-Überleben als Wurzel je Takt;
            //     das Alter am Lebens-Ende (bleibt); der EINE Wurf je Jahr: Anteil der Würfe und Welpen je Wurf stetig in D
            for (const R of z.rudel) {
                const rng = strom(saat, takt, 1, R.id, SAMEN);
                R.fRiss.push(R.riss);
                R.fErh.push(R.erh);
                if (R.fRiss.length > FENSTER) R.fRiss.shift(), R.fErh.shift();
                let [sRiss, sErh] = [0, 0];
                for (let k = 0; k < R.fRiss.length; k++) (sRiss += R.fRiss[k]), (sErh += R.fErh[k]);
                const D = sErh > 0 ? sRiss / sErh : 0;
                R.deck = D;
                const pWelpe = 1 - Math.pow(ankerZJ("welpeJaehrling", D), 1 / TJ);
                const pAb1 = 1 - Math.pow(ankerZJ("ueberleben", D), 1 / TJ);
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
                    else if (!(rng() < ankerZJ("faehen", D))) ev.ohneWurf++;
                    else {
                        ev.wurfWolf++;
                        const w = ankerZJ("welpen", D);
                        let welpen = Math.floor(w);
                        if (rng() < w - welpen) welpen++;
                        const ar = strom(saat, takt, 5, R.id, SAMEN); // Satz 7b: das Abwander-Alter je Welpe, einmal aus der Saat (eigener Strom)
                        for (let k = 0; k < welpen; k++) {
                            const mu = zug(reife, mutterW, rng);
                            const va = zug(reife, (t) => (t === mu ? 0 : t.eig), rng);
                            const id = indId("r" + R.id, tS, k);
                            const ax = adresse(saat, takt, id);
                            const a = kind(mu.a, va.a, normale(rng, ax), normale(rng, ax), normale(rng, ax));
                            const t = tier("jaeger", id, a, umwelt(normale(rng, ax)), mu.id, 0, rng() < BEUTE.weiblich);
                            t.ab = abwanderAlter(ar);
                            R.tiere.push(t);
                            ev.geburt.push(t);
                        }
                    }
                }
            }

            // 5 — die Abwanderung der Beute im Jährlings-Jahr: Bock 0,80 · Kuh 0,13; Ziel nach dem freien Platz unter K
            if (jaehr.length) {
                const rng = strom(saat, takt, 2, 0, SAMEN);
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
                            for (let j = 0; j < n; j++) if (welt.land(j)) habitat.push(j);
                        }
                        nach = habitat[Math.floor(rng() * habitat.length)];
                    }
                    if (nach === i) continue;
                    const list = z.beute[i];
                    list.splice(list.indexOf(t), 1);
                    z.beute[nach].push(t);
                    ev.zug.push({ t, von: i, nach, art: "reh" });
                }
            }

            // 6 — die Abwanderung des Wolfs (Satz 7b, 7c): wer sein Abwander-Alter erreicht hat und nicht zum Paar gehört (die zwei
            //     ältesten Köpfe des Rudels — das Paar wandert nie), SUCHT in jedem Takt, bis er geht:
            //       (1) er füllt die leere Stelle des nächsten Rudels ohne Paar (weniger als zwei Reife — die Paar-Regel des Wurfs);
            //           Beitritt vor Gründung (Satz 7d — das Paar kommt vor dem Land): EIN Kopf gründet, der nächste Sucher macht das Paar;
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
            //     Land an seiner Grenze (Satz 7a); ein Rudel unter dem Deckel begeht das freie Land an seiner Grenze;
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

        // ── DER GAU (C2a) — der Bestand über EINEM Feld der Welt, mit Fraß-Schicht und Akten: STAND, nie Cache ──────────────────────
        // Ein Gau g = { feld, saat, z, O, Kap, aktN, leser } ist eine Funktion von (Samen, Feld, Takt, Akte): `feld` ist das Feld
        // der Welt, EINMAL je Gau gebaut (gauFeld: je Revier `wirt.feld.zellen` Zellen, S = Substrat der Äsung 0..1, LR = Lebensraum
        // der Beute, 0 = keine Zelle der Beute); `O` ist die Fraß-Schicht je Zelle (Feld-Einheiten, ≤ 0 abgeäst; sie zerfällt je Takt
        // zum Substrat zurück); `aktN` zählt die Akte, die schon wirkten. Der Wirt reicht das Feld-Gesetz als `wirt.feld`:
        //   { zellen, zerfallJeS, epsilon, kahl, max, kopfJeHa, kZelle(aesung, lr) → Köpfe-Maß der Zelle } (K = kopfJeHa × Σ kZelle)
        // Die Äsung einer Zelle = klemme(S + O, 0, 1). Ein Takt des Gaus (gauSchritt): Zerfall und K (feldTakt) → schritt → Fraß
        // (feldAesen). Ein AKT trägt den Takt, an dem er wirkt (akt): „aus“ — ein Kopf fällt; „ein“ — ein Kopf tritt ein.
        const FELD = wirt.feld || null;
        if (FELD) {
            if (!(Number.isInteger(FELD.zellen) && FELD.zellen > 0) || typeof FELD.kZelle !== "function") throw new Error("leben-core bestand: wirt.feld nennt zellen und kZelle(aesung, lr)");
            for (const f of ["zerfallJeS", "epsilon", "kahl", "max", "kopfJeHa"]) zahl(FELD[f], "wirt.feld." + f);
        }
        const feldGesetz = () => {
            if (!FELD) throw new Error("leben-core bestand: ein Gau braucht das Feld-Gesetz des Wirts (wirt.feld)");
            return FELD;
        };
        const ZERFALL = FELD ? Math.exp(-FELD.zerfallJeS * TAKT_S) : NaN;
        const aesVon = (s, o) => Math.min(1, Math.max(0, s + o));
        const JE = new Float64Array(FELD ? FELD.zellen : 0);
        // das Feld eines Gaus aus den Zellen der Welt: { W, H, S, LR } (Float64Array, W·H·zellen) → eingefroren, mit C = Zellen der Beute je Revier
        function gauFeld(d) {
            const Z = feldGesetz().zellen;
            const { W, H, S, LR } = d || {};
            if (!(Number.isInteger(W) && W > 0 && Number.isInteger(H) && H > 0)) throw new Error("leben-core bestand: gauFeld ohne Raster W × H");
            const n = W * H;
            if (!(S instanceof Float64Array) || !(LR instanceof Float64Array) || S.length !== n * Z || LR.length !== n * Z) throw new Error("leben-core bestand: gauFeld braucht S und LR als Float64Array der Länge W·H·" + Z);
            const C = new Uint8Array(n);
            for (let j = 0; j < n * Z; j++) if (LR[j] > 0) C[(j / Z) | 0]++;
            return Object.freeze({ W, H, Z, S, LR, C });
        }
        // der Zerfall der Fraß-Schicht um einen Takt und K je Revier (Köpfe der Beute) an der Äsung des Augenblicks
        function feldTakt(F, O, Kap) {
            const { Z, S, LR, C } = F;
            const n = F.W * F.H;
            for (let i = 0; i < n; i++) {
                const b = i * Z;
                let summe = 0;
                if (C[i])
                    for (let c = 0; c < Z; c++) {
                        const lr = LR[b + c];
                        if (!(lr > 0)) continue;
                        let o = O[b + c] * ZERFALL;
                        if (Math.abs(o) < FELD.epsilon) o = 0;
                        O[b + c] = o;
                        summe += FELD.kZelle(aesVon(S[b + c], o), lr);
                    }
                Kap[i] = FELD.kopfJeHa * summe;
            }
        }
        // der Fraß des Takts (z.frass je Revier, Feld-Einheiten) in die Schicht: je Zelle nach ihrem Anteil Lebensraum × Äsung
        function feldAesen(F, O, frass) {
            const { Z, S, LR, C } = F;
            const n = F.W * F.H;
            for (let i = 0; i < n; i++) {
                const fr = frass[i];
                if (!(fr > 0) || !C[i]) continue;
                const b = i * Z;
                let jeSumme = 0;
                for (let c = 0; c < Z; c++) jeSumme += JE[c] = LR[b + c] > 0 ? LR[b + c] * aesVon(S[b + c], O[b + c]) : 0;
                if (jeSumme > 0)
                    for (let c = 0; c < Z; c++)
                        if (JE[c] > 0) O[b + c] = Math.max(FELD.kahl, Math.min(FELD.max, O[b + c] - (fr * JE[c]) / jeSumme));
            }
        }
        function gauLeer(F, saat) {
            const n = F.W * F.H;
            const g = { feld: F, saat, z: null, O: new Float64Array(n * F.Z), Kap: new Float64Array(n), aktN: 0, leser: null };
            g.leser = { land: (i) => F.C[i] > 0, futter: (i) => g.Kap[i] };
            return g;
        }
        // der Gau am Takt 0: der volle Gründer-Bestand (anfang), die Fraß-Schicht leer
        function gauAnfang(F, saat, opt) {
            const g = gauLeer(F, saat);
            g.z = anfang({ W: F.W, H: F.H, saat, jaeger: opt ? opt.jaeger : undefined, nutz: opt ? opt.nutz : undefined }, g.leser);
            return g;
        }
        function gauSchritt(g) {
            feldTakt(g.feld, g.O, g.Kap);
            g.z = schritt(g.z, g.saat, g.z.takt, g.leser);
            feldAesen(g.feld, g.O, g.z.frass);
            return g;
        }
        // DER AKT (E2) — die EINE Eingabe der Seite in den Gau, mit Takt-Stempel: er wirkt am Zustand SEINES Takts (sonst Wurf).
        //   { takt, art: "aus", id }                                         ein Kopf fällt (außerhalb des Gesetzes: Kampf, Spieler)
        //   { takt, art: "ein", g: "beute" | "jaeger", revier, id, a, e, alterS, m?, w? }   ein Kopf tritt ein (Annahme eines Leibs)
        // → true, wenn er wirkte; false, wenn der Kopf nicht (mehr) steht bzw. die Kennung schon steht (das Gesetz kam zuvor).
        // Ein Jäger tritt in das Rudel, dem das Revier gehört; ist es frei, gründet er dort (wie Satz 7c: EIN Kopf gründet). Was der
        // Akt nicht nennt, zieht er aus dem Strom des Akts (Art 6, an Saat, Takt und Kennung verankert): Geschlecht, Abwander-Alter.
        function kennZahl(s) {
            let h = 2166136261;
            for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
            return h | 0;
        }
        function kopfOrt(z, id) {
            for (let i = 0; i < z.beute.length; i++) {
                const list = z.beute[i];
                for (let k = 0; k < list.length; k++) if (list[k].id === id) return { list, k };
            }
            for (const R of z.rudel) for (let k = 0; k < R.tiere.length; k++) if (R.tiere[k].id === id) return { list: R.tiere, k };
            return null;
        }
        function akt(g, a) {
            const z = g.z;
            if (!a || a.takt !== z.takt) throw new Error("leben-core bestand: der Akt trägt den Takt " + (a && a.takt) + ", der Gau steht am Takt " + z.takt);
            if (typeof a.id !== "string" || !a.id) throw new Error("leben-core bestand: ein Akt ohne Kennung");
            const ort = kopfOrt(z, a.id);
            if (a.art === "aus") {
                if (!ort) return false;
                ort.list.splice(ort.k, 1); // ein Rudel ohne Köpfe gibt sein Revier am Ende des nächsten Takts frei (schritt, 7)
                return true;
            }
            if (a.art !== "ein") throw new Error("leben-core bestand: der Akt kennt die Art „" + a.art + "“ nicht");
            if (ort) return false;
            if (a.g !== "beute" && a.g !== "jaeger") throw new Error("leben-core bestand: „ein“ nennt beute oder jaeger");
            if (!(Number.isInteger(a.revier) && a.revier >= 0 && a.revier < z.W * z.H)) throw new Error("leben-core bestand: „ein“ ohne Revier des Gaus (" + a.revier + ")");
            if (!(zahl(a.alterS, "akt.alterS") >= 0)) throw new Error("leben-core bestand: „ein“ mit negativem Alter");
            const rng = strom(g.saat, z.takt, 6, kennZahl(a.id), SAMEN);
            const u = rng();
            // das Erbe des Akts: ein Akt eines Stands von vor der zweiten Achse trägt eine Stelle (`erbeVoll`, die Wandlung)
            const t = tier(a.g, a.id, erbeVoll(a.a, "akt.a"), erbeVoll(a.e, "akt.e"), a.m == null ? null : String(a.m), a.alterS, typeof a.w === "boolean" ? a.w : u < BEUTE.weiblich);
            if (a.g === "beute") return z.beute[a.revier].push(t), true;
            t.ab = abwanderAlter(rng);
            let R = z.besitz[a.revier] >= 0 ? z.rudel.find((r) => r.id === z.besitz[a.revier]) : null;
            if (!R) (R = rudelNeu(z, [a.revier], a.revier, z.takt + TJ)), z.frei--;
            R.tiere.push(t);
            return true;
        }
        // der Gau bis zum Takt `takt`, mit den Akten `akte` (nach Takt geordnet, nur angehängt — dieselbe Liste bei jedem Ruf): jeder
        // Akt wirkt GENAU EINMAL am Zustand seines Takts. Ein Akt vor dem Stand des Gaus wirft: der Wirt rechnet ab einem Stand davor.
        function gauBis(g, takt, akte) {
            const A = akte || [];
            if (!(Number.isInteger(takt) && takt >= g.z.takt)) throw new Error("leben-core bestand: gauBis(" + takt + ") am Gau des Takts " + g.z.takt);
            for (let k = 1; k < A.length; k++) if (A[k].takt < A[k - 1].takt) throw new Error("leben-core bestand: die Akte sind nicht nach Takt geordnet");
            if (g.aktN > A.length) throw new Error("leben-core bestand: der Gau kennt " + g.aktN + " Akte, gereicht sind " + A.length);
            const wirke = () => {
                for (; g.aktN < A.length && A[g.aktN].takt <= g.z.takt; g.aktN++) akt(g, A[g.aktN]);
            };
            wirke();
            while (g.z.takt < takt) gauSchritt(g), wirke();
            return g;
        }
        // ── DIE LESER (die Naht des Stamms) ─────────────────────────────────────────────────────────────────────────────────────────
        // Köpfe im Revier i: die Beute des Reviers; die Jäger der Rudel, deren `ort` (der Ort des letzten Risses, Satz 3) das Revier
        // ist; `rudel` = die Kennung des Rudels, dem das Revier gehört (−1 = frei)
        function koepfe(z, i) {
            let jaeger = 0;
            for (const R of z.rudel) if (R.ort === i) jaeger += R.tiere.length;
            return { beute: z.beute[i].length, jaeger, rudel: z.besitz[i] };
        }
        // die Tiere im Revier i als reine Daten: der Verband `v` der Beute ist ihr Revier ("b" + i), der des Jägers sein Rudel
        // ("r" + Kennung); `m` die Mutter (null = Gründer oder angenommen), `kg` der Leib am Takt, `M` die Masse erwachsen
        function tiereIn(z, i) {
            const zeile = (t, v) => ({ id: t.id, g: t.g, v, m: t.m, w: t.w, alterS: t.alterS, kg: t.kg, M: t.M, r: t.r, a: t.a, e: t.e });
            const aus = z.beute[i].map((t) => zeile(t, "b" + i));
            for (const R of z.rudel) if (R.ort === i) for (const t of R.tiere) aus.push(zeile(t, "r" + R.id));
            return aus;
        }
        // der Fraß der Zelle c des Reviers i am Takt des Gaus (Feld-Einheiten, wie das Leben-Overlay des Wirts: ≤ 0 abgeäst)
        const frassAm = (g, i, c) => g.O[i * g.feld.Z + c];
        // ── DER STAND: der Gau als reines Datum (Uint8Array: Kopf-Zeile JSON · Float64 · Int32) ─────────────────────────────────────
        // Je Kopf reisen Kennung, Mutter, Alter, Erbe a, Umwelt e, Geschlecht, Reife, Jahr (und das Abwander-Alter des Jägers); der
        // Leib und alle Raten sind Funktion davon (tier). Die Fraß-Schicht reist nur an den Zellen der Beute. K, Last und Fraß des
        // letzten Takts reisen nicht: der nächste Schritt schreibt sie, bevor er sie liest.
        const ID_FORM = /^(r?)(\d+):(\d+):(\d+)$/;
        function gauPack(g) {
            const z = g.z;
            const n = z.W * z.H;
            const [namen, nameVon, I, D] = [[], new Map(), [], []];
            const kennung = (id, bits) => {
                if (id == null) return void I.push(0, -2, bits);
                const m = ID_FORM.exec(id);
                if (m) {
                    const [key, tk, j] = [Number(m[2]), Number(m[3]) / TAKT_S, Number(m[4])];
                    if (Number.isInteger(tk) && tk < 2147483648 && key < 2147483647 && j < 134217728 && indId(m[1] + key, tk * TAKT_S, j) === id)
                        return void I.push(m[1] ? -(key + 1) : key, tk, j * 8 + bits);
                }
                if (!nameVon.has(id)) nameVon.set(id, namen.push(id) - 1);
                I.push(nameVon.get(id), -1, bits);
            };
            const kopf = (t) => {
                kennung(t.id, (t.w ? 1 : 0) | (t.r ? 2 : 0) | (t.jl ? 4 : 0));
                kennung(t.m, 0);
                D.push(t.alterS);
                for (let k = 0; k < ACHSEN; k++) D.push(t.a[k]);
                for (let k = 0; k < ACHSEN; k++) D.push(t.e[k]);
                if (t.g === "jaeger") D.push(t.ab);
            };
            for (let i = 0; i < n; i++) I.push(z.besitz[i]);
            for (let i = 0; i < n; i++) {
                I.push(z.beute[i].length);
                for (const t of z.beute[i]) kopf(t);
            }
            const rudel = z.rudel.map((R) => {
                const { reviere, tiere, fRiss, fErh, ...zahlen } = R;
                for (const x of reviere) I.push(x);
                for (const t of tiere) kopf(t);
                for (const x of fRiss) D.push(x);
                for (const x of fErh) D.push(x);
                return Object.assign(zahlen, { nR: reviere.length, nT: tiere.length, nF: fRiss.length });
            });
            const LR = g.feld.LR;
            for (let j = 0; j < LR.length; j++) if (LR[j] > 0) D.push(g.O[j]);
            const zeile = new TextEncoder().encode(
                JSON.stringify({ v: 1, W: z.W, H: z.H, takt: z.takt, saat: g.saat, aktN: g.aktN, param: z.param, frei: z.frei, rudelZahl: z.rudelZahl, namen, rudel, nD: D.length, nI: I.length, achsen: ACHSEN })
            );
            const ab = (8 + zeile.length + 7) & ~7;
            const aus = new Uint8Array(ab + D.length * 8 + I.length * 4);
            new DataView(aus.buffer).setUint32(0, zeile.length, true);
            aus.set(zeile, 8);
            new Float64Array(aus.buffer, ab, D.length).set(D);
            new Int32Array(aus.buffer, ab + D.length * 8, I.length).set(I);
            return aus;
        }
        function gauEntpack(bytes, F) {
            if (!(bytes instanceof Uint8Array) || bytes.length < 8) throw new Error("leben-core bestand: gauEntpack braucht den Stand als Uint8Array");
            const lang = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
            const ab = (8 + lang + 7) & ~7;
            if (ab > bytes.length) throw new Error("leben-core bestand: der Stand des Gaus ist abgeschnitten");
            const K0 = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + lang)));
            if (K0.v !== 1 || K0.W !== F.W || K0.H !== F.H) throw new Error("leben-core bestand: der Stand (v " + K0.v + ", " + K0.W + " × " + K0.H + ") gehört nicht zu diesem Feld");
            if (bytes.length !== ab + K0.nD * 8 + K0.nI * 4) throw new Error("leben-core bestand: der Stand des Gaus trägt " + bytes.length + " Bytes, sein Kopf nennt " + (ab + K0.nD * 8 + K0.nI * 4));
            // DIE ACHSEN DES STANDS (erbe-geburt): ein Stand von vor der zweiten Achse trägt keine Zahl `achsen` und je Kopf EINE Achse;
            // die Achsen, die er nicht kennt, liest er als das Art-Mittel (a = e = 0) — benannt, nie still; mehr Achsen als das Gesetz
            // bricht laut
            const NA = K0.achsen == null ? 1 : K0.achsen;
            if (!(Number.isInteger(NA) && NA >= 1 && NA <= ACHSEN)) throw new Error("leben-core bestand: der Stand trägt " + NA + " Achsen des Erbes, das Gesetz " + ACHSEN);
            const roh = bytes.buffer.slice(bytes.byteOffset + ab, bytes.byteOffset + bytes.length);
            const [D, I] = [new Float64Array(roh, 0, K0.nD), new Int32Array(roh, K0.nD * 8, K0.nI)];
            let [d, i] = [0, 0];
            const kennung = () => {
                const [k, t, j] = [I[i++], I[i++], I[i++]];
                return { id: t === -2 ? null : t === -1 ? K0.namen[k] : indId(k < 0 ? "r" + (-k - 1) : String(k), t * TAKT_S, j >> 3), bits: j & 7 };
            };
            const kopf = (art) => {
                const [ich, mutter, alterS] = [kennung(), kennung().id, D[d++]];
                const a = erbeVoll(Array.from(D.subarray(d, (d += NA))), "stand.a");
                const e = erbeVoll(Array.from(D.subarray(d, (d += NA))), "stand.e");
                const t = tier(art, ich.id, a, e, mutter, alterS, !!(ich.bits & 1));
                [t.r, t.jl] = [!!(ich.bits & 2), !!(ich.bits & 4)];
                if (art === "jaeger") t.ab = D[d++];
                return t;
            };
            const n = F.W * F.H;
            const g = gauLeer(F, K0.saat);
            g.aktN = K0.aktN;
            const z = (g.z = { W: F.W, H: F.H, takt: K0.takt, param: K0.param, K: new Float64Array(n), last: new Float64Array(n), frass: new Float64Array(n), beute: [], besitz: new Int32Array(n), frei: K0.frei, rudel: [], rudelZahl: K0.rudelZahl, ereignis: null });
            for (let x = 0; x < n; x++) z.besitz[x] = I[i++];
            for (let x = 0; x < n; x++) {
                const list = [];
                for (let c = I[i++]; c > 0; c--) list.push(kopf("beute"));
                z.beute.push(list);
            }
            for (const r of K0.rudel) {
                const { nR, nT, nF, ...zahlen } = r;
                const R = Object.assign(zahlen, { reviere: [], tiere: [], fRiss: [], fErh: [] });
                for (let c = 0; c < nR; c++) R.reviere.push(I[i++]);
                for (let c = 0; c < nT; c++) R.tiere.push(kopf("jaeger"));
                for (let c = 0; c < nF; c++) R.fRiss.push(D[d++]);
                for (let c = 0; c < nF; c++) R.fErh.push(D[d++]);
                z.rudel.push(R);
            }
            for (let j = 0; j < F.LR.length; j++) if (F.LR[j] > 0) g.O[j] = D[d++];
            if (d !== K0.nD || i !== K0.nI) throw new Error("leben-core bestand: der Stand des Gaus geht nicht auf (" + d + " von " + K0.nD + " Zahlen, " + i + " von " + K0.nI + " Ganzzahlen)");
            return g;
        }
        return Object.freeze({ ZEIT, RAUM, FENSTER, anfang, schritt, klon, verwundbar, bedarfVon, gauFeld, feldTakt, feldAesen, gauAnfang, gauSchritt, gauBis, akt, koepfe, tiereIn, frassAm, gauPack, gauEntpack });
    }

    // ── SELBSTTEST — der Prüf-Strom ist der gereichte Strom der Welt (`samen`, samen-core `samenStrom`) an fester Saat ──────
    function selbsttest(samen) {
        if (typeof samen !== "function") throw new Error("leben-core selbsttest: es fehlt der Strom (samen)");
        const u = samen(0x1eb3e);
        const nv = () => {
            const n = new Array(ACHSEN);
            for (let i = 0; i < ACHSEN; i++) n[i] = normal(u(), u());
            return n;
        };
        // 10⁵ Paare: die Streuung der Steigung ist 0,013 bei 10⁴ Paaren (gemessen über 200 Saaten, 12 % außerhalb ±0,02) —
        // bei 10⁵ ist sie 0,004, das Band ±0,02 liegt bei ~5σ.
        const PAARE = 100000;
        // Eltern-Kind-Regression des Phänotyps lnM = a + e (Mbar = 1): Steigung Kind auf Eltern-Mittel = h2 — je Achse (`name`,
        // erbe-geburt: die Scheu am Maß `merkmal` wie die Größe an masseAdult)
        const regression = (zeuge, name) => {
            const p = name === "lnM" ? (a, e) => Math.log(masseAdult(1, a, e)) : (a, e) => Math.log(merkmal(1, a, e, name));
            let sx = 0, sy = 0, sxx = 0, sxy = 0;
            for (let k = 0; k < PAARE; k++) {
                const aM = gruender(nv()), aV = gruender(nv());
                const pM = p(aM, umwelt(nv()));
                const pV = p(aV, umwelt(nv()));
                const pK = p(zeuge(aM, aV), umwelt(nv()));
                const x = (pM + pV) / 2;
                sx += x; sy += pK; sxx += x * x; sxy += x * pK;
            }
            return (sxy - (sx * sy) / PAARE) / (sxx - (sx * sx) / PAARE);
        };
        const steigung = regression((aM, aV) => kind(aM, aV, nv(), nv(), nv()), "lnM");
        const steigungAus = regression(() => gruender(nv()), "lnM");
        const steigungScheu = regression((aM, aV) => kind(aM, aV, nv(), nv(), nv()), "scheu");
        // die Auslese der Scheu: das Art-Mittel wiegt 1, wer doppelt so weit flieht, halb so viel (scheuFang 1)
        const fang = [fangGewicht([0, 0], [0, 0]), fangGewicht([0, Math.LN2], [0, 0])];
        // DAS KIND ZWISCHEN DEN ELTERN (erbe-geburt): je Achse liegt es um das Eltern-Mittel mit der Varianz VA/2 + V_M (Segregation
        // und Mutation, nichts sonst — 2·10⁴ Kinder, ±5 % ≈ 5σ); gleiche Saat → gleiches Kind, Bit für Bit, eine andere Saat ein anderes
        const KINDER = 20000;
        const streuKind = new Array(ACHSEN).fill(0);
        for (let k = 0; k < KINDER; k++) {
            const aM = gruender(nv()), aV = gruender(nv());
            const a = kind(aM, aV, nv(), nv(), nv());
            for (let i = 0; i < ACHSEN; i++) streuKind[i] += (a[i] - (aM[i] + aV[i]) / 2) ** 2 / KINDER;
        }
        const zwischen = streuKind.every((v, i) => Math.abs(v / (VA[i] / 2 + G.vmJeVE * VE[i]) - 1) <= 0.05);
        // DIE EICHUNG DER RATE (erbe-geburt): die mittlere Eignung über JEDE Achse × EIGNUNG_EICH ist die mittlere Eignung der Größe
        // allein — eine neue Achse rückt das Mittel der Rate nicht (2·10⁴ Phänotypen P ~ N(0, sdP²), ±0,5 % ≈ 10σ; ohne die Eichung
        // 0,953)
        let [wAlle, wGross] = [0, 0];
        for (let k = 0; k < KINDER; k++) {
            const n = nv();
            const P = G.achsen.map((x, i) => x.sdP * n[i]);
            wAlle += eignung(P) * EIGNUNG_EICH;
            wGross += eignung(G.achsen.map((x, i) => (i === LN_M ? P[i] : 0)));
        }
        const eichung = wAlle / wGross;
        const kindDer = (s) => {
            const w = samen(s);
            const n = () => G.achsen.map(() => normal(w(), w()));
            return kind(gruender(n()), gruender(n()), n(), n(), n());
        };
        const saatGleich = kindDer(7).every((x, i) => x === kindDer(7)[i]) && kindDer(7).some((x, i) => x !== kindDer(8)[i]);
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
        // die Annahme eines gemessenen Leibs trifft seinen Phänotyp (a + e = P), der Zuchtwert ist sein h²-Anteil
        const leib = erbeAusLeib(G.achsen.map((x, i) => (i === LN_M ? 0.37 : 0)));
        if (Math.abs(leib.a[LN_M] + leib.e[LN_M] - 0.37) > 1e-12 || Math.abs(leib.a[LN_M] - G.achsen[LN_M].h2 * 0.37) > 1e-12)
            reifeTreffer = false;
        const lebenWolf = lebensdauerS(64);
        // das Streifgebiet trifft die Telemetrie (Lindstedt et al. 1986, Tab. 1, je Art das geometrische Mittel ihrer Zeilen): der
        // Wolf 39 kg 6 226 ha, der Rotfuchs 5,23 kg 959 ha — die Fläche des Gesetzes π·r² auf Faktor 2
        const streifTelemetrie = [[39, 6226], [5.23, 959]].map(([kg, ha]) => (Math.PI * Math.pow(streifRadiusM(kg, "fleisch"), 2)) / 1e4 / ha);
        // die Anker-Tafel des Satzes 4: an den Ankern die Werte, dazwischen linear, außerhalb gehalten
        let ankerTreffer = true;
        for (const [f, D, soll] of [["ueberleben", 0.6, 0.49], ["ueberleben", 0.2, 0.49], ["ueberleben", 1.05, 0.66], ["ueberleben", 1.275, 0.755], ["ueberleben", 3, 0.85], ["welpeJaehrling", 0.825, 0.18], ["welpen", 0.825, 5.15], ["faehen", 1.5, 0.96]])
            if (Math.abs(anker(f, D) - soll) > 1e-12) ankerTreffer = false;
        const h2 = G.achsen[LN_M].h2;
        const fehl = [];
        if (!(Math.abs(steigung - h2) <= 0.02)) fehl.push("steigung " + steigung);
        if (!(Math.abs(steigungAus) <= 0.02)) fehl.push("steigungAus " + steigungAus);
        if (!(Math.abs(steigungScheu - G.achsen[SCHEU].h2) <= 0.02)) fehl.push("steigungScheu " + steigungScheu);
        if (!(fang[0] === 1 && Math.abs(fang[1] - Math.pow(2, -G.scheuFang)) <= 1e-12)) fehl.push("fang " + fang.join(" "));
        if (!zwischen) fehl.push("zwischen " + streuKind.join(" "));
        if (!saatGleich) fehl.push("saatGleich");
        if (!(Math.abs(eichung - 1) <= 0.005)) fehl.push("eichung " + eichung);
        if (!masseMonoton) fehl.push("masseMonoton");
        if (!reifeTreffer) fehl.push("reifeTreffer");
        if (!ankerTreffer) fehl.push("ankerTreffer");
        if (!(Math.abs(lebenWolf - G.refS) <= 1e-9)) fehl.push("lebenWolf " + lebenWolf);
        if (!streifTelemetrie.every((f) => f >= 0.5 && f <= 2)) fehl.push("streifTelemetrie " + streifTelemetrie.join(" "));
        if (fehl.length) throw new Error("leben-core selbsttest ROT: " + fehl.join(" · "));
        return { steigung, steigungAus, steigungScheu, streuKind, saatGleich, eichung, masseMonoton, reifeTreffer, lebenWolf, streifTelemetrie };
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
        streifRadiusM: streifRadiusM,
        tau: tau,
        masseZurZeit: masseZurZeit,
        reifeS: reifeS,
        alterZurMasse: alterZurMasse,
        erbeAusLeib: erbeAusLeib,
        fastenRang: fastenRang,
        rissGewicht: rissGewicht,
        wurfGewicht: wurfGewicht,
        eignung: eignung,
        spanne: spanne,
        achse: achse,
        merkmal: merkmal,
        fangGewicht: fangGewicht,
        erbeVoll: erbeVoll,
        normale: normale,
        artId: artId,
        indId: indId,
        zeitJagd: zeitJagd,
        anker: anker,
        strom: strom,
        bestand: bestand,
        selbsttest: selbsttest,
    });
    root.__lebenCore = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
