class AnazhRealm_kreatur_sicht {
    // ===== ATLAS · Kreatur/sicht — Kreatur-Ziegel (nah das Studio-Tier, fern die Glieder-Kapseln) · die Sicht eines Leibs · Fell am Bildschirm · der ruhende Leib · der Blick des Bilds =====
    // ═══ DER KREATUR-ZIEGEL: nah das Studio-Tier, fern die Glieder-Kapseln ═══
    // Nah (das Feld des Stufen-Gesetzes, `_feldGrenzen`, mit Hysterese) IST das Studio-Tier (tierBaum-Mesh) die Gestalt — seine
    // Kapseln schweigen, three cullt es je Pass (Körper-Kugel gegen Blick und Kaskaden-Box). Fern ist jedes GLIED Achse + Radius
    // + Farbe (dedupl. je Gattung×Glied), je Frame reist die Knochen-Matrix in die Liste (_weltFeldMatrix) → der March
    // sphere-tract im Glied-Raum. Bake getaktet, headless unverändert. `auge` = das Auge der Stufen (`_lodAuge`).
    _tickKreaturZiegel(auge, G) {
        const st = this.state;
        if (!auge || (st.renderer && st.renderer._isHeadlessNull)) return;
        // jeder Leib im Bild trägt seine Gestalt — die Wesen UND die Gefallenen (ein Leichnam liegt fern als Feld, nah als
        // Studio-Tier, wie er lag, bis er versunken ist)
        const W = st.creatures,
            LG = st.leichname;
        for (let k = 0, n = W.length + LG.length; k < n; k++) {
            const cr = k < W.length ? W[k] : LG[k - W.length];
            if (!cr || !cr.position) continue;
            // der ruhende Leib (K59) zeichnet nirgends: sein Satz ist aus (`_tickKreaturRuhe`), er schreibt keine Glied-Matrix
            // und lädt die Liste nicht hoch; erwacht, schreibt er im selben Takt (`_kzLeib`)
            if (cr.userData && cr.userData._ruht === true) continue;
            this._kzLeib(cr, auge, false, G);
        }
    }

