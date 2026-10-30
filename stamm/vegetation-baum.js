class AnazhRealm_vegetation_baum {
    // ===== ATLAS · Vegetation/baum — Baum-Geometrie · Laub-Atlas · Wald-Pflanzung · Fels-Varianten · Natur-Plätze =====
    // DER STOFF DES WALDS off-thread (K60-3): die Wald-Zellen (cx, cz je Zelle, Int32Array) → die gepackten Darts aus dem
    // EINEN Wald-Plan (phyto-core `planForestCell`) mit den Lesern des Fadens. Er rechnet im WALD-FADEN: einem eigenen Faden
    // desselben Gesetzes (`voxel-worker.js`, dieselbe Quelle wie der Voxel-Faden) — im Voxel-Faden stand der Auftrag hinter
    // jedem Chunk und jeder Höhe der Ferne (Radeon kalt: die Darts kamen 3,5 s nach der Bestellung, das Bild 2 s später als
    // ohne, K603/s2-6C). Den Zustand bringt der EINE Sender (`_voxelZustandPost`): bei der Geburt ein voller Stand, danach
    // dieselben Nachrichten wie der Voxel-Faden (Worldgen, Hydro-Kachel, Erdbau, Edits) — Nachrichten laufen in Reihe, der
    // Auftrag rechnet mindestens am Zustand, der vor ihm reiste. Der Faden rechnet nah zuerst nach `rang` (Abstand² der nächsten
    // Zelle beim Senden, ohne Rang zuerst). Leser: die Schlange des Walds (`_waldFadenSchicken`).
    _voxelWorkerWaldDarts(zellen, seedInt, extras, rang) {
        return this._nebenAuftrag("wald", { type: "wald-darts", zellen, seedInt, extras, rang }, [zellen.buffer]).then(
            (msg) => ({
                anzahl: new Int32Array(msg.anzahl),
                werte: new Float64Array(msg.werte),
                arten: msg.arten,
            })
        );
    }

    // Trägt die Wildnis den Ort? Das EINE Prädikat an den WÜRFEN des Feldes (Wald, Streu, Nah-Streu, Geburts-Ort, Dorf-
    // Ort, Schwebe-Inseln und jeder Ort, den der Nexus wählt — `dslEvalPos`): wo der Wildnis-Term nicht wiegt, wirft das
    // Feld nichts — Akte (Mensch, KI, Saat, Linse) setzen überall. Liest das Gewicht des Erbguts (heute je Welt: 1 oder
    // 0, der Ort ist die Naht künftiger Masken).
    _wildnisTraegt(_x, _z) {
        return (this._erbgutCache || this._erbgut()).wildnis > 0;
    }

    // Varianten-Pool: Map<species, string[]> mit VARIANTS_PER_SPECIES Seeds je Spezies — PURE STRINGS
    // (frozen, reisen im Snapshot, P2P string-gleich, kein Float-Drift). Fehlt worldMeta.variantSeed,
    // lazy deterministisch aus dem Welt-Seed; danach Cache.
    // Der Wuchs (_growTreeBlueprint) liest die Art aus dem Gesetzbuch (_phytoArt); tag-neutral über
    // materialKonsistenz (Stamm holz, Krone laub); Stream `-veg-grammatik` (re-rollt keinen anderen).
    _variantSeedsFor(species) {
        const wm = this.state.worldMeta;
        if (!wm) return null;
        if (!wm.variantSeed || typeof wm.variantSeed !== "object") wm.variantSeed = {};
        const pool = wm.variantSeed;
        // Eine bestehende Zeile bleibt UNANGETASTET (bit-identischer Wuchs); eine neue entsteht nur für eine Art mit
        // Rezept-Zeile im Gesetzbuch (_phytoArt) — dasselbe Saat-Schema, darum P2P string-gleich.
        if (Array.isArray(pool[species]) && pool[species].length === AnazhRealm.VARIANTS_PER_SPECIES)
            return pool[species];
        if (!this._phytoArt(species)) return null;
        return (pool[species] = AnazhRealm._variantenSaat(wm, species));
    }

    // DIE VARIANTEN-SAAT EINER ART — eine Funktion der Welt-Saat: VARIANTS_PER_SPECIES Saaten `<Welt-Saat>-<Art>-var<i>`. Leser:
    // der Pool (`_variantSeedsFor`) und der Stand, der eine Zeile, die ihr gleicht, nie trägt (speicher.K3: Abgeleitetes reist nie).
    static _variantenSaat(wm, species) {
        const worldSeed = wm.seed || "anazh-realm-seed";
        return Array.from({ length: AnazhRealm.VARIANTS_PER_SPECIES }, (_, i) => `${worldSeed}-${species}-var${i}`);
    }

    // EINE bark-BufferGeometry aus dem Skeleton (Polylinien): Ring von 6 Vertices je Punkt, zu Quads
    // verbunden, Radius = radii[i]; lobed flare am Stamm-Fuß. Alle Äste zu EINER Geometrie gemerged.
    _buildTreeTubeGeometry(skeleton, opts) {
        if (!skeleton || !Array.isArray(skeleton.branches) || skeleton.branches.length === 0) return null;
        AnazhRealm._skelettPflicht(skeleton);
        const radialSegs = (opts && opts.radialSegs) || 6;
        const totalH = Math.max(1, skeleton.totalH);
        // DAS NEUE KLEID K1 (V18.385) — die RINDEN-FARBE aus dem Gesetz der Art (P.barkA/barkB): barkA (Fuß-
        // dunkel) → barkB (Wipfel-hell), ein Höhen-Gradient wie in der Vorlage (buildTube
        // barkBase→barkTip). Die Birke trägt so ihre weiße Rinde, der Mammut sein Rot-Braun.
        const _bA = skeleton.barkA;
        const _bB = skeleton.barkB;
        const bAr = ((_bA >> 16) & 0xff) / 255,
            bAg = ((_bA >> 8) & 0xff) / 255,
            bAb = (_bA & 0xff) / 255;
        const bBr = ((_bB >> 16) & 0xff) / 255,
            bBg = ((_bB >> 8) & 0xff) / 255,
            bBb = (_bB & 0xff) / 255;
        // Die Ring-Tube-Mathematik lebt in `phyto-core.js` (`globalThis.__phytoCore.buildBarkTubeArrays`) —
        // Main + Worker + Portal lesen EINE Formel. Plain-Arrays je Branch, hier in BufferGeometry gewickelt
        // (Vertrag EXAKT: position/normal/color + index; der Wind liest die Gestalt, `_baumWindStoff`) + gemerged.
        // Ohne Kern kein stiller Inline-Zwilling: lauter Bruch (KERN-PFLICHT).
        const _core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (!_core || typeof _core.buildBarkTubeArrays !== "function")
            throw new Error("KERN-PFLICHT: phyto-core buildBarkTubeArrays fehlt (die Rinde des Werkstatt-Baums)");
        const snippets = _core.buildBarkTubeArrays(skeleton.branches, {
            radialSegs,
            totalH,
            barkColorA: [bAr, bAg, bAb],
            barkColorB: [bBr, bBg, bBb],
            flareAmp: skeleton.flareAmp,
            flareLobes: skeleton.flareLobes,
        });
        const geomList = [];
        for (const s of snippets) {
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.BufferAttribute(s.positions, 3));
            g.setAttribute("normal", new THREE.BufferAttribute(s.normals, 3));
            g.setAttribute("color", new THREE.BufferAttribute(s.colors, 3));
            g.setIndex(new THREE.BufferAttribute(s.indices, 1));
            geomList.push(g);
        }
        return geomList.length ? this._mergeGeometries(geomList) : null;
    }

    // Der Blatt-Atlas kommt aus phyto-core — kein Parallel-Painter: das Atlas-BILD (`bakeLeafAtlasBild`, W5) ist
    // die gemalte Leinwand, geblutet, mit gleichen Zell-Mitteln und deckungstreuen Mips (die Box-Mips der Leinwand
    // mischten Schwarz in jeden Rand und mittelten die Nadelstriche unter die Alpha-Schwelle). Er trägt nur den
    // WERT um sein Mittel `wert` (userData.wert) — jeder Leser teilt durch ihn, die Artfarbe kommt aus der
    // Vertex-Farbe (FARB-GESETZ); EINE Textur, die Card-UVs (`__phytoCore.buildFoliageQuads`) routen die Zelle.
    // Die FRACHT (`blattAtlasFracht`, 05.10.) ist das Format des Wirts: mit dem WebGPU-Feature texture-compression-bc
    // die Kette ab Stufe 0 (512er-Zelle) als BC1-sRGB, ohne es rgba8 ab Stufe 1 (256er-Zelle) — dasselbe Bild, die
    // Stufe des Formats (wie der Karten-Atlas, `_impostorAtlasFormat`). Die Fracht malt und kodiert der Foundry-Worker
    // und reicht sie mit dem Buch (`_blattAtlasBild`, Transfer); nur wer vor dem Buch fragt (der Grammatik-Pfad), malt
    // und kodiert sie mit denselben Kern-Funktionen selbst. Headless (kein document) zeichnet kein Stoff → null; fehlt
    // der Kern, bricht es laut (KERN-PFLICHT) — kein Stoff ohne seinen Atlas.
    _ensureFoliageClusterAtlas() {
        if (this._foliageAtlasTex) return this._foliageAtlasTex;
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        const bc = this._impostorAtlasFormat() === "bc";
        const t0 = performance.now();
        let fracht = this._blattAtlasBild || null;
        if (!fracht) {
            const core = globalThis.__phytoCore;
            if (!core || !core.bakeLeafAtlasBild || !core.blattAtlasFracht)
                throw new Error("KERN-PFLICHT: phyto-core bakeLeafAtlasBild/blattAtlasFracht fehlt");
            fracht = core.blattAtlasFracht(core.bakeLeafAtlasBild(document), bc);
        }
        const haupt = !this._blattAtlasBild; // ohne Fracht malte der Haupt-Faden selbst (die Liefer-Marke)
        if (!fracht || !fracht.rgba) throw new Error("KERN-PFLICHT: der Blatt-Atlas lieferte kein Bild");
        let tex;
        if (bc && fracht.bc && fracht.bc.mips.length) {
            // BC3 (K20): die glatte Alpha der Mip-Kette (phyto-core `impostorMips` glatt) — BC1 trug ein Bit.
            if (fracht.bc.format !== "bc3")
                throw new Error("KERN-PFLICHT: die Blatt-Fracht ist nicht BC3 (" + fracht.bc.format + ")");
            tex = new THREE.CompressedTexture(
                fracht.bc.mips,
                fracht.bc.breite,
                fracht.bc.hoehe,
                THREE.RGBA_S3TC_DXT5_Format
            );
        } else {
            tex = new THREE.DataTexture(
                fracht.rgba.mips[0].data,
                fracht.rgba.breite,
                fracht.rgba.hoehe,
                THREE.RGBAFormat
            );
            tex.mipmaps = fracht.rgba.mips;
        }
        tex.name = "laub-cluster-atlas";
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = false;
        tex.userData.wert = fracht.wert;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        try {
            tex.anisotropy = 4;
        } catch (_e) {
            /* anisotropy optional */
        }
        tex.needsUpdate = true;
        this._foliageAtlasTex = tex;
        this._blattAtlasBild = null; // die Fracht des anderen Formats hat keinen Leser mehr
        this._foundryLiefer(this._foundry, haupt ? "haupt" : null, "blatt-atlas", null, performance.now() - t0);
        return tex;
    }

    // DER EINE LESER DES BLATT-ATLAS (05.10.): die Fracht ist in jedem Format VORMULTIPLIZIERT (phyto-core
    // `blattAtlasFracht`, das Karten-Gesetz — BC1 kann es nicht anders, sein Index 3 ist transparent schwarz). Das
    // gefilterte rgb geteilt durch alpha ist das alpha-gewichtete Mittel der deckenden Texel (kein dunkler Saum auf keiner
    // Mip-Stufe), geteilt durch den Wert `wert` (FARB-GESETZ: die Artfarbe kommt aus der Vertex-Farbe). Befund (Prüfer W5):
    // die zwei Leser lasen die BC1-Kette ohne Teilen — Welt-Laub 4–22 % dunkler als Labor und L2-Karte, die dünnen
    // Nadeln als dunkle Fussel. Leser: der Laub-Stoff (`_foundryMaterial`, foliageTex) und der Grammatik-Pfad
    // (`_buildPbrNodeMaterial`, foliageLeaf); `gate:pflanzen-nah` (F) misst die Fracht je Format und Stufe gegen das
    // Labor. Headless (kein Atlas) → null.
    // DIE FARBE LIEST IHRE STUFE `BLATT_FARBE_OKTAVE` ÜBER DER DECKUNG (K20, 13.10.): die Alpha (die Blattform, der alphaTest)
    // liest die Stufe des Schirms, die Farbe (rgb ÷ alpha) dieselbe Textur zwei Oktaven gröber — kein Farb-Detail unter vier
    // Pixeln, die Silhouette bleibt scharf und die Deckung je Stufe treu (die Alpha-Stufe ist unberührt). Befund Radeon,
    // Ausgabe-Pfad, Eiche 25 m nur L1: Δ-Luma beim ½-Pixel-Versatz 3,41, davon 2,49 im Kronen-Inneren — das Detail der Atlas-
    // Farbe unter zwei Pixeln (flache Farbe 2,04); Oktave 1 → 2,94, Oktave 2 → 2,62 (K20n10/g2). Linse: gate:pflanzen-nah (Z2).
    // DIE DECKUNG (A3): `a` liest die Stufe des Schirms am Versatz des Laubs (`_laubVersatz`), der Stoff schneidet sie an
    // seiner Zahl alphaTest — Bild und Schatten an derselben Schwelle.
    _blattAtlasProbe(T) {
        const tex = this._ensureFoliageClusterAtlas();
        if (!tex) return null;
        const uv = T.attribute("uv", "vec2");
        const s = T.texture(tex, uv).bias(T.float(AnazhRealm.BLATT_FARBE_OKTAVE));
        const deckung = T.texture(tex, this._laubVersatz(T, uv, T.dFdx(uv), T.dFdy(uv)));
        const w = tex.userData.wert;
        return {
            tex,
            rgb: s.rgb.div(s.a.max(T.float(1e-3))).mul(T.vec3(1 / w[0], 1 / w[1], 1 / w[2])),
            a: deckung.a,
        };
    }

    // DER VERSATZ DES LAUBS (A3): jede Laub- und Nadel-Karte jeder Stufe — der Blatt-Atlas (Studio- und Grammatik-Laub,
    // `_blattAtlasProbe`) und der Karten-Atlas (die Karte L2, `_probeA`) — liest ihre Deckung je Frame um einen Versatz in
    // Eingangs-Pixeln verschoben (`uLaubVersatz`: Halton 5 und 7 am Frame der Geschichte, `_zeitAufloesung`) und schneidet sie
    // an der Zahl alphaTest. Über die Geschichte der zeitlichen Auflösung ist der Schnitt die Deckung eines Fußabdrucks von
    // drei Pixeln (±1 Versatz ⊗ ±½ Zitter): die Teil-Deckung der Nadel-Büschel steht als Mischton, eine Lücke ab drei Pixeln
    // bleibt offen. DER TÄTER (Radeon --echt, Tafel-Pose, je drei bis vier Posen in EINER Welt): die deckungstreue Mip-Kette
    // (phyto-core `impostorMips` glatt, Castaño) bündelt die Teil-Deckung in ganze Texel der Stufe des Schirms — ein Bit-Muster,
    // das die Kante von einem Pixel (K68 `_laubKante`) und die Schwelle je Zelle (A3 `_laubSchwelle`) nur nachschnitten
    // (zweiton 49–224 px; die Varianz-Klemme der Auflösung dämpfte es — ohne sie 251–724 px); die um ½ gröbere Stufe schloss
    // es, schloss aber jede Lücke unter zwei Pixeln (laub-kante 0,212 → 0,222). Ohne zeitliche Auflösung (Holz kienspan) und in
    // der Kaskade (orthographisch, m[3][3] = 1) ist der Versatz 0: der Schatten schneidet still an derselben Schwelle.
    // JE PIXEL EINE EIGENE PHASE (A3b): die Folge des Frames (`uLaubVersatz.xy`) dreht sich je Pixel um das IGN des
    // transponierten Gitters (die Stufen-Blende liest das gerade, `_dh`) — je Pixel bleibt sie gleichmäßig, Nachbarn teilen
    // ihren Restfehler nicht mehr. Bis A3b sah jedes Pixel dieselben 31 Versätze: der Rest nach 32 Frames stand in jeder Phase
    // des Gitters der Auflösung (3 Eingangs- auf 4 Ausgabe-Pixel) gleich, ein Raster im Takt von 4 Pixeln (Radeon, Tafel-Pose,
    // Wanduhr: zweiton 0–127 px → 0 in 6 von 7 Schüssen). Eine wandernde Schwelle statt des Versatzes rasterte stärker
    // (682–2 249 px), eine feinere Stufe der Deckung ebenso (Weite ½: 175 → 490 px).
    _laubVersatz(T, uv, dx, dy) {
        const lu = this._ensureLodUniforms();
        if (!lu || !lu.uLaubVersatz) throw this._blendeBruch("der LOD-Uniform-Satz trägt keinen uLaubVersatz");
        const fc = T.screenCoordinate;
        const phase = T.fract(T.float(52.9829189).mul(T.fract(fc.y.mul(0.06711056).add(fc.x.mul(0.00583715)))));
        const lv = lu.uLaubVersatz;
        const o = T.fract(lv.xy.add(phase)).sub(0.5).mul(lv.z.mul(2));
        const v = T.cameraProjectionMatrix.element(3).w.lessThan(0.5).select(o, T.vec2(0, 0));
        return uv.add(dx.mul(v.x)).add(dy.mul(v.y));
    }

    // Stempelt die pro-Baum-konstanten Wahrnehmungs-Höhen (aH0/aH0L) auf eine Laub-Geometrie — EINE Quelle
    // für phyto-core-Quads + Anker-Fallback. aH0 = Skelett-Sichthöhe (SSE: große Bäume behalten Detail
    // länger); aH0L = Blatt-Sichthöhe, auf `leafVisCap` gekappt (Laub-Crossfade folgt der absoluten
    // Distanz). Pro Baum konstant → billig als gefüllte Float32-Attribute.
    _stampFoliageVisHeights(g, totalH) {
        if (!g || !g.attributes || !g.attributes.position || typeof THREE === "undefined") return g;
        const vc = g.attributes.position.count;
        if (!(vc > 0)) return g;
        const cfg = AnazhRealm.LOD_DISTANCES;
        const cap = cfg.leafVisCap;
        const h0 = Number.isFinite(totalH) && totalH > 0 ? totalH : 10;
        const h0l = Math.min(h0, cap);
        const aH0 = new Float32Array(vc);
        const aH0L = new Float32Array(vc);
        aH0.fill(h0);
        aH0L.fill(h0l);
        g.setAttribute("aH0", new THREE.BufferAttribute(aH0, 1));
        g.setAttribute("aH0L", new THREE.BufferAttribute(aH0L, 1));
        return g;
    }

    // DIE NORMALE DER KRONE AUF EINER LAUB-GEOMETRIE (K68-N1): das EINE Gesetz ist der Kern (phyto-core `kronenNormalen`, das
    // Kronen-Ellipsoid × die zur Außenseite gewendete Karte) — derselbe, den der Ofen der Welt über jede Studio-Krone legt
    // (foundry-core `emitTreeRezept`). Der Grammatik-Baum der Werkstatt (Klingen, Karten, Anker-Karten) liest ihn hier; die
    // Kuppel vom Kronen-Boden mit Up-Bias des Wirts (bis K68) war sein Zwilling und ist gefallen. Der Stoff liest die Normale
    // flip-frei (`_laubStoffNormale`).
    _kronenNormalenAuf(g) {
        if (!g || !g.attributes || !g.attributes.position || !g.attributes.normal) return g;
        globalThis.__phytoCore.kronenNormalen([{ pos: g.attributes.position.array, nor: g.attributes.normal.array }]);
        g.attributes.normal.needsUpdate = true;
        return g;
    }

    // DIE EINE BLATT-FARB-QUELLE für Phyto-Pfad UND Anker-Fallback (der Phyto-Pfad gewinnt). Das Farb-Gesetz
    // der Vegetation (foundry-core `vegFarbe`, V18.506): der Hex ist eine sRGB-Absicht, die Albedo sein
    // linearer Wert — `THREE.Color(hex)` dekodiert unter der Farb-Verwaltung von r184 genau so.
    _treeLeafBaseColor(skeleton) {
        const c = new THREE.Color(AnazhRealm._skelettPflicht(skeleton).foliageColor);
        return [c.r, c.g, c.b];
    }

    // NAHER BAUM (LOD0): 30-Vert-Superformel-Blatt-Klingen aus den Nicht-Nadel-Phyto-Blättern über
    // `__phytoCore.buildLeafBlades` (Attribute wie die Karten: position/normal/color/uv +
    // aH0/aH0L). Nadeln bleiben Spray-Quads (Einzel-Nadeln trügen beim 480er-Blatt-Budget die Deckung
    // nicht). null (kein Kern/Blätter/THREE) → der Aufrufer bleibt beim Karten-Pfad.
    _buildTreeFoliageBladeGeometry(skeleton) {
        if (skeleton) AnazhRealm._skelettPflicht(skeleton);
        if (!skeleton || !Array.isArray(skeleton.phytoLeaves) || !skeleton.phytoLeaves.length) return null;
        const fo = skeleton.laub;
        if (!fo || fo.kind === "none") return null;
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (!core || typeof core.buildLeafBlades !== "function" || typeof THREE === "undefined") return null;
        const blades = skeleton.phytoLeaves.filter((l) => l && !l.needle);
        if (!blades.length) return null;
        // Blatt-Form der Art aus dem Gesetz (die Superformel des Phänotyps, P.leafShape) — wie die Studio-Gestalt; die
        // Zuordnung nach dem Namen der Art (eiche→oak · weide→lance · sonst ovate) fiel K24-N1.
        const q = core.buildLeafBlades(blades, {
            leafColor: this._treeLeafBaseColor(skeleton),
            // Vorlagen-roh (pushLeaf bekommt l.scale unskaliert): AnazhRealms leafSize trägt
            // schon den ×1.3-Dial → die Klinge liest als Blatt-Büschel-Größe, kein Mega-Blatt.
            scale: 1.0,
            cup: 0.5, // die Quer-Mulde (Vorlagen-Aufruf Z.660)
            leafShape: skeleton.leafShape,
        });
        if (!q || !(q.count > 0)) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(q.positions, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(q.normals, 3));
        g.setAttribute("color", new THREE.BufferAttribute(q.colors, 3));
        g.setAttribute("uv", new THREE.BufferAttribute(q.uvs, 2));
        g.setIndex(new THREE.BufferAttribute(q.indices, 1));
        // DIE NORMALE DER KRONE auch für die Klingen (K68-N1, das EINE Kern-Gesetz)
        this._kronenNormalenAuf(g);
        // S1-SHADER — dieselben Wahrnehmungs-Höhen wie die Karten → das Dither-Crossfade
        // blendet die Klingen am L0→L1-Band weich aus (kein Pop auf die Karten-Krone).
        this._stampFoliageVisHeights(g, Math.max(1, skeleton.totalH));
        g.computeBoundingBox();
        g.computeBoundingSphere();
        return g;
    }

    _buildTreeFoliageCardGeometry(skeleton, _opts) {
        if (skeleton) AnazhRealm._skelettPflicht(skeleton);
        if (!skeleton || !Array.isArray(skeleton.anchors) || skeleton.anchors.length === 0) return null;
        const fo = skeleton.laub;
        if (!fo) return null;
        // Laub-Geometrie aus phyto-core (`buildFoliageQuads`): ein Quad je Blatt (Achse aus dir/up, Roll aus
        // phase, UV in die Atlas-Zelle); hier nur in BufferGeometry gewickelt + WebGPU-Material (liest
        // position/normal/color/uv). Kein phyto-Blatt (lod2, Alt-Skelett) → Anker-Pfad unten.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (
            core &&
            typeof core.buildFoliageQuads === "function" &&
            Array.isArray(skeleton.phytoLeaves) &&
            skeleton.phytoLeaves.length &&
            typeof THREE !== "undefined"
        ) {
            // skipBroadleaf (LOD0): die Klingen tragen das Laub, hier nur noch Nadel-Sprays. Trägt die Klinge die
            // GANZE Krone → null, KEIN Anker-Fallback (legte sonst eine zweite Karten-Krone darüber).
            const _skipB = _opts && _opts.skipBroadleaf === true;
            const _quadLeaves = _skipB ? skeleton.phytoLeaves.filter((l) => l && l.needle) : skeleton.phytoLeaves;
            if (_skipB && !_quadLeaves.length) return null;
            const leafColor = this._treeLeafBaseColor(skeleton);
            const q = core.buildFoliageQuads(_quadLeaves, {
                leafColor,
                scale: 2.35,
                // Nadeln: das gewachsene Blatt IST eine EINZELNE Nadel (scale ~0.15) — als
                // Spray-Quad braucht es einen grossen Faktor, damit die Zelle-3-Nadel-Silhouette
                // sichtbar wird + die Kegel-Krone füllt (sonst unsichtbare 7-cm-Punkte).
                needleScale: 5.5,
            });
            if (q && q.count > 0) {
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.BufferAttribute(q.positions, 3));
                g.setAttribute("normal", new THREE.BufferAttribute(q.normals, 3));
                g.setAttribute("color", new THREE.BufferAttribute(q.colors, 3));
                g.setAttribute("uv", new THREE.BufferAttribute(q.uvs, 2));
                g.setIndex(new THREE.BufferAttribute(q.indices, 1));
                // DIE NORMALE DER KRONE (K68-N1): die Karten lichten wie die Studio-Krone (bis K68-N1 flach)
                this._kronenNormalenAuf(g);
                // S1-SHADER — die Wahrnehmungs-Höhen (aH0/aH0L) für die SSE-LOD-Crossfade-Metrik.
                this._stampFoliageVisHeights(g, Math.max(1, skeleton.totalH));
                g.computeBoundingBox();
                g.computeBoundingSphere();
                return g;
            }
        }
        // KIND-Spalte im 4×2-Atlas + Karten-Proportion je Kind: Breitblatt(0) breit, Nadel(1) lang-schmal,
        // Palme(2) lange Wedel, Schuppe(3) feine Sprays. EINE Textur, die Spalte routet die UVs.
        const kindCol = fo.kind === "needleSpray" ? 1 : fo.kind === "palm" ? 2 : fo.kind === "scale" ? 3 : 0;
        const baseSize = fo.size;
        // Karten-Größe: proportionierte Büschel (1.5–2 m am ~10-m-Baum), die Fülle trägt FOLIAGE_DENSITY;
        // Nadel-Sprays drapen größer.
        // V18.235 (§5 Ω-O9) — fd/lod/K hier gehoistet (vor cardW/cardH), damit der LOD-Karten-
        // Boost die Karten-Größe trifft. cardsPerAnchor dünnt LOD1/2 aus (5→2→1), das trägt die FPS.
        const fd = (this.state.atmosphere && this.state.atmosphere.foliageDensity) || AnazhRealm.FOLIAGE_DENSITY;
        const lod = skeleton.lodLevel | 0;
        const K = Math.max(1, (fd.cardsPerAnchor[lod] != null ? fd.cardsPerAnchor[lod] : fd.cardsPerAnchor[0]) | 0);
        // Ferne-LOD: die Karten dünnen (5→2→1), die Karten-FLÄCHE ∝ 1/K hält die Kronen-Deckung konstant:
        // sizeBoost = sqrt(K0/K) (LOD1 ×1.58, LOD2 ×2.24). Klein im Screen liest die große Karte als volle
        // Krone. K0 = LOD0-Referenz.
        const _K0 = Math.max(1, fd.cardsPerAnchor[0] | 0 || 1);
        const _lodCardBoost = Math.sqrt(_K0 / K);
        // je-Kind-Aspekt: Nadel lang-schmal, Palme große breite Wedel, Schuppe feine Sprays.
        const _wByKind = kindCol === 1 ? 2.4 : kindCol === 2 ? 3.0 : kindCol === 3 ? 1.7 : 2.1;
        const _hByKind = kindCol === 1 ? 3.4 : kindCol === 2 ? 3.4 : kindCol === 3 ? 1.7 : 1.85;
        const cardW = baseSize * _wByKind * _lodCardBoost;
        const cardH = baseSize * _hByKind * _lodCardBoost;
        const totalH = Math.max(1, skeleton.totalH);
        // Kronen-Zentrum (Mitte der Anchor-Wolke, leicht angehoben) — NUR für Positionen (innerFill-Pull +
        // Spitzen-Curl); die Shading-Normale stempelt die Normale der Krone (`_kronenNormalenAuf`).
        let cx = 0,
            cy = 0,
            cz = 0;
        for (const a of skeleton.anchors) {
            cx += a.x;
            cy += a.y;
            cz += a.z;
        }
        const aN = skeleton.anchors.length;
        cx /= aN;
        cy /= aN;
        cz /= aN;
        cy += totalH * 0.05; // leicht nach oben
        // Cluster aus K Karten je Anchor füllt das Kronen-VOLUMEN (eine Karte je Anchor las als Stachel).
        // Jede Karte card{cross} (8 Verts + 12 Indizes), im Volumen gejittert (teils zur Mitte), mit
        // Größen-Varianz + Drehung um y. LOD1/2 dünnen über cardsPerAnchor (der LOD trägt die FPS).
        const N = skeleton.anchors.length;
        const M = N * K; // Gesamt-Karten in der Krone (fd/lod/K oben gehoistet)
        const positions = new Float32Array(M * 8 * 3);
        const normals = new Float32Array(M * 8 * 3);
        const colors = new Float32Array(M * 8 * 3);
        // Ω-O14 (wahreranblick §8.5) — per-Ecke UV [0..1], damit das Laub-Material eine
        // weiche BLATT-Alpha-Maske rechnen kann (die harten Rechteck-Ecken wegclippen →
        // die Krone liest als Laub, nicht als Karten-Stapel). Ecken: 0,1,2,3.
        const uvs = new Float32Array(M * 8 * 2);
        const UVC = [0, 0, 1, 0, 1, 1, 0, 1]; // (0,0)(1,0)(1,1)(0,1)
        const indices = new Uint32Array(M * 12);
        // foliageColor aus dem skeleton (der Farb-Wurf des Gesetzes, P.leafCol in _growTreeBlueprintRich), gelesen über
        // `_treeLeafBaseColor` — dieselbe rohe Quelle wie der Phyto-Pfad, kein Pfad-Dämpfer.
        const _lc = this._treeLeafBaseColor(skeleton);
        const fr = _lc[0];
        const fg = _lc[1];
        const fb = _lc[2];
        const jitterR = cardW * (fd.jitterFrac || 1.0);
        const sizeVar = fd.sizeVar || 0;
        const innerFill = fd.innerFill || 0;
        // deterministischer [0,1)-Hash aus (anchor, card, salt) — die Krone-Streuung
        // ist bit-identisch über Re-Wachstum (gleiche Variante → gleiche Krone).
        const h01 = (av, bv, salt) => {
            let h =
                (Math.imul(av + 1, 374761393) ^ Math.imul(bv + 1, 668265263) ^ Math.imul(salt + 1, 2147483647)) >>> 0;
            h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
            return (h >>> 0) / 4294967296;
        };
        let vWrite = 0;
        let iWrite = 0;
        let cardIdx = 0;
        for (let ai = 0; ai < N; ai++) {
            const a = skeleton.anchors[ai];
            for (let kk = 0; kk < K; kk++, cardIdx++) {
                // Karten-Mitte: Anker + Jitter im Kronen-Volumen. Ein Teil der
                // Karten (innerFill) wird zur Kronen-Mitte gezogen → das Innere
                // füllt sich (nicht nur die Schale). K=1 (LOD2) sitzt am Anker.
                let ax = a.x,
                    ay = a.y,
                    az = a.z;
                if (K > 1) {
                    ax += (h01(ai, kk, 1) * 2 - 1) * jitterR;
                    ay += (h01(ai, kk, 2) * 2 - 1) * jitterR * 0.8;
                    az += (h01(ai, kk, 3) * 2 - 1) * jitterR;
                    if (h01(ai, kk, 7) < innerFill) {
                        const pull = 0.35 + h01(ai, kk, 8) * 0.45;
                        ax += (cx - a.x) * pull;
                        ay += (cy - a.y) * pull;
                        az += (cz - a.z) * pull;
                    }
                }
                // Bend-Direction: von der Karte zum Krone-Zentrum (normalBend §3.4).
                let bdx = cx - ax,
                    bdy = cy - ay,
                    bdz = cz - az;
                const blen = Math.sqrt(bdx * bdx + bdy * bdy + bdz * bdz) || 1;
                bdx /= blen;
                bdy /= blen;
                bdz /= blen;
                // GEDAPPELTE KRONEN-TIEFE: jede Karte trägt Helligkeit aus ihrer Höhe in der Krone (Spitze hell,
                // Inneres dunkel) + per-Karte-Jitter → geschichtetes Laub statt flacher Masse.
                const hf = ay / totalH < 0 ? 0 : ay / totalH > 1 ? 1 : ay / totalH;
                // Die Dapple ist NUR WERT, kein Hue-Skew: alle drei Kanäle skalieren GLEICH mit `dap` (ein Rot-Boost
                // wusch besonnte Blätter zu Tan) — der Ton bleibt exakt das Art-Grün.
                const dap = 0.6 + hf * 0.34 + (h01(ai, kk, 9) - 0.5) * 0.26; // ~0.47..1.07, Wert-only
                const cr = Math.min(1, fr * dap);
                const cg = Math.min(1, fg * dap);
                const cb = Math.min(1, fb * dap);
                // Größen-Varianz + Kreuz-Drehung um y (organisch, kein Gitter).
                const szJ = 1 + (h01(ai, kk, 4) - 0.5) * 2 * sizeVar;
                const hw = cardW * 0.5 * szJ;
                const hh = cardH * 0.5 * szJ;
                const tw = hw * 0.42; // Blatt-Form Ω-O14: oben verjüngt
                const curl = hh * 0.32; // Spitze krümmt zur Krone
                // 4×2-Atlas: SPALTE = Blatt-Typ (kindCol), REIHE = eine von 2 Varianten (Hash) → kein
                // Wiederholungs-Muster, Typ gewahrt. UV-Skala (1/4, 1/2) je Kachel.
                const tvar = h01(ai, kk, 6) < 0.5 ? 0 : 1;
                const tuX = kindCol * 0.25;
                const tuY = tvar * 0.5;
                const rot = h01(ai, kk, 5) * Math.PI;
                const cR = Math.cos(rot),
                    sR = Math.sin(rot);
                // Tangenten (um y gedreht): t1=(cR,0,−sR), t2=(sR,0,cR) (⟂). Keine Facing-Normale:
                // `_kronenNormalenAuf` überschreibt das normal-Attribut nach dem Bau.
                // Eck-Halbbreiten (Blatt-Form): unten ±hw, oben ±tw.
                const lxs = [-hw, hw, tw, -tw];
                const lys = [-hh, -hh, hh, hh];
                const base = cardIdx * 8;
                // Quad 1 (Tangente t1=(cR,0,−sR))
                for (let c = 0; c < 4; c++) {
                    const lx = lxs[c];
                    const cu = c >= 2 ? curl : 0;
                    const v3 = vWrite * 3;
                    positions[v3] = ax + lx * cR + cu * bdx;
                    positions[v3 + 1] = ay + lys[c] + cu * bdy;
                    positions[v3 + 2] = az - lx * sR + cu * bdz;
                    colors[v3] = cr;
                    colors[v3 + 1] = cg;
                    colors[v3 + 2] = cb;
                    uvs[vWrite * 2] = tuX + UVC[c * 2] * 0.25;
                    uvs[vWrite * 2 + 1] = tuY + UVC[c * 2 + 1] * 0.5;
                    vWrite++;
                }
                // Quad 2 (Tangente t2=(sR,0,cR), ⟂ zu t1)
                for (let c = 0; c < 4; c++) {
                    const lx = lxs[c];
                    const cu = c >= 2 ? curl : 0;
                    const v3 = vWrite * 3;
                    positions[v3] = ax + lx * sR + cu * bdx;
                    positions[v3 + 1] = ay + lys[c] + cu * bdy;
                    positions[v3 + 2] = az + lx * cR + cu * bdz;
                    colors[v3] = cr;
                    colors[v3 + 1] = cg;
                    colors[v3 + 2] = cb;
                    uvs[vWrite * 2] = tuX + UVC[c * 2] * 0.25;
                    uvs[vWrite * 2 + 1] = tuY + UVC[c * 2 + 1] * 0.5;
                    vWrite++;
                }
                indices[iWrite++] = base;
                indices[iWrite++] = base + 1;
                indices[iWrite++] = base + 2;
                indices[iWrite++] = base;
                indices[iWrite++] = base + 2;
                indices[iWrite++] = base + 3;
                indices[iWrite++] = base + 4;
                indices[iWrite++] = base + 5;
                indices[iWrite++] = base + 6;
                indices[iWrite++] = base + 4;
                indices[iWrite++] = base + 6;
                indices[iWrite++] = base + 7;
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2)); // Ω-O14: weiche Blatt-Alpha
        g.setIndex(new THREE.BufferAttribute(indices, 1));
        // die Normale der Krone (K68-N1, das EINE Kern-Gesetz)
        this._kronenNormalenAuf(g);
        // S1-SHADER — die Wahrnehmungs-Höhen (aH0/aH0L) für die SSE-LOD-Crossfade-Metrik.
        this._stampFoliageVisHeights(g, totalH);
        g.computeBoundingBox();
        g.computeBoundingSphere();
        return g;
    }

    // OPAKER KRONEN-KERN: kleine opake Icosphere INNERHALB der Karten-Wolke (CORE_FILL 0.6, die Spitzen
    // verdecken ihn): (a) füllt Durchscheine-Löcher mit dunklem Innen-Grün, (b) schreibt Tiefe → early-Z
    // verwirft verdeckte Hinter-Karten (die Laub-Last ist Overdraw von ~100 DoubleSide-Alpha-Karten).
    // Nur LOD0, opak, kein Schatten. A/B-Toggle `state.foliageOpaqueCore`.
    _buildTreeFoliageCoreGeometry(skeleton) {
        if (skeleton) AnazhRealm._skelettPflicht(skeleton);
        if (!skeleton || !Array.isArray(skeleton.anchors) || skeleton.anchors.length < 3) return null;
        if (typeof THREE === "undefined" || !THREE.IcosahedronGeometry) return null;
        const fo = skeleton.laub;
        if (!fo) return null;
        // Kern NUR für dichte runde Laub-Kronen; am Nadel-Kegel gibt es kaum Overdraw zu sparen, und die
        // Ellipsoid-Mitte pokt durch die dünne Silhouette.
        if (fo.kind === "needleSpray") return null;
        const anchors = skeleton.anchors;
        // Kronen-Schwerpunkt + Bounding-Box (die Kron-Form, damit der Kern Tanne tall-schmal vs Eiche
        // rund-breit folgt statt einer generischen Kugel).
        let cx = 0,
            cy = 0,
            cz = 0,
            minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const a of anchors) {
            cx += a.x;
            cy += a.y;
            cz += a.z;
            if (a.x < minX) minX = a.x;
            if (a.y < minY) minY = a.y;
            if (a.z < minZ) minZ = a.z;
            if (a.x > maxX) maxX = a.x;
            if (a.y > maxY) maxY = a.y;
            if (a.z > maxZ) maxZ = a.z;
        }
        const n = anchors.length;
        cx /= n;
        cy /= n;
        cz /= n;
        const baseSize = fo.size * 2.0; // ~Karten-Halb-Reichweite
        // CORE_FILL < 1 → der Kern sitzt INNERHALB der Karten-Spitzen (die Karten reichen bis
        // ~(Anker-Spanne + baseSize)) → die Silhouette-Karten verdecken ihn → kein Heraus-Poken.
        const CORE_FILL = 0.6;
        const rx = Math.max(baseSize * 0.6, (maxX - minX) * 0.5 + baseSize) * CORE_FILL;
        const ry = Math.max(baseSize * 0.6, (maxY - minY) * 0.5 + baseSize) * CORE_FILL;
        const rz = Math.max(baseSize * 0.6, (maxZ - minZ) * 0.5 + baseSize) * CORE_FILL;
        // 80 Tris. NON-INDEXED erzwingen (240 Verts, flach-schattiert) — der Kern ist verdeckt,
        // glatte Normalen sind unnötig; 240 Position-Einträge erfüllen zudem die `mergedHasManyVerts`-
        // Wand (≥100 Verts/Leaf) legitim, ohne einen Test ans Low-Poly-Sonderkind anpassen zu müssen.
        let ico = new THREE.IcosahedronGeometry(1, 1);
        if (ico.getIndex()) {
            const ni = ico.toNonIndexed();
            ico.dispose();
            ico = ni;
        }
        const ip = ico.attributes.position;
        const vCount = ip.count;
        const positions = new Float32Array(vCount * 3);
        const normals = new Float32Array(vCount * 3);
        const colors = new Float32Array(vCount * 3);
        const uvs = new Float32Array(vCount * 2);
        // Kern-Farbe: das DUNKLE Innen-Grün (tiefer Kronen-Schatten) — die instanceColor (per-Spawn)
        // moduliert es wie die Karten, so matcht der Kern den Baum.
        const _kl = this._treeLeafBaseColor(skeleton);
        const cr = _kl[0] * 0.5,
            cg = _kl[1] * 0.62,
            cb = _kl[2] * 0.38;
        for (let i = 0; i < vCount; i++) {
            const ux = ip.getX(i),
                uy = ip.getY(i),
                uz = ip.getZ(i);
            positions[i * 3] = cx + ux * rx;
            positions[i * 3 + 1] = cy + uy * ry;
            positions[i * 3 + 2] = cz + uz * rz;
            let nx = ux / rx,
                ny = uy / ry,
                nz = uz / rz;
            const nl = Math.hypot(nx, ny, nz) || 1;
            normals[i * 3] = nx / nl;
            normals[i * 3 + 1] = ny / nl;
            normals[i * 3 + 2] = nz / nl;
            colors[i * 3] = cr;
            colors[i * 3 + 1] = cg;
            colors[i * 3 + 2] = cb;
            uvs[i * 2] = 0.5;
            uvs[i * 2 + 1] = 0.5;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        ico.dispose();
        g.computeBoundingBox();
        g.computeBoundingSphere();
        return g;
    }

    // SCHATTEN-ZWILLING: statischer Voll-Caster NUR im Schatten-Pass (SHADOW_TWIN_LAYER); das Anzeige-Laub
    // castet nie → kein Alpha-Test-Schatten-Rauschen. Anders als der Kern: subdividiert (IcoDetail 2),
    // füllt bis nahe die Karten-Spitzen (TWIN_FILL 0.9) und FORM-FOLGEND (Radius je Richtung mischt die
    // Ellipsoid-Hülle mit der echten Anker-Reichweite). Unsichtbar → darf jede Kronenform tragen, auch
    // Koniferen. Deterministisch, kein Math.random.
    _buildTreeShadowTwinGeometry(skeleton) {
        if (skeleton) AnazhRealm._skelettPflicht(skeleton);
        if (!skeleton || !Array.isArray(skeleton.anchors) || skeleton.anchors.length < 3) return null;
        if (typeof THREE === "undefined" || !THREE.IcosahedronGeometry) return null;
        const fo = skeleton.laub;
        if (!fo) return null;
        const anchors = skeleton.anchors;
        let cx = 0,
            cy = 0,
            cz = 0,
            minX = Infinity,
            minY = Infinity,
            minZ = Infinity,
            maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const a of anchors) {
            cx += a.x;
            cy += a.y;
            cz += a.z;
            if (a.x < minX) minX = a.x;
            if (a.y < minY) minY = a.y;
            if (a.z < minZ) minZ = a.z;
            if (a.x > maxX) maxX = a.x;
            if (a.y > maxY) maxY = a.y;
            if (a.z > maxZ) maxZ = a.z;
        }
        const n = anchors.length;
        cx /= n;
        cy /= n;
        cz /= n;
        const baseSize = fo.size * 2.0; // ~Karten-Halb-Reichweite
        // TWIN_FILL 0.9 (> der Kern-CORE_FILL 0.6): der Zwilling füllt bis nahe die Karten-Spitzen →
        // sein Schatten deckt die volle sichtbare Krone (er ist unsichtbar, darf also groß sein).
        const TWIN_FILL = 0.9;
        const rx = Math.max(baseSize * 0.6, (maxX - minX) * 0.5 + baseSize) * TWIN_FILL;
        const ry = Math.max(baseSize * 0.6, (maxY - minY) * 0.5 + baseSize) * TWIN_FILL;
        const rz = Math.max(baseSize * 0.6, (maxZ - minZ) * 0.5 + baseSize) * TWIN_FILL;
        // IcoDetail 3 = 320 Faces (PolyhedronGeometry subdividiert je Face (detail+1)² = 16 → 20·16 =
        // 320) → non-indexed 960 Verts (≫ die 100-Verts-Wand, „volle Tiefe" = 4× der 80-Tri-Kern).
        let ico = new THREE.IcosahedronGeometry(1, 3);
        if (ico.getIndex()) {
            const ni = ico.toNonIndexed();
            ico.dispose();
            ico = ni;
        }
        const ip = ico.attributes.position;
        const vCount = ip.count;
        const positions = new Float32Array(vCount * 3);
        const normals = new Float32Array(vCount * 3);
        for (let i = 0; i < vCount; i++) {
            let ux = ip.getX(i),
                uy = ip.getY(i),
                uz = ip.getZ(i);
            const ul = Math.hypot(ux, uy, uz) || 1;
            ux /= ul;
            uy /= ul; // Einheits-Richtung d
            uz /= ul;
            // (a) glatte Ellipsoid-Reichweite in Richtung d: 1/|d/r|.
            const ellK = Math.hypot(ux / rx, uy / ry, uz / rz) || 1;
            const ellReach = 1 / ellK;
            // (b) ECHTE Anker-Reichweite in Richtung d (die L1-Silhouette): max_a (a-center)·d, ≥0.
            let anchReach = 0;
            for (const a of anchors) {
                const p = (a.x - cx) * ux + (a.y - cy) * uy + (a.z - cz) * uz;
                if (p > anchReach) anchReach = p;
            }
            anchReach = (anchReach + baseSize) * TWIN_FILL; // Karten reichen ~baseSize über die Anker
            // FORM-FOLGEND: die glatte Hülle mit der Kronen-Lobung mischen (0.5/0.5 → weder klecksig-
            // rund noch zackig-lokal). Der Radius bleibt ≥ einer Mindest-Kugel (kein Kollaps in Löchern).
            const radius = Math.max(baseSize * 0.5, ellReach * 0.5 + anchReach * 0.5);
            positions[i * 3] = cx + ux * radius;
            positions[i * 3 + 1] = cy + uy * radius;
            positions[i * 3 + 2] = cz + uz * radius;
            // Radiale Normale (konvexe Hülle → gute Näherung; nur der Schatten-normalBias liest sie).
            normals[i * 3] = ux;
            normals[i * 3 + 1] = uy;
            normals[i * 3 + 2] = uz;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        ico.dispose();
        g.computeBoundingBox();
        g.computeBoundingSphere();
        return g;
    }

    // Das EINE geteilte, OPAKE Schatten-Zwilling-Material (kein Alpha-Test/vertexColors/useInstanceTint →
    // nur position+normal; Instanz-Feld, nicht serialisiert). Der Zwilling rendert nie im Farb-Pass
    // (SHADOW_TWIN_LAYER); die opake Signatur hält den Schatten solide. Der Zwilling schwingt mit seiner Krone (K19): EIN
    // Stoff je Baum-Gestalt (`baumWind` aus `_skelettWindDaten`, derselbe Wind-Term wie der Wurf-Teil der Foundry-L1), EIN
    // Programm für alle; jeder trägt den Licht-Pool (K11, `_leuchtStoff` im Leuchten, der Wind im positionNode).
    _treeShadowTwinMaterial(baumWind) {
        if (!this._treeShadowTwinMats) this._treeShadowTwinMats = new Map();
        const key = baumWind ? baumWind.ht + "/" + baumWind.delta : "still";
        let m = this._treeShadowTwinMats.get(key);
        if (m) return m;
        m = new THREE.MeshStandardNodeMaterial({ color: 0x2c4a22, roughness: 1, metalness: 0 });
        m.userData.shadowTwin = true; // vor dem Leuchten: der Zwilling zeichnet keine Farbe, er wird nie nass
        this._leuchtStoff(m, null); // jeder beleuchtete Stoff trägt den Licht-Pool (K11)
        this._baumWindStoff(m, "schatten", baumWind || null);
        this._treeShadowTwinMats.set(key, m);
        return m;
    }

    // DIE WIND-DATEN DES WERKSTATT-BAUMS (K19): ht = die Skelett-Höhe (die Vorlage steht in Metern, die Instanz-Skala trägt
    // aH0), δ an der Stamm-Achse (phyto-core `windSchlankheitAchse`, dieselbe Brusthöhe wie die Foundry-Gestalt). null ohne
    // Stamm-Achse: der Baum steht still (sichtbar, nie ein geratener Wert).
    _skelettWindDaten(skel) {
        const ht = skel && Number.isFinite(skel.totalH) && skel.totalH > 0 ? skel.totalH : 0;
        const stamm =
            ht > 0 && Array.isArray(skel.branches)
                ? skel.branches.find((b) => b && b.isTrunk && Array.isArray(b.points))
                : null;
        const delta = stamm ? globalThis.__phytoCore.windSchlankheitAchse(stamm.points, ht, 1) : null;
        return delta > 0 ? { ht: +ht.toFixed(2), delta: +delta.toFixed(4), an: 1 } : null;
    }

    // Baut aus dem Skeleton beide Leaves (bark + foliage) als merged Geometries. Materialien:
    // vertexColors=true + useInstanceTint für laub (Per-Spawn-HSL aus _archInstanceAdd).
    _buildTreeSkeletonLeaves(bp) {
        if (!bp || !bp._skeleton) return null;
        const skel = bp._skeleton;
        // FERNER BAUM (LOD2): EIN camera-facing Billboard-Quad (6 Verts) mit 8-View-Studio-Atlas +
        // Normal-Atlas statt Rinde + Blatt-Karten — durch DENSELBEN Skeleton-Leaf/HISM-Pfad (useInstanceTint,
        // Wind, Atmosphäre, AlphaTest aus der EINEN Material-Quelle). Kein Atlas/Skeleton (headless ohne
        // document) → Karten-LOD2 unten. Toggle `state.treeImpostors` (Default an, `!== false`).
        if ((skel.lodLevel | 0) === 2 && this.state.treeImpostors !== false) {
            const imp = this._buildImpostorLeaf(bp, skel);
            if (imp) return { leaves: [imp] };
        }
        const leaves = [];
        // DER WIND (K19): Höhe und Schlankheit des Skeletts — Rinde, Laub, Kern und Zwilling tragen sie im Stoff
        // (`_baumWindStoff` über `opts.baumWind`), die Welt-Höhe jedes Teils im Stempel aH0: `_stampFoliageVisHeights` trägt
        // die Vorlage, die Instanz-Fassade (`_lodInstanceFacade`, je Slot gestempelt) Vorlage × Instanz-Skala.
        const baumWind = this._skelettWindDaten(skel);
        const totalH = Math.max(1, AnazhRealm._skelettPflicht(skel).totalH);
        // bark-Geometrie (Tubes)
        const barkGeom = this._buildTreeTubeGeometry(skel);
        if (barkGeom) {
            const holzMat = this.state.materials && this.state.materials.holz;
            // `bark:true` weckt die Rinden-Maserung in _buildPbrNodeMaterial (Faser + härte-Risse aus dem holz-Tag).
            // DoubleSide: die Tube-Wicklung macht die Außenflächen back-facing — FrontSide cullte sie (der Stamm las konkav).
            this._stampFoliageVisHeights(barkGeom, totalH);
            const barkMatOpts = {
                vertexColors: true,
                pflanzenStoff: true,
                bark: true,
                side: THREE.DoubleSide,
                baumWind,
            };
            if (holzMat && holzMat.tags) Object.assign(barkMatOpts, { tags: holzMat.tags, stoff: "holz" });
            const barkMat = this._sharedFoliageMaterial(barkMatOpts);
            leaves.push({ geom: barkGeom, mat: barkMat, localMatrix: new THREE.Matrix4() });
        }
        // NAHER BAUM (LOD0): 30-Vert-Superformel-Klingen (`_buildTreeFoliageBladeGeometry`, phyto-core
        // `buildLeafBlades`) tragen das Laub als echte 3D-Geometrie; Nadel-Sprays bleiben Quads (Zelle 3).
        // Toggle `state.foliageBlades` (Default an, `!== false`).
        const _lod0 = (skel.lodLevel | 0) === 0;
        let bladeGeom = null;
        if (_lod0 && this.state.foliageBlades !== false) {
            bladeGeom = this._buildTreeFoliageBladeGeometry(skel);
        }
        // foliage-Geometrie (Cards) — bei aktiven Klingen nur noch die Nadel-Blätter.
        const foliageGeom = this._buildTreeFoliageCardGeometry(skel, { skipBroadleaf: !!bladeGeom });
        if (foliageGeom || bladeGeom) {
            const laubMat = this.state.materials && this.state.materials.laub;
            // DoubleSide: ein Blatt ist von BEIDEN Seiten sichtbar — mit FrontSide wurden die äußeren Karten
            // back-face-gecullt und die Krone las sparse.
            const foliageMatOpts = {
                vertexColors: true,
                useInstanceTint: true,
                pflanzenStoff: true,
                foliageLeaf: true, // Ω-O14: weiche Blatt-Alpha-Maske (alphaTest) statt harter Karte
                side: THREE.DoubleSide,
                baumWind,
            };
            if (laubMat && laubMat.tags) Object.assign(foliageMatOpts, { tags: laubMat.tags, stoff: "laub" });
            // Klingen-Material: DIESELBE Opts-Signatur + `foliageBlade` → eigenes geteiltes
            // Singleton, das den Atlas-Sample überspringt (die Klinge IST Geometrie, alpha=1;
            // alphaTest bleibt fürs Dither-Crossfade am L0→L1-Band).
            let bladeLeaf = null;
            if (bladeGeom) {
                const bladeMat = this._sharedFoliageMaterial(Object.assign({}, foliageMatOpts, { foliageBlade: true }));
                bladeLeaf = { geom: bladeGeom, mat: bladeMat, localMatrix: new THREE.Matrix4() };
            }
            const foliageMat = foliageGeom ? this._sharedFoliageMaterial(foliageMatOpts) : null;
            const cardLeaf = foliageGeom
                ? { geom: foliageGeom, mat: foliageMat, localMatrix: new THREE.Matrix4() }
                : null;
            // OPAKER KRONEN-KERN (nur LOD0): füllt Löcher + schreibt Tiefe → early-Z (Toggle
            // `state.foliageOpaqueCore`; EIN geteiltes Singleton-Material, eigene Opts-Signatur → eigene Gruppe).
            // DREI Rollen durch DENSELBEN Leaf-/HISM-Pfad (castShadow/shadowTwin sind Leaf-Felder): cards
            // (Anzeige-Laub) und core (Füller, Layer 0) casten NICHT; der twin ist der opake, form-folgende
            // Schatten-Caster auf SHADOW_TWIN_LAYER. Toggle `state.foliageShadowTwin` (Default an).
            let coreLeaf = null;
            if (this.state.foliageOpaqueCore !== false && (skel.lodLevel | 0) === 0) {
                const coreGeom = this._buildTreeFoliageCoreGeometry(skel);
                if (coreGeom) {
                    this._stampFoliageVisHeights(coreGeom, totalH);
                    const coreMat = this._sharedFoliageMaterial({
                        vertexColors: true,
                        useInstanceTint: true,
                        pflanzenStoff: true,
                        baumWind,
                    });
                    coreLeaf = {
                        geom: coreGeom,
                        mat: coreMat,
                        localMatrix: new THREE.Matrix4(),
                        castShadow: false, // V18.389 — reine Anzeige (der twin castet); early-Z bleibt
                    };
                }
            }
            // Der Zwilling (aus der Anker-Wolke) trägt L0 UND L1 — beide werfen Schatten, sonst würfe die
            // L1-Kartenwolke Alpha-Test-Schatten. Karten/Klingen bleiben über die Twin-Existenz stumm; der
            // sichtbare Kern bleibt L0-only.
            let twinLeaf = null;
            if (this.state.foliageShadowTwin !== false && (skel.lodLevel | 0) <= 1) {
                const twinGeom = this._buildTreeShadowTwinGeometry(skel);
                if (twinGeom) this._stampFoliageVisHeights(twinGeom, totalH);
                const twinMat = twinGeom && this._treeShadowTwinMaterial(baumWind);
                if (twinGeom && twinMat) {
                    twinLeaf = {
                        geom: twinGeom,
                        mat: twinMat,
                        localMatrix: new THREE.Matrix4(),
                        castShadow: true, // der EINZIGE Kronen-Caster
                        shadowTwin: true, // → _archInstanceGroupFor legt ihn auf SHADOW_TWIN_LAYER
                    };
                }
            }
            // V18.389 — die Karten/Klingen casten nur, wenn KEIN Zwilling sie trägt (sonst bleibt
            // der Laub-Schatten = kein Regress bei Toggle aus). Reihenfolge bark → blade → card →
            // core → twin (Leaf-Index-Stabilität für _archInstanceGroupFor/instSlots).
            if (twinLeaf) {
                if (cardLeaf) cardLeaf.castShadow = false;
                if (bladeLeaf) bladeLeaf.castShadow = false;
            }
            if (bladeLeaf) leaves.push(bladeLeaf);
            if (cardLeaf) leaves.push(cardLeaf);
            if (coreLeaf) leaves.push(coreLeaf);
            if (twinLeaf) leaves.push(twinLeaf);
        }
        if (leaves.length === 0) return null;
        return { leaves };
    }
    // DIE GESTALT DES ORTS (K20), das EINE Gesetz und das EINE Gedächtnis für jeden Baum mit Lage — den Eintrag (auch den
    // geladenen und den gesetzten, `_foundryGestaltFor`) und die Streu-Zelle (`_scatterFoundrySeed`): der Baum am Ort (x, z)
    // mit der eigenen Krone T (FOREST.crown × Größe, m) fragt das Wald-Gesetz (`_forestStehtFrei`), der Same wählt danach
    // seinen Eimer (`_foundryGestaltSame`). Gemerkt je Ort, Krone, Same und Art am Stand jeder Eingabe des Urteils: dem
    // Stand des Wald-Gesetzes (`_forestDartStand`: Same, Buch, Hydrosphäre) und dem der Grundrisse am Ort — das Gedächtnis
    // liegt in Eimern von `ORT_SAME_EIMER` m, ein Grundriss fällt nur in den Eimern seiner Reichweite (`_grundrissFaellt`).
    // Vor dem Worldgen wartet die Gestalt (null, nie gemerkt) — für jeden Leser gleich.
    _ortGestaltSame(x, z, T, seed, preset) {
        const seedInt = this._forestSeedInt();
        const stand = this._forestDartStand(seedInt);
        if (this._ortSameStand !== stand || !this._ortSame || this._ortSameN > 16384) {
            this._ortSame = new Map();
            this._ortSameN = 0;
            this._ortSameStand = stand;
        }
        const B = AnazhRealm.ORT_SAME_EIMER;
        const ek = Math.floor(x / B) + "," + Math.floor(z / B);
        let eimer = this._ortSame.get(ek);
        const k = x + "," + z + "," + T + "," + seed + "," + preset;
        const hat = eimer ? eimer.get(k) : undefined;
        if (hat !== undefined) return hat;
        let wartet = false;
        const same = this._foundryGestaltSame(seed, preset, () => {
            if (!(T > 0)) return false;
            // die Wahrheit des Gesetzes und der Plan des Walds um den Ort (`_waldPlanSteht`, K69): fehlt eins, wartet sie
            if (!this._forestGesetzWahr()) {
                wartet = true;
                return false;
            }
            // fehlt der Plan, bestellt ihn die Frage in der EINEN Schlange des Walds (ihr Rechner ist der Wald-Faden, K60-3);
            // wer warten kann (die Streu-Scheibe), wartet benannt auf die Zellen des Kastens um den Ort (`_waldPlanZusage`)
            if (!this._waldPlanSteht(x, z)) {
                wartet = true;
                if (this._streuSammler) this._streuWartetAuf(this._waldPlanZusage(x, z));
                return false;
            }
            return this._forestStehtFrei(x, z, T, (gx, gz) => this._forestCellDarts(gx, gz, seedInt));
        });
        if (wartet) return null;
        if (!eimer) this._ortSame.set(ek, (eimer = new Map()));
        eimer.set(k, same);
        this._ortSameN = (this._ortSameN | 0) + 1;
        return same;
    }

    // Steht der geborene Dart `d` der Zelle (gx, gz)? Kronen-Schüchternheit: er steht, wenn KEIN besserer Dart (prio,
    // Positions-Tiebreak) in ±2 Nachbarzellen konkurriert. Rein → reihenfolge-unabhängig; strikte Total-Ordnung → kein
    // Paar akzeptierter Zentren < pack·(Ti+Tj). Shared shy-Distanz (phyto-core forestTooClose) + named prio-max
    // (forestPrioWins); FOREST_TOPOLOGY.host = "cell" (Feel-Entscheid .116). Einziger Leser ist der Pflanz-Gang
    // (`_forestPlantChunk`) — die Spawn-Wahl liest den Wald nicht, die Genesis-Lichtung hält ihn von der Plattform fern.
    // DAS URTEIL GEHÖRT DEM DART (K60): es ist eine reine Funktion des Darts und seiner Nachbar-Zellen am Stand des Walds
    // (`_forestDartStand`) — gemerkt je Dart-Objekt (die Objekte leben im Dart-Gedächtnis dieses Stands, ein neuer Stand legt
    // neue an), nur über der Wahrheit des Gesetzes (`_forestGesetzWahr`; vorläufige Darts merken nichts). Bis K60 fragte jede
    // Gestalt des Orts (`_forestStehtFrei`) jeden Nachbarn neu, und jede neue Fläche eines Grundrisses warf das Gedächtnis der
    // Gestalt (`_ortGestaltSame`): Radeon kalt bis zum ersten Bild 3 220 Freistand-Fragen an 251 Orten, das Urteil 1,5 s.
    _forestDartSteht(d, gx, gz, cellDarts) {
        const memo = this._forestGesetzWahr() ? this._forestStehtMemo || (this._forestStehtMemo = new WeakMap()) : null;
        const hat = memo ? memo.get(d) : undefined;
        if (hat !== undefined) return hat;
        const F = AnazhRealm.FOREST;
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        const tooClose = core && typeof core.forestTooClose === "function" ? core.forestTooClose : null;
        const prioWins = core && core.forestPrioWins;
        let steht = true;
        nachbarn: for (let ax = -2; ax <= 2; ax++) {
            for (let az = -2; az <= 2; az++) {
                const nb = cellDarts(gx + ax, gz + az);
                for (let k = 0; k < nb.length; k++) {
                    const o = nb[k];
                    if (o === d) continue; // sich selbst (eigene Zelle) überspringen
                    const dx = d.x - o.x;
                    const dz = d.z - o.z;
                    // Distance: shared forestTooClose; Host residual = prio-max (nicht Lab sequential reject).
                    const conflict = tooClose
                        ? tooClose(dx, dz, d.T, o.T, F.pack)
                        : (() => {
                              const md = F.pack * (d.T + o.T);
                              return dx * dx + dz * dz < md * md;
                          })();
                    if (!conflict) continue; // kein Konflikt
                    // Konflikt: „besser" = forestPrioWins (prio, Tiebreak x dann z).
                    const better = prioWins
                        ? prioWins(o, d)
                        : o.prio > d.prio || (o.prio === d.prio && (o.x > d.x || (o.x === d.x && o.z > d.z)));
                    if (better) {
                        steht = false;
                        break nachbarn;
                    }
                }
            }
        }
        if (memo) memo.set(d, steht);
        return steht;
    }

    // DER SOLITÄR STEHT FREI (K20): kein stehender Baum des Wald-Gesetzes (`_forestDartSteht`) näher als phyto-core
    // FREISTAND.abstand × die Summe der Kronen (T eigene Krone in m; der Baum an derselben Stelle ist er selbst). Die Nachbarn reichen
    // ±4 Zellen (48 m trägt 2 × (6 + 18) m: Eiche neben dem größten Mammut). Mess-Wiese 12.10.: der Bestand steht bei
    // 1,2–1,5 × der Kronen-Summe, frei steht jeder sechste bis siebte Baum. Ein Nachbar steht nur, wo ihn auch der Pflanz-Gang
    // setzt (`_enqueueVegetationSpawn`): die Wildnis trägt seinen Ort (`_wildnisTraegt`) und die Wand des Orts lässt ihn durch
    // (`_ortWand` fragt nur den Grundriss; den Wagen fragt sie nicht, er fährt, und das Wasser des Gesetzes trägt schon
    // der Dart) — der Wurf im Haus stand nie (gate:fernwald F: die Eiche neben einem Haus über ihrem einzigen Nachbarn
    // blieb Bestand). Wer die Antwort merkt, merkt sie am Stand der Grundrisse (`_grundrissStand`).
    // ZWEI STÄNDE, ZWEI GEDÄCHTNISSE (K60): die stehenden Nachbarn im Freistand-Kreis sind eine Funktion des Orts am Stand des
    // Walds — gemerkt am Dart-Gedächtnis dieses Stands (`_forestDartMemo`, nur über der Wahrheit des Gesetzes); Wildnis und
    // Wand fragt jede Antwort neu (wenige Nachbarn, je eine Gitter-Frage). Eine neue Fläche eines Grundrisses (je Haus des
    // Dorfs) fragt so nur die Wand, nie wieder 81 Zellen.
    _forestStehtFrei(x, z, T, cellDarts) {
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        const FS = core && core.FREISTAND;
        if (!FS || !(FS.abstand > 0)) return AnazhRealm._kernPflichtBruch("phyto:FREISTAND.abstand");
        let memo = null;
        if (this._forestGesetzWahr()) {
            if (this._freistandMemoVon !== this._forestDartMemo || !this._freistandMemo) {
                this._freistandMemo = new Map();
                this._freistandMemoVon = this._forestDartMemo;
            }
            memo = this._freistandMemo;
        }
        const key = x + "," + z + "," + T;
        let nah = memo ? memo.get(key) : undefined;
        if (!nah) {
            nah = [];
            const CELL = AnazhRealm.FOREST.cell;
            const gx = Math.floor(x / CELL);
            const gz = Math.floor(z / CELL);
            for (let ax = -4; ax <= 4; ax++) {
                for (let az = -4; az <= 4; az++) {
                    const nb = cellDarts(gx + ax, gz + az);
                    for (let k = 0; k < nb.length; k++) {
                        const o = nb[k];
                        const r = FS.abstand * (T + o.T);
                        const dx = o.x - x;
                        const dz = o.z - z;
                        const d2 = dx * dx + dz * dz;
                        if (d2 < 1e-6 || d2 >= r * r) continue;
                        if (this._forestDartSteht(o, gx + ax, gz + az, cellDarts)) nah.push(o);
                    }
                }
            }
            if (memo) {
                if (memo.size >= 16384) memo.clear(); // bounded — die Front ist lokal
                memo.set(key, nah);
            }
        }
        for (const o of nah) {
            if (!this._wildnisTraegt(o.x, o.z)) continue;
            if (!this._ortWand(o.sp, { x: o.x, y: o.surfaceY + 0.5, z: o.z }, { scale: o.s })) return false;
        }
        return true;
    }

    _forestPlantChunk(cx, cz) {
        if (!this.state.scene || !this.state.blueprints) return 0;
        const F = AnazhRealm.FOREST;
        const CELL = F.cell;
        const { span } = this._voxelChunkConfig();
        const ox = cx * span;
        const oz = cz * span;
        const seedInt = this._forestSeedInt();
        // Perf-Kappung aus der EINEN Quelle `_effectiveFoliageDensity`: im Studio-Regime 1 (das Studio dünnt
        // den Wald nie), sonst der Perf-Regler; headless → 1.
        const fd = this._effectiveFoliageDensity();
        const c0x = Math.floor(ox / CELL);
        const c1x = Math.floor((ox + span) / CELL);
        const c0z = Math.floor(oz / CELL);
        const c1z = Math.floor((oz + span) / CELL);
        // DER WALD PLANT IM TAKT (K69): der Gang liest die Zellen des Chunks samt ±2 (`_waldPflanzKasten`); fehlt eine, bestellt
        // er sie in der Schlange des Walds und wartet (`_waldPflanzWarten`) — sie pflanzt den Chunk, sobald sein Plan steht
        // (`_tickWaldPlan`). Bis K69 plante der Gang frische Zellen am Stück im Chunk-Bau (gehend ins Dorf 41 Zellen in EINEM
        // Takt, Null-Renderer). Vor der Wahrheit des Gesetzes (vorläufige Darts) und im synchronen Test-/Worldgen-Pfad
        // (`_vegSpawnImmediate`) plant er selbst.
        const ck = cx + "," + cz;
        if (this._forestGesetzWahr() && !this._vegSpawnImmediate) {
            this._forestDartStand(seedInt);
            if (!this._waldPlanKasten(...this._waldPflanzKasten(cx, cz))) {
                (this._waldPflanzWarten || (this._waldPflanzWarten = new Set())).add(ck);
                return 0;
            }
        }
        if (this._waldPflanzWarten) this._waldPflanzWarten.delete(ck);
        // Born-Dart-Memo (lokal je Aufruf → KEIN chunk-übergreifender mutabler Zustand →
        // Reihenfolge-Unabhängigkeit). `_forestCellDarts` ist rein → jede Zelle einmal.
        const memo = new Map();
        const cellDarts = (gx, gz) => {
            const k = gx + "," + gz;
            let d = memo.get(k);
            if (!d) {
                d = this._forestCellDarts(gx, gz, seedInt);
                memo.set(k, d);
            }
            return d;
        };
        let planted = 0;
        for (let gz = c0z; gz <= c1z; gz++) {
            for (let gx = c0x; gx <= c1x; gx++) {
                const own = cellDarts(gx, gz);
                for (const d of own) {
                    // Nur Darts, deren POSITION in DIESEN Chunk fällt (disjunkt → einmal).
                    if (d.x < ox || d.x >= ox + span || d.z < oz || d.z >= oz + span) continue;
                    if (!this._forestDartSteht(d, gx, gz, cellDarts)) continue;
                    if (this._tatAm("faellen", d.x, d.z)) continue; // die Tat bleibt (feld.K4): hier fiel der Baum, er heilt erst
                    // die Genesis-Lichtung hält die EINE Natur-Wand frei (`_naturSetzen`, die Plattform ist ein Grundriss)
                    // Dichte = die Vorlage: das Studio dünnt den Wald NIE (volle Dichte, Last über LOD + Sicht-Kappung).
                    // Im Studio-Regime ist fd=1 → dieser Check feuert nie; sonst dünnt der Perf-Regler.
                    if (fd < 1 && d.keep >= fd) continue;
                    // Der Baum wird ein ECHTER Architektur-Eintrag (spawnArchitecture über _enqueueVegetationSpawn) →
                    // harvestbar, kollidierbar, getaggt, LOD. Gespawnt wird die BASIS-Art (`d.sp`) + der Varianten-Index
                    // explizit, nie über `_growTreeBlueprintForSpawn` (baut ~170k-Geometrie eager). Der Render wählt die
                    // Quelle (Foundry, ohne Studio lazy `_buildVariantLODs`); die LOD-Identität (`_lodSpecies`/
                    // `_lodVariantIndex`) reist durch die Spawn-Opts — ohne sie kein L0/L1/L2/Impostor.
                    const regX = Math.floor(d.x / 256);
                    const regZ = Math.floor(d.z / 256);
                    const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                    const regionSeed = `${worldSeed}|${d.sp}|${regX},${regZ}`;
                    const variantIndex =
                        typeof this._treeVariantIndexFor === "function"
                            ? this._treeVariantIndexFor(d.sp, regionSeed)
                            : 0;
                    this._enqueueVegetationSpawn(
                        d.sp,
                        { x: d.x, y: d.surfaceY + 0.5, z: d.z },
                        {
                            seed: d.seed,
                            silent: true,
                            scale: d.s,
                            rotationY: d.rotY,
                            _lodSpecies: d.sp,
                            _lodVariantIndex: variantIndex,
                        }
                    );
                    planted++;
                    // Die Krone streut Laub, sobald der Baum als Eintrag steht (`spawnArchitecture`, Radius = die
                    // Kronen-Schüchternheit `_kronenRadiusFuer`) — nie schon beim Wurf.
                    // Die Scatter-Cell im Lookup REGISTRIEREN (species + variantIndex → der V18.221-Ω-H-
                    // Resolver mappt die Cell auf die reale Form) + den „tree"-Zähler ERHÖHEN (Cap-Wand).
                    if (this._scatterRegisterCell) {
                        this._scatterRegisterCell(d.x, d.z, "tree", d.sp, variantIndex);
                    }
                    if (this._scatterIncrementCounter) this._scatterIncrementCounter("tree");
                    // Totholz: ~TOTHOLZ_RATE der Bäume tragen einen gefallenen Stamm in 3–5 m Abstand. Im Studio-Regime
                    // AUS (Monolith-Regel ohne Studio-Gesetz, Fremd-Silhouette); foundry-aus prüft das Band über
                    // __anazhGateNoFoundry weiter.
                    if (d.totRoll < AnazhRealm.TOTHOLZ_RATE && !this._foundryEnabled()) {
                        const ang = d.rotY * 2.0;
                        const dist = 3 + d.keep * 2;
                        const tx = d.x + Math.cos(ang) * dist;
                        const tz = d.z + Math.sin(ang) * dist;
                        if (this._landAt(tx, tz, 0.4)) {
                            const tsy =
                                typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(tx, tz) : d.surfaceY;
                            this._enqueueVegetationSpawn(
                                "stamm_gefallen",
                                { x: tx, y: (Number.isFinite(tsy) ? tsy : d.surfaceY) + 0.5, z: tz },
                                {
                                    seed: (d.seed ^ 0x7c2b1a93) >>> 0,
                                    silent: true,
                                    scale: 0.85 + d.totRoll * 3,
                                    rotationY: ang,
                                }
                            );
                        }
                    }
                }
            }
        }
        // Strauch-Teppich (Studio-Gesetz buildForest): Sträucher auf einem bushStep-RASTER (±2 m Jitter) mit
        // gc.shrub = gauss(L, 0.4, 0.16) · (1−rk) · 0.42; bushStep = PORTAL_RENDER_CONFIG.understory.bushStep
        // (Vertrags-Default 4.4). Eingänge: L = _canopyLightAt, rk aus der Platzierungs-Slope, Pfad =
        // _pathFieldAt. Raster an Welt-Koords, Wurf per Positions-Hash (Γ5) → reihenfolge-unabhängig; ein über
        // die Chunk-Naht gejitterter Punkt FÄLLT (kein Doppel). Bedingungslos das EINE Busch-Gesetz.
        {
            const uCfg = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.understory;
            const bushStep = uCfg && Number.isFinite(uCfg.bushStep) ? uCfg.bushStep : 4.4;
            const GS = AnazhRealm.GRASS_SLOPE;
            const g0x = Math.ceil(ox / bushStep);
            const g1x = Math.ceil((ox + span) / bushStep) - 1;
            const g0z = Math.ceil(oz / bushStep);
            const g1z = Math.ceil((oz + span) / bushStep) - 1;
            for (let bgz = g0z; bgz <= g1z; bgz++) {
                for (let bgx = g0x; bgx <= g1x; bgx++) {
                    let hs = ((bgx * 73856093) ^ (bgz * 19349663) ^ seedInt ^ 0x5bd1e995) >>> 0 || 1;
                    const hrnd = () => {
                        hs = (hs + 0x6d2b79f5) >>> 0;
                        let t = hs;
                        t = Math.imul(t ^ (t >>> 15), t | 1);
                        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                    };
                    const bxp = bgx * bushStep + (hrnd() - 0.5) * 4.0; // Studio-Jitter ±2 m
                    const bzp = bgz * bushStep + (hrnd() - 0.5) * 4.0;
                    if (bxp < ox || bxp >= ox + span || bzp < oz || bzp >= oz + span) continue;
                    const bsy = this._voxelSurfaceY(bxp, bzp);
                    if (bsy === null || !Number.isFinite(bsy)) continue;
                    if (!this._landAt(bxp, bzp, 0.1)) continue;
                    const bFeuchte = this._feuchteAt ? this._feuchteAt(bxp, bzp, bsy) : 0;
                    const L = this._canopyLightAt(bxp, bzp, bsy, bFeuchte);
                    const slopeB = this._slopeAt(bxp, bzp);
                    const rk = Math.max(0, Math.min(1, (slopeB - GS.lo) / (GS.hi - GS.lo)));
                    const trail = this._pfadFeldAt(bxp, bzp, bsy);
                    const dL = L - 0.4;
                    const pShrub = Math.exp(-(dL * dL) / (2 * 0.16 * 0.16)) * (1 - rk) * 0.42 * (1 - trail * 0.92);
                    if (hrnd() >= pShrub) continue;
                    // Busch-Spawn-Name ist ein GEWACHSENER Bauplan: busch_hazel ist eine Grammatik-Spezies, kein Built-in
                    // — der Bauplan entsteht über den Richter (`_growTreeBlueprintForSpawn`, region-gecacht), der Render
                    // kommt aus der Foundry (busch_hazel→strauch). Ohne gewachsenen Key fällt der Punkt (kein Phantom).
                    let bushKey = null;
                    if (this._genVersion && this._genVersion() >= 4 && this._growTreeBlueprintForSpawn) {
                        const bRegX = Math.floor(bxp / 256);
                        const bRegZ = Math.floor(bzp / 256);
                        const bSeedW = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                        try {
                            bushKey = this._growTreeBlueprintForSpawn(
                                "busch_hazel",
                                `${bSeedW}|busch_hazel|${bRegX},${bRegZ}`
                            );
                        } catch (_gbe) {
                            bushKey = null;
                        }
                    }
                    if (!bushKey && this.state.blueprints && this.state.blueprints.busch_hazel) bushKey = "busch_hazel";
                    if (!bushKey) continue;
                    this._enqueueVegetationSpawn(
                        bushKey,
                        { x: bxp, y: bsy + 0.5, z: bzp },
                        {
                            seed: (hs ^ 0x2f6e2b1) >>> 0,
                            silent: true,
                            // Studio: SCALE.strauch × (0.8 + RNG()·0.5) — die Tabellen-Skala
                            // (0.332) trägt der Render-Pfad (V18.418), hier nur die Streuung.
                            scale: 0.8 + hrnd() * 0.5,
                            rotationY: hrnd() * Math.PI * 2,
                        }
                    );
                    planted++;
                }
            }
        }
        return planted;
    }

    // Landmark-Form: die Hangneigung wählt die Formations-Variante (steil → aufragend, flach → gedrungen).
    // Region-deterministisch (HISM-kohärent), Affinität unberührt; nur EINE Form im Pool → Region-Pick.
    _landmarkVariantIdx(prefix, n, regX, regZ, slope, worldSeed) {
        const g = this._rollGenome(`${worldSeed}|${regX},${regZ}`, `${prefix}-region`);
        const tall = (AnazhRealm.LANDMARK_TALL_FORMS && AnazhRealm.LANDMARK_TALL_FORMS[prefix]) || [];
        const wantTall = (slope || 0) > AnazhRealm.LANDMARK_SLOPE_TALL;
        const fit = [];
        for (let vi = 0; vi < n; vi++) {
            const vbp = this.state.blueprints && this.state.blueprints[`${prefix}_var${vi}`];
            if (vbp && tall.includes(vbp._formClass) === wantTall) fit.push(vi);
        }
        const choices = fit.length ? fit : null;
        return choices ? choices[g.int("pick", 0, choices.length - 1)] : g.int("pick", 0, n - 1);
    }

    // Stein-Geologie-Klasse (phytogenesis-placeRocks): FLACH → Findling, steil + hoch → Aufschluss (Grat),
    // steil + tief → Talus (Hang-Fuß), Mittelhang → kein Fels; Prüf-Folge Findling → Aufschluss → Talus.
    // Reine Funktion von (slope, relH) → Γ5-deterministisch.
    _rockGeologyClass(slope, relH) {
        const G = AnazhRealm.ROCK_GEOLOGY;
        const s = Number.isFinite(slope) ? slope : 0;
        const h = Number.isFinite(relH) ? relH : 0;
        if (s <= G.findlingSlopeMax) return "findling"; // flacher Grund
        if (s > G.aufschlussSlopeMin && h > G.aufschlussHeightMin) return "aufschluss"; // Fels bricht auf dem Grat durch
        if (s > G.talusSlopeMin) return "talus"; // Blockschutt am Steilhang-Fuß
        return null; // Mittelhang → kein Fels (die Nische trägt hier keinen Stein)
    }

    // V18.389 (P3) — die GRÖSSE folgt der Nische: Findling groß (Erratiker), Talus klein
    // (Schutt), Aufschluss mittel-groß. Deterministischer Wurf aus der Position (Γ5, kein
    // Math.random). `rng` = worldField.rngNoise (seed-gebunden).
    _rockGeologyScale(cls, rng, x, z) {
        const G = AnazhRealm.ROCK_GEOLOGY;
        let lo = 1,
            hi = 1;
        if (cls === "findling") {
            lo = G.findlingScaleLo;
            hi = G.findlingScaleHi;
        } else if (cls === "talus") {
            lo = G.talusScaleLo;
            hi = G.talusScaleHi;
        } else if (cls === "aufschluss") {
            lo = G.aufschlussScaleLo;
            hi = G.aufschlussScaleHi;
        }
        const t =
            rng && typeof rng.noise2D === "function" ? (rng.noise2D(x * 0.83 + 11.3, z * 0.83 - 7.1) + 1) / 2 : 0.5;
        return lo + (hi - lo) * (t < 0 ? 0 : t > 1 ? 1 : t);
    }

    // Fels-Variante, deren `_formClass` zur Nische passt (Findling→brocken, Talus→geroell, Aufschluss→
    // nadel/stapel); region-deterministisch, HISM-kohärent. Passt keine → reiner Region-Pick.
    _rockVariantForGeology(cls, regX, regZ, worldSeed) {
        const n = AnazhRealm.ROCK_VARIANTS;
        const forms = (AnazhRealm.ROCK_GEOLOGY_FORMS && AnazhRealm.ROCK_GEOLOGY_FORMS[cls]) || null;
        const g = this._rollGenome(`${worldSeed}|${regX},${regZ}`, `geology-${cls}`);
        const fit = [];
        for (let vi = 0; vi < n; vi++) {
            const vbp = this.state.blueprints && this.state.blueprints[`fels_var${vi}`];
            if (vbp && (!forms || forms.includes(vbp._formClass))) fit.push(vi);
        }
        const choices = fit.length ? fit : null;
        const idx = choices ? choices[g.int("pick", 0, choices.length - 1)] : g.int("pick", 0, n - 1);
        return `fels_var${idx}`;
    }

    _vegetationSampleSpawn(sampleX, sampleZ, surfaceY, seedForSpawn, tagsJe) {
        // Nichts wächst im Wasser (0.4 m Marge gegen knöcheltiefes Ufer). Eine Quelle: die Spalten-Probe `_nassAt` —
        // alle wasser-respektierenden Welt-Schichten lesen denselben Helfer.
        if (!this._landAt(sampleX, sampleZ, 0.4)) return 0;

        // Landmark-Pass: seltener, UNIFORMER Hash-Wurf. Eine Felsformation spawnt nur, wo die Region sie trägt
        // (dichte-getrieben); Bogen oder Turm entscheidet ein Hash-Münzwurf, kein Affinitäts-Wettstreit.
        const LANDMARK_RATE = 0.014;
        const BASE_RATE = 0.4;
        const AFFINITY_FLOOR = 0.18;
        // Kandidaten: alle Baumarten lesen dieselben Tags (holz+laub) → die Verteilung emergiert aus aff² ohne
        // Affinitäts-Verschiebung; die Variante (jung/normal/alt) wird seed-deterministisch NACH dem Sieg
        // gewählt. karst klettert Klippen (slopeMax 1.6). Büsche stehen NICHT hier — sie spawnen am Slot, wenn
        // der Baum scheitert (sonst verschöbe ihre Tag-Drift die Baum-Verteilung). baum_totholz fiel W1 aus den
        // Kandidaten: ein Baum-Sieg setzt hier keinen Baum (Wald-Marker, Bäume pflanzt `_forestPlantChunk`), gezeichnet
        // hat Totholz nur die Streu-Schicht litter — als belaubte Alias-Eiche (das Studio hat keinen Totholz-Körper).
        // Grammatik, Baum-Parameter und Tag-Variation der Art fielen 05.10. mit (gate:altlasten). Die Liste ist die EINE
        // der Würfe des Felds (`FELD_WURF`): was sie trägt, weicht dem Bau (`_weichtDemBau`).
        const candidates = AnazhRealm.FELD_WURF;
        // Nie Math.random im Worldgen: worldFieldAt() initialisiert state.worldField (inkl. rngNoise, seed-
        // gebunden) lazy — sonst würfelt jeder Peer anders (P2P-Drift).
        // Das Welt-Feld dieser Stelle EINMAL (es initialisiert auch den Rausch-Satz samt rngNoise): jede Affinität und
        // jeder Wald-/Busch-Wurf dieses Samples liest es.
        const welt = this.worldFieldAt(sampleX, sampleZ);
        const rng = this.state.worldField && this.state.worldField.rngNoise;
        // Γ1 — die FEUCHTE einmal pro Sample (surfaceY liegt hier schon vor;
        // der Bucket-Walk läuft 1× statt 1× je Kandidat) → alle Affinitäts-
        // Aufrufe dieses Samples lesen denselben Wert.
        const feuchte = this._feuchteAt(sampleX, sampleZ, surfaceY);
        const fw = Number.isFinite(feuchte) ? feuchte : this._feuchteAt(sampleX, sampleZ);
        // die Tags je Bauplan aus der Tafel des Chunks (`_populateVoxelChunkVegetation`), sonst einmal hier
        const tafel = tagsJe || new Map();
        const affinitaet = (name) => {
            const bp = this.state.blueprints && this.state.blueprints[name];
            if (!bp) return 0;
            let tags = tafel.get(bp);
            if (tags === undefined) tafel.set(bp, (tags = this.computeCompoundTags(bp)));
            return this._affinitaet(tags, welt, fw);
        };

        if ((seedForSpawn % 1000) / 1000 < LANDMARK_RATE) {
            const affBogen = affinitaet("felsbogen");
            const affTurm = affinitaet("felsturm");
            if (Math.max(affBogen, affTurm) >= AFFINITY_FLOOR) {
                const lmName = (seedForSpawn >>> 10) & 1 ? "felsturm" : "felsbogen";
                // Enqueue statt sofort spawnen: der Streaming-Pump öffnet 9+ Chunks mit je bis zu 64 Samples, jeder
                // Spawn kostet ~5-15 ms (Builder + Ammo-Body + BlockerAABBs + Remesh) → verteilt 4 Spawns/Frame.
                this._enqueueVegetationSpawn(
                    lmName,
                    { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
                    {
                        seed: seedForSpawn,
                        silent: true,
                    }
                );
                return 1; // an dieser Stelle keine zweite Struktur
            }
        }

        // Wurde diese Zelle schon promotet (ein REALER Baum lebt hier), wird sie übersprungen.
        if (this._scatterIsCellPromoted && this._scatterIsCellPromoted(sampleX, sampleZ, "tree")) {
            return 0;
        }
        // V18.220 — die CAP-Wand. Plan §13 (600k Tree / 700k Under / 1.5M Stone).
        // Bei einer CPU-First-Welt ist die echte Decke ~10k pro Layer — der Cap
        // schützt vor Memory-Explosion bei extremen Welten.
        if (this._scatterCounterAtCap && this._scatterCounterAtCap("tree")) {
            return 0;
        }

        // Streu-Pass: beste-Affinität-Bauplan an dieser Position.
        let bestName = null;
        let bestAffinity = 0;
        for (const name of candidates) {
            const aff = affinitaet(name);
            if (aff > bestAffinity) {
                bestAffinity = aff;
                bestName = name;
            }
        }
        if (!bestName || bestAffinity < AFFINITY_FLOOR) return 0;

        // Per-Spezies Slope-/Höhen-Toleranz aus SPECIES_TREE_PARAMS (frozen; z. B. Birke slopeMax 0.6, Tanne
        // heightRange [-30, 200]). Kein Eintrag (Landmarks) → kein Gate, die Affinitäts-Achsen entscheiden.
        const sParams2 = AnazhRealm.SPECIES_TREE_PARAMS && AnazhRealm.SPECIES_TREE_PARAMS[bestName];
        if (sParams2) {
            // Höhe relativ zur Terrain-Basis: aus heightRange [min, max].
            const baseH = this.state.terrainBaseHeight || 0;
            const relH = surfaceY - baseH;
            const hr = sParams2.heightRange;
            if (Array.isArray(hr) && hr.length === 2) {
                if (relH < hr[0] || relH > hr[1]) return 0;
            }
            // Slope: |∇surf| über 4m-Fenster. Eine echte Hang-Steilheit, NICHT
            // pro-Frame teuer (4× getTerrainHeightAt ≈ 4 Density-Samples).
            const slopeMax = +sParams2.slopeMax || 1.5;
            if (slopeMax < 1.5 && typeof this.getTerrainHeightAt === "function") {
                const hxp = this.getTerrainHeightAt(sampleX + 2, sampleZ);
                const hxn = this.getTerrainHeightAt(sampleX - 2, sampleZ);
                const hzp = this.getTerrainHeightAt(sampleX, sampleZ + 2);
                const hzn = this.getTerrainHeightAt(sampleX, sampleZ - 2);
                if (Number.isFinite(hxp) && Number.isFinite(hxn) && Number.isFinite(hzp) && Number.isFinite(hzn)) {
                    const dhx = (hxp - hxn) / 4;
                    const dhz = (hzp - hzn) / 4;
                    const slope = Math.sqrt(dhx * dhx + dhz * dhz);
                    if (slope > slopeMax) return 0;
                }
            }
        }

        // Bernoulli-Probe via deterministischer noise2D (Multi-User-safe).
        // Γ5 — rng ist oben garantiert initialisiert (worldFieldAt lazy); der alte
        // Math.random-Fallback ist GESTRICHEN (P2P-Drift-Klasse).
        const probe = (rng.noise2D(sampleX * 0.31, sampleZ * 0.31) + 1) / 2;
        // Wald-Dichte: Bäume sind in lebendig-hohen Regionen VIEL wahrscheinlicher → echte Wälder aus den
        // bestehenden, abbaubaren Bäumen (kein paralleles Deko-System); getragen von HISM-Instancing,
        // Lazy-Collision (< 40 m) und Distanz-Culling. Felsen/Geoden/Glutbrunnen bleiben spärliche Landmarken.
        const TREE_NAMES = new Set([
            "baum_eiche",
            "baum_kiefer",
            "baum_birke",
            "baum_erle",
            "baum_buche",
            "baum_tanne",
            "baum_karst", // V18.216 — Klippen-Baum, derselbe Wald-Masken-Boost
        ]);
        const isTree = TREE_NAMES.has(bestName);
        let chance = BASE_RATE * bestAffinity * bestAffinity;
        // Streu-Seltenheit aus der Vorlagen-Quelle (PORTAL_RENDER_CONFIG.placement.rarity, live): wie selten
        // Kristall-/Fels-Formationen streuen (kristalle 0.05 = fast nie), editierbar ohne Code.
        {
            const _rcP = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.placement;
            const _rar = _rcP && _rcP.rarity;
            if (_rar) {
                const _preset = typeof this._foundryPresetFor === "function" ? this._foundryPresetFor(bestName) : null;
                if (_preset && Number.isFinite(_rar[_preset])) chance *= Math.max(0, Math.min(1, _rar[_preset]));
            }
        }
        if (isTree) {
            const lebendig = welt.lebendig;
            chance = Math.min(0.4, BASE_RATE * bestAffinity * (0.4 + lebendig * 0.9));
            // Wald-Maske = die volle Platzierungs-Ökologie aus der EINEN Quelle `_placementDensityFactor` (Stand-
            // Klump × Slope-flach × Feuchte × Höhe × Perf): echte Wälder mit Rand + Lichtungen statt glatter
            // Gradienten; mittelwert-neutral, tag-neutral (chance-Skalar).
            const forest = this._placementDensityFactor(sampleX, sampleZ, surfaceY, "forest");
            chance = Math.min(0.5, chance * forest);
        }
        if (probe >= chance) {
            // Busch-Sub-Spawn: kippt der Baum-Slot (probe fail), versuche einen BUSCH an der Stelle — feuchte
            // Lücken → Farn, lebendige → Blume, sonst Hazel. BUSH_RATE skaliert mit lebendig; Büsche laufen durch
            // denselben gen ≥ 4 Wachstums-Pfad (Tag-Variation deklariert).
            if (isTree) {
                const BUSH_RATE = 0.18; // Erst-Wurf-Wert; browser-justierbar
                const bushProbe = (rng.noise2D(sampleX * 0.47 - 2.1, sampleZ * 0.47 + 6.3) + 1) / 2;
                const lebendig2 = welt.lebendig;
                // Der Unterwuchs folgt derselben Platzierungs-Ökologie über den ':meadow'-Stand (λ~40 m Dickicht) →
                // dicht in feuchten flachen Lücken, licht am Hang.
                const meadowF = this._placementDensityFactor(sampleX, sampleZ, surfaceY, "meadow");
                const bushChance = BUSH_RATE * (0.4 + lebendig2 * 0.9) * meadowF;
                if (bushProbe < bushChance) {
                    // Spezies-Wahl: Feuchte > 0.55 → Farn; sonst lebendig >
                    // 0.5 → Blume; sonst Hazel. Deterministisch über noise2D.
                    let bushName;
                    if (feuchte > 0.55) bushName = "farn_busch";
                    else if (lebendig2 > 0.5) bushName = "blume_gross";
                    else bushName = "busch_hazel";
                    // Slope/Höhen-Gate für die GEWÄHLTE Busch-Spezies (eigene
                    // SPECIES_TREE_PARAMS-Toleranz, Hazel klettert weiter als
                    // die Blume).
                    const bushParams = AnazhRealm.SPECIES_TREE_PARAMS && AnazhRealm.SPECIES_TREE_PARAMS[bushName];
                    if (bushParams) {
                        const baseH2 = this.state.terrainBaseHeight || 0;
                        const relH2 = surfaceY - baseH2;
                        const bhr = bushParams.heightRange;
                        if (Array.isArray(bhr) && bhr.length === 2) {
                            if (relH2 < bhr[0] || relH2 > bhr[1]) return 0;
                        }
                        const bushSlopeMax = +bushParams.slopeMax || 1.5;
                        if (bushSlopeMax < 1.5 && typeof this.getTerrainHeightAt === "function") {
                            const hxp = this.getTerrainHeightAt(sampleX + 2, sampleZ);
                            const hxn = this.getTerrainHeightAt(sampleX - 2, sampleZ);
                            const hzp = this.getTerrainHeightAt(sampleX, sampleZ + 2);
                            const hzn = this.getTerrainHeightAt(sampleX, sampleZ - 2);
                            if (
                                Number.isFinite(hxp) &&
                                Number.isFinite(hxn) &&
                                Number.isFinite(hzp) &&
                                Number.isFinite(hzn)
                            ) {
                                const dhx = (hxp - hxn) / 4;
                                const dhz = (hzp - hzn) / 4;
                                const slope = Math.sqrt(dhx * dhx + dhz * dhz);
                                if (slope > bushSlopeMax) return 0;
                            }
                        }
                    }
                    // gen ≥ 4: durch den Wachstums-Pfad (rich Grammar baut den
                    // Busch genauso wie einen Baum — multi-level branches +
                    // foliage at anchors). Region-cache pro Busch-Spezies.
                    const gV2 = this._genVersion ? this._genVersion() : 1;
                    let bushSpawnName = bushName;
                    let bushScale = 0.9 + ((rng.noise2D(sampleX * 0.59 + 1.7, sampleZ * 0.59 - 0.3) + 1) / 2) * 0.3;
                    const bushYaw = ((rng.noise2D(sampleX * 0.73 + 3.7, sampleZ * 0.73 - 1.9) + 1) / 2) * Math.PI * 2;
                    if (gV2 >= 4) {
                        const regX = Math.floor(sampleX / 256);
                        const regZ = Math.floor(sampleZ / 256);
                        const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                        const regionSeed = `${worldSeed}|${bushName}|${regX},${regZ}`;
                        const grownKey = this._growTreeBlueprintForSpawn(bushName, regionSeed);
                        if (grownKey) bushSpawnName = grownKey;
                    }
                    this._enqueueVegetationSpawn(
                        bushSpawnName,
                        { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
                        {
                            seed: seedForSpawn ^ 0x4d2a9b71, // eigener Suffix-Stream (Γ5)
                            silent: true,
                            scale: bushScale,
                            rotationY: bushYaw,
                        }
                    );
                    return 1;
                }
            }
            return 0;
        }

        // Gestalt + Größe + Rotation je Baum: der Affinitäts-Sieg (bestName) bleibt kanonisch (Verteilung
        // bit-identisch); danach wählen seed-deterministische Würfe Variante, Größe (±~40 %) und freie Yaw.
        // Felsen/Geoden drehen sich auch, behalten aber ihre eine Gestalt.
        let spawnName = bestName;
        let spawnScale = 1;
        let spawnYaw = 0;
        // Landmark-Genome: ist der Sieger ein Fels-/Kristall-/Glut-Wahrzeichen, wähle eine REGION-
        // deterministische Formation (ein Feld trägt EINEN Stil → HISM-Instancing wirkt). Die Gestalt kommt
        // NACH dem Sieg, der Name bleibt kanonischer Affinitäts-Träger (tag-frozen); je Stück scale/yaw.
        const landmarkPool = AnazhRealm.SCATTER_VARIANT_POOL && AnazhRealm.SCATTER_VARIANT_POOL[bestName];
        if (bestName === "stein_block") {
            // Geologie-Regel: der Fels folgt dem HANG (`_rockGeologyClass`) — Form-Klasse UND Größe (Findling
            // groß, Talus klein), Mittelhang ohne Fels. EINE Quelle: `_slopeAt` speist Nische, Form und Skala.
            const slopeR = typeof this._slopeAt === "function" ? this._slopeAt(sampleX, sampleZ) : 0;
            const baseHr = (this.state && this.state.terrainBaseHeight) || 0;
            const relHr = surfaceY - baseHr;
            const geoCls = this._rockGeologyClass(slopeR, relHr);
            if (!geoCls) return 0; // die Slope-Nische trägt hier keinen Stein (Mittelhang)
            const regX = Math.floor(sampleX / 256);
            const regZ = Math.floor(sampleZ / 256);
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            const key = this._rockVariantForGeology(geoCls, regX, regZ, worldSeed);
            if (key && this.state.blueprints && this.state.blueprints[key]) spawnName = key;
            // GRÖSSE nach Nische: Findling groß, Talus klein, Aufschluss aufragend.
            spawnScale = this._rockGeologyScale(geoCls, rng, sampleX, sampleZ);
        } else if (landmarkPool && landmarkPool.n > 0) {
            const regX = Math.floor(sampleX / 256);
            const regZ = Math.floor(sampleZ / 256);
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            // Die Form folgt dem Terrain (`_landmarkVariantIdx`): steil → aufragend (Nadel/Stapel/Druse/tiefe
            // Esse), flach → gedrungen (Brocken/Geröll/Cluster/Lava-See); der Region-Hash bricht Gleichstände
            // (HISM-kohärent). Affinität unberührt (Variante, nicht Art).
            const idx = this._landmarkVariantIdx(
                landmarkPool.prefix,
                landmarkPool.n,
                regX,
                regZ,
                this._slopeAt(sampleX, sampleZ),
                worldSeed
            );
            const key = `${landmarkPool.prefix}_var${idx}`;
            if (this.state.blueprints && this.state.blueprints[key]) spawnName = key;
        }
        if (isTree) {
            // Bäume kommen NICHT aus diesem per-Sample-Einzelsieger, sondern aus dem Wald-Generator
            // (`_forestPlantChunk`, aus `_populateVoxelChunkVegetation`) — EINE Quelle. Der Baum-Slot ist hier nur
            // Wald-Zonen-Marker; der Unterwuchs (probe-fail-Zweig oben) bleibt an diesem Sample-Raster.
            return 0;
        }
        // Yaw aus eigenen Seed-Bits — Bäume UND Felsen (alle ~radial-symmetrisch
        // im Footprint → der Quadrat-AABB der Kollision über-deckt; Gotcha).
        const yawRoll = (rng.noise2D(sampleX * 0.71 - 5.2, sampleZ * 0.71 + 3.9) + 1) / 2;
        spawnYaw = yawRoll * Math.PI * 2;

        this._enqueueVegetationSpawn(
            spawnName,
            { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
            {
                seed: seedForSpawn,
                silent: true,
                scale: spawnScale,
                rotationY: spawnYaw,
            }
        );
        // Kein Totholz hier: der Snag gehört zur Wald-Ökologie (`_forestPlantChunk`), nicht zum Fels-/
        // Landmark-Raster.
        return 1;
    }

    // Per-Frame-Spawn-Budget: die Pflanz-Schlange, `_tickPendingVegSpawns` arbeitet sie im Rang der Ankunft mit Frame-Limit ab;
    // Welt-Wechsel/Reload räumt sie. `this._vegSpawnImmediate === true` (Test/Worldgen) spawnt synchron.
    _enqueueVegetationSpawn(name, position, opts) {
        // Ein Wurf des Feldes (Wald, Unterholz, Totholz, Fels-Streu): wo die Wildnis nicht trägt, fällt er.
        if (!this._wildnisTraegt(position.x, position.z)) return;
        // DIE MARKE DES WURFS: was das Feld wirft, trägt sie (`feldWurf`, am Eintrag und im Save) — `_weichtDemBau` liest die
        // Herkunft, nie die Art (die Feuerstelle des Menschen ist Bau); der Wurf ist Gesetz (`ausGesetz`): der Boot wirft ihn neu
        opts = Object.assign({}, opts, { feldWurf: true, ausGesetz: true });
        if (this._vegSpawnImmediate) {
            this._naturSetzen(name, position, opts);
            return;
        }
        if (!this.state.pendingVegSpawns) this.state.pendingVegSpawns = [];
        this.state.pendingVegSpawns.push({ name, position, opts });
    }

    // DIE EINE WAND „Natur weicht dem Bau" (Welle L, Q5/Q15, Entscheid D3): JEDE Quelle der Natur setzt durch sie — Wald,
    // Unterholz, Totholz und Fels-Streu (`_enqueueVegetationSpawn`), der Hof-Baum, die Streu-Zelle jeder Schicht
    // (`_scatterPass`), ihre Promotion zum echten Baum (`_promoteScatterCell`), die Nah-Streu (`_nahStreuKachel`) und der
    // Hain der KI (`spawn_tree`, `spawn_studio`). Liegt der Ort in einem Grundriss (`_imGrundriss`: ein Haus, die Lichtung
    // der Genesis-Plattform — dort mit der Krone des Wurfs, `_naturKrone`), fällt der Wurf (null); sonst baut `setzen` (eine
    // Quelle mit eigenem Bau: Instanz-Slots, Kachel-Pflanze) bzw. der Architektur-Eintrag `name`. Was vor dem Bau stand,
    // räumt `_grundrissRaeumen`. Vorher wuchsen 7 Bäume in 5 von 8 Häusern des Start-Dorfs, eine Birke im Türblatt, Wildwald
    // in den Gassen der Stadt (N-D5, S-W4), und die Streu lief an der Wand vorbei; an der Genesis-Scheibe wich nur der Wald
    // (ein eigener Filter im Pflanz-Gang): 28 promotete Bäume, 23 Streu-Zellen, 4 Kachel-Pflanzen und der Hain der KI standen
    // über ihr (gate:haus-welt W8). `absage(wo)` hört, wo ein Wurf fiel ("haus" | "lichtung") — der Hain der KI und des
    // Chats sagt es laut (`_ergebnisSatz`), nie still „gewachsen". Seit Welle L Folge setzt auch der Spieler durch sie:
    // der Bau-Modus (`confirmBuild`) und sein Phantom (`tickBuildMode`, das Urteil `_naturWand`).
    _naturSetzen(name, position, opts, setzen, absage) {
        const wo = this._naturWand(name, position, opts);
        if (wo) {
            if (absage) absage(wo);
            return null;
        }
        // die Wurzel nennt ihre Absage durch dieselbe Absage (`opts.absage`)
        return setzen
            ? setzen()
            : this.spawnArchitecture(name, position, absage ? Object.assign({}, opts, { absage }) : opts);
    }

    // Das Urteil der Natur-Wand für einen Wurf an `position` ("haus" | "lichtung" | "wagen" | "wasser" | false) — der EINE Leser von
    // Grundriss und Krone; `_naturSetzen` setzt danach, das Bau-Phantom färbt sich danach. NATUR WEICHT DEM WASSER (Schau-2
    // wasser-wahrheit): ein benannter Wurf steht nie, wo sein Fuß kein Land ist (`_stammFussLand`: die Achse und der
    // Fuß-Kreis, 5 cm über dem Spiegel — der Wald plante bis dahin gegen den Bezug der Ufer-Bänder, das Bau-Phantom stand am
    // Fluss grün, und die Wand fragte bis zur Gegenprüfung nur die Achse). Die Nah-Streu (ohne
    // Namen) und die Nah-Wiese fragen beim Wurf dasselbe Urteil (`_nassAt` über ihrem gezeichneten Boden), ihr Schilf steht im
    // Ufer-Wasser.
    _naturWand(name, position, opts) {
        if (!position) return false;
        const g = this._ortWand(name, position, opts);
        if (g) return g;
        if (this._imWagen(position.x, position.z, 0.8)) return "wagen";
        return name && !this._stammFussLand(position.x, position.z, 0.05) ? "wasser" : false;
    }

    // DIE WAND DES ORTS (K20): der Grundriss (`_imGrundriss`, die Krone des Wurfs) — die Hälfte der Natur-Wand, die der Ort
    // trägt. Der Wagen fährt und das gezeichnete Wasser folgt dem Laden der Chunks: beide urteilen nur über das Setzen
    // (`_naturWand`); das Wasser des Gesetzes trägt schon der Dart (`planForestCell`). Leser: `_naturWand` und das Wald-Gesetz
    // des Solitärs (`_forestStehtFrei`), dessen Antwort `_ortGestaltSame` am Stand der Grundrisse merkt.
    _ortWand(name, position, opts) {
        return this._imGrundriss(position.x, position.z, 0.8, this._naturKrone(name, opts));
    }

    // Liegt (x, z) in der Hülle eines Studio-Wagens (+ `rand`, der Stamm; eine Krone darf über das Dach)? Ein Wagen ist Bau,
    // nie Natur — aber kein Grundriss: er fährt, kein Haus räumt (`_grundrissRaeumen`) die Natur aus ihm, nur die Natur-Wand
    // (`_naturWand`) wirft keinen Baum in ihn (K12 Fahr-Bahn — Befund: nach dem Platz des Vorschau-GT setzte die Wald-Schlange,
    // `_tickPendingVegSpawns`, eine Tanne 2,1 m vor seinen Ursprung, in die Hülle; W 2 s brachte 0,08 m). Je Frage zählt die
    // lebende Lage der Wagen (das Blocker-Netz, wenige je Welt).
    _imWagen(x, z, rand) {
        for (const w of this._blockerMit("moveable")) {
            if (!w._fahrAchseX || !w.position) continue;
            const dx = x - w.position.x;
            const dz = z - w.position.z;
            const u = this._fahrUmriss(w);
            if (dx * dx + dz * dz > (Math.max(u.bug, -u.heck) + u.hw + rand) ** 2) continue;
            const ry = Number.isFinite(w._rideYaw)
                ? w._rideYaw
                : (Number.isFinite(w.rotationY) ? w.rotationY : 0) + Math.PI / 2;
            const l = dx * Math.sin(ry) + dz * Math.cos(ry);
            const q = dx * Math.cos(ry) - dz * Math.sin(ry);
            if (l >= u.heck - rand && l <= u.bug + rand && Math.abs(q) <= u.hw + rand) return true;
        }
        return false;
    }

    // Steht der Fuß eines Stamms an (x, z) auf dem Land? Die Achse und acht Punkte auf dem Fuß-Kreis (`STAMM_FUSS_M`) fragen
    // das Land eines Werks (`_landAt`, `marge` m über dem Spiegel) — die Achse zuerst (der billige Beweis). Leser: die
    // Natur-Wand (`_naturWand`) und die Würfe des Satzes (`_dslSpawnStudioItems`).
    _stammFussLand(x, z, marge) {
        if (!this._landAt(x, z, marge)) return false;
        const R = AnazhRealm.STAMM_FUSS_M;
        for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4;
            if (!this._landAt(x + Math.cos(a) * R, z + Math.sin(a) * R, marge)) return false;
        }
        return true;
    }

    // Die Krone eines Natur-Wurfs in der Welt (m) — wie weit er über seinen Ort reicht: der EINE Kronen-Radius seiner Art
    // (`_kronenRadiusFuer`: `FOREST.crown[art] × Größe`, die Kronen-Schüchternheit T des Wald-Gesetzes) × die Welt-Skala der
    // Art (`_foundryWorldScaleMatrix`, dieselbe, mit der der Baum gezeichnet wird); 0 für alles ohne Krone. Die Art:
    // `_lodSpecies` (Wald, Eintrag), die gewachsene Art des Bauplans (Promotion: `grown_…` → `_grownSpecies`), sonst der
    // Name; die Größe: `scale` (Wurf-Optionen, Streu-Zelle oder Eintrag). Gemessen 06.10. (echte GPU, die weiteste
    // Ast-Spitze der gezeichneten Instanz): die Studio-Tanne trägt bei T 3,0 m Äste bis 11,7 m, die Fichte bei T 2,6 m bis
    // 13,2 m, die Birke bei T 3,6 m bis 12,4 m. Je Art einmal gerechnet (die Streu fragt je Zelle); die LIVE-Quelle der
    // Welt-Skala (`PORTAL_RENDER_CONFIG.placement`) und das Buch (seine Wald-Arten) leeren den Merker mit ihrer Identität.
    _naturKrone(name, o) {
        const bp = name && this.state.blueprints ? this.state.blueprints[name] : null;
        const art = (o && o._lodSpecies) || (bp && bp._isGrown && bp._grownSpecies) || name;
        if (!art) return 0;
        const rc = AnazhRealm._studioRenderConfig;
        const quelle = rc && rc.placement ? rc.placement : null;
        const buch = this._foundry ? this._foundry.recipes : null;
        if (!this._kroneWeltK || this._kroneWeltQuelle !== quelle || this._kroneWeltBuch !== buch) {
            this._kroneWeltK = new Map();
            this._kroneWeltQuelle = quelle;
            this._kroneWeltBuch = buch;
        }
        let k = this._kroneWeltK.get(art);
        if (k === undefined) {
            // jede Baum-Art trägt eine Krone: die des Wald-Gesetzes (phyto-core planForestCell: `FOREST.crown[art] || 4`) —
            // `_kronenRadiusFuer` kennt nur die Wald-Arten (die Kronen-Karte malt den Wald), die Streu-Bäume (Buche, Palme,
            // Zypresse, Karst) tragen die 4 m des Gesetzes
            const t = /^baum_/.test(art) ? this._kronenRadiusFuer(art, 1) || 4.0 : 0;
            k = t ? t * (this._foundryWorldScaleMatrix(this._foundryPresetFor(art)).elements[0] || 1) : 0;
            this._kroneWeltK.set(art, k);
        }
        return k > 0 ? k * (o && Number.isFinite(o.scale) && o.scale > 0 ? o.scale : 1) : 0;
    }

    // Liegt (x, z) in einem Grundriss (`_grundrissVon`) oder auf der Fläche eines Dorfs (`_aufWeg`)? Drei Arten tragen einen
    // Grundriss: die Häuser einer Siedlung (die gedrehte Box um ihre Mitte plus `rand` — der Stamm, die Traufe; eine Krone
    // darf über das Dach), jeder andere Bau (die Hülle seiner Blocker-Boxen, K52: Tor, Esse, Brunnen, der Würfel des Spielers)
    // und die Lichtung eines Baus, dessen Bauplan sie trägt (der Genesis-Platz: Scheibe und Ring der Tore plus die Reichweite
    // des Wurfs, `max(rand, krone)` — über ihm steht keine Krone). Das Gitter (32 m, Zahlen-Schlüssel — die Streu fragt je
    // Zelle) hält die Bauten, die Lichtungen stehen daneben (eine je Welt); es entsteht faul aus den Einträgen und fällt bei
    // jedem Spawn/Abriss eines Baus mit Grundriss. `ohne`: ein Eintrag, dessen eigener Grund nicht zählt (der Wurf, den die
    // Räumung fragt — `_naturRaeumen`). Rückgabe: "lichtung" | "haus" | "bau" | "weg" | false.
    _imGrundriss(x, z, rand = 0.8, krone = 0, ohne = null) {
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const schluessel = AnazhRealm._grundrissSchluessel;
        const gitter = this._grundrissStand();
        const reich = Math.max(rand, krone);
        for (const L of gitter.lichtungen) if ((x - L.x) ** 2 + (z - L.z) ** 2 < (L.r + reich) ** 2) return "lichtung";
        const l = gitter.zellen.size ? gitter.zellen.get(schluessel(Math.floor(x / G), Math.floor(z / G))) : null;
        if (l)
            for (const e of l) {
                if (e === ohne) continue;
                const fp = this._grundrissVon(e);
                if (!fp) continue;
                // die Hülle eines Baus liegt achsparallel in der Welt (`welt`), das Haus gedreht um seine Gier
                const ry = fp.welt ? 0 : Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const c = Math.cos(ry);
                const sn = Math.sin(ry);
                const dx = x - e.position.x;
                const dz = z - e.position.z;
                if (
                    Math.abs(dx * c - dz * sn - fp.ox) <= fp.ex + rand &&
                    Math.abs(dx * sn + dz * c - fp.oz) <= fp.ez + rand
                )
                    return fp.welt ? "bau" : "haus";
            }
        return this._aufWeg(x, z, rand, ohne && ohne._trittBox) ? "weg" : false;
    }

    // Liegt (x, z) auf einer Fläche, die ein Dorf dem Boden gibt (K52) — Straße, Feldweg, Platz, Anger, Acker, die
    // Trittfläche einer Ausstattung: die Formen der EINEN Wege-Karte (`wegeKarte.siedlungen`, je Siedlung ihre Hülle als
    // Vorfilter), dieselben Abstände, mit denen `_wegeKarteMale` den Boden malt, plus `rand` (der Stamm; eine Krone darf
    // über den Weg; der Gras-Anger trägt seine eigene Grenze `sperr`). Das Gesetzbuch des Dorfs pflanzt seine Bäume nach
    // derselben Regel neben Weg, Platz und Acker (fachwerk-core). Vorher urteilte nur die Wiese über den Weg: im Dorf der
    // Zelle −4,−4 standen 3 Tannen und 1 Birke auf seinen Wegen. Die Flächen stehen im Gitter der Grundrisse (`wege`, jede
    // Fläche mit 1 m Rand — der Stamm-Rand ist 0,8 m): die Frage kostet die Flächen ihrer Zelle, nie alle besuchten Dörfer.
    // `ohneFlaeche`: eine Fläche, die nicht zählt (die Trittfläche des Wurfs, den die Räumung fragt).
    _aufWeg(x, z, rand, ohneFlaeche = null) {
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const l = this._grundrissStand().wege.get(
            AnazhRealm._grundrissSchluessel(Math.floor(x / G), Math.floor(z / G))
        );
        if (!l) return false;
        for (const b of l) {
            if (b.quelle === ohneFlaeche) continue;
            if (x < b.x0 - rand || x > b.x1 + rand || z < b.z0 - rand || z > b.z1 + rand) continue;
            for (const f of b.formen)
                if (AnazhRealm._wegeFormAbstand(f, x, z) < (f.sperr !== undefined ? f.sperr : rand)) return true;
        }
        return false;
    }

    // Liegt (x, z) auf der Fläche eines Orts mit Rolle (w4-stadt-orte: der Rundkurs, das Gehege — die Formen der Wege-Karte, die
    // ihre Rolle tragen, `_stlWegeBuild`)? Die Rolle, sonst null. Dieselben Formen und dasselbe Gitter wie die Natur-Wand
    // (`_aufWeg`): wo die Natur dem Ort weicht, wirft auch das Feld nichts. Leser: die Engstelle des Orts der DSL (`dslEvalPos`,
    // jeder Ort, den der Nexus wählt).
    _ortRolleAt(x, z) {
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const l = this._grundrissStand().wege.get(
            AnazhRealm._grundrissSchluessel(Math.floor(x / G), Math.floor(z / G))
        );
        if (!l) return null;
        for (const b of l) {
            if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) continue;
            for (const f of b.formen) if (f.rolle && AnazhRealm._wegeFormAbstand(f, x, z) < 0) return f.rolle;
        }
        return null;
    }

    // DER STAND DER GRUNDRISSE (K20): das Gitter der Häuser, Bauten, Lichtungen und Dorf-Flächen, faul aus den Einträgen und
    // der Wege-Karte gebaut; es fällt bei jedem Spawn/Abriss eines Baus mit Grundriss und mit jeder Fläche, die die Wege-Karte
    // gewinnt oder verliert (K52), sein Objekt IST der Stand. Leser: `_imGrundriss` und wer eine Antwort merkt, die
    // durch die Natur-Wand geht (die Gestalt des Orts `_foundryGestaltFor`, die Streu-Gestalt `_scatterFoundrySeed`: ein
    // neues Haus über einem Nachbarn macht den Baum daneben frei).
    _grundrissStand() {
        if (this._grundrissGitter) return this._grundrissGitter;
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const gitter = (this._grundrissGitter = { zellen: new Map(), lichtungen: [], wege: new Map() });
        for (const e of this.state.architectures || []) {
            const fp = this._grundrissVon(e);
            if (!fp) continue;
            if (fp.lichtung) {
                gitter.lichtungen.push({ x: e.position.x, z: e.position.z, r: fp.lichtung });
                continue;
            }
            const r = Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
            for (let gx = Math.floor((e.position.x - r) / G); gx <= Math.floor((e.position.x + r) / G); gx++)
                for (let gz = Math.floor((e.position.z - r) / G); gz <= Math.floor((e.position.z + r) / G); gz++) {
                    const k = AnazhRealm._grundrissSchluessel(gx, gz);
                    let l = gitter.zellen.get(k);
                    if (!l) gitter.zellen.set(k, (l = []));
                    l.push(e);
                }
        }
        // die Flächen der Dörfer (`_aufWeg`): je Siedlung der Wege-Karte und Zelle die Formen, die sie mit 1 m Rand berühren
        // ({ quelle, Hülle, formen }) — bis stadt-erwachen stand die Hülle in jeder Zelle mit ALLEN Formen: im Dorf nH 300 (bis
        // 900 Formen) fragte jeder Punkt jede, die Räumung seiner Flächen (`_wegeRaeumen`) kostete den Takt nach dem Erwachen 73 ms
        const wk = this.state.wegeKarte;
        if (wk)
            for (const b of wk.siedlungen) {
                const je = new Map();
                for (const f of b.formen) {
                    const r = AnazhRealm._wegeFormRadius(f) + 1;
                    const [gx0, gx1] = [
                        Math.floor((Math.min(f.ax, f.bx) - r) / G),
                        Math.floor((Math.max(f.ax, f.bx) + r) / G),
                    ];
                    const [gz0, gz1] = [
                        Math.floor((Math.min(f.az, f.bz) - r) / G),
                        Math.floor((Math.max(f.az, f.bz) + r) / G),
                    ];
                    for (let gx = gx0; gx <= gx1; gx++)
                        for (let gz = gz0; gz <= gz1; gz++) {
                            const k = AnazhRealm._grundrissSchluessel(gx, gz);
                            let e = je.get(k);
                            if (!e) {
                                je.set(k, (e = { quelle: b, x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, formen: [] }));
                                const l = gitter.wege.get(k);
                                if (l) l.push(e);
                                else gitter.wege.set(k, [e]);
                            }
                            e.formen.push(f);
                        }
                }
            }
        return gitter;
    }

    // Natur nach ihrer ART am Eintrag (`_lodSpecies` des Walds, die Bauplan-Präfixe baum_/busch_/grown_, der Totholz-Stamm).
    _naturArt(e) {
        return !!e._lodSpecies || e.type === "stamm_gefallen" || /^(baum_|busch_|grown_)/.test(e.type);
    }

    // Ist der Eintrag Natur? Die Art steht am Eintrag (`_naturArt`) — unabhängig davon, ob das Studio-Buch schon geladen
    // ist; sonst trägt das Gesetzbuch des
    // Terrain-Studios seine Art (`terrain:PHYTO_PRESETS`: Baum, Strauch, Fels, Farn, Totholz …; der Kern ist Pflicht —
    // unlesbar ist ein lauter Bruch, nie ein stilles „keine Natur", das nichts mehr räumt). Tor und Wagen sind nie Natur
    // (sie tragen auch eine Impostor-Zeile — die frühere Frage `_foundryPresetIsTree` hätte sie geräumt).
    _istNatur(e) {
        if (!e || typeof e.type !== "string") return false;
        if (this._naturArt(e)) return true;
        const tab =
            AnazhRealm.Gesetz("terrain:PHYTO_PRESETS", null) || AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        const pr = this._foundryPresetForEntry(e);
        return !!(pr && Object.prototype.hasOwnProperty.call(tab, pr));
    }

    // DER EINE GRUNDRISS-LESER (siedlung.K3): die Fläche, auf der ein Bau steht — halbe Maße und Mitte, bau-lokal {ex, ez, ox,
    // oz} — aus jeder Quelle, die sie trägt. Bis siedlung-k3-hang lasen drei Leser dieselbe Zeile je auf ihre Art (der Slot,
    // der Eintrag, das Werk vor dem Bau). Der SLOT eines Exports: seine obb um ihre Mitte (Siedlungs-Rahmen wie slot.x/z; sie
    // liegt bis 1,8 m neben dem Haus-Ursprung, das Hof-Haus 4 m), gedreht in den Rahmen des Hauses. Das FUNDAMENT eines
    // Eintrags oder der Optionen eines Werks (die Siedlung reicht es aus der obb des Exports). Beide tragen `saum`: das Haus
    // eines Orts steht auf der Platte seines Erdbaus, dem Grundriss samt dem Saum des Orts-Gesetzes (fachwerk
    // `ORT_GESETZ.saumM`). Die HÜLLE eines Hauses, dann der Kern seiner TÜR-Zeile (`tuer` reist mit). Mit `art` (der Typ eines
    // Werks VOR seinem Bau, `seed` sein Same) spricht danach das Gesetzbuch der Architektur: ein HAUS misst seinen Mass-Bau
    // (fachwerk `massBau(hausParams(Rezept, Stempel))` mit der Gestalt seines Samens — dieselbe Zeile, aus der der Export sein
    // obb und seine Tür nimmt, und der Bau, den der Worker für diesen Samen baut: `_foundryVariantFor`), die AUSSTATTUNG ihre
    // Trittfläche (`fx.tritt` × Größe); beides × die Welt-Skala der Gestalt × die Größe, gemerkt je Gestalt, Same, Größe und
    // Stempel. Ohne `art` die LICHTUNG eines Baus, dessen Bauplan sie trägt (`lichtung`: die Genesis-Plattform, Befund V-D1):
    // der GENESIS-PLATZ, die Scheibe des Bauplans (cylinder, size.x = Durchmesser × die Größe des Eintrags) und der Ring der Tore
    // um sie (`GENESIS_PLATZ`: Kreis plus Tiefe eines Tors), `lichtung` = sein Radius (die Wand fragt dort die Krone) — oder,
    // für jeden anderen Bau, die Hülle seiner Blocker-Boxen (`welt`: achsparallel in der Welt, K52). Null für Natur, für was
    // fährt (der Wagen urteilt über `_imWagen`, er räumt nichts), für einen Bau ohne Boxen und ein Werk ohne Grundriss-Gesetz.
    _grundrissVon(e, art, seed) {
        if (!e) return null;
        const saum = globalThis.__fachwerkCore.ORT_GESETZ.saumM;
        const ob = e.obb;
        if (ob && Number.isFinite(ob.ex) && Number.isFinite(ob.ez) && ob.ex > 0 && ob.ez > 0) {
            const rc = Math.cos(e.phi || 0);
            const rs = Math.sin(e.phi || 0);
            const dxw = Number.isFinite(ob.cx) ? ob.cx - e.x : 0;
            const dzw = Number.isFinite(ob.cz) ? ob.cz - e.z : 0;
            return {
                ex: ob.ex,
                ez: ob.ez,
                ox: dxw * rc - dzw * rs,
                oz: dxw * rs + dzw * rc,
                saum,
                tuer: e.tuer || null,
            };
        }
        const f = e.fundament;
        if (f && Number.isFinite(f.ex) && Number.isFinite(f.ez))
            return {
                ex: f.ex,
                ez: f.ez,
                ox: Number.isFinite(f.ox) ? f.ox : 0,
                oz: Number.isFinite(f.oz) ? f.oz : 0,
                saum,
                tuer: e.tuer || null,
            };
        // DIE HÜLLE TRÄGT DEN GRUNDRISS (K16, gate:kamera-leib K2): ein Haus ohne Fundament-Zeile (gesetzt vom Spieler, der KI,
        // einer Probe) hatte keinen — die Natur wuchs hinein (eine Kiefer im haus_alemannisch der Mess-Wiese). Die festen Boxen
        // der Studio-Hülle (`_hausHuelleSetzen`) sind sein Grundriss, gemerkt je Hülle — vor dem Kern der Tür-Zeile, die die
        // Hülle dem Solo-Haus mitbringt (bauen.K5: der Hof des Hof-Hauses liegt außerhalb seines Kerns).
        const hu = e._hausHuelle;
        if (hu) {
            const m = e._grundrissHuelle;
            if (m && m.hu === hu) return m.fp;
            const fest = AnazhRealm._huelleVon(hu, "fest", "fachwerk:__huelle") || [];
            let x0 = Infinity,
                x1 = -Infinity,
                z0 = Infinity,
                z1 = -Infinity;
            for (const q of fest)
                if (q.art === "box") {
                    x0 = Math.min(x0, q.c[0] - q.h[0]);
                    x1 = Math.max(x1, q.c[0] + q.h[0]);
                    z0 = Math.min(z0, q.c[2] - q.h[2]);
                    z1 = Math.max(z1, q.c[2] + q.h[2]);
                }
            const k = Number.isFinite(e._hausHuelleSkala) ? e._hausHuelleSkala : 1;
            const fp =
                x1 > x0 && z1 > z0
                    ? {
                          ex: ((x1 - x0) / 2) * k,
                          ez: ((z1 - z0) / 2) * k,
                          ox: ((x0 + x1) / 2) * k,
                          oz: ((z0 + z1) / 2) * k,
                      }
                    : null;
            e._grundrissHuelle = { hu, fp };
            if (fp) return fp;
        }
        const t = e.tuer;
        if (t && Number.isFinite(t.W) && Number.isFinite(t.D))
            return { ex: t.W / 2, ez: t.D / 2, ox: 0, oz: 0, tuer: t };
        if (art !== undefined) {
            const g = this._grundrissGesetz(art);
            if (!g) return null;
            const { preset, pre, rec } = g;
            const same = Number.isFinite(seed) ? seed : e.seed;
            const gestalt = this._foundryVariantFor(Number.isFinite(same) ? same : 0, preset);
            if (gestalt == null) return null; // Buch kalt: kein Grundriss, kein Urteil (die Wurzel blockiert den Bau ohnehin)
            const ov = e.studioOv && typeof e.studioOv === "object" && !Array.isArray(e.studioOv) ? e.studioOv : null;
            const k =
                (this._foundryWorldScaleMatrix(preset).elements[0] || 1) *
                (Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1);
            const key = `${preset}|${gestalt}|${k}|${ov ? JSON.stringify(ov) : ""}`;
            const M = this._grundrissGesetzMerker || (this._grundrissGesetzMerker = new Map());
            if (M.has(key)) return M.get(key);
            let fp = null;
            if (rec.kind === "haus") {
                const hausParams =
                    AnazhRealm.Gesetz("fachwerk:hausParams", null) ||
                    AnazhRealm._kernPflichtBruch("fachwerk:hausParams");
                const massBau =
                    AnazhRealm.Gesetz("fachwerk:massBau", null) || AnazhRealm._kernPflichtBruch("fachwerk:massBau");
                const p = hausParams(pre, ov);
                if (!(ov && ov.seed != null)) p.seed = gestalt;
                const B = massBau(p);
                const x = B && B.ext;
                if (x && [x.x0, x.x1, x.z0, x.z1].every(Number.isFinite)) {
                    const dm = B.dims && B.dims.tuer;
                    fp = {
                        ex: ((x.x1 - x.x0) / 2) * k,
                        ez: ((x.z1 - x.z0) / 2) * k,
                        ox: ((x.x0 + x.x1) / 2) * k,
                        oz: ((x.z0 + x.z1) / 2) * k,
                        tuer:
                            dm && [dm.x, dm.z, dm.w].every(Number.isFinite)
                                ? { x: dm.x * k, z: dm.z * k, w: dm.w * k }
                                : null,
                    };
                }
            } else {
                const tr = pre.fx && pre.fx.tritt;
                const gr =
                    (ov && Number.isFinite(ov.groesse)
                        ? ov.groesse
                        : pre.s && Number.isFinite(pre.s.groesse)
                          ? pre.s.groesse
                          : 1) * k;
                if (tr && tr.typ === "kreis" && tr.r > 0)
                    fp = { ex: tr.r * gr, ez: tr.r * gr, ox: 0, oz: 0, tuer: null };
                else if (tr && tr.ex > 0 && tr.ez > 0)
                    fp = { ex: tr.ex * gr, ez: tr.ez * gr, ox: 0, oz: 0, tuer: null };
            }
            if (M.size >= 256) M.clear();
            M.set(key, fp);
            return fp;
        }
        if (!e.position) return null;
        const bp = this.state.blueprints ? this.state.blueprints[e.type] : null;
        if (bp && bp.lichtung) {
            const p0 = Array.isArray(bp.parts) && bp.parts[0] && bp.parts[0].size;
            const g = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
            const P = AnazhRealm.GENESIS_PLATZ;
            const r = Math.max(p0 && Number.isFinite(p0.x) ? (p0.x / 2) * g : 0, P.ringR + P.rand);
            return { ex: r, ez: r, ox: 0, oz: 0, lichtung: r };
        }
        // DER GRUNDRISS JEDES BAUS (K52): ein Tor, eine Esse, ein Brunnen, ein Marktstand, der Würfel des Spielers trugen
        // keinen — die Natur warf in sie (am Genesis-Ring ein Kristall 1,2 m vor dem Tor des Terrain-Studios). Die Hülle seiner
        // Blocker-Boxen (die Welt-AABB jeder Box) ist sein Grundriss, gemerkt je Box-Satz; die billigen Filter zuerst.
        const boxen = e.blockerAABBs;
        if (!boxen || !boxen.length) return null;
        const m = e._grundrissBoxen;
        if (m && m.satz === boxen) return m.fp;
        let fp = null;
        if (!(e.affordances && e.affordances.moveable) && !this._istNatur(e)) {
            let x0 = Infinity,
                x1 = -Infinity,
                z0 = Infinity,
                z1 = -Infinity;
            for (const b of boxen) {
                if (b.minX < x0) x0 = b.minX;
                if (b.maxX > x1) x1 = b.maxX;
                if (b.minZ < z0) z0 = b.minZ;
                if (b.maxZ > z1) z1 = b.maxZ;
            }
            if (x1 > x0 && z1 > z0)
                fp = {
                    ex: (x1 - x0) / 2,
                    ez: (z1 - z0) / 2,
                    ox: (x0 + x1) / 2 - e.position.x,
                    oz: (z0 + z1) / 2 - e.position.z,
                    welt: true,
                };
        }
        e._grundrissBoxen = { satz: boxen, fp };
        return fp;
    }

    // Ein Bau mit Grundriss steht: was die Natur schon in ihn geworfen hat, fällt — der Wald und die Streu standen oft vor
    // dem Dorf (das Auto-Dorf entsteht ab 260 m, die Streu-Region reicht 384 m), und ein älterer Stand trägt Bäume über der
    // Genesis-Scheibe. Natur-Einträge (`_istNatur`), die lebenden Streu-Zellen jeder Schicht (`_streuZelleRaeumen`) und die
    // Nah-Streu-Kacheln über dem Grundriss (sie bauen durch die Wand neu); an einer Lichtung mit der Krone (`_naturKrone`,
    // die Suche reicht eine Streu-Region weiter). Der billige Orts-Filter zuerst, die Art-Frage nur für Betroffene
    // (Lehre 25). Leser: `spawnArchitecture` (die Wurzel jedes Baus mit Grundriss), `_hausHuelleSetzen` (die Hülle bringt ihn)
    // und das Laden. Gibt die Zahl der geräumten
    // Natur-Stücke.
    _grundrissRaeumen(haus) {
        const fp = this._grundrissVon(haus);
        if (!fp) return 0;
        return this._naturRaeumen(
            haus.position.x,
            haus.position.z,
            fp.ex + fp.ez + Math.abs(fp.ox) + Math.abs(fp.oz) + 3,
            !!fp.lichtung,
            haus
        );
    }

    // DIE RÄUMUNG EINER FLÄCHE (K52): jede Natur im Quadrat ±r um (hx, hz), die die Natur-Wand dort nicht mehr setzte
    // (`_imGrundriss` — Grundriss, Lichtung samt Krone, Weg des Dorfs), fällt: Einträge, lebende Streu-Zellen, und die
    // Nah-Streu-Kacheln wachsen durch die Wand neu. Leser: `_grundrissRaeumen` (ein Bau) und `_wegeRaeumen` (die Fläche eines
    // Dorfs, im Takt der Wege-Karte). `mitKrone`: eine Lichtung fragt die Krone, die Suche reicht eine Streu-Region weiter.
    // `ausser` ist der Bau selbst. Ein Werk des Spielers (`werk`) weicht nie (`_weichtDemBau`, die Wiederkehr): bis dahin nahm
    // die Räumung es nach seinem Stoff und nannte es nur. Gibt die Zahl der geräumten Natur-Stücke.
    _naturRaeumen(hx, hz, r, mitKrone, ausser) {
        // die Welt regt sich, bevor geräumt wird: der Gang schreibt die Nah-Streu-Kacheln (`nahStreu.kacheln`, über
        // `_nahStreuKachelEntsorgen` ihren `zustand`) — die Stand-Wache weckt die Fege-Takte (gate:stand-takt, Schreiber-Wand)
        this._weltRegt();
        const RM = AnazhRealm.SCATTER.regionM;
        const weit = mitKrone ? RM : 0; // eine Krone reicht nie über eine Streu-Region
        this._grundrissFaellt(hx - r - weit, hz - r - weit, hx + r + weit, hz + r + weit);
        const weg = [];
        // die Nähe aus dem Platz-Netz (`_blockerUmPlatz`, eine Obermenge des Quadrats), nie der ganze Bestand
        for (const e of this._blockerUmPlatz(hx, hz, r + weit, [])) {
            if (e === ausser || !e.position) continue;
            if (Math.abs(e.position.x - hx) > r + weit || Math.abs(e.position.z - hz) > r + weit) continue;
            if (!this._weichtDemBau(e)) continue;
            const k = mitKrone ? this._naturKrone(e.type, e) : 0;
            // ein Wurf mit eigenem Grund (die Feuerstelle: ihr Grundriss, ihre Trittfläche) liegt nie in sich selbst
            if (!this._imGrundriss(e.position.x, e.position.z, 0.8, k, e)) continue;
            weg.push(e);
        }
        // die Natur weicht still (speicher.K3): kein Verlust im Tagebuch, kein Abschied — bis hier füllten die Räumungen der Orte
        // am Weg das Tagebuch (5 km: 170 von 200 Einträgen „Struktur wurde abgebaut", die Genesis fiel aus dem Deckel)
        for (const e of weg) this.removeArchitecture(e, { still: true });
        // DAS TIER IM BAU: ein Wurf des Felds, geboren vor dem Bau, steht nie in ihm (`_weichtDemBau`) — vorher umschloss das
        // Haus die Herde, der Erdbau des Kellers nahm ihr den Boden (gate:haus-welt W10: 3 Hirsche im Keller des
        // haus_provenzalisch, einer auf der Diele, der Gang schob sie vor sich her und riss). Auf dem Weg geht ein Tier weiter.
        const fallen = [];
        for (const c of this.state.creatures || []) {
            if (!c || !c.position || Math.abs(c.position.x - hx) > r + weit || Math.abs(c.position.z - hz) > r + weit)
                continue;
            const wo = this._weichtDemBau(c) ? this._imGrundriss(c.position.x, c.position.z, 0) : false;
            if (wo && wo !== "weg") fallen.push(c);
        }
        for (const c of fallen) this.removeCreature(c);
        let n = weg.length;
        const map = this.state.scatterRegions;
        if (map && map.size) {
            for (let rx = Math.floor((hx - r - weit) / RM); rx <= Math.floor((hx + r + weit) / RM); rx++)
                for (let rz = Math.floor((hz - r - weit) / RM); rz <= Math.floor((hz + r + weit) / RM); rz++) {
                    const region = map.get(`${rx},${rz}`);
                    if (!region || !Array.isArray(region.cells)) continue;
                    for (const cell of region.cells) {
                        if (!cell.slots && !cell.feld) continue;
                        if (Math.abs(cell.x - hx) > r + weit || Math.abs(cell.z - hz) > r + weit) continue;
                        const k = mitKrone ? this._naturKrone(cell.species, cell) : 0;
                        if (!this._imGrundriss(cell.x, cell.z, 0.8, k)) continue;
                        this._streuZelleRaeumen(cell);
                        n++;
                    }
                }
        }
        const ns = this.state.nahStreu;
        if (ns && ns.kacheln.size) {
            const K = AnazhRealm.NAH_STREU.kachel;
            for (let tx = Math.floor((hx - r) / K); tx <= Math.floor((hx + r) / K); tx++)
                for (let tz = Math.floor((hz - r) / K); tz <= Math.floor((hz + r) / K); tz++) {
                    const k = ns.kacheln.get(`${tx},${tz}`);
                    if (!k) continue;
                    this._nahStreuKachelEntsorgen(k);
                    ns.kacheln.delete(k.key);
                }
        }
        return n;
    }

    // DIE FLÄCHEN EINES DORFS RÄUMEN (K52): jede neue Fläche der Wege-Karte (Weg, Platz, Anger, Acker einer Siedlung —
    // `_stlWegeBuild`; die Trittfläche einer Ausstattung — `_trittFlaecheSetzen`) wartet in `wegeKarte.raeumen`, bis der
    // Takt der Wege-Karte sie räumt (`_naturRaeumen` über ihre Hülle): die Trittfläche entsteht im Instanz-Pfad, mitten im
    // Gang über die Bauten. Die Wand (`_aufWeg`) gilt der Fläche sofort; geräumt wird, was schon vor ihr stand.
    _wegeRaeumen() {
        const wk = this.state.wegeKarte;
        if (!wk || !wk.raeumen.length) return 0;
        let n = 0;
        for (const b of wk.raeumen.splice(0))
            n += this._naturRaeumen(
                (b.x0 + b.x1) / 2,
                (b.z0 + b.z1) / 2,
                Math.max(b.x1 - b.x0, b.z1 - b.z0) / 2 + 1,
                false,
                null
            );
        return n;
    }

    // Eine Streu-Zelle verlässt die Welt (ihr Ort liegt im Grundriss eines Hauses): ihre Instanz-Slots, ihr Gesetz-Platz,
    // ihre Krone in der Kronen-Karte und ihr Lookup-Eintrag fallen; slot-los promotet und wechselt sie nie mehr die Stufe
    // (Promotion und LOD-Takt überspringen `!cell.slots`). Der Neubau der Region setzt durch die Wand (`_scatterPass`).
    _streuZelleRaeumen(cell) {
        this._scatterFreeSlots(cell.slots);
        cell.slots = null;
        if (cell.feld) {
            this._scatterFeldFrei(cell.feld);
            cell.feld = null;
        }
        cell.bpName = null;
        const layerName = cell.layer || "tree";
        if (cell.promotable) {
            this._kronenStreuWeg(`s:${layerName}:${cell.cellX},${cell.cellZ}`);
            if (this.state.scatterLookup)
                this.state.scatterLookup.delete(this._scatterCellKeyAt(cell.x, cell.z, layerName));
        }
    }

    // Setzt bis zu maxPerFrame Bäume der Schlange je Takt (`_naturSetzen`): 4/Frame ≈ 20-25 ms statt 200-500-ms-Burst.
    // DER EINE RANG DER ANKUNFT (`_foundryAuftragD2`, Lehre 25): jeder Griff nimmt den Baum mit dem kleinsten Rang — vor dem
    // ersten Weltbild der Blick zuerst, danach nah zuerst rundum; je Baum EINMAL je Takt gerechnet. Als FIFO stellte die
    // Schlange einen spät gesäten Baum der Mesh-Zone hinter alle fernen (zur Kontrolle des ersten Bilds 560–620 Bäume
    // jenseits der Mesh-Zone, 4 je Takt): CI Gruppe 1 sah der Rundblick ihn hinter dem Spieler bei 195°, rundum ganz erst
    // in Takt 71–80 (gate:ankunft L2a). Im Lade-Takt setzt sie bis zur Frist des Lade-Frames (`_kappeOffen`, mindestens
    // `maxPerFrame`): die gepflanzten Bäume im Bild gehören ins erste Weltbild (`_weltbildFehlt`).
    _tickPendingVegSpawns(maxPerFrame = 4) {
        const queue = this.state.pendingVegSpawns;
        if (!queue || queue.length === 0) return 0;
        const rang = [];
        let spawned = 0;
        for (let i = 0; this._kappeOffen(i, maxPerFrame) && queue.length > 0; i++) {
            // ein Wurf, der während des Takts dazukam, trägt seinen Rang ab hier
            for (let j = rang.length; j < queue.length; j++)
                rang.push(this._foundryAuftragD2(queue[j] && queue[j].position));
            let k = queue.length - 1;
            for (let j = k - 1; j >= 0; j--) if (rang[j] < rang[k]) k = j;
            // vor dem ersten Weltbild setzt sie nur Bäume im Blick (`_rangImErstenBlick`), die übrigen setzt der Nachlauf
            if (!this._rangImErstenBlick(rang[k])) break;
            const task = queue[k];
            queue[k] = queue[queue.length - 1];
            rang[k] = rang[rang.length - 1];
            queue.pop();
            rang.pop();
            if (!task) continue;
            this._naturSetzen(task.name, task.position, task.opts);
            spawned++;
        }
        return spawned;
    }

    // DIE BEPFLANZUNG WARTET AUF DAS BUCH (Kristall-Rennen, OMEN 17.10., Zweig koordination): läuft die Foundry, liest jede
    // Streu-Probe die Wahrnehmung des Studios (placement.rarity, `_studioRenderConfig`), die erst das Buch bringt — ein Chunk
    // vor dem Buch streute ohne Seltenheit (Kristalle 20x zu oft: Genesis 347 statt 2). Er wartet in `pendingFoliageChunks`,
    // `_tickFoliageGrowth` pflanzt ihn nach dem Buch. Ohne Foundry (Test-Haken `__anazhGateNoFoundry`) kommt kein Buch.
    _bepflanzungWartet() {
        return !AnazhRealm._studioRenderConfig && this._foundryEnabled();
    }

    // Streu-Strukturen eines Voxel-Chunks (Felsen/Geoden/Glutbrunnen/Formationen + Unterwuchs): Sample-
    // Raster über die Chunk-Bounds (`span`, origin-basiert) durch `_vegetationSampleSpawn`, Höhe aus
    // `_voxelSurfaceY`; die Bäume pflanzt `_forestPlantChunk`. Idempotent über
    // `state.voxelPopulatedChunks`, am Voxel-Chunk-Lifecycle aufgehängt.
    // DIE SAAT IM TAKT (pbk4-fahrt, Lehre 14): der Chunk tritt in die Saat (`_saatOffen`), und `_tickSaat` sät ihn Probe für
    // Probe im Budget des Frames — der Rest im Job des Walds (Welt-Substanz, nie verhungert); headless (Budget ∞) und
    // `opts.immediate` (Test-/Worldgen-Pfade) säen ihn ganz. Bis pbk4-fahrt säte der Chunk-Einbau 100 Proben und den Wald am
    // Stück (Mess-Wiese, GT 20 m/s: 22,9 ms je Takt ab p95, `werkbank takt`). Rückgabe: die Zahl der gesäten Stücke.
    _populateVoxelChunkVegetation(cx, cz, opts = {}) {
        if (!this.state.scene || !this.state.blueprints) return 0;
        if (!this.state.voxelPopulatedChunks) this.state.voxelPopulatedChunks = new Set();
        const key = `${cx},${cz}`;
        if (this.state.voxelPopulatedChunks.has(key)) return 0;
        this.state.voxelPopulatedChunks.add(key);
        const S = this._saatOffen || (this._saatOffen = new Map());
        S.set(key, { cx, cz, i: 0 });
        if (opts.immediate) return this._tickSaat(Infinity, key, true);
        const B = this.state._frameBudget;
        return this._tickSaat(B ? performance.now() + B.remainingMs() : Infinity, null, false);
    }

    // Sät bis zur Frist (`frist`, performance.now()): je Schritt eine Probe des 10×10-Rasters, nach der letzten der Wald
    // des Chunks; nah zuerst (`_foundryAuftragD2`), im Lade-Takt bis zur Frist des Lade-Frames. `nur`: nur dieser Chunk,
    // `sofort`: die Stücke umgehen die Spawn-Schlange (`_vegSpawnImmediate`). Leser: die Bepflanzung des Chunks und der
    // Job des Walds (`waldPlan`, der mindestens einen Schritt geht). → die Zahl der gesäten Stücke.
    _tickSaat(frist, nur, sofort, mindestens = 0) {
        const S = this._saatOffen;
        if (!S || !S.size) return 0;
        frist = Math.max(frist, this._ladeFrist());
        const { span } = this._voxelChunkConfig();
        const SAMPLES = 10;
        const step = span / SAMPLES;
        const reihe = nur ? [S.get(nur)] : [...S.values()];
        if (!nur && reihe.length > 1) {
            const d2 = (c) => this._foundryAuftragD2({ x: (c.cx + 0.5) * span, z: (c.cz + 0.5) * span });
            for (const c of reihe) c.d2 = d2(c);
            reihe.sort((a, b) => a.d2 - b.d2);
        }
        const prevImmediate = this._vegSpawnImmediate || false;
        this._vegSpawnImmediate = !!sofort;
        let spawned = 0,
            n = 0;
        // die Bauplan-Tags je Ruf EINMAL (Pläne und Stoffe ändern sich in diesem synchronen Lauf nicht)
        const tagsJe = new Map();
        try {
            for (const c of reihe)
                while (n < mindestens || performance.now() < frist) {
                    n++;
                    if (c.i === SAMPLES * SAMPLES) {
                        // Die Bäume pflanzt der Wald-Generator (`_forestPlantChunk`, zell-deterministisch: Poisson-Disc +
                        // Nische + reverse-J + Dichte-Gradient), nicht das Sample-Raster. Jeder Baum gehört genau dem Chunk
                        // seiner Position → genau einmal.
                        S.delete(`${c.cx},${c.cz}`);
                        spawned += this._forestPlantChunk(c.cx, c.cz);
                        break;
                    }
                    const xi = c.i % SAMPLES,
                        zi = (c.i / SAMPLES) | 0;
                    c.i++;
                    const sampleX = c.cx * span + (xi + 0.5) * step;
                    const sampleZ = c.cz * span + (zi + 0.5) * step;
                    const surfaceY = this._voxelSurfaceY(sampleX, sampleZ);
                    if (surfaceY === null || !Number.isFinite(surfaceY)) continue;
                    const seedForSpawn = ((c.cx * 73856093) ^ (c.cz * 19349663) ^ (xi * 83492791) ^ (zi * 11)) >>> 0;
                    spawned += this._vegetationSampleSpawn(sampleX, sampleZ, surfaceY, seedForSpawn, tagsJe);
                }
        } finally {
            this._vegSpawnImmediate = prevImmediate;
        }
        return spawned;
    }

    // ### emergente Welt-Effekte ###
    // Ein gebauter Compound mit hoher Resonanz + Präzision lässt die Welt klingen + erinnert sich; hohe
    // Magieleitung wirft eine Emotion-Welle (awe + hope). One-shot pro Bauplan (kein Spawn-Spam);
    // Schwellen zentral in WORLD_EFFECT_THRESHOLDS.
    _applyCompoundWorldEffects(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return;
        // Welt-Effekte lesen räumlich angereicherte Tags (computeSpatialTags: Spitze richtet, Kontakt
        // überträgt) statt der atomaren MAX-Aggregation; computeCompoundTags bleibt die Basis für UI/Tests.
        const tags = this.computeSpatialTags(bp);
        const avgPrec = this._compoundAvgPrecision(bp);
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        // Präzision moduliert ALLE Effekt-Stärken (gleiches Material, 0.4 vs 0.97 Präzision → schwächer vs
        // stärker). Min-Faktor 0.3: raue Arbeit trägt etwas, bricht aber unter der Schwelle ab.
        const precisionFactor = Math.max(0.3, avgPrec);
        const resonates = (tags.resoniert || 0) >= T.resonance_strong;
        const magicConducts = (tags.magieleitung || 0) * precisionFactor >= T.magic_strong;
        const isPrecise = avgPrec >= T.precision_high;

        if (resonates && isPrecise) {
            this.journalAppendOnce(
                `singing:${blueprintName}`,
                "growth",
                AnazhRealm._datum`Eine Form singt: ${bp.label || blueprintName} schwingt rein im Klang.`,
                { blueprint: blueprintName, resonance: tags.resoniert, precision: avgPrec }
            );
            // Die Form singt: eine reine Sinus-Welle, die Tonhöhe folgt der Resonanz (klang:SUBSTANZ.singen) — am
            // Master (vorher am Ausgang vorbei: der Master-Regler erreichte sie nie).
            this._substanzKlang("singen", tags);
        }

        if (magicConducts && this.state.player && this.state.player.emotions) {
            this.state.player.emotions.awe = Math.min(1, (this.state.player.emotions.awe || 0) + 0.1);
            this.state.player.emotions.hope = Math.min(1, (this.state.player.emotions.hope || 0) + 0.1);
            this.journalAppendOnce(
                `magic_compound:${blueprintName}`,
                "growth",
                AnazhRealm._datum`Etwas Magisches in der Luft, als ${bp.label || blueprintName} entstand.`,
                { blueprint: blueprintName, magic: tags.magieleitung }
            );
        }

        // Brech-Warnung: liegt IRGENDEINE Verbindung unter 0.7, gibt es einen einmaligen Journal-Eintrag
        // (idempotent je Bauplan-Name); die rote Linie ist das visuelle Pendant. Nur Warnung.
        if (Array.isArray(bp.connections) && bp.connections.length > 0) {
            let weakest = Infinity;
            let weakestType = null;
            for (const c of bp.connections) {
                const s = this.computeConnectionStrength(c, bp);
                if (s < weakest) {
                    weakest = s;
                    weakestType = c.type;
                }
            }
            if (weakest < 0.7 && weakestType) {
                this.journalAppendOnce(
                    `weak_connection:${blueprintName}`,
                    "weakness",
                    AnazhRealm._datum`Eine ${weakestType}-Verbindung in „${bp.label || blueprintName}" trägt knapp (Last ${weakest.toFixed(2)}).`,
                    { blueprint: blueprintName, weakest: weakest, type: weakestType }
                );
            }
        }
    }

    // Pro-Frame-Tick: animate() auf jeder Struktur mit Mesh + animate-Hook; cold (mesh=null) übersprungen.
    // Architektur-Idle (Mühlen drehen, Banner flattern): je Architektur EINMAL lazy klassifiziert
    // (`_idleMotion` über `computeMotionRoles` mit den Bauplan-Verbindungen), gefiltert auf SICHERE Rollen
    // — NUR rad/segel/tuer/wirbel; bein/arm/kopf-Resonanz wackelt NIE (eine Statue läuft nicht).
    tickArchitectures(currentTime) {
        const list = this.state.architectures;
        if (!list || list.length === 0) return;
        const tSec = currentTime / 1000;
        const mountedId = this.state.player && this.state.player.mountedArch;
        for (const entry of list) {
            if (!entry.mesh || !entry.mesh.userData) continue;
            // V18.150 — das GERITTENE Gefährt animiert der Fahr-Tick
            // (_tickMountedMovement: Phase ∝ Weg) — der Idle-Animator
            // pausiert dafür (sonst überschrieben sich beide pro Frame).
            if (mountedId !== null && mountedId !== undefined && entry.id === mountedId) continue;
            if (typeof entry.mesh.userData.animate === "function") {
                entry.mesh.userData.animate(currentTime);
            }
            if (entry.mesh.userData._idleMotion === undefined) {
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                const roles =
                    bp && Array.isArray(bp.parts) && bp.parts.length >= 2
                        ? this.computeMotionRoles(bp.parts, bp.connections)
                        : null;
                const idle = roles
                    ? roles.map((r) =>
                          r && (r.role === "rad" || r.role === "segel" || r.role === "tuer" || r.role === "wirbel")
                              ? r
                              : null
                      )
                    : null;
                entry.mesh.userData._idleMotion = idle && idle.some(Boolean) ? idle : null;
            }
            if (entry.mesh.userData._idleMotion) {
                this._animateCompoundMotion(entry.mesh, entry.mesh.userData._idleMotion, tSec, 0, false);
            }
        }
    }

    // Distanz-Culling: Daten-Einträge bleiben immer, nur die GPU-Last ist begrenzt — in Reichweite ohne
    // Mesh → bauen, außerhalb mit Mesh → disposen. So kann der Spieler unbegrenzt bauen.
    tickArchitectureCulling() {
        // Der Scan läuft je Frame (Distanz-Checks trivial), die teuren Builds sind auf
        // `architectureBuildBudgetPerFrame` gedeckelt (sonst baut ein Tick beim Eintritt in eine dichte Region
        // alles auf einmal). Cull (fern) ist billig → ungedeckelt.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!playerPos) return;
        // DIE STAND-WACHE: ging der Gang über alle Einträge ohne Bau, Räumung und Wartende, und regt sich nichts (Ort,
        // Bau-Menge, Ankunft, Cull-Radius), träfe er dieselben Urteile — kein Gang (gemessen 07.10., Mess-Wiese, Stand:
        // 1540 Einträge je Takt, 0 Bauten, 0 Räumungen).
        if (this._standRuht("archCull", 1, { pos: playerPos, rand: AnazhRealm.STAND_RAND_FERN_M }, "bau")) return;
        let regung = 0;
        const radius = this.state.architectureCullingRadius;
        const radiusSq = radius * radius;
        // Kollision ist feld-nativ (`entry.blockerAABBs` ab Spawn) → der Cull-Tick steuert NUR das Rendern,
        // keine Ammo-Bodies. Über Budget (_frameOverBudget) → 0 Bauten, bei Kopfraum der geregelte Durchsatz:
        // die Welt wächst in den Lücken, nie auf Kosten des Spielers. Das Cullen läuft weiter (billig).
        const budget = this.state._frameOverBudget ? 0 : Math.max(1, this.state.architectureBuildBudgetPerFrame || 3);
        let built = 0;
        const ziegelOffen = this._archZiegelOffen || (this._archZiegelOffen = []);
        const nahOffen = this._archNahOffen || (this._archNahOffen = []);
        const ohneFeld = !!(this.state.renderer && this.state.renderer._isHeadlessNull); // Null-Renderer: kein Feld
        // DER KARTEN-HORIZONT: die Karte eines gesetzten Karten-Dings trägt bis zu SEINEM Rand (`_archKartenHorizont`, im
        // Saum vor `SCATTER.outerM`, dem Rand der Deko-Streu); geräumt wird erst ein Totband dahinter (kein Flattern).
        const totband = AnazhRealm.KARTEN_HORIZONT_TOTBAND_M;
        const saumSq = (AnazhRealm.SCATTER.outerM - AnazhRealm.KARTEN_HORIZONT_SAUM_M) ** 2;
        // DIE WACHE DES CULLS (pbk4-fahrt, Gebot 7): der Gang geht die WACHEN Einträge (`_cullWache`), nie den Bestand. Ein
        // Eintrag, dessen Urteil steht (nichts offen, kein Mesh der Mesh-Zone, kein Beweger), schläft, bis der Weg des Spielers
        // (samt dem Wachsen des Radius) seinen Abstand zur nächsten Urteils-Grenze aufbraucht — gezeichnete Karte bis hinter das
        // Totband, ungezeichnete bis an ihren Rand, ein ferner Satz bis an den Radius; was sein Urteil liest (Stufe gezeichnet,
        // Typ, Lage, Satz, Buch), weckt ihn (`_cullWecken`). Bis pbk4-fahrt ging jeder Gang jeden Eintrag des Bestands, der mit
        // dem gefahrenen Weg wächst (Mess-Wiese, GT 20 m/s, 60 s: 868 → 3 859 Einträge, der Gang 2,9 ms bei 4 953, `werkbank takt`).
        const K = this._cullWache();
        K.odo += K.px === null ? 0 : Math.hypot(playerPos.x - K.px, playerPos.z - K.pz) + Math.max(0, radius - K.R);
        [K.px, K.pz, K.R] = [playerPos.x, playerPos.z, radius];
        const Q = AnazhRealm.CULL_EIMER_M;
        const jetzt = Math.floor(K.odo / Q);
        const wecke = (b) => {
            for (const e of K.eimer.get(b))
                if (e._cullEimer === b) {
                    e._cullEimer = undefined;
                    K.wach.add(e);
                }
            K.eimer.delete(b);
        };
        if (jetzt - K.ab > K.eimer.size) for (const b of [...K.eimer.keys()]) b <= jetzt && wecke(b);
        else for (let b = K.ab; b <= jetzt; b++) if (K.eimer.has(b)) wecke(b);
        K.ab = jetzt + 1;
        const beweger = this._blockerNetz().beweger;
        const schlaf = (entry, rest) => {
            if (!(rest >= Q) || beweger.has(entry)) return;
            const b = Math.floor((K.odo + rest) / Q);
            entry._cullEimer = b;
            K.wach.delete(entry);
            const l = K.eimer.get(b);
            if (l) l.push(entry);
            else K.eimer.set(b, [entry]);
        };
        for (const entry of K.wach) {
            const dx = entry.position.x - playerPos.x;
            const dz = entry.position.z - playerPos.z;
            const distSq = dx * dx + dz * dz;
            // DIE FERNFORM DER KARTEN-DINGE (Studio-Vertrag B2c `fernform: "karte"`, `_archKartenPreset`): Baum und Strauch
            // tragen ihre Studio-Kette über die Mesh-Zone hinaus und SIND dort ihre Karte — dieselbe EINE Stufen-Wahl wie
            // nah (die Wahrnehmung legt jeden Baum jenseits seines L1↔Karte-Bands auf die Karte, einen Riesen erst dort;
            // eine eigene Zonen-Klemme am Radius sprang ihn bis zur Integration 05.10. ohne Band) — bis zu ihrem
            // Karten-Horizont, nie ein Analog-Satz. Bis 05.10. trug jeder gesetzte Baum
            // jenseits des Cull-Radius einen Kegel-und-Lappen-Satz im Welt-March: aus 45 m standen glatte, gestreifte,
            // einfarbig hellgrüne Ellipsoide vor dem Wald (Blick-Tour 10-panorama-45m, 895 Sätze an der Mess-Wiese), am
            // Radius sprang die Karte in den Satz. Eine Brücke braucht die Karten-Art nicht: steht ihre Wunsch-Stufe noch
            // nicht, trägt die gedockte Karte (`_rebuildArchitectureMesh`).
            if (this._archKartenPreset(entry)) {
                if (entry._ziegelSlot) {
                    this._archZiegelTod(entry);
                    regung++;
                }
                // diesseits des Saums trägt jedes; im Saum und dahinter fragt der Eintrag SEINEN Rand
                const h = distSq <= saumSq ? Infinity : this._archKartenHorizont(entry);
                if (distSq <= h * h) {
                    if (!this._archIsRendered(entry)) {
                        entry._nahD2 = distSq;
                        nahOffen.push(entry);
                        continue;
                    }
                } else if (distSq > (h + totband) ** 2 && this._archIsRendered(entry)) {
                    this._cullArchitectureMesh(entry);
                    regung++;
                }
                // der Schlaf: gezeichnet bis hinter das Totband, ungezeichnet bis an den eigenen Rand (er liegt im Saum oder
                // dahinter: diesseits trägt jedes); eine Stufe ohne Studio-Asset (`instFoundry`) hebt der Rewarm in der
                // Mesh-Zone — sie wacht dort und schläft davor nur bis an den Radius
                const d = Math.sqrt(distSq),
                    rand = this._archKartenHorizont(entry);
                if (!this._archIsRendered(entry)) schlaf(entry, d - rand);
                else if (entry.instFoundry === true || !this._foundryPresetForEntry(entry))
                    schlaf(entry, rand + totband - d);
                else if (d > radius) schlaf(entry, Math.min(rand + totband - d, d - radius));
                continue;
            }
            // DIE MESH-ZONE (der geregelte Cull-Radius, 100–150 m): hier IST das Studio-Mesh die Gestalt, der
            // LOD-Tick schaltet die Stufen nach Distanz. Bis das Mesh steht, trägt das Feld (kein Loch beim
            // Streamen); steht es, schweigt das Feld — sonst läge der konservative Box-Satz VOR dem Mesh. Jenseits
            // des Radius ist der Box-Satz die Gestalt der Bauten und Steine (klein im Bild, billig).
            if (distSq <= radiusSq) {
                // Der Ziegel-Ruf hängt NICHT am Mesh-Budget — er taktet sich selbst (Bake-Garantie, memoisiert).
                // Lebende Slots aktivieren sofort; ungebackene Bauten warten in DERSELBEN Distanz-Schlange wie die
                // fernen (Befund 02.10., gate:arch-feld: in Listen-Reihenfolge fraß das Dorf den überbuchten
                // Bake-Takt, 24 von 226 Anfragen bewilligt — ein frisch gesetztes Haus in 27 m blieb 200 Takte
                // ohne Feld UND ohne Mesh, unsichtbar).
                entry._ziegelNah = true;
                const echt = this._archIsRendered(entry);
                if (entry._ziegelSlot || entry._ziegelGebacken || ohneFeld) {
                    if (this._archZiegelFern(entry)) regung++;
                } else {
                    // Steht das Mesh schon, braucht der Bau keine Brücke: sein Satz bäckt NACH allen Bedürftigen
                    // vor (für den Rand der Mesh-Zone) und stiehlt ihnen nie den Takt.
                    entry._ziegelD2 = echt ? distSq + AnazhRealm.ZIEGEL_VORBACK_D2 : distSq;
                    ziegelOffen.push(entry);
                }
                if (!echt) {
                    entry._nahD2 = distSq;
                    nahOffen.push(entry);
                }
                if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, !echt);
                if (entry.mesh && entry.mesh.visible !== echt) {
                    entry.mesh.visible = echt;
                    regung++;
                }
            } else {
                entry._ziegelNah = false;
                if (this._archIsRendered(entry)) {
                    this._cullArchitectureMesh(entry);
                    regung++;
                }
                // NAH ZUERST: lebende Slots aktivieren sofort (billig); ungebackene ferne Bauten warten auf den Gang
                // NACH der Liste, dort nach Distanz sortiert — sonst verhungert ein frisch gesetzter Bau hinter alten.
                if (entry._ziegelSlot || entry._ziegelGebacken || ohneFeld) {
                    if (this._archZiegelFern(entry)) regung++;
                    else if (!this._archIsRendered(entry)) schlaf(entry, Math.sqrt(distSq) - radius); // der Satz steht
                } else {
                    entry._ziegelD2 = distSq;
                    ziegelOffen.push(entry);
                }
            }
        }
        // Wartende (ein Bau, ein Satz) halten den Gang wach; was hier entsteht oder fällt, regt die Welt. Wartet nur ein Satz
        // (die Bake-Uhr, seine Flat, das Buch), weckt ihn ihr nächstes Fenster oder der Stempel, kein Bild (`_standRuht`).
        const offen = nahOffen.length + ziegelOffen.length;
        const nurSatz = !nahOffen.length;
        // Mesh-Bauten NAH ZUERST (die Mesh-Zone, dahinter die Karten-Zone der Karten-Dinge): budgetiert; über Budget
        // mit Takt-Garantie (ein Bau je 250 ms, wie die Bake-Garantie des Felds) — sonst bliebe auf langsamem Holz die
        // Mesh-Zone für immer Feld.
        // Das Budget zählt GEBAUTE Meshes, nicht Versuche: ein Eintrag, dessen Studio-Asset noch lädt (Flat null/
        // false — z. B. die L2-Karte im Bäcker), kehrt billig zurück und darf den fertigen dahinter nicht aushungern
        // (Befund 30.09.: die nächsten Karten-Wartenden fraßen jeden Takt das Budget, 7 bereite Eichen standen).
        // Versuche sind gedeckelt (ARCH_NAH_VERSUCHE je Takt). WER LÄDT, VERBRAUCHT KEINEN VERSUCH: ein Bau, dessen
        // Flat zuletzt null lieferte, wartet, bis die Foundry etwas Neues liefert (Ankunfts-Generation), höchstens
        // 1 s — sonst fraßen 24 nähere Wartende hinter einem ausgelasteten Worker jeden Takt die Kappe, und ein
        // sofort baubares Haus dahinter blieb 800 Takte ohne Mesh (gemessen 03.10., gate:arch-feld: 17 offene
        // Worker-Aufträge, Haus „grammatik", mesh false).
        if (nahOffen.length) {
            nahOffen.sort((a, b) => a._nahD2 - b._nahD2);
            const fA = this._foundry ? this._foundry.ankunft | 0 : 0;
            const uhr = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
            const jetztN = uhr();
            // DIE GEDOCKTE STUDIO-STUFE IST KEIN BAU: liegt die Wunsch-Stufe (oder als Brücke die Karte) gedockt bereit,
            // kostet das Platzieren einen Instanz-Slot — gemessen 04.10. (echte GPU, Mess-Wiese): 197 Einträge in
            // 2,5 ms. Es läuft am Bau-Budget und an der Versuchs-Kappe vorbei, nah zuerst, begrenzt nur von der
            // Platzier-Uhr (`ARCH_PLATZ_MS`). Vorher zählte es wie ein Grammatik-Bau: über Budget ein Eintrag je
            // 250 ms — nach der Rückkehr an die Mess-Wiese standen 165 Analog-Sätze < 64 m und schmolzen 20 s lang
            // (die Klumpen der Blick-Tour).
            // Ist das Bau-Budget erschöpft, endet nur das BAUEN (`bauZu`), nie der Gang: der erste nahe Eintrag, dessen
            // Asset noch lädt oder dessen Grammatik baut, brach vorher die Schleife — alle gedockten dahinter warteten.
            // Platz-Uhr, Versuche und Bau-Budget sind Kappen je Takt (`_kappeOffen`): unter dem Ladeschirm gelten sie bis zur
            // Frist des Lade-Frames — Radeon kalt (G2, nachher-k2) war „Bäume und Bauten wachsen" der Schwanz der Ankunft
            // (226 Einträge 12,5 s → 8 bei 15,4 s), 3 Bauten je Lade-Frame.
            const fAn = this._foundryEnabled();
            let versuche = 0,
                bauZu = false,
                hand = null; // über Budget: EIN Takt-Garantie-Blick je Tick, er deckt Versuche bis zum ersten Bau
            for (const entry of nahOffen) {
                const fPre = fAn ? this._foundryPresetForEntry(entry) : null;
                if (
                    fPre &&
                    this._kappeOffen(uhr() - jetztN, AnazhRealm.ARCH_PLATZ_MS) &&
                    this._foundryPlatzBereit(entry, fPre)
                ) {
                    this._rebuildArchitectureMesh(entry);
                    if (this._archIsRendered(entry)) {
                        entry._nahWartet = null;
                        if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, false);
                        regung++;
                        continue;
                    }
                }
                if (bauZu) continue;
                const w = entry._nahWartet;
                if (w && w.a === fA && jetztN - w.t < 1000) continue;
                if (!this._kappeOffen(versuche++, AnazhRealm.ARCH_NAH_VERSUCHE)) {
                    bauZu = true;
                    continue;
                }
                if (!this._kappeOffen(built, budget)) {
                    if (hand === null) hand = this._handBauErlaubt(budget);
                    if (!hand) {
                        bauZu = true;
                        continue;
                    }
                }
                this._rebuildArchitectureMesh(entry);
                if (this._archIsRendered(entry)) {
                    entry._nahWartet = null;
                    if (built++ >= budget) hand = false;
                    if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, false);
                    if (entry.mesh) entry.mesh.visible = true;
                    regung++;
                } else entry._nahWartet = { a: fA, t: jetztN };
            }
            nahOffen.length = 0;
        }
        // DIE EINE ZIEGEL-SCHLANGE (nah wie fern), nach Distanz: der Bake-Takt geht an den nächsten Bau. In der
        // Mesh-Zone trägt ein frischer Slot nur, solange das Mesh nicht steht.
        if (ziegelOffen.length) {
            ziegelOffen.sort((a, b) => a._ziegelD2 - b._ziegelD2);
            for (const entry of ziegelOffen) {
                if (this._archZiegelFern(entry)) regung++; // selbst-getaktet (Bake-Garantie)
                if (entry._ziegelNah && entry._ziegelSlot)
                    this._weltFeldAktiv(entry._ziegelSlot, !this._archIsRendered(entry));
            }
            ziegelOffen.length = 0;
        }
        // Foundry-Drain: baut kalte Foundry-Einträge + hebt vor Studio-ready gespawnte auf das Studio-Asset.
        // Budget-gedeckelt (pausiert über Budget) → die Erst-Welt konvergiert ohne Spike. Headless/Studio
        // nicht ready → früher No-op.
        const kalt = this._foundryRewarmColdTrees(K.wach); // die Kalten und Klassischen der Mesh-Zone wachen (oben)
        // V18.297 — die Welt ATMET: autonome (Nexus-)Bauten sind gedeckelt; ist das
        // Limit erreicht, verblasst das FERNSTE (am Horizont, am wenigsten vermisst).
        this._capNexusStructures(playerPos);
        this._standMeldet("archCull", 1, regung > 0, offen + kalt > 0 && (kalt || !nurSatz || "felder"));
    }

    // DIE WACHE DES CULLS (`tickArchitectureCulling`): je Bestand (`state.architectures`, eine neue Liste oder ein neues Buch
    // weckt alle) die wachen Einträge (`wach`), die schlafenden in Eimern des Spieler-Wegs (`eimer`: Eimer b weckt, sobald der
    // Weg `odo` b · CULL_EIMER_M erreicht; `_cullEimer` am Eintrag nennt seinen Eimer) und die autonomen (`autos`, der Deckel
    // `_capNexusStructures`).
    _cullWache() {
        const liste = this.state.architectures || [];
        const buch = this._foundryEnabled() && this._foundry ? this._foundry.recipes : null;
        const K = this._cullWacheStand;
        if (K && K.liste === liste && K.buch === buch) return K;
        for (const e of liste) e._cullEimer = undefined;
        return (this._cullWacheStand = {
            liste,
            buch,
            wach: new Set(liste),
            eimer: new Map(),
            autos: new Set(liste.filter((e) => e.autonomous)),
            odo: 0,
            ab: 0,
            px: null,
            pz: null,
            R: 0,
        });
    }

    // Der Weckruf: seine gezeichnete Stufe, sein Typ oder seine Lage wechselt — sein Urteil geht im nächsten Gang. `art`
    // "ein": er tritt in den Bestand, "weg": er verlässt ihn (danach weckt ihn nichts mehr). Leser: Eintritt und Abbau,
    // `_blockerBewegt`, die Instanz-Naht (`_archInstanceAdd`, `_archInstanceRemove`) und das Mesh (`_rebuildArchitectureMesh`,
    // `_cullArchitectureMesh`).
    _cullWecken(entry, art) {
        const K = this._cullWacheStand;
        if (!K || K.liste !== this.state.architectures || !entry || (entry._cullEimer === -1 && art !== "ein")) return;
        entry._cullEimer = art === "weg" ? -1 : undefined;
        if (art === "weg") [K.wach.delete(entry), K.autos.delete(entry)];
        else [K.wach.add(entry), entry.autonomous && K.autos.add(entry)];
    }

    // Autonome Bauten bounded: sie spawnen fern (far_player, jenseits des Cull-Radius), der Bestand ist
    // gedeckelt; über dem Cap fällt das FERNSTE (am wenigsten vermisst; ohne Nebel ist sein Fall sichtbar) — der Heap
    // läuft nie voll. Filter +
    // Sort nur über Cap, im Culling-Tick.
    _capNexusStructures(playerPos) {
        const arches = this.state.architectures;
        if (!arches || arches.length === 0) return;
        const cap = AnazhRealm.MAX_NEXUS_STRUCTURES;
        const autos = [];
        for (const e of this._cullWache().autos) autos.push(e);
        if (autos.length <= cap) return;
        const pp = playerPos || (this.state.playerMesh ? this.state.playerMesh.position : null);
        const distSq = (e) => {
            if (!pp) return -(typeof e.id === "number" ? e.id : 0); // ohne Spieler: ältestes zuerst
            const dx = e.position.x - pp.x;
            const dz = e.position.z - pp.z;
            return dx * dx + dz * dz;
        };
        autos.sort((a, b) => distSq(b) - distSq(a)); // das Fernste zuerst
        const toEvict = autos.length - cap;
        for (let i = 0; i < toEvict; i++) this._evictArchitecture(autos[i]);
    }

    // DAS VERBLASSEN IST DER ABBAU OHNE STIMME (S4, die EINE Abbau-Quelle `removeArchitecture`, still: kein Ping, kein
    // Journal): Grund, Grundriss, Ziegel-Fernstufe, Krone, Tritt und Stempel fallen mit dem Eintrag. Bis S4-N3 nahm das
    // Verblassen (V18.297) nur Mesh, Eintrag und Blocker: der Grund eines verblassten Dorf-Hauses schnitt ein Loch ins Leere
    // (gate:haus-welt W9 Waise, das Dorf eines autonomen Akts −183/194).
    _evictArchitecture(entry) {
        if (entry) this.removeArchitecture(entry, { still: true });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_vegetation_baum]);

