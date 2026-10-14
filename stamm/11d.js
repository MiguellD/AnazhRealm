class AnazhRealm_Z11d {
    // ===== ATLAS §11d · VOXEL-MESHER/WASSER — Block Dienst =====
    // ═══ DER EINE WELT-MARCH: Atlas + Feld-Liste ═══
    // Der Atlas allokiert in EINHEITEN (32³) und BLÖCKEN (2×2×2 Einheiten = 64³): ein Feld zahlt eine
    // Einheit, Region-/Bau-Felder einen Block — nichts verschwendet. Layout der Liste: s. LISTE v2.

    // Bake-Garantie (über Budget WENIG, nie NULL): verhungern die Bakes am Frame-Budget, erwacht die
    // reine Form auf lahmem Holz nie (dauerhaft `_frameOverBudget`). Der Takt zielt auf eine Rate je
    // echter Sekunde (Wanduhr, nie Framerate); Kopfraum erlaubt mehr. Danach memoisiert = 0.
    // Takt-Garantie der Mesh-Zone über Budget: ein Mesh-Bau je 250 ms (bei Kopfraum trägt das Budget).
    _handBauErlaubt(budget) {
        if (budget > 0) return false;
        const jetzt = typeof performance !== "undefined" ? performance.now() : Date.now();
        if (this._handBauNaechster !== undefined && jetzt < this._handBauNaechster) return false;
        this._handBauNaechster = jetzt + 250;
        return true;
    }

    // DER EINE FELD-BAKE-TAKT, NAH ZUERST ÜBER ALLE VERBRAUCHER (Bau · Streu-Gesetz · Region-Ziegel · Kreatur-Fern-Fit):
    // je Sekunden-Fenster höchstens 16 Fits (über Budget 4). In der ERSTEN Fenster-Hälfte wartet, wer weiter weg ist
    // als der NÄCHSTE, den der Takt im Vor-Fenster abweisen musste — die Näheren fragen je Frame und sind dann bedient;
    // was in der zweiten Hälfte übrig ist, bekommt, wer fragt (die Ziegel-Schlange fragt nach Distanz). Vorher bekam,
    // wer im Frame zuerst fragte; und eine Schwelle über das GANZE Fenster ließ das übrige Budget liegen und die Fernen
    // verhungern (gemessen 03.10., gate:arch-feld mit echter Distanz: 415 Freigaben in 1 000 Takten, die Eiche in
    // 154 m nie). `d2` = Distanz² zum Spieler (ohne Angabe: vorne).
    _weltBakeErlaubt(d2) {
        const D = Number.isFinite(d2) ? d2 : 0;
        const jetzt = typeof performance !== "undefined" ? performance.now() : Date.now();
        if (this._weltBakeFenster === undefined || jetzt - this._weltBakeFenster > 1000) {
            this._weltBakeFenster = jetzt;
            this._weltBakeN = 0;
            this._weltBakeVorrang = Number.isFinite(this._weltBakeHunger) ? this._weltBakeHunger : Infinity;
            this._weltBakeHunger = Infinity;
        }
        const max = this.state._frameOverBudget ? 4 : 16; // Bakes je Sekunde
        const vorrang = jetzt - this._weltBakeFenster < 500 && D > this._weltBakeVorrang;
        if (this._weltBakeN >= max || vorrang) {
            if (!(D >= this._weltBakeHunger)) this._weltBakeHunger = D;
            return false;
        }
        this._weltBakeN++;
        return true;
    }

    // Distanz² eines Welt-Punkts zum Spieler (für den Bake-Takt; ohne Spieler: vorne).
    _spielerD2(x, z) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return 0;
        const dx = x - pm.x,
            dz = z - pm.z;
        return dx * dx + dz * dz;
    }
    // Die Takt-Distanz eines Baus: der Schlangen-Rang (`_ziegelD2`, gebaute Meshes backen nur vor) oder seine Lage.
    _archZiegelD2(entry) {
        if (Number.isFinite(entry._ziegelD2)) return entry._ziegelD2;
        const p = entry.position || { x: 0, z: 0 };
        return this._spielerD2(p.x || 0, p.z || 0);
    }

    _weltMarchEnsure() {
        const st = this.state;
        if (st.weltMarch) return st.weltMarch;
        // KEIN Renderer-Gate: der Feld-Pass (gate:fern-ring fährt einen EIGENEN
        // Probe-Renderer neben dem Null-Renderer) braucht die Bindings; im
        // headless Playtest ruft niemand hierher (alle Konsumenten sind gewallt). Der Satz ist Pflicht (K22).
        const W = AnazhRealm.WELT_MARCH;
        // LISTE v2, 8 Texel je Feld: [wAABB.min|d] [wAABB.max|einheit] [inv r0] [inv r1] [inv r2]
        // [lokalMin|0] [lokalGroesse|0] [frei]. Die inverse Welt-Matrix trägt Rotation + Animation, die
        // Welt-AABB ist der billige Vortest, die lokale Box das Brick-Zuhause. 2D-Layout: 512 Felder × 8 =
        // 4096 breit (eine 16384-Zeile läge über dem garantierten WebGPU-Limit 8192).
        const listeDaten = new Float32Array(W.felder * 8 * 4);
        const liste = new THREE.DataTexture(
            listeDaten,
            W.spalten * 8,
            W.felder / W.spalten,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        liste.name = "welt-march-liste";
        liste.minFilter = THREE.NearestFilter;
        liste.magFilter = THREE.NearestFilter;
        liste.needsUpdate = true;
        // Kapsel-Liste (analytische Primitive): 2 Texel je Kapsel [A.xyz|radius][B.xyz|farbePacked], im
        // Glied-Raum sphere-getract, digitalisiert nur am Schirm. Ein Eintrag markiert sich mit
        // d = −anzahl (texel0.w), texel1.w = Kapsel-Texel-Offset. ~1 KB je Gattung statt MB-Bricks.
        const kapselDaten = new Float32Array(W.kapseln * 2 * 4);
        const kapseln = new THREE.DataTexture(
            kapselDaten,
            W.kapselZeile,
            (W.kapseln * 2) / W.kapselZeile,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        kapseln.name = "welt-march-kapseln";
        kapseln.minFilter = THREE.NearestFilter;
        kapseln.magFilter = THREE.NearestFilter;
        kapseln.needsUpdate = true;
        st.weltMarch = {
            liste,
            listeDaten,
            handles: new Array(W.felder).fill(null), // Slot → Handle
            kapseln,
            kapselDaten,
            kapselCursor: 0, // Bump-Allokator (Mehr-Kapsel-Sätze brauchen ZUSAMMENHÄNGENDE Slots)
            freiKapselSeg: new Map(), // anzahl → [offsets] (freigewordene Segmente je Länge)
            kapselVoll: false, // eine Allokation scheiterte an der Kapazität — bis ein Segment frei wird, fittet niemand
            kapselCache: new Map(), // DEDUP: key → geteilter Kapsel-Satz (Pseudo-Brick, refs)
            gesetzKacheln: new Map(), // DAS VERTEILUNGS-GESETZ: kachelKey → [Gesetz-Blöcke der Klein-Streu]
            gesetzBloecke: 0, // lebende Gesetz-Blöcke (die Kapazitäts-Linse zählt mit)
            gesetzPlaetze: 0, // belegte Plätze über alle Blöcke (Instanz-Wahrheit der Klein-Streu)
            schwund: new Set(), // Handles, deren Satz gerade ausdithert (_weltFeldAktiv aus → _weltSchwundTakt)
            freiFelder: Array.from({ length: W.felder }, (_x, i) => W.felder - 1 - i), // pop() vergibt 0 zuerst — die Obergrenze bleibt eng
            belegt: 0, // Feld-EINTRÄGE (Instanzen)
            obergrenze: 0, // höchster belegter Feld-Index + 1 (× gesetzBlock = die Stellvertreter des March-Draws)
        };
        return st.weltMarch;
    }

    // ── DIE BILLIGE SEITE: ein FELD-EINTRAG (EIN Listen-Slot) zeigt auf ein
    // Brick. matrixWorld gegeben → platziert/animiert (Matrix der Matrix);
    // sonst Identität (statischer Welt-Raum-Satz == lokale Box, z. B. ein Gesetz-Block).
    // DAS EINBLENDEN (Integration 05.10.): `einblenden` = der Träger zeigte nie ein Mesh (ein fern gespawntes Tier, ein fern
    // entstandener Bau) — die Geburt dithert über `WELT_SCHWUND_MS` ein (Texel 5.w von 1 nach 0, dieselbe IGN-Blende wie
    // der Schwund), statt im selben Frame zu erscheinen. Der Nebel verdeckte solche Geburten bis V18.530; die Luft trägt
    // Kilometer, ein Satz ploppte sichtbar. Ohne gezeichneten Feld-Pass erscheint er sofort.
    _weltFeldEintrag(brick, matrixWorld, einblenden) {
        const wm = this.state.weltMarch;
        if (!wm || !brick) return null;
        if (wm.freiFelder.length === 0) {
            if (!this._weltFelderVollWarn) {
                this._weltFelderVollWarn = true;
                this.log("WELT-MARCH: Feld-Liste voll — kein weiterer Eintrag (das Feld FEHLT sichtbar)", "WARN");
            }
            return null;
        }
        const feld = wm.freiFelder.pop();
        if (feld + 1 > wm.obergrenze) wm.obergrenze = feld + 1;
        const L = wm.listeDaten;
        const o = feld * 32; // 8 Texel × 4 Floats
        const lm = brick.lokalMin;
        const lg = brick.lokalGroesse;
        L[o + 3] = brick.d; // d < 0 = Analog-Satz (−Anzahl der Primitive), 0 = leer
        L[o + 7] = brick.einheit; // erster Texel des Satzes in der Kapsel-Liste
        L[o + 20] = lm.x;
        L[o + 21] = lm.y;
        L[o + 22] = lm.z;
        L[o + 23] = 0; // lokale Box min
        L[o + 24] = lg.x;
        L[o + 25] = lg.y;
        L[o + 26] = lg.z;
        L[o + 27] = 0; // lokale Box Größe
        const handle = { feld, brick, _anT: performance.now() };
        const fpE = this.state.feldPass;
        if (einblenden === true && fpE && fpE.mesh && fpE.mesh.visible) {
            handle._einT0 = handle._anT;
            L[o + 23] = 1; // erst ganz verworfen, der Schwund-Takt löst ihn ein
            wm.schwund.add(handle);
        }
        wm.handles[feld] = handle;
        if (matrixWorld) {
            this._weltFeldMatrix(handle, matrixWorld); // inv + Welt-AABB aus der Matrix
        } else {
            // Identität: Welt-AABB == lokale Box (statischer Welt-Raum-Satz)
            L[o] = lm.x;
            L[o + 1] = lm.y;
            L[o + 2] = lm.z;
            L[o + 4] = lm.x + lg.x;
            L[o + 5] = lm.y + lg.y;
            L[o + 6] = lm.z + lg.z;
            L[o + 8] = 1;
            L[o + 9] = 0;
            L[o + 10] = 0;
            L[o + 11] = 0;
            L[o + 12] = 0;
            L[o + 13] = 1;
            L[o + 14] = 0;
            L[o + 15] = 0;
            L[o + 16] = 0;
            L[o + 17] = 0;
            L[o + 18] = 1;
            L[o + 19] = 0;
        }
        wm.liste.needsUpdate = true;
        wm.belegt++;
        return handle;
    }

    // ═══ DIE KAPSEL-BAHN ═══
    // Eine Kapsel (A→B, Radius, Farbe) je Vorlage, am Schirm per Sphere-Tracing digitalisiert (exakte
    // SDF-Normale); Dedup über kapselCache/refs. Der Eintrag ist ein Pseudo-Brick (d = −anzahl, einheit
    // = Kapsel-Texel-Offset), _weltFeldEintrag/_weltFeldMatrix/_weltFeldAktiv/_weltFeldFrei tragen ihn
    // unverändert. kapselFn liefert EINEN Satz {a, b, r, farbe} (Kugel: a == b), zusammenhängend
    // (Shader liest po + k·2); Bump-Allokator + Segment-Freiliste je Länge.
    _weltKapselHolen(key, kapselFn) {
        const wm = this._weltMarchEnsure();
        if (!wm) return null;
        let k = wm.kapselCache.get(key);
        if (k) {
            k.refs++;
            return k;
        }
        // DIE VOLLE LISTE FITTET NICHT: scheiterte eine Allokation an der Kapazität, rechnet bis zum nächsten freien
        // Segment (`_weltBrickFrei`) niemand einen Fit, der nie landet — vorher passte jede wartende Gesetz-Zelle je
        // Tick-Durchlauf ihre Steine neu (bis 16 Teile) und gab den Platz wieder auf.
        if (wm.kapselVoll) return null;
        let defs = kapselFn();
        if (defs && !Array.isArray(defs)) defs = [defs];
        defs = (defs || []).filter(
            (d2) => d2 && (d2.box || d2.ellipsoid || d2.prism ? d2.c && d2.h : d2.a && d2.b && Number.isFinite(d2.r))
        );
        if (!defs.length) return null;
        const W = AnazhRealm.WELT_MARCH;
        const seg = wm.freiKapselSeg.get(defs.length);
        let slot = seg && seg.length ? seg.pop() : -1;
        if (slot < 0) {
            if (wm.kapselCursor + defs.length > W.kapseln) {
                wm.kapselVoll = true;
                if (!this._weltKapselnVollWarn) {
                    this._weltKapselnVollWarn = true;
                    this.log(
                        "KAPSEL-LISTE ERSCHÖPFT: kein Platz für einen Analog-Satz — das Feld FEHLT sichtbar",
                        "WARN"
                    );
                }
                return null;
            }
            slot = wm.kapselCursor;
            wm.kapselCursor += defs.length;
        }
        const K = wm.kapselDaten;
        const lokalMin = new THREE.Vector3(Infinity, Infinity, Infinity);
        const lokalMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];
            const o = (slot + i) * 8; // 2 Texel × 4 Floats
            const f = def.farbe || { r: 0.55, g: 0.5, b: 0.45 };
            // Farbe als 24-bit-Pack im f32 (exakt bis 2^24 — die Mantisse trägt es):
            const pack =
                (Math.min(255, Math.max(0, Math.round(f.r * 255))) << 16) +
                (Math.min(255, Math.max(0, Math.round(f.g * 255))) << 8) +
                Math.min(255, Math.max(0, Math.round(f.b * 255)));
            if (def.box || def.ellipsoid || def.prism) {
                // BOX [Zentrum|−(farbe+1)][Halbmaße|0]; ELLIPSOID pB.w=1; KEIL pB.w = Typ 2..5 (First +z · −z · +x · −x,
                // `HUELLE_KEIL_TYP`) + 0,49 · Walm (das WGSL `sdKeil` liest Typ und Walm aus demselben Float).
                K[o] = def.c.x;
                K[o + 1] = def.c.y;
                K[o + 2] = def.c.z;
                K[o + 3] = -(pack + 1);
                K[o + 4] = Math.max(0.01, def.h.x);
                K[o + 5] = Math.max(0.01, def.h.y);
                K[o + 6] = Math.max(0.01, def.h.z);
                K[o + 7] = def.prism
                    ? def.keilTyp + 0.49 * Math.max(0, Math.min(1, def.walm || 0))
                    : def.ellipsoid
                      ? 1
                      : 0;
                lokalMin.x = Math.min(lokalMin.x, def.c.x - def.h.x);
                lokalMin.y = Math.min(lokalMin.y, def.c.y - def.h.y);
                lokalMin.z = Math.min(lokalMin.z, def.c.z - def.h.z);
                lokalMax.x = Math.max(lokalMax.x, def.c.x + def.h.x);
                lokalMax.y = Math.max(lokalMax.y, def.c.y + def.h.y);
                lokalMax.z = Math.max(lokalMax.z, def.c.z + def.h.z);
                continue;
            }
            // KAPSEL [A|Radius][B|Farbe]
            const rr = Math.max(0.005, def.r);
            K[o] = def.a.x;
            K[o + 1] = def.a.y;
            K[o + 2] = def.a.z;
            K[o + 3] = rr;
            K[o + 4] = def.b.x;
            K[o + 5] = def.b.y;
            K[o + 6] = def.b.z;
            K[o + 7] = pack;
            lokalMin.x = Math.min(lokalMin.x, Math.min(def.a.x, def.b.x) - rr);
            lokalMin.y = Math.min(lokalMin.y, Math.min(def.a.y, def.b.y) - rr);
            lokalMin.z = Math.min(lokalMin.z, Math.min(def.a.z, def.b.z) - rr);
            lokalMax.x = Math.max(lokalMax.x, Math.max(def.a.x, def.b.x) + rr);
            lokalMax.y = Math.max(lokalMax.y, Math.max(def.a.y, def.b.y) + rr);
            lokalMax.z = Math.max(lokalMax.z, Math.max(def.a.z, def.b.z) + rr);
        }
        wm.kapseln.needsUpdate = true;
        k = {
            artKapsel: true,
            d: -defs.length,
            einheit: slot * 2,
            slot,
            anzahl: defs.length,
            lokalMin,
            lokalGroesse: lokalMax.sub(lokalMin),
            refs: 1,
            key,
        };
        wm.kapselCache.set(key, k);
        return k;
    }

    _weltKapselSpawn(key, matrixWorld, kapselFn, einblenden) {
        const k = this._weltKapselHolen(key, kapselFn);
        if (!k) return null;
        const handle = this._weltFeldEintrag(k, matrixWorld || null, einblenden);
        if (!handle) {
            k.refs--;
            if (k.refs <= 0) this._weltBrickFrei(k);
            return null;
        }
        return handle;
    }

    // ═══ DAS VERTEILUNGS-GESETZ (analoge Klein-Streu) ═══
    // Arten mit Fernform "gesetz" (B2c: Blume, Fels) auf der Fern-Stufe: je 64-m-KACHEL EIN Feld-Eintrag mit einem BLOCK von Plätzen
    // (je 2 Texel [Pos|Hüllradius][yaw|scale|po|anzahl]); March: Kugel-Vortest → Sphere-Tracing des
    // geteilten Vorlagen-Satzes im Platz-Raum. Plätze = die Γ5-deterministischen Raster-Plätze des
    // Zellen-Chokepoints (kein Shader-Hash-Zwilling). Band 0 bleibt Mesh (_scatterInstanceAdd).
    // WIRD DER WELT-MARCH GEZEICHNET? Die Backend-Wand des Feld-Passes (`_feldPassEnsure`) und der Gesetz-Bahn der
    // Streu: das Fragment ist rohes WGSL, nur das WebGPU-Backend zeichnet es; der Null-Renderer ist für den Analog-Pfad
    // blind. Auf dem WebGL2-Rückfall belegten Gesetz-Plätze Kapsel-Liste und Fit-Takt für einen Pass, der nie lief
    // (Werkbank 04.10.: „Feld-Pass ruht"). Der `__anazhFernRing`-Hook öffnet nur den Pass (Linsen-Naht gate:fern-ring).
    // OFFEN (05.10.): Bau-Satz (`_archZiegelFern`) und Glieder-Kapseln (`_tickKreaturZiegel`) prüfen noch nur den
    // Null-Renderer — die Echt-Renderer-Linsen außer kamera-treue fahren mit den Vulkan-Schaltern den WebGL2-Rückfall
    // (kein Adapter) und lesen dort die CPU-Wahrheit dieser Erzeuger; sie fallen unter diese Wand, wenn die Linsen den
    // swiftshader-WebGPU-Adapter fahren (`--use-webgpu-adapter=swiftshader`).
    _weltMarchGezeichnet() {
        return this._gpuComputeFaehig();
    }

    // Die PASSUNG der Fernform aus der Studio-Gestalt (die geometrische Stufe ≤ 1, die das Studio liefert): die
    // Primitive kommen aus den UNVERSCHMOLZENEN Teilen der Cache-Gruppe — der Fels-Haufen sind seine einzelnen Steine,
    // nicht das EINE verschmolzene Leaf (dessen Hülle passte als liegende 3,6-m-Kapsel). `_gestaltKapselFit` nimmt die
    // 6 volumen-größten (Ellipsoid wo kompakt, sonst Kapsel). null = die Stufe lädt noch.
    _streuGesetzFit(preset, fseed) {
        const bf = this._foundryFlattenFor({ seed: fseed }, preset, 1);
        if (!bf || !bf.instanceable || !Array.isArray(bf.leaves) || !bf.leaves.length || bf.lod === 2) return null;
        const I = this._foundryWorldScaleMatrix(preset);
        const teile = [];
        for (const c of bf.leaves[0]._srcGroup.children)
            if (c && c.geometry && c.material) teile.push({ geom: c.geometry, mat: c.material, localMatrix: I });
        return this._gestaltKapselFit(teile);
    }

    _streuGesetzSpawn(preset, fseed, x, surfY, z, yaw, scale) {
        const wm = this._weltMarchEnsure();
        if (!wm) return null;
        const gestalt = this._foundryVariantFor(fseed, preset);
        if (gestalt == null) return null; // Buch kalt — die Zelle wartet
        const key = "agesetz:" + preset + ":" + gestalt;
        // Fit-Takt (Treffer frei); die volle Liste verbrennt keinen (`kapselVoll`, die Zelle wartet billig).
        if (!wm.kapselCache.has(key) && (wm.kapselVoll || !this._weltBakeErlaubt(this._spielerD2(x, z)))) return null;
        const satz = this._weltKapselHolen(key, () => this._streuGesetzFit(preset, fseed));
        if (!satz) return null;
        const W = AnazhRealm.WELT_MARCH;
        const kachel = Math.floor(x / W.gesetzKachelM) + "," + Math.floor(z / W.gesetzKachelM);
        let bloecke = wm.gesetzKacheln.get(kachel);
        if (!bloecke) wm.gesetzKacheln.set(kachel, (bloecke = []));
        let block = null;
        for (const b of bloecke)
            if (b.freiPlaetze.length) {
                block = b;
                break;
            }
        if (!block) {
            block = this._streuGesetzBlock(wm, kachel);
            if (!block) {
                satz.refs--;
                if (satz.refs <= 0) this._weltBrickFrei(satz);
                return null;
            }
            bloecke.push(block);
        }
        const idx = block.freiPlaetze.pop();
        // Hüllkugel um den PLATZ-URSPRUNG (Boden-Anker): r = scale × fernste
        // Ecke der Vorlagen-AABB — konservativ, kein Vorlagen-Wissen im Shader.
        const lm = satz.lokalMin;
        const lg = satz.lokalGroesse;
        const rx = Math.max(Math.abs(lm.x), Math.abs(lm.x + lg.x));
        const ry = Math.max(Math.abs(lm.y), Math.abs(lm.y + lg.y));
        const rz = Math.max(Math.abs(lm.z), Math.abs(lm.z + lg.z));
        const rWelt = Math.sqrt(rx * rx + ry * ry + rz * rz) * Math.max(0.01, scale);
        const K = wm.kapselDaten;
        const o = (block.slot + idx) * 8;
        K[o] = x;
        K[o + 1] = surfY;
        K[o + 2] = z;
        K[o + 3] = rWelt;
        K[o + 4] = yaw;
        K[o + 5] = scale;
        K[o + 6] = satz.einheit; // Vorlagen-Texel-Offset (der Shader liest ihn als po)
        K[o + 7] = satz.anzahl;
        wm.kapseln.needsUpdate = true;
        block.plaetze[idx] = satz;
        block.belegtPlaetze++;
        wm.gesetzPlaetze++;
        this._streuGesetzAabb(wm, block);
        return { gesetz: block, platz: idx };
    }

    // Ein Gesetz-Block: zusammenhängende Kapsel-Slots (je Slot ein Platz) + EIN Feld-Eintrag
    // (Identitäts-Matrix, Plätze im Welt-Raum; der Shader erkennt das Gesetz an einheit < 0). null bei
    // Erschöpfung (die Voll-Linsen melden es einmal).
    _streuGesetzBlock(wm, kachel) {
        const W = AnazhRealm.WELT_MARCH;
        const n = W.gesetzBlock;
        const seg = wm.freiKapselSeg.get(n);
        let slot = seg && seg.length ? seg.pop() : -1;
        if (slot < 0) {
            if (wm.kapselCursor + n > W.kapseln) {
                wm.kapselVoll = true;
                if (!this._weltKapselnVollWarn) {
                    this._weltKapselnVollWarn = true;
                    this.log(
                        "KAPSEL-LISTE ERSCHÖPFT: kein Platz für einen Analog-Satz — das Feld FEHLT sichtbar",
                        "WARN"
                    );
                }
                return null;
            }
            slot = wm.kapselCursor;
            wm.kapselCursor += n;
        }
        wm.kapselDaten.fill(0, slot * 8, (slot + n) * 8); // alle Plätze inaktiv (Hüllradius 0)
        const brick = {
            artKapsel: true,
            gesetz: true,
            d: -n,
            einheit: -(slot * 2 + 1), // NEGATIV = Gesetz-Block: der Shader liest die Texel-Basis als -(einheit+1)
            slot,
            anzahl: n,
            lokalMin: new THREE.Vector3(0, 0, 0),
            lokalGroesse: new THREE.Vector3(0, 0, 0),
            refs: 1,
            key: null,
        };
        const handle = this._weltFeldEintrag(brick, null);
        if (!handle) {
            this._weltBrickFrei(brick); // gibt das Slot-Segment zurück (artKapsel-Bahn)
            return null;
        }
        wm.gesetzBloecke++;
        return {
            kachel,
            slot,
            handle,
            brick,
            belegtPlaetze: 0,
            freiPlaetze: Array.from({ length: n }, (_x, i) => n - 1 - i),
            plaetze: new Array(n).fill(null),
        };
    }

    // Die Block-HÜLLE folgt ihren Plätzen (Union der Hüllkugeln): Welt-AABB
    // und lokale Box in EINEM Schritt (Identitäts-Matrix bleibt stehen) —
    // der Hüllen-Vortest des March bleibt eng, auch wenn Plätze sterben.
    _streuGesetzAabb(wm, block) {
        const K = wm.kapselDaten;
        const n = AnazhRealm.WELT_MARCH.gesetzBlock;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (let i = 0; i < n; i++) {
            const o = (block.slot + i) * 8;
            const r = K[o + 3];
            if (r <= 0) continue;
            if (K[o] - r < minX) minX = K[o] - r;
            if (K[o + 1] - r < minY) minY = K[o + 1] - r;
            if (K[o + 2] - r < minZ) minZ = K[o + 2] - r;
            if (K[o] + r > maxX) maxX = K[o] + r;
            if (K[o + 1] + r > maxY) maxY = K[o + 1] + r;
            if (K[o + 2] + r > maxZ) maxZ = K[o + 2] + r;
        }
        if (minX > maxX) {
            minX = minY = minZ = maxX = maxY = maxZ = 0;
        }
        block.brick.lokalMin.set(minX, minY, minZ);
        block.brick.lokalGroesse.set(maxX - minX, maxY - minY, maxZ - minZ);
        const L = wm.listeDaten;
        const o = block.handle.feld * 32;
        L[o] = minX;
        L[o + 1] = minY;
        L[o + 2] = minZ;
        L[o + 4] = maxX;
        L[o + 5] = maxY;
        L[o + 6] = maxZ;
        L[o + 20] = minX;
        L[o + 21] = minY;
        L[o + 22] = minZ;
        L[o + 24] = maxX - minX;
        L[o + 25] = maxY - minY;
        L[o + 26] = maxZ - minZ;
        wm.liste.needsUpdate = true;
    }

    // Ein PLATZ stirbt (LOD-0-Rückkehr/Region-Dispose): sein Texel wird
    // inaktiv (Hüllradius 0), die Vorlage gibt ihren Ref zurück; der LEERE
    // Block fällt GANZ (Feld-Eintrag + Slot-Segment über die eine Frei-Bahn).
    _streuGesetzFrei(handle) {
        const wm = this.state.weltMarch;
        if (!wm || !handle || handle._frei) return;
        handle._frei = true;
        const block = handle.gesetz;
        const o = (block.slot + handle.platz) * 8;
        wm.kapselDaten.fill(0, o, o + 8);
        wm.kapseln.needsUpdate = true;
        const satz = block.plaetze[handle.platz];
        block.plaetze[handle.platz] = null;
        if (satz) {
            satz.refs--;
            if (satz.refs <= 0) this._weltBrickFrei(satz);
        }
        block.freiPlaetze.push(handle.platz);
        block.belegtPlaetze--;
        wm.gesetzPlaetze--;
        if (block.belegtPlaetze <= 0) {
            this._weltFeldFrei(block.handle); // refs 1 → 0: die Brick-Frei-Bahn gibt das Slot-Segment zurück
            wm.gesetzBloecke--;
            const bloecke = wm.gesetzKacheln.get(block.kachel);
            if (bloecke) {
                const i = bloecke.indexOf(block);
                if (i >= 0) bloecke.splice(i, 1);
                if (!bloecke.length) wm.gesetzKacheln.delete(block.kachel);
            }
            return;
        }
        this._streuGesetzAabb(wm, block);
    }

    // Der EINE Frei-Chokepoint der Streu-Zellen: Baum-Zellen tragen ein
    // Feld-Handle, Klein-Streu-Zellen einen Gesetz-Platz — beide sterben hier.
    _scatterFeldFrei(handle) {
        if (handle && handle.gesetz) this._streuGesetzFrei(handle);
        else this._weltFeldFrei(handle);
    }

    // An: sofort (und ein laufender Schwund bricht ab). Aus: DER SCHWUND — übernimmt ein Mesh (Studio-Stufe, Tier), dithert
    // der Satz über `WELT_SCHWUND_MS` aus (Texel 5.w = Schwund-Anteil, dieselbe IGN-Blende wie die Stufen), statt im
    // selben Frame zu verschwinden: der Übergang Satz → Mesh trägt keinen Pop. Ohne gezeichneten Feld-Pass fällt er sofort,
    // ebenso mit `sofort` (ein Schalter des Spielers, kein Mesh übernimmt — der Satz verschwindet im selben Frame).
    // Ein laufendes Einblenden (`_weltFeldEintrag`, die Geburt eines fern entstandenen Satzes) bricht beim Aus ab.
    _weltFeldAktiv(handle, an, sofort) {
        const wm = this.state.weltMarch;
        if (!wm || !handle) return;
        const L = wm.listeDaten;
        const o = handle.feld * 32;
        if (an) {
            if (handle._schwundT0 !== undefined) {
                handle._schwundT0 = undefined;
                wm.schwund.delete(handle);
                L[o + 23] = 0;
                wm.liste.needsUpdate = true;
            }
            if (L[o + 3] !== handle.brick.d) {
                L[o + 3] = handle.brick.d;
                handle._anT = performance.now(); // seit wann der Satz zeichnet (die Nah-Linse nennt die Dauer)
                wm.liste.needsUpdate = true;
            }
            return;
        }
        if (handle._einT0 !== undefined) {
            handle._einT0 = undefined;
            wm.schwund.delete(handle);
            L[o + 23] = 0;
        }
        if (L[o + 3] === 0 || (handle._schwundT0 !== undefined && !sofort)) return;
        if (handle._schwundT0 !== undefined) {
            handle._schwundT0 = undefined;
            wm.schwund.delete(handle);
            L[o + 23] = 0;
        }
        const fp = this.state.feldPass;
        if (!sofort && fp && fp.mesh && fp.mesh.visible) {
            handle._schwundT0 = performance.now();
            wm.schwund.add(handle);
            return;
        }
        L[o + 3] = 0;
        wm.liste.needsUpdate = true;
    }

    // DIE NAH-LINSE (gate:analog-nah, Werkbank): jeder zeichnende Analog-Satz diesseits der Nah-Grenze (`ANALOG_NAH_M`,
    // waagrecht vom Spieler zur Hülle) beim NAMEN — Klasse, Träger, Abstand, seit wann er zeichnet und warum dort kein
    // Mesh steht. Rein lesend. `{ nah: [...], zaehl: { klasse: n } }`; ohne Welt-March null.
    _analogZensus() {
        const st = this.state;
        const wm = st.weltMarch;
        const pm = st.playerMesh && st.playerMesh.position;
        if (!wm || !pm) return null;
        const N = AnazhRealm.ANALOG_NAH_M;
        const L = wm.listeDaten;
        const K = wm.kapselDaten;
        const jetzt = performance.now();
        const traeger = new Map();
        for (const e of st.architectures || []) if (e && e._ziegelSlot) traeger.set(e._ziegelSlot, { bau: e });
        // jeder Leib im Bild trägt seinen Satz: die Wesen und die Gefallenen (state.leichname liegen fern als Feld)
        for (const c of [...(st.creatures || []), ...(st.leichname || [])]) {
            const u = c && c.userData;
            if (u && u._kzGlieder) for (const gl of u._kzGlieder) traeger.set(gl.handle, { tier: c });
        }
        const nah = [];
        const zaehl = {};
        const grundBau = (e) => {
            if (this._archIsRendered(e)) return "Mesh steht — der Satz schwindet";
            const preset = this._foundryEnabled() ? this._foundryPresetForEntry(e) : null;
            if (!preset) return "Grammatik-Bau wartet aufs Bau-Budget";
            const lod = this._foundryLodForEntry(e);
            if (this._foundryStufeBereit(e, preset, lod))
                return "Studio-Stufe L" + lod + " gedockt, noch nicht platziert";
            // (ein Karten-Ding — Baum, Strauch — trägt nie einen Satz, `_archKartenPreset`)
            return "Studio-Stufe L" + lod + " lädt (Foundry)";
        };
        for (let f = 0; f < wm.obergrenze; f++) {
            const h = wm.handles[f];
            if (!h) continue;
            const o = f * 32;
            if (L[o + 3] === 0) continue;
            const t = traeger.get(h);
            const bloc = h.brick && h.brick.gesetz;
            let d;
            if (bloc) {
                d = Infinity;
                for (let i = 0; i < h.brick.anzahl; i++) {
                    const q = (h.brick.slot + i) * 8;
                    if (K[q + 3] > 0) d = Math.min(d, Math.hypot(K[q] - pm.x, K[q + 2] - pm.z));
                }
            } else {
                const dx = Math.max(L[o] - pm.x, 0, pm.x - L[o + 4]);
                const dz = Math.max(L[o + 2] - pm.z, 0, pm.z - L[o + 6]);
                d = Math.hypot(dx, dz);
            }
            const klasse = t && t.bau ? "bau" : t && t.tier ? "tier" : bloc ? "streu-gesetz" : "unbekannt";
            if (!(d < N)) continue;
            zaehl[klasse] = (zaehl[klasse] || 0) + 1;
            const z = {
                klasse,
                d: Math.round(d * 10) / 10,
                seitMs: Number.isFinite(h._anT) ? Math.round(jetzt - h._anT) : null,
                schwindet: h._schwundT0 !== undefined,
                // ein Schwund, der länger als zwei Schwund-Zeiten läuft, endet nie — er ist ein Befund wie ein Satz
                haengt: h._schwundT0 !== undefined && jetzt - h._schwundT0 > 2 * AnazhRealm.WELT_SCHWUND_MS,
                satz: (h.brick && h.brick.key) || null,
            };
            if (t && t.bau) {
                const e = t.bau;
                z.name = e.type + "@" + Math.round(e.position.x) + "," + Math.round(e.position.z);
                z.grund = grundBau(e);
            } else if (t && t.tier) {
                const u = t.tier.userData || {};
                z.name = this._kreaturGattung(t.tier) + "#" + t.tier.id;
                z.grund = u._kzNah ? "nah, der Satz schwindet" : "Fern-Hysterese (Nah-Grenze " + N + " m)";
            } else if (bloc) {
                z.name = "Gesetz-Block " + (h.brick.slot | 0);
                z.grund = "Gesetz-Platz diesseits der Nah-Grenze";
            } else {
                z.name = "Feld " + f;
                z.grund = "ohne Träger";
            }
            nah.push(z);
        }
        nah.sort((a, b) => a.d - b.d);
        // DIE BRÜCKEN diesseits der Grenze: ein kalter Baum, dessen Wunsch-Stufe noch lädt, trägt seine Karte VOLL — kein
        // Analog-Satz, aber auch nicht das Studio-Mesh. Eingeschwungen steht keine (die Linse nennt jede mit Dauer).
        const bruecken = [];
        for (const e of st.architectures || []) {
            if (!e || e._bruecke !== true || !e.position) continue;
            const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
            if (!(d < N)) continue;
            bruecken.push({
                name: e.type + "@" + Math.round(e.position.x) + "," + Math.round(e.position.z),
                d: Math.round(d * 10) / 10,
                seitMs: Number.isFinite(e._brueckeT) ? Math.round(jetzt - e._brueckeT) : null,
            });
        }
        return { nah, zaehl, grenzeM: N, bruecken };
    }

    // Der Schwund-Takt (je Feld-Pass-Takt): Anteil = Zeit / WELT_SCHWUND_MS in Texel 5.w; am Ende fällt der Satz aus der
    // Zeichnung (d = 0).
    _weltSchwundTakt(wm) {
        if (!wm || !wm.schwund.size) return;
        const L = wm.listeDaten;
        const jetzt = performance.now();
        for (const h of wm.schwund) {
            const o = h.feld * 32;
            if (h._einT0 !== undefined) {
                // DAS EINBLENDEN: der verworfene Anteil fällt von 1 nach 0, dann zeichnet der Satz ganz.
                const e = 1 - (jetzt - h._einT0) / AnazhRealm.WELT_SCHWUND_MS;
                if (h._frei || e <= 0) {
                    wm.schwund.delete(h);
                    h._einT0 = undefined;
                    if (!h._frei) L[o + 23] = 0;
                } else L[o + 23] = e;
                continue;
            }
            const s = (jetzt - h._schwundT0) / AnazhRealm.WELT_SCHWUND_MS;
            if (h._frei || s >= 1) {
                wm.schwund.delete(h);
                h._schwundT0 = undefined;
                if (h._frei) continue;
                L[o + 3] = 0;
                L[o + 23] = 0;
            } else L[o + 23] = Math.max(1e-3, s);
        }
        wm.liste.needsUpdate = true;
    }

    // Das Feld folgt seinem GLIED: die Liste bekommt die inverse Welt-Matrix des Knochens (der March
    // zieht den Strahl in den Glied-Raum) + die Welt-AABB der bewegten lokalen Box (Vortest). Ein
    // Aufruf je Glied je Frame.
    _weltFeldMatrix(handle, matrixWorld) {
        const wm = this.state.weltMarch;
        if (!wm || !handle) return;
        const inv = this._wfInv || (this._wfInv = new THREE.Matrix4());
        const ecke = this._wfEcke || (this._wfEcke = new THREE.Vector3());
        inv.copy(matrixWorld).invert();
        const e = inv.elements; // Spalten-major
        const L = wm.listeDaten;
        const o = handle.feld * 32;
        L[o + 8] = e[0];
        L[o + 9] = e[4];
        L[o + 10] = e[8];
        L[o + 11] = e[12]; // inv Zeile 0
        L[o + 12] = e[1];
        L[o + 13] = e[5];
        L[o + 14] = e[9];
        L[o + 15] = e[13]; // inv Zeile 1
        L[o + 16] = e[2];
        L[o + 17] = e[6];
        L[o + 18] = e[10];
        L[o + 19] = e[14]; // inv Zeile 2
        // Welt-AABB: die 8 Ecken der lokalen Box durch die VORWÄRTS-Matrix:
        const m = handle.brick.lokalMin;
        const g = handle.brick.lokalGroesse;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (let k = 0; k < 8; k++) {
            ecke.set(m.x + (k & 1 ? g.x : 0), m.y + (k & 2 ? g.y : 0), m.z + (k & 4 ? g.z : 0)).applyMatrix4(
                matrixWorld
            );
            if (ecke.x < minX) minX = ecke.x;
            if (ecke.y < minY) minY = ecke.y;
            if (ecke.z < minZ) minZ = ecke.z;
            if (ecke.x > maxX) maxX = ecke.x;
            if (ecke.y > maxY) maxY = ecke.y;
            if (ecke.z > maxZ) maxZ = ecke.z;
        }
        L[o] = minX;
        L[o + 1] = minY;
        L[o + 2] = minZ;
        L[o + 4] = maxX;
        L[o + 5] = maxY;
        L[o + 6] = maxZ;
        wm.liste.needsUpdate = true;
    }

    // Ein BRICK freigeben (Atlas-Einheit/Block zurück): NUR wenn kein Feld mehr
    // darauf zeigt (refs === 0). Räumt den Cache-Eintrag und vereinigt Blöcke.
    _weltBrickFrei(brick) {
        const wm = this.state.weltMarch;
        if (!wm || !brick || brick._frei) return; // Doppel-Frei-Wand
        // Seit dem Abschied der Voxel-Bricks (V18.528) trägt der Welt-March nur Analog-Sätze: Kapsel-Sätze und
        // Gesetz-Vorlagen. Ein anderer Satz ist ein Bruch, kein stilles Weiter.
        if (!brick.artKapsel)
            throw new Error("[welt-march] _weltBrickFrei: kein Kapsel-Satz (Voxel-Bricks sind verabschiedet)");
        brick._frei = true;
        // KAPSEL-Frei: Segment in die Längen-Freiliste, Cache räumen.
        wm.kapselCache.delete(brick.key);
        let seg = wm.freiKapselSeg.get(brick.anzahl || 1);
        if (!seg) wm.freiKapselSeg.set(brick.anzahl || 1, (seg = []));
        seg.push(brick.slot);
        wm.kapselVoll = false; // ein Segment ist frei: die nächste Allokation versucht es wieder
    }

    // Ein FELD-EINTRAG stirbt: der Listen-Slot fällt frei, das Brick nur, wenn
    // KEIN anderer Eintrag mehr darauf zeigt (Dedup-Refcount).
    _weltFeldFrei(handle) {
        const wm = this.state.weltMarch;
        if (!wm || !handle) return;
        if (handle._frei) return; // Doppel-Frei-Wand
        handle._frei = true;
        const o = handle.feld * 32;
        wm.listeDaten[o + 3] = 0;
        wm.liste.needsUpdate = true;
        // Die Frei-Liste bleibt absteigend sortiert: pop() vergibt immer den KLEINSTEN freien Slot, und die Obergrenze
        // folgt dem höchsten belegten (die Stellvertreter-Zahl des March-Draws ist Obergrenze × Plätze je Block) — die
        // Lücken füllen sich von unten, die Obergrenze bleibt eng.
        const F = wm.freiFelder;
        let lo = 0,
            hi = F.length;
        while (lo < hi) {
            const mitte = (lo + hi) >> 1;
            if (F[mitte] > handle.feld) lo = mitte + 1;
            else hi = mitte;
        }
        F.splice(lo, 0, handle.feld);
        wm.handles[handle.feld] = null;
        while (wm.obergrenze > 0 && !wm.handles[wm.obergrenze - 1]) wm.obergrenze--;
        wm.belegt--;
        const brick = handle.brick;
        if (brick) {
            brick.refs--;
            if (brick.refs <= 0) this._weltBrickFrei(brick);
        }
    }

    // ═══ DAS FELD-PANORAMA (Schattierungs-Persistenz) ═══
    // Der EINE March lebt hier (Compute), das Fragment schaut nur nach. Je Texel: rgb = Rampen-Farbe
    // des Treffers, a = Distanz (0 = Himmel). Nebel NICHT gebacken — er mischt live aus der Distanz
    // (Tag/Nacht kostet kein Re-Bake). Elevation-Zeilen ballen quadratisch am Horizont; Himmels-Texel
    // fallen im Früh-Aus.
    _feldPanoWgsl() {
        if (this._feldPanoWgslText) return this._feldPanoWgslText;
        this._feldPanoWgslText =
            "struct PS {\n" +
            "    ankerX: f32, ankerZ: f32, camX: f32, camY: f32,\n" +
            "    camZ: f32, rMin: f32, rMax: f32, hMax: f32,\n" +
            "    elevMax: f32, feldAz: f32, feldRad: f32, panoAz: f32,\n" +
            "    panoElev: f32, pad0: f32, pad1: f32, pad2: f32,\n" +
            "};\n" +
            "@group(0) @binding(0) var<uniform> S: PS;\n" +
            "@group(0) @binding(1) var<storage, read> feld: array<f32>;\n" +
            "@group(0) @binding(2) var<storage, read_write> pano: array<f32>;\n" +
            "fn feldTexel(ix: i32, iy: i32) -> vec4<f32> {\n" +
            "    let k = (u32(iy) * u32(S.feldAz) + u32(ix)) * 4u;\n" +
            "    return vec4<f32>(feld[k], feld[k + 1u], feld[k + 2u], feld[k + 3u]);\n" +
            "}\n" +
            // DAS FELD IST EINE FLÄCHE, KEIN KASTEN-GITTER (K16, die Horizont-Zinnen): der Strahl liest Höhe und Farbe bilinear
            // zwischen den vier Texel-Mitten (Azimut umlaufend, radial geklemmt). Bis K16 las er den nächsten Texel: jeder
            // Texel (1,875° × 667 m) stand als Kasten mit ebenem Dach und senkrechter Wand — die Silhouette trug Zinnen.
            "fn feldAn(rel: vec2<f32>, r: f32) -> vec4<f32> {\n" +
            "    let PI = 3.14159265358979;\n" +
            "    let nAz = i32(S.feldAz);\n" +
            "    let fx = (atan2(rel.y, rel.x) / (2.0 * PI) + 0.5) * S.feldAz - 0.5;\n" +
            "    let fy = clamp((r - S.rMin) / (S.rMax - S.rMin) * S.feldRad - 0.5, 0.0, S.feldRad - 1.0);\n" +
            "    let x0 = floor(fx);\n" +
            "    let y0 = floor(fy);\n" +
            "    let tx = fx - x0;\n" +
            "    let ty = fy - y0;\n" +
            "    let ix0 = ((i32(x0) % nAz) + nAz) % nAz;\n" +
            "    let ix1 = (ix0 + 1) % nAz;\n" +
            "    let iy0 = i32(y0);\n" +
            "    let iy1 = min(iy0 + 1, i32(S.feldRad) - 1);\n" +
            "    let a = mix(feldTexel(ix0, iy0), feldTexel(ix1, iy0), tx);\n" +
            "    let b = mix(feldTexel(ix0, iy1), feldTexel(ix1, iy1), tx);\n" +
            "    return mix(a, b, ty);\n" +
            "}\n" +
            "@compute @workgroup_size(64)\n" +
            "fn main(@builtin(global_invocation_id) gid: vec3<u32>) {\n" +
            "    let idx = gid.x;\n" +
            "    let nAz = u32(S.panoAz);\n" +
            "    let nEl = u32(S.panoElev);\n" +
            "    if (idx >= nAz * nEl) { return; }\n" +
            "    let ia = idx % nAz;\n" +
            "    let ie = idx / nAz;\n" +
            "    let PI = 3.14159265358979;\n" +
            "    let a = ((f32(ia) + 0.5) / S.panoAz) * 2.0 * PI - PI;\n" +
            "    // WAHRNEHMUNGS-ALLOKATION: quadratische Elevation (Zeilen ballen am Horizont)\n" +
            "    let sSym = ((f32(ie) + 0.5) / S.panoElev) * 2.0 - 1.0;\n" +
            "    let e = sign(sSym) * sSym * sSym * S.elevMax;\n" +
            "    let cosE = cos(e);\n" +
            "    let dir = vec3<f32>(cos(a) * cosE, sin(e), sin(a) * cosE);\n" +
            "    let camPos = vec3<f32>(S.camX, S.camY, S.camZ);\n" +
            "    let o = idx * 4u;\n" +
            "    pano[o] = 0.0; pano[o + 1u] = 0.0; pano[o + 2u] = 0.0; pano[o + 3u] = 0.0;\n" +
            "    // HIMMELS-FRÜH-AUS: steigt der Strahl und liegt schon am March-Start über\n" +
            "    // hMax, kann kein Terrain mehr kommen (die Höhe wächst monoton) — kein March.\n" +
            "    if (dir.y >= 0.0 && camPos.y + dir.y * (S.rMin * 0.8) > S.hMax) { return; }\n" +
            "    var tVor = S.rMin * 0.8;\n" +
            "    for (var i: i32 = 0; i < 96; i = i + 1) {\n" +
            "        let q = (f32(i) + 1.0) / 96.0;\n" +
            "        let t = S.rMin * 0.8 + (S.rMax - S.rMin * 0.8) * q * q;\n" +
            "        let pos = camPos + dir * t;\n" +
            "        if (pos.y > S.hMax && dir.y >= 0.0) { break; }\n" +
            "        let rel = pos.xz - vec2<f32>(S.ankerX, S.ankerZ);\n" +
            "        let r = length(rel);\n" +
            "        if (r < S.rMin) { tVor = t; continue; }\n" +
            "        if (r > S.rMax) { break; }\n" +
            "        let h = feldAn(rel, r);\n" +
            "        if (pos.y <= h.x) {\n" +
            "            var aB = tVor;\n" +
            "            var bB = t;\n" +
            "            var tFein = t;\n" +
            "            var hF = h;\n" +
            "            for (var k: i32 = 0; k < 5; k = k + 1) {\n" +
            "                let m = (aB + bB) * 0.5;\n" +
            "                let pm = camPos + dir * m;\n" +
            "                let relM = pm.xz - vec2<f32>(S.ankerX, S.ankerZ);\n" +
            "                let rM = length(relM);\n" +
            "                let hM = feldAn(relM, rM);\n" +
            "                if (pm.y <= hM.x) { bB = m; tFein = m; hF = hM; } else { aB = m; }\n" +
            "            }\n" +
            "            pano[o] = hF.y; pano[o + 1u] = hF.z; pano[o + 2u] = hF.w; pano[o + 3u] = tFein;\n" +
            "            return;\n" +
            "        }\n" +
            "        tVor = t;\n" +
            "    }\n" +
            "}\n";
        return this._feldPanoWgslText;
    }

    // EIN Panorama-Bake-Lauf (raw Device, dieselbe Plumbing wie der Zeichner):
    // liest fp.daten (das Polar-Feld) als Storage, schreibt az×elev×4 zurück.
    async _feldPanoramaRechnen(fp, cx, cy, cz) {
        const device = this._feldZeichnerDevice() || (await this._feldZeichnerEigenDevice());
        if (!device) return null;
        try {
            const P = AnazhRealm.FELD_PASS;
            const PN = AnazhRealm.FELD_PANO;
            const n = PN.az * PN.elev;
            device.pushErrorScope("validation");
            if (!this._feldPanoPipe || this._feldPanoPipeDev !== device) {
                const mod = device.createShaderModule({ code: this._feldPanoWgsl() });
                this._feldPanoPipe = device.createComputePipeline({
                    layout: "auto",
                    compute: { module: mod, entryPoint: "main" },
                });
                this._feldPanoPipeDev = device;
            }
            const pipe = this._feldPanoPipe;
            const uni = new Float32Array(16);
            uni[0] = fp.anchorX;
            uni[1] = fp.anchorZ;
            uni[2] = cx;
            uni[3] = cy;
            uni[4] = cz;
            uni[5] = fp.U.rMin.value;
            uni[6] = P.rMaxM;
            uni[7] = fp.U.hMax.value;
            uni[8] = PN.elevMax;
            uni[9] = P.az;
            uni[10] = P.rad;
            uni[11] = PN.az;
            uni[12] = PN.elev;
            const uniBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
            device.queue.writeBuffer(uniBuf, 0, uni.buffer, 0, 64);
            const feldBuf = device.createBuffer({
                size: fp.daten.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
            device.queue.writeBuffer(feldBuf, 0, fp.daten.buffer, fp.daten.byteOffset, fp.daten.byteLength);
            const outBuf = device.createBuffer({
                size: n * 16,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            });
            const staging = device.createBuffer({
                size: n * 16,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
            const bind = device.createBindGroup({
                layout: pipe.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: uniBuf } },
                    { binding: 1, resource: { buffer: feldBuf } },
                    { binding: 2, resource: { buffer: outBuf } },
                ],
            });
            const err = await device.popErrorScope();
            if (err) {
                this.log("Feld-Panorama: WGSL-Validierung scheiterte — " + err.message, "ERROR");
                return null;
            }
            const enc = device.createCommandEncoder();
            const pass = enc.beginComputePass();
            pass.setPipeline(pipe);
            pass.setBindGroup(0, bind);
            pass.dispatchWorkgroups(Math.ceil(n / 64));
            pass.end();
            enc.copyBufferToBuffer(outBuf, 0, staging, 0, n * 16);
            device.queue.submit([enc.finish()]);
            await staging.mapAsync(GPUMapMode.READ);
            const werte = new Float32Array(staging.getMappedRange().slice(0));
            staging.unmap();
            for (const b of [uniBuf, feldBuf, outBuf, staging]) {
                try {
                    b.destroy();
                } catch (_e) {}
            }
            return werte;
        } catch (err) {
            this.log("Feld-Panorama: Bake scheiterte (" + ((err && err.message) || err) + ")", "WARN");
            return null;
        }
    }

    // Bake-Auslöser (nach Feld-Anstrich + bei Kamera-Drift): gen-gestempelt,
    // das alte Panorama bleibt sichtbar bis das neue steht (kein Flackern).
    _feldPanoramaMal(fp) {
        if (fp.panoFlug || !(fp.laeufe > 0)) return;
        const cam = this.state.camera;
        if (!cam) return;
        fp.panoFlug = true;
        const gen = (fp.panoGen = (fp.panoGen || 0) + 1);
        const cx = cam.position.x;
        const cy = cam.position.y;
        const cz = cam.position.z;
        this._feldPanoramaRechnen(fp, cx, cy, cz)
            .then((werte) => {
                if (this.state.feldPass !== fp || fp.panoGen !== gen) return;
                fp.panoFlug = false;
                if (!werte) return; // kein Device → der Pass bleibt unsichtbar, die Schalen tragen
                fp.panoDaten.set(werte);
                fp.panoTex.needsUpdate = true;
                fp.panoCamX = cx;
                fp.panoCamY = cy;
                fp.panoCamZ = cz;
                fp.panoLaeufe = (fp.panoLaeufe || 0) + 1;
                fp.mesh.visible = true; // erst mit gebackenem Panorama sichtbar (Panorama und March gemeinsam)
                fp.march.visible = true;
            })
            .catch((e) => {
                if (this.state.feldPass === fp && fp.panoGen === gen) fp.panoFlug = false;
                this._stoffBruch("das Feld-Panorama (Malen)", e);
            });
    }

    // Der Pass-Tick (aus _tickFernRing — der Pass ist Ring-Besitz): Ensure,
    // Re-Malen bei Anker-Wechsel, die zwei Kamera-Uniforms je Frame.
    _tickFeldPass(fr) {
        const st = this.state;
        let fp = st.feldPass;
        if (!fp) fp = this._feldPassEnsure(fr);
        if (!fp) return;
        // Neu malen bei Anker-Wechsel ODER wenn die Saison seit dem letzten Bild um mehr als `saisonDrift` (je Kanal)
        // gewandert ist — das Feld trägt die Saison als Farbe (der Ring liest `uSeasonMul` im Stoff).
        if (fp.anchorX !== fr.anchorX || fp.anchorZ !== fr.anchorZ || this._feldSaisonDrift(fp))
            this._feldPassMal(fp, fr);
        this._weltSchwundTakt(st.weltMarch);
        const cam = st.camera;
        // PANORAMA-PFLEGE: Erst-Bake nachholen (Device kam spät) + Re-Bake bei
        // Kamera-Drift (Parallaxe/Horizont) — amortisiert, gen-gestempelt.
        if (cam && fp.laeufe > 0 && !fp.panoFlug) {
            if (!(fp.panoLaeufe > 0)) {
                this._feldPanoramaMal(fp);
            } else {
                const PN = AnazhRealm.FELD_PANO;
                const ddx = cam.position.x - fp.panoCamX;
                const ddy = cam.position.y - fp.panoCamY;
                const ddz = cam.position.z - fp.panoCamZ;
                if (ddx * ddx + ddz * ddz > PN.rebakeDist * PN.rebakeDist || Math.abs(ddy) > PN.rebakeHoehe)
                    this._feldPanoramaMal(fp);
            }
        }
        if (cam && fp.mesh.visible) {
            fp.U.camPos.value.copy(cam.position);
            // Stellvertreter und Strahl aus DERSELBEN Matrix (Raster-Deckung == Strahl-Treffer).
            fp.U.vp.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
            fp.U.invVP.value.copy(fp.U.vp.value).invert();
            // DER EINE WELT-MARCH: echte Tiefe braucht die Projektions-Wahrheit —
            // near/far + Blick-Achse (Tiefe = View-Z, nie Strahl-Länge).
            fp.U.nah.value = cam.near;
            fp.U.fern.value = cam.far;
            const e = cam.matrixWorld.elements;
            fp.U.fwd.value.set(-e[8], -e[9], -e[10]).normalize();
            // Die Stellvertreter: je vergebenem Feld-Slot ein Block von Plätzen (ein Satz nutzt Platz 0, ein Gesetz-
            // Block jeden belegten) — der Vertex verwirft leere, die Kosten binden an die Hüllen im Bild. Licht der Welt:
            // das Feld gehorcht den Szene-Lichtern, sonst leuchtet das Albedo nachts aus sich selbst.
            const wm = st.weltMarch;
            fp.march.geometry.instanceCount = wm ? wm.obergrenze * AnazhRealm.WELT_MARCH.gesetzBlock : 0;
            this._feldLichtSync(fp.U);
        }
    }

    // DAS LICHT DER WELT für den Feld-Pass: liest dieselben Quellen wie jedes MeshStandard —
    // Sonne/Mond (Richtung = position − target), Ambient, Hemi (Himmel/Boden)
    // und die Himmels-Umgebung (Irradianz aus DENSELBEN Bytes wie `_skyEnvTex`, je Normalen-y).
    // Die Luft legt der Pass-Knoten aus `_luftEnsure` auf (dieselben Fn wie `scene.fogNode`).
    _feldLichtSync(U) {
        const st = this.state;
        const nullV = this._nullVektor || (this._nullVektor = new THREE.Vector3());
        const l = st.directionalLight;
        if (!l || l.visible === false || !(l.intensity > 0)) U.l0c.value.set(0, 0, 0);
        else {
            U.l0d.value
                .copy(l.position)
                .sub(l.target && l.target.position ? l.target.position : nullV)
                .normalize();
            U.l0c.value.set(l.color.r * l.intensity, l.color.g * l.intensity, l.color.b * l.intensity);
        }
        const amb = st.ambientLight;
        const ai = amb && amb.visible !== false ? Math.max(0, amb.intensity || 0) : 0;
        U.ambientFarbe.value.set(amb ? amb.color.r * ai : 0, amb ? amb.color.g * ai : 0, amb ? amb.color.b * ai : 0);
        const hemi = st.hemiLight;
        const hi = hemi && hemi.visible !== false ? Math.max(0, hemi.intensity || 0) : 0;
        if (hemi) {
            U.hemiOben.value.set(hemi.color.r * hi, hemi.color.g * hi, hemi.color.b * hi);
            U.hemiUnten.value.set(hemi.groundColor.r * hi, hemi.groundColor.g * hi, hemi.groundColor.b * hi);
        } else {
            U.hemiOben.value.set(0, 0, 0);
            U.hemiUnten.value.set(0, 0, 0);
        }
        this._feldEnvIrradianz(U);
    }

    // Die Himmels-Irradianz (diffuse IBL) für drei Normalen (unten · waagrecht · oben): der
    // Kosinus-gefaltete Mittelwert der Env-Zeilen (azimut-invariant → nur die Höhe zählt),
    // sRGB-dekodiert wie die Textur. Neu gerechnet nur, wenn `_skyEnvTex` neu gemalt wurde.
    _feldEnvIrradianz(U) {
        const e = this._himmelsIrradianz();
        if (!e) {
            U.envUnten.value.set(0, 0, 0);
            U.envMitte.value.set(0, 0, 0);
            U.envOben.value.set(0, 0, 0);
            return;
        }
        U.envUnten.value.fromArray(e.unten);
        U.envMitte.value.fromArray(e.mitte);
        U.envOben.value.fromArray(e.oben);
    }

    // DIE HIMMELS-IRRADIANZ (diffuse IBL) für drei Normalen (unten · waagrecht · oben): der Kosinus-gefaltete
    // Mittelwert der Env-Zeilen (azimut-invariant → nur die Höhe zählt), sRGB-dekodiert wie die Textur. Neu
    // gerechnet nur, wenn `_skyEnvTex` neu gemalt wurde. Leser: der Feld-Pass und die Belichtung.
    _himmelsIrradianz() {
        const st = this.state;
        const d = st._skyEnvData;
        const tex = st._skyEnvTex;
        const scene = st.scene;
        const env = scene && scene.environment;
        const ei = scene && Number.isFinite(scene.environmentIntensity) ? scene.environmentIntensity : 1;
        if (!d || !tex || !env) return null;
        const stempel = (tex.version || 0) + ":" + ei;
        if (this._himmelsIrrStempel === stempel && this._himmelsIrr) return this._himmelsIrr;
        this._himmelsIrrStempel = stempel;
        const W = tex.image.width;
        const H = tex.image.height;
        const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        // Zeile y → Elevation (v = y/(H−1): 0 Nadir … 1 Zenit, dieselbe Zeilen-Richtung wie das GPU-Sampling,
        // `_ensureSkyEnvironment`), Farbe der Zeile (Spalte 0: azimut-konstant)
        const zeilen = [];
        for (let y = 0; y < H; y++) {
            const v = y / (H - 1);
            const el = (v - 0.5) * Math.PI; // −π/2 … π/2
            const i = y * W * 4;
            zeilen.push({ el, r: lin(d[i] / 255), g: lin(d[i + 1] / 255), b: lin(d[i + 2] / 255) });
        }
        // E(n) = (1/π)∫ L(ω) max(n·ω,0) dω; n in der x-y-Ebene (azimut-invariant), numerisch über
        // Elevation × Azimut.
        const falte = (nY) => {
            const nX = Math.sqrt(Math.max(0, 1 - nY * nY));
            let r = 0,
                g = 0,
                b = 0;
            const AZ = 32;
            for (const z of zeilen) {
                const ce = Math.cos(z.el);
                const se = Math.sin(z.el);
                const dA = ((Math.PI / (H - 1)) * ce * (2 * Math.PI)) / AZ;
                for (let a = 0; a < AZ; a++) {
                    const phi = ((a + 0.5) / AZ) * 2 * Math.PI;
                    const cos = nX * ce * Math.cos(phi) + nY * se;
                    if (cos <= 0) continue;
                    const w = cos * dA;
                    r += z.r * w;
                    g += z.g * w;
                    b += z.b * w;
                }
            }
            const k = ei / Math.PI;
            return [r * k, g * k, b * k];
        };
        this._himmelsIrr = { unten: falte(-1), mitte: falte(0), oben: falte(1) };
        return this._himmelsIrr;
    }

    _feldPassDispose() {
        const fp = this.state.feldPass;
        if (!fp) return;
        for (const m of [fp.mesh, fp.march]) {
            if (this.state.scene) this.state.scene.remove(m);
            this._queueGeometryDispose(m.geometry);
            m.material.dispose();
        }
        if (fp.tex && typeof fp.tex.dispose === "function") fp.tex.dispose();
        if (fp.panoTex && typeof fp.panoTex.dispose === "function") fp.panoTex.dispose();
        this.state.feldPass = null;
    }

    // Frame-Tick (EIN Aufruf aus `_runFrameScheduler`, kein eigener Timer): Hook-Gate (headless ruht
    // der Ring), Ensure, QUANTISIERTES Re-Zentrieren (ab `reanchorDist` — dann rollt der Refresh einmal
    // durch alle Schalen), Refresh-Scheibe.
    _tickFernRing(playerPos) {
        const st = this.state;
        const hook = typeof window !== "undefined" ? window.__anazhFernRing : undefined;
        if (hook === false) {
            if (st.fernRing) this._fernRingDispose();
            return;
        }
        if (hook !== true && st.renderer && st.renderer._isHeadlessNull) return;
        if (!playerPos || !st.scene || typeof THREE === "undefined") return;
        const F = AnazhRealm.FERN_RING;
        let fr = st.fernRing;
        // der Sicht-Regler (chunkRingRadius) verschiebt die Schale-1-Kante → Neubau
        const targetRing = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        if (fr && fr.builtRing !== targetRing) {
            this._fernRingDispose();
            fr = null;
        }
        if (!fr) fr = this._fernRingEnsure(playerPos);
        if (!fr) return;
        const dx = playerPos.x - fr.anchorX;
        const dz = playerPos.z - fr.anchorZ;
        if (dx * dx + dz * dz > F.reanchorDist * F.reanchorDist) {
            fr.anchorX = Math.round(playerPos.x / F.anchorQuant) * F.anchorQuant;
            fr.anchorZ = Math.round(playerPos.z / F.anchorQuant) * F.anchorQuant;
            fr.uAnker.value.set(fr.anchorX, fr.anchorZ);
            fr.cursor = 0; // voller Höhen-Refresh, budgetiert über die nächsten Frames
            fr.gen = (fr.gen || 0) + 1; // laufende Feld-Flüge sind überholt
            fr.vollY.fill(NaN); // das volle Gesetz der Bau-Zone gehört zum Anker
            fr.feldY.fill(NaN); // die Feld-Fläche der Naht ebenso
            fr.gpuFlug = false;
        }
        // Die Schalen leben auf Layer 0 (EIN Szene-Pass) — selbstheilend, falls ein Altstand sie verschob.
        for (const m of fr.meshes) if (m.layers.mask !== 1) m.layers.mask = 1;
        this._fernRingMaske(fr); // der Ring weicht dem Gebauten (`maskNode`)
        // DER FELD-ZEICHNER: ein anstehender VOLLER Refresh (Boot/Re-Anker)
        // wird zuerst vom Feld gemalt (EIN GPU-Lauf, Horizont steht sofort);
        // die CPU-Scheibe darunter verfeinert dieselben Vertices aufs f64-Gesetz.
        // EIN DURCHGANG UNTER DEM LADESCHIRM (K60): der Maler rechnet seit K16 dasselbe Gesetz auf dem Haupt-Faden wie die
        // CPU-Scheibe (`_feldZeichnerHoehen`, in Takt-Scheiben) und setzt danach jeden Punkt ab dem Cursor in EINER Aufgabe —
        // unter dem Ladeschirm sah niemand seinen schnellen Horizont, und beide Wege rechneten den Ring (Radeon kalt: Maler-Höhen
        // 1,2 s, seine Setz-Aufgabe 2,4 s am Stück, die Scheibe 2,0 s). Bis zum ersten Bild zeichnet die Scheibe allein; der
        // Maler malt jeden Re-Anker danach (der Spieler sieht den Horizont sofort).
        if (fr.cursor === 0 && st._weltbildDa) this._fernRingGpuMal(fr);
        this._fernRingRefresh(F.refreshVertsProTick);
        // DAS EINE WASSER: kam oder ging das Fern-Wasser, legt der Ring seine nassen Punkte neu (`_fernRingWasserTiefe`).
        this._fernRingWasserNeu(fr);
        // DIE KOSTEN AN DER NAHT: die Dreiecke der Schale 0 folgen Maske und Lage (frei · Naht · getragen, `_fernRingTeilung`).
        this._fernRingTeilung(fr);
        // DER FELD-PASS (Ring-Besitz): die Ferne jenseits der Schalen — Ensure,
        // Re-Malen bei Anker-Wechsel, Kamera-Uniforms.
        this._tickFeldPass(fr);
        // DAS FERN-FARB-BUDGET: die Fern-Krone des nahen Bodens, die offenen Ring-Farben (nah zuerst), dann der Farb-Job des
        // Feld-Passes.
        this._fernFarbTakt(fr);
        // Kamera-Klippe: camera.far muss Schalen-Rand + Marge umfassen, sonst clippt der Horizont. Der Ring
        // besitzt diese Voraussetzung (EIN Ort, idempotent über _fernRingCamFar); der Dispose stellt das
        // alte far wieder her.
        const aussen = F.schalen[F.schalen.length - 1].aussen;
        if (fr.ready && st.camera && st.camera.far < aussen + 500) {
            if (!Number.isFinite(this._fernRingCamFarAlt)) this._fernRingCamFarAlt = st.camera.far;
            st.camera.far = aussen + 500;
            st.camera.updateProjectionMatrix();
        }
    }

    // Welt-Wechsel/Restore/Hook-aus: Schalen + das eigene Material entsorgen
    // (der Tick baut die neue Welt lazy nach).
    _fernRingDispose() {
        this._feldPassDispose(); // der Pass ist Ring-Besitz — er fällt mit
        this._fernFarbeMemo = null; // die Fern-Farben gehören der Welt, die den Ring trug
        const fr = this.state.fernRing;
        if (!fr) return;
        // je gezeichnetes Mesh seine Geometrie (Schale 1, Schale 2, die zwei Teile der Schale 0) und sein Stoff (die zwei
        // Stoffe, frei und Naht, geteilt — ein zweites dispose ist ohne Hörer leer)
        for (const m of fr.meshes || []) {
            if (!m) continue;
            if (this.state.scene) this.state.scene.remove(m);
            this._queueGeometryDispose(m.geometry);
            if (m.material && typeof m.material.dispose === "function") m.material.dispose();
        }
        // die volle Schale 0: der Träger der Attribute, die ihre zwei Teile teilen (sie zeichnet kein Mesh)
        if (fr.geos && fr.geos[0]) this._queueGeometryDispose(fr.geos[0]);
        if (fr.maske && fr.maske.tex) fr.maske.tex.dispose(); // die Masken-Karte des Gebauten
        // die Kamera-Weitung zurücknehmen (die Klippe war der Ring-Besitz).
        if (Number.isFinite(this._fernRingCamFarAlt) && this.state.camera) {
            this.state.camera.far = this._fernRingCamFarAlt;
            this.state.camera.updateProjectionMatrix();
            this._fernRingCamFarAlt = null;
        }
        this.state.fernRing = null;
    }

    _tickVoxelChunkStreaming(playerPos) {
        if (!this.state.voxelTerrainActive || !playerPos) return;
        if (!this.state.voxelChunks) this.state.voxelChunks = new Map();
        const { span, ringRadius } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        // V9.92 (Phase 4 — Lazy-BVH): aktuelle Spieler-Chunk-Position
        // zwischenspeichern, damit `_ensureVoxelChunkAt` Lazy-BVH-Decision
        // treffen kann (r ≤ 1 = sofort BVH, r ≥ 2 = lazy).
        this._setLastPlayerVoxelChunk(pcx, Math.floor(playerPos.z / span));
        const pcz = Math.floor(playerPos.z / span);
        // Velocity-Prefetch: die 1–2 Chunks in Laufrichtung ZUERST in die Worker-Queue (der Ring läuft in
        // fester dz/dx-Reihenfolge, der kommende Chunk käme sonst ~5.) → der Boden steht, bevor der Spieler
        // ankommt. Billige Async-Anfrage (der Ring re-fragt als no-op); nur bei > 1 m/s.
        if (this.state.playerVel) {
            const v = this.state.playerVel;
            const vx = v.x(),
                vz = v.z();
            const speedSq = vx * vx + vz * vz;
            if (speedSq > 1) {
                const inv = 1 / Math.sqrt(speedSq);
                const dirX = vx * inv,
                    dirZ = vz * inv;
                for (let ahead = 1; ahead <= 2; ahead++) {
                    const acx = pcx + Math.round(dirX * ahead);
                    const acz = pcz + Math.round(dirZ * ahead);
                    if (!this.state.voxelChunks.has(`${acx},${acz}`)) {
                        this._ensureVoxelChunkAt(acx, acz, this._voxelChunkLodFor(acx, acz, pcx, pcz, null));
                    }
                }
            }
        }
        let built = 0;
        // V18.263 — der PID-Regelkreis fährt diese zwei Stellgrößen (statt fix 4/6):
        // unter gemessener Last sinkt das Streaming-Budget → weniger Chunk-Builds pro
        // Frame → kleinerer Spike. `?? 4/6` = sicherer Default (alte Welten/Tests).
        const FRAME_BUDGET_MS = Number.isFinite(this.state._voxelStreamBudgetMs) ? this.state._voxelStreamBudgetMs : 4;
        const MAX_PER_FRAME = Number.isFinite(this.state._voxelStreamMaxPerFrame)
            ? this.state._voxelStreamMaxPerFrame
            : 6;
        // DIE STAND-WACHE: steht der Ring (jede Zelle in ihrer Stufe, keiner wartet) und regt sich nichts, geht der Gang
        // nicht — Ring, Prune und Wasser-Weckruf lesen nur Spieler-Zelle und Chunk-Menge. Nachwuchs läuft weiter.
        if (this._standRuht("strom", 1, pcx + "," + pcz, "boden")) {
            this._tickFoliageGrowth();
            return 0;
        }
        const tStart = performance.now();
        outer: for (let r = 0; r <= ringRadius; r++) {
            for (let dz = -r; dz <= r; dz++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
                    const cx = pcx + dx;
                    const cz = pcz + dz;
                    const key = `${cx},${cz}`;
                    // Distanz-LOD: gewünschte LOD je Frame aus der Spieler-Distanz; trägt ein Chunk eine ANDERE, wird
                    // er dirty + rebuildet, sonst skipt der Tick (keine Re-Allokation bei stehendem Spieler).
                    const existing = this.state.voxelChunks.get(key);
                    // N3 — die jetzige LOD des Chunks fliesst in die Distanz-Wahl
                    // (Hysterese-Deadband am Grat); ein frischer Chunk (kein
                    // `existing`) bekommt die reine Band-LOD.
                    const existingLod = existing && Number.isFinite(existing.lod) ? existing.lod : null;
                    const desiredLod = this._voxelChunkLodFor(cx, cz, pcx, pcz, existingLod);
                    if (existing) {
                        const currentLod = existingLod !== null ? existingLod : 0;
                        if (currentLod !== desiredLod && !existing.empty) {
                            this._rebuildVoxelChunk(cx, cz, desiredLod);
                            if (++built >= MAX_PER_FRAME) break outer;
                            if (performance.now() - tStart > FRAME_BUDGET_MS) break outer;
                        }
                        continue;
                    }
                    this._ensureVoxelChunkAt(cx, cz, desiredLod);
                    if (++built >= MAX_PER_FRAME) break outer;
                    // Soft-Budget nach jedem Build (inkl. des letzten `_ensureVoxelChunkAt`): mindestens ein Chunk je
                    // Frame auch über Budget — sonst friert das Streaming ein.
                    if (performance.now() - tStart > FRAME_BUDGET_MS) break outer;
                }
            }
        }
        this._pruneDistantVoxelChunks(playerPos);
        // Ein Bau-Ruf (fertig, wartend oder verworfen) hält den Ring wach; die Chunk-Menge regt die Welt selbst.
        this._standMeldet("strom", 1, false, built > 0);
        // DETERMINISMUS-BOGEN P3 — kein BVH-Pump/Watchdog mehr: die Spieler-Kollision
        // liest das Dichtefeld (`_stepCharacter`), das überall definiert ist (auch unter
        // ungebauten Chunks) → der Spieler kann nicht durchfallen, kein Sync-BVH-Anker nötig.
        this._tickFoliageGrowth(); // V18.275 — die Vegetation wächst nach, wenn der Radius wächst
        // V17.1 — die Bau-Zahl dieses Frames zurückgeben, damit der Loop die
        // Klein-Vegetation NUR streut, wenn der Ring sich gesetzt hat (Terrain-
        // Priorität, wie ein Profi-Engine: erst das Gelände, dann die Deko).
        return built;
    }

    // ### Voxel-Edits: 3D-Graben + Aufschütten ###
    // `carveVoxelSphere` schnitzt eine Kugel Luft, `fillVoxelSphere` schüttet eine Kugel Fest — beide
    // über `_addVoxelEdit`. Der Edit landet in worldMeta.voxelEdits (persistiert), `_terrainDensityAt`
    // zieht ab/addiert (Loch/Tunnel/Hügel); die betroffenen Chunks werden neu gemesht.
    _addVoxelEdit(x, y, z, r, mode) {
        if (!this.state.worldMeta) return false;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;
        if (!Array.isArray(this.state.worldMeta.voxelEdits)) this.state.worldMeta.voxelEdits = [];
        const edits = this.state.worldMeta.voxelEdits;
        const radius = Math.max(1, Math.min(12, Number(r) || 3.5));
        // y auf das nutzbare Chunk-Höhen-Band (+ Radius-Marge) klemmen: außerhalb liegen keine Dichte-
        // Zellen, der Edit wirkte nicht, triggerte aber leere Skirt-Remeshes. Weit außerhalb (> r+8) →
        // still verworfen. Band-Grenzen aus `_voxelChunkConfig` (eine Quelle).
        const base = this.state.terrainBaseHeight || 0;
        const cfg = this._voxelChunkConfig();
        const floorY = base - cfg.floorDrop;
        const ceilY = floorY + cfg.dimY * cfg.step;
        const Y_MIN = floorY - radius - 8;
        const Y_MAX = ceilY + radius + 8;
        if (y < Y_MIN || y > Y_MAX) return false;
        const yClamped = Math.max(floorY - radius, Math.min(ceilY + radius, y));
        const newEdit = { x, y: yClamped, z, r: radius, strength: 48, mode: mode === "fill" ? "fill" : "carve" };
        // Kein Deckel (K23): jeder Edit bleibt, Main und Worker tragen dieselbe Liste; die Leser fragen je Chunk (die
        // Karte, `_voxelEditKarte`). Bis K23 verdrängte ein FIFO-Deckel (256) still den ersten — nur im Main.
        edits.push(newEdit);
        // Edit-Delta an den Worker: die Generation der berührten Chunks steigt, ihre Antworten im Flug und im Cache
        // fallen; der Pump fordert frisch nach. No-op ohne gespawnten Worker (vor Worldgen).
        this._voxelWorkerNotifyEdit(newEdit);
        // `_remeshVoxelChunksAround` ist der EINZIGE Reaktiv-Pfad: die Chunks bauen neu, das Cell-Feld
        // klassifiziert die neue Lage (Carve unter waterLevel → WATER, Fill → SOLID) — Cells sind DERIVED,
        // kein Hydro-Recompute. Nur die Footprint-Chunks werden grass-dirty (Oberfläche geändert); die
        // Skirt-Nachbarn behalten ihr Gras.
        if (!this.state.grassDirtyChunks) this.state.grassDirtyChunks = new Set();
        const { span } = this._voxelChunkConfig();
        const fcx0 = Math.floor((x - radius) / span);
        const fcx1 = Math.floor((x + radius) / span);
        const fcz0 = Math.floor((z - radius) / span);
        const fcz1 = Math.floor((z + radius) / span);
        for (let fcx = fcx0; fcx <= fcx1; fcx++) {
            for (let fcz = fcz0; fcz <= fcz1; fcz++) this.state.grassDirtyChunks.add(`${fcx},${fcz}`);
        }
        // W-B (V18.90) — die CA-Level der Edit-Region VOR dem Rebuild aus den PRE-Carve-
        // Zellen seeden → das Nachfließen ist deterministisch sichtbar (s. Methoden-Doku).
        this._preSeedWaterCAForEdit(x, z, radius);
        this._remeshVoxelChunksAround(x, z, radius);
        // Die direkt berührten FOOTPRINT-Chunks SYNCHRON im Edit-Frame heilen (nicht 1/Frame verteilt) —
        // sonst ~2 Frames sichtbare Abbau-Naht zwischen Nachbarn. Die Skirt-Nachbarn (nur das 1-Zell-Pad
        // sah die Kugel, sub-cell) bleiben ASYNC → kein Edit-Cluster-Spike.
        this._syncRebuildEditFootprint(x, z, radius);
        // NACH dem Rebuild: Kappen/Quell-Markierungen/Stau-Felder der Region verwerfen — der Spill-Scan
        // muss die FRISCHEN Zellen sehen (ein Fill kann Damm sein, ein Carve ihn öffnen). Der Pre-Seed
        // löschte sie schon davor; dieser zweite Wurf macht den Lazy-Neubau wahrheits-frisch.
        this._invalidateWaterCapsAround(x, z, radius);
        // Gebackene Region-Felder im Footprint dirty markieren (Region-Raster 256 m → 1–2 Regionen).
        // Lazy-Rebake im nächsten Tick; bis dahin gelten die stale Daten.
        this._invalidateBakedRegionsAround(x, z, radius);
        // Fill unter sich darf den Spieler nicht begraben (sonst steckt er Meter unter der neuen
        // Oberfläche im Fels) → Rettung. Nur fill schließt ein; carve öffnet.
        if (mode === "fill") this._rescuePlayerFromEditSolid(x, yClamped, z, radius);
        // T4a-2 — den Wasser-Automaten in der Carve-Region + 1-Ring WECKEN: die Zellen änderten sich
        // (neuer Raum geöffnet/verfüllt) → das Wasser strömt nach (active-cell, settled danach inaktiv).
        {
            const { span } = this._voxelChunkConfig();
            const minCX = Math.floor((x - radius) / span) - 1;
            const maxCX = Math.floor((x + radius) / span) + 1;
            const minCZ = Math.floor((z - radius) / span) - 1;
            const maxCZ = Math.floor((z + radius) / span) + 1;
            for (let cx = minCX; cx <= maxCX; cx++) for (let cz = minCZ; cz <= maxCZ; cz++) this._wakeWaterCA(cx, cz);
        }
        // Persistenz debounced (~1.2 s nach dem letzten Hit): `saveState()` baut den VOLLEN Snapshot +
        // JSON.stringify + synchrones localStorage.setItem — je Carve-Hit ein Ruckler. Der Edit liegt schon
        // in `worldMeta.voxelEdits`; World-Switch/Beforeunload/andere Saves flushen sofort.
        this._scheduleEditSave();
        return true;
    }

    // Pre-Carve-Seed: die CA-Level der Edit-Region VOR dem Rebuild aus den Pre-Carve-Zellen seeden. Der
    // Re-Flood füllt die Zellen instant (statische Wahrheit), das LIVE-Level hält die Ruhe von davor →
    // der CA füllt den neuen Raum sichtbar über Ticks (deterministisch, unabhängig von sync/async).
    // Muss VOR `_remeshVoxelChunksAround`/`_syncRebuildEditFootprint` laufen.
    _preSeedWaterCAForEdit(x, z, radius) {
        if (!this.state.voxelChunks) return;
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - radius) / span) - 1;
        const maxCX = Math.floor((x + radius) / span) + 1;
        const minCZ = Math.floor((z - radius) / span) - 1;
        const maxCZ = Math.floor((z + radius) / span) + 1;
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                // V18.93 — die Spiegel-Kappe der Edit-Region REFRESHEN (ein Carve senkt
                // den Boden → die Boden+Skin-Kappe jenseits des Atlas muss mitwandern).
                if (this.state.waterCapJ) this.state.waterCapJ.delete(`${cx},${cz}`);
                if (this.state.waterSourceCols) this.state.waterSourceCols.delete(`${cx},${cz}`);
                this._ensureWaterCALevel(cx, cz);
            }
        }
    }

    carveVoxelSphere(x, y, z, r) {
        return this._addVoxelEdit(x, y, z, r, "carve");
    }

    fillVoxelSphere(x, y, z, r) {
        return this._addVoxelEdit(x, y, z, r, "fill");
    }

    // Zieht `n` Material-Einheiten aus dem Inventar (alle Material-Slots, FIFO); false + Inventar
    // unberührt, wenn nicht genug da ist. Irgendein Material — die Voxel-Farbe kommt aus dem Welt-Feld.
    _consumeAnyMaterial(n) {
        const inv = this.state.player && this.state.player.inventory;
        if (!Array.isArray(inv)) return false;
        let total = 0;
        for (const slot of inv) {
            if (slot && slot.kind === "material") total += slot.count || 0;
        }
        if (total < n) return false;
        let remaining = n;
        for (let i = 0; i < inv.length && remaining > 0; i++) {
            const slot = inv[i];
            if (slot && slot.kind === "material" && slot.count > 0) {
                const take = Math.min(slot.count, remaining);
                slot.count -= take;
                remaining -= take;
                if (slot.count <= 0) inv[i] = null;
            }
        }
        return true;
    }

    // Modus-Gate fürs Aufschütten (Spiegel von `_buildMaterialGate`): pfad = Material-Kreis (graben
    // gibt, aufschütten kostet COST Material); frieden + schöpfer formen frei.
    _voxelFillGate() {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return { ok: true, free: true };
        const COST = 4;
        if (this._consumeAnyMaterial(COST)) return { ok: true, free: false, cost: COST };
        return { ok: false, reason: "kein Material" };
    }

    // Liegt ein CARVE-Edit in der 3×3-Chunk-Region um (cx,cz)? Nur dort seedet die Flut aus Nachbar-
    // Zellen (`_buildVoxelChunkWaterCells`) und baut der Chunk SYNC-MAIN (`_rebuildVoxelChunk`), damit
    // die Flut über die Naht läuft; unberührte Chunks bleiben atlas-only = bit-identisch zum Worker.
    _chunkRegionHasCarve(cx, cz) {
        const edits = this._voxelEditsNah(cx, cz);
        if (!edits.length) return false;
        const { span } = this._voxelChunkConfig();
        const loX = (cx - 1) * span,
            hiX = (cx + 2) * span,
            loZ = (cz - 1) * span,
            hiZ = (cz + 2) * span;
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (ed && ed.mode === "carve" && ed.x >= loX && ed.x <= hiX && ed.z >= loZ && ed.z <= hiZ) return true;
        }
        return false;
    }

    // Markiert jeden Chunk, den die Schnitz-Kugel berührt (±`skirt` Chunks), als dirty;
    // `_tickDirtyVoxelChunks` baut sie verteilt (≤1/Frame, nächster zuerst) statt 9 Sync-Rebuilds im
    // selben Frame. Tests drainen per `_drainDirtyVoxelChunks()`. skirt=1 für Density-Edits (Pad+Crop
    // liest 1 Cell in den Nachbarn → sonst Naht); skirt=0 für Architektur (nur Cell-Stempel, keine
    // Density → ~89 % weniger Rebuilds).
    _remeshVoxelChunksAround(x, z, r, skirt = 1) {
        if (!this.state.voxelChunks || this.state.voxelChunks.size === 0) return;
        if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - r) / span) - skirt;
        const maxCX = Math.floor((x + r) / span) + skirt;
        const minCZ = Math.floor((z - r) / span) - skirt;
        const maxCZ = Math.floor((z + r) / span) + skirt;
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (this.state.voxelChunks.has(key)) {
                    this.state.dirtyVoxelChunks.add(key);
                }
            }
        }
    }

    // Heilt die FOOTPRINT-Chunks (skirt=0, die die Kugel wirklich überdeckt) SYNCHRON im Edit-Frame —
    // derselbe Pfad wie `_drainDirtyVoxelChunks` (forceSync, dispose-before-build, Wasser-Iso sync).
    // Skirt-Nachbarn bleiben async (Oberfläche unverändert). Billig (~2 ms/Chunk über den Base-
    // Density-Cache) → 2–4 Chunks ≈ sub-Frame.
    _syncRebuildEditFootprint(x, z, r) {
        if (!this.state.voxelChunks || this.state.voxelChunks.size === 0) return;
        if (!this.state.dirtyVoxelChunks) return;
        // Über Budget den Footprint NICHT sync bauen: die Chunks bleiben dirty und heilen async (Kollision
        // ist feld-nativ sofort korrekt, der Mesh swappt 1–2 Frames später, kein Loch) — sonst ~126 ms
        // Stall je Carve auf schwacher HW. Test/Naht erzwingen sync über
        // `_rebuildVoxelChunk(... forceSync:true)`.
        if (this.state._frameOverBudget) return;
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - r) / span);
        const maxCX = Math.floor((x + r) / span);
        const minCZ = Math.floor((z - r) / span);
        const maxCZ = Math.floor((z + r) / span);
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (!this.state.voxelChunks.has(key)) continue;
                // aus dem Dirty-Set nehmen (wir bauen ihn JETZT) + sync rebuilden. Bei Fail
                // (OOM) re-markiert `_completeVoxelRebuild` ihn dirty → der async-Tick versucht's.
                this.state.dirtyVoxelChunks.delete(key);
                this._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
            }
        }
    }

    // Game-Loop-Hook: rebuildet je Frame max EINEN dirty Chunk, den nächsten zum Spieler (Manhattan) —
    // der Klick-Ort zuerst, Skirt-Nachbarn folgen. Leeres Set kostet eine `size`-Prüfung; Pending/Fail
    // re-dirtyt `_rebuildVoxelChunk` selbst.
    _tickDirtyVoxelChunks(playerPos) {
        if (!this.state.dirtyVoxelChunks || this.state.dirtyVoxelChunks.size === 0) return;
        if (!this.state.voxelChunks || !playerPos) return;
        const { span } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        const pcz = Math.floor(playerPos.z / span);
        let bestKey = null;
        let bestDist = Infinity;
        for (const key of this.state.dirtyVoxelChunks) {
            // Streaming-Prune kann dirty Chunks aus voxelChunks entfernt
            // haben (Spieler ging weg) — Marker stumm verwerfen.
            if (!this.state.voxelChunks.has(key)) {
                this.state.dirtyVoxelChunks.delete(key);
                continue;
            }
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            const d = Math.abs(cx - pcx) + Math.abs(cz - pcz);
            if (d < bestDist) {
                bestDist = d;
                bestKey = key;
            }
        }
        if (!bestKey) return;
        this.state.dirtyVoxelChunks.delete(bestKey);
        const comma = bestKey.indexOf(",");
        const cx = parseInt(bestKey.slice(0, comma), 10);
        const cz = parseInt(bestKey.slice(comma + 1), 10);
        this._rebuildVoxelChunk(cx, cz);
    }

    // Test-Naht: rebuildet ALLE dirty Chunks sofort mit `forceSync: true` (sonst liefe der Drain
    // headless gegen den async Worker-Pfad und baute nichts). Im Spiel-Pfad NIE gerufen.
    _drainDirtyVoxelChunks() {
        if (!this.state.dirtyVoxelChunks || this.state.dirtyVoxelChunks.size === 0) return 0;
        const keys = [...this.state.dirtyVoxelChunks];
        let built = 0;
        for (const key of keys) {
            this.state.dirtyVoxelChunks.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            if (this._rebuildVoxelChunk(cx, cz, null, { forceSync: true })) built++;
        }
        // V12.0-perf.h — der Rebuild enqueued den Wasser-Iso (deferred); die
        // Test-Naht braucht ihn sofort → die Wasser-Iso-Queue mit-drainen.
        this._drainPendingWaterIso();
        // Welle A — desgleichen das deferred Gras (sonst sehen Tests, die nach
        // dem Drain `voxelChunkGrass` lesen, leere Chunks).
        this._drainPendingGrass();
        return built;
    }

    generateNewWorld({ force = false } = {}) {
        // Cool-Down verhindert Death-Spirals: ohne ihn rief die Selbstanalyse
        // generateNewWorld() im Sekundentakt, während der Spieler durch das
        // gerade gelöschte Terrain fiel.
        const now = performance.now() / 1000;
        if (!force && now - this.state.lastWorldgen < this.state.worldgenCooldown) {
            this.log(
                `generateNewWorld unterdrückt (Cool-Down, noch ${(this.state.worldgenCooldown - (now - this.state.lastWorldgen)).toFixed(1)}s)`,
                "DEBUG"
            );
            return false;
        }
        // Kein Voxel-Flag-Sync: Voxel ist permanent (`worldMeta.voxelTerrain` via `ensureWorldMeta`). Alte
        // Voxel-Chunks bleiben; der Streaming-Ring + `_pruneDistantVoxelChunks` räumen sie.
        this.state.lastWorldgen = now;
        // Der Foundry-Worker startet VOR dem synchronen Worldgen-Block: er lädt Kerne + wärmt die
        // Bibliothek, während Main die Welt rechnet. Billig (Worker + Posts); das Boot-Gate prüft
        // `_ensureAssetFoundry` selbst (foundry-aus → null) — der Aufrufer dupliziert es nicht.
        if (!this._foundry) this._ensureAssetFoundry(); // ihr Boot-Fehler bricht in ihr selbst laut (K22)
        this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
        return true;
    }

    // ### Persistenz ###

    // `_serializeBlueprint` + `_deserializeBlueprint` sind die EINE Quelle des persistenten Bauplan-
    // Feld-Satzes (Snapshot, loadState, Welt-Wechsel) — jede Eigenschaft ist ein Ein-Stellen-Edit.
    // `_carryUnknown`: unbekannte Felder überleben jeden Round-Trip (must-preserve). knownKeys = ALLE
    // explizit behandelten Schlüssel (auch sanitisierte — nie Umgehung einer Wand); Werte als JSON-
    // Klon, Größen-Wand 8 KiB/Feld (Schutz der localStorage-Quota).
    _carryUnknown(src, dst, knownKeys) {
        if (!src || typeof src !== "object" || !dst || typeof dst !== "object") return dst;
        const known = knownKeys instanceof Set ? knownKeys : new Set(knownKeys);
        for (const k of Object.keys(src)) {
            if (known.has(k)) continue;
            try {
                const json = JSON.stringify(src[k]);
                if (typeof json !== "string" || json.length > AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) continue;
                dst[k] = JSON.parse(json);
            } catch {
                /* nicht-serialisierbar (Zyklus/Funktion) → fällt still */
            }
        }
        return dst;
    }

    // Der EINE Material-Serialize (Snapshot + Welt-Wechsel-Mitnahme): das ganze tags-Objekt (auch
    // fremde/künftige Tag-Achsen) + Unbekanntes via _carryUnknown.
    _serializeMaterial(m) {
        const out = {
            name: m.name,
            label: m.label || m.name,
            color: m.color,
            tags: { ...m.tags },
        };
        this._carryUnknown(m, out, AnazhRealm.MATERIAL_KNOWN_KEYS);
        return out;
    }

    // Ω2 — der EINE Tool-Serialize (gleiche Verdichtung). isMachine + künftige
    // Felder reisen via _carryUnknown (starben vorher im fixen Satz).
    _serializeTool(t) {
        const out = {
            name: t.name,
            label: t.label,
            opClass: t.opClass,
            opName: t.opName,
            precisionCap: t.precisionCap,
            sourceBlueprint: t.sourceBlueprint || null,
        };
        this._carryUnknown(t, out, AnazhRealm.TOOL_KNOWN_KEYS);
        return out;
    }

    // Serialisiert einen Bauplan in ein JSON-taugliches Objekt. Reine
    // Transformation (liest nur bp.*); der Aufrufer filtert die Built-ins
    // (sie entstehen je Init aus _defaultBlueprints()).
    _serializeBlueprint(bp) {
        const out = {
            name: bp.name,
            label: bp.label || bp.name,
            parts: Array.isArray(bp.parts) ? JSON.parse(JSON.stringify(bp.parts)) : [],
            connections: Array.isArray(bp.connections) ? JSON.parse(JSON.stringify(bp.connections)) : [],
        };
        if (bp.role === "tool" && bp.toolMeta) {
            out.role = "tool";
            out.toolMeta = { opName: bp.toolMeta.opName, opClass: bp.toolMeta.opClass };
        }
        // S3-B (kampf-plan §11.7) — die Schmiede-Qualität reist mit: ein geschmiedetes Gerät bleibt
        // geschmiedet (forgedPrecision gesetzt) über den Reload → der Werk-Akt wird nicht beim Laden
        // entwertet, der Gebrauch bleibt frei (sonst müsste man nach jedem Reload neu schmieden/zahlen).
        if (Number.isFinite(bp.forgedPrecision)) out.forgedPrecision = bp.forgedPrecision;
        // Der wear-Stand reist mit (sonst startete jedes geladene Gerät bei wear=1 → Katalysator-Lücke).
        // Nur wenn gesetzt und < 1 — alte Saves ohne wear bleiben klein.
        if (Number.isFinite(bp.wear) && bp.wear < 1) out.wear = Math.max(0, Math.min(1, bp.wear));
        // Die Waffen-Rolle reist mit (sonst verlöre eine geschmiedete Waffe Rolle + Equip-Bindung). Kein
        // Meta — das Profil emergiert aus den Parts.
        if (bp.role === "weapon") {
            out.role = "weapon";
            if (bp.roleManual) out.roleManual = true;
        }
        // Portal-Bauplan: Rolle + portalMeta (das Welt-Ziel) müssen mitreisen, sonst fällt ein geholtes
        // Portal auf die Skelett-Welt zurück und klebt als _isMoveable am Körper. roleManual schützt die
        // Rolle vor der Emergenz.
        if (bp.role === "portal" && bp.portalMeta) {
            out.role = "portal";
            if (bp.roleManual) out.roleManual = true;
            out.portalMeta = {
                world: bp.portalMeta.world,
                label: bp.portalMeta.label,
                dsl: Array.isArray(bp.portalMeta.dsl) ? bp.portalMeta.dsl.slice() : null,
            };
            // KI-Übersetzer Phase 2 — die translatedWorldId muss mitreisen,
            // sonst verlöre ein geholtes Übersetzer-Portal beim Reload sein
            // Szenen-Ziel (V8.59-Lehre).
            if (bp.portalMeta.translatedWorldId) {
                out.portalMeta.translatedWorldId = bp.portalMeta.translatedWorldId;
            }
            // V8.70 — die Vertrauensstufe reist mit, sonst verlöre ein
            // geholtes Untrusted-Portal beim Reload seine null-origin-Sandbox.
            if (bp.portalMeta.trust) out.portalMeta.trust = bp.portalMeta.trust;
            // W17 Phase A — die Multiplayer-Marke reist mit, sonst verlöre
            // ein Multiplayer-Portal beim Reload den Transport-Shim.
            if (bp.portalMeta.multiplayer === true) out.portalMeta.multiplayer = true;
            // W17 Phase B-JS-Compute — der Server-Modus reist mit, sonst
            // verlöre ein js-compute-Portal beim Reload den Compute-Host-Pfad.
            if (bp.portalMeta.serverMode === "js-compute") {
                out.portalMeta.serverMode = "js-compute";
            }
            // W18-B — die Ko-Präsenz-Marke reist mit, sonst verlöre ein
            // Ko-Präsenz-Portal beim Reload die Pose-Injektion (V8.59-Lehre).
            if (bp.portalMeta.coPresence === true) out.portalMeta.coPresence = true;
        }
        // JEDE deklarierte Rolle reist (roleManual = Intent: Werkstatt-Designation · armor · consumable ·
        // soul · vehicle). Fremde Artefakte bleiben gesiebt: _admitForeignArtifact löscht roleManual und
        // re-derived (Ω3) — diese Reise gilt dem EIGENEN Save.
        if (bp.role && bp.roleManual === true) {
            if (!out.role) out.role = bp.role;
            out.roleManual = true;
        }
        // W13 Phase 2 — die Bauplan-Signatur reist mit dem Bauplan (Save,
        // Welt-Tor-Export, Recipe-Import, Fusion). Echtheit prüft
        // verifyBlueprintSignature beim Anzeigen.
        if (bp.signature && bp.authorPubKey) {
            out.signature = bp.signature;
            out.authorPubKey = bp.authorPubKey;
            if (bp.signedHash) out.signedHash = bp.signedHash;
            if (bp.signedAt) out.signedAt = bp.signedAt;
        }
        // Ω2 (taille-spec §1a/§2) — die R4-Herkunftskette reist mit (GEMESSEN
        // Ω0: sie starb im Save — der Rückruf konnte ein gespeichertes Artefakt
        // nur über authorPubKey treffen, nie über ein Ketten-Glied).
        const prov = this._sanitizeProvenance(bp.provenance);
        if (prov.length) out.provenance = prov;
        // Ω3(a) — die gereiste Autor-Behauptung (Metadatum) reist weiter.
        if (typeof bp.roleClaimed === "string" && bp.roleClaimed) out.roleClaimed = bp.roleClaimed;
        // PRÄGUNG-WELT — der Guss-Stempel des Bauplans reist EXPLIZIT (deklariertes
        // System-Feld, nicht via must-preserve): ein geprägtes Gerät bleibt geprägt
        // über den Reload (die Hand liest bp.studioOv — sonst Guss-Verlust beim Laden).
        if (bp.studioOv && typeof bp.studioOv === "object" && !Array.isArray(bp.studioOv)) {
            try {
                out.studioOv = JSON.parse(JSON.stringify(bp.studioOv));
            } catch (_e) {
                /* nicht-serialisierbar → fällt still (fail-closed) */
            }
        }
        // Ω2 — must-preserve: Unbekanntes überlebt den Round-Trip (EINE Quelle).
        this._carryUnknown(bp, out, AnazhRealm.BLUEPRINT_KNOWN_KEYS);
        return out;
    }

    // Baut aus einem serialisierten Bauplan (Save / Welt-Tor / Mesh) den lebenden Eintrag: migriert
    // alte Parts (kein material → „stein", keine opChain → Default-Kette), sanitisiert Verbindungen,
    // portalMeta via _sanitizePortalMeta, prüft die Signatur strukturell. Liefert den Eintrag
    // (builtIn:false) oder null; die Registrierungs-Politik entscheidet der Aufrufer.
    _deserializeBlueprint(data) {
        if (!data || typeof data.name !== "string" || !Array.isArray(data.parts)) return null;
        // Welle 4 Phase 1+3 — Migration alter Parts: kein material → Default
        // „stein", keine opChain → Default-Kette. Sicheres Default, keine
        // Datenverluste.
        const migratedParts = data.parts.map((p) => {
            if (!p || typeof p !== "object") return p;
            const out = { ...p };
            if (typeof out.material !== "string" || !this.state.materials[out.material]) {
                out.material = "stein";
            }
            if (!Array.isArray(out.opChain) || out.opChain.length === 0) {
                out.opChain = this._defaultPartOpChain();
            }
            return out;
        });
        // Welle 5 A — connections sanitisieren beim Load.
        const validConnections = this.validateBlueprintConnections(data.connections || [], migratedParts.length);
        const restored = {
            name: data.name,
            label: data.label || data.name,
            builtIn: false,
            parts: migratedParts,
            connections: validConnections,
        };
        // S3-B — geschmiedet bleibt geschmiedet (Gegenstück zu _serializeBlueprint).
        if (Number.isFinite(data.forgedPrecision)) restored.forgedPrecision = data.forgedPrecision;
        // W5 (V18.192, R-031) — die Abnutzung reist mit; ein fehlendes Feld liest 1 (voll;
        // Migration: ein altes Save bekommt seine Werkzeuge frisch zurück, ehrlich).
        if (Number.isFinite(data.wear) && data.wear >= 0 && data.wear <= 1) restored.wear = data.wear;
        // Welle 5 C — role + toolMeta beim Load wiederherstellen.
        if (
            data.role === "tool" &&
            data.toolMeta &&
            AnazhRealm.TOOL_OP_CLASSES.has(data.toolMeta.opClass) &&
            AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(data.toolMeta.opName || ""))
        ) {
            restored.role = "tool";
            restored.toolMeta = { opName: data.toolMeta.opName, opClass: data.toolMeta.opClass };
        }
        // V17.52 Kampf Phase B — die Waffen-Rolle wiederherstellen (Gegenstück zu
        // _serializeBlueprint). Die Parts tragen das Profil; roleManual schützt
        // die Rolle vor der Emergenz.
        if (data.role === "weapon") {
            restored.role = "weapon";
            if (data.roleManual === true) restored.roleManual = true;
        }
        // portalMeta läuft durch _sanitizePortalMeta (erzwingt einen same-origin worlds/-Pfad) — ein
        // manipulierter Save schmuggelt kein fremdes Origin ins Portal-iframe.
        if (data.role === "portal" && data.portalMeta && typeof data.portalMeta === "object") {
            restored.role = "portal";
            if (data.roleManual === true) restored.roleManual = true;
            restored.portalMeta = this._sanitizePortalMeta(data.portalMeta, restored.label);
        }
        // Gegenstück zur Serialize-Reise: JEDE deklarierte Rolle kehrt zurück, aber nur Register-bekannte
        // (kein Müll-String aus manipulierten Saves). Fremde Artefakte: _admitForeignArtifact löscht
        // roleManual danach (Ω3).
        if (
            !restored.role &&
            typeof data.role === "string" &&
            data.roleManual === true &&
            AnazhRealm.ROLE_SIGNATURES[data.role]
        ) {
            restored.role = data.role;
            restored.roleManual = true;
        }
        // Signatur nur strukturell prüfen (Hex-Form); die echte Verifikation macht
        // verifyBlueprintSignature beim Anzeigen (kaputt/gefälscht → „forged").
        if (
            typeof data.signature === "string" &&
            /^[0-9a-f]{2,256}$/i.test(data.signature) &&
            typeof data.authorPubKey === "string" &&
            /^[0-9a-f]{64}$/i.test(data.authorPubKey)
        ) {
            restored.signature = data.signature;
            restored.authorPubKey = data.authorPubKey;
            if (typeof data.signedHash === "string") restored.signedHash = data.signedHash;
            if (typeof data.signedAt === "number") restored.signedAt = data.signedAt;
        }
        // Herkunftskette wiederherstellen (gesäubert — die Hex-Wand gilt auch dem Save) + must-preserve:
        // _carryUnknown trägt NUR, was nicht im known-Satz steht (Sicherheits-Keys bleiben sanitisiert).
        const prov = this._sanitizeProvenance(data.provenance);
        if (prov.length) restored.provenance = prov;
        // Ω3(a) — die gereiste Autor-Behauptung (Metadatum, string-gewandet).
        if (typeof data.roleClaimed === "string" && data.roleClaimed) restored.roleClaimed = data.roleClaimed;
        // PRÄGUNG-WELT — der Guss-Stempel kehrt zurück (Gegenstück zu _serializeBlueprint):
        // NUR ein non-leeres plain object, tief kopiert + größen-bewacht (dieselbe
        // 8-KiB-Taille-Wand wie _carryUnknown — kein Save-/Peer-Riesenstempel).
        if (data.studioOv && typeof data.studioOv === "object" && !Array.isArray(data.studioOv)) {
            try {
                const json = JSON.stringify(data.studioOv);
                if (json && json.length > 2 && json.length <= AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX) {
                    restored.studioOv = JSON.parse(json);
                }
            } catch (_e) {
                /* nicht-serialisierbar → fällt still (fail-closed) */
            }
        }
        this._carryUnknown(data, restored, AnazhRealm.BLUEPRINT_KNOWN_KEYS);
        return restored;
    }
}