    // DER ZIEGEL EINES LEIBS: nah das Studio-Tier (mit Hysterese), fern seine Glieder ins Feld — je Takt aus dem Ziegel, und
    // für einen Leib, den der Blick des Bilds weckt (`_ruheImBild`), direkt vor dem Zeichnen. `vorab`: die Glieder backen
    // schon nah (im Takt des Bakes, ruhend) — ein Leib, der hinausgeht, trägt sein Feld ab dem ersten Schritt (mensch.K2).
    // Die Seite wählt das Stufen-Gesetz (das Feld, `_feldGrenzen`) mit Gedächtnis (`_stufeGemerkt`) am Auge der Stufen `auge` —
    // steht das Auge und rührt sich der Leib nicht, rechnet es nichts; bis stufen-gesetz maß sie vom Spieler, in der
    // Verfolger-Kamera um den Arm daneben, und ihre Grenze war je Familie eigen (Tier und Mensch je ein Kreis).
    _kzLeib(cr, auge, vorab = false, G = null) {
        const p = cr.position;
        const u = cr.userData || (cr.userData = {});
        const m = u._feldWahl || (u._feldWahl = AnazhRealm._wahlGedaechtnis());
        const GF = G && !u._menge ? G : this._feldGrenzen(!!u._menge); // `G`: das Feld der Tiere dieses Takts (der Ziegel)
        u._kzNah = AnazhRealm._stufeGemerkt(m, u._kzNah === true ? 0 : 3, GF, 1, p, auge) !== 3;
        const d2 = (p.x - auge.x) * (p.x - auge.x) + (p.z - auge.z) * (p.z - auge.z); // nur der Bake-Takt liest ihn
        // DER FIT-TAKT ZÄHLT FITS (w25-ferne-licht-3, wie sk5-haus und die Streu): die Kapsel jedes Glieds passt der Vorrat EINMAL
        // je Gattung (`_gliedKapselMemo`); trägt die Liste jeden Schlüssel schon (`kapselCache`), kostet der Leib Einträge, nie
        // einen Fit — er wartet nie am Takt. Bis hier fragte jeder Bewohner die Uhr (`_weltBakeErlaubt`, 4 je Sekunde über dem
        // Budget): am Anlauf des Gipfel-Blicks (die Metropole, 959 Leiber, swiftshader) gab sie 1 282 Güsse à 0,04 ms in 370 s
        // frei und sagte 10,7 Mio. Mal nein — Takt 13 000 … 34 000 wartete die Welt auf Treffer. Mit Treffern frei gehen die
        // Leiber 461 → 0 in ~4 500 Takten (die Geburten, 2 je Takt), der Ort steht nach 21 441 Takten samt Gipfel.
        const darf = () => {
            const S = this._leibSatzStufe(cr); // die Einträge seiner Stufe: die Glieder oder fern die EINE Hülle
            const namen = S && S.namen;
            const wm = namen && this.state.weltMarch;
            return !!namen && (namen.every((nm) => wm && wm.kapselCache.has(nm.key)) || this._weltBakeErlaubt(d2));
        };
        if (u._kzNah) {
            u._kzNahGewesen = true; // das Studio-Tier stand schon im Bild — sein Satz übernimmt später, ohne Einblenden
            if (vorab && !u._kzGlieder && !u._kzVersuch && darf()) {
                u._kzVersuch = true;
                this._leibMatrix(cr);
                u._kzGlieder = this._kreaturGliederBacken(cr, false);
            }
            // Der schwindende Satz folgt den Knochen weiter (sonst geisterte er 0,5 s an der alten Pose) — der des Bewohners
            // der Lage seiner Gestalt (`_bewohnerFeldLage`: EIN Schreiber, w28-leib-im-ring).
            const BL = u._feldLageVon;
            if (BL) this._bewohnerFeldLage(BL.b, BL.S, false);
            else if (u._kzGlieder)
                for (const gl of u._kzGlieder) {
                    if (gl.handle._schwundT0 !== undefined) this._weltFeldMatrix(gl.handle, gl.teil.matrixWorld);
                    this._weltFeldAktiv(gl.handle, false);
                }
            return; // das Studio-Tier trägt (gecullt je Pass an seiner Körper-Kugel)
        }
        if (!u._kzGlieder) {
            if (u._kzVersuch) {
                // Fern-Fit gescheitert (Atlas voll) — das Fehlen ist sichtbar, laut im Register.
                cr.visible = false;
                return;
            }
            // getaktet, oder die Gattung kalt (ihr Vorrat im Leerlauf bestellt, `_gattungGlieder`): bis dahin trägt der Körper
            if (!darf()) return;
            u._kzVersuch = true;
            this._leibMatrix(cr);
            // Fern geboren (nie nah im Bild, kein Satz trug ihn): die Glieder blenden bei ihrer Geburt ein, statt zu ploppen.
            u._kzGlieder = this._kreaturGliederBacken(cr, !u._kzNahGewesen && !u._satz);
            if (!u._kzGlieder) {
                cr.visible = false;
                return;
            }
        }
        // DIE KNOCHEN TRAGEN DIE FELDER (die Pose der letzten Animations-Auswertung als inverse
        // Welt-Matrix je Glied):
        const an = this.state.creaturesHidden !== true;
        const BL = u._feldLageVon; // der Bewohner: die Lage seiner Gestalt trägt seine Glieder (`_bewohnerFeldLage`)
        if (BL) this._bewohnerFeldLage(BL.b, BL.S, an);
        else
            for (const gl of u._kzGlieder) {
                this._weltFeldMatrix(gl.handle, gl.teil.matrixWorld);
                this._weltFeldAktiv(gl.handle, an);
            }
        cr.visible = false; // fern IST das Feld die Gestalt
    }

    // Gehört dieses Tier dem Feld? Nur FERN und sobald ein Bake-Versuch lief (mit Gliedern oder
    // gescheitert); nah und in der Bake-Rampe ist das Studio-Tier sichtbar, three cullt es je Pass. Ein Bewohner in seinem
    // Haus (`_drinnen`, mensch.K2) gehört keinem Feld, einer am Steuer auch nicht — sein Leib gehört dem Wagen (`_verkehrSitz`).
    _kzBesitztFeld(cr) {
        const u = cr && cr.userData;
        if (!u || u._kzNah === true || u._drinnen === true || (u._feldLageVon && u._feldLageVon.b.amSteuer))
            return false;
        return !!(u._kzGlieder || u._kzVersuch);
    }