// ===== ATLAS · Vegetation/baum — Außen-Konstanten =====
// Totholz: Wahrscheinlichkeit eines `stamm_gefallen`-Sub-Spawns nach einem Baum-Spawn
// (~10 % = bewohnter Wald ohne Dichte-Verdünnung).
AnazhRealm.TOTHOLZ_RATE = 0.1;
// Die Landmark-Pool-Karte: Sieger-Name → { Pool-Präfix, Zahl }. Der Scatter würfelt
// REGION-deterministisch einen `<prefix>_var<idx>` aus dem passenden Pool (tag-frozen
// zum Wahrzeichen → kein Affinitäts-Shift, V17.17).
AnazhRealm.SCATTER_VARIANT_POOL = Object.freeze({
    stein_block: Object.freeze({ prefix: "fels", n: 12 }),
    kristall_geode: Object.freeze({ prefix: "kristall", n: 8 }),
});
// Welche Formations-FORM ist aufragend? `_landmarkVariantIdx` wählt sie an steilem Terrain, die
// gedrungenen am flachen Land. `_formClass` jeder Pool-Variante kommt aus ihrem Genom-Roll
// (Fels: Brocken/Stapel/Nadel/Geröll · Kristall: Einzel/Cluster/Geode/Druse).
AnazhRealm.LANDMARK_TALL_FORMS = Object.freeze({
    fels: Object.freeze(["nadel", "stapel"]),
    kristall: Object.freeze(["druse", "einzel"]),
});
AnazhRealm.LANDMARK_SLOPE_TALL = 0.32; // ab dieser Hangneigung (m/m) bevorzugt der Scatter aufragende Formen

