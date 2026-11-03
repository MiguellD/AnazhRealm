class AnazhRealm_bild_schatten {
    // ===== ATLAS · Bild/schatten — Schatten-Kaskaden · Kaskaden-Box und Fit · Filter der Sonnen-Scheibe · Wurf-Ebene · Bias · Schatten-Takt =====
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

    // Alle Schatten-Maps im nächsten Render neu — die EINE Markierung (Werkzeuge vor einer Aufnahme): je Licht am
    // echten Leser, und jede Kaskade legt ihre Box frisch aus dem Blick, der jetzt gilt (A9-n2: der Halt des Takts und die
    // Größen-Hysterese trugen die Box des Boots in den Schuss — Erst- und Zweit-Boot zeichneten verschiedene Karten).
    _schattenAlleNeu() {
        const csm = this.state.csmNode;
        const dl = this.state.directionalLight;
        const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
        for (const l of lichter) if (l.shadow) l.shadow.needsUpdate = true;
        if (csm && csm._anazhFit) csm._anazhFit.length = 0;
        // der Wurf des Feuers zeichnet im nächsten Bild an der Lage, die dann gilt (`_lichtWurfTakt`)
        if (this._lichtWurfK) this._lichtWurfK.neu = true;
    }

    // ═══ DER RÜCKSTRAHL DES BODENS (schatten.K4) ═══
    // Am Tag trug nur der Himmel die Umgebung, ihre untere Hälfte der Boden der Atmosphäre: eine weiße Wand im Eigenschatten
    // neben besonnter Wiese zeigte dieselbe Luma wie vor einer schwarzen Platte (Radeon 5fba36ea: 0,1636 gegen 0,1636). Der
    // Boden strahlt zurück, was er empfängt — Sonne × cos × Albedo, Himmel × Albedo — und genau das hat der Szenen-Pass
    // gezeichnet: die STRAHLDICHTE DES GEZEICHNETEN BODENS um das Auge (`umkreisM`, unter dem Auge um `unterAugeM`, die
    // Fläche waagrecht bis `normalY`, aus der Tiefe), gemittelt über ein Raster von `raster`² Pixeln des Bilds, ist die untere
    // Hemisphäre der EINEN Umgebung (Frostbite/UE: das Himmels-Licht mit der Farbe der unteren Hemisphäre aus dem Boden).
    // Ein Ziel 2 × 1: Texel 0 der gemessene Boden (gefolgt mit `folge` je Bild — ohne Boden im Bild hält er), Texel 1 der Boden
    // der Atmosphäre (die PMREM-Umgebung nach unten in der Stufe der Bestrahlung × das Licht jetzt) — der Stoff ersetzt ihn
    // (`_spiegelUmgebung`: + (Boden − Atmosphäre) · (1 − n.y)/2, die Bestrahlung einer geneigten Fläche aus dem Halbraum).
    // Ein Boden aus Albedo 0 trägt nichts zurück. Der Pass läuft nach dem Bild (wie der Spiegel), das nächste liest ihn: EIN
    // Dreieck in 2 Pixel, eine Kopie.
    _rueckstrahlLeser() {
        const st = this.state;
        if (st.rueckstrahlLeser) return st.rueckstrahlLeser;
        const T = THREE.TSL;
        const ziel = (name) => {
            const rt = new THREE.RenderTarget(2, 1, { type: THREE.HalfFloatType, depthBuffer: false });
            rt.name = rt.texture.name = name;
            rt.texture.minFilter = rt.texture.magFilter = THREE.NearestFilter;
            rt.texture.generateMipmaps = false;
            return rt;
        };
        const rt = ziel("rueckstrahl:boden");
        st.rueckstrahlLeser = Object.assign(
            { rt, halt: ziel("rueckstrahl:halt") },
            this._uniformHeimatTeilen({ an: T.uniform(0) })
        );
        return st.rueckstrahlLeser;
    }

    // Die Strahldichte, die die untere Hemisphäre der Umgebung ändert (rgb, TSL): gemessener Boden − Boden der Atmosphäre.
    // Die Texel liest ein Laden mit der Stufe 0 BEIM NAMEN: der Leser lebt in der Bestrahlung der Umgebung, und r184 reicht
    // jedem Textur-Knoten ohne eigene Stufe die Stufe ihres Zusammenhangs (`getTextureLevel`, dort 1) — das Laden fragte die
    // Stufe 1 eines Ziels ohne Stufen, außerhalb seiner Grenzen: 0 auf jeder GPU, die Wand trug den Boden nie (Radeon
    // 59d8aec1: LA = LB 0,1741 auch mit `an` × 40; WGSL der Wand `textureLoad(…, u32(1.0))`).
    _rueckstrahlUnten() {
        const T = THREE.TSL;
        const L = this._rueckstrahlLeser();
        const boden = T.textureLoad(L.rt.texture, T.ivec2(0, 0), T.int(0)).rgb;
        const atmo = T.textureLoad(L.rt.texture, T.ivec2(1, 0), T.int(0)).rgb;
        return boden.sub(atmo).mul(L.an);
    }

    _rueckstrahlPass() {
        const st = this.state;
        if (st.rueckstrahlPass) return st.rueckstrahlPass;
        const T = THREE.TSL;
        const { Fn, Loop, If, float, vec2, vec3, vec4, ivec2, uniform, screenUV, select, mix, abs, normalize, cross } =
            T;
        const R = AnazhRealm.RUECKSTRAHL;
        const L = this._rueckstrahlLeser();
        const tiefe = T.texture(st.scenePass.getTextureNode("depth").value);
        const farbe = T.texture(st.scenePass.getTextureNode().value);
        const halt = T.texture(L.halt.texture);
        const webgpuRaum = st.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        const U = this._uniformHeimatTeilen({
            invVP: uniform(new THREE.Matrix4()),
            auge: uniform(new THREE.Vector3()),
            folge: uniform(1),
        });
        // der Boden der Atmosphäre: dieselbe PMREM-Stufe und dasselbe Licht wie der Himmel jedes Stoffs (`_spiegelUmgebung`)
        const atmoBoden = T.pmremTexture(st._skyEnvRT.texture, vec3(0, -1, 0), float(1)).mul(this._umgebungLicht());
        const mat = new THREE.MeshBasicNodeMaterial();
        mat.name = "rueckstrahl:boden";
        mat.fog = false;
        mat.depthTest = false;
        mat.depthWrite = false;
        mat.fragmentNode = Fn(() => {
            const summe = vec3(0).toVar();
            const n = float(0).toVar();
            const gr = vec2(tiefe.size());
            const welt = (px) => {
                const d = tiefe.load(px).r;
                const uv = vec2(px).add(0.5).div(gr);
                const w4 = U.invVP.mul(
                    vec4(uv.x.mul(2).sub(1), float(1).sub(uv.y).mul(2).sub(1), webgpuRaum ? d : d.mul(2).sub(1), 1)
                );
                return vec4(w4.xyz.div(w4.w), d);
            };
            Loop(R.raster, R.raster, ({ i, j }) => {
                const px = ivec2(vec2(float(i), float(j)).add(0.5).div(R.raster).mul(gr.sub(2)));
                const p = welt(px).toVar();
                If(p.w.lessThan(0.99999), () => {
                    const ax = welt(px.add(ivec2(1, 0))).xyz.sub(p.xyz);
                    const ay = welt(px.add(ivec2(0, 1))).xyz.sub(p.xyz);
                    const nY = abs(normalize(cross(ax, ay)).y);
                    const rel = p.xyz.sub(U.auge);
                    If(
                        rel.y
                            .lessThan(-R.unterAugeM)
                            .and(rel.xz.length().lessThan(R.umkreisM))
                            .and(nY.greaterThan(R.normalY)),
                        () => {
                            summe.addAssign(farbe.load(px).rgb);
                            n.addAssign(1);
                        }
                    );
                });
            });
            const alt = halt.load(ivec2(0, 0)).rgb;
            const boden = select(n.greaterThan(0), mix(alt, summe.div(n.max(1)), U.folge), alt);
            return vec4(select(screenUV.x.lessThan(0.5), boden, atmoBoden), 1);
        })();
        const pp = st.postProcessing;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function") throw new Error("RÜCKSTRAHL: Quad der Post-Kette fehlt (Vendor-Drift)");
        const quad = new Quad(mat);
        quad.name = "rueckstrahl:boden";
        st.rueckstrahlPass = { quad, mat, U, vp: new THREE.Matrix4(), laeufe: 0 };
        return st.rueckstrahlPass;
    }

    // NACH DEM BILD (`_loopRender`, auf der Post-Kette, neben dem Spiegel): der Pass misst den Boden dieses Bilds in seiner
    // Ansicht, das nächste Bild liest ihn. Ohne Szenen-Pass oder ohne Umgebung misst niemand (`an` 0): dann trägt kein Stoff
    // einen gezeichneten Boden — ein Bruch des Passes meldet sich beim EINEN Melder und lässt `an` auf 0.
    _rueckstrahlZeichne() {
        const st = this.state;
        const L = this._rueckstrahlLeser();
        if (!st.scenePass || !st._skyEnvRT || st.rueckstrahlBruch) {
            L.an.value = 0;
            return;
        }
        try {
            const P = this._rueckstrahlPass();
            const cam = st.camera;
            P.vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
            P.U.invVP.value.copy(P.vp).invert();
            P.U.auge.value.setFromMatrixPosition(cam.matrixWorld);
            // springt das Auge, gilt der neue Boden sofort (der erste Lauf, ein Sprung der Zeit-Auflösung)
            P.U.folge.value = P.laeufe === 0 || (st._traaR && st._traaR.sprung) ? 1 : AnazhRealm.RUECKSTRAHL.folge;
            const rend = st.renderer;
            const vor = rend.getRenderTarget();
            rend.setRenderTarget(L.rt);
            P.quad.render(rend);
            rend.setRenderTarget(vor);
            rend.copyTextureToTexture(L.rt.texture, L.halt.texture);
            P.laeufe++;
            L.an.value = 1;
        } catch (err) {
            st.rueckstrahlBruch = true;
            L.an.value = 0;
            this._stoffBruch(
                "der Rückstrahl des Bodens (schatten.K4) — die Umgebung trägt unten den Boden der Atmosphäre",
                err
            );
        }
    }

    // ═══ DER WURF DES FEUERS (schatten.K5) ═══
    // Das Leuchtquellen-Gesetz wirkt als Pool im Stoff (`_lichtPoolTerm`, K11): je Platz ein Zweig, kein Szenen-Licht, kein
    // Schatten — ein Pfosten 2 m vom Feuer warf nichts (Radeon 5fba36ea: Kontrast 0,768:1, ohne Pfosten 0,768). Wie RDR2 und
    // Witcher 3 wirft nur die WICHTIGSTE Quelle im Blick: EIN Platz des Pools (`platz`, die Wahl `_lichtWurfTakt`) trägt den
    // Faktor seines Würfel-Schattens — r184s `PointShadowNode` (sechs Seiten in eine Würfel-Tiefe, der Vergleich mit PCF) an
    // einem TRÄGER, der kein Licht ist: ein Knoten mit r184s Würfel-Schatten (`PointLightShadow`), Lage und Reichweite des
    // Platzes — nie ein Szenen-Licht (K11/K15: r184 sammelte es in den Licht-Hash jedes Stoffs, und jedes Punktlicht ist ein
    // Platz des Pools). Sein Knoten lebt im Pool-Term, Lage, Reichweite und Farbe bleiben die des Platzes — derselbe
    // Eintrag, kein Zwilling; fern und
    // unwichtig bleibt der Pool ohne Wurf. Die Würfel-Kamera ist ein Schatten-Pass (`_schattenKameraIndex`: Wurf-Ebene,
    // Satz- und Werfer-Wahl je Seite wie eine Kaskade) und sieht nur die Werfer bis zur Reichweite; der Kern der Quelle
    // (`kernM` × `kernAnteil`, ihre nahe Ebene) wirft nicht — die Flamme ist Licht, nie ihr eigener Werfer: der Kern des
    // Gesetzes ist der Leib, den der Abfall der Quelle schon rechnet, und was in ihm liegt (Scheite, der Steinring des Herds)
    // nimmt ihr nichts (Radeon, Karte des Faktors am Boden um den Glutbrunnen: mit der halben Kern-Ebene warf der eigene
    // Ring zwei harte Keile, mit dem ganzen Kern gleicht der Boden dem ohne jeden Bau). Die Karte zeichnet der Licht-Takt
    // vor dem Bild in der Welt-Szene (`_lichtWurfKarte`) — ein Stoff der Vorschau oder der Karten-Bühne liest den Pool auch.
    _lichtWurf() {
        if (this._lichtWurfK) return this._lichtWurfK;
        const LW = AnazhRealm.LICHT_WURF;
        if (typeof THREE.TSL.pointShadow !== "function")
            throw new Error("LICHT-WURF: THREE.TSL.pointShadow fehlt (Vendor-Drift)");
        // DIE WÜRFEL-KARTE wie r184s `PointLightShadow` (eine 90°-Kamera über `LightShadow`, `isPointLightShadow`): r184
        // exportiert keine der beiden Klassen — die Basis steht in der Kette jeder Richtlicht-Karte (gelesen am Vendor 03.11.)
        const LightShadow = Object.getPrototypeOf(new THREE.DirectionalLight().shadow.constructor);
        const licht = new THREE.Object3D();
        licht.name = "licht:wurf";
        licht.shadow =
            typeof LightShadow === "function" ? new LightShadow(new THREE.PerspectiveCamera(90, 1, 0.5, 500)) : null;
        if (!licht.shadow || !licht.shadow.mapSize || typeof licht.shadow.updateMatrices !== "function")
            throw new Error("LICHT-WURF: die Basis der Schatten-Karte (LightShadow) fehlt (Vendor-Drift)");
        licht.shadow.isPointLightShadow = true;
        licht.distance = 1;
        // er wirft (`_wurfEbene`): ohne das rechnete r184s Schatten-Matrix je Render die eines Richtlichts (mit Ziel)
        licht.castShadow = true;
        // die Klasse aus r184s TSL-Bauer `pointShadow` (das Bündel der Seite reicht `PointShadowNode` nur dort)
        const Basis = THREE.TSL.pointShadow(licht).constructor;
        if (typeof Basis !== "function" || Basis.type !== "PointShadowNode")
            throw new Error("LICHT-WURF: TSL.pointShadow baut keinen PointShadowNode (Vendor-Drift)");
        const sh = licht.shadow;
        sh.mapSize.set(LW.kartePx, LW.kartePx);
        sh.bias = LW.bias;
        sh.normalBias = LW.normalBiasM;
        sh.radius = LW.weichPx;
        sh.autoUpdate = false;
        sh.needsUpdate = false;
        sh.camera.near = LW.nahM;
        sh.camera.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
        // DIE KARTE ZEICHNET DER LICHT-TAKT VOR DEM BILD (`_lichtWurfTakt` → `_lichtWurfKarte`), nie das Vorher eines Empfängers:
        // r184 zeichnet einen Schatten im `updateBefore` des ersten Stoffs, der ihn liest — im Bündel-Abspiel, unter der
        // Diät und vor fertigen Programmen zeichnete so keiner, und der Platz trug den Faktor einer nie gezeichneten Würfel-Tiefe
        // (0 je Texel: alles im Wurf — GTX 59d8aec1, der Glutbrunnen nachts −91 % auch ohne Pfosten)
        class WurfSchatten extends Basis {
            updateBefore() {}
        }
        const roh = new WurfSchatten(licht);
        const knoten = THREE.TSL.nodeObject(roh);
        // der Faktor im Stoff: ohne Schatten-Karte des Renderers (Holz kienspan) wirft nichts — wie jede Kaskade dort
        const N = Object.getPrototypeOf(THREE.InstanceNode);
        class WurfFaktor extends N {
            constructor() {
                super("float");
            }
            setup(builder) {
                return builder.renderer && builder.renderer.shadowMap && builder.renderer.shadowMap.enabled === true
                    ? knoten
                    : THREE.TSL.float(1);
            }
        }
        this._lichtWurfK = {
            licht,
            roh,
            knoten,
            faktor: THREE.TSL.nodeObject(new WurfFaktor()),
            platz: this._uniformHeimatTeilen({ p: THREE.TSL.uniform(-1) }).p,
            id: null,
            stand: "",
            bild: 0,
            karteBild: -1e9,
            karten: 0,
            neu: false,
            wichtig: 0,
        };
        return this._lichtWurfK;
    }

    // DIE WAHL DES WURFS je Bild (aus `_leuchtTakt`, nach den Plätzen): unter den Plätzen mit Licht (ohne das Licht des Auges,
    // es folgt der Kamera und trägt nur ohne Himmel) die Quelle mit der größten Wichtigkeit im Bild — die Bestrahlung in
    // `bezugM` (der Abfall des Gesetzes, wie der Stoff ihn rechnet) × die Fläche ihrer Reichweite im Bild (R / Abstand)²,
    // ihre Kugel im Frustum —, wichtig erst, wenn sie in `bezugM` mindestens `wichtigAb` des Lichts der Welt trägt (die
    // waagrechte Bestrahlung der Belichtung, `_belichtungE`: mittags wirft kein Lagerfeuer sichtbar). Die Wahl hält,
    // solange keine andere um `halten` wichtiger ist. Die Karte zeichnet neu bei neuer Wahl oder Lage (die Lage des Lichts
    // springt nur mit der Karte: Karte und Abfrage tragen dieselbe Lage) und im Takt `takt` Bilder, wenn in diesem Bild
    // keine Kaskade zeichnet (die Werfer am Feuer bewegen sich); `platz` trägt den Faktor erst, wenn die Karte steht.
    _lichtWurfTakt(pool, cam) {
        const W = this._lichtWurf();
        const LW = AnazhRealm.LICHT_WURF;
        const atmo = this.state.atmoUniforms;
        W.bild++;
        const F = this._leuchtKegel(cam);
        const kugel = this._lichtWurfKugel || (this._lichtWurfKugel = new THREE.Sphere());
        const E = this._belichtungE;
        const eWelt = E ? 0.2126 * E[0] + 0.7152 * E[1] + 0.0722 * E[2] : 0;
        const cp = cam.position;
        let best = -1,
            bestW = 0,
            altK = -1,
            altW = 0;
        for (let k = 0; k < pool.halter.length; k++) {
            const q = pool.halter[k];
            const lage = atmo.lichtLage[k].value;
            const farbe = atmo.lichtFarbe[k].value;
            if (!q || !(lage.w > 0) || q.quelle === "auge" || (q.L && q.L.ersatz)) continue;
            if (!F.intersectsSphere(kugel.set(kugel.center.set(lage.x, lage.y, lage.z), lage.w))) continue;
            const d = LW.bezugM / lage.w;
            const eBezug =
                (0.2126 * farbe.x + 0.7152 * farbe.y + 0.0722 * farbe.z) *
                Math.pow(LW.bezugM * LW.bezugM + atmo.lichtKern[k].value, -farbe.w / 2) *
                Math.max(0, 1 - d ** 4) ** 2;
            if (!(eBezug >= LW.wichtigAb * eWelt)) continue;
            const ab = Math.max(1, Math.hypot(lage.x - cp.x, lage.y - cp.y, lage.z - cp.z));
            const w = eBezug * (lage.w / ab) ** 2;
            if (q.id === W.id) ((altK = k), (altW = w));
            if (w > bestW) ((best = k), (bestW = w));
        }
        if (altK >= 0 && altW * LW.halten >= bestW) ((best = altK), (bestW = altW));
        W.wichtig = bestW;
        if (best < 0) return this._lichtWurfRuht(W);
        const q = pool.halter[best];
        const lage = atmo.lichtLage[best].value;
        const stand = `${lage.x.toFixed(2)},${lage.y.toFixed(2)},${lage.z.toFixed(2)},${lage.w}`;
        const kaskadeJetzt = (() => {
            const csm = this.state.csmNode;
            const dl = this.state.directionalLight;
            const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
            return lichter.some((l) => l.shadow && l.shadow.needsUpdate === true);
        })();
        const neueWahl = q.id !== W.id;
        const faellig =
            neueWahl ||
            W.neu ||
            (stand !== W.stand && W.bild - W.karteBild >= LW.takt) ||
            (!kaskadeJetzt && W.bild - W.karteBild >= LW.takt);
        if (faellig) {
            const L = W.licht;
            L.position.set(lage.x, lage.y, lage.z);
            L.distance = lage.w;
            L.updateMatrixWorld(true);
            const kern = q.L && q.L.kernM > 0 ? q.L.kernM : 0;
            const nah = Math.max(LW.nahM, kern * LW.kernAnteil);
            if (L.shadow.camera.near !== nah) {
                L.shadow.camera.near = nah;
                L.shadow.camera.updateProjectionMatrix();
            }
            if (!this._lichtWurfKarte(cam)) return this._lichtWurfRuht(W);
            W.stand = stand;
            W.karteBild = W.bild;
            W.karten++;
            W.neu = false;
            W.id = q.id;
        }
        // die Karte steht (gezeichnet vor diesem Bild): ab jetzt trägt der Platz ihren Faktor
        W.platz.value = W.id === q.id ? best : -1;
    }

    // DIE WÜRFEL-KARTE JETZT, vor dem Bild: r184s Zeichnung der sechs Seiten (`updateShadow`, die Wurf-Ebene der Würfel-Kamera,
    // der Stand des Renderers gesichert) in der Welt-Szene. Ohne Schatten-Karte des Renderers (Holz kienspan) oder bevor ein
    // Stoff den Faktor gebaut hat (die Karte entsteht mit seinem Knoten), zeichnet nichts — dann trägt kein Platz den Faktor.
    _lichtWurfKarte(cam) {
        const W = this._lichtWurfK;
        const R = this.state.renderer;
        if (!W.roh.shadowMap || !R || !R.shadowMap || R.shadowMap.enabled !== true) return false;
        W.roh.updateShadow({ renderer: R, scene: this.state.scene, camera: cam });
        W.licht.shadow.needsUpdate = false;
        return true;
    }

    // DER WURF RUHT (keine Quelle wichtig, keine Karte): kein Platz trägt den Faktor, und die Matrix der Karte legt jedes Fragment
    // jenseits ihrer Reichweite — r184s Würfel-Filter tastet dann in keinem Fragment (mittags kostet das Feuer nichts, auch
    // in den Metern um die zuletzt werfende Quelle); die nächste Zeichnung setzt sie neu.
    _lichtWurfRuht(W) {
        W.id = null;
        W.platz.value = -1;
        W.licht.shadow.matrix.makeTranslation(1e7, 1e7, 1e7);
    }

    // ═══ DIE KASKADEN-BOX (W7) ═══
    // Das r184-Addon setzte jede Kaskade auf ein QUADRAT mit der Diagonale ihrer Frustum-Scheibe (echte GPU,
    // Mess-Wiese, 306 m Reichweite: k0 339 m, k1 961 m): der Blick deckte ein Viertel davon, und beide Kaskaden
    // zeichneten dieselbe Werfer-Menge (echte GPU 04.10., V18.528: k0 = k1 = 209 Befehle · 1,23 M Dreiecke). Hier misst
    // die Box die SCHEIBE im Licht-Raum: ihre acht Ecken (mit dem Fade-Saum des Shaders), geschnitten mit dem Höhenband
    // der Empfänger (die Hüllen unter der Scheibe — Bundles UND Boden-Satz; Himmel und Fels-Inneres empfangen nichts);
    // die Größe rastet in Schritten von Scheiben-Tiefe / rasterTeiler (eine Drehung schimmert nicht bei jedem Grad;
    // gemessen 04.10., echte GPU, stehende Render-Kamera, Box-Blick je 1° gedreht: Bild-Änderung 1,4–1,9 Luma-Stufen
    // mit und ohne Rast-Wechsel, das Addon-Quadrat ohne Wechsel ebenso — der Wechsel liegt im Rauschen der zeitlichen
    // Auflösung), das Zentrum auf das Texel-Raster der festen Licht-Basis (Gehen schimmert nicht). Die nahe Ebene steht
    // über dem höchsten Werfer der Box (die Szene-Kante entlang des Lichts), die ferne unter der tiefsten
    // Scheiben-Ecke. Eine Kaskade außerhalb ihres Takts behält ihre Karte, solange die Box die Scheibe deckt — sonst
    // rendert sie in diesem Frame neu. Ersetzt die Licht-Stellung des Addons (`CSMShadowNode.updateBefore`, je Instanz
    // stumm; die Vendor-Datei bleibt unberührt) und läuft im Haken des Haupt-Passes VOR den Karten (`_passSicht`);
    // Licht und Ziel der Kaskade tragen ihre Welt-Matrix sofort — `updateMatrices` liest sie im selben Frame.
    _kaskadenPassen(csm) {
        const licht = csm.light;
        const eltern = licht && licht.parent;
        const cam = csm.camera;
        if (!eltern || !cam || !csm.lights || csm.lights.length === 0 || !csm.mainFrustum) return;
        for (const lw of csm.lights)
            if (lw.parent === null) {
                eltern.add(lw.target);
                eltern.add(lw);
            }
        const S = this._kaskadenSchmier();
        S.basis.lookAt(licht.position, licht.target.position, S.oben);
        S.basisInv.copy(S.basis).invert();
        S.dir.subVectors(licht.target.position, licht.position).normalize();
        const huellen = this._kaskadenHuellen(S);
        if (!csm._anazhFit) csm._anazhFit = [];
        for (let i = 0; i < csm.lights.length; i++) {
            const sh = csm.lights[i].shadow;
            const n = this._kaskadenScheibe(csm, i, huellen, S);
            const alt = csm._anazhFit[i];
            let rendert = sh.needsUpdate === true || sh.autoUpdate === true;
            const deckt = !!alt && this._kaskadeDeckt(alt, S, n);
            if (!rendert && !deckt) {
                sh.needsUpdate = true; // die Scheibe lief aus der Box — diese Kaskade rendert jetzt
                rendert = true;
            }
            // auf ihrem Takt rendert die Kaskade mit derselben Box, solange sie hält (`_kaskadeHaelt`)
            if (rendert && !(deckt && this._kaskadeHaelt(csm, i, alt, S, huellen, n)))
                csm._anazhFit[i] = this._kaskadeFit(csm, i, huellen, S, n, alt);
        }
    }

    _kaskadenSchmier() {
        if (this._kaskadenS) return this._kaskadenS;
        const V = () => new THREE.Vector3();
        this._kaskadenS = {
            basis: new THREE.Matrix4(),
            basisInv: new THREE.Matrix4(),
            m: new THREE.Matrix4(),
            frustum: new THREE.Frustum(),
            oben: new THREE.Vector3(0, 1, 0),
            dir: V(),
            v: V(),
            ecken: Array.from({ length: 8 }, V),
            punkte: Array.from({ length: 32 }, V),
            huellen: [],
            werferY: -Infinity, // die Welt-Höhe des höchsten Werfers der zuletzt gemessenen Box (`_kaskadenWerferOben`)
            band0: 0, // das Höhenband der Empfänger der zuletzt gelegten Scheibe (`_kaskadenScheibe`)
            band1: 0,
            ab: [],
            saum: [0, 1],
            wahlHaupt: [], // die Gruppen, die der Haupt-Pass gewählt hat (sein Nachher-Haken gibt sie zurück)
            wahlSchatten: [], // dasselbe für den laufenden Kaskaden-Pass
        };
        return this._kaskadenS;
    }

    // Die Tiefen-Spanne der Kaskade i in normierter Linear-Tiefe, mit dem Fade-Saum des Addon-Shaders (`_setupFade`:
    // margin = 0,25·Kante² um jede innere Grenze, je zur Hälfte in die Nachbarn) — die Empfänger, die sie liest.
    _kaskadenSaum(breaks, i, fade, aus) {
        let a = i === 0 ? 0 : breaks[i - 1];
        let b = breaks[i];
        if (fade) {
            if (i > 0) a -= 0.125 * a * a;
            if (i < breaks.length - 1) b += 0.125 * b * b;
        }
        aus[0] = Math.max(0, a);
        aus[1] = b;
        return aus;
    }

    // Die WERFER-HÜLLEN der Welt: jedes Region-Bundle (null = wirft nicht) und jeder Bereich eines werfenden Satzes (der
    // Boden lebt außerhalb jedes Bundles — ohne ihn fiele der Boden unter dem Band aus der Box, und ein Hang zur Sonne
    // hin läge über der nahen Ebene; ebenso der werfende Bau-Satz, Welle 6). Auf dem WebGL2-Rückfall (keine Bundles)
    // tragen die Sätze das Band allein.
    _kaskadenHuellen(S) {
        const aus = S.huellen;
        aus.length = 0;
        const map = this.state._regionBundles;
        if (map)
            for (const bg of map.values()) {
                const h = this._bundleWerferHuelle(bg);
                if (h) aus.push(h);
            }
        // Jeder werfende Satz (der Boden, die werfenden Bau-Sätze) trägt seine Bereichs-Hüllen bei — nach seiner Grund-Sicht,
        // nie nach seiner Sicht im letzten Pass (ein Blick in den Himmel zeigt keinen Abschnitt).
        const saetze = this.state.chunkSaetze;
        if (saetze)
            for (const s of saetze.values()) {
                if (s.spec.schatten !== true || !this._chunkSatzGrund(s)) continue;
                for (const b of s.bloecke.values()) if (b.huelle && !b.huelle.isEmpty()) aus.push(b.huelle);
            }
        return aus;
    }

    // Die Empfänger-Punkte der Kaskade i in Welt-Koordinaten (S.punkte, Rückgabe = Anzahl): die acht Scheiben-Ecken,
    // geschnitten mit dem Höhenband der Werfer-Hüllen unter der Scheibe (Ecken im Band + Kanten-Schnitte mit seinen
    // Ebenen — die Ecken des geschnittenen konvexen Körpers). Ohne Hülle unter der Scheibe bleiben die Ecken.
    _kaskadenScheibe(csm, i, huellen, S) {
        const ab = this._kaskadenSaum(csm.breaks, i, csm.fade === true, S.saum);
        const mf = csm.mainFrustum.vertices;
        const mw = csm.camera.matrixWorld;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let j = 0; j < 4; j++) {
            S.ecken[j].lerpVectors(mf.near[j], mf.far[j], ab[0]).applyMatrix4(mw);
            S.ecken[j + 4].lerpVectors(mf.near[j], mf.far[j], ab[1]).applyMatrix4(mw);
        }
        for (const e of S.ecken) {
            if (e.x < x0) x0 = e.x;
            if (e.x > x1) x1 = e.x;
            if (e.z < z0) z0 = e.z;
            if (e.z > z1) z1 = e.z;
        }
        let y0 = Infinity,
            y1 = -Infinity;
        for (const h of huellen) {
            if (h.max.x < x0 || h.min.x > x1 || h.max.z < z0 || h.min.z > z1) continue;
            if (h.min.y < y0) y0 = h.min.y;
            if (h.max.y > y1) y1 = h.max.y;
        }
        let n = 0;
        S.band0 = S.band1 = 0;
        if (y1 >= y0) {
            const pm = this.state.playerMesh;
            if (pm) {
                y0 = Math.min(y0, pm.position.y - 2);
                y1 = Math.max(y1, pm.position.y + 4);
            }
            S.band0 = y0;
            S.band1 = y1;
            for (const e of S.ecken) if (e.y >= y0 && e.y <= y1) S.punkte[n++].copy(e);
            const KA = AnazhRealm.KASKADEN_KANTEN;
            for (let k = 0; k < KA.length; k += 2) {
                const A = S.ecken[KA[k]],
                    B = S.ecken[KA[k + 1]];
                for (let s = 0; s < 2; s++) {
                    const Y = s === 0 ? y0 : y1;
                    const da = A.y - Y,
                        db = B.y - Y;
                    if (da * db < 0) S.punkte[n++].lerpVectors(A, B, da / (da - db));
                }
            }
        }
        if (n === 0) for (const e of S.ecken) S.punkte[n++].copy(e);
        return n;
    }

    // HÄLT DIE BOX IHREN TAKT (Welle C)? Sie deckt die Scheibe samt Wahl-Scheibe (`_kaskadeDeckt`), das Licht steht (dieselbe
    // Basis bis auf die Rundung) und kein Werfer der Box steigt über ihre nahe Ebene (`_kaskadenWerferOben` ≤ zt) — dann
    // rendert die Kaskade auf ihrem Takt mit DERSELBEN Kamera: die Karte fängt die bewegten Werfer, die Lage des Passes steht
    // (`_passLageGen`) und keine Wahl rechnet neu. Bis hier legte jeder Takt-Render die Box neu an die Scheibe — beim Drehen
    // trug jeder Render eine neue Lage (OMEN-Urteil 06.10.: Drehen 360 × 1° teurer als vorher). Die Box bleibt so groß wie
    // gerastet; dreht die Scheibe aus ihr heraus oder hebt sich ein Werfer, legt sie sich neu (`_kaskadeFit`). Und sie hat die
    // Größe, die der Fit der jetzigen Scheibe legte (`_kaskadeMass` samt Hysterese — Gegenprüfung 07.10.: nach dem Hineinzoomen
    // hielt die größere Box ihre gröberen Texel bis zur nächsten Stufe der Sonne).
    _kaskadeHaelt(csm, i, alt, S, huellen, n) {
        const a = alt.basisInv.elements,
            b = S.basisInv.elements;
        for (let j = 0; j < 16; j++) if (!(Math.abs(a[j] - b[j]) <= 1e-9)) return false;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity;
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(S.basisInv);
            if (p.x < x0) x0 = p.x;
            if (p.x > x1) x1 = p.x;
            if (p.y < y0) y0 = p.y;
            if (p.y > y1) y1 = p.y;
        }
        const sh = csm.lights[i].shadow;
        const schritt = this._kaskadeSchritt(csm, i, S);
        if (
            this._kaskadeMass(x1 - x0, sh.mapSize.width, alt.W, schritt) !== alt.W ||
            this._kaskadeMass(y1 - y0, sh.mapSize.height, alt.H, schritt) !== alt.H
        )
            return false;
        return this._kaskadenWerferOben(huellen, S, alt.x0, alt.x1, alt.y0, alt.y1) <= alt.zt;
    }

    // DER RAST der Box der Kaskade i: Scheiben-Tiefe (mit dem Fade-Saum) / rasterTeiler.
    _kaskadeSchritt(csm, i, S) {
        const cam = csm.camera;
        const far = Math.min(cam.far, csm.maxFar);
        const ab = this._kaskadenSaum(csm.breaks, i, csm.fade === true, S.saum);
        return Math.max(1, ((ab[1] - ab[0]) * (far - cam.near)) / AnazhRealm.SCHATTEN_KASKADE.rasterTeiler);
    }

    // DIE GRÖSSE der Box über eine Ausdehnung `w` (Karte `n` Texel): sie rastet und trägt mindestens einen Texel Luft je Seite
    // (der Raster-Versatz des Zentrums); eine alte Größe `altM` hält, solange sie die Scheibe so deckt und höchstens einen
    // Schritt zu groß ist (Hysterese gegen das Pendeln an einer Raster-Kante).
    _kaskadeMass(w, n, altM, schritt) {
        let m = schritt * Math.ceil(w / schritt);
        if (m - w < (2 * m) / n) m += schritt;
        if (altM && altM - w >= (2 * altM) / n && altM <= m + schritt) return altM;
        return m;
    }

    // Deckt die gerenderte Box (in IHRER Licht-Basis) die Empfänger-Punkte noch — und liegen sie in der Wahl-Scheibe, gegen
    // die der Pass seine Werfer gewählt hat (die Scheibe beim Rendern, um `saum` geweitet)?
    _kaskadeDeckt(fit, S, n) {
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(fit.basisInv);
            if (p.x < fit.x0 || p.x > fit.x1 || p.y < fit.y0 || p.y > fit.y1 || p.z < fit.zb || p.z > fit.zt)
                return false;
            if (fit.ebenen)
                for (let j = 0; j < fit.ebenen.length; j++)
                    if (fit.ebenen[j].distanceToPoint(S.punkte[k]) < -fit.saum) return false;
        }
        return true;
    }

    // Die sechs Ebenen einer Frustum-Scheibe (Ecken 0–3 nah, 4–7 fern, zyklisch — CSMFrustum), die Normalen nach innen.
    _scheibenEbenen(E, aus, mitte) {
        mitte.set(0, 0, 0);
        for (let j = 0; j < 8; j++) mitte.add(E[j]);
        mitte.multiplyScalar(1 / 8);
        aus[0].setFromCoplanarPoints(E[0], E[1], E[2]);
        aus[1].setFromCoplanarPoints(E[4], E[5], E[6]);
        for (let j = 0; j < 4; j++) aus[2 + j].setFromCoplanarPoints(E[j], E[(j + 1) % 4], E[((j + 1) % 4) + 4]);
        for (let j = 0; j < 6; j++) if (aus[j].distanceToPoint(mitte) < 0) aus[j].negate();
        return aus;
    }

    // Die Box der Kaskade i aus den Empfänger-Punkten: Licht-Raum-AABB → gerastete Größe → Zentrum auf dem Texel-Raster
    // → nahe Ebene über dem höchsten Werfer der Box (Hüllen · Tiere · Spieler · Inseln) → Licht, Ziel, Kamera, Bias.
    _kaskadeFit(csm, i, huellen, S, n, alt) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const lw = csm.lights[i];
        const sh = lw.shadow;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(S.basisInv);
            if (p.x < x0) x0 = p.x;
            if (p.x > x1) x1 = p.x;
            if (p.y < y0) y0 = p.y;
            if (p.y > y1) y1 = p.y;
            if (p.z < z0) z0 = p.z;
            if (p.z > z1) z1 = p.z;
        }
        // Die Größe rastet (`_kaskadeMass`, Schritt `_kaskadeSchritt`)
        const schritt = this._kaskadeSchritt(csm, i, S);
        const W = this._kaskadeMass(x1 - x0, sh.mapSize.width, alt && alt.W, schritt);
        const H = this._kaskadeMass(y1 - y0, sh.mapSize.height, alt && alt.H, schritt);
        const tx = W / sh.mapSize.width,
            ty = H / sh.mapSize.height;
        const cx = Math.round((x0 + x1) / 2 / tx) * tx;
        const cy = Math.round((y0 + y1) / 2 / ty) * ty;
        const bx0 = cx - W / 2,
            bx1 = cx + W / 2,
            by0 = cy - H / 2,
            by1 = cy + H / 2;
        // die nahe Ebene über jedem Werfer der Box samt Licht-Rand (ein Werfer, den die Wahl über die Stufen der Sonne hält)
        const lr = AnazhRealm.PASS_WAHL.lichtRandTexel * Math.min(tx, ty);
        let zt = Math.max(z1, this._kaskadenWerferOben(huellen, S, bx0 - lr, bx1 + lr, by0 - lr, by1 + lr));
        zt += K.luftM;
        const zb = z0 - K.luftM;
        S.v.set(cx, cy, zt).applyMatrix4(S.basis);
        lw.position.copy(S.v);
        lw.target.position.copy(S.v).add(S.dir);
        lw.updateMatrixWorld();
        lw.target.updateMatrixWorld();
        const c = sh.camera;
        c.left = -W / 2;
        c.right = W / 2;
        c.bottom = -H / 2;
        c.top = H / 2;
        c.near = 0;
        c.far = zt - zb;
        c.updateProjectionMatrix();
        if (sh.anazhBoxM) sh.anazhBoxM.set(W, H);
        sh.anazhTiefeM = zt - zb;
        this._schattenBias(lw, Math.max(tx, ty), zt - zb);
        const f = alt || { basisInv: new THREE.Matrix4() };
        f.basisInv.copy(S.basisInv);
        f.x0 = bx0;
        f.x1 = bx1;
        f.y0 = by0;
        f.y1 = by1;
        f.zb = zb;
        f.zt = zt;
        f.W = W;
        f.H = H;
        f.texel = tx;
        f.texelMin = Math.min(tx, ty); // der feinere Texel der Karte (die Stufe der Sonne, der Licht-Rand)
        // DER LÄNGSTE LICHT-WEG der Box (die Stufe der Sonne, `_sonnenStufe`): ein Schatten fällt vom Werfer (höchstens
        // `S.werferY`, eben von `_kaskadenWerferOben` über dieser Box gemessen) zum Empfänger (wenigstens der tiefste Punkt der
        // Scheibe) — sein Weg entlang des Lichts ist der Fall geteilt durch die Höhe des Lichts, nie länger als die Box tief.
        let yTief = Infinity;
        for (let k = 0; k < n; k++) if (S.punkte[k].y < yTief) yTief = S.punkte[k].y;
        const hoch = -S.dir.y;
        const fall = Math.max(0, S.werferY - yTief);
        f.weg = hoch > 0 ? Math.min(zt - zb, fall / hoch) : zt - zb;
        f.band0 = S.band0;
        f.band1 = S.band1;
        f.bild = (f.bild || 0) + 1;
        // DIE WAHL-SCHEIBE (`_passTrifft`): die Scheibe dieses Renders (S.ecken, eben von `_kaskadenScheibe` gelegt) — gegen
        // sie wählt der Kaskaden-Pass jeden Werfer (Zelle, Bündel-Werfer, Instanz) nach der Licht-Kapsel, `_kaskadeDeckt` hält sie.
        if (!f.ebenen) f.ebenen = Array.from({ length: 6 }, () => new THREE.Plane());
        this._scheibenEbenen(S.ecken, f.ebenen, S.v);
        const saum = AnazhRealm.PASS_WAHL.saumM;
        f.saum = saum[Math.min(i, saum.length - 1)];
        return f;
    }

    // Der höchste Werfer über der Licht-Raum-Box [bx0,bx1]×[by0,by1] (Licht-z, zum Licht hin wachsend): die
    // Werfer-Hüllen (Bundles und Boden-Satz, ihre acht Ecken) und die freien Werfer außerhalb davon — Tiere, Spieler,
    // Inseln, Bauplan-Bauten als eigene Gruppe.
    _kaskadenWerferOben(huellen, S, bx0, bx1, by0, by1) {
        let zt = -Infinity;
        let yTop = -Infinity; // die Welt-Höhe des höchsten Werfers über der Box (`S.werferY`, der Licht-Weg der Stufe)
        const v = S.v;
        for (const h of huellen) {
            let lx0 = Infinity,
                lx1 = -Infinity,
                ly0 = Infinity,
                ly1 = -Infinity,
                lz1 = -Infinity;
            for (let e = 0; e < 8; e++) {
                v.set(e & 1 ? h.max.x : h.min.x, e & 2 ? h.max.y : h.min.y, e & 4 ? h.max.z : h.min.z);
                v.applyMatrix4(S.basisInv);
                if (v.x < lx0) lx0 = v.x;
                if (v.x > lx1) lx1 = v.x;
                if (v.y < ly0) ly0 = v.y;
                if (v.y > ly1) ly1 = v.y;
                if (v.z > lz1) lz1 = v.z;
            }
            if (lx1 < bx0 || lx0 > bx1 || ly1 < by0 || ly0 > by1) continue;
            if (lz1 > zt) zt = lz1;
            if (h.max.y > yTop) yTop = h.max.y;
        }
        const st = this.state;
        const frei = (x, y, z, r) => {
            v.set(x, y, z).applyMatrix4(S.basisInv);
            if (v.x + r < bx0 || v.x - r > bx1 || v.y + r < by0 || v.y - r > by1) return;
            if (v.z + r > zt) zt = v.z + r;
            if (y + r > yTop) yTop = y + r;
        };
        // jeder Leib im Bild wirft: die Wesen und die Gefallenen (ein Leichnam liegt mit Schatten, bis er versunken ist)
        for (const liste of [st.creatures || [], st.leichname || []])
            for (const cr of liste)
                if (cr && cr.visible !== false) frei(cr.position.x, cr.position.y, cr.position.z, 6);
        if (st.playerMesh) frei(st.playerMesh.position.x, st.playerMesh.position.y, st.playerMesh.position.z, 4);
        for (const is of st.floatingIslands || []) {
            const g = is && is.geometry;
            if (!g) continue;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const bs = g.boundingSphere;
            frei(is.position.x + bs.center.x, is.position.y + bs.center.y, is.position.z + bs.center.z, bs.radius);
        }
        // Bauplan-Bauten, die als eigene Gruppe in der Szene stehen (kein Bundle, kein Instanz-Satz): ihre Welt-Kugel,
        // einmal je Lage gerechnet (gate:schatten-werfer W6 nennt jede Werfer-Klasse, die hier fehlt).
        for (const e of st.architectures || []) {
            const m = e && e.mesh;
            if (!m || m.parent !== st.scene || m.visible === false) continue;
            const k = this._werferKugel(m);
            if (k) frei(k.center.x, k.center.y, k.center.z, k.radius);
        }
        S.werferY = yTop;
        return zt;
    }

    // Die Welt-Kugel eines freien Werfers (Gruppe), gecacht je Lage und Kinderzahl; null = leer.
    _werferKugel(m) {
        const ud = m.userData;
        const mw = m.matrixWorld.elements;
        if (
            ud._wfKugel !== undefined &&
            ud._wfKx === mw[12] &&
            ud._wfKy === mw[13] &&
            ud._wfKz === mw[14] &&
            ud._wfKn === m.children.length
        )
            return ud._wfKugel;
        const box = new THREE.Box3().setFromObject(m);
        ud._wfKugel = box.isEmpty() ? null : box.getBoundingSphere(new THREE.Sphere());
        ud._wfKx = mw[12];
        ud._wfKy = mw[13];
        ud._wfKz = mw[14];
        ud._wfKn = m.children.length;
        return ud._wfKugel;
    }

    // DIE KASKADEN-GEBURT (ersetzt `CSMShadowNode._init` je Instanz, die Vendor-Datei bleibt unberührt): das Addon legt
    // beim ersten Material-Bau die Kaskaden-Lichter und ihre Schatten-Knoten an; DANACH, noch vor dem Bau der Karten-
    // Ziele, setzt der Host Größe und Format. Nichts wird später umgebaut: eine Karte, die nach dem ersten Frame
    // wechselt, risse jedes aufgezeichnete Render-Bundle (seine Bind-Gruppe hält die alte Textur — gemessen 04.10.:
    // „Destroyed texture used in a submit").
    _kaskadenGeburt(csm, builder) {
        THREE.CSMShadowNode.prototype._init.call(csm, builder);
        csm.lights.forEach((lw, i) => {
            const sh = lw.shadow;
            sh.anazhBoxM = new THREE.Vector2(1, 1);
            sh.anazhTiefeM = 1;
            sh.filterNode = this._schattenFilter(i);
        });
        this._kaskadenKarten(csm);
        this._kaskadenZiele(csm);
    }

    // DAS SCHATTEN-GESETZ DER SONNEN-SCHEIBE (schatten.K1, die Kontakt-Härtung) — der EINE Filter jeder Kaskade
    // (`shadow.filterNode`: r184 `ShadowNode.setupShadow` nimmt ihn vor dem Filter des Karten-Typs, gate:vendor-anker). Der
    // Halbschatten ist so breit, wie die Sonne (`sonneTan`, 0,53°) ihn über den Abstand Werfer → Empfänger zieht, auf dem Boden
    // von `filterTexel` Texeln der Karte: die Werfer sucht er IM KEGEL DER SONNE über dem Empfänger (5 Vogel-Punkte, Karten-Tiefen
    // ohne Vergleich) — ein Werfer verdunkelt ihn nur, wo er in seinem halben Halbschatten liegt, und der fernste liegt `luftM` unter
    // der nahen Ebene der Kaskade (`_kaskadeFit`): der Radius ist (Tiefe des Empfängers unter ihr − `luftM`) · sonneTan/2, höchstens
    // `sucheM`. Ihr Mittel längs des Lichts in Metern (`anazhTiefeM`, orthographisch linear); dann der Vergleich wie r184-PCF
    // (5 Vogel-Punkte, gedreht je Bildpunkt) im Radius Halbschatten/2 + Boden — die Sonne weicht ab dem ersten Zentimeter
    // Abstand (schatten.K1#2: unter max(Halbschatten/2, Boden) trug der Boden jede Kante bis 4,9 m gleich breit). Bis w4-licht-uhr
    // suchte er im festen Umkreis `sucheM` (0,25 m): am Mittag ragte er über die Spitze eines kurzen Schattens hinaus, die Treffer
    // lagen tiefer am Werfer, der Abstand fiel bis 0,8 m zu kurz — der Zuwachs 0,484 statt 0,9 cm je m (GTX, takt24c). Ohne Suche
    // (k0 ab 15 m, k1: `sucheM` 0; WebGL2: GLSL lädt keine Tiefe aus sampler2DShadow, gate:webgl-probe W5) bleibt der Boden-Radius,
    // der r184-PCF. Box + Tiefe: `_kaskadeFit`.
    _schattenFilter(i) {
        const T = THREE.TSL;
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const je = (l) => l[Math.min(i, l.length - 1)];
        const sucheM = je(K.sucheM);
        return T.Fn(({ depthTexture, shadowCoord, shadow }, builder) => {
            const ref = (n, t) => T.reference(n, t, shadow).setGroup(T.renderGroup);
            const [box, karte] = [ref("anazhBoxM", "vec2"), ref("mapSize", "vec2")];
            const phi = T.interleavedGradientNoise(T.screenCoordinate.xy).mul(6.28318530718);
            const z = shadowCoord.z;
            const vogel = (k, r) => shadowCoord.xy.add(T.vogelDiskSample(k, 5, phi).mul(r));
            let r = T.vec2(je(K.filterTexel)).div(karte);
            if (sucheM > 0 && builder.renderer.backend.isWebGPUBackend === true) {
                const umgekehrt = builder.renderer.reversedDepthBuffer === true;
                const tiefe = ref("anazhTiefeM", "float");
                const kegel = (umgekehrt ? z.oneMinus() : z)
                    .mul(tiefe)
                    .sub(K.luftM)
                    .max(0)
                    .mul(K.sonneTan * 0.5)
                    .min(sucheM);
                const summe = T.float(0).toVar();
                const zahl = T.float(0).toVar();
                for (let k = 0; k < 5; k++) {
                    const d = T.textureLoad(
                        depthTexture,
                        vogel(k, T.vec2(kegel).div(box)).clamp(0, 1).mul(karte).min(karte.sub(1))
                    );
                    const wirft = umgekehrt ? d.greaterThan(z) : d.lessThan(z);
                    summe.addAssign(T.select(wirft, d, 0));
                    zahl.addAssign(T.select(wirft, 1, 0));
                }
                const abstand = z
                    .sub(summe.div(zahl.max(1)))
                    .abs()
                    .mul(tiefe);
                const halb = T.select(zahl.greaterThan(0), abstand.mul(K.sonneTan * 0.5).min(sucheM), 0);
                r = T.vec2(halb).div(box).add(r);
            }
            let s = T.texture(depthTexture, vogel(0, r)).compare(z);
            for (let k = 1; k < 5; k++) s = s.add(T.texture(depthTexture, vogel(k, r)).compare(z));
            return s.mul(0.2);
        });
    }

    // DIE KARTEN-GRÖSSE aus der Texel-Dichte (einmal, am Standard-Bereich PERF_SHADOW_RANGE_MAX,
    // Bezugs-Seitenverhältnis `bezugAspekt`): die Scheibe des Referenz-Blicks (Kamera waagrecht, Licht im Zenit —
    // Breite = Frustum-Breite am fernen Rand, Tiefe = Scheiben-Tiefe, beide mit Fade-Saum) liegt in der FESTEN
    // Licht-Basis je nach Blickrichtung gedreht; ihre Box ist höchstens so lang wie ihre Diagonale (Drehung um 45°
    // gegen die Basis). Die Karte trägt diese längste Kante bei `texelM` — quadratisch, eine Zweierpotenz (gedeckelt
    // auf karteMax). Eine Flächen-Regel (√(Breite·Tiefe)) gab k1 1024 und damit auf der langen Achse 0,84 m je Texel
    // statt 0,47 (gemessen 04.10., Prüfer W7): ferne Schatten in Blickbreite wurden 1,8-fach gröber als beim Addon.
    // 306 m Reichweite, 75° · 16:9: k0 308 × 113 m (Diagonale 328 m) → 2048, k1 835 × 203 m (859 m) → 2048. Eine
    // Eigenschaft des Inhalts, nie des Fensters.
    _kaskadenKarten(csm) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const cam = csm.camera;
        const far = AnazhRealm.PERF_SHADOW_RANGE_MAX * AnazhRealm.SCHATTEN_FERN_FAKTOR;
        const br = [];
        csm.customSplitsCallback(csm.cascades, cam.near, far, br);
        const halb = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * K.bezugAspekt;
        const saum = [0, 1];
        const groessen = [];
        for (let i = 0; i < csm.lights.length; i++) {
            this._kaskadenSaum(br, i, csm.fade === true, saum);
            const dA = cam.near + saum[0] * (far - cam.near);
            const dB = cam.near + saum[1] * (far - cam.near);
            const texel = K.texelM[Math.min(i, K.texelM.length - 1)];
            const bedarf = Math.hypot(2 * halb * dB, dB - dA) / texel;
            const n = Math.min(K.karteMax, 2 ** Math.ceil(Math.log2(Math.max(1, bedarf))));
            csm.lights[i].shadow.mapSize.set(n, n);
            groessen.push(n);
        }
        csm._anazhKarten = groessen;
        return groessen;
    }

    // DIE SCHLANKEN KARTEN-ZIELE: r184 legt jede Schatten-Karte als Render-Ziel mit rgba8-Farbe + depth24plus an
    // (ShadowNode.setupRenderTarget). Die Farbe liest der Schatten-Filter nur mit `renderer.shadowMap.transmitted` (aus) —
    // der Ziel-Zensus (`werkbank ziele`, 07.10., GTX 1060, Mess-Wiese, 12 Frames) nannte sie OHNE LESER: kaskade0:farbe
    // und kaskade1:farbe, je r8 2048² = 4 MB, geschrieben in k0/k1, gelesen von keinem Pass. Darum trägt die Karte auf
    // WebGPU KEINE Farbe: das Ziel behält sein Textur-Objekt (r184 liest Größe, Farbraum und Ton-Abbildung des Ziels daraus
    // — `Textures.updateRenderTarget` misst `textures[0]`, `currentColorSpace` liest `texture`), aber die GPU legt es nie an
    // (`updateTexture` überspringt es), und die Ziel-Daten tragen eine LEERE Farb-Liste: der Pass-Deskriptor baut keinen
    // Farb-Anhang, der Pipeline-Bau keine Farb-Ziele (eine reine Tiefen-Pipeline — ein Fragment-Ergebnis ohne Ziel verwirft
    // WebGPU), und Format und Farbraum des Kontexts sind auf der leeren Liste null (r184 las dort blind `textures[0]`, das
    // war der Grund für r8). Eine geteilte Farbe beider Kaskaden trug r184 nicht (W7: „Destroyed texture used in a submit")
    // — jetzt gibt es keine. Der WebGL2-Rückfall bindet `textures[0]` selbst an seinen Framebuffer: dort bleibt r8. Die Tiefe
    // trägt 16 bit (die enge Box spannt ≤ 650 m Licht-Tiefe: ≤ 1 cm je Stufe). Der Knoten baut sein Ziel durch diese Hülle —
    // Format, Name und die Farb-Freiheit stehen, bevor die GPU es je belegt. gate:vendor-anker pinnt jede gelesene r184-
    // Stelle, gate:ziel-zensus hält die Klasse, gate:schatten-werfer Z1 das Ziel.
    _kaskadenZiele(csm) {
        const rend = this.state.renderer;
        if (
            rend &&
            !rend._isHeadlessNull &&
            rend.backend &&
            rend.backend.isWebGPUBackend === true &&
            !rend.__anazhOhneFarbe
        ) {
            const T = rend._textures;
            const U = rend.backend.utils;
            if (
                !T ||
                typeof T.updateRenderTarget !== "function" ||
                typeof T.updateTexture !== "function" ||
                !U ||
                typeof U.getCurrentColorFormat !== "function" ||
                typeof U.getCurrentColorSpace !== "function"
            )
                this.log(
                    "KASKADEN-ZIELE: r184 Textures/Backend-Utils fehlen (Vendor-Drift) — die Karten tragen Farbe",
                    "ERROR"
                );
            else {
                const KEINE = Object.freeze([]);
                const zielRoh = T.updateRenderTarget;
                T.updateRenderTarget = function (ziel, stufe) {
                    const o = zielRoh.call(this, ziel, stufe);
                    if (ziel.__anazhOhneFarbe === true) this.get(ziel).textures = KEINE;
                    return o;
                };
                const texRoh = T.updateTexture;
                T.updateTexture = function (t, o) {
                    if (t.__anazhOhneGpu === true) return undefined;
                    return texRoh.call(this, t, o);
                };
                const formatRoh = U.getCurrentColorFormat;
                U.getCurrentColorFormat = function (ctx) {
                    return ctx.textures !== null && ctx.textures.length === 0 ? null : formatRoh.call(this, ctx);
                };
                const raumRoh = U.getCurrentColorSpace;
                U.getCurrentColorSpace = function (ctx) {
                    return ctx.textures !== null && ctx.textures.length === 0 ? null : raumRoh.call(this, ctx);
                };
                rend.__anazhOhneFarbe = true;
            }
        }
        const ohneFarbe = !!(rend && rend.__anazhOhneFarbe === true);
        const knoten = csm._shadowNodes || [];
        for (let i = 0; i < knoten.length; i++) {
            const sn = knoten[i];
            if (!sn || typeof sn.setupRenderTarget !== "function") {
                // laut statt still: ohne die r184-Stelle bliebe die Karte rgba8 + depth24plus (gate:vendor-anker pinnt
                // sie)
                this.log(`KASKADEN-ZIELE: Kaskade ${i} ohne ShadowNode.setupRenderTarget (Vendor-Drift)`, "ERROR");
                continue;
            }
            const roh = sn.setupRenderTarget;
            sn.setupRenderTarget = (shadow, builder) => {
                const z = roh.call(sn, shadow, builder);
                z.shadowMap.texture.format = THREE.RedFormat;
                z.shadowMap.texture.name = "kaskade" + i + ":farbe";
                if (ohneFarbe) {
                    z.shadowMap.__anazhOhneFarbe = true;
                    z.shadowMap.texture.__anazhOhneGpu = true;
                }
                z.depthTexture.type = THREE.UnsignedShortType;
                z.depthTexture.name = "kaskade" + i + ":tiefe";
                return z;
            };
        }
    }

    // DIE WURF-EBENE (K72): der Wurf eines Knotens IST ein Bit seiner Ebenen — `castShadow` liest und schreibt das Bit
    // SHADOW_TWIN_LAYER (ein Accessor am Prototyp von THREE.Object3D; r184 weist `castShadow` im Konstruktor NACH den Ebenen
    // zu, `copy` beide, gate:vendor-anker), und die Schatten-Kamera sieht NUR diese Ebene (Licht-Setup). r184 testet die
    // Ebene in `_projectObject` VOR Frustum, Liste und Sortierung: ein Nicht-Werfer kostet den Kaskaden-Render einen Ebenen-
    // Test statt Projektion, Fassade, Listen-Platz, Sortier-Schritt und den Ruf der Schatten-Funktion, die ihn erst dort
    // verwarf. Befund 15.10. (Radeon, Zerlegung je Kaskaden-Render, Third): Genesis k0 72 Nicht-Werfer neben 42 Werfern in
    // der Liste, k1 47 neben 8; Wiese 39–48. Der Zwilling ist ein Werfer ohne Ebene 0 (nur die Kaskaden sehen ihn); wer die
    // Ebenen des Auges schaltet, lässt das Wurf-Bit stehen. Ein eigenes Wurf-Feld neben der Ebene gibt es nicht: der
    // Accessor steht, bevor die Welt ihren ersten Knoten baut (Konstruktor), gate:schatten-werfer W10 nennt jeden Knoten der
    // Szene, der ein eigenes Feld trägt oder für die Kaskade gesehen ≠ wirft ist.
    // JEDES LICHT liegt auf der Wurf-Ebene, sein `castShadow` ist sein eigenes Wort (`_wurfLicht`): r184 hält EINEN Lichter-
    // Knoten je Szene (`Lighting.getNode(scene)`, gate:vendor-anker), und der Schatten-Pass läuft MITTEN im Hauptbild — sähe
    // die Kaskade ein anderes Licht-Set als das Auge, setzte ihr Pass den geteilten Knoten um, und alles danach Gezeichnete
    // verlöre die übrigen Lichter (gate:ego-schatten 15.10.: die Bühne ohne ihr Umgebungslicht, Boden 145 → 98).
    static _wurfEbene() {
        const P = THREE.Object3D.prototype;
        const d = Object.getOwnPropertyDescriptor(P, "castShadow");
        if (d && typeof d.get === "function") return;
        const W = 1 << AnazhRealm.SHADOW_TWIN_LAYER;
        Object.defineProperty(P, "castShadow", {
            configurable: true,
            enumerable: true,
            get() {
                return (this.layers.mask & W) !== 0;
            },
            set(v) {
                const l = this.layers;
                l.mask = (v ? l.mask | W : l.mask & ~W) >>> 0;
            },
        });
        Object.defineProperty(THREE.Light.prototype, "castShadow", {
            configurable: true,
            enumerable: true,
            get() {
                return this._wurfLicht === true;
            },
            set(v) {
                this._wurfLicht = !!v;
                this.layers.mask = (this.layers.mask | W) >>> 0;
            },
        });
    }

    // Kaskaden-Index einer Schatten-Kamera (die EINE Map ohne CSM = 0), sonst −1.
    _schattenKameraIndex(kamera) {
        const csm = this.state.csmNode;
        if (csm && csm.lights)
            for (let i = 0; i < csm.lights.length; i++)
                if (csm.lights[i].shadow && csm.lights[i].shadow.camera === kamera) return i;
        const dl = this.state.directionalLight;
        if (dl && dl.shadow && dl.shadow.camera === kamera) return 0;
        // die Würfel-Kamera des Wurfs (`_lichtWurf`) ist der Schatten-Pass hinter den Kaskaden
        const W = this._lichtWurfK;
        if (W && W.licht.shadow.camera === kamera)
            return csm && csm.lights && csm.lights.length ? csm.lights.length : 1;
        return -1;
    }

    // DER SCHATTEN-TAKT je Kaskade (04.10., echte GPU): r184 liest `renderer.shadowMap.needsUpdate` NICHT — der
    // EINE Leser ist `ShadowNode.updateBefore` mit `shadow.needsUpdate || shadow.autoUpdate` je Licht, und
    // `LightShadow.autoUpdate` (true) reist in jede CSM-Kaskade. Der alte Cache (V18.264) schrieb ins Leere: beide
    // Kaskaden renderten JEDEN Frame (Profil: updateShadow ~9,5 ms CPU je Frame). Hier fährt der Takt die echten
    // Leser: die NAHE Kaskade rendert jeden `nahMax`-ten Frame (laufende Tiere werfen nah), die FERNE im
    // `fernFaktor`-fachen Takt des Regler-Intervalls (höchstens so dicht wie die nahe); ein Sonnen-Sprung erzwingt
    // alle. JE FRAME HÖCHSTENS EINE KASKADE (1410-3): unter Regler voll renderte die nahe JEDEN Frame und jeder dritte
    // trug beide — der CPU-Takt eines Frames mit zwei Schatten-Renders hob den p95 (ABAB OMEN GTX, Regler voll, CPU-Takt p95:
    // Wiese Ego 6,0 → 5,8 · Third 6,7 → 6,4 · Genesis Ego 6,8 → 6,3 · Third 8,4 → 7,5 ms; GPU und Frame gleich). Eine
    // fällige Kaskade wartet hinter der Vor-Kaskade dieses Frames auf den
    // nächsten; die nahe Phase und die ferne wechseln. Ohne CSM trägt das Haupt-Licht die EINE Map im Nah-Takt.
    // Eine übersprungene Kaskade bleibt konsistent: `shadow.updateMatrices` läuft nur in `renderShadow`
    // (Vendor-Anker), die Matrix gehört zur Map.
    _loopShadowUpdate() {
        const r = this.state.renderer;
        if (!r || !r.shadowMap) return;
        const dl = this.state.directionalLight;
        const frame = (this._shadowFrame = (this._shadowFrame || 0) + 1);
        if (!this._shadowLast) this._shadowLast = { sx: 0, sy: 0, sz: 0, k: [] };
        const L = this._shadowLast;
        const sx = dl ? dl.position.x : 0,
            sy = dl ? dl.position.y : 0,
            sz = dl ? dl.position.z : 0;
        // `sunMoved` fängt nur den DISKRETEN Sprung (manueller Tageszeit-Wechsel, Δ² ≥ 10³): die Sonnen-Position
        // (focus + sunDir·200) trägt auch die Tag-Nacht-Drift (Δ² ~1e-3/Frame), die der Takt ohnehin mitnimmt.
        const sunMoved = (sx - L.sx) ** 2 + (sy - L.sy) ** 2 + (sz - L.sz) ** 2 > 4.0;
        if (sunMoved) {
            L.sx = sx;
            L.sy = sy;
            L.sz = sz;
        }
        const T = AnazhRealm.SCHATTEN_TAKT;
        const minInterval = Math.max(1, Math.round(this.state._shadowMinInterval || 1));
        const csm = this.state.csmNode;
        const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
        // DIE KOSTEN AN DER ÄNDERUNG (Gebot 7): bewegt sich die Kamera (Gang, Drehung, die Kamera folgt dem Spieler), folgt
        // die nahe Kaskade jedem Frame im Regler-Takt und beide dürfen in einen Frame — der Schatten des gehenden Spielers
        // stünde sonst jeden zweiten Frame einen Frame zurück. In Ruhe gilt je Frame höchstens eine Kaskade. Gemessen in
        // EINER Sitzung (Genesis Third): stehend CPU-Takt p50/p95 5,7/7,4 → 5,25/6,95 ms (die Kamera in 0 von 2 700 Frames
        // bewegt), gehend und drehend gleich — dort gilt das Gesetz vor 1410-3 (p95 21,7 gegen 22,6/23,1 ms).
        const cam = this.state.camera;
        const me = cam && cam.matrixWorld ? cam.matrixWorld.elements : null;
        let bewegt = false;
        if (me) {
            const alt = L.kamera || (L.kamera = new Float64Array(16).fill(NaN));
            for (let j = 0; j < 16; j++)
                if (!(Math.abs(me[j] - alt[j]) <= AnazhRealm.SCHATTEN_RUHE_EPS)) {
                    bewegt = true;
                    break;
                }
            alt.set(me);
        }
        let gerendert = false;
        for (let i = 0; i < lichter.length; i++) {
            const sh = lichter[i].shadow;
            if (!sh) continue;
            sh.autoUpdate = false;
            const takt = bewegt
                ? i === 0
                    ? Math.min(T.nahMax, minInterval)
                    : minInterval * T.fernFaktor
                : i === 0
                  ? T.nahMax
                  : Math.max(T.nahMax, minInterval) * T.fernFaktor;
            const faellig = !(frame - (L.k[i] != null ? L.k[i] : -1e9) < takt);
            if (sunMoved || (faellig && (bewegt || !gerendert))) {
                sh.needsUpdate = true;
                L.k[i] = frame;
                gerendert = true;
            }
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_schatten]);

