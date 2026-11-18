class AnazhRealm_kreatur_erbe {
    // ===== ATLAS · Kreatur/erbe — Das Gesetz des Lebens am Tier (leben-core): Erbe · Leib über das Alter · Auslese nach dem Leib · Spanne =====
    // ═══ DAS GESETZ DES LEBENS am Bestand (leben-core `__lebenCore`, Welle leben-erbe) ═══
    // Ein Tier des Bestands ist eine ADRESSE (`id` = `indId(Region, Welt-Takt der Geburt, Lauf-Nummer)`), trägt ein ERBE (`a`, der
    // Zuchtwert-Vektor aus Mutter und Vater, `m` = die Mutter) und sein Leib ist PHYSIK seines Erbes über das Alter: M∞ =
    // masseAdult(M_guss, a, e), die Masse zur Zeit masseZurZeit(M∞, alterS), die Skala des Gusses bs = (m / M_guss)^⅓. Gespeichert
    // wird nur {id, soul, g, a, e, m, alterS, x, z, v}: e (die Umwelt-Streuung, nie vererbt) zieht die Geburt aus dem Strom ihres
    // Takts (Saat, Region, Zeit) und trägt sie wie a — bis zur Heilung von leben-erbe war e eine Funktion der Kennung ohne die
    // Saat der Welt (jede junge Welt trug dieselben ersten Tiere), und der angenommene Leib musste a = −e tragen. Masse, Größe und
    // Temperament sind Ableitung. Den Kern liest der EINE Leser `AnazhRealm._lebenKern()` (fail-closed), den Gründer einer
    // Kennung `_erbeGruender`.
    // Normalverteilte je Achse des Erbes aus dem Strom eines Takts (`rng`: Gleichverteilte u ∈ [0, 1), zwei je Achse).
    _lebenNormale(rng) {
        const L = AnazhRealm._lebenKern();
        return L.gesetz().achsen.map(() => L.normal(rng(), rng()));
    }
    // DAS ERBE ALS LEIB ohne das Alter: M∞, Lebensdauer und Reife (je Datensatz einmal, solange Kennung, Gattung und Erbe stehen).
    _bestandErbe(t) {
        const W = this._bestandLebenMemo || (this._bestandLebenMemo = new WeakMap());
        let e = W.get(t);
        if (!e || e.a !== t.a || e.e !== t.e || e.g !== t.g) {
            const L = AnazhRealm._lebenKern();
            const M = L.masseAdult(this._gattungKg(t.g), t.a, t.e);
            e = {
                a: t.a,
                e: t.e,
                g: t.g,
                M,
                tod: L.lebensdauerS(M),
                reif: L.reifeS(M),
                alter: NaN,
                kg: 0,
                wild: null,
            };
            W.set(t, e);
        }
        return e;
    }
    // DIE MASSE DES ERWACHSENEN (M∞, kg) eines Tiers des Bestands: masseAdult(M_guss, a, e) — sein Erbe, ohne das Alter.
    _bestandMasseAdult(t) {
        return this._bestandErbe(t).M;
    }
    // DIE MASSE EINES TIERS DES BESTANDS (kg — die EINE Masse des Leibs, ohne Leib): sein Leib über das Alter (`_bestandLeben`);
    // sein Temperament daraus wie am Leib (`_creatureTemperament`) — der Welpe ist „scheu“, ab dem Wachstum „wild“: je Takt geurteilt.
    _bestandKg(t) {
        return this._bestandLeben(t).kg;
    }
    // DIE GRÖSSE (bs, die Skala des Gusses) eines Tiers des Bestands zur Zeit seines Alters: (m / M_guss)^⅓.
    _bestandBs(t) {
        return Math.cbrt(this._bestandKg(t) / this._gattungKg(t.g));
    }
    // DAS ERBE UND DAS ALTER EINES GEZEICHNETEN LEIBS OHNE HERKUNFT (die Annahme, `_bestandAdoptieren`): sein Leib ist gemessen,
    // seine Geschichte nicht. Ein ausgewachsener Leib (bs ≥ 1 − `LEIB_WUCHS_TOLERANZ`) trägt den Phänotyp P = ln(bs³) — der Boot-Leib
    // das Art-Mittel (P = 0), ein Leib nach dem Größen-Hauch seine Größe — und daraus Zuchtwert und Umwelt-Streuung als ihren
    // Erwartungswert (`__lebenCore.erbeAusLeib`: a = h²·P, e = (1 − h²)·P, a + e = P: kein Sprung, und der Leib vererbt nur seinen
    // h²-Anteil); sein Alter ist, wie die Grenze des Wachstums sagt, oder älter, wenn er es schon trug. Ein kleinerer Leib ist ein
    // junges Tier des Art-Mittels (P = 0), so alt, wie seine Masse sagt (`alterZurMasse`), und wächst weiter. Ein Leib ohne
    // gültige Größe bricht laut. Bis zur Heilung von leben-erbe trug der Angenommene a = −e seiner Kennung (die Umwelt-Streuung
    // als Erbe in der Linie), und ein Hauch-Leib schrumpfte bei der Annahme auf das Art-Mittel.
    _bestandErbeAusLeib(t, bs, alterS) {
        if (!(Number.isFinite(bs) && bs > 0))
            throw new Error("leben: der Leib " + t.id + " trägt keine Größe (" + bs + ")");
        const L = AnazhRealm._lebenKern();
        const tol = (1 - AnazhRealm.LEIB_WUCHS_TOLERANZ) ** 3;
        const [Mbar, m] = [this._gattungKg(t.g), bs * bs * bs * this._gattungKg(t.g)];
        const gross = m >= Mbar * tol;
        const P = L.gesetz().achsen.map((x) => (gross && x.name === "lnM" ? Math.log(m / Mbar) : 0));
        Object.assign(t, L.erbeAusLeib(P));
        const M = this._bestandErbe(t).M;
        t.alterS = gross ? Math.max(L.alterZurMasse(M, M * tol), alterS > 0 ? alterS : 0) : L.alterZurMasse(M, m);
        return t;
    }
    // DIE EIGNUNG EINES TIERS in der Nische seiner Art (`__lebenCore.eignung`): sein Phänotyp P = ln(M∞ / M_guss) gegen das
    // Optimum der Art (Welle 1: der Guss).
    _bestandEignung(t) {
        const E = this._bestandErbe(t);
        if (E.eignung === undefined) {
            const L = AnazhRealm._lebenKern();
            const P = Math.log(E.M / this._gattungKg(t.g));
            E.eignung = L.eignung(L.gesetz().achsen.map((x) => (x.name === "lnM" ? P : 0)));
        }
        return E.eignung;
    }
    // REIF ist ein Tier, dessen Leib reifeMasse × M∞ trägt (alterS ≥ reifeS(M∞)) — nur ein reifes wird Mutter oder Vater.
    _bestandReif(t) {
        return t.alterS >= this._bestandErbe(t).reif;
    }
    // DER ZUG DES GESETZES: ein Tier aus `tiere`, gezogen mit dem Gewicht `w(t)` über EINEN Zug des Stroms `rng`, in der Reihe des
    // Verzeichnisses (null ohne Kandidaten). Hunger, Riss und Mutter ziehen hier — ein Tod und eine Geburt sind ein Risiko, nie eine
    // Rangliste: bis zur Heilung von leben-erbe nahm der Hunger immer genau den Leichtesten (das argmin), eine Auslese unendlicher
    // Schärfe auf das jüngste Kalb mit dem kleinsten M∞ — ohne Wölfe lief ln M̄ der Hirsche in 46 000 Takten auf +4,8.
    _lebenZug(tiere, w, rng) {
        const kand = [];
        let summe = 0;
        for (const t of tiere) {
            const x = w(t);
            if (!(x > 0)) continue;
            kand.push([t, x]);
            summe += x;
        }
        if (!kand.length) return null;
        let r = rng() * summe;
        for (const [t, x] of kand) if ((r -= x) < 0) return t;
        return kand[kand.length - 1][0];
    }
    // DAS OPFER DES HUNGERS: wem die Reserve zuerst ausgeht — gezogen mit dem Gewicht 1 / `fastenRang` seiner Masse (die
    // Fasten-Ausdauer ∝ m^¼ ist die Zeit bis zur leeren Reserve, ihr Kehrwert das Risiko je Takt), mit g nur seiner Gattung.
    _bestandHungerOpfer(tiere, g, rng) {
        const L = AnazhRealm._lebenKern();
        return this._lebenZug(tiere, (t) => (g && t.g !== g ? 0 : 1 / L.fastenRang(this._bestandKg(t))), rng);
    }
    // DAS OPFER DES RISSES: gezogen aus der Beute (`beute`: Map/Set der Gejagten, mit g nur seiner Gattung) mit dem Gewicht
    // `rissGewicht` seiner Masse (der Ertrag des Jägers ∝ Masse).
    _bestandRissOpfer(tiere, g, beute, rng) {
        const L = AnazhRealm._lebenKern();
        const ist = (t) => !(g && t.g !== g) && !(beute && !beute.has(t));
        return this._lebenZug(tiere, (t) => (ist(t) ? L.rissGewicht(this._bestandKg(t)) : 0), rng);
    }

    // DIE GRENZEN DES GESETZES für eine Größe, die kein Gesetz trägt (`__lebenCore.spanne`: das Neugeborene des −4σ-Tiers bis
    // das +4σ-Erwachsene): der Wunsch eines Programms und der Leib eines Stands ohne sein Tier.
    _lebenSpanne(bs) {
        const [lo, hi] = AnazhRealm._lebenKern().spanne();
        return Math.min(hi, Math.max(lo, bs));
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_erbe]);