    // ZEICHNET DIESER LEIB? (die EINE Antwort für jeden Leser: die Abnahme des Blicks `gestaltLeben`, die Menge der Bewohner) —
    // nah sein Mesh (`visible`), im Satz der Satz (`_satz`: das Tier trägt sein Satz-Objekt, der Bewohner der Menge einen
    // Wahrheitswert), fern das Feld seiner Glieder, wenn ein Eintrag zeichnet (`_weltFeldZeichnet`, derselbe Leser wie
    // `_archImBild`). Ein ruhender Leib und einer, dessen Fern-Fit scheiterte, zeichnet nirgends. Vorher fragte die Abnahme
    // nur Mesh und Satz: der ferne Leib (`_kzLeib` setzt `visible = false`, das Feld IST die Gestalt) hieß UNGEZEICHNET
    // (leben.tiere.masse#1, Herde am Hang: die fliehende Herde 5 von 5 „UNGEZEICHNET“ bei freiem Ziel, GTX und Radeon).
    _leibGezeichnet(cr) {
        if (!cr || this.state.creaturesHidden === true) return false;
        const u = cr.userData || {};
        if (cr.visible !== false || u._satz) return true;
        return !!u._kzGlieder && u._kzGlieder.some((gl) => this._weltFeldZeichnet(gl.handle));
    }

    // DIE LEIBER FOLGEN DEM AUGE (das Bild ohne Takt: der Schuss der Aufnahme, `__nahFolgt`, und die Pose einer Probe): das
    // Stufen-Gesetz wählt am Auge der Kamera neu, wie es der nächste Takt des Spiels täte — der Ziegel (Leib oder Feld, `_kzLeib`),
    // der Tier-Satz, der Blick des Bilds (`_ruheImBild`) und die Sicht je Leib (`_leibSicht`: ein Leib, der eben aus dem Feld kam,
    // zeichnet erst mit ihr). Die Wahl lebt im Takt; ein Bild, das die Kamera ohne Takt umsetzt, zeichnete bis hier die Stufe des
    // vorigen Auges: leben.tiere.masse#1 (Herde am Hang, GTX bed6256c und Radeon b3740dd5) — die fliehende Herde jenseits
    // ANALOG_NAH_M des vorigen Auges stand im Schuss auf 42,9 m als Feld-Kapseln, die Abnahme nannte 5 von 5 UNGEZEICHNET.
    // Vorher lebte die Wahl als Zwilling in der Kreatur-Probe (`stufenAm`, scripts/lib/kreatur-proben.cjs).
    _leiberAmAuge() {
        const au = this._lodAuge();
        if (!au) return;
        this._loopFrustumCulling();
        this._tickKreaturZiegel(au, this._feldGrenzen(false));
        this._tickTierSatz(au);
        this._ruheImBild();
        for (const c of this.state.creatures) if (c && c.userData) this._leibSicht(c, this.isInFrustum(c), au);
    }

    // DAS FELL-BILDSCHIRM-GESETZ (Gebot 7: Kosten an den Schirm): das Fell (die Schalen, dazu Rest-Strähnen wie der
    // Nasenrücken) ist eine STUFE der Gestalt — es zeichnet nur, wo die feine Gestalt das Bild trägt (`gestalt`: nicht
    // jenseits der Gelenk-Grenze, im Satz, im Feld — die Grobstufe ist kahl) und solange die Höhe seines Schalen-Stapels
    // (`_fellHoehe`) LOD_SCHIRM.px Bildpunkte trägt, über die Brennweite des EINEN Schirms (`_brennweite`) und die
    // Tiergröße; darunter trägt die Haut mit FELL_LOOK. Die EINE Wahl mit Hysterese und Gedächtnis (`_stufeGemerkt`) am Auge
    // der Stufen; geschaltet wird nur `visible`. Vorher trugen Satz, Feld und Grobstufe `_fellAn` ungesetzt („an“ in jeder
    // Ferne, haar.K5 Radeon 5fba36ea). Ohne Schirm bleibt der Zustand der feinen Gestalt.
    _fellBildschirmGesetz(creature, tB, auge, gestalt = true) {
        if (!tB.straehnen) {
            tB.straehnen = [];
            tB.wrap.traverse((o) => {
                const kl = o.isMesh && o.userData && o.userData.__klasse;
                if (typeof kl === "string" && (kl.indexOf("straehne") === 0 || kl === "fellSchale"))
                    tB.straehnen.push(o);
            });
        }
        if (!tB.straehnen.length) return;
        const war = tB._fellAn !== false;
        let an = false;
        if (gestalt) {
            const pxJeM = this._schirm().pxJeM;
            if (!auge || pxJeM == null) return;
            const z = this._schirm().hoehe;
            if (!tB._fellG || tB._fellG.z !== this._schirm().wahl || tB._fellG.f !== tB.f) {
                const ab = (AnazhRealm._fellHoehe(tB) * AnazhRealm._brennweite(z)) / AnazhRealm.LOD_SCHIRM.px;
                tB._fellG = { erste: 0, grenzen: [{ stufe: 1, ab, h: AnazhRealm.FELL_BILDSCHIRM.hyst }], z: this._schirm().wahl, f: tB.f }; // prettier-ignore
            }
            const p = creature.position;
            const m = tB._fellWahl || (tB._fellWahl = AnazhRealm._wahlGedaechtnis());
            an = AnazhRealm._stufeGemerkt(m, war ? 0 : 1, tB._fellG, creature.scale.x || 1, p, auge, true) === 0;
        }
        if (an === war && tB._fellAn !== undefined) return;
        tB._fellAn = an;
        for (const s of tB.straehnen) s.visible = an;
    }

