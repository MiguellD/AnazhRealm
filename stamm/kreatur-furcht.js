class AnazhRealm_kreatur_furcht {
    // ===== ATLAS · Kreatur/furcht — Scheu · Furcht · die Bedrohung (Spieler, Jäger, Ort des Risses, Glut des Brands) =====
    // DER ALARM DES VERBANDS (S6): wer selbst nichts fürchtet (w unter fleeThreshold), flieht mit dem nächsten fliehenden Glied
    // seines Verbands DIESELBE Flucht (`_fluchtOrt`: Ort und Radius, die nur das eigene Wittern anlegt — tetrapoda fluchtRadius,
    // Tiere K1). Vorher floh nur, wer selbst witterte (Linse herde 18.10.); danach trug jedes Glied aus zweiter Hand einen
    // weiteren Radius, und der Verband hielt es gegen seine Flucht fest (Linse herde 24.10.: 300 s Flucht auf der Stelle).
    _kreaturVerbandAlarm(creature, NAT, von, w) {
        const ud = creature.userData;
        ud._alarmEigen = w >= NAT.fleeThreshold;
        if (ud._alarmEigen || !von) return w;
        const glieder = this._kreaturVerbandGlieder(creature);
        if (!glieder) return w;
        let best = Infinity;
        let B = null;
        for (const g of glieder) {
            const gu = g.userData;
            if (g === creature || gu._motionZustand !== "flucht" || !gu._fluchtOrt) continue;
            const d = Math.hypot(g.position.x - creature.position.x, g.position.z - creature.position.z);
            if (d < best) {
                best = d;
                B = gu._fluchtOrt;
            }
        }
        if (!B) return w;
        von.x = B.x;
        von.z = B.z;
        von.r = B.r;
        return Math.max(w, NAT.fleeThreshold);
    }

    // WARINESS = die natürliche Reaktion eines wilden Wesens auf den Spieler, EIN emergentes Signal:
    // deine Aura-MENACE (v. a. `chaos`, feedback-frei, minus peace/joy) gegen die Natur des Wesens
    // (dicht/hart kühn, lebendig scheu) + BINDUNG + MODUS + frische Kampf-Furcht.
    // Negativ = neugierig (näher), positiv = scheu (fort). DER ALARM DES VERBANDS (S6) liegt darüber: wer selbst nichts
    // fürchtet, flieht mit seinem Verband (`_kreaturVerbandAlarm`).
    _creatureWariness(creature) {
        const NAT = AnazhRealm._verhaltenGesetz().furcht;
        const w = this._creatureWarinessEigen(creature);
        const ud = creature.userData;
        return ud ? this._kreaturVerbandAlarm(creature, NAT, ud._bedrohtVon, w) : w;
    }

    // Die EIGENE Wariness des Wesens: was es selbst wittert — den Spieler und den jagenden Jäger.
    _creatureWarinessEigen(creature) {
        // SPIEGEL-ZENSUS — die Wariness-Gewichte wohnen im tetrapoda-Gesetzbuch
        // (VERHALTEN.furcht via _verhaltenGesetz, fail-soft byte-gleich).
        const NAT = AnazhRealm._verhaltenGesetz().furcht;
        const ud = creature.userData || {};
        // DIE BEDROHUNG (Q11): die Wariness liest JEDE Bedrohung — den Spieler (unten) und den jagenden Jäger in der
        // Witterung — und merkt Ort und Flucht-Radius der stärksten (der Flucht-Zweig flieht von dort). Vorher las sie nur
        // den Spieler: ein gebissener Hirsch wanderte neben dem Wolf weiter (R-D4/K-D11).
        const von = ud._bedrohtVon || (ud._bedrohtVon = { x: 0, z: 0, r: 0 });
        // DIE GLUT IST BEDROHUNG (w28-brand-flucht, feld.K3#2): eine glühende Zelle des Brands im noticeRadius wiegt wie ein Treffer,
        // jedes Wesen flieht von ihr, das wilde auch. Vorher kehrte der wilde Zweig hier um, und keiner las die Glut: die Herde
        // äste 15 m vor der Front (gate:kreatur-takt furcht (C): binnen 10 s floh 0 von 5).
        if (this._kreaturGlutNah(creature, NAT, von)) return NAT.combatFearWariness;
        if (this._creatureTemperament(creature) === "wild") return this._creatureWarinessSpieler(creature, NAT, von);
        // DER ORT ERINNERT (Ökologie K3): die Beute wittert die Furcht des Orts wie eine Bedrohung (`_kreaturFurchtOrt`)
        const wSpieler = this._kreaturFurchtOrt(creature, NAT, von, this._creatureWarinessSpieler(creature, NAT, von));
        const jaeger = this._kreaturJaeger;
        if (!jaeger || !jaeger.length) return wSpieler;
        // Ein PIRSCHENDER Jäger bleibt unbemerkt bis jagd.pirschSichtM, ein HETZENDER fällt ab noticeRadius auf (Welle LF:
        // die Jagd gelingt aus der Pirsch — vorher sah die Beute jeden Jäger auf 22 m und floh, ehe er nahe war).
        const sichtPirsch = AnazhRealm._verhaltenGesetz().jagd.pirschSichtM;
        let best = Infinity;
        let J = null;
        for (const j of jaeger) {
            if (j === creature || !j.position) continue;
            const sicht = j.userData && j.userData._motionZustand === "hetzen" ? NAT.noticeRadius : sichtPirsch;
            const d = Math.hypot(j.position.x - creature.position.x, j.position.z - creature.position.z);
            if (d < sicht && d < best) {
                best = d;
                J = j;
            }
        }
        // Ein jagender Jäger in der Witterung wiegt wie ein Treffer (combatFearWariness): die Beute flieht, solange sie
        // ihn wittert (Flucht-Radius = noticeRadius).
        if (!J || NAT.combatFearWariness < wSpieler) return wSpieler;
        von.x = J.position.x;
        von.z = J.position.z;
        von.r = NAT.noticeRadius;
        return NAT.combatFearWariness;
    }

    // Die nächste glühende Zelle des Brands im noticeRadius (`_brandGlutUm`: die Blöcke des letzten Schritts, dieselben Zellen, die
    // Licht, Rauch und Ohr lesen) → ihr Ort und der Flucht-Radius in `von`; ob eine glüht. Ohne Brand kostet die Frage nichts.
    _kreaturGlutNah(creature, NAT, von) {
        const bf = this.state.brandFeld;
        if (!bf || !bf.size) return false;
        const [x, z, R] = [creature.position.x, creature.position.z, NAT.noticeRadius];
        let best = R * R;
        let B = null;
        this._brandGlutUm(x, z, R, (b) => {
            const o = b.ort || this._brandOrt(b);
            const d = (o.x - x) * (o.x - x) + (o.z - z) * (o.z - z);
            if (d < best) [best, B] = [d, o];
        });
        if (!B) return false;
        von.x = B.x;
        von.z = B.z;
        von.r = R;
        return true;
    }

    // Die Wariness vor dem SPIELER (Aura-Menace × Natur × Bindung × Modus + frische Kampf-Furcht); merkt seinen Ort und
    // den Flucht-Radius in `von`.
    _creatureWarinessSpieler(creature, NAT, von) {
        const now = this.state.creatureAnimationTime; // die Kampf-Furcht auf der Kreatur-Uhr (damageCreature)
        const ud = creature.userData || {};
        const fearActive = Number.isFinite(ud.fearUntil) && now < ud.fearUntil;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return fearActive ? NAT.combatFearWariness : 0;
        // DAS WESEN ERINNERT (Ökologie K3, tetrapoda furchtErinnert): wer es schlug, den fürchtet es — die erinnerte Furcht hebt
        // die Wariness und weitet Witterung und Flucht-Distanz; wer es fütterte, dem nähert es sich (die Furcht sinkt unter 0).
        // Vorher las kein Verhalten das Gedächtnis (nur Spezialisierung, Prompt und Hof).
        const FG = AnazhRealm._furchtGesetz();
        const erinnert = this._kreaturFurchtErinnert(creature);
        const weit = 1 + Math.max(0, erinnert) * FG.F.fluchtJeFurcht;
        const witterung = NAT.noticeRadius * weit;
        von.x = pm.x;
        von.z = pm.z;
        von.r = NAT.fleeRadius * weit;
        const dist = Math.hypot(creature.position.x - pm.x, creature.position.z - pm.z);
        if (!fearActive && dist > witterung) return 0; // fern → neutral, das Wesen wandert
        const e = (this.state.player && this.state.player.emotions) || {};
        // DIE BEDROHUNG der Aura (tetrapoda bedrohung — dieselbe, die den Abdruck am Ort wiegt). DIE FURCHT DER BEUTE SCHRECKT
        // IHREN JÄGER NIE (oekologie.K4#2): wer den Spieler jetzt pirscht oder hetzt, liest seine Aura nicht — er ist Beute wie
        // jedes Tier (keine Beute trägt ihre Aura in die Wariness ihres Jägers); der Hieb (fearActive) und die Erinnerung
        // schrecken weiter. Bis oekologie.K4#2 verscheuchte die Furcht des Umstellten (chaos × menaceFromChaos) sein Rudel.
        const menace = (this._spielerJaeger || []).includes(creature) ? 0 : FG.bedrohung(e, NAT);
        // DIE NATUR des Wesens ist das Temperament seiner Gattung (Welle LF 08.10.): der Mut der Art (_kreaturMut) macht
        // kühn oder scheu, Bindung macht mutig. Vorher lasen hier die Substanz-Tags (dichte · härte · lebendig), die für
        // alle Tiere gleich sind (Lehre 8) — jeder Hirsch stand mit Wariness −1,0 neugierig am Spieler.
        const boldness = (this._kreaturMut(creature) * 2 - 1) * NAT.mutGewicht + (ud.bond || 0) * NAT.boldFromBond;
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const modeMul = mode === "pfad" ? 1 : mode === "frieden" ? NAT.friedenMenace : NAT.schoepferMenace;
        const proximity = Math.max(0, 1 - dist / witterung);
        let wariness = (menace * modeMul - boldness + erinnert) * (fearActive ? 1 : proximity);
        if (fearActive) wariness = Math.max(wariness, NAT.combatFearWariness);
        return wariness;
    }

    // Die erinnerte Furcht des Wesens vor dem Spieler (tetrapoda furchtErinnert über `userData.memory`: geschlagen ·
    // gefüttert; die Einträge schreiben `damageCreature` und `activateCreatureConsumable`, sie reisen im Speicherstand).
    _kreaturFurchtErinnert(creature) {
        const FG = AnazhRealm._furchtGesetz();
        return FG.furchtErinnert(creature.userData && creature.userData.memory, FG.F);
    }

    // DIE FURCHT DES ORTS (Ökologie K3, tetrapoda furchtOrt): die Beute (ein Pflanzenfresser, diet bis
    // temperament.gattung.pflanzDiet — der Jäger und der Aasfresser gehen an den Riss) liest den Abdruck der Zellen um sich
    // (das Emotions-Feld `_emotionOverlayAt`, 3 × 3 Zellen der Kante LIFE_FIELD.cell); die Furcht einer Zelle wiegt bis
    // ortRadiusZellen Zellen um ihre Mitte, linear zum Rand. Ist sie größer als die Wariness w, ist der Ort die Bedrohung: `von`
    // ist die Mitte der Zelle, ihr Flucht-Radius der Umkreis. Liefert die Wariness. Ein Riss prägt den Ort
    // (`_creatureCombatDeath`); vorher trug der Ort Gefühle, die kein Tier las.
    _kreaturFurchtOrt(creature, NAT, von, w) {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return w;
        const VG = AnazhRealm._verhaltenGesetz();
        if (this._kreaturDiet(creature) > VG.temperament.gattung.pflanzDiet) return w;
        const FG = AnazhRealm._furchtGesetz();
        const zelle = AnazhRealm.LIFE_FIELD.cell;
        const R = FG.F.ortRadiusZellen * zelle;
        const x = creature.position.x,
            z = creature.position.z;
        const cx = Math.floor(x / zelle),
            cz = Math.floor(z / zelle);
        let best = w,
            bx = 0,
            bz = 0;
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                const mx = (cx + i + 0.5) * zelle,
                    mz = (cz + j + 0.5) * zelle;
                const m = FG.furchtOrt(this._emotionOverlayAt(mx, mz), NAT, FG.F);
                if (!(m > 0)) continue;
                const wo = m * Math.max(0, 1 - Math.hypot(x - mx, z - mz) / R);
                if (wo > best) {
                    best = wo;
                    bx = mx;
                    bz = mz;
                }
            }
        if (best === w) return w;
        von.x = bx;
        von.z = bz;
        von.r = R;
        return best;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_furcht]);
