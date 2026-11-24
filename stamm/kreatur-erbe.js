class AnazhRealm_kreatur_erbe {
    // ===== ATLAS · Kreatur/erbe — Das Gesetz des Lebens am Tier (leben-core): Erbe · Leib über das Alter · Auslese nach dem Leib · Spanne =====
    // DIE LOS-NUMMER EINES LEIBS (Welle SAMEN): der Samen-Baum der Welt (samen-core `samenBaum`, die Wurzel ist der Same der
    // Welt) am Pfad `leib:<Ort>:<Art>:<Platz im Wurf>` — der Ort auf den Dezimeter, die Art die Seele. Dieselbe Welt ruft am
    // selben Ort dieselbe Art an denselben Platz: derselbe Leib, gleich wie viele Leiber vorher kamen und gingen. Der Wertebereich
    // ist der der Kennung im Bestand (1e6 + h mod 9e8, `_bestandLeib`): die Leser (Wander-Kurs, Ruhe-Pegel) sehen eine Nummer.
    _leibLos(ort, art, platz) {
        const same = AnazhRealm._saatJe(this);
        const pfad = `leib:${Math.round(ort.x * 10)},${Math.round(ort.z * 10)}:${art}:${platz}`;
        return 1e6 + (globalThis.__samenCore.samenBaum(same).saat(pfad) % 9e8);
    }
    // Die Los-Nummer, die ein Leser eines Loses fragt (Wander-Kurs, Ruhe-Pegel). Jeder Leib trägt sie seit seiner Geburt
    // (`spawnCreatureAt`); ein Leib ohne sie bricht beim Namen — nie fällt der Leser auf die Kennung zurück.
    _leibNummer(creature) {
        const n = creature && creature.userData && creature.userData.los;
        if (!Number.isFinite(n))
            throw new Error(`Der Leib ${creature && creature.userData && creature.userData.netId} trägt keine Los-Nummer (spawnCreatureAt)`); // prettier-ignore
        return n;
    }

    // Der Name aus der Los-Nummer des Leibs (`_leibLos`, Γ5) oder der Kennung eines Tiers im Bestand: derselbe Wurf auf jedem
    // Peer und nach jedem Reload-Guss.
    _pickCreatureName(netId) {
        const pool = AnazhRealm.CREATURE_NAME_POOL;
        const g = this._rollGenome(String(netId == null ? "c0" : netId), "creature-name");
        return pool[Math.min(pool.length - 1, Math.floor(g.axis("name") * pool.length))];
    }

    // ═══ DAS GESETZ DES LEBENS am Bestand (leben-core `__lebenCore`, Welle leben-erbe) ═══
    // Ein Tier des Bestands ist eine ADRESSE (`id` = `indId(Region, Welt-Takt der Geburt, Lauf-Nummer)`), trägt ein ERBE (`a`, der
    // Zuchtwert-Vektor aus Mutter und Vater, `m` = die Mutter) und sein Leib ist PHYSIK seines Erbes über das Alter: M∞ =
    // masseAdult(M_guss, a, e), die Masse zur Zeit masseZurZeit(M∞, alterS), die Skala des Gusses bs = (m / M_guss)^⅓. Gespeichert
    // wird nur {id, soul, g, a, e, m, alterS, x, z, v}: e (die Umwelt-Streuung, nie vererbt) zieht die Geburt aus dem Strom ihres
    // Takts (Saat, Region, Zeit) und trägt sie wie a — bis zur Heilung von leben-erbe war e eine Funktion der Kennung ohne die
    // Saat der Welt (jede junge Welt trug dieselben ersten Tiere), und der angenommene Leib musste a = −e tragen. Masse, Größe und
    // Temperament sind Ableitung. Den Kern liest der EINE Leser `AnazhRealm._lebenKern()` (fail-closed), den Gründer einer
    // Kennung `_erbeGruender`.
    // Normalverteilte je Achse des Erbes (`__lebenCore.normale`, die EINE Regel): die Größe aus dem Strom eines Takts (`rng`: zwei
    // Gleichverteilte u ∈ [0, 1)), jede weitere Achse aus dem Strom der Adresse des Kinds (`adr`, `_faunaRng("erbe:" + Kennung,
    // true)`, erbe-geburt) — die zweite Achse verschiebt keinen Zug des Takts. Bis erbe-geburt zog jede Achse aus `rng`.
    _lebenNormale(rng, adr) {
        return AnazhRealm._lebenKern().normale(rng, adr);
    }
    // DAS ERBE ALS LEIB ohne das Alter: M∞, Lebensdauer und Reife (je Datensatz einmal, solange Kennung, Gattung und Erbe stehen).
    _bestandErbe(t) {
        const W = this._bestandLebenMemo || (this._bestandLebenMemo = new WeakMap());
        let e = W.get(t);
        if (!e || e.a !== t.a || e.e !== t.e || e.g !== t.g) {
            const L = AnazhRealm._lebenKern();
            // ein Kopf des Gaus trägt M∞ aus dem Zustand des Fadens (`M`, Leben C2b)
            const M = t.M > 0 ? t.M : L.masseAdult(this._gattungKg(t.g), t.a, t.e);
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
    // DIE EIGNUNG EINES TIERS in der Nische seiner Art (`__lebenCore.eignung`): sein Phänotyp je Achse gegen das Optimum der Art
    // (Welle 1: der Guss) — die Größe P = ln(M∞ / M_guss) am Leib, jede andere Achse am Erbe P = a + e (erbe-geburt: die Scheu
    // kostet, wer flieht, äst weniger). Bis erbe-geburt las die Nische nur die Größe.
    _bestandEignung(t) {
        const E = this._bestandErbe(t);
        if (E.eignung === undefined) {
            const L = AnazhRealm._lebenKern();
            const P = Math.log(E.M / this._gattungKg(t.g));
            E.eignung = L.eignung(L.gesetz().achsen.map((x, i) => (x.name === "lnM" ? P : t.a[i] + t.e[i])));
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
    // `rissGewicht` seiner Masse (der Ertrag des Jägers ∝ Masse) mal seinem Fang-Gewicht (`fangGewicht`, erbe-geburt: wer früher
    // flieht, wird seltener gefasst — die Auslese der Scheu, wie im Riss des Gaus).
    _bestandRissOpfer(tiere, g, beute, rng) {
        const L = AnazhRealm._lebenKern();
        const ist = (t) => !(g && t.g !== g) && !(beute && !beute.has(t));
        return this._lebenZug(tiere, (t) => (ist(t) ? L.rissGewicht(this._bestandKg(t)) * L.fangGewicht(t.a, t.e) : 0), rng); // prettier-ignore
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
            takt,
            akte: akte || [],
        };
        if (opt.lesen) msg.lesen = opt.lesen;
        if (opt.packen) msg.packen = true;
        if (opt.tode) msg.tode = true; // nur eine Linse: die Tode des letzten Takts (Kennung, Gattung, Ursache, Revier)
        if (opt.stand) msg.stand = opt.stand;
        if (opt.spurAb != null) msg.spurAb = opt.spurAb; // die Spur der Beute ab diesem Takt (`_gauSpurAb`)
        return this._fadenQuelle().then(() => this._gauFrage(msg, opt.stand ? [opt.stand.buffer] : []));
    }
    // EIN GAU GEHT: die Seite hält ihn nicht mehr (er liegt nicht mehr am Schirm) — der Faden lässt Feld und Lauf fallen; kommt
    // er wieder, rechnet der Faden ihn aus der Saat, den Akten und dem Stand, den die Seite hält.
    _gauGeht(gx, gz) {
        const f = this._gauFadenStand;
        if (f) f.worker.postMessage({ type: "gau-geht", gx, gz });
    }
    // DIE AKTE DER GAUE hält der Wirt (je Gau „gx,gz“ seine Liste; sie fällt mit der Saat der Welt): die EINE Eingabe der Seite
    // in das Gesetz. Sie reisen im Stand (`_gauImStand` im Leben des Stands, `_lebenImStand`) — der Gau ist die Funktion von
    // Saat, Akten und Takt, der Faden rechnet ihn nach dem Laden aus ihnen.
    _gauHalt() {
        const seed = this._gelaende().seed;
        if (!this._gauHaltStand || this._gauHaltStand.seed !== seed) this._gauHaltStand = { seed, gaue: new Map() };
        return this._gauHaltStand.gaue;
    }
    // EIN AKT TRITT IN DIE REIHE SEINES GAUS (leben-core `akt`: { takt, art: "aus", id } · { takt, art: "ein", g, revier, id, a,
    // e, alterS, m?, w? }): an seine Stelle nach Takt, bei gleichem Takt nach Kennung und Art — dieselbe Reihe auf jeder Seite,
    // gleich, in welcher Folge die Akte ankamen. Derselbe Akt ein zweites Mal (ein nachgeholter) tritt nicht ein.
    _gauAkt(gx, gz, akt) {
        if (!akt || !Number.isInteger(akt.takt) || akt.takt < 0 || typeof akt.id !== "string" || !akt.id)
            throw new Error("gau: ein Akt ohne Takt oder Kennung (" + JSON.stringify(akt) + ")");
        const H = this._gauHalt();
        const key = gx + "," + gz;
        const L = H.get(key) || H.set(key, []).get(key);
        const rang = (a) => [a.takt, a.id, a.art];
        const vor = (a, b) => {
            const [x, y] = [rang(a), rang(b)];
            for (let k = 0; k < 3; k++) if (x[k] !== y[k]) return x[k] < y[k] ? -1 : 1;
            return 0;
        };
        let i = L.length;
        while (i > 0 && vor(akt, L[i - 1]) < 0) i--;
        if (i > 0 && vor(akt, L[i - 1]) === 0) return false;
        L.splice(i, 0, akt);
        this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand (`_lebenImStand`)
        return true;
    }
    // DER GAU BIS ZUM TAKT, mit den Akten, die der Wirt für ihn hält (`_gauAuftrag`) — der Ruf jedes Lesers der Seite.
    _gauBis(gx, gz, takt, opt) {
        const ab = opt && opt.lesen ? this._gauSpurAb(this._gauBild(gx, gz), opt.lesen, takt) : null;
        if (ab != null) opt = Object.assign({}, opt, { spurAb: ab });
        return this._gauAuftrag(gx, gz, takt, (this._gauHalt().get(gx + "," + gz) || []).slice(), opt);
    }
    // DIE SPUR DER BEUTE AM TAKT DER ALTLAST (Mehrspieler-Gleichlauf): der Takt einer Region liest die Köpfe der Beute ihres Reviers
    // an SEINEM Takt (`_gauBeuteAm`), nie am Bild der Seite — das steht auf ihrer Zeit, der Takt auf der des Felds (die
    // Mehrspieler-Wand: der Bestand der Altlast verschieden in 3 von 4 Regionen). Die Seite bestellt die Spur ab dem ersten Takt,
    // der einer Region der Altlast fehlt (ihr nächster, `R.t` + taktS; eine Region, die noch nicht steht, beginnt aufholS vor jetzt).
    _gauSpurRevier(gx, gz, i) {
        const n = AnazhRealm.GAU.n;
        const key = gx * n - n / 2 + (i % n) + "," + (gz * n - n / 2 + Math.floor(i / n));
        return this._bestandRegionen().regionen[key] || this._bestandNah().includes(key) ? key : null;
    }
    _gauSpurAb(b, lesen, takt) {
        const T = AnazhRealm._bestandGesetz().B.taktS;
        const frisch = Math.floor(((this.state.spielZeit || 0) - AnazhRealm.BESTAND_REGION.aufholS) / T) + 1;
        let ab = null;
        for (const i of lesen) {
            const key = this._gauSpurRevier(b.gx, b.gz, i);
            if (!key) continue;
            const R = this._bestandRegionen().regionen[key];
            let k = Math.max(0, R ? R.t / T + 1 : frisch);
            const m = b.spur.get(i);
            while (m && m.has(k) && k <= takt) k++;
            ab = ab == null ? k : Math.min(ab, k);
        }
        return ab == null ? null : Math.min(ab, takt);
    }
    _gauBeuteAm(key, k) {
        const [ix, iz] = key.split(",").map(Number);
        const o = this._gauOrt(ix, iz);
        const b = this._gauBildStand && this._gauBilder().get(o.gx + "," + o.gz);
        const m = b && b.spur.get(o.revier);
        const s = m && m.get(Math.max(k, b.spurUnten));
        return s ? s.n : undefined;
    }
    // DER FRASS DES GAUS AN SEINEM TAKT (der gestempelte Leser des Felds: der Takt des Bestands, der Brand — `auraAt` mit `uhr`):
    // die Zelle des Reviers an der Spur am Takt floor(uhr ÷ taktS), dieselbe auf jeder Seite; trägt die Spur den Takt noch nicht
    // (die Antwort ist im Flug), liest er das Bild wie der Leser ohne Stempel (`_gauFrassAt`). Bis hier las der gestempelte Leser
    // den Fraß gar nicht: dieselbe Zelle trug zwei Leben (gate:stand-takt L3-LAST, H·w 2909 statt 2654 bei leb 0,859).
    _gauFrassAm(x, z, uhr) {
        const [S, zn] = [this._bestandSeite(), AnazhRealm.BESTAND_REGION.zellen];
        const [ix, iz] = [Math.floor(x / S), Math.floor(z / S)];
        const o = this._gauOrt(ix, iz);
        const b = this._gauBildStand && this._gauBilder().get(o.gx + "," + o.gz);
        const m = b && b.spur.get(o.revier);
        const s = m && m.get(Math.floor(uhr / AnazhRealm._bestandGesetz().B.taktS));
        if (!s || !s.f) return this._gauFrassAt(x, z);
        const [a, c] = [Math.floor((x / S - ix) * zn), Math.floor((z / S - iz) * zn)];
        return s.f[Math.min(zn - 1, a) * zn + Math.min(zn - 1, c)] || 0;
    }
    // DIE AKTE DER GAUE IM STAND: [[„gx,gz“, [Akt, …]], …] — nur Gaue mit Akten (ein Gau ohne Akte ist reine Funktion der Saat).
    _gauImStand() {
        return [...this._gauHalt()].filter(([, L]) => L.length).map(([k, L]) => [k, L.map((a) => ({ ...a }))]);
    }
    // … und zurück aus einem Stand: die Reihen ersetzen die der Sitzung; ein Akt ohne Form bricht beim Namen (kein stiller Weg:
    // ohne ihn wäre der Gau ein anderer als der des Stands) und seine Reihe endet vor ihm.
    _gauAusStand(v) {
        const H = this._gauHalt();
        H.clear();
        for (const z of Array.isArray(v) ? v : []) {
            if (!Array.isArray(z) || !/^-?\d+,-?\d+$/.test(z[0]) || !Array.isArray(z[1])) continue;
            const [gx, gz] = z[0].split(",").map(Number);
            for (const a of z[1]) {
                if (!this._gauAktGilt(a)) {
                    this._bruchMelden(
                        `GAU: der Stand trägt im Gau ${z[0]} einen Akt ohne Form — seine Reihe endet vor ihm`
                    );
                    break;
                }
                this._gauAkt(gx, gz, { ...a });
            }
        }
    }
    // DIE FORM EINES AKTS AUS FREMDER HAND (Stand, Draht): Takt, Kennung, Art — „ein“ mit Rolle, Revier, Alter und Erbe.
    _gauAktGilt(a) {
        return (
            !!a &&
            Number.isInteger(a.takt) &&
            a.takt >= 0 &&
            typeof a.id === "string" &&
            a.id.length > 0 &&
            a.id.length <= 96 &&
            (a.art === "aus" ||
                (a.art === "ein" &&
                    (a.g === "beute" || a.g === "jaeger") &&
                    Number.isInteger(a.revier) &&
                    Number.isFinite(a.alterS) &&
                    this._lebenErbeGilt(a.a) &&
                    this._lebenErbeGilt(a.e)))
        );
    }
    // DER AKT REIST (Mehrspieler-Gleichlauf, wie die Annahme der Altlast `_feldAkt`): der Gau ist die Funktion von Saat, Akten und
    // Takt — auf jeder Seite derselbe nur mit denselben Akten. Der eigene Akt tritt in die Reihe und reist über den dsl-Kanal (mit
    // dem Stempel seines Takts, nachgeholt wie jeder Akt, `_aktSenden`); der fremde tritt in dieselbe Reihe (`_gauAktFremd`), und
    // die Spur seines Gaus ab seinem Takt fällt — sie war ohne ihn gerechnet, der Faden rechnet sie mit ihm neu. Bis hier nahm jede
    // Seite ihre Leiber nur in IHREN Gau (gate:mp-sync (f): die Akte A neun am Takt 2, B neun andere am Takt 1, die Beute der
    // Altlast am Takt 1 A 3 · B 9, ihr Bestand verschieden in 3 von 4 Regionen).
    _gauAktEigen(gx, gz, akt) {
        if (this._gauAkt(gx, gz, akt))
            this._aktSenden({ type: "dsl", w: akt.takt * AnazhRealm._bestandGesetz().B.taktS, feld: { art: "gau", gx, gz, akt } }); // prettier-ignore
    }
    _gauAktFremd(f) {
        if (!Number.isInteger(f.gx) || !Number.isInteger(f.gz) || !this._gauAktGilt(f.akt)) return false;
        const akt = Object.assign({}, f.akt);
        if (!this._gauAkt(f.gx, f.gz, akt)) return false;
        const b = this._gauBildStand && this._gauBilder().get(f.gx + "," + f.gz);
        if (!b) return true;
        for (const m of b.spur.values()) for (const k of m.keys()) if (k >= akt.takt) m.delete(k);
        b.spurFall = Math.min(b.spurFall, akt.takt); // eine Antwort im Flug, ohne ihn bestellt, trägt die Spur nur davor
        return true;
    }

    // ═══ DER LESER DES GAUS (Leben C2b) — die Seite LIEST den Bestand der Gattungen des Gesetzes, sie rechnet ihn nie ═══
    // Für `GAU.beute` und `GAU.jaeger` steht kein Tier im Verzeichnis einer Region (`state.faunaBestand`: dort lebt nur die
    // ALTLAST — Fuchs, Bär und die Tiere der Gehege, unter der alten Bilanz je Region, `_bestandTakt`). Ihr Bestand ist das BILD
    // des Gaus: die letzte Antwort des Fadens je Gau (`_gauAntwort`), bestellt je Takt des Gesetzes für die Reviere am Schirm
    // (`_gauTakt`). Die Zeichnung (`_bestandVerkoerpern`), die Beute-Zahl der Altlast (`_kreaturBestand`) und die Äsung
    // (`_kreaturNahrung`) lesen dieses Bild, nie synchron den Faden. Die Seite schreibt in den Gau NUR über den Akt (`_gauAkt`).
    // DIE ROLLE EINER GATTUNG IM GESETZ: „beute“ · „jaeger“ — oder null: die Gattung ist Altlast.
    _gauRolle(g) {
        const G = AnazhRealm.GAU;
        return g === G.beute ? "beute" : g === G.jaeger ? "jaeger" : null;
    }
    // DER KOPF DER WELT-KENNUNG: die Kennungen des Kerns sind Gau-lokal, die Welt setzt den Gau davor („g<gx>,<gz>/“).
    _gauKopf(gx, gz) {
        return "g" + gx + "," + gz + "/";
    }
    // DIE BILDER DER GAUE (je Gau „gx,gz“ eines; sie fallen mit der Saat der Welt und mit dem Sprung der Welt-Uhr).
    _gauBilder() {
        const seed = this._gelaende().seed;
        if (!this._gauBildStand || this._gauBildStand.seed !== seed) this._gauBildStand = { seed, gaue: new Map() };
        return this._gauBildStand.gaue;
    }
    // DAS BILD EINES GAUS: `takt` der letzten Antwort (−1 = keine) · `bestellt` der höchste bestellte Takt · `reviere` je
    // gelesenem Revier { i, key, koepfe, frass, tiere } · `tiere` je Welt-Kennung der Datensatz der Zeichnung · `gefallen` die
    // Köpfe, deren Akt „aus“ noch reist.
    _gauBild(gx, gz) {
        const B = this._gauBilder();
        const k = gx + "," + gz;
        if (!B.has(k) && !(this._gauBildMemo = null))
            B.set(k, {
                gx,
                gz,
                takt: -1,
                bestellt: -1,
                flug: false,
                wartet: null, // die Antwort des Fadens, bis der nächste Takt des Lesers sie wirken lässt (`_gauTakt`)
                sig: "",
                aktN: -1,
                sperre: -1,
                reviere: new Map(),
                tiere: new Map(),
                gefallen: new Map(),
                spur: new Map(), // je Revier der Altlast: Takt → { n: Köpfe der Beute, f: Fraß je Zelle } (`_gauBeuteAm`, `_gauFrassAm`)
                spurUnten: 0,
                spurFall: Infinity, // der früheste Takt eines fremden Akts, den die Bestellung im Flug nicht trug (`_gauAktFremd`)
                zahl: null,
                zeit: null,
            });
        return B.get(k);
    }
    // DAS REVIER DER REGION `key` IM BILD SEINES GAUS — oder null: der Faden hat es (noch) nicht geantwortet.
    _gauRevier(key) {
        const k = key.indexOf(",");
        return this._gauRevierAm(+key.slice(0, k), +key.slice(k + 1));
    }
    // DASSELBE AN DER REGION (ix, iz) ohne Schlüssel: der Leser des Fraßes am Ort (`_gauFrassAt`) fragt es je Halm und je Fuß —
    // das Bild des letzten Gaus bleibt gemerkt (`_gauBildMemo`, fällt mit jedem neuen oder gegangenen Bild). Bis hier baute
    // jede Frage zwei Schlüssel und drei Felder (gate:fall-waechter am Kopf 13,4 s in `_gauFrassAt`, die Seite +23 % Takt-Zeit).
    _gauRevierAm(ix, iz) {
        const st = this._gauBildStand;
        if (!st || st.seed !== this._gelaende().seed) return null; // eine andere Welt: ihr Bild ist keins (`_gauBilder`)
        const n = AnazhRealm.GAU.n;
        const gx = Math.floor((ix + n / 2) / n);
        const gz = Math.floor((iz + n / 2) / n);
        let m = this._gauBildMemo;
        if (!m || m.st !== st || m.gx !== gx || m.gz !== gz)
            m = this._gauBildMemo = { st, gx, gz, b: st.gaue.get(gx + "," + gz) };
        return (m.b && m.b.reviere.get(ix - gx * n + n / 2 + (iz - gz * n + n / 2) * n)) || null;
    }
    // DER BESTAND EINER ART IN EINER REGION — der EINE Leser für jeden, der fragt, wie viele einer Gattung dort leben und was die
    // Region ihr trägt (Spiel, Linse, Probe): die Gattungen des Gesetzes (`_gauRolle`) aus dem Bild ihres Gaus (`_gauRevier`), die
    // Altlast aus dem Verzeichnis ihrer Region (`_kreaturBestand`). → { n, K, tiere, gau } — oder null: der Gau hat das Revier
    // (noch) nicht geantwortet (kein Bestand ist 0, ehe ihn jemand gelesen hat). K ist die Kapazität der Formel des Stamms
    // (`_bestandKapazitaet`) über dem Feld der Region — dieselbe, die der Faden je Zelle rechnet (voxel-worker `gauKern`); im Gau
    // erst gerechnet, wenn jemand sie liest (das Feld der Region kostet 16 Zellen — ein Zähler über den ganzen Gau fragt nur n).
    _bestandArt(key, g) {
        if (this._gauRolle(g)) {
            const R = this._gauRevier(key);
            if (!R) return null;
            const tiere = R.tiere.filter((t) => t.g === g);
            const beute = Math.min(1, R.koepfe.beute / AnazhRealm._bestandGesetz().B.beuteVoll);
            const kap = () => +this._bestandKapazitaet(g, this._bestandFeld(key), beute).toFixed(2);
            return { n: tiere.length, get K() { return kap(); }, tiere, gau: true }; // prettier-ignore
        }
        const b = this._kreaturBestand(null, key)[g];
        const R = this._bestandRegionen().regionen[key];
        const tiere = R ? this._bestandFreie(R).filter((t) => t.g === g) : [];
        return { n: b.n, K: b.K, tiere, gau: false };
    }
    // DIE KAPAZITÄT EINER GATTUNG über dem Feld `feld` einer Region (`_bestandFeld`), bei der Beute-Dichte `beute` (0..1): Köpfe je
    // ha × Σ je Zelle Lebensraum der Boden-Klasse × Fläche × Nahrung nach der Kost an der Äsung (tetrapoda BESTAND_GESETZ).
    _bestandKapazitaet(g, feld, beute) {
        const [BG, LG] = [AnazhRealm._bestandGesetz(), AnazhRealm._lebensraumGesetz()];
        const d = this._bestandDiet()[g];
        let K = 0;
        for (const c of feld.zellen) {
            const l = LG.lebensraum(g, c.klasse, LG.L);
            if (l > 0) K += l * feld.ha * BG.nahrung(d, c.aesung, beute);
        }
        return BG.B.kopfJeHa * K;
    }
    // DER FRASS DES GAUS AM ORT (Feld-Einheiten wie das Leben-Overlay: ≤ 0 abgeäst; E3 — die Fraß-Schicht gehört dem Gau): die
    // Zelle des Reviers aus dem Bild, 0 ohne Bild.
    _gauFrassAt(x, z) {
        const S = this._bestandSeite();
        const zn = AnazhRealm.BESTAND_REGION.zellen;
        const fx = x / S;
        const fz = z / S;
        const ix = Math.floor(fx);
        const iz = Math.floor(fz);
        const R = this._gauRevierAm(ix, iz);
        if (!R) return 0;
        return (
            R.frass[Math.min(zn - 1, Math.floor((fx - ix) * zn)) * zn + Math.min(zn - 1, Math.floor((fz - iz) * zn))] ||
            0
        );
    }
    // DER TAKT-STEMPEL EINES AKTS (E2): der Takt NACH dem höchsten, den die Seite je bestellte — der Akt liegt nie vor dem Stand
    // des Gaus im Faden (ein Akt davor ließe ihn ab Takt 0 neu rechnen).
    _gauAktTakt(gx, gz) {
        const T = AnazhRealm._bestandGesetz().B.taktS;
        return Math.max(this._gauBild(gx, gz).bestellt, Math.max(0, Math.floor(this._feldHorizont() / T))) + 1;
    }
    // DER TAKT DES LESERS (je Bild des Spiels, vor der Folge des Felds): je Gau am Schirm EINE Bestellung im Flug — bis zum Takt
    // des Horizonts (`_feldHorizont` ÷ taktS), gelesen werden die nahen Reviere (`_bestandNah`) und das Revier jedes Tiers, das ein
    // Leib zeichnet oder sucht. Bestellt wird nur, wenn Takt, Reviere oder Akte sich änderten; ein Gau ohne Revier am Schirm geht
    // (`_gauGeht`).
    _gauTakt() {
        // DIE ANTWORT WIRKT IN DER FOLGE DES SPIELS (hier, im Takt des Lesers), nie in der Nachricht des Fadens: zwischen zwei
        // Bildern ändert sie weder Leib noch Stand (gate:persistence (D): der Stand des Speicher-Fadens war sonst in jedem Stand
        // ein anderer als die volle Serialisierung danach — creatures). Eine Antwort, die eine jüngere überholte, fällt.
        for (const b of this._gauBilder().values()) {
            const w = b.wartet;
            b.wartet = null;
            if (w && w[0].takt >= b.takt) this._gauAntwort(b, ...w);
        }
        const [T, S] = [AnazhRealm._bestandGesetz().B.taktS, this._bestandSeite()];
        const takt = Math.max(0, Math.floor(this._feldHorizont() / T));
        const je = new Map();
        const halte = (gx, gz, revier) => {
            const k = gx + "," + gz;
            (je.get(k) || je.set(k, { gx, gz, lesen: new Set() }).get(k)).lesen.add(revier);
        };
        const ort = (x, z) => {
            const o = this._gauOrt(Math.floor(x / S), Math.floor(z / S));
            halte(o.gx, o.gz, o.revier);
        };
        for (const key of this._bestandNah()) {
            const [ix, iz] = key.split(",").map(Number);
            ort((ix + 0.5) * S, (iz + 0.5) * S);
        }
        for (const c of this.state.creatures) {
            const [ud, t] = [c.userData, c.userData._bestand];
            if (t && t.gau) halte(t.gx, t.gz, t.revier);
            else if (ud._gauWartet && (ud._gauWartetOrt || ud.wanderAnchor)) ort((ud._gauWartetOrt || ud.wanderAnchor).x, (ud._gauWartetOrt || ud.wanderAnchor).z); // prettier-ignore
        }
        const H = this._gauHalt();
        for (const e of je.values()) {
            const b = this._gauBild(e.gx, e.gz);
            const lesen = [...e.lesen].sort((p, q) => p - q);
            const sig = lesen.join();
            const aktN = (H.get(e.gx + "," + e.gz) || []).length;
            if (b.flug || b.sperre === takt || (b.takt === takt && b.sig === sig && b.aktN === aktN)) continue;
            b.flug = true;
            b.bestellt = Math.max(b.bestellt, takt);
            this._gauBis(e.gx, e.gz, takt, { lesen }).then(
                (a) => ((b.flug = false), (b.wartet = [a, sig, aktN])),
                () => ((b.flug = false), (b.sperre = takt)) // der Wurf steht beim Namen (`_gauFrage`); der nächste Takt fragt wieder
            );
        }
        for (const [k, b] of this._gauBilder())
            if (!je.has(k) && !b.flug) {
                this._gauGeht(b.gx, b.gz);
                this._gauBilder().delete(k);
                this._gauBildMemo = null;
            }
    }
    // DIE ANTWORT DES FADENS WIRD DAS BILD: je gelesenem Revier Köpfe, Fraß und die Tiere als Datensätze der Zeichnung — Kennung
    // (Gau davor), Gattung, Verband (`v`: die Herde des Reviers, das Rudel), Mutter (`m`), Geschlecht (`w`), Alter, Leib (`kg`,
    // `M`), Erbe: alles aus dem Zustand des Fadens. Die Seite fügt nur hinzu, was Zeichnung ist: den ANKER des Verbands (die
    // Herde auf der Zelle ihres Reviers mit dem meisten Lebensraum × Substrat — beide aus der Saat, die Antwort trägt sie; das
    // Rudel auf der Zelle mit dem meisten Lebensraum des Jägers), Seele, Name, Leib und dessen Stand. Ein Datensatz bleibt
    // derselbe, solange sein Kopf im Bild steht (der Leib hält ihn). EIN KOPF, DER DAS BILD VERLIESS (er starb im Gesetz, oder
    // sein Rudel riss anderswo): sein Leib fällt am Alter, wenn seine Spanne um ist (`lebensdauerS(M)`), sonst bleibt er Zeichnung
    // ohne Tier, bis er außer Blick geht (`_ohneTier`) — die Lese-Naht nennt weder Ursache noch Jäger eines Tods.
    _gauAntwort(b, a, sig, aktN) {
        b.flug = false;
        if (!this._gauBildStand || this._gauBilder().get(b.gx + "," + b.gz) !== b) return; // das Bild fiel (Sprung, andere Welt)
        Object.assign(b, { takt: a.takt, sig, aktN, zeit: a.zeit });
        b.zahl = { beute: a.beute, jaeger: a.jaeger, rudel: a.rudel };
        const [G, n, S, zn] = [
            AnazhRealm.GAU,
            AnazhRealm.GAU.n,
            this._bestandSeite(),
            AnazhRealm.BESTAND_REGION.zellen,
        ];
        const T = AnazhRealm._bestandGesetz().B.taktS;
        const kopf = this._gauKopf(b.gx, b.gz);
        const [alt, neu, offen, merk] = [b.tiere, new Map(), this._gauOffen, this._gauMerk];
        for (const [id, tk] of b.gefallen) if (a.takt >= tk) b.gefallen.delete(id);
        const vorher = b.reviere;
        b.reviere = new Map();
        // die Spur des Fadens je Revier der Altlast (`_gauSpurAb`): Zeile je Takt ab `von`, Spalte je gelesenem Revier
        const sp = a.spur;
        if (sp) b.spurUnten = sp.unten;
        const voll = aktN === (this._gauHalt().get(b.gx + "," + b.gz) || []).length;
        const fall = voll ? Infinity : b.spurFall;
        if (voll) b.spurFall = Infinity;
        const tode = new Map(); // je Revier die Tode der Spur: [Takt, Beute, Jäger] (`_gauAas`)
        (a.reviere || []).forEach((rv, j) => {
            const key = sp && this._gauSpurRevier(b.gx, b.gz, rv.i);
            if (!key) return;
            const m = b.spur.get(rv.i) || b.spur.set(rv.i, new Map()).get(rv.i);
            const L = a.reviere.length;
            const Z = sp.frass.length / sp.beute.length;
            for (let k = 0; k * L + j < sp.beute.length && sp.von + k < fall; k++) {
                const q = (k * L + j) * Z;
                m.set(sp.von + k, {
                    n: sp.beute[k * L + j],
                    f: Number.isNaN(sp.frass[q]) ? null : sp.frass.slice(q, q + Z),
                });
                const [tb, tj] = sp.tod ? [sp.tod[2 * (k * L + j)], sp.tod[2 * (k * L + j) + 1]] : [0, 0];
                if (tb > 0 || tj > 0) (tode.get(rv.i) || tode.set(rv.i, []).get(rv.i)).push([sp.von + k, tb, tj]);
            }
            // die Spur bleibt ab dem ältesten Takt, den die Altlast des Reviers noch liest (ihr nächster), und die letzten 400
            const R = this._bestandRegionen().regionen[key];
            const bis = Math.min(a.takt - 400, R ? R.t / T + 1 : a.takt);
            for (const t of m.keys()) if (t < bis) m.delete(t);
        });
        const AJ = this._gauJaegerOrt || (this._gauJaegerOrt = new Map());
        const stufen = AnazhRealm.LIFE_FIELD.stufen;
        for (const rv of a.reviere || []) {
            const [ix, iz] = [b.gx * n - n / 2 + (rv.i % n), b.gz * n - n / 2 + Math.floor(rv.i / n)];
            const key = ix + "," + iz;
            const R = { i: rv.i, key, koepfe: rv.koepfe, frass: rv.frass, tiere: [] };
            b.reviere.set(rv.i, R);
            // DIE ÄSUNG IM BILD (E3): springt die Stufe des Fraßes einer Zelle gegen das Bild davor (ohne Bild: gegen 0), wächst
            // die Nah-Streu dieser Zelle neu — sie liest die Stufe am Ort (`_lebenStufe`); gebaut wird nur, wo eine Stufe springt
            const davor = vorher.get(rv.i);
            for (let c = 0; c < rv.frass.length; c++) {
                if (Math.round((rv.frass[c] || 0) * stufen) === Math.round(((davor && davor.frass[c]) || 0) * stufen))
                    continue;
                const [x0, z0] = [(ix + Math.floor(c / zn) / zn) * S, (iz + (c % zn) / zn) * S];
                this._nahStreuNeuIn(x0, z0, x0 + S / zn, z0 + S / zn);
            }
            const zelle = (c) => ({
                x: (ix + (Math.floor(c / zn) + 0.5) / zn) * S,
                z: (iz + ((c % zn) + 0.5) / zn) * S,
            });
            let [cb, wb] = [0, -1];
            for (let c = 0; c < rv.lr.length; c++) if (rv.lr[c] * rv.s[c] > wb) [cb, wb] = [c, rv.lr[c] * rv.s[c]];
            const anker = { beute: zelle(cb), jaeger: null };
            const jaegerAnker = () => {
                if (anker.jaeger || (anker.jaeger = AJ.get(key))) return anker.jaeger;
                const LG = AnazhRealm._lebensraumGesetz();
                let [cj, wj] = [0, -1];
                for (let c = 0; c < zn * zn; c++) {
                    const o = zelle(c);
                    const w = LG.lebensraum(G.jaeger, this._bodenKlasseAt(o.x, o.z), LG.L);
                    if (w > wj) [cj, wj] = [c, w];
                }
                AJ.set(key, (anker.jaeger = zelle(cj)));
                return anker.jaeger;
            };
            if (tode.has(rv.i)) this._gauAas(kopf + "r" + rv.i, tode.get(rv.i), anker.beute, jaegerAnker);
            for (const q of rv.tiere) {
                const id = kopf + q.id;
                if (b.gefallen.has(id)) continue; // sein Akt „aus“ reist noch: die Seite zeichnet ihn nicht wieder
                if (q.g === "jaeger") jaegerAnker();
                let t = alt.get(id) || (offen && offen.get(id));
                if (!t) {
                    const g = G[q.g];
                    const m = merk && merk.get(id);
                    t = { id, gau: kopf, gx: b.gx, gz: b.gz, lokal: q.id, soul: this._gauSeele(g), g, leib: null };
                    Object.assign(t, { name: m ? m.name : undefined, snap: m ? m.snap : null });
                }
                if (offen) offen.delete(id);
                delete t.zu;
                const o = anker[q.g];
                Object.assign(t, { revier: rv.i, v: kopf + q.v, m: q.m == null ? null : kopf + q.m, w: q.w, r: q.r });
                Object.assign(t, { alterS: q.alterS, kg: q.kg, M: q.M, a: q.a, e: q.e, x: o.x, z: o.z });
                neu.set(id, t);
                R.tiere.push(t);
            }
        }
        const ohne = (t) => {
            const c = t.leib;
            if (!c) return;
            [c.userData._bestand, t.leib] = [null, null];
            if (!this.state.creatures.includes(c)) return;
            c.userData.alterS = t.alterS;
            if (t.M > 0 && t.alterS + T > this._bestandErbe(t).tod) this._creatureNaturalDeath(c, "alter", false);
            else c.userData._ohneTier = true;
        };
        for (const [id, t] of alt) if (!neu.has(id)) ohne(t);
        // eine Annahme, deren Takt die Antwort trägt und deren Kopf im Bild fehlt, trat nicht ein (oder ihr Rudel steht fern)
        if (offen)
            for (const [id, t] of offen)
                if (t.gau === kopf && t.einTakt <= a.takt && !neu.has(id)) (offen.delete(id), ohne(t));
        b.tiere = neu;
        // ein Leib, der sein Tier sucht (ein Stand kehrte wieder, `_bestandLeibWieder`), findet es im Bild seines Reviers
        for (const c of this.state.creatures) {
            const [ud, id] = [c.userData, c.userData._gauWartet];
            const wo = ud._gauWartetOrt || ud.wanderAnchor; // der Ort seines Kopfs (der Stand nennt ihn), sonst sein Anker
            if (!id || !id.startsWith(kopf) || !wo) continue;
            const w = this._gauOrt(Math.floor(wo.x / S), Math.floor(wo.z / S));
            if (w.gx !== b.gx || w.gz !== b.gz || !b.reviere.has(w.revier)) continue;
            const t = neu.get(id);
            [ud._gauWartet, ud._gauWartetOrt] = [undefined, undefined];
            if (t && !t.leib) [t.leib, ud._bestand] = [c, t];
            else ud._ohneTier = true;
        }
    }
    // DIE SEELE EINER GATTUNG DES GESETZES (die eine Seele ihres Gusses, wie `_gattungLeib`).
    _gauSeele(g) {
        const M = this._gauSeeleMemo || (this._gauSeeleMemo = {});
        if (M[g]) return M[g];
        const soul = AnazhRealm.CREATURE_SOUL_NAMES.find((n) => AnazhRealm.TETRAPODA_SOUL_MAP[n] === g);
        return soul ? (M[g] = soul) : AnazhRealm._kernPflichtBruch("leben:Seele der Gattung " + g);
    }
    // DIE ANNAHME IN DEN GAU (E2, der Ruf von `_bestandAdoptieren` für die Gattungen des Gesetzes): der Leib `c` am Anker `a`
    // tritt als Akt „ein“ mit Takt-Stempel in das Revier seines Ankers — Erbe und Alter aus seinem gemessenen Leib
    // (`_bestandErbeAusLeib`), die Kennung aus der Reihe der Akte seines Gaus gelesen (eine Kennung ist Zustand: die nächste Zahl
    // der Seite im Revier). Bis die Antwort seines Takts ihn trägt, hält der Leib den Datensatz offen (`zu`).
    _gauAnnahme(c, g, rolle, a) {
        const S = this._bestandSeite();
        const o = this._gauOrt(Math.floor(a.x / S), Math.floor(a.z / S));
        const p2p = this.state.p2p;
        const vorn = "a" + o.revier + "." + ((p2p && p2p.peerId) || "ich") + ".";
        let nr = 0;
        for (const x of this._gauHalt().get(o.gx + "," + o.gz) || [])
            if (x.art === "ein" && x.id.startsWith(vorn)) nr = Math.max(nr, Number(x.id.slice(vorn.length)) || 0);
        const [kopf, lokal, ud] = [this._gauKopf(o.gx, o.gz), vorn + (nr + 1), c.userData];
        const t = { id: kopf + lokal, gau: kopf, gx: o.gx, gz: o.gz, lokal, revier: o.revier, soul: ud.soul, g };
        Object.assign(t, { a: null, e: null, m: null, alterS: 0, x: a.x, z: a.z, v: null, name: ud.name });
        this._bestandErbeAusLeib(t, ud.bodySize, ud.alterS);
        Object.assign(t, { leib: c, zu: true, einTakt: this._gauAktTakt(o.gx, o.gz) });
        ud._bestand = t;
        (this._gauOffen || (this._gauOffen = new Map())).set(t.id, t);
        const akt = { takt: t.einTakt, art: "ein", g: rolle, revier: o.revier, id: lokal, a: t.a, e: t.e };
        this._gauAktEigen(o.gx, o.gz, Object.assign(akt, { alterS: t.alterS }));
    }
    // EIN KOPF DES GAUS FÄLLT AUSSERHALB DES GESETZES (E2, der Ruf von `_bestandAus`): der Akt „aus“ mit Takt-Stempel; die Seite
    // zeichnet ihn nicht wieder, während der Akt reist (`gefallen`). Eine offene Annahme fällt einen Takt nach ihrem Eintritt.
    _gauAus(t) {
        const takt = Math.max(this._gauAktTakt(t.gx, t.gz), (t.einTakt | 0) + 1);
        const b = this._gauBild(t.gx, t.gz);
        if (this._gauOffen) this._gauOffen.delete(t.id);
        b.tiere.delete(t.id);
        b.gefallen.set(t.id, takt);
        const R = b.reviere.get(t.revier);
        if (R) R.tiere = R.tiere.filter((x) => x !== t);
        this._gauAktEigen(t.gx, t.gz, { takt, art: "aus", id: t.lokal });
    }
    // DER TOD IM GAU DÜNGT (oeko.zerfall#1): die Tode der Spur eines Reviers (`zeilen`: [Takt, Beute, Jäger], der Faden zählt sie
    // je Takt, voxel-worker `spurTod`) legen je Kopf ihren Leichnam als Tat „aas“ — über denselben Schreiber wie jeder Tod des
    // Bestands (`_aasTat`), zur Stunde ihres Takts, die Beute am Anker der Herde, der Jäger am Anker des Rudels (wo die Zeichnung
    // sie führt). Die Kennung ist Revier, Takt und Kopf: eine Spur, die zweimal kommt (ein zweiter Leser, ein Mitspieler),
    // düngt einmal. Gelesen werden nur die Reviere am Schirm — die Kosten hängen an der Spur, nie am Gau.
    _gauAas(vorn, zeilen, beute, jaeger) {
        const T = AnazhRealm._bestandGesetz().B.taktS;
        for (const [k, nb, nj] of zeilen) {
            for (let i = 0; i < nb; i++) this._aasTat({ id: vorn + "@" + k + "b" + i, x: beute.x, z: beute.z }, k * T);
            for (let i = 0, o = nj > 0 && jaeger(); i < nj; i++)
                this._aasTat({ id: vorn + "@" + k + "j" + i, x: o.x, z: o.z }, k * T);
        }
    }
    // DER STAND EINES GEGANGENEN LEIBS (Gedächtnis, Wunde, Name) überdauert sein Revier am Schirm: je Kennung gemerkt
    // (höchstens 256, der älteste fällt), gelesen, wenn der Kopf wieder ins Bild tritt.
    _gauMerken(t) {
        const M = this._gauMerk || (this._gauMerk = new Map());
        M.delete(t.id);
        M.set(t.id, { snap: t.snap, name: t.name });
        if (M.size > 256) M.delete(M.keys().next().value);
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
