class AnazhRealm_bild_sicht {
    // ===== ATLAS · Bild/sicht — Szene-Tiefe · Spiegel · Feld-Pass · Panorama · Höhlen-Sicht =====
    // DIE EINE SZENEN-TIEFE: Wasser (bis V18.529 der Modul-Knoten der linearen Tiefe) und Feld-Pass (ein zweiter
    // `viewportDepthTexture()`) zogen zwei Kopien derselben Szenen-Tiefe (gemessen 04.10.: zwei „szene:tiefenkopie" am
    // Szene-Ziel) — beide Leser lesen diesen EINEN Knoten. DAS TIEFEN-ABBILD (0710-1 P2, Runde 2, Frage 1): beide Leser
    // schreiben selbst Tiefe (Wasser `depthWrite`, der March seine Fragment-Tiefe), also braucht ihr Lesen eine Kopie im
    // Pass-Bruch — r184 kennt keinen nur-lesend angehängten Tiefen-Anhang. Aber keiner braucht sie Pixel für Pixel: das
    // Wasser rechnet den optischen Weg zum Grund (weiche Ufer), der March bricht an der Szenen-Tiefe ab (dahinter verwürfe
    // ihn der Tiefentest). Die volle Kopie (depth24plus, 7,9 MB bei 1080p) wird ein Abbild in halber BREITE, je Texel die
    // FERNSTE Tiefe seines waagrechten Pixel-Paars (r32float, 4,0 MB): der March läuft am Rand höchstens einen Pixel weiter
    // (der Test verwirft), das Wasser liest an der Kante eines Gegenstands im Wasser den Grund dahinter, nie den Gegenstand.
    // DIE ZEILE BLEIBT GANZ (Integration Welle L wasser × K host-vram, 08.10.): das Paar liegt in EINER Zeile — der Grund
    // entfernt sich mit der Bild-Zeile, nie innerhalb einer; das 2×2-Maximum las die Hälfte der Pixel eine Zeile weiter, und
    // das Wasser der Welle L (der Durchlass und das Ufer-Band aus dem optischen Weg) zeigte das: über hellem Grund 6 Stufen
    // dunkler als mit r184s Tiefe, am Pfahl 7 von 38 Kanten-Pixeln bis 14 Luma (gate:post-kette (e)/(f)); mit dem Paar 0
    // und 0. Gezeichnet im Pass-Bruch des Hauptbilds (`_tiefenAbbild`); der WebGL2-Rückfall und der Null-Renderer behalten
    // r184s Viewport-Tiefe.
    // DER WERT IST EIN SKALAR: r184s Viewport-Tiefe ist ein Knoten auf einer Tiefen-Textur (Typ float); das Abbild ist eine
    // r32float-Farbtextur, ihr Knoten liefert vec4 (d, 0, 0, 1). Roh weitergereicht, rechnete das Wasser seinen optischen Weg
    // als vec4 — der Durchlass (Beer-Lambert) weitete `vec3(wK)` und die Luma-Gewichte auf vec4 mit 1,0 und zählte die vierte
    // Komponente mit (gemessen 07.10., GTX 1060, Nord-Ufer: das Becken türkis statt grau, 99/131/116 → 114/166/147). Die
    // Leser bekommen `.x`; `_szeneTiefeKnoten` bleibt der Textur-Knoten (Zug, Zerleg-Linse, gate:post-kette).
    _szeneTiefe() {
        if (this._szeneTiefeWert) return this._szeneTiefeWert;
        const rend = this.state.renderer;
        const T = THREE.TSL;
        if (!rend || rend._isHeadlessNull || !rend.backend || rend.backend.isWebGPUBackend !== true) {
            this._szeneTiefeKnoten = T.viewportDepthTexture();
            this._szeneTiefeKnoten.defaultFramebuffer.name = "szene:tiefenkopie";
            this._szeneTiefeWert = this._szeneTiefeKnoten;
            return this._szeneTiefeWert;
        }
        const abbild = new THREE.DataTexture(new Float32Array(1), 1, 1, THREE.RedFormat, THREE.FloatType);
        abbild.name = "szene:tiefenabbild";
        // ein Ziel ohne hochgeladene Daten: r184 legt es an, gezeichnet wird es im Pass-Bruch
        abbild.isRenderTargetTexture = true;
        abbild.minFilter = THREE.NearestFilter;
        abbild.magFilter = THREE.NearestFilter;
        abbild.generateMipmaps = false;
        // JEDES PIXEL LIEST DAS PAAR, DAS ES ENTHÄLT (Gegenprüfung 0710-3): ganzzahlig, x / 2, y ganz. Vorher las `screenUV` mit
        // Nearest bei uv = (x + 0,5)/W eine Textur der Breite ceil(W/2) — bei UNGERADER Leinwand traf jedes ungerade x der
        // rechten Hälfte (ungerade Höhe: der unteren) den Nachbar-Block (x+1, x+2): neben einem Gegenstand vor dem Wasser las
        // das Wasser den Gegenstand, ein heller Saum von 1 px (Radeon, TRAA, 1921×1081: 57–85 von ~290 Kanten-Pixeln +8 Luma;
        // gate:post-kette (f), 321×241: 11 von 31 bis 45,5), der March verlor 1 px eines fernen Körpers.
        const knoten = T.texture(abbild).load(T.ivec2(T.screenCoordinate.xy).div(T.ivec2(2, 1)));
        // je Render EINMAL, ausgelöst vom ersten Leser, der zeichnet (wie r184s Viewport-Tiefe)
        knoten.updateBeforeType = "render";
        knoten.updateBefore = (frame) => this._tiefenAbbild(frame, abbild);
        this._szeneTiefeKnoten = knoten;
        this._szeneTiefeWert = knoten.x;
        return this._szeneTiefeWert;
    }

    // DER ZUG DES TIEFEN-ABBILDS: im Hauptbild (Post-Kette oder Direktpfad — die Szene mit der Spiel-Kamera) bricht r184s
    // eigener Weg den Pass (`backend.copyFramebufferToTexture`: Pass beenden, auf demselben Encoder kopieren, mit `load` neu
    // beginnen); kopiert wird in eine 1×1-Attrappe der Szenen-Tiefe, und genau diese eine Encoder-Kopie wird zum Abbild-Pass
    // (ein Vollbild-Dreieck lädt je Pixel des Abbilds das waagrechte Paar der Szenen-Tiefe und schreibt sein Maximum). So
    // bleibt der Bruch
    // r184s Choreographie (gate:vendor-anker pinnt sie), und die Tiefe des Hauptbilds steht im Abbild, bevor der erste
    // Leser zeichnet.
    _tiefenAbbild(frame, abbild) {
        const st = this.state;
        const rend = frame.renderer;
        if (frame.scene !== st.scene || frame.camera !== st.camera) return;
        const ctx = rend._currentRenderContext;
        if (!ctx || !ctx.depthTexture) return;
        const be = rend.backend;
        const quelle = be.get(ctx.depthTexture).texture;
        if (!quelle) return;
        const w = Math.max(1, Math.ceil(quelle.width / 2)),
            h = Math.max(1, quelle.height);
        if (abbild.image.width !== w || abbild.image.height !== h) {
            abbild.image = { data: null, width: w, height: h };
            abbild.needsUpdate = true;
        }
        rend._textures.updateTexture(abbild);
        const ziel = be.get(abbild).texture;
        let A = this._tiefenAbbildGpu;
        if (!A) {
            const modul = be.device.createShaderModule({
                label: "szene:tiefenabbild",
                code:
                    "@group(0) @binding(0) var tiefe: texture_depth_2d;\n" +
                    "@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {\n" +
                    "    let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));\n" +
                    "    return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);\n" +
                    "}\n" +
                    "@fragment fn fs(@builtin(position) p: vec4f) -> @location(0) vec4f {\n" +
                    "    let q = vec2i(textureDimensions(tiefe)) - vec2i(1, 1);\n" +
                    "    let b = vec2i(i32(p.x) * 2, i32(p.y));\n" +
                    "    var d = 0.0;\n" +
                    "    for (var i = 0; i < 2; i++) { d = max(d, textureLoad(tiefe, min(b + vec2i(i, 0), q), 0)); }\n" +
                    "    return vec4f(d, 0.0, 0.0, 1.0);\n" +
                    "}\n",
            });
            // die 1×1-Attrappe der Szenen-Tiefe: r184 kopiert im Pass-Bruch in sie, die Kopie wird zum Abbild-Pass
            const bruch = new THREE.DepthTexture(1, 1);
            bruch.name = "szene:tiefenabbild:bruch";
            A = this._tiefenAbbildGpu = {
                pipe: be.device.createRenderPipeline({
                    label: "szene:tiefenabbild",
                    layout: "auto",
                    vertex: { module: modul, entryPoint: "vs" },
                    fragment: { module: modul, entryPoint: "fs", targets: [{ format: "r32float" }] },
                    primitive: { topology: "triangle-list" },
                }),
                attrappe: bruch,
                rechteck: new THREE.Vector4(0, 0, 1, 1),
                quelle: null,
                ziel: null,
            };
        }
        if (A.quelle !== quelle || A.ziel !== ziel) {
            A.gruppe = be.device.createBindGroup({
                layout: A.pipe.getBindGroupLayout(0),
                entries: [{ binding: 0, resource: quelle.createView({ aspect: "depth-only" }) }],
            });
            A.ansicht = ziel.createView();
            A.quelle = quelle;
            A.ziel = ziel;
        }
        A.attrappe.type = quelle.format === "depth32float" ? THREE.FloatType : THREE.UnsignedIntType;
        rend._textures.updateTexture(A.attrappe);
        A.attrappeGpu = be.get(A.attrappe).texture;
        // die Marke für den Ziel-Zensus: die Kopie hierher findet nie statt, der Haken zeichnet sie ins Abbild
        if (A.attrappeGpu) A.attrappeGpu.__umleitung = "szene:tiefenabbild";
        // DER HAKEN AN DER ENCODER-KOPIE liegt EINMAL (Gegenprüfung 0710-3: vorher je Frame ein- und ausgehängt — jede
        // Zuweisung an `GPUCommandEncoder.prototype` verwirft, was der Motor über die Methode aller Aufrufer annahm); scharf
        // ist er nur für die Dauer des EINEN Bruchs (`A.scharf`, try/finally), jede andere Kopie fährt r184 unverändert.
        if (!A.haken) {
            const E = GPUCommandEncoder.prototype;
            const kopieRoh = E.copyTextureToTexture;
            E.copyTextureToTexture = function (von, nach, groesse) {
                if (!A.scharf || !nach || nach.texture !== A.attrappeGpu)
                    return kopieRoh.call(this, von, nach, groesse);
                const pass = this.beginRenderPass({
                    label: "szene:tiefenabbild",
                    colorAttachments: [
                        { view: A.ansicht, loadOp: "clear", storeOp: "store", clearValue: [1, 0, 0, 1] },
                    ],
                });
                pass.setPipeline(A.pipe);
                pass.setBindGroup(0, A.gruppe);
                pass.draw(3);
                pass.end();
                return undefined;
            };
            A.haken = true;
        }
        A.scharf = true;
        try {
            be.copyFramebufferToTexture(A.attrappe, ctx, A.rechteck);
        } finally {
            A.scharf = false;
        }
    }

    // DER TAUSCH DES TIEFEN-KNOTENS: die Leser der Szenen-Tiefe (der EINE Knoten `_szeneTiefe` — auf WebGPU das
    // Tiefen-Abbild, im Rückfall r184s ViewportDepthTextureNode) sind das Wasser (weiche Ufer) und der Feld-Pass (die
    // Tiefen-Grenze des Marchs). Wechselt der KNOTEN selbst (eine Linse tauscht `_szeneTiefeKnoten`/`_szeneTiefeWert` für
    // ein A/B in EINER Welt: gate:post-kette (e), die Werkbank), ändert sich der Shader-Graph beider Leser: das Wasser-
    // Material wird frisch gebaut (die Uniform-Werte reisen mit), der Feld-Pass fällt und baut sich im nächsten
    // Fern-Ring-Takt neu. Ein Größenwechsel braucht das nie — die neu angelegte TEXTUR desselben Knotens trägt die Diät
    // (Vorher-Textur-Wächter, `_diaetVorTextur`); der resize-Handler baute hier bis 0910-3 A einen Zwilling davon.
    _tiefenKnotenTausch() {
        const st = this.state;
        if (st.feldPass) this._feldPassDispose();
        const alt = st.hydroSurfaceMaterial;
        if (!alt) return 0;
        const altU = st.hydroSurfaceUniforms || {};
        st.hydroSurfaceMaterial = null;
        const neu = this._ensureHydroSurfaceMaterial();
        if (!neu) {
            st.hydroSurfaceMaterial = alt;
            return 0;
        }
        const neuU = st.hydroSurfaceUniforms || {};
        for (const k of Object.keys(altU)) {
            const a = altU[k],
                n = neuU[k];
            if (!a || !n || a === n || a.value == null) continue;
            if (n.value && typeof n.value.copy === "function") n.value.copy(a.value);
            else n.value = a.value;
        }
        // Szene (inkl. Bundles) UND die Chunk-Wasser-Ablage — ein gerade ausgehängtes Mesh nähme sonst das
        // entsorgte Material wieder mit in die Welt.
        let umgehaengt = 0;
        const haenge = (o) => {
            if (!o || o.material !== alt) return;
            o.material = neu;
            umgehaengt++;
            if (o.parent && o.parent.isBundleGroup) o.parent.needsUpdate = true;
        };
        st.scene.traverse(haenge);
        if (st.voxelChunkWaterIso) for (const m of st.voxelChunkWaterIso.values()) haenge(m);
        alt.dispose();
        return umgehaengt;
    }

    // Der EINE Wasser-Shader für alle Iso-Wasser-Meshes (Ozean + See + Fluss): `aWave` ∈ [0,1]
    // (Ozean-Anteil, skaliert die Wellen; weich 0 am Ufer → kein Küsten-Riss), `aFlow` (Gefälle-
    // Tangente, die Strömung trägt das Bild stromab). Sonne/Licht/Fog speist `_applyDayNightToScene`.
    // DER WASSER-KÖRPER (K16, die Naht des Wassers): was die optisch tiefe Wassersäule zurückstreut, R∞ = 0,33 · b_b / (a + b_b)
    // je Kanal (Gordon 1975; a = die Absorption wK des Gesetzes, b_b = seine Rückstreuung `koerperStreu`, 1/m) — EINE Formel
    // für den Wasser-Stoff und jeden Fern-Leser (Ring, Feld-Pass). Bis K16 trug die Ferne ein eigenes Fern-Blau
    // (`FERN_FARBE.wasser`, 0x265273): der Fluss im Ring 4,8× heller als der gebaute (Luma 0,255 gegen 0,053).
    // DURCH DIE FLÄCHE (A12-n1): die Strahldichte unter Wasser tritt um n² verdünnt aus (L/n² bleibt über die Grenze erhalten;
    // n aus dem Fresnel des Gesetzes, f0 = ((n − 1)/(n + 1))² = 0,02 → n 1,329) — der Körper zeigt R∞/n², den Fresnel (1 − F)
    // legt der Blick darauf (`_wasserBlick`). Bis A12-n1 trat er unverdünnt aus: 1,77× zu hell, das Blau des Körpers deckte
    // das Bild im Spiegel (der See zu blau, spiegelTreue an der Tafel 0,52).
    static _wasserKoerper(WG) {
        const w = Math.sqrt(WG.fresnel[0]);
        const n = (1 + w) / (1 - w);
        return WG.wK.map((k) => (0.33 * WG.koerperStreu) / (k + WG.koerperStreu) / (n * n));
    }

    // DAS SPIEGEL-FELD (D10, der See spiegelt die Welt): n × n Zellen à texel m um das Auge aus dem GEBAUTEN Boden des Workers
    // (`spiegelFeldBacken`) — die Höhen (`tex`, RGBA-Halbfloat: die untere Fläche, Basis und Dach der Kronen-Schicht, ihre
    // Gestalt + 1), der Stoff der unteren Fläche (`stoffTex`, RGBA8: Albedo als Wurzel, die Art), die Farbe jeder Krone
    // (`laubTex`, je Gestalt eine Zeile) und die Höchste je Block (`hTex`). Die Zelle (I, J) liegt im Platz (I mod n,
    // J mod n): die Textur wiederholt sich, der Pass greift mit Welt-Koordinaten zu, und eine Drift backt nur die Streifen, die
    // das Fenster betreten — ihre Plätze sind sofort leer, nie die Zelle von früher.
    _spiegelFeld() {
        const st = this.state;
        if (st.spiegelFeld) return st.spiegelFeld;
        const K = AnazhRealm.SPIEGEL;
        const n = K.n;
        const leer = THREE.DataUtils.toHalfFloat(-30000);
        const daten = new Uint16Array(n * n * 4);
        for (let p = 0; p < daten.length; p += 4) daten[p] = daten[p + 1] = daten[p + 2] = leer;
        const tex = new THREE.DataTexture(daten, n, n, THREE.RGBAFormat, THREE.HalfFloatType);
        tex.name = "spiegel:feld";
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        // die Höchste je Block (der Sprung des Passes): nb × nb Blöcke im selben Wiederhol-Raster, leer −30 000 m
        const nb = n / K.block;
        const hoechste = new Float32Array(nb * nb).fill(-30000);
        const hTex = new THREE.DataTexture(hoechste, nb, nb, THREE.RedFormat, THREE.FloatType);
        hTex.name = "spiegel:hoechste";
        hTex.minFilter = hTex.magFilter = THREE.NearestFilter;
        hTex.generateMipmaps = false;
        hTex.needsUpdate = true;
        const stoff = new Uint8Array(n * n * 4);
        const stoffTex = new THREE.DataTexture(stoff, n, n, THREE.RGBAFormat, THREE.UnsignedByteType);
        stoffTex.name = "spiegel:stoff";
        stoffTex.minFilter = stoffTex.magFilter = THREE.NearestFilter;
        stoffTex.generateMipmaps = false;
        stoffTex.needsUpdate = true;
        // die Kronen-Farben als Halbfloat: eine Farbe trägt keine 32 bit (gate:ziel-zensus FORMAT, am Bach der Mess-Wiese)
        const laub = new Uint16Array(K.laubFarben * 4);
        const laubTex = new THREE.DataTexture(laub, K.laubFarben, 1, THREE.RGBAFormat, THREE.HalfFloatType);
        laubTex.name = "spiegel:laub";
        laubTex.minFilter = laubTex.magFilter = THREE.NearestFilter;
        laubTex.generateMipmaps = false;
        laubTex.needsUpdate = true;
        st.spiegelFeld = {
            n,
            texel: K.texel,
            daten,
            tex,
            nb,
            hoechste,
            hTex,
            stoff,
            stoffTex,
            laub,
            laubTex,
            leer,
            // der Bezug der Höhe (der Meeresspiegel): ±256 m um ihn trägt der Halbfloat auf 0,125 m
            bezug: Number.isFinite(st.waterLevel) ? st.waterLevel : 0,
            I0: null,
            J0: null,
            mitte: null,
            auftraege: [],
            imFlug: false,
            hMax: -30000,
            wasser: 0,
            baumZahl: -1,
            nachlese: 0,
            gestalten: new Map(),
            // die Kronen-Gestalten, die der Worker noch nicht kennt (`_spiegelKronen`)
            gestaltenNeu: [],
            // der Stand des Felds: jede Änderung einer seiner Texturen (der Pass liest ihn in seiner Signatur)
            stand: 0,
        };
        return st.spiegelFeld;
    }

    // DER TAKT DES SPIEGEL-FELDS (je Frame, vor dem Bild): driftet das Auge weiter als SPIEGEL.drift, wandert das Fenster;
    // stehen neue Kronen darin, backt die Nachlese es neu. Ein Auftrag fliegt zur Zeit und nur, wenn der Worker keinen Chunk
    // baut (das Streamen hat Vorrang, Lehre 13) und das erste Weltbild steht (die Ankunft trägt keinen Spiegel).
    _spiegelFeldTakt() {
        const st = this.state;
        const rend = st.renderer;
        if (!st._weltbildDa || !st.camera || !rend || rend._isHeadlessNull || !st.voxelWorkerReady) return;
        const K = AnazhRealm.SPIEGEL;
        const S = this._spiegelFeld();
        const auge = st.camera.getWorldPosition(this._spiegelAuge || (this._spiegelAuge = new THREE.Vector3()));
        const jetzt = performance.now();
        if (!S.mitte || Math.hypot(auge.x - S.mitte[0], auge.z - S.mitte[1]) > K.drift) this._spiegelFeldFenster(auge);
        else if (!S.auftraege.length && !S.imFlug && jetzt - S.nachlese > K.nachleseMs) {
            const z = this._spiegelKronen(S.I0 * S.texel, S.J0 * S.texel, S.n * S.texel, S.n * S.texel, S, true);
            S.nachlese = jetzt;
            if (z !== S.baumZahl) {
                S.baumZahl = z;
                this._spiegelFeldAuftraege(S, S.I0, S.J0, S.n, S.n, false);
            }
        }
        if (S.imFlug || !S.auftraege.length || st.voxelWorkerPending.size > 0) return;
        const a = S.auftraege[0];
        const t = S.texel;
        const kr = this._spiegelKronen(a.i0 * t, a.j0 * t, a.w * t, a.h * t, S, false);
        S.auftraege.shift();
        S.imFlug = true;
        // jede Gestalt reist einmal: die, die der Worker noch nicht kennt
        const gestalten = S.gestaltenNeu.splice(0);
        this._voxelWorkerSpiegel({
            i0: a.i0,
            j0: a.j0,
            w: a.w,
            h: a.h,
            texel: t,
            bezug: S.bezug,
            wasserFarbe: this._fernWasserKoerper(),
            baeume: kr.baeume,
            gestalten,
            block: AnazhRealm.SPIEGEL.block,
            kronenSaum: AnazhRealm.SPIEGEL.kronenSaum,
        })
            .then((r) => {
                S.imFlug = false;
                const n = S.n;
                const D = S.daten;
                // nur Zellen im HEUTIGEN Fenster (ein Auftrag aus einem verlassenen Fenster schreibt seine Schnittmenge)
                for (let j = 0; j < a.h; j++) {
                    const J = a.j0 + j;
                    if (J < S.J0 || J >= S.J0 + n) continue;
                    const zeile = (((J % n) + n) % n) * n;
                    for (let i = 0; i < a.w; i++) {
                        const I = a.i0 + i;
                        if (I < S.I0 || I >= S.I0 + n) continue;
                        const o = (zeile + (((I % n) + n) % n)) * 4,
                            q = (j * a.w + i) * 4;
                        // die Wasser-Zellen des Fensters zählen genau: der Platz verliert seine alte Art, gewinnt die neue
                        S.wasser += (r.stoff[q + 3] === 1 ? 1 : 0) - (S.stoff[o + 3] === 1 ? 1 : 0);
                        for (let k = 0; k < 4; k++) {
                            D[o + k] = r.hoehen[q + k];
                            S.stoff[o + k] = r.stoff[q + k];
                        }
                    }
                }
                const b = AnazhRealm.SPIEGEL.block,
                    nb = S.nb,
                    bw = a.w / b;
                for (let q = 0; q < r.hoechste.length; q++) {
                    const I = a.i0 / b + (q % bw),
                        J = a.j0 / b + Math.floor(q / bw);
                    if (I < S.I0 / b || I >= (S.I0 + n) / b || J < S.J0 / b || J >= (S.J0 + n) / b) continue;
                    S.hoechste[(((J % nb) + nb) % nb) * nb + (((I % nb) + nb) % nb)] = r.hoechste[q];
                }
                S.hTex.needsUpdate = true;
                S.stoffTex.needsUpdate = true;
                S.hMax = this._spiegelHoechsteAller(S);
                S.tex.needsUpdate = true;
                S.stand++;
            })
            .catch((e) => {
                S.imFlug = false;
                S.gestaltenNeu.unshift(...gestalten);
                this._stoffBruch("das Spiegel-Feld (Worker-Auftrag spiegel-feld)", e);
            });
    }

    // DAS FENSTER WANDERT: n × n Zellen um das Auge. Backen nur die Streifen, die neu ins Fenster treten (ihre Plätze leer,
    // bis der Worker sie füllt); offene Aufträge behalten ihren Teil im neuen Fenster (die Antwort schreibt ohnehin nur ihre
    // Schnittmenge) — ganz neu nur beim ersten Fenster oder einem Sprung über die Kante. Bis D10-n1 leerte jede Drift mit
    // offenen Aufträgen das ganze Feld: bei schneller Fahrt spiegelte der See den Himmel. Die Ecke liegt auf dem Raster der
    // Blöcke: jeder Auftrag trägt ganze Blöcke, ihre Höchste rechnet der Worker allein.
    _spiegelFeldFenster(auge) {
        const S = this._spiegelFeld();
        const n = S.n,
            t = S.texel,
            b = AnazhRealm.SPIEGEL.block;
        const I0 = b * Math.round((auge.x / t - n / 2) / b),
            J0 = b * Math.round((auge.z / t - n / 2) / b);
        const aI = S.I0,
            aJ = S.J0;
        const ganz = aI == null || Math.abs(I0 - aI) >= n || Math.abs(J0 - aJ) >= n;
        S.I0 = I0;
        S.J0 = J0;
        S.mitte = [(I0 + n / 2) * t, (J0 + n / 2) * t];
        const offen = S.auftraege.splice(0);
        if (ganz) {
            this._spiegelFeldAuftraege(S, I0, J0, n, n, true);
            return;
        }
        for (const a of offen) {
            const i0 = Math.max(a.i0, I0),
                i1 = Math.min(a.i0 + a.w, I0 + n),
                j0 = Math.max(a.j0, J0),
                j1 = Math.min(a.j0 + a.h, J0 + n);
            if (i1 > i0 && j1 > j0) S.auftraege.push({ i0, j0, w: i1 - i0, h: j1 - j0 });
        }
        // der Streifen der Spalten, die neu sind (über alle Zeilen), dann der der Zeilen über die alten Spalten
        const iA = I0 > aI ? aI + n : I0,
            iB = I0 > aI ? I0 + n : aI;
        if (iB > iA) this._spiegelFeldAuftraege(S, iA, J0, iB - iA, n, true);
        const jA = J0 > aJ ? aJ + n : J0,
            jB = J0 > aJ ? J0 + n : aJ;
        const sA = Math.max(I0, aI),
            sB = Math.min(I0 + n, aI + n);
        if (jB > jA && sB > sA) this._spiegelFeldAuftraege(S, sA, jA, sB - sA, jB - jA, true);
    }

    // Ein Rechteck der Zellen in Aufträge zu höchstens SPIEGEL.zeilen × n Zellen, nah am Auge zuerst; `leeren` setzt seine
    // Plätze sofort leer (A = −30 000 m: kein Strahl trifft dort, bis der Worker füllt).
    _spiegelFeldAuftraege(S, i0, j0, w, h, leeren) {
        const n = S.n,
            b = AnazhRealm.SPIEGEL.block;
        if (leeren) {
            for (let j = j0; j < j0 + h; j++) {
                const zeile = (((j % n) + n) % n) * n;
                for (let i = i0; i < i0 + w; i++) {
                    const o = (zeile + (((i % n) + n) % n)) * 4;
                    if (S.stoff[o + 3] === 1) S.wasser--;
                    S.daten[o] = S.daten[o + 1] = S.daten[o + 2] = S.leer;
                    S.daten[o + 3] = 0;
                    S.stoff[o] = S.stoff[o + 1] = S.stoff[o + 2] = S.stoff[o + 3] = 0;
                }
            }
            const nb = S.nb;
            for (let J = j0 / b; J < (j0 + h) / b; J++)
                for (let I = i0 / b; I < (i0 + w) / b; I++)
                    S.hoechste[(((J % nb) + nb) % nb) * nb + (((I % nb) + nb) % nb)] = -30000;
            S.hMax = this._spiegelHoechsteAller(S);
            S.tex.needsUpdate = true;
            S.hTex.needsUpdate = true;
            S.stoffTex.needsUpdate = true;
            S.stand++;
        }
        const zahl = Math.max(b, b * Math.floor((AnazhRealm.SPIEGEL.zeilen * n) / w / b));
        for (let j = j0; j < j0 + h; j += zahl) S.auftraege.push({ i0, j0: j, w, h: Math.min(zahl, j0 + h - j) });
        // die ganze Schlange nah am Auge zuerst (die Mitte des Fensters)
        const mi = S.I0 + n / 2,
            mj = S.J0 + n / 2;
        const ferne = (a) => Math.hypot(a.i0 + a.w / 2 - mi, a.j0 + a.h / 2 - mj);
        S.auftraege.sort((a, c) => ferne(a) - ferne(c));
    }

