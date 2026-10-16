class AnazhRealm_gelaende_fern {
    // ===== ATLAS · Gelaende/fern — Fern-Ring · Fern-Wasser · Ring-Pflege =====
    // Entfernt Voxel-Chunks, die zu weit vom Spieler sind (Manhattan-
    // Distanz über dem Ring-Radius + 1 — eine Pufferzone gegen Flackern).
    _pruneDistantVoxelChunks(playerPos) {
        if (!playerPos || !this.state.voxelChunks) return;
        const { span, ringRadius } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        const pcz = Math.floor(playerPos.z / span);
        const drop = [];
        for (const key of this.state.voxelChunks.keys()) {
            const parts = key.split(",");
            const cx = Number(parts[0]);
            const cz = Number(parts[1]);
            if (Math.abs(cx - pcx) > ringRadius + 1 || Math.abs(cz - pcz) > ringRadius + 1) drop.push(key);
        }
        for (const key of drop) this._disposeVoxelChunk(key);
        // Basis-Density-Cache distanzbasiert prunen (Speicher bounded), beide LOD-Keys (`,0`/`,1`). NICHT
        // in `_disposeVoxelChunk` — das ruft der Edit-Rebuild vor dem Build und hebelte den Cache aus.
        if (this.state.voxelBaseDensityCache) {
            for (const key of drop) {
                const [cx, cz] = key.split(",");
                this.state.voxelBaseDensityCache.delete(`${cx},${cz},0`);
                this.state.voxelBaseDensityCache.delete(`${cx},${cz},1`);
            }
        }
        // Die CA-Level-Schicht (~534 KB/Eintrag) + Quell-Spalten + y-Band fallen mit dem Chunk aus dem
        // Ring (bounded); der Re-Stream seedet aus der Flood neu. NICHT in `_disposeVoxelChunk`: das Level
        // muss den Carve-Rebuild überleben, damit das Wasser nachfließt.
        if (this.state.waterLevelCells) for (const key of drop) this.state.waterLevelCells.delete(key);
        if (this.state.waterCAActive) for (const key of drop) this.state.waterCAActive.delete(key);
        if (this.state.waterSourceCols) for (const key of drop) this.state.waterSourceCols.delete(key);
        if (this.state.waterCABand) for (const key of drop) this.state.waterCABand.delete(key);
        if (this.state.waterCapJ) for (const key of drop) this.state.waterCapJ.delete(key);
    }

    // ===== DAS FERN-WASSER (Wasser-LOD-Kaskade) =====
    // Jenseits des Chunk-Rings EIN welt-verankertes Sheet aus dem Hydro-Atlas (`_atlasWaterLevelAt`,
    // O(1)/Spalte, kein CA) mit dem EINEN Hydro-Material. Grid step = span/4 (Linien auf Chunk-Grenzen),
    // Quads nur wo nass UND Region gebaut; das Innen-LOCH folgt exakt dem Chunk-Ring (kein Doppel-
    // Alpha); trockene Anker tauchen `dip` unter den Spiegel. Render-only; Linse: `diag-far-water`.
    _ensureFarWaterSheet() {
        const s = this.state;
        if (!s.scene || typeof THREE === "undefined") return;
        // Fern-Wasser Default AN (trägt das Studio-Gesetz WASSER_GESETZ). AUS nur über
        // `atmosphere.farWater === false` oder die HOLZ-Profile nah/kienspan (Ferne-Deckel).
        const _farOff = s.atmosphere && s.atmosphere.farWater === false;
        if (_farOff) {
            if (s.farWater) this._disposeFarWaterSheet();
            return;
        }
        const pmesh = s.playerMesh;
        if (!pmesh) return;
        const pm = pmesh.position;
        const cfg0 = this._voxelChunkConfig(0);
        const span = cfg0.span;
        const ringR = this._voxelChunkConfig().ringRadius;
        const F = AnazhRealm.FAR_WATER;
        // Aussenradius: die Luft trägt Kilometer (V18.530) — das Sheet reicht bis `maxRadius`, nie enger als
        // 2 Chunks hinter der Ring-Kante; dahinter klemmt der Fern-Ring das Wasser auf den Spiegel.
        const outR = Math.max((ringR + 2.5) * span, F.maxRadius);
        const m = s.farWater;
        if (m && m.builtRing === ringR && Math.abs(m.builtOutR - outR) < F.rebuildDelta) {
            const dx = pm.x - m.anchorX,
                dz = pm.z - m.anchorZ;
            if (dx * dx + dz * dz < F.reanchorDist * F.reanchorDist) return; // steady: No-op
        }
        if (s._frameOverBudget && m) return; // der Rebuild wartet auf einen gesunden Frame
        const t0 = performance.now();
        // Kachel-Atlanten fürs Sicht-Fenster (lazy, deterministisch, einmalig pro Kachel).
        if (typeof this._ensureHydroTilesAround === "function") this._ensureHydroTilesAround(pm.x, pm.z, outR);
        const waterLevel = Number.isFinite(s.waterLevel) ? s.waterLevel : 0;
        const step = span / 4;
        const pcx = Math.floor(pm.x / span);
        const pcz = Math.floor(pm.z / span);
        const inRegion = (x, z) => {
            const rg = this._hydroFor(x, z);
            if (!rg || !rg.ready) return false;
            const sz = rg.dim * rg.cell;
            return x >= rg.originX && z >= rg.originZ && x < rg.originX + sz && z < rg.originZ + sz;
        };
        // Vertex-Grid, welt-snapped (Grid-Linien auf step-Vielfachen → Chunk-Grenzen exakt).
        const ox = Math.floor((pm.x - outR) / step) * step;
        const oz = Math.floor((pm.z - outR) / step) * step;
        const N = Math.ceil((outR * 2) / step) + 1; // Zellen pro Achse
        const NV = N + 1;
        const vmap = new Int32Array(NV * NV).fill(-1);
        const positions = [];
        const aWave = [];
        const aDepth = [];
        const indices = [];
        const outR2 = outR * outR;
        const addVert = (ix, iz, cellL) => {
            const vi = ix + iz * NV;
            if (vmap[vi] >= 0) return vmap[vi];
            const vx = ox + ix * step;
            const vz = oz + iz * step;
            const Lv = inRegion(vx, vz) ? this._atlasWaterLevelAt(vx, vz, -Infinity) : -Infinity;
            const wet = Lv > -Infinity && Number.isFinite(Lv);
            const L = wet ? Lv : cellL;
            const id = positions.length / 3;
            // Nass: knapp unter den Spiegel (unter der Nah-Sheet-Kräusel-Zone, kein Z-Fight
            // mit der Mantel-Sea-Ebene [waterLevel−3]); trocken (Ufer-Anker): tief eintauchen
            // → das ansteigende Ufer-Terrain okkludiert die Kante per Pixel (edgeFade).
            positions.push(vx, wet ? L - F.drop : L - F.dip, vz);
            // aWave wie das Nah-Sheet (Höhen-Rampe zur Meereshöhe): ferner Ozean wogt, der
            // erhöhte See liegt still; aDepth konstant „tief" (die Tiefen-Farbe der Ferne —
            // der per-Pixel-Ufer-Fade trägt die Kante, kein Makro-Sample nötig = O(1)).
            const ramp = Math.max(0, Math.min(1, 1 - (Math.abs(L - waterLevel) - 0.8) / 2.0));
            aWave.push(wet ? ramp : 0);
            aDepth.push(wet ? F.depth : 0);
            vmap[vi] = id;
            return id;
        };
        for (let ck = 0; ck < N; ck++) {
            for (let ci = 0; ci < N; ci++) {
                const cx = ox + (ci + 0.5) * step;
                const cz = oz + (ck + 0.5) * step;
                const ddx = cx - pm.x,
                    ddz = cz - pm.z;
                if (ddx * ddx + ddz * ddz > outR2) continue; // Kreis-Aussengrenze
                // das LOCH: Zellen im Voxel-Chunk-Ring trägt das ECHTE Wasser (kein Überlapp).
                const ccx = Math.floor(cx / span);
                const ccz = Math.floor(cz / span);
                if (Math.max(Math.abs(ccx - pcx), Math.abs(ccz - pcz)) <= ringR) continue;
                if (!inRegion(cx, cz)) continue; // OOB → Mantel-Ozean-Kulisse deckt
                const L = this._atlasWaterLevelAt(cx, cz, -Infinity);
                if (!(L > -Infinity) || !Number.isFinite(L)) continue; // trocken
                const v00 = addVert(ci, ck, L);
                const v10 = addVert(ci + 1, ck, L);
                const v01 = addVert(ci, ck + 1, L);
                const v11 = addVert(ci + 1, ck + 1, L);
                indices.push(v00, v10, v01, v11, v01, v10); // -Y-Wicklung (BackSide-Oberseite)
            }
        }
        const oldMesh = m && m.mesh ? m.mesh : null;
        let mesh = null;
        if (indices.length > 0) {
            const geom = new THREE.BufferGeometry();
            const vCount = positions.length / 3;
            geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            // der VOLLE Material-Vertrag (WebGPU strikt — jedes gelesene Attribut MUSS da sein):
            geom.setAttribute("aFlow", new THREE.Float32BufferAttribute(new Float32Array(vCount * 2), 2));
            geom.setAttribute("aWave", new THREE.Float32BufferAttribute(aWave, 1));
            geom.setAttribute("aDepth", new THREE.Float32BufferAttribute(aDepth, 1));
            geom.setAttribute("aSlope", new THREE.Float32BufferAttribute(new Float32Array(vCount), 1));
            geom.setIndex(indices);
            mesh = new THREE.Mesh(geom, this._ensureHydroSurfaceMaterial());
            mesh.renderOrder = 1;
            mesh.frustumCulled = false; // der Ring umgibt die Kamera (wie der Mantel)
            mesh.userData.hydroKind = "farWater";
            s.scene.add(mesh); // build-before-dispose: erst das Neue, dann das Alte weg
        }
        if (oldMesh) {
            s.scene.remove(oldMesh);
            this._queueGeometryDispose(oldMesh.geometry);
        }
        s.farWater = {
            mesh,
            anchorX: pm.x,
            anchorZ: pm.z,
            builtRing: ringR,
            builtOutR: outR,
            quads: indices.length / 6,
            builtMs: +(performance.now() - t0).toFixed(1),
        };
    }

    _disposeFarWaterSheet() {
        const m = this.state.farWater;
        if (!m) return;
        if (m.mesh) {
            if (this.state.scene) this.state.scene.remove(m.mesh);
            this._queueGeometryDispose(m.mesh.geometry);
            // das Material ist das GETEILTE Hydro-Material — NIE mit-disposen.
        }
        this.state.farWater = null;
    }

    // ===== DER FERN-RING (DIE FERNE IST FELD) =====
    // Jenseits des Streaming-Rings zeichnet das EINE Höhen-Gesetz (`_terrainMacroSurfaceY(x, z, false)`)
    // den Horizont als 3 Ring-Schalen: fixe Kosten (3 Draw-Calls, 9216 Vertices). Vertex-XZ auf ein
    // grobes WELT-Gitter gesnappt → beim Re-Zentrieren schwimmen die Höhen nie. Headless AUS; Hook
    // `window.__anazhFernRing` (true/false) für die Linse `diag-fern-ring`.

    // Baut EINMAL die 3 Schalen (192 Winkel × `_fernRingReihen` Reihen je Schale) + das EINE Material (vertexColors,
    // Nebel per Default). Die Höhen füllt `_fernRingRefresh` budgetiert über Frames — bis dahin
    // unsichtbar.
    _fernRingEnsure(playerPos) {
        const st = this.state;
        if (st.fernRing) return st.fernRing;
        if (!st.scene || typeof THREE === "undefined" || !playerPos) return null;
        const F = AnazhRealm.FERN_RING;
        const cfg = this._voxelChunkConfig();
        // Schale 1 beginnt AUSSERHALB des Ziel-Rings (nicht des Boot-Ramp-Ists — nie das nahe Terrain
        // durchschneiden): (target+0.5)·span + randPad. Das 24-m-Snap zieht Punkte ≤ ~17 m einwärts →
        // randPad 40.
        const targetRing = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        // LOCH-DECKEL: der Ring beginnt DIREKT am Spieler (0.5·span), nicht an der Ziel-Ring-Kante — er
        // deckt jedes ungebaute Chunk-Loch mit wahrem Terrain (sonst scheint die Welt-Wasser-Plane samt
        // Spekular durch); gebaute Chunks decken IHN per Depth. Kein Durchstich: in der Chunk-Ziel-Zone
        // trägt er das VOLLE Gesetz leicht gesenkt (s. _fernRingRefresh, deckZoneRad).
        const innerRand = cfg.span * 0.5;
        const W = F.winkel;
        let off = 0;
        const schalen = F.schalen.map((s, i) => {
            const inner = i === 0 ? innerRand : F.schalen[i - 1].aussen;
            const reihen = AnazhRealm._fernRingReihen(inner, s.aussen);
            const sh = Object.freeze({ inner, aussen: s.aussen, snap: s.snap, reihen, off, per: W * reihen });
            off += W * reihen;
            return sh;
        });
        // DER BODEN-STOFF DES CHUNKS (K16, die Naht) — dieselbe
        // Fabrik (`_buildToonNodeMaterial`) mit denselben Gesetzen: die Vertex-Farbe (`_bodenFarbeAt`) durch die Wege-Karte
        // (`_wegeBodenFarbe`) und die Geologie (`_terrainGeologyAlbedo`: Fels am Hang, der Wiesen-Grund, Moos), die geflattete
        // Licht-Normale und die Substanz-Antwort. Bis K16 trug der Ring einen eigenen Standard-Stoff aus der rohen Vertex-Farbe:
        // der gebaute Boden stand als Quadrat mit Farbsprung auf ihm (Wiesen-Grün im Chunk, Erde im Ring). Was der Ring nicht
        // hat, trägt er nicht: keine Himmels-Sicht (er liegt unter dem Himmel, aHimmel 1), kein Geomorph. Über dem Boden das
        // Kronendach aus der EINEN Mischung des Boden-Stoffs (`_fernKroneNahMisch`: wo kein echter Wald zeichnet, Laub-Radius
        // vom Spieler, Karten-Sicht vom Auge) — der Ring reicht seine Ecken-Krone (aKrone, dieselben Teile `_fernFarbeTeile`)
        // für den Ort jenseits der Karte über dem Chunk-Quadrat. Bis zur Integration 12.10. wog der Ring sein Dach selbst ab
        // dem Karten-Horizont (`SCATTER.outerM`) und der Chunk-Boden seins ab dem Laub-Radius: zwei Quellen für eine Grenze.
        // fog default AN, DoubleSide (die Kamera darf unter den Saum tauchen). Ohne TSL oder Saison-Uniform bricht er laut.
        const TSL = THREE.TSL;
        const su = this._ensureSeasonUniforms();
        if (!TSL || !su || typeof THREE.MeshStandardNodeMaterial !== "function")
            throw new Error("Fern-Ring: der Stoff braucht TSL und die Saison-Uniform (uSeasonMul)");
        // ZWEI STOFFE AUS DER EINEN FABRIK, DIE KOSTEN AN DER NAHT (K16, Prüfung Runde 3): der freie Stoff (ohne Maske und Weiche)
        // trägt die Schalen 1 und 2 und die freien Dreiecke der Schale 0; der Naht-Stoff (maskNode + die Weiche im depthNode) nur
        // die Dreiecke der Schale 0, die das Gebaute oder seine Bänder berühren (`_fernRingTeilung`). Eine Tiefe aus dem
        // Fragment kostet jedes Fragment, das sie schreibt, den frühen Tiefentest und die Tiefen-Kompression: auf dem EINEN Stoff
        // aller drei Schalen lag sie auf jedem Fragment des Rings (Radeon 890M gpu-bank ABAB +1,28 ms je Frame).
        const stoff = () =>
            this._buildToonNodeMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
                wegeKarte: true,
                kroneVertex: TSL.attribute("aKrone", "vec4"),
                wasserVertex: TSL.attribute("aNass", "float"),
            });
        const material = stoff();
        const stoffNaht = stoff();
        if (!material || !material.colorNode || !stoffNaht || !stoffNaht.colorNode)
            throw new Error("Fern-Ring: der Boden-Stoff des Chunks entstand nicht");
        // Die Fabrik schluckt Fehler ihres Albedo-Zweigs still — der Ring prüft seinen Wasser-Anteil selbst (K16, laut).
        if (!material.emissiveNode || !stoffNaht.emissiveNode)
            throw new Error("Fern-Ring: der Blick des Wassers (aNass, `_fernWasserBlickNode`) fehlt im Ring-Stoff");
        // DIE BAU-ZONE (K16, die Naht): so weit vom Anker kann ein gebauter Chunk stehen — die Ziel-Zone ist ein Quadrat um den
        // SPIELER (die Ecke × √2), der Spieler wandert bis `reanchorDist` vom Anker, und die Naht draußen ist eine Reihe weiter
        // (Reihen-Faktor). Hier trägt jeder Punkt auch das volle Gesetz (`vollY`), die Deck-Wache geht sie ganz.
        const bauZoneRad = Math.min(
            schalen[0].aussen,
            ((targetRing + 0.5) * cfg.span * Math.SQRT2 + F.reanchorDist) * (1 + (F.seite * 2 * Math.PI) / W)
        );
        // DER RING WEICHT DEM GEBAUTEN (K16, die Naht): wo ein gezeichneter Chunk steht (`_chunkGezeichnet`), verwirft der Ring
        // sein Fragment (`maskNode`) — die Masken-Karte trägt je Chunk der Bau-Zone ein Texel um den Anker, `_fernRingMaske`
        // schreibt sie, sobald sich der gezeichnete Bestand ändert. Bis 12.10. tauchte der Ring dort 2 m (an der Naht 0,2 m)
        // unter das Gesetz, und das Gebaute deckte ihn per Tiefe: über jeder Höhlen-Mündung (der gebaute Boden 10–62 m unter dem
        // Gesetz) stand er als glatte Platte mit Sägezahn-Kante (Bild platte-ring-an/-aus, K16-nb3), und an der Naht stach
        // seine Sehne durch den Chunk (gate:fern-ring Band 9, voller 5 × 5-Satz 2,79 %).
        const maskeN = 2 * Math.ceil(bauZoneRad / cfg.span) + 3;
        const maskeDaten = new Uint8Array(maskeN * maskeN * 4);
        const maskeTex = new THREE.DataTexture(maskeDaten, maskeN, maskeN, THREE.RGBAFormat, THREE.UnsignedByteType);
        maskeTex.name = "fern-ring-maske";
        maskeTex.magFilter = THREE.NearestFilter;
        maskeTex.minFilter = THREE.NearestFilter;
        maskeTex.generateMipmaps = false;
        maskeTex.needsUpdate = true;
        const uMaskeZelle0 = TSL.uniform(new THREE.Vector2(0, 0)); // die Chunk-Zelle des Texels (0, 0)
        // der Anker des Rings (die Weiche liest den Durchmesser der Masche an ihrem Radius); der Re-Anker (`_tickFernRing`) setzt ihn
        const uAnker = TSL.uniform(
            new THREE.Vector2(
                Math.round(playerPos.x / F.anchorQuant) * F.anchorQuant,
                Math.round(playerPos.z / F.anchorQuant) * F.anchorQuant
            )
        );
        // DIE REGEL (K16, die Naht; der CPU-Spiegel ist `_fernRingRegel`, die Linse misst nach ihm): das Deck eines Chunks
        // deckt nicht seine Zelle. Der Pad-Aufruf (`ox − step`, `dim + 3`, crop 1) behält die Zellen 1 … dim + 1: die erste
        // Vertex-Spalte steht in der ersten Voxel-Spalte der Zelle, die letzte in der des +Nachbarn, und die Glättung (eine
        // Laplace-Runde, λ 0,5) schiebt jeden Vertex um höchstens eine halbe Kante über seine Voxel-Spalte hinaus. Das Deck
        // beginnt also zwischen ox − ½ s und ox + 1½ s und endet zwischen ox + span − ½ s und ox + span + 1½ s. Sicher getragen
        // ist die Zelle ohne diese Bänder; ein Band nur, wenn der Nachbar dort gebaut ist und dieselbe Stufe trägt (dann
        // teilen beide die Vertex-Spalte; über die Stufen-Grenze trägt das Deck nicht sicher — Morph-Kappe, Höhlen-Zweige).
        // Dort verwirft der Ring (2). Im SAUM — den Bändern am Rand des Gebauten, innen wie außen — zeichnet er und WEICHT dem
        // Chunk in die Tiefe (`nahtWeiche`, senkrecht über die Ring-Normale auf den Strahl, gekappt `nahtWeicheMax`): wo das
        // Deck fehlt, trägt der Ring, wo es steht, gewinnt es (1). Die Kante s der Stufe trägt die Karte im Grün-Kanal (× 10).
        // Bis 12.10. verwarf die ganze Zelle: an der −X- und −Z-Kante des Gebauten zeichnete niemand (Prüfung: 47 von 52
        // Punkten 5 cm innen ohne Deck, im Bild eine blaue Linie über die Bau-Kante; die Glättung trug Reste bis 1,9 m innen).
        {
            const zelleF = TSL.floor(TSL.positionWorld.xz.div(cfg.span));
            const lokal = TSL.positionWorld.xz.sub(zelleF.mul(cfg.span));
            const zelle = zelleF.sub(uMaskeZelle0);
            const lies = (dx, dz) => {
                const z = zelle.add(TSL.vec2(dx, dz));
                const drin = z.x
                    .greaterThanEqual(0)
                    .and(z.y.greaterThanEqual(0))
                    .and(z.x.lessThan(maskeN))
                    .and(z.y.lessThan(maskeN));
                const t = TSL.textureLoad(maskeTex, TSL.ivec2(TSL.clamp(z, TSL.vec2(0), TSL.vec2(maskeN - 1))));
                const b = drin.and(t.x.greaterThan(0.5));
                return { b, s: TSL.select(b, t.y.mul(25.5), TSL.float(0)) };
            };
            const N = {};
            let w = TSL.float(0);
            for (let dx = -1; dx <= 1; dx++)
                for (let dz = -1; dz <= 1; dz++) {
                    N[`${dx},${dz}`] = lies(dx, dz);
                    w = TSL.max(w, N[`${dx},${dz}`].s);
                }
            const T00 = N["0,0"];
            // je Achse das untere Band (bis 1½ s) und das obere (ab span − ½ s)
            const untenX = lokal.x.lessThan(w.mul(1.5));
            const untenZ = lokal.y.lessThan(w.mul(1.5));
            const nahX = untenX.or(lokal.x.greaterThan(TSL.float(cfg.span).sub(w.mul(0.5))));
            const nahZ = untenZ.or(lokal.y.greaterThan(TSL.float(cfg.span).sub(w.mul(0.5))));
            const wahl = (a, b, c) => ({ b: TSL.select(a, b.b, c.b), s: TSL.select(a, b.s, c.s) });
            const TX = wahl(untenX, N["-1,0"], N["1,0"]);
            const TZ = wahl(untenZ, N["0,-1"], N["0,1"]);
            const TXZ = wahl(untenX, wahl(untenZ, N["-1,-1"], N["-1,1"]), wahl(untenZ, N["1,-1"], N["1,1"]));
            const traegt = (T) => T.b.and(T.s.equal(T00.s));
            const sicher = T00.b
                .and(nahX.not().or(traegt(TX)))
                .and(nahZ.not().or(traegt(TZ)))
                .and(nahX.and(nahZ).not().or(traegt(TXZ)));
            const saum = sicher.not().and(T00.b.or(nahX.and(TX.b)).or(nahZ.and(TZ.b)).or(nahX.and(nahZ).and(TXZ.b)));
            stoffNaht.maskNode = sicher.not();
            // die Weiche: der Strahl bis zur um H gesenkten Ring-Fläche (Normale n, Strahl d: Δt = H·|n_y| / |n·d|). H trägt
            // den Fehler der MASCHE (`_fernRingWeiche`, der CPU-Spiegel): ihre Ecken liegen auf dem Feld, dazwischen
            // interpoliert sie linear — über einer Wand des Feldes (Sockel, Höhlen-Mündung, Kanal) steht sie bis zu ihrer Steigung
            // × ihrem Durchmesser über der Fläche (Band 9 13.10.: die Masche 516…528 m über einer 15-m-Wand stand 7,6 m über dem
            // Deck, die feste Weiche 6 m schnitt ein). H·|n_y| = max(nahtWeiche·|n_y|, |n_xz|·Durchmesser).
            const pv = TSL.positionView;
            const lang = pv.length();
            const nW = TSL.normalWorldGeometry;
            const dW = TSL.normalize(TSL.positionWorld.sub(TSL.cameraPosition));
            const masche = TSL.length(TSL.positionWorld.xz.sub(uAnker))
                .mul(AnazhRealm._fernRingMascheJeM())
                .add(schalen[0].snap * Math.SQRT2);
            const hNy = TSL.max(TSL.float(F.nahtWeiche).mul(TSL.abs(nW.y)), TSL.length(nW.xz).mul(masche));
            const dt = TSL.min(hNy.div(TSL.max(TSL.abs(TSL.dot(nW, dW)), 1e-3)), TSL.float(F.nahtWeicheMax));
            const vz = TSL.select(saum, pv.z.mul(lang.add(dt).div(lang)), pv.z);
            stoffNaht.depthNode = TSL.viewZToPerspectiveDepth(vz, TSL.cameraNear, TSL.cameraFar);
        }
        const meshes = [];
        const geos = [];
        const zeichne = (geo, stoffZ) => {
            const mesh = new THREE.Mesh(geo, stoffZ);
            mesh.frustumCulled = false; // der Ring umgibt die Kamera ringsum
            mesh.renderOrder = -1; // hinter der Welt (Depth-Test ordnet den Rest)
            mesh.castShadow = false;
            // er empfängt (D3): jenseits der Kaskaden trägt sein Boden-Stoff die Horizont-Karte (`_horizontSicht`)
            mesh.receiveShadow = true;
            mesh.visible = false; // erst sichtbar, wenn der erste Höhen-Refresh durch ist
            mesh.matrixAutoUpdate = false; // Vertex-XZ sind absolute Welt-Koordinaten
            mesh.userData.inventar = "fern-ring"; // Identitäts-Stempel (H3-Familie)
            st.scene.add(mesh);
            meshes.push(mesh);
            return mesh;
        };
        for (let s = 0; s < schalen.length; s++) {
            const per = schalen[s].per;
            // Das Index-Muster der Schale (Wicklung: Normalen zeigen nach +Y).
            const indices = [];
            for (let r = 0; r < schalen[s].reihen - 1; r++) {
                for (let a = 0; a < W; a++) {
                    const a2 = (a + 1) % W;
                    const v00 = r * W + a;
                    const v01 = r * W + a2;
                    const v10 = (r + 1) * W + a;
                    const v11 = (r + 1) * W + a2;
                    indices.push(v00, v01, v10, v01, v11, v10);
                }
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(per * 3), 3));
            geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(per * 3), 3));
            geo.setAttribute("aKrone", new THREE.Float32BufferAttribute(new Float32Array(per * 4), 4));
            geo.setAttribute("aNass", new THREE.Float32BufferAttribute(new Float32Array(per), 1));
            geo.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(per * 3), 3));
            geo.setIndex(indices);
            geos.push(geo);
            if (s > 0) zeichne(geo, material);
        }
        // DIE SCHALE 0 IN ZWEI TEILEN (`_fernRingTeilung`): ihr Träger (`geos[0]`, das volle Index-Muster — Normalen und Linsen
        // lesen ihn, gezeichnet wird er nie) und zwei Teil-Geometrien über DENSELBEN Attributen, je mit eigenem Index fester
        // Länge (die Rest-Plätze entartet: kein Zeichen-Bereich wechselt, ein Bündel spielt jeden Stand ab). Bis die Maske
        // trägt, ist alles frei.
        const voll0 = geos[0].index.array;
        const teil = (index) => {
            const g = new THREE.BufferGeometry();
            for (const k of ["position", "color", "aKrone", "aNass", "normal"])
                g.setAttribute(k, geos[0].attributes[k]);
            g.setIndex(new THREE.BufferAttribute(index, 1));
            return g;
        };
        const frei0 = zeichne(teil(voll0.slice()), material);
        const naht0 = zeichne(teil(new voll0.constructor(voll0.length)), stoffNaht);
        st.fernRing = {
            meshes, // die gezeichneten: Schale 1, Schale 2, Schale 0 frei, Schale 0 Naht
            geos, // je Schale die volle Geometrie (Schreiber, Normalen, Linsen)
            stoffe: { frei: material, naht: stoffNaht },
            // DIE TEILUNG DER SCHALE 0 (`_fernRingTeilung`): je Dreieck 0 frei · 1 Naht · 2 sicher getragen (kein Index)
            teilung: {
                frei: frei0.geometry,
                naht: naht0.geometry,
                klasse: new Uint8Array(voll0.length / 3),
                n: [voll0.length / 3, 0, 0],
                schluessel: "",
            },
            xzGen: 0, // wandert eine Ecke der Schale 0 (Anker), teilt sie neu
            schalen,
            // der Anker folgt dem Spieler QUANTISIERT (kein Höhen-Schwimmen):
            anchorX: Math.round(playerPos.x / F.anchorQuant) * F.anchorQuant,
            anchorZ: Math.round(playerPos.z / F.anchorQuant) * F.anchorQuant,
            builtRing: targetRing, // Sicht-Regler-Wechsel → Neubau (Deck-Zone folgt)
            // Bis zu diesem Radius (Chunk-Ziel-Zone + Blende) tragen die Schale-0-Reihen das VOLLE Gesetz
            // leicht gesenkt → wahres Terrain deckt jedes Chunk-Loch (s. _fernRingRefresh).
            deckZoneRad: (targetRing + 0.5) * cfg.span,
            bauZoneRad, // die Bau-Zone (oben)
            // die Masken-Karte des Gebauten (`maskNode`, `_fernRingMaske`): je Texel 255 = ein gezeichneter Chunk
            maske: { tex: maskeTex, daten: maskeDaten, n: maskeN, uZelle0: uMaskeZelle0, schluessel: "" },
            uAnker, // der Anker im Stoff der Naht (die Weiche, `_fernRingWeiche`)
            vollY: new Float32Array(off).fill(NaN),
            // die Fläche des FELDES am Rand der Naht (`_fernRingFeldY`): NaN = noch nicht gemessen
            feldY: new Float32Array(off).fill(NaN),
            cursor: 0, // der budgetierte Höhen-Refresh beginnt am Vertex 0
            totalVerts: off,
            // DAS GESETZ JE PUNKT AUS DEM FERN-FADEN (B2, `_fernRingEinhaengen`): die Höhe (in der Bau-Zone deck-gemischt), der
            // Schutt, Fläche und Spiegel des Bodens, der Fluss der Masche (Anteil, Spiegel) und die acht Teile der Farbe
            law: new Float64Array(off),
            schutt: new Float32Array(off),
            nassY: new Float64Array(off),
            spiegel: new Float64Array(off),
            flussC: new Float64Array(off),
            flussSp: new Float64Array(off),
            teile: new Float32Array(off * 8).fill(NaN),
            nass: new Uint8Array(off), // je Punkt: trägt der Boden dort Wasser
            // die Bestellung: der nächste Index (`auftrag`), die Scheiben im Flug, die Antworten vor dem Einhängen
            auftrag: 0,
            flug: 0,
            einhaengen: [],
            refreshed: 0, // eingehängte Punkte (Linse)
            ready: false,
        };
        return st.fernRing;
    }

    // Die Studio-Laubfarbe der fünf Wald-Arten (Kiefer · Tanne · Eiche · Birke · Erle, die Folge von `forestNische`),
    // linear nach dem FARB-GESETZ (das Paletten-Hex ist eine sRGB-Absicht; THREE.Color wandelt). Einmal je Sitzung —
    // ohne Studio-Laub bricht die Fern-Farbe laut.
    _fernLaubLinear() {
        if (this._fernLaubLin) return this._fernLaubLin;
        const c = new THREE.Color();
        this._fernLaubLin = ["baum_kiefer", "baum_tanne", "baum_eiche", "baum_birke", "baum_erle"].map((art) => {
            const a = this._phytoArt(art);
            const d = a && globalThis.__phytoCore.artPhaenotyp(a.rec.s, a.rec);
            if (!d || !Number.isFinite(d.leafCol)) throw new Error("Fern-Farbe: Studio-Laubfarbe fehlt für " + art);
            c.setHex(d.leafCol);
            return [c.r, c.g, c.b];
        });
        return this._fernLaubLin;
    }

    // Die Saison der laufenden Phase als {r, g, b} (der CPU-Spiegel von `uSeasonMul`, `_saisonMul` ist die EINE Formel).
    _fernSaison(out) {
        const ph = typeof this.state.seasonPhase === "number" ? this.state.seasonPhase : 0.375;
        return this._saisonMul(ph, out || { r: 1, g: 1, b: 1 });
    }

    // DER EINE Punkt-Helfer (CPU-Schleife UND Feld-Zeichner): globaler Vertex-Index → Schale/Lokal-
    // Index/Reihe + aufs Schalen-Snap-Gitter gerundetes Welt-XZ (Höhen schwimmen beim Re-Zentrieren nie).
    _fernRingPunkt(fr, gIdx) {
        const W = AnazhRealm.FERN_RING.winkel;
        let s = 0;
        while (s < fr.schalen.length - 1 && gIdx >= fr.schalen[s + 1].off) s++;
        const sh = fr.schalen[s];
        const li = gIdx - sh.off;
        const row = (li / W) | 0;
        const ai = li - row * W;
        const ort = AnazhRealm._fernRingOrt(fr, sh, row, ai, {});
        const rad = ort.rad;
        return {
            s,
            g: gIdx,
            li,
            row,
            rad, // der LOCH-DECKEL liest den Reihen-Radius (Deck-Zonen-Urteil)
            // die Masche des Punkts (`_fernFarbeMasche`): halbe Breite tangential, halbe Tiefe radial (Reihen-Faktor)
            fuss: {
                ax: fr.anchorX,
                az: fr.anchorZ,
                ht: (Math.PI * rad) / W,
                hr: (AnazhRealm.FERN_RING.seite * Math.PI * rad) / W,
            },
            x: ort.x,
            z: ort.z,
        };
    }

    // DER ORT EINES SCHALEN-PUNKTS (Reihe, Winkel-Index): GEOMETRISCHE Reihen-Radien — Auflösung dort, wo das Auge ist (Reihe-0-
    // Tiefe ≈ inner·(q−1); lineare Reihen gäben Riesen-Quads an der Innenkante, deren Farb-Interpolation als Streifen liest) —,
    // das Welt-XZ aufs Schalen-Snap-Gitter gerundet. Der Punkt-Helfer und die Nachbar-Frage der Naht lesen ihn.
    static _fernRingOrt(fr, sh, row, ai, out) {
        const rad = sh.inner * Math.pow(sh.aussen / sh.inner, row / (sh.reihen - 1));
        const ang = (ai / AnazhRealm.FERN_RING.winkel) * Math.PI * 2;
        out.rad = rad;
        out.x = Math.round((fr.anchorX + Math.cos(ang) * rad) / sh.snap) * sh.snap;
        out.z = Math.round((fr.anchorZ + Math.sin(ang) * rad) / sh.snap) * sh.snap;
        return out;
    }

    // AN DER NAHT (K16): trägt ein gebauter Chunk den Ring-Punkt oder einen der acht Punkte der Schale um ihn, liegt der Punkt
    // auf dem vollen Gesetz (`_fernRingY`). Die Frage stellt nur die Bau-Zone (`bauZoneRad`: wo ein Chunk stehen kann).
    _fernRingNaht(fr, p) {
        if (p.s !== 0 || !(p.rad <= fr.bauZoneRad)) return false;
        if (this._chunkDecktRing(p.x, p.z)) return true;
        const W = AnazhRealm.FERN_RING.winkel;
        const sh = fr.schalen[0];
        const ai = p.li - p.row * W;
        const o = this._fernRingOrtTmp || (this._fernRingOrtTmp = {});
        for (let dr = -1; dr <= 1; dr++) {
            const row = p.row + dr;
            if (row < 0 || row >= sh.reihen) continue; // innen steht der Spieler: dort gibt es keinen Nachbarn
            for (let da = -1; da <= 1; da++) {
                if (!dr && !da) continue;
                AnazhRealm._fernRingOrt(fr, sh, row, (ai + da + W) % W, o);
                if (this._chunkDecktRing(o.x, o.z)) return true;
            }
        }
        return false;
    }

    // DIE FLÄCHE DES FELDES an der Naht (K16, der Einschnitt): der Chunk zeichnet das FELD (Gesetz + 3D-Rauheit + Höhlen-
    // Mündung + Edits), die 2D-Höhe kennt keinen Einschnitt. Jede Ecke eines Naht-Dreiecks (`teilung.randV`: dort zeichnet der
    // Ring über oder neben dem Gebauten) trägt darum die oberste Fläche des Feldes (`_voxelSurfaceY`, derselbe Leser wie Gras
    // und Stand), gemerkt je Anker und Edit-Stand; ohne Fläche das volle Gesetz. Gemessen wird sie nur in der Deck-Wache
    // (`_fernRingDeckWache`, gedeckelt je Takt), nie im Refresh-Strom.
    _fernRingFeldY(fr, p) {
        const voll = fr.vollY[p.g];
        if (!(voll === voll)) return NaN;
        const y = this._voxelSurfaceY(p.x, p.z);
        // OHNE FLÄCHE (die Spalte trägt keinen Boden bis zur Garantie-Tiefe) bleibt die Ecke auf dem Gesetz — gezählt
        // (`feldOhne`, gate:fern-ring Band 9 nennt es), nie still
        if (y === null || !(y === y)) {
            fr.feldOhne = (fr.feldOhne | 0) + 1;
            fr.feldY[p.g] = voll;
        } else fr.feldY[p.g] = y;
        return fr.feldY[p.g];
    }

    // DIE WEICHE DES SAUMS, ihr CPU-Spiegel (K16, der Einschnitt): wie tief (m, senkrecht) der Ring im Saum (`_fernRingRegel` 1)
    // dem Chunk weicht, an (x, z) mit der Normale n seiner Masche — die feste Weiche oder der Fehler der Masche (Steigung ×
    // Durchmesser), was größer ist; der Knoten rechnet dasselbe (`_fernRingEnsure`, depthNode). Leser: gate:fern-ring Band 9.
    _fernRingWeiche(fr, x, z, nx, ny, nz) {
        const F = AnazhRealm.FERN_RING;
        const masche =
            Math.hypot(x - fr.anchorX, z - fr.anchorZ) * AnazhRealm._fernRingMascheJeM() +
            fr.schalen[0].snap * Math.SQRT2;
        const nY = Math.abs(ny);
        return Math.max(F.nahtWeiche, (Math.hypot(nx, nz) * masche) / Math.max(nY, 1e-3));
    }

    // DER DURCHMESSER EINER MASCHE der Schale 0 je Meter Radius: radial die Reihen-Tiefe (q − 1, `_fernRingReihen`), quer der
    // Winkel-Schritt 2π/winkel; dazu trägt jede Ecke ihr Snap (die Weiche addiert snap·√2)
    static _fernRingMascheJeM() {
        const F = AnazhRealm.FERN_RING;
        return Math.hypot((F.seite * 2 * Math.PI) / F.winkel, (2 * Math.PI) / F.winkel);
    }

    // DIE REGEL DES maskNode, ihr CPU-Spiegel (K16, die Naht; die Herleitung steht am Stoff in `_fernRingEnsure`): 2 = der Ring
    // verwirft (ein Deck trägt sicher), 1 = Saum (der Ring zeichnet und weicht dem Chunk um `nahtWeiche` in die Tiefe), 0 = frei.
    // Leser: gate:fern-ring Band 9 (das Loch, der Durchstich) — dieselbe Rechnung wie der Knoten, Texel für Texel.
    _fernRingRegel(fr, x, z) {
        const M = fr.maske;
        const span = this._voxelChunkConfig().span;
        const ci = Math.floor(x / span);
        const cj = Math.floor(z / span);
        const lx = x - ci * span;
        const lz = z - cj * span;
        const i = ci - M.uZelle0.value.x;
        const j = cj - M.uZelle0.value.y;
        const T = (a, b) => {
            const drin = a >= 0 && b >= 0 && a < M.n && b < M.n;
            const k = (b * M.n + a) * 4;
            const g = drin && M.daten[k] / 255 > 0.5;
            return { b: g, s: g ? (M.daten[k + 1] / 255) * 25.5 : 0 };
        };
        let w = 0;
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) w = Math.max(w, T(i + dx, j + dz).s);
        const T00 = T(i, j);
        const untenX = lx < w * 1.5;
        const untenZ = lz < w * 1.5;
        const nahX = untenX || lx > span - w * 0.5;
        const nahZ = untenZ || lz > span - w * 0.5;
        const ix = untenX ? -1 : 1;
        const jz = untenZ ? -1 : 1;
        const TX = T(i + ix, j);
        const TZ = T(i, j + jz);
        const TXZ = T(i + ix, j + jz);
        const traegt = (t) => t.b && t.s === T00.s;
        const sicher = T00.b && (!nahX || traegt(TX)) && (!nahZ || traegt(TZ)) && (!(nahX && nahZ) || traegt(TXZ));
        if (sicher) return 2;
        return T00.b || (nahX && TX.b) || (nahZ && TZ.b) || (nahX && nahZ && TXZ.b) ? 1 : 0;
    }

    // Der Ring weicht dem Gebauten: trägt ein GEBAUTER, sichtbarer Chunk die Säule, existiert der Ring
    // dort nicht (keine zweite Terrain-Wahrheit über/unter Edits) — die Masken-Karte des Rings (`_fernRingMaske`,
    // `maskNode`) verwirft dort sein Fragment.
    _chunkDecktRing(x, z) {
        const st = this.state;
        if (!st.voxelChunks || st.voxelChunks.size === 0) return false;
        const { span } = this._voxelChunkConfig();
        return this._chunkGezeichnet(st.voxelChunks.get(`${Math.floor(x / span)},${Math.floor(z / span)}`));
    }

    // Zeichnet dieser Chunk-Eintrag Boden? Gebaut, nicht leer, sichtbar = Mesh + jede Eltern-Stufe (Region-Bundles blenden
    // als Gruppe). Leser: `_chunkDecktRing` und die Masken-Karte des Rings.
    _chunkGezeichnet(e) {
        if (!e || e.empty || !e.mesh) return false;
        let o = e.mesh;
        while (o) {
            if (o.visible === false) return false;
            o = o.parent;
        }
        return true;
    }

    // DIE MASKE DES GEBAUTEN (K16, `maskNode` des Rings): je Chunk der Bau-Zone um den Anker ein Texel, 255 wo ein gezeichneter
    // Chunk steht (`_chunkGezeichnet`). Neu geschrieben nur, wenn sich die Chunk-Menge regt (`_weltRegt(true)`) oder der Anker
    // wandert; hochgeladen nur, wenn ein Texel sich ändert.
    _fernRingMaske(fr) {
        const M = fr.maske;
        const st = this.state;
        const chunks = st.voxelChunks;
        const schluessel = `${this._bodenRegung | 0}|${chunks ? chunks.size : 0}|${fr.anchorX}|${fr.anchorZ}`;
        if (M.schluessel === schluessel) return;
        M.schluessel = schluessel;
        const { span } = this._voxelChunkConfig();
        const h = (M.n - 1) / 2;
        const i0 = Math.floor(fr.anchorX / span) - h;
        const j0 = Math.floor(fr.anchorZ / span) - h;
        // je Texel: Rot 255 = gezeichnet, Grün = die Voxel-Kante seiner Stufe × 10 (die Breite des Saums, `_fernRingRegel`)
        const neu = M.neu || (M.neu = new Uint8Array(M.n * M.n * 2));
        neu.fill(0);
        if (chunks)
            for (const [key, e] of chunks) {
                if (!this._chunkGezeichnet(e)) continue;
                const k = key.indexOf(",");
                const i = Number(key.slice(0, k)) - i0;
                const j = Number(key.slice(k + 1)) - j0;
                if (i < 0 || j < 0 || i >= M.n || j >= M.n) continue;
                neu[(j * M.n + i) * 2] = 255;
                neu[(j * M.n + i) * 2 + 1] = Math.round(this._voxelChunkConfig(e.lod || 0).step * 10);
            }
        const voll = M.uZelle0.value.x !== i0 || M.uZelle0.value.y !== j0;
        let anders = voll;
        // DAS FENSTER DER REGUNG (K51-4): die Texel, die sich änderten (a0, b0, a1, b1) — die Teilung urteilt nur die Dreiecke
        // neu, deren Zellen darin liegen (`_fernRingKlassen`); wandert der Ursprung, ist es die ganze Maske
        let fa0 = M.n,
            fb0 = M.n,
            fa1 = -1,
            fb1 = -1;
        for (let q = 0; q < M.n * M.n; q++)
            if (M.daten[q * 4] !== neu[q * 2] || M.daten[q * 4 + 1] !== neu[q * 2 + 1]) {
                M.daten[q * 4] = neu[q * 2];
                M.daten[q * 4 + 1] = neu[q * 2 + 1];
                anders = true;
                const a = q % M.n,
                    b = (q - a) / M.n;
                if (a < fa0) fa0 = a;
                if (a > fa1) fa1 = a;
                if (b < fb0) fb0 = b;
                if (b > fb1) fb1 = b;
            }
        if (!anders) return;
        const F = M.fenster;
        M.fenster =
            voll || F === "voll"
                ? "voll"
                : F
                  ? [Math.min(F[0], fa0), Math.min(F[1], fb0), Math.max(F[2], fa1), Math.max(F[3], fb1)]
                  : [fa0, fb0, fa1, fb1];
        M.uZelle0.value.set(i0, j0);
        M.tex.needsUpdate = true;
        M.ver = (M.ver | 0) + 1; // die Teilung der Schale 0 folgt (`_fernRingTeilung`)
    }

    // DIE TEILUNG DER SCHALE 0 (K16, die Kosten an der Naht — Prüfung Runde 3): je Dreieck frei (0: der freie Stoff), an der
    // Naht (1: Maske und Weiche) oder sicher getragen (2: kein Index, es zeichnet niemand) — nach der Regel des maskNode
    // (`_fernRingKlassen`). Neu geurteilt nur, wenn die Maske sich regt (`maske.ver`) oder eine Ecke der Schale wandert
    // (`xzGen`, der Anker); die Indizes reisen nur, wenn ein Dreieck die Klasse wechselt. Leser: der Zeichner, gate:fern-ring
    // Band 12 (die Weiche kostet nur an der Naht) und 13 (die Teilung ist treu).
    _fernRingTeilung(fr) {
        const T = fr.teilung;
        const M = fr.maske;
        const schluessel = `${M.ver | 0}|${fr.xzGen | 0}`;
        if (T.schluessel === schluessel) return;
        T.schluessel = schluessel;
        // DER TAKT KOSTET, WAS IHN BETRIFFT (K51-4, Lehre 25): regte sich nur die Maske (die Lage der Schale steht), urteilt die
        // Teilung nur die Dreiecke am Fenster der Regung (`M.fenster`) neu — jeder Stufen-Wechsel eines Chunks urteilte vorher
        // alle Dreiecke der Schale 0 (OMEN 1410-boden gehend: `_fernRingKlassen` +0,11 ms je Frame, Radeon bis 13 ms je Lauf)
        const fenster = T.xzGen === (fr.xzGen | 0) && Array.isArray(M.fenster) ? M.fenster : null;
        M.fenster = null;
        T.xzGen = fr.xzGen | 0;
        const geo = fr.geos[0];
        const I = geo.index.array;
        const neu = T.neu || (T.neu = new Uint8Array(T.klasse.length));
        T.sMax = AnazhRealm._fernRingKlassen(
            M,
            this._voxelChunkConfig().span,
            geo.attributes.position.array,
            I,
            neu,
            fenster && { fenster, klasse: T.klasse, sMax: T.sMax }
        );
        let anders = false;
        for (let t = 0; t < neu.length && !anders; t++) anders = neu[t] !== T.klasse[t];
        if (!anders) return;
        T.klasse.set(neu);
        const fa = T.frei.index.array;
        const na = T.naht.index.array;
        let kf = 0;
        let kn = 0;
        for (let t = 0; t < neu.length; t++) {
            if (neu[t] === 2) continue;
            const ziel = neu[t] === 0 ? fa : na;
            const o = neu[t] === 0 ? kf : kn;
            ziel[o] = I[t * 3];
            ziel[o + 1] = I[t * 3 + 1];
            ziel[o + 2] = I[t * 3 + 2];
            if (neu[t] === 0) kf += 3;
            else kn += 3;
        }
        fa.fill(0, kf); // die Rest-Plätze entartet (0, 0, 0): kein Fragment, der Zeichen-Bereich bleibt
        na.fill(0, kn);
        // die Ecken der Naht-Dreiecke tragen die Fläche des Feldes (`_fernRingFeldY`)
        const randV = T.randV || (T.randV = new Uint8Array(geo.attributes.position.count));
        randV.fill(0);
        for (let o = 0; o < kn; o++) randV[na[o]] = 1;
        T.frei.index.needsUpdate = true;
        T.naht.index.needsUpdate = true;
        T.n = [kf / 3, kn / 3, neu.length - (kf + kn) / 3];
    }

    // DAS URTEIL JE DREIECK (rein; der CPU-Spiegel des maskNode über den Kasten eines Dreiecks, ± `eps` gegen die f32-Rundung
    // des Fragments). FREI (0): kein gezeichneter Chunk liegt im Kasten ± (1½ s_max + eps) — kein Punkt darin ist Chunk oder
    // Band eines Chunks (`_fernRingRegel` 0 überall). GETRAGEN (2): jede Zelle im Kasten ± eps ist gezeichnet, und wo der
    // Kasten ein Band der Zelle berührt (unten bis 1½ w, oben ab span − ½ w, w = die größte Stufe der 3 × 3 wie im Knoten),
    // trägt der Nachbar jenseits (gezeichnet, dieselbe Stufe), in der Ecke auch der schräge (`_fernRingRegel` 2 überall).
    // Sonst NAHT (1): dort urteilt der Knoten je Fragment.
    static _fernRingKlassen(M, span, P, I, klasse, alt) {
        const n = M.n;
        const D = M.daten;
        const i0 = M.uZelle0.value.x;
        const j0 = M.uZelle0.value.y;
        const eps = 0.05;
        const B = (a, b) => a >= 0 && b >= 0 && a < n && b < n && D[(b * n + a) * 4] / 255 > 0.5;
        const S = (a, b) => (B(a, b) ? (D[(b * n + a) * 4 + 1] / 255) * 25.5 : 0);
        let sMax = 0;
        let a0 = n;
        let a1 = -1;
        let b0 = n;
        let b1 = -1;
        for (let b = 0; b < n; b++)
            for (let a = 0; a < n; a++)
                if (B(a, b)) {
                    sMax = Math.max(sMax, S(a, b));
                    a0 = Math.min(a0, a);
                    a1 = Math.max(a1, a);
                    b0 = Math.min(b0, b);
                    b1 = Math.max(b1, b);
                }
        const rand = 1.5 * sMax + eps;
        // DAS FENSTER (`alt`, K51-4): das Urteil eines Dreiecks liest die Zellen im Kasten ± rand und deren Nachbarn — liegt keine
        // geänderte Zelle darin, gilt sein altes Urteil; wechselt die größte Stufe (`sMax`, die Breite jedes Saums), alle neu
        const F = alt && alt.sMax === sMax ? alt.fenster : null;
        for (let t = 0; t < klasse.length; t++) {
            const p = I[t * 3] * 3;
            const q = I[t * 3 + 1] * 3;
            const r = I[t * 3 + 2] * 3;
            const x0 = Math.min(P[p], P[q], P[r]);
            const x1 = Math.max(P[p], P[q], P[r]);
            const z0 = Math.min(P[p + 2], P[q + 2], P[r + 2]);
            const z1 = Math.max(P[p + 2], P[q + 2], P[r + 2]);
            if (
                F &&
                (Math.floor((x1 + rand) / span) - i0 + 1 < F[0] ||
                    Math.floor((x0 - rand) / span) - i0 - 1 > F[2] ||
                    Math.floor((z1 + rand) / span) - j0 + 1 < F[1] ||
                    Math.floor((z0 - rand) / span) - j0 - 1 > F[3])
            ) {
                klasse[t] = alt.klasse[t];
                continue;
            }
            // frei: kein gezeichneter Chunk im Kasten ± rand
            let gebaut = false;
            const ra0 = Math.max(a0, Math.floor((x0 - rand) / span) - i0);
            const ra1 = Math.min(a1, Math.floor((x1 + rand) / span) - i0);
            const rb0 = Math.max(b0, Math.floor((z0 - rand) / span) - j0);
            const rb1 = Math.min(b1, Math.floor((z1 + rand) / span) - j0);
            for (let a = ra0; a <= ra1 && !gebaut; a++) for (let b = rb0; b <= rb1 && !gebaut; b++) gebaut = B(a, b);
            if (!gebaut) {
                klasse[t] = 0;
                continue;
            }
            // getragen: jede Zelle im Kasten ± eps gezeichnet, jedes berührte Band vom Nachbarn getragen
            let getragen = true;
            const ca0 = Math.floor((x0 - eps) / span) - i0;
            const ca1 = Math.floor((x1 + eps) / span) - i0;
            const cb0 = Math.floor((z0 - eps) / span) - j0;
            const cb1 = Math.floor((z1 + eps) / span) - j0;
            for (let a = ca0; a <= ca1 && getragen; a++)
                for (let b = cb0; b <= cb1 && getragen; b++) {
                    if (!B(a, b)) {
                        getragen = false;
                        break;
                    }
                    const s = S(a, b);
                    let w = 0;
                    for (let da = -1; da <= 1; da++)
                        for (let db = -1; db <= 1; db++) w = Math.max(w, S(a + da, b + db));
                    const ox = (a + i0) * span;
                    const oz = (b + j0) * span;
                    const uX = Math.max(x0 - eps, ox) - ox < 1.5 * w;
                    const oX = Math.min(x1 + eps, ox + span) - ox > span - 0.5 * w;
                    const uZ = Math.max(z0 - eps, oz) - oz < 1.5 * w;
                    const oZ = Math.min(z1 + eps, oz + span) - oz > span - 0.5 * w;
                    const tr = (da, db) => B(a + da, b + db) && S(a + da, b + db) === s;
                    getragen =
                        (!uX || tr(-1, 0)) &&
                        (!oX || tr(1, 0)) &&
                        (!uZ || tr(0, -1)) &&
                        (!oZ || tr(0, 1)) &&
                        (!(uX && uZ) || tr(-1, -1)) &&
                        (!(uX && oZ) || tr(-1, 1)) &&
                        (!(oX && uZ) || tr(1, -1)) &&
                        (!(oX && oZ) || tr(1, 1));
                }
            klasse[t] = getragen ? 2 : 1;
        }
        return sMax;
    }

    // DER EINE SETZ-HELFER (jeder Weg, der einen Ring-Punkt legt, schreibt durch DIESELBE Naht): die Höhe aus dem Gesetz des
    // Punkts (`_fernRingY`) und die Teile, die der Fern-Faden für ihn rechnete (`fr.teile`, B2) — nass trägt der Punkt das
    // Wasser (Deckung 0, Wasser-Anteil 1). Ein trockener Punkt ohne Teile ist ein Bruch des Fadens (laut).
    _fernRingSetzVertex(fr, p, wl) {
        const geo = fr.geos[p.s];
        const pos = geo.attributes.position;
        if (p.s === 0 && (pos.getX(p.li) !== p.x || pos.getZ(p.li) !== p.z)) fr.xzGen++; // die Teilung folgt der Lage
        const nass = this._fernRingNass || (this._fernRingNass = { y: 0, spiegel: 0 });
        pos.setXYZ(p.li, p.x, this._fernRingY(fr, p, wl, nass), p.z);
        const wet = nass.y < nass.spiegel;
        fr.nass[p.g] = wet ? 1 : 0;
        const o = p.g * 8;
        if (!wet && !(fr.teile[o] === fr.teile[o]))
            throw new Error("Fern-Ring: der trockene Punkt " + p.g + " trägt keine Teile aus dem Fern-Faden");
        AnazhRealm._fernRingSchreibe(geo, p.li, wet ? this._fernRingWasserTeile() : fr.teile.subarray(o, o + 8));
    }

    // Die Teile des Wassers: der Wasser-Körper des Gesetzes, ohne Krone, Wasser-Anteil 1 (der Ring-Stoff zeichnet den Blick).
    _fernRingWasserTeile() {
        if (this._fernWasserTeile) return this._fernWasserTeile;
        const w = this._fernWasserKoerper();
        return (this._fernWasserTeile = new Float32Array([w[0], w[1], w[2], 0, 0, 0, 0, 1]));
    }

    // Die Höhe EINES Ring-Punkts aus seinem Gesetz: unter Wasser flach unter dem Spiegel (`_fernRingWasserTiefe`), die
    // innerste Reihe jeder Schale taucht −saumDrop (die Saum-Tauchkante). Gesetz, Fläche, Spiegel und Fluss der Masche rechnete
    // der Fern-Faden (`fr.nassY` · `fr.spiegel` · `fr.flussC` · `fr.flussSp`, B2). DIE NAHT (K16, `_fernRingNaht`): wo ein
    // gebauter Chunk den Punkt oder einen Nachbarn trägt, liegt der Ring auf dem VOLLEN Gesetz (`vollY`, dieselbe Höhe wie der
    // Chunk, ohne die Loch-Senkung), die Ecke eines Naht-Dreiecks auf der Fläche des Feldes (`feldY`) — nur dort fragt der
    // Haupt-Faden das Wasser des Bodens selbst (`_fernNass`: Kanal, See, Meer), denn nur er kennt das Gebaute. Im Gebauten
    // zeichnet der Ring nicht (die Masken-Karte, `_fernRingMaske`). DIE HÖHE DES FLUSSES (K16): wo ein Fluss die Masche zum
    // Anteil c deckt, liegt der trockene Punkt auf Boden × (1 − c) + dem Spiegel des Flusses × c.
    _fernRingY(fr, p, wl, nass) {
        const F = AnazhRealm.FERN_RING;
        const g = p.g;
        const rand = fr.teilung.randV;
        let law = p.s === 0 && rand && rand[p.li] ? fr.feldY[g] : NaN; // die Ecke eines Naht-Dreiecks: das Feld
        if (!(law === law) && this._fernRingNaht(fr, p)) law = fr.vollY[g];
        const aus = nass || this._fernRingNass || (this._fernRingNass = { y: 0, spiegel: 0 });
        let wet;
        if (law === law) wet = this._fernNass(p.x, p.z, law, wl, aus);
        else {
            aus.y = fr.nassY[g];
            aus.spiegel = fr.spiegel[g];
            wet = aus.y < aus.spiegel;
        }
        let y = wet ? aus.spiegel - this._fernRingWasserTiefe() : aus.y;
        if (!wet) {
            const c = fr.flussC[g];
            const sp = fr.flussSp[g];
            if (c > 0 && sp === sp) y += (sp - y) * c;
        }
        if (p.row === 0) y -= F.saumDrop;
        return y;
    }

    // DIE NÄSSE DER FERNE (K16, die Naht: dieselbe Höhe UND dasselbe Wasser aus EINEM Gesetz): ein Punkt mit der Gesetzes-
    // Höhe `law` trägt die Form des Gewässers, die die Dichte des Chunks trägt (`_gewaesserForm`: Kanal, Damm, See-Becken),
    // und sein Spiegel ist die EINE Wasser-Wahrheit (`_atlasWaterLevelAt`: Meer und See; jenseits der Kacheln der
    // Meeresspiegel; vor der Hydrosphäre der Meeresspiegel `wl`). Schreibt `aus.y` (die Fläche) und `aus.spiegel`
    // (−Infinity = trocken) und liefert, ob der Punkt nass ist. Der FLUSS taucht keinen Punkt: sein Kanal (4–17 m) ist
    // schmaler als die Masche der Ferne, sein Wasser trägt die Fern-Farbe als Anteil der Masche (`_fernFlussDeckung`) —
    // ein getauchter Punkt riss Gruben in den Ring (Werkbank 13.10.). Bis K16 nässte jeder Fern-Leser (Ring, Kronen-Karte,
    // Feld-Pass) nur unter dem Meeresspiegel (`law < wl`): Fluss und See endeten an der Bau-Kante.
    _fernNass(x, z, law, wl, aus) {
        const h = this.state.hydrosphere;
        if (!h || !h.ready || this._hydroComputing) {
            aus.y = law;
            aus.spiegel = wl;
            return law < wl;
        }
        const y = AnazhRealm._gewaesserForm(law, 0, this._hydrosphereCarveAt(x, z), this._hydrosphereLakeAt(x, z));
        aus.y = y;
        this._atlasWaterLevelAt(x, z, y, aus);
        aus.spiegel = aus.koerper;
        return y < aus.spiegel;
    }

    // Der Blick des Wassers für den Ring-Stoff: eine ruhige Fläche (Normale nach oben) über tiefem Wasser (T = 0), im Licht
    // des Wasser-Stoffs (`hydroSurfaceUniforms`, EIN Schreiber `_dayNightApplyWaterMaterials`). Ohne Wasser-Stoff bricht er laut.
    _fernWasserBlickNode(_T) {
        this._ensureHydroSurfaceMaterial();
        const U = this.state.hydroSurfaceUniforms;
        if (!U || !U.irr || !U.sunCol || !U.sunDir || !U.light)
            throw new Error("Fern-Ring: der Blick des Wassers braucht den Wasser-Stoff (hydroSurfaceUniforms)");
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        return this._wasserBlick(_T, WG, {
            n: _T.vec3(0.0, 1.0, 0.0),
            ort: _T.positionWorld,
            viewDir: _T.normalize(_T.cameraPosition.sub(_T.positionWorld)),
            T: _T.float(0.0),
            koerper: _T.vec3(...this._fernWasserKoerper()),
            irr: U.irr,
            sunCol: U.sunCol,
            sunDir: U.sunDir,
            light: U.light,
        }).eigen;
    }
    // Der Wasser-Körper R∞ des Gesetzes für die CPU-Leser der Ferne (`_wasserKoerper`, EINE Formel mit dem Wasser-Stoff).
    _fernWasserKoerper() {
        if (this._fernWasserR) return this._fernWasserR;
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        return (this._fernWasserR = AnazhRealm._wasserKoerper(WG));
    }

    // DAS EINE WASSER (1110-2, die Ufer-Klumpen): der Ring trägt das Wasser nur, wo kein Wasser-Stoff es trägt. Lebt das
    // Fern-Wasser (`_ensureFarWaterSheet`), liegt der Spiegel des Rings unter dessen tiefstem Tal — der Spiegel − `drop` −
    // der Hub (`_wasserHubM`) —, und jenseits davon ist er der Ozean; ohne Fern-Wasser (Holz nah, kienspan) ist er die
    // Fläche (− `wasserDrop`). Bis hier lag er immer 0,4 m unter dem Spiegel: das Fern-Wasser (− 0,35 m, Hub bis 4,42 m)
    // zeigte in jedem tiefen Tal die flache Ring-Fläche im dunklen Fern-Blau (die Meeres-Station: die dunklen Klumpen).
    _fernRingWasserTiefe() {
        const fw = this.state.farWater;
        if (!fw || !fw.mesh) return AnazhRealm.FERN_RING.wasserDrop;
        return AnazhRealm.FAR_WATER.drop + AnazhRealm._wasserHubM() + 0.1;
    }

    // Wechselt die Tiefe des Ring-Wassers (das Fern-Wasser kommt oder geht), setzt der Ring jeden nassen Punkt neu — durch
    // die EINE Setz-Naht, mit dem Gesetz, das der Fern-Faden dem Punkt gab (kein neues Gesetz).
    _fernRingWasserNeu(fr) {
        const tiefe = this._fernRingWasserTiefe();
        if (fr.wasserTiefe === tiefe) return 0;
        fr.wasserTiefe = tiefe;
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        const dirty = [false, false, false];
        let n = 0;
        const bis = Math.min(fr.totalVerts, fr.cursor);
        for (let g = 0; g < bis; g++) {
            if (!fr.nass[g]) continue;
            const p = this._fernRingPunkt(fr, g);
            this._fernRingSetzVertex(fr, p, wl);
            dirty[p.s] = true;
            n++;
        }
        this._fernRingHoch(fr, dirty);
        return n;
    }

    // DER EINE HOCHLADE-HELFER der Schalen-Geometrie: je bewegte Schale Lage, Farben und die Normalen (das Licht braucht sie)
    // — über das VOLLE Index-Muster der Schale (`fr.geos`; die Teile der Schale 0 teilen dieselben Attribute).
    _fernRingHoch(fr, dirty) {
        for (let s = 0; s < fr.geos.length; s++) {
            if (!dirty[s]) continue;
            const geo = fr.geos[s];
            geo.attributes.position.needsUpdate = true;
            AnazhRealm._fernRingAttributeHoch(geo);
            geo.computeVertexNormals();
        }
    }

    // Die Teile in die drei Farb-Attribute EINES Vertex: color = der Boden, aKrone = (Kronendach, Deckung), aNass = der Anteil
    // des Wassers (der Ring-Stoff zeichnet ihn mit dem Blick des Wassers, `_wasserBlick`).
    // Die Reihen einer Schale (inner → aussen, geometrisch): der Reihen-Faktor q ist 1 + `seite` × die Winkel-Breite 2π/W —
    // die Masche ist radial höchstens `seite`-mal so tief wie breit, an jedem Radius.
    static _fernRingReihen(inner, aussen) {
        const F = AnazhRealm.FERN_RING;
        const q = 1 + (F.seite * 2 * Math.PI) / F.winkel;
        return Math.ceil(Math.log(aussen / inner) / Math.log(q)) + 1;
    }

    static _fernRingSchreibe(geo, li, t) {
        geo.attributes.color.setXYZ(li, t[0], t[1], t[2]);
        geo.attributes.aKrone.setXYZW(li, t[3], t[4], t[5], t[6]);
        geo.attributes.aNass.setX(li, t[7]);
    }
    static _fernRingAttributeHoch(geo) {
        geo.attributes.color.needsUpdate = true;
        geo.attributes.aKrone.needsUpdate = true;
        geo.attributes.aNass.needsUpdate = true;
    }

    // DIE FERN-KRONE DES NAHEN BODENS (0910-8, „die weiße Masse“): der Fern-Ring trägt den Wald als Kronendach × Deckung
    // (`_fernFarbeTeile`), aber unter dem Chunk-Quadrat deckt ihn der Boden-Satz. Der gezeichnete Wald endet am Laub-Radius
    // des Reglers (gemessen 11.10. an der Wiese: dichte Kronen bis 120 m bei Laub-Radius 115, bis 200 m bei 235) und ab 384 m
    // vom Auge (die Karte des Baums); dazwischen trug NIEMAND den Wald — der Boden-Satz zeigte nackten Boden, aus 420 m Höhe das
    // ganze Quadrat (das weiße Quadrat im Oliv des Panoramas). Jetzt liest der Boden-Satz dort, wo kein echter Wald zeichnet,
    // DIESELBEN Teile wie der Fern-Ring (`_fernFarbeTeile` an ganzzahligen Punkten; der Ring liest sie über sein Gedächtnis,
    // die Karte daneben — ihre Füllung je Chunk-Wechsel verdrängte sonst die Ring-Punkte) aus einer Karte über dem Quadrat
    // und mischt zum Kronendach × Saison nach der Deckung (`_fernKroneNahMisch`) — wie der Ring-Stoff, eine Formel.
    // Die Kronenfarbe reist sRGB-kodiert in 8 Bit (linear lägen 0,03–0,1 in 8–25 Stufen), die Deckung linear im Alpha.
    // Die Karte füllt sich im Fern-Farb-Budget und tauscht erst, wenn sie ganz steht (`bereit`); bis dahin mischt nichts.
    static get FERN_KRONE_NAH() {
        return Object.freeze({ N: 64, rand: 3, saumM: 30, sichtM: 384 });
    }
    _fernKroneNahEnsure() {
        const st = this.state;
        if (st.fernKroneNah) return st.fernKroneNah;
        const TSL = THREE.TSL;
        const K = AnazhRealm.FERN_KRONE_NAH;
        const daten = new Uint8Array(K.N * K.N * 4);
        const tex = new THREE.DataTexture(daten, K.N, K.N, THREE.RGBAFormat, THREE.UnsignedByteType);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = false;
        tex.name = "fern-krone-nah";
        tex.needsUpdate = true;
        const U = this._uniformHeimatTeilen({
            mitte: TSL.uniform(new THREE.Vector2(0, 0)),
            groesse: TSL.uniform(1),
            bereit: TSL.uniform(0),
            waldR: TSL.uniform(0),
            spieler: TSL.uniform(new THREE.Vector2(0, 0)),
        });
        st.fernKroneNah = { N: K.N, tex, daten, puffer: new Uint8Array(K.N * K.N * 4), U, job: null, anker: null };
        return st.fernKroneNah;
    }

    _fernKroneNahTakt() {
        const st = this.state;
        const k = st.fernKroneNah || this._fernKroneNahEnsure();
        const pm = st.playerMesh;
        if (!k || !pm) return;
        const K = AnazhRealm.FERN_KRONE_NAH;
        k.U.waldR.value = Number.isFinite(st.foliageRadius) ? st.foliageRadius : AnazhRealm.PERF_FOLIAGE_RADIUS_MAX;
        k.U.spieler.value.set(pm.position.x, pm.position.z);
        const ring = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        const span = this._voxelChunkConfig().span;
        const groesse = span * (2 * ring + 1 + K.rand);
        const mx = (Math.floor(pm.position.x / span) + 0.5) * span;
        const mz = (Math.floor(pm.position.z / span) + 0.5) * span;
        const a = k.anker;
        if (k.job || (a && a.x === mx && a.z === mz && a.groesse === groesse) || !this._nebenFaden("fern")) return;
        // DIE KARTE AUS DEM FADEN (B2): je Texel die Teile am ganzzahligen Punkt (Wasser ohne Krone) — der Fern-Faden packt sie
        // sRGB in 8 Bit, der Haupt-Faden tauscht die Karte erst, wenn sie ganz steht (`bereit`)
        const N = k.N;
        const punkte = new Float64Array(N * N * 2);
        for (let i = 0; i < N * N; i++) {
            const ix = i % N;
            const iz = (i / N) | 0;
            punkte[i * 2] = Math.round(mx - groesse / 2 + ((ix + 0.5) * groesse) / N);
            punkte[i * 2 + 1] = Math.round(mz - groesse / 2 + ((iz + 0.5) * groesse) / N);
        }
        const job = (k.job = { mx, mz, groesse });
        this._fernAuftrag("krone", { punkte }, [punkte.buffer])
            .then((antwort) => {
                if (k.job === job) k.job = null;
                if (st.fernKroneNah !== k) return;
                k.daten.set(antwort.rgba);
                k.tex.needsUpdate = true;
                k.U.mitte.value.set(mx, mz);
                k.U.groesse.value = groesse;
                k.U.bereit.value = 1;
                k.anker = { x: mx, z: mz, groesse };
            })
            .catch((e) => {
                if (k.job === job) k.job = null;
                this._stoffBruch("die Fern-Krone des nahen Bodens (der Fern-Faden)", e);
            });
    }

    // Die Mischung im Boden-Stoff (TSL): wo kein echter Wald zeichnet — jenseits des Laub-Radius vom Spieler (mit Saum)
    // oder jenseits der Karten-Sicht des Baums vom Auge —, trägt der Boden das Kronendach × Saison nach der Deckung, wie der
    // Fern-Ring. Der Ring reicht seine Ecken-Krone (`kroneVertex`, aKrone): über dem Chunk-Quadrat liest er die Karte wie der
    // Chunk daneben (dieselbe Farbe an der Naht), jenseits seine Ecken. Ohne Karte, Saison oder TSL bricht der Boden-Stoff laut.
    // DIE EINE GRENZE ZWISCHEN WALD UND DACH (K53): diesseits zeichnet der echte Wald (Laub-Radius vom Spieler, Karten-Sicht vom
    // Auge), jenseits trägt der Boden das Kronendach der Deckung (`_fernKroneNahMisch`). Die Laubstreu der echten Kronen
    // (`_wegeBodenFarbe`) liest dieselbe Grenze: unter dem Dach liegt sie im Mittel des Gesetzes, nie ein zweites Mal — bis K53
    // lag sie jenseits unter dem Dach UND im Boden (gate:nah-fern Luft aus: Y −2,5 %, Grün −0,02 gegen das Gesetz).
    _fernKroneOhneWald(_T) {
        const k = this._fernKroneNahEnsure();
        if (!k || !_T.positionWorld || !_T.cameraPosition)
            throw new Error("Fern-Krone (nah): die Grenze des Walds braucht Karte und TSL");
        const K = AnazhRealm.FERN_KRONE_NAH;
        const dSp = _T.positionWorld.xz.sub(k.U.spieler).length();
        const dAuge = _T.positionWorld.sub(_T.cameraPosition).length();
        return _T.max(
            _T.smoothstep(k.U.waldR, k.U.waldR.add(K.saumM), dSp),
            _T.smoothstep(_T.float(K.sichtM - K.saumM), _T.float(K.sichtM), dAuge)
        );
    }

    _fernKroneNahMisch(_T, alb, kroneVertex = null) {
        const k = this._fernKroneNahEnsure();
        const su = this._ensureSeasonUniforms();
        if (!k || !su || !su.uSeasonMul || !_T.texture || !_T.positionWorld || !_T.cameraPosition)
            throw new Error("Fern-Krone (nah): der Boden-Stoff braucht Karte, Saison-Uniform und TSL");
        const xz = _T.positionWorld.xz;
        const uv = xz.sub(k.U.mitte).div(k.U.groesse).add(0.5);
        const s = _T.texture(k.tex, uv);
        const innen = _T.step(_T.max(uv.x.sub(0.5).abs(), uv.y.sub(0.5).abs()), _T.float(0.5));
        const ohneWald = this._fernKroneOhneWald(_T);
        const karte = innen.mul(k.U.bereit);
        if (!kroneVertex) return _T.mix(alb, s.rgb.mul(su.uSeasonMul), s.a.mul(ohneWald).mul(karte));
        const krone = _T.mix(kroneVertex, s, karte);
        return _T.mix(alb, krone.rgb.mul(su.uSeasonMul), krone.a.mul(ohneWald));
    }

    // DER HORIZONT AUS DEM FADEN (B2): der Ring bestellt seine Punkte in Scheiben (`FERN_RING.scheibe`) beim Fern-Faden
    // (`_fernAuftrag` „ring“: Gesetzes-Höhe mit Deck-Mischung, Schutt, Fläche und Spiegel, Fluss der Masche, Teile) — höchstens
    // `scheibenImFlug` zugleich, in Index-Folge (nah zuerst) — und hängt die Antworten im Takt ein (`_fernRingEinhaengen`). Der
    // Haupt-Faden rechnet kein Gesetz der Ferne: bis B2 rechnete die Scheibe hier Höhe und Fern-Farbe (Radeon kalt bis zum
    // ersten Bild 3,89 s, Spike B1), und jeden Re-Anker malte der GPU-Maler ein zweites Mal. Liefert die eingehängten Punkte.
    _fernRingRefresh() {
        const fr = this.state.fernRing;
        if (!fr) return 0;
        const done = this._fernRingEinhaengen(fr);
        if (fr.cursor >= fr.totalVerts) {
            this._fernRingDeckWache(fr);
            return done;
        }
        const F = AnazhRealm.FERN_RING;
        if (!this._nebenFaden("fern")) return done; // der Fern-Faden steht noch nicht (der Voxel-Faden kommt) — der Ring wartet
        while (fr.flug < F.scheibenImFlug && fr.auftrag < fr.totalVerts) {
            const von = fr.auftrag;
            const n = Math.min(fr.totalVerts, von + F.scheibe) - von;
            fr.auftrag = von + n;
            fr.flug++;
            const punkte = new Float64Array(n * 2);
            const ht = new Float64Array(n);
            const hr = new Float64Array(n);
            const rad = new Float64Array(n);
            const zone = new Uint8Array(n);
            for (let k = 0; k < n; k++) {
                const p = this._fernRingPunkt(fr, von + k);
                punkte[k * 2] = p.x;
                punkte[k * 2 + 1] = p.z;
                ht[k] = p.fuss.ht;
                hr[k] = p.fuss.hr;
                rad[k] = p.rad;
                // die Bau-Zone: dort trägt der Punkt das volle Gesetz (Loch-Deckel und Naht) und immer seine Teile
                zone[k] = p.s === 0 && p.rad <= fr.bauZoneRad ? 1 : 0;
            }
            const gen = fr.gen | 0;
            this._fernAuftrag(
                "ring",
                {
                    punkte,
                    ht,
                    hr,
                    rad,
                    zone,
                    ax: fr.anchorX,
                    az: fr.anchorZ,
                    deckZoneRad: fr.deckZoneRad,
                    memo: this._fernMemoGen | 0,
                },
                [punkte.buffer, ht.buffer, hr.buffer, rad.buffer, zone.buffer]
            )
                .then((antwort) => {
                    if (this.state.fernRing !== fr || (fr.gen | 0) !== gen) return; // überholt (Re-Anker/Dispose)
                    fr.flug--;
                    fr.einhaengen.push({ von, antwort });
                })
                .catch((e) => {
                    if (this.state.fernRing === fr && (fr.gen | 0) === gen) fr.flug--;
                    this._stoffBruch("der Fern-Ring (der Fern-Faden)", e);
                });
        }
        return done;
    }

    // DAS EINHÄNGEN (B2): die Antworten des Fern-Fadens in Index-Folge — je Punkt das Gesetz in die Gedächtnisse des Rings
    // (Höhe, Schutt, voll, Fläche, Spiegel, Fluss, Teile), dann Lage und Farbe durch die EINE Setz-Naht; EIN Hochladen je Takt.
    // Erst der volle Ring wird sichtbar (kein Null-Blob).
    _fernRingEinhaengen(fr) {
        if (!fr.einhaengen.length) return 0;
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        const dirty = [false, false, false];
        let done = 0;
        fr.einhaengen.sort((a, b) => a.von - b.von);
        while (fr.einhaengen.length && fr.einhaengen[0].von === fr.cursor) {
            const { von, antwort: a } = fr.einhaengen.shift();
            const n = a.law.length;
            fr.law.set(a.law, von);
            fr.schutt.set(a.schutt, von);
            fr.nassY.set(a.nassY, von);
            fr.spiegel.set(a.spiegel, von);
            fr.flussC.set(a.flussC, von);
            fr.flussSp.set(a.flussSp, von);
            fr.teile.set(a.teile, von * 8);
            for (let k = 0; k < n; k++) {
                const v = a.voll[k];
                if (v === v) fr.vollY[von + k] = v;
                const p = this._fernRingPunkt(fr, von + k);
                this._fernRingSetzVertex(fr, p, wl);
                dirty[p.s] = true;
            }
            fr.cursor = von + n;
            done += n;
        }
        this._fernRingHoch(fr, dirty);
        fr.refreshed += done;
        if (!fr.ready && fr.cursor >= fr.totalVerts) {
            fr.ready = true;
            for (const m of fr.meshes) m.visible = true;
        }
        return done;
    }

    // Deck-Wache: Chunks bauen/fallen NACH dem Ring-Anstrich → die Deck-Zone folgt dem Chunk-Strom
    // rollierend (128 Vertices/Tick durch dieselbe Setz-Naht). Zählt nie als Refresh
    // (fr.refreshed/cursor unverändert — die Gate-Bänder lesen sie). Hoch lädt sie und die Normalen rechnet sie nur, wenn
    // ein Punkt seine Höhe ändert (Welle C, Lehre 25 — gemessen 06.10., echte GPU, Mess-Wiese in Ruhe: computeVertexNormals
    // über 3 072 Vertices und drei volle Attribut-Uploads JEDEN Frame, ohne dass ein Chunk kam oder ging).
    _fernRingDeckWache(fr) {
        const F = AnazhRealm.FERN_RING;
        if (fr.zoneVerts === undefined) {
            const sh = fr.schalen[0];
            let rows = 0;
            while (
                rows < sh.reihen &&
                sh.inner * Math.pow(sh.aussen / sh.inner, rows / (sh.reihen - 1)) <= fr.bauZoneRad
            )
                rows++;
            fr.zoneVerts = rows * F.winkel;
        }
        if (!fr.zoneVerts) return;
        // DIE EDIT-WACHE (K16, VOR der Stand-Wache): ein Edit schreibt das Feld um — die Feld-Fläche des Rands
        // (`_fernRingFeldY`) fällt nur an den Ecken um den neuen Edit (Radius + 4 m), und die Edit-Generation weckt die
        // Wache. Vorher stand die Prüfung hinter der Stand-Wache: bei ruhendem Stand sah sie keinen Edit (27,4 s, Deck-
        // Cursor +0), und weckte sie später ein Chunk-Wechsel, löschte sie alle 1 081 Rand-Flächen.
        const ed = this.state.worldMeta && this.state.worldMeta.voxelEdits;
        const edN = Array.isArray(ed) ? ed.length : 0;
        if (fr.feldEdits !== ed || fr.feldEditsN !== edN) {
            const rand = fr.teilung && fr.teilung.randV;
            if (fr.feldEdits === ed && edN > (fr.feldEditsN | 0) && rand) {
                for (let k = fr.feldEditsN | 0; k < edN; k++) {
                    const e = ed[k];
                    if (!e || !Number.isFinite(e.x) || !Number.isFinite(e.z)) continue;
                    const r2 = ((Number(e.r) || 0) + 4) ** 2;
                    for (let i = 0; i < fr.zoneVerts; i++) {
                        const p = this._fernRingPunkt(fr, i);
                        if (rand[p.li] && (p.x - e.x) ** 2 + (p.z - e.z) ** 2 <= r2) fr.feldY[p.g] = NaN;
                    }
                }
            } else fr.feldY.fill(NaN);
            fr.feldEdits = ed;
            fr.feldEditsN = edN;
            fr.feldEditGen = (fr.feldEditGen | 0) + 1;
        }
        // DIE STAND-WACHE (Welle K): die Höhe eines Saum-Punkts hängt nur an der Chunk-Menge (`_chunkDecktRing`), dem
        // Wasserspiegel, dem Anker und der Edit-Generation — steht das alles, ging eine volle Runde ohne neuen Punkt,
        // schläft die Wache.
        if (this._standRuht("deckWache", fr.zoneVerts, (fr.gen | 0) * 1048576 + (fr.feldEditGen | 0), "boden")) return;
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        fr.deckCursor = fr.deckCursor || 0;
        // DAS GESETZ DES SAUMS kommt aus dem Fern-Faden (B2, `fr.law` · `fr.vollY`, einmal je Anker): die Wache rechnet keine
        // Höhe, sie fragt nur, ob die Naht den Punkt jetzt anders legt.
        const pos = fr.geos[0].attributes.position;
        let neu = false;
        let feldMessungen = 0;
        let offen = false;
        for (let n = 0; n < 128; n++) {
            const i = fr.deckCursor % fr.zoneVerts;
            const p = this._fernRingPunkt(fr, i);
            // DIE ECKE EINES NAHT-DREIECKS misst die Fläche des Feldes (gedeckelt je Takt: eine Spalten-Probe liest die
            // Dichte von der Garantie-Luft bis zum Boden)
            if (fr.feldY[p.g] !== fr.feldY[p.g] && fr.teilung.randV && fr.teilung.randV[p.li]) {
                if (feldMessungen < F.feldJeTakt) {
                    this._fernRingFeldY(fr, p);
                    feldMessungen++;
                } else offen = true;
            }
            if (Math.fround(this._fernRingY(fr, p, wl)) !== pos.getY(p.li)) {
                this._fernRingSetzVertex(fr, p, wl);
                neu = true;
            }
            fr.deckCursor++;
        }
        this._standMeldet("deckWache", 128, neu, offen);
        if (!neu) return;
        this._fernRingHoch(fr, [true]);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_fern]);