// LOD_DISTANCES (stamm/vegetation-streu.js) — gelesen von `_chooseLODForDistance`/`_tickArchitectureLOD`: <thresh01 = L0
// volle Geometrie · bis thresh12 = L1 · darüber L2 Studio-Billboard; `hysteresis` gegen Flackern. Die Schwellen legt das
// Gesetz des Schirms (`_stufenSchirm`, lod.K5), die Bänder `_foundryIngestRenderConfig` aus dem Buch; bewusst NICHT frozen.
// Screen-Space-Error: `lodRef` (die EINE uLodRef-Quelle) skaliert die Distanz mit min(lodRef/visHeight, 1) — ein großer Baum
// schaltet später, ein kleiner nie früher (`_lodPerceptionDistance`).
// Die Ziegel-Schlange ordnet nach Bedarf: ein Bau, dessen Mesh in der Mesh-Zone schon steht, reiht sich um diese
// Distanz² HINTER jeden Bedürftigen (nahe Bauten ohne Mesh · ferne Bauten) — sein Feld-Satz wird nur vorgebacken.
AnazhRealm.ZIEGEL_VORBACK_D2 = 1e12;
// DIE OKTAVE DER LAUB-FARBE (K20): der EINE Leser des Blatt-Atlas (`_blattAtlasProbe`) liest die Farbe so viele Mip-Stufen
// über der Stufe der Deckung — 2 = kein Farb-Detail unter vier Pixeln (Eiche 25 m, nur L1: Δ-Luma 3,41 → 2,62).
AnazhRealm.BLATT_FARBE_OKTAVE = 2;
// DER VERSATZ DES LAUBS (A3, `_laubVersatz`): die Deckung jeder Laub- und Nadel-Karte wandert je Frame im Quadrat ± so
// viele Eingangs-Pixel — über die zeitliche Auflösung die Deckung eines Fußabdrucks von drei Pixeln.
AnazhRealm.LAUB_VERSATZ = 1;

