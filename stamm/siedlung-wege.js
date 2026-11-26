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
        // DIE DECKE DES BODENS (stoffe.K2#2, stoffe.K3-2): die Kronen-Karte trägt vier Kanäle derselben Fläche — R die Laubstreu
        // unter den Kronen, G die Asche des Brands (`_ascheMalen`), B die Decke der Lava und A ihre Glut (`_lavaMalen`); EIN
        // Sampler, EIN Abgriff je Stufe im Boden-Stoff. Hinter den Stufen trägt sie eine Schicht im selben Raster: DIE NEIGUNG DES
        // GESETZES für den Fern-Ring (`_fernNeigungTakt`, R/G die Normale x/z) — der Ring-Stoff trägt 16 von 16 Texturen, eine
        // eigene Karte bände er nie (WebGPU 16 je Stufe, WebGL2 16 Einheiten): darum trägt die Lava ihre Kanäle HIER (B/A).
        const streu = karte(kN, 4, THREE.RGBAFormat, "kronen-streu", 0, W.stufen.length + 1);
        const fluesse = karte(N, 1, THREE.RedFormat, "fluss-karte");
        const stufen = W.stufen.map((S, si) => {
            const daten = wege.schicht(si);
            const tex = wege.tex;
            // DIE KRONEN-STREU dieser Stufe: dasselbe Fenster, dieselbe Mitte (also dasselbe UV), eigenes Raster.
            // `summe` ist die Wahrheit (die ungekappte Summe aller Kronen-Beiträge je Texel — eine Krone fällt exakt
            // heraus), `daten` ihr gekapptes Abbild für die Karte, nachgezogen im Schmutz-Rechteck beim Upload.
            // `asche` ist die Wahrheit des Kanals G (die Asche je Texel, 0…255, gemalt aus den Taten `brand`), `lava` und `glut`
            // die der Kanäle B und A (die Decke der Lava und ihre Glut je Texel, gemalt aus den Taten `lava`).
            const kronen = {
                N: kN,
                summe: new Uint16Array(kN * kN),
                asche: new Uint8Array(kN * kN),
                lava: new Uint8Array(kN * kN),
                glut: new Uint8Array(kN * kN),
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
    // Mitte (das Auge `_lodAuge`, `_tickNahWiese` · `_tickNahStreu`) reicht; weiter weg steht keine Kachel. Bis K70-N1 galt die
    // Reichweite der Wiese (27 m) um den Spieler: die Streu-Kacheln am Ringrand (bis 35 m) behielten das alte Licht.
    _kronenStreuWiese(x, z, radius) {
        const mitte = this._lodAuge(); // das EINE Auge der Stufen
        if (!mitte) return;
        const a = AnazhRealm._kronenReich(radius);
        if (Math.hypot(x - mitte.x, z - mitte.z) - a < AnazhRealm._nahRingReich())
            this._nahWieseNeuIn(x - a, z - a, x + a, z + a);
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
        this._lavaStufeMalen(stufe); // die Lava des Fensters neu (die Laven der Taten)
        kr.schmutz = [0, N - 1, 0, N - 1]; // das ganze Abbild zog um
        kr.upload = -Infinity; // nach dem Umzug sofort hochladen
    }

    // Die Kronen-Streu an (x, z) ∈ [0, 1] — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest (dieselbe
    // Stufen-Wahl wie `_wegeFeldAt`). DIE EINE Lese-Stelle für „hier steht Wald": das Kronendach der gepflanzten Bäume
    // (0 offen, 0,6 unter einer Krone, 1 wo Kronen sich schließen) — Boden, Nah-Wiese und Klang lesen sie, nie das
    // Kronenlicht-Feld der Platzierung (`_canopyLightAt` sagt, wo Bäume wachsen DÜRFEN, nicht wo sie stehen).
    _kronenStreuAt(x, z) {
        return this._bodenDeckeAt(x, z, "summe");
    }

    // Der EINE Leser der Kronen-Karte: die Stufe wie `_wegeFeldAt`, bilinear über R (die Laubstreu aus der Summe, gekappt wie
    // die Karte, `kanal` "summe"), G (die Asche, "asche") oder B (die Decke der Lava, "lava").
    _bodenDeckeAt(x, z, kanal) {
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
        // aus der Summe, gekappt wie die Karte (die `daten` ziehen erst beim gebündelten Upload nach), oder aus der Asche, der Lava
        const A = kr[kanal];
        if (!A) throw new Error("_bodenDeckeAt: die Kronen-Karte trägt keinen Kanal „" + kanal + "“");
        const at = kanal === "summe" ? (a, b) => Math.min(255, A[b * N + a]) / 255 : (a, b) => A[b * N + a] / 255;
        return (
            (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) +
            (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz
        );
    }

    // DIE DECKE EINER ZELLE (die Asche, die Lava): `flaeche` malt die Fläche ±½ Zelle um (cx, cz) in jede zentrierte Stufe und
    // nennt, was sich änderte (0 nichts, 1 nur das Leuchten, 2 die Decke); wo die Decke sich änderte, baut die Nah-Wiese darüber
    // neu. Rückgabe: ob sich ein Texel änderte.
    _deckeMalen(cx, cz, flaeche) {
        const wk = this.state.wegeKarte;
        if (!wk) return false;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x0, z0, x1, z1] = [(cx - 0.5) * cs, (cz - 0.5) * cs, (cx + 1.5) * cs, (cz + 1.5) * cs];
        let neu = 0;
        for (const stufe of wk.stufen) if (stufe.zentriert) neu = Math.max(neu, flaeche(stufe, x0, z0, x1, z1));
        // auf der Decke wächst nichts: die Nah-Wiese und die Nah-Streu (Blumen, Kiesel, Totholz) würfeln darüber neu
        if (neu >= 2) (this._nahRingNeuIn(x0, z0, x1, z1), this._nahStreuNeuIn(x0, z0, x1, z1));
        return neu > 0;
    }

    // Die Texel der Kronen-Karte EINER Stufe, deren Mitte in [x0, x1) × [z0, z1) liegt: `je(k, x, z)` schreibt das Texel k an
    // seiner Mitte (x, z) und nennt, was sich änderte (0, 1, 2); das Größte kommt zurück, ein geändertes Rechteck geht hoch.
    _deckeTexel(stufe, x0, z0, x1, z1, je) {
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const x0w = stufe.mitteX - stufe.S.fensterM / 2;
        const z0w = stufe.mitteZ - stufe.S.fensterM / 2;
        const i0 = Math.max(0, Math.ceil((x0 - x0w) / t - 0.5));
        const i1 = Math.min(N - 1, Math.ceil((x1 - x0w) / t - 0.5) - 1);
        const j0 = Math.max(0, Math.ceil((z0 - z0w) / t - 0.5));
        const j1 = Math.min(N - 1, Math.ceil((z1 - z0w) / t - 0.5) - 1);
        if (i1 < i0 || j1 < j0) return 0;
        let neu = 0;
        for (let j = j0; j <= j1; j++)
            for (let i = i0; i <= i1; i++) neu = Math.max(neu, je(j * N + i, x0w + (i + 0.5) * t, z0w + (j + 0.5) * t));
        if (neu > 0) AnazhRealm._kronenSchmutz(kr, i0, i1, j0, j1);
        return neu;
    }

    // Jede Tat der Liste im Fenster der Stufe malt die vier Flächen zwischen den Zell-Mitten um ihre Zelle (`flaeche`), jede
    // Fläche einmal; danach geht das ganze Abbild hoch.
    _deckeStufeMalen(stufe, taten, flaeche) {
        const kr = stufe.kronen;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const h = stufe.S.fensterM / 2 + cs;
        const gemalt = new Set();
        for (const a of taten) {
            if (Math.abs(a.x - stufe.mitteX) > h || Math.abs(a.z - stufe.mitteZ) > h) continue;
            const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
            for (let qj = cz - 1; qj <= cz; qj++)
                for (let qi = cx - 1; qi <= cx; qi++) {
                    if (gemalt.has(qi + "," + qj)) continue;
                    gemalt.add(qi + "," + qj);
                    const [x0, z0] = [(qi + 0.5) * cs, (qj + 0.5) * cs];
                    flaeche(stufe, x0, z0, x0 + cs, z0 + cs);
                }
        }
        kr.schmutz = [0, kr.N - 1, 0, kr.N - 1];
    }

    // === DIE LAVA IM BODEN (stoffe.K3-2): die Decke liegt im Bild, glühend und erstarrt ===
    // Bis hier trug die Lava nur das Licht über ihr (`_leuchtQuellen`) und die glut-Achse (`auraAt`): der Boden unter dem Guss
    // blieb Wiese, die Halme standen durch, glühend und erstarrt sahen gleich aus (Radeon fe885d9d, Station
    // karte2.same.kopplung.ereignis: Glut R/G 0,969, erstarrt 0,962). Jetzt liegt jede Decke in der Kronen-Karte (B die Decke,
    // A ihre Temperatur, `_wegeKarteEnsure`): der Boden-Stoff zeichnet dort die Kruste der Boden-Palette (`kruste`, Basaltglas)
    // und darauf das Leuchten ihrer Temperatur (`_lavaKruste`: Schollen und glühende Risse), Nah-Wiese und Nah-Streu tragen auf
    // ihr nichts (`_lavaDeckeAt`).
    // Ihr Rand ist das EINE Rand-Gesetz einer Tat auf den Zellen des Felds (`_brandNarbeFn`: die weiche, verrauschte Grenze statt
    // des 16-m-Quadrats), ihre Temperatur je Texel der Gang des Kerns an der Dicke der Decke dort (`_lavaFlaeche`).
    // Die Decke an (x, z) ∈ [0, 1] — dieselben Bytes, die der Boden-Shader liest (`_bodenDeckeAt`).
    _lavaDeckeAt(x, z) {
        return this._bodenDeckeAt(x, z, "lava");
    }

    // Die Spanne, in der die Lava sichtbar glüht (K): vom Draper-Punkt des Kerns (`LAVA.glueht`) bis zum Ausbruch, die Zeile stein
    // der Stoff-Tafel über ihrem Schmelzen um die Überhitzung des Kerns (`LAVA.ueberhitzung`) — dieselben Zahlen wie der Gang.
    _lavaSpanne() {
        const L = globalThis.__gelaendeCore.LAVA;
        const S = globalThis.__schmiedeCore && globalThis.__schmiedeCore.STOFF_GESETZ.zeile("stein");
        if (!S || !(S.tSchmelz > L.glueht))
            throw new Error("_lavaSpanne: die Zeile stein der Stoff-Tafel trägt kein Schmelzen");
        return [L.glueht, S.tSchmelz + L.ueberhitzung];
    }

    // Die Temperatur der Lava-Tat `a` in ihrer Spanne (`_lavaSpanne`) ∈ [0, 1]: 0 am Draper-Punkt und darunter (sie glüht nicht
    // mehr), 1 beim Ausbruch — im Innern der Decke das Byte A der Kronen-Karte; ändert es sich, malt der Takt neu (`_lavaTakt`).
    _lavaWaerme(a) {
        const [td, t0] = this._lavaSpanne();
        const T = this._lavaZustand(a).temperatur + 273.15;
        return Math.min(1, Math.max(0, (T - td) / (t0 - td)));
    }

    // DAS LEUCHTEN DER LAVA (TSL, Leser `_lavaKruste`) aus der Temperatur `w` ihrer Oberfläche in der Spanne: beim Ausbruch t0
    // leuchtet sie im Leucht-Gesetz der Glut (fachwerk `LEUCHT_FEUER`: Leuchtdichte = lineare Farbe × Stärke, das Glutbett des
    // Herdfeuers) in der Farbe ihrer Temperatur (fachwerk `lichtFarbe`, der Planck-Ort); kühler fällt jeder Kanal mit dem
    // Planck-Gesetz an seiner Wellenlänge (`GLUT_BILD`, die Wien-Näherung: e^(c₂/λ · (1/t0 − 1/T)), c₂/(λ·T) ≥ 14 in der ganzen
    // Spanne) — Grün und Blau schneller als Rot: die Lava glüht orange aus, kirschrot, dunkel am Draper-Punkt (dort trägt der rote
    // Kanal 10⁻⁷ des Ausbruchs). Der Planck-Ort des Kerns reicht ab 1 667 K, der Ausbruch liegt darunter (1 650 K): seine Farbe ist
    // die des Orts an seinem Rand (1, 0,176, 0), ein Kanal ohne Farbe ist 0 (kein Glied im Programm). Bis hier trug der Boden
    // unter der Lava kein Leuchten. `kalt` = 1/t0 − 1/T (1/K) der Oberfläche, T in der Spanne (`_lavaKruste` rechnet ihn).
    _lavaGlutNode(_T, kalt) {
        const FW = globalThis.__fachwerkCore;
        if (!FW || typeof FW.glutLeuchtdichte !== "function" || typeof FW.lichtFarbe !== "function")
            throw new Error("_lavaGlutNode: fachwerk trägt das Leucht-Gesetz der Glut oder den Planck-Ort nicht");
        const t0 = this._lavaSpanne()[1];
        const G = AnazhRealm.GLUT_BILD;
        const farbe = FW.lichtFarbe(t0);
        const k7 = AnazhRealm._f32; // die kürzeste Zahl desselben f32 (`_f32`)
        // die Leuchtdichte des Ausbruchs: der schwarze Körper bei t0 (fachwerk `glutLeuchtdichte`, cd/m²) in der EINEN Skala,
        // auf die Farbe des Orts verteilt (ihre Luma trägt sie) — bis licht-eine-skala die Zahl des Labors `LEUCHT_FEUER`
        const luma = 0.2126 * farbe[0] + 0.7152 * farbe[1] + 0.0722 * farbe[2];
        const hell = FW.glutLeuchtdichte(t0) / __weltLicht.EINHEIT_LX / luma;
        const kanal = (k) =>
            farbe[k] > 0 ? _T.exp(kalt.mul(k7(G.c2 / (G.lambdaNm[k] * 1e-9)))).mul(k7(farbe[k] * hell)) : _T.float(0);
        return _T.vec3(kanal(0), kanal(1), kanal(2));
    }

    // Die Zelle (cx, cz) → { asche: ihre Rest-Wärme q = e^(−t/τ) (der Gang des Kerns, `_lavaZustand`), busch: die Luft T_u (K),
    // wald: 0 } (die Form, die `_brandNarbeFn` mittelt) ihrer jüngsten Lava oder null; der Speicher für EINEN Gang.
    _lavaJeZelle() {
        const M = new Map();
        return (cx, cz) => {
            const k = cx + "," + cz;
            let c = M.get(k);
            if (c === undefined) {
                const a = this._lavaJuengste(k);
                let z = null;
                if (a) {
                    const L = this._lavaZustand(a);
                    z = {
                        asche: Math.exp(-Math.max(0, L.alterS) / L.tau),
                        busch: this._temperaturAt(a.y, 0) + 273.15,
                        wald: 0,
                    };
                }
                M.set(k, (c = z));
            }
            return c;
        };
    }

    // Die Fläche [x0, x1) × [z0, z1) in EINE Stufe: B die Decke (der Rand `m` der Narbe), A ihre Temperatur in der Spanne
    // (`_lavaSpanne`). DIE DECKE KÜHLT VOM RAND HER: `m` ist ihre Dicke (1 im Innern, zum Rand dünn) und der Gang des Kerns hat
    // τ = ρ·c·d / α — die dünne Decke kühlt im Verhältnis ihrer Dicke schneller, ihre Rest-Wärme ist q^(1/m) (q die der Zelle).
    // Rückgabe: 2, wenn sich eine Decke änderte, 1 nur ein Leuchten, sonst 0.
    _lavaFlaeche(stufe, x0, z0, x1, z1, zelle) {
        const [B, A, rand] = [stufe.kronen.lava, stufe.kronen.glut, this._brandNarbeFn(zelle)];
        const [td, t0] = this._lavaSpanne();
        return this._deckeTexel(stufe, x0, z0, x1, z1, (k, x, z) => {
            const n = rand(x, z);
            const d = n ? Math.round(n.m * 255) : 0;
            const T = d > 0 ? n.busch + (t0 - n.busch) * n.asche ** (255 / d) : 0;
            const g = d > 0 ? Math.round(Math.min(1, Math.max(0, (T - td) / (t0 - td))) * 255) : 0;
            const aus = d !== B[k] ? 2 : g !== A[k] ? 1 : 0;
            [B[k], A[k]] = [d, g];
            return aus;
        });
    }

    // Die Lava EINER zentrierten Stufe ganz neu (nach ihrem Umzug, einer geladenen Welt).
    _lavaStufeMalen(stufe) {
        stufe.kronen.lava.fill(0);
        stufe.kronen.glut.fill(0);
        const zelle = this._lavaJeZelle();
        this._deckeStufeMalen(stufe, this._tatIndex().lava, (s, x0, z0, x1, z1) =>
            this._lavaFlaeche(s, x0, z0, x1, z1, zelle)
        );
    }

    // DIE LAVA ZÜNDET (w28-lava-zuendet, aus `_lavaTakt`): solange ihre Decke heißer ist als die Zünd-Temperatur des Betts
    // daneben (die Zeile seines Stoffs, `tZuend` — dieselbe Zahl, aus der die Front ihre Zünd-Wärme rechnet), fängt jede der acht
    // Zellen um sie am nächsten Punkt ihres Rands zur Decke (`_brandEntfachen`: der Herd am Ort der Hitze, die Front läuft von
    // dort). Sie fragt wieder, wenn sich ändert, was ein Bett trägt oder erstickt: eine Tat heilt (`_tatGen`), die Nässe der
    // Welt wandert (in Zwanzigsteln) — in Ruhe kostet die heiße Decke einen Vergleich. Bis hier stand das Gras grün am Rand
    // der 1 377 °C heißen Decke. Rückgabe: wie viele Zellen fingen.
    _lavaZuendet(a) {
        const stand = (this._tatGen || 0) + "|" + Math.round((this.state.naesse || 0) * 20);
        const G = this._lavaGefragt || (this._lavaGefragt = new WeakMap());
        if (G.get(a) === stand) return 0;
        G.set(a, stand);
        const tK = this._lavaZustand(a).temperatur + 273.15;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
        let n = 0;
        for (let dz = -1; dz <= 1; dz++)
            for (let dx = -1; dx <= 1; dx++) {
                const f = this._brandStoff(cx + dx, cz + dz);
                if (!f || !(tK > f.zeile.tZuend)) continue;
                if (!dx && !dz) continue; // ihre eigene Zelle ist Decke, kein Bett
                // der nächste Punkt der Nachbarin zur Mitte der Decke, einen Hauch in ihr; teilt sie eine Kante mit der Decke, zündet
                // der RAND der Decke auf seiner Länge (`ein`, je Achtel der Zelle ein Eintritt, `_brandWeg`): jeder dort, wo die
                // Decke nach außen endet (`_lavaDeckeAt` 0 — ab dort steht der Halm, `_wieseGrund`), im Viertelmeter gesucht
                const ex = (cx + (dx > 0 ? 1 : dx < 0 ? 0 : 0.5)) * cs + dx * 0.01;
                const ez = (cz + (dz > 0 ? 1 : dz < 0 ? 0 : 0.5)) * cs + dz * 0.01;
                const ein = [];
                if (!dx !== !dz)
                    for (let i = -4; i <= 4; i++) {
                        const [qx, qz] = [ex + (dx ? 0 : (i * cs) / 8.02), ez + (dz ? 0 : (i * cs) / 8.02)];
                        let d = -cs / 8;
                        while (d < cs / 4 && this._lavaDeckeAt(qx + dx * d, qz + dz * d) > 0) d += 0.25;
                        ein.push(qx + dx * d, qz + dz * d);
                    }
                // ein Akt DIESER Seite (jede Seite trägt die Tat der Lava und zündet aus ihr), zur Uhr des Felds
                const akt = { art: "brand", w: this.state.spielZeit, x: ex, z: ez, ein: ein.length ? ein : null };
                if (this._feldAkt(akt, false)) n++;
            }
        return n;
    }

    // DER TAKT DER LAVA (aus `_tickWegeKarte`, höchstens je `LAUB_STREU.uploadMs`): die Temperatur jeder Decke ist eine Funktion
    // der Welt-Zeit (`_lavaZustand`) — ändert sich ihr Byte (sie kühlt, ein Sprung der Uhr, ein neuer Guss), malt ihre Zelle neu; eine
    // andere Liste der Taten (eine geladene Welt) leert die Decken und malt jede Lava neu. Ohne Lava kostet er einen Vergleich.
    _lavaTakt(jetzt) {
        if (jetzt - (this._lavaTaktT || -Infinity) < AnazhRealm.LAUB_STREU.uploadMs) return;
        this._lavaTaktT = jetzt;
        const wk = this.state.wegeKarte;
        const L = this.state.worldMeta && this.state.worldMeta.taten;
        if (L !== this._lavaListe) {
            // eine andere Welt: ihre Laven fallen, jede Decke der neuen malt ihre Zelle (und die Nah-Wiese darüber) neu
            this._lavaListe = L;
            this._lavaGemalt = new WeakMap();
            for (const stufe of wk ? wk.stufen : []) {
                const kr = stufe.kronen;
                kr.lava.fill(0);
                kr.glut.fill(0);
                kr.schmutz = [0, kr.N - 1, 0, kr.N - 1];
            }
        }
        const gemalt = this._lavaGemalt;
        const I = this._tatIndex();
        if (!I.lava.length) return;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [neu, zelle] = [new Set(), this._lavaJeZelle()];
        for (const a of I.lava) {
            const g = Math.round(this._lavaWaerme(a) * 255);
            if (gemalt.get(a) === g) continue;
            gemalt.set(a, g);
            const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
            if (neu.has(cx + "," + cz)) continue;
            neu.add(cx + "," + cz);
            this._deckeMalen(cx, cz, (s, x0, z0, x1, z1) => this._lavaFlaeche(s, x0, z0, x1, z1, zelle));
        }
        // der Rand der heißen Decke zündet das Bett daneben — NACH dem Malen: er sucht sein Ende in den Bytes der Decke
        // (`_lavaZuendet`; davor lagen sie leer, die Eintritte standen 2 m in der Zelle der Lava: gate:stand-takt L2-DECKE)
        for (const a of I.lava) this._lavaZuendet(a);
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

    // Die Lage EINES Punkts zum Bord der Fahrbahn `f` (0 … 1, LINEAR über ±rand um ihren Rand: 0 ab +rand außen, ½ am Bord,
    // 1 ab −rand innen). Leser: der Maler (`_wegeKarteMale`) und die Linse des Weg-Körpers — DIESELBE Zahl.
    static _wegeFahrLage(f, px, pz, rand) {
        const q = (rand - AnazhRealm._wegeFormAbstand(f, px, pz)) / (2 * rand);
        return q <= 0 ? 0 : q >= 1 ? 1 : q;
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
        // DIE FAHRBAHN IST DIE ZWEITE HÖHE DES PFLASTERS (w28-weg-koerper, fachwerk WEG_GESETZ, `fahr` an der Form der Fahrstraße):
        // das Pflaster trägt bis `gehAnteil` seine Deckung (wie bisher das Gewicht der Form: der Gehweg, der Platz), darüber die
        // Lage zum Bord — LINEAR über ±`fahrRandM` um den Rand der Fahrbahn (`_wegeFahrLage`: am Bord ½, in der Fahrbahn 1). Die
        // bilineare Probe einer linearen Rampe trägt die gerade Bordlinie genau, der Boden-Stoff liest aus ihr den Abstand zum
        // Bord in Metern (`_wegBord`). Je Texel das Maximum (wie jede Art): die Mischung kennt weiter keine Reihenfolge.
        const WK = AnazhRealm.WEGE_KARTE;
        const fahr = f.fahr ? f : null;
        const fahrRand = fahr ? Math.max(WK.fahrRandM, S.randMinM) : 0;
        if (f.saum) f = f._mal || (f._mal = { ...f, halb: f.halb + f.saum, saum: 0 });
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const ausdehnung = AnazhRealm._wegeFormRadius(f) + Math.max(rand, fahrRand - (fahr ? fahr.saum || 0 : 0));
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
        const { voll, null: nul } = WK;
        const wert = f.wert || 1;
        const stein = f.kanal === WK.belag.pflaster.kanal && wert === WK.belag.pflaster.wert;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t;
                const q = AnazhRealm._wegeFormGewicht(f, px, pz, rand);
                if (!(q > 0)) continue;
                const k = (j * N + i) * 2 + f.kanal;
                let m = q;
                if (stein) {
                    m *= WK.gehAnteil;
                    if (fahr) m += AnazhRealm._wegeFahrLage(fahr, px, pz, fahrRand) * (1 - WK.gehAnteil);
                }
                const v = Math.round(m * voll) * wert;
                const alt = daten[k] - nul;
                if (wert > 0 ? v > alt : alt <= 0 && v < alt) daten[k] = v + nul;
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
        const tag = Math.floor(this._weltTag());
        if (this._trittTag !== tag) {
            this._trittTag = tag;
            this._trittErholen();
        }
        this._lavaTakt(jetzt); // die Glut der Lava im Boden folgt der Welt-Zeit (`_lavaTakt`)
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
                // ein Grund fiel oder ein Ort plante neu (S4): die Stufe malt ihre Flächen neu (die Flüsse tragen eigene Bytes)
                this._wegeStufeMalen(stufe);
            }
            // ein Haus legte seinen Grund (`_erdbauWirkt`, erdbauDazu): nur seine Boxen malen — auch nach einem Umzug, dessen
            // Streifen den Rest des Fensters nicht berührten (w28-stadt-netz)
            if (stufe.grundDazu) this._wegeStufeMalen(stufe, null, stufe.grundDazu);
            stufe.grundNeu = false;
            stufe.grundDazu = null;
            // ein neuer Tritt (`_tritt`) geht gebündelt hoch, höchstens ein Upload je `TRITT.uploadMs`
            if (stufe.trittHoch && !(jetzt - (stufe.trittUpload || -Infinity) < AnazhRealm.TRITT.uploadMs)) {
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
                [stufe.trittHoch, stufe.trittUpload] = [false, jetzt];
            }
            if (stufe.fluss.hydroN !== hydroN) this._flussKarteMalen(stufe, hydroN);
            // Neu gemalte Kronen, Aschen und Laven gehen gebündelt hoch (höchstens ein Upload je Stufe und `uploadMs`): das Abbild
            // zieht nur im Schmutz-Rechteck aus der Summe (R, gekappt bei 255), der Asche (G) und der Lava (B Decke, A Glut) nach.
            const kr = stufe.kronen;
            if (kr.schmutz && jetzt - kr.upload >= AnazhRealm.LAUB_STREU.uploadMs) {
                const [i0, i1, j0, j1] = kr.schmutz;
                const N = kr.N;
                for (let j = j0; j <= j1; j++)
                    for (let k = j * N + i0, e = j * N + i1; k <= e; k++) {
                        const v = kr.summe[k];
                        kr.daten[4 * k] = v > 255 ? 255 : v;
                        kr.daten[4 * k + 1] = kr.asche[k];
                        kr.daten[4 * k + 2] = kr.lava[k];
                        kr.daten[4 * k + 3] = kr.glut[k];
                    }
                this._wegeSchichtHoch(kr.tex, stufe.schicht);
                kr.schmutz = null;
                kr.upload = jetzt;
            }
        }
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
    _wegeStufeMalen(stufe, war, nurGruende, kasten) {
        const S = stufe.S;
        const N = stufe.N;
        const nul = AnazhRealm.WEGE_KARTE.null;
        const warLeer = stufe.wegeLeer === true;
        const t = S.texelM;
        // die Boxen der Gründe `gruende` (Normalform des Erdbaus), deren Boden der Grund ist, DECKEND in die Streifen `c`
        const gruendeMalen = (gruende, c, weit, welt) => {
            for (const g of gruende) {
                if (Math.abs(g.cx - stufe.mitteX) > weit + 64 || Math.abs(g.cz - stufe.mitteZ) > weit + 64) continue;
                // nur Streifen: ein Grund, der keinen trifft (seine Boxen liegen binnen 48 m um ihn), malt nichts
                if (
                    welt &&
                    !welt.some((w) => g.cx + 48 > w[0] && g.cx - 48 < w[1] && g.cz + 48 > w[2] && g.cz - 48 < w[3])
                )
                    continue;
                for (const b of g.boxen) {
                    if (b[4]) continue;
                    const lx = (b[0] + b[1]) / 2;
                    const lz = (b[2] + b[3]) / 2;
                    const ax = g.cx + lx * g.c + lz * g.s;
                    const az = g.cz - lx * g.s + lz * g.c;
                    const phi = Math.atan2(g.s, g.c);
                    const [ex, ez] = [(b[1] - b[0]) / 2, (b[3] - b[2]) / 2];
                    const form = { typ: "kasten", kanal: 0, ax, az, bx: ax, bz: az, ex, ez, phi, halb: 0, deckt: true };
                    for (const q of c) this._wegeKarteMale(stufe, form, q);
                }
            }
        };
        // NUR DIE GELEGTEN GRÜNDE (`nurGruende`, w28-stadt-netz): das Bild bleibt, ihre Boxen kommen dazu (das Maximum je Texel
        // kennt keine Reihenfolge) — die Kosten binden an den neuen Grund, nie an das Fenster
        if (nurGruende) {
            gruendeMalen(nurGruende, [[1, N - 2, 1, N - 2]], S.fensterM / 2 + S.randMinM + AnazhRealm.WEGE_KARTE.randM);
            if (!warLeer || !stufe.wegeLeer) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
            return;
        }
        let streifen = war
            ? AnazhRealm._karteSchieben(stufe.daten, N, 2, Math.round((stufe.mitteX - war[0]) / t), Math.round((stufe.mitteZ - war[1]) / t), 1, N - 2, nul) // prettier-ignore
            : null;
        // NUR EIN KASTEN (`kasten` {x0, z0, x1, z1} in der Welt, w28-stadt-netz): eine Fläche fiel aus der Karte — die Texel ihres
        // Kastens (samt dem weichen Rand und einem Texel) werden leer, und jede Form, die ihn trifft, malt in ihm neu: dieselben
        // Bytes wie ein Neu-Malen (jeder Texel trägt das Maximum seiner Formen), die Kosten binden an den Kasten
        if (kasten && !streifen) {
            const r = AnazhRealm.WEGE_KARTE.randM + S.randMinM + t;
            const [x0w, z0w] = [stufe.mitteX - S.fensterM / 2, stufe.mitteZ - S.fensterM / 2];
            const i0 = Math.max(1, Math.floor((kasten.x0 - r - x0w) / t));
            const i1 = Math.min(N - 2, Math.ceil((kasten.x1 + r - x0w) / t));
            const j0 = Math.max(1, Math.floor((kasten.z0 - r - z0w) / t));
            const j1 = Math.min(N - 2, Math.ceil((kasten.z1 + r - z0w) / t));
            if (i1 < i0 || j1 < j0) return;
            for (let j = j0; j <= j1; j++) stufe.daten.fill(nul, (j * N + i0) * 2, (j * N + i1 + 1) * 2);
            streifen = [[i0, i1, j0, j1]];
            war = [stufe.mitteX, stufe.mitteZ]; // das Fenster steht: der Tritt malt in den Streifen
        }
        if (!streifen) {
            stufe.daten.fill(nul);
            stufe.wegeLeer = true;
            streifen = [[1, N - 2, 1, N - 2]];
        }
        const h = S.fensterM / 2 + S.randMinM + AnazhRealm.WEGE_KARTE.randM;
        // DER STREIFEN FRAGT NUR SEINE FORMEN (w28-stadt-netz, Gebot 7): malt die Stufe nur Streifen (der Umzug, ein Kasten), holt
        // jede Siedlung die Formen aus den Zellen ihres Rasters (`_wegeFormenIm`: 32 m, je Form die Hülle samt 8 m Reichweite — der
        // weiche Rand, der Saum und der gewachsene Kasten einer deckenden Form liegen darunter), die ein Streifen trifft — eine
        // Form, die keinen Streifen trifft, malt nichts, das Bild ist dasselbe. Bis hier fragte jeder Umzug (alle 48 m) jede Form
        // jeder Siedlung im Fenster: in der Stadt der Kacheln rund 20 000 Formen, 203–209 ms in einem Bild (GTX, 15.11.).
        const [x0w, z0w] = [stufe.mitteX - S.fensterM / 2, stufe.mitteZ - S.fensterM / 2];
        const ganz = streifen.some((c) => c[0] <= 1 && c[1] >= N - 2 && c[2] <= 1 && c[3] >= N - 2);
        const welt = ganz
            ? null
            : streifen.map((c) => [x0w + c[0] * t, x0w + (c[1] + 1) * t, z0w + c[2] * t, z0w + (c[3] + 1) * t]);
        for (const sd of this.state.wegeKarte.siedlungen) {
            if (sd.x1 < stufe.mitteX - h || sd.x0 > stufe.mitteX + h) continue;
            if (sd.z1 < stufe.mitteZ - h || sd.z0 > stufe.mitteZ + h) continue;
            if (!welt) {
                for (const f of sd.formen) for (const c of streifen) this._wegeKarteMale(stufe, f, c);
                continue;
            }
            for (let q = 0; q < streifen.length; q++)
                for (const f of this._wegeFormenIm(sd, welt[q][0], welt[q][1], welt[q][2], welt[q][3]))
                    this._wegeKarteMale(stufe, f, streifen[q]);
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
        if (E && E.gruende) gruendeMalen(E.gruende, streifen, h, welt);
        if (!warLeer || !stufe.wegeLeer) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
    }

    // DIE FORMEN EINER SIEDLUNG AM ORT (w28-stadt-netz, Gebot 7): die Formen von `sd`, deren Hülle samt 8 m Reichweite (der weiche
    // Rand, der Saum, der gewachsene Kasten einer deckenden Form, der Rand der Natur-Wand) den Kasten x0…x1 · z0…z1 (m) erreichen
    // kann, in der Reihe ihres Baus — aus dem Raster der Siedlung (32 m; ihre Formen kommen nur hinzu, `_stlWegeRaten`: das Raster
    // wächst mit ihnen). Unter 64 Formen, ohne endlichen Kasten und über 1 km² alle. Leser: der Streifen der Wege-Karte
    // (`_wegeStufeMalen`) und die Räumung am Ort (`_grundrissWegeIn`) — bis hier fragte jede Räumung jede Form ihrer Siedlung:
    // die Kachel einer Stadt trägt rund 2 000, jedes Haus des Zugs räumte sechsmal (GTX, Gang durch drei Kacheln: 3 760 Räumungen
    // zu 0,58 ms — 3,5 von 5,7 ms je Haus).
    _wegeFormenIm(sd, x0, x1, z0, z1) {
        if (sd.formen.length < 64 || !((x1 - x0) * (z1 - z0) < 1e6)) return sd.formen;
        const Z = 32;
        if (!sd.netz) [sd.netz, sd.netzN] = [new Map(), 0];
        for (; sd.netzN < sd.formen.length; sd.netzN++) {
            const f = sd.formen[sd.netzN];
            f._nr = sd.netzN;
            const r = AnazhRealm._wegeFormRadius(f) + (f.saum || 0) + 8;
            for (
                let a = Math.floor((Math.min(f.ax, f.bx) - r) / Z);
                a <= Math.floor((Math.max(f.ax, f.bx) + r) / Z);
                a++
            )
                for (
                    let b = Math.floor((Math.min(f.az, f.bz) - r) / Z);
                    b <= Math.floor((Math.max(f.az, f.bz) + r) / Z);
                    b++
                ) {
                    const l = sd.netz.get(a * 2097152 + b);
                    if (l) l.push(f);
                    else sd.netz.set(a * 2097152 + b, [f]);
                }
        }
        const marke = (this._wegeMarke = (this._wegeMarke || 0) + 1); // Instanz-Feld (die _editSaveTimer-Klasse)
        const aus = [];
        for (let a = Math.floor(x0 / Z); a <= Math.floor(x1 / Z); a++)
            for (let b = Math.floor(z0 / Z); b <= Math.floor(z1 / Z); b++)
                for (const f of sd.netz.get(a * 2097152 + b) || AnazhRealm.STAND_LEER)
                    if (f._marke !== marke) {
                        f._marke = marke;
                        aus.push(f);
                    }
        return aus.sort((p, q) => p._nr - q._nr);
    }

    // Der getretene Grund an (x, z) ∈ [0, 1]: die getretene Erde und das Pflaster (`_wegeBelagAt`) — dort wächst kein Halm und
    // keine Streu.
    _wegeFeldAt(x, z) {
        return this._wegeBelagAt(x, z, null);
    }

    // DER BELAG an (x, z) — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest: die NAH-Stufe innerhalb ihrer Grenze
    // (`_wegeStufeNah`), sonst die FERN-Stufe; je Kanal das Vorzeichen gefiltert, dann geteilt wie im Shader (`_wegeBodenFarbe`,
    // `WEGE_KARTE.belag`). `aus` (optional) trägt erde · rasen · acker · pflaster · fahr (0 … 1). → der getretene Grund (Erde + Pflaster,
    // höchstens 1). Leser: das Pfad-Feld der Wiese und der Streu (`_wegeFeldAt`) und der gezeichnete Boden (`_bodenSichtAt`: der
    // Rasen grünt, das Pflaster deckt).
    _wegeBelagAt(x, z, aus) {
        if (aus) aus.erde = aus.rasen = aus.acker = aus.pflaster = 0;
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
        // das Pflaster trägt zwei Höhen (`_wegeKarteMale`): bis `gehAnteil` seine Deckung, darüber die Lage zum Bord der Fahrbahn
        const G = AnazhRealm.WEGE_KARTE.gehAnteil;
        const stein = gk < 0 ? -gk : 0;
        const pflaster = stein < G ? stein / G : 1;
        if (aus) {
            aus.erde = erde;
            aus.rasen = r < 0 ? -r : 0;
            aus.acker = gk > 0 ? gk : 0;
            aus.pflaster = pflaster;
            aus.fahr = stein > G ? (stein - G) / (1 - G) : 0;
        }
        // DAS PFLASTER HAT EINE KANTE (w28-weg-koerper): der Boden zeichnet es ab der halben Deckung ganz (`_wegeBodenFarbe`, die
        // Reihe seiner Randsteine) — ab dort steht kein Halm. Bis hier lichtete die Wiese über den weichen Rand (±randM) nur
        // anteilig: auf den äußeren 0,6 m jedes Pflasters standen Halme im Stein.
        return Math.min(1, erde + 2 * pflaster);
    }

    // Die Boden-Farbe unter Kronen und Wegen (TSL): die Vertex-Farbe mischt zum Rasen (R −), zur Laubstreu der Kronen-Karte,
    // zur getretenen Erde (R +), zum Acker (G +) und zuletzt zum Kopfstein (G −) der Wege-Karte (`WEGE_KARTE.belag`), in den
    // Farben der Boden-Palette (dieselbe Pfad-Erde wie der gebackene Ufer-Pfad), dem Mittel des Halms (`WIESEN_GRUND`) und
    // dem Stein-Gesetz (`_kopfsteinFarbe`), nur auf Begehbarem — ein Hang unter dem Weg bleibt Hang. Die Stufe wählt dieselbe Grenze wie `_wegeFeldAt`. Ohne die
    // Karte bricht der Boden-Stoff laut (der Chunk-Boden liest sie immer, kein stiller Boden ohne Weg). `aus.stein`: der Belag
    // aus Stein für den Boden-Stoff (unten).
    _wegeBodenFarbe(_T, vc, aus) {
        const wk = this._wegeKarteEnsure();
        if (!wk || !wk.stufen[0].U || !_T.texture || !_T.positionWorld || !_T.normalWorldGeometry)
            throw new Error("Wege-Karte: der Boden-Stoff braucht Karte, Uniforms und TSL (texture/positionWorld)");
        const P = AnazhRealm.BODEN_FARBE;
        // die Farben der Palette als Konstanten mit 7 Stellen (die Genauigkeit von f32): jedes Zeichen des Boden-Programms zählt
        const farbe = (c) => _T.vec3(AnazhRealm._f32(c[0]), AnazhRealm._f32(c[1]), AnazhRealm._f32(c[2]));
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
        // DER BELAG (rg8 um `null`, je Kanal mit Vorzeichen gefiltert, dann geteilt — `_wegeBelagAt` rechnet dieselbe Teilung)
        const _erde = _wm.r.max(0.0).mul(_begehbar);
        const _rasen = _wm.r.negate().max(0.0).mul(_begehbar);
        const _acker = _wm.g.max(0.0).mul(_begehbar);
        // DAS PFLASTER TRÄGT ZWEI HÖHEN (w28-weg-koerper, `_wegeKarteMale`): bis `gehAnteil` seine Deckung `_pq`, darüber die Lage
        // zum Bord der Fahrbahn (`_wegBord`). SEINE KANTE: es deckt ab der halben Deckung ganz (die Linie der Form selbst, über
        // einen Pixel weich, nie schärfer als `kantWeich` der Deckung — zwei Formen, die sich nur berühren, tragen an ihrer Naht
        // je ½) — bis hier lief jedes Pflaster über ±randM in Erde und Wiese aus, ein Anstrich ohne Rand.
        const _stein = _wm.g.negate().max(0.0);
        const _pq = _stein.div(WK.gehAnteil).min(1.0);
        const _pa = _T.fwidth(_pq).max(WK.kantWeich);
        const _pk = _pq.sub(0.5).div(_pa).add(0.5).clamp(0.0, 1.0);
        const _pflaster = _pk.mul(_begehbar);
        // DER RASEN (das Gras-Gesetz): wo der Plan Rasen erklärt, ist der Grund das Mittel des Halms (`WIESEN_GRUND`) — die
        // Geologie legt das Relief der Halme darauf (Grün × Flachheit), die Nah-Wiese ihre Büschel (`_bodenSichtAt`: er grünt)
        const _wg = AnazhRealm.WIESEN_GRUND.farbe;
        const mitRasen = _T.mix(vc, farbe(_wg), _rasen);
        // DIE KRONEN-STREU (`_kronenStreuNeu`): unter den echten Kronen die Laubstreu der Palette (`lit`) — zuerst, die
        // Wege liegen darüber. Dieselbe Stufen-Wahl, dasselbe UV (dasselbe Fenster). Derselbe Abgriff trägt in G die Asche.
        const dNah = _T.texture(nah.kronen.tex, relNah.add(0.5)).depth(_T.int(nah.schicht));
        const dFern = _T.texture(fern.kronen.tex, relFern.add(0.5)).depth(_T.int(fern.schicht));
        const kNah = dNah.r;
        const kFern = dFern.r;
        // Der Rand ist keine Scheibe: das Laub liegt in Zungen und Flecken (Rauschen λ ≈ 1,4 m verschiebt die Kante).
        const _laubFeld = this._rauschAtlas().raum(_T.vec3(xz.x.mul(0.7), xz.y.mul(0.7), _T.float(3.3)));
        const _laubRausch = _laubFeld.mul(0.3);
        const _k = _T
            .smoothstep(_T.float(0.15), _T.float(0.85), _T.mix(kFern, kNah, innen).add(_laubRausch))
            .mul(_begehbar)
            .mul(imFenster)
            .mul(_T.float(1).sub(this._fernKroneOhneWald(_T)));
        const l = P.lit;
        // Unter der Krone liegt die Streu — ihre Albedo, nie ein Schatten: das Labor dunkelt seinen Bestandeskern
        // (`c.multiplyScalar(0.58 + 0.46 · Licht)` in worlds/terrain), die Welt hat die echte Schattenkarte der Kronen
        // (Lehre 21: nie doppelt; bis 06.10. lag die Streu so bei Y 0,065 unter dem Soll 0,08–0,15).
        const mitStreu = _T.mix(mitRasen, farbe(l), _k);
        // DIE ASCHE DES BRANDS (stoffe.K2#2, `_ascheMalen`): wo die Front ein Bett verzehrte, liegt die Asche der Palette über
        // Wiese und Streu, bis sie nachgrünt (`_sukzession`) — nur auf Begehbarem (die Wand des Hangs trug kein Bett). Dieselben
        // Bytes liest die Nah-Wiese (`_ascheAt`): auf der Asche steht kein Halm.
        const s = P.asche;
        const _a = _T.mix(dFern.g, dNah.g, innen).mul(_begehbar).mul(imFenster);
        const mitAsche = _T.mix(mitStreu, farbe(s), _a);
        const e = P.dirt;
        const a = AnazhRealm._ackerErde(); // der Acker ist frisch gewendete Erde (acker-kette 2), nie die nasse Wiese
        const mitErde = _T.mix(mitAsche, farbe(e), _erde);
        const mitAcker = _T.mix(mitErde, farbe(a), _acker);
        // DAS PFLASTER deckt jeden Grund (porta STEIN_GESETZ.kopfstein). DER STEIN IST KEIN ERDREICH (w28-stein-kamm): der Boden-Stoff
        // legt danach sein Korn, seine Kavität und sein Mikro-Relief über jede Farbe — `aus.stein` nennt ihm den Belag (Albedo,
        // Deckung, die Kante als Kipp der Normale, das Korn seiner Zeile), er hält unter ihm den Stein (`_buildPbrNodeMaterial`)
        const stein = {};
        // DER KÖRPER DES WEGS (fachwerk WEG_GESETZ, `_wegBord`): der Ton je Teil des Querschnitts, wo Bord, Flanke und Kante glatt
        // gesägt sind statt Kleinpflaster (`glatt`: der blanke Stein des Farb-Gesetzes, ohne die Kante der Köpfe), und der Kipp der
        // Flanke des Bords
        const bord = this._wegBord(
            _T,
            _stein
                .sub(WK.gehAnteil)
                .div(1 - WK.gehAnteil)
                .max(0.0),
            _T.mix(
                _T.float(Math.max(WK.fahrRandM, fern.S.randMinM)),
                _T.float(Math.max(WK.fahrRandM, nah.S.randMinM)),
                innen
            ),
            _pk.sub(
                _pq
                    .sub(0.5 + AnazhRealm._wegKantAnteil())
                    .div(_pa)
                    .add(0.5)
                    .clamp(0.0, 1.0)
            ),
            xz
        );
        const kopf = this._kopfsteinFarbe(_T, xz, stein);
        const blank = AnazhRealm._srgbHexLinear(
            AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein").stein]
        ).map(AnazhRealm._f32);
        const pflaster = _T.mix(kopf, _T.vec3(blank[0], blank[1], blank[2]), bord.glatt).mul(bord.ton);
        stein.kipp = stein.kipp ? stein.kipp.mul(_T.float(1).sub(bord.glatt)).add(bord.kipp) : bord.kipp;
        // DIE LAVA (stoffe.K3-2, `_lavaFlaeche`): ihre Decke (B) liegt über jedem Grund, auch über Weg und Pflaster — ihre Kruste
        // aus Basalt mit den Rissen, die ihre Temperatur (A) öffnet (`_lavaKruste`); der Boden-Stoff trägt die Kruste als Belag aus
        // Stein (`aus.stein`: das Stein-Gesetz unter ihr, die Kanten der Schollen kippen die Normale) und die Glut als sein
        // Leuchten (`aus.glut`). Nur auf Begehbarem (die Decke fließt vom Hang, sie haftet nicht an der Wand).
        const _lava = _T.mix(dFern.b, dNah.b, innen).mul(_begehbar).mul(imFenster);
        const kruste = this._lavaKruste(_T, _laubFeld, _T.mix(dFern.a, dNah.a, innen), _lava);
        if (aus) {
            // EIN Belag aus Stein: das Pflaster, wo keine Decke liegt, darüber die Kruste — Farbe und Kipp je Deckung gewichtet
            // (die Deckung pflaster · (1 − lava) + lava, der Anteil der Kruste an ihr `k`)
            const deckung = _T.mix(_pflaster, _T.float(1), _lava);
            const k = _lava.div(_T.max(deckung, 1e-3));
            aus.stein = {
                farbe: _T.mix(pflaster, kruste.farbe, k),
                deckung,
                kipp: stein.kipp ? _T.mix(stein.kipp, kruste.kipp, k) : kruste.kipp.mul(k),
                korn: stein.korn,
            };
            aus.glut = kruste.glut.mul(_lava);
            // DIE ASCHE IST KEIN NASSER FELS (w28-brand-bild): der Boden-Stoff legt danach Korn, Kavität und den Glanz der „nassen
            // kahlen Niederung" über jede dunkle, nicht grüne Farbe — `aus.asche` nennt ihm die Decke (Albedo, Deckung unter Weg,
            // Acker, Pflaster und der Decke der Lava), er hält auf ihr die Rauheit ihrer Zeile im Stoff-Gesetz und ihre Farbe
            // (`_terrainGeologyAlbedo`)
            aus.asche = {
                farbe: farbe(s),
                deckung: _a
                    .mul(_T.float(1).sub(_erde.add(_acker).add(_pflaster).clamp(0.0, 1.0)))
                    .mul(_T.float(1).sub(_lava)),
            };
        }
        return _T.mix(_T.mix(mitAcker, pflaster, _pflaster), kruste.farbe, _lava);
    }

    // Die halbe Breite der Kante des Pflasters als Anteil seiner Deckung: die Reihe der Randsteine (`WEG_GESETZ.kant.breitM`) liegt
    // innen an der Linie der Form; dort steigt das Gewicht der Form mit 1,5 ÷ (2 · randM) je Meter (`_wegeFormGewicht`).
    static _wegKantAnteil() {
        return (AnazhRealm.Gesetz("fachwerk:WEG_GESETZ").kant.breitM * 1.5) / (2 * AnazhRealm.WEGE_KARTE.randM);
    }

    // DER BORD DES WEGS (TSL, Leser `_wegeBodenFarbe`; fachwerk WEG_GESETZ — w28-weg-koerper): der Körper der Fahrstraße als
    // FUNKTION im Boden-Stoff, keine Geometrie und kein Befehl. `f` die Lage zum Bord aus der Wege-Karte (0 … 1, ½ am Bord,
    // linear über ±`R` Meter: d = (f − ½) · 2R ist der Abstand zum Bord, + in der Fahrbahn), `k` die Kante des Pflasters (0 … 1).
    // Die Richtung quer zum Bord `n` ist ∇d in der Welt (aus den Ableitungen am Schirm durch die der Welt-Lage, wie die Schollen
    // der Lava). Der Boden bleibt die Ebene der Fahrbahn; der Gehweg steht `hochM` darüber:
    //   DER SCHATTEN des Bords fällt auf die Fahrbahn, 0 < d < hochM · cot(Sonnenhöhe) · cos(Azimut zum Bord)
    //     (= hochM · (−n · s.xz) ÷ s.y, `s` die Richtung des aktiven Körpers, `uSunDir`) — mittags schmal, bei tiefer Sonne breit;
    //   DIE FLANKE des Bords steht vor dem Gehweg, −hochM · (n · v.xz) ÷ v.y < d < 0 (`v` zum Auge: was der Strahl des Auges von
    //     der Ebene der Fahrbahn hinter dem Bord nicht sieht, ist die Flanke) — im eigenen Ton, ihre Normale liegt waagrecht (`kipp`);
    //   DER BORDSTEIN hinter der Flanke (`breitM`), glatt, je `steinM` längs eine Stoßfuge; DIE RINNE vor dem Bord (`rinneM`);
    //   DIE FAHRBAHN im Ton `ton.fahr`; DIE KANTE des Pflasters (`k`) im Ton `ton.kant`.
    // Jede Linie ist über einen Pixel weich (`wegAn`), Schatten, Flanke und Bordstein tragen ihr Relief bis `fernM` (halb ab
    // ½ · fernM), dahinter bleibt der Ton der Fahrbahn — kein Flimmern. Beide Bänder halten ¾ der Rampe der Karte.
    // ZWEI WGSL-FUNKTIONEN (`wegAn`, `wegBord`, wie die Kruste der Lava): ihre Zwischenwerte leben in ihnen statt im
    // Boden-Programm (die Ratsche `S0_ZEICHEN`). Rückgabe { ton, glatt, kipp }.
    // OFFEN: der Schatten des Bords liest die Schattenkarte nicht — im Schlagschatten eines Hauses steht er weiter (Lehre 21).
    _wegBord(_T, f, R, k, xz) {
        const W = AnazhRealm.Gesetz("fachwerk:WEG_GESETZ");
        if (
            !W ||
            !W.bord ||
            !(W.bord.hochM > 0) ||
            !(W.bord.breitM > 0) ||
            !(W.bord.steinM > 0) ||
            !W.ton ||
            !(W.fernM > 0)
        )
            throw new Error("Weg-Körper: das Gesetz fachwerk:WEG_GESETZ trägt Bord, Ton oder Ferne nicht");
        const [B, T, k7] = [W.bord, W.ton, AnazhRealm._f32];
        const an =
            this._wegAnFn ||
            (this._wegAnFn = _T
                .Fn(([x, a]) => x.div(a).add(0.5).clamp(0.0, 1.0))
                .setLayout({
                    name: "wegAn",
                    type: "float",
                    inputs: [
                        { name: "x", type: "float" },
                        { name: "a", type: "float" },
                    ],
                }));
        const fn =
            this._wegBordFn ||
            (this._wegBordFn = _T
                .Fn(([f, R, k, xz, s, v]) => {
                    const d = f.sub(0.5).mul(R).mul(2);
                    const [px, py, sx, sy] = [_T.dFdx(xz), _T.dFdy(xz), _T.dFdx(d), _T.dFdy(d)];
                    const det = px.x.mul(py.y).sub(px.y.mul(py.x));
                    const g = _T
                        .vec2(sx.mul(py.y).sub(sy.mul(px.y)), sy.mul(px.x).sub(sx.mul(py.x)))
                        .mul(det.div(det.mul(det).max(1e-24)));
                    const n = g.div(g.length().max(1e-4));
                    const a = px.length().add(py.length()).max(1e-3); // die Spanne des Pixels am Boden (m)
                    const nah = _T
                        .float(1)
                        .sub(_T.smoothstep(_T.float(W.fernM / 2), _T.float(W.fernM), v.length()))
                        .mul(f.mul(40).min(1.0)); // jenseits der Rampe (f = 0: tief im Gehweg) steht kein Band
                    const lim = R.mul(0.75);
                    const ws = n.dot(s.xz).negate().max(0.0).mul(B.hochM).div(s.y.max(0.05)).min(lim);
                    const wf = n.dot(v.xz).max(0.0).mul(B.hochM).div(v.y.max(0.1)).min(lim);
                    const fb = an(d, a).mul(f.mul(40).min(1.0)); // ohne Rampe (f = 0: Gehweg, Platz, Gasse) keine Fahrbahn
                    const schatten = fb
                        .mul(an(ws.sub(d), a))
                        .mul(ws.div(a).min(1.0))
                        .mul(nah);
                    const rinne = fb.mul(an(d.negate().add(B.rinneM), a));
                    const o = d.add(wf); // der Abstand hinter der Flanke (− im Gehweg)
                    const flanke = an(d.negate(), a).mul(an(o, a)).mul(wf.div(a).min(1.0)).mul(nah);
                    const stein = an(o.negate(), a)
                        .mul(an(o.add(B.breitM), a))
                        .mul(nah);
                    // die Stoßfuge des Bordsteins: der Abstand zur nächsten Fuge längs des Bords (m)
                    const fuge = an(
                        _T
                            .fract(xz.dot(_T.vec2(n.y.negate(), n.x)).div(B.steinM))
                            .sub(0.5)
                            .abs()
                            .sub(0.5)
                            .mul(B.steinM)
                            .add(0.008),
                        a
                    );
                    const ton = _T.mix(
                        _T.mix(
                            fb
                                .mul(k7(T.fahr - 1))
                                .add(1)
                                .mul(rinne.mul(k7(T.rinne / T.fahr - 1)).add(1))
                                .mul(schatten.mul(k7(T.schatten - 1)).add(1))
                                .mul(k.mul(k7(T.kant - 1)).add(1)),
                            _T.float(T.flanke),
                            flanke
                        ),
                        fuge.mul(k7(-0.35 * T.bord)).add(T.bord),
                        stein
                    );
                    return _T.vec4(ton, flanke.add(stein).add(k).min(1.0), n.mul(flanke).mul(4));
                })
                .setLayout({
                    name: "wegBord",
                    type: "vec4",
                    inputs: [
                        { name: "f", type: "float" },
                        { name: "R", type: "float" },
                        { name: "k", type: "float" },
                        { name: "xz", type: "vec2" },
                        { name: "s", type: "vec3" },
                        { name: "v", type: "vec3" },
                    ],
                }));
        const q = fn(f, R, k, xz, this._windUniformsEnsure().uSunDir, _T.cameraPosition.sub(_T.positionWorld));
        return { ton: q.x, glatt: q.y, kipp: _T.vec3(q.z, 0, q.w) };
    }

    // DIE KRUSTE DER LAVA (TSL, Leser `_wegeBodenFarbe`): EIN Gesetz aus der Temperatur `w` (das Byte A, `_lavaFlaeche`: der Gang
    // des Kerns an der Dicke der Decke) und EINEM Feld in Welt-Lage aus Proben, die der Boden-Stoff an diesem Fragment OHNEHIN lädt
    // (keine eigene Ladung des Atlas — die Kosten des Bodens fern der Lava bleiben, wie sie waren, RAUSCH-GESETZ (B) 70): die
    // Schollen sind das Feld, das den Rand der Laubstreu zerreißt (`schollen`, Raum-Probe λ ≈ 1,4 m), die feinen Risse die
    // Kiesel-Oktave des Mikro-Reliefs (`_mikroFestProbe`, `TERRAIN_BUMP.freq2`, ihr Anteil `rissAnteil`). Die Oberfläche erstarrt
    // sofort zur Kruste; wo das Feld seine Null kreuzt, reißt sie: die Risse sind das Band |n| < `offen` · w — heiß weit offen (die
    // Schmelze steht zwischen treibenden Schollen), kühler enger, kalt zu. Die Haut der Scholle trägt `platte` der Temperatur des
    // Innern (sie isoliert), am dünnen Rand der Decke weniger, der Riss das Innere ganz; ihr Leuchten ist das der Temperatur der
    // Oberfläche (`_lavaGlutNode`, Planck je Kanal): der Riss glüht hell orange, die Scholle kirschrot bis schwarz, am Rand der
    // Decke ist sie dunkel (dort reißt nichts, `randDicke`). Die Farbe ist die Kruste der Boden-Palette (`kruste`, Basaltglas), je
    // Scholle im Ton verschieden, in der kalten Fuge dunkel; die Kante der Scholle kippt die Normale (`relief`, sichtbar nur,
    // solange der Pixel die Fuge trägt — fern glatt, kein Flimmern). Rückgabe { farbe, kipp, glut }.
    // DIE KRUSTE IST EINE WGSL-FUNKTION (`lavaKruste`, wie die Mischungen des Rausch-Atlas, K17-3 Runde 2): rein — die Proben
    // (Schollen `s`, Risse `r`), die Bytes (Temperatur `w`, Decke `L`) und die Welt-Lage `xz` als Parameter, keine Bindung —, ihre
    // Zwischenwerte leben in ihr statt als Variablen des Boden-Programms (ausgeschrieben trug die Kruste 2 943 Zeichen WGSL und
    // riss die Ratsche des Boden-Programms, gate:pruefbuehne-licht 101 675 > 100 062; mit der Atlas-Lage als ivec2 und den
    // kürzesten f32-Zahlen, `_rauschAtlas` · `_f32`, trägt das Programm 98 415, main 98 732). Rückgabe vec4: der Ton der
    // Kruste, `kalt` (1/t0 − 1/T der Oberfläche, `_lavaGlutNode`) und der Kipp (x, z).
    _lavaKruste(_T, schollen, w, decke) {
        const K = AnazhRealm.LAVA_KRUSTE;
        const f2 = AnazhRealm.TERRAIN_BUMP.freq2;
        const n2 = this._mikroFestProbe(_T, _T.positionWorld, f2);
        // die Zahlen kurz (die kürzeste desselben f32): jedes Zeichen des Boden-Programms zählt (`S0_ZEICHEN`)
        const k7 = AnazhRealm._f32;
        const fn =
            this._lavaKrusteFn ||
            (this._lavaKrusteFn = _T
                .Fn(([s, r, w, L, xz]) => {
                    const n = s.add(r.x.mul(K.rissAnteil));
                    const c = n.abs();
                    const aa = _T.fwidth(c);
                    const rand = _T.smoothstep(_T.float(K.randDicke[0]), _T.float(K.randDicke[1]), L);
                    const riss = _T.float(1).sub(_T.smoothstep(_T.float(0), w.mul(K.offen).mul(rand).add(aa), c));
                    // die Temperatur der Oberfläche (die Haut der Scholle `platte` des Innern, der Riss das Innere) als `kalt`
                    const [td, t0] = this._lavaSpanne();
                    const T = w
                        .mul(_T.mix(rand.mul(K.platte), _T.float(1), riss))
                        .mul(t0 - td)
                        .add(td);
                    const kalt = _T.float(k7(1 / t0)).sub(_T.float(1).div(T));
                    // der Ton: je Scholle verschieden, in der kalten Fuge dunkel (mix(fugeTon, 1, 1 − fuge))
                    const ton = s
                        .mul(K.ton)
                        .add(1)
                        .mul(
                            _T
                                .smoothstep(_T.float(0), aa.add(K.fuge), c)
                                .mul(1 - K.fugeTon)
                                .add(K.fugeTon)
                        );
                    // die Neigung von |n| in der Welt (1/m), mit dem Vorzeichen von n: die der Schollen aus den Ableitungen am
                    // Schirm durch die der Welt-Lage (J⁻¹, det/max(det², ε²) statt eines Zweigs; die Raum-Probe trägt keine
                    // Neigung, λ 1,4 m ist glatt über ein Pixel-Quad), die der Risse aus ihrer Probe (`r.yz` je Zelle, mal f2)
                    const [px, py, sx, sy] = [_T.dFdx(xz), _T.dFdy(xz), _T.dFdx(s), _T.dFdy(s)];
                    const det = px.x.mul(py.y).sub(px.y.mul(py.x));
                    const grad = _T
                        .vec2(sx.mul(py.y).sub(sy.mul(px.y)), sy.mul(px.x).sub(sx.mul(py.x)))
                        .mul(det.div(det.mul(det).max(1e-24)))
                        .add(r.yz.mul(k7(K.rissAnteil * f2)))
                        .mul(n.div(c.add(1e-4)));
                    // die Scholle wölbt sich über der Fuge: h = smoothstep(0, 2·fuge, |n|) · relief, die Normale kippt gegen ∇h
                    // (sichtbar, solange der Pixel die Fuge trägt)
                    const t = c.div(2 * K.fuge).clamp(0.0, 1.0);
                    const steil = t
                        .mul(_T.float(1).sub(t))
                        .mul(k7((-6 * K.relief) / (2 * K.fuge)))
                        .mul(_T.float(1).sub(_T.smoothstep(_T.float(K.fuge), _T.float(4 * K.fuge), aa)));
                    return _T.vec4(ton, kalt, grad.mul(steil));
                })
                .setLayout({
                    name: "lavaKruste",
                    type: "vec4",
                    inputs: [
                        { name: "s", type: "float" },
                        { name: "r", type: "vec3" },
                        { name: "w", type: "float" },
                        { name: "L", type: "float" },
                        { name: "xz", type: "vec2" },
                    ],
                }));
        const q = fn(schollen, n2, w, decke, _T.positionWorld.xz);
        const b = AnazhRealm.BODEN_FARBE.kruste.map(k7);
        return {
            farbe: _T.vec3(b[0], b[1], b[2]).mul(q.x),
            kipp: _T.vec3(q.z, 0, q.w),
            // WIDERLEGT (w28-lava-zuendet): die Glut über die Umkehr des Nacht-Auges (`_nachtAuge(…, true)`) — die dunklen Schollen
            // stehen unter dem Stäbchen-Anteil, die Umkehr hob sie nachts zehnfach ins Rosa-Rot, die Risse blieben blass
            glut: this._lavaGlutNode(_T, q.y),
        };
    }

    // DAS KOPFSTEIN (porta STEIN_GESETZ.kopfstein, der Belag `pflaster` der Wege-Karte): Granit-Kleinpflaster im Segmentbogen als
    // Term des Boden-Stoffs, kein Befehl und keine Textur — ein LESER DES EINEN KAMMS (`_steinStoff`, w28-stein-kamm): er liefert nur
    // die LAGE aus der Welt. Je Bogen der Sehne hebt sich der Lauf der Reihen um den Stich (v, eine ganze Zahl ist die Lagerfuge),
    // die Steine einer Reihe im Läufer-Verband (u, jede zweite Reihe um einen halben Stein versetzt), die Spanne des Pixels je Achse
    // aus den Ableitungen der Welt-Lage, die Richtungen der Lage in der Ebene des Bodens (u längs x, v quer zum Lauf der Reihe).
    // Fuge, Bruchton, Kopf, Fase und die Fern-Regel rechnet der Kamm. Die Farbe ist der Stein des Farb-Gesetzes
    // (`STEIN_GESETZ.farbe`, linear: `_srgbHexLinear`). Leser: `_wegeBodenFarbe`. → vec3 (die Albedo); `aus.kipp` die Kante des
    // Steins als Kipp der Boden-Normale (Welt), `aus.korn` das Korn seiner Zeile.
    _kopfsteinFarbe(_T, xz, aus) {
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        if (!K || !(K.steinM > 0) || !(K.fuge > 0) || !(K.ton >= 0) || !(K.fugeTon > 0) || !(K.korn >= 0))
            throw new Error("Kopfstein: die Zeile porta:STEIN_GESETZ.kopfstein trägt Stein, Fuge, Ton oder Korn nicht");
        const c = AnazhRealm._srgbHexLinear(AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[K.stein]);
        const s = K.steinM;
        // der Bogen: t ∈ [−1, 1] über die Sehne, die Reihe hebt sich zur Mitte des Bogens um den Stich
        const t = _T.fract(xz.x.div(K.sehneM)).mul(2).sub(1);
        const v = xz.y.add(_T.float(1).sub(t.mul(t)).mul(K.stichM)).div(s);
        const u = xz.x.div(s).add(_T.fract(_T.floor(v).mul(0.5)));
        const S = this._steinStoff(_T, K, {
            u,
            v,
            mU: s,
            mV: s,
            sU: _T.fwidth(xz.x).div(s),
            sV: _T.fwidth(v),
            rU: _T.vec3(1, 0, 0),
            // ∇v: der Lauf der Reihe steigt mit −4 · t · Stich ÷ Sehne (die Zahl kurz: jedes Zeichen des Boden-Programms zählt)
            rV: _T.normalize(_T.vec3(t.mul(AnazhRealm._f32((-4 * K.stichM) / K.sehneM)), 0, 1)),
        });
        if (aus) [aus.kipp, aus.korn] = [S.kipp, K.korn];
        return _T.vec3(c[0], c[1], c[2]).mul(S.farbe);
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
    // EIN Tier tritt nur in der Reichweite des Gedächtnisses (`_trittReichweite`, w28-halter-register): jenseits fiele seine Zelle
    // am nächsten Gang des Registers (Radeon 18.11., Runde reise: Tiere 2,6–6,5 km fern hielten 70 von 789 Einträgen außerhalb).
    _trittDerLeiber() {
        const st = this.state;
        const pm = st.playerMesh;
        const p = pm && pm.position;
        const rw = p ? AnazhRealm._trittReichweite(this) : Infinity;
        for (const c of st.creatures || AnazhRealm.STAND_LEER)
            if (
                c &&
                c.position &&
                c.userData &&
                !(p && Math.max(Math.abs(c.position.x - p.x), Math.abs(c.position.z - p.z)) > rw)
            )
                this._tritt(c, c.position.x, c.position.z, true, false);
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
        const n = Math.round((this._trittZahl(x, z) + 1) * T.standN) / T.standN;
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
    // DIE ZAHL DER TRITTE an (x, z) (fahrzeug-medium): wie oft die Zelle schon getreten ist — Fuß, Huf und Rad —, erholt auf die Uhr
    // von heute (n · e^(−Δt/erholTage): der Stand, darunter das flüchtige Gedächtnis); was unter `vergessen` erholt ist, ist
    // vergessen — dieselbe Schwelle wie der Kehraus des Tags (`_trittErholen`), so ist die Zahl eine Funktion der Uhr, nie des
    // Tags, an dem der Kehraus zuletzt lief. Bis hier las sie die Zeile roh: der Sprung der Uhr kehrte im Zwilling der Stunde
    // die Reste vor dem Sprung aus, der Lauf danach am selben Tag las sie noch (gate:fahr-leben VK-V Bild 0: unter den
    // Vorderrädern von Wagen 0 je 6,1e-6 Tritte gegen 0, der Wagen 1 mm daneben). Leser: der Tritt selbst (`_tritt`, n + 1) und das Rad im Boden (`_fahrRad`: die Rinne der
    // Durchfahrten vor ihm). Kosten: ein Schlüssel, wenn ein Fuß oder ein Rad eine neue Zelle betritt.
    _trittZahl(x, z) {
        const T = AnazhRealm.TRITT;
        const key = Math.floor(x / T.zelleM) + "," + Math.floor(z / T.zelleM);
        const wm = this.state.worldMeta;
        const alt = (wm && wm.tritt && wm.tritt[key]) || (this._trittSchwach && this._trittSchwach.get(key));
        const n = alt ? alt[0] * Math.exp(-(this._trittJetzt() - alt[1]) / T.erholTage) : 0;
        return n >= T.vergessen ? n : 0;
    }
    // Die Kacheln der Wiese und der Nah-Streu über der Zelle `key` fallen (sie wachsen auf dem Pfad neu)
    _trittWiese(key) {
        const T = AnazhRealm.TRITT;
        const [i, j] = key.split(",").map(Number);
        const [cx, cz, r] = [(i + 0.5) * T.zelleM, (j + 0.5) * T.zelleM, T.halbM + T.randM];
        this._nahWieseNeuIn(cx - r, cz - r, cx + r, cz + r, true);
    }
    // Die Uhr des Pfads: der Tag der Prozesse (`_weltTag`, die Welt-Uhr im Tag des Gesetzes)
    _trittJetzt() {
        return this._weltTag();
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
                if (n * Math.exp(-(jetzt - t) / T.erholTage) < T.vergessen) this._trittSchwach.delete(key);
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
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeStufeMalen(stufe, null, null, box); // nur ihr Kasten malt neu
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }

    // Die Nah-Wiese UND die Nah-Streu über einer neuen Weg-/Tritt-Fläche neu wachsen lassen: jede Kachel im Rechteck
    // fällt, der nächste Takt baut sie auf dem Pfad-Feld neu (beide lesen `_pfadFeldAt` — bis 05.10. fiel nur die Wiese,
    // die Blume des Waldbodens blieb auf dem neuen Weg stehen).
    // `karte`: nur die Boden-Karte regte sich (der Trampelpfad, `_tritt`) — die Wache weckt nur ihre Leser (Wiese, Nah-Streu).
    // Es fallen nur die Kacheln im Rechteck (auch wenn nur das Licht der Kronen sich änderte, `_kronenStreuWiese`: ihr Wurf und
    // ihr Tint lesen es). Bis w28-wiese-schale fiel ohne dieses Wissen der Rand von 3 × 3 Kacheln der Ferne samt Gittern (am
    // Messort, Null-Renderer, 750 Takte, 1 915 Kacheln in 1 951 ms gegen 915 ms); die Ferne liest seither kein Gitter.
    _nahWieseNeuIn(x0, z0, x1, z1, karte = false) {
        this._weltRegt(karte, karte); // die Kacheln fallen: die Stand-Wache weckt Wiese und Streu
        let n = 0;
        const imRechteck = (key, K, rand = 0) => {
            const [tx, tz] = key.split(",").map(Number);
            return !((tx + 1) * K + rand < x0 || tx * K - rand > x1 || (tz + 1) * K + rand < z0 || tz * K - rand > z1);
        };
        // DIE KACHEL FÄLLT ERST MIT IHREM NACHFOLGER (`_nahWieseKachelFaellt`, `_nahStreuKachelFaellt`): ihr Satz gilt HIER als alt,
        // unter dem Weckruf oben (kein Rückruf: die Schreiber-Wand deckt nur den eigenen Pfad) — sie steht, bis ihr Takt den
        // Neubau an ihre Stelle setzt (der Block der Wiese stirbt und wird im selben Gang neu geboren, die Streu tauscht ihre
        // Blöcke in EINEM Bau). Bis w28-pop-treue fiel sie hier sofort: jeder Tritt, der den Pfad eine Stufe hob, jeder Weg und
        // jede Krone riss ein Loch in die Wiese, bis der Takt nachbaute (die Nähe eine Kachel je Takt).
        const nw = this.state.nahWiese;
        if (nw)
            for (const key of nw.kacheln.keys())
                if (imRechteck(key, AnazhRealm.NAH_WIESE.kachel) && this._nahWieseKachelFaellt(key)) n++;
        // die Kacheln der Ferne lesen dieselben Felder wie die Nähe (`_nahWieseFernKachel`, ihre Büschel samt Jitter 0,34 m): eine
        // Kachel, die die Fläche trifft, baut neu (bis w28-wiese-schale las sie über ein Gitter auch die acht Nachbarn)
        const KF = AnazhRealm.NAH_WIESE.fern.kachel;
        for (const [key, k] of nw && nw.fern ? nw.fern.kacheln : [])
            if (!k.satzAlt && imRechteck(key, KF, 0.34)) ((k.satzAlt = true), n++);
        const ns = this.state.nahStreu;
        if (ns)
            for (const [key, k] of ns.kacheln) {
                if (!imRechteck(key, AnazhRealm.NAH_STREU.kachel)) continue;
                this._nahStreuKachelFaellt(k);
                n++;
            }
        return n;
    }

    // DIE KENNUNG EINES BAU-POOLS (gate:asset-inventory): Name UND Inventar-Stempel eines Instanz-Pools der Bau-Substanz
    // (die Kisten-Pools: Acker, Vogel, die Ferne der Stadt), bei jeder Erzeugung — auch beim Verdoppeln. Die Inventur liest den
    // Stempel (`userData.inventar`), nie den Namen: bis 08.10. trugen die Pools nur ihren Namen, und kam das Auto-Dorf
    // während der Inventur, stand der Zaun als „UNBEKANNTER Emitter“ rot (CI 37709343976; der Zaun-Pool fiel mit mauer-im-stoff).
    static _poolKennung(mesh, name) {
        mesh.name = name;
        mesh.userData.inventar = name;
        return mesh;
    }

    // ═══ DIE EINFRIEDUNG IM STOFF DER WELT (mauer-im-stoff) ═══
    // Stadtmauer und Zaun der Siedlungen zeichnen im EINEN Bau-Stoff der Welt (`_foundryTreeMaterial`, der matte Satz-Stoff der
    // Häuser: Verband, Fuge und Gefüge webt er aus Welt-Lage und Nummer der Ecke, `_verbandStoff`) als EIN Satz — ein Draw im
    // Hauptbild, einer je Kaskade. Die Gestalt liefert das Gesetzbuch als Netz (fachwerk `mauerNetz` · `zaunNetz`: Zinne,
    // Brustwehr, Zeltdach, Pfahl, Pfosten und Riegel; das Labor zeichnet dasselbe Netz). Bis hier standen beide als Kiste mit
    // Instanz-Farbe in zwei Pools (`_kistenPool`: weißer Stoff ohne Verband): je Segment EIN Quader von 37 m in einem Ton — am
    // Messort stadt-voll las die Mauer als glatte Platte, im Schatten als schwarze (Schöpfer 24.11.: „die grauen blöcke“).
    // Kein Snapshot-Feld: die Stücke entstehen je Sitzung aus dem Export der Siedlung (`_stlWegeRaten`, `_stlMauerBuild`).
    _einfriedungArt() {
        const st = this.state;
        const art = "siedlung-einfriedung";
        if (!st.satzStoffe) st.satzStoffe = new Map();
        if (!st.satzStoffe.has(art))
            st.satzStoffe.set(art, {
                name: art,
                // derselbe Stoff, dasselbe Programm wie der matte Bau-Satz der Häuser (`_satzStoff`: Regler und Verband je Ecke)
                mat: this._foundryTreeMaterial("unknown", { seh: "stoff", side: 2, satzRegler: true }, false, null),
                wurf: true,
                userData: { einfriedung: true, inventar: art },
                kapazitaet: "bau",
            });
        return art;
    }
    // EIN STÜCK (Wand, Turm, Zaun) IN DEN SATZ: `netze` = die Netze des Gesetzbuchs je Stoff im Rahmen des Stücks, die Pose ist
    // seine Mitte am Boden und die Gier (`yaw`: z längs). Je Stoff EIN Bereich (die Rauheit der Rolle gilt je Bereich,
    // `_satzBlock`); ein Stück desselben Schlüssels fällt vorher. Der Eintrag merkt je TEIL die Matrix Einheits-Form → Welt
    // (Pose × `m` des Gesetzbuchs — dieselben Zahlen, aus denen die Ecken im Puffer stehen): `_mauerGebaut` liest ihn.
    _einfriedungLege(key, plan, netze, x, y, z, yaw) {
        const st = this.state;
        const satz = this._einfriedungArt();
        const E = st.einfriedung || (st.einfriedung = new Map());
        this._einfriedungFaellt(key);
        const pose = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
        const im = pose.elements;
        const e = { plan, schluessel: [], teile: [] };
        for (const N of netze) {
            const n = N.pos.length / 3;
            const je = (array, itemSize) => ({ array, itemSize, count: n });
            const eins = new Float32Array(n).fill(1);
            const geo = {
                attributes: {
                    position: je(N.pos, 3),
                    normal: je(N.nrm, 3),
                    color: je(N.farbe, 3),
                    // die Stempel der Blende: ungemaskt (Stufe 0, beide Höhen 1 — wie ein Haus auf dem Null-Stempel)
                    aLodLevel: je(new Float32Array(n), 1),
                    aH0: je(eins, 1),
                    aH0L: je(eins, 1),
                    aVerband: je(N.nr, 1),
                    aLage: je(N.lage, 2),
                },
                index: { array: N.idx },
            };
            const k = key + "|" + N.stoff;
            const regler = { regler: [N.rau, 0, 1], glut: [0, 0, 0], verband: 0 };
            const block = this._satzBlock(geo, im, null, 1, AnazhRealm.BAU_SATZ_ATTR, k, regler);
            this._chunkSatzEin(satz, k, block, this._bauSatzChunk(im));
            e.schluessel.push(k);
            for (const t of N.teile)
                e.teile.push({
                    art: t.art,
                    form: t.form,
                    arg: t.arg,
                    stoff: t.stoff,
                    m: new THREE.Matrix4().fromArray(t.m).premultiply(pose).elements.slice(),
                    bereich: k,
                    v0: t.v0,
                    n: t.n,
                    ton: t.ton,
                });
        }
        E.set(key, e);
        return e;
    }
    // ein Stück verlässt den Satz (die Mauer wächst mit dem Ort, die Welt wechselt)
    _einfriedungFaellt(key) {
        const st = this.state;
        const e = st.einfriedung ? st.einfriedung.get(key) : null;
        if (!e) return false;
        for (const k of e.schluessel) this._chunkSatzAus("siedlung-einfriedung", k);
        st.einfriedung.delete(key);
        return true;
    }
    // DER LESER DES GEBAUTEN (die Station mensch.macht.wehrbau, gate:settlement): je Teil der Mauer des Plans `plan` (ohne Plan:
    // jeder Mauer) { art: wand · krone · untersicht · brustwehr · zinne · wallkrone · wandkopf · turm · dach, x, y, z (die Mitte),
    // yaw, pitch, dick, hoch, lang, m (16 Zahlen: Einheits-Würfel [−0,5; 0,5]³ → Welt), form, arg, stoff, stueck, bereich, v0, n,
    // ton (der Anteil des Tons der Rolle, den das Teil trägt: 1, die Untersicht des Wehrgangs `MAUER_GESTALT.untersicht`) } — aus den
    // Zahlen des Eintrags, mit denen die Ecken in den Puffer gingen (`_einfriedungLege`), nie aus dem Plan nachgerechnet. Die
    // Linse (gate:settlement) rechnet den Puffer des Bereichs aus `m` und der Einheits-Form nach (fachwerk `mauerEinheit`).
    _mauerGebaut(plan = null) {
        const aus = [];
        for (const [stueck, e] of this.state.einfriedung || [])
            if (stueck.startsWith("mauer:") && (!plan || e.plan === plan))
                for (const t of e.teile) {
                    const m = t.m;
                    aus.push({
                        art: t.art,
                        x: m[12],
                        y: m[13],
                        z: m[14],
                        yaw: Math.atan2(m[8], m[10]),
                        pitch: -Math.atan2(m[9], Math.hypot(m[8], m[10])),
                        dick: Math.hypot(m[0], m[1], m[2]),
                        hoch: Math.hypot(m[4], m[5], m[6]),
                        lang: Math.hypot(m[8], m[10]),
                        m,
                        form: t.form,
                        arg: t.arg,
                        stoff: t.stoff,
                        stueck,
                        bereich: t.bereich,
                        v0: t.v0,
                        n: t.n,
                        ton: t.ton,
                    });
                }
        return aus;
    }
    // DIE KISTE DER POOLS (Vogel · Feld · Acker · die Ferne der Stadt): EIN Stoff — EIN Programm, je Pool EIN Draw (das Fundament-Muster: welt-weit,
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
    // DIE FERNE DER STADT (w28-stadt-netz, Stufe 1 im Bild): jede Kachel einer Stadt, die in dieser Sitzung nicht steht, trägt
    // ihre Häuser als MASSEN — die Liste des Gesetzbuchs (fachwerk `kachelMassen`: Zahl, Maße, Geschosse, Ton der Kachel an den
    // Straßen ihres Netzes), je Haus eine Kiste bis zur Traufe und ein Satteldach, in zwei Pools der EINEN Kiste (EIN Programm,
    // zwei Draws für die ganze Stadt; die Farbe je Instanz ist der Ton des Hauses). Der Grund je Haus ist die Höhe des Gesetzes
    // an seiner Mitte, die Kiste reicht `sockelM` darunter; was im Wasser stünde, steht nicht. Die Kachel steht, sobald die
    // Sitzung ihre Siedlung kennt (`_bewohnerSiedlungen`) und ihr Zug endete — dann fallen ihre Massen (die Häuser der Stufe 2
    // stehen auf demselben Netz an anderen Losen). Bis hier trug die Stadt jenseits der wachen Kacheln nichts: „dorf 7 4750“
    // stand als neun Kacheln auf der Wiese. Je `jeTakte` Takte baut der Takt EINE Kachel (2–4 ms im Kern, einmal je Sitzung).
    _stadtFerneTakt(playerPos) {
        const st = this.state;
        const staedte = this._staedte();
        if (!staedte.length || !st.scene) return;
        const A = AnazhRealm.STADT_FERNE;
        const F = this._stadtFerneStand();
        const [B, q, M] = [this._bewohnerSiedlungen, this._autoSettlementQueue, AnazhRealm._siedlungGesetz().cellM];
        const V = this._dorfVorraete;
        let darf = ++F.takt % A.jeTakte === 0;
        let weg = F.takt % A.jeTakte === 3; // EINE Kachel je Takt-Runde legt oder löst ihre Straßen
        for (const s of staedte) {
            if (Math.hypot(s.x - playerPos.x, s.z - playerPos.z) > A.reichM + s.ringe * M) continue;
            for (let k = -s.ringe; k <= s.ringe; k++)
                for (let i = -s.ringe; i <= s.ringe; i++) {
                    const key = !i && !k ? s.key : s.cx + i + "," + (s.cz + k);
                    const imZug = !!(q && q.cellKey === key && q.plan && q.origin);
                    // der Plan der Kachel: die Sitzung kennt ihre Siedlung, ihr Zug hebt sie gerade — oder ihr Vorrat liegt
                    // bereit (`_dorfBereiten`: der Plan v2 am Ort der Kachel, im Vorlauf des Erwachens): die Massen stehen an
                    // ihren Losen, ehe die Kachel erwacht, und das Erwachen stellt kein Haus um
                    const w = V && V.get(key);
                    const S2 =
                        (B && B.get(key)) ||
                        (imZug ? { plan: q.plan, ox: q.origin.x, oz: q.origin.z } : null) ||
                        (w && w.da && w.v2 && Array.isArray(w.v2.slots) ? { plan: w.v2, ox: w.x, oz: w.z } : null);
                    let e = F.je.get(key);
                    if (S2 && !(e && e.los)) {
                        // STUFE 2: dieselben Massen an den ECHTEN Losen — sofort, ehe das erste Haus des Zugs steht
                        const alt = e;
                        if (alt) this._stadtFerneLoesen(F, alt);
                        e = this._stadtFerneBauen(
                            F,
                            AnazhRealm.Gesetz("fachwerk:planMassen")(S2.plan),
                            S2.ox,
                            S2.oz,
                            S2.plan
                        );
                        if (alt) [e.strassen, e.box, e.band] = [alt.strassen, alt.box, alt.band];
                        F.je.set(key, e);
                    } else if (!e && darf) {
                        const m = AnazhRealm.Gesetz("fachwerk:kachelMassen")(s.seed, s.nH, i, k, s.epoche); // die Stadt des Worts: ohne Klima
                        e = this._stadtFerneBauen(F, m, s.x + i * M, s.z + k * M, null);
                        e.strassen = m ? m.strassen : null;
                        F.je.set(key, e);
                        darf = false;
                    }
                    if (!e) continue;
                    // der Zug endete: ein Los, das kein Haus trägt (es fiel an der Bau-Wand), trägt auch keine Masse
                    // (die Kachel STEHT: die Sitzung kennt ihre Siedlung und ihr Zug ist durch — ein Vorrat steht noch nicht)
                    if (e.los && !e.steht && !imZug && B && B.has(key)) this._stadtMasseZugEnde(F, e);
                    const d = Math.hypot(s.x + i * M - playerPos.x, s.z + k * M - playerPos.z);
                    // eine Kachel, die ihren Plan ohne Stufe 1 bekam (der Reload: die Sitzung kennt ihre Siedlung), holt die
                    // Gassen ihres Netzes für das Band, sobald sie jenseits `bandAbM` liegt
                    if (!e.strassen && e.los && darf && d > A.bandAbM) {
                        const m = AnazhRealm.Gesetz("fachwerk:kachelMassen")(s.seed, s.nH, i, k, s.epoche); // die Stadt des Worts: ohne Klima
                        e.strassen = m ? m.strassen : [];
                        darf = false;
                    }
                    if (!e.strassen) continue;
                    // das Band der Straßen: jenseits `bandAbM` (dort malt keine Stufe der Wege-Karte mehr die ganze Kachel)
                    // liegt es, diesseits fällt es (`bandSpielM` Spiel gegen das Flattern an der Grenze)
                    if (!!e.band !== d > A.bandAbM - (e.band ? A.bandSpielM : 0))
                        this._stadtFerneBand(F, e, !e.band, s.x + i * M, s.z + k * M);
                    // die Straßen der Stufe 1: bis `strassenM` vom Spieler (dahinter malt keine Stufe der Wege-Karte); sie
                    // fallen eine Kachel weiter draußen — und sobald die Kachel steht (ihr Plan malt seine Gassen selbst)
                    if (e.box ? e.steht || d > A.strassenM + M : !e.los && d < A.strassenM && weg) {
                        this._stadtFerneStrassen(e, !e.box);
                        weg = false;
                    }
                }
        }
        this._stadtMasseStand();
    }
    // der Stand der Ferne (je Welt): die zwei Pools, je Kachel ihr Eintrag, die Lose der Stufe 2 nach ihrem Ort (`los`), je
    // gebundenem Haus seine Masse (`von`) und die Häuser, deren Bild wechselte (`schmutz`)
    _stadtFerneStand() {
        const st = this.state;
        return (
            st.stadtFerne ||
            (st.stadtFerne = {
                wand: null,
                dach: null,
                band: null,
                je: new Map(),
                takt: 0,
                los: new Map(),
                von: new Map(),
                schmutz: new Set(),
            })
        );
    }
    static _stadtLosKey(x, z) {
        return Math.round(x * 20) + "," + Math.round(z * 20);
    }
    // EIN HAUS DER STADT TRÄGT EIN BILD (w28-stadt-netz, der Schnitt der Kapsel-Liste): sein Mesh in der Mesh-Zone, seinen Satz
    // im Welt-March bis `STADT_FERNE.nahM` (`_archSatzHorizont`), dahinter — und solange es weder Mesh noch Satz trägt — seine
    // MASSE in den Pools der Ferne, an seinem Los. Bis hier trug jedes stehende Haus bis zu seinem Pixel-Horizont einen Satz:
    // die Liste des March wuchs mit der Stadt (3 × 3 Kacheln, 1641 Häuser: 6779 von 8192 Plätzen; bei 14 Kacheln voll).
    // `_stadtMasseRegt`: der Weckruf des Baus (`_cullWecken`: Eintritt, Abbau, Mesh und Instanz) und sein Satz
    // (`_archZiegelHalten`, `_archZiegelTod`) melden den Wechsel; der Eintritt bindet das Haus an das Los seines Orts.
    _stadtMasseRegt(entry, art) {
        const F = this.state.stadtFerne;
        if (!F || !F.los.size || !entry || entry._masse === null) return;
        if (entry._masse === undefined) {
            const p = entry.position;
            const m = p ? F.los.get(AnazhRealm._stadtLosKey(p.x, p.z)) : null;
            if (!m || m.e.gebunden[m.j]) {
                entry._masse = null;
                return;
            }
            entry._masse = true;
            m.e.gebunden[m.j] = 1;
            F.von.set(entry, m);
        }
        const m = F.von.get(entry);
        if (!m) return;
        if (art === "weg") m.weg = true; // abgebaut: an seinem Los steht nichts mehr
        F.schmutz.add(entry);
    }
    // der Stand der Massen nach den Wechseln dieses Takts: die Masse steht, wo das Haus kein eigenes Bild trägt
    _stadtMasseStand() {
        const F = this.state.stadtFerne;
        if (!F || !F.schmutz.size) return;
        for (const entry of F.schmutz) {
            const m = F.von.get(entry);
            if (!m) continue;
            const an = !m.weg && !entry._ziegelSlot && !this._archIsRendered(entry);
            if (!!m.e.anH[m.j] !== an) this._stadtMasseSchreiben(F, m.e, m.j, an);
            if (m.weg) F.von.delete(entry);
        }
        F.schmutz.clear();
    }
    _stadtMasseSchreiben(F, e, j, an) {
        e.anH[j] = an ? 1 : 0;
        for (const art of ["wand", "dach"]) {
            const [t, P] = [e[art], F[art]];
            if (!t || !P) continue;
            const [ziel, o] = [P.mesh.instanceMatrix.array, (t.a + j) * 16];
            if (an) ziel.set(t.matrizen.subarray(j * 16, j * 16 + 16), o);
            else {
                ziel.fill(0, o, o + 16);
                ziel[o + 15] = 1;
            }
            P.mesh.instanceMatrix.needsUpdate = true;
        }
    }
    _stadtMasseZugEnde(F, e) {
        e.steht = true;
        for (let j = 0; j < e.anH.length; j++)
            if (e.anH[j] && !e.gebunden[j]) this._stadtMasseSchreiben(F, e, j, false);
    }
    // die zwei Pools der Ferne: die Kiste (die Wände) und das Dach — das Prisma der Einheit: Grund 1 × 1 um die Mitte, der First
    // längs x in der Höhe 1 (zwei Schrägen, zwei Giebel)
    _stadtFernePool(F, art) {
        if (F[art]) return F[art];
        let geo;
        if (art === "dach") {
            const [h, n] = [0.5, Math.hypot(0.5, 1)];
            // prettier-ignore
            const P = [-h, 0, h, h, 0, h, h, 1, 0, -h, 1, 0, h, 0, -h, -h, 0, -h, -h, 1, 0, h, 1, 0, h, 0, h, h, 0, -h, h, 1, 0, -h, 0, -h, -h, 0, h, -h, 1, 0];
            // prettier-ignore
            const N = [0, 0.5 / n, 1 / n, 0, 0.5 / n, 1 / n, 0, 0.5 / n, 1 / n, 0, 0.5 / n, 1 / n, 0, 0.5 / n, -1 / n, 0, 0.5 / n, -1 / n, 0, 0.5 / n, -1 / n, 0, 0.5 / n, -1 / n, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0];
            geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
            geo.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
            geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(28), 2));
            geo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13]);
        }
        const mesh = this._kistenPool("stadt-ferne-" + art, 1024, geo);
        this.state.scene.add(mesh);
        return (F[art] = { mesh, cap: 1024, top: 0, geo, frei: [] });
    }
    // n Plätze am Ende eines Pools der Ferne (er wächst durch Verdopplung, wie jeder Bau-Pool) → der erste Platz
    _stadtFernePlatz(P, n) {
        // ein gelöster Bereich (die Massen der Stufe 1 einer Kachel, die ihren Plan bekam) trägt den nächsten, der passt
        const f = P.frei.findIndex((r) => r.n >= n);
        if (f >= 0) {
            const r = P.frei[f];
            const a = r.a;
            if (r.n === n) P.frei.splice(f, 1);
            else [r.a, r.n] = [r.a + n, r.n - n];
            return a;
        }
        if (P.top + n > P.cap) {
            let cap = P.cap;
            while (P.top + n > cap) cap *= 2;
            const neu = this._kistenPool(P.mesh.name, cap, P.geo);
            neu.instanceMatrix.array.set(P.mesh.instanceMatrix.array);
            neu.instanceColor.array.set(P.mesh.instanceColor.array);
            this.state.scene.add(neu);
            this.state.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            [P.mesh, P.cap] = [neu, cap];
        }
        const a = P.top;
        P.top += n;
        AnazhRealm._instanzZahl(P.mesh, P.top);
        return a;
    }
    // die Massen EINER Kachel in die Pools (`m`: fachwerk `kachelMassen` oder `planMassen`, um den Ursprung ox/oz): je Haus
    // seine Kiste und (mit First) sein Dach am Platz seiner Nummer — der Eintrag merkt ihre Matrizen (ein Haus ohne Masse,
    // im Wasser oder ohne First trägt die Null-Kiste). Mit `plan` (Stufe 2) steht jedes Haus an seinem Los: sein Grund ist
    // der des Slots, sein Ort trägt es ins Register der Lose (`F.los`), und die Häuser, die dort schon stehen, binden sich.
    _stadtFerneBauen(F, m, ox, oz, plan) {
        const A = AnazhRealm.STADT_FERNE;
        const n = m ? m.n : 0;
        const e = { wand: null, dach: null, band: null, ox, oz, strassen: null, box: null, los: !!plan, steht: false, anH: new Uint8Array(n), gebunden: new Uint8Array(n) }; // prettier-ignore
        if (!n) return e;
        const [L, T] = [m.lage, m.ton];
        const [mat, quat, pos, mass, auf] = [new THREE.Matrix4(), new THREE.Quaternion(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]; // prettier-ignore
        const [wm, dm] = [new Float32Array(n * 16), new Float32Array(n * 16)];
        for (let h = 0; h < n; h++) {
            wm[h * 16 + 15] = dm[h * 16 + 15] = 1; // die Null-Kiste: kein Dreieck trägt Fläche
            const [x, z, gier, W, D, traufe, first] = [ox + L[h * 7], oz + L[h * 7 + 1], L[h * 7 + 2], L[h * 7 + 3], L[h * 7 + 4], L[h * 7 + 5], L[h * 7 + 6]]; // prettier-ignore
            const sl = plan ? plan.slots[h] : null;
            if (!(W > 0)) continue;
            const y = sl && Number.isFinite(sl.y) ? sl.y : this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(y) || (!sl && !this._landAt(x, z, 0.2))) continue;
            if (sl) F.los.set(AnazhRealm._stadtLosKey(ox + sl.x, oz + sl.z), { e, j: h, weg: false });
            e.anH[h] = 1;
            quat.setFromAxisAngle(auf, gier);
            mat.compose(pos.set(x, y + (traufe - A.sockelM) / 2, z), quat, mass.set(W, traufe + A.sockelM, D));
            wm.set(mat.elements, h * 16);
            if (!(first > 0)) continue;
            mat.compose(pos.set(x, y + traufe, z), quat, mass.set(W + A.ueberM, first, D + A.ueberM));
            dm.set(mat.elements, h * 16);
        }
        const lege = (art, matrizen, ab) => {
            const P = this._stadtFernePool(F, art);
            const a = this._stadtFernePlatz(P, n);
            const farben = P.mesh.instanceColor.array;
            for (let h = 0; h < n; h++) farben.set(T.subarray(h * 6 + ab, h * 6 + ab + 3), (a + h) * 3);
            P.mesh.instanceColor.needsUpdate = true;
            P.mesh.instanceMatrix.array.set(matrizen, a * 16);
            P.mesh.instanceMatrix.needsUpdate = true;
            return { a, n, matrizen };
        };
        [e.wand, e.dach] = [lege("wand", wm, 0), lege("dach", dm, 3)];
        // die Häuser, die schon stehen (der Wege-Bau nach dem Reload, der Akt): jedes bindet sich an sein Los
        if (plan) for (const entry of this.state.architectures || []) if (entry && entry._masse !== true) [(entry._masse = undefined), this._stadtMasseRegt(entry)]; // prettier-ignore
        return e;
    }
    // die Massen einer Kachel fallen aus den Pools (Stufe 1, wenn ihr Plan kommt): Null-Kisten, die Plätze frei für die nächste
    // (`arten`: die Pools — ohne sie Wand und Dach; das Band der Straßen löst `_stadtFerneBand`)
    _stadtFerneLoesen(F, e, arten = ["wand", "dach"]) {
        for (const art of arten) {
            const [t, P] = [e[art], F[art]];
            if (!t || !P) continue;
            const ziel = P.mesh.instanceMatrix.array;
            ziel.fill(0, t.a * 16, (t.a + t.n) * 16);
            for (let j = t.a; j < t.a + t.n; j++) ziel[j * 16 + 15] = 1;
            P.mesh.instanceMatrix.needsUpdate = true;
            P.frei.push({ a: t.a, n: t.n });
            e[art] = null;
        }
    }
    // DAS BAND DER STRASSEN EINER FERNEN KACHEL (`an`: legen, sonst lösen; `ox`/`oz` die Mitte der Kachel): jenseits `bandAbM`
    // malt keine Stufe der Wege-Karte die ganze Kachel (ihr fernes Fenster reicht 1024 m) — dort trägt jede Gasse ihres Netzes
    // (fachwerk `kachelMassen` `strassen`) EINE Kiste im dritten Pool der Ferne: von ihrem ersten zu ihrem letzten Punkt, so
    // breit wie Belag und Saum, `bandHubM` über dem Grund des Gesetzes an ihren Enden (`bandDickM` dick: der Hang), im Ton des
    // Kopfsteins (der Stein des Farb-Gesetzes mal dem Anteil seiner Fuge, porta `STEIN_GESETZ`). EIN Draw für alle Straßen
    // aller fernen Kacheln. Bis hier standen die Massen jenseits 1 200 m ohne Weg: aus 1 km lag fast die Hälfte der Stadt als
    // Konfetti auf der Wiese.
    _stadtFerneBand(F, e, an, ox, oz) {
        if (!an) {
            if (e.band && e.band.n) this._stadtFerneLoesen(F, e, ["band"]);
            e.band = null;
            return;
        }
        const A = AnazhRealm.STADT_FERNE;
        const n = e.strassen.length;
        e.band = { a: 0, n: 0 }; // auch leer gemerkt: die Kachel fragt nicht je Takt neu
        if (!n) return;
        const K = AnazhRealm.Gesetz("porta:STEIN_GESETZ.kopfstein");
        const c = AnazhRealm._srgbHexLinear(AnazhRealm.Gesetz("porta:STEIN_GESETZ.farbe")[K.stein]);
        const ton = 1 - ((1 - K.fugeTon) * 2 * K.fuge) / K.steinM;
        // DER TON DES BANDS FOLGT DEM WEG (w28-weg-koerper, fachwerk WEG_GESETZ): die Erd-Gasse trägt die getretene Erde der Palette,
        // das Pflaster den Stein, die Fahrstraße ihn im Mittel aus Fahrbahn (`ton.fahr`) und Gehweg nach ihren Breiten — derselbe
        // Ton, den der Boden-Stoff in der Wege-Karte zeichnet. Bis hier trug jedes Band Kopfstein, auch die Erd-Gasse.
        const W = AnazhRealm.Gesetz("fachwerk:WEG_GESETZ");
        const erde = AnazhRealm.BODEN_FARBE.dirt;
        const P = this._stadtFernePool(F, "band");
        const a = this._stadtFernePlatz(P, n);
        const [ziel, farben] = [P.mesh.instanceMatrix.array, P.mesh.instanceColor.array];
        const [mat, quat, pos, mass, dreh] = [new THREE.Matrix4(), new THREE.Quaternion(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Euler()]; // prettier-ignore
        for (let h = 0; h < n; h++) {
            const [s, o] = [e.strassen[h], (a + h) * 16];
            ziel.fill(0, o, o + 16);
            ziel[o + 15] = 1; // die Null-Kiste: eine Gasse im Wasser trägt kein Band
            const [fahrM, breit] = [Math.max(1.2, s.w), Math.max(1.2, s.w) + 2 * Math.max(0, s.saum || 0)];
            const t = ton * (W.art[s.art].bord ? (fahrM * W.ton.fahr + breit - fahrM) / breit : 1);
            farben.set(s.belag === "pflaster" ? [c[0] * t, c[1] * t, c[2] * t] : erde, (a + h) * 3);
            const p = s.p;
            const [ax, az, bx, bz] = [ox + p[0], oz + p[1], ox + p[p.length - 2], oz + p[p.length - 1]];
            const lang = Math.hypot(bx - ax, bz - az);
            if (!(lang > 0.5) || !this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue;
            const [ya, yb] = [this.getTerrainHeightAt(ax, az), this.getTerrainHeightAt(bx, bz)];
            if (!Number.isFinite(ya) || !Number.isFinite(yb)) continue;
            quat.setFromEuler(dreh.set(-Math.atan2(yb - ya, lang), Math.atan2(bx - ax, bz - az), 0, "YXZ"));
            mat.compose(
                pos.set((ax + bx) / 2, (ya + yb) / 2 + A.bandHubM - A.bandDickM / 2, (az + bz) / 2),
                quat,
                mass.set(breit, A.bandDickM, Math.hypot(lang, yb - ya))
            );
            ziel.set(mat.elements, o);
        }
        P.mesh.instanceColor.needsUpdate = true;
        P.mesh.instanceMatrix.needsUpdate = true;
        e.band = { a, n };
    }
    // DIE STRASSEN EINER FERNEN KACHEL (`an`: legen, sonst lösen): die Gassen ihres Netzes mit dem Belag des Gesetzbuchs
    // (fachwerk `kachelMassen` `strassen`) als Formen der Wege-Karte — der Boden malt Pflaster, die Natur-Wand hält die Linie
    // frei, was auf ihr wuchs, räumt der Takt (`_wegeRaeumen`). Eine Stadt liest sich aus der Ferne über ihr Straßennetz: bis
    // hier standen die Massen auf der Wiese. Gelöst fällt der Kasten aus dem Register, jede zentrierte Stufe malt ihn neu.
    // DIE FORM EINES STÜCKS GASSE in der Wege-Karte — nah (`_stlWegeRaten`) und fern (`_stadtFerneStrassen`) DIESELBE: die Form
    // ist die Fahrbahn (`halb`), das Pflaster deckt dazu den Gehweg als gemalten `saum`; trägt die Art des Wegs einen Bord
    // (fachwerk WEG_GESETZ.art), ist die Fahrbahn die zweite Höhe des Pflasters (`fahr`, `_wegeKarteMale`).
    static _wegStueck(B, ax, az, bx, bz, w, saum, art) {
        const A = globalThis.__fachwerkCore.WEG_GESETZ.art[art];
        if (!A) throw new Error(`Wege-Karte: eine Gasse trägt die Art „${art}", die das Weg-Gesetz nicht kennt`);
        const f = { typ: "segment", kanal: B.kanal, wert: B.wert, ax, az, bx, bz, halb: Math.max(1.2, w || 2.5) / 2 };
        if (saum > 0) f.saum = saum;
        if (A.bord && saum > 0) f.fahr = true;
        return f;
    }
    _stadtFerneStrassen(e, an) {
        const wk = this._wegeKarteEnsure();
        if (!an) {
            const box = e.box;
            e.box = null;
            const i = wk.siedlungen.indexOf(box);
            if (i < 0) return;
            wk.siedlungen.splice(i, 1);
            if (wk.raeumen.includes(box)) wk.raeumen.splice(wk.raeumen.indexOf(box), 1);
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1);
            for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeStufeMalen(stufe, null, null, box);
            this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
            return;
        }
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [], ferne: true };
        for (const s of e.strassen) {
            const belag = AnazhRealm.WEGE_KARTE.belag[s.belag];
            if (!belag)
                throw new Error(`Wege-Karte: eine ferne Gasse trägt den Belag „${s.belag}", den der Boden nicht kennt`);
            for (let j = 0; j + 3 < s.p.length; j += 2) {
                const [ax, az, bx, bz] = [e.ox + s.p[j], e.oz + s.p[j + 1], e.ox + s.p[j + 2], e.oz + s.p[j + 3]];
                if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue; // die Wasser-Wand
                const f = AnazhRealm._wegStueck(belag, ax, az, bx, bz, s.w, s.saum, s.art);
                box.formen.push(f);
                const r = AnazhRealm._wegeFormRadius(f);
                box.x0 = Math.min(box.x0, ax - r, bx - r);
                box.x1 = Math.max(box.x1, ax + r, bx + r);
                box.z0 = Math.min(box.z0, az - r, bz - r);
                box.z1 = Math.max(box.z1, az + r, bz + r);
            }
        }
        e.box = box; // auch leer gemerkt: die Kachel fragt nicht je Runde neu
        if (!box.formen.length) return;
        wk.siedlungen.push(box);
        for (const stufe of wk.stufen)
            if (stufe.zentriert) {
                for (const f of box.formen) this._wegeKarteMale(stufe, f);
                this._wegeSchichtHoch(stufe.tex, stufe.schicht);
            }
        wk.raeumen.push(box);
        this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1);
        this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
    }
    // Die Boden-Schichten EINES Settlement-Exports (Straßen · Feldwege · Platz · Äcker) in die Wege-Karte und die
    // Zäune in den Satz der Einfriedung — verankert am `origin`, je Form Wasser-bewacht (`_nassAt`; Fluss-Querungen
    // bleiben offen, die bruecken-Schicht reist unkonsumiert). `key` = Session-Gedächtnis (kein Doppel-Bau je Boot). `nurWege`:
    // ein neuer Plan desselben Orts (`_ortNeuRechnen`) — Zaun und Mauer stehen schon. Die Formen merken ihren Plan (`plan`).
    // JEDE FORM DES PLANS WIRD GEMALT (w28-stadt-grund): die Kosten binden an das Fenster jeder Stufe (der Maler malt nur, was in
    // ihm liegt, `_wegeKarteMale`), nie an eine Zahl. Bis hier hielt eine stille Kappe von 900 Formen je Plan: die Metropole von
    // stadt-voll („dorf 7 300") trägt 1 646 Gassen- und Feldweg-Stücke, gemalt wurden die ersten 900 — ihr Platz, alle 300 Vorplätze
    // und die 47 Äcker fielen ungenannt, 76,9 % des Grunds vor den Türen trug Wiese (Halme kniehoch in Gasse und Vorplatz).
    _stlWegeBuild(plan, origin, key, nurWege) {
        for (const g = this._stlWegeRaten(plan, origin, key, nurWege); ;) {
            const s = g.next();
            if (s.done) return s.value;
        }
    }
    // DER WEGE-BAU IN RATEN (w28-stadt-netz, Lehre 14): derselbe Bau als Gang — nach je `rate` Gassen eine Rate (`yield`), der
    // Rest (Flächen, Platz, Vorplätze, Zäune, Mauer) in der letzten; die Siedlung steht von der ersten Form an im Register der
    // Karte (ein Umzug des Fensters zwischen zwei Raten malt, was schon liegt). Leser: der Gang des Erlebnisses (`_dorfErlebnis`:
    // je Zug-Schritt eine Rate) und `_stlWegeBuild` (alle Raten in einem Zug — jeder andere Rufer). Bis hier legte das Erwachen
    // die Wege eines Orts in EINEM Stück: die Kachel einer Stadt trägt rund 2 000 Formen, 227–257 ms in einem Bild (GTX, 15.11.).
    *_stlWegeRaten(plan, origin, key, nurWege) {
        if (!plan || !origin || !this.state.scene) return 0;
        if (!this._stlWegeKeys) this._stlWegeKeys = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        if (key && this._stlWegeKeys.has(key)) return 0;
        if (key) this._stlWegeKeys.add(key);
        const wk = this._wegeKarteEnsure();
        let n = 0;
        // Die Siedlung merkt ihre Formen samt Hülle (der Fenster-Umzug verwirft ferne Siedlungen in O(1)).
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [], plan };
        wk.siedlungen.push(box); // von der ersten Form an im Register (leer fällt sie am Ende wieder heraus)
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
        const strasse = (pts, w, belag, saum, art) => {
            if (!Array.isArray(pts)) return;
            const B = belagVon(belag, "eine Gasse");
            for (let i = 0; i + 1 < pts.length; i++) {
                const ax = origin.x + pts[i].x;
                const az = origin.z + pts[i].z;
                const bx = origin.x + pts[i + 1].x;
                const bz = origin.z + pts[i + 1].z;
                if (!(Math.hypot(bx - ax, bz - az) > 0.01)) continue;
                if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue; // die Wasser-Wand
                form(AnazhRealm._wegStueck(B, ax, az, bx, bz, w, saum, art));
            }
        };
        let gassen = 0;
        for (const rd of plan.roads || []) {
            const Q = FC.wegQuerschnitt(plan, rd);
            strasse(rd.pts, Q.fahrM, Q.belag, Q.gehM, Q.art);
            if (++gassen % AnazhRealm.WEGE_KARTE.bauRate === 0) yield;
        }
        for (const fw of plan.feldwege || []) {
            const Q = FC.wegQuerschnitt(plan, fw, true);
            strasse(fw.pts, Q.fahrM, Q.belag, Q.gehM, Q.art);
        }
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
            // jede Zone, die einen Belag erklärt — die Fläche wie das Gehege und sein Graben (w28-gehege: bis hier malte der Maler
            // nur die Art `flaeche`; Gehege und Graben lagen unter dem Schau-Rasen des Zoos, der Graben war im Bild nicht zu lesen)
            const belag = q.art === "feld" ? "gras" : q.belag || null;
            if (!belag) return;
            const B = AnazhRealm.WEGE_KARTE.belag[belag];
            if (!B)
                throw new Error(
                    `Wege-Karte: die Fläche ${q.name} trägt den Belag „${belag}", den der Boden nicht kennt`
                );
            // DER RASEN TRÄGT DEN WUCHS DES ORTS (Reise, Welle 3: die Tafel `ortGesetz(teil).wuchs`, die Heimat 1): wo das Klima die
            // Krautschicht nicht trägt oder die Zeit keine Gräser kennt, liegt unter der Fläche der Grund des Orts (Sand, Schnee,
            // Streu) — der Rasen malt mit seinem Anteil, ohne Anteil gar nicht.
            const rasen = B.kanal === 0 && B.wert < 0;
            const WO = this._gelaende().ort.wuchs;
            const anteil = rasen ? WO.decke * WO.gras : 1;
            if (!(anteil > 0)) return;
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
                    wert: B.wert * anteil,
                    ax,
                    az,
                    bx: ax,
                    bz: az,
                    halb: 0,
                    ...(rasen ? { sperr: -Infinity } : {}),
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
        // Gesetzbuchs lebt im Boden. DER ACKER TRÄGT DEN WUCHS DES ORTS (Reise, w28-reise-ort: gelaende-core `ortKraut` ≥
        // `ORT_SIEDLUNG.naehrt`, die Heimat 1): wo der Grund an seiner Mitte die Krautschicht nicht trägt (die Wüste fern vom Wasser),
        // liegt kein Acker — in der Heimat jeder.
        const WO = this._gelaende().ort.wuchs;
        const KG = globalThis.__gelaendeCore;
        for (const fd of plan.felder || []) {
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const wx = origin.x + fd.cx;
            const wz = origin.z + fd.cz;
            if (!this._landAt(wx, wz, 0.2)) continue;
            if (WO.decke < KG.ORT_SIEDLUNG.naehrt) {
                const wy = this.getTerrainHeightAt(wx, wz);
                if (!(Number.isFinite(wy) && KG.ortKraut(WO, this._ortNass(wx, wz, wy)) >= KG.ORT_SIEDLUNG.naehrt))
                    continue;
            }
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
            // DAS REGISTER DER ÄCKER (der Körper des Ackers, `_ackerKoerperTakt`; das Verb `bestellen`, `_ackerAt`)
            (this.state.aecker || (this.state.aecker = new Map())).set(AnazhRealm._ackerSchluessel(wx, wz), {
                x: wx,
                z: wz,
                phi: fd.phi || 0,
                ex: fd.ex,
                ez: fd.ez,
            });
        }
        if (box.formen.length) {
            wk.raeumen.push(box); // was schon auf Weg, Platz und Acker wuchs, räumt der Takt (`_wegeRaeumen`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1); // die Natur-Wand kennt die neue Fläche (`_aufWeg`)
        } else wk.siedlungen.splice(wk.siedlungen.indexOf(box), 1); // ein Plan ohne Form steht nicht im Register
        for (const stufe of wk.stufen) if (stufe.zentriert) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
        // DIE ERSTE SIEDLUNG zentriert die Karte SOFORT: die Wiese über ihr wächst im selben Takt neu
        // (`_nahWieseNeuIn` → `_tickNahWiese` vor `_tickWegeKarte`) und läse vor dem Zentrieren 0 — Halme im Weg.
        const pm = this.state.playerMesh;
        if (pm && wk.stufen.some((s) => !s.zentriert)) this._tickWegeKarte(pm.position);
        if (box.x0 < box.x1) this._nahWieseNeuIn(box.x0, box.z0, box.x1, box.z1);
        if (nurWege) return n;
        // ZÄUNE (fences-Schicht): je Segment ein Zaun des Gesetzbuchs (fachwerk `zaunNetz`: Pfosten und zwei Riegel, wie im
        // Labor) im Satz der Einfriedung — bewusst KEIN Blocker, das Dorf bleibt durchlässig. Bis mauer-im-stoff stand je
        // Segment ein Brett von 0,12 × 0,85 m in einem Ton.
        const ortKey = Math.round(origin.x) + "," + Math.round(origin.z);
        let zi = -1;
        for (const fz of plan.fences || []) {
            zi++;
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
            this._einfriedungLege(
                "zaun:" + ortKey + ":" + zi,
                plan,
                FC.zaunNetz(len, (y1 - y0) / len, (Math.round(ax * 7) * 73856093) ^ (Math.round(az * 7) * 19349663)),
                (ax + bx) / 2,
                (y0 + y1) / 2,
                (az + bz) / 2,
                Math.atan2(dx, dz)
            );
            n++;
        }
        return n + this._stlMauerBuild(plan, origin);
    }
    // DIE STADTMAUER (siedlung.K2): die Mauer des Exports (fachwerk `dorfLayout` → exportSettlement `mauer`: Segmente zwischen
    // den Toren, Türme) im Satz der Einfriedung (`_einfriedungLege`: der Bau-Stoff der Welt), in Gestalt und Maßen des
    // Gesetzbuchs (fachwerk `mauerNetz` über STADTMAUER und MAUER_GESTALT — dasselbe Netz zeichnet das Labor): Wehrgang,
    // Brustwehr und Zinnen, das Zeltdach des Turms, die Pfähle der Palisade, die begrünte Krone des Walls. Der Fuß liest den
    // Boden an beiden Enden und über die Länge: die Wand reicht `STADTMAUER_FUSS_M` unter den tiefsten Punkt unter ihrer Sehne,
    // die Krone folgt dem Hang (das Stück schert: Stoß und Zinne stehen lotrecht — die starre Kiste kippte mit dem Hang); der
    // Turm steht auf seiner tiefsten Ecke. Was die Wasser-Wand nimmt, steht nicht. Die Natur weicht der Mauer wie dem Anger
    // (`kanal` −1: kein Boden-Kanal, die Natur-Wand hält die Linie frei). Bis K2 strich der Export die Mauer — die Stadt der
    // Welt stand ohne sie.
    // DIE WEHR IHRER ZEIT (mensch.macht.wehrbau#2, fachwerk `MAUER_FORM` über `mauerGestalt`): der Export trägt Form, Maße und
    // Stoff — die Palisade aus Stämmen mit hölzernen Türmen, der Steinring mit Wehrgang und Türmen, die Bastion als niedriger,
    // dicker Wall mit der Brustwehr außen und Bollwerken (je eine Raute, deren Spitze vor den Ring springt) an Stelle der Türme.
    // Bis front-stoff stand jede Epoche in EINER Wand (STADTMAUER, dick 1,6 m, hoch 5,6 m): die Stadt von 1650 trug den Ring von 1350.
    _stlMauerBuild(plan, origin) {
        const M = plan && plan.mauer;
        if (!M || !Array.isArray(M.segs) || !this.state.scene) return 0;
        const FC = globalThis.__fachwerkCore;
        if (!M.wand || !M.art)
            throw new Error("_stlMauerBuild: die Mauer trägt keine Form (fachwerk `mauerGestalt`: art, wand)");
        const [W, K, T, BW] = [M.wand, M.krone, M.turm, M.bollwerk];
        const wk = this._wegeKarteEnsure();
        const FUSS = AnazhRealm.STADTMAUER_FUSS_M;
        const ortKey = "mauer:" + Math.round(origin.x) + "," + Math.round(origin.z);
        // die Mauer merkt ihren Plan und ihre Stücke im Satz (`_stlMauerNeu`: sie wächst mit dem Ort)
        const box = {
            x0: Infinity,
            z0: Infinity,
            x1: -Infinity,
            z1: -Infinity,
            formen: [],
            mauerVon: plan,
            stuecke: [],
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
        let si = -1;
        for (const sg of M.segs) {
            si++;
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
            // +x des Stücks zeigt vom Ort weg (`aussen`): dort stehen Brustwehr und Zinnen
            const aussen = Math.cos(yaw) * (mx - origin.x) - Math.sin(yaw) * (mz - origin.z) >= 0 ? 1 : -1;
            const saat = (Math.round(mx * 7) * 73856093) ^ (Math.round(mz * 7) * 19349663);
            const stueck = { art: "wand", lang: len, fuss, steig: (y1 - y0) / len, aussen, saat };
            const sk = ortKey + ":w" + si;
            this._einfriedungLege(sk, plan, FC.mauerNetz(M, stueck), mx, my, mz, yaw);
            box.stuecke.push(sk);
            form({ typ: "segment", kanal: -1, ax, az, bx, bz, halb: Math.max(W.dick, K ? K.dick : 0) / 2 });
            n++;
        }
        // die Türme (Palisade, Steinring) oder die Bollwerke (Bastion: die Raute mit der Seite vor × √2, ihre innere Ecke am Ring)
        const breit = T ? T.breit : BW ? BW.vor * Math.SQRT2 : 0;
        const tb = BW ? BW.vor : breit / 2; // der Halbmesser, über den der Fuß den Boden liest
        let ti = -1;
        for (const t of breit > 0 && Array.isArray(M.towers) ? M.towers : []) {
            ti++;
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
            const gier = BW ? Math.atan2(t.x, t.z) + Math.PI / 4 : 0; // die Raute: eine Ecke zeigt vom Ort weg
            const tk = ortKey + ":t" + ti;
            const saat = (Math.round(x * 7) * 73856093) ^ (Math.round(z * 7) * 19349663);
            this._einfriedungLege(tk, plan, FC.mauerNetz(M, { art: "turm", fuss, saat }), x, y, z, gier);
            box.stuecke.push(tk);
            form({
                typ: "kasten",
                kanal: -1,
                ax: x,
                az: z,
                bx: x,
                bz: z,
                ex: breit / 2,
                ez: breit / 2,
                phi: gier,
                halb: 0,
            });
            n++;
        }
        if (box.formen.length) {
            wk.siedlungen.push(box); // die Natur-Wand liest die Linie (`_aufWeg`); einen Boden-Kanal malt sie nicht
            wk.raeumen.push(box); // was schon in der Linie der Mauer wuchs, räumt der Takt (`_wegeRaeumen`)
            this._grundrissFaellt(box.x0, box.z0, box.x1, box.z1);
        }
        return n;
    }

    // DER SCHLÜSSEL EINES ACKERS (das Register `state.aecker`, die Tat „bestellen"): seine Mitte auf den Meter
    static _ackerSchluessel(x, z) {
        return Math.round(x) + "," + Math.round(z);
    }
    // die Lage (u, v) eines Weltpunkts im Acker a und zurück — die Drehung seines Anstrichs (`_wegeFormAbstand`, Kasten)
    static _ackerLage(a, x, z) {
        const [c, s, dx, dz] = [Math.cos(a.phi), Math.sin(a.phi), x - a.x, z - a.z];
        return [c * dx - s * dz, s * dx + c * dz];
    }
    static _ackerWelt(a, u, v) {
        const [c, s] = [Math.cos(a.phi), Math.sin(a.phi)];
        return [a.x + c * u + s * v, a.z - s * u + c * v];
    }
    // DER ACKER UNTER (x, z): der Eintrag des Registers, dessen Rechteck den Punkt trägt, oder null; `lokal` (optional) trägt die
    // Lage im Acker (u längs ex, v längs ez — dieselbe Drehung wie sein Anstrich, der Kasten der Wege-Karte `_wegeFormAbstand`)
    _ackerAt(x, z, lokal) {
        for (const a of this.state.aecker ? this.state.aecker.values() : []) {
            const [u, v] = AnazhRealm._ackerLage(a, x, z);
            if (Math.abs(u) > a.ex || Math.abs(v) > a.ez) continue;
            if (lokal) [lokal.u, lokal.v] = [u, v];
            return a;
        }
        return null;
    }

    // DER GRUND DES ACKERS (acker-kette 2): trägt (x, z) den gemalten Acker ab der halben Deckung (`_wegeBelagAt` Kanal acker —
    // dieselben Bytes, die der Boden-Stoff als feuchte Erde zeichnet, `ACKER_KOERPER.wieseWeicht`)? Der Acker ist ein Grundriss der
    // Natur-Wand: die Nah-Wiese (`_wieseGrund`, die Ferne mit ihr) und die Nah-Streu (`_nahStreuKachel`) tragen auf ihm nichts,
    // die Würfe des Felds weichen ihm schon über `_imGrundriss` („weg"). Fällt der Acker aus der Karte, wächst beides zurück
    // (dieselbe Räumung wie jede Fläche, `_nahWieseNeuIn`). Bis hier standen 224 Büschel und 3 Pflanzen im Acker der Station.
    _ackerGrund(x, z) {
        const B = this._ackerGrundAus || (this._ackerGrundAus = {});
        this._wegeBelagAt(x, z, B);
        return B.acker >= AnazhRealm.ACKER_KOERPER.wieseWeicht;
    }

    // DAS BESTELLEN (mensch.nahrung hand S2, das Verb der Klick-Kette nach der Mühe des Grabens, kampf `tryMouseBreak`): ein Hieb
    // des Geräts, das den Boden öffnet, pflügt und sät am Acker unter dem Fadenkreuz ein Stück (`ACKER_KOERPER` stueckM × bahnM)
    // — seine Reihen laufen in der Zugrichtung (die Achse des Ackers, die dem Blick am nächsten liegt). Die Tat „bestellen"
    // trägt den Acker und die Achse; ab ihrer Stunde wächst das Stück nach dem Gesetz der Frucht (`_ackerKoerperTakt`). Ein
    // zweiter Hieb auf dasselbe Stück bestellt es nicht noch einmal.
    _ackerBestellen(target) {
        const lokal = {};
        const a = this._ackerAt(target.x, target.z, lokal);
        if (!a) return false;
        const cam = this.state.camera;
        const d = cam
            ? cam.getWorldDirection(this._ackerTmpV || (this._ackerTmpV = new THREE.Vector3()))
            : { x: 1, z: 0 };
        const [c, s] = [Math.cos(a.phi), Math.sin(a.phi)];
        const achse = Math.abs(d.x * c - d.z * s) >= Math.abs(d.x * s + d.z * c) ? 0 : 1;
        const ak = AnazhRealm._ackerSchluessel(a.x, a.z);
        const AK = AnazhRealm.ACKER_KOERPER;
        for (const q of this._tatIndex().bestellen) {
            if (q.acker === ak && q.achse === achse && Math.hypot(q.x - target.x, q.z - target.z) < AK.bahnM / 2) {
                this.log("Bestellen: dieses Stück ist bestellt.", "INFO");
                return true;
            }
        }
        this._tatSchreiben("bestellen", target.x, target.z, { acker: ak, achse });
        if (this.state.ackerKoerper) this.state.ackerKoerper.takt = null; // das Bild folgt dem Hieb, nicht dem Takt
        this.log(
            `Bestellt: ${AK.stueckM} m × ${AK.bahnM} m, ${Math.floor(AK.bahnM / globalThis.__phytoCore.ACKER_GESETZ.furche.abstandM)} Furchen gesät.`,
            "INFO"
        );
        return true;
    }

    // DER KÖRPER DES ACKERS (Meisterkarte 2 mensch.nahrung frucht S1 · hand S2; das Gesetz: phyto-core ACKER_GESETZ · ackerStand):
    // über dem gemalten Grund jedes nahen Ackers (`state.aecker`, im Kreis `ACKER_KOERPER.nahM` um das Auge) die Kämme des Pflugs
    // in Reihen aus der Erde des Ackers, auf ihnen die Halme der Frucht nach ihrer Höhe und Deckung — im Stand der Tage seit seiner Saat: der Acker des Dorfs sät zur Phase des Jahrs
    // (`ackerTage`, die EINE Uhr des Jahrs `seasonPhase`), jedes Stück, das eine Hand bestellt hat (die Tat „bestellen",
    // `_ackerBestellen`), trägt den Stand seit SEINER Stunde und seine Reihen in SEINER Zugrichtung. Gezeichnet in ZWEI Pools der
    // Kiste der Wege (`_kistenPool`: ein Stoff, je Pool ein Draw, die Farbe je Instanz) — das Prisma des Kamms, die Halme der Reihe; je Strecke
    // `segM` ein Kamm und eine Reihe auf dem gezeichneten Boden (`_bodenSichtAt`, Lehre 22: wo er noch nicht steht, wartet die
    // Strecke auf den nächsten Takt). Neu gelegt nur, wenn sich das Bild ändert (die nahen Äcker, der Stand auf `stufeTage`, die
    // Stücke): die Kosten tragen der Schirm und die Änderung, nie die Welt (Gebot 7). Bis hier lag jeder Acker als brauner
    // Anstrich im Boden: keine Furche, keine Frucht (frucht#1 GTX f68dbf09: 2 Blumen im Acker). `K.je` nennt je Acker die Zahlen
    // seines Bilds (die Leser: die Stationen der Leiter, gate:koerper-kern).
    _ackerKoerperTakt(p) {
        const st = this.state;
        if (!st.aecker || !st.aecker.size || !st.scene) return;
        const AK = AnazhRealm.ACKER_KOERPER;
        const t = this._bildZeit || 0;
        const K =
            st.ackerKoerper ||
            (st.ackerKoerper = { mesh: null, cap: 0, n: 0, takt: null, schluessel: null, fehlt: 0, je: new Map() });
        if (K.takt != null && t - K.takt < AK.taktS) return;
        K.takt = t;
        const P = globalThis.__phytoCore;
        if (!P || typeof P.ackerStand !== "function") return AnazhRealm._kernPflichtBruch("phyto:ackerStand");
        const F = P.ACKER_GESETZ.furche;
        const dorf = P.ackerTage(st.seasonPhase || 0, this._gelaende().ort.klimaHeute.jahrTage);
        const h = this._weltStunde();
        const taten = this._tatIndex().bestellen;
        const nah = [...st.aecker.values()].filter(
            (a) => Math.hypot(a.x - p.x, a.z - p.z) < AK.nahM + Math.max(a.ex, a.ez)
        );
        const stufe = (d) => Math.floor(d / AK.stufeTage);
        // die Zelle des Auges (`halmSchrittM`): der Kreis der Halme wandert mit ihm, in Schritten — nie je Bild
        const zelle = Math.round(p.x / AK.halmSchrittM) + ":" + Math.round(p.z / AK.halmSchrittM);
        let key = nah.map((a) => AnazhRealm._ackerSchluessel(a.x, a.z)).join(";") + "|" + stufe(dorf) + "|" + zelle;
        for (const q of taten) key += "," + q.acker + ":" + stufe((h - q.h) / 24);
        if (key === K.schluessel && !K.fehlt) return;
        K.schluessel = key;
        K.fehlt = 0;
        K.je.clear();
        const M = [];
        const C = [];
        const H = [];
        const HC = [];
        // DIE FURCHE IST ERDE (acker-kette 2): der Kamm trägt den Stoff des gemalten Ackers — die frisch gewendete Erde
        // (`_ackerErde`, dieselbe Farbe, die der Boden-Stoff im Kanal Acker mischt, `_wegeBodenFarbe`), je Strecke um `streuErde`
        // gestreut. Bis acker-kette 1 färbte die Frucht den Kamm (orange Dreiecke unter der Wiese).
        const erde = AnazhRealm._ackerErde();
        const nahHalm = (ax, az) => Math.hypot(ax - p.x, az - p.z) < AK.halmNahM;
        // EINE Strecke: ein Kamm von a nach b (Welt), darauf die Reihe der Frucht im Stand S (null: brach gepflügt)
        const strecke = (ax, az, bx, bz, S, z) => {
            const ya = this._bodenSichtAt(ax, az);
            const yb = this._bodenSichtAt(bx, bz);
            if (ya == null || yb == null) return void K.fehlt++;
            const [dx, dz] = [bx - ax, bz - az];
            const len = Math.hypot(dx, dz);
            const ziel = { ax, az, bx, bz, ya, yb, yaw: Math.atan2(dx, dz), pitch: -Math.atan2(yb - ya, len), len };
            // der Kamm (seine Sohle `sohleM` im Grund: die Strecke folgt der Sehne, der Boden dazwischen nicht)
            M.push([ziel, F.breiteM, F.hoeheM + AK.sohleM, -AK.sohleM]);
            const k = 1 + (AnazhRealm._ackerZahl(ax, az) - 0.5) * AK.streuErde;
            C.push(erde.map((b) => b * k));
            z.kaemme++;
            // DIE FRUCHT STEHT AUF DEM KAMM (frucht S1): die Halme der Reihe (`_ackerHalme`) auf seinem First, so hoch wie der
            // Stand des Gesetzes (`hoeheM`), so breit wie ihre Deckung (`deckung` × Abstand der Furchen), in seiner Farbe (grün im
            // Schossen, gelb zur Reife, die Stoppel fahl) — im Kreis `halmNahM` um das Auge; dahinter trägt der Kamm allein
            if (!S || !(S.deckung > 0) || !(S.hoeheM > 0) || !nahHalm(ax, az)) return;
            const lin = AnazhRealm._srgbHexLinear(S.farbe);
            const kf = 1 + (AnazhRealm._ackerZahl(bx, bz) - 0.5) * AK.streuFarbe;
            H.push([ziel, F.abstandM * S.deckung, S.hoeheM, F.hoeheM * AK.firstAnteil]);
            HC.push(lin.map((b) => b * kf));
            z.frucht++;
        };
        for (const a of nah) {
            const ak = AnazhRealm._ackerSchluessel(a.x, a.z);
            const welt = (u, v) => AnazhRealm._ackerWelt(a, u, v);
            // die Stücke der Hand an diesem Acker: ihr Rechteck in der Lage des Ackers, die Reihen längs ihrer Achse
            const stuecke = [];
            for (const q of taten) {
                if (q.acker !== ak) continue;
                const [pu, pv] = AnazhRealm._ackerLage(a, q.x, q.z);
                const [hu, hv] = q.achse ? [AK.bahnM / 2, AK.stueckM / 2] : [AK.stueckM / 2, AK.bahnM / 2];
                stuecke.push({ q, u0: pu - hu, u1: pu + hu, v0: pv - hv, v1: pv + hv });
            }
            const unter = (u, v, ab) => {
                for (let i = ab; i < stuecke.length; i++) {
                    const b = stuecke[i];
                    if (u >= b.u0 && u <= b.u1 && v >= b.v0 && v <= b.v1) return true;
                }
                return false;
            };
            const z = {
                kaemme: 0,
                frucht: 0,
                reihen: 0,
                stuecke: stuecke.length,
                achsen: [],
                dorfTage: dorf,
                hand: [],
            };
            // die Reihen eines Rechtecks [u0,u1] × [v0,v1] längs der Achse `achse` (0: u, 1: v), im Stand S; `ab` die Stücke, die
            // über ihm liegen (ein späteres Stück deckt ein früheres)
            const reihen = (u0, u1, v0, v1, achse, S, ab) => {
                const [q0, q1, l0, l1] = achse ? [u0, u1, v0, v1] : [v0, v1, u0, u1];
                const nR = Math.floor((q1 - q0) / F.abstandM);
                for (let k = 0; k < nR; k++) {
                    const q = q0 + (k + 0.5) * F.abstandM + (q1 - q0 - nR * F.abstandM) / 2;
                    z.reihen++;
                    for (let l = l0; l < l1 - 0.05; l += AK.segM) {
                        const l2 = Math.min(l1, l + AK.segM);
                        const m = (l + l2) / 2;
                        if (achse ? unter(q, m, ab) : unter(m, q, ab)) continue;
                        const [A, B] = achse ? [welt(q, l), welt(q, l2)] : [welt(l, q), welt(l2, q)];
                        strecke(A[0], A[1], B[0], B[1], S, z);
                    }
                }
            };
            reihen(-a.ex, a.ex, -a.ez, a.ez, 0, P.ackerStand(dorf), 0);
            stuecke.forEach((b, i) => {
                const tage = (h - b.q.h) / 24;
                z.hand.push({ x: b.q.x, z: b.q.z, achse: b.q.achse, tage, kaemme0: z.kaemme });
                reihen(
                    Math.max(-a.ex, b.u0),
                    Math.min(a.ex, b.u1),
                    Math.max(-a.ez, b.v0),
                    Math.min(a.ez, b.v1),
                    b.q.achse,
                    P.ackerStand(tage),
                    i + 1
                );
                z.hand[z.hand.length - 1].kaemme = z.kaemme - z.hand[z.hand.length - 1].kaemme0;
            });
            z.stand = P.ackerStand(dorf);
            K.je.set(ak, z);
        }
        // ZWEI Pools derselben Kiste (EIN Stoff, je Pool EIN Draw): die Kämme (`_ackerPrisma`) und die Halme (`_ackerHalme`)
        K.n = this._ackerPoolFuellen(K, "mesh", "cap", "siedlung-acker", AnazhRealm._ackerPrisma(), M, C);
        K.halme = this._ackerPoolFuellen(K, "halmMesh", "halmCap", "siedlung-frucht", AnazhRealm._ackerHalme(), H, HC);
    }
    // EIN Pool des Ackers (`_ackerKoerperTakt`): wächst in Zweier-Potenzen (die alte Hülle geht durch den Abschied der
    // Instanzen), je Strecke eine Instanz (Mitte auf der Sehne + `sockel`, gedreht längs der Strecke, Maß breite × höhe × Länge)
    _ackerPoolFuellen(K, feld, capFeld, name, geo, M, C) {
        const st = this.state;
        if (M.length > (K[capFeld] || 0) || !K[feld]) {
            const cap = Math.max(1024, 2 ** Math.ceil(Math.log2(Math.max(1, M.length))));
            if (K[feld]) {
                st.scene.remove(K[feld]);
                this._instanzAbschied(K[feld]);
            }
            K[feld] = this._kistenPool(name, cap, geo);
            st.scene.add(K[feld]);
            K[capFeld] = cap;
        }
        const mesh = K[feld];
        const m = this._stlWegeTmpM || (this._stlWegeTmpM = new THREE.Matrix4());
        const q = this._stlWegeTmpQ || (this._stlWegeTmpQ = new THREE.Quaternion());
        const e = this._stlWegeTmpE || (this._stlWegeTmpE = new THREE.Euler());
        const v = this._stlWegeTmpV || (this._stlWegeTmpV = new THREE.Vector3());
        const sc = this._stlWegeTmpS || (this._stlWegeTmpS = new THREE.Vector3());
        const col = this._stlWegeTmpC || (this._stlWegeTmpC = new THREE.Color());
        M.forEach(([g, breite, hoehe, sockel], i) => {
            e.set(g.pitch, g.yaw, 0, "YXZ");
            q.setFromEuler(e);
            m.compose(
                v.set((g.ax + g.bx) / 2, (g.ya + g.yb) / 2 + sockel, (g.az + g.bz) / 2),
                q,
                sc.set(breite, hoehe, g.len)
            );
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, col.setRGB(C[i][0], C[i][1], C[i][2]));
        });
        AnazhRealm._instanzZahl(mesh, M.length);
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        return M.length;
    }
    // DIE ERDE DES ACKERS (linear): die Erde der Studio-Palette (`BODEN_FARBE.dirt`, PORTAL_GROUND) frisch gewendet — die feuchte
    // Krume aus der Tiefe dunkelt ihre Albedo um `ACKER_KOERPER.erdeFeucht` (trockener Oberboden ~0,2, die frische Scholle ~0,12).
    // Leser: der Boden-Stoff im Kanal Acker (`_wegeBodenFarbe`) und die Kämme des Körpers (`_ackerKoerperTakt`) — EINE Erde. Bis
    // acker-kette 2 mischte der Boden den Acker zur nassen Wiese (`wet` 0x33402a, oliv): die Furchen lagen grün.
    static _ackerErde() {
        const k = AnazhRealm.ACKER_KOERPER.erdeFeucht;
        return AnazhRealm.BODEN_FARBE.dirt.map((c) => c * k);
    }
    // die Zahl einer Strecke in [0, 1) (rein, aus ihrer Lage: dieselbe Strecke trägt bei jedem Bau denselben Ton)
    static _ackerZahl(x, z) {
        let h = (Math.imul(Math.round(x * 10), 73856093) ^ Math.imul(Math.round(z * 10), 19349663)) >>> 0;
        h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    // DAS PRISMA DES KAMMS (die Form des Acker-Pools): Sohle y 0 (x ±0,5), First y 1 (x 0), längs z ±0,5 — zwei Flanken und zwei
    // Stirnen, Lage, Normale und UV wie die Kiste der Wege (EIN Programm)
    static _ackerPrisma() {
        if (AnazhRealm._ackerPrismaGeo) return AnazhRealm._ackerPrismaGeo;
        const pos = [];
        const nor = [];
        const uv = [];
        const dreieck = (a, b, c) => {
            const [ux, uy, uz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const [vx, vy, vz] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
            const l = Math.hypot(...n) || 1;
            for (const p of [a, b, c]) {
                pos.push(...p);
                nor.push(n[0] / l, n[1] / l, n[2] / l);
                uv.push(p[0] + 0.5, p[1]);
            }
        };
        const [L0, R0, F0, L1, R1, F1] = [
            [-0.5, 0, -0.5],
            [0.5, 0, -0.5],
            [0, 1, -0.5],
            [-0.5, 0, 0.5],
            [0.5, 0, 0.5],
            [0, 1, 0.5],
        ];
        dreieck(L0, L1, F1);
        dreieck(L0, F1, F0);
        dreieck(R0, F0, F1);
        dreieck(R0, F1, R1);
        dreieck(L0, F0, R0);
        dreieck(L1, R1, F1);
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        return (AnazhRealm._ackerPrismaGeo = g);
    }
    // DIE HALME EINER REIHE (die Form des Frucht-Pools): `ACKER_KOERPER.halm` — je Strecke `bueschel` Büschel längs z (±0,5, mit
    // Zitter), je Büschel `blaetter` Blätter, jedes ein spitzes Dreieck von der Sohle y 0 bis zur Spitze y (`spitze`…1), geneigt um
    // `neigM`, beidseitig (zwei Windungen, die Normale zum Himmel gekippt wie die Halme der Wiese). Gebaut im Maß der nominalen
    // Strecke (Abstand der Furchen × `segM`, in Metern), damit ein Blatt nach der Skala der Instanz seine Breite in Metern hält.
    static _ackerHalme() {
        if (AnazhRealm._ackerHalmGeo) return AnazhRealm._ackerHalmGeo;
        const AK = AnazhRealm.ACKER_KOERPER;
        const HA = AK.halm;
        const [sx, sz] = [globalThis.__phytoCore.ACKER_GESETZ.furche.abstandM, AK.segM];
        const pos = [];
        const nor = [];
        const uv = [];
        let s = 0x9e3779b9;
        const zuf = () => {
            s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
            s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
            return (s >>> 0) / 4294967296;
        };
        const ecke = (p, n, v) => {
            pos.push(p[0] / sx, p[1], p[2] / sz);
            nor.push(...n);
            uv.push(v[0], v[1]);
        };
        for (let b = 0; b < HA.bueschel; b++) {
            const bx = (zuf() - 0.5) * sx * 0.7;
            const bz = ((b + 0.25 + zuf() * 0.5) / HA.bueschel - 0.5) * sz;
            for (let k = 0; k < HA.blaetter; k++) {
                const th = ((k + zuf() * 0.6) / HA.blaetter) * Math.PI;
                const [ux, uz] = [Math.cos(th), Math.sin(th)];
                const ph = zuf() * Math.PI * 2;
                const nm = HA.neigM * (0.4 + zuf() * 0.6);
                const top = HA.spitze + (1 - HA.spitze) * zuf();
                const L = [bx - ux * HA.breitM, 0, bz - uz * HA.breitM];
                const R = [bx + ux * HA.breitM, 0, bz + uz * HA.breitM];
                const T = [bx + Math.cos(ph) * nm, top, bz + Math.sin(ph) * nm];
                // die Normale der Blatt-Ebene (quer zu u), zum Himmel gekippt — je Seite gespiegelt
                for (const sg of [1, -1]) {
                    const [nx, ny, nz] = [-uz * sg * HA.kipp, 1, ux * sg * HA.kipp];
                    const l = Math.hypot(nx, ny, nz);
                    const n = [nx / l, ny / l, nz / l];
                    const [a, c] = sg > 0 ? [L, R] : [R, L];
                    ecke(a, n, [0, 0]);
                    ecke(c, n, [1, 0]);
                    ecke(T, n, [0.5, 1]);
                }
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        return (AnazhRealm._ackerHalmGeo = g);
    }

    _stlWegeDispose() {
        // Mauer und Zaun gehören der alten Welt: ihre Stücke verlassen den Satz der Einfriedung
        for (const k of this.state.einfriedung ? [...this.state.einfriedung.keys()] : []) this._einfriedungFaellt(k);
        for (const feld of ["ackerKoerper"]) {
            const P = this.state[feld];
            for (const mesh of P ? [P.mesh, P.halmMesh] : [])
                if (mesh) {
                    if (mesh.parent) mesh.parent.remove(mesh);
                    this._instanzAbschied(mesh);
                }
            this.state[feld] = null;
        }
        if (this.state.aecker) this.state.aecker.clear(); // die Äcker gehören der alten Welt
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
                stufe.kronen.lava.fill(0);
                stufe.kronen.glut.fill(0);
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
    vergessen: 0.5, // was unter einem halben Tritt erholt ist, ist vergessen (`_trittZahl`, `_trittErholen`)
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
    // das Pflaster trägt zwei Höhen (w28-weg-koerper, `_wegeKarteMale`): bis `gehAnteil` des Bytes seine Deckung (Gehweg, Platz),
    // darüber die Lage zum Bord der Fahrbahn, linear über ±`fahrRandM` (die ferne Stufe: ± ihr `randMinM`)
    gehAnteil: 0.5,
    fahrRandM: 1,
    kantWeich: 0.08, // die Kante des Pflasters ist nie schärfer als dieser Anteil seiner Deckung (`_wegeBodenFarbe`)
    bauRate: 12, // der Wege-Bau eines Orts in Raten: je so viele Gassen eine Rate des Gangs (`_stlWegeRaten`, w28-stadt-netz)
    voll: 127,
    null: 127,
    belag: Object.freeze({
        weg: Object.freeze({ kanal: 0, wert: 1 }),
        gras: Object.freeze({ kanal: 0, wert: -1 }),
        pflaster: Object.freeze({ kanal: 1, wert: -1 }),
    }),
});
// DAS BILD DER GLUT (`_lavaGlutNode`): die zweite Strahlungskonstante des Planck-Gesetzes c₂ = h·c/k (m·K, CODATA 2018) und die
// dominanten Wellenlängen der Primärfarben des Bilds (nm; sRGB, IEC 61966-2-1: R x 0,64 y 0,33 · G 0,30/0,60 · B 0,15/0,06) — an
// ihnen fällt das Leuchten eines Körpers je Kanal mit seiner Temperatur.
AnazhRealm.GLUT_BILD = Object.freeze({
    c2: 1.438777e-2,
    lambdaNm: Object.freeze([611, 549, 464]),
});
// DIE KRUSTE DER LAVA (`_lavaKruste`): das Feld der Schollen (die Raum-Probe des Laub-Rands, λ ≈ 1,4 m) und der feinen Risse (die
// Kiesel-Oktave des Mikro-Reliefs, `TERRAIN_BUMP.freq2`, ihr Anteil `rissAnteil`) — beide lädt der Boden-Stoff ohnehin; der Riss
// ist offen bis |n| < `offen` · w (beim Ausbruch etwa die Hälfte der Fläche im weichen Band, σ des Felds 0,25), die Haut der
// Scholle hat `platte` der Temperatur des Innern; am Rand der Decke (Dicke unter `randDicke`) reißt nichts. Die kalte Fuge
// (|n| < `fuge`) dunkelt die Kruste auf `fugeTon`, die Schollen streuen ±`ton` im Ton, ihre Kante hebt sich um `relief` (m).
AnazhRealm.LAVA_KRUSTE = Object.freeze({
    rissAnteil: 0.2,
    offen: 0.17,
    platte: 0.62,
    randDicke: Object.freeze([0.5, 1]),
    fuge: 0.035,
    fugeTon: 0.45,
    ton: 0.25,
    relief: 0.06,
});
// DIE LAUB-STREU UNTER DEN KRONEN (`_kronenStreuNeu`, Welle 5 Boden): je Wege-Stufe eine R8-Karte im selben Fenster — `texelM` je Stufe
// (nah 1 m, fern 4 m: 512² = 256 KB je Stufe); eine Krone legt `dichte` Laubstreu bis `kern` × Kronen-Radius, weich
// fallend bis `rand` × Radius (die Krone des Studio-Baums reicht über den Schüchternheits-Radius hinaus, das Laub weht
// vor die Traufe), Kronen summieren sich (zwei überlappende decken den Grund); `kroneJeHoehe` = Kronen-Radius je Meter
// Sichthöhe für Streu-Arten ohne Kronen-Eintrag im Wald-Generator; `uploadMs` = höchstens ein Upload je Stufe in diesem
// Takt; `zelleM` = die Kante der Index-Zellen des Kronen-Registers (ein Nah-Umzug fragt ≤ 30 Zellen, ein ferner ≤ 204 —
// um den größten Laub-Rand 21 m erweitert —, nie den Bestand).
// DIE FERNE DER STADT (`_stadtFerneTakt`): bis `reichM` vom Spieler trägt eine Stadt ihre Massen (plus ihre Ringe); die Kiste
// eines Hauses reicht `sockelM` unter seinen Grund (der Hang), das Dach steht `ueberM` über die Wand; je `jeTakte` Takte EINE Kachel.
// Ihre Straßen liegen bis `strassenM` in der Wege-Karte (das Fenster der fernen Stufe reicht 1024 m), jenseits `bandAbM`
// (drei Kacheln: bis dahin liegt jede Kachel ganz im Fenster) als Band im Pool der Ferne (`_stadtFerneBand`: `bandHubM` über
// dem Grund, `bandDickM` dick, `bandSpielM` Spiel an der Grenze).
// Ein stehendes Haus der Stadt trägt bis `nahM` seinen Satz im Welt-March, dahinter seine Masse (`_stadtMasseRegt`).
AnazhRealm.STADT_FERNE = Object.freeze({
    reichM: 3000,
    strassenM: 1200,
    bandAbM: 768,
    bandSpielM: 64,
    bandHubM: 0.6,
    bandDickM: 3,
    sockelM: 2.5,
    ueberM: 0.5,
    jeTakte: 6,
    nahM: 300,
});
// DER KÖRPER DES ACKERS (`_ackerKoerperTakt`; das Maß der Furche und der Frucht trägt phyto-core ACKER_GESETZ): der Takt des
// Neulegens in Bild-Sekunden, der Kreis um das Auge, die Länge einer Strecke, die Sohle des Kamms im Grund, die Stufe des
// Stands in Tagen (darunter legt nichts neu), das Stück einer Hand (längs seiner Reihen · quer: vier Furchen) und die Streuung
// der Farbe je Reihe. acker-kette 2: `streuErde` die Streuung der Erde je Kamm; `wieseWeicht` die Deckung des gemalten Ackers, ab
// der Wiese und Nah-Streu ihm weichen (`_ackerGrund`, die halbe Deckung wie die Kante des Pflasters); die Halme der Frucht stehen
// im Kreis `halmNahM` um das Auge (er wandert in Schritten `halmSchrittM`), ihr Fuß bei `firstAnteil` der Kamm-Höhe; `halm` die
// Form einer Reihe je Strecke (`_ackerHalme`: Büschel, Blätter je Büschel, halbe Breite und Neigung des Blatts in Metern, die
// kürzeste Spitze relativ, die Kippung der Normale zum Himmel) — 60 Dreiecke je Strecke.
AnazhRealm.ACKER_KOERPER = Object.freeze({
    taktS: 0.5,
    nahM: 90,
    segM: 1.5,
    sohleM: 0.05,
    stufeTage: 3,
    stueckM: 3,
    bahnM: 1.2,
    streuFarbe: 0.16,
    streuErde: 0.12,
    erdeFeucht: 0.62,
    wieseWeicht: 0.5,
    halmNahM: 45,
    halmSchrittM: 8,
    firstAnteil: 0.8,
    halm: Object.freeze({ bueschel: 10, blaetter: 3, breitM: 0.012, neigM: 0.08, spitze: 0.65, kipp: 0.6 }),
});
AnazhRealm.LAUB_STREU = Object.freeze({
    texelM: Object.freeze([1, 4]),
    dichte: 0.6,
    kern: 1.0,
    rand: 1.7,
    kroneJeHoehe: 0.35,
    uploadMs: 250,
    zelleM: 64,
});