    // Die Höchste des ganzen Fensters (der Deckel des Passes, `hMax`): das Maximum der Höchsten je Block — sie fällt mit dem
    // Block, der das Fenster verlässt (bis D10-n1 wuchs sie mit jeder Antwort und fiel nie).
    _spiegelHoechsteAller(S) {
        let m = -30000;
        for (let q = 0; q < S.hoechste.length; q++) if (S.hoechste[q] > m) m = S.hoechste[q];
        return m;
    }

    // DIE KRONEN IM SPIEGEL: die stehenden Pflanzen im Rechteck (x0, z0, w, h; 20 m Rand für die Krone), wie das Bild sie
    // zeichnet — nah die Einträge um das Rechteck (die Plätze des Blocker-Netzes je Quadrat seiner kurzen Kante, Lehre 25: nie
    // der Bestand der Welt) mit der Gestalt ihrer Hülle (`_huelleG`), 64–384 m die Baum- und Strauch-Zellen der Streu
    // (`_spiegelStreuGestalt`). Jede Krone liest das Kronen-Buch (`_foundryBaumKrone`: die Krone, die der Foundry-Worker mit
    // dem Körper gebaut hat, Beipack `__krone`) — eine Pflanze ohne Krone im Buch zeichnet auch das Bild noch nicht (ihre
    // Höhen-Stufe lädt) und fehlt, bis die Nachlese sie zählt. Je Gestalt reisen einmal ihre Laub-Teile und ihre Farbe; die
    // Streu reist ohne Höhe (NaN: ihr Fuß ist der gebaute Boden des Workers, wie ihre Instanz auf dem Boden steht). `nurZahl`
    // zählt die Kronen des Rechtecks (die Nachlese). Bis D10-n2 leitete der Spiegel jede Kronen-Gestalt im Haupt-Faden ab
    // (`skelettDerGestalt`, am See bis 51 ms je Gestalt, der Takt bis 59 ms in einem Bild) und lief über den Bestand.
    _spiegelKronen(x0, z0, w, h, S, nurZahl) {
        const baeume = nurZahl ? null : [];
        let zahl = 0;
        if (!this._foundryEnabled()) return nurZahl ? 0 : { baeume: new Float32Array(0) };
        const R = 20;
        const drin = (x, z) => x >= x0 - R && x <= x0 + w + R && z >= z0 - R && z <= z0 + h + R;
        const setze = (krone, x, y, z, s, th) => {
            zahl++;
            if (nurZahl) return;
            let gi = S.gestalten.get(krone);
            if (gi === undefined) {
                gi = krone.teile.length ? S.gestalten.size : -1;
                S.gestalten.set(krone, gi);
                if (gi >= 0) S.gestaltenNeu.push({ i: gi, teile: krone.teile, farbe: krone.farbe });
                // die Farbe der Krone in ihrer Zeile (`laubTex`): der Pass liest sie an der Gestalt der Schicht
                if (gi >= 0 && gi < S.laub.length / 4) {
                    const h = THREE.DataUtils.toHalfFloat;
                    S.laub.set([h(krone.farbe[0]), h(krone.farbe[1]), h(krone.farbe[2]), h(1)], gi * 4);
                    S.laubTex.needsUpdate = true;
                    S.stand++;
                }
            }
            if (gi >= 0) baeume.push(x, y, z, s, Math.cos(th), Math.sin(th), gi);
        };
        // die Einträge: je Quadrat der kurzen Kante entlang der langen eine Frage an die Plätze (ein Streifen von 768 × 32 m
        // fragte als EIN Quadrat das ganze Fenster)
        const kurz = Math.max(Math.min(w, h), 1),
            lang = Math.max(w, h);
        const stuecke = Math.max(1, Math.round(lang / kurz));
        const nah = S.nah || (S.nah = []),
            gesehen = S.nahGesehen || (S.nahGesehen = new Set());
        nah.length = 0;
        gesehen.clear();
        for (let q = 0; q < stuecke; q++) {
            const c = ((q + 0.5) * lang) / stuecke;
            const n0 = nah.length;
            const weite = Math.max(lang / stuecke, kurz) / 2 + R;
            this._blockerUmPlatz(w >= h ? x0 + c : x0 + w / 2, w >= h ? z0 + h / 2 : z0 + c, weite, nah);
            let k = n0;
            for (let i = n0; i < nah.length; i++)
                if (!gesehen.has(nah[i])) {
                    gesehen.add(nah[i]);
                    nah[k++] = nah[i];
                }
            nah.length = k;
        }
        if (!S.arten) S.arten = new WeakMap();
        const tab = this._foundry && this._foundry.recipes;
        for (const e of nah) {
            const p = e.position;
            if (!p || !Number.isInteger(e._huelleG) || !drin(p.x, p.z)) continue;
            // je Eintrag gemerkt: sein Preset, wenn es wächst (Baum, Strauch), seine Welt-Skala und die Krone seiner Gestalt —
            // neu gelesen, wenn die Gestalt der Hülle oder die Prägung wechselt
            let a = S.arten.get(e);
            if (a === undefined) {
                const pr = this._foundryPresetForEntry(e);
                const rec = pr && tab ? tab[pr] : null;
                a =
                    rec && (rec.kind === "tree" || rec.kind === "shrub")
                        ? { preset: pr, k: this._studioWeltSkala(e) }
                        : null;
                S.arten.set(e, a);
            }
            if (!a) continue;
            if (a.g !== e._huelleG || a.ov !== e.studioOv) {
                a.g = e._huelleG;
                a.ov = e.studioOv;
                a.krone = undefined;
            }
            if (!a.krone) a.krone = this._foundryBaumKrone(a.preset, a.g, this._artifactStudioOv(e));
            if (!a.krone) continue;
            const s = (Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1) * a.k;
            setze(a.krone, p.x, p.y - 0.5, p.z, s, Number.isFinite(e.rotationY) ? e.rotationY : 0);
        }
        const regionen = this.state.scatterRegions;
        const regM = AnazhRealm.SCATTER.regionM;
        if (regionen instanceof Map)
            for (const region of regionen.values()) {
                // eine Region, die das Rechteck samt Rand nicht berührt, fragt keine Zelle
                const rx = region.regX * regM,
                    rz = region.regZ * regM;
                if (rx > x0 + w + 2 * R || rx + regM < x0 - 2 * R || rz > z0 + h + 2 * R || rz + regM < z0 - 2 * R)
                    continue;
                for (const zelle of region.cells || []) {
                    if (!zelle || !drin(zelle.x, zelle.z) || zelle.form === "boden" || zelle.wartet) continue;
                    const sg = this._spiegelStreuGestalt(zelle, S);
                    if (!sg) continue;
                    // die Krone der Zelle wechselt nie (das Buch räumt nie): einmal gefunden, gemerkt
                    if (!sg.krone) sg.krone = this._foundryBaumKrone(sg.preset, sg.g, null);
                    if (sg.krone) setze(sg.krone, sg.x, NaN, sg.z, sg.s, sg.yaw);
                }
            }
        return nurZahl ? zahl : { baeume: new Float32Array(baeume) };
    }

    // DIE GESTALT EINER STREU-ZELLE im Spiegel (gemerkt je Zellen-Datensatz): ihr Preset, die Gestalt, die Drehung und der Ort,
    // die ihre Materialisierung trägt (`_scatterMaterializeCell`: der EINE Streu-Same → `_foundryVariantFor`, dieselbe Gestalt
    // auf jeder Bahn), die Skala × die Welt-Skala des Presets. Null für Zellen ohne Baum oder Strauch der Foundry.
    _spiegelStreuGestalt(zelle, S) {
        if (!S.zellen) S.zellen = new WeakMap();
        let sg = S.zellen.get(zelle);
        if (sg !== undefined) return sg;
        sg = null;
        const preset = Number.isInteger(zelle.gestalt) ? this._foundryPresetFor(zelle.species) : null;
        const rec = preset && this._foundry && this._foundry.recipes ? this._foundry.recipes[preset] : null;
        if (rec && (rec.kind === "tree" || rec.kind === "shrub")) {
            const k = this._foundryWorldScaleMatrix(preset).elements[0];
            sg = {
                preset,
                g: zelle.gestalt,
                x: zelle.x,
                z: zelle.z,
                s: zelle.scale * (Number.isFinite(k) && k > 0 ? k : 1),
                yaw: Number.isFinite(zelle.yaw) ? zelle.yaw : 0,
                krone: undefined,
            };
        }
        S.zellen.set(zelle, sg);
        return sg;
    }

    // DER LESER DES SPIEGELS (D10): das Ziel des Passes, die Ansicht, aus der er rechnete (der Wasser-Stoff reprojiziert seinen
    // Welt-Punkt in sie — der Pass läuft nach dem Bild, das Wasser liest ihn im nächsten), und ob er lief. Angelegt mit dem
    // Wasser-Stoff in 1/teil des Schirms (`_spiegelZielMass`).
    _spiegelLeser() {
        const st = this.state;
        if (st.spiegelLeser) return st.spiegelLeser;
        const T = THREE.TSL;
        const m = this._spiegelZielMass();
        const rt = new THREE.RenderTarget(m.w, m.h, {
            type: THREE.HalfFloatType,
            depthBuffer: false,
        });
        rt.name = rt.texture.name = "spiegel:strahl";
        rt.texture.minFilter = rt.texture.magFilter = THREE.LinearFilter;
        rt.texture.generateMipmaps = false;
        // Ansicht und Schalter wechseln je Bild: sie reisen in der GETEILTEN renderGroup (`_uniformHeimatTeilen`, das Pflicht-Paar
        // der Observer-Diät) — als Objekt-Uniform fror der Wasser-Satz die Ansicht seines ersten Bilds ein (D10-n1: der Spiegel
        // stand nur im linken Viertel des Schirms, der Rest las den Himmel)
        st.spiegelLeser = Object.assign(
            { rt },
            this._uniformHeimatTeilen({ vp: T.uniform(new THREE.Matrix4()), an: T.uniform(0) })
        );
        return st.spiegelLeser;
    }

    // DER GLANZ EINES PIXELS (material.K4, das Glanz-Ziel des Szenen-Passes): wie sehr die gezeichnete Fläche spiegelt — 1 bis
    // zur Rauheit `glanzRauheit[0]`, 0 ab `glanzRauheit[1]`, der Klarlack (Lack, Klingen-Stahl) mit seiner eigenen. Nur ein
    // Stoff, der Glanz trägt, spiegelt: r184 setzt `specularColor` in jedem Standard- und Physical-Stoff (0,04 bzw. aus ior);
    // ein Basic- oder Lambert-Stoff (Wasser, Himmel, Funken, Schatten-Quads) setzt ihn nie, seine Variable bleibt WGSL-null.
    // Das Wasser erkennt der Pass an seiner Zelle (`_spiegelPass`).
    _glanzKnoten() {
        const T = THREE.TSL;
        const [a, b] = AnazhRealm.SPIEGEL.glanzRauheit;
        const glatt = (r) => T.float(1).sub(T.smoothstep(a, b, r));
        const g = T.max(glatt(T.roughness), T.clearcoat.mul(glatt(T.clearcoatRoughness)));
        const traegt = T.max(T.specularColor.r, T.max(T.specularColor.g, T.specularColor.b)).greaterThan(1e-3);
        return T.vec4(T.select(traegt, g, T.float(0)), 0, 0, 1);
    }

    // DIE EINE UMGEBUNG (material.K4, `scene.environmentNode`): was jeder Standard- und Physical-Stoff spiegelt — Glas, Lack,
    // Metall, nasser Stein —, aus EINER Quelle mit dem Wasser: der Spiegel-Pass (`_spiegelPass`, das Ziel des Lesers) am
    // Welt-Punkt des Fragments in der Ansicht seines Laufs, wo er die Fläche deckte, sonst der Himmel der EINEN Atmosphäre
    // (die PMREM-Umgebung, `_skyEnvRT`) in Richtung und Stufe, die r184s Umgebungs-Licht reicht (`getUV`, `getTextureLevel`).
    // Der Spiegel trägt nur die glatte Fläche (Gewicht 1 − smoothstep(`glanzRauheit`) der Stufe, wie sein Glanz-Ziel); das
    // Umgebungs-Licht (Stufe 1, die Bestrahlung) liest den Himmel allein. Bis material.K4 spiegelte jeder Stoff außer dem
    // Wasser den Himmel ohne Szene (die IBL des PMREM).
    _spiegelUmgebung(quelle) {
        if (this._spiegelUmgebungK) return this._spiegelUmgebungK;
        const T = THREE.TSL;
        const L = this._spiegelLeser();
        // EIN Knoten des Himmels für jeden Stoff (wie r184s Umgebung): er frischt seine PMREM-Stufen einmal je Render; die
        // Umgebung trägt den Himmel je Einheit des Lichts, das Licht jetzt reist in der geteilten Gruppe (`_umgebungLicht`)
        const himmel = T.pmremTexture(quelle).mul(this._umgebungLicht());
        const [a, b] = AnazhRealm.SPIEGEL.glanzRauheit;
        const N = Object.getPrototypeOf(THREE.InstanceNode);
        class SpiegelUmgebung extends N {
            constructor() {
                super("vec3");
            }
            setup(builder) {
                const stufe = builder.context.getTextureLevel ? builder.context.getTextureLevel(this, builder) : null;
                if (!stufe || stufe.isConstNode === true) return himmel;
                const clip = L.vp.mul(T.vec4(T.positionWorld, 1));
                const w = T.max(clip.w, 1e-4);
                const uv = T.vec2(clip.x.div(w).mul(0.5).add(0.5), T.float(0.5).sub(clip.y.div(w).mul(0.5)));
                const drin = T.step(0, uv.x).mul(T.step(uv.x, 1)).mul(T.step(0, uv.y)).mul(T.step(uv.y, 1));
                const k = drin
                    .mul(T.step(0, clip.w))
                    .mul(L.an)
                    .mul(T.float(1).sub(T.smoothstep(a, b, stufe)));
                const sp = T.texture(L.rt.texture, uv).level(T.float(0));
                return sp.rgb.mul(k).add(himmel.mul(T.float(1).sub(sp.a.mul(k))));
            }
        }
        this._spiegelUmgebungK = T.nodeObject(new SpiegelUmgebung());
        return this._spiegelUmgebungK;
    }

