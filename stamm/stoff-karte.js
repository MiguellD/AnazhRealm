class AnazhRealm_stoff_karte {
    // ===== ATLAS · Stoff/karte — Der EINE Karten-Atlas · die Karte backt in der Welt, je Takt ein Hebungs-Ring · GPU-Ablage: deckungstreue Mips und der Saum der Art =====
    // DER EINE KARTEN-ATLAS (W6): jede Impostor-Karte — Foundry-Art × Gestalt [× ov], gestreut und gesetzt — ist EINE
    // Schicht einer Array-Textur (Albedo, Normale, Sonnen-Sicht), ihre HEBUNGS-RINGE (lod.K3, phyto-core `karteRinge`) als
    // Bänder untereinander, je Ring V Peilungen, wie der Welt-Renderer sie zeichnet (Zeile 0 oben; der Ring 0° in voller
    // Zelle, jeder andere in ¼ der Zellfläche, zwei Ansichten je Zeile). EIN Material, EIN Einheits-Quad, EINE globale Instanz-Gruppe
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
            V: 0, // die Peilungen je Ring
            ringe: null, // __phytoCore.karteRinge: die Hebungs-Ringe der Schicht (Hebung, Teiler, erste Zeile, Höhe)
            offen: null, // die halb gebackene Karte {z, B, r: ihr nächster Ring}: ihr gehört die Bühne bis zum letzten Ring
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
            typeof core.karteRinge !== "function" ||
            typeof core.karteGlaetteGaenge !== "function" ||
            typeof core.karteSaumRinge !== "function" ||
            !core.KARTEN_GESETZ ||
            !core.KARTEN_GESETZ.lichtTeiler
        )
            return AnazhRealm._kernPflichtBruch(
                "phyto:karteMasse/karteRinge/karteGlaetteGaenge/karteSaumRinge/KARTEN_GESETZ.lichtTeiler"
            );
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
            // DIE HEBUNGS-RINGE (lod.K3): die Tafel des Karten-Gesetzes aus dem Rezept — höchstens vier (der Rechner der
            // Ablage trägt sie in einem vec4); ein Maß-Bruch bricht laut, nie eine Karte, die still nur waagrecht sieht
            at.ringe = core.karteRinge(ic.views, ic.cellW, ic.cellH, ic.hebungen, ic.ringTeiler);
            if (!at.ringe || at.ringe.ringe.length > 4)
                return AnazhRealm._kernPflichtBruch("terrain:PORTAL_RENDER_CONFIG.impostor.hebungen/ringTeiler");
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
            at.masse = core.karteMasse(at.cw, at.ch, at.V, at.nt, at.fmt, at.ringe);
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
            at.offen = null; // die halbe Karte stand im alten Ziel: sie beginnt beim ersten Ring
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
            hebungen: at.ringe ? at.ringe.ringe.map((r) => r.hebung) : null, // lod.K3 — die Ringe der Schicht
            schichtB: M ? (at.fmt === "bc" ? M.aBytes + M.nBytes + M.lBytes : M.w * M.h * 16) : 0,
            // bc: die Stufen der drei Schichten · rgba8: drei rgba8-Ziele voller Größe mit Mips (4/3)
            mb: !M
                ? 0
                : at.fmt === "bc"
                  ? +(((M.aBytes + M.nBytes + M.lBytes) * at.cap) / 1048576).toFixed(2)
                  : +((M.w * M.h * 4 * 3 * (4 / 3) * at.cap) / 1048576).toFixed(2),
            weltMs: at.weltMs ? at.weltMs.slice() : null,
            schrittMs: at.schrittMs ? at.schrittMs.slice() : null, // je Ring-Schritt: die Last EINES Takts
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
        // die halbe Karte (`at.offen`: ihr nächster Ring); fiel ihre Zelle, ist die Bühne frei
        if (at.offen) {
            const o = at.offen.z;
            if (o.gescheitert || at.zellen.get(o.key) !== o) at.offen = null;
        }
        // DIE LEINE FRAGT DIE KARTE, NIE DEN RING (lod.K3): die Karte ist GPU-Arbeit wie das Bild — sie BEGINNT an der EINEN
        // Leine (`_gpuLeineStraff`), und jeder Takt, der zeichnete, bindet sich an (`_gpuLeineBinden`): auf einer langsamen GPU
        // wartet so das nächste Bild auf sie, statt hinter ihr zu verhungern. Eine begonnene Karte backt ihre übrigen Ringe Takt
        // um Takt ohne neue Frage, an gespannter Leine nur sie — fragte jeder Ring, zöge jeder ein Bild hinter sich her
        // (swiftshader, Mess-Wiese: ein Bild 10,7 s GPU, die Karte mit vier Ringen 3,3 s; je Ring gefragt stand das Weltbild
        // der 19 Karten nach 701,7 s und 82 Bildern, je Karte nach 243,4 s und 31). Steht einer ihrer Ringe nicht ganz
        // (`at.offen.frage`), fragt sie wieder: die Queue wächst je Karte um höchstens ihre Ringe.
        const nurHalbe = this._gpuLeineStraff();
        if (nurHalbe && !(at.offen && !at.offen.frage)) return 0;
        const d2 = (k) => {
            const z = at.zellen.get(k);
            return z && Number.isFinite(z._bedarfD2) ? z._bedarfD2 : 1e30;
        };
        q.sort((a, b) => d2(a) - d2(b));
        // die halbe Karte zuerst
        if (at.offen && q.includes(at.offen.z.key)) q.unshift(...q.splice(q.indexOf(at.offen.z.key), 1));
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
            if (nurHalbe && !(at.offen && at.offen.z === z)) break; // an gespannter Leine nur die begonnene Karte
            const e = this._karteWeltBacken(at, z);
            // null: die L1 reist, ein Bürger der Bühne wartet auf seine Pipeline oder die Bühne trägt eine halbe Karte;
            // 0: ein Ring steht — im Budget backt derselbe Takt den nächsten
            if (e === null || e === 0) {
                if (e === null) i++;
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

    // Die Bühne ruht: ist die Schlange leer, geben ihre Ziele und Rechen-Puffer (~19 MB VRAM mit den Hebungs-Ringen: die
    // Schicht 7,3 · die Sonnen-Kacheln 5,2 · die Rechen-Puffer 6,3) nach KARTE_BUEHNE_RUHE_MS ihren Speicher frei — die nächste
    // Karte legt ihn neu an; Szene, MRT-Knoten und Programme bleiben (sie hängen an den Formaten, nie am Speicher).
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
            laub: new T.Box3(), // die Hülle des Laubs der Gestalt (der Kronen-Fuß des Saums)
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

    // Eine Karte im Welt-Renderer backen, JE AUFRUF EIN HEBUNGS-RING (lod.K3): null = die Platte antwortet noch, die L1 reist
    // (bestellt), ihre Programme kompilieren oder die Bühne trägt die halbe Karte einer anderen Zelle (`at.offen`), false =
    // gescheitert, 0 = ein Ring steht, die Karte noch nicht (der nächste Aufruf backt den nächsten), true = gebacken (oder
    // von der Platte gelegt). Der erste Ring trägt die Sonnen-Kacheln — ein Schritt kostet so viel wie die Karte mit einem
    // Ring, nie das Vielfache (`schrittMs`).
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
        if (at.offen && at.offen.z !== z) return null; // die Bühne trägt die halbe Karte einer anderen Zelle
        // fiel die Bühne zwischen zwei Ringen (Ruhe, ein anderer Renderer), beginnt die Karte beim ersten
        if (at.offen && (at.offen.B !== B || !B.bereit)) at.offen = null;
        const iR = at.offen ? at.offen.r : 0; // der Ring dieses Schritts
        const ringe = at.ringe.ringe;
        const ring = ringe[iR];
        const t0 = performance.now();
        // die Gestalt auf die Bühne: dieselben Geometrien und Stoffe, die die Welt zeichnet
        B.wurzel.clear();
        B.wurzel.rotation.set(0, 0, 0);
        let rad2 = 0;
        let h = 0;
        const laub = []; // die Laub-Hüllen: ihr tiefster Punkt ist der Kronen-Fuß des Saums (`_karteSaumVon`)
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
            // die Sippe ist die EINE Material-Identität des Gesetzes (phyto-core `budgetStoff`): sie beginnt mit der Art
            if (/^foliage/.test(c.userData.__sippe || "")) laub.push(m);
            rad2 = core.scanRadialXZ(c.geometry.attributes.position.array, rad2);
        }
        B.wurzel.updateMatrixWorld(true);
        B.laub.makeEmpty();
        for (const m of laub) B.laub.expandByObject(m);
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
        // DER RING DER HEBUNG (lod.K3): die Kamera blickt aus der Hebung e auf die Mitte des Rahmens (Stammachse, halfH), ihr
        // Ausschnitt deckt den Zylinder des Rahmens (phyto-core `karteRingHalbe`, dieselbe Formel liest der Stoff); der Ring 0°
        // ist der waagrechte Blick
        const e = (ring.hebung * Math.PI) / 180;
        const abst = Math.max(fr.halfW * 2.5, box.max.y) + 40;
        const hh = core.karteRingHalbe(core.WIND_ZAHLEN, fr.halfH, fr.halfW, e);
        const cam = B.kamera;
        cam.left = -fr.halfW;
        cam.right = fr.halfW;
        cam.top = hh;
        cam.bottom = -hh;
        cam.up.set(0, Math.cos(e), -Math.sin(e));
        cam.position.set(0, fr.halfH + abst * Math.sin(e), abst * Math.cos(e));
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
        // die Karte ist Sommer gebacken (volle Krone, wie der Studio-Bäcker): das Jahr der Welt (`uLaubPraesenz`) hält still
        const su = this.state.seasonUniforms;
        still(su && su.uLaubPraesenz, (w) => w.set(1, 1));
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
        const letzter = iR === ringe.length - 1;
        // die Zelle der Peilung a im Ring: τ Ansichten je Zeile, je (cw/τ) × (ch/τ) (phyto-core `karteRinge`)
        const tR = ring.teiler,
            bw = at.cw / tR,
            bh = at.ch / tR;
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
            // die Sonnen-Kacheln: die Krone aus jeder Richtung (Baum-Raum, Drehung 0), ihre Tiefe liest danach die Sicht — im
            // ersten Ring; die Ringe danach lesen dieselben Kacheln (die Bühne gehört der Zelle bis zum letzten Ring)
            B.tiefe.value = B.leer.depthTexture;
            const R = Math.max(fr.halfW, fr.halfH) * 1.15;
            B.mitte.set(0, fr.halfH, 0);
            const L = B.licht;
            Object.assign(L, { left: -R, right: R, top: R, bottom: -R, near: 0.1, far: R * 6 });
            L.coordinateSystem = rend.coordinateSystem;
            for (let j = 0; iR === 0 && j < B.dirs.length; j++) {
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
                // Ansicht v des Rings = die Gestalt aus Peilung v·360/V unter seiner Hebung (Kamera fest, Gestalt
                // gegengedreht) in ihrer Zelle; WebGPU zeichnet von oben — der Stoff liest gespiegelt
                B.wurzel.rotation.y = -v * dreh;
                B.wurzel.updateMatrixWorld(true);
                B.uBaum.value.makeRotationY(v * dreh); // Welt → Baum
                rend.autoClear = iR === 0 && v === 0; // die erste Ansicht leert die Schicht (Farbe 0 = leer, Tiefe)
                const zx = (v % tR) * bw,
                    zy = ring.y + Math.floor(v / tR) * bh;
                if (bc) {
                    B.ziel.viewport.set(zx, zy, bw, bh);
                    rend.setRenderTarget(B.ziel);
                } else {
                    at.rt.viewport.set(zx, zy, bw, bh);
                    // die Mips nach der letzten Ansicht des letzten Rings
                    for (const t of at.rt.textures) t.generateMipmaps = letzter && v === V - 1;
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
        if (!ganz) {
            if (at.offen) at.offen.frage = true; // ihr nächster Ring fragt wieder die Leine (`_tickKarteWelt`)
            return null;
        }
        const summe = at.offen ? at.offen.ms : 0;
        (at.schrittMs || (at.schrittMs = [])).push(+(performance.now() - t0).toFixed(2));
        if (!letzter) {
            at.offen = { z, B, r: iR + 1, ms: summe + performance.now() - t0 };
            return 0;
        }
        at.offen = null;
        const platte = z._liefer && {
            preset: z.preset,
            rest: z._liefer.rest,
            frame: { halfW: fr.halfW, halfH: fr.halfH },
        };
        if (bc) this._karteAblage(at, z.idx, B, platte, this._karteSaumVon(at, z, fr, B.laub));
        B.zuletzt = performance.now();
        this._foundryLiefer(this._foundry, "haupt", "karte", z._liefer, summe + B.zuletzt - t0);
        (at.weltMs || (at.weltMs = [])).push(+(summe + B.zuletzt - t0).toFixed(2));
        z._weltNeu = false;
        if (!z.gebacken) this._karteGebacken(z, fr);
        return true;
    }

    // DER SAUM DER KARTE JE HEBUNGS-RING (w4-laub-saum, phyto-core `karteSaumRinge`): die Blattgröße der Art aus ihrem Gesetz
    // (`treeParams` der Nah-Stufe, mit dem Samen der Gestalt — dieselbe Ableitung, aus der ihr Körper wächst), Laub oder Nadel,
    // im Bild JEDES Rings, und sein Kronen-Fuß aus der Laub-Hülle der L1 (ihr tiefster Punkt, ihr Radius um die Stammachse).
    // Bis hierher trug nur der waagrechte Ring den Saum, die gehobenen wählten die geglättete Hülle — und der Blick von unten
    // liest den Ring −20°. [e je Ring, Fuß je Ring, nadel, Stärke] für die GPU-Ablage (`saumK`); ohne Krone (keine Pflanzen-Art,
    // kein Laub) Fuß −1: jede Zeile wählt mit dem geglätteten Schlüssel.
    _karteSaumVon(at, z, fr, laub) {
        const pc = globalThis.__phytoCore;
        const tab = globalThis.__terrainCore && globalThis.__terrainCore.PHYTO_PRESETS;
        const rec = tab && tab[z.preset];
        const s =
            rec && rec.s && (rec.kind === "tree" || rec.kind === "shrub") && !laub.isEmpty()
                ? pc.karteSaumRinge(
                      pc.treeParams(rec.s, z.variant, 0, rec, 0),
                      fr.halfH,
                      fr.halfW,
                      {
                          minY: laub.min.y,
                          R: Math.hypot(Math.max(-laub.min.x, laub.max.x), Math.max(-laub.min.z, laub.max.z)),
                      },
                      at.ringe.ringe,
                      at.ch
                  )
                : null;
        const aus = new Float32Array(12).fill(-1, 4, 8);
        if (!s) return aus;
        s.ringe.forEach((r, i) => ((aus[i] = r.e), (aus[4 + i] = r.fuss)));
        aus[8] = s.nadel ? 1 : 0;
        aus[9] = pc.KARTEN_GESETZ.saum;
        return aus;
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
                S(11, { buffer: { type: "uniform" } }), // der Saum der Karte (`_karteSaumVon`), je Bake
            ],
        });
        const modul = dev.createShaderModule({ label: "karte-rechner", code: AnazhRealm.KARTE_RECHNER_WGSL });
        const satz = (this._karteRechnerSatz = { bereit: false, layout, pipes: {}, dev });
        const pl = dev.createPipelineLayout({ bindGroupLayouts: [layout] });
        const namen = ["stufe0", "summeK", "glaette", "saumK", "grenzeK", "bc1", "normalK", "bc5", "sicht"];
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
        // DIE RINGE IM RECHNER (lod.K3): je Ring seine erste Zeile und sein Teiler (0 = kein Ring) — Ansicht und Feld eines
        // Texels rechnet der Rechner daraus (`ansicht`, `feld`); V zählt die Ansichten aller Ringe
        const rg = at.ringe.ringe;
        const V = at.V * rg.length,
            W = M.w,
            H = M.h;
        const ringTafel = [0, 1, 2, 3]
            .map((i) => (rg[i] ? rg[i].y : 0))
            .concat([0, 1, 2, 3].map((i) => (rg[i] ? rg[i].teiler : 0)));
        const pad = (b) => Math.ceil(b / 256) * 256;
        const slots = [];
        const zuege = [];
        const kopien = [];
        let ausB = 0;
        const zug = (pipe, p, x, y) => {
            const s = new ArrayBuffer(96);
            const u = new Uint32Array(s),
                f = new Float32Array(s);
            const ord = [
                "w",
                "h",
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
            u.set(ringTafel, 16);
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
        const base = { V, thr: G.schwelle, w0: W, hA0: at.ch };
        zug("stufe0", Object.assign({}, base, { w: W, h: H }), Math.ceil(W / 16), Math.ceil(H / 16));
        // Albedo: Stufe 0 binär, k ≥ 1 deckungstreu
        let so = 0;
        let quelle = 0;
        for (let k = 0; k < M.a.length; k++) {
            const wk = W >> k,
                hk = H >> k,
                fuss = 1 << (2 * k);
            let flag = 0;
            if (k > 0) {
                zug(
                    "summeK",
                    Object.assign({}, base, { w: wk, h: hk, k, quelle, ziel: so, fuss }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                const gaenge = globalThis.__phytoCore.karteGlaetteGaenge(k);
                for (let gg = 0; gg < gaenge; gg++)
                    zug(
                        "glaette",
                        Object.assign({}, base, { w: wk, h: hk, k, flag: gg & 1 }),
                        Math.ceil(wk / 16),
                        Math.ceil(hk / 16)
                    );
                // DER SAUM (phyto-core `karteSaum`): der Schlüssel der Wahl — über dem Kronen-Fuß die Deckung des Fußabdrucks
                // und das Muster der Art, darunter die geglättete Deckung (im Puffer `flag` der Glätte) — in den anderen Puffer;
                // Grenze und Ablage lesen ihn
                zug(
                    "saumK",
                    Object.assign({}, base, { w: wk, h: hk, k, ziel: so, fuss, flag: gaenge & 1 }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                flag = 1 - (gaenge & 1);
                zug("grenzeK", Object.assign({}, base, { w: wk, h: hk, k, ziel: so, fuss, flag, gi: k * V }), V, 1);
            }
            const a = ablage(0, k, wk, hk, 8);
            zug(
                "bc1",
                Object.assign({}, base, {
                    w: wk,
                    h: hk,
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
                Object.assign({}, base, { w: wj, h: hj, k: j + 1, ziel: no, aus: a.aus, zeile: a.zeile }),
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
            grenze: mk("grenze", M.a.length * V * 8, U.STORAGE), // je Stufe und Ansicht (Grenzwert-Bits, Lage)
            aus: mk("aus", ausB, U.STORAGE | U.COPY_SRC),
            saum: mk("saum", 48, U.UNIFORM | U.COPY_DST), // [e je Ring, Kronen-Fuß je Ring, nadel, Stärke] je Bake (`_karteSaumVon`)
        };
        const roh = new Uint8Array(slots.length * 256);
        slots.forEach((u, i) => roh.set(new Uint8Array(u.buffer), i * 256));
        dev.queue.writeBuffer(P.param, 0, roh);
        return { P, puffer: Object.values(P), zuege, kopien, ausB, gruppe: null, quellen: null };
    }

    // DIE ABLAGE: die GPU zieht aus der Bühne die Stufen der Schicht und kodiert sie, die Kopien legen sie in die Schicht
    // `idx` der Atlas-Texturen. Mit `platte` ({preset, rest, frame}, die Platte trägt die Karte nicht) reisen dieselben Bytes
    // zurück und per Transfer in den Faden der Schale (`karte-ablage`) — der Haupt-Faden schreibt keine Platte. `saum`
    // ([e je Ring, Kronen-Fuß je Ring, nadel, Stärke], `_karteSaumVon`) liest die Wahl der Stufen (`saumK`).
    _karteAblage(at, idx, B, platte, saum) {
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
                    { binding: 0, resource: { buffer: P.param, size: 96 } },
                    ...quellen.map((q, i) => ({ binding: 1 + i, resource: q.createView() })),
                    ...["summe", "nsum", "dA", "dB", "zahl", "grenze", "aus", "saum"].map((n, i) => ({
                        binding: 4 + i,
                        resource: { buffer: P[n] },
                    })),
                ],
            });
        }
        dev.queue.writeBuffer(plan.P.saum, 0, saum);
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
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_karte]);

// ===== ATLAS · Stoff/karte — Außen-Konstanten =====
// W4.3 — die EINE Bake-Uhr: die Anfrage-Frist des Studio-Bakes (Worker-Reply); danach null → Retry, dann gescheitert
// (der Flatten serviert Geometrie). Der Tick-Watchdog greift 2 s später (ein Versprechen, das nie abschließt). Befund
// 30.09.: eine zweite, engere Uhr (15 s) gab Bakes auf, während der SERIELLE Worker noch rechnete, und schob den
// nächsten nach — auf langsamem Holz eine Kaskade (7 hängend, 3 gescheitert, 0 gebacken; die schweren nahen Arten zuerst).
// W6 — DIE EINE Karten-Gruppe: jede Impostor-Instanz jeder Art (Streu, gesetzt, Band-Partner) zeichnet in DIESER
// globalen Gruppe (`_archInstanceGroupFor`), die Schicht wählt aKarte.x (`_impostorAtlas`).
AnazhRealm.IMPOSTOR_ATLAS_GRUPPE = "impostor#fimp:atlas";
// Der Karten-Atlas wächst je 2 Schichten (`_impostorAtlasTexturen`, Start 8): je Schicht 0,49 MiB mit den Hebungs-Ringen (lod.K3:
// BC1-Albedo 298 KB + RGTC2-Normale 149 KB + Sonnen-Sicht 56 KB, 128 × 3584 samt Mips; waagrecht allein 0,28 MiB), das Wachsen
// kopiert nur beim Einzug einer Art (Mess-Wiese 18 Karten in 18 Schichten).
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
    w: u32, h: u32, k: u32, quelle: u32,
    ziel: u32, V: u32, fuss: f32, aus: u32,
    zeile: u32, thr: f32, flag: u32, w0: u32,
    hA0: u32, gi: u32, t: u32,
    ringY: vec4<u32>, ringT: vec4<u32>,
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
@group(0) @binding(9) var<storage, read_write> grenze: array<u32>;
@group(0) @binding(10) var<storage, read_write> aus: array<u32>;

fn deckt(x: u32, y: u32) -> bool {
    return textureLoad(tAlb, vec2<i32>(i32(x), i32(y)), 0).a >= p.thr;
}

// DIE ANSICHT EINES TEXELS (lod.K3, die Hebungs-Ringe): die Schicht trägt ihre Ringe als Bänder untereinander (ringY ihre
// erste Zeile auf Stufe 0, ringT ihr Teiler, 0 = kein Ring); im Ring mit Teiler τ liegen τ Ansichten je Zeile, je
// (w0/τ) × (hA0/τ) Texel. „ansicht" nennt die Ansicht eines Texels der Stufe p.k (über alle Ringe gezählt), „feld" ihr
// Rechteck (x, y, Breite, Höhe) auf der Stufe p.k
fn jeRing() -> u32 {
    var n = 0u;
    for (var i = 0u; i < 4u; i++) { if (p.ringT[i] > 0u) { n++; } }
    return p.V / n;
}
fn feld(v: u32) -> vec4<u32> {
    let i = v / jeRing();
    let a = v % jeRing();
    let t = p.ringT[i];
    let b = (p.w0 / t) >> p.k;
    let h = (p.hA0 / t) >> p.k;
    return vec4<u32>((a % t) * b, (p.ringY[i] >> p.k) + (a / t) * h, b, h);
}
fn ansicht(x: u32, y: u32) -> u32 {
    var i = 0u;
    for (var j = 1u; j < 4u; j++) { if (p.ringT[j] > 0u && y >= (p.ringY[j] >> p.k)) { i = j; } }
    let t = p.ringT[i];
    return i * jeRing() + ((y - (p.ringY[i] >> p.k)) / ((p.hA0 / t) >> p.k)) * t + x / ((p.w0 / t) >> p.k);
}
// der Index des Texels i (zeilenweise) im Feld f
fn imFeld(f: vec4<u32>, i: u32) -> u32 {
    return (f.y + i / f.z) * p.w + f.x + i % f.z;
}

// Stufe 0: die Deckung je Ansicht und die Sonnen-Sicht über die deckenden Texel (zahl: [0, V) Deckung, V Summe des Zenits,
// V+1 Zahl, V+2 Summe des 45°-Kranzes)
@compute @workgroup_size(16, 16)
fn stufe0(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    if (!deckt(g.x, g.y)) { return; }
    atomicAdd(&zahl[ansicht(g.x, g.y)], 1u);
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
    let f = feld(ansicht(g.x, g.y));
    var nb = 0.0;
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            let x = u32(clamp(i32(g.x) + dx, i32(f.x), i32(f.x + f.z) - 1));
            let y = u32(clamp(i32(g.y) + dy, i32(f.y), i32(f.y + f.w) - 1));
            let gw = select(2.0, 1.0, dx != 0) * select(2.0, 1.0, dy != 0);
            nb += dLies(y * p.w + x, p.flag == 1u) * gw;
        }
    }
    let o = g.y * p.w + g.x;
    if (p.flag == 1u) { dA[o] = nb / 16.0; } else { dB[o] = nb / 16.0; }
}

// DER SAUM DER KARTE JE HEBUNGS-RING (phyto-core karteSaum, karteSaumMuster — dieselben Zahlen, _karteSaumVon): e die
// Blattgröße der Art in Stufe-0-Texeln der Ansicht des Rings, fuss sein Kronen-Fuß (Stufe-0-Zeile der Ansicht; −1: keine Krone),
// art.x Nadel (1) oder Laub (0), art.y die Stärke
struct Saum { e: vec4<f32>, fuss: vec4<f32>, art: vec4<f32> };
@group(0) @binding(11) var<uniform> saum: Saum;
fn saumHash(ix: i32, iy: i32, s: u32) -> f32 {
    var h = (bitcast<u32>(ix) * 0x27d4eb2du) ^ (bitcast<u32>(iy) * 0x165667b1u) ^ (s * 0x9e3779b9u);
    h = (h ^ (h >> 15u)) * 0x85ebca6bu;
    h = (h ^ (h >> 13u)) * 0xc2b2ae35u;
    return f32(h ^ (h >> 16u)) / 4294967296.0;
}
// Laub 1 − F1 (runde Lappen), Nadel (F2 − F1) · 1,5 (Grate zwischen den Büscheln), Zelle e
fn saumMuster(X: f32, Y: f32, e: f32, nadel: bool) -> f32 {
    let q = vec2<f32>(X, Y) / e;
    let q0 = vec2<i32>(floor(q));
    var f1 = 9.0;
    var f2 = 9.0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            let c = q0 + vec2<i32>(i, j);
            let d = length(vec2<f32>(c) + vec2<f32>(saumHash(c.x, c.y, 1u), saumHash(c.x, c.y, 8u)) - q);
            if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
        }
    }
    return select(max(0.0, 1.0 - f1), min(1.0, (f2 - f1) * 1.5), nadel);
}
// DER SCHLÜSSEL DER WAHL: über dem Kronen-Fuß die Deckung des Fußabdrucks + Stärke × (Muster − ½), das Muster nie feiner als
// zwei Texel der Stufe; darunter (der Stamm) die geglättete Deckung des Puffers flag; dazu die eigene als Gleichstand, 0 ohne
// eigene Deckung — in den anderen Puffer
@compute @workgroup_size(16, 16)
fn saumK(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    let i = g.y * p.w + g.x;
    let s = summe[p.ziel + i].a;
    var kk = 0.0;
    if (s > 0.0) {
        // die Lage in der Ansicht (ihr Feld, lod.K3) und ihr Ring: über seinem Kronen-Fuß der Saum seiner Zelle
        let v = ansicht(g.x, g.y);
        let ri = v / jeRing();
        let fe = feld(v);
        let f = f32(1u << p.k);
        let X = (f32(g.x - fe.x) + 0.5) * f;
        let Y = (f32(g.y - fe.y) + 0.5) * f;
        if (Y <= saum.fuss[ri]) {
            kk = max(1e-9, s / p.fuss + saum.art.y * (saumMuster(X, Y, max(saum.e[ri], 2.0 * f), saum.art.x > 0.5) - 0.5));
        } else {
            kk = dLies(i, p.flag == 1u);
        }
        kk += 1e-6 * s / p.fuss;
    }
    if (p.flag == 1u) { dA[i] = kk; } else { dB[i] = kk; }
}

