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
        // DIE GLUT IST BEDROHUNG (w28-brand-flucht, feld.K3#2): eine glühende Zelle des Brands in der Fluchtdistanz des Tiers wiegt
        // wie ein Treffer, jedes Wesen flieht von ihr, das wilde auch. Vorher kehrte der wilde Zweig hier um, und keiner las die
        // Glut: die Herde äste 15 m vor der Front (gate:kreatur-takt furcht (C): binnen 10 s floh 0 von 5).
        if (this._kreaturGlutNah(creature, NAT, von)) return NAT.combatFearWariness;
        if (this._creatureTemperament(creature) === "wild") return this._creatureWarinessSpieler(creature, NAT, von);
        // DER ORT ERINNERT (Ökologie K3): die Beute wittert die Furcht des Orts wie eine Bedrohung (`_kreaturFurchtOrt`)
        const wSpieler = this._kreaturFurchtOrt(creature, NAT, von, this._creatureWarinessSpieler(creature, NAT, von));
        const jaeger = this._kreaturJaeger;
        if (!jaeger || !jaeger.length) return wSpieler;
        // Ein PIRSCHENDER Jäger bleibt unbemerkt bis jagd.pirschSichtM, ein HETZENDER fällt auf, sobald das Auge der Beute ihn
        // sieht (`_kreaturSiehtM`: sein Fell gegen den Boden unter ihm im Rezeptorraum der Beute — Welle LF: die Jagd gelingt aus
        // der Pirsch; bis auge-der-art sah jede Beute jeden hetzenden Jäger auf denselben 22 m, der Wolf im Gras wie im Schnee).
        // ENTDECKUNG ≠ ALARM (auge-der-art 2): das Auge sagt, OB die Beute ihn sieht; AB WELCHER NÄHE sie flieht, sagt die
        // Fluchtdistanz ihrer Gattung (`_kreaturFluchtDistanzM`, das Feldmaß — dasselbe der Glut und der Flucht vor dem Menschen).
        // Bis hier war der Flucht-Radius die ganze Sichtweite: der Hirsch floh einen hetzenden Wolf ab 1 066 m und lief
        // fluchtRadius = r + 2,2 r ≈ 3,4 km weit (gate:kreatur-takt an der GTX 595 s über dem Deckel 480 s).
        // DIE BEUTE WITTERT (jagd-quote): dieselbe Fahne windab (`_scentAt`) und dieselbe Nase (`_scentNase`, jagd.scentRangeM)
        // wie der Jäger — wer windab eines Jägers in ihrer Fluchtdistanz steht, merkt ihn, pirschend wie hetzend, und flieht.
        // Mech 1966 (Isle Royale, Fauna Series 7): der letzte Reiz kommt über den Geruch, in 7 Jagden (11 Elche) merkten die
        // Elche die Wölfe zuerst und verließen sofort den Ort; darum ziehen Wölfe gegen den Wind auf ihre Beute. Bis jagd-quote
        // trug nur der Jäger die Nase (witterung-windab): das Rudel umstellte den Hirsch auf dem Ring, auch luvwärts, ungemerkt
        // bis pirschSichtM — die Rudel-Quote stieg über ihr Band (113 von 240 Jagden).
        const VG = AnazhRealm._verhaltenGesetz();
        const sichtPirsch = VG.jagd.pirschSichtM;
        const nase = this._scentNase(VG.jagd.scentRangeM);
        // DIE FAHNE TRÄGT IHRE LAUFZEIT (jagd-quote 2): die Quelle ist die Spur des Jägers (`_duftSpur`), gerochen wird er dort,
        // wo er stand, als seine Front aufbrach — ein Jäger ohne Spur hat noch keine Fahne (`_scentAt`, die leere Spur)
        const quelle = this._furchtQuelle || (this._furchtQuelle = [{ x: 0, z: 0, strength: 1, spur: null }]);
        let best = Infinity;
        let J = null;
        let sichtJ = 0;
        let fluchtM = -1;
        for (const j of jaeger) {
            if (j === creature || !j.position) continue;
            const d = Math.hypot(j.position.x - creature.position.x, j.position.z - creature.position.z);
            if (!(d < best)) continue;
            // GEFÜRCHTET WIRD NUR DER EIGENE JÄGER (jagd-quote 2, Auge wie Nase): wessen Beute das Tier nicht ist
            // (`_kreaturIstBeute`: wild, ein anderes Gehege, schwerer als jagd.beuteMasse × seine Masse), den flieht es nicht. Bis hier
            // floh der Bär (335 kg, nie Beute des 64-kg-Wolfs) das Rudel am Riss per Nase auf 28 m und kam nie an den Kadaver
            // (Bühne mahl: Fuchs und Bär „folgen dem Kadaver nicht“, main 18,5 · 15,9 s).
            if (!this._kreaturIstBeute(j, creature)) continue;
            const hetzt = j.userData && j.userData._motionZustand === "hetzen";
            if (fluchtM < 0) fluchtM = this._kreaturFluchtDistanzM(creature);
            // das Auge wird nur gefragt, wo es zählt: in der Fluchtdistanz (die Kosten folgen der Nähe, nie dem Bestand)
            let sicht = !hetzt ? sichtPirsch : d < fluchtM ? Math.min(fluchtM, this._kreaturSiehtM(creature, j)) : 0;
            // die Nase ebenso nur in der Fluchtdistanz, und nur, wo das Auge ihn nicht schon hat (Lehre 25: billige Filter zuerst)
            if (!(d < sicht) && d < fluchtM) {
                quelle[0].x = j.position.x;
                quelle[0].z = j.position.z;
                quelle[0].spur = (j.userData && j.userData._duftSpur) || AnazhRealm.DUFT_SPUR_LEER;
                if (this._scentAt(creature.position.x, creature.position.z, quelle) >= nase.schwelle) sicht = fluchtM;
            }
            if (d < sicht) [best, J, sichtJ] = [d, j, sicht];
        }
        // Ein jagender Jäger im Blick wiegt wie ein Treffer (combatFearWariness): die Beute flieht, solange sie ihn sieht
        // (Flucht-Radius = die Fluchtdistanz, die ihr Auge trägt).
        if (!J || NAT.combatFearWariness < wSpieler) return wSpieler;
        von.x = J.position.x;
        von.z = J.position.z;
        von.r = sichtJ;
        return NAT.combatFearWariness;
    }

    // Die nächste glühende Zelle des Brands in der Fluchtdistanz des Tiers (`_kreaturFluchtDistanzM`, das Maß seiner Gattung am
    // Erbe — die Glut sieht jedes Auge weit, geflohen wird sie wie der Mensch; `_brandGlutUm`: die Blöcke des letzten Schritts,
    // dieselben Zellen, die Licht, Rauch und Ohr lesen) → ihr Ort und der Flucht-Radius in `von`; ob eine glüht. Ohne Brand
    // kostet die Frage nichts.
    _kreaturGlutNah(creature, NAT, von) {
        const bf = this.state.brandFeld;
        if (!bf || !bf.size) return false;
        const [x, z, R] = [creature.position.x, creature.position.z, this._kreaturFluchtDistanzM(creature)];
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
        von.x = pm.x;
        von.z = pm.z;
        von.r = NAT.fleeRadius * weit;
        const dist = Math.hypot(creature.position.x - pm.x, creature.position.z - pm.z);
        // DEN GAST TRENNT DER GRABEN (`_gehegeVon`, Hagenbeck): ein Tier liest den Menschen jenseits des Rands eines Geheges
        // nicht — keine Flucht ans ferne Ende, keine Neugier an den Rand, es lebt seinen Tag; der Hieb (fearActive) schreckt.
        if (!fearActive && this._gehegeVon(creature) !== this._gehegeVon(this.state.playerMesh)) return 0;
        const e = (this.state.player && this.state.player.emotions) || {};
        // DIE BEDROHUNG der Aura (tetrapoda bedrohung — dieselbe, die den Abdruck am Ort wiegt). DIE FURCHT DER BEUTE SCHRECKT
        // IHREN JÄGER NIE (oekologie.K4#2): wer den Spieler jetzt pirscht oder hetzt, liest seine Aura nicht — er ist Beute wie
        // jedes Tier (keine Beute trägt ihre Aura in die Wariness ihres Jägers); der Hieb (fearActive) und die Erinnerung
        // schrecken weiter. Bis oekologie.K4#2 verscheuchte die Furcht des Umstellten (chaos × menaceFromChaos) sein Rudel.
        const jaegt = (this._spielerJaeger || []).includes(creature);
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const bedroht = FG.bedrohung(e, NAT);
        // ENTDECKUNG ≠ ALARM (auge-der-art 2): das Auge sagt, OB das Wesen den Spieler wahrnimmt (`sieht`: seine Farbe gegen den
        // Boden unter ihm im Rezeptorraum der Art, `_kreaturSiehtM` — Hunderte Meter); AB WELCHER NÄHE es ihn angeht, sagt die
        // Reichweite der Aura (`alarm`, tetrapoda auraReichM: die scheueste Natur erreicht die Flucht-Schwelle genau am
        // fleeRadius, 21 m) und, im pfad, die Fluchtdistanz seiner Gattung (`_kreaturMenschFlucht`, das Feldmaß). Bis auge-der-art
        // EIN noticeRadius 22 m für jede Gattung, jede Farbe und jeden Boden; bis auge-der-art 2 rampte die Wariness über die ganze
        // Sichtweite: auf 90 m stand der scheue Hirsch bei +0,80, der kühne bei −0,84 neugierig auf dem Weg zum Spieler (Playtest
        // Tier-Separation „Anker nicht initialisiert“); über die Fluchtdistanz gerampt fürchtete der Verband den Spieler 50 m vor
        // dem Radius seiner Flucht und zog, statt zu ruhen (gate:kreatur-takt herde: zweite Hand 0 von 4, tagesbudget: der Wolf
        // ruht 0,014 gegen 0,6). Ein Leib ohne Auge (keine Gattung im Gesetzbuch) sieht nichts.
        const auge = this._kreaturAuge(creature);
        const auraM = FG.auraReichM(NAT) * weit;
        // das Auge wird nur gefragt, wo es zählt — in der Aura und, im pfad, in der Flucht vor dem Menschen, die eine drohende
        // Aura weitet (`_kreaturMenschFlucht`, dasselbe Gesetz `fluchtDistanz`): die Kosten folgen der Nähe, nie dem Bestand
        const reichM =
            auge && mode === "pfad" && !jaegt
                ? Math.max(auraM, FG.fluchtDistanz(this._kreaturFluchtDistanzM(creature), erinnert, bedroht, ud.bond || 0, FG.F)) // prettier-ignore
                : auraM;
        const sieht = auge && dist <= reichM ? this._kreaturSiehtM(creature, this.state.playerMesh) * weit : 0;
        const alarm = Math.min(sieht, auraM);
        let wariness = 0; // fern → neutral, das Wesen wandert
        if (fearActive || dist <= alarm) {
            const menace = jaegt ? 0 : bedroht;
            // DIE NATUR des Wesens ist das Temperament seiner Gattung (Welle LF 08.10.): der Mut der Art (_kreaturMut) macht
            // kühn oder scheu, Bindung macht mutig. Vorher lasen hier die Substanz-Tags (dichte · härte · lebendig), die für
            // alle Tiere gleich sind (Lehre 8) — jeder Hirsch stand mit Wariness −1,0 neugierig am Spieler.
            const boldness = (this._kreaturMut(creature) * 2 - 1) * NAT.mutGewicht + (ud.bond || 0) * NAT.boldFromBond;
            const modeMul = mode === "pfad" ? 1 : mode === "frieden" ? NAT.friedenMenace : NAT.schoepferMenace;
            const proximity = alarm > 0 ? Math.max(0, 1 - dist / alarm) : 0;
            wariness = (menace * modeMul - boldness + erinnert) * (fearActive ? 1 : proximity);
            if (fearActive) wariness = Math.max(wariness, NAT.combatFearWariness);
        }
        // DER MENSCH IST DER SUPER-RÄUBER (leben.tiere.mensch S1, tetrapoda fluchtDistanz): im pfad flieht jedes Wesen den
        // Spieler ab der Fluchtdistanz seiner Gattung (`_kreaturMenschFlucht`); ihr Radius ist der Radius der Flucht — sobald es
        // ihn WAHRNIMMT (sein Auge, `sieht`; der Hieb): wen es nicht sieht, den flieht es nicht, der getarnte Jäger kommt
        // näher (auge-der-art). Vorher floh der Hirsch jeden Spieler ab 120 m, jede Farbe, jeden Boden.
        const D =
            mode === "pfad" && !jaegt && (fearActive || dist <= sieht)
                ? this._kreaturMenschFlucht(creature, dist, erinnert, bedroht, wariness)
                : 0;
        if (!(D > 0)) return wariness;
        if (D > von.r) von.r = D;
        return Math.max(wariness, NAT.fleeThreshold);
    }

    // DIE FLUCHTDISTANZ VOR DEM MENSCHEN (leben.tiere.mensch S1, tetrapoda FURCHT_GESETZ.fluchtDistanzM + fluchtDistanz): der
    // Radius (m), in dem das Wesen den Spieler jetzt flieht, oder 0. Das Feldmaß seiner Gattung (Hirsch 120 · Wolf 106 · Bär 55 ·
    // Fuchs 40 m), geweitet von erinnerter Furcht (`erinnert`) und drohender Aura (`menace`), aufgehoben von Gabe und Bindung.
    // Nur im pfad, wo der Mensch jagt und gejagt wird (wie die Jagd auf ihn, `_creatureScentHuntDir`) — frieden und schöpfer
    // tragen die Aura-Algebra allein. Wer ihn jagen will (`_kreaturJagdBereit` bei seiner Wariness `w`, und der Spieler ist
    // seine Beute), flieht ihn nicht. Vorher floh jede Gattung bei EINEM fleeRadius 14 m aus der Natur scheu, Wolf und Bär
    // nie: ein Rothirsch ließ den Spieler auf 14 m heran, wo er im Feld bei 100–200 m geht.
    _kreaturMenschFlucht(creature, dist, erinnert, menace, w) {
        // der leere Anker (bis der Guss des Spielers steht, `_deferredAvatarSoul`) ist kein Leib: niemand flieht und jagt ihn
        if (this.state._deferredAvatarSoul) return 0;
        const FG = AnazhRealm._furchtGesetz();
        const d0 = this._kreaturFluchtDistanzM(creature);
        const D = FG.fluchtDistanz(d0, erinnert, menace, creature.userData.bond || 0, FG.F);
        if (!(dist < D)) return 0;
        // DIE NÄHERUNG (FURCHT_GESETZ.naeherungMS): die Fluchtdistanz antwortet dem, der auf das Tier ZUGEHT — sein Lauf dieses
        // Takts (`_spielerLageAlt`, gleich welcher Weg ihn bewegt) auf das Tier zu; wer steht oder schleicht, wird beäugt, nicht
        // geflohen (Stankowich & Blumstein 2005: langsame Näherung, kürzere Flucht)
        const pm = this.state.playerMesh;
        const sa = this._spielerLageAlt;
        const p = pm.position;
        const zu = sa ? (sa.vx * (creature.position.x - p.x) + sa.vz * (creature.position.z - p.z)) / (dist || 1) : 0;
        if (!(zu >= FG.F.naeherungMS)) return 0;
        return this._kreaturJagdBereit(creature, w) && this._kreaturIstBeute(creature, pm) ? 0 : D;
    }

    // DIE FLUCHTDISTANZ DES INDIVIDUUMS (m, erbe-geburt — leben.evolution.zivilisation#1, „Kinder scheuer Eltern sind scheu“): das
    // Feldmaß seiner Gattung (tetrapoda FURCHT_GESETZ.fluchtDistanzM) am Erbe seines Tiers im Bestand (`userData._bestand`, die
    // Achse scheu des Gesetzes des Lebens: `__lebenCore.merkmal`) — es erbt sie von Mutter und Vater (`kind`), der Riss liest sie
    // (`fangGewicht`). Ein Leib ohne Tier (eine Bühne, die ihn selbst stellt) trägt kein Erbe: das Maß der Gattung. Bis erbe-geburt
    // floh jedes Tier einer Gattung bei derselben Zahl (Hirsch 120 · Wolf 106 · Bär 55 · Fuchs 40 m, Streuung 0).
    _kreaturFluchtDistanzM(creature) {
        const FG = AnazhRealm._furchtGesetz();
        const g = this._kreaturGattung(creature);
        const d0 = FG.F.fluchtDistanzM[g];
        if (!(d0 > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:FURCHT_GESETZ.fluchtDistanzM." + g);
        const t = creature.userData && creature.userData._bestand;
        return t && t.a ? AnazhRealm._lebenKern().merkmal(d0, t.a, t.e, "scheu") : d0;
    }

    // DAS AUGE DER ART SIEHT (auge-der-art, tetrapoda SINNES_GESETZ): die Distanz (m), in der dieses Tier `ziel` (den Spieler,
    // einen Jäger) sieht — die Schärfe aus der Augenlänge seines Leibs (`_kreaturAuge`), der Abstand der Farbe des Ziels gegen
    // den Boden unter ihm (`_bodenFarbeAt`, linear) in den Zapfen der Art, die Fläche des Ziels (`_sichtZiel`). Leser: die
    // Wariness vor dem Spieler, der hetzende Jäger. Ein Leib ohne Gattung im Gesetzbuch trägt kein Auge: er sieht nichts (0).
    _kreaturSiehtM(creature, ziel) {
        const A = this._kreaturAuge(creature);
        if (!A || !ziel || !ziel.position) return 0;
        const K = globalThis.__tetrapodaCore;
        const Z = this._sichtZiel(ziel);
        const p = ziel.position;
        // der Boden unter dem Ziel, am Ziel gemerkt je ORT (alle Tiere eines Takts sehen denselben Spieler auf demselben Boden:
        // EINE Frage je Ziel und Stand, eine neue mit jedem Schritt — die Kosten folgen der Änderung, nie der Zahl der Augen)
        const zu = ziel.userData || (ziel.userData = {});
        const B = zu._sichtBoden || (zu._sichtBoden = { x: NaN, y: NaN, z: NaN, f: [0, 0, 0] });
        if (B.x !== p.x || B.y !== p.y || B.z !== p.z) {
            this._bodenFarbeAt(p.x, p.y, p.z, B.f);
            [B.x, B.y, B.z] = [p.x, p.y, p.z];
        }
        const boden = B.f;
        // DIE LUFT DER WELT (auge-der-art 2): die Extinktion am Auge aus der EINEN Sichtweite, die Bild und Wetter lesen
        // (`_luftSichtM`, Koschmieder: β = −ln(LUFT.kontrast) / V) — kein eigener Dunst im Auge
        const beta = -Math.log(AnazhRealm.LUFT.kontrast) / this._luftSichtM(creature.position.y);
        return K.augeEntdeckung(A.cpd, Z.kanteM, K.augeAbstand(A.fang, Z.farbe, boden), A.fang.kanaele, beta);
    }

    // DAS AUGE DES LEIBS (tetrapoda `augeDesLeibs`): Taxon, Augenlänge und Schärfe aus den Dials seines Gusses (die Gattung mit
    // `gussDials`, `_ofenKreaturDials` — dieselben Zahlen, die der Ofen zum Augapfel formt) und seiner Größe (`bodySize`);
    // gemerkt je Größe. null für einen Leib ohne Gattung im Gesetzbuch.
    _kreaturAuge(creature) {
        const ud = creature.userData || {};
        const bs = ud.bodySize > 0 ? ud.bodySize : 1;
        if (ud._auge !== undefined && ud._augeBs === bs) return ud._auge;
        const K = globalThis.__tetrapodaCore;
        if (!K || !K.augeDesLeibs) return AnazhRealm._kernPflichtBruch("tetrapoda:augeDesLeibs");
        const d = this._ofenKreaturDials(this._kreaturGattung(creature), ud.gussDials);
        const A = d ? K.augeDesLeibs(K.deriveTierParams(d.dials), bs, AnazhRealm.FARBSICHT.lms) : null;
        if (A && (!A.fang || !(A.cpd > 0))) return AnazhRealm._kernPflichtBruch("tetrapoda:SINNES_GESETZ.art." + A.art);
        ud._augeBs = bs;
        return (ud._auge = A);
    }

    // DAS ZIEL IM BLICK: seine Farbe (linear-sRGB — das Mittel der Stoffe seines Leibs nach Fläche, Stoff-Farbe × Mittel seiner
    // Vertex-Farben: die Kleidung des Spielers, das Fell des Jägers) und die Kante des Quadrats gleicher Fläche (√(mittlere
    // waagrechte Ausdehnung × Höhe) — Riccò liest die Fläche). Am Ziel gemerkt, frisch nach 1 s der Kreatur-Uhr: ein Wechsel der
    // Kleidung zählt ab dem nächsten Blick, alle Tiere lesen dieselbe Zahl.
    _sichtZiel(ziel) {
        const ud = ziel.userData || (ziel.userData = {});
        const t = this.state.creatureAnimationTime || 0;
        const alt = ud._sichtZiel;
        if (alt && t >= alt.t && t - alt.t < 1) return alt;
        const box = new THREE.Box3(),
            v = new THREE.Vector3(),
            farbe = [0, 0, 0];
        let flaeche = 0;
        ziel.updateMatrixWorld(true);
        ziel.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.visible) return;
            const m = Array.isArray(o.material) ? o.material[0] : o.material;
            if (!m || !m.color) return;
            const g = o.geometry;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const r = g.boundingSphere.radius * o.getWorldScale(v).x;
            const a = r * r;
            const ton = [m.color.r, m.color.g, m.color.b];
            const vc = m.vertexColors && g.attributes.color;
            if (vc) {
                const schritt = Math.max(1, Math.floor(vc.count / 64));
                const s = [0, 0, 0];
                let n = 0;
                for (let k = 0; k < vc.count; k += schritt, n++) {
                    s[0] += vc.getX(k);
                    s[1] += vc.getY(k);
                    s[2] += vc.getZ(k);
                }
                for (let c = 0; c < 3; c++) ton[c] *= s[c] / n;
            }
            for (let c = 0; c < 3; c++) farbe[c] += ton[c] * a;
            flaeche += a;
            box.expandByObject(o);
        });
        const groesse = box.isEmpty() ? null : box.getSize(v);
        const kanteM = groesse ? Math.sqrt(((groesse.x + groesse.z) / 2) * groesse.y) : 0;
        return (ud._sichtZiel = { t, farbe: flaeche > 0 ? farbe.map((c) => c / flaeche) : farbe, kanteM });
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
