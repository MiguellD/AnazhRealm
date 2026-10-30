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
        const karte = (n, kanaele, format, name) => {
            const tex = new THREE.DataArrayTexture(
                new Uint8Array(n * n * kanaele * W.stufen.length),
                n,
                n,
                W.stufen.length
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
        const wege = karte(N, 2, THREE.RGFormat, "wege-karte");
        // DIE DECKE DES BODENS (stoffe.K2#2): die Kronen-Karte trägt zwei Kanäle derselben Fläche — R die Laubstreu unter den Kronen,
        // G die Asche des Brands (`_ascheMalen`); EIN Sampler, EIN Abgriff je Stufe im Boden-Stoff.
        const streu = karte(kN, 2, THREE.RGFormat, "kronen-streu");
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
            siedlungen: [],
            raeumen: [],
            kronen: new Map(),
            kronenZellen: new Map(),
            kronenRandMax: 0,
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
        const U = AnazhRealm.UNDERGROWTH;
        const a = radius * Math.max(AnazhRealm.LAUB_STREU.rand, U.kronenSigma * Math.sqrt(U.kronenQMax));
        const reich = (R) => R.radius + R.rand + R.kachel * 1.5;
        if (
            Math.hypot(x - mitte.x, z - mitte.z) - a <
            Math.max(reich(AnazhRealm.NAH_WIESE), reich(AnazhRealm.NAH_STREU))
        )
            this._nahWieseNeuIn(x - a, z - a, x + a, z + a);
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
    // Diagonale — max(ex, ez) beschnitt die Ecken (ein um 45° gedrehtes Quadrat wurde zum Achteck).
    static _wegeFormRadius(f) {
        return f.halb + (f.typ === "kasten" ? Math.hypot(f.ex, f.ez) : 0);
    }

    // Der EINE Abstand eines Punkts zu einer Form (m, innen negativ): der gedrehte Kasten um (ax, az) mit den Halbachsen ex/ez
    // und der Drehung phi (yaw wie der alte Pool), das Segment als Kapsel um seine Mittellinie (`halb`). Leser: der Maler
    // (`_wegeKarteMale`) und die Natur-Wand (`_aufWeg`) — der Boden zeigt den Weg, wo die Natur ihm weicht. Drehung und
    // Länge merkt die Form beim ersten Ruf.
    static _wegeFormAbstand(f, px, pz) {
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

    // Die Grenze der NAH-Stufe als Bruchteil ihres Fensters (relativ zur Mitte, je Achse): zwei Texel vor dem Rand,
    // damit die bilineare Probe nie den leeren Rand-Texel liest. CPU-Leser und Boden-Shader lesen dieselbe Zahl.
    static _wegeStufeNah(N) {
        return 0.5 - 2 / N;
    }

    // Eine Form in EINE Stufe malen (nur innerhalb des Fensters, der Rand-Texel bleibt 0 — Clamp-to-Edge liest
    // außerhalb nichts). Segment: Kapsel-Abstand zur Mittellinie; Rechteck: gedrehter Kasten-Abstand. Der Rand
    // fällt über ±rand weich (smoothstep; rand = max(randM, randMinM der Stufe) — die ferne Stufe trägt 2-m-Texel,
    // ein schmaler Feldweg zerfiele dort sonst in Punkte), Kanal 0 = Erde, 1 = Acker; überlappende Formen nehmen
    // das Maximum. DIE DECKENDE FORM (`deckt`, der Grund der Häuser): in ihr liest jede bilineare Probe (Shader und
    // `_wegeFeldAt`) volle Erde — der Kasten wächst um die Spanne der Probe (je Welt-Achse ein Texel, in seinen Rahmen
    // gedreht t · (|cos φ| + |sin φ|)) und seinen weichen Rand (½ Texel der Stufe, nie der Feldweg-Boden `randMinM`): der
    // Übergang liegt ganz vor der Wand, wo die Büschel ohnehin ihre Reichweite halten (`erdbauGrund`).
    _wegeKarteMale(stufe, f) {
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
        const x0w = stufe.mitteX - S.fensterM / 2;
        const z0w = stufe.mitteZ - S.fensterM / 2;
        const ausdehnung = AnazhRealm._wegeFormRadius(f) + rand;
        const minX = Math.min(f.ax, f.bx) - ausdehnung;
        const maxX = Math.max(f.ax, f.bx) + ausdehnung;
        const minZ = Math.min(f.az, f.bz) - ausdehnung;
        const maxZ = Math.max(f.az, f.bz) + ausdehnung;
        const i0 = Math.max(1, Math.floor((minX - x0w) / t));
        const i1 = Math.min(N - 2, Math.ceil((maxX - x0w) / t));
        const j0 = Math.max(1, Math.floor((minZ - z0w) / t));
        const j1 = Math.min(N - 2, Math.ceil((maxZ - z0w) / t));
        if (i1 < i0 || j1 < j0) return;
        // Der EINE Maler hält die Leer-Marke: jede gemalte Form (Siedlung, Trittfläche, Fenster-Umzug) macht die Stufe
        // nicht-leer, der nächste Umzug lädt sie leer hoch — kein Maler kann die Marke vergessen.
        stufe.wegeLeer = false;
        const daten = stufe.daten;
        for (let j = j0; j <= j1; j++) {
            const pz = z0w + (j + 0.5) * t;
            for (let i = i0; i <= i1; i++) {
                const px = x0w + (i + 0.5) * t;
                const q = AnazhRealm._wegeFormGewicht(f, px, pz, rand);
                if (!(q > 0)) continue;
                const k = (j * N + i) * 2 + f.kanal;
                const v = Math.round(q * 255);
                if (v > daten[k]) daten[k] = v;
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
        const hydroN = this._flussKarteStand();
        for (const stufe of wk.stufen) {
            const S = stufe.S;
            if (!stufe.zentriert || Math.hypot(playerPos.x - stufe.mitteX, playerPos.z - stufe.mitteZ) >= S.umzugM) {
                stufe.fluss.hydroN = -1; // das Fenster zog um: die Flüsse neu
                const war = stufe.zentriert ? [stufe.mitteX, stufe.mitteZ] : null;
                const raster = S.texelM * 16;
                stufe.mitteX = Math.round(playerPos.x / raster) * raster;
                stufe.mitteZ = Math.round(playerPos.z / raster) * raster;
                stufe.zentriert = true;
                this._wegeStufeMalen(stufe);
                if (stufe.U) stufe.U.mitte.value.set(stufe.mitteX, stufe.mitteZ);
                this._kronenStreuUmzug(stufe, war);
            } else if (stufe.grundNeu) {
                // ein Haus legte seinen Grund (S4): die Stufe malt ihre Flächen neu (die Flüsse tragen eigene Bytes)
                this._wegeStufeMalen(stufe);
            }
            stufe.grundNeu = false;
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
    _flussKarteMalen(stufe, hydroN) {
        const fl = stufe.fluss;
        fl.daten.fill(0);
        fl.hydroN = hydroN;
        const S = stufe.S;
        const N = stufe.N;
        const t = S.texelM;
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
                const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - x0w) / t));
                const i1 = Math.min(N - 1, Math.ceil((Math.max(ax, bx) + r - x0w) / t));
                const j0 = Math.max(0, Math.floor((Math.min(az, bz) - r - z0w) / t));
                const j1 = Math.min(N - 1, Math.ceil((Math.max(az, bz) + r - z0w) / t));
                if (i1 < i0 || j1 < j0) continue;
                const ex = bx - ax;
                const ez = bz - az;
                const len2 = ex * ex + ez * ez || 1;
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
    // (`_wegeKarteMale`): was er seit dem letzten Upload malte, geht leer hoch.
    _wegeStufeMalen(stufe) {
        const S = stufe.S;
        const warLeer = stufe.wegeLeer === true;
        stufe.daten.fill(0);
        stufe.wegeLeer = true;
        const h = S.fensterM / 2 + S.randMinM + AnazhRealm.WEGE_KARTE.randM;
        for (const sd of this.state.wegeKarte.siedlungen) {
            if (sd.x1 < stufe.mitteX - h || sd.x0 > stufe.mitteX + h) continue;
            if (sd.z1 < stufe.mitteZ - h || sd.z0 > stufe.mitteZ + h) continue;
            for (const f of sd.formen) this._wegeKarteMale(stufe, f);
        }
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
                    this._wegeKarteMale(stufe, {
                        typ: "kasten",
                        kanal: 0,
                        ax,
                        az,
                        bx: ax,
                        bz: az,
                        ex,
                        ez,
                        phi,
                        halb: 0,
                        deckt: true,
                    });
                }
            }
        if (!warLeer || !stufe.wegeLeer) this._wegeSchichtHoch(stufe.tex, stufe.schicht);
    }

    // Die getretene Erde an (x, z) ∈ [0, 1] — bilinear aus DENSELBEN Bytes, die der Boden-Shader liest: die
    // NAH-Stufe innerhalb ihrer Grenze (`_wegeStufeNah`), sonst die FERN-Stufe.
    _wegeFeldAt(x, z) {
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
        const at = (a, b) => d[(b * N + a) * 2] / 255;
        return (
            (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - tz) +
            (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * tz
        );
    }

    // Die Boden-Farbe unter Kronen und Wegen (TSL): die Vertex-Farbe mischt zur Laubstreu der Kronen-Karte, zur
    // getretenen Erde (R) und zum Acker (G) der
    // Wege-Karte, in den Farben der Boden-Palette (dieselbe Pfad-Erde wie der gebackene Ufer-Pfad), nur auf
    // Begehbarem — ein Hang unter dem Weg bleibt Hang. Die Stufe wählt dieselbe Grenze wie `_wegeFeldAt`. Ohne die
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
        const _wm = _T.mix(wFern, wNah, innen).mul(imFenster);
        const _begehbar = _T.smoothstep(_T.float(0.6), _T.float(0.85), _T.normalWorldGeometry.y); // der Hang selbst, nie die Licht-Normale
        // DIE KRONEN-STREU (`_kronenStreuNeu`): unter den echten Kronen die Laubstreu der Palette (`lit`) — zuerst, die
        // Wege liegen darüber. Dieselbe Stufen-Wahl, dasselbe UV (dasselbe Fenster). Derselbe Abgriff trägt in G die Asche.
        const dNah = _T.texture(nah.kronen.tex, relNah.add(0.5)).depth(_T.int(nah.schicht));
        const dFern = _T.texture(fern.kronen.tex, relFern.add(0.5)).depth(_T.int(fern.schicht));
        const kNah = dNah.r;
        const kFern = dFern.r;
        // Der Rand ist keine Scheibe: das Laub liegt in Zungen und Flecken (Rauschen λ ≈ 1,4 m verschiebt die Kante).
        const _laubRausch = this._rauschAtlas()
            .raum(_T.vec3(xz.x.mul(0.7), xz.y.mul(0.7), _T.float(3.3)))
            .mul(0.3);
        const _k = _T
            .smoothstep(_T.float(0.15), _T.float(0.85), _T.mix(kFern, kNah, innen).add(_laubRausch))
            .mul(_begehbar)
            .mul(imFenster)
            .mul(_T.float(1).sub(this._fernKroneOhneWald(_T)));
        const l = P.lit;
        // Unter der Krone liegt die Streu — ihre Albedo, nie ein Schatten: das Labor dunkelt seinen Bestandeskern
        // (`c.multiplyScalar(0.58 + 0.46 · Licht)` in worlds/terrain), die Welt hat die echte Schattenkarte der Kronen
        // (Lehre 21: nie doppelt; bis 06.10. lag die Streu so bei Y 0,065 unter dem Soll 0,08–0,15).
        const mitStreu = _T.mix(vc, _T.vec3(l[0], l[1], l[2]), _k);
        // DIE ASCHE DES BRANDS (stoffe.K2#2, `_ascheMalen`): wo die Front ein Bett verzehrte, liegt die Asche der Palette über
        // Wiese und Streu, bis sie nachgrünt (`_sukzession`) — nur auf Begehbarem (die Wand des Hangs trug kein Bett). Dieselben
        // Bytes liest die Nah-Wiese (`_ascheAt`): auf der Asche steht kein Halm.
        const s = P.asche;
        const _a = _T.mix(dFern.g, dNah.g, innen).mul(_begehbar).mul(imFenster);
        const mitAsche = _T.mix(mitStreu, _T.vec3(s[0], s[1], s[2]), _a);
        const e = P.dirt;
        const a = P.wet;
        const mitErde = _T.mix(mitAsche, _T.vec3(e[0], e[1], e[2]), _wm.r.mul(_begehbar));
        return _T.mix(mitErde, _T.vec3(a[0], a[1], a[2]), _wm.g.mul(_begehbar));
    }

    // DAS EINE PFAD-FELD der Wiese: der getrampelte Ufer-Pfad (Drainage, im Boden gebacken) ODER der Siedlungs-Weg
    // (die Wege-Karte) — wo einer liegt, wächst kein Halm.
    _pfadFeldAt(x, z, surfY) {
        const a = this._pathFieldAt(x, z, surfY);
        const b = this._wegeFeldAt(x, z);
        return a > b ? a : b;
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
    _nahWieseNeuIn(x0, z0, x1, z1) {
        this._weltRegt(); // die Kacheln fallen: die Stand-Wache weckt Wiese und Streu
        let n = 0;
        const imRechteck = (key, K) => {
            const [tx, tz] = key.split(",").map(Number);
            return !((tx + 1) * K < x0 || tx * K > x1 || (tz + 1) * K < z0 || tz * K > z1);
        };
        // Die Wiese-Kachel trägt nur Daten (der Sicht-Satz legt sich neu), die Streu-Kachel tritt aus ihren Senken aus. Die
        // Kacheln fallen HIER, unter dem Weckruf oben (kein Rückruf: die Schreiber-Wand deckt nur den eigenen Pfad).
        const nw = this.state.nahWiese;
        if (nw)
            for (const key of [...nw.kacheln.keys()])
                if (imRechteck(key, AnazhRealm.NAH_WIESE.kachel) && this._nahWieseKachelFaellt(key)) n++;
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
    _stlWegeBuild(plan, origin, key, nurWege) {
        if (!plan || !origin || !this.state.scene) return 0;
        if (!this._stlWegeKeys) this._stlWegeKeys = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        if (key && this._stlWegeKeys.has(key)) return 0;
        if (key) this._stlWegeKeys.add(key);
        const wk = this._wegeKarteEnsure();
        // KEINE KAPPE (w4-stadt-orte): jede Fläche des Plans trägt ihren Boden und ihre Natur-Wand — die Zahl der Formen begrenzt das
        // Gesetz des Exports (GROESSE_WAND). Bis hier fiel ab 900 Formen je Siedlung jede weitere still: die Metropole „dorf 7 300“
        // trägt 1 725 — 232 Straßen-Stücke, alle 230 Feldweg-Stücke, der Markt, 307 Vorplätze und 55 Äcker standen ohne Boden, und die
        // Natur wuchs auf ihnen (die Großstadt „dorf 7 120“: 21 Äcker).
        let n = 0;
        // Die Siedlung merkt ihre Formen samt Hülle (der Fenster-Umzug verwirft ferne Siedlungen in O(1)).
        const box = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity, formen: [], plan };
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
        const strasse = (pts, w) => {
            if (!Array.isArray(pts)) return;
            for (let i = 0; i + 1 < pts.length; i++) {
                const ax = origin.x + pts[i].x;
                const az = origin.z + pts[i].z;
                const bx = origin.x + pts[i + 1].x;
                const bz = origin.z + pts[i + 1].z;
                if (!(Math.hypot(bx - ax, bz - az) > 0.01)) continue;
                if (!this._landAt((ax + bx) / 2, (az + bz) / 2, 0.2)) continue; // die Wasser-Wand
                form({ typ: "segment", kanal: 0, ax, az, bx, bz, halb: Math.max(1.2, w || 2.5) / 2 });
            }
        };
        for (const rd of plan.roads || []) strasse(rd.pts, rd.w);
        for (const fw of plan.feldwege || []) strasse(fw.pts, fw.w);
        // Der PLATZ (Anger/Markt) — ein gedrehtes Erd-Rechteck; ein Gras-Anger bleibt Wiese: er malt keinen Boden-Kanal
        // (`kanal` −1), und die Natur-Wand hält sein Inneres frei wie das Gesetzbuch des Dorfs (fachwerk-core: kein Baum
        // tiefer als 1 m im Anger, `sperr` −1 statt des Stamm-Rands).
        const pz = plan.platz;
        if (pz && Number.isFinite(pz.cx) && Number.isFinite(pz.ex)) {
            const wx = origin.x + pz.cx;
            const wz = origin.z + pz.cz;
            const anger = pz.typ === "gras";
            if (this._landAt(wx, wz, 0.2))
                form({
                    typ: "kasten",
                    kanal: anger ? -1 : 0,
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
        const FC = globalThis.__fachwerkCore;
        const kasten = (vp) => {
            if (!vp || !this._landAt(vp.cx, vp.cz, 0.2)) return;
            form({
                typ: "kasten",
                kanal: 0,
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
                kasten({
                    cx: b.cx - (sn * RW) / 2,
                    cz: b.cz - (cs * RW) / 2,
                    phi: b.phi,
                    ex: b.ex + RW,
                    ez: b.ez + 1.5 * RW,
                });
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
        // DIE ORTE MIT ROLLE (w4-stadt-orte, fachwerk `ORTE_GESETZ`): ihre Fläche (`ortFlaechen`: der Rundkurs samt Sturzraum, das
        // Gehege samt Umgang und dem Streifen der Sicht) ist ein Kasten ohne Boden-Kanal — die Natur-Wand hält ihn frei wie den Anger
        // (`_aufWeg`), die Wiese wächst —, die Bahn des Rundkurses ein Weg (zwei Geraden, je Kurve 18 Stücke). Jede Form trägt die
        // Rolle ihres Orts (`rolle`): die Würfe des Felds lesen sie (`_ortRolleAt`).
        for (const o of plan.orte || []) {
            for (const f of FC.ortFlaechen(o, 0)) {
                const wx = origin.x + f.cx;
                const wz = origin.z + f.cz;
                form({
                    typ: "kasten",
                    kanal: -1,
                    ax: wx,
                    az: wz,
                    bx: wx,
                    bz: wz,
                    ex: f.ex,
                    ez: f.ez,
                    phi: f.phi,
                    halb: 0,
                    rolle: o.rolle,
                });
            }
            if (o.rolle !== "rundkurs") continue;
            for (let i = 0; i + 1 < o.bahn.length; i++)
                form({
                    typ: "segment",
                    kanal: 0,
                    ax: origin.x + o.bahn[i].x,
                    az: origin.z + o.bahn[i].z,
                    bx: origin.x + o.bahn[i + 1].x,
                    bz: origin.z + o.bahn[i + 1].z,
                    halb: o.breite / 2,
                    rolle: o.rolle,
                });
        }
        if (box.formen.length) {
            wk.siedlungen.push(box);
            wk.raeumen.push(box); // was schon auf Weg, Platz und Acker wuchs, räumt der Takt (`_wegeRaeumen`)
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
        // DER ZAUN DES GEHEGES (w4-stadt-orte): je Feld (`zaun`, fachwerk ORTE_GESETZ.gehege.zaunM lang) ein Pfosten an seinem Anfang
        // (`zaunHoch` hoch) und zwei Holme (auf 0,4 und 0,9 der Höhe) aus dem Pool des Hof-Zauns — ein Zaun, durch den die Aussicht
        // die Herde sieht (die Herde hält er im Takt der Tiere, `_kreaturHuellenKontakt`); die Lücke ist das Tor zur Aussicht
        for (const o of plan.orte || []) {
            if (o.rolle !== "gehege") continue;
            const ZH = FC.ORTE_GESETZ.gehege.zaunHoch;
            for (const fz of o.zaun) {
                const ax = origin.x + fz.x0;
                const az = origin.z + fz.z0;
                const bx = origin.x + fz.x1;
                const bz = origin.z + fz.z1;
                const len = Math.hypot(bx - ax, bz - az);
                const y0 = this.getTerrainHeightAt(ax, az);
                const y1 = this.getTerrainHeightAt(bx, bz);
                if (!(len > 0.4) || !Number.isFinite(y0) || !Number.isFinite(y1)) continue;
                const yaw = Math.atan2(bx - ax, bz - az);
                this._stlZaunAddStrip(ax, y0 + ZH / 2, az, yaw, 0, 0.14, ZH, 0.14, 0x5a4028);
                for (const hoch of [0.4, 0.9])
                    this._stlZaunAddStrip(
                        (ax + bx) / 2,
                        (y0 + y1) / 2 + ZH * hoch,
                        (az + bz) / 2,
                        yaw,
                        -Math.atan2(y1 - y0, len),
                        0.07,
                        0.1,
                        len,
                        0x6a4e32
                    );
                n += 3;
            }
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

    _stlWegeDispose() {
        for (const feld of ["stlZaun", "stlMauer"]) {
            const P = this.state[feld];
            if (P && P.mesh) {
                if (P.mesh.parent) P.mesh.parent.remove(P.mesh);
                this._instanzAbschied(P.mesh);
            }
            this.state[feld] = null;
        }
        // die Gehege der alten Welt setzen keine Herde mehr (`_gehegeHerden`; der Erlebnis-Gang der neuen meldet ihre)
        if (this._gehegeOrte) this._gehegeOrte.clear();
        // Die Wege-Karte leert sich (die Formen und die Kronen gehören der alten Welt; die neue pflanzt neu); die
        // Texturen bleiben (kein Re-Compile).
        const wk = this.state.wegeKarte;
        if (wk) {
            wk.siedlungen.length = 0;
            wk.kronen.clear();
            wk.kronenZellen.clear();
            wk.kronenRandMax = 0;
            for (const stufe of wk.stufen) {
                stufe.daten.fill(0);
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
AnazhRealm.WEGE_KARTE = Object.freeze({
    stufen: Object.freeze([
        Object.freeze({ name: "nah", fensterM: 512, texelM: 0.5, umzugM: 48, randMinM: 0 }),
        Object.freeze({ name: "fern", fensterM: 2048, texelM: 2, umzugM: 256, randMinM: 2 }),
    ]),
    randM: 0.6,
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
