class AnazhRealm_Z09 {
    // ===== ATLAS §09 · KASKADE/KERN-STATICS — Detail-Kaskade · frozen Signaturen/Konstanten =====
    // DIE STUFE EINES CHUNKS (K51-2, CDLOD): aus dem KASTEN-Abstand des Spielers (px, pz in Metern) zum Chunk-Quadrat
    // (Chebyshev) — verfeinert, sobald er unter `bis + vorlauf` seiner Stufe fällt (`BODEN_STUFEN`), mit `currentLod`
    // (Streaming-Takt) hält die Hysterese einen feineren Chunk, bis der Abstand `bis + vorlauf + halt` erreicht. Der
    // Wechsel geschieht so nur, wo jeder Vertex des Chunks ganz auf der gröberen Fläche liegt (Gewicht 1, `_stufeGewicht`):
    // der Ring der Stufe-0-Zone (r ≤ 1) war für die CDLOD-Bedingung zu grob — ein Chunk-Ring trägt 2 Spannen Abstand.
    _voxelChunkLodFor(cx, cz, px, pz, currentLod = null) {
        const B = AnazhRealm.BODEN_STUFEN;
        const S = this._voxelChunkConfig(0).span;
        const d = Math.max(Math.max(cx * S - px, 0, px - (cx + 1) * S), Math.max(cz * S - pz, 0, pz - (cz + 1) * S));
        const st = B.stufen;
        let lod = st[st.length - 1].lod;
        for (let i = 0; i < st.length; i++)
            if (d < st[i].bis + B.vorlauf) {
                lod = st[i].lod;
                break;
            }
        // Hysterese nur beim VERGRÖBERN; verfeinern greift sofort — Detail erscheint prompt, nur das Entfernen ist träge
        if (currentLod === null || !Number.isFinite(currentLod) || currentLod >= lod) return lod;
        const halt = st.find((x) => x.lod === currentLod);
        return halt && d < halt.bis + B.vorlauf + B.halt ? currentLod : lod;
    }

    // DAS GEWICHT DER STUFE am Welt-Punkt (x, z): 0 im Inneren der Stufe `lod`, 1 an ihrer Grenze `bis` — smoothstep über das
    // Übergangs-Band `band` im Chebyshev-Abstand zum Auge der Stufen (`state.stufeAuge`, der Spieler des Streaming-Takts).
    // Der CPU-Spiegel des Boden-Stoffs (`_buildPbrNodeMaterial` geomorph); Leser: der Boden-Leser und die Sprung-Linse.
    _stufeGewicht(lod, x, z) {
        const st = AnazhRealm.BODEN_STUFEN.stufen[Math.min(2, Math.max(0, lod | 0))];
        const a = this.state.stufeAuge;
        if (!a || !(st.bis < Infinity)) return 0;
        const d = Math.max(Math.abs(x - a.x), Math.abs(z - a.z));
        const t = Math.max(0, Math.min(1, (d - (st.bis - st.band)) / st.band));
        return t * t * (3 - 2 * t);
    }

    // DER MORPH-CODE DES BODENS (K51-2): EIN Float je Vertex (`aMorphWeight`) trägt die Stufe des Chunks und das Naht-Gewicht
    // (0…1, `_applyCrossLodGeomorph`) — 2 · Stufe + Naht. Der Stoff liest beide: die Stufe wählt das Übergangs-Band, die Naht
    // zieht die Grenz-Zeile an den gröberen Nachbarn; der Faktor ist Naht + Stufe − Naht · Stufe (`_morphFaktor`).
    _morphCode(lod, naht) {
        return 2 * (lod | 0) + Math.max(0, Math.min(1, naht || 0));
    }
    _morphNaht(code) {
        return code - 2 * Math.floor(code * 0.5);
    }
    _morphFaktor(code, x, z) {
        const s = this._morphNaht(code);
        const w = this._stufeGewicht(Math.floor(code * 0.5), x, z);
        const U = this.state.atmoUniforms;
        const gm = U && U.geomorph ? U.geomorph.value : 1;
        return (s + w - s * w) * gm;
    }

    // DAS AUGE DER STUFEN: der Spieler des Streaming-Takts — die Stufen-Wahl und der Boden-Stoff lesen denselben Punkt
    _stufeAugeTakt(p) {
        const a = this.state.stufeAuge || (this.state.stufeAuge = { x: 0, z: 0 });
        a.x = p.x;
        a.z = p.z;
        const U = this.state.atmoUniforms;
        if (U && U.stufeAuge) U.stufeAuge.value.set(p.x, p.z);
    }

    // DAS ZIEL DER GRÖBEREN STUFE im Sync-Bau (Spiegel von `stufeZielNetz` im voxel-worker): das Netz der Stufe `grobLod` um
    // den Chunk-Ursprung mit einer Zelle Polster vor der Kante, die Ziele über das EINE Gesetz (gelaende-core `stufeZiel`)
    _stufeZielNetz(fein, feinNormal, feinFarbe, cx, cz, grobLod) {
        const g = this._voxelChunkConfig(grobLod);
        const gs = g.step;
        const ox = cx * g.span - 2 * gs;
        const oz = cz * g.span - 2 * gs;
        const oy = (this.state.terrainBaseHeight || 0) - g.floorDrop;
        const gd = g.dim + 4;
        const dichte = this._voxelEditedDensityGrid(`${cx},${cz},${grobLod},ziel`, ox, oy, oz, gd, g.dimY, gd, gs);
        const hoehle = this._voxelHoehlenGraph(dichte, ox, oy, oz, gd, g.dimY, gd, gs);
        const geo = this._voxelChunkGeometry(ox, oy, oz, gd, g.dimY, gd, gs, undefined, 1, dichte, 1, hoehle);
        const G = globalThis.__gelaendeCore;
        const leer = new Float32Array(0);
        if (!geo)
            return G.stufeZiel(fein, leer, new Uint32Array(0), gs, [
                { fein: feinNormal, grob: leer, einheit: true },
                { fein: feinFarbe, grob: leer },
            ]);
        this._attachVoxelFieldColors(geo);
        const A = geo.attributes;
        const ziel = G.stufeZiel(fein, A.position.array, geo.index.array, gs, [
            { fein: feinNormal, grob: A.normal.array, einheit: true },
            { fein: feinFarbe, grob: A.color.array },
        ]);
        geo.dispose();
        return ziel;
    }

    // Inline-Kollision beim Stream (`buildBVH`)? Entscheidet die Chebyshev-Distanz r zum Spieler-Chunk.
    _voxelChunkLazyBVHFor(cx, cz, pcx, pcz) {
        const r = Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
        // NUR der Spieler-Chunk (r===0) baut inline — ein Kollisions-Baum kostet ~10 ms/Chunk, 9 inline in
        // einem Frame waren ein ~300-ms-Lauf-Spike.
        return r === 0;
    }

    // explore-Magnitude emergiert aus Neuheit (erste Begegnung > Wiederkehr) + Distanz vom Ursprung +
    // Kühnheit (karge/glut-Aura via auraAt): ein neuer, ferner, karger Vorstoß bewegt viel, vertrautes
    // Pendeln wenig. `state.visitedRegions` ist reaktiv (nicht persistiert), bounded.
    _exploreMagnitude(pcx, pcz) {
        const cfg = AnazhRealm.EXPLORE;
        if (!this.state.visitedRegions) this.state.visitedRegions = new Set();
        const regions = this.state.visitedRegions;
        const key = pcx + "," + pcz;
        const novel = !regions.has(key);
        regions.add(key);
        if (regions.size > cfg.maxRegions) {
            const it = regions.values(); // Set hält Insertion-Order → die ältesten zuerst
            for (let i = 0; i < cfg.pruneRegions; i++) {
                const next = it.next();
                if (next.done) break;
                regions.delete(next.value);
            }
        }
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const dist = pm ? Math.hypot(pm.x, pm.z) : 0;
        const distTerm = Math.min(1, dist / cfg.distScale) * cfg.distWeight; // das epische Reisen
        let boldTerm = 0;
        if (pm) {
            const aura = this.auraAt(pm.x, pm.z, performance.now() / 1000);
            const bold = Math.max(0, Math.min(1, (1 - (aura.lebendig || 0)) * 0.5 + (aura.glut || 0) * 0.5));
            boldTerm = bold * cfg.boldWeight; // Kühnheit: in das Karge/Glühende wagen
        }
        const noveltyTerm = novel ? cfg.noveltyNew : cfg.noveltyRevisit;
        return Math.max(cfg.min, Math.min(cfg.max, cfg.base + noveltyTerm + distTerm + boldTerm));
    }

    // Der gebaute zusammenhängende Ring: größtes k, dessen Ringe 0..k VOLL stehen (mesh ODER empty;
    // pending/fehlend bricht; ≤ ~81 Map-Gets); null solange der Spieler-Chunk unbekannt ist.
    _builtRingRadius() {
        const st = this.state;
        if (!st || !st.voxelChunks || !st.lastPlayerVoxelChunk) return null;
        const cfg = this._voxelChunkConfig();
        const { cx, cz } = st.lastPlayerVoxelChunk;
        let k = -1;
        outer: for (let ring = 0; ring <= cfg.ringRadius; ring++) {
            for (let dx = -ring; dx <= ring; dx++) {
                for (let dz = -ring; dz <= ring; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                    const e = st.voxelChunks.get(`${cx + dx},${cz + dz}`);
                    if (!e || (!e.mesh && !e.empty)) break outer;
                }
            }
            k = ring;
        }
        return k;
    }

    _setLastPlayerVoxelChunk(pcx, pcz) {
        if (!this.state) return;
        // Erkundung: betritt der Spieler einen anderen Chunk, heben sich awe + hope — rate-limitiert (~6 s)
        // und graduiert über `_exploreMagnitude` (Neuheit + Distanz + Kühnheit).
        const prev = this.state.lastPlayerVoxelChunk;
        if (prev && (prev.cx !== pcx || prev.cz !== pcz)) {
            const now = performance.now() / 1000;
            if (now - (this.state.lastExploreFelt ?? -Infinity) >= 6) {
                this.state.lastExploreFelt = now;
                this._feelAction("explore", { magnitude: this._exploreMagnitude(pcx, pcz) });
            }
        }
        this.state.lastPlayerVoxelChunk = { cx: pcx, cz: pcz };
    }

    // === Wasser-Substanz: die Voxel-Cell-Zustände ===
    // Eine Cell ist LUFT (begehbar), WASSER (Spieler schwimmt, der Iso-Mesher baut hier die Boundary)
    // oder FEST (Land/Architektur/Voxel-Fill) — EINE Sprache mit dem Voxel-Terrain.
    static get CELL_STATE() {
        return Object.freeze({ AIR: 0, WATER: 1, SOLID: 2 });
    }

    // Die AQUIFER-Regel des Zell-Gesetzes: eine Zelle tiefer als so viele Meter unter der Makro-Fläche und über dem
    // Wassertisch bleibt trocken (ein Oberflächen-See flutet die Höhlen darunter nicht). Leser: der Zell-Bau
    // (`_buildVoxelChunkWaterCells`, Worker-Spiegel `buildWaterCells` bit-identisch) und die Decke am Körper (`_koerperWasser`).
    static get AQUIFER_TIEFE_M() {
        return 18;
    }

    // DIE AQUIFER-REGEL als EINE Rechnung (Zell-Bau, Worker-Spiegel `aquiferTrocken`, die Decke am Körper): eine Zelle ist
    // trockene Höhle, wenn sie tiefer als AQUIFER_TIEFE_M unter der Makro-Fläche und über dem Wassertisch liegt UND Fels über
    // ihr steht (`unterFels`). Unter offenem Himmel (eine Schlucht) ist eine Zelle nie Höhle: bis zur Gegenprüfung 07.10.
    // (Runde 3) trocknete die Regel jeden Fluss, der sich tiefer als 18 m unter die Makro-Fläche schneidet (Quelle der Kachel
    // −664/−2264: Spiegel 90,38 über dem Schlucht-Boden 86,32, der Körper trocken, das Sheet hing schräg über der Schlucht).
    static _aquiferTrocken(cy, makroY, tischY, unterFels) {
        return unterFels && cy < makroY - AnazhRealm.AQUIFER_TIEFE_M && cy > tischY;
    }

    // Welle C — der Schwarz-Floor für Flach-Farb-Strukturen (Eigen-Leuchten in
    // der Materialfarbe, hebt Stein/Eisen nachts über Schwarz). Browser-justierbar.
    static get STRUCTURE_EMISSIVE() {
        return Object.freeze({ intensity: 0.07 });
    }

    // Manifold-Dual-Contouring-Schärfe-Regler. MÜSSEN bit-identisch zum `voxel-worker.js`-Mirror sein
    // (Worker- und Main-Chunks brauchen koinzidente Boundary-Vertices). DC_LAMBDA: QEF→Mass-Point-
    // Regularisierung (klein=scharf). DC_SHARP_MOVE2: ab welcher Verschiebung² ein Vertex „Feature" ist
    // (der feature-bewusste Laplacian verschont ihn).
    static get DC_LAMBDA() {
        return 0.1;
    }
    static get DC_SHARP_MOVE2() {
        return 0.04;
    }

    // Kavitäts-AO zeichnet Surface-Nets-Facetten-Kanten als Treppen-/Trapez-Linien nach → Strength
    // gedämpft; die triplanar-Textur trägt die Tiefe.
    static get TERRAIN_AO() {
        return Object.freeze({ strength: 0.4, cap: 0.18 });
    }

    // Eingefrorener 2.5D-Lichtungs-Wert (der eine Tuning-Hebel). NUR die Shading-Normale (Material-
    // normalNode + AO in _buildToonNodeMaterial), NIE die Geometrie. Der Schatten-Versatz liest dieselbe End-Normale:
    // r184 schiebt die Probe um `normalWorld` × normalBias, und `normalWorld` IST die Normale dieses normalNode (setupNormal) —
    // bei 1,0 zeigt der Versatz (`_schattenBias`, 0,5 Texel) auch am Hang senkrecht nach oben, nie entlang der Fläche.
    static get TERRAIN_NORMAL_FLATTEN() {
        return 1.0;
    }

    // Die Boden-Karte (`_bodenKarteAusMesh`) teilt den Voxel-Schritt in so viele Gitter-Abstände (LOD 0: 1,8 m / 4 =
    // 0,45 m) — fein genug, dass die bilineare Lesung der Dreiecks-Fläche auf ≤ 2 cm folgt (Median).
    static get BODEN_KARTE_TEILUNG() {
        return 4;
    }

    // DIE NAH-WIESE (V18.508): nah am Auge wächst die Wiese aus dem Studio-Gras (Foundry „gras", Stufen
    // aus `kindStages.grass`), jenseits trägt die Boden-Funktion. Kosten an den SCHIRM gebunden (Gebot 7):
    // ein Kachel-Ring um die Kamera, nie je Chunk; gezeichnet wird je Büschel, was das Auge sieht (der Sicht-Satz
    // `_nahWieseSicht`, EINE Senke je Vorlage × Stufe × Teil). `stufe1` = Radius der feinen Stufe (L1) um das Auge, je
    // Büschel, `stufe1Rand` = ihr Austritt dahinter (Hysterese), `radius` = Ende der Büschel, `rand` = Ausdünnungs-Band
    // davor (ein Büschel zeigt sich, solange seine Würfel-Ordnung unter dem Anteil seiner Distanz liegt), `kachel` =
    // Kachel-Kante (Bau- und Grob-Cull-Einheit). Raster, Dichte-Gesetz und Skala kommen aus dem Studio
    // (understory.grassStep · groundCover.grass · placement.scale.gras).
    static get NAH_WIESE() {
        return Object.freeze({ kachel: 6, stufe1: 5, stufe1Rand: 0.5, radius: 14, rand: 4, kachelnJeTakt: 1 });
    }