    // DER PASS DES SPIEGELS (D10, A1): je Pixel in 1/teil der Ausgabe, dessen Tiefe (der Szenen-Pass, das GEZEICHNETE Wasser)
    // an einer Wasser-Zelle des Felds liegt, der gespiegelte Strahl ZUERST im Bild (die Tiefe und Farbe des Szenen-Passes:
    // jede gezeichnete Gestalt lagetreu, A1 — bis dahin spiegelte nur, was das Feld kannte: Boden und die Kronen im Kronen-Buch
    // auf 2-m-Zellen, A0 an der Tafel ein Baum, blockig, spiegelTreue 0,318), dann jenseits des Schirms gegen die Höhe des
    // Felds — `schritte` Schritte: über der
    // Höchsten des Blocks der Sprung an seinen Rand, darunter Lipschitz-Schritte gegen die Rest-Höhe (höchstens `fein` Zellen),
    // `halbierungen` und die Sekante; am Treffer die Albedo im
    // Licht der Welt (`_weltLicht` an der Normale des Felds) unter der EINEN Luft längs des
    // gespiegelten Wegs. Ausgabe (Strahlung, Treffer); ohne Versatz je Pixel (die Zeit-Auflösung mittelt Kanten, kein Rauschen).
    // DER EINE SPIEGEL (material.K4): derselbe Strahl trägt jede glänzende Fläche (das Glanz-Ziel des Szenen-Passes,
    // `_glanzKnoten`) — gespiegelt an der Normale ihrer Tiefe statt an der Waagrechten des Wassers, ihr Bild vor ihrer Ebene;
    // jeder Standard- und Physical-Stoff liest ihn über die EINE Umgebung (`_spiegelUmgebung`), das Wasser wie bisher.
    _spiegelPass() {
        const st = this.state;
        if (st.spiegelPass) return st.spiegelPass;
        const T = THREE.TSL;
        const { Fn, Loop, If, Break, float, vec2, vec3, vec4, uniform, texture, screenUV, max, abs, smoothstep, mix } =
            T;
        const { normalize, dot, ivec2, select, floor, mod, step, min, exp, Continue } = T;
        const K = AnazhRealm.SPIEGEL;
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        const S = this._spiegelFeld();
        const L = this._spiegelLeser();
        const WL = this._weltLicht();
        // die EINE Luft (Pflicht jeder Szene: `_luftEnsure` legt sie an, der Pass läuft nur mit Szene und Szenen-Pass)
        this._luftEnsure();
        const luft = st.luft;
        const tiefe = T.texture(st.scenePass.getTextureNode("depth").value);
        // die Tiefe der Szene OHNE das Wasser (das Abbild `_szeneTiefe`, sein Fernstes je waagrechtem Paar): woran der Treffer
        // erkennt, dass er Wasser ist — fehlt es (kein WebGPU-Abbild), bricht der Pass laut
        this._szeneTiefe();
        const abbildTex = this._szeneTiefeKnoten && this._szeneTiefeKnoten.value;
        if (!abbildTex || abbildTex.name !== "szene:tiefenabbild")
            throw new Error("SPIEGEL-PASS: das Tiefen-Abbild der Szene (`_szeneTiefe`) fehlt");
        const abbild = T.texture(abbildTex);
        // DER GLANZ DES BILDS (material.K4, `_glanzKnoten`): woran der Pass jede spiegelnde Fläche erkennt, die nicht Wasser ist —
        // fehlt das Ziel (der Szenen-Pass ohne MRT), bricht der Pass laut
        const glanzTex = st.scenePass._textures && st.scenePass._textures.glanz;
        if (!glanzTex || glanzTex.format !== THREE.RedFormat)
            throw new Error("SPIEGEL-PASS: das Glanz-Ziel des Szenen-Passes (`_glanzKnoten`) fehlt");
        const glanzBild = T.texture(glanzTex);
        // das Bild des Szenen-Passes (linear, vor Zeit-Auflösung und Tönung): der Spiegel liest die Strahlung, die es zeichnet
        const farbe = st.scenePass.getTextureNode().value;
        const webgpuRaum = st.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        const U = {
            invVP: uniform(new THREE.Matrix4()),
            vp: uniform(new THREE.Matrix4()),
            auge: uniform(new THREE.Vector3()),
            // die Blick-Achse (w eines Punkts = sein Abstand längs ihr), die Nah-Ebene und die Tiefen-Zeilen der Projektion
            vorn: uniform(new THREE.Vector3()),
            nah: uniform(0.1),
            p10: uniform(-1),
            p14: uniform(-0.1),
            mitte: uniform(new THREE.Vector2()),
            bezug: uniform(S.bezug),
            hMax: uniform(0),
            // ein Texel des Pass-Ziels in uv (1/Breite, 1/Höhe)
            texel: uniform(new THREE.Vector2(1, 1)),
        };
        const kante = S.n * S.texel;
        const feld = (xz) => texture(S.tex, xz.div(kante)).level(float(0));
        const feldZelle = texture(S.tex);
        const stoffZelle = texture(S.stoffTex);
        const laubZeile = texture(S.laubTex);
        const hoechste = texture(S.hTex);
        const blockM = K.block * S.texel;
        // DER ABSTAND ZUR WELT längs der Senkrechten an p (Höhe y über dem Bezug, die gefilterten Höhen s): negativ im Boden
        // (unter der unteren Fläche) oder in der Krone (zwischen Basis und Dach), sonst der Abstand zur nächsten Fläche
        const abstand = (y, s) => min(y.sub(s.r), max(s.g.sub(y), y.sub(s.b)));
        const mat = new THREE.MeshBasicNodeMaterial();
        mat.name = "spiegel:strahl";
        mat.fog = false;
        mat.depthTest = false;
        mat.depthWrite = false;
        mat.fragmentNode = Fn(() => {
            const aus = vec4(0).toVar();
            const d = tiefe.load(ivec2(screenUV.mul(vec2(tiefe.size())))).r;
            If(d.lessThan(0.99999), () => {
                const ndc = vec4(
                    screenUV.x.mul(2).sub(1),
                    float(1).sub(screenUV.y).mul(2).sub(1),
                    webgpuRaum ? d : d.mul(2).sub(1),
                    1
                );
                const w4 = U.invVP.mul(ndc);
                const P = w4.xyz.div(w4.w).toVar();
                // der Wasser-Punkt: eine der vier Zellen um ihn ist Wasser (Art 1) und der gezeichnete Spiegel liegt an ihrem
                // (0,6 m tiefer gebackenen) Spiegel — der Strahl steigt von ihm auf, das Wasser des Orts trifft er nie. Bis A1
                // fragte nur die Zelle unter dem Punkt: am Ufer liegt das gezeichnete Wasser bis in die Land-Zellen, dort las der
                // See den Himmel (Treppen der 2-m-Zellen an der fernen Uferlinie). Der Ort fragt die Lage (er deckt jedes
                // gezeichnete Wasser samt Saum), der Treffer im Bild fragt das Abbild (unten): was ER ist, nie wo er liegt.
                const aufWasser = (pt) => {
                    const zw = floor(pt.xz.div(S.texel).sub(0.5));
                    const zelle = (di, dj) => {
                        const pl = ivec2(mod(zw.add(vec2(di, dj)), float(S.n)));
                        return abs(stoffZelle.load(pl).a.mul(255).sub(1.0))
                            .lessThan(0.5)
                            .and(abs(pt.y.sub(U.bezug).sub(feldZelle.load(pl).r.add(0.6))).lessThan(1.5));
                    };
                    return zelle(0, 0).or(zelle(1, 0)).or(zelle(0, 1)).or(zelle(1, 1));
                };
                const imFeld = (pt) => {
                    const rel = pt.xz.sub(U.mitte).div(kante);
                    return max(abs(rel.x), abs(rel.y)).lessThan(0.48);
                };
                const wasser = aufWasser(P).and(imFeld(P)).toVar();
                const tiefeGr0 = vec2(tiefe.size());
                const glaenzt = glanzBild
                    .load(ivec2(screenUV.mul(vec2(glanzBild.size()))))
                    .r.greaterThan(K.glanzSchwelle);
                If(wasser.or(glaenzt), () => {
                    const v = normalize(P.sub(U.auge));
                    // DIE FLÄCHE DES SPIEGELS (material.K4): das Wasser liegt waagrecht (sein Gesetz), jede andere glänzende Fläche
                    // (Glas, Lack, Metall, nasser Stein) trägt die Normale ihrer Tiefe — je Achse der Nachbar mit dem kleineren
                    // Sprung (an einer Kante der Fläche, nie über sie), zum Auge gewandt
                    const n = vec3(0, 1, 0).toVar();
                    const R = vec3(v.x, abs(v.y), v.z).toVar();
                    If(wasser.not(), () => {
                        const welt = (q) => {
                            const qq = T.clamp(q, vec2(0), tiefeGr0.sub(1));
                            const dq = tiefe.load(ivec2(qq)).r;
                            const uq = qq.add(0.5).div(tiefeGr0);
                            const h = U.invVP.mul(
                                vec4(
                                    uq.x.mul(2).sub(1),
                                    float(1).sub(uq.y).mul(2).sub(1),
                                    webgpuRaum ? dq : dq.mul(2).sub(1),
                                    1
                                )
                            );
                            return h.xyz.div(h.w);
                        };
                        const tq = floor(screenUV.mul(tiefeGr0));
                        const pc = welt(tq).toVar();
                        const naeher = (a, b) => select(a.length().lessThan(b.length()), a, b);
                        const dx = naeher(welt(tq.add(vec2(1, 0))).sub(pc), pc.sub(welt(tq.sub(vec2(1, 0)))));
                        const dy = naeher(welt(tq.add(vec2(0, 1))).sub(pc), pc.sub(welt(tq.sub(vec2(0, 1)))));
                        const nn = normalize(T.cross(dx, dy));
                        n.assign(select(dot(nn, U.auge.sub(pc)).lessThan(0.0), nn.negate(), nn));
                        R.assign(T.reflect(v, n));
                    });
                    // DER SPIEGEL DES BILDS (A1): der gespiegelte Strahl als Strecke im Schirm gegen die Tiefe des Szenen-Passes —
                    // was das Bild zeichnet (Baum jeder Art, Haus, Fels, Ufer, Leib, Wolke), steht im See, wo es steht, in der
                    // Auflösung des Bilds. Die Strecke endet bei `bildWeit` m oder vor der Nah-Ebene (steiler Blick: der Strahl
                    // läuft auf die Kamera zu), Schritte gleich im Schirm, die Tiefe je Schritt perspektivisch richtig (1/w
                    // linear); ein Schritt hinter der gezeichneten Fläche um weniger als ihre Dicke ist ein Treffer, die
                    // Halbierungen legen ihn auf den Rand. Verlässt die Strecke den Schirm, trägt das Feld den Rest des Strahls.
                    const cP = U.vp.mul(vec4(P, 1.0));
                    const rv = dot(R, U.vorn);
                    const tMax = select(
                        rv.lessThan(-1e-4),
                        min(cP.w.sub(U.nah.mul(2.0)).div(rv.negate()), float(K.bildWeit)),
                        float(K.bildWeit)
                    );
                    const cE = U.vp.mul(vec4(P.add(R.mul(tMax)), 1.0));
                    const iwP = float(1).div(cP.w),
                        iwE = float(1).div(max(cE.w, 1e-4));
                    const uvP = vec2(cP.x.mul(iwP).mul(0.5).add(0.5), float(0.5).sub(cP.y.mul(iwP).mul(0.5)));
                    const uvE = vec2(cE.x.mul(iwE).mul(0.5).add(0.5), float(0.5).sub(cE.y.mul(iwE).mul(0.5)));
                    const du = uvE.sub(uvP);
                    const austritt = (u, dd) =>
                        select(
                            dd.greaterThan(1e-6),
                            float(1).sub(u).div(dd),
                            select(dd.lessThan(-1e-6), u.negate().div(dd), float(1e6))
                        );
                    const sMax = min(min(austritt(uvP.x, du.x), austritt(uvP.y, du.y)), float(1.0));
                    const raus = sMax.lessThan(0.999);
                    const tiefeGr = vec2(tiefe.size());
                    const linear = (dd) => U.p14.div((webgpuRaum ? dd : dd.mul(2).sub(1)).add(U.p10));
                    const bild = vec3(0).toVar();
                    const bildW = float(0).toVar();
                    const sVor = float(0).toVar();
                    const wVor = cP.w.toVar();
                    // wo der Strahl HINTER einer gezeichneten Fläche verschwand (tiefer als ihre Dicke: der Busch am Ufer
                    // verdeckt, was er trifft) — von dort trägt ihn das Feld; −1: er blieb sichtbar
                    const sDeck = float(-1).toVar();
                    Loop(K.bildSchritte, ({ i }) => {
                        // dicht am Wasser-Punkt fein (das Ufer an der Linie ist wenige Pixel hoch), zum Ende der Strecke weit
                        const q0 = float(i).add(1).div(K.bildSchritte);
                        const s = T.pow(q0, float(K.bildDichte)).mul(sMax);
                        const ws = float(1).div(mix(iwP, iwE, s));
                        const uv = mix(uvP, uvE, s);
                        const tx = floor(uv.mul(tiefeGr));
                        const dz = tiefe.load(ivec2(tx)).r;
                        // die Mitte des Texels, dessen Tiefe gilt: streifend trägt ein halber Texel 0,07 m Höhe auf 100 m
                        const uc = tx.add(0.5).div(tiefeGr);
                        const wz = linear(dz);
                        const dicke = max(abs(ws.sub(wVor)).mul(2.0), ws.mul(K.bildDicke[0]).add(K.bildDicke[1]));
                        // was der Strahl trifft, steht ÜBER dem Wasser (`bildUfer` m): die Fläche des Sees selbst ist nie sein
                        // Bild — streifend liegt ihre Tiefe je Schirm-Zeile Meter weit auseinander (bis A1 die Streifen am Ufer).
                        // Die Höhe des Texels rechnet nur ein Kandidat (hinter der Fläche, innerhalb ihrer Dicke), nie jeder Schritt
                        const kandidat = float(0).toVar();
                        If(dz.lessThan(0.99999).and(ws.greaterThan(wz)).and(ws.sub(wz).lessThan(dicke)), () => {
                            const h4 = U.invVP.mul(
                                vec4(
                                    uc.x.mul(2).sub(1),
                                    float(1).sub(uc.y).mul(2).sub(1),
                                    webgpuRaum ? dz : dz.mul(2).sub(1),
                                    1
                                )
                            );
                            // DAS WASSER IST NIE SEIN BILD (A12) — erkannt an dem, was es IST, nie an einer Höhe (A12-n1): ein
                            // Texel zeigt Wasser, wo vor der Szene ohne das Wasser (das Tiefen-Abbild, gezogen im Pass-Bruch, ehe
                            // Wasser, Marsch und Transparentes zeichnen) eine Fläche um mehr als `bildSchicht` näher liegt und
                            // nicht vor dem Nachbarn ihres waagrechten Paars steht (das Abbild hält je Paar das Fernste: ein
                            // Halm von 1 px vor dem See trüge sonst dessen Grund). Ohne Fläche im Abbild (die Ferne des Marschs)
                            // ist es Bild. So fällt der Kamm, der Buckel des Wasser-Dachs, die höhere Fläche dahinter — und jedes
                            // Ding an der Wasserlinie bleibt. Bis A12-n1 hielt eine Höhe (±1,5 m um den Spiegel in 2×2 Zellen à
                            // 2 m): Pfahl, Halm, der Watende, der Wagen in der Furt und der Ufer-Busch verloren an der Linie ihr
                            // Bild (Prüfer A12: unter dem Pfahl 13 Zeilen, der Spiegel des 1,2-m-Stumpfs ganz)
                            const schicht = wz.mul(K.bildSchicht[0]).add(K.bildSchicht[1]);
                            const dOpak = abbild.load(ivec2(floor(tx.x.mul(0.5)), tx.y)).r;
                            const paarX = min(tx.x.add(1).sub(mod(tx.x, 2.0).mul(2)), tiefeGr.x.sub(1));
                            const wPaar = linear(tiefe.load(ivec2(paarX, tx.y)).r);
                            const wasserTexel = dOpak
                                .lessThan(0.99999)
                                .and(linear(dOpak).sub(wz).greaterThan(schicht))
                                .and(wz.greaterThan(wPaar.sub(schicht)));
                            // vor der Fläche des Spiegels (über dem Wasser, vor der Scheibe) um `bildUfer`; ein Wasser-Texel ist
                            // nur dem Wasser nie sein Bild — die Scheibe am See zeigt den See
                            kandidat.assign(
                                select(
                                    dot(h4.xyz.div(h4.w).sub(P), n)
                                        .greaterThan(K.bildUfer)
                                        .and(wasserTexel.and(wasser).not()),
                                    float(1),
                                    float(0)
                                )
                            );
                        });
                        If(sDeck.lessThan(0.0).and(dz.lessThan(0.99999)).and(ws.sub(wz).greaterThanEqual(dicke)), () =>
                            sDeck.assign(sVor)
                        );
                        If(kandidat.greaterThan(0.5), () => {
                            const sa = sVor.toVar(),
                                sb = s.toVar();
                            for (let k = 0; k < K.bildHalb; k++) {
                                const sm = sa.add(sb).mul(0.5);
                                const um = mix(uvP, uvE, sm);
                                const hinter = float(1)
                                    .div(mix(iwP, iwE, sm))
                                    .greaterThan(linear(tiefe.load(ivec2(um.mul(tiefeGr))).r));
                                If(hinter, () => sb.assign(sm)).Else(() => sa.assign(sm));
                            }
                            const uvT = mix(uvP, uvE, sb);
                            // die Farbe über die Fläche EINES Pass-Texels (1/teil des Schirms, ~3 × 3 Texel des Szenen-Bilds): vier
                            // bilineare Abgriffe um den Treffer — ein einzelner Abgriff tastete das Bild unter (A1-n1: Salz-Rauschen und
                            // Mosaik im Spiegel von Laub und Schilf)
                            const fu = U.texel.mul(0.25);
                            const tap = (dx, dy) => texture(farbe, uvT.add(fu.mul(vec2(dx, dy)))).level(float(0)).rgb;
                            bild.assign(tap(-1, -1).add(tap(1, -1)).add(tap(-1, 1)).add(tap(1, 1)).mul(0.25));
                            // am Schirm-Rand blendet der Treffer in den Rest des Strahls (das Feld, der Himmel): keine Naht
                            bildW.assign(
                                smoothstep(
                                    0.0,
                                    K.bildRand,
                                    min(min(uvT.x, float(1).sub(uvT.x)), min(uvT.y, float(1).sub(uvT.y)))
                                )
                            );
                            Break();
                        });
                        sVor.assign(s);
                        wVor.assign(ws);
                    });
                    // DAS FELD trägt nur, was der Schirm nicht zeigt: der Strahl ab dem Punkt, an dem er verdeckt verschwand,
                    // sonst jenseits seines Austritts (die Weite längs des Strahls aus dem Schirm-Anteil, perspektivisch:
                    // s·(1/wE) / mix(1/wP, 1/wE, s)); trifft das Bild, ruht es. Bis A1-n2 trug das Feld nur den Austritt: der
                    // hinter dem Ufer-Busch verschwundene Strahl las den Dunst am Horizont — ein Band ohne Spiegel unter jedem Ufer
                    const tVon = (s) => tMax.mul(s.mul(iwE)).div(mix(iwP, iwE, s));
                    const verdeckt = sDeck.greaterThanEqual(0.0);
                    const t = max(float(1.25), select(verdeckt, tVon(sDeck), tVon(sMax))).toVar();
                    const tVor = t.toVar();
                    const gVor = float(0.01).toVar();
                    If(raus.or(verdeckt).and(bildW.lessThan(1.0)), () => {
                        Loop(K.schritte, () => {
                            const p = P.add(R.mul(t));
                            const rel = p.xz.sub(U.mitte).div(kante);
                            If(max(abs(rel.x), abs(rel.y)).greaterThan(0.5), () => Break());
                            const y = p.y.sub(U.bezug);
                            // über der Höchsten des Felds: der steigende Strahl trifft nichts mehr, der sinkende (der Spiegel einer
                            // Scheibe, eines Lacks: material.K4) fällt bis zu ihr
                            If(y.greaterThan(U.hMax), () => {
                                If(R.y.greaterThanEqual(0.0), () => Break());
                                t.addAssign(y.sub(U.hMax).div(R.y.negate()).add(0.01));
                                tVor.assign(t);
                                gVor.assign(0.01);
                                Continue();
                            });
                            // DER SPRUNG: über der Höchsten seines Blocks trifft der Strahl darin nichts, solange er über ihr bleibt — er
                            // springt an den Rand des Blocks oder, sinkend, bis auf die Höchste (die Höchste deckt den Filter bis dort)
                            const zb = floor(p.xz.div(blockM));
                            const hb = hoechste.load(ivec2(mod(zb, float(S.nb)))).r;
                            If(y.greaterThan(hb), () => {
                                const randX = zb.x.add(step(0.0, R.x)).mul(blockM);
                                const randZ = zb.y.add(step(0.0, R.z)).mul(blockM);
                                const sprung = min(
                                    min(
                                        abs(randX.sub(p.x)).div(max(abs(R.x), 1e-5)),
                                        abs(randZ.sub(p.z)).div(max(abs(R.z), 1e-5))
                                    ),
                                    select(R.y.lessThan(0.0), y.sub(hb).div(R.y.negate()), float(1e6))
                                );
                                tVor.assign(t.add(sprung));
                                gVor.assign(y.add(R.y.mul(sprung)).sub(hb));
                                t.assign(tVor.add(0.05));
                                Continue();
                            });
                            const g = abstand(y, feld(p.xz));
                            If(g.lessThan(0.0), () => {
                                const ta = tVor.toVar(),
                                    tb = t.toVar(),
                                    gA = gVor.toVar(),
                                    gB = g.toVar();
                                for (let k = 0; k < K.halbierungen; k++) {
                                    const m = ta.add(tb).mul(0.5);
                                    const pm = P.add(R.mul(m));
                                    const gm = abstand(pm.y.sub(U.bezug), feld(pm.xz));
                                    If(gm.lessThan(0.0), () => {
                                        tb.assign(m);
                                        gB.assign(gm);
                                    }).Else(() => {
                                        ta.assign(m);
                                        gA.assign(gm);
                                    });
                                }
                                const q = P.add(R.mul(ta.add(tb.sub(ta).mul(gA.div(max(gA.sub(gB), 1e-4))))));
                                const yq = q.y.sub(U.bezug);
                                const sq = feld(q.xz);
                                // WAS DEN STRAHL HIELT: die Krone (ihre Schicht ist näher als die untere Fläche) oder die untere Fläche
                                const kroneTraf = max(sq.g.sub(yq), yq.sub(sq.b)).lessThan(yq.sub(sq.r));
                                // ihr Stoff aus der Zelle, die ihn hielt: die höchste der vier Zellen um q (das Dach bzw. die untere
                                // Fläche), nie das Filter-Mittel (zwischen Krone und Wasser mischte es die Marken)
                                const zq = floor(q.xz.div(S.texel).sub(0.5));
                                const platz = (di, dj) => ivec2(mod(zq.add(vec2(di, dj)), float(S.n)));
                                const hoch = (a, b, kanal) =>
                                    select(feldZelle.load(b)[kanal].greaterThan(feldZelle.load(a)[kanal]), b, a);
                                const wahl = (kanal) =>
                                    hoch(
                                        hoch(platz(0, 0), platz(1, 0), kanal),
                                        hoch(platz(0, 1), platz(1, 1), kanal),
                                        kanal
                                    );
                                const zDach = wahl("b"),
                                    zUnten = wahl("r");
                                const kroneFarbe = laubZeile.load(
                                    ivec2(max(feldZelle.load(zDach).a.sub(1.0), 0.0), 0)
                                ).rgb;
                                const st0 = stoffZelle.load(zUnten);
                                const art = st0.a.mul(255);
                                const albedo = st0.rgb.mul(st0.rgb);
                                const e = S.texel;
                                const hx = feld(q.xz.add(vec2(e, 0))).r.sub(feld(q.xz.sub(vec2(e, 0))).r);
                                const hz = feld(q.xz.add(vec2(0, e))).r.sub(feld(q.xz.sub(vec2(0, e))).r);
                                const nrm = normalize(vec3(hx.negate(), 2 * e, hz.negate()));
                                // DAS LICHT DES TREFFERS (`_weltLicht`, der EINE Baustein): Laub streut Sonne und Himmel in jede Richtung —
                                // an Flanke und Dach das Licht einer waagrechten Fläche, tiefer in der Krone (die Unterseite des Schirms)
                                // durch das Laub darüber (Beer-Lambert, e-Länge laubTiefe, über dem Himmelslicht laubGrund); die untere
                                // Fläche unter einer Krone im Licht durch deren Dicke, der Boden mit seiner Normale (D10-n2: die Krone als
                                // Säule bis zum Boden zeichnete den Ufer-Busch unter dem Schirm schwarz). Bis Licht K3 trug der Boden einen
                                // eigenen Term (0,3 + 0,7·N·L/max(sun.y, 0,2) × die Bestrahlung des Wassers): in der Dämmerung zu dunkel.
                                const durch = (dicke) =>
                                    mix(float(K.laubGrund), float(1.0), exp(max(dicke, 0.0).div(-K.laubTiefe)));
                                const oben = vec3(0, 1, 0);
                                const strahl = select(
                                    kroneTraf,
                                    kroneFarbe.mul(durch(sq.b.sub(yq))).mul(WL.at(oben)),
                                    albedo
                                        .mul(durch(sq.b.sub(sq.g)))
                                        .mul(WL.at(select(art.greaterThan(1.5), oben, nrm)))
                                );
                                const rq = q.xz.sub(U.mitte).div(kante);
                                // trifft der Strahl eine höhere Wasser-Fläche (der Fluss oberhalb der Mündung steigt in Stufen), sieht er
                                // ihren Spiegel — streifend den Himmel: kein Treffer, das Wasser liest den Himmel (D10-n1: der Körper
                                // des Flusses zeichnete das Ufer schwarz)
                                const wasserTraf = kroneTraf.not().and(abs(art.sub(1.0)).lessThan(0.5));
                                aus.assign(
                                    vec4(
                                        luft.mische(strahl, P, q),
                                        float(1)
                                            .sub(smoothstep(0.42, 0.5, max(abs(rq.x), abs(rq.y))))
                                            .mul(select(wasserTraf, float(0.0), float(1.0)))
                                    )
                                );
                                Break();
                            });
                            tVor.assign(t);
                            gVor.assign(g);
                            // unter der Höchsten: Schritte von höchstens `fein` Zellen — kein Busch fällt mehr hindurch
                            t.addAssign(
                                min(max(g.mul(0.9), t.mul(K.wachs).add(S.texel * 0.25)), float(S.texel * K.fein))
                            );
                        });
                    });
                    // DER HIMMEL DES BILDS: bleibt die Strecke im Schirm ohne Treffer, steht in Richtung R der gezeichnete Himmel
                    // (Kuppel mit Wolken, Sonne, Mond — Tiefe 1,0) an der Stelle, an der R im Unendlichen liegt: er IST der
                    // Spiegel. Deckt dort ein Ding den Himmel, das der Strahl nicht traf, rechnet der Pass die Himmels-Sicht (unten);
                    // was das Feld vom verdeckten Strahl hielt, liegt davor
                    If(raus.not().and(bildW.lessThan(1.0)).and(aus.a.lessThan(1.0)), () => {
                        const cI = U.vp.mul(vec4(R, 0.0));
                        const iwI = float(1).div(max(cI.w, 1e-6));
                        const uvI = vec2(cI.x.mul(iwI).mul(0.5).add(0.5), float(0.5).sub(cI.y.mul(iwI).mul(0.5)));
                        const imBild = cI.w
                            .greaterThan(0.0)
                            .and(min(uvI.x, uvI.y).greaterThan(0.0))
                            .and(max(uvI.x, uvI.y).lessThan(1.0));
                        If(imBild.and(tiefe.load(ivec2(uvI.mul(tiefeGr))).r.greaterThan(0.99999)), () => {
                            aus.assign(vec4(mix(texture(farbe, uvI).level(float(0)).rgb, aus.rgb, aus.a), 1.0));
                        });
                    });
                    // DER HIMMEL DES RESTS (A1-n1): wo weder Bild noch Feld den Strahl ganz deckt, die Himmels-Sicht der Kuppel in
                    // Richtung R (`_himmelSicht`, die EINE Atmosphäre mit ihren Wolken) — im Pass, in 1/teil, nur bei Änderung;
                    // bis A1-n1 rechnete das Wasser sie je eigenem Pixel in jedem Bild (Wasser 5,36 → 6,47 ms, Radeon). Der Pass
                    // deckt jedes Wasser-Pixel ganz (Bild über Feld über Himmel, Deckung 1), sonst schreibt er Null: die
                    // Ausgabe ist vorab multipliziert, die bilineare Abtastung des Wassers mischt am Ufer richtig.
                    const rest = aus.rgb.toVar();
                    If(aus.a.lessThan(1.0).and(bildW.lessThan(1.0)), () => {
                        const Rh = normalize(vec3(R.x, max(R.y, float(HG.hor[0])), R.z));
                        rest.assign(mix(this._himmelSicht(Rh), aus.rgb, aus.a));
                    });
                    aus.assign(vec4(mix(rest, bild, bildW), 1.0));
                });
            });
            return aus;
        })();
        // DAS VOLLBILD ist ein Pass der Post-Kette: das Quad ihrer Klasse (`pp._quadMesh`, wie der Resolve der Zeit-Auflösung —
        // EIN Dreieck, keine Szene, kein Licht, keine Luft der Welt); fehlt sie, bricht der Pass LAUT (Vendor-Drift). Bis
        // D10-n1 zeichnete eine eigene Szene mit Ortho-Kamera über `renderer.render` neben der Bühne (gate:v1-pfad W2).
        const pp = st.postProcessing;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function") throw new Error("SPIEGEL-PASS: Quad der Post-Kette fehlt (Vendor-Drift)");
        const quad = new Quad(mat);
        quad.name = "spiegel:strahl";
        st.spiegelPass = { quad, mat, U, vp: new THREE.Matrix4() };
        void L;
        return st.spiegelPass;
    }

    _ensureHydroSurfaceMaterial() {
        if (this.state.hydroSurfaceMaterial) return this.state.hydroSurfaceMaterial;
        if (typeof THREE === "undefined") return null;
        // MeshBasicNodeMaterial (TSL), NUR WebGPU (kein WebGL-Fallback — ohne WebGPU zeigt sich der Banner).
        // Wellen-Displacement, Tangenten-Kreuzprodukt-Normale, Schaum aus dem Gesetz, Blinn-Phong-Spec, Fresnel-
        // Alpha (die Luft: scene.fogNode); Attribute aFlow (vec2), aWave, aDepth, aSlope (float). Live-Uniforms in
        // state.hydroSurfaceUniforms (Schlüssel ohne u-Präfix, TSL-Konvention), mutiert von
        // _loopRender (time aus _bildZeit) + _dayNightApplyWaterMaterials (sunDir, light).
        const TSL = THREE.TSL;
        const {
            uniform,
            attribute,
            vec2,
            vec3,
            vec4,
            float,
            mat3,
            positionLocal,
            modelWorldMatrix,
            modelNormalMatrix,
            cameraPosition,
            dot,
            length,
            mix,
            smoothstep,
            clamp,
            fract,
            floor,
            max,
            normalize,
            cross,
            select: cond,
            Fn,
            uint,
            int,
            abs,
            // V13.5 (Schicht 3) — Tiefenpuffer-Knoten für die pro-Pixel-Uferlinie.
            linearDepth,
            depth,
            cameraNear,
            cameraFar,
            exp,
        } = TSL;
        void mat3; // potenzielle Alternative zu modelNormalMatrix

        // Das Studio-Gesetz WASSER_GESETZ (lebt NUR in foundry-core/__terrainCore; dieselben Zahlen injiziert das
        // Studio-GLSL): Beer-Lambert-Absorption wK (1/m) · Schlick-Fresnel · Sonnen-Glanz · Schaum. Der Leser ist
        // fail-closed, keine Kopie hier.
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        // Die Live-Uniforms (uniform-Knoten mit .value-Setter). Die Strömung des Bilds ist die des Gesetzes
        // (`wellen.adv`, m/s im Kern — dieselbe Zeile, die das Studio-Bach-Bild trägt): Strähnen, Kräusel und Glitzer
        // reiten DASSELBE Wasser (bis V18.531 1,5 · 0,5 · 0,9 m/s, drei Literale).
        const uTime = uniform(0.0);
        const uFlowSpeed = uniform(WG.wellen.adv);
        // DIE FLUSS-PHASE (Flowmap mit Rücksetzung, Vlachos/Portal 2): jede advektierte Lage wandert höchstens eine Phase
        // weit (v · P Meter) und kehrt dann zurück; zwei Lagen, um eine halbe Phase versetzt, die Dreiecks-Blende
        // versteckt die Rücksetzung. Bis V18.531 war der Versatz `uTime · v` — mit der Spielzeit unbegrenzt, und wo die
        // Strömung quer zum Fluss ausblendet, wuchs sein Gefälle mit: frisch weich, nach Minuten Höhenlinien-Bänder, nach
        // einer Stunde Rauschen (das weiße Zebra, gate:wasser-leben B2).
        const uFlowPeriod = uniform(AnazhRealm.WASSER_WELLE.phase);
        const phaseA = fract(uTime.div(uFlowPeriod));
        const phaseB = fract(uTime.div(uFlowPeriod).add(0.5));
        const phaseBlend = abs(phaseA.mul(2.0).sub(1.0)); // 0 → Lage A allein, 1 → Lage B allein (A kehrt zurück)
        const flussWegA = phaseA.mul(uFlowPeriod).mul(uFlowSpeed); // Meter stromab, beschränkt
        const flussWegB = phaseB.mul(uFlowPeriod).mul(uFlowSpeed);
        const LAGE_B = vec2(17.3, 31.7); // die zweite Lage liest ein anderes Stück desselben Rauschens
        // DER WASSER-KÖRPER: was die optisch tiefe Wassersäule zurückstreut — R∞ = 0,33 · b_b / (a + b_b) je Kanal
        // (Gordon 1975; a = die Absorption wK des Gesetzes, b_b = seine Rückstreuung `koerperStreu`, 1/m): 0,005/0,016/
        // 0,025, ein dunkles Blaugrün, im Licht des Orts 3–4× dunkler als die Wiese. Bis 05.10. stand hier das tiefe
        // Anzeige-Blau des Studios (exp(−wK·tief), als sRGB-Absicht dekodiert 0,0003/0,027/0,107): aus 45 m ein
        // leuchtendes Königsblau. Schaum: weiß, eine diffuse Fläche.
        const koerperAlbedo = vec3(...AnazhRealm._wasserKoerper(WG));
        const uFoam = uniform(new THREE.Color().setRGB(WG.schaum.farbe[0], WG.schaum.farbe[1], WG.schaum.farbe[2]));
        // Das Licht des Orts: E/π einer waagrechten Fläche aus dem EINEN Baustein (`_weltLicht`: Sonne, Himmel, Hemi, Ambient —
        // dieselben Quellen wie jedes Mesh), der Glanz in der Rayleigh-Sonnenfarbe (uSunCol × uLight = die Sonne selbst).
        const licht = this._weltLicht().at(vec3(0, 1, 0));
        const uSunCol = uniform(new THREE.Color(1, 0.96, 0.85));
        const uSunDir = uniform(new THREE.Vector3(1, 1, 1).normalize());
        const uLight = uniform(1.0);
        // uEmotion ist der Kopplungs-Haken (0 = neutral). Die Regler initialisiert der persistierte Atmosphäre-
        // Wert (Settings-Slider, überlebt Reload), sonst Default.
        const atmoW = this.state.atmosphere || {};
        const uEmotion = uniform(0.0);
        // Mindest-Wasser-Dicke (Meter optischer Weg): Fragmente darunter fallen per alphaTest (der 16-m-Atlas-
        // Spiegel blutet minimal über Voxel-Grate → flaches Blatt); tiefes Wasser bleibt. Default 0 (der
        // Durchlass macht dünnes Wasser schon durchsichtig), live über setWaterCull.
        const initMinDepth =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterCull)
                ? this.state.atmosphere.waterCull
                : 0.0025;
        const uMinDepth = uniform(initMinDepth);
        // V18.14 — die MAKRO-bewusste Schaum-Tiefe (M1): der Schaum schäumt nur, wo die
        // ECHTE Wassertiefe `aDepth` < uDepthFoam (die echte Uferlinie), NICHT den ganzen
        // flachen Fluss (gemessen median 1.31 m). In METERN (nicht Lineardepth), Slider.
        const uDepthFoam = uniform(Number.isFinite(atmoW.waterDepthFoam) ? atmoW.waterDepthFoam : 1.2);
        // V18.17 (Phase 3 sichtbar) — der See-Wellen-FLOOR: auch See/Fluss (aWave=0) bekommen
        // diesen Anteil der Wellen-Amplitude → SICHTBARES sanftes Kräuseln (Default 0.2 statt der
        // zu subtilen 0.06; 0 = flach, 1 = wie Ozean). Ein persistierter Slider-Wert wird respektiert.
        const uLakeRipple = uniform(Number.isFinite(atmoW.waterLakeRipple) ? atmoW.waterLakeRipple : 0.2);
        // DER WIND BEWEGT DAS WASSER (W-R3): die Wind-Zeile des Gesetzes (WASSER_GESETZ.wind, Amplitude × (w0 + w1·Wind))
        // skaliert Kräuselung, Dünung und Glitzer — `uWind` ist der Wind des Wetters (0 ruhig … 1 Sturm, Schreiber
        // `_dayNightApplyWaterMaterials`). Bis V18.531 las die Welt die Zeile nicht: Sturm und Sonne zeigten denselben See.
        const uWind = uniform(0.06);
        // DAS EIS (stoffe.K3): je Knoten der Säule die Höhe, über der das Eis beginnt und über der es trägt (`_eisLinien`,
        // Schreiber `_dayNightApplyWaterMaterials`; ohne Schreiber nie).
        const uEisNull = uniform(new THREE.Vector4(1e6, 1e6, 1e6, 1e6));
        const uEisVoll = uniform(new THREE.Vector4(1e6, 1e6, 1e6, 1e6));
        const windF = float(WG.wind[0]).add(uWind.mul(WG.wind[1]));