// Der Schlüssel eines Texels der Stufe: saumK schrieb ihn in den Puffer flag (0 ohne eigene Deckung)
fn schluessel(i: u32) -> f32 {
    return select(dA[i], dB[i], p.flag == 1u);
}

// DIE DECKUNGSTREUE WAHL je Ansicht: genau M = min(positiv, round(Deckung₀ · nA)) Texel decken — die Grenze ist der
// M-größte Schlüssel (Halbierung über die Bits nicht-negativer Zahlen: exakt, 31 Schritte); vom Grenzwert selbst decken nur
// die ersten M − (Texel über ihm) nach ihrer Lage in der Ansicht (wie das Gesetz, phyto-core impostorMips): je Ansicht das
// Paar (Grenzwert-Bits, Lage)
var<workgroup> wz: atomic<u32>;
var<workgroup> wc: u32;
@compute @workgroup_size(256)
fn grenzeK(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
    let v = wg.x;
    let f = feld(v);
    let nA = f.z * f.w;
    if (li == 0u) { atomicStore(&wz, 0u); }
    workgroupBarrier();
    var n = 0u;
    for (var i = li; i < nA; i += 256u) {
        if (schluessel(imFeld(f, i)) > 0.0) { n++; }
    }
    atomicAdd(&wz, n);
    workgroupBarrier();
    if (li == 0u) {
        let t = p.ringT[v / jeRing()];
        let deck0 = f32(atomicLoad(&zahl[v])) / f32((p.w0 / t) * (p.hA0 / t));
        wc = min(atomicLoad(&wz), u32(round(deck0 * f32(nA))));
    }
    let M = workgroupUniformLoad(&wc);
    if (M == 0u) {
        if (li == 0u) {
            grenze[2u * (p.gi + v)] = bitcast<u32>(3.0e38);
            grenze[2u * (p.gi + v) + 1u] = 0u;
        }
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
            if (schluessel(imFeld(f, i)) >= t) { c++; }
        }
        atomicAdd(&wz, c);
        workgroupBarrier();
        if (li == 0u) { wc = atomicLoad(&wz); }
        let zahlT = workgroupUniformLoad(&wc);
        if (zahlT >= M) { lo = mid; } else { hi = mid; }
    }
    // DER GLEICHSTAND: über dem Grenzwert t liegen c < M Texel; die Lage j, vor der genau M − c Gleichstände liegen (Halbierung)
    let t = bitcast<f32>(lo);
    workgroupBarrier();
    if (li == 0u) { atomicStore(&wz, 0u); }
    workgroupBarrier();
    var cg = 0u;
    for (var i = li; i < nA; i += 256u) {
        if (schluessel(imFeld(f, i)) > t) { cg++; }
    }
    atomicAdd(&wz, cg);
    workgroupBarrier();
    if (li == 0u) { wc = M - atomicLoad(&wz); }
    let rest = workgroupUniformLoad(&wc);
    var jlo = 0u;
    var jhi = nA;
    loop {
        if (jhi - jlo <= 1u) { break; }
        let mid = jlo + (jhi - jlo) / 2u;
        workgroupBarrier();
        if (li == 0u) { atomicStore(&wz, 0u); }
        workgroupBarrier();
        var c = 0u;
        for (var i = li; i < mid; i += 256u) {
            if (schluessel(imFeld(f, i)) == t) { c++; }
        }
        atomicAdd(&wz, c);
        workgroupBarrier();
        if (li == 0u) { wc = atomicLoad(&wz); }
        let zahlJ = workgroupUniformLoad(&wc);
        if (zahlJ >= rest) { jhi = mid; } else { jlo = mid; }
    }
    if (li == 0u) {
        grenze[2u * (p.gi + v)] = lo;
        grenze[2u * (p.gi + v) + 1u] = jhi;
    }
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
    let gv0 = ansicht(g.x * 4u, g.y * 4u);
    let gf = feld(gv0);
    let gv = 2u * (p.gi + gv0);
    let gr = bitcast<f32>(grenze[gv]);
    let gj = grenze[gv + 1u];
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
            let kk = schluessel(i);
            o = s.a > 0.0 && (kk > gr || (kk == gr && (y - gf.y) * gf.z + (x - gf.x) < gj));
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
        let f = feld(ansicht(x, y));
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                let xx = u32(clamp(i32(x) + dx, i32(f.x), i32(f.x + f.z) - 1));
                let yy = u32(clamp(i32(y) + dy, i32(f.y), i32(f.y + f.w) - 1));
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