    // DIE BODEN-PALETTE (`_bodenFarbeAt`, linear wie das Vertex-Attribut): die Studio-Palette PORTAL_GROUND
    // (foundry-core, synchron über den Terrain-Namensraum) nach dem FARB-GESETZ — jedes Hex ist eine sRGB-
    // ABSICHT, die Albedo sein linearer Wert. Bis V18.530 trug die Welt ihren eigenen Zwilling (stone · earth ·
    // dampEarth …) mit Absichts-Werten ROH als linear (Stein 0,42/0,44/0,49 statt 0,15, Sand 0,87 statt 0,58);
    // der Chunk-Stoff multiplizierte die Vertex-Farbe ein zweites Mal (Albedo = Farbe², ein zufälliges Gamma 2
    // für den Boden, das die Wiese MEADOW_GREEN·Farbe nur halb so hell ließ). Einmal je Sitzung dekodiert;
    // der Voxel-Worker bekommt DIESELBEN Zahlen im Init-Schnappschuss (`bodenPalette`), kein Spiegel. Ohne die
    // Palette bricht der Boden laut (Kern-Pflicht).
    static get BODEN_FARBE() {
        if (AnazhRealm._bodenFarbeMemo) return AnazhRealm._bodenFarbeMemo;
        const PG =
            AnazhRealm.Gesetz("terrain:PORTAL_GROUND", null) || AnazhRealm._kernPflichtBruch("terrain:PORTAL_GROUND");
        const out = {};
        for (const k of Object.keys(PG)) out[k] = Object.freeze(AnazhRealm._srgbHexLinear(PG[k]));
        AnazhRealm._bodenFarbeMemo = Object.freeze(out);
        return AnazhRealm._bodenFarbeMemo;
    }

    // Das FARB-GESETZ als EINE Rechnung: ein sRGB-Hex (die Absicht des Farbwählers) → [r, g, b] linear (die
    // sRGB-Übertragungs-Funktion IEC 61966-2-1). Rein, ohne THREE (die Palette steht vor dem Renderer).
    static _srgbHexLinear(hex) {
        const dek = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        return [dek(((hex >> 16) & 255) / 255), dek(((hex >> 8) & 255) / 255), dek((hex & 255) / 255)];
    }

    // DER WIESEN-GRUND (K53, EINE Quelle): wo der Boden grün ist (die Wiesen-Wache `gruenSchwelle`: g − (r+b)/2), deckt ihn
    // das Gras — aus der Ferne das MITTEL des Halms, das Integral der Halm-Farbe (h ∈ [0, 1]: mix(Wurzel, Spitze, h) ·
    // (0,65 + 0,35 h)) = 0,383 · Wurzel + 0,442 · Spitze, Y 0,17 wie das Studio-Gras der Nah-Wiese; die karge Stelle (Fleck
    // λ 7,7 m, `rauschM`) zeigt mehr Grund: Gewicht 0,5 … 1 der Wache. Das Gesetz rechnet ihn (`_bodenFarbeAt`, der Worker
    // `attachFieldColors` mit diesem Schnappschuss), nie das Fragment: bis K53 mischte ihn nur der Boden-Stoff (V18.346), der
    // Feld-Pass und das Panorama zeigten den nackten Grund (`mead`, aus 45 m eine oliv-gelbe Steppe).
    static get WIESEN_GRUND() {
        if (AnazhRealm._wiesenGrundMemo) return AnazhRealm._wiesenGrundMemo;
        const mg = AnazhRealm.MEADOW_GREEN;
        const sp = AnazhRealm.GRAS_SPITZE;
        AnazhRealm._wiesenGrundMemo = Object.freeze({
            farbe: Object.freeze([0, 1, 2].map((i) => 0.383 * mg[i] + 0.442 * sp[i])),
            schwelle: AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle,
            rauschM: 1 / 0.13,
        });
        return AnazhRealm._wiesenGrundMemo;
    }

    // Das Wiesen-Grün: EINE Quelle für die Halm-WURZEL (`_grassInstanceMat` baseCol) UND den Wiesen-
    // Grund (`WIESEN_GRUND`) → der Halm wächst nahtlos aus dem Boden. Die Halm-Spitze
    // bleibt heller; die lush/dry-instanceColor moduliert Halm und Boden ko-variant. Es IST der Wiesen-Grund
    // der Boden-Palette (`mead`), dieselbe Farbe wie der Vertex der Wiese.
    static get MEADOW_GREEN() {
        return AnazhRealm.BODEN_FARBE.mead;
    }

    // Die Gras-SPITZE: der Sommer-Grasakzent des Studios (SAISON_GESETZ, Sommer-Stütze `ac` 0x6f9a3a) nach dem
    // FARB-GESETZ linear, aufgehellt um die Zahl des Studio-Grases (terrain:GRAS_SPITZE_HELL, emitGrass: `vegFarbe(
    // seasonAccent) × 1,08` — linear, 0,172/0,349/0,046). EINE Quelle für die Halm-Spitze des Nah-Grases und die Halme
    // der Boden-Wiese (`_terrainGeologyAlbedo`). Bis 06.10. hellte der Stamm in sRGB auf (0,187/0,383/0,049, ein Zwilling
    // der Studio-Formel mit eigener Rechnung).
    static get GRAS_SPITZE() {
        if (AnazhRealm._grasSpitzeMemo) return AnazhRealm._grasSpitzeMemo;
        const ac = AnazhRealm._saisonGesetz().stuetzen[1].ac;
        if (!Number.isFinite(ac)) AnazhRealm._kernPflichtBruch("terrain:SAISON_GESETZ.stuetzen[1].ac");
        const hell = AnazhRealm.Gesetz("terrain:GRAS_SPITZE_HELL", null);
        if (!Number.isFinite(hell)) AnazhRealm._kernPflichtBruch("terrain:GRAS_SPITZE_HELL");
        AnazhRealm._grasSpitzeMemo = Object.freeze(AnazhRealm._srgbHexLinear(ac).map((v) => v * hell));
        return AnazhRealm._grasSpitzeMemo;
    }

    // Per-Fragment-Multi-Klassen-Geologie: die Klassen emergieren aus der Welt-Wahrheit — steile Hänge
    // tragen keine lockere Erde (sie rutscht) → Fels bricht durch. `_steep = 1 − normalWorld.y`: 0 flach,
    // 0.29 ≈ 45°, 0.5 = 60°, 1 senkrecht. Das Profil ist konservativ (nur echte Hänge versteinern).
    static get TERRAIN_GEOLOGY() {
        // Fels- und Moos-Tint SIND die Boden-Palette (rock · wet). Die Schwellen sind linear (der Vertex trägt
        // seit dem Farb-Gesetz die Albedo): `gruenSchwelle` ist die EINE Wiesen-Wache (g − (r+b)/2), die das
        // Boden-Fragment UND der Grün-Kanal der Boden-Karte lesen (Wiese 0,066, Streu und Fels < 0).
        const P = AnazhRealm.BODEN_FARBE;
        return Object.freeze({
            rockLo: 0.42, // ab dieser Steile (≈55°) beginnt der Fels
            rockHi: 0.7, // ab hier (≈73°) voll Fels (die Klippe/der Grat)
            // DER SCHUTT liegt, wo das Schicht-Gesetz den Schutthang legt (gelaende-core `hoehe(…, aus).schutt`: der Abschnitt
            // Schutthang der Treppe × Stil), nie nach der Steile der Masche — `schutt` sein Gewicht im Vertex (`_felsStoff`, an
            // `aSchutt` weitergereicht, der Detail-Term legt sein Korn auf). Das Gesetz fragt der Chunk nur, wo ein Vertex unter
            // dem Himmel steiler als `schuttKandidat` (≈ 23°) steht, auf einem Gitter der Kante `schuttGitter` (m, 3 Netz-Schritte;
            // das Band ist 16,7 m breit). Bis zur Nachbesserung 2 lag er ab 28° auf jedem Hang (Steile 0,117 … 0,171).
            schuttKandidat: 0.08,
            schuttGitter: 5.4,
            schutt: 0.85,
            mossTint: P.wet, // das Moos des Bodens ist der nasse Grund der Palette
            gruenSchwelle: 0.04, // die Wiesen-Wache: smoothstep(0, gruenSchwelle, g − (r+b)/2)
            mossDampLo: 0.05, // unter dieser linearen Luminanz = „feucht/Niederung" (nasser Grund 0,042)
            mossDampHi: 0.09, //   (Wiese 0,10, beschattete Streu 0,086 — die Feuchte lebt im Vertex)
            mossMax: 0.6, // Deckel der Moos-Übernahme (kein uniformer Teppich)
            roughBase: 0.94, // V18.386 — Portal-Terrain-Roughness (`_terMat` 0.94, matter Boden). Der Substanz-Kern
            //                  variiert sie ums Korn (Erhebung rau, Mulde glänzt), Moos wird matter,
            //                  feuchte kahle Niederung glänzt → das Licht fängt den Boden lebendig
            //                  statt eines toten uniformen Sheens unterm Sky-IBL.
        });
    }

    // DER ZWEIG IM STOFF (K17-2): ein Term, der nur rechnen soll, wo sein Gewicht trägt (der Fels-Term: die Wiese zahlt ihn
    // nicht), reist als ARGUMENT in EINEN Fn-Rumpf, der nur seine Argumente liest — TSL erzeugt den Code des Arguments dort,
    // wo es zuerst gebraucht wird: im Zweig. Der Knoten-Graph sieht den Inhalt (die Argumente sind Kinder des Aufrufs), die
    // Shader-Kosten-Linse (`stoffGraph`) kennt diesen Rumpf (`zweig`); jeder andere Fn ohne Layout bleibt `verborgen` (bis
    // K17-2 trug der Fels-Term seinen Inhalt im Rumpf: RAUSCH-GESETZ (B) 1 verborgener Rumpf). EIN Zweig je TSL-Modul.
    // zweig(inhalt: vec3, gewicht: float) → inhalt, wo gewicht > 1e-3, sonst vec3(1).
    static _zweigTSL(T) {
        if (AnazhRealm._zweigMemo && AnazhRealm._zweigMemo.T === T) return AnazhRealm._zweigMemo.fn;
        const fn = T.Fn(([inhalt, gewicht]) => {
            const v = T.vec3(1, 1, 1).toVar("zweig");
            T.If(gewicht.greaterThan(1e-3), () => {
                v.assign(inhalt);
            });
            return v;
        });
        AnazhRealm._zweigMemo = { T, fn };
        return fn;
    }

    // DAS RECHENWERK DES FELS-GESETZES IM SHADER (K17, Nachbesserung 2): gelaende-core rechnet seinen Fein-Term (`felsFein`,
    // `schuttKorn`) über ein Rechenwerk — hier dieselben Schritte als TSL-Knoten, die Ziehung `zufall` als dieselben 32-Bit-
    // Ganzzahl-Schritte (u32: Multiplikation modulo 2^32, Xor, logisches Schieben), `rausch` als EINE Probe im Rausch-Atlas
    // (`raum` aus `_rauschAtlas`, gelaende-core `rauschRaum` auf der CPU). EIN Rechenwerk je TSL-Modul und Atlas.
    static _felsRechenwerkTSL(T, raum) {
        if (typeof raum !== "function")
            throw new Error("_felsRechenwerkTSL: ohne Rausch-Atlas kein Rechenwerk (raum fehlt)");
        if (AnazhRealm._felsRwMemo && AnazhRealm._felsRwMemo.T === T && AnazhRealm._felsRwMemo.raum === raum)
            return AnazhRealm._felsRwMemo.o;
        const N = (v) => (typeof v === "number" ? T.float(v) : v);
        // gelaende-core `zufall(sh, i, j, k)` als EINE WGSL-Funktion: h = sh ^ i·0x27d4eb2d ^ j·0x165667b1 ^ (k + 1)·0x9e3779b1,
        // zwei Misch-Runden (u32: Multiplikation modulo 2^32, Xor, logisches Schieben) — i, j, k ganz, als f32 gereicht
        const zufallFn = T.Fn(([sh, i, j, k]) => {
            let h = sh
                .bitXor(T.uint(T.int(i)).mul(T.uint(0x27d4eb2d)))
                .bitXor(T.uint(T.int(j)).mul(T.uint(0x165667b1)))
                .bitXor(T.uint(T.int(k).add(1)).mul(T.uint(0x9e3779b1)));
            h = h.bitXor(h.shiftRight(T.uint(15))).mul(T.uint(0x85ebca6b));
            h = h.bitXor(h.shiftRight(T.uint(13))).mul(T.uint(0xc2b2ae35));
            h = h.bitXor(h.shiftRight(T.uint(16)));
            return T.float(h).div(4294967296);
        }).setLayout({
            name: "felsZufall",
            type: "float",
            inputs: [
                { name: "sh", type: "uint" },
                { name: "i", type: "float" },
                { name: "j", type: "float" },
                { name: "k", type: "float" },
            ],
        });
        const o = Object.freeze({
            // gelaende-core `fest` (K17-3): ein Wert, den das Gesetz mehrfach liest, als EINE Variable an der Stelle seiner
            // Rechnung — r184 zählt die Leser eines Knotens in einem Fn-Rumpf nicht und baute ihn je Leser neu (die Lage des
            // Pakets stand 13-mal in der Fels-Funktion)
            fest: (v) => N(v).toVar(),
            // gelaende-core `falte` (K17-3): EINE Schleife — der Zustand lebt in Variablen, je Durchlauf rechnet der Schritt
            // alle neuen Werte aus den alten, erst dann gehen sie in den Zustand (ein Wert liest nie den neuen Nachbarn). Nur
            // in einem Fn-Rumpf (der Stapel der Schleife): der Fels-Term rechnet in `felsFein` (`_terrainGeologyAlbedo`).
            falte: (n, start, schritt) => {
                if (start.length !== 4)
                    throw new Error("_felsRechenwerkTSL.falte: der Zustand trägt vier Werte (ein vec4)");
                const z = T.vec4(...start.map(N)).toVar();
                const zl = [z.x, z.y, z.z, z.w];
                T.Loop(n, ({ i }) => {
                    // EINE Anweisung je Durchlauf: r184 zählt die Leser eines Knotens nur in seiner Anweisung — getrennt
                    // gebaut stand die Bank-Grenze je Ausgang neu (fünfmal je Durchlauf)
                    z.assign(T.vec4(...schritt(T.float(i), zl).map(N)));
                });
                return zl;
            },
            add: (a, b) => N(a).add(N(b)),
            sub: (a, b) => N(a).sub(N(b)),
            mul: (a, b) => N(a).mul(N(b)),
            div: (a, b) => N(a).div(N(b)),
            min: (a, b) => T.min(N(a), N(b)),
            max: (a, b) => T.max(N(a), N(b)),
            floor: (a) => T.floor(N(a)),
            sin: (a) => T.sin(N(a)),
            exp: (a) => T.exp(N(a)),
            abs: (a) => T.abs(N(a)),
            sqrt: (a) => T.sqrt(N(a)),
            step: (e, v) => T.step(N(e), N(v)),
            glatt: (a, b, v) => T.smoothstep(N(a), N(b), N(v)),
            clamp01: (v) => N(v).clamp(0, 1),
            // die Wahl als Auswahl, nie als Mischung: mix(−1e9, a, 1) verlöre a in f32 (Stelle 64 bei 1e9) — als WGSL `select`
            // (`uniformFlow`), nie als if-Block: r184 baut je Zweig eines Blocks jeden noch ungebauten Vorgänger neu (die Lage
            // des Pakets stand je Wahl in jedem Zweig, K17-3: die Fels-Funktion 18 458 Zeichen)
            wahl: (c, a, b) => T.uniformFlow(T.select(N(c).greaterThan(0.5), N(a), N(b))),
            rausch: (x, y, z) => raum(T.vec3(N(x), N(y), N(z))),
            zufall: (sh, i, j, k) => zufallFn(T.uint(sh >>> 0), N(i), N(j), N(k)),
        });
        AnazhRealm._felsRwMemo = { T, raum, o };
        return o;
    }

