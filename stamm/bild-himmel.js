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
        });
        return st.skyboxUniforms;
    }

    // DIE HIMMELS-SICHT in Richtung `vDir` (normiert, ein TSL-Knoten): die EINE Atmosphäre und die Wolken des HIMMEL_GESETZ —
    // die Kuppel zeichnet sie (vDir = normalize(positionLocal), V8.26), das Wasser spiegelt sie (`_wasserBlick`, A1: bis dahin
    // las der Spiegel die Umgebung von 128 × 64 ohne Wolken — wo das Bild den Himmel nicht trug, ein Verlauf).
    _himmelSicht(vDir) {
        const TSL = THREE.TSL;
        const { vec2, vec3, float, normalize, dot, floor, fract, mix, smoothstep, clamp, max, Fn } = TSL;
        // DER HIMMEL IST DIE ATMOSPHÄRE (D3): die Kuppel liest die Himmels-Sicht der EINEN Atmosphäre (`_atmoLutBau`,
        // Hillaire) — Rayleigh-Blau, Mie-Hof um die Sonne, Dämmerung und Mondnacht aus dem Medium; bis D3 eine Nebel-Kuppel
        // (Indigo-Noise × Tint-Farbe, Horizont-Dunst, drei Halo-Schichten), getunt statt gerechnet. Die Scheibe der Sonne
        // trägt ihr Körper (`sunMesh`), den Hof die Mie-Phase der Tafel.
        const A = this._atmoLutBau();
        const { time: uTime, cloudCover: uCloudCover, sunDir: uSunDir, sunCol: uSunCol } = this._himmelUniformen();
        // Das Wolken-Feld folgt HIMMEL_GESETZ (foundry-core — dieselben Zahlen injiziert das Studio in sein
        // GLSL): Himmelsebenen-Projektion sp=dir.xz/(dir.y+projY), zwei fbm-Abtastungen (h21/vn verbatim),
        // Deckungs-smoothstep aus uCloudCover, Horizont-Ausklang, Farbton uSunCol (_atmoSonne).
        // max(y,hor0) klemmt den Nenner unter dem Horizont (TSL brancht nicht wie das Studio) — sonst NaN.
        // Fail-closed: das Gesetz lebt NUR in foundry-core (__terrainCore); unlesbar → Bruch, der schreit.
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        const h21 = Fn(([q]) => {
            const p = fract(q.mul(vec2(123.34, 345.45)));
            const p2 = p.add(dot(p, p.add(34.345)));
            return fract(p2.x.mul(p2.y));
        });
        const vn2 = Fn(([q]) => {
            const i = floor(q);
            const f0 = fract(q);
            const f = f0.mul(f0).mul(float(3.0).sub(f0.mul(2.0)));
            return mix(
                mix(h21(i), h21(i.add(vec2(1.0, 0.0))), f.x),
                mix(h21(i.add(vec2(0.0, 1.0))), h21(i.add(vec2(1.0, 1.0))), f.x),
                f.y
            );
        });
        const fbm2 = Fn(([q]) => {
            let s = float(0.0);
            let p = q;
            let a = 0.5;
            for (let o = 0; o < HG.fbm.okt; o++) {
                s = s.add(vn2(p).mul(a));
                p = p.mul(HG.fbm.lac).add(HG.fbm.off);
                a *= 0.5;
            }
            return s;
        });
        // DIE WOLKE NUR, WO SIE IST (A1-n1, Gebot 7): unter `hor[0]` klingt sie auf null aus — dort rechnet die Sicht die
        // Atmosphäre allein (exakt dasselbe Bild); der Spiegel des fernen Wassers liegt ganz darunter (2,6 m Auge, 170 m weit).
        return Fn(() => {
            const sicht = A.himmelFarbe(vDir).toVar();
            TSL.If(vDir.y.greaterThan(HG.hor[0]), () => {
                const sp = vDir.xz.div(max(vDir.y, float(HG.hor[0])).add(HG.projY));
                const dr = vec2(uTime.mul(HG.drift[0]), uTime.mul(HG.drift[1]));
                const nA = fbm2(sp.mul(HG.s1).add(dr));
                const nB = fbm2(sp.mul(HG.s2).sub(dr.mul(HG.drift2)));
                const cov = uCloudCover;
                const dens = smoothstep(
                    float(HG.dens[0]).sub(cov.mul(HG.dens[1])),
                    float(HG.dens[2]).sub(cov.mul(HG.dens[3])),
                    nA.mul(HG.mixN[0]).add(nB.mul(HG.mixN[1]))
                ).mul(smoothstep(float(HG.hor[0]), float(HG.hor[1]), vDir.y));
                const saW = clamp(dot(vDir, normalize(uSunDir)).mul(0.5).add(0.5), float(0.0), float(1.0));
                const litW = mix(
                    vec3(HG.litGrau[0], HG.litGrau[1], HG.litGrau[2]),
                    uSunCol.mul(HG.litSonne[0]).add(HG.litSonne[1]),
                    saW.mul(HG.litSa)
                );
                const edgeW = smoothstep(float(0.0), float(HG.edge[0]), nB).mul(HG.edge[1]).add(HG.edge[2]);
                const cloudAmt = clamp(dens.mul(edgeW).mul(HG.deck), float(0.0), float(1.0));
                // Wolken-Farbe = Studio-Gesetz: grau → sonnenbeschienen (litW), bedeckt → dunkler (HG.bedeckt).
                const cloudColor = mix(litW, vec3(HG.bedeckt[0], HG.bedeckt[1], HG.bedeckt[2]), cov.mul(HG.bedecktK));
                // DAS LICHT DER WOLKE aus den Tafeln: Sonne und Mond durch die Atmosphäre bis zur Wolken-Ebene (2 km über dem
                // Auge) auf ihre Oberseite, dazu der Himmel von oben (der Zenit der Himmels-Sicht, E/π) — Lambert. So ist die
                // Mittags-Wolke weiß über dem Blau und die Nacht-Wolke dunkler als die 18-%-Karte im Mondlicht.
                const U = A.U;
                const rW = U.hKm.add(A.RG + 2);
                const lichtWolke = A.durchlass(rW, U.sonne.y)
                    .mul(max(U.sonne.y, 0))
                    .add(U.mondE.mul(A.durchlass(rW, U.mond.y)).mul(max(U.mond.y, 0)))
                    .mul(U.licht.div(Math.PI))
                    .add(A.himmelFarbe(vec3(0, 1, 0)));
                const wolkeHell = dot(lichtWolke, vec3(0.2126, 0.7152, 0.0722));
                sicht.assign(mix(sicht, cloudColor.mul(wolkeHell), cloudAmt));
            });
            return sicht;
        })();
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
    _tickBootFernDeko() {
        if (!this._fernDekoDeferred) return;
        if (!this._buehneSteht()) return;
        this._fernDekoDeferred = false;
        try {
            this._buildStarField();
        } catch (err) {
            // Fern-Deko reißt den ewigen Loop nie — laut beim Namen (K22), nie tödlich
            this._stoffBruch("die Fern-Deko (Sterne)", err);
        }
    }

    // Sterne als diskrete Billboards statt Shader-Noise: Noise hat keinen Pixel-Footprint und aliast bei
    // Kamera-Rotation (Blinken); diskrete Quads rastert die GPU mit echtem Anti-Aliasing.
    // ~2800 Sterne deterministisch aus worldMeta.seed; Größe + Hue je Stern (O/B bläulich ↔ K/M gelblich);
    // Sidereal-Rotation mit timeOfDay um eine geneigte Achse, Position folgt der Kamera; AdditiveBlending.
    // DIE SICHTBARKEIT IST PHYSIK (V18.530): jeder Punkt trägt seine scheinbare Helligkeit als Größenklasse
    // (`aMag`), die Dämmerung setzt die Grenzgröße (der Kanal `grenze` der EINEN Tag-Achse, `_tagAchse`) — mittags ist NICHTS sichtbar,
    // in der Dämmerung erscheint zuerst der Abendstern, dann die hellen Sterne, in tiefer Nacht alle.
    // DIE WANDELSTERNE (`HIMMEL.wandelsterne`) sind die hellsten Punkte desselben Feldes — keine Kugeln.
    // Befund 04.10. (Blick-Tour 7-birke): drei Math.random-Kugeln (10–30 m auf 400 m = 3–8° — 6–16 Monde
    // breit, Zufallsfarbe, unbeleuchtet) standen am Mittagshimmel; die pinke war die sichtbare.
    _buildStarField() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const WANDEL = AnazhRealm.HIMMEL.wandelsterne;
        const FIX_COUNT = 2800;
        const STAR_COUNT = FIX_COUNT + WANDEL.length;
        const RADIUS = 480; // knapp innerhalb der Skybox-Sphere (500)
        // Deterministischer RNG aus dem Welt-Seed — alle Mitspieler sehen
        // denselben Himmel (Vision: eine Welt, ein Sternbild).
        const seedStr = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        let seedNum = 0;
        for (let i = 0; i < seedStr.length; i++) {
            seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0;
        }
        const rng = () => {
            // Mulberry32 — deterministisch, schnell, gute Verteilung
            seedNum = (seedNum + 0x6d2b79f5) >>> 0;
            let t = seedNum;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const positions = new Float32Array(STAR_COUNT * 3);
        const colors = new Float32Array(STAR_COUNT * 3);
        const sizes = new Float32Array(STAR_COUNT);
        const mags = new Float32Array(STAR_COUNT);
        const warm = new THREE.Color(1.0, 0.92, 0.75); // K/M-Sterne (gelblich)
        const cool = new THREE.Color(0.78, 0.86, 1.0); // O/B-Sterne (bläulich)
        const tmpCol = new THREE.Color();
        for (let i = 0; i < STAR_COUNT; i++) {
            const w = i >= FIX_COUNT ? WANDEL[i - FIX_COUNT] : null;
            // Gleichmaessige Verteilung auf der Kugel (kein Pol-Cluster)
            const u = rng();
            const v = rng();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            positions[i * 3] = RADIUS * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = RADIUS * Math.cos(phi);
            positions[i * 3 + 2] = RADIUS * Math.sin(phi) * Math.sin(theta);
            // Hue: mix warm/cool. Helligkeit korreliert leicht mit Groesse.
            const hue = rng();
            tmpCol.copy(cool).lerp(warm, hue);
            // Mindestgröße 3 px: kleinere Punkte flackern beim langsamen Drehen (Sub-Pixel an/aus).
            // Kleine Sterne werden DIMMER statt kleiner — die Helligkeit trägt die Variation.
            const sizeRoll = rng();
            const size = 3.0 + Math.pow(sizeRoll, 2) * 3.5; // 3..6.5 px, AA-sicher
            sizes[i] = size;
            // Helligkeit traegt die Stern-Variation (statt der Groesse):
            // pow³-biased → die meisten Sterne dim, wenige hell.
            const bright = 0.32 + Math.pow(sizeRoll, 3) * 0.68;
            colors[i * 3] = tmpCol.r * bright;
            colors[i * 3 + 1] = tmpCol.g * bright;
            colors[i * 3 + 2] = tmpCol.b * bright;
            // Die Größenklasse aus demselben Wurf: die meisten Sterne lichtschwach (6), wenige hell (bis −1).
            mags[i] =
                AnazhRealm.HIMMEL.sternMagSchwach - (AnazhRealm.HIMMEL.sternMagSchwach + 1) * Math.pow(sizeRoll, 3);
            if (w) {
                // Ein Wandelstern: dieselbe Kugel-Verteilung, eigene Farbe, eigene Helligkeit, ein Hauch größer.
                sizes[i] = w.groesse;
                colors[i * 3] = w.farbe[0];
                colors[i * 3 + 1] = w.farbe[1];
                colors[i * 3 + 2] = w.farbe[2];
                mags[i] = w.mag;
            }
        }
        // Jeder Stern ist ein 4-Vertex-Quad in einer InstancedMesh: die Quad-uv ist per TSL
        // `attribute("uv", "vec2")` WGSL-konform lesbar → Soft-Falloff smoothstep(0.5..0.08).
        // Quad-Normal zeigt zum Sphären-Zentrum (die Kamera — starField.position folgt ihr).
        // worldSize ≈ aSize × 1.0: bei RADIUS=480, FOV 70° und 720p ist 1 Welt-Einheit ≈ 1 px — kein
        // pixelRatio-Uniform, DPR wirkt über die Render-Auflösung.
        const TSL = THREE.TSL;
        const { uniform, attribute, vec2, vec4, float, length, smoothstep } = TSL;

        const uOpacity = uniform(0.5);
        // Die Grenzgröße des Himmels (der Kanal `grenze` der EINEN Tag-Achse, `_tagAchse`): ein Punkt leuchtet, wenn er heller ist als sie
        // (weich über ±0,5 Größenklassen).
        const uGrenze = uniform(-10);

        const planeGeo = new THREE.PlaneGeometry(1, 1);

        const starMat = new THREE.MeshBasicNodeMaterial();
        // Soft-Falloff vom Quad-Center: smoothstep(0.5, 0.08, dist) ist die
        // ursprüngliche V8.29-Formel — Quad-uv 0..1 mit Center bei (0.5, 0.5).
        const uv = attribute("uv", "vec2");
        const d = length(uv.sub(vec2(float(0.5), float(0.5))));
        const falloff = smoothstep(float(0.5), float(0.08), d);
        // Per-Instance Color via Three.js' automatisches `instanceColor`-
        // Attribute (gesetzt via mesh.setColorAt(i, color), gebunden im
        // Shader via attribute("instanceColor", "vec3")).
        const instColor = attribute("instanceColor", "vec3");
        const sichtbar = uGrenze.sub(attribute("aMag", "float")).add(0.5).clamp(0.0, 1.0);
        starMat.colorNode = vec4(instColor, falloff.mul(uOpacity).mul(sichtbar));

        // Material-Properties: identisch zur V10.0-f-2-PointsMaterial-Variante.
        starMat.transparent = true;
        starMat.depthWrite = false;
        starMat.depthTest = true;
        starMat.blending = THREE.AdditiveBlending;
        starMat.alphaTest = 0.01;
        // DoubleSide: Quad-Normale zeigt zum Sphere-Center; falls die Mesh-
        // Rotation in _loopRender (V8.28 sidereal) sie kippt, bleibt das
        // Quad sichtbar.
        starMat.side = THREE.DoubleSide;
        // EIN Befehl (Welle 6): ein durchscheinender DoubleSide-Stoff zeichnet in r184 zwei Durchgänge (Rück-, dann
        // Vorderseite) — jedes Quad zeigt der Kamera genau eine Seite, die additive Mischung vertauscht: ein Durchgang
        // ist dasselbe Bild.
        starMat.forceSinglePass = true;
        AnazhRealm._himmelImUnendlichen(starMat);

        // Der hellste Punkt des Himmels (kleinste Größenklasse): liegt die Grenzgröße mehr als ½ Klasse darüber, ist
        // kein Punkt sichtbar und das Feld zeichnet nicht (_dayNightApplyStarField).
        let hellste = Infinity;
        for (let i = 0; i < STAR_COUNT; i++) if (mags[i] < hellste) hellste = mags[i];
        this.state.starFieldUniforms = {
            opacity: uOpacity,
            grenze: uGrenze,
            hellste,
        };

        const starField = AnazhRealm._instanzMesh(planeGeo, starMat, STAR_COUNT);
        starField.name = "himmel-sterne";
        // Per-Instance-Matrix: Translation auf die Sphäre + Rotation (Normal zum Zentrum) + Scale
        // (worldSize). Einmal beim Build; die siderale Rotation läuft über starField.rotation.
        const tmpPos = new THREE.Vector3();
        const tmpQuat = new THREE.Quaternion();
        const tmpScale = new THREE.Vector3();
        const tmpMatrix = new THREE.Matrix4();
        const fromVec = new THREE.Vector3(0, 0, 1);
        const toVec = new THREE.Vector3();
        for (let i = 0; i < STAR_COUNT; i++) {
            tmpPos.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            toVec.copy(tmpPos).negate().normalize();
            tmpQuat.setFromUnitVectors(fromVec, toVec);
            const worldSize = sizes[i] * 1.0; // siehe Berechnung im Kommentar oben
            tmpScale.set(worldSize, worldSize, 1);
            tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
            starField.setMatrixAt(i, tmpMatrix);
            tmpCol.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
            starField.setColorAt(i, tmpCol);
        }
        starField.instanceMatrix.needsUpdate = true;
        if (starField.instanceColor) starField.instanceColor.needsUpdate = true;
        // instanceColor auch auf die Geometry binden: setColorAt setzt nur `mesh.instanceColor`, aber TSL
        // `attribute("instanceColor", "vec3")` sucht in `geometry.attributes` — ohne diese Brücke emittiert
        // es vec3(0) → schwarze Sterne.
        if (starField.instanceColor) {
            planeGeo.setAttribute("instanceColor", starField.instanceColor);
        }
        planeGeo.setAttribute("aMag", new THREE.InstancedBufferAttribute(mags, 1));
        starField.frustumCulled = false;
        // Sterne werfen und empfangen keine Schatten (unendlich ferne Billboards).
        starField.castShadow = false;
        starField.receiveShadow = false;
        this.state.scene.add(starField);
        this.state.starField = starField;
        this.log(
            `Stern-Feld erstellt — ${STAR_COUNT} InstancedMesh-Billboards (V10.0-i.a, WGSL-konformer Soft-Falloff)`
        );
    }

    // Setzt nur den Meeresspiegel state.waterLevel (falls ungesetzt). Das sichtbare Wasser baut jeder
    // Voxel-Chunk selbst (Iso-Surface aus den Wasser-Cells, s. unten).
    _buildWaterPlane() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        // Der Meeresspiegel ist ABSOLUT (`terrainBaseHeight − GRUND.meerUnterBasis` des Kerns): bis zur Welle L lief davor eine 13×13-Stichprobe
        // `_voxelSurfaceY` (169 Dichte-Säulen beim Boot), die nur sortiert und dann verworfen wurde (W-kD11).
        if (typeof this.state.waterLevel !== "number")
            this.state.waterLevel =
                (this.state.terrainBaseHeight || 0) - globalThis.__gelaendeCore.GRUND.meerUnterBasis;
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
            let bump = 0;
            if (this._growTreeNoise) {
                bump = this._growTreeNoise.noise2D(wx * 0.05, wz * 0.05) * 0.8;
            }
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
    // Grober Takt: neu nur, wenn die Sonne sich um mehr als ein halbes Grad drehte, Tönung oder E0 sich änderten, höchstens
    // je `SKY_ENV_REGEN_MIN_MS` (der Sprung der Uhr geht an der Drossel vorbei); die Bestrahlung liest die CPU zurück
    // (`_himmelUmgebungLesen` → `_himmelsIrradianz`).
    _ensureSkyEnvironment(force, sprung) {
        const st = this.state;
        if (typeof THREE === "undefined" || !st.scene || !st.renderer) return false;
        if (!st.rendererReady) return false; // das Env-Sampling braucht den initialisierten Renderer
        const A = this._atmoLutBau();
        const U = A.U;
        const t = U.toenung.value;
        const neu = {
            sx: U.sonne.value.x,
            sy: U.sonne.value.y,
            sz: U.sonne.value.z,
            my: U.mond.value.y,
            t: t.x + t.y + t.z,
            e: U.licht.value,
            m: A.mediumBeta,
            h: U.hKm.value,
        };
        const last = st._skyEnvLast;
        const nowMs = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const gleich =
            !!last &&
            last.sx * neu.sx + last.sy * neu.sy + last.sz * neu.sz > Math.cos((0.5 * Math.PI) / 180) &&
            Math.abs(last.my - neu.my) < 0.01 &&
            Math.abs(last.t - neu.t) < 0.02 * Math.max(1, neu.t) &&
            Math.abs(last.e - neu.e) < 0.02 * Math.max(1e-3, neu.e) &&
            last.m === neu.m &&
            Math.abs(last.h - neu.h) < 0.05;
        if (
            !force &&
            last &&
            (gleich || (!sprung && nowMs - (st._skyEnvLastRegenMs || -Infinity) < AnazhRealm.SKY_ENV_REGEN_MIN_MS))
        )
            return true;
        try {
            // Null-Renderer (headless): kein Pass, kein PMREM — die Equirekt-Tafel ist die Umgebung (ungezeichnet).
            if (st.renderer._isHeadlessNull) {
                st.scene.environment = A.rtEq.texture;
                st._skyEnvLast = neu;
                st._skyEnvLastRegenMs = nowMs;
                return true;
            }
            if (!A.tafelnFrisch) return false; // die Himmels-Sicht steht noch nicht (der erste Takt der Atmosphäre)
            this._atmoZeichne(A.qEq, A.rtEq);
            // PMREM per `fromEquirectangular` (WebGPU-tauglich, anders als `fromScene`) in das BESTEHENDE Target (zweites
            // Argument): stabile Texture-Identität, scene.environment nur beim Erst-Aufruf gesetzt (kein Recompile-Kaskade).
            if (!st._skyPmrem) st._skyPmrem = new THREE.PMREMGenerator(st.renderer);
            const rt = st._skyPmrem.fromEquirectangular(A.rtEq.texture, st._skyEnvRT || null);
            st._skyEnvRT = rt;
            if (st.scene.environment !== rt.texture) st.scene.environment = rt.texture;
            // was jeder Stoff spiegelt, ist die EINE Umgebung (material.K4): der Spiegel-Pass vor diesem Himmel
            if (!st.scene.environmentNode) st.scene.environmentNode = this._spiegelUmgebung(rt.texture);
            this._weltLichtHimmel(); // das Licht der Welt liest dieselbe PMREM-Stufe wie jeder Stoff
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
                const schritt = Math.floor(px.length / H); // die Zeilen liegen ausgerichtet (bytesPerRow)
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
        const s = h & 0x8000 ? -1 : 1;
        const e = (h & 0x7c00) >> 10;
        const f = h & 0x03ff;
        if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
        if (e === 31) return f ? NaN : s * Infinity;
        return s * Math.pow(2, e - 15) * (1 + f / 1024);
    }

    // DIE HIMMELS-UMGEBUNG als Textur: die Equirekt-Tafel der EINEN Atmosphäre (128×64, linear, Halb-Float) — EIN Objekt,
    // gezeichnet von `_ensureSkyEnvironment`, gelesen von PMREM (die IBL jedes PBR-Stoffs) und vom Film des Tors (roh); der
    // Spiegel des Wassers liest seit A1 die Himmels-Sicht mit Wolken (`_himmelSicht`). Dasselbe Ziel bleibt über jede
    // Neuzeichnung → kein Texture-Identitäts-Wechsel.
    _himmelUmgebungTex() {
        return this._atmoLutBau().rtEq.texture;
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
    // Die EINE Saison-Tönungs-Uniform, lazy (TSL muss geladen sein): die Nah-Wiese (`_grassInstanceMat`), das
    // Foundry-Laub/-Gras (`_foundryTreeMaterial`) und die Karte (Impostor-Stoff) lesen `uSeasonMul` als Albedo-
    // Multiplikator, `_tickSeason` fährt sie aus `state.seasonPhase` (kein Rebuild). Abgeleitet, nicht im Snapshot
    // (audit-strict-Whitelist).
    _ensureSeasonUniforms() {
        if (this.state.seasonUniforms) return this.state.seasonUniforms;
        const TSL = THREE.TSL;
        this.state.seasonUniforms = { uSeasonMul: TSL.uniform(new THREE.Color(1, 1, 1)) };
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
        const SG = AnazhRealm._saisonGesetz();
        const t = (((phase - 0.125) % 1) + 1) % 1;
        const f = t * 4;
        const i = Math.floor(f) % 4;
        const j = (i + 1) % 4;
        const k = f - Math.floor(f);
        const a = SG.stuetzen[i].ti;
        const b = SG.stuetzen[j].ti;
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

    // Die langsame Jahres-Uhr: treibt seasonPhase und leitet den Saison-Namen ab. DIE SAISON IST EINE FARBE (V18.527):
    // jeder Foundry-Körper und jede Karte ist Golden-Sommer gebacken (die Transport-Schale nagelt season "summer"),
    // das Jahr trägt die EINE Uniform `uSeasonMul` — Laub, Gras und Karte multiplizieren ihre Albedo damit (die Karte
    // zu SAISON_GESETZ.kartenGewicht). Kein Neubau, kein Schlüssel-Wechsel: die 36 Sommer↔Winter-Golden-Paare
    // unterscheiden sich nur in der Laubfarbe (foliage.color), das Studio färbt sein Jahr genauso.
    _tickSeason(currentTime) {
        const st = this.state;
        if (typeof st.seasonPhase !== "number") st.seasonPhase = 0.375;
        // Nur der DRIFT wartet auf die Bühne (die Tönung läuft immer). `_lastSeasonTime` bleibt bis zur Bühne null →
        // der erste Tick startet mit dt=0 (kein Zeit-Sprung).
        if (st.autoSeason !== false && this._buehneSteht()) {
            const now = currentTime || 0;
            if (this._lastSeasonTime == null) this._lastSeasonTime = now;
            const dt = Math.min(0.2, Math.max(0, (now - this._lastSeasonTime) / 1000));
            this._lastSeasonTime = now;
            const yearSec = st.seasonYearSeconds > 0 ? st.seasonYearSeconds : 2400;
            st.seasonPhase = (st.seasonPhase + dt / yearSec) % 1;
        }
        // DIE RUHE IST DER FIXPUNKT (feld.K3): Tönung und Name sind eine Funktion der Phase — steht sie (das Wort, die Bühne,
        // ein Lauf ohne Drift), schläft der Takt; jeder Schreiber der Phase weckt ihn, weil er sie ändert. Bis feld.K3 malte er
        // die Uniform in jedem Bild neu (gate:stand-takt RUHE-SIM, Mess-Wiese 60 s: 10 800 Rufe).
        const g = this._saisonGemalt;
        if (g && g.phase === st.seasonPhase && g.su === st.seasonUniforms) return;
        const su = this._ensureSeasonUniforms();
        if (su && su.uSeasonMul && su.uSeasonMul.value) this._saisonMul(st.seasonPhase, su.uSeasonMul.value);
        st.season = this._seasonName(st.seasonPhase);
        this._saisonGemalt = { phase: st.seasonPhase, su };
        this._schneeTakt(); // die Schneegrenze folgt dem Pegel (stoffe.K3-2)
        this._pegelTakt(); // die Schmelze speist See und Fluss (stoffe.K3-2)
    }
    // Explizit setzen (Chat/DSL): "fruehling/sommer/herbst/winter" — die Phase springt auf die Saison-Mitte, die
    // Tönung folgt im nächsten Tick (kein Neubau).
    setSeason(name) {
        const map = {
            fruehling: "spring",
            frühling: "spring",
            spring: "spring",
            sommer: "summer",
            summer: "summer",
            herbst: "autumn",
            autumn: "autumn",
            winter: "winter",
        };
        const key = map[String(name || "").toLowerCase()];
        if (!key) return false;
        const phaseFor = { spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 };
        this.state.seasonPhase = phaseFor[key];
        this.state.season = key;
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
        // Die Saat je Schliere (Lage im Kasten 0..1, Länge) aus einem festen Strom — das Bild ist reproduzierbar.
        const saat = new Float32Array(N * 4);
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
            saat[i * 4] = zufall();
            saat[i * 4 + 1] = zufall();
            saat[i * 4 + 2] = zufall();
            saat[i * 4 + 3] = RG.laenge[0] + zufall() * RG.laenge[1];
        }
        const s4 = T.instancedBufferAttribute(new THREE.InstancedBufferAttribute(saat, 4));
        const uZeit = T.uniform(0);
        const uDrift = T.uniform(new THREE.Vector2(0, 0));
        const uWinkel = T.uniform(0);
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
        mat.positionNode = T.vec3(x, y, z);
        mat.sizeNode = T.vec2(breiteM, s4.w).mul(uProj);
        mat.opacityNode = T.materialOpacity.mul(blende);
        mat.rotationNode = uWinkel;
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
        this._rainSystem = { mesh, uZeit, uDrift, uWinkel, uProj, RG };
        return this._rainSystem;
    }
    _tickRain() {
        const st = this.state;
        // DIE RUHE IST DER FIXPUNKT (feld.K3): regnet es nicht und steht die Nässe an ihrem Ziel (trocken), schläft der Regen
        // samt Nässe, Dach-Pool und Pegel (wetter.K3: sein Regen ist eine Funktion des Felds, das steht), bis das Wort, sein
        // Übergang oder die Nässe sich ändern (`_regenRuht`); die Uhr der Nässe geht mit, damit das nächste Wort ab seinem Takt
        // benetzt. Bis feld.K3 rechnete er in jedem Bild Feld, Nässe und Pool
        // (gate:stand-takt RUHE-SIM, Mess-Wiese 60 s: 21 600 Rufe).
        const ruht = this._regenRuht;
        if (ruht && ruht.wort === st.weather && !st.weatherTransition && ruht.naesse === st.naesse) {
            this._naesseUhr = st.spielZeit;
            return;
        }
        this._regenRuht = null;
        this._naesseTakt(); // der Regen benetzt die Welt, die Sonne trocknet sie (wetter.K2)
        const wf = this._weatherFieldFor(st.weather);
        if (!(wf.rain > 0.01)) {
            if (this._rainSystem && this._rainSystem.mesh) this._rainSystem.mesh.visible = false;
            if (st.naesse === 0 && !st.weatherTransition) this._regenRuht = { wort: st.weather, naesse: 0 };
            return;
        }
        const sys = this._ensureRainSystem();
        if (!sys || !sys.mesh) return;
        const RG = sys.RG;
        sys.mesh.visible = true;
        const cam = st.camera;
        if (cam) sys.mesh.position.copy(cam.position);
        sys.mesh.material.opacity = Math.min(RG.deckung, wf.rain * RG.deckung);
        // Die Uhr der Schlieren: die Bild-Uhr (s, A9), auf eine Stunde gefaltet (float-Genauigkeit im Vertex).
        const t = this._bildZeit % 3600;
        sys.uZeit.value = t;
        // Die Drift ist der EINE Wind am Auge (`_windAt` auf der Bild-Uhr), mindestens 0,1 wie im Labor (REGEN_GESETZ.drift).
        const wd = cam ? this._windAt(cam.position.x, cam.position.z, this._bildZeit) : { x: 0, z: 0, staerke: 0 };
        const v = RG.drift * Math.max(wd.staerke, 0.1);
        sys.uDrift.value.set(wd.x * v, wd.z * v);
        // Die Neigung im Bild: der Drift-Anteil quer zur Blickrichtung gegen das Fallen (Bild-Rechts = Spalte 0 der Kamera).
        if (cam) {
            const m = cam.matrixWorld.elements;
            sys.uWinkel.value = Math.atan2(wd.x * v * m[0] + wd.z * v * m[2], RG.fall);
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
    //   tag         das Auge zwischen Tag-Gesetz und geeichter Nacht (`_dayNightApplyBelichtung`, das Nacht-Auge der Post-Kette):
    //               1 über dem ersten Ersatz-Licht der Nacht (wo `nacht` beginnt, ~14,5°), linear über die Höhe der Sonne bis
    //               `BELICHTUNG.nachtGrad` auf 0 — die Gleitung beginnt, wo die Nacht beginnt, nie erst am Horizont;
    //   nacht       die Ersatz-Lichter der Nacht (Ambient- und Hemi-Boden, die Zeitpläne der Leuchtquellen): 0 ab ~14,5°, 1 am
    //               Horizont und darunter;
    //   hell        die Leuchtdichte des Tageshimmels relativ zum Mittag (0,045 Nacht … 1), die Blässe des Mondes liest sie.
    // Bis S7 rechnete jeder Anwender seine eigene Achse (die Tafel nach der Uhr, der Horizont-Fade der Körper, der Nacht-Anteil
    // aus dem Sinus des Winkels, die Dämmerung aus der Grenzgröße, die Himmels-Helligkeit) — die Dämmerung (Uhr 0,27, Sonne 7°)
    // stand heller als der Mittag, und um 0,75 brach die Belichtung um 2,1 EV ein. Die Sonne selbst fadet nie: ihr Licht trägt
    // der Durchlass der EINEN Atmosphäre (`_atmoSonne`), der Mond derselbe Durchlass in seiner Höhe.
    _tagAchse(e) {
        const c = this._tagAchseWert;
        if (c && c.e === e) return c;
        const A = AnazhRealm.HIMMEL.grenzgroesse;
        const s = Math.max(-1, Math.min(1, e));
        const h = (Math.asin(s) * 180) / Math.PI;
        let grenze = A[A.length - 1][1];
        if (h >= A[0][0]) grenze = A[0][1];
        else
            for (let i = 1; i < A.length; i++)
                if (h >= A[i][0]) {
                    const t = (h - A[i - 1][0]) / (A[i][0] - A[i - 1][0]);
                    grenze = A[i - 1][1] + (A[i][1] - A[i - 1][1]) * t;
                    break;
                }
        const mTag = A[0][1],
            mNacht = A[A.length - 1][1];
        const q = Math.max(0, Math.min(1, (s + 0.18) / 0.6));
        const nachtE = 0.25; // die Sonnenhöhe (sin), unter der die Ersatz-Lichter der Nacht beginnen
        const hN = (Math.asin(nachtE) * 180) / Math.PI;
        const nG = AnazhRealm.BELICHTUNG.nachtGrad;
        return (this._tagAchseWert = {
            e,
            grenze,
            daemmerung: (mNacht - grenze) / (mNacht - mTag),
            tag: Math.max(0, Math.min(1, (h - nG) / (hN - nG))),
            nacht: 1 - Math.max(0, Math.min(1, s / nachtE)),
            hell: 0.045 + 0.955 * q * q * (3 - 2 * q),
        });
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
        // Mond-Richtung aus der EINEN Quelle: `_dayNightSunDirection(angle+π)` ist exakt die Formel des
        // sichtbaren Mond-Meshes (`_updateCelestialBodies`); −sunDir hätte eine andere z-Komponente.
        // `lightDir` = der AKTIVE Himmelskörper (Sonne über dem Horizont, sonst Mond) → Richtlicht,
        // Wasser-Glitzer, Gras-Translucency; die Skybox behält sunDir (der Wolken-Glow ist Sonne).
        const moonDir = this._dayNightSunDirection(angle + Math.PI);
        const lightDir = sunDir.y >= 0 ? sunDir : moonDir;
        // DIE EINE TAG-ACHSE (S7): jeder Anwender liest dieselben Kanäle derselben Sonnenhöhe
        const achse = this._tagAchse(sunDir.y);
        // DIE EINE ATMOSPHÄRE (D3): der Durchlass zur Sonne EINMAL je Anwendung (das Richtlicht), die Tafeln im Takt ihrer
        // Änderung (Medium, Stufe der Sonne, Mond, Auge) — Kuppel, Umgebung und Luft lesen dieselbe Himmels-Sicht.
        const atm = this._atmoSonne(sunDir.y);
        this._atmoTakt(sunDir, moonDir, tint);
        this._dayNightApplySkybox(tint);
        this._dayNightApplyStarField(achse, tint.skyMul);
        this._dayNightApplyDirectionalLight(sunDir, tint, moonDir, atm, achse);
        this._dayNightApplyAmbient(achse);
        this._updateCelestialBodies(angle, tint.lightMul, achse);
        this._dayNightApplyHemiUndLuft(achse, tint);
        // DIE HIMMELS-UMGEBUNG malt sich aus BEIDEN Quellen, die jetzt gelten — dem Zenit (die Skybox-Tönung, oben) und dem
        // Horizont (die Luft-Farbe, eben): erst danach, und vor jedem Leser ihrer Bestrahlung (Wasser, Belichtung). Bis K10
        // malte `_dayNightApplySkybox` sie vor der Luft — die Nacht nach einem Sprung trug den Horizont des Tags (intern
        // gedrosselt: regeneriert nur bei Farb-Drift; ein Einmal-Fehlschlag versucht es nicht erneut). Ein Sprung des Himmels
        // (`_himmelSprung`, gesetzt vom Uhr-Schreiber) geht an der Raten-Drossel vorbei, EINMAL.
        const sprung = this._himmelSprung === true;
        this._himmelSprung = false;
        if (!this.state._skyEnvFailed) this._ensureSkyEnvironment(false, sprung);
        this._dayNightApplyWaterMaterials(lightDir);
        this._dayNightApplyBelichtung(achse);
        this._dayNightApplyAugenLicht();
    }

    // Tint-Akkumulation aus drei gekoppelten Schichten (jede mutiert skyColor/lightColor/
    // lightIntensity der vorigen): 1) Wetter (WEATHER_TINTS/Transition) 2) Welt-Feld 3) Emotion.
    // Liefert Tint + skyR/G/B (HemiFog braucht sie); geteilte Variablen → EINE Methode.
    _dayNightComputeTint() {
        // Schicht 1 — Wetter-Tint
        const wt = this.state.weatherTransition;
        const tints = this.constructor.WEATHER_TINTS;
        let skyMul, lightMul;
        if (wt && wt.from && wt.to) {
            const fromT = tints[wt.from] || tints.sunny;
            const toT = tints[wt.to] || tints.sunny;
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            skyMul = fromT.skyMul + (toT.skyMul - fromT.skyMul) * p;
            lightMul = fromT.lightMul + (toT.lightMul - fromT.lightMul) * p;
        } else {
            const currentTint = tints[this.state.weather] || tints.sunny;
            skyMul = currentTint.skyMul;
            lightMul = currentTint.lightMul;
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
        // grey entsättigt das LICHT, NIE den Himmel (skyColor bleibt unberührt): der grey-Kanal zieht das
        // finale Richtlicht luminanz-erhaltend Richtung Neutralgrau. Läuft nach allen Tint-Schichten.
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
            skyR: skyColor.r * skyMul,
            skyG: skyColor.g * skyMul,
            skyB: skyColor.b * skyMul,
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
        const w = t * Math.PI * 2 - Math.PI / 2;
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

    _dayNightSunDirection(angle) {
        const sunDirX = Math.cos(angle);
        const sunDirY = Math.sin(angle);
        const sunDirZ = Math.sin(angle * 0.5) * 0.4;
        const sunLen = Math.hypot(sunDirX, sunDirY, sunDirZ) || 1;
        return new THREE.Vector3(sunDirX / sunLen, sunDirY / sunLen, sunDirZ / sunLen);
    }

    // Die Richtung ZUR Sonne jetzt (Einheitsvektor; y ≤ 0 unter dem Horizont) — dieselbe Quelle wie Licht und Skybox.
    _sonnenRichtung() {
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        return this._dayNightSunDirection(this._sonnenWinkel(t));
    }

    // Reine Godray-Stärke aus Sonnenhöhe × Wetter-Klarheit (`weatherSun`, auf [0..1] remappt): über dem Horizont blenden sie
    // im Maß der EINEN Tag-Achse auf (1 − `nacht`, geglättet: 0 am Horizont, voll ab ~14,5°) — keine eigene Schwelle.
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
    _atmoGesetz() {
        return AnazhRealm.Gesetz("terrain:ATMO_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:ATMO_GESETZ");
    }

    _atmoRechnung() {
        return (
            AnazhRealm.Gesetz("terrain:ATMO_RECHNUNG", null) || AnazhRealm._kernPflichtBruch("terrain:ATMO_RECHNUNG")
        );
    }

    _atmoMedium(betaLuft) {
        return this._atmoRechnung().medium(this._atmoGesetz(), betaLuft, AnazhRealm.ATMO_BODEN);
    }

    // DIE SONNE aus dem Medium: e = sin(Höhe) der Sonne, der Durchlass vom Auge (Kamera über dem Bezug) zur Sonne
    // (`ATMO_RECHNUNG.sonne`, dieselbe Rechnung, die die Transmittance-Tafel je Texel trägt). `col` = sein Farbton (unter dem
    // Horizont zum Mond-Hue, Purkinje), `lum` = sein hellster Kanal — `col`·`lum` IST der Durchlass; das Richtlicht trägt
    // E0 · Durchlass (E0 = die Sonne über der Atmosphäre, `_atmoE0`), dieselbe E0, mit der die Tafeln den Himmel rechnen:
    // das Verhältnis Sonne : Himmel ist Physik.
    _atmoSonne(e) {
        const T = this._atmoT || (this._atmoT = [0, 0, 0]);
        const N = AnazhRealm.ATMO_LUT.schritte.durchlass;
        return this._atmoRechnung().sonne(this._atmoGesetz(), this._atmoMediumJetzt(), this._atmoAugeKm(), e, N, T);
    }

    // Das Medium des Wetters jetzt, in STUFEN der Extinktion um die klare Luft (`ATMO_LUT.mediumStufe`, logarithmisch; die
    // klare Luft selbst ist exakt eine Stufe): ein Wetter-Übergang zeichnet die Tafeln je Stufe neu, nie je Anwendung — bis
    // zur Nachbesserung zeichnete jedes Anwenden eines Übergangs Durchlass, Ψ_ms und Himmels-Sicht neu. Sonne und Tafeln
    // lesen dasselbe gestufte Medium.
    _atmoMediumJetzt() {
        const klar = this._atmoRechnung().betaKlar(this._atmoGesetz());
        const k = AnazhRealm.ATMO_LUT.mediumStufe;
        const b = klar * Math.exp(Math.round(Math.log(this._luftBeta() / klar) / k) * k);
        if (this._atmoM && this._atmoMBeta === b) return this._atmoM;
        this._atmoMBeta = b;
        return (this._atmoM = this._atmoMedium(b));
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
        return Math.max(0, AnazhRealm.KEY_BASE * AnazhRealm.LEGACY_LICHT * (tint ? tint.lightIntensity : 1));
    }

    // DAS STERNEN-LICHT (D3-2) jetzt: die Zenit-Leuchtdichte des Nachthimmels (`ATMO_GESETZ.nacht.himmel`, Welt-Einheiten) im
    // Maß der Nacht (1 − Dämmerung der EINEN Tag-Achse, `_tagAchse`: wie die Sterne erscheinen, erscheint ihr Licht). Bis D3-2 trug der Himmel der EINEN Atmosphäre nachts nur die Streuung des Mondes
    // (Zenit 0,009): der Himmel der Nacht war schwarz, Wiese Mitternacht Luma 4,9 (vor D3 31,7), Dämmerung 0,78 4,2 (38,1).
    _atmoSternenLicht(e) {
        const N = this._atmoGesetz().nacht.himmel;
        const w = Math.max(0, Math.min(1, 1 - this._tagAchse(e).daemmerung));
        const o = this._atmoNacht || (this._atmoNacht = [0, 0, 0]);
        o[0] = N[0] * w;
        o[1] = N[1] * w;
        o[2] = N[2] * w;
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
        if (typeof THREE === "undefined" || !THREE.TSL || !THREE.MeshBasicNodeMaterial || !THREE.RenderTarget)
            throw new Error("Die Atmosphäre: THREE trägt TSL/MeshBasicNodeMaterial/RenderTarget nicht (Vendor)");
        const T = THREE.TSL;
        const { Fn, float, vec2, vec3, vec4, uv, texture, exp, sqrt, max, clamp, select, Loop, If, dot, length } = T;
        const G = AnazhRealm.Gesetz("terrain:ATMO_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:ATMO_GESETZ");
        const Z = AnazhRealm.ATMO_LUT;
        const RG = G.erdeM / 1000,
            RT = G.randM / 1000;
        const H = Math.sqrt(RT * RT - RG * RG);
        const PI = Math.PI;
        const M = this._atmoMediumJetzt();
        const U = this._uniformHeimatTeilen({
            betaR: T.uniform(new THREE.Vector3().fromArray(M.betaR)),
            HR: T.uniform(M.HR),
            HM: T.uniform(M.HM),
            mieExt: T.uniform(M.mieExt),
            mieSca: T.uniform(M.mieSca),
            g: T.uniform(M.g),
            ozon: T.uniform(new THREE.Vector3().fromArray(M.ozon)),
            albedo: T.uniform(new THREE.Vector3().fromArray(M.albedo)),
            hKm: T.uniform(0.002),
            sonne: T.uniform(new THREE.Vector3(0, 1, 0)),
            mond: T.uniform(new THREE.Vector3(0, -1, 0)),
            // DAS LICHT JETZT (E0, `_atmoE0`): die Tafeln tragen den Himmel je Einheit der Sonne über der Atmosphäre, der Leser
            // (`himmelFarbe`, die Wolke) multipliziert E0 — die Tages-Intensität ist linear und zeichnet keine Tafel neu
            licht: T.uniform(1),
            // der Mond in Einheiten von E0 (Purkinje-Hue × MOONLIGHT × Wetter / E0)
            mondE: T.uniform(new THREE.Vector3(0, 0, 0)),
            // das Sternen-Licht in Einheiten von E0 (die Zenit-Leuchtdichte des Gesetzes × der Anteil der Nacht / E0, `_atmoSternenLicht`)
            nachtE: T.uniform(new THREE.Vector3(0, 0, 0)),
            toenung: T.uniform(new THREE.Vector3(1, 1, 1)),
        });
        const ziel = (w, h, wrapS, name) => {
            const rt = new THREE.RenderTarget(w, h, {
                type: THREE.HalfFloatType,
                depthBuffer: false,
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            });
            rt.name = name;
            rt.texture.name = name;
            rt.texture.wrapS = wrapS || THREE.ClampToEdgeWrapping;
            rt.texture.wrapT = THREE.ClampToEdgeWrapping;
            return rt;
        };
        const rtT = ziel(Z.durchlass[0], Z.durchlass[1], null, "atmo-durchlass");
        const rtMS = ziel(Z.mehrfach[0], Z.mehrfach[1], null, "atmo-mehrfach");
        const rtSV = ziel(Z.himmel[0], Z.himmel[1], THREE.RepeatWrapping, "atmo-himmel");
        const rtEq = ziel(Z.umgebung[0], Z.umgebung[1], THREE.RepeatWrapping, "himmel-umgebung");
        const rtBS = ziel(Z.bestrahlung[0], Z.bestrahlung[1], null, "atmo-bestrahlung");
        rtEq.texture.mapping = THREE.EquirectangularReflectionMapping;
        // ── das Medium als Knoten (h in km über dem Bezug) ──
        const dichteO = (h) =>
            max(
                float(1).sub(
                    h
                        .sub(G.ozon.mitteM / 1000)
                        .abs()
                        .div(G.ozon.halbM / 1000)
                ),
                0
            );
        const streuR = (h) => U.betaR.mul(exp(h.negate().div(U.HR)));
        const streuM = (h) => U.mieSca.mul(exp(h.negate().div(U.HM)));
        const ext = (h) =>
            streuR(h)
                .add(U.mieExt.mul(exp(h.negate().div(U.HM))))
                .add(U.ozon.mul(dichteO(h)));
        const subUv = (x, n) =>
            clamp(x, 0, 1)
                .mul(1 - 1 / n)
                .add(0.5 / n);
        const ausUv = (u, n) => clamp(u.sub(0.5 / n).div(1 - 1 / n), 0, 1);
        const amBoden = (r, mu) =>
            T.and(
                mu.lessThan(0),
                r
                    .mul(r)
                    .mul(mu.mul(mu).sub(1))
                    .add(RG * RG)
                    .greaterThanEqual(0)
            );
        const zumRand = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .add(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RT * RT),
                            0
                        )
                    )
                );
        const zumBoden = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .sub(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RG * RG),
                            0
                        )
                    )
                );
        const durchlass = (r, mu) => {
            const rho = sqrt(max(r.mul(r).sub(RG * RG), 0));
            const d = max(zumRand(r, mu), 0);
            const dMin = float(RT).sub(r);
            const dMax = rho.add(H);
            const xmu = d.sub(dMin).div(max(dMax.sub(dMin), 1e-4));
            const t = texture(rtT.texture, vec2(subUv(xmu, Z.durchlass[0]), subUv(rho.div(H), Z.durchlass[1]))).level(
                float(0)
            ).rgb;
            return select(amBoden(r, mu), vec3(0), t);
        };
        const mehrfach = (h, mus) =>
            texture(
                rtMS.texture,
                vec2(subUv(mus.add(1).mul(0.5), Z.mehrfach[0]), subUv(h.div(RT - RG), Z.mehrfach[1]))
            ).level(float(0)).rgb;
        const phaseR = (nu) =>
            nu
                .mul(nu)
                .add(1)
                .mul(3 / (16 * PI));
        const phaseM = (nu) => {
            const g2 = U.g.mul(U.g);
            return g2.oneMinus().div(
                g2
                    .add(1)
                    .sub(U.g.mul(nu).mul(2))
                    .pow(1.5)
                    .mul(4 * PI)
            );
        };
        // ── Transmittance: je Texel der Durchlass (r, mu) bis zum Rand ──
        const passDurchlass = Fn(() => {
            const q = uv();
            const xmu = ausUv(q.x, Z.durchlass[0]);
            const rho = ausUv(q.y, Z.durchlass[1]).mul(H).toVar();
            const r = sqrt(rho.mul(rho).add(RG * RG)).toVar();
            const dMin = float(RT).sub(r);
            const d = dMin.add(xmu.mul(rho.add(H).sub(dMin))).toVar();
            const mu = clamp(
                select(
                    d.lessThan(1e-4),
                    float(1),
                    float(H * H)
                        .sub(rho.mul(rho))
                        .sub(d.mul(d))
                        .div(r.mul(d).mul(2))
                ),
                -1,
                1
            ).toVar();
            const tau = vec3(0).toVar();
            const N = Z.schritte.durchlass;
            const dt = d.div(N).toVar();
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const t = s.add(0.5).mul(dt);
                const hi = max(sqrt(t.mul(t).add(r.mul(mu).mul(t).mul(2)).add(r.mul(r))).sub(RG), 0);
                tau.addAssign(ext(hi).mul(dt));
            });
            return vec4(exp(tau.negate()), 1);
        });
        // ── Ψ_ms: je (cos Sonnen-Zenit, Höhe) die Mehrfachstreuung (Hillaire Gl. 5–9), 8 × 8 Richtungen, Boden = Welt-Albedo ──
        const passMehrfach = Fn(() => {
            const q = uv();
            const mus = ausUv(q.x, Z.mehrfach[0]).mul(2).sub(1).toVar();
            const h = max(ausUv(q.y, Z.mehrfach[1]).mul(RT - RG), 0.001).toVar();
            const r = h.add(RG).toVar();
            const sun = vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0).toVar();
            const Lsum = vec3(0).toVar();
            const Fsum = vec3(0).toVar();
            const N = Z.schritte.mehrfach;
            Loop({ start: 0, end: 64, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(8).floor();
                const b = k.sub(a.mul(8));
                const mu = a
                    .add(0.5)
                    .mul(2 / 8)
                    .sub(1)
                    .toVar();
                const sv = sqrt(max(float(1).sub(mu.mul(mu)), 0));
                const phi = b.add(0.5).mul((2 * PI) / 8);
                const v = vec3(sv.mul(phi.cos()), mu, sv.mul(phi.sin())).toVar();
                const boden = amBoden(r, mu).toVar();
                const tMax = select(boden, zumBoden(r, mu), zumRand(r, mu)).toVar();
                const thr = vec3(1).toVar();
                const L = vec3(0).toVar();
                const F = vec3(0).toVar();
                const tAlt = float(0).toVar();
                Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                    const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                    const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                    const dt = tE.sub(tAlt).toVar();
                    tAlt.assign(tE);
                    const p = vec3(v.x.mul(tM), r.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                    const ri = length(p).toVar();
                    const hi = max(ri.sub(RG), 0).toVar();
                    const sca = streuR(hi).add(streuM(hi)).toVar();
                    const e = max(ext(hi), vec3(1e-7)).toVar();
                    const tr = exp(e.negate().mul(dt)).toVar();
                    const integ = tr.oneMinus().div(e).toVar();
                    L.addAssign(
                        thr
                            .mul(sca)
                            .mul(durchlass(ri, dot(p, sun).div(ri)))
                            .mul(integ)
                            .mul(1 / (4 * PI))
                    );
                    F.addAssign(thr.mul(sca).mul(integ));
                    thr.mulAssign(tr);
                });
                If(boden, () => {
                    const gp = vec3(v.x.mul(tMax), r.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                    const gr = length(gp).toVar();
                    const nl = max(dot(gp, sun).div(gr), 0).toVar();
                    L.addAssign(
                        thr
                            .mul(durchlass(gr, nl))
                            .mul(nl)
                            .mul(U.albedo)
                            .mul(1 / PI)
                    );
                });
                Lsum.addAssign(L);
                Fsum.addAssign(F);
            });
            const fms = Fsum.div(64);
            return vec4(Lsum.div(64).div(max(fms.oneMinus(), vec3(1e-4))), 1);
        });
        // ── die Himmels-Sicht: Richtung ↔ Texel (Azimut absolut, Breite quadratisch um den Horizont des Auges) ──
        const horizontEl = () => T.acos(float(RG).div(U.hKm.add(RG))).negate();
        const himmelUv = (dir) => {
            const el = T.asin(clamp(dir.y, -1, 1)).toVar();
            const hz = horizontEl().toVar();
            const oben = sqrt(max(el.sub(hz).div(float(PI / 2).sub(hz)), 0))
                .mul(0.5)
                .add(0.5);
            const unten = float(0.5).sub(sqrt(max(hz.sub(el).div(float(PI / 2).add(hz)), 0)).mul(0.5));
            const u = T.atan(dir.z, dir.x)
                .div(2 * PI)
                .add(1)
                .fract();
            return vec2(u, subUv(select(el.greaterThanEqual(hz), oben, unten), Z.himmel[1]));
        };
        // DER MARSCH längs v: die Quellen (Richtung, Gewicht in Einheiten von E0 — die Sonne 1, der Mond `mondE`) und das
        // Sternen-Licht (`nacht`, in E0). Die Himmels-Sicht ruft ihn mit Sonne, Mond und Sternen, die Bestrahlungs-Tafel mit
        // EINER Quelle je Sonnenhöhe — derselbe Marsch, dieselbe Streuung, dieselben Tafeln.
        const marsch = (v, quellen, nacht) => {
            const r0 = U.hKm.add(RG).toVar();
            const mu = v.y;
            const boden = amBoden(r0, mu).toVar();
            const tMax = select(boden, zumBoden(r0, mu), zumRand(r0, mu)).toVar();
            const ph = quellen.map((q) => {
                const nu = dot(v, q.dir);
                return vec2(phaseR(nu), phaseM(nu)).toVar();
            });
            const thr = vec3(1).toVar();
            const L = vec3(0).toVar();
            const tAlt = float(0).toVar();
            const N = Z.schritte.himmel;
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                const dt = tE.sub(tAlt).toVar();
                tAlt.assign(tE);
                const p = vec3(v.x.mul(tM), r0.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                const ri = length(p).toVar();
                const hi = max(ri.sub(RG), 0).toVar();
                const sR = streuR(hi).toVar();
                const sM = streuM(hi).toVar();
                const sca = sR.add(sM).toVar();
                const S = quellen
                    .map((q, i) => {
                        const muQ = dot(p, q.dir).div(ri).toVar();
                        const s = durchlass(ri, muQ)
                            .mul(sR.mul(ph[i].x).add(sM.mul(ph[i].y)))
                            .add(mehrfach(hi, muQ).mul(sca));
                        return q.gewicht ? q.gewicht.mul(s) : s;
                    })
                    .reduce((a, b) => a.add(b))
                    .toVar();
                const e = max(ext(hi), vec3(1e-7)).toVar();
                const tr = exp(e.negate().mul(dt)).toVar();
                L.addAssign(thr.mul(S).mul(tr.oneMinus().div(e)));
                thr.mulAssign(tr);
            });
            // DAS STERNEN-LICHT (D3-2, `ATMO_GESETZ.nacht`): über dem Horizont leuchtet der Nachthimmel selbst — schräg durch die
            // leuchtende Schicht gesehen länger (van Rhijn), gedämpft durch dieselbe Luft wie jeder Strahl (`thr`, der Durchlass
            // bis zum Rand). Der Boden unter dem Horizont: Lambert mit der Welt-Albedo im Licht von Sonne und Mond.
            If(boden.not(), () => {
                const q = r0.div(RG + G.nacht.glutHoeheM / 1000);
                const vanRhijn = float(1).div(sqrt(max(float(1).sub(q.mul(q).mul(float(1).sub(mu.mul(mu)))), 1e-4)));
                L.addAssign(nacht.mul(vanRhijn).mul(thr));
            });
            If(boden, () => {
                const gp = vec3(v.x.mul(tMax), r0.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                const n = gp.div(length(gp)).toVar();
                const gr = length(gp).toVar();
                const E = quellen
                    .map((q) => {
                        const l = max(dot(n, q.dir), 0).toVar();
                        const e = durchlass(gr, l).mul(l);
                        return q.gewicht ? q.gewicht.mul(e) : e;
                    })
                    .reduce((a, b) => a.add(b));
                L.addAssign(
                    thr
                        .mul(E)
                        .mul(U.albedo)
                        .mul(1 / PI)
                );
            });
            return L;
        };
        const passHimmel = Fn(() => {
            const q = uv();
            const phi = q.x.mul(2 * PI).toVar();
            const w = ausUv(q.y, Z.himmel[1]);
            const hz = horizontEl().toVar();
            const c = w.sub(0.5).mul(2).toVar();
            const el = select(
                c.greaterThanEqual(0),
                hz.add(c.mul(c).mul(float(PI / 2).sub(hz))),
                hz.sub(c.mul(c).mul(float(PI / 2).add(hz)))
            ).toVar();
            const ce = el.cos().toVar();
            const v = vec3(ce.mul(phi.cos()), el.sin(), ce.mul(phi.sin())).toVar();
            return vec4(marsch(v, [{ dir: U.sonne }, { dir: U.mond, gewicht: U.mondE }], U.nachtE), 1);
        });
        // DIE FARBE DES HIMMELS in Richtung `dir` (Welt): die Himmels-Sicht (je Einheit E0) × das Licht jetzt (E0) × die Tönung
        // (Wetter, Feld, Gefühl, DSL — relativ zum Himmel des Studios, `_dayNightApplySkybox`). Leser: die Kuppel, die Umgebung, die Luft.
        const himmelFarbe = (dir) =>
            texture(rtSV.texture, himmelUv(dir)).level(float(0)).rgb.mul(U.licht).mul(U.toenung);
        // ── die Umgebung: Equirekt (three `equirectUV`: u = atan(z, x)/2π + ½, v = asin(y)/π + ½) aus der Himmels-Sicht ──
        const passUmgebung = Fn(() => vec4(himmelFarbe(this._umgebungRichtung(uv()).toVar()), 1));
        // ── DIE BESTRAHLUNGS-TAFEL (S7): je Texel eine Sonnenhöhe e (quadratisch dicht um den Horizont, e = c·|c|) und die
        // Bestrahlung einer waagrechten Fläche durch den Himmel dieser Sonne, je Einheit E0 — derselbe Marsch wie die Himmels-
        // Sicht über die obere Halbkugel (kosinus-gewichtet, `ATMO_LUT.richtungen`); der letzte Texel trägt das Sternen-Licht je
        // Einheit `nachtE`. Gezeichnet je Medium und Höhe des Auges, EINMAL zurückgelesen (`_himmelsTafelLesen`): die CPU kennt
        // den Himmel jeder Stunde synchron (`_himmelsBestrahlung`), nie eine Lesung nach der Malung.
        const BW = Z.bestrahlung[0];
        const [NT, NP] = Z.richtungen;
        const passBestrahlung = Fn(() => {
            const i = uv().x.mul(BW).floor().toVar();
            const stern = i.greaterThanEqual(BW - 1).toVar();
            const c = i
                .div(BW - 2)
                .mul(2)
                .sub(1)
                .toVar();
            const mus = clamp(c.mul(c.abs()), -1, 1).toVar();
            const sonne = select(stern, vec3(0, -1, 0), vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0)).toVar();
            const nacht = select(stern, float(1), float(0)).toVar();
            const E = vec3(0).toVar();
            Loop({ start: 0, end: NT * NP, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(NP).floor();
                const ct = sqrt(float(1).sub(a.add(0.5).div(NT))).toVar();
                const sv = sqrt(max(float(1).sub(ct.mul(ct)), 0)).toVar();
                const phi = k
                    .sub(a.mul(NP))
                    .add(0.5)
                    .mul((2 * PI) / NP)
                    .toVar();
                E.addAssign(marsch(vec3(sv.mul(phi.cos()), ct, sv.mul(phi.sin())).toVar(), [{ dir: sonne }], nacht));
            });
            return vec4(E.mul(PI / (NT * NP)), 1);
        });
        // DER PASS: ein Dreieck über den ganzen Schirm in der Form von r184 `QuadMesh` (Lage [-1,3 · -1,-1 · 3,-1], uv [0,-1 ·
        // 0,1 · 2,1], Ortho-Kamera ±1) — dieselbe uv-Lage, in der jeder Leser die Tafel abtastet, in beiden Backends.
        const dreieck = new THREE.BufferGeometry();
        dreieck.setAttribute("position", new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
        dreieck.setAttribute("uv", new THREE.Float32BufferAttribute([0, -1, 0, 1, 2, 1], 2));
        const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = (fn, name) => {
            const m = new THREE.MeshBasicNodeMaterial();
            m.name = name;
            m.fragmentNode = fn();
            m.depthTest = false;
            m.depthWrite = false;
            m.toneMapped = false;
            m.fog = false;
            const q = new THREE.Mesh(dreieck, m);
            q.name = name;
            q.frustumCulled = false;
            q.userData.kamera = kamera;
            return q;
        };
        st.atmoLut = {
            U,
            rtT,
            rtMS,
            rtSV,
            rtEq,
            qT: quad(passDurchlass, "atmo-durchlass"),
            qMS: quad(passMehrfach, "atmo-mehrfach"),
            qSV: quad(passHimmel, "atmo-himmel"),
            qEq: quad(passUmgebung, "atmo-umgebung"),
            rtBS,
            qBS: quad(passBestrahlung, "atmo-bestrahlung"),
            tafelSchluessel: null,
            himmelFarbe,
            durchlass,
            RG,
            mediumBeta: null,
            himmelSchluessel: null,
            himmelVersion: 0,
            tafelnFrisch: false,
        };
        return st.atmoLut;
    }

    // DIE RICHTUNG DER EQUIREKT-LAGE (die Umkehr von r184 `equirectUV`): uv → Einheits-Richtung, φ = (u − ½)·2π, Höhe = (v − ½)·π
    // — so malt die Umgebung (`passUmgebung`), so tastet die Himmels-Sonde des Lichts der Welt ab (`_weltLichtHimmel`).
    _umgebungRichtung(q) {
        const phi = q.x.sub(0.5).mul(2 * Math.PI);
        const el = q.y.sub(0.5).mul(Math.PI);
        return THREE.TSL.vec3(el.cos().mul(phi.cos()), el.sin(), el.cos().mul(phi.sin()));
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
        this._buehneRender(r, quad, quad.userData.kamera, "Atmosphäre");
        r.setRenderTarget(ziel);
        if (mrt) r.setMRT(mrt);
        if (rof) r.setRenderObjectFunction(rof);
        r.autoClear = auto;
    }

    // DER TAKT DER ATMOSPHÄRE (je Anwendung von Tag und Nacht): das Medium folgt dem Wetter in seinen Stufen (Transmittance und
    // Ψ_ms neu je Stufe, `_atmoMediumJetzt`), die Himmels-Sicht der Stufe der Sonne (`_sonnenWinkel`, mit ihr der Mond), der
    // Höhe des Auges (10 m) und dem Medium — Kosten an Änderung (Gebot 7). Das Licht jetzt (E0) und der Mond in Einheiten von
    // E0 sind Uniforms der Leser: ihr stetiger Gang über den Tag zeichnet keine Tafel (bis zur Nachbesserung trug der Schlüssel
    // E0 auf 4 Stellen — am Abend 60 von 60 Frames eine neue Himmels-Sicht). Der Null-Renderer zeichnet nichts.
    _atmoTakt(sunDir, moonDir, tint) {
        const st = this.state;
        const A = this._atmoLutBau();
        const U = A.U;
        // DER ANKER ZUERST (S7): bis die Tafel der klaren Luft am Boden einmal zurückkam (`_himmelsAnker`, der Himmel der Karte
        // unter der Zenit-Sonne), zeichnet der Takt sie — in jedem Wetter und jeder Höhe des Auges; danach das Medium jetzt.
        // Der Null-Renderer malt keinen Himmel (Lehre 16): dort trägt die Karte keinen.
        const anker = this._himmelsAnker == null && !(st.renderer && st.renderer._isHeadlessNull);
        const klar = anker ? this._atmoRechnung().betaKlar(this._atmoGesetz()) : 0;
        const M = anker ? this._atmoMedium(klar) : this._atmoMediumJetzt();
        const mB = anker ? klar : this._atmoMBeta;
        if (A.mediumBeta !== mB) {
            U.betaR.value.fromArray(M.betaR);
            U.HR.value = M.HR;
            U.HM.value = M.HM;
            U.mieExt.value = M.mieExt;
            U.mieSca.value = M.mieSca;
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
        U.licht.value = E0;
        const Mo = AnazhRealm.MOONLIGHT;
        const mi = (Mo.intensity * (tint ? tint.lightMul : 1)) / Math.max(E0, 1e-6);
        U.mondE.value.set(Mo.r * mi, Mo.g * mi, Mo.b * mi);
        // das Sternen-Licht hängt allein an der Höhe der Sonne (die Dämmerung) — der Schlüssel der Himmels-Sicht trägt es mit
        const N = this._atmoSternenLicht(sunDir.y);
        U.nachtE.value.set(N[0], N[1], N[2]).divideScalar(Math.max(E0, 1e-6));
        const s = st._sonne;
        const schluessel = `${s ? s.winkel : 0}:${h}:${A.mediumBeta}`;
        const rend = st.renderer;
        if (!rend || rend._isHeadlessNull || !st.rendererReady) return A;
        if (!A.tafelnFrisch) {
            this._atmoZeichne(A.qT, A.rtT);
            this._atmoZeichne(A.qMS, A.rtMS);
            A.tafelnFrisch = true;
            A.himmelSchluessel = null;
        }
        if (A.himmelSchluessel !== schluessel) {
            this._atmoZeichne(A.qSV, A.rtSV);
            A.himmelSchluessel = schluessel;
            A.himmelVersion++;
        }
        // die Bestrahlungs-Tafel je Medium und je 100 m Höhe des Auges (sie hängt nicht an der Sonne: jede Stunde liest sie)
        const tafel = `${A.mediumBeta}:${Math.round(h * 10)}`;
        if (A.tafelSchluessel !== tafel) {
            this._atmoZeichne(A.qBS, A.rtBS);
            A.tafelSchluessel = tafel;
            // bis die neue Tafel zurückkommt, liest kein Leser die Luft von vorher (die Belichtung schreibt dann nicht, sie hält)
            this._himmelsTafel = null;
            this._himmelsTafelLesen();
        }
        this._horizontKarteTakt();
        return A;
    }

    // DIE BESTRAHLUNGS-TAFEL AUF DIE CPU (je Neuzeichnung, EINMAL je Medium und Höhe): je Sonnenhöhe die Bestrahlung einer
    // waagrechten Fläche durch den Himmel je Einheit E0 (rgb), der letzte Texel das Sternen-Licht je Einheit `nachtE`. Eine
    // spätere Lesung überholt eine frühere. Die erste Tafel der klaren Luft am Boden (`_atmoTakt` zeichnet sie zuerst) trägt den
    // ANKER der Belichtung: den Himmel unter der Zenit-Sonne (`_himmelsAnker`, je Einheit E0, `_belichtungAnker`). Bis S7 stand er
    // als Konstante neben der Tafel (0,24 gegen gerechnet 0,232, eine Wand bei ±0,02 nur am klaren Boden).
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
        const nr = (this._himmelsTafelNr = (this._himmelsTafelNr || 0) + 1);
        return r.readRenderTargetPixelsAsync(A.rtBS, 0, 0, W, 1).then(
            (px) => {
                if (nr !== this._himmelsTafelNr) return false;
                const halb = px instanceof Uint16Array;
                const w = new Float32Array(W * 3);
                for (let i = 0; i < W; i++)
                    for (let c = 0; c < 3; c++)
                        w[i * 3 + c] = halb ? AnazhRealm._halbZuFloat(px[i * 4 + c]) : px[i * 4 + c];
                this._himmelsTafel = { W, werte: w };
                if (klar && this._himmelsAnker == null)
                    this._himmelsAnker =
                        0.2126 * w[(W - 2) * 3] + 0.7152 * w[(W - 2) * 3 + 1] + 0.0722 * w[(W - 2) * 3 + 2];
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
    _himmelsBestrahlung(out) {
        const st = this.state;
        out[0] = out[1] = out[2] = 0;
        if (st.renderer && st.renderer._isHeadlessNull) return out;
        const A = st.atmoLut;
        const T = this._himmelsTafel;
        if (!A || !T) return null;
        const U = A.U;
        const W = T.W,
            w = T.werte;
        const lies = (mu, c) => {
            const x = ((Math.sign(mu) * Math.sqrt(Math.min(1, Math.abs(mu))) + 1) / 2) * (W - 2);
            const i = Math.max(0, Math.min(W - 3, Math.floor(x)));
            const f = Math.max(0, Math.min(1, x - i));
            return w[i * 3 + c] * (1 - f) + w[(i + 1) * 3 + c] * f;
        };
        const ms = U.sonne.value.y,
            mm = U.mond.value.y;
        const m = U.mondE.value,
            n = U.nachtE.value,
            t = U.toenung.value;
        for (let c = 0; c < 3; c++) {
            const k = c === 0 ? "x" : c === 1 ? "y" : "z";
            out[c] = U.licht.value * t[k] * (lies(ms, c) + m[k] * lies(mm, c) + n[k] * w[(W - 1) * 3 + c]);
        }
        return out;
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
            }
        }
        if (u.cloudCover) {
            // Wolken-Deckung: klar 0.12 (thr~0.62 = blauer Himmel mit verstreuten Spitzen; 0.32 las schon als
            // bewölkt), Regen 0.9 (Overcast). Der FBM-Wolken-Layer liest sie als Schwellen-Senker.
            u.cloudCover.value = Math.min(1, this._weatherBlendedValue(0.12, 0.9)); // D5a: [0,1]-Konsument clampt lokal
        }
    }

    // Stern-Feld: die Dämmerung setzt die Grenzgröße (Physik der Sichtbarkeit, nie ein Nacht-Faktor; der Kanal `grenze` der
    // EINEN Tag-Achse), das Wetter dämpft (Wolken); die Uniforms leben in state.starFieldUniforms.
    _dayNightApplyStarField(achse, skyMul) {
        const u = this.state.starFieldUniforms;
        if (!u || !u.opacity) return;
        u.opacity.value = skyMul;
        if (u.grenze) u.grenze.value = achse.grenze;
        // Kein Punkt sichtbar (mittags liegt die Grenzgröße über jedem Stern, unter Wolken ist die Deckkraft 0): das Feld
        // zeichnet nicht — es zog am Tag zwei Befehle für ein schwarzes Bild (Band-Linse, Mess-Wiese, Welle 6).
        const sf = this.state.starField;
        if (sf && u.grenze && Number.isFinite(u.hellste))
            sf.visible = skyMul > 0 && u.grenze.value - u.hellste + 0.5 > 0;
    }

    // DER DURCHLASS ZUM MOND (S7): derselbe Durchlass der EINEN Atmosphäre wie zur Sonne (`ATMO_RECHNUNG.durchlass`, das Medium
    // jetzt, die Höhe des Auges), in seiner Höhe y = sin(Höhe) relativ zum Zenit — die Eichung des Mondlichts (`MOONLIGHT`) gilt
    // dem hohen Mond, am Horizont geht er durch die ganze Luft (unter ihm 0). Bis S7 ein eigener Horizont-Fade (smoothstep bis 8°).
    _mondDurchlass(y) {
        const R = this._atmoRechnung();
        const M = this._atmoMediumJetzt();
        const h = this._atmoAugeKm();
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
        // (Wetter-lightMul + Emotion) moduliert; Ziel dir/(amb+hemi) ≥ 3:1 am Tag (nachts 0,67: `_dayNightApplyAmbient`).
        const a = atm || this._atmoSonne(sunDir.y);
        if (sunUp) {
            dl.color.setRGB(
                a.col.r * tint.lightColor.r * tint.lightMul,
                a.col.g * tint.lightColor.g * tint.lightMul,
                a.col.b * tint.lightColor.b * tint.lightMul
            );
            dl.intensity = AnazhRealm.KEY_BASE * AnazhRealm.LEGACY_LICHT * a.lum * tint.lightIntensity;
        } else {
            const M = AnazhRealm.MOONLIGHT;
            // Mond-Pfad: Richtung aus der EINEN Quelle, Intensität MOONLIGHT·Wetter·sein Durchlass; `atm.col`
            // färbt ihn nur (unter dem Horizont lerpt sie zum MOONLIGHT-Hue).
            dl.color.setRGB(a.col.r, a.col.g, a.col.b);
            // V18.378 — der Durchlass liest die ECHTE Mond-Höhe (md.y), nicht −sunDir.y (die
            // z-Bogen-Formel gibt dem Mond eine eigene Normierung → eigene Höhe).
            dl.intensity = M.intensity * tint.lightMul * this._mondDurchlass(md.y);
        }
        // `nightFactor` 0 = Tag → 1 = Nacht: das Auge der Nacht der Post-Kette (K66, mesopisch) liest ihn — am Tag fällt es. Es
        // ist das Auge der EINEN Tag-Achse (`tag`): es gleitet, wie die Belichtung gleitet, vom Tag in die geeichte Nacht (mit
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

    // DIE BELICHTUNG AUS DEM LICHT (V18.507, S7): die Kamera stellt die 18-%-Karte auf Mittelgrau + 1 EV (die Kamera-Konvention
    // der Profi-Engines, UE5-Belichtungs-Bias +1; `BELICHTUNG.zielKarte` aus der Tonkurve). Die Karte steht der Sonne zugewandt
    // (D3-N2, Sunny 16: die Blende folgt dem Durchlass, nie dem Sinus der Höhe) und liest L = 0,18/π · E.
    // SYNCHRON (S7): E ist die Bestrahlung des Orts (`_waagrechtIrradianz`) plus das Richtlicht, das
    // die Waagrechte nicht nimmt — der Himmel aus der Bestrahlungs-Tafel der EINEN Atmosphäre an der Sonne DIESER Anwendung.
    // Bis S7 las sie den Himmel aus der zurückgelesenen Umgebung (eine Lesung nach der Malung): nach jedem Sprung der Uhr trug
    // der erste Frame die Belichtung der vorigen Stunde (bis 0,57 EV, Uhr 0,75); die erste Runde von S7 setzte den Himmel als
    // Mittags-Anteil fest (ein Zwilling der Bestrahlung: am Horizont fehlten 0,5 EV).
    // DAS AUGE PASST SICH TEILWEISE AN (S7): um den klaren Mittag (die Zenit-Sonne der klaren Luft, `_belichtungAnker`) folgt die
    // Belichtung dem Licht mit dem Exponenten `BELICHTUNG.anpassung` — die tiefe Sonne bleibt dunkler und wärmer als der Mittag.
    // Bis S7 folgte sie ganz (die sonnenzugewandte Karte blieb bei jeder Höhe Mittelgrau + 1): Uhr 0,27 (Sonne 7°) stand die
    // Belichtung bei 4,4 und das Bild +0,7 … +1,3 EV über dem Mittag.
    // DER DECKEL GILT DER NACHT (D3-N2): über die Dämmerung gleitet das Auge geometrisch vom Tag-Gesetz in die geeichte Nacht
    // (`BELICHTUNG.max`; Mond, Sternen-Licht und Hemi-Boden sind auf ihn geeicht), im Maß des Kanals `tag` der EINEN Tag-Achse:
    // sie beginnt, wo die Ersatz-Lichter der Nacht beginnen (~14,5°), und endet in `BELICHTUNG.nachtGrad` — bis S7 brach die
    // Gleitung am Horizont zusammen (Wiese Uhr 0,73 → 0,75: −2,1 EV), in der ersten Runde von S7 begann sie erst am Horizont,
    // wo das Tag-Gesetz schon auf den Nacht-Böden stand (Belichtung 3,2 bei 0°, der Untergang hellte die Mauern +0,7 EV auf).
    _dayNightApplyBelichtung(achse) {
        const st = this.state;
        const rend = st.renderer;
        const dl = st.directionalLight;
        if (!rend || !dl) return;
        const B = AnazhRealm.BELICHTUNG;
        const e = this._waagrechtIrradianz(this._belichtungE || (this._belichtungE = [0, 0, 0]));
        if (!e) return;
        // die Waagrechte trägt das Richtlicht mit dem Sinus seiner Höhe (`_belichtungRichtung`, eben dort normiert) — die
        // Karte der Sonne zugewandt nimmt es ganz
        const dy = Math.max(0, this._belichtungRichtung.y);
        const richt = dl.intensity * (0.2126 * dl.color.r + 0.7152 * dl.color.g + 0.0722 * dl.color.b);
        const E = 0.2126 * e[0] + 0.7152 * e[1] + 0.0722 * e[2] + richt * (1 - dy);
        const EA = this._belichtungAnker();
        if (!EA) return;
        const tag = (B.zielKarte / ((0.18 / Math.PI) * EA)) * Math.pow(EA / Math.max(E, 1e-6), B.anpassung);
        rend.toneMappingExposure = Math.max(B.min, B.max * Math.pow(tag / B.max, achse.tag));
        st._belichtungSteht = true;
    }

    // DER ANKER DER ANPASSUNG (S7): E der Karte unter der Zenit-Sonne der klaren Luft — E0 (`KEY_BASE` · `LEGACY_LICHT`) × (ihr
    // Durchlass, `ATMO_RECHNUNG.sonne`, e = 1, Bezug der Luft, + der Himmel der Bestrahlungs-Tafel derselben Luft, `_himmelsAnker`).
    // Eine Größe des Gesetzes, EINMAL gerechnet, sobald die Tafel liegt (vorher null: die Belichtung schreibt nicht, das erste
    // Weltbild wartet, `_weltbildLuecken` licht); der Null-Renderer malt keinen Himmel (Lehre 16), dort trägt die Karte keinen.
    _belichtungAnker() {
        if (this._belichtungA) return this._belichtungA;
        const rend = this.state.renderer;
        const himmel = rend && rend._isHeadlessNull ? 0 : this._himmelsAnker;
        if (himmel == null) return null;
        const G = this._atmoGesetz();
        const R = this._atmoRechnung();
        const M = this._atmoMedium(R.betaKlar(G));
        const s = R.sonne(G, M, 0.001, 1, AnazhRealm.ATMO_LUT.schritte.durchlass, [0, 0, 0]);
        const l = 0.2126 * s.col.r + 0.7152 * s.col.g + 0.0722 * s.col.b;
        return (this._belichtungA = AnazhRealm.KEY_BASE * AnazhRealm.LEGACY_LICHT * (s.lum * l + himmel));
    }

    // DAS LICHT DES AUGES (K02a, Auge 11 bei 762/−138): wo der Himmel das Auge nicht erreicht, trägt der Leib sein Licht. Die
    // Höhle der Boden-Funktion bekommt kein Himmels-Licht (gelaende-core `himmelsSicht`), und 40 m hinter der Mündung erreicht sie auch
    // keine Sonne — die Ich-Sicht war schwarz (Helligkeit 0). Das Licht steht am Auge (die Kamera), seine Stärke folgt dem
    // Anteil des Himmels, der fehlt (`_himmelAmAuge`: das Auge adaptiert — unter dem Himmel bleibt jede Höhle dunkel), und
    // ist so geeicht, dass die 18-%-Karte in `AUGEN_LICHT.karteM` dasselbe Mittelgrau + 1 EV zeigt wie am Tag (die Belichtung
    // aus dem Licht: L = 0,18/π · E · Belichtung = zielKarte; der Abfall des EINEN Punktlicht-Gesetzes, fachwerk `lichtAbfall`).
    // Es ist ein PLATZ DES LICHT-POOLS mit Himmels-Ersatz (K11, `_leuchtTakt`): kein Szenen-Licht (K15), kein eigener Term —
    // es trägt nur, wo der Himmel fehlt (der Boden mit 1 − aHimmel), seine Stärke in der Zahl des Labors (÷ LEGACY_LICHT), damit
    // die EINE Übersetzung Labor → Welt sie trägt wie jede Quelle. Unter dem Himmel ist es aus (`_augenLeuchte` null).
    _dayNightApplyAugenLicht() {
        const st = this.state;
        const cam = st.camera;
        const h = cam ? this._himmelAmAuge(cam.position.x, cam.position.y, cam.position.z) : 1;
        st.himmelAmAuge = h;
        const B = AnazhRealm.BELICHTUNG;
        const A = AnazhRealm.AUGEN_LICHT;
        const k = st.renderer && st.renderer.toneMappingExposure > 0 ? st.renderer.toneMappingExposure : 1;
        const abstKarte = globalThis.__fachwerkCore.lichtAbfall(A, A.karteM);
        const I = ((1 - h) * ((B.zielKarte * Math.PI) / 0.18)) / (k * abstKarte);
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
                    staerke: 0,
                    reichweiteM: A.reichweiteM,
                    abfall: A.abfall,
                    kernM: A.kernM,
                    ersatz: true,
                },
                masse: 1,
                phase: 0,
            });
        q.L.staerke = I / AnazhRealm.LEGACY_LICHT;
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
    // (`_himmelsBestrahlung`, synchron aus der Bestrahlungs-Tafel der EINEN Atmosphäre) + Hemi + Ambient — dieselben Lichter,
    // die jedes Material liest. Die Rechnung der Belichtung (die 18-%-Karte); null, solange der Himmel des Orts noch nicht steht.
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
        add(dl.color, dl.intensity * dy);
        const himmel = this._himmelsBestrahlung(this._himmelE || (this._himmelE = [0, 0, 0]));
        if (!himmel) return null;
        out[0] += himmel[0];
        out[1] += himmel[1];
        out[2] += himmel[2];
        if (st.hemiLight) add(st.hemiLight.color, st.hemiLight.intensity);
        if (st.ambientLight) add(st.ambientLight.color, st.ambientLight.intensity);
        return out;
    }

    // Ambient-Light = NUR der Nachthimmel-Boden (EIN Himmel, V18.507): am Tag IST die Himmels-Umgebung
    // der Himmel (aus dem sichtbaren Himmel gemalt) — ein Tag-Ambient zählte ihn doppelt (Licht-Bilanz
    // 01.10.: Umgebung 1,89 + Hemi 0,53 + Ambient 0,16 = 0,36 der Sonne, klarer Himmel real 0,12–0,16).
    // Nachts ist der sichtbare Himmel fast schwarz; dort trägt der Boden mit Hemi (0,10) das Licht neben dem Mond. Er blendet
    // mit dem Kanal `nacht` der EINEN Tag-Achse (`_tagAchse`). joy/awe/sorrow modulieren wie bisher.
    // DER NACHT-BODEN DES BANDS IST LICHT (F6): das gefallene Band trug den Host-Stoffen (Boden, Karte, Fern-Ring, Werk,
    // Gras) einen Boden albedo · 0,06 hinter der Licht-Kette auf, der Studio-Gestalt nie — die Nacht der Nähe stand auf ihm.
    // Er zieht als Ambient (albedo/π · 0,06 π) in die EINE Kette, die jeder Stoff liest; die Fresnel-Säume des Bands, die die
    // Ferne bleichten, fallen. DIE NACHT-KALIBRIERUNG ist damit Mond/(amb+hemi) = 0,22 / (0,2285 + 0,10) = 0,67 (Mitternacht,
    // Radeon, Messort dorf; vorher 0,22 / 0,14 = 1,57): das Himmels-Licht trägt die Nacht, der Mond zeichnet ihr die Richtung —
    // jede Gestalt hebt es gleich (Fichte nachts Y 0,0093 → 0,0154), die Karte gegen ihre Gestalt bleibt im Band ±10 %
    // (`werkbank licht --laub fichte,tanne --karte --uhr`); Bühne S0, Mitternacht ohne Feuer: Boden Luma 21,3 → 30,3.
    _dayNightApplyAmbient(achse) {
        const al = this.state.ambientLight;
        if (!al) return;
        const baseAmb = (0.04 + 0.06 * Math.PI) * achse.nacht;
        al.intensity = this._emotionModulate(baseAmb, { joy: 0.08, awe: 0.05, sorrow: -0.04 });
        // V12.0-f — kein toonLightUniforms-Sync mehr; die nativen lights=true-
        // Materials konsumieren al.intensity direkt (Three.js-Lighting).
    }

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
    // der EINEN Atmosphäre — Rayleigh je Kanal (`ATMO_GESETZ.rayleighTiefe`, blau ~5× rot) über dem grauen Aerosol: blau
    // verlischt zuerst, die Ferne nimmt den Farbton des Himmels an, der sie überstreut. Unter Wasser das Spektrum des
    // Wasser-Gesetzes (`WASSER_GESETZ.wK`, rot verlischt zuerst). Bis ferne-luft löschte die Luft grau (EIN Skalar β), ihr
    // Himmel streute je Kanal (Linse: `werkbank licht --luft`, Δβ blau−rot 0 gegen die Referenz in spec).
    _luftSpektrum(beta, unterWasser, out) {
        if (unterWasser) {
            const wK = (
                AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) ||
                AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ")
            ).wK;
            return out.set(wK[0] / wK[1], 1, wK[2] / wK[1]);
        }
        const M = this._atmoMedium(beta);
        const k = 1000 * beta;
        return out.set((M.betaR[0] + M.mieExt) / k, (M.betaR[1] + M.mieExt) / k, (M.betaR[2] + M.mieExt) / k);
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
            spektrum: T.uniform(this._luftSpektrum(klar, false, new THREE.Vector3())),
            hoehe: T.uniform(L.skalenHoeheM),
            bezugY: T.uniform(0),
            farbe: T.uniform(new THREE.Color(0, 0, 0)),
            unterWasser: T.uniform(0),
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
        const farbe = T.Fn(([auge, punkt]) => {
            const dir = punkt.sub(auge).normalize();
            const himmel = A.himmelFarbe(T.vec3(dir.x, T.max(dir.y, 0.0), dir.z).normalize());
            return T.select(U.unterWasser.greaterThan(0.5), U.farbe, himmel);
        });
        st.scene.fogNode = T.vec4(
            T.mix(T.output.rgb, farbe(T.cameraPosition, T.positionWorld), faktor(T.cameraPosition, T.positionWorld)),
            T.output.a
        );
        st.luft = { U, faktor, farbe };
        return st.luft;
    }

    // HemisphereLight (der Nachthimmel-Boden) und die Luft synchron aus Tag-Nacht-Sky-Color × Welt-Feld am Spieler × Wetter.
    // Die In-Streu-Farbe der Luft über Wasser ist der Himmel der EINEN Atmosphäre (`_luftEnsure`); unter Wasser (die KAMERA
    // unter dem Spiegel) trägt dieselbe Extinktion die Wasser-Trübung im Licht des Orts.
    _dayNightApplyHemiUndLuft(achse, tint) {
        const hl = this.state.hemiLight;
        const pm = this.state.playerMesh;
        if (hl) {
            // die Farbe des Nachthimmel-Bodens ist der Nachthimmel des Gesetzes (`ATMO_GESETZ.nacht.himmel`), getönt wie der Himmel
            // (Wetter, Feld, Gefühl relativ zum Nenner der Tönung) — bis S7 die Tafel der Uhr (`DAY_NIGHT_STOPS`) × 1,1
            const N = this._atmoGesetz().nacht.himmel;
            const b = tint.basis;
            const q = (x, y) => (y > 1e-4 ? x / y : 1);
            hl.color.setRGB(N[0] * q(tint.skyR, b.r), N[1] * q(tint.skyG, b.g), N[2] * q(tint.skyB, b.b));
            const earth = new THREE.Color(0x463c2e); // Vorlagen-Hemi-Boden (phytogenesis Z.1291, warmes Braun statt 0x3a2818)
            // `tint.auraK` gated den Feld-Term des Hemi-BODENS: bei Default auraK=0 ist der Boden rein Tag-Nacht+Wetter;
            // Feld-Tönung nur über `atmosphere.auraTintStrength`.
            const _aKGround = tint && Number.isFinite(tint.auraK) ? tint.auraK : 0;
            if (_aKGround > 0 && pm && typeof this.auraAt === "function") {
                const field = this.auraAt(pm.position.x, pm.position.z); // §5 (V17.25): via auraAt (living)
                if (field) {
                    const lebendig = Math.max(0, Math.min(1, field.lebendig || 0)) * _aKGround;
                    const glut = Math.max(0, Math.min(1, field.glut || 0)) * _aKGround;
                    const mag = Math.max(0, Math.min(1, field.magieleitung || 0)) * _aKGround;
                    earth.r = Math.min(1, earth.r + lebendig * 0.15);
                    earth.g = Math.min(1, earth.g + lebendig * 0.25);
                    earth.r = Math.min(1, earth.r + glut * 0.35);
                    earth.g = Math.max(0, earth.g + glut * 0.1);
                    earth.r = Math.min(1, earth.r + mag * 0.15);
                    earth.b = Math.min(1, earth.b + mag * 0.3);
                }
            }
            hl.groundColor.copy(earth);
            // Hemi = NUR der Nachthimmel-Boden 0.1 (EIN Himmel, V18.507): der Tag-Term (Vorlagen-Hemi 0.55·π)
            // zählte die Himmels-Umgebung doppelt; die Mond-Nacht bleibt eigen getuned.
            hl.intensity = 0.1 * achse.nacht * tint.lightMul;
        }
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
            U.unterWasser.value = kameraUnterWasser ? 1 : 0;
            if (kameraUnterWasser) {
                // Unter Wasser: DIESELBE Formel, Wasser-Trübung ohne Höhen-Abnahme (H → ∞). Die Farbe ist das Unterwasser-
                // Gesetz des Terrain-Studios: der Durchlass der ersten 0,3 m (WASSER_GESETZ.wK, Beer-Lambert) × das Tageslicht
                // — die Leuchtdichte des Himmels über dem Wasser (E/π einer waagrechten Normale aus der Umgebung der EINEN
                // Atmosphäre, `_himmelsIrradianz`): mittags türkis, nachts dunkler als die Nacht darüber, im Sturm trüb.
                const WGu =
                    AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) ||
                    AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
                const e = this._himmelsIrradianz();
                const tagesLicht = e ? 0.2126 * e.mitte[0] + 0.7152 * e.mitte[1] + 0.0722 * e.mitte[2] : 0;
                U.farbe.value.setRGB(
                    Math.exp(-WGu.wK[0] * 0.3) * tagesLicht,
                    Math.exp(-WGu.wK[1] * 0.3) * tagesLicht,
                    Math.exp(-WGu.wK[2] * 0.3) * tagesLicht
                );
                U.beta.value = -Math.log(L.kontrast) / L.unterwasserM;
                U.hoehe.value = 1e9;
            } else {
                U.beta.value = this._luftBeta();
                U.hoehe.value = L.skalenHoeheM;
            }
            // das Spektrum je neuem β und Medium (eine Rechnung des Mediums je Wechsel, nie je Anwendung)
            const fuer = kameraUnterWasser ? -1 : U.beta.value;
            if (luft.spektrumFuer !== fuer) {
                this._luftSpektrum(U.beta.value, kameraUnterWasser, U.spektrum.value);
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
        const lightVal = Math.max(0.22, dl.intensity);
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
        if (sun) {
            const sx = Math.cos(angle) * sunDist;
            const sy = Math.sin(angle) * sunDist;
            const sz = Math.sin(angle * 0.5) * sunDist * 0.4;
            if (!sun.userData.skyOffset) sun.userData.skyOffset = new THREE.Vector3();
            sun.userData.skyOffset.set(sx, sy, sz);
            sun.visible = sy > -10; // unter Horizont ausblenden
            // Sonne dimmt mit Wetter (rainy = trüber Schein); die Scheibe leuchtet HDR (`HIMMEL.sonneLeucht`) über ihrem
            // Hof — die Ausgabe-Kette tont sie zum hellsten Punkt des Himmels.
            if (sun.material && sun.material.color) {
                const L = AnazhRealm.HIMMEL.sonneLeucht * lightMul;
                sun.material.color.setRGB(1.0 * L, 0.92 * L, 0.7 * L);
            }
        }
        if (moon) {
            // Mond gegenüber der Sonne
            const moonAngle = angle + Math.PI;
            const mx = Math.cos(moonAngle) * sunDist;
            const my = Math.sin(moonAngle) * sunDist;
            const mz = Math.sin(moonAngle * 0.5) * sunDist * 0.4;
            if (!moon.userData.skyOffset) moon.userData.skyOffset = new THREE.Vector3();
            moon.userData.skyOffset.set(mx, my, mz);
            moon.visible = my > -10;
            // Der Mond am Taghimmel ist BLASS: seine Leuchtdichte gegen die des Himmels (`HIMMEL.mondGegenHimmel`)
            // — nachts fast deckend, am Tag ein heller Schleier.
            if (moon.material) {
                const hell = (achse || this._tagAchse(this._dayNightSunDirection(angle).y)).hell;
                moon.material.opacity = 0.98 / (1 + hell / AnazhRealm.HIMMEL.mondGegenHimmel);
            }
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

    // Treibt timeOfDay nach Echtzeit + dayLength; currentTime in Sekunden (performance.now()/1000).
    // Delta aus _lastDayNightTick, gegen Sprünge (Tab-Wechsel) auf 1.0 s gekappt.
    tickDayNight(currentTime) {
        const last = this.state._lastDayNightTick;
        if (!Number.isFinite(last)) {
            this.state._lastDayNightTick = currentTime;
            this._applyDayNightToScene();
            return;
        }
        const delta = Math.min(1.0, currentTime - last); // Sekunden, gegen Tab-Sleeps
        this.state._lastDayNightTick = currentTime;
        const minutes = this.state.dayLengthMinutes || this.constructor.DAY_LENGTH_DEFAULT_MINUTES;
        const cycleSeconds = Math.max(60, minutes * 60); // hard-floor 1min
        const advance = delta / cycleSeconds; // wieviel von 0..1 in delta vergeht
        this._uhrSetzen((this.state.timeOfDay + advance) % 1, "uhr");
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
        const v = Number(t);
        if (!Number.isFinite(v)) return false;
        if (this._himmelSchreiber(quelle, "uhr") === "welt") {
            this.log(
                `Uhr gehalten: ${quelle || "?"} wollte ${this._timeOfDayLabel(v)} — die Uhr gehört dem Spieler`,
                "DEBUG"
            );
            return false;
        }
        // ein Schreiber außer dem Gang springt: der Himmel malt sich beim nächsten Anwenden des Tags neu (`_ensureSkyEnvironment`)
        if (quelle !== "uhr" && v !== this.state.timeOfDay) this._himmelSprung = true;
        // DER TAG DER WELT (feld.K4, `_weltStunde`): kreuzt die Uhr Mitternacht (der kürzere Bogen), zählt der Tag vor oder
        // zurück; das Laden setzt nur die Uhr — der Tag reist im worldMeta
        const d = v - this.state.timeOfDay;
        const wm = this.state.worldMeta;
        if (quelle !== "laden" && wm && Math.abs(d) > 0.5) wm.tag = (wm.tag || 0) + (d < 0 ? 1 : -1);
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
    // state.weather), während einer Transition führen from/to; unbekannt → sunny.
    // Gibt eine FRISCHE Kopie zurück (die frozen Statics bleiben unberührt).
    _weatherFieldFor(w) {
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
        if (wt && wt.from && wt.to) {
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            return lerpField(fieldFor(wt.from), fieldFor(wt.to), p);
        }
        const f = fieldFor(typeof w === "string" ? w : this.state.weather);
        return { fog: f.fog, sun: f.sun, grey: f.grey, wind: f.wind, rain: f.rain };
    }

    // DAS WETTER AM ORT (wetter.K1): das Wort der Front über (x, z) — der Kern (phyto-core `wetterAt` über die Saat der Welt,
    // den Ort und die Zeit, ohne `t` die Welt-Uhr `spielZeit`) wählt die Zeile von WX_GESETZ, die Welt spricht ihr Wort
    // (`WETTER_WORT`). Leser: der Wetter-Zug (`_loopWeatherAndGrowth`).
    _wetterAmOrt(x, z, t = this.state.spielZeit) {
        const wm = this.state.worldMeta || {};
        const zeile = globalThis.__phytoCore.wetterAt(wm.seed || "anazh-realm-seed", x, z, t).zeile;
        const wort = AnazhRealm.WETTER_WORT[zeile];
        if (!wort) throw new Error("_wetterAmOrt: die Zeile „" + zeile + "“ hat kein Wort der Welt (WETTER_ZEILE)");
        return wort;
    }

    // D5a (V18.128) — die wet-Frage: regnet es hier (rainy UND stormy)?
    // Ersetzt die binären ===\"rainy\"-Leser (Journal/Nexus/Spawn-Stimmung).
    _weatherIsWet(w) {
        const word = typeof w === "string" ? w : this.state.weather;
        return (AnazhRealm.WEATHER_INTENSITY[word] || 0) >= 1;
    }

    // DIE TEMPERATUR AN DER HÖHE y (stoffe.K3) — die EINE Naht zum Feld des Gelände-Kerns: `_temperaturFeld` das Feld in
    // Wellen (`temperaturFeld`; `traegTage` die Wärme-Trägheit eines Körpers), `_temperaturAt` sein Wert zur Saison
    // (`seasonPhase`) und Uhr (`timeOfDay`) der Welt. Leser: das Eis (`_eisLinien`) und die Grillen (`_umweltLage`).
    _temperaturFeld(y, traegTage) {
        return globalThis.__gelaendeCore.temperaturFeld(this._gelaende(), y, traegTage);
    }
    _temperaturAt(y, traegTage) {
        const st = this.state;
        return globalThis.__gelaendeCore.temperaturAus(
            this._temperaturFeld(y, traegTage),
            st.seasonPhase,
            st.timeOfDay
        );
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
        const wl = this._gelaende().waterLevel;
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

    // DIE NÄSSE (wetter.K2) — EIN Zustand der Welt aus dem Wetter-Feld (`state.naesse`, 0 trocken … 1 nass): Regen benetzt
    // (τ = NAESSE.benetzenS / rain), ohne Regen trocknet die Welt (τ = trocknenS / max(sun, 0,2)) — exakt je Schritt, also
    // dieselbe Nässe nach 600 Takten wie nach einem Schritt von 600 s (die Bühne der Linse `werkbank licht --naesse`). Ohne `dt`
    // zählt die Spiel-Zeit seit dem letzten Ruf (`_tickRain`). Der Leser ist der EINE Welt-Stoff (`_naesseImStoff`) über
    // `atmoUniforms.naesse`; den Dach-Pool seiner Himmels-Sicht wählt derselbe Takt (`_dachTakt`).
    _naesseTakt(dt) {
        const st = this.state;
        const N = AnazhRealm.NAESSE;
        if (dt == null) {
            dt = Number.isFinite(this._naesseUhr) ? st.spielZeit - this._naesseUhr : 0;
            this._naesseUhr = st.spielZeit;
        }
        const wf = this._weatherFieldFor(st.weather);
        const n0 = Number.isFinite(st.naesse) ? st.naesse : 0;
        const ziel = wf.rain > N.regenAb ? 1 : 0;
        const tau = ziel ? N.benetzenS / wf.rain : N.trocknenS / Math.max(wf.sun, 0.2);
        const n = ziel + (n0 - ziel) * Math.exp(-Math.max(0, dt) / tau);
        st.naesse = Math.abs(n - ziel) < N.ruhe ? ziel : n; // am Ziel steht sie (der Fixpunkt, an dem der Regen schläft)
        this._ensureAtmoUniforms().naesse.value = st.naesse;
        this._dachTakt();
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
    // die Wesen) nie selbst: sie WÜNSCHT das nächste Wort (`wetterWunsch`, Rückgabe "wunsch"), der Zug zieht es in seinem
    // Takt (`WETTER_ZUG_SEK`). Vorher hielt „setze wetter sonnig" bis zum nächsten Nexus-Regen (alle 4,7 s).
    // `zug` ({ von, beginn }) trägt der Wetter-Zug: sein Übergang ist eine Funktion der Welt-Uhr — aus dem Wort der Front `von`,
    // ab `beginn`, über die Dauer des Gesetzes (nie die Laune einer Seite), gleich welcher Übergang lief.
    _setWeather(name, quelle, zug) {
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
                this.state.wetterWunsch = { wort: name, quelle: quelle || "?" };
                return "wunsch";
            }
        }
        if (wer === "spieler") {
            this.state.wetterWort = name;
            this.state.wetterWunsch = null;
        } else if (wer === "gesetz" && this.state.wetterWort) this.state.wetterWort = name;
        const oldWeather = this.state.weather;
        this.state.weather = name;
        if (zug) {
            this.state.weatherTransition = null;
            this.requestWeatherTransition(name, this.constructor.WEATHER_TRANSITION_DURATION_MS, zug.von, zug.beginn);
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
        this.state.wetterWunsch = null;
        this._wetterZug = Math.floor(this.state.spielZeit / AnazhRealm.WETTER_ZUG_SEK);
        return true;
    }

    // [ATMOSPHERE] Startet einen Cross-Fade. Default-Dauer via _emotionModulate aus den Emotionen
    // (peace ×1.6 langsamer, chaos ×0.4 schneller); eine explizite Dauer überschreibt.
    // `beginn` ist die Welt-Uhr (s), ab der er läuft — ohne sie jetzt.
    requestWeatherTransition(target, durationMs, fromWeather, beginn = this.state.spielZeit) {
        // D5a (V18.128) — das Vokabular ist die WEATHER_INTENSITY-Tabelle
        // (sunny · rainy · stormy), nicht mehr das harte Binär-Paar.
        if (!(target in AnazhRealm.WEATHER_INTENSITY)) return false;
        let dur;
        if (typeof durationMs === "number" && Number.isFinite(durationMs)) {
            dur = Math.max(100, durationMs);
        } else {
            // Default mit Emotion-Modulation
            const baseDur = this.constructor.WEATHER_TRANSITION_DURATION_MS; // 45000
            const modulated = this._emotionModulate(baseDur, {
                peace: { mul: 1.6 }, // peace=1 → ×1.6 (72s)
                chaos: { mul: 0.4 }, // chaos=1 → ×0.4 (18s)
                sorrow: { mul: 1.2 }, // sorrow zieht Wolken langsam-melancholisch
            });
            dur = Math.max(8000, Math.min(120000, modulated));
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
            return true;
        }
        this.state.weatherTransition = {
            from,
            to: target,
            progress: 0,
            duration: dur,
            startedAt: beginn,
        };
        return true;
    }

    // Pro Frame: treibt weatherTransition.progress auf der Welt-Uhr (`startedAt` in s der Welt-Uhr, `duration` in ms); bei ≥ 1
    // state.weather = to, Transition genullt. Währenddessen wirken Skybox-Mul (_applyDayNightToScene) und die Klang-Welt (der
    // Regen liest das transition-aware Wetter-Feld `_weatherFieldFor` — kein zweiter Schreiber).
    tickWeatherTransition(_currentTime) {
        const wt = this.state.weatherTransition;
        if (!wt) return;
        wt.progress = Math.max(0, Math.min(1, ((this.state.spielZeit - wt.startedAt) * 1000) / wt.duration));
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
// Helligkeit wie am Tag — die 18-%-Karte in `karteM` das Mittelgrau + 1 EV (die Stärke folgt der Belichtung: das Auge
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
// (`_saisonMul`, Karten-Stoff), fail-closed in EINER Gültigkeits-Wand.
AnazhRealm._saisonGesetz = function () {
    const SG = AnazhRealm.Gesetz("terrain:SAISON_GESETZ", null);
    if (
        SG &&
        Array.isArray(SG.stuetzen) &&
        SG.stuetzen.length === 4 &&
        SG.stuetzen.every((s) => s && Number.isFinite(s.ti)) &&
        Number.isFinite(SG.bau) &&
        Number.isFinite(SG.mulMin) &&
        Number.isFinite(SG.mulMax) &&
        Number.isFinite(SG.kartenGewicht)
    )
        return SG;
    return AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ");
};
AnazhRealm.LUFT = Object.freeze(Object.assign({}, AnazhRealm._atmoKern().luft, { unterwasserM: 30 }));
// DER HIMMEL (V18.530): die Sichtbarkeit seiner Punkte ist Physik. `grenzgroesse` = Dämmerungs-Anker [Sonnenhöhe
// in Grad, Grenzgröße des bloßen Auges]: im hellen Tag (≥ 10°) ist nichts zu sehen, nahe dem Horizont gerade die
// Venus, bei Sonnenuntergang der Abendstern (−3), am Ende der bürgerlichen Dämmerung (−6°) die hellsten Sterne
// (+1,5), der nautischen (−12°) +4, in astronomischer Nacht (−18°) +6. `sternMagSchwach` = die schwächsten
// Sterne des Feldes (+6). `wandelsterne` = die hellen Planeten als PUNKTE des Feldes (Venus −4,2 weißgelb,
// Jupiter −2,3 cremeweiß, Mars −1,0 rötlich; Pixel knapp über dem hellsten Stern). `mondGegenHimmel` =
// Leuchtdichte des Vollmonds gegen den blauen Tageshimmel (≈ 2500 : 5000 cd/m²) — am Tag ein blasser Schleier.
AnazhRealm.HIMMEL = Object.freeze({
    grenzgroesse: Object.freeze(
        [
            [10, -5],
            [2, -4.5],
            [0, -3],
            [-6, 1.5],
            [-12, 4],
            [-18, 6],
        ].map((a) => Object.freeze(a))
    ),
    sternMagSchwach: 6,
    wandelsterne: Object.freeze([
        Object.freeze({ mag: -4.2, farbe: Object.freeze([1.0, 0.97, 0.88]), groesse: 7.5 }),
        Object.freeze({ mag: -2.3, farbe: Object.freeze([1.0, 0.94, 0.82]), groesse: 7.0 }),
        Object.freeze({ mag: -1.0, farbe: Object.freeze([1.0, 0.66, 0.46]), groesse: 6.8 }),
    ]),
    mondGegenHimmel: 0.5,
    // DIE SONNE (Integration 05.10.): der Körper steht `koerperAbstandM` vor der Kamera (Sonne und Mond, vor der Skybox
    // bei 500 m); die Scheibe trägt den echten Winkel `sonneWinkelGrad` (0,53°) und die Leuchtdichte `sonneLeucht` ×
    // ihre Farbe — über dem HDR-Hof der Skybox (Scheibe + Halo ≈ 2,6 linear), sonst deckte das Mesh die Mitte grau.
    koerperAbstandM: 380,
    sonneWinkelGrad: 0.53,
    sonneLeucht: 4,
});
// MONDLICHT: nachts wird das Haupt-Richtlicht zur Mondquelle (gegenüber der Sonne, kühl + gedämpft →
// gerichtete Nacht-Schattierung mit tiefen Schwärzen) statt die Nacht per Post-FX aufzuhellen.
// `r/g/b` = HUE (Purkinje-Mond 0x9fb8dc aus dem Gesetz `ATMO_GESETZ.nacht.mond` — `_atmoSonne(e)` und das Labor lerpen
// unter dem Horizont exakt hierher; b>r = kühl), `intensity` = Helligkeit; Wetter dimmt den Mond.
AnazhRealm.MOONLIGHT = Object.freeze({
    r: AnazhRealm._atmoKern().nacht.mond[0],
    g: AnazhRealm._atmoKern().nacht.mond[1],
    b: AnazhRealm._atmoKern().nacht.mond[2],
    intensity: 0.22,
});
// DIE TAFELN DER EINEN ATMOSPHÄRE (D3, Hillaire 2020; `_atmoLutBau`): Größen (Texel) und Marsch-Schritte. Transmittance
// 256×64 und Ψ_ms 32×32 je Medium, die Himmels-Sicht 192×108 je Stufe der Sonne, die Umgebung 128×64 (Equirekt, PMREM).
// mediumStufe: die Stufe des Mediums im Logarithmus der Extinktion (`_atmoMediumJetzt`) — 2 % halten den Zenit-Durchlass
// der klaren Luft (Aerosol-Tiefe 0,18) unter einer 8-bit-Stufe; ein Übergang klar → Sturm (Faktor 13) sind 130 Stufen.
AnazhRealm.ATMO_LUT = Object.freeze({
    mediumStufe: 0.02,
    durchlass: Object.freeze([256, 64]),
    mehrfach: Object.freeze([32, 32]),
    himmel: Object.freeze([192, 108]),
    umgebung: Object.freeze([128, 64]),
    bestrahlung: Object.freeze([65, 1]),
    richtungen: Object.freeze([12, 24]),
    schritte: Object.freeze({ durchlass: AnazhRealm._atmoKern().durchlassSchritte, mehrfach: 20, himmel: 32 }),
});
// DER BODEN DER ATMOSPHÄRE (D3): die gemessene Welt-Albedo (linear) — das Mittel aus Laub und Wald-Boden der Albedo-Tafel
// (spec/farbe/albedo-tafel.json, ist.welt; `werkbank albedo --tafel`), nie ein Grau 0,3. Er trägt die Mehrfachstreuung und
// die untere Hälfte der Umgebung; `diag-atmo-hillaire` hält ihn an der Tafel (±3 %).
AnazhRealm.ATMO_BODEN = Object.freeze([0.1003, 0.1385, 0.0449]);
// Licht-Rig: KEY_BASE skaliert die Rayleigh-Lichtmenge aufs Schlüssellicht (Mittag ≈ 2.6·0.913). Ziel key-dominant (Vorlage dir/(amb+hemi) ≈ 15:1); die Schattenseite trägt der Himmel.
AnazhRealm.KEY_BASE = 2.6;
// r128→r184-Licht-Übersetzung (three.js r155, useLegacyLights → physisch): Legacy-Licht hatte keine
// 1/π-BRDF-Normierung — physikalische Lichter sind bei gleicher Zahl ~π-fach dunkler. Die aus dem
// r128-Studio kopierten Rig-Werte (Key · Hemi-Tag) laufen durch diesen EINEN Faktor;
// die Nacht bleibt unberührt (Mond-Pfad eigen, Hemi-Nacht-Floor außerhalb). Kein Tuning-Knopf.
AnazhRealm.LEGACY_LICHT = Math.PI;
// DIE BELICHTUNG (V18.507, `_dayNightApplyBelichtung`) — EINE Eichung mit der Tonkurve (F1): `kurve` ist die Tonkurve des
// Renderers (25a liest sie, three r184: Khronos PBR Neutral), `zielKarte` die Leuchtdichte der 18-%-Karte nach der
// Belichtung, die DIESE Kurve auf Mittelgrau + 1 EV legt (`npm run look-lens` rechnet sie aus der Kurve nach). Neutral gibt
// unter der Schulter x − 0,04 aus: Mittelgrau (sRGB 118 = linear 0,18) braucht den Eingang 0,22, also k·L = 2 · 0,22 = 0,44
// (unter ACES bis F1: 2 · 0,26227 · 0,6 = 0,3147). `max` hält die geeichte Nacht (über ihn hebt nur das Licht des Himmels,
// D3-N2): die Nacht ist auf die Karte geeicht (Mond, Sternen-Licht, Hemi-Boden) — der Deckel legt sie so weit unter
// Mittelgrau + 1 wie bis F1 die Belichtung 1,0 unter ACES, 0,44 / 0,3147 = 1,4. `min` ist nur die Wand gegen ein entartetes Licht.
// `anpassung` (S7) ist der Exponent, mit dem das Auge dem Licht um den klaren Mittag folgt (1 = ganz, 0 = nie), `nachtGrad` (S7)
// die Tiefe der Sonne, in der das Auge die geeichte Nacht erreicht (die Gleitung beginnt am Kanal `nacht` der Tag-Achse, ~14,5°).
// Gemessen je Seite (Radeon, `werkbank licht --tag`): bei fester Belichtung fällt das Licht von der Sonne in 7° zum Horizont am
// Spawn um 0,9 (Morgen) und 0,15 EV (Abend) und bleibt darunter bis Mitternacht flach (die Nacht-Böden) — der Morgen verlangt
// zwischen 7° und 0° mindestens 0,41 EV Öffnung, der Abend höchstens 0,65; die goldene Stunde 0,5–1 EV unter dem Mittag (Mittel)
// mit jeder Seite darunter legt anpassung 0,34 und nachtGrad −32 fest (Belichtung 1,68 bei 7°, 2,29 am Horizont, 1,4 bei −32°).
AnazhRealm.BELICHTUNG = Object.freeze({
    kurve: "NeutralToneMapping",
    zielKarte: 0.44,
    min: 0.25,
    max: 1.4,
    anpassung: 0.34,
    nachtGrad: -32,
});
// Mindestabstand zwischen zwei Sky-Env-PMREM-Regenerierungen (Wall-Clock): Tag-Nacht-Uhr und
// Emotions-Cross-Fade driften die Himmelsfarbe, jede Regeneration rendert einen PMREM-Pass (teuer
// auf schwacher GPU). 6 s deckelt einen 45-s-Cross-Fade auf ~7; der IBL-Nachlauf ist unmerklich.
AnazhRealm.SKY_ENV_REGEN_MIN_MS = 6000;
// Die Obergrenze der Sonnen-Stufe (`_sonnenStufe`): N·L ändert sich bei einer Drehung um α höchstens um α — unter einer
// 8-bit-Stufe ist sie unsichtbar.
AnazhRealm.SONNEN_STUFE_SCHATTIERUNG = 1 / 255;