    _kreaturZiegelTod(cr) {
        const u = cr && cr.userData;
        if (!u) return;
        if (u._kzGlieder) for (const gl of u._kzGlieder) this._weltFeldFrei(gl.handle);
        u._kzGlieder = null;
        u._kzVersuch = false;
    }

    // DIE SICHT EINES LEIBS (je Takt — die Wesen im Kreatur-Takt, die Gefallenen in _tickLeichname): die EINE Stelle, an der
    // ein Leib im Bild seine Darstellung wählt. Der Sichtbarkeits-Besitzer: trägt das Tier sein Feld, gehört `visible` dem
    // Kreatur-Ziegel (der Mesh-Rückweg bliebe sonst lebendig; _kzVersuch hält den Körper unsichtbar, auch bei Atlas-
    // Erschöpfung) — sonst ist das Mesh-Tier sichtbar, gecullt JE PASS an der Körper-Kugel jeder Hülle (frustumCulled, gegen
    // den Blick UND jede Kaskaden-Box: ein Tier hinter dem Blick wirft ins Bild). Die STUFE folgt dem Abstand vom Auge der
    // Stufen (`_lodAuge`), in und außer Blick, am EINEN Schalter der Gelenk-Gestalt (`_gelenkStufe`, das Stufen-Gesetz) —
    // jenseits die gelenkige Grobstufe, diesseits die Gestalt mit Schatten (die Grobstufe wirft als ihr Zwilling): ein Leib
    // hinter dem Blick wirft in die Kaskaden, und der Gang der Sicht-Kopie hängt an ihrer Stufe (gate:kreatur-kosten (F):
    // eine Kopie außer Blick ging jenseits der Grenze mitten im Schritt weiter, 1,407 rad). Im Blick dazu das
    // Fell-Bildschirm-Gesetz und die Zeichen über dem Leib (die Aura des Auftrags, die Traglast — ein Gefallener trägt keine,
    // `_kreaturFaellt`). Vorher lebte die Wahl im Takt der Wesen: ein Leichnam behielt 90 s die Stufe, in der er fiel
    // (Tod-Zensus: fern gefallen lag er auf 2 m als Fern-Guss ohne Schatten, nah gefallen trug er auf 40 m die volle Gestalt
    // — 2 400 von 5 460 Leichnam-Takten). `auge` = das Auge der Stufen, EINMAL je Takt beim Rufer (`_lodAuge`). Rückgabe: fern?
    _leibSicht(creature, inFrustum, auge, zeilen) {
        const ud = creature.userData;
        // im Satz (`_tickTierSatz`) zeichnet der Leib nicht
        if (!this._kzBesitztFeld(creature)) creature.visible = this.state.creaturesHidden !== true && !ud._satz;
        const a = auge || this._lodAuge() || creature.position;
        const fern = this._gelenkStufe(creature, a, creature.position, zeilen);
        // das Fell ist eine Stufe der feinen Gestalt (DIESELBE Wahl): tragen Grobstufe, Satz oder Feld das Bild, ist es aus
        const gestalt = !fern && !ud._satz && !this._kzBesitztFeld(creature);
        if (ud._tierBaum && !gestalt) this._fellBildschirmGesetz(creature, ud._tierBaum, a, false);
        if (!inFrustum) return fern; // das Bild-Gesetz setzt DERSELBE Frame, in dem der Leib in den Blick kommt
        if (gestalt && ud._tierBaum) this._fellBildschirmGesetz(creature, ud._tierBaum, a);
        // Welle 6.H — die Aura des Auftrags folgt dem Leib (über dem Mesh), das Sprite der Traglast darüber (P2B.5)
        const auraY = ud.taskAura || ud.carryingSprite ? this._creatureAuraOffsetY(creature) : 0;
        if (ud.taskAura)
            ud.taskAura.position.set(creature.position.x, creature.position.y + auraY, creature.position.z);
        if (ud.carryingSprite)
            ud.carryingSprite.position.set(creature.position.x, creature.position.y + auraY + 0.5, creature.position.z);
        return fern;
    }

