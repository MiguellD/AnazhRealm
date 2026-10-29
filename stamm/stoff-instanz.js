class AnazhRealm_stoff_instanz {
    // ===== ATLAS · Stoff/instanz — Instanz-Senken und ihr Zeichner · Laub-Licht · Baum-Wind · Impostor-Atlas =====
    // DIE NORMALE DES LAUB-STOFFS (K68-N1): eine Krone mit der Normale der Krone lichtet FLIP-FREI — r184 kehrt die Normale
    // back-facender Fragmente eines doppelseitigen Stoffs um (normalView = normalViewGeometry × faceDirection), die Rückseite
    // einer Karte läse das Ellipsoid nach innen (Prüfer K68: 45–51 % der nahen Dreiecke vom Auge weg, die Nadel-Wedel
    // milchig). Die Normale ist die Geometrie-Normale des Renderers selbst (Instanz-, Batch- und Modell-Rotation), ohne die
    // Seite: beide Seiten einer Karte tragen die Krone an ihrer Stelle. EIN Ort für jeden Kronen-Stoff (Studio, Grammatik).
    _laubStoffNormale(T, mat) {
        mat.normalNode = T.normalViewGeometry;
        return mat;
    }

    // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.; K68-N1): ist die GESEHENE Seite des Blatts nach unten gewandt,
    // trägt das Laub die hellere, mattere Unterseite — die Seite ist die Fläche selbst (`normalFlat`, zum Auge gewandt), nie die
    // Licht-Normale: mit der Normale der Krone hieß von unten die ganze Krone Unterseite (Prüfer K68: Nadel-Wedel von unten
    // mint-weiß, Kronen-Luma +15–49 %). Dieselben Zahlen wie das Labor (foundry-core `injectWind`). EIN Ort für jeden Laub-Stoff.
    _laubUnterseite(T, farbe) {
        const BU = globalThis.__phytoCore.BLATT_UNTERSEITE;
        const ny = T.normalFlat.transformDirection(T.cameraViewMatrix).y;
        const grau = T.mix(farbe, T.vec3(farbe.dot(T.vec3(0.2126, 0.7152, 0.0722))), BU.grau).mul(BU.hell);
        return T.mix(farbe, grau, T.float(0.5).sub(ny.mul(BU.steil)).clamp(0.0, 1.0));
    }

    // DER EINE KARTEN-ATLAS (W6): jede Impostor-Karte — Foundry-Art × Gestalt [× ov], gestreut und gesetzt — ist EINE
    // Schicht einer Array-Textur (Albedo, Normale, Sonnen-Sicht), die V Ansichten vertikal gestapelt, wie der Welt-Renderer
    // sie zeichnet (Zeile 0 oben, die Ansicht v in der Zelle v). EIN Material, EIN Einheits-Quad, EINE globale Instanz-Gruppe
    // (`IMPOSTOR_ATLAS_GRUPPE`); Schicht, Rahmen und Sichthöhe reisen je Instanz (aKarte — `_lodSlotStamp`). DIE KARTE BACKT
    // IN DER WELT (S2, `_karteWeltBacken`): der Welt-Renderer zeichnet die L1-Gestalt, die GPU zieht die deckungstreuen Mips
    // nach dem Karten-Gesetz und kodiert sie (`_karteAblage`) — kein Bäcker-Faden, kein zweiter Renderer; die BC-Bytes reisen
    // EINMAL zurück auf die Platte der Schale, der Zweit-Boot legt sie, ohne zu backen (pipeline.K4 Stufe 2). Das FORMAT ist eine Stufe desselben Pfads: mit dem WebGPU-Feature texture-compression-bc BC1-sRGB-
    // Albedo + BC5-Normale auf 1/normalTeiler + rg8-Sonnen-Sicht auf 1/lichtTeiler (CompressedArrayTexture, ~0,27 MiB je
    // Schicht), ohne es (WebGL2, WebGPU ohne BC) zeichnet die Karte direkt in die Schicht eines rgba8-Array-Ziels, die GPU
    // zieht die Mips (2,8 MiB je Schicht; `_impostorAtlasTexturen` meldet es EINMAL laut). Befund V18.528: je Karte zwei
    // CanvasTextures, ein Material, eine Gruppe und ein Programm — 31 MB, ~90 Pipelines.
    _impostorAtlas() {
        if (this._kartenAtlas !== undefined) return this._kartenAtlas;
        this._kartenAtlas = {
            fmt: null, // "bc" | "rgba8" — beim ersten Textur-Bau aus dem Renderer
            cw: 0,
            ch: 0,
            V: 0,
            nt: 0,
            masse: null, // __phytoCore.karteMasse der Schicht
            cap: 0, // Schichten der Texturen
            n: 0, // vergebene Schichten
            map: null,
            nmap: null,
            lmap: null, // die Sonnen-Sicht der Krone (A7-Term): der Anteil des Richtlichts, den die eigene Krone durchlässt
            mapNode: null, // die Basis-Texturknoten: ein Wachsen tauscht nur ihren Wert
            nmapNode: null,
            lmapNode: null,
            zellen: new Map(), // "fimp:<art>|<gestalt>[|ov:…]" → Zelle
            quad: null,
            mat: null,
        };
        return this._kartenAtlas;
    }

    // Das Schicht-Format: "bc" mit WebGPU und dem Feature texture-compression-bc (die GPU kodiert, `_karteAblage`), sonst
    // "rgba8" (die Karte zeichnet direkt in ihre Schicht).
    _impostorAtlasFormat() {
        const r = this.state && this.state.renderer;
        const dev =
            r && !r._isHeadlessNull && r.backend && r.backend.isWebGPUBackend === true ? r.backend.device : null;
        return dev && dev.features && dev.features.has("texture-compression-bc") ? "bc" : "rgba8";
    }

    // Die Texturen des Atlas für mindestens `bedarf` Schichten (in Schritten `KARTEN_ATLAS_SCHRITT`: das Verdoppeln hielt an
    // der Mess-Wiese 32 Schichten für 18 Karten — +4 MB VRAM, als die Solitäre ihre Karte bekamen). Das Wachsen geschieht IN den
    // Texturen: ein neues Bild, needsUpdate — die neue GPU-Form legt der EINE Abschied an (`_texturAbschied`: die alte fällt
    // nach dem Submit, jedes Bündel nimmt neu auf), und die GPU kopiert die gebackenen Schichten in die neue Form
    // (`_karteWachsen`, keine Karte backt neu). Knoten, Programm-Vorlage und jedes Render-Objekt binden so immer DIESELBE
    // Textur (ein Tausch ließ die Textur des Programm-Baus wieder aufsteigen).
    _impostorAtlasTexturen(at, bedarf) {
        if (!at) return null;
        // Das Karten-Gesetz ist KERN-PFLICHT: fehlt es (ein altes phyto-core im Cache), bricht es laut — nie eine Welt,
        // die still für immer ohne Karte zeichnet.
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        if (
            !core ||
            typeof core.karteMasse !== "function" ||
            typeof core.karteGlaetteGaenge !== "function" ||
            !core.KARTEN_GESETZ ||
            !core.KARTEN_GESETZ.lichtTeiler
        )
            return AnazhRealm._kernPflichtBruch("phyto:karteMasse/karteGlaetteGaenge/KARTEN_GESETZ.lichtTeiler");
        const soll = Math.max(bedarf || 0, at.n, 1);
        if (at.map && at.cap >= soll) return at;
        if (!at.masse) {
            // Zell-Maße aus der EINEN Quelle (foundry-core PORTAL_RENDER_CONFIG.impostor, live über das Buch) und das
            // Karten-Gesetz (phyto-core): Zell-Maße, Blickwinkel, Normal- und Licht-Teiler.
            const ic = (AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.impostor) || null;
            if (!ic || !(ic.views > 0 && ic.cellW > 0 && ic.cellH > 0)) return null; // das Buch fehlt noch
            at.V = ic.views;
            at.cw = ic.cellW;
            at.ch = ic.cellH;
            at.nt = core.KARTEN_GESETZ.normalTeiler;
            if (!at.fmt) {
                at.fmt = this._impostorAtlasFormat();
                const r = this.state.renderer;
                if (at.fmt !== "bc" && r && !r._isHeadlessNull)
                    this.log(
                        `KARTE OHNE BC (${r.backend && r.backend.isWebGPUBackend ? "WebGPU ohne texture-compression-bc" : "WebGL2"}): ` +
                            "die Karte zeichnet unkomprimiert in ihr rgba8-Ziel (2,8 MiB je Schicht statt 0,27)",
                        "WARN"
                    );
            }
            at.masse = core.karteMasse(at.cw, at.ch, at.V, at.nt, at.fmt);
        }
        const S = AnazhRealm.KARTEN_ATLAS_SCHRITT;
        let cap = Math.max(8, at.cap || 0);
        while (cap < soll) cap += S;
        const M = at.masse;
        const T = THREE;
        const da = !!at.map;
        if (at.fmt === "bc") {
            const alt = da ? this._karteGpuTexturen(at) : null;
            // Die Schichten füllt NUR die GPU (`_karteAblage`, `_karteWachsen`): kein CPU-Byte, keine Null-Ladung. r184 legt
            // eine Textur mit version 0 als die geteilte 1×1-Vorgabe an (`createDefaultTexture`) — in sie passt keine Ablage,
            // die Schicht blieb leer. Darum steht die Form ab dem Bau (needsUpdate) und lädt nichts (dataReady false; WebGPU
            // nullt jede neue Textur).
            const mips = (stufen) => stufen.map((s) => ({ data: null, width: s.w, height: s.h }));
            if (da) {
                at.map.mipmaps = mips(M.a);
                at.map.image = { width: M.w, height: M.h, depth: cap };
                at.nmap.mipmaps = mips(M.n);
                at.nmap.image = { width: M.nw, height: M.nh, depth: cap };
                at.lmap.image = { data: null, width: M.lw, height: M.lh, depth: cap };
            } else {
                // Die Namen tragen den Erzeuger (die Band-Linse zählt je Name).
                at.map = new T.CompressedArrayTexture(mips(M.a), M.w, M.h, cap, T.RGBA_S3TC_DXT1_Format);
                at.map.name = "karte-albedo:atlas";
                at.map.colorSpace = T.SRGBColorSpace;
                at.nmap = new T.CompressedArrayTexture(mips(M.n), M.nw, M.nh, cap, T.RED_GREEN_RGTC2_Format);
                at.nmap.name = "karte-normal:atlas";
                at.lmap = new T.DataArrayTexture(null, M.lw, M.lh, cap);
                at.lmap.name = "karte-licht:atlas";
                at.lmap.format = T.RGFormat; // die Sonnen-Sicht: r der Zenit, g der 45°-Kranz (F6)
            }
            for (const t of [at.map, at.nmap, at.lmap]) {
                t.generateMipmaps = false;
                t.minFilter = t === at.lmap ? T.LinearFilter : T.LinearMipmapLinearFilter;
                t.magFilter = T.LinearFilter;
                t.wrapS = T.ClampToEdgeWrapping;
                t.wrapT = T.ClampToEdgeWrapping;
                t.anisotropy = t === at.lmap ? 1 : 4;
                t.source.dataReady = false;
                t.needsUpdate = true; // die Form steht; gewachsen: die neue Form, die GPU kopiert die gebackenen Schichten
            }
            at.cap = cap;
            if (alt) this._karteWachsen(at, alt);
            return at;
        }
        // rgba8: das Array-Ziel IST die Schicht (Albedo sRGB, Normale vormultipliziert mit der Deckung in z, Sonnen-Sicht),
        // die GPU zieht die Mips nach der letzten Ansicht; Wachsen legt das Ziel neu an, die Schichten backen nach.
        if (da) {
            at.rt.setSize(M.w, M.h, cap);
            at.rtBereit = false;
            const q = this._impostorBakeQueue || (this._impostorBakeQueue = []);
            for (const z of at.zellen.values())
                if (z.gebacken) {
                    z._weltNeu = true;
                    q.push(z.key);
                }
        } else {
            at.rt = new T.RenderTarget(M.w, M.h, {
                depth: cap,
                count: 3,
                depthBuffer: true,
                generateMipmaps: true,
                minFilter: T.LinearMipmapLinearFilter,
                magFilter: T.LinearFilter,
            });
            [at.map, at.nmap, at.lmap] = at.rt.textures;
            at.map.name = "karte-albedo:atlas";
            at.map.colorSpace = T.SRGBColorSpace;
            at.nmap.name = "karte-normal:atlas";
            at.lmap.name = "karte-licht:atlas";
            for (const t of at.rt.textures) {
                t.wrapS = T.ClampToEdgeWrapping;
                t.wrapT = T.ClampToEdgeWrapping;
                t.anisotropy = 4;
            }
        }
        at.cap = cap;
        return at;
    }

    // Die GPU-Texturen der Schichten (Albedo, Normale, Sonnen-Sicht) — null, solange r184 sie nicht angelegt hat.
    _karteGpuTexturen(at) {
        const be = this.state.renderer && this.state.renderer.backend;
        const g = (t) => (t && be && be.get(t) ? be.get(t).texture || null : null);
        const out = [g(at.map), g(at.nmap), g(at.lmap)];
        return out.every(Boolean) ? out : null;
    }

    // DAS WACHSEN AUF DER GPU: r184 legt die gewachsene Form an (`_texturAbschied` hält die alte bis nach dem Submit dieser
    // Aufgabe), die GPU kopiert jede Stufe der alten Schichten hinein — eine gebackene Karte backt nie neu, und kein Bild
    // fehlt ihr zwischen zwei Takten.
    _karteWachsen(at, alt) {
        const rend = this.state.renderer;
        const tex = [at.map, at.nmap, at.lmap];
        for (const t of tex) rend._textures.updateTexture(t);
        const neu = this._karteGpuTexturen(at);
        if (!neu) throw this._stoffBruch("die Karte: der gewachsene Atlas hat keine GPU-Form");
        const dev = rend.backend.device;
        const enc = dev.createCommandEncoder({ label: "karte-wachsen" });
        for (let i = 0; i < 3; i++) {
            const schichten = Math.min(alt[i].depthOrArrayLayers, neu[i].depthOrArrayLayers);
            for (let k = 0; k < Math.min(alt[i].mipLevelCount, neu[i].mipLevelCount); k++)
                enc.copyTextureToTexture(
                    { texture: alt[i], mipLevel: k },
                    { texture: neu[i], mipLevel: k },
                    {
                        width: Math.max(1, alt[i].width >> k),
                        height: Math.max(1, alt[i].height >> k),
                        depthOrArrayLayers: schichten,
                    }
                );
        }
        dev.queue.submit([enc.finish()]);
    }

    // Eine neue Zelle (Schicht) im Atlas; mit echtem Renderer reiht sie ihren Bake sofort ein (nah zuerst über
    // `_bedarfD2`). Rahmen und Pixel liefert der Bake; der Null-Renderer bäckt nie (der Aufrufer setzt den Rahmen).
    _impostorZelleNeu(at, key, preset, variant, ov) {
        const z = {
            key,
            idx: at.n++,
            preset,
            variant,
            ov: ov || null,
            frame: null,
            gebacken: false,
            gescheitert: false,
            _bedarfD2: Infinity,
            _flat: null,
            ende: null, // die Zusage der Karte: true gebacken, false gescheitert (`_karteEndet`)
            _endeLoes: null,
        };
        z.ende = new Promise((r) => (z._endeLoes = r));
        at.zellen.set(key, z);
        this._karteNadel(null, z);
        if (at.map && z.idx >= at.cap) this._impostorAtlasTexturen(at, z.idx + 1);
        const rend = this.state && this.state.renderer;
        if (rend && !rend._isHeadlessNull) {
            if (!this._impostorBakeQueue) this._impostorBakeQueue = [];
            this._impostorBakeQueue.push(key);
        }
        return z;
    }
    // DAS ENDE EINER KARTE (K38-N2): gebacken (`ok`) oder gescheitert — die EINE Stelle, die den Zustand der Zelle setzt
    // und ihre Zusage `z.ende` löst. Wer auf die Karte wartet (die L2-Vorschau der Werkstatt), hängt sich per
    // `_foundryWecker` an; bis K38-N2 hörte niemand den Bake, und die Vorschau blieb „pending", bis der Spieler neu wählte.
    _karteEndet(z, ok) {
        if (ok) z.gebacken = true;
        else z.gescheitert = true;
        if (z._endeLoes) z._endeLoes(!!ok);
    }

    // Das EINE Einheits-Quad der Karten (6 Verts auf der Stammachse, y ∈ {0,1}) mit DREI Vertex-Attributen: position,
    // normal (PROBE (1,0,0): der InstanceNode macht daraus (cos r, 0, −sin r)/s → Rotation + Skala), uv (u = Ecke:
    // ±1 = 2u−1, v = Höhe: Wind-Gewicht v²). Je Instanz EIN vec4 `aKarte` = (Schicht, Halbbreite, Höhe — template-
    // lokal —, ±Sichthöhe), die Fassade ersetzt den Platzhalter je Slot; dazu instanceColor (Tint). Befund Echt-GPU 04.10.:
    // mit color/aImpX/aFlex/aPhase/aOccl/aZelle/aRahmen trug die Pipeline 10 Vertex-Puffer (WebGPU-Grenze 8) — das
    // @global-Bundle wurde ungültig, keine Karte zeichnete.
    _impostorQuad(at) {
        if (at.quad) return at.quad;
        const VC = 6;
        const ecken = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
        ];
        const tri = [0, 1, 2, 0, 2, 3];
        const pos = new Float32Array(VC * 3),
            nor = new Float32Array(VC * 3),
            uv = new Float32Array(VC * 2),
            karte = new Float32Array(VC * 4);
        for (let ti = 0; ti < VC; ti++) {
            const c = ecken[tri[ti]];
            pos[ti * 3 + 1] = c[1];
            nor[ti * 3] = 1;
            uv[ti * 2] = c[0];
            uv[ti * 2 + 1] = c[1];
            karte[ti * 4 + 1] = 1; // Platzhalter: Schicht 0, Rahmen 1 × 1, ohne Sichthöhe
            karte[ti * 4 + 2] = 1;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        g.setAttribute("aKarte", new THREE.BufferAttribute(karte, 4));
        g.computeBoundingBox();
        g.computeBoundingSphere();
        at.quad = g;
        return g;
    }

    // Das EINE Karten-Material (der Atlas-Zweig in `_buildPbrNodeMaterial`). Scheitert seine Verdrahtung, bricht der Bau
    // laut beim Namen (`_stoffBruch` „die Karten-Verdrahtung", K22), fehlt der Karten-Codec, bricht `_impostorAtlasTexturen`
    // (KERN-PFLICHT) — kein Zweig gibt still null, und keine Karte zeichnet unsichtbar.
    _impostorAtlasMaterial() {
        const at = this._impostorAtlas();
        if (!at || !this._impostorAtlasTexturen(at)) return null;
        if (at.mat) return at.mat;
        // DIE ZAHLEN DER GESTALT (F6, Lehre 19: die Karte ist dieselbe Krone in einer anderen Stufe): ihr Stoff trägt die Regler
        // des Gesetzbuchs, aus dem ihre Gestalt baut (phyto-core `budgetRegler("foliageTex")`: Rauheit 0,62, Metall 0) — nie
        // die Wirts-Herleitung aus den Substanz-Tags des Laubs (Rauheit 0,9, dazu die Mikro-Kavität des Antwort-Profils, ein
        // Faktor 0,905 auf jedem Licht, den keine Gestalt trägt). Bis F6 stand die Karte der Fichte darum mittags bei 0,82,
        // nachts bei 0,54 ihrer Gestalt (Radeon, Mess-Wiese, `werkbank licht --laub --karte --uhr`).
        const R = globalThis.__phytoCore.budgetRegler("foliageTex");
        const matOpts = {
            vertexColors: true,
            useInstanceTint: true, // konstante Kronenfarbe je Baum über die LODs
            pflanzenStoff: true, // Vertex-Albedo im colorNode, echte Normale, keine Geologie; Wind: `windAusschlag` über uv.y
            impostorAtlas: true,
            side: THREE.DoubleSide,
            roughness: R.r,
            metalness: R.mt,
        };
        const mat = this._sharedFoliageMaterial(matOpts);
        at.mat = mat;
        return mat;
    }

    // Das Karten-Leaf einer Zelle: Einheits-Quad + Atlas-Material, Schicht, Rahmen (Halbbreite, Höhe — template-lokal)
    // und Sichthöhe (`sicht`: die Höhe der Höhen-Stufe, × Instanz-Skala gestempelt — dieselbe Zahl wie der aH0-Stempel
    // der L1) reisen als Instanz-Werte über `_lodSlotStamp`, die Gruppe ist die EINE Atlas-Gruppe. Ohne Sichthöhe keine
    // Karte: ihre Maske hätte kein wahres Stufen-Urteil.
    _impostorLeaf(z, localMatrix, sicht) {
        const at = this._impostorAtlas();
        if (!at || !z || !z.frame || !(sicht > 0)) return null;
        const mat = this._impostorAtlasMaterial();
        if (!mat) return null;
        return {
            geom: this._impostorQuad(at),
            mat,
            localMatrix,
            leafKey: "fimp:atlas",
            atlasGruppe: AnazhRealm.IMPOSTOR_ATLAS_GRUPPE,
            zelle: z.idx,
            rahmen: [z.frame.halfW, z.frame.halfH * 2],
            sicht,
            castShadow: false,
        };
    }

    // KARTEN-ZENSUS: Zellen · gebacken · gescheitert · wartend · Atlas-Bytes · Haupt-Faden-ms je Bake. Reist im
    // Flugschreiber-Trace (anazhRealmPerf.json) und in der Fluss-Linse; devtools: anazhRealm._impostorCensus().
    _impostorCensus() {
        const at = this._kartenAtlas;
        if (!at || at.zellen.size === 0) return null;
        let gebacken = 0,
            gescheitert = 0,
            wartend = 0;
        const gescheitertArten = [];
        for (const z of at.zellen.values()) {
            if (z.gebacken) gebacken++;
            else if (z.gescheitert) {
                gescheitert++;
                if (gescheitertArten.length < 8) gescheitertArten.push(z.key);
            } else wartend++;
        }
        const M = at.masse;
        return {
            zellen: at.zellen.size,
            gebacken,
            gescheitert,
            wartend,
            fmt: at.fmt,
            schichten: at.cap,
            // bc: die Stufen der drei Schichten · rgba8: drei rgba8-Ziele voller Größe mit Mips (4/3)
            mb: !M
                ? 0
                : at.fmt === "bc"
                  ? +(((M.aBytes + M.nBytes + M.lBytes) * at.cap) / 1048576).toFixed(2)
                  : +((M.w * M.h * 4 * 3 * (4 / 3) * at.cap) / 1048576).toFixed(2),
            weltMs: at.weltMs ? at.weltMs.slice() : null,
            gescheitertArten,
        };
    }

    // Der EINE Bake-/Quad-Rahmen: Bake-Kamera UND Billboard-Geometrie lesen DIESELBE Formel → die Textur
    // sitzt unverzerrt. halfH = volle Baumhöhe (+2 %), halfW ≥ Zell-Proportion (cw/ch = 0.5) bzw. die
    // radiale Kronen-Spanne (+4 %).
    _impostorFrame(skeleton) {
        const totalH = Math.max(1, AnazhRealm._skelettPflicht(skeleton).totalH);
        let maxR = 0;
        if (skeleton && Array.isArray(skeleton.anchors)) {
            for (const a of skeleton.anchors) {
                const rr = Math.sqrt(a.x * a.x + a.z * a.z);
                if (rr > maxR) maxR = rr;
            }
        }
        // Die FORMEL lebt EINMAL in phyto-core (__phytoCore.impostorFrame); hier nur das Skelett-Lesen. Ohne Kern → null
        // (kein Impostor), BEWUSST keine Formel-Kopie (Drift-Quelle; gate:constitution wacht).
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.impostorFrame === "function") return core.impostorFrame(totalH, maxR);
        return null;
    }

    // DER KARTEN-TAKT (S2): die Karten der Schlange backen im Welt-Renderer (`_tickKarteWelt`); ist sie leer, ruht die
    // Bühne (`_karteBuehneRuhe`). Headless/Null-Renderer/vor rendererReady → No-op (dort bäckt nie jemand).
    _tickImpostorBake() {
        if (!this._impostorBakeQueue || this._impostorBakeQueue.length === 0) return this._karteBuehneRuhe();
        const at = this._impostorAtlas();
        return at ? this._tickKarteWelt(at) : 0;
    }

    // DIE KARTE BACKT IN DER WELT (S2 — Labor = Welt per Konstruktion): kein Bäcker-Faden, kein zweiter Renderer; was sie
    // backte, trägt die Platte der Schale (`_karteWeltBacken`, pipeline.K4 Stufe 2). Der Welt-Renderer (r184) zeichnet die L1-Gestalt, die die Welt ohnehin trägt — dieselben
    // Geometrien, dieselben Stoffe — in V Ansichten (die Gestalt gegengedreht, gleiche Zellen, gleicher Rahmen
    // `impostorFrame`); über MRT schreibt der Stoff seine Albedo (`diffuseColor`: vor jedem Licht, ohne Tonkurve), seine
    // Normale (Sicht-Raum der Bake-Kamera) und die Sonnen-Sicht seiner Krone. Je Takt EIN Budget-Fenster (`KARTE_WELT_MS`),
    // die nächste Karte zuerst; eine Zelle, deren L1 noch reist oder deren Programme noch kompilieren, wartet — die anderen
    // backen weiter.
    _tickKarteWelt(at) {
        const st = this.state;
        const rend = st.renderer;
        const q = this._impostorBakeQueue;
        if (!rend || rend._isHeadlessNull || !st.rendererReady || !q || !q.length) return 0;
        if (!this._foundryEnabled()) {
            // ohne Foundry-Welt keine Gestalt: die Zellen fallen TERMINAL (Zensus „gescheitert")
            for (const k of q.splice(0)) {
                const z = at.zellen.get(k);
                if (z && !z.gebacken) this._karteEndet(z, false);
            }
            return 0;
        }
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !this._impostorAtlasTexturen(at)) return 0;
        // Die Karte ist GPU-Arbeit wie das Bild: sie geht an der EINEN Leine (`_gpuLeineStraff`), ihr Takt bindet sich an
        // (`_gpuLeineBinden`) — auf einer langsamen GPU wartet so das nächste Bild auf sie, statt hinter ihr zu verhungern.
        if (this._gpuLeineStraff()) return 0;
        const d2 = (k) => {
            const z = at.zellen.get(k);
            return z && Number.isFinite(z._bedarfD2) ? z._bedarfD2 : 1e30;
        };
        q.sort((a, b) => d2(a) - d2(b));
        const t0 = performance.now();
        let n = 0;
        const gezeichnet = () => (this._karteBuehneSatz && this._karteBuehneSatz.versuchN) || 0; // je Bühnen-Zeichnung +1
        const v0 = gezeichnet();
        for (let i = 0; i < q.length;) {
            const z = at.zellen.get(q[i]);
            if (!z || z.gescheitert || (z.gebacken && !z._weltNeu)) {
                q.splice(i, 1);
                continue;
            }
            if (this._karteWeltBacken(at, z) === null) {
                i++; // die L1 reist oder ein Bürger der Bühne wartet auf seine Pipeline
                if (performance.now() - t0 > AnazhRealm.KARTE_WELT_MS) break;
                continue;
            }
            q.splice(i, 1);
            n++;
            if (performance.now() - t0 > AnazhRealm.KARTE_WELT_MS) break;
        }
        if (gezeichnet() !== v0) this._gpuLeineBinden();
        return n;
    }

    // Die Bühne ruht: ist die Schlange leer, geben ihre Ziele und Rechen-Puffer (~8 MB VRAM) nach KARTE_BUEHNE_RUHE_MS ihren
    // Speicher frei — die nächste Karte legt ihn neu an; Szene, MRT-Knoten und Programme bleiben (sie hängen an den
    // Formaten, nie am Speicher).
    _karteBuehneRuhe() {
        const B = this._karteBuehneSatz;
        if (!B || !B.bereit || performance.now() - B.zuletzt < AnazhRealm.KARTE_BUEHNE_RUHE_MS) return 0;
        for (const rt of [B.ziel, B.schatten, B.leer])
            if (rt && rt !== (this._kartenAtlas && this._kartenAtlas.rt)) rt.dispose();
        if (B.rechen) for (const b of B.rechen.puffer) b.destroy();
        B.rechen = null;
        B.bereit = false;
        return 0;
    }

    // Die Bühne der Welt-Karte: EINE Szene, EINE Wurzel, EIN Satz Hüllen (Mesh je Teil, wiederverwendet), die Ortho-Kamera
    // der Ansichten und die der Sonne, die Ziele und der MRT-Knoten. Mit BC zeichnet die Karte in die Bühne (eine Schicht
    // voller Größe, die GPU legt sie ab); ohne BC ist das Array-Ziel des Atlas selbst ihr Ziel. Die Sonnen-Kacheln tragen
    // dieselben Formate und Namen — dieselben Programme.
    _karteBuehne(at) {
        // je Renderer EINE Bühne (ihre Ziele und Knoten gehören ihm)
        const rend = this.state.renderer;
        if (this._karteBuehneSatz && this._karteBuehneSatz.rend === rend) return this._karteBuehneSatz;
        const T = THREE;
        const S = T.TSL;
        const SZ = AnazhRealm.KARTE_SONNEN_SICHT;
        const K = SZ.karte;
        const bc = at.fmt === "bc";
        const ziel = (w, h, n) => {
            const rt = new T.RenderTarget(w, h, {
                count: n,
                depthBuffer: true,
                generateMipmaps: false,
                minFilter: T.NearestFilter,
                magFilter: T.NearestFilter,
            });
            rt.depthTexture = new T.DepthTexture(w, h);
            rt.depthTexture.type = T.FloatType;
            return rt;
        };
        const B = {
            szene: new T.Scene(),
            wurzel: new T.Group(),
            kamera: new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 500),
            licht: new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 500),
            huellen: [],
            box: new T.Box3(),
            mitte: new T.Vector3(),
            farbe: new T.Color(),
            bereit: false,
            zuletzt: 0,
            rechen: null,
            versuch: "", // die Kennung des Bake-Versuchs: die Bau-Frist der Erst-Zeichnung gilt ihm ganz
            versuchN: 0,
            rend,
        };
        B.szene.add(B.wurzel);
        B.ziel = bc ? ziel(at.masse.w, at.masse.h, 3) : at.rt;
        if (bc)
            ["karte-albedo:buehne", "karte-normal:buehne", "karte-licht:buehne"].forEach(
                (n, i) => (B.ziel.textures[i].name = n)
            );
        const namen = B.ziel.textures.map((t) => t.name);
        B.schatten = ziel(K * SZ.richtungen.length, K, 3);
        B.schatten.textures.forEach((t, i) => (t.name = namen[i]));
        for (const rt of [B.ziel, B.schatten]) rt.textures[0].colorSpace = T.SRGBColorSpace;
        // die Lese-Tiefe der Sonnen-Kacheln, solange sie selbst Ziel sind (eine Textur ist nie Ziel und Bindung zugleich)
        B.leer = ziel(4, 4, 1);
        // DIE SONNEN-SICHT DER KRONE (A7-Term, `KARTE_SONNEN_SICHT`): die Krone wirft in der Welt ihren Schatten auf sich
        // selbst, die Karte wirft nie. Je Texel der Anteil des Richtlichts aus dem oberen Halbraum, den die eigene Krone
        // durchlässt — N·L-gewichtet über die Richtungen, im Baum-Raum (sie drehen mit jeder Ansicht), aus den Tiefen-
        // Kacheln derselben Krone (3×3 Abgriffe). Der Kartenstoff legt sie auf den EMPFANGENEN Schatten (`receivedShadowNode`),
        // nie auf die Albedo: der Himmel bleibt frei wie an der Gestalt.
        // DIE HÖHE DES LICHTS (F6): die Sicht reist ZWEIFACH — die des Zenits (die erste Richtung) und das N·L-Mittel des
        // 45°-Kranzes —, und der Kartenstoff liest sie nach der Höhe des aktiven Körpers (`uSunDir`, Sonne oder Mond). Das eine
        // Mittel über alle Richtungen ließ die Mittagssonne durch die hohe Fichte wie durch ihre Flanke: ihr Sonnen-Licht stand
        // 1,42 × über dem ihrer Gestalt (Radeon, Mess-Wiese, Mittag), die Sicht des Zenits allein 0,75 ×.
        if (SZ.richtungen[0][0] !== 90 || SZ.richtungen.slice(1).some(([h]) => h !== 45))
            throw this._stoffBruch("die Karte: KARTE_SONNEN_SICHT trägt den Zenit zuerst, dann den 45°-Kranz");
        B.uBaum = S.uniform(new T.Matrix4());
        B.uVP = SZ.richtungen.map(() => S.uniform(new T.Matrix4()));
        B.dirs = SZ.richtungen.map(([h, a]) => {
            const eh = (h * Math.PI) / 180,
                ea = (a * Math.PI) / 180;
            return new T.Vector3(Math.cos(eh) * Math.cos(ea), Math.sin(eh), Math.cos(eh) * Math.sin(ea));
        });
        B.tiefe = S.texture(B.leer.depthTexture);
        const gpuKoord = this.state.renderer.coordinateSystem === T.WebGPUCoordinateSystem;
        const sicht = S.Fn(() => {
            const nB = S.normalize(B.uBaum.mul(S.vec4(S.normalWorld, 0.0)).xyz).toVar();
            const pB = B.uBaum.mul(S.vec4(S.positionWorld, 1.0)).xyz.add(nB.mul(SZ.normalBias)).toVar();
            const zenit = S.float(1.0).toVar();
            const summe = S.float(0.0).toVar();
            const gew = S.float(0.0).toVar();
            const roh = S.float(0.0).toVar();
            B.dirs.forEach((d, j) => {
                const nl = S.max(S.dot(nB, S.vec3(d.x, d.y, d.z)), 0.0);
                const q = B.uVP[j].mul(S.vec4(pB, 1.0));
                const u = q.x.mul(0.5).add(0.5);
                const v = gpuKoord ? S.float(0.5).sub(q.y.mul(0.5)) : q.y.mul(0.5).add(0.5);
                const ref = (gpuKoord ? q.z : q.z.mul(0.5).add(0.5)).add(SZ.bias);
                const px = S.ivec2(
                    S.clamp(u.mul(K).floor(), 1.0, K - 2).add(j * K),
                    S.clamp(v.mul(K).floor(), 1.0, K - 2)
                );
                let vis = S.float(0.0);
                for (let dy = -1; dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++) vis = vis.add(S.step(ref, B.tiefe.load(px.add(S.ivec2(dx, dy)))));
                if (j === 0) zenit.assign(vis.div(9.0));
                else {
                    summe.addAssign(vis.div(9.0).mul(nl));
                    gew.addAssign(nl);
                    roh.addAssign(vis.div(9.0));
                }
            });
            return S.vec2(zenit, S.select(gew.greaterThan(1e-4), summe.div(gew), roh.div(B.dirs.length - 1)));
        })();
        // DIE GANZE NORMALE (F6): die Krone lichtet flip-frei (`_laubStoffNormale`) — durch ihre Lücken zeigt sie Nadeln der
        // Rückseite, deren Normale vom Auge weg steht. Zwei Kanäle tragen die Kugel oktaedrisch (`oktZu`, gelesen in `oktAuf` und
        // im Kartenstoff); bis F6 trugen sie nur xy, die Karte drehte jede Normale zum Bäcker, und das Licht der Rückseite fehlte
        // ihr (Fichte nachts im Himmels-Licht 0,755 ihrer Gestalt, die Gestalt mit zum Auge gedrehten Normalen 0,88).
        const nV = S.normalView;
        const nO = nV.xy.div(nV.x.abs().add(nV.y.abs()).add(nV.z.abs()).max(1e-6));
        const nS = S.vec2(
            S.select(nO.x.greaterThanEqual(0.0), 1.0, -1.0),
            S.select(nO.y.greaterThanEqual(0.0), 1.0, -1.0)
        );
        const nOkt = S.select(nV.z.lessThan(0.0), S.vec2(1.0).sub(nO.yx.abs()).mul(nS), nO);
        // r184 leert jedes Ziel außer dem ersten auf (0, 0, 0, 1): die Deckung reist in z (Normale) bzw. g (Sonnen-Sicht)
        B.mrt = S.mrt({
            [namen[0]]: S.vec4(S.diffuseColor.rgb, 1.0),
            [namen[1]]: S.vec4(nOkt.mul(0.5).add(0.5), 1.0, 1.0),
            [namen[2]]: S.vec4(sicht.x, 1.0, sicht.y, 1.0),
        });
        this._karteBuehneSatz = B;
        return B;
    }

    // Eine Karte im Welt-Renderer backen: null = die Platte antwortet noch, die L1 reist (bestellt) oder ihre Programme
    // kompilieren, false = gescheitert, true = gebacken (oder von der Platte gelegt).
    // DIE PLATTE ZUERST (pipeline.K4 Stufe 2): die BC-Karte einer Art liegt unter dem Gesetz-SHA ihrer Kerne und dem Stempel
    // des Wirts auf der Platte der Schale (`_foundrySchale`, Frage `karte`): ein Treffer legt ihre Bytes in die Schicht — ohne
    // L1, Bühne und Programme; ein Miss backt, und die Ablage reicht dieselben Bytes zurück in den Faden (`_karteAblage`).
    // `z._platte`: undefined = ungefragt, false = die Frage reist, null = backen, sonst der Treffer.
    _karteWeltBacken(at, z) {
        const rend = this.state.renderer;
        const bc = at.fmt === "bc";
        if (bc && z._platte !== null) {
            if (z._platte === undefined) {
                z._platte = false;
                const frage = { type: "karte", presetId: z.preset, platte: "fimp|bc|" + z.key };
                const wort = `FOUNDRY TIMEOUT: karte(${z.key}) nach 45 s Arbeit ohne Reply → sie backt`;
                this._foundryAuftrag(this._foundry, "krt", frage, z._bedarfD2, 45000, wort).then((m) => {
                    z._platte = (m && m.karte) || null;
                    z._liefer = m && m.liefer;
                });
            }
            if (z._platte === false) return null;
            const k = z._platte;
            const lage = at.lage || (at.lage = this._karteRechenPlan(at, true));
            if (!this._karteGpuTexturen(at)) for (const t of [at.map, at.nmap, at.lmap]) rend.initTexture(t);
            const ziele = this._karteGpuTexturen(at);
            z._platte = null;
            const t0 = performance.now();
            if (ziele && k.bytes && k.bytes.byteLength === lage.ausB) {
                for (const q of lage.kopien)
                    rend.backend.device.queue.writeTexture(
                        { texture: ziele[q.tex], mipLevel: q.mip, origin: { x: 0, y: 0, z: z.idx } },
                        k.bytes,
                        { offset: q.off, bytesPerRow: q.zeileB, rowsPerImage: q.zeilen },
                        { width: q.w, height: q.h, depthOrArrayLayers: 1 }
                    );
                this._foundryLiefer(this._foundry, "platte", "karte", z._liefer, performance.now() - t0);
                z._weltNeu = false;
                if (!z.gebacken) this._karteGebacken(z, k.frame);
                return true;
            }
        }
        if (bc && !this._karteRechner()) return null; // die Programme der GPU-Ablage kompilieren noch
        const lod = this._foundryServierStufe(z.preset, 1);
        const key = this._foundryKoerperKey(z.preset, z.variant, lod, z.ov);
        const g = this._foundryCacheGet(key);
        if (g === undefined) {
            const wo = Number.isFinite(z._bedarfD2) ? z._bedarfD2 : undefined;
            this._foundryZug(key, z.preset, z.variant, lod, z.ov || undefined, wo, null);
            return null;
        }
        if (!g || !g.children || !g.children.length) {
            this._karteEndet(z, false);
            this._stoffBruch(`die Karte ${z.key}: keine L1-Gestalt ${key} — die Fernstufe bleibt leer`);
            return false;
        }
        const T = THREE;
        const core = globalThis.__phytoCore;
        const SZ = AnazhRealm.KARTE_SONNEN_SICHT;
        const B = this._karteBuehne(at);
        const t0 = performance.now();
        // die Gestalt auf die Bühne: dieselben Geometrien und Stoffe, die die Welt zeichnet
        B.wurzel.clear();
        B.wurzel.rotation.set(0, 0, 0);
        let rad2 = 0;
        let h = 0;
        for (const c of g.children) {
            if (!c.isMesh || c.isInstancedMesh || !c.geometry || !c.material) continue;
            // der Wurf-Teil (S3 `teil: "schatten"`) lebt nur in den Kaskaden — das Auge sieht ihn nie
            if (c.userData && typeof c.userData.__teil === "string") continue;
            const m = B.huellen[h] || (B.huellen[h] = new T.Mesh());
            h++;
            m.geometry = c.geometry;
            m.material = c.material;
            m.matrixAutoUpdate = false;
            m.matrix.copy(c.matrix);
            m.frustumCulled = false;
            B.wurzel.add(m);
            rad2 = core.scanRadialXZ(c.geometry.attributes.position.array, rad2);
        }
        B.wurzel.updateMatrixWorld(true);
        const vor = {
            rt: rend.getRenderTarget(),
            face: rend.getActiveCubeFace(),
            mip: rend.getActiveMipmapLevel(),
            mrt: rend.getMRT(),
            ac: rend.autoClear,
            farbe: rend.getClearColor(B.farbe),
            alpha: rend.getClearAlpha(),
        };
        const box = B.box.setFromObject(B.wurzel);
        const fr = core.impostorFrame(box.max.y, Math.sqrt(rad2));
        const cam = B.kamera;
        cam.left = -fr.halfW;
        cam.right = fr.halfW;
        cam.top = fr.halfH;
        cam.bottom = -fr.halfH;
        cam.position.set(0, fr.halfH, Math.max(fr.halfW * 2.5, box.max.y) + 40);
        cam.lookAt(0, fr.halfH, 0);
        cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
        // Die Bühne hält still, was keine Gestalt ist: Wind, die zeitliche Laub-Kante, die Durchsicht (die Stufen-Maske hält
        // `_buehneRender`) — danach zurück auf den Welt-Stand.
        const lu = this.state.lodUniforms;
        const wu = this.state.windUniforms;
        const halt = [];
        const still = (u, setze) => {
            if (!u) return;
            halt.push([u, u.value && u.value.clone ? u.value.clone() : u.value]);
            setze(u.value, u);
        };
        still(wu && wu.uWindStrength, (w, u) => (u.value = 0));
        still(lu && lu.uLaubKante, (w) => (w.y = 0));
        still(lu && lu.uKamNah, (w) => w.setScalar(-AnazhRealm.KAMERA_DURCHSICHT.saumM));
        still(lu && lu.uKamZiel, (w) => w.set(lu.uKamAuge.value.x, lu.uKamAuge.value.y, lu.uKamAuge.value.z, 0));
        if (!B.bereit) {
            for (const rt of bc ? [B.ziel, B.schatten, B.leer] : [B.schatten, B.leer]) rend.initRenderTarget(rt);
            B.bereit = true;
        }
        if (!bc && !at.rtBereit) {
            rend.initRenderTarget(at.rt); // die Mip-Kette steht vor dem ersten Bake
            at.rtBereit = true;
        }
        const K = SZ.karte;
        const V = at.V;
        const dreh = (Math.PI * 2) / V;
        // DIE PROGRAMME ENTSTEHEN IN DER ERST-ZEICHNUNG (`_configureRenderer`, der EINE Ort der Klasse): die Bühne zeichnet
        // wie die Welt — ein Bürger, dessen Knoten die Bau-Frist verschob oder dessen Pipeline noch im Bau steht, zeichnet
        // nicht. Dann ist die Karte nicht ganz: sie wird nicht abgelegt und backt im nächsten Takt neu (null) — der
        // Haupt-Faden kompiliert nie synchron, keine Karte steht halb.
        const E = this._erstZeichnungStand();
        const offen = E.wartetN + E.verschoben;
        B.versuch = "karte|" + ++B.versuchN;
        let ganz = false;
        try {
            rend.setMRT(B.mrt);
            rend.setClearColor(0x000000, 0);
            // die Sonnen-Kacheln: die Krone aus jeder Richtung (Baum-Raum, Drehung 0), ihre Tiefe liest danach die Sicht
            B.tiefe.value = B.leer.depthTexture;
            const R = Math.max(fr.halfW, fr.halfH) * 1.15;
            B.mitte.set(0, fr.halfH, 0);
            const L = B.licht;
            Object.assign(L, { left: -R, right: R, top: R, bottom: -R, near: 0.1, far: R * 6 });
            L.coordinateSystem = rend.coordinateSystem;
            for (let j = 0; j < B.dirs.length; j++) {
                const d = B.dirs[j];
                L.position.copy(B.mitte).addScaledVector(d, R * 3);
                if (Math.abs(d.y) > 0.99) L.up.set(1, 0, 0);
                else L.up.set(0, 1, 0);
                L.lookAt(B.mitte);
                L.updateMatrixWorld(true);
                L.updateProjectionMatrix();
                B.uVP[j].value.multiplyMatrices(L.projectionMatrix, L.matrixWorldInverse);
                B.schatten.viewport.set(j * K, 0, K, K);
                rend.autoClear = j === 0;
                rend.setRenderTarget(B.schatten);
                this._buehneRender(rend, B.szene, L, "Karten-Sonne");
            }
            B.tiefe.value = B.schatten.depthTexture;
            for (let v = 0; v < V; v++) {
                // Ansicht v = die Gestalt aus Peilung v·360/V gesehen (Kamera fest, Gestalt gegengedreht); WebGPU zeichnet
                // von oben — der Stoff liest gespiegelt
                B.wurzel.rotation.y = -v * dreh;
                B.wurzel.updateMatrixWorld(true);
                B.uBaum.value.makeRotationY(v * dreh); // Welt → Baum
                rend.autoClear = v === 0; // die erste Ansicht leert die Schicht (Farbe 0 = leer, Tiefe)
                if (bc) {
                    B.ziel.viewport.set(0, v * at.ch, at.cw, at.ch);
                    rend.setRenderTarget(B.ziel);
                } else {
                    at.rt.viewport.set(0, v * at.ch, at.cw, at.ch);
                    for (const t of at.rt.textures) t.generateMipmaps = v === V - 1; // die Mips nach der letzten Ansicht
                    rend.setRenderTarget(at.rt, z.idx);
                }
                this._buehneRender(rend, B.szene, cam, "Karten-Bühne");
            }
            ganz = E.wartetN + E.verschoben === offen;
        } finally {
            if (!bc) for (const t of at.rt.textures) t.generateMipmaps = true;
            for (const rt of [B.ziel, B.schatten]) rt.viewport.set(0, 0, rt.width, rt.height);
            rend.setRenderTarget(vor.rt, vor.face, vor.mip);
            rend.setMRT(vor.mrt);
            rend.autoClear = vor.ac;
            rend.setClearColor(vor.farbe, vor.alpha);
            for (const [u, w] of halt) {
                if (u.value && u.value.copy && typeof w === "object") u.value.copy(w);
                else u.value = w;
            }
            B.wurzel.clear();
        }
        if (!ganz) return null;
        const platte = z._liefer && {
            preset: z.preset,
            rest: z._liefer.rest,
            frame: { halfW: fr.halfW, halfH: fr.halfH },
        };
        if (bc) this._karteAblage(at, z.idx, B, platte);
        B.zuletzt = performance.now();
        this._foundryLiefer(this._foundry, "haupt", "karte", z._liefer, B.zuletzt - t0);
        (at.weltMs || (at.weltMs = [])).push(+(B.zuletzt - t0).toFixed(2));
        z._weltNeu = false;
        if (!z.gebacken) this._karteGebacken(z, fr);
        return true;
    }

    // DER RECHNER DER ABLAGE: die Compute-Programme (WGSL `KARTE_RECHNER_WGSL`) entstehen asynchron
    // (createComputePipelineAsync) — bis sie stehen, wartet die Schlange (null).
    _karteRechner() {
        const dev = this.state.renderer.backend.device;
        const R = this._karteRechnerSatz;
        if (R && R.dev === dev) return R.bereit ? R : null; // je Gerät EIN Satz Programme
        const S = (b, t) => Object.assign({ binding: b, visibility: GPUShaderStage.COMPUTE }, t);
        const puffer = (b) => S(b, { buffer: { type: "storage" } });
        const tex = (b) => S(b, { texture: { sampleType: "float" } });
        const layout = dev.createBindGroupLayout({
            label: "karte-rechner",
            entries: [
                S(0, { buffer: { type: "uniform", hasDynamicOffset: true } }),
                tex(1),
                tex(2),
                tex(3),
                ...[4, 5, 6, 7, 8, 9, 10].map(puffer),
            ],
        });
        const modul = dev.createShaderModule({ label: "karte-rechner", code: AnazhRealm.KARTE_RECHNER_WGSL });
        const satz = (this._karteRechnerSatz = { bereit: false, layout, pipes: {}, dev });
        const pl = dev.createPipelineLayout({ bindGroupLayouts: [layout] });
        const namen = ["stufe0", "summeK", "glaette", "grenzeK", "bc1", "normalK", "bc5", "sicht"];
        Promise.all(
            namen.map((n) =>
                dev
                    .createComputePipelineAsync({
                        label: "karte-" + n,
                        layout: pl,
                        compute: { module: modul, entryPoint: n },
                    })
                    .then((p) => (satz.pipes[n] = p))
            )
        ).then(
            () => (satz.bereit = true),
            (e) => this._stoffBruch("die Karte: die Programme ihrer GPU-Ablage kompilieren nicht", e)
        );
        return null;
    }

    // DER PLAN DER ABLAGE einer Schicht (fest je Atlas-Maß: die Parameter liegen EINMAL im Uniform-Puffer, je Bake ändert
    // sich nur die Ziel-Schicht der Kopien): Stufe 0 zählt die Deckung je Ansicht, jede tiefere Stufe summiert, glättet,
    // wählt deckungstreu (genau so viele deckende Texel je Ansicht wie Stufe 0 deckt — das Karten-Gesetz der Mips) und
    // kodiert BC1; die Normale mittelt als Vektor ab 1/normalTeiler und kodiert BC5; die Sonnen-Sicht mittelt über die
    // deckenden Texel auf 1/lichtTeiler. `nurLage`: nur die Lage der Bytes (die Kopien), ohne Puffer — die Karte der Platte.
    _karteRechenPlan(at, nurLage) {
        const dev = this.state.renderer.backend.device;
        const M = at.masse;
        const G = globalThis.__phytoCore.KARTEN_GESETZ;
        const V = at.V,
            W = M.w,
            H = M.h,
            hA = at.ch;
        const pad = (b) => Math.ceil(b / 256) * 256;
        const slots = [];
        const zuege = [];
        const kopien = [];
        let ausB = 0;
        const zug = (pipe, p, x, y) => {
            const s = new ArrayBuffer(64);
            const u = new Uint32Array(s),
                f = new Float32Array(s);
            const ord = [
                "w",
                "h",
                "hA",
                "k",
                "quelle",
                "ziel",
                "V",
                "fuss",
                "aus",
                "zeile",
                "thr",
                "flag",
                "w0",
                "hA0",
                "gi",
                "t",
            ];
            ord.forEach((n, i) => {
                const v = p[n] == null ? 0 : p[n];
                if (n === "fuss" || n === "thr") f[i] = v;
                else u[i] = v;
            });
            slots.push(u);
            zuege.push({ pipe, slot: slots.length - 1, x: Math.max(1, x), y: Math.max(1, y || 1) });
        };
        const ablage = (tex, mip, w, h, blockB, vonW) => {
            // vonW: Texel je Wort-Spalte (bc: 4 Texel je Block; rg8: 2 Texel je Wort) — die Zeile auf 256 B gepolstert
            const zeileB = pad((w / 4) * blockB);
            const zeilen = tex === 2 ? h : h / 4;
            const off = ausB;
            ausB += pad(zeileB * zeilen);
            kopien.push({ tex, mip, off, zeileB, zeilen, w, h });
            return { aus: off / 4, zeile: zeileB / 4, vonW };
        };
        const base = { V, thr: G.schwelle, w0: W, hA0: hA };
        zug("stufe0", Object.assign({}, base, { w: W, h: H, hA }), Math.ceil(W / 16), Math.ceil(H / 16));
        // Albedo: Stufe 0 binär, k ≥ 1 deckungstreu
        let so = 0;
        let quelle = 0;
        for (let k = 0; k < M.a.length; k++) {
            const wk = W >> k,
                hk = H >> k,
                hAk = hA >> k,
                fuss = 1 << (2 * k);
            let flag = 0;
            if (k > 0) {
                zug(
                    "summeK",
                    Object.assign({}, base, { w: wk, h: hk, hA: hAk, k, quelle, ziel: so, fuss }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                const gaenge = globalThis.__phytoCore.karteGlaetteGaenge(k);
                for (let gg = 0; gg < gaenge; gg++)
                    zug(
                        "glaette",
                        Object.assign({}, base, { w: wk, h: hk, hA: hAk, flag: gg & 1 }),
                        Math.ceil(wk / 16),
                        Math.ceil(hk / 16)
                    );
                flag = gaenge & 1;
                zug(
                    "grenzeK",
                    Object.assign({}, base, { w: wk, h: hk, hA: hAk, k, ziel: so, fuss, flag, gi: k * V }),
                    V,
                    1
                );
            }
            const a = ablage(0, k, wk, hk, 8);
            zug(
                "bc1",
                Object.assign({}, base, {
                    w: wk,
                    h: hk,
                    hA: hAk,
                    k,
                    ziel: so,
                    fuss,
                    flag,
                    gi: k * V,
                    aus: a.aus,
                    zeile: a.zeile,
                }),
                Math.ceil(wk / 32),
                Math.ceil(hk / 32)
            );
            if (k > 0) {
                quelle = so;
                so += wk * hk;
            }
        }
        const summeN = Math.max(1, so);
        // Normale: Stufe j der Welt = Stufe j+1 der vollen Bühne
        let no = 0;
        let nq = 0;
        for (let j = 0; j < M.n.length; j++) {
            const wj = M.nw >> j,
                hj = M.nh >> j;
            zug(
                "normalK",
                Object.assign({}, base, { w: wj, h: hj, k: j + 1, quelle: nq, ziel: no }),
                Math.ceil(wj / 16),
                Math.ceil(hj / 16)
            );
            const a = ablage(1, j, wj, hj, 16);
            zug(
                "bc5",
                Object.assign({}, base, { w: wj, h: hj, hA: hA >> (j + 1), ziel: no, aus: a.aus, zeile: a.zeile }),
                Math.ceil(wj / 32),
                Math.ceil(hj / 32)
            );
            nq = no;
            no += wj * hj;
        }
        // Sonnen-Sicht: rg8 (Zenit, 45°-Kranz), eine Stufe
        const l = ablage(2, 0, M.lw, M.lh, 8);
        zug(
            "sicht",
            Object.assign({}, base, { w: M.lw, h: M.lh, t: G.lichtTeiler, aus: l.aus, zeile: l.zeile }),
            Math.ceil((M.lw * M.lh) / 2 / 64),
            1
        );
        if (nurLage) return { kopien, ausB };
        const U = GPUBufferUsage;
        const mk = (label, size, usage) =>
            dev.createBuffer({ label: "karte-" + label, size: Math.max(16, size), usage });
        const P = {
            param: mk("param", slots.length * 256, U.UNIFORM | U.COPY_DST),
            summe: mk("summe", summeN * 16, U.STORAGE),
            nsum: mk("nsum", no * 16, U.STORAGE),
            dA: mk("dA", (W / 2) * (H / 2) * 4, U.STORAGE),
            dB: mk("dB", (W / 2) * (H / 2) * 4, U.STORAGE),
            zahl: mk("zahl", (V + 3) * 4, U.STORAGE | U.COPY_DST),
            grenze: mk("grenze", M.a.length * V * 4, U.STORAGE),
            aus: mk("aus", ausB, U.STORAGE | U.COPY_SRC),
        };
        const roh = new Uint8Array(slots.length * 256);
        slots.forEach((u, i) => roh.set(new Uint8Array(u.buffer), i * 256));
        dev.queue.writeBuffer(P.param, 0, roh);
        return { P, puffer: Object.values(P), zuege, kopien, ausB, gruppe: null, quellen: null };
    }

    // DIE ABLAGE: die GPU zieht aus der Bühne die Stufen der Schicht und kodiert sie, die Kopien legen sie in die Schicht
    // `idx` der Atlas-Texturen. Mit `platte` ({preset, rest, frame}, die Platte trägt die Karte nicht) reisen dieselben Bytes
    // zurück und per Transfer in den Faden der Schale (`karte-ablage`) — der Haupt-Faden schreibt keine Platte.
    _karteAblage(at, idx, B, platte) {
        const rend = this.state.renderer;
        const dev = rend.backend.device;
        const R = this._karteRechner();
        const plan = B.rechen || (B.rechen = this._karteRechenPlan(at));
        const be = rend.backend;
        const quellen = B.ziel.textures.map((t) => be.get(t).texture);
        if (!plan.gruppe || plan.quellen.some((q, i) => q !== quellen[i])) {
            const P = plan.P;
            plan.quellen = quellen;
            plan.gruppe = dev.createBindGroup({
                label: "karte-rechner",
                layout: R.layout,
                entries: [
                    { binding: 0, resource: { buffer: P.param, size: 64 } },
                    ...quellen.map((q, i) => ({ binding: 1 + i, resource: q.createView() })),
                    ...["summe", "nsum", "dA", "dB", "zahl", "grenze", "aus"].map((n, i) => ({
                        binding: 4 + i,
                        resource: { buffer: P[n] },
                    })),
                ],
            });
        }
        // die Schichten bekommen ihre GPU-Form vor der ersten Ablage (gezeichnet wird eine Karte erst gebacken)
        if (!this._karteGpuTexturen(at)) for (const t of [at.map, at.nmap, at.lmap]) rend.initTexture(t);
        const ziele = this._karteGpuTexturen(at);
        if (!ziele) throw this._stoffBruch("die Karte: der Atlas hat keine GPU-Form für die Ablage");
        const enc = dev.createCommandEncoder({ label: "karte-ablage" });
        enc.clearBuffer(plan.P.zahl);
        const pass = enc.beginComputePass({ label: "karte-ablage" });
        for (const z of plan.zuege) {
            pass.setPipeline(R.pipes[z.pipe]);
            pass.setBindGroup(0, plan.gruppe, [z.slot * 256]);
            pass.dispatchWorkgroups(z.x, z.y);
        }
        pass.end();
        for (const k of plan.kopien)
            enc.copyBufferToTexture(
                { buffer: plan.P.aus, offset: k.off, bytesPerRow: k.zeileB, rowsPerImage: k.zeilen },
                { texture: ziele[k.tex], mipLevel: k.mip, origin: { x: 0, y: 0, z: idx } },
                { width: k.w, height: k.h, depthOrArrayLayers: 1 }
            );
        const U = GPUBufferUsage;
        const lese =
            platte && dev.createBuffer({ label: "karte-platte", size: plan.ausB, usage: U.MAP_READ | U.COPY_DST });
        if (lese) enc.copyBufferToBuffer(plan.P.aus, 0, lese, 0, plan.ausB);
        dev.queue.submit([enc.finish()]);
        if (lese)
            lese.mapAsync(GPUMapMode.READ).then(
                () => {
                    const bytes = new Uint8Array(lese.getMappedRange().slice(0));
                    lese.destroy();
                    const karte = { bytes, frame: platte.frame };
                    const msg = { type: "karte-ablage", presetId: platte.preset, platte: platte.rest, karte };
                    if (this._foundry && this._foundry.worker) this._foundry.worker.postMessage(msg, [bytes.buffer]);
                },
                () => lese.destroy()
            );
    }

    // DIE KARTE STEHT — der EINE Ausgang jedes Bakes: Rahmen, Ende der Zusage, die wartenden Regionen und Bau-Takte wecken.
    _karteGebacken(z, fr) {
        // RAHMEN-EINHEIT: das Quad nimmt DENSELBEN Rahmen wie die Bake-Kamera (halfH = 1,02·maxY/2, halfW radial) —
        // keine Wurzel-Höhe mehr (bis V18.528 stand das Quad auf max(0,5, maxY − minY): vertikal verzerrt).
        if (!z.rahmenFest) z.frame = { halfH: fr.halfH, halfW: fr.halfW };
        this._karteEndet(z, true);
        // Die Karte ist gebacken → aufgeschobene Streu-Regionen neu streamen, wie bei jeder Asset-Ankunft: ein Baum-Platz,
        // dessen Nah-Stufe fehlt, wartet auf die gebackene Karte (`_foundryFlattenFor` Stufe 2 liefert vorher false). Ohne
        // diesen Anstoß blieb die Region aufgeschoben, wenn die letzte Lieferung VOR dem Bake kam — an der Mess-Wiese
        // fehlten im frischen Boot die Mammutbäume (9 Instanzen, 556k Dreiecke), bis eine fremde Lieferung sie weckte.
        this._scatterRefillPending = true;
        // Und die Bau-Takte gehen (K36): eine Stufe, die auf diese Karte als Partner wartet, hält voll (`_lodHalt`) —
        // die Band-Pflege nimmt die Karte jetzt auf, statt zu schlafen, bis sich zufällig etwas regt.
        this._bauRegt();
        if (typeof window !== "undefined") window.__impostorRttBaked = (window.__impostorRttBaked || 0) + 1;
        return true;
    }

    // IMPOSTOR-LEAF des Grammatik-Baums (nur das Foundry-aus-Regime der Gates und die Einbettung ohne Worker):
    // dieselbe Atlas-Zelle wie die Foundry-Art des Skeletts (`_foundryPresetFor`) — kein zweiter Kartenbauer. Mit
    // echtem Renderer erst, wenn die Zelle gebacken ist (sonst null → der Aufrufer zeichnet die Grammatik-LOD2); der
    // Null-Renderer bäckt nie, dort trägt der Skelett-Rahmen (`_impostorFrame`) die Mechanik.
    _buildImpostorLeaf(bp, skel) {
        if (!skel) return null;
        const at = this._impostorAtlas();
        const species = bp && bp._grownSpecies ? bp._grownSpecies : "baum";
        const preset = this._foundryPresetFor(species);
        if (!at || !preset) return null;
        const variant = bp && Number.isFinite(bp._variantIndex) ? bp._variantIndex : 0;
        // Die Grammatik-Zelle trägt den Skelett-Rahmen (Grammatik-Welt-Maß, rahmenFest) — die Foundry-Zelle derselben
        // Art den Bake-Rahmen (Template-Maß); getrennte Schlüssel, derselbe Bäcker.
        const key = "fimp:g:" + species + "|" + variant;
        let z = at.zellen.get(key);
        if (!z) {
            z = this._impostorZelleNeu(at, key, preset, variant, null);
            z.frame = this._impostorFrame(skel);
            z.rahmenFest = true;
        }
        const rend = this.state && this.state.renderer;
        if (rend && !rend._isHeadlessNull && !z.gebacken) return null;
        // Die Grammatik-Karte trägt ihren eigenen Rahmen als Sichthöhe (der Skelett-Baum kennt kein Höhen-Buch).
        return this._impostorLeaf(z, new THREE.Matrix4(), z.frame.halfH * 2);
    }

    // DAS LAUB-LICHT IM STOFF (K19): jeder Laub-Stoff der Welt (Foundry-Laub und Blatt-Karte, das Grammatik-Laub) rechnet je
    // direktem Licht den EINEN Laub-Licht-Term (phyto-core `laubDurchlass`, hier über der TSL-Algebra) in seiner Lichtung —
    // das Lichtmodell des Standard-Stoffs (r184 PhysicalLightingModel), dessen `direct` nach der Physik des Stoffs den
    // Durchlass der Rückseite addiert: `lightColor` trägt den Schatten der Kaskade, die Normierung ist die Lambert-Antwort der
    // Vorderseite (diffuseColor/π ausgeschrieben — ein Fn-Aufruf ohne Layout baute seinen Rumpf erst im Compiler). Kein
    // Szenen-Licht, kein zweiter Stoff: das Laub bleibt EIN Programm je Stoff. `nadel`: true — die Blatt-Karte erkennt die
    // Nadel an ihrer Atlas-Zelle (u ≥ LAUB_LICHT.nadelAbU); false — Klinge und Blatt-Geometrie sind Laub; eine Funktion — die
    // ferne Karte liest die Nadel ihrer Schicht (`_karteNadel`), der Knoten entsteht je Programm-Bau.
    _laubLichtStoff(mat, nadel) {
        if (!mat || mat.isNodeMaterial !== true) throw new Error("_laubLichtStoff: kein Knoten-Stoff");
        const T = THREE.TSL;
        const K = AnazhRealm._laubLichtModell();
        const ab = globalThis.__phytoCore.LAUB_LICHT.nadelAbU;
        const art = typeof nadel === "function" ? "karte" : nadel === true ? "atlas" : "laub";
        mat.setupLightingModel = () =>
            new K(
                art === "karte"
                    ? nadel()
                    : art === "atlas"
                      ? T.select(T.attribute("uv", "vec2").x.greaterThanEqual(ab), T.float(1), T.float(0))
                      : T.float(0)
            );
        const schluessel = mat.customProgramCacheKey;
        const at = art === "karte" ? this._impostorAtlas() : null;
        mat.customProgramCacheKey = function () {
            return (
                schluessel.call(this) +
                (art === "laub" ? "|laubLicht" : "|laubLicht:" + art) +
                (at && at.nadelU ? ":" + at.nadelU.array.length : "")
            );
        };
        mat.userData = mat.userData || {};
        mat.userData.laubLicht = art;
        return mat;
    }

    // DIE NADEL DER KARTE (K19): je Atlas-Schicht 1 für die Nadel-Art (der Phänotyp der Zelle, K24), sonst 0 — EINE
    // Uniform-Reihe für jede Karte jeder Art. Wächst der Atlas über die Reihe, wächst sie mit (verdoppelnd) und die Karte baut
    // ihr Programm neu (die Länge steht im Programm-Schlüssel); ohne Wachsen kostet sie nichts.
    _karteNadel(T, z) {
        const at = this._impostorAtlas();
        const tab = globalThis.__terrainCore && globalThis.__terrainCore.PHYTO_PRESETS;
        if (!tab) return AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        let n = at.nadelU ? at.nadelU.array.length : 0;
        if (n < Math.max(at.n, 1)) {
            const alt = at.nadelU ? at.nadelU.array : [];
            while (n < Math.max(at.n, 1)) n = Math.max(32, n * 2);
            const a = new Array(n).fill(0);
            for (let i = 0; i < alt.length; i++) a[i] = alt[i];
            at.nadelU = (T || THREE.TSL).uniformArray(a, "float");
            if (at.mat) at.mat.needsUpdate = true;
        }
        if (z) {
            const rec = tab[z.preset];
            // Die Nadel-Art ist der Phänotyp der Art (K24: phyto-core artPhaenotyp, dieselbe Quelle wie der Baum).
            const pc = globalThis.__phytoCore;
            at.nadelU.array[z.idx] =
                rec && rec.s && (rec.kind === "tree" || rec.kind === "shrub") && pc.artPhaenotyp(rec.s, rec).conifer
                    ? 1
                    : 0;
        }
        return at.nadelU;
    }

    // Das Lichtmodell des Laubs (K19): die Klasse ist die des Standard-Stoffs selbst (sein `setupLightingModel` liefert sie
    // — die Bootstrap-Brücke reicht sie nicht als THREE-Symbol), erweitert um den Durchlass.
    static _laubLichtModell() {
        if (AnazhRealm._laubLichtK) return AnazhRealm._laubLichtK;
        const T = THREE.TSL;
        const Basis = THREE.MeshStandardNodeMaterial.prototype.setupLightingModel.call(null).constructor;
        const A = AnazhRealm._windTsl(T);
        const durchlass = globalThis.__phytoCore.laubDurchlass;
        class LaubLicht extends Basis {
            constructor(nadel) {
                super();
                this.nadel = nadel;
            }
            direct(e, builder) {
                super.direct(e, builder);
                const L = e.lightDirection;
                const f = durchlass(A, T.normalView.dot(L), T.positionViewDirection.dot(L).negate(), this.nadel);
                e.reflectedLight.directDiffuse.addAssign(
                    e.lightColor
                        .mul(f)
                        .mul(T.diffuseColor.rgb)
                        .mul(1 / Math.PI)
                );
            }
        }
        AnazhRealm._laubLichtK = LaubLicht;
        return LaubLicht;
    }

    // Die Schlankheit der Karte (K19): EINE Uniform, das Mittel von δ über die Arten, deren Gestalt geliefert ist
    // (`_baumWindDaten` misst sie, phyto-core `windSchlankheit`) — die Karte zeichnet jede Art aus EINEM Stoff und kennt
    // ihre Art nur als Atlas-Schicht. Vor der ersten Gestalt ist δ 0 (f0 0: die Karte neigt sich mit der Böe, ohne Pendel).
    _karteWindDelta() {
        if (!this._karteWindU) this._karteWindU = THREE.TSL.uniform(0);
        return this._karteWindU;
    }

    // DIE WIND-DATEN EINER ART (K19) für den Stoff ihrer Gruppe, gemessen an der GELIEFERTEN Gestalt: die Vorlagen-Höhe
    // (die Wurzel liegt bei y = 0 — ζ = y / ht), die Schlankheit δ = D(Brusthöhe) / ht des Stamm-Strangs (phyto-core
    // `windSchlankheit` mit der Welt-Skala der Art) und ob sie im Wind steht (Baum und Strauch; der liegende Stamm, der
    // Stumpf, Fels und Bau stehen still). Bis K19 kam δ aus dem Buch-Phänotyp — das Totholz (gebrochene Krone) schwang
    // 42 % zu langsam.
    _baumWindDaten(preset, meshes) {
        const rec = this._foundryRecipeFor(preset);
        if (!rec || rec.panel !== "plant") return null;
        const an = rec.kind === "tree" || rec.kind === "shrub" ? 1 : 0;
        if (!an) return null;
        let top = 0,
            rinde = null;
        for (const m of meshes || []) {
            const pa = m && m.position && m.position.array;
            if (!pa) continue;
            if (!rinde && m.kind === "bark") rinde = pa;
            for (let i = 1; i < pa.length; i += 3) if (pa[i] > top) top = pa[i];
        }
        if (!(top > 0)) return null;
        const skala = this._foundryWorldScaleMatrix(preset).elements[5];
        const delta = globalThis.__phytoCore.windSchlankheit(rinde, top, skala);
        if (!(delta > 0)) throw new Error("_baumWindDaten: " + preset + " liefert keinen Stamm-Ring für den Wind");
        if (!this._windDeltaJeArt) this._windDeltaJeArt = new Map();
        if (!this._windDeltaJeArt.has(preset)) {
            this._windDeltaJeArt.set(preset, delta);
            let s = 0;
            for (const d of this._windDeltaJeArt.values()) s += d;
            this._karteWindDelta().value = s / this._windDeltaJeArt.size;
        }
        return { ht: top, delta, an };
    }

    // Die TSL-Algebra des Wind-Terms (phyto-core `windAusschlag`) — Rinde, Laub und Karte der Welt rechnen über ihr.
    static _windTsl(T) {
        return {
            k: (n) => T.float(n),
            add: (a, b) => a.add(b),
            mul: (a, b) => a.mul(b),
            min: (a, b) => T.min(a, b),
            max: (a, b) => T.max(a, b),
            pow: (a, b) => T.pow(a, b),
            sin: (a) => T.sin(a),
            sqrt: (a) => T.sqrt(a),
        };
    }

    // DER WIND IM PFLANZEN-STOFF (K19): Rinde und Laub jeder Foundry-Pflanze tragen den EINEN Wind-Term (phyto-core
    // `windAusschlag`, hier über der TSL-Algebra) — Stamm, Ast und Blatt je mit ihrer Frequenz, die Last aus der Wind-Zeile
    // des Wetters (U = uWindStrength / WEATHER_WIND_AMP, dieselbe Zeile, die das Wasser kräuselt), die Böe aus WIND_BOE
    // (Gras, Streu und Ohr lesen sie), die Richtung uWindDir. Je Baum: die Höhe H aus seinem Instanz-Stempel aH0 (die
    // Sichthöhe der Stufen-Blende, Vorlage × Instanz-Skala), f0 = kF · δ / H. Die Art-Größen (ht, δ, an) sind ein Stoff-Wert
    // (`userData.windArt`, `_stoffWert`): jede Art zeichnet ihren eigenen Stoff mit DEMSELBEN Knoten — EIN Graph für Laub, einer
    // für Rinde, Wurf und Bau (1310-18; bis dahin eine frische Uniform je Stoff, für r184 ein Programm je Art). r184 rechnet den
    // positionNode VOR der Instanzierung (vendor three.webgpu.min.js: `setupPosition` legt die Zuweisung des positionNode
    // auf den Stapel, die Instanz-, Batch- und Skin-Knoten hängen ihr `positionLocal = M × positionLocal` erst in ihrem
    // setup an, und `StackNode.build` baut die nachgereichten Knoten NACH den ersten): die Phase liest die Welt-Lage aus der
    // EINEN Naht (`_weltNaht`), der Ausschlag (Welt-Meter in Windrichtung, das Flattern entlang der Welt-Normale) geht über
    // sie in die Vorlage zurück — bis K20-N1 wehte der Wind jedes Baums in der Drehung seiner Instanz und wuchs mit ihrer
    // Skala (gate:foundry-impostor C4). Die Naht ist EIN Satz Knoten (`_weltNaht` teilt ihn), der Knoten je Art bleibt einer.
    // Der WURF (kind "schatten": der Wurf-Teil der Foundry-L1, der Zwilling des Werkstatt-Baums) schwingt mit Stamm und
    // Ast wie sein Bild — der r184-Schattenpass zeichnet mit dem positionNode des Stoffs (Lehre 26). Das Blatt-Flattern
    // trägt er nicht: sein Hub (WIND_GESETZ.blatt.hub 0,035 m im Sturm) liegt unter dem Kaskaden-Texel (wurf 0,17 m).
    // Jeder Wurf zeichnet aus EINEM Programm (der eines Baus mit an 0).
    _baumWindStoff(mat, kind, baum) {
        if (!mat || mat.isNodeMaterial !== true || mat.positionNode) return;
        if (!this.state.windUniforms) this._grassInstanceMat();
        const laub = kind === "foliage" || kind === "foliageTex";
        // ohne Wind-Daten (Stumpf, liegender Stamm, Fels) steht der Stoff still (an 0) und teilt doch das Programm der Bäume
        mat.userData.windArt = new THREE.Vector3(baum ? baum.ht : 1, baum ? baum.delta : 0, baum ? baum.an : 0);
        mat.userData.baumWind = baum ? { ht: baum.ht, delta: baum.delta, an: baum.an } : null;
        if (!this._baumWindKnoten) this._baumWindKnoten = {};
        const da = this._baumWindKnoten[laub ? "laub" : "ast"];
        if (da) {
            mat.positionNode = da;
            return;
        }
        const T = THREE.TSL;
        const wu = this._ensureWindCoupling(T);
        const WG = globalThis.__phytoCore.WIND_GESETZ;
        const B = AnazhRealm.WIND_BOE;
        // die Art-Größen: der Stoff-Wert — zeichnet die Arena (`_arenaNimmt`, viele Arten in EINEM Zug), trägt ihn die Instanz
        const uB = AnazhRealm._windArtKnoten(this._stoffWert(T, "userData.windArt", "vec3"));
        const A = AnazhRealm._windTsl(T);
        const pG = T.positionGeometry;
        const naht = this._weltNaht(T);
        const pW = naht.lage;
        const ht = uB.x.max(1e-3);
        const H = T.attribute("aH0", "float").max(0.5);
        const ort = pW.x.mul(wu.uWindDir.x).add(pW.z.mul(wu.uWindDir.y));
        const g = T.sin(wu.uWindTime.mul(B.omega).sub(ort.mul(B.k)))
            .mul(B.amp)
            .add(B.mitte);
        const e = {
            t: wu.uWindTime,
            U: wu.uWindStrength.div(AnazhRealm.WEATHER_WIND_AMP),
            g,
            f0: uB.y.mul(WG.kF).div(H),
            H,
            zeta: pG.y.div(ht),
            rho: T.length(pG.xz).div(ht),
            phi: ort.mul(-B.k),
            psi: pG.x.mul(1.7).add(pG.y.mul(0.9)).add(pG.z.mul(1.3)).div(ht).mul(6.2832),
        };
        const w = globalThis.__phytoCore.windAusschlag(A, e, laub);
        const quer = w.quer.mul(uB.z);
        let off = T.vec3(wu.uWindDir.x.mul(quer), w.hoch.mul(uB.z), wu.uWindDir.y.mul(quer));
        if (laub) off = off.add(naht.richtung(T.normalLocal).mul(w.flattern.mul(uB.z)));
        mat.positionNode = this._baumWindKnoten[laub ? "laub" : "ast"] = T.positionLocal.add(naht.vorlage(off));
    }
    // DIE INSTANZ-MATRIX OHNE KAPAZITÄT IM SHADER — der EINE Bau jeder InstancedMesh der Welt: r184 legt
    // instanceMatrix bis 64 KB als UNIFORM-Array `array<mat4x4f, N>` in den Vertex-Shader (InstanceNode) —
    // jede Kapazität (Büschel je Nah-Wiesen-Kachel, Gruppen-Wachstum 16 → 32 → …) wurde ein eigenes Programm
    // und eine eigene Pipeline, kompiliert beim Laufen. Gemessen 02.10. an der Mess-Wiese: 756 Vertex-
    // Programme auf 60 Fragment-Programme. Der Storage-Puffer ist laufzeit-dimensioniert (`array<mat4x4f>`):
    // EIN Programm je Material × Attribut-Form, gleich wie viele Instanzen.
    // DER ZEICHNER (1410-1): die Senke bleibt für die Welt eine InstancedMesh (Slots, `count`, Raycast, Wurf, Bündel) — gezeichnet
    // wird sie von ihrem Zeichner (`_instanzZeichner`), einem Mesh über einer InstancedBufferGeometry. r184 hängt an den
    // Programm-Schlüssel jeder InstancedMesh ihre uuid (`isInstancedMesh || count > 1`): jede Senke baute ihr eigenes Programm,
    // auch bei EINEM geteilten Graphen (1310-18: 51 Bauten an der Ankunft). Der Zeichner trägt keinen der beiden Terme; seine
    // Instanz-Zahl ist `instanceCount` der Geometrie, die Matrizen liest EIN geteilter Knoten (`_senkenKnoten`) je Zeichen-Objekt.
    static _instanzMesh(geom, mat, cap) {
        const m = new THREE.InstancedMesh(geom, mat, cap);
        if (typeof THREE.StorageInstancedBufferAttribute === "function")
            m.instanceMatrix = new THREE.StorageInstancedBufferAttribute(m.instanceMatrix.array, 16);
        AnazhRealm._instanzZeichner(m);
        return m;
    }
    // Die Senke projiziert r184 als LOD OHNE TAKT (`_projectObject`: ein LOD zeichnet nicht, ohne `autoUpdate` stellt er nichts,
    // seine Kinder projizieren mit der Reihe seiner Eltern) — sie zeichnet nur über ihr Kind, den Zeichner, und der sortiert wie
    // die Senke zuvor (Reihe der Eltern · ihre renderOrder · ihr Abstand). Als GRUPPE setzte sie die Reihe ihrer Kinder auf ihre
    // eigene renderOrder (r = e.renderOrder): eine Senke außerhalb der Bündel zeichnete in anderer Folge (gpu-bank am Tor nah
    // +0,29 ms, 1410-1). Die Gänge der Welt (`traverse`) sehen den Zeichner nicht: er ist r184s Werkzeug, nicht ein Teil der
    // Welt (Zählungen, Kehraus und Linsen lesen die Senke, wie bisher).
    // Jede neue Senke meldet sich zum Eintritt in die Arena ihres Stoffs (`_arenaKommt`, im Takt vor dem ersten Zug).
    static _instanzZeichner(m) {
        const Z = AnazhRealm._instanzZeichnerKlasse();
        const z = new Z(m);
        m.isLOD = true;
        m.add(z);
        m.__zeichner = z;
        m.traverse = function (cb) {
            cb(this);
            for (const c of this.children) if (c !== this.__zeichner) c.traverse(cb);
        };
        m.traverseVisible = function (cb) {
            if (this.visible === false) return;
            cb(this);
            for (const c of this.children) if (c !== this.__zeichner) c.traverseVisible(cb);
        };
        AnazhRealm._arenaMelden(m);
        return z;
    }
    // EIN FRISCHER ZEICHNER, wenn die Matrizen seiner Senke die GPU verlassen (`_arenaTakt`): r184 baut die Bindegruppe eines
    // Render-Objekts nur bei einer neuen Gruppen-Version neu (`Nodes.updateGroup`) und zieht unter der Observer-Diät ohne
    // jedes Auffrischen — ein Render-Objekt des alten hielte den gefallenen Speicher-Puffer. Der alte verlässt die Senke samt
    // seinen Render-Objekten (`_renderObjekteLoesen`, nach dem Submit des Frames), der neue hat keines: kehrt die Senke zu ihm
    // zurück, legt r184 sein Render-Objekt mit dem Puffer von dann an. Befund 16.10. (G1-n2/diag8, Radeon, Genesis Third):
    // ein zurückgekehrter Zeichner band den gefallenen Puffer weiter — 615 Meldungen der GPU-Wache.
    static _zeichnerFrisch(m) {
        const alt = m.__zeichner;
        if (!alt) return;
        if (alt.parent === m) m.remove(alt);
        m.__zeichner = new (AnazhRealm._instanzZeichnerKlasse())(m);
        setTimeout(() => AnazhRealm._renderObjekteLoesen(alt), 0);
    }
    // Der Zeichner einer Senke: Stoff, Wurf, Schichten, Hülle, Welt-Matrix und `userData` sind die der Senke (gelesen, nie
    // kopiert); seine Geometrie ist eine Fassade über der Geometrie der Senke — dieselben Attribut-Objekte, dazu die Instanz-
    // Farbe (`instanzFarbe`) und die Marke `aInstanzSenke`. Die Marke liest kein Shader (sie belegt keinen Vertex-Puffer); sie
    // trennt im Geometrie-Schlüssel den Zeichner von einem Mesh mit gleichen Attributen und gleichem Stoff (dessen Programm
    // instanziert nicht). Jeder Zugriff auf die Geometrie gleicht die Fassade mit der Quelle ab (ein Wachsen der Instanz-
    // Fassade tauscht Attribut-Objekte; r184 folgt über `needsGeometryUpdate`).
    static _instanzZeichnerKlasse() {
        if (AnazhRealm.__instanzZeichnerK) return AnazhRealm.__instanzZeichnerK;
        const T = THREE;
        const MARKE = new T.BufferAttribute(new Float32Array(1), 1);
        class InstanzZeichner extends T.Mesh {
            constructor(senke) {
                super(new T.InstancedBufferGeometry(), senke.material);
                const fassade = this.geometry;
                this.__fassade = fassade;
                fassade.setAttribute("aInstanzSenke", MARKE);
                this.__instanzQuelle = senke;
                this.isInstanzZeichner = true;
                this.name = "instanz-zeichner";
                this._q = { geo: null, attr: null, index: null, farbe: undefined };
                const durch = (k) => ({
                    get: () => senke[k],
                    set: (v) => {
                        senke[k] = v;
                    },
                    configurable: true,
                });
                for (const k of [
                    "material",
                    "castShadow",
                    "receiveShadow",
                    "frustumCulled",
                    "renderOrder",
                    "userData",
                    "layers",
                ]) {
                    delete this[k];
                    Object.defineProperty(this, k, durch(k));
                }
                delete this.matrixWorld;
                delete this.geometry;
                Object.defineProperties(this, {
                    matrixWorld: { get: () => senke.matrixWorld, set: () => {}, configurable: true },
                    instanceColor: { get: () => senke.instanceColor, configurable: true },
                    boundingSphere: {
                        get: () => {
                            if (senke.boundingSphere === null) senke.computeBoundingSphere();
                            return senke.boundingSphere;
                        },
                        set: () => {},
                        configurable: true,
                    },
                    geometry: { get: () => this._fassade(fassade), set: () => {}, configurable: true },
                });
                this.matrixAutoUpdate = false;
                this.matrixWorldAutoUpdate = false;
            }
            _fassade(f) {
                const s = this.__instanzQuelle;
                const g = s.geometry;
                const q = this._q;
                const a = g.attributes;
                let anders = q.geo !== g || q.index !== g.index || q.farbe !== s.instanceColor;
                if (!anders) {
                    let n = 0;
                    for (const k in a) {
                        n++;
                        if (q.attr[k] !== a[k]) {
                            anders = true;
                            break;
                        }
                    }
                    if (n !== q.n) anders = true;
                }
                if (anders) {
                    for (const k of Object.keys(f.attributes))
                        if (k !== "aInstanzSenke" && !(k in a)) delete f.attributes[k];
                    let n = 0;
                    for (const k in a) {
                        f.attributes[k] = a[k];
                        n++;
                    }
                    if (s.instanceColor) f.attributes.instanzFarbe = s.instanceColor;
                    else delete f.attributes.instanzFarbe;
                    f.index = g.index;
                    f.groups = g.groups;
                    f.boundingBox = g.boundingBox;
                    f.boundingSphere = g.boundingSphere;
                    q.geo = g;
                    q.index = g.index;
                    q.farbe = s.instanceColor;
                    q.attr = Object.assign({}, a);
                    q.n = n;
                }
                // die Fassade zeichnet, was ihre Quelle zeichnet (Bereich), so viele Instanzen, wie die Senke zählt
                // (`_instanzZahl` bleibt der EINE Schreiber der Zahl — hier wird sie nur gelesen)
                f.setDrawRange(g.drawRange.start, g.drawRange.count);
                // nimmt die Arena ihres Stoffs die Senke (G1, im Takt: `_arenaKommt`), verlässt er den Graphen vor dem ersten Pass
                f.instanceCount = s.count;
                return f;
            }
            // Zieht der Zeichner, meldet er seine Senke zum Eintritt im nächsten Takt (`_arenaKommt`: eine spät gehängte Senke,
            // eine Rückkehr nach `__arenaOhne`) — nie nimmt ihn eine Arena mitten im Render.
            onBeforeRender() {
                AnazhRealm._arenaMelden(this.__instanzQuelle);
            }
            computeBoundingSphere() {
                this.__instanzQuelle.computeBoundingSphere();
            }
            raycast() {}
            updateMatrixWorld() {}
            updateWorldMatrix() {}
        }
        AnazhRealm.__instanzZeichnerK = InstanzZeichner;
        return InstanzZeichner;
    }
    // DER EINE INSTANZ-KNOTEN DER SENKEN (1410-1): je Zeichen-Objekt die Matrix seiner Senke (Speicher-Puffer `instanzMatrix`,
    // `array<mat4x4f>` laufzeit-dimensioniert) am Index der Instanz — r184s InstanceNode, nur dass der Puffer je Objekt gelesen
    // wird statt im Graphen gebunden: der Knoten stellt seinen Wert je Objekt (Takt object, vor den Bindungen des Draws), und
    // r184 merkt je Bindung ihr Attribut und baut die Bindegruppe beim Wechsel neu (`Bindings._update`). Lage und Normale wie
    // r184 (`positionLocal` · `transformNormal`, die Zuweisung baut NACH der des positionNode, Lehre 22), die Instanz-Farbe als
    // `vInstanceColor` (r184s Farb-Pfad liest sie), die Matrix am Builder für die Naht `_weltNaht` (Wind, Karte, Blende).
    static _senkenKnoten() {
        if (AnazhRealm.__senkenKnoten) return AnazhRealm.__senkenKnoten;
        const T = THREE.TSL;
        // die Klasse reicht die Bootstrap-Brücke nicht als THREE-Symbol: sie ist der Prototyp eines `storage`-Knotens
        const SB =
            THREE.StorageBufferNode ||
            (T.storage
                ? Object.getPrototypeOf(
                      T.storage(new THREE.StorageInstancedBufferAttribute(new Float32Array(16), 16), "mat4", 0)
                  ).constructor
                : null);
        const N = THREE.InstanceNode ? Object.getPrototypeOf(THREE.InstanceNode) : null;
        if (typeof SB !== "function" || !N || !T.transformNormal || !T.varyingProperty || !T.instanceIndex) {
            const text =
                "DIE SENKE: r184 StorageBufferNode · Node · transformNormal · varyingProperty fehlen (Vendor-Drift)";
            throw new Error(text);
        }
        // je Objekt der Speicher-Puffer `feld` seiner Quelle: die Matrizen jeder Senke, die Art-Größen des Winds der Arena
        class SenkenPuffer extends SB {
            constructor(feld, typ, n, name) {
                const A = typ === "uint" ? Uint32Array : Float32Array;
                super(new THREE.StorageInstancedBufferAttribute(new A(n), n), typ, 0);
                this.feld = feld;
                this.updateType = "object";
                this.setName(name);
            }
            quelle(o) {
                return o && o.__instanzQuelle ? o.__instanzQuelle[this.feld] : null;
            }
            setup(builder) {
                const p = this.quelle(builder.object);
                if (p) this.value = p;
                return super.setup(builder);
            }
            update(frame) {
                const p = this.quelle(frame.object);
                if (p) this.value = p;
            }
        }
        // DER INDEX DER INSTANZ: zieht eine Arena aus der Wahl der GPU (Marke `aWahl`, `_instanzWahlGpu`), ist er ihr Eintrag in
        // der Liste ihres Passes (`liste[instance_index]`, die erste Instanz des Zugs ist sein Abschnitt) — Matrix, Art-Größen
        // des Winds und Gang lesen ihn; sonst der Index des Zugs
        const liste = new SenkenPuffer("liste", "uint", 1, "arenaWahlListe").toReadOnly();
        const wahl = (b) => b.hasGeometryAttribute("aWahl");
        class WahlWert extends N {
            constructor(typ, ja, nein) {
                super(typ);
                Object.assign(this, { ja, nein });
            }
            setup(builder) {
                return wahl(builder) ? this.ja() : this.nein();
            }
        }
        const index = T.nodeObject(
            new WahlWert(
                "uint",
                () => liste.element(T.instanceIndex),
                () => T.instanceIndex
            )
        );
        const gang = new SenkenPuffer("gang", "vec2", 2, "arenaGang").toReadOnly().element(index);
        const matrix = new SenkenPuffer("instanceMatrix", "mat4", 16, "instanzMatrix").toReadOnly().element(index);
        // DIE ART-GRÖSSEN DES WINDS IN DER ARENA (G1): je Instanz ein vec4 im Speicher-Puffer, nie ein Vertex-Puffer — die
        // Arena belegt genau die Vertex-Puffer ihres Zeichners (r184 bindet je gelesenes Attribut einen; WebGPU trägt höchstens
        // `maxVertexBuffers` 8). Befund 16.10. (Radeon, Genesis Third, GPU-Wache): `aWindArt` als neunter Vertex-Puffer, „Vertex
        // buffer count (9) exceeds the maximum" — die Pipeline des Laubs abgesagt, jede nahe Krone fehlte im Bild.
        const windArt = new SenkenPuffer("windArt", "vec4", 4, "arenaWindArt").toReadOnly().element(index).xyz;
        class SenkenInstanz extends N {
            constructor() {
                super("void");
            }
            setup(builder) {
                T.positionLocal.assign(matrix.mul(T.positionLocal).xyz);
                if (builder.hasGeometryAttribute("normal"))
                    T.normalLocal.assign(T.transformNormal(T.normalLocal, matrix));
                if (builder.geometry && builder.geometry.attributes && builder.geometry.attributes.instanzFarbe)
                    T.varyingProperty("vec3", "vInstanceColor").assign(T.attribute("instanzFarbe", "vec3"));
                builder.__anazhInstanzMatrix = matrix;
                return null;
            }
        }
        AnazhRealm.__senkenKnoten = {
            matrix,
            windArt,
            // der Gang je Instanz (`_gangSatzKnoten`): in der Wahl am Index aus dem Speicher-Puffer der Arena, sonst das Attribut
            gang: T.nodeObject(
                new WahlWert(
                    "vec2",
                    () => gang,
                    () => T.attribute("aGang", "vec2")
                )
            ),
            instanz: new SenkenInstanz(),
        };
        return AnazhRealm.__senkenKnoten;
    }
    // DIE GEOMETRIE-ARENA (G1, die GPU-Welt): EIN Render-Objekt je Stoff. Befund 16.10. (Radeon, EINE Welt, je Ort ein
    // gezählter Frame; Rohdaten G1-gpu-welt/b3/s0): je Pass zog jede Senke ihr eigenes Render-Objekt — Genesis Third haupt
    // 41 · k0 14 · k1 3, Mess-Wiese Ego 33 · 15 · 5, Dorf 29 · 13 · 2 — mit ~3 Instanzen je Senke, und die CPU zahlt je
    // Render-Objekt (Projektion · Diät · Knoten · Bindungen · Zug). Die Senken eines Stoffs unterscheiden sich nur in Gestalt,
    // Stufe und Art: die Arena hält je Wirt (Bündel oder Szene) × Stoff-Schlüssel (`_arenaSchluessel`: Attribut-Form,
    // Schichten, Wurf, jeder Regler, Knoten und Stoff-Wert — die Art-Größen des Winds trägt die Instanz) die Instanz-Größen
    // ihrer Glieder in Blöcken (erste Instanz) und die Matrizen in EINEM Speicher-Puffer, den der EINE Instanz-Knoten
    // (`_senkenKnoten`) liest. Die Gestalten liegen im LAGER ihrer Vertex-Form (je Szene EIN Vertex- und Index-Puffer, Basis-
    // Vertex und erster Index je Gestalt), das jede Arena dieser Form teilt: eine Gestalt liegt EINMAL auf der GPU, gleich wie
    // viele Bündel sie zeichnen, und ihre Quelle verlässt die GPU (der Kehraus, `_gpuKehraus`: eine Senke in der Arena
    // zeichnet nicht). Befund 16.10. (Prüfung, Genesis Third): je Bündel eine eigene Kopie, die Quelle blieb — VRAM 69,8 →
    // 73,2 MB. Je Pass schreibt die Arena aus der EINEN Wahl der CPU (`count` der Senke, Sicht und Frustum wie r184) die
    // Zeichen-Aufträge (5 uint: Indizes · Instanzen · erster Index · Basis-Vertex · erste Instanz) in den Abschnitt DIESER
    // Kamera ihres EINEN Auftrags-Puffers (der Schatten-Render läuft verschachtelt mitten im Hauptbild), und r184 gibt sie aus
    // EINEM Render-Objekt als N drawIndexedIndirect aus (backend `_draw`: `getIndirectOffset` als Liste — vendor
    // three.webgpu.min.js gelesen). Je Senke wählt EINE Wahl nach dem EINEN Gesetz (`_passTrifft`): die Pflanzen-Stufen und die
    // Karte die der CPU (`count`), die Senken des Gang-Satzes die der GPU (`_instanzWahlGpu`, die Zahl zählt der Compute in
    // den Auftrags-Puffer) — nie beide für dieselbe Senke. Die erste Instanz eines indirekten
    // Zugs braucht `indirect-first-instance`; ohne das Merkmal (WebGL2) zeichnet jede Senke über ihren Zeichner, und die Arena
    // meldet sich einmal laut ab (`__arenaOhne`, gate:webgl-probe W3). Ein Wurf in ihrem Takt ist ein BRUCH (`_bruchMelden`):
    // sie gibt jedes Glied seinem Zeichner zurück und nimmt keines mehr (`__arenaBruch`) — r184 bliebe nach einem Wurf
    // mitten im Render stehen.
    // DIE ARENA LEBT IN DER WELT-SZENE: ihr Takt (`_arenaTakt`) ordnet Lager und Glieder; eine Szene ohne ihn (eine Bühne, die
    // Prüfbühne einer Linse) zeichnet über die Zeichner. Befund 16.10. (gate:kamera-treue SENKE 0,9562 seit 328ae617): in der
    // Bühne der Linse nahm die Arena die Senken, ihr Lager baute nie — die Senken fehlten im Bild.
    static _arenaNimmt(m, renderer) {
        if (m.__arena || !m.__zeichner || !AnazhRealm._arenaKann(renderer)) return;
        let w = m;
        while (w.parent) w = w.parent;
        const welt = globalThis.anazhRealm;
        if (!welt || w !== welt.state.scene) return;
        const schl = AnazhRealm._arenaSchluessel(m);
        if (schl === null) return;
        // ein Bündel nimmt nur auf, wenn es sich ändert: einmal je Szene nimmt jedes neu auf — so kommt jede Senke an
        if (w.__arenaAn !== true) {
            w.__arenaAn = true;
            w.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        }
        // DIE ARENA IM BÜNDEL: eine Senke im Bündel zeichnet aus der Arena ihres Bündels — ihre Plätze nimmt das Bündel auf;
        // Zahl, Wahl und Matrizen schreibt danach der Takt (`_arenaTakt`) in ihre Puffer, das Bündel nimmt nur neu auf, wenn
        // die Plätze nicht reichen (bis G1 hieß jeder Wechsel der Wahl: das ganze Bündel neu aufnehmen, r184 backt die
        // Instanz-Zahl in den Zug)
        const wirt = m.parent && m.parent.isBundleGroup === true ? m.parent : w;
        const reg = AnazhRealm.__arenen || (AnazhRealm.__arenen = new Map());
        const k = wirt.uuid + "|" + schl;
        let a = reg.get(k);
        if (!a) {
            const K = AnazhRealm._arenaKlasse();
            a = new K(k, schl, m, K.lager(w, m.geometry), 0);
            a._imBuendel(wirt.isBundleGroup === true ? wirt : null);
            a._rend = renderer;
            reg.set(k, a);
        }
        if (a.parent !== wirt) wirt.add(a);
        a.nehmen(m);
    }
    // DER TAKT DER ARENEN — je Frame nach der Wahl des Hauptbilds (`_instanzWahlPass`), vor jedem Zug: die Bündel, deren
    // Aufnahme ein Wechsel mitten in ihr traf, nehmen neu auf; die gemeldeten Senken treten ein (`_arenaKommt`); jede Arena
    // gleicht ihre Glieder ab (wer ihren Wirt verließ, geht — und tritt im selben Takt in die Arena seines neuen Wirts), die
    // eines Bündels schreibt Blöcke und Aufträge ihrer aufgenommenen Plätze (ein Wurf ist ein Bruch).
    _arenaTakt() {
        const auf = AnazhRealm.__arenaAuf;
        if (auf && auf.size) {
            for (const b of auf) b.needsUpdate = true;
            auf.clear();
        }
        if (AnazhRealm.__arenaBruch) return;
        AnazhRealm.__arenaJetzt = performance.now();
        try {
            this._arenaKommt();
            const reg = AnazhRealm.__arenen;
            if (reg && reg.size) {
                for (const a of [...reg.values()]) a._takt(false); // ohne Arena (`__arenaOhne`) gibt sie alles zurück
                const neu = this._arenaKommt();
                if (neu) for (const a of neu) a._takt(false);
            }
            // Zog der Zeichner eines Glieds, bevor es eintrat (eine spät gehängte Senke, eine Rückkehr), liegen seine Matrizen
            // auf der GPU: sie verlassen sie jetzt — vor dem ersten Pass dieses Renders (`scene.onBeforeRender` vor
            // `beginRender`), jeder frühere Pass ist abgeschickt — und der Zeichner, dessen Render-Objekte sie banden, mit ihnen
            // (`_zeichnerFrisch`).
            const quelle = AnazhRealm.__quelleWeg;
            if (quelle && quelle.size) {
                for (const m of quelle)
                    if (m.__arena && this._gpuAbschied(m.instanceMatrix)) AnazhRealm._zeichnerFrisch(m);
                quelle.clear();
            }
            if (reg && reg.size) for (const a of [...reg.values()]) a._takt(true);
        } catch (e) {
            this._arenaBruch(e);
        }
    }
    // DER EINTRITT IM TAKT (G1): jede neue oder zurückgekehrte Senke (`_arenaMelden`) tritt vor dem ersten Pass des Frames in
    // die Arena ihres Stoffs — ihr Zeichner zieht nie, ihre Matrizen betreten die GPU nie. Bis 16.10. trat sie im Zug ihres
    // Zeichners ein (`onBeforeRender`): er hatte sie eben hochgeladen, ihr Abschied traf Bindegruppen, die noch zogen
    // (G1-n2/diag8: „used in submit while destroyed", 4 je Boot). Das ist der EINE Eintritt: ein Zeichner, der zieht, meldet
    // seine Senke nur (`onBeforeRender`). Auch eine verborgene tritt ein (die Sicht urteilt die Arena je Pass, `_sichtbar`) —
    // sonst zöge ihr Zeichner, sobald ihre Region in den Blick kommt. Wer in keiner Szene hängt, wartet 120 Takte (zieht er
    // danach, meldet er sich neu); wer in einer fremden hängt (eine Bühne), bleibt beim Zeichner. Die Arenen, die Glieder
    // nahmen, gehen zurück (ihr Takt ordnet sie).
    static _arenaMelden(m) {
        if (m.__arena || AnazhRealm.__arenaOhne || AnazhRealm.__arenaBruch) return;
        (AnazhRealm.__arenaKommt || (AnazhRealm.__arenaKommt = new Map())).set(m, 0);
    }
    _arenaKommt() {
        const k = AnazhRealm.__arenaKommt;
        if (!k || k.size === 0) return null;
        const rend = this.state.renderer,
            szene = this.state.scene;
        if (!AnazhRealm._arenaKann(rend)) return void k.clear();
        let neu = null;
        for (const [m, t] of k) {
            if (m.__arena || !m.__zeichner) {
                k.delete(m);
                continue;
            }
            let w = m;
            while (w.parent) w = w.parent;
            if (w !== szene) {
                if (w.isScene || t >= 120) k.delete(m);
                else k.set(m, t + 1);
                continue;
            }
            k.delete(m);
            AnazhRealm._arenaNimmt(m, rend);
            if (m.__arena) (neu || (neu = new Set())).add(m.__arena);
        }
        return neu;
    }
    // DER ZUG EINER ARENA (ihr `onBeforeRender`): Glieder abgleichen, den Abschnitt des Passes wählen, die Aufträge
    // schreiben — ein Wurf hier ließe r184 mitten im Render stehen: er wird zum lauten Bruch, der Pass zeichnet nichts.
    _arenaZug(a, renderer, camera) {
        a._rend = renderer;
        a._stapel.push(null);
        try {
            // die Wahl der GPU legte den Zug vor dem Pass (`_wahlVor`): ohne ihn zöge die Arena ungewählt — ein Bruch
            if (a._wahl) {
                const zug = a._zuege.get(camera);
                if (!zug || !zug.bereit) throw new Error("GPU-WAHL: die Arena zieht ohne die Wahl ihres Passes");
                zug.bereit = false;
                a._stapel[a._stapel.length - 1] = zug;
                return;
            }
            if (!a._ordnen(renderer, false)) return;
            // nimmt ein Bündel die Arena auf, legt sie ihre Plätze fest (der Takt schreibt danach ihre Aufträge)
            const auf = a._fest && !!renderer._currentRenderBundle;
            const zug = a._zugFuer(camera, auf);
            a._auftraege(zug, auf ? null : camera, renderer, auf);
            a._stapel[a._stapel.length - 1] = zug;
        } catch (e) {
            this._arenaBruch(e);
        }
    }
    static _arenaKann(renderer) {
        if (AnazhRealm.__arenaOhne || AnazhRealm.__arenaBruch) return false;
        const be = renderer && renderer.backend;
        if (!be) return false;
        if (be.device && be.device.features && be.device.features.has("indirect-first-instance")) return true;
        AnazhRealm.__arenaOhne = be.isWebGLBackend ? "WebGL2" : "ohne indirect-first-instance";
        console.warn("DIE GEOMETRIE-ARENA: " + AnazhRealm.__arenaOhne + " — jede Senke zeichnet über ihren Zeichner");
        return false;
    }
    // Der Stoff-Schlüssel einer Senke — null, wo die Arena sie nicht tragen kann (verschränkt je Instanz, Morph, Stoff-Reihe);
    // das Nein gilt, bis Geometrie oder Stoff wechseln: kein Zug baut seine Zeichenketten neu.
    static _arenaSchluessel(m) {
        const geo = m.geometry,
            s = m.material,
            nein = m.__arenaNein;
        if (nein && nein.geo === geo && nein.s === s && nein.v === (s && s.version)) return null;
        let form = s && s.isNodeMaterial === true ? AnazhRealm._arenaForm(geo, true) : null;
        if (form === null) {
            m.__arenaNein = { geo, s, v: s && s.version };
            return null;
        }
        if (m.instanceColor) form += "farbe:" + m.instanceColor.itemSize;
        const w = m.__wahlGpu === true; // die Wahl der GPU (`_instanzWahlArt`) zieht in ihrer eigenen Arena
        return [form, m.layers.mask, m.castShadow, m.receiveShadow, m.renderOrder, w, AnazhRealm._arenaStoff(s)].join(
            "|"
        );
    }
    // Die Attribut-Form einer Geometrie, mit oder ohne Instanz-Größen — null: keine Geometrie, Morph oder verschränkt je Instanz.
    static _arenaForm(geo, mitInstanz) {
        if (!geo || (geo.morphAttributes && Object.keys(geo.morphAttributes).length)) return null;
        let form = "";
        for (const k of Object.keys(geo.attributes).sort()) {
            const a = geo.attributes[k];
            // ein verschränkter Puffer (die Vorlage des Gang-Satzes) trägt seine Spur: Versatz und Schritt
            const v = a.isInterleavedBufferAttribute ? a.data : null;
            if (!a.array || (v && v.isInstancedInterleavedBuffer)) return null;
            if (a.isInstancedBufferAttribute && !mitInstanz) continue;
            const t = a.array.constructor.name + (v ? "@" + a.offset + "/" + v.stride : "");
            form += k + ":" + a.itemSize + t + (a.normalized ? "n" : "") + (a.isInstancedBufferAttribute ? "I," : ",");
        }
        return form;
    }
    // Der Stoff als Wert: jede Eigenschaft (Knoten als id, Texturen als uuid, Funktionen über den Programm-Schlüssel des
    // Stoffs), die Stoff-Werte bis auf die Art-Größen des Winds — gemerkt je Stoff-Version.
    static _arenaStoff(s) {
        if (s.__arenaStoff && s.__arenaStoffV === s.version) return s.__arenaStoff;
        const J = AnazhRealm._arenaWert;
        let t = s.type + ";a" + s.alphaTest + ";p" + s.customProgramCacheKey();
        for (const k of Object.keys(s).sort()) {
            if (k.startsWith("__") || k === "_listeners" || k.startsWith("_anazh") || k === "uuid" || k === "id")
                continue;
            if (k === "name" || k === "version" || k === "userData" || typeof s[k] === "function") continue;
            t += ";" + k + "=" + J(s[k], 0);
        }
        const ud = Object.assign({}, s.userData);
        delete ud.windArt;
        delete ud.baumWind;
        s.__arenaStoff = t + ";ud" + J(ud, 0);
        s.__arenaStoffV = s.version;
        return s.__arenaStoff;
    }
    static _arenaWert(v, tiefe) {
        if (v === null || v === undefined) return "";
        const t = typeof v;
        if (t !== "object") return t === "function" ? "fn" : String(v);
        if (v.isNode) return "#" + v.id;
        if (v.isTexture || v.isObject3D || v.isMaterial || v.isBufferGeometry) return "@" + v.uuid;
        if (v.isColor) return "c" + v.getHexString();
        if (ArrayBuffer.isView(v)) return "[" + Array.prototype.slice.call(v, 0, 32).join(",") + "]";
        if (tiefe > 5) return "…";
        let r = Array.isArray(v) ? "[" : "{";
        for (const k of Array.isArray(v) ? v.keys() : Object.keys(v).sort())
            r += k + ":" + AnazhRealm._arenaWert(v[k], tiefe + 1) + ",";
        return r + (Array.isArray(v) ? "]" : "}");
    }
    // DER BRUCH DER ARENA: jeder Pfad meldet über den EINEN Melder (`_bruchMelden`), der erste gibt jedes Glied zurück
    _arenaBruch(e) {
        const text = "DIE GEOMETRIE-ARENA BRICHT: " + String((e && e.stack) || e).slice(0, 500);
        this._bruchMelden(text);
        if (AnazhRealm.__arenaBruch) return;
        AnazhRealm.__arenaBruch = text;
        for (const a of [...(AnazhRealm.__arenen || new Map()).values()])
            for (const m of a.glieder.slice()) a.lassen(m, true);
    }
    // Der Knoten der Art-Größen des Winds: trägt die Geometrie `aWindArt` (die Arena — dort die Marke ihres Speicher-Puffers,
    // nie ein gelesenes Attribut), liest er den Puffer je Instanz (`_senkenKnoten().windArt`), sonst den Stoff-Wert — EIN Wert
    // (der Stoff trägt ihn), zwei Wege dorthin, je Programm beim Bau entschieden.
    static _windArtKnoten(stoff) {
        if (!AnazhRealm.__windArtK) {
            const N = Object.getPrototypeOf(THREE.InstanceNode);
            AnazhRealm.__windArtK = class WindArt extends N {
                constructor(q) {
                    super("vec3");
                    this.stoffWert = q;
                }
                setup(builder) {
                    return builder.hasGeometryAttribute("aWindArt")
                        ? AnazhRealm._senkenKnoten().windArt
                        : this.stoffWert;
                }
            };
        }
        return THREE.TSL.nodeObject(new AnazhRealm.__windArtK(stoff));
    }
    static _arenaKlasse() {
        if (AnazhRealm.__arenaK) return AnazhRealm.__arenaK;
        const T = THREE;
        const IND = T.StorageInstancedBufferAttribute; // r184 legt jeden Puffer als Auftrags-Puffer an (`createIndirectStorageAttribute`)
        const fr = new T.Frustum(),
            pm = new T.Matrix4(),
            kugel = new T.Sphere();
        const EINS = new T.Matrix4().elements;
        const istEins = (e) => {
            for (let i = 0; i < 16; i++) if (e[i] !== EINS[i]) return false;
            return true;
        };
        // o[oi..] = a × b[bi..] (spaltenweise, wie three)
        const mal = (o, oi, a, b, bi) => {
            for (let c = 0; c < 4; c++) {
                const b0 = b[bi + c * 4],
                    b1 = b[bi + c * 4 + 1],
                    b2 = b[bi + c * 4 + 2],
                    b3 = b[bi + c * 4 + 3];
                for (let r = 0; r < 4; r++)
                    o[oi + c * 4 + r] = a[r] * b0 + a[4 + r] * b1 + a[8 + r] * b2 + a[12 + r] * b3;
            }
        };
        const vier = (n) => Math.ceil(n / 4) * 4; // jede Kapazität ein Vielfaches von 4 Elementen
        const WAHL = new T.BufferAttribute(new Float32Array(1), 1); // die Marke der Wahl der GPU (kein Shader liest sie)
        // DIE RESIDENZ FOLGT DEM BILD — auch in der Arena (Lehre 27, das Gesetz des Kehraus `_gpuKehraus`): sie hält eine
        // Gestalt, solange ein Glied sie mit Instanzen trägt, und einen Instanz-Platz je Instanz, die ein Glied zieht —
        // GPU_KEHRAUS_MS über das letzte Mal hinaus, dann wird ihr Platz frei. Befund 16.10. (Prüfung Runde 2 und Messung
        // G1-n2/vorher, Radeon, EINE Welt): die Arena hielt das 1,64- bis 2,07-Fache der Quellen, die der Kehraus freigab —
        // VRAM gegen A ohne Arena +1,3 bis +3,3 MB. Die Klasse: der Index immer 32 bit (Wiese 0,60 statt 0,27 MB), ein Viertel
        // Reserve und bis zu einem Viertel Brache im Lager, die Gestalten jeder je genommenen Senke (nach der Reise Genesis
        // 3,21 → 6,67 MB), die Instanz-Seite nach der Kapazität der Senken ×1,25 (Wiese 0,63 MB für 2 800 gezogene Instanzen)
        // — und die Matrizen jeder Quelle blieben daneben auf der GPU (0,49–0,51 MB). Der Platz-Raum (`raumNimm`/`raumGib`)
        // ist der EINE Verwalter beider Seiten; was frei wird, nimmt erst der nächste Takt (`spaet`): ein offener Pass (das
        // Hauptbild um den verschachtelten Schatten-Render) liest den alten Inhalt noch.
        const raumNimm = (frei, n) => {
            for (let k = 0; k < frei.length; k += 2) {
                if (frei[k + 1] < n) continue;
                const s = frei[k];
                if (frei[k + 1] === n) frei.splice(k, 2);
                else {
                    frei[k] += n;
                    frei[k + 1] -= n;
                }
                return s;
            }
            return -1;
        };
        const raumGib = (frei, s, n) => {
            let k = 0;
            while (k < frei.length && frei[k] < s) k += 2;
            frei.splice(k, 0, s, n);
            if (k + 2 < frei.length && s + n === frei[k + 2]) {
                frei[k + 1] += frei[k + 3];
                frei.splice(k + 2, 2);
            }
            if (k > 0 && frei[k - 2] + frei[k - 1] === s) {
                frei[k - 1] += frei[k + 1];
                frei.splice(k, 2);
            }
        };
        const raumSpaet = (frei, spaet) => {
            for (let k = 0; k < spaet.length; k += 2) raumGib(frei, spaet[k], spaet[k + 1]);
            spaet.length = 0;
        };
        // der Block eines Glieds: seine Zahl und ein Viertel darüber (eine Senke wächst Instanz um Instanz)
        const platz = (n) => (n > 0 ? vier(n + (n >> 2) + 4) : 0);
        // DIE QUELLE VERLÄSST DIE GPU: zog der Zeichner eines Glieds, bevor es eintrat, fallen seine Matrizen im Takt des
        // Eintritts (`_arenaTakt`) mit ihm (`_zeichnerFrisch`); jedes Bündel, das ihn trug, nimmt neu auf (`_arenaBuendel`).
        const quelleWeg = (m) => (AnazhRealm.__quelleWeg || (AnazhRealm.__quelleWeg = new Set())).add(m);
        // in die Warteschlange vor dem Submit dieses Passes über die EINE Wort-Schrift; ohne GPU-Puffer lädt r184 beim
        // ersten Zug das ganze Array
        // ein verschränkter Puffer liegt bei r184 unter seinen Daten (je Zug lädt EIN Attribut sie, `attributeCall`)
        const schreib = (rend, a, start, n) => {
            const be = rend && rend.backend;
            const v = a && a.isInterleavedBufferAttribute ? a.data : null;
            if (!be || !be.device || !a || n <= 0 || !(v ? be.has(v) : rend._attributes.has(a))) return;
            const q = v || a;
            const d = be.get(q),
                b = q.array.BYTES_PER_ELEMENT;
            if (d.buffer) AnazhRealm._schreibWorte(be.device.queue, d.buffer, q.array, start * b, (start + n) * b);
        };
        // ein Puffer fällt erst nach dem Submit des Frames: ein offener Pass (das Hauptbild um den verschachtelten
        // Schatten-Render) trägt ihn noch in seinem Kommando-Paket („used in submit while destroyed")
        const weg = (rend, a) => {
            const A = rend && rend._attributes;
            if (!a || !A || !A.has(a)) return;
            const w = AnazhRealm.__arenaWeg || (AnazhRealm.__arenaWeg = []);
            if (w.push({ A, a }) === 1)
                setTimeout(() => {
                    AnazhRealm.__arenaWeg = null;
                    for (const x of w) if (x.A.has(x.a)) x.A.delete(x.a);
                }, 0);
        };
        // der Stand einer Gestalt — ohne die Sprünge ihres GPU-Abschieds (`_gpuAbschied` hebt die Version, der Inhalt bleibt)
        const stand = (g) => {
            const v = (a) => (a ? a.version - (a.__abschiede | 0) : 0);
            return v(g.attributes.position) * 65536 + v(g.index);
        };
        // DAS LAGER einer Vertex-Form in einer Szene: die Gestalten aller Arenen dieser Form in EINEM Vertex- und Index-Puffer.
        // Eine Gestalt liegt, solange ein Glied sie mit Instanzen trägt (`halten`, gestempelt im Takt und in jedem Zug), in der
        // ersten freien Strecke, die passt; GPU_KEHRAUS_MS nach dem letzten Stempel räumt sie ihre Strecken. Reicht keine
        // Strecke oder liegt mehr als ein Achtel frei, baut der Takt das Lager neu — so groß wie seine liegenden Gestalten und
        // ein Sechzehntel —, und jede Arena zeigt ihre Geometrie im selben Takt darauf (`_geoNeu`, ihr Bündel nimmt neu auf),
        // bevor die alten Puffer fallen; nie in einem Pass (r184 zeichnet ihn mit der Geometrie, die er projizierte). Der Index
        // ist schmal (16 bit), solange keine Gestalt mehr als 65 536 Vertices trägt: jede zieht mit ihrem Basis-Vertex, ihre
        // Indizes bleiben ihre eigenen (die Foundry liefert sie so, `_schmalerIndex`; r184 bindet das Format nach dem Typ).
        class Lager {
            constructor(key) {
                this.key = key;
                this.gestalten = new Map(); // Positions-Id:Index-Id → { geo, bv, fi, nv, ni, nutzer, stand, zuletzt }
                this.attr = null;
                this.index = null;
                this.vCap = this.iCap = this.liegt = this.iLiegt = 0;
                this.vFrei = [];
                this.iFrei = [];
                this.spaet = []; // geräumte Strecken [Vertex-Anfang, Länge, Index-Anfang, Länge, …] bis zum nächsten Takt
                this.neu = true;
                this.taktT = -1;
                this.arenen = new Set();
                this.rend = null;
            }
            nehmen(g) {
                const p = g.attributes.position;
                const key = p.id + ":" + (g.index ? g.index.id : -1);
                const b = this.gestalten.get(key);
                if (b) b.nutzer++;
                else {
                    const nv = p.count;
                    this.gestalten.set(key, {
                        geo: g,
                        bv: -1,
                        fi: -1,
                        nv,
                        ni: g.index ? g.index.count : nv,
                        nutzer: 1,
                        stand: stand(g),
                        zuletzt: -Infinity,
                    });
                }
                return key;
            }
            lassen(key) {
                const b = this.gestalten.get(key);
                if (!b || --b.nutzer > 0) return;
                this.gestalten.delete(key);
                this.raeumen(b);
            }
            raeumen(b) {
                if (b.bv < 0) return;
                this.spaet.push(b.bv, b.nv, b.fi, b.ni);
                this.liegt -= b.nv;
                this.iLiegt -= b.ni;
                b.bv = b.fi = -1;
            }
            // ein Glied mit Instanzen zieht die Gestalt: sie liegt (oder legt sich in die erste freie Strecke, die passt);
            // false — kein Platz, der nächste Takt baut neu
            halten(b, jetzt) {
                b.zuletzt = jetzt;
                if (b.bv >= 0) return true;
                if (this.attr && (b.nv <= 65536 || this.index.array instanceof Uint32Array)) {
                    const bv = raumNimm(this.vFrei, b.nv);
                    const fi = bv < 0 ? -1 : raumNimm(this.iFrei, b.ni);
                    if (fi >= 0) {
                        b.bv = bv;
                        b.fi = fi;
                        this.liegt += b.nv;
                        this.iLiegt += b.ni;
                        this.kopie(b);
                        return true;
                    }
                    if (bv >= 0) raumGib(this.vFrei, bv, b.nv);
                }
                this.neu = true;
                return false;
            }
            // im Takt (vor jedem Pass des Frames), einmal je Frame: räumen, was GPU_KEHRAUS_MS kein Glied zog, und die Strecken
            // des letzten Frames freigeben
            takt(rend, jetzt) {
                this.rend = rend;
                if (this.taktT === jetzt) return;
                this.taktT = jetzt;
                const grenze = jetzt - AnazhRealm.GPU_KEHRAUS_MS;
                for (const b of this.gestalten.values()) if (b.bv >= 0 && b.zuletzt < grenze) this.raeumen(b);
                for (let k = 0; k < this.spaet.length; k += 4) {
                    raumGib(this.vFrei, this.spaet[k], this.spaet[k + 1]);
                    raumGib(this.iFrei, this.spaet[k + 2], this.spaet[k + 3]);
                }
                this.spaet.length = 0;
            }
            // im Takt, nachdem die Glieder ihre Gestalten hielten: neu bauen, wenn der Platz nicht reichte oder mehr als ein
            // Achtel frei liegt
            ordnen(jetzt) {
                const brach =
                    this.vCap - this.liegt > (this.vCap >> 3) + 256 || this.iCap - this.iLiegt > (this.iCap >> 3) + 768;
                if ((this.neu || brach) && this.gestalten.size > 0) this.bauen(jetzt - AnazhRealm.GPU_KEHRAUS_MS);
            }
            kopie(b) {
                const q = b.geo,
                    fertig = new Set();
                for (const k in this.attr) {
                    const a = this.attr[k];
                    const v = a.isInterleavedBufferAttribute ? a.data : null,
                        s = v ? v.stride : a.itemSize;
                    if (fertig.has(v || a)) continue; // ein verschränkter Puffer kopiert einmal, mit allen seinen Attributen
                    fertig.add(v || a);
                    (v || a).array.set(q.attributes[k].array.subarray(0, b.nv * s), b.bv * s);
                    schreib(this.rend, a, b.bv * s, b.nv * s);
                }
                const ix = this.index.array;
                if (q.index) ix.set(q.index.array.subarray(0, b.ni), b.fi);
                else for (let i = 0; i < b.ni; i++) ix[b.fi + i] = i;
                schreib(this.rend, this.index, b.fi, b.ni);
            }
            bauen(grenze) {
                const altA = this.attr || {},
                    altI = this.index;
                let nv = 0,
                    ni = 0,
                    v0 = null,
                    breit = false;
                for (const b of this.gestalten.values()) {
                    v0 = v0 || b.geo;
                    b.bv = b.fi = -1;
                    if (b.zuletzt < grenze) continue;
                    nv += b.nv;
                    ni += b.ni;
                    if (b.nv > 65536) breit = true;
                }
                this.vCap = vier(nv + (nv >> 4) + 64);
                this.iCap = vier(ni + (ni >> 4) + 192);
                this.attr = {};
                const daten = new Map(); // je verschränkter Puffer der Vorlage seiner im Lager
                for (const k in v0.attributes) {
                    const a = v0.attributes[k];
                    if (a.isInstancedBufferAttribute) continue;
                    const v = a.isInterleavedBufferAttribute ? a.data : null;
                    if (v) {
                        if (!daten.has(v))
                            daten.set(
                                v,
                                new T.InterleavedBuffer(new v.array.constructor(this.vCap * v.stride), v.stride)
                            );
                        this.attr[k] = new T.InterleavedBufferAttribute(
                            daten.get(v),
                            a.itemSize,
                            a.offset,
                            a.normalized
                        );
                        continue;
                    }
                    const arr = new a.array.constructor(this.vCap * a.itemSize);
                    this.attr[k] = new T.BufferAttribute(arr, a.itemSize, a.normalized);
                }
                this.index = new T.BufferAttribute(breit ? new Uint32Array(this.iCap) : new Uint16Array(this.iCap), 1);
                this.vFrei = [0, this.vCap];
                this.iFrei = [0, this.iCap];
                this.spaet.length = 0;
                this.liegt = this.iLiegt = 0;
                this.neu = false;
                for (const b of this.gestalten.values()) if (b.zuletzt >= grenze) this.halten(b, b.zuletzt);
                AnazhRealm.__lagerBau = (AnazhRealm.__lagerBau | 0) + 1;
                // eine Arena ohne Instanz-Seite legt sie in ihrem eigenen Ordnen an, nach den Blöcken ihrer Glieder
                for (const a of this.arenen) if (a.__instanzQuelle.instanceMatrix) a._geoNeu();
                for (const k in altA) weg(this.rend, altA[k]);
                weg(this.rend, altI);
            }
            fallen() {
                const L = AnazhRealm.__lager;
                if (L && L.get(this.key) === this) L.delete(this.key);
                for (const k in this.attr || {}) weg(this.rend, this.attr[k]);
                weg(this.rend, this.index);
            }
        }
        class GeometrieArena extends T.Mesh {
            // das Lager der Vertex-Form einer Geometrie in ihrer Szene (`_arenaForm` ohne Instanz-Größen)
            static lager(szene, geo) {
                const L = AnazhRealm.__lager || (AnazhRealm.__lager = new Map());
                const key = szene.uuid + "|" + AnazhRealm._arenaForm(geo, false);
                let l = L.get(key);
                if (!l) L.set(key, (l = new Lager(key)));
                return l;
            }
            constructor(key, schl, m, lager, nCap) {
                super(new T.InstancedBufferGeometry(), m.material);
                this.name = "geometrie-arena";
                this.isInstanzZeichner = true;
                this.isGeometrieArena = true;
                this.__key = key;
                this.__schl = schl;
                this.__instanzQuelle = { isInstancedMesh: true, instanceMatrix: null, instanceColor: null, count: 0 };
                this.__instanzQuelle.matrixWorld = this.matrixWorld;
                // DIE INSTANZ-FARBE (A11): r184 multipliziert `vInstanceColor` nur in die Farbe eines Objekts, das selbst
                // `instanceColor` trägt (NodeMaterial.setupDiffuseColor, vendor gelesen) — die Arena trägt die Farben ihrer
                // Glieder in `instanzFarbe`, hielt aber keinen Halter: seit G1 fiel der Tint jeder Senke (Büschel der
                // Nah-Wiese, Kronen-Karten, Sterne), Mess-Wiese Ego farbtonStreuung 11,06 → 8,91.
                Object.defineProperty(this, "instanceColor", {
                    get: () => this.geometry.attributes.instanzFarbe || null,
                    configurable: true,
                });
                this.layers.mask = m.layers.mask;
                this.castShadow = m.castShadow;
                this.receiveShadow = m.receiveShadow;
                this.renderOrder = m.renderOrder;
                this.frustumCulled = false;
                this.matrixAutoUpdate = false;
                this.matrixWorldAutoUpdate = false;
                this._wind = !!(m.material.userData && m.material.userData.windArt);
                this._wahl = m.__wahlGpu === true; // die Wahl der GPU: die Zahl jedes Zugs zählt der Compute (`_instanzWahlGpu`)
                this._marke = m.__zeichner.__fassade.attributes.aInstanzSenke;
                this._lager = lager;
                lager.arenen.add(this);
                this.glieder = [];
                // die Instanz-Seite: je Glied ein Block nach seiner Zahl (`_blockFuer`) im Platz-Raum; vor dem ersten Zug wächst
                // sie frei, danach folgt eine Arena (`_folgen`), wenn der Platz nicht reicht oder mehr als die Hälfte frei liegt
                this._nCap = vier(nCap);
                this._nFrei = this._nCap > 0 ? [0, this._nCap] : [];
                this._nSpaet = [];
                this._nBelegt = 0;
                // die Senken ohne Platz auf der Instanz-Seite: ihnen folgt eine größere Arena (`_folgen`), einmal gezählt
                this._wartend = new Set();
                // die Glieder mit Instanzen: ohne eines betritt die Arena keinen Pass (die Instanz-Zahl zaehlt mit)
                this._lebend = 0;
                // DER EINE AUFTRAGS-PUFFER (`_ind`): je Pass-Kamera (lose) und je aufnehmender Kamera (Bündel) ein Abschnitt
                this._ind = null;
                this._segCap = this._segZahl = this._segN = 0;
                this._segFrei = [];
                this._zuege = new Map(); // Kamera → Zug { seg, arr, offs, zuege, tri, plaetze } — je Pass neu geschrieben
                this._zuegeB = new Map(); // Kamera → der Zug, den ein Bündel aufnahm (seine Plätze schreibt der Takt)
                this.__buendel = null;
                this._fest = false;
                this._stapel = [];
                this._rend = null;
                this._folgt = false;
                this._fassade(this.geometry);
            }
            // r184 liest Auftrags-Puffer, Versätze und Zahl am Zug: den EINEN Puffer, die Versätze des Passes, der gerade zeichnet
            _fassade(g) {
                const a = this;
                const jetzt = () => a._stapel[a._stapel.length - 1] || null;
                delete g.indirect;
                delete g.indirectOffset;
                delete g.instanceCount;
                Object.defineProperties(g, {
                    indirect: { get: () => a._ind, set: () => {}, configurable: true },
                    indirectOffset: { get: () => (jetzt() ? jetzt().offs : 0), set: () => {}, configurable: true },
                    instanceCount: {
                        get: () => (jetzt() && jetzt().offs.length ? 1 : 0),
                        set: () => {},
                        configurable: true,
                    },
                });
                g.setDrawRange(0, 3); // r184 bucht EINEN Zug mit einem Dreieck; den Rest bucht `onAfterRender`
                g.boundingSphere = new T.Sphere(new T.Vector3(), Infinity);
            }
            nehmen(m) {
                // nach dem ersten Zug wächst die Instanz-Seite nicht mehr: reicht ihr Platz nicht, folgt eine Arena mit Platz
                // für den Bedarf
                if (this.__instanzQuelle.instanceMatrix && !this._nPasst(platz(m.count | 0))) {
                    this._wartend.add(m);
                    return void this._folgen();
                }
                this._wartend.delete(m);
                // die Glieder zeichnen nach ihrer Stufe (die nahe zuerst schreibt die Tiefe, `_buendelKinderReihe`)
                const stufe = (o) =>
                    o.userData && Number.isFinite(o.userData.buendelStufe) ? o.userData.buendelStufe : 0;
                let i = this.glieder.length;
                while (i > 0 && stufe(this.glieder[i - 1]) > stufe(m)) i--;
                this.glieder.splice(i, 0, m);
                this.userData.buendelStufe = stufe(this.glieder[0]);
                m.__arena = this;
                m.__arenaZ = {
                    mat: m.material,
                    mv: m.material.version,
                    farbe: !!m.instanceColor,
                    mw: new Float32Array(16),
                    im: m.instanceMatrix,
                    erst: -1, // der Block auf der Instanz-Seite (`_blockFuer`)
                    cap: 0,
                    n: -1,
                    stempel: [],
                    spitze: 0, // die größte Zahl dieses und des letzten Fensters (GPU_KEHRAUS_MS)
                    spitzeVor: 0,
                    spitzeT: AnazhRealm.__arenaJetzt || 0,
                };
                m.__arenaZ.mw[0] = NaN;
                if ((m.count | 0) > 0) this._lebend++;
                this._sicht();
                this._gestaltNehmen(m);
                if (m.__zeichner.parent === m) m.remove(m.__zeichner); // die Senke zeichnet nicht mehr selbst
                quelleWeg(m);
                // das Bündel nimmt neu auf: es trug den Zeichner (auch wenn es gerade aufnimmt — `_neuAuf`)
                AnazhRealm._arenaBuendel(m);
                this._neuAuf();
            }
            lassen(m, zurueck) {
                const i = this.glieder.indexOf(m);
                if (i < 0) return;
                this.glieder.splice(i, 1);
                const za = m.__arenaZ;
                this._lager.lassen(za.gestalt);
                if (za.erst >= 0) {
                    this._nSpaet.push(za.erst, za.cap);
                    this._nBelegt -= za.cap;
                }
                if ((m.count | 0) > 0) this._lebend--;
                this._sicht();
                // seine Plätze ziehen ab jetzt nichts (der nächste Takt verdichtet sie) — kein Frame zeigt ein gegangenes Glied
                for (const z of [...this._zuege.values(), ...this._zuegeB.values()]) {
                    const j = z.zuege.indexOf(m);
                    if (j < 0) continue;
                    z.zuege[j] = this;
                    z.arr[j * 5 + 1] = 0;
                    schreib(this._rend, this._ind, z.seg * this._segCap * 5 + j * 5 + 1, 1);
                }
                m.__arena = null;
                m.__arenaZ = null;
                if (zurueck && m.__zeichner && m.__zeichner.parent !== m) {
                    m.add(m.__zeichner);
                    AnazhRealm._arenaBuendel(m);
                    this._neuAuf();
                    AnazhRealm._arenaMelden(m); // im nächsten Takt in die Arena ihres (neuen) Wirts
                }
                if (this.glieder.length === 0) this._fallen();
            }
            // Im Bündel (`__buendel`) nimmt es die Arena auf; zeichnet sie im Hauptbild (Ebene 0), bleibt sie sichtbar, solange
            // sie Glieder trägt — ein Wechsel der Sicht nähme das Bündel neu auf. Sonst betritt sie nur einen Pass, in dem ein
            // Glied Instanzen zählt (die Instanz-Zahl zählt mit, `_instanzZahl`).
            _imBuendel(b) {
                this.__buendel = b;
                this._fest = !!b && (this.layers.mask & 1) !== 0;
                // die Werfer-Wahl je Kaskade urteilt über die Glieder (ihre Sicht liest `_sichtbar`), nie über die Arena
                if (b)
                    this.userData._werferKind = new T.Box3(
                        new T.Vector3(-1e7, -1e7, -1e7),
                        new T.Vector3(1e7, 1e7, 1e7)
                    );
            }
            _sicht() {
                this.visible = this._fest ? this.glieder.length > 0 : this._lebend > 0;
            }
            // Das Bündel nimmt neu auf — sofort und im nächsten Takt (`_arenaTakt`, auch wenn die Arena dabei fällt): r184 merkt
            // sich am Ende einer Aufnahme die Version des Bündels, ein Wechsel MITTEN in ihr ginge sonst unter.
            _neuAuf() {
                const b = this.__buendel;
                if (!b) return;
                b.needsUpdate = true;
                (AnazhRealm.__arenaAuf || (AnazhRealm.__arenaAuf = new Set())).add(b);
            }
            // der Takt (`_arenaTakt`): Glieder abgleichen; die aufgenommenen Plätze lesen Zahl, Wahl und Matrizen von JETZT
            // in zwei Gängen über alle Arenen (`_arenaTakt`): erst ordnen jede ihre Glieder und ihr Lager (ein Neubau zeigt jede
            // Arena des Lagers neu), dann schreiben die Bündel-Arenen ihre Aufträge — auf die Lage, die dieser Frame zeichnet
            _takt(auftraege) {
                if (!this._rend) return;
                if (!auftraege) return void (this._bereit = this._ordnen(this._rend, true));
                if (this._bereit && this.glieder.length)
                    for (const z of this._zuegeB.values()) this._auftraege(z, null, this._rend, false);
            }
            // DIE WAHL DER GPU VOR DEM PASS (`_instanzWahlGpu`, im Haken des Passes vor seinem Encoder): Glieder abgleichen, die
            // Aufträge dieser Kamera schreiben, die Liste so groß wie ihre Abschnitte — ihr Zug (`_arenaZug`) nimmt sie. Die
            // Liste liegt ab ihrer Geburt auf der GPU: rechnete in ihrem Frame kein Zug (jedes Glied außer Sicht), fand ein Leser
            // nach dem Frame (der Band-Zähler, die Blick-Sonde) eine Liste ohne Puffer („reading 'size'").
            _wahlVor(rend, camera) {
                this._rend = rend;
                if (!this._ordnen(rend, false)) return null;
                const zug = this._zugFuer(camera, false),
                    q = this.__instanzQuelle;
                if (!q.liste || q.liste.array.length < this._segZahl * this._nCap) {
                    weg(rend, q.liste);
                    q.liste = new IND(new Uint32Array(this._segZahl * this._nCap), 1);
                    rend._attributes.update(q.liste, 3); // r184 AttributeType.STORAGE
                }
                this._auftraege(zug, camera, rend, false);
                zug.bereit = true;
                return zug;
            }
            // DER ABSCHIED: durch das Bündel (`_archBundleSceneRemove`) — wird es leer, verlässt es mit seinem Verdeckungs-
            // Proxy Szene und Register. Befund 16.10. (Prüfung, Reise Wiese → Dorf): die Arena nahm sich still aus ihrem
            // Bündel, das leere Bündel blieb samt Proxy in Szene und `_regionBundles` (1 → 5 leer, ohne Arena 0).
            _fallen() {
                const reg = AnazhRealm.__arenen;
                if (reg && reg.get(this.__key) === this) reg.delete(this.__key);
                const p = this.parent,
                    welt = globalThis.anazhRealm,
                    B = welt && welt.state._regionBundles;
                if (p && p.isBundleGroup && B && B.get(p.userData.regionKey) === p) welt._archBundleSceneRemove(this);
                else if (p) p.remove(this);
                this._neuAuf();
                this._lager.arenen.delete(this);
                if (this._lager.arenen.size === 0) this._lager.fallen();
                // die Instanz-Seite und der Auftrags-Puffer gehören ihr, die Vertex-Puffer dem Lager
                const G = this.geometry.attributes;
                for (const k in G) if (G[k].isInstancedBufferAttribute) weg(this._rend, G[k]);
                weg(this._rend, this.__instanzQuelle.instanceMatrix);
                weg(this._rend, this.__instanzQuelle.liste);
                weg(this._rend, this._ind);
                this._zuege.clear();
                this._zuegeB.clear();
                // ihre Bindegruppen (Uniform-Puffer) fallen nach dem Submit des Frames, wie jeder Puffer der Arena
                setTimeout(() => AnazhRealm._renderObjekteLoesen(this), 0);
            }
            _gestaltNehmen(m) {
                const g = m.geometry,
                    z = m.__arenaZ;
                z.geo = g;
                z.pos = g.attributes.position;
                z.idx = g.index;
                z.gestalt = this._lager.nehmen(g);
            }
            // die Geometrie der Arena: die Puffer ihres Lagers, die Marke des Zeichners und ihre Instanz-Seite
            _geoNeu() {
                const L = this._lager;
                if (!this.glieder.length || !L.attr) return;
                const alt = this.geometry,
                    g = new T.InstancedBufferGeometry();
                for (const k in L.attr) g.setAttribute(k, L.attr[k]);
                g.setAttribute("aInstanzSenke", this._marke);
                if (this._wahl) g.setAttribute("aWahl", WAHL);
                this._instanzSeite(g, alt);
                g.setIndex(L.index);
                this._fassade(g);
                this.geometry = g;
                this._neuAuf(); // neue Vertex-/Index-Puffer
            }
            // DIE INSTANZ-SEITE: je Glied ein Block nach seiner Zahl (`_blockFuer`) — den Speicher-Puffer der Matrizen bindet
            // r184 in die Bindegruppe jedes Render-Objekts: die Arena tauscht ihn nie. Ein Block zieht um, wenn die Zahl über
            // ihn wächst oder er das Doppelte seines Bedarfs hält; sein alter Platz wird erst im nächsten Takt frei (ein offener
            // Pass zeichnet aus ihm). Reicht der Platz nicht oder liegt die Hälfte frei, folgt ihr nach dem Frame eine Arena
            // desselben Stoffs (`_folgen`). Beim Anlegen trägt sie über ihre Blöcke ein Achtel.
            _instanzSeite(g, alt) {
                const m0 = this.glieder[0],
                    q = this.__instanzQuelle;
                if (q.instanceMatrix) {
                    for (const k in alt.attributes)
                        if (alt.attributes[k].isInstancedBufferAttribute) g.setAttribute(k, alt.attributes[k]);
                    return;
                }
                const zu = vier((this._nBelegt >> 3) + 64) - (this._nCap - this._nBelegt);
                if (zu > 0) {
                    raumGib(this._nFrei, this._nCap, zu);
                    this._nCap += zu;
                }
                // in der Wahl liest der Shader jede Instanz-Größe am Index ihrer Liste: ein Speicher-Puffer (`_senkenKnoten`)
                const K = this._wahl ? T.StorageInstancedBufferAttribute : T.InstancedBufferAttribute;
                const neu = (k, a) =>
                    g.setAttribute(
                        k,
                        new K(new a.array.constructor(this._nCap * a.itemSize), a.itemSize, a.normalized)
                    );
                for (const k in m0.geometry.attributes)
                    if (m0.geometry.attributes[k].isInstancedBufferAttribute) neu(k, m0.geometry.attributes[k]);
                if (m0.instanceColor) neu("instanzFarbe", m0.instanceColor);
                q.gang = g.attributes.aGang || null;
                q.instanceMatrix = new T.StorageInstancedBufferAttribute(new Float32Array(this._nCap * 16), 16);
                // die Art-Größen des Winds: ein Speicher-Puffer wie die Matrizen (`_senkenKnoten().windArt`), in der Geometrie
                // nur die Marke, die das Programm der Arena vom Programm des Zeichners trennt (kein Shader liest sie als Attribut)
                if (this._wind) {
                    q.windArt = new T.StorageInstancedBufferAttribute(new Float32Array(this._nCap * 4), 4);
                    g.setAttribute("aWindArt", q.windArt);
                }
            }
            _nPasst(n) {
                if (n <= 0 || !this.__instanzQuelle.instanceMatrix) return true;
                for (let k = 1; k < this._nFrei.length; k += 2) if (this._nFrei[k] >= n) return true;
                return false;
            }
            // Der Block eines Glieds folgt seiner Zahl über ein Fenster (die größte Zahl dieses und des letzten Fensters von
            // GPU_KEHRAUS_MS: die Wahl des Hauptbilds wechselt mit dem Blick, der Block nicht). false: kein Platz.
            _blockFuer(z, n, jetzt) {
                if (jetzt - z.spitzeT >= AnazhRealm.GPU_KEHRAUS_MS) {
                    z.spitzeVor = z.spitze;
                    z.spitze = 0;
                    z.spitzeT = jetzt;
                }
                if (n > z.spitze) z.spitze = n;
                const soll = platz(Math.max(z.spitze, z.spitzeVor));
                if (z.erst >= 0 ? n <= z.cap && z.cap <= 2 * soll : soll === 0) return true;
                if (z.erst >= 0) {
                    this._nSpaet.push(z.erst, z.cap);
                    this._nBelegt -= z.cap;
                    z.erst = -1;
                    z.cap = 0;
                    if (soll === 0) return true;
                }
                let e = raumNimm(this._nFrei, soll);
                // vor dem ersten Zug wächst die Instanz-Seite frei
                if (e < 0 && !this.__instanzQuelle.instanceMatrix) {
                    raumGib(this._nFrei, this._nCap, soll);
                    this._nCap += soll;
                    e = raumNimm(this._nFrei, soll);
                }
                if (e < 0) return false;
                z.erst = e;
                z.cap = soll;
                z.n = -1;
                z.stempel = [];
                this._nBelegt += soll;
                return true;
            }
            _folgen() {
                if (this._folgt) return;
                this._folgt = true;
                setTimeout(() => {
                    const reg = AnazhRealm.__arenen;
                    if (!reg || reg.get(this.__key) !== this || !this.parent || !this.glieder.length) return;
                    // der Bedarf: jedes Glied mit seinem Block, jede wartende Senke mit ihrer Zahl von JETZT — jede einmal gezählt,
                    // und ein Achtel darüber
                    let n = 0;
                    for (const m of this.glieder) n += Math.max(m.__arenaZ.cap, platz(m.count | 0));
                    for (const m of this._wartend) if (!m.__arena && m.parent) n += platz(m.count | 0);
                    this._wartend.clear();
                    AnazhRealm.__arenaFolgen = (AnazhRealm.__arenaFolgen | 0) + 1;
                    const a = new GeometrieArena(
                        this.__key,
                        this.__schl,
                        this.glieder[0],
                        this._lager,
                        n + (n >> 3) + 64
                    );
                    a._imBuendel(this.__buendel);
                    a._rend = this._rend;
                    reg.set(this.__key, a);
                    this.parent.add(a);
                    // die Gestalten bleiben im Lager: die Folgerin nimmt sie, bevor die Arena sie lässt
                    for (const m of this.glieder.splice(0)) {
                        const g = m.__arenaZ.gestalt;
                        m.__arena = null;
                        a.nehmen(m);
                        this._lager.lassen(g);
                    }
                    this._fallen();
                }, 0);
            }
            // Gehört das Glied noch hierher? 0 ja · 2 sein Stoff-Schlüssel wechselte (es geht in eine andere Arena) · 3 kein
            // Platz für seine Instanzen · 4 es verließ den Wirt der Arena (ein Bündel räumte es, es zog um)
            _pruefen(m) {
                let p = m.parent;
                while (p && p !== this.parent) p = p.parent;
                if (!p) return 4;
                const z = m.__arenaZ,
                    g = m.geometry,
                    s = m.material;
                if (
                    s !== z.mat ||
                    s.version !== z.mv ||
                    g !== z.geo ||
                    !!m.instanceColor !== z.farbe ||
                    m.layers.mask !== this.layers.mask ||
                    m.castShadow !== this.castShadow ||
                    m.receiveShadow !== this.receiveShadow ||
                    m.renderOrder !== this.renderOrder
                ) {
                    if (AnazhRealm._arenaSchluessel(m) !== this.__schl) return 2;
                    z.mat = s;
                    z.mv = s.version;
                    z.farbe = !!m.instanceColor;
                    z.stempel = []; // die Art-Größen des neuen Stoffs
                }
                if (g !== z.geo || g.attributes.position !== z.pos || g.index !== z.idx) {
                    const alt = z.gestalt;
                    this._gestaltNehmen(m);
                    this._lager.lassen(alt);
                } else {
                    const b = this._lager.gestalten.get(z.gestalt);
                    if (b.stand !== stand(g)) {
                        b.stand = stand(g);
                        if (b.bv >= 0) this._lager.neu = true; // die liegende Gestalt änderte ihren Inhalt: das Lager kopiert neu
                    }
                }
                if (m.instanceMatrix !== z.im) {
                    z.im = m.instanceMatrix; // die Senke wuchs: ihr Block kopiert ganz neu
                    z.n = -1;
                    z.stempel = [];
                }
                // zurück zum Zeichner, bis die größere Arena steht
                if (!this._blockFuer(z, m.count | 0, AnazhRealm.__arenaJetzt || 0)) return 3;
                return 0;
            }
            _sichtbar(m, renderer) {
                if (m.visible === false) return false;
                let p = m.parent;
                while (p && p !== this.parent) {
                    if (p.visible === false) return false;
                    if (p.occlusionTest === true && renderer.isOccluded(p)) return false;
                    p = p.parent;
                }
                return p === this.parent;
            }
            // der Block eines Glieds: kopiert, wenn eine seiner Instanz-Größen eine neue Version trägt, die Zahl wuchs oder
            // die Welt-Matrix der Senke wechselte (die Matrizen tragen sie, die Arena steht im Ursprung)
            _block(m, z, n) {
                // ein frischer Block trägt zuerst die Art-Größen des Winds aus dem Stoff seines Glieds (je Instanz gleich)
                if (this._wind && z.stempel.length === 0) {
                    const art = m.material.userData.windArt,
                        wa = this.__instanzQuelle.windArt;
                    for (let i = z.erst * 4; i < (z.erst + z.cap) * 4; i += 4) {
                        wa.array[i] = art ? art.x : 1;
                        wa.array[i + 1] = art ? art.y : 0;
                        wa.array[i + 2] = art ? art.z : 0;
                    }
                    schreib(this._rend, wa, z.erst * 4, z.cap * 4);
                }
                const im = m.instanceMatrix,
                    q = m.geometry.attributes,
                    c = m.instanceColor,
                    st = z.stempel,
                    mw = m.matrixWorld.elements;
                let neu = n > z.n || st[0] !== im.version,
                    k = 1;
                for (let i = 0; i < 16; i++)
                    if (z.mw[i] !== mw[i]) {
                        z.mw.set(mw);
                        neu = true;
                        break;
                    }
                for (const nm in q) {
                    const a = q[nm];
                    if (!a.isInstancedBufferAttribute) continue;
                    if (st[k] !== a || st[k + 1] !== a.version) neu = true;
                    st[k++] = a;
                    st[k++] = a.version;
                }
                if (c && st[k] !== c.version) neu = true;
                if (c) st[k] = c.version;
                st[0] = im.version;
                if (!neu) return;
                z.n = n;
                const e = z.erst,
                    G = this.geometry,
                    M = this.__instanzQuelle.instanceMatrix;
                if (istEins(mw)) M.array.set(im.array.subarray(0, n * 16), e * 16);
                else for (let i = 0; i < n; i++) mal(M.array, (e + i) * 16, mw, im.array, i * 16);
                schreib(this._rend, M, e * 16, n * 16);
                for (const nm in q) {
                    const a = q[nm];
                    if (!a.isInstancedBufferAttribute) continue;
                    const d = G.attributes[nm];
                    d.array.set(a.array.subarray(0, n * a.itemSize), e * a.itemSize);
                    schreib(this._rend, d, e * a.itemSize, n * a.itemSize);
                }
                if (c) {
                    const d = G.attributes.instanzFarbe;
                    d.array.set(c.array.subarray(0, n * c.itemSize), e * c.itemSize);
                    schreib(this._rend, d, e * c.itemSize, n * c.itemSize);
                }
            }
            // der Zug je Kamera — lose je Pass, im Bündel die aufgenommenen Plätze —, jeder ein Abschnitt des EINEN
            // Auftrags-Puffers, so lang wie die Glieder
            _zugFuer(camera, fest) {
                const reg = fest ? this._zuegeB : this._zuege;
                let z = reg.get(camera);
                if (!z) {
                    if (reg.size >= 16) {
                        const [k0, z0] = reg.entries().next().value;
                        this._segFrei.push(z0.seg);
                        reg.delete(k0);
                    }
                    const seg = this._segFrei.length ? this._segFrei.pop() : this._segN++;
                    z = { seg, arr: null, offs: [], zuege: [], tri: 0, plaetze: 0 };
                    reg.set(camera, z);
                }
                if (this.glieder.length > this._segCap || this._segN > this._segZahl) this._indNeu();
                else if (!z.arr) z.arr = this._ansicht(z.seg);
                return z;
            }
            _ansicht(seg) {
                const L = this._segCap * 5;
                return this._ind.array.subarray(seg * L, (seg + 1) * L);
            }
            // der Auftrags-Puffer wächst (mehr Glieder oder Kameras): die Abschnitte ziehen um, das Bündel nimmt neu auf. In
            // der Wahl der GPU zählt der Compute die Zahl jedes Zugs nur in den Puffer: wüchse er mitten im Frame (die erste
            // Kaskade nach dem Hauptbild), zöge ein Zug, den eine frühere Kamera rechnete, aus dem neuen mit Zahl 0 — darum
            // trägt er dort Abschnitte für drei weitere Kameras (Hauptbild und zwei Kaskaden wachsen nie mitten im Frame).
            _indNeu() {
                const alt = this._ind,
                    altCap = this._segCap;
                this._segCap = Math.max(this._segCap, Math.ceil(this.glieder.length * 1.5), 8);
                this._segZahl = Math.max(this._segZahl, this._segN) + (this._wahl ? 3 : 1);
                this._ind = new IND(new Uint32Array(this._segZahl * this._segCap * 5), 1);
                for (const z of [...this._zuege.values(), ...this._zuegeB.values()]) {
                    const neu = this._ansicht(z.seg);
                    if (z.arr) neu.set(z.arr.subarray(0, Math.min(altCap, this._segCap) * 5));
                    z.arr = neu;
                }
                // er liegt sofort auf der GPU: r184 lädt ihn nur beim Auffrischen des Render-Objekts, und die Observer-Diät
                // sieht `indirect` nicht (Befund 16.10., G1-n2: der Zug fand keinen Puffer, „drawIndexedIndirect … not of
                // type GPUBuffer", der Render brach ab). 4 = r184 AttributeType.INDIRECT (vendor `Cy=4`, `Attributes.update`)
                const A = this._rend && this._rend._attributes;
                if (A && typeof A.update === "function") A.update(this._ind, 4);
                weg(this._rend, alt);
                this._neuAuf();
            }
            onBeforeRender(renderer, scene, camera) {
                globalThis.anazhRealm._arenaZug(this, renderer, camera);
            }
            onAfterRender(renderer) {
                const zug = this._stapel.pop();
                if (zug && zug.offs.length > 0 && renderer.info) {
                    renderer.info.render.drawCalls += zug.offs.length - 1;
                    renderer.info.render.triangles += zug.tri - 1;
                }
            }
            // Glieder abgleichen, Lager und Geometrie ordnen — false: nichts zu zeichnen. Im Takt (`takt`, vor jedem Pass des
            // Frames) wird frei, was der letzte Frame räumte, jedes Glied mit Instanzen hält seine Gestalt, und das Lager baut neu,
            // wenn es muss — in einem Pass nie (r184 zeichnet ihn mit der Geometrie, die er projizierte).
            _ordnen(renderer, takt) {
                if (!AnazhRealm._arenaKann(renderer)) {
                    for (const m of this.glieder.slice()) this.lassen(m, true);
                    return false;
                }
                if (takt) raumSpaet(this._nFrei, this._nSpaet);
                let fremd = null;
                for (const m of this.glieder) {
                    const p = this._pruefen(m);
                    if (p !== 0) (fremd || (fremd = [])).push(m, p);
                }
                if (fremd)
                    for (let i = 0; i < fremd.length; i += 2) {
                        const m = fremd[i],
                            p = fremd[i + 1];
                        this.lassen(m, true);
                        if (p === 2) AnazhRealm._arenaNimmt(m, renderer);
                        else if (p === 3) {
                            this._wartend.add(m);
                            this._folgen();
                        }
                    }
                // verdichten: liegt die Hälfte der Instanz-Seite frei, folgt eine Arena nach dem Bedarf
                if (this.__instanzQuelle.instanceMatrix && this._nCap > 512 && this._nBelegt < this._nCap / 2)
                    this._folgen();
                if (this.glieder.length === 0) return false;
                if (takt) {
                    // vor dem ersten Pass liegt jede Gestalt, die das Hauptbild zieht (im Bündel jedes sichtbare Glied mit
                    // Instanzen, lose dazu im Blick der Kamera, wie `_auftraege`); was nur eine Kaskade zieht, legt sich in
                    // ihrem Zug in eine freie Strecke (reicht keine, wirft es einen Frame später). Befund 16.10. (G1-n2/diag1,
                    // Genesis Third): mit jedem Schatten-Glied mit Instanzen lagen 0,27 MB Zwillinge, die keine Kaskade zog.
                    const L = this._lager,
                        jetzt = AnazhRealm.__arenaJetzt || 0,
                        cam = globalThis.anazhRealm && globalThis.anazhRealm.state.camera,
                        haupt = (this.layers.mask & 1) !== 0,
                        blick = !this._fest && haupt && !!cam;
                    if (blick) {
                        pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                        fr.setFromProjectionMatrix(pm, cam.coordinateSystem, cam.reversedDepth);
                    }
                    L.takt(renderer, jetzt);
                    if (haupt)
                        for (const m of this.glieder) {
                            if ((m.count | 0) <= 0 || !this._sichtbar(m, renderer)) continue;
                            if (blick && m.frustumCulled !== false) {
                                if (m.boundingSphere === null) m.computeBoundingSphere();
                                if (!fr.intersectsSphere(kugel.copy(m.boundingSphere).applyMatrix4(m.matrixWorld)))
                                    continue;
                            }
                            L.halten(L.gestalten.get(m.__arenaZ.gestalt), jetzt);
                        }
                    L.ordnen(jetzt);
                }
                if (this.geometry.index !== this._lager.index) this._geoNeu();
                return true;
            }
            // Die Aufträge eines Zugs aus der EINEN Wahl der CPU (`count` der Senke; lose dazu Sicht und Frustum wie r184),
            // VERDICHTET: nur Glieder mit Instanzen im Blick ziehen. `camera` null: die Plätze eines Bündels — die Aufnahme
            // (`auf`) legt so viele, wie Glieder ziehen, und ein Viertel Reserve (`plaetze`, Plätze ohne Instanzen); der Takt
            // füllt sie, und reichen sie nicht oder liegt mehr als die Hälfte brach, nimmt das Bündel neu auf — sonst nie, die
            // Wahl wechselt ohne Aufnahme. Befund 16.10. (Prüfung, Dorf): bis hier zog jedes Glied seinen Platz, auch leer —
            // die Züge des Hauptbilds 58 → 66.
            _auftraege(zug, camera, renderer, auf) {
                const fest = camera === null;
                const args = zug.arr,
                    basis = zug.seg * this._segCap * 5,
                    platz = fest && !auf ? zug.plaetze : this._segCap;
                zug.offs.length = 0;
                zug.zuege.length = 0;
                zug.tri = 0;
                // die Wahl der GPU: je Zug [Glied, erste Instanz, Zahl, Platz der Zahl im Auftrags-Puffer, Abschnitt der Liste]
                const wahl = this._wahl ? zug.wahl || (zug.wahl = []) : null;
                if (wahl) wahl.length = 0;
                let k = 0,
                    ziehen = 0,
                    frust = false,
                    lebend = 0;
                for (const m of this.glieder) {
                    let n = m.count | 0;
                    if (n > 0) lebend++;
                    if (n > 0 && !this._sichtbar(m, renderer)) n = 0;
                    if (n > 0 && !fest && m.frustumCulled !== false) {
                        if (!frust) {
                            pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                            fr.setFromProjectionMatrix(pm, camera.coordinateSystem, camera.reversedDepth);
                            frust = true;
                        }
                        if (m.boundingSphere === null) m.computeBoundingSphere();
                        if (!fr.intersectsSphere(kugel.copy(m.boundingSphere).applyMatrix4(m.matrixWorld))) n = 0;
                    }
                    if (n <= 0) continue;
                    const z = m.__arenaZ,
                        b = this._lager.gestalten.get(z.gestalt),
                        dr = m.geometry.drawRange;
                    const s0 = Math.max(0, dr.start | 0);
                    const ni = Math.min(b.ni - s0, Number.isFinite(dr.count) ? dr.count : b.ni);
                    if (ni <= 0) continue;
                    // die Gestalt liegt (oder legt sich in eine freie Strecke) — ohne Platz zieht das Glied ab dem Takt, der das
                    // Lager neu baut (im Takt hält jedes Glied mit Instanzen seine Gestalt vor jedem Pass)
                    if (z.erst < 0 || !this._lager.halten(b, AnazhRealm.__arenaJetzt || 0)) continue;
                    ziehen++;
                    if (k >= platz) continue; // die Plätze des Bündels reichen nicht: es nimmt neu auf (unten)
                    n = Math.min(n, z.cap);
                    this._block(m, z, n);
                    const o = k * 5;
                    // in der Wahl zählt der Compute die Instanzen, die erste ist der Abschnitt der Liste (je Kamera ein Block-Raum)
                    const li = zug.seg * this._nCap + z.erst;
                    args[o] = ni;
                    args[o + 1] = wahl ? 0 : n;
                    args[o + 2] = b.fi + s0;
                    args[o + 3] = b.bv;
                    args[o + 4] = wahl ? li : z.erst;
                    if (wahl) wahl.push(m, z.erst, n, basis + o + 1, li);
                    zug.offs.push((basis + o) * 4);
                    zug.zuege.push(m);
                    zug.tri += (ni / 3) * n;
                    k++;
                }
                // gezählt am Stand dieses Passes (heilt jeden Schreiber an der Instanz-Zahl vorbei)
                this._lebend = lebend;
                this._sicht();
                if (fest) {
                    // die Reserve: ein Viertel über den Zügen der Aufnahme, abgerundet — ein leerer Platz ist ein Befehl im Band
                    // (Befund 16.10., G1-n3/linse: mit „ein Viertel und eins" 9 leere Züge im Hauptbild der Mess-Wiese, baum 26 → 35)
                    if (auf) zug.plaetze = Math.min(this.glieder.length, k + (k >> 2));
                    else if (ziehen > zug.plaetze || zug.plaetze > 2 * ziehen + 2) this.__buendel.needsUpdate = true;
                    for (; k < zug.plaetze; k++) {
                        const o = k * 5;
                        args[o] = args[o + 1] = args[o + 2] = args[o + 3] = args[o + 4] = 0;
                        zug.offs.push((basis + o) * 4);
                        zug.zuege.push(this);
                    }
                }
                if (k > 0) schreib(renderer, this._ind, basis, k * 5);
            }
            raycast() {}
        }
        AnazhRealm.__arenaK = GeometrieArena;
        return GeometrieArena;
    }
    // Ein Bündel, das eine Senke trug, nimmt sich neu auf, wenn sie Arena oder Zeichner wechselt — auch eines, das gerade
    // aufnimmt (der Eintritt geschieht im Zug ihres Zeichners): r184 merkt sich am Ende der Aufnahme die Version, der nächste
    // Takt setzt es erneut (`__arenaAuf`). Befund 16.10. (G1-n2, Radeon, Etiketten der GPU-Wache): ein Bündel spielte den
    // Zeichner weiter ab, nachdem seine Matrizen gefallen waren — „used in submit while destroyed".
    static _arenaBuendel(m) {
        for (let p = m.parent; p; p = p.parent)
            if (p.isBundleGroup) {
                p.needsUpdate = true;
                (AnazhRealm.__arenaAuf || (AnazhRealm.__arenaAuf = new Set())).add(p);
            }
    }
    // DER GPU-ABSCHIED — der EINE Weg, auf dem eine Geometrie-Kopie die GPU verlässt. r184 trägt jedes hochgeladene
    // Attribut STARK in sein Register (`renderer.info.memoryMap`) und gibt es nur auf zwei Wegen frei: `_attributes.delete`
    // oder das `dispose`-Ereignis einer Geometrie — dieses nur für die Attribute des ERSTEN Render-Objekts, das sie zeichnete.
    // `InstancedMesh.dispose()` gibt nichts frei (r184 hört auf kein Objekt-Ereignis), die Basis-Attribute einer Foundry-
    // Gestalt, die eine Instanz-Fassade zeichnet, kennt r184 nur über die Fassade. Befund 05.10. (Radeon 890M, Mess-Wiese,
    // drei Schleifen à 1,2 km, Puffer-Linse `werkbank puffer`): 131 MB Geometrie-Puffer auf der GPU, davon 60,7 MB im Bild —
    // 55,6 MB hielt nur der Foundry-Cache (Gestalten ohne lebende Gruppe), 14,7 MB nur r184s Register (der alte Boden-Satz nach
    // dem Wachsen 11,4 MB, 1 530 Instanz-Matrizen gefallener Nah-Wiesen-Kacheln und Gruppen). Das Attribut selbst bleibt
    // (die CPU-Kopie im Cache); zeichnet es wieder ein Objekt, lädt r184 es neu hoch (die Version steigt). Verschränkte fallen nie
    // einzeln (r184 zerstört den geteilten Puffer und vergisst ihn nicht — das nächste Zeichnen läse einen toten Puffer).
    _gpuAbschied(attr) {
        const rend = this.state.renderer;
        if (!attr || attr.isInterleavedBufferAttribute || !rend || !rend._attributes || !rend.info) return false;
        if (!rend.info.memoryMap.has(attr)) return false;
        rend._attributes.delete(attr);
        // Die Version steigt: zeichnet ein altes Render-Objekt das Attribut wieder, sieht der Beobachter (r184 equals,
        // die Observer-Diät) die Änderung und lädt es hoch — ohne sie fände sein Draw keinen Puffer. Der Sprung zählt mit
        // (`__abschiede`): wer den INHALT an der Version misst (das Lager der Arena), zieht ihn ab.
        attr.needsUpdate = true;
        attr.__abschiede = (attr.__abschiede | 0) + 1;
        return true;
    }
    // DER ABSCHIED EINER INSTANZ-SENKE — das Gegenstück zu `_instanzMesh`: ihre EIGENEN Instanz-Puffer (die Matrizen als
    // Speicher-Puffer, die Farben) verlassen die GPU. Der Speicher-Puffer fällt NUR hier: seine Bindegruppe hält ihn, und
    // r184 baut sie nur bei einem neuen Attribut-OBJEKT neu (`Bindings._update`), nie bei einem neu hochgeladenen Puffer —
    // eine Senke, die weiterlebt, darf ihn nie verlieren. Der Aufrufer hat sie aus Graph und Bündel genommen; Geometrie und
    // Stoff gehören ihm (geteilt).
    _instanzAbschied(mesh) {
        if (!mesh) return;
        this._gpuAbschied(mesh.instanceMatrix);
        this._gpuAbschied(mesh.instanceColor);
        // Die Render-Objekte der Senke (`_renderObjektRegister`) lösen sich: von Stoff und Geometrie (ihr dispose-Ereignis
        // hielt sie), ihr Knoten-Zustand aus r184s `nodeBuilderCache` (je Instanz-Senke unter ihrer uuid gecacht — er hält
        // über den InstancedMeshNode die Senke selbst; nach drei Wander-Schleifen 3 713 Zustände für 226 lebende Senken),
        // ihre eigenen Bindegruppen aus der Layout-Zählung. Dann nimmt der Collector sie samt Uniform-Puffern. Die Pipeline
        // bleibt im Cache, wie bisher (r184s eigenes `dispose` gäbe mit dem letzten Render-Objekt einer Familie auch sie frei —
        // die nächste Senke derselben Familie kompilierte neu); geteilte Gruppen gehören allen.
        AnazhRealm._renderObjekteLoesen(mesh);
        // gezeichnet hat ihr Zeichner (1410-1): seine Render-Objekte lösen sich ebenso
        if (mesh.__zeichner) AnazhRealm._renderObjekteLoesen(mesh.__zeichner);
        if (mesh.__arena) mesh.__arena.lassen(mesh, false);
        if (AnazhRealm.__arenaKommt) AnazhRealm.__arenaKommt.delete(mesh);
        mesh.dispose();
    }
    // DIE LÖSUNG DER RENDER-OBJEKTE eines Objekts, das den Graphen für immer verlässt (`_instanzAbschied`, `_disposeSoulGroup`)
    // — in JEDEM Renderer, der es zeichnete (das Register ist eine Hülle der Klasse; `ro.renderer`). r184 hängt jedes Render-
    // Objekt an das dispose-Ereignis seines STOFFS (vendor/three.webgpu.min.js `this.material.addEventListener("dispose",
    // this.onMaterialDispose)`) und löst es selbst nur, wenn der Stoff fällt — ein geteilter Stoff fällt nie. Befund
    // (Frost-Nachbesserung 4, Radeon): jeder Regler-Wert der Werkstatt hängte 8 Hörer an die 8 geteilten Foundry-Stoffe,
    // +3,2–4,7 MB JS je Wert. Die Lösung nimmt die Hörer ab (Stoff und Geometrie) und die eigenen Bindegruppen; die Pipeline
    // bleibt im Cache, geteilte Gruppen gehören allen.
    // DER KNOTEN-BAU gehört seinem SCHLÜSSEL, nicht dem Objekt (Frost-Nachbesserung 5): r184 cacht ihn je
    // `initialCacheKey` (6:378979) und wirft ihn aus dem Cache, wenn sein letzter Nutzer geht (`Nodes.delete`, 6:380856).
    // Ein Leib aus geteilten Stoffen teilt den Schlüssel mit der Seele, die nach ihm kommt — die Lösung des Wolfs warf
    // den Knoten-Bau, den der Mensch eben noch hatte, und jede Rückkehr kompilierte neu (Radeon, 10 Seelenwechsel bei
    // offenem Tab: Welt +178 Pipelines / +175 Shader-Module, Ich-Bühne +18, Hof +53). Er fällt nur, wo der Schlüssel das
    // Objekt selbst trägt — r184 schreibt die uuid hinein bei Instanz-Senke, count > 1 oder Morph (6:209550): dort hält der
    // Zustand das Objekt und kann keinem anderen dienen.
    static _renderObjekteLoesen(obj) {
        const ros = obj && obj.__renderObjekte;
        if (!ros) return;
        obj.__renderObjekte = null;
        for (const ro of ros) {
            const rend = ro.renderer;
            const o = ro.object;
            if (ro.material) ro.material.removeEventListener("dispose", ro.onMaterialDispose);
            if (ro.geometry) ro.geometry.removeEventListener("dispose", ro.onGeometryDispose);
            // Auch ein BatchedMesh trägt Objekteigenes im Schlüssel (die uuid seiner Matrizen- und Farb-Textur, 6:209537) —
            // kommt je eins in den Stamm (heute 0), gehört `o.isBatchedMesh === true` in diese Bedingung.
            const eigenerSchluessel =
                !!o && (o.isInstancedMesh === true || o.count > 1 || Array.isArray(o.morphTargetInfluences));
            if (eigenerSchluessel && rend && rend._nodes) rend._nodes.delete(ro);
            if (rend && rend._bindings && ro._bindings)
                for (const bg of ro._bindings) {
                    const b0 = bg.bindings && bg.bindings[0];
                    if (b0 && b0.groupNode && b0.groupNode.shared === true) continue;
                    rend.backend.deleteBindGroupData(bg);
                    rend._bindings.delete(bg);
                    // r184 merkt jede Bindegruppe an jeder Textur, die sie liest (`bindGroups`, für den Neubau bei
                    // einem Textur-Wechsel) und vergisst sie nie: eine geteilte Textur (Karten-Atlas, Schatten-Karte)
                    // hielt so die Bindegruppe — und mit ihr die Uniform-Puffer — jeder je gezeichneten Senke.
                    for (const b of bg.bindings || [])
                        if (b.isSampledTexture && b.texture && rend._textures.has(b.texture)) {
                            const td = rend._textures.get(b.texture);
                            if (td.bindGroups) td.bindGroups.delete(bg);
                        }
                }
        }
    }
    // DAS RENDER-OBJEKT-REGISTER: r184 baut je (Objekt × Stoff × Pass-Kontext) ein Render-Objekt mit eigenen Uniform-Puffern
    // (`bindingBuffer…_object` · `_render`) und hängt es an das `dispose`-Ereignis seines STOFFS und seiner GEOMETRIE — ein
    // geteilter Stoff hielt so jedes Render-Objekt jeder je gezeichneten Senke für immer, der Collector nahm keins (Mess-Wiese
    // nach drei Wander-Schleifen: 7 481 Uniform-Puffer, 2,6 MB, keiner vom GC frei). Das Register merkt je Objekt seine
    // Render-Objekte: der Abschied einer Senke (`_instanzAbschied`) löst sie, der Kehraus liest aus ihnen, was das Objekt
    // WIRKLICH zeichnet — auch Attribute, die kein `geometry.attributes` trägt (r184s InstanceNode zeichnet die Instanz-
    // Farbe aus einem EIGENEN Attribut über `instanceColor.array`).
    // Das Register sitzt an der KLASSE der Render-Objekt-Verwaltung (Frost-Nachbesserung 4): jeder Renderer der Seite (Welt,
    // Werkstatt, Ich-, Hof-, Feed-Bühne) meldet seine Render-Objekte am Objekt an — die Bühnen zeichnen Gestalten aus Welt-
    // Vorlagen mit geteilten Stoffen, ihre Render-Objekte hingen sonst für immer an diesen Stoffen.
    _renderObjektRegister(renderer) {
        const inst = renderer && renderer._objects;
        const objs = inst && Object.getPrototypeOf(inst);
        if (!objs || objs.__anazhRegister || typeof objs.createRenderObject !== "function") return;
        objs.__anazhRegister = true;
        const roh = objs.createRenderObject;
        objs.createRenderObject = function (...a) {
            const ro = roh.apply(this, a);
            const o = ro && ro.object;
            if (!o) return ro;
            // DER HÖRER ZIEHT MIT (bausatz-absage): r184 hängt `onGeometryDispose` an die ERSTE Geometrie des Render-Objekts, und
            // `setGeometry` lässt ihn dort — tauscht ein Satz die Geometrie am selben Mesh (`_chunkSatzGeometrie`), löscht das
            // Entsorgen der alten die Attribute des LEBENDEN Render-Objekts: es zeichnet aus `vertexBuffers` weiter, aber die
            // Diät prüft es jeden Takt voll (Genesis Third: 4 bauSatz + bodenSatz), und die alte Geometrie hält es fest.
            const RO = Object.getPrototypeOf(ro);
            if (RO.__anazhHoerer !== true && typeof RO.setGeometry === "function") {
                RO.__anazhHoerer = true;
                const setze = RO.setGeometry;
                RO.setGeometry = function (g) {
                    if (this.geometry && this.geometry !== g) {
                        this.geometry.removeEventListener("dispose", this.onGeometryDispose);
                        g.addEventListener("dispose", this.onGeometryDispose);
                    }
                    return setze.call(this, g);
                };
            }
            const liste = o.__renderObjekte || (o.__renderObjekte = []);
            liste.push(ro);
            // r184 löst ein Render-Objekt selbst (ein neuer Schlüssel, ein entsorgter Stoff): es verlässt das Register.
            const roDispose = ro.onDispose;
            ro.onDispose = () => {
                const l = o.__renderObjekte;
                const i = l ? l.indexOf(ro) : -1;
                if (i >= 0) l.splice(i, 1);
                roDispose();
            };
            return ro;
        };
        // DER GEOMETRIE-HALTER FÄLLT: r184 hängt an jede gezeichnete Geometrie EINEN dispose-Hörer, der das ERSTE Render-
        // Objekt einfängt (`initGeometry`, gehalten in der Map `_geometryDisposeListeners`) — eine Fassade, die nie entsorgt
        // wird, hielt so ihre erste Senke samt Render-Objekt, Knoten-Zustand und Uniform-Puffern für immer (Heap-Halter-
        // Suche 06.10.: zehn abgeschiedene Gruppen, alle zehn über diesen Hörer am Leben). Und sein Entsorgen löschte die
        // Attribute DIESES Render-Objekts — auch Basis-Attribute, die eine Fassade mit lebenden Gruppen teilt. Die Residenz
        // trägt der Kehraus (`_gpuKehraus`: was kein Objekt des Graphen zeichnet, verlässt die GPU); der Hörer fällt, nur
        // die Geometrie-Zählung des Infos bleibt ehrlich.
        const geos = renderer._geometries;
        if (geos && typeof geos.initGeometry === "function" && geos._geometryDisposeListeners) {
            const init = geos.initGeometry;
            geos.initGeometry = function (ro) {
                init.call(this, ro);
                const g = ro.geometry;
                const hoerer = this._geometryDisposeListeners.get(g);
                if (!hoerer) return;
                g.removeEventListener("dispose", hoerer);
                this._geometryDisposeListeners.delete(g);
                const info = this.info;
                const zaehlung = () => {
                    info.memory.geometries--;
                    g.removeEventListener("dispose", zaehlung);
                };
                g.addEventListener("dispose", zaehlung);
            };
        }
    }
    // DER SCHMALE INDEX (W7): r184 weitet beim Anlegen JEDES nicht-normierte 8-/16-bit-Attribut auf 32 bit (die Vertex-
    // Formate ohne x1/x3-Form) — auch den Index, den der Draw selbst als uint16 binden könnte (`setIndexBuffer` wählt das
    // Format nach dem Array-Typ): jeder 16-bit-Index lag doppelt auf der GPU, und die Foundry lieferte ihn ohnehin als
    // Uint32. Befund (echte GPU, Mess-Wiese, Puffer-Linse): 113 von 114 Index-Puffern hätten 16 bit gereicht, 2,8 MB zu viel
    // — der Spieler allein 0,9 MB. Der EINE Weg jedes Index auf die GPU (`createIndexAttribute`) legt einen Uint16-Index
    // ungeweitet an: das Weiten fragt `normalized` (für einen Index bedeutungslos), die Hülle setzt es nur für das Anlegen.
    // Wer den Index schmal hält, schreibt ihn auch nach: jedes Nachschreiben eines Arrays unter 4 B je Element (der
    // Uint16-Index, unorm16/unorm8 — ganz oder je Bereich) geht durch die EINE Wort-Schrift `_schreibWorte`, die auch
    // die Arena ruft (gate:vendor-anker pinnt beide Vendor-Stellen, gate:weltbild-frost P2 jeden writeBuffer).
    //
    // DAS BACKEND-GESETZ (Frost 07.10.): die Hüllen des WebGPU-Backends sitzen an der KLASSE, nie an einer Instanz. Die
    // Seite trägt fünf WebGPU-Renderer (Welt · Werkstatt · Ich-, Hof-, Feed-Bühne), und sie TEILEN Geometrie (die Mensch-
    // Vorlage `sharedGeom`, die Studio-Gestalten). r184 schreibt beim Anlegen die geweitete Form in das GETEILTE Attribut
    // zurück (`createAttribute`: `array = new Uint32Array(array)`), und der Draw bindet das Index-Format nach dem Array-Typ.
    // Befund (echte GPU, Radeon 890M, main V18.534): die Hülle lag nur an der Welt-Instanz; Tab öffnete die Ich-Bühne, ihr
    // Backend weitete die Mensch-Indizes, die Welt band acht Mensch-Meshes als uint32 auf 16-bit-Puffern („Index range …
    // does not fit", 1 760 Meldungen in Sekunden), jeder Render-Kontext der Welt wurde verworfen — das Bild stand, die Uhr
    // lief. Gerufen direkt nach dem Bau des Welt-Renderers (vor jedem init, vor jedem Attribut): jedes Backend der Seite
    // erbt (1) den schmalen Index und das Index-Maximum, gebucht am EINEN Weg jedes Index auf die GPU (Anlegen ganz,
    // Nachschreiben nur die geschriebenen Bereiche — die Sätze schreiben je Pass), (2) die Index-Wache am Draw (ein
    // Vergleich), (3) die GPU-Wache an seinem Device und an der Konsolen-Funktion von three.
    _backendGesetz(renderer) {
        const be = renderer && renderer.backend;
        if (!be || be.isWebGPUBackend !== true) return;
        const P = Object.getPrototypeOf(be);
        if (!P || P.__anazhGesetz === true) return;
        P.__anazhGesetz = true;
        const realm = this;
        const anlegen = P.createIndexAttribute;
        P.createIndexAttribute = function (attr) {
            const schmal = !!attr && attr.array instanceof Uint16Array && attr.normalized === false;
            if (schmal) attr.normalized = true;
            let aus;
            try {
                aus = anlegen.call(this, attr);
            } finally {
                if (schmal) attr.normalized = false;
            }
            const d = this.get(attr);
            // die Puffer-Größe einmal gelesen (GPUBuffer.size ist ein Binding-Aufruf — je Draw kostete er ~0,3 µs)
            d.__indexBytes = d.buffer ? d.buffer.size : 0;
            AnazhRealm._indexMaxBuchen(d, attr.array, null);
            return aus;
        };
        const nachschreiben = P.updateAttribute;
        P.updateAttribute = function (attr) {
            const d = this.get(attr);
            if (d.__indexMax !== undefined) AnazhRealm._indexMaxBuchen(d, attr.array, attr.updateRanges);
            const ba = attr.isInterleavedBufferAttribute ? attr.data : attr;
            if (ba.array.BYTES_PER_ELEMENT >= 4 || this.get(ba)._force3to4BytesAlignment === true)
                return nachschreiben.call(this, attr);
            const [q, buf, a] = [this.device.queue, this.get(ba).buffer, ba.array],
                b = a.BYTES_PER_ELEMENT;
            if (!ba.updateRanges.length) AnazhRealm._schreibWorte(q, buf, a, 0, a.byteLength);
            for (const r of ba.updateRanges) AnazhRealm._schreibWorte(q, buf, a, r.start * b, (r.start + r.count) * b);
            ba.clearUpdateRanges();
        };
        const zeichnen = P.draw;
        P.draw = function (ro, info) {
            const idx = ro.getIndex();
            if (idx !== null) realm._indexWacheDraw(this, ro, idx);
            return zeichnen.call(this, ro, info);
        };
        const init = P.init;
        P.init = async function (r) {
            const aus = await init.call(this, r);
            realm._gpuWacheAn(this.device, (r && r.domElement && r.domElement.id) || "welt");
            return aus;
        };
        this._gpuWacheKonsole();
    }
    // DIE INDEX-WACHE (Frost 07.10.) — am Draw jedes Backends, je gezeichneter Geometrie: das Format, das der Draw bindet
    // (der Array-Typ), passt in den Puffer, der auf der GPU liegt, und kein gezeichneter Index greift über die Vertex-Zahl.
    // Ein Bruch steht beim NAMEN im Log (Objekt-Pfad · Geometrie · Zahlen · Backend), einmal je Geometrie und Art, gezählt
    // in `_indexWache` — vor der Device-Meldung, die nur „Index range … does not fit" kennt. Kosten: je Draw ein Vergleich
    // gegen das am Anlegen/Nachschreiben gebuchte Maximum (`_indexMaxBuchen`); den gezeichneten Bereich liest sie nur im
    // Verdacht (Maximum ≥ Vertex-Zahl — ein Satz trägt Luft hinter seinem Hochwasser), einmal je Version und Bereich.
    _indexWacheDraw(be, ro, idx) {
        const d = be.get(idx);
        const bytes = d.__indexBytes;
        if (!(bytes > 0)) return;
        const arr = idx.array;
        let art = null,
            detail = null;
        if (arr.byteLength > bytes) {
            art = "format";
            detail = `${idx.count} × ${arr.constructor.name} = ${arr.byteLength} B gebunden, der Puffer trägt ${bytes} B`;
        } else {
            const pos = ro.geometry.attributes.position;
            if (!pos || !(d.__indexMax >= pos.count)) return;
            const p = ro.getDrawParameters();
            if (p === null) return;
            const schluessel = idx.version + ":" + p.firstVertex + ":" + p.vertexCount + ":" + pos.count;
            if (!d.__wacheBereich || d.__wacheBereich.schluessel !== schluessel) {
                let m = 0;
                const bis = Math.min(arr.length, p.firstVertex + p.vertexCount);
                for (let i = p.firstVertex; i < bis; i++) if (arr[i] > m && arr[i] !== 4294967295) m = arr[i];
                d.__wacheBereich = { schluessel, max: m };
            }
            if (d.__wacheBereich.max < pos.count) return;
            art = "bereich";
            detail = `Index ${d.__wacheBereich.max} ≥ ${pos.count} Vertices im gezeichneten Bereich`;
        }
        const W = this._indexWache || (this._indexWache = { n: 0, brueche: [] });
        W.n++;
        const geo = ro.geometry.id;
        if (W.brueche.length >= 24 || W.brueche.some((b) => b.geometrie === geo && b.art === art)) return;
        const teile = [];
        for (let o = ro.object; o && teile.length < 7; o = o.parent) teile.unshift(o.name || o.type);
        const objekt = teile.join("/");
        const backend = (be.renderer && be.renderer.domElement && be.renderer.domElement.id) || "welt";
        W.brueche.push({ art, objekt, geometrie: geo, detail, backend });
        this.log(`INDEX-WACHE (${art}, ${backend}): ${objekt} · Geometrie ${geo} — ${detail}`, "ERROR");
    }
    // DIE GPU-WACHE (Frost 07.10.) — kein WebGPU-Validierungsfehler bleibt still. Zwei Wege führen eine Validierung aus der
    // GPU: (1) `uncapturederror` je Device (jedes Backend der Seite, nach seinem init) und (2) r184s eigene Fehler-Bereiche —
    // der async Pipeline-Bau hält `pushErrorScope` über ein await offen, jede Validierung dazwischen (auch ein fremder Draw)
    // landet dort, wird als THREE-Konsolenzeile gemeldet und markiert DIESE Pipeline für immer als kaputt (`error`, ihr Stoff
    // zeichnet nie wieder). Beide melden an `_gpuWacheMeldung`: beim Namen ins Log (die ersten 12 verschiedenen ganz, danach
    // die Zahl bei jeder Zehner-Potenz), gezählt in `_gpuWache`. Ein verworfener Befehlspuffer ist ein verlorenes Bild.
    _gpuWacheAn(device, name) {
        if (!device || device.__anazhWache === true || typeof device.addEventListener !== "function") return;
        device.__anazhWache = true;
        device.addEventListener("uncapturederror", (ev) =>
            this._gpuWacheMeldung(name, String((ev && ev.error && ev.error.message) || (ev && ev.error) || "?"))
        );
    }
    _gpuWacheKonsole() {
        if (typeof THREE === "undefined" || typeof THREE.setConsoleFunction !== "function") return;
        const vorher = typeof THREE.getConsoleFunction === "function" ? THREE.getConsoleFunction() : null;
        if (vorher && vorher.__anazhWache === true) return;
        const route = (art, msg, ...rest) => {
            if ((art === "error" || art === "warn") && AnazhRealm.GPU_VALIDIERUNG_RE.test(String(msg)))
                this._gpuWacheMeldung("three", String(msg).replace(/^THREE\./, ""));
            if (vorher) return vorher(art, msg, ...rest);
            const aus = console[art] || console.log;
            if (rest[0] && rest[0].isStackTrace) aus(rest[0].getError(msg));
            else aus(msg, ...rest);
        };
        route.__anazhWache = true;
        THREE.setConsoleFunction(route);
    }
    _gpuWacheMeldung(quelle, msg) {
        const W = this._gpuWache || (this._gpuWache = { n: 0, meldungen: [] });
        W.n++;
        const kopf = msg.split("\n")[0].slice(0, 200);
        if (W.meldungen.length < 12 && !W.meldungen.some((m) => m.kopf === kopf)) {
            W.meldungen.push({ quelle, kopf, n: W.n });
            this.log(`GPU-VALIDIERUNG (${quelle}, #${W.n}): ${msg.slice(0, 600)}`, "ERROR");
        } else if (Number.isInteger(Math.log10(W.n)))
            this.log(`GPU-VALIDIERUNG: ${W.n} Meldungen (zuletzt ${quelle}: ${kopf})`, "ERROR");
    }
    // Die Handschrift einer Dawn-Validierung (Kontext-Zeile „ - While …", ein ungültiges Objekt, ein Bereich, der nicht passt).
    static get GPU_VALIDIERUNG_RE() {
        return /\n\s*-\s*While |\[Invalid [A-Za-z]+|does not fit in|GPUValidationError/;
    }
    // Die schmalen Formen eines Assets (W7, Kosten ins Asset): ein Index über ≤ 65 535 Vertices trägt 16 bit (das Backend-
    // Gesetz hält ihn so auf der GPU), ein Haut-Gewicht 16 bit normiert (unorm16x4 statt float32x4 — 2 statt 4 B je Komponente;
    // der Shader liest dasselbe vec4, die Abweichung ≤ 1/131 070 je Gewicht).
    // Das Index-Maximum am Weg auf die GPU (Frost 07.10., `_backendGesetz`): das Anlegen und ein Voll-Schreiben lesen das
    // ganze Array, ein Teil-Schreiben nur seine Bereiche (die obere Schranke wächst, wie die Daten auf der GPU wachsen) —
    // die Kosten folgen den geschriebenen Bytes, nie der Puffer-Größe. 0xFFFFFFFF ist der Neustart-Index, kein Vertex.
    static _indexMaxBuchen(d, arr, bereiche) {
        const teil = !!bereiche && bereiche.length > 0 && d.__indexMax !== undefined;
        const n = arr.length;
        let m = teil ? d.__indexMax : 0;
        if (teil)
            for (let k = 0; k < bereiche.length; k++) {
                const b = Math.min(n, bereiche[k].start + bereiche[k].count);
                for (let i = Math.max(0, bereiche[k].start); i < b; i++) {
                    const v = arr[i];
                    if (v > m && v !== 4294967295) m = v;
                }
            }
        else
            for (let i = 0; i < n; i++) {
                const v = arr[i];
                if (v > m && v !== 4294967295) m = v;
            }
        d.__indexMax = m;
    }
    // DIE WORT-SCHRIFT (K-ICH-BÜHNE-PUFFER): WebGPU schreibt nur in 4-Byte-Wörtern (Versatz und Länge), r184 reicht ein
    // schmales Array (der Uint16-Index des Gesetzes, unorm16/unorm8) beim Nachschreiben roh — ein Index ungerader Länge oder
    // ein Bereich ab ungeradem Element warf (CI voll 14, 1 von ~15 Läufen: Mensch 8097 × Uint16 = 16 194 B nach
    // `_gpuAbschied`). Darum ist dies der EINE Schreiber eines Array-Bereichs in die Queue — die Hülle (jedes Array unter
    // 4 B je Element, ganz oder je updateRange) und die Arena (`schreib`) rufen ihn: die Bytes [von, bis) des Arrays an
    // dieselbe Stelle des Puffers, Anfang ab-, Ende aufgerundet, das letzte halbe Wort als gepolsterte Kopie
    // (r184 polstert jeden Puffer beim Anlegen auf 4 B).
    static _schreibWorte(q, buf, a, von, bis) {
        const voll = a.byteLength & ~3;
        bis = Math.min(bis, a.byteLength);
        von &= ~3;
        const ganz = Math.min(voll, (bis + 3) & ~3);
        if (ganz > von) q.writeBuffer(buf, von, a.buffer, a.byteOffset + von, ganz - von);
        if (bis > voll) {
            const rest = new Uint8Array(4);
            rest.set(new Uint8Array(a.buffer, a.byteOffset + voll, a.byteLength - voll));
            q.writeBuffer(buf, voll, rest, 0, 4);
        }
    }
    static _indexSchmal(arr, nVertices) {
        return nVertices <= 65535 && !(arr instanceof Uint16Array) ? Uint16Array.from(arr) : arr;
    }
    static _hautGewicht(arr, itemSize) {
        const w = new Uint16Array(arr.length);
        for (let i = 0; i < arr.length; i++) w[i] = Math.round(Math.min(1, Math.max(0, arr[i])) * 65535);
        return new THREE.BufferAttribute(w, itemSize || 4, true);
    }
    // DIE INSTANZ-ZAHL — der EINE Schreiber von `count` jeder Instanz-Senke (Instanz-Gruppen · Fundament · Zaun ·
    // Nah-Wiese · Nah-Streu): jede Senke ist DICHT ([0, n) lebt, ein freier Slot existiert nicht), und eine leere ist
    // unsichtbar — sie betritt keinen Pass (kein Render-Objekt, kein Bundle-Platz, kein Schatten-Werfer).
    static _instanzZahl(mesh, n) {
        const vor = mesh.count | 0;
        mesh.count = n;
        mesh.visible = n > 0;
        if (vor > 0 !== n > 0) AnazhRealm._regtHalter(mesh); // die Werfer-Hülle ihres Bündels (das Register)
        // die Arena zählt ihre Glieder mit Instanzen: ohne eines betritt sie keinen Pass (kein leeres Render-Objekt)
        const a = mesh.__arena;
        if (a && vor > 0 !== n > 0) {
            a._lebend += n > 0 ? 1 : -1;
            a._sicht();
        }
        // der Zeichner zählt mit (1410-1): seine Fassade zeichnet so viele Instanzen, wie die Senke JETZT zählt — r184 liest die
        // Zahl zur Zeichen-Zeit, und der verschachtelte Schatten-Render stellt sie mitten im Hauptbild um und zurück, ohne neu
        // zu projizieren (die Zahl der Projektion war dann die der Kaskade: Instanzen fehlten oder standen doppelt im Bild)
        if (mesh.__zeichner) mesh.__zeichner.__fassade.instanceCount = n;
    }
    // DER GANG-SATZ — der EINE Baustein jeder Menge gelenkiger Gestalten (Bewohner, Tiere; Lehre 23: WebGPU zieht jeden Draw
    // einzeln — die Kosten der Menge hängen nie an der Kopfzahl): je Gestalt EIN Knochen-Puffer, eine Textur — `baender` Bänder
    // zu je `n` Phasen des Doppelschritts und der Stand (Zeile baender·n), je Zeile die Matrix jedes Knochens jeder Quelle in den
    // Raum des Leibs (`_gangSatzPose`, drei Texel je Knochen: die Zeilen der affinen Matrix). Die Kosten gehören dem Skelett,
    // nie den Ecken (Lehre 19: je Gestalt 3·J·(baender·n + 1) Texel statt einer Lage je Ecke und Phase). Jede Senke
    // (`spec.senken`: ihr Teil, ihre Quellen, ihr Stoff, ob sie wirft) ist eine Instanz-Senke über den EINEN Zeichner
    // (`_instanzMesh`); jede Ecke trägt ihre Vorlage (`aRoh`, `aRohN` — die Rückseite eines beidseitigen Teils mit gekehrter
    // Normale), ihre vier Knochen (`aKnochen`, Platz im Puffer) und Gewichte (`aGewicht`), ihre Lage im Stand (`position`,
    // `normal`: `_gangSatzEcke`); jede Instanz Band + Phase und Gewicht ihres Gangs (`aGang`, `_gangSatzInstanz`). Der Knoten
    // liest VOR der Instanz-Matrix (Lehre 22), die Normale mit, und der Wurf liest denselben Puffer (Lehre 26: der Schatten
    // geht, wie das Auge sieht). Ein Stoff wird EINMAL geklont (der Gang-Knoten ist EINER je Gestalt). `stand(satz)` schreibt
    // die Stand-Zeile, bevor die Senken ihre Ecken aus ihr nehmen. Eine Gestalt im Satz ist eine Matrix.
    _gangSatz(spec, stand) {
        const T = THREE;
        // DIE PLÄTZE DER KNOCHEN: ein Knochen, den mehrere Quellen mit derselben Bindung tragen (Name und Inverse × Bindung
        // gleich), hat EINEN Platz — je Quelle `q.platz[j]`, je Platz seine Quelle und sein Knochen (`knochen`)
        const knochen = [];
        const plaetze = new Map();
        const bindung = new T.Matrix4();
        for (const q of spec.quellen) {
            const m = q.m;
            q.platz = m.userData.__skinJoints.map((nm, j) => {
                const b = bindung.multiplyMatrices(m.skeleton.boneInverses[j], m.bindMatrix).elements;
                const key = nm + "|" + Array.from(b, (x) => x.toFixed(6)).join(",");
                if (!plaetze.has(key)) {
                    plaetze.set(key, knochen.length);
                    knochen.push({ q, j, nm });
                }
                return plaetze.get(key);
            });
        }
        const J = knochen.length;
        const N = spec.n;
        const B = spec.baender || 1;
        const tex = new T.DataTexture(
            new Float32Array(3 * J * (B * N + 1) * 4),
            3 * J,
            B * N + 1,
            T.RGBAFormat,
            T.FloatType
        );
        tex.name = spec.name + "-gang";
        tex.minFilter = tex.magFilter = T.NearestFilter;
        tex.generateMipmaps = false;
        const satz = {
            quellen: spec.quellen,
            n: N,
            baender: B,
            J,
            knochen,
            tex,
            geos: [],
            stoffe: [],
            senken: [],
            cap: spec.cap,
        };
        stand(satz);
        tex.needsUpdate = true;
        const knoten = AnazhRealm._gangSatzKnoten(tex, N, B);
        const klone = new Map();
        const D = tex.image.data;
        const e = new Float32Array(6);
        for (const sk of spec.senken) {
            let stoff = klone.get(sk.stoff);
            if (!stoff) {
                stoff = sk.stoff.clone();
                stoff.name = spec.name;
                stoff.positionNode = knoten;
                klone.set(sk.stoff, stoff);
                satz.stoffe.push(stoff);
            }
            const P = [];
            const Nn = [];
            const C = [];
            const R = [];
            const RN = [];
            const KI = [];
            const KW = [];
            const I = [];
            for (const q of sk.quellen) {
                const a = q.m.geometry.attributes;
                const ix = q.m.geometry.index.array;
                const basis = P.length / 3;
                for (let i = 0; i < a.position.count; i++) {
                    AnazhRealm._gangSatzEcke(D, J, B * N, q, i, e);
                    P.push(e[0], e[1], e[2]);
                    Nn.push(e[3], e[4], e[5]);
                    C.push(a.color.getX(i), a.color.getY(i), a.color.getZ(i));
                    R.push(a.position.getX(i), a.position.getY(i), a.position.getZ(i));
                    RN.push(a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i));
                    for (let c = 0; c < 4; c++) {
                        KI.push(q.platz[a.skinIndex.getComponent(i, c)]);
                        KW.push(a.skinWeight.getComponent(i, c));
                    }
                }
                for (let t = 0; t < ix.length; t++) I.push(basis + ix[t]);
                // ein beidseitiger Teil (die Strähnen-Kreuzquads des Haars) trägt im Satz seine Rückseite als eigene Fläche
                if (q.beid && !sk.wurf) {
                    const b2 = P.length / 3;
                    for (let i = basis; i < b2; i++) {
                        for (let c = 0; c < 3; c++) {
                            P.push(P[i * 3 + c]);
                            Nn.push(-Nn[i * 3 + c]);
                            C.push(C[i * 3 + c]);
                            R.push(R[i * 3 + c]);
                            RN.push(-RN[i * 3 + c]);
                        }
                        for (let c = 0; c < 4; c++) {
                            KI.push(KI[i * 4 + c]);
                            KW.push(KW[i * 4 + c]);
                        }
                    }
                    for (let t = 0; t < ix.length; t += 3) I.push(b2 + ix[t], b2 + ix[t + 2], b2 + ix[t + 1]);
                }
            }
            const geo = new T.BufferGeometry();
            const n = P.length / 3;
            geo.setAttribute("position", new T.BufferAttribute(new Float32Array(P), 3));
            geo.setAttribute("normal", new T.BufferAttribute(new Float32Array(Nn), 3));
            geo.setAttribute("color", new T.BufferAttribute(new Float32Array(C), 3));
            // die Vorlage und die Knochen in EINEM Puffer (WebGPU trägt höchstens 8 Vertex-Puffer je Pipeline)
            const V = new Float32Array(n * 14);
            for (let i = 0; i < n; i++) {
                V.set(R.slice(i * 3, i * 3 + 3), i * 14);
                V.set(RN.slice(i * 3, i * 3 + 3), i * 14 + 3);
                V.set(KI.slice(i * 4, i * 4 + 4), i * 14 + 6);
                V.set(KW.slice(i * 4, i * 4 + 4), i * 14 + 10);
            }
            const vb = new T.InterleavedBuffer(V, 14);
            geo.setAttribute("aRoh", new T.InterleavedBufferAttribute(vb, 3, 0));
            geo.setAttribute("aRohN", new T.InterleavedBufferAttribute(vb, 3, 3));
            geo.setAttribute("aKnochen", new T.InterleavedBufferAttribute(vb, 4, 6));
            geo.setAttribute("aGewicht", new T.InterleavedBufferAttribute(vb, 4, 10));
            for (const nm of ["aLodLevel", "aH0", "aH0L"])
                geo.setAttribute(nm, new T.BufferAttribute(new Float32Array(n), 1));
            geo.setAttribute("aGang", new T.InstancedBufferAttribute(new Float32Array(spec.cap * 2), 2));
            geo.setIndex(new T.BufferAttribute(AnazhRealm._indexSchmal(Uint32Array.from(I), n), 1));
            geo.computeBoundingSphere();
            satz.geos.push(geo);
            const m = AnazhRealm._instanzMesh(geo, stoff, spec.cap);
            m.__wahlGpu = this._instanzWahlArt({ geom: geo }, !!sk.wurf, false) === "gpu";
            m.name = spec.name;
            m.userData.inventar = spec.inventar;
            m.userData.teil = sk.teil;
            m.userData.gang = { n: N, baender: B, J, puffer: D };
            m.receiveShadow = !sk.wurf;
            m.layers.mask = sk.wurf ? 0 : 1; // der Wurf nur auf der Wurf-Ebene (`_wurfEbene`), das Auge nur auf Ebene 0
            m.castShadow = !!sk.wurf;
            AnazhRealm._instanzZahl(m, 0);
            this.state.scene.add(m);
            satz[sk.teil] = m;
            satz.senken.push(m);
        }
        satz.kugeln = AnazhRealm._gangSatzKugeln(satz);
        return satz;
    }

    // DIE ZEILE `zeile` DES KNOCHEN-PUFFERS an der gestellten Gestalt: je Platz sein Knochen (`teile` je Name) Pose × Inverse
    // der Vorlage × Bindung seiner Quelle in den Raum der Wurzel (`wurzel`, ihre Welt-Matrix). Die Pose stellt der Rufer (der Bewohner mit
    // dem Gang-Gesetz des Menschen, das Tier mit dem seines Leibs); jede Quelle ist eine geskinnte Stufe mit ihren
    // Knochen-Namen (`__skinJoints`).
    _gangSatzPose(satz, zeile, teile, wurzel) {
        const inv = (this._gangSatzInv || (this._gangSatzInv = new THREE.Matrix4())).copy(wurzel).invert();
        const k = this._gangSatzK || (this._gangSatzK = new THREE.Matrix4());
        const D = satz.tex.image.data;
        satz.knochen.forEach(({ q, j, nm }, p) => {
            const e = k
                .multiplyMatrices(inv, teile[nm].matrixWorld)
                .multiply(q.m.skeleton.boneInverses[j])
                .multiply(q.m.bindMatrix).elements;
            const o = (zeile * satz.J + p) * 12;
            for (let r = 0; r < 3; r++) {
                D[o + r * 4] = e[r];
                D[o + r * 4 + 1] = e[4 + r];
                D[o + r * 4 + 2] = e[8 + r];
                D[o + r * 4 + 3] = e[12 + r];
            }
        });
        if (satz.kugeln) AnazhRealm._gangSatzHuelle(satz, zeile);
    }
    // DIE ECKE i DER QUELLE q in der Zeile `zeile` auf der CPU, wie der Knoten sie zeichnet: Lage und Normale nach `aus`
    static _gangSatzEcke(D, J, zeile, q, i, aus) {
        const a = q.m.geometry.attributes;
        const v = [a.position.getX(i), a.position.getY(i), a.position.getZ(i)];
        const nv = [a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i)];
        aus.fill(0);
        for (let c = 0; c < 4; c++) {
            const w = a.skinWeight.getComponent(i, c);
            if (w === 0) continue;
            const o = (zeile * J + q.platz[a.skinIndex.getComponent(i, c)]) * 12;
            for (let r = 0; r < 3; r++) {
                const b = o + r * 4;
                aus[r] += w * (D[b] * v[0] + D[b + 1] * v[1] + D[b + 2] * v[2] + D[b + 3]);
                aus[3 + r] += w * (D[b] * nv[0] + D[b + 1] * nv[1] + D[b + 2] * nv[2]);
            }
        }
        const l = Math.hypot(aus[3], aus[4], aus[5]) || 1;
        for (let r = 3; r < 6; r++) aus[r] /= l;
    }

    // DIE INSTANZ i EINER SENKE DES SATZES: die Matrix und der Gang (Band + Phase in Zyklen — der ganze Teil wählt das Band,
    // der Rest die Phase — und das Gewicht des Gangs, 0 = der Stand)
    static _gangSatzInstanz(m, i, m4, band, phase, w) {
        m.setMatrixAt(i, m4);
        m.geometry.attributes.aGang.setXY(i, band + phase - Math.floor(phase), w);
    }
    // DIE ZAHL EINER SENKE DES SATZES (dicht, [0, n) lebt): `_instanzZahl`, und was sich schrieb, lädt neu
    static _gangSatzZahl(m, n) {
        AnazhRealm._instanzZahl(m, n);
        if (n > 0) AnazhRealm._gangSatzNeu(m);
    }
    // WAS SICH IN EINER SENKE DES SATZES SCHRIEB, LÄDT NEU: Matrizen und Gang, die Kugel misst neu
    static _gangSatzNeu(m) {
        m.instanceMatrix.needsUpdate = true;
        m.geometry.attributes.aGang.needsUpdate = true;
        m.boundingSphere = null;
    }
    // DER ABSCHIED EINES SATZES: jede Senke über `_instanzAbschied`, ihre Geometrien, die geklonten Stoffe, der Gang-Puffer
    _gangSatzAbschied(satz) {
        for (const m of satz.senken) {
            if (m.parent) m.parent.remove(m);
            this._instanzAbschied(m);
        }
        for (const geo of satz.geos) geo.dispose();
        for (const st of satz.stoffe) st.dispose();
        satz.tex.dispose();
    }
    // DAS VERSCHMELZEN: die Foundry liefert Teile je Kind — Geröll 16 Steine EINES Materials, ein Fahrzeug ~700
    // Teile auf 40 Materialien. Jedes Teil war ein eigenes Leaf = eine eigene Instanz-Gruppe = ein Draw je Pass
    // und Region. Teile gleichen Materials und gleicher Attribut-Form liegen im selben Template-Raum (localMatrix
    // je Flat geteilt) → EINE Geometrie, ein Leaf. Tür-Flügel bleiben eigene Leaves (eigene Scharnier-Matrix; gleiche Gestalten
    // teilen ihre Geometrie als Instanz, `_foundryFluegelInstanz`), schwere
    // Teile (Baum-L0 — Konifere ~143k je Teil —, über phyto-core `BUDGET_GESETZ.verschmelzVerts` zusammen) auch —
    // die Kopie verdoppelte ihren Speicher für einen Draw. WAS verschmilzt, sagt das Budget-Gesetz: die Sippe des Teils
    // (phyto-core `budgetSippe`, am Mesh gestempelt) — dieselbe Regel, mit der es die Draws zählt (`budgetSippen`);
    // keine eigene Signatur im Wirt. Die Material-Identität steht dabei: zwei Materialien teilen nie eine Geometrie.
    // Die verschmolzene Geometrie gehört der Cache-Gruppe (`_eigen`): ihr Dispose und ihre Bytes laufen mit.
    _foundryFlatVerschmelzen(group, leaves) {
        const sippen = new Map();
        for (let i = 0; i < leaves.length; i++) {
            const lf = leaves[i];
            const k = lf.sippe ? lf.sippe + "|" + lf.mat.uuid : null;
            if (!k) continue;
            if (!sippen.has(k)) sippen.set(k, []);
            sippen.get(k).push(i);
        }
        const weg = new Set();
        let bytes = 0;
        for (const idx of sippen.values()) {
            if (idx.length < 2) continue;
            let n = 0;
            for (const i of idx) n += leaves[i].geom.attributes.position.count;
            if (n > globalThis.__phytoCore.BUDGET_GESETZ.verschmelzVerts) continue;
            const geo = AnazhRealm._geoVerbinden(idx.map((i) => leaves[i].geom));
            if (!geo) continue;
            const erst = leaves[idx[0]];
            leaves[idx[0]] = Object.assign({}, erst, { geom: geo, _eigen: true });
            for (let j = 1; j < idx.length; j++) weg.add(idx[j]);
            for (const k in geo.attributes) bytes += geo.attributes[k].array.byteLength;
            if (geo.index) bytes += geo.index.array.byteLength;
        }
        if (!weg.size) return;
        for (let i = leaves.length - 1; i >= 0; i--) if (weg.has(i)) leaves.splice(i, 1);
        // die Bytes der eigenen Geometrie buchen (die Räumung zieht group._cacheBytes wieder ab)
        const f = this._foundry;
        if (Number.isFinite(group._cacheBytes)) {
            group._cacheBytes += bytes;
            if (f && Number.isFinite(f.cacheBytes)) f.cacheBytes += bytes;
        }
    }

    // Hängt Geometrien GLEICHER Attribut-Form aneinander (derselbe Raum, keine Transformation): jedes
    // Attribut wird kopiert, der Index versetzt (Uint32 ab 65 536 Vertices). Null bei abweichender Form.
    static _geoVerbinden(geoms) {
        const g0 = geoms[0];
        const namen = Object.keys(g0.attributes);
        const indiziert = !!g0.index;
        let nV = 0,
            nI = 0;
        for (const g of geoms) {
            if (!!g.index !== indiziert || Object.keys(g.attributes).length !== namen.length) return null;
            for (const k of namen) {
                const a = g.attributes[k],
                    b = g0.attributes[k];
                if (!a || a.isInterleavedBufferAttribute || a.itemSize !== b.itemSize) return null;
                if (a.normalized !== b.normalized || a.array.constructor !== b.array.constructor) return null;
            }
            nV += g.attributes.position.count;
            if (indiziert) nI += g.index.count;
        }
        const out = new THREE.BufferGeometry();
        for (const k of namen) {
            const b = g0.attributes[k];
            const arr = new b.array.constructor(nV * b.itemSize);
            let o = 0;
            for (const g of geoms) {
                const a = g.attributes[k];
                arr.set(a.array.subarray(0, a.count * a.itemSize), o);
                o += a.count * a.itemSize;
            }
            out.setAttribute(k, new THREE.BufferAttribute(arr, b.itemSize, b.normalized));
        }
        if (indiziert) {
            const idx = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI);
            const basen = [];
            let o = 0,
                basis = 0;
            for (const g of geoms) {
                basen.push(basis);
                basis += g.attributes.position.count;
            }
            for (let j = 0; j < geoms.length; j++) {
                const ia = geoms[j].index.array;
                for (let i = 0; i < geoms[j].index.count; i++) idx[o++] = ia[i] + basen[j];
            }
            out.setIndex(new THREE.BufferAttribute(idx, 1));
        }
        out.computeBoundingBox();
        out.computeBoundingSphere();
        return out;
    }
    // Die EINE Template→Welt-Scale-Quelle (Studio `SCALE[sp]·tr.s·0.82`): gecachte Scale-Matrix für die
    // Flat-Leaves. Bäume tragen den 0.82-Wald-Mul, strauch/blume/Fels/Kristall die reinen Tabellen-Werte,
    // Unbekanntes → Identität. Read-only → ein Cache je Faktor. Leser: das Bild (`_foundryFlattenFor`, die Karte) UND die
    // Kollision (`_studioWeltSkala`) — beide in derselben Skala.
    _foundryWorldScaleMatrix(preset) {
        if (!this._foundryScaleMats) this._foundryScaleMats = new Map();
        // Die LIVE-Quelle führt: `PORTAL_RENDER_CONFIG.placement` (foundry-core.js via get-render-config)
        // trägt die Welt-Skala je Preset — Studio-Edit oder neues Preset folgt ohne Code (gate:nervensystem).
        // Vor dem Buch liest sie DIESELBE Tafel synchron aus dem Kern (`__terrainCore.PORTAL_RENDER_CONFIG`) — der
        // Hand-Spiegel STUDIO_WORLD_SCALE fiel (er trug nur die Bäume: ein Fels kollidierte bis zum Buch in
        // Vorlagen-Größe, Leben-Schau 2). Understory (Vorlagen-scale < 1) trägt den 0.82-Mul NICHT; ein Preset ohne
        // scale-Zeile → 1.
        const rc = AnazhRealm._studioRenderConfig;
        const live = rc && rc.placement && rc.placement.scale ? rc.placement : AnazhRealm._studioPlatzKern();
        const T = live.scale;
        const treeMul = live.treeScaleMul;
        const base = T && Object.prototype.hasOwnProperty.call(T, preset) ? T[preset] : 1;
        const k = base === 1 ? 1 : base < 1 ? base : base * treeMul;
        let m = this._foundryScaleMats.get(k);
        if (!m) {
            m = new THREE.Matrix4();
            if (k !== 1) m.makeScale(k, k, k);
            this._foundryScaleMats.set(k, m);
        }
        return m;
    }
    // Distanz-LOD (die Vorlagen-LODs 0/1/2): nah = voll (LOD 0 < 25 m), mittel = LOD 1, fern = LOD 2.
    // Perf-bewusst — die meisten Wald-Baeume sind mittel -> das leichte LOD 1.
    // `auge` {x, z}: die Wahl an einem anderen Ort als dem Auge der Maske (der Vorrat des Dorfs am Ort seines Erwachens).
    _foundryLodForEntry(entry, auge) {
        const p = auge || this._lodAuge(); // vom Auge der Maske (K36), wie der LOD-Tick
        if (!p || !entry || !entry.position) return 1;
        if (this._imStufenVorlauf(entry)) return 1; // der Stufen-Vorlauf der Ankunft, wie der LOD-Tick
        const d = Math.hypot(entry.position.x - p.x, entry.position.z - p.z);
        // DIE EINE STUFEN-WAHL: der Kalt-Schätzer fragt dieselbe Wahl wie der LOD-Tick — Wahrnehmungs-Distanz aus der
        // Sichthöhe (`_lodTreeVisHeight`, 0 = roh für Nicht-Bäume), ohne Hysterese-Zustand. Vorher las er nur die rohe
        // Distanz: die Rampe setzte einen großen Baum in 40 m auf die Karte (dithernd, grau), und der LOD-Tick holte
        // ihn erst Takte später auf L1 (5 Wechsel je Takt, 04.10. an der Mess-Wiese 191 Plätze im ersten Takt). Nennt die Art
        // ihre Grenzen (K43: Haus, Tor), fragt er sie wie der Takt — bis B2 las er dort die Baum-Distanzen 12/26 m: das
        // Ring-Tor in 11 m bestellte kalt seine L0 (Grenze 9,5 m), der Takt wechselte danach auf die L1 (Radeon kalt an
        // Genesis: 7 Tor-L0 und 9 Tor-L1 vor dem ersten Bild). In der Ankunft aus der Ferne (B2) wählt er die Grobstufe.
        const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
        const G = treeLike ? null : this._archStufenGrenzen(entry);
        if (G)
            return AnazhRealm._stufeNachGrenzen(
                d * this._ankunftsFerne(),
                undefined,
                G,
                Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1
            );
        const visH = this._lodTreeVisHeight(entry);
        // ein Baum ohne bekannte Höhe hat in der Ankunft kein Urteil der Nähe: er steht als Karte (sie bestellt die Höhe)
        if (visH === null && this._ankunftsFerne() > 1) return 2;
        return this._chooseLODForDistance(d, undefined, visH);
    }

    // DER KNOTEN DES GANGS (Lehre 22: r184 rechnet den positionNode VOR der Instanz-Matrix — die Vorlage ist der Raum des
    // Leibs): je Ecke ihre vier Knochen, je Knochen die Matrix zwischen den zwei Phasen um die Phase der Instanz in ihrem Band,
    // gemischt mit dem Stand nach dem Gewicht des Gangs, an die Vorlage der Ecke; die Normale ebenso — sie geht als
    // normalLocal in die Instanz-Normale. Die Mischung ist linear in der Matrix, also dieselbe wie zwischen den Lagen.
    static _gangSatzKnoten(tex, n, baender) {
        const T = THREE.TSL;
        return T.Fn(() => {
            const a = AnazhRealm._senkenKnoten().gang; // der Gang der Instanz (in der Wahl der GPU am Index ihrer Liste)
            const ki = T.attribute("aKnochen", "vec4");
            const kw = T.attribute("aGewicht", "vec4");
            const roh = T.vec4(T.attribute("aRoh", "vec3"), 1);
            const rohN = T.attribute("aRohN", "vec3");
            const band = T.floor(a.x).mul(n);
            const f = T.fract(a.x).mul(n);
            const k0 = T.floor(f);
            const t = f.sub(k0).toVar();
            const zs = T.int(baender * n);
            const z0 = T.int(band.add(k0)).toVar();
            const z1 = T.int(band.add(T.mod(k0.add(1), n))).toVar();
            const lage = T.vec3(0).toVar();
            const nrm = T.vec3(0).toVar();
            for (const c of ["x", "y", "z", "w"]) {
                const j = T.int(ki[c]).mul(3).toVar();
                const lies = (r, z) => T.textureLoad(tex, T.ivec2(j.add(r), z), T.int(0));
                const R = [0, 1, 2].map((r) => T.mix(lies(r, zs), T.mix(lies(r, z0), lies(r, z1), t), a.y).toVar());
                lage.addAssign(T.vec3(T.dot(R[0], roh), T.dot(R[1], roh), T.dot(R[2], roh)).mul(kw[c]));
                nrm.addAssign(T.vec3(T.dot(R[0].xyz, rohN), T.dot(R[1].xyz, rohN), T.dot(R[2].xyz, rohN)).mul(kw[c]));
            }
            T.normalLocal.assign(T.normalize(nrm));
            return lage;
        })();
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_instanz]);

