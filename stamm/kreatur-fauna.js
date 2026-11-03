class AnazhRealm_kreatur_fauna {
    // ===== ATLAS · Kreatur/fauna — Vögel · Schwarm · Fische · Bestäuber — die Fauna als Funktion der Welt =====
    // DIE VÖGEL (Klang K1, tetrapoda VOGEL_GESETZ): jeder Vogel-Ruf hat einen Leib — gesehen = gehört. Je Takt die Reviere im
    // Hör-Kreis des Ohrs (klang:UMWELT.stimmen.vogel.hoerweiteM), je Revier seine Bahn auf der Uhr der Welt
    // (`spielZeit`: sie reist im Stand und im Netz — jeder Peer und jeder Reload sieht dieselben Vögel): wer singt,
    // fliegt und wird gezeichnet, wer schweigt, sitzt im Gras. `state.voegel` trägt die singenden Leiber ({x, y, z}) — die
    // EINE Quelle, die das Ohr liest (`_umweltLage`). Die Karte merkt je Zelle ihre Würfe und ihr Revier (`_vogelZelle`);
    // je Takt frischt eine Zelle Leben und Deckung nach (Pflanzen, Fällen, Pflege), ferne fallen — die Kosten hängen am
    // Hör-Kreis, nie an der Welt. Gezeichnet wird in EINEM Pool mit dem Stoff der Bau-Pools (`_kistenPool`: EIN Programm, EIN
    // Befehl), je Vogel seine Teile und zwei Flügel im Schlag. Danach der Schwarm (`_vogelSchwarmTakt`, luftwasser.K5): derselbe
    // Leib und Stoff, sein eigener Pool, fern EIN Agent.
    _vogelTakt() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !st.scene) return;
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const hw = AnazhRealm._umweltGesetz().UMWELT.stimmen.vogel.hoerweiteM;
        const welt = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
        let vk = this._vogelKarte;
        if (!vk || vk.welt !== welt)
            vk = this._vogelKarte = {
                welt,
                saat: parseInt(this._fastHash(welt + "-vogel"), 16) >>> 0,
                zellen: new Map(),
                lauf: null,
            };
        const { x: px, y: py, z: pz } = pm.position;
        const Z = V.zelleM;
        const r = Math.ceil(hw / Z);
        if (vk.zellen.size > 4 * (2 * r + 1) * (2 * r + 1)) {
            for (const [k, c] of vk.zellen)
                if (Math.abs(c.ix * Z - px) > 2 * hw || Math.abs(c.iz * Z - pz) > 2 * hw) vk.zellen.delete(k);
            vk.lauf = null;
        }
        if (vk.zellen.size) {
            let e = vk.lauf ? vk.lauf.next() : null;
            if (!e || e.done) e = (vk.lauf = vk.zellen.values()).next();
            this._vogelZelle(vk, e.value);
        }
        const wf = this._weatherFieldFor(st.weather);
        const anteil = VG.lied(this._sonnenRichtung().y, wf.rain, this._windAt(px, pz, this._bildZeit).staerke, V);
        const uhr = st.spielZeit;
        const b = this._vogelBahnAus || (this._vogelBahnAus = {});
        const voegel = st.voegel || (st.voegel = []);
        const ix0 = Math.floor(px / Z);
        const iz0 = Math.floor(pz / Z);
        let n = 0;
        for (let ix = ix0 - r; ix <= ix0 + r; ix++)
            for (let iz = iz0 - r; iz <= iz0 + r; iz++) {
                const k = ix * 1048576 + iz;
                let c = vk.zellen.get(k);
                if (!c) vk.zellen.set(k, (c = this._vogelZelle(vk, { ix, iz })));
                if (!c.revier || !VG.bahn(c.wurf, anteil, uhr, c.deckung, V, b)) continue;
                const x = c.x + b.dx;
                const y = c.y + b.h;
                const z = c.z + b.dz;
                if (!(Math.hypot(x - px, y - py, z - pz) < hw)) continue;
                const v = voegel[n] || (voegel[n] = {});
                v.x = x;
                v.y = y;
                v.z = z;
                v.gier = b.gier;
                v.schlag = b.schlag;
                n++;
            }
        voegel.length = n;
        this._vogelZeichnen(voegel, V.leib, (V.leib.teile.length + 2) * (2 * r + 1) * (2 * r + 1));
        this._vogelSchwarmTakt(this._sonnenRichtung().y, wf.rain);
    }
    // DER SCHWARM (luftwasser.K5, tetrapoda VOGEL_GESETZ.schwarm): fern EIN Agent. Je Takt die Schwarm-Zellen um das Auge
    // (sichtM): je Zelle einmal ihr Wurf (Mitte, Würfe), je frischeS ihr Revier aus der Kronen-Deckung der Mitte, je fliegendem Schwarm sein
    // ZENTRUM auf der Uhr der Welt (`schwarmZentrum`: jeder Peer und jeder Reload sieht denselben Schwarm). Jenseits von sichtM
    // oder mit der Hülle außer dem Blick (`_frustumCache`) rechnet er nur das; im Bild trägt er seine Glieder, nah (nahM) fliegen
    // sie im Verband (`_schwarmVerband`: verbandZug wie die Herde, die Separation über das Gitter). Die Kosten hängen an den
    // Gliedern im Bild, nie an der Welt. Gezeichnet über
    // `_vogelZeichnen` in EINEN Pool (Stoff und Leib der Sänger: EIN Programm, EIN Befehl). Das Zentrum ist das LEITTIER
    // (`_schwarmLeittier`, luftwasser.K2 Staffel 2): die Uhr, bis der Spieler es aufscheucht — dann flieht der Pulk mit ihm
    // und landet in der Ruhe auf einer Krone der Welt. `state.schwarm` trägt die Lage des Takts: fliegende Schwärme, Schwärme
    // und Glieder im Bild, nahe Schwärme, Paare der Separation, fliehende und sitzende Schwärme.
    _vogelSchwarmTakt(sonne, regen) {
        const st = this.state;
        const cam = st.camera;
        if (!cam) return;
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const S = V.schwarm;
        const welt = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
        let sk = this._schwarmKarte;
        if (!sk || sk.welt !== welt)
            sk = this._schwarmKarte = {
                welt,
                saat: parseInt(this._fastHash(welt + "-schwarm"), 16) >>> 0,
                zellen: new Map(),
                lagen: new Float32Array(3 * S.glieder[1]),
                gitter: {},
                zentrum: {},
                glied: {},
                kugel: new THREE.Sphere(),
                voegel: [],
            };
        const { x: ax, y: ay, z: az } = cam.position;
        const Z = S.zelleM;
        const r = Math.ceil(S.sichtM / Z);
        if (sk.zellen.size > 4 * (2 * r + 1) * (2 * r + 1))
            for (const [k, c] of sk.zellen)
                if (Math.abs(c.ix * Z - ax) > 2 * S.sichtM || Math.abs(c.iz * Z - az) > 2 * S.sichtM)
                    sk.zellen.delete(k);
        const lage = st.schwarm || (st.schwarm = {});
        Object.assign(lage, { fliegen: 0, imBild: 0, glieder: 0, nah: 0, paare: 0, flucht: 0, sitzt: 0 });
        const F = this._frustumCache;
        const f = S.form;
        const uhr = st.spielZeit;
        const zt = sk.zentrum;
        const p = sk.lagen;
        const voegel = sk.voegel;
        let n = 0;
        const ix0 = Math.floor(ax / Z);
        const iz0 = Math.floor(az / Z);
        for (let ix = ix0 - r; ix <= ix0 + r; ix++)
            for (let iz = iz0 - r; iz <= iz0 + r; iz++) {
                const k = ix * 1048576 + iz;
                let c = sk.zellen.get(k);
                if (!c) {
                    const w = (j) => VG.wurf(sk.saat, ix, iz, j);
                    c = {
                        ix,
                        iz,
                        x: (ix + w(1)) * Z,
                        z: (iz + w(2)) * Z,
                        u: w(0),
                        wurf: [w(3), w(4), w(5), w(6), w(7)],
                    };
                    sk.zellen.set(k, c);
                }
                // das Revier folgt der Deckung (Pflanzen, Fällen; die Karte der Kronen steht erst nach dem Boot): je frischeS neu
                if (!(Math.abs(uhr - c.frisch) <= S.frischeS)) {
                    c.frisch = uhr;
                    c.revier = VG.schwarmRevier(c.u, this._kronenStreuAt(c.x, c.z), V);
                }
                if (!c.revier || !VG.schwarmZentrum(c.wurf, uhr, sonne, regen, V, zt)) {
                    c.leit = null;
                    continue;
                }
                lage.fliegen++;
                // das LEITTIER trägt das Zentrum: die Uhr, bis ein Ereignis (der Spieler, die Ruhe, die Krone) es führt
                const L = this._schwarmLeittier(c, zt, uhr);
                const [x, y, z] = [L.x, L.y, L.z];
                lage.flucht += L.modus === "flieht";
                lage.sitzt += L.modus === "sitzt";
                // die Hülle: der Ball der Formation, atmend und mit Welle und Zittern (großzügig: die Längs-Achse × 1,5)
                const huelle =
                    1.5 * f[0] * S.abstandM * Math.cbrt((zt.n * S.raumJeGlied) / (4.18879 * f[0] * f[1] * f[2])) + 1;
                if (Math.hypot(x - ax, z - az) > S.sichtM + huelle) continue;
                if (F && !F.intersectsSphere(sk.kugel.set(sk.kugel.center.set(x, y, z), huelle))) continue;
                lage.imBild++;
                lage.glieder += zt.n;
                const nah = Math.hypot(x - ax, y - ay, z - az) < S.nahM + huelle;
                lage.nah += nah;
                lage.paare += this._schwarmVerband(c, zt, x, y, z, uhr, nah, voegel, n);
                for (let i = 0; i < zt.n; i++, n++) {
                    const v = voegel[n];
                    v.x = p[3 * i];
                    v.y = p[3 * i + 1];
                    v.z = p[3 * i + 2];
                }
            }
        voegel.length = n;
        this._vogelZeichnen(voegel, V.leib, (V.leib.teile.length + 2) * S.glieder[1] * 2, "vogelSchwarmPool");
    }
    // DER VERBAND DES SCHWARMS (luftwasser.K2, tetrapoda verbandZug — derselbe Zug wie die Herde): c die Zelle, zt ihr Zentrum
    // in diesem Takt an (x, y, z). Der Zustand je Glied (`c.verband`: Lage und Lauf im Kurs-Rahmen des Zentrums, quer und
    // längs) entsteht aus dem Wurf der Formation (`schwarmGlied`). Nah, je Takt der Welt-Uhr bis verband.dtMax: jedes Glied
    // wünscht seinen Kurs (`schwarmWunsch`), verbandZug zieht ihn zum Leittier (das Zentrum, leit) und zu den Gliedern
    // i + 1 + m·⌊n/k⌋ (k = maxNachbarn − 1 neben dem Leittier; VERHALTEN.herde, der Paar-Raum raumM), es fliegt ihn, die
    // Separation hält die Paare auseinander. Fern trägt das Zentrum die Formation in seinem Rahmen (gedreht mit seinem Kurs).
    // Die Höhe ist die Scheibe der Funktion, der Blick der Lauf. Das Tempo ist das des Leittiers (zt.tempo: die Flucht, der
    // Anflug). SITZT das Leittier, sitzt jedes Glied auf seinem Platz der Kuppel seiner Krone (`schwarmSitz`, die Schwingen
    // angelegt); im Anflug binnen bremsM sinkt jedes Glied mit der Nähe auf ihn. Schreibt die Lagen in die Karte (`lagen`),
    // Blick, Schlag und Sitz in voegel ab n0; liefert die Paare der Separation.
    _schwarmVerband(c, zt, x, y, z, uhr, nah, voegel, n0) {
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const S = V.schwarm;
        const sk = this._schwarmKarte;
        const [g, p, n] = [sk.glied, sk.lagen, zt.n];
        const [co, si] = [Math.cos(zt.gier), Math.sin(zt.gier)];
        const tempo = zt.tempo >= 0 ? zt.tempo : S.tempoMs;
        const leit = c.leit;
        const krone = leit && leit.krone;
        let vb = c.verband;
        if (!vb || vb.n !== n) {
            vb = c.verband = { n, lage: new Float32Array(2 * n), lauf: new Float32Array(2 * n), zeit: uhr };
            for (let i = 0; i < n; i++) {
                VG.glied(i, n, uhr, c.wurf[0], zt.gier, V, g);
                vb.lage[2 * i] = co * g.x - si * g.z;
                vb.lage[2 * i + 1] = si * g.x + co * g.z;
                vb.lauf[2 * i + 1] = tempo;
            }
        }
        const L = vb.lage;
        const U = vb.lauf;
        if (leit && leit.modus === "sitzt") {
            for (let i = 0; i < n; i++) {
                VG.sitz(i, n, krone.r, V, g);
                p[3 * i] = krone.x + g.x;
                p[3 * i + 1] = krone.y + g.y;
                p[3 * i + 2] = krone.z + g.z;
                const v = voegel[n0 + i] || (voegel[n0 + i] = {});
                [v.gier, v.schlag, v.sitzt] = [g.gier, 0, true];
                // der Rahmen dieses Takts trägt den Sitz: fliegt der Pulk auf, fliegt jedes Glied von seinem Platz
                const [rx, rz] = [p[3 * i] - x, p[3 * i + 2] - z];
                L[2 * i] = co * rx - si * rz;
                L[2 * i + 1] = si * rx + co * rz;
            }
            U.fill(0);
            Object.assign(vb, { zeit: uhr, x, z, gier: zt.gier });
            return 0;
        }
        const dt = uhr - vb.zeit;
        const fliegt = nah && dt > 0 && dt <= S.verband.dtMax;
        // der Rahmen der Lagen: das Zentrum des Vor-Takts (es fliegt) oder dieses (es trägt); Rahmen → Welt: x = c·q + s·l,
        // z = −s·q + c·l
        const [bx, bz, bg] = fliegt ? [vb.x, vb.z, vb.gier] : [x, z, zt.gier];
        const [bc, bs] = [Math.cos(bg), Math.sin(bg)];
        const W = vb.welt || (vb.welt = new Float32Array(2 * n));
        for (let i = 0; i < n; i++) {
            p[3 * i] = bx + bc * L[2 * i] + bs * L[2 * i + 1];
            p[3 * i + 2] = bz - bs * L[2 * i] + bc * L[2 * i + 1];
            W[2 * i] = bc * U[2 * i] + bs * U[2 * i + 1];
            W[2 * i + 1] = -bs * U[2 * i] + bc * U[2 * i + 1];
            VG.glied(i, n, uhr, c.wurf[0], zt.gier, V, g);
            p[3 * i + 1] = y + g.y;
            const v = voegel[n0 + i] || (voegel[n0 + i] = {});
            [v.schlag, v.sitzt] = [g.schlag, false];
        }
        let paare = 0;
        if (fliegt) {
            const K = AnazhRealm._steuerGesetz();
            const H = AnazhRealm._verhaltenGesetz().herde;
            const raum = S.raumM / 2;
            const k = Math.min(H.maxNachbarn - 1, n - 1);
            const schritt = Math.floor(n / k);
            const E = sk.eintraege || (sk.eintraege = []);
            for (let m = 0; m <= k; m++) E[m] = E[m] || { x: 0, z: 0, vx: 0, vz: 0, raum, leit: false };
            E.length = k + 1;
            Object.assign(E[0], { x, z, vx: tempo * si, vz: tempo * co, raum, leit: true });
            const N = vb.neu || (vb.neu = new Float32Array(2 * n));
            const w = sk.wunsch || (sk.wunsch = { x: 0, z: 0 });
            const zug = sk.zug || (sk.zug = { x: 0, z: 0, n: 0 });
            for (let i = 0; i < n; i++) {
                for (let m = 1; m <= k; m++) {
                    const [j, e] = [(i + 1 + (m - 1) * schritt) % n, E[m]];
                    e.x = p[3 * j];
                    e.z = p[3 * j + 2];
                    e.vx = W[2 * j];
                    e.vz = W[2 * j + 1];
                }
                VG.wunsch(i, uhr, zt.gier, V, w, tempo);
                K.verbandZug(p[3 * i], p[3 * i + 2], w.x, w.z, tempo, raum, E, H, zug);
                N[2 * i] = zug.x;
                N[2 * i + 1] = zug.z;
            }
            for (let i = 0; i < n; i++) {
                W[2 * i] = N[2 * i];
                W[2 * i + 1] = N[2 * i + 1];
                p[3 * i] += W[2 * i] * dt;
                p[3 * i + 2] += W[2 * i + 1] * dt;
            }
            paare = VG.separation(p, n, S.raumM, sk.gitter);
        }
        // DER ANFLUG: binnen bremsM vor der Krone sinkt jedes Glied mit der Nähe (smoothstep) auf seinen Platz der Kuppel
        const a = leit && leit.modus === "landet" ? 1 - Math.hypot(krone.x - x, krone.z - z) / S.leittier.bremsM : 0;
        if (a > 0) {
            const b = a * a * (3 - 2 * a);
            for (let i = 0; i < n; i++) {
                VG.sitz(i, n, krone.r, V, g);
                p[3 * i] += (krone.x + g.x - p[3 * i]) * b;
                p[3 * i + 1] += (krone.y + g.y - p[3 * i + 1]) * b;
                p[3 * i + 2] += (krone.z + g.z - p[3 * i + 2]) * b;
            }
        }
        // zurück in den Rahmen dieses Takts (Welt → Rahmen: q = c·x − s·z, l = s·x + c·z); der Blick längs des Laufs
        for (let i = 0; i < n; i++) {
            const [rx, rz] = [p[3 * i] - x, p[3 * i + 2] - z];
            L[2 * i] = co * rx - si * rz;
            L[2 * i + 1] = si * rx + co * rz;
            U[2 * i] = co * W[2 * i] - si * W[2 * i + 1];
            U[2 * i + 1] = si * W[2 * i] + co * W[2 * i + 1];
            voegel[n0 + i].gier = zt.gier + Math.atan2(U[2 * i], U[2 * i + 1]);
        }
        Object.assign(vb, { zeit: uhr, x, z, gier: zt.gier });
        return paare;
    }
    // DAS LEITTIER DES SCHWARMS (luftwasser.K2 Staffel 2, tetrapoda schwarmLeittier): c die Zelle, zt ihr Zentrum der Uhr in
    // diesem Takt. Der Zustand c.leit trägt die Ereignisse — der Spieler (sein Leib) scheucht es auf, in der Ruhe nennt der
    // Wirt die Krone (`_schwarmKrone`), eine gefällte Krone lässt es auffliegen (die Karte trägt sie nicht mehr); über
    // leittier.dtMax ohne Takt (fern, Pause, gestellte Uhr) gilt wieder die Uhr. Liefert c.leit (Welt: x, y, z, gier, tempo,
    // modus) und setzt Kurs und Tempo des Zentrums (zt.gier, zt.tempo) für den Verband.
    _schwarmLeittier(c, zt, uhr) {
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const E = V.schwarm.leittier;
        const sk = this._schwarmKarte;
        const ziel = sk.ziel || (sk.ziel = { x: 0, y: 0, z: 0, gier: 0 });
        [ziel.x, ziel.z, ziel.gier] = [c.x + zt.dx, c.z + zt.dz, zt.gier];
        const boden = this._terrainMacroSurfaceY(ziel.x, ziel.z);
        ziel.y = boden + zt.h;
        let L = c.leit;
        const dt = L ? uhr - L.zeit : 0;
        if (!L || !(dt >= 0 && dt <= E.dtMax)) L = c.leit = { modus: "zieht", krone: null };
        L.zeit = uhr;
        const wk = this.state.wegeKarte;
        if (L.krone && !(wk && wk.kronen.get(L.krone.schluessel) === L.krone.c))
            [L.modus, L.krone] = [L.modus === "sitzt" ? "kehrt" : "sucht", null];
        const s = this.state.playerMesh.position;
        const unter = L.modus === "zieht" ? boden : this._terrainMacroSurfaceY(L.x, L.z);
        VG.leittier(L, uhr, dt, s, ziel, unter, c.wurf, V);
        if (L.modus === "sucht") {
            L.krone = this._schwarmKrone(L.x, L.z, s, E.kroneSuchM, L.ruheM);
            L.modus = L.krone ? "landet" : "kehrt";
            VG.leittier(L, uhr, dt, s, ziel, unter, c.wurf, V);
        }
        [zt.gier, zt.tempo] = [L.gier, L.tempo];
        return L;
    }
    // DIE KRONE ZUM LANDEN: die nächste Krone der Kronen-Karte (`wegeKarte.kronen` über ihren Raum-Index) binnen suchM um
    // (x, z), die ruheM fern vom Spieler s steht (die Ruhe) und deren Scheitel das Bild trägt (`_kronenOben`: der Fuß des
    // Baums + seine Sichthöhe) — {schluessel, c, x, y (der Scheitel), z, r} oder null. Die Kosten hängen am Streifen der
    // Index-Zellen um den Ort, nie am Bestand, und fallen einmal je Ruhe.
    _schwarmKrone(x, z, s, suchM, ruheM) {
        const wk = this.state.wegeKarte;
        if (!wk || !wk.kronen.size) return null;
        const Z = AnazhRealm.LAUB_STREU.zelleM;
        let [best, bd] = [null, suchM];
        for (let ix = Math.floor((x - suchM) / Z); ix <= Math.floor((x + suchM) / Z); ix++)
            for (let iz = Math.floor((z - suchM) / Z); iz <= Math.floor((z + suchM) / Z); iz++) {
                const zelle = wk.kronenZellen.get(ix + "," + iz);
                if (zelle)
                    for (const [k, c] of zelle) {
                        const d = Math.hypot(c[0] - x, c[1] - z);
                        if (!(d < bd) || Math.hypot(c[0] - s.x, c[1] - s.z) < ruheM) continue;
                        const oben = this._kronenOben(c);
                        if (Number.isFinite(oben))
                            [best, bd] = [{ schluessel: k, c, x: c[0], y: oben, z: c[1], r: c[2] }, d];
                    }
            }
        return best;
    }
    // DIE ZELLE der Vogel-Karte: ihre Würfe (einmal: das Revier, die Mitte, die Bahn) und ihr Revier aus Leben und Deckung an
    // der Mitte (je Aufruf neu; die Deckung hebt auch den Singflug über das Dach); die Mitte steht auf der EINEN 2D-Höhe, im
    // Wasser wohnt keiner.
    _vogelZelle(vk, c) {
        const VG = AnazhRealm._vogelGesetz();
        if (!c.wurf) {
            const w = (k) => VG.wurf(vk.saat, c.ix, c.iz, k);
            c.x = (c.ix + w(1)) * VG.V.zelleM;
            c.z = (c.iz + w(2)) * VG.V.zelleM;
            c.y = this._terrainMacroSurfaceY(c.x, c.z);
            c.u = w(0);
            c.wurf = [w(3), w(4), w(5), w(6)];
        }
        c.deckung = this._kronenStreuAt(c.x, c.z);
        c.revier = !this._nassAt(c.x, c.z) && VG.revier(c.u, this.auraAt(c.x, c.z).lebendig, c.deckung, VG.V);
        return c;
    }
    // DER LEIB IM BILD: je Vogel seine Teile und zwei Flügel (am Schultergelenk, um die Längsachse im Schlag; sitzend angelegt) —
    // die Matrizen direkt in den Puffer des Pools (Spalten-Ordnung, Gier um y), die Farben je Platz einmal beim Bau (die
    // Teile-Folge ist je Vogel gleich). `cap` = so viele Plätze, wie der Hör-Kreis Zellen trägt; `feld` = der Pool im Stand
    // (`vogelPool` die Sänger, `vogelSchwarmPool` der Schwarm) — trägt das Bild mehr Teile als der Pool Plätze, wächst er auf das
    // Doppelte des Bedarfs (der alte fällt über `_instanzAbschied`): kein Glied fällt still aus dem Bild.
    _vogelZeichnen(voegel, L, cap, feld = "vogelPool") {
        const st = this.state;
        const je = L.teile.length + 2;
        let P = st[feld];
        if (P && voegel.length * je > P.cap) {
            st.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            P = st[feld] = null;
            cap = 2 * voegel.length * je;
        }
        if (!P) {
            // je Teil ein Doppel-Keil der Ausdehnung 1 (8 Dreiecke; das Gesetz trägt die Maße)
            const mesh = this._kistenPool("vogel", cap, new THREE.OctahedronGeometry(0.5));
            const farbe = new THREE.Color();
            for (let i = 0; i < cap; i++)
                mesh.setColorAt(i, farbe.setHex(i % je < L.teile.length ? L.teile[i % je].farbe : L.fluegel.farbe));
            mesh.instanceColor.needsUpdate = true;
            st.scene.add(mesh);
            P = st[feld] = { mesh, cap };
        }
        const A = P.mesh.instanceMatrix.array;
        let o = 0;
        // ein Teil: die Spalten e0 = (ax, ay, 0), e1 = (bx, by, 0), e2 = (0, 0, gz) und die Lage l im Leib-Raum, gedreht um die
        // Gier (c, s: x' = c·x + s·z, z' = −s·x + c·z) und an den Leib v gesetzt
        const teil = (v, c, s, ax, ay, bx, by, gz, lx, ly, lz) => {
            const k = 16 * o++;
            A[k + 3] = A[k + 7] = A[k + 9] = A[k + 11] = 0;
            A[k] = c * ax;
            A[k + 1] = ay;
            A[k + 2] = -s * ax;
            A[k + 4] = c * bx;
            A[k + 5] = by;
            A[k + 6] = -s * bx;
            A[k + 8] = s * gz;
            A[k + 10] = c * gz;
            A[k + 12] = v.x + c * lx + s * lz;
            A[k + 13] = v.y + ly;
            A[k + 14] = v.z - s * lx + c * lz;
            A[k + 15] = 1;
        };
        const F = L.fluegel;
        const [gx, gy, gz] = F.groesse;
        for (let i = 0; i < voegel.length && o + je <= P.cap; i++) {
            const v = voegel[i];
            const c = Math.cos(v.gier);
            const s = Math.sin(v.gier);
            for (const T of L.teile)
                teil(v, c, s, T.groesse[0], 0, 0, T.groesse[1], T.groesse[2], T.lage[0], T.lage[1], T.lage[2]);
            for (const seite of [1, -1]) {
                // der sitzende Vogel (der Schwarm auf seiner Krone) legt die Schwinge an den Leib: die Spannweite längs nach
                // hinten, die Tiefe hoch, an der Flanke des Rumpfs
                if (v.sitzt) {
                    const flanke = (seite * (L.teile[0].groesse[0] + gy)) / 2;
                    teil(v, c, s, gy, 0, 0, gz, gx, flanke, F.schulter[1], F.schulter[2] - gx / 2);
                    continue;
                }
                const cf = Math.cos(seite * v.schlag);
                const sf = Math.sin(seite * v.schlag);
                const h = (seite * gx) / 2;
                teil(
                    v,
                    c,
                    s,
                    gx * cf,
                    gx * sf,
                    -gy * sf,
                    gy * cf,
                    gz,
                    seite * F.schulter[0] + h * cf,
                    F.schulter[1] + h * sf,
                    F.schulter[2]
                );
            }
        }
        AnazhRealm._instanzZahl(P.mesh, o);
        if (o > 0) P.mesh.instanceMatrix.needsUpdate = true;
    }
    // DIE FISCHE (luftwasser.K3, tetrapoda FISCH_GESETZ): je Takt die Zellen binnen nahM um das Auge — je Zelle einmal ihr Stand
    // (`_fischZelle`: der Kolk aus ihren Würfen), je Stand seine Fische mit Lage, Gier und Flucht, je Takt ihr Schritt im Gesetz:
    // die Rheotaxis liest die EINE Strömung (`_waterFlowAt`) am Ort JEDES Fischs, die Flucht den Spieler. Je Takt frischt eine
    // Zelle nach (Pegel, Graben, Stau ändern den Lauf), ferne fallen — die Kosten hängen am Auge, nie an der Welt. Gezeichnet in
    // EINEM Pool (`_kleintierZeichnen`, tier:fisch).
    _fischTakt(dt) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !st.scene) return;
        const FG = AnazhRealm._fischGesetz();
        const F = FG.F;
        const welt = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
        let fk = this._fischKarte;
        if (!fk || fk.welt !== welt)
            fk = this._fischKarte = {
                welt,
                saat: parseInt(this._fastHash(welt + "-fisch"), 16) >>> 0,
                zellen: new Map(),
                fische: new Map(),
                lebt: new Set(),
                liste: [],
                lauf: null,
            };
        const { x: px, z: pz } = pm.position;
        const Z = F.zelleM;
        const r = Math.ceil(F.nahM / Z);
        if (fk.zellen.size > 4 * (2 * r + 1) * (2 * r + 1)) {
            for (const [k, c] of fk.zellen)
                if (Math.abs(c.ix * Z - px) > 2 * F.nahM || Math.abs(c.iz * Z - pz) > 2 * F.nahM) fk.zellen.delete(k);
            fk.lauf = null;
        }
        if (fk.zellen.size) {
            let e = fk.lauf ? fk.lauf.next() : null;
            if (!e || e.done) e = (fk.lauf = fk.zellen.values()).next();
            this._fischZelle(fk, e.value);
        }
        const t = st.spielZeit;
        const h = Math.min(0.25, Math.max(0, dt || 0));
        const liste = fk.liste;
        const lebt = fk.lebt;
        lebt.clear();
        const P = 6.283185307179586;
        let n = 0;
        let neu = F.zelleJeTakt;
        const ix0 = Math.floor(px / Z);
        const iz0 = Math.floor(pz / Z);
        for (let ix = ix0 - r; ix <= ix0 + r; ix++)
            for (let iz = iz0 - r; iz <= iz0 + r; iz++) {
                const k = ix * 1048576 + iz;
                let c = fk.zellen.get(k);
                if (!c) {
                    if (neu-- <= 0) continue; // die Ankunft an einem Lauf baut je Takt höchstens zelleJeTakt Zellen (Lehre 25)
                    fk.zellen.set(k, (c = this._fischZelle(fk, { ix, iz })));
                }
                const S = c.stand;
                if (!S || Math.hypot(S.x - px, S.z - pz) > F.nahM) continue;
                for (let i = 0; i < S.n; i++) {
                    const key = k * 8 + i;
                    const ph = FG.wurf(fk.saat, ix, iz, 10 + i);
                    // sein Platz im Trupp, längs und quer im Rahmen der Strömung des Stands, quer pendelnd
                    const a = (FG.wurf(fk.saat, ix, iz, 20 + i) - 0.5) * F.truppM[0];
                    const b =
                        (FG.wurf(fk.saat, ix, iz, 30 + i) - 0.5) * F.truppM[1] +
                        F.pendelM * Math.sin(P * F.pendelHz * t + ph * P);
                    const platz = { x: S.x + a * S.u.x - b * S.u.z, y: S.y, z: S.z + a * S.u.z + b * S.u.x };
                    let f = fk.fische.get(key);
                    if (!f)
                        fk.fische.set(
                            key,
                            (f = {
                                x: platz.x,
                                y: platz.y,
                                z: platz.z,
                                gier: Math.atan2(-S.u.x, -S.u.z),
                                ziel: null,
                                bis: -Infinity,
                            })
                        );
                    lebt.add(key);
                    // DIE FLUCHT: der Spieler binnen fluchtM — fort längs des Laufs, solange er binnen wegM bleibt, und ruheS danach
                    const dp = Math.hypot(f.x - px, f.z - pz);
                    if (
                        dp < F.flucht.fluchtM &&
                        !(f.ziel && Math.hypot(f.ziel.x - px, f.ziel.z - pz) >= F.flucht.fluchtM)
                    )
                        f.ziel = this._fischFluchtZiel(f, px, pz, S, FG);
                    if (dp < F.flucht.wegM) f.bis = t + F.flucht.ruheS;
                    if (f.ziel && t > f.bis && Math.hypot(platz.x - px, platz.z - pz) >= F.flucht.wegM) f.ziel = null;
                    const ziel = f.ziel || platz;
                    const eilt = !!f.ziel && Math.hypot(ziel.x - f.x, ziel.z - f.z) > 0.5;
                    const gier = FG.schritt(f, ziel, this._waterFlowAt(f.x, f.z), eilt, ph, t, h, F);
                    const v = liste[n] || (liste[n] = {});
                    v.x = f.x;
                    v.y = f.y;
                    v.z = f.z;
                    v.gier = gier;
                    n++;
                }
            }
        for (const k of fk.fische.keys()) if (!lebt.has(k)) fk.fische.delete(k);
        liste.length = n;
        this._kleintierZeichnen(liste, F.leib, "fischPool", "tier:fisch");
    }
    // DER STAND EINER FISCH-ZELLE (FISCH_GESETZ): ihr Wurf, ob dort ein Stand ist; von standWuerfe Würfen im Lauf (Strömung des
    // EINEN Lesers, nass über `_nassAt`) der Kolk (`fischStand`), seine Tiefe (tiefe der Wassersäule über dem Bett, `_koerperWasser`),
    // die Richtung des Laufs dort und die Zahl seiner Fische.
    _fischZelle(fk, c) {
        const FG = AnazhRealm._fischGesetz();
        const F = FG.F;
        const w = (k) => FG.wurf(fk.saat, c.ix, c.iz, k);
        c.stand = null;
        if (!(w(0) < F.anteil)) return c;
        const proben = [];
        const orte = [];
        for (let k = 0; k < F.standWuerfe; k++) {
            const x = (c.ix + w(1 + 2 * k)) * F.zelleM;
            const z = (c.iz + w(2 + 2 * k)) * F.zelleM;
            const s = this._waterFlowAt(x, z);
            orte.push([x, z, s]);
            proben.push(s && this._nassAt(x, z) ? Math.hypot(s.x, s.z) : null);
        }
        const i = FG.stand(proben, F);
        if (i < 0) return c;
        const [x, z, s] = orte[i];
        const m = proben[i];
        c.stand = {
            x,
            y: this._fischTiefeY(x, z, F),
            z,
            u: { x: s.x / m, z: s.z / m },
            n: F.glieder[0] + Math.floor(w(15) * (F.glieder[1] - F.glieder[0] + 1)),
        };
        return c;
    }
    _fischTiefeY(x, z, F) {
        const bett = this._voxelSurfaceY(x, z);
        const spiegel = this._koerperWasser(x, z, bett);
        return bett + F.tiefe * Math.max(0, spiegel - bett);
    }
    // Das Ziel der Flucht (`fischFlucht`) im Wasser: längs des Laufs auf der Seite des Fischs, ist es trocken die andere Seite,
    // sonst radial fort; ist keines nass, bleibt er (kein Fisch flieht an Land).
    _fischFluchtZiel(f, px, pz, S, FG) {
        const o = FG.flucht(f.x, f.z, px, pz, S.u, FG.F, {});
        const r = FG.flucht(f.x, f.z, px, pz, null, FG.F, {});
        for (const [x, z] of [
            [o.x, o.z],
            [2 * px - o.x, 2 * pz - o.z],
            [r.x, r.z],
        ])
            if (this._nassAt(x, z)) return { x, y: this._fischTiefeY(x, z, FG.F), z };
        return null;
    }
    // DIE BESTÄUBER (luftwasser.K4, tetrapoda BESTAEUBER_GESETZ): je Takt die Aktivität aus dem Feld am Auge — der Tag (Sonne),
    // der EINE Wind (`_windAt`), der Regen des Wetter-Felds — und je GEZEICHNETER Blüte (`_bestaeuberBlueten`) ihr Wurf im
    // Fenster mit dem Nektar aus der Feuchte und dem Leben am Ort (`bestaeuberBesuch`; das Leben je Kachel und Takt aus `auraAt`:
    // die Pflege-Geste zieht sie, luftwasser.K4#2), der Gast auf seiner Bahn gegen den Wind
    // (`bestaeuberBahn`). Die Kosten hängen an den Blüten im Ring der Nah-Streu, nie an der Welt; EIN Pool (tier:bestaeuber).
    _bestaeuberTakt(dt) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !st.scene) return;
        const BG = AnazhRealm._bestaeuberGesetz();
        const B = BG.B;
        const liste = this._bestaeuberListe || (this._bestaeuberListe = []);
        const o = this._bestaeuberBahnAus || (this._bestaeuberBahnAus = {});
        const t = st.spielZeit;
        const wind = this._windAt(pm.position.x, pm.position.z, this._bildZeit);
        const grund = wind.staerke * AnazhRealm.WIND_BOE.mitte * globalThis.__phytoCore.WIND_FELD.sturmMS; // der Grundwind (m/s)
        const soll = BG.aktiv(this._sonnenRichtung().y, this._weatherFieldFor(st.weather).rain, grund, B);
        // die Trägheit des Sammelflugs: die Aktivität folgt dem Feld (traegS), beim ersten Takt steht sie auf ihm
        const a0 = this._bestaeuberAktiv;
        const aktiv = (this._bestaeuberAktiv =
            a0 === undefined ? soll : a0 + (soll - a0) * Math.min(1, Math.max(0, dt || 0) / B.traegS));
        let n = 0;
        if (aktiv > 0)
            for (const e of this._bestaeuberBlueten()) {
                // das Leben des Orts je Kachel und Takt (die Pflege-Geste hebt es sofort, `auraAt` — der EINE Leser des Felds)
                const leben = e.n ? this.auraAt(e.cx, e.cz).lebendig : 0;
                for (let i = 0; i < e.n; i++) {
                    const g = BG.besuch(e.h[i], t, aktiv, e.feuchte, B, o, leben);
                    const tp = o.tp;
                    for (let j = 0; j < g; j++) {
                        const h = (e.h[i] + Math.imul(j, 0x9e3779b9)) >>> 0; // der Platz des Gasts am Kopf
                        BG.bahn(h, tp, t, wind.x, wind.z, B, o);
                        const v = liste[n] || (liste[n] = {});
                        v.x = e.p[3 * i] + o.dx;
                        v.y = e.p[3 * i + 1] + o.dy;
                        v.z = e.p[3 * i + 2] + o.dz;
                        v.gier = o.gier;
                        n++;
                    }
                }
            }
        liste.length = n;
        this._kleintierZeichnen(liste, B.leib, "bestaeuberPool", "tier:bestaeuber");
    }
    // DIE BLÜTEN, WIE DAS AUGE SIE SIEHT: die Blumen der Nah-Streu (Studio-kind flower; je Art × Gestalt × Stufe × Teil eine Senke
    // `streuNah:…`, je Kachel ein Block). Je Kachel und Gruppe EINMAL ihre Blüten — der Wurf aus der Ernte-Identität, der Scheitel
    // (die höchste Spitze ihrer Teile: Lage + Höhe der Geometrie × Skala) und die Feuchte des Felds an der Mitte der Kachel
    // (`_feuchteAt`, glatt über Meter) —, gemerkt am Block (ein neuer Block ist ein neues Objekt). Liefert [{ n, h, p, feuchte }].
    _bestaeuberBlueten() {
        const ns = this.state.nahStreu;
        const aus = this._bluetenAus || (this._bluetenAus = []);
        aus.length = 0;
        const arten = ns && this._nahStreuArten();
        if (!arten) return aus;
        if (!this._bluetenArten || this._bluetenArten.arten !== arten)
            this._bluetenArten = { arten, ids: new Set(arten.filter((a) => a.kind === "flower").map((a) => a.id)) };
        const memo = this._bluetenMemo || (this._bluetenMemo = new WeakMap());
        const gruppen = this._bluetenGruppen || (this._bluetenGruppen = new Map());
        gruppen.clear();
        for (const a of ns.senken.values()) {
            if (!this._bluetenArten.ids.has(a.preset)) continue;
            const g = a.key.slice(0, a.key.lastIndexOf(":"));
            for (const [kk, b] of a.bloecke) {
                const L = gruppen.get(g + "@" + kk);
                if (L) L.push(a, b);
                else gruppen.set(g + "@" + kk, [a, b]);
            }
        }
        for (const L of gruppen.values()) {
            let e = memo.get(L[1]);
            if (!e) {
                const n = L[1].n;
                const h = new Uint32Array(n);
                const p = new Float32Array(3 * n);
                let cx = 0;
                let cz = 0;
                for (let i = 0; i < n; i++) {
                    h[i] = parseInt(this._fastHash(L[1].ids[i]), 16) >>> 0;
                    p[3 * i] = L[1].matrizen[16 * i + 12];
                    p[3 * i + 1] = -Infinity;
                    p[3 * i + 2] = L[1].matrizen[16 * i + 14];
                    cx += p[3 * i] / n;
                    cz += p[3 * i + 2] / n;
                }
                for (let j = 0; j < L.length; j += 2) {
                    const M = L[j + 1].matrizen;
                    if (L[j + 1].n !== n) continue;
                    if (!L[j].geo.boundingBox) L[j].geo.computeBoundingBox();
                    const top = L[j].geo.boundingBox.max.y;
                    for (let i = 0; i < n; i++)
                        p[3 * i + 1] = Math.max(p[3 * i + 1], M[16 * i + 13] + top * M[16 * i + 5]);
                }
                e = { n, h, p, cx, cz, feuchte: n ? this._feuchteAt(cx, cz) : 0 };
                memo.set(L[1], e);
            }
            aus.push(e);
        }
        return aus;
    }
    // DER LEIB DER KLEINEN TIERE (Fisch, Bestäuber): je Tier EINE Instanz im Pool `feld` des Stands (`_kistenPool`: der Stoff der
    // Bau-Pools, EIN Programm, EIN Befehl), ein Doppel-Keil der Ausdehnung L.groesse um seine Lage, gedreht um die Gier (Blick +z);
    // trägt das Bild mehr Tiere als der Pool Plätze, wächst er auf das Doppelte (der alte fällt über `_instanzAbschied`).
    _kleintierZeichnen(liste, L, feld, name) {
        const st = this.state;
        let P = st[feld];
        if (P && liste.length > P.cap) {
            st.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            P = st[feld] = null;
        }
        if (!P) {
            const cap = Math.max(64, 2 * liste.length);
            const mesh = this._kistenPool(name, cap, new THREE.OctahedronGeometry(0.5));
            const farbe = new THREE.Color(L.farbe);
            for (let i = 0; i < cap; i++) mesh.setColorAt(i, farbe);
            mesh.instanceColor.needsUpdate = true;
            st.scene.add(mesh);
            P = st[feld] = { mesh, cap };
        }
        const A = P.mesh.instanceMatrix.array;
        const [gx, gy, gz] = L.groesse;
        for (let i = 0; i < liste.length; i++) {
            const v = liste[i];
            const c = Math.cos(v.gier);
            const s = Math.sin(v.gier);
            const k = 16 * i;
            A.fill(0, k, k + 16);
            A[k] = c * gx;
            A[k + 2] = -s * gx;
            A[k + 5] = gy;
            A[k + 8] = s * gz;
            A[k + 10] = c * gz;
            A[k + 12] = v.x;
            A[k + 13] = v.y;
            A[k + 14] = v.z;
            A[k + 15] = 1;
        }
        AnazhRealm._instanzZahl(P.mesh, liste.length);
        if (liste.length) P.mesh.instanceMatrix.needsUpdate = true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_fauna]);