// Krone als VOLUMEN: ein Cluster aus K Karten pro Foliage-Anchor, im Kronen-Volumen gejittert (ein
// Teil zur Mitte gezogen) → geschlossene Krone. Eine card{cross} ist billig (8 Verts); LOD1/2 dünnen
// per cardsPerAnchor aus. Override via state.atmosphere (_foliageDensity()).
AnazhRealm.FOLIAGE_DENSITY = Object.freeze({
    // Seit der Atlas eine Karte zu einem gebackenen ~16-Blatt-Büschel macht, reichen wenige, ruhige
    // Büschel-Karten je Anker (viele Karten in einer Jitter-Wolke = Brei); mittelgroße Karten halten die
    // Krone voll bei proportionierten Blättern. LOD1/2 bleiben dünn.
    cardsPerAnchor: [5, 2, 1], // pro LOD0/1/2 — moderate Zahl mittelgroßer Büschel
    jitterFrac: 0.5, // Cluster-Spreizung (Büschel überlappen sanft → volle Krone)
    sizeVar: 0.3, // ±30% (organisch)
    innerFill: 0.2, // etwas Füllung, das Ast-Gerüst bleibt aber sichtbar
});

// DAS SKELETT DES GESETZES (K24-N1): der EINE Erzeuger `_growTreeBlueprintRich` schreibt jede Größe, die die Bauer der
// Werkstatt-Gestalt lesen (Röhre, Klingen, Karten, Kern, Schatten-Zwilling, Impostor-Rahmen) — Höhe, Rinde, Wurzelanlauf,
// Laub-Farbe, Laub-Art und -Maß, Blatt-Form, alle aus treeParams der Art. Fehlt eine, bricht der Bau laut beim Namen. Vorher
// setzten die Leser still einen Ersatz ein: Rinde SPECIES_PALETTE_DEFAULT, Höhe 10, Anlauf 0,45 × 5 (der Farn mit Anlauf 0
// bekam ihn: `|| 0.45`), Laub 0x4a8a3a und Maß 0,5, Blatt-Form nach dem Namen der Art, ein nie geschriebenes foliageScale.
AnazhRealm._skelettPflicht = function (sk) {
    const fehlt = [];
    if (!sk) fehlt.push("Skelett");
    else {
        if (!(sk.totalH > 0)) fehlt.push("totalH");
        for (const k of ["barkA", "barkB", "foliageColor", "flareAmp", "flareLobes"])
            if (!Number.isFinite(sk[k])) fehlt.push(k);
        if (!sk.laub || typeof sk.laub.kind !== "string" || !(sk.laub.kind === "none" || sk.laub.size > 0))
            fehlt.push("laub");
        if (!sk.leafShape || typeof sk.leafShape !== "object") fehlt.push("leafShape");
    }
    if (fehlt.length)
        throw new Error(
            "SKELETT-PFLICHT verletzt: " + fehlt.join(", ") + " fehlt (der Erzeuger _growTreeBlueprintRich)"
        );
    return sk;
};