// ===== ATLAS · Bild/schatten — Außen-Konstanten =====
// Die Wurf-Ebene (0 = Welt, 1 = Laub-Pass, 2 = Wurf): K72 — `castShadow` IST das Bit dieser Ebene (`_wurfEbene`), jedes
// Licht liegt auf ihr, die Schatten-Kamera sieht NUR sie (`layers.set(2)` vor der CSM-Konstruktion, die Kaskaden erben
// es). Der Zwilling (der opake Kronen-Caster, die Grobstufe nah, der Wurf-Satz, der Leib im 1st) verlässt Ebene 0 und
// wirft auf ihr — die Haupt-Kamera sieht ihn nie.
AnazhRealm.SHADOW_TWIN_LAYER = 2;
AnazhRealm.PERF_SHADOW_RANGE_MAX = 170; // = der Default-Ceiling (Fallback, wenn atmosphere.shadowRange fehlt)
// Die CSM-Tiefe (maxFar) je Meter Schatten-Reichweite: EINE Zahl für Boot und Regler (100–170 → 180–306 m).
AnazhRealm.SCHATTEN_FERN_FAKTOR = 1.8;
// DER SCHATTEN-TAKT je Kaskade (_loopShadowUpdate): die nahe Kaskade (seit schatten.K1 die Kontakt-Kaskade, 15 m) rendert im
// Regler-Intervall, höchstens jeden `nahMax`-ten Frame (laufende Tiere werfen nah); jede weitere im `fernFaktor`-fachen Takt.
AnazhRealm.SCHATTEN_TAKT = Object.freeze({ nahMax: 2, fernFaktor: 3 });
// Die Ruhe der Kamera für den Schatten-Takt (_loopShadowUpdate): jedes Element der Welt-Matrix höchstens so weit vom
// vorigen Frame (Meter bzw. Drehung) — darüber gilt die Kamera als bewegt, die nahe Kaskade folgt jedem Frame.
AnazhRealm.SCHATTEN_RUHE_EPS = 1e-4;
// DER RÜCKSTRAHL DES BODENS (schatten.K4, `_rueckstrahlPass`): ein Raster `raster`² über das Bild; Boden ist, was `unterAugeM`
// unter dem Auge und im `umkreisM` liegt und waagrecht ist (|n.y| > `normalY`); der Messwert folgt je Bild mit `folge`.
AnazhRealm.RUECKSTRAHL = Object.freeze({ raster: 12, unterAugeM: 0.5, umkreisM: 16, normalY: 0.7, folge: 0.5 });
// DER WURF DES FEUERS (schatten.K5, `_lichtWurf` · `_lichtWurfTakt`): EIN Platz des Licht-Pools wirft — die Würfel-Karte je
// Seite `kartePx` (256: 2,3 cm je Texel in 3 m), die nahe Ebene mindestens `nahM`, sonst `kernAnteil` × der Kern der Quelle (der
// Leib der Flamme wirft nicht); `bias` (Tiefe, negativ: zum Licht) und `normalBiasM` (Welt-Meter längs der Normale, 1,5 Texel in
// 3 m) halten die Akne; PCF über `weichPx`. Wichtig ist eine Quelle ab `wichtigAb` des Lichts der Welt in `bezugM`, gehalten
// bis eine andere `halten`-fach wichtiger ist; die Karte zeichnet höchstens je `takt` Bilder neu (nie neben einer Kaskade).
AnazhRealm.LICHT_WURF = Object.freeze({
    kartePx: 256,
    nahM: 0.05,
    kernAnteil: 1,
    bias: -0.0003,
    normalBiasM: 0.035,
    weichPx: 2,
    bezugM: 2,
    wichtigAb: 0.25,
    halten: 1.25,
    takt: 3,
});
// DIE KASKADEN-BOX (_kaskadenPassen): jede Kaskade misst die Frustum-Scheibe im Licht-Raum statt ihrer Diagonale.
// `texelM` = die Texel-Kante je Kaskade, die die längste Box-Kante bei jeder Blickrichtung hält — die des
// Addon-Quadrats (k0 339 m / 2048, k1 961 m / 2048): kein Schatten wird gröber als bis V18.529. Die Karten-Größe folgt
// daraus am Standard-Bereich und Bezugs-Seitenverhältnis `bezugAspekt` (kleinste Zweierpotenz, einmal bei der
// Kaskaden-Geburt; k0 = k1 = 2048, gate:schatten-werfer K5/K6). `rasterTeiler`: die Box wächst in Schritten von
// Scheiben-Tiefe / rasterTeiler (eine Größe hält, solange die Scheibe hineinpasst — sonst schimmert jede Drehung);
// `randM` = Saum der Werfer-Hülle (Wind, Morph), `luftM` = Saum über dem höchsten Werfer und unter der tiefsten
// Scheibe. DER BIAS (0710-12, `_schattenBias`) in Texeln der Karte, nie in Metern: `normalTexel` = der normalBias je Texel
// (mal dem Hebel `atmosphere.shadowBias`), `tiefeTexel` = der Tiefen-Nudge entlang des Lichts. Den Versatz trägt die
// End-Normale des Empfänger-Stoffs (r184 `normalWorld`), am geflachten Boden also die Senkrechte (TERRAIN_NORMAL_FLATTEN);
// darum trägt der Boden die Zuwendung seiner wahren Normale selbst (`receivedShadowNode`, 1110-5): abgewandt im Schatten,
// über N·L 0 … `zuwendungSaum` weich (der Saum am Terminator, sonst die Hang-Akne).
// DIE KONTAKT-KASKADE (schatten.K1): die ersten `kontaktM` Meter tragen eine eigene Kaskade bei `texelM[0]` (≤ 5 cm, 1024²);
// DER FILTER jeder Kaskade ist das EINE Gesetz der Sonnen-Scheibe (`_schattenFilter`): Halbschatten = Abstand Werfer →
// Empfänger längs des Lichts × `sonneTan` (0,53°), die Werfer gesucht im Kegel der Sonne über dem Empfänger (höchstens `sucheM`
// je Kaskade; der Saum `luftM` über dem höchsten Werfer ist sein Scheitel), der Radius `filterTexel`
// Texel + Halbschatten/2 (k0 und k1: 1 Texel ohne Suche, der r184-PCF bis K1 — ihr Texel trägt den Halbschatten der Sonne nie).
AnazhRealm.SCHATTEN_KASKADE = Object.freeze({
    kontaktM: 15,
    texelM: Object.freeze([0.045, 0.17, 0.47]),
    filterTexel: Object.freeze([0.25, 1, 1]),
    sonneTan: 0.00925,
    sucheM: Object.freeze([0.25, 0, 0]),
    bezugAspekt: 16 / 9,
    karteMax: 2048,
    rasterTeiler: 8,
    randM: 2,
    luftM: 4,
    normalTexel: 0.5,
    tiefeTexel: 0.75,
    zuwendungSaum: 0.08,
});
// Die zwölf Kanten einer Frustum-Scheibe (Ecken 0–3 nah, 4–7 fern, CSMFrustum-Reihenfolge) als Index-Paare.
AnazhRealm.KASKADEN_KANTEN = Object.freeze([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