    // ═══ DER RUHENDE LEIB (K59, Gebot 7: Kosten an Schirm + Änderung) ═══
    // Vorher ging jedes Tier jeden Frame voll: an Genesis (Third, OMEN) kosteten 10 ferne Tiere außer Bild 0,72 ms
    // Kreatur-Takt (der Ziegel schrieb 120 Glied-Matrizen und lud die Feld-Liste hoch) und 0,23 ms Matrix-Gang der Szene
    // (750 ihrer 1 070 Knoten sind diese Skelette). Je Takt entscheidet `_kreaturRuht` (KREATUR_RUHE) neu. Ein ruhender
    // Leib ZEICHNET NIRGENDS: er ruht nur, wenn das Feld seine Gestalt trägt (`_kzBesitztFeld` — sein Mesh zeichnet und
    // wirft nicht), sein Satz geht beim Ruhe-Beginn sofort aus, und der Blick des Bilds (`_ruheImBild`, im Render-Pfad)
    // weckt jeden, den die Kamera dieses Bilds sieht. Er geht im groben Takt (`_kreaturTaktDt`), schreibt kein Feld
    // (`_tickKreaturZiegel`) und verlässt den Matrix-Gang (`AnazhRealm._ruhendeWurzel` an seiner Wurzel). Wer seine Glieder
    // liest, liest sie frisch (`_kreaturTrefferGlieder`, `_leibMatrix`: Biss, Treffer, Tod); wer erwacht, zieht den ganzen
    // Leib nach, bevor das Feld ihn liest. Die Gefallenen ruhen nie. Linse: gate:kreatur-kosten (G).
    _tickKreaturRuhe(delta, auge, G) {
        const R = AnazhRealm.KREATUR_RUHE;
        const st = this.state;
        const W = st.creatures;
        for (const c of st.leichname) if (c && c.userData && c.userData._ruht === true) this._kreaturErwacht(c);
        const fr = this._frustumCache;
        const cam = st.camera;
        // DER RAND DES BLICKS: der Frustum ist der des Vor-Frames, die Kamera dreht bis zum Render dieses Frames weiter —
        // der Rand wächst um die doppelte Drehung des Vor-Frames; dreht sie schneller als ~69°, ruht in diesem Frame keiner.
        let rand = (this._blickRand = -1); // die Geburt und das Entkörpern fragen denselben Rand (`_kreaturBlickRand`)
        if (fr && cam && auge) {
            const q = this._ruheKamQ || (this._ruheKamQ = cam.quaternion.clone());
            const dreh = 2 * Math.acos(Math.min(1, Math.abs(q.dot(cam.quaternion))));
            q.copy(cam.quaternion);
            const winkel = R.randGrad * (Math.PI / 180) + 2 * dreh;
            if (winkel < 1.2) rand = this._blickRand = Math.tan(winkel);
        }
        for (let i = 0; i < W.length; i++) {
            const c = W[i];
            if (!c || !c.userData) continue;
            if (rand >= 0 && this._kreaturRuht(c, auge, fr, rand, delta, G)) {
                if (c.userData._ruht !== true) {
                    c.userData._ruht = true;
                    c.updateMatrixWorld = AnazhRealm._ruhendeWurzel;
                    // sein Satz geht SOFORT aus (außer Bild, kein Mesh übernimmt): sonst stünde er, wo die Ruhe begann
                    if (c.userData._kzGlieder)
                        for (const gl of c.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false, true);
                }
            } else if (c.userData._ruht === true) this._kreaturErwacht(c);
        }
    }

