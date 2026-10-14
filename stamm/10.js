class AnazhRealm_Z10 {
    // ===== ATLAS §10 · LICHT-MATERIAL/FREQUENZBAND — Atmo-Uniforms · Substanz-Antennen · PBR-Uniform-Sync =====
    // V12.0-f — Toon-Material-Helper: alle Toon-Materials der Welt (Voxel-
    // Chunks, Architektur-Parts, Inseln, Avatar-Torso) sind native
    // `THREE.MeshToonNodeMaterial` (r184, lights=true). Die EINE Wahrheits-
    // ═══ DIE UNIFORM-HEIMAT (18.07., sechster Schöpfer-Trace: 60M Klein-Uploads
    // ≤16K = 9.3 GB, ~9k writeBuffer je Frame bei 631 Draws — die per-Draw-
    // Uniform-Bahn). WURZEL im Vendor gelesen (nie geraten): r184 KLONT jede
    // Uniform-Gruppe, deren groupNode nicht shared ist, JE RenderObject
    // (createBindings) — unsere geteilten Welt-Uniform-Sätze (Wind · Atmo ·
    // LOD · Hydro) lebten als per-Objekt-Kopien, die der Monitor jedes Objekt
    // jeden Frame neu hochladen ließ. Der Umzug in die GETEILTE renderGroup:
    // EIN Buffer je Satz, EIN Write je Render, alle Konsumenten lesen
    // denselben Speicher. Semantisch identisch per Konstruktion: die Sätze
    // sind geteilte Singletons an geteilten Materialien — per-Objekt-Variation
    // reist in dieser Welt IMMER als Attribut/Instanz-Daten, nie als Uniform.
    // Idempotent (setGroup ist ein Setter); ohne renderGroup-Export byte-alt. ═══
    // DER WIND-SATZ (EINE Stelle legt ihn an): Wind-Uhr, Wind-Stärke und die Richtung des aktiven Körpers (`uSunDir`,
    // Sonne oder Mond — `_dayNightApplyDirectionalLight` schreibt sie mit dem Richtlicht). Gras (Gegenlicht) und Boden
    // (Gegenlicht-Glanz, die Zuwendung des Schattens) lesen ihn; er reist als EIN renderGroup-Buffer.
    _windUniformsEnsure() {
        if (!this.state.windUniforms) {
            const { uniform } = THREE.TSL;
            this.state.windUniforms = this._uniformHeimatTeilen({
                uWindTime: uniform(0.0),
                uWindStrength: uniform(0.12),
                uSunDir: uniform(new THREE.Vector3(1, 1, 1).normalize()),
            });
        }
        return this.state.windUniforms;
    }

    _uniformHeimatTeilen(satz) {
        const rg = THREE.TSL.renderGroup;
        if (!satz) return satz;
        const teile = (u) => {
            if (u && u.isUniformNode === true && typeof u.setGroup === "function") u.setGroup(rg);
        };
        for (const k in satz) {
            const u = satz[k];
            if (Array.isArray(u)) for (const e of u) teile(e);
            else teile(u);
        }
        return satz;
    }

    // ═══ DIE OBSERVER-DIÄT ═══
    // r184s Monitor schließt needsRefresh auf hasNode kurz (für JEDES TSL-Material true) → jedes Objekt
    // wird jeden Frame refresht. Welt-Materialien, deren Graph NUR geteilte renderGroup-Uniforms +
    // Attribute + Builtins trägt, fahren die ehrliche equals()-Bahn (Änderungen laden weiter hoch; das
    // erste Objekt je Material/Render refresht). PFLICHT-PAAR mit _uniformHeimatTeilen für ALLE
    // mutierten Uniforms, sonst frieren per-Objekt-Klone ein. Headless inert.
    _materialObserverDiaet(mat) {
        if (!mat || mat._anazhDiaet === true || typeof mat.setupObserver !== "function") return mat;
        // PFLICHT-PAAR-WÄCHTER (Review-Notiz C): ohne renderGroup-Export wäre die
        // Uniform-Heimat ein No-op — die Diät fröre dann per-Objekt-Klone ein.
        // Kein renderGroup → keine Diät (byte-alt, der Vendor refresht weiter).
        mat._anazhDiaet = true;
        const alt = mat.setupObserver;
        mat.setupObserver = function (builder) {
            const o = alt.call(this, builder);
            if (!o) return o;
            o.hasNode = false;
            // Vendor-Loch: equals() walkt nur geometry.attributes — instanceMatrix/instanceColor leben am MESH
            // und wären unter der Diät unsichtbar. Der Versions-Wächter prüft sie VOR der Vendor-Bahn (Mutation
            // → genau EIN Refresh).
            if (typeof o.needsRefresh === "function") {
                const altNR = o.needsRefresh;
                o.needsRefresh = function (ro, frame) {
                    return AnazhRealm._diaetRefresh(this, ro, frame, altNR);
                };
            }
            return o;
        };
        return mat;
    }

    _ensureAtmoUniforms() {
        if (this.state.atmoUniforms) return this.state.atmoUniforms;
        const TSL = THREE.TSL;
        this.state.atmoUniforms = {
            // Tag-Licht-Achse (0 = tiefe Nacht, 1 = voller Tag); Schreiber: das EINE Himmels-Update
            // (_celestialHorizonFade). Konsument: die Impostor-Karte — ihr eingebackenes Tageslicht MUSS mit der
            // Sonne fallen (sonst glüht sie nachts).
            tagLicht: TSL.uniform(1.0),
            // B8 — das warme Struktur-RIM (Fresnel-Saum, die Ghibli-Silhouetten-
            // Kante im Gegenlicht). 0 = aus. Live-tunbar (Schöpfer-Sign-off).
            rimStrength: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.rimStrength)
                    ? this.state.atmosphere.rimStrength
                    : 0.16
            ),
            // 2.5D-Lichtung als Konsolen-Hebel (Init aus der Konstante, NICHT persistiert, render-only):
            //   anazhRealm.state.atmoUniforms.terrainFlatten.value = 0.7
            terrainFlatten: TSL.uniform(AnazhRealm.TERRAIN_NORMAL_FLATTEN),
            // M7 (V18.160, Befund 21) — die Mikro-Struktur als LEBENDIGER Hebel:
            // vorher war AERIAL.microStrength als KONSTANTE in den Tree gebacken
            // (ein Settings-Slider wäre der tote Knopf, V18.65-Klasse) → Uniform.
            microStrength: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.microStrength)
                    ? this.state.atmosphere.microStrength
                    : (AnazhRealm.AERIAL && AnazhRealm.AERIAL.microStrength) || 0.1
            ),
            // Nacht-Boden = Füll-Licht für ALLE opaken Ebenen (profil-gewichtet, s. _applySubstanceResponse);
            // Default 0.06, EINE Quelle: SUBSTANCE_RESPONSE.
            terrainNightFloor: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.terrainNightFloor)
                    ? this.state.atmosphere.terrainNightFloor
                    : AnazhRealm.SUBSTANCE_RESPONSE.nightFloor
            ),
            // Isolations-Regler (Default 1 = unverändert): `aoScale`=0 schaltet die Kavitäts-AO ab (der
            // `fwidth`-Term zeichnet Surface-Nets-Facetten-Kanten als Linien):
            //   anazhRealm.state.atmoUniforms.aoScale.value = 0
            aoScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.cavityAO)
                    ? this.state.atmosphere.cavityAO
                    : 1.0
            ),
            // Regler „Oberflächen-Textur" (0..1): skaliert die triplanar Fels-/Boden-Striation; 0 = glatte
            // Farbe. Nur der Terrain-colorNode (render-only, kein Naht-/Determinismus-Risiko).
            triplanarScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.triplanar)
                    ? this.state.atmosphere.triplanar
                    : 1.0
            ),
            // Regler „Farb-Variation" (0..1): skaliert die Makro-Tint (warm/kühl-Patches λ~25 m + Sättigung),
            // pre-lighting auf die Albedo; 0 = uniforme Basisfarbe. Render-only.
            tintScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.colorVar)
                    ? this.state.atmosphere.colorVar
                    : 1.0
            ),
            // Multi-Klassen-Geologie-Regler (render-only; 0 = aus → reiner Biom-Albedo): `geoRock` = Fels/Geröll
            // an der Steile, `geoMoss` = Moos auf flach+feucht.
            //   anazhRealm.state.atmoUniforms.geoRock.value = 0
            geoRock: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geoRock)
                    ? this.state.atmosphere.geoRock
                    : 1.0
            ),
            geoMoss: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geoMoss)
                    ? this.state.atmosphere.geoMoss
                    : 1.0
            ),
            // Cross-LOD-Geomorph-Stärke: wie stark Boundary-Vertices eines feinen Chunks an die grobe Nachbar-
            // Oberfläche gezogen werden (1 = Naht zu, 0 = rohe T-junction):
            //   anazhRealm.state.atmoUniforms.geomorph.value = 0
            geomorph: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geomorph)
                    ? this.state.atmosphere.geomorph
                    : 1.0
            ),
            // Terrain-Mond-Rim: kühler Fresnel-Saum auf den vertexColors-Ebenen; den Wert treibt der Tag-Nacht-
            // Sync (nachts setTerrainMoonRim-Basis, tags 0 — kein Shader-Branch; EIN Schreiber:
            // _dayNightApplyHemiUndLuft).
            terrainMoonRim: TSL.uniform(0.0),
            // DER LICHT-POOL (K11, `_leuchtStoff`): je Platz der Welt-Ort (xyz) mit der Reichweite (w, 0 = leer), die
            // lineare Farbe × Stärke (rgb) mit dem Abfall (a), der Himmels-Ersatz (0 | 1: ein Licht, das nur trägt, wo der
            // Himmel fehlt — das Licht des Auges) und der Kern der Quelle (k², K11b `lichtAbfall`) — eine feste Zahl ab dem Boot (`LICHT_POOL.plaetze`): ein Wechsel der
            // Quellen baut kein Programm. Der Welt-Ort gilt jedem Renderer der Seite (der Stoff rechnet ihn mit der Kamera
            // SEINES Renderers in den Blick-Raum). Dazu die Glut der wachen Fenster (lineare Farbe × Glut des Zeitplans).
            // EIN Schreiber: `_leuchtTakt`.
            lichtLage: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, 0, 0))
            ),
            lichtFarbe: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, 0, 2))
            ),
            lichtErsatz: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () => TSL.uniform(0)),
            lichtKern: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () => TSL.uniform(0)),
            fensterGlut: TSL.uniform(new THREE.Color(0, 0, 0)),
            // Struktur-Boost als LIVE-Uniform: Multiplier auf das micro-Gewicht des werk-Profils, vom Settings-
            // Slider „Struktur-Tiefe" getrieben. Init aus `atmosphere.r5StructureBoost` (persistiert) oder
            // R5_STRUCTURE_TEXTURE.microBoost (1.3); `_applySubstanceResponse` liest ihn live.
            r5StructureBoost: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.r5StructureBoost)
                    ? this.state.atmosphere.r5StructureBoost
                    : (AnazhRealm.R5_STRUCTURE_TEXTURE && AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost) || 1.3
            ),
        };
        // UNIFORM-HEIMAT: der geteilte Welt-Satz reist als EIN renderGroup-Buffer.
        this._uniformHeimatTeilen(this.state.atmoUniforms);
        return this.state.atmoUniforms;
    }

    // Das Antwort-Profil emergiert aus den 10 Substanz-Tags (eine weitere LESART der Substanz-Wahrheit):
    // glanz = härte+dichte (Rim/Specular) · tiefe = dichte (AO) · glimmen = magieleitung + wärmeleitung·
    // brennbar (Emissiv) · waerme = lebendig (Rim-Ton) · glas = transparent (Fresnel) · detail =
    // max(lebendig·(1−dichte), magieleitung·transparent). Den Wind trägt kein Tag: er ist das Wind-Gesetz des Baums (K19).
    // Nimmt ein Material oder ein tags-Objekt. Darunter die FEATURE-Gewichte (Antennen → Render-Hebel):
    _substanceResponseProfile(materialOrTags) {
        let tags = null;
        if (materialOrTags && typeof materialOrTags === "object") {
            // {tags: {...}} (Material-Objekt) ODER direkt {...} (Tag-Map).
            if (materialOrTags.tags && typeof materialOrTags.tags === "object") {
                tags = materialOrTags.tags;
            } else {
                tags = materialOrTags;
            }
        } else if (typeof materialOrTags === "string" && this.state && this.state.materials) {
            const mat = this.state.materials[materialOrTags];
            if (mat && mat.tags) tags = mat.tags;
        }
        if (!tags) tags = {};
        const t = (k) => {
            const v = +tags[k];
            return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
        };
        const haerte = t("härte");
        const dichte = t("dichte");
        const magieleitung = t("magieleitung");
        const transparent = t("transparent");
        const brennbar = t("brennbar");
        const lebendig = t("lebendig");
        const waermeleitung = t("wärmeleitung");
        // 5 tesla-Substanzen:
        const glanz = Math.min(1, haerte * 0.6 + dichte * 0.4);
        const tiefe = dichte;
        const glimmen = Math.min(1, magieleitung * 0.55 + waermeleitung * brennbar * 0.6);
        const waerme = lebendig;
        const glas = transparent;
        // die clever-gauss-Achse (Λ.6):
        const detail = Math.max(lebendig * (1 - dichte), magieleitung * transparent);
        return {
            glanz,
            tiefe,
            glimmen,
            waerme,
            glas,
            detail,
            micro: 0.5 + 0.5 * tiefe,
            rim: 0.4 + 0.6 * Math.max(glanz, glas * 0.9),
            // emissiv darf > 1 (Glut glüht ÜBER den Familien-Floor hinaus);
            // der Leser deckelt bei 1.6.
            emissiv: 0.5 + glimmen,
            // dichte Substanz hält mehr von ihrer Dunkelheit (Kontrast-Hierarchie
            // bleibt), lebendig-leichte fängt mehr Füll-Licht.
            fuell: 1 - 0.3 * tiefe,
            mond: 0.35 + 0.65 * glanz,
        };
    }

    // ===== DIE EINE GETEILTE UMGEBUNGS-FUNKTION (Render-Harmonie) =====
    // JEDE opake Ebene ruft sie identisch POST-lighting (`TSL.output`); die Luftperspektive (Distanz UND Höhe)
    // trägt allein die Luft (`scene.fogNode`, `_luftEnsure`) — hier lebt kein Dunst. Frequenzband per Profil (Gewicht 0 = Block fällt
    // bit-gleich); Mikro-Tiefe output-seitig (bricht `material.color` nicht); die Albedo reicht der
    // Aufrufer (`layerOpts.albedoNode`, kein attribute()-Lookup). Fehler → `window.__aerialOutputError`.
    _applySubstanceResponse(mat, profile = {}, layerOpts = {}) {
        if (!mat) return;
        try {
            const _T = THREE.TSL;
            const _au = this._ensureAtmoUniforms();
            const cfg = AnazhRealm.AERIAL || {
                microStrength: 0.1,
                aoStrength: 0.35,
                aoCap: 0.16,
            };
            // Antennen-Gewicht [0..1]: 0 = der Block fällt (kein toter Shader-Ast).
            const _p = (k) => Math.max(0, Math.min(1, Number(profile[k]) || 0));
            const _o = _T.output; // die FERTIGE lit-Farbe (post-lighting)
            let _rgb = _o.xyz;
            const _wp = _T.positionWorld;
            // (J2) Mikro-Tiefe/Kavitäts-AO — die tiefe-Antenne (das Terrain trägt
            // seine eigene reichere triplanar-Schicht im colorNode → Gewicht 0).
            if (_p("micro") > 0) {
                const _ra = this._rauschAtlas();
                const _n1 = _ra.raum(_wp.mul(0.33));
                const _n2 = _ra.raum(_wp.mul(1.6));
                const _det = _n1.mul(0.7).add(_n2.mul(0.3));
                // microStrength ist ein UNIFORM (der Settings-Regler lebt), profil-gewichtet. `_au.r5StructureBoost`
                // ist in `_ensureAtmoUniforms` GARANTIERT vorhanden → kein Fallback-Branch.
                const _micro = (_au.microStrength || _T.float(cfg.microStrength)).mul(
                    _au.r5StructureBoost.mul(_p("micro"))
                );
                let _shade = _T.float(1.0).add(_det.mul(_micro));
                // Kavitäts-AO (wie Terrain V15.2): Welt-Raum-Krümmung aus den
                // Fragment-Derivaten → Kontakt-Schatten in Kanten/Mulden.
                const _curv = _T.fwidth(_T.normalWorld).length().div(_T.fwidth(_wp).length().add(0.0001));
                // J4-DEBUG: aoScale (default 1) schaltet die Kavitäts-AO ab (=0).
                const _aoStr = (_au.aoScale ? _T.float(cfg.aoStrength).mul(_au.aoScale) : _T.float(cfg.aoStrength)).mul(
                    _p("micro")
                );
                const _ao = _T.float(1.0).sub(_curv.mul(_aoStr).clamp(0.0, cfg.aoCap));
                _rgb = _rgb.mul(_shade.mul(_ao));
            }
            // Warmes RIM-Licht: ein Fresnel-Saum hebt die Kontur im Gegenlicht — POST-lighting im selben Output-
            // Chain (kein zweiter outputNode: zwei Zuweisungen überschrieben sich). glanz wichtet die Stärke,
            // waerme tönt die Farbe. Live: anazhRealm.state.atmoUniforms.rimStrength.value.
            if (_p("rim") > 0 && _au.rimStrength) {
                const _vd = _T.cameraPosition.sub(_wp).normalize();
                const _fres = _T.normalWorld.dot(_vd).clamp(0.0, 1.0).oneMinus().pow(3.0);
                const _rimCol = _T.mix(_T.vec3(0.85, 0.88, 0.98), _T.vec3(1.0, 0.72, 0.45), _p("waerme"));
                _rgb = _rgb.add(_rimCol.mul(_fres.mul(_au.rimStrength).mul(_p("rim"))));
            }
            // Nacht-Boden als fuell-Antenne = additives Füll-Licht lit + albedo·floor·(1−lit), nie max()-Clamp
            // (der fraß AO/Cel/Triplanar zu einer flachen Fläche); (1−lit) dämpft es bei hellem Licht.
            if (_p("fuell") > 0 && _au.terrainNightFloor && layerOpts.albedoNode) {
                const _albedo = layerOpts.albedoNode;
                const _fill = _albedo.mul(_au.terrainNightFloor).mul(_p("fuell"));
                _rgb = _rgb.add(_fill.mul(_rgb.oneMinus().clamp(0.0, 1.0)));
            }
            // Mond-Rim als mond-Antenne: kühler Fresnel-Saum; der Uniform-Wert IST das Gate (nachts > 0, mittags
            // 0, kein Branch). Dieselbe Fresnel-Form wie das warme Rim → Licht-Parität der Ebenen.
            if (_p("mond") > 0 && _au.terrainMoonRim) {
                const _mvd = _T.cameraPosition.sub(_wp).normalize();
                const _mfres = _T.normalWorld.dot(_mvd).clamp(0.0, 1.0).oneMinus().pow(3.0);
                const _moonCol = _T.vec3(0.55, 0.66, 1.0);
                _rgb = _rgb.add(_moonCol.mul(_mfres.mul(_au.terrainMoonRim).mul(_p("mond"))));
            }
            mat.outputNode = _T.vec4(_rgb, _o.w);
        } catch (_e) {
            throw this._stoffBruch("die Umgebungs-Antwort (outputNode)", _e);
        }
    }

    // PBR-Material: `vertexColors`/`color`/`opacity`/`side` sind native Properties; _buildToonNodeMaterial
    // delegiert hierher. roughness/metalness aus den MATERIAL-TAGS hergeleitet (BRDF = Physik):
    //   dichte ≥ 0.85 + magieleitung ≥ 0.7 → Eisen m=0.85 r=0.3 · dichte ≥ 0.85 → Stein m=0 r=0.85
    //   lebendig ≥ 0.7 → Laub m=0 r=0.95 · brennbar ≥ 0.7 → Glut m=0 r=0.4 · sonst m=0 r=0.7
    _buildPbrNodeMaterial(opts = {}) {
        if (typeof THREE === "undefined") return null;
        if (typeof THREE.MeshStandardNodeMaterial !== "function") return null;
        // SUBSTANZ-HERLEITUNG für roughness + metalness — Physik-Form.
        // Default ist ein Mittel-Material (raue Oberfläche, kein Metall).
        let roughness = 0.7;
        let metalness = 0.0;
        let emissiveColor = null;
        let emissiveIntensity = 0;
        if (opts.tags) {
            const t = opts.tags;
            const dichte = Math.max(0, Math.min(3, +t.dichte || 0));
            const magie = Math.max(0, Math.min(3, +t.magieleitung || 0));
            const lebendig = Math.max(0, Math.min(3, +t.lebendig || 0));
            const brennbar = Math.max(0, Math.min(3, +t.brennbar || 0));
            // EISEN: dichte hoch + magieleitung hoch → metallisch + glatt
            if (dichte >= 0.85 && magie >= 0.7) {
                metalness = Math.min(1, 0.75 + magie * 0.15);
                roughness = Math.max(0.15, 0.35 - magie * 0.05);
            } else if (lebendig >= 0.7) {
                // LAUB/HOLZ: lebendig → rauh, kein Metall
                roughness = Math.min(0.98, 0.7 + lebendig * 0.2);
                metalness = 0;
            } else if (dichte >= 0.85) {
                // STEIN: dichte ohne Metall-Marker → rauh, dielectric
                roughness = 0.85;
                metalness = 0;
            } else if (brennbar >= 0.7) {
                // GLUT: glatt-warm (das Emissiv kommt unten aus responseProfile.emissiv,
                // dichte-UNABHÄNGIG — eine dichte Glut glüht trotzdem).
                roughness = 0.4;
                metalness = 0;
            } else {
                // Mittel-Material (Erde/Tuch/Default)
                roughness = 0.7 + lebendig * 0.1;
                metalness = 0;
            }
        }
        const params = {};
        if (opts.color !== undefined) params.color = opts.color;
        if (opts.side !== undefined) params.side = opts.side;
        if (opts.transparent !== undefined) params.transparent = opts.transparent;
        if (opts.opacity !== undefined) params.opacity = opts.opacity;
        if (opts.vertexColors) params.vertexColors = true;
        params.roughness = opts.roughness !== undefined ? +opts.roughness : roughness;
        params.metalness = opts.metalness !== undefined ? +opts.metalness : metalness;
        const mat = new THREE.MeshStandardNodeMaterial(params);
        // Die Welt-Antenne: derselbe Substance-Response wie im Toon-Pfad (profil-gewichteter Aerial-/Mikro-/
        // Rim-Term POST-lighting); _ensureAtmoUniforms ist idempotent + lazy. Das Emissiv folgt NACH
        // responseProfile (liest `responseProfile.emissiv`).
        this._ensureAtmoUniforms();
        const _SR = AnazhRealm.SUBSTANCE_RESPONSE;
        const isFlatStructure = !opts.vertexColors && opts.color !== undefined;
        const responseProfile = opts.tags
            ? this._substanceResponseProfile(opts.tags)
            : opts.vertexColors === true
              ? _SR.defaults.feld
              : isFlatStructure
                ? _SR.defaults.werk
                : _SR.defaults.frei;
        // Emissiv aus der Glow-Achse `responseProfile.emissiv` (wie Toon, dichte-unabhängig), PBR-Skala 0.4,
        // Farbe = opts.color. NUR der glimmen-Anteil (emissiv − 0.5-Floor) — mit PBR-Skala ließe der Floor
        // jeden Stein glühen.
        const _glimmen = Math.max(0, (Number(responseProfile.emissiv) || 0) - 0.5);
        if (_glimmen > 0.01 && mat.emissive && opts.color !== undefined) {
            emissiveColor = opts.color;
            mat.emissive.setHex(emissiveColor);
            // Per-Variante-Glanz: ein Genom reicht `emissiveBoost` durch; er SKALIERT nur das tag-getragene
            // Glimmen (das SEIN bleibt der magieleitung/wärmeleitung-Tag) — tag-neutral, Affinität unberührt.
            const _boost = Number.isFinite(opts.emissiveBoost) ? Math.max(0, opts.emissiveBoost) : 1;
            emissiveIntensity = Math.min(1.5, _glimmen * 0.6 * _boost);
            mat.emissiveIntensity = emissiveIntensity;
        }
        if (!opts.transparent && typeof this._applySubstanceResponse === "function") {
            let albedoNode = null;
            try {
                const _Ta = THREE.TSL;
                if (opts.vertexColors === true) {
                    // PBR-Terrain trägt denselben Geologie-Albedo wie Toon: per-Vertex-Feldfarbe → per-Fragment
                    // Multi-Klassen-Geologie, als Füll-Licht-Albedo UND als colorNode.
                    albedoNode = _Ta.attribute("color", "vec3");
                    if (opts.vertexColorAlbedo) {
                        // FELS: der Stoff am Vertex (das Fels-Gesetz, gelaende-core `felsNetz`) IST die Albedo; der EINE Substanz-Kern legt
                        // Korn + Kavität + Roughness drauf (instanz-stabil via positionLocal). KEIN Terrain-Geologie-Overlay
                        // (positionWorld schmiert über instanzierte Felsen), KEIN Normal-Flatten/Bump (plättet die Krümmung).
                        if (typeof this._substanceCharacter === "function") {
                            const _rk = this._substanceCharacter(_Ta, albedoNode, {
                                pos: _Ta.positionLocal,
                                worldPos: _Ta.positionWorld,
                                tags: opts.tags || {},
                                metal: 0,
                                roughBase: params.roughness,
                            });
                            albedoNode = _rk.albedo || albedoNode;
                            if (_rk.roughNode) mat.roughnessNode = _rk.roughNode;
                        }
                        mat.colorNode = _Ta.vec4(albedoNode, _Ta.float(1.0));
                    } else if (!opts.pflanzenStoff && typeof this._terrainGeologyAlbedo === "function") {
                        // Roughness-Variation für den Boden aus DEMSELBEN Substanz-Kern wie die Geologie
                        // (`_terrainGeologyAlbedo` → `_substanceCharacter`), sonst uniform 0.7 = Plastik-Sheen unterm IBL.
                        // Out-Param statt neuem Rückgabe-Typ → die `_terrainGeologyAlbedo`-Tests bleiben unberührt.
                        const _terrRough = {};
                        // DIE WEGE-KARTE (Chunk-Boden, V18.530): der Weg IST die Boden-Farbe des Fragments — die
                        // Vertex-Farbe mischt zur Pfad-Erde (`_wegeBodenFarbe`), und DIESE Farbe liest die Geologie.
                        const _bodenVc = opts.wegeKarte === true ? this._wegeBodenFarbe(_Ta, albedoNode) : null;
                        const _geo = this._terrainGeologyAlbedo(
                            _Ta,
                            _bodenVc || albedoNode,
                            _Ta.positionWorld,
                            _terrRough,
                            opts.felsImVertex === true
                        );
                        {
                            // DAS KRONENDACH (0910-8, K16 — EINE Quelle): wo kein echter Wald zeichnet, trägt der Boden mit Wege-Karte
                            // das Kronendach × Saison nach der Deckung (`_fernKroneNahMisch`) — der Chunk-Boden UND der Fern-Ring,
                            // derselbe Stoff; der Ring reicht seine Ecken-Krone (`opts.kroneVertex`) für den Ort jenseits der Karte.
                            let _alb =
                                opts.wegeKarte === true
                                    ? this._fernKroneNahMisch(_Ta, _geo, opts.kroneVertex || null)
                                    : _geo;
                            // DAS WASSER DES RINGS (K16, die Naht des Wassers): der Anteil des Wassers (`opts.wasserVertex`,
                            // aNass) ist kein Boden — er wirft zurück, was der Wasser-Stoff zurückwirft (`_wasserBlick`: der
                            // Körper R∞ im Licht des Orts, der Himmel × Fresnel, der Glanz; dieselben Uniforms), der Boden
                            // trägt den Rest. Bis K16 mischte der Ring ein Fern-Blau in die Boden-Farbe (Luma 4,8× zu hell).
                            if (opts.wasserVertex) {
                                // im Fern-Fenster die Fluss-Karte je Fragment, jenseits der Kasten-Anteil des Punkts
                                const _fk = this._flussKarteNode(_Ta);
                                const _nass = _Ta.mix(opts.wasserVertex, _fk.wert, _fk.imFenster).clamp(0.0, 1.0);
                                _alb = _alb.mul(_Ta.float(1.0).sub(_nass));
                                mat.emissiveNode = this._fernWasserBlickNode(_Ta).mul(_nass);
                            }
                            albedoNode = _alb;
                            mat.colorNode = _Ta.vec4(_alb, 1.0);
                            if (_terrRough.node) mat.roughnessNode = _terrRough.node;
                        }
                    } else if (opts.pflanzenStoff) {
                        // Vegetation (Rinde + Laub) trägt die Per-Vertex-Albedo EXPLIZIT als colorNode (VOR der Response) —
                        // sonst fällt sie aus `_T.output` und die Krone wäscht zur reinen Licht-Farbe.
                        let _alpha = _Ta.float(1.0);
                        if (opts.impostorAtlas) {
                            // DIE KARTE (der EINE Karten-Atlas, `_impostorAtlas`): der ferne LOD2-Baum ist EIN camera-facing
                            // Quad, das die ZWEI angrenzenden Peilungs-Ansichten SEINER Atlas-Schicht (aKarte.x) sampelt (Blend
                            // über fract) und die Instanz-Rotation respektiert. Instanz-Dekodierung ohne Instanz-Matrix: die
                            // Geometrie-Normale ist ein PROBE (1,0,0) → normalLocal = (cos r, 0, −sin r)/s. Schicht, Rahmen
                            // (Halbbreite, Höhe — template-lokal) und der Sichthöhen-Stempel (die Höhe der L1 × Instanz-Skala,
                            // negativ = verdeckt) reisen je Instanz in EINEM vec4 (aKarte): EIN Programm für jede Karte jeder
                            // Art, fünf Vertex-Puffer (position · normal · uv · aKarte · instanceColor). Normal-Atlas (rg) →
                            // mat.normalNode (VIEW-space) an die EINE PBR-Lichtung.
                            try {
                                const _at = this._impostorAtlas();
                                if (!this._impostorAtlasTexturen(_at))
                                    throw this._stoffBruch("die Karte: der Karten-Atlas fehlt beim Bau ihres Stoffs");
                                {
                                    if (!_at.mapNode) {
                                        _at.mapNode = _Ta.texture(_at.map);
                                        _at.nmapNode = _Ta.texture(_at.nmap);
                                    }
                                    const _V = _Ta.float(_at.V);
                                    const _uv = _Ta.attribute("uv", "vec2");
                                    const _ecke = _uv.x.mul(_Ta.float(2.0)).sub(_Ta.float(1.0)); // die Ecke ±1
                                    // (Schicht, Halbbreite, Höhe, ±Sichthöhe)
                                    const _karte = _Ta.attribute("aKarte", "vec4");
                                    const _rahmen = _karte.yz;
                                    // die Schicht: ein interpolierter Instanz-Wert kann 2,9999 lesen — gerundet, nie gekappt
                                    const _schicht = _Ta.floor(_karte.x.add(_Ta.float(0.5)));
                                    // ── Instanz-Dekodierung (die Instanz-Matrix, `_instanzMatrixNode`) ──
                                    // r184 setzt den positionNode VOR die Instanzierung (WGSL der Karte gelesen, K20 13.10.): dort
                                    // lasen positionLocal und der Normal-Probe den VORLAGEN-Raum (Skala 1, Drehung 0), die Matrix
                                    // drehte das Quad danach mit der Instanz — jede Karte stand als feste Tafel in der Drehung ihres
                                    // Baums, von der Seite ein Strich. Spalte 0 = s·(cos r, 0, −sin r), Spalte 3 = der Anker.
                                    // Jede gezeichnete Instanz lebt: die Gruppe ist dicht, count = lebende Instanzen (`_archGroupFree`
                                    // verdichtet) — die Null-3×3 eines freien Slots erreicht den Shader nie.
                                    const _naht = this._weltNaht(_Ta);
                                    const _m0 = _naht.spalte(0);
                                    const _sV = _naht.skala; // die Instanz-Skala im Vertex-Takt
                                    const _sInst = _Ta.varying(_sV, "vKarteSkala");
                                    const _aRot = _Ta.varying(_Ta.atan(_m0.z.negate(), _m0.x), "vKarteDreh");
                                    // ── exakte Anker-Peilung im Fragment: posW = Anker + right·k
                                    //    (right ⟂ look) ⇒ ang(look) = atan2(−h) + atan2(k, d),
                                    //    d = √(|h|²−k²) — kein Varying-Emissions-Risiko, exakt. ──
                                    const _k = _ecke.mul(_rahmen.x).mul(_sInst);
                                    const _hx = _Ta.positionWorld.x.sub(_Ta.cameraPosition.x);
                                    const _hz = _Ta.positionWorld.z.sub(_Ta.cameraPosition.z);
                                    const _hl2 = _hx.mul(_hx).add(_hz.mul(_hz));
                                    const _dA = _Ta.sqrt(_hl2.sub(_k.mul(_k)).max(_Ta.float(1e-4)));
                                    const _ang = _Ta.atan(_hx.negate(), _hz.negate()).add(_Ta.atan(_k, _dA));
                                    // ── View-Wahl + Blend (Vorlage: vView=fract((ang−aRot)/2π)); Studio-Layout: die Ansichten
                                    //    VERTIKAL gestapelt, Zeile 0 = Unterkante der Ansicht 0 (readPixels bottom-up) ──
                                    const _vView = _Ta.fract(
                                        _ang.sub(_aRot).div(_Ta.float(6.283185307179586)).add(_Ta.float(2.0))
                                    );
                                    const _fV = _vView.mul(_V);
                                    const _v0 = _Ta.floor(_fV);
                                    const _fb = _Ta.fract(_fV);
                                    const _v1 = _Ta.mod(_v0.add(_Ta.float(1.0)), _V);
                                    // Die Ansichten liegen Kante an Kante: die Unterkante (Stammfuß) der Ansicht v+1 grenzt an die
                                    // Oberkante der Ansicht v. Die Klemme hält den Filter in SEINER Ansicht: einen halben Texel der
                                    // gröberen gemischten Stufe Abstand (≈ 1 fwidth der Ansichts-Höhe), vergrößert mindestens einen
                                    // halben Texel der Stufe 0 (ein fwidth ist dort kleiner als der bilineare Fußabdruck).
                                    const _halb = _Ta.max(_Ta.fwidth(_uv.y), _Ta.float(0.5 / _at.ch)).clamp(0.0, 0.25);
                                    const _vIn = _uv.y.clamp(_halb, _Ta.float(1.0).sub(_halb));
                                    const _uvA = _Ta.vec2(_uv.x, _vIn.add(_v0).div(_V));
                                    const _uvB = _Ta.vec2(_uv.x, _vIn.add(_v1).div(_V));
                                    // DER STAMM-STRICH (Echt-GPU 05.10., Höhen-Sonde): die Anker-Peilung ist für das ganze Quad
                                    // dieselbe; steht sie GENAU auf einer Ansichts-Grenze, kippt ihr Rundungs-Rauschen einzelne Pixel
                                    // auf die Nachbar-Ansicht (v0 springt um 1 bzw. 7). Die Hardware-Ableitung des 2×2-Blocks las den
                                    // Sprung als Gradienten über die halbe Textur, griff die gröbste Stufe, und deren Filter zog den
                                    // Stammfuß der Nachbar-Ansicht als senkrechten Strich über die Krone (30–40 px über der L1-Spitze,
                                    // jede Peilung auf einer Ansicht). Die Gradienten kommen aus der STETIGEN Koordinate (die
                                    // Ansichts-Höhe ohne Sprung) — alle vier Stichproben, Albedo und Normale (gate:foundry-impostor D).
                                    const _uvStetig = _Ta.vec2(_uv.x, _uv.y.div(_V));
                                    const _gX = _uvStetig.dFdx();
                                    const _gY = _uvStetig.dFdy();
                                    const _probeA = (tex, uv) => tex.sample(uv).depth(_schicht).grad(_gX, _gY);
                                    // DIE VERGRÖSSERTE KARTE (K20, 12.10.): steht ein Texel der Stufe 0 auf mehr als einem Pixel, liest
                                    // die Karte ihre Zelle KUBISCH (B-Spline, vier bilineare Abgriffe in der eigenen Ansicht) statt
                                    // bilinear. Die Stufe 0 ist binär (Karten-Gesetz, BC1): bilinear gelesen schnitt der alphaTest
                                    // jede Krone in Texel-Treppen — Blöcke von 3–10 px mit rechteckigen Löchern zwischen 30 und 60 m
                                    // (Werkbank, Radeon: Texel bis 3,3 px). Die geglättete Deckung trägt die Kante zwischen den
                                    // Texeln; unter einem Pixel je Texel bleibt die deckungstreue Mip-Wahl allein (Gewicht `_kubW`).
                                    const _kubX = _Ta.float(_at.cw),
                                        _kubY = _Ta.float(_at.ch);
                                    const _gpX = _Ta.vec2(_gX.x.mul(_kubX), _gX.y.mul(_V).mul(_kubY)).length();
                                    const _gpY = _Ta.vec2(_gY.x.mul(_kubX), _gY.y.mul(_V).mul(_kubY)).length();
                                    const _kubW = _Ta
                                        .float(1.0)
                                        .div(_gpX.max(_gpY).max(_Ta.float(1e-4)))
                                        .sub(_Ta.float(1.0))
                                        .clamp(0.0, 1.0);
                                    const _kubisch = (tex, vAns) => {
                                        const cx = _uv.x.mul(_kubX).sub(_Ta.float(0.5));
                                        const cy = _vIn.mul(_kubY).sub(_Ta.float(0.5));
                                        const ix = _Ta.floor(cx),
                                            iy = _Ta.floor(cy);
                                        const fx = cx.sub(ix),
                                            fy = cy.sub(iy);
                                        const gew = (f) => {
                                            const e = _Ta.float(1.0).sub(f);
                                            const w0 = e.mul(e).mul(e).div(6.0);
                                            const w1 = _Ta
                                                .float(2.0 / 3.0)
                                                .sub(f.mul(f).mul(_Ta.float(2.0).sub(f)).mul(0.5));
                                            const w2 = _Ta
                                                .float(2.0 / 3.0)
                                                .sub(e.mul(e).mul(_Ta.float(2.0).sub(e)).mul(0.5));
                                            const w3 = f.mul(f).mul(f).div(6.0);
                                            return {
                                                g0: w0.add(w1),
                                                g1: w2.add(w3),
                                                h0: w1.div(w0.add(w1)).sub(0.5),
                                                h1: w3.div(w2.add(w3)).add(1.5),
                                            };
                                        };
                                        const wx = gew(fx),
                                            wy = gew(fy);
                                        // in der eigenen Ansicht: die Abgriffe bleiben einen Texel vor ihrer Kante
                                        const ziel = (hx, hy) => {
                                            const y = iy.add(hy).clamp(_Ta.float(1.0), _kubY.sub(1.0));
                                            return _Ta.vec2(ix.add(hx).div(_kubX), y.div(_kubY).add(vAns).div(_V));
                                        };
                                        const lies = (hx, hy) =>
                                            tex.sample(ziel(hx, hy)).depth(_schicht).level(_Ta.float(0.0));
                                        return lies(wx.h0, wy.h0)
                                            .mul(wx.g0)
                                            .add(lies(wx.h1, wy.h0).mul(wx.g1))
                                            .mul(wy.g0)
                                            .add(
                                                lies(wx.h0, wy.h1)
                                                    .mul(wx.g0)
                                                    .add(lies(wx.h1, wy.h1).mul(wx.g1))
                                                    .mul(wy.g1)
                                            );
                                    };
                                    const _liesA = (tex, uv, vAns) =>
                                        _Ta.mix(_probeA(tex, uv), _kubisch(tex, vAns), _kubW);
                                    const _samp = _Ta.mix(
                                        _liesA(_at.mapNode, _uvA, _v0),
                                        _liesA(_at.mapNode, _uvB, _v1),
                                        _fb
                                    );
                                    _alpha = _samp.a;
                                    // fin-Einblendung des Billboards aus der EINEN Quelle `__phytoCore.lodCrossfadeMask` lod=2 (via
                                    // `_lodCrossfadeMaskNode`); Distanz = Fragment-Anker-Peilung (√_hl2), Sichthöhe = der Stempel
                                    // |aKarte.w| (die Höhe der Höhen-Stufe × Instanz-Skala — dieselbe Zahl wie der aH0-Stempel der L1
                                    // und die CPU, nie die Rahmen-Höhe des Bakes); ein negativer Stempel ist der verdeckt-demotierte
                                    // Baum (die Karte blendet voll). Maske + CPU-Doppel-Mitgliedschaft (`_updateFoundryLodBand`)
                                    // schalten zusammen am foundryCrossfade-Flag (default an).
                                    if (this.state && this.state.foundryCrossfade === true) {
                                        // Kein Horizont in der Maske: eine Distanz-Blende ins Nichts lässt jede Karte, die IM
                                        // Band steht, dauerhaft halb durchsichtig (unter TRAA ein Geist am Grat) — der Rand
                                        // des gesetzten Waldes lebt auf der CPU (`_archKartenHorizont`).
                                        const _keepFin = this._lodCrossfadeMaskNode(_Ta, {
                                            impostor: true,
                                            // die Distanz zur ACHSE der Instanz (der Anker, `_dA`), wie das Studio-
                                            // Billboard (`vCD` aus `instanceMatrix[3]`), nie zum Fragment des Quads
                                            distNode: _dA,
                                            visHeightNode: _karte.w.abs(),
                                            occlNode: _karte.w
                                                .lessThan(_Ta.float(0.0))
                                                .select(_Ta.float(1.0), _Ta.float(0.0)),
                                        });
                                        {
                                            _alpha = _alpha.mul(_keepFin);
                                            // der Stoff trägt die Maske: die Instanz-Wahl darf ihr Fenster lesen
                                            // (`_instanzFensterGilt`)
                                            mat.userData.kartenMaske = true;
                                        }
                                    }
                                    // Die Schicht ist VORMULTIPLIZIERT (transparent = 0, Karten-Gesetz): rgb / alpha — kein dunkler
                                    // Saum auf keiner Mip-Stufe. Der Atlas trägt die volle Baumfarbe, vertex-color = weiß.
                                    // Das eingebackene Tageslicht fällt mit der Sonne (tagLicht-Uniform) — sonst leuchtet die Karte
                                    // nachts heller als echte Geometrie; Boden 0.12 = Mond-Silhouette.
                                    const _rgbK = _samp.rgb.div(_samp.a.max(_Ta.float(1e-3)));
                                    const _auN = this._ensureAtmoUniforms();
                                    // Die Karte ist Golden-Sommer gebacken; das Jahr färbt sie wie der Studio-Impostor:
                                    // alb × mix(1, uSeasonMul, SAISON_GESETZ.kartenGewicht) (V18.527, kein Neubau).
                                    const _suK = this._ensureSeasonUniforms();
                                    const _albK = _rgbK.mul(
                                        _Ta.mix(
                                            _Ta.vec3(1.0, 1.0, 1.0),
                                            _suK.uSeasonMul,
                                            _Ta.float(AnazhRealm._saisonGesetz().kartenGewicht)
                                        )
                                    );
                                    albedoNode = _albK.mul(_auN.tagLicht.mul(_Ta.float(0.88)).add(_Ta.float(0.12)));
                                    mat.alphaTest = globalThis.__phytoCore.KARTEN_GESETZ.schwelle; // die Codec-Schwelle
                                    // ── Normal-Atlas (rg, z = √(1−x²−y²)) → Billboard-Rahmen → per-Fragment-Licht ──
                                    const _nxy = _Ta
                                        .mix(_probeA(_at.nmapNode, _uvA).xy, _probeA(_at.nmapNode, _uvB).xy, _fb)
                                        .mul(_Ta.float(2.0))
                                        .sub(_Ta.float(1.0));
                                    const _nz = _Ta.sqrt(_Ta.float(1.0).sub(_nxy.dot(_nxy)).max(_Ta.float(0.0)));
                                    const _sinA = _Ta.sin(_ang);
                                    const _cosA = _Ta.cos(_ang);
                                    const _look3 = _Ta.vec3(_sinA, _Ta.float(0.0), _cosA);
                                    const _right3 = _Ta.vec3(_cosA, _Ta.float(0.0), _sinA.negate());
                                    const _nW = _Ta.normalize(
                                        _right3
                                            .mul(_nxy.x)
                                            .add(_Ta.vec3(0.0, 1.0, 0.0).mul(_nxy.y))
                                            .add(_look3.mul(_nz))
                                    );
                                    // normalNode ist VIEW-space (NodeMaterial.setupNormal → normalView):
                                    // die Welt-Normale über die Kamera-Matrix transformieren — Welt → Sicht ist
                                    // MATRIX.transformDirection(n) (V·n), nie n.transformDirection(MATRIX) (Vᵀ·n).
                                    mat.normalNode = _Ta.cameraViewMatrix.transformDirection(_nW);
                                    // ── CAMERA-FACING (Vertex) im VORLAGEN-Raum: der positionNode läuft VOR der Instanz-Matrix
                                    //    (r184, WGSL gelesen), die Matrix dreht, skaliert und schiebt das Quad danach. Also blickt die
                                    //    Karte in der Vorlage auf das Auge, wie die Instanz es sieht: Auge im Objekt-Raum minus Anker
                                    //    (Spalte 3), zurückgedreht mit der transponierten 3×3 (Mᵀ·d = s·Rᵀ·d, die Richtung genügt).
                                    //    Das Einheits-Quad steht von y=0 bis y=1; Halbbreite und Höhe sind Vorlagen-Maß, die Skala
                                    //    trägt die Matrix. ──
                                    const _axis = _Ta.positionLocal;
                                    const _axisY = _axis.y.add(
                                        _Ta.positionGeometry.y.mul(_rahmen.y.sub(_Ta.float(1.0)))
                                    );
                                    const _dAuge = _naht.vorlage(_Ta.cameraPosition.sub(_naht.anker));
                                    const _lkX = _dAuge.x;
                                    const _lkZ = _dAuge.z;
                                    const _ll = _Ta.sqrt(_lkX.mul(_lkX).add(_lkZ.mul(_lkZ))).max(_Ta.float(1e-4));
                                    const _lx = _lkX.div(_ll);
                                    const _lz = _lkZ.div(_ll);
                                    // right = cross(up, look) = (look.z, 0, −look.x)
                                    const _off = _ecke.mul(_rahmen.x);
                                    // DER WIND DER KARTE (K19): derselbe Wind-Term wie Rinde und Laub der nahen Stufen (phyto-core
                                    // `windAusschlag`, das Stamm-Glied: ζ = uv.y, die Kronenspitze pendelt ζ²) — die Last aus der
                                    // Wind-Zeile des Wetters, die Böe aus WIND_BOE, die Richtung uWindDir, H = Rahmen-Höhe × Instanz-Skala,
                                    // f0 = kF · δ / H mit der mittleren Schlankheit der Baum-Arten (`_karteWindDelta`: die Karte trägt
                                    // ihre Art nur als Atlas-Schicht). Bis K19 pendelte die Karte 0,22 m in jedem Wetter. Die Phase liest
                                    // den Welt-Anker der Instanz, der Ausschlag (Welt-Meter in Windrichtung) geht über die EINE Naht
                                    // (`_weltNaht.vorlage`) in die Vorlage zurück — sonst drehte und skalierte ihn die Matrix mit dem Baum.
                                    if (!this.state.windUniforms) this._grassInstanceMat();
                                    const _wu = this._ensureWindCoupling(_Ta);
                                    const _WB = AnazhRealm.WIND_BOE;
                                    const _Hk = _rahmen.y.mul(_sV).max(0.5);
                                    const _ankerW = _naht.anker;
                                    const _ortK = _ankerW.x.mul(_wu.uWindDir.x).add(_ankerW.z.mul(_wu.uWindDir.y));
                                    const _wK = globalThis.__phytoCore.windAusschlag(
                                        AnazhRealm._windTsl(_Ta),
                                        {
                                            t: _wu.uWindTime,
                                            U: _wu.uWindStrength.div(AnazhRealm.WEATHER_WIND_AMP),
                                            g: _Ta
                                                .sin(_wu.uWindTime.mul(_WB.omega).sub(_ortK.mul(_WB.k)))
                                                .mul(_WB.amp)
                                                .add(_WB.mitte),
                                            f0: this._karteWindDelta()
                                                .mul(globalThis.__phytoCore.WIND_GESETZ.kF)
                                                .div(_Hk),
                                            H: _Hk,
                                            zeta: _uv.y,
                                            rho: _Ta.float(0),
                                            phi: _ortK.mul(-_WB.k),
                                            psi: _Ta.float(0),
                                        },
                                        false
                                    );
                                    const _swayW = _Ta.vec3(
                                        _wu.uWindDir.x.mul(_wK.quer),
                                        _Ta.float(0.0),
                                        _wu.uWindDir.y.mul(_wK.quer)
                                    );
                                    const _swayT = _naht.vorlage(_swayW);
                                    mat.positionNode = _Ta.vec3(
                                        _axis.x.add(_lz.mul(_off)).add(_swayT.x),
                                        _axisY.add(_swayT.y),
                                        _axis.z.add(_lx.negate().mul(_off)).add(_swayT.z)
                                    );
                                    mat.userData = mat.userData || {};
                                    mat.userData.impostorBillboard = true; // Linsen-Marker (diag-impostor)
                                    // Schicht-Upload und Wachsen sieht der Textur-Wächter der Diät (`_diaetVorTextur`): EIN Refresh.
                                    // DAS LAUB-LICHT DER KARTE (K19): die ferne Stufe lichtet mit dem EINEN Laub-Licht-Term der
                                    // nahen (phyto-core `laubDurchlass`) über der Normale des Normal-Atlas; die Nadel trägt ihre
                                    // Schicht (`_karteNadel`). Bis K19 leuchtete die nahe Krone im Gegenlicht, ihre Karte nicht.
                                    this._laubLichtStoff(mat, () => this._karteNadel(_Ta).element(_schicht.toInt()));
                                }
                            } catch (_e) {
                                // die Karten-Verdrahtung fällt nie in die Fernstufen-Geometrie: ihr Bruch bricht den Bau
                                throw this._stoffBruch("die Karten-Verdrahtung", _e);
                            }
                        } else if (opts.foliageLeaf && opts.foliageBlade) {
                            // Die Klinge ist Geometrie: das L0-Blatt (phyto-core `buildLeafBlades`) braucht keinen Atlas, alpha
                            // bleibt 1. alphaTest bleibt gesetzt, damit das Dither-Crossfade die Klingen am L0→L1-Band ausblendet.
                            mat.alphaTest = 0.5;
                        } else if (opts.foliageLeaf) {
                            // Die Karte sampelt den EINEN Blatt-Atlas über den EINEN Leser (`_blattAtlasProbe`): ALPHA = die
                            // Zweig-Silhouette, RGB = der Blatt-Wert, der die Vertex-Farbe tönt. Fehlt der Kern, bricht
                            // `_ensureFoliageClusterAtlas` laut (KERN-PFLICHT) — die stille Ellipsen-Maske hinter einem
                            // catch ist gefallen (05.10.: kein Stoff ohne seinen Atlas, wie der Laub-Stoff der Welt);
                            // headless (kein document) zeichnet kein Stoff.
                            const _atl = this._blattAtlasProbe(_Ta);
                            if (_atl) {
                                _alpha = _atl.a;
                                albedoNode = albedoNode.mul(_atl.rgb);
                            }
                            mat.alphaTest = 0.5;
                        }
                        // Kuppel-Normale, flip-frei: Laub trägt die analytische Kuppel-Richtung als gebackene Normale
                        // (_stampFoliageDomeNormals); der Renderer negiert Attribut-Normalen back-facender DoubleSide-
                        // Fragmente → die Innenseite läse die Kuppel invertiert (fast schwarz). normalNode umgeht den Flip;
                        // normalLocal trägt die Batch-/Instanz-Rotation, modelViewMatrix hebt in View — wie der Impostor
                        // (transformDirection, NIE transformNormalToView). Lokal → Sicht ist MATRIX.transformDirection(n)
                        // (MV·n); n.transformDirection(MATRIX) rechnete MVᵀ·n und drehte das Sonnen-Licht der Krone mit
                        // der Blick-Richtung (Normal-Sonde 06.10.: 19–35 Grauwerte neben three's eigener Normale).
                        if (opts.foliageLeaf === true && !opts.impostorAtlas) {
                            mat.normalNode = _Ta.modelViewMatrix.transformDirection(_Ta.normalLocal);
                        }
                        // Rinden-Maserung prozedural aus dem holz-Tag (keine Bitmap): Längs-Faser (hohe Frequenz quer x/z,
                        // niedrige längs y) + Risse aus härte (ridged-Noise); moduliert die per-Vertex-Rinden-Albedo.
                        // positionLocal hält die Maserung instanz-stabil. Marker bei TSL-Fehler.
                        if (opts.bark) {
                            // Rinde über den EINEN Substanz-Charakter-Kern (bark-Modus): Längs-Faser + Riss-Kavität + Ton + Moos
                            // + Roughness. KEIN Bump: `bumpMap` (screen-space, ohne UVs) kippt auf dem dünnen, gekrümmten Stamm
                            // die Normale → er liest konkav; der Bump bleibt dem flachen Boden.
                            const _rb = this._substanceCharacter(_Ta, albedoNode, {
                                pos: _Ta.positionLocal,
                                worldPos: _Ta.positionWorld,
                                tags: opts.tags || {},
                                metal: 0,
                                bark: true,
                                roughBase: params.roughness,
                            });
                            albedoNode = _rb.albedo;
                            if (_rb.roughNode) mat.roughnessNode = _rb.roughNode;
                        }
                        mat.colorNode = _Ta.vec4(albedoNode, _alpha);
                    }
                    // DIE VERTEX-FARBE EINMAL (der EINE Ort der Klasse „Albedo = Farbe²"): r184 setupDiffuseColor
                    // multipliziert den colorNode mit der Vertex-Farbe, solange vertexColors an ist und die Geometrie ein
                    // color-Attribut trägt. Jeder colorNode dieses Zweigs TRÄGT sie schon — Fels (`vertexColorAlbedo`),
                    // Boden (Chunk, Insel, Voxel-Test, Bauplan-Verschmelzung), Rinde, Laub, Klinge, Kronen-Kern; die
                    // Karte ersetzt sie durch den Atlas und hat kein color-Attribut. Bis 06.10. schaltete nur der Boden ab:
                    // Grammatik-Rinde/-Laub und der Fels zeichneten Farbe², die Werkstatt-Vorschau desselben Baums Farbe¹.
                    if (mat.colorNode) mat.vertexColors = false;
                } else if (isFlatStructure) {
                    // Flach-Farb-Werke (Tempel · Schwert · Rüstung · Esse · …) fließen durch den EINEN Substanz-
                    // Charakter-Kern (Korn · Kavität · Ton · Verwitterung · Moos · Counter-Shading · Roughness · Bump),
                    // instanz-stabil (positionLocal), tag-getrieben, LOD-gegated.
                    const _c = new THREE.Color(opts.color);
                    const _r = this._substanceCharacter(_Ta, _Ta.vec3(_c.r, _c.g, _c.b), {
                        pos: _Ta.positionLocal,
                        worldPos: _Ta.positionWorld,
                        tags: opts.tags || {},
                        metal: params.metalness || 0,
                        roughBase: params.roughness,
                        bump: true,
                    });
                    albedoNode = _r.albedo;
                    mat.colorNode = _Ta.vec4(_r.albedo, _Ta.float(1.0));
                    if (_r.roughNode) mat.roughnessNode = _r.roughNode;
                    if (_r.normalNode) mat.normalNode = _r.normalNode;
                }
            } catch (_e) {
                throw this._stoffBruch("der PBR-Stoff (Albedo-Quelle)", _e);
            }
            this._applySubstanceResponse(mat, responseProfile, { albedoNode });
        }
        // Geflattete Shading-Normale (2.5D-Lichtung) NUR für Terrain (vertexColors ohne pflanzenStoff).
        // Vegetation (pflanzenStoff) behält ihre echte Normale — nach oben gerichtete Laub-Karten wären mittags
        // voll sonnen-lit, ACES wüsche die Krone teal/weiß.
        if (opts.vertexColors && !opts.pflanzenStoff && !opts.vertexColorAlbedo) {
            try {
                const _Tn = THREE.TSL;
                const _aun = this._ensureAtmoUniforms();
                {
                    const _up = _Tn.vec3(0.0, 1.0, 0.0);
                    const _flat = _aun.terrainFlatten;
                    // DIE GEOMETRIE-NORMALE DIESES GRAPHEN ist `normalWorldGeometry` × Flächen-Vorzeichen, nie r184s
                    // `normalWorld`: das ist EINE Variable je Programm, und las dieser normalNode (er baut in der
                    // NORMAL-Stufe) sie zuerst, übernahmen der Schatten-Lookup (normalBias), das Halbkugel- und das
                    // Umgebungslicht ihre NORMAL-Fassung — die Geometrie-Normale mit Flächen-Vorzeichen. Die Boden-
                    // Dreiecke zeigen oben ihre Rückseite (DoubleSide), die Normale zeigte nach unten, der normalBias schob
                    // die Probe 1 m in den Boden. Welche Fassung ein Programm bekam, hing an seiner Bau-Reihenfolge
                    // (echte GPU, Mess-Wiese, Zweit-Boot nach kurzem Erst-Boot: 4 von 5 Läufen dunkel, Boden-Helligkeit
                    // 68 statt 133 — gate:altlasten Normal-Wand). Derselbe Wert wie vorher, `normalWorld` baut nur die
                    // Licht-Stufe (die End-Normale aus diesem normalNode).
                    const _nGeo = _Tn.normalWorldGeometry.mul(_Tn.faceDirection);
                    // DIE 2.5D-LICHTUNG GILT UNTER DEM HIMMEL (K02a, Auge 11 bei 762/−138): die geflattete Normale zeigt
                    // jede Boden-Fläche zum Himmel — in der Höhle lag so jede Decke und Wand als Wiese im Licht von oben
                    // (der Himmel als blaugrauer Schleier, die Sonne ohne Schatten auf dem Fels), und kein Licht von unten
                    // erreichte die Decke. Mit der Himmels-Sicht (`himmelsSicht`, je Vertex `aHimmel`, gelaende-core `himmelsSicht`)
                    // flacht sie nur, soweit der Himmel die Fläche sieht; in der Höhle trägt die WAHRE Normale (−∇d, in die
                    // Luft — ohne Flächen-Vorzeichen: die Windung des Netzes kennt die Seite der Luft nicht). Unter dem
                    // Himmel (aHimmel 1) ist sie dieselbe Zahl wie vorher.
                    const _hS = opts.himmelsSicht ? _Tn.attribute("aHimmel", "float") : null;
                    let _baseN = _hS
                        ? _Tn.mix(_Tn.normalWorldGeometry, _up, _flat.mul(_hS))
                        : _Tn.mix(_nGeo, _up, _flat);
                    // Mikro-Relief (s. TERRAIN_BUMP): ein Noise-Höhengradient (zwei Oktaven: Klumpen + Korn) kippt die
                    // geflattete Normale entgegen dem Gradienten, LOD-gegated. Render-only, try/catch.
                    {
                        const _B = AnazhRealm.TERRAIN_BUMP;
                        const _ra = this._rauschAtlas();
                        const _wp = _Tn.positionWorld;
                        // Bump NUR auf flachem Boden (auf steilen Wänden ist xz-Höhen-Noise sinnlos). Schwellen (0.55, 0.85)
                        // sind gemessen (`diag-bump-flatdist`, top-surface-gefiltert): flache Wiese liegt bei ny 0.90–0.98 →
                        // voller Bump > 0.85, aus unter 0.55. Tiefere Schwellen schöben den Bump auf 32–52°-Hänge zurück.
                        const _flatGate = _Tn.smoothstep(_Tn.float(0.55), _Tn.float(0.85), _nGeo.y).clamp(0.0, 1.0);
                        const _lod = _Tn
                            .float(1.0)
                            .sub(
                                _Tn.smoothstep(
                                    _Tn.float(_B.lodNear),
                                    _Tn.float(_B.lodFar),
                                    _wp.sub(_Tn.cameraPosition).length()
                                )
                            )
                            .clamp(0.0, 1.0)
                            .mul(_flatGate);
                        // Der Höhen-Schnitt y = 0 des Rausch-Gesetzes (die Ebene (x, z), Achse "z").
                        const _grad = (freq, strength) => {
                            const _f = _Tn.float(freq);
                            const _h = (dx, dz) =>
                                _ra.ebene(
                                    _Tn.vec2(_wp.x.add(_Tn.float(dx)).mul(_f), _wp.z.add(_Tn.float(dz)).mul(_f)),
                                    0,
                                    "z"
                                );
                            const _hX = _h(_B.eps, 0).sub(_h(-_B.eps, 0));
                            const _hZ = _h(0, _B.eps).sub(_h(0, -_B.eps));
                            return _Tn.vec3(_hX, _Tn.float(0.0), _hZ).mul(_Tn.float(-strength)).mul(_lod);
                        };
                        _baseN = _baseN.add(_grad(_B.freq, _B.strength)).add(_grad(_B.freq2, _B.strength2));
                    }
                    // normalNode ist VIEW-space (NodeMaterial.setupNormal → normalView): die geflattete Welt-Normale
                    // über die Kamera-Matrix. Bis 05.10. stand sie roh als Welt-Normale darin — die Licht-Normale des
                    // Bodens kippte mit der Kamera-Neigung, und `normalWorld` (= normalView zurück in die Welt) las aus
                    // 45 m senkrecht von oben eine Wand: die flache Wiese wurde Fels (Linse 05.10., echte GPU).
                    // Welt → Sicht ist MATRIX.transformDirection(n) (= V·n, three's transformNormalToView);
                    // n.transformDirection(MATRIX) rechnet Vᵀ·n (Sicht → Welt, three's normalWorld) und verdoppelte den
                    // Fehler (Normal-Sonde 06.10.: Kugel-Pixel 24 Grauwerte neben three's eigener Normale).
                    mat.normalNode = _Tn.cameraViewMatrix.transformDirection(_Tn.normalize(_baseN));
                    // DIE ZUWENDUNG DES SCHATTENS (1110-5, die Hang-Akne): die 2,5D-Lichtung schattiert jede Fläche, als sähe
                    // sie senkrecht zum Himmel — ob die Sonne sie trifft, entschied am Terminator allein der Schatten-Test, und
                    // der rauscht dort (der Normal-Versatz folgt der geflatteten Normale, nicht der Fläche). Gemessen an einer
                    // ebenen 30°-Rampe im Software-Holz (holz voll), Sonne 22° aus Azimut 45°, N·L −0,002: 11,7 % der Rampe
                    // fleckig gegen 0,2 % ohne Schatten (gate:schatten-terminator). Jetzt trägt der empfangene Schatten die Zuwendung der WAHREN
                    // Normale (dieselbe, aus der die Lichtung mischt) zur Richtung des aktiven Körpers: abgewandt im Schatten,
                    // der Saum am Terminator (N·L 0 … `zuwendungSaum`, ~5° Sonne) weich.
                    const _nWahr = _hS ? _Tn.normalWorldGeometry : _nGeo;
                    const _zu = _Tn.smoothstep(
                        _Tn.float(0.0),
                        _Tn.float(AnazhRealm.SCHATTEN_KASKADE.zuwendungSaum),
                        _Tn.dot(_Tn.normalize(_nWahr), this._windUniformsEnsure().uSunDir)
                    );
                    mat.receivedShadowNode = (schatten) => schatten.mul(_zu);
                }
            } catch (_e) {
                throw this._stoffBruch("die Boden-Normale (Flatten · Relief · Zuwendung)", _e);
            }
            // DIE HIMMELS-SICHT als Verdeckung: das Himmels-Licht (Umgebung, Hemi, Ambient) erreicht nur, was den Himmel
            // sieht — r184 multipliziert `aoNode` in das indirekte Licht (diffus und Glanz).
            if (opts.himmelsSicht) mat.aoNode = THREE.TSL.attribute("aHimmel", "float");
            // DAS LICHT DES AUGES (K02a, K15, K11 — `_dayNightApplyAugenLicht`, `AUGEN_LICHT`) ist ein Platz des Licht-Pools mit
            // Himmels-Ersatz: es trägt nur, wo der Himmel fehlt — der Boden reicht dem Pool seine Himmels-Sicht (`aHimmel`) unten
            // durch `_leuchtStoff`, ein Stoff ohne Himmels-Sicht gilt als offen (er trägt das Himmels-Licht ganz).
            // Geomorph (T2 Cross-LOD-Boundary-Naht) — wie im Toon-Pfad.
            if (opts.geomorph) {
                try {
                    const _Tm = THREE.TSL;
                    const _aum = this._ensureAtmoUniforms();
                    {
                        const _tgt = _Tm.attribute("aMorphTarget", "vec3");
                        const _w = _Tm.attribute("aMorphWeight", "float");
                        const _f = _aum.geomorph.mul(_w);
                        mat.positionNode = _Tm.positionLocal.add(_tgt.sub(_Tm.positionLocal).mul(_f));
                    }
                } catch (_e) {
                    throw this._stoffBruch("der Geomorph des Bodens", _e);
                }
            }
        }
        // Die geteilte Vegetations-Antwort (Wind-Sway + Instance-Tint + Subsurface-Backlit) wie in Toon.
        // Laub (pflanzenStoff) trägt die Vertex-Farbe EINMAL im colorNode; die Instanz-Farbe multipliziert die Pipeline.
        this._applyVegetationResponse(mat, opts, responseProfile);
        // das Leuchtquellen-Gesetz: der Licht-Pool im Leuchten des Stoffs (K11), der Boden mit seiner Himmels-Sicht
        this._leuchtStoff(mat, null, opts.himmelsSicht ? THREE.TSL.attribute("aHimmel", "float") : null);
        // Marker für das Test-Band (kein semantisches Verhalten)
        mat.userData = mat.userData || {};
        mat.userData.isPbrMaterial = true;
        mat.userData.pbrRoughness = params.roughness;
        mat.userData.pbrMetalness = params.metalness;
        return mat;
    }

    // DAS LEUCHTQUELLEN-GESETZ IM STOFF (K11): JEDER beleuchtete Stoff der Welt trägt den Licht-Pool als Term seines Leuchtens
    // — der Stoff-Bau `_buildPbrNodeMaterial` (und mit ihm jeder Toon-Aufruf), der Foundry-Stoff `_foundryTreeMaterial` und
    // jeder Stoff, den eine Schicht selbst baut (Gras, Fern-Ring, Sockel, Wege und Zaun, Rauch, Schatten-Zwilling, Vorschau);
    // die Wand: die S0-Probe der Mess-Bühne (Zensus der Bauer im Stamm UND jedes beleuchteten Stoffs der Szene). Ein Stoff, dessen
    // Gesetzbuch einen Zeitplan stempelt (`mp.licht` = "fenster", fachwerk `glas`), glüht in der Glut der Tageszeit
    // (`atmoUniforms.fensterGlut`); die Glut selbst (Seh-Klasse glut, das Leucht-Gesetz) ist Quelle und liest den Pool nicht.
    // `himmel` (ein Knoten 0…1, der Boden: `aHimmel`) ist die Himmels-Sicht der Fläche — ein Platz mit Himmels-Ersatz (das
    // Licht des Auges) trägt nur, wo sie fehlt; ohne sie gilt der Stoff als offen. KEIN Szenen-Licht: r184 sammelt jedes
    // Szenen-Licht in den Licht-Hash jedes beleuchteten Stoffs und rechnet seine BRDF auch auf Stärke 0 — der Pool ist eine
    // feste Zahl geteilter Uniforms ab dem Boot (EIN Schreiber `_leuchtTakt`), ein Wechsel der Quellen baut kein Programm.
    // EIN KNOTEN JE GRAPH (1310-18): dasselbe Leuchten über derselben Basis (dem Leucht-Knoten des Stoffs oder r184s
    // `materialEmissive`), demselben Zeitplan und derselben Himmels-Sicht ist DERSELBE Knoten — Stoffe mit geteiltem Graphen
    // (`_foundryTreeMaterial`) teilen so auch ihr Leuchten und mit ihm ihr Programm (r184 schlüsselt nach der Knoten-Identität).
    _leuchtStoff(mat, mp, himmel) {
        if (!mat || mat.isNodeMaterial !== true) throw new Error("_leuchtStoff: kein Knoten-Stoff");
        const Te = THREE.TSL;
        const atmo = this._ensureAtmoUniforms();
        mat.userData = mat.userData || {};
        if (mp && (mp.seh === "glut" || mp.leucht > 0)) {
            mat.userData.lichtPool = "quelle";
            return mat;
        }
        const ohne = this._leuchtOhne || (this._leuchtOhne = {});
        const jeBasis = this._leuchtKnoten || (this._leuchtKnoten = new WeakMap());
        const basis = mat.emissiveNode || ohne;
        if (!jeBasis.has(basis)) jeBasis.set(basis, new WeakMap());
        const jeHimmel = jeBasis.get(basis);
        if (!jeHimmel.has(himmel || ohne)) jeHimmel.set(himmel || ohne, {});
        const knoten = jeHimmel.get(himmel || ohne);
        const plan = mp && mp.licht === "fenster" ? "fenster" : "offen";
        if (!knoten[plan]) {
            let em = mat.emissiveNode ? Te.vec3(mat.emissiveNode) : Te.materialEmissive;
            if (plan === "fenster") em = em.add(atmo.fensterGlut);
            knoten[plan] = em.add(this._lichtPoolTerm(Te, atmo, himmel || null));
        }
        mat.emissiveNode = knoten[plan];
        mat.userData.lichtPool = true;
        return mat;
    }

    // DER LICHT-POOL ALS TERM (K11) — DAS EINE PUNKTLICHT-GESETZ des Stamms (jede Leuchtquelle und das Licht des Auges): je
    // Platz ein Zweig mit dem Abfall des Gesetzes (fachwerk `lichtAbfall`, K11b: (1 − (d/R)⁴)² · (d² + k²)^(−abfall/2); den
    // Bezug in 1 m, (1 + k²)^(abfall/2), trägt die Stärke des Platzes, `_leuchtTakt`), die Stärke schon durch LEGACY_LICHT
    // (`_laborLichtStaerke`) — und r184s BRDF (`_punktLichtBrdf`). Der Kern k (`lichtKern` = k²) beschränkt den Abfall nah an
    // der Quelle (eine Flamme ist keine Punkt-Singularität: r184s nacktes 1/d² legte die Steine am Bett auf das Zehnfache ihrer
    // Glut, und das Licht des Auges lag mit 1/d an der Wand weiß), weit draußen fällt das Feuer mit 1/d² (bis K11b mit dem
    // Legacy-Abfall des r128-Labors (1 − d/R)^abfall: in 4 m noch 31 % — der Boden glühte über mehrere Meter), und an der
    // Reichweite stetig auf 0. Der Welt-Ort des Platzes geht
    // mit `cameraViewMatrix` (der Kamera DES zeichnenden Renderers) in den Blick-Raum. Die BEDINGUNG liest `positionView` und
    // `normalView` (EINE Variable je Programm: r184 baut das Leuchten VOR der Lichtung — zuerst im Zweig gelesen, stünde ihre
    // Zuweisung nur dort, die Falle des Lichts des Auges): eine Reichweite, ein Gewicht (der Himmels-Ersatz), die Fläche in ihr
    // und ihm zugewandt. Die Blick-Richtung rechnet der Zweig aus `positionView`. WAS DER ZWEIG KOSTET (berichtigt beim Merge
    // V18.542 aus der Quelle, nicht aus der Annahme „WGSL select wertet beide Seiten aus"): r184s `select` ist ein
    // ConditionalNode und schreibt außerhalb von `uniformFlow` ein `if`/`else` ins WGSL, kein WGSL-`select` — das erzeugte
    // Boden-Fragment (`werkbank shader --stoff boden`) trägt je Platz `if (Bedingung) { Lambert + GGX } else { 0 }` und kein
    // `select(`. Jedes Fragment zahlt also die Bedingung je Platz (Ort in den Blick-Raum, Abstand, N·L); die BRDF zahlt eine
    // Welle der GPU nur, wenn eines ihrer Fragmente den Zweig nimmt.
    _lichtPoolTerm(Te, atmo, himmel) {
        const N = Te.normalView;
        const P = Te.positionView;
        let summe = null;
        for (let k = 0; k < atmo.lichtLage.length; k++) {
            const lage = atmo.lichtLage[k];
            const farbe = atmo.lichtFarbe[k];
            const ersatz = atmo.lichtErsatz[k];
            const kern = atmo.lichtKern[k];
            const gewicht = himmel ? ersatz.mul(himmel).oneMinus() : ersatz.oneMinus();
            const Lv = Te.cameraViewMatrix.mul(Te.vec4(lage.xyz, 1)).xyz.sub(P);
            const d = Lv.length();
            const bedingung = lage.w
                .greaterThan(0)
                .and(gewicht.greaterThan(0))
                .and(d.lessThan(lage.w))
                .and(N.dot(Lv).greaterThan(0));
            const L = Lv.div(d);
            const nl = N.dot(L).clamp();
            const q = d.div(lage.w).pow2();
            const abst = q
                .pow2()
                .oneMinus()
                .clamp()
                .pow2()
                .mul(d.mul(d).add(kern).pow(farbe.a.mul(-0.5)));
            const beitrag = farbe.rgb
                .mul(nl.mul(abst).mul(gewicht))
                .mul(this._punktLichtBrdf(Te, N, L, P.negate().normalize(), nl));
            const term = Te.select(bedingung, beitrag, Te.vec3(0));
            summe = summe ? summe.add(term) : term;
        }
        return summe;
    }

    // DIE EINE BRDF EINES PUNKTLICHTS (K11, jeder Platz des Licht-Pools): r184s Lambert + GGX ausgeschrieben — BRDF_Lambert,
    // BRDF_GGX und F_Schlick tragen kein Layout (ein Fn-Aufruf ohne Layout baut seinen Rumpf erst im Compiler, der Stoff-Graph
    // sieht ihn nicht), D_GGX und V_GGX_SmithCorrelated tragen ihres; die Stoff-Werte aus `diffuseColor` · `metalness` ·
    // `specularColor` · `specularF90` (wie r184 sie mischt — `three/tsl` der Seite kennt `diffuseContribution`/
    // `specularColorBlended` nicht). N, L, V normiert im Blick-Raum, `nl` = N·L geklemmt.
    _punktLichtBrdf(Te, N, L, V, nl) {
        const alb = Te.diffuseColor.rgb;
        const met = Te.metalness;
        const a = Te.roughness.pow2();
        const f0 = Te.mix(Te.specularColor, alb, met);
        const H = L.add(V).normalize();
        const vh = V.dot(H).clamp();
        const nv = N.dot(V).clamp();
        const nh = N.dot(H).clamp();
        const fres = Te.exp2(vh.mul(-5.55473).sub(6.98316).mul(vh)); // r184 F_Schlick: 2^((−5,55473 · V·H − 6,98316) · V·H)
        const F = f0.mul(fres.oneMinus()).add(Te.specularF90.mul(fres));
        const glanz = F.mul(Te.V_GGX_SmithCorrelated({ alpha: a, dotNL: nl, dotNV: nv })).mul(
            Te.D_GGX({ alpha: a, dotNH: nh })
        );
        return alb
            .mul(met.oneMinus())
            .mul(1 / Math.PI)
            .add(glanz); // r184 BRDF_Lambert + GGX
    }

    // DER RAUSCH-ATLAS (Welle G, der Boden-Stoff): das RAUSCH-GESETZ als EINE Textur, gelesen von zwei Knoten-Bauern, die
    // jeder Boden- und Substanz-Stoff ruft. Befund 06.10. (Zerlege-Linse, GTX 1060, Mess-Wiese): der Boden-Satz kostete
    // 6,90 ms GPU für 6 Befehle und die Hälfte des Bildes; je Boden-Fragment liefen 26 `mx_noise_float` (je Aufruf 8
    // Gitter-Hashes — die Shader-Kosten-Linse zählt 548 Ops je Aufruf, 15 722 je Fragment). Ein 3D-Wert (`raum`) liest 6 Texel,
    // eine Ebene (`ebene`: die dritte Achse ganzzahlig, z. B. `vec3(x, z, 11)` oder der Schnitt y = 0) 2 Texel — dieselbe
    // Blende, dieselbe Gradienten-Verteilung, dieselbe Skala. `ebene(p, k, achse)`: p = die zwei Achsen der Ebene, k = die
    // ganzzahlige dritte, achse = welche Gradienten-Komponente die zweite Achse trägt ("y": der Schnitt z = k mit p = (x, y);
    // "z": der Schnitt y = k mit p = (x, z)) — so trägt jeder Schnitt die Verteilung, die mx_noise in genau diesem Schnitt hat.
    // Die Bauer legen die Knoten IN den Graph des Stoffs (keine WGSL-Funktion mit Layout): r184 baut den Code einer
    // Layout-Funktion EINMAL je Builder-Klasse und hält ihn für jeden weiteren Stoff — eine Textur darin bekäme nur der
    // erste Stoff gebunden, jeder weitere Shader liefe ungültig („unresolved value", Rausch-Probe 06.10.).
    _rauschAtlas() {
        if (this._rauschAtlasCache) return this._rauschAtlasCache;
        const T = THREE.TSL;
        const R = AnazhRealm.RAUSCH_GESETZ;
        const P = R.P;
        const tex = new THREE.DataTexture(
            AnazhRealm._rauschAtlasDaten(),
            3 * P,
            P,
            THREE.RGBAFormat,
            THREE.UnsignedByteType
        );
        tex.name = "rausch-atlas";
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        const [A, B] = R.schraeg;
        const m = T.int(P - 1);
        // die Komponente c der vier Ecken der Zelle (i, j): EIN Texel, roh geladen — die Ladung steht im Programm, das die
        // Probe ruft (eine Bindung lebt nie in einer Layout-Funktion: r184 baut sie EINMAL je Builder-Klasse, jedes weitere
        // Programm erbte den Namen der Textur aus dem ersten)
        const ecken = (i, j, c) => T.textureLoad(tex, T.ivec2(i.mul(3).add(c), j));
        // 0 · 127 · 254 → −1 · 0 · +1
        const dekod = (e) => e.mul(255 / 127).sub(1.0);
        const blende = (t) =>
            t
                .mul(t)
                .mul(t)
                .mul(t.mul(t.mul(6.0).sub(15.0)).add(10.0));
        // bilinear über die vier Ecken (00 · 10 · 01 · 11) mit der Fünftgrad-Blende
        const zelle = (d, u) => T.mix(T.mix(d.x, d.y, u.x), T.mix(d.z, d.w, u.x), u.y);
        // DIE MISCHUNG als EINE WGSL-Funktion je Form (K17-3 Runde 2): rein (die Lage in der Zelle und die geladenen Ecken
        // als Parameter), dieselbe Rechnung wie ausgeschrieben — ausgeschrieben stand sie je Probe im Programm (der Boden
        // trug 13 Proben, mit Schatten 103 369 Zeichen WGSL).
        const ebeneMisch = T.Fn(([f, a, b]) => {
            const fx1 = f.x.sub(1.0);
            const fy1 = f.y.sub(1.0);
            const d = dekod(a)
                .mul(T.vec4(f.x, fx1, f.x, fx1))
                .add(dekod(b).mul(T.vec4(f.y, f.y, fy1, fy1)));
            return zelle(d, blende(f)).mul(R.skala);
        }).setLayout({
            name: "rauschEbene",
            type: "float",
            inputs: [
                { name: "f", type: "vec2" },
                { name: "a", type: "vec4" },
                { name: "b", type: "vec4" },
            ],
        });
        const raumMisch = T.Fn(([f, a0, a1, a2, b0, b1, b2]) => {
            const fx1 = f.x.sub(1.0);
            const fy1 = f.y.sub(1.0);
            const fx4 = T.vec4(f.x, fx1, f.x, fx1);
            const fy4 = T.vec4(f.y, f.y, fy1, fy1);
            const schicht = (e0, e1, e2, fz) => dekod(e0).mul(fx4).add(dekod(e1).mul(fy4)).add(dekod(e2).mul(fz));
            const u = blende(f);
            return zelle(T.mix(schicht(a0, a1, a2, f.z), schicht(b0, b1, b2, f.z.sub(1.0)), u.z), u).mul(R.skala);
        }).setLayout({
            name: "rauschRaum",
            type: "float",
            inputs: [
                { name: "f", type: "vec3" },
                ...["a0", "a1", "a2", "b0", "b1", "b2"].map((name) => ({ name, type: "vec4" })),
            ],
        });
        const ebene = (p, k, achse) => {
            const c = T.floor(p);
            const ci = T.ivec2(c);
            const i0 = ci.x.add(A * k).bitAnd(m);
            const j0 = ci.y.add(B * k).bitAnd(m);
            return ebeneMisch(p.sub(c), ecken(i0, j0, 0), ecken(i0, j0, achse === "z" ? 2 : 1));
        };
        const raum = (p) => {
            const c = T.floor(p);
            const ci = T.ivec3(c);
            const i0 = ci.x.add(ci.z.mul(A)).bitAnd(m);
            const j0 = ci.y.add(ci.z.mul(B)).bitAnd(m);
            const i1 = i0.add(A).bitAnd(m);
            const j1 = j0.add(B).bitAnd(m);
            return raumMisch(
                p.sub(c),
                ecken(i0, j0, 0),
                ecken(i0, j0, 1),
                ecken(i0, j0, 2),
                ecken(i1, j1, 0),
                ecken(i1, j1, 1),
                ecken(i1, j1, 2)
            );
        };
        this._rauschAtlasCache = { tex, raum, ebene };
        return this._rauschAtlasCache;
    }

    // ── DER EINE SUBSTANZ-CHARAKTER-KERN ──
    // Terrain · Vegetation · Flach-Werke lesen alle diese Quelle (Korn · Kavität · Ton · Verwitterung ·
    // Moos · Counter-Shading · Roughness · Bump, LOD-gegated); der Domänen-Unterschied reist als Parameter
    // (`pos`-Skala · tags · metal · mossDrive · bark · bump). Render-only, tag-neutral; Fehler → der
    // unveränderte Albedo. Gibt { albedo, roughNode|null, normalNode|null }.
    _substanceCharacter(_T, baseAlbedo, opts = {}) {
        const out = { albedo: baseAlbedo, roughNode: null, normalNode: null };
        try {
            const _ra = this._rauschAtlas();
            const f = (v) => _T.float(v);
            const asNode = (v, d) => (v == null ? f(d) : v && v.mul ? v : f(v));
            const pos = opts.pos || _T.positionLocal;
            const wp = opts.worldPos || _T.positionWorld;
            const t = opts.tags || {};
            const ht = Math.max(0, Math.min(1, Number(t["härte"]) || 0.4));
            const di = Math.max(0, Math.min(1, (Number(t.dichte) || 0) / 3));
            const metal = Math.max(0, Math.min(1, Number(opts.metal) || 0));
            // Objekt-lokal (Default): Strata-Y · Verwitterung-unten · Counter-Shading · Bump lesen object-lokales
            // y ∈ [−1..1]. Terrain hat kein object-y → `objectLocal:false` schaltet sie ab; Korn · Ton · Kavität ·
            // Moos tragen weiter.
            const objLocal = opts.objectLocal !== false;
            // LOD-Fade: feines Korn + Bump verblassen mit der Distanz (Perf, kein Aliasing), Ton-/Moos-Zonen
            // bleiben. Schwellen aus der EINEN Quelle `TERRAIN_BUMP` (lodNear/lodFar/fineNear/fineFar).
            const _BD = AnazhRealm.TERRAIN_BUMP;
            let fineFade = f(1.0);
            let bumpFade = f(1.0);
            {
                const dist = wp.sub(_T.cameraPosition).length();
                fineFade = f(1.0)
                    .sub(_T.smoothstep(f(_BD.fineNear), f(_BD.fineFar), dist))
                    .clamp(0, 1);
                bumpFade = f(1.0)
                    .sub(_T.smoothstep(f(_BD.lodNear), f(_BD.lodFar), dist))
                    .clamp(0, 1);
            }
            let albedo = baseAlbedo;
            // (1) KORN — Mehr-Oktav-Noise. Metall: anisotrop längs y (geschmiedeter Schliff);
            //     Rinde: Längs-Faser (bark); sonst körnig. `pos` trägt die Domänen-Skala.
            const grainF = 2.2 + ht * 3.4;
            let gPos;
            // RINDE — KOHÄRENTE LÄNGS-FASER (V18.338, „holz hat fasern, wachstumsrichtung"): das Korn
            // wird STARK längs der Wachstumsachse (y) gestreckt → lange vertikale Furchen statt
            // isotropem Rauschen; fein um den Stamm (x/z hoch). So WEISS das Holz seine Richtung.
            if (opts.bark) gPos = _T.vec3(pos.x.mul(13 + ht * 11), pos.y.mul(0.42), pos.z.mul(13 + ht * 11));
            else if (metal > 0.5)
                gPos = _T.vec3(pos.x.mul(grainF * 2.6), pos.y.mul(grainF * 0.4), pos.z.mul(grainF * 2.6));
            else gPos = pos.mul(f(grainF));
            const mottle = _ra.raum(gPos);
            const broad = _ra.raum(pos.mul(f(0.85)));
            // RINDE — die Risse FOLGEN der Faser (vertikale Furchen/Platten), kein isotroper Krater.
            const crN = opts.bark
                ? _ra.raum(_T.vec3(pos.x.mul(19 + ht * 12), pos.y.mul(0.7), pos.z.mul(19 + ht * 12)))
                : _ra.raum(pos.mul(f(6.5 + ht * 9)));
            const cavity = _T.pow(f(1.0).sub(crN.mul(crN)), f(2.4));
            // Härte → kantiger Bruch: harte, nicht-hölzerne, nicht-metallene Materialien (Fels · Stein · Kristall)
            // brechen per ridged noise (Grate + Bruch-Linien) + stärkere Schichtung; weich bleibt weich, Metall
            // behält den Schliff (1−metal). `hardF` ist ein NODE: Basis aus den Tags, per-Fragment moduliert von
            // `opts.hardDrive` (Terrain reicht `rockW` → steiniger Boden bricht karstig, Wiese bleibt weich).
            const hardBase = ht * ht * (1.0 - metal) * (opts.bark ? 0.0 : 1.0);
            const hardDriveOk = (1.0 - metal) * (opts.bark ? 0.0 : 1.0);
            let hardF = f(hardBase);
            if (opts.hardDrive != null)
                hardF = f(hardBase)
                    .add(asNode(opts.hardDrive, 0).mul(f(hardDriveOk)))
                    .clamp(0.0, 1.0);
            // Ein Term mit dem Gewicht 0 rechnet kein Rauschen: der Bruch nur, wo Härte ihn trägt (die Rinde nie), die
            // Schichtung nur object-lokal oder für den Bump (das Terrain las sie × 0 — 1 von 26 Boden-Rauschen).
            const bruch = hardBase > 0 || (opts.hardDrive != null && hardDriveOk > 0);
            const ridge = bruch
                ? f(1.0)
                      .sub(_ra.raum(pos.mul(f(3.0 + ht * 6.0))).abs())
                      .sub(f(0.5))
                      .mul(f(2.0)) // [-1..1] scharfe Grate/Täler
                : null;
            // V18.337 — die RINDE bekommt stärkeren Kontrast: die Längs-Faser (mottle, vertikale
            // Streifen) + die Risse (cavity) sind das definierende Rinden-Detail (§0 „kaum Rinde-
            // Kontrast") → für bark verstärkt; Terrain/Werke unberührt (Faktor 1.0).
            const mottleAmp = (0.12 + di * 0.18) * (metal > 0.5 ? 0.7 : 1.0) * (opts.bark ? 1.7 : 1.0);
            const broadAmp = 0.12 + di * 0.12;
            const cavityAmpJs = (0.08 + ht * 0.16) * (opts.bark ? 2.2 : 1.0);
            const strataAmpJs = (1.0 - metal) * (0.07 + di * 0.17) * (opts.bark ? 0.4 : 1.0) * (objLocal ? 1 : 0);
            const strata =
                strataAmpJs > 0 || opts.bump
                    ? _ra.raum(_T.vec3(pos.x.mul(0.5), pos.y.mul(opts.bark ? 1.2 : 3.4), pos.z.mul(0.5)))
                    : null;
            let mod = f(1.0).add(
                mottle
                    .mul(fineFade)
                    .mul(f(mottleAmp))
                    .mul(f(1.0).sub(hardF.mul(f(0.5))))
            ); // weiches Korn weicht dem Bruch
            if (ridge) mod = mod.add(ridge.mul(fineFade).mul(hardF.mul(f(0.3)))); // angulärer Bruch — skaliert mit hardF
            mod = mod.add(broad.mul(f(broadAmp)));
            if (strataAmpJs > 0) mod = mod.add(strata.mul(f(strataAmpJs)).mul(f(1.0).add(hardF.mul(f(1.8))))); // Schichtung ∝ Härte
            mod = mod.sub(
                cavity
                    .mul(fineFade)
                    .mul(f(cavityAmpJs))
                    .mul(f(1.0).add(hardF.mul(f(1.3))))
            ); // Risse ∝ Härte
            albedo = albedo.mul(mod.clamp(0.5, 1.5));
            // Höhen-Gradient [0..1] (EINE Quelle für Verwitterung + Moos + Counter-Shading).
            const yLow = pos.y.mul(f(0.7)).add(f(0.5)).clamp(0, 1);
            // (2) TON warm↔kühl — ein Hue-Shift LIEST, wo Helligkeit auf Dunkel verschwindet.
            const toneMix = broad
                .mul(f(0.6))
                .add(mottle.mul(f(0.4)))
                .mul(f(0.5))
                .add(f(0.5))
                .clamp(0, 1);
            const toneTint = _T.mix(_T.vec3(0.9, 0.97, 1.12), _T.vec3(1.12, 1.0, 0.86), toneMix);
            albedo = albedo.mul(_T.mix(_T.vec3(1, 1, 1), toneTint, f(metal > 0.5 ? 0.28 : 0.46)));
            // (3) VERWITTERUNG/SCHMUTZ — Mulden + untere Zonen sammeln Schmutz (dunkler, entsättigt).
            // Der Schmutz der Kavität blendet mit ihr aus (`fineFade`, K53): was der Pixel nicht trägt, ist kein Mittel-Versatz —
            // unaufgelöst zog er jeden fernen Boden um 0,3 × Kavitäts-Mittel zur Erde (gate:nah-fern Luft aus: Y −4,5 %, Grün −0,022).
            const grime = cavity
                .mul(fineFade)
                .mul(f(0.5))
                .add(objLocal ? f(1.0).sub(yLow).mul(f(0.45)) : f(0.0))
                .clamp(0, 1);
            const lumA = albedo.x
                .mul(f(0.3))
                .add(albedo.y.mul(f(0.59)))
                .add(albedo.z.mul(f(0.11)));
            const dirt = _T.vec3(
                lumA.mul(f(0.52)).add(f(0.045)),
                lumA.mul(f(0.46)).add(f(0.032)),
                lumA.mul(f(0.38)).add(f(0.022))
            );
            albedo = _T.mix(albedo, dirt, grime.mul(f(opts.bark ? 0.18 : 0.3)));
            // (4) MOOS/FLECHTEN — DIE EINE Quelle. Treiber als Param: Werke = lebendig-Tag,
            //     Terrain = Feucht/Grün-Knoten, Rinde = klein. Geometrie (Patch × flach × tief) geteilt.
            const lebTag = Math.max(0, Math.min(1, (Number(t.lebendig) || 0) / 3));
            const mossDrive = asNode(opts.mossDrive, opts.bark ? 0.12 : lebTag);
            const flatN = asNode(opts.flatness, 1.0);
            const mossPatch = _ra
                .raum(wp.mul(f(0.55)))
                .mul(f(0.5))
                .add(f(0.5));
            const mossLow = objLocal ? f(1.0).sub(yLow) : f(1.0); // Terrain: Flachheit treibt, kein object-y
            const mossW = mossDrive.mul(mossPatch).mul(mossLow).mul(flatN).clamp(0, 1);
            // Die EINE Moos-Farbe: das Moos des Bodens (TERRAIN_GEOLOGY.mossTint = der nasse Grund der Palette, linear)
            // für jeden Leser — Boden, Fels, Rinde, Werke. Bis 06.10. trug der Kern daneben ein Literal (0,26/0,38/0,18,
            // eine Absichts-Farbe roh als linear).
            const moos = AnazhRealm.TERRAIN_GEOLOGY.mossTint;
            albedo = _T.mix(albedo, _T.vec3(moos[0], moos[1], moos[2]), mossW.mul(f(0.4)));
            // (5) COUNTER-SHADING (unten dunkler, oben heller) — nur object-lokal (Terrain: kein object-y).
            if (objLocal) albedo = albedo.mul(_T.mix(f(0.8), f(1.16), yLow));
            out.albedo = albedo;
            // (6) ROUGHNESS-VARIATION — nur mit Basis vom Aufrufer: das Korn variiert fein (Erhebung rau, Mulde
            // glänzt), Moos ist matt, eine feuchte kahle Niederung glänzt (`wetDrive`, Terrain). Für Werke sind
            // mossW/wetDrive ~0/null (kein Effekt).
            if (opts.roughBase != null) {
                let _rN = f(opts.roughBase)
                    .add(mottle.mul(fineFade).mul(f(0.3)))
                    .add(broad.mul(f(0.14)))
                    .sub(cavity.mul(fineFade).mul(f(0.18)))
                    .add(mossW.mul(f(0.22)));
                if (opts.wetDrive != null) _rN = _rN.sub(asNode(opts.wetDrive, 0).mul(f(0.4)));
                out.roughNode = _rN.clamp(0.05, 1.0);
            }
            // (7) MIKRO-RELIEF (Bump) — der transformative Hebel für FLACHE Low-Poly-Facetten:
            //     die Höhe perturbiert die Normale → die Fläche fängt Licht als echte Mikro-Struktur.
            //     LOD-gegated (fern aus). Nur wo angefragt (Werke; Terrain/Rinde haben echtes Relief).
            if (opts.bump) {
                const h = mottle
                    .mul(f(0.5))
                    .add(crN.mul(f(0.5)))
                    .add(strata.mul(f(0.35)));
                const scale = bumpFade.mul(f((0.6 + ht * 0.8) * (metal > 0.5 ? 0.6 : 1.0)));
                out.normalNode = _T.bumpMap(h, scale);
            }
        } catch (_e) {
            throw this._stoffBruch("der Substanz-Charakter", _e);
        }
        return out;
    }

    // Per-Fragment Multi-Klassen-Geologie als EIN geteilter Auslesewert (Toon UND PBR identisch): STEILE
    // (rohe Geometrie-Normale) → Fels/Geröll bricht durch; FLACH + FEUCHT (dampEarth im Basis-Albedo) →
    // Moos. smoothstep-Konkurrenz, per-Fragment (kein Vertex-Trapez). Render-only; Fehler → der
    // unveränderte Albedo.
    _terrainGeologyAlbedo(_T, albedo, wp, roughOut, felsImVertex) {
        try {
            const G = AnazhRealm.TERRAIN_GEOLOGY;
            const au = this.state.atmoUniforms;
            const _ra = this._rauschAtlas();
            // STEILE ∈ [0,1] aus der ROHEN Geometrie-Normale (NICHT der geflatteten
            // Shading-Normale, die `normalWorld` im Farb-Knoten trägt) = die echte Hangneigung.
            const _steep = _T.float(1.0).sub(_T.normalWorldGeometry.y).clamp(0.0, 1.0);
            const _rockW = _T.smoothstep(_T.float(G.rockLo), _T.float(G.rockHi), _steep);
            // DER SCHUTT liegt, wo das Schicht-Gesetz den Schutthang legt — das Gewicht trägt der Vertex (`aSchutt`, `_felsStoff`
            // aus gelaende-core `hoehe(…, aus).schutt`), nie die Steile der Masche: bis zur Nachbesserung 2 lag er ab 28° auf
            // jedem Hang (der grüne Hügel grau, der 42°-Dorfhang zu 85 % Schutt), und das 28°–34°-Band streifte die 30°-Rampe in
            // den Reihen des Netzes. Die Ferne trägt das Mittel des Schutts in ihrer Farbe (`_fernSchutt`, dasselbe Gesetz).
            const _screeW = felsImVertex ? _T.attribute("aSchutt", "float") : _T.float(0);
            const _gRock = au && au.geoRock ? au.geoRock : _T.float(1.0);
            // DER FELS-STOFF (K17, gelaende-core `FELS`): wo das Netz den Fels trägt (der Chunk-Boden, `felsImVertex`),
            // IST die Vertex-Farbe der Fels — `_felsStoff` hat Pakete, Rinde, Mulden, Flechte und Moos aus dem Gesetz
            // aufgelegt und trägt die Mittel dessen, was die Masche nicht trägt (`felsMittelWerte`); die Ferne (Fern-Ring)
            // trägt das Mittel des Stoffs (`FELS_STOFF.mittel`). Der EINE Detail-Term legt das Feine nach DEMSELBEN Gesetz
            // (`felsLage`, `felsKanten`) relativ zu diesen Mitteln auf: die Bank im Paket (Mächtigkeit je Paket, Grenzen
            // gezogen und je Fuge gewellt — wo zwei Fugen sich kreuzen, keilt die Bank aus), die Fuge als KANTE (die Kehle
            // dunkel, die Oberkante hell, je Fuge ihre Weite, auf einem Teil der Länge ausgekeilt) und die Klüfte (schräg,
            // ihre Lage je Paket, an der Fuge nur ein Versatz). EINE Probe im Rausch-Atlas wellt die Schichten im Großen,
            // das Auge blendet aus, was der Pixel nicht trägt. Bis zur Nachbesserung lasen sich gleich hohe Bänke mit
            // geraden Strich-Fugen und je Bank neu ansetzenden Klüften als Ziegelmauer.
            const FS = AnazhRealm.FELS_STOFF;
            const FF = FS.gesetz.fein;
            const GK = globalThis.__gelaendeCore;
            // EIN Rechenwerk (K17, Nachbesserung 2): der Fein-Term IST das Gesetz (gelaende-core `felsFein`, `schuttKorn`) —
            // derselbe Code wie im Vertex, hier mit TSL-Knoten gerechnet (`_felsRechenwerkTSL`, dieselbe 32-Bit-Ziehung, die Welle
            // aus EINER Probe im Rausch-Atlas — der Vertex liest denselben Wert, gelaende-core `rauschRaum`). Er läuft nur, wo Fels oder Schutt liegt (ein Zweig: die Wiese zahlt ihn nicht), das Auge blendet aus, was
            // der Pixel nicht trägt: Bänke und Klüfte `fern` m, Kanten `fugeFern` m, das Schutt-Korn nach seinen Pixeln (die
            // Kante eines Steins unter 1,5 … 4 Pixeln — Schirm-Meter je Pixel aus Abstand, Projektion und Schirmhöhe).
            const _O = AnazhRealm._felsRechenwerkTSL(_T, _ra.raum);
            const _camD = wp.sub(_T.cameraPosition).length();
            const _nahB = _T.float(1).sub(_T.smoothstep(FF.fern[0], FF.fern[1], _camD));
            const _nahF = _T.float(1).sub(_T.smoothstep(FF.fugeFern[0], FF.fugeFern[1], _camD));
            const _pxM = _camD.mul(2).div(_T.cameraProjectionMatrix.element(1).y.mul(_T.screenSize.y));
            const _kornSicht = _T.smoothstep(1.5, 4, _T.float(FS.gesetz.geroell.korn).div(_pxM));
            const _gate = _rockW.add(_screeW).mul(_gRock);
            // DIE FELS-FUNKTION (K17-3): das Gesetz rechnet in EINER WGSL-Funktion (`felsFein`), ihre Wiederholungen als Schleifen
            // (gelaende-core `falte`: die neun Zellen des Schutts, die vier Bank-Grenzen) und die Ziehung als EINE Funktion
            // (`felsZufall`) — ausgeschrieben stand jede Ziehung 78-mal im Boden-Programm (96 050 → 149 521 Zeichen WGSL), und
            // swiftshader übersetzte sie vor dem ersten Bild. Die Welle liest der Graph (EINE Probe im Rausch-Atlas, `felsWelle`)
            // und reicht sie hinein; der Aufruf steht im Zweig (die Wiese zahlt ihn nicht).
            const _welle = GK.felsWelle(_O, wp.x, wp.y, wp.z);
            const _felsFn = _T
                .Fn(([x, y, z, w]) => {
                    const _f = GK.felsFein(_O, FS.basis, x, y, z, w);
                    return _T.vec3(_f.bank, _f.kante, GK.schuttKorn(_O, x, z));
                })
                .setLayout({
                    name: "felsFein",
                    type: "vec3",
                    inputs: [
                        { name: "x", type: "float" },
                        { name: "y", type: "float" },
                        { name: "z", type: "float" },
                        { name: "w", type: "float" },
                    ],
                });
            const _feinV = AnazhRealm._zweigTSL(_T)(_felsFn(wp.x, wp.y, wp.z, _welle), _gate);
            const _fein = _T.mix(_T.float(1), _feinV.x, _nahB).mul(_T.mix(_T.float(1), _feinV.y, _nahF));
            const _felsGrund = felsImVertex ? albedo : _T.vec3(FS.mittel[0], FS.mittel[1], FS.mittel[2]);
            const _rockCol = _felsGrund.mul(_fein);
            // Der Schutthang trägt sein Korn mit dem Gewicht des Schutts im Vertex (`aSchutt`, `_felsStoff`); der Fels dominiert.
            // Wo der Pixel den Stein nicht trägt, bleibt das Mittel des Gerölls (`schuttMittel`: es wirft Schatten in sich).
            // Die Steine liegen, wo das Gesetz Schutt sagt, ganz (`aSchutt` / `schutt`): die 15 % Boden im Ton des Vertex tragen
            // kein eigenes Korn — mit dem Gewicht des Tons (0,85) fehlte dem Hang ein Sechstel seiner Streuung.
            const _kornFern = _T.mix(_T.float(GK.schuttMittel()), _feinV.z, _kornSicht);
            const _kornW = _screeW.div(G.schutt).clamp(0, 1).mul(_gRock);
            let _out = albedo.mul(_T.mix(_T.float(1), _kornFern, _kornW));
            _out = _T.mix(_out, _rockCol, _rockW.mul(_gRock));
            // Moos + Ton/Korn/Kavität aus dem EINEN Substanz-Kern (wie Werke + Rinde); die Geologie-Basis
            // (Fels/Geröll) bleibt terrain-eigen. objectLocal:false (absolute Welt-Höhe). Feucht-/Grün-Treiber
            // × Flachheit speisen das Moos; `wp·0.16` = welt-kohärente Feature-Skala (naht-frei).
            const _flat = _T.float(1.0).sub(_steep);
            const _g2 = _out.y;
            const _rb2 = _out.x.add(_out.z).mul(0.5);
            const _lum2 = _out.x.mul(0.3).add(_out.y.mul(0.59)).add(_out.z.mul(0.11));
            const _green = _T.smoothstep(_T.float(0.0), _T.float(G.gruenSchwelle), _g2.sub(_rb2));
            const _damp = _T.float(1.0).sub(_T.smoothstep(_T.float(G.mossDampLo), _T.float(G.mossDampHi), _lum2));
            const _gMoss = au && au.geoMoss ? au.geoMoss : _T.float(1.0);
            const _mossDrive = _green.mul(_damp).mul(_gMoss).mul(_T.float(G.mossMax));
            // Feuchte-Glanz: eine nasse, KAHLE Niederung (damp hoch, nicht grün) glänzt (niedrigere Rauheit);
            // Moos bleibt matt. Aus DEMSELBEN Feld, das das Moos treibt.
            const _wetDrive = _damp.mul(_T.float(1.0).sub(_green)).clamp(0.0, 1.0);
            // (Die „trockenen braun-gelben Flecken" — Albedo × (1,32 · 1,12 · 0,6) auf jedem nicht-grünen, nicht-
            // feuchten Boden — sind gefallen: sie färbten die Laubstreu orange, Farben außerhalb der Palette.)
            // DER WIESEN-GRUND liegt im Gesetz (K53, `_bodenFarbeAt` · `attachFieldColors`, `WIESEN_GRUND`): der Vertex trägt das
            // Mittel des Halms schon — Chunk, Fern-Ring, Feld-Pass und Panorama lesen EINE Zahl. Bis K53 mischte ihn nur dieses
            // Fragment (Gewicht Grün × Flachheit × Fleck): Boden-Satz und Fern-Ring lagen +20 % über dem CPU-Gesetz, das der
            // Feld-Pass zeichnet (gate:nah-fern, Luft aus). Hier lebt nur noch die Farbe des Halms für das Relief der Nähe.
            const _mg = AnazhRealm.MEADOW_GREEN;
            const _sp = AnazhRealm.GRAS_SPITZE;
            const _wg = AnazhRealm.WIESEN_GRUND.farbe;
            const _wurzel = _T.vec3(_mg[0], _mg[1], _mg[2]);
            const _spitze = _T.vec3(_sp[0], _sp[1], _sp[2]);
            const _krone = _T.vec3(_wg[0], _wg[1], _wg[2]);
            // (Der Waldboden liegt unter den echten Kronen — `_wegeBodenFarbe` mischt die Laubstreu der Kronen-Karte;
            // der Fragment-Zwilling, der grüne feuchte Niederungen zum dunklen Wald-Kern-Ton zog, ist gefallen.)
            // Gras als Oberflächen-Funktion: keine Halm-Geometrie — die Wiese lebt als hochfrequente Blatt-
            // Schattierung des Bodens, NAH eingeblendet (fern trägt der Meadow-Grund). ≈0 Kosten (Noise + Mix),
            // DIESELBEN Gras-Farben wie das Nah-Gras.
            {
                // Die Wiese mit Tiefe: die Halme sind eine PARALLAX-FUNKTION — ein Halm-Noise-Höhenfeld, das der
                // Blick in 8 Schichten durchsticht (Relief-March): hohe Halme fangen den Strahl früh (helle Spitze),
                // Lücken lassen ihn zum dunklen Wurzelgrund. Das Höhenfeld wird per smoothstep an die ECHTE
                // mx_noise-Verteilung (eng um 0.5) gemappt — sonst kollabiert es auf 1-2 Schichten. Halm-Frequenz
                // 9/m (~11-cm-Büschel), Büschel-Maske 2.7/m; die Farben MEADOW_GREEN → GRAS_SPITZE.
                const _camD = wp.sub(_T.cameraPosition).length();
                const _nah = _T.float(1.0).sub(_camD.mul(_T.float(1.0 / 90.0)).clamp(0.0, 1.0)); // 1 am Fuß → 0 bei 90 m
                const _blick = wp.sub(_T.cameraPosition).normalize(); // Auge → Boden
                // Schräg-Projektion: flacher Blick wandert weit durch die Halm-Schicht
                // (starke Parallaxe), steiler Blick kaum — der 0.18-Boden hält die
                // Wanderung am Horizont endlich (dort blendet _nah ohnehin aus).
                const _steil = _blick.y.abs().max(0.18);
                const _halmHoch = _T.float(0.32); // m sichtbare Halm-Schicht
                const _wanderX = _blick.x.div(_steil).mul(_halmHoch);
                const _wanderZ = _blick.z.div(_steil).mul(_halmHoch);
                const _f = _T.float(9.0); // Halm-Frequenz (~11 cm — Armlängen-lesbar)
                // Büschel-Maske (2.7/m, in halber Wander-Tiefe abgetastet): Halme
                // wachsen in Büscheln, die Lücken dazwischen zeigen den Wurzelgrund —
                // die Wiese liest auch auf 10-30 m als Wiese, nicht als Rauschen.
                const _bX = wp.x.add(_wanderX.mul(_T.float(0.5)));
                const _bZ = wp.z.add(_wanderZ.mul(_T.float(0.5)));
                const _tuft = _T.smoothstep(
                    _T.float(0.3),
                    _T.float(0.62),
                    _ra
                        .ebene(_T.vec2(_bX.mul(_T.float(2.7)), _bZ.mul(_T.float(2.7))), 11, "y")
                        .mul(0.5)
                        .add(0.5)
                );
                // Die acht Schichten stehen ausgeschrieben im Programm (der Knoten-Graph sieht jede Ladung, RAUSCH-GESETZ (B)),
                // ihre Mischung rechnet die EINE reine Funktion des Atlas (`rauschEbene`, K17-3 Runde 2) — je Schicht nur die
                // Lage und zwei Ladungen. Eine Schleife hiesse ein Fn-Rumpf: als Layout-Funktion las er die Bindung des Atlas
                // (r184 baut sie EINMAL je Builder-Klasse, jedes weitere Programm erbte den Namen der Textur — die Prüf-Welt sagte
                // die Pipeline ab), ohne Layout blieb er dem Graph verborgen.
                let _traf = _T.float(0.0); // 0 = noch kein Halm getroffen (branchenlos)
                let _trefH = _T.float(0.0); // Halm-Höhe des Treffers (0 = Wurzelgrund)
                for (let _s = 0; _s < 8; _s++) {
                    const _li = 1.0 - _s / 8.0; // Schicht von oben (1.0) nach unten (0.125)
                    const _px = wp.x.add(_wanderX.mul(_T.float(_s / 8.0)));
                    const _pz = wp.z.add(_wanderZ.mul(_T.float(_s / 8.0)));
                    const _hN = _ra
                        .ebene(_T.vec2(_px.mul(_f), _pz.mul(_f)), 11, "y")
                        .mul(0.5)
                        .add(0.5);
                    // Remap an die echte Noise-Verteilung: unter 0.36 = Lücke (0), über
                    // 0.64 = volle Halm-Höhe (1) — so TRAGEN alle 8 Schichten.
                    const _h = _T.smoothstep(_T.float(0.36), _T.float(0.64), _hN).mul(_tuft);
                    const _erst = _T.step(_T.float(_li), _h).mul(_T.float(1.0).sub(_traf));
                    // Die Treffer-Höhe ist die HALM-Höhe (stetig), nie die Schicht: acht Schicht-Stufen lasen sich
                    // auf Armlänge als Höhenlinien (Linse 05.10.).
                    _trefH = _trefH.add(_erst.mul(_h));
                    _traf = _traf.add(_erst);
                }
                // Der getroffene Halm trägt die Farbe SEINER Höhe — derselbe Verlauf Wurzel → Spitze wie das Nah-Gras —,
                // tiefer liegende Treffer im Eigen-Schatten der Büschel (0,65 … 1); die Lücke zeigt den Wurzelgrund im
                // Schatten (0,5 × Wurzel). Bis 05.10. war der Halm die Wurzelfarbe × 0,35 … 1,30: ein Oliv-Tarnmuster
                // unter grellen Nah-Halmen.
                // Wo die Nah-Wiese steht (Radius NAH_WIESE.radius), tragen IHRE Halme das Gras; der Boden darunter ist
                // ihr ruhigerer Wurzelgrund (das Relief zu 40 % über dem Halm-Mittel im Schatten, × 0,7) — das volle
                // Relief erst zu ihrem Rand hin (die acht Schichten lasen sich auf Armlänge als Höhenlinien, Linse 05.10.).
                const _nwR = AnazhRealm.NAH_WIESE.radius;
                const _relief = _T
                    .smoothstep(_T.float(_nwR * 0.5), _T.float(_nwR), _camD)
                    .mul(0.6)
                    .add(0.4);
                const _halmCol = _T.mix(
                    _krone.mul(_T.float(0.7)),
                    _T.mix(
                        _wurzel.mul(_T.float(0.5)),
                        _T.mix(_wurzel, _spitze, _trefH).mul(_T.float(0.65).add(_trefH.mul(_T.float(0.35)))),
                        _traf
                    ),
                    _relief
                );
                const _halmW = _green
                    .mul(_flat.mul(_T.float(1.0).sub(_rockW)))
                    .mul(_nah)
                    // Wo die Gewichte Wiese sagen, BESITZT das Gras den Pixel (0.95) — ein niedrigerer Deckel gibt
                    // Büschel-Fleckung; der Kontrast kommt aus _halmCol (Lücke ↔ Spitze), nie aus der Verdünnung.
                    .mul(_T.float(0.95))
                    .clamp(0.0, 1.0);
                _out = _T.mix(_out, _halmCol, _halmW);
            }
            // Die Geologie treibt die Bruch-Struktur: wo Fels/Geröll durchbricht (`rockW`+`screeW`), bricht der
            // Boden karstig (hardDrive); die flache Wiese bleibt weich (Basis-härte 0.36). Kein neuer Noise.
            const _hardDrive = _rockW.add(_screeW).clamp(0.0, 1.0);
            const _r = this._substanceCharacter(_T, _out, {
                pos: wp.mul(_T.float(0.16)),
                worldPos: wp,
                tags: { härte: 0.36, dichte: 0.5 },
                metal: 0,
                objectLocal: false,
                flatness: _flat.mul(_T.float(1.0).sub(_rockW)),
                mossDrive: _mossDrive,
                roughBase: G.roughBase,
                wetDrive: _wetDrive,
                hardDrive: _hardDrive,
            });
            if (roughOut && _r.roughNode) roughOut.node = _r.roughNode;
            return _r.albedo;
        } catch (_e) {
            throw this._stoffBruch("die Boden-Geologie", _e);
        }
    }

    // Die EINE LOD-Uniform-Quelle, die JEDES Laub-Karten-Material liest: `uLodRef` (pro Frame aus
    // `state.lodRef` — dieselbe Zahl wie die CPU-`_lodPerceptionDistance`, live ohne Rebuild),
    // `uLodMaskOn` (0 → harte Kanten, A/B) und `uDitherT` (golden-ratio-Rotation pro Frame → zeitliche
    // Dither-Streuung). Lazy wie `windUniforms`; ohne TSL → null. `state.lodUniforms` gehört in die
    // audit:strict-Whitelist.
    _ensureLodUniforms() {
        const st = this.state;
        if (st.lodUniforms) return st.lodUniforms;
        const _T = THREE.TSL;
        const _ref = Number.isFinite(st.lodRef) && st.lodRef > 0 ? +st.lodRef : 14;
        // Crossfade-Band-Zahlen als LIVE-Uniforms, geseedet aus der EINEN Quelle `AnazhRealm.LOD_DISTANCES`
        // und pro Frame in `_loopRender` gespiegelt → ein Studio-Live-Ingest (`_foundryIngestRenderConfig`)
        // greift sofort in der Shader-Maske (kein eingefrorener Zweit-Satz).
        const _D = AnazhRealm.LOD_DISTANCES || {};
        const u = {
            uLodRef: _T.uniform(_ref),
            uLodMaskOn: _T.uniform(st.lodMaskOn === false ? 0 : 1),
            uDitherT: _T.uniform(0),
            uLodD0: _T.uniform(Number.isFinite(_D.thresh01) ? _D.thresh01 : 20),
            uLodD1: _T.uniform(Number.isFinite(_D.thresh12) ? _D.thresh12 : 40),
            uLodFade: _T.uniform(Number.isFinite(_D.fade) ? _D.fade : 8),
            uLodFade0: _T.uniform(Number.isFinite(_D.fade0) ? _D.fade0 : 4),
            // DAS AUGE: die Welt-Position der Haupt-Kamera, je Frame gespiegelt. Jede LOD-Maske misst von
            // HIER, nie von `cameraPosition` — die ist im Schattenpass die Kaskaden-Kamera (r184:
            // `renderer.render(scene, shadow.camera)`; bis V18.529 stand sie 200 m über der Box, heute über
            // dem höchsten Werfer): dort lagen nahe Bäume 145 m „weit", jenseits jeder Stufe, und die Maske
            // verwarf ihre Schatten-Fragmente alle.
            uLodAuge: _T.uniform(new THREE.Vector3()),
            // DER PERF-STRECK der Wahrnehmungs-Distanz (_lodPerfMul, je Frame gespiegelt): jede Maske misst
            // die Auge-Distanz × uLodPerf — dieselbe Distanz, nach der die CPU die Stufen legt.
            uLodPerf: _T.uniform(1),
            // DAS ZIEL DER DURCHSICHT (xyz) und ihr Radius (w), dazu das Auge, für das es gilt (`uKamAuge`: die
            // Stellung der Spieler-Kamera, nie die Kamera einer Sonde): `_kamZielSetzen` aus `_loopCamera`,
            // gelesen von `_kameraDurchsichtNode` (der Sicht-Strahl vom Auge zum Ziel).
            uKamZiel: _T.uniform(new THREE.Vector4(0, 0, 0, 0)),
            uKamAuge: _T.uniform(new THREE.Vector3()),
            // DIE NAH-KUGEL der Durchsicht um das Auge (Leben-Schau 2, 09.10.): ihr Radius je Stoff-Art — x Laub,
            // y Rinde, z Boden (die wiegende Nah-Streu) — `_kamZielSetzen`; −Saum heißt: nichts fällt.
            uKamNah: _T.uniform(
                new THREE.Vector3(
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM,
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM,
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM
                )
            ),
        };
        // UNIFORM-HEIMAT: der geteilte LOD-Satz reist als EIN renderGroup-Buffer.
        this._uniformHeimatTeilen(u);
        st.lodUniforms = u;
        return u;
    }

    // DAS AUGE DER STUFEN (K36): EIN Ort, von dem jede Stufen-Frage misst — die Welt-Position der Haupt-Kamera. Die Maske
    // liest ihn je Frame (`uLodAuge`), die Stufen-Wahl, ihr Band, die Verdeckung und der Kalt-Schätzer je Takt; bis K36 maß
    // die CPU vom Spieler: in der Verfolger-Kamera (Arm 9,6 m) wählte sie für Tore und Bäume die Partner der Spieler-Distanz,
    // die Maske blendete nach der Auge-Distanz — am Genesis-Ring standen 9 Tore und Ruinen halb durchsichtig im Bild.
    // Das Auge ist die Kamera, wo zuletzt jemand sie SETZTE — das Rig je Bild (`_lodAugeGesetzt` am Ende von `_loopCamera`),
    // eine Sonde für ihren Schuss (jede Bewegung der Kamera seit der letzten Lesung ist eine Setzung) —, und es REIST MIT
    // DEM SPIELER, bis sie neu gesetzt wird: der Welt-Takt läuft vor dem Rig, ein Sprung (Ankunft, Tor, Rettung, ein Gate
    // ohne Spiel-Takt) trüge die Wahl sonst vom alten Ort. Vor der ersten Setzung steht es, wo das Ego-Rig es setzt: im
    // Kopf des Spielers (der kopflose Boot hält die Kamera im Ursprung, 36 m neben ihm — das Tor kam ohne L0 und ohne
    // Flügel). null = weder Kamera noch Spieler.
    _lodAuge() {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const cam = this.state.camera;
        const out = this._lodAugeV || (this._lodAugeV = new THREE.Vector3());
        const r = this._lodAugeR || (this._lodAugeR = { cam: new THREE.Vector3(), pl: new THREE.Vector3(), stand: 0 });
        if (!cam) return pm ? out.set(pm.x, pm.y + AnazhRealm.EGO_AUGE_M, pm.z) : null;
        const c = cam.getWorldPosition(this._lodAugeC || (this._lodAugeC = new THREE.Vector3()));
        if (r.stand === 0) {
            r.cam.copy(c); // die Kamera, wie sie geboren wurde: ungesetzt
            r.stand = 1;
        } else if (c.distanceToSquared(r.cam) > 1e-10) this._lodAugeGesetzt(c);
        if (r.stand === 1) return pm ? out.set(pm.x, pm.y + AnazhRealm.EGO_AUGE_M, pm.z) : out.copy(c);
        out.copy(c);
        if (pm) out.add(pm).sub(r.pl); // der Sprung des Spielers seit der Setzung
        return out;
    }
    // Die Setzung des Auges (`_lodAuge`): die Kamera steht jetzt für den Spieler, wo er jetzt steht.
    _lodAugeGesetzt(c) {
        const cam = this.state.camera;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!cam) return;
        const r = this._lodAugeR || (this._lodAugeR = { cam: new THREE.Vector3(), pl: new THREE.Vector3(), stand: 0 });
        if (c) r.cam.copy(c);
        else cam.getWorldPosition(r.cam);
        if (pm) r.pl.copy(pm);
        else r.pl.set(0, 0, 0);
        r.stand = 2;
    }

    // DER URSPRUNG DER INSTANZ — das Maß der Blende (Studio foundry-core `_iw = instanceMatrix[3].xz`, `_cd =
    // length(cameraPosition.xz − _iw)`): die Welt-XZ der Achse der gezeichneten Instanz, im Vertex-Takt aus der EINEN Naht
    // (`_weltNaht`: Objekt × Instanz-Matrix; ohne Instanzen der Ursprung des Objekts, eine InstancedMesh ohne Matrix bricht
    // laut). Die Blende misst je INSTANZ, wie die CPU ihre Stufen legt (`_lodPerceptionDistance` am Eintrag): je Fragment
    // gemessen löste sich die ferne Krone eines nahen Baums auf, und die Stufen-Wahl musste dafür die zweite Stufe
    // zeichnen (1110-11: die Birke in 5 m stand doppelt, 0,6–2,7 ms GPU an der Mess-Wiese).
    _instanzMitteNode(T) {
        if (this._instanzMitteKnoten) return this._instanzMitteKnoten;
        if (!T.varying) {
            const text = "URSPRUNG DER INSTANZ: r184 varying fehlt (Vendor-Drift)";
            this.log(text, "ERROR");
            throw new Error(text);
        }
        this._instanzMitteKnoten = T.varying(this._weltNaht(T).anker.xz, "vInstanzMitte");
        return this._instanzMitteKnoten;
    }

    // DIE WELT IM POSITIONS-KNOTEN (K20-N1) — die EINE Naht zwischen Vorlage und Welt für jeden Stoff, der im positionNode
    // die Welt braucht (der Wind von Gras, Streu, Rinde, Laub und Karte, die Karte, die das Auge ansieht, die Blende): r184
    // rechnet den positionNode VOR der Instanz-Matrix (WGSL der Karte und der Nah-Wiesen-Senke gelesen: erst
    // `positionLocal = …positionNode…`, dann `positionLocal = instanzMatrix × positionLocal`), dort lesen positionLocal,
    // normalLocal und positionWorld den VORLAGEN-Raum. Jede InstancedMesh entsteht in `_instanzMesh`, also gilt das für
    // jeden Stoff einer Instanz. Die Naht trägt Mw = Objekt × Instanz-Matrix: `lage` die Welt-Lage des Vertex, `anker` die
    // des Instanz-Ursprungs, `skala` die Instanz-Skala, `spalte(i)` die Achsen, `richtung(n)` eine Vorlagen-Richtung in
    // der Welt und `vorlage(w)` einen Welt-Versatz (Meter, Welt-Richtung) zurück in die Vorlage (Spalten c_i ⟂: c_i·w / |c_i|²)
    // — sonst drehte und skalierte die Matrix ihn mit jeder Instanz (der Wind wehte in der Drehung seines Baums,
    // gate:foundry-impostor C4). Die Wurzel der Reihenfolge im Vendor (three.webgpu.min.js): `setupPosition` legt die
    // Zuweisung des positionNode auf den Stapel; Instanz-, Batch- und Skin-Knoten hängen ihr `positionLocal.assign(M × …)`
    // erst in ihrem setup an den aktiven Stapel, und `StackNode.build` baut nachgereichte Knoten NACH den ersten — das gilt
    // für jede InstancedMesh, die Foundry-Senken eingeschlossen. EIN Satz Knoten (1310-18): r184 schlüsselt ein Programm
    // nach der Identität seiner Knoten — die Naht entsteht EINMAL, `richtung` und `vorlage` merken sich ihren Knoten je
    // Eingang, sonst trüge jeder Leser, der seinen Graphen teilt (der Wind je Art), doch frische Knoten.
    _weltNaht(T) {
        if (this._weltNahtKnoten) return this._weltNahtKnoten;
        const Mw = T.modelWorldMatrix.mul(this._instanzMatrixNode(T));
        const c0 = Mw.element(0).xyz;
        const c1 = Mw.element(1).xyz;
        const c2 = Mw.element(2).xyz;
        const jeRichtung = new WeakMap();
        const jeVorlage = new WeakMap();
        const merk = (karte, n, bau) => {
            if (!karte.has(n)) karte.set(n, bau(n));
            return karte.get(n);
        };
        this._weltNahtKnoten = {
            anker: Mw.element(3).xyz,
            lage: Mw.mul(T.vec4(T.positionLocal, 1.0)).xyz,
            skala: c0.length(),
            spalte: (i) => (i === 0 ? c0 : i === 1 ? c1 : c2),
            richtung: (n) => merk(jeRichtung, n, (r) => T.normalize(Mw.mul(T.vec4(r, 0.0)).xyz)),
            vorlage: (w) =>
                merk(jeVorlage, w, (v) =>
                    T.vec3(
                        c0.dot(v).div(c0.dot(c0).max(1e-12)),
                        c1.dot(v).div(c1.dot(c1).max(1e-12)),
                        c2.dot(v).div(c2.dot(c2).max(1e-12))
                    )
                ),
        };
        return this._weltNahtKnoten;
    }

    // DIE INSTANZ-MATRIX IM POSITIONS-KNOTEN (K20): die Matrix der gezeichneten Instanz (der Haken an
    // `_createInstanceMatrixNode` legt sie je Bau am Builder ab), ohne Instanzen die Einheit — der EINE Leser des Hakens,
    // gelesen über die Naht `_weltNaht`. Fehlt sie an einer InstancedMesh, bricht der Bau LAUT — nie ein Stoff, der still
    // in der Drehung seiner Instanz steht.
    _instanzMatrixNode(T) {
        if (this._instanzMatrixKnoten) return this._instanzMatrixKnoten;
        const N = THREE.InstanceNode ? Object.getPrototypeOf(THREE.InstanceNode) : null;
        if (!N || N.type !== "Node" || !T.mat4) {
            const text = "INSTANZ-MATRIX: r184 Node (über InstanceNode) · mat4 fehlen (Vendor-Drift)";
            this.log(text, "ERROR");
            throw new Error(text);
        }
        const realm = this;
        class InstanzMatrix extends N {
            constructor() {
                super("mat4");
            }
            setup(builder) {
                const m = builder.__anazhInstanzMatrix;
                if (m) return m;
                if (builder.object && builder.object.isInstancedMesh) {
                    const text =
                        "INSTANZ-MATRIX: der Bau einer InstancedMesh fragt vor ihrer Instanz-Matrix (r184-Reihenfolge)";
                    realm.log(text, "ERROR");
                    throw new Error(text);
                }
                return T.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            }
        }
        this._instanzMatrixKnoten = new InstanzMatrix();
        return this._instanzMatrixKnoten;
    }

    // DER BRUCH DER BLENDE (1110-11 Nachtrag): fehlt der Blende ein Glied (ein Uniform des LOD-Satzes, ein TSL-Knoten, die
    // Distanz der Karte, der Kanal des Stoffs), bricht der Bau des Stoffs LAUT beim Namen. Bis hierher gab die Blende still
    // null zurück (ihr catch legte den Fehler in eine Fenster-Variable, die niemand las), und jeder Aufrufer zeichnete weiter:
    // der Baum-Stoff ohne Maske (L0 und Band-L1 deckungsgleich voll, die Instanz-Wahl ohne Fenster), die Karte ohne
    // Ausblendung, die Blatt-Karte ohne Stufen-Blende — gate:foundry-crossfade (9) DIE LAUTE BLENDE.
    _blendeBruch(was) {
        const e = this._stoffBruch("BLENDE: " + was + " — kein Stoff zeichnet ohne seine Maske");
        e.blende = true;
        return e;
    }

    // DER BRUCH DES STOFFS (K22): fehlt einem Stoff oder dem Render-Graphen ein Glied — ein Uniform-Satz, ein Knoten, eine
    // Karte, ein Bau-Schritt wirft —, bricht der Bau LAUT beim Namen: ERROR ins Log, ein Fehler mit der Marke `stoff`. Bis
    // hierher fingen 95 Stellen den Fehler still (ein catch ohne Wurf, eine Fenster-Variable ohne Leser, ein Wenn um ein
    // TSL-Glied, ein Knoten-Bauer, der null gab), und der Stoff zeichnete byte-alt ohne sein Glied weiter — gate:altlasten
    // DIE STOFF-WAND. `ursache`: ein fremder Fehler wird einmal mit dem Ort eingewickelt, ein Bruch reist unverändert weiter.
    _stoffBruch(was, ursache) {
        if (ursache && ursache.stoff === true) return ursache;
        const text = "STOFF: " + was + (ursache ? " — " + ((ursache && ursache.message) || ursache) : "");
        this._bruchMelden(text);
        const e = new Error(text);
        e.stoff = true;
        return e;
    }

    // DER EINE MELDER (K22 Nachbesserung 3): jeder Bruch meldet ERROR — eine NEUE Meldung sofort, dieselbe wieder (ein
    // Bruch, der jeden Frame wirft) zählt in ihrem Buch-Eintrag und meldet sich höchstens alle BRUCH_WIEDER_MS mit ihrem
    // Zähler, nie still. Bis hierher kannte die Drossel des Loops nur die LETZTE Meldung (zwei abwechselnde Frame-Fehler
    // meldeten je Frame ERROR), und `_stoffBruch` meldete einen Bruch im Takt je Frame. Das Buch hält die jüngsten
    // BRUCH_BUCH_MAX Meldungen (ein Instanz-Feld: nie im Spielstand). Die Wiederholung meldet sich über ihre FRIST: die
    // erste Wiederholung nach einer Meldung stellt sie (BRUCH_WIEDER_MS), und die Frist meldet den Zähler — auch wenn die
    // Folge davor endet (Prüfer K22-3: eine Folge, die binnen 2 s nach der letzten Meldung endete, blieb ungemeldet).
    _bruchMelden(text) {
        const buch = this._bruchBuch || (this._bruchBuch = new Map());
        const e = buch.get(text);
        if (!e) {
            if (buch.size >= AnazhRealm.BRUCH_BUCH_MAX) buch.delete(buch.keys().next().value);
            buch.set(text, { n: 1, still: 0, frist: null });
            this.log(text, "ERROR");
            return;
        }
        e.n++;
        e.still++;
        if (e.frist != null) return;
        e.frist = setTimeout(() => {
            e.frist = null;
            this.log(`${text} (wieder: ${e.still}× seit der letzten Meldung, ${e.n}× insgesamt)`, "ERROR");
            e.still = 0;
        }, AnazhRealm.BRUCH_WIEDER_MS);
    }

    // Studio-Dither-Blende als TSL-Knoten = `__phytoCore.lodCrossfadeMask` symbolisch — jede Formel MUSS
    // ihr entsprechen (Linse `gate:foundry-crossfade`); Zahlen aus uLodD0/uLodD1/uLodFade/uLodFade0 +
    // `_ensureLodUniforms`. opts.impostor → fin-Einblendung (lod=2) aus opts.distNode × Wahrnehmungs-k;
    // sonst 3D-Stufen über aLodLevel (1 = L0 · 2 = L1 · 0 = ungemaskt) + aH0/aH0L; opts.foliage = Laub
    // vs. Rinde. Rückgabe: keep-Knoten (1 = behalten → der Aufrufer faltet ihn in die Alpha) oder null.
    _lodCrossfadeMaskNode(T, opts) {
        try {
            const _lu = this._ensureLodUniforms();
            if (!T || !_lu)
                throw this._blendeBruch(!T ? "TSL fehlt" : "der LOD-Uniform-Satz fehlt (_ensureLodUniforms)");
            const _fehlt = [
                "uLodRef",
                "uLodMaskOn",
                "uDitherT",
                "uLodD0",
                "uLodD1",
                "uLodFade",
                "uLodFade0",
                "uLodPerf",
            ]
                .filter((k) => !_lu[k])
                .concat(
                    ["float", "fract", "screenCoordinate", "step", "mix"].filter((k) => !T[k]).map((k) => "TSL." + k)
                );
            if (_fehlt.length) throw this._blendeBruch("es fehlt " + _fehlt.join(" · "));
            // W5.4 (Schritt 3) — die Band-Zahlen als LIVE-Uniforms (Quelle LOD_DISTANCES via
            // `_ensureLodUniforms`-Seed + `_loopRender`-Spiegel): Rampen-Kanten als Knoten-Mathe.
            const _edge1 = _lu.uLodD1.sub(_lu.uLodFade); // D1 − FADE
            const _edge0 = _lu.uLodD0.sub(_lu.uLodFade0); // D0 − FADE0
            const _fadeW = _lu.uLodFade.max(T.float(1e-3));
            const _fadeW0 = _lu.uLodFade0.max(T.float(1e-3));
            // _dh — Interleaved-Gradient-Noise, BYTE-GENAU __phytoCore.lodDitherIGN
            // (52.9829189 · 0.06711056 · 0.00583715; foundry-core.js Z.212).
            const _fc = T.screenCoordinate;
            const _dh = T.fract(
                T.float(52.9829189)
                    .mul(T.fract(_fc.x.mul(0.06711056).add(_fc.y.mul(0.00583715))))
                    .add(_lu.uDitherT)
            );
            if (opts && opts.impostor === true) {
                // __phytoCore.lodCrossfadeMask lod=2: keep = max(min(2·f1,1), vOcc) ≥ dh — die Verdeckung reist als
                // Instanz-Attribut (verdeckt-demotierte Bäume blenden VOLL; Default 0 = altes Verhalten).
                const _dist = opts.distNode;
                if (!_dist) throw this._blendeBruch("die Karte reicht keine Distanz (opts.distNode)");
                let _vCD = _dist.mul(_lu.uLodPerf); // derselbe Perf-Streck wie die CPU (_lodPerfMul)
                if (opts.visHeightNode) {
                    // × min(uLodRef/Sichthöhe, 1) AUF die gestreckte Distanz — bis 04.10. ersetzte dieser Zweig sie
                    // durch die rohe: unter Last (Perf ×1,3) blendete die L1 nach der gestreckten Distanz aus, das
                    // Billboard ohne Streck ein, bei 20 m stand der Baum zu 50 % durchsichtig.
                    const _k = _lu.uLodRef.div(opts.visHeightNode.max(T.float(1e-3))).min(T.float(1.0));
                    _vCD = _vCD.mul(_k);
                }
                const _f1i = _vCD.sub(_edge1).div(_fadeW).clamp(0.0, 1.0);
                const _occl = opts.occlNode || null; // die Verdeckung der Karte (aKarte.w < 0)
                const _fin = _f1i.mul(2.0).min(T.float(1.0));
                const _keepFin = T.step(_dh, _occl ? _fin.max(_occl) : _fin);
                return T.mix(T.float(1.0), _keepFin, _lu.uLodMaskOn);
            }
            // 3D-Stufen (Stufe L0/L1) — die Stempel-Attribute + die SSE-Distanzen, gemessen vom AUGE (`uLodAuge`):
            // so maskiert der Schattenpass jede Stufe, wie das Auge sie sieht — jede Stufe wirft genau dort, wo sie
            // gezeichnet wird.
            const _auge = _lu.uLodAuge;
            if (!T.attribute || !_auge || !T.length || !T.vec2)
                throw this._blendeBruch("die 3D-Stufen-Maske: TSL.attribute · uLodAuge · TSL.length · TSL.vec2 fehlen");
            const _aLod = T.attribute("aLodLevel", "float");
            const _aH0 = T.attribute("aH0", "float");
            const _aH0L = T.attribute("aH0L", "float");
            // × uLodPerf: dieselbe Wahrnehmungs-Distanz, nach der die CPU die Stufen legt (_lodPerfMul) — vom Auge zum
            // URSPRUNG der Instanz (`_instanzMitteNode`), wie das Studio und die CPU, nie zum Fragment.
            const _mitte = this._instanzMitteNode(T);
            const _cd = T.length(T.vec2(_auge.x.sub(_mitte.x), _auge.z.sub(_mitte.y))).mul(_lu.uLodPerf);
            const _lk = _lu.uLodRef.div(_aH0.max(T.float(1e-3))).min(T.float(1.0));
            // |aH0L|: das Vorzeichen trägt den HALT (`_lodSlotStamp`), der Betrag die Blatt-Sichthöhe
            const _lkL = _lu.uLodRef.div(_aH0L.abs().max(T.float(1e-3))).min(T.float(1.0));
            const _dS = _cd.mul(_lk); // vLodD (Skelett-Metrik)
            const _dL = _cd.mul(_lkL); // vLodDL (Blatt-Metrik)
            // __phytoCore.lodCrossfadeMask: f1/f0/f1o — dieselben Rampen, symbolisch.
            const _f1 = _dS.sub(_edge1).div(_fadeW).clamp(0.0, 1.0);
            const _f0 = _dL.sub(_edge0).div(_fadeW0).clamp(0.0, 1.0);
            const _f1o = _f1.mul(2.0).sub(1.0).clamp(0.0, 1.0);
            const _foliage = !!(opts && opts.foliage);
            // keep Stufe L0 (lod=0): Laub keep = clamp(2f0−1) < dh · Rinde keep = f0 < dh.
            const _keep0 = _foliage ? T.step(_f0.mul(2.0).sub(1.0).clamp(0.0, 1.0), _dh) : T.step(_f0, _dh);
            // keep Stufe L1 (lod=1): (Laub min(2f0,1) ≥ dh · Rinde f0 ≥ dh) UND f1o < dh. Die einzige Nah-Stufe einer
            // Art ohne L0 (aLodLevel 3) blendet nie ein, nur zum Billboard aus: keep = f1o < dh.
            const _fadeIn = _foliage ? T.step(_dh, _f0.mul(2.0).min(T.float(1.0))) : T.step(_dh, _f0);
            const _keep1 = _fadeIn.max(T.step(T.float(2.5), _aLod)).mul(T.step(_f1o, _dh));
            // Stufen-Wahl per aLodLevel (1 → keep0 · 2 → keep1) + das vLod>0.5-Gate (0 → ungemaskt).
            // DER HALT (K36): aH0L < 0 — die Stufe steht ohne ihren Partner und weicht keinem Nichts, sie zeichnet voll.
            const _halt = T.float(1.0).sub(T.step(T.float(0.0), _aH0L));
            const _stageKeep = T.mix(_keep0, _keep1, T.step(T.float(1.5), _aLod)).max(_halt);
            const _masked = T.step(T.float(0.5), _aLod);
            const _keep = T.mix(T.float(1.0), _stageKeep, _masked);
            return T.mix(T.float(1.0), _keep, _lu.uLodMaskOn);
        } catch (_e) {
            throw _e && _e.blende === true
                ? _e
                : this._blendeBruch("der Bau der Maske scheiterte: " + ((_e && _e.message) || _e));
        }
    }

    // DIE DURCHSICHT DER KAMERA (Leben-Schau 07.10. L-Kamera, Gegenprüfung Runde 1): eine Pflanze zwischen Auge und Spieler
    // ist durchsichtig, statt die Kamera zu halten — der Profi-Weg für Laub (kein Wald ist für eine Kamera mit 9,6 m Arm frei:
    // die Kronen-Hülle hielt die Verfolger-Kamera am Wagendach). Was zwischen Auge (`uKamAuge`) und Ziel (`uKamZiel.xyz`,
    // `_kamZielSetzen`) näher als der Radius `uKamZiel.w` am Sicht-Strahl liegt, fällt, und ebenso, was in der NAH-KUGEL um
    // das Auge liegt (Radius `uKamNah` je Stoff-Art: x Laub, y Rinde, z Boden — Leben-Schau 2, 09.10.: das Rohr um den
    // Sicht-Strahl ließ die Krone um die Linse stehen) — die EINE Formel `_durchsichtGewicht`; über den Saum
    // KAMERA_DURCHSICHT.saumM dithert es aus — dasselbe Interleaved-Gradient-Rauschen wie die Stufen-Blende
    // (`__phytoCore.lodDitherIGN`, rotiert mit uDitherT: das zeitliche Mittel der Auflösung ist die weiche Kante). `art` ∈
    // "laub" · "rinde" · "boden" (die wiegende Nah-Streu: Blume, Farn, Gestrüpp, Schilf): je Art EIN Knoten
    // (`_kamDurchKnoten`, die Linse erkennt ihn). Rückgabe: der bool-Knoten für `maskNode` (true = behalten) — der
    // Schatten-Pass liest ihn nie (der Aufrufer setzt `maskShadowNode`): der Baum wirft seinen ganzen Schatten.
    _kameraDurchsichtNode(T, art) {
        const knoten = this._kamDurchKnoten || (this._kamDurchKnoten = {});
        const a = art === "rinde" || art === "boden" ? art : "laub";
        if (knoten[a]) return knoten[a];
        const lu = this._ensureLodUniforms();
        const A = {
            k: (n) => T.float(n),
            sub: (a, b) => a.sub(b),
            mul: (a, b) => a.mul(b),
            div: (a, b) => a.div(b),
            dot: (a, b) => T.dot(a, b),
            len: (a) => T.length(a),
            max: (a, b) => a.max(b),
            min: (a, b) => a.min(b),
            clamp01: (a) => a.clamp(0.0, 1.0),
        };
        const n = a === "rinde" ? lu.uKamNah.y : a === "boden" ? lu.uKamNah.z : lu.uKamNah.x;
        const w = AnazhRealm._durchsichtGewicht(A, T.positionWorld, lu.uKamAuge, lu.uKamZiel.xyz, lu.uKamZiel.w, n);
        const fc = T.screenCoordinate;
        const dh = T.fract(
            T.float(52.9829189)
                .mul(T.fract(fc.x.mul(0.06711056).add(fc.y.mul(0.00583715))))
                .add(lu.uDitherT)
        );
        knoten[a] = w.greaterThan(dh);
        return knoten[a];
    }

    // DIE EINE FORMEL DER DURCHSICHT (Gegenprüfung Runde 2): das Gewicht w ∈ [0, 1], mit dem ein Punkt p steht (0 fällt
    // ganz, 1 steht; der Stoff vergleicht es mit dem Rauschen) — Auge E, Ziel Z, Radius r, Nah-Radius n. DURCHSICHTIG IST,
    // WAS ZWISCHEN AUGE UND ZIEL LIEGT: näher als r am Sicht-Strahl (QUER, über den Saum KAMERA_DURCHSICHT.saumM
    // ausgeblendet) UND vor der Ebene des Ziels (VOR, über denselben Saum vor ihr ausgeblendet) — der Strahl des Fadenkreuzes
    // beginnt auf dieser Ebene (`_fadenkreuzStrahl`), was er trifft, steht. Die Kugel um das Ziel fiel: sie schnitt im 1st
    // (das Ziel ist das Auge) die Rinde bis 1,1 m vom Auge (7 von 8 Anläufen an einen Stamm, das Auge 0,01–1,24 m von ihm:
    // ein Loch im Baum, an dem man steht) und in 3rd den Stamm VOR dem Spieler um die Brust. Im 1st ist die Strecke leer.
    // UND DURCHSICHTIG IST, WAS IN DER NAH-KUGEL UM DAS AUGE LIEGT (NAH: näher als n am Auge, über denselben Saum
    // ausgeblendet; Leben-Schau 2, 09.10.: das Rohr allein ließ die Krone um die Linse stehen — die Kamera in der Eichenkrone
    // am Ufer, im Ich-Auge ein Strauch vor dem Gesicht). Der Schreiber (`_kamZielSetzen`) hält die Kugel in 3rd vor der Ebene
    // des Ziels, n = −Saum heißt: nichts fällt. Sie rechnet über einer Algebra A: TSL-Knoten im Stoff
    // (`_kameraDurchsichtNode`), Zahlen in den Linsen (`DURCHSICHT_ZAHLEN`, gate:ankunft LK, gate:kamera-laub) — EINE Formel.
    static _durchsichtGewicht(A, p, E, Z, r, n) {
        const S = A.k(AnazhRealm.KAMERA_DURCHSICHT.saumM);
        const ez = A.sub(Z, E);
        const pe = A.sub(p, E);
        const L = A.len(ez);
        const Lm = A.max(L, A.k(1e-4));
        const s = A.div(A.dot(pe, ez), Lm); // Meter längs des Sicht-Strahls ab dem Auge
        const t = A.clamp01(A.div(s, Lm));
        const quer = A.clamp01(A.div(A.sub(A.len(A.sub(pe, A.mul(ez, t))), r), S));
        const vor = A.clamp01(A.sub(A.k(1), A.div(A.sub(L, s), S)));
        const nah = A.clamp01(A.div(A.sub(A.len(pe), n), S));
        return A.min(A.max(quer, vor), nah);
    }

    // STEHT DER TREFFER IM BILD? (ein Raycaster-Treffer { point, object, face }): trägt sein Stoff die Durchsicht der Kamera
    // (`maskNode` = der Knoten seiner Art), steht er mit dem Gewicht der EINEN Formel über der Mitte des Saums (die Werte, die
    // `_kamZielSetzen` der GPU schrieb) — die Probe durch die Bildmitte trifft nie, was das Bild nicht zeigt (Laub in der
    // Nah-Kugel des Ich-Auges). Jeder andere Stoff steht.
    _durchsichtSteht(h) {
        const kn = this._kamDurchKnoten;
        const k = this.state._kamZiel;
        if (!h || !kn || !k || !h.object) return true;
        const m = h.object.material;
        const mat = Array.isArray(m) ? m[(h.face && h.face.materialIndex) || 0] : m;
        const mk = mat ? mat.maskNode : null;
        const n = !mk ? null : mk === kn.laub ? k.nl : mk === kn.rinde ? k.nr : mk === kn.boden ? k.nb : null;
        if (n === null) return true;
        const w = AnazhRealm._durchsichtGewicht(
            AnazhRealm.DURCHSICHT_ZAHLEN,
            h.point,
            { x: k.ex, y: k.ey, z: k.ez },
            { x: k.x, y: k.y, z: k.z },
            k.r,
            n
        );
        return w >= 0.5;
    }

    _applyVegetationResponse(mat, opts, responseProfile) {
        if (opts.useInstanceTint) {
            if (!mat.userData) mat.userData = {};
            mat.userData.useInstanceTint = true;
        }
        // DER WIND DES WERKSTATT-BAUMS (K19): der Grammatik-Baum (`_buildTreeSkeletonLeaves`) trägt den EINEN Wind-Term der
        // Foundry-Pflanze (`_baumWindStoff`): Höhe und Schlankheit aus seinem Skelett (`opts.baumWind`, `_skelettWindDaten`),
        // die Welt-Höhe aus dem Instanz-Stempel aH0, die Last aus der Wind-Zeile des Wetters. Was kein Skelett trägt (Holz,
        // Leder, Fleisch der Bauteile), steht im Wind: bis K19 bog die Tag-Achse `wiegen` jedes lebendige Bauteil mit eigener
        // Sinus-Formel ohne Wind-Zeile (der Sturm sah aus wie die Brise). Die Karte (impostorAtlas) trägt ihren eigenen Term.
        if (opts.baumWind && !opts.impostorAtlas)
            this._baumWindStoff(mat, opts.foliageLeaf === true ? "foliage" : "bark", opts.baumWind);
        // SUBSURFACE-BACKLIT (detail > 0.4, laub): warmer Gegenlicht-Glow,
        // post-lighting auf outputNode (kein colorNode-Eingriff, CLAUDE.md-Gotcha). Laub trägt das Laub-Licht (K19), nie ihn.
        if (responseProfile && responseProfile.detail > 0.4 && opts.foliageLeaf !== true) {
            try {
                const _Td = THREE.TSL;
                const _wu = this._windUniformsEnsure();
                {
                    const _vd = _Td.normalize(_Td.cameraPosition.sub(_Td.positionWorld));
                    const _sunBack = _wu.uSunDir.mul(_Td.float(-1.0));
                    const _backDot = _vd.dot(_sunBack).clamp(0.0, 1.0);
                    const _backlit = _Td.pow(_backDot, _Td.float(3.0));
                    const _detailStrength = Math.max(0, Math.min(1, responseProfile.detail));
                    const _glowColor = _Td.vec3(1.0, 0.85, 0.6);
                    const _glow = _glowColor.mul(_backlit).mul(_Td.float(_detailStrength * 0.18));
                    const _currentOutput = mat.outputNode || _Td.output;
                    mat.outputNode = _currentOutput.add(_Td.vec4(_glow, _Td.float(0.0)));
                }
            } catch (_e) {
                throw this._stoffBruch("das Gegenlicht der Vegetation", _e);
            }
        }
        // DAS LAUB-LICHT (K19): das Grammatik-Laub (Blatt-Karte und Klinge) lichtet mit dem EINEN Laub-Licht-Term des Foundry-
        // Laubs (`_laubLichtStoff`, phyto-core `laubDurchlass`) — die unbelichtete Silhouetten-Aufhellung (die Fresnel-Kopie des
        // Labors) und der sonnen-blinde Gegenlicht-Glow sind gefallen; die Klinge ist Laub, die Karte erkennt die Nadel am Atlas.
        if (opts.foliageLeaf === true) this._laubLichtStoff(mat, opts.foliageBlade !== true);
        // SSE-Metrik + Dither-Crossfade NUR für Laub-Karten (`opts.foliageLeaf` trägt aH0/aH0L aus
        // `_buildTreeFoliageCardGeometry`; sonst attribute()-Crash). Dieselbe `uLodRef`-Quelle wie die CPU:
        //   vLodD  = |Auge.xz − Ursprung der Instanz.xz| · min(uLodRef/aH0, 1) (großer Baum behält Detail länger;
        //            `_instanzMitteNode`, Studio `_iw`); vLodDL = dasselbe mit aH0L (Blatt-Sichthöhe).
        // Der Discard faltet in die Alpha (alphaTest cullt); uLodMaskOn=0 oder NAH-Band → keep=1, byte-gleich.
        if (opts.foliageLeaf === true) {
            try {
                const _Tl = THREE.TSL;
                const _lu = this._ensureLodUniforms();
                const _fehlt = [
                    ["TSL", _Tl],
                    ["uLodRef", _lu.uLodRef],
                    ["uLodAuge", _lu.uLodAuge],
                    [
                        "die Farbe mit Alpha",
                        mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined,
                    ],
                ]
                    .concat(
                        [
                            "attribute",
                            "vec2",
                            "vec4",
                            "float",
                            "length",
                            "screenCoordinate",
                            "fract",
                            "step",
                            "mix",
                        ].map((k) => ["TSL." + k, _Tl[k]])
                    )
                    .filter((x) => !x[1])
                    .map((x) => x[0]);
                if (_fehlt.length) throw this._blendeBruch("die Blatt-Karte: es fehlt " + _fehlt.join(" · "));
                {
                    const _aH0 = _Tl.attribute("aH0", "float");
                    const _aH0L = _Tl.attribute("aH0L", "float");
                    const _cam = _lu.uLodAuge; // das AUGE, nie die Pass-Kamera (Schattenpass = Kaskaden-Kamera)
                    // xz-Distanz Auge → URSPRUNG der Instanz (`_instanzMitteNode`, Studio `_iw`), nie zum Vertex
                    const _mitte = this._instanzMitteNode(_Tl);
                    const _cd = _Tl.length(_Tl.vec2(_cam.x.sub(_mitte.x), _cam.z.sub(_mitte.y))).mul(_lu.uLodPerf);
                    const _ref = _lu.uLodRef;
                    const _lk = _ref.div(_aH0.max(_Tl.float(1e-3))).min(_Tl.float(1.0));
                    const _lkL = _ref.div(_aH0L.abs().max(_Tl.float(1e-3))).min(_Tl.float(1.0)); // |aH0L|: Vorzeichen = Halt
                    const _vLodD = _cd.mul(_lk); // Skelett-SSE
                    const _vLodDL = _cd.mul(_lkL); // Blatt-SSE (absolut-nah)
                    // golden-ratio Screen-Space-Dither (phytogenesis Fragment): wandert mit uDitherT →
                    // über ~6-8 Frames glättet die zeitliche Streuung den Übergang (TAA-Idee).
                    const _fc = _Tl.screenCoordinate;
                    const _dh = _Tl.fract(
                        _Tl
                            .float(52.9829189)
                            .mul(_Tl.fract(_fc.x.mul(0.06711056).add(_fc.y.mul(0.00583715))))
                            .add(_lu.uDitherT)
                    );
                    const _cfg = AnazhRealm.LOD_DISTANCES;
                    const _D0 = _cfg.thresh01,
                        _D1 = _cfg.thresh12,
                        _FADE = _cfg.fade || 20,
                        _FADE0 = _cfg.fade0 || 10;
                    // Übergangs-Rampen: _f0 = L0→L1-Band (Blatt-Distanz), _f1 = L1→L2/Impostor-Band
                    // (Skelett-Distanz). Laub = ÜBERLAPPENDE Rampen (phytogenesis FIX v37): die Karte
                    // weicht erst in der oberen Bandhälfte (2f−1) → Deckung bleibt ≥ Maximum, kein Loch.
                    const _f0 = _vLodDL
                        .sub(_Tl.float(_D0 - _FADE0))
                        .div(_Tl.float(_FADE0))
                        .clamp(0.0, 1.0);
                    const _f1 = _vLodD
                        .sub(_Tl.float(_D1 - _FADE))
                        .div(_Tl.float(_FADE))
                        .clamp(0.0, 1.0);
                    const _fadeOut = _f0.mul(2.0).sub(1.0).clamp(0.0, 1.0).max(_f1);
                    // Dither-Discard als reine Arithmetik: keepRaw = step(fadeOut, dh) (1 = behalten); uLodMaskOn faltet
                    // als mix (0 → keep=1, harte Kante); im NAH-Band fadeOut=0 → keep=1 → alpha byte-unverändert.
                    // DER HALT (K36, `_lodSlotStamp`): aH0L < 0 — die Stufe ohne Partner zeichnet voll
                    const _keepRaw = _Tl.step(_fadeOut, _dh).max(_Tl.float(1.0).sub(_Tl.step(_Tl.float(0.0), _aH0L)));
                    const _keep = _Tl.mix(_Tl.float(1.0), _keepRaw, _lu.uLodMaskOn);
                    mat.colorNode = _Tl.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keep));
                    mat.userData = mat.userData || {};
                    mat.userData.lodCrossfade = true; // Marker für das Test-Band (kein Verhalten)
                }
            } catch (_e) {
                throw _e && _e.blende === true
                    ? _e
                    : this._blendeBruch("die Blatt-Karte: " + ((_e && _e.message) || _e));
            }
        }
        return mat;
    }

    _buildToonNodeMaterial(opts = {}) {
        // PBR ist die EINE Material-Wahrheit: dieser Aufruf baut IMMER PBR (roughness/metalness aus den
        // Material-Tags); der Name bleibt für die ~14 Aufrufstellen — kein Toon-Zwilling.
        return this._buildPbrNodeMaterial(opts);
    }
}
