class AnazhRealm_siedlung_wege {
    // ===== ATLAS · Siedlung/wege — Wege-Karte · Kronen-Streu · Fluss-Karte · Boden-Decke · Tritt-Fläche · Zaun und Mauer =====
    // ═══ DIE WEGE-KARTE (V18.530): Siedlungs-Wege sind BODEN, kein Bauwerk ═══
    // Befund 04.10. (Blick-Tour 1-nord · 3-markt · 4-west, echte GPU): Straßen, Feldwege, Platz und Äcker lagen als
    // flache Box-Streifen (0,14 m) auf der Gesetz-Höhe — der sichtbare Boden (Surface-Nets, ±0,2 m) schnitt sie:
    // harte Kanten, schwarze Linien zwischen den gekippten Segmenten (die Stirnflächen des nächsten Streifens),
    // Gras stach durch, am Ring-Rand schwebten sie über der Leere. Jetzt trägt der Boden den Weg: eine welt-
    // verankerte Karte um den Spieler (R = getretene Erde, G = Acker), weich gerändert aus dem Kapsel-/Kasten-
    // Abstand, gelesen vom Boden-Shader (`_terrainGeologyAlbedo`: die Pfad-Erde der Boden-Palette, nur auf
    // Begehbarem) und von der Wiese (`_pfadFeldAt`: kein Halm auf dem Weg) — DIESELBEN Bytes sind GPU-Textur
    // und CPU-Leser. Die Formen (Segmente, Plätze, Äcker) bleiben je Siedlung gemerkt; ein Fenster-Umzug malt neu.
    // DIE CLIPMAP (Integration 05.10.): EIN Fenster von 512 m sicherte mit dem Umzug ab 128 m nur ~120 m — zwischen
    // 120 m und der Ring-Kante (194 m) fielen Wege weg und poppten beim Umzug (der alte Pool zeichnete jede Siedlung).
    // Zwei Stufen (`WEGE_KARTE.stufen`): NAH 0,5-m-Texel bis 208 m, FERN 2-m-Texel bis 768 m (der größte Chunk-Ring
    // reicht 540 m); Boden-Shader und CPU-Leser wählen dieselbe Stufe nach derselben Grenze (`_wegeStufeNah`).
    _wegeKarteEnsure() {
        const st = this.state;
        if (st.wegeKarte) return st.wegeKarte;
        if (typeof THREE === "undefined") return null;
        const W = AnazhRealm.WEGE_KARTE;
        const TSL = THREE.TSL;
        // DIE SCHICHTEN EINER KARTE (Karte W2, 16.10.): Wege, Kronen-Streu und Flüsse tragen je Art EINE Array-Textur, die
        // Schicht ist die Stufe (nah 0, fern 1) — jede Stufe trägt dasselbe Raster (nah 512 m / 0,5 m = fern 2048 m / 2 m).
        // Bis 16.10. band jede Stufe eigene Texturen: der Naht-Stoff des Fern-Rings zählte 17 Sampler und linkte auf WebGL2
        // (16 Einheiten) nie, der Rückfall zeichnete keinen Boden (gate:webgl-probe W6). `daten` jeder Stufe ist die Sicht
        // auf ihre Schicht (dieselben Bytes für GPU und CPU-Leser); ein Upload trägt nur die Schicht (`_wegeSchichtHoch`).
        const raster = (texelM) => {
            const n = W.stufen.map((S, si) => Math.round(S.fensterM / texelM[si]));
            if (n.some((x) => x !== n[0]))
                throw new Error(`Wege-Karte: die Stufen tragen verschiedene Raster (${n.join(" ≠ ")}) — EINE Array-Textur trägt eines`); // prettier-ignore
            return n[0];
        };
        // `nul`: das Byte der leeren Karte — die Wege-Karte trägt je Kanal zwei Belage mit Vorzeichen um `WEGE_KARTE.null`
        // (`WEGE_KARTE.belag`, nie snorm wie im Rausch-Atlas: r184 legt jede Daten-Textur auch als Render-Ziel an, rg8snorm ist
        // das nur mit texture-formats-tier1 — swiftshader fehlt es, die Textur wäre ungültig und der Boden-Stoff bände nichts)
        const karte = (n, kanaele, format, name, nul = 0, schichten = W.stufen.length) => {
            const tex = new THREE.DataArrayTexture(
                new Uint8Array(n * n * kanaele * schichten).fill(nul),
                n,
                n,
                schichten
            );
            tex.format = format;
            tex.type = THREE.UnsignedByteType;
            tex.name = name;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = false;
            tex.needsUpdate = true;
            return { tex, schicht: (si) => tex.image.data.subarray(si * n * n * kanaele, (si + 1) * n * n * kanaele) };
        };
        const N = raster(W.stufen.map((S) => S.texelM));
        const kN = raster(AnazhRealm.LAUB_STREU.texelM);
        const wege = karte(N, 2, THREE.RGFormat, "wege-karte", W.null);
        // DIE DECKE DES BODENS (stoffe.K2#2): die Kronen-Karte trägt zwei Kanäle derselben Fläche — R die Laubstreu unter den Kronen,
        // G die Asche des Brands (`_ascheMalen`); EIN Sampler, EIN Abgriff je Stufe im Boden-Stoff. Hinter den Stufen trägt sie
        // eine Schicht im selben Raster: DIE NEIGUNG DES GESETZES für den Fern-Ring (`_fernNeigungTakt`, R/G die Normale x/z) —
        // der Ring-Stoff trägt 16 von 16 Texturen, eine eigene Karte bände er nie (WebGPU 16 je Stufe, WebGL2 16 Einheiten).
        const streu = karte(kN, 2, THREE.RGFormat, "kronen-streu", 0, W.stufen.length + 1);
        const fluesse = karte(N, 1, THREE.RedFormat, "fluss-karte");
        const stufen = W.stufen.map((S, si) => {
            const daten = wege.schicht(si);
            const tex = wege.tex;
            // DIE KRONEN-STREU dieser Stufe: dasselbe Fenster, dieselbe Mitte (also dasselbe UV), eigenes Raster.
            // `summe` ist die Wahrheit (die ungekappte Summe aller Kronen-Beiträge je Texel — eine Krone fällt exakt
            // heraus), `daten` ihr gekapptes Abbild für die Karte, nachgezogen im Schmutz-Rechteck beim Upload.
            // `asche` ist die Wahrheit des Kanals G (die Asche je Texel, 0…255, gemalt aus den Taten `brand`).
            const kronen = {
                N: kN,
                summe: new Uint16Array(kN * kN),
                asche: new Uint8Array(kN * kN),
                daten: streu.schicht(si),
                tex: streu.tex,
                schmutz: null,
                upload: 0,
            };
            const U = this._uniformHeimatTeilen({
                mitte: TSL.uniform(new THREE.Vector2(0, 0)),
                groesse: TSL.uniform(S.fensterM),
            });
            // DIE FLUSS-KARTE dieser Stufe (K16, die Naht des Wassers): dasselbe Fenster, dasselbe Raster wie die Wege — je Texel
            // der Anteil, den das Wasser eines Flusses deckt (`_flussKarteMalen`, dieselben Segmente und Breiten wie
            // `_fernFlussDeckung`). Der Fern-Ring liest sie je Fragment (`_flussKarteNode`): ein 4–17 m breiter Fluss
            // trägt seine Kante im Bild statt im Kasten-Mittel seiner Masche (6–24 m).
            const fluss = { daten: fluesse.schicht(si), tex: fluesse.tex, hydroN: -1 };
            return { S, N, schicht: si, daten, tex, kronen, fluss, U, mitteX: 0, mitteZ: 0, zentriert: false };
        });
        // `kronen` ist das Register (Schlüssel → [x, z, Radius, Scheitel, Baum]), `kronenZellen` sein Raum-Index (Zellen
        // `LAUB_STREU.zelleM` → die Kronen darin), `kronenRandMax` der größte Laub-Rand im Register (der Umzug fragt um ihn weiter).
        // `raeumen`: die neuen Flächen, deren schon gewachsene Natur der Takt räumt (`_wegeRaeumen`, K52).
        st.wegeKarte = {
            stufen,
            // die Schicht der Neigung (`_fernNeigungTakt` schreibt sie, `_fernNeigungNormale` liest sie)
            neigung: { N: kN, tex: streu.tex, schicht: W.stufen.length, daten: streu.schicht(W.stufen.length) },
            siedlungen: [],
            raeumen: [],
            kronen: new Map(),
            kronenZellen: new Map(),
            kronenRandMax: 0,
            trittGemalt: new Map(), // je getretene Zelle die Stufe, die die Nah-Stufe trägt (`_tritt`, `_trittMalen`)
            trittOffen: new Set(), // die Zellen, die der Gang der Welt trat und deren Wiese am nächsten Tag neu wächst (`_trittErholen`)
        };
        return st.wegeKarte;
    }

    // Der EINE Upload einer Schicht der Wege-Karten: r184 lädt bei `layerUpdates` nur die genannten Schichten hoch, sonst
    // alle — darum nennt JEDER Schreiber seine, sonst trüge ein fremder Upload im selben Bild nur die fremde Schicht.
    _wegeSchichtHoch(tex, schicht) {
        tex.addLayerUpdate(schicht);
        tex.needsUpdate = true;
    }

