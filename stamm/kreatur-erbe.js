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

    // ═══ DER GAU-WIRT (Leben C2a) — der Bestand unter dem Gesetz der Zeit und der Jagd lebt je GAU im Gau-Faden ═══
    // Ein GAU ist `GAU.n` × `GAU.n` Regionen an festen Welt-Koordinaten (`_gauOrt`); sein Bestand (leben-core `bestand`: Beute und
    // Jäger, `GAU.beute` · `GAU.jaeger`) ist eine Funktion von (Samen der Welt, Gau, Takt, Akte der Seite) und wird im Gau-Faden
    // gerechnet (voxel-worker `gauAuftrag`) — der Haupt-Faden schickt nur den Auftrag und liest die Antwort. Der Zustand eines
    // Gaus ist STAND, nie Cache: er reist als Bytes (leben-core `gauPack`, per Transfer) in den Spielstand und zum Mitspieler;
    // ein Gau ohne Akte ist reine Funktion und wird im Faden ab Takt 0 gerechnet.
    // DER GAU-FADEN: ein schlanker Faden aus der EINEN Quelle (`_fadenQuelle`, wie der Planet-Faden) — sein Stand trägt NUR die
    // Saat der Welt (`_gauSaatStand`: kein Erdbau, keine Edits, kein Pegel — das Feld eines Gaus liest nur die Saat), seine
    // Hydro-Kacheln rechnet er selbst über dem Gau und lässt sie nach dem Feld fallen. Geboren mit der ersten Frage; eine andere
    // Welt (`welt`: Samen und Welt der Regionen) bekommt einen neuen Stand vor ihrer ersten Frage. → das Versprechen der Antwort;
    // ein Wurf des Fadens bricht beim Namen (kein stiller Weg: ohne den Faden steht kein Gau).
    _gauFrage(msg, transfer) {
        let f = this._gauFadenStand;
        if (!f) {
            const worker = new Worker(this._quelleStand().url, { name: "gau" });
            f = this._gauFadenStand = { worker, pending: new Map(), next: 1, welt: null };
            worker.onmessage = (e) => {
                const m = e.data;
                const p = m && m.requestId ? f.pending.get(m.requestId) : null;
                if (m && m.type === "error") this._bruchMelden(`GAU: der Gau-Faden warf (${m.op}) — ${m.message}`);
                if (!p) return;
                f.pending.delete(m.requestId);
                if (m.type === "error") p.reject(new Error(m.message));
                else p.resolve(m);
            };
            worker.onerror = (err) => {
                this._bruchMelden("GAU: der Gau-Faden brach — " + (err && err.message));
                for (const p of f.pending.values()) p.reject(new Error("der Gau-Faden brach"));
                f.pending.clear();
                this._gauFadenStand = null;
            };
        }
        const stand = this._gauSaatStand();
        const welt = stand.seed + "|" + stand.hydroWelt;
        if (f.welt !== welt) {
            f.welt = welt;
            f.worker.postMessage({ type: "state-set", snapshot: stand });
        }
        const requestId = f.next++;
        const promise = new Promise((resolve, reject) => f.pending.set(requestId, { resolve, reject }));
        f.worker.postMessage(Object.assign({ requestId }, msg), transfer || []);
        return promise;
    }
    // DER STAND DES GAU-FADENS: die Saat der Welt und ihr Gesetz — was die Boden-Klasse einer Zelle liest (`_bodenKlasseAt`:
    // Fluss-Rand, Hang der Saat, Bestandsdichte des Walds), nichts, was eine Tat der Sitzung schrieb.
    _gauSaatStand() {
        return {
            seed: this._gelaende().seed,
            baseHeight: this.state.terrainBaseHeight || 0,
            waterLevel: typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0,
            ort: this._gelaende().ort.teil,
            hydroGesetz: AnazhRealm.HYDROSPHERE,
            regionSize: AnazhRealm.HYDROSPHERE.regionSize,
            genVersion: typeof this._genVersion === "function" ? this._genVersion() : 1,
            erbgut: this._erbgut(),
            hydroWelt: this._hydroWelt | 0,
        };
    }
    // DER WIRT DES BESTAND-KERNS (leben-core `bestand(wirt)`) als reine Zahlen aus den Quellen des Stamms: der Takt und das Revier
    // (tetrapoda BESTAND_GESETZ), das Feld (die Zellen der Region `BESTAND_REGION.zellen`², Zerfall und Klemme des Leben-Felds
    // `LIFE_FIELD`, K je Zelle aus Fläche `ha` und Kost `diet` — die Formel von `_kreaturBestand`), je Gattung die Masse des
    // GUSSES (`_gattungKg`, E6), ihr Verband (VERHALTEN herde.wurf) und der Fraß; der Jäger dazu Beute-Masse und jagdKg.
    // `kg` (nur die Linse „Bestand = Gesetz“: die Masse von Lauf 4) ersetzt die Masse des Gusses.
    _gauWirt(kg) {
        if (!kg && this._gauWirtMemo) return this._gauWirtMemo;
        const [G, BG, V, LF] = [
            AnazhRealm.GAU,
            AnazhRealm._bestandGesetz(),
            AnazhRealm._verhaltenGesetz(),
            AnazhRealm.LIFE_FIELD,
        ];
        const [B, L, zn] = [BG.B, AnazhRealm._lebenKern(), AnazhRealm.BESTAND_REGION.zellen];
        const diet = this._bestandDiet();
        const seite = this._bestandSeite();
        const TJ = L.gesetz().refS / B.taktS / L.zeitJagd().jahreRef;
        const M = kg || { [G.beute]: this._gattungKg(G.beute), [G.jaeger]: this._gattungKg(G.jaeger) };
        const wirt = {
            taktS: B.taktS,
            revierSeiteM: seite,
            feld: {
                zellen: zn * zn,
                zerfallJeS: LF.decayPerSec,
                epsilon: LF.epsilon,
                kahl: LF.kahl,
                max: LF.max,
                kopfJeHa: B.kopfJeHa,
                ha: (seite / zn) ** 2 / 1e4,
                diet: diet[G.beute],
            },
            beute: { M: M[G.beute], verband: V.herde.wurf[G.beute], frassJeJahr: BG.frass(diet[G.beute], B) * TJ },
            jaeger: {
                M: M[G.jaeger],
                verband: V.herde.wurf[G.jaeger],
                beuteMasse: V.jagd.beuteMasse,
                jagdKg: V.temperament.gattung.jagdKg,
            },
        };
        return kg ? wirt : (this._gauWirtMemo = wirt);
    }
    // DER ORT EINER REGION IM RASTER DER GAUE: Region (ix, iz) → { gx, gz, x0, z0, revier } — der Gau (gx, gz) beginnt an der
    // Region (x0, z0) = (gx · n − n / 2, gz · n − n / 2): der Ursprung der Welt ist die Mitte des Gaus (0, 0); `revier` ist die
    // Stelle der Region in ihm (Zeile für Zeile, x zuerst — der Index jedes Lesers des Kerns).
    _gauOrt(ix, iz) {
        const n = AnazhRealm.GAU.n;
        const [gx, gz] = [Math.floor((ix + n / 2) / n), Math.floor((iz + n / 2) / n)];
        const [x0, z0] = [gx * n - n / 2, gz * n - n / 2];
        return { gx, gz, x0, z0, revier: ix - x0 + (iz - z0) * n };
    }
    // DIE SAAT EINES GAUS: der Samen der Welt und die Adresse des Gaus (FNV-1a, 32 Bit) — jeder Gau zieht seinen eigenen Strom.
    _gauSaat(gx, gz) {
        const s = this._gelaende().seed + ":gau:" + gx + "," + gz;
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
        return h | 0;
    }
    // DER AUFTRAG AN EINEN GAU: der Gau (gx, gz) bis zum Takt `takt` mit den Akten `akte` (leben-core `akt`: nach Takt geordnet,
    // nur angehängt — dieselbe Liste bei jedem Ruf). `opt`: `lesen` — die Reviere, deren Köpfe, Tiere und Fraß die Antwort trägt ·
    // `packen` — die Antwort trägt den Stand als Bytes (`stand`, per Transfer) · `stand` — ein Stand, der hereinreist (Bytes,
    // per Transfer: der Faden rechnet ab ihm) · `saat`, `kg` — nur die Linse „Bestand = Gesetz“ (Saat und Masse von Lauf 4).
    // → das Versprechen von { gx, gz, takt, beute, jaeger, rudel, feld, zeit, reviere?, stand? }.
    _gauAuftrag(gx, gz, takt, akte, opt = {}) {
        const G = AnazhRealm.GAU;
        const FC = AnazhRealm.FIELD_CHARACTER;
        const msg = {
            type: "gau",
            samen: this._gelaende().seed,
            gx,
            gz,
            x0: gx * G.n - G.n / 2,
            z0: gz * G.n - G.n / 2,
            n: G.n,
            seite: this._bestandSeite(),
            zn: AnazhRealm.BESTAND_REGION.zellen,
            beute: G.beute,
            saat: opt.saat === undefined ? this._gauSaat(gx, gz) : opt.saat,
            wirt: this._gauWirt(opt.kg),
            lebendig: { lambdaLebendig: FC.lambdaLebendig, warpAmp: FC.warpAmp, warpScale: FC.warpScale },
            takt,
            akte: akte || [],
        };
        if (opt.lesen) msg.lesen = opt.lesen;
        if (opt.packen) msg.packen = true;
        if (opt.stand) msg.stand = opt.stand;
        return this._fadenQuelle().then(() => this._gauFrage(msg, opt.stand ? [opt.stand.buffer] : []));
    }
    // EIN GAU GEHT: die Seite hält ihn nicht mehr (er liegt nicht mehr am Schirm) — der Faden lässt Feld und Lauf fallen; kommt
    // er wieder, rechnet der Faden ihn aus der Saat, den Akten und dem Stand, den die Seite hält.
    _gauGeht(gx, gz) {
        const f = this._gauFadenStand;
        if (f) f.worker.postMessage({ type: "gau-geht", gx, gz });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_erbe]);

// ===== ATLAS · Kreatur/erbe — Außen-Konstanten =====
// leben-erbe — DIE TOLERANZ DES GEZEICHNETEN WACHSTUMS: der Leib eines Bestand-Tiers bekommt die Größe seines Erbes zur Zeit
// (`_kreaturGroesseSetzen`), sobald sie um mehr als diesen Anteil von der gezeichneten abweicht (je Takt, `_bestandVerkoerpern`);
// eine Annahme (`_bestandErbeAusLeib`) liest einen Leib, der innerhalb dieser Toleranz ausgewachsen ist, als ausgewachsen.
AnazhRealm.LEIB_WUCHS_TOLERANZ = 0.02;
// DER GAU (Leben C2a, `_gauAuftrag`): `n` × `n` Regionen je Gau; die Gattungen unter dem Gesetz der Zeit und der Jagd — `beute`
// und `jaeger` (jede andere Gattung des Bestands steht unter der alten Bilanz je Region, bis ihr Gesetz steht).
AnazhRealm.GAU = Object.freeze({ n: 48, beute: "deer", jaeger: "wolf" });
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