// SPECIES_TREE_PARAMS — Welt-Bezug je Spezies: slopeMax (ab diesem Slope kein Spawn),
// heightRange [min,max] (Spawn-Höhenfenster über `state.terrainBaseHeight`).
AnazhRealm.SPECIES_TREE_PARAMS = Object.freeze({
    baum_tanne: Object.freeze({
        slopeMax: 1.2,
        heightRange: Object.freeze([-30, 200]),
    }),
    baum_kiefer: Object.freeze({
        slopeMax: 1.3,
        heightRange: Object.freeze([-20, 180]),
    }),
    baum_buche: Object.freeze({
        slopeMax: 0.8,
        heightRange: Object.freeze([-40, 120]),
    }),
    baum_birke: Object.freeze({
        slopeMax: 0.6,
        heightRange: Object.freeze([-30, 90]),
    }),
    baum_eiche: Object.freeze({
        slopeMax: 0.7,
        heightRange: Object.freeze([-40, 110]),
    }),
    baum_erle: Object.freeze({
        slopeMax: 0.9,
        heightRange: Object.freeze([-40, 100]),
    }),
    // KARST: slopeMax 1.6 (höchster aller Arten), heightRange [-30, 80] bewusst eng (Klippen-Zone).
    baum_karst: Object.freeze({
        slopeMax: 1.6,
        heightRange: Object.freeze([-30, 80]),
    }),
    // V18.216 (Plan §3.5) — Büsche: mittlere bis kleine slopeMax (Hazel klettert leichter, Blume meidet Steile),
    // weite heightRange (Understory wächst überall, wo der Baum-Schatten fällt).
    busch_hazel: Object.freeze({
        slopeMax: 0.9,
        heightRange: Object.freeze([-30, 90]),
    }),
    farn_busch: Object.freeze({
        slopeMax: 0.5,
        heightRange: Object.freeze([-40, 60]),
    }),
    blume_gross: Object.freeze({
        slopeMax: 0.4,
        heightRange: Object.freeze([-30, 50]),
    }),
    // T1 (wahrerwuchs §4.1) — PALME: warmes Tiefland, meidet Steile + Höhe (Küsten/Oasen).
    baum_palme: Object.freeze({
        slopeMax: 0.6,
        heightRange: Object.freeze([-30, 35]),
    }),
    // T1 — ZYPRESSE: säulen-förmig, tolerant (Hügel + mittlere Höhe).
    baum_zypresse: Object.freeze({
        slopeMax: 1.0,
        heightRange: Object.freeze([-30, 120]),
    }),
});