        // 2D-Hash + Value-Noise. Der Hash ist pcg2d (Jarzynski & Olano 2020, derselbe wie `_pcg2d`) auf dem ganzzahligen
        // Gitterpunkt: nur u32-Multiplikation, Addition, Xor und Shift — auf jedem Adapter bit-gleich. Bis K40 war er
        // fract(sin(dot(p, ·)) · 43758): WGSL lässt sin außerhalb ±π beliebig ungenau, das Gitter wächst mit Welt-Ort und
        // Wasser-Uhr (die Kräusel-Lage driftet uTime · 0,02) — auf dem Radeon zerfiel die Stromschnelle nach einer Stunde
        // zum Zebra (Kanten-Dichte 1,436 × der bei 60 s, swiftshader rechnete sin genau: 1,027).
        const PCG_A = uint(1664525);
        const PCG_C = uint(1013904223);
        const hash2 = Fn(([p]) => {
            const x0 = uint(int(p.x)).mul(PCG_A).add(PCG_C);
            const y0 = uint(int(p.y)).mul(PCG_A).add(PCG_C);
            const x1 = x0.add(y0.mul(PCG_A));
            const y1 = y0.add(x1.mul(PCG_A));
            const x2 = x1.bitXor(x1.shiftRight(uint(16)));
            const y2 = y1.bitXor(y1.shiftRight(uint(16)));
            const x3 = x2.add(y2.mul(PCG_A));
            const x4 = x3.bitXor(x3.shiftRight(uint(16)));
            return float(x4).mul(1.0 / 4294967296.0);
        });
        const vnoise = Fn(([p]) => {
            const i = floor(p);
            const f = fract(p);
            const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));
            return mix(
                mix(hash2(i), hash2(i.add(vec2(1.0, 0.0))), u.x),
                mix(hash2(i.add(vec2(0.0, 1.0))), hash2(i.add(vec2(1.0, 1.0))), u.x),
                u.y
            );
        });

        // Organische Dünung: drei DEKORRELIERTE value-noise-Oktaven mit eigener Drift-Richtung → runde,
        // ungerichtete Hügel. Nie Gerstner/Sinus: `dot(xz, dir)` gibt per Konstruktion parallele Kämme
        // (Raster/Chevron). smoothstep-Interpolation → stetige Ableitungen, glatte Normale (kein Speckle).
        // `aWaveV` skaliert die Amplitude. Shader-only (Sheet-Daten unberührt, kein Worker-Mirror).
        const oceanSwell = Fn(([xz]) => {
            const t = uTime;
            const w1 = vnoise(xz.mul(0.05).add(vec2(t.mul(0.06), t.mul(0.04)))).sub(0.5);
            const w2 = vnoise(xz.mul(0.12).add(vec2(t.mul(-0.05), t.mul(0.07)))).sub(0.5);
            const w3 = vnoise(xz.mul(0.23).add(vec2(t.mul(0.08), t.mul(-0.06)))).sub(0.5);
            const D = AnazhRealm.WASSER_WELLE.duenung;
            const h = w1.mul(D[0]).add(w2.mul(D[1])).add(w3.mul(D[2]));
            return vec3(float(0.0), h, float(0.0));
        });

        // === VERTEX-STAGE: Gerstner-Wellen-Displacement + Tangenten-Normale.
        // Per-Vertex-Attribute aFlow/aWave (+ aDepth, aSlope unten). aWave gated die
        // Wellen-Amplitude (Ozean voll, See/Fluss still) → kein Riss am Ufer.
        const aFlowV = attribute("aFlow", "vec2");
        const aWaveV = attribute("aWave", "float");
        // V18.14 — der MAKRO-Kontext: die echte Wassertiefe (L−Bett) pro Vertex.
        const aDepthV = attribute("aDepth", "float");
        // aSlope = |∇top| der Wasser-Oberfläche je Vertex (vom Zell-Sheet aus den geglätteten Spalten-
        // Dächern; Lippen/Vorhänge hoch) — treibt das Wildwasser (steile Läufe schäumen weiß).
        const aSlopeV = attribute("aSlope", "float");
        // Gefrorenes Wasser wogt und kräuselt nicht (`fluessig` 0): die Deckung des Eises (`_eisDeckung`) an der Welt-Höhe
        // und der Säule, die auch die Farbe liest.
        const eisU = { eisNull: uEisNull, eisVoll: uEisVoll };
        const fluessig = float(1.0).sub(
            this._eisDeckung(TSL, eisU, modelWorldMatrix.mul(vec4(positionLocal, 1.0)).y, aDepthV)
        );

        const p = positionLocal;
        // Welt-verankert: mesh.position = (0,0,0), positionLocal.xz = Welt-xz. Offene SEE (`aWaveV`) trägt
        // `oceanSwell`; See + Fluss eine organische, advektierte Mehr-Oktav-Noise-Kräuselung (keine Sinus-
        // Kämme, kein fixes Gitter → keine parallelen Linien/6-Ecke an Konfluenzen); der Fluss driftet
        // stromab (flowMix·flowDir), der See steht. Amplitude `uLakeRipple`, tiefenskaliert. Shader-only.
        const flowMag = aFlowV.length();
        // Weite flowMix-Rampe (0.03–0.30): ein kleiner aFlow-Versatz am Bett-Naht-Rand gibt keine harte
        // Kräuselungs-Kante (sonst bliebe die Chunk-Naht im Fluss sichtbar).
        const flowMix = smoothstep(float(0.03), float(0.3), flowMag); // 0 still (See/Ozean) → 1 Fluss
        const flowDir = aFlowV.div(flowMag.max(float(0.0001)));
        // Kräusel-Amplitude = Floor 0.3 + weite aDepth-Rampe (0.4→4.0 m): aDepth springt an Bett-Nähten
        // minimal — eine harte Rampe machte daraus eine sichtbare Linie. Shader-only.
        // DAS STILLE WASSER STEHT (A12): was das Kräuseln treibt, ist eine Zeile des Gesetzes (`WASSER_WELLE.treiber`): t0
        // trägt die STRÖMUNG (der Fluss wirbelt auch ohne Wind, flowMix), t1 · Wind der Wind über jedem Wasser; der See ohne
        // Strömung kräuselt nur im Wind (Wind 0: ein Spiegel). Bis A12 kräuselte er mit der Normal-Zeile `wind` (w0 + w1 ·
        // Wind) auch in der Flaute: an der Tafel (Wind 0,06) bis ±0,75 m Hub auf 14 m Welle — der Fresnel des streifenden
        // Blicks (1–5°) sprang mit Neigung und Hub je Pixel und zerlegte das Spiegelbild in dunkle Flecken (spiegelTreue Ego
        // 0,463 → 0,563, Third 0,545 → 0,563). Die Hülle `_wasserHubM` liest denselben Treiber.
        const kraeuselWind = float(AnazhRealm.WASSER_WELLE.treiber[0])
            .mul(flowMix)
            .add(uWind.mul(AnazhRealm.WASSER_WELLE.treiber[1]));
        const rippleAmt = uLakeRipple
            .mul(float(0.3).add(smoothstep(float(0.4), float(4.0), aDepthV).mul(float(0.7))))
            .mul(kraeuselWind);
        // EINE Displace-Quelle (Ozean-Gerstner + organische Kräuselung) für alle 3 Normal-Samples.
        const surfDisp = Fn(([xz]) => {
            // Offene See: organische Dünung, nur wo aWaveV hoch — ×(1−flowMix), weil auch Binnenwasser
            // aWaveV > 0 trägt; fließende Flüsse bekommen nur die advektierte Kräuselung, die Mündung blendet
            // weich. Der Rest-Moiré im steilen Lauf-Kern kommt von der Fresnel-Lesart (s. `fres`-Block).
            const ocean = oceanSwell(xz).mul(aWaveV).mul(float(1.0).sub(flowMix)).mul(windF);
            // See + Fluss: organische, advektierte Kräuselung (stromab in Flüssen, still in Seen) — zwei Lagen der
            // Fluss-Phase, je höchstens eine Phase weit getragen.
            // Kräusel-Oktaven klar UNTER der Mesh-Nyquist (~1,8-m-Raster → 3,6 m): 0.07 ≈ 14 m, 0.12 ≈ 8 m,
            // Hoch-Oktave leiser (0.4); die Amplitude 2.2·rippleAmt bleibt. Das Kern-Muster steiler Läufe ist
            // nicht die Amplitude, sondern die Fresnel-Lesart der Steilflächen-Normale (s. `fres`-Block).
            // Gilt für See UND Fluss; der Ozean trägt `oceanSwell`.
            const K = AnazhRealm.WASSER_WELLE;
            const kraeuselLage = (weg, versatz) => {
                const q = xz.sub(flowDir.mul(weg.mul(flowMix))).add(versatz);
                return vnoise(q.mul(float(0.07)).add(uTime.mul(float(0.02)))).add(
                    vnoise(q.mul(float(0.12))).mul(float(K.oktave))
                );
            };
            const rippleH = mix(kraeuselLage(flussWegA, vec2(0.0, 0.0)), kraeuselLage(flussWegB, LAGE_B), phaseBlend)
                .sub(float(K.mitte))
                .mul(float(K.kraeusel));
            const ripple = vec3(float(0.0), rippleH.mul(rippleAmt), float(0.0));
            return ocean.add(ripple).mul(fluessig);
        });
        const disp = surfDisp(p.xz);
        const pd = p.add(disp);
        const vWave = disp.y;

        // Normale aus Tangenten-Kreuzprodukt (3 Samples: pd, px, pz) — alle durch surfDisp,
        // damit die stromab-Welle die Normale (Sonnen-Glitzer) korrekt trägt.
        // Bei ruhiger See (aWaveV=0, rippleAmt klein) degeneriert das Kreuzprodukt sauber zu (0, 1, 0).
        const e = float(1.4);
        const pxBase = vec3(p.x.add(e), p.y, p.z);
        const pzBase = vec3(p.x, p.y, p.z.add(e));
        const pxPos = pxBase.add(surfDisp(vec2(p.x.add(e), p.z)));
        const pzPos = pzBase.add(surfDisp(vec2(p.x, p.z.add(e))));
        const nrmRaw = normalize(cross(pzPos.sub(pd), pxPos.sub(pd)));
        // n.y < 0 → flip (sicherer Up-Vektor) via cond-Knoten.
        const nrmFlipped = cond(nrmRaw.y.lessThan(0.0), nrmRaw.mul(-1.0), nrmRaw);

        // World-Position des displaced Vertex (für Lighting + Fog).
        const wp = modelWorldMatrix.mul(vec4(pd, 1.0));
        const vWorldPos = wp.xyz;
        // World-Raum-Normale via modelNormalMatrix (mat3 inverse-transpose).
        // Bei Wasser-Mesh (nur Translation, keine Skalierung) identisch zu
        // mat3(modelMatrix) — die V8.44-Lehre.
        const vNormalWorld = normalize(modelNormalMatrix.mul(nrmFlipped));

        // === FRAGMENT-STAGE: Wasserfarbe + Foam + Spec + Fresnel-Alpha (die Luft: scene.fogNode).
        const xz = vWorldPos.xz;
        // Normale nach oben gezwungen (cond-flip wie Vertex-Pfad).
        const nUpRaw = normalize(vNormalWorld);
        const n = cond(nUpRaw.y.lessThan(0.0), nUpRaw.mul(-1.0), nUpRaw);

        // === DER OPTISCHE WEG (Meter, pro Pixel) ===
        // Der Tiefenpuffer (Terrain dahinter, `_szeneTiefe`) minus dieses Fragment als Sicht-Tiefe in METERN
        // (`linearDepth` ist [0,1] über cameraNear…cameraFar), auf den Sicht-Strahl gestreckt (Strahl-Länge ÷
        // Sicht-Tiefe des Fragments): der Weg des Lichts vom Grund durchs Wasser ins Auge — ~0 an der Uferlinie, die
        // weiche Kante folgt dem Terrain, egal wie grob das Mesh. Bis V18.530 las das Ufer die [0,1]-Tiefe roh gegen
        // Viewport-Regler (Saum 0,0305, Schaum ×12): die Luft hob cameraFar auf 8500 m → der Saum war 259 m breit (die
        // Seen standen bei Alpha 0,4 statt durchscheinend), der Ufer-Schaum 3 km (Blick-Tour 07: weiß wie Eis).
        const sceneLin = linearDepth(this._szeneTiefe());
        const fragLin = linearDepth(depth);
        const _tiefeM = cameraFar.sub(cameraNear);
        const _fragTiefeM = fragLin.mul(_tiefeM).add(cameraNear).max(float(1e-3));
        const wegM = max(sceneLin.sub(fragLin), float(0.0))
            .mul(_tiefeM)
            .mul(length(cameraPosition.sub(vWorldPos)).div(_fragTiefeM));
        const waveT = clamp(vWave.mul(0.5).add(0.5), 0.0, 1.0);
        // DER DURCHLASS (Beer-Lambert, WASSER_GESETZ.wK je Kanal): der Weg vom Grund zum Auge plus der Weg des
        // Lichts vom Spiegel zum Grund (die Säulen-Tiefe aDepth) — am Ufer scheint der Grund durch (T → 1), im
        // Tiefen deckt der Wasser-Körper (T → 0; 1 m grün 0,14).
        const durchlass = exp(vec3(WG.wK[0], WG.wK[1], WG.wK[2]).mul(wegM.add(aDepthV)).negate());
        const T = dot(durchlass, vec3(0.2126, 0.7152, 0.0722));

        // DER SCHAUM IST DAS GESETZ: WASSER_GESETZ.schaum kennt das Ufer und den Kamm, das Studio schäumt nur dort —
        // hier die Ufer-Linie aus dem optischen Weg (unten), der Ozean-Kamm (aWave) und das Wildwasser am Steil-Lauf
        // (aSlope). Bis V18.531 lag ein Strähnen-Schaum ohne Gesetz über jedem Fluss (Schwelle 0,44 unter dem Rausch-
        // Mittel: ~60 % der Fläche bis 0,7 gedeckt, gate:wasser-leben B1) und ein Ufer-Band aus dem Attribut `aShore`,
        // das jeder Schreiber mit 0 füllte (je Pixel zwei Rauschen und ein Sinus für ×0).
        const fmag = length(aFlowV);
        const fdir = aFlowV.div(max(fmag, float(0.0001)));
        // Die Fluss-Phase im Bild: je Lage der Weg stromab × der örtliche Strömungs-Anteil fmag (0 im See). Das Muster
        // lebt STABIL in Welt-XZ und wird nur verschoben — nie `dot(xz, fdir)`: |xz| ist ein Hebelarm, eine kleine
        // Drehung in Kurven springt den Noise-Input (Zickzack-Moiré).
        const strom = (weg, versatz) => xz.sub(fdir.mul(weg.mul(fmag))).add(versatz);
        const advA = strom(flussWegA, vec2(0.0, 0.0));
        const advB = strom(flussWegB, LAGE_B);
        // Die Wildwasser-Strähnen (0.11 ≈ 9 m, unter der Mesh-Nyquist ~3,6 m), zwei Lagen der Phase.
        const riverS1 = mix(vnoise(advA.mul(0.11)), vnoise(advB.mul(0.11)), phaseBlend);
        // V9.49-c — Ozean-Schaumkämme (Gerstner-Crests tragen Gischt, aWave-gated); `riverness` (0 See … 1 Fluss, die
        // taperende aFlow-Rampe 0.04→0.5) blendet sie in der Mündung aus.
        const crest = smoothstep(0.62, 1.0, waveT).mul(aWaveV);
        const riverness = smoothstep(float(0.04), float(0.5), fmag);
        const foam = crest.mul(0.6).mul(float(1.0).sub(riverness));

        // Uferlinien-Schaum aus der Tiefe: ein heller Saum genau am Wasser-Rand, pro Pixel terrain-folgend.
        // Glitzer glatt (0.8 + 0.2·noise) — stärkere Speckel-Varianz machte das Band als distinkte Textur lesbar.
        const shoreSparkle = float(0.8).add(vnoise(xz.mul(0.5).add(uTime.mul(0.2))).mul(0.2));
        // Der Schaum-Saum sitzt an der Uferlinie UND ist auf echte flache Tiefe gegated (`realShallow`:
        // aDepth < uDepthFoam m) → nur die echte Kante schäumt, nicht der ganze flache Fluss.
        const realShallow = float(1.0).sub(smoothstep(float(0.0), uDepthFoam, aDepthV));
        // Das Ufer-Band des Schaums: der optische Weg unter dem Ufer-Maß des Gesetzes (WASSER_GESETZ.schaum.ufer,
        // 0,26 m), weiche Rampe, Spitze 0,3.
        const foamShore = float(1.0).sub(smoothstep(float(0.0), float(WG.schaum.ufer), wegM));
        const depthFoam = foamShore.mul(realShallow).mul(shoreSparkle).mul(0.3);
        // Detail-Fade mit der Kamera-Distanz (70 → 200 m): die hochfrequenten Schaum-Strähnen + Schimmer-
        // Noise aliasen ab ~100 m zu Moiré. Basis-/Tiefen-Farbe und Sonnen-Glitzern bleiben. Render-only.
        const camDist = length(cameraPosition.sub(vWorldPos));
        // V18.373 — der Fade greift früher (70→45 m): das hochfrequente Kräuselungs-/Schaum-Detail
        // beruhigt sich schon im Mittelfeld (das konzentrische Fluss-Moiré) statt erst fern.
        const detailFade = float(1.0).sub(smoothstep(float(45.0), float(190.0), camDist));
        // Wildwasser: steile Wasser-Oberfläche (aSlope ab 1.2, Vorhang ~4 voll) schäumt weiß — nah als
        // Strähnen (riverS1) auf klarem Wasser (Basis 0.25, kein Vollverputz), fern flach-weiß (das Makro-
        // Feature bleibt, nur das Mikro-Detail fadet). Moderate Hänge bleiben klares Wasser.
        const whitewater = smoothstep(float(1.2), float(3.2), aSlopeV).mul(
            float(0.25).add(riverS1.mul(0.75).mul(detailFade))
        );
        // V14-Emotions-Haken: uEmotion > 0 hebt den Schaum des GESETZES an (die Welt atmet im Wasser: Ufer, Kamm, Wildwasser
        // schäumen bis doppelt), nie Schaum, wo das Gesetz keinen hat; 0 = das Bild des Gesetzes. Bis K16 legte die Stimmung
        // + 0,25 · uEmotion über JEDES Wasser — der ruhige Fluss trug bei der Boot-Stimmung 0,9 ein Schaum-Grau (Makro 300 m
        // Luma 0,387 gegen den Ring 0,106), das der Blick des Wassers (`_wasserBlick`) nicht kennt.
        const foamD = clamp(max(max(foam, depthFoam).mul(detailFade), whitewater).mul(uEmotion.add(1.0)), 0.0, 1.0);

        // Flow-ausgerichtete Mikro-Kräuselung der NORMALE (Fragment-Stage): das Sonnen-Glitzern wandert
        // stromab. Bewusst KEIN Vertex-Displacement (Narben-Wand: kein Querschnitt, keine Naht).
        // Advektiertes Mehr-Oktav-Noise statt `sin(dot(xz,fdir))` (parallele Glitzer-Linien), dieselben zwei Lagen
        // der Fluss-Phase; Amplitude ∝ `fmag` (0 im See) × `detailFade`.
        // Flow-Kräuselung über der Mesh-Nyquist (~2 m): 0.14 ≈ 7 m, 0.32 ≈ 3 m, Amplitude 0.2, `detailFade`
        // 45 m — glättet Fragment-Aliasing auf ruhigem/Rand-Wasser. Das Kern-Muster steiler Läufe sitzt
        // nicht hier, sondern an der Fresnel/Steilflächen-Normale (s. `fres`-Block). Shader-only.
        const glitzerLage = (q) => vnoise(q.mul(0.14)).add(vnoise(q.mul(0.32).add(11.3)).mul(0.35));
        const flowRipple = mix(glitzerLage(advA), glitzerLage(advB), phaseBlend)
            .sub(0.675)
            .mul(0.2)
            .mul(fmag)
            .mul(windF)
            .mul(detailFade)
            .mul(fluessig);
        const nFlow = normalize(n.add(vec3(fdir.x.mul(flowRipple), float(0.0), fdir.y.mul(flowRipple))));
        const viewDir = normalize(cameraPosition.sub(vWorldPos));
        const { eigen, fres } = this._wasserBlick(TSL, WG, {
            n: nFlow,
            ort: vWorldPos,
            viewDir,
            T,
            koerper: koerperAlbedo,
            irr: licht,
            sunCol: uSunCol,
            sunDir: uSunDir,
            light: uLight,
            eis: this._eisDeckung(TSL, eisU, vWorldPos.y, aDepthV),
        });
        const fw = foamD.mul(0.7);
        // DIE DECKUNG (Standard-Blending: Bild = C·α + Grund·(1−α)): der Grund kommt mit T·(1−F)·(1−fw) durch, also
        // α = 1 − T·(1−F)·(1−fw) und C = (fw·Schaum + (1−fw)·eigen) / α — am Ufer scheint der Grund (α → F),
        // im Tiefen deckt der dunkle Körper, unter flachem Winkel der Himmel (F → 1). α ≥ F ≥ 0,02: kein Pol.
        const alpha = float(1.0).sub(T.mul(float(1.0).sub(fres)).mul(float(1.0).sub(fw)));
        const farbe = mix(eigen, uFoam.mul(licht), fw).div(max(alpha, float(1e-3)));

        // Die Luft legt der EINE Luft-Knoten auf (`scene.fogNode`, mat.fog) — kein eigener Wasser-Nebel.

        // Dünnes Wand-Bluten pro Pixel cullen: optischer Weg < uMinDepth (m) → Alpha 0, das Fragment fällt per
        // mat.alphaTest weg. Bei uMinDepth = 0 unverändert; tiefes Wasser bleibt.
        const alphaCulled = cond(wegM.lessThan(uMinDepth), float(0.0), alpha);

        const mat = new THREE.MeshBasicNodeMaterial();
        mat.positionNode = pd;
        mat.colorNode = vec4(farbe, alphaCulled);
        mat.transparent = true;
        // V13.9 — Cull-Schwelle: Fragmente mit Alpha≈0 (oben gecullt) werden verworfen. 0.0001 liegt weit unter
        // dem minimalen echten Wasser-Alpha (F ≥ 0,02), discardet also NUR die gecullten.
        mat.alphaTest = 0.0001;
        // V9.49-c — depthWrite an: das vereinte Wasser-Mesh schreibt Tiefe,
        // also kann nichts mehr durch eine andere Wasserfläche scheinen.
        mat.depthWrite = true;
        // V9.49-f — polygonOffset: an streifender Schnitt-Linie (flaches
        // Wasser ⟂ sanft geneigtes Terrain) wäre sonst Flimmern → Wasser
        // minimal in Tiefe schieben, opakes Terrain gewinnt Gleichstände.
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 1;
        mat.polygonOffsetUnits = 1;
        // Wasser ist eine einseitige FLÄCHE: die Iso-Wicklung zeigt nach INNEN → BackSide zeigt die
        // Oberseite von oben, von unten wird sie gecullt (kein Wasser unter der Karte). Den Unterwasser-
        // Blick trägt der Voll-Bild-Tint (playerEyesUnderwater), nicht das Mesh.
        mat.side = THREE.BackSide;

        this.state.hydroSurfaceUniforms = {
            time: uTime,
            flowSpeed: uFlowSpeed,
            flowPeriod: uFlowPeriod,
            foam: uFoam,
            sunDir: uSunDir,
            sunCol: uSunCol,
            light: uLight,
            // emotion ist der V14-Haken.
            emotion: uEmotion,
            minDepth: uMinDepth,
            depthFoam: uDepthFoam,
            lakeRipple: uLakeRipple,
            wind: uWind,
            eisNull: uEisNull,
            eisVoll: uEisVoll,
        };
        // UNIFORM-HEIMAT (Pflicht-Paar der Diät, die jeder Welt-Stoff bei seiner Erst-Zeichnung trägt): alle Takt-Uniforms
        // des Wassers sind geteilt → der Monitor darf auf die equals()-Bahn.
        this._uniformHeimatTeilen(this.state.hydroSurfaceUniforms);
        this.state.hydroSurfaceMaterial = mat;
        return mat;
    }

    // Zeichen-Device des Feld-Panoramas: ZUERST das des Renderers (r184 WebGPUBackend, geteilt), sonst lazy ein eigenes
    // (memoisiert; der Null-Renderer hat keins, swiftshader-Vulkan liefert echtes WebGPU).
    _feldZeichnerDevice() {
        try {
            const be = this.state.renderer && this.state.renderer.backend;
            const dev = be && be.device;
            if (dev && typeof dev.createShaderModule === "function") return dev;
        } catch (_e) {}
        return null;
    }
    _feldZeichnerEigenDevice() {
        if (this._feldZeichnerEigenDevP !== undefined) return this._feldZeichnerEigenDevP;
        const gpu = typeof navigator !== "undefined" ? navigator.gpu : null;
        if (!gpu) return (this._feldZeichnerEigenDevP = Promise.resolve(null));
        this._feldZeichnerEigenDevP = gpu
            .requestAdapter()
            .then((ad) => (ad ? ad.requestDevice() : null))
            .catch(() => null);
        return this._feldZeichnerEigenDevP;
    }

    // ===== DER FELD-PASS: die Ferne ohne Schalen-Geometrie =====
    // Jenseits der letzten Schale das PANORAMA (null Vertices, Kosten am Schirm) und davor der Analog-March — zwei
    // Draws mit EINER Aufgabe je Draw, die Kosten an den Pixeln, die etwas zeigen (Welle G, 06.10.): ein Vollbild-Draw,
    // der seine Tiefe im Fragment schreibt, verliert den frühen Tiefentest der GPU — der March lief für jedes der
    // 2,07 Mio. Pixel bei 1080p, auch hinter naher Geometrie (OMEN, GTX 1060: 2,40 ms für 1,3 % des Bildes).
    //   DER MARCH: je Analog-Satz EIN Stellvertreter (seine Welt-Hülle, ein Gesetz-Block je PLATZ die Hülle der Platz-
    //     Kugel) rasterisiert als Rückseite — nur Pixel, deren Strahl die Hülle trifft, marchen, und jedes nur den EINEN
    //     Satz (bzw. Platz) seines Stellvertreters; die Tiefe des Treffers schreibt das Fragment, der Tiefentest der
    //     Hardware wählt den nächsten Treffer über alle Stellvertreter.
    //   DAS PANORAMA: Vollbild-Dreieck auf der festen Tiefe 0,999999 OHNE Fragment-Tiefe — der frühe Tiefentest verwirft
    //     jedes Pixel, vor dem Szene oder Satz stehen; nur Himmels-Pixel schlagen das Panorama nach.
    // Höhen und Farben aus dem Fern-Faden (`_feldPassMal`) als polares Höhen+Farb-Feld (RGBA-Textur); das Fragment liest nur Texturen (kein
    // Gesetz im Fragment → keine Drift). Ohne Device/TSL kein Pass, die Schalen tragen den Blick.
    _feldPassEnsure(_fr) {
        const st = this.state;
        if (st.feldPass) return st.feldPass;
        if (!st.scene || typeof THREE === "undefined") return null;
        // Fähigkeits-Wand am BACKEND: das Fragment ist rohes WGSL (TSL.wgslFn), das auf dem WebGL2-
        // Rückfall existiert, aber nie kompiliert — eine Existenz-Prüfung ist blind. Ohne WebGPU kein Pass
        // (die Schalen tragen den Blick, der Boot-Log nennt es einmal). Der __anazhFernRing-Hook ist der
        // Linsen-Seam (gate:fern-ring Band 8).
        if (!this._weltMarchGezeichnet() && !(typeof window !== "undefined" && window.__anazhFernRing === true))
            return null;
        const TSL = THREE.TSL;
        // DER EINE WELT-MARCH: Feld-Liste + Kapsel-Liste sind Pass-Bindings — ohne das
        // Organ existiert der Pass nicht (die Schalen tragen, byte-alt).
        const wm = this._weltMarchEnsure();
        // DIE LUFT: der Pass dunstet mit denselben Knoten wie jedes Mesh (Szene und THREE stehen hier, `_luftEnsure`
        // bricht ohne TSL-Organe laut).
        const luft = this._luftEnsure();
        const P = AnazhRealm.FELD_PASS;
        const PN = AnazhRealm.FELD_PANO;
        const W = AnazhRealm.WELT_MARCH;
        const daten = new Float32Array(P.az * P.rad * 4);
        const tex = new THREE.DataTexture(daten, P.az, P.rad, THREE.RGBAFormat, THREE.FloatType);
        tex.name = "feld-pass-ring";
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
        // DAS PANORAMA (Schattierungs-Persistenz): rgb = Rampen-Farbe, a =
        // Treffer-Distanz (0 = Himmel). Gebacken vom Compute (_feldPanoramaMal),
        // gelesen vom billigen Fragment — der 96-Schritt-March je Pixel ist tot.
        const panoDaten = new Float32Array(PN.az * PN.elev * 4);
        const panoTex = new THREE.DataTexture(panoDaten, PN.az, PN.elev, THREE.RGBAFormat, THREE.FloatType);
        panoTex.name = "feld-pass-panorama";
        panoTex.minFilter = THREE.NearestFilter;
        panoTex.magFilter = THREE.NearestFilter;
        panoTex.needsUpdate = true;
        const U = {
            camPos: TSL.uniform(new THREE.Vector3()),
            // Blick-Projektion (ohne TRAA-Versatz, je Takt aus der Kamera) und ihre Inverse: die Stellvertreter
            // rasterisieren mit DERSELBEN Matrix, aus der das Fragment seinen Strahl zieht — jedes Pixel, dessen
            // Strahl den Satz trifft, liegt in der Hülle seines Stellvertreters.
            vp: TSL.uniform(new THREE.Matrix4()),
            invVP: TSL.uniform(new THREE.Matrix4()),
            // Innenrand und Höhen-Deckel des gemalten Felds (der Panorama-Bake liest sie, _feldPanoramaRechnen)
            rMin: TSL.uniform(8000),
            hMax: TSL.uniform(500),
            elevMax: TSL.uniform(PN.elevMax),
            nah: TSL.uniform(0.1),
            fern: TSL.uniform(9000),
            fwd: TSL.uniform(new THREE.Vector3(0, 0, -1)),
        };
        // DAS LICHT DER WELT: March und Panorama lesen den EINEN Baustein (`_weltLicht`) — dieselben Quellen, dieselbe BRDF wie jedes Mesh
        const WL = this._weltLicht();
        // DIE HEIMAT DES TAKTS (Pflicht-Paar der Diät, E1): jeder Wert des Satzes wechselt je Takt (Kamera, Licht) und gilt
        // dem EINEN Pass — als geteilte renderGroup lädt er EINMAL je Render statt einer Objekt-Gruppe, die je Wechsel
        // lädt (der Uniform-Wächter fand `camPos` · `invVP` · `l0d` 17.10. je Bild).
        this._uniformHeimatTeilen(U);
        // Das kompakte Teil der Gesetz-Streu (ein Stein, ein Blütenkopf) als rauer Ellipsoid: Noise-Term im GRÖSSEN-
        // normierten Raum ((p−c)/hn) — Amplitude UND Frequenz skalieren mit dem Teil, der Gradient ist größen-invariant
        // (sonst ∝ hn: Streifen, Lipschitz-Bruch). (Der Kegel-Stumpf der Baum-Sätze fiel 05.10. mit ihnen.)
        const sdEllipsoidRauFn = TSL.wgslFn(
            "fn sdEllipsoidRau(p: vec3<f32>, c: vec3<f32>, h: vec3<f32>) -> f32 {\n" +
                "    let q = (p - c) / h;\n" +
                "    let hn = min(h.x, min(h.y, h.z));\n" +
                "    let d0 = (length(q) - 1.0) * hn;\n" +
                "    let s = (p - c) * (1.5 / hn);\n" +
                "    let n = sin(dot(s, vec3<f32>(2.17, 3.31, 1.79))) * sin(dot(s, vec3<f32>(1.41, 2.63, 3.97)));\n" +
                "    return d0 + hn * 0.035 * n;\n" +
                "}"
        );
        const gradEllipsoidRauFn = TSL.wgslFn(
            "fn gradEllipsoidRau(p: vec3<f32>, c: vec3<f32>, h: vec3<f32>) -> vec3<f32> {\n" +
                "    let d = p - c;\n" +
                "    let q = d / h;\n" +
                "    let hn = min(h.x, min(h.y, h.z));\n" +
                "    let f0 = vec3<f32>(2.17, 3.31, 1.79);\n" +
                "    let f1 = vec3<f32>(1.41, 2.63, 3.97);\n" +
                "    let s = d * (1.5 / hn);\n" +
                "    let a0 = dot(s, f0);\n" +
                "    let a1 = dot(s, f1);\n" +
                "    let g0 = hn * d / max(h * h * length(q), vec3<f32>(1e-6));\n" +
                "    let gn = 0.035 * 1.5 * (cos(a0) * sin(a1) * f0 + sin(a0) * cos(a1) * f1);\n" +
                "    return g0 + gn;\n" +
                "}"
        );
        // DER KEIL DER HÜLLEN-FORM (S3, N5 — `HUELLE_KEIL_TYP`): der Kasten c ± h, oben geschnitten von der Ebene vom First
        // (die Kante bei +z · −z · +x · −x, Typ 2 · 3 · 4 · 5, volle Höhe) zur Gegenkante (Höhe 0); der Walm (0..1, im
        // Bruchteil des Typs: Typ + 0,49 · walm) schneidet die zwei Stirnen mit derselben Neigung — von (1 − walm) der Höhe
        // an der Stirn bis zum First, der um walm × Tiefe kürzer wird. Dieselbe Regel wie das Gitter des Gesetzbuchs
        // (fachwerk-core `_keilFlaechen`); ohne Walm ist Typ 2/3 das Dach-Prisma des Welt-March von gestern, byte-gleich.
        const keilKopf =
            "    let d = p - c;\n" +
            "    let qb = abs(d) - h;\n" +
            "    let db = length(max(qb, vec3<f32>(0.0))) + min(max(qb.x, max(qb.y, qb.z)), 0.0);\n" +
            "    let typ = floor(w + 0.001);\n" +
            "    let walm = clamp((w - typ) / 0.49, 0.0, 1.0);\n" +
            "    let xa = typ > 3.5;\n" +
            "    let hR = select(h.z, h.x, xa);\n" +
            "    let hU = select(h.x, h.z, xa);\n" +
            "    let dR = select(d.z, d.x, xa);\n" +
            "    let dU = select(d.x, d.z, xa);\n" +
            "    let s = select(-1.0, 1.0, typ < 2.5 || (typ > 3.5 && typ < 4.5));\n" +
            "    let invL = 1.0 / max(length(vec2<f32>(h.y, hR)), 1e-6);\n" +
            "    let ebene = (d.y * hR - s * dR * h.y) * invL;\n" +
            "    let walmE = select(-1e30, ((d.y - h.y * (1.0 - 2.0 * walm)) * hR + (abs(dU) - hU) * h.y) * invL, walm > 0.0005);\n";
        const sdKeilFn = TSL.wgslFn(
            "fn sdKeil(p: vec3<f32>, c: vec3<f32>, h: vec3<f32>, w: f32) -> f32 {\n" +
                keilKopf +
                "    return max(db, max(ebene, walmE));\n" +
                "}"
        );
        const gradKeilFn = TSL.wgslFn(
            "fn gradKeil(p: vec3<f32>, c: vec3<f32>, h: vec3<f32>, w: f32) -> vec3<f32> {\n" +
                keilKopf +
                "    if (walmE > db && walmE >= ebene) {\n" +
                "        let gU = sign(dU) * h.y;\n" +
                "        return select(vec3<f32>(gU, hR, 0.0), vec3<f32>(0.0, hR, gU), xa);\n" +
                "    }\n" +
                "    if (ebene > db) {\n" +
                "        let gR = -s * h.y;\n" +
                "        return select(vec3<f32>(0.0, hR, gR), vec3<f32>(gR, hR, 0.0), xa);\n" +
                "    }\n" +
                "    if (qb.x >= qb.y && qb.x >= qb.z) { return vec3<f32>(sign(d.x), 0.0, 0.0); }\n" +
                "    if (qb.y >= qb.z) { return vec3<f32>(0.0, sign(d.y), 0.0); }\n" +
                "    return vec3<f32>(0.0, 0.0, sign(d.z));\n" +
                "}"
        );
        // Die Kapsel-Liste liegt 2D (Zeilen à textureDimensions.x Texel): eine 1D-Zeile stieß ans garantierte WebGPU-
        // Limit (8192 Texel = 4096 Kapseln, 04.10. zu 59 % belegt, als die Fern-Streu ins Gesetz zog).
        const kapselTexelFn = TSL.wgslFn(
            "fn kapselTexel(k: texture_2d<f32>, i: i32) -> vec4<f32> {\n" +
                "    let b = i32(textureDimensions(k, 0).x);\n" +
                "    return textureLoad(k, vec2<i32>(i % b, i / b), 0);\n" +
                "}"
        );
        // DER STELLVERTRETER (Vertex): Instanz i = Feld-Eintrag i / gesetzBlock, Platz i % gesetzBlock. Ein Analog-Satz
        // trägt seine Welt-Hülle (Platz 0), ein Gesetz-Block je belegtem Platz die Hülle der Platz-Kugel; alles andere
        // (leerer Slot, ungenutzter Platz) fällt außerhalb des Clip-Raums und erzeugt kein Fragment. Der Saum (2 mrad +
        // 2 cm) hält Silhouetten, die ihre Hülle berühren, gegen Rundung im Raster. Die Clip-Tiefe hinter der fernen Ebene
        // klemmt auf die Ebene: das Fragment schreibt seine Tiefe selbst, die Raster-Tiefe entscheidet nur die Deckung.
        const sv = `${W.gesetzBlock}u`;
        const stellvertreter = TSL.wgslFn(
            "fn feldStellvertreter(i: u32, ecke: vec3<f32>, vp: mat4x4<f32>, camPos: vec3<f32>, liste: texture_2d<f32>, kapseln: texture_2d<f32>) -> vec4<f32> {\n" +
                "    let aus = vec4<f32>(2.0, 2.0, 2.0, 1.0);\n" +
                `    let j = i32(i / ${sv});\n` +
                `    let platz = i32(i % ${sv});\n` +
                `    let ty = j / ${W.spalten};\n` +
                `    let bx = (j % ${W.spalten}) * 8;\n` +
                "    let t0 = textureLoad(liste, vec2<i32>(bx, ty), 0);\n" +
                "    if (t0.w > -0.5) { return aus; }\n" +
                "    let t1 = textureLoad(liste, vec2<i32>(bx + 1, ty), 0);\n" +
                "    var lo = t0.xyz;\n" +
                "    var hi = t1.xyz;\n" +
                "    if (t1.w < -0.5) {\n" +
                "        if (platz >= i32(-t0.w + 0.5)) { return aus; }\n" +
                "        let gA = kapselTexel(kapseln, i32(-t1.w - 0.5) + platz * 2);\n" +
                "        if (gA.w < 0.001) { return aus; }\n" +
                "        lo = gA.xyz - vec3<f32>(gA.w);\n" +
                "        hi = gA.xyz + vec3<f32>(gA.w);\n" +
                "    } else if (platz > 0) {\n" +
                "        return aus;\n" +
                "    }\n" +
                "    let saum = 0.002 * length((lo + hi) * 0.5 - camPos) + 0.02;\n" +
                "    let p = mix(lo - vec3<f32>(saum), hi + vec3<f32>(saum), ecke);\n" +
                "    let c = vp * vec4<f32>(p, 1.0);\n" +
                "    return vec4<f32>(c.xy, min(c.z, c.w * 0.9999999), c.w);\n" +
                "}",
            [kapselTexelFn]
        );
        // DER MARCH (Fragment): der EINE Satz bzw. Platz des Stellvertreters. Liste je Feld (8 Texel):
        // [wAABB.min|d] [wAABB.max|einheit] [inv r0] [inv r1] [inv r2] [lokalMin|Schwund] [lokalGroesse|·] [·] — der
        // Strahl zieht in den GLIED-Raum (Knochen-Matrix = Animation), die Normale kommt aus dem SDF-Gradienten und die
        // Sonne beleuchtet (kein Nacht-Glühen). Rückgabe: rgb + Strahl-Länge (0 = kein Treffer → verworfen).
        const march = TSL.wgslFn(
            "fn feldMarch(ndc: vec2<f32>, i: u32, camPos: vec3<f32>, invVP: mat4x4<f32>, nah: f32, fern: f32, fwd: vec3<f32>, szeneTiefe: f32, schirm: vec2<f32>, ditherT: f32, saison: vec3<f32>, liste: texture_2d<f32>, kapseln: texture_2d<f32>) -> vec4<f32> {\n" +
                "    let kein = vec4<f32>(0.0);\n" +
                "    let fern4 = invVP * vec4<f32>(ndc.x, ndc.y, 1.0, 1.0);\n" +
                "    // DER SCHWUND: dieselbe Interleaved-Gradient-Blende wie die Studio-Stufen (__phytoCore.lodDitherIGN)\n" +
                "    let schwundIgn = fract(52.9829189 * fract(schirm.x * 0.06711056 + schirm.y * 0.00583715) + ditherT);\n" +
                "    let fernP = fern4.xyz / fern4.w;\n" +
                "    let dir = normalize(fernP - camPos);\n" +
                "    let PI = 3.14159265358979;\n" +
                "    var bestT = 1e30;\n" +
                "    var getroffen = false;\n" +
                "    // DIE TIEFEN-GRENZE: steht vor diesem Pixel schon Geometrie (die Szenen-Tiefe vor dem Feld-Pass),\n" +
                "    // traced der March nur bis dorthin — dahinter verwürfe ihn der Tiefentest ohnehin (der Pass schreibt\n" +
                "    // seine Tiefe selbst, der Test fällt erst nach dem Fragment).\n" +
                "    if (szeneTiefe < 0.9999999) {\n" +
                "        let vzS = fern * nah / max(fern - szeneTiefe * (fern - nah), 1e-6);\n" +
                "        bestT = vzS / max(dot(dir, fwd), 1e-4);\n" +
                "    }\n" +
                "    var bestRgb = vec3<f32>(0.0);\n" +
                "    var bestN = vec3<f32>(0.0, 1.0, 0.0);\n" +
                "    let inv = 1.0 / dir;\n" +
                `    let j = i32(i / ${sv});\n` +
                `    let platz = i32(i % ${sv});\n` +
                `    let ty = j / ${W.spalten};\n` +
                `    let bx = (j % ${W.spalten}) * 8;\n` +
                "    let t0 = textureLoad(liste, vec2<i32>(bx, ty), 0);\n" +
                "    let d = t0.w;\n" +
                "    if (d > -0.5) { return kein; }\n" + // 0 = leer; negativ = ANALOG-Satz (−Anzahl der Primitive)
                "    let t1 = textureLoad(liste, vec2<i32>(bx + 1, ty), 0);\n" +
                "    let tA = (t0.xyz - camPos) * inv;\n" +
                "    let tB = (t1.xyz - camPos) * inv;\n" +
                "    let tMin3 = min(tA, tB);\n" +
                "    let tMax3 = max(tA, tB);\n" +
                "    let tN = max(max(tMin3.x, tMin3.y), max(tMin3.z, 0.5));\n" +
                "    let tF = min(tMax3.x, min(tMax3.y, tMax3.z));\n" +
                "    if (tF <= tN || tN >= bestT) { return kein; }\n" +
                "    let lm4 = textureLoad(liste, vec2<i32>(bx + 5, ty), 0);\n" +
                "    if (lm4.w > 0.0 && schwundIgn < lm4.w) { return kein; }\n" + // der Satz dithert aus, sein Mesh übernimmt
                "    let r0 = textureLoad(liste, vec2<i32>(bx + 2, ty), 0);\n" +
                "    let r1 = textureLoad(liste, vec2<i32>(bx + 3, ty), 0);\n" +
                "    let r2 = textureLoad(liste, vec2<i32>(bx + 4, ty), 0);\n" +
                "    let lm = lm4.xyz;\n" +
                "    let lg = textureLoad(liste, vec2<i32>(bx + 6, ty), 0).xyz;\n" +
                "    let c4 = vec4<f32>(camPos, 1.0);\n" +
                "    let oL = vec3<f32>(dot(r0, c4), dot(r1, c4), dot(r2, c4));\n" +
                "    let dL = vec3<f32>(dot(r0.xyz, dir), dot(r1.xyz, dir), dot(r2.xyz, dir));\n" +
                "    let invL = 1.0 / dL;\n" +
                "    let lA = (lm - oL) * invL;\n" +
                "    let lB = (lm + lg - oL) * invL;\n" +
                "    let lMin3 = min(lA, lB);\n" +
                "    let lMax3 = max(lA, lB);\n" +
                "    let tN2 = max(tN, max(lMin3.x, max(lMin3.y, lMin3.z)));\n" +
                "    let tF2 = min(tF, min(lMax3.x, min(lMax3.y, lMax3.z)));\n" +
                "    if (tF2 <= tN2) { return kein; }\n" +
                "    // ═══ DER ANALOG-MARCH (Schöpfer-Wort „analog!“) ═══\n" +
                "    // Sphere-Tracing der Kapsel-GESETZE im Glied-Raum: der Schritt\n" +
                "    // IST die Distanz (adaptiv), die Normale ist der EXAKTE SDF-\n" +
                "    // Gradient — digitalisiert wird nur hier, am Schirm-Pixel.\n" +
                "    let anzahl = i32(-d + 0.5);\n" +
                "    if (t1.w < -0.5) {\n" +
                "        // ═══ DAS VERTEILUNGS-GESETZ (Klein-Streu je Kachel): der EINE Platz des Stellvertreters ═══\n" +
                "        // [Pos|Hüllradius][yaw|scale|po|anzahl]: Kugel-Vortest, dann Sphere-Tracing des GETEILTEN\n" +
                "        // Vorlagen-Satzes im Platz-Raum (rotY(−yaw), /scale) — die Matrix bleibt Identität.\n" +
                "        let basis = i32(-t1.w - 0.5);\n" +
                "        let gA = kapselTexel(kapseln, basis + platz * 2);\n" +
                "        let oc = gA.xyz - camPos;\n" +
                "        let bq = dot(oc, dir);\n" +
                "        let disc = bq * bq - dot(oc, oc) + gA.w * gA.w;\n" +
                "        if (platz < anzahl && gA.w >= 0.001 && disc > 0.0) {\n" +
                "            let sq = sqrt(disc);\n" +
                "            let tGa = max(bq - sq, tN2);\n" +
                "            let tGe = min(min(bq + sq, tF2), bestT);\n" +
                "            if (tGe > tGa) {\n" +
                "                let gB = kapselTexel(kapseln, basis + platz * 2 + 1);\n" +
                "                let cy = cos(gB.x);\n" +
                "                let sy = sin(gB.x);\n" +
                "                let sk = max(gB.y, 1e-4);\n" +
                "                let ow = camPos - gA.xyz;\n" +
                "                let oP = vec3<f32>(cy * ow.x - sy * ow.z, ow.y, sy * ow.x + cy * ow.z) / sk;\n" +
                "                let dP = vec3<f32>(cy * dir.x - sy * dir.z, dir.y, sy * dir.x + cy * dir.z) / sk;\n" +
                "                let poG = i32(gB.z + 0.5);\n" +
                "                let anzG = i32(gB.w + 0.5);\n" +
                "                var tG = tGa;\n" +
                "                for (var s2: i32 = 0; s2 < 32; s2 = s2 + 1) {\n" +
                "                    if (tG >= tGe) { break; }\n" +
                "                    let pP = oP + dP * tG;\n" +
                "                    var dmG = 1e30;\n" +
                "                    var nkG = 0;\n" +
                "                    for (var k2: i32 = 0; k2 < anzG; k2 = k2 + 1) {\n" +
                "                        let qA = kapselTexel(kapseln, poG + k2 * 2);\n" +
                "                        let qB = kapselTexel(kapseln, poG + k2 * 2 + 1);\n" +
                "                        var dkG = 0.0;\n" +
                "                        if (qA.w >= 0.0) {\n" +
                "                            let ba2 = qB.xyz - qA.xyz;\n" +
                "                            let pa2 = pP - qA.xyz;\n" +
                "                            let h2 = clamp(dot(pa2, ba2) / max(dot(ba2, ba2), 1e-8), 0.0, 1.0);\n" +
                "                            dkG = length(pa2 - ba2 * h2) - qA.w;\n" +
                "                        } else if (qB.w < 0.5) {\n" +
                "                            let q2 = abs(pP - qA.xyz) - qB.xyz;\n" +
                "                            dkG = length(max(q2, vec3<f32>(0.0))) + min(max(q2.x, max(q2.y, q2.z)), 0.0);\n" +
                "                        } else if (qB.w < 1.5) {\n" +
                "                            // ELLIPSOID (pB.w≈1), rau\n" +
                "                            dkG = sdEllipsoidRau(pP, qA.xyz, qB.xyz);\n" +
                "                        } else {\n" +
                "                            // KEIL (pB.w = Typ 2..5 + 0,49·Walm): der Kasten, oben geschnitten (sdKeil)\n" +
                "                            dkG = sdKeil(pP, qA.xyz, qB.xyz, qB.w);\n" +
                "                        }\n" +
                "                        if (dkG < dmG) { dmG = dkG; nkG = k2; }\n" +
                "                    }\n" +
                "                    if (dmG * sk < 0.008) {\n" +
                "                        bestT = tG;\n" +
                "                        getroffen = true;\n" +
                "                        let qA = kapselTexel(kapseln, poG + nkG * 2);\n" +
                "                        let qB = kapselTexel(kapseln, poG + nkG * 2 + 1);\n" +
                "                        var gvG = vec3<f32>(0.0);\n" +
                "                        var ciG: u32 = 0u;\n" +
                "                        var laubG = false;\n" +
                "                        if (qA.w >= 0.0) {\n" +
                "                            let ba2 = qB.xyz - qA.xyz;\n" +
                "                            let pa2 = pP - qA.xyz;\n" +
                "                            let h2 = clamp(dot(pa2, ba2) / max(dot(ba2, ba2), 1e-8), 0.0, 1.0);\n" +
                "                            gvG = pa2 - ba2 * h2;\n" +
                "                            ciG = u32(qB.w);\n" +
                "                        } else if (qB.w < 0.5) {\n" +
                "                            let q2 = pP - qA.xyz;\n" +
                "                            let aq2 = abs(q2) - qB.xyz;\n" +
                "                            if (aq2.x >= aq2.y && aq2.x >= aq2.z) { gvG = vec3<f32>(sign(q2.x), 0.0, 0.0); }\n" +
                "                            else if (aq2.y >= aq2.z) { gvG = vec3<f32>(0.0, sign(q2.y), 0.0); }\n" +
                "                            else { gvG = vec3<f32>(0.0, 0.0, sign(q2.z)); }\n" +
                "                            ciG = u32(-qA.w - 1.0);\n" +
                "                        } else if (qB.w < 1.5) {\n" +
                "                            // ELLIPSOID-Normale (analytischer Noise-Gradient)\n" +
                "                            gvG = gradEllipsoidRau(pP, qA.xyz, qB.xyz);\n" +
                "                            ciG = u32(-qA.w - 1.0);\n" +
                "                            laubG = true; // das kompakte Teil (Blütenkopf, Stein) trägt die Saison\n" +
                "                        } else {\n" +
                "                            // KEIL-Normale: Kasten-Seite, Dach-Ebene oder Walm (gradKeil)\n" +
                "                            gvG = gradKeil(pP, qA.xyz, qB.xyz, qB.w);\n" +
                "                            ciG = u32(-qA.w - 1.0);\n" +
                "                        }\n" +
                "                        if (dot(gvG, gvG) < 1e-10) {\n" +
                "                            bestN = -dir;\n" +
                "                        } else {\n" +
                "                            // Platz-Raum → Welt: rotY(+yaw); uniforme Skala dreht die Richtung nicht\n" +
                "                            bestN = normalize(vec3<f32>(cy * gvG.x + sy * gvG.z, gvG.y, cy * gvG.z - sy * gvG.x));\n" +
                "                        }\n" +
                "                        bestRgb = vec3<f32>(f32((ciG >> 16u) & 255u), f32((ciG >> 8u) & 255u), f32(ciG & 255u)) / 255.0 * select(vec3<f32>(1.0), saison, laubG);\n" +
                "                        break;\n" +
                "                    }\n" +
                "                    tG = tG + max(dmG * sk, 0.004);\n" +
                "                }\n" +
                "            }\n" +
                "        }\n" +
                "    } else {\n" +
                "        let po = i32(t1.w + 0.5);\n" +
                "        let lenDL = max(length(dL), 1e-6);\n" +
                "        var tK = tN2;\n" +
                "        for (var s: i32 = 0; s < 40; s = s + 1) {\n" +
                "            if (tK >= tF2 || tK >= bestT) { break; }\n" +
                "            let pL = oL + dL * tK;\n" +
                "            var dm = 1e30;\n" +
                "            var nk = 0;\n" +
                "            for (var k: i32 = 0; k < anzahl; k = k + 1) {\n" +
                "                let pA = kapselTexel(kapseln, po + k * 2);\n" +
                "                let pB = kapselTexel(kapseln, po + k * 2 + 1);\n" +
                "                var dk = 0.0;\n" +
                "                if (pA.w >= 0.0) {\n" +
                "                    let ba = pB.xyz - pA.xyz;\n" +
                "                    let pa = pL - pA.xyz;\n" +
                "                    let hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);\n" +
                "                    dk = length(pa - ba * hh) - pA.w;\n" +
                "                } else if (pB.w < 0.5) {\n" +
                "                    // BOX (pA.w < 0, pB.w≈0): Zentrum|−(farbe+1) · Halbmaße\n" +
                "                    let q = abs(pL - pA.xyz) - pB.xyz;\n" +
                "                    dk = length(max(q, vec3<f32>(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);\n" +
                "                } else if (pB.w < 1.5) {\n" +
                "                    // ELLIPSOID (pB.w≈1), rau\n" +
                "                    dk = sdEllipsoidRau(pL, pA.xyz, pB.xyz);\n" +
                "                } else {\n" +
                "                    // KEIL (pB.w = Typ 2..5 + 0,49·Walm): der Kasten, oben geschnitten (sdKeil)\n" +
                "                    dk = sdKeil(pL, pA.xyz, pB.xyz, pB.w);\n" +
                "                }\n" +
                "                if (dk < dm) { dm = dk; nk = k; }\n" +
                "            }\n" +
                "            if (dm < 0.008) {\n" +
                "                bestT = tK;\n" +
                "                getroffen = true;\n" +
                "                let pA = kapselTexel(kapseln, po + nk * 2);\n" +
                "                let pB = kapselTexel(kapseln, po + nk * 2 + 1);\n" +
                "                var gvK = vec3<f32>(0.0);\n" +
                "                var ci: u32 = 0u;\n" +
                "                var laubK = false;\n" +
                "                if (pA.w >= 0.0) {\n" +
                "                    let ba = pB.xyz - pA.xyz;\n" +
                "                    let pa = pL - pA.xyz;\n" +
                "                    let hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);\n" +
                "                    gvK = pa - ba * hh;\n" +
                "                    ci = u32(pB.w);\n" +
                "                } else if (pB.w < 0.5) {\n" +
                "                    // BOX-Normale: die Achse der größten Überschreitung trägt\n" +
                "                    let q = pL - pA.xyz;\n" +
                "                    let aq = abs(q) - pB.xyz;\n" +
                "                    if (aq.x >= aq.y && aq.x >= aq.z) { gvK = vec3<f32>(sign(q.x), 0.0, 0.0); }\n" +
                "                    else if (aq.y >= aq.z) { gvK = vec3<f32>(0.0, sign(q.y), 0.0); }\n" +
                "                    else { gvK = vec3<f32>(0.0, 0.0, sign(q.z)); }\n" +
                "                    ci = u32(-pA.w - 1.0);\n" +
                "                } else if (pB.w < 1.5) {\n" +
                "                    // ELLIPSOID-Normale (analytischer Noise-Gradient)\n" +
                "                    gvK = gradEllipsoidRau(pL, pA.xyz, pB.xyz);\n" +
                "                    ci = u32(-pA.w - 1.0);\n" +
                "                    laubK = true; // das kompakte Teil trägt die Saison\n" +
                "                } else {\n" +
                "                    // KEIL-Normale: Kasten-Seite, Dach-Ebene oder Walm (gradKeil)\n" +
                "                    gvK = gradKeil(pL, pA.xyz, pB.xyz, pB.w);\n" +
                "                    ci = u32(-pA.w - 1.0);\n" +
                "                }\n" +
                "                if (dot(gvK, gvK) < 1e-10) {\n" +
                "                    bestN = -dir;\n" +
                "                } else {\n" +
                "                    bestN = normalize(vec3<f32>(\n" +
                "                        r0.x * gvK.x + r1.x * gvK.y + r2.x * gvK.z,\n" +
                "                        r0.y * gvK.x + r1.y * gvK.y + r2.y * gvK.z,\n" +
                "                        r0.z * gvK.x + r1.z * gvK.y + r2.z * gvK.z));\n" +
                "                }\n" +
                "                bestRgb = vec3<f32>(f32((ci >> 16u) & 255u), f32((ci >> 8u) & 255u), f32(ci & 255u)) / 255.0 * select(vec3<f32>(1.0), saison, laubK);\n" +
                "                break;\n" +
                "            }\n" +
                "            tK = tK + max(dm / lenDL, 0.004);\n" +
                "        }\n" +
                "    }\n" +
                "    if (!getroffen) { return kein; }\n" +
                "    // DER TREFFER FÜR DAS LICHT DER WELT (`_weltLicht`, `feldAlbedo`/`feldNormale`): Albedo und Normale als Halb-Floats,\n" +
                "    // je Paar das obere um +2 verschoben — der Exponent des f32 ist nie 0, kein Denormal fällt der Hardware zum Opfer\n" +
                "    return vec4<f32>(bitcast<f32>(pack2x16float(vec2<f32>(bestRgb.r, bestRgb.g + 2.0))), bitcast<f32>(pack2x16float(vec2<f32>(bestRgb.b, bestN.x + 2.0))), bitcast<f32>(pack2x16float(vec2<f32>(bestN.y, bestN.z + 2.0))), bestT);\n" +
                "}",
            [sdEllipsoidRauFn, gradEllipsoidRauFn, sdKeilFn, gradKeilFn, kapselTexelFn] // der raue Ellipsoid, der Keil + die 2D-Kapsel-Liste
        );
        const feldAlbedo = TSL.wgslFn(
            "fn feldAlbedo(p: vec4<f32>) -> vec3<f32> {\n" +
                "    let rg = unpack2x16float(bitcast<u32>(p.x));\n" +
                "    return vec3<f32>(rg.x, rg.y - 2.0, unpack2x16float(bitcast<u32>(p.y)).x);\n" +
                "}"
        );
        const feldNormale = TSL.wgslFn(
            "fn feldNormale(p: vec4<f32>) -> vec3<f32> {\n" +
                "    let yz = unpack2x16float(bitcast<u32>(p.z));\n" +
                "    return normalize(vec3<f32>(unpack2x16float(bitcast<u32>(p.y)).y - 2.0, yz.x, yz.y - 2.0));\n" +
                "}"
        );
        // DAS PANORAMA (Fragment): Richtung aus invVP → Azimut/Elevation → Panorama-Texel (quadratische Elevation-Umkehr)
        // → Farbe unter dem Licht der Welt; die Luft legt der Pass-Knoten auf. Rückgabe: rgb + Treffer-Distanz (0 =
        // Himmel → verworfen). textureDimensions braucht f32/i32-Casts (WGSL-Spec).
        const panorama = TSL.wgslFn(
            "fn feldPanorama(ndc: vec2<f32>, camPos: vec3<f32>, invVP: mat4x4<f32>, elevMax: f32, pano: texture_2d<f32>) -> vec4<f32> {\n" +
                "    let fern4 = invVP * vec4<f32>(ndc.x, ndc.y, 1.0, 1.0);\n" +
                "    let fernP = fern4.xyz / fern4.w;\n" +
                "    let dir = normalize(fernP - camPos);\n" +
                "    let PI = 3.14159265358979;\n" +
                "    let e = asin(clamp(dir.y, -1.0, 1.0));\n" +
                "    if (abs(e) > elevMax) { return vec4<f32>(0.0); }\n" +
                "    let dim = textureDimensions(pano, 0);\n" +
                "    let a = atan2(dir.z, dir.x);\n" +
                "    let u = clamp(a / (2.0 * PI) + 0.5, 0.0, 0.9999);\n" +
                "    var sV = sqrt(abs(e) / max(elevMax, 1e-6));\n" +
                "    if (e < 0.0) { sV = -sV; }\n" +
                "    let v = clamp(sV * 0.5 + 0.5, 0.0, 0.9999);\n" +
                "    // DIE SILHOUETTE BILINEAR (K16): vier Texel um den Strahl (Texel-Mitten, der Azimut umlaufend), nur die\n" +
                "    // Treffer tragen Farbe und Distanz; der Himmel beginnt, wo ihre Deckung unter die Hälfte fällt — die\n" +
                "    // nächste Texel-Lesung zeigte jenseits 8 km Zinnen (je Texel 0,47° ≈ 6,7 px bei 1080p/75°).\n" +
                "    let W = i32(dim.x);\n" +
                "    let H = i32(dim.y);\n" +
                "    let fx = u * f32(dim.x) - 0.5;\n" +
                "    let fy = v * f32(dim.y) - 0.5;\n" +
                "    let tx = fx - floor(fx);\n" +
                "    let ty = fy - floor(fy);\n" +
                "    let x0 = ((i32(floor(fx)) % W) + W) % W;\n" +
                "    let x1 = (x0 + 1) % W;\n" +
                "    let y0 = clamp(i32(floor(fy)), 0, H - 1);\n" +
                "    let y1 = clamp(i32(floor(fy)) + 1, 0, H - 1);\n" +
                "    let p00 = textureLoad(pano, vec2<i32>(x0, y0), 0);\n" +
                "    let p10 = textureLoad(pano, vec2<i32>(x1, y0), 0);\n" +
                "    let p01 = textureLoad(pano, vec2<i32>(x0, y1), 0);\n" +
                "    let p11 = textureLoad(pano, vec2<i32>(x1, y1), 0);\n" +
                "    let w00 = (1.0 - tx) * (1.0 - ty) * select(0.0, 1.0, p00.a > 0.0);\n" +
                "    let w10 = tx * (1.0 - ty) * select(0.0, 1.0, p10.a > 0.0);\n" +
                "    let w01 = (1.0 - tx) * ty * select(0.0, 1.0, p01.a > 0.0);\n" +
                "    let w11 = tx * ty * select(0.0, 1.0, p11.a > 0.0);\n" +
                "    let deck = w00 + w10 + w01 + w11;\n" +
                "    if (deck < 0.5) { return vec4<f32>(0.0); }\n" +
                "    let pT = (p00 * w00 + p10 * w10 + p01 * w01 + p11 * w11) / deck;\n" +
                "    // die Rampen-Farbe ist Albedo (das Licht der Welt legt der Pass-Knoten auf, die Normale oben)\n" +
                "    return pT;\n" +
                "}"
        );
        // Der Schirm-Strahl beider Fragmente: NDC aus dem Pixel, derselbe Strahl (invVP · NDC) wie im WGSL — die Luft
        // dunstet Feld und Panorama mit denselben Knoten wie jedes Mesh (`_luftEnsure`), kein Pass-eigener Nebel.
        const ndcNode = TSL.vec2(
            TSL.screenUV.x.mul(2.0).sub(1.0),
            TSL.float(1.0).sub(TSL.screenUV.y).mul(2.0).sub(1.0)
        );
        const fern4 = U.invVP.mul(TSL.vec4(ndcNode, 1.0, 1.0));
        const dirN = fern4.xyz.div(fern4.w).sub(U.camPos).normalize();
        const imDunst = (ruf) => {
            const t = ruf.a;
            const punkt = U.camPos.add(dirN.mul(t));
            return TSL.Fn(() => {
                TSL.Discard(t.lessThan(0.25)); // 0-Sentinel: kein Treffer bzw. Himmel
                return TSL.vec4(luft.mische(ruf.rgb, U.camPos, punkt), 1.0);
            })();
        };
        // DER MARCH-DRAW: Stellvertreter-Boxen (Rückseiten — eine Hülle um die Kamera deckt den ganzen Blick), EIN Draw
        // mit `instanceCount` = Obergrenze × Plätze je Block (der Pass-Takt). Er schreibt ECHTE TIEFE (depthNode): opak,
        // komponiert per Tiefentest mit allem — Wasser/Transparentes zeichnet DANACH und testet gegen die Feld-Tiefe.
        const matMarch = new THREE.MeshBasicNodeMaterial({ depthWrite: true, depthTest: true, side: THREE.BackSide });
        matMarch.fog = false;
        matMarch.vertexNode = stellvertreter({
            i: TSL.instanceIndex,
            ecke: TSL.positionGeometry,
            vp: U.vp,
            camPos: U.camPos,
            liste: TSL.texture(wm.liste),
            kapseln: TSL.texture(wm.kapseln),
        });
        const rufMarch = march({
            ndc: ndcNode,
            i: TSL.instanceIndex,
            camPos: U.camPos,
            invVP: U.invVP,
            nah: U.nah,
            fern: U.fern,
            fwd: U.fwd,
            // Die Szenen-Tiefe VOR dem Feld-Pass (das Tiefen-Abbild `_szeneTiefe`, gezeichnet im Pass-Bruch wie beim
            // Wasser, je Texel die fernste Tiefe seines waagrechten Pixel-Paars): die Grenze des Marchs — am Rand läuft er höchstens
            // einen Pixel weiter, der Tiefentest verwirft. Die Bindung folgt jeder neu angelegten Textur über die Diät (6).
            szeneTiefe: this._szeneTiefe().x,
            // Die Schwund-Blende liest Pixel und Rotation der Stufen-Blende (`uDitherT`, dieselbe Uniform).
            schirm: TSL.screenCoordinate.xy,
            ditherT: this._ensureLodUniforms().uDitherT,
            // DIE SAISON der Ellipsoide (die kompakten Teile der Gesetz-Streu): dieselbe EINE Uniform wie Laub, Gras, Karte
            // und Fern-Ring (eingeführt 05.10. für die Kronen-Lappen der Baum-Sätze, die am selben Tag fielen).
            saison: this._ensureSeasonUniforms().uSeasonMul,
            liste: TSL.texture(wm.liste),
            kapseln: TSL.texture(wm.kapseln),
        });
        // DAS LICHT DER WELT am Treffer (`_weltLicht`, die Normale des Felds), ohne Ton-Klemme: die Belichtung macht die Ausgabe-Kette
        matMarch.outputNode = imDunst(TSL.vec4(feldAlbedo(rufMarch).mul(WL.at(feldNormale(rufMarch))), rufMarch.a));
        // Die March-Tiefe IST die Fragment-Tiefe (Feld ↔ Mesh komponieren): View-Z aus der Strahl-Länge.
        const vzStrahl = rufMarch.a.mul(TSL.max(TSL.dot(dirN, U.fwd), 1e-4));
        matMarch.depthNode = TSL.clamp(
            U.fern.mul(vzStrahl.sub(U.nah)).div(vzStrahl.mul(U.fern.sub(U.nah))),
            0.0,
            0.9999995
        );
        // Die Kiste mit ACHT Ecken (die Dreiecke und ihre Wicklung aus BoxGeometry, auf die Ecken umgezählt): je Instanz
        // rechnet der Vertex-Knoten 8 Ecken statt 24 Flächen-Vertices — ein leerer Platz kostet 8 Aufrufe à 1 Abtastung.
        const kiste = new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5);
        const kp = kiste.getAttribute("position");
        const eckeVon = (v) => (kp.getX(v) > 0.5 ? 1 : 0) + (kp.getY(v) > 0.5 ? 2 : 0) + (kp.getZ(v) > 0.5 ? 4 : 0);
        const ecken = [];
        for (let c = 0; c < 8; c++) ecken.push(c & 1, (c >> 1) & 1, (c >> 2) & 1);
        const geoMarch = new THREE.InstancedBufferGeometry();
        geoMarch.setIndex(Array.from(kiste.getIndex().array, eckeVon));
        geoMarch.setAttribute("position", new THREE.Float32BufferAttribute(ecken, 3));
        kiste.dispose();
        geoMarch.instanceCount = 0; // der Pass-Takt setzt Obergrenze × Plätze je Block
        const marchMesh = new THREE.Mesh(geoMarch, matMarch);
        marchMesh.frustumCulled = false;
        marchMesh.renderOrder = 9998; // nach aller Szene (die Tiefen-Grenze liest sie), vor dem Panorama
        marchMesh.matrixAutoUpdate = false;
        marchMesh.visible = false; // erst sichtbar, wenn das Feld die Textur gemalt hat
        marchMesh.userData.inventar = "feld-pass";
        st.scene.add(marchMesh);
        // DER PANORAMA-DRAW: Vollbild-Dreieck in NDC (der Vertex-Knoten setzt CLIP-Koordinaten direkt, z = 0,999999 —
        // die Tiefe des Panoramas, hinter allem). OHNE Fragment-Tiefe: der frühe Tiefentest verwirft Szene und Sätze.
        const mat = new THREE.MeshBasicNodeMaterial({ depthWrite: true, depthTest: true });
        mat.fog = false;
        mat.vertexNode = TSL.vec4(TSL.positionGeometry.x, TSL.positionGeometry.y, 0.999999, 1.0);
        // DAS LICHT DER WELT auf der Ferne (`_weltLicht`): das Gelände liegt flach, die Normale oben
        const pano = panorama({
            ndc: ndcNode,
            camPos: U.camPos,
            invVP: U.invVP,
            elevMax: U.elevMax,
            pano: TSL.texture(panoTex),
        });
        mat.outputNode = imDunst(TSL.vec4(pano.rgb.mul(WL.at(TSL.vec3(0.0, 1.0, 0.0))), pano.a));
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
        );
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        mesh.renderOrder = 9999; // LETZTER Draw: nur Himmel-Pixel überleben den Tiefentest
        mesh.matrixAutoUpdate = false;
        mesh.visible = false; // erst sichtbar, wenn das Feld die Textur gemalt hat
        mesh.userData.inventar = "feld-pass";
        st.scene.add(mesh);
        st.feldPass = {
            mesh,
            mat,
            march: marchMesh,
            matMarch,
            // die WGSL-Quellen der Draws (`.functionNode.code` samt Includes) — die Budget-Linse liest sie
            // (gate:feld-stellvertreter K2)
            wgsl: { stellvertreter, march, panorama },
            tex,
            daten,
            panoTex,
            panoDaten,
            U,
            anchorX: null,
            anchorZ: null,
            laeufe: 0,
            flug: false,
            gen: 0,
            panoFlug: false,
            panoGen: 0,
            panoLaeufe: 0,
            panoCamX: null,
            panoCamY: null,
            panoCamZ: null,
        };
        return st.feldPass;
    }

    // Das Feld malt das polare Höhen+Farb-Feld: az×rad Polar-Punkte um den Ring-Anker, der Fern-Faden rechnet je Texel Höhe
    // (Wasser flach auf dem Spiegel) und die EINE Fern-Farbe × Saison (`_fernAuftrag` „feld“, B2), der Haupt-Faden legt die
    // Antwort in die RGBA-Textur und backt das Panorama. Re-Anker oder Saison-Drift → neu; das alte Feld bleibt sichtbar, bis
    // das neue steht.
    _feldPassMal(fp, fr) {
        if (fp.flug || !this._nebenFaden("feld")) return; // die Bahn des Panoramas (`_fernAuftrag`)
        const P = AnazhRealm.FELD_PASS;
        const F = AnazhRealm.FERN_RING;
        const rMin = F.schalen[F.schalen.length - 1].aussen;
        const n = P.az * P.rad;
        const punkte = new Float32Array(n * 2);
        for (let iy = 0; iy < P.rad; iy++) {
            const r = rMin + ((iy + 0.5) / P.rad) * (P.rMaxM - rMin);
            for (let ix = 0; ix < P.az; ix++) {
                const a = ((ix + 0.5) / P.az - 0.5) * 2 * Math.PI;
                const k = iy * P.az + ix;
                punkte[k * 2] = fr.anchorX + Math.cos(a) * r;
                punkte[k * 2 + 1] = fr.anchorZ + Math.sin(a) * r;
            }
        }
        fp.flug = true;
        const gen = ++fp.gen;
        const ankerX = fr.anchorX;
        const ankerZ = fr.anchorZ;
        const saison = this._fernSaison({ r: 1, g: 1, b: 1 });
        const schnee = this._schneeGilt(); // der Faden färbt mit dem Versatz der Schneegrenze, den er trägt
        // die Masche des Texels: Azimut-Breite am Radius (im Faden je Texel), die radiale Zeile des Felds
        const hr = (P.rMaxM - rMin) / (2 * P.rad);
        this._fernAuftrag("feld", { punkte, ax: ankerX, az: ankerZ, azN: P.az, hr, saison }, [punkte.buffer])
            .then((antwort) => {
                if (this.state.feldPass !== fp || fp.gen !== gen) return;
                fp.flug = false;
                fp.daten.set(antwort.daten);
                fp.tex.needsUpdate = true;
                fp.U.rMin.value = rMin;
                fp.U.hMax.value = antwort.hMax + 5;
                fp.anchorX = ankerX;
                fp.anchorZ = ankerZ;
                fp.saison = saison;
                fp.schnee = schnee;
                fp.laeufe++;
                // SCHATTIERUNGS-PERSISTENZ: sichtbar wird der Pass erst mit gebackenem Panorama (_feldPanoramaMal setzt
                // visible) — das Fragment liest NUR noch das Panorama, nie das rohe Feld.
                this._feldPanoramaMal(fp);
            })
            .catch((e) => {
                if (this.state.feldPass === fp && fp.gen === gen) fp.flug = false;
                this._stoffBruch("der Feld-Pass (der Fern-Faden)", e);
            });
    }

    // Ist die Saison seit dem Bild des Feldes gewandert (je Kanal > `FERN_FARBE.saisonDrift`, oder die Schneegrenze um eine
    // Stufe, `_schneeGilt`)? Ohne Bild nie.
    _feldSaisonDrift(fp) {
        if (!fp.saison || fp.flug) return false;
        if (fp.schnee !== this._schneeGilt()) return true;
        const jetzt = this._fernSaison(this._feldSaisonTmp || (this._feldSaisonTmp = { r: 1, g: 1, b: 1 }));
        const d = AnazhRealm.FERN_FARBE.saisonDrift;
        return (
            Math.abs(jetzt.r - fp.saison.r) > d ||
            Math.abs(jetzt.g - fp.saison.g) > d ||
            Math.abs(jetzt.b - fp.saison.b) > d
        );
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
            // Block jeden belegten) — der Vertex verwirft leere, die Kosten binden an die Hüllen im Bild.
            const wm = st.weltMarch;
            fp.march.geometry.instanceCount = wm ? wm.obergrenze * AnazhRealm.WELT_MARCH.gesetzBlock : 0;
        }
    }

    // DAS LICHT DER WELT (Licht K3, EIN Lichtweg; Lehre 21): die diffuse Bestrahlung E(n)/π einer Fläche mit der Normale n, wie
    // jedes MeshStandard sie nimmt — Sonne/Mond (Richtung = position − target), Ambient, Hemi (Himmel/Boden) und die Umgebung der
    // EINEN Atmosphäre in DERSELBEN Lesung wie die Stoffe: die PMREM-Stufe der Rauheit 1 (r184 `createIrradianceContext`), je
    // Normale abgetastet in die Himmels-Sonde (`_weltLichtHimmel`, 32 × 16 Richtungen, equirect). EIN TSL-Baustein `at(n)`:
    // Spiegel-Pass und Wasser rufen ihn, Feld-March und Panorama reichen Albedo und Normale an ihn. Bis Licht K3 rechnete jeder
    // Weg sein Licht selbst (der Spiegel 0,3 + 0,7·N·L/max(sun.y, 0,2) × die Bestrahlung des Wassers, das Panorama eine Lambert-
    // Kopie, das Wasser `uIrr`); die erste Runde las den Himmel aus der CPU-Lesung in drei Höhen ohne Azimut — eine senkrechte
    // Fläche bei Uhr 0,27 nahm zur Sonne 0,79, abgewandt 1,65 des Himmels-Lichts.
    _weltLicht() {
        const st = this.state;
        if (st.weltLicht) return st.weltLicht;
        const TSL = THREE.TSL;
        const v = () => TSL.uniform(new THREE.Vector3());
        const U = {
            l0d: TSL.uniform(new THREE.Vector3(0, 1, 0)),
            l0c: v(),
            ambientFarbe: v(),
            hemiOben: v(),
            hemiUnten: v(),
            ei: TSL.uniform(1),
        };
        // DIE HEIMAT DES TAKTS (E1): jeder Wert gilt jedem Leser gleich — als geteilte renderGroup lädt ihn EIN Render
        this._uniformHeimatTeilen(U);
        const himmel = new THREE.RenderTarget(32, 16, {
            type: THREE.HalfFloatType,
            depthBuffer: false,
            generateMipmaps: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.RepeatWrapping,
        });
        himmel.texture.name = "welt-licht-himmel";
        const sonde = TSL.texture(himmel.texture);
        // die Sonde liest die Umgebung je Einheit des Lichts — das Licht jetzt wie jeder Stoff (`_umgebungLicht`)
        const licht = this._umgebungLicht();
        const fn = TSL.Fn(([n]) => {
            const direkt = U.l0c.mul(TSL.max(TSL.dot(n, U.l0d), 0.0));
            const hemi = TSL.mix(U.hemiUnten, U.hemiOben, n.y.mul(0.5).add(0.5));
            const umgebung = sonde.sample(TSL.equirectUV(n)).level(0).rgb.mul(U.ei).mul(licht);
            return direkt
                .add(U.ambientFarbe)
                .add(hemi)
                .mul(1 / Math.PI)
                .add(umgebung);
        });
        st.weltLicht = { U, himmel, stand: 0, at: (n) => fn(n) };
        this._weltLichtTakt();
        return st.weltLicht;
    }

    // DIE HIMMELS-SONDE des Lichts der Welt: je Texel die Richtung der Equirekt-Lage (`_umgebungRichtung`, wie die Umgebung
    // selbst) und dort die PMREM-Lesung der Rauheit 1 — dieselbe Abtastung, mit der r184 jedem MeshStandard das Umgebungs-Licht
    // gibt. Gezeichnet je neuer Umgebung (`_ensureSkyEnvironment`, ihr Ziel behält seine Identität), 512 Texel; vor der ersten
    // Umgebung schwarz wie jeder Stoff.
    _weltLichtHimmel() {
        const st = this.state;
        const WL = this._weltLicht();
        const quelle = st._skyEnvRT && st._skyEnvRT.texture;
        if (!quelle || !st.atmoLut) return;
        if (!WL.pass) {
            const TSL = THREE.TSL;
            const m = new THREE.MeshBasicNodeMaterial();
            m.name = "welt-licht-himmel";
            m.fragmentNode = TSL.vec4(TSL.pmremTexture(quelle, this._umgebungRichtung(TSL.uv()), TSL.float(1)).rgb, 1);
            m.depthTest = false;
            m.depthWrite = false;
            m.toneMapped = false;
            m.fog = false;
            const q = st.atmoLut.qEq;
            WL.pass = new THREE.Mesh(q.geometry, m);
            WL.pass.frustumCulled = false;
            WL.pass.userData = { kamera: q.userData.kamera, quelle };
        } else if (WL.pass.userData.quelle !== quelle)
            this._bruchMelden(
                "LICHT: die Umgebung wechselte ihr Ziel — die Himmels-Sonde liest das erste (`_skyEnvRT` hält es)"
            );
        this._atmoZeichne(WL.pass, WL.himmel);
        WL.stand++;
    }

    // Der EINE Schreiber der Lichter: je Bild (`_loopRender`, neben der Bild-Uhr) und je Anwendung des Tags
    // (`_dayNightApplyWaterMaterials`).
    _weltLichtTakt() {
        const st = this.state;
        const U = st.weltLicht && st.weltLicht.U;
        if (!U) return;
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
        U.hemiOben.value.set(hemi ? hemi.color.r * hi : 0, hemi ? hemi.color.g * hi : 0, hemi ? hemi.color.b * hi : 0);
        U.hemiUnten.value.set(
            hemi ? hemi.groundColor.r * hi : 0,
            hemi ? hemi.groundColor.g * hi : 0,
            hemi ? hemi.groundColor.b * hi : 0
        );
        const sc = st.scene;
        U.ei.value = sc && Number.isFinite(sc.environmentIntensity) ? sc.environmentIntensity : 1;
    }

    // DIE HIMMELS-IRRADIANZ auf der CPU (E/π) für zwei Normalen (oben · waagrecht) aus der Umgebung der EINEN Atmosphäre, wie die
    // CPU sie zurückgelesen hat (`_skyEnvData`, linear je Einheit des Lichts, Zeile 0 = Nadir): je Texel L · max(n·ω, 0) dω, die
    // waagrechte Normale gemittelt über vier Azimute, × das Licht jetzt (E0 · Tönung, wie `_umgebungLicht`). Das Integral neu
    // nur, wenn eine neue Lesung kam. Leser: die Luft unter Wasser und die Linsen der Umgebung; die Belichtung liest den Himmel
    // des Orts synchron (`_himmelsBestrahlung`), die Flächen das Licht der Welt.
    _himmelsIrradianz() {
        const st = this.state;
        const d = st._skyEnvData;
        const A = st.atmoLut;
        const scene = st.scene;
        const env = scene && scene.environment;
        const ei = scene && Number.isFinite(scene.environmentIntensity) ? scene.environmentIntensity : 1;
        if (!d || !A || !env) return null;
        const t = A.U.toenung.value;
        const L = A.U.licht.value;
        const stempel = (st._skyEnvVersion || 0) + ":" + ei + ":" + L + ":" + t.x + ":" + t.y + ":" + t.z;
        if (this._himmelsIrrStempel === stempel && this._himmelsIrr) return this._himmelsIrr;
        this._himmelsIrrStempel = stempel;
        const J = this._himmelsIrrJe;
        const k = [t.x, t.y, t.z].map((x) => (ei * L * x) / Math.PI);
        if (J && J.version === st._skyEnvVersion) {
            this._himmelsIrr = { mitte: J.mitte.map((x, c) => x * k[c]), oben: J.oben.map((x, c) => x * k[c]) };
            return this._himmelsIrr;
        }
        const W = A.rtEq.width;
        const H = A.rtEq.height;
        const oben = [0, 0, 0],
            mitte = [0, 0, 0];
        const dEl = Math.PI / H,
            dPhi = (2 * Math.PI) / W;
        for (let y = 0; y < H; y++) {
            const el = ((y + 0.5) / H - 0.5) * Math.PI;
            const ce = Math.cos(el),
                se = Math.sin(el);
            const dA = ce * dEl * dPhi;
            for (let x = 0; x < W; x++) {
                const phi = ((x + 0.5) / W - 0.5) * 2 * Math.PI;
                // die vier waagrechten Normalen (±x, ±z) zusammen: (|cx| + |cz|) / 4 je Halbraum
                const wO = Math.max(se, 0) * dA,
                    wM = ((Math.abs(ce * Math.cos(phi)) + Math.abs(ce * Math.sin(phi))) / 4) * dA;
                const i = (y * W + x) * 4;
                for (let c = 0; c < 3; c++) {
                    oben[c] += d[i + c] * wO;
                    mitte[c] += d[i + c] * wM;
                }
            }
        }
        this._himmelsIrrJe = { version: st._skyEnvVersion, mitte, oben };
        this._himmelsIrr = { mitte: mitte.map((x, c) => x * k[c]), oben: oben.map((x, c) => x * k[c]) };
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
        if (!this._fernRingGilt()) {
            if (st.fernRing) this._fernRingDispose();
            return;
        }
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
            this._fernRingNeuBestellen(fr); // voller Refresh: der Fern-Faden rechnet den Ring am neuen Anker in Scheiben
        }
        // Die Schalen leben auf Layer 0 (EIN Szene-Pass) — selbstheilend, falls ein Altstand sie verschob; ihr Wurf bleibt
        // ihr `castShadow` (die Wurf-Ebene, K72 `_wurfEbene`).
        for (const m of fr.meshes) {
            const soll = (1 | (m.layers.mask & (1 << AnazhRealm.SHADOW_TWIN_LAYER))) >>> 0;
            if (m.layers.mask !== soll) m.layers.mask = soll;
        }
        this._fernRingMaske(fr); // der Ring weicht dem Gebauten (`maskNode`)
        // DER HORIZONT AUS DEM FADEN (B2): der Ring bestellt seine Scheiben beim Fern-Faden und hängt die Antworten ein
        // (`_fernRingRefresh`) — Boot wie Re-Anker, EIN Weg; der Haupt-Faden rechnet kein Gesetz der Ferne.
        this._fernRingRefresh();
        // DAS EINE WASSER: kam oder ging das Fern-Wasser, legt der Ring seine nassen Punkte neu (`_fernRingWasserTiefe`).
        this._fernRingWasserNeu(fr);
        // DIE KOSTEN AN DER NAHT: die Dreiecke der Schale 0 folgen Maske und Lage (frei · Naht · getragen, `_fernRingTeilung`).
        this._fernRingTeilung(fr);
        // DER FELD-PASS (Ring-Besitz): die Ferne jenseits der Schalen — Ensure,
        // Re-Malen bei Anker-Wechsel, Kamera-Uniforms.
        this._tickFeldPass(fr);
        // DIE FERN-KRONE DES NAHEN BODENS: wechselt das Quadrat, bestellt sie ihre Karte beim Fern-Faden.
        this._fernKroneNahTakt();
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

    // Gehört der Horizont zu dieser Welt? Die EINE Frage für seinen Takt (`_tickFernRing`) und das erste Weltbild
    // (`_weltbildLuecken`, Term „horizont"): der Linsen-Hook `__anazhFernRing` (false: aus, true: auch headless), sonst
    // jede Welt mit Renderer — headless ruht der Ring.
    _fernRingGilt() {
        const hook = typeof window !== "undefined" ? window.__anazhFernRing : undefined;
        if (hook === false) return false;
        const r = this.state.renderer;
        return hook === true || !(r && r._isHeadlessNull);
    }

    // Welt-Wechsel/Restore/Hook-aus: Schalen + das eigene Material entsorgen
    // (der Tick baut die neue Welt lazy nach).
    _fernRingDispose() {
        this._feldPassDispose(); // der Pass ist Ring-Besitz — er fällt mit
        this._fernMemoGen = (this._fernMemoGen | 0) + 1; // die Fern-Farben gehören der Welt, die den Ring trug (das Gedächtnis des Fern-Fadens)
        const fr = this.state.fernRing;
        if (!fr) return;
        this._horizontKarteLeeren(); // die Zeichen-Meshes der Horizont-Karte lesen die Geometrien des Rings — sie fallen zuerst
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

    // ═══ DIE HÖHLEN-SICHT (Welle 7) ═══
    // Befund (echte GPU, Mess-Wiese −900/−850, Gitter-Probe): 68 % der Boden-Kanten trennen Fels von HÖHLEN-Luft (Luft unter
    // der obersten festen Ecke ihrer Spalte, `_voxelHoehlenGraph`), 16–52 m tief, und der Boden-Satz zeichnete sie in JEDEM
    // Pass mit — von der Wiese aus sieht man sie nie, eine Tiefen-Grenze risse an Mündungen, Überhängen und Klippen Löcher.
    // Die Sicht folgt der Luft: ein Strahl aus der Himmels-Luft betritt die Höhlen-Luft nur durch eine MÜNDUNG und wandert
    // von Zelle zu Zelle nur durch ein PORTAL (im Chunk über eine Teil-Grenze, über die Chunk-Kante durch die Rand-Bänder).
    // Je Pass läuft das Schirm-Rechteck jeder Mündung durch die Portale (Schnitt je Portal, Vereinigung je Zelle — die
    // klassische Portal-Sicht); eine Zelle, die ein Rechteck erreicht, zeichnet. Steht das Auge in einer Zelle (perspektivisch,
    // in ihrer Luft-Box), läuft ihr ganzes Bild. Die Kaskade (orthogonal, das Licht) läuft dieselbe Rechnung im Licht-Raum:
    // die Schatten-Karte trägt je Strahl die ERSTE Fläche vom Licht, und die liegt in Himmels-Luft oder hinter einer Mündung —
    // jede andere Höhlen-Fläche ändert die Karte nie. Die Kosten folgen dem Bild: je Pass die Mündungen und die erreichten
    // Zellen, nie die Weltgröße.

    // Die Knoten eines Boden-Bereichs aus dem Höhlen-Graph seines Chunks (Boxen in Welt-Lage, um den Saum geweitet); sein
    // Horizont entsteht beim ersten Lesen (`_hoehlenHorizont`).
    _hoehlenKnoten(s, b, H) {
        if (!s.hoehle)
            s.hoehle = {
                stempel: 0,
                muendungen: new Set(),
                stapel: [],
                rect: new Float64Array(6),
                besucht: null,
                kacheln: null, // die Licht-Kacheln der Kaskade (`_hoehlenSichtLicht`)
                sichtHaupt: null, // die Zellen, die das letzte Hauptbild erreichte (die Empfänger der Kaskaden)
                sichtGen: 0, // zählt jede neue Menge `sichtHaupt` — eine Kaskade, die andere Empfänger las, wählt neu
                voll: false, // trug die letzte perspektivische Sicht jede Mündung im Bild mit ihrer Sperre?
                // die Generation des Bodens: jeder Ein- und Austritt eines Boden-Bereichs und jeder Geomorph-Schreiber legt den
                // Horizont neu — eine gemerkte Sperre gilt nur dem Boden, den sie gemessen hat (`_hoehlenSperre`)
                boden: 0,
            };
        s.hoehle.boden++;
        const saum = AnazhRealm.HOEHLEN_SAUM.schritte * H.step + AnazhRealm.HOEHLEN_SAUM.m;
        const box = (A, o, weit) => {
            if (!(A[o] <= A[o + 3])) return null;
            const bx = new THREE.Box3(
                new THREE.Vector3(A[o], A[o + 1], A[o + 2]),
                new THREE.Vector3(A[o + 3], A[o + 4], A[o + 5])
            );
            return weit ? bx.expandByScalar(saum) : bx;
        };
        const knoten = [];
        for (let z = 0; z < H.n; z++)
            knoten.push({
                bereich: b,
                id: z,
                luft: box(H.knoten, z * 6, true),
                // die Mündungen der Zelle (je Fach eine Box, um den Saum geweitet) mit ihrer Horizont-Sperre je Auge
                tore: [],
                seiten: [0, 1, 2, 3].map((sd) => box(H.seiten, z * 24 + sd * 6, false)),
                // je Seite die offene Rand-Box (der Nachbar-Chunk fehlt, `_hoehlenRand`), sonst null
                raender: [null, null, null, null],
                nb: [],
                zelle: null,
                sicht: 0,
                rect: new Float64Array(4),
                z: 0,
                // der letzte Lauf aus der Zelle in diesem Pass (Stempel, Rechteck, Tiefe) — derselbe läuft nie zweimal
                lauf: 0,
                gelaufen: new Float64Array(5),
            });
        for (let o = 0; o < H.muend.length; o += 7)
            knoten[H.muend[o]].tore.push({
                box: box(H.muend, o + 1, true),
                sperre: -Infinity,
                auge: [NaN, NaN, NaN],
                boden: -1,
            });
        for (let o = 0; o < H.kanten.length; o += 8) {
            const a = knoten[H.kanten[o]];
            const c = knoten[H.kanten[o + 1]];
            const p = this._hoehlenPortal(box(H.kanten, o + 2, true));
            a.nb.push({ zu: c, p });
            c.nb.push({ zu: a, p });
        }
        // `starts`/`startHuelle`: die Knoten mit Mündung oder offenem Rand und die Hülle ihrer Boxen (`_hoehlenRand`)
        b.hoehle = { knoten, step: H.step, rand: H.rand, horizont: null, starts: [], startHuelle: null };
    }

    _hoehlenPortal(box) {
        return { box, rect: new Float64Array(6), st: 0, auf: false };
    }

    // DER HORIZONT eines Boden-Bereichs (lazy, `_hoehlenHorizontProbe`): je Zelle eines Rasters von `HOEHLEN_HORIZONT_M`
    // über seiner Fläche eine UNTERE Schranke des gezeichneten Himmels-Bodens. Die Quelle ist die Boden-Karte des Chunks
    // (`_bodenKarteAusMesh`: die oberste nicht-steile Fläche des fertigen Meshs, Punkte im Abstand step/Teilung) — das
    // Minimum ihrer Punkte in der Zelle und einen Punkt-Abstand darum, minus die Hang-Schranke (eine nicht-steile Fläche,
    // |n_y| ≥ 0,3, fällt zwischen zwei Punkten um höchstens tan(acos 0,3) · Abstand · √½) und den größten Abstieg, den der
    // Geomorph einem Vertex dieser Zelle gibt (der Vertex-Shader zeichnet zwischen Position und Morph-Ziel). Ein Punkt ohne
    // Boden (Wand, Höhle, außerhalb) macht die Zelle offen (−∞). Ein Geomorph-Schreiber legt den Horizont neu
    // (`_chunkSatzMarke`).
    _hoehlenHorizont(s, b) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.HOEHLEN_HORIZONT_M;
        const n = Math.round(span / R);
        const h = new Float32Array(n * n).fill(-Infinity);
        const ent = this.state.voxelChunks ? this.state.voxelChunks.get(b.chunkKey) : null;
        const map = ent && ent.surfMap;
        if (!map) return h;
        const cfg = this._voxelChunkConfig(ent.lod || 0);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const a = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const ox = b.cx * span - cfg.step,
            oz = b.cz * span - cfg.step;
        // der Geomorph-Abstieg je Raster-Zelle (und ihre Nachbarn)
        const morph = new Float32Array(n * n);
        const A = s.geom.attributes;
        const P = A.position.array,
            Z = A.aMorphTarget.array;
        // der Abstieg zum Ziel ganz (K51-2): das Stufen-Gewicht folgt dem Auge, jedes Ziel kann ganz gezeichnet werden
        for (let v = b.vStart; v < b.vStart + b.vAnzahl; v++) {
            const ab = P[v * 3 + 1] - Z[v * 3 + 1];
            if (!(ab > 0)) continue;
            const I = Math.floor((P[v * 3] - b.cx * span) / R),
                K = Math.floor((P[v * 3 + 2] - b.cz * span) / R);
            for (let k = K - 1; k <= K + 1; k++)
                for (let i = I - 1; i <= I + 1; i++)
                    if (i >= 0 && k >= 0 && i < n && k < n && ab > morph[i + k * n]) morph[i + k * n] = ab;
        }
        const hang = Math.tan(Math.acos(0.3)) * a * Math.SQRT1_2;
        for (let K = 0; K < n; K++)
            for (let I = 0; I < n; I++) {
                const xa = b.cx * span + I * R,
                    za = b.cz * span + K * R;
                const i0 = Math.floor((xa - ox) / a) - 1,
                    i1 = Math.ceil((xa + R - ox) / a) + 1,
                    k0 = Math.floor((za - oz) / a) - 1,
                    k1 = Math.ceil((za + R - oz) / a) + 1;
                let mn = Infinity;
                for (let k = k0; k <= k1 && mn > -Infinity; k++)
                    for (let i = i0; i <= i1; i++) {
                        const v = i >= 0 && k >= 0 && i < M && k < M ? map[i + k * M] : NaN;
                        if (!(v >= -Infinity)) {
                            mn = -Infinity;
                            break;
                        }
                        if (v < mn) mn = v;
                    }
                h[I + K * n] = mn - hang - morph[I + K * n];
            }
        return h;
    }

    // Die Rand-Portale zu den Nachbar-Chunks im Satz. Gleiche Stufe: derselbe Welt-Punkt auf der gemeinsamen Kante liegt in
    // beiden Gittern (`rand` des Graphs, gleiche Indizes) — jedes Paar Höhlen-Punkt ↔ Höhlen-Punkt verknüpft seine zwei Zellen,
    // das Portal ist die Box dieser Punkte (um den Saum geweitet). Eine Höhlen-Komponente, die die Kante kreuzt, trägt dort
    // einen Gitter-Punkt (ein 6-Pfad wechselt die Ebene nur über einen Punkt auf ihr). An einer LOD-Naht (verschiedene
    // Schritte) teilen die Gitter nicht jeden Punkt: dort schneidet die Rand-Band-Box einer Zelle die der Nachbar-Zelle,
    // beide um den gröberen Saum geweitet. Danach legen der Bereich und seine Nachbarn ihre offenen Ränder neu.
    _hoehlenVerknuepfe(s, b) {
        const R = AnazhRealm.HOEHLEN_SAUM;
        const x = new THREE.Box3(),
            y = new THREE.Box3();
        const span = this._voxelChunkConfig(0).span;
        const oy = (this.state.terrainBaseHeight || 0) - this._voxelChunkConfig(0).floorDrop;
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (!n) continue;
            const gegen = seite ^ 1;
            const knA = b.hoehle.knoten,
                knB = n.hoehle.knoten;
            const verbinde = (a, c, box) => {
                const p = this._hoehlenPortal(box);
                a.nb.push({ zu: c, p });
                c.nb.push({ zu: a, p });
            };
            if (b.hoehle.step === n.hoehle.step) {
                const step = b.hoehle.step;
                const saum = R.schritte * step + R.m;
                // die Gegen-Kante des Nachbarn: (j, u) → Zelle
                const gegenueber = new Map();
                const rn = n.hoehle.rand;
                for (let o = 0; o < rn.length; o += 4)
                    if (rn[o] === gegen) gegenueber.set(rn[o + 1] * 65536 + rn[o + 2], rn[o + 3]);
                const paare = new Map();
                const ra = b.hoehle.rand;
                // die Welt-Lage der Kante und der Gitter-Ursprung (Pad: ein Schritt vor der Chunk-Kante)
                const ox = b.cx * span - step,
                    oz = b.cz * span - step;
                const kante =
                    seite === 0
                        ? b.cx * span
                        : seite === 1
                          ? (b.cx + 1) * span
                          : seite === 2
                            ? b.cz * span
                            : (b.cz + 1) * span;
                for (let o = 0; o < ra.length; o += 4) {
                    if (ra[o] !== seite) continue;
                    const zc = gegenueber.get(ra[o + 1] * 65536 + ra[o + 2]);
                    if (zc === undefined) continue;
                    const za = ra[o + 3];
                    const key = za * 65536 + zc;
                    let bx = paare.get(key);
                    if (!bx) paare.set(key, (bx = new THREE.Box3()));
                    const wy = oy + ra[o + 1] * step;
                    if (seite < 2) bx.expandByPoint(x.min.set(kante, wy, oz + ra[o + 2] * step));
                    else bx.expandByPoint(x.min.set(ox + ra[o + 2] * step, wy, kante));
                }
                for (const [key, bx] of paare) {
                    const a = knA[Math.floor(key / 65536)],
                        c = knB[key % 65536];
                    if (a && c) verbinde(a, c, bx.expandByScalar(saum));
                }
                continue;
            }
            const saum = R.schritte * Math.max(b.hoehle.step, n.hoehle.step) + R.m;
            for (const a of knA) {
                const sa = a.seiten[seite];
                if (!sa) continue;
                x.copy(sa).expandByScalar(saum);
                for (const c of knB) {
                    const sc = c.seiten[gegen];
                    if (!sc) continue;
                    y.copy(sc).expandByScalar(saum);
                    if (x.intersectsBox(y)) verbinde(a, c, x.clone().intersect(y));
                }
            }
        }
        this._hoehlenRandUm(s, b);
    }

    // Der Nachbar-Bereich eines Boden-Bereichs an einer Seite (0 −x · 1 +x · 2 −z · 3 +z), sofern er einen Höhlen-Graph trägt.
    _hoehlenNachbar(s, b, seite) {
        const n = s.bloecke.get(
            b.cx + (seite === 0 ? -1 : seite === 1 ? 1 : 0) + "," + (b.cz + (seite === 2 ? -1 : seite === 3 ? 1 : 0))
        );
        return n && n.hoehle ? n : null;
    }

    // Der Bereich und seine vier Nachbarn legen ihre offenen Ränder neu.
    _hoehlenRandUm(s, b) {
        this._hoehlenRand(s, b);
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (n) this._hoehlenRand(s, n);
        }
    }

    // DER OFFENE RAND: fehlt der Nachbar-Chunk einer Seite (der Ring endet dort), liegt die Höhlen-Luft im Rand-Band offen —
    // der Ring schneidet die Höhle auf, und ein Strahl von draußen (das Licht, eine Kamera jenseits des Rings) tritt dort ein.
    // Die Rand-Box (um den Saum geweitet) wirkt wie eine Mündung; ein Knoten mit Mündung oder offenem Rand ist ein Start.
    // Je Bereich die Starts und die Hülle aller ihrer Boxen (Mündungen und Ränder): ein Pass, dessen Gesetz die Hülle nicht
    // trifft, prüft keinen dieser Starts (Welle C — vorher prüfte jeder Pass jede Mündung des Rings).
    _hoehlenRand(s, b) {
        if (!b || !b.hoehle) return;
        const R = AnazhRealm.HOEHLEN_SAUM;
        const saum = R.schritte * b.hoehle.step + R.m;
        const fehlt = [0, 1, 2, 3].map((seite) => !this._hoehlenNachbar(s, b, seite));
        const starts = [];
        const huelle = new THREE.Box3();
        for (const kn of b.hoehle.knoten) {
            let offen = kn.tore.length > 0;
            for (const tor of kn.tore) huelle.union(tor.box);
            for (let seite = 0; seite < 4; seite++) {
                const sb = fehlt[seite] ? kn.seiten[seite] : null;
                kn.raender[seite] = sb ? sb.clone().expandByScalar(saum) : null;
                if (sb) {
                    offen = true;
                    huelle.union(kn.raender[seite]);
                }
            }
            if (offen) {
                s.hoehle.muendungen.add(kn);
                starts.push(kn);
            } else s.hoehle.muendungen.delete(kn);
        }
        b.hoehle.starts = starts;
        b.hoehle.startHuelle = starts.length > 0 ? huelle : null;
        s.stand++; // ein Rand öffnet oder schließt sich: jede Wahl liest neu
    }

    // Der Austritt eines Boden-Bereichs: seine Starts fallen, die Nachbar-Zellen vergessen ihre Rand-Portale zu ihm, und seine
    // Nachbarn liegen an dieser Seite nun offen.
    _hoehlenLoese(s, b) {
        s.hoehle.boden++;
        for (const kn of b.hoehle.knoten) {
            s.hoehle.muendungen.delete(kn);
            for (const e of kn.nb) if (e.zu.bereich !== b) e.zu.nb = e.zu.nb.filter((f) => f.zu.bereich !== b);
        }
        b.hoehle = null;
        for (let seite = 0; seite < 4; seite++) {
            const n = this._hoehlenNachbar(s, b, seite);
            if (n) this._hoehlenRand(s, n);
        }
    }

    // DIE HORIZONT-SPERRE einer Mündung (perspektivisch): der größte waagerechte Abstand d vom Auge, an dem JEDER Strahl zur
    // Box unter dem gezeichneten Boden läuft — ein Bogen um das Auge (Abstand d, über den Winkel-Keil ihrer Grundfläche)
    // trägt überall Boden, der höher liegt als jeder Strahl zur Box dort sein kann (die Gerade vom Auge zum höchsten Punkt
    // der Box, über den kürzesten bzw. längsten Weg); −∞, wenn kein Bogen sperrt. Unter dem Boden liegt Fels oder Höhlen-Luft:
    // ein Strahl aus Himmels-Luft kommt an einer Sperre nur durch eine Höhle vorbei, und hinter der fernsten Sperre läuft er
    // aus einer Höhle, deren Ausgang weiter weg liegt (`_hoehlenHinaus`). Der Boden ist die untere Schranke
    // `_hoehlenHorizont`; ein ungeladener Ort hat keinen Boden (−∞). Der Bogen wird je Raster-Zelle abgetastet, jeder Punkt
    // liest das Minimum seiner 3 × 3 Zellen (ein Bogen-Stück zwischen zwei Punkten liegt in ihnen). Gemerkt je Auge — für
    // jedes Auge im Würfel ±`HOEHLEN_AUGE_M` um das geprüfte (die Probe hebt das Auge und weitet die Box um ihn; die 3 × 3
    // Zellen tragen die Verschiebung): das Auge der Spiel-Kamera atmet im Stand um Millimeter, und jede Probe neu wäre
    // Arbeit ohne Änderung. Und je BODEN (`H.boden`): ein neuer Horizont — ein Chunk tritt ein oder aus (der Spieler gräbt,
    // der Ring wandert), ein Geomorph senkt den Rand — erreicht jede gemerkte Sperre; ohne das sperrte im Stand ein
    // gegrabener Hang die Mündung dahinter, bis das Auge 0,25 m ginge.
    _hoehlenSperre(s, tor, ex, ey, ez) {
        if (this._hoehlenAugeGleich(s.hoehle, tor, ex, ey, ez)) return tor.sperre;
        const t = AnazhRealm.HOEHLEN_AUGE_M;
        tor.boden = s.hoehle.boden;
        tor.auge[0] = ex;
        tor.auge[1] = ey;
        tor.auge[2] = ez;
        const box = this._hoehlenProbenBox || (this._hoehlenProbenBox = new THREE.Box3());
        tor.sperre = this._hoehlenHorizontProbe(s, box.copy(tor.box).expandByScalar(t), ex, ey + t, ez);
        return tor.sperre;
    }

    _hoehlenAugeGleich(H, tor, ex, ey, ez) {
        const t = AnazhRealm.HOEHLEN_AUGE_M;
        return (
            tor.boden === H.boden &&
            Math.abs(tor.auge[0] - ex) <= t &&
            Math.abs(tor.auge[1] - ey) <= t &&
            Math.abs(tor.auge[2] - ez) <= t
        );
    }

    // Der Boden an der Raster-Zelle (I, K) der Welt (`HOEHLEN_HORIZONT_M`): die untere Schranke ihres Bereichs, −∞ ohne.
    _hoehlenBodenZelle(s, I, K, c) {
        const n = c.n;
        const kx = Math.floor(I / n),
            kz = Math.floor(K / n);
        if (kx !== c.kx || kz !== c.kz) {
            c.kx = kx;
            c.kz = kz;
            const b = s.bloecke.get(kx + "," + kz);
            c.h = b && b.hoehle ? b.hoehle.horizont || (b.hoehle.horizont = this._hoehlenHorizont(s, b)) : null;
        }
        return c.h ? c.h[I - kx * n + (K - kz * n) * n] : -Infinity;
    }

    _hoehlenHorizontProbe(s, box, ex, ey, ez) {
        // der nächste und der fernste Punkt der Grundfläche
        const nx = Math.max(box.min.x - ex, 0, ex - box.max.x),
            nz = Math.max(box.min.z - ez, 0, ez - box.max.z);
        const dMin = Math.hypot(nx, nz);
        if (dMin < 2) return -Infinity;
        const dMax = this._hoehlenWeit(box, ex, ez);
        // der Winkel-Keil der Grundfläche um die Richtung zu ihrer Mitte
        const mitte = Math.atan2((box.min.z + box.max.z) / 2 - ez, (box.min.x + box.max.x) / 2 - ex);
        let w0 = Infinity,
            w1 = -Infinity;
        for (let c = 0; c < 4; c++) {
            let w = Math.atan2((c & 2 ? box.max.z : box.min.z) - ez, (c & 1 ? box.max.x : box.min.x) - ex) - mitte;
            if (w > Math.PI) w -= 2 * Math.PI;
            if (w < -Math.PI) w += 2 * Math.PI;
            if (w < w0) w0 = w;
            if (w > w1) w1 = w;
        }
        const hoch = box.max.y - ey;
        const dRef = hoch >= 0 ? dMin : dMax;
        const R = AnazhRealm.HOEHLEN_HORIZONT_M;
        const c = this._hoehlenBodenCache || (this._hoehlenBodenCache = { n: 0, kx: NaN, kz: NaN, h: null });
        c.n = Math.round(this._voxelChunkConfig(0).span / R);
        c.kx = NaN;
        // die Bögen von der Box zum Auge: der erste, der sperrt, ist die fernste Sperre
        const bogen = this._hoehlenBoegen || (this._hoehlenBoegen = []);
        bogen.length = 0;
        for (let d = 2; d < dMin; d += Math.max(R, 0.04 * d)) bogen.push(d);
        for (let j = bogen.length - 1; j >= 0; j--) {
            const d = bogen[j];
            const grenze = ey + (hoch * d) / dRef; // kein Strahl liegt dort höher
            const schritte = Math.max(1, Math.ceil(((w1 - w0) * d) / R));
            let frei = false;
            for (let q = 0; q <= schritte && !frei; q++) {
                const w = mitte + w0 + ((w1 - w0) * q) / schritte;
                const I = Math.floor((ex + d * Math.cos(w)) / R),
                    K = Math.floor((ez + d * Math.sin(w)) / R);
                for (let k = K - 1; k <= K + 1 && !frei; k++)
                    for (let i = I - 1; i <= I + 1; i++)
                        if (!(this._hoehlenBodenZelle(s, i, k, c) >= grenze)) {
                            frei = true;
                            break;
                        }
            }
            if (!frei) return d;
        }
        return -Infinity;
    }

    // Der fernste waagerechte Abstand vom Auge zur Grundfläche einer Box.
    _hoehlenWeit(box, ex, ez) {
        return Math.hypot(
            Math.max(Math.abs(box.min.x - ex), Math.abs(box.max.x - ex)),
            Math.max(Math.abs(box.min.z - ez), Math.abs(box.max.z - ez))
        );
    }

    // DIE HÖHLEN-SICHT eines Passes (aus `_chunkSatzPass`, mit der Matrix der Pass-Kamera in `S.m`): jede Zelle, die zeichnen
    // muss, trägt den Stempel dieses Passes (`_chunkSatzAbschnitt` liest ihn). Die Kaskade (orthogonal, das Licht) wählt
    // anders (`_hoehlenSichtLicht`). PERSPEKTIVISCH läuft ein Strahl vom Auge fort: je Zelle trägt der Lauf neben dem
    // Schirm-Rechteck die Tiefe, die der Strahl dort mindestens hat (NDC-z, monoton in der Blick-Tiefe) — ein Portal ganz davor
    // ist zu. Starts sind (1) die Zellen um das Auge (in ihrer Luft-Box) mit dem ganzen Bild, (2) jede Mündung im Bild, die der
    // Horizont nicht sperrt (`_hoehlenSperre`), (3) jeder offene Rand — tritt das Auge von draußen ein, läuft er durch die
    // Portale, sonst zeichnet nur seine Zelle (der Rand-Saum des Netzes ragt über die Kante). Der Lauf geht (4) durch die
    // Portale und (5) aus jeder erreichten Zelle hinaus zu den gesperrten Mündungen dahinter (`_hoehlenHinaus`) — die Sperre
    // gilt nur Strahlen, die bis zu ihr in Himmels-Luft laufen; einer, der in einer Höhle beginnt oder durch sie hindurch
    // läuft, kommt an ihr vorbei. Das Hauptbild merkt seine erreichten Zellen (`sichtHaupt`, die Empfänger der Kaskaden).
    _hoehlenSicht(s, kamera, S, haupt) {
        if (!kamera || kamera.isPerspectiveCamera !== true) return this._hoehlenSichtLicht(s, S, kamera);
        const H = s.hoehle;
        const st = ++H.stempel;
        const m = S.m.elements;
        H.stapel.length = 0;
        const besucht = (H.besucht = haupt ? [] : null);
        const rc = H.rect;
        const span = this._voxelChunkConfig(0).span;
        const e = kamera.matrixWorld.elements;
        const ex = e[12],
            ey = e[13],
            ez = e[14];
        // (1) das Auge in einer Zelle
        const v = this._hoehlenAuge || (this._hoehlenAuge = new THREE.Vector3());
        v.set(ex, ey, ez);
        const cx = Math.floor(ex / span),
            cz = Math.floor(ez / span);
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                const b = s.bloecke.get(cx + dx + "," + (cz + dz));
                if (!b || !b.hoehle) continue;
                for (const kn of b.hoehle.knoten)
                    if (kn.luft && kn.luft.containsPoint(v)) this._hoehlenBesuch(H, kn, -1, -1, 1, 1, -Infinity);
            }
        // Die Bereiche mit Starts im Bild: das EINE Gesetz der Pass-Wahl gegen die Hülle ihrer Mündungen und Ränder — ein
        // Bereich daneben (hinter dem Auge, jenseits der fernen Ebene) prüft keinen seiner Starts (Welle C: vorher jeder Pass
        // jede Mündung des Rings, je acht Ecken).
        const imBild = H.imBild || (H.imBild = []);
        imBild.length = 0;
        for (const b of s.ordnung) {
            const bh = b.hoehle;
            if (bh && bh.startHuelle && this._passTrifftBox(S.lage, bh.startHuelle, 0)) imBild.push(bh);
        }
        // (2) die Mündungen im Bild: eine frische Horizont-Probe kostet — je Pass höchstens `HOEHLEN_HORIZONT_PROBEN`, die
        // nächsten zuerst; eine Mündung ohne frische Probe gilt als offen (mehr zeichnen, nie ein Loch). Eine gesperrte
        // wartet auf einen Ausgang (`hinter`, (5)).
        const offen = H.offen || (H.offen = []);
        const hinter = H.hinter || (H.hinter = []);
        offen.length = 0;
        hinter.length = 0;
        for (const bh of imBild)
            for (const kn of bh.starts)
                for (const tor of kn.tore) {
                    if (!this._hoehlenRect(tor.box, m, rc)) continue;
                    tor.st = st;
                    tor.r0 = rc[0];
                    tor.r1 = rc[1];
                    tor.r2 = rc[2];
                    tor.r3 = rc[3];
                    tor.r4 = rc[4];
                    tor.r5 = rc[5];
                    tor.kn = kn;
                    tor.weit = this._hoehlenWeit(tor.box, ex, ez);
                    if (this._hoehlenAugeGleich(H, tor, ex, ey, ez)) {
                        if (tor.sperre === -Infinity) this._hoehlenBesuch(H, kn, rc[0], rc[1], rc[2], rc[3], rc[4]);
                        else hinter.push(tor);
                        continue;
                    }
                    const bx = tor.box;
                    tor.d = Math.hypot((bx.min.x + bx.max.x) / 2 - ex, (bx.min.z + bx.max.z) / 2 - ez);
                    offen.push(tor);
                }
        offen.sort((p, q) => p.d - q.d);
        for (let i = 0; i < offen.length; i++) {
            const tor = offen[i];
            if (i < AnazhRealm.HOEHLEN_HORIZONT_PROBEN && this._hoehlenSperre(s, tor, ex, ey, ez) > -Infinity)
                hinter.push(tor);
            else this._hoehlenBesuch(H, tor.kn, tor.r0, tor.r1, tor.r2, tor.r3, tor.r4);
        }
        // jede Mündung im Bild trägt ihre Sperre (keine wartet auf eine Probe): die Sicht steht, bis die Lage sich ändert
        H.voll = offen.length <= AnazhRealm.HOEHLEN_HORIZONT_PROBEN;
        // die gesperrten nach ihrer Sperre: ein Ausgang liest nur die, deren Sperre vor ihm liegt (`_hoehlenAusgang`)
        hinter.sort((p, q) => p.sperre - q.sperre);
        for (const bh of imBild)
            for (const kn of bh.starts) {
                // (3) der offene Rand: von draußen durch die Portale, von drinnen nur seine Zelle
                const b = kn.bereich;
                for (let seite = 0; seite < 4; seite++) {
                    const rb = kn.raender[seite];
                    if (!rb || !this._hoehlenRect(rb, m, rc)) continue;
                    const draussen =
                        seite === 0
                            ? ex < b.cx * span
                            : seite === 1
                              ? ex > (b.cx + 1) * span
                              : seite === 2
                                ? ez < b.cz * span
                                : ez > (b.cz + 1) * span;
                    if (draussen) this._hoehlenBesuch(H, kn, rc[0], rc[1], rc[2], rc[3], rc[4]);
                    else this._hoehlenMarke(H, kn);
                }
            }
        // (4) durch die Portale: das Rechteck schrumpft je Portal, die Tiefe wächst; (5) hinaus durch die Ausgänge der Zelle
        while (H.stapel.length > 0) {
            const kn = H.stapel.pop();
            const r = kn.rect;
            const z = kn.z;
            // eine Zelle liegt oft mehrfach im Stapel (jeder Besuch, der ihr Rechteck weitet, legt sie neu): ein Lauf mit
            // demselben Rechteck und derselben Tiefe wie ihr letzter in diesem Pass bringt nichts Neues
            const g = kn.gelaufen;
            if (kn.lauf === st && g[0] === r[0] && g[1] === r[1] && g[2] === r[2] && g[3] === r[3] && g[4] === z)
                continue;
            kn.lauf = st;
            g[0] = r[0];
            g[1] = r[1];
            g[2] = r[2];
            g[3] = r[3];
            g[4] = z;
            for (const ed of kn.nb) {
                const p = ed.p;
                if (p.st !== st) {
                    p.st = st;
                    p.auf = this._hoehlenRect(p.box, m, p.rect);
                }
                if (!p.auf) continue;
                const q = p.rect;
                if (q[5] < z) continue;
                const x0 = r[0] > q[0] ? r[0] : q[0],
                    y0 = r[1] > q[1] ? r[1] : q[1],
                    x1 = r[2] < q[2] ? r[2] : q[2],
                    y1 = r[3] < q[3] ? r[3] : q[3];
                if (x0 <= x1 && y0 <= y1) this._hoehlenBesuch(H, ed.zu, x0, y0, x1, y1, q[4] > z ? q[4] : z);
            }
            if (hinter.length > 0) this._hoehlenHinaus(H, kn, m, st, ex, ez);
        }
        // die Empfänger der Kaskaden: die erreichten Zellen, deren Dreiecke das Hauptbild zeichnet (das EINE Gesetz der
        // Pass-Wahl in der Lage dieses Passes, wie `_chunkSatzAbschnitt` sie wählt); eine neue Menge zählt `sichtGen`
        if (besucht) {
            const neu = besucht.filter(
                (kn) => kn.zelle && !kn.zelle.huelle.isEmpty() && this._passTrifftBox(S.lage, kn.zelle.huelle, 0)
            );
            if (!H.sichtHaupt || !this._satzListeGleich(H.sichtHaupt, neu)) {
                H.sichtHaupt = neu;
                H.sichtGen++;
            }
        }
    }

    // HINAUS (5): ein Strahl, der eine erreichte Zelle durch ihre Luft quert, tritt durch eine ihrer Mündungen (oder einen
    // offenen Rand) wieder in Himmels-Luft — das Auge stand in der Höhle, an ihrer Mündung, oder der Strahl lief unter einem
    // Überhang, durch einen Tunnel. Jeder Ausgang im Bild ist ein Fenster (sein Rechteck ∩ das der Zelle, nicht näher als
    // beide), und hinter ihm erreicht der Strahl jede gesperrte Mündung, deren fernste Sperre vor dem Ausgang liegt
    // (`_hoehlenSperre`, gemessen vom geprüften Auge: der Würfel `HOEHLEN_AUGE_M` verschiebt sie um höchstens 2 × seine Kante).
    _hoehlenHinaus(H, kn, m, st, ex, ez) {
        for (const tor of kn.tore)
            if (tor.st === st) this._hoehlenAusgang(H, kn, tor.r0, tor.r1, tor.r2, tor.r3, tor.r4, tor.weit);
        const q = H.rect;
        for (let seite = 0; seite < 4; seite++) {
            const rb = kn.raender[seite];
            if (rb && this._hoehlenRect(rb, m, q))
                this._hoehlenAusgang(H, kn, q[0], q[1], q[2], q[3], q[4], this._hoehlenWeit(rb, ex, ez));
        }
    }

    _hoehlenAusgang(H, kn, x0, y0, x1, y1, z0, weit) {
        const r = kn.rect;
        if (r[0] > x0) x0 = r[0];
        if (r[1] > y0) y0 = r[1];
        if (r[2] < x1) x1 = r[2];
        if (r[3] < y1) y1 = r[3];
        if (x0 > x1 || y0 > y1) return;
        if (kn.z > z0) z0 = kn.z;
        const bis = weit + 2 * AnazhRealm.HOEHLEN_AUGE_M;
        // `hinter` liegt nach der Sperre geordnet (`_hoehlenSicht`): ab der ersten jenseits des Ausgangs keine mehr
        const h = H.hinter;
        for (let i = 0; i < h.length; i++) {
            const tor = h[i];
            if (tor.sperre > bis) break;
            if (tor.r5 < z0) continue;
            const a0 = x0 > tor.r0 ? x0 : tor.r0,
                b0 = y0 > tor.r1 ? y0 : tor.r1,
                a1 = x1 < tor.r2 ? x1 : tor.r2,
                b1 = y1 < tor.r3 ? y1 : tor.r3;
            if (a0 <= a1 && b0 <= b1) this._hoehlenBesuch(H, tor.kn, a0, b0, a1, b1, tor.r4 > z0 ? tor.r4 : z0);
        }
    }

    // Eine Zelle erreicht ein Rechteck mit einer Tiefe: neu (Stempel) oder mehr als bisher (größeres Rechteck oder eine
    // kleinere Tiefe, die weiter trägt) → vereinigen und weiterlaufen.
    _hoehlenBesuch(H, kn, x0, y0, x1, y1, z) {
        const r = kn.rect;
        if (kn.sicht === H.stempel) {
            const naeher = z < kn.z;
            if (!naeher && r[0] <= x0 && r[1] <= y0 && r[2] >= x1 && r[3] >= y1) return;
            if (x0 < r[0]) r[0] = x0;
            if (y0 < r[1]) r[1] = y0;
            if (x1 > r[2]) r[2] = x1;
            if (y1 > r[3]) r[3] = y1;
            if (naeher) kn.z = z;
        } else {
            kn.sicht = H.stempel;
            r[0] = x0;
            r[1] = y0;
            r[2] = x1;
            r[3] = y1;
            kn.z = z;
            if (H.besucht) H.besucht.push(kn);
        }
        H.stapel.push(kn);
    }

    // Eine Zelle zeichnet in diesem Pass, ohne dass ein Strahl durch sie weiterläuft (ein leeres Rechteck und eine Tiefe, die
    // nichts trägt: jeder echte Besuch danach ist mehr).
    _hoehlenMarke(H, kn) {
        if (kn.sicht === H.stempel) return;
        kn.sicht = H.stempel;
        kn.rect[0] = 1;
        kn.rect[1] = 1;
        kn.rect[2] = -1;
        kn.rect[3] = -1;
        kn.z = Infinity;
        if (H.besucht) H.besucht.push(kn);
    }

    // DIE HÖHLEN-SICHT DER KASKADE (orthogonal, das Licht): die Karte muss nur für die EMPFÄNGER stimmen, die das Bild zeigt —
    // für jeden muss die erste Fläche auf seinem Weg zum Licht in der Karte stehen. Dieser Weg kann durch Fels laufen, ohne
    // eine Fläche zu kreuzen: der Ring schneidet das Gelände auf, eine LOD-Naht im Höhlen-Netz klafft, die Nah-Ebene der
    // Kaskade kappt — dann wirft jede Höhlen-Fläche auf dem Weg (gemessen 06.10., Abend, Kamera in der Halle 38 m tief: ein
    // versiegelter Hohlraum warf durch die Naht −23/−24 einen Schatten-Strich, den ein Lauf durch Luft-Portale verlor). Darum
    // ohne Luft-Annahme: eine Höhlen-Zelle zeichnet, wenn ihr Licht-Rechteck das eines Empfängers schneidet und sie dem Licht
    // so nah kommt wie dessen tiefster Punkt. Empfänger sind die Zellen des Hauptbilds (`sichtHaupt`, ihre Hülle) und — für
    // die Empfänger in Himmels-Luft, deren Weg zum Licht Höhlen-Luft nur durch eine Mündung betritt (darüber liegt nur
    // Himmels-Luft oder Fels unter einer Himmels-Fläche, die immer zeichnet) — jede Mündung. Ortsfeste Kacheln von
    // `HOEHLEN_LICHT_KACHEL_M` quer zum Licht tragen je Kachel die tiefste Empfänger-Tiefe; eine Zelle liest die Kacheln
    // unter ihrer Box. Die Kosten folgen der Karte (Welle C — vorher je Kaskaden-Pass jede Mündung des Rings und jede
    // Höhlen-Zelle der Box, acht Ecken je Box, auch an der Oberfläche ohne jede Höhle im Bild): ein Empfänger zählt nur, wenn
    // das EINE Gesetz der Pass-Wahl seinen BEREICH in diesem Pass trifft (Box der Kaskade und Licht-Kapsel gegen ihre
    // Scheibe — die Empfänger einer Mündung liegen auf ihrem Weg vom Licht fort, ein Empfänger des Hauptbilds liest die Karte
    // nur in seiner Scheibe): die Zellen des Hauptbilds über die Hülle ihres Bereichs, die Mündungen über die Hülle der
    // Mündungs-Boxen ihres Bereichs — je Bereich EINE Prüfung, nie je Empfänger; OHNE Empfänger
    // wirft keine Höhlen-Zelle (Frühausstieg), und ein Bereich, dessen Licht-Rechteck keine Kachel eines Empfängers schneidet
    // oder der dem Licht nicht so nah kommt wie der tiefste, prüft keine seiner Zellen. Die Lage einer Box im Licht-Raum
    // hängt nur an der DREHUNG des Lichts: jede Box (Mündung, Zelle, Bereich) trägt ihr Licht-Rechteck, bis das Licht sich
    // dreht (`H.lichtGen`) oder der Satz einen neuen Stand hat (Hülle, Ordnung, Rand) — dreht die Kamera, wandert die Kaskade
    // nur quer zum Licht, und keine Ecke wird neu gerechnet (OMEN-Urteil 06.10., Drehen: ~1 800 Boxen je Frame).
    _hoehlenSichtLicht(s, S, kamera) {
        const H = s.hoehle;
        const st = ++H.stempel;
        H.besucht = null;
        if (!kamera || !kamera.matrixWorldInverse)
            throw new Error("_hoehlenSichtLicht: eine Kaskade ohne Kamera — die Licht-Kacheln brauchen ihre Drehung");
        // die Lage einer Box im Licht-Raum: nur die DREHUNG der Licht-Kamera (u, v quer zum Licht, d entlang) — die Kacheln
        // stehen ortsfest, während die Kaskaden-Box mit dem atmenden Auge wandert (sonst kippte die Wahl am Rand je Frame)
        // die Drehung des Lichts, gegen die gemerkte bis auf die Rundung (eine neu gelegte Kaskaden-Box legt ihre Kamera aus
        // Ort + Richtung neu an — dieselbe Richtung trägt dann Rundungs-Reste); gerechnet wird mit der gemerkten
        const ek = kamera.matrixWorldInverse.elements;
        const e = H.lichtE || (H.lichtE = new Float64Array(16));
        let gedreht = !H.lichtGen;
        for (let i = 0; i < 11; i++) if (i % 4 !== 3 && !(Math.abs(e[i] - ek[i]) <= 1e-7)) gedreht = true;
        if (gedreht) {
            e.set(ek);
            H.lichtGen = (H.lichtGen || 0) + 1;
        }
        const lg = H.lichtGen,
            stand = s.stand;
        // das Licht-Rechteck einer Box, gemerkt an ihrem Halter (Mündung, Zelle, Bereich)
        const lage = (h, box) => {
            if (h.lrGen === lg && h.lrStand === stand) return h.lr;
            const L = h.lr || (h.lr = new Float64Array(6));
            this._hoehlenLichtLage(box, e, L);
            h.lrGen = lg;
            h.lrStand = stand;
            return L;
        };
        const T = AnazhRealm.HOEHLEN_LICHT_KACHEL_M;
        const K = H.kacheln || (H.kacheln = new Map());
        K.clear();
        const P = S.lage;
        // der Licht-Rand des Passes (`lichtRandTexel`): die Wahl hält über die Stufen der Sonne — ein Werfer, der nach einer
        // Drehung bis zum Rand wirft, wirft schon jetzt (sein Rechteck und seine Nähe um den Rand geweitet)
        const m = P.licht;
        // die Kachel-Spanne aller Empfänger (i0, j0, i1, j1) und ihre tiefste Tiefe
        const E = H.empfSpanne || (H.empfSpanne = new Float64Array(5));
        E[0] = E[1] = Infinity;
        E[2] = E[3] = E[4] = -Infinity;
        const empfang = (kn, h, box) => {
            if (!box) return;
            kn.sicht = st;
            const L = lage(h, box);
            const tief = L[5];
            const i0 = Math.floor(L[0] / T),
                i1 = Math.floor(L[3] / T),
                j0 = Math.floor(L[1] / T),
                j1 = Math.floor(L[4] / T);
            for (let j = j0; j <= j1; j++)
                for (let i = i0; i <= i1; i++) {
                    const key = (i + 32768) * 65536 + (j + 32768);
                    const w = K.get(key);
                    if (w === undefined || tief > w) K.set(key, tief);
                }
            if (i0 < E[0]) E[0] = i0;
            if (j0 < E[1]) E[1] = j0;
            if (i1 > E[2]) E[2] = i1;
            if (j1 > E[3]) E[3] = j1;
            if (tief > E[4]) E[4] = tief;
        };
        // die Zellen des Hauptbilds: je Bereich EINE Prüfung seiner Hülle (gemerkt an diesem Stempel)
        if (H.sichtHaupt)
            for (const kn of H.sichtHaupt) {
                const b = kn.bereich;
                if (!b.hoehle || !b.huelle) continue;
                if (b._empfSt !== st) {
                    b._empfSt = st;
                    b._empfJa = this._passTrifftBox(P, b.huelle, 0);
                }
                if (b._empfJa) empfang(kn, kn.zelle, kn.zelle.huelle);
            }
        for (const b of s.ordnung) {
            const bh = b.hoehle;
            if (!bh || !bh.startHuelle || !this._passTrifftBox(P, bh.startHuelle, 0)) continue;
            for (const kn of bh.starts) for (const tor of kn.tore) empfang(kn, tor, tor.box);
        }
        if (K.size === 0) return;
        // die Werfer-Kandidaten: die Zellen, die das EINE Gesetz der Pass-Wahl in diesem Pass trifft (Box der Kaskade und
        // Licht-Kapsel gegen ihre Scheibe — `_chunkSatzAbschnitt` wählt dieselben)
        for (const b of s.ordnung) {
            if (!b.hoehle || !b.huelle || b.huelle.isEmpty() || !this._passTrifftBox(P, b.huelle, 0)) continue;
            const L = lage(b, b.huelle);
            if (
                L[2] - m > E[4] ||
                Math.floor((L[3] + m) / T) < E[0] ||
                Math.floor((L[0] - m) / T) > E[2] ||
                Math.floor((L[4] + m) / T) < E[1] ||
                Math.floor((L[1] - m) / T) > E[3]
            )
                continue;
            for (const kn of b.hoehle.knoten) {
                const z = kn.zelle;
                if (!z || kn.sicht === st || z.huelle.isEmpty() || !this._passTrifftBox(P, z.huelle, 0)) continue;
                const Z = lage(z, z.huelle);
                const nah = Z[2] - m;
                let wirft = false;
                for (let j = Math.floor((Z[1] - m) / T); j <= Math.floor((Z[4] + m) / T) && !wirft; j++)
                    for (let i = Math.floor((Z[0] - m) / T); i <= Math.floor((Z[3] + m) / T); i++) {
                        const w = K.get((i + 32768) * 65536 + (j + 32768));
                        if (w !== undefined && w >= nah) {
                            wirft = true;
                            break;
                        }
                    }
                if (wirft) kn.sicht = st;
            }
        }
    }

    // Die Lage einer Box im Licht-Raum (`e` = die Elemente der matrixWorldInverse der Kaskade, nur ihre DREHUNG): u, v quer
    // zum Licht in out[0], out[1] (Minimum) und out[3], out[4] (Maximum), die Tiefe d entlang des Lichts in out[2] (nah)
    // und out[5] (fern) — acht Ecken.
    _hoehlenLichtLage(box, e, L) {
        L[0] = L[1] = L[2] = Infinity;
        L[3] = L[4] = L[5] = -Infinity;
        for (let c = 0; c < 8; c++) {
            const x = c & 1 ? box.max.x : box.min.x,
                y = c & 2 ? box.max.y : box.min.y,
                z = c & 4 ? box.max.z : box.min.z;
            const u = e[0] * x + e[4] * y + e[8] * z,
                v = e[1] * x + e[5] * y + e[9] * z,
                d = -(e[2] * x + e[6] * y + e[10] * z);
            if (u < L[0]) L[0] = u;
            if (u > L[3]) L[3] = u;
            if (v < L[1]) L[1] = v;
            if (v > L[4]) L[4] = v;
            if (d < L[2]) L[2] = d;
            if (d > L[5]) L[5] = d;
        }
        return L;
    }

    // Das Schirm-Rechteck einer Box unter der Pass-Matrix `m` (NDC, auf [−1, 1] geklemmt) in `out[0…3]`, ihre nahe und ferne
    // Tiefe (NDC-z) in `out[4]`, `out[5]`; false, wenn die Box hinter dem Auge oder neben dem Bild liegt. Eine Box, die die
    // Augen-Ebene kreuzt, zählt mit ihrem Teil VOR dem Auge (an der Ebene w = ε geschnitten — ihre Schnitt-Punkte liegen
    // weit draußen, das Klemmen trägt sie; ihre nahe Tiefe ist −∞): der Strahl durch ein Portal trifft es vor dem Auge, sein
    // Schirm-Punkt ist die Projektion dieses Treffers.
    _hoehlenRect(box, m, out) {
        const E = 1e-4;
        const C = this._hoehlenEcken || (this._hoehlenEcken = new Float64Array(24));
        let x0 = Infinity,
            y0 = Infinity,
            x1 = -Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity,
            vorn = 0;
        const nimm = (cx, cy, w) => {
            const px = cx / w,
                py = cy / w;
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (py < y0) y0 = py;
            if (py > y1) y1 = py;
        };
        for (let c = 0; c < 8; c++) {
            const x = c & 1 ? box.max.x : box.min.x,
                y = c & 2 ? box.max.y : box.min.y,
                z = c & 4 ? box.max.z : box.min.z;
            const cx = m[0] * x + m[4] * y + m[8] * z + m[12],
                cy = m[1] * x + m[5] * y + m[9] * z + m[13],
                cz = m[2] * x + m[6] * y + m[10] * z + m[14],
                w = m[3] * x + m[7] * y + m[11] * z + m[15];
            C[c * 3] = cx;
            C[c * 3 + 1] = cy;
            C[c * 3 + 2] = w;
            if (w > E) {
                vorn++;
                nimm(cx, cy, w);
                const pz = cz / w;
                if (pz < z0) z0 = pz;
                if (pz > z1) z1 = pz;
            }
        }
        if (vorn === 0) return false;
        if (vorn < 8) {
            z0 = -Infinity;
            // die zwölf Kanten (Ecken, die sich in einem Bit unterscheiden), die die Ebene w = ε kreuzen
            for (let a = 0; a < 8; a++)
                for (let bit = 1; bit < 8; bit <<= 1) {
                    if (a & bit) continue;
                    const b = a | bit;
                    const wa = C[a * 3 + 2],
                        wb = C[b * 3 + 2];
                    if (wa > E === wb > E) continue;
                    const t = (E - wa) / (wb - wa);
                    nimm(C[a * 3] + t * (C[b * 3] - C[a * 3]), C[a * 3 + 1] + t * (C[b * 3 + 1] - C[a * 3 + 1]), E);
                }
        }
        if (x0 < -1) x0 = -1;
        if (y0 < -1) y0 = -1;
        if (x1 > 1) x1 = 1;
        if (y1 > 1) y1 = 1;
        if (x0 > x1 || y0 > y1) return false;
        out[0] = x0;
        out[1] = y0;
        out[2] = x1;
        out[3] = y1;
        out[4] = z0;
        out[5] = z1;
        return true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_sicht]);

