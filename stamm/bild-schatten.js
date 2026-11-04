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
    // DIE WÜRFEL-KARTE (schatten.K5, `_lichtWurf`) trägt dasselbe Gesetz: ihr `texel` ist die Kante an der Fern-Ebene (die
    // Reichweite, die gröbste der Seite), der Tiefen-Nudge geht durch die Steigung IHRER Tiefe — r184s `PointShadowNode`
    // vergleicht die perspektivische Tiefe (`viewZToPerspectiveDepth`, gelesen am Vendor 03.11.), an der Fern-Ebene
    // d' = Nah / (Fern · Tiefe der Box); die Kaskade ist orthographisch, d' = 1 / Tiefe. Dort hält er `tiefeTexel` Texel.
    _schattenBias(licht, texel, tiefe) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const sh = licht && licht.shadow;
        if (!sh || !(texel > 0) || !(tiefe > 0)) return;
        const c = sh.camera;
        const steigung = c && c.isPerspectiveCamera ? c.near / ((c.near + tiefe) * tiefe) : 1 / tiefe;
        sh.normalBias = this._schattenNormalBias(texel);
        sh.bias = -K.tiefeTexel * texel * steigung;
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
    // Ein Ziel 2 × 1: Texel 0 der gemessene Boden (Alpha 1, wo das Raster Boden traf), Texel 1 der Boden der Atmosphäre (die
    // PMREM-Umgebung nach unten in der Stufe der Bestrahlung × das Licht jetzt). ZWEI ZAHLEN, KEINE KARTE: die Lesung kommt
    // zurück (`_rueckstrahlZeichne`) und trägt `boden` (gefolgt mit `folge` je Messung — ohne Boden im Bild hält er) und
    // `atmo` als geteilte Uniforms — bis 03.11. las jeder beleuchtete Stoff das Ziel als eigene Sampler-Einheit, und der
    // Fern-Ring trug 17 > 16 (gate:webgl-probe W6: der Rückfall linkt ihn nie). Der Stoff ersetzt den Boden der Atmosphäre
    // (`_rueckstrahlHalbraum`: + (Boden − Atmosphäre) · (1 − n.y)/2, die Bestrahlung einer geneigten Fläche aus dem Halbraum).
    // Ein Boden aus Albedo 0 trägt nichts zurück. Der Pass läuft nach dem Bild (wie der Spiegel): EIN Dreieck in 2 Pixel.
    _rueckstrahlLeser() {
        const st = this.state;
        if (st.rueckstrahlLeser) return st.rueckstrahlLeser;
        const T = THREE.TSL;
        const rt = new THREE.RenderTarget(2, 1, { type: THREE.HalfFloatType, depthBuffer: false });
        rt.name = rt.texture.name = "rueckstrahl:boden";
        rt.texture.minFilter = rt.texture.magFilter = THREE.NearestFilter;
        rt.texture.generateMipmaps = false;
        const U = this._uniformHeimatTeilen({
            an: T.uniform(0),
            boden: T.uniform(new THREE.Vector3()),
            atmo: T.uniform(new THREE.Vector3()),
        });
        st.rueckstrahlLeser = Object.assign({ rt, lesung: null, gelesen: false }, U);
        // die Strahldichte, die die untere Hemisphäre ändert — EIN Knoten für jeden Leser
        st.rueckstrahlLeser.unten = U.boden.sub(U.atmo).mul(U.an);
        return st.rueckstrahlLeser;
    }

    // DIE UNTERE HEMISPHÄRE DER BESTRAHLUNG (rgb, TSL) — das EINE Gesetz für die Umgebung der Stoffe (`_spiegelUmgebung`) und das
    // Licht der Welt (`_weltLicht`: Feld, Panorama, Spiegel, Wasser): der Himmel der Normale `n` plus der gezeichnete Boden
    // anstelle des Bodens der Atmosphäre, gewichtet mit dem Anteil des Halbraums unter dem Horizont, den die Fläche sieht.
    _rueckstrahlHalbraum(himmel, n) {
        const T = THREE.TSL;
        const unten = this._rueckstrahlLeser().unten;
        return T.max(himmel.add(unten.mul(T.float(1).sub(n.y).mul(0.5))), T.vec3(0));
    }

    _rueckstrahlPass() {
        const st = this.state;
        if (st.rueckstrahlPass) return st.rueckstrahlPass;
        const T = THREE.TSL;
        const { Fn, Loop, If, float, vec2, vec3, vec4, ivec2, uniform, screenUV, select, abs, normalize, cross } = T;
        const R = AnazhRealm.RUECKSTRAHL;
        const tiefe = T.texture(st.scenePass.getTextureNode("depth").value);
        const farbe = T.texture(st.scenePass.getTextureNode().value);
        const webgpuRaum = st.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        const U = this._uniformHeimatTeilen({
            invVP: uniform(new THREE.Matrix4()),
            auge: uniform(new THREE.Vector3()),
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
                    // Boden ist nur, was unter dem offenen Himmel liegt (`_offenerHimmel`): der Boden eines Hauses ist kein
                    // Boden, den Sonne und Himmel beleuchten — aus dem Haus misst der Pass, was durch die Tür liegt, sonst hält er
                    If(
                        rel.y
                            .lessThan(-R.unterAugeM)
                            .and(rel.xz.length().lessThan(R.umkreisM))
                            .and(nY.greaterThan(R.normalY))
                            .and(this._offenerHimmel(T, p.xyz).greaterThan(0.5)),
                        () => {
                            summe.addAssign(farbe.load(px).rgb);
                            n.addAssign(1);
                        }
                    );
                });
            });
            // ohne Boden im Raster −1 (eine Strahldichte ist nie negativ): die Lesung hält dann den alten Boden
            const boden = select(n.greaterThan(0), summe.div(n.max(1)), vec3(-1));
            return vec4(select(screenUV.x.lessThan(0.5), boden, atmoBoden), 1);
        })();
        const pp = st.postProcessing;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function") throw new Error("RÜCKSTRAHL: Quad der Post-Kette fehlt (Vendor-Drift)");
        const quad = new Quad(mat);
        quad.name = "rueckstrahl:boden";
        st.rueckstrahlPass = { quad, mat, U, vp: new THREE.Matrix4(), laeufe: 0, sig: null, sprung: false };
        return st.rueckstrahlPass;
    }

    // NACH DEM BILD (`_loopRender`, auf der Post-Kette, neben dem Spiegel): der Pass misst den Boden dieses Bilds in seiner
    // Ansicht, die Lesung kommt zurück und trägt die Uniforms — EINE unterwegs, bis sie da ist misst er nicht neu. `an` steht
    // erst, wenn ein Boden gelesen ist. Ohne Szenen-Pass oder ohne Umgebung misst niemand (`an` 0): dann trägt kein Stoff
    // einen gezeichneten Boden — ein Bruch des Passes oder der Lesung meldet sich beim EINEN Melder und lässt `an` auf 0.
    _rueckstrahlZeichne() {
        const st = this.state;
        const L = this._rueckstrahlLeser();
        L.an.value = this._rueckstrahlAn(L);
        if (!st.scenePass || !st._skyEnvRT || st.rueckstrahlBruch) return;
        try {
            const P = this._rueckstrahlPass();
            const cam = st.camera;
            // ein Sprung wartet auf die nächste Messung, solange eine Lesung unterwegs ist
            P.sprung = P.sprung || P.laeufe === 0 || !!(st._traaR && st._traaR.sprung);
            // IM STAND MISST ER NICHT NEU: der Boden um ein ruhendes Auge unter demselben Licht ist derselbe — ein Messen je Bild
            // folgte nur dem Wechsel der Auflösung und dem Raster (die ruhende Welt änderte 0,27 der Pixel, gate:ziel-zensus)
            if (L.lesung || !this._rueckstrahlWach(P, P.sprung)) return;
            P.vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
            P.U.invVP.value.copy(P.vp).invert();
            P.U.auge.value.setFromMatrixPosition(cam.matrixWorld);
            const rend = st.renderer;
            if (typeof rend.readRenderTargetPixelsAsync !== "function")
                throw new Error("der Renderer liest kein Ziel zurück (readRenderTargetPixelsAsync fehlt, Vendor)");
            const vor = rend.getRenderTarget();
            rend.setRenderTarget(L.rt);
            P.quad.render(rend);
            rend.setRenderTarget(vor);
            // springt das Auge, gilt der neue Boden sofort (der erste Lauf, ein Sprung der Zeit-Auflösung), sonst folgt er
            const folge = P.sprung ? 1 : AnazhRealm.RUECKSTRAHL.folge;
            P.sprung = false;
            P.laeufe++;
            L.lesung = rend.readRenderTargetPixelsAsync(L.rt, 0, 0, 2, 1).then(
                (px) => {
                    L.lesung = null;
                    const w = (i) => (px instanceof Uint16Array ? AnazhRealm._halbZuFloat(px[i]) : px[i]);
                    L.atmo.value.set(w(4), w(5), w(6));
                    if (!(w(0) >= 0)) return;
                    const f = L.gelesen ? folge : 1;
                    const b = L.boden.value;
                    b.set(b.x + (w(0) - b.x) * f, b.y + (w(1) - b.y) * f, b.z + (w(2) - b.z) * f);
                    L.gelesen = true;
                },
                (err) => {
                    st.rueckstrahlBruch = true;
                    L.an.value = 0;
                    this._stoffBruch(
                        "die Lesung des Rückstrahls (schatten.K4) — die Umgebung trägt unten den Boden der Atmosphäre",
                        err
                    );
                }
            );
        } catch (err) {
            st.rueckstrahlBruch = true;
            L.an.value = 0;
            this._stoffBruch(
                "der Rückstrahl des Bodens (schatten.K4) — die Umgebung trägt unten den Boden der Atmosphäre",
                err
            );
        }
    }

    // DER RÜCKSTRAHL DIESER SZENE (Werkzeuge vor einer Aufnahme, wie `_schattenAlleNeu`): die Lesung folgt dem Bild — EIN Bild
    // `bild` misst den Boden der Szene, die jetzt gilt, und die Lesung kommt zurück, bevor der Schuss zählt. Bis dahin trug jeder
    // Schuss den Boden des vorigen (gate:naesse:echt, Dorf: der nasse Schuss den frischen Boden, der Schuss ohne Schliere den
    // nassen — 510 Punkte innen trennten zwei Bilder derselben Nässe). Ohne Pass (Holz ohne Szenen-Pass) misst niemand.
    // DER BODEN GILT AB DEM NÄCHSTEN BILD (w10-treue, 04.11.): `an` stellt das Bild der Messung an seinem Ende — BEVOR seine Lesung
    // zurückkommt. Der erste Schuss nach dem Lesen zeichnete darum ohne den Boden, den er eben gemessen hatte, jeder weitere mit ihm:
    // zwei Aufnahmen derselben Szene wichen ab (Radeon, Wiese 960 × 540: 487 652 von 2 073 600 Bytes, die dritte gleich der zweiten;
    // GTX lod.K2#1 547 572, lod.K5#1 2 216 057 — „EINE Aufnahme je Schuss trägt hier nicht“). Nach der Lesung stellt die EINE Regel
    // `_rueckstrahlAn` den Schalter für die Bilder des Schusses. ZWEI Messbilder: was ein Bild dem nächsten lässt, trug im ersten
    // noch den Schalter von vorher — erst das zweite zeichnet unter dem Boden der Szene. Der Boden, den es misst, liegt unter den
    // Schatten-Karten DIESES Blicks: die Aufnahme legt sie vor dem ersten Messbild neu (`neubeginn`, w12-lod-ende) — bis dahin
    // trug er die Kaskaden, die der Lauf davor hielt (Radeon, Wiese: Boden 0,069 statt 0,095, Stamm und Laub der ersten Aufnahme
    // 1 786 078 Bytes neben der zweiten).
    async _rueckstrahlJetzt(bild) {
        const st = this.state;
        const L = st.rueckstrahlLeser;
        if (!L || !st.rueckstrahlPass) return;
        if (L.lesung) await L.lesung;
        for (let i = 0; i < 2; i++) {
            st.rueckstrahlPass.sprung = true;
            bild();
            if (L.lesung) await L.lesung;
            L.an.value = this._rueckstrahlAn(L);
        }
    }
    // DER SCHALTER DES RÜCKSTRAHLS (die EINE Regel, `_rueckstrahlZeichne` je Bild und `_rueckstrahlJetzt` nach der Lesung): an erst,
    // wenn ein Boden gelesen ist; ohne Szenen-Pass, ohne Umgebung oder nach einem Bruch nie. DIE DECKE ÜBER DEM AUGE
    // (`_augeUnterDach`, je Takt): der Rückstrahl ist das Licht des Bodens unter dem offenen Himmel — steht das Auge unter einer
    // Decke, ruht er. Bis dahin nahm der Innenraum des Dorf-Hauses den gemessenen Boden: im Regen heller als in der Sonne
    // (gate:naesse:echt Regenbild 1,065 > 1, GTX), 8 861 Regen-Punkte innen
    _rueckstrahlAn(L) {
        const st = this.state;
        if (!st.scenePass || !st._skyEnvRT || st.rueckstrahlBruch) return 0;
        return L.gelesen && !this._augeUnterDach() ? 1 : 0;
    }

    // DIE RUHE DES RÜCKSTRAHLS: er misst neu, wenn das Auge weiter als `ruheM` wandert oder der Blick weiter als `ruheRad` dreht (die
    // Ruhe des Auges wie beim Spiegel, `AnazhRealm.SPIEGEL`), das Licht der Welt eine neue Sonde trägt (`_weltLicht().stand`) oder
    // das Auge springt (`sprung`: der erste Lauf, ein Sprung der Zeit-Auflösung — auch jede Aufnahme beginnt so).
    _rueckstrahlWach(P, sprung) {
        const e = this.state.camera.matrixWorld.elements;
        const K = AnazhRealm.SPIEGEL;
        const v = [e[12], e[13], e[14], e[8], e[9], e[10], this._weltLicht().stand];
        const a = P.sig;
        let wach = sprung || !a;
        for (let i = 0; !wach && i < v.length; i++) {
            const d = Math.abs(v[i] - a[i]);
            wach = i < 3 ? d > K.ruheM : i < 6 ? d > K.ruheRad : d !== 0;
        }
        if (wach) P.sig = v;
        return wach;
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
        // den Bias schreibt das EINE Gesetz der Kaskade (`_schattenBias`) bei jeder Zeichnung aus Reichweite und Nah-Ebene
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
            const C = L.shadow.camera;
            if (C.near !== nah || C.far !== lage.w) {
                C.near = nah;
                C.far = lage.w;
                C.updateProjectionMatrix();
            }
            // DER BIAS aus dem EINEN Gesetz (`_schattenBias`): die Texel-Kante der 90°-Seite an der Reichweite, 2 · Fern / Karte
            this._schattenBias(L, (2 * lage.w) / L.shadow.mapSize.width, lage.w - nah);
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
        // DER URSPRUNG DES WELT-RASTERS (schatten.K2, `_ditherIGN` in der Kaskade): Spalte s der Karte liegt auf dem Welt-Index
        // bx0/tx + s, Zeile z (von oben, r184 dreht y im Schatten-Koordinaten-Satz) auf by0/ty + Höhe − z — beide Ursprünge ganz
        // (das Zentrum rastet, die Box trägt ganze Texel), modulo BLENDE_RASTER
        const P = AnazhRealm.BLENDE_RASTER;
        const modP = (x) => ((Math.round(x) % P) + P) % P;
        if (!f.raster) f.raster = [0, 0];
        f.raster[0] = modP(bx0 / tx);
        f.raster[1] = modP(by0 / ty + sh.mapSize.height);
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

    // ═══ DIE KONTAKT-VERDECKUNG (schatten.K3) ═══
    // Zwischen den Dingen gab es keine Verdeckung: der Himmel erreichte den Boden am Fuß eines Leibs, am Sockel eines Hauses
    // und am Stamm wie auf freier Wiese (Radeon am 5fba36ea: das Kontaktband 2–18 cm vor der Fläche bei 98,9 % bzw. 100 % des
    // freien Bodens, die Sonne aus). Die Himmels-Sicht (`aHimmel`, das Gelände-Gesetz) kennt nur das Gelände. EIN Baustein des
    // Welt-Renderers schließt die Lücke: GTAO (Jimenez et al. 2016, „Practical Realtime Strategies for Accurate Indirect
    // Occlusion"; das Integral wie XeGTAO) aus DEM Tiefen-Puffer des Szenen-Passes, in HALBER Auflösung, NACH dem Bild (wie der
    // Spiegel, `_spiegelPassZeichne`), RÄUMLICH gefiltert (3 × 3 gleicher Tiefe). Das Rauschen der Scheiben ist DIE PHASE DER
    // BLENDE (`uDitherT`, `_loopRender`; XeGTAO „NoiseIndex": mit TAA der Bild-Zähler, ohne 0): wo die zeitliche Auflösung in der
    // Kette steht, dreht sie je Bild und die Auflösung mittelt die Richtungen, ohne sie (Holz kienspan) steht sie. Die
    // Verdeckung ist damit eine FUNKTION von Tiefe, Ansicht und Phase — eine stehende Welt zeichnet dieselbe Verdeckung.
    // Bis w5-kontakt trug der Pass eine eigene Geschichte (je Lauf die nächste von 8 Phasen, 0,2 neu gemischt): die stehende
    // Welt wanderte (Ziel-Zensus, Ruhe 0,0092 der Pixel an der GTX, z191). Der Boden des nächsten Bilds liest das Ergebnis
    // reprojiziert in dessen Ansicht (`_kontaktVerdeckung`, EINE Ladung je Fragment) und multipliziert es in seinen aoNode:
    // r184 trägt aoNode NUR ins indirekte Licht (diffus und Glanz, spec/vendor-anker.json), Sonne und Licht-Pool bleiben.
    // DÜNNE UND NAHE WERFER (XeGTAO „ThinOccluderCompensation"): ein Halm vor dem Boden liegt längs des Blicks weit vor ihm, eine
    // Wand am Fuß in seiner Tiefe — der Abfall misst die Tiefen-Achse des Abstands × (1 + `duenn`); näher als `nahM` verdeckt
    // nichts (der Nachbar-Halm, das Korn des Bodens), die Wand und der Leib reichen darüber hinauf.
    // DER HALM LIEST SIE NICHT (bis w6-kontakt: ja): im Halm-Fragment las sie die Tiefe der Nachbar-Halme — das Gras dunkelte sich
    // selbst (Radeon, Station am Dorf: der freie Boden im Gras 0,02–0,6), schimmerte im Schatten beim Gehen (schatten.K2 in
    // derselben Welt 4,66 → 5,93 % mit, 4,96 % ohne den Halm) und kostete je Gras-Fragment (GTX a085a06c: ~1,4 ms an der Wiese).
    // GEMESSEN (Radeon 890M, die Geometrie der Station schatten.K3 an der Mess-Wiese, die Halm-Schicht ruht — der gemähte Boden):
    // Fuß 0,56 · Sockel 0,39 des freien Bodens (5fba36ea: 1,059 · 1,010).
    _kontaktLeser() {
        const st = this.state;
        if (st.kontaktLeser) return st.kontaktLeser;
        const T = THREE.TSL;
        const ziel = (name) => {
            const rt = new THREE.RenderTarget(1, 1, {
                type: THREE.HalfFloatType,
                format: THREE.RGFormat,
                depthBuffer: false,
            });
            rt.name = rt.texture.name = name;
            rt.texture.minFilter = rt.texture.magFilter = THREE.NearestFilter;
            rt.texture.generateMipmaps = false;
            return rt;
        };
        // `rt` das Ergebnis (Verdeckung, Sicht-Tiefe) — die Leser lesen es; `neu` das Ziel des Passes, geglättet in `rt` (die
        // Leser tragen EINE Textur, kein Tausch der Bindung je Bild)
        // Ansicht und Schalter wechseln je Bild: sie reisen in der GETEILTEN renderGroup (`_uniformHeimatTeilen`, wie der Spiegel)
        st.kontaktLeser = Object.assign(
            { rt: ziel("kontakt:verdeckung"), neu: ziel("kontakt:verdeckung:neu") },
            this._uniformHeimatTeilen({ vp: T.uniform(new THREE.Matrix4()), an: T.uniform(0) })
        );
        return st.kontaktLeser;
    }

    // DER LESER (der aoNode des Bodens): der Welt-Punkt des Fragments in der Ansicht des letzten Laufs, EIN Texel
    // des geglätteten Ergebnisses (der räumliche Filter ist im Pass gerechnet — der Leser zahlt je Fragment eine Ladung), gewogen
    // mit dem Zelt seiner Sicht-Tiefe gegen die des Punkts (`tiefeRand` relativ: die Kante eines Leibs vor dem Boden reicht ihm
    // nichts); außerhalb des Ziels und ohne Lauf (`an` 0: Direktpfad, Bruch) 1.
    // DER KNOTEN LEBT IM EINEN HALTER (`L.knoten`, er reist mit der Seite, `WELT_GRENZE.seite`): bis w5-kontakt lag er am Wirt
    // (`this._kontaktK`) — der Abschied der Welt (`_weltAbschied`) zählte jedes Feld am Wirt als fallend, fand in ihm die
    // Textur des Ziels und gab sie frei, der Boden der nächsten Welt band die zerstörte Textur (gate:kamera-leib am Tor der
    // Prüfbühne: „Destroyed texture [kontakt:verdeckung] used in a submit", z191/z197).
    _kontaktVerdeckung() {
        const L = this._kontaktLeser();
        if (L.knoten) return L.knoten;
        const T = THREE.TSL;
        const K = AnazhRealm.KONTAKT;
        const tex = T.texture(L.rt.texture);
        const clip = L.vp.mul(T.vec4(T.positionWorld, 1));
        const w = T.max(clip.w, 1e-4);
        const uv = T.vec2(clip.x.div(w).mul(0.5).add(0.5), T.float(0.5).sub(clip.y.div(w).mul(0.5)));
        const gr = T.vec2(tex.size());
        const t = tex.load(T.ivec2(T.clamp(T.floor(uv.mul(gr)), T.vec2(0), gr.sub(1))));
        const gilt = T.max(T.float(1).sub(T.abs(t.y.sub(w)).div(w.mul(K.tiefeRand))), 0);
        const drin = T.step(0, uv.x)
            .mul(T.step(uv.x, 1))
            .mul(T.step(0, uv.y))
            .mul(T.step(uv.y, 1))
            .mul(T.step(0, clip.w));
        L.knoten = T.mix(T.float(1), t.x, gilt.mul(drin).mul(L.an));
        return L.knoten;
    }

    // DER PASS (je Texel des halben Szenen-Ziels): Tiefe → Lage → Normale → `scheiben` × 2 Seiten × `schritte` Horizont-Proben,
    // gedreht in der Phase der Blende (`uDitherT`) — kein Zustand aus einem vorigen Lauf.
    _kontaktPass() {
        const st = this.state;
        if (st.kontaktPass) return st.kontaktPass;
        const T = THREE.TSL;
        const { Fn, If, float, vec2, vec3, vec4, uniform, texture, screenUV, ivec2, floor, clamp, max, dot } = T;
        const { cross, normalize, length, acos, cos, sin, select, mix, fract, abs } = T;
        const phase = this._ensureLodUniforms().uDitherT; // DIE Phase der Blende (`_loopRender`: dreht nur mit der Auflösung)
        const K = AnazhRealm.KONTAKT;
        const L = this._kontaktLeser();
        const tiefe = texture(st.scenePass.getTextureNode("depth").value);
        const webgpuRaum = st.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        const U = {
            invP: uniform(new THREE.Matrix4()),
            p11: uniform(1),
        };
        const H = Math.PI / 2;
        const mat = new THREE.MeshBasicNodeMaterial();
        mat.name = "kontakt:verdeckung";
        mat.fog = false;
        mat.depthTest = false;
        mat.depthWrite = false;
        mat.fragmentNode = Fn(() => {
            const gr = vec2(tiefe.size());
            // die Sicht-Lage des Texels q (ganzzahlig) aus der Tiefe des Szenen-Passes
            const sicht = (q) => {
                const qq = clamp(q, vec2(0), gr.sub(1));
                const d = tiefe.load(ivec2(qq)).r;
                const u = qq.add(0.5).div(gr);
                const h = U.invP.mul(
                    vec4(u.x.mul(2).sub(1), float(1).sub(u.y).mul(2).sub(1), webgpuRaum ? d : d.mul(2).sub(1), 1)
                );
                return h.xyz.div(h.w);
            };
            const aus = vec4(1, 0, 0, 1).toVar();
            const q = floor(screenUV.mul(gr));
            If(tiefe.load(ivec2(q)).r.lessThan(0.99999), () => {
                const P = sicht(q).toVar();
                const naeher = (a, b) => select(length(a).lessThan(length(b)), a, b);
                const dx = naeher(sicht(q.add(vec2(1, 0))).sub(P), P.sub(sicht(q.sub(vec2(1, 0)))));
                const dy = naeher(sicht(q.add(vec2(0, 1))).sub(P), P.sub(sicht(q.sub(vec2(0, 1)))));
                const V = normalize(P.negate()).toVar();
                const n0 = normalize(cross(dx, dy));
                const N = select(dot(n0, V).lessThan(0), n0.negate(), n0).toVar();
                // der Radius im Schirm (Texel des Szenen-Ziels) — fern unter `minPx` verdeckt nichts mehr
                const rpx = float(K.radiusM).mul(U.p11).mul(gr.y.mul(0.5)).div(max(P.z.negate(), 1e-3)).toVar();
                const neu = float(1).toVar();
                If(rpx.greaterThan(K.minPx), () => {
                    // das Rauschen des Texels in der Phase der Blende (Interleaved-Gradient wie `_ditherIGN`, rotiert mit
                    // `uDitherT`; die zweite Folge um 7,13 px versetzt)
                    const ign = (o) => {
                        const qo = q.add(o);
                        return fract(
                            float(52.9829189)
                                .mul(fract(qo.x.mul(0.06711056).add(qo.y.mul(0.00583715))))
                                .add(phase)
                        );
                    };
                    const phi0 = ign(0),
                        jit = ign(7.13);
                    let vis = float(0),
                        vis0 = float(0);
                    for (let s = 0; s < K.scheiben; s++) {
                        const phi = phi0.add(s).mul(Math.PI / K.scheiben);
                        const dir = vec2(cos(phi), sin(phi));
                        const dV = vec3(dir.x, dir.y.negate(), 0);
                        const ortho = dV.sub(V.mul(dot(dV, V)));
                        const achse = normalize(cross(ortho, V));
                        const nP = N.sub(achse.mul(dot(N, achse)));
                        const nL = max(length(nP), 1e-4);
                        const cosN = clamp(dot(nP, V).div(nL), -1, 1);
                        const n = select(dot(ortho, nP).lessThan(0), float(-1), float(1)).mul(acos(cosN)).toVar();
                        const tief0 = cos(n.add(H)),
                            tief1 = cos(n.sub(H));
                        let hc0 = tief0,
                            hc1 = tief1;
                        for (let t = 0; t < K.schritte; t++) {
                            const k = jit.add(t).div(K.schritte);
                            const spx = max(k.mul(k).mul(rpx), 1);
                            for (const seite of [1, -1]) {
                                const S = sicht(floor(q.add(0.5).add(dir.mul(spx.mul(seite)))));
                                const del = S.sub(P);
                                const weit = max(length(del), 1e-5);
                                // der Abfall über den Abstand mit der Tiefen-Achse × (1 + duenn): dünne Werfer vor dem Punkt;
                                // näher als `nahM` verdeckt nichts (der Nachbar-Halm, das Korn des Bodens — die Wand und der Leib
                                // reichen über `nahM` hinauf)
                                const abfall = length(vec3(del.x, del.y, del.z.mul(1 + K.duenn)));
                                const g = clamp(
                                    float(K.radiusM)
                                        .sub(abfall)
                                        .div(K.radiusM * K.saum),
                                    0,
                                    1
                                ).mul(T.smoothstep(K.nahM * 0.5, K.nahM, weit));
                                const tief = seite > 0 ? tief0 : tief1;
                                const hc = mix(tief, dot(del, V).div(weit), g);
                                if (seite > 0) hc0 = max(hc0, hc);
                                else hc1 = max(hc1, hc);
                            }
                        }
                        const h0 = n.add(
                            clamp(
                                acos(clamp(hc1, -1, 1))
                                    .negate()
                                    .sub(n),
                                -H,
                                H
                            )
                        );
                        const h1 = n.add(clamp(acos(clamp(hc0, -1, 1)).sub(n), -H, H));
                        const sn = sin(n);
                        const bogen = (h) =>
                            cosN
                                .add(h.mul(2).mul(sn))
                                .sub(cos(h.mul(2).sub(n)))
                                .mul(0.25);
                        vis = vis.add(nL.mul(bogen(h0).add(bogen(h1))));
                        vis0 = vis0.add(nL.mul(cosN.add(n.mul(sn))));
                    }
                    neu.assign(clamp(vis.div(max(vis0, 1e-4)), 0, 1).pow(K.potenz));
                });
                aus.assign(vec4(neu, P.z.negate(), 0, 1));
            });
            return aus;
        })();
        // DAS VOLLBILD ist ein Pass der Post-Kette: das Quad ihrer Klasse (`pp._quadMesh`, wie der Spiegel)
        const pp = st.postProcessing;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function") throw new Error("KONTAKT-PASS: Quad der Post-Kette fehlt (Vendor-Drift)");
        const quad = new Quad(mat);
        quad.name = "kontakt:verdeckung";
        // DER RÄUMLICHE FILTER (neu → rt): je Texel das Mittel seiner 3 × 3 Nachbarn gleicher Sicht-Tiefe (Zelt über
        // `tiefeRand`) — das Rauschen der Scheiben-Wahl fällt, die Kante eines Leibs vor dem Boden bleibt
        const roh = texture(L.neu.texture);
        const glatt = new THREE.MeshBasicNodeMaterial();
        glatt.name = "kontakt:verdeckung:glatt";
        glatt.fog = false;
        glatt.depthTest = false;
        glatt.depthWrite = false;
        glatt.fragmentNode = Fn(() => {
            const gr = vec2(roh.size());
            const q = floor(screenUV.mul(gr));
            const m = roh.load(ivec2(q));
            const rand = max(m.y.mul(K.tiefeRand), 1e-4);
            let summe = float(0),
                gewicht = float(0);
            for (let j = -1; j <= 1; j++)
                for (let i = -1; i <= 1; i++) {
                    const t = i || j ? roh.load(ivec2(clamp(q.add(vec2(i, j)), vec2(0), gr.sub(1)))) : m;
                    const g = max(float(1).sub(abs(t.y.sub(m.y)).div(rand)), 0);
                    summe = summe.add(t.x.mul(g));
                    gewicht = gewicht.add(g);
                }
            return vec4(select(gewicht.greaterThan(1e-4), summe.div(max(gewicht, 1e-4)), m.x), m.y, 0, 1);
        })();
        const quadGlatt = new Quad(glatt);
        quadGlatt.name = "kontakt:verdeckung:glatt";
        st.kontaktPass = { quad, mat, quadGlatt, glatt, U, vp: new THREE.Matrix4() };
        return st.kontaktPass;
    }

    // NACH DEM BILD (`_loopRender`, nur auf der Post-Kette — der Szenen-Pass trägt die Tiefe): der Pass rechnet aus Tiefe und
    // Ansicht DIESES Bilds in halber Auflösung des Szenen-Ziels in `neu` und legt es geglättet in `rt`; der Boden des nächsten
    // Bilds liest es in dieser Ansicht. Er läuft je Bild (die Tiefe lebt: Leiber, Wind, das Zittern der Zeit-Auflösung) — seine
    // Kosten hängen am Schirm, nie an der Welt; steht die Welt (Tiefe, Ansicht, Phase der Blende), steht sein Ergebnis.
    // Läuft er nicht, liest der Boden 1 (`an` 0); ein Bruch meldet laut beim Namen.
    _kontaktPassZeichne(direkt) {
        const st = this.state;
        const L = this._kontaktLeser();
        if (direkt || !st.scenePass || st.kontaktBruch) {
            L.an.value = 0;
            return;
        }
        try {
            const rend = st.renderer;
            const cam = st.camera;
            const sz = st.scenePass.renderTarget;
            const w = Math.max(1, Math.ceil(sz.width / 2)),
                h = Math.max(1, Math.ceil(sz.height / 2));
            const frisch = L.rt.width !== w || L.rt.height !== h;
            // ein neues Maß: die Ziele wachsen, die Pässe binden neu (r184 hielt im Filter die Bindung des alten Ziels —
            // Radeon, Fenster 1920 → 640: der Filter las 0)
            if (frisch) {
                for (const z of [L.rt, L.neu]) z.setSize(w, h);
                if (st.kontaktPass) for (const m of [st.kontaktPass.mat, st.kontaktPass.glatt]) m.dispose();
                st.kontaktPass = null;
            }
            const P = this._kontaktPass();
            // die Matrizen DIESES Bilds (der Render rechnete sie, die Zeit-Auflösung nahm ihren Versatz zurück)
            P.U.invP.value.copy(cam.projectionMatrixInverse);
            P.U.p11.value = cam.projectionMatrix.elements[5];
            P.vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
            const vor = rend.getRenderTarget();
            rend.setRenderTarget(L.neu);
            P.quad.render(rend);
            rend.setRenderTarget(L.rt);
            P.quadGlatt.render(rend);
            rend.setRenderTarget(vor);
            L.vp.value.copy(P.vp);
            L.an.value = 1;
            st._kontaktLaeufe = (st._kontaktLaeufe || 0) + 1;
        } catch (err) {
            st.kontaktBruch = true;
            L.an.value = 0;
            this._stoffBruch("der Kontakt-Pass (schatten.K3) — der Boden trägt keine Kontakt-Verdeckung", err);
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
// DAS WELT-RASTER DER BLENDE in der Kaskade (`_ditherIGN`, schatten.K2): der Schlüssel des Rauschens ist der Index des
// Texels der Welt im Licht-Raum modulo dieser Periode (ganze Zahlen — ein Versatz der Box um n Texel verschiebt Spalte und
// Ursprung gegenläufig, der Rest bleibt; `_kaskadeFit` legt den Ursprung).
AnazhRealm.BLENDE_RASTER = 256;
// DIE KONTAKT-VERDECKUNG (`_kontaktPass`, schatten.K3): GTAO in halber Auflösung des Szenen-Ziels, räumlich gefiltert.
// `radiusM` = die Reichweite der Horizont-Suche (Welt-m; die Wand 1,5 m vor dem Boden verdeckt nichts mehr, `saum` blendet die
// letzten 40 % aus; mit 1,0 trug im engen Blick, 25°, der schmale Leib 0,79 statt 0,76, der Sockel 0,61 statt 0,54),
// `scheiben` × 2 Seiten × `schritte` Proben je Texel (16 Tiefen + 5 für Lage und Normale), gedreht in der Phase der
// Blende (`uDitherT`: mit der zeitlichen Auflösung je Bild, ohne sie fest); `duenn` streckt die Tiefen-Achse des Abfalls (XeGTAO-Dünn-Werfer: der Halm vor dem Boden verdeckt wenig, die
// Wand an seinem Fuß voll), `nahM` die Nähe, unter der nichts verdeckt (der Nachbar-Halm); `minPx` = unter so vielen
// Szenen-Texeln Radius rechnet der Texel nicht (fern), `potenz` die Endpotenz der Sicht (XeGTAO „FinalValuePower", dort 2,2),
// `tiefeRand` die relative Sicht-Tiefe, in der ein Texel dem Leser und dem Filter gilt.
AnazhRealm.KONTAKT = Object.freeze({
    radiusM: 1.5,
    saum: 0.4,
    scheiben: 2,
    schritte: 4,
    duenn: 0.7,
    nahM: 0.08,
    minPx: 2,
    potenz: 2.5,
    tiefeRand: 0.04,
});
// DER RÜCKSTRAHL DES BODENS (schatten.K4, `_rueckstrahlPass`): ein Raster `raster`² über das Bild; Boden ist, was `unterAugeM`
// unter dem Auge und im `umkreisM` liegt und waagrecht ist (|n.y| > `normalY`); der Messwert folgt je Bild mit `folge`.
AnazhRealm.RUECKSTRAHL = Object.freeze({ raster: 12, unterAugeM: 0.5, umkreisM: 16, normalY: 0.7, folge: 0.5 });
// DER WURF DES FEUERS (schatten.K5, `_lichtWurf` · `_lichtWurfTakt`): EIN Platz des Licht-Pools wirft — die Würfel-Karte je
// Seite `kartePx` (256: 2,3 cm je Texel in 3 m), die nahe Ebene mindestens `nahM`, sonst `kernAnteil` × der Kern der Quelle (der
// Leib der Flamme wirft nicht); den Bias schreibt das Gesetz der Kaskade (`_schattenBias`, die Texel-Kante an der Reichweite);
// PCF über `weichPx`. Wichtig ist eine Quelle ab `wichtigAb` des Lichts der Welt in `bezugM`, gehalten
// bis eine andere `halten`-fach wichtiger ist; die Karte zeichnet höchstens je `takt` Bilder neu (nie neben einer Kaskade).
AnazhRealm.LICHT_WURF = Object.freeze({
    kartePx: 256,
    nahM: 0.05,
    kernAnteil: 1,
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