    // ═══ DIE KRONEN-STREU (Welle 5 Boden): der Waldboden liegt unter den ECHTEN Kronen ═══
    // Befund 05.10. (echte GPU, Mess-Wiese, 207 Bäume gegen das Feld): die Laubstreu folgte dem Kronenlicht-Feld
    // (`_canopyLightAt`, der Platzierungs-Bestand) — die Bäume stehen aber nach `lebendig` (Baum-Streu) und dem
    // Wald-Generator (Bestandsdichte, Kronen-Schüchternheit, Kappen): wo das Feld „geschlossen" sagte (Licht 0,2–0,4)
    // stand im 10-m-Kreis 0,01 Baum, und die Streu lag als braune Steppe in der offenen Wiese. Jetzt malt JEDE
    // stehende Krone (Radius `_kronenRadiusFuer`: `FOREST.crown[art] × Skala`, dieselbe Zahl wie die Kronen-
    // Schüchternheit) eine weiche Scheibe in die Kronen-Karte jeder Wege-Stufe; der Boden-Stoff mischt dort die
    // Laubstreu der Palette (`_wegeBodenFarbe`), die Nah-Wiese lichtet dort ihre Halme. Das Register ist der Bestand:
    // ein Wald-Baum trägt sich ein, wo er als Eintrag entsteht und fällt (`spawnArchitecture` · `removeArchitecture`,
    // `a:<id>` — Pflanzung, Promotion UND der Reload des Zweit-Boots), eine Streu-Baum-Zelle, wo ihre Region sie zeichnet
    // und entsorgt (`s:<schicht>:<zelle>`). NUR diese Haken tragen aus — kein Umzug vergisst eine Krone: bis 06.10.
    // vergaß der Umzug der fernen Stufe alles jenseits ihres Fensters, auch die Eintrags-Kronen, die nur beim Entstehen
    // eintragen; wer > 1 km lief und zurückkam, fand unter jedem Eintrags-Baum (Mess-Wiese: 722 von 789 Kronen) bis zum
    // Reload keine Streu. Der Raum-Index (`kronenZellen`) bindet die Kosten des Umzugs an den Streifen, nie an den Bestand.
    // DER SCHEITEL (der Schwarm landet auf ihm): `oben` (Streu: Fuß + Sichthöhe) oder der Eintrag `baum` — `_kronenOben`.
    _kronenStreuNeu(schluessel, x, z, radius, oben = NaN, baum = null) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !(radius > 0)) return;
        // Dieselbe Krone zweimal (eine Region baut neu) malt nicht doppelt; eine GEÄNDERTE fällt erst heraus.
        const alt = wk.kronen.get(schluessel);
        if (alt && alt[0] === x && alt[1] === z && alt[2] === radius) return void ([alt[3], alt[4]] = [oben, baum]);
        if (alt) this._kronenStreuWeg(schluessel);
        const c = [x, z, radius, oben, baum];
        wk.kronen.set(schluessel, c);
        const zk = AnazhRealm._kronenZelle(x, z);
        let zelle = wk.kronenZellen.get(zk);
        if (!zelle) wk.kronenZellen.set(zk, (zelle = new Map()));
        zelle.set(schluessel, c);
        wk.kronenRandMax = Math.max(wk.kronenRandMax, radius * AnazhRealm.LAUB_STREU.rand);
        for (const stufe of wk.stufen) if (stufe.zentriert) this._kronenStreuMale(stufe, x, z, radius, null, 1);
        // Die erste Krone zentriert die Karte sofort (wie die erste Siedlung), sonst läse der Neubau der Wiese noch 0.
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((s) => !s.zentriert)) this._tickWegeKarte(pm.position);
        this._kronenStreuWiese(x, z, radius);
    }

    // Eine Krone fällt (der Baum ist gefällt, abgebaut oder seine Streu-Region entsorgt): ihr Beitrag fällt EXAKT aus
    // jeder zentrierten Stufe (die Summe kennt ihn), die Wiese darunter wächst neu.
    _kronenStreuWeg(schluessel) {
        const wk = this.state.wegeKarte;
        const c = wk && wk.kronen.get(schluessel);
        if (!c) return;
        wk.kronen.delete(schluessel);
        const zk = AnazhRealm._kronenZelle(c[0], c[1]);
        const zelle = wk.kronenZellen.get(zk);
        if (zelle && zelle.delete(schluessel) && zelle.size === 0) wk.kronenZellen.delete(zk);
        for (const stufe of wk.stufen) if (stufe.zentriert) this._kronenStreuMale(stufe, c[0], c[1], c[2], null, -1);
        this._kronenStreuWiese(c[0], c[1], c[2]);
    }

    // Der Schlüssel der Index-Zelle (Kante `LAUB_STREU.zelleM`), in der der Kronen-Mittelpunkt (x, z) liegt.
    static _kronenZelle(x, z) {
        const Z = AnazhRealm.LAUB_STREU.zelleM;
        return Math.floor(x / Z) + "," + Math.floor(z / Z);
    }

    // Nah-Wiese und Nah-Streu lesen das Licht derselben Kronen (`_bodenLichtFeld`): ihre Kacheln, so weit Streu ODER
    // Schatten einer geänderten Krone reichen, fallen und wachsen neu — so weit der WEITERE der beiden Ringe um ihre EINE
    // Mitte (die Kamera, `_tickNahWiese` · `_tickNahStreu`) reicht; weiter weg steht keine Kachel. Bis K70-N1 galt die
    // Reichweite der Wiese (27 m) um den Spieler: die Streu-Kacheln am Ringrand (bis 35 m) behielten das alte Licht.
    _kronenStreuWiese(x, z, radius) {
        const mitte = this.state.camera
            ? this.state.camera.position
            : this.state.playerMesh && this.state.playerMesh.position;
        if (!mitte) return;
        const a = AnazhRealm._kronenReich(radius);
        if (Math.hypot(x - mitte.x, z - mitte.z) - a < AnazhRealm._nahRingReich())
            this._nahWieseNeuIn(x - a, z - a, x + a, z + a, false, true);
    }
    // DIE REICHWEITE EINER KRONE am Boden (m): so weit reichen ihre Streu (`LAUB_STREU.rand`) oder ihr Schatten
    // (`_bodenLichtFeld`: σ · √qMax Kronen-Radien) — die EINE Zahl für die Kacheln, die unter ihr fallen (`_kronenStreuWiese`),
    // und die, die auf sie warten (`_kroneKommt`).
    static _kronenReich(radius) {
        const U = AnazhRealm.UNDERGROWTH;
        return radius * Math.max(AnazhRealm.LAUB_STREU.rand, U.kronenSigma * Math.sqrt(U.kronenQMax));
    }

    // DIE KRONE VOR DER KACHEL (w28-krone-vor-kachel): kommt über dem Rechteck noch eine Krone, die JETZT gesetzt wird? Eine
    // Kachel der Nah-Wiese, ihrer Ferne oder der Nah-Streu liest das Licht der Kronen (`_bodenLichtFeld`); gebaut vor ihrer
    // Krone, fällt sie mit ihr (`_kronenStreuWiese`) und baut neu. Die Kachel fragt darum vor ihrem Bau (`_nahKachelWartet`,
    // der EINE Chokepoint der drei Bauer), und wartet. Zwei Quellen, die der Lücke „pflanzung" (`_weltbildLuecken`):
    //  · ein Baum der Pflanz-Schlange (`pendingVegSpawns`; sein Radius `_kronenRadiusFuer`, seine Reichweite `_kronenReich`),
    //    der für die Ankunft jetzt gilt (`_blickDerAnkunft` mit ERSTER_BLICK.dingM — die Frage seines Rangs, `_blickRang`: vor
    //    dem ersten Weltbild setzt der Pflanz-Gang nur im Blick, eine Krone außer Blick kommt erst im Nachlauf);
    //  · ein Chunk, dessen Pflanzung offen ist (`_pflanzungOffen`: seine Bäume stehen noch in keiner Schlange), so weit die
    //    größte Krone reicht, die steht oder die das Wald-Gesetz gewachsen nennt.
    // Der Stempel der Schlange (`_pflanzRegung`: ihre zwei Schreiber `_enqueueVegetationSpawn` und `_pflanzGang`, ein Zähler
    // der Welt — nie eine Eigenschaft des Zustands-Felds, das im Stand reist); der Index ihrer Kronen (Zellen der Kronen-Karte,
    // `_kronenZelle`) baut nur neu, wenn sie sich regte (Lehre 25).
    // VERWORFEN, gemessen (GTX 1050, Wiederkehr): die Krone schon beim Eintritt in die Schlange ins Licht zu nehmen, ohne zu
    // warten — die Ferne baute 368–396 Kacheln für 138–152 stehende (heute 283–312): die Kacheln stehen, bevor ihr Chunk gepflanzt ist.
    // VOR DEM ERSTEN WELTBILD zählt nur, worauf das Bild selbst wartet: die Pflanzung im Blick UND im Radius der Bauten
    // (`architectureCullingRadius`, die Lücke „pflanzung" in `_weltbildLuecken`). Die Ferne der Wiese reicht weiter (200 m): eine
    // Krone dahinter landet vielleicht erst im Nachlauf — wartete ihre Kachel auf sie, fehlte sie dem ersten Bild (GTX 1050,
    // Wiederkehr: 138 statt 152 Kacheln der Ferne am Bild); sie baut darum sofort und fällt einmal, wenn die Krone landet.
    // DIE KACHEL WARTET NUR IM TAKT (`_imTakt`): nur der Takt des laufenden Loops arbeitet die Pflanzung ab (`_tickPendingVegSpawns`,
    // die Saat im Planer). Ein Rufer außerhalb des Takts — der ruhende Loop, eine Linse, die Werkbank, der Playtest, der den Bauer
    // von Hand ruft — wartete auf eine Krone, die nie landet: er baut ganz, wie jeder Leser außerhalb des Takts (`_psoVorbau`).
    // Der volle Playtest an 8e11abe9: „Nah-Streu: der Takt baut den Ring … offen 107" nach 900 Rufen von Hand.
    _kroneKommt(x0, z0, x1, z1) {
        if (this._imTakt !== true) return false;
        const st = this.state;
        const pm = st.playerMesh;
        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
        const gilt = (x, z, r) =>
            this._blickDerAnkunft(x, z, r) &&
            (!!st._weltbildDa || !pm || (x - pm.position.x) ** 2 + (z - pm.position.z) ** 2 <= R * R);
        const schlange = st.pendingVegSpawns;
        if (schlange && schlange.length) {
            let I = this._kronenKommen;
            if (!I || I.schlange !== schlange || I.regung !== (this._pflanzRegung | 0)) {
                I = this._kronenKommen = { schlange, regung: this._pflanzRegung | 0, zellen: new Map(), reich: 0 };
                for (const wurf of schlange) {
                    const p = wurf && wurf.position;
                    const radius = p ? this._kronenRadiusFuer(wurf.name, wurf.opts && wurf.opts.scale) : null;
                    if (!radius) continue;
                    const a = AnazhRealm._kronenReich(radius);
                    const zk = AnazhRealm._kronenZelle(p.x, p.z);
                    const zelle = I.zellen.get(zk);
                    if (zelle) zelle.push(p.x, p.z, a);
                    else I.zellen.set(zk, [p.x, p.z, a]);
                    if (a > I.reich) I.reich = a;
                }
            }
            if (I.zellen.size) {
                const Z = AnazhRealm.LAUB_STREU.zelleM;
                const D = AnazhRealm.ERSTER_BLICK.dingM;
                for (let zz = Math.floor((z0 - I.reich) / Z); zz <= Math.floor((z1 + I.reich) / Z); zz++)
                    for (let xx = Math.floor((x0 - I.reich) / Z); xx <= Math.floor((x1 + I.reich) / Z); xx++) {
                        const zelle = I.zellen.get(xx + "," + zz);
                        for (let i = 0; zelle && i < zelle.length; i += 3) {
                            const [x, z, a] = [zelle[i], zelle[i + 1], zelle[i + 2]];
                            if (x + a < x0 || x - a > x1 || z + a < z0 || z - a > z1) continue;
                            if (gilt(x, z, D)) return true;
                        }
                    }
            }
        }
        if (!st.voxelChunks) return false;
        const wk = st.wegeKarte;
        let krone = wk ? wk.kronenRandMax / AnazhRealm.LAUB_STREU.rand : 0;
        for (const r of Object.values(AnazhRealm.FOREST.crown)) if (r > krone) krone = r;
        const a = AnazhRealm._kronenReich(krone);
        const { span } = this._voxelChunkConfig();
        for (let cz = Math.floor((z0 - a) / span); cz <= Math.floor((z1 + a) / span); cz++)
            for (let cx = Math.floor((x0 - a) / span); cx <= Math.floor((x1 + a) / span); cx++)
                if (this._pflanzungOffen(cx, cz) && gilt((cx + 0.5) * span, (cz + 0.5) * span, span * Math.SQRT1_2))
                    return true;
        return false;
    }
    // Ist die Pflanzung des Chunks (cx, cz) offen? Er sät (`_saatOffen`, `_tickSaat`), wartet auf den Plan seines Walds
    // (`_waldPflanzWarten`) oder steht gebaut im Laub-Radius und wartet auf seine Saat (`pendingFoliageChunks`) — dieselben
    // drei Sammlungen, die das erste Weltbild als „pflanzung" zählt (`_weltbildLuecken`).
    _pflanzungOffen(cx, cz) {
        const st = this.state;
        const ck = cx + "," + cz;
        if (this._saatOffen && this._saatOffen.has(ck)) return true;
        if (this._waldPflanzWarten && this._waldPflanzWarten.has(ck)) return true;
        const P = st.pendingFoliageChunks;
        return !!P && P.has(ck) && !!st.voxelChunks && st.voxelChunks.has(ck) && this._foliageChunkInRadius(cx, cz);
    }

    // Der EINE Kronen-Radius eines Wald-Baums: wie der Wald-Generator (phyto-core planForestCell) `FOREST.crown[art] ×
    // Skala`, eine Auto-Art des Buchs ohne Kronen-Eintrag 4 m × Skala; null für alles, was kein Wald-Baum ist.
    _kronenRadiusFuer(type, scale) {
        const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
        const kc = AnazhRealm.FOREST.crown[type];
        if (kc) return kc * s;
        for (const e of this._forestExtraSpecies()) if (e.species === type) return 4.0 * s;
        return null;
    }

    // Eine Krone in EINE Stufe malen: `dichte` bis `kern` × Radius, weich (smoothstep) bis `rand` × Radius; die Kronen
    // SUMMIEREN sich (gekappt) — unter einer einzelnen Krone dringt noch Gras durch, wo Kronen sich schließen, deckt
    // die Streu den ganzen Grund (die Karte kappt bei 1, die Summe darunter nicht). `ausschnitt` [i0, i1, j0, j1] (Texel,
    // inklusive) begrenzt das Malen auf den Streifen, den ein Umzug frisch freilegt; `vorzeichen` −1 nimmt die Krone
    // wieder heraus (dieselben gerundeten Beiträge, also exakt).
    _kronenStreuMale(stufe, x, z, radius, ausschnitt, vorzeichen) {
        const K = AnazhRealm.LAUB_STREU;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const x0w = stufe.mitteX - stufe.S.fensterM / 2;
        const z0w = stufe.mitteZ - stufe.S.fensterM / 2;
        const aussen = radius * K.rand;
        const innen = radius * K.kern;
        const a = ausschnitt || [0, N - 1, 0, N - 1];
        const i0 = Math.max(a[0], Math.floor((x - aussen - x0w) / t));
        const i1 = Math.min(a[1], Math.ceil((x + aussen - x0w) / t));
        const j0 = Math.max(a[2], Math.floor((z - aussen - z0w) / t));
        const j1 = Math.min(a[3], Math.ceil((z + aussen - z0w) / t));
        if (i1 < i0 || j1 < j0) return;
        const s = kr.summe;
        const D = K.dichte * 255;
        const sg = vorzeichen < 0 ? -1 : 1;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t - z;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t - x;
                let q = (aussen - Math.hypot(px, pz)) / (aussen - innen);
                if (q <= 0) continue;
                q = q >= 1 ? 1 : q * q * (3 - 2 * q);
                s[j * N + i] += sg * Math.round(q * D);
            }
        }
        AnazhRealm._kronenSchmutz(kr, i0, i1, j0, j1);
    }

    // Das Schmutz-Rechteck der Kronen-Karte wächst um [i0, i1] × [j0, j1]; der Upload zieht dort `daten` aus `summe` nach.
    static _kronenSchmutz(kr, i0, i1, j0, j1) {
        const r = kr.schmutz;
        kr.schmutz = r
            ? [Math.min(r[0], i0), Math.max(r[1], i1), Math.min(r[2], j0), Math.max(r[3], j1)]
            : [i0, i1, j0, j1];
    }

    // Der Umzug der Kronen-Karte einer Stufe (Lehre 25: die Kosten tragen, was sich ändert, nie das Register): das
    // Raster VERSCHIEBT sich um den Umzug (die Mitte rastet auf ganze Texel), gemalt wird nur der Streifen, den der
    // Umzug freilegt, aus den Kronen, die ihn berühren. Bis 06.10. leerte jeder Umzug die Karte und malte das ganze
    // Register neu (Mess-Wiese: 1078 Kronen, 230k Texel je Nah-Umzug alle 48 m Weg, synchron im Takt). Voll gemalt wird
    // nur ohne alte Mitte oder bei einem Sprung über das Fenster. Gefragt werden nur die Kronen der Index-Zellen am
    // Streifen (`kronenZellen`, um den größten Laub-Rand erweitert) — das Register bleibt der ganze Bestand.
    _kronenStreuUmzug(stufe, war) {
        const wk = this.state.wegeKarte;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const hk = stufe.S.fensterM / 2;
        const di = war ? Math.round((stufe.mitteX - war[0]) / t) : N;
        const dj = war ? Math.round((stufe.mitteZ - war[1]) / t) : N;
        const d = kr.summe;
        let streifen;
        if (Math.abs(di) >= N || Math.abs(dj) >= N) {
            d.fill(0);
            streifen = [[0, N - 1, 0, N - 1]];
        } else if (di === 0 && dj === 0) {
            streifen = [];
        } else {
            // neu[j][i] = alt[j + dj][i + di]; die Zeilen-Reihenfolge folgt dem Vorzeichen (nie eine Quelle überschreiben).
            const src0 = Math.max(0, di);
            const dst0 = Math.max(0, -di);
            const len = N - Math.abs(di);
            for (let n = 0; n < N; n++) {
                const j = dj >= 0 ? n : N - 1 - n;
                const sj = j + dj;
                if (sj < 0 || sj >= N) {
                    d.fill(0, j * N, j * N + N);
                    continue;
                }
                d.copyWithin(j * N + dst0, sj * N + src0, sj * N + src0 + len);
                if (di > 0) d.fill(0, j * N + len, j * N + N);
                else if (di < 0) d.fill(0, j * N, j * N + dst0);
            }
            // Die freigelegten Streifen: die Spalten (volle Höhe), dann die Zeilen ohne diese Spalten (keine Ecke doppelt).
            streifen = [];
            const sp = di > 0 ? [N - di, N - 1] : di < 0 ? [0, -di - 1] : null;
            if (sp) streifen.push([sp[0], sp[1], 0, N - 1]);
            const zi0 = di < 0 ? -di : 0;
            const zi1 = di > 0 ? N - di - 1 : N - 1;
            if (dj > 0) streifen.push([zi0, zi1, N - dj, N - 1]);
            else if (dj < 0) streifen.push([zi0, zi1, 0, -dj - 1]);
        }
        if (streifen.length) {
            const x0w = stufe.mitteX - hk;
            const z0w = stufe.mitteZ - hk;
            const rand = AnazhRealm.LAUB_STREU.rand;
            const Z = AnazhRealm.LAUB_STREU.zelleM;
            const R = wk.kronenRandMax;
            // Je Streifen die Index-Zellen, deren Kronen ihn erreichen können (jede Krone liegt in GENAU einer Zelle,
            // die Streifen teilen kein Texel — jede Krone malt jeden Streifen höchstens einmal).
            for (const s of streifen) {
                const zx0 = Math.floor((x0w + s[0] * t - R) / Z);
                const zx1 = Math.floor((x0w + (s[1] + 1) * t + R) / Z);
                const zz0 = Math.floor((z0w + s[2] * t - R) / Z);
                const zz1 = Math.floor((z0w + (s[3] + 1) * t + R) / Z);
                for (let zz = zz0; zz <= zz1; zz++)
                    for (let zx = zx0; zx <= zx1; zx++) {
                        const zelle = wk.kronenZellen.get(zx + "," + zz);
                        if (!zelle) continue;
                        for (const c of zelle.values()) {
                            const aussen = c[2] * rand;
                            if (
                                (c[0] + aussen - x0w) / t >= s[0] &&
                                (c[0] - aussen - x0w) / t <= s[1] + 1 &&
                                (c[1] + aussen - z0w) / t >= s[2] &&
                                (c[1] - aussen - z0w) / t <= s[3] + 1
                            )
                                this._kronenStreuMale(stufe, c[0], c[1], c[2], s, 1);
                        }
                    }
            }
        }
        this._ascheStufeMalen(stufe); // die Asche des Fensters neu (die Aschen der Taten, nie die Welt)
        kr.schmutz = [0, N - 1, 0, N - 1]; // das ganze Abbild zog um
        kr.upload = -Infinity; // nach dem Umzug sofort hochladen
    }

    // Die Kronen-Streu an (x, z) ∈ [0, 1] — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest (dieselbe
    // Stufen-Wahl wie `_wegeFeldAt`). DIE EINE Lese-Stelle für „hier steht Wald": das Kronendach der gepflanzten Bäume
    // (0 offen, 0,6 unter einer Krone, 1 wo Kronen sich schließen) — Boden, Nah-Wiese und Klang lesen sie, nie das
    // Kronenlicht-Feld der Platzierung (`_canopyLightAt` sagt, wo Bäume wachsen DÜRFEN, nicht wo sie stehen).
    _kronenStreuAt(x, z) {
        return this._bodenDeckeAt(x, z, false);
    }

    // Der EINE Leser der Kronen-Karte: die Stufe wie `_wegeFeldAt`, bilinear über R (die Laubstreu aus der Summe, gekappt wie
    // die Karte) oder G (die Asche).
    _bodenDeckeAt(x, z, asche) {
        const wk = this.state.wegeKarte;
        if (!wk) return 0;
        const [nah, fern] = wk.stufen;
        const g = AnazhRealm._wegeStufeNah(nah.N);
        const innen =
            Math.abs((x - nah.mitteX) / nah.S.fensterM) < g && Math.abs((z - nah.mitteZ) / nah.S.fensterM) < g;
        const stufe = innen ? nah : fern;
        if (!stufe.zentriert) return 0;
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const fx = (x - (stufe.mitteX - stufe.S.fensterM / 2)) / t - 0.5;
        const fz = (z - (stufe.mitteZ - stufe.S.fensterM / 2)) / t - 0.5;
        const i = Math.floor(fx);
        const j = Math.floor(fz);
        if (i < 0 || j < 0 || i >= N - 1 || j >= N - 1) return 0;
        const tx = fx - i;
        const tz = fz - j;
        // aus der Summe, gekappt wie die Karte (die `daten` ziehen erst beim gebündelten Upload nach), oder aus der Asche
        const at = asche ? (a, b) => kr.asche[b * N + a] / 255 : (a, b) => Math.min(255, kr.summe[b * N + a]) / 255;
        return (
            (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) +
            (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz
        );
    }

    // Die EINE Ausdehnung einer Form um ihre Achse (Malen und Siedlungs-Hülle): ein gedrehter Kasten reicht bis zur
    // Diagonale — max(ex, ez) beschnitt die Ecken (ein um 45° gedrehtes Quadrat wurde zum Achteck); die Fläche eines Plans
    // (`zone`) bis zur Ecke ihrer Hülle.
    static _wegeFormRadius(f) {
        if (f.typ === "zone") return Math.hypot(f.q.huelle[2] - f.q.huelle[0], f.q.huelle[3] - f.q.huelle[1]) / 2;
        return f.halb + (f.saum || 0) + (f.typ === "kasten" ? Math.hypot(f.ex, f.ez) : 0);
    }

    // Der EINE Abstand eines Punkts zu einer Form (m, innen negativ): der gedrehte Kasten um (ax, az) mit den Halbachsen ex/ez
    // und der Drehung phi (yaw wie der alte Pool), das Segment als Kapsel um seine Mittellinie (`halb`), die Fläche eines Plans
    // (`zone`: ihre Zone `q` um den Ort ox/oz) mit dem Rand ihres Gesetzbuchs (fachwerk `genesisZoneRand`, dieselbe Geometrie wie
    // die Natur-Wand des Orts). Leser: der Maler (`_wegeKarteMale`) und die Natur-Wand (`_aufWeg`) — der Boden zeigt den Weg, wo
    // die Natur ihm weicht. Drehung und Länge merkt die Form beim ersten Ruf.
    static _wegeFormAbstand(f, px, pz) {
        if (f.typ === "zone") {
            const rand = globalThis.__fachwerkCore.genesisZoneRand;
            let d = rand(f.q, px - f.ox, pz - f.oz);
            for (const w of f.ohne) d = Math.max(d, -rand(w, px - f.ox, pz - f.oz));
            return d;
        }
        if (f.typ === "kasten") {
            if (f._co === undefined) {
                f._co = Math.cos(f.phi || 0);
                f._si = Math.sin(f.phi || 0);
            }
            const rx = px - f.ax;
            const rz = pz - f.az;
            const lx = Math.abs(f._co * rx - f._si * rz) - f.ex;
            const lz = Math.abs(f._si * rx + f._co * rz) - f.ez;
            return Math.hypot(Math.max(lx, 0), Math.max(lz, 0)) + Math.min(Math.max(lx, lz), 0);
        }
        const dx = f.bx - f.ax;
        const dz = f.bz - f.az;
        if (f._ll === undefined) f._ll = dx * dx + dz * dz;
        let h = f._ll > 1e-6 ? ((px - f.ax) * dx + (pz - f.az) * dz) / f._ll : 0;
        h = h < 0 ? 0 : h > 1 ? 1 : h;
        return Math.hypot(px - (f.ax + dx * h), pz - (f.az + dz * h)) - f.halb;
    }

    // Das Gewicht EINER Form am Punkt (0 … 1): voll ab −rand innen, 0 ab +rand außen, dazwischen smoothstep — an der Kante 0,5.
    // Leser: der Maler (`_wegeKarteMale`) und die Linse des Vorplatzes (gate:settlement Teil O) — DIESELBE Zahl.
    static _wegeFormGewicht(f, px, pz, rand) {
        const q = (rand - AnazhRealm._wegeFormAbstand(f, px, pz)) / (2 * rand);
        if (q <= 0) return 0;
        return q >= 1 ? 1 : q * q * (3 - 2 * q);
    }

    // DER SCHUB EINER KARTE um (di, dj) Texel (der Umzug ihres Fensters): neu[j][i] = alt[j + dj][i + di] je `k` Kanälen, was keine
    // Quelle hat, wird `leer`; der Rahmen außerhalb [a, b] bleibt `leer` (der Rand-Texel der Wege-Karte). → die Streifen in [a, b]
    // ([i0, i1, j0, j1], geleert), deren Quelle außerhalb lag — die Spalten über die volle Höhe, die Zeilen ohne sie (keine Ecke
    // doppelt) —, oder null bei einem Sprung über das Fenster (dann malt der Aufrufer ganz). Die Zeilen-Folge folgt dem Vorzeichen
    // (nie eine Quelle überschreiben), dieselbe Regel wie der Kronen-Umzug (`_kronenStreuUmzug`). Leser: die Wege und die Flüsse.
    static _karteSchieben(d, N, k, di, dj, a, b, leer) {
        if (Math.abs(di) > b - a || Math.abs(dj) > b - a) return null;
        const len = N - Math.abs(di);
        const src0 = Math.max(0, di);
        const dst0 = Math.max(0, -di);
        for (let n = 0; n < N; n++) {
            const j = dj >= 0 ? n : N - 1 - n;
            const sj = j + dj;
            if (sj < 0 || sj >= N) {
                d.fill(leer, j * N * k, (j + 1) * N * k);
                continue;
            }
            if (di !== 0 || dj !== 0) d.copyWithin((j * N + dst0) * k, (sj * N + src0) * k, (sj * N + src0 + len) * k);
            if (di > 0) d.fill(leer, (j * N + len) * k, (j + 1) * N * k);
            else if (di < 0) d.fill(leer, j * N * k, (j * N + dst0) * k);
        }
        // der Rahmen außerhalb [a, b] (er trug nach dem Schub Bytes von innen)
        for (let j = 0; j < N; j++)
            if (j < a || j > b) d.fill(leer, j * N * k, (j + 1) * N * k);
            else {
                d.fill(leer, j * N * k, (j * N + a) * k);
                d.fill(leer, (j * N + b + 1) * k, (j + 1) * N * k);
            }
        const streifen = [];
        if (di > 0) streifen.push([Math.max(a, b - di + 1), b, a, b]);
        else if (di < 0) streifen.push([a, Math.min(b, a - di - 1), a, b]);
        const [zi0, zi1] = [di < 0 ? a - di : a, di > 0 ? b - di : b];
        if (dj > 0 && zi0 <= zi1) streifen.push([zi0, zi1, Math.max(a, b - dj + 1), b]);
        else if (dj < 0 && zi0 <= zi1) streifen.push([zi0, zi1, a, Math.min(b, a - dj - 1)]);
        for (const [i0, i1, j0, j1] of streifen)
            for (let j = j0; j <= j1; j++) d.fill(leer, (j * N + i0) * k, (j * N + i1 + 1) * k);
        return streifen;
    }

    // Die Grenze der NAH-Stufe als Bruchteil ihres Fensters (relativ zur Mitte, je Achse): zwei Texel vor dem Rand,
    // damit die bilineare Probe nie den leeren Rand-Texel liest. CPU-Leser und Boden-Shader lesen dieselbe Zahl.
    static _wegeStufeNah(N) {
        return 0.5 - 2 / N;
    }

    // Eine Form in EINE Stufe malen (nur innerhalb des Fensters, der Rand-Texel bleibt 0 — Clamp-to-Edge liest
    // außerhalb nichts). Segment: Kapsel-Abstand zur Mittellinie; Rechteck: gedrehter Kasten-Abstand. Der Rand
    // fällt über ±rand weich (smoothstep; rand = max(randM, randMinM der Stufe) — die ferne Stufe trägt 2-m-Texel,
    // ein schmaler Feldweg zerfiele dort sonst in Punkte), Kanal und Vorzeichen nach dem Belag der Form (`wert`, ohne ihn +,
    // `WEGE_KARTE.belag`); überlappende Formen: die positive Art schlägt die negative (der Weg über den Rasen), je Art das
    // Maximum. DIE DECKENDE FORM (`deckt`, der Grund der Häuser): in ihr liest jede bilineare Probe (Shader und
    // `_wegeFeldAt`) volle Erde — der Kasten wächst um die Spanne der Probe (je Welt-Achse ein Texel, in seinen Rahmen
    // gedreht t · (|cos φ| + |sin φ|)) und seinen weichen Rand (½ Texel der Stufe, nie der Feldweg-Boden `randMinM`): der
    // Übergang liegt ganz vor der Wand, wo die Büschel ohnehin ihre Reichweite halten (`erdbauGrund`). `c` (optional,
    // [i0, i1, j0, j1] in Texeln): nur dieses Rechteck — der Streifen eines Umzugs (`_karteSchieben`).
    _wegeKarteMale(stufe, f, c) {
        if (f.kanal < 0) return; // eine Fläche ohne Boden-Kanal (der Gras-Anger) bleibt Wiese
        const S = stufe.S;
        const N = stufe.N;
        const t = S.texelM;
        let rand;
        if (f.deckt) {
            if (f.typ !== "kasten") throw new Error(`Wege-Karte: nur ein Kasten deckt (Form ${f.typ})`);
            rand = t / 2;
            const w = t * (Math.abs(Math.cos(f.phi || 0)) + Math.abs(Math.sin(f.phi || 0))) + rand;
            f = { ...f, ex: f.ex + w, ez: f.ez + w };
        } else rand = Math.max(f.rand !== undefined ? f.rand : AnazhRealm.WEGE_KARTE.randM, S.randMinM);
        // DER GEMALTE SAUM (der gepflasterte Gehweg einer Gasse, `_stlWegeBuild`): der Maler deckt die Form um ihn breiter, die Form
        // selbst bleibt die Fahrbahn — EINE gemerkte Mal-Form je Gasse
        if (f.saum) f = f._mal || (f._mal = { ...f, halb: f.halb + f.saum, saum: 0 });
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const ausdehnung = AnazhRealm._wegeFormRadius(f) + rand;
        const minX = Math.min(f.ax, f.bx) - ausdehnung;
        const maxX = Math.max(f.ax, f.bx) + ausdehnung;
        const minZ = Math.min(f.az, f.bz) - ausdehnung;
        const maxZ = Math.max(f.az, f.bz) + ausdehnung;
        const i0 = Math.max(c ? c[0] : 1, Math.floor((minX - x0w) / t));
        const i1 = Math.min(c ? c[1] : N - 2, Math.ceil((maxX - x0w) / t));
        const j0 = Math.max(c ? c[2] : 1, Math.floor((minZ - z0w) / t));
        const j1 = Math.min(c ? c[3] : N - 2, Math.ceil((maxZ - z0w) / t));
        if (i1 < i0 || j1 < j0) return;
        // Der EINE Maler hält die Leer-Marke: jede gemalte Form (Siedlung, Trittfläche, Fenster-Umzug) macht die Stufe
        // nicht-leer, der nächste Umzug lädt sie leer hoch — kein Maler kann die Marke vergessen.
        stufe.wegeLeer = false;
        const daten = stufe.daten;
        const { voll, null: nul } = AnazhRealm.WEGE_KARTE;
        const wert = f.wert || 1;
        // DAS PFLASTER DECKT DIE ERDE, DIE FAHRBAHN TRÄGT SIE (fachwerk WEG_GESETZ; `WEGE_KARTE.belag.fahrbahn`): Erde UNTER Pflaster
        // heißt Fahrbahn — nur die Fahrbahn-Form einer Fahrstraße (`fahr`, die letzten Formen ihrer Siedlung) malt sie dort. Jede
        // andere Erde weicht dem Pflaster ab seiner Kante (Gewicht ½): der Tritt, der Grund eines Hauses, die Erd-Gasse, die in
        // die Straße mündet, malen nicht darauf (kein Karren gräbt sich in Stein), und ein Pflaster, das später kommt, nimmt die
        // Erde unter seiner Fläche — gleich, in welcher Folge die Formen ankamen. Der Leser der Wiese zählt das Pflaster ab
        // seiner Kante voll (`_wegeBelagAt`): wo die Erde wich, wächst kein Halm.
        const schont = f.kanal === 0 && wert > 0 && f.fahr !== true;
        const pflastert = f.kanal === 1 && wert < 0;
        const halb = voll / 2;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t;
                const q = AnazhRealm._wegeFormGewicht(f, px, pz, rand);
                if (!(q > 0)) continue;
                const o = (j * N + i) * 2;
                if (schont && nul - daten[o + 1] > halb) continue;
                const k = o + f.kanal;
                const v = Math.round(q * voll) * wert;
                const alt = daten[k] - nul;
                if (wert > 0 ? v > alt : alt <= 0 && v < alt) daten[k] = v + nul;
                if (pflastert && q >= 0.5 && daten[o] > nul) daten[o] = nul;
            }
        }
    }

    // Jede Stufe folgt dem Spieler (Umzug ab ihrem `umzugM`, Mitte auf ihr Texel-Raster gerastet): leeren, die
    // Formen der Siedlungen im Fenster neu malen (die Hülle je Siedlung verwirft ferne in O(1) — die Kosten binden an
    // die Nähe, nie an die Zahl besuchter Siedlungen), EIN Upload je umgezogener Stufe.
    _tickWegeKarte(playerPos) {
        const wk = this.state.wegeKarte;
        if (!wk || !playerPos) return;
        const jetzt = performance.now();
        // der Pfad erholt sich am Tag-Wechsel (EIN Vergleich je Takt)
        const tag = (this.state.worldMeta && this.state.worldMeta.tag) || 0;
        if (this._trittTag !== tag) {
            this._trittTag = tag;
            this._trittErholen();
        }
        const hydroN = this._flussKarteStand();
        for (const stufe of wk.stufen) {
            const S = stufe.S;
            if (!stufe.zentriert || Math.hypot(playerPos.x - stufe.mitteX, playerPos.z - stufe.mitteZ) >= S.umzugM) {
                const war = stufe.zentriert ? [stufe.mitteX, stufe.mitteZ] : null;
                const raster = S.texelM * 16;
                stufe.mitteX = Math.round(playerPos.x / raster) * raster;
                stufe.mitteZ = Math.round(playerPos.z / raster) * raster;
                stufe.zentriert = true;
                // DER UMZUG SCHIEBT (w11-stoss): Wege und Flüsse tragen ihr Bild um den Versatz und malen nur die freigelegten
                // Streifen (`_karteSchieben`), wie die Kronen-Streu (`_kronenStreuUmzug`) — bis hier malte jeder Umzug beide
                // Karten ganz neu (1024² Texel, je Texel jede Form im Fenster): ein Bild von 125–285 ms im Gehen und Fahren
                // (Radeon, profiband.K4, `_tickWegeKarte › _wegeStufeMalen › _wegeKarteMale`, zoneRand des Gesetzbuchs).
                this._wegeStufeMalen(stufe, war);
                if (stufe.U) stufe.U.mitte.value.set(stufe.mitteX, stufe.mitteZ);
                this._kronenStreuUmzug(stufe, war);
                if (war && stufe.fluss.hydroN === hydroN) this._flussKarteMalen(stufe, hydroN, war);
                else stufe.fluss.hydroN = -1; // ohne Bild (oder mit neuer Kachel) die Flüsse ganz neu
            } else if (stufe.grundNeu) {
                // ein Haus legte seinen Grund (S4): die Stufe malt ihre Flächen neu (die Flüsse tragen eigene Bytes)
                this._wegeStufeMalen(stufe);
            }
            stufe.grundNeu = false;
            // ein neuer Tritt (`_tritt`) geht gebündelt hoch, höchstens ein Upload je `TRITT.uploadMs`
            if (stufe.trittHoch && !(jetzt - (stufe.trittUpload || -Infinity) < AnazhRealm.TRITT.uploadMs)) {
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
                [stufe.trittHoch, stufe.trittUpload] = [false, jetzt];
            }
            if (stufe.fluss.hydroN !== hydroN) this._flussKarteMalen(stufe, hydroN);
            // Neu gemalte Kronen und Aschen gehen gebündelt hoch (höchstens ein Upload je Stufe und `uploadMs`): das Abbild
            // zieht nur im Schmutz-Rechteck aus der Summe (R, gekappt bei 255) und der Asche (G) nach.
            const kr = stufe.kronen;
            if (kr.schmutz && jetzt - kr.upload >= AnazhRealm.LAUB_STREU.uploadMs) {
                const [i0, i1, j0, j1] = kr.schmutz;
                const N = kr.N;
                for (let j = j0; j <= j1; j++)
                    for (let k = j * N + i0, e = j * N + i1; k <= e; k++) {
                        const v = kr.summe[k];
                        kr.daten[2 * k] = v > 255 ? 255 : v;
                        kr.daten[2 * k + 1] = kr.asche[k];
                    }
                this._wegeSchichtHoch(kr.tex, stufe.schicht);
                kr.schmutz = null;
                kr.upload = jetzt;
            }
        }
        this._wegKoerperTakt(playerPos); // Bord, Gehsteig und Kantstein im Kreis um den Spieler (fachwerk WEG_GESETZ)
    }

    // Der Stand der Hydrosphäre, den die Fluss-Karte trägt: die Zahl bereiter Regionen (Heimat + Kacheln) — kommt eine
    // Kachel dazu, malt jede Stufe ihre Flüsse neu.
    _flussKarteStand() {
        const st = this.state;
        let n = st.hydrosphere && st.hydrosphere.ready ? 1 : 0;
        if (st.hydroTiles) for (const t of st.hydroTiles.values()) if (t && t.ready) n++;
        return n;
    }

    // Die Flüsse EINER zentrierten Stufe malen (K16, die Naht des Wassers): leeren, jedes Segment der bereiten Regionen
    // (der Kanal `kanal`, je Segment einmal) als Kasten-Filter seines Wassers über die Texel-Kante — der Anteil des Texels,
    // den [−Halbbreite, +Halbbreite] quer zum Segment deckt (dieselbe Breite wie `_fernFlussDeckung`); EIN Upload.
    // Mit `war` (die alte Mitte) schiebt sie ihr Bild um den Umzug und malt nur die freigelegten Streifen (`_karteSchieben`).
    _flussKarteMalen(stufe, hydroN, war) {
        const fl = stufe.fluss;
        const S = stufe.S;
        const N = stufe.N;
        const t = S.texelM;
        let streifen = war
            ? AnazhRealm._karteSchieben(fl.daten, N, 1, Math.round((stufe.mitteX - war[0]) / t), Math.round((stufe.mitteZ - war[1]) / t), 0, N - 1, 0) // prettier-ignore
            : null;
        if (!streifen) {
            fl.daten.fill(0);
            streifen = [[0, N - 1, 0, N - 1]];
        }
        fl.hydroN = hydroN;
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const st = this.state;
        const regionen = [st.hydrosphere, ...(st.hydroTiles ? st.hydroTiles.values() : [])];
        const daten = fl.daten;
        const KANAL_FELDER = globalThis.__gelaendeCore.KANAL_FELDER;
        for (const h of regionen) {
            if (!h || !h.ready || !h.kanal) continue;
            const seg = h.kanal.seg;
            for (let o = 0; o < seg.length; o += KANAL_FELDER) {
                const ax = seg[o];
                const az = seg[o + 1];
                const bx = seg[o + 2];
                const bz = seg[o + 3];
                const hwA = seg[o + 4];
                const hwB = seg[o + 5];
                const r = Math.max(hwA, hwB) + t;
                const ex = bx - ax;
                const ez = bz - az;
                const len2 = ex * ex + ez * ez || 1;
                for (const q of streifen) {
                    const i0 = Math.max(q[0], Math.floor((Math.min(ax, bx) - r - x0w) / t));
                    const i1 = Math.min(q[1], Math.ceil((Math.max(ax, bx) + r - x0w) / t));
                    const j0 = Math.max(q[2], Math.floor((Math.min(az, bz) - r - z0w) / t));
                    const j1 = Math.min(q[3], Math.ceil((Math.max(az, bz) + r - z0w) / t));
                    if (i1 < i0 || j1 < j0) continue;
                    for (let j = j0; j <= j1; j++) {
                        const pz = z0w + (j + 0.5) * t;
                        for (let i = i0; i <= i1; i++) {
                            const px = x0w + (i + 0.5) * t;
                            let u = ((px - ax) * ex + (pz - az) * ez) / len2;
                            u = u < 0 ? 0 : u > 1 ? 1 : u;
                            const d = Math.hypot(px - (ax + ex * u), pz - (az + ez * u));
                            const hw = hwA + (hwB - hwA) * u;
                            const c = Math.max(0, Math.min(d + t / 2, hw) - Math.max(d - t / 2, -hw)) / t;
                            if (c <= 0) continue;
                            const v = Math.round(Math.min(1, c) * 255);
                            const k = j * N + i;
                            if (v > daten[k]) daten[k] = v;
                        }
                    }
                }
            }
        }
        this._wegeSchichtHoch(fl.tex, stufe.schicht);
    }

    // Der Wasser-Anteil der Fluss-Karte je Fragment (dieselbe Stufen-Wahl und dasselbe UV wie `_wegeBodenFarbe`):
    // { wert, imFenster } — jenseits des Fern-Fensters trägt der Leser seinen Kasten-Anteil (aNass).
    _flussKarteNode(_T) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !wk.stufen[0].U || !wk.stufen[0].fluss)
            throw new Error("Fluss-Karte: der Ring-Stoff braucht die Wege-Karte mit ihrer Fluss-Schicht");
        const [nah, fern] = wk.stufen;
        const xz = _T.positionWorld.xz;
        const relNah = xz.sub(nah.U.mitte).div(nah.U.groesse);
        const relFern = xz.sub(fern.U.mitte).div(fern.U.groesse);
        const innen = _T.step(_T.max(relNah.x.abs(), relNah.y.abs()), _T.float(AnazhRealm._wegeStufeNah(nah.N)));
        const imFenster = _T.step(_T.max(relFern.x.abs(), relFern.y.abs()), _T.float(0.5 - 1 / fern.N));
        const wert = _T.mix(
            _T.texture(fern.fluss.tex, relFern.add(0.5)).depth(_T.int(fern.schicht)).r,
            _T.texture(nah.fluss.tex, relNah.add(0.5)).depth(_T.int(nah.schicht)).r,
            innen
        );
        return { wert, imFenster };
    }

    // Die Wege EINER zentrierten Stufe neu malen — der EINE Neu-Maler für Umzug und Abbau: leeren, die Formen der
    // Siedlungen im Fenster malen (die Hülle verwirft ferne in O(1)), EIN Upload, wenn sich etwas ändert. Eine leere
    // Karte bleibt leer — kein Upload ohne Weg (der Umzug kommt auch für die Kronen). Die Marke setzt allein der Maler
    // (`_wegeKarteMale`): was er seit dem letzten Upload malte, geht leer hoch. Mit `war` (die alte Mitte, der Umzug) schiebt er
    // das Bild um den Versatz und malt nur die freigelegten Streifen (`_karteSchieben`): jede Form trägt je Texel denselben Wert
    // aus seiner Welt-Lage, die Mischung (je Art das Maximum, die positive schlägt die negative) kennt keine Reihenfolge — der
    // Schub trägt dieselben Bytes wie ein Neu-Malen, die Kosten binden an den Streifen statt an das Fenster.
    _wegeStufeMalen(stufe, war) {
        const S = stufe.S;
        const N = stufe.N;
        const nul = AnazhRealm.WEGE_KARTE.null;
        const warLeer = stufe.wegeLeer === true;
        const t = S.texelM;
        let streifen = war
            ? AnazhRealm._karteSchieben(stufe.daten, N, 2, Math.round((stufe.mitteX - war[0]) / t), Math.round((stufe.mitteZ - war[1]) / t), 1, N - 2, nul) // prettier-ignore
            : null;
        if (!streifen) {
            stufe.daten.fill(nul);
            stufe.wegeLeer = true;
            streifen = [[1, N - 2, 1, N - 2]];
        }
        const h = S.fensterM / 2 + S.randMinM + AnazhRealm.WEGE_KARTE.randM;
        for (const sd of this.state.wegeKarte.siedlungen) {
            if (sd.x1 < stufe.mitteX - h || sd.x0 > stufe.mitteX + h) continue;
            if (sd.z1 < stufe.mitteZ - h || sd.z0 > stufe.mitteZ + h) continue;
            for (const f of sd.formen) for (const c of streifen) this._wegeKarteMale(stufe, f, c);
        }
        // DER TRAMPELPFAD (stoffe.K4, `_tritt`): die Nah-Stufe malt jede getretene Zelle in ihrer Stufe von heute (die Ferne trägt
        // 2-m-Texel, ein Pfad von Leibes-Breite zerfiele dort in Punkte)
        if (stufe === this.state.wegeKarte.stufen[0]) this._trittMalen(stufe, war && streifen, war);
        // DER GRUND DER HÄUSER IST ERDE (S4): jede Box des Körper-Satzes, deren Boden der Grund ist (boden 0: der Turm, das Rund,
        // das Pfahlhaus; der Erdbau `grund`, gelaende-core), malt Kanal 0 DECKEND (`deckt`) — der Halm des Boden-Stoffs liest in
        // der GANZEN Box Erde statt Wiese; wo das Haus seinen Boden zeichnet, fällt der gezeichnete Boden (`erdbauSchnitt`),
        // dort malt keine Box (Radeon kalt: der Neu-Maler 1 → 17 ms, als jede Box malte). Bis 23.10. lag der weiche Rand (±½
        // Texel) AUF der Wand: im Turm des haus_gotisch (2,2 m) las der Boden 0,1–0,3 m vor der Wand 0,39–0,9 Erde, die Wiese
        // schien durch (vegetation.K4, Radeon: 7 290 Boden-Pixel)
        const E = this._erdbauLage();
        if (E && E.gruende)
            for (const g of E.gruende) {
                if (Math.abs(g.cx - stufe.mitteX) > h + 64 || Math.abs(g.cz - stufe.mitteZ) > h + 64) continue;
                for (const b of g.boxen) {
                    if (b[4]) continue;
                    const lx = (b[0] + b[1]) / 2;
                    const lz = (b[2] + b[3]) / 2;
                    const ax = g.cx + lx * g.c + lz * g.s;
                    const az = g.cz - lx * g.s + lz * g.c;
                    const phi = Math.atan2(g.s, g.c);
                    const [ex, ez] = [(b[1] - b[0]) / 2, (b[3] - b[2]) / 2];
                    const form = { typ: "kasten", kanal: 0, ax, az, bx: ax, bz: az, ex, ez, phi, halb: 0, deckt: true };
                    for (const c of streifen) this._wegeKarteMale(stufe, form, c);
                }
            }
        if (!warLeer || !stufe.wegeLeer) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
    }

    // Der getretene Grund an (x, z) ∈ [0, 1]: die getretene Erde und das Pflaster (`_wegeBelagAt`) — dort wächst kein Halm und
    // keine Streu.
    _wegeFeldAt(x, z) {
        return this._wegeBelagAt(x, z, null);
    }

    // DER BELAG an (x, z) — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest: die NAH-Stufe innerhalb ihrer Grenze
    // (`_wegeStufeNah`), sonst die FERN-Stufe; je Kanal das Vorzeichen gefiltert, dann geteilt wie im Shader (`_wegeBodenFarbe`,
    // `WEGE_KARTE.belag`). `aus` (optional) trägt erde · rasen · acker · pflaster (0 … 1). → der getretene Grund (Erde + Pflaster,
    // höchstens 1). Leser: das Pfad-Feld der Wiese und der Streu (`_wegeFeldAt`) und der gezeichnete Boden (`_bodenSichtAt`: der
    // Rasen grünt, das Pflaster deckt).
    _wegeBelagAt(x, z, aus) {
        if (aus) aus.erde = aus.rasen = aus.acker = aus.pflaster = aus.fahrbahn = 0;
        const wk = this.state.wegeKarte;
        if (!wk) return 0;
        const [nah, fern] = wk.stufen;
        const g = AnazhRealm._wegeStufeNah(nah.N);
        const innen =
            Math.abs((x - nah.mitteX) / nah.S.fensterM) < g && Math.abs((z - nah.mitteZ) / nah.S.fensterM) < g;
        const stufe = innen ? nah : fern;
        if (!stufe.zentriert) return 0;
        const S = stufe.S;
        const fx = (x - (stufe.mitteX - S.fensterM / 2)) / S.texelM - 0.5;
        const fz = (z - (stufe.mitteZ - S.fensterM / 2)) / S.texelM - 0.5;
        const i = Math.floor(fx);
        const j = Math.floor(fz);
        if (i < 0 || j < 0 || i >= stufe.N - 1 || j >= stufe.N - 1) return 0;
        const tx = fx - i;
        const tz = fz - j;
        const d = stufe.daten;
        const N = stufe.N;
        const { voll, null: nul } = AnazhRealm.WEGE_KARTE;
        const k = (a, b, c) => (d[(b * N + a) * 2 + c] - nul) / voll;
        const bi = (c) =>
            (k(i, j, c) * (1 - tx) + k(i + 1, j, c) * tx) * (1 - tz) +
            (k(i, j + 1, c) * (1 - tx) + k(i + 1, j + 1, c) * tx) * tz;
        const r = bi(0);
        const gk = bi(1);
        const erde = r > 0 ? r : 0;
        const pflaster = gk < 0 ? -gk : 0;
        if (aus) {
            aus.erde = erde;
            aus.rasen = r < 0 ? -r : 0;
            aus.acker = gk > 0 ? gk : 0;
            aus.pflaster = pflaster;
            // die Fahrbahn der Fahrstraße (fachwerk WEG_GESETZ): Erde unter Pflaster (`WEGE_KARTE.belag.fahrbahn`)
            aus.fahrbahn = Math.min(erde, pflaster);
        }
        // DAS PFLASTER ZÄHLT AB SEINER KANTE VOLL (Gewicht ½ = die Kante des Steins): auf ihm steht kein Halm, auch wo die Erde
        // eines Nachbarn ihm wich (`_wegeKarteMale`); die Erde läuft weich in die Wiese aus wie bisher
        return Math.min(1, erde + 2 * pflaster);
    }

    // Die Boden-Farbe unter Kronen und Wegen (TSL): die Vertex-Farbe mischt zum Rasen (R −), zur Laubstreu der Kronen-Karte,
    // zur getretenen Erde (R +), zum Acker (G +) und zuletzt zum Kopfstein (G −) der Wege-Karte (`WEGE_KARTE.belag`), in den
    // Farben der Boden-Palette (dieselbe Pfad-Erde wie der gebackene Ufer-Pfad), dem Mittel des Halms (`WIESEN_GRUND`) und
    // dem Stein-Gesetz (`_kopfsteinFarbe`), nur auf Begehbarem — ein Hang unter dem Weg bleibt Hang. Die Stufe wählt dieselbe Grenze wie `_wegeFeldAt`. Ohne die
    // Karte bricht der Boden-Stoff laut (der Chunk-Boden liest sie immer, kein stiller Boden ohne Weg).
    _wegeBodenFarbe(_T, vc) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !wk.stufen[0].U || !_T.texture || !_T.positionWorld || !_T.normalWorldGeometry)
            throw new Error("Wege-Karte: der Boden-Stoff braucht Karte, Uniforms und TSL (texture/positionWorld)");
        const P = AnazhRealm.BODEN_FARBE;
        const [nah, fern] = wk.stufen;
        const xz = _T.positionWorld.xz;
        const relNah = xz.sub(nah.U.mitte).div(nah.U.groesse);
        const wNah = _T.texture(nah.tex, relNah.add(0.5)).depth(_T.int(nah.schicht));
        const relFern = xz.sub(fern.U.mitte).div(fern.U.groesse);
        const wFern = _T.texture(fern.tex, relFern.add(0.5)).depth(_T.int(fern.schicht));
        const innen = _T.step(_T.max(relNah.x.abs(), relNah.y.abs()), _T.float(AnazhRealm._wegeStufeNah(nah.N)));
        // Jenseits des Fern-Fensters liegt weder Weg noch Streu (K16: der Fern-Ring trägt denselben Stoff bis 8 km — die Karte
        // klemmte ihren Rand-Texel sonst radial über die Ferne). Im Fenster, wo jeder Chunk steht, dieselbe Zahl.
        const imFenster = _T.step(_T.max(relFern.x.abs(), relFern.y.abs()), _T.float(0.5));
        // die Bytes um `null` (`WEGE_KARTE`): der Sampler liest u / 255, der Belag ist (u − null) / voll — affin, darum nach der Mischung
        const WK = AnazhRealm.WEGE_KARTE;
        const _wm = _T
            .mix(wFern, wNah, innen)
            .mul(255 / WK.voll)
            .sub(WK.null / WK.voll)
            .mul(imFenster);
        const _begehbar = _T.smoothstep(_T.float(0.6), _T.float(0.85), _T.normalWorldGeometry.y); // der Hang selbst, nie die Licht-Normale
        const f = (v) => _T.float(v);
        const B = AnazhRealm.WEG_BILD;
        // Der Rand ist keine Scheibe: das Laub liegt in Zungen und Flecken (Rauschen λ ≈ 1,4 m verschiebt die Kante) — dieselbe
        // Probe verschiebt die Kante der Erd-Wege und fleckt ihren Belag.
        const _laubRausch = this._rauschAtlas()
            .raum(_T.vec3(xz.x.mul(0.7), xz.y.mul(0.7), _T.float(3.3)))
            .mul(0.3);
        // DER BELAG (rg8 um `null`, je Kanal mit Vorzeichen gefiltert, dann geteilt — `_wegeBelagAt` rechnet dieselbe Teilung)
        // DIE KANTE DES WEGS (fachwerk WEG_GESETZ, w28-weg-koerper): die Karte trägt je Form einen weichen Abstand (Gewicht ½ an der
        // Kante, `_wegeFormGewicht`) — der Boden zeichnet die KANTE an dieser Höhenlinie statt den Verlauf als Farbe. Das Pflaster
        // endet auf einen Pixel scharf (die Spanne des Gewichts je Pixel), die Erde bricht an ihrer Kante (im Rauschen um
        // ± `erdKante` verschoben: die Graskante) und läuft innen weich aus — eine getretene Zelle (`_tritt`) behält ihre Stufe.
        // Bis hier mischte der Boden das Gewicht linear: 1,2 m Verlauf um jede Kante, Weg und Wiese gingen ohne Linie ineinander.
        const eRoh = _wm.r.max(0.0);
        const pRoh = _wm.g.negate().max(0.0);
        const eKante = _T.smoothstep(f(0.5 - B.erdKante), f(0.5 + B.erdKante), eRoh.add(_laubRausch.mul(B.erdZunge)));
        const _erde = eRoh.mul(eKante).mul(_begehbar);
        const _rasen = _wm.r.negate().max(0.0).mul(_begehbar);
        const _acker = _wm.g.max(0.0).mul(_begehbar);
        const aaP = _T.fwidth(pRoh).mul(0.75).clamp(B.kanteAA[0], B.kanteAA[1]);
        const _pflaster = _T.smoothstep(f(0.5).sub(aaP), f(0.5).add(aaP), pRoh).mul(_begehbar);
        // DIE FAHRBAHN (Erde unter Pflaster, `WEGE_KARTE.belag.fahrbahn`), an ihrer Kante scharf wie das Pflaster
        const aaF = _T.fwidth(eRoh).mul(0.75).clamp(B.kanteAA[0], B.kanteAA[1]);
        const _fahrbahn = _T.smoothstep(f(0.5).sub(aaF), f(0.5).add(aaF), eRoh);
        // DER RASEN (das Gras-Gesetz): wo der Plan Rasen erklärt, ist der Grund das Mittel des Halms (`WIESEN_GRUND`) — die
        // Geologie legt das Relief der Halme darauf (Grün × Flachheit), die Nah-Wiese ihre Büschel (`_bodenSichtAt`: er grünt)
        const _wg = AnazhRealm.WIESEN_GRUND.farbe;
        const mitRasen = _T.mix(vc, _T.vec3(_wg[0], _wg[1], _wg[2]), _rasen);
        // DIE KRONEN-STREU (`_kronenStreuNeu`): unter den echten Kronen die Laubstreu der Palette (`lit`) — zuerst, die
        // Wege liegen darüber. Dieselbe Stufen-Wahl, dasselbe UV (dasselbe Fenster). Derselbe Abgriff trägt in G die Asche.
        const dNah = _T.texture(nah.kronen.tex, relNah.add(0.5)).depth(_T.int(nah.schicht));
        const dFern = _T.texture(fern.kronen.tex, relFern.add(0.5)).depth(_T.int(fern.schicht));
        const kNah = dNah.r;
        const kFern = dFern.r;
        const _k = _T
            .smoothstep(_T.float(0.15), _T.float(0.85), _T.mix(kFern, kNah, innen).add(_laubRausch))
            .mul(_begehbar)
            .mul(imFenster)
            .mul(_T.float(1).sub(this._fernKroneOhneWald(_T)));
        const l = P.lit;
        // Unter der Krone liegt die Streu — ihre Albedo, nie ein Schatten: das Labor dunkelt seinen Bestandeskern
        // (`c.multiplyScalar(0.58 + 0.46 · Licht)` in worlds/terrain), die Welt hat die echte Schattenkarte der Kronen
        // (Lehre 21: nie doppelt; bis 06.10. lag die Streu so bei Y 0,065 unter dem Soll 0,08–0,15).
        const mitStreu = _T.mix(mitRasen, _T.vec3(l[0], l[1], l[2]), _k);
        // DIE ASCHE DES BRANDS (stoffe.K2#2, `_ascheMalen`): wo die Front ein Bett verzehrte, liegt die Asche der Palette über
        // Wiese und Streu, bis sie nachgrünt (`_sukzession`) — nur auf Begehbarem (die Wand des Hangs trug kein Bett). Dieselben
        // Bytes liest die Nah-Wiese (`_ascheAt`): auf der Asche steht kein Halm.
        const s = P.asche;
        const _a = _T.mix(dFern.g, dNah.g, innen).mul(_begehbar).mul(imFenster);
        const mitAsche = _T.mix(mitStreu, _T.vec3(s[0], s[1], s[2]), _a);
        const e = P.dirt;
        const a = P.wet;
        // DER BELAG DER ERDE (der Dorfweg, der Platz ohne Pflaster): gestampfte Erde mit Kies — das Korn (λ ≈ 0,11 m, ± `erdKorn`,
        // solange ein Pixel es trägt: unter 3 cm Spanne voll, über 12 cm sein Mittel) und die Flecken der Laub-Probe (λ ≈ 1,4 m,
        // ± `erdFleck`); an der Kante liegt sie feucht und dunkel (`erdRand` zur nassen Erde der Palette, die Linie der Kante aus
        // 40 m). Bis hier EIN Ton der Palette: aus 2 m und aus 40 m dieselbe Fläche ohne Maß.
        const spanne = _T.fwidth(xz.x).add(_T.fwidth(xz.y)).mul(0.5);
        const korn = this._rauschAtlas()
            .ebene(_T.vec2(xz.x.mul(9.1), xz.y.mul(9.1)), 5, "y")
            .mul(f(1).sub(_T.smoothstep(f(0.03), f(0.12), spanne)));
        const erdTon = f(1)
            .add(korn.mul(B.erdKorn))
            .add(_laubRausch.mul(B.erdFleck / 0.3));
        const erdRand = eKante.mul(f(1).sub(_T.smoothstep(f(0.6), f(0.85), eRoh))).mul(B.erdRand);
        const erdFarbe = _T.mix(_T.vec3(e[0], e[1], e[2]).mul(erdTon), _T.vec3(a[0], a[1], a[2]), erdRand);
        const mitErde = _T.mix(mitAsche, erdFarbe, _erde);
        const mitAcker = _T.mix(mitErde, _T.vec3(a[0], a[1], a[2]), _acker);
        // DAS PFLASTER deckt jeden Grund (porta STEIN_GESETZ.kopfstein). DIE FAHRBAHN der Fahrstraße trägt denselben Stein dunkler
        // (`fahrbahnTon`: das Großpflaster unter Rad und Huf), DIE LÄUFERREIHE fasst jedes Pflaster an seiner Kante und die
        // Fahrbahn an ihrem Bord (`kantBand`: der helle Granit des Kantsteins über das Band des Gewichts hinter der Kante, im
        // Ton des Bords der Körper `WEG_KOERPER.bordTon` — wo die Glieder enden, bleibt ihre Linie gemalt stehen).
        const stein = this._kopfsteinFarbe(_T, xz);
        const kantP = f(1).sub(_T.smoothstep(f(0.5 + B.kantBand).sub(aaP), f(0.5 + B.kantBand).add(aaP), pRoh));
        const bordP = _T
            .smoothstep(f(0.5 - B.bordBand).sub(aaF), f(0.5 - B.bordBand).add(aaF), eRoh)
            .mul(f(1).sub(_fahrbahn));
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        const g = AnazhRealm._srgbHexLinear(AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[K.stein]);
        const kant = _T.vec3(g[0], g[1], g[2]).mul(AnazhRealm.WEG_KOERPER.bordTon);
        const belag = _T.mix(stein.mul(_T.mix(f(1), f(B.fahrbahnTon), _fahrbahn)), kant, _T.max(kantP, bordP));
        return _T.mix(mitAcker, belag, _pflaster);
    }

    // Das Mittel des Kopfstein-Musters über die Fläche (der Ton 1, der Kopf 1 − kuppe/2, die Fuge ihr Anteil) — der Faktor am
    // Stein. Leser: `_kopfsteinFarbe` (die Ferne) und die Platten des Gehsteigs (`_wegKoerperFarben`: derselbe Ton, wo sie enden).
    static _kopfsteinMittel() {
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        const anteil = 1 - (1 - (2 * K.fuge) / K.steinM) ** 2;
        return (1 - K.kuppe / 2) * (1 - (1 - K.fugeTon) * anteil);
    }

    // DAS KOPFSTEIN (porta STEIN_GESETZ.kopfstein, der Belag `pflaster` der Wege-Karte): Granit-Kleinpflaster im Segmentbogen als
    // Term des Boden-Stoffs, kein Befehl und keine Textur — je Bogen der Sehne hebt sich der Lauf der Reihen um den Stich, die
    // Steine einer Reihe im Läufer-Verband (jede zweite um einen halben Stein versetzt). Je Pixel: der Bruchton je Stein (± `ton`),
    // der Kopf (zur Fuge hin dunkler, `kuppe`) und die Fuge als Box-Abdeckung des Pixels (die halbe Fuge in Metern, die Spanne aus
    // den Ableitungen der Welt-Lage — fern mittelt sie zu ihrem Anteil, nie zu einer Linie; dieselbe Rechnung wie `_steinStoff`);
    // trägt der Pixel den Stein nicht mehr (unter 2,5 … 5 Pixeln je Stein über die lange Achse des Pixels), das Mittel des Musters.
    // Die Farbe ist der Stein des Farb-Gesetzes (`STEIN_GESETZ.farbe`, linear: `_srgbHexLinear`). Leser: `_wegeBodenFarbe`. → vec3
    // (die Albedo)
    _kopfsteinFarbe(_T, xz) {
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        const c = AnazhRealm._srgbHexLinear(AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[K.stein]);
        const s = K.steinM;
        const f = (v) => _T.float(v);
        // der Bogen: t ∈ [−1, 1] über die Sehne, die Reihe hebt sich zur Mitte des Bogens um den Stich
        const t = _T.fract(xz.x.div(K.sehneM)).mul(2).sub(1);
        const w = xz.y.add(f(1).sub(t.mul(t)).mul(K.stichM)).div(s);
        const reihe = _T.floor(w);
        const fr = _T.fract(w);
        const u = xz.x.div(s).add(_T.fract(reihe.mul(0.5)));
        const nr = _T.floor(u);
        const fu = _T.fract(u);
        const d = _T.min(_T.min(fr, f(1).sub(fr)), _T.min(fu, f(1).sub(fu))).mul(s); // Meter zur nächsten Fuge
        const [wx, wz] = [_T.fwidth(xz.x), _T.fwidth(xz.y)];
        const aa = wx.add(wz).mul(0.5).max(1e-5); // die Spanne des Pixels in Metern
        const halb = aa.mul(0.5);
        const fuge = _T
            .min(d.add(halb), f(K.fuge))
            .sub(_T.max(d.sub(halb), f(-K.fuge)))
            .div(aa)
            .clamp(0.0, 1.0);
        // der Bruchton je Stein (die Nummern gefaltet, die Ziehung bleibt in jeder Entfernung zur Mitte der Welt genau)
        const zi = nr.sub(_T.floor(nr.div(289)).mul(289));
        const zj = reihe.sub(_T.floor(reihe.div(289)).mul(289));
        const zufall = _T.fract(_T.sin(zi.mul(12.9898).add(zj.mul(78.233))).mul(43758.5453));
        const ton = f(1).add(zufall.mul(2).sub(1).mul(K.ton));
        const ke = f(1).sub(d.div(s * 0.5).clamp(0.0, 1.0));
        const kopf = f(1).sub(ke.mul(ke).mul(K.kuppe));
        const muster = ton.mul(kopf).mul(_T.mix(f(1), f(K.fugeTon), fuge));
        // das Mittel des Musters (fern): der Ton 1, der Kopf 1 − kuppe/2 (über die Fläche des Steins), die Fuge ihr Anteil
        const mittel = AnazhRealm._kopfsteinMittel();
        // DER STEIN, DEN DER PIXEL TRÄGT (w28-stadt-grund): das Muster steht erst, wo ein Stein 2,5 … 5 Pixel über die LANGE Achse
        // des Fußabdrucks misst (der Blick streift den Boden: in der Tiefe ist der Pixel ein Vielfaches seiner Breite). Bis hier
        // las die Sicht die mittlere Spanne ab 1,5 Pixeln — in der Tiefe stand je Pixel ein Stein mit eigenem Bruchton (nyquist
        // eines 2,5-Pixel-Steins 0,19 gegen 0,08 bei 4 Pixeln): das Pflaster las als Rauschen.
        const sicht = _T.smoothstep(f(2.5), f(5), f(s).div(_T.max(wx, wz).max(1e-5)));
        return _T.vec3(c[0], c[1], c[2]).mul(_T.mix(f(mittel), muster, sicht));
    }

    // DAS EINE PFAD-FELD der Wiese: der getrampelte Ufer-Pfad (Drainage, im Boden gebacken) ODER der Siedlungs-Weg
    // (die Wege-Karte) — wo einer liegt, wächst kein Halm.
    _pfadFeldAt(x, z, surfY) {
        const a = this._pathFieldAt(x, z, surfY);
        const b = this._wegeFeldAt(x, z);
        return a > b ? a : b;
    }

    // DER TRAMPELPFAD (stoffe.K4) — ein Schreib-Akt des Felds: wo Leiber gehen (der Spieler, sein Mitspieler, die Bewohner,
    // die Tiere — jeder Leib, der im Sim-Schritt geht), zählt die Zelle (`TRITT.zelleM`) jeden Tritt, mit dem ein Leib sie
    // betritt (ein Versatz über `sprungM` ist kein Schritt; `steht` sagt der Schritt des Leibs selbst — wer springt oder
    // schwimmt, tritt nichts —, nie ein Leser des gezeichneten Bodens: jeder Peer zählt dieselben Tritte). Die Zahl erholt sich in der
    // Spielzeit (n · e^(−Δt/erholTage) — eine Funktion der Uhr, kein Takt), ihre Stufe (1 − e^(−n/tritte), gerastert auf
    // `stufen`, sichtbar erst als Pfad: `TRITT.pfadGras`, `_trittStufe`) ist getretene Erde in der EINEN Wege-Karte (Kanal Erde):
    // der Boden zeigt den Pfad, Wiese und Nah-Streu lesen ihn
    // über `_pfadFeldAt` — Kosten nur am Schritt in eine neue Zelle und am Sprung einer Stufe. Die Zellen leben im worldMeta
    // (`tritt`: "i,j" → [n, t]) und reisen gepackt (`_trittPacken`): der Reload und der Mitspieler (sein Geist geht durch denselben
    // Schritt) sehen denselben Pfad. Die Zahl liegt auf dem Raster des Stands (`TRITT.standN` je Tritt, `TRITT.standT` je Tag) —
    // was der Stand trägt, IST der Zustand, der Reload kehrt Bit für Bit wieder.
    // DER GANG DER LEIBER im Sim-Schritt: jedes Tier und der Spieler zu Fuß (dieselben Leiber wie im Leib-Löser
    // `_leibKontakte`, an ihrer Lage vor ihm) treten den Pfad; der Spieler tritt, wo er steht, ein Tier geht am Boden. Bis zum
    // Merge von main f69a7305 lag dieser Schreib-Akt im Leib-Löser (stamm/kreatur-verhalten.js riss die Decke von 4 000 Zeilen).
    _trittDerLeiber() {
        const st = this.state;
        for (const c of st.creatures || AnazhRealm.STAND_LEER)
            if (c && c.position && c.userData) this._tritt(c, c.position.x, c.position.z, true, false);
        const pm = st.playerMesh;
        if (!pm || !pm.position || (st.player && st.player.mountedArch != null)) return;
        const K = this._spielerKapsel(this._trittKapsel || (this._trittKapsel = {}));
        this._tritt(pm, K.x, K.z, st.isInAir !== true && st.playerUnderwater !== true, true);
    }
    _tritt(leib, x, z, steht, spieler) {
        const T = AnazhRealm.TRITT;
        const i = Math.floor(x / T.zelleM);
        const j = Math.floor(z / T.zelleM);
        const M = this._trittMemo || (this._trittMemo = new WeakMap());
        const m = M.get(leib);
        if (!m) return void M.set(leib, { i, j, x, z });
        if (m.i === i && m.j === j) return;
        const sprung = Math.hypot(x - m.x, z - m.z) > T.sprungM;
        [m.i, m.j, m.x, m.z] = [i, j, x, z];
        if (sprung || !steht) return;
        const wm = this.state.worldMeta;
        if (!wm) return;
        // DER STAND TRÄGT NUR DEN PFAD (gate:persistence D, speicher.K3: „die Datei wächst mit den Änderungen, nie mit dem Weg"):
        // eine Zelle reist erst mit ihrer ersten Stufe, dem Pfad (`_trittStufe`); was darunter getreten ist (sichtbar nichts),
        // zählt das flüchtige Gedächtnis `_trittSchwach`
        const F = wm.tritt || (wm.tritt = {});
        const schwach = this._trittSchwach || (this._trittSchwach = new Map());
        const key = i + "," + j;
        const jetzt = this._trittJetzt();
        const alt = F[key] || schwach.get(key);
        const n =
            Math.round(((alt ? alt[0] * Math.exp(-(jetzt - alt[1]) / T.erholTage) : 0) + 1) * T.standN) / T.standN;
        const zeile = [n, Math.floor(jetzt * T.standT) / T.standT];
        const stufe = AnazhRealm._trittStufe(n);
        if (stufe > 0) {
            F[key] = zeile;
            this._trittSchrieb = (this._trittSchrieb || 0) + 1;
            schwach.delete(key);
        } else schwach.set(key, zeile);
        const wk = this.state.wegeKarte;
        const nah = wk && wk.stufen[0];
        if (!nah || !nah.zentriert || !(stufe > (wk.trittGemalt.get(key) || 0))) return;
        this._wegeKarteMale(nah, this._trittForm(i, j, stufe));
        wk.trittGemalt.set(key, stufe);
        nah.trittHoch = true; // der Upload bündelt sich im Takt (`_tickWegeKarte`); der CPU-Leser liest die Bytes sofort
        // die Wiese über der Zelle wächst neu: unter dem Schritt eines Spielers sofort (seine Eingabe weckt die Welt), unter dem Gang
        // der Welt (Bewohner, Tiere) am nächsten Tag (`_trittErholen`) — im Stand kostet die Welt nichts
        if (spieler) this._trittWiese(key);
        else wk.trittOffen.add(key);
    }
    // Die Kacheln der Wiese und der Nah-Streu über der Zelle `key` fallen (sie wachsen auf dem Pfad neu)
    _trittWiese(key) {
        const T = AnazhRealm.TRITT;
        const [i, j] = key.split(",").map(Number);
        const [cx, cz, r] = [(i + 0.5) * T.zelleM, (j + 0.5) * T.zelleM, T.halbM + T.randM];
        this._nahWieseNeuIn(cx - r, cz - r, cx + r, cz + r, true);
    }
    // Die Spielzeit der Welt in Tagen (Welt-Tag + Uhr) — die Uhr des Pfads
    _trittJetzt() {
        const wm = this.state.worldMeta;
        return ((wm && wm.tag) || 0) + (Number.isFinite(this.state.timeOfDay) ? this.state.timeOfDay : 0);
    }
    // Die Stufe einer Zelle mit n Tritten (rein): der getretene Anteil, gerastert — sichtbar erst als PFAD (`TRITT.pfadGras`, das
    // Gesetz von stoffe.K4): die erste Stufe, auf der die Wiese (Dichte × (1 − Stufe · `NAH_WIESE.pfadDuennt`)) höchstens
    // `pfadGras` ihrer Halme trägt. Darunter ist die Zelle 0 — kein Boden, kein Stand: ein Weg entsteht erst durch Wiederholung, ein
    // einmaliger Gang und ein Tier, das an seinem Ort kreist, ändern nichts, was man sieht (bis w12-tritt die erste Achtel-Stufe
    // ab 2,7 Tritten: 5,1 km in 30 min trugen 7,4 kB Trampelpfad im Stand, jede Zelle von Tieren am Weg).
    static _trittStufe(n) {
        const T = AnazhRealm.TRITT;
        const stufe = Math.floor((1 - Math.exp(-n / T.tritte)) * T.stufen + 1e-9) / T.stufen;
        const pfad = Math.ceil(((1 - T.pfadGras) / AnazhRealm.NAH_WIESE.pfadDuennt) * T.stufen - 1e-9) / T.stufen;
        return stufe >= pfad ? stufe : 0;
    }
    // Die Form einer getretenen Zelle in der Wege-Karte: eine Scheibe von Leibes-Breite um ihre Mitte, Erde in ihrer Stufe
    _trittForm(i, j, stufe) {
        const T = AnazhRealm.TRITT;
        const [x, z] = [(i + 0.5) * T.zelleM, (j + 0.5) * T.zelleM];
        return { typ: "segment", kanal: 0, ax: x, az: z, bx: x, bz: z, halb: T.halbM, rand: T.randM, wert: stufe };
    }
    // Der Maler der Nah-Stufe (`_wegeStufeMalen`): jede Zelle im Fenster in ihrer Stufe von heute. Im Umzug (`streifen`, die alte
    // Mitte `war`) nur die Streifen — eine Zelle, deren Mitte erst jetzt ins Fenster kam, ganz (ihr Rand reicht ins geschobene Bild).
    _trittMalen(stufe, streifen, war) {
        const wm = this.state.worldMeta;
        const wk = this.state.wegeKarte;
        if (!streifen) wk.trittGemalt.clear();
        if (!wm || !wm.tritt) return;
        const T = AnazhRealm.TRITT;
        const jetzt = this._trittJetzt();
        const h = stufe.S.fensterM / 2;
        const drin = (x, z, mx, mz) => Math.abs(x - mx) <= h && Math.abs(z - mz) <= h;
        for (const key in wm.tritt) {
            const [n, t] = wm.tritt[key];
            const st = AnazhRealm._trittStufe(n * Math.exp(-(jetzt - t) / T.erholTage));
            if (!(st > 0)) continue;
            const [i, j] = key.split(",").map(Number);
            const [x, z] = [(i + 0.5) * T.zelleM, (j + 0.5) * T.zelleM];
            if (!drin(x, z, stufe.mitteX, stufe.mitteZ)) continue;
            const form = this._trittForm(i, j, st);
            if (!streifen || !drin(x, z, war[0], war[1])) {
                this._wegeKarteMale(stufe, form);
                wk.trittGemalt.set(key, st);
            } else {
                for (const c of streifen) this._wegeKarteMale(stufe, form, c);
                wk.trittGemalt.set(key, Math.max(st, wk.trittGemalt.get(key) || 0));
            }
        }
    }
    // DIE ERHOLUNG (je Welt-Tag, `_tickWegeKarte`): eine Zelle, deren Stufe fiel, wächst zu — die Nah-Stufe malt neu, Wiese und
    // Nah-Streu wachsen über ihr nach; eine Zelle unter dem Pfad fällt aus dem Stand in das flüchtige Gedächtnis (ihre Zahl ist eine
    // Funktion der Uhr, ein neuer Tritt zählt weiter); was der Gang der Welt seit gestern trat, wächst neu
    _trittErholen() {
        const wm = this.state.worldMeta;
        const wk = this.state.wegeKarte;
        if (!wm || !wm.tritt || !wk) return;
        const T = AnazhRealm.TRITT;
        const jetzt = this._trittJetzt();
        let neu = false;
        for (const key of Object.keys(wm.tritt)) {
            const [n, t] = wm.tritt[key];
            const st = AnazhRealm._trittStufe(n * Math.exp(-(jetzt - t) / T.erholTage));
            if (!(st > 0)) {
                (this._trittSchwach || (this._trittSchwach = new Map())).set(key, wm.tritt[key]);
                delete wm.tritt[key];
                this._trittSchrieb = (this._trittSchrieb || 0) + 1;
            }
            if (st >= (wk.trittGemalt.get(key) || 0)) continue;
            neu = true;
            wk.trittOffen.add(key);
        }
        // das flüchtige Gedächtnis vergisst, was unter einem halben Tritt erholt ist
        if (this._trittSchwach)
            for (const [key, [n, t]] of this._trittSchwach)
                if (n * Math.exp(-(jetzt - t) / T.erholTage) < 0.5) this._trittSchwach.delete(key);
        for (const key of wk.trittOffen) this._trittWiese(key);
        wk.trittOffen.clear();
        if (neu) wk.stufen[0].grundNeu = true;
    }

    // DER PFAD IM STAND (gate:persistence D, Gebot 7: die Kosten an der Änderung): die Zellen reisen als [tMax, base64] — je Zelle,
    // geordnet nach (j, i), vier Varints: der Zeilen-Sprung dj und der Spalten-Sprung (in derselben Zeile hinter der vorigen Zelle,
    // sonst gegen ihre Spalte; beide im Zickzack), die Zahl n · standN und das Alter tMax − t · standT (die jüngste Zelle 0).
    // Ein Pfad liegt dicht: eine Zelle kostet ~4 Bytes statt ~24 im JSON-Paar "i,j":[n,t]. Gemerkt am Feld und seinem Schreib-Zähler
    // (`_trittSchrieb`: `_tritt` und `_trittErholen`) — der Stand ohne neuen Tritt packt nichts. Leser: die Stand-Zeile worldMeta.
    _trittStand(F) {
        const m = this._trittStandMemo;
        if (m && m.feld === F && m.schrieb === this._trittSchrieb) return m.stand;
        const stand = AnazhRealm._trittPacken(F);
        this._trittStandMemo = { feld: F, schrieb: this._trittSchrieb, stand };
        return stand;
    }
    static _trittPacken(F) {
        const T = AnazhRealm.TRITT;
        const zellen = Object.entries(F).map(([key, [n, t]]) => {
            const [i, j] = key.split(",").map(Number);
            return [j, i, Math.round(n * T.standN), Math.round(t * T.standT)];
        });
        zellen.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        let tMax = -Infinity;
        for (const z of zellen) if (z[3] > tMax) tMax = z[3];
        const b = [];
        const vari = (v) => {
            if (!(Number.isSafeInteger(v) && v >= 0)) throw new Error(`Trampelpfad: ${v} ist kein Varint`);
            for (; v >= 0x80; v = Math.floor(v / 0x80)) b.push((v % 0x80) | 0x80);
            b.push(v);
        };
        const zz = (v) => (v < 0 ? -2 * v - 1 : 2 * v);
        let [pj, pi] = [0, 0];
        for (const [j, i, n, t] of zellen) {
            vari(zz(j - pj));
            vari(zz(j === pj ? i - pi - 1 : i - pi));
            vari(n);
            vari(tMax - t);
            [pj, pi] = [j, i];
        }
        let bin = "";
        for (let k = 0; k < b.length; k += 0x2000) bin += String.fromCharCode.apply(null, b.slice(k, k + 0x2000));
        return [zellen.length ? tMax : 0, btoa(bin)];
    }
    // Die Umkehr (das Heil jeder geladenen Welt, `_weltMetaHeil`): [tMax, base64] → "i,j" → [n, t]
    static _trittAuspacken([tMax, b64]) {
        const T = AnazhRealm.TRITT;
        const bin = atob(b64);
        let k = 0;
        const vari = () => {
            let [v, f] = [0, 1];
            for (;;) {
                if (k >= bin.length) throw new Error("Trampelpfad: der Stand bricht mitten in einer Zelle ab");
                const c = bin.charCodeAt(k++);
                v += (c & 0x7f) * f;
                if (c < 0x80) return v;
                f *= 0x80;
            }
        };
        const unzz = (v) => (v % 2 ? -(v + 1) / 2 : v / 2);
        const F = {};
        let [pj, pi] = [0, 0];
        while (k < bin.length) {
            const dj = unzz(vari());
            const di = unzz(vari());
            const j = pj + dj;
            const i = dj === 0 ? pi + di + 1 : pi + di;
            const n = vari() / T.standN;
            F[i + "," + j] = [n, (tMax - vari()) / T.standT];
            [pj, pi] = [j, i];
        }
        return F;
    }

    // DIE TRITTFLÄCHE (Architektur-Welle 05.10.): um eine Feuerstelle, einen Brunnen, einen Marktstand ist der Boden
    // getreten. Befund (Werkbank, echte GPU, Armlänge): Halme der Nah-Wiese stachen durch Glutbett und Brunnenkranz.
    // Das Gesetzbuch nennt die Fläche (`fx.tritt` des Rezepts: Kreis r oder Kasten ex/ez im Asset-Raum), der Wirt malt
    // sie als Form in die EINE Wege-Karte (Kanal Erde) — der Boden-Shader zeigt getretene Erde, Wiese und Nah-Streu
    // wachsen dort nicht (`_pfadFeldAt`). Einmal je Eintrag, beim ersten Studio-Platz (das Buch ist warm); sie bleibt,
    // solange der Eintrag lebt — der Boden vergisst die Feuerstelle nicht, wenn ihr Mesh die Mesh-Zone verlässt.
    // Die Frage stellt jeder Eintrag EINMAL (Lehre 25): `_trittBox` ist undefined (nie gefragt), false (keine Fläche)
    // oder die Form — jeder weitere Primär-Add (Stufen-Wechsel eines Baums, Hauses, Tors, der Karten-Platzierungen)
    // kostet einen Feld-Vergleich, nie die Preset-Auflösung.
    _trittFlaecheSetzen(entry) {
        if (!entry || entry._trittBox !== undefined || !entry.position) return;
        const preset = this._foundryPresetForEntry(entry);
        const f = this._foundry;
        const rec = preset && f && f.recipes ? f.recipes[preset] : null;
        const t = rec && rec.fx ? rec.fx.tritt : null;
        entry._trittBox = false; // transient (kein Snapshot)
        if (!t || typeof t !== "object") return;
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const x = entry.position.x;
        const z = entry.position.z;
        const form =
            t.typ === "kasten" && Number.isFinite(t.ex) && Number.isFinite(t.ez)
                ? {
                      typ: "kasten",
                      kanal: 0,
                      ax: x,
                      az: z,
                      bx: x,
                      bz: z,
                      ex: t.ex * s,
                      ez: t.ez * s,
                      phi: Number.isFinite(entry.rotationY) ? entry.rotationY : 0,
                      halb: 0,
                  }
                : Number.isFinite(t.r)
                  ? { typ: "segment", kanal: 0, ax: x, az: z, bx: x, bz: z, halb: t.r * s }
                  : null;
        if (!form) return;
        const wk = this._wegeKarteEnsure();
        if (!wk) return;
        const r = AnazhRealm._wegeFormRadius(form);
        const box = { x0: x - r, z0: z - r, x1: x + r, z1: z + r, formen: [form] };
        wk.siedlungen.push(box);
        wk.raeumen.push(box); // was schon um die Ausstattung wuchs, räumt der Takt (`_wegeRaeumen`)
        this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Natur-Wand kennt die neue Fläche (`_aufWeg`)
        entry._trittBox = box; // transient (kein Snapshot): der Restore setzt sie beim ersten Platz neu
        for (const stufe of wk.stufen)
            if (stufe.zentriert) {
                this._wegeKarteMale(stufe, form);
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
            }
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((st) => !st.zentriert)) this._tickWegeKarte(pm.position);
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }
    // Der Abbau nimmt die Trittfläche mit: die Form fällt aus der Karte, jede zentrierte Stufe malt JETZT neu (der
    // EINE Neu-Maler — bis 06.10. wartete der Abbau auf den Takt, der ohne Weg und Krone früh zurückkehrte: die
    // GPU-Karte zeigte weiter Erde, der CPU-Leser 0), Wiese und Nah-Streu wachsen über der Fläche zurück.
    _trittFlaecheLoesen(entry) {
        const wk = this.state.wegeKarte;
        const box = entry ? entry._trittBox : null;
        if (!box || !wk) return;
        const i = wk.siedlungen.indexOf(box);
        if (i >= 0) wk.siedlungen.splice(i, 1);
        this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Fläche fällt aus der Natur-Wand (`_aufWeg`)
        entry._trittBox = undefined;
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeStufeMalen(stufe);
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }

    // Die Nah-Wiese UND die Nah-Streu über einer neuen Weg-/Tritt-Fläche neu wachsen lassen: jede Kachel im Rechteck
    // fällt, der nächste Takt baut sie auf dem Pfad-Feld neu (beide lesen `_pfadFeldAt` — bis 05.10. fiel nur die Wiese,
    // die Blume des Waldbodens blieb auf dem neuen Weg stehen).
    // `karte`: nur die Boden-Karte regte sich (der Trampelpfad, `_tritt`) — die Wache weckt nur ihre Leser (Wiese, Nah-Streu).
    // `licht`: nur das Licht der Kronen änderte sich (`_kronenStreuWiese`) — die Gitter der Ferne tragen kein Licht (Höhe und
    // Wiesen-Grund), sie und das Feld der Nachbarn bleiben; es fallen nur die Kacheln im Rechteck (ihr Wurf und ihr Tint lesen das
    // Licht). Bis dahin fiel mit jeder Krone, die der Wald beim Einströmen setzte, der Rand von 3 × 3 Kacheln der Ferne samt
    // Gittern: am Messort (Null-Renderer, 750 Takte) baute die Ferne 1 915 Kacheln in 1 951 ms gegen 915 ms an main, in der
    // swiftshader-CI stand die Wiese nach 14 465 Takten nicht.
    _nahWieseNeuIn(x0, z0, x1, z1, karte = false, licht = false) {
        this._weltRegt(karte, karte); // die Kacheln fallen: die Stand-Wache weckt Wiese und Streu
        let n = 0;
        const imRechteck = (key, K, rand = 0) => {
            const [tx, tz] = key.split(",").map(Number);
            return !((tx + 1) * K + rand < x0 || tx * K - rand > x1 || (tz + 1) * K + rand < z0 || tz * K - rand > z1);
        };
        // Die Wiese-Kachel trägt nur Daten (ihr Block im Bestand stirbt und wird neu geboren), die Streu-Kachel tritt aus ihren Senken aus. Die
        // Kacheln fallen HIER, unter dem Weckruf oben (kein Rückruf: die Schreiber-Wand deckt nur den eigenen Pfad).
        const nw = this.state.nahWiese;
        if (nw)
            for (const key of [...nw.kacheln.keys()])
                if (imRechteck(key, AnazhRealm.NAH_WIESE.kachel) && this._nahWieseKachelFaellt(key)) n++;
        // die Kacheln der Ferne lesen dieselben Felder (`_nahWieseFernKachel`) und über ihr FELD (sie und ihre acht Nachbarn) die
        // Gitter der Ferne (die Grenze der Streckung, `_wieseFernGrenzen`): ein Gitter unter der Fläche fällt, eine Kachel, deren
        // Feld sie trifft
        const KF = AnazhRealm.NAH_WIESE.fern.kachel;
        for (const key of nw && nw.fern && !licht ? [...nw.fern.gitter.keys()] : [])
            if (imRechteck(key, KF)) nw.fern.gitter.delete(key);
        for (const key of nw && nw.fern ? [...nw.fern.kacheln.keys()] : [])
            if (imRechteck(key, KF, licht ? 0 : KF) && nw.fern.kacheln.delete(key)) ((nw.neu = true), n++);
        const ns = this.state.nahStreu;
        if (ns)
            for (const [key, k] of [...ns.kacheln]) {
                if (!imRechteck(key, AnazhRealm.NAH_STREU.kachel)) continue;
                this._nahStreuKachelEntsorgen(k);
                if (ns.kacheln.delete(key)) n++;
            }
        return n;
    }

    // DIE KENNUNG EINES BAU-POOLS (gate:asset-inventory): Name UND Inventar-Stempel eines Instanz-Pools der Bau-Substanz
    // (der Zaun der Siedlungen, das Fundament der Häuser), bei jeder Erzeugung — auch beim Verdoppeln. Die Inventur liest den
    // Stempel (`userData.inventar`), nie den Namen: bis 08.10. trugen beide Pools nur ihren Namen, und kam das Auto-Dorf
    // während der Inventur, stand der Zaun als „UNBEKANNTER Emitter“ rot (CI 37709343976, siedlung-zaun inst×3).
    static _poolKennung(mesh, name) {
        mesh.name = name;
        mesh.userData.inventar = name;
        return mesh;
    }

    // ═══ DER ZAUN-POOL ═══
    // Das Muster der Instanz-Pools: EIN InstancedMesh für die hüfthohen Zaun-Streifen der Siedlungen (1 Draw-Call,
    // per-Instanz-Farbe); Höhe aus `getTerrainHeightAt`, Pitch aus den Endpunkt-Höhen. Kein Snapshot-Feld: die
    // Streifen entstehen je Session deterministisch aus dem Settlement-Export (`_tickAutoSettlement`).
    _stlZaunEnsurePool() {
        const st = this.state;
        if (!st.scene) return null;
        let P = st.stlZaun;
        if (P) return P;
        const mesh = this._kistenPool("siedlung-zaun", 256);
        st.scene.add(mesh);
        P = st.stlZaun = { mesh, cap: 256, top: 0 };
        return P;
    }
    // DIE KISTE DER POOLS (Zaun · Mauer · Vogel): EIN Stoff — EIN Programm, je Pool EIN Draw (das Fundament-Muster: welt-weit,
    // nie gecullt); die Form der Einheit ist der Würfel, oder `geo` (dieselben Attribute: Lage, Normale, UV). Farbe je Instanz
    // (setColorAt); Standard (rau, nicht-metallisch) liest den EINEN Himmel — r184-Lambert liest scene.environment nie diffus,
    // die Wege-Kisten standen im Schatten schwarz.
    _kistenPool(name, cap, geo = this._stlWegeGeo || (this._stlWegeGeo = new THREE.BoxGeometry(1, 1, 1))) {
        let mat = this._stlWegeMat;
        if (!mat) {
            mat = new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
            mat.userData.naesseFarbe = THREE.TSL.varyingProperty("vec3", "vInstanceColor"); // die Farbe ist die der Instanz
            this._stlWegeMat = this._leuchtStoff(mat, null); // der Licht-Pool (K11) und die Nässe
        }
        const mesh = AnazhRealm._poolKennung(AnazhRealm._instanzMesh(geo, mat, cap), name);
        // instanceColor-Buffer anlegen SOLANGE count == cap (r128: setColorAt
        // alloziert count*3 — nach count=0 wäre der Buffer leer, GEMESSEN).
        mesh.setColorAt(0, this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color(1, 1, 1)));
        AnazhRealm._instanzZahl(mesh, 0);
        mesh.frustumCulled = false;
        mesh.receiveShadow = true;
        return mesh;
    }
    // DER MAUER-POOL (siedlung.K2): die Wände, Kronen und Türme der Stadtmauern — dieselbe Kiste, derselbe Stoff wie der Zaun
    // (EIN Programm), EIN Draw; anders als der hüfthohe Zaun wirft die Mauer (`castShadow`, die Wurf-Ebene).
    _stlMauerEnsurePool() {
        const st = this.state;
        if (st.stlMauer) return st.stlMauer;
        if (!this._stlZaunEnsurePool()) return null; // der Zaun-Pool steht vor der Mauer
        const mesh = this._kistenPool("siedlung-mauer", 256);
        mesh.castShadow = true;
        st.scene.add(mesh);
        st.stlMauer = { mesh, cap: 256, top: 0 };
        return st.stlMauer;
    }
    _stlZaunAddStrip(x, y, z, yaw, pitch, sx, sy, sz, farbe) {
        this._stlStreifen(this._stlZaunEnsurePool(), x, y, z, yaw, pitch, sx, sy, sz, farbe);
    }
    // EIN STREIFEN in einen Bau-Pool `P` (Zaun, Mauer): Mitte x/y/z, Gier und Neigung, Maße sx (quer) · sy (hoch) · sz (längs);
    // die Verdopplung trägt Name, Stempel und Wurf des Pools.
    _stlStreifen(P, x, y, z, yaw, pitch, sx, sy, sz, farbe) {
        if (!P) return;
        if (P.top >= P.cap) {
            // Verdopplungs-Wachstum (Matrizen + Farben in einen frischen Pool).
            const bigger = this._kistenPool(P.mesh.name, P.cap * 2);
            bigger.castShadow = P.mesh.castShadow;
            bigger.instanceMatrix.array.set(P.mesh.instanceMatrix.array);
            if (P.mesh.instanceColor) bigger.instanceColor.array.set(P.mesh.instanceColor.array);
            AnazhRealm._instanzZahl(bigger, P.mesh.count);
            this.state.scene.add(bigger);
            this.state.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            P.mesh = bigger;
            P.cap *= 2;
        }
        const slot = P.top++;
        const m = this._stlWegeTmpM || (this._stlWegeTmpM = new THREE.Matrix4());
        const q = this._stlWegeTmpQ || (this._stlWegeTmpQ = new THREE.Quaternion());
        const e = this._stlWegeTmpE || (this._stlWegeTmpE = new THREE.Euler());
        const v = this._stlWegeTmpV || (this._stlWegeTmpV = new THREE.Vector3());
        const s = this._stlWegeTmpS || (this._stlWegeTmpS = new THREE.Vector3());
        const c = this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color());
        e.set(pitch, yaw, 0, "YXZ");
        q.setFromEuler(e);
        m.compose(v.set(x, y, z), q, s.set(sx, sy, sz));
        P.mesh.setMatrixAt(slot, m);
        P.mesh.setColorAt(slot, c.setHex(farbe));
        AnazhRealm._instanzZahl(P.mesh, P.top);
        P.mesh.instanceMatrix.needsUpdate = true;
        if (P.mesh.instanceColor) P.mesh.instanceColor.needsUpdate = true;
    }
    // Die Boden-Schichten EINES Settlement-Exports (Straßen · Feldwege · Platz · Äcker) in die Wege-Karte und die
    // Zäune in den Zaun-Pool — verankert am `origin`, je Form Wasser-bewacht (`_nassAt`; Fluss-Querungen
    // bleiben offen, die bruecken-Schicht reist unkonsumiert). `key` = Session-Gedächtnis (kein Doppel-Bau je Boot). `nurWege`:
    // ein neuer Plan desselben Orts (`_ortNeuRechnen`) — Zaun und Mauer stehen schon. Die Formen merken ihren Plan (`plan`).
    // JEDE FORM DES PLANS WIRD GEMALT (w28-stadt-grund): die Kosten binden an das Fenster jeder Stufe (der Maler malt nur, was in
    // ihm liegt, `_wegeKarteMale`), nie an eine Zahl. Bis hier hielt eine stille Kappe von 900 Formen je Plan: die Metropole von
    // stadt-voll („dorf 7 300") trägt 1 646 Gassen- und Feldweg-Stücke, gemalt wurden die ersten 900 — ihr Platz, alle 300 Vorplätze
    // und die 47 Äcker fielen ungenannt, 76,9 % des Grunds vor den Türen trug Wiese (Halme kniehoch in Gasse und Vorplatz).
    _stlWegeBuild(plan, origin, key, nurWege) {
        if (!plan || !origin || !this.state.scene) return 0;
        if (!this._stlWegeKeys) this._stlWegeKeys = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        if (key && this._stlWegeKeys.has(key)) return 0;
        if (key) this._stlWegeKeys.add(key);
        const wk = this._wegeKarteEnsure();
        let n = 0;
        // Die Siedlung merkt ihre Formen samt Hülle (der Fenster-Umzug verwirft ferne Siedlungen in O(1)).
        // … und ihren Ursprung: aus Plan und Ursprung entstehen ihre Körper (`_wegKoerperAufgaben`)
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [], plan, ursprung: { x: origin.x, z: origin.z } }; // prettier-ignore
        const form = (f) => {
            box.formen.push(f);
            for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeKarteMale(stufe, f);
            const r = AnazhRealm._wegeFormRadius(f);
            box.x0 = Math.min(box.x0, f.ax - r, f.bx - r);
            box.x1 = Math.max(box.x1, f.ax + r, f.bx + r);
            box.z0 = Math.min(box.z0, f.az - r, f.bz - r);
            box.z1 = Math.max(box.z1, f.az + r, f.bz + r);
            n++;
        };
        // DER BELAG DER GASSE (fachwerk BELAG_GESETZ: Rang × Größe × Jahr): die Gasse trägt Kanal und Vorzeichen ihres Belags wie die
        // Flächen des Genesis-Orts. Die FORM bleibt die Fahrbahn (`halb` = w/2: an ihr messen die Natur-Wand, die Laterne am
        // Wegrand und der Vorplatz); das Pflaster deckt dazu den Gehweg bis zur Bauflucht als gemalten `saum` (fachwerk
        // `gassenBreite` − w, je Seite) — der Maler und die Hülle lesen ihn, sonst niemand. Bis w28-stadt-boden malte der Wirt jede
        // Gasse als getretene Erde (Kanal 0): die Hauptgasse der Metropole stand in Halmen (Auge 10.11., „dorf 7 300“).
        // Eine Art, die die Karte nicht kennt, wirft laut (kein stiller Rückfall auf Erde).
        const FC = globalThis.__fachwerkCore;
        const belagVon = (art, wer) => {
            const B = AnazhRealm.WEGE_KARTE.belag[art];
            if (!B) throw new Error(`Wege-Karte: ${wer} trägt den Belag „${art}", den der Boden nicht kennt`);
            return B;
        };
        // DIE FAHRBAHN DER FAHRSTRASSE (fachwerk WEG_GESETZ, Art „strasse“): außerhalb der Fußgängerzone (`wegZone` — dieselbe
        // Regel wie die Trasse ihres Gehsteigs im Erdbau, `ortPlan`) trägt die Fahrbahn einen eigenen Belag, Erde unter
        // Pflaster (`WEGE_KARTE.belag.fahrbahn`): eine zweite Form je Stück, gemalt NACH allen anderen der Siedlung (`fahrbahnen`,
        // unten) — der Gehsteig bleibt das Pflaster des Saums. Bis hier trugen Fahrbahn und Gehsteig EINE Farbe.
        const fahrbahnen = [];
        const strasse = (pts, w, belag, saum, fahr) => {
            if (!Array.isArray(pts)) return;
            const B = belagVon(belag, "eine Gasse");
            for (let i = 0; i + 1 < pts.length; i++) {
                const ax = origin.x + pts[i].x;
                const az = origin.z + pts[i].z;
                const bx = origin.x + pts[i + 1].x;
                const bz = origin.z + pts[i + 1].z;
                if (!(Math.hypot(bx - ax, bz - az) > 0.01)) continue;
                if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue; // die Wasser-Wand
                const halb = Math.max(1.2, w || 2.5) / 2;
                form({
                    typ: "segment",
                    kanal: B.kanal,
                    wert: B.wert,
                    ax,
                    az,
                    bx,
                    bz,
                    halb,
                    ...(saum > 0 ? { saum } : {}),
                });
                if (fahr && !FC.wegZone(plan, pts[i].x, pts[i].z) && !FC.wegZone(plan, pts[i + 1].x, pts[i + 1].z))
                    fahrbahnen.push({ typ: "segment", kanal: 0, wert: 1, fahr: true, ax, az, bx, bz, halb });
            }
        };
        for (const rd of plan.roads || [])
            strasse(
                rd.pts,
                rd.w,
                FC.gassenBelag(plan, rd),
                (FC.gassenBreite(plan, rd) - rd.w) / 2,
                FC.wegArt(plan, rd) === "strasse"
            );
        for (const fw of plan.feldwege || []) strasse(fw.pts, fw.w, "weg", 0, false);
        // DIE FLÄCHEN EINES PLANS (fachwerk `zonen`, der Genesis-Ort): jede Fläche mit Belag in ihrem Kanal und Vorzeichen
        // (`WEGE_KARTE.belag`), gemalt mit dem Rand ihres Gesetzbuchs (`zone`, `genesisZoneRand`) — eine Art, die die Karte nicht
        // kennt, wirft laut (kein stiller Rückfall auf Erde). Das Wasser des Plans, das nach einer Fläche kommt, nimmt sie aus
        // (`ohne`: der Rasen des Ufers malt nicht in den Teich); der Rasen ist kein Weg der Natur-Wand (`sperr` −∞ — die Flächen des
        // Orts urteilt `_genesisFlaeche`).
        // DER GRUND DES FELDS IST WIESE (w28-stadt-grund): das Feld des Orts (Zone `feld`, der Gürtel des Genesis-Orts — der Wald des
        // Felds in Park-Gestalt) trägt den Rasen des Gras-Gesetzes; was eine Fläche des Plans erklärt (Weg, Pflaster), liegt darüber
        // (die positive Art schlägt die negative, das Pflaster deckt), das Wasser des Plans nimmt sich aus (`ohne`), die Natur-Wand
        // liest ihn nicht (`sperr` −∞: die Bäume des Felds stehen). Bis hier malte der Maler nur Flächen: unter dem gelichteten
        // Feld lag der Waldboden der Geologie ohne Grün — am Genesis-Ort 19 von 100 Rasterzellen nackte Erde im Gürtel (Ankunft:
        // das halbe Bild braune Rausch-Erde bis an die Baumreihe).
        const zonen = plan.zonen || [];
        zonen.forEach((q, i) => {
            const belag = q.art === "feld" ? "gras" : q.art === "flaeche" ? q.belag : null;
            if (!belag) return;
            const B = AnazhRealm.WEGE_KARTE.belag[belag];
            if (!B)
                throw new Error(
                    `Wege-Karte: die Fläche ${q.name} trägt den Belag „${belag}", den der Boden nicht kennt`
                );
            const h = q.huelle;
            const ohne = zonen
                .slice(i + 1)
                .filter(
                    (w) =>
                        w.art === "wasser" &&
                        w.huelle[0] < h[2] &&
                        w.huelle[2] > h[0] &&
                        w.huelle[1] < h[3] &&
                        w.huelle[3] > h[1]
                );
            const zoneForm = (zq, zh) => {
                const ax = origin.x + (zh[0] + zh[2]) / 2;
                const az = origin.z + (zh[1] + zh[3]) / 2;
                form({
                    typ: "zone",
                    q: zq,
                    ohne,
                    ox: origin.x,
                    oz: origin.z,
                    kanal: B.kanal,
                    wert: B.wert,
                    ax,
                    az,
                    bx: ax,
                    bz: az,
                    halb: 0,
                    ...(B.kanal === 0 && B.wert < 0 ? { sperr: -Infinity } : {}),
                });
            };
            if (q.form !== "band" || q.pts.length < 3) return zoneForm(q, h);
            // DAS BAND JE STÜCK (die Kosten am Weg, nie an seiner Hülle): sein Rand ist das Minimum der Ränder seiner Stücke
            // (fachwerk `laufAbstand` − w/2, je Stück dieselbe Rechnung), das Gewicht fällt mit dem Rand, und der Maler nimmt je
            // Texel das stärkste — je Stück eine Form mit seiner eigenen Hülle malt dieselben Bytes. Bis hier malte das Band
            // jedes Texel seiner GANZEN Hülle gegen jedes Stück (feldweg_6: 31 Stücke über 56 × 182 m): der Genesis-Ort hielt
            // den Haupt-Faden beim ersten Zentrieren der Karte 539 ms (gate:fahr-leben, die Fahr-Bahn, Bild 20).
            for (let j = 1; j < q.pts.length; j++) {
                const [a, b] = [q.pts[j - 1], q.pts[j]];
                const zh = [
                    Math.min(a.x, b.x) - q.w / 2,
                    Math.min(a.z, b.z) - q.w / 2,
                    Math.max(a.x, b.x) + q.w / 2,
                    Math.max(a.z, b.z) + q.w / 2,
                ];
                zoneForm({ ...q, pts: [a, b], huelle: zh }, zh);
            }
        });
        // Der PLATZ (Anger/Markt) — ein gedrehtes Rechteck im Belag seines Gesetzes (fachwerk `platzBelag`: Erde, oder Pflaster
        // ab dem Markt seiner Zeit); ein Gras-Anger bleibt Wiese: er malt keinen Boden-Kanal (`kanal` −1), und die Natur-Wand
        // hält sein Inneres frei wie das Gesetzbuch des Dorfs (fachwerk-core: kein Baum tiefer als 1 m im Anger, `sperr` −1
        // statt des Stamm-Rands).
        const pz = plan.platz;
        if (pz && Number.isFinite(pz.cx) && Number.isFinite(pz.ex)) {
            const wx = origin.x + pz.cx;
            const wz = origin.z + pz.cz;
            const pb = FC.platzBelag(plan);
            const anger = pb === "gras";
            const PB = anger ? null : belagVon(pb, "der Platz");
            if (this._landAt(wx, wz, 0.2))
                form({
                    typ: "kasten",
                    kanal: anger ? -1 : PB.kanal,
                    ...(anger ? {} : { wert: PB.wert }),
                    ax: wx,
                    az: wz,
                    bx: wx,
                    bz: wz,
                    ex: pz.ex,
                    ez: pz.ez,
                    phi: pz.phi || 0,
                    halb: 0,
                    ...(anger ? { sperr: -1 } : {}),
                });
        }
        // DIE VORPLÄTZE (K66, Augen-Runde 15.10.: Gras wuchs über die Türtreppe): vor jedem Eingang liegt getretene Erde bis an den Weg —
        // Grundriss gegen Natur gilt für Treppe und Vorplatz wie für den Weg. Die Fläche ist die Erdbau-Platte des Vorplatzes selbst (fachwerk
        // `ortPlan`, Marke `vorplatz`, im Erdbau der Welt, `_erdbauRoh`) samt dem Saum der Gasse (`vorplatzBoden`) — Akt, Dorf-Zug und
        // Wege-Rebuild aus dem Export lesen dieselbe Platte; bis K66 malte der Wirt eine eigene Fläche von 1,6 m Tiefe, die Platte reichte
        // bis zur Gasse, dazwischen wuchs Wiese. Beim HOF-Haus dazu die Stufe vor der Haustür im Hof (fachwerk `eingangVon`). Die Wiese
        // (`_pfadFeldAt`) und die Natur-Wand (`_aufWeg`) lesen dieselbe Form.
        // Der Vorplatz trägt den Belag seiner Gasse (fachwerk `belagAm` an seinem Gassen-Ende): vor dem Pflaster liegt Pflaster bis an
        // die Schwelle, vor der Erd-Gasse getretene Erde — sonst stünde je Tür ein Erd-Fleck im Kopfstein.
        const kasten = (vp, belag) => {
            if (!vp || !this._landAt(vp.cx, vp.cz, 0.2)) return;
            const B = belagVon(belag || "weg", "ein Vorplatz");
            form({
                typ: "kasten",
                kanal: B.kanal,
                wert: B.wert,
                ax: vp.cx,
                az: vp.cz,
                bx: vp.cx,
                bz: vp.cz,
                ex: vp.ex,
                ez: vp.ez,
                phi: vp.phi || 0,
                halb: 0,
            });
        };
        let reich = 0; // so weit reicht der Plan um seinen Ursprung (dieselbe Hülle wie die Ort-Wahl, `_ortWahl`)
        for (const s of plan.slots || []) reich = Math.max(reich, Math.hypot(s.x || 0, s.z || 0) + 16);
        // Der Maler malt weich (±`WEGE_KARTE.randM`, `_wegeFormGewicht`): zwei Formen, die sich nur berühren, tragen an ihrer Naht je
        // die Hälfte — dort wuchs die Wiese mit 54 % ihrer Dichte zwischen Gasse und Stufe (K66, Prüfung 1: Bild tuer2, das Feld
        // fiel auf 0,5; an der Schwelle, wo die Fläche an der Hauswand endet, auf 0,8). Der Boden des Vorplatzes greift darum um den
        // Rand des Malers unter die Schwelle und um sein ganzes Band (2 · randM) über den Saum hinaus in die Gasse (mit einem randM
        // blieben am Akt zwei Häuser bei 0,89 am Rand der Gasse). Ebenso quer: um ein randM über jede Flanke der Platte — sonst trug die
        // Flanke der Stufe das Feld 0,5 und die Wiese stand dort mit der Hälfte ihrer Dichte auf der Platte (K66, Prüfung 3: Bild tuer2,
        // Halme über der Stufe; gate:settlement Teil O misst die ganze Breite).
        const RW = AnazhRealm.WEGE_KARTE.randM;
        for (const p of this._erdbauRoh())
            if (p.vorplatz != null && Math.hypot(p.cx - origin.x, p.cz - origin.z) <= reich) {
                const b = FC.vorplatzBoden(p);
                const sn = Math.sin(b.phi);
                const cs = Math.cos(b.phi);
                kasten(
                    {
                        cx: b.cx - (sn * RW) / 2,
                        cz: b.cz - (cs * RW) / 2,
                        phi: b.phi,
                        ex: b.ex + RW,
                        ez: b.ez + 1.5 * RW,
                    },
                    // das Gassen-Ende der Platte (plan-lokal): dort liest sie den Belag ihrer Gasse oder ihres Platzes
                    FC.belagAm(plan, b.cx - sn * b.ez - origin.x, b.cz - cs * b.ez - origin.z, 2 * RW) || "weg"
                );
            }
        for (const sl of plan.slots || []) {
            if (!sl.tuer || !FC.eingangVon(sl).hof) continue;
            const st = FC.vorplatzFlaeche(sl, undefined, true);
            if (st)
                kasten({
                    cx: origin.x + st.cx,
                    cz: origin.z + st.cz,
                    phi: st.phi,
                    ex: st.ex + RW,
                    ez: st.ez + RW,
                });
        }
        // Die ÄCKER (felder-Schicht): je OBB ein gedrehtes Acker-Rechteck (Kanal G) — die Layout-Wahrheit des
        // Gesetzbuchs lebt im Boden.
        for (const fd of plan.felder || []) {
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const wx = origin.x + fd.cx;
            const wz = origin.z + fd.cz;
            if (!this._landAt(wx, wz, 0.2)) continue;
            form({
                typ: "kasten",
                kanal: 1,
                ax: wx,
                az: wz,
                bx: wx,
                bz: wz,
                ex: fd.ex,
                ez: fd.ez,
                phi: fd.phi || 0,
                halb: 0,
            });
        }
        // die Fahrbahnen zuletzt (`_wegeKarteMale`: jedes Pflaster davor nahm die Erde unter sich, sie tragen sie wieder auf);
        // die Zahl der Boden-Schichten zählt sie nicht (dasselbe Stück wie seine Gasse)
        for (const f of fahrbahnen) {
            form(f);
            n--;
        }
        if (box.formen.length) {
            wk.siedlungen.push(box);
            wk.raeumen.push(box); // was schon auf Weg, Platz und Acker wuchs, räumt der Takt (`_wegeRaeumen`)
            this._wegKoerperStand().schmutz = true; // ihre Kanten werden Körper, sobald sie im Kreis liegt (`_wegKoerperTakt`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Natur-Wand kennt die neue Fläche (`_aufWeg`)
        }
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
        // DIE ERSTE SIEDLUNG zentriert die Karte SOFORT: die Wiese über ihr wächst im selben Takt neu
        // (`_nahWieseNeuIn` → `_tickNahWiese` vor `_tickWegeKarte`) und läse vor dem Zentrieren 0 — Halme im Weg.
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((s) => !s.zentriert)) this._tickWegeKarte(pm.position);
        if (box.x0 < box.x1) this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
        if (nurWege) return n;
        // ZÄUNE (fences-Schicht): je Segment ein schmaler hüfthoher Holz-Streifen aus dem Zaun-Pool (sy 0.85)
        // — bewusst KEIN Blocker, das Dorf bleibt durchlässig.
        for (const fz of plan.fences || []) {
            if (!fz || !Number.isFinite(fz.x0) || !Number.isFinite(fz.x1)) continue;
            const ax = origin.x + fz.x0;
            const az = origin.z + fz.z0;
            const bx = origin.x + fz.x1;
            const bz = origin.z + fz.z1;
            const dx = bx - ax;
            const dz = bz - az;
            const len = Math.hypot(dx, dz);
            if (!(len > 0.4)) continue;
            if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue;
            const y0 = this.getTerrainHeightAt(ax, az);
            const y1 = this.getTerrainHeightAt(bx, bz);
            if (!Number.isFinite(y0) || !Number.isFinite(y1)) continue;
            this._stlZaunAddStrip(
                (ax + bx) / 2,
                (y0 + y1) / 2 + 0.42,
                (az + bz) / 2,
                Math.atan2(dx, dz),
                -Math.atan2(y1 - y0, len),
                0.12,
                0.85,
                len,
                0x6a4e32
            );
            n++;
        }
        return n + this._stlMauerBuild(plan, origin);
    }
    // DIE STADTMAUER (siedlung.K2): die Mauer des Exports (fachwerk `dorfLayout` → exportSettlement `mauer`: Segmente zwischen
    // den Toren, Türme) im Mauer-Pool, in den Maßen des Gesetzbuchs (fachwerk STADTMAUER — dieselben baut das Labor) und den
    // Farben von DEFCOL (stein · ziegel). Der Fuß liest den Boden an beiden Enden und über die Länge: die Wand reicht
    // `STADTMAUER_FUSS_M` unter den tiefsten Punkt unter ihrer Sehne, die Krone folgt dem Hang; der Turm steht auf seiner
    // tiefsten Ecke. Was die Wasser-Wand nimmt, steht nicht. Die Natur weicht der Mauer wie dem Anger (`kanal` −1: kein
    // Boden-Kanal, die Natur-Wand hält die Linie frei). Bis K2 strich der Export die Mauer — die Stadt der Welt stand ohne sie.
    _stlMauerBuild(plan, origin) {
        const M = plan && plan.mauer;
        if (!M || !Array.isArray(M.segs) || !this.state.scene) return 0;
        const FC = globalThis.__fachwerkCore;
        const SM = FC.STADTMAUER;
        const stein = FC.DEFCOL.stein;
        const ziegel = FC.DEFCOL.ziegel;
        const P = this._stlMauerEnsurePool();
        const wk = this._wegeKarteEnsure();
        const FUSS = AnazhRealm.STADTMAUER_FUSS_M;
        // die Mauer merkt ihren Plan und ihre Streifen im Pool (`_stlMauerNeu`: sie wächst mit dem Ort)
        const box = {
            x0: Infinity,
            z0: Infinity,
            x1: -Infinity,
            z1: -Infinity,
            formen: [],
            mauerVon: plan,
            streifen: [P ? P.top : 0],
        };
        const form = (f) => {
            box.formen.push(f);
            const r = AnazhRealm._wegeFormRadius(f);
            box.x0 = Math.min(box.x0, f.ax - r, f.bx - r);
            box.x1 = Math.max(box.x1, f.ax + r, f.bx + r);
            box.z0 = Math.min(box.z0, f.az - r, f.bz - r);
            box.z1 = Math.max(box.z1, f.az + r, f.bz + r);
        };
        let n = 0;
        for (const sg of M.segs) {
            const ax = origin.x + sg.x0;
            const az = origin.z + sg.z0;
            const bx = origin.x + sg.x1;
            const bz = origin.z + sg.z1;
            const dx = bx - ax;
            const dz = bz - az;
            const len = Math.hypot(dx, dz);
            if (!(len > 0.5) || !this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue;
            const y0 = this.getTerrainHeightAt(ax, az);
            const y1 = this.getTerrainHeightAt(bx, bz);
            if (!Number.isFinite(y0) || !Number.isFinite(y1)) continue;
            let tief = 0;
            for (let k = 1; k < 4; k++) {
                const y = this.getTerrainHeightAt(ax + (dx * k) / 4, az + (dz * k) / 4);
                if (Number.isFinite(y)) tief = Math.max(tief, y0 + ((y1 - y0) * k) / 4 - y);
            }
            const fuss = FUSS + tief;
            const mx = (ax + bx) / 2;
            const mz = (az + bz) / 2;
            const my = (y0 + y1) / 2;
            const yaw = Math.atan2(dx, dz);
            const pitch = -Math.atan2(y1 - y0, len);
            const L = len + SM.wand.ueber;
            this._stlStreifen(
                P,
                mx,
                my + (SM.wand.hoch - fuss) / 2,
                mz,
                yaw,
                pitch,
                SM.wand.dick,
                SM.wand.hoch + fuss,
                L,
                stein
            );
            this._stlStreifen(P, mx, my + SM.krone.y, mz, yaw, pitch, SM.krone.dick, SM.krone.hoch, L, stein);
            form({ typ: "segment", kanal: -1, ax, az, bx, bz, halb: SM.krone.dick / 2 });
            n++;
        }
        const tb = SM.turm.breit / 2;
        for (const t of Array.isArray(M.towers) ? M.towers : []) {
            const x = origin.x + t.x;
            const z = origin.z + t.z;
            if (!this._landAt(x, z, 0.2)) continue;
            const y = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(y)) continue;
            let tief = 0;
            for (const [ex, ez] of [
                [-tb, -tb],
                [tb, -tb],
                [-tb, tb],
                [tb, tb],
            ]) {
                const ye = this.getTerrainHeightAt(x + ex, z + ez);
                if (Number.isFinite(ye)) tief = Math.max(tief, y - ye);
            }
            const fuss = FUSS + tief;
            this._stlStreifen(
                P,
                x,
                y + (SM.turm.hoch - fuss) / 2,
                z,
                0,
                0,
                SM.turm.breit,
                SM.turm.hoch + fuss,
                SM.turm.breit,
                stein
            );
            this._stlStreifen(P, x, y + SM.dach.y, z, 0, 0, SM.dach.breit, SM.dach.hoch, SM.dach.breit, ziegel);
            form({ typ: "kasten", kanal: -1, ax: x, az: z, bx: x, bz: z, ex: tb, ez: tb, phi: 0, halb: 0 });
            n++;
        }
        box.streifen.push(P ? P.top : 0);
        if (box.formen.length) {
            wk.siedlungen.push(box); // die Natur-Wand liest die Linie (`_aufWeg`); einen Boden-Kanal malt sie nicht
            wk.raeumen.push(box); // was schon in der Linie der Mauer wuchs, räumt der Takt (`_wegeRaeumen`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1);
        }
        return n;
    }

    // ═══ DER WEG-KÖRPER (w28-weg-koerper; fachwerk WEG_GESETZ) ═══
    // Bord, Gehsteig und Kantstein sind KÖRPER MIT KANTE — Glieder im EINEN Kisten-Pool „siedlung-weg“ (`_kistenPool`: der Stoff
    // und das Programm von Zaun und Mauer, EIN Befehl), je Glied eine Kiste in der Farbe ihres Steins:
    //   der BORDSTEIN der Fahrstraße (Glieder `bord.steinM`) und die PLATTEN ihres Gehsteigs (`platteM`), wo das GESETZ die Stufe
    //   trägt — die Fläche des Erdbaus (gelaende-core `erdbauFlaeche`, der Gehsteig ist eine Trasse des Plans v2, `ortPlan`) liegt
    //   am Glied um mehr als die halbe Stufe über der Fahrbahn; ihre Oberkante IST die Fläche. Wo eine Gasse mündet, eine Straße
    //   kreuzt, die Wende des Verkehrs ihren Boden legt oder die Fußgängerzone beginnt, trägt das Gesetz keine Stufe, also steht
    //   kein Glied (der abgesenkte Bord) — der Körper zeigt, worauf jeder Leib und jedes Rad ohnehin steht.
    //   der KANTSTEIN (`kant`) fasst das Pflaster der Gasse ohne Wagen und jeden Platz mit Belag, wo außen kein Weg und kein
    //   Haus anschließt (die Bytes der Wege-Karte, der Grund der Häuser); er sitzt auf dem gezeichneten Boden (`_bodenSichtAt`).
    // DIE STUFEN: bis `nahM` jedes Glied, bis `mittelM` je Stück EINE Kiste über seine Glieder (dieselbe Fläche, dieselbe Kante),
    // dahinter malt die Wege-Karte Fahrbahn, Bord-Linie und Gehsteig (`_wegeBodenFarbe`) — die Kosten binden an den Kreis um
    // den Spieler und die Änderung, nie an die Größe der Stadt (die Glieder eines Stücks entstehen, wenn es in den Kreis kommt,
    // höchstens `fristMs` je Takt). Der Stand-Leser der Sicht steht auf ihnen (`_wegKoerperAt` in `_standSicht`: Fuß, Huf, Rad).
    _wegKoerperStand() {
        const st = this.state;
        return (
            st.wegKoerper ||
            (st.wegKoerper = { pool: null, mitte: null, schmutz: true, offen: 0, index: new Map(), erdbau: -1 })
        );
    }
    // Die Aufgaben einer Siedlung (`box` der Wege-Karte): je Stück eines Wegs mit Kante und je Seite eine, je Kante des Platzes eine
    _wegKoerperAufgaben(box) {
        const FC = globalThis.__fachwerkCore;
        const plan = box.plan;
        const o = box.ursprung;
        const auf = [];
        if (!plan || !o) return auf;
        for (const rd of plan.roads || []) {
            const P = rd.pts;
            if (!Array.isArray(P) || P.length < 2) continue;
            const Q = FC.wegQuerschnitt(plan, rd);
            if (Q.kante === "gras") continue;
            const quer = FC.wegQuer(P);
            for (let i = 0; i + 1 < P.length; i++)
                for (const s of [-1, 1])
                    auf.push({
                        art: Q.kante,
                        Q,
                        ax: o.x + P[i].x,
                        az: o.z + P[i].z,
                        bx: o.x + P[i + 1].x,
                        bz: o.z + P[i + 1].z,
                        nax: s * quer[i][0],
                        naz: s * quer[i][1],
                        nbx: s * quer[i + 1][0],
                        nbz: s * quer[i + 1][1],
                        steig: rd.ys ? rd.ys[i + 1] - rd.ys[i] : 0,
                        fein: null,
                        grob: null,
                    });
        }
        // der Platz: seine vier Kanten als Stücke, die Quer-Richtung zeigt nach innen (der Kantstein liegt IM Belag)
        const pz = plan.platz;
        if (pz && Number.isFinite(pz.cx) && Number.isFinite(pz.ex) && FC.platzBelag(plan) !== "gras") {
            const [c, s] = [Math.cos(pz.phi || 0), Math.sin(pz.phi || 0)];
            const ecke = (u, v) => [o.x + pz.cx + u * c + v * s, o.z + pz.cz - u * s + v * c];
            const E = [ecke(-pz.ex, -pz.ez), ecke(pz.ex, -pz.ez), ecke(pz.ex, pz.ez), ecke(-pz.ex, pz.ez)];
            for (let k = 0; k < 4; k++) {
                const [A, B] = [E[k], E[(k + 1) % 4]];
                const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
                // nach innen: zur Mitte des Platzes
                let [nx, nz] = [-(B[1] - A[1]) / L, (B[0] - A[0]) / L];
                if (nx * (o.x + pz.cx - A[0]) + nz * (o.z + pz.cz - A[1]) < 0) [nx, nz] = [-nx, -nz];
                // der Platz ohne Pflaster ist mit Feldsteinen gefasst (`feld`), der gepflasterte mit dem Kantstein seines Steins
                const feld = FC.platzBelag(plan) !== "pflaster";
                auf.push({ art: "platz", feld, ax: A[0], az: A[1], bx: B[0], bz: B[1], nax: nx, naz: nz, nbx: nx, nbz: nz, steig: 0, fein: null, grob: null }); // prettier-ignore
            }
        }
        return auf;
    }
    // EIN STÜCK WIRD KÖRPER: seine Glieder (`fein`) und ihre Kisten über das Stück (`grob`), je Glied neun Zahlen (Mitte x/y/z,
    // Gier, Neigung, quer, hoch, längs, Stein: 0 Bord · 1 Platte · 2 Kant · 3 Feldstein). → false, solange dem Stück eine Quelle
    // fehlt (der Kantstein liest die Wege-Karte und den gezeichneten Boden: beide stehen erst nah). Jede Kiste endet um die Fuge
    // (`fugeM`) vor ihrem Ende: nie liegen zwei Töne auf einer Ebene.
    _wegKoerperStueck(a, E) {
        const G = globalThis.__gelaendeCore;
        const W = AnazhRealm.Gesetz("fachwerk:WEG_GESETZ");
        const K = AnazhRealm.WEG_KOERPER;
        const fein = [];
        const grob = [];
        // der Lauf im Abstand `ab` von der Achse (außen +), an der Stelle t
        const am = (ab, t) => [
            a.ax + a.nax * ab + (a.bx + a.nbx * ab - a.ax - a.nax * ab) * t,
            a.az + a.naz * ab + (a.bz + a.nbz * ab - a.az - a.naz * ab) * t,
        ];
        // eine Kiste längs des Laufs `ab` von t0 bis t1, die Oberkante oben0 → oben1
        const kiste = (ziel, ab, t0, t1, oben0, oben1, quer, hoch, stein) => {
            const [p, q] = [am(ab, t0), am(ab, t1)];
            const [dx, dz] = [q[0] - p[0], q[1] - p[1]];
            const len = Math.hypot(dx, dz);
            if (!(len > 0.01)) return;
            ziel.push(
                (p[0] + q[0]) / 2,
                (oben0 + oben1) / 2 - hoch / 2,
                (p[1] + q[1]) / 2,
                Math.atan2(dx, dz),
                -Math.atan2(oben1 - oben0, len),
                quer,
                hoch,
                len - K.fugeM,
                stein
            );
        };
        const L = Math.hypot(a.bx - a.ax, a.bz - a.az);
        if (!(L > 0.01)) return ((a.fein = fein), (a.grob = grob), true);
        if (a.art === "bord") {
            const Q = a.Q;
            const B = W.bord;
            const m = Math.max(1, Math.round(L / B.steinM));
            const platte = Q.gehweg - B.breitM;
            const [abB, abP, abF] = [
                Q.fahrHalb + B.breitM / 2,
                Q.fahrHalb + B.breitM + platte / 2,
                Q.fahrHalb - K.probeM,
            ];
            // je Glied: trägt das Gesetz die Stufe? (die Fläche am Gehsteig über der an der Fahrbahn)
            const oben = [];
            for (let j = 0; j < m; j++) {
                const t = (j + 0.5) / m;
                const [g, f] = [am(abP, t), am(abF, t)];
                const [yg, yf] = [G.erdbauFlaeche(E, g[0], g[1]), G.erdbauFlaeche(E, f[0], f[1])];
                oben.push(
                    yg !== null && yf !== null && yg - yf > Q.stufeM / 2 && yg - yf < 2 * Q.stufeM ? yg + K.hubM : NaN
                );
            }
            const halb = a.steig / (2 * m); // der halbe Anstieg eines Glieds längs des Stücks
            const [hB, hP] = [Q.stufeM + B.fussM, Q.stufeM + B.fussM];
            // die Kiste über die Glieder eines Zugs (von … bis): sie bricht, wo das Gesetz die Stufe nicht trägt oder die Fläche springt
            const zug = (von, bis) => {
                const [o0, o1] = [oben[von] - halb, oben[bis] + halb];
                kiste(grob, abB, von / m, (bis + 1) / m, o0, o1, B.breitM, hB, 0);
                kiste(grob, abP, von / m, (bis + 1) / m, o0, o1, platte, hP, 1);
            };
            let von = -1;
            for (let j = 0; j < m; j++) {
                const da = oben[j] === oben[j];
                if (da) {
                    kiste(fein, abB, j / m, (j + 1) / m, oben[j] - halb, oben[j] + halb, B.breitM, hB, 0);
                    // die Platten des Gehsteigs: je Glied des Bords so viele, wie `platteM` längs trägt, jede in ihrem Bruchton
                    const n2 = Math.max(1, Math.round(L / m / W.platteM));
                    for (let u = 0; u < n2; u++) {
                        const [u0, u1] = [(j + u / n2) / m, (j + (u + 1) / n2) / m];
                        const [y0, y1] = [
                            oben[j] - halb + (2 * halb * u) / n2,
                            oben[j] - halb + (2 * halb * (u + 1)) / n2,
                        ];
                        kiste(fein, abP, u0, u1, y0, y1, platte, hP, 1);
                    }
                }
                if (da && von >= 0 && Math.abs(oben[j] - oben[j - 1] - 2 * halb) > K.sprungM) {
                    zug(von, j - 1);
                    von = j;
                } else if (da && von < 0) von = j;
                else if (!da && von >= 0) {
                    zug(von, j - 1);
                    von = -1;
                }
            }
            if (von >= 0) zug(von, m - 1);
        } else {
            // DER KANTSTEIN: an der Kante des Pflasters der Gasse (Bauflucht) oder des Platzes, wo außen weder Weg noch Haus liegt
            const B = W.kant;
            const rand = a.art === "platz" ? 0 : a.Q.fahrHalb + a.Q.gehweg; // der Platz trägt seine Kante selbst (die Quer-Richtung zeigt nach innen)
            const innen = a.art === "platz" ? 1 : -1;
            const abK = rand + (innen * B.breitM) / 2;
            const abAus = rand - innen * K.probeM;
            const belag = this._wegKoerperBelag || (this._wegKoerperBelag = {});
            const m = Math.max(1, Math.round(L / B.steinM));
            for (let j = 0; j < m; j++) {
                const t = (j + 0.5) / m;
                const [k, au] = [am(abK, t), am(abAus, t)];
                this._wegeBelagAt(au[0], au[1], belag);
                if (belag.pflaster >= 0.5 || belag.erde >= 0.5 || G.erdbauGrund(E, au[0], au[1], K.probeM)) continue;
                const y = this._bodenSichtAt(k[0], k[1]);
                if (y === null || !Number.isFinite(y)) {
                    // der Boden dort ist noch nicht gezeichnet: das Stück wartet (höchstens `warteN` Takte, dann ohne dieses Glied)
                    if ((a.wartet = (a.wartet || 0) + 1) <= K.warteN) return false;
                    continue;
                }
                kiste(
                    fein,
                    abK,
                    j / m,
                    (j + 1) / m,
                    y + B.hochM,
                    y + B.hochM,
                    B.breitM,
                    B.hochM + B.fussM,
                    a.feld ? 3 : 2
                );
            }
        }
        a.fein = fein;
        a.grob = grob;
        return true;
    }
    // DER TAKT DES WEG-KÖRPERS (aus `_tickWegeKarte`): die Stücke im Kreis um den Spieler werden Körper (höchstens `fristMs` je
    // Takt), und der Pool trägt, was im Kreis liegt — neu gefüllt, wenn der Spieler `umzugM` ging, ein Stück dazukam oder der
    // Erdbau sich änderte (das Gesetz ist die Quelle der Stufe: mit ihm fallen die Glieder).
    _wegKoerperTakt(playerPos) {
        const wk = this.state.wegeKarte;
        if (!wk || !playerPos || !wk.siedlungen.length) {
            const S0 = this.state.wegKoerper;
            if (S0 && S0.pool && S0.pool.top) this._wegKoerperFuellen(S0, []);
            return;
        }
        const S = this._wegKoerperStand();
        const K = AnazhRealm.WEG_KOERPER;
        const E = this._erdbauLage();
        const stand = this._erdbauStand || 0;
        // das Gesetz änderte sich (`_erdbauStand`): jedes Stück im Kreis liest seine Stufe neu — bis dahin steht es, wie es stand
        // (ein wachsender Ort legt je Haus einen Grund: kein Glied fällt, während die Frist die Stücke neu liest)
        if (S.erdbau !== stand) [S.erdbau, S.offen] = [stand, S.offen || 1];
        const [px, pz] = [playerPos.x, playerPos.z];
        const ging = !S.mitte || Math.hypot(px - S.mitte[0], pz - S.mitte[1]) >= K.umzugM;
        if (!ging && !S.schmutz && !S.offen) return;
        const t0 = performance.now();
        const R = K.mittelM + K.umzugM;
        let offen = 0;
        let neu = false;
        const im = [];
        for (const box of wk.siedlungen) {
            if (!box.plan || !box.ursprung) continue;
            if (box.x1 < px - R || box.x0 > px + R || box.z1 < pz - R || box.z0 > pz + R) continue;
            if (!box.koerper) box.koerper = this._wegKoerperAufgaben(box);
            for (const a of box.koerper) {
                const d = Math.hypot((a.ax + a.bx) / 2 - px, (a.az + a.bz) / 2 - pz);
                if (d > R) continue;
                // der Kantstein entsteht erst nah (er liest die Nah-Stufe der Wege-Karte und den gezeichneten Boden) und folgt
                // dem Erdbau nicht; der Bord liest die Stufe des Gesetzes an dessen Stand
                const kant = a.art !== "bord";
                if (kant ? !a.fein : a.stand !== stand) {
                    if (kant && d > K.nahM + K.umzugM) continue;
                    if (E && performance.now() - t0 <= K.fristMs && this._wegKoerperStueck(a, E))
                        [a.stand, neu] = [stand, true];
                    else offen++;
                }
                if (a.fein) im.push(a, d);
            }
        }
        S.offen = offen;
        S.neu = S.neu || neu;
        // neu gelesene Stücke füllen gebündelt: höchstens je `fuellMs`, zuletzt, wenn keines mehr offen ist
        const jetzt = performance.now();
        if (!ging && !S.schmutz && !(S.neu && (!offen || jetzt - (S.gefuellt || 0) >= K.fuellMs))) return;
        [S.mitte, S.schmutz, S.neu, S.gefuellt] = [[px, pz], false, false, jetzt];
        this._wegKoerperFuellen(S, im);
    }
    // Der Pool trägt die Stücke `im` ([Stück, Abstand] in Folge): bis `nahM` ihre Glieder, dahinter ihre Kisten; der Raum-Index
    // der Auflage (`_wegKoerperAt`) trägt die Kisten jedes Stücks im Kreis.
    _wegKoerperFuellen(S, im) {
        const K = AnazhRealm.WEG_KOERPER;
        let n = 0;
        for (let i = 0; i < im.length; i += 2) n += (im[i + 1] <= K.nahM ? im[i].fein : im[i].grob).length / 9;
        let P = S.pool;
        if (!P && !n) return;
        if (!P || n > P.cap) {
            let cap = P ? P.cap : 512;
            while (cap < n) cap *= 2;
            const mesh = this._kistenPool("siedlung-weg", cap);
            this.state.scene.add(mesh);
            if (P) {
                this.state.scene.remove(P.mesh);
                this._instanzAbschied(P.mesh);
            }
            P = S.pool = { mesh, cap, top: 0 };
        }
        const m = this._stlWegeTmpM || (this._stlWegeTmpM = new THREE.Matrix4());
        const q = this._stlWegeTmpQ || (this._stlWegeTmpQ = new THREE.Quaternion());
        const e = this._stlWegeTmpE || (this._stlWegeTmpE = new THREE.Euler());
        const v = this._stlWegeTmpV || (this._stlWegeTmpV = new THREE.Vector3());
        const s = this._stlWegeTmpS || (this._stlWegeTmpS = new THREE.Vector3());
        const c = this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color());
        const F = this._wegKoerperFarben();
        const Z = K.zelleM;
        S.index.clear();
        let slot = 0;
        for (let i = 0; i < im.length; i += 2) {
            const a = im[i];
            const g = im[i + 1] <= K.nahM ? a.fein : a.grob;
            for (let o = 0; o < g.length; o += 9) {
                e.set(g[o + 4], g[o + 3], 0, "YXZ");
                q.setFromEuler(e);
                m.compose(v.set(g[o], g[o + 1], g[o + 2]), q, s.set(g[o + 5], g[o + 6], g[o + 7]));
                P.mesh.setMatrixAt(slot, m);
                // der Bruchton je Glied (die Ziehung aus seiner Lage: derselbe Stein trägt in jeder Füllung denselben Ton)
                const zug = Math.sin(g[o] * 12.9898 + g[o + 2] * 78.233) * 43758.5453;
                const f = F[g[o + 8]];
                const ton = 1 + (2 * (zug - Math.floor(zug)) - 1) * f[3];
                P.mesh.setColorAt(slot++, c.setRGB(f[0] * ton, f[1] * ton, f[2] * ton));
            }
            // die Auflage: die Kisten des Stücks (Bord und Platte — der Kantstein ist keine Stufe)
            const k = a.grob;
            for (let o = 0; o < k.length; o += 9) {
                const r = Math.hypot(k[o + 5], k[o + 7]) / 2;
                for (let ix = Math.floor((k[o] - r) / Z); ix <= Math.floor((k[o] + r) / Z); ix++)
                    for (let iz = Math.floor((k[o + 2] - r) / Z); iz <= Math.floor((k[o + 2] + r) / Z); iz++) {
                        const key = ix * 2097152 + iz;
                        const l = S.index.get(key);
                        if (l) l.push(k, o);
                        else S.index.set(key, [k, o]);
                    }
            }
        }
        P.top = slot;
        AnazhRealm._instanzZahl(P.mesh, slot);
        P.mesh.instanceMatrix.needsUpdate = true;
        if (P.mesh.instanceColor) P.mesh.instanceColor.needsUpdate = true;
    }
    // Die Farben der Glieder (linear, [r, g, b, Bruchton ±]): der Bord der Granit des Stein-Gesetzes, die Platte sein Mittel im
    // Kopfstein (`_kopfsteinMittel`: der Gehsteig der Ferne ist dasselbe Pflaster der Wege-Karte — kein Sprung im Ton, wo die
    // Kisten enden), der Kantstein der Bord, der Feldstein der Stein der Mauer.
    _wegKoerperFarben() {
        if (this._wegKoerperFarbe) return this._wegKoerperFarbe;
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        const g = AnazhRealm._srgbHexLinear(AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[K.stein]);
        const B = AnazhRealm.WEG_KOERPER;
        const mal = (k, ton) => [g[0] * k, g[1] * k, g[2] * k, ton];
        const mittel = AnazhRealm._kopfsteinMittel();
        // der Feldstein fasst den Platz ohne Pflaster: der Stein der Mauer (fachwerk DEFCOL.stein), gröber im Bruch
        const feld = AnazhRealm._srgbHexLinear(globalThis.__fachwerkCore.DEFCOL.stein);
        const bord = mal(B.bordTon, B.bruchTon);
        return (this._wegKoerperFarbe = [
            bord,
            mal(mittel, B.bruchTon),
            bord,
            [feld[0], feld[1], feld[2], 2 * B.bruchTon],
        ]);
    }
    // DIE AUFLAGE DES WEG-KÖRPERS AM PUNKT: die Oberkante der Platte oder des Bords unter (x, z), −Infinity ohne — der gezeichnete
    // Boden dort (Leser: `_standSicht`; das Gesetz trägt dieselbe Höhe, die Sim steht auf ihm).
    _wegKoerperAt(x, z) {
        const S = this.state.wegKoerper;
        if (!S || !S.index.size) return -Infinity;
        const Z = AnazhRealm.WEG_KOERPER.zelleM;
        const l = S.index.get(Math.floor(x / Z) * 2097152 + Math.floor(z / Z));
        if (!l) return -Infinity;
        let top = -Infinity;
        for (let i = 0; i < l.length; i += 2) {
            const [k, o] = [l[i], l[i + 1]];
            const [dx, dz] = [x - k[o], z - k[o + 2]];
            const [sn, cs] = [Math.sin(k[o + 3]), Math.cos(k[o + 3])];
            const laengs = dx * sn + dz * cs;
            if (Math.abs(laengs) > k[o + 7] / 2 || Math.abs(dx * cs - dz * sn) > k[o + 5] / 2) continue;
            const y = k[o + 1] + k[o + 6] / 2 - Math.tan(k[o + 4]) * laengs;
            if (y > top) top = y;
        }
        return top;
    }

    _stlWegeDispose() {
        const WKp = this.state.wegKoerper;
        if (WKp) {
            if (WKp.pool && WKp.pool.mesh) {
                if (WKp.pool.mesh.parent) WKp.pool.mesh.parent.remove(WKp.pool.mesh);
                this._instanzAbschied(WKp.pool.mesh);
            }
            this.state.wegKoerper = null;
        }
        for (const feld of ["stlZaun", "stlMauer"]) {
            const P = this.state[feld];
            if (P && P.mesh) {
                if (P.mesh.parent) P.mesh.parent.remove(P.mesh);
                this._instanzAbschied(P.mesh);
            }
            this.state[feld] = null;
        }
        // Die Wege-Karte leert sich (die Formen und die Kronen gehören der alten Welt; die neue pflanzt neu); die
        // Texturen bleiben (kein Re-Compile).
        const wk = this.state.wegeKarte;
        if (wk) {
            wk.siedlungen.length = 0;
            wk.kronen.clear();
            wk.kronenZellen.clear();
            wk.kronenRandMax = 0;
            for (const stufe of wk.stufen) {
                stufe.daten.fill(AnazhRealm.WEGE_KARTE.null);
                stufe.zentriert = false;
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
                stufe.kronen.summe.fill(0);
                stufe.kronen.asche.fill(0);
                stufe.kronen.daten.fill(0);
                stufe.kronen.schmutz = null;
                this._wegeSchichtHoch(stufe.kronen.tex, stufe.schicht);
            }
        }
        if (this._stlWegeKeys) this._stlWegeKeys.clear(); // die Session-Marken fallen mit (Rebuild baut neu)
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_wege]);