// ===== ATLAS · Kreatur/fauna — Außen-Konstanten =====
// DER VOGEL (tetrapoda VOGEL_GESETZ + vogelWurf · vogelRevier · vogelLied · vogelBahn, Klang K1): Revier, Lied, Singflug und
// Leib — gelesen vom Vogel-Takt und vom Klang-Zensus (die Teile je Vogel); dazu der Schwarm (schwarmRevier · schwarmZentrum ·
// schwarmGlied · schwarmWunsch · schwarmLeittier · schwarmSitz · schwarmSeparation, luftwasser.K5 und K2), gelesen vom
// Schwarm-Takt. Fail-closed.
AnazhRealm._vogelGesetz = function () {
    if (AnazhRealm._vogelGesetzMemo) return AnazhRealm._vogelGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const V = k && k.VOGEL_GESETZ;
    if (
        V &&
        [V.zelleM, V.proHa, V.habitatBasis].every(Number.isFinite) &&
        V.lied &&
        V.flug &&
        V.leib &&
        V.schwarm &&
        [
            "vogelWurf",
            "vogelRevier",
            "vogelLied",
            "vogelBahn",
            "schwarmRevier",
            "schwarmZentrum",
            "schwarmGlied",
            "schwarmWunsch",
            "schwarmLeittier",
            "schwarmSitz",
            "schwarmSeparation",
        ].every((f) => typeof k[f] === "function") &&
        V.schwarm.verband &&
        V.schwarm.leittier
    ) {
        AnazhRealm._vogelGesetzMemo = Object.freeze({
            V,
            wurf: k.vogelWurf,
            revier: k.vogelRevier,
            lied: k.vogelLied,
            bahn: k.vogelBahn,
            schwarmRevier: k.schwarmRevier,
            schwarmZentrum: k.schwarmZentrum,
            glied: k.schwarmGlied,
            wunsch: k.schwarmWunsch,
            leittier: k.schwarmLeittier,
            sitz: k.schwarmSitz,
            separation: k.schwarmSeparation,
        });
        return AnazhRealm._vogelGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:VOGEL_GESETZ");
};
// DER FISCH (tetrapoda FISCH_GESETZ + fischStand · fischSchritt · fischFlucht, luftwasser.K3) und DER BESTÄUBER (BESTAEUBER_GESETZ
// + bestaeuberAktiv · bestaeuberBesuch · bestaeuberBahn, luftwasser.K4) — gelesen von ihren Takten; der Wurf ist der des Vogels.
// Fail-closed.
AnazhRealm._fischGesetz = function () {
    if (AnazhRealm._fischGesetzMemo) return AnazhRealm._fischGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const F = k && k.FISCH_GESETZ;
    if (
        F &&
        F.flucht &&
        F.leib &&
        ["vogelWurf", "fischStand", "fischSchritt", "fischFlucht"].every((f) => typeof k[f] === "function")
    )
        return (AnazhRealm._fischGesetzMemo = Object.freeze({
            F,
            wurf: k.vogelWurf,
            stand: k.fischStand,
            schritt: k.fischSchritt,
            flucht: k.fischFlucht,
        }));
    return AnazhRealm._kernPflichtBruch("tetrapoda:FISCH_GESETZ");
};
AnazhRealm._bestaeuberGesetz = function () {
    if (AnazhRealm._bestaeuberGesetzMemo) return AnazhRealm._bestaeuberGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const B = k && k.BESTAEUBER_GESETZ;
    if (
        B &&
        B.leib &&
        ["bestaeuberAktiv", "bestaeuberBesuch", "bestaeuberBahn"].every((f) => typeof k[f] === "function")
    )
        return (AnazhRealm._bestaeuberGesetzMemo = Object.freeze({
            B,
            aktiv: k.bestaeuberAktiv,
            besuch: k.bestaeuberBesuch,
            bahn: k.bestaeuberBahn,
        }));
    return AnazhRealm._kernPflichtBruch("tetrapoda:BESTAEUBER_GESETZ");
};
