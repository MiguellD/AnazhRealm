class AnazhRealm_Z25c {
    // ===== ATLAS §25c · HUD/EINSTELLUNGEN — Block Bild =====
    // DIE KEHRAUS-MARKE: r184s Lebenszeit-Zähler der render()-Aufrufe (`info.render.calls` — NIE eine Frame-Metrik, die
    // liest der EINE Tap über drawCalls); `attributeCall` trägt je Attribut seinen Wert beim letzten Zeichnen, der Kehraus
    // vergleicht dagegen. Die einzige Lesung des Zählers im Stamm (gate:pipeline-constitution · gate:render-tap).
    _gpuKehrausMarke() {
        const ri = this.state.renderer && this.state.renderer.info;
        return ri && ri.render ? ri.render.calls : 0;
    }
    // DER GPU-KEHRAUS — die Residenz folgt dem BILD, nie der Geschichte: nach dem Frame verlässt jeder Geometrie-Puffer die
    // GPU, den kein Objekt des Szenen-Graphen zeichnet und den dieser Frame nicht zeichnete (die r184-Quads der Post-Kette
    // tragen ihren Frame-Zähler in `attributeCall`). Was der Foundry-Cache nur auf der CPU behält, was ein Wachsen ersetzte,
    // was eine Gruppe beim Fallen zurückließ — gleich welcher Erzeuger, EIN Chokepoint. Die Instanz-Matrizen (Speicher-
    // Puffer) fallen nur über `_instanzAbschied` (ihre Bindegruppe hält sie). Kosten: ein Gang durch Graph und Register je
    // GPU_KEHRAUS_MS — beide tragen nach dem Kehraus nur, was das Bild trägt. `zaehlerVor` = r184 `info.render.calls` vor
    // dem Frame.
    _gpuKehraus(zaehlerVor, jetzt) {
        const st = this.state;
        const rend = st.renderer;
        if (!rend || !rend._attributes || !rend._geometries || !rend.info || !st.scene) return 0;
        if (st._gpuKehrausT && jetzt - st._gpuKehrausT < AnazhRealm.GPU_KEHRAUS_MS) return 0;
        st._gpuKehrausT = jetzt;
        const lebt = new Set();
        st.scene.traverse((o) => {
            const g = o.geometry;
            if (g && g.attributes) {
                for (const k in g.attributes) lebt.add(g.attributes[k]);
                if (g.index) lebt.add(g.index);
            }
            if (o.isInstancedMesh) {
                lebt.add(o.instanceMatrix);
                if (o.instanceColor) lebt.add(o.instanceColor);
            }
            // Was seine Render-Objekte zeichnen (r184 `getAttributes`, gecacht): auch die Knoten-Attribute. Ein Objekt unter
            // der Observer-Diät lädt NICHTS neu hoch, solange sich keine Version ändert — ein Attribut, das es zeichnet,
            // darf nie fallen.
            const ros = o.__renderObjekte;
            if (ros) for (const ro of ros) if (ro.attributes) for (const a of ro.attributes) lebt.add(a);
            // eine Senke zeichnet über ihren Zeichner (1410-1): dessen Render-Objekte zeichnen ihre Attribute
            const zro = o.__zeichner && o.__zeichner.__renderObjekte;
            if (zro) for (const ro of zro) if (ro.attributes) for (const a of ro.attributes) lebt.add(a);
        });
        const gezeichnet = rend._geometries.attributeCall;
        const weg = [];
        for (const [a, v] of rend.info.memoryMap) {
            if (!v || (v.type !== "attributes" && v.type !== "indexAttributes")) continue;
            if (lebt.has(a) || gezeichnet.get(a) >= zaehlerVor) continue;
            weg.push(a);
        }
        let n = 0;
        for (const a of weg) if (this._gpuAbschied(a)) n++;
        st._gpuKehrausN = (st._gpuKehrausN || 0) + n;
        return n;
    }

    // DER EINE LEINWAND-WEG (06.10., 0910-1) — was der Direktpfad an der Leinwand braucht, lebt nur, solange er zeichnet.
    // DIE TIEFE: in die Leinwand zeichnet die Post-Kette nur ihr Ausgabe-Quad (die Szene
    // lebt im Ziel des Szene-Passes, mit eigener Tiefe) — r184 legt für jeden Leinwand-Pass dennoch eine Tiefe in Leinwand-
    // Größe an (`depthBuffer`, depth24plus, 7,9 MB bei 1080p), die dort kein Pixel liest. Der Direktpfad dagegen zeichnet
    // die Szene in das Rahmen-Ziel des Renderers (`_getFrameBufferTarget`, das Tonemapping zur Leinwand), dessen Tiefe
    // `renderer.depth` folgt: ohne sie zeichnete er ohne Tiefentest, und der erste Leser der Szenen-Tiefe (`_szeneTiefe`:
    // Wasser, Feld-Pass) warf in r184 `copyFramebufferToTexture` („Invalid value used as weak map key" — das Rahmen-Ziel
    // trägt keine Tiefen-Textur). Bis V18.532 stellten ZWEI Stellen die Tiefe (der Ketten-Bau nahm sie, nur der Fang eines
    // Render-Fehlers gab sie zurück) — jeder andere Weg in den Direktpfad (die Weiche der Zerleg-Linse `post`/`leer`) fuhr
    // ohne und stürzte. Jetzt stellt sie die Weiche in `_loopRender` je Frame hier: Direktpfad → mit Tiefe, Post-Kette →
    // ohne, und die GPU-Textur der Leinwand-Tiefe fällt dabei mit (sonst hielte ein Ausflug in den Direktpfad die 7,9 MB
    // für immer). Nur WebGPU: das WebGL2-Rückend legt die Tiefe mit dem Kontext an.
    // DAS RAHMEN-ZIEL (0910-1, Koordinator + OMEN): r184 legt es beim ersten Leinwand-Render mit Tonemapping an
    // (`_getFrameBufferTarget`: rgba16float + depth24plus, 15,8 + 7,9 MB bei 1080p, `isPostProcessingRenderTarget`) und
    // entsorgt es nur mit dem Leinwand-Ziel. Die Post-Kette legt es nie an (r184 schaltet Tonemapping und Farbraum für ihr
    // Quad ab) — jeder Ausflug in den Direktpfad hielt es für immer: `zerlegen` (die Weiche `post`) ließ 23,7 MB
    // `tex:r184-ausgabe` in der Sitzung, und `band --ort genesis` danach maß sie mit (0710-6, 0710-9). Zeichnet die Kette,
    // verlässt jedes Rahmen-Ziel die GPU (`_rahmenZielAbschied`), gleich wer es anlegte — die Weiche oder eine Linse mit
    // eigenem Leinwand-Render; eine Prüfung der Map-Größe je Frame. Die Wand: gate:post-kette (b) und (g).
    _leinwandWeg(direkt) {
        const rend = this.state.renderer;
        if (rend && direkt !== true && rend._frameBufferTargets && rend._frameBufferTargets.size > 0)
            this._rahmenZielAbschied(rend);
        const be = rend && rend.backend;
        if (!be || be.isWebGPUBackend !== true) return;
        const soll = direkt === true;
        if (rend.depth === soll) return;
        rend.depth = soll;
        // r184 hält den Deskriptor des Leinwand-Passes im Backend-Datensatz der Leinwand — updateSize verwirft ihn, der
        // nächste Leinwand-Pass baut ihn mit bzw. ohne Tiefe neu (gate:vendor-anker pinnt beides).
        be.updateSize();
        if (!soll) {
            const t = rend.getCanvasTarget().depthTexture;
            if (t && be.has(t)) be.destroyTexture(t);
        }
    }

    // DER ABSCHIED DES RAHMEN-ZIELS: r184s eigener — der dispose-Hörer, den `_getFrameBufferTarget` an das Leinwand- bzw.
    // Ausgabe-Ziel hängt (Hörer ab, Ziel entsorgt: seine Farb- und Tiefen-Textur verlassen die GPU, der Eintrag fällt). Er
    // ist am Text erkennbar (er löscht aus `_frameBufferTargets`; gate:vendor-anker pinnt ihn). Fehlt er (Vendor-Drift),
    // fällt das Ziel trotzdem — LAUT, mit dem Grund.
    _rahmenZielAbschied(rend) {
        for (const [ziel, rahmen] of [...rend._frameBufferTargets]) {
            const hoerer = (ziel && ziel._listeners && ziel._listeners.dispose) || [];
            const abschied = hoerer.find((h) =>
                /_frameBufferTargets\.delete\(/.test(Function.prototype.toString.call(h))
            );
            if (abschied) {
                abschied.call(ziel);
                continue;
            }
            this.log(
                "RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt",
                "ERROR"
            );
            rahmen.dispose();
            rend._frameBufferTargets.delete(ziel);
        }
    }

    // DIE ZEITLICHE HOCHSKALIERUNG (K50, TAAU): die Szene rendert in der EINEN Szenen-Skala (`_szeneSkalaWirk`, der
    // Szenen-Pass `setResolutionScale`), die zeitliche Auflösung löst auf die AUSGABE-Auflösung auf. Die Kamera springt je Frame
    // um einen Halton-Versatz in EINGANGS-Pixeln (die Folge des Knotens, `setViewOffset` mit der Eingangs-Größe), jedes
    // Eingangs-Texel trägt so über die Folge eine andere Stelle der Ausgabe. Je Ausgabe-Pixel wiegt der Resolve die 3×3 Texel
    // um seine Stelle nach ihrem Abstand in AUSGABE-Pixeln (exp(−ZEIT_KERN·d²): 7 statt Unreals 2,29 — gemessen schärfer und ruhiger), die Deckung des
    // nächsten Texels wiegt das Gewicht des Jetzt (ein Pixel ohne nahen Abtastpunkt in diesem Frame hält seine Geschichte),
    // die Varianz-Klemme spannt dieselben 3×3 Texel (im Stand ZEIT_GAMMA_RUHE σ: das gröbere Gitter streut weiter). Geschichte und Resolve bleiben rgba16float in der Ausgabe-Auflösung (W7:
    // 11/11/10 posterisierte die Geschichte). DIE VORTIEFE lebt im Kanal a der Geschichte (die Sicht-Tiefe des Vorbilds je
    // Ausgabe-Pixel, float16 relativ 2⁻¹¹ — 0,05 mm Tiefen-Stufe auf 1 m gegen die Disokklusions-Schwelle 0,0005): kein
    // eigenes Tiefen-Ziel der Geschichte, kein Vollbild-Zug je Frame. Ein Größenwechsel der Ausgabe startet die Geschichte
    // neu (ein Frame ohne Geschichte); ein Wechsel der Skala lässt sie stehen (sie lebt in der Ausgabe). Basis ist r184s
    // TRAANode (vendor/TRAANode.js unverändert): Bau, Ziele, Halton-Folge, Kamera-Uniformen und `clearViewOffset` erbt der
    // Knoten, Resolve, Größen und Lauf sind seine. Das Quad nimmt die Klasse des Quads der Post-Kette (`pp._quadMesh`,
    // gate:vendor-anker); fehlt sie, bricht die Kette LAUT.
    _zeitAufloesung(pp, farbe, tiefe, bewegung, kamera) {
        const T = THREE.TSL;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function" || typeof THREE.TRAANode !== "function")
            throw new Error("ZEIT-AUFLÖSUNG: Quad der Post-Kette oder TRAANode fehlt (Vendor-Drift)");
        const { Fn, If, float, vec2, vec3, vec4, uv, texture, uniform, max, exp, floor, mix, luminance } = T;
        const realm = this;
        const klemme = (h, lo, hi) => {
            const p = hi.add(lo).mul(0.5);
            const e = hi.sub(lo).mul(0.5).add(1e-7);
            const v = h.sub(p);
            const u = v.div(e).abs();
            const m = max(u.x, u.y, u.z);
            return m.greaterThan(1).select(p.add(v.div(m)), h);
        };
        class ZeitAufloesung extends THREE.TRAANode {
            constructor() {
                super(farbe, tiefe, bewegung, kamera);
                this._historyRenderTarget.depthTexture = null;
                this._zitter = uniform(new THREE.Vector2());
                this._neustart = uniform(1);
                this._kern = uniform(AnazhRealm.ZEIT_KERN);
                this._gammaRuhe = uniform(AnazhRealm.ZEIT_GAMMA_RUHE);
                this._quad = new Quad(this._resolveMaterial);
                this._quad.name = "TRAA";
                this._gr = new THREE.Vector2();
            }
            // die Eingangs-Größe, wie r184s Szenen-Pass sie anlegt (PassNode.setSize: CSS-Größe × Pixel-Verhältnis × Skala)
            eingang(aus) {
                const r = this._rend;
                const sp = this.beautyNode.passNode;
                r.getSize(aus);
                const k = r.getPixelRatio() * sp.getResolutionScale();
                return aus.set(Math.floor(aus.x * k), Math.floor(aus.y * k));
            }
            setViewOffset(_w, _h) {
                const e = this.eingang(this._gr);
                super.setViewOffset(e.x, e.y);
                const v = this.camera.view;
                this._zitter.value.set(v.offsetX, v.offsetY);
            }
            updateBefore(frame) {
                const r = frame.renderer;
                this._previousCameraWorldMatrix.value.copy(this._cameraWorldMatrix.value);
                this._previousCameraProjectionMatrixInverse.value.copy(this._cameraProjectionMatrixInverse.value);
                this._cameraNearFar.value.set(this.camera.near, this.camera.far);
                this._cameraWorldMatrix.value.copy(this.camera.matrixWorld);
                this._cameraWorldMatrixInverse.value.copy(this.camera.matrixWorldInverse);
                this._cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse);
                const sch = realm._schirm();
                const aus = { x: sch.breite, y: sch.hoehe };
                if (this._needsPostProcessingSync === true) {
                    this.setViewOffset(); // der Versatz in Eingangs-Pixeln (`eingang`)
                    this._needsPostProcessingSync = false;
                }
                const g = this._historyRenderTarget;
                const neu = g.width !== aus.x || g.height !== aus.y;
                this.setSize(aus.x, aus.y);
                const ziel = r.getRenderTarget(),
                    mrt = r.getMRT(),
                    rof = r.getRenderObjectFunction(),
                    autoClear = r.autoClear;
                r.setMRT(null);
                r.setRenderObjectFunction(null);
                r.autoClear = true;
                if (neu) {
                    r.initRenderTarget(g);
                    r.initRenderTarget(this._resolveRenderTarget);
                }
                this._neustart.value = neu ? 1 : 0;
                r.setRenderTarget(this._resolveRenderTarget);
                this._quad.render(r);
                r.setRenderTarget(null);
                r.copyTextureToTexture(this._resolveRenderTarget.texture, g.texture);
                r.setRenderTarget(ziel);
                r.setMRT(mrt);
                r.setRenderObjectFunction(rof);
                r.autoClear = autoClear;
            }
            setup(builder) {
                this._rend = builder.renderer;
                const rp = builder.context.renderPipeline;
                if (rp) {
                    this._needsPostProcessingSync = true;
                    rp.context.onBeforeRenderPipeline = () => {
                        this.setViewOffset();
                    };
                    rp.context.onAfterRenderPipeline = () => this.clearViewOffset();
                }
                if (builder.renderer.reversedDepthBuffer === true || builder.renderer.logarithmicDepthBuffer === true)
                    throw new Error("ZEIT-AUFLÖSUNG: umgekehrte oder logarithmische Tiefe trägt der Resolve nicht");
                this._velocityNode = builder.context.velocity !== undefined ? builder.context.velocity : T.velocity;
                const ein = this.beautyNode;
                const tief = this.depthNode;
                const geschichte = texture(this._historyRenderTarget.texture);
                const { x: nah, y: fern } = this._cameraNearFar;
                const resolve = Fn(() => {
                    const uvA = uv();
                    const einGr = vec2(ein.size());
                    const ausGr = vec2(1).div(this._invSize);
                    const pEin = uvA.mul(einGr);
                    const zelle = floor(pEin);
                    const jePx = ausGr.div(einGr);
                    const hoch = einGr.sub(1);
                    const summeW = float(0).toVar();
                    const summeC = vec3(0).toVar();
                    const m1 = vec3(0).toVar();
                    const m2 = vec3(0).toVar();
                    const wNah = float(0).toVar();
                    const nahD = float(2).toVar();
                    const nahT = vec2(0).toVar();
                    const fernD = float(-1).toVar();
                    for (let y = -1; y <= 1; y++)
                        for (let x = -1; x <= 1; x++) {
                            const t = zelle.add(vec2(x, y)).clamp(vec2(0), hoch).toVar();
                            const c = ein.load(t).rgb.max(0).toVar();
                            const d = t.add(0.5).add(this._zitter).sub(pEin).mul(jePx);
                            const w = exp(d.dot(d).mul(this._kern).negate()).toVar();
                            summeW.addAssign(w);
                            summeC.addAssign(c.mul(w));
                            m1.addAssign(c);
                            m2.addAssign(c.mul(c));
                            wNah.assign(max(wNah, w));
                            const tz = tief.load(t).r.toVar();
                            If(tz.lessThan(nahD), () => {
                                nahD.assign(tz);
                                nahT.assign(t);
                            });
                            If(tz.greaterThan(fernD), () => {
                                fernD.assign(tz);
                            });
                        }
                    const jetzt = summeC.div(max(summeW, 1e-5)).toVar();
                    // die Bewegung des nächsten Texels (NDC → UV), die Geschichte an ihrer Stelle im Vorbild
                    const versatz = this.velocityNode.load(nahT.add(0.5)).xy.mul(vec2(0.5, -0.5)).toVar();
                    const gUV = uvA.sub(versatz).toVar();
                    const hist = geschichte.sample(gUV).toVar();
                    const vorD = T.viewZToPerspectiveDepth(hist.a, nah, fern);
                    const posV = T.getViewPosition(gUV, vorD, this._previousCameraProjectionMatrixInverse);
                    const posW = this._previousCameraWorldMatrix.mul(vec4(posV, 1)).xyz;
                    const vorJetzt = T.viewZToPerspectiveDepth(
                        this._cameraWorldMatrixInverse.mul(vec4(posW, 1)).z,
                        nah,
                        fern
                    );
                    const imBild = gUV.greaterThanEqual(0).all().and(gUV.lessThanEqual(1).all());
                    const kante = fernD.sub(nahD).greaterThan(this.edgeDepthDiff);
                    const frei = nahD.sub(vorJetzt).greaterThan(this.depthThreshold);
                    const gueltig = imBild.and(kante.or(frei.not())).and(this._neustart.equal(0));
                    const lauf = uvA.sub(gUV).mul(ausGr).length().div(this.maxVelocityLength).saturate();
                    // das Gewicht des Jetzt: Grund 0,05, Unterpixel-Korrektur der Bewegung, mal die Deckung des nächsten Texels
                    const phase = versatz.mul(ausGr).fract().abs();
                    const pw = max(phase, phase.oneMinus());
                    const alpha = float(0.05).add(pw.x.mul(pw.y).oneMinus().div(0.75).mul(0.25)).toVar();
                    alpha.mulAssign(wNah);
                    alpha.assign(gueltig.select(alpha.add(lauf).saturate(), float(1)));
                    // die Varianz-Klemme der Geschichte über die 3×3 Eingangs-Texel
                    const gamma = mix(float(0.5), this._gammaRuhe, lauf.oneMinus().pow2());
                    const mittel = m1.div(9);
                    const sigma = m2.div(9).sub(mittel.mul(mittel)).max(0).sqrt().mul(gamma);
                    const histC = klemme(hist.rgb, mittel.sub(sigma), mittel.add(sigma));
                    // die Flimmer-Dämpfung nach Luma (r184 flickerReduction)
                    const wJ = alpha.div(luminance(jetzt.div(max(jetzt.x, jetzt.y, jetzt.z).add(1))).add(1));
                    const wG = alpha.oneMinus().div(luminance(histC.div(max(histC.x, histC.y, histC.z).add(1))).add(1));
                    const aus = jetzt
                        .mul(wJ)
                        .add(histC.mul(wG))
                        .div(max(wJ.add(wG), 1e-5));
                    const dMitte = tief.load(zelle.clamp(vec2(0), hoch)).r;
                    return vec4(aus, T.perspectiveDepthToViewZ(dMitte, nah, fern));
                });
                this._resolveMaterial.colorNode = resolve();
                return this._textureNode;
            }
        }
        return new ZeitAufloesung();
    }

    // DAS AUSGABE-ZIEL DER SZENE IN 32 BIT (0910-1 B, Host-VRAM Runde 2): r184s Szenen-Pass legt `output` als rgba16float an
    // (8 Byte je Pixel, 15,8 MB bei 1080p). Sein Inhalt ist lineares HDR-Licht ≥ 0, und der Kanal a steht an jedem Ort auf 1
    // (der Ziel-Zensus, 07.10.): TRAA reicht `currentColor.a` nur durch (vendor/TRAANode.js clipAABB), kein Leser wertet ihn.
    // rg11b10ufloat trägt dieselben drei Kanäle in 4 Byte (−7,9 MB) mit 6/6/5 Bit Mantisse — für das EINE Bild eines Frames.
    // Auflösung und Geschichte bleiben rgba16float: dort summiert die zeitliche Auflösung über 32 Frames, und rg11b10 posterisierte
    // die Wolken zu Höhenlinien (W7, alle drei in 11/11/10). Ohne das Geräte-Feature `rg11b10ufloat-renderable` bleibt `output`
    // rgba16float — LAUT (WARN mit Grund und Zahl, und der Ziel-Zensus nennt das Format), nie still.
    _ausgabeFormat(szenePass) {
        const rend = this.state.renderer;
        const be = rend && rend.backend;
        const ziel = szenePass && szenePass.renderTarget;
        if (!ziel || !ziel.texture) return;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!(dev && dev.features && dev.features.has("rg11b10ufloat-renderable"))) {
            this.state._ausgabeFormat = "rgba16float";
            this.log(
                "AUSGABE: rg11b10ufloat ist auf diesem Gerät nicht renderbar (Feature rg11b10ufloat-renderable fehlt) — das Szenen-Ziel " +
                    "bleibt rgba16float, +7,9 MB bei 1080p",
                "WARN"
            );
            return;
        }
        // r184 `PassNode.setup` schreibt bei jedem Bau `texture.type = renderer.getOutputBufferType()` (rgba16float) — das Format
        // gehört diesem EINEN Pass, nicht dem Renderer (dessen Typ legt auch das Rahmen-Ziel des Direktpfads an, RGBA: dort gibt es
        // kein 11/11/10). Der Pass stellt es darum nach seinem eigenen Bau.
        const P = Object.getPrototypeOf(szenePass);
        szenePass.setup = function (builder) {
            const o = P.setup.call(this, builder);
            this.renderTarget.texture.type = THREE.UnsignedInt101111Type;
            this.renderTarget.texture.format = THREE.RGBFormat;
            return o;
        };
        ziel.texture.type = THREE.UnsignedInt101111Type;
        ziel.texture.format = THREE.RGBFormat;
        this.state._ausgabeFormat = "rg11b10ufloat";
        this._ausgabeSonde(dev);
    }

    // DIE RUNDUNG DES GERÄTS (0910-1 B): GTX 1060 und Radeon 890M runden beim Schreiben in 11/11/10 GEGEN NULL (Sonde: 1 + ¾ ulp
    // → 1,0; W7 sah es auf der Radeon in der Geschichte). Je Kanal fehlt dann im Mittel ein halbes ulp — bei 6 Bit Mantisse
    // 2⁻⁷ · E[1/m] = 0,56 %, beim Blau (5 Bit) 1,13 % (m die Mantisse, log-gleich verteilt: E[1/m] = 1/(2 ln 2) = 0,721): das
    // Bild wurde 0,2–0,7 Luma-Stufen dunkler und gelber (gemessen OMEN, 16 Blicke, A/B gegen rgba16float). Die Sonde schreibt
    // 1 + ¾ ulp in ein 1×1-Ziel und liest zurück; rundet das Gerät gegen null, hebt der Ausgleich jede Abtastung des
    // Szenen-Bilds in der Post-Kette (`ausgabeAusgleich`) um dieses Mittel — rundet es zum nächsten, bleibt er 1.
    _ausgabeSonde(dev) {
        const st = this.state;
        if (!st._ausgabeAusgleich) st._ausgabeAusgleich = new THREE.Vector3(1, 1, 1);
        const A = st._ausgabeAusgleich;
        const tex = dev.createTexture({
            label: "ausgabe-sonde",
            size: [1, 1],
            format: "rg11b10ufloat",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        const modul = dev.createShaderModule({
            label: "ausgabe-sonde",
            code:
                "@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {\n" +
                "    let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));\n" +
                "    return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);\n" +
                "}\n" +
                "@fragment fn fs() -> @location(0) vec4f { return vec4f(1.01171875, 1.01171875, 1.0234375, 1.0); }\n",
        });
        const pipe = dev.createRenderPipeline({
            label: "ausgabe-sonde",
            layout: "auto",
            vertex: { module: modul, entryPoint: "vs" },
            fragment: { module: modul, entryPoint: "fs", targets: [{ format: "rg11b10ufloat" }] },
            primitive: { topology: "triangle-list" },
        });
        const buf = dev.createBuffer({
            label: "ausgabe-sonde",
            size: 256,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const enc = dev.createCommandEncoder({ label: "ausgabe-sonde" });
        const pass = enc.beginRenderPass({
            label: "ausgabe-sonde",
            colorAttachments: [{ view: tex.createView(), loadOp: "clear", clearValue: [0, 0, 0, 0], storeOp: "store" }],
        });
        pass.setPipeline(pipe);
        pass.draw(3);
        pass.end();
        enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: 256 }, [1, 1]);
        dev.queue.submit([enc.finish()]);
        return buf
            .mapAsync(GPUMapMode.READ)
            .then(() => {
                const w = new Uint32Array(buf.getMappedRange())[0];
                buf.unmap();
                // R: Mantisse Bit 0–5 über 1 + ¾ ulp: 0 = gegen null, 1 = zum nächsten
                const nullRund = (w & 0x3f) === 0;
                st._ausgabeRundung = nullRund ? "gegen null" : "zum nächsten";
                if (nullRund) A.set(1 + 0.721 / 128, 1 + 0.721 / 128, 1 + 0.721 / 64);
                else A.set(1, 1, 1);
                const faktor = A.toArray().map((x) => x.toFixed(4));
                this.log(
                    `AUSGABE: rg11b10ufloat, das Gerät rundet ${st._ausgabeRundung} — Ausgleich ${faktor.join("/")}`,
                    "INFO"
                );
            })
            .catch((e) => {
                this.log("AUSGABE: die Rundungs-Sonde fiel (" + ((e && e.message) || e) + ") — kein Ausgleich", "WARN");
            })
            .finally(() => {
                tex.destroy();
                buf.destroy();
            });
    }

    // DIE EINE SZENEN-SKALA (K50): die interne Auflösung der Szene relativ zur Ausgabe — `state.szeneSkala` (der Regler
    // „Szene-Auflösung“ im Menü, im Snapshot), sonst `SZENE_SKALA`. Sie lebt nur mit der zeitlichen Auflösung: ohne sie (Holz
    // kienspan) gibt es keinen Hochskalierer, die Szene rendert in der Ausgabe-Auflösung.
    _szeneSkalaWirk() {
        if (!this.state._traa) return 1;
        const s = this.state.szeneSkala;
        const w = s == null || !Number.isFinite(+s) ? AnazhRealm.SZENE_SKALA : +s;
        return Math.max(AnazhRealm.SZENE_SKALA_MIN, Math.min(1, w));
    }

    // Post-Processing-Pipeline: EIN THREE.PostProcessing mit Bloom + Color-Grading (Sättigung + Kontrast),
    // aus TSL-Primitiven selbst gebaut (kein Vendor-Addon). Lazy nach rendererReady; bei jedem Fehler
    // postProcessingFailed=true → der Loop rendert direkt renderer.render() (nie schwarzer Schirm).
    _ensurePostProcessing() {
        if (this.state.postProcessing || this.state.postProcessingFailed) return this.state.postProcessing;
        try {
            const TSL = THREE.TSL;
            // V18.113 — der PR-#81-Vendor benennt PostProcessing → RenderPipeline um
            // (die Deprecation-Warnung in der Schöpfer-Konsole); wir nehmen den neuen
            // Namen zuerst, der alte bleibt der Fallback für ältere Vendor-Stände.
            const PPCtor =
                typeof THREE.RenderPipeline === "function"
                    ? THREE.RenderPipeline
                    : typeof THREE.PostProcessing === "function"
                      ? THREE.PostProcessing
                      : null;
            const { pass, uniform, vec2, vec3, float, luminance, mix, smoothstep, screenUV, max, min } = TSL;
            const pp = new PPCtor(this.state.renderer);
            const scenePass = pass(this.state.scene, this.state.camera);
            // DIE EINE SZENEN-SKALA (K50): der Szenen-Pass rendert in ihr, die zeitliche Auflösung löst auf die Ausgabe auf
            // (`_zeitAufloesung`). Gesetzt vor dem ersten Render; ein neuer Wert (der Regler im Menü) legt die Ziele beim
            // nächsten Frame neu an wie ein Fenster-Wechsel (`_loopRender`), nie je Last.
            scenePass.setResolutionScale(this._szeneSkalaWirk());
            this._ausgabeFormat(scenePass); // das Szenen-Ziel in rg11b10ufloat (0910-1 B), vor dem ersten Render
            this.state.scenePass = scenePass;
            // EIN Szene-Pass, eine Diät-Wahrheit: ein zweiter Szene-Pass (die Fern-Schicht) ließ Material-Diät
            // und Uniform-Updates zwischen den Pässen racen (Schwarz-Flackern); das Ferne trägt der Welt-March.
            // API-korrekt: der sampelbare Textur-Node kommt aus
            // getTextureNode() (PassNode != TextureNode — .sample() lebt am
            // TextureNode). Das ist das offizielle MRT/pass-Muster.
            let sceneColor = scenePass.getTextureNode();
            // DIE ZEITLICHE AUFLÖSUNG (TRAA, vendor/TRAANode.js = r184 verbatim) statt FXAA am Ende: die Kamera
            // springt je Frame um einen Halton-Subpixel, die Geschichte wird reprojiziert und gegen die Varianz der
            // 3×3-Nachbarschaft geklemmt — Kanten sind echt übersampelt, und die rotierende LOD-Dither-Blende
            // (uDitherT, _loopRender) mittelt sich zu einer glatten Überblendung statt eines Gitters (Befund 04.10.:
            // Birken und Büsche als gerasterte Geister; FXAA sah das Muster als Kante und ließ es stehen). Erste
            // Stufe der Kette (Studio-Gesetz phytogenesis FIX v32: zeitliche Auflösung VOR den Nachbearbeitungen):
            // Bloom, Godrays und lokaler Kontrast lesen das aufgelöste Bild. Die Bewegung je Pixel ist die
            // KAMERA-Bewegung aus der Tiefe (`_traaKameraBewegung`), keine MRT-Velocity. Kosten (04.10., echte GPU
            // Radeon 890M, 1080p, ruhig, gpu-bank 200 Frames × 12 Paare gegen FXAA): +1,1 ms je Frame (die Pass-
            // Stempel sehen nur +0,34 ms — Resolve und Geschichts-Kopie laufen teils außerhalb), VRAM +23,7 MB. Auflösung
            // und Geschichte bleiben rgba16float: alle drei in rg11b10ufloat (−23,7 MB, W7, echte GPU) posterisierten die
            // Wolken zu Höhenlinien, die Radeon rundet beim Schreiben gegen null (Sonde 1,0117 → 1,0; über die Geschichte das
            // Mittel −2…−3 % Luma) und die Ruhe halbierte sich (Frame zu Frame 0,29 → 0,58 Luma auf Armlänge) — 6 bzw. 5
            // Mantissen-Bit tragen die zeitliche Auflösung nicht. Das Szenen-Bild EINES Frames trägt sie: es liegt seit 0910-1 B
            // in rg11b10ufloat (`_ausgabeFormat`, −7,9 MB), die Rundung gleicht `_ausgabeSonde` aus. Seit K50 ist sie der
            // zeitliche HOCHSKALIERER (`_zeitAufloesung`): die Szene in der Szenen-Skala, Geschichte und Resolve in der Ausgabe.
            // Fehlt TRAANode im THREE der Seite (eine Cache-Kopie des Bootstraps von vor der zeitlichen Auflösung), bricht
            // die Kette LAUT — nie still ohne Kantenglättung, Bloom und Grading weiter.
            if (this.state._traa && typeof THREE.TRAANode !== "function") {
                this.log(
                    "Post-Kette: THREE.TRAANode fehlt — vendor/three-bootstrap.js ist eine veraltete Kopie (der ?v=-Buster folgt der Version).",
                    "ERROR"
                );
                throw new Error("THREE.TRAANode fehlt im Bootstrap");
            }
            const traa = this.state._traa
                ? this._zeitAufloesung(
                      pp,
                      sceneColor,
                      scenePass.getTextureNode("depth"),
                      this._traaKameraBewegung(TSL, scenePass.getTextureNode("depth")),
                      this.state.camera
                  )
                : null;
            if (traa) sceneColor = traa.getTextureNode();

            const u = {
                // Bloom-Schwelle 0.86: nur sehr helle Spitzen (Sonnen-Disc, Wasser-Glitzer) bloomen, nicht der
                // diffuse Himmel — sonst blutet der Blur in die Skyline und die Sonne überstrahlt Berg-Silhouetten.
                // Stärke 0.38; browser-justierbar.
                bloomThreshold: uniform(0.86),
                bloomStrength: uniform(0.38),
                bloomRadius: uniform(2.2),
                gradeSat: uniform(1.18),
                gradeContrast: uniform(1.06),
                // V17.3 — Entgrauen: desaturierte (graue) Pixel warm anheben.
                // degrayStrength = wie stark, degrayRange = bis zu welcher
                // Saettigung ein Pixel als "grau" zaehlt. Browser-justierbar.
                degrayStrength: uniform(0.35),
                degrayRange: uniform(0.16),
                // V18.377 — 0=Tag → 1=Nacht (von _dayNightApplyDirectionalLight gesetzt). Die
                // Entgrauung (warm-Lift grauer Pixel) WÄSCHT die legitim entsättigte Nacht; sie
                // fadet darum zur Nacht aus → der Mond gibt die Tiefe gerichtet, kein Lift-Filter.
                nightFactor: uniform(0),
                // V17.13 — lokaler Kontrast (Unsharp-Mask): hebt Binnen-Kontraste
                // + Kanten auf ALLEN Oberflaechen → Strukturen/Bauten wirken
                // plastisch statt pappig (Schoepfer „kaum Kontraste, basic"). Wirkt
                // global im Post-FX (kein Material angefasst → bricht keine
                // dynamischen Farben). Browser-justierbar.
                // J4-Regler „Kanten-Schärfe" — Default 0.5, persistiert via state.atmosphere.edgeSharp.
                localContrast: uniform(
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.edgeSharp)
                        ? this.state.atmosphere.edgeSharp
                        : 0.5
                ),
                // GODRAYS: additiver Screen-Space-Radial-March als NODE in DIESEM Pass (kein zweiter RenderPipeline,
                // keine MRT-Depth). `godraySun` = Sonnen-Screen-UV (pro Frame projiziert), `godrayStrength` = Pegel
                // (0 → No-op), `godrayDensity` = March-Länge, `godrayThreshold` = Himmels-Helligkeits-Schwelle (nur
                // helle Lücken bluten → Kronen-Occlusion gratis).
                godraySun: uniform(new THREE.Vector2(0.5, 0.6)),
                godrayStrength: uniform(0),
                godrayDensity: uniform(0.55),
                godrayThreshold: uniform(0.8),
                // DER AUSGLEICH DER AUSGABE-RUNDUNG (0910-1 B, `_ausgabeSonde`): je Kanal der Faktor, um den das Szenen-Bild
                // in 11/11/10 im Mittel zu dunkel ankommt — derselbe Vektor, den die Sonde setzt (1 ohne Sonde).
                ausgabeAusgleich: uniform(this.state._ausgabeAusgleich || new THREE.Vector3(1, 1, 1)),
                // DIE NACH-SCHÄRFE DER HOCHSKALIERUNG (K50): `ZEIT_SCHAERFE × (1 − Szenen-Skala)`, gestellt in `_loopRender` — bei
                // Skala 1 null (die Stufe kostet dann nichts).
                nachSchaerfe: uniform(0),
            };
            this.state.postProcessingUniforms = u;
            // V8 (Kür) — die EINE benannte Godray-Quelle (Gesetz #0): der Frame-Code (`_loopRender`)
            // + der Perf-Lever (`_nexusPerfActuate` via `_godrayScale`) lesen NUR diese Uniforms.
            this.state.godrayUniforms = {
                sunScreenPos: u.godraySun,
                strength: u.godrayStrength,
                density: u.godrayDensity,
                threshold: u.godrayThreshold,
            };

            // DIE STUFE KOSTET NUR, WENN SIE ZEIGT: eine Nachbild-Stufe mit Stärke-Regler (Godrays: Sonne im Bild ×
            // Wetter × Höhe × Regler; lokaler Kontrast: der Kanten-Schärfe-Regler, 0 = aus) rechnet ihre Abtastungen in
            // einem Zweig, den der Regler wählt — eine Uniform, also einheitlich für jedes Pixel (keine Divergenz, WGSL-
            // Gleichförmigkeit erlaubt die Abtastung darin). Bei Stärke 0 liefert sie 0 wie zuvor das Produkt mit 0, nur
            // ohne die Abtastungen: die Godrays tasteten 20× je Pixel auch ohne Sonne im Bild (06.10., GTX 1060, Mess-
            // Wiese: 0,69 ms je Frame). Die Stufe reist als Argument (der Ketten-Graph bleibt lesbar: die Zerleg-Linse
            // findet sie über ihre Stärke-Uniform, `ketteKante`); TSL erzeugt ihren Code dort, wo sie zuerst gebraucht
            // wird — im Zweig. Was davor UND im Zweig gebraucht wird (das gemischte Bild), steht vor dem Aufruf.
            // Die Wand: gate:post-kette (die Abtastungen der Stufen im erzeugten WGSL stehen im Zweig, das Budget der
            // unbedingten Abtastungen hält).
            const nurBeiStaerke = TSL.Fn(([stufe, staerke]) => {
                const aus = vec3(0, 0, 0).toVar();
                TSL.If(staerke.notEqual(float(0)), () => {
                    aus.assign(stufe);
                });
                return aus;
            });

            // --- Bloom: helle Stellen (luminance > Schwelle) isolieren, weich
            // verschmieren (9-Tap-Gauss via screenUV-Offsets), additiv zurueck
            // -> Glanz/Gluehen an Wasser/Sonne/Highlights. `bright` sampelt den
            // Szene-Textur-Node an versetzter UV. Die MITTE ist zugleich das Bild selbst (`base`): EINE Abtastung
            // trägt beide (vorher zwei an derselben Stelle — die Ausgabe-UV des Quads ist screenUV).
            // Jede Abtastung des Szenen-Bilds trägt den Ausgleich der Ausgabe-Rundung (`_ausgabeSonde`; 1 auf rgba16float).
            const bild = (uv) => sceneColor.sample(uv).rgb.mul(u.ausgabeAusgleich);
            // DIE NACH-SCHÄRFE (K50): die zeitliche Hochskalierung rekonstruiert die Ausgabe aus einer kleineren Szene, ihr Bild ist
            // um eine Spur weicher (gemessen am Ausgabe-Pfad, Gradient der Kanten). Wie jeder Hochskalierer (FSR2 RCAS, TSR) schärft
            // die Kette NACH dem Resolve — nie in die Geschichte: die Mitte gegen ihre vier Nachbarn in Ausgabe-Pixeln, geklemmt auf
            // deren Spanne (kein Saum über das Minimum und Maximum der Nachbarschaft hinaus). Stärke 0 → der Zweig fällt.
            const roh = bild(screenUV);
            const px1 = vec2(1, 1).div(TSL.screenSize);
            const schaerfeDelta = () => {
                const o = bild(screenUV.sub(vec2(float(0), px1.y)));
                const un = bild(screenUV.add(vec2(float(0), px1.y)));
                const li = bild(screenUV.sub(vec2(px1.x, float(0))));
                const re = bild(screenUV.add(vec2(px1.x, float(0))));
                const mn = min(min(min(o, un), min(li, re)), roh);
                const mx = max(max(max(o, un), max(li, re)), roh);
                const scharf = roh.add(roh.mul(4).sub(o).sub(un).sub(li).sub(re).mul(u.nachSchaerfe));
                return scharf.clamp(mn, mx).sub(roh);
            };
            const mitte = roh.add(nurBeiStaerke(schaerfeDelta(), u.nachSchaerfe));
            const bright = (uv) => {
                const c = uv === screenUV ? mitte : bild(uv);
                const l = luminance(c);
                const m = smoothstep(u.bloomThreshold, u.bloomThreshold.add(float(0.25)), l);
                return c.mul(m);
            };
            const px = float(0.0018).mul(u.bloomRadius);
            const taps = [
                [0, 0, 0.227],
                [1, 0, 0.094],
                [-1, 0, 0.094],
                [0, 1, 0.094],
                [0, -1, 0.094],
                [1, 1, 0.056],
                [-1, 1, 0.056],
                [1, -1, 0.056],
                [-1, -1, 0.056],
            ];
            let acc = bright(screenUV).mul(float(taps[0][2]));
            for (let i = 1; i < taps.length; i++) {
                const [dx, dy, w] = taps[i];
                const uvT = screenUV.add(vec2(px.mul(float(dx)), px.mul(float(dy))));
                acc = acc.add(bright(uvT).mul(float(w)));
            }
            const bloom = acc.mul(u.bloomStrength);

            // --- GODRAYS: radialer Light-Shaft-March (GPU-Gems-3). Je Pixel N feste Schritte Richtung
            // Sonnen-Screen-Position; nur sehr helle Himmels-Lücken tragen bei → Occlusion durch Blatt/Berg
            // gratis, ohne Depth-Buffer. UNROLLT (der JS-Loop akkumuliert TSL-Nodes, kein Shader-Loop); der
            // Beitrag klingt mit 0.96^i ab. Stärke 0 → der Zweig fällt, keine Abtastung (`nurBeiStaerke`).
            const GN = 20;
            const gDelta = u.godraySun.sub(screenUV); // Vektor Pixel → Sonne (Screen-UV)
            let gacc = null;
            for (let i = 0; i < GN; i++) {
                const uvI = screenUV.add(gDelta.mul(u.godrayDensity.mul(float(i / GN))));
                const cI = bild(uvI);
                const mI = smoothstep(u.godrayThreshold, u.godrayThreshold.add(float(0.2)), luminance(cI));
                const wI = Math.pow(0.96, i) * (1 / GN); // JS-Skalar-Gewicht
                const srcI = cI.mul(mI).mul(float(wI));
                gacc = gacc ? gacc.add(srcI) : srcI;
            }
            const godray = nurBeiStaerke(gacc.mul(u.godrayStrength), u.godrayStrength);

            // --- Color-Grading: Saettigung + Kontrast um 0.5 ---
            const base = mitte;
            const bloomed = base.add(bloom).add(godray);
            // V17.13 — lokaler Kontrast (Unsharp-Mask): die lokale Umgebungs-
            // Luminanz aus 4 versetzten Samples mitteln; die Differenz Pixel −
            // Umgebung verstaerkt → Binnen-Kontraste + Kanten treten hervor
            // (Strukturen/Bauten plastisch statt pappig). Wirkt global pro Pixel,
            // kein Material angefasst → dynamische Farben unberuehrt. Der Offset
            // ist etwas weiter als das Bloom-px (groebere Umgebung = Mikro-Detail).
            // Kanten-Schärfe 0 (der Regler „aus") → der Zweig fällt mit seinen 4 Abtastungen (`nurBeiStaerke`).
            const lcPx = float(0.0026);
            const lumAt = (uv) => luminance(bild(uv));
            const localAvg = lumAt(screenUV.add(vec2(lcPx, float(0.0))))
                .add(lumAt(screenUV.add(vec2(lcPx.negate(), float(0.0)))))
                .add(lumAt(screenUV.add(vec2(float(0.0), lcPx))))
                .add(lumAt(screenUV.add(vec2(float(0.0), lcPx.negate()))))
                .mul(float(0.25));
            const selfLum = luminance(bloomed);
            const detail = selfLum.sub(localAvg); // >0 heller als Umgebung (Kante/Spitze)
            const combined = bloomed.add(nurBeiStaerke(bloomed.mul(detail.mul(u.localContrast)), u.localContrast));
            const lum = luminance(combined);
            const saturated = mix(vec3(lum, lum, lum), combined, u.gradeSat);
            const contrasted = saturated.sub(float(0.5)).mul(u.gradeContrast).add(float(0.5));

            // --- Entgrauen: desaturierte Pixel (graue Türme/Wände/Felsen) werden warm verschoben, satte
            // (Himmel, Gras, Wasser) bleiben. Luminanz-erhaltend (nur Hue-Shift: R hoch, G gehalten, B runter);
            // die Sättigung steuert die Maske. Render-only, justierbar (degrayStrength/degrayRange).
            const gMax = max(max(contrasted.r, contrasted.g), contrasted.b);
            const gMin = min(min(contrasted.r, contrasted.g), contrasted.b);
            const gSat = gMax.sub(gMin);
            const greyness = smoothstep(u.degrayRange, float(0.0), gSat);
            const gLum = luminance(contrasted);
            const warm = vec3(gLum.mul(float(1.14)), gLum.mul(float(1.0)), gLum.mul(float(0.82)));
            // V18.377 — die Entgrauung fadet zur Nacht (×(1−nightFactor)) → die Nacht bleibt
            // entsättigt/dunkel (echtes Mondlicht), kein warmer Wasch-Lift mehr ins Auge.
            const degrayed = mix(contrasted, warm, greyness.mul(u.degrayStrength).mul(float(1.0).sub(u.nightFactor)));
            const graded = degrayed.max(vec3(0, 0, 0));

            // Die Ausgabe-Wandlung (ACES + sRGB) macht die Pipeline selbst im Ausgabe-Quad — keine Zwischen-Textur.
            pp.outputNode = graded;
            this.state.postProcessing = pp;
            // Die Leinwand-Tiefe stellt die Weiche in `_loopRender` (`_leinwandWeg`) je Pfad — nie der Bau.
            // Die Kette steht: ab jetzt rotiert die Dither-Blende (_loopRender liest den Knoten, nie ein Flag).
            this.state.traaNode = traa;
            this.log("Post-Processing-Pipeline gebaut (Bloom + Grading) — V17.0.", "INFO");
            return pp;
        } catch (err) {
            // der Schirm zeichnet dann direkt (nie schwarz) — aber nie still: der Bruch steht beim Namen im Log
            this.state.postProcessingFailed = true;
            this._stoffBruch("die Post-Kette (TRAA · Bloom · Grading) — der Schirm zeichnet direkt", err);
            return null;
        }
    }

    // DIE KAMERA-BEWEGUNG je Pixel für die zeitliche Auflösung — das Studio-Gesetz TAA-Lite (phytogenesis FIX v32):
    // „die Welt ist statisch, also ist Kamerabewegung EXAKT reprojezierbar (Szenentiefe + ViewProj des letzten
    // Frames); Wind/Wasser fängt der Nachbarschafts-Klemm". Ein Pixel (uv, Tiefe) im Clip-Raum dieses Frames, mal
    // R = PV_vor · PV_jetzt⁻¹ (`_traaReprojektion`, je Frame in float64 auf der CPU gefaltet — keine Welt-
    // Translation im Shader), liegt im Clip-Raum des vorigen Frames; die Differenz der NDC ist die Bewegung, die
    // TRAANode als `velocityNode.load(texel)` liest. Keine MRT-Velocity: sie schriebe je Fragment JEDES Materials
    // ein zweites Ziel und rechnete je Vertex die Vorgänger-Transformation, und ihre Objekt-Uniforms
    // (previousModelWorldMatrix) schreibt die Diät (_diaetRefresh) nur, wenn sich das Objekt ändert (equals) —
    // der ganze stehende Wald hätte die Bewegung seines letzten Refreshs getragen. Was sich selbst bewegt (Tiere, Wind),
    // fängt die Varianz-Klemme der Geschichte.
    _traaKameraBewegung(TSL, tiefe) {
        const { vec2, vec4 } = TSL;
        const R = TSL.uniform(new THREE.Matrix4());
        this.state._traaR = { R, jetzt: new THREE.Matrix4(), vor: new THREE.Matrix4(), neu: true };
        // Die Tiefen-Textur trägt [0, 1]; die NDC-Tiefe der Projektion ist es nur im WebGPU-Raum. Im WebGL2-Raum
        // (forceWebGL, gate:webgl-probe) liegt sie in [−1, 1]: z = 2·Tiefe − 1, sonst reprojiziert jeder Pixel beim
        // Laufen an die falsche Stelle (Schlieren). Die Textur-Zeilen dreht TSL je Rückend selbst (load, isFlipY).
        const webgpuRaum = this.state.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        return {
            load: (texel) => {
                const uvT = texel.div(vec2(tiefe.size()));
                const ndc = vec2(uvT.x.mul(2).sub(1), uvT.y.oneMinus().mul(2).sub(1));
                const d = tiefe.load(texel).r;
                const vor = R.mul(vec4(ndc, webgpuRaum ? d : d.mul(2).sub(1), 1));
                return ndc.sub(vor.xy.div(vor.w));
            },
        };
    }

    // Die Reprojektion des Frames: vor dem Post-Render (die Kamera trägt noch keinen TRAA-Versatz, der lebt nur
    // zwischen onBefore-/onAfterRenderPipeline), einmal je gerendertem Frame.
    _traaReprojektion() {
        const z = this.state._traaR;
        const cam = this.state.camera;
        if (!z || !cam) return;
        cam.updateMatrixWorld();
        z.vor.copy(z.jetzt);
        z.jetzt.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        if (z.neu) {
            z.vor.copy(z.jetzt);
            z.neu = false;
        }
        z.R.value.copy(z.jetzt).invert().premultiply(z.vor);
    }

    // Alle Schatten-Maps im nächsten Render neu — die EINE Markierung (Werkzeuge vor einer Aufnahme): je Licht am
    // echten Leser.
    _schattenAlleNeu() {
        const csm = this.state.csmNode;
        const dl = this.state.directionalLight;
        const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
        for (const l of lichter) if (l.shadow) l.shadow.needsUpdate = true;
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
        this._kaskadenKarten(csm);
        this._kaskadenZiele(csm);
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

    // DIE SICHT JE PASS (scene.onBeforeRender / onAfterRender): die Region-Bundles tragen ihren Cull auf `visible`
    // (three-Culling friert im Replay ein). Bis V18.528 galt das Urteil der Haupt-Kamera für JEDEN Pass: ein Bundle im
    // Blick warf in beide Kaskaden (auch 2 km weit), eines hinter dem Blick oder hinter dem Berg warf nie — auch wenn
    // sein Schatten ins Bild fiel. Jetzt liest der Hauptpass das Haupt-Urteil (_archRegionBundleCull: Frustum · Berg ·
    // Query), jeder Schatten-Pass das EIGENE: je Region die Werfer-Hülle, darin je WERFER (jedes werfende Blatt-Mesh)
    // sein Urteil nach dem EINEN Gesetz der Pass-Wahl (`_passTrifft`). Was in keiner Kaskade wirft, wirft nicht; was nur
    // im Schatten liegt, wirft. Im Schatten-Pass ist ein Region-Bundle eine Gruppe: ein Render unter dem Override-Stoff
    // sammelt keine Bundles (die Bundle-Wahrheit am Chokepoint `_renderScene`), three projiziert seine Kinder frisch — die
    // Wahl hier wirkt je Pass. Jeder Haken beginnt mit der Rückkehr (abgewählte Werfer sichtbar, Haupt-Urteil) — auch nach
    // einem Abbruch, und VOR der Kaskaden-Box (sie misst den ganzen Bestand). Der Stamm kompiliert nie neben dem Render (kein
    // r184-compileAsync, das den Vorher-Haken ohne den Nachher-Haken riefe — die Erst-Zeichnung, `_configureRenderer`).
    _passSicht(kamera, nach) {
        const S = this._kaskadenSchmier();
        this._passSichtZurueck(S);
        // Der Haupt-Pass stellt die Kaskaden: sein Haken läuft nach der Kamera-Matrix und VOR jedem Schatten-Pass
        // dieses Frames (die Karten rendern im Knoten-updateBefore seiner Objekte) — Loop, Sonde und Zähler gleich.
        const csm = this.state.csmNode;
        if (!nach && csm && csm.camera && kamera === csm.camera) this._kaskadenPassen(csm);
        const k = nach ? -1 : this._schattenKameraIndex(kamera);
        // Die Lage des Passes: EINE Rechnung je Pass (Frustum der Pass-Kamera, Auge, Kaskaden-Scheibe, Blende), jeder Leser
        // urteilt mit ihr nach dem EINEN Gesetz. Die Matrix der Wahl trägt den Versatz der zeitlichen Auflösung NICHT (TRAA
        // verschiebt die Projektion je Frame um einen halben Pixel, die Elemente 8 und 9 einer Perspektive — den Rand dafür
        // trägt `sichtRand`): dieselbe Lage wählt in jedem Frame dasselbe, die gehaltene Wahl ist die frische (Welle C).
        // Die Höhlen-Sicht liest ihre Schirm-Rechtecke aus S.m: perspektivisch um den Dreh-Rand geweitet (`_passMatrixWeit`),
        // damit ihre Wahl über eine kleine Drehung hält wie das Gesetz (`drehRand`).
        if (!nach) {
            S.m.copy(kamera.projectionMatrix);
            if (kamera.isPerspectiveCamera === true) S.m.elements[8] = S.m.elements[9] = 0;
            S.m.multiply(kamera.matrixWorldInverse);
            S.frustum.setFromProjectionMatrix(S.m, kamera.coordinateSystem);
            if (kamera.isPerspectiveCamera === true) this._passMatrixWeit(S.m, kamera, AnazhRealm.PASS_WAHL.drehRand);
            this._passWahlLage(S, kamera, k);
        }
        const L = S.lage;
        // Die Instanz-Wahl: die Gruppen der Wahl (Baum- und Strauch-Stufen, die Karten) zeichnen in diesem Pass nur ihre
        // gewählten Instanzen, danach wieder alle.
        if (nach) {
            if (kamera === this.state.camera) this._instanzWahlZurueck(S.wahlHaupt);
            else if (this._schattenKameraIndex(kamera) >= 0) this._instanzWahlZurueck(S.wahlSchatten);
        } else if (k >= 0) this._instanzWahlPass("schatten", S);
        else if (kamera === this.state.camera) this._instanzWahlPass("haupt", S);
        // Die Sätze (Boden · Wasser · Bau · Streu) wählen ihren Abschnitt nach demselben Gesetz.
        this._chunkSatzPass(kamera, nach, k, S);
        // Die Nah-Wiese legt ihren Satz für das Auge dieses Passes (eine Kaskade sieht sie nie: sie wirft nicht).
        if (!nach && k < 0) this._nahWieseSicht(kamera, L);
        const map = this.state._regionBundles;
        if (!map || map.size === 0) return;
        if (k < 0) {
            for (const bg of map.values()) {
                const s = bg.userData._sichtHaupt;
                if (s !== undefined) bg.visible = s;
            }
            return;
        }
        const n = this._werferWahlPass(map, L, S.ab);
        const z = this._werferZensus || (this._werferZensus = []);
        z[k] = { werfer: n, bundles: map.size, abgewaehlt: S.ab.length };
    }

    // Die Werfer-Wahl eines Schatten-Passes: je Region-Bundle die Werfer-Hülle, darin je werfendes Blatt-Mesh (`_werferKind`,
    // frisch aus der Hülle dieses Takts) — beide nach dem EINEN Gesetz (`_passTrifftBox`); was nicht trifft, ruht für diesen
    // Pass (`ab` merkt es für die Rückkehr). Rückgabe: die Zahl der werfenden Bundles.
    _werferWahlPass(map, L, ab) {
        let n = 0;
        for (const bg of map.values()) {
            const h = this._bundleWerferHuelle(bg);
            const vis = h !== null && this._passTrifftBox(L, h, 0);
            bg.visible = vis;
            if (!vis) continue;
            n++;
            this._werferWahl(bg, L, ab);
        }
        return n;
    }

    _werferWahl(o, L, ab) {
        const kinder = o.children;
        for (let i = 0; i < kinder.length; i++) {
            const c = kinder[i];
            if (c.visible === false) continue;
            // eine Senke ist ein Blatt: ihr einziges Kind ist ihr Zeichner (1410-1), er fällt mit ihr
            const blatt = c.children.length === 0 || (c.__zeichner !== undefined && c.children.length === 1);
            if (c.isMesh === true && c.castShadow === true && blatt) {
                const b = c.userData._werferKind;
                if (!b || b.isEmpty() || !this._passTrifftBox(L, b, 0)) {
                    c.visible = false;
                    ab.push(c);
                }
                continue;
            }
            if (c.children.length > 0) this._werferWahl(c, L, ab);
        }
    }

    _passSichtZurueck(S) {
        for (let i = 0; i < S.ab.length; i++) S.ab[i].visible = true;
        S.ab.length = 0;
    }

    // DAS GESETZ DER PASS-WAHL (W7-Vereinigung). Bis hier wählten im selben Haken drei Wege: die Sätze und die Werfer der
    // Region-Bündel nach ihrer Box gegen das Frustum der Pass-Kamera, die Pflanzen-Stufen nach Kugel, Licht-Kapsel und
    // Fenster (`_instanzWahlPass`), die Karten als Senken-Kopie ihrer Sicht. Befund (echte GPU, Mess-Wiese, Band in Ruhe,
    // Blick yaw −0,88): die Box der fernen Kaskade — ein Licht-Raum-Quader — umschließt bei schrägem Blick den nahen Boden,
    // boden k1 173 784 Dreiecke über der Ratsche 90 845: dieselbe Klasse, die die Kapsel für die Bäume schon schnitt, im
    // Nachbar-Leser offen. Jetzt urteilt EIN Gesetz über jeden Körper jedes Passes — die Zelle eines Satzes, den Werfer eines
    // Bündels, die Instanz einer Gruppe der Wahl (Baum, Strauch, Karte), das Büschel der Nah-Wiese. Der Körper ist eine
    // BOX MIT SAUM (Mitte c, Halb-Ausdehnung h je Achse, Saum-Radius r: h = 0 ist die Kugel, r = 0 die Box). Er zeichnet, wenn
    // (1) er das Frustum der Pass-Kamera schneidet — je Ebene der Stütz-Abstand n·c + d + |n|·h + r, dazu der Rand
    // `sichtRand` je Meter Abstand zum Auge (ein Satz, der seine Wahl über Frames hält, sieht den Versatz der zeitlichen
    // Auflösung nicht) — und (2) im Kaskaden-Pass seine LICHT-KAPSEL, der Körper entlang des Lichts bis ganz unter die Box
    // der Kaskade, die Scheibe dieser Kaskade trifft (`fit.ebenen`, um `saum` geweitet): ein Werfer, dessen Schatten auf
    // keinen Empfänger der Scheibe fällt, wirft dort nicht. Für eine Ebene ist der gefegte Körper die Hülle seiner beiden
    // Enden — liegen beide jenseits, liegt der ganze Weg jenseits.
    _passWahlLage(S, kamera, k) {
        const L =
            S.lage ||
            (S.lage = {
                fr: null,
                ax: 0,
                ay: 0,
                az: 0,
                rand: 0,
                fit: null,
                dir: null,
                v: new THREE.Vector3(),
                an: false,
                ex: 0,
                ez: 0,
                perf: 1,
                ref: 1,
                kanten: null,
                halt: 0,
                dreh: 0,
                licht: 0,
                gen: 0,
                key: "",
            });
        const we = kamera.matrixWorld.elements;
        const PW = AnazhRealm.PASS_WAHL;
        L.fr = S.frustum;
        L.ax = we[12];
        L.ay = we[13];
        L.az = we[14];
        L.rand = PW.sichtRand;
        // der Halt (`_passLageGen`): die Ebenen und das Auge wandern um höchstens haltM, der Rand je Meter mit dem Auge
        L.halt = PW.haltM * (1 + PW.sichtRand);
        // der Dreh-Rand: eine Perspektive wählt mit `drehRand` (je Meter Abstand der Sinus) und hält bis zur Hälfte (`_wahlHaelt`)
        L.dreh = kamera.isPerspectiveCamera === true ? Math.sin(PW.drehRand) : 0;
        // Die Scheibe gilt nur dem Pass ihrer Kaskaden-Kamera (die Box beim letzten Rendern dieser Kaskade, `_kaskadeFit`).
        const csm = this.state.csmNode;
        const lw = k >= 0 && csm && csm.lights ? csm.lights[k] : null;
        const fit = lw && lw.shadow && lw.shadow.camera === kamera && csm._anazhFit ? csm._anazhFit[k] : null;
        L.fit = fit && fit.ebenen ? fit : null;
        L.dir = S.dir;
        // DER LICHT-RAND (`lichtRandTexel`): eine Kaskade wählt mit einem Saum von so vielen Texeln ihrer Karte — ihre Wahl
        // hält über die Stufen der Sonne, solange die Drehung des Lichts seit der Wahl jeden Schatten um weniger als die
        // Hälfte davon verschiebt (`_passLageHaelt`); die gehaltene Lage wählt mit dem Rand ihres Ankers weiter
        L.licht = L.fit ? PW.lichtRandTexel * L.fit.texelMin : 0;
        // DIE BLENDE: die LIVE-Uniforms, die jede Maske liest (dasselbe Auge, derselbe Perf-Streck), und die Kanten des
        // Fensters aus dem EINEN Blend-Gesetz (`_blendeKanten`, je Band-Satz einmal).
        const lu = this.state.lodUniforms;
        L.an = !!(lu && lu.uLodMaskOn && lu.uLodMaskOn.value > 0.5 && lu.uLodAuge && lu.uLodPerf);
        if (L.an) {
            L.ex = lu.uLodAuge.value.x;
            L.ez = lu.uLodAuge.value.z;
            L.perf = lu.uLodPerf.value;
            L.ref = lu.uLodRef.value;
            const d0 = lu.uLodD0.value,
                d1 = lu.uLodD1.value,
                fade = lu.uLodFade.value,
                fade0 = lu.uLodFade0.value;
            let K = this._blendeK;
            if (!K || K.d0 !== d0 || K.d1 !== d1 || K.fade !== fade || K.fade0 !== fade0) {
                const pc = globalThis.__phytoCore;
                if (!pc || typeof pc.lodCrossfadeMask !== "function")
                    throw new Error(
                        "_passWahlLage: __phytoCore.lodCrossfadeMask fehlt — ohne das Blend-Gesetz kein Fenster"
                    );
                K = this._blendeK = AnazhRealm._blendeKanten(pc.lodCrossfadeMask, d0, d1, fade, fade0);
            }
            L.kanten = K;
        }
        this._passLageGen(L, kamera, k);
        return L;
    }

    // Die Matrix einer Perspektive ohne den Versatz der zeitlichen Auflösung, ihr Sichtfeld je Halbwinkel um 1,5 × `dreh`
    // geweitet: jeder Strahl, den eine um höchstens `dreh` gedrehte Kamera sieht, liegt darin (der Abstand eines Strahls zur
    // Seiten-Ebene wächst um höchstens `dreh`, sein Winkel in der Bild-Achse um höchstens dreh / cos(Höhe) — an den Ecken
    // eines 75°-Bilds 16:9 das 1,1-Fache).
    _passMatrixWeit(aus, kamera, dreh) {
        aus.copy(kamera.projectionMatrix);
        const e = aus.elements;
        e[8] = e[9] = 0;
        const zu = 1.5 * dreh;
        e[0] = 1 / Math.tan(Math.atan(1 / e[0]) + zu);
        e[5] = 1 / Math.tan(Math.atan(1 / e[5]) + zu);
        return aus.multiply(kamera.matrixWorldInverse);
    }

    // DIE LAGE STEHT (Welle C, Lehre 25 — der Takt kostet, was ihn betrifft). Befund 06.10. (OMEN, GTX 1060 + i7-8750H, CPU-
    // Profil, Regler voll, Blick gepinnt, Mess-Wiese): die Sicht je Pass kostete ~6 ms CPU je Frame — jeder Pass rechnete
    // jeden Frame jede Wahl neu (Abschnitte, Höhlen-Sicht, Instanzen), auch wenn nichts sich bewegte; an der echten GPU
    // (Mess-Wiese, Ruhe) 11 231 Körper-Prüfungen, 22 174 Ecken und 70 kB Index je Frame. Jeder Pass trägt darum die
    // GENERATION seiner Lage (`L.gen`): sie bleibt, solange die Lage steht — und jeder Leser (die Sätze `_satzAbschnittSteht`,
    // die Instanz-Wahl `_instanzWahlSteht`, die Nah-Wiese) behält seine Wahl, solange ihre Generation und sein eigener Stand
    // gleich sind. Die Lage ist, was jedes Urteil liest: die sechs Ebenen des Frustums OHNE den Versatz der zeitlichen
    // Auflösung (TRAA verschiebt die Projektion je Frame um einen halben Pixel, die Elemente 8 und 9 einer Perspektive — den
    // Rand dafür trägt `sichtRand`), das Auge, die Drehung der Kamera (die Licht-Kacheln der Höhlen-Sicht lesen sie), im
    // Kaskaden-Pass die Wahl-Scheibe (`fit.ebenen`, `zb`, `saum`, die Licht-Basis) und das Licht, dazu die Blende (Auge der
    // Maske, Perf-Streck, Bezug, die Kanten des Blend-Gesetzes). Sie STEHT gegen den Anker der letzten Wahl dieses Passes
    // (haupt · k<i> · anders), solange jede Richtung gleich ist (bis auf die Rundung, 1e-9) und jeder Ort — das Auge, jede
    // Ebene, der Boden der Kaskaden-Box — um höchstens `haltM` gewandert ist: das Auge der Spiel-Kamera atmet im Stand um
    // Millimeter, die Kaskaden-Box steigt mit ihm. Den Halt trägt das Gesetz als Rand (`L.halt` in `_passTrifft`). Eine
    // ORTHOGONALE Kamera (die Kaskade) wandert dazu frei entlang ihrer Achse: ihre nahe Ebene steht über dem höchsten Werfer
    // der Box (`_kaskadenWerferOben` — ein laufendes Tier hebt und senkt sie je Render um Meter, gemessen 06.10., k1 bis 30 m),
    // und kein Körper, den ein Leser wählt, liegt darüber; Auge und nahe Ebene zählen darum nur quer zur Achse. Solange die Lage
    // steht, urteilt jeder Leser vom Auge des Ankers (`L.ax`…) — der Rand je Meter ist der, mit dem die gehaltene Wahl fiel.
    _passLageGen(L, kamera, k) {
        const N = 89;
        const key = k >= 0 ? "k" + k : kamera === this.state.camera ? "haupt" : "anders";
        const M = this._passLagen || (this._passLagen = new Map());
        let a = M.get(key);
        if (!a) M.set(key, (a = { sig: new Float64Array(N), gen: 0, kamera: -1, ax: 0, ay: 0, az: 0, wegMax: 0 }));
        const s = this._passLageSig || (this._passLageSig = new Float64Array(N));
        const we = kamera.matrixWorld.elements;
        // die Achse einer orthogonalen Kamera (sie blickt entlang −z ihrer Welt-Matrix)
        const ortho = kamera.isOrthographicCamera === true;
        let fx = 0,
            fy = 0,
            fz = 0;
        if (ortho) {
            const l = Math.hypot(we[8], we[9], we[10]) || 1;
            fx = -we[8] / l;
            fy = -we[9] / l;
            fz = -we[10] / l;
        }
        const t = we[12] * fx + we[13] * fy + we[14] * fz;
        s[0] = we[12] - t * fx;
        s[1] = we[13] - t * fy;
        s[2] = we[14] - t * fz;
        // das Frustum des Passes (`_passSicht` legt es ohne den Versatz der zeitlichen Auflösung)
        const F = L.fr;
        const ebene = (P, o) => {
            s[o] = P.normal.x;
            s[o + 1] = P.normal.y;
            s[o + 2] = P.normal.z;
            s[o + 3] = P.constant;
        };
        // perspektivisch: die Projektion ohne Versatz (ihre Ebenen drehen mit der Kamera — die Drehung zählt als Winkel,
        // s[84] = 1); orthogonal: die Ebenen, ohne die nahe
        s[84] = ortho ? 0 : 1;
        if (!ortho) {
            const pe = kamera.projectionMatrix.elements;
            for (let i = 0; i < 24; i++) s[3 + i] = i < 16 && i !== 8 && i !== 9 ? pe[i] : 0;
        } else
            for (let p = 0; p < 6; p++) {
                const P = F.planes[p];
                ebene(P, 3 + 4 * p);
                // die nahe Ebene der orthogonalen Kamera (ihre Normale zeigt entlang der Achse) zählt nicht
                if (P.normal.x * fx + P.normal.y * fy + P.normal.z * fz > 0.99) s[6 + 4 * p] = 0;
            }
        const f = L.fit;
        s[27] = f ? 1 : 0;
        for (let p = 0; p < 6; p++)
            if (f) ebene(f.ebenen[p], 28 + 4 * p);
            else s[28 + 4 * p] = s[29 + 4 * p] = s[30 + 4 * p] = s[31 + 4 * p] = 0;
        const R = [0, 1, 2, 4, 5, 6, 8, 9, 10];
        const bi = f ? f.basisInv.elements : null;
        s[52] = f ? f.zb : 0;
        s[53] = f ? f.saum : 0;
        for (let i = 0; i < 9; i++) {
            s[54 + i] = bi ? bi[R[i]] : 0;
            s[75 + i] = we[R[i]];
        }
        // das Licht liest nur die Licht-Kapsel des Kaskaden-Passes (das Hauptbild wählt ohne Scheibe)
        const d = f ? L.dir : null;
        s[63] = d ? d.x : 0;
        s[64] = d ? d.y : 0;
        s[65] = d ? d.z : 0;
        const K = L.an ? L.kanten : null;
        s[66] = L.an ? 1 : 0;
        s[67] = L.an ? L.ex : 0;
        s[68] = L.an ? L.ez : 0;
        s[69] = L.an ? L.perf : 0;
        s[70] = L.an ? L.ref : 0;
        s[71] = K ? K.d0 : 0;
        s[72] = K ? K.d1 : 0;
        s[73] = K ? K.fade : 0;
        s[74] = K ? K.fade0 : 0;
        // die Kaskade unter der laufenden Sonne: ihr Licht-Rand, der längste Licht-Weg ihrer Box, das Höhenband ihrer Empfänger
        s[85] = L.licht;
        s[86] = f ? f.weg : 0;
        s[87] = f ? f.band0 : 0;
        s[88] = f ? f.band1 : 0;
        if (a.gen > 0 && a.kamera === kamera.id && this._passLageHaelt(a.sig, s, a)) {
            L.gen = a.gen;
            L.key = key;
            L.ax = a.ax;
            L.ay = a.ay;
            L.az = a.az;
            // das Auge der Blende hält wie das Auge der Kamera: jeder Leser urteilt vom Auge des Ankers
            L.ex = a.sig[67];
            L.ez = a.sig[68];
            L.licht = a.sig[85];
            if (s[86] > a.wegMax) a.wegMax = s[86];
            return false;
        }
        a.sig.set(s);
        a.kamera = kamera.id;
        a.ax = L.ax;
        a.ay = L.ay;
        a.az = L.az;
        a.wegMax = s[86];
        a.gen = this._passLageZahl = (this._passLageZahl || 0) + 1;
        L.gen = a.gen;
        L.key = key;
        return true;
    }

    // DAS GESETZ DES HALTS (Welle C): eine Wahl, die mit einem Rand fiel, hält, solange ihre Drehung seit dem Anker — mal dem
    // Hebel, mit dem sie am Rand wirkt — die HÄLFTE dieses Rands nicht überschreitet. Jede Wahl unter der gehaltenen Lage (der
    // Anker und jeder Leser, der mitten in ihr neu wählt: ein Satz mit neuem Stand, eine Gruppe mit neuen Slots) urteilt vom
    // Blick ihres Frames und liegt höchstens den halben Rand vom Anker, gegen die jetzige Lage also höchstens den ganzen —
    // den ihr Rand trägt. Die Kamera dreht mit dem Hebel 1 gegen ihren Dreh-Rand (`drehRand`, Bogenmaß), das Licht mit dem
    // längsten Licht-Weg gegen seinen Licht-Rand (Meter), jeder Ort der Lage (Auge, Ebenen, Band) gegen den Halt `haltM`. Gemessen 07.10. (gate:sicht-arbeit (D), Mess-Wiese): hielt die
    // Kamera bis zum ganzen Rand, fielen nach einer Neu-Wahl mitten in der Drehung 12 Zellen und Instanzen am Bildrand weg.
    _wahlHaelt(dreh, hebel, rand) {
        return dreh * hebel <= rand / 2;
    }

    // Hält die Lage `s` gegen ihren Anker `a` (Aufbau `_passLageGen`)? Orte (das Auge, die Konstanten der Ebenen, der Boden
    // der Kaskaden-Box, das Auge der Blende — `_blendeHaelt`) um höchstens den halben Halt (`_wahlHaelt` gegen haltM), Richtungen bis auf die Rundung — eine Perspektive: ihre Projektion gleich, ihre
    // Drehung (der Winkel zwischen Anker und Kamera, cos = (Spur(R0ᵀ·R) − 1) / 2) nach dem Gesetz des Halts gegen den
    // Dreh-Rand (`_wahlHaelt`) —, alles andere gleich; eine Kaskade mit Box über die Stufen der Sonne nach ihrem Licht-Rand
    // (unten), nach demselben Gesetz.
    _passLageHaelt(a, s, anker) {
        const PW = AnazhRealm.PASS_WAHL;
        const H = PW.haltM;
        // jeder Ort hält nach dem Gesetz des Halts: höchstens den halben Halt vom Anker (`_wahlHaelt`)
        const steht = (d) => this._wahlHaelt(d, 1, H);
        if (s[84] !== a[84] || s[27] !== a[27]) return false;
        // DIE KASKADE UNTER DER LAUFENDEN SONNE (orthogonal, mit Box): ihre echten Werfer bestimmen die Empfänger (die
        // Wahl-Scheibe und ihr Höhenband) und das Licht — Box, Auge und Licht-Basis legt der Fit aus ihnen. Die Lage hält,
        // solange die Empfänger stehen (die Scheibe um haltM, das Band um haltM, Saum und Blende gleich) und die Drehung des
        // Lichts seit dem Anker, mal dem längsten Licht-Weg seit dem Anker (`wegMax`), unter dem halben Licht-Rand bleibt:
        // ein echter Werfer liegt quer zum Licht so nah an seinem Empfänger in der Box wie Drehung × Weg, und jede Wahl unter
        // dieser Lage (der Anker, ein Satz mit neuem Stand dazwischen) lag selbst höchstens den halben Rand vom Anker —
        // gegen die jetzige Lage also höchstens den ganzen.
        if (s[84] === 0 && s[27] === 1) {
            for (let o = 28; o < 52; o += 4) {
                if (!steht(Math.abs(s[o + 3] - a[o + 3]))) return false;
                for (let j = 0; j < 3; j++) if (!(Math.abs(s[o + j] - a[o + j]) <= 1e-9)) return false;
            }
            if (s[53] !== a[53] || !steht(Math.abs(s[87] - a[87])) || !steht(Math.abs(s[88] - a[88]))) return false;
            if (!this._blendeHaelt(a, s)) return false;
            const cx = a[64] * s[65] - a[65] * s[64],
                cy = a[65] * s[63] - a[63] * s[65],
                cz = a[63] * s[64] - a[64] * s[63];
            const dreh = Math.atan2(
                Math.sqrt(cx * cx + cy * cy + cz * cz),
                a[63] * s[63] + a[64] * s[64] + a[65] * s[65]
            );
            return this._wahlHaelt(dreh, Math.max(anker.wegMax, s[86]), a[85]);
        }
        const dx = s[0] - a[0],
            dy = s[1] - a[1],
            dz = s[2] - a[2];
        if (!steht(Math.sqrt(dx * dx + dy * dy + dz * dz))) return false;
        const persp = s[84] === 1;
        // perspektivisch die Projektion (3…26), orthogonal die Ebenen des Frustums; dazu die Wahl-Scheibe (28…51) — die
        // Richtung bis auf die Rundung, die Konstante um haltM
        if (persp) for (let i = 3; i < 27; i++) if (s[i] !== a[i]) return false;
        for (let p = persp ? 6 : 0; p < 12; p++) {
            const o = p < 6 ? 3 + 4 * p : 28 + 4 * (p - 6);
            if (!steht(Math.abs(s[o + 3] - a[o + 3]))) return false;
            for (let j = 0; j < 3; j++) if (!(Math.abs(s[o + j] - a[o + j]) <= 1e-9)) return false;
        }
        if (!steht(Math.abs(s[52] - a[52])) || s[53] !== a[53]) return false;
        // die Richtungen: die Licht-Basis (54…62), das Licht (63…65), die Drehung der Kamera (75…83)
        for (let i = 54; i < 66; i++) if (!(Math.abs(s[i] - a[i]) <= 1e-9)) return false;
        if (persp) {
            let spur = 0;
            for (let i = 75; i < 84; i++) spur += s[i] * a[i];
            const dreh = Math.acos(Math.max(-1, Math.min(1, (spur - 1) / 2)));
            if (!this._wahlHaelt(dreh, 1, PW.drehRand)) return false;
        } else for (let i = 75; i < 84; i++) if (!(Math.abs(s[i] - a[i]) <= 1e-9)) return false;
        return this._blendeHaelt(a, s);
    }

    // HÄLT DIE BLENDE (66…74) gegen ihren Anker? Ihr Auge (das Auge jeder Maske, `uLodAuge` in XZ — 67, 68) ist ein Ort der
    // Lage wie das Auge der Kamera: es hält nach dem Gesetz des Halts, höchstens den halben Halt vom Anker (`_wahlHaelt` gegen
    // haltM); an, Perf-Streck, Bezug und die Kanten des Blend-Gesetzes gleich. Das Fenster jeder Wahl trägt den Halt als
    // Rand (`_instanzFenster`), und unter der gehaltenen Lage urteilt jeder Leser vom Auge des Ankers (`_passLageGen`).
    // Gegenprüfung 07.10.: der Vergleich war exakt — eine zweite Signatur neben dem Halt-Gesetz; atmete das Auge ±1 mm
    // quer (die Kamera hielt), wählte jeder Pass in jedem Frame jede Wahl neu (gate:sicht-arbeit, atmendes Auge: 14 999
    // Prüfungen je Frame).
    _blendeHaelt(a, s) {
        if (s[66] !== a[66]) return false;
        if (!this._wahlHaelt(Math.hypot(s[67] - a[67], s[68] - a[68]), 1, AnazhRealm.PASS_WAHL.haltM)) return false;
        for (let i = 69; i < 75; i++) if (s[i] !== a[i]) return false;
        return true;
    }

    // Das Urteil über einen Körper (Box mit Saum: Mitte cx/cy/cz, Halb-Ausdehnung hx/hy/hz, Saum-Radius r) in der Lage L.
    _passTrifft(L, cx, cy, cz, hx, hy, hz, r) {
        const ax = cx - L.ax,
            ay = cy - L.ay,
            az = cz - L.az;
        // der Saum, der Rand je Meter Abstand zum Auge (die zeitliche Auflösung und die Drehung, über die die Lage hält), der
        // Halt der Lage (`_passLageGen`) und der Licht-Rand einer Kaskade (die Stufen der Sonne, über die ihre Wahl hält)
        const rr = r + L.halt + L.licht + (L.rand + L.dreh) * Math.sqrt(ax * ax + ay * ay + az * az);
        const E = L.fr.planes;
        for (let p = 0; p < 6; p++) {
            const n = E[p].normal;
            const nx = n.x,
                ny = n.y,
                nz = n.z;
            const st = (nx < 0 ? -nx : nx) * hx + (ny < 0 ? -ny : ny) * hy + (nz < 0 ? -nz : nz) * hz + rr;
            if (nx * cx + ny * cy + nz * cz + E[p].constant < -st) return false;
        }
        const f = L.fit;
        if (!f) return true;
        // Die Licht-Kapsel: der Körper wandert entlang des Lichts (`dir`), bis er ganz unter der Box liegt (Licht-z < zb).
        const d = L.dir;
        const sl = (d.x < 0 ? -d.x : d.x) * hx + (d.y < 0 ? -d.y : d.y) * hy + (d.z < 0 ? -d.z : d.z) * hz + r;
        const v = L.v.set(cx, cy, cz).applyMatrix4(f.basisInv);
        const t = Math.max(0, v.z - f.zb + sl);
        const ex = cx + d.x * t,
            ey = cy + d.y * t,
            ez = cz + d.z * t;
        for (let j = 0; j < f.ebenen.length; j++) {
            const P = f.ebenen[j];
            const n = P.normal;
            const nx = n.x,
                ny = n.y,
                nz = n.z;
            // die Scheibe hält um haltM, der Boden der Box (das Ende der Kapsel) ebenso: zweimal der Halt; dreht das Licht,
            // wandert das Ende der Kapsel um höchstens den Licht-Rand
            const st =
                (nx < 0 ? -nx : nx) * hx +
                (ny < 0 ? -ny : ny) * hy +
                (nz < 0 ? -nz : nz) * hz +
                r +
                f.saum +
                2 * L.halt +
                L.licht;
            if (nx * cx + ny * cy + nz * cz + P.constant < -st && nx * ex + ny * ey + nz * ez + P.constant < -st)
                return false;
        }
        return true;
    }

    // Eine Box (Box3) als Körper des Gesetzes, `r` = ihr Rand.
    _passTrifftBox(L, b, r) {
        const mn = b.min,
            mx = b.max;
        return this._passTrifft(
            L,
            (mn.x + mx.x) * 0.5,
            (mn.y + mx.y) * 0.5,
            (mn.z + mx.z) * 0.5,
            (mx.x - mn.x) * 0.5,
            (mx.y - mn.y) * 0.5,
            (mx.z - mn.z) * 0.5,
            r
        );
    }

    // DIE INSTANZ-WAHL JE PASS (Welle 7). Befund 06.10. (echte GPU, Mess-Wiese, Band in Ruhe, fester Blick): die Baum-
    // Gruppen sind global (eine Instanz-Gruppe je Art × Gestalt × Stufe × Teil, ein Befehl je Pass), und jeder Pass zog JEDE
    // Instanz — das Hauptbild 380k Baum-Dreiecke, davon im Blick 251k (yaw 0) bzw. 164k (yaw −0,88); jede Kaskade jeden
    // Zwilling (k0 182k, k1 blickabhängig 14k oder 182k); und die Stufen-Bänder der CPU (Hysterese ±3,4 m AUSSERHALB der
    // Dither-Fenster) hielten Stufen, deren Maske vom Auge alles verwirft (eine L0 jenseits d0 kostet 17k Dreiecke je Tanne
    // und zeigt nichts). Ebenso die EINE Atlas-Gruppe der Karten: im @global-Bündel zeichnete sie jede Karte des Rings (1 889
    // Karten bis 385 m, ein Drittel im Blick) — sie ist eine Gruppe der Wahl wie jede Pflanzen-Stufe (W7-Vereinigung: ihre
    // Senken-Kopie je Sicht fiel). Jeder Pass wählt: die Gruppe ordnet ihre Slots (`_archGroupTausch`), die gewählten vorn,
    // und zeichnet nur sie (`count` über `_instanzZahl`); nach dem Pass zählt sie wieder alle (die Slot-Wahrheit: count =
    // liveCount außerhalb jedes Passes). Gewählt ist, was (1) das EINE Gesetz der Pass-Wahl trifft (`_passTrifft`: Kugel der
    // Instanz gegen das Frustum, im Schatten-Pass ihre Licht-Kapsel gegen die Scheibe) und (2) dessen Stufen-Maske vom Auge
    // etwas behält (`_instanzFenster` — nur, wenn der Stoff die Maske trägt). Eine Gruppe zeichnet in genau EINER Pass-Art
    // (`_instanzWahlArt`): so schreibt kein Pass die Puffer eines anderen, auch nicht der Kaskaden-Pass mitten im
    // Hauptbild. Das Hauptbild nimmt sein Bündel neu auf, wenn die Wahl sich ändert (Zahl oder Ordnung); die Kaskaden
    // zeichnen Bündel-Kinder direkt.
    _instanzWahlPass(art, S) {
        const set = this._instanzWahlGruppen();
        const liste = art === "haupt" ? S.wahlHaupt : S.wahlSchatten;
        if (liste.length) this._instanzWahlZurueck(liste); // ein Pass ohne Nachher-Haken (Abbruch) hinterlässt nichts
        if (set.size === 0) return;
        const L = S.lage;
        for (const g of set) {
            if (g.wahl !== art) continue;
            const m = g.mesh;
            const n = g.liveCount | 0;
            if (!m || n === 0 || m.visible === false) {
                // Eine leere oder verborgene Gruppe zeichnet in diesem Pass nichts: ihre gehaltene Wahl fällt mit (die
                // nächste sichtbare Belegung wählt neu). Sonst hielt sie die Marke eines freigegebenen Slots — CI 07.10.,
                // gate:sicht-arbeit (I): der Stufen-Wechsel einer einzelnen Erle 1→0 leerte f:weide|1|1:0#S, k0 und k1
                // hielten Slot −1.
                if (g._wahlJe && L) g._wahlJe.delete(L.key);
                continue;
            }
            // die Wahl steht (Welle C): die Gruppe liegt (wieder), wie dieser Pass sie zuletzt ordnete
            if (this._instanzWahlSteht(g, L)) {
                AnazhRealm._instanzZahl(m, g._wahlJe.get(L.key).refs.length);
                liste.push(g);
                continue;
            }
            const fenster = L.an && this._instanzFensterGilt(g);
            let kk = 0,
                tausch = 0;
            for (let i = 0; i < n; i++) {
                if (!this._instanzBehalten(g, i, L, fenster)) continue;
                if (i !== kk) {
                    this._archGroupTausch(g, i, kk);
                    tausch++;
                }
                kk++;
            }
            AnazhRealm._instanzZahl(m, kk);
            liste.push(g);
            if (art === "haupt" && (tausch > 0 || g._wahlZahl !== kk)) this._archMeshBundleTouch(m);
            if (art === "haupt") g._wahlZahl = kk;
            this._instanzWahlMerke(g, L, kk);
        }
    }

    // STEHT die Wahl einer Gruppe (Welle C)? Dieser Pass (`L.key`: haupt · k<i>) wählte sie zuletzt in derselben Lage
    // (`L.gen`), ihr SLOT-STAND ist der, den er dabei merkte (`_instanzSlotStand`), und Geometrie, Stoff und Zahl sind dieselben.
    // Eine Schatten-Gruppe ordnen BEIDE Kaskaden eines Frames (ein Puffer, zwei Präfixe): hat die andere sie umgeordnet, rücken
    // die gemerkten Instanzen dieses Passes (ihre Slot-Marken, `slotRef`) wieder nach vorn — ein Tausch je verschobene, keine
    // Prüfung. Gegenprüfung 07.10.: bis hier merkte die GRUPPE die Version ihrer Slots nach der letzten Wahl (`_wahlVer`) —
    // ordnete k0 nach einem fremden Schreiber neu (der Stufen-Wechsel eines Baums: Freigeben + Belegen, die Zahl bleibt), fand
    // k1 alles gleich und hielt ihre alten Marken, darunter eine freigegebene (Slot −1): der Tausch schrieb NaN in einen
    // lebenden Slot und warf in jedem Frame dieser Kaskade (gate:sicht-arbeit (I): 2 Würfe, 2 NaN-Slots, 1 fehlender Werfer).
    _instanzWahlSteht(g, L) {
        const w = g._wahlJe ? g._wahlJe.get(L.key) : null;
        if (!w || w.gen !== L.gen) return false;
        const m = g.mesh;
        const jetzt = this._instanzSlotStand(g, this._slotStandJetzt || (this._slotStandJetzt = {}));
        if (
            jetzt.belegt !== w.belegt ||
            jetzt.im !== w.im ||
            jetzt.vMat !== w.vMat ||
            jetzt.vKarte !== w.vKarte ||
            w.geo !== m.geometry ||
            w.mat !== g.mat ||
            w.live !== (g.liveCount | 0)
        )
            return false;
        const refs = w.refs;
        let tausch = 0;
        for (let j = 0; j < refs.length; j++) {
            const i = refs[j].slot;
            if (i === j) continue;
            this._archGroupTausch(g, i, j);
            tausch++;
        }
        if (tausch > 0 && g.wahl === "haupt") this._archMeshBundleTouch(m);
        return true;
    }

    _instanzWahlMerke(g, L, kk) {
        const je = g._wahlJe || (g._wahlJe = new Map());
        let w = je.get(L.key);
        if (!w)
            je.set(
                L.key,
                (w = { gen: 0, geo: null, mat: null, live: 0, refs: null, belegt: 0, im: null, vMat: 0, vKarte: 0 })
            );
        const m = g.mesh;
        w.gen = L.gen;
        w.geo = m.geometry;
        w.mat = g.mat;
        w.live = g.liveCount | 0;
        w.refs = g.slotRef.slice(0, kk);
        this._instanzSlotStand(g, w);
    }

    // DER SLOT-STAND einer Instanz-Gruppe (Welle C) — was ihre Slots trägt, ohne die Ordnung der Wahl: Belegen, Freigeben und
    // Stempel (`g.slotStand`), der Puffer ihrer Instanz-Matrizen und die Versionen der Matrizen und des Karten-Stempels, von
    // denen die Tausche der Wahl abgezogen sind (`_archGroupTausch` zählt, was sie selbst hebt). Ihn hebt jeder fremde
    // Schreiber — auch eine Tür, die schwingt —, nie die Wahl eines Passes; jeder Pass merkt ihn in seiner Wahl. Schreibt den
    // Stand in `aus`.
    _instanzSlotStand(g, aus) {
        const m = g.mesh;
        const ak = m.geometry.attributes.aKarte;
        aus.belegt = g.slotStand | 0;
        aus.im = m.instanceMatrix;
        aus.vMat = m.instanceMatrix.version - (g._tauschMat | 0);
        aus.vKarte = ak ? ak.version - (g._tauschKarte | 0) : -1;
        return aus;
    }

    _instanzWahlZurueck(liste) {
        for (let i = 0; i < liste.length; i++) {
            const g = liste[i];
            if (g.mesh) AnazhRealm._instanzZahl(g.mesh, g.liveCount | 0);
        }
        liste.length = 0;
    }

    _instanzWahlGruppen() {
        return this._wahlGruppen || (this._wahlGruppen = new Set());
    }

    // Welche Gruppe je Pass wählt: eine GLOBALE Gruppe, die in genau EINER Pass-Art zeichnet — die Pflanzen-Stufe (ihre
    // Geometrie trägt den Stufen-Stempel der Studio-Blende, aLodLevel 1 L0 · 2 L1 · 3 Zwilling/einzige Nah-Stufe, und die
    // Instanz-Fassade aH0): der Zwilling (SHADOW_TWIN_LAYER) nur in den Kaskaden, die Stufe ohne Schatten nur im Hauptbild;
    // die Karte (die EINE Atlas-Gruppe, ihr Quad trägt aKarte) wirft nie und zeichnet im Hauptbild. Eine Gruppe, die in
    // beiden zeichnet, teilte ihre Puffer zwischen den Pässen eines Frames — sie zeichnet weiter jede Instanz.
    _instanzWahlArt(leaf, castShadow, regional) {
        if (regional || !leaf || leaf.tuer) return null;
        const at = leaf.geom && leaf.geom.attributes;
        if (!at) return null;
        if (leaf.atlasGruppe) return at.aKarte && !castShadow ? "haupt" : null;
        if (!at.aH0 || !at.aLodLevel || !(at.aLodLevel.array[0] >= 1)) return null;
        if (leaf.shadowTwin) return "schatten";
        return castShadow ? null : "haupt";
    }

    // Trägt der Stoff der Gruppe die Maske, deren Fenster die Wahl liest — in dem Kanal, den ihr Pass liest? Die Stufen-
    // Stoffe der Foundry markieren sie am Bau (`userData.foundryCrossfade` samt Kanal: der Schattenpass liest nur die Farbe,
    // nie die Deckung), der Karten-Stoff ebenso (`userData.kartenMaske`, er zeichnet nur im Hauptbild). Ohne Maske zeichnet
    // die GPU jede Instanz voll — ein Fenster schnitte dort ein Loch: die Wahl liest dann nur das Gesetz der Pass-Wahl.
    _instanzFensterGilt(g) {
        const ud = g.mat && g.mat.userData;
        if (!ud) return false;
        if (g.wahlStufe === "karte") return ud.kartenMaske === true;
        return ud.foundryCrossfade === true && (g.wahl === "haupt" || ud.foundryCrossfadeKanal === "farbe");
    }

    // Behält der Pass die Instanz im Slot i? Ihr Körper (die Kugel der Geometrie × Instanz-Matrix + `pflanzeRandM` für den
    // Wind; die Karte: ihr Quad auf der Stammachse, Höhe aKarte.z und Halbbreite aKarte.y × Instanz-Skala, das sich um die
    // Hochachse zum Auge dreht) trifft nach dem EINEN Gesetz; trägt der Stoff die Maske, behält ihr Fenster etwas.
    _instanzBehalten(g, i, L, fenster) {
        const m = g.mesh;
        const a = m.instanceMatrix.array;
        const o = i * 16;
        const mw = m.matrixWorld.elements;
        let cx, cy, cz, r;
        if (g.wahlStufe === "karte") {
            const ak = m.geometry.attributes.aKarte.array;
            const h = ak[i * 4 + 2] * 0.5;
            const hw = ak[i * 4 + 1];
            const s = Math.sqrt(a[o] * a[o] + a[o + 1] * a[o + 1] + a[o + 2] * a[o + 2]);
            cx = a[o + 12] + a[o + 4] * h;
            cy = a[o + 13] + a[o + 5] * h;
            cz = a[o + 14] + a[o + 6] * h;
            r = s * Math.sqrt(h * h + hw * hw);
        } else {
            const geo = m.geometry;
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere;
            const c = bs.center;
            const s2 = Math.max(
                a[o] * a[o] + a[o + 1] * a[o + 1] + a[o + 2] * a[o + 2],
                a[o + 4] * a[o + 4] + a[o + 5] * a[o + 5] + a[o + 6] * a[o + 6],
                a[o + 8] * a[o + 8] + a[o + 9] * a[o + 9] + a[o + 10] * a[o + 10]
            );
            cx = a[o] * c.x + a[o + 4] * c.y + a[o + 8] * c.z + a[o + 12];
            cy = a[o + 1] * c.x + a[o + 5] * c.y + a[o + 9] * c.z + a[o + 13];
            cz = a[o + 2] * c.x + a[o + 6] * c.y + a[o + 10] * c.z + a[o + 14];
            r = bs.radius * Math.sqrt(s2) + AnazhRealm.PASS_WAHL.pflanzeRandM;
        }
        // in die Welt (die Gruppe hängt an der Szene oder in ihrem Bündel, beide ohne Lage — die Matrix bleibt exakt)
        const wx = mw[0] * cx + mw[4] * cy + mw[8] * cz + mw[12],
            wy = mw[1] * cx + mw[5] * cy + mw[9] * cz + mw[13],
            wz = mw[2] * cx + mw[6] * cy + mw[10] * cz + mw[14];
        if (!this._passTrifft(L, wx, wy, wz, 0, 0, 0, r)) return false;
        return !fenster || this._instanzFenster(g, i, L);
    }

    // DAS FENSTER DER STUFE: behält ihre Maske vom Auge auf der Instanz etwas? Die Maske misst je INSTANZ die Distanz vom
    // Auge zu ihrem Ursprung in XZ × uLodPerf × min(uLodRef/Sichthöhe, 1) (`_instanzMitteNode`, Studio `_iw`; Stufen:
    // Skelett-Metrik aH0, Blatt-Metrik aH0L; die Karte: zu ihrem Anker, Sichthöhe |aKarte.w|, ein negativer Stempel =
    // verdeckt, sie blendet voll) — das Intervall ist der Punkt der Instanz, nur der Halt macht es breit; das Urteil fällt
    // `_blendeBehaelt` an den Kanten des Blend-Gesetzes. Bis 1110-11 maß die Maske je Fragment und das Fenster über die
    // Weite der Gestalt: die L1 einer Birke in 5 m (Krone 10 m) behielt ihre fernen Äste und wurde ganz gezeichnet. Das Auge der
    // Maske hält wie jeder Ort der Lage um den halben Halt (`_blendeHaelt`) — die Distanz trägt den Halt als Rand (`L.halt`,
    // wie `_passTrifft`): eine gehaltene Wahl verliert nichts, solange das Auge atmet.
    _instanzFenster(g, i, L) {
        const m = g.mesh;
        const geo = m.geometry;
        const a = m.instanceMatrix.array;
        const o = i * 16;
        const mw = m.matrixWorld.elements;
        const dx = a[o + 12] + mw[12] - L.ex,
            dz = a[o + 14] + mw[14] - L.ez;
        const d = Math.sqrt(dx * dx + dz * dz);
        const halt = L.halt;
        if (g.wahlStufe === "karte") {
            const ak = geo.attributes.aKarte.array;
            const sicht = ak[i * 4 + 3];
            const k = Math.min(L.ref / Math.max(Math.abs(sicht), 1e-3), 1);
            const dSmin = Math.max(0, d - halt) * L.perf * k,
                dSmax = (d + halt) * L.perf * k;
            return AnazhRealm._blendeBehaelt(L.kanten, "karte", dSmin, dSmax, dSmin, dSmax, sicht < 0);
        }
        const dMin = Math.max(0, d - halt) * L.perf,
            dMax = (d + halt) * L.perf;
        const kS = Math.min(L.ref / Math.max(geo.attributes.aH0.array[i], 1e-3), 1);
        const hL = geo.attributes.aH0L.array[i]; // das Vorzeichen: der Halt der Stufe ohne Partner (sie zeichnet voll)
        const kL = Math.min(L.ref / Math.max(Math.abs(hL), 1e-3), 1);
        return AnazhRealm._blendeBehaelt(L.kanten, g.wahlStufe, dMin * kS, dMax * kS, dMin * kL, dMax * kL, hL < 0);
    }

    // DIE KANTEN DES FENSTERS aus dem EINEN Blend-Gesetz (`gesetz` = `__phytoCore.lodCrossfadeMask`, die Quelle der Studio-
    // Blende und jeder Maske): je Rampe die Distanz, an der sie 0 verlässt bzw. 1 erreicht — per Bisektion AM GESETZ (seine
    // f0 · f1 · f1o steigen monoton mit der Distanz), auf 1 mm, je Kante die äußere Grenze: das Fenster behält eher zu viel
    // als zu wenig. Rein (kein Zustand): gate:foundry-crossfade fährt es in Node gegen das Gesetz.
    static _blendeKanten(gesetz, d0, d1, fade, fade0) {
        const cfg = { d0, d1, fade, fade0 };
        const hoch = 4 * Math.max(d0, d1, 1) + Math.abs(fade) + Math.abs(fade0);
        // [a, b]: `bed` gilt bei b, nicht bei a (bed steigt monoton von falsch nach wahr)
        const kante = (lod, bed) => {
            let a = 0,
                b = hoch;
            if (bed(gesetz(a, 0, cfg, lod, true, a))) return [0, 0];
            if (!bed(gesetz(b, 0, cfg, lod, true, b))) return [hoch, Infinity];
            while (b - a > 1e-3) {
                const mitte = 0.5 * (a + b);
                if (bed(gesetz(mitte, 0, cfg, lod, true, mitte))) b = mitte;
                else a = mitte;
            }
            return [a, b];
        };
        return {
            d0,
            d1,
            fade,
            fade0,
            l0Aus: kante(0, (x) => x.f0 >= 1)[1], // die L0 behält, solange f0 < 1 (Blatt-Metrik)
            l1Ein: kante(1, (x) => x.f0 > 0)[0], // die L1 blendet ein, sobald f0 > 0 (Blatt-Metrik)
            l1Aus: kante(1, (x) => x.f1o >= 1)[1], // die L1 behält, solange f1o < 1 (Skelett-Metrik)
            karteEin: kante(2, (x) => x.f1 > 0)[0], // die Karte blendet ein, sobald f1 > 0
        };
    }

    // Behält die Stufe über das Distanz-Intervall [dSmin, dSmax] (Skelett) bzw. [dLmin, dLmax] (Blatt) ein Fragment mit
    // positivem Maß der Dither-Werte? Das Gesetz behält die L0 bei ramp(f0) < dh, die L1 bei f1o < dh ≤ ramp(f0) (die
    // einzige Nah-Stufe, Stempel 3, blendet nie ein: f1o < dh), die Karte bei dh ≤ min(2·f1, 1) oder verdeckt — je Rampe
    // die Kante aus `_blendeKanten`. Rein (gate:foundry-crossfade prüft es je Stufe gegen das Gesetz, kein Loch).
    static _blendeBehaelt(K, stufe, dSmin, dSmax, dLmin, dLmax, verdeckt) {
        if (verdeckt === true) return true; // VOLL: die verdeckte Karte, die Stufe im Halt (K36) — die Maske behält alles
        if (stufe === 1) return dLmin < K.l0Aus;
        if (stufe === 2) return dLmax > K.l1Ein && dSmin < K.l1Aus;
        if (stufe === 3) return dSmin < K.l1Aus;
        if (stufe === "karte") return dSmax > K.karteEin;
        return true;
    }

    // Kaskaden-Index einer Schatten-Kamera (die EINE Map ohne CSM = 0), sonst −1.
    _schattenKameraIndex(kamera) {
        const csm = this.state.csmNode;
        if (csm && csm.lights)
            for (let i = 0; i < csm.lights.length; i++)
                if (csm.lights[i].shadow && csm.lights[i].shadow.camera === kamera) return i;
        const dl = this.state.directionalLight;
        return dl && dl.shadow && dl.shadow.camera === kamera ? 0 : -1;
    }

    // DER SCHATTEN-TAKT je Kaskade (04.10., echte GPU): r184 liest `renderer.shadowMap.needsUpdate` NICHT — der
    // EINE Leser ist `ShadowNode.updateBefore` mit `shadow.needsUpdate || shadow.autoUpdate` je Licht, und
    // `LightShadow.autoUpdate` (true) reist in jede CSM-Kaskade. Der alte Cache (V18.264) schrieb ins Leere: beide
    // Kaskaden renderten JEDEN Frame (Profil: updateShadow ~9,5 ms CPU je Frame). Hier fährt der Takt die echten
    // Leser: die NAHE Kaskade rendert jeden `nahMax`-ten Frame (laufende Tiere werfen nah), die FERNE im
    // `fernFaktor`-fachen Takt des Regler-Intervalls (höchstens so dicht wie die nahe); ein Sonnen-Sprung erzwingt
    // alle. JE FRAME HÖCHSTENS EINE KASKADE (1410-3): unter Regler voll renderte die nahe JEDEN Frame und jeder dritte
    // trug beide — der CPU-Takt eines Frames mit zwei Schatten-Renders bildete den p95 (Genesis Third, eine Sitzung,
    // abwechselnd: p50 5,5 → 5,0 ms). Eine fällige Kaskade wartet hinter der Vor-Kaskade dieses Frames auf den
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
        let gerendert = false;
        for (let i = 0; i < lichter.length; i++) {
            const sh = lichter[i].shadow;
            if (!sh) continue;
            sh.autoUpdate = false;
            const takt = i === 0 ? T.nahMax : Math.max(T.nahMax, minInterval) * T.fernFaktor;
            const faellig = !(frame - (L.k[i] != null ? L.k[i] : -1e9) < takt);
            if (sunMoved || (faellig && !gerendert)) {
                sh.needsUpdate = true;
                L.k[i] = frame;
                gerendert = true;
            }
        }
    }

    // DER SCHIRM — die EINE Quelle jeder Schirm-Größe (Gebot 7: Kosten an den Schirm). Einmal je Takt (Loop-Eingang)
    // aus dem Zeichenpuffer des Renderers (Bildpunkte samt Pixel-Verhältnis) und dem Sichtfeld der Kamera: Breite ·
    // Höhe · pxJeM (Bildpunkte, die ein Meter Objekt in einem Meter Abstand senkrecht deckt). Jedes Gesetz, das
    // den Schirm liest, liest IHN, und richtig herum: ein kleinerer Schirm trägt höchstens gleich viel Detail. Bis
    // V18.531 las das Fell-Gesetz die Canvas-Höhe selbst (Rückfall 1080, Sichtfeld-Rückfall 60°), und der Geräte-Seed
    // las `innerWidth·innerHeight·dpr²` VERKEHRT herum (ab 4 MPix weniger Welt: ein größerer Schirm startete ärmer).
    // gate:schirm-monotonie zählt die Welt in drei Fenstergrößen je Pass und Klasse und nennt jeden zweiten Weg.
    // Ohne Renderer oder Perspektiv-Kamera ist pxJeM null — ein fehlender Wert ist nie 0.
    _schirmMessen() {
        const st = this.state;
        const rend = st.renderer;
        const cam = st.camera;
        const v = this._schirmPuffer || (this._schirmPuffer = new THREE.Vector2());
        const s = this._schirmWert || (this._schirmWert = { breite: 0, hoehe: 0, pxJeM: null });
        if (rend && typeof rend.getDrawingBufferSize === "function") rend.getDrawingBufferSize(v);
        else v.set(0, 0);
        s.breite = v.x;
        s.hoehe = v.y;
        s.pxJeM = cam && cam.isPerspectiveCamera && v.y > 0 ? v.y / (2 * Math.tan((cam.fov * Math.PI) / 360)) : null;
        return s;
    }

    _schirm() {
        return this._schirmWert || this._schirmMessen();
    }

    _loopRender(currentTime) {
        // ### Rendering ###
        // DER SATZ (Welle B): alle Chunk-Ein-/Austritte dieses Frames legen ihren Index JETZT, direkt vor dem
        // Zeichnen — ein frei gewordener und im selben Frame neu vergebener Bereich ist nie ungelegt sichtbar.
        this._tickChunkSatz();
        // Skybox-Position DIREKT vor dem Render kopieren (die Kamera ist hier schon aktualisiert).
        if (this.state.camera && this.state.skybox) {
            this.state.skybox.position.copy(this.state.camera.position);
        }
        // Stern-Feld folgt der Kamera (sonst wandert man heraus) und dreht sidereal mit der Tageszeit um
        // eine geneigte Achse.
        if (this.state.camera && this.state.starField) {
            this.state.starField.position.copy(this.state.camera.position);
            const tod = this.state.timeOfDay || 0;
            this.state.starField.rotation.set(0.4, tod * Math.PI * 2, 0.15);
        }
        // WELLE J3 — Sonne·Mond SYNCHRON an die Kamera heften (wie das
        // Stern-Feld) → sie stehen fest am Himmel statt um den Welt-Ursprung zu
        // orbiten + neben dem fernen Spieler durchs Terrain zu rasen.
        this._followCelestialBodies();
        // Das geteilte Hydrosphären-Material (Fluss-Ribbons + See-Planes) zentral animieren; der
        // Flow-Shader scrollt den Schaum stromab nach per-Vertex-`aFlow`.
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.time) {
            this.state.hydroSurfaceUniforms.time.value = currentTime;
        }
        // `uEmotion` füttern: die Stimmung hebt den Schaum (s. `_ensureHydroSurfaceMaterial`) — positive
        // Gefühle beleben das Wasser, Trauer dämpft.
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.emotion) {
            const em = this.state.player && this.state.player.emotions;
            const vital = em
                ? Math.max(
                      0,
                      Math.min(
                          1,
                          (em.joy || 0) * 0.6 + (em.peace || 0) * 0.5 + (em.hope || 0) * 0.3 - (em.sorrow || 0) * 0.5
                      )
                  )
                : 0;
            this.state.hydroSurfaceUniforms.emotion.value = vital;
        }
        // V8.28 6.G4.b D — Wind. uWindTime läuft kontinuierlich,
        // uWindStrength emergiert aus weather (rainy = kräftiger).
        if (this.state.windUniforms) {
            this.state.windUniforms.uWindTime.value = currentTime;
            // Böen-Amplitude = wind-Kanal des Wetter-Felds (stormy 1.0·AMP, sunny 0.06·AMP; AMP=0.55) ×
            // Böen-Drift `_weatherWob` (gesetzt in `_loopWeatherAndGrowth`).
            this.state.windUniforms.uWindStrength.value =
                this._weatherFieldFor(this.state.weather).wind * AnazhRealm.WEATHER_WIND_AMP * (this._weatherWob || 1);
            // Die EINE Wind-Richtungs-Quelle + Interaktions-Sphären ticken mit dem Wind-Uniform: uWindDir =
            // seeded Mäander `_windDirAt` (currentTime in s, dieselbe Uhr wie uWindTime), uBend =
            // Spieler/Ritt/nahe Kreaturen (`_tickGrasBend`, render-rein).
            if (this.state.windUniforms.uWindDir) {
                const _wdir = this._windDirAt(currentTime);
                this.state.windUniforms.uWindDir.value.set(_wdir.x, _wdir.z);
            }
            this._tickGrasBend();
        }
        // uLodRef spiegelt live die EINE Quelle `state.lodRef` (Slider ohne Mesh-Rebuild; dieselbe Zahl
        // liest `_lodPerceptionDistance`), uLodMaskOn den A/B-Toggle. uDitherT rotiert golden-ratio, wo die
        // zeitliche Auflösung in der Kette steht (state.traaNode, _ensurePostProcessing): das zeitliche Mittel ist die
        // glatte Blende (statisch wäre das Mittel das Muster). Ohne TRAA (Holz kienspan) bleibt es statisch —
        // rotierendes Dither ohne zeitliche Auflösung wäre kriechendes Rauschen (Studio-Gesetz phytogenesis FIX v32).
        if (this.state.lodUniforms) {
            const _lu = this.state.lodUniforms;
            if (_lu.uDitherT && this.state.traaNode) _lu.uDitherT.value = (_lu.uDitherT.value + 0.61803398875) % 1;
            if (_lu.uLodRef)
                _lu.uLodRef.value =
                    Number.isFinite(this.state.lodRef) && this.state.lodRef > 0 ? +this.state.lodRef : 14;
            if (_lu.uLodMaskOn) _lu.uLodMaskOn.value = this.state.lodMaskOn === false ? 0 : 1;
            if (_lu.uLodAuge && this.state.camera) _lu.uLodAuge.value.copy(this._lodAuge());
            if (_lu.uLodPerf) _lu.uLodPerf.value = this._lodPerfMul();
            // W5.4 (Schritt 3) — die Band-Zahlen spiegeln LIVE die EINE Quelle LOD_DISTANCES
            // (der Studio-Ingest mutiert sie → die Foundry-Maske folgt ohne Material-Rebuild).
            const _D = AnazhRealm.LOD_DISTANCES;
            if (_D && _lu.uLodD0) {
                if (Number.isFinite(_D.thresh01)) _lu.uLodD0.value = _D.thresh01;
                if (Number.isFinite(_D.thresh12)) _lu.uLodD1.value = _D.thresh12;
                if (Number.isFinite(_D.fade)) _lu.uLodFade.value = _D.fade;
                if (Number.isFinite(_D.fade0)) _lu.uLodFade0.value = _D.fade0;
            }
        }
        // Godray-Frame-Steuerung: Sonnen-Screen-Position + Pegel; headless fehlt `godrayUniforms` evtl.
        // Die Himmelskörper hängen schon an der Kamera (`_followCelestialBodies`) → `.project(camera)` gibt
        // die NDC-Lage. Pegel = `_godrayScale` (perf) × `_godrayFrameGate` (Wetter/Höhe) × Sichtbarkeit
        // (Sonne vor der Kamera, im Bild, über dem Horizont).
        if (this.state.godrayUniforms && this.state.sunMesh && this.state.camera) {
            const gu = this.state.godrayUniforms;
            const cam = this.state.camera;
            const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
            const angle = this._sonnenWinkel(t);
            const sunDir = this._dayNightSunDirection(angle); // dieselbe Richtungs-Quelle wie Licht/Skybox
            // NDC-Projektion des sichtbaren Sonnen-Meshes → Screen-UV (0..1).
            const proj = (this._godrayProjV || (this._godrayProjV = new THREE.Vector3()))
                .copy(this.state.sunMesh.position)
                .project(cam);
            const uvx = proj.x * 0.5 + 0.5;
            const uvy = proj.y * 0.5 + 0.5;
            gu.sunScreenPos.value.set(uvx, uvy);
            // Sichtbarkeit: (a) VOR der Kamera (robust via Blickrichtung · Sonnen-Richtung, statt
            // der zweideutigen NDC-z hinter der Kamera), (b) im Bild, (c) über dem Horizont.
            const sm = (a, b, x) => {
                const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
                return k * k * (3 - 2 * k);
            };
            const fwd = this._godrayFwd || (this._godrayFwd = new THREE.Vector3());
            cam.getWorldDirection(fwd);
            const off = this.state.sunMesh.userData && this.state.sunMesh.userData.skyOffset;
            const facing = off ? fwd.x * sunDir.x + fwd.y * sunDir.y + fwd.z * sunDir.z : -1; // sunDir ≈ skyOffset-Richtung
            const onScreen =
                sm(-0.2, 0.05, uvx) * (1 - sm(0.95, 1.2, uvx)) * sm(-0.2, 0.05, uvy) * (1 - sm(0.95, 1.2, uvy));
            const sunVisible = sm(0.02, 0.25, facing) * onScreen;
            const weatherSun = this._weatherFieldFor(this.state.weather).sun;
            const gate = this._godrayFrameGate(sunDir.y, weatherSun);
            gu.strength.value = (this.state._godrayScale ?? 1) * gate * sunVisible;
        }
        // WebGPURenderer.init() ist async, der Loop läuft sofort — Render-Frames überspringen, bis
        // rendererReady.
        if (!this.state.rendererReady) return;
        // Nach GPU-Device-Verlust rendert kein Pfad mehr (jeder Versuch wirft createBuffer-Fehler, endlos):
        // EIN Chokepoint. Der Wächter hat Error + Gate schon gezeigt; die Simulation läuft weiter.
        if (this.state._deviceLost) return;
        // V18.268 — perfSense-Render-Tap: EINMAL pro Frame zurücksetzen, dann am Ende
        // die akkumulierte Per-Frame-Last (alle render()-Pässe) lesen (autoReset=false).
        const _rinfo = this.state.renderer.info;
        if (_rinfo && typeof _rinfo.reset === "function") _rinfo.reset();
        // Die Shadow-Map rendert der WebGPU-Renderer nativ (Cache-Steuerung in _loopShadowUpdate).
        // render() ist async: Pipeline-Compile-Fehler werden geloggt (kein WebGL-Hot-Swap — schwarze Welt).
        // Steht die Post-Pipeline, rendert sie die Szene; bei postProcessingFailed direkter
        // renderer.render() — nie ein schwarzer Schirm.
        const pp = this._ensurePostProcessing();
        // DER LICHT-TAKT (K11): die Plätze des Licht-Pools und die Fenster-Glut für dieses Bild (die Kamera steht)
        this._leuchtTakt();
        // Die Kehraus-Marke vor dem Frame: was dieser Frame zeichnet, trägt einen höheren Zähler.
        const zaehlerVor = this._gpuKehrausMarke();
        // DIE SZENEN-SKALA am Szenen-Pass: nie je Last (jeder Ziel-Wechsel unter lebenden Bündeln war die Destroyed-Klasse,
        // realloc-tod 20.07.) — nur ein neuer Wert des Spielers (`state.szeneSkala`, der Regler im Menü), und der legt die
        // Ziele beim nächsten Frame neu an wie ein Fenster-Wechsel (der Vorher-Textur-Wächter der Diät folgt jeder Textur).
        const sp = this.state.scenePass;
        if (sp && sp.getResolutionScale() !== this._szeneSkalaWirk()) sp.setResolutionScale(this._szeneSkalaWirk());
        const ppu = this.state.postProcessingUniforms;
        if (ppu && ppu.nachSchaerfe)
            ppu.nachSchaerfe.value = this.state.traaNode ? AnazhRealm.ZEIT_SCHAERFE * (1 - this._szeneSkalaWirk()) : 0;
        // DIE WEICHE: Post-Kette oder Direktpfad — und mit ihr Leinwand-Tiefe und Rahmen-Ziel (`_leinwandWeg`, der EINE Weg).
        let direkt = !pp || this.state.postProcessingFailed === true;
        if (!direkt) {
            this._leinwandWeg(false);
            try {
                // V18.113 — renderAsync() ist im PR-#81-Vendor deprecated (Warnung
                // in der Schöpfer-Konsole); render() ist der eine Pfad.
                if (this.state.traaNode) this._traaReprojektion();
                pp.render();
            } catch (err) {
                // r184 baut Post-Kette und Szenen-Pass erst im ersten render() (PostProcessing.render → _update): ein
                // Knoten-Fehler der Kette bricht HIER — laut beim Namen (K22), der Schirm zeichnet danach direkt
                this.state.postProcessingFailed = true;
                direkt = true;
                this._stoffBruch(
                    "die Post-Kette (Render-Lauf: TRAA · Bloom · Grading) — der Schirm zeichnet direkt",
                    err
                );
            }
        }
        if (direkt) {
            this._leinwandWeg(true);
            this.state.renderer.render(this.state.scene, this.state.camera);
        }
        // Das erste fertige Weltbild nimmt den Ladeschirm weg (L2: nie die schwarze Leinwand).
        if (!this.state._weltbildDa) this._ankunftsBild();
        // GPU-Last in den perfSense-Frame-Akku (Draw-Calls + Dreiecke, alle Pässe). Im r184-WebGPU-Info ist
        // `render.calls` ein LEBENSZEIT-Zähler der render()-Aufrufe (reset() löscht ihn nicht) → er
        // vergiftete HUD/Flugschreiber/Regler mit wachsender Phantom-Last. Pro Frame zählt
        // `render.drawCalls`; `.calls` nur als Fallback für alte/fremde Info-Formen.
        if (_rinfo && _rinfo.render) {
            const f = this.state._perfFrame || (this.state._perfFrame = {});
            f.renderCalls = _rinfo.render.drawCalls != null ? _rinfo.render.drawCalls : _rinfo.render.calls || 0;
            f.renderTris = _rinfo.render.triangles || 0;
        }
        // Nach dem Frame: was weder der Graph noch dieser Frame zeichnet, verlässt die GPU (der EINE Kehraus).
        this._gpuKehraus(zaehlerVor, performance.now());
        // pendingDisposals über `device.queue.onSubmittedWorkDone()` leeren — die EINZIGE deterministische
        // API (resolved, wenn die GPU alle bisherigen Submits durch hat); ein Frame-Zähler rät nur.
        if (this.state.pendingDisposals.size > 0) {
            // V10.0-j.g — Set → Array für stable iteration. Set wird nach
            // dem Snapshot geleert (neue Disposes pushen für den nächsten
            // Frame, NICHT in den aktuellen Drain).
            const queue = Array.from(this.state.pendingDisposals);
            this.state.pendingDisposals.clear();
            const backend = this.state.renderer && this.state.renderer.backend;
            const device = backend && backend.device;
            const queueObj = device && device.queue;
            if (queueObj && typeof queueObj.onSubmittedWorkDone === "function") {
                queueObj.onSubmittedWorkDone().then(() => {
                    for (const obj of queue) {
                        try {
                            obj.dispose();
                        } catch (_e) {
                            /* defensive */
                        }
                    }
                });
            } else {
                // Fallback ohne `backend.device.queue` (headless/WebGL2-Backend ohne onSubmittedWorkDone): synchron
                // dispose ist sicher — WebGL hat keine async-submit-Race.
                for (const obj of queue) {
                    try {
                        obj.dispose();
                    } catch (_e) {
                        /* defensive */
                    }
                }
            }
        }
    }

    // Kein Renderer-Hot-Swap nach WebGL: NodeMaterials rendern nur auf WebGPURenderer (schwarze Welt).

    // DAS ERSTE WELTBILD (Leben-Schau 07.10., L2): ein neuer Spieler sah als erstes Bild die schwarze Leinwand unter fertiger
    // UI — gemessen auf der Radeon 3,7 s bis 25,5 s nach dem Laden (der Weltbau hält den Haupt-Thread), dann sprang die Welt
    // herein. Der Ladeschirm (index.html, `#ladeschirm`) steht ab dem ersten Bild der Seite (sein Glimmen läuft im
    // Compositor weiter, auch wenn der Weltbau den Haupt-Thread hält) und weicht nach dem ersten Frame, in dem das Weltbild
    // FERTIG ist (`_weltbildFehlt` leer): Gegenprüfung Runde 1 — er wich, sobald der eigene Chunk stand, das erste Weltbild
    // (Radeon, 15,9 s) zeigte die Welt ohne einen Baum und die Portale als Platzhalter. Bis dahin sagt die Stand-Zeile, worauf
    // die Welt wartet. Ruht die Arbeit (dieselbe Lücke WELTBILD_STILL_MS lang, nichts wächst), weicht er LAUT: das Log nennt,
    // was fehlt — ein Bau, den das Studio nie liefert, hält den Spieler nie vor der Welt fest.
    _ankunftsBild() {
        const st = this.state;
        if (st._weltbildDa) return true;
        const fehlt = this._weltbildFehlt();
        if (fehlt.length) {
            const jetzt = performance.now();
            const sig = fehlt.join(" · ");
            if (st._weltbildErsteFrage == null) st._weltbildErsteFrage = jetzt;
            if (st._weltbildLuecke !== sig) {
                st._weltbildLuecke = sig;
                st._weltbildLueckeSeit = jetzt;
            }
            // DER DECKEL (Gegenprüfung Runde 2): eine Lücke, deren Zahl ständig flackert, setzte die Ruhe-Uhr je Wechsel neu
            // und hielt den Ladeschirm ohne Grenze — nach WELTBILD_DECKEL_MS ab der ersten Frage weicht er laut wie bei Ruhe.
            const gedeckelt = jetzt - st._weltbildErsteFrage >= AnazhRealm.WELTBILD_DECKEL_MS;
            if (!st.playerMesh || (!gedeckelt && jetzt - st._weltbildLueckeSeit < AnazhRealm.WELTBILD_STILL_MS)) {
                this._ladeschirmStand(sig);
                return false;
            }
            this.log(
                gedeckelt
                    ? `Das erste Weltbild steht ohne: ${sig} — der Deckel von ${AnazhRealm.WELTBILD_DECKEL_MS} ms ist erreicht.`
                    : `Das erste Weltbild steht ohne: ${sig} — die Arbeit ruhte ${AnazhRealm.WELTBILD_STILL_MS} ms.`,
                "WARN"
            );
        }
        this._weltbildSteht();
        return true;
    }

    // DAS ERSTE WELTBILD ALS EREIGNIS: wer darauf wartet (der Vorrat, K30), wartet auf dieses Versprechen, nie auf die Uhr.
    // Steht das Bild schon, ist es erfüllt; sonst erfüllt es der EINE Schreiber `_weltbildSteht`. Nullt eine Probe das Bild
    // (`_weltbildDa = 0`), wartet der nächste Frager auf ein neues Versprechen.
    _weltbildKommt() {
        const st = this.state;
        if (st._weltbildDa) return Promise.resolve(st._weltbildDa);
        if (!st._weltbildWarten) {
            const w = {};
            w.da = new Promise((r) => (w.erfuellt = r));
            st._weltbildWarten = w;
        }
        return st._weltbildWarten.da;
    }

    // Der EINE Schreiber des ersten Weltbilds: seine Zeit (`_weltbildDa`, ab Navigation — gate:boot-stage liest sie), das
    // Ereignis für jeden Wartenden (`_weltbildKommt`), dann weicht der Ladeschirm.
    _weltbildSteht() {
        const st = this.state;
        st._weltbildDa = performance.now();
        const w = st._weltbildWarten;
        st._weltbildWarten = null;
        if (w) w.erfuellt(st._weltbildDa);
        this._ladeschirmWeg();
    }

    // Was dem ersten Weltbild fehlt — leer heißt: es steht. Je Lücke ein Satz für die Stand-Zeile (mit ihrer Zahl, die sinkt,
    // solange die Welt wächst): der Boden bis zum Existenz-Boden des Rings (RING_EXIST_FLOOR, die Ringe ohne fps-Tor), das
    // Buch der Studios, jeder Bau und Baum der Mesh-Zone (`architectureCullingRadius`) gezeichnet, jede Streu-Region, die der
    // Streamer holt, gebaut (`_streuWartet`: keine fehlt, keine wartet auf ihr Asset), keine Karte eines fernen Baums offen.
    // Jede Lücke hat ihren Leser im ersten Frame; der Vorrat (`_foundryPrefetchLibrary`) hat keinen und hält das Bild nie
    // (K30: das Tor wartete auf `f._prefetching` — Wagen, Siedlungs-Probe, alle Gestalten des Buchs; kalt 25–30 s).
    _weltbildFehlt() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm) return ["die Welt entsteht"];
        const out = [];
        const ring = this._builtRingRadius();
        const ringSoll = AnazhRealm.RING_EXIST_FLOOR;
        if (!(ring != null && ring >= ringSoll))
            out.push(`der Boden wächst (Ring ${ring != null && ring >= 0 ? ring + 1 : 0} von ${ringSoll + 1})`);
        if (!this._foundryEnabled()) return out;
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes) {
            out.push("das Buch der Studios öffnet sich");
            return out;
        }
        const p = pm.position;
        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
        let ungebaut = 0;
        for (const e of st.architectures || []) {
            if (!e || !e.position) continue;
            const dx = e.position.x - p.x;
            const dz = e.position.z - p.z;
            if (dx * dx + dz * dz <= R * R && !this._archIsRendered(e)) ungebaut++;
        }
        if (ungebaut) out.push(`${ungebaut} Bäume und Bauten wachsen`);
        const warten = this._streuWartet(p);
        if (warten) out.push(`${warten} Wald-Stücke warten auf ihre Gestalt`);
        const karten =
            (this._impostorBakeQueue ? this._impostorBakeQueue.length : 0) + (this._impostorBakePending ? 1 : 0);
        if (karten) out.push(`${karten} ferne Bäume werden gemalt`);
        return out;
    }

    // Die Stand-Zeile des Ladeschirms (nur solange er steht).
    _ladeschirmStand(text) {
        if (typeof document === "undefined") return;
        const el = document.getElementById("ladeschirm-stand");
        if (el && el.textContent !== text) el.textContent = text;
    }

    // Der Ladeschirm weicht: nach dem ersten fertigen Weltbild, oder dem WebGPU-Tor (das Tor IST die Antwort — unter dem
    // Ladeschirm läge es unsichtbar).
    _ladeschirmWeg() {
        if (typeof document === "undefined") return;
        const el = document.getElementById("ladeschirm");
        if (!el || el.hidden) return;
        el.classList.add("weg");
        setTimeout(() => {
            el.hidden = true;
        }, 750);
    }

    // Steht der Ladeschirm (die DOM-Wahrheit: da, nicht versteckt, nicht im Weichen)? Solange gehört keine Taste der Welt.
    _ladeschirmSteht() {
        if (typeof document === "undefined") return false;
        const el = document.getElementById("ladeschirm");
        return !!el && !el.hidden && !el.classList.contains("weg");
    }

    // Ist eine Schublade offen? Die DOM-Wahrheit (ein sichtbarer .drawer), nicht ein Merker — der Werkstatt-, Hof- oder
    // Bibliotheks-Drawer gehört der UI, nie der Welt (Welle L, Q9).
    _uiSchubladeOffen() {
        if (typeof document === "undefined" || typeof document.querySelector !== "function") return false;
        return !!document.querySelector(".drawer[data-drawer]:not([hidden])");
    }

    // Eine Schublade öffnet: der Zeiger wird frei (die Klicks gehören der Schublade) und ein gehaltenes Mahlen endet.
    _uiZeigerFrei() {
        if (this.state.player) this.state.player.breakHeld = false;
        if (typeof document !== "undefined" && document.pointerLockElement && document.exitPointerLock) {
            try {
                document.exitPointerLock();
            } catch (_e) {
                /* Policy: kein Lock, nichts zu lösen */
            }
        }
    }

    // Liegt der Fokus auf einem bedienbaren Element der UI — Knopf, Verweis, Auswahl, Faltkopf, eine Rolle „button" oder
    // ein Element mit Tab-Platz? Dann gehört ihm Enter. Die Welt (body, die Leinwand) ist es nie.
    _uiBedienFokus(el) {
        if (!el || typeof el.closest !== "function" || typeof document === "undefined") return false;
        if (el === document.body || el === document.documentElement) return false;
        const lw = this.state.renderer && this.state.renderer.domElement;
        if (lw && el === lw) return false;
        return !!el.closest('button, a[href], select, summary, [role="button"], [tabindex]:not([tabindex="-1"])');
    }

    // DAS GESPRÄCH ÖFFNEN (die Chat-Taste, L3): der Zeiger wird frei, jede gehaltene Taste fällt (W lief sonst weiter,
    // während der Spieler tippt), der Fokus liegt im Feld. true, wenn das Feld den Fokus hat.
    _chatOeffnen() {
        if (typeof document === "undefined") return false;
        const ci = document.getElementById("chat-input");
        if (!ci) return false;
        this._uiZeigerFrei();
        this._alleTastenLos();
        // Wer spricht, sieht das Feld: ein mit H ausgeblendetes HUD kommt zurück.
        if (document.body) document.body.classList.remove("hud-hidden");
        ci.focus();
        return document.activeElement === ci;
    }

    // DAS GESPRÄCH SCHLIESSEN (Enter nach dem Senden, Esc): das Feld gibt den Fokus ab — W tippt nie mehr hinein — und der
    // Zeiger kehrt in die Welt, wenn keine Schublade und kein Inventar offen ist (die Taste ist die Geste, die das Spiel
    // für den Zeiger braucht; eine Absage der Seite ist kein Fehler, der Klick fängt ihn wie beim ersten Mal).
    _chatSchliessen() {
        if (typeof document === "undefined") return;
        const ci = document.getElementById("chat-input");
        if (ci && document.activeElement === ci) ci.blur();
        if (this.state.inventoryOpen || this._uiSchubladeOffen() || this._portalOverlay) return;
        const canvas = this.state.renderer && this.state.renderer.domElement;
        if (!canvas || typeof canvas.requestPointerLock !== "function" || document.pointerLockElement === canvas)
            return;
        try {
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (_e) {
            /* Policy: kein Lock ohne Geste — der nächste Klick fängt den Zeiger */
        }
    }

    // Maus-Listener (Pointer-Lock-Click + Mousedown-Action) als Methode.
    // Wird in createScene am initial-Canvas gerufen.
    _attachWorldCanvasInputListeners(canvas) {
        if (!canvas) return;
        canvas.addEventListener("click", () => {
            // Welle 6.C1 Drag-Fix: Inventar offen → Canvas-Click NICHT
            // re-locken. Sonst würde ein Klick neben das Overlay den
            // Pointer-Lock wieder aktivieren und Drag&Drop tot machen. Dasselbe für jede offene Schublade (Welle L).
            if (this.state.inventoryOpen || this._uiSchubladeOffen()) return;
            if (document.pointerLockElement === canvas) return;
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === "function") p.catch(() => {}); // Ablehnung (Policy) ist kein Seiten-Fehler
        });
        // Maus-Aktionen (abbauen/platzieren) nur mit aktivem Pointer-Lock, geschlossenem Inventar und geschlossener
        // Schublade (Drag&Drop hat eigene Listener): IST DIE UI OFFEN, IST DER CANVAS TAUB (Welle L, Befund V-D2 — mit
        // offener Werkstatt und gefangenem Zeiger gruben 4 Klicks auf „Bauplan …" 4 Krater r 3,5 m). Im Rebind-Capture
        // bindet der erste Maus-Button die Aktion.
        canvas.addEventListener("mousedown", (event) => {
            if (this.state.inventoryOpen || this._uiSchubladeOffen()) return;
            if (this.state.keybindRebind) {
                const code = this._eventToBindingCode(event);
                if (code) {
                    this._completeKeybindRebind(code);
                    event.preventDefault();
                }
                return;
            }
            if (!this.state.isPointerLocked) return;
            const code = this._eventToBindingCode(event);
            const action = this._actionForBindingCode(code);
            if (action === "break") {
                // V17.55 W1 — Halten startet das Mahlen: der erste Hieb sofort, dann auto
                // (_tickHarvest) in der Kadenz, bis losgelassen wird.
                if (this.state.player) {
                    this.state.player.breakHeld = true;
                    this.state.player.lastHarvestStrikeAt = performance.now() / 1000;
                }
                this.tryMouseBreak();
                event.preventDefault();
            } else if (action === "place") {
                this.tryMousePlace();
                event.preventDefault();
            }
        });
        // V17.55 W1 — Loslassen der Abbau-Taste stoppt das Mahlen (nur die break-Taste).
        canvas.addEventListener("mouseup", (event) => {
            if (!this.state.player) return;
            if (this._actionForBindingCode(this._eventToBindingCode(event)) === "break") {
                this.state.player.breakHeld = false;
                // ARENA-GEFÜHL — Loslassen löst den gespannten Bogen (der Auszug-
                // Anteil skaliert v0; ohne Draw-Zustand ein No-op, byte-alt).
                if (this.state.player._bogenDraw) this._bogenRelease();
            }
        });
    }

    // ### Hilfsfunktionen ### V7.56
    isPlayerGrounded() {
        // DETERMINISMUS-BOGEN P3 — die Erdungs-Wahrheit kommt aus `_stepCharacter` (es setzt
        // `_groundedCache` jeden Frame aus dem Dichtefeld). Der Cache-Hit unten serviert sie;
        // der 9-Ray-Fallback (jetzt feld-nativer `_runRaycast`) greift nur, falls der Cache fehlt.
        if (!this.state.playerMesh) return false;

        // Erdungs-Cache (2-Frame-TTL, auf state): isPlayerGrounded wird mehrfach je Frame gerufen (Bewegung,
        // Sprung, Ground-Track, handleJump) — alle teilen ein Resultat (kein Mid-Frame-Drift), 1/3 Raycasts.
        const now = performance.now();
        if (
            typeof this.state._groundedCachedAt === "number" &&
            now - this.state._groundedCachedAt < 33 // ~2 Frames bei 60 fps
        ) {
            // Side-effect bestNormalY + onSteepSlope wurden beim ersten Call
            // dieses Frames bereits gesetzt — keine Notwendigkeit zu wiederholen.
            return this.state._groundedCache === true;
        }

        const rays = [
            { offsetX: 0, offsetZ: 0 },
            { offsetX: 0.45, offsetZ: 0 },
            { offsetX: -0.45, offsetZ: 0 },
            { offsetX: 0, offsetZ: 0.45 },
            { offsetX: 0, offsetZ: -0.45 },
            { offsetX: 0.45, offsetZ: 0.45 },
            { offsetX: -0.45, offsetZ: -0.45 },
            { offsetX: 0.45, offsetZ: -0.45 },
            { offsetX: -0.45, offsetZ: 0.45 },
        ];

        let isGrounded = false;

        // `groundDistance` 0.6 (nicht 0.5): ein auf einer Bauwerks-Plattform aufsetzender Spieler liegt oft
        // knapp über der Box-Oberseite — sonst wird der Sprung um einen Frame verweigert.
        const groundDistance = 0.6;

        // Slope-Steepness: je Hit die FLACHSTE Fläche (höchstes normal.y) tracken; liegt keine über
        // hang.maxSlopeY (Steilhang-Gesetz), gilt der Spieler als „auf steilem Hang" (gedrosselt, rutscht).
        let bestNormalY = 0;

        for (const ray of rays) {
            const rayStart = this.setVec(
                this.state.tmpVec1,
                (this.state.playerMesh.position.x + ray.offsetX) / this.state.scaleFactor,
                (this.state.playerMesh.position.y - 0.5) / this.state.scaleFactor,
                (this.state.playerMesh.position.z + ray.offsetZ) / this.state.scaleFactor
            );
            const rayEnd = this.setVec(
                this.state.tmpVec2,
                (this.state.playerMesh.position.x + ray.offsetX) / this.state.scaleFactor,
                (this.state.playerMesh.position.y - 3.0) / this.state.scaleFactor,
                (this.state.playerMesh.position.z + ray.offsetZ) / this.state.scaleFactor
            );
            this._runRaycast(rayStart, rayEnd, (cb, hit) => {
                if (!hit) return;
                const hitPoint = cb.get_m_hitPointWorld();
                const hitY = hitPoint.y() * this.state.scaleFactor;
                const distance = Math.abs(hitY - (this.state.playerMesh.position.y - 0.5));
                if (distance < groundDistance) {
                    isGrounded = true;
                    // Normal aufsammeln — flachste (höchstes y) gewinnt: wenn
                    // ein Ray auf eine flache Sub-Fläche trifft (Treppe, kleine
                    // Plattform), zählt der Spieler als „begehbar geerdet".
                    const hitNormal = cb.get_m_hitNormalWorld();
                    const ny = hitNormal.y();
                    if (ny > bestNormalY) bestNormalY = ny;
                }
            });
        }

        this.state.groundNormalY = isGrounded ? bestNormalY : 1.0;
        this.state.onSteepSlope =
            isGrounded && bestNormalY < AnazhRealm._bewegungsBlock("hang", ["maxSlopeY", "malus"]).maxSlopeY;

        // Welle 6.X.5 D1 — Cache-Set am Ende des frischen Compute. Side-effects
        // (groundNormalY, onSteepSlope) sind oben bereits aktualisiert; Cache-
        // Hits in den nächsten 2 Frames lesen die nun stehen-gelassenen Werte.
        this.state._groundedCache = isGrounded;
        this.state._groundedCachedAt = now;
        return isGrounded;
    }

    // Voxel ist permanent: getTerrainHeightAt/findSurfaceAbove lesen nur den Voxel-Pfad; Default
    // `terrainBaseHeight || 0`, falls `_voxelSurfaceY` nicht-finit ist (vor Welt-Aufbau, Edge-Case).
    getTerrainHeightAt(x, z) {
        const vy = this._voxelSurfaceY(x, z);
        if (typeof vy === "number" && Number.isFinite(vy)) return vy;
        return this.state.terrainBaseHeight || 0;
    }

    findSurfaceAbove(x, _currentY, z) {
        const vy = this._voxelSurfaceY(x, z);
        return typeof vy === "number" && Number.isFinite(vy) ? vy : this.state.terrainBaseHeight || 0;
    }
}
