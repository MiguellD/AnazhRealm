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
    // Schicht einer Array-Textur (Albedo + Normale), im Studio-Layout (`bakeImpostorAtlas`: die V Ansichten vertikal
    // gestapelt, Zeilen bottom-up) ohne Umdrehen geladen. EIN Material, EIN Einheits-Quad, EINE globale Instanz-Gruppe
    // (`IMPOSTOR_ATLAS_GRUPPE`); Schicht, Rahmen und Sichthöhe reisen je Instanz (aKarte — `_lodSlotStamp`). Das FORMAT
    // ist eine Stufe desselben Pfads: mit dem WebGPU-Feature texture-compression-bc BC1-sRGB-Albedo (deckungstreue
    // Mips) + BC5-Normale auf 1/normalTeiler (CompressedArrayTexture, 0,25 MiB je Schicht), ohne es rgba8-sRGB + rg8
    // (DataArrayTexture, die GPU zieht die Mips). Mips und Kodierung laufen im Worker (Transport-Schale, Karten-Codec
    // in phyto-core), der Haupt-Thread kopiert nur die Schicht. Befund V18.528: je Karte zwei CanvasTextures, ein
    // Material, eine Gruppe und ein Programm (die Sichthöhe stand als Konstante im Fragment-Graph) — 31 MB, ~90
    // Pipelines; das Umdrehen je Karte malte im Haupt-Thread.
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
            mapNode: null, // die Basis-Texturknoten: ein Wachsen tauscht nur ihren Wert
            nmapNode: null,
            zellen: new Map(), // "fimp:<art>|<gestalt>[|ov:…]" → Zelle
            quad: null,
            mat: null,
            haengend: 0,
            verworfen: 0,
        };
        return this._kartenAtlas;
    }

    // Das Schicht-Format: BC nur über das WebGPU-Feature (WebGL2 kennt BC5 nur über Erweiterungen — dort rgba8).
    _impostorAtlasFormat() {
        const r = this.state && this.state.renderer;
        const dev =
            r && !r._isHeadlessNull && r.backend && r.backend.isWebGPUBackend === true ? r.backend.device : null;
        return dev && dev.features && dev.features.has("texture-compression-bc") ? "bc" : "rgba8";
    }

    // Die Texturen des Atlas für mindestens `bedarf` Schichten (in Schritten `KARTEN_ATLAS_SCHRITT`: das Verdoppeln hielt an
    // der Mess-Wiese 32 Schichten für 18 Karten — +4 MB VRAM, als die Solitäre ihre Karte bekamen). Das Wachsen geschieht IN den
    // beiden Texturen: ein neues Bild mit den kopierten Schichten, needsUpdate — die neue GPU-Form legt der EINE Abschied an
    // (`_texturAbschied`: die alte fällt nach dem Submit, jedes Bündel nimmt neu auf). Knoten, Programm-Vorlage und jedes
    // Render-Objekt binden so immer DIESELBE Textur (ein Tausch ließ die Textur des Programm-Baus wieder aufsteigen).
    _impostorAtlasTexturen(at, bedarf) {
        if (!at) return null;
        // Der Karten-Codec ist KERN-PFLICHT: fehlt er (ein altes phyto-core im Cache), bricht es laut — nie eine Welt,
        // die still für immer ohne Karte zeichnet.
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        if (!core || typeof core.karteMasse !== "function" || !core.KARTEN_GESETZ)
            return AnazhRealm._kernPflichtBruch("phyto:karteMasse/KARTEN_GESETZ");
        const soll = Math.max(bedarf || 0, at.n, 1);
        if (at.map && at.cap >= soll) return at;
        if (!at.masse) {
            // Bäcker-Spec aus der EINEN Quelle (foundry-core PORTAL_RENDER_CONFIG.impostor, live über das Buch) und
            // das Karten-Gesetz (phyto-core): Zell-Maße, Blickwinkel, Normal-Teiler teilen Studio und Welt.
            const ic = (AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.impostor) || null;
            if (!ic || !(ic.views > 0 && ic.cellW > 0 && ic.cellH > 0)) return null; // das Buch fehlt noch
            at.V = ic.views;
            at.cw = ic.cellW;
            at.ch = ic.cellH;
            at.nt = core.KARTEN_GESETZ.normalTeiler;
            if (!at.fmt) at.fmt = this._impostorAtlasFormat();
            at.masse = core.karteMasse(at.cw, at.ch, at.V, at.nt, at.fmt);
        }
        const S = AnazhRealm.KARTEN_ATLAS_SCHRITT;
        let cap = Math.max(8, at.cap || 0);
        while (cap < soll) cap += S;
        const M = at.masse;
        const T = THREE;
        const da = !!at.map;
        if (at.fmt === "bc") {
            const mips = (stufen, alt) =>
                stufen.map((s, k) => {
                    const data = new Uint8Array(s.bytes * cap);
                    if (alt) data.set(alt[k].data);
                    return { data, width: s.w, height: s.h };
                });
            const a = mips(M.a, da && at.map.mipmaps),
                n = mips(M.n, da && at.nmap.mipmaps);
            if (da) {
                at.map.mipmaps = a;
                at.map.image = { width: M.w, height: M.h, depth: cap };
                at.nmap.mipmaps = n;
                at.nmap.image = { width: M.nw, height: M.nh, depth: cap };
            } else {
                // Die Namen tragen den Erzeuger (die Band-Linse zählt je Name): Albedo und Normale getrennt.
                at.map = new T.CompressedArrayTexture(a, M.w, M.h, cap, T.RGBA_S3TC_DXT1_Format);
                at.map.name = "karte-albedo:atlas";
                at.map.colorSpace = T.SRGBColorSpace;
                at.nmap = new T.CompressedArrayTexture(n, M.nw, M.nh, cap, T.RED_GREEN_RGTC2_Format);
                at.nmap.name = "karte-normal:atlas";
                for (const t of [at.map, at.nmap]) t.generateMipmaps = false;
            }
        } else {
            const dA = new Uint8Array(M.w * M.h * 4 * cap),
                dN = new Uint8Array(M.nw * M.nh * 2 * cap);
            if (da) {
                dA.set(at.map.image.data);
                dN.set(at.nmap.image.data);
                at.map.image = { data: dA, width: M.w, height: M.h, depth: cap };
                at.nmap.image = { data: dN, width: M.nw, height: M.nh, depth: cap };
            } else {
                at.map = new T.DataArrayTexture(dA, M.w, M.h, cap);
                at.map.name = "karte-albedo:atlas";
                at.map.colorSpace = T.SRGBColorSpace;
                at.nmap = new T.DataArrayTexture(dN, M.nw, M.nh, cap);
                at.nmap.name = "karte-normal:atlas";
                at.nmap.format = T.RGFormat;
                for (const t of [at.map, at.nmap]) t.generateMipmaps = true;
            }
        }
        for (const t of [at.map, at.nmap]) {
            t.minFilter = T.LinearMipmapLinearFilter;
            t.magFilter = T.LinearFilter;
            t.wrapS = T.ClampToEdgeWrapping;
            t.wrapT = T.ClampToEdgeWrapping;
            t.anisotropy = 4;
            if (da) t.needsUpdate = true; // gewachsen: die neue Form mit den kopierten Schichten hochladen
        }
        at.cap = cap;
        return at;
    }

    // Eine Schicht schreiben (die Stufen hintereinander, `karteMasse`): BC lädt das ganze Array neu (r184 kennt für
    // komprimierte Arrays kein layerUpdates — 0,25 MiB je Schicht), rgba8 nur die Schicht.
    _impostorAtlasSchreibe(at, idx, payload) {
        const M = at.masse;
        if (at.fmt === "bc") {
            for (let k = 0; k < M.a.length; k++)
                at.map.mipmaps[k].data.set(
                    payload.albedo.subarray(M.a[k].off, M.a[k].off + M.a[k].bytes),
                    idx * M.a[k].bytes
                );
            for (let k = 0; k < M.n.length; k++)
                at.nmap.mipmaps[k].data.set(
                    payload.normal.subarray(M.n[k].off, M.n[k].off + M.n[k].bytes),
                    idx * M.n[k].bytes
                );
        } else {
            at.map.image.data.set(payload.albedo, idx * M.aBytes);
            at.nmap.image.data.set(payload.normal, idx * M.nBytes);
            at.map.addLayerUpdate(idx);
            at.nmap.addLayerUpdate(idx);
        }
        at.map.needsUpdate = true;
        at.nmap.needsUpdate = true;
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
            versuche: 0,
            vonPlatte: false,
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
        const laubMat = this.state.materials && this.state.materials.laub;
        const matOpts = {
            vertexColors: true,
            useInstanceTint: true, // konstante Kronenfarbe je Baum über die LODs
            pflanzenStoff: true, // Vertex-Albedo im colorNode, echte Normale, keine Geologie; Wind: `windAusschlag` über uv.y
            impostorAtlas: true,
            side: THREE.DoubleSide,
        };
        if (laubMat && laubMat.tags) matOpts.tags = laubMat.tags;
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

    // KARTEN-ZENSUS: Zellen · gebacken · gescheitert · wartend · von der Platte · Atlas-Bytes. Reist im
    // Flugschreiber-Trace (anazhRealmPerf.json) und in der Fluss-Linse; devtools: anazhRealm._impostorCensus().
    _impostorCensus() {
        const at = this._kartenAtlas;
        if (!at || at.zellen.size === 0) return null;
        let gebacken = 0,
            gescheitert = 0,
            wartend = 0,
            vonPlatte = 0;
        const gescheitertArten = [];
        for (const z of at.zellen.values()) {
            if (z.gebacken) {
                gebacken++;
                if (z.vonPlatte) vonPlatte++;
            } else if (z.gescheitert) {
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
            vonPlatte,
            fmt: at.fmt,
            schichten: at.cap,
            mb: M ? +(((M.aBytes + M.nBytes) * at.cap) / 1048576).toFixed(2) : 0,
            haengendeBakes: at.haengend,
            verworfeneBakes: at.verworfen,
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
        // Die FORMEL lebt EINMAL in phyto-core (__phytoCore.impostorFrame, auch vom Studio-Bäcker gelesen);
        // hier nur das Skelett-Lesen. Ohne Kern → null (kein Impostor), BEWUSST keine Formel-Kopie
        // (Drift-Quelle; gate:constitution wacht).
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.impostorFrame === "function") return core.impostorFrame(totalH, maxR);
        return null;
    }

    // V18.390 (Eins W3) → BÄCKER-VEREINIGUNG — der budgetierte Bake-Tick (JE BÄCKER-BAHN EIN Bake im Flug, K60-2; der Bäcker
    // ist das STUDIO in seinen eigenen Fäden, `_foundryBaecker`, Kanal "bake-impostor"). Der Flug ist EINE Karte je Schlüssel
    // (`_impostorBakeFlug`: Schlüssel → { seit, tok }); jeder Tick füllt ihn bis zur Zahl der Bäcker-Fäden
    // (`_foundryFaedenZahl`), die nächste Karte zuerst. Bis K60-2 flog EINE Karte: Radeon kalt 17 Karten in 11 s nacheinander.
    // Headless/Null-Renderer/vor rendererReady → No-op (dort bäckt nie jemand).
    _tickImpostorBake() {
        if (!this._impostorBakeQueue || this._impostorBakeQueue.length === 0) return 0;
        const at = this._impostorAtlas();
        if (!at) return 0;
        const flug = this._impostorBakeFlug || (this._impostorBakeFlug = new Map());
        // Die Karte wartet NICHT auf die Bühne: der Bäcker ist das Studio im Foundry-Worker (die Platte liefert gebackene
        // Karten sofort), kein RTT auf der Boden-GPU — und mit echtem Renderer trägt bis zur Karte nichts (die Zelle zeichnet
        // erst gebacken, `_foundryBuildImpostorFlat`; seit 05.10. hat ein Karten-Ding keinen Satz). Bis 04.10. war das ein Kreis: die
        // Bühne wartete auf die Streu-Regionen, die Regionen auf ihre Karten, die Karten auf die Bühne — gelöst erst vom
        // 90-s-Deckel; beim Boot an der Mess-Wiese standen so 141 Kapsel-Sätze < 64 m.
        // BAKE-WATCHDOG: ein hängender async Bake klemmte seinen Flug-Platz → die Queue verhungerte still. Nach
        // der Bake-Uhr (+2 s) bekommt die Zelle einen neuen Versuch (3, dann gescheitert), das Token entwertet die
        // späte finally (sie darf den NÄCHSTEN Bake nicht löschen); ein später Erfolg darf die Schicht noch schreiben.
        // Ein Bake-Auftrag, der beim Worker noch offen ist oder in der Schlange wartet, wartet LEGITIM (die EINE
        // Foundry-Frist zählt nur Arbeits-Zeit und schließt jedes Versprechen sicher ab) — der Wachhund greift erst, wenn
        // kein Karten-Auftrag mehr offen ist und ein Flug trotzdem klemmt. Vorher verwarf er wartende Karten nach der Uhr
        // ab Senden (01.10.: strauch|16, weide|13, tanne|16 terminal ohne Fernstufe).
        if (flug.size) {
            const fb = this._foundry;
            let offen = !!(fb && fb.warte && fb.warte.some((a) => a.praefix === "imp"));
            if (!offen && fb && fb.pending) for (const k of fb.pending.keys()) if (k.startsWith("imp")) offen = true;
            if (!offen) {
                const jetzt = performance.now();
                for (const [hungKey, fl] of [...flug]) {
                    if (jetzt - fl.seit <= AnazhRealm.IMPOSTOR_BAKE_TIMEOUT_MS + 2000) continue;
                    const hung = at.zellen.get(hungKey);
                    // V18.464 (baum-D7-Heilung): bounded Retry (3 Versuche), erst dann gescheitert.
                    if (hung) {
                        hung.versuche++;
                        if (hung.versuche < 3) this._impostorBakeQueue.push(hungKey);
                        else this._karteEndet(hung, false);
                    }
                    this._impostorBakeTok = (this._impostorBakeTok || 0) + 1;
                    flug.delete(hungKey);
                    at.haengend++;
                    this.log(
                        `Impostor-Bake-Watchdog: hängender Bake (${hungKey}) verworfen — die Queue lebt weiter.`,
                        "WARN"
                    );
                }
            }
        }
        let gesendet = 0;
        while (this._impostorBakeQueue.length && flug.size < this._foundryFaedenZahl()) {
            const n = this._impostorBakeSende(at, flug);
            if (n < 0) break;
            gesendet += n;
        }
        return gesendet;
    }

    // Sendet die nächste Karte der Schlange in den Flug: 1 gesendet, 0 verworfen (die Schlange lebt), −1 die Bäcker können
    // noch nicht (kein Renderer, kein Studio, kein Format — sie wartet).
    _impostorBakeSende(at, flug) {
        const st = this.state;
        // Der Impostor bäckt EAGER, ohne `_frameOverBudget`-Gate: er ERSETZT schwere L2-Geometrie durch die
        // billige Karte (netto last-senkend) — ein Budget-Gate wäre Henne-Ei. Gedeckelt: je Bäcker-Bahn EIN Bake im Flug.
        const rend = st.renderer;
        if (!rend || rend._isHeadlessNull || !st.rendererReady) return -1;
        // Ohne Foundry-Welt kein Bäcker → die Zelle fällt TERMINAL (Zensus „gescheitert", der Flatten serviert
        // Geometrie).
        if (!this._foundryEnabled()) {
            const z0 = at.zellen.get(this._impostorBakeQueue.shift());
            if (z0 && !z0.gebacken) this._karteEndet(z0, false);
            return 0;
        }
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !f.worker) return -1; // das Studio bootet noch — die Zellen warten in der Queue
        // Das Schicht-Format steht mit den Texturen (das Buch trägt die Zell-Maße) — vorher wartet die Queue.
        if (!this._impostorAtlasTexturen(at)) return -1;
        // NAH ZUERST (Lehre 16): die Karte, die der nächste wartende Baum braucht (z._bedarfD2, gestempelt in
        // _foundryBuildImpostorFlat), statt Anfrage-Reihenfolge — Befund 30.09.: 105 von 112 Karten warteten
        // FIFO, der Baum vor der Kamera hinter fernen Arten. Ohne Bedarf-Stempel (Streu) gilt die Reihenfolge.
        const q = this._impostorBakeQueue;
        let qi = 0;
        for (let i = 1; i < q.length; i++) {
            const zi = at.zellen.get(q[i]);
            const zb = at.zellen.get(q[qi]);
            if ((zi ? zi._bedarfD2 : Infinity) < (zb ? zb._bedarfD2 : Infinity)) qi = i;
        }
        const key = q.splice(qi, 1)[0];
        const z = at.zellen.get(key);
        if (!z || z.gebacken || z.gescheitert) {
            at.verworfen++; // ein Queue-Key ohne frische Zelle ist legitim, aber nie unsichtbar
            return 0;
        }
        // Der Studio-Bäcker dispatcht GENERISCH über die Manifest-Kerne (__replyBakeImpostor) — Pflanzen UND
        // Tore (gate:baecker-kanal). Der KIND-WÄCHTER bleibt Positivliste der Bake-Kinds (impostor-Policy-
        // Zeilen); Unbekanntes fällt studio-seitig fail-closed (payload null) → gescheitert nach 3 Versuchen.
        const bKind = f.recipes && f.recipes[z.preset] && f.recipes[z.preset].kind;
        if (bKind && !/^(tree|shrub|flower|grass|rock|gate|vehicle)$/.test(bKind)) {
            this._karteEndet(z, false);
            return 0;
        }
        const _tok = (this._impostorBakeTok = (this._impostorBakeTok || 0) + 1);
        flug.set(key, { seit: performance.now(), tok: _tok });
        // Seed = die Gestalt der Zelle — dieselbe wie ihre Körper-Stufen. Keine Saison: die Karte ist Golden-Sommer,
        // das Jahr färbt der Karten-Stoff (uSeasonMul). BÄCKER-OV (V18.478): eine geprägte Zelle bäckt ihr UNIKAT. Der
        // Auftrag reist im Rang ihres nächsten Wartenden (z._bedarfD2) durch die EINE Worker-Schlange.
        this._foundryBakeImpostorRequest(z.preset, z.variant, z.ov || undefined, at.fmt, z._bedarfD2)
            .then((payload) => {
                if (!this._applyStudioImpostorPayload(z, payload))
                    throw new Error("Studio-Bäcker ohne brauchbare Schicht für " + key);
            })
            .catch((e) => {
                // V18.464 (baum-D7): bounded Retry — der Flatten serviert Geometrie, die Art heilt beim nächsten Versuch.
                z.versuche++;
                if (z.versuche < 3 && this._impostorBakeQueue) this._impostorBakeQueue.push(key);
                else {
                    this._karteEndet(z, false);
                    this._stoffBruch(`die Karte ${key} scheiterte ${z.versuche}× — die Fernstufe bleibt Geometrie`, e);
                }
            })
            .finally(() => {
                // die späte finally eines vom Watchdog verworfenen Bakes darf den NÄCHSTEN Flug nicht löschen
                const fl = flug.get(key);
                if (fl && fl.tok === _tok) flug.delete(key);
            });
        return 1;
    }

    // DIE SCHICHT (Transport-Schale, Karten-Codec): { cw, ch, V, nt, fmt, frame:{halfH, halfW}, albedo, normal, opak,
    // deckung, vonPlatte } — Maße und Format gegen den Atlas (beide lesen PORTAL_RENDER_CONFIG.impostor und das
    // Karten-Gesetz), die NICHT-LEERE-WAND (ein Bäcker-Fehler liefert maßtreue Clear-Pixel: die Karte muss
    // ≥ KARTEN_GESETZ.minOpak opake Texel tragen, sonst verschwände das ferne Objekt — dieselbe Wand steht in der Schale
    // vor der Platte), dann die Schicht schreiben. false → die Retry-Disziplin.
    _applyStudioImpostorPayload(z, payload) {
        const at = this._impostorAtlas();
        if (!z || !payload || !at || !this._impostorAtlasTexturen(at, z.idx + 1)) return false;
        const M = at.masse;
        if (
            payload.fmt !== at.fmt ||
            payload.cw !== at.cw ||
            payload.ch !== at.ch ||
            payload.V !== at.V ||
            payload.nt !== at.nt ||
            !payload.albedo ||
            payload.albedo.length !== M.aBytes ||
            !payload.normal ||
            payload.normal.length !== M.nBytes
        )
            return false;
        if (!(payload.opak >= globalThis.__phytoCore.KARTEN_GESETZ.minOpak)) return false;
        const fr = payload.frame;
        if (!fr || !(Number.isFinite(fr.halfH) && fr.halfH > 0 && Number.isFinite(fr.halfW) && fr.halfW > 0))
            return false;
        this._impostorAtlasSchreibe(at, z.idx, payload);
        // RAHMEN-EINHEIT: das Quad nimmt DENSELBEN Rahmen wie die Bake-Kamera (halfH = 1,02·maxY/2, halfW radial) —
        // keine Wurzel-Höhe mehr (bis V18.528 stand das Quad auf max(0,5, maxY − minY): vertikal verzerrt).
        if (!z.rahmenFest) z.frame = { halfH: fr.halfH, halfW: fr.halfW };
        z.vonPlatte = payload.vonPlatte === true;
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
        const uB = this._stoffWert(T, "userData.windArt", "vec3");
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
    static _instanzZeichner(m) {
        const Z = AnazhRealm._instanzZeichnerKlasse();
        const z = new Z(m);
        m.isLOD = true;
        m.add(z);
        m.__zeichner = z;
        m.traverse = function (cb) {
            cb(this);
            for (const c of this.children) if (c !== z) c.traverse(cb);
        };
        m.traverseVisible = function (cb) {
            if (this.visible === false) return;
            cb(this);
            for (const c of this.children) if (c !== z) c.traverseVisible(cb);
        };
        return z;
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
                f.instanceCount = s.count;
                return f;
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
        // die Observer-Diät) die Änderung und lädt es hoch — ohne sie fände sein Draw keinen Puffer.
        attr.needsUpdate = true;
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
    // Ein 16-bit-Index, der danach teilweise neu schreibt, bräche an der 4-Byte-Ausrichtung von writeBuffer — die Sätze
    // (die einzigen Index-Schreiber) tragen Uint32 (gate:vendor-anker pinnt beide Vendor-Stellen).
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
            return nachschreiben.call(this, attr);
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
        mesh.count = n;
        mesh.visible = n > 0;
        // der Zeichner zählt mit (1410-1): seine Fassade zeichnet so viele Instanzen, wie die Senke JETZT zählt — r184 liest die
        // Zahl zur Zeichen-Zeit, und der verschachtelte Schatten-Render stellt sie mitten im Hauptbild um und zurück, ohne neu
        // zu projizieren (die Zahl der Projektion war dann die der Kaskade: Instanzen fehlten oder standen doppelt im Bild)
        if (mesh.__zeichner) mesh.__zeichner.__fassade.instanceCount = n;
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
    _foundryLodForEntry(entry) {
        const p = this._lodAuge(); // vom Auge der Maske (K36), wie der LOD-Tick
        if (!p || !entry || !entry.position) return 1;
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
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_instanz]);

// ===== ATLAS · Stoff/instanz — Außen-Konstanten =====
// W4.3 — die EINE Bake-Uhr: die Anfrage-Frist des Studio-Bakes (Worker-Reply); danach null → Retry, dann gescheitert
// (der Flatten serviert Geometrie). Der Tick-Watchdog greift 2 s später (ein Versprechen, das nie abschließt). Befund
// 30.09.: eine zweite, engere Uhr (15 s) gab Bakes auf, während der SERIELLE Worker noch rechnete, und schob den
// nächsten nach — auf langsamem Holz eine Kaskade (7 hängend, 3 gescheitert, 0 gebacken; die schweren nahen Arten zuerst).
AnazhRealm.IMPOSTOR_BAKE_TIMEOUT_MS = 45000;
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
