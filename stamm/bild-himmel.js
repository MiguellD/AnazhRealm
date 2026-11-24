class AnazhRealm_bild_himmel {
    // ===== ATLAS · Bild/himmel — Tag-Nacht · Atmosphäre · Himmelskörper · Sterne · Saison · Regen =====
    // ### Physik ###
    // Keine Bullet-Welt: die Kollision ist feld-nativ (`_stepCharacter`, `_fieldRaycast`,
    // `_stepCharacterStructures`). Es bleibt der Skalar-Vektor-Pool (Plain-JS mit derselben
    // `.x()/.y()/.z()/.setValue()`-Schnittstelle für `setVec` + Raycast); Velocity in `state.playerVel`.
    initPhysics() {
        this.state.physicsWorld = null;
        this.state.tmpTransform = null;
        this.state.tmpVec1 = this._makeFieldVec();
        this.state.tmpVec2 = this._makeFieldVec();
        this.state.playerVel = this._makeFieldVec();
        this.log("Feld-Physik (Determinismus-Controller) — keine Ammo-Welt, Kollision aus dem Dichtefeld.");
    }

    // Plain-JS-Skalar-Vektor mit der schmalen Schnittstelle, die der Hot-Path nutzt
    // (`setValue` + die `.x()/.y()/.z()`-Akzessoren — der Raycast-Ursprung + der
    // Velocity-Speicher lesen so). KEIN Ammo, kein WASM-Heap.
    _makeFieldVec(x = 0, y = 0, z = 0) {
        return {
            _x: x,
            _y: y,
            _z: z,
            setValue(a, b, c) {
                this._x = a;
                this._y = b;
                this._z = c;
                return this;
            },
            x() {
                return this._x;
            },
            y() {
                return this._y;
            },
            z() {
                return this._z;
            },
        };
    }

    // DER HIMMEL STEHT IM UNENDLICHEN (K16, echte GPU 11.10.): Kuppel (500 m), Sterne (480 m), Sonne und Mond (380 m) folgen
    // der Kamera in endlichem Abstand — mit Tiefentest überschrieb die Kuppel jeden Fern-Ring-Vertex jenseits 500 m (aus 300 m
    // Höhe lag die Welt unter einem „Meer“ aus Horizont-Blau). Der EINE Knoten setzt ihr Clip-z auf w: Tiefe 1,0, sie zeichnen
    // nur, wo die Welt (Mesh, Ring, Feld, Panorama) nichts zeichnete — in jeder Reihenfolge (`gate:himmel-tag` 7 UNENDLICH).
    static _himmelImUnendlichen(mat) {
        if (!AnazhRealm._unendlichKnoten) {
            const T = THREE.TSL;
            const p = T.modelViewProjection;
            AnazhRealm._unendlichKnoten = T.vec4(p.xy, p.w, p.w);
        }
        mat.vertexNode = AnazhRealm._unendlichKnoten;
        return mat;
    }

    // DIE LIVE-UNIFORMS DES HIMMELS (einmal je Welt): die Zeit (Drift der Wolken), die Deckung des Wetters, die Sonne und ihr
    // Farbton — DSL, Tag-Nacht und Loop schreiben hier hinein (`.value`), die Kuppel und der Spiegel des Wassers lesen dieselben
    // (`_himmelSicht`). `himmelTint` ist der TRÄGER der Tönung (kein Knoten der Kuppel): der Himmel des Studios mit Wetter,
    // Feld, Gefühl und DSL-Tönung — die Kuppel liest sein Verhältnis zum blanken Stop (`atmoLut.U.toenung`, D3). Sie reisen in
    // der GETEILTEN renderGroup (`_uniformHeimatTeilen`): der Wasser-Satz trägt die Diät, als Objekt-Uniform fror sein Spiegel
    // die Wolken des ersten Bilds ein (A1-n1: die Wolken-Uhr im Puffer des Wassers 74,8 gegen 228,0 am Knoten).
    _himmelUniformen() {
        const st = this.state;
        if (st.skyboxUniforms) return st.skyboxUniforms;
        const { uniform } = THREE.TSL;
        st.skyboxUniforms = this._uniformHeimatTeilen({
            time: uniform(0.0),
            himmelTint: { value: new THREE.Color(1, 1, 1) },
            cloudCover: uniform(0.3),
            // V17.2 — die Sonnen-Richtung für den Wolken-Glanz: derselbe sunDir, der DirectionalLight und das Gras-Gegenlicht
            // speist (`_dayNightApplyDirectionalLight`); W9 — ihr Farbton, der Durchlass der EINEN Atmosphäre (`_atmoSonne`)
            sunDir: uniform(new THREE.Vector3(0.4, 0.8, 0.3).normalize()),
            sunCol: uniform(new THREE.Color(1, 0.95, 0.85)),
            // licht.K4 — das Auge des Bilds (die Kamera, je Bild neben der Bild-Uhr geschrieben, `_loopRender`): der Ort der
            // Kuppel auf der Schicht (`_wolkenMenge`) — die Kamera eines Passes (Umgebungs-Bake, Spiegel) ist es nie
            auge: uniform(new THREE.Vector3()),
            // licht.K4 — DER ZUG DER LUFT je Sekunde der Bild-Uhr in Einheiten der Schicht (`_wolkenFeld`): der EINE Wind
            // der Fronten (`_dayNightApplySkybox`)
            zug: uniform(new THREE.Vector2()),
            // licht.K4 — die klare Sonne gegen die Sonne des Wetters (1 / lightMul, `_dayNightApplySkybox`): mehr trägt eine Lücke
            // zwischen den Wolken nie (`_wolkenSchatten`)
            sonneKlar: uniform(1),
        });
        // DAS BAND DER GALAXIE (stern-bild): seine Uniforms in derselben geteilten Heimat (`_kosmosBand` schreibt sie)
        st.skyboxUniforms.band = this._uniformHeimatTeilen(__weltLicht.kosmosBandUniformen());
        return st.skyboxUniforms;
    }

    // DER EINE HIMMEL MIT SEINEN WOLKEN ist ein Baustein der Engine (w27-studio-mesh, welt-licht.js `wolkenFeld` · `wolkenMenge` ·
    // `himmelSicht` — dort stehen Gesetz und Geschichte): die Welt reicht ihm ihr HIMMEL_GESETZ und die Uniforms ihres Himmels
    // (`_himmelUniformen`), die Bühne der Studios seine eigenen. Fail-closed: das Gesetz lebt NUR in foundry-core (__terrainCore);
    // unlesbar → Bruch, der schreit. Leser des Felds: die Kuppel (`_wolkenMenge`) und die Karte des Wurfs (`_wolkenKarte`).
    _wolkenFeld(sp) {
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        return __weltLicht.wolkenFeld(HG, this._himmelUniformen(), sp);
    }

    // DIE WOLKE DER KUPPEL in Richtung `dir` (normiert) vom Auge (welt-licht.js `wolkenMenge`).
    _wolkenMenge(dir) {
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        return __weltLicht.wolkenMenge(HG, this._himmelUniformen(), dir);
    }

    // DER KÖRPER AM HIMMEL STEHT HINTER DER WOLKE (stern-station): Stern, Planet, Mond und Sonne liegen im Unendlichen, die Wolke
    // davor — ihr Licht trägt den Durchlass der EINEN Wolke in ihrer Richtung (`_wolkenMenge`, dieselbe Menge, mit der die Kuppel
    // die Wolke über Himmel und Band mischt: × (1 − Menge)). Bis hier addierten Feld und Mond ihr Licht auf die Wolke, die Sonne
    // stand deckend über ihr. Ein Faktor der Deckkraft: der additive Stoff trägt ihn als Licht, der deckende als Mischung.
    _hinterDerWolke(mat) {
        const T = THREE.TSL;
        const dir = T.positionWorld.sub(T.cameraPosition).normalize();
        mat.opacityNode = (mat.opacityNode || T.materialOpacity).mul(T.float(1).sub(this._wolkenMenge(dir)));
        return mat;
    }

    // DIE KARTE DES WURFS (licht.K4, die Cloud-Shadow-Map von Horizon/MSFS): je Texel die Menge der Wolke an EINEM Punkt der
    // Schicht in Welt-Koordinaten (`_wolkenFeld`, Zelle `zelleM`, `karte`² um den Punkt, an dem das Licht über dem Spieler die
    // Schicht quert) als Deckung der Sonne: die Menge, die die Kuppel als Deckkraft der Wolke zeichnet, gewogen mit dem Wetter
    // (`_wolkenGewicht`: klar 0). EIN Schirm-Pass, neu gemalt, wenn die Bild-Uhr `zugS` weiter ist, die Deckung oder die Mitte
    // wechselt (`_wolkenKarteTakt`) — nie je Fragment; die Mip-Kette trägt das Mittel der Karte für jeden Empfänger jenseits ihres
    // Rands und für das Wetter (`_wolkenSchatten`). r8: 0,34 MB mit Mips.
    _wolkenKarte() {
        const st = this.state;
        if (st.wolkenKarte) return st.wolkenKarte;
        const T = THREE.TSL;
        const W = AnazhRealm.WOLKEN_SCHICHT;
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        const n = W.karte;
        const rt = new THREE.RenderTarget(n, n, {
            type: THREE.UnsignedByteType,
            format: THREE.RedFormat,
            depthBuffer: false,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter,
        });
        rt.name = "wolken-karte";
        rt.texture.name = "wolken-karte";
        const U = this._uniformHeimatTeilen({
            ursprung: T.uniform(new THREE.Vector2()),
            schicht: T.uniform(0),
            aktiv: T.uniform(0),
        });
        const cov = this._himmelUniformen().cloudCover;
        const pass = AnazhRealm._schirmDreieck(
            () =>
                T.Fn(() => {
                    const u = U.ursprung.add(T.uv().mul(n).sub(0.5).mul(W.zelleM));
                    const sp = u.mul(1 / ((1 + HG.projY) * W.hoeheM));
                    return T.vec4(this._wolkenFeld(sp).mul(this._wolkenGewicht(cov)), 0, 0, 1);
                })(),
            "wolken-karte"
        );
        st.wolkenKarte = { rt, U, pass, mitte: null, zeit: NaN, deckung: NaN, malZahl: 0, stufen: Math.log2(n) };
        return st.wolkenKarte;
    }

    // DAS GEWICHT DES WETTERS am Wurf (0 klar … 1 Regen) aus der Deckung (`cov`, ein TSL-Knoten): die Achse des Wetters selbst
    // (`WOLKEN_SCHICHT.deckung`, dieselben Zahlen, mit denen `_dayNightApplySkybox` die Deckung schreibt) — bei klarem Himmel
    // wirft keine Wolke, die verstreuten Spitzen der Kuppel bleiben Licht.
    _wolkenGewicht(cov) {
        const [klar, regen] = AnazhRealm.WOLKEN_SCHICHT.deckung;
        return THREE.TSL.clamp(cov.sub(klar).mul(1 / (regen - klar)), 0, 1);
    }

    // DER TAKT DER KARTE (je Bild aus `_weltLichtTakt`, nach der Bild-Uhr): die Mitte ist der Punkt, an dem das Licht über dem
    // Spieler die Schicht quert, auf die Zelle gelegt (dasselbe Gitter der Welt — kein Schwimmen); neu gemalt, wenn die Bild-Uhr
    // `zugS` weiter ist (der Zug 11 m/s: 1,1 m bei 16 m Zelle), die Deckung oder die Mitte wechselt. Der Null-Renderer malt nichts;
    // ohne Wurf des Lichts (`_lichtWirft`: castShadow und die Schatten-Karte des Renderers) ruht der Wurf (1) wie der Horizont
    // (`_horizontKarteTakt`).
    _wolkenKarteTakt() {
        const st = this.state;
        const rend = st.renderer;
        const u = st.skyboxUniforms;
        if (!u || !rend || rend._isHeadlessNull || !st.rendererReady || !st.weltLicht) return;
        const pm = st.playerMesh || st.camera;
        if (!pm) return;
        const K = this._wolkenKarte();
        if (!this._lichtWirft()) {
            K.U.aktiv.value = 0;
            return;
        }
        const W = AnazhRealm.WOLKEN_SCHICHT;
        const L = st.weltLicht.U.l0d.value;
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const schicht = wl + W.hoeheM;
        const s = (schicht - pm.position.y) / Math.max(L.y, W.steilMin);
        const halb = (W.karte / 2) * W.zelleM;
        const mx = Math.round((pm.position.x + L.x * s) / W.zelleM) * W.zelleM - halb;
        const mz = Math.round((pm.position.z + L.z * s) / W.zelleM) * W.zelleM - halb;
        const t = u.time.value;
        const c = u.cloudCover.value;
        const gleich =
            K.mitte && K.mitte[0] === mx && K.mitte[1] === mz && K.deckung === c && Math.abs(t - K.zeit) < W.zugS;
        if (!gleich) {
            K.U.ursprung.value.set(mx, mz);
            if (!this._atmoZeichne(K.pass, K.rt)) return; // die Pipeline im Vorbau: der nächste Takt malt
            K.mitte = [mx, mz];
            K.zeit = t;
            K.deckung = c;
            K.malZahl++;
        }
        K.U.schicht.value = schicht;
        K.U.aktiv.value = 1;
    }

    // DER WURF DER WOLKE am Welt-Punkt `p` (der Faktor der direkten Sonne): der Strahl des Lichts (`_weltLicht` `l0d`, Sonne oder
    // Mond) quert die Schicht (`schicht` = Meeresspiegel + hoeheM) über `p` — dort liest er die Karte, bilinear. Zum Rand der Karte
    // steigt die Stufe in ihre Mip-Kette bis zum Mittel (`rand`); unter `steilMin` klemmt der Strahl, über der Schicht wirft keine
    // Wolke. DAS MITTEL TRÄGT DAS WETTER: wie viel Sonne im Mittel durchkommt, sagt schon das Richtlicht (lightMul der Wetter-Zeile) —
    // die Karte sagt nur, WO: der Durchlass (1 − Deckung) je Mittel der Karte (ihre letzte Mip-Stufe, `mittelMin` als Boden),
    // eine Lücke höchstens die klare Sonne (`sonneKlar`). Bis dahin nahm die Karte das Mittel ein zweites Mal: bewölkt lag die
    // Wiese unter 1,5 % der Sonne. Vor der ersten Karte 1. Leser: jeder Empfänger der Sonne (`_sonnenSicht` → die Kaskade,
    // der Licht-Baustein von Feld und Panorama).
    _wolkenSchatten(p) {
        const T = THREE.TSL;
        const W = AnazhRealm.WOLKEN_SCHICHT;
        const K = this._wolkenKarte();
        const L = this._weltLicht().U.l0d;
        const s = K.U.schicht.sub(p.y).div(T.max(L.y, W.steilMin));
        const q = p.xz.add(L.xz.mul(s)).sub(K.U.ursprung).div(W.zelleM).add(0.5).div(W.karte);
        const r = T.max(T.abs(q.x.sub(0.5)), T.abs(q.y.sub(0.5))).mul(2);
        const menge = T.texture(K.rt.texture, q)
            .level(T.smoothstep(W.rand, 1, r).mul(K.stufen))
            .r.mul(K.U.aktiv);
        const mittel = T.texture(K.rt.texture, T.vec2(0.5)).level(K.stufen).r.mul(K.U.aktiv);
        const durch = T.min(
            T.float(1)
                .sub(menge)
                .div(T.max(T.float(1).sub(mittel), W.mittelMin)),
            this._himmelUniformen().sonneKlar
        );
        return T.mix(durch, T.float(1), T.step(K.U.schicht, p.y));
    }

    // DIE HIMMELS-SICHT in Richtung `vDir` (normiert, ein TSL-Knoten; welt-licht.js `himmelSicht`): die EINE Atmosphäre dieser Welt
    // (`_atmoLutBau`) und ihre Wolken — die Kuppel zeichnet sie, das Wasser und jeder glatte Stoff spiegeln sie (`_spiegelPass`).
    _himmelSicht(vDir) {
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        return __weltLicht.himmelSicht(this._atmoLutBau(), HG, this._himmelUniformen(), vDir);
    }

    // ### Skybox ###
    createGalaxySkybox() {
        // Skybox als MeshBasicNodeMaterial (TSL): die Himmels-Sicht der EINEN Atmosphäre + horizont-genordete Wolken.
        // vDir = normalize(positionLocal) hält den Sample-Punkt in Welt-Richtung, egal wo der Spieler steht.
        // Live-Uniforms in `state.skyboxUniforms` (`.value`-Setter): _dayNightApplySkybox (cloudCover; die Tönung über
        // himmelTint, den Träger des Tints), _loopRender (time aus der Bild-Uhr _bildZeit).
        const TSL = THREE.TSL;
        // Idempotent am Chokepoint: ein zweiter Bau ERSETZT den ersten statt eine zweite Kuppel zu
        // stapeln (kein Doppel-Heap).
        if (this.state.skybox) {
            if (this.state.scene) this.state.scene.remove(this.state.skybox);
            if (this.state.skybox.geometry) this.state.skybox.geometry.dispose();
            if (this.state.skybox.material) this.state.skybox.material.dispose();
            this.state.skybox = null;
        }
        const { normalize, positionLocal } = TSL;
        const finalColor = this._himmelSicht(normalize(positionLocal));

        const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyboxMaterial = new THREE.MeshBasicNodeMaterial();
        skyboxMaterial.colorNode = finalColor;
        skyboxMaterial.side = THREE.BackSide;
        skyboxMaterial.depthWrite = false;
        AnazhRealm._himmelImUnendlichen(skyboxMaterial);

        this._himmelUniformen();

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        skybox.name = "himmel";
        skybox.userData.zeichenSchicht = "himmel"; // nach allem Opaken: nur Himmel-Pixel zahlen (`_zeichenRang`, T3)
        // V10.0-j — Skybox wirft keine Schatten (BackSide-Hülle um die Welt).
        skybox.castShadow = false;
        skybox.receiveShadow = false;
        this.state.scene.add(skybox);
        this.state.skybox = skybox;
        this.log("Galaxy-Skybox erstellt (V10.0-f-1 TSL)");

        // Das Sternfeld (mit den Wandelsternen) ist Fern-Deko: es baut NACH der Bühne (`_tickBootFernDeko`), der
        // Himmel selbst bleibt Boot. Headless baut sofort (die Playtest-Bänder sehen die volle Szene). Alle
        // Konsumenten (_dayNightApplyStarField · Kamera-Pin) sind null-sicher (starField/starFieldUniforms).
        if (this.state.renderer && this.state.renderer._isHeadlessNull) {
            // V8.28 6.G4.b A — echtes Stern-Feld als THREE.Points
            this._buildStarField();
        } else {
            this._fernDekoDeferred = true; // Instanz-Feld (this._x — nicht serialisiert)
        }
        // V8.28 6.G4.b D — Welt-Wasser (Wave-Plane in Senken)
        this._buildWaterPlane();
        // Die Ferne tragen Fern-Ring + Feld-Pass (die Luft dunstet sie, V18.530) — keine eigene Fern-Kulisse
        // (Canopy-Shell) auf dem Boot-Pfad.
    }

    // Deferierter Fern-Deko-Bau: das Sternfeld (mit den Wandelsternen) erscheint EINMAL, sobald die Bühne steht —
    // synchron im Boot stähle er dem Boden-Streaming den Frame. No-op ohne `_fernDekoDeferred`
    // (headless baut sofort in createGalaxySkybox).
    // DAS GESETZ DES ERSTEN BILDS (w27-ankunft-erstbild, ankunft.K5): zeigt der Himmel der Ankunft keinen Stern (`_sterneZeigen`,
    // dieselbe Frage, die das Feld zeichnen lässt), baut es erst nach dem Rundblick (`_nachlauf` durch) — headless kalt hielt sein
    // Bau 64 ms am Stück im Takt unter dem Ladeschirm, mittags für ein Bild ohne einen Stern.
    _tickBootFernDeko() {
        if (!this._fernDekoDeferred) return;
        if (!this._buehneSteht()) return;
        const st = this.state;
        if (this._sterneZeigen === false && (!st._weltbildDa || st._nachlauf != null)) return;
        this._fernDekoDeferred = false;
        try {
            this._buildStarField();
        } catch (err) {
            // Fern-Deko reißt den ewigen Loop nie — laut beim Namen (K22), nie tödlich
            this._stoffBruch("die Fern-Deko (Sterne)", err);
        }
    }

    // DER HIMMEL IST DIE SICHT DER EINEN KOSMOS-FUNKTION (kosmos-umfang, welt-licht.js `kosmos`): die Saat des Planeten
    // (`_planetSamen`, dieselbe, die sein Gelände trägt) und das Jahr seines Ort-Gesetzes → die Heim-Galaxie, der Heim-Stern, sein
    // System. Jeder Punkt des Felds IST ein Stern der Funktion — Richtung vom Heim-Stern in der Ekliptik, Größe aus absoluter
    // Größe, Entfernung und Staub, Ton aus seiner Temperatur —, und die Wandelsterne SIND die Planeten des Heim-Systems auf ihren
    // Bahnen am Tag der Welt (`worldMeta.tag` + Uhr, in Stufen von `HIMMEL.kosmosSchrittTage`), samt dem Lichtwechsel der
    // veränderlichen Sterne. Der Stand lebt EINMAL je Saat (`_kosmosStand`): Feld und Sichtbarkeit lesen ihn; ein neuer Samen (ein
    // Welt-Wechsel) baut das Feld des neuen Himmels. Bis kosmos-umfang würfelte das Feld 2 800 Punkte gleichverteilt auf die
    // Kuppel (Mulberry32 aus worldMeta.seed, Größen aus `sternZaehlung`) und drei feste Wandelsterne (−4,2 · −2,3 · −1,0) — kein
    // Punkt hatte einen Stern, kein Wandelstern eine Bahn, keine Galaxie eine Ebene; nach einem Welt-Wechsel blieb der alte Himmel.
    _kosmosJetzt() {
        const st = this.state,
            wm = st.worldMeta;
        let k = this._kosmosStand;
        if (!k || k.wm !== wm || (wm && (k.seed !== wm.seed || k.gesetz !== wm.gesetz))) {
            const saat = this._planetSamen();
            const jahrTage = this._gelaende().ort.klimaHeute.jahrTage;
            if (!k || k.saat !== saat || k.jahrTage !== jahrTage) {
                const K = __weltLicht.kosmos(saat, { jahrTage });
                k = this._kosmosStand = { saat, jahrTage, K, H: __weltLicht.kosmosHimmel(K), t: NaN, zeit: null };
            }
            k.wm = wm;
            k.seed = wm ? wm.seed : undefined;
            k.gesetz = wm ? wm.gesetz : undefined;
        }
        const t = (wm ? wm.tag || 0 : 0) + (typeof st.timeOfDay === "number" ? st.timeOfDay : 0.5);
        const schritt = AnazhRealm.HIMMEL.kosmosSchrittTage;
        const ts = Math.floor(t / schritt) * schritt;
        if (ts !== k.t) {
            k.t = ts;
            k.zeit = __weltLicht.kosmosZeit(k.K, ts);
        }
        return k;
    }

    // Sterne als diskrete Billboards statt Shader-Noise: Noise hat keinen Pixel-Footprint und aliast bei
    // Kamera-Rotation (Blinken); diskrete Quads rastert die GPU mit echtem Anti-Aliasing. Die Punkte und ihre Folge: die Sterne
    // des Himmels (`kosmosHimmel`, nach Index), danach die Planeten des Heim-Systems. Sidereal-Rotation mit timeOfDay um eine
    // geneigte Achse, Position folgt der Kamera; AdditiveBlending.
    // DIE SICHTBARKEIT IST PHYSIK (V18.530): jeder Punkt trägt seine scheinbare Helligkeit als Größenklasse
    // (`userData.mags`, ihr Licht die Instanz-Farbe), die Dämmerung setzt die Grenzgröße (der Kanal `grenze` der EINEN
    // Tag-Achse, `_tagAchse`) — am Tag sieht man nur, was heller als die Grenze des Tages steht, in der Dämmerung erscheinen die hellen Planeten, dann die hellen Sterne, in
    // tiefer Nacht alle. Die Planeten sind PUNKTE des Felds — keine Kugeln.
    // Befund 04.10. (Blick-Tour 7-birke): drei Math.random-Kugeln (10–30 m auf 400 m = 3–8° — 6–16 Monde
    // breit, Zufallsfarbe, unbeleuchtet) standen am Mittagshimmel; die pinke war die sichtbare.
    _buildStarField() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        // ein Neubau (ein neuer Himmel nach dem Welt-Wechsel) ERSETZT das Feld: das alte verlässt Szene und GPU
        const alt = this.state.starField;
        if (alt) {
            if (alt.parent) alt.parent.remove(alt);
            this._instanzAbschied(alt);
            alt.geometry.dispose();
            alt.material.dispose();
            this.state.starField = null;
            this.state.starFieldUniforms = null;
        }
        const k = this._kosmosJetzt();
        const H = k.H,
            Z = k.zeit;
        const NP = Z.planeten.length;
        const STAR_COUNT = H.n + NP;
        const RADIUS = 480; // knapp innerhalb der Skybox-Sphere (500)
        const positions = new Float32Array(STAR_COUNT * 3);
        const mags = new Float32Array(STAR_COUNT);
        for (let i = 0; i < H.n; i++) {
            for (let c = 0; c < 3; c++) positions[i * 3 + c] = RADIUS * H.richtung[i * 3 + c];
            mags[i] = H.mag[i];
        }
        // die Veränderlichen am Tag des Felds, die Planeten auf ihren Bahnen
        H.wechsel.forEach(([n], q) => (mags[n] = Z.wechselMag[q]));
        Z.planeten.forEach((p, q) => {
            const i = H.n + q;
            for (let c = 0; c < 3; c++) positions[i * 3 + c] = RADIUS * p.richtung[c];
            mags[i] = p.mag;
        });
        // Jeder Stern ist ein 4-Vertex-Quad in einer InstancedMesh: die Quad-uv ist per TSL `attribute("uv", "vec2")` WGSL-konform
        // lesbar → die Streu-Scheibe um die Mitte. Quad-Normal zeigt zum Sphären-Zentrum (die Kamera — starField.position folgt ihr).
        const TSL = THREE.TSL;
        const { uniform, attribute, vec2, vec4, float, length } = TSL;

        const uOpacity = uniform(0.5);
        // DAS PIXEL AUF DER KUGEL (licht-eine-skala, S13): die Kante eines Pixels des Szenen-Ziels in Welt-Einheiten auf der
        // Stern-Kugel (`_dayNightApplyStarField` schreibt sie aus Blickfeld und Höhe des Ziels).
        const uPixel = uniform(1);
        // DAS AUGE (stern-sicht): die Verstärkung Auge → Schirm aus der Grenzgröße der EINEN Tag-Achse (`_sternAuge`, EIN Schreiber
        // `_dayNightApplyStarField`) — die Schwelle des angepassten Auges für einen Punkt am Himmel daneben
        const uAuge = uniform(0);

        const planeGeo = new THREE.PlaneGeometry(1, 1);
        // DER HALBMESSER JE PUNKT in Grad (`aKante`, `_sternPunkt` schreibt ihn mit seinem Licht): so weit, wie sein Bild reicht
        const aKante = new THREE.InstancedBufferAttribute(new Float32Array(STAR_COUNT), 1);
        planeGeo.setAttribute("aKante", aKante);
        const SB = AnazhRealm.HIMMEL.sternBild;
        const GRAD = 180 / Math.PI;
        // die Fehlerfunktion im Knoten (Abramowitz–Stegun 7.1.26, die Tafel `AnazhRealm.ERF_AS`)
        const [ep, e1, e2, e3, e4, e5] = AnazhRealm.ERF_AS;
        const erf = TSL.Fn(([x]) => {
            const ax = TSL.abs(x);
            const t = float(1).div(ax.mul(ep).add(1));
            const poly = t.mul(e5).add(e4).mul(t).add(e3).mul(t).add(e2).mul(t).add(e1).mul(t);
            return TSL.sign(x).mul(float(1).sub(poly.mul(TSL.exp(ax.mul(ax).negate()))));
        });
        // die Scheibe in Welt-Einheiten auf der Kugel: der Halbmesser des Punkts, mindestens `minPx` Pixel
        const halb = TSL.max(attribute("aKante", "float").mul(RADIUS / GRAD), uPixel.mul(SB.minPx));

        const starMat = new THREE.MeshBasicNodeMaterial();
        // die Vorlage des Quads wächst VOR der Instanz-Matrix (Lehre 22): die Instanz trägt Ort und Blick, der Stoff die Kante
        starMat.positionNode = TSL.positionLocal.mul(halb.mul(2));
        // DAS BILD EINES PUNKTS IST DIE STREU-FUNKTION DES AUGES (stern-bild; Spencer, Shirley, Zimmerman, Greenberg 1995,
        // „Physically-Based Glare Effects for Digital Images“): ein Kern (e^(−(θ/0,02°)²), über die Fläche des Pixels integriert) und
        // zwei Säume des Streulichts im Auge, (θ + a)^(−3) und (θ + a)^(−2) — ihre Anteile am Licht bis 10° (`HIMMEL.sternBild`
        // kern · nah · fern) wie im Gesetz des Papiers, jeder Saum auf der Scheibe des Punkts auf 1 normiert (geschlossen), a um
        // das halbe Pixel weicher. Die Scheibe trägt GENAU das Licht der Größenklasse (Fläche × Leuchtdichte = Lichtstrom): der
        // schwache Punkt ist ein Kern im Pixel, dessen Deckung mit dem Strom fällt; der helle trägt seinen Saum weit über die
        // Grenze des Sichtbaren — er steht als größere, weich glühende Scheibe, wie das Auge Sirius sieht. Bis stern-bild trug
        // jeder Punkt dieselbe Fläche (smoothstep 0,5 → 0,08 auf 2 Pixeln Kante, `sternPixel`) — die Tonkurve sättigte jeden
        // hellen Kern zum selben Punkt: Helligkeits-Spanne im Bild 1,2–1,4 Größenklassen.
        const uv = attribute("uv", "vec2");
        const dw = length(uv.sub(vec2(float(0.5), float(0.5)))).mul(halb.mul(2)); // Abstand zur Mitte auf der Kugel
        const gp = uPixel.mul(GRAD / RADIUS); // Grad je Pixel
        const th = dw.mul(GRAD / RADIUS);
        const thR = halb.mul(GRAD / RADIUS);
        const a = gp.mul(0.5).add(SB.a);
        // DER KERN ÜBER DIE FLÄCHE DES PIXELS (stern-uhr): der optische Kern allein (σ_o = (0,02°/√2) ÷ Grad je Pixel, unten
        // `sigmaMin`), exakt über das Pixel integriert — je Achse ½·[erf((d + ½)/(√2 σ_o)) − erf((d − ½)/(√2 σ_o))], d der Abstand
        // Pixelmitte ↔ Punkt in Pixeln (die uv des Quads über ihre Ableitungen in den Schirm gerechnet). Die Summe über die Pixel
        // ist 1 in JEDER Lage (Energie). Bis stern-uhr ein Gauß mit σ² = σ_o² + 1/12, an der Mitte abgetastet: die Spitze hing an
        // der Lage unter dem Raster (Ecke 5 % der Mitte) — der Planet m −5,36 sprang an Nachbar-Uhren zwischen 4,4 und 25,7 Luma
        // über dem Himmel (Station sternhimmel#1, wiese:third, Radeon) und fiel an einer Uhr aus dem Bild.
        const sigma = TSL.max(float(SB.a / Math.SQRT2).div(gp), SB.sigmaMin);
        const du = TSL.dFdx(uv);
        const dv = TSL.dFdy(uv);
        const ou = uv.sub(vec2(float(0.5), float(0.5)));
        const det = du.x.mul(dv.y).sub(dv.x.mul(du.y));
        const sx = dv.y.mul(ou.x).sub(dv.x.mul(ou.y)).div(det);
        const sy = du.x.mul(ou.y).sub(du.y.mul(ou.x)).div(det);
        const k2 = float(1).div(sigma.mul(Math.SQRT2));
        const achse = (d) =>
            erf(d.add(0.5).mul(k2))
                .sub(erf(d.sub(0.5).mul(k2)))
                .mul(0.5);
        const kern = achse(sx).mul(achse(sy)); // der Anteil des Kerns in DIESEM Pixel
        // ∫ 2πθ (θ + a)^(−3) dθ und ∫ 2πθ (θ + a)^(−2) dθ von 0 bis θR
        const aR = thR.add(a);
        const I3 = float(1)
            .div(a.mul(2))
            .sub(float(1).div(aR))
            .add(a.div(aR.mul(aR).mul(2)))
            .mul(2 * Math.PI);
        const I2 = TSL.log(aR.div(a))
            .add(a.div(aR))
            .sub(1)
            .mul(2 * Math.PI);
        const ta = th.add(a);
        const saum = float(SB.nah)
            .div(ta.mul(ta).mul(ta).mul(I3))
            .add(float(SB.fern).div(ta.mul(ta).mul(I2)))
            .mul(gp.mul(gp));
        const psf = kern.mul(SB.kern).add(saum); // je Pixel², auf der Scheibe Σ = 1
        // DAS LICHT JE PUNKT trägt die Instanz-Farbe (`setColorAt`): r184 multipliziert sie selbst in die Farbe des Stoffs
        // (NodeMaterial.setupDiffuseColor, `vInstanceColor`) — EINMAL. Bis licht-eine-skala las der Knoten sie zusätzlich als
        // Attribut: die Farbe stand im Quadrat (bei Tönen um 1 unsichtbar; mit dem Licht in der EINEN Skala, 10⁻¹⁰ je Punkt,
        // trug das Quadrat 10⁻²⁰ — kein Stern im Bild, auch mit tausendfachem Licht und einem roten Stoff nicht).
        // DAS GLIED AUGE → SCHIRM (stern-sicht): EIN PUNKT IST KEIN STÜCK FLÄCHE. Sein Licht bleibt lx in der EINEN Skala (die
        // Instanz-Farbe), doch das Auge löst ihn bis auf seine Streu-Scheibe (Bogenminuten), das Pixel des Schirms ist 6- bis
        // 18-mal so breit: als Leuchtdichte über den Raumwinkel des Pixels verteilt (bis hier: lx × PSF ÷ Pixel²/R²) stand ein
        // Stern der Klasse 4 an genesis bei 1080 Zeilen unter dem Fuß der Tonkurve, bei 360 Zeilen jeder schwächer als 3 —
        // die Station sah in klarer Nacht 1–4 Sterne statt 62–78. Darum steht der Punkt im Bild genau dann, wenn das angepasste
        // Auge ihn sähe: das Licht seines Kerns E × SB.kern an der Grenzgröße G der Tag-Achse (E_G = sternLx0 · 10^(−0,4·G)),
        // summiert über die Pixel (stern-uhr: das Gesamtlicht, in jeder Lage unter dem Raster gleich), steht auf
        // der Schwelle des SCHIRMS (`sternBild.schwelle`, im belichteten Raum: L × k), darüber wächst sein Bild mit E ÷ E_G — die
        // Streu-Scheibe trägt die Spanne (der helle Punkt breiter und glühend). Unabhängig von Auflösung und Belichtung (k
        // kürzt sich mit der Vor-Belichtung); unter G blendet der Punkt in einer halben Klasse aus (die Schwelle des Auges:
        // ein Punkt ½ Klasse unter der Grenzgröße ist nie gesehen). `uAuge` = Schwelle ÷ (E_G × SB.kern) im belichteten
        // Raum; hier ÷ k (die Belichtung DIESES Bilds, derselbe Knoten wie die Vor-Belichtung): das Licht des Kerns steht bei
        // E × uAuge × SB.kern, für jede Belichtung im selben Bild. Kein Ausgleich der Lage: das Spitzen-Pixel ist nicht das Licht
        // des Sterns (stern-uhr, Radeon: die Eichung auf die Ecke hob jede Spitze 3–4×, Dämmerung 2 → 5 Punkte).
        // E ÷ E_G des Punkts, nur der Faktor des Ausblendens (die Farbe selbst multipliziert r184 EINMAL hinein): E liest der
        // Halbmesser seiner Scheibe (`_sternKante`: (aKante ÷ θ0)² = 10^(0,4·(feldGrenze − m)), E = sternLx0 ÷ EINHEIT_LX ·
        // 10^(−0,4·feldGrenze) · (aKante ÷ θ0)²) — ein Instanz-Attribut, das Zeichner und Arena tragen. Die Instanz-Farbe liegt dort
        // unter `instanzFarbe`, nie als Attribut `instanceColor`: so gelesen stand E auf 0, und jeder Punkt blendete aus.
        const kq = attribute("aKante", "float").div(SB.theta0);
        const eFeld =
            (__weltLicht.KOSMOS.sternLx0 * 10 ** (-0.4 * __weltLicht.KOSMOS.feldGrenze)) / __weltLicht.EINHEIT_LX;
        const ueber = kq.mul(kq).mul(eFeld).mul(uAuge).mul(SB.kern).div(SB.schwelle);
        const gesehen = TSL.smoothstep(float(10 ** -0.2), float(1), ueber);
        // DIE SCHWELLE VOR DEM HIMMEL (stern-station): `schwelle` trägt über schwarzem Himmel 20 von 255 auf den Schirm; vor dem
        // Himmel des Tags trägt derselbe belichtete Schritt durch die Tonkurve und die Ausgabe (sRGB) weniger (vor Luma 180 etwa 8)
        // — der Punkt heller als G stand unter der Schwelle des Schirms: der Planet m −5,36 am Taghimmel (G −5) fehlte an 14 von
        // 19 freien Uhren (Station sternhimmel#1, Radeon, vier Kurven). `vorHimmel` hebt den Schritt, bis er vor DEM Himmel in
        // seiner Richtung (die EINE Atmosphäre, `himmelFarbe`, belichtet) auf dem Schirm so weit trägt wie über schwarz: zwei
        // Sekanten-Schritte an der EINEN Tonkurve (`tonKurve`) und der Ausgabe; über schwarzem Himmel genau 1.
        const ton = __weltLicht.tonKurve(THREE);
        const schirm = (x) => TSL.sRGBTransferOETF(ton(TSL.vec3(x), float(1))).x;
        const blick = TSL.positionWorld.sub(TSL.cameraPosition).normalize();
        const grund = TSL.dot(this._atmoLutBau().himmelFarbe(blick), TSL.vec3(0.2126, 0.7152, 0.0722))
            .mul(TSL.toneMappingExposure)
            .toVar();
        const stufe = float(SB.schwelle);
        const ueberSchwarz = schirm(stufe).toVar();
        const amGrund = schirm(grund).toVar();
        const f1 = ueberSchwarz
            .div(TSL.max(schirm(grund.add(stufe)).sub(amGrund), 1e-6))
            .clamp(1, 64)
            .toVar();
        const vorHimmel = f1
            .mul(ueberSchwarz.div(TSL.max(schirm(grund.add(stufe.mul(f1))).sub(amGrund), 1e-6)))
            .clamp(1, 64);
        starMat.colorNode = vec4(
            TSL.vec3(psf.mul(uAuge).mul(vorHimmel).div(TSL.toneMappingExposure).mul(gesehen)),
            TSL.step(dw, halb).mul(uOpacity)
        );

        // Material-Properties: identisch zur V10.0-f-2-PointsMaterial-Variante.
        starMat.transparent = true;
        starMat.depthWrite = false;
        starMat.depthTest = true;
        starMat.blending = THREE.AdditiveBlending;
        starMat.alphaTest = 0.01;
        // DER STERN STEHT HINTER DER LUFT, NIE IN IHR (licht-eine-skala, S13): wie Sonne und Mond trägt er die Luft der Stoffe
        // nicht (`scene.fogNode` mischt auf 480 m die Farbe der Luft ins Quad und addierte sie mit ihm auf den Himmel)
        starMat.fog = false;
        // DoubleSide: Quad-Normale zeigt zum Sphere-Center; falls die Mesh-
        // Rotation in _loopRender (V8.28 sidereal) sie kippt, bleibt das
        // Quad sichtbar.
        starMat.side = THREE.DoubleSide;
        // EIN Befehl (Welle 6): ein durchscheinender DoubleSide-Stoff zeichnet in r184 zwei Durchgänge (Rück-, dann
        // Vorderseite) — jedes Quad zeigt der Kamera genau eine Seite, die additive Mischung vertauscht: ein Durchgang
        // ist dasselbe Bild.
        starMat.forceSinglePass = true;
        AnazhRealm._himmelImUnendlichen(this._hinterDerWolke(starMat));

        // Der hellste Punkt des Himmels am Tag des Felds (`kosmosZeit(…).hellste`): liegt die Grenzgröße mehr als ½ Klasse darüber,
        // ist kein Punkt sichtbar und das Feld zeichnet nicht (_dayNightApplyStarField).
        this.state.starFieldUniforms = {
            opacity: uOpacity,
            pixel: uPixel,
            auge: uAuge,
            // die Grenzgröße, aus der `auge` steht (der Kanal `grenze` der Tag-Achse; Lesewert der Linsen)
            grenze: { value: -10 },
            radius: RADIUS,
        };

        const starField = AnazhRealm._instanzMesh(planeGeo, starMat, STAR_COUNT);
        starField.name = "himmel-sterne";
        // Per-Instance-Matrix (`_sternMatrix`): Translation auf die Sphäre + Rotation (Normal zum Zentrum), Kante 1 (die Kante
        // trägt der Stoff, `uPixel` × `aKante`). Die Sterne einmal beim Build, die Planeten je Stufe des Tags; die siderale Rotation
        // läuft über starField.rotation.
        starField.userData.kante = aKante;
        for (let i = 0; i < STAR_COUNT; i++) {
            AnazhRealm._sternMatrix(starField, i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            this._sternPunkt(starField, i, i < H.n ? H.kelvin[i] : Z.planeten[i - H.n].ton, mags[i]);
        }
        // der Stand, den das Feld zeigt: die Saat seines Himmels und die Stufe des Tags (`_kosmosFeldZeit` folgt ihr)
        starField.userData.kosmos = k;
        starField.userData.t = k.t;
        starField.userData.radius = RADIUS;
        starField.instanceMatrix.needsUpdate = true;
        if (starField.instanceColor) starField.instanceColor.needsUpdate = true;
        aKante.needsUpdate = true;
        starField.userData.mags = mags; // die Größenklasse je Punkt (Linsen zählen an ihr, was im Bild steht)
        starField.frustumCulled = false;
        // Sterne werfen und empfangen keine Schatten (unendlich ferne Billboards).
        starField.castShadow = false;
        starField.receiveShadow = false;
        this.state.scene.add(starField);
        this.state.starField = starField;
        this.log(
            `Stern-Feld erstellt — ${H.n} Sterne der Kosmos-Funktion (Saat ${k.saat}) + ${NP} Planeten, InstancedMesh-Billboards`
        );
    }

    // DER PUNKT i DES FELDS, der EINE Schreiber seines Bilds (licht-eine-skala, stern-bild): sein Licht am Auge in der EINEN Skala —
    // die Farbe des Sterns ist die seiner Temperatur (`kelvin`, der Planck-Ort über `_lichtLinear`, Luma 1), die des Planeten sein
    // Ton (rgb, das Licht der Sonne von seiner Fläche) — × die Beleuchtungsstärke seiner Größenklasse `KOSMOS.sternLx0` · 10^(−0,4·m)
    // (die Instanz-Farbe), und der Halbmesser seiner Streu-Scheibe (`aKante`, `_sternKante`).
    _sternPunkt(sf, i, ton, m) {
        const c = this._sternPunktFarbe || (this._sternPunktFarbe = new THREE.Color());
        const L = typeof ton === "number" ? { kelvin: ton } : { farbe: c.setRGB(ton[0], ton[1], ton[2]) };
        const lum = (__weltLicht.KOSMOS.sternLx0 * 10 ** (-0.4 * m)) / __weltLicht.EINHEIT_LX;
        sf.setColorAt(i, this._lichtLinear(L, c).multiplyScalar(lum));
        sf.userData.kante.array[i] = AnazhRealm._sternKante(m);
    }

    // DAS BAND DES KOSMOS k in den Uniforms des Himmels (stern-bild, welt-licht.js `kosmosBand`): je Klasse ihr Licht je pc
    // Sehstrahl in der Farbe ihrer Temperatur (`_lichtLinear`, Luma 1) ÷ EINHEIT_LX, ihre Höhe und ihre Weite s0; einmal je Saat,
    // mit dem Feld (seine Drehung trägt die Lage des Bands, `_sternDrehung`)
    _kosmosBand(k) {
        const U = this.state.skyboxUniforms && this.state.skyboxUniforms.band;
        if (!U || U.kosmos === k || !this.state.starField) return;
        U.kosmos = k;
        const B = __weltLicht.kosmosBand(k.K);
        U.galaxie.value.set(1 / B.hR, B.R0, B.kappa, B.hd);
        U.aussen.value.set(B.aussen[0], B.aussen[1]);
        const c = new THREE.Color();
        B.klassen.forEach((kl, i) => {
            this._lichtLinear({ kelvin: kl.kelvin }, c).multiplyScalar(kl.a / __weltLicht.EINHEIT_LX);
            U.farbe[i].value.set(c.r, c.g, c.b);
            U.form[i].value.set(1 / kl.hz, kl.s0);
        });
    }

    // DIE SIDERALE DREHUNG DES FELDS um die geneigte Achse mit der Tageszeit — und mit ihr DIE LAGE DES BANDS: Welt → Galaxie =
    // Eᵀ · Rᵀ (R die Drehung, E die Zeilen galaktisch → Feld, `kosmosSystem(…).ebene`), dieselbe Lage wie jeder Punkt. Der EINE
    // Schreiber beider: je Bild (`_loopRender`) und mit jedem Stand des Tags (`_dayNightApplyStarField`) — bis stern-bild drehte
    // nur das Bild, ein neu gebautes Feld stand bis zum nächsten Bild ungedreht neben seinem Band
    _sternDrehung() {
        const sf = this.state.starField;
        if (!sf) return;
        sf.rotation.set(0.4, (this.state.timeOfDay || 0) * Math.PI * 2, 0.15);
        const U = this.state.skyboxUniforms && this.state.skyboxUniforms.band;
        if (!U || !U.kosmos) return;
        const E = U.kosmos.K.heim.system.ebene;
        const R = (this._bandDrehung || (this._bandDrehung = new THREE.Matrix3())).setFromMatrix4(
            (this._bandM4 || (this._bandM4 = new THREE.Matrix4())).makeRotationFromEuler(sf.rotation)
        );
        // M = Eᵀ · Rᵀ = (R · E)ᵀ
        const RE = U.lage.value.set(E[0], E[1], E[2], E[3], E[4], E[5], E[6], E[7], E[8]).premultiply(R);
        RE.transpose();
    }

    // DER TAG DES FELDS: die Stufe des Tags hat sich bewegt (`_kosmosJetzt`) — die Veränderlichen tragen ihre Größe am neuen Tag,
    // die Planeten ihren Ort und ihre Größe auf der Bahn. Die Sterne stehen (nur ihr Licht wechselt); hochgeladen werden die
    // Instanz-Farben (das Licht je Punkt) und die Matrizen der Planeten allein.
    _kosmosFeldZeit(sf, k) {
        const H = k.H,
            Z = k.zeit,
            R = sf.userData.radius,
            mags = sf.userData.mags;
        H.wechsel.forEach(([n], q) => {
            mags[n] = Z.wechselMag[q];
            this._sternPunkt(sf, n, H.kelvin[n], mags[n]);
        });
        Z.planeten.forEach((p, q) => {
            const i = H.n + q;
            mags[i] = p.mag;
            this._sternPunkt(sf, i, p.ton, p.mag);
            AnazhRealm._sternMatrix(sf, i, R * p.richtung[0], R * p.richtung[1], R * p.richtung[2]);
        });
        if (sf.instanceColor) sf.instanceColor.needsUpdate = true;
        sf.userData.kante.needsUpdate = true;
        if (Z.planeten.length) {
            sf.instanceMatrix.clearUpdateRanges();
            sf.instanceMatrix.addUpdateRange(H.n * 16, Z.planeten.length * 16);
            sf.instanceMatrix.needsUpdate = true;
        }
        sf.userData.t = k.t;
    }

    // Setzt nur den Meeresspiegel state.waterLevel — DER EINE Schreiber: beim Bau der Szene und nach dem Laden JEDER Welt
    // (`_weltAnkunft`; Reise: bis hier reiste der Spiegel der Boot-Welt als Glied der Seite in jede Welt, die nach ihr kam). Das
    // sichtbare Wasser baut jeder Voxel-Chunk selbst (Iso-Surface aus den Wasser-Cells, s. unten).
    _buildWaterPlane() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        // Der Meeresspiegel ist ABSOLUT (`terrainBaseHeight − GRUND.meerUnterBasis` des Kerns): bis zur Welle L lief davor eine 13×13-Stichprobe
        // `_voxelSurfaceY` (169 Dichte-Säulen beim Boot), die nur sortiert und dann verworfen wurde (W-kD11).
        // das Meer des Orts (Reise): `meerUnterBasisM` der Tafel `ortGesetz` — die Heimat `GRUND.meerUnterBasis`, am Ziel minus Δ
        this.state.waterLevel = (this.state.terrainBaseHeight || 0) - this._gelaende().ort.meerUnterBasisM;
        // Das Wasser ist ein Cell-Zustand im Voxel-Feld; jeder Voxel-Chunk baut sein Iso-Surface-Mesh aus
        // den Cells (`_buildVoxelChunkWaterIsoSurface`) — EIN Wasser-Mesh, eine Geometrie-Quelle.
        this.log(`Welt-Wasser — Meeresspiegel y=${this.state.waterLevel.toFixed(1)} (Iso-Cells, V9.75)`);
    }

    // ═══ CANOPY CHUNK-STREAMING ═══
    // Je 512-m-Region ein Mini-Canopy-Mesh im 3×3-Ring um den Spieler (~1.5 km²), ferne Regionen
    // disponiert. Hinter dem Flag `atmosphere.canopyStreaming` (Default false).

    _canopyChunkConfig() {
        return {
            regionM: 512, // Welt-Meter pro Canopy-Chunk-Kante
            gridSize: 48, // 48 Vertices pro Seite → ~11 m/Vertex
            ringRadius: 1, // 3×3-Ring (1 = ±1 in beide Achsen)
            disposeRadius: 3, // ferne Chunks ab Distanz > 3 disposen
        };
    }

    _canopyChunkKey(regX, regZ) {
        return `${regX | 0},${regZ | 0}`;
    }

    _ensureCanopyChunkMap() {
        if (!this.state.canopyChunks || !(this.state.canopyChunks instanceof Map)) {
            this.state.canopyChunks = new Map();
        }
        return this.state.canopyChunks;
    }

    // Eine Canopy-Region bauen (lebendig × clump → coverage → lift, begrenzt auf die Region-AABB).
    // Idempotent: liefert das gecachte Mesh; dirty=true → Rebuild (Welt-Wechsel/Feld-Edit).
    _canopyEnsureChunk(regX, regZ) {
        if (typeof THREE === "undefined" || !this.state.scene) return null;
        const map = this._ensureCanopyChunkMap();
        const key = this._canopyChunkKey(regX, regZ);
        const existing = map.get(key);
        if (existing && !existing.userData._dirty) return existing;
        // Eventuelle alte Disposition (rebuild-Pfad)
        if (existing) this._canopyDisposeChunkByKey(key);
        const C = this._canopyChunkConfig();
        const SIZE = C.gridSize;
        const REGION = C.regionM;
        const N = SIZE - 1;
        const geom = new THREE.PlaneGeometry(REGION, REGION, N, N);
        geom.rotateX(-Math.PI / 2);
        const positions = geom.attributes.position;
        const colors = new Float32Array(positions.count * 3);
        const cx = (regX + 0.5) * REGION;
        const cz = (regZ + 0.5) * REGION;
        let liveCount = 0;
        for (let i = 0; i < positions.count; i++) {
            // Plane-Vertex-Koords sind region-relativ; in Welt-Koords schieben.
            const localX = positions.getX(i);
            const localZ = positions.getZ(i);
            const wx = cx + localX;
            const wz = cz + localZ;
            const terrainY = typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(wx, wz) : 0;
            let coverage = 0;
            if (typeof this.worldFieldAt === "function") {
                const f = this.worldFieldAt(wx, wz);
                coverage = f ? Math.max(0, Math.min(1, f.lebendig)) : 0;
                if (typeof this._clumpAt === "function") {
                    const clump = Math.max(0, Math.min(1, 0.5 + 0.5 * this._clumpAt(wx, wz, 0.006)));
                    coverage = coverage * (0.4 + 0.6 * clump);
                }
            }
            const lift = coverage > 0.18 ? coverage * 7 + 11 : 0;
            const bump = this._baumGrammatik().noise2D(wx * 0.05, wz * 0.05) * 0.8;
            positions.setY(i, terrainY + lift + bump);
            // Vertex-Position auf Welt-Koord setzen (so kann der Mesh am
            // Welt-Ursprung sitzen, ohne dass eine pro-Chunk-Position-Set
            // den Frustum-Cull bricht).
            positions.setX(i, wx);
            positions.setZ(i, wz);
            colors[i * 3 + 0] = 0.16 + coverage * 0.08;
            colors[i * 3 + 1] = 0.32 + coverage * 0.18;
            colors[i * 3 + 2] = 0.13 + coverage * 0.08;
            if (coverage > 0.22) liveCount++;
        }
        positions.needsUpdate = true;
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geom.computeVertexNormals();
        // Material: das bestehende _buildToonNodeMaterial, kein Distance-Dither
        // pro Chunk (der Streaming-Ring übernimmt die Distanz-Klemme implizit).
        const mat = this._buildToonNodeMaterial({
            color: 0xffffff,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.frustumCulled = true;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.renderOrder = 2;
        mesh.name = "kronendach";
        mesh.userData.kind = "canopyChunk";
        mesh.userData.regX = regX;
        mesh.userData.regZ = regZ;
        mesh.userData.liveCoverageVertices = liveCount;
        mesh.userData._dirty = false;
        this.state.scene.add(mesh);
        map.set(key, mesh);
        return mesh;
    }

    _canopyDisposeChunkByKey(key) {
        const map = this.state.canopyChunks;
        if (!map) return false;
        const mesh = map.get(key);
        if (!mesh) return false;
        if (this.state.scene) this.state.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material && typeof mesh.material.dispose === "function") mesh.material.dispose();
        map.delete(key);
        return true;
    }

    _canopyDisposeAllChunks() {
        if (!this.state.canopyChunks) return;
        for (const key of Array.from(this.state.canopyChunks.keys())) {
            this._canopyDisposeChunkByKey(key);
        }
    }

    // V18.222 — der Streaming-Tick. Walkt das 3×3-Fenster um den Spieler,
    // baut fehlende, disponiert ferne. Bounded: höchstens 1 Build pro Frame
    // (Plan-konform „max 1 Region/Frame" wie der Voxel-Tick).
    _tickCanopyStreaming() {
        const atmo = this.state.atmosphere;
        if (!atmo || atmo.canopyStreaming !== true) return 0;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return 0;
        const C = this._canopyChunkConfig();
        const playerRegX = Math.floor(pm.x / C.regionM);
        const playerRegZ = Math.floor(pm.z / C.regionM);
        const map = this._ensureCanopyChunkMap();
        let built = 0;
        // 3×3 (oder N×N) Ring um den Spieler: fehlende bauen.
        for (let dx = -C.ringRadius; dx <= C.ringRadius && built < 1; dx++) {
            for (let dz = -C.ringRadius; dz <= C.ringRadius && built < 1; dz++) {
                const key = this._canopyChunkKey(playerRegX + dx, playerRegZ + dz);
                if (!map.has(key)) {
                    this._canopyEnsureChunk(playerRegX + dx, playerRegZ + dz);
                    built++;
                }
            }
        }
        // Ferne Chunks disposen (außerhalb disposeRadius)
        let disposed = 0;
        const disposeR = C.disposeRadius;
        for (const key of Array.from(map.keys())) {
            const mesh = map.get(key);
            if (!mesh || !mesh.userData) continue;
            const dx = mesh.userData.regX - playerRegX;
            const dz = mesh.userData.regZ - playerRegZ;
            if (Math.abs(dx) > disposeR || Math.abs(dz) > disposeR) {
                this._canopyDisposeChunkByKey(key);
                disposed++;
            }
        }
        return built + disposed;
    }

    // ═══ DIE SKY-ENV-MAP ═══
    // Ohne `scene.environment` rendern PBR-Metalle SCHWARZ (sie holen ihre Farbe aus der Reflexion). DIE UMGEBUNG IST DER
    // HIMMEL DER EINEN ATMOSPHÄRE (D3): der Wandel-Pass legt die Himmels-Sicht (Azimut absolut, mit Boden) als Equirekt
    // 128×64 ab, PMREM filtert sie — azimut-abhängig (zur Sonne heller als von ihr weg), in derselben E0 wie das Richtlicht.
    // Bis D3 malte die CPU einen azimut-konstanten Verlauf aus Tint-Farben (128×64 sRGB): Licht-Verhältnis 4,2 statt 5,1.
    // Sie trägt den Himmel JE EINHEIT DES LICHTS (`passUmgebung`): E0 und Tönung nehmen ihre Leser je Bild (`_umgebungLicht`),
    // sie zeichnen sie nie neu. Grober Takt: neu nur, wenn die Sonne sich um mehr als ein halbes Grad drehte, Mond, Medium oder
    // Höhe des Auges sich änderten, höchstens je `SKY_ENV_REGEN_MIN_MS` der WELT-UHR (`spielZeit`; der Sprung der Uhr geht an
    // der Drossel vorbei); die Bestrahlung liest die CPU zurück (`_himmelUmgebungLesen` → `_himmelsIrradianz`).
    _ensureSkyEnvironment(force, sprung) {
        const st = this.state;
        if (typeof THREE === "undefined" || !st.scene || !st.renderer) return false;
        if (!st.rendererReady) return false; // das Env-Sampling braucht den initialisierten Renderer
        const A = this._atmoLutBau();
        const U = A.U;
        const neu = {
            sx: U.sonne.value.x,
            sy: U.sonne.value.y,
            sz: U.sonne.value.z,
            my: U.mond.value.y,
            m: A.mediumBeta,
            h: U.hKm.value,
            // die Version der Himmels-Sicht (w28-tafel-ganz): zeichnet sie neu (Ψ_ms kam nach), zeichnet die Umgebung mit —
            // ohne Drossel, die Umgebung aus einer leeren Vorgängerin gilt nie weiter
            v: A.himmelVersion,
        };
        const last = st._skyEnvLast;
        // die Welt-Uhr, nie die Wanduhr: das Medium des Wetters zieht in Welt-Sekunden, die Umgebung folgt ihm auf jedem Gerät
        // gleich (eine Uhr, die zurückläuft — ein geladener Stand —, drosselt nicht)
        const nowMs = (st.spielZeit || 0) * 1000;
        const seit = nowMs - (st._skyEnvLastRegenMs == null ? -Infinity : st._skyEnvLastRegenMs);
        const gleich =
            !!last &&
            last.sx * neu.sx + last.sy * neu.sy + last.sz * neu.sz > Math.cos((0.5 * Math.PI) / 180) &&
            Math.abs(last.my - neu.my) < 0.01 &&
            last.m === neu.m &&
            Math.abs(last.h - neu.h) < 0.05 &&
            last.v === neu.v;
        const drossel = !sprung && !!last && last.v === neu.v && seit >= 0 && seit < AnazhRealm.SKY_ENV_REGEN_MIN_MS;
        if (!force && last && (gleich || drossel)) return true;
        // DIE LEINE FRAGT DIE UMGEBUNG (wie das Bild und die Karte, `_gpuLeineStraff`): Equirekt, PMREM und Rücklesung sind
        // GPU-Arbeit — an gespannter Leine wartet die fällige Neuzeichnung auf den nächsten freien Takt (die Umgebung davor gilt
        // weiter), nur der Zwang, der Sprung der Uhr und der erste Bedarf (noch keine Umgebung) gehen an ihr vorbei; das Bild des
        // freien Takts bindet sie mit an (`_atmoTakt`: die Leine zählt Takte, nie Pässe). Bis zur
        // Nachbesserung zeichnete sie neben der Leine: im Zeitraffer der Szene (affekt.K2#1, swiftshader, Mess-Wiese, 3 × 18 000
        // Takte) stauten sich je 0,5 Welt-Sekunden ein PMREM und eine Rücklesung ohne Bild dazwischen, bis der dritte Lauf in
        // seinen ersten 1 500 Takten 599 ms je Takt am Stau der GPU hing (744 s statt 83 s; die Farm am Deckel 2 400 s).
        if (!force && !sprung && last && this._gpuLeineStraff()) return true;
        try {
            // Null-Renderer (headless): kein Pass, kein PMREM — die Equirekt-Tafel ist die Umgebung (ungezeichnet).
            if (st.renderer._isHeadlessNull) {
                st.scene.environment = A.rtEq.texture;
                st._skyEnvLast = neu;
                st._skyEnvLastRegenMs = nowMs;
                return true;
            }
            if (!A.tafelnFrisch) return false; // die Himmels-Sicht steht noch nicht (der erste Takt der Atmosphäre)
            if (!this._atmoZeichne(A.qEq, A.rtEq)) return false; // die Pipeline im Vorbau: der nächste Takt malt
            // PMREM per `fromEquirectangular` (WebGPU-tauglich, anders als `fromScene`) in das BESTEHENDE Target (zweites
            // Argument): stabile Texture-Identität, scene.environment nur beim Erst-Aufruf gesetzt (kein Recompile-Kaskade) —
            // das EINE Gesetz der Umgebung (welt-licht.js `umgebungZeichnen`, die Bühne der Studios zeichnet dieselbe).
            if (!st._skyPmrem) st._skyPmrem = new THREE.PMREMGenerator(st.renderer);
            let rt = st._skyEnvRT || null;
            const pmrem = st._skyPmrem;
            // PMREM im Vorbau (`_einmalRender`): der Takt, in dem seine Pipelines stehen, filtert neu
            if (!this._einmalRender(pmrem, () => (rt = __weltLicht.umgebungZeichnen(pmrem, A, rt)))) {
                st._skyEnvRT = rt;
                return false;
            }
            st._skyEnvRT = rt;
            if (st.scene.environment !== rt.texture) st.scene.environment = rt.texture;
            // was jeder Stoff spiegelt, ist die EINE Umgebung (material.K4): der Spiegel-Pass vor diesem Himmel
            if (!st.scene.environmentNode) st.scene.environmentNode = this._spiegelUmgebung(rt.texture);
            if (!this._weltLichtHimmel()) return false; // das Licht der Welt liest dieselbe PMREM-Stufe wie jeder Stoff
            st._skyEnvLast = neu;
            st._skyEnvLastRegenMs = nowMs;
            this._himmelUmgebungLesen();
            return true;
        } catch (err) {
            this.log(
                `Ω-OPSIS §7 Sky-Env-Map fehlgeschlagen (${err && err.message}) — environment bleibt null`,
                "ERROR"
            );
            st._skyEnvFailed = true;
            return false;
        }
    }

    // DIE UMGEBUNG ZURÜCK AUF DIE CPU (je Neuzeichnung, asynchron): die Equirekt-Tafel als lineare Leuchtdichte je Texel
    // (`_skyEnvData`, Float32 rgba, Zeile 0 = Nadir wie three sie sampelt) — der Leser `_himmelsIrradianz` (Feld-Pass,
    // Luft unter Wasser). Eine spätere Lesung überholt eine frühere (wer auf die frühere wartet, wartet auf sie). DIE LESUNG DIESER MALUNG ist ein Versprechen
    // (`state._skyEnvLesung`, true sobald sie liegt): wer nach einem Sprung der Uhr die Bestrahlung der neuen Stunde braucht,
    // wartet auf sie — die CPU sieht den Himmel EINE Lesung nach der Malung, nie davor. Ein echter Renderer ohne Rücklesung
    // bricht laut (bis zur Nachbesserung kehrte die Lesung still zurück, und jeder Leser sah keinen Himmel).
    _himmelUmgebungLesen() {
        const st = this.state;
        const A = st.atmoLut;
        const r = st.renderer;
        if (typeof r.readRenderTargetPixelsAsync !== "function")
            throw new Error(
                "Die Umgebung: der Renderer liest kein Ziel zurück (readRenderTargetPixelsAsync fehlt, Vendor)"
            );
        const W = A.rtEq.width,
            H = A.rtEq.height;
        const nr = (st._skyEnvLeseNr = (st._skyEnvLeseNr || 0) + 1);
        st._skyEnvLesung = r.readRenderTargetPixelsAsync(A.rtEq, 0, 0, W, H).then(
            (px) => {
                if (nr !== st._skyEnvLeseNr) return st._skyEnvLesung; // überholt: das Versprechen der neueren Lesung
                const d = st._skyEnvData || (st._skyEnvData = new Float32Array(W * H * 4));
                const schritt = __weltLicht.zeilenSchritt(px, W, H); // die Zeilen liegen ausgerichtet (bytesPerRow)
                const halb = px instanceof Uint16Array;
                for (let y = 0; y < H; y++)
                    for (let x = 0; x < W * 4; x++) {
                        const v = px[y * schritt + x];
                        d[y * W * 4 + x] = halb ? AnazhRealm._halbZuFloat(v) : v;
                    }
                st._skyEnvVersion = (st._skyEnvVersion || 0) + 1;
                return true;
            },
            (e) => {
                // nie still: die Bestrahlung trägt die vorige Lesung weiter, der Bruch steht beim EINEN Melder (D3-N2)
                this._bruchMelden(
                    `STOFF: die Umgebung kam nicht zurück — die Bestrahlung trägt die vorige Lesung (${e && e.message})`
                );
                return false;
            }
        );
        return st._skyEnvLesung;
    }

    // DER HIMMEL DER STUNDE AUF DER CPU (ein Versprechen): die Umgebung frisch aus den Quellen, die jetzt gelten, und ihre
    // Lesung abgewartet — true, sobald `_himmelsIrradianz` sie trägt. Der Null-Renderer malt keinen Himmel (die Tafeln leben
    // auf der GPU, Lehre 16): dort false, und wer den Himmel messen will, misst mit dem echten Renderer.
    _himmelFrisch() {
        const st = this.state;
        if (!st.renderer || st.renderer._isHeadlessNull) return Promise.resolve(false);
        if (!this._ensureSkyEnvironment(true) || !st._skyEnvLesung) return Promise.resolve(false);
        return st._skyEnvLesung;
    }

    // Halb-Float (IEEE 754 binary16) → Zahl.
    static _halbZuFloat(h) {
        return __weltLicht.halbZuFloat(h);
    }

    // DIE HIMMELS-UMGEBUNG als Textur: die Equirekt-Tafel der EINEN Atmosphäre (128×64, linear, Halb-Float) — EIN Objekt,
    // gezeichnet von `_ensureSkyEnvironment`, gelesen von PMREM (die IBL jedes PBR-Stoffs) und vom Film des Tors (roh); der
    // Spiegel des Wassers liest seit A1 die Himmels-Sicht mit Wolken (`_himmelSicht`). Dasselbe Ziel bleibt über jede
    // Neuzeichnung → kein Texture-Identitäts-Wechsel.
    _himmelUmgebungTex() {
        return this._atmoLutBau().rtEq.texture;
    }

    // DAS LICHT DER UMGEBUNG JETZT (TSL, rgb): die Umgebung trägt den Himmel je Einheit des Lichts (`passUmgebung`), wie die
    // Tafeln; E0 (`U.licht`) und die Tönung (`U.toenung`) nimmt jeder Leser je Bild aus denselben geteilten Uniforms wie die
    // Kuppel und die Bestrahlung der Belichtung — die Stoffe (`_spiegelUmgebung`), das Licht der Welt (`_weltLicht`), der Film
    // des Tors; die CPU (`_himmelsIrradianz`) ihre Werte. Bis licht.K5 backte die Neuzeichnung beide ein, höchstens je 6 s
    // Wanduhr: im Wetter-Zug sprang das Bild, sobald die Umgebung nachzog (GTX 0,230 EV/s, takt24c). Das Gesetz lebt EINMAL im
    // Baustein der Engine (welt-licht.js `umgebungLicht`, die Bühne der Studios liest dasselbe).
    _umgebungLicht(farbe) {
        return __weltLicht.umgebungLicht(this._atmoLutBau().U, farbe);
    }

    // DIE KRONE EINES BAUM-KÖRPERS (D10) aus dem Kronen-Buch (`_foundryCacheSet`, Beipack `__krone` der Höhen-Stufe): die
    // Laub-Teile [cx, cy, cz, rXZ, rY] der GEZEICHNETEN Krone im Vorlagen-Maß und ihre Farbe (linear) — derselbe Körper-
    // Schlüssel (Art · Gestalt · Höhen-Stufe · Prägung) wie die Höhe (`_foundryBaumHoehe`). Ein reiner Leser ohne Bestellung
    // und ohne Hüllen-Folge: undefined, solange die Höhen-Stufe nicht ankam — bis dahin zeichnet das Bild den Baum auch nicht
    // (die Stufen-Wahl wartet auf seine Höhe und bestellt sie).
    _foundryBaumKrone(preset, gestalt, ov) {
        const f = this._foundry;
        if (!f || !f.kronen || gestalt == null) return undefined;
        return f.kronen.get(this._foundryKoerperKey(preset, gestalt, this._foundryHoehenStufe(preset), ov));
    }
    // ==================== JAHRESZEIT (Vorlagen-Phaenologie) ====================
    _seasonName(phase) {
        const p = ((phase % 1) + 1) % 1;
        if (p < 0.25) return "spring";
        if (p < 0.5) return "summer";
        if (p < 0.75) return "autumn";
        return "winter";
    }
    // Die EINE Saison-Tönungs-Uniform, lazy (TSL muss geladen sein): das
    // Foundry-Laub/-Gras (`_foundryTreeMaterial`, die Nah-Wiese) und die Karte (Impostor-Stoff) lesen `uSeasonMul` als Albedo-
    // Multiplikator, `_tickSeason` fährt sie aus `state.seasonPhase` (kein Rebuild). Abgeleitet, nicht im Snapshot
    // (audit-strict-Whitelist). Dazu DIE PRÄSENZ DES JAHRS `uLaubPraesenz` (x Laub, y Blüte, z Halm; `_saisonPraesenz`): das Laub
    // (`_jahrLage`) und die Karte lesen sie — die Krone fällt im Winter, treibt im Frühling aus.
    _ensureSeasonUniforms() {
        if (this.state.seasonUniforms) return this.state.seasonUniforms;
        const TSL = THREE.TSL;
        this.state.seasonUniforms = {
            uSeasonMul: TSL.uniform(new THREE.Color(1, 1, 1)),
            uLaubPraesenz: TSL.uniform(new THREE.Vector3(1, 1, 1)),
            // die Wärme des Jahrs (`_laubJahr`: x die Grünland-Temperatursumme, y das Laub des Herbsts) — der Stoff rechnet daraus
            // das Laub und die Blüte JE ART (`_jahrLage`, phyto-core `laubImJahr` · `bluehImJahr`)
            uLaubJahr: TSL.uniform(new THREE.Vector2(1000, 1)),
        };
        // UNIFORM-HEIMAT (Review-Riss F1, 19.07.): _tickSeason mutiert je Frame,
        // das Gras-Material ist diät-behandelt — ohne renderGroup fröre jeder
        // per-Objekt-Klon auf dem Stand seines letzten Refresh ein (Patchwork).
        this._uniformHeimatTeilen(this.state.seasonUniforms);
        return this.state.seasonUniforms;
    }

    // uSeasonMul nach dem STUDIO-GESETZ (phytogenesis.js updateWorld, SAISON_GESETZ in foundry-core): die Saison-
    // Tönung linear zwischen den vier Stützstellen (Studio-t: 0 Frühling · .25 Sommer · .5 Herbst · .75 Winter), je
    // Kanal clamp(tönung / bau, mulMin, mulMax) — in den Paletten-Werten (roh /255), wie das Studio mit r128-Farben
    // rechnet. Die Welt-Phase zählt die Saison-MITTEN (Sommer 0,375) → t = phase − 0,125; Sommer ist ×1. Rein (ohne
    // TSL), schreibt in `out` (r/g/b); das Gate ruft es GPU-frei.
    _saisonMul(phase, out) {
        const { SG, a: sa, b: sb, k } = AnazhRealm._saisonLage(phase);
        const a = sa.ti;
        const b = sb.ti;
        const kanal = (hex, s) => ((hex >> s) & 255) / 255;
        const mul = (s) => {
            const v = (kanal(a, s) + (kanal(b, s) - kanal(a, s)) * k) / Math.max(kanal(SG.bau, s), 1e-3);
            return v < SG.mulMin ? SG.mulMin : v > SG.mulMax ? SG.mulMax : v;
        };
        out.r = mul(16);
        out.g = mul(8);
        out.b = mul(0);
        return out;
    }

    // DIE PRÄSENZ DES JAHRS (vegetation.K5, SAISON_GESETZ `pr` · `bl`, wie das Studio `seasonColors`): wie viel vom Laub und von
    // der Blüte steht, linear zwischen denselben Stützen wie die Tönung — Sommer 1, Herbst 0,55, Winter 0,06 (die kahle Krone),
    // der Austrieb 0,72; die Blüte 0,85 im Frühling, 0,12 im Sommer. Das Studio-Gesetz zieht jedes Blatt (aType `typ.laub`) und
    // jede Blüte (`typ.bluete`) um diesen Faktor auf seine Mitte (foundry-core `injectWind`), die Welt ebenso (`_jahrLage`). Rein
    // (ohne TSL), schreibt in `out` (x Laub, y Blüte, z Halm); das Gate ruft es GPU-frei. DIE GESTALT DES HALMS (vegetation.K5#2,
    // SAISON_GESETZ `ha`): z staucht jeden Halm der Wiese über seiner Wurzel, vor dem Wind — der Gras-Stoff der Nah-Wiese, ihre
    // Ferne (`_halmFerne`) und das Studio (`injectWind` uHalm) lesen dieselbe Zeile: Frühling 0,7, Sommer 1, Herbst 0,8, Winter
    // 0,35. Bis dahin stand die Winter-Wiese in voller Höhe, orange getönt (LAI 2–10 m Winter 1,058 × Sommer, Radeon 8ef49bef).
    // DIE PHÄNOLOGIE JE ART (leben.pflanzen.jahreslauf#2, phyto-core PHAENO_GESETZ): `art` (die Spezies der Welt, `baum_eiche` …;
    // ohne sie der Bestand) wählt die Schwellen ihres Laubs und ihrer Blüte; das Laub und die Blüte der Art steigen im Frühling
    // mit der Grünland-Temperatursumme des Orts (`_laubJahr`), der Herbst ist das SAISON_GESETZ für jede Art. Bis jahreslauf#2
    // trug jede Art EINE Kurve (die Stützen `pr` · `bl`): Hasel und Eiche trieben in derselben Woche aus (Rang 0).
    _saisonPraesenz(phase, out, art) {
        const { a, b, k } = AnazhRealm._saisonLage(phase);
        if (!(Number.isFinite(a.ha) && Number.isFinite(b.ha))) AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ.ha");
        const P = globalThis.__phytoCore;
        const J = this._laubJahr(phase);
        const [F, Fb] = P.phaenoArt(art || P.PHAENO_GESETZ.bestand);
        out.x = P.laubImJahr(P.WIND_ZAHLEN, J.g, F, J.herbst, J.w);
        out.y = Fb < 0 ? a.bl + (b.bl - a.bl) * k : P.bluehImJahr(P.WIND_ZAHLEN, J.g, Fb);
        out.z = a.ha + (b.ha - a.ha) * k;
        return out;
    }
    // DIE WÄRME DES JAHRS (jahreslauf#2): die Grünland-Temperatursumme `g` zur Phase aus der EINEN Jahres-Welle der Luft des Orts
    // (`_temperaturFeld` am Meer: Mittel und Jahres-Welle, die Kühlung der Höhe trägt der Ort nicht), das Laub des Herbsts `herbst`
    // (SAISON_GESETZ `pr` zwischen der Mitte des Sommers und der des Winters, im Frühling 1) und die kahle Krone `w` (`pr` des
    // Winters). Die Uniform `uLaubJahr` (x g, y herbst) trägt beides zum Stoff (`_jahrLage`), die Karte backt ihre Stufe damit.
    _laubJahr(phase) {
        const c = this._laubJahrStand;
        const L = this._gelaende();
        if (c && c.phase === phase && c.feld === this._temperaturFeld && c.ort === L.ort) return c.j;
        const { SG, a, b, k } = AnazhRealm._saisonLage(phase);
        const st = this.state;
        const F = this._temperaturFeld(Number.isFinite(st.waterLevel) ? st.waterLevel : 0, 0);
        const welle = { mittel: F.mittel, amp: F.jahr.amp, gipfel: F.jahr.gipfel, spaet: F.jahr.spaet };
        const jt = L.ort && L.ort.klimaHeute && L.ort.klimaHeute.jahrTage;
        const ring = (v) => ((v % 1) + 1) % 1;
        const fruehling = ring(phase - 0.875) <= 0.5;
        const j = {
            g: globalThis.__phytoCore.gruenSumme(welle, phase, jt, 0.375, 0.875),
            herbst: fruehling ? 1 : a.pr + (b.pr - a.pr) * k,
            w: SG.stuetzen[3].pr,
        };
        this._laubJahrStand = { phase, feld: this._temperaturFeld, ort: L.ort, j };
        return j;
    }

    // Die langsame Jahres-Uhr: treibt seasonPhase und leitet den Saison-Namen ab. Jeder Foundry-Körper ist Golden-Sommer
    // gebaut (die Transport-Schale nagelt season "summer"); das Jahr trägt die Uniformen des EINEN SAISON_GESETZ — `uSeasonMul`
    // färbt Laub und Gras, `uLaubPraesenz` lässt das Laub fallen und austreiben (`_saisonPraesenz`) —, und JEDE Stufe liest sie:
    // die Gestalt im Stoff, die Karte als Eingang ihres Bakes (`_karteJahr`, `_karteJahrTakt`), die Fern-Krone des Bodens, des
    // Rings, des Kamms und des Panoramas (`_kroneImJahr`). Kein Neubau eines Körpers: das Studio trägt sein Jahr genauso
    // (uSeasonMul · uLeafPresence · uBloom). Bis vegetation.K5 war die Saison NUR eine Farbe (GTX, main 24a0f3ef: Laub-Maske
    // Winter 1,003 × Sommer); bis w21 trug nur die Nähe das Fallen des Laubs.
    _tickSeason() {
        const st = this.state;
        if (typeof st.seasonPhase !== "number") st.seasonPhase = 0.375;
        // Nur der DRIFT wartet auf die Bühne (die Tönung läuft immer). DAS JAHR IST EINE FUNKTION DER WELT-UHR (feld.K2#2): die
        // Phase ist die ihres Ankers (`_saisonPhaseZu`) plus die Welt-Zeit seitdem durch die Länge des Jahrs — zwei Seiten einer Uhr
        // und ein Reload stehen am selben Tag, und der Pegel des Jahrs (`_pegelTafel`) steigt auf jeder gleich. Bis feld.K2#2 driftete
        // sie mit der Wanduhr jeder Seite (dt ≤ 0,2 s je Bild): ein Reload und ein Sprung der Uhr ließen das Jahr der Seiten
        // auseinanderlaufen.
        if (st.autoSeason !== false && this._buehneSteht()) {
            const A = this._saisonAnkerGilt();
            A.phase = st.seasonPhase = this._saisonPhaseZu(st.spielZeit);
        } else if (st.autoSeason === false) this._saisonAnker = null; // ein angehaltenes Jahr setzt beim Weiterlaufen neu an
        // DIE RUHE IST DER FIXPUNKT (feld.K3): Tönung und Name sind eine Funktion der Phase — steht sie (das Wort, die Bühne,
        // ein Lauf ohne Drift), schläft der Takt; jeder Schreiber der Phase weckt ihn, weil er sie ändert. Bis feld.K3 malte er
        // die Uniform in jedem Bild neu (gate:stand-takt RUHE-SIM, Mess-Wiese 60 s: 10 800 Rufe).
        const g = this._saisonGemalt;
        if (g && g.phase === st.seasonPhase && g.su === st.seasonUniforms) return;
        const su = this._ensureSeasonUniforms();
        if (su && su.uSeasonMul && su.uSeasonMul.value) this._saisonMul(st.seasonPhase, su.uSeasonMul.value);
        if (su && su.uLaubPraesenz && su.uLaubPraesenz.value)
            this._saisonPraesenz(st.seasonPhase, su.uLaubPraesenz.value);
        if (su && su.uLaubJahr && su.uLaubJahr.value) {
            const J = this._laubJahr(st.seasonPhase);
            su.uLaubJahr.value.set(J.g, J.herbst);
        }
        st.season = this._seasonName(st.seasonPhase);
        this._saisonGemalt = { phase: st.seasonPhase, su };
        this._schneeTakt(); // die Schneegrenze folgt dem Pegel (stoffe.K3-2)
        this._pegelTakt(); // die Schmelze speist See und Fluss (stoffe.K3-2)
        this._karteJahrTakt(); // die Karte backt ihre Stufe des Jahrs (w21-laub-jahr-fern), nie je Bild
    }
    // DER ANKER DES JAHRS (`_saisonAnker`, feld.K2#2): Phase und Welt-Uhr, gesetzt vom Wort des Spielers (`setSeason`, zur Tat-Uhr
    // seines Akts), vom Laden eines Stands (sein Anker `saisonAnker`, das Paar reist im Stand), vom Weiterlaufen eines angehaltenen
    // Jahrs (null) und von jedem anderen Schreiber der Phase. Ohne Anker steht die Welt an dem ihrer GEBURT — ihre Phase zur Welt-Uhr
    // 0 —, nie am ersten Bild ihrer Bühne: bis w18-pegel-peers setzte jede Seite ihn, wenn ihr Drift begann, und der Stand trug die
    // Phase ihres letzten Takts neben einer Uhr aus einem anderen Bild (A 0,37552 zur Uhr 2,854 s statt 0,37619) — B lud ein Jahr,
    // das 1,6 s hinter A stand, und der Tag der Schmelze des Pegels (`_pegelTafel`) wechselte auf B 1,6 s später als auf A.
    // Die Uhr des Ankers ist die KALENDER-ZEIT (`k`, zeit-ein-kalender): sie geht stetig über den Regler der Tag-Länge und reist
    // im worldMeta — das Jahr folgt dem Tag, ohne bei einem Wechsel des Reglers oder einem Laden unter einem anderen Tag zu springen.
    _saisonAnkerGilt() {
        const st = this.state;
        let A = this._saisonAnker;
        if (!A || A.phase !== st.seasonPhase)
            A = this._saisonAnker = {
                anker: st.seasonPhase,
                k: A === undefined ? 0 : this._kalenderZeit(),
                phase: st.seasonPhase,
            };
        return A;
    }
    // DER ANKER IM STAND (`saisonAnker`): [Phase, Kalender-Zeit] — die Phase des laufenden Jahrs zu jeder Uhr. Die Phase (Kopf) und die Uhr
    // (`spielZeit`, Augenblick) fragt der Stand in verschiedenen Bildern: bis w18-pegel-peers lud B das Jahr von A aus ihnen, 0,19–1,6 s
    // hinter A. Ein angehaltenes Jahr trägt keinen (seine Phase steht, `seasonPhase`).
    _saisonAnkerStand() {
        const st = this.state;
        if (st.autoSeason === false || typeof st.seasonPhase !== "number") return null;
        const A = this._saisonAnkerGilt();
        return [A.anker, A.k];
    }
    // DIE PHASE DES JAHRS ZUR WELT-UHR `t`: die ihres Ankers plus die Welt-Zeit seitdem durch die Länge des Jahrs; ein angehaltenes
    // Jahr (`autoSeason` false) steht. Leser: der Takt der Saison (`_tickSeason`) und der Stand (`seasonPhase` zu seiner Uhr).
    _saisonPhaseZu(t) {
        const st = this.state;
        if (st.autoSeason === false || typeof st.seasonPhase !== "number") return st.seasonPhase;
        const A = this._saisonAnkerGilt();
        return (((A.anker + (this._kalenderZeit(t) - A.k) / this._kalender().jahrK) % 1) + 1) % 1;
    }
    // Explizit setzen (Chat/DSL): "fruehling/sommer/herbst/winter" — die Phase springt auf die Saison-Mitte, die
    // Tönung folgt im nächsten Tick (kein Neubau).
    setSeason(name, uhr) {
        const key = AnazhRealm.JAHRESZEITEN[String(name || "").toLowerCase()];
        if (!key) return false;
        const phaseFor = { spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 };
        this.state.seasonPhase = phaseFor[key];
        this.state.season = key;
        // der Anker des Jahrs zur Zeit des Worts (`uhr`, die Tat-Uhr seines Akts — beim Mitspieler dieselbe, feld.K2#2)
        const k = this._kalenderZeit(Number.isFinite(uhr) ? uhr : this.state.spielZeit);
        this._saisonAnker = { anker: phaseFor[key], k, phase: phaseFor[key] };
        return true;
    }
    // ==================== WETTER: sichtbarer Regen ====================
    // AnazhRealm hat state.weather (sunny/rainy/stormy) schon fuer Himmel/Wind/Naesse — hier der
    // sichtbare Niederschlag: eine Punktwolke, die dem Spieler folgt + faellt, bei rainy/stormy.
    // DER REGEN (Welle L, W-R1/W-kD5): EIN Gesetz für Labor und Welt (foundry-core REGEN_GESETZ) — fallende Schlieren in
    // einem Kasten um das Auge, der Wind treibt und neigt sie, die Deckung folgt der Regen-Stärke des Wetters. Gezeichnet
    // als EIN instanziertes Sprite (PointsNodeMaterial: je Schliere ein Quad Breite × Länge in Welt-Maß; die Lage rechnet
    // der Vertex aus Saat + Zeit, kein CPU-Umlauf je Frame). Bis V18.531 eine Punktwolke — WebGPU zeichnet Punkte ein
    // Pixel groß: im Sturm lag kein Tropfen im Bild, senkrecht bei jedem Wind, und das Labor zeichnete andere Zahlen.
    _ensureRainSystem() {
        if (this._rainSystem) return this._rainSystem;
        if (!this.state.scene || typeof THREE === "undefined") return null;
        const RG =
            AnazhRealm.Gesetz("terrain:REGEN_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:REGEN_GESETZ");
        const T = THREE.TSL;
        const N = RG.anzahl;
        // Die Saat je Schliere (Lage im Kasten 0..1) aus einem festen Strom — das Bild ist reproduzierbar.
        const saat = new Float32Array(N * 3);
        let h = 2166136261 >>> 0;
        const zufall = () => {
            h ^= h << 13;
            h >>>= 0;
            h ^= h >>> 17;
            h ^= h << 5;
            h >>>= 0;
            return h / 4294967296;
        };
        for (let i = 0; i < N; i++) {
            saat[i * 3] = zufall();
            saat[i * 3 + 1] = zufall();
            saat[i * 3 + 2] = zufall();
        }
        const s4 = T.instancedBufferAttribute(new THREE.InstancedBufferAttribute(saat, 3));
        const uZeit = T.uniform(0);
        const uDrift = T.uniform(new THREE.Vector2(0, 0));
        // der Weg des Tropfens in der Belichtung im Bild: (sin θ, cos θ) × |v| · `belichtung` (m), θ die Neigung quer zum Blick
        const uWeg = T.uniform(new THREE.Vector2(0, RG.fall * RG.belichtung));
        const R = RG.raum;
        // Fallen (y) und Treiben (xz), je Achse in den Kasten um das Auge zurückgefaltet.
        const x = T.fract(s4.x.add(uDrift.x.mul(uZeit).div(R[0])))
            .sub(0.5)
            .mul(R[0]);
        const y = T.fract(s4.y.sub(uZeit.mul(RG.fall).div(R[1])))
            .sub(0.5)
            .mul(R[1]);
        const z = T.fract(s4.z.add(uDrift.y.mul(uZeit).div(R[2])))
            .sub(0.5)
            .mul(R[2]);
        // Das Maß im Bild: r184 teilt die Sprite-Größe durch die Tiefe, ohne die Brennweite — `uProj` (Projektion [1][1])
        // macht Breite und Länge zu Welt-Metern. Eine Schliere schmaler als `minPixel` zeichnet `minPixel` breit und deckt
        // anteilig (die Pixel-Deckung): fern wird der Regen ein Schleier, nah eine Schliere; am Auge und an den Kasten-
        // Rändern blendet er aus (kein Schnitt, wo der Kasten faltet).
        const uProj = T.uniform(1);
        const tiefe = T.positionView.z.negate().max(0.05);
        const pixelM = tiefe.mul(2).div(uProj.mul(T.viewportSize.y));
        const breiteM = pixelM.mul(RG.minPixel).max(RG.breite);
        const rand = T.length(T.vec2(x, z)).div(R[0] * 0.5);
        // DER REGEN FÄLLT NICHT UNTER DEM DACH: die Schliere am Welt-Ort ihrer Mitte (der Kasten folgt dem Auge) liest die EINE
        // Himmels-Sicht des Dach-Pools (`_offenerHimmel`), dieselbe, die den Boden darunter trocken hält
        const himmel = this._offenerHimmel(T, T.modelWorldMatrix.mul(T.vec4(x, y, z, 1)).xyz);
        const blende = T.varying(
            T.min(T.float(RG.breite).div(breiteM), 1)
                .mul(T.smoothstep(0.4, 2.0, tiefe))
                .mul(T.float(1).sub(T.smoothstep(0.7, 1.0, rand)))
                .mul(himmel)
        );
        const mat = new THREE.PointsNodeMaterial({ color: RG.farbe, transparent: true, depthWrite: false, opacity: 0 });
        // DIE SCHLIERE STREUT DAS LICHT DES ORTS (licht-eine-skala, die Klasse Schein-Emissiv): ihr Ton × die Beleuchtungsstärke der
        // waagrechten Fläche ÷ π (`uLicht`, die Lesung des Lichtmessers `_belichtungE`, `_tickRain`) — die weiße Karte im Regen.
        // Bis hier zeichnete sie ihren Ton als Konstante: nachts leuchtete der Regen in der EINEN Skala × k.
        const uLicht = T.uniform(new THREE.Vector3(0, 0, 0));
        mat.colorNode = T.vec4(T.materialColor.mul(uLicht).mul(1 / Math.PI), 1);
        // DIE SCHLIERE IST DER WEG DES TROPFENS IN DER BELICHTUNG DES AUGES (w15-pfuetze): v = (Drift, −`fall`), ihr Weg
        // v × `belichtung` (`uWeg`: 9 m/s → 15 cm) — Länge und Neigung im Wind aus EINEM Gesetz. Das Quad trägt den Hüllkasten des
        // Wegs (|sin θ| · L + Breite × cos θ · L), die Schliere ist seine Diagonale in der Richtung des Falls (die Deckung je Fragment
        // nach dem Abstand zu ihr, `breiteM` breit). Bis w15-pfuetze trug sie eine eigene Länge (0,5–1,1 m, Radeon: Stäbe über halbe
        // Baumhöhe) und eine Drehung, die r184 VOR der Größe anwendet (`rotate(uv) · size`, gelesen im Vendor): das schmale Quad
        // kippte nie, nur seine Enden schrägten. Ein positionNode, der die Ecke des Quads liest (Lage oder UV), zeichnet in r184 nichts.
        const kasten = T.vec2(uWeg.x.abs().add(breiteM), uWeg.y);
        mat.positionNode = T.vec3(x, y, z);
        mat.sizeNode = kasten.mul(uProj);
        const q = T.uv().sub(0.5).mul(kasten);
        const abstand = q.x.mul(uWeg.y).add(q.y.mul(uWeg.x)).abs().div(uWeg.length().max(1e-4));
        const strich = T.float(1).sub(T.smoothstep(breiteM.mul(0.25), breiteM.mul(0.75), abstand));
        mat.opacityNode = T.materialOpacity.mul(blende).mul(strich);
        mat.sizeAttenuation = true;
        const mesh = new THREE.Sprite(mat);
        AnazhRealm._instanzZahl(mesh, N);
        mesh.frustumCulled = false;
        mesh.renderOrder = 5;
        // H3 (gate:asset-inventory) — IDENTITÄTS-STEMPEL: der Regen ist Wetter-Substanz (sichtbar, solange das Wetter
        // regnet; folgt dem Auge).
        mesh.userData.inventar = "wetter-regen";
        mesh.visible = false;
        this.state.scene.add(mesh);
        this._rainSystem = { mesh, uZeit, uDrift, uWeg, uProj, uLicht, RG };
        return this._rainSystem;
    }
    _tickRain() {
        const st = this.state;
        // DIE RUHE IST DER FIXPUNKT (feld.K3): regnet es nicht und steht die Nässe an ihrem Ziel (trocken), schläft der Regen
        // samt Nässe, Dach-Pool und Pegel (wetter.K3: sein Regen ist eine Funktion des Felds, das steht), bis das Wort, sein
        // Übergang oder die Nässe sich ändern (`_regenRuht`); die Uhr der Nässe geht mit, damit das nächste Wort ab seinem Takt
        // benetzt. Bis feld.K3 rechnete er in jedem Bild Feld, Nässe und Pool
        // (gate:stand-takt RUHE-SIM, Mess-Wiese 60 s: 21 600 Rufe).
        // (ein Sprung der Welt-Uhr — mehr als EIN Zug seit dem letzten Takt — weckt ihn: seine Tage tragen die Nässe-Dosis der Front)
        const ruht = this._regenRuht;
        const sprung = st.spielZeit - this._naesseUhr > AnazhRealm.WETTER_ZUG_SEK;
        if (ruht && ruht.wort === st.weather && !st.weatherTransition && ruht.naesse === st.naesse && !sprung) {
            this._naesseUhr = st.spielZeit;
            return;
        }
        this._regenRuht = null;
        this._naesseTakt(); // der Regen benetzt die Welt, die Sonne trocknet sie (wetter.K2)
        const wf = this._weatherFieldFor(st.weather);
        if (!(wf.rain > 0.01)) {
            if (this._rainSystem && this._rainSystem.mesh) this._rainSystem.mesh.visible = false;
            // die Ruhe erst, wenn auch der Schatten der Häuser trocken ist (stadtklima#1, der Trocken-Weg × sein Anteil ≥ 1)
            const U = st.atmoUniforms;
            const schattenNass = U && U.naesseWeg && U.naesseWeg.value * U.schattenSonne.value.w < 1;
            if (st.naesse === 0 && !st.weatherTransition && !schattenNass) this._regenRuht = { wort: st.weather, naesse: 0 };
            return;
        }
        const sys = this._ensureRainSystem();
        if (!sys || !sys.mesh) return;
        const RG = sys.RG;
        sys.mesh.visible = true;
        const cam = st.camera;
        if (cam) sys.mesh.position.copy(cam.position);
        sys.mesh.material.opacity = Math.min(RG.deckung, wf.rain * RG.deckung);
        // das Licht der Schliere: die letzte Lesung des Lichtmessers (ohne Lesung hält sie ihr Licht, vor der ersten ist sie dunkel)
        const E = this._belichtungGelesen ? this._belichtungE : null;
        if (E) sys.uLicht.value.set(E[0], E[1], E[2]);
        // Die Uhr der Schlieren: die Bild-Uhr (s, A9), auf eine Stunde gefaltet (float-Genauigkeit im Vertex).
        const t = this._bildZeit % 3600;
        sys.uZeit.value = t;
        // Die Drift ist der EINE Wind am Auge (`_windAt` auf der Bild-Uhr), mindestens 0,1 wie im Labor (REGEN_GESETZ.drift).
        const wd = cam ? this._windAt(cam.position.x, cam.position.z, this._bildZeit) : { x: 0, z: 0, staerke: 0 };
        const v = RG.drift * Math.max(wd.staerke, 0.1);
        sys.uDrift.value.set(wd.x * v, wd.z * v);
        // der Weg im Bild: der Drift-Anteil quer zur Blickrichtung (Bild-Rechts = Spalte 0 der Kamera) gegen das Fallen
        if (cam) {
            const m = cam.matrixWorld.elements;
            const quer = wd.x * v * m[0] + wd.z * v * m[2];
            sys.uWeg.value.set(quer * RG.belichtung, RG.fall * RG.belichtung);
            sys.uProj.value = cam.projectionMatrix.elements[5];
        }
    }

    // ### Welt-Lebendigkeit ###
    // a) Tag-Nacht-Zyklus (state.timeOfDay 0..1, Lights + Skybox folgen) · b) Wetter-Übergänge (Skybox
    // + Symphonie cross-faden 45 s) · c) Fauna-Lifecycle (Geburten < TARGET, Tod > MAX mit Trauer).

    // ### 6.G3.a — Tag-Nacht-Zyklus ###

    // DIE EINE TAG-ACHSE (S7, W7): jede Größe des Lichts über den Tag ist EINE Funktion der Sonnenhöhe e = sin(Höhe) der
    // Richtung, die leuchtet (`_dayNightSunDirection`) — nie der Uhr, nie eine eigene Schwelle je Anwender. Die Anker sind die
    // Dämmerungs-Anker des Himmels (`HIMMEL.grenzgroesse`: die Grenzgröße der Sterne je Sonnenhöhe). Die Kanäle:
    //   grenze      die Grenzgröße (die Sterne erscheinen, wie sie im Himmel erscheinen), linear zwischen den Ankern;
    //   daemmerung  1 im hellen Tag … 0 in astronomischer Nacht (im Maß der Grenzgröße): das Sternen-Licht leuchtet in ihrem Rest;
    //   tag         das Nacht-Auge der Post-Kette (mesopisch): 1 über dem Horizont (wo `nacht` beginnt), linear über die Höhe
    //               der Sonne bis `BELICHTUNG.nachtGrad` auf 0 — es gleitet, wo die Nacht beginnt;
    //   nacht       die Nacht der Zeitpläne (Leuchtquellen, Horizont der Körper, Klang): 0 über dem Horizont,
    //               1 ab −6° (die bürgerliche Dämmerung) — über dem Horizont tragen Sonne und Himmel allein (ferne.K4);
    //   hell        die Leuchtdichte des Tageshimmels relativ zum Mittag (0,045 Nacht … 1), die Blässe des Mondes liest sie.
    // Bis S7 rechnete jeder Anwender seine eigene Achse (die Tafel nach der Uhr, der Horizont-Fade der Körper, der Nacht-Anteil
    // aus dem Sinus des Winkels, die Dämmerung aus der Grenzgröße, die Himmels-Helligkeit) — die Dämmerung (Uhr 0,27, Sonne 7°)
    // stand heller als der Mittag, und um 0,75 brach die Belichtung um 2,1 EV ein. Die Sonne selbst fadet nie: ihr Licht trägt
    // der Durchlass der EINEN Atmosphäre (`_atmoSonne`), der Mond derselbe Durchlass in seiner Höhe.
    _tagAchse(e) {
        const c = this._tagAchseWert;
        if (c && c.e === e) return c;
        return (this._tagAchseWert = __weltLicht.tagAchse(e));
    }

    // [ATMOSPHERE] Wendet timeOfDay + Wetter + Welt-Feld + Emotionen auf Lights + Skybox an.
    // Drei Modulations-Schichten über dem Himmel: Wetter-Multiplier, Welt-Feld-Tint
    // (Affinität am Spieler), Emotion-Tint (siehe _dayNightComputeTint).
    _applyDayNightToScene() {
        if (!this.state.directionalLight) return; // Pre-init safe
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        const tint = this._dayNightComputeTint();
        // der Winkel der Sonne in Stufen (`_sonnenWinkel`): Licht, Schatten, Himmelskörper und Luft lesen dieselbe Richtung
        const angle = this._sonnenWinkel(t);
        const sunDir = this._dayNightSunDirection(angle);
        // Mond-Richtung aus der EINEN Quelle: der Vollmond steht der Sonne gegenüber (`__weltLicht.mondRichtung` = −sunDir), sein
        // Licht und sein Körper (`_updateCelestialBodies`) lesen dieselbe Richtung.
        // `lightDir` = der AKTIVE Himmelskörper (Sonne über dem Horizont, sonst Mond) → Richtlicht,
        // Wasser-Glitzer, Gras-Translucency; die Skybox behält sunDir (der Wolken-Glow ist Sonne).
        const moonDir = sunDir.clone().negate();
        const lightDir = sunDir.y >= 0 ? sunDir : moonDir;
        // DIE EINE TAG-ACHSE (S7): jeder Anwender liest dieselben Kanäle derselben Sonnenhöhe
        const achse = this._tagAchse(sunDir.y);
        // DIE EINE ATMOSPHÄRE (D3): der Durchlass zur Sonne EINMAL je Anwendung (das Richtlicht), die Tafeln im Takt ihrer
        // Änderung (Medium, Stufe der Sonne, Mond, Auge) — Kuppel, Umgebung und Luft lesen dieselbe Himmels-Sicht.
        const atm = this._atmoSonne(sunDir.y);
        // Ein Sprung des Himmels (`_himmelSprung`, gesetzt vom Uhr-Schreiber) zeichnet Tafeln und Umgebung EINMAL sofort — an
        // der Raten-Drossel und an der Leine vorbei — und verwirft den Boden, den der Rückstrahl unter dem alten Licht maß.
        const sprung = this._himmelSprung === true;
        this._himmelSprung = false;
        if (sprung) this._rueckstrahlSprung();
        this._atmoTakt(sunDir, moonDir, tint, sprung);
        this._dayNightApplySkybox(tint);
        this._dayNightApplyStarField(achse, tint.skyMul);
        this._dayNightApplyDirectionalLight(sunDir, tint, moonDir, atm, achse);
        this._updateCelestialBodies(angle, tint.lightMul * tint.direkt, achse);
        this._dayNightApplyLuft();
        // DIE HIMMELS-UMGEBUNG malt sich aus BEIDEN Quellen, die jetzt gelten — dem Zenit (die Skybox-Tönung, oben) und dem
        // Horizont (die Luft-Farbe, eben): erst danach, und vor jedem Leser ihrer Bestrahlung (Wasser, Belichtung). Bis K10
        // malte `_dayNightApplySkybox` sie vor der Luft — die Nacht nach einem Sprung trug den Horizont des Tags (intern
        // gedrosselt: regeneriert nur bei Farb-Drift; ein Einmal-Fehlschlag versucht es nicht erneut).
        if (!this.state._skyEnvFailed) this._ensureSkyEnvironment(false, sprung);
        this._dayNightApplyWaterMaterials(lightDir);
        this._dayNightApplyBelichtung(achse);
        this._dayNightApplyAugenLicht();
    }

    // Tint-Akkumulation aus drei gekoppelten Schichten (jede mutiert skyColor/lightColor/
    // lightIntensity der vorigen): 1) Wetter (WEATHER_TINTS/Transition) 2) Welt-Feld 3) Emotion.
    // Liefert Tint + skyR/G/B; geteilte Variablen → EINE Methode.
    _dayNightComputeTint() {
        // Schicht 1 — Wetter-Tint
        const wt = this.state.weatherTransition;
        const tints = this.constructor.WEATHER_TINTS;
        // die Zeile des Wetter-Lichts (WEATHER_TINTS ← das EINE Wetter-Feld): das gesamte Licht, der Anteil der direkten Sonne,
        // Hub und Ergrauen des Himmels — über den Übergang des Worts gelerpt
        let skyMul, lightMul, direkt, himmel, grau;
        if (wt && wt.from && wt.to) {
            const fromT = tints[wt.from] || tints.sunny;
            const toT = tints[wt.to] || tints.sunny;
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            const l = (k) => fromT[k] + (toT[k] - fromT[k]) * p;
            [skyMul, lightMul, direkt, himmel, grau] = [
                l("skyMul"),
                l("lightMul"),
                l("direkt"),
                l("himmel"),
                l("grau"),
            ];
        } else {
            const c = tints[this.state.weather] || tints.sunny;
            [skyMul, lightMul, direkt, himmel, grau] = [c.skyMul, c.lightMul, c.direkt, c.himmel, c.grau];
        }
        // DER NENNER DER TÖNUNG (D3, S7): der Himmel des Studios (`_studioSky.top`, Vorlage 0x6a9ed0) — EINE Farbe, keine
        // Tafel nach der Uhr: der Himmel selbst ist die Himmels-Sicht der EINEN Atmosphäre, die Schichten tönen ihn relativ.
        const sk = AnazhRealm._studioSky;
        const basis = new THREE.Color((sk && typeof sk.top === "number" && sk.top) || 0x6a9ed0);
        const skyColor = basis.clone();
        // das Licht beginnt weiß bei Stärke 1: was die Sonne über den Tag tut, trägt die Atmosphäre (`_atmoSonne`, E0)
        const lightColor = new THREE.Color(1, 1, 1);
        let lightIntensity = lightMul;
        // Schicht 2 — Welt-Feld-Tint (Welt-Affinität am Spieler).
        // EIN Stärke-Faktor (`atmosphere.auraTintStrength`, live-justierbar) skaliert alle Feld- und
        // Emotion-Beiträge (Schicht 2+3) — die Aura tönt subtil, sie färbt die Welt nicht um.
        const auraK =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.auraTintStrength)
                ? Math.max(0, this.state.atmosphere.auraTintStrength)
                : 0.3;
        const pm = this.state.playerMesh;
        const aura = pm && typeof this.auraAt === "function" ? this.auraAt(pm.position.x, pm.position.z) : null;
        if (aura) {
            const field = aura; // §5 (V17.25): via auraAt (die living Lese-API)
            {
                const mag = Math.max(0, Math.min(1, field.magieleitung || 0));
                const glut = Math.max(0, Math.min(1, field.glut || 0));
                const lebendig = Math.max(0, Math.min(1, field.lebendig || 0));
                if (mag > 0.5) {
                    const m = (mag - 0.5) * 0.3 * auraK;
                    skyColor.r = Math.min(1, skyColor.r + m * 0.6);
                    skyColor.b = Math.min(1, skyColor.b + m * 1.0);
                    lightColor.b = Math.min(1, lightColor.b + m * 0.4);
                }
                if (glut > 0.5) {
                    const g = (glut - 0.5) * 0.4 * auraK;
                    skyColor.r = Math.min(1, skyColor.r + g);
                    skyColor.g = Math.max(0, skyColor.g - g * 0.3);
                    lightColor.r = Math.min(1, lightColor.r + g * 0.6);
                }
                if (lebendig > 0.5) {
                    const l = (lebendig - 0.5) * 0.25 * auraK;
                    skyColor.g = Math.min(1, skyColor.g + l);
                    skyColor.r = Math.min(1, skyColor.r + l * 0.3);
                }
            }
        }
        // Schicht 3 — Emotion-Tint: liest die emotion-ACHSE des Feldes (`aura.emotion`);
        // Fallback auf `player.emotions`, wenn kein playerMesh (Aura null).
        const emotions = (aura && aura.emotion) || (this.state.player && this.state.player.emotions) || {};
        const joy = Math.max(0, Math.min(1, emotions.joy || 0));
        const sorrow = Math.max(0, Math.min(1, emotions.sorrow || 0));
        const awe = Math.max(0, Math.min(1, emotions.awe || 0));
        const chaos = Math.max(0, Math.min(1, emotions.chaos || 0));
        if (joy > 0.2) {
            const j = (joy - 0.2) * 0.25 * auraK;
            skyColor.r = Math.min(1, skyColor.r + j);
            skyColor.g = Math.min(1, skyColor.g + j * 0.7);
            lightColor.r = Math.min(1, lightColor.r + j * 0.5);
            lightIntensity *= 1 + (joy - 0.2) * 0.15 * auraK;
        }
        if (sorrow > 0.2) {
            const s = (sorrow - 0.2) * 0.5 * auraK;
            const greyR = (skyColor.r + skyColor.g + skyColor.b) / 3;
            skyColor.r = skyColor.r * (1 - s) + greyR * s;
            skyColor.g = skyColor.g * (1 - s) + greyR * s;
            skyColor.b = skyColor.b * (1 - s) + greyR * s;
            lightIntensity *= 1 - (sorrow - 0.2) * 0.2 * auraK;
        }
        if (awe > 0.2) {
            const a = (awe - 0.2) * 0.35 * auraK;
            skyColor.b = Math.min(1, skyColor.b + a);
            skyColor.r = Math.min(1, skyColor.r + a * 0.6);
            lightColor.b = Math.min(1, lightColor.b + a * 0.5);
        }
        if (chaos > 0.3) {
            // das Chaos-Flimmern auf der Bild-Uhr (A9; bis dahin die Wanduhr in ms / 180)
            const c = (chaos - 0.3) * 0.15 * auraK;
            const flutter = Math.sin((this._bildZeit * 1000) / 180) * c;
            skyColor.r = Math.max(0, Math.min(1, skyColor.r + flutter));
            skyColor.g = Math.max(0, Math.min(1, skyColor.g - flutter * 0.7));
        }
        // grey zieht das finale Richtlicht luminanz-erhaltend Richtung Neutralgrau (nach allen Tint-Schichten); den Himmel
        // ergraut die Zeile des Wetter-Lichts (`grau`), seinen Anteil am Licht tragen `direkt` und `himmel`.
        {
            const wf = this._weatherFieldFor(this.state.weather);
            if (wf.grey > 0) {
                const gy = lightColor.r * 0.3 + lightColor.g * 0.59 + lightColor.b * 0.11;
                lightColor.lerp(
                    new THREE.Color(gy, gy, gy),
                    Math.max(0, Math.min(1, wf.grey * AnazhRealm.WEATHER_GREY_K))
                );
            }
        }
        return {
            skyColor,
            lightColor,
            lightIntensity,
            skyMul,
            lightMul,
            auraK, // V18.236 — gated auch den Mood/DSL-skyTint-Blend in _dayNightApplySkybox
            direkt, // der Anteil der direkten Sonne unter der Decke (Richtlicht, Scheibe, Mond)
            grau, // das Ergrauen des Himmels unter der Decke (`atmoLut.U.grau`: Kuppel, Umgebung, Bestrahlung)
            skyR: skyColor.r * himmel,
            skyG: skyColor.g * himmel,
            skyB: skyColor.b * himmel,
            basis, // der Himmel des Studios ohne Wetter, Feld und Gefühl: der Nenner der Tönung (D3)
        };
    }

    // Sonnen-Richtung (Einheitsvektor Oberfläche→Sonne) aus dem Tageswinkel.
    // V8.48 — getrennt von der Licht-POSITION (die folgt dem Spieler für das
    // Shadow-Frustum); diese reine Richtung füttert Beleuchtung + Shader.
    // DIE SONNE IN STUFEN (Welle C, OMEN-Urteil 07.10.: „der Tag steht im Spiel nie"): der Winkel der Sonne, aus dem
    // jede Richtung des Lichts folgt — die EINE Größe, die Schattierung und Schatten lesen (Lehre 21: das Richtlicht, die
    // Kaskaden über sein Ziel, die Himmelskörper, die Luft-Keule, die Godrays). Er folgt der Tageszeit nur in STUFEN: das
    // Licht dreht, wenn die Sonne sich merklich gedreht hat, und steht dazwischen still. Drehte es je Frame mit (8 min je
    // Tag: 0,75° je s), bekam jede Kaskade bei jedem Render eine neue Box und Lage und wählte neu — gemessen (echte GPU,
    // Mess-Wiese, Ruhe mit laufender Sonne, dieselbe Welt): das Licht drehte in 199 von 199 Frames, die Kaskaden rechneten je
    // Frame ~1 400 Licht-Boxen und ihre Wahl neu. Die Stufe (`_sonnenStufe`) verschiebt keine Schatten-Kante um mehr als
    // einen Texel ihrer Karte; ein großer Sprung der Tageszeit (die Bühne, ein Zeit-Befehl) setzt sofort. Bei 8 min je Tag
    // und einem Licht-Weg von 100–170 m fällt sie 10- bis 25-mal je Sekunde — die Wahl der Kaskaden hält darum über die
    // Stufen, bis die Sonne ihren Licht-Rand verbraucht hat (`PASS_WAHL.lichtRandTexel`, `_passLageHaelt`); jede Stufe legt
    // nur die Box neu (die Karte folgt dem Licht, gate:schatten-werfer K8). Die EINE Formel der Tageszeit t (0 Mitternacht ·
    // 0,5 Mittag), die auch Mond, Sterne, Godrays, Tier-Nacht, Feld-Sonne, Umwelt-Klang und das Brennglas lesen (die Welle
    // L-F schrieb sie ein zweites Mal ohne Stufen aus — die spätere Klassen-Methode hätte die Stufen still überschrieben;
    // Integration V18.536: EINE Methode, jeder Leser ruft sie mit der Tageszeit des Spiels).
    _sonnenWinkel(t) {
        const w = __weltLicht.sonnenWinkel(t);
        const s = this.state._sonne || (this.state._sonne = { winkel: NaN, stufe: 0, stufen: 0 });
        s.stufe = this._sonnenStufe();
        if (Number.isFinite(s.winkel)) {
            const a = this._dayNightSunDirection(s.winkel);
            if (a.dot(this._dayNightSunDirection(w)) >= Math.cos(s.stufe)) return s.winkel;
        }
        s.winkel = w;
        s.stufen++;
        return w;
    }

    // DIE STUFE der Sonne (Bogenmaß): eine Drehung des Lichts um α verschiebt in der Karte einer Kaskade jede Schatten-Kante
    // um α × ihren Licht-Weg (vom Werfer zum Empfänger, entlang des Lichts) — die Stufe ist die größte, die in KEINER Kaskade
    // eine Kante um mehr als einen Texel ihrer Karte verschiebt: min texel / weg über die Kaskaden (`_kaskadeFit`: der
    // längste Licht-Weg der Box — der Fall vom höchsten Werfer zum tiefsten Empfänger, geteilt durch die Höhe des Lichts,
    // höchstens die Tiefe der Box; an der Mess-Wiese k0 0,10–0,17 m und k1 0,22–0,47 m je Texel; ohne Kaskaden die EINE
    // Karte des Richtlichts, ihr Texel über ihre Tiefe). Die Schattierung trägt jede kleinere Stufe: N·L ändert sich um
    // höchstens α, unter einer 8-bit-Stufe (`SONNEN_STUFE_SCHATTIERUNG` = 1/255), und die Sonnenscheibe am Himmel springt um
    // höchstens einen Bildpunkt, wo sie auch steht (Gegenprüfung 07.10.: 1/255 rad waren bei 1080p und 75° drei Pixel, 42 %
    // der Scheibe) — die Obergrenze ohne Karte. DER PIXEL-WINKEL aus dem EINEN Schirm (`_schirm`: Zeichenpuffer B × H, die
    // Brennweite f = pxJeM in Bildpunkten): ein Punkt im Winkel θ zur Blickachse liegt bei r = f·tan θ, eine Drehung um α
    // schiebt ihn um α·(f² + r²)/f Bildpunkte — am weitesten in der Bildecke, r² = (B/2)² + (H/2)². Das Sichtfeld je Bildzeile
    // (fov/H) ist nur der Mittelwert über die Höhe: bei 1080p und 75° schiebt es in der Mitte 0,85, am oberen Rand 1,36 und in
    // der Ecke 2,94 Bildpunkte. Die Stufe nimmt die Ecke: f/(f² + r²) — höchstens ein Bildpunkt überall im Bild.
    _sonnenStufe() {
        let stufe = AnazhRealm.SONNEN_STUFE_SCHATTIERUNG;
        const s = this._schirm();
        if (s.pxJeM != null && s.breite > 0 && s.hoehe > 0) {
            const f = s.pxJeM;
            stufe = Math.min(stufe, f / (f * f + (s.breite / 2) ** 2 + (s.hoehe / 2) ** 2));
        }
        const csm = this.state.csmNode;
        if (csm) {
            const fits = csm._anazhFit;
            if (fits)
                for (const f of fits) if (f && f.texelMin > 0 && f.weg > 0) stufe = Math.min(stufe, f.texelMin / f.weg);
            return stufe;
        }
        const dl = this.state.directionalLight;
        const sh = dl && dl.castShadow === true ? dl.shadow : null;
        const c = sh && sh.camera;
        if (c && c.isOrthographicCamera === true && c.far > c.near && sh.mapSize.width > 0)
            stufe = Math.min(stufe, (c.right - c.left) / sh.mapSize.width / (c.far - c.near));
        return stufe;
    }

    // DIE RICHTUNG ZUR SONNE zum Winkel der Uhr: die EINE Sonnenbahn (`__weltLicht.sonnenRichtung`, die auch die Bühne der Studios
    // liest — bis w28-nacht-licht stand hier ihre Kopie)
    _dayNightSunDirection(angle) {
        const [x, y, z] = __weltLicht.sonnenRichtung(angle);
        return new THREE.Vector3(x, y, z);
    }

    // Die Richtung ZUR Sonne jetzt (Einheitsvektor; y ≤ 0 unter dem Horizont) — dieselbe Quelle wie Licht und Skybox.
    _sonnenRichtung() {
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        return this._dayNightSunDirection(this._sonnenWinkel(t));
    }

    // Reine Godray-Stärke aus Sonnenhöhe × Wetter-Klarheit (`weatherSun`, auf [0..1] remappt): über dem Horizont blenden sie
    // im Maß der EINEN Tag-Achse auf (1 − `nacht`, geglättet: 0 bei −6°, voll am Horizont) — keine eigene Schwelle.
    // Der Screen-Sichtbarkeits-Gate (Sonne im Bild) sitzt separat in `_loopRender`.
    _godrayFrameGate(sunDirY, weatherSun) {
        const sm = (a, b, x) => {
            const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return k * k * (3 - 2 * k);
        };
        const horizon = sm(0, 1, 1 - this._tagAchse(sunDirY).nacht);
        const clarity = sm(0.5, 0.95, Number.isFinite(weatherSun) ? weatherSun : 1); // Sturm→0, sunny→1
        return horizon * clarity;
    }

    // ═══ DIE EINE ATMOSPHÄRE (D3, Hillaire EGSR 2020, CGF 39(4)) ═══
    // Sonne, Himmel, Umgebung und Luft lesen EIN Medium aus EINEM Gesetz (foundry-core `ATMO_GESETZ`, seine Rechnung
    // `ATMO_RECHNUNG` — dieselbe ruft das Labor phytogenesis): Rayleigh-Tiefe je Kanal, die EINE Luft (`LUFT` liest ihre Anker
    // dort; das Aerosol = `_luftBeta` des Wetters abzüglich ihres Rayleigh-Anteils), Mie-Phase g · Einfach-Albedo · Ozon-Zelt ·
    // Radien, der Boden die gemessene Welt-Albedo (`ATMO_BODEN`). Einheiten des Mediums: km und 1/km (Hillaire), Höhen über
    // dem Bezug der Luft (`waterLevel`). Bis D3 standen vier getunte Näherungen nebeneinander (die Luftmassen-Sonne, die
    // Nebel-Kuppel, die Horizont-Farbe der Luft, die CPU-gemalte Umgebung 128×64) — das Verhältnis Sonne : Himmel war gesetzt
    // (4,2), nicht gerechnet (gerechnet 5,1; `diag-atmo-hillaire`).
    // DER HIMMEL DER WELT (ultiversum.K1): das Medium des Kerns mit der Rayleigh-Tiefe aus dem Gesetz DIESER Welt (`_weltGesetz`,
    // `himmel.rayleighTiefe`) — die Erde trägt die des Kerns, die Ferne einen Himmel aus rotem Staub. Gemerkt je Kern und Gesetz.
    _atmoGesetz() {
        const K = AnazhRealm.Gesetz("terrain:ATMO_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:ATMO_GESETZ");
        const H = AnazhRealm._weltGesetz(this.state.worldMeta).himmel;
        const m = this._atmoWelt;
        if (m && m.K === K && m.H === H) return m.G;
        const G = Object.freeze({ ...K, rayleighTiefe: Object.freeze(H.rayleighTiefe.slice()) });
        this._atmoWelt = { K, H, G };
        return G;
    }

    _atmoRechnung() {
        return (
            AnazhRealm.Gesetz("terrain:ATMO_RECHNUNG", null) || AnazhRealm._kernPflichtBruch("terrain:ATMO_RECHNUNG")
        );
    }

    _atmoMedium(betaLuft) {
        return this._atmoRechnung().medium(this._atmoGesetz(), betaLuft, AnazhRealm.ATMO_BODEN);
    }

    // DIE SONNE aus dem Medium: e = sin(Höhe) der Sonne, der Durchlass vom beleuchteten Ort (`_atmoOrtKm`) zur Sonne
    // (`ATMO_RECHNUNG.sonne`, dieselbe Rechnung, die die Transmittance-Tafel je Texel trägt). `col` = sein Farbton (unter dem
    // Horizont zum Mond-Hue, Purkinje), `lum` = sein hellster Kanal — `col`·`lum` IST der Durchlass; das Richtlicht trägt
    // E0 · Durchlass (E0 = die Sonne über der Atmosphäre, `_atmoE0`), dieselbe E0, mit der die Tafeln den Himmel rechnen:
    // das Verhältnis Sonne : Himmel ist Physik.
    _atmoSonne(e) {
        const T = this._atmoT || (this._atmoT = [0, 0, 0]);
        const N = AnazhRealm.ATMO_LUT.schritte.durchlass;
        return this._atmoRechnung().sonne(this._atmoGesetz(), this._atmoMediumJetzt(), this._atmoOrtKm(), e, N, T);
    }

    // DER WEG ZUR SONNE JE ART DER LUFT (die Sonne in der Höhe jeder Probe der Luft, `_luftEnsure` `tauSonne`): die optische Tiefe
    // am Boden (1 m) für Rayleigh und Mie getrennt, als Leuchtdichte — dieselbe Rechnung wie die Transmittance-Tafel
    // (`ATMO_RECHNUNG.durchlass`, das Medium jetzt), je Art ihr Medium allein (das Ozon trägt jede Höhe der Luft gleich, es
    // kürzt sich im Verhältnis zum Auge). Unter dem Horizont 0 (die einfache Streuung der Sonne ruht dort). Neu, wenn Sonne
    // oder Medium wechseln (Kosten an Änderung).
    _luftSonneTakt(U) {
        const A = this.state.atmoLut;
        const e = A && A.U ? A.U.sonne.value.y : -1;
        const M = this._atmoMediumJetzt();
        const m = this._luftSonneMerk;
        if (m && m.e === e && m.M === M) return;
        this._luftSonneMerk = { e, M };
        const R = this._atmoRechnung();
        const N = AnazhRealm.ATMO_LUT.schritte.durchlass;
        const T = [0, 0, 0];
        const leer = [0, 0, 0];
        const tau = (Mk) => {
            R.durchlass(Mk, 0.001, e, N, T);
            const y = 0.2126 * T[0] + 0.7152 * T[1] + 0.0722 * T[2];
            return y > 1e-12 ? -Math.log(y) : 28;
        };
        U.sonneR.value = e > 0 ? tau(Object.assign({}, M, { mieExt: leer, ozon: leer })) : 0;
        U.sonneM.value = e > 0 ? tau(Object.assign({}, M, { betaR: leer, ozon: leer })) : 0;
    }

    // Das Medium des Wetters jetzt, in STUFEN der Extinktion um die klare Luft (`ATMO_LUT.mediumStufe`, logarithmisch; die
    // klare Luft selbst ist exakt eine Stufe): ein Wetter-Übergang zeichnet die Tafeln je Stufe neu, nie je Anwendung — bis
    // zur Nachbesserung zeichnete jedes Anwenden eines Übergangs Durchlass, Ψ_ms und Himmels-Sicht neu. Sonne und Tafeln
    // lesen dasselbe gestufte Medium.
    _atmoMediumJetzt() {
        const G = this._atmoGesetz();
        const klar = this._atmoRechnung().betaKlar(G);
        const k = AnazhRealm.ATMO_LUT.mediumStufe;
        const b = klar * Math.exp(Math.round(Math.log(this._luftBeta() / klar) / k) * k);
        if (this._atmoM && this._atmoMBeta === b && this._atmoMG === G) return this._atmoM;
        this._atmoMBeta = b;
        this._atmoMG = G; // das Gesetz der Welt gehört zum Schlüssel: ein Welt-Wechsel rechnet das Medium neu
        return (this._atmoM = this._atmoMedium(b));
    }

    // DIE HÖHE DES BELEUCHTETEN ORTS über dem Bezug der Luft (km, ≥ 1 m): der Spieler, auf dessen Boden die Welt um das Auge
    // liegt — dort gilt der Durchlass des Richtlichts (Sonne und Mond), nie an der Kamera; ohne Spieler das Auge. Bis ferne.K4 trug
    // das Richtlicht den Durchlass der Kamera: mit dem Auge 1 585 m über dem Dorf fiel die Sonne bei 5° auf den Hang 3,8× so
    // stark wie mit dem Auge am Boden (je N·L 0,0354 gegen 0,0093), die Station maß je nach Reihenfolge des Rufs das eine oder
    // das andere. Die Himmels-Sicht (die Kuppel, die Luft vor dem Auge) bleibt am Auge (`_atmoAugeKm`).
    _atmoOrtKm() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm) return this._atmoAugeKm();
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        return Math.max(0.001, (pm.position.y - wl) / 1000);
    }

    // Die Höhe des Auges über dem Bezug der Luft (km, ≥ 1 m): die Kamera, ohne sie der Bezug.
    _atmoAugeKm() {
        const st = this.state;
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const y = st.camera ? st.camera.position.y : wl;
        return Math.max(0.001, (y - wl) / 1000);
    }

    // E0 — DIE SONNE ÜBER DER ATMOSPHÄRE in Welt-Einheiten: das Schlüssellicht (KEY_BASE, r128 → r184 über LEGACY_LICHT)
    // × die Tages-Intensität des Tints (Wetter, Aura). Das Richtlicht trägt E0 · Durchlass, die Tafeln den Himmel in E0.
    _atmoE0(tint) {
        return __weltLicht.e0(tint ? tint.lightIntensity : 1);
    }

    // DAS STERNEN-LICHT (D3-2) jetzt: die Zenit-Leuchtdichte des Nachthimmels (welt-licht.js `STERNENLICHT`: der Ton des Gesetzes
    // im Maß der REF, 1/793 des Vollmonds — bis w28-nacht-bilanz die Zahl `ATMO_GESETZ.nacht.himmel` selbst, das 510-Fache) im
    // Maß der Nacht (1 − Dämmerung der EINEN Tag-Achse, `_tagAchse`: wie die Sterne erscheinen, erscheint ihr Licht). Bis D3-2 trug der Himmel der EINEN Atmosphäre nachts nur die Streuung des Mondes
    // (Zenit 0,009): der Himmel der Nacht war schwarz, Wiese Mitternacht Luma 4,9 (vor D3 31,7), Dämmerung 0,78 4,2 (38,1).
    _atmoSternenLicht(e) {
        const N = __weltLicht.STERNENLICHT;
        const w = __weltLicht.nachtHimmel(this._tagAchse(e));
        const o = this._atmoNacht || (this._atmoNacht = [0, 0, 0]);
        o[0] = N.r * w;
        o[1] = N.g * w;
        o[2] = N.b * w;
        return o;
    }

    // DIE TAFELN (EINMAL je Szene): Fragment-Pässe in RenderTargets — EIN Pfad für WebGPU und WebGL (Compute hätte unter
    // WebGL keinen Himmel). Transmittance 256×64 (Bruneton-Parametrisierung) und Mehrfachstreuung Ψ_ms 32×32 (Hillaire Gl.
    // 5–9) je Medium, die Himmels-Sicht 192×108 (Azimut absolut, Breite quadratisch um den Horizont) je Stufe der Sonne,
    // die Umgebung 128×64 (Equirekt, die Vorlage von PMREM) im groben Takt der Umgebung. Die Leser: die Kuppel und die Luft
    // (`himmelFarbe`), der Spiegel des Wassers (`_himmelSicht`), die Umgebung (`_himmelUmgebungTex`: PMREM, der Film des Tors). Die Uniforms leben in der renderGroup
    // (`_uniformHeimatTeilen`): Kuppel und Luft sind Stoffe der Szene.
    _atmoLutBau() {
        const st = this.state;
        if (st.atmoLut) return st.atmoLut;
        // DIE TAFELN SIND EIN BAUSTEIN DER ENGINE (w12-studio-buehne, welt-licht.js `atmoTafeln`): die Welt und die Bühne der
        // Studios bauen denselben Graphen — hier mit dem Himmel DIESER Welt, dem Medium jetzt und der renderGroup
        st.atmoLut = __weltLicht.atmoTafeln({
            G: this._atmoGesetz(),
            M: this._atmoMediumJetzt(),
            teilen: (u) => this._uniformHeimatTeilen(u),
        });
        return st.atmoLut;
    }

    // DIE RICHTUNG DER EQUIREKT-LAGE (die Umkehr von r184 `equirectUV`): uv → Einheits-Richtung, φ = (u − ½)·2π, Höhe = (v − ½)·π
    // — so malt die Umgebung (`passUmgebung`), so tastet die Himmels-Sonde des Lichts der Welt ab (`_weltLichtHimmel`).
    _umgebungRichtung(q) {
        return __weltLicht.umgebungRichtung(q);
    }

    // EIN Pass in sein Ziel (der Zustand des Renderers bleibt, wie er war — dieselbe Hülle wie die zeitliche Auflösung); `leeren`
    // setzt das Ziel vorher auf 0 (die Horizont-Karte sammelt per Max-Blende). Gezeichnet wird über die EINE Bühne
    // (`_buehneRender`, gate:v1-pfad W2): ein Bruch des Passes meldet sich laut beim Namen.
    _atmoZeichne(quad, rt, leeren = false) {
        const r = this.state.renderer;
        const ziel = r.getRenderTarget();
        const mrt = typeof r.getMRT === "function" ? r.getMRT() : null;
        const rof = typeof r.getRenderObjectFunction === "function" ? r.getRenderObjectFunction() : null;
        const auto = r.autoClear;
        if (mrt) r.setMRT(null);
        if (rof) r.setRenderObjectFunction(null);
        r.autoClear = false;
        r.setRenderTarget(rt);
        if (leeren) {
            const farbe = r.getClearColor(this._atmoLeerFarbe || (this._atmoLeerFarbe = new THREE.Color()));
            const alpha = r.getClearAlpha();
            r.setClearColor(0x000000, 0);
            r.clear(true, false, false);
            r.setClearColor(farbe, alpha);
        }
        // false: seine Pipeline steht unter dem Ladeschirm noch im Vorbau (PSO-Vorbau, `_einmalRender`)
        const ganz = this._einmalRender(quad, () => this._buehneRender(r, quad, quad.userData.kamera, "Atmosphäre"));
        r.setRenderTarget(ziel);
        if (mrt) r.setMRT(mrt);
        if (rof) r.setRenderObjectFunction(rof);
        r.autoClear = auto;
        return ganz;
    }

    // DER TAKT DER ATMOSPHÄRE (je Anwendung von Tag und Nacht): das Medium folgt dem Wetter in seinen Stufen (Transmittance und
    // Ψ_ms neu je Stufe, `_atmoMediumJetzt`), die Himmels-Sicht der Stufe der Sonne (`_sonnenWinkel`, mit ihr der Mond), der
    // Höhe des Auges (10 m) und dem Medium — Kosten an Änderung (Gebot 7). Das Licht jetzt (E0) und der Mond in Einheiten von
    // E0 sind Uniforms der Leser: ihr stetiger Gang über den Tag zeichnet keine Tafel (bis zur Nachbesserung trug der Schlüssel
    // E0 auf 4 Stellen — am Abend 60 von 60 Frames eine neue Himmels-Sicht). Der Null-Renderer zeichnet nichts.
    _atmoTakt(sunDir, moonDir, tint, sprung = false) {
        const st = this.state;
        const A = this._atmoLutBau();
        const U = A.U;
        // DER HIMMEL EINER ANDEREN WELT (ultiversum.K1): die Tafeln reisen mit der Seite (`WELT_GRENZE.seite`), das Gesetz des
        // Himmels nicht — trägt die Welt ein anderes (`_atmoGesetz`), fallen Anker, Belichtung und Medium der Tafel und werden
        // aus IHREM Gesetz neu gerechnet (sonst zeichnete die Ferne den Himmel der Erde, solange die Luft gleich blieb)
        const G = this._atmoGesetz();
        if (A.gesetz !== G) {
            A.gesetz = G;
            A.anker = null;
            A.belichtung = null;
            A.mediumBeta = null; // die Uniforms des Mediums und die Tafeln (Durchlass, Ψ_ms, Himmels-Sicht) zeichnen neu
            A.tafelSchluessel = null; // die Bestrahlungs-Tafel derselben Luft unter dem anderen Gesetz
            A.tafelFlug = null; // ihr Flug trug die Bestrahlung des alten Himmels
        }
        // DER ANKER ZUERST (S7): bis die Tafel der klaren Luft am Boden einmal zurückkam (`anker`, der Himmel der Karte
        // unter der Zenit-Sonne), zeichnet der Takt sie — in jedem Wetter und jeder Höhe des Auges; danach das Medium jetzt.
        // Der Null-Renderer malt keinen Himmel (Lehre 16): dort trägt die Karte keinen.
        const anker = A.anker == null && !(st.renderer && st.renderer._isHeadlessNull);
        const klar = anker ? this._atmoRechnung().betaKlar(this._atmoGesetz()) : 0;
        const M = anker ? this._atmoMedium(klar) : this._atmoMediumJetzt();
        const mB = anker ? klar : this._atmoMBeta;
        if (A.mediumBeta !== mB) {
            U.betaR.value.fromArray(M.betaR);
            U.HR.value = M.HR;
            U.HM.value = M.HM;
            U.mieExt.value.fromArray(M.mieExt);
            U.mieSca.value.fromArray(M.mieSca);
            U.g.value = M.g;
            U.ozon.value.fromArray(M.ozon);
            U.albedo.value.fromArray(M.albedo);
            A.mediumBeta = mB;
            A.tafelnFrisch = false;
        }
        const h = anker ? 0.001 : Math.max(0.001, Math.round(this._atmoAugeKm() * 100) / 100);
        U.hKm.value = h;
        U.sonne.value.copy(sunDir).normalize();
        U.mond.value.copy(moonDir).normalize();
        const E0 = this._atmoE0(tint);
        const Mo = AnazhRealm.MOONLIGHT;
        const mi = Mo.intensity * (tint ? tint.lightMul : 1);
        // das Sternen-Licht hängt allein an der Höhe der Sonne (die Dämmerung) — der Schlüssel der Himmels-Sicht trägt es mit;
        // Sonne, Mond und Sterne in der Einheit der Tafeln (`__weltLicht.tafelLicht`: das Licht der Stunde)
        __weltLicht.tafelLicht(U, E0, [Mo.r * mi, Mo.g * mi, Mo.b * mi], this._atmoSternenLicht(sunDir.y));
        const s = st._sonne;
        const schluessel = `${s ? s.winkel : 0}:${h}:${A.mediumBeta}`;
        const rend = st.renderer;
        if (!rend || rend._isHeadlessNull || !st.rendererReady) return A;
        // DIE LEINE FRAGT DIE TAFELN (wie das Bild, die Karte und die Umgebung, `_gpuLeineStraff`): an gespannter Leine zeichnet
        // der Takt kein Bild, und seine Tafeln und die Horizont-Karte warten mit ihm — ihre Schlüssel bleiben alt, der nächste
        // freie Takt zeichnet sie vor seinem Bild; nur der Anker, der Sprung der Uhr und der ERSTE Bedarf der Umgebung (noch keine
        // gezeichnet: ohne frische Tafeln entstünde sie nie) gehen vorbei. Bis zur Nachbesserung zeichneten sie neben der Leine:
        // im Zeitraffer der Szene (affekt.K2#1, swiftshader, Mess-Wiese) hing der dritte Lauf nach der Umgebung noch 300 s in einem
        // Block von 1 500 Takten an `_atmoZeichne`. Sie binden sich NIE selbst an: ein freier Takt zeichnet sein Bild, und dessen
        // Bindung (`_gpuLeineAnlegen`, onSubmittedWorkDone) deckt jede vorher abgeschickte Arbeit — die Leine zählt Takte, nie
        // Pässe. Banden sie sich selbst an (w4-affekt 7105403d), nahmen Tafeln und Umgebung im freien Takt beide Plätze der Leine,
        // ehe der Karten-Takt fragte: die Karte begann nie (gate:kamera-leib, swiftshader, Mess-Wiese: 15 Karten und 494 Bauten
        // standen nach 600 s offen, das Weltbild nie; main 0 nach 215 s).
        if (!anker && !sprung && st._skyEnvLast && this._gpuLeineStraff()) return A;
        // eine Tafel, deren Pipeline noch im Vorbau steht (`_atmoZeichne` false), zeichnet der nächste Takt ganz neu
        if (!A.tafelnFrisch) {
            const durchlass = this._atmoZeichne(A.qT, A.rtT);
            if (!this._atmoZeichne(A.qMS, A.rtMS) || !durchlass) return A;
            A.tafelnFrisch = true;
            // was aus Durchlass und Ψ_ms rechnet, zeichnet mit (w28-tafel-ganz): die Himmels-Sicht, die Bestrahlung (und mit ihr
            // die Belichtung) und über die Version der Himmels-Sicht die Umgebung (`_ensureSkyEnvironment`)
            A.himmelSchluessel = null;
            A.tafelSchluessel = null;
        }
        if (A.himmelSchluessel !== schluessel) {
            if (!this._atmoZeichne(A.qSV, A.rtSV)) return A;
            A.himmelSchluessel = schluessel;
            A.himmelVersion++;
        }
        // die Bestrahlungs-Tafel je Medium und je 100 m Höhe des Auges (sie hängt nicht an der Sonne: jede Stunde liest sie)
        const tafel = `${A.mediumBeta}:${Math.round(h * 10)}`;
        if (A.tafelSchluessel !== tafel) {
            if (!this._atmoZeichne(A.qBS, A.rtBS)) return A;
            A.tafelSchluessel = tafel;
            // bis die neue Tafel zurückkommt, liest kein Leser die Luft von vorher (die Belichtung schreibt dann nicht, sie hält)
            A.tafel = null;
            this._himmelsTafelLesen();
        }
        this._horizontKarteTakt();
        return A;
    }

    // DIE BESTRAHLUNGS-TAFEL AUF DIE CPU (je Neuzeichnung, EINMAL je Medium und Höhe): je Sonnenhöhe die Bestrahlung einer
    // waagrechten Fläche durch den Himmel je Einheit E0 (rgb), der letzte Texel das Sternen-Licht je Einheit `nachtE`. Eine
    // spätere Lesung überholt eine frühere. Die erste Tafel der klaren Luft am Boden (`_atmoTakt` zeichnet sie zuerst) trägt den
    // ANKER der Belichtung: den Himmel unter der Zenit-Sonne (`anker`, je Einheit E0, `_belichtungAnker`). Bis S7 stand er
    // als Konstante neben der Tafel (0,24 gegen gerechnet 0,232, eine Wand bei ±0,02 nur am klaren Boden). Lesung, Nummer und
    // Anker leben an der Tafel (`state.atmoLut`): wer sie trägt, trägt ihre Lesung.
    _himmelsTafelLesen() {
        const st = this.state;
        const A = st.atmoLut;
        const r = st.renderer;
        if (typeof r.readRenderTargetPixelsAsync !== "function")
            throw new Error(
                "Die Bestrahlung: der Renderer liest kein Ziel zurück (readRenderTargetPixelsAsync fehlt, Vendor)"
            );
        const W = A.rtBS.width;
        const klar = A.mediumBeta === this._atmoRechnung().betaKlar(this._atmoGesetz()) && A.U.hKm.value < 0.05;
        // die Lesung trägt die Luft, in der sie gezeichnet wurde (Medium und Höhen-Stufe) — der Flug misst an IHR, nie an der Luft,
        // die gerade gilt, wenn ein Leser sie zum ersten Mal sieht
        const [medium, stufe] = [A.mediumBeta, Math.round(A.U.hKm.value * 10)];
        const nr = ++A.tafelNr;
        return r.readRenderTargetPixelsAsync(A.rtBS, 0, 0, W, 1).then(
            (px) => {
                if (nr !== A.tafelNr) return false;
                const w = __weltLicht.tafelAusPixeln(px, W);
                A.tafel = A.tafelFlug = { W, werte: w, medium, stufe };
                if (klar && A.anker == null) A.anker = __weltLicht.tafelAnker(w, W);
                return true;
            },
            (e) => {
                this._bruchMelden(
                    `STOFF: die Bestrahlungs-Tafel kam nicht zurück — der Himmel des Orts fehlt (${e && e.message})`
                );
                return false;
            }
        );
    }

    // DER HIMMEL ÜBER DEM ORT, SYNCHRON (S7; rgb, E einer waagrechten Fläche): die Bestrahlungs-Tafel an der Sonne und am Mond
    // jetzt, das Sternen-Licht — in derselben Zusammensetzung wie die Farbe des Himmels (`himmelFarbe`: E0 × Tönung, der Mond
    // in `mondE`, die Sterne in `nachtE`, die Uniforms dieser Anwendung). Jede Stunde liest sie im selben Takt, in dem das Licht
    // steht; die zurückgelesene Umgebung (`_himmelsIrradianz`) bleibt die Quelle des Feld-Passes, der dieselbe IBL zeigt wie die
    // Stoffe. Der Null-Renderer malt keinen Himmel (Lehre 16): dort 0. Bis die erste Tafel liegt (der erste Takt der
    // Atmosphäre unter dem Ladeschirm): null — kein Leser schreibt dann.
    _himmelsBestrahlung(out, flug) {
        const st = this.state;
        out[0] = out[1] = out[2] = 0;
        if (st.renderer && st.renderer._isHeadlessNull) return out;
        const A = st.atmoLut;
        const T = A && (flug ? A.tafelFlug : A.tafel);
        if (!T) return null;
        return __weltLicht.bestrahlung(T, A.U, out);
    }

    // Skybox-Uniforms: himmelTint aus skyR/G/B + Wolken-Deckung aus dem Wetter (Cross-Fade über die
    // Transition); die Uniforms leben in `state.skyboxUniforms` (uniform-Knoten).
    _dayNightApplySkybox(tint) {
        const u = this.state.skyboxUniforms;
        if (!u) return;
        if (u.himmelTint && u.himmelTint.value && u.himmelTint.value.setRGB) {
            u.himmelTint.value.setRGB(tint.skyR, tint.skyG, tint.skyB);
            // === Sky-Harmonie: die DSL/Mood-Tönung überschreibt die Tag-Nacht-Farbe nicht — sie blendet + fadet.
            // Läuft ~10 Hz (Tag-Nacht-Throttle); die Schritte sind raten-approximativ.
            const st = this.state;
            if (st.skyTint) {
                // V17.24 — Farb-Cross-Fade: die gezeigte Tönung lerpt sanft zur
                // Ziel-Farbe (ein Farbwechsel springt nicht mehr, er fadet).
                if (st.skyTintTo) st.skyTint.lerp(st.skyTintTo, 0.08);
                st.skyTintStrength += (st.skyTintTarget - st.skyTintStrength) * 0.12; // smooth ramp (kein Snap)
                st.skyTintTarget = Math.max(0, st.skyTintTarget - 0.001); // langsamer Decay (~60 s) → fadet aus
                // V18.236 — der Mood/DSL-skyTint-Blend wird vom EINEN auraTintStrength-
                // Knopf mitgedämpft (der Nexus tönte den Himmel bei awe nach lila =
                // magenta-Wäsche). Der Mensch kann auraTintStrength heben, will er es satt.
                const _aK = tint && Number.isFinite(tint.auraK) ? tint.auraK : 1;
                if (st.skyTintStrength * _aK > 0.002) u.himmelTint.value.lerp(st.skyTint, st.skyTintStrength * _aK);
            }
            // DIE TÖNUNG DES PHYSIKALISCHEN HIMMELS (D3): der Himmel selbst ist die Himmels-Sicht der EINEN Atmosphäre — was
            // der Tint daneben trägt (Wetter, Welt-Feld, Gefühl, DSL-Tönung), wirkt als Verhältnis zum blanken Himmel des Studios.
            // Ohne all das ist die Tönung 1: der Himmel ist reine Physik.
            const A = st.atmoLut;
            const b = tint && tint.basis;
            if (A && b) {
                const nc = u.himmelTint.value;
                const q = (x, y) => Math.max(0, Math.min(4, y > 1e-4 ? x / y : 1));
                A.U.toenung.value.set(q(nc.r, b.r), q(nc.g, b.g), q(nc.b, b.b));
                A.U.grau.value = tint.grau;
            }
        }
        if (u.cloudCover) {
            // Wolken-Deckung: klar 0.12 (thr~0.62 = blauer Himmel mit verstreuten Spitzen; 0.32 las schon als
            // bewölkt), Regen 0.9 (Overcast) — `WOLKEN_SCHICHT.deckung`. Der FBM-Wolken-Layer liest sie als Schwellen-Senker.
            const [klar, regen] = AnazhRealm.WOLKEN_SCHICHT.deckung;
            u.cloudCover.value = Math.min(1, this._weatherBlendedValue(klar, regen)); // D5a: [0,1]-Konsument clampt lokal
        }
        if (u.zug) {
            // DER ZUG DER WOLKE (licht.K4, wetter-am-ort): die Schicht zieht mit dem EINEN Wind (`_wolkenWind`) — in Einheiten der
            // Schicht; die Kuppel, der Spiegel und der Wurf rechnen ihr Feld an u − zug·time (f(u − Weg)), darum trägt `zug` den
            // Weg seit der Wolken-Uhr 0 je Sekunde dieser Uhr (der Weg ÷ die Uhr, zur Uhr 0 der Zug selbst): zug·time ist der Weg
            const HG =
                AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) ||
                AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
            const tW = this._wolkenZeit || 0; // dieselbe Uhr, die `time` trägt (`_loopRender`, je Takt `startEternalLoop`)
            const W = this._wolkenWind(tW);
            const k = -1 / ((1 + HG.projY) * AnazhRealm.WOLKEN_SCHICHT.hoeheM);
            if (tW > 0) u.zug.value.set((W.weg[0] * k) / tW, (W.weg[1] * k) / tW);
            else u.zug.value.set(W.ms[0] * k, W.ms[1] * k);
        }
        if (u.sonneKlar) u.sonneKlar.value = 1 / Math.max(tint.lightMul, 1e-3);
    }

    // Stern-Feld: die Dämmerung setzt die Grenzgröße (Physik der Sichtbarkeit, nie ein Nacht-Faktor; der Kanal `grenze` der
    // EINEN Tag-Achse), das Wetter dämpft (Wolken); die Uniforms leben in state.starFieldUniforms.
    _dayNightApplyStarField(achse, skyMul) {
        // Kein Punkt sichtbar (die Grenzgröße liegt über dem hellsten Punkt des Tags — Stern, Veränderlicher oder Planet der
        // Kosmos-Funktion —, unter Wolken ist die Deckkraft 0): das Feld zeichnet nicht — es zog am Tag zwei Befehle für ein
        // schwarzes Bild (Band-Linse, Mess-Wiese, Welle 6) — und sein Bau wartet, solange das erste Bild keinen zeigt
        // (`_tickBootFernDeko`): die EINE Frage für beide
        const k = this._kosmosJetzt();
        const zeigt = (this._sterneZeigen = skyMul > 0 && achse.grenze - k.zeit.hellste + 0.5 > 0);
        // ein neuer Samen (Welt-Wechsel): das Feld zeigt den Himmel der neuen Saat; eine neue Stufe des Tags: Planeten und
        // Veränderliche ziehen nach
        if (this.state.starField && this.state.starField.userData.kosmos !== k) this._buildStarField();
        this._kosmosBand(k);
        this._sternDrehung();
        const sf0 = this.state.starField;
        if (sf0 && sf0.userData.t !== k.t) this._kosmosFeldZeit(sf0, k);
        const u = this.state.starFieldUniforms;
        if (!u || !u.opacity) return;
        u.opacity.value = skyMul;
        u.grenze.value = achse.grenze;
        // das Pixel: ein Pixel des Ziels, in das die Szene zeichnet, auf der Stern-Kugel (Blickfeld ÷ Zeilen × Radius) — das
        // Szenen-Ziel der Post-Kette, ohne sie der Zeichenpuffer (`_schirm`); bis hier blieb es ohne Szenen-Ziel ungeschrieben
        const cam = this.state.camera;
        const ziel = this.state.scenePass && this.state.scenePass.renderTarget;
        const zeilen = ziel && ziel.height > 0 ? ziel.height : this._schirm().hoehe;
        if (cam && zeilen > 0) u.pixel.value = ((2 * Math.tan((cam.fov * Math.PI) / 360)) / zeilen) * u.radius;
        // das Auge aus der Grenzgröße und dem Pixel (stern-sicht)
        u.auge.value = AnazhRealm._sternAuge(achse.grenze, u.pixel.value, u.radius);
        const sf = this.state.starField;
        if (sf) sf.visible = zeigt;
    }

    // DER DURCHLASS ZUM MOND (S7): derselbe Durchlass der EINEN Atmosphäre wie zur Sonne (`ATMO_RECHNUNG.durchlass`, das Medium
    // jetzt, die Höhe des beleuchteten Orts), in seiner Höhe y = sin(Höhe) relativ zum Zenit — die Eichung des Mondlichts (`MOONLIGHT`) gilt
    // dem hohen Mond, am Horizont geht er durch die ganze Luft (unter ihm 0). Bis S7 ein eigener Horizont-Fade (smoothstep bis 8°).
    _mondDurchlass(y) {
        const R = this._atmoRechnung();
        const M = this._atmoMediumJetzt();
        const h = this._atmoOrtKm();
        const N = AnazhRealm.ATMO_LUT.schritte.durchlass;
        const T = this._mondT || (this._mondT = [0, 0, 0]);
        const lum = (t) => 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
        const z = lum(R.durchlass(M, h, 1, N, T));
        return z > 0 ? lum(R.durchlass(M, h, y, N, T)) / z : 0;
    }

    // DirectionalLight: Position folgt dem Spieler (Shadow-Frustum zentriert), Target am Spieler-Boden,
    // Color = lightColor × lightMul, Intensity aus dem akkumulierten lightIntensity.
    // Stable Shadow Maps: der Fokus wird auf das Shadow-Texel-Grid gesnappt (Light-Space-Snap unten),
    // sonst „kriecht" das Schatten-Muster bei jeder Sub-Texel-Bewegung über statische Geometrie.
    _dayNightApplyDirectionalLight(sunDir, tint, moonDir, atm, achse) {
        const dl = this.state.directionalLight;
        const pm = this.state.playerMesh;
        const lightDist = 200;
        // Das Richtlicht IST die Sonne, solange sie über dem Horizont steht, sonst der Mond (von oben).
        // Der Wechsel bei y=0 ist unsichtbar: beide Körper erreichen den Horizont durch die ganze Luft (der Durchlass der EINEN
        // Atmosphäre ist dort ~0, `_atmoSonne` · `_mondDurchlass`).
        // `moonDir` kommt vom Aufrufer (_applyDayNightToScene, dieselbe Formel wie das Mond-Mesh); der
        // −sunDir-Guard deckt nur Diag-Aufrufe ohne dritten Parameter.
        const sunUp = sunDir.y >= 0;
        const md = moonDir || { x: -sunDir.x, y: -sunDir.y, z: -sunDir.z };
        const lightDir = sunUp ? sunDir : md;
        let focusX = pm ? pm.position.x : 0;
        let focusY = 0;
        let focusZ = pm ? pm.position.z : 0;
        if (pm && dl.shadow && dl.shadow.camera && dl.shadow.mapSize) {
            const sc = dl.shadow.camera;
            const shadowWidth = sc.right - sc.left; // typisch 600 (±300)
            const shadowMapSize = dl.shadow.mapSize.width; // typisch 2048
            if (shadowWidth > 0 && shadowMapSize > 0) {
                const texelSize = shadowWidth / shadowMapSize; // ~0.293 m bei 600/2048
                // LIGHT-SPACE Texel-Snap: das Shadow-Texel-Grid liegt in der Ebene ⟂ sunDir, nicht in Welt-X/Z
                // (ein Welt-Snap lässt bei schräger Sonne bis ~1 Texel Rest-Swimming). focus auf die Lateral-
                // Achsen projizieren, dort snappen, zurück in Welt-Space → jeder Texel trifft denselben Punkt.
                // Die Basis spiegelt EXAKT Three.js' Matrix4.lookAt der Shadow-Camera (z=sunDir, x=up×z, y=z×x;
                // up=(0,1,0), Zenit-Fallback (0,0,1)); allokationsfreie Skalar-Mathematik.
                const sl = Math.hypot(lightDir.x, lightDir.y, lightDir.z) || 1;
                const sx = lightDir.x / sl;
                const sy = lightDir.y / sl;
                const sz = lightDir.z / sl;
                const zenith = Math.abs(sy) > 0.999;
                const uy = zenith ? 0 : 1;
                const uz = zenith ? 1 : 0;
                // xAxis = normalize(up × sunDir)   (up = (0, uy, uz))
                let axx = uy * sz - uz * sy;
                let axy = uz * sx;
                let axz = -uy * sx;
                const axl = Math.hypot(axx, axy, axz) || 1;
                axx /= axl;
                axy /= axl;
                axz /= axl;
                // yAxis = sunDir × xAxis   (Einheit: sunDir ⟂ xAxis, beide normiert)
                const ayx = sy * axz - sz * axy;
                const ayy = sz * axx - sx * axz;
                const ayz = sx * axy - sy * axx;
                // focus (focusX, 0, focusZ) auf die Lateral-Achsen projizieren +
                // auf das Texel-Grid snappen (focusY=0 → die axy/ayy-Terme entfallen)
                const fa = focusX * axx + focusZ * axz;
                const fb = focusX * ayx + focusZ * ayz;
                const dFa = Math.round(fa / texelSize) * texelSize - fa;
                const dFb = Math.round(fb / texelSize) * texelSize - fb;
                focusX += dFa * axx + dFb * ayx;
                focusY += dFa * axy + dFb * ayy;
                focusZ += dFa * axz + dFb * ayz;
            }
        }
        dl.position.set(
            focusX + lightDir.x * lightDist,
            focusY + lightDir.y * lightDist,
            focusZ + lightDir.z * lightDist
        );
        if (dl.target) {
            dl.target.position.set(focusX, focusY, focusZ);
            dl.target.updateMatrixWorld();
        }
        // Sonne (warm) ODER Mond (kühl), je nach stehendem Körper; seine Helligkeit ist sein Durchlass durch das EINE Medium —
        // kein eigener Horizont-Fade (S7: bis dahin dimmte ein smoothstep bis 8° die Physik ein zweites Mal).
        // Farbe: `atm.col` (der Durchlass der EINEN Atmosphäre) × `tint.lightColor` (weiß + Aura/Emotion).
        // Intensität = KEY_BASE·atm.lum·tint.lightIntensity: die Physik trägt die Tageskurve allein, der Tint
        // (Wetter-lightMul + Emotion) moduliert; die Füllung neben ihm ist allein die Himmels-Umgebung.
        const a = atm || this._atmoSonne(sunDir.y);
        if (sunUp) {
            dl.color.setRGB(a.col.r * tint.lightColor.r, a.col.g * tint.lightColor.g, a.col.b * tint.lightColor.b);
            // das gesamte Licht der Wetter-Zeile (`lightIntensity`) × der Anteil, den die Decke direkt lässt (`direkt`); bis
            // w28-licht-regen lightMul in Farbe UND Stärke (lightMul²) ohne Anteil — der harte Schatten stand im Regen
            dl.intensity = AnazhRealm.KEY_BASE * AnazhRealm.LEGACY_LICHT * a.lum * tint.lightIntensity * tint.direkt;
        } else {
            const M = AnazhRealm.MOONLIGHT;
            // Mond-Pfad: Richtung aus der EINEN Quelle, Intensität MOONLIGHT·Wetter·sein Durchlass; `atm.col`
            // färbt ihn nur (unter dem Horizont lerpt sie zum MOONLIGHT-Hue).
            dl.color.setRGB(a.col.r, a.col.g, a.col.b);
            // V18.378 — der Durchlass liest die ECHTE Mond-Höhe (md.y), nicht −sunDir.y (die
            // z-Bogen-Formel gibt dem Mond eine eigene Normierung → eigene Höhe).
            dl.intensity = M.intensity * tint.lightMul * tint.direkt * this._mondDurchlass(md.y);
        }
        // `nightFactor` 0 = Tag → 1 = Nacht: das Auge der Nacht der Post-Kette (K66, mesopisch) liest ihn — am Tag fällt es. Es
        // ist das Auge der EINEN Tag-Achse (`tag`): es gleitet über die Sonnenhöhe vom Tag in die Nacht (mit
        // dem Rest der Dämmerung gemessen nahm es der Wiese 0,1–0,2 EV der Dämmerung, und ihr Schritt zur goldenen Stunde riss).
        if (this.state.postProcessingUniforms && this.state.postProcessingUniforms.nightFactor) {
            const ac = achse || this._tagAchse(sunDir.y);
            this.state.postProcessingUniforms.nightFactor.value = 1 - ac.tag;
        }
        // Die MeshToonNodeMaterials (lights=true) lesen dl.color/intensity/position direkt über die
        // WebGPU-Lighting-Pipeline — kein eigener Uniform-Sync. Nur die Gras-Translucency braucht die
        // Richtung als Uniform (uSunDir): EINE Quelle = derselbe Vektor wie das Richtlicht (aktiver Körper).
        if (this.state.windUniforms && this.state.windUniforms.uSunDir) {
            this.state.windUniforms.uSunDir.value.set(lightDir.x, lightDir.y, lightDir.z).normalize();
        }
        // V17.2 — derselbe sunDir speist den Wolken-Glow im Skybox-Shader
        // (golden-hour-Rand zur Sonne hin). EINE Quelle, drei Konsumenten.
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.sunDir) {
            this.state.skyboxUniforms.sunDir.value.copy(sunDir).normalize();
        }
        // W9 — die Wolken-Beleuchtung des Studio-Gesetzes liest den Farbton der Sonne aus dem Durchlass der EINEN
        // Atmosphäre (`_atmoSonne`; nachts der Mond-Hue — die Nacht-Wolken folgen gratis), ihre Stärke liest die Kuppel
        // aus den Tafeln. Raw als linear (r128-Gesetz).
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.sunCol && a && a.col) {
            this.state.skyboxUniforms.sunCol.value.setRGB(a.col.r, a.col.g, a.col.b);
        }
    }

    // DIE BELICHTUNG AUS DEM LICHT (licht.K1, H1): die Kamera ist ein Gesetz in Blenden-Stufen. Sie misst die Beleuchtungsstärke
    // einer waagrechten Fläche des Orts (`_waagrechtIrradianz`: die Sonne mit dem Sinus ihrer Höhe, der Himmel der Bestrahlungs-
    // Tafel der EINEN Atmosphäre — der Lichtmesser mit der Kalotte nach oben, dieselbe Größe, die die REF-Kurve aus
    // gemessener Beleuchtungsstärke trägt, spec/farbe/tag-ref.json) und legt die 18-%-Karte unter der Zenit-Sonne der klaren Luft
    // auf Mittelgrau (`zielKarte`, der absolute Anker des Mittags). Die Stufen gegen den Anker (`_belichtungStufen`) sind
    // die EINE Kurve der Kamera über die Sonnenhöhe (`_tagAchse`): am Tag folgt sie dem Licht mit der Kompensations-Steigung
    // (Frostbite: Kompensation statt voller Adaption), in der Dämmerung tragen die Stufen der Tag-Achse — dort hält die Welt ihr
    // Licht (die Himmels-Umgebung und der Mond), das Bild fällt gleichmäßig in der Sonnenhöhe zur lesbaren Nacht.
    // Bis H1 stand die sonnenzugewandte Karte auf Mittelgrau + 1 EV, das Auge folgte ihrem Licht mit 0,34 und glitt ab ~14,5°
    // zum Deckel der Nacht: die Sonne in 7° stand an der Wiese einmal 0,16, einmal 1,29 EV unter dem Mittag (Radeon).
    _dayNightApplyBelichtung(achse) {
        if (achse) {
            const k = this._belichtungAusLicht(achse.e);
            this._raumBlendeTakt();
            if (k == null) return;
            this._belichtungGesetz = k;
            // die Belichtung steht erst mit der Sicht des Bildes (`_bildSichtSteht`, laub-messer): der Messer misst die Schatten der
            // Stunde am Bild, seine Lesung kommt ein bis zwei Bilder später — der Ladeschirm der Ankunft weicht nach der Lesung
            // (`_weltbildLuecken`, Term „licht“), nie mit der Belichtung ohne Schatten; steht sie einmal, bleibt der Term zu
            if (!this.state._belichtungSteht) this.state._belichtungSteht = this._bildSichtSteht();
        }
        // die Blende eines Beobachters (`_blendeBestellen`) über dem Gesetz: fest `k` oder das Gesetz mal `mal` — ohne Gesetz (eine
        // Bühne ohne Himmel des Orts) die Blende, die vor der Bestellung stand
        const b = this._messBlende,
            g = this._belichtungGesetz > 0 ? this._belichtungGesetz : b && b.vor > 0 ? b.vor : null;
        const k = b && b.k != null ? b.k : g != null ? g * (b ? b.mal : 1) : null;
        if (k != null && this.state.renderer) this.state.renderer.toneMappingExposure = k;
    }

    // DIE BLENDE DES BEOBACHTERS: eine Messung STELLT die Belichtung nie selbst, sie bestellt sie bei der Welt — `{ k }` hält sie
    // fest (die Tonkurve an einer bekannten Blende), `{ mal }` legt einen Faktor über das Gesetz der Kamera, `null` gibt sie dem
    // Gesetz zurück (ohne Gesetz der Blende vor der ersten Bestellung); geschrieben wird sofort und an jedem Anwenden des Tags
    // über den EINEN Schreiber (`_dayNightApplyBelichtung`). Bis beobachter-ein-weg schrieben drei Licht-Linsen den Renderer
    // selbst (eine hüllte dazu den Schreiber der Welt). gate:post-kette (Radeon): ohne Rückgabe an die Blende davor stand die
    // Bühne ohne Himmel nach der Flamme bei k 20 000, der Saum sah 0 statt 36 Kanten-Pixel.
    _blendeBestellen(o) {
        const vor = this._messBlende ? this._messBlende.vor : this.state.renderer.toneMappingExposure;
        const zahl = (x, n) => (x != null ? Number(x) : n);
        this._messBlende = { k: o ? zahl(o.k, null) : null, mal: o ? zahl(o.mal, 1) : 1, vor };
        this._dayNightApplyBelichtung(null);
        if (!o) this._messBlende = null;
    }

    // DIE BELICHTUNG DES ORTS bei der Sonnenhöhe e (sin): das Gesetz der Kamera aus dem Licht, das jetzt gilt — null, solange
    // Renderer, Richtlicht, der Himmel des Orts oder der Anker fehlen (dann schreibt niemand)
    _belichtungAusLicht(e) {
        const st = this.state;
        if (!st.renderer || !st.directionalLight) return null;
        const w = this._waagrechtIrradianz(this._belichtungE || (this._belichtungE = [0, 0, 0]));
        this._belichtungGelesen = !!w;
        const EA = w && this._belichtungAnker();
        if (!EA) return null;
        // DER MESSER LIEST DIE LICHTER DES ORTS (nacht-lichter): zum Himmel die Plätze des Licht-Pools auf derselben waagrechten
        // Fläche am Auge (`_poolAmAuge`) — unter der Laterne schließt die Blende, wie das Auge es tut. `_belichtungE` bleibt die
        // Lesung des Himmels (Regen, Raum und Wurf lesen sie).
        const wp = this._poolAmAuge(w, this._belichtungMitPool || (this._belichtungMitPool = [0, 0, 0]));
        // das Gesetz der Kamera (welt-licht.js `belichtung`) mit den Stufen am Glied der Welt (die Linsen prüfen ihren Schein dort)
        // und dem Boden des Messers: der Vollmond (er steht der Sonne gegenüber, Höhe −e) ohne Wolken-Decke zu dieser Stunde,
        // derselbe Durchlass wie sein Richtlicht (`_dayNightApplyDirectionalLight`) — unter offenem Himmel liegt er nie über dem Licht
        const k = __weltLicht.belichtung(
            wp,
            EA,
            e,
            (h, q) => AnazhRealm._belichtungStufen(h, q),
            AnazhRealm.BELICHTUNG,
            e < 0 ? -e * this._mondDurchlass(-e) : 0
        );
        // DER RAUM AM AUGE (w28-innenlicht): unter einer Decke misst die Kamera das Licht des Raums — das Licht von draußen ×
        // F (`_raumBlendeTakt`: das Raum-Licht der Decke × der Anteil des Himmels am Licht, die Sonne erreicht den Messer im
        // Raum nicht), `_raumStufen` = log2 F. Dasselbe Gesetz der Kamera wie für jedes Licht des Tags, dasselbe Glied wie das
        // Licht des Auges in der Höhle (`_augenLichtStaerke`): sie gleicht 1 − `steigung` der fehlenden Stufen NICHT aus — die
        // Karte im Raum zeigt 2^(Stufen des Tags für F) der Karte draußen, zu jeder Stunde (nachts ohne Lampe dunkler als die Nacht).
        const s = this._raumStufen || 0;
        if (!(s < 0)) return k;
        return k * 2 ** (AnazhRealm._belichtungStufen(AnazhRealm.BELICHTUNG.gleitung[0], 2 ** s) - s);
    }

    // DIE BLENDE DES RAUMS (je Takt, hinter der Belichtung): das Ziel sind die Stufen des Raums am Auge (`_raumAmAuge`, null
    // unter offenem Himmel: 0) × der Anteil des Himmels am gemessenen Licht (`_belichtungSonne`, die Lesung dieses Takts); die
    // Blende folgt ihm mit τ = `RAUM.blendeS` in Stufen (ins Helle `RAUM.blendeHellS`, das Auge schließt schneller, als es sich öffnet; kein Sprung an der
    // Schwelle, kein Pumpen: EIN Tiefpass erster Ordnung, er schwingt nicht über), auf der Wanduhr (auf 0,25 s gekappt). Ein Sprung des Auges über `RAUM.sprungM` in
    // einem Takt nimmt das Ziel sofort — die Sonde, das Wort, die Ankunft lesen nie die Blende des Orts von vorher. Die Gerätezeit
    // (spec/uhr/geraetezeit.json, Grund `laden`): ein Gang zum Fixpunkt, sein Ende ist dasselbe — auch unter der Bühne, die die Bild-Uhr hält.
    _raumBlendeTakt() {
        const st = this.state;
        const R = AnazhRealm.RAUM;
        const jetzt = performance.now();
        const dt = Math.min(0.25, Math.max(0, (jetzt - (this._raumBlendeZeit ?? jetzt)) / 1000));
        this._raumBlendeZeit = jetzt;
        // der Dach-Pool folgt dem Auge auch in der trockenen Welt: bis w28-innenlicht wählte ihn nur der Takt der Nässe, und der
        // schläft ohne Regen (feld.K3) — die Decken standen, wo das Auge beim letzten Regen war
        this._dachTakt();
        const dl = st.directionalLight;
        const [w0, so0] = [this._belichtungGelesen ? this._belichtungE : null, this._belichtungSonne];
        const lu = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        const hi = w0 && so0 ? lu(w0) - lu(so0) : 0;
        // q: E der Sonne senkrecht zu ihr gegen E des Himmels auf der waagrechten Karte (die Lesung dieses Takts)
        // g: der Boden vor dem Haus gegen den Himmel — die untere Hälfte der Öffnung sieht den Boden im Licht der Stunde. Die Quelle
        // ist der Boden der EINEN Atmosphäre (`rueckstrahlLeser.atmo`, schatten.K4: die Umgebung nach unten × das Licht jetzt, eine
        // Strahldichte — × π ihre Bestrahlung), nicht der gezeichnete Boden im Bild: der hängt am Blick, und im Raum läse er die Diele.
        // Gemessen (GTX, Mittag, Start-Dorf): Atmosphäre 0,254 × π gegen Himmel 1,33 → g 0,60 (der gezeichnete Boden 0,428: 1,01).
        const RL = st.rueckstrahlLeser;
        const bo = RL ? RL.atmo.value : null;
        const g = bo && hi > 0 ? Math.min(2, Math.max(0, (Math.PI * lu([bo.x, bo.y, bo.z])) / hi)) : 0;
        st.raumBoden = g;
        this._raumSonneTakt(
            dl && hi > 0 ? (lu([dl.color.r, dl.color.g, dl.color.b]) * dl.intensity) / hi : 0,
            this._belichtungRichtung,
            g
        );
        const D = this._raumAmAuge();
        const w = this._belichtungGelesen ? this._belichtungE : null; // ohne Lesung des Himmels hält die Blende ihr Ziel am Raum allein
        const so = this._belichtungSonne;
        const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        const himmel = w && so && luma(w) > 0 ? Math.max(0, 1 - luma(so) / luma(w)) : 1;
        // die Kamera öffnet nie weiter als für ihre Nacht (der tiefste Knoten von `BELICHTUNG.stufen`, wie das Licht des Auges
        // in der Höhle): darunter fällt der Raum mit seinem Licht — der Raum ohne Öffnung bleibt dunkel, kein Rest-Licht brennt aus
        const B = AnazhRealm.BELICHTUNG;
        const tief = B.stufen[B.stufen.length - 1][1] / (1 - B.steigung);
        // DER MESSER IM RAUM mittelt, was in seinem Feld liegt: das Licht des Raums UND seine Öffnungen (`_raumFeldAmAuge`, der
        // Anteil der Öffnungen an der Oberfläche × Durchlass) — die Belichtung hält die Öffnung lesbar, der Raum ohne Öffnung misst nur sich
        const ziel =
            D == null ? 0 : Math.max(tief, Math.log2(Math.max(1e-9, (D + (this._raumFeldAmAuge || 0)) * himmel)));
        const p = st.camera && st.camera.position;
        const o = this._raumBlendeOrt || (this._raumBlendeOrt = new THREE.Vector3(NaN, NaN, NaN));
        const sprung = !p || !(o.distanceTo(p) <= R.sprungM);
        if (p) o.copy(p);
        const s = this._raumStufen || 0;
        const n = sprung ? ziel : s + (ziel - s) * (1 - Math.exp(-dt / (ziel > s ? R.blendeHellS : R.blendeS)));
        this._raumStufen = Math.abs(n - ziel) < 1e-3 ? ziel : n;
        st.raumAmAuge = D;
    }

    // DIE STUFEN DER KAMERA (rein): die Blenden-Stufen der 18-%-Karte gegen den Anker bei der Sonnenhöhe h (Grad) und dem Licht q
    // (E gegen den Anker). Über `gleitung[0]` die Steigung: log2 q × (1 − `steigung`); unter `gleitung[1]` die Stufen der
    // Tag-Achse (`stufen`, linear in h zwischen den Knoten, außen gehalten); dazwischen linear in h gemischt. Die Linse rechnet
    // die Kurve aus demselben Glied (scripts/lib/licht-linsen.cjs `tagGesetzKurve`).
    static _belichtungStufen(h, q) {
        return __weltLicht.belichtungStufen(h, q, AnazhRealm.BELICHTUNG);
    }

    // DER ANKER DER KAMERA (S7, H1): E der waagrechten Karte unter der Zenit-Sonne der klaren Luft — E0 (`KEY_BASE` · `LEGACY_LICHT`) × (ihr
    // Durchlass, `ATMO_RECHNUNG.sonne`, e = 1, Bezug der Luft, + der Himmel der Bestrahlungs-Tafel derselben Luft, ihr `anker`).
    // Eine Größe des Gesetzes, EINMAL gerechnet, sobald die Tafel liegt (vorher null: die Belichtung schreibt nicht, das erste
    // Weltbild wartet, `_weltbildLuecken` licht), gemerkt an der Tafel (`belichtung`, `_atmoLutBau`); der Null-Renderer malt keinen
    // Himmel (Lehre 16), dort trägt die Karte keinen.
    _belichtungAnker() {
        const A = this.state.atmoLut;
        if (!A) return null;
        if (A.belichtung) return A.belichtung;
        const rend = this.state.renderer;
        const himmel = rend && rend._isHeadlessNull ? 0 : A.anker;
        if (himmel == null) return null;
        return (A.belichtung = __weltLicht.belichtungAnker(this._atmoGesetz(), this._atmoRechnung(), himmel));
    }

    // DAS LICHT DES AUGES (K02a, Auge 11 bei 762/−138): wo der Himmel das Auge nicht erreicht, trägt der Leib sein Licht. Die
    // Höhle der Boden-Funktion bekommt kein Himmels-Licht (gelaende-core `himmelsSicht`), und 40 m hinter der Mündung erreicht sie auch
    // keine Sonne — die Ich-Sicht war schwarz (Helligkeit 0). Das Licht steht am Auge (die Kamera), seine Stärke folgt dem
    // Anteil des Himmels, der fehlt (`_himmelAmAuge`: das Auge adaptiert — unter dem Himmel bleibt jede Höhle dunkel), und
    // ist so geeicht, dass die 18-%-Karte in `AUGEN_LICHT.karteM` dasselbe Mittelgrau zeigt wie am Mittag (die Belichtung
    // aus dem Licht: L = 0,18/π · E · Belichtung = zielKarte; der Abfall des EINEN Punktlicht-Gesetzes, fachwerk `lichtAbfall`).
    // Es ist ein PLATZ DES LICHT-POOLS mit Himmels-Ersatz (K11, `_leuchtTakt`): kein Szenen-Licht (K15), kein eigener Term —
    // es trägt nur, wo der Himmel fehlt (der Boden mit 1 − aHimmel), seine Stärke als `L.cd` = Welt-Einheiten × `EINHEIT_LX`,
    // die `_leuchtStaerke` zurückteilt wie bei jeder Quelle (EINE Skala). Unter dem Himmel ist es aus (`_augenLeuchte` null).
    _dayNightApplyAugenLicht() {
        const st = this.state;
        const cam = st.camera;
        const h = cam ? this._himmelAmAuge(cam.position.x, cam.position.y, cam.position.z) : 1;
        st.himmelAmAuge = h;
        const A = AnazhRealm.AUGEN_LICHT;
        const k = st.renderer && st.renderer.toneMappingExposure > 0 ? st.renderer.toneMappingExposure : 1;
        const I = AnazhRealm._augenLichtStaerke(h, k);
        if (!(I > 1e-4)) {
            this._augenLeuchte = null;
            return;
        }
        const q =
            this._augenLeuchte ||
            (this._augenLeuchte = {
                quelle: "auge",
                L: {
                    kelvin: A.kelvin,
                    cd: 0,
                    reichweiteM: A.reichweiteM,
                    abfall: A.abfall,
                    kernM: A.kernM,
                    ersatz: true,
                },
                masse: 1,
                phase: 0,
            });
        q.L.cd = I * __weltLicht.EINHEIT_LX; // eine Bild-Größe an k (`_augenLichtStaerke`, in Welt-Einheiten) — der Pool teilt sie zurück
    }

    // DIE STÄRKE DES AUGEN-LICHTS beim Himmel h am Auge und der Belichtung k (die EINE Quelle; gate:hoehlen-sicht (j) liest sie):
    // DAS AUGE ADAPTIERT WIE DIE KAMERA (w12-unterwasser, leib.K3) — es gleicht nur 1 − `BELICHTUNG.steigung` des fehlenden Himmels
    // aus: die Karte zeigt 2^n des Mittags, n die Stufen der Kamera am Tag (`_belichtungStufen` über der Gleitung) für das Licht h,
    // nie unter ihrer Nacht (der tiefste Knoten von `BELICHTUNG.stufen`) — das Licht trägt, was der Himmel (h) dazu nicht trägt. Die
    // Höhle ohne Himmel fällt so auf die lesbare Nacht der Kamera (0,22 der Karte). Bis w12-unterwasser glich es das Fehlende ganz
    // aus (1 − h): die 18-%-Karte zeigte in jeder Höhle das Mittags-Grau, die Höhle trug keinen Licht-Abfall.
    static _augenLichtStaerke(h, k) {
        const B = AnazhRealm.BELICHTUNG;
        const A = AnazhRealm.AUGEN_LICHT;
        const n = Math.max(
            AnazhRealm._belichtungStufen(B.gleitung[0], Math.max(h, 1e-6)),
            B.stufen[B.stufen.length - 1][1]
        );
        return (
            (Math.max(0, 2 ** n - h) * ((B.zielKarte * Math.PI) / 0.18)) /
            (k * globalThis.__fachwerkCore.lichtAbfall(A, A.karteM))
        );
    }

    // DER HIMMEL AM AUGE (0…1): der Anteil des Himmels-Lichts am Ort (x, y, z) — gelesen von der Himmels-Sicht des Bodens
    // (`aHimmel`) um ihn, gewichtet 1/(d² + ¼) im Umkreis `AUGEN_LICHT.umkreisM`. Steht der Ort in keiner Luft-Box eines
    // Höhlen-Knotens (`_hoehlenKnoten`, dieselbe Probe wie die Höhlen-Sicht), ist er Himmels-Luft: 1. Die Kosten folgen dem
    // Auge: nur in einer Höhlen-Box, nur die Zellen im Umkreis, neu erst nach `AUGEN_LICHT.neuM` Weg oder neuem Boden.
    _himmelAmAuge(x, y, z) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get("boden") : null;
        if (!s || !s.hoehle) return 1;
        const A = AnazhRealm.AUGEN_LICHT;
        const c = this._himmelAugeMerk || (this._himmelAugeMerk = { x: NaN, y: NaN, z: NaN, boden: -1, wert: 1 });
        const dx0 = x - c.x,
            dy0 = y - c.y,
            dz0 = z - c.z;
        if (c.boden === s.hoehle.boden && dx0 * dx0 + dy0 * dy0 + dz0 * dz0 < A.neuM * A.neuM) return c.wert;
        c.x = x;
        c.y = y;
        c.z = z;
        c.boden = s.hoehle.boden;
        const v = this._himmelAugeV || (this._himmelAugeV = new THREE.Vector3());
        v.set(x, y, z);
        const span = this._voxelChunkConfig(0).span;
        const cx = Math.floor(x / span),
            cz = Math.floor(z / span);
        const um = [];
        let drin = false;
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                const b = s.bloecke.get(cx + dx + "," + (cz + dz));
                if (!b) continue;
                um.push(b);
                if (!drin && b.hoehle)
                    for (const kn of b.hoehle.knoten) if (kn.luft && kn.luft.containsPoint(v)) drin = true;
            }
        if (!drin) return (c.wert = 1);
        const P = s.geom.attributes.position.array;
        // die Himmels-Sicht reist im Satz in der vierten Komponente des Normal-Ziels (snorm8, K51-2 `_chunkSatzArt` boden)
        const H = s.geom.attributes.aNormalZiel.array;
        const R2 = A.umkreisM * A.umkreisM;
        let summe = 0,
            gewicht = 0;
        for (const b of um)
            for (const zl of b.zellen) {
                if (zl.huelle.isEmpty() || zl.huelle.distanceToPoint(v) > A.umkreisM) continue;
                const I = zl.idx;
                for (let i = 0; i < I.length; i++) {
                    const o = I[i] * 3;
                    const ddx = P[o] - x,
                        ddy = P[o + 1] - y,
                        ddz = P[o + 2] - z;
                    const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
                    if (d2 > R2) continue;
                    const w = 1 / (d2 + 0.25);
                    summe += (w * H[I[i] * 4 + 3]) / 127;
                    gewicht += w;
                }
            }
        return (c.wert = gewicht > 0 ? summe / gewicht : 1);
    }

    // DIE BESTRAHLUNG EINER WAAGRECHTEN FLÄCHE (rgb, E): Sonne/Mond auf der Waagrechten + der Himmel über dem Ort
    // (`_himmelsBestrahlung`, synchron aus der Bestrahlungs-Tafel der EINEN Atmosphäre) — dieselben Lichter,
    // die jedes Material liest. Die Rechnung der Belichtung (die 18-%-Karte); null, solange der Himmel des Orts noch nicht steht.
    // DIE TAFEL IM FLUG (licht.K5): jede Stufe des Mediums zeichnet die Tafel neu, ihre Lesung kommt Takte später. Bis dahin trägt
    // der Himmel der letzten Lesung je Einheit des Lichts (E0 · Tönung, jetzt) die Belichtung — nur solange das Auge in der Höhen-
    // Stufe der Tafel blieb und das Medium höchstens `ATMO_LUT.flug` Stufen wanderte; jeder Sprung (Höhe, Ort, ein Wort ohne
    // Übergang) liest nie die Luft von vorher: null, die Belichtung hält. Bis licht.K5 hielt sie an JEDER Stufe — im Zug klar →
    // Regen stand sie in den Takten ohne Lesung (die Linse: 10 je Spiel-Sekunde) still, das Richtlicht sank weiter, und sie holte
    // in einem Schlag auf (+0,109 EV in einer Sekunde, swiftshader). DER FLUG IST DIE LETZTE ANGEKOMMENE TAFEL (`tafelFlug`, mit
    // der Luft, in der sie gezeichnet wurde), nie eine Erinnerung des Lesers: bis zur Nachbesserung merkte sich die Belichtung den
    // Himmel nur, wenn sie die Tafel selbst gelesen hatte. Seit die Leine die Tafeln fragt (w4-affekt 511a4d50), zeichnet der
    // freie Takt die gestaute Stufe neu, ehe die Belichtung liest — jede angekommene Lesung fiel ungelesen, der Flug riss nach
    // 8 Stufen, die Belichtung stand den ganzen Übergang still und holte am Ende in einem Schlag auf (licht.K5#1, Radeon und GTX:
    // 1,387 EV/s, Hub klar ↔ Regen 1,83 statt 0,79 EV).
    _waagrechtIrradianz(out) {
        const st = this.state;
        const dl = st.directionalLight;
        out[0] = out[1] = out[2] = 0;
        if (!dl) return out;
        const dir = this._belichtungRichtung || (this._belichtungRichtung = new THREE.Vector3());
        dir.copy(dl.position);
        if (dl.target) dir.sub(dl.target.position);
        const dy = dir.lengthSq() > 0 ? Math.max(0, dir.normalize().y) : 0;
        const add = (c, k) => {
            out[0] += c.r * k;
            out[1] += c.g * k;
            out[2] += c.b * k;
        };
        // DER EMPFÄNGER IST DIE WAAGRECHTE 18-%-KARTE (M1, der Anker des Mittags): die Sonne mit dem Sinus ihrer Höhe × die Sicht
        // des BILDES (M2, `_bildSonnenSicht`: der Schatten, den das Bild in seiner unteren Hälfte zeichnet — Kaskaden, Horizont
        // und Wolke aus derselben Schatten-Funktion wie jeder Stoff, als Flächen-Mittel). Bis laub-messer führte der Messer eine
        // eigene Gestalt der Welt (der Grat auf dem 32-m-Gitter, Ellipsen im Rahmen der Karten mit fester Dichte, der Boden als
        // Ebene unter dem Auge mit eigener Neigung): er sah einen anderen Schatten als das Bild, und die Belichtung lief ihm
        // beim Sonnenaufgang der Mess-Wiese um 0,12–0,16 EV je 0,002 der Uhr davon (Tag-Achse, Radeon, Kopf 6113b27e).
        add(dl.color, dl.intensity * dy * this._bildSonnenSicht());
        // der Anteil des Richtlichts an der Lesung (die Blende des Raums liest ihn: im Raum misst der Messer die Sonne nicht)
        const so = this._belichtungSonne || (this._belichtungSonne = [0, 0, 0]);
        if (out === this._belichtungE) [so[0], so[1], so[2]] = out;
        const he = this._himmelE || (this._himmelE = [0, 0, 0]);
        let himmel = this._himmelsBestrahlung(he);
        const A = st.atmoLut;
        const F = A && A.tafelFlug;
        if (
            !himmel &&
            F &&
            F.stufe === Math.round(A.U.hKm.value * 10) &&
            Math.abs(Math.log(A.mediumBeta / F.medium)) <=
                AnazhRealm.ATMO_LUT.flug * AnazhRealm.ATMO_LUT.mediumStufe + 1e-9
        )
            himmel = this._himmelsBestrahlung(he, true);
        if (!himmel) return null;
        out[0] += himmel[0];
        out[1] += himmel[1];
        out[2] += himmel[2];
        return out;
    }

    // Das Ambient der Nacht (`_dayNightApplyAmbient`, 0,04 × nacht samt Gefühls-Zuschlag) fiel in licht-eine-skala: eine Zahl
    // ohne Quelle, die jede Wand ohne Richtung trug — die Nacht nimmt ihr Licht aus der Himmels-Umgebung wie jede Stunde.

    // ═══ DIE LUFT (V18.530): die EINE Luftperspektive — Physik statt Kulisse ═══
    // Befund 04.10. (Blick-Tour, echte GPU, Mess-Wiese): der Nebel war eine lineare WAND an der Wald-Kante
    // (`fog.far = foliageRadius`, unter Last 60 m) — aus 45 m Höhe nach ~100 m nur Grau-Blau; er kaschierte die
    // Ring-Kante, die Fernform (Fern-Ring bis 8 km, Feld-Pass bis 40 km) war gebaut und unsichtbar. Jetzt trägt
    // die Ferne die Funktion, die Luft dunstet sie nur: Extinktion β (Koschmieder: Sichtweite V = −ln 0,02 / β)
    // aus reiner Luft (Rayleigh) + der Trübung des Wetters (fog-Kanal = Dunst, rain-Kanal = Niederschlag), mit
    // der Höhe exponentiell abnehmend (Dunst-Skalenhöhe), längs des Strahls ANALYTISCH integriert; die
    // In-Streuung ist der Horizont-Himmel + die Vorwärts-Keule der Sonne. EIN Knoten (`scene.fogNode`) für jedes
    // Material, der Feld-Pass ruft DIESELBEN Fn-Knoten, die Linsen lesen `_luftSichtM`.

    // Die Extinktion (1/m) am Bezugs-Niveau aus dem Wetter-Feld. Die Koeffizienten folgen aus den zwei
    // beobachtbaren Ankern (`LUFT.sichtKlarM` bei sunny, `LUFT.sichtSturmM` bei stormy) über DIESELBE
    // Wetter-Tabelle, die der Rest der Welt liest — kein freier Regler, ein neues Wetter-Wort erbt seine Luft.
    _luftBeta(wf) {
        const L = AnazhRealm.LUFT;
        const W = AnazhRealm.WEATHER_FIELD;
        const K = -Math.log(L.kontrast);
        const dunst = (K / L.sichtKlarM - L.betaRayleigh) / W.sunny.fog;
        const regen = (K / L.sichtSturmM - L.betaRayleigh - W.stormy.fog * dunst) / W.stormy.rain;
        const f = wf || this._weatherFieldFor();
        return L.betaRayleigh + Math.max(0, f.fog) * dunst + Math.max(0, f.rain) * regen;
    }

    // DAS SPEKTRUM DER LUFT (ferne-luft): die Extinktion je Kanal relativ zu β (550 nm, der Koschmieder-Anker) aus dem Medium
    // der EINEN Atmosphäre — Rayleigh je Kanal (`ATMO_GESETZ.rayleighTiefe`, blau ~5× rot) und das Aerosol je Kanal nach
    // Ångström (`ATMO_GESETZ.mieAngstroem`, blau 1,34 × grün, rot 0,76 ×): blau verlischt zuerst, mit der Weglänge wird die
    // Luft vor dem Fernen blau. Unter Wasser (`wasser`: der Körper seiner Art, `WASSER_GESETZ.koerper`) die Strahl-Schwächung c
    // je Kanal relativ zu β — rot verlischt zuerst. Bis w12-unterwasser das Spektrum der Look-Zahl `wK` (eine Absorption über der
    // normierten Tiefe des Studio-Spiegels, nie je Meter) und ein β aus einer Stamm-Sichtweite von 30 m (`LUFT.unterwasserM`) — das
    // Studio zog seinen Nebel auf 0,3–7,5 m: Labor ≠ Welt. Bis
    // ferne-luft löschte die Luft grau (EIN Skalar β), bis w4-ferne-blau trug das Aerosol kein Spektrum (Spektrum
    // 0,97/1/1,09 statt 0,74/1/1,40).
    _luftSpektrum(beta, wasser, out) {
        if (wasser) return out.set(wasser.c[0] / beta, wasser.c[1] / beta, wasser.c[2] / beta);
        const M = this._atmoMedium(beta);
        const k = 1000 * beta;
        return out.set((M.betaR[0] + M.mieExt[0]) / k, (M.betaR[1] + M.mieExt[1]) / k, (M.betaR[2] + M.mieExt[2]) / k);
    }

    // Die Sichtweite (m) eines waagrechten Blicks in der Augenhöhe `y` (Kontrast fällt unter `LUFT.kontrast`):
    // der CPU-Leser DERSELBEN Uniforms, die der Knoten liest (Linsen, Fern-Wasser-Reichweite); ohne Szene das Gesetz
    // selbst (`_luftBeta` auf dem Bezugsniveau). Eine fehlende Augenhöhe ist ein Aufrufer-Fehler, nie 0.
    _luftSichtM(y) {
        if (!Number.isFinite(y)) throw new Error("_luftSichtM: die Augenhöhe y fehlt (" + y + ")");
        const luft = this._luftEnsure();
        const L = AnazhRealm.LUFT;
        const K = -Math.log(L.kontrast);
        if (!luft) return K / this._luftBeta();
        const U = luft.U;
        const beta = U.beta.value * Math.exp(-(y - U.bezugY.value) / U.hoehe.value);
        return beta > 0 ? K / beta : Infinity;
    }

    // Die Luft-Knoten (EINMAL je Szene): Uniforms in der geteilten renderGroup (Observer-Diät-Pflicht-Paar),
    // `faktor(auge, punkt)` = 1 − e^{−τ} JE KANAL mit τ = β·s·e^{−(yAuge−y0)/H}·d·(1−e^{−k})/k (s = `_luftSpektrum`,
    // k = Δy/H, k→0: 1 − k/2), `farbe(auge, punkt)` = die Himmels-Sicht der EINEN Atmosphäre in Blickrichtung.
    // `scene.fogNode` ist der Leser jedes Materials (r184 `getFogNode`: es liest `output`), der Feld-Pass ruft dieselben
    // Fn; r184 `fog()` mischt mit `factor.toFloat()` — darum mischt der Knoten selbst, je Kanal.
    _luftEnsure() {
        const st = this.state;
        if (st.luft) return st.luft;
        if (typeof THREE === "undefined" || !st.scene) return null;
        const T = THREE.TSL;
        // Die Luft ist Pflicht jeder Szene: fehlen die TSL-Organe, ist der Vendor alt — laut, nie ein stiller Klar-Himmel
        // ohne Luft (und ohne Feld-Pass, der dieselben Knoten liest).
        if (!T || !T.output || !T.Fn || !T.uniform || !T.positionWorld || !T.cameraPosition)
            throw new Error("Die Luft: THREE.TSL trägt output/Fn/uniform/positionWorld/cameraPosition nicht (Vendor)");
        const L = AnazhRealm.LUFT;
        const A = this._atmoLutBau();
        const klar = this._luftBeta(AnazhRealm.WEATHER_FIELD.sunny);
        const U = this._uniformHeimatTeilen({
            beta: T.uniform(klar),
            spektrum: T.uniform(this._luftSpektrum(klar, null, new THREE.Vector3())),
            hoehe: T.uniform(L.skalenHoeheM),
            bezugY: T.uniform(0),
            farbe: T.uniform(new THREE.Color(0, 0, 0)),
            unterWasser: T.uniform(0),
            spiegelY: T.uniform(0),
            abfall: T.uniform(new THREE.Vector3(0, 0, 0)),
            // die optische Tiefe des Wegs zur Sonne am Boden je Art (Rayleigh, Mie; Leuchtdichte) — `_luftSonneTakt`
            sonneR: T.uniform(0),
            sonneM: T.uniform(0),
        });
        const faktor = T.Fn(([auge, punkt]) => {
            const v = punkt.sub(auge);
            const d = v.length();
            const k = v.y.div(U.hoehe);
            const klein = k.abs().lessThan(1e-3);
            const kSicher = T.select(klein, T.float(1e-3), k);
            const fk = T.select(
                klein,
                T.float(1).sub(k.mul(0.5)),
                T.float(1).sub(T.exp(kSicher.negate())).div(kSicher)
            );
            const hoehenTerm = T.exp(auge.y.sub(U.bezugY).div(U.hoehe).negate());
            const tau = U.beta.mul(U.spektrum).mul(hoehenTerm).mul(d).mul(fk);
            return T.vec3(1).sub(T.exp(tau.negate()));
        });
        // DIE IN-STREUUNG ist der Himmel selbst (D3): die Himmels-Sicht der EINEN Atmosphäre in Blickrichtung — zur Sonne hin
        // trägt sie die Mie-Keule des Aerosols aus der Phase (g des Gesetzes), am Horizont das Blau der Rayleigh-Streuung;
        // ein Blick unter den Horizont (auf das Gelände) liest den Horizont-Himmel (die In-Streuung längs eines langen
        // Wegs). Unter Wasser trägt `farbe` das Medium der Kamera.
        // DER LUFTSCHATTEN (ferne.K4; Hillaire 2020 „shadowed in-scattering“, UE/Frostbite Sky Atmosphere): wo die Luft zwischen
        // Auge und Punkt im Schatten des Grats liegt, streut die Sonne dort nicht hinein — nur Himmel und Mond (die Mehrfach-
        // streuung). Der Strahl liest die EINE Horizont-Karte (`_horizontSicht`) an `luftProben` Punkten, je Punkt gewogen mit
        // seinem Beitrag zur In-Streuung (der Abschnitt um ihn, Beer-Lambert exakt, dieselbe Extinktion wie `faktor`); die Farbe
        // verliert davon den Anteil der einfachen Streuung der Sonne (`himmelEinfach`, Alpha der Himmels-Sicht). Wo die Karte
        // ruht (ohne Gitter, unter dem Horizont), ist ihre Sicht 1; ohne Schatten-Karte des Renderers (kienspan) baut kein
        // Programm den Luftschatten (`_wirftImStoff`).
        // EINE Schleife (wie `falte` des Fels-Gesetzes, K17-3): der Zustand (τ, Summe, Licht) lebt in Variablen, je Durchlauf
        // EINE Abtastung der Karte — ausgeschrieben stand der Strahl achtmal in jedem Stoff (Boden der Bühne S0: +8 060 Zeichen
        // WGSL, das Programm 122 088 über der Decke 100 000).
        // DIE SONNE IN DER HÖHE DER PROBE (Hillaire 2020 „Aerial Perspective“: je Probe des Strahls der Durchlass zur Sonne): die
        // Himmels-Sicht trägt die einfache Streuung der Sonne in der Höhe ihrer Tafel (`hKm`, das Auge der letzten Anwendung des
        // Tags) — die Luft in anderer Höhe bekommt am Abend eine andere Sonne (bei 5° am Boden Durchlass 0,068, in 1,5 km 0,96).
        // Jede Probe trägt den Durchlass in ihrer Höhe gegen den der Tafel (Leuchtdichte): tiefer streut die Luft am Abend weniger
        // Sonne, höher mehr (der Dunst um ferne Gipfel); mittags ist der Weg zur Sonne in jeder Höhe kurz. Der Weg trägt je Art der
        // Luft ihre optische Tiefe am Boden (`sonneR`, `sonneM` — die Rechnung der Transmittance-Tafel, `_luftSonneTakt`), mit
        // ihrer Dichte in der Höhe skaliert (die Skalenhöhen der EINEN Atmosphäre): keine Tafel im Stoff, der Ring-Stoff trägt 16
        // von 16 Texturen (mit ihr band er 17, die Pipeline fiel).
        const tauSonne = (hKm) =>
            U.sonneR.mul(T.exp(hKm.div(A.U.HR).negate())).add(U.sonneM.mul(T.exp(hKm.div(A.U.HM).negate())));
        const luftSicht = T.Fn(([auge, punkt]) => {
            const n = AnazhRealm.HORIZONT_KARTE.luftProben;
            const v = punkt.sub(auge).toVar();
            const b = U.beta.mul(U.spektrum.y).mul(v.length().div(n)).toVar();
            const inTafel = tauSonne(A.U.hKm).toVar();
            const [tau, summe, licht] = [T.float(0).toVar(), T.float(0).toVar(), T.float(0).toVar()];
            T.Loop(n, ({ i }) => {
                const p = auge.add(v.mul(T.float(i).add(0.5).div(n))).toVar();
                const dtau = b.mul(T.exp(p.y.sub(U.bezugY).div(U.hoehe).negate())).toVar();
                // DER ANTEIL DES ABSCHNITTS exakt nach Beer-Lambert: e^{−τ}·(1 − e^{−Δτ}) = e^{−τ}·Δτ·φ(Δτ), φ(x) = (1 − e^{−x})/x,
                // x→0: 1 − x/2 (wie `fk`); die Summe ist 1 − e^{−τ}. Die Mittelpunkt-Regel Δτ·e^{−τ−Δτ/2} fiel in dichter Luft unter
                // die Klemme der Summe (1e-12, ab Δτ ≈ 63 je Abschnitt): die Sicht 0, die Luft verlor ihre ganze einfache Streuung
                // der Sonne (Radeon, Mittag, Genesis-Hügel: In-Streuung sRGB 93/101/92 bei β 1 gegen 130/139/129 bei β 0,05) — die
                // Luft-Linse (Schuss β 1) las den Himmel ohne Sonne: Koschmieder T/T_soll −7,98…8,37, Restkontrast am Rand 38–72 %.
                const phi = T.select(
                    dtau.lessThan(1e-3),
                    T.float(1).sub(dtau.mul(0.5)),
                    T.float(1).sub(T.exp(dtau.negate())).div(T.max(dtau, 1e-3))
                );
                const w = T.exp(tau.negate()).mul(dtau).mul(phi).toVar();
                const sonne = T.exp(inTafel.sub(tauSonne(T.max(p.y.sub(U.bezugY).mul(0.001), 0.001))));
                tau.addAssign(dtau);
                summe.addAssign(w);
                licht.addAssign(w.mul(this._horizontSicht(p)).mul(sonne));
            });
            return licht.div(T.max(summe, 1e-12));
        });
        // die Himmels-Sicht EINMAL je Blick (`himmelTexel`): Farbe und Anteil der Sonne lesen denselben Texel; den Luftschatten
        // baut nur ein Programm, dessen Renderer Schatten zeichnet (`_wirftImStoff` — unter kienspan ruht die Karte)
        // `sicht` ist der Luftschatten des Strahls (`luftSicht`); wer ihn reicht, entscheidet, WO er gerechnet wird.
        const farbeMit = T.Fn(([auge, punkt, sicht]) => {
            const dir = punkt.sub(auge).normalize();
            const blick = T.vec3(dir.x, T.max(dir.y, 0.0), dir.z).normalize().toVar();
            const tx = A.himmelTexel(blick).toVar();
            const schatten = this._wirftImStoff(
                T.float(1).sub(A.himmelEinfach(blick, tx).mul(T.float(1).sub(sicht))),
                T.float(1)
            );
            return T.select(U.unterWasser.greaterThan(0.5), U.farbe, A.himmelFarbe(blick, tx).mul(schatten));
        });
        // der Schirm-Pass (Feld, Panorama, Spiegel) kennt nur das Pixel: sein Strahl rechnet den Luftschatten dort, einmal je Pixel
        const farbe = T.Fn(([auge, punkt]) => farbeMit(auge, punkt, luftSicht(auge, punkt)));
        // DIE LUFT VOR DEM GEZEICHNETEN (w4-ferne-blau): EINE Mischung je Kanal für jeden Leser — die Stoffe der Szene
        // (`scene.fogNode`, der Fern-Ring darunter), der Feld-Pass und sein Panorama (`imDunst`) und der Spiegel des Wassers;
        // bis dahin setzte jeder Pass `mix(·, farbe, faktor)` selbst zusammen.
        // UNTER WASSER erreicht das Licht des Tags einen Punkt nur durch die Säule über ihm (w12-unterwasser): sein Licht trägt den
        // Durchlass nach Beer-Lambert exp(−kd · Tiefe unter dem Spiegel der Kamera) — derselbe Abfall, den die Farbe des Mediums
        // trägt; bis dahin lag der Grund des Sees in 3,4 m im vollen Mittag (heller als das Wasser vor ihm). Über Wasser
        // ist der Durchlass 1 (dasselbe Bild).
        const durchlass = T.Fn(([punkt]) =>
            T.select(
                U.unterWasser.greaterThan(0.5),
                T.exp(U.abfall.mul(T.max(U.spiegelY.sub(punkt.y), 0.0)).negate()),
                T.vec3(1)
            )
        );
        const mische = T.Fn(([rgb, auge, punkt]) =>
            T.mix(rgb.mul(durchlass(punkt)), farbe(auge, punkt), faktor(auge, punkt))
        );
        // DER LUFTSCHATTEN DER STOFFE STEHT AN DEN ECKEN (w28-horizont-gtx): der Strahl zum Punkt eines Stoffs rechnet seine
        // `luftProben` im Vertex, das Fragment liest ihn als Varying (`vLuftSicht`) — die Größe ist glatt (die gewogene Sicht längs
        // des Strahls, ihre acht Proben stehen an fernen Hängen 600 m auseinander, jede Masche ist feiner). Bis hier lief die
        // Schleife in JEDEM Fragment JEDES Stoffs, auch im verworfenen Texel einer Karte und unter jeder Überdeckung: GTX 1060,
        // Mess-Wiese Ego 1920×1080, gpu-bank — EINE Welt, je Stellung neu gebaut: 8 Proben 34,2 ms, 4: 30,2, 2: 29,1, 1: 28,5
        // (0,8 ms je Probe, die Hälfte der Abruf der Karte: 8 Proben ohne ihn 30,9); ABAB je frischer Boot Kopf 4e2df19b ↔ Ecken:
        // 34,26 · 34,36 ↔ 27,08 · 26,74 ms (−7,4 ms). Der Grat-Himmel daneben (`_horizontHimmel`) kostet dort 1,0 ms.
        // Das Bild bleibt (Schuss der Bühne am Gipfel-Blick 1920×1080, Kopf ↔ Ecken, mittlerer Luma-Abstand von 255): Mittag
        // 0,009 · Sonne 10° 0,030 · Sonne 3,3° 0,018, p99 ≤ 0,9 — zwei Schüsse des Kopfs untereinander 0,010 · 0,015 · 0,010.
        const sichtEcke = T.varying(luftSicht(T.cameraPosition, T.positionWorld), "vLuftSicht");
        const stoff = T.mix(
            T.output.rgb.mul(durchlass(T.positionWorld)),
            farbeMit(T.cameraPosition, T.positionWorld, sichtEcke),
            faktor(T.cameraPosition, T.positionWorld)
        );
        st.scene.fogNode = T.vec4(stoff, T.output.a);
        st.luft = { U, faktor, farbe, mische };
        return st.luft;
    }

    // Die Luft aus dem Medium der Kamera: die In-Streu-Farbe über Wasser ist der Himmel der EINEN Atmosphäre (`_luftEnsure`);
    // unter Wasser (die KAMERA unter dem Spiegel) trägt dieselbe Extinktion die Wasser-Trübung im Licht des Orts. Die
    // Hemisphäre der Nacht (0,1 × nacht, ihr Boden aus der Aura) fiel in licht-eine-skala: eine Zahl ohne Quelle — die Nacht
    // nimmt ihr Licht aus der Himmels-Umgebung wie jede Stunde.
    _dayNightApplyLuft() {
        // DAS MEDIUM DER KAMERA (W-L-d): unter Wasser ist, wessen AUGE unter dem Spiegel liegt — das der Kamera, nie das
        // des Körpers (bis V18.531: eine Kamera 20 m über dem Ufer zeigte Voll-Bild-Unterwasser, solange die Augen des
        // Körpers in der Ufer-Flut lagen; die Verfolger-Kamera am Seegrund sah klare Luft). Die Kamera-Höhe ist ihr
        // eigener Grund-Bezug: liegt sie unter dem Spiegel, der ihre Spalte füllt, ist sie im Wasser.
        const cam = this.state.camera;
        const kameraUnterWasser = !!cam && this._nassAt(cam.position.x, cam.position.z, 0, cam.position.y);
        this.state.kameraUnterWasser = kameraUnterWasser;
        const luft = this._luftEnsure();
        if (luft) {
            const L = AnazhRealm.LUFT;
            const U = luft.U;
            U.bezugY.value = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
            this._luftSonneTakt(U);
            U.unterWasser.value = kameraUnterWasser ? 1 : 0;
            if (kameraUnterWasser) {
                // Unter Wasser: DIESELBE Formel, Wasser-Trübung ohne Höhen-Abnahme (H → ∞), aus der EINEN Wasser-Wahrheit
                // (WASSER_GESETZ.koerper, je Art — der Bach klar, der See dazwischen, der Fluss trüb; die Art urteilt EIN Gesetz,
                // `_wasserArtAt` → gelaende-core `gewaesserArt`, dasselbe ruft das Terrain-Studio; bis w13-bach-klar entschied
                // dieser Leser selbst „im Kanal → fluss": Sicht am Bach 1,1 m). Die Farbe ist das Licht in der Tiefe der Kamera
                // unter dem örtlichen Spiegel (`_koerperWasser`, die Wahrheit, die sie eben unter Wasser nannte): Beer-Lambert
                // exp(−kd · Tiefe) × das Tageslicht —
                // die Leuchtdichte des Himmels über dem Wasser (E/π einer waagrechten Normale aus der Umgebung der EINEN Atmosphäre,
                // `_himmelsIrradianz`): mittags unter dem Spiegel hell, mit jedem Meter dunkler und blauer, nachts dunkler als die
                // Nacht darüber. β ist der 550-nm-Kanal der Strahl-Schwächung c (die Sicht des klaren Sees ~8 m, seine Secchi-Tiefe). Bis w12-unterwasser
                // trug die Farbe die festen ersten 0,3 m (Radeon: Szenen-Luma 2,5 m ÷ 0,5 m = 1,24, kein Abfall) und β eine
                // Stamm-Sichtweite von 30 m (`LUFT.unterwasserM`): ein blauer Filter vor klarer Sicht auf Berge und Himmel.
                const WGu =
                    AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) ||
                    AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
                const p = cam.position;
                const WK = WGu.koerper[this._wasserArtAt(p.x, p.z)];
                const tiefe = Math.max(0, this._koerperWasser(p.x, p.z, p.y) - p.y);
                const e = this._himmelsIrradianz();
                const tagesLicht = e ? 0.2126 * e.mitte[0] + 0.7152 * e.mitte[1] + 0.0722 * e.mitte[2] : 0;
                U.farbe.value.setRGB(
                    Math.exp(-WK.kd[0] * tiefe) * tagesLicht,
                    Math.exp(-WK.kd[1] * tiefe) * tagesLicht,
                    Math.exp(-WK.kd[2] * tiefe) * tagesLicht
                );
                U.beta.value = WK.c[1];
                U.hoehe.value = 1e9;
                U.spiegelY.value = p.y + tiefe;
                U.abfall.value.set(WK.kd[0], WK.kd[1], WK.kd[2]);
                luft.wasser = WK;
            } else {
                U.beta.value = this._luftBeta();
                U.hoehe.value = L.skalenHoeheM;
            }
            // das Spektrum je neuem β und Medium (eine Rechnung des Mediums je Wechsel, nie je Anwendung; unter Wasser je Körper)
            const wasser = kameraUnterWasser ? luft.wasser : null;
            const fuer = wasser || U.beta.value;
            if (luft.spektrumFuer !== fuer) {
                this._luftSpektrum(U.beta.value, wasser, U.spektrum.value);
                luft.spektrumFuer = fuer;
            }
        }
        // Unterwasser-Pass: das Wasser rendert als einseitige Oberseite (BackSide + Top-Cull) → von unten
        // fehlte die Decke. Liegt die Kamera unter Wasser, wird das EINE geteilte Wasser-Material
        // DoubleSide, beim Auftauchen zurück BackSide (von oben unverändert).
        const hsm = this.state.hydroSurfaceMaterial;
        if (hsm) {
            const wantSide = kameraUnterWasser ? THREE.DoubleSide : THREE.BackSide;
            if (hsm.side !== wantSide) hsm.side = wantSide;
        }
    }

    // Das Wasser-Material (hydroSurfaceMaterial für Meer/Fluss/See) folgt der
    // Tag-Nacht-Sprache: uSunDir + uLight (die Luft legt `scene.fogNode` auf). `lightDir` ist der AKTIVE
    // Himmelskörper (vom Aufrufer _applyDayNightToScene) → der Glitzer folgt tags der Sonne, nachts dem Mond.
    _dayNightApplyWaterMaterials(lightDir) {
        if (!this.state.directionalLight) return;
        const dl = this.state.directionalLight;
        // das Licht des Himmelskörpers selbst, in der EINEN Skala: bis licht-eine-skala hielt ein Boden 0,22 den Glitzer der
        // Nacht — im Mondlicht (0,26 lx) das 13 000-Fache, ein weißer Fleck auf jedem Wasser (GTX 1050, Dorf, 00 Uhr)
        const lightVal = dl.intensity;
        // Das Licht des Orts für Körper und Schaum ist das Licht der Welt (`_weltLicht`): sein Schreiber folgt der Uhr sofort
        this._weltLichtTakt();
        // Die Uniforms leben in state.hydroSurfaceUniforms.
        const applyToTSL = (uniforms) => {
            if (!uniforms) return;
            if (uniforms.sunDir) uniforms.sunDir.value.copy(lightDir);
            if (uniforms.light) uniforms.light.value = lightVal;
            if (uniforms.sunCol) uniforms.sunCol.value.copy(dl.color);
            // Der Wind am Wasser (0 ruhig … 1 Sturm): der EINE Wind am Auge (`_windAt`, die Stärke ohne Verstärker) kräuselt es.
            const cam = this.state.camera;
            if (uniforms.wind && cam)
                uniforms.wind.value = Math.max(
                    0,
                    Math.min(1, this._windAt(cam.position.x, cam.position.z, this._bildZeit).staerke)
                );
            // DAS EIS (stoffe.K3): die Linien des Gesetzes je Knoten der Säule (`_eisLinien`) — dieselben, die den Körper tragen
            if (uniforms.eisNull) {
                const E = this._eisLinien();
                uniforms.eisNull.value.fromArray(E.null);
                uniforms.eisVoll.value.fromArray(E.voll);
            }
        };
        applyToTSL(this.state.hydroSurfaceUniforms);
    }

    // [ATMOSPHERE] Sonne + Mond als sichtbare Meshes, gespeist aus _applyDayNightToScene (EINE Quelle).
    // Abstand 380 m (vor der Skybox bei 500 m), sichtbar bei Höhe ≥ 0, Mond gegenüber;
    // emissive-Material leuchtet ohne Licht.
    _updateCelestialBodies(angle, lightMul, achse) {
        const sunDist = AnazhRealm.HIMMEL.koerperAbstandM;
        const sun = this.state.sunMesh;
        const moon = this.state.moonMesh;
        // Himmelskörper folgen der KAMERA, nicht dem Welt-Ursprung: hier nur die RICHTUNG (skyOffset)
        // setzen, `_loopRender` addiert pro Frame camera.position. An absoluten Welt-Positionen stünden sie
        // bei fernem Spieler neben/hinter ihm (vom Terrain verdeckt, Mesh ≠ `sunDir`-Lichtrichtung).
        // die Richtung aus der EINEN Sonnenbahn (`_dayNightSunDirection`, dieselbe wie das Licht) — bis w28-nacht-licht rechneten
        // die Körper ihre Lage in einer eigenen Kopie der Formel
        const dir = this._dayNightSunDirection(angle);
        if (sun) {
            if (!sun.userData.skyOffset) sun.userData.skyOffset = new THREE.Vector3();
            sun.userData.skyOffset.copy(dir).multiplyScalar(sunDist);
            sun.visible = sun.userData.skyOffset.y > -10; // unter Horizont ausblenden
            // Sonne dimmt mit Wetter (rainy = trüber Schein); die Scheibe trägt ihre Leuchtdichte (`HIMMEL.sonneCd` in der
            // EINEN Skala) — sie endet am Deckel des Szenen-Ziels (`_vorBelichtung`), nie an ihrer Quelle. Ihr Ton trägt die Luma 1
            // (`_lichtLinear`, die EINE Norm der Lichtfarbe): die Leuchtdichte steht im Datum, nicht im Ton — bis hier trug der Ton
            // (1, 0,92, 0,7) Luma 0,921, die Scheibe stand bei 1,47·10⁹ statt `sonneCd` 1,6·10⁹ cd/m² (beide über dem Deckel).
            if (sun.material && sun.material.color) {
                const L = (AnazhRealm.HIMMEL.sonneCd / __weltLicht.EINHEIT_LX) * lightMul;
                const ton = this._sonneTon || (this._sonneTon = { farbe: new THREE.Color(1.0, 0.92, 0.7) });
                this._lichtLinear(ton, sun.material.color).multiplyScalar(L);
            }
        }
        if (moon) {
            // Mond gegenüber der Sonne (der Vollmond, `__weltLicht.mondRichtung`)
            if (!moon.userData.skyOffset) moon.userData.skyOffset = new THREE.Vector3();
            moon.userData.skyOffset.copy(dir).multiplyScalar(-sunDist);
            moon.visible = moon.userData.skyOffset.y > -10;
        }
    }

    // Himmelskörper pro Render-Frame an die Kamera heften: Weltposition = Kamera + skyOffset.
    // Im `_loopRender` SYNCHRON nach skybox/starField — vor dem Camera-Update gäbe 1 Frame Nachlauf.
    _followCelestialBodies() {
        const cam = this.state.camera;
        if (!cam) return;
        const pin = (obj) => {
            if (obj && obj.userData && obj.userData.skyOffset) {
                obj.position.copy(cam.position).add(obj.userData.skyOffset);
            }
        };
        pin(this.state.sunMesh);
        pin(this.state.moonMesh);
    }

    // DER TAG LÄUFT AN DER WELT-UHR (licht.K1, w28-nacht-licht): timeOfDay = f(Anker, spielZeit) — der Gang der Uhr liest die
    // Spielzeit, die seit seinem letzten Schritt verging (`_uhrSpielZeit`, der Anker; jeder andere Schreiber setzt ihn neu,
    // `_uhrSetzen`), geteilt durch die Tag-Länge. Bis w28-nacht-licht lief er an der Wanduhr (`currentTime`, auf 1 s gekappt), die
    // Welt am Spiel-Takt (auf `TAKT_DECKEL_S` 0,1 s gekappt): unter 250-ms-Takten lief der Tag 2,5-mal so schnell wie Wetter, Leben
    // und Wachstum, und ein Sprung der Welt-Uhr (`_weltUhrNimm`, der Stand, der Mitspieler) ließ die Stunde stehen (+900 s → +0,25 s
    // Tag). Ein Sprung nimmt den Tag jetzt mit, auch über ganze Tage (`_uhrSetzen` zählt sie); `currentTime` drosselt nur die Anzeige.
    tickDayNight(currentTime) {
        const st = this.state;
        const anker = st._uhrSpielZeit;
        st._uhrSpielZeit = st.spielZeit;
        if (!Number.isFinite(anker)) {
            this._applyDayNightToScene();
            return;
        }
        const cycleSeconds = this._kalender().tagS; // der Tag des Kalenders (zeit-ein-kalender)
        const dz = Math.max(0, st.spielZeit - anker);
        // ein Schritt über eine Sekunde Spielzeit kam nie aus dem Takt des Loops (er trägt höchstens `TAKT_DECKEL_S` je Takt): die
        // Uhr sprang — der Himmel malt neu, der Licht-Pool wählt zur neuen Stunde (wie bei jedem Schreiber außer dem Gang)
        if (dz > 1) {
            this._himmelSprung = true;
            if (this._leuchtPool) this._leuchtPool.t = -Infinity;
        }
        this._uhrSetzen(st.timeOfDay + dz / cycleSeconds, "uhr");
        // Läuft JEDEN Frame, kein Throttle: bei 10 Hz sprang die Beleuchtung in Stufen (ruckelnde Schatten);
        // die Funktion ist billig genug (Color-Lerps + Vector-Copies).
        this._applyDayNightToScene();
        // Status-Zeile und Regler bleiben 10 Hz throttled (DOM ist teurer als die Scene-Updates, und das Auge braucht
        // keine 60-Hz-Uhr).
        const lastApply = this.state._lastDayNightApply || 0;
        if (currentTime - lastApply >= 0.1) {
            this.state._lastDayNightApply = currentTime;
            this._uhrAnzeigen(this.state.timeOfDay);
        }
    }

    // DIE ANZEIGE DER UHR (Leben-Schau 2: der Tageszeit-Regler zeigte 12:00 bei Welt 01:41 — er las die Uhr nur beim
    // Aufbau der Einstellungen): die Status-Zeile UND der Regler (`_tageszeitRegler`) zeigen die Welt-Zeit, nach jedem
    // Satz und im Gang der Uhr.
    _uhrAnzeigen(t) {
        const r = this._statusRefs;
        if (r) this._hudSchreib(r.time, this._timeOfDayLabel(t));
        const g = this._tageszeitRegler;
        if (g && g.tod) {
            const wert = String(Math.round((((t % 1) + 1) % 1) * 1000));
            if (g.tod.value !== wert) g.tod.value = wert;
            const text = this._timeOfDayLabel(t).replace(/^[^\s]+\s/, "");
            this._hudSchreib(g.todVal, text);
        }
    }

    // DAS GESETZ DER SCHREIBER VON UHR UND WETTER (Leben-Schau 2, 09.10., §6 #1 — „Uhr und Wetter gehören dem Spieler"):
    // die Klasse einer Quelle (`ctx.source` der DSL, oder der Name eines Host-Schreibers) für `was` = "uhr" | "wetter".
    //   „spieler" — sein Satz und seine Werkzeuge (`_spielerVerlangt`), der Regler der Einstellungen („regler"), der Begleiter
    //               der geteilten Stimme („remote-voice"); für das GETEILTE Wetter auch ein Mitspieler („remote:…" — die Uhr
    //               reist nie, set_time_of_day ist NON_BROADCASTABLE).
    //   „gesetz"  — ein Gesetz, das der Spieler gab („rule:" + eine Quelle des Spielers), und der Vorschlag eines Wesens,
    //               dem der Spieler mit seinem Klick zusagte („zusage:…", `_executeCreatureProgram`): es schreibt wie er (ein
    //               stehendes Wort folgt ihm).
    //   „eigen"   — der Gang der Uhr („uhr"), der Wetter-Zug („auto-zug"), das Laden eines Spielstands („laden").
    //   „welt"    — alles andere: der Nexus, seine Gesetze, die Emotion, die Wesen („creature:…" — auch das Wesen, das im
    //               Schöpfer-Modus von selbst handelt; bis zur Gegenprüfung las es sich als Zusage und nahm dem Spieler sein
    //               Wort), eine Quelle ohne Namen. Rechte trägt nur eine Quelle, die den Spieler oder seine Zusage NENNT.
    // Die Welt schreibt die Uhr nie und das Wetter nie direkt — sie wünscht das nächste Wort des Wetter-Zugs (`_setWeather`).
    // Vorher schrieben zwei Nexus-Gesetze die Uhr 30-mal in 160 s, und „setze wetter sonnig" hielt bis zum nächsten Regen.
    _himmelSchreiber(quelle, was) {
        if (quelle === "uhr" || quelle === "auto-zug" || quelle === "laden") return "eigen";
        if (typeof quelle !== "string") return "welt";
        const spieler = (q) =>
            this._spielerVerlangt(q) ||
            q === "regler" ||
            q === "remote-voice" ||
            (was === "wetter" && q.startsWith("remote:"));
        if (spieler(quelle)) return "spieler";
        // ein Gesetz trägt die Quelle seines Gebers, auch ein Gesetz, das ein Gesetz gab („rule:rule:human")
        let geber = quelle;
        while (geber.startsWith("rule:")) geber = geber.slice(5);
        if (geber !== quelle && spieler(geber)) return "gesetz";
        // der Vorschlag eines Wesens, dem der Spieler zusagte (sein Klick auf „Ausführen", `_executeCreatureProgram`), schreibt
        // wie ein Gesetz des Spielers; was ein Wesen von selbst tut („creature:…"), ist Welt
        if (quelle.startsWith("zusage:")) return "gesetz";
        return "welt";
    }

    // DER EINE SCHREIBER DER UHR (`state.timeOfDay`): der Gang der Uhr („uhr", `tickDayNight`), der Spieler (`setTimeOfDay`
    // aus seinem Satz, seinem Gesetz, dem Regler) und das Laden („laden") — die Welt nie (`_himmelSchreiber`; sie steht beim
    // Namen im Log). Liefert, ob die Uhr geschrieben wurde. gate:wetter-wache zählt `this.state.timeOfDay =` im Stamm: einmal.
    _uhrSetzen(t, quelle) {
        let v = Number(t);
        if (!Number.isFinite(v)) return false;
        // der Gang reicht die Uhr UNGEFALTET (`tickDayNight`: Stunde + vergangene Tag-Bruchteile, ein Sprung der Welt-Uhr auch über
        // ganze Tage): die ganzen Tage zählt hier der Tag der Welt, die Uhr trägt den Rest
        const ganz = quelle === "uhr" && v >= 1 ? Math.floor(v) : 0;
        v -= ganz;
        if (this._himmelSchreiber(quelle, "uhr") === "welt") {
            this.log(
                `Uhr gehalten: ${quelle || "?"} wollte ${this._timeOfDayLabel(v)} — die Uhr gehört dem Spieler`,
                "DEBUG"
            );
            return false;
        }
        // ein Schreiber außer dem Gang springt: der Himmel malt sich beim nächsten Anwenden des Tags neu (`_ensureSkyEnvironment`),
        // und der Licht-Pool wählt neu, sobald ihn Licht-Takt oder Lichtmesser lesen (`_leuchtWahl`: sie liest den Zeitplan der Quellen zur Uhr — mit
        // der Wahl der alten Stunde blendeten die Laternen des Genesis-Orts erst bis zu `wahlS` nach dem Sprung ein, mitten im
        // Schuss: gate:tag-achse:echt SPRUNG 0,2–0,6 EV an Dämmerung und Morgen)
        if (quelle !== "uhr" && v !== this.state.timeOfDay) {
            this._himmelSprung = true;
            if (this._leuchtPool) this._leuchtPool.t = -Infinity;
        }
        // DER TAG DER WELT (feld.K4, `_weltStunde`): kreuzt die Uhr Mitternacht (der kürzere Bogen), zählt der Tag vor oder
        // zurück; das Laden setzt nur die Uhr — der Tag reist im worldMeta
        const d = v - this.state.timeOfDay;
        const wm = this.state.worldMeta;
        const tag0 = wm ? wm.tag || 0 : 0;
        if (quelle === "uhr") {
            if (wm && ganz) wm.tag = tag0 + ganz;
        } else {
            if (quelle !== "laden" && wm && Math.abs(d) > 0.5) wm.tag = (wm.tag || 0) + (d < 0 ? 1 : -1);
            // ein Schreiber außer dem Gang stellt die Stunde zur Welt-Uhr von JETZT: der Anker des Gangs (`tickDayNight`) folgt ihm
            this.state._uhrSpielZeit = this.state.spielZeit;
        }
        // die Uhr des Spielers ist SICHT (w28-lava-nachlauf): kein Prozess liest sie — die Nässe-Dosis der Welt schreibt der Takt
        // der Nässe an der Welt-Uhr (`_naesseTakt`), Lava, Taten, Pfad und Werke altern am Tag der Prozesse (`_weltTag`)
        this.state.timeOfDay = v;
        return true;
    }

    // Liefert eine kurze, lesbare Tageszeit-Beschreibung. z. B. "🌅 06:24".
    // Vier Symbole für vier Phasen: 🌌 Nacht / 🌅 Morgen / ☀️ Tag / 🌇 Abend.
    _timeOfDayLabel(t) {
        const tWrap = ((t % 1) + 1) % 1;
        const hours = tWrap * 24;
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        const hStr = h.toString().padStart(2, "0");
        const mStr = m.toString().padStart(2, "0");
        let emoji = "☀️";
        if (tWrap < 0.22 || tWrap >= 0.85)
            emoji = "🌌"; // Nacht
        else if (tWrap < 0.35)
            emoji = "🌅"; // Morgen
        else if (tWrap < 0.65)
            emoji = "☀️"; // Tag
        else emoji = "🌇"; // Abend
        return `${emoji} ${hStr}:${mStr}`;
    }

    // Setzt die Tag-Länge (in Minuten): die Wahl des Spielers, persistiert bei ihm (localStorage) — nie im Spielstand, sonst
    // hielte ein alter Stand seinen alten Tag fest (bis zur Leben-Schau 2 trug jeder Stand den 8-min-Standard).
    setDayLength(minutes) {
        const min = this.constructor.DAY_LENGTH_MIN_MINUTES;
        const max = this.constructor.DAY_LENGTH_MAX_MINUTES;
        const num = Number(minutes);
        const safeMinutes = Number.isFinite(num) ? num : this.constructor.DAY_LENGTH_DEFAULT_MINUTES;
        const v = Math.max(min, Math.min(max, safeMinutes));
        this.state.dayLengthMinutes = v;
        try {
            if (typeof localStorage !== "undefined") localStorage.setItem("anazh.dayLengthMinutes", String(v));
        } catch (e) {
            void e;
        }
    }

    // Stellt die Uhr (z. B. via DSL-Op set_time_of_day(0.5) für Mittag, oder der Regler „regler") — über den EINEN
    // Uhr-Schreiber und sein Gesetz: eine Quelle der Welt stellt sie nie (false).
    setTimeOfDay(t, quelle) {
        const v = Math.max(0, Math.min(1, Number(t)));
        if (!Number.isFinite(v) || !this._uhrSetzen(v, quelle)) return false;
        this._applyDayNightToScene();
        this._uhrAnzeigen(v);
        return true;
    }

    // ### 6.G3.b — Sanfte Wetter-Übergänge ###

    // Per-Wetter-Skalar, über die laufende Transition cross-gefadet — EINE Quelle für alle
    // wetter-abhängigen Skalare (sonst flippen weatherEffect/cloudCover hart, während Licht fadet).
    // Lerpt über die WEATHER_INTENSITY-Achse (sunny=0 · rainy=1 · stormy=1.35): ein neues Wort
    // extrapoliert die sunny→rainy-Spanne; unbekannte Worte zählen 0.
    _weatherBlendedValue(sunnyVal, rainyVal) {
        const INT = AnazhRealm.WEATHER_INTENSITY;
        const valFor = (w) => sunnyVal + (rainyVal - sunnyVal) * (INT[w] || 0);
        const wt = this.state.weatherTransition;
        if (wt && wt.from && wt.to) {
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            return valFor(wt.from) + (valFor(wt.to) - valFor(wt.from)) * p;
        }
        return valFor(this.state.weather);
    }

    // DER EINE LOOK-WETTER-LESER: die 5 Kanäle {fog,sun,grey,wind,rain}, transition-aware (dieselbe
    // from/to/progress-Lerp wie `_weatherBlendedValue`, vektoriell). `w` = Wort-Vorgabe (Default
    // state.weather), während einer Transition führen from/to; unbekannt → sunny. `rein`: das Feld des Worts `w` selbst, ohne den
    // laufenden Übergang (der Weg des Regens, `_regenWeg`, legt seine Knoten aus den Worten eines Übergangs).
    // Gibt eine FRISCHE Kopie zurück (die frozen Statics bleiben unberührt).
    _weatherFieldFor(w, rein) {
        const FLD = AnazhRealm.WEATHER_FIELD;
        const base = FLD.sunny;
        const fieldFor = (word) => FLD[word] || base;
        const lerpField = (a, b, p) => ({
            fog: a.fog + (b.fog - a.fog) * p,
            sun: a.sun + (b.sun - a.sun) * p,
            grey: a.grey + (b.grey - a.grey) * p,
            wind: a.wind + (b.wind - a.wind) * p,
            rain: a.rain + (b.rain - a.rain) * p,
        });
        const wt = this.state.weatherTransition;
        if (!rein && wt && wt.from && wt.to) {
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            return lerpField(fieldFor(wt.from), fieldFor(wt.to), p);
        }
        const f = fieldFor(typeof w === "string" ? w : this.state.weather);
        return { fog: f.fog, sun: f.sun, grey: f.grey, wind: f.wind, rain: f.rain };
    }

    // DAS WETTER AM ORT (wetter.K1): das Wort der Front über (x, z) — der Kern (phyto-core `wetterAt` über die Saat der Welt,
    // den Ort und die Zeit, ohne `t` die Welt-Uhr `spielZeit`) wählt die Zeile von WX_GESETZ, die Welt spricht ihr Wort aus der
    // Wetter-Tafel ihres Gesetzes (`worldMeta.gesetz.wetter`; die Erde: `WETTER_WORT`). Leser: der Wetter-Zug (`_loopWeatherAndGrowth`).
    _wetterAmOrt(x, z, t = this.state.spielZeit) {
        const wm = this.state.worldMeta || {};
        // die Verteilung des Orts (Reise): das Δ der Tafel `ortGesetz` (die Heimat: null — die Stufen der Heimat)
        const zeile = globalThis.__phytoCore.wetterAt(
            AnazhRealm._saatVon(wm),
            x,
            z,
            t,
            this._gelaende().ort.wetter
        ).zeile;
        const wort = AnazhRealm._weltGesetz(wm).wetter[zeile]; // die Wetter-Tafel des Gesetzes DIESER Welt (ultiversum.K1)
        if (!wort)
            throw new Error("_wetterAmOrt: die Zeile „" + zeile + "“ hat kein Wort der Welt (ihre Wetter-Tafel)");
        return wort;
    }

    // DAS WETTER-FELD AM ORT (wetter-am-ort): die fünf Kanäle {fog, sun, grey, wind, rain} über (x, z) zur Welt-Uhr t — der Kern
    // (phyto-core `wetterFeldAm`: die Front stetig über ihre Stufen, das Δ des Planeten `ort.wetter`, der Steigungsregen auf der
    // Höhe des Gesetzes, `relief`) in den Zeilen der Wetter-Tafel DIESER Welt (je Zeile der Front ihr Wort, dessen Feld
    // WEATHER_FIELD trägt). Das Wort am Spieler ist sein EINGRIFF, nie das Wetter der Welt: das Feld, das er trägt
    // (`_weatherFieldFor`: der Zug der Front an seinem Ort, sein Übergang, das Wort des Spielers, ein Wunsch der Welt), gilt in
    // seiner Region und läuft in die Natur aus; den Regen, den es zieht, gibt das Lee windab her. Am Spieler ist das Feld darum
    // das Feld seines Worts (Licht, Nebel, Himmel, Regen-Bild lesen es dort), fern davon die Front über dem Ort. `aus`: ein
    // Leser, der je Bild hunderte Male fragt, gibt sein Objekt mit. Leser: der Wind am Ort (`_windAt` → Gras, Krone, Wasser,
    // Rauch, Wagen, Ohr), der Tag der Bewohner (`_bewohnerSoll`), das Gefäß im Regen (`_tickWerkGesetz`).
    _wetterFeldAm(x, z, t = this.state.spielZeit, aus, relief = true) {
        const st = this.state;
        const tafel = AnazhRealm._weltGesetz(st.worldMeta || {}).wetter;
        let E = Object.hasOwn(this, "_wetterFeldEin") ? this._wetterFeldEin : null;
        if (!E || E.tafel !== tafel) {
            const F = AnazhRealm.WEATHER_FIELD;
            const zeilen = {};
            for (const z0 of Object.keys(tafel)) {
                if (!F[tafel[z0]])
                    throw new Error("_wetterFeldAm: das Wort „" + tafel[z0] + "“ hat kein Feld (WEATHER_FIELD)");
                zeilen[z0] = F[tafel[z0]];
            }
            Object.freeze(zeilen); // (eingefroren prüft der Kern die Tafel einmal, nie je Ruf)
            const hier = { x: 0, z: 0, feld: null };
            const hoehe = (hx, hz) => this._terrainMacroSurfaceY(hx, hz, false);
            E = this._wetterFeldEin = {
                tafel,
                von: null,
                zu: null,
                fort: null,
                mit: { zeilen, hier, hoehe },
                ohne: { zeilen, hier },
            };
        }
        // der Eingriff: der Ort des Spielers (dort zieht der Zug sein Wort) und das Feld, das er dort trägt — neu, wenn Wort oder
        // Übergang weiterzogen
        // (je Ruf ohne Bau: der Leser fragt je Rauch-Teilchen und je Schritt der Wende-Suche des Tagesplans)
        const pm = st.playerMesh;
        const H = E.mit.hier;
        H.x = pm ? pm.position.x : 0;
        H.z = pm ? pm.position.z : 0;
        const wt = st.weatherTransition;
        const zug = !!(wt && wt.from && wt.to);
        const von = zug ? wt.from : st.weather;
        const zu = zug ? wt.to : null;
        const fort = zug ? wt.progress : null;
        if (!H.feld || von !== E.von || zu !== E.zu || fort !== E.fort) {
            E.von = von;
            E.zu = zu;
            E.fort = fort;
            H.feld = this._weatherFieldFor();
        }
        return globalThis.__phytoCore.wetterFeldAm(
            AnazhRealm._saatVon(st.worldMeta || {}),
            x,
            z,
            t,
            this._gelaende().ort.wetter,
            relief ? E.mit : E.ohne,
            aus
        );
    }

    // DER WIND DER WOLKEN-SCHICHT (licht.K4, wetter-am-ort): die Schicht zieht mit dem EINEN Wind (phyto-core `windRichtung`: die
    // Richtung, die Gras, Krone, Wasser und Rauch an jedem Ort lesen) im Zug der Fronten (`WIND_FELD.front.zugMS`, 850 hPa) —
    // `ms` ihr Zug zur Wolken-Uhr tW (m/s), `weg` ihr Weg seit der Wolken-Uhr 0 (m, phyto-core `windWeg`: geschlossen, eine
    // Funktion von Saat und Uhr — auf jeder Seite einer Uhr derselbe Himmel, nie eine Summe über Bilder). Die Wolken-Uhr läuft der
    // Welt-Uhr um die Saat der Wolken voraus (`_wolkenSaat`): ihr Wind zu tW ist der der Welt-Uhr tW − Saat. Bis wetter-am-ort zog
    // sie starr längs der Grundrichtung der Saat, und gegen das Gras stand der Mäander (bis ±41°). Leser: der Zug der Kuppel,
    // des Spiegels und des Wurfs (`_dayNightApplySkybox` → `zug`).
    _wolkenWind(tW) {
        const P = globalThis.__phytoCore;
        const saat = AnazhRealm._saatJe(this);
        const [s0, v] = [this._wolkenSaat(), P.WIND_FELD.front.zugMS];
        const d = P.windRichtung(saat, tW - s0);
        const w = P.windWeg(saat, -s0, tW - s0);
        return { ms: [d.x * v, d.z * v], weg: [w.x * v, w.z * v] };
    }

    // D5a (V18.128) — die wet-Frage: regnet es hier (rainy UND stormy)?
    // Ersetzt die binären ===\"rainy\"-Leser (Journal/Nexus/Spawn-Stimmung).
    _weatherIsWet(w) {
        const word = typeof w === "string" ? w : this.state.weather;
        return (AnazhRealm.WEATHER_INTENSITY[word] || 0) >= 1;
    }

    // DIE TEMPERATUR AN DER HÖHE y (stoffe.K3) — die EINE Naht zum Feld des Gelände-Kerns: `_temperaturFeld` das Feld in
    // Wellen (`temperaturFeld`; `traegTage` die Wärme-Trägheit eines Körpers), `_temperaturAt` sein Wert zur Saison
    // (`seasonPhase`) und Uhr (`timeOfDay`) der Welt unter ihrem Wetter (wetter.K4: das Feld `_weatherFieldFor` über den
    // Übergang des Worts — die Wolke dämpft den Tagesgang, der Regen kühlt). Leser: die Grillen (`_umweltLage`), die Esse, die
    // Lava, die Zünd-Wärme.
    _temperaturFeld(y, traegTage) {
        return globalThis.__gelaendeCore.temperaturFeld(this._gelaende(), y, traegTage);
    }
    _temperaturAt(y, traegTage) {
        const st = this.state;
        return globalThis.__gelaendeCore.temperaturAus(
            this._temperaturFeld(y, traegTage),
            st.seasonPhase,
            st.timeOfDay,
            this._weatherFieldFor()
        );
    }

    // DER TRITT IN DIE SCHNEE-DECKE (wetter.K4): wie tief ein Körper an (x, z) auf der gezeichneten Fläche y in die Decke sinkt —
    // das Gesetz des Kerns (`schneeTrittAm`: die Tiefe der weichen Decke an der Höhe, gedeckt nach dem Weiß der Schneegrenze mit
    // dem Versatz, den die Welt trägt, `_schneeGilt`) aus der Tafel des Tags der Welt (`_schneeTafel`: je Tag der Saison, je Feld
    // der Naht, Meer und Stoff des Wassers — nie je Bild). Das Netz zeichnet die Decke (ihr Weiß), der Körper steht in ihr. Leser:
    // der Grund jedes Körpers (`_koerperGrund`, `_koerperBodenUnter`), die Kapsel (`_stepCharacter`), der Stand der Sicht
    // (`_standSicht`: Fuß, Huf, Rad). Wo die Tafel keinen Schnee trägt, kostet er einen Vergleich (Lehre 25).
    _schneeTrittAt(x, y, z) {
        const T = this._schneeTafel();
        return T ? globalThis.__gelaendeCore.schneeTrittAm(this._gelaende(), T, x, y, z, this._schneeGilt()) : 0;
    }
    _schneeTafel() {
        const K = globalThis.__gelaendeCore;
        const L = this._gelaende();
        const n = K.TEMPERATUR.jahrTage;
        const ph = this.state.seasonPhase;
        const tag = Math.floor((typeof ph === "number" ? ph : L.ort.klimaHeute.sommerPhase) * n) / n;
        const W = this._stoff("wasser");
        const rho = W ? W.rho : NaN; // ohne Zeile bricht der Kern laut beim Namen
        const c = this._schneeTafelStand;
        if (c && c.tag === tag && c.feld === this._temperaturFeld && c.wl === L.waterLevel && c.rho === rho)
            return c.tafel;
        const tafel = K.schneeTafel(L, tag, (y, tr) => this._temperaturFeld(y, tr), { wasser: W });
        this._schneeTafelStand = { tag, feld: this._temperaturFeld, wl: L.waterLevel, rho, tafel };
        return tafel;
    }

    // DER SCHNEE-PEGEL AN DER HÖHE y (stoffe.K3-2): das Gesetz des Kerns (`schneePegel`) auf dem Feld dieser Naht zur Saison der
    // Welt — m Wasser des Schnees. Leser: die Linse der Schmelze; die Schneegrenze liest seine Linie (`_schneeVersatz`).
    _schneePegelAt(y) {
        return globalThis.__gelaendeCore.schneePegel(this._gelaende(), y, this.state.seasonPhase, (tr) =>
            this._temperaturFeld(y, tr)
        );
    }

    // DER VERSATZ DER SCHNEEGRENZE (stoffe.K3-2): der Weg der Linie des Pegels seit der Sommer-Mitte (Kern `schneeVersatz`,
    // in Stufen von `SCHMELZE.stufe`), gerechnet je Welt-STUNDE der Saison (eine Stunde bewegt die Linie um Zentimeter), je
    // Feld (die Naht) und Meer — nie je Bild. `_schneeGilt` ist der Versatz, den die Welt trägt: der Boden-Leser des Mains
    // (`_bodenFarbeAt`) und der Faden (`schneeVersatz` im Stand) färben mit ihm, bit-gleich; `_schneeTakt` zieht ihn nach.
    _schneeVersatz() {
        const st = this.state;
        const K = globalThis.__gelaendeCore;
        const L = this._gelaende();
        const stunden = K.TEMPERATUR.jahrTage * 24;
        const saison = Math.floor(st.seasonPhase * stunden) / stunden;
        const c = this._schneeStand;
        if (c && c.saison === saison && c.feld === this._temperaturFeld && c.wl === L.waterLevel) return c.versatz;
        const versatz = K.schneeVersatz(L, saison, (y, tr) => this._temperaturFeld(y, tr));
        this._schneeStand = { saison, feld: this._temperaturFeld, wl: L.waterLevel, versatz };
        return versatz;
    }
    _schneeGilt() {
        if (this._schneeVersatzGilt === undefined) this._schneeVersatzGilt = this._schneeVersatz();
        return this._schneeVersatzGilt;
    }

    // DER TAKT DER SCHNEEGRENZE (stoffe.K3-2, gerufen vom Takt der Saison, wenn die Phase wandert): wandert der Versatz um eine
    // Stufe, trägt die Welt den neuen — der Faden bekommt ihn als Änderung (`_voxelZustandPost`), neu gebaut werden genau die
    // gezeichneten Chunks, deren Höhen das Band der Grenze zwischen altem und neuem Versatz treffen (die Form `SCHNEE` samt
    // ihrer Zungen), ihre Netze im Vorrat fallen; der Fern-Ring rechnet seine Farben neu, das Feld-Panorama malt neu
    // (`_feldSaisonDrift`). Es kostet, was die Grenze überstreicht (Gebot 7) — die Welt darunter und darüber nie.
    _schneeTakt() {
        const alt = this._schneeVersatzGilt;
        if (alt === undefined) return;
        const neu = this._schneeVersatz();
        if (neu === alt) return;
        this._schneeVersatzGilt = neu;
        this._voxelZustandPost({ type: "state-update", delta: { schneeVersatz: neu } });
        const K = globalThis.__gelaendeCore;
        const L = this._gelaende();
        // das Band des Orts (Reise): `schneeBandM` der Tafel `ortGesetz` (die Heimat 0)
        const wl = L.waterLevel + L.ort.schneeBandM;
        const zunge = K.SCHNEE.zungen.reduce((s, o) => s + o.a, 0);
        const lo = wl + K.SCHNEE.start + Math.min(alt, neu) - zunge;
        const hi = wl + K.SCHNEE.voll + Math.max(alt, neu) + zunge;
        const trifft = (y0, y1) => y1 >= lo && y0 <= hi;
        const st = this.state;
        if (st.voxelChunks && st.voxelChunks.size) {
            if (!st.dirtyVoxelChunks) st.dirtyVoxelChunks = new Set();
            for (const [key, ch] of st.voxelChunks) {
                const g = ch && ch.mesh && ch.mesh.geometry;
                if (!g) continue;
                if (!g.boundingBox) g.computeBoundingBox();
                if (trifft(g.boundingBox.min.y, g.boundingBox.max.y)) st.dirtyVoxelChunks.add(key);
            }
        }
        if (st.voxelMeshCache)
            for (const [key, m] of st.voxelMeshCache) {
                const p = m && m.positions;
                if (!p) continue;
                let [y0, y1] = [Infinity, -Infinity];
                for (let i = 1; i < p.length; i += 3) [y0, y1] = [Math.min(y0, p[i]), Math.max(y1, p[i])];
                if (trifft(y0, y1)) st.voxelMeshCache.delete(key);
            }
        this._fernMemoGen = (this._fernMemoGen | 0) + 1;
        if (st.fernRing) this._fernRingNeuBestellen(st.fernRing, true); // der EINE Weg (Anker und Edits stehen)
    }

    // DIE LINIEN DES EISES (stoffe.K3): das Gesetz des Kerns (`eisDicke` auf dem Feld dieser Naht) je Knoten der Säule
    // (`EIS.saeule` logarithmisch: 0,1 · 0,67 · 4,5 · 30 m) als zwei Höhen — `null`, über der das Eis beginnt, und `voll`,
    // über der es trägt (`EIS.traegt`). Das Eis wächst mit der Höhe (kälter) und schwindet mit der Säule (träger): je Säule
    // ist jede Linie EINE Höhe (Halbierung auf 1 cm zwischen 10 m unter und 1 km über dem Meer, an den Enden geklemmt).
    // `traegtAb` ist die tiefste tragende Höhe der Welt (die flachste Säule; Infinity: nirgends) — der billige Beweis jedes
    // Lesers. Gerechnet je Welt-STUNDE der Saison (das Eis wächst in ~6 Tagen vom ersten zum tragenden; eine Stunde trägt
    // unter 1 mm), je Feld (die Naht), Meer und Stoff (`_wasserStoff`: ρ, c, T_schmelz des Wassers, ρ, L, k des Eises) — nie je Bild;
    // Bild und Körper lesen dieselbe Stunde. Der Leser zahlt sieben Vergleiche, solange Saison und Stoff stehen.
    _eisLinien() {
        const st = this.state;
        const c = this._eisLinienStand;
        const W = this._stoff("wasser");
        const E = this._stoff("eis");
        const gleich =
            c &&
            c.rho === W.rho &&
            c.c === W.c &&
            c.tSchmelz === W.tSchmelz &&
            c.eisRho === E.rho &&
            c.eisL === E.L &&
            c.eisK === E.k;
        if (gleich && c.phase === st.seasonPhase && c.feld === this._temperaturFeld && c.wasser === st.waterLevel)
            return c;
        const K = globalThis.__gelaendeCore;
        const L = this._gelaende();
        const stunden = K.TEMPERATUR.jahrTage * 24;
        const saison = Math.floor(st.seasonPhase * stunden) / stunden;
        const wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - K.GRUND.meerUnterBasis;
        if (gleich && c.saison === saison && c.feld === this._temperaturFeld && c.wl === wl)
            return Object.assign(c, { phase: st.seasonPhase, wasser: st.waterLevel });
        const S = K.EIS.saeule;
        const stoff = this._wasserStoff();
        const [unten, oben] = [wl - 10, wl + 1000];
        const linie = (tiefe, soll) => {
            const dicke = (y) => K.eisDicke(L, y, saison, tiefe, (tr) => this._temperaturFeld(y, tr), stoff);
            let [lo, hi] = [unten, oben];
            if (dicke(lo) >= soll) return lo;
            if (!(dicke(hi) >= soll)) return hi;
            while (hi - lo > 0.01) {
                const m = (lo + hi) / 2;
                if (dicke(m) >= soll) hi = m;
                else lo = m;
            }
            return hi;
        };
        const knoten = [0, 1, 2, 3].map((i) => S[0] * (S[1] / S[0]) ** (i / 3));
        const voll = knoten.map((d) => linie(d, K.EIS.traegt));
        return (this._eisLinienStand = {
            phase: st.seasonPhase,
            wasser: st.waterLevel,
            saison,
            feld: this._temperaturFeld,
            wl,
            rho: W.rho,
            c: W.c,
            tSchmelz: W.tSchmelz,
            eisRho: E.rho,
            eisL: E.L,
            eisK: E.k,
            null: knoten.map((d) => linie(d, 1e-3)),
            voll,
            traegtAb: voll[0] < oben ? voll[0] : Infinity,
        });
    }

    // DER STOFF DES WASSERS (stoffe.K1 × K3): die Zeilen wasser und eis der Stoff-Tafel (`_stoff`) — ρ·c der Säule, T_schmelz
    // und ρ, L, k des Eises sind die Zahlen, mit denen der Kern den Wasserkörper und sein Eis rechnet (`wasserKoerper`,
    // `eisDicke`); dieselbe Eis-Zeile, die der Schritt-Klang und der gleitende Leib lesen. Leser: die Linien des Eises
    // (`_eisLinien`) und die Linse des Meers.
    _wasserStoff() {
        return { wasser: this._stoff("wasser"), eis: this._stoff("eis") };
    }

    // DIE NÄSSE (wetter.K2) — EIN Zustand der Welt aus dem Wetter-Feld (`state.naesse`, 0 trocken … 1 nass, der Film): Regen
    // benetzt, ohne Regen verdunstet der Film nach Sonne, Wind und den Poren des Bodens (`_naesseKurve`) — exakt je Schritt, also
    // dieselbe Nässe nach 600 Takten wie nach einem Schritt von 600 s (die Bühne der Linse `werkbank licht --naesse`). Ohne `dt`
    // zählt die Spiel-Zeit seit dem letzten Ruf (`_tickRain`). Die Leser sind der EINE Welt-Stoff (`_naesseImStoff`) und die
    // Pfütze in den Mulden des Bodens (`_pfuetzeKnoten`) über `atmoUniforms.naesse` (der Regen schlägt Ringe nach
    // `atmoUniforms.regen`); den Dach-Pool seiner Himmels-Sicht wählt derselbe Takt (`_dachTakt`).
    _naesseTakt(dt) {
        const st = this.state;
        const N = AnazhRealm.NAESSE;
        const lauf = dt == null;
        if (lauf) {
            dt = Number.isFinite(this._naesseUhr) ? st.spielZeit - this._naesseUhr : 0;
            this._naesseUhr = st.spielZeit;
        }
        const wf = this._weatherFieldFor(st.weather);
        // DIE NÄSSE-DOSIS DER WELT (stoffe.K4, `_werkAlter`): je Welt-Uhr, die verging, der Regen des Wetter-Felds des Worts
        // (`WEATHER_FIELD[weather].rain` — der Übergang ist Bild, das Wort ist das Wetter) × die Tage des Gesetzes, aufsummiert
        // im worldMeta (`nassTage`, reist im Stand). Bis w28-lava-nachlauf schrieb sie der Schreiber der Uhr (`_uhrSetzen`) je
        // Stunde der SICHT: ein Zug am Regler im Regen ließ jedes Werk um Tage rosten. Mehr als EIN Zug seit dem letzten Takt ist
        // ein Sprung der Welt-Uhr (`_weltUhrNimm`: Stand, Mitspieler): seine Tage tragen den Regen der Front (`_regenSprung`), nie
        // das Wort des Augenblicks.
        const wm = st.worldMeta;
        const regen = AnazhRealm.WEATHER_FIELD[st.weather];
        if (lauf && dt > AnazhRealm.WETTER_ZUG_SEK && wm)
            wm.nassTage = (+wm.nassTage || 0) + this._regenSprung(st.spielZeit - dt, st.spielZeit);
        else if (lauf && dt > 0 && wm && regen && regen.rain > 0)
            wm.nassTage = (+wm.nassTage || 0) + (dt / this._kalender().tagS) * regen.rain;
        const n0 = Number.isFinite(st.naesse) ? st.naesse : 0;
        const ziel = wf.rain > N.regenAb ? 1 : 0;
        const n = AnazhRealm._naesseKurve(n0, wf, dt);
        st.naesse = Math.abs(n - ziel) < N.ruhe ? ziel : n; // am Ziel steht sie (der Fixpunkt, an dem der Regen schläft)
        // DER TROCKEN-WEG DER WELT (stadtklima#1, `_naesseAm`): 1 − Film, solange er steht; ohne Regen wächst er mit der Rate
        // weiter, wenn der Film der Welt schon trocken ist — der Schatten der Häuser trocknet mit seinem Anteil der Rate nach
        const q1 = AnazhRealm._trockenAnteil(wf);
        const weg0 = n0 <= 0 && Number.isFinite(this._naesseWeg) ? this._naesseWeg : 1 - n0;
        this._naesseWeg = ziel ? 1 - st.naesse : Math.min(1 / q1 + 1, weg0 + Math.max(0, dt) * AnazhRealm._trockenRate(wf));
        const U = this._ensureAtmoUniforms();
        U.naesse.value = st.naesse;
        U.regen.value = ziel ? wf.rain : 0;
        U.naesseWeg.value = this._naesseWeg;
        this._dachTakt();
        this._schattenTakt(q1);
        this._pegelTakt(); // der Regen des Felds speist See und Fluss (wetter.K3) — neu nur an einem neuen Stempel (`pegelRegen`)
        return st.naesse;
    }

    // Der EINE Wetter-Schreiber: state.weather wird SOFORT gesetzt (weather_is + DSL reagieren instant),
    // die Transition ist rein visuell (Skybox + Symphonie cross-faden ~45 s). Aufrufer: DSL-Op `weather`
    // (Quelle = die DSL-Quelle: emotion:<Achse> · nexus · rule:<Herkunft> · human · remote:<Peer> · llm:grok …)
    // und der Auto-Zug (_loopWeatherAndGrowth, „auto-zug") — nie ein roher Flip am Blend-System vorbei.
    // DIE WETTER-WACHE: `weatherEffectTime` unter 0 ist der Halt einer Messung (die Bühne der Linsen,
    // scripts/lib/ausgabe-aufnahme.cjs `__wetterHalten`; im Spiel steht er auf 0). Halt heißt Halt:
    // solange er steht, dreht KEIN Schreiber das Wetter. Bis V18.534 hielt sie nur den Auto-Zug — der OMEN
    // fand in einem Boot sunny → rainy bei eingefrorener Uhr (ein anderer Schreiber: Nexus, Emotion, Gesetz).
    // DAS GESETZ DER SCHREIBER (`_himmelSchreiber`, Leben-Schau 2): der SPIELER schreibt, und sein Wort steht
    // (`wetterWort`, bis „setze wetter frei"); ein Gesetz des Spielers schreibt wie er; solange das Wort steht, dreht
    // weder der Zug noch die Welt das Wetter (false). Ohne Wort schreibt die WELT (Nexus, seine Gesetze, die Emotion,
    // die Wesen) nie selbst: sie WÜNSCHT das nächste Wort — ein AKT mit Welt-Uhr-Stempel (`_wunschAkt`, Rückgabe "wunsch"),
    // der Zug zieht es in seinem Takt (`WETTER_ZUG_SEK`). Vorher hielt „setze wetter sonnig" bis zum nächsten Nexus-Regen
    // (alle 4,7 s). `zug` ({ von, beginn, wunsch }) trägt der Wetter-Zug: sein Übergang ist eine Funktion der Welt-Uhr — aus
    // dem Wort der Front `von`, ab `beginn`, über die Dauer des Gesetzes (nie die Laune einer Seite), gleich welcher Übergang
    // lief —, sein Schreiber der gezogene Wunsch oder die Front. `akt` ({ w }): der Wunsch kam als Akt eines Mitspielers.
    _setWeather(name, quelle, zug, akt) {
        if (!(name in AnazhRealm.WEATHER_INTENSITY)) return false;
        if (this._messHalt()) {
            this.log(`Wetter gehalten: ${quelle || "?"} wollte ${name}`, "DEBUG");
            return false;
        }
        const wer = this._himmelSchreiber(quelle, "wetter");
        if (wer === "welt" || wer === "eigen") {
            if (this.state.wetterWort) {
                this.log(
                    `Wetter gehalten: ${quelle || "?"} wollte ${name} — es gilt das Wort des Spielers (${this.state.wetterWort})`,
                    "DEBUG"
                );
                return false;
            }
            if (wer === "welt") {
                this._wunschAkt(name, quelle || "?", akt);
                return "wunsch";
            }
        }
        if (wer === "spieler") {
            this.state.wetterWort = name;
            this.state.wetterWuensche = [];
        } else if (wer === "gesetz" && this.state.wetterWort) this.state.wetterWort = name;
        const oldWeather = this.state.weather;
        this.state.weather = name;
        // der wahre Schreiber (affekt.K4#2): der Zug nennt den Wunsch der Welt, den er zog, oder die Front — auch wenn das Wort
        // blieb (bis feld.K2#2 hieß ein still gezogener Wunsch weiter „front")
        const wunsch = quelle === "auto-zug" && zug && zug.wunsch;
        this.state.wetterSchreiber = quelle !== "auto-zug" ? quelle || "?" : wunsch ? wunsch.quelle : "front";
        if (zug) {
            this.state.weatherTransition = null;
            this.requestWeatherTransition(name, AnazhRealm.WETTER_UEBERGANG_S, zug.von, zug.beginn);
        } else if (oldWeather !== name) {
            this.requestWeatherTransition(name, undefined, oldWeather);
        }
        // updateSkyboxWeather wird nicht direkt gerufen —
        // _applyDayNightToScene übernimmt das pro Frame.
        this.updateCreatureEmotions();
        return true;
    }

    // DER SPIELER GIBT DAS WETTER FREI („setze wetter frei"): sein Wort fällt, ein alter Wunsch der Welt mit ihm; das Wetter
    // steht bis zum nächsten Zug der Welt-Uhr, dann zieht es wieder.
    _wetterFreigeben(quelle) {
        const wer = this._himmelSchreiber(quelle, "wetter");
        if (wer !== "spieler" && wer !== "gesetz") return false;
        this.state.wetterWort = null;
        this.state.wetterWuensche = [];
        this._wetterZug = Math.floor(this.state.spielZeit / AnazhRealm.WETTER_ZUG_SEK);
        return true;
    }

    // DER WUNSCH DER WELT IST EIN SCHREIB-AKT (feld.K2#2, Lockstep: Zufall und Takt nur aus Saat, Welt-Uhr und Akten). Jede Seite
    // trägt ihre eigene Welt-Stimme (Nexus, seine Gesetze, das Gemüt ihres Spielers) — ihr Wunsch ist darum keine Funktion von Saat
    // und Uhr, er ist eine EINGABE: er steht mit seinem Stempel der Welt-Uhr `w` in der Liste der Wünsche (`wetterWuensche`) und
    // reist als Akt über den dsl-Kanal (`p2pBroadcastDsl` mit Stempel und Quelle), der Empfänger nimmt ihn mit DEM Stempel des
    // Absenders (`akt`). Der Zug k zieht den letzten Wunsch aus dem Fenster des Zugs davor (`_wunschDesZugs`) — auf jeder Seite
    // derselbe, gleich in welcher Folge die Akte ankamen. Bis feld.K2#2 hielt jede Seite EINEN Wunsch (`wetterWunsch`), den ihr
    // eigener Nexus schrieb: unter Last zog A „rainy von rule:emotion:sorrow", B „sunny von rule:nexus" (2 von 3 Läufen).
    _wunschAkt(wort, quelle, akt) {
        const w = akt ? akt.w : this.state.spielZeit;
        if (this._wunschNimm({ wort, quelle, w }) && !akt)
            this._aktSenden({ type: "dsl", program: ["weather", wort], w, quelle });
    }

    // Ein Wunsch tritt in die Liste (je Stempel, Wort und Quelle EINMAL — ein doppelt empfangener Akt ist einer); sie trägt nur die
    // Fenster, die ein Zug noch zieht. Kam er spät (sein Fenster ist das des Zugs, der schon zog — der Mitspieler war voraus), zieht
    // der Zug neu: das Wetter ist eine Funktion des Fensters, nie der Ankunft. → ob er neu war
    _wunschNimm(wunsch) {
        const st = this.state;
        const Z = AnazhRealm.WETTER_ZUG_SEK;
        if (!(wunsch.wort in AnazhRealm.WEATHER_INTENSITY) || !Number.isFinite(wunsch.w)) return false;
        const L = (st.wetterWuensche || []).filter((x) => Math.floor(x.w / Z) >= Math.floor(st.spielZeit / Z) - 1);
        if (L.some((x) => x.w === wunsch.w && x.wort === wunsch.wort && x.quelle === wunsch.quelle)) return false;
        L.push({ wort: wunsch.wort, quelle: String(wunsch.quelle).slice(0, 80), w: wunsch.w });
        st.wetterWuensche = L;
        if (this._wetterZug !== undefined && Math.floor(wunsch.w / Z) === this._wetterZug - 1 && !this._messHalt())
            this._wetterZugZiehen(this._wetterZug);
        return true;
    }

    // Der Wunsch, den der Zug `zug` zieht: der letzte (der späteste Stempel; bei gleichem Stempel das größere Wort|Quelle) aus dem
    // Fenster des Zugs davor — oder keiner.
    _wunschDesZugs(zug) {
        const Z = AnazhRealm.WETTER_ZUG_SEK;
        let best = null;
        for (const x of this.state.wetterWuensche || [])
            if (
                Math.floor(x.w / Z) === zug - 1 &&
                (!best || x.w > best.w || (x.w === best.w && x.wort + "|" + x.quelle > best.wort + "|" + best.quelle))
            )
                best = x;
        return best;
    }

    // [ATMOSPHERE] Startet einen Cross-Fade. Default-Dauer via _emotionModulate aus den Emotionen
    // (peace ×1.6 langsamer, chaos ×0.4 schneller); eine explizite Dauer (`dauerS`, Sekunden der Welt-Uhr) überschreibt.
    // `beginn` ist die Welt-Uhr (s), ab der er läuft — ohne sie jetzt. Bis zeit-ein-kalender trug er Millisekunden (`duration`).
    requestWeatherTransition(target, dauerS, fromWeather, beginn = this.state.spielZeit) {
        // D5a (V18.128) — das Vokabular ist die WEATHER_INTENSITY-Tabelle
        // (sunny · rainy · stormy), nicht mehr das harte Binär-Paar.
        if (!(target in AnazhRealm.WEATHER_INTENSITY)) return false;
        let dur;
        if (typeof dauerS === "number" && Number.isFinite(dauerS)) {
            dur = Math.max(0.1, dauerS);
        } else {
            // Default mit Emotion-Modulation
            const modulated = this._emotionModulate(AnazhRealm.WETTER_UEBERGANG_S, {
                peace: { mul: 1.6 }, // peace=1 → ×1.6 (72s)
                chaos: { mul: 0.4 }, // chaos=1 → ×0.4 (18s)
                sorrow: { mul: 1.2 }, // sorrow zieht Wolken langsam-melancholisch
            });
            dur = Math.max(8, Math.min(120, modulated));
        }
        const wt = this.state.weatherTransition;
        let from = typeof fromWeather === "string" ? fromWeather : this.state.weather;
        if (wt && wt.from && wt.to && wt.to !== target) {
            // Mitten im Übergang — behalte Vorgänger-from, aber neues to.
            from = wt.from;
        } else if (wt && wt.to === target) {
            // Schon auf demselben Ziel — no-op (idempotent).
            return true;
        }
        if (from === target) {
            // Schon dort, kein Übergang nötig.
            this.state.weatherTransition = null;
            this._regenWeg(target, target, beginn, 0); // ab `beginn` regnet, was das Wort trägt (wetter.K3)
            return true;
        }
        this.state.weatherTransition = {
            from,
            to: target,
            progress: 0,
            dauer: dur,
            startedAt: beginn,
        };
        this._regenWeg(from, target, beginn, dur); // der Weg des Regens folgt dem Übergang auf der Welt-Uhr (wetter.K3, feld.K2#2)
        return true;
    }

    // Pro Frame: treibt weatherTransition.progress auf der Welt-Uhr (`startedAt` und `dauer` in s der Welt-Uhr); bei ≥ 1
    // state.weather = to, Transition genullt. Währenddessen wirken Skybox-Mul (_applyDayNightToScene) und die Klang-Welt (der
    // Regen liest das transition-aware Wetter-Feld `_weatherFieldFor` — kein zweiter Schreiber).
    tickWeatherTransition(_currentTime) {
        const wt = this.state.weatherTransition;
        if (!wt) return;
        wt.progress = Math.max(0, Math.min(1, (this.state.spielZeit - wt.startedAt) / wt.dauer));
        if (wt.progress >= 1) {
            // Übergang abgeschlossen: state.weather steht seit dem Aufruf auf dem Ziel; der nächste
            // DayNight-Tick setzt die finale Skybox-Tönung (currentTint direkt).
            this.state.weatherTransition = null;
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_himmel]);