// ===== ATLAS · Bild/sicht — Außen-Konstanten =====
// DIE HÖHLEN-SICHT (Welle 7, `_hoehlenSicht`): der Saum jeder Mündungs-, Portal-, Rand- und Luft-Box — `schritte` Gitter-
// Schritte (die Fläche zwischen zwei Luft-Punkten liegt bis 1,5 Schritte neben ihnen: Surface-Nets-Vertex in der Zelle,
// Glättung λ 0,5) plus `m` Meter (der Geomorph zieht Rand-Vertices auf den gröberen Nachbarn, wie der Hüllen-Saum `randM`).
AnazhRealm.HOEHLEN_SAUM = Object.freeze({ schritte: 1.5, m: 2 });
// DER HORIZONT der Höhlen-Sicht (`_hoehlenHorizont`): die Raster-Zelle der unteren Boden-Schranke je Chunk (m) — der Schritt
// des LOD-0-Gitters; die Horizont-Probe einer Mündung tastet ihre Bögen in halben Zellen ab.
AnazhRealm.HOEHLEN_HORIZONT_M = 1.8;
// Frische Horizont-Proben je Hauptbild (`_hoehlenSicht`, die nächsten Mündungen zuerst): die Kosten folgen dem bewegten Auge,
// nie der Zahl der Mündungen — eine Mündung ohne frische Probe zeichnet.
AnazhRealm.HOEHLEN_HORIZONT_PROBEN = 8;
// Der Würfel um das geprüfte Auge, in dem eine Horizont-Probe gilt (m, `_hoehlenSperre`): weit unter der Raster-Zelle
// (die 3 × 3 Zellen der Probe tragen die waagerechte Verschiebung), weit über dem Atmen der stehenden Kamera.
AnazhRealm.HOEHLEN_AUGE_M = 0.25;
// DIE KASKADE der Höhlen-Sicht (`_hoehlenSichtLicht`): die Kante einer ortsfesten Licht-Kachel quer zum Licht (m), die je
// Kachel die tiefste Empfänger-Tiefe trägt.
AnazhRealm.HOEHLEN_LICHT_KACHEL_M = 4;