// ===== ATLAS · Stoff/instanz — Außen-Konstanten =====
// W4.3 — die EINE Bake-Uhr: die Anfrage-Frist des Studio-Bakes (Worker-Reply); danach null → Retry, dann gescheitert
// (der Flatten serviert Geometrie). Der Tick-Watchdog greift 2 s später (ein Versprechen, das nie abschließt). Befund
// 30.09.: eine zweite, engere Uhr (15 s) gab Bakes auf, während der SERIELLE Worker noch rechnete, und schob den
// nächsten nach — auf langsamem Holz eine Kaskade (7 hängend, 3 gescheitert, 0 gebacken; die schweren nahen Arten zuerst).
// W6 — DIE EINE Karten-Gruppe: jede Impostor-Instanz jeder Art (Streu, gesetzt, Band-Partner) zeichnet in DIESER
// globalen Gruppe (`_archInstanceGroupFor`), die Schicht wählt aKarte.x (`_impostorAtlas`).
AnazhRealm.IMPOSTOR_ATLAS_GRUPPE = "impostor#fimp:atlas";

// DIE PLATZIERUNG DES KERNS (Leben-Schau 2, 09.10.): die Welt-Skala je Preset (`placement.scale`, `treeScaleMul`) lebt
// EINMAL in foundry-core.js (`PORTAL_RENDER_CONFIG.placement`) und reist synchron im Terrain-Namensraum — der Leser vor
// dem Buch (`_foundryWorldScaleMatrix`). Der Hand-Spiegel STUDIO_WORLD_SCALE (acht Baum-/Busch-Zeilen) fiel: ohne Fels-
// und Kristall-Zeilen kollidierte jeder Fels bis zum Buch in Vorlagen-Größe. Fehlt der Kern, bricht es laut.
AnazhRealm._studioPlatzKern = function () {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const pl = tc && tc.PORTAL_RENDER_CONFIG ? tc.PORTAL_RENDER_CONFIG.placement : null;
    if (!pl || !pl.scale || typeof pl.treeScaleMul !== "number")
        throw new Error("Die Platzierung: foundry-core.js fehlt (__terrainCore.PORTAL_RENDER_CONFIG.placement)");
    return pl;
};
// Der Karten-Atlas wächst je 2 Schichten (`_impostorAtlasTexturen`, Start 8): je Schicht ~0,25 MB, das Wachsen kopiert nur beim
// Einzug einer Art (BC1-Albedo 170 KB + RGTC2-Normale 85 KB je Schicht, 512 px samt Mips; Mess-Wiese 18 Karten in 18 Schichten).
AnazhRealm.KARTEN_ATLAS_SCHRITT = 2;
// Das Budget-Fenster der Welt-Karte je Takt (ms Haupt-Faden; die erste Karte eines Takts backt immer — Spike S1).
AnazhRealm.KARTE_WELT_MS = 4;
// Die Bühne gibt ihren Speicher frei, wenn die Schlange so lange leer ist (ms; `_karteBuehneRuhe`).
AnazhRealm.KARTE_BUEHNE_RUHE_MS = 3000;
// DIE SONNEN-SICHT DER KRONE (A7-Term, `_karteBuehne`): Richtlichter aus dem oberen Halbraum als (Höhe, Azimut) in Grad, je
// gleich stark; die Tiefen-Kachel je Richtung (px) und ihr Versatz (Tiefe, Normale in m) gegen die Selbst-Verschattung.
AnazhRealm.KARTE_SONNEN_SICHT = Object.freeze({
    richtungen: Object.freeze([
        [90, 0],
        [45, 0],
        [45, 90],
        [45, 180],
        [45, 270],
    ]),
    karte: 256,
    bias: -0.0005,
    normalBias: 0.04,
});
// DER RECHNER DER ABLAGE (`_karteRechenPlan`): Deckung, deckungstreue Mips, BC1, BC5 und die Sonnen-Sicht einer Schicht.
AnazhRealm.KARTE_RECHNER_WGSL = `
struct P {
    w: u32, h: u32, hA: u32, k: u32,
    quelle: u32, ziel: u32, V: u32, fuss: f32,
    aus: u32, zeile: u32, thr: f32, flag: u32,
    w0: u32, hA0: u32, gi: u32, t: u32,
};
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var tAlb: texture_2d<f32>;
@group(0) @binding(2) var tNrm: texture_2d<f32>;
@group(0) @binding(3) var tSicht: texture_2d<f32>;
@group(0) @binding(4) var<storage, read_write> summe: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> nsum: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read_write> dA: array<f32>;
@group(0) @binding(7) var<storage, read_write> dB: array<f32>;
@group(0) @binding(8) var<storage, read_write> zahl: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> grenze: array<f32>;
@group(0) @binding(10) var<storage, read_write> aus: array<u32>;

fn deckt(x: u32, y: u32) -> bool {
    return textureLoad(tAlb, vec2<i32>(i32(x), i32(y)), 0).a >= p.thr;
}

// Stufe 0: die Deckung je Ansicht und die Sonnen-Sicht über die deckenden Texel (zahl: [0, V) Deckung, V Summe des Zenits,
// V+1 Zahl, V+2 Summe des 45°-Kranzes)
@compute @workgroup_size(16, 16)
fn stufe0(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    if (!deckt(g.x, g.y)) { return; }
    atomicAdd(&zahl[g.y / p.hA], 1u);
    let s = textureLoad(tSicht, vec2<i32>(g.xy), 0);
    atomicAdd(&zahl[p.V], u32(round(clamp(s.r, 0.0, 1.0) * 255.0)));
    atomicAdd(&zahl[p.V + 1u], 1u);
    atomicAdd(&zahl[p.V + 2u], u32(round(clamp(s.b, 0.0, 1.0) * 255.0)));
}

// Stufe k aus k-1: die Summe (r·a, g·a, b·a, a) der vier Kinder — a zählt die deckenden Stufe-0-Texel des Fußabdrucks;
// die Stufe 1 liest die Bühne selbst (Stufe 0 binär an der Schwelle)
@compute @workgroup_size(16, 16)
fn summeK(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    var s = vec4<f32>(0.0);
    if (p.k == 1u) {
        for (var j = 0u; j < 4u; j++) {
            let x = g.x * 2u + (j & 1u);
            let y = g.y * 2u + (j >> 1u);
            if (deckt(x, y)) { s += vec4<f32>(textureLoad(tAlb, vec2<i32>(i32(x), i32(y)), 0).rgb, 1.0); }
        }
    } else {
        let wq = p.w * 2u;
        let q = p.quelle + (g.y * 2u) * wq + g.x * 2u;
        s = summe[q] + summe[q + 1u] + summe[q + wq] + summe[q + wq + 1u];
    }
    let i = g.y * p.w + g.x;
    summe[p.ziel + i] = s;
    dA[i] = s.a / p.fuss;
}

// Die Glättung der Deckung (Karten-Gesetz „glaette"): binomial 3×3 in der eigenen Ansicht, flag 0 A→B, 1 B→A
fn dLies(i: u32, ausB: bool) -> f32 {
    if (ausB) { return dB[i]; }
    return dA[i];
}
@compute @workgroup_size(16, 16)
fn glaette(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    let y0 = (g.y / p.hA) * p.hA;
    let iy = i32(g.y - y0);
    var nb = 0.0;
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            let x = u32(clamp(i32(g.x) + dx, 0, i32(p.w) - 1));
            let y = y0 + u32(clamp(iy + dy, 0, i32(p.hA) - 1));
            let gw = select(2.0, 1.0, dx != 0) * select(2.0, 1.0, dy != 0);
            nb += dLies(y * p.w + x, p.flag == 1u) * gw;
        }
    }
    let o = g.y * p.w + g.x;
    if (p.flag == 1u) { dA[o] = nb / 16.0; } else { dB[o] = nb / 16.0; }
}

// Der Schlüssel eines Texels der Stufe: die geglättete Deckung (+ die eigene als Gleichstand), 0 ohne eigene Deckung
fn schluessel(i: u32) -> f32 {
    let s = summe[p.ziel + i].a;
    if (s <= 0.0) { return 0.0; }
    return select(dA[i], dB[i], p.flag == 1u) + 1e-6 * s / p.fuss;
}

// DIE DECKUNGSTREUE WAHL je Ansicht: genau M = min(positiv, round(Deckung₀ · nA)) Texel decken — die Grenze ist der
// M-größte Schlüssel (Halbierung über die Bits nicht-negativer Zahlen: exakt, 31 Schritte)
var<workgroup> wz: atomic<u32>;
var<workgroup> wc: u32;
@compute @workgroup_size(256)
fn grenzeK(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
    let v = wg.x;
    let nA = p.w * p.hA;
    let basis = v * nA;
    if (li == 0u) { atomicStore(&wz, 0u); }
    workgroupBarrier();
    var n = 0u;
    for (var i = li; i < nA; i += 256u) {
        if (schluessel(basis + i) > 0.0) { n++; }
    }
    atomicAdd(&wz, n);
    workgroupBarrier();
    if (li == 0u) {
        let deck0 = f32(atomicLoad(&zahl[v])) / f32(p.w0 * p.hA0);
        wc = min(atomicLoad(&wz), u32(round(deck0 * f32(nA))));
    }
    let M = workgroupUniformLoad(&wc);
    if (M == 0u) {
        if (li == 0u) { grenze[p.gi + v] = 3.0e38; }
        return;
    }
    var lo = 0u;
    var hi = 0x7f800000u;
    loop {
        if (hi - lo <= 1u) { break; }
        let mid = lo + (hi - lo) / 2u;
        let t = bitcast<f32>(mid);
        workgroupBarrier();
        if (li == 0u) { atomicStore(&wz, 0u); }
        workgroupBarrier();
        var c = 0u;
        for (var i = li; i < nA; i += 256u) {
            if (schluessel(basis + i) >= t) { c++; }
        }
        atomicAdd(&wz, c);
        workgroupBarrier();
        if (li == 0u) { wc = atomicLoad(&wz); }
        let zahlT = workgroupUniformLoad(&wc);
        if (zahlT >= M) { lo = mid; } else { hi = mid; }
    }
    if (li == 0u) { grenze[p.gi + v] = bitcast<f32>(lo); }
}

fn srgb(x: f32) -> f32 {
    if (x <= 0.0031308) { return 12.92 * x; }
    return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}
fn q565(c: vec3<f32>) -> u32 {
    let q = vec3<u32>(round(clamp(c, vec3<f32>(0.0), vec3<f32>(1.0)) * vec3<f32>(31.0, 63.0, 31.0)));
    return (q.x << 11u) | (q.y << 5u) | q.z;
}
fn e565(c: u32) -> vec3<f32> {
    let r = (c >> 11u) & 31u;
    let g = (c >> 5u) & 63u;
    let b = c & 31u;
    return vec3<f32>(f32((r << 3u) | (r >> 2u)), f32((g << 2u) | (g >> 4u)), f32((b << 3u) | (b >> 2u))) / 255.0;
}

// BC1 einer Stufe (vormultipliziert, binär: ein Block mit Lücke fährt den 3-Farben-Modus, Index 3 = transparent
// schwarz); die Endpunkte auf der Hauptachse der deckenden Farben (Potenz-Iteration), die Farbe sRGB wie die Schicht
@compute @workgroup_size(8, 8)
fn bc1(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w / 4u || g.y >= p.h / 4u) { return; }
    var col: array<vec3<f32>, 16>;
    var ok: array<bool, 16>;
    var n = 0u;
    var mitte = vec3<f32>(0.0);
    let gr = grenze[p.gi + (g.y * 4u) / p.hA];
    for (var t = 0u; t < 16u; t++) {
        let x = g.x * 4u + (t & 3u);
        let y = g.y * 4u + (t >> 2u);
        var o = false;
        var c = vec3<f32>(0.0);
        if (p.k == 0u) {
            o = deckt(x, y);
            if (o) { c = textureLoad(tAlb, vec2<i32>(i32(x), i32(y)), 0).rgb; }
        } else {
            let i = y * p.w + x;
            let s = summe[p.ziel + i];
            o = s.a > 0.0 && schluessel(i) >= gr;
            if (o) { c = s.rgb / s.a; }
        }
        ok[t] = o;
        if (o) {
            col[t] = vec3<f32>(srgb(c.r), srgb(c.g), srgb(c.b));
            mitte += col[t];
            n++;
        }
    }
    let o2 = p.aus + g.y * p.zeile + g.x * 2u;
    if (n == 0u) {
        aus[o2] = 0u;
        aus[o2 + 1u] = 0xffffffffu;
        return;
    }
    mitte /= f32(n);
    var c00 = 0.0; var c01 = 0.0; var c02 = 0.0; var c11 = 0.0; var c12 = 0.0; var c22 = 0.0;
    for (var t = 0u; t < 16u; t++) {
        if (!ok[t]) { continue; }
        let d = col[t] - mitte;
        c00 += d.x * d.x; c01 += d.x * d.y; c02 += d.x * d.z;
        c11 += d.y * d.y; c12 += d.y * d.z; c22 += d.z * d.z;
    }
    let C = mat3x3<f32>(vec3<f32>(c00, c01, c02), vec3<f32>(c01, c11, c12), vec3<f32>(c02, c12, c22));
    var ax = vec3<f32>(0.577, 0.577, 0.577);
    for (var it = 0; it < 8; it++) {
        let a2 = C * ax;
        let l = length(a2);
        if (l < 1e-9) { break; }
        ax = a2 / l;
    }
    var tmin = 1e9;
    var tmax = -1e9;
    for (var t = 0u; t < 16u; t++) {
        if (!ok[t]) { continue; }
        let d = dot(col[t] - mitte, ax);
        tmin = min(tmin, d);
        tmax = max(tmax, d);
    }
    var c0 = q565(mitte + ax * tmax);
    var c1 = q565(mitte + ax * tmin);
    let luecke = n < 16u;
    if ((luecke && c0 > c1) || (!luecke && c0 < c1)) {
        let s = c0;
        c0 = c1;
        c1 = s;
    }
    let p0 = e565(c0);
    let p1 = e565(c1);
    var pal: array<vec3<f32>, 4>;
    pal[0] = p0;
    pal[1] = p1;
    var np = 3u;
    if (c0 > c1) {
        pal[2] = (2.0 * p0 + p1) / 3.0;
        pal[3] = (p0 + 2.0 * p1) / 3.0;
        np = 4u;
    } else {
        pal[2] = (p0 + p1) * 0.5;
    }
    var bits = 0u;
    for (var t = 0u; t < 16u; t++) {
        var idx = 3u;
        if (ok[t]) {
            var best = 1e9;
            for (var j = 0u; j < np; j++) {
                let d = col[t] - pal[j];
                let e = dot(d, d);
                if (e < best) { best = e; idx = j; }
            }
        }
        bits |= idx << (2u * t);
    }
    aus[o2] = c0 | (c1 << 16u);
    aus[o2 + 1u] = bits;
}

// Die Normale: die volle Bühne um eine Stufe gemittelt (Karten-Gesetz „normalTeiler" 2) — es zählen nur deckende Texel, jede
// Stufe hält die SUMME (ihr Betrag ist die Deckung), erst die Ablage normiert. Bis S2b trug ein leerer Texel (0, 0, 1) in das
// Mittel jeder Stufe: die Normale der lichten Krone kippte zum Auge, ihre Sonne fiel (Radeon, Genesis Ego, Sonne 74°: das
// Sonnen-Licht der Karte 33–54 % ihrer L1, das des Himmels 96–97 %)
// Die Normale reist oktaedrisch (F6): zwei Kanäle tragen die ganze Kugel, auch die Rückseite der Krone (Bühne und Kartenstoff
// rechnen dieselbe Abbildung)
fn oktAuf(e: vec2<f32>) -> vec3<f32> {
    var n = vec3<f32>(e, 1.0 - abs(e.x) - abs(e.y));
    let t = max(-n.z, 0.0);
    n.x += select(t, -t, n.x >= 0.0);
    n.y += select(t, -t, n.y >= 0.0);
    return normalize(n);
}
fn oktZu(n: vec3<f32>) -> vec2<f32> {
    let o = n.xy / (abs(n.x) + abs(n.y) + abs(n.z));
    let s = select(vec2<f32>(-1.0), vec2<f32>(1.0), o >= vec2<f32>(0.0));
    return select(o, (1.0 - abs(o.yx)) * s, n.z < 0.0);
}
fn nDek(x: u32, y: u32) -> vec3<f32> {
    if (!deckt(x, y)) { return vec3<f32>(0.0); }
    return oktAuf(textureLoad(tNrm, vec2<i32>(i32(x), i32(y)), 0).xy * 2.0 - 1.0);
}
@compute @workgroup_size(16, 16)
fn normalK(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    var s = vec3<f32>(0.0);
    if (p.k == 1u) {
        s = nDek(g.x * 2u, g.y * 2u) + nDek(g.x * 2u + 1u, g.y * 2u) + nDek(g.x * 2u, g.y * 2u + 1u) +
            nDek(g.x * 2u + 1u, g.y * 2u + 1u);
    } else {
        let wq = p.w * 2u;
        let q = p.quelle + (g.y * 2u) * wq + g.x * 2u;
        s = nsum[q].xyz + nsum[q + 1u].xyz + nsum[q + wq].xyz + nsum[q + wq + 1u].xyz;
    }
    nsum[p.ziel + g.y * p.w + g.x] = vec4<f32>(s, 0.0);
}

// Die Normale eines Texels der Stufe für die Ablage: die Richtung seiner Summe; ein leerer trägt die seiner deckenden
// Nachbarn in der eigenen Ansicht (3×3) — der Filter der Welt mischt an der Silhouette keine fremde Normale hinein —, erst
// ohne sie (0, 0, 1)
fn nAblage(x: u32, y: u32) -> vec2<f32> {
    var s = nsum[p.ziel + y * p.w + x].xyz;
    if (dot(s, s) < 1e-12) {
        let y0 = (y / p.hA) * p.hA;
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                let xx = u32(clamp(i32(x) + dx, 0, i32(p.w) - 1));
                let yy = y0 + u32(clamp(i32(y - y0) + dy, 0, i32(p.hA) - 1));
                s += nsum[p.ziel + yy * p.w + xx].xyz;
            }
        }
    }
    let l = length(s);
    return oktZu(select(vec3<f32>(0.0, 0.0, 1.0), s / l, l > 1e-6));
}

// BC4 eines Kanals (0..1): Endpunkte min/max im 8-Werte-Modus, der nächste Schritt je Texel
fn bc4(w: array<f32, 16>) -> vec2<u32> {
    var mn = 1.0;
    var mx = 0.0;
    for (var t = 0u; t < 16u; t++) {
        mn = min(mn, w[t]);
        mx = max(mx, w[t]);
    }
    let e0 = u32(round(clamp(mx, 0.0, 1.0) * 255.0));
    let e1 = u32(round(clamp(mn, 0.0, 1.0) * 255.0));
    var lo = 0u;
    var hi = 0u;
    if (e0 > e1) {
        for (var t = 0u; t < 16u; t++) {
            let f = clamp((f32(e0) - w[t] * 255.0) / f32(e0 - e1) * 7.0, 0.0, 7.0);
            let st = u32(round(f));
            var idx = st + 1u;
            if (st == 0u) { idx = 0u; } else if (st == 7u) { idx = 1u; }
            let b = 3u * t;
            if (b + 3u <= 32u) { lo |= idx << b; } else if (b >= 32u) { hi |= idx << (b - 32u); } else {
                lo |= (idx & 3u) << 30u;
                hi |= idx >> 2u;
            }
        }
    }
    return vec2<u32>(e0 | (e1 << 8u) | ((lo & 0xffffu) << 16u), (lo >> 16u) | (hi << 16u));
}
@compute @workgroup_size(8, 8)
fn bc5(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w / 4u || g.y >= p.h / 4u) { return; }
    var rx: array<f32, 16>;
    var ry: array<f32, 16>;
    for (var t = 0u; t < 16u; t++) {
        let n = nAblage(g.x * 4u + (t & 3u), g.y * 4u + (t >> 2u)) * 0.5 + 0.5;
        rx[t] = n.x;
        ry[t] = n.y;
    }
    let a = bc4(rx);
    let b = bc4(ry);
    let o = p.aus + g.y * p.zeile + g.x * 4u;
    aus[o] = a.x;
    aus[o + 1u] = a.y;
    aus[o + 2u] = b.x;
    aus[o + 3u] = b.y;
}

// Die Sonnen-Sicht auf 1/lichtTeiler (p.t): das Mittel über die deckenden Texel des Fußabdrucks, ein Fußabdruck ohne
// Blatt trägt das Mittel der Schicht (der Filter mischt an der Kante keinen fremden Wert hinein); rg8 (r der Zenit, g der
// 45°-Kranz, F6), 2 Texel je Wort
@compute @workgroup_size(64)
fn sicht(@builtin(global_invocation_id) g: vec3<u32>) {
    let je = p.w / 2u;
    let y = g.x / je;
    if (y >= p.h) { return; }
    let wx = g.x - y * je;
    let zz = atomicLoad(&zahl[p.V + 1u]);
    var mittel = vec2<f32>(1.0);
    if (zz > 0u) {
        mittel = vec2<f32>(f32(atomicLoad(&zahl[p.V])), f32(atomicLoad(&zahl[p.V + 2u]))) / f32(zz) / 255.0;
    }
    var wort = 0u;
    for (var j = 0u; j < 2u; j++) {
        let x = wx * 2u + j;
        var s = vec2<f32>(0.0);
        var n = 0.0;
        for (var dy = 0u; dy < p.t; dy++) {
            for (var dx = 0u; dx < p.t; dx++) {
                let sx = x * p.t + dx;
                let sy = y * p.t + dy;
                if (deckt(sx, sy)) {
                    s += textureLoad(tSicht, vec2<i32>(i32(sx), i32(sy)), 0).rb;
                    n += 1.0;
                }
            }
        }
        var wert = mittel;
        if (n > 0.0) { wert = s / n; }
        let q = vec2<u32>(round(clamp(wert, vec2<f32>(0.0), vec2<f32>(1.0)) * 255.0));
        wort |= (q.x | (q.y << 8u)) << (16u * j);
    }
    aus[p.aus + y * p.zeile + wx] = wort;
}
`;