// STEIN-GEOLOGIE (Vorlage `placeRocks`): Steine folgen dem HANG, nicht dem Zufall — drei Nischen,
// Schwellen auf AnazhRealms |∇h|-Skala (wie PLACEMENT_DENSITY):
//   FINDLING   — flacher Grund (sl ≤ findlingSlopeMax), gedrungener `brocken`, groß + isoliert
//   AUFSCHLUSS — steil UND hoch (aufschlussSlopeMin/aufschlussHeightMin), aufragend `nadel`/`stapel`
//   TALUS      — steil, aber nicht hoch (talusSlopeMin): kleiner, kantiger `geroell`-Schutt
// Der Mittelhang trägt keinen Fels. Gelesen von `_rockGeologyClass`/`_rockGeologyScale`.
AnazhRealm.ROCK_GEOLOGY = Object.freeze({
    findlingSlopeMax: 0.45, // ≤ so flach = Findling (die Vorlagen-sl<0.10, AnazhRealm-Skala)
    aufschlussSlopeMin: 0.7, // > so steil + hoch = Aufschluss/Grat (Vorlage sl>0.155)
    aufschlussHeightMin: 18, // relH über Terrain-Basis: erst hoch genug = Grat (Vorlage forestGroundH>2)
    talusSlopeMin: 0.85, // > so steil (nicht Grat) = Blockschutt/Talus (Vorlage sl>0.185)
    findlingScaleLo: 1.3, // Findling groß (Eiszeit-Erratiker)
    findlingScaleHi: 2.0,
    aufschlussScaleLo: 1.0, // Aufschluss aufragend (mittel-groß)
    aufschlussScaleHi: 1.7,
    talusScaleLo: 0.5, // Talus/Geröll klein (kantiger Schutt)
    talusScaleHi: 0.95,
});
// Die geologische FORM-Nische: welche `_rockVariant`-Form-Klassen passen zu jeder Nische
// (die Platzierung reicht BIS ZUR FORM — Findling gedrungen, Talus Streu, Aufschluss aufragend).
AnazhRealm.ROCK_GEOLOGY_FORMS = Object.freeze({
    findling: Object.freeze(["brocken"]), // gedrungener Fels-Brocken
    talus: Object.freeze(["geroell"]), // kantiger Schutt-Fächer
    aufschluss: Object.freeze(["nadel", "stapel"]), // aufragender Grat-Aufschluss
});
// Das Gitter der Grundrisse (`_grundrissStand`): 32-m-Zellen, Zahlen-Schlüssel (die Streu fragt je Zelle).
AnazhRealm.GRUNDRISS_ZELLE = 32;
AnazhRealm._grundrissSchluessel = (gx, gz) => (gx + 0x8000) * 0x10000 + (gz + 0x8000);
// DER FUSS EINES STAMMS (Schau-2 wasser-wahrheit, Gegenprüfung 10.10.): der Kreis um die Achse, auf dem eine Pflanze steht
// (m) — die Natur-Wand fragt das Land an der Achse UND auf ihm (`_stammFussLand`). Befund (gate:werk-im-wasser Z am See
// −906/−634): eine Kiefer stand 0,5 m neben 2,4 m tiefem Wasser, zwei Hasel 0,23 und 0,52 m im Uferwasser — die Wand fragte
// nur die Achse.
AnazhRealm.STAMM_FUSS_M = 0.5;
// Mesh-Zone: höchstens so viele Bau-VERSUCHE je Culling-Takt (ein Versuch ohne bereites Studio-Asset ist ein
// billiger Cache-Blick; das Bau-Budget zählt nur gelungene Bauten).
AnazhRealm.ARCH_NAH_VERSUCHE = 24;
// Die Platzier-Uhr der Mesh-Zone (ms je Takt): so lange setzt der Culling-Tick kalte Einträge, deren Studio-Stufe
// gedockt bereitliegt — ohne Bau-Budget, nah zuerst. 197 Plätze kosteten 2,5 ms (04.10., echte GPU, Mess-Wiese).
AnazhRealm.ARCH_PLATZ_MS = 4;
// Das Totband am Karten-Horizont (m, `tickArchitectureCulling`): ein Karten-Ding platziert seine Karte bis zu seinem
// Rand (`_archKartenHorizont`) und räumt sie erst so weit dahinter — ein Spieler, der am Horizont-Rand pendelt, lässt
// keine Karte flattern.
AnazhRealm.KARTEN_HORIZONT_TOTBAND_M = 16;
AnazhRealm.ORT_SAME_REICH = 5 * AnazhRealm.FOREST.cell + AnazhRealm.KRONE_MAX_M;
AnazhRealm.STAND_RAND_FERN_M = 1;
// Der Eimer der Cull-Wache (m Spieler-Weg): ein Eintrag schläft nur, wenn sein Urteil mindestens einen Eimer weit steht.
AnazhRealm.CULL_EIMER_M = 2;
// V18.297 — wie viele autonom (vom Nexus) gespawnte Bauten gleichzeitig leben dürfen.
// Großzügig (eine reiche ferne Welt), aber gedeckelt → der Heap kann nicht über Stunden
// volllaufen (das war das Leck). Über dem Cap verblasst das Fernste (_capNexusStructures).
AnazhRealm.MAX_NEXUS_STRUCTURES = 48;