    // Ruht dieser Leib in diesem Takt? Billige Filter zuerst (Lehre 25): der Zustand, die Gestalt, die Ferne, das Tempo,
    // die Jäger des Takts (`_kreaturJaeger`, die EINE Liste — in ihrer Witterung ruht kein Tier, der Biss liest die Glieder
    // der Beute) — der Blick zuletzt (die Körper-Kugel samt Saum und Rand gegen den Frustum). `auge` = das Auge der Stufen.
    _kreaturRuht(c, auge, frustum, rand, delta, G) {
        const R = AnazhRealm.KREATUR_RUHE;
        const u = c.userData;
        if (u._stossV || (u._hopH || 0) > 0 || (u._hopV || 0) > 0) return false;
        const z = u._motionZustand;
        if (z === "jagd" || z === "hetzen" || z === "flucht" || z === "schwimmen") return false;
        if (u._verhaltenAktion && u._verhaltenAktion.biss) return false;
        const task = this._getCreatureTask(c);
        if (task && task.name !== "wander") return false;
        // nur wem das Feld die Gestalt trägt (fern UND gebacken): ungebacken oder nah (`_kzNah`, auch im Takt, in dem er
        // `aus` nach außen kreuzt) zeichnet sein Mesh und wirft in die Kaskaden — er ruht nie
        if (!this._kzBesitztFeld(c)) return false;
        const p = c.position;
        const aus = (G && !u._menge ? G : this._feldGrenzen(!!u._menge)).aus; // `G`: das Feld der Tiere dieses Takts
        if ((p.x - auge.x) * (p.x - auge.x) + (p.z - auge.z) * (p.z - auge.z) < aus * aus) return false;
        const v = u._steuer ? Math.abs(u._steuer.v) : 0;
        if (v * R.takt * delta > R.wegMax) return false;
        const w2 = R.witterungM * R.witterungM;
        const jaeger = this._kreaturJaeger;
        if (jaeger)
            for (const j of jaeger) {
                if (j === c) continue;
                const jx = j.position.x - p.x,
                    jz = j.position.z - p.z;
                if (jx * jx + jz * jz < w2) return false;
            }
        return this._kreaturAusserBlick(c, frustum, rand);
    }

    // DER LEIB AUSSER BLICK (die EINE Frage des Blicks an einen Leib — die Ruhe `_kreaturRuht`, das Auge des Satzes
    // `_tierSatzImBild`): die Körper-Kugel samt Saum (`KREATUR_RUHE.saumM`) und Rand (`rand` je Meter Abstand zur Kamera: im
    // Takt der Vor-Frame-Frustum und die Drehung bis zum Render, `_tickKreaturRuhe`; im Bild 0) gegen den Frustum
    _kreaturAusserBlick(c, frustum, rand) {
        const R = AnazhRealm.KREATUR_RUHE;
        const u = c.userData;
        const p = c.position;
        // die Körper-Kugel: Reichweite des Leibs waagrecht, die halbe Höhe senkrecht (je Leib und Größe einmal)
        if (!(u._ruheKugelR > 0) || u._ruheKugelS !== c.scale.x) {
            const leib = this._kreaturLeib(c, 0, this._ruheLeib || (this._ruheLeib = {}));
            u._ruheKugelR = leib.reichweite + 0.5 * leib.hoehe;
            u._ruheKugelH = 0.5 * leib.hoehe;
            u._ruheKugelS = c.scale.x;
        }
        const s = this._ruheKugel || (this._ruheKugel = new THREE.Sphere(new THREE.Vector3(), 0));
        s.center.set(p.x, p.y + u._ruheKugelH, p.z);
        const cp = this.state.camera.position;
        s.radius = u._ruheKugelR + R.saumM + s.center.distanceTo(cp) * rand;
        return !frustum.intersectsSphere(s);
    }