    // DER FELS-STOFF DER WELT (K17): das EINE Gesetz (gelaende-core `FELS`, `felsFarbe`) mit dem Stein der Boden-Palette als
    // Grundton (`felsBasis`: die dunkle Lage und die helle Bank aus ihm), der Kante des Nah-Netzes (1,8 m: was es nicht trägt,
    // trägt sein Mittel) und dem Mittel für die Ferne (`felsMittel`). Ohne den Kern bricht der Boden laut (Kern-Pflicht).
    static get FELS_STOFF() {
        if (AnazhRealm._felsStoffMemo) return AnazhRealm._felsStoffMemo;
        const GK = globalThis.__gelaendeCore;
        if (
            !GK ||
            typeof GK.felsFarbe !== "function" ||
            typeof GK.felsKruemmung !== "function" ||
            typeof GK.felsFein !== "function" ||
            typeof GK.schuttKorn !== "function" ||
            !GK.FELS
        )
            AnazhRealm._kernPflichtBruch("gelaende:felsFarbe");
        const basis = GK.felsBasis(AnazhRealm.BODEN_FARBE.rock);
        const G = AnazhRealm.TERRAIN_GEOLOGY;
        AnazhRealm._felsStoffMemo = Object.freeze({
            gesetz: GK.FELS,
            basis,
            // die Kante des Nah-Netzes (1,8 m) lebt EINMAL in `netz.fuss` (bis K17-2 NB1 stand ein ungelesener Zwilling daneben)
            // die Geologie des Boden-Netzes für gelaende-core `felsStoff` — der Stamm (Sync-Bau) und der voxel-worker (der
            // Init-Schnappschuss `felsStoff`) lesen DIESELBEN Zahlen
            netz: Object.freeze({
                rockLo: G.rockLo,
                rockHi: G.rockHi,
                schuttKandidat: G.schuttKandidat,
                schuttGitter: G.schuttGitter,
                schutt: G.schutt,
                fuss: 1.8,
            }),
            mittel: Object.freeze(GK.felsMittel(basis)),
            mittelWerte: GK.felsMittelWerte(),
        });
        return AnazhRealm._felsStoffMemo;
    }

    // Terrain-Mikro-Relief (Bump): ein Noise-Höhengradient kippt die geflattete Normale fein → der Boden
    // fängt Licht als Mikro-Struktur. NUR die PBR-Lichtung liest diese Normale (die Substanz-Response
    // liest die Geometrie-normalWorld → kein Schatten-/AO-Konflikt). LOD-gegated (nur nah).
    static get TERRAIN_BUMP() {
        return Object.freeze({
            freq: 1.1, // Mikro-Relief-Frequenz (~0.9 m Feature-Größe — Klumpen/Kiesel)
            freq2: 2.7, // zweite Oktave (feineres Korn obendrauf)
            eps: 0.45, // Gradient-Sample-Abstand (Welt-m, vor freq-Skalierung)
            // Kipp-Stärke subtil halten: da TERRAIN_NORMAL_FLATTEN=1.0 voll flacht, ist der Bump die EINZIGE
            // Normal-Variation — zu stark (0.42 = 23°) gibt bimodales dot(N,L) = bolde Hell/Dunkel-Trapeze pro
            // Makro-Facette. 0.24 = 13° moduliert echtes Mikro-Relief; das Albedo-Korn trägt die feine Textur.
            strength: 0.24, // Kipp-Stärke der Normale (subtil — 13° statt 23°; der Haupt-Balance-Knopf)
            strength2: 0.1, // Stärke der zweiten Oktave
            // Die EINE Mikro-Detail-LOD-Quelle: Distanz-Fade von Bump UND feinem Korn; Terrain (`_lod`) und
            // Werke/Strukturen/Rinde (`_substanceCharacter`) lesen dieselben Schwellen.
            lodNear: 14, // Bump: voll bis 14 m
            // Weite Fade-Rampe (14→95 m): auf flachem Boden steigt die Distanz monoton mit Screen-Y — eine
            // scharfe Detail-Blende projiziert als horizontale Kontrastlinie auf feste Schirm-Höhe.
            lodFar: 95, // Bump: weicher Auslauf bis 95 m (breite Rampe → kein scharfer Screen-Y-Streifen)
            fineNear: 30, // feines Korn: voll bis 30 m
            fineFar: 160, // feines Korn: weiter Auslauf (Rampe statt Kante)
        });
    }

    // DAS RAUSCH-GESETZ (Welle G, der Boden-Stoff): das EINE Gradienten-Rauschen der Boden- und Substanz-Stoffe. Es ist
    // das Perlin-Rauschen von MaterialX (three r184 `mx_noise_float`: die Gradienten-Menge nach `h & 15` aus dem Jenkins-
    // lookup3-Hash, die Fünftgrad-Blende, die Skala 0,982) — nur der Hash wird nicht mehr je Fragment und Ecke gerechnet
    // (8 Ecken × ~40 Ganzzahl-Operationen je Aufruf), er liegt EINMAL im Rausch-Atlas (`_rauschAtlas`). `P` Gitter-Zellen
    // je Kante (die Ebene wiederholt sich nach P Zellen); die dritte Achse liegt im selben Atlas, je Schicht um `schraeg`
    // versetzt — das Maximum des kürzesten 3D-Periodenvektors für P = 256 (43 Zellen). Das Gesetz lebt im Gelände-Kern
    // (gelaende-core `RAUSCH`, `rauschGitter`, `rauschRaum`: derselbe Wert auf der CPU) — Vertex und Pixel lesen EIN Rauschen.
    static get RAUSCH_GESETZ() {
        const GK = globalThis.__gelaendeCore;
        if (!GK || !GK.RAUSCH || typeof GK.rauschGitter !== "function") AnazhRealm._kernPflichtBruch("gelaende:RAUSCH");
        return GK.RAUSCH;
    }

    // Die Bytes des Rausch-Atlas (rein, ohne THREE): je Gitter-Punkt (i, j) der Gradient von MaterialX (gelaende-core
    // `rauschGitter`) — der Hash
    // `mx_hash_int(i, j, 0)` (Jenkins lookup3, bit-genau wie das vendored WGSL) und die Achsen-Regel `mx_gradient_float`
    // (u = h < 8 ? x : y; v = h < 4 ? y : h ∈ {12, 14} ? x : z; Vorzeichen aus Bit 0 und 1) —, GEPACKT je Komponente: das
    // Texel (3i + c, j) trägt die Komponente c der vier Ecken (i, j) · (i+1, j) · (i, j+1) · (i+1, j+1) als RGBA8 unorm
    // (−1 · 0 · +1 = 0 · 127 · 254, der Leser rechnet v · 255/127 − 1). So liest eine Gitter-Zelle EINE Komponente ihrer vier
    // Ecken mit einem Texel. Nie snorm: r184 legt jede Daten-Textur auch als Render-Ziel an, rgba8snorm ist das nur mit dem
    // Feature texture-formats-tier1 — swiftshader fehlt es (Invalid TextureView im Boot, gate:analog-nah).
    static _rauschAtlasDaten() {
        const P = AnazhRealm.RAUSCH_GESETZ.P;
        const g = globalThis.__gelaendeCore.rauschGitter();
        const out = new Uint8Array(3 * P * P * 4);
        for (let j = 0; j < P; j++)
            for (let i = 0; i < P; i++) {
                const i1 = (i + 1) % P;
                const j1 = (j + 1) % P;
                const ecken = [j * P + i, j * P + i1, j1 * P + i, j1 * P + i1];
                for (let c = 0; c < 3; c++) {
                    const o = (j * 3 * P + 3 * i + c) * 4;
                    for (let e = 0; e < 4; e++) out[o + e] = 127 * (g[ecken[e] * 3 + c] + 1);
                }
            }
        return out;
    }

    // Die geteilte Aerial-Perspektive (`_applySubstanceResponse`) rufen ALLE opaken Ebenen post-lighting;
    // ihre EINE Quelle ist das Top-Level-Assignment `AnazhRealm.AERIAL = ...` am Dateiende. NIE einen
    // `static get AERIAL()` daneben — ein Getter ohne Setter schluckt das Assignment lautlos.

    // Das Frequenzband: JEDE opake Ebene empfängt die Band-Uniforms über EIN Antwort-PROFIL (Gewichte
    // 0..1, der Unterschied der Ebenen ist DATEN): micro (Mikro-Tiefe/AO) · rim (warmes Rim) · fuell
    // (Nacht-Füll-Licht, additiv lit + albedo·floor·(1−lit), nie max()-Clamp) · mond (kühles Rim) ·
    // emissiv. `defaults` = Familien-Profile; mit Substanz-Tags emergiert das Profil via
    // _substanceResponseProfile. nightFloor/moonRim 0.06 = die EINE Default-Quelle.
    static get SUBSTANCE_RESPONSE() {
        return Object.freeze({
            defaults: Object.freeze({
                // Terrain/Inseln/Mantel (vertexColors): Albedo-Quelle bleibt das
                // per-Vertex-color-Attribut; micro/AO trägt ihr eigener
                // triplanar-colorNode (darum hier 0).
                feld: Object.freeze({ micro: 0, rim: 0, waerme: 0, fuell: 1, mond: 1, emissiv: 0 }),
                // Flach-Farb-Werke (Bauten/Deko/Kreaturen/Avatare) hängen AUCH am fuell/mond-Band — sonst ist ein
                // Bau nachts dunkler als das Terrain (Silhouetten).
                werk: Object.freeze({ micro: 1, rim: 1, waerme: 1, fuell: 1, mond: 0.7, emissiv: 1 }),
                // Gras (Schritt 3, eigenes Material — KEIN Merge): es
                // konsumiert dieselben Band-Uniforms (E1: floor-Hebel traf das
                // Gras mit −2.0, jetzt antwortet es).
                gras: Object.freeze({ micro: 0, rim: 0, waerme: 1, fuell: 1, mond: 0, emissiv: 0 }),
                // Weder vertexColors noch Farbe: nur der Aerial-Haze (wie zuvor).
                frei: Object.freeze({}),
            }),
            nightFloor: 0.06,
            moonRim: 0.06,
        });
    }

    // Cell-Feld: Uint8Array (0=air, 1=water, 2=solid), Index `i + k·dim + j·dim·dim`, deterministisch.
    // Trägt der Chunk-Footprint überhaupt Wasser? Wenn nein, entfallen ~71k Dichte-Samples pro Chunk.
    // Atlas-Strict (Wasser kommt aus Seed/Atlas, nie aus lokaler Geometrie-Heuristik): (1) ein Voxel-
    // Carve unter waterLevel berührt den Footprint (Spieler-Pool); (2) der Atlas hat eine Ozean-
    // (waterKind 1) oder See-Zelle (2) im Footprint (+1 Cell Marge); (3) ein Fluss-Bucket im Footprint.
    _voxelChunkHasAnyWater(cx, cz) {
        const { span } = this._voxelChunkConfig();
        const ox = cx * span;
        const oz = cz * span;
        const waterLevel = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        // (1) Voxel-Carve unter waterLevel im xz-Footprint — Spieler-Wille
        // überschreibt Atlas (Hochland-Pool emergiert lokal). Gefragt wird die Karte des Chunks.
        const edits = this._voxelEditsNah(cx, cz);
        if (edits.length) {
            for (let e = 0; e < edits.length; e++) {
                const ed = edits[e];
                if (!ed || ed.mode !== "carve") continue;
                const r = ed.r;
                if (!Number.isFinite(r) || r <= 0) continue;
                if (ed.y - r >= waterLevel) continue;
                if (ed.x + r < ox || ed.x - r > ox + span) continue;
                if (ed.z + r < oz || ed.z - r > oz + span) continue;
                return true;
            }
        }
        const hHome = this.state.hydrosphere;
        if (!hHome || !hHome.ready) return false;
        // A3 (V18.132) — der Chunk kann eine KACHEL-Grenze queren: alle
        // Regionen sammeln, die sein Footprint (+1-Cell-Marge) beruehrt
        // (Heimat + bis zu 4 Kacheln via die 4 Ecken; dedupe per Identitaet).
        const regions = [];
        for (const [px, pz] of [
            [ox, oz],
            [ox + span, oz],
            [ox, oz + span],
            [ox + span, oz + span],
        ]) {
            const hr = this._hydroFor(px, pz);
            if (hr && hr.ready && regions.indexOf(hr) < 0) regions.push(hr);
        }
        for (const h of regions) {
            // (2) Atlas-Marker: Ozean (kind === 1) ODER See (kind === 2) im
            // Chunk-Footprint (+1 Cell Marge für Boundary-Continuität — der
            // 16-m-Atlas-Cell-Raster liegt nicht perfekt auf dem Chunk-Raster).
            if (h.water && h.water.waterKind) {
                const c0i = Math.floor((ox - h.originX) / h.cell) - 1;
                const c1i = Math.floor((ox + span - h.originX) / h.cell) + 1;
                const c0j = Math.floor((oz - h.originZ) / h.cell) - 1;
                const c1j = Math.floor((oz + span - h.originZ) / h.cell) + 1;
                const wK = h.water.waterKind;
                for (let cj = c0j; cj <= c1j; cj++) {
                    for (let ci = c0i; ci <= c1i; ci++) {
                        if (ci < 0 || cj < 0 || ci >= h.dim || cj >= h.dim) continue;
                        const kind = wK[ci + cj * h.dim];
                        if (kind === 1 || kind === 2) return true;
                    }
                }
            }
            // (3) Fluss-Bucket im Footprint
            if (h.riverBuckets) {
                const b0i = Math.floor((ox - h.originX) / h.bucketSize);
                const b1i = Math.floor((ox + span - h.originX) / h.bucketSize);
                const b0j = Math.floor((oz - h.originZ) / h.bucketSize);
                const b1j = Math.floor((oz + span - h.originZ) / h.bucketSize);
                for (let bj = b0j; bj <= b1j; bj++) {
                    for (let bi = b0i; bi <= b1i; bi++) {
                        if (bi < 0 || bj < 0 || bi >= h.bucketsDim || bj >= h.bucketsDim) continue;
                        const list = h.riverBuckets[bi + bj * h.bucketsDim];
                        if (list && list.length) return true;
                    }
                }
            }
        }
        // (4) Makro-Dip-Predicate für Wasser jenseits des Atlas: der globale Ozean jenseits der ±1024-Region
        // und Küsten-Aquifer (Roughness-Senken, die der 16-m-Atlas nicht sieht). Dippt das Makro-Terrain im
        // 5×5-Raster unter waterLevel + Marge, kann der Chunk Wasser tragen. Marge ≥ Roughness (±12 m) →
        // keine false-negatives; ein false-positive kostet nur einen leeren Zellen-Build.
        const OCEAN_GATE_MARGIN = 16;
        {
            const thr = waterLevel + OCEAN_GATE_MARGIN;
            for (let gj = 0; gj <= 4; gj++) {
                for (let gi = 0; gi <= 4; gi++) {
                    const sx = ox + (gi / 4) * span;
                    const sz = oz + (gj / 4) * span;
                    if (this._terrainMacroSurfaceY(sx, sz, true) < thr) return true;
                }
            }
        }
        return false;
    }