// ===== ATLAS · Gelaende/fern — Außen-Konstanten =====
// DETAIL_CASCADE (unten) — die EINE frozen Distanz→Detail-Tabelle für `_detailBand(r)` (r =
// Chebyshev-Chunk-Distanz): `maxRing` = obere Ring-Grenze (× 43.2 m; die Band-0-Kante teilt die Schatten-Kaskaden),
// `aiDiv` = KI-Richtung nur jeden N-ten Frame (dazwischen glatt weiter). Ein Feld wächst erst mit seinem Leser (kein
// Passagier). Die Geometrie-Stufe des Bodens ist die Kette seines Netzes (`BODEN_STUFEN`, K51): sie lag hier als `lod`
// und koppelte das Netz an die Schatten-Kante — L0 bis Ring 2 hiess 25 volle Chunks, wo die Nah-Zone 9 braucht.
// FAR_WATER — grobes Atlas-Wasser-Sheet jenseits des Voxel-Rings bis `maxRadius` (dahinter trägt der
// Fern-Ring den Spiegel flach, die Luft dunstet beide): `step` = span/4 (Grid auf Chunk-Grenzen), `drop` = Spiegel knapp unter der
// Nah-Kräusel-Zone, `dip` taucht Ufer-Anker unters Terrain (edgeFade), `depth` = konstante
// Tiefen-Farbe (O(1)-Bau), `reanchorDist`/`rebuildDelta` = Rebuild-Hysterese.
AnazhRealm.FAR_WATER = Object.freeze({
    step: 10.8,
    maxRadius: 720,
    drop: 0.35,
    dip: 3.5,
    depth: 3.5,
    reanchorDist: 86.4,
    rebuildDelta: 80,
});
// DIE MASCHE DES FERN-RINGS (K16): je Schale so viele geometrische Reihen, dass eine Masche radial höchstens `seite`-mal so
// tief ist wie breit (`_fernRingReihen`) — 16 Reihen je Schale gaben Schale 0 Maschen 10 : 1 (Reihen-Faktor 1,32 gegen
// 2π/192): jeder Makro-Blick zeigte radiale Streifen um den Spieler. Der Snap bleibt unter der Maschen-Breite am
// sichtbaren Innenrand (Schale 0 ab der Chunk-Kante ~200 m), sonst fallen Punkte zusammen; Schale 0 trägt die
// Deck-Zone ganz (Ring 12: 729 m).
AnazhRealm.FERN_RING = Object.freeze({
    winkel: 192,
    seite: 3,
    schalen: Object.freeze([
        Object.freeze({ aussen: 800, snap: 6 }),
        Object.freeze({ aussen: 3000, snap: 24 }),
        Object.freeze({ aussen: 8000, snap: 64 }),
    ]),
    randPad: 40,
    saumDrop: 6,
    // DIE WEICHE IM SAUM DES GEBAUTEN (`_fernRingRegel` 1): so tief (m, senkrecht) weicht der Ring dem Chunk in der ersten
    // Voxel-Spalte am Rand des Gebauten — über der Sehne des Rings (Ring 3 mit Stufe 1 an der Bau-Kante: Naht p95 1,3 m, max 4,3 m) und der Abweichung des Chunks
    // (±0,4 m); längs des Strahls gekappt (`nahtWeicheMax`), damit der streifende Blick nicht ferne Hänge durch den Saum zieht.
    nahtWeiche: 6,
    nahtWeicheMax: 24,
    // die Feld-Flächen des Naht-Rands, die die Deck-Wache je Takt misst (`_fernRingFeldY`)
    feldJeTakt: 12,
    wasserDrop: 0.4,
    reanchorDist: 180,
    anchorQuant: 24,
    scheibe: 512,
    scheibenImFlug: 3,
});
AnazhRealm._wasserHubM = function () {
    const W = AnazhRealm.WASSER_WELLE;
    const duenung = 0.5 * (W.duenung[0] + W.duenung[1] + W.duenung[2]);
    const kraeusel = W.kraeusel * Math.max(1 + W.oktave - W.mitte, W.mitte) * W.kraeuselDecke;
    // der Wind des Gesetzes skaliert beides (Amplitude × (w0 + w1 · Wind), Wind 0 ruhig … 1 Sturm)
    const WG =
        AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
    return (duenung + kraeusel) * (WG.wind[0] + WG.wind[1]);
};
