class AnazhRealm_stoff_karte {
    // ===== ATLAS · Stoff/karte — Der EINE Karten-Atlas · die Karte backt in der Welt, je Takt ein Hebungs-Ring · GPU-Ablage: deckungstreue Mips und der Saum der Art · die Blende der Stufen =====
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
        const _D = AnazhRealm.LOD_DISTANCES;
        this._stufenSchirm(); // die Schwellen aus dem Gesetz des Schirms, bevor die Masken sie säen
        const u = {
            uLodRef: _T.uniform(_ref),
            uLodMaskOn: _T.uniform(st.lodMaskOn === false ? 0 : 1),
            uDitherT: _T.uniform(0),
            // DER VERSATZ DES LAUBS (A3, `_laubVersatz`): xy die Phase der Deckungs-Probe dieses Frames — die Halton-Achsen 5
            // und 7 am Frame der Geschichte (`_zeitAufloesung`), je Pixel gedreht —, z die Weite in Eingangs-Pixeln
            // (LAUB_VERSATZ), ohne zeitliche Auflösung 0
            uLaubVersatz: _T.uniform(new THREE.Vector3(0, 0, 0)),
            uLodD0: _T.uniform(_D.thresh01),
            uLodD1: _T.uniform(_D.thresh12),
            uLodFade: _T.uniform(_D.fade),
            uLodFade0: _T.uniform(_D.fade0),
            // DIE WELT-UHR IN TAKTEN (`state.weltTakt`, je Bild gespiegelt): der Eintritt einer Karte blendet an ihr ein (`aEin`)
            uLodTakt: _T.uniform(0),
            // DAS AUGE: die Welt-Position der Haupt-Kamera, je Frame gespiegelt. Jede LOD-Maske misst von
            // HIER, nie von `cameraPosition` — die ist im Schattenpass die Kaskaden-Kamera (r184:
            // `renderer.render(scene, shadow.camera)`; bis V18.529 stand sie 200 m über der Box, heute über
            // dem höchsten Werfer): dort lagen nahe Bäume 145 m „weit", jenseits jeder Stufe, und die Maske
            // verwarf ihre Schatten-Fragmente alle.
            uLodAuge: _T.uniform(new THREE.Vector3()),
            // DER STRECK der Wahrnehmungs-Distanz (die Ankunft aus der Ferne `_ankunftsFerne`, je Frame gespiegelt; kein Regler,
            // lod.K5): jede Maske misst die Auge-Distanz × uLodPerf — dieselbe Distanz, nach der die CPU die Stufen legt.
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

    // DAS RAUSCHEN DER BLENDE: Interleaved-Gradient-Noise, BYTE-GENAU __phytoCore.lodDitherIGN (52.9829189 · 0.06711056 ·
    // 0.00583715; foundry-core.js Z.212), zeitlich über uDitherT — EIN Knoten-Bauer für die Durchsicht, das Laub-Band und den
    // Ring der Karte (lod.K3). `versatz` n schiebt das Raster um n · 5,588 px (die Ring-Wahl, unkorreliert mit der Blende).
    // IN DER KASKADE STEHT DIE BLENDE AN DER WELT (schatten.K2): der Schatten-Pass liest die Blende über colorNode.a (Lehre 26) —
    // mit der Rotation je Bild (`uDitherT`, `_loopRender`) und dem Pixel der Karte als Schlüssel trug JEDER Kaskaden-Render eines
    // überblendenden Werfers (Stufen-Band, Ring der Karte) ein anderes Loch-Muster, und jede Neulage der Box (die nahe Kaskade beim
    // Gehen 6–22 Mal in 2 s) schob es gegen die Welt: der Boden unter dem Werfer flackerte in ruhender
    // Welt. In der Kaskade (orthographisch, m[3][3] = 1 — dieselbe Weiche wie `_laubVersatz`) dreht sie nicht, und ihr Schlüssel
    // ist der Index des Welt-Rasters der Kaskade (Spalte + Ursprung, Ursprung − Zeile; `_kaskadeFit` legt den Ursprung,
    // `_blendeRaster` reicht ihn je Pass), modulo `BLENDE_RASTER`: dasselbe Texel der Welt trägt in jedem Render dieselbe Schwelle.
    _ditherIGN(T, versatz) {
        const fc0 = versatz ? T.screenCoordinate.add(T.vec2(versatz * 5.588238)) : T.screenCoordinate;
        const P = AnazhRealm.BLENDE_RASTER;
        const R = this._blendeRaster();
        const welt = T.vec2(T.floor(fc0.x).add(R.x), R.y.add(16 * P).sub(T.floor(fc0.y)))
            .mod(P)
            .add(0.5);
        const kaskade = T.cameraProjectionMatrix.element(3).w.greaterThan(0.5);
        const fc = kaskade.select(welt, fc0);
        return T.fract(
            T.float(52.9829189)
                .mul(T.fract(fc.x.mul(0.06711056).add(fc.y.mul(0.00583715))))
                .add(kaskade.select(T.float(0), this._ensureLodUniforms().uDitherT))
        );
    }

    // DER URSPRUNG DES WELT-RASTERS je Pass (`_ditherIGN`): EINE Uniform der Render-Gruppe, gestellt je Render aus der Kamera des
    // Passes — eine Kaskade reicht den Ursprung ihrer Box (`_kaskadeFit`, `raster`), jede andere Kamera 0.
    _blendeRaster() {
        if (this._blendeRasterU) return this._blendeRasterU;
        const T = THREE.TSL;
        const v = new THREE.Vector2();
        this._blendeRasterU = T.uniform(v)
            .setGroup(T.renderGroup)
            .onRenderUpdate((frame) => {
                const csm = this.state.csmNode;
                const k = frame && frame.camera ? this._schattenKameraIndex(frame.camera) : -1;
                const f = k >= 0 && csm && csm._anazhFit ? csm._anazhFit[k] : null;
                return f && f.raster ? v.set(f.raster[0], f.raster[1]) : v.set(0, 0);
            });
        return this._blendeRasterU;
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
                    ["float", "fract", "screenCoordinate", "cameraProjectionMatrix", "step", "mix"]
                        .filter((k) => !T[k])
                        .map((k) => "TSL." + k)
                );
            if (_fehlt.length) throw this._blendeBruch("es fehlt " + _fehlt.join(" · "));
            // W5.4 (Schritt 3) — die Band-Zahlen als LIVE-Uniforms (Quelle LOD_DISTANCES via
            // `_ensureLodUniforms`-Seed + `_loopRender`-Spiegel): Rampen-Kanten als Knoten-Mathe.
            const _edge1 = _lu.uLodD1.sub(_lu.uLodFade); // D1 − FADE
            const _edge0 = _lu.uLodD0.sub(_lu.uLodFade0); // D0 − FADE0
            const _fadeW = _lu.uLodFade.max(T.float(1e-3));
            const _fadeW0 = _lu.uLodFade0.max(T.float(1e-3));
            // _dh — das EINE Rauschen der Blende (`_ditherIGN`, BYTE-GENAU __phytoCore.lodDitherIGN; in der Kaskade am
            // Welt-Raster, schatten.K2) — bis w5-kontakt stand hier sein Zwilling mit dem Pixel der Karte und der Rotation.
            const _dh = this._ditherIGN(T, 0);
            if (opts && opts.impostor === true) {
                // __phytoCore.lodCrossfadeMask lod=2: keep = max(min(2·f1,1), vOcc) ≥ dh — die Verdeckung reist als
                // Instanz-Attribut (verdeckt-demotierte Bäume blenden VOLL; Default 0 = altes Verhalten).
                const _dist = opts.distNode;
                if (!_dist) throw this._blendeBruch("die Karte reicht keine Distanz (opts.distNode)");
                let _vCD = _dist.mul(_lu.uLodPerf); // derselbe Streck wie die CPU (`_lodPerceptionDistance`)
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
            // die Instanz-Größen über den EINEN Leser (`_senkenKnoten().attribut`: in der Wahl am Index der Liste)
            const _aH0 = AnazhRealm._senkenKnoten().attribut("aH0", "float");
            const _aH0L = AnazhRealm._senkenKnoten().attribut("aH0L", "float");
            // × uLodPerf: dieselbe Wahrnehmungs-Distanz, nach der die CPU die Stufen legt (`_lodPerceptionDistance`) — vom Auge zum
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

    // DER EINE KARTEN-ATLAS (W6): jede Impostor-Karte — Foundry-Art × Gestalt [× ov], gestreut und gesetzt — ist EINE
    // Schicht einer Array-Textur (Albedo, Normale, Sonnen-Sicht), ihre HEBUNGS-RINGE (lod.K3, phyto-core `karteRinge`) als
    // Bänder untereinander, je Ring V Peilungen, wie der Welt-Renderer sie zeichnet (Zeile 0 oben; der Ring 0° in voller
    // Zelle, jeder andere in ¼ der Zellfläche, zwei Ansichten je Zeile). EIN Material, EIN Einheits-Quad, EINE globale Instanz-Gruppe
    // (`IMPOSTOR_ATLAS_GRUPPE`); Schicht, Rahmen und Sichthöhe reisen je Instanz (aKarte — `_lodSlotStamp`). DIE KARTE BACKT
    // IN DER WELT (S2, `_karteWeltBacken`): der Welt-Renderer zeichnet die L1-Gestalt, die GPU zieht die deckungstreuen Mips
    // nach dem Karten-Gesetz und kodiert sie (`_karteAblage`) — kein Bäcker-Faden, kein zweiter Renderer; die BC-Bytes reisen
    // EINMAL zurück auf die Platte der Schale, der Zweit-Boot legt sie, ohne zu backen (pipeline.K4 Stufe 2). Das FORMAT ist eine Stufe desselben Pfads: mit dem WebGPU-Feature texture-compression-bc BC1-sRGB-
    // Albedo + BC5-Normale auf 1/normalTeiler + rgba8-Sonnen-Sicht auf 1/lichtTeiler (CompressedArrayTexture, ~0,55 MiB je
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
            tmap: null, // die Tiefe je Texel (BC4, w4-laub-karte, phyto-core `karteTiefe`); rgba8: sie reist in nmap.w
            mapNode: null, // die Basis-Texturknoten: ein Wachsen tauscht nur ihren Wert
            nmapNode: null,
            lmapNode: null,
            tmapNode: null,
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
            typeof core.karteSaumRinge !== "function" ||
            typeof core.karteTiefe !== "function" ||
            typeof core.karteTiefeVersatz !== "function" ||
            !core.KARTEN_GESETZ ||
            !core.KARTEN_GESETZ.lichtTeiler
        )
            return AnazhRealm._kernPflichtBruch(
                "phyto:karteMasse/karteRinge/karteSaumRinge/karteTiefe/KARTEN_GESETZ.lichtTeiler"
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
            const gewaehlt = !at.fmt;
            if (gewaehlt) at.fmt = this._impostorAtlasFormat();
            at.masse = core.karteMasse(at.cw, at.ch, at.V, at.nt, at.fmt, at.ringe);
            const r = this.state.renderer;
            // die Schicht in beiden Formaten aus dem Maß (der Zensus `_impostorCensus` rechnet dasselbe)
            if (gewaehlt && at.fmt !== "bc" && r && !r._isHeadlessNull) {
                const B = core.karteMasse(at.cw, at.ch, at.V, at.nt, "bc", at.ringe);
                const mib = (b) => (b / 1048576).toFixed(2).replace(".", ",");
                this.log(
                    `KARTE OHNE BC (${r.backend && r.backend.isWebGPUBackend ? "WebGPU ohne texture-compression-bc" : "WebGL2"}): ` +
                        `die Karte zeichnet unkomprimiert in ihr rgba8-Ziel (${mib(at.masse.w * at.masse.h * 16)} MiB je Schicht statt ` +
                        `${mib(B.aBytes + B.nBytes + B.lBytes + B.tBytes)})`,
                    "WARN"
                );
            }
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
                at.tmap.mipmaps = mips(M.t);
                at.tmap.image = { width: M.nw, height: M.nh, depth: cap };
            } else {
                // Die Namen tragen den Erzeuger (die Band-Linse zählt je Name).
                at.map = new T.CompressedArrayTexture(mips(M.a), M.w, M.h, cap, T.RGBA_S3TC_DXT1_Format);
                at.map.name = "karte-albedo:atlas";
                at.map.colorSpace = T.SRGBColorSpace;
                at.nmap = new T.CompressedArrayTexture(mips(M.n), M.nw, M.nh, cap, T.RED_GREEN_RGTC2_Format);
                at.nmap.name = "karte-normal:atlas";
                at.lmap = new T.DataArrayTexture(null, M.lw, M.lh, cap);
                at.lmap.name = "karte-licht:atlas";
                at.lmap.format = T.RGBAFormat; // die Sonnen-Sicht: die vier Beiwerte ihres linearen Felds (w14-nadel-licht)
                // die Tiefe je Texel (w4-laub-karte, phyto-core `karteTiefe`): BC4 im Maß und mit der Kette der Normale
                at.tmap = new T.CompressedArrayTexture(mips(M.t), M.nw, M.nh, cap, T.RED_RGTC1_Format);
                at.tmap.name = "karte-tiefe:atlas";
            }
            for (const t of [at.map, at.nmap, at.lmap, at.tmap]) {
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

    // DIE QUELLE DER KARTE (w4-laub-karte): die Stufe, aus der eine Art ihre Karte backt und ihren Rahmen misst — die
    // servierte L1, die Höhen-Stufe (`_foundryHoehenStufe`): die Karte backt aus der Gestalt, deren Höhe sie trägt, und die
    // jede Karten-Art ohnehin baut. Der EINE Leser für den Bake (`_karteWeltBacken`), den Rahmen des Null-Renderers
    // (`_foundryEnsureImpostorRecord`; bis w4-laub-karte las er die deklarierte Stufe, der Bake die servierte) und die Probe
    // der Karten-Wand. Die L0 als Quelle senkte den Kanten-Versatz (lod.K5, 16 Peilungen, 1920 × 1080: Eiche 4,67 → 3,54 px,
    // Birke 5,08 → 3,74, Weide 12,06 → 9,97, Fichte 3,23 → 2,82), stellte aber je Zelle einen L0-Bau auf den Pfad der
    // Ankunft (gate:arch-feld headless: der erste Bake Takt 74 → 206, die nahe Eiche 156 → über 200, ROT).
    _karteStufe(preset) {
        return this._foundryServierStufe(preset, 1);
    }

    // Die Texturen der Schichten in der Reihe der Ablage (`_karteRechenPlan` kopien.tex): Albedo, Normale, Sonnen-Sicht und —
    // mit BC — die Tiefe (rgba8 trägt sie in der Normale).
    _karteTexturen(at) {
        return at.tmap ? [at.map, at.nmap, at.lmap, at.tmap] : [at.map, at.nmap, at.lmap];
    }
    // Die GPU-Texturen der Schichten — null, solange r184 sie nicht angelegt hat.
    _karteGpuTexturen(at) {
        const be = this.state.renderer && this.state.renderer.backend;
        const g = (t) => (t && be && be.get(t) ? be.get(t).texture || null : null);
        const out = this._karteTexturen(at).map(g);
        return out.every(Boolean) ? out : null;
    }

    // DAS WACHSEN AUF DER GPU: r184 legt die gewachsene Form an (`_texturAbschied` hält die alte bis nach dem Submit dieser
    // Aufgabe), die GPU kopiert jede Stufe der alten Schichten hinein — eine gebackene Karte backt nie neu, und kein Bild
    // fehlt ihr zwischen zwei Takten.
    _karteWachsen(at, alt) {
        const rend = this.state.renderer;
        const tex = this._karteTexturen(at);
        for (const t of tex) rend._textures.updateTexture(t);
        const neu = this._karteGpuTexturen(at);
        if (!neu) throw this._stoffBruch("die Karte: der gewachsene Atlas hat keine GPU-Form");
        const dev = rend.backend.device;
        const enc = dev.createCommandEncoder({ label: "karte-wachsen" });
        for (let i = 0; i < tex.length; i++) {
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
        else ((z.gescheitert = true), this._karteAbzugBruch(z, "gescheitert"));
        if (z._endeLoes) z._endeLoes(!!ok);
    }

    // Das EINE Einheits-Gitter der Karten (`KARTE_GITTER` Zellen auf der Stammachse, y ∈ 0..1, indiziert) mit DREI
    // Vertex-Attributen: position, normal (PROBE (1,0,0): der InstanceNode macht daraus (cos r, 0, −sin r)/s → Rotation +
    // Skala), uv (u = Spalte: ±1 = 2u−1, v = Höhe: Wind-Gewicht v²). Je Instanz EIN vec4 `aKarte` = (Schicht, Halbbreite,
    // Höhe — template-lokal —, ±Sichthöhe), die Fassade ersetzt den Platzhalter je Slot; dazu instanceColor (Tint). Befund
    // Echt-GPU 04.10.: mit color/aImpX/aFlex/aPhase/aOccl/aZelle/aRahmen trug die Pipeline 10 Vertex-Puffer (WebGPU-Grenze 8)
    // — das @global-Bundle wurde ungültig, keine Karte zeichnete. DAS GITTER (heil-laub-tiefe): jede Ecke trägt die Tiefe
    // ihrer Gestalt (der Stoff, `vertexNode`) — bis dahin ein Quad aus 2 Dreiecken, dessen Tiefe das Fragment schrieb. Unter
    // ihrer Bild-Schwelle fallen die inneren Ecken auf die Ecken des Quads (der Stoff, `_morph`): es zeichnen dessen 2 Dreiecke.
    _impostorQuad(at) {
        if (at.quad) return at.quad;
        const [NX, NY] = AnazhRealm.KARTE_GITTER.zellen;
        const VC = (NX + 1) * (NY + 1);
        const pos = new Float32Array(VC * 3),
            nor = new Float32Array(VC * 3),
            uv = new Float32Array(VC * 2),
            karte = new Float32Array(VC * 4);
        for (let j = 0; j <= NY; j++)
            for (let i = 0; i <= NX; i++) {
                const k = j * (NX + 1) + i;
                pos[k * 3 + 1] = j / NY;
                nor[k * 3] = 1;
                uv[k * 2] = i / NX;
                uv[k * 2 + 1] = j / NY;
                karte[k * 4 + 1] = 1; // Platzhalter: Schicht 0, Rahmen 1 × 1, ohne Sichthöhe
                karte[k * 4 + 2] = 1;
            }
        // je Zelle zwei Dreiecke im Umlauf des alten Quads; die Diagonale läuft durch die Ecke zur Mitte des Gitters (ein Fächer
        // um die Kuppel der Krone, links wie rechts gleich). Fallen die inneren Ecken auf das Quad (der Stoff, `_morph` 0), wird
        // die Zelle mit der Mitte als unterer linker Ecke das alte Quad mit seiner Diagonale, jede andere entartet.
        const idx = [];
        for (let j = 0; j < NY; j++)
            for (let i = 0; i < NX; i++) {
                const a = j * (NX + 1) + i,
                    b = a + 1,
                    c = a + NX + 2,
                    d = a + NX + 1;
                if (i < NX / 2 === j < NY / 2) idx.push(a, b, c, a, c, d);
                else idx.push(a, b, d, b, c, d);
            }
        const g = new THREE.BufferGeometry();
        g.setIndex(idx);
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        g.setAttribute("aKarte", new THREE.BufferAttribute(karte, 4));
        g.setAttribute("aEin", new THREE.BufferAttribute(new Float32Array(pos.length / 3), 1)); // je Slot die Fassade, ohne: 0
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
    // DER WURF DER KARTE (w14-lod-sprung) reist als ihr ZWILLING (`_impostorWurfLeaf`), nie im Leaf des Bilds: die EINE
    // Atlas-Gruppe bleibt eine Gruppe der Instanz-Wahl des Hauptbilds (W7), der Zwilling wählt je Kaskade.
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

    // DER ZWILLING DER KARTE (w14-lod-sprung): sie wirft, wie ihre Zeile im Studio-Budget es sagt (B2c `schatten` der Stufe 2:
    // die Karte wirft sich selbst), als Zwilling wie der Wurf jeder Stufe — dasselbe Quad, derselbe Stoff (im Schattenpass
    // steht er zum Licht, seine Maske misst vom Auge der Stufen), nur auf der Wurf-Ebene, in seiner EIGENEN Atlas-Gruppe
    // (`IMPOSTOR_ATLAS_GRUPPE` + "#S") mit der Wahl je Kaskade. Bis hier warf die Karte nie: am Wechsel L1 → Karte fiel der
    // Schatten jedes Baums vom Boden (lod.K4, Radeon am Dorf −44 462 Luma über 7 474 px, ohne Kaskaden-Schatten −5 209).
    // null = die Art wirft ihre Karte nicht; eine Art ohne Karten-Zeile im Studio-Budget (der Wagen: kindStages [0, 1], seine
    // Karte ist die des Wirts) wirft sie nie.
    _impostorWurfLeaf(leaf, preset) {
        if (!leaf) return null;
        const rec = this._foundry && this._foundry.recipes ? this._foundry.recipes[preset] : null;
        const L = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.lod;
        const art = rec && L && L.budget ? L.budget[rec.kind] : null;
        if (!art || !art[2] || this._foundryBudgetZeile(preset, 2).schatten !== 2) return null;
        return Object.assign({}, leaf, {
            leafKey: leaf.leafKey + "#S",
            atlasGruppe: leaf.atlasGruppe + "#S",
            castShadow: true,
            shadowTwin: true,
        });
    }

    // DER WURF DER KARTEN IM LICHTMESSER (w14-lod-sprung): die Kamera misst die Sonne auf dem Boden im Bild (`_horizontSichtImBild`)
    // — dort, wo die Kaskaden den Wurf der Karten legen, misst sie ihn mit: am Punkt (x, y, z) zum Licht `L` 0, wenn der Strahl
    // zur Sonne die Krone einer werfenden Karte trifft, sonst 1. Werfer sind DIESELBEN Instanzen, die der Schattenpass zeichnet:
    // die Zwillings-Gruppe der Karte (`_impostorWurfLeaf`) mit dem Fenster ihrer Maske vom Auge der Stufen (`_instanzFenster`,
    // dieselben Kanten `_blendeK`); ihre Krone ist die Ellipse in ihrem Rahmen (aKarte: Halbbreite y, Höhe z × Instanz-Skala) auf
    // der Ebene durch den Anker quer zum Licht, wie der Wurf sie zeichnet (binär, alphaTest). Jenseits der Kaskaden (`maxFar`)
    // fällt kein Wurf. Bis hier maß die Kamera am Abend der Mess-Wiese die Sonne, die der Wald auf dem Grat dem Boden schon
    // nahm: das Bild stand im Wurf, die Belichtung für die Sonne, und als der Grat selbst sie nahm, sprang sie um 0,38 EV
    // (3,30 → 4,29, Uhr 0,728 → 0,73) — die Tag-Achse (gate:tag-achse:echt) maß SPRUNG wiese 0,36 EV, an Genesis morgens
    // fünf Schritte über 0,1 EV.
    _kartenWurfSicht(x, y, z, L) {
        const W = this._kartenWurfWerfer(L);
        if (!W || (x - W.ex) ** 2 + (z - W.ez) ** 2 > W.weit2) return 1;
        const { liste, kopf, folge, nx, nz, binM } = W;
        const ln = L.x * nx + L.z * nz;
        const quer = (x - W.ex) * -nz + (z - W.ez) * nx;
        const [b0, b1] = [Math.floor((quer - W.quer) / binM) - W.bin0, Math.floor((quer + W.quer) / binM) - W.bin0];
        // die Krone deckt mit ihrer Deckung im Jahr (`liste[o + 5]`, w21-laub-jahr-fern): die volle nimmt die Sonne ganz, die
        // kahle Laub-Krone lässt durch, was ihre Winter-Karte durchlässt
        let sicht = 1;
        for (let b = Math.max(0, b0); b <= b1 && b < kopf.length; b++)
            for (let k = kopf[b]; k >= 0; k = folge[k]) {
                const o = k * 6;
                const t = ((liste[o] - x) * nx + (liste[o + 2] - z) * nz) / ln;
                if (!(t > 0)) continue;
                const u = (x + L.x * t - liste[o]) * -nz + (z + L.z * t - liste[o + 2]) * nx;
                const w = y + L.y * t - liste[o + 1] - liste[o + 4];
                const q = (u * u) / (liste[o + 3] * liste[o + 3]) + (w * w) / (liste[o + 4] * liste[o + 4]);
                if (q > 1) continue;
                // DIE KRONE IST KEIN SCHILD (w28-nacht-bilanz): ihr Wurf trägt das Profil ihrer Dichte — der Kern (q < ¼) nimmt
                // die Sonne mit ihrer Deckung, zum Rand fällt sie linear auf 0 (im Mittel ⅝, die Hälfte ihres Rahmens — die
                // Maske der Karte, nie die volle Ellipse; stetig am Rand, die Sehne √(1 − q) knickt dort). Bis hier nahm jede Krone binär: der
                // Messer stand im Wurf, während das Bild schon zu einem Drittel in der Sonne lag, und sprang in EINEM Schritt
                // der Uhr (Wiese, Radeon, Sommersonne über der Waldkante: Sicht 0,07 → 0,79 über Uhr 0,254 → 0,26, die
                // Belichtung −1,04 EV, das Bild −0,34 EV je 0,002).
                sicht *= 1 - liste[o + 5] * Math.min(1, (1 - q) * (4 / 3));
                if (sicht < 0.004) return 0;
            }
        return sicht;
    }

    // DIE WERFER DES LICHTMESSERS: je Karte, die ihr Fenster behält, Anker, Halbbreite, halbe Höhe und die Deckung ihrer Krone im
    // Jahr (w21-laub-jahr-fern: die Nadel-Art ganz, die Laub-Krone nach phyto-core `kroneImJahr` in der Präsenz der Welt — dieselbe
    // Deckung wie das Dach der Ferne) — neu, wenn die Gruppe sich
    // ändert, die Präsenz wandert oder das Auge der Stufen einen Meter wandert (das Fenster), und quer zum Licht in Fächer von `binM` geordnet, neu, wenn
    // das Licht sich um `HORIZONT_KARTE.lichtRad` dreht (das Maß, nach dem die Horizont-Karte neu malt) oder das Auge geht: ein Strahl
    // prüft nur die Karten seines Fachs (der Rand trägt Krone und Drehung). Der Messer läuft in jedem Bild (`tickDayNight`): an der
    // Mess-Wiese (Radeon, 2 213 Werfer, 82 Fächer) kostet eine Messung 0,106 statt 0,055 ms, mit neuem Licht je Bild 0,166 statt
    // 0,118 ms. null, solange keine Karte wirft (kein Zwilling, kein Wurf des Lichts — `_lichtWirft`, auch ohne Schatten-Karte
    // des Renderers: unter Holz kienspan baut r184 keine Kaskade —, die Sonne unter dem Horizont). Bis w20-fern-hang nahm der
    // Messer unter kienspan dem ganzen Boden der Mess-Wiese die Sonne (Uhr 0,25–0,27: 32 von 32 Strahlen im Wurf des Walds hinter
    // dem Auge, das Bild in der Sonne) — die Belichtung glich die Sonne nie aus, das Bild stieg je 0,002 der Uhr um bis zu 0,17 EV.
    _kartenWurfWerfer(L) {
        const st = this.state;
        const g = st.archInstanceGroups ? st.archInstanceGroups.get(AnazhRealm.IMPOSTOR_ATLAS_GRUPPE + "#S") : null;
        const cam = st.camera;
        const csm = st.csmNode;
        if (!g || !(g.liveCount > 0) || !this._lichtWirft() || !cam || !csm || !(L.y > 0)) return null;
        const m = g.mesh;
        const lu = st.lodUniforms;
        const maske = !!(lu && lu.uLodMaskOn && lu.uLodMaskOn.value > 0.5 && this._blendeK);
        const auge = maske ? lu.uLodAuge.value : cam.position;
        const n = g.liveCount;
        const pr = this._fernPraesenz();
        const stand = `${n}|${m.instanceMatrix.version}|${maske}|${Math.round(auge.x)}|${Math.round(auge.z)}|${this._blendeK && this._blendeK.d0}|${pr.toFixed(3)}`;
        let W = this._kartenWurfMerk;
        if (!W || W.stand !== stand) {
            const a = m.instanceMatrix.array;
            const ak = m.geometry.attributes.aKarte.array;
            const Lm = maske
                ? {
                      ex: Math.round(auge.x),
                      ez: Math.round(auge.z),
                      perf: lu.uLodPerf.value,
                      ref: lu.uLodRef.value,
                      kanten: this._blendeK,
                  }
                : null;
            const liste = W && W.liste.length >= n * 6 ? W.liste : new Float32Array(n * 6);
            const nadel = this._karteNadel(null).array;
            const PC = globalThis.__phytoCore;
            const laub = PC.kroneImJahr(PC.WIND_ZAHLEN, pr, 1, 1, 1, 1, 0).deckung;
            let k = 0,
                hwMax = 0;
            for (let i = 0; i < n; i++) {
                const o = i * 16;
                // das Fenster der Karte (das EINE Blend-Gesetz `_blendeBehaelt`, wie die Wahl der GPU es rechnet, `PASS_WAHL_WGSL`):
                // der Abstand ihres Ankers vom Auge der Maske × Perf × min(Bezug/Sichthöhe, 1); verdeckt (Sichthöhe < 0) behält sie
                const sicht = ak[i * 4 + 3];
                const dS = Lm && Math.hypot(a[o + 12] - Lm.ex, a[o + 14] - Lm.ez) * Lm.perf * Math.min(Lm.ref / Math.max(Math.abs(sicht), 1e-3), 1); // prettier-ignore
                if (Lm && !AnazhRealm._blendeBehaelt(Lm.kanten, "karte", dS, dS, dS, dS, sicht < 0)) continue;
                const s = Math.sqrt(a[o] * a[o] + a[o + 1] * a[o + 1] + a[o + 2] * a[o + 2]);
                const c = nadel[Math.floor(ak[i * 4] + 0.5)] ? 1 : laub;
                liste.set([a[o + 12], a[o + 13], a[o + 14], ak[i * 4 + 1] * s, ak[i * 4 + 2] * s * 0.5, c], k * 6);
                hwMax = Math.max(hwMax, ak[i * 4 + 1] * s);
                k++;
            }
            W = this._kartenWurfMerk = {
                stand,
                liste,
                n: k,
                hwMax,
                lx: NaN,
                lz: NaN,
                folge: W && W.folge.length >= n ? W.folge : new Int32Array(n),
            };
        }
        const e = cam.position;
        const lr = AnazhRealm.HORIZONT_KARTE.lichtRad;
        const fl = Math.max(Math.hypot(L.x, L.z), 1e-4);
        if (!(Math.abs(L.x / fl - W.lx) < lr && Math.abs(L.z / fl - W.lz) < lr) || W.ex !== e.x || W.ez !== e.z) {
            // die Fächer quer zum Licht um das Auge: der Rand trägt die Drehung bis lichtRad über die Weite der Kaskaden (maxFar)
            const [nx, nz] = [L.x / fl, L.z / fl];
            const weit = Math.min(cam.far, csm.maxFar);
            const binM = 8;
            const rand = weit * lr * 2;
            const quer = (o) => (W.liste[o] - e.x) * -nz + (W.liste[o + 2] - e.z) * nx;
            const bin0 = Math.floor(-weit / binM) - 2;
            const kopf =
                W.kopf && W.kopf.length === Math.ceil((2 * weit) / binM) + 5
                    ? W.kopf.fill(-1)
                    : new Int32Array(Math.ceil((2 * weit) / binM) + 5).fill(-1);
            for (let k = 0; k < W.n; k++) {
                const b = Math.floor(quer(k * 6) / binM) - bin0;
                if (b < 0 || b >= kopf.length) continue;
                W.folge[k] = kopf[b];
                kopf[b] = k;
            }
            Object.assign(W, {
                lx: nx,
                lz: nz,
                nx,
                nz,
                ex: e.x,
                ez: e.z,
                weit2: weit * weit,
                binM,
                bin0,
                kopf,
                quer: W.hwMax + rand,
            });
        }
        return W;
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
            schichtB: M ? (at.fmt === "bc" ? M.aBytes + M.nBytes + M.lBytes + M.tBytes : M.w * M.h * 16) : 0,
            // bc: die Stufen der vier Schichten (Albedo, Normale, Sonnen-Sicht, Tiefe) · rgba8: drei rgba8-Ziele voller Größe
            // mit Mips (4/3), die Tiefe im vierten Kanal der Normale
            mb: !M
                ? 0
                : at.fmt === "bc"
                  ? +(((M.aBytes + M.nBytes + M.lBytes + M.tBytes) * at.cap) / 1048576).toFixed(2)
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
    // Normale (Sicht-Raum der Bake-Kamera) und die Sonnen-Sicht seiner Krone. Je Takt bis zur EINEN Frist der Bau-Arbeit
    // (`_bauFrist`, w16-haenger; mindestens eine Ansicht), die nächste Karte zuerst; eine Zelle, deren L1 noch reist oder deren Programme noch kompilieren, wartet — die anderen
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
            // ein wartender Abzug (das Labor im Tor, `_karteAbzug`) zuerst
            return z && z._abzug ? -1 : z && Number.isFinite(z._bedarfD2) ? z._bedarfD2 : 1e30;
        };
        q.sort((a, b) => d2(a) - d2(b));
        // die halbe Karte zuerst
        if (at.offen && q.includes(at.offen.z.key)) q.unshift(...q.splice(q.indexOf(at.offen.z.key), 1));
        let n = 0;
        const frist = this._bauFrist("karte"); // vor der Arbeit gefragt
        const gezeichnet = () => (this._karteBuehneSatz && this._karteBuehneSatz.versuchN) || 0; // je Bühnen-Zeichnung +1
        // DIE LEINE FRAGT JEDE KARTE BEI IHREM BEGINN, AUCH IM SELBEN TAKT (w19-gang-hitch, Nacharbeit): was eine Karte zeichnete,
        // bindet sich sofort an (`_gpuLeineBinden`), und die nächste beginnt nur an loser Leine — die Frist misst CPU-Zeit, die
        // Leine die Schlange der GPU. Bis hier fragte nur der Anfang des Takts: im ruhenden Loop (Frist ohne Ende) begann EIN Takt
        // jede Karte der Schlange am Stück und legte Minuten swiftshader-Arbeit in die Schlange (CI z289 · z292 · z293, umstellen an
        // die Mess-Wiese: die Leine blieb gespannt, das Panorama und die letzten Karten zeichneten nie, das Weltbild fehlte, und die
        // 90 Würfe außer Blick warteten — „Wald offen 90"); auf main verdeckte das Budget KARTE_WELT_MS (ein Ring je Takt) die Lücke.
        // DIE KARTEN EINES TAKTS SIND EINE ARBEIT AN DER LEINE (w25-ankunft-karte): mit endlicher Frist fragt die Leine den Beginn
        // des Takts (`nurHalbe`), die Frist begrenzt, wie viele Karten er beginnt, und was sie zeichneten, bindet sich EINMAL an,
        // nach der letzten (`onSubmittedWorkDone` nach ihr trägt jede Zeichnung davor). Ohne Ende (der ruhende Loop) fragt die
        // Leine weiter jede Karte bei ihrem Beginn. Bis hier band sich jede Karte für sich, und die nächste desselben Takts fand die
        // Leine gespannt: unter dem Ladeschirm begann je Takt höchstens EINE Karte — die 14 Karten im Blick backten 11,4 → 14,0 s,
        // beim Eintritt ~90 ms der Frist frei, je Karte ~55 ms Haupt-Faden (GTX kalt, f7d88889). Ein Schritt, der nicht ganz stand,
        // beendet den Takt NICHT: der Versuch jeder Karte treibt den Bau der Programme ihrer Art (endete der Takt am ersten, kam die
        // zweite Karte erst 3 s nach der ersten, das Weltbild +1,19 s, a1e54bc9).
        const jeKarte = !Number.isFinite(frist);
        let v = gezeichnet();
        const binden = () => gezeichnet() !== v && (this._gpuLeineBinden(), (v = gezeichnet()));
        for (let i = 0; i < q.length;) {
            const z = at.zellen.get(q[i]);
            if (!z || z.gescheitert || (z.gebacken && !z._weltNeu)) {
                q.splice(i, 1);
                continue;
            }
            // an gespannter Leine nur die begonnene Karte
            if (!(at.offen && at.offen.z === z) && (nurHalbe || (jeKarte && this._gpuLeineStraff()))) break;
            const e = this._karteWeltBacken(at, z);
            if (jeKarte) binden();
            // null: die L1 reist, ein Bürger der Bühne wartet auf seine Pipeline oder die Bühne trägt eine halbe Karte;
            // 0: ein Ring steht — im Budget backt derselbe Takt den nächsten
            if (e === null || e === 0) {
                if (e === null) i++;
                if (performance.now() >= frist) break;
                continue;
            }
            q.splice(i, 1);
            // die Welt zog während des Bakes in eine andere Stufe des Jahrs (`_karteJahrGelegt`): die Karte reiht sich wieder ein
            if (e === true && z._weltNeu && !z.gescheitert) q.push(z.key);
            n++;
            if (performance.now() >= frist) break;
        }
        binden();
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
        // selbst, die Karte wirft nie. Je Texel misst die Bühne, welchen Teil des Richtlichts die eigene Krone aus JEDER
        // Richtung der Tafel durchlässt (die Tiefen-Kacheln derselben Krone, 3×3 Abgriffe, im Baum-Raum — sie drehen mit
        // jeder Ansicht), und legt die Sicht als FUNKTION DER RICHTUNG ab: ihr lineares Feld v(d) = c0 + c·d (die erste
        // Ordnung der Kugelflächen-Funktionen, vorberechneter Licht-Transport nach Sloan, Kautz und Snyder 2002), über die
        // Richtungen der Tafel nach kleinsten Quadraten gefittet (`B.fit`). Der Kartenstoff liest das Feld an der Richtung des
        // aktiven Körpers im Baum-Raum (`uSunDir`, Sonne oder Mond, über die EINE Naht) und legt es auf den EMPFANGENEN
        // Schatten (`receivedShadowNode`), nie auf die Albedo: dieselbe Richtung, die die Kaskade an der Gestalt prüft, der
        // Himmel bleibt frei wie an ihr. Bis w14-nadel-licht trug die Sicht zwei Zahlen, den Zenit und das N·L-gewichtete Mittel
        // des 45°-Kranzes, und der Stoff mischte sie nach der Höhe: ein Texel las die Sicht der Richtungen SEINER Normale, nie
        // die des Lichts — die vom Licht abgewandte Krone stand im Licht ihrer eigenen Seite (Radeon, Messort dorf, F6-Linse:
        // die Tanne unter dem Mond der Uhr 0,05, 65° hoch, Karte/Gestalt 1,234 → 1,028; die neun Zeilen 0,93–1,055).
        B.uBaum = S.uniform(new T.Matrix4());
        B.uVP = SZ.richtungen.map(() => S.uniform(new T.Matrix4()));
        B.dirs = SZ.richtungen.map(([h, a]) => {
            const eh = (h * Math.PI) / 180,
                ea = (a * Math.PI) / 180;
            return new T.Vector3(Math.cos(eh) * Math.cos(ea), Math.sin(eh), Math.cos(eh) * Math.sin(ea));
        });
        // DER FIT (kleinste Quadrate): je Richtung j die Gewichte ihrer Sicht in (c0, cx, cy, cz) — (AᵀA)⁻¹ · (1, d_j)
        const AtA = new T.Matrix4();
        AtA.elements.fill(0);
        for (const d of B.dirs) {
            const a = [1, d.x, d.y, d.z];
            for (let i = 0; i < 16; i++) AtA.elements[i] += a[i >> 2] * a[i & 3];
        }
        if (!(Math.abs(AtA.determinant()) > 1e-6))
            throw this._stoffBruch(
                "die Karte: die Richtungen der KARTE_SONNEN_SICHT spannen das lineare Feld der Sicht nicht auf"
            );
        const inv = AtA.invert().elements;
        B.fit = B.dirs.map((d) =>
            [0, 1, 2, 3].map((k) => inv[k] + inv[4 + k] * d.x + inv[8 + k] * d.y + inv[12 + k] * d.z)
        );
        B.tiefe = S.texture(B.leer.depthTexture);
        // DER BIAS DER SONNEN-KACHELN ist das EINE Gesetz der Kaskaden (`_schattenBias`, 0710-12): je Bake aus der Texel-Kante
        // seiner Kacheln (Normale, Tiefe 0..1 — `_karteWeltBacken` schreibt ihn), nie ein Meter-Wert für alle Kronen
        B.uBias = S.uniform(new T.Vector2(0, 0));
        const gpuKoord = this.state.renderer.coordinateSystem === T.WebGPUCoordinateSystem;
        const sicht = S.Fn(() => {
            const nB = S.normalize(B.uBaum.mul(S.vec4(S.normalWorld, 0.0)).xyz).toVar();
            const pB = B.uBaum.mul(S.vec4(S.positionWorld, 1.0)).xyz.add(nB.mul(B.uBias.x)).toVar();
            const c = [0, 1, 2, 3].map(() => S.float(0.0).toVar());
            B.dirs.forEach((d, j) => {
                const q = B.uVP[j].mul(S.vec4(pB, 1.0));
                const u = q.x.mul(0.5).add(0.5);
                const v = gpuKoord ? S.float(0.5).sub(q.y.mul(0.5)) : q.y.mul(0.5).add(0.5);
                const ref = (gpuKoord ? q.z : q.z.mul(0.5).add(0.5)).add(B.uBias.y);
                const px = S.ivec2(
                    S.clamp(u.mul(K).floor(), 1.0, K - 2).add(j * K),
                    S.clamp(v.mul(K).floor(), 1.0, K - 2)
                );
                let vis = S.float(0.0);
                for (let dy = -1; dy <= 1; dy++)
                    for (let dx = -1; dx <= 1; dx++) vis = vis.add(S.step(ref, B.tiefe.load(px.add(S.ivec2(dx, dy)))));
                const sj = vis.div(9.0).toVar();
                c.forEach((ck, k) => ck.addAssign(sj.mul(B.fit[j][k])));
            });
            // das Feld in rgba8: je Beiwert seine Spanne (`KARTE_SONNEN_SICHT.spanne`) auf 0..1
            return S.vec4(...c.map((ck, k) => ck.sub(SZ.spanne[k][0]).div(SZ.spanne[k][1] - SZ.spanne[k][0])));
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
        // DIE TIEFE JE TEXEL (w4-laub-karte, phyto-core `karteTiefe`): wie weit die Fläche vor der Mitte des Rahmens liegt, im
        // Blick der Ansicht — die Kamera blickt aus `abst` auf die Mitte, ihre Sicht-Tiefe dort ist −abst (`uTiefe`: abst, hW,
        // hH je Karte, `_karteWeltBacken`). Sie reist im vierten Kanal der Normale: die Leere (unten) schreibt ihn auf 1 — ein
        // leerer Texel trägt 1, ein deckender t (die rgba8-Mips mitteln 1 − Deckung · (1 − t), der Stoff teilt durch die
        // Deckung in z).
        B.uTiefe = S.uniform(new T.Vector3(1, 1, 1));
        const tiefe = globalThis.__phytoCore
            .karteTiefe(AnazhRealm._windTsl(S), S.positionView.z.add(B.uTiefe.x), B.uTiefe.y, B.uTiefe.z)
            .clamp(0.0, 1.0);
        // die Leere trägt die Normale als (0, 0, 0, 1): die Deckung reist dort in z; die Sonnen-Sicht als (0, 0, 0, 0) — ihre
        // vier Beiwerte stehen vormultipliziert mit der Deckung, und die Deckung ist das Alpha der Albedo (rgba8: der Stoff
        // teilt durch sie; BC: die Ablage mittelt nur deckende Texel)
        B.mrt = S.mrt({
            [namen[0]]: S.vec4(S.diffuseColor.rgb, 1.0),
            [namen[1]]: S.vec4(nOkt.mul(0.5).add(0.5), 1.0, tiefe),
            [namen[2]]: sicht,
        });
        // DIE LEERE DES ZIELS (z120): vor der ersten Ansicht einer Karte ZEICHNET die Bühne ihr Ziel leer — ein Viereck über das
        // ganze Ziel, Albedo (0, 0, 0, 0), Normale (0, 0, 0, 1) und Sonnen-Sicht (0, 0, 0, 0) —, ihr Pass leert nur die Tiefe. Bis z120 trug
        // das Leeren des Passes die Leere: das WebGL2-Rückend von r184 erreicht mit keinem Leeren (autoClear wie clear()) eine
        // Schicht ≥ 1 des Array-Ziels, eine Zeichnung erreicht sie (gemessen, Radeon WebGL2). Ihre Normale trug w = 0, die Mips
        // der Tiefe (1 − (1 − w)/z) liefen an der Silhouette bis −90 m — jede Karte ab der zweiten Schicht stand hinter allem,
        // was hinter ihr steht (gate:foundry-impostor C7 [rgba8] auf swiftshader: Karte vor der Tafel 0).
        const leer = new T.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
        leer.vertexNode = S.vec4(S.positionGeometry.xy, 0.5, 1.0);
        B.leere = {
            szene: new T.Scene().add(
                Object.assign(new T.Mesh(new T.PlaneGeometry(2, 2), leer), { frustumCulled: false })
            ),
            mrt: S.mrt({
                [namen[0]]: S.vec4(0, 0, 0, 0),
                [namen[1]]: S.vec4(0, 0, 0, 1),
                [namen[2]]: S.vec4(0, 0, 0, 0),
            }),
        };
        this._karteBuehneSatz = B;
        return B;
    }

    // Eine Karte im Welt-Renderer backen, JE AUFRUF EIN STÜCK EINES HEBUNGS-RINGS (lod.K3; in Ansichten bis zur EINEN Frist der
    // Bau-Arbeit `_bauFrist`, w16-haenger — bis hier zeichnete ein Aufruf den ganzen Ring am Stück, Sonnen-Kacheln, Leere und V
    // Ansichten: headless Erst-Boot 138–170 ms in EINEM Takt; `at.offen.v` ist die nächste Ansicht): null = die Platte antwortet noch, die L1 reist
    // (bestellt), ihre Programme kompilieren oder die Bühne trägt die halbe Karte einer anderen Zelle (`at.offen`), false =
    // gescheitert, 0 = ein Ring steht, die Karte noch nicht (der nächste Aufruf backt den nächsten), true = gebacken (oder
    // von der Platte gelegt). Der erste Ring trägt die Sonnen-Kacheln — ein Schritt kostet so viel wie die Karte mit einem
    // Ring, nie das Vielfache (`schrittMs`).
    // DIE PLATTE ZUERST (pipeline.K4 Stufe 2): die BC-Karte einer Art liegt unter dem Gesetz-SHA ihrer Kerne und dem Stempel
    // des Wirts auf der Platte der Schale (`_foundrySchale`, Frage `karte`): ein Treffer legt ihre Bytes in die Schicht — ohne
    // L1, Bühne und Programme; ein Miss backt, und die Ablage reicht dieselben Bytes zurück in den Faden (`_karteAblage`).
    // `z._platte`: undefined = ungefragt, false = die Frage reist, null = backen, sonst der Treffer.
    // DIE PLATTE FRAGT DER ERSTE LESER (w25-ankunft-foundry): die Frage geht mit dem Rang des Lesers ins Werk, sobald er die
    // Zelle verlangt (`_foundryBuildImpostorFlat`), nie erst, wenn der Karten-Takt die Zelle erreicht — an gespannter Leine
    // und nach der Frist steht der Takt hinter der begonnenen Karte, und die Frage reiste in den Weg ihres Bakes (GTX kalt,
    // 4f86fbe6: die Mammut-Karte angelegt 8,04 s, gefragt 14,35 s, gebacken 14,97 s; das Werk leer ab 10,5 s, seine Schlange
    // erst 0,3–1 s vor dem Bild). `jahr`: die Stufe des Jahrs, die der Bake liest (ohne: die der Welt); die Platte trägt
    // die Karte EINER Stufe (ihr Wert nennt sie, `_foundrySchale`) — eine andere ist ein Miss. Nur BC trägt die Platte.
    _kartePlatteFragen(z, jahr) {
        const at = this._impostorAtlas();
        if (!at || at.fmt !== "bc" || z._abzug || z._platte !== undefined || !this._foundry) return;
        const j = jahr || this._karteJahr(this.state.seasonPhase);
        z._platte = false;
        const frage = { type: "karte", presetId: z.preset, platte: "fimp|bc|" + z.key, jahr: j.stufe };
        const wort = `FOUNDRY TIMEOUT: karte(${z.key}) nach 45 s Arbeit ohne Reply → sie backt`;
        this._foundryAuftrag(this._foundry, "krt", frage, z._bedarfD2, 45000, wort).then((m) => {
            z._platte = (m && m.karte) || null;
            z._platteJahr = j;
            z._liefer = m && m.liefer;
        });
    }
    _karteWeltBacken(at, z) {
        const rend = this.state.renderer;
        const bc = at.fmt === "bc";
        // DAS JAHR DIESES BAKES (`_karteJahr`): die Stufe der Welt, die der erste Ring liest — die Ringe danach backen in ihr
        // (`at.offen.jahr`), auch wenn die Welt inzwischen weiterzog (der Jahres-Takt bestellt die Karte dann neu). Der Abzug
        // des Labors backt die Sommer-Stufe: sein Stoff legt sein eigenes Jahr auf die Karte (worlds/terrain).
        const jahr =
            (at.offen && at.offen.z === z && at.offen.jahr) ||
            this._karteJahr(z._abzug ? AnazhRealm.KARTE_JAHR.sommer : this.state.seasonPhase);
        // ein Abzug liest die Bühne: die Platte trägt nur BC-Bytes, die Karte backt
        if (z._abzug) z._platte = null;
        if (bc && z._platte !== null) {
            this._kartePlatteFragen(z, jahr); // fragte sie ihr Leser nicht, fragt sie der Bake
            if (z._platte === false) return null;
            const k = z._platte;
            const lage = at.lage || (at.lage = this._karteRechenPlan(at, true));
            if (!this._karteGpuTexturen(at)) for (const t of this._karteTexturen(at)) rend.initTexture(t);
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
                this._karteJahrGelegt(z, z._platteJahr || jahr);
                if (!z.gebacken) this._karteGebacken(z, k.frame);
                return true;
            }
        }
        if (bc && !this._karteRechner()) return null; // die Programme der GPU-Ablage kompilieren noch
        // die Quelle der Karte: die Höhen-Stufe ihrer Art (`_karteStufe`)
        const lod = this._karteStufe(z.preset);
        const key = this._foundryKoerperKey(z.preset, z.variant, lod, z.ov);
        const g = this._foundryCacheGet(key);
        if (g === undefined) {
            const wo = Number.isFinite(z._bedarfD2) ? z._bedarfD2 : undefined;
            this._foundryZug(key, z.preset, z.variant, lod, z.ov || undefined, wo, null);
            return null;
        }
        if (!g || !g.children || !g.children.length) {
            this._karteEndet(z, false);
            this._stoffBruch(`die Karte ${z.key}: keine Gestalt ${key} — die Fernstufe bleibt leer`);
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
        // DIE SCHRITTE DES RINGS (w16-haenger): im ersten Ring je Richtung eine Sonnen-Kachel und die Leere (`kopf`), dann die V
        // Ansichten — `v0` ist der erste Schritt dieses Aufrufs, `vBis` der des nächsten (der Ring steht, wenn er kopf + V ist)
        const kopf = iR === 0 ? B.dirs.length + 1 : 0;
        const v0 = at.offen ? at.offen.v | 0 : 0;
        const frist = this._bauFrist("karte");
        let vBis = kopf + at.V;
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
            acf: rend.autoClearColor,
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
        B.uTiefe.value.set(abst, fr.halfW, fr.halfH); // die Tiefe je Texel misst von der Mitte des Rahmens (`karteTiefe`)
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
        // DAS JAHR IST EIN EINGANG DES BAKES (w21-laub-jahr-fern): die Bühne zeichnet die Gestalt mit DEMSELBEN Stoff wie die
        // Welt, und die Uniformen des EINEN Jahrs (`uLaubPraesenz`, `uSeasonMul`) stehen auf der Stufe der Karte (`_karteJahr`):
        // jedes Blatt zieht sich um ihre Präsenz auf seine Mitte (`_jahrLage`), die Rinde bleibt — im Winter backt die Karte die
        // kahlen Äste ihrer Gestalt, die Nadel steht —, und das Laub trägt ihre Tönung. Die Stufe ist eine Funktion der Phase:
        // zwei Bakes derselben Stufe sind byte-gleich (bis w8 backte die Karte die driftende Tönung: 128 581 Albedo-Bytes wichen
        // um bis zu 5 Stufen ab). Bis w21 backte sie Sommer (Präsenz 1), und ihr Stoff hob im Winter nur die Alpha-Schwelle um
        // (1 − Präsenz) × 0,5 — was dicht deckte, blieb stehen: die ferne Krone im Winter voll, die nahe kahl.
        const su = this.state.seasonUniforms;
        still(su && su.uLaubPraesenz, (w) => w.set(jahr.praesenz.x, jahr.praesenz.y, jahr.praesenz.z));
        still(su && su.uSeasonMul, (w) => w.setRGB(jahr.mul.r, jahr.mul.g, jahr.mul.b));
        // … und trocken: die Nässe der Welt (`atmoUniforms.naesse`, wetter.K2) dunkelt die Albedo jedes Foundry-Stoffs — Regen
        // backte sonst in die Karte (Nässe 1 und Winter-Tönung bewegten 320 085 Albedo-Bytes der Fichte, gehalten 0)
        const au = this.state.atmoUniforms;
        still(au && au.naesse, (w, u) => (u.value = 0));
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
            // die Sonnen-Kacheln: die Krone aus jeder Richtung (Baum-Raum, Drehung 0), ihre Tiefe liest danach die Sicht — die
            // ersten Schritte des ersten Rings (unten, `kopf`); die Ringe danach lesen dieselben Kacheln (die Bühne gehört der Zelle
            // bis zum letzten Ring)
            B.tiefe.value = B.leer.depthTexture;
            const R = Math.max(fr.halfW, fr.halfH) * 1.15;
            B.mitte.set(0, fr.halfH, 0);
            const L = B.licht;
            Object.assign(L, { left: -R, right: R, top: R, bottom: -R, near: 0.1, far: R * 6 });
            L.coordinateSystem = rend.coordinateSystem;
            // der Bias der Kacheln nach dem Gesetz der Kaskaden (`_schattenBias`): die Texel-Kante 2R/K, die Tiefe der Box
            const texel = (2 * R) / K;
            B.uBias.value.set(
                this._schattenNormalBias(texel),
                (-AnazhRealm.SCHATTEN_KASKADE.tiefeTexel * texel) / (L.far - L.near)
            );
            // das Ziel der Karte: BC die Bühne (die Ablage legt sie in ihre Schicht), rgba8 ihre Schicht im Array-Ziel
            const schicht = bc ? 0 : z.idx;
            for (let s = v0; s < kopf + V; s++) {
                const j = s,
                    v = s - kopf;
                if (j < kopf - 1) {
                    // die Sonnen-Kachel j: die Krone aus Richtung j (Baum-Raum, Drehung 0), ihre Tiefe liest danach die Sicht
                    const d = B.dirs[j];
                    B.tiefe.value = B.leer.depthTexture;
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
                } else if (v < 0) {
                    // DIE LEERE (`B.leere`): gezeichnet über das ganze Ziel, der Pass leert nur die Tiefe
                    for (const t of B.ziel.textures) t.generateMipmaps = false;
                    B.ziel.viewport.set(0, 0, B.ziel.width, B.ziel.height);
                    rend.setMRT(B.leere.mrt);
                    rend.autoClear = true;
                    rend.autoClearColor = false;
                    rend.setRenderTarget(B.ziel, schicht);
                    this._buehneRender(rend, B.leere.szene, cam, "Karten-Leere");
                    rend.autoClearColor = vor.acf;
                    rend.setMRT(B.mrt);
                } else {
                    // Ansicht v des Rings = die Gestalt aus Peilung v·360/V unter seiner Hebung (Kamera fest, Gestalt
                    // gegengedreht) in ihrer Zelle; WebGPU zeichnet von oben — der Stoff liest gespiegelt
                    B.tiefe.value = B.schatten.depthTexture;
                    B.wurzel.rotation.y = -v * dreh;
                    B.wurzel.updateMatrixWorld(true);
                    B.uBaum.value.makeRotationY(v * dreh); // Welt → Baum
                    rend.autoClear = false; // die Schicht steht leer (die Leere des ersten Rings)
                    const zx = (v % tR) * bw,
                        zy = ring.y + Math.floor(v / tR) * bh;
                    B.ziel.viewport.set(zx, zy, bw, bh);
                    // rgba8: die Mips nach der letzten Ansicht des letzten Rings (BC: die Ablage)
                    if (!bc) for (const t of B.ziel.textures) t.generateMipmaps = letzter && v === V - 1;
                    rend.setRenderTarget(B.ziel, schicht);
                    this._buehneRender(rend, B.szene, cam, "Karten-Bühne");
                }
                if (s + 1 < kopf + V && performance.now() >= frist) {
                    vBis = s + 1;
                    break;
                }
            }
            ganz = E.wartetN + E.verschoben === offen;
        } finally {
            if (!bc) for (const t of at.rt.textures) t.generateMipmaps = true;
            for (const rt of [B.ziel, B.schatten]) rt.viewport.set(0, 0, rt.width, rt.height);
            rend.setRenderTarget(vor.rt, vor.face, vor.mip);
            rend.setMRT(vor.mrt);
            rend.autoClear = vor.ac;
            rend.autoClearColor = vor.acf;
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
        if (vBis < kopf + V || !letzter) {
            const halb = vBis < kopf + V;
            at.offen = { z, B, r: halb ? iR : iR + 1, v: halb ? vBis : 0, ms: summe + performance.now() - t0, jahr };
            return 0;
        }
        at.offen = null;
        const platte = z._liefer && {
            preset: z.preset,
            rest: z._liefer.rest,
            frame: { halfW: fr.halfW, halfH: fr.halfH },
            jahr: jahr.stufe,
        };
        // der Abzug des Labors liest die Schicht, bevor die nächste Karte die Bühne trägt (`_karteAbzug`)
        if (z._abzug) this._karteAbzugLesen(z, bc ? B.ziel : at.rt, bc ? 0 : z.idx, fr, at);
        if (bc) this._karteAblage(at, z.idx, B, platte, this._karteSaumVon(at, z, fr, B.laub));
        B.zuletzt = performance.now();
        this._foundryLiefer(this._foundry, "haupt", "karte", z._liefer, summe + B.zuletzt - t0);
        (at.weltMs || (at.weltMs = [])).push(+(summe + B.zuletzt - t0).toFixed(2));
        this._karteJahrGelegt(z, jahr);
        if (!z.gebacken) this._karteGebacken(z, fr);
        return true;
    }

    // DER ABZUG DER KARTE (pipeline.K2 — EIN Bäcker): das Labor der Bäume (worlds/terrain, three r128) backt nie selbst; seine
    // Fernstufe trägt die Karte, die DIESER Bäcker für dieselbe Gestalt backt (Art, Gestalt g der Welt, ohne Prägung — der Wald
    // des Labors pflanzt die Gestalten der Welt). Bis w8 backte das Labor mit `bakeImpostorAtlas` (r128, ein Ring, Albedo aus
    // einem Halbkugel-Licht, Normale aus MeshNormalMaterial) einen Zwilling: die Karte aus Studio und Welt war nie byte-gleich.
    // Die Zelle der Welt backt neu (`_weltNeu`, an der Platte vorbei: sie trägt nur BC); nach ihrem letzten Ring liest die
    // Bühne die Schicht (`_karteAbzugLesen`). Rückgabe: { art, gestalt, frame, w, h, V, ringe, oben, albedo, normale } — die
    // Bytes der Schicht wie gebacken (rgba8, Zeilen in der Reihe des Renderers: `oben` = Zeile 0 oben).
    _karteAbzug(preset, gestalt) {
        const rend = this.state.renderer;
        if (!rend || rend._isHeadlessNull || !this.state.rendererReady)
            return Promise.reject(this._stoffBruch("die Karte: der Abzug braucht den Welt-Renderer"));
        const z = this._foundryEnsureImpostorRecord(preset, gestalt, null);
        if (!z) return Promise.reject(this._stoffBruch(`die Karte ${preset}|${gestalt}: keine Zelle`));
        if (z.gescheitert) return Promise.reject(this._stoffBruch(`die Karte ${z.key}: gescheitert`));
        const zusage = new Promise((ja, nein) => (z._abzug || (z._abzug = [])).push({ ja, nein }));
        const q = this._impostorBakeQueue || (this._impostorBakeQueue = []);
        z._weltNeu = true;
        if (!q.includes(z.key)) q.push(z.key);
        // der Bäcker der Welt backt sie (`_tickKarteWelt`, wartende Abzüge zuerst); friert das Portal die Heimat ein, treibt ihn
        // ihr Render-Takt über `_tickKarteAbzug` — kein eigener Zeitgeber (gate:v1-pfad W7)
        const offen = this._karteAbzugOffen || (this._karteAbzugOffen = new Set());
        if (!offen.size) this._karteAbzugFrist = { ringe: -1, seit: 0 };
        offen.add(z);
        return zusage;
    }
    // DER TAKT DES ABZUGS (W7: der Foundry-Pfad pollt nicht): friert das Portal die Heimat ein, kehrt ihr Render-Takt vor jedem
    // Tick um (`dirigent-takt`) und ruft nur diesen — solange ein Abzug wartet, treibt er den EINEN Bäcker der Welt
    // (`_tickImpostorBake`: dieselbe Leine, dasselbe Budget je Takt wie im Spiel), sonst bleibt die Heimat gefroren. Bis w8
    // trieb der Abzug den Bäcker mit eigenem Zeitgeber, der sich je Ring neu ansetzte (ein Zeit-Kreis neben dem Takt). Die
    // Frist zählt den Stillstand der Bühne (kein Ring irgendeiner Karte in 120 s), nie das Warten: die Karten backen nacheinander.
    _tickKarteAbzug() {
        const offen = this._karteAbzugOffen;
        if (!offen || !offen.size) return 0;
        for (const z of offen) if (!z._abzug) offen.delete(z);
        if (!offen.size) return 0;
        const at = this._impostorAtlas();
        const n = at && at.schrittMs ? at.schrittMs.length : 0;
        const F = this._karteAbzugFrist;
        const jetzt = performance.now();
        if (n !== F.ringe) [F.ringe, F.seit] = [n, jetzt];
        if (jetzt - F.seit <= 120000) return this._tickImpostorBake();
        for (const z of offen) this._karteAbzugBruch(z, "die Bühne stand 120 s ohne Ring");
        offen.clear();
        return 0;
    }
    // Jeder Wartende der Zelle erfährt den Bruch laut (das Labor zeigt ihn als `fehler`).
    _karteAbzugBruch(z, grund) {
        if (!z._abzug) return;
        for (const w of z._abzug.splice(0)) w.nein(this._stoffBruch(`die Karte ${z.key}: ${grund}`));
        z._abzug = null;
    }
    // Die Schicht `schicht` des Ziels `rt` lesen (Albedo und Normale, Stufe 0) und jeden Wartenden der Zelle lösen. WebGPU liest
    // je Schicht (`readRenderTargetPixelsAsync`, die Kopie geht beim Ruf in die Schlange — vor jeder späteren Karte); das
    // WebGL2-Rückend von r184 liest nur TEXTURE_2D — eine Schicht des Array-Ziels liest `framebufferTextureLayer`.
    _karteAbzugLesen(z, rt, schicht, fr, at) {
        const rend = this.state.renderer;
        const wer = z._abzug;
        z._abzug = null;
        const w = rt.width,
            h = rt.height;
        const lies = (i) => {
            if (rend.backend.isWebGPUBackend) return rend.readRenderTargetPixelsAsync(rt, 0, 0, w, h, i, schicht);
            const be = rend.backend,
                gl = be.gl,
                fb = gl.createFramebuffer(),
                tg = be.get(rt.textures[i]).textureGPU,
                px = new Uint8Array(w * h * 4);
            be.state.bindFramebuffer(gl.READ_FRAMEBUFFER, fb);
            if (rt.depth > 1) gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tg, 0, schicht);
            else gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tg, 0);
            gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
            be.state.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
            gl.deleteFramebuffer(fb);
            return Promise.resolve(px);
        };
        Promise.all([lies(0), lies(1)]).then(
            ([a, n]) => {
                const aus = {
                    art: z.preset,
                    gestalt: z.variant,
                    frame: { halfW: fr.halfW, halfH: fr.halfH },
                    w,
                    h,
                    V: at.V,
                    ringe: at.ringe.ringe.map((r) => ({ hebung: r.hebung, teiler: r.teiler, y: r.y, h: r.h })),
                    oben: rend.backend.isWebGPUBackend === true,
                    albedo: new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
                    normale: new Uint8Array(n.buffer, n.byteOffset, n.byteLength),
                };
                for (const x of wer) x.ja(aus);
            },
            (e) => {
                for (const x of wer) x.nein(this._stoffBruch(`die Karte ${z.key}: der Abzug liest nicht`, e));
            }
        );
    }

    // DER SAUM DER KARTE JE HEBUNGS-RING (w4-laub-saum, phyto-core `karteSaumRinge`): Laub oder Nadel aus dem Gesetz der Art
    // (`treeParams` der Nah-Stufe, mit dem Samen der Gestalt — dieselbe Ableitung, aus der ihr Körper wächst), im Bild JEDES Rings
    // das Seitenmaß seiner Texel und sein Kronen-Fuß aus der Laub-Hülle der L1 (ihr tiefster Punkt, ihr Radius um die
    // Stammachse). [Seitenmaß je Ring, Fuß je Ring, nadel, Stärke, Zelle, Schwelle des Bands, Gänge und Weite des Bands] für die
    // GPU-Ablage (`saumK`, phyto-core `karteSaumSchluessel`); ohne Krone (keine Pflanzen-Art, kein Laub) Fuß −1: jede Zeile
    // ist Stamm. Bis w23-karte-l2 trug sie die Zelle der Blattgröße statt des Seitenmaßes.
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
                      at.cw,
                      at.ch
                  )
                : null;
        const G = pc.KARTEN_GESETZ;
        const aus = new Float32Array(16).fill(1, 0, 4).fill(-1, 4, 8);
        aus.set([G.saum, G.saumZelle, G.saumMin, G.saumBand, G.saumWeite], 9);
        if (!s) return aus;
        s.ringe.forEach((r, i) => ((aus[i] = r.seite), (aus[4 + i] = r.fuss)));
        aus[8] = s.nadel ? 1 : 0;
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
                ...[4, 5, 6, 7, 8, 9].map(puffer),
                S(10, { buffer: { type: "uniform" } }), // der Saum der Karte (`_karteSaumVon`), je Bake
                puffer(11), // die Tiefe je Texel (w4-laub-karte): Summe und Zahl der deckenden je Stufe der Normale
            ],
        });
        const modul = dev.createShaderModule({ label: "karte-rechner", code: AnazhRealm.KARTE_RECHNER_WGSL });
        const satz = (this._karteRechnerSatz = { bereit: false, layout, pipes: {}, dev });
        const pl = dev.createPipelineLayout({ bindGroupLayouts: [layout] });
        const namen = ["stufe0", "summeK", "saumK", "grenzeK", "bc1", "normalK", "bc5", "sicht"];
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
    // sich nur die Ziel-Schicht der Kopien): Stufe 0 zählt die Deckung je Ansicht, jede tiefere Stufe summiert,
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
            const ord = ["w", "h", "k", "quelle", "ziel", "V", "fuss", "aus", "zeile", "thr", "w0", "hA0", "gi", "t"];
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
            // blockB: Bytes je Block (bc: 4×4 Texel; die Sonnen-Sicht rgba8: 4 Texel einer Zeile, 16 B) — die Zeile auf 256 B gepolstert
            const zeileB = pad((w / 4) * blockB);
            const zeilen = tex === 2 ? h : h / 4;
            const off = ausB;
            ausB += pad(zeileB * zeilen);
            kopien.push({ tex, mip, off, zeileB, zeilen, w, h });
            return { aus: off / 4, zeile: zeileB / 4, vonW };
        };
        const base = { V, thr: G.schwelle, w0: W, hA0: at.ch };
        zug("stufe0", Object.assign({}, base, { w: W, h: H }), Math.ceil(W / 16), Math.ceil(H / 16));
        // Albedo: JEDE Stufe deckungstreu mit dem Saum (w23-karte-l2) — Stufe 0 wählt aus der Bühne selbst, jede tiefere aus
        // ihrer Summe; der Stamm unter dem Kronen-Fuß wählt auf jeder Stufe zeilenweise aus seiner eigenen Deckung
        // (w28-karte-stamm: bis hier glättete jede tiefere Stufe ihre Deckung in vier Gängen für ihn — die Gänge und ihr
        // zweiter Puffer fielen)
        let so = 0;
        let quelle = 0;
        for (let k = 0; k < M.a.length; k++) {
            const wk = W >> k,
                hk = H >> k,
                fuss = 1 << (2 * k);
            if (k === 0) {
                zug(
                    "saumK",
                    Object.assign({}, base, { w: wk, h: hk, k, fuss }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                zug("grenzeK", Object.assign({}, base, { w: wk, h: hk, k, fuss, gi: 0 }), V, 1);
            } else {
                zug(
                    "summeK",
                    Object.assign({}, base, { w: wk, h: hk, k, quelle, ziel: so, fuss }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                // DER SAUM (phyto-core `karteSaumSchluessel`): der Schlüssel der Wahl — über dem Kronen-Fuß das Band und das
                // Muster der Art, darunter der Stamm zeilenweise massentreu — in den Puffer der Schlüssel; Grenze und Ablage
                // lesen ihn
                zug(
                    "saumK",
                    Object.assign({}, base, { w: wk, h: hk, k, ziel: so, fuss }),
                    Math.ceil(wk / 16),
                    Math.ceil(hk / 16)
                );
                zug("grenzeK", Object.assign({}, base, { w: wk, h: hk, k, ziel: so, fuss, gi: k * V }), V, 1);
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
        // Normale: Stufe j der Welt = Stufe j+1 der vollen Bühne — mit ihr die Tiefe je Texel (w4-laub-karte) im selben Maß,
        // dieselbe Kette (phyto-core `karteMasse` t), gemittelt über die deckenden Texel ihres Fußabdrucks: normalK summiert
        // beide, bc5 legt beide ab (die Tiefe als BC4 in ihre Schicht, ihre Ablage in gi und t)
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
            const t = ablage(3, j, wj, hj, 8);
            zug(
                "bc5",
                Object.assign({}, base, {
                    w: wj,
                    h: hj,
                    k: j + 1,
                    ziel: no,
                    aus: a.aus,
                    zeile: a.zeile,
                    gi: t.aus,
                    t: t.zeile,
                }),
                Math.ceil(wj / 32),
                Math.ceil(hj / 32)
            );
            nq = no;
            no += wj * hj;
        }
        // Sonnen-Sicht: rgba8 (die vier Beiwerte ihres linearen Felds), eine Stufe
        const l = ablage(2, 0, M.lw, M.lh, 16);
        zug(
            "sicht",
            Object.assign({}, base, { w: M.lw, h: M.lh, t: G.lichtTeiler, aus: l.aus, zeile: l.zeile }),
            Math.ceil((M.lw * M.lh) / 64),
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
            dA: mk("dA", (W / 2) * (H / 2) * 4, U.STORAGE), // die Schlüssel der Wahl einer Stufe ≥ 1 (Stufe 0 legt sie in die Summe)
            zahl: mk("zahl", (V + 5) * 4, U.STORAGE | U.COPY_DST),
            grenze: mk("grenze", M.a.length * V * 8, U.STORAGE), // je Stufe und Ansicht (Grenzwert-Bits, Lage)
            aus: mk("aus", ausB, U.STORAGE | U.COPY_SRC),
            saum: mk("saum", 64, U.UNIFORM | U.COPY_DST), // [Seitenmaß und Kronen-Fuß je Ring, Art, Band] je Bake (`_karteSaumVon`)
            tsum: mk("tsum", no * 8, U.STORAGE), // die Tiefe je Stufe der Normale: (Σ t, Zahl der deckenden Texel)
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
                    ...["summe", "nsum", "dA", "zahl", "grenze", "aus", "saum", "tsum"].map((n, i) => ({
                        binding: 4 + i,
                        resource: { buffer: P[n] },
                    })),
                ],
            });
        }
        dev.queue.writeBuffer(plan.P.saum, 0, saum);
        // die Schichten bekommen ihre GPU-Form vor der ersten Ablage (gezeichnet wird eine Karte erst gebacken)
        if (!this._karteGpuTexturen(at)) for (const t of this._karteTexturen(at)) rend.initTexture(t);
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
                    // die Stufe des Jahrs reist im Wert (`_karteJahr`): die Platte trägt die Karte EINER Stufe
                    const karte = { bytes, frame: platte.frame, jahr: platte.jahr };
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
    // EIN KNOTEN JE ATLAS (w27-karte-nadel): Nadel und Jahr wachsen IN ihrem Knoten (r184 liest die Länge je Programm-Bau,
    // `UniformArrayNode.setup`), wie die Texturen des Atlas nur ihren Wert tauschen. Bis hier legte das Wachsen einen neuen
    // Knoten desselben Namens an: die Albedo (`_buildPbrNodeMaterial`) hielt den alten, das Laub-Licht (`_laubLichtStoff`) holte
    // je Programm-Bau den neuen — „redeclaration of karteNadelStruct", die Karte der vollen Stadt sagte ab (GTX 1050, 09.11.)
    _karteNadel(T, z) {
        const at = this._impostorAtlas();
        const tab = globalThis.__terrainCore && globalThis.__terrainCore.PHYTO_PRESETS;
        if (!tab) return AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        // DER FESTE NAME (w4-b-knoten, Lehre 23): ohne ihn schreibt r184 `NodeBuffer_<Knoten-id>` ins WGSL — die Bytes der
        // Karten-Arena wanderten mit jeder Änderung der Bau-Reihenfolge (headless kalt 01.11.: NodeBuffer_189313 → _198261)
        if (!at.nadelU) {
            at.nadelU = (T || THREE.TSL).uniformArray([], "float").setName("karteNadel");
            at.jahrU = (T || THREE.TSL).uniformArray([], "vec4").setName("karteJahr");
        }
        const [a, j] = [at.nadelU.array, at.jahrU.array];
        let n = a.length;
        if (n < Math.max(at.n, 1)) {
            while (n < Math.max(at.n, 1)) n = Math.max(32, n * 2);
            // die Reihe des Jahrs (`_karteJahrFarbe`) wächst mit: EINE Länge je Schicht, sie steht im Programm-Schlüssel
            while (a.length < n) (a.push(0), j.push(new THREE.Vector4(1, 1, 1, 1)));
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

    // DIE JAHRES-STUFE DER KARTE (w21-laub-jahr-fern): die Karte ist gebacken — das Jahr ist ein Eingang ihres Bakes, nie ein
    // zweites Jahr in ihrem Stoff. Die Phase der Welt fällt auf `KARTE_JAHR.stufen` Stufen je Jahr, Stufe 0 ist die Mitte des
    // Sommers (Präsenz 1, Tönung ×1); jede Stufe trägt die Präsenz und die Tönung ihrer Mitte aus DEMSELBEN Gesetz wie die Welt
    // (`_saisonPraesenz`, `_saisonMul` über das SAISON_GESETZ). Rein: die Bühne liest sie (`_karteWeltBacken`), der Jahres-Takt
    // vergleicht sie (`_karteJahrTakt`), die Linse ruft sie GPU-frei (gate:season-meadow F4).
    _karteJahr(phase, out) {
        const N = AnazhRealm.KARTE_JAHR.stufen;
        const S = AnazhRealm.KARTE_JAHR.sommer;
        const ph = Number.isFinite(phase) ? phase : S;
        const stufe = (((Math.round((ph - S) * N) % N) + N) % N) | 0;
        const mitte = (((S + stufe / N) % 1) + 1) % 1;
        const o = out || { praesenz: { x: 1, y: 1, z: 1 }, mul: { r: 1, g: 1, b: 1 } };
        o.stufe = stufe;
        o.phase = mitte;
        this._saisonPraesenz(mitte, o.praesenz);
        this._saisonMul(mitte, o.mul);
        return o;
    }

    // DIE SCHICHT TRÄGT IHRE STUFE (`_karteJahr`): gelegt (gebacken oder von der Platte), merkt die Zelle die Stufe, und die
    // Reihe des Jahrs (`_karteJahrFarbe`) trägt die Tönung, mit der ihr Laub gebacken ist. Zog die Welt während des Bakes in eine
    // andere Stufe (der Spieler sagt „Winter", der Abzug des Labors legte den Sommer), bleibt die Karte neu: der Bäcker reiht sie
    // wieder ein (`_tickKarteWelt`) — der Jahres-Takt fragt nur beim Wechsel der Phase, nie wieder für diese Karte.
    _karteJahrGelegt(z, jahr) {
        z.jahr = jahr.stufe;
        z._weltNeu = jahr.stufe !== this._karteJahr(this.state.seasonPhase).stufe;
        const U = this._karteJahrFarbe(null);
        const e = U && U.array[z.idx];
        if (e) e.set(jahr.mul.r, jahr.mul.g, jahr.mul.b, 1);
    }

    // DIE TÖNUNG DER SCHICHT (die Reihe des Jahrs, je Atlas-Schicht ein vec4): der Karten-Stoff zeichnet ihr Laub in der Tönung
    // der Welt — die gebackene Albedo × uSeasonMul / die Tönung ihres Bakes, die Nadel-Art ×1 —, dieselbe Farbe wie die nahe
    // Stufe, stetig zwischen zwei Bakes (`_buildPbrNodeMaterial`). Sie wächst mit der Reihe der Nadel (`_karteNadel`).
    _karteJahrFarbe(T) {
        this._karteNadel(T); // die Reihen wachsen zusammen: EINE Länge, ein Programm-Schlüssel
        return this._impostorAtlas().jahrU;
    }

    // DER JAHRES-TAKT DER KARTE (`_tickSeason` nach jedem Wechsel der Phase): wandert die Welt in eine andere Stufe
    // (`_karteJahr`), backt jede gelegte Karte, deren Schicht eine andere trägt, neu — nah zuerst (`_bedarfD2`, die Schlange
    // des Bäckers); bis dahin zeichnet die alte Schicht. Die Kosten hängen an der ÄNDERUNG, nie am Bild: höchstens EIN Bake je
    // Karte und Stufe (`KARTE_JAHR.stufen` je Jahr).
    _karteJahrTakt() {
        const at = this._kartenAtlas;
        if (!at || !at.zellen || !at.zellen.size) return 0;
        const s = this._karteJahr(this.state.seasonPhase).stufe;
        if (at.jahrStufe === s) return 0;
        at.jahrStufe = s;
        const q = this._impostorBakeQueue || (this._impostorBakeQueue = []);
        let n = 0;
        for (const z of at.zellen.values()) {
            if (!z.gebacken || z.gescheitert || z.jahr === s) continue;
            z._weltNeu = true;
            if (!q.includes(z.key)) q.push(z.key);
            n++;
        }
        return n;
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
// Der Karten-Atlas wächst je 2 Schichten (`_impostorAtlasTexturen`, Start 8): je Schicht 0,55 MiB mit den Hebungs-Ringen (lod.K3:
// BC1-Albedo 298 KB + RGTC2-Normale 149 KB + Sonnen-Sicht rgba8 112 KB, 128 × 3584 samt Mips; waagrecht allein 0,3 MiB), das Wachsen
// kopiert nur beim Einzug einer Art (Mess-Wiese 18 Karten in 18 Schichten).
AnazhRealm.KARTEN_ATLAS_SCHRITT = 2;
// DAS GITTER DER KARTE (heil-laub-tiefe, `_impostorQuad` und der Stoff): `zellen` Spalten × Zeilen, an deren Ecken der Stoff die
// Tiefe der Gestalt liest (`vertexNode`; der frühe Tiefentest bleibt, kein frag_depth) — die Mitte trägt die Kuppel der Krone,
// Rand und Fuß ihren Saum. `px` die Bild-Höhe der Karte in Pixeln der Szene, ab der ihr Gitter zu wachsen beginnt und ab der
// es ganz steht: jede innere Kante schattiert ihre 2×2-Blöcke doppelt, an der fernen Karte so viel wie die Karte selbst — dort
// zeichnen die zwei Dreiecke von f0dab43d (Radeon, Mess-Wiese Ego, Einzel-Frames in EINER Welt gegen die Karte von f0dab43d:
// 4 × 4 an jeder Karte p50 +0,6 ms, 2 × 2 ab 64/128 px +0,1 ms). Je Instanz 8 Dreiecke (Mess-Wiese Ego: 2221 Karten, +13k
// Dreiecke; 653 im Bild, Median 44 px hoch, 209 über 64 px, 53 über 128 px).
AnazhRealm.KARTE_GITTER = Object.freeze({ zellen: Object.freeze([2, 2]), px: Object.freeze([64, 128]) });
// DIE TIEFEN-PARALLAXE DER KARTE (w27-lod-baum, lod.K5; der Stoff, `_relief`): das Fragment liest jede Ansicht dort, wo der Strahl
// des Auges ihr Relief trifft — der Festpunkt beginnt `start` Rahmen-Halbbreiten vor der Ebene der Ansicht und liest `gaenge`-mal
// die Tiefe je Texel, auf der Mip-Stufe, deren Texel `texel` Texel der Albedo misst (die Ablage mittelt dort die deckenden: die
// Hülle der Krone, nie das einzelne Blatt — an ihm springt der Festpunkt); rückt der letzte Gang die Tiefe um mehr als `halt`
// Rahmen-Halbbreiten, trifft der Strahl nichts. Am CPU-Modell der Station (Pose der Mess-Wiese: Peilung 67°, Auge 0,87 m über dem
// Fuß, 26 m; es trifft die GPU-Zahl der Weide, 5,26 gegen 5,16 px) der Kanten-Versatz L0 ↔ Karte ohne → mit Relief: Weide 5,26 → 3,16 ·
// Eiche 2,78 → 1,50 · Birke 3,43 → 1,58 · Karst 5,96 → 2,41 · Fichte 3,27 → 2,66 px; die Grenze des Texels (die Karte genau aus dem
// Auge gebacken, 128 × 256) liegt bei der Weide bei 1,7 px. 0 Gänge: jede Ansicht an der Stelle des Quads (die Karte bis w27, die
// Mutante der Strich-Wand in gate:foundry-impostor).
AnazhRealm.KARTE_RELIEF = Object.freeze({ gaenge: 3, texel: 4, start: 0.48, halt: 0.48 });

// DAS JAHR DER KARTE (w21-laub-jahr-fern, `_karteJahr`): `stufen` Stufen je Jahr — die Karte backt ihr Laub in der Präsenz und
// Tönung der Stufe und backt neu, wenn die Welt die Stufe wechselt (`_karteJahrTakt`): 32 Stufen tragen die Präsenz in
// Schritten ≤ 0,083 (Sommer → Herbst 0,056, Herbst → Winter 0,061, Winter → Frühling 0,083, Frühling → Sommer 0,035), jede
// Jahreszeit-Mitte ist eine Stufe; beim Jahr von 2400 s backt jede Karte alle 75 s einmal. `sommer` die Phase der Stufe 0 (die
// Mitte des Sommers: Präsenz 1, Tönung ×1).
AnazhRealm.KARTE_JAHR = Object.freeze({ stufen: 32, sommer: 0.375 });
// Die Bühne gibt ihren Speicher frei, wenn die Schlange so lange leer ist (ms; `_karteBuehneRuhe`).
AnazhRealm.KARTE_BUEHNE_RUHE_MS = 3000;
// DIE SONNEN-SICHT DER KRONE (A7-Term, `_karteBuehne`): die Richtungen, aus denen die Bühne die Sicht misst, als (Höhe,
// Azimut) in Grad — der Zenit, der 45°-Kranz und versetzt der Kranz der tiefen Sonne (15°), acht Azimute im Ganzen; über sie
// fittet die Bühne das lineare Feld v(d) = c0 + c·d (w14-nadel-licht). `spanne` je Beiwert (c0, cx, cy, cz) das Intervall,
// das rgba8 trägt (die Grenzen des Fits über jede Sicht 0/1 der Richtungen: c0 −0,40…1,40, cx und cz ±0,72, cy ±1,76); die
// Tiefen-Kachel je Richtung (px). Ihren Versatz gegen die Selbst-Verschattung trägt das Gesetz der Kaskaden (`_schattenBias`:
// `SCHATTEN_KASKADE.normalTexel` und `tiefeTexel` je Texel-Kante) — bis w14 stand hier ein Zwilling in Metern (0,04 m Normale,
// −0,0005 Tiefe für jede Krone).
AnazhRealm.KARTE_SONNEN_SICHT = Object.freeze({
    richtungen: Object.freeze([
        [90, 0],
        [45, 0],
        [45, 90],
        [45, 180],
        [45, 270],
        [15, 45],
        [15, 135],
        [15, 225],
        [15, 315],
    ]),
    spanne: Object.freeze([
        [-0.5, 1.5],
        [-1, 1],
        [-2, 2],
        [-1, 1],
    ]),
    karte: 256,
});
// DER RECHNER DER ABLAGE (`_karteRechenPlan`): Deckung, deckungstreue Mips, BC1, BC5 und die Sonnen-Sicht einer Schicht.
AnazhRealm.KARTE_RECHNER_WGSL = `
struct P {
    w: u32, h: u32, k: u32, quelle: u32,
    ziel: u32, V: u32, fuss: f32, aus: u32,
    zeile: u32, thr: f32, w0: u32, hA0: u32,
    gi: u32, t: u32,
    ringY: vec4<u32>, ringT: vec4<u32>,
};
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var tAlb: texture_2d<f32>;
@group(0) @binding(2) var tNrm: texture_2d<f32>;
@group(0) @binding(3) var tSicht: texture_2d<f32>;
@group(0) @binding(4) var<storage, read_write> summe: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> nsum: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read_write> dA: array<f32>;
@group(0) @binding(7) var<storage, read_write> zahl: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> grenze: array<u32>;
@group(0) @binding(9) var<storage, read_write> aus: array<u32>;

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

// Stufe 0: die Deckung je Ansicht und die Sonnen-Sicht über die deckenden Texel (zahl: [0, V) Deckung, V … V+3 die Summen
// der vier Beiwerte ihres Felds, V+4 Zahl)
@compute @workgroup_size(16, 16)
fn stufe0(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    if (!deckt(g.x, g.y)) { return; }
    atomicAdd(&zahl[ansicht(g.x, g.y)], 1u);
    let s = vec4<u32>(round(clamp(textureLoad(tSicht, vec2<i32>(g.xy), 0), vec4<f32>(0.0), vec4<f32>(1.0)) * 255.0));
    for (var c = 0u; c < 4u; c++) { atomicAdd(&zahl[p.V + c], s[c]); }
    atomicAdd(&zahl[p.V + 4u], 1u);
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
    summe[p.ziel + g.y * p.w + g.x] = s;
}

// DER SAUM DER KARTE AUF JEDER STUFE (phyto-core karteSaumSchluessel, karteSaumMuster — dieselben Zahlen, _karteSaumVon): je
// Ring das Seitenmaß seiner Texel (Breite durch Höhe im Rahmen) und sein Kronen-Fuß (Stufe-0-Zeile der Ansicht; −1: keine Krone,
// jede Zeile ist Stamm); art: Nadel (1) oder Laub (0), Stärke, Zelle in Schritten der Stufe, Schwelle des Bands; band.x die
// Gänge des binomialen Kerns, band.y die Weite des Schritts
struct Saum { seite: vec4<f32>, fuss: vec4<f32>, art: vec4<f32>, band: vec4<f32> };
@group(0) @binding(10) var<uniform> saum: Saum;
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
// Die Farbe (r·a, g·a, b·a) und Deckung a eines Texels der Stufe: Stufe 0 die Bühne an der Schwelle, sonst die Summe seines
// Fußabdrucks (a zählt die deckenden Stufe-0-Texel)
fn farbSumme(x: u32, y: u32) -> vec4<f32> {
    if (p.k == 0u) {
        if (!deckt(x, y)) { return vec4<f32>(0.0); }
        return vec4<f32>(textureLoad(tAlb, vec2<i32>(i32(x), i32(y)), 0).rgb, 1.0);
    }
    return summe[p.ziel + y * p.w + x];
}
// Der Schritt je Achse in feinen Texeln für band.y Texel der gröberen Achse (phyto-core saumSchritt, saumWeite): Band und Zelle
// messen in der Welt und im Maß, das der Schirm als Saum liest
fn schritt(ri: u32) -> vec2<f32> {
    let s = saum.seite[ri];
    return saum.band.y * vec2<f32>(max(1.0 / s, 1.0), max(s, 1.0));
}
// DAS BAND: die Summe im binomialen Kern (2n + 1)² um (x, y) in seiner Ansicht, je Achse im Schritt st (der Rand leer — der
// Rahmen ist nie der Umriss), durch die Summe des ganzen Kerns (farbSumme gewogen: .rgb / .a die Farbe der deckenden, .a / fuss
// die geglättete Deckung)
// Das Gewicht des binomialen Kerns (2n + 1 Abgriffe, n = band.x; ihre Summe 2^2n) am Abgriff d aus dem am Abgriff d − 1 — EIN
// Kern für Band, Normale und Licht, ohne Feld: ein Feld je Aufruf, im 16er-Block der BC5-Ablage entrollt, fand der Compiler der
// GTX (D3D12) nie zu Ende (w24-strauch-saum, 02c89d91/33c73b16: die frische Welt der Tafel stand nach 2099 Takten nicht)
fn bw(w: f32, d: i32, n: i32) -> f32 {
    return select(w * f32(n - d + 1) / f32(max(n + d, 1)), 1.0, d == -n);
}
fn band(x: u32, y: u32, fe: vec4<u32>, st: vec2<f32>) -> vec4<f32> {
    let n = i32(saum.band.x);
    let sb = exp2(f32(2 * n));
    var s = vec4<f32>(0.0);
    var wy = 0.0;
    for (var dy = -n; dy <= n; dy++) {
        wy = bw(wy, dy, n);
        let yy = i32(y) + i32(round(f32(dy) * st.y));
        if (yy < i32(fe.y) || yy >= i32(fe.y + fe.w)) { continue; }
        var wx = 0.0;
        for (var dx = -n; dx <= n; dx++) {
            wx = bw(wx, dx, n);
            let xx = i32(x) + i32(round(f32(dx) * st.x));
            if (xx < i32(fe.x) || xx >= i32(fe.x + fe.z)) { continue; }
            s += wy * wx * farbSumme(u32(xx), u32(yy));
        }
    }
    return s / (sb * sb);
}
// Die Deckung des Bands mit ihrem ersten Moment (phyto-core karteSaumBand moment 1 / 2): .x wie band().a, .yz die Richtung zur
// Masse in Schritten des Kerns — das Gefälle der Deckung, im selben Lauf über den Kern
fn bandZug(x: u32, y: u32, fe: vec4<u32>, st: vec2<f32>) -> vec3<f32> {
    let n = i32(saum.band.x);
    let sb = exp2(f32(2 * n));
    var s = vec3<f32>(0.0);
    var wy = 0.0;
    for (var dy = -n; dy <= n; dy++) {
        wy = bw(wy, dy, n);
        let yy = i32(y) + i32(round(f32(dy) * st.y));
        if (yy < i32(fe.y) || yy >= i32(fe.y + fe.w)) { continue; }
        var wx = 0.0;
        for (var dx = -n; dx <= n; dx++) {
            wx = bw(wx, dx, n);
            let xx = i32(x) + i32(round(f32(dx) * st.x));
            if (xx < i32(fe.x) || xx >= i32(fe.x + fe.z)) { continue; }
            s += wy * wx * farbSumme(u32(xx), u32(yy)).a * vec3<f32>(1.0, f32(dx), f32(dy));
        }
    }
    return s / (sb * sb);
}
// DER SCHLÜSSEL DER WAHL (phyto-core karteSaumSchluessel): über dem Kronen-Fuß das Band — wählbar mit eigener Deckung oder ab der Schwelle seiner
// Deckung, g + Stärke × (Muster − ½) in der Zelle der Stufe an der gröberen Achse des Texels, ganz Gedecktes + 2 × Stärke (es
// bleibt); das Muster AN DER DECKUNG (w28-laub-deckung): gelesen an der Höhenlinie g = ½, zu der das Gefälle der Deckung das
// Texel zieht (bandZug: Richtung zur Masse, Abstand σ · probit g), sein Hub 4 g (1 − g) — längs des Gefälles entscheidet die
// Deckung, kein gewähltes Texel schwebt ohne Krone;
// darunter der Stamm (stammK) — 0 heißt nie — in den Puffer der Schlüssel (Stufe 0: die Summe)
// DER STAMM UNTER DEM KRONEN-FUSS (w28-karte-stamm, phyto-core karteSaumSchluessel): zeilenweise massentreu auf JEDER Stufe — die
// Zeile der Ansicht wählt so viele Texel, wie ihre Deckung trägt (die Rundung des Gesetzes: die Hälfte aufwärts), die deckendsten
// zuerst, der Gleichstand nach der Lage; ein gewähltes trägt 3 + c (über dem Band, unter dem ganz Gedeckten). Stufe 0 bleibt,
// wie sie backt (c = 1: 4). Die Deckung ist ein Vielfaches von 1 / fuss, jede Summe und jeder Vergleich rechnet genau wie der Kern
fn stammK(x: u32, y: u32, fe: vec4<u32>, c: f32) -> f32 {
    var sum = 0.0;
    var vor = 0.0;
    for (var xx = fe.x; xx < fe.x + fe.z; xx++) {
        let q = farbSumme(xx, y).a / p.fuss;
        sum += q;
        if (q > c || (q == c && xx < x)) { vor += 1.0; }
    }
    return select(0.0, 3.0 + c, vor < floor(sum + 0.5));
}
@compute @workgroup_size(16, 16)
fn saumK(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    let i = g.y * p.w + g.x;
    let c = farbSumme(g.x, g.y).a / f32(p.fuss);
    let v = ansicht(g.x, g.y);
    let ri = v / jeRing();
    let fe = feld(v);
    let f = f32(1u << p.k);
    let X = (f32(g.x - fe.x) + 0.5) * f;
    let Y = (f32(g.y - fe.y) + 0.5) * f;
    var kk = 0.0;
    if (Y > saum.fuss[ri]) {
        if (c > 0.0) { kk = stammK(g.x, g.y, fe, c); }
    } else {
        let st = schritt(ri);
        let bz = bandZug(g.x, g.y, fe, st) / f32(p.fuss);
        let gb = bz.x;
        if (gb >= saum.art.w || c > 0.0) {
            let gg = clamp(gb, 0.001, 0.999);
            let zug = -sqrt(saum.band.x / 2.0) * f * log(gg / (1.0 - gg)) / 1.702 / max(1e-6, length(bz.yz));
            let q = vec2<f32>(X / st.x, Y / st.y) + bz.yz * zug;
            let m = saumMuster(q.x, q.y, saum.art.z * f, saum.art.x > 0.5);
            kk = max(1e-9, gb + select(0.0, 2.0 * saum.art.y, gb >= 1.0) + saum.art.y * 4.0 * gg * (1.0 - gg) * (m - 0.5));
        }
    }
    if (kk > 0.0) { kk += 1e-6 * c; }
    // Stufe 0 legt ihre Schlüssel in die Summe (erst Stufe 1 beschreibt sie): der Puffer der Schlüssel bleibt im Maß von Stufe 1
    if (p.k == 0u) { summe[i / 4u][i % 4u] = kk; } else { dA[i] = kk; }
}

// Der Schlüssel eines Texels der Stufe: saumK schrieb ihn in seinen Puffer, Stufe 0 in die Summe (0: nie gewählt)
fn schluessel(i: u32) -> f32 {
    if (p.k == 0u) { return summe[i / 4u][i % 4u]; }
    return dA[i];
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
        // die Rundung des Gesetzes (Math.round: die Hälfte aufwärts) — round() rundet die Hälfte zur geraden Zahl: deckt Stufe 0
        // 4 n + 2 Texel, wählte Stufe 1 bei geradem n einen weniger als der Kern (Radeon, Buche: 3 von 8 Ansichten, je ein Texel)
        wc = min(atomicLoad(&wz), u32(floor(deck0 * f32(nA) + 0.5)));
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
        // die Wahl jeder Stufe (w23-karte-l2: auch Stufe 0); ein gewählter Texel ohne eigene Deckung trägt die Farbe seines Bands
        let kk = schluessel(y * p.w + x);
        let o = kk > 0.0 && (kk > gr || (kk == gr && (y - gf.y) * gf.z + (x - gf.x) < gj));
        var c = vec3<f32>(0.0);
        if (o) {
            var e = farbSumme(x, y);
            if (e.a == 0.0) { e = band(x, y, gf, schritt(gv0 / jeRing())); }
            c = e.rgb / e.a;
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
// Ein Bühnen-Texel: (Normale, Tiefe je Texel t) wo er deckt, sonst 0 — die Bühne schreibt t in den vierten Kanal der
// Normale (w4-laub-karte, phyto-core karteTiefe)
fn nDek(x: u32, y: u32) -> vec4<f32> {
    if (!deckt(x, y)) { return vec4<f32>(0.0); }
    let v = textureLoad(tNrm, vec2<i32>(i32(x), i32(y)), 0);
    return vec4<f32>(oktAuf(v.xy * 2.0 - 1.0), v.w);
}
// je Stufe der Normale mit ihr die Tiefe: die Summe über die deckenden Texel des Fußabdrucks und ihre Zahl
@group(0) @binding(11) var<storage, read_write> tsum: array<vec2<f32>>;
@compute @workgroup_size(16, 16)
fn normalK(@builtin(global_invocation_id) g: vec3<u32>) {
    if (g.x >= p.w || g.y >= p.h) { return; }
    var s = vec3<f32>(0.0);
    var d = vec2<f32>(0.0);
    if (p.k == 1u) {
        for (var i = 0u; i < 4u; i++) {
            let e = nDek(g.x * 2u + (i & 1u), g.y * 2u + (i >> 1u));
            s += e.xyz;
            d += vec2<f32>(e.w, select(0.0, 1.0, dot(e.xyz, e.xyz) > 0.5));
        }
    } else {
        let wq = p.w * 2u;
        let q = p.quelle + (g.y * 2u) * wq + g.x * 2u;
        s = nsum[q].xyz + nsum[q + 1u].xyz + nsum[q + wq].xyz + nsum[q + wq + 1u].xyz;
        d = tsum[q] + tsum[q + 1u] + tsum[q + wq] + tsum[q + wq + 1u];
    }
    nsum[p.ziel + g.y * p.w + g.x] = vec4<f32>(s, 0.0);
    tsum[p.ziel + g.y * p.w + g.x] = d;
}

// Normale und Tiefe eines Texels der Stufe für die Ablage: die Richtung seiner Summe und das Mittel seiner deckenden; ein
// leerer trägt die seiner deckenden Nachbarn im Band des Saums in der eigenen Ansicht — wählt der Saum ihn, trägt er Farbe,
// Normale, Tiefe und Licht seines Bands (w24-strauch-saum: mit dem 5×5-Fenster fielen 14–17 % der gewählten Texel auf
// (0, 0, 1), die Kronen der Mess-Wiese lasen am Sonnen-Rand dunkler) —, erst ohne sie (0, 0, 1) und die Mitte des Rahmens (½).
// DER KRONEN-FUSS TRENNT DAS BAND (w28-karte-stamm): ein leerer Texel unter dem Fuß liest nur, was unter dem Fuß deckt (den
// Stamm), einer darüber nur die Krone. Bis hier trug der leere Grund neben dem Stamm die Tiefe der Krone über ihm (das Band
// reicht 24 Texel der Stufe, seine Abgriffe im Schritt 3 treffen die breite Krone und verfehlen den schmalen Stamm): das Relief
// der Karte (der Festpunkt im Fragment, KARTE_RELIEF) fand dort eine Hülle vor der Achse und las neben dem Stamm ins Leere —
// im Spiel riss der Stamm der Karte unter der Krone ab, schon auf Stufe 0 (Radeon, Mess-Wiese, die Buche 4 m hinter dem
// Wechsel: unter der Krone standen Punkte, der Stamm erst im unteren Teil; ohne Relief stand er ganz, mit dieser Trennung
// steht er vom Boden bis zur Krone). Ohne Stamm im Band steht der Grund in der Mitte des Rahmens: auf der Achse
fn ablageNT(x: u32, y: u32) -> vec3<f32> {
    var s = nsum[p.ziel + y * p.w + x].xyz;
    var d = tsum[p.ziel + y * p.w + x];
    if (dot(s, s) < 1e-12) {
        let v = ansicht(x, y);
        let f = feld(v);
        let st = schritt(v / jeRing());
        let n = i32(saum.band.x);
        let fuss = saum.fuss[v / jeRing()];
        let fz = f32(1u << p.k);
        let unten = (f32(y - f.y) + 0.5) * fz > fuss;
        var wy = 0.0;
        for (var dy = -n; dy <= n; dy++) {
            wy = bw(wy, dy, n);
            let yy = i32(y) + i32(round(f32(dy) * st.y));
            if (yy < i32(f.y) || yy >= i32(f.y + f.w)) { continue; }
            if (((f32(yy - i32(f.y)) + 0.5) * fz > fuss) != unten) { continue; }
            var wx = 0.0;
            for (var dx = -n; dx <= n; dx++) {
                wx = bw(wx, dx, n);
                let xx = i32(x) + i32(round(f32(dx) * st.x));
                if (xx < i32(f.x) || xx >= i32(f.x + f.z)) { continue; }
                let q = p.ziel + u32(yy) * p.w + u32(xx);
                s += wy * wx * nsum[q].xyz;
                d += wy * wx * tsum[q];
            }
        }
    }
    let l = length(s);
    return vec3<f32>(oktZu(select(vec3<f32>(0.0, 0.0, 1.0), s / l, l > 1e-6)), select(0.5, d.x / d.y, d.y > 0.0));
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
    var rt: array<f32, 16>;
    for (var t = 0u; t < 16u; t++) {
        let n = ablageNT(g.x * 4u + (t & 3u), g.y * 4u + (t >> 2u));
        rx[t] = n.x * 0.5 + 0.5;
        ry[t] = n.y * 0.5 + 0.5;
        rt[t] = n.z;
    }
    let a = bc4(rx);
    let b = bc4(ry);
    let o = p.aus + g.y * p.zeile + g.x * 4u;
    aus[o] = a.x;
    aus[o + 1u] = a.y;
    aus[o + 2u] = b.x;
    aus[o + 3u] = b.y;
    // die Tiefe je Texel als BC4 in ihre Schicht (w4-laub-karte): gi und t tragen hier ihre Ablage (Wort-Versatz, Zeile)
    let c = bc4(rt);
    let ot = p.gi + g.y * p.t + g.x * 2u;
    aus[ot] = c.x;
    aus[ot + 1u] = c.y;
}

// Die Sonnen-Sicht auf 1/lichtTeiler (p.t): das Mittel über die deckenden Texel des Fußabdrucks, ein Fußabdruck ohne
// Blatt trägt das seines Bands (sichtBand), ohne Laub darin das Mittel der Schicht (der Filter mischt an der Kante keinen fremden Wert hinein); rgba8, die vier Beiwerte
// ihres linearen Felds (w14-nadel-licht), 1 Texel je Wort — eine Schicht ohne Blatt die freie Sicht (c0 1, c 0)
@compute @workgroup_size(64)
fn sicht(@builtin(global_invocation_id) g: vec3<u32>) {
    let y = g.x / p.w;
    if (y >= p.h) { return; }
    let x = g.x - y * p.w;
    let zz = atomicLoad(&zahl[p.V + 4u]);
    var mittel = vec4<f32>(${AnazhRealm.KARTE_SONNEN_SICHT.spanne.map(([a, b], k) => (+!k - a) / (b - a)).join(", ")});
    if (zz > 0u) {
        mittel = vec4<f32>(
            f32(atomicLoad(&zahl[p.V])),
            f32(atomicLoad(&zahl[p.V + 1u])),
            f32(atomicLoad(&zahl[p.V + 2u])),
            f32(atomicLoad(&zahl[p.V + 3u]))
        ) / f32(zz) / 255.0;
    }
    var s = vec4<f32>(0.0);
    var n = 0.0;
    for (var dy = 0u; dy < p.t; dy++) {
        for (var dx = 0u; dx < p.t; dx++) {
            let sx = x * p.t + dx;
            let sy = y * p.t + dy;
            if (deckt(sx, sy)) {
                s += textureLoad(tSicht, vec2<i32>(i32(sx), i32(sy)), 0);
                n += 1.0;
            }
        }
    }
    var wert = s / max(n, 1.0);
    if (n == 0.0) { wert = sichtBand(x, y, mittel); }
    aus[p.aus + y * p.zeile + x] = pack4x8unorm(wert);
}
// Ein Fußabdruck ohne eigenes Blatt (w24-strauch-saum): das Mittel der Sonnen-Sicht der deckenden Texel im Band des Saums um
// seine Mitte (bis hier das Mittel der Schicht: 24–28 % der gewählten Texel trugen es), erst ohne Laub darin das der Schicht
fn sichtBand(x: u32, y: u32, mittel: vec4<f32>) -> vec4<f32> {
    let cx = x * p.t + p.t / 2u;
    let cy = y * p.t + p.t / 2u;
    let v = ansicht(cx, cy);
    let f = feld(v);
    let st = schritt(v / jeRing());
    let n = i32(saum.band.x);
    var s = vec4<f32>(0.0);
    var w = 0.0;
    var wy = 0.0;
    for (var dy = -n; dy <= n; dy++) {
        wy = bw(wy, dy, n);
        let yy = i32(cy) + i32(round(f32(dy) * st.y));
        if (yy < i32(f.y) || yy >= i32(f.y + f.w)) { continue; }
        var wx = 0.0;
        for (var dx = -n; dx <= n; dx++) {
            wx = bw(wx, dx, n);
            let xx = i32(cx) + i32(round(f32(dx) * st.x));
            if (xx < i32(f.x) || xx >= i32(f.x + f.z) || !deckt(u32(xx), u32(yy))) { continue; }
            s += wy * wx * textureLoad(tSicht, vec2<i32>(xx, yy), 0);
            w += wy * wx;
        }
    }
    return select(mittel, s / w, w > 0.0);
}
`;