// ===== ATLAS · Bild/himmel — Außen-Konstanten =====
// DAS LICHT DES AUGES (`_dayNightApplyAugenLicht`): jede dem Auge zugewandte Fläche zeigt in seinem Schein dieselbe
// Helligkeit wie am Mittag — die 18-%-Karte in `karteM` das Mittelgrau (die Stärke folgt der Belichtung: das Auge
// adaptiert an sein Licht). Es ist ein Platz des Licht-Pools mit Himmels-Ersatz (K11) und fällt nach dem EINEN Punktlicht-
// Gesetz (fachwerk `lichtAbfall`, K11b): mit `abfall` 1 und dem weiten Kern `kernM` 8 (ein Schein, keine Flamme) zeigt die
// Wand in 0,3 m 1,03× die Karte in 2 m (ihre Maserung), in 10 m 57 %, in 15 m 23 % (bis K11b, Legacy-Abfall (1 − d/R):
// 1,09× · 56 % · 28 %), und an `reichweiteM` fällt es stetig auf 0. Werkbank 11.10., echte GPU, Auge 11: mit 1/d ohne
// Kern lag die Wand in 0,2–0,6 m weiß ohne Maserung (Helligkeit 210), mit 1/d² alles hinter 3 m schwarz. `kelvin` 4 750 —
// warmweiß, derselbe Farbort wie bis K11b das Hex 0xffe2c6 (eine Flamme, 0xffc489, tönte den Fels orange); der Himmel am Auge
// (`_himmelAmAuge`) liest die Himmels-Sicht im Umkreis `umkreisM`, neu nach `neuM` Metern Weg.
AnazhRealm.AUGEN_LICHT = Object.freeze({
    karteM: 2,
    abfall: 1,
    kernM: 8,
    reichweiteM: 20,
    kelvin: 4750,
    umkreisM: 4,
    neuM: 0.25,
});
// DAS SAISON-GESETZ (foundry-core SAISON_GESETZ, V18.527): die Jahres-Stützstellen des Studios — der EINE Leser
// (`_saisonMul`, `_saisonPraesenz`; ihre Leser jede Stufe: Stoff, Karte, Fern-Krone), fail-closed in EINER Gültigkeits-Wand: je
// Stütze Tönung, Laub-Präsenz und Blüte, die Typen des Jahrs (vegetation.K5). `kartenGewicht` und `karteSchwelle` liest die Welt
// seit w21 nicht mehr (ihre Karte backt im Jahr, `_karteJahr`) — ihr Leser ist der Impostor des Labors (worlds/terrain).
AnazhRealm._saisonGesetz = function () {
    const SG = AnazhRealm.Gesetz("terrain:SAISON_GESETZ", null);
    if (
        SG &&
        Array.isArray(SG.stuetzen) &&
        SG.stuetzen.length === 4 &&
        SG.stuetzen.every((s) => s && Number.isFinite(s.ti) && Number.isFinite(s.pr) && Number.isFinite(s.bl)) &&
        Number.isFinite(SG.bau) &&
        Number.isFinite(SG.mulMin) &&
        Number.isFinite(SG.mulMax) &&
        SG.typ &&
        Number.isFinite(SG.typ.laub) &&
        Number.isFinite(SG.typ.bluete) &&
        Number.isFinite(SG.typ.halm)
    )
        return SG;
    return AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ");
};
// Die Lage einer Welt-Phase zwischen den vier Stützen des SAISON_GESETZ (Studio-t: 0 Frühling · .25 Sommer · .5 Herbst · .75
// Winter, linear im Ring): die Welt-Phase zählt die Saison-MITTEN (Sommer 0,375) → t = phase − 0,125. Die EINE Lage, die
// Tönung (`_saisonMul`) und Präsenz (`_saisonPraesenz`) lesen.
AnazhRealm._saisonLage = function (phase) {
    const SG = AnazhRealm._saisonGesetz();
    const f = ((((phase - 0.125) % 1) + 1) % 1) * 4;
    const i = Math.floor(f) % 4;
    return { SG, a: SG.stuetzen[i], b: SG.stuetzen[(i + 1) % 4], k: f - Math.floor(f) };
};
AnazhRealm.LUFT = Object.freeze(Object.assign({}, AnazhRealm._atmoKern().luft));
// DIE WOLKEN-SCHICHT (licht.K4, `_wolkenFeld` · `_wolkenKarte` · `_wolkenSchatten`): Höhe, Karte des Wurfs und die Achse des
// Wetters — EINE Tafel im Baustein (welt-licht.js `WOLKEN_SCHICHT`), die Bühne der Studios liest dieselbe.
AnazhRealm.WOLKEN_SCHICHT = __weltLicht.WOLKEN_SCHICHT;
// DAS SCHIRM-DREIECK (welt-licht.js `schirmDreieck`): EIN Dreieck über den ganzen Schirm in der Form von r184 `QuadMesh`, sein
// Fragment aus `fn()` — die Pässe der Atmosphäre und das Ausgabe-Dreieck jeder Bühne (`_buehneRender`) teilen Geometrie und Kamera;
// die Bühne der Studios zeichnet ihre Tafeln mit demselben.
AnazhRealm._schirmDreieck = __weltLicht.schirmDreieck; // der Baustein der Engine (welt-licht.js), die Bühnen der Studios zeichnen mit ihm
// DER HIMMEL (V18.530): die Sichtbarkeit seiner Punkte ist Physik. `grenzgroesse` = Dämmerungs-Anker [Sonnenhöhe
// in Grad, Grenzgröße des bloßen Auges]: im hellen Tag (≥ 10°) ist nichts zu sehen, nahe dem Horizont gerade die
// Venus, bei Sonnenuntergang der Abendstern (−3), am Ende der bürgerlichen Dämmerung (−6°) die hellsten Sterne
// (+1,5), der nautischen (−12°) +4, in astronomischer Nacht (−18°) +6. Die Punkte selbst — Sterne, Veränderliche und die
// Planeten als PUNKTE des Feldes — sind die Sicht der Kosmos-Funktion (welt-licht.js `kosmos`, `_kosmosJetzt`); ihre Zahl,
// ihre Größenklassen, ihre Töne und ihre Folge trägt keine Tafel hier. `kosmosSchrittTage` = die Stufe des Tags, in der
// Planeten und Veränderliche nachziehen (eine Viertelstunde: der schnellste Planet wandert darin ≤ 0,02°).
AnazhRealm.HIMMEL = Object.freeze({
    grenzgroesse: __weltLicht.GRENZGROESSE, // die Anker der EINEN Tag-Achse (welt-licht.js `tagAchse`)
    kosmosSchrittTage: 1 / 96,
    // DIE STREU-FUNKTION DES AUGES (stern-bild, `_buildStarField`; Spencer u. a. 1995): f(θ) = 2,61·10⁶ e^(−(θ/a)²) + 20,91/(θ + a)³
    // + 72,37/(θ + a)² (θ in Grad, a 0,02°) — die Anteile bis 10° Kern 3 280 · nah 3 284 · fern 2 365 von 8 929. Der Halbmesser der
    // Scheibe eines Punkts (`_sternKante`) wächst mit √Licht — dort fällt sein fernster Saum (∝ θ⁻²) auf den eines Sterns der
    // Feldgrenze am Rand seines Kerns (`theta0` 0,03° = 1,5 a): 0,03° an der Feldgrenze, 0,6° bei m 0, 4,5° für Venus;
    // mindestens `minPx` Pixel (der Kern, σ ≈ 0,3 Pixel) — der schwache Punkt deckt so viele Pixel wie bis stern-bild jeder
    // (2 × 2), nur der helle trägt seinen Saum (mit 0,1° deckte das Feld 5- bis 10-mal die Fläche für Säume unter der Grenze)
    // `schwelle` (stern-sicht): DIE SCHWELLE DES SCHIRMS — der belichtete Wert (L × k) des Kerns eines Punkts an der Grenzgröße, summiert über die Pixel (stern-uhr; bis dahin die Spitze am Kern-Pixel),
    // des Auges: 0,0334 legt die Tonkurve (Fuß 6,25·x²) auf 0,0070 linear = 20 von 255 über schwarzem Himmel, der feinste Punkt,
    // der auf dem Schirm als Punkt steht; eine Klasse heller 2,5-mal, zwei Klassen bis zur Schulter. Vor hellem Himmel hebt der
    // Knoten den Schritt, bis er auf dem Schirm gleich weit trägt (`vorHimmel`, `_buildStarField`)
    sternBild: Object.freeze({
        a: 0.02,
        kern: 0.367,
        nah: 0.368,
        fern: 0.265,
        theta0: 0.03,
        minPx: 1,
        schwelle: 0.0334,
        // die Untergrenze von σ_o in Pixeln (stern-uhr, Nenner des Knotens): bei 0,01 Pixel steht
        // erf(½ ÷ (√2 σ_o)) = erf(35) in float32 auf 1 — der ganze Kern in EINEM Pixel, die Grenze ändert keinen Wert, sie hält nur
        // den Nenner endlich (σ_o → 0 bei groben Pixeln: 0,04 Pixel im Szenen-Ziel des Fensters der Station, 270 Zeilen bei 75°)
        sigmaMin: 0.01,
    }),
    // die Leuchtdichte der Vollmond-Scheibe in cd/m² (≈ 2 500; ihr Licht ADDIERT sich zum Himmel vor ihr — am Tag steht sie
    // als blasser Schleier im Blau, 2 500 gegen ≈ 5 000–8 000 cd/m², nachts als die hellste Fläche des Bilds)
    mondCd: 2500,
    // DIE SONNE (Integration 05.10.): der Körper steht `koerperAbstandM` vor der Kamera (Sonne und Mond, vor der Skybox
    // bei 500 m); die Scheibe trägt den echten Winkel `sonneWinkelGrad` (0,53°) und die Leuchtdichte `sonneCd` ×
    // ihre Farbe — über dem HDR-Hof der Skybox (Scheibe + Halo ≈ 2,6 linear), sonst deckte das Mesh die Mitte grau.
    koerperAbstandM: 380,
    sonneWinkelGrad: 0.53,
    sonneCd: 1.6e9,
});
// DER HALBMESSER DER SCHEIBE eines Punkts der Größenklasse m in Grad (`_sternPunkt`): θ0 · 10^(0,2·(G − m)) — der ferne Saum des
// Auges fällt mit θ⁻², so steht er am Rand jeder Scheibe gleich hell (der eines Sterns der Feldgrenze G in θ0). Die Fläche wächst
// mit dem Licht.
// DAS AUGE EINES PUNKTS (stern-sicht, `_buildStarField`): die Verstärkung Auge → Schirm im belichteten Raum — Schwelle ÷ (E_G ×
// SB.kern): das Licht des Kerns eines Punkts an der Grenzgröße G (E_G = sternLx0 · 10^(−0,4·G) ÷ EINHEIT_LX), summiert über
// die Pixel, steht auf `sternBild.schwelle` — das Gesamtlicht (Anteil 1), seit stern-uhr in jeder Lage unter dem Raster gleich
// und vom Pixel unabhängig (der Kern ist über die Fläche des Pixels integriert); bis stern-uhr las das Auge die Spitze des
// Gauß an der Pixelmitte. Pixel und Halbmesser bleiben die Rufform der Leser. Leser: `_dayNightApplyStarField`, die Linse 12 SICHT.
AnazhRealm._sternAuge = (G, _pixel, _radius) => {
    const eG = (__weltLicht.KOSMOS.sternLx0 * 10 ** (-0.4 * G)) / __weltLicht.EINHEIT_LX;
    const S = AnazhRealm.HIMMEL.sternBild;
    return S.schwelle / (eG * S.kern);
};
// DIE FEHLERFUNKTION (stern-uhr): Abramowitz–Stegun 7.1.26, Fehler ≤ 1,5·10⁻⁷ — [p, a1 … a5], die Tafel der Funktion `erf`
// im Stern-Knoten (`_buildStarField`)
AnazhRealm.ERF_AS = Object.freeze([0.3275911, 0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429]);
AnazhRealm._sternKante = (m) => {
    const S = AnazhRealm.HIMMEL.sternBild;
    return S.theta0 * Math.pow(10, 0.2 * (__weltLicht.KOSMOS.feldGrenze - m));
};
// DIE MATRIX EINES PUNKTS (`_buildStarField`, `_kosmosFeldZeit`): der Punkt (x, y, z) auf der Kuppel des Felds, das Quad zur
// Mitte gewandt (die Kamera — starField folgt ihr), Kante 1 — die Kante der Streu-Scheibe trägt der Stoff (`uPixel` × `aKante`, Lehre 22)
AnazhRealm._sternMatrix = (sf, i, x, y, z) => {
    const T =
        AnazhRealm._sternMatrixTmp ||
        (AnazhRealm._sternMatrixTmp = {
            pos: new THREE.Vector3(),
            quat: new THREE.Quaternion(),
            scale: new THREE.Vector3(),
            m: new THREE.Matrix4(),
            von: new THREE.Vector3(0, 0, 1),
            zu: new THREE.Vector3(),
        });
    T.pos.set(x, y, z);
    T.zu.copy(T.pos).negate().normalize();
    T.quat.setFromUnitVectors(T.von, T.zu);
    T.scale.set(1, 1, 1);
    T.m.compose(T.pos, T.quat, T.scale);
    sf.setMatrixAt(i, T.m);
};
// MONDLICHT: nachts wird das Haupt-Richtlicht zur Mondquelle (gegenüber der Sonne, kühl + gedämpft →
// gerichtete Nacht-Schattierung mit tiefen Schwärzen) statt die Nacht per Post-FX aufzuhellen.
// `r/g/b` = HUE (Purkinje-Mond 0x9fb8dc aus dem Gesetz `ATMO_GESETZ.nacht.mond` — `_atmoSonne(e)` und das Labor lerpen
// unter dem Horizont exakt hierher; b>r = kühl), `intensity` = Helligkeit; Wetter dimmt den Mond.
AnazhRealm.MOONLIGHT = __weltLicht.MOONLIGHT; // welt-licht.js: der Hue aus `ATMO_GESETZ.nacht.mond`, die Helligkeit 0,65
// DIE TAFELN DER EINEN ATMOSPHÄRE (D3, Hillaire 2020; `_atmoLutBau`): Größen (Texel) und Marsch-Schritte. Transmittance
// 256×64 und Ψ_ms 32×32 je Medium, die Himmels-Sicht 192×108 je Stufe der Sonne, die Umgebung 128×64 (Equirekt, PMREM).
// mediumStufe: die Stufe des Mediums im Logarithmus der Extinktion (`_atmoMediumJetzt`) — 2 % halten den Zenit-Durchlass
// der klaren Luft (Aerosol-Tiefe 0,18) unter einer 8-bit-Stufe; ein Übergang klar → Sturm (Faktor 13) sind 130 Stufen.
// flug: so viele Stufen darf das Medium wandern, solange die Tafel im Flug ist (`_waagrechtIrradianz`) — der steilste Anstieg im
// Zug klar → Regen (β ×1,13 je Sekunde, 6 Stufen) bleibt eine Sekunde darunter, der Himmel je E0 folgt ihm mit ≤ β^0,62:
// 8 Stufen sind ≤ 10 % am Himmel, am Mittag ≤ 0,02 EV an der Karte.
AnazhRealm.ATMO_LUT = __weltLicht.ATMO_LUT; // welt-licht.js — die Größen und Schritte der Tafeln (`atmoTafeln`)
// DER BODEN DER ATMOSPHÄRE (D3): die gemessene Welt-Albedo (linear) — das Mittel aus Laub und Wald-Boden der Albedo-Tafel
// (spec/farbe/albedo-tafel.json, ist.welt; `werkbank albedo --tafel`), nie ein Grau 0,3. Er trägt die untere Hälfte der EINEN
// Umgebung — den Boden, den jeder nahe Stoff spiegelt; die Mehrfachstreuung sieht seine Leuchtdichte ohne Buntheit (welt-licht.js
// `ATMO_ERDE`, w25-ferne-licht: sein Grün trug den Horizont grün). w4-ferne-blau setzte das Mittel der Fern-Farbe ±100 km
// (0,1130/0,1344/0,0646, G/B 2,1 statt 3,1) für beide: der graue Boden der Ferne stand in jeder nahen Spiegelung, der Film der
// Tore las als Milch (gate:portal-membran H, Radeon: milchweiß 4,7 → 5,3 % > 5 %) — heil-w4-ferne-blau.
AnazhRealm.ATMO_BODEN = __weltLicht.ATMO_BODEN; // welt-licht.js — [0,1003 · 0,1385 · 0,0449]
// Licht-Rig: KEY_BASE skaliert die Rayleigh-Lichtmenge aufs Schlüssellicht (Mittag ≈ 2.6·0.913). Ziel key-dominant (Vorlage dir/(amb+hemi) ≈ 15:1); die Schattenseite trägt der Himmel.
AnazhRealm.KEY_BASE = __weltLicht.KEY_BASE; // welt-licht.js — 2,6
// r128→r184-Licht-Übersetzung (three.js r155, useLegacyLights → physisch): Legacy-Licht hatte keine
// 1/π-BRDF-Normierung — physikalische Lichter sind bei gleicher Zahl ~π-fach dunkler. Die aus dem
// r128-Studio kopierten Rig-Werte (Key · Hemi-Tag) laufen durch diesen EINEN Faktor;
// die Nacht bleibt unberührt (Mond-Pfad eigen). Kein Tuning-Knopf.
AnazhRealm.LEGACY_LICHT = __weltLicht.LEGACY_LICHT; // welt-licht.js — π
// DIE BELICHTUNG (licht.K1, `_dayNightApplyBelichtung`) — EINE Eichung mit der Tonkurve (F1): `kurve` ist die Tonkurve des
// Renderers (25a liest sie, three r184: Khronos PBR Neutral), `zielKarte` das k·L der 18-%-Karte, das DIESE Kurve auf Mittelgrau
// legt (sRGB 118, der absolute Anker des Mittags: Luma 110–130; Neutral gibt unter der Schulter x − 0,04 aus, linear 0,18 braucht
// 0,22 — `kartenEichung(kurve, 0)` in scripts/lib/licht-linsen.cjs rechnet es nach). `min` ist nur die Wand gegen ein
// entartetes Licht. `steigung` ist die Kompensations-Steigung des Tags (1 = volle Adaption, 0 = feste Blende): die Karte fällt mit
// 1 − s des gemessenen Lichts. `stufen` sind die Knoten [Grad, Stufen] der Tag-Achse für Dämmerung und Nacht, `gleitung`
// [oben, unten] das Band, in dem die Kamera von der Steigung auf sie gleitet. Gemessen an der Mess-Wiese in Ego (swiftshader,
// je Uhr das Histogramm der Szene vor der Tonkurve): s 0,75 legt die Sonne 10° morgens und abends 0,67 EV unter den Mittag (die
// Karte selbst −0,87 Stufen, im Bild −1,17 EV: die Wiese als Dach fällt flacher als eine waagrechte Fläche), die Nacht −2,17
// Stufen 3,14 EV darunter bei Luma 44; die Dämmerung fällt 1,3 Stufen über 30° — unter 0,1 EV je 0,72° Sonne auch im Fuß der
// Kurve (6,25·x²), wo das Bild doppelt so steil fällt wie die Stufe. `nachtGrad` (S7) ist die Tiefe der Sonne, in der das
// Nacht-Auge der Post-Kette ganz steht (der Kanal `tag` der Tag-Achse).
AnazhRealm.BELICHTUNG = __weltLicht.BELICHTUNG; // welt-licht.js — kurve Neutral · zielKarte 0,22 · min 0,05 · steigung 0,75 · gleitung [12, 8] · stufen [10, −0,87] [−20, −2,17] · nachtGrad −32
// Mindestabstand zwischen zwei Neuzeichnungen der Umgebung (PMREM) in WELT-Zeit (`spielZeit`, ms). E0 und Tönung zeichnen sie
// nicht mehr neu (`_umgebungLicht`), es bleiben Sonne, Mond, Medium und Höhe des Auges. Bis w4-licht-uhr 6 000 ms Wanduhr: der
// Himmel je Einheit E0 wächst im Übergang klar → Regen mit dem Medium (0,163 → 0,335, etwa β^0,35), die Umgebung zog ihm in
// Stufen nach, auf der GTX alle ~8 Spiel-Sekunden, auf swiftshader jede — das Bild sprang je Gerät anders (licht.K5 GTX
// 0,230 EV/s, takt24c). Im steilsten Anstieg (β ×1,13 je Sekunde) wächst er 0,11 EV je Sekunde: eine halbe Welt-Sekunde hält
// jede Stufe der Umgebung bei 0,05 EV, höchstens zwei PMREM je Sekunde und nur im Übergang, auf jedem Gerät dieselbe Folge.
AnazhRealm.SKY_ENV_REGEN_MIN_MS = 500;
// Die Obergrenze der Sonnen-Stufe (`_sonnenStufe`): N·L ändert sich bei einer Drehung um α höchstens um α — unter einer
// 8-bit-Stufe ist sie unsichtbar.
AnazhRealm.SONNEN_STUFE_SCHATTIERUNG = 1 / 255;
// DIE WÖRTER DER JAHRESZEIT (ki.K5): EINE Tafel für `setSeason` und das Gesetz der Werte der DSL (`AnazhRealm.DSL_WERTE`,
// die KI liest sie im Prompt) — bis ki.K5 kannte die KI die Jahreszeiten nur aus einem Beispiel und schrieb für „verwandle die
// welt in einen winter" ["weather","stormy"].
AnazhRealm.JAHRESZEITEN = Object.freeze({
    fruehling: "spring",
    frühling: "spring",
    spring: "spring",
    sommer: "summer",
    summer: "summer",
    herbst: "autumn",
    autumn: "autumn",
    winter: "winter",
});