    // DIE RICHTUNG DES SCHATTENS (die EINE Licht-Quelle der Kaskaden, `directionalLight`): waagrecht weg vom Licht (`x`, `z`)
    // und die Länge je Meter Höhe des Werfers (`cot`, der Kotangens der Licht-Höhe); null ohne Licht
    _kreaturLicht() {
        const dl = this.state.directionalLight;
        if (!dl) return null;
        const v = (this._kreaturLichtV || (this._kreaturLichtV = new THREE.Vector3()))
            .subVectors(dl.position, dl.target.position)
            .normalize();
        const h = Math.hypot(v.x, v.z) || 1;
        return { x: -v.x / h, z: -v.z / h, cot: h / Math.max(v.y, 1e-3) };
    }
    // DER WURF AUSSER BLICK: der Leib ist außer Blick, und sein Schatten auch — die Körper-Kugel längs des Schattens (Länge
    // Höhe × `licht.cot`, gekappt bei `KREATUR_RUHE.wurfM`), um die halbe Länge gewachsen, gegen den Frustum
    _kreaturWurfAusserBlick(c, frustum, licht) {
        if (!this._kreaturAusserBlick(c, frustum, 0)) return false;
        if (!licht) return true;
        const u = c.userData;
        const L = Math.min(AnazhRealm.KREATUR_RUHE.wurfM, 2 * u._ruheKugelH * licht.cot);
        const s = this._ruheKugel;
        s.center.set(c.position.x + 0.5 * L * licht.x, c.position.y + u._ruheKugelH, c.position.z + 0.5 * L * licht.z);
        s.radius = u._ruheKugelR + AnazhRealm.KREATUR_RUHE.saumM + 0.5 * L;
        return !frustum.intersectsSphere(s);
    }

    // DIE ZEIT DES SCHRITTS (der grobe Takt): ein ruhender Leib sammelt die Frame-Zeit und geht nur in seinem Fenster
    // (`slot` % takt === 0) mit allem Gesammelten — null = kein Schritt in diesem Frame; ein erwachter trägt den Rest in
    // seinen ersten Schritt. `_taktN` = die Frames, die dieser Schritt trägt (wach 1): die KI rechnet, wenn in ihre Spanne
    // ein KI-Takt fiel (die Kadenz, nie die Entscheidung).
    _kreaturTaktDt(creature, slot, delta) {
        const u = creature.userData;
        if (u._ruht === true) {
            u._ruheDt = (u._ruheDt || 0) + delta;
            u._ruheN = (u._ruheN || 0) + 1;
            if (slot % AnazhRealm.KREATUR_RUHE.takt !== 0) return null;
        } else if (!(u._ruheDt > 0)) {
            u._taktN = 1;
            return delta;
        } else {
            u._ruheDt += delta;
            u._ruheN = (u._ruheN || 0) + 1;
        }
        const dt = u._ruheDt;
        u._taktN = u._ruheN;
        u._ruheDt = 0;
        u._ruheN = 0;
        return dt;
    }

    // DAS ERWACHEN: die eigene Matrix-Wurzel fällt (der Szenen-Gang steigt wieder ins Skelett), und der ganze Leib zieht
    // JETZT nach — vor dem Ziegel, der seine Glieder ins Feld schreibt, und vor jedem Leser dieses Takts.
    _kreaturErwacht(c) {
        c.userData._ruht = false;
        delete c.updateMatrixWorld;
        c.updateMatrixWorld(true);
    }

    // DER BLICK DES BILDS (im Render-Pfad `_loopRender` — dem EINEN, durch den auch die Ausgabe-Aufnahme zeichnet): die Ruhe
    // entschied der Takt am Frustum des Vor-Frames; danach kann die Kamera springen (Teleport, Portal, Respawn), schneller
    // drehen als der Rand oder ohne Takt gesetzt werden (die Aufnahme). Hier steht der Blick DIESES Bilds: jeder ruhende Leib,
    // der unter ihm nicht mehr ruht (`_kreaturRuht` mit seinem Frustum, ohne Rand — im Bild oder dem Spieler jetzt nah),
    // erwacht und schreibt Feld (`_kzLeib`) und Sicht (`_leibSicht`), bevor das Bild ihn zeichnet. Rückgabe: die Geweckten.
    _ruheImBild() {
        const st = this.state;
        const cam = st.camera;
        const pm = this._lodAuge();
        if (!cam || !pm) return 0;
        let fr = null;
        const blick = () => {
            if (!fr) {
                cam.updateWorldMatrix(true, false);
                const m = (this._ruheBildM || (this._ruheBildM = new THREE.Matrix4())).multiplyMatrices(
                    cam.projectionMatrix,
                    cam.matrixWorldInverse
                );
                fr = (this._ruheBildF || (this._ruheBildF = new THREE.Frustum())).setFromProjectionMatrix(m);
            }
            return fr;
        };
        // das Auge des Tier-Satzes sieht mit demselben Blick (`_tierSatzImBild`)
        if (this._tierSaetze && this._tierSaetze.size) this._tierSatzImBild(blick());
        let n = 0;
        for (const c of st.creatures) {
            if (!c || !c.userData || c.userData._ruht !== true) continue;
            if (this._kreaturRuht(c, pm, blick(), 0, 0)) continue;
            this._kreaturErwacht(c);
            n++;
            if (st.renderer && st.renderer._isHeadlessNull) continue;
            this._kzLeib(c, pm);
            this._leibSicht(c, true, pm);
        }
        return n;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_sicht]);