// ===== ATLAS · Kreatur/erbe — Außen-Konstanten =====
// leben-erbe — DIE TOLERANZ DES GEZEICHNETEN WACHSTUMS: der Leib eines Bestand-Tiers bekommt die Größe seines Erbes zur Zeit
// (`_kreaturGroesseSetzen`), sobald sie um mehr als diesen Anteil von der gezeichneten abweicht (je Takt, `_bestandVerkoerpern`);
// eine Annahme (`_bestandErbeAusLeib`) liest einen Leib, der innerhalb dieser Toleranz ausgewachsen ist, als ausgewachsen.
AnazhRealm.LEIB_WUCHS_TOLERANZ = 0.02;
// DAS GESETZ DES LEBENS (leben-erbe): der EINE Leser von leben-core (`__lebenCore` — Erbe, Leib über das Alter, Auslese
// nach dem Leib, Adresse) für jeden Stamm-Leser. Fail-closed: ein Kern ohne seine Funktionen ist ein Bruch, nie ein Ersatz.
AnazhRealm._lebenKern = function () {
    if (AnazhRealm._lebenKernMemo) return AnazhRealm._lebenKernMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__lebenCore : null;
    const erbe = ["gesetz", "normal", "gruender", "kind", "umwelt", "erbeAusLeib", "artId", "indId"];
    const leib = [
        "masseAdult",
        "lebensdauerS",
        "masseZurZeit",
        "alterZurMasse",
        "reifeS",
        "fastenRang",
        "rissGewicht",
        "wurfGewicht",
        "eignung",
        "spanne",
    ];
    if (k && [...erbe, ...leib].every((n) => typeof k[n] === "function")) return (AnazhRealm._lebenKernMemo = k);
    return AnazhRealm._kernPflichtBruch("leben:__lebenCore");
};