    // `preDensity` = das Grid des Boden-Meshers ((dim+4)·(dimY+1)·(dim+4), Origin `ox-step, oy,
    // oz-step`); Cell-Center-Density = 8-Corner-Avg (spart ~71k Dichte-Calls). Ohne preDensity sampelt es
    // selbst — IDENTISCHE Klassifikation. `lod` wählt dim/dimY wie der Boden-Mesher.
    _buildVoxelChunkWaterCells(ox, oy, oz, step, preDensity = null, lod = 0) {
        const { dim, dimY } = this._voxelChunkConfig(lod);
        const cells = new Uint8Array(dim * dim * dimY);
        const STATE = AnazhRealm.CELL_STATE;
        // Density-Grid besorgen (vorab oder selbst samplen)
        let density = preDensity;
        if (!density) {
            const sample = (x, y, z) => this._terrainDensityAt(x, y, z);
            density = this._voxelSampleDensityGrid(ox - step, oy, oz - step, dim + 3, dimY, dim + 3, step, sample);
        }
        const band = this.state.hydroBand;
        const bandTop = band ? band.top : Infinity;
        // Cell (i, k, j) Center ist Mittelpunkt der 8 Density-Grid-Vertices
        // (i+1, j, k+1) bis (i+2, j+1, k+2) (Pad +1 links/unten ausgeglichen).
        const Nx = dim + 4;
        const Ny = dimY + 1;
        const NxNy = Nx * Ny;
        // Verbundenes Wasser per 3D-Flood-Fill von echten Quellen (Ozean/See/Fluss): gefüllt wird NUR, was
        // durch nicht-soliden Raum UNTER dem Body-Spiegel mit einer Quelle verbunden ist → kein Bluten durch
        // Wände, keine Luftblasen in getauchten Höhlen. Seeds aus dem GLOBALEN Atlas (in-chunk + OOB-Ring) →
        // nahtfrei. Die Architektur stempelt NACH dem Flood (6), wie im Worker-Pfad: das Wasser des Gesetzes steht, der Stempel
        // verdrängt es — und sagt, ob er es tat.
        const dimSq = dim * dim;
        const cellD = (i, j, k) => {
            const a = j * Nx + (k + 1) * NxNy;
            const b = (j + 1) * Nx + (k + 1) * NxNy;
            const c = j * Nx + (k + 2) * NxNy;
            const e = (j + 1) * Nx + (k + 2) * NxNy;
            const i1 = i + 1;
            const i2 = i + 2;
            return (
                (density[i1 + a] +
                    density[i2 + a] +
                    density[i1 + b] +
                    density[i2 + b] +
                    density[i1 + c] +
                    density[i2 + c] +
                    density[i1 + e] +
                    density[i2 + e]) *
                0.125
            );
        };
        let jMax = Math.floor((bandTop - oy) / step);
        if (jMax >= dimY) jMax = dimY - 1;
        // 1) SOLID/AIR aus der Density (Wasser kommt erst durch den Flood). Über
        //    dem Band bleibt alles AIR (Uint8Array-Default 0 = AIR).
        for (let j = 0; j <= jMax; j++) {
            const baseJ = j * dimSq;
            for (let k = 0; k < dim; k++) {
                const baseK = k * dim;
                for (let i = 0; i < dim; i++) {
                    if (cellD(i, j, k) > 0) cells[i + baseK + baseJ] = STATE.SOLID;
                }
            }
        }
        // 3) Quell-Spiegel pro Spalte: NUR echtes Atlas-Wasser/Fluss (kein Rim).
        //    `_atlasWaterLevelAt` mit terrainTop = +Infinity unterdrückt das Rand-
        //    3×3 (`rim < +∞` ist immer false) → liefert nur den echten Body-Spiegel.
        const WATER = STATE.WATER;
        const AIR = STATE.AIR;
        // Aquifer: ein Oberflächen-See flutet NICHT die Höhlen darunter — eine tiefe Höhlen-Zelle (cy unter
        // surf-18) über dem globalen Wassertisch (`waterLevel`) bleibt trocken, darunter nass.
        // MUSS bit-identisch im Worker.
        const aquiferY = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const colSurf = new Float64Array(dim * dim);
        for (let k = 0; k < dim; k++) {
            const cz = oz + (k + 0.5) * step;
            for (let i = 0; i < dim; i++) colSurf[i + k * dim] = this._terrainMacroSurfaceY(ox + (i + 0.5) * step, cz);
        }
        // Fels über der Zelle: die Unterkante der obersten FESTEN Zelle der Spalte — darunter
        // ist eine Zelle bedeckt, darüber steht sie unter offenem Himmel (`AnazhRealm._aquiferTrocken`).
        const colFels = new Float64Array(dimSq).fill(-Infinity);
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            for (let j = jMax; j >= 0; j--) {
                if (cells[idx0 + j * dimSq] !== STATE.SOLID) continue;
                colFels[idx0] = oy + j * step;
                break;
            }
        }
        const caveDry = (i, k, cy) =>
            AnazhRealm._aquiferTrocken(cy, colSurf[i + k * dim], aquiferY, cy < colFels[i + k * dim]);
        // DER BODEN JE SPALTE (Gegenprüfung 07.10., Runde 3): der tiefste Null-Durchgang der Dichte an den vier Ecken der Spalte
        // (das Gitter, aus dem auch der Mesher die Fläche setzt) — das Wasser der Spalte steht, wo es über irgendeinem Teil
        // ihres Bodens steht. Das Ufer-Urteil des Spiegels und die Deck-Zelle lesen ihn, wie der Körper seinen Boden liest
        // (`_koerperWasser`); bis zur Gegenprüfung las das Ufer-Urteil die Makro-Fläche (an den Seen der Kacheln bis 4,6 m über
        // dem Boden): der Körper stand im Ufer-Wasser, das die Welt nicht zeichnete. Reicht das Gelände über das Band, trägt
        // die Ecke kein Wasser; ohne Gelände im Band die Makro-Fläche.
        const colBoden = new Float64Array(dimSq);
        {
            const jTop = Math.min(dimY, jMax + 1);
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    let b = Infinity;
                    let gelaende = false;
                    for (let e = 0; e < 4; e++) {
                        const g = i + 1 + (e & 1) + (k + 1 + (e >> 1)) * NxNy;
                        for (let j = jTop; j >= 0; j--) {
                            const dS = density[g + j * Nx];
                            if (!(dS > 0)) continue;
                            gelaende = true;
                            const dD = j + 1 <= dimY ? density[g + (j + 1) * Nx] : 1;
                            if (dD <= 0) b = Math.min(b, oy + j * step + (step * dS) / (dS - dD));
                            break;
                        }
                    }
                    colBoden[i + k * dim] = gelaende ? b : colSurf[i + k * dim];
                }
            }
        }
        // Die EINE kanonische Wasserspiegel-Höhe `colL` PRO SPALTE, terrain-gated (`_atlasWaterLevelAt` mit
        // dem Boden der Spalte → Ufer füllt sub-zellig, Land bleibt trocken). `colSrc` = echte
        // Atlas-Wasser-Quelle (Seed). Gefragt wird an der Mitte UND den vier Ecken der Spalte (das Höchste): die Ränder des
        // Gesetzes (das 16-m-Raster der Seen und ihres Ufers, die Krone des Flusses) liegen nicht auf dem 1,8-m-Gitter — an
        // der Mitte allein zeichnete die Welt einen Ufer-Streifen nicht, in dem der Körper stand (Gegenprüfung 07.10., Runde 3).
        const colL = new Float64Array(dimSq);
        const colSrc = new Uint8Array(dimSq);
        const spalteL = (i, k, boden) => {
            let l = this._atlasWaterLevelAt(ox + (i + 0.5) * step, oz + (k + 0.5) * step, boden);
            for (let e = 0; e < 4; e++) {
                const le = this._atlasWaterLevelAt(ox + (i + (e & 1)) * step, oz + (k + (e >> 1)) * step, boden);
                if (le > l) l = le;
            }
            return l;
        };
        for (let k = 0; k < dim; k++) {
            for (let i = 0; i < dim; i++) {
                const idx0 = i + k * dim;
                colL[idx0] = spalteL(i, k, colBoden[idx0]);
                colSrc[idx0] = spalteL(i, k, Infinity) > -Infinity ? 1 : 0;
            }
        }
        // OOB-Ring: ein Wasser-Körper jenseits der Kante flutet herein → die
        // Kant-Spalte als Quelle markieren (Konnektivität von außen, seam-frei via
        // globalem Atlas; gefüllt wird sie bis IHR eigenes colL).
        for (let k = 0; k < dim; k++) {
            const cz = oz + (k + 0.5) * step;
            if (this._atlasWaterLevelAt(ox - 0.5 * step, cz, Infinity) > -Infinity) colSrc[0 + k * dim] = 1;
            if (this._atlasWaterLevelAt(ox + (dim + 0.5) * step, cz, Infinity) > -Infinity)
                colSrc[dim - 1 + k * dim] = 1;
        }
        for (let i = 0; i < dim; i++) {
            const cxw = ox + (i + 0.5) * step;
            if (this._atlasWaterLevelAt(cxw, oz - 0.5 * step, Infinity) > -Infinity) colSrc[i + 0 * dim] = 1;
            if (this._atlasWaterLevelAt(cxw, oz + (dim + 0.5) * step, Infinity) > -Infinity)
                colSrc[i + (dim - 1) * dim] = 1;
        }
        // Reaktive Flut über die Chunkgrenze: liegt ein CARVE in der 3×3-Chunk-Region, seedet der OOB-Ring
        // AUCH aus den nassen Nachbar-ZELLEN (`waterCells`) — der Atlas-Ring kennt nur frozen Körper, ein
        // Carve-Kanal bliebe im Nachbarn trocken. Main-only; ohne Carve (Worldgen) atlas-only = bit-identisch
        // zum Worker. `_rebuildVoxelChunk` erzwingt dafür (gleicher Gate) den Main-Rebuild der Nachbarn.
        const _span = dim * step;
        const _cx = Math.round(ox / _span);
        const _cz = Math.round(oz / _span);
        if (this.state.voxelChunks && this._chunkRegionHasCarve(_cx, _cz)) {
            const colWet = (nkey, ni, nk) => {
                const nb = this.state.voxelChunks.get(nkey);
                if (!nb || !nb.waterCells) return false;
                const nc = nb.waterCells;
                const b = ni + nk * dim;
                for (let j = 0; j <= jMax && b + j * dimSq < nc.length; j++)
                    if (nc[b + j * dimSq] === WATER) return true;
                return false;
            };
            for (let k = 0; k < dim; k++) {
                if (colWet(`${_cx - 1},${_cz}`, dim - 1, k)) colSrc[0 + k * dim] = 1;
                if (colWet(`${_cx + 1},${_cz}`, 0, k)) colSrc[dim - 1 + k * dim] = 1;
            }
            for (let i = 0; i < dim; i++) {
                if (colWet(`${_cx},${_cz - 1}`, i, dim - 1)) colSrc[i + 0 * dim] = 1;
                if (colWet(`${_cx},${_cz + 1}`, i, 0)) colSrc[i + (dim - 1) * dim] = 1;
            }
        }
        // Küsten-Aquifer: die 3D-Roughness (±12 m) taucht echtes Terrain bis −24 m unter den Spiegel, wo das
        // Makro „Land" sagt (colL=−Inf → die BFS füllte die himmel-offene Senke nie). Jede Atlas-lose Spalte,
        // deren erste SOLID-Zelle von oben KLAR unter dem Wassertisch liegt, wird Aquifer-Quelle
        // (colL=waterLevel, colSrc=1). Per-Spalte lokal → nahtfrei, Worker bit-identisch (voxel-worker.js).
        // Land-Spalten behalten colL=−Inf; gedeckelte Höhlen filtert _skyOpenWaterFilter.
        const SHELF_MIN_DEPTH = 1.0;
        for (let k = 0; k < dim; k++) {
            const baseK = k * dim;
            for (let i = 0; i < dim; i++) {
                const idx0 = i + baseK;
                if (colSrc[idx0]) continue; // schon echte Quelle (Atlas/Fluss)
                const lvl0 = colL[idx0];
                // Ein See-/Fluss-Rim ÜBER dem Wassertisch ist KEIN Grundwasser — sonst füllte eine getrennte Senke
                // neben einem Hochland-See bis zu dessen Spiegel. Ozean-Rim und Unter-Meer-See-Rim bleiben.
                if (lvl0 > -Infinity && lvl0 > aquiferY + 1e-6) continue;
                let topJ = -1;
                for (let j = jMax; j >= 0; j--) {
                    if (cells[idx0 + j * dimSq] === STATE.SOLID) {
                        topJ = j;
                        break;
                    }
                }
                if (topJ < 0) continue; // Terrain unterm Band — exotisch, konservativ
                const topCy = oy + (topJ + 0.5) * step;
                if (topCy < aquiferY - SHELF_MIN_DEPTH) {
                    colL[idx0] = lvl0 > -Infinity ? lvl0 : aquiferY;
                    colSrc[idx0] = 1;
                }
            }
        }
        const queue = [];
        // U-W3: eine Quell-Spalte wird bis IHR colL geflutet (NICHT bis ein
        // propagierter höherer Quell-Spiegel — das heilt die gemessene 4–15-m-
        // Über-Füllung `cellTop−L`).
        const seedColumn = (i, k) => {
            const idx0 = i + k * dim;
            if (!colSrc[idx0]) return;
            const lvl = colL[idx0];
            if (!(lvl > -Infinity)) return;
            const baseK = k * dim;
            for (let j = 0; j <= jMax; j++) {
                const cy = oy + (j + 0.5) * step;
                if (cy > lvl) break;
                const cidx = i + baseK + j * dimSq;
                if (cells[cidx] === AIR && !caveDry(i, k, cy)) {
                    cells[cidx] = WATER;
                    queue.push(cidx);
                }
            }
        };
        for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) seedColumn(i, k);
        // 4) BFS-Flood durch nicht-soliden Raum — jede Zelle bis colL[ihre Spalte]
        //    (U-W3: kein propagierter Quell-Spiegel → keine Über-Füllung; die
        //    BFS-Konnektivität bleibt = kein Phantom-Wasser, kein Bluten an Wänden).
        const pushN = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dim || nk >= dim || nj < 0 || nj > jMax) return;
            const cy = oy + (nj + 0.5) * step;
            if (cy > colL[ni + nk * dim]) return;
            const nidx = ni + nk * dim + nj * dimSq;
            if (cells[nidx] === AIR && !caveDry(ni, nk, cy)) {
                cells[nidx] = WATER;
                queue.push(nidx);
            }
        };
        for (let qh = 0; qh < queue.length; qh++) {
            const cidx = queue[qh];
            const j = (cidx / dimSq) | 0;
            const rem = cidx - j * dimSq;
            const k = (rem / dim) | 0;
            const i = rem - k * dim;
            pushN(i + 1, k, j);
            pushN(i - 1, k, j);
            pushN(i, k + 1, j);
            pushN(i, k - 1, j);
            pushN(i, k, j + 1);
            pushN(i, k, j - 1);
        }
        // 4b) DIE DECK-ZELLE (EINE Regel für jedes flache Wasser, Gegenprüfung 07.10., Runde 3): liegt der Spiegel einer
        //    Quell-Spalte über ihrem Boden, aber unter der Mitte ihrer ersten freien Zelle (ein Rinnsal, ein flaches Ufer, die
        //    Küsten-Schelfe), fällt das Wasser durchs 1,8-m-Gitter — der Körper las es (`_koerperWasser`: der Spiegel des
        //    Gesetzes über dem Boden), die Welt zeichnete es nicht (der Bach der Mess-Wiese: Körper nass in 104 von 104
        //    Querschnitten, gezeichnet in 52). Dann trägt die DECK-Zelle das Wasser, und das Sheet zeichnet in ihr den Spiegel
        //    des Gesetzes (`_computeWaterSheetData`). Der Boden der Spalte ist der Null-Durchgang der Dichte zwischen ihrer
        //    obersten festen Zelle und der Deck-Zelle (dort setzt auch der Mesher die Fläche); eine gestempelte Zelle (Bau)
        //    trägt keinen Boden. Eine Quell-Spalte trägt ihr flaches Wasser immer, eine Ufer-Spalte, wenn sie an Wasser grenzt
        //    (an der Oberfläche einer Nachbar-Spalte im Chunk, auch einer Deck-Zelle — der flache Ufer-Streifen wächst vom
        //    Wasser her). Kein queue-Push: die Deck-Zelle flutet nichts weiter; `_skyOpenWaterFilter` behält sie (Luft
        //    darüber). Bis zur Gegenprüfung trug nur die Küsten-Schelfe diese Regel, ohne Boden-Urteil. Worker bit-identisch.
        const deckZelle = (i, k) => {
            const idx0 = i + k * dim;
            const lvl = colL[idx0];
            if (!(lvl > -Infinity)) return -1;
            let topJ = -1;
            for (let j = jMax; j >= 0; j--) {
                const c = cells[idx0 + j * dimSq];
                if (c === AIR) continue;
                if (c === STATE.SOLID) topJ = j;
                break; // eine Wasser-Zelle: die Spalte trägt ihr Wasser schon
            }
            if (topJ < 0 || topJ + 1 > jMax) return -1;
            const deckIdx = idx0 + (topJ + 1) * dimSq;
            const topCy = oy + (topJ + 0.5) * step;
            // der Spiegel liegt in der Deck-Zelle oder in der festen Zelle darunter (bis dorthin zeichnet das Sheet ihn,
            // `_computeWaterSheetData`), über dem Boden der Spalte; die feste Zelle ist Gelände, kein Bau-Stempel
            if (cells[deckIdx] !== AIR || topCy + step <= lvl || !(lvl > topCy - 0.5 * step)) return -1;
            if (!(cellD(i, topJ, k) > 0) || !(lvl > colBoden[idx0])) return -1;
            return deckIdx;
        };
        const nassOben = new Uint8Array(dimSq);
        const offen = [];
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            for (let j = jMax; j >= 0; j--) {
                const c = cells[idx0 + j * dimSq];
                if (c === AIR) continue;
                if (c === WATER) {
                    nassOben[idx0] = 1;
                    offen.push(idx0);
                }
                break;
            }
        }
        for (let idx0 = 0; idx0 < dimSq; idx0++) {
            if (!colSrc[idx0] || nassOben[idx0]) continue;
            const d = deckZelle(idx0 % dim, (idx0 / dim) | 0);
            if (d < 0) continue;
            cells[d] = WATER;
            nassOben[idx0] = 1;
            offen.push(idx0);
        }
        for (let h = 0; h < offen.length; h++) {
            const i = offen[h] % dim;
            const k = (offen[h] / dim) | 0;
            for (const [ni, nk] of [
                [i + 1, k],
                [i - 1, k],
                [i, k + 1],
                [i, k - 1],
            ]) {
                if (ni < 0 || nk < 0 || ni >= dim || nk >= dim) continue;
                const n0 = ni + nk * dim;
                if (nassOben[n0]) continue;
                const d = deckZelle(ni, nk);
                if (d < 0) continue;
                cells[d] = WATER;
                nassOben[n0] = 1;
                offen.push(n0);
            }
        }
        // 5) 3D-Konnektivität: eine WATER-Zelle ist nur echt, wenn sie durch Wasser mit der OFFENEN
        //    ATMOSPHÄRE verbunden ist („komme ich zur Oberfläche?", nicht „Deckel über mir?") — erhält die
        //    Überhang-Bucht (lateral verbunden) und trocknet die Sub-Terrain-Blase mit EINER Regel.
        this._skyOpenWaterFilter(cells, dim, dimY, jMax);
        // 6) DER STEMPEL DER WERKE NACH DEM WASSER (Schau-2 wasser-wahrheit, Gegenprüfung Runde 3): EINE Reihenfolge für Main
        //    und Worker (der Worker flutet ohne Werke, der Main stempelt seine Zellen danach, `_buildVoxelChunkDataFromWorkerMesh`)
        //    — die Zellen sind dieselben, gleich welcher Pfad den Chunk baut, und der Stempel liest an ihnen, ob er Wasser
        //    verdrängt. Bis zur Gegenprüfung stempelte der Main VOR dem Flood (ein Damm hielt das ruhende Wasser ab, im
        //    Worker-Pfad nicht), und die Weck-Frage las eine zweite Wahrheit (das Gesetz samt Rand-Füllung).
        this._stampArchitectureSolidCellsInto(cells, ox, oy, oz, lod);
        return cells;
    }

    // Die EINE Wasser-Regel: Wasser existiert nur, wo es durch nicht-soliden Raum mit der offenen
    // Atmosphäre verbunden ist. (A) Sky-Air: AIR-Zellen, vom Band-Dach (j=jMax) durch AIR erreichbar.
    // (B) Keep: WATER-Zellen an Sky-Air oder über Wasser damit verbunden; alles übrige WATER → AIR.
    // See und Überhang-Bucht bleiben, Sub-Terrain-Blasen trocknen, Wasser „klettert" nie.
    // Worker-Mirror Pflicht (bit-identisch).
    _skyOpenWaterFilter(cells, dimC, dimYC, jMaxC) {
        const STATE = AnazhRealm.CELL_STATE;
        const dq = dimC * dimC;
        // (A) Sky-Air-Flood vom Chunk-DACH (j=dimYC-1, über dem ganzen Wasser-Band); über jMaxC ist alles
        //     AIR, der Flood fällt durch jeden AIR-Raum nach unten/seitlich.
        const topJ = dimYC - 1;
        const skyAir = new Uint8Array(dq * dimYC);
        const stack = [];
        for (let k = 0; k < dimC; k++) {
            for (let i = 0; i < dimC; i++) {
                const idx = i + k * dimC + topJ * dq;
                if (cells[idx] === STATE.AIR) {
                    skyAir[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        const tryAir = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj >= dimYC) return;
            const nidx = ni + nk * dimC + nj * dq;
            if (skyAir[nidx] || cells[nidx] !== STATE.AIR) return;
            skyAir[nidx] = 1;
            stack.push(nidx);
        };
        while (stack.length) {
            const idx = stack.pop();
            const j = (idx / dq) | 0;
            const rem = idx - j * dq;
            const k = (rem / dimC) | 0;
            const i = rem - k * dimC;
            tryAir(i + 1, k, j);
            tryAir(i - 1, k, j);
            tryAir(i, k + 1, j);
            tryAir(i, k - 1, j);
            tryAir(i, k, j + 1);
            tryAir(i, k, j - 1);
        }
        // (B) Keep-Flood: WATER, das an Sky-Air grenzt oder durch Wasser damit
        //     verbunden ist. Seed = WATER mit Sky-Air-Nachbar (die Oberfläche).
        const keep = new Uint8Array(dq * dimYC);
        const wstack = [];
        const hasSkyNbr = (i, k, j, idx) =>
            (j < topJ && skyAir[idx + dq]) ||
            (j > 0 && skyAir[idx - dq]) ||
            (i + 1 < dimC && skyAir[idx + 1]) ||
            (i > 0 && skyAir[idx - 1]) ||
            (k + 1 < dimC && skyAir[idx + dimC]) ||
            (k > 0 && skyAir[idx - dimC]);
        for (let j = 0; j <= jMaxC; j++) {
            for (let k = 0; k < dimC; k++) {
                for (let i = 0; i < dimC; i++) {
                    const idx = i + k * dimC + j * dq;
                    if (cells[idx] === STATE.WATER && !keep[idx] && hasSkyNbr(i, k, j, idx)) {
                        keep[idx] = 1;
                        wstack.push(idx);
                    }
                }
            }
        }
        const tryWater = (ni, nk, nj) => {
            if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj > jMaxC) return;
            const nidx = ni + nk * dimC + nj * dq;
            if (keep[nidx] || cells[nidx] !== STATE.WATER) return;
            keep[nidx] = 1;
            wstack.push(nidx);
        };
        while (wstack.length) {
            const idx = wstack.pop();
            const j = (idx / dq) | 0;
            const rem = idx - j * dq;
            const k = (rem / dimC) | 0;
            const i = rem - k * dimC;
            tryWater(i + 1, k, j);
            tryWater(i - 1, k, j);
            tryWater(i, k + 1, j);
            tryWater(i, k - 1, j);
            tryWater(i, k, j + 1);
            tryWater(i, k, j - 1);
        }
        // Alles WATER ohne Sky-Verbindung → AIR (eingeschlossene Blase, Phantom).
        for (let idx = 0; idx < cells.length; idx++) {
            if (cells[idx] === STATE.WATER && !keep[idx]) cells[idx] = STATE.AIR;
        }
    }

    // Stempelt solide Architektur-AABBs (`blockerAABBs`) als SOLID ins Cell-Feld, NACH dem Wasser des Gesetzes (Main und
    // Worker in derselben Reihenfolge); Y-Range je AABB von aabb.botY bis topY. `lod` MUSS zur Cell-Grid-Geometrie des
    // Aufrufers passen — sonst out-of-bounds-Writes. Gestempelt werden die Werke, deren Hülle den Chunk berührt (die
    // Nachbarschaft der Blocker, `_blockerNahe`): die Kosten folgen den Werken am Ort, nie dem Bestand (Lehre 25; bis zur
    // Gegenprüfung Runde 3 lief jeder Chunk-Bau den ganzen Bestand durch — 763–1 940 Werke, 0,7–8,1 ms, Spitze 14,9 ms).
    // DIE PFLANZE STEHT IM WASSER (Schau-2 wasser-wahrheit): die Hülle einer Pflanze (Stamm, Trieb) und eines Gefährts
    // (`aabb.stempelfrei`, Karte K02) stempelt keine Zelle — das Wasser fließt um sie, wie der Körper sie schon liest
    // (`_koerperWasserSpiegel`). Auf dem 1,8-m-Gitter
    // wurde ein 0,6-m-Stamm am Ufer zu einer Zellen-Säule, die Wasser verdrängte: der Bau weckte den Automaten, und der
    // flutete das Tal (Schau 09.10.: der Eichenhain am Fluss −872/−1127 stand nach 20 s 1,9–3,8 m unter dem Wasser).
    // DER DAMM ENTSTEHT MIT SEINEN ZELLEN (Gegenprüfung Runden 2 und 3): überschreibt der Stempel eine WASSER-Zelle, verdrängt
    // das Werk Wasser — gefragt an DENSELBEN Zellen, die der Chunk trägt, nie an einer zweiten Wahrheit. Dann ist es ein Damm
    // (`entry._stempelNass`, der Abbau liest es), und der Automat wacht um die Hülle, wann immer ein Chunk mit dem Stempel
    // entsteht (der Neubau des Fußabdrucks beim Bau, der Reload, das Wieder-Strömen): der Stausee bildet sich neu. Die Kappen
    // und Stau-Felder bauen faul aus den Zellen, die dieser Bau gleich ablegt. Befunde: nach dem Reload stand der Damm
    // −937/−1064 im fließenden Fluss (3 574 nasse Punkte davor, 1 557 danach — die Frage las die geladenen Zellen, beim Reload
    // keine); danach weckte ein Haus am Seerand den Automaten (die Frage las das Gesetz samt Rand-Füllung, die Zellen fluten
    // den Rand nur, wo er mit der Quelle verbunden ist).
    _stampArchitectureSolidCellsInto(cells, ox, oy, oz, lod = 0) {
        if (lod === 0) this._stauFeldVorlaeufig(ox, oz);
        if (!Array.isArray(this.state.architectures) || this.state.architectures.length === 0) return;
        const { dim, dimY, step } = this._voxelChunkConfig(lod);
        const STATE = AnazhRealm.CELL_STATE;
        const halb = dim * step * 0.5;
        const nahe = this._stempelNahe || (this._stempelNahe = []);
        nahe.length = 0;
        this._blockerNahe(ox + halb, oz + halb, halb, 0, nahe);
        for (const entry of nahe) {
            if (!entry.blockerAABBs) continue;
            for (const aabb of entry.blockerAABBs) {
                const s = this._stempelSpanne(aabb, ox, oy, oz, dim, dimY, step);
                if (!s) continue;
                // DIE GEDREHTE BOX STEMPELT IHRE ZELLEN (Karte K02): ein gedrehtes Teil (`aabb.obb`) stempelt nur die Zellen, die
                // es berührt — der Schnitt der Zelle mit dem Rechteck in der Ebene (die Achsen der Box; die Welt-Achsen trägt die
                // Spanne), nie die Ecken seiner Welt-AABB. Bis hierhin stempelte ein 45° gedrehtes Haus am Fluss die Ecken seiner
                // Hülle über dem Wasser: Wasser-Zellen ohne Wand, ein Damm, den es nicht gibt — der Automat wachte (9–11 Chunks)
                // und hob den Fluss −872/−1113 auf 33,6 m, 1,9 m über seinen Spiegel. Achsparallele Teile stempeln byte-alt.
                const ob = aabb.obb;
                const obR = ob ? step * 0.5 * (Math.abs(ob.c) + Math.abs(ob.s)) : 0;
                let nass = false;
                for (let j = s.j0; j <= s.j1; j++) {
                    const baseJ = j * dim * dim;
                    for (let k = s.k0; k <= s.k1; k++) {
                        const baseK = k * dim;
                        const qz = ob ? oz + (k + 0.5) * step - ob.cz : 0;
                        for (let i = s.i0; i <= s.i1; i++) {
                            if (ob) {
                                const qx = ox + (i + 0.5) * step - ob.cx;
                                if (Math.abs(qx * ob.c - qz * ob.s) > ob.hx + obR) continue;
                                if (Math.abs(qx * ob.s + qz * ob.c) > ob.hz + obR) continue;
                            }
                            const idx = i + baseK + baseJ;
                            if (cells[idx] === STATE.WATER) nass = true;
                            cells[idx] = STATE.SOLID;
                        }
                    }
                }
                if (!nass) continue;
                entry._stempelNass = true;
                this._invalidateWaterCapsAround(
                    (aabb.minX + aabb.maxX) * 0.5,
                    (aabb.minZ + aabb.maxZ) * 0.5,
                    Math.max(aabb.maxX - aabb.minX, aabb.maxZ - aabb.minZ) * 0.5
                );
            }
        }
    }

    // Die Zellen, die eine Blocker-Hülle in einem Chunk (Ursprung ox/oy/oz) stempelt: xz der Überlapp, y vom Fuß (botY, sonst
    // topY − 4) bis zum Kopf. null = die Hülle stempelt hier nichts (außerhalb des Chunks, oder stempelfrei). Liefert ein
    // geteiltes Scratch-Objekt.
    _stempelSpanne(aabb, ox, oy, oz, dim, dimY, step) {
        if (aabb.stempelfrei) return null;
        if (aabb.maxX < ox || aabb.minX > ox + dim * step) return null;
        if (aabb.maxZ < oz || aabb.minZ > oz + dim * step) return null;
        const s = this._stempelScratch || (this._stempelScratch = {});
        s.i0 = Math.max(0, Math.floor((aabb.minX - ox) / step));
        s.i1 = Math.min(dim - 1, Math.floor((aabb.maxX - ox) / step));
        s.k0 = Math.max(0, Math.floor((aabb.minZ - oz) / step));
        s.k1 = Math.min(dim - 1, Math.floor((aabb.maxZ - oz) / step));
        const yBot = Number.isFinite(aabb.botY) ? aabb.botY : aabb.topY - 4;
        s.j0 = Math.max(0, Math.floor((yBot - oy) / step));
        s.j1 = Math.min(dimY - 1, Math.floor((aabb.topY - oy) / step));
        return s;
    }

    // Das Wasser eines Chunks (EIN Render-Pfad: das Zell-Oberkanten-Sheet). Idempotent: das alte Mesh fällt vor dem Bau.
    // Bis zur Welle L lebte hinter einem Einstellungs-Schalter ein zweiter Renderer („Zell-Iso (Debug)", im Save
    // persistiert, W-kD7) — der Zwilling ist gefallen.
    _buildVoxelChunkWaterIsoSurface(cx, cz) {
        if (!this.state.scene || typeof THREE === "undefined") return null;
        if (!this.state.voxelChunks) return null;
        if (!this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso = new Map();
        const key = `${cx},${cz}`;
        this._disposeVoxelChunkWaterIso(key);
        return this._buildVoxelChunkWaterCellSheet(cx, cz, key);
    }

    // Zell-Oberkanten-Sheet (Default-Wasser-Render): Domäne NUR über wassertragenden Spalten + 1-Zell-
    // Anker-Ring, der unter das Terrain taucht; Ruhe-Höhe = sub-zelliger Body-Spiegel `L` (±1 Zelle) +
    // Live-CA-Delta (`_caColumnScan`); wet-only-Glätten (PAD=3) über Säulen-Dächer, nie die Zell-Iso-
    // Hülle. Naht-symmetrisch: Rand-Spalten aus DENSELBEN Zellen. Mathe EINMAL in `_computeWaterSheetData`
    // (Zellen/Level nur via ctx) → Worker `buildWaterSheetGeometry` byte-identisch; Carve/CA-aktiv sync.
    _buildVoxelChunkWaterCellSheet(cx, cz, key) {
        const entry = this.state.voxelChunks.get(key);
        if (!entry || !entry.waterCells || !this._wasserSheetTraegt(cx, cz)) {
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        // Der eigene Bau ZEICHNET das gewünschte Dach (`_caDachNeu` der Re-Mesh-Entscheidung): ab jetzt zeigt der
        // Chunk es, also lesen die acht Nachbarn es — sie bauen neu (die Kante wandert mit, s. `_caDachAus`).
        if (entry._caDachOffen) {
            const alt = entry._caDach;
            entry._caDach = entry._caDachNeu;
            entry._caDachNeu = alt || null; // der Puffer kehrt als nächster Wunsch-Puffer zurück (alloc-frei)
            entry._caDachOffen = false;
            if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    if (!dx && !dz) continue;
                    const nk = `${cx + dx},${cz + dz}`;
                    const nb = this.state.voxelChunks.get(nk);
                    if (nb && nb.waterCells) this.state.pendingWaterIso.add(nk);
                }
        }
        const data = this._computeWaterSheetData(cx, cz, this._mainWaterSheetCtx(cx, cz, entry));
        if (!data) {
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        return this._finalizeWaterSheetMesh(cx, cz, key, data);
    }

    // Trägt der Chunk ein Sheet? Das Gate kennt das LIVE-Wasser: ein Chunk ohne Atlas-Wasser kann CA-Wasser tragen
    // (Ausbreitung über die Grenze) — hat er einen Level-Eintrag, entscheidet der Spalten-Scan, nicht der Atlas. EIN Gate
    // für den Bau (`_buildVoxelChunkWaterCellSheet`) und das Gezeichnete, bevor es gezeichnet ist (`_wasserNetz`).
    _wasserSheetTraegt(cx, cz) {
        const levelMap = this.state.waterLevelCells;
        return this._voxelChunkHasAnyWater(cx, cz) || !!(levelMap && levelMap.has(`${cx},${cz}`));
    }

    // ═══ DAS GEZEICHNETE WASSER ALS WAHRHEIT (Gegenprüfung 07.10., Runde 4) ═══
    // Was die Welt als Wasser zeichnet, ist die Wasser-Wahrheit am Körper (`_koerperWasser`): die Dreiecke des Wasser-Sheets
    // eines Chunks — dieselben Zahlen, die der Renderer bekommt (`geometry.attributes.position`, Float32) — je Zelle des
    // 1,8-m-Gitters gefächert. Bis zur Gegenprüfung las der Körper das Gesetz an seinem Punkt, die Welt zeichnete auf dem
    // 1,8-m-Gitter (jede Spalte flutet ganz, ihre Ecken tragen den Spiegel): am Bach der Mess-Wiese zeichnete sie auf 64 m
    // Breite Wasser, in dem der Körper trocken stand, und die Nah-Streu setzte Farne hinein; vor Runde 3 umgekehrt (der
    // Körper las 177 m, die die Welt nicht zeichnete). Rückgabe: das Netz, null (der Chunk zeichnet kein Wasser) oder
    // undefined (kein Chunk geladen — die Ferne, dort liest der Körper das Gesetz). Ist ein Chunk geladen, sein Sheet aber noch
    // nicht gebaut, rechnet DIESELBE Rechnung (`_computeWaterSheetData`, das Gate `_wasserSheetTraegt`) das Netz vorab, einmal
    // je Zell-Stand. Gleicher Inhalt ist dasselbe Netz: seine Kennung bleibt (die Nah-Streu baut nur bei echter Änderung neu).
    _wasserNetz(cx, cz) {
        const st = this.state;
        const key = `${cx},${cz}`;
        const entry = st.voxelChunks ? st.voxelChunks.get(key) : null;
        if (!entry) return undefined;
        if (!entry.waterCells) return null;
        const iso = st.voxelChunkWaterIso;
        const gezeichnet = !!iso && iso.has(key);
        const quelle = gezeichnet ? iso.get(key) : entry.waterCells;
        const alt = entry._wasserNetz;
        if (alt && alt.quelle === quelle) return alt.netz;
        let pos = null;
        let idx = null;
        if (gezeichnet) {
            if (quelle) {
                // DAS NETZ TRÄGT SEINE BYTES (K37): die Positionen des gezeichneten Sheets sind ein View in den Puffer des
                // Wasser-Satzes (`_chunkSatzViews`); verdichtet sich der Satz, schiebt er die Bereiche im alten Puffer nach
                // vorn (`copyWithin`) und zeigt neue Views — ein Netz, das den alten View hielt, las danach fremde Bytes. Am
                // Damm im Tal 26/−120 verlor `_nassAt` so 285–1 309 von 2 070 nassen Punkten eines Sees, dessen Sheet stand.
                pos = Float32Array.from(quelle.geometry.attributes.position.array);
                idx = quelle.geometry.index.array;
            }
        } else if (this._wasserSheetTraegt(cx, cz)) {
            const d = this._computeWaterSheetData(cx, cz, this._mainWaterSheetCtx(cx, cz, entry));
            if (d) {
                pos = Float32Array.from(d.positions);
                idx = Uint32Array.from(d.indices);
            }
        }
        let netz = pos ? this._wasserNetzBau(cx, cz, pos, idx) : null;
        if (alt && AnazhRealm._wasserNetzGleich(alt.netz, netz)) netz = alt.netz;
        entry._wasserNetz = { quelle, netz };
        return netz;
    }

    // Das Netz eines Sheets: jedes Dreieck in jeder Zelle (1,8 m) des um eine Zelle erweiterten Chunks, die seine xz-Hülle
    // berührt (die Rand-Vertices sind bis 0,54 m versetzt, `_computeWaterSheetData`) — CSR (`start` · `liste`).
    _wasserNetzBau(cx, cz, pos, idx) {
        const { dim, step, span } = this._voxelChunkConfig(0);
        const nb = dim + 2;
        const gx0 = cx * span - step;
        const gz0 = cz * span - step;
        const triN = (idx.length / 3) | 0;
        const start = new Int32Array(nb * nb + 1);
        const faecher = (t, tu) => {
            const a = 3 * idx[3 * t];
            const b = 3 * idx[3 * t + 1];
            const c = 3 * idx[3 * t + 2];
            const i0 = Math.max(0, Math.floor((Math.min(pos[a], pos[b], pos[c]) - gx0) / step));
            const i1 = Math.min(nb - 1, Math.floor((Math.max(pos[a], pos[b], pos[c]) - gx0) / step));
            const k0 = Math.max(0, Math.floor((Math.min(pos[a + 2], pos[b + 2], pos[c + 2]) - gz0) / step));
            const k1 = Math.min(nb - 1, Math.floor((Math.max(pos[a + 2], pos[b + 2], pos[c + 2]) - gz0) / step));
            for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) tu(i + k * nb);
        };
        for (let t = 0; t < triN; t++) faecher(t, (f) => start[f + 1]++);
        for (let f = 0; f < nb * nb; f++) start[f + 1] += start[f];
        const liste = new Int32Array(start[nb * nb]);
        const fuell = start.slice(0, nb * nb);
        for (let t = 0; t < triN; t++) faecher(t, (f) => (liste[fuell[f]++] = t));
        return { pos, idx, gx0, gz0, nb, step, start, liste };
    }

    // Das höchste Dreieck eines Netzes über (x, z) (baryzentrisch in xz; senkrechte Vorhänge tragen keine Fläche) oder null.
    static _wasserNetzHoehe(n, x, z) {
        const i = Math.floor((x - n.gx0) / n.step);
        const k = Math.floor((z - n.gz0) / n.step);
        if (i < 0 || k < 0 || i >= n.nb || k >= n.nb) return null;
        const f = i + k * n.nb;
        const p = n.pos;
        const ix = n.idx;
        let best = null;
        for (let q = n.start[f]; q < n.start[f + 1]; q++) {
            const t = n.liste[q];
            const a = 3 * ix[3 * t];
            const b = 3 * ix[3 * t + 1];
            const c = 3 * ix[3 * t + 2];
            const d = (p[b + 2] - p[c + 2]) * (p[a] - p[c]) + (p[c] - p[b]) * (p[a + 2] - p[c + 2]);
            if (Math.abs(d) < 1e-12) continue;
            const u = ((p[b + 2] - p[c + 2]) * (x - p[c]) + (p[c] - p[b]) * (z - p[c + 2])) / d;
            const v = ((p[c + 2] - p[a + 2]) * (x - p[c]) + (p[a] - p[c]) * (z - p[c + 2])) / d;
            const w = 1 - u - v;
            if (u < -1e-6 || v < -1e-6 || w < -1e-6) continue;
            const y = u * p[a + 1] + v * p[b + 1] + w * p[c + 1];
            if (best === null || y > best) best = y;
        }
        return best;
    }

    static _wasserNetzGleich(a, b) {
        if (!a || !b) return a === b;
        if (a.pos.length !== b.pos.length || a.idx.length !== b.idx.length) return false;
        for (let i = 0; i < a.pos.length; i++) if (a.pos[i] !== b.pos[i]) return false;
        for (let i = 0; i < a.idx.length; i++) if (a.idx[i] !== b.idx[i]) return false;
        return true;
    }

    // Die Höhe des gezeichneten Wassers an (x, z): das höchste Dreieck der Sheets, die den Punkt tragen — des eigenen Chunks
    // und der Nachbarn, deren Kante näher als WASSER_BILD_RAND liegt (ihre Rand-Vertices sind versetzt). null = kein Wasser
    // gezeichnet, undefined = kein Chunk geladen.
    _wasserBildAt(x, z) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.WASSER_BILD_RAND;
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const eigen = this._wasserNetz(cx, cz);
        if (eigen === undefined) return undefined;
        let best = eigen ? AnazhRealm._wasserNetzHoehe(eigen, x, z) : null;
        const fx = x - cx * span;
        const fz = z - cz * span;
        for (let dz = -1; dz <= 1; dz++) {
            if (dz < 0 ? fz > R : dz > 0 ? span - fz > R : false) continue;
            for (let dx = -1; dx <= 1; dx++) {
                if ((!dx && !dz) || (dx < 0 ? fx > R : dx > 0 ? span - fx > R : false)) continue;
                const n = this._wasserNetz(cx + dx, cz + dz);
                if (!n) continue;
                const y = AnazhRealm._wasserNetzHoehe(n, x, z);
                if (y !== null && (best === null || y > best)) best = y;
            }
        }
        return best;
    }

    // Die Kennungen des gezeichneten Wassers über einem Rechteck (eine Kachel der Nah-Streu/Nah-Wiese): je Chunk, dessen Sheet
    // ein Punkt des Rechtecks lesen kann, sein Netz. Eine Kachel baut neu, sobald eines sich ändert (`_wasserKennungenGleich`).
    _wasserKennungen(x0, z0, x1, z1) {
        const span = this._voxelChunkConfig(0).span;
        const R = AnazhRealm.WASSER_BILD_RAND;
        const aus = [];
        for (let cz = Math.floor((z0 - R) / span); cz <= Math.floor((z1 + R) / span); cz++)
            for (let cx = Math.floor((x0 - R) / span); cx <= Math.floor((x1 + R) / span); cx++)
                aus.push(cx, cz, this._wasserNetz(cx, cz));
        return aus;
    }

    _wasserKennungenGleich(k) {
        if (!k) return false;
        for (let i = 0; i < k.length; i += 3) if (this._wasserNetz(k[i], k[i + 1]) !== k[i + 2]) return false;
        return true;
    }

    // B1 — der Main-Zell-Kontext: liest die geladenen Chunk-Zellen + DAS GEZEICHNETE DACH jedes Chunks
    // (`entry._caDach`, s. `_caDachAus`). Der Worker-Pendant (im `water-sheet`-Handler) liest stattdessen den
    // gesendeten Block (dachlos: der Worker baut nur dachlose Nachbarschaften, `_waterSheetCaFree`).
    _mainWaterSheetCtx(cx, cz, entry) {
        const voxelChunks = this.state.voxelChunks;
        // V18.91 — OBERFLÄCHENSPANNUNG (Schöpfer: „nicht geknäulte Alufolie"): die
        // Glätt-Pässe (browser-justierbar 0..6). PAD = Pässe + 1 (naht-symmetrisch).
        const smoothRaw =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterSheetSmooth)
                ? Math.round(this.state.atmosphere.waterSheetSmooth)
                : 4;
        return {
            smoothPasses: Math.max(0, Math.min(6, smoothRaw)),
            getCells: (ncx, ncz) => {
                if (ncx === cx && ncz === cz) return entry.waterCells;
                const nb = voxelChunks.get(`${ncx},${ncz}`);
                return nb && nb.waterCells ? nb.waterCells : null;
            },
            // DIE WASSER-NAHT (Linse 05.10., echte GPU): ein Sheet las den LIVE-Pegel seiner Nachbarn, der Nachbar
            // selbst zeigte den Pegel SEINES letzten Baus (das Re-Mesh folgt nur der sichtbaren Dach-Änderung, über
            // Takte verteilt) — die gemeinsame Kante stand auf zwei Höhen (bis 5,9 cm, 68 Stufen an 22 Kanten):
            // durch den Schlitz die dunkle Linie über dem See. Jedes Sheet liest darum das GEZEICHNETE Dach, das
            // die Re-Mesh-Entscheidung schreibt — dieselbe Zahl, die der Nachbar zeichnet.
            getDach: (ncx, ncz) => {
                const e = ncx === cx && ncz === cz ? entry : voxelChunks.get(`${ncx},${ncz}`);
                return e && e._caDach ? e._caDach : undefined;
            },
        };
    }

    // B1 — die THREE-Hülle des Wasser-Sheets (Main-only): die rohen Arrays (Main-sync
    // ODER vom Worker geliefert) → BufferGeometry + geteiltes Hydro-Material + Mesh.
    // Geteilt vom Sync-Pfad UND dem async Worker-Pfad (`_applyWorkerWaterSheet`).
    _finalizeWaterSheetMesh(cx, cz, key, data) {
        if (!this.state.scene || typeof THREE === "undefined") return null;
        if (!this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso = new Map();
        this._disposeVoxelChunkWaterIso(key);
        const positions = data.positions;
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute("aFlow", new THREE.Float32BufferAttribute(data.aFlow, 2));
        geom.setAttribute("aWave", new THREE.Float32BufferAttribute(data.aWave, 1));
        geom.setAttribute("aDepth", new THREE.Float32BufferAttribute(data.aDepth, 1));
        geom.setAttribute("aSlope", new THREE.Float32BufferAttribute(data.aSlope, 1));
        geom.setIndex(Array.from(data.indices));
        const mat = this._ensureHydroSurfaceMaterial();
        if (!mat) {
            this._queueGeometryDispose(geom);
            this.state.voxelChunkWaterIso.set(key, null);
            return null;
        }
        // CPU-Körper wie der Iso-Pfad; gezeichnet als Bereich im Wasser-Satz (Sync- und Worker-Sheet, ein Eintritt).
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = {
            isHydrosphere: true,
            hydroKind: "chunk-water-cellsheet",
            voxelChunkX: cx,
            voxelChunkZ: cz,
        };
        this._chunkSatzEin("wasser", key, geom, key);
        this.state.voxelChunkWaterIso.set(key, mesh);
        return mesh;
    }

    // Die EINE pure-typed-array-Mathematik des Zell-Oberkanten-Sheets: keine THREE-Objekte, Zellen/Level
    // NUR via ctx → der Worker-Mirror `buildWaterSheetGeometry` ist byte-identisch. Liefert
    // {positions, indices, aFlow, aWave, aDepth, aSlope} (plain Arrays) oder null.
    _computeWaterSheetData(cx, cz, ctx) {
        // Wie die Zellen + die Fläche: IMMER LOD0 (V9.93/V18.22 — eine Skala).
        const cfg0 = this._voxelChunkConfig(0);
        const dim = cfg0.dim,
            dimY = cfg0.dimY,
            step = cfg0.step,
            span = cfg0.span;
        const ox = cx * span;
        const oz = cz * span;
        const oy = (this.state.terrainBaseHeight || 0) - cfg0.floorDrop;
        const dimSq = dim * dim;
        const waterLevel = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const SMOOTH_PASSES = ctx.smoothPasses;
        const PAD = SMOOTH_PASSES + 1;
        const GW = dim + 2 * PAD;
        const topG = new Float64Array(GW * GW).fill(NaN); // NaN = trocken
        const solidG = new Float64Array(GW * GW); // Boden-Anker (Unterkante der höchsten SOLID-Zelle)
        const depthG = new Float64Array(GW * GW); // Wasser-Säulen-Dicke (aDepth)
        // RUHENDES Wasser je Spalte (1): das Dach IST der Spiegel des Gesetzes — kein Live-Delta, keine Klemme. Seine Vertices
        // tragen den Spiegel des Gesetzes an ihrem eigenen Ort (`addVert`), nie das Mittel der Nachbar-Dächer.
        const ruhG = new Uint8Array(GW * GW);
        for (let ck = -PAD; ck < dim + PAD; ck++) {
            for (let ci = -PAD; ci < dim + PAD; ci++) {
                const gi = ci + PAD + (ck + PAD) * GW;
                // Nachbar-Redirect (V18.18-Muster; PAD < dim → ein Schritt genügt).
                let ncx = cx,
                    ncz = cz,
                    li = ci,
                    lk = ck;
                if (li < 0) {
                    ncx -= 1;
                    li += dim;
                } else if (li >= dim) {
                    ncx += 1;
                    li -= dim;
                }
                if (lk < 0) {
                    ncz -= 1;
                    lk += dim;
                } else if (lk >= dim) {
                    ncz += 1;
                    lk -= dim;
                }
                let src = ctx.getCells(cx, cz);
                let srcCX = cx,
                    srcCZ = cz;
                let dryFallback = false;
                if (ncx !== cx || ncz !== cz) {
                    const nb = ctx.getCells(ncx, ncz);
                    if (nb) {
                        src = nb;
                        srcCX = ncx;
                        srcCZ = ncz;
                    } else {
                        // Symmetrie-Fallback: ein fehlender/trockener Nachbar zählt TROCKEN (reader-unabhängig — ein Clamp
                        // auf die eigene Rand-Spalte gab zwei Chunks am 4-Ecken-Punkt verschiedene Pad-Werte → Naht); der
                        // Boden (nur für den Anker) kommt aus der eigenen Rand-Spalte; Ungeladene heilen beim Re-Enqueue.
                        li = Math.max(0, Math.min(dim - 1, ci));
                        lk = Math.max(0, Math.min(dim - 1, ck));
                        src = ctx.getCells(cx, cz);
                        srcCX = cx;
                        srcCZ = cz;
                        dryFallback = true;
                    }
                }
                // Flood und Boden aus den Zellen; das LIVE-Dach (oberste Zeile + Füllgrad > 0,5) aus dem gezeichneten
                // Dach des Quell-Chunks (`ctx.getDach`, −1 = keins) — nie der Live-Pegel (die Wasser-Naht).
                const dach = ctx.getDach(srcCX, srcCZ);
                const sc = this._caColumnScan(src, null, li + lk * dim, dimSq, dimY);
                const live = dach ? dach[li + lk * dim] : -1;
                solidG[gi] = sc.solidTopJ >= 0 ? oy + sc.solidTopJ * step : oy;
                if (dryFallback) continue; // trocken — topG bleibt NaN (symmetrisch)
                // Live-only-Spalten (der CA trug Wasser in flood-trockene Spalten) sind NASS ab Level > 0.5:
                // Top = Live-Dach (sub-zellig via liveFrac), kein L-Anker (jenseits der statischen Domäne).
                if (sc.floodTopJ < 0) {
                    if (dach && live >= 0) {
                        // V18.377 — depthG (aDepth) wird GLOBAL als KONTINUIERLICHE Tiefe
                        // gesetzt (tops − geglättetes Bett, NACH dem Glätten); hier nur topG.
                        topG[gi] = oy + live * step;
                    }
                    continue; // sonst trocken (topG bleibt NaN)
                }
                // DIE GELEERTE SPALTE IST TROCKEN (K37): trägt das gezeichnete Dach des Automaten in einer Flut-Spalte kein
                // Wasser mehr (−1), ist die Spalte trocken. Bis K37 zeichnete das Sheet sie 14 m unter dem Spiegel (die Klemme
                // des Live-Deltas): eine Grube mit weißen Wänden, Spalte für Spalte eine Treppe. Worker bit-identisch.
                if (dach && live < 0) continue;
                const faceY = oy + (sc.floodTopJ + 1) * step; // Zell-Dach (quantisiert)
                // RUHE: sub-zellig der Body-Spiegel `L` (das Gesetz `_atlasWaterLevelAt`: Ozean, See, der Fluss-Spiegel
                // — stromab nie steigend, quer waagrecht), geklemmt von der Unterkante der Zelle unter dem Dach bis eine
                // Zelle darüber (gegen Atlas/Zell-Drift): die Deck-Zelle (`_buildVoxelChunkWaterCells` 4b) trägt einen
                // Spiegel, der in der obersten festen Zelle liegt (ein Rinnsal über seinem Boden).
                const wx = ox + (ci + 0.5) * step;
                const wz = oz + (ck + 0.5) * step;
                // Das Ufer-Urteil liest die Unterkante der obersten festen Zelle: die Spalte IST nass (das Zell-Gesetz flutete
                // sie über dem tiefsten Boden ihrer Ecken), nur „unbekannt" (−Inf) verliert die Rim-Füllung; bis zur
                // Gegenprüfung 07.10. (Runde 3) las es die Oberkante. Gefragt wird wie im Zell-Gesetz an der Mitte und den
                // vier Ecken (das Höchste): eine Spalte, die das Wasser nur an einer Ecke trägt, zeichnete sonst ihr Zell-Dach.
                let L = this._atlasWaterLevelAt(wx, wz, solidG[gi]);
                for (let e = 0; e < 4; e++) {
                    const le = this._atlasWaterLevelAt(
                        ox + (ci + (e & 1)) * step,
                        oz + (ck + (e >> 1)) * step,
                        solidG[gi]
                    );
                    if (le > L) L = le;
                }
                let top = L > -Infinity ? Math.max(faceY - 2 * step, Math.min(faceY + step, L)) : faceY;
                let ruht = L > -Infinity && top === L;
                // LIVE: der CA-Delta obendrauf (gezeichnetes Live-Dach − Flood-Dach, geclampt).
                if (dach) {
                    const floodRel = (sc.floodTopJ + 1) * step;
                    let d = live * step - floodRel; // live ≥ 0: die geleerte Spalte ist oben schon trocken
                    if (d > -0.05 && d < 0.05) d = 0;
                    if (d !== 0) ruht = false;
                    top += Math.max(-14, Math.min(4, d));
                }
                topG[gi] = top;
                ruhG[gi] = ruht ? 1 : 0;
                // depthG (aDepth) wird GLOBAL als kontinuierliche Tiefe gesetzt (V18.377, s.u.).
            }
        }
        // Der Boden-Anker ist überhang-blind: `solidG` (erste SOLID-Zelle von oben) wäre unter einem
        // schwebenden Bau der BAU. Für trockene Anker-Spalten (≥1 nasser 4-Nachbar) darum die erste SOLID-
        // Zelle UNTERHALB des höchsten Nachbar-Wasserdachs → Verankerung am Ufer-Fuß. Nasse Spalten brauchen
        // das nicht (kein SOLID über ihrem Wasser → solid-von-oben == Boden).
        const SOLID_CS = AnazhRealm.CELL_STATE.SOLID;
        for (let ck = -PAD; ck < dim + PAD; ck++) {
            for (let ci = -PAD; ci < dim + PAD; ci++) {
                const gi = ci + PAD + (ck + PAD) * GW;
                if (!Number.isNaN(topG[gi])) continue; // nass → Boden stimmt schon
                let nbTop = -Infinity;
                if (ci + 1 < dim + PAD) {
                    const v = topG[gi + 1];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ci - 1 >= -PAD) {
                    const v = topG[gi - 1];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ck + 1 < dim + PAD) {
                    const v = topG[gi + GW];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (ck - 1 >= -PAD) {
                    const v = topG[gi - GW];
                    if (!Number.isNaN(v) && v > nbTop) nbTop = v;
                }
                if (nbTop === -Infinity) continue; // kein Wasser angrenzend → Anker irrelevant
                // Redirect wie im Grid-Pass (eigene Rand-Spalte als Fallback).
                let ncx = cx,
                    ncz = cz,
                    li = ci,
                    lk = ck;
                if (li < 0) {
                    ncx -= 1;
                    li += dim;
                } else if (li >= dim) {
                    ncx += 1;
                    li -= dim;
                }
                if (lk < 0) {
                    ncz -= 1;
                    lk += dim;
                } else if (lk >= dim) {
                    ncz += 1;
                    lk -= dim;
                }
                let src = ctx.getCells(cx, cz);
                if (ncx !== cx || ncz !== cz) {
                    const nb = ctx.getCells(ncx, ncz);
                    if (nb) src = nb;
                    else {
                        li = Math.max(0, Math.min(dim - 1, ci));
                        lk = Math.max(0, Math.min(dim - 1, ck));
                        src = ctx.getCells(cx, cz);
                    }
                }
                const colBase = li + lk * dim;
                const fromJ = Math.min(dimY - 1, Math.floor((nbTop - oy) / step) + 1);
                let gj = -1;
                for (let j = fromJ; j >= 0; j--) {
                    if (src[colBase + j * dimSq] === SOLID_CS) {
                        gj = j;
                        break;
                    }
                }
                solidG[gi] = gj >= 0 ? oy + gj * step : oy;
            }
        }
        // Wet-only-Glätten (SMOOTH_PASSES × Radius 1): nimmt 1.8-m-Treppen + CA-Stufen, ohne das Ufer zum
        // Trockenen zu ziehen. Höhen-Gate: ein Nachbar zählt NUR bei |top_nb − top_roh| ≤ BLUR_GATE = 2·step
        // — eine CA-Stufe (≤1 Zelle) soll glätten, ab 2 Zellen ist es eine WAND (sonst zöge der Blur Tal-
        // Dächer über die Klippe → Phantom-Wasserfall). ROH gegen ROH → symmetrisch, naht-frei. Mirror
        // byte-identisch in voxel-worker.js `buildWaterSheetGeometry`; Linse `gate:wasser-wahrheit`.
        const BLUR_GATE = step * 2;
        const topRawG = Float64Array.from(topG);
        let cur = topG;
        let buf = new Float64Array(GW * GW);
        for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
            buf.fill(NaN);
            for (let g = 0; g < GW * GW; g++) {
                if (Number.isNaN(cur[g])) continue;
                const gx = g % GW;
                const gz = (g / GW) | 0;
                let sum = 0;
                let n = 0;
                for (let dz2 = -1; dz2 <= 1; dz2++) {
                    for (let dx2 = -1; dx2 <= 1; dx2++) {
                        const nx = gx + dx2;
                        const nz = gz + dz2;
                        if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                        const ng = nx + nz * GW;
                        const v = cur[ng];
                        if (!Number.isNaN(v)) {
                            // V18.475 — das Höhen-Gate (s.o.): nur Dächer derselben Etage.
                            if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                            sum += v;
                            n++;
                        }
                    }
                }
                buf[g] = sum / n;
            }
            const t = cur;
            cur = buf;
            buf = t;
        }
        const tops = cur;
        const colTop = (ci, ck) => tops[ci + PAD + (ck + PAD) * GW];
        const colWet = (ci, ck) => !Number.isNaN(colTop(ci, ck));
        // SLOPE pro Spalte (|∇top| der geglätteten Dächer) treibt das Wildwasser im Shader. Nass↔nass =
        // Dach-Gefälle; nass↔trocken zählt nur als LIPPE, wenn der Boden > 3 m unter dem Dach liegt —
        // normale Ufer bleiben ruhig.
        const slopeG = new Float32Array(GW * GW);
        for (let gz = 1; gz < GW - 1; gz++) {
            for (let gx = 1; gx < GW - 1; gx++) {
                const g = gx + gz * GW;
                const t0 = tops[g];
                if (Number.isNaN(t0)) continue;
                let mx = 0;
                for (const nb of [g - 1, g + 1, g - GW, g + GW]) {
                    const tn = tops[nb];
                    let d = 0;
                    if (!Number.isNaN(tn)) d = Math.abs(t0 - tn) / step;
                    else if (solidG[nb] < t0 - 3) d = Math.min(4, (t0 - solidG[nb]) / step);
                    if (d > mx) mx = d;
                }
                slopeG[g] = mx;
            }
        }
        // aDepth + aSlope sind Shader-AMPLITUDEN-Treiber (rippleAmt, whitewater) → sie laufen durch DENSELBEN
        // wet-only Box-Blur wie `tops` (über das padded GW-Grid, beide Nachbarn rechnen am Rand denselben
        // Wert) — roh sprangen sie von Zelle zu Zelle und an der Grenze (konzentrisches Naht-Muster).
        // Die Pass-Zahl MUSS ≤ SMOOTH_PASSES sein: nur dann passt der Radius in den PAD (=SMOOTH_PASSES+1),
        // sonst wird die Rand-Trunkierung asymmetrisch → Attribut-Naht. Byte-identisch im Worker-Mirror.
        const _smoothWetAttr = (arr, passes = SMOOTH_PASSES) => {
            const out = new Float64Array(GW * GW);
            for (let pass = 0; pass < passes; pass++) {
                for (let g = 0; g < GW * GW; g++) {
                    if (Number.isNaN(tops[g])) {
                        out[g] = arr[g];
                        continue;
                    }
                    const gx = g % GW;
                    const gz = (g / GW) | 0;
                    let sum = 0;
                    let nn = 0;
                    for (let dz2 = -1; dz2 <= 1; dz2++) {
                        for (let dx2 = -1; dx2 <= 1; dx2++) {
                            const nx = gx + dx2;
                            const nz = gz + dz2;
                            if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                            const ng = nx + nz * GW;
                            if (Number.isNaN(tops[ng])) continue; // nur NASSE Nachbarn (kein Ufer-Zug)
                            // V18.475 — dasselbe HÖHEN-GATE wie der tops-Blur (Herleitung dort):
                            // Bett/Slope/Flow bluten nicht über die Klippe — Plateau-Lauf und
                            // Tal-Pool sind zwei Etagen, keine Nachbarn.
                            if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                            sum += arr[ng];
                            nn++;
                        }
                    }
                    out[g] = nn > 0 ? sum / nn : arr[g];
                }
                for (let g = 0; g < GW * GW; g++) arr[g] = out[g];
            }
        };
        // Kontinuierliche Tiefe: depth = smooth(tops) − smooth(bed), bed = `solidG + step` (Bett-OBERFLÄCHE;
        // ohne +step 1 Zelle zu tief) — stetig über die Breite statt zell-quantisiert (1,8-m-Stufen gaben
        // diskrete Farb-Bänder). KEINE zweite Glättung der Differenz: zwei naht-exakte Felder ergeben eine
        // naht-exakte Differenz; ein weiterer Blur reichte über den Pad. Byte-identisch im Worker.
        const bedG = new Float64Array(GW * GW);
        for (let g = 0; g < GW * GW; g++) bedG[g] = solidG[g] + step;
        _smoothWetAttr(bedG);
        for (let g = 0; g < GW * GW; g++) depthG[g] = Number.isNaN(tops[g]) ? 0 : Math.max(0, tops[g] - bedG[g]);
        // slope ist eine ABLEITUNG (liest tops ±1) → ihr Grenz-Kegel reicht eine Zelle weiter; ein Pass
        // weniger hält ihn im PAD. Rest-Diff am geteilten Vertex ~0.004 (0.1–0.4 % Schaum-Amplitude,
        // unsichtbar); exakt 0 bräuchte PAD+4 (~50 % teurer) — bewusst nicht.
        const slopeGS = new Float64Array(GW * GW);
        for (let g = 0; g < GW * GW; g++) slopeGS[g] = slopeG[g];
        _smoothWetAttr(slopeGS, Math.max(0, SMOOTH_PASSES - 1));
        for (let g = 0; g < GW * GW; g++) slopeG[g] = slopeGS[g];
        // Strömung als geglättetes Spalten-Feld: EIN `_hydroRiverAt`-Sample pro Spalte (GW² statt ~5625
        // Calls) → derselbe wet-only Box-Blur → der Vertex mittelt 4 geglättete Spalten. Ein Pro-Vertex-
        // Mittel binärer Treffer flatterte → riverness/flowMix wechselten das Regime dreieckshart.
        const flowXG = new Float64Array(GW * GW);
        const flowZG = new Float64Array(GW * GW);
        for (let gz = 0; gz < GW; gz++) {
            for (let gx = 0; gx < GW; gx++) {
                const g = gx + gz * GW;
                if (Number.isNaN(tops[g])) continue; // Strömung lebt auf dem WASSER (Anker 0)
                const wxc = ox + (gx - PAD + 0.5) * step;
                const wzc = oz + (gz - PAD + 0.5) * step;
                const rv = this._hydroRiverAt(wxc, wzc);
                if (rv && (rv.flowX || rv.flowZ)) {
                    const m = Math.hypot(rv.flowX, rv.flowZ) || 1;
                    flowXG[g] = rv.flowX / m;
                    flowZG[g] = rv.flowZ / m;
                }
            }
        }
        _smoothWetAttr(flowXG);
        _smoothWetAttr(flowZG);
        // Vertex-Grid (dim+1)²: Vertex (i,k) = Ecke der Spalten (i−1,k−1)…(i,k).
        const NV = dim + 1;
        const positions = [];
        const indices = [];
        const aFlow = [];
        const aWave = [];
        const aDepth = [];
        const aSlope = [];
        const vmap = new Int32Array(NV * NV).fill(-1);
        const vertIsAnchor = []; // V18.114 — pro Vertex: Anker (kein nasser Nachbar)?
        // Welt-deterministischer Vertex-Jitter gegen Gitter-Moiré: das reguläre 1,8-m-Gitter aliast am
        // grazing-Blick; ein kleiner horizontaler Versatz pro Vertex aus dem GLOBALEN Grid-Index (cx·dim+i)
        // macht daraus inkohärentes Rauschen. Naht-sicher (Rand-Vertices teilen den Index). Integer-Hash
        // (Math.imul/>>>0) → byte-identisch im Worker (diag-worker-watersheet 0).
        const _jhash = (a, b) => {
            let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
            h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
            return ((h ^ (h >>> 16)) >>> 0) / 4294967296 - 0.5;
        };
        const _jitAmp = step * 0.6;
        const addVert = (i, k) => {
            const vi = i + k * NV;
            if (vmap[vi] >= 0) return vmap[vi];
            const wx = ox + i * step;
            const wz = oz + k * step;
            let sum = 0;
            let n = 0;
            let rohMin = Infinity;
            let rohMax = -Infinity;
            let ruht = true;
            let dsum = 0;
            let sfx = 0;
            let sfz = 0;
            let slopeMax = 0;
            let anchor = Infinity;
            for (const [aci, ack] of [
                [i - 1, k - 1],
                [i, k - 1],
                [i - 1, k],
                [i, k],
            ]) {
                const gi2 = aci + PAD + (ack + PAD) * GW;
                const v = colTop(aci, ack);
                if (!Number.isNaN(v)) {
                    sum += v;
                    n++;
                    if (topRawG[gi2] < rohMin) rohMin = topRawG[gi2];
                    if (topRawG[gi2] > rohMax) rohMax = topRawG[gi2];
                    if (!ruhG[gi2]) ruht = false;
                    dsum += depthG[gi2];
                    sfx += flowXG[gi2];
                    sfz += flowZG[gi2];
                    if (slopeG[gi2] > slopeMax) slopeMax = slopeG[gi2];
                }
                const sv = solidG[gi2];
                if (sv < anchor) anchor = sv;
            }
            // UNIFORMER Jitter (keine Steigungs-Skala): `slopeMax` ist pro Chunk verschieden → verschiedene
            // Magnituden an Rand-Vertices = Riss. Gleiche Amplitude + globaler-Index-Hash → Rand-Vertices fallen
            // exakt zusammen; auf flachem Wasser ist horizontaler Jitter unsichtbar. `slopeMax` bleibt für
            // aSlope/Whitewater.
            const _jdir = _jhash(cx * dim + i, cz * dim + k) * _jitAmp;
            const _jdir2 = _jhash(cz * dim + k + 8191, cx * dim + i + 131071) * _jitAmp;
            // Nasser Vertex: RUHT das Wasser aller nassen Nachbar-Spalten, trägt er den Spiegel des Gesetzes an seinem
            // eigenen Ort (dieselbe Zahl, die der Körper dort liest, `_koerperWasser`; jenseits der Krone der Fluss-Spiegel quer,
            // `_hydroSpiegelQuer`), gehalten zwischen die rohen Dächer der nassen Nachbar-Spalten (ein fremdes Wasser am Ort des
            // Vertex — ein See-Feld daneben — hebt ihn nie) — das Mittel der GEGLÄTTETEN Dächer zog am Ende eines steilen Laufs
            // das Wasser unter den Boden
            // (Quelle der Kachel −1624/−1080: Spiegel 74,04, gezeichnet 73,00, Boden 73,62). Sonst (Live-Delta, Klemme) das
            // geglättete Wasser-Dach. Anker-Vertex (kein nasser Nachbar): UNTER das Terrain (`solidG` = Unterkante der
            // höchsten SOLID-Zelle), MIN über die 4 Nachbar-Spalten — nie MAX (griffe an Klippen/Überhängen die Wand →
            // schwebende Kante); die Kante taucht am Ufer-Fuß ein.
            let surfY = anchor - 0.5;
            if (n > 0 && ruht) {
                const Lv = this._atlasWaterLevelAt(wx + _jdir, wz + _jdir2, Infinity);
                const Lq = Lv > -Infinity ? Lv : this._hydroSpiegelQuer(wx + _jdir, wz + _jdir2);
                surfY = Lq > -Infinity ? Math.max(rohMin, Math.min(rohMax, Lq)) : rohMax;
            } else if (n > 0) surfY = sum / n;
            const depthM = n > 0 ? dsum / n : 0;
            const id = positions.length / 3;
            vertIsAnchor[id] = n === 0;
            positions.push(wx + _jdir, surfY, wz + _jdir2);
            // aFlow: der Vertex mittelt die 4 geglätteten Nachbar-Spalten von flowXG/flowZG (sfx/sfz im
            // wet-Loop) → kein Regime-Patchwork, naht-exakt; der Blur trägt das Tapern zur Mündung/Bank.
            const flowN = n > 0 ? n : 1;
            const avFx = sfx / flowN;
            const avFz = sfz / flowN;
            // aWave = Höhen-Rampe (Nähe zum Meeresspiegel) × Art-Dämpfung: die Fluss-Abdeckung fmag ist DIESELBE
            // Rampe, mit der der Shader die Strähnen blendet (riverness) → Meeres-Wellen laufen sanft in die
            // Mündung ein, wo die Strähnen ausfaden. Seen bleiben still (uLakeRipple trägt ihr Kräuseln).
            const heightRamp = Math.max(0, Math.min(1, 1 - (Math.abs(surfY - waterLevel) - 0.8) / 2.0));
            const rt = Math.max(0, Math.min(1, (Math.hypot(avFx, avFz) - 0.04) / 0.46));
            const riverness = rt * rt * (3 - 2 * rt);
            const isLake = n > 0 && heightRamp > 0 && this._hydrosphereLakeAt(wx, wz);
            aWave.push(isLake ? 0 : heightRamp * (1 - riverness));
            aDepth.push(depthM);
            aSlope.push(n > 0 ? slopeMax : 0);
            aFlow.push(avFx, avFz);
            vmap[vi] = id;
            return id;
        };
        // Quad-Emission: eine Zelle (i,k) rendert, wenn ihre Spalte nass ist ODER ein 4-Nachbar (Anker-Ring).
        // Steil-Split: überspannt ein Quad > VERT_SPLIT (3·step) vertikal, wird es nicht gestreckt, sondern
        // DECK bis zur Lippe + senkrechter VORHANG (wasserdicht an beide Sheets); der Vorhang trägt
        // aSlope-Maximum → das Wildwasser schäumt den Fall weiß.
        const VERT_SPLIT = step * 3;
        const dupVert = (srcId, nx, ny, nz, slopeOverride) => {
            const id = positions.length / 3;
            positions.push(nx, ny, nz);
            aWave.push(aWave[srcId]);
            aDepth.push(aDepth[srcId]);
            aSlope.push(slopeOverride !== undefined ? slopeOverride : aSlope[srcId]);
            aFlow.push(aFlow[srcId * 2], aFlow[srcId * 2 + 1]);
            return id;
        };
        for (let k = 0; k < dim; k++) {
            for (let i = 0; i < dim; i++) {
                if (!(colWet(i, k) || colWet(i - 1, k) || colWet(i + 1, k) || colWet(i, k - 1) || colWet(i, k + 1)))
                    continue;
                const v00 = addVert(i, k);
                const v10 = addVert(i + 1, k);
                const v01 = addVert(i, k + 1);
                const v11 = addVert(i + 1, k + 1);
                const y00 = positions[v00 * 3 + 1];
                const y10 = positions[v10 * 3 + 1];
                const y01 = positions[v01 * 3 + 1];
                const y11 = positions[v11 * 3 + 1];
                const hi = Math.max(y00, y10, y01, y11);
                const lo = Math.min(y00, y10, y01, y11);
                // Der Split wirkt NUR zwischen NASSEN Säulen (echter Fall) — ein Anker-Quad (eine Ecke trocken)
                // MUSS eintauchen, sonst hebt das Deck den Anker auf Lippen-Höhe (schwebende Ufer-Kanten).
                const anyAnchor = vertIsAnchor[v00] || vertIsAnchor[v10] || vertIsAnchor[v01] || vertIsAnchor[v11];
                if (anyAnchor || hi - lo <= VERT_SPLIT) {
                    // Wicklung → -Y-Normale (BackSide-Oberseite), wie Fläche + Iso.
                    indices.push(v00, v10, v01, v11, v01, v10);
                    continue;
                }
                // dominante Fall-Achse: X (links↔rechts) oder Z (vorn↔hinten).
                const dX = Math.abs((y00 + y01) / 2 - (y10 + y11) / 2);
                const dZ = Math.abs((y00 + y10) / 2 - (y01 + y11) / 2);
                // hiA/hiB = die hohe Kante, loA/loB = die tiefe (A/B = die zwei
                // Vertices der jeweiligen Kante, konsistent gepaart).
                let hiA, hiB, loA, loB;
                if (dX >= dZ) {
                    if ((y00 + y01) / 2 >= (y10 + y11) / 2) {
                        hiA = v00;
                        hiB = v01;
                        loA = v10;
                        loB = v11;
                    } else {
                        hiA = v10;
                        hiB = v11;
                        loA = v00;
                        loB = v01;
                    }
                } else if ((y00 + y10) / 2 >= (y01 + y11) / 2) {
                    hiA = v00;
                    hiB = v10;
                    loA = v01;
                    loB = v11;
                } else {
                    hiA = v01;
                    hiB = v11;
                    loA = v00;
                    loB = v10;
                }
                const lipY = (positions[hiA * 3 + 1] + positions[hiB * 3 + 1]) / 2;
                // DECK: von der hohen Kante horizontal bis über die tiefen Vertices (deren XZ), auf Lippen-Höhe.
                // WICKLUNG exakt wie das Original-Quad (v00,v10,v01 / v11,v01,v10 → -Y-Normale, BackSide-Oberseite),
                // die tiefen Ecken durch ihre Lippen-Dups ersetzt — sonst ny>0-Decks (der W1-Test fängt es).
                const dA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2]);
                const dB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2]);
                const rep = (v) => (v === loA ? dA : v === loB ? dB : v);
                indices.push(rep(v00), rep(v10), rep(v01), rep(v11), rep(v01), rep(v10));
                // VORHANG: senkrecht von der Lippe auf die tiefen Original-
                // Vertices (teilt deren Position → wasserdicht ans untere Sheet).
                // aSlope = 4 (Cap) → der Shader schäumt den Fall weiss.
                const cA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2], 4);
                const cB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2], 4);
                const fA = dupVert(loA, positions[loA * 3], positions[loA * 3 + 1], positions[loA * 3 + 2], 4);
                const fB = dupVert(loB, positions[loB * 3], positions[loB * 3 + 1], positions[loB * 3 + 2], 4);
                // beide Wicklungen (der Fall ist von beiden Seiten sichtbar —
                // ein Vorhang hat keine „Unterseite", die der BackSide-Cull
                // verstecken müsste; zwei Dreieck-Paare = double-faced).
                indices.push(cA, fA, cB, fB, cB, fA);
                indices.push(cB, fB, cA, fA, cA, fB);
            }
        }
        if (indices.length === 0) return null;
        return { positions, indices, aFlow, aWave, aDepth, aSlope };
    }

    // V9.72 (Welle C.2) — Iso-Wasser-Mesh disposen. Geometry wird disposed,
    // Material ist welt-global geteilt → NICHT disposen (V9.43-a-Lehre).
    _disposeVoxelChunkWaterIso(key) {
        if (!this.state.voxelChunkWaterIso) return;
        const mesh = this.state.voxelChunkWaterIso.get(key);
        this._chunkSatzAus("wasser", key); // DER SATZ: der Bereich wird frei, der Index legt sich neu
        if (mesh) {
            // V10.0-j.d — geometry.dispose deferred (siehe _queueGeometryDispose).
            this._queueGeometryDispose(mesh.geometry);
        }
        this.state.voxelChunkWaterIso.delete(key);
    }

    // EIN geteiltes Material für alle Voxel-Chunks, lazy beim ersten Build (PBR via
    // `_buildToonNodeMaterial`). NIEMALS disposen — sonst sterben alle Chunks mit; `_disposeVoxelChunk`
    // räumt nur Geometrie.
    _getVoxelChunkMaterial() {
        if (this.state.voxelChunkMaterial) return this.state.voxelChunkMaterial;
        const mat = this._buildToonNodeMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            geomorph: true,
            wegeKarte: true,
            himmelsSicht: true, // die Verdeckung des Himmels-Lichts und die Normale der Höhle (`_buildPbrNodeMaterial`)
            felsImVertex: true, // die Vertex-Farbe IST der Fels-Stoff (`_felsStoff`), der Shader legt nur die feinen Bänke auf
        });
        // OBSERVER-DIÄT (Pflicht-Paar): der Chunk-Boden-Graph hängt nur an den
        // geteilten Atmo-/LOD-/Wind-Sätzen (alle renderGroup) + Vertex-Farben/
        // Morph-Attributen — die equals()-Bahn sieht Rebuilds (neue Geometrie-id).
        this._materialObserverDiaet(mat);
        this.state.voxelChunkMaterial = mat;
        return mat;
    }
}