// ===== ATLAS · Siedlung/wege — Außen-Konstanten =====
// WEGE_KARTE (`_wegeKarteEnsure`): die welt-verankerte Clipmap der Siedlungs-Wege um den Spieler, je Stufe ein
// Fenster (Kante `fensterM`, Texel `texelM`), Umzug ab `umzugM` Abstand zur Mitte — gesichert ist fensterM/2 −
// umzugM: NAH 512 m zu 0,5 m (ein 2,5-m-Weg = 5 Texel, die Kante bilinear weich), gesichert 208 m ≥ die Ring-Kante
// 194 m des Standard-Rings; FERN 2048 m zu 2 m, gesichert 768 m ≥ der größte Chunk-Ring (12,5 × 43,2 = 540 m).
// Der Rand fällt über ±max(randM, randMinM) weich (getretene Erde läuft in die Wiese aus; fern ≥ 1 Texel).
// DER BELAG (rg8unorm um `null` = 127, `voll` = 127 der volle Anteil; nie rg8snorm — r184 legt jede Daten-Textur auch als
// Render-Ziel an, ohne texture-formats-tier1 ist sie ungültig): je Kanal zwei Arten mit Vorzeichen — R: + getretene Erde, − Rasen;
// G: + Acker, − Pflaster. Ein Belag der Flächen eines Plans (fachwerk `belag`) trägt seinen Kanal und sein Vorzeichen (`belag`);
// eine Art, die die Karte nicht kennt, wirft laut (`_stlWegeBuild`). Das Pflaster liegt in G über dem Rasen in R: Kopfstein und
// Rasen-Keil grenzen ohne Naht aneinander; nur Erde und Rasen teilen den Kanal (der Rand des Wegs läuft über den Grund aus).
// DER TRAMPELPFAD (`_tritt`): die Zelle (m), die Halbbreite der getretenen Spur (der Leib, m) und ihr weicher Rand, die Tritte, mit
// denen 63 % der Erde stehen (ein Pfad nach einigen Dutzend Gängen), die Tage, in denen der Halm 63 % zurückholt, das Raster der
// Stufen, der PFAD (stoffe.K4: „ein 100× gegangener Weg wird Pfad (Gras-Dichte −60 %)“ — der Anteil der Halme, den die Wiese auf
// ihm höchstens trägt; die erste Stufe, die das hält, ist 6/8 bei 27,7 Tritten, `_trittStufe`), der Versatz, der kein Schritt
// ist (m), der Takt der Uploads (ms) und das Raster des Stands: die Zahl je Achtel-Tritt, die Zeit je Spiel-Stunde (die Erholung
// verschiebt sich um ≤ 2,1 ‰ der Zahl).
AnazhRealm.TRITT = Object.freeze({
    zelleM: 0.5,
    halbM: 0.55,
    randM: 0.3,
    tritte: 20,
    erholTage: 20,
    stufen: 8,
    pfadGras: 0.4,
    sprungM: 1.5,
    uploadMs: 250,
    standN: 8,
    standT: 24,
});
AnazhRealm.WEGE_KARTE = Object.freeze({
    stufen: Object.freeze([
        Object.freeze({ name: "nah", fensterM: 512, texelM: 0.5, umzugM: 48, randMinM: 0 }),
        Object.freeze({ name: "fern", fensterM: 2048, texelM: 2, umzugM: 256, randMinM: 2 }),
    ]),
    randM: 0.6,
    voll: 127,
    null: 127,
    belag: Object.freeze({
        weg: Object.freeze({ kanal: 0, wert: 1 }),
        gras: Object.freeze({ kanal: 0, wert: -1 }),
        pflaster: Object.freeze({ kanal: 1, wert: -1 }),
        // die Fahrbahn der Fahrstraße (fachwerk WEG_GESETZ): Erde UNTER Pflaster — die zweite Form eines Stücks (`fahr`), gemalt
        // nach allen anderen ihrer Siedlung; kein anderer Maler legt Erde auf Pflaster (`_wegeKarteMale`)
        fahrbahn: Object.freeze({ kanal: 0, wert: 1 }),
    }),
});
// DAS BILD DES WEGS im Boden-Stoff (`_wegeBodenFarbe`; w28-weg-koerper). `erdKante`: das halbe Band des Gewichts, über das die
// Erde an ihrer Kante bricht; `erdZunge`: so weit verschiebt die Laub-Probe (± 0,3) diese Kante im Gewicht (± 0,15 ≈ ± 18 cm);
// `kanteAA`: die Spanne des Gewichts je Pixel, in der das Pflaster endet (mindestens, höchstens). `erdKorn` · `erdFleck`: das Korn
// des Kieses und die Flecken der gestampften Erde (± Anteil ihres Tons); `erdRand`: so weit zieht die Kante zur nassen Erde.
// `fahrbahnTon`: der Stein der Fahrbahn gegen den des Gehsteigs; `kantBand` · `bordBand`: das Band des Gewichts hinter der Kante
// des Pflasters bzw. vor der Kante der Fahrbahn, das die Läuferreihe trägt (0,25 ≈ 0,2 m in der Nah-Stufe).
AnazhRealm.WEG_BILD = Object.freeze({
    erdKante: 0.08,
    erdZunge: 0.5,
    kanteAA: Object.freeze([0.03, 0.2]),
    erdKorn: 0.16,
    erdFleck: 0.1,
    erdRand: 0.45,
    fahrbahnTon: 0.7,
    kantBand: 0.25,
    bordBand: 0.2,
});
// DER WEG-KÖRPER (`_wegKoerperTakt`): bis `nahM` zeichnet der Pool jedes Glied (Bordstein, Platte, Kantstein), bis `mittelM` je
// Stück eine Kiste, dahinter malt die Karte; `umzugM`: so weit geht der Spieler, bis der Pool neu gefüllt wird; `fristMs`: so lange
// werden je Takt Stücke zu Körpern, `fuellMs`: so oft füllt der Pool höchstens, während Stücke entstehen; `zelleM`: das Raster
// der Auflage (`_wegKoerperAt`); `hubM`: so weit liegt die Oberkante über der Fläche des Gesetzes (kein Flimmern gegen den
// gezeichneten Boden auf gleicher Höhe); `fugeM`: die Fuge zwischen zwei Gliedern (jede Kiste endet um sie
// kürzer); `probeM`: so weit neben der Kante liest ein Glied Fahrbahn bzw. Außen-Grund;
// `sprungM`: ab diesem Sprung der Fläche bricht die Kiste eines Zugs; `warteN`: so viele Takte wartet ein Kantstein auf den
// gezeichneten Boden; `bordTon` · `bruchTon`: der Ton des Bords am Granit des Stein-Gesetzes und die Streuung je Glied.
AnazhRealm.WEG_KOERPER = Object.freeze({
    nahM: 70,
    mittelM: 220,
    umzugM: 8,
    fristMs: 1.5,
    fuellMs: 250,
    zelleM: 4,
    hubM: 0.015,
    fugeM: 0.006,
    probeM: 0.3,
    sprungM: 0.02,
    warteN: 120,
    bordTon: 1,
    bruchTon: 0.07,
});
// DIE LAUB-STREU UNTER DEN KRONEN (`_kronenStreuNeu`, Welle 5 Boden): je Wege-Stufe eine R8-Karte im selben Fenster — `texelM` je Stufe
// (nah 1 m, fern 4 m: 512² = 256 KB je Stufe); eine Krone legt `dichte` Laubstreu bis `kern` × Kronen-Radius, weich
// fallend bis `rand` × Radius (die Krone des Studio-Baums reicht über den Schüchternheits-Radius hinaus, das Laub weht
// vor die Traufe), Kronen summieren sich (zwei überlappende decken den Grund); `kroneJeHoehe` = Kronen-Radius je Meter
// Sichthöhe für Streu-Arten ohne Kronen-Eintrag im Wald-Generator; `uploadMs` = höchstens ein Upload je Stufe in diesem
// Takt; `zelleM` = die Kante der Index-Zellen des Kronen-Registers (ein Nah-Umzug fragt ≤ 30 Zellen, ein ferner ≤ 204 —
// um den größten Laub-Rand 21 m erweitert —, nie den Bestand).
AnazhRealm.LAUB_STREU = Object.freeze({
    texelM: Object.freeze([1, 4]),
    dichte: 0.6,
    kern: 1.0,
    rand: 1.7,
    kroneJeHoehe: 0.35,
    uploadMs: 250,
    zelleM: 64,
});
