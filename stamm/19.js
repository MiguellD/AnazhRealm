class AnazhRealm_Z19 {
    // ===== ATLAS §19 · LICHT/WASSER-REGLER — alle Render-Setter (EINE Quelle je Regler) =====
    // Wasser-Cull (uMinDepth): dünnes Wasser pro Pixel verwerfen (optischer Weg < uMinDepth → Alpha 0
    // via mat.alphaTest). Wert in METERN optischen Wegs (0 … 0,05 m, seit dem Durchlass-Gesetz); 0 = aus.
    setWaterCull(minDepth) {
        const m = Math.max(0.0, Math.min(0.05, Number(minDepth) || 0.0));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterCull = m;
        // Das geteilte Hydro-Surface-Uniform live setzen (lazy initialisiert beim
        // ersten Material-Bau; nur setzen, wenn schon da).
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.minDepth) {
            this.state.hydroSurfaceUniforms.minDepth.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V18.15 Phase 3 — der See-Wellen-Floor (uLakeRipple, 0..1): wie stark See/Fluss
    // kräuseln (0 = flach, 0.06 sanft, 1 = wie Ozean). Live an die Uniform.
    setLakeRipple(v) {
        const m = Math.max(0.0, Math.min(1.0, Number(v) || 0.06));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterLakeRipple = m;
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.lakeRipple) {
            this.state.hydroSurfaceUniforms.lakeRipple.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V18.14 M1 — die MAKRO-bewusste Schaum-Tiefe (uDepthFoam, in Metern): der Schaum
    // schäumt nur Wasser flacher als dieser Tiefe (die echte Uferlinie). Kleiner = der
    // flache Fluss schäumt weniger; grösser = mehr Schaum auch im flachen Wasser.
    setWaterDepthFoam(meters) {
        const m = Math.max(0.1, Math.min(6.0, Number(meters) || 1.2));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterDepthFoam = m;
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.depthFoam) {
            this.state.hydroSurfaceUniforms.depthFoam.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // (V18.111 — A4: setWaterfallSteep ist GESCHNITTEN — die Plane fiel,
    // das CA-Wildwasser [aSlope] trägt steile Läufe.)

    // Mikro-Struktur-Regler (microStrength, 0…0.4): setzt das Uniform live + persistiert in atmosphere.
    setMicroStrength(v) {
        const val = Math.max(0, Math.min(0.4, Number(v) || 0));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.microStrength = val;
        const au = this._ensureAtmoUniforms();
        if (au && au.microStrength) au.microStrength.value = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    // R5-Struktur-Boost: Mikro-Tiefe der OPAKEN Strukturen (werk-Profil: Bauwerke/Deko/Avatare/
    // Kreaturen), multipliziert das micro-Gewicht in `_applySubstanceResponse`; live + persistiert in
    // atmosphere.r5StructureBoost. 1.0 = neutral, 1.3 = Default, bis 2.5. NICHT das Terrain (eigener
    // colorNode-Triplanar).
    setStructureBoost(v) {
        const val = Math.max(0.5, Math.min(2.5, Number(v) || 1.3));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.r5StructureBoost = val;
        const au = this._ensureAtmoUniforms();
        if (au && au.r5StructureBoost) au.r5StructureBoost.value = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    // M7 (Befund 20) → W-E — der NACHT-BODEN-Regler ist seit dem Frequenzband
    // ein BAND-Regler (Füll-Licht ALLER opaken Ebenen, profil-gewichtet):
    // 0 = das alte Schwarz, 0.06 = das Schöpfer-Wort (R-013), höher = heller.
    setTerrainNightFloor(v) {
        const val = Math.max(0, Math.min(0.3, Number(v) || 0));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.terrainNightFloor = val;
        const au = this._ensureAtmoUniforms();
        if (au && au.terrainNightFloor) au.terrainNightFloor.value = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    // §7.5(a) (V18.164) — die BASIS-Stärke des Terrain-Mond-Rims (0..0.5).
    // Den LIVE-Wert treibt der Tag-Nacht-Sync (nachts Basis, tags 0) — dieser
    // Setter stellt nur die Basis; der nächste Sync-Tick übernimmt sie.
    setTerrainMoonRim(v) {
        const val = Math.max(0, Math.min(0.5, Number(v) || 0));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.moonRim = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    setCavityAO(scale) {
        // V17.109 — Headroom: Bereich 0..2 (200 %), damit 100 % die Mitte ist
        // (Schöpfer-Wunsch „nicht am Anschlag"). >1 verstärkt die AO über den
        // Default; der aoCap im Shader bleibt der Sicherheits-Deckel.
        const v = Math.max(0, Math.min(2, Number(scale)));
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.cavityAO = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.aoScale) this.state.atmoUniforms.aoScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // (V18.106 — B3: setTerrainFlatten ist GESCHNITTEN — die 2.5D-Lichtung ist
    // in die Geometrie gebacken [TERRAIN_NORMAL_FLATTEN], der Slider weicht.)

    // V17.104-Regler — die Farb-Variation (V17.12-Makro-Tint-Stärke, 0..1). 0 = reine
    // Basisfarbe (testet, ob die warm/kühl-Patches die „zwei Basisfarben" sind, die
    // unter Licht zu Trapeze-Parzellen auseinanderdriften — Schöpfer-Diagnose).
    setColorVariation(scale) {
        const v = Math.max(0, Math.min(2, Number(scale))); // V17.109 Headroom 0..2
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.colorVar = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.tintScale) this.state.atmoUniforms.tintScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V17.103-Regler — die Oberflächen-Textur (triplanar Striation-Stärke, 0..1).
    // 0 = glatte Terrain-Farbe (testet, ob die „Holzmaserung" die Trapeze betont).
    setSurfaceTexture(scale) {
        const v = Math.max(0, Math.min(4, Number(scale))); // V17.109 Headroom 0..4 (Schöpfer liebt die Striation, will >200%)
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.triplanar = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.triplanarScale)
            this.state.atmoUniforms.triplanarScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // WELLE J4-Regler — die Kanten-Schärfe (Post-FX local-contrast/Unsharp).
    // Verstärkt Helligkeits-Kanten (schärft Cel-/Facetten-Grenzen NACH, screen-
    // space → flackert) — der zweite Verdacht. 0 = aus und Default (F1, die Foto-Kette).
    setEdgeSharp(amount) {
        const v = Math.max(0, Math.min(1, Number(amount)));
        const m = Number.isFinite(v) ? v : 0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.kantenSchaerfe = m;
        if (this.state.postProcessingUniforms && this.state.postProcessingUniforms.localContrast)
            this.state.postProcessingUniforms.localContrast.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // Schatten-Reichweite = Frustum-Halbbreite der Shadow-Camera in Metern; Texel = 2·m / mapSize →
    // kleiner = schärfer + billiger (weniger Caster), aber weniger Abdeckung; der Light-Space-Snap folgt.
    // DIE EINE Anwende-Quelle (Kamera + CSM), OHNE persist: der Perf-Regler ruft sie pro Frame mit der
    // effektiven Reichweite, ohne den User-Ceiling (`atmosphere.shadowRange`) oder saveState zu berühren.
    _applyEffectiveShadowRange(m) {
        const dl = this.state.directionalLight;
        if (dl && dl.shadow && dl.shadow.camera) {
            const sc = dl.shadow.camera;
            sc.left = -m;
            sc.right = m;
            sc.top = m;
            sc.bottom = -m;
            sc.updateProjectionMatrix();
            this._hauptSchattenBias(dl); // der Texel der Haupt-Karte folgt der Reichweite
        }
        const csm = this.state.csmNode;
        if (csm) {
            csm.maxFar = m * AnazhRealm.SCHATTEN_FERN_FAKTOR;
            if (csm.camera) csm.updateFrustums();
        }
        this._shadowRangeApplied = m;
    }

    setShadowRange(meters) {
        const v = Math.max(80, Math.min(400, Number(meters)));
        const m = Number.isFinite(v) ? v : 300;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.shadowRange = m; // der User-CEILING (der Regler skaliert darunter)
        this._applyEffectiveShadowRange(m);
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // DER SCHATTEN-HEBEL (`atmosphere.shadowBias`, 0..3, Standard 1): er skaliert das GESETZ des Bias (`_schattenBias`) — bis
    // 0710-12 war er der normalBias selbst, ein fester Meter-Wert für jede Kaskade (1,0 m: kein Werfer unter ~1 m erreichte den
    // Boden). Jeder gespeicherte Stand trägt 1 = das Gesetz. Er stellt jede Karte sofort: das Haupt-Licht (der Rückfall ohne
    // Kaskaden) und jede Kaskade mit der Box ihres letzten Renders (B4, V18.130: die Kaskaden-Lichter klonen nur beim Init).
    setShadowBias(bias) {
        const v = Math.max(0, Math.min(3, Number(bias)));
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.shadowBias = m;
        this._hauptSchattenBias(this.state.directionalLight);
        const csm = this.state.csmNode;
        if (csm && Array.isArray(csm.lights) && csm._anazhFit)
            csm.lights.forEach((lw, i) => {
                const f = csm._anazhFit[i];
                if (lw && lw.shadow && f)
                    this._schattenBias(
                        lw,
                        Math.max(f.W / lw.shadow.mapSize.width, f.H / lw.shadow.mapSize.height),
                        f.zt - f.zb
                    );
            });
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // DAS GESETZ DES SCHATTEN-BIAS (0710-12) — je Karte aus ihrer Texel-Kante, nie ein Meter-Wert für alle Kaskaden. Befund
    // (Studio-Welle S3, Familie kreatur): `normalBias` 1,0 m für beide Kaskaden; r184 schiebt die Probe jedes Empfängers um
    // `normalWorld × normalBias` in WELT-METERN (ShadowNode: `positionWorld.add(normalWorld.mul(normalBias))`), der Boden fragte
    // die Karte 1 m über sich ab — Wolf, Fuchs, Busch, Zaun-Pfosten und die Beine des Spielers warfen keinen sichtbaren
    // Schatten (Boden-IoU ≈ 0; die Kaskaden tragen an der Wiese 0,11–0,16 / 0,16–0,41 m je Texel, 1 m waren 3–9 Texel). Akne
    // entsteht innerhalb EINES Texels — der Bias, der sie hält, ist ein Bruchteil der Texel-Kante:
    //   normalBias = normalTexel · Hebel · Texel   (`_schattenNormalBias`, die EINE Quelle `atmosphere.shadowBias`)
    //   bias       = −tiefeTexel · Texel / Tiefe der Box   (r184 addiert ihn auf die Tiefe der Schatten-Koordinate, 0..1)
    // `texel` = die gröbere Kante der Karte (Welt-Meter), `tiefe` = Fern- minus Nah-Ebene ihrer Kamera. Gemessen 09.10. (GTX 1060,
    // gate:schatten-bias --echt, 2-mm-Platten eben · im Streiflicht 10° · Dach 40° bei 11° und 26° Sonne): die Akne-Kante liegt
    // zwischen 0,1/0 und 0,25/0,4 Texel (normal/Tiefe); ohne Normal-Anteil (0/1) streift das Streiflicht 4,9 %; das Gesetz 0,5/0,75
    // hält jede Platte bei 0,00 % und die kleinen Werfer am Fuß (Boden-IoU mit Saum 0,97–1,0).
    // KEIN HANG-BIAS: r184 trägt den hang-skalierten Tiefen-Bias (polygonOffset des Schatten-Stoffs → Pipeline
    // depthBiasSlopeScale) nicht verlässlich — der Pipeline-Schlüssel enthält ihn nicht (WebGPUBackend.getRenderCacheKey), der
    // Stoff-Schlüssel kennt Zahlen nur als 0/≠0, und r184 legt den Schatten-Stoff einer Kaskade neu an (bei der Geburt gesetzt,
    // im Lauf wieder 0: gemessen 09.10.). Ein Bias, der nach dem nächsten Neubau still fehlt, wäre der Bruch.
    _schattenBias(licht, texel, tiefe) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const sh = licht && licht.shadow;
        if (!sh || !(texel > 0) || !(tiefe > 0)) return;
        sh.normalBias = this._schattenNormalBias(texel);
        sh.bias = (-K.tiefeTexel * texel) / tiefe;
    }
    _schattenNormalBias(texel) {
        const a = this.state.atmosphere;
        const hebel = a && Number.isFinite(a.shadowBias) ? Math.max(0, Math.min(3, a.shadowBias)) : 1;
        return AnazhRealm.SCHATTEN_KASKADE.normalTexel * hebel * texel;
    }
    // Das Haupt-Licht: der Rückfall ohne Kaskaden und die Vorlage, aus der die Kaskaden-Lichter klonen. Seine Karte deckt
    // ±Reichweite um den Spieler — ein Texel ist 2 · Reichweite / Kartengröße.
    _hauptSchattenBias(dl) {
        const c = dl && dl.shadow && dl.shadow.camera;
        if (!c) return;
        this._schattenBias(dl, (c.right - c.left) / dl.shadow.mapSize.width, c.far - c.near);
    }
}