// ===== ATLAS · Kreatur/sicht — Außen-Konstanten =====
// DER RUHENDE LEIB (K59, Gebot 7: Kosten an Schirm + Änderung): ein lebendes Tier außer Bild, dem das Feld die Gestalt
// trägt (`_kzBesitztFeld`: jenseits der Nah-Gestalt des Stufen-Gesetzes, `_feldGrenzen`, und gebacken — sein Mesh zeichnet
// und wirft nicht, das Feld wirft keinen Schatten), ohne laufenden Zustand ruht (`_kreaturRuht`): es geht nur jeden `takt`-ten Frame,
// mit der aufgelaufenen Zeit (`_kreaturTaktDt` — die Zeit geht nie verloren), sein Satz ist aus (er zeichnet nirgends), und
// es verlässt den Matrix-Gang der Szene. Der grobe Schritt bleibt kürzer als `wegMax` m (ein schnellerer Leib geht voll; der
// Weg fegt in Teil-Schritten, `_kreaturWeg`). Der Blick-Test des Takts hinkt einen Frame (die Kamera dreht nach dem
// Kreatur-Takt): der Rand wächst um `randGrad`° plus die doppelte Drehung des Vor-Frames, dazu `saumM` m — und der Blick
// des Bilds (`_ruheImBild` in `_loopRender`) weckt, was die Kamera dieses Bilds dennoch sieht (Teleport, Portal, Aufnahme).
// In der Witterung eines Jägers (`witterungM` m) ruht kein Tier (der Biss liest seine Glieder). Ein Schatten reicht höchstens
// `wurfM` m weit (`_kreaturWurfAusserBlick`).
AnazhRealm.KREATUR_RUHE = Object.freeze({ takt: 4, wegMax: 0.25, randGrad: 10, saumM: 2, witterungM: 60, wurfM: 12 });
// Die Wurzel eines ruhenden Leibs trägt diese `updateMatrixWorld` als eigene Eigenschaft: der Szenen-Gang (three r184
// steigt sonst in jedes Kind, auch unter `matrixWorldAutoUpdate = false`) übergeht sein Skelett. Leser ziehen über
// `_leibMatrix` nach, das Erwachen (`_kreaturErwacht`) nimmt sie wieder ab.
AnazhRealm._ruhendeWurzel = function ruhendeWurzel() {};
// `_fellBildschirmGesetz`: das Hysterese-Band (die Strähnen-Breite 0,018 bei 0,1 px fiel: geeicht vor V18.497 bei f ≈ 0,1)
AnazhRealm.FELL_BILDSCHIRM = Object.freeze({ hyst: 0.1 });
// DIE HÖHE DES FELLS in m bei Tiergröße 1: der Median von |Lage − Wurzel| über die äußerste Schale (foundry `__tierFellSchalen`:
// aSchale.x = t, aWurzel die Haar-Wurzel) × Guss-Faktor `tB.f` — je Geometrie EINMAL; ein Fell ohne Schalen-Stapel bricht laut.
AnazhRealm._fellHoehe = function (tB) {
    let best = 0;
    for (const { geometry: g } of tB.straehnen) {
        const A = (g && g.attributes) || {};
        if (!A.aSchale || !A.aWurzel) continue;
        const [S, W, P, d] = [A.aSchale, A.aWurzel, A.position, []];
        let tMax = 0;
        for (let i = 0; i < S.count && !(g.userData._fellHoehe > 0); i++) tMax = Math.max(tMax, S.getX(i));
        for (let i = 0; i < S.count && tMax > 0; i++)
            if (S.getX(i) >= tMax - 1e-4)
                d.push(Math.hypot(P.getX(i) - W.getX(i), P.getY(i) - W.getY(i), P.getZ(i) - W.getZ(i)));
        if (d.length) g.userData._fellHoehe = d.sort((x, y) => x - y)[d.length >> 1];
        best = Math.max(best, g.userData._fellHoehe || 0);
    }
    if (!(best > 0))
        throw new Error("FELL: das Fell des Tiers trägt keinen Schalen-Stapel (aSchale/aWurzel) — keine Höhe");
    return best * (tB.f || 1);
};