// FERN_RING (unten) — Fern-Kulisse aus dem EINEN Höhen-Gesetz (`_terrainMacroSurfaceY(x,z,false)`),
// 3 Ring-Schalen (3 Draw-Calls fix). `winkel`/`reihen` = Segment-Gitter je Schale (192×16: seit die Luft die
// Ferne nicht mehr verdeckt (V18.530), trägt der Ring den Blick — 96×10 zeigte aus 45 m Fächer-Facetten über
// 150–500 m tiefe Dreiecke); `schalen[i].aussen`
// = Außenradius (Schale 1 ab Voxel-Ring-Kante + `randPad`); `snap` = grobes Welt-Gitter je Schale
// (Vertex-XZ gerundet → Höhen schwimmen beim Re-Zentrieren nie); `saumDrop` = Tauchkante der
// innersten Reihe (im Gebauten zeichnet der Ring nicht: die Masken-Karte, `_fernRingMaske`); `wasserDrop` = Wasser-Klemme;
// `reanchorDist`/`anchorQuant` = Anker-Hysterese/
// -Quantisierung; `scheibe` = Punkte je Auftrag an den Fern-Faden (B2), `scheibenImFlug` = Aufträge zugleich.
// FELD_PASS — polares Höhen+Farb-Feld jenseits der letzten Schale: az×rad Texel bis rMaxM, gemalt
// vom Fern-Faden (Höhe und Fern-Farbe je Texel, B2), gemarcht vom Fullscreen-Fragment (nur Himmel-Pixel).
AnazhRealm.FELD_PASS = Object.freeze({ az: 192, rad: 48, rMaxM: 40000 });
// FELD_PANO — Schattierungs-Persistenz: statt 96 Raymarch-Schritten je Himmel-Pixel je Frame marcht
// EIN Compute ins Polar-Panorama (Farbe + Treffer-DISTANZ; der Nebel bleibt live im Fragment →
// Tag/Nacht braucht keinen Re-Bake), das Fragment schlägt nur nach. Re-Bake nur bei Kamera-Drift;
// Elevation-Zeilen ballen quadratisch am Horizont, über hMax marcht niemand.
AnazhRealm.FELD_PANO = Object.freeze({
    az: 768, // Azimut-Spalten (4× feiner als das 192er-Feld — die Winkel-Auflösung des Blicks)
    elev: 160, // Elevation-Zeilen (quadratisch am Horizont geballt)
    elevMax: 0.35, // rad (~20°) — deckt den Blick vom Gipfel (camY 2800: Horizont-Terrain ≈ −19.3°)
    rebakeDist: 60, // m XZ-Drift bis zum Re-Bake (Parallaxe auf 8 km ≈ 0.4° — unter der Wahrnehmung)
    rebakeHoehe: 12, // m Y-Drift bis zum Re-Bake (Horizont-Verschiebung)
});
// DER SPIEGEL DES GESETZES (D10, `_spiegelFeldTakt` · `_spiegelPass`): das Feld n × n Zellen à texel m um das Auge (Höhen
// RGBA-Halbfloat + Stoff RGBA8, je Gestalt eine von laubFarben Kronen-Farben; neu bei drift m), gebacken im Worker in
// Streifen von höchstens `zeilen` Zeilen; der Pass in 1/teil der Ausgabe, je Wasser-Pixel `schritte` Schritte: über der Höchsten eines Blocks von `block` × `block` Zellen ein Sprung an seinen Rand,
// darunter Lipschitz-Schritte von höchstens `fein` Zellen (mindestens `wachs` der Strecke), dann `halbierungen` vor der
// Sekante; das Laub im Licht seiner Tiefe unter dem Kronen-Dach (Beer-Lambert: e-Länge `laubTiefe` m, das Himmelslicht unter
// dem Dach `laubGrund`), die Krone im Feld um `kronenSaum` m gesäumt (die Zelle zählt, die ihr Laub berührt). Die Nachlese
// backt das Feld neu, wenn neue Kronen darin stehen (höchstens je nachleseMs; die Krone liest das Kronen-Buch, Beipack
// `__krone` des Foundry-Workers). Der Pass zahlt nur bei Änderung: das Auge weiter als `ruheM` m, der Blick weiter als `ruheRad`,
// Licht oder Luft um mehr als `ruheLicht` (`_spiegelPassWach`). ZUERST spiegelt das BILD (A1): der Strahl als Strecke im Schirm
// (bis `bildWeit` m) in `bildSchritte` Schritten gegen die Tiefe des Szenen-Passes, Treffer hinter der Fläche um
// weniger als ihre Dicke (`bildDicke`: Anteil des Abstands + m) über dem Wasser (höher als `bildUfer` m) und nie das Wasser
// selbst (vor der Szene ohne Wasser näher als `bildSchicht`: Anteil des Abstands + m), `bildHalb` Halbierungen,
// am Schirm-Rand (`bildRand`) blendet er in das Feld — das trägt nur den Strahl jenseits des Schirms; die Schritte liegen nach
// q^`bildDichte` (dicht am Wasser-Punkt: das Ufer an der Linie ist wenige Pixel hoch), im Stand rechnet er je `bildRuheMs` neu,
// frühestens nach `bildRuheBilder` Bildern (seltener als jedes 20. Bild: der Lauf im Stand trägt nie das p95).
// DER GLANZ (material.K4): jede Fläche spiegelt durch denselben Pass, deren Glanz (`_glanzKnoten`) über `glanzSchwelle` liegt —
// ganz bis zur Rauheit `glanzRauheit[0]`, nicht mehr ab `glanzRauheit[1]` (darüber trägt die Spitze den Spiegel nicht: Bronze
// 0,25 hat θ50 3,5°, Eisen 0,54 schon 11°: die Optik der Stoff-Zeile, `_defaultMaterials`); dieselbe Kurve wiegt den Spiegel im Stoff
// (`_spiegelUmgebung`).
AnazhRealm.SPIEGEL = Object.freeze({
    glanzRauheit: [0.25, 0.45],
    glanzSchwelle: 0.02,
    bildSchritte: 48,
    bildDichte: 2,
    bildRuheMs: 500,
    bildRuheBilder: 24,
    bildUfer: 0.12,
    bildSchicht: [0.02, 0.05],
    teil: 4,
    bildWeit: 3000,
    bildDicke: [0.04, 0.5],
    bildHalb: 5,
    bildRand: 0.03,
    n: 384,
    texel: 2,
    drift: 60,
    zeilen: 16,
    block: 8,
    schritte: 96,
    wachs: 0.04,
    fein: 0.75,
    halbierungen: 4,
    laubTiefe: 3,
    laubGrund: 0.25,
    laubFarben: 256,
    kronenSaum: 1,
    nachleseMs: 4000,
    ruheM: 0.01,
    ruheRad: 0.0003,
    ruheLicht: 0.001,
});
// DIE WASSER-WELLE (der Hub des Hydro-Stoffs, `_ensureHydroSurfaceMaterial` liest sie): die Dünung der offenen See
// (drei Rausch-Oktaven je ±0,5, Gewichte `duenung`, × aWave ≤ 1) und das Kräuseln von See und Fluss ((Rausch + `oktave` ·
// Rausch − `mitte`) · `kraeusel` · Kräusel-Stärke ≤ `kraeuselDecke` — die Decke des Reglers `setLakeRipple`), die Dünung ×
// die Wind-Zeile des Gesetzes (w0 + w1 · Wind), das Kräuseln × seinen `treiber` (t0 · Strömungs-Anteil + t1 · Wind: der
// stille See kräuselt allein im Wind, A12). Der Hub hebt und senkt die Fläche im Shader um höchstens `_wasserHubM()`
// (4,42 m im Sturm; ohne den Wind rechnete er 2,76 m) — die Zellen-Hülle des Wasser-Satzes trägt ihn (vorher nur der
// Saum 2 m: am Bildrand fehlte ein gehobenes Viertel), das Wasser des Fern-Rings liegt darunter (`_fernRingWasserTiefe`).
// Die Fluss-Phase `phase` (s): eine advektierte Lage des Wasser-Bilds wandert höchstens phase × Strömung weit (4 s × 1,2 m/s
// = 4,8 m, eine halbe Kräusel-Welle), dann kehrt sie hinter der Blende der zweiten Lage zurück. Die Zahlen SIND das
// Wasser-Gesetz des Kerns (foundry-core WASSER_GESETZ.welle), fail-closed — kein Zahlen-Zwilling (K2).
AnazhRealm.WASSER_WELLE = (() => {
    const W = AnazhRealm.Gesetz("terrain:WASSER_GESETZ.welle");
    if (
        !W ||
        !Array.isArray(W.duenung) ||
        W.duenung.length !== 3 ||
        !Array.isArray(W.treiber) ||
        W.treiber.length !== 2 ||
        ![...W.duenung, ...W.treiber, W.oktave, W.mitte, W.kraeusel, W.kraeuselDecke, W.phase].every(Number.isFinite)
    )
        return AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ.welle");
    return W;
})();
