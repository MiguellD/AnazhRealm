class AnazhRealm_Z11c {
    // ===== ATLAS §11c · VOXEL-MESHER/WASSER — Block Vegetation =====
    // Die Wiese ist Boden-Funktion: jede Gras-Zelle wird gras-los verbucht (null), die Halme zeichnet
    // die Parallax-Funktion im Terrain-Albedo. Keine Halm-Geometrie.
    _buildVoxelChunkGrass(cx, cz) {
        if (!this.state.scene || typeof THREE === "undefined") return;
        if (!this.state.voxelChunkGrass) this.state.voxelChunkGrass = new Map();
        const key = `${cx},${cz}`;
        if (this.state.voxelChunkGrass.has(key)) return;
        // Als „kein Gras-Mesh" (null) registriert, damit der Lifecycle (Cull/Release/LOD) konsistent
        // bleibt; die Wiese lebt als Boden-Shading (_terrainGeologyAlbedo), es entstehen nie Halm-Dreiecke.
        if (!this.state.voxelChunkGrassLod) this.state.voxelChunkGrassLod = new Map();
        const _ce = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        this.state.voxelChunkGrass.set(key, null);
        this.state.voxelChunkGrassLod.set(key, _ce && !_ce.empty ? _ce.lod || 0 : 0);
    }

    _disposeVoxelChunkGrass(key) {
        if (this.state.voxelChunkGrassLod) this.state.voxelChunkGrassLod.delete(key);
        if (!this.state.voxelChunkGrass) return;
        this.state.voxelChunkGrass.delete(key);
    }

    // DIE NAH-WIESE: je Kachel (NAH_WIESE.kachel) die Büschel nach dem Studio-Gesetz (buildForest, Schritt 7):
    // Raster `understory.grassStep` in Welt-Koordinaten, Jitter ±0,34, Wurf gegen
    // groundCover.grass = clamp(clamp(L·1,08 − rk·0,85 + m·0,22)·1,12) mit den Welt-Feldern (Kronen-Licht,
    // Feuchte, Hang wie der Strauch-Teppich, Pfad dünnt) × dem Grün-Kanal der Boden-Karte (Büschel nur, wo
    // die Boden-Funktion Wiese zeichnet). Skala Studio: (0,7 + w·0,7) · (m > 0,8 ? 1,45 : 1), zwei Vorlagen.
    // Fuß, Hang und Grün auf dem GERENDERTEN Boden (der EINE Leser `_bodenSichtAt`, am Chunk-Rand die Karte des
    // Nachbarn). Die Würfe hängen nur an der Zelle (Γ5) — dieselbe Wiese bei jedem Besuch. Gibt die Büschel-Liste
    // zurück oder null, solange ein Chunk, den die Kachel liest (`_bodenSichtChunks`), noch keine Boden-Karte hat.
    _nahWieseKachelBueschel(tx, tz) {
        const NW = AnazhRealm.NAH_WIESE;
        const uCfg = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.understory;
        const step = uCfg && Number.isFinite(uCfg.grassStep) ? uCfg.grassStep : 0.72;
        const GS = AnazhRealm.GRASS_SLOPE;
        const seedInt = this._forestSeedInt();
        const x0 = tx * NW.kachel;
        const z0 = tz * NW.kachel;
        // der Jitter trägt einen Büschel 0,34 m über die Kachel hinaus
        if (!this._bodenSichtChunks(x0 - 0.34, z0 - 0.34, x0 + NW.kachel + 0.34, z0 + NW.kachel + 0.34)) return null;
        const cl = (v) => Math.max(0, Math.min(1, v));
        const boden = (px, pz) => {
            const v = this._bodenSichtAt(px, pz);
            return v === null ? NaN : v;
        };
        const grund = {};
        const out = [];
        for (let gj = Math.ceil(z0 / step); gj * step < z0 + NW.kachel; gj++) {
            for (let gi = Math.ceil(x0 / step); gi * step < x0 + NW.kachel; gi++) {
                let hs = ((gi * 73856093) ^ (gj * 19349663) ^ seedInt ^ 0x6a09e667) >>> 0 || 1;
                const w = () => {
                    hs = (hs + 0x6d2b79f5) >>> 0;
                    let t = hs;
                    t = Math.imul(t ^ (t >>> 15), t | 1);
                    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                };
                const x = gi * step + (w() - 0.5) * 0.68;
                const z = gj * step + (w() - 0.5) * 0.68;
                const wurf = w();
                const vorlage = w() < 0.5 ? 0 : 1;
                const sk = 0.7 + w() * 0.7;
                const rot = w() * Math.PI * 2;
                const ordnung = w();
                const y = this._bodenSichtAt(x, z, grund);
                if (y === null) continue;
                const gruen = grund.gruen;
                if (!(gruen > 0)) continue;
                if (y < this._koerperWasser(x, z, y) + 0.1) continue; // nie im gezeichneten Wasser (wie die Nah-Streu)
                const m = this._feuchteAt ? this._feuchteAt(x, z, y) : 0;
                const L = this._canopyLightAt(x, z, y, m);
                const hang = this._slopeAt(x, z, boden);
                const rk = cl((hang - GS.lo) / (GS.hi - GS.lo));
                const pfad = this._pfadFeldAt(x, z, y);
                // Unter einer echten Krone liegt Laub, kaum ein Halm (15 %) — dieselbe Kronen-Karte wie der Boden.
                const streu = this._kronenStreuAt(x, z);
                const p =
                    cl(cl(L * 1.08 - rk * 0.85 + m * 0.22) * 1.12) * (1 - pfad * 0.92) * (1 - streu * 0.85) * gruen;
                if (wurf >= p) continue;
                out.push({ x, y, z, s: sk * (m > 0.8 ? 1.45 : 1), rot, vorlage, ordnung });
            }
        }
        // Zufällige Ordnung: ein Präfix der Liste ist eine gleichmäßige Ausdünnung (das Rand-Band).
        out.sort((a, b) => a.ordnung - b.ordnung);
        return out;
    }

    // Eine Kachel fällt aus dem Ring (oder baut neu): sie trägt nur Daten, der Sicht-Satz legt sich neu.
    _nahWieseKachelFaellt(key) {
        const nw = this.state.nahWiese;
        if (!nw || !nw.kacheln.delete(key)) return false;
        nw.neu = true;
        return true;
    }

    // Je Takt (scatterDeco, prio 2): Kacheln im Ring um die KAMERA anlegen (nah zuerst, ≤ kachelnJeTakt Neubauten),
    // außerhalb fällt die Kachel; die Senken folgen den Studio-Vorlagen (`_nahWieseSenken`). Ein Chunk-Neubau (Edit)
    // baut die betroffenen Kacheln neu. Stufe, Rand-Band und Sicht wählt der Sicht-Satz je Büschel und Frame
    // (`_nahWieseSicht`) — eine Kachel baut nur, wenn sie den Ring betritt. Rückgabe: Zahl der Neubauten (0 = der Ring
    // steht).
    _tickNahWiese(deadline) {
        const st = this.state;
        if (!st.scene || !st.camera || typeof THREE === "undefined") return 0;
        const NW = AnazhRealm.NAH_WIESE;
        // Die Senken hängen direkt in der Szene (`_nahWieseSenken`): jede ist ihr eigener oberster Knoten, die Täter-Klasse
        // (`_taeterKlasse`) liest ihren Namen `nahWiese:L<stufe>:…` — die Band-Linse trennt die Stufen.
        if (!st.nahWiese)
            st.nahWiese = { kacheln: new Map(), senken: new Map(), vorlagen: new Map(), neu: true, offen: 0 };
        const nw = st.nahWiese;
        // DIE STAND-WACHE: stehen Auge, Chunks und Studio-Vorlagen, steht jede Kachel — kein Gang.
        if (this._standRuht("nahWiese", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M })) return 0;
        let gefallen = 0;
        const cam = st.camera.position;
        const tcx = Math.floor(cam.x / NW.kachel);
        const tcz = Math.floor(cam.z / NW.kachel);
        const reichweite = Math.ceil(NW.radius / NW.kachel) + 1;
        // Chunk-Neubau oder neues gezeichnetes Wasser → betroffene Kacheln neu (ihre Büschel standen auf dem alten Boden,
        // am alten Ufer).
        for (const [key, k] of nw.kacheln) {
            let neu = !this._wasserKennungenGleich(k.wasser);
            for (const ck of k.chunks) {
                if (neu) break;
                const e = st.voxelChunks && st.voxelChunks.get(ck);
                if (!e || e.surfMap !== k.chunkKarten.get(ck)) neu = true;
            }
            if (neu && this._nahWieseKachelFaellt(key)) gefallen++;
        }
        const wunsch = [];
        for (let dz = -reichweite; dz <= reichweite; dz++) {
            for (let dx = -reichweite; dx <= reichweite; dx++) {
                const tx = tcx + dx;
                const tz = tcz + dz;
                const d = Math.hypot((tx + 0.5) * NW.kachel - cam.x, (tz + 0.5) * NW.kachel - cam.z);
                if (d > NW.radius + NW.kachel * 0.71) continue;
                wunsch.push({ key: `${tx},${tz}`, tx, tz, d });
            }
        }
        const gewollt = new Set(wunsch.map((w) => w.key));
        for (const key of [...nw.kacheln.keys()]) if (!gewollt.has(key) && this._nahWieseKachelFaellt(key)) gefallen++;
        wunsch.sort((a, b) => a.d - b.d);
        // Buch und Render-Config docken in EINER Nachricht (wie `_nahStreuArten`): solange beide fehlen, wartet die Wiese —
        // ein Budget vor dem Buch ist kein Bruch, sondern noch nicht da. Bis Welle K las sie das Budget im ersten Takt nach
        // dem Boot und warf KERN-PFLICHT, bis das Buch kam (gate:post-kette sah es, sobald der Boot schneller zeichnete).
        if (!AnazhRealm._studioRenderConfig || !this._foundry || !this._foundry.recipes) {
            nw.offen = wunsch.length || 1;
            return 0;
        }
        nw.offen = 0;
        // Die zwei Studio-Vorlagen je Stufe (Foundry-Cache; eine Anfrage, falls noch kalt) — einmal je Takt. Der Wurf
        // ist das Studio-Budget (B2c grass[stufe].schatten): die Nah-Wiese legt ihren Satz am AUGE — ein Werfer bräuchte
        // den Satz der Kaskade, das Budget nennt für das Gras keinen (laut, falls doch). Gelesen wird es, wenn die
        // Vorlage steht: eine Vorlage gibt es erst mit dem Buch (Buch kalt → `_foundryFlattenFor` null), das Budget
        // dockt in derselben Nachricht. Befund 0710-2: die Zusicherung las VOR der Vorlage — kam das Buch nach dem Ring,
        // brach jeder Deko-Takt bis zum Buch an `phyto:lod.budget (gras)` und riss Nah-Streu und Hydro-Kacheln mit.
        for (const stufe of [1, 2]) {
            for (let v = 0; v < 2; v++) {
                const fl = this._foundryFlattenFor({ seed: v + 1 }, "gras", stufe);
                if (!(fl && Array.isArray(fl.leaves) && fl.leaves.length)) {
                    nw.offen++; // das Studio-Asset kommt noch (Buch kalt oder die Foundry-Anfrage läuft)
                    continue;
                }
                if (this._foundryBudgetZeile("gras", stufe).schatten !== false)
                    throw new Error(
                        `Nah-Wiese: gras[${stufe}] wirft — der Sicht-Satz cullt am Auge, nie für die Kaskade`
                    );
                this._nahWieseSenken(v, stufe, fl);
            }
        }
        let gebaut = 0;
        for (const w of wunsch) {
            if (nw.kacheln.has(w.key)) continue;
            if (gebaut >= NW.kachelnJeTakt || (deadline && performance.now() > deadline)) {
                nw.offen++; // das Takt-Budget ist leer
                continue;
            }
            const bueschel = this._nahWieseKachelBueschel(w.tx, w.tz);
            if (!bueschel) {
                nw.offen++;
                continue;
            }
            // die Karten und die Kennungen des gezeichneten Wassers, die die Büschel lasen (ihr Jitter reicht 0,34 m über die
            // Kachel): dasselbe Rechteck wie im Bau der Büschel
            const x0 = w.tx * NW.kachel - 0.34;
            const z0 = w.tz * NW.kachel - 0.34;
            const chunkKarten = this._bodenSichtChunks(x0, z0, x0 + NW.kachel + 0.68, z0 + NW.kachel + 0.68);
            const chunks = new Set(chunkKarten.keys());
            const wasser = this._wasserKennungen(x0, z0, x0 + NW.kachel + 0.68, z0 + NW.kachel + 0.68);
            nw.kacheln.set(
                w.key,
                Object.assign({ chunks, chunkKarten, wasser }, this._nahWieseKachelDaten(w.tx, w.tz, bueschel))
            );
            nw.neu = true;
            gebaut++;
        }
        this._standMeldet("nahWiese", 1, gebaut + gefallen > 0, nw.offen > 0);
        return gebaut;
    }

    // Die Daten einer Kachel: je Büschel die Basis-Matrix (Ort · Drehung · Skala — die Welt-Skala des Studio-Teils hängt
    // der Sicht-Satz an), die Hysterese der Stufe (`l1`) und die Kachel-Kugel ohne Büschel-Radius (grober Cull vor
    // dem Büschel-Test).
    _nahWieseKachelDaten(tx, tz, bueschel) {
        const K = AnazhRealm.NAH_WIESE.kachel;
        const n = bueschel.length;
        const basis = new Float32Array(n * 16);
        const m4 = this._tmpWieseM4 || (this._tmpWieseM4 = new THREE.Matrix4());
        const q = this._tmpWieseQ || (this._tmpWieseQ = new THREE.Quaternion());
        const pv = this._tmpWieseP || (this._tmpWieseP = new THREE.Vector3());
        const sv = this._tmpWieseS || (this._tmpWieseS = new THREE.Vector3());
        const up = this._tmpWieseUp || (this._tmpWieseUp = new THREE.Vector3(0, 1, 0));
        let y0 = Infinity,
            y1 = -Infinity,
            sMax = 0;
        for (let i = 0; i < n; i++) {
            const b = bueschel[i];
            pv.set(b.x, b.y, b.z);
            q.setFromAxisAngle(up, b.rot);
            sv.set(b.s, b.s, b.s);
            m4.compose(pv, q, sv).toArray(basis, i * 16);
            if (b.y < y0) y0 = b.y;
            if (b.y > y1) y1 = b.y;
            if (b.s > sMax) sMax = b.s;
        }
        return {
            bueschel,
            basis,
            l1: new Uint8Array(n),
            mx: (tx + 0.5) * K,
            mz: (tz + 0.5) * K,
            y0: n ? y0 : 0,
            y1: n ? y1 : 0,
            sMax,
        };
    }

    // Die Senken einer Vorlage × Stufe: je Studio-Teil EINE InstancedMesh für den ganzen Ring (`nahWiese:L<stufe>:<v>:<p>`,
    // ein oberster Knoten der Szene — die Täter-Klasse faltet den Namen auf `nahWiese:L<stufe>`, die Band-Linse nennt jede
    // Stufe beim Namen). Sie hält die Studio-Geometrie ihres Teils (`_liveRefs` der Cache-Gruppe), solange sie lebt; ein neues Studio-Asset
    // (Saison) ersetzt die Senken der Vorlage. Die Sicht-Kugel der Vorlage: Höhe der Mitte und Radius in Büschel-Skala 1
    // (die waagrechte Lage der Mitte geht in den Radius — der Büschel dreht um die Hochachse).
    _nahWieseSenken(v, stufe, fl) {
        const nw = this.state.nahWiese;
        const kopf = `${v}:L${stufe}`;
        const alt = nw.vorlagen.get(kopf);
        if (alt && alt.flat === fl) return;
        if (alt) for (const a of alt.senken) this._nahWieseSenkeFaellt(a);
        const kugel = this._tmpWieseKugel || (this._tmpWieseKugel = new THREE.Sphere());
        const senken = [];
        let cy = null,
            r = 0;
        for (let p = 0; p < fl.leaves.length; p++) {
            const lf = fl.leaves[p];
            if (!lf || !lf.geom || !lf.mat)
                throw new Error(
                    `Nah-Wiese: Vorlage ${kopf} Teil ${p} ohne Geometrie oder Stoff — kein stiller Ausfall`
                );
            const a = {
                key: `${kopf}:${p}`,
                name: `nahWiese:L${stufe}:${v}:${p}`,
                geo: lf.geom,
                mat: lf.mat,
                lokal: lf.localMatrix,
                leafKey: lf.leafKey,
                quelle: lf._srcGroup || null,
                mesh: null,
                kap: 0,
                anzahl: 0,
                wachse: 0,
            };
            if (a.quelle) a.quelle._liveRefs = (a.quelle._liveRefs || 0) + 1;
            this._senkeMesh(a, 256, this.state.scene);
            nw.senken.set(a.key, a);
            senken.push(a);
            if (!lf.geom.boundingSphere) lf.geom.computeBoundingSphere();
            kugel.copy(lf.geom.boundingSphere).applyMatrix4(lf.localMatrix);
            if (cy === null) cy = kugel.center.y;
            r = Math.max(r, kugel.radius + Math.hypot(kugel.center.x, kugel.center.z) + Math.abs(kugel.center.y - cy));
        }
        nw.vorlagen.set(kopf, { flat: fl, senken, cy: cy || 0, r });
        nw.neu = true;
    }

    // Eine Senke fällt (ihre Vorlage wurde ersetzt): die Mesh verlässt die Szene, die Studio-Referenz geht zurück — war
    // die Cache-Gruppe geräumt (LRU), fällt ihre Geometrie jetzt.
    _nahWieseSenkeFaellt(a) {
        const nw = this.state.nahWiese;
        if (a.mesh) {
            if (a.mesh.parent) a.mesh.parent.remove(a.mesh);
            this._instanzAbschied(a.mesh);
            a.mesh = null;
        }
        nw.senken.delete(a.key);
        const src = a.quelle;
        if (src) {
            src._liveRefs = Math.max(0, (src._liveRefs || 0) - 1);
            if (src._evicted && !(src._liveRefs > 0)) this._disposeFoundryGroupGeom(src);
        }
    }

    // DER SICHT-SATZ (`_passSicht`, der Haupt-Pass jedes Frames, vor der Projektion): je Büschel die Stufe (L1 im Kreis
    // `stufe1` um das Auge, Austritt erst `stufe1Rand` dahinter), das Rand-Band (seine Würfel-Ordnung gegen den Anteil
    // seiner EIGENEN Distanz — ein Präfix der zufälligen Ordnung ist eine gleichmäßige Ausdünnung) und die Sicht (die Kachel
    // als Box, das Büschel als Kugel nach dem EINEN Gesetz der Pass-Wahl `_passTrifft` in der Lage dieses Passes `L`); jede
    // Senke trägt dicht genau ihre sichtbaren Büschel. Die Büschel sind Daten der Kacheln, keine Instanzen einer Gruppe: der
    // Satz schreibt ihre Matrizen, und er rechnet nur, wenn sich der Ring (`neu`) oder die Lage des Passes ändert — ihre
    // Generation `L.gen` (`_passLageGen`, das EINE Gesetz der Lage: nie wegen des Versatzes der zeitlichen Auflösung, nie
    // wegen des atmenden Auges; den Rand dafür trägt das Gesetz).
    _nahWieseSicht(kamera, L) {
        const nw = this.state.nahWiese;
        if (!nw || !kamera || !nw.senken.size) return;
        if (!L || !L.fr || !L.fr.planes)
            throw new Error("_nahWieseSicht: ohne die Lage der Pass-Wahl (`_passWahlLage` in `_passSicht`)");
        if (!nw.neu && nw.gen === L.gen) return;
        nw.neu = false;
        nw.gen = L.gen;
        const NW = AnazhRealm.NAH_WIESE;
        const we = kamera.matrixWorld.elements;
        // Je Stufe × Vorlage die Senken samt Sicht-Kugel (fehlt eine, kommt ihr Studio-Asset noch).
        const ziel = [null, [null, null], [null, null]];
        let rMax = 0;
        for (const stufe of [1, 2])
            for (let v = 0; v < 2; v++) {
                const vl = nw.vorlagen.get(`${v}:L${stufe}`) || null;
                ziel[stufe][v] = vl;
                if (vl && vl.r + Math.abs(vl.cy) > rMax) rMax = vl.r + Math.abs(vl.cy);
            }
        for (const a of nw.senken.values()) a.anzahl = 0;
        const m4 = this._tmpWieseM4 || (this._tmpWieseM4 = new THREE.Matrix4());
        const mw = this._tmpWieseM4b || (this._tmpWieseM4b = new THREE.Matrix4());
        const ax = we[12];
        const az = we[14];
        const H = NW.kachel * 0.5;
        for (const k of nw.kacheln.values()) {
            const n = k.bueschel.length;
            if (!n || !this._passTrifft(L, k.mx, (k.y0 + k.y1) / 2, k.mz, H, (k.y1 - k.y0) / 2, H, k.sMax * rMax))
                continue;
            for (let i = 0; i < n; i++) {
                const b = k.bueschel[i];
                const d = Math.hypot(b.x - ax, b.z - az);
                if (b.ordnung >= Math.max(0, Math.min(1, (NW.radius - d) / NW.rand + 0.5))) continue;
                const l1 = k.l1[i] ? d <= NW.stufe1 + NW.stufe1Rand : d <= NW.stufe1;
                k.l1[i] = l1 ? 1 : 0;
                const vl = ziel[l1 ? 1 : 2][b.vorlage];
                if (!vl || !this._passTrifft(L, b.x, b.y + vl.cy * b.s, b.z, 0, 0, 0, vl.r * b.s)) continue;
                m4.fromArray(k.basis, i * 16);
                for (const a of vl.senken) {
                    if (a.anzahl >= a.kap) this._senkeMesh(a, Math.ceil(a.kap * 1.5), this.state.scene);
                    mw.multiplyMatrices(m4, a.lokal).toArray(a.mesh.instanceMatrix.array, a.anzahl * 16);
                    a.anzahl++;
                }
            }
        }
        for (const a of nw.senken.values()) {
            const im = a.mesh.instanceMatrix;
            im.clearUpdateRanges();
            if (a.anzahl) im.addUpdateRange(0, a.anzahl * 16);
            im.needsUpdate = true;
            AnazhRealm._instanzZahl(a.mesh, a.anzahl);
        }
    }

    // ═══ DIE NAH-STREU (Waldboden 04.10.) ═══
    // Nah am Auge wächst der Boden aus dem Pflanzen-Studio: Farn · Gestrüpp · Blume · Schilf · liegendes Totholz ·
    // Stumpf · Geröll, gesetzt nach dem EINEN Boden-Gesetz (`placement.boden`, ring "nah"; Auswerter
    // `__phytoCore.bodenGewicht` — derselbe, mit dem der Labor-Wald pflanzt) und gebaut über die Foundry
    // (`_foundryFlattenFor`: kindStages · budget.gestalten). Der Host erzeugt keine Gestalt — der Klein-Vegetations-
    // Zwilling (eigene Strip-/Kreuz-Geometrie je Art, Deko-Fernfeld, Deck-Streu) ist gefallen. Kosten an den SCHIRM
    // gebunden: ein Kachel-Ring um die Kamera (NAH_STREU), L0 im Armlängen-Kreis (`stufe0`), jenseits die leichte
    // Stufe der Art, das Rand-Band dünnt. Je Art × Gestalt × Stufe × Teil EINE Senke `streuNah:…` (die Daten des
    // Rings), eine Kachel ist ein BLOCK darin; gezeichnet wird je STOFF (W7): jeder Block ist ein Bereich im Streu-Satz
    // seines Stoffs, das Frustum jedes Passes wählt je Pflanze (`_streuSatzArt`). Jenseits des Rings trägt der Boden
    // (Boden-Farbe) und die Strauch-/Blumen-Schicht der Streu-Regionen.
    static get NAH_STREU() {
        return Object.freeze({ kachel: 4, zelle: 2, stufe0: 3.5, radius: 24, rand: 5, kachelnJeTakt: 3 });
    }

    // Was eine Boden-Art beim Pflücken gibt — Spieler-Ökonomie, keine Gestalt: je Studio-kind.
    static get STREU_ERNTE() {
        return Object.freeze({
            fern: "kraut",
            reed: "kraut",
            brush: "kraut",
            flower: "kraut",
            rock: "stein",
            deadwood: "holz",
        });
    }

    // Die Arten der Nah-Streu: die Boden-Zeilen mit ring "nah", deren Preset das LIVE-Buch trägt, nach Namen
    // sortiert (die Wurf-Reihenfolge ist Daten-Identität). null, solange Buch oder Render-Config fehlen — die Streu
    // wartet, sie rät nie.
    _nahStreuArten() {
        const cfg = AnazhRealm._studioRenderConfig;
        const buch = this._foundry ? this._foundry.recipes : null;
        if (!cfg || !buch) return null;
        // Buch und Render-Config docken in EINER Nachricht: steht beides, ist ein fehlendes Boden-Gesetz oder eine
        // Boden-Zeile ohne Rezept ein KERN-PFLICHT-Bruch (laut), nie eine still leere Nah-Streu.
        const boden = cfg.placement ? cfg.placement.boden : null;
        if (!boden) return AnazhRealm._kernPflichtBruch("phyto:placement.boden");
        const c = this._nahStreuArtenCache;
        if (c && c.boden === boden && c.buch === buch) return c.arten;
        const arten = [];
        for (const id of Object.keys(boden).sort()) {
            const zeile = boden[id];
            if (!zeile || zeile.ring !== "nah") continue;
            const rec = buch[id];
            if (!rec) return AnazhRealm._kernPflichtBruch("phyto:placement.boden." + id + " (kein Rezept im Buch)");
            // Die Weite der Art (Studio-Zeile `weite`, m): kleine Arten enden früher, keine reicht über den Ring.
            const weite = Math.min(AnazhRealm.NAH_STREU.radius, Number.isFinite(zeile.weite) ? zeile.weite : Infinity);
            arten.push({ id, zeile, kind: rec.kind, ernte: AnazhRealm.STREU_ERNTE[rec.kind] || null, weite });
        }
        this._nahStreuArtenCache = { boden, buch, arten };
        return arten;
    }

    // Das Gewicht einer Nah-Streu-Art nach dem Boden-Gesetz (`core.bodenGewicht`) über der Höhe über dem Wasser: das
    // Ufer-Band (Schilf) über beiden Bezügen — See/Meer voll, der Fluss mit seiner Kronen-Blende, das Maximum (stetig über
    // die Krone, wie Strand und Schlick in `_bodenFarbeAt`); jede andere Art über der EINEN Wahrheit am Körper (`u.ufer` =
    // Boden − `_koerperWasser`). `uf` = `_waterLevelAt(x, z, aus)`, `y` der Boden.
    _nahStreuBodenGewicht(core, zeile, u, uf, y) {
        if (!zeile.ufer) return core.bodenGewicht(zeile, u);
        let w = core.bodenGewicht(zeile, Object.assign({}, u, { ufer: y - uf.see }));
        if (uf.fluss !== null && uf.ufer > 0)
            w = Math.max(w, uf.ufer * core.bodenGewicht(zeile, Object.assign({}, u, { ufer: y - uf.fluss })));
        return w;
    }

    // Die Pflanzen einer Kachel nach dem Boden-Gesetz: je Zelle (NAH_STREU.zelle) EINE Umwelt-Messung (Kronen-Licht
    // · Feuchte · Höhe über dem Wasser · Steinigkeit · Hang, die Welt-Leser), je Art λ = dichte · Zellfläche ·
    // Gewicht · Last-Dichte (`_effectiveFoliageDensity`), n = ⌊λ + Wurf⌋. Der Wurf-Strom je (Zelle, Art) hängt nur
    // an der Zelle (Γ5): dieselbe Streu bei jedem Besuch, und eine dünnere Last ist ein Präfix der vollen (die
    // Ernte-Identität `gi|gj|art|i` bleibt). Fuß und Hang auf dem GERENDERTEN Boden (der EINE Leser `_bodenSichtAt`, am
    // Chunk-Rand die Karte des Nachbarn), Pfade bleiben frei, kein Haus trägt Streu (`_naturSetzen`), nur Arten mit Ufer-Band
    // stehen im Wasser — im GEZEICHNETEN (`_koerperWasser`). Rückgabe { items, chunks, wasser } (`chunks`: die Karten, die
    // die Kachel las, `_bodenSichtChunks`; `wasser`: die Kennungen des gezeichneten Wassers, `_wasserKennungen`) oder null,
    // solange einer dieser Chunks noch keine Boden-Karte hat.
    _nahStreuKachel(tx, tz, arten) {
        const NS = AnazhRealm.NAH_STREU;
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        if (!core || typeof core.bodenGewicht !== "function")
            throw new Error("_nahStreuKachel: das Boden-Gesetz (__phytoCore.bodenGewicht) fehlt");
        // Die Nah-Streu ist ein Wurf des Feldes: trägt die Wildnis die Kachel nicht, bleibt sie leer (und liest kein Wasser).
        if (!this._wildnisTraegt((tx + 0.5) * NS.kachel, (tz + 0.5) * NS.kachel))
            return { items: [], chunks: new Map(), wasser: [] };
        const seedInt = this._forestSeedInt();
        const last = this._effectiveFoliageDensity();
        const Z = NS.zelle;
        const n = Math.round(NS.kachel / Z);
        const K = NS.kachel;
        // jede Pflanze steht in der Kachel (Zell-Mitte ± halbe Zelle): ihr Boden sind die Karten dieses Rechtecks
        const chunks = this._bodenSichtChunks(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K);
        if (!chunks) return null; // der Boden steht noch nicht — die Kachel wartet
        const boden = (px, pz) => {
            const v = this._bodenSichtAt(px, pz);
            return v === null ? NaN : v;
        };
        const items = [];
        for (let gj = tz * n; gj < tz * n + n; gj++) {
            for (let gi = tx * n; gi < tx * n + n; gi++) {
                const x = (gi + 0.5) * Z;
                const z = (gj + 0.5) * Z;
                const y = this._bodenSichtAt(x, z);
                if (y === null) continue;
                if (this._pfadFeldAt(x, z, y) > 0.5) continue; // Ufer-Pfad und Siedlungs-Weg bleiben frei (Labor: trailAt < 3 m)
                const feucht = this._feuchteAt(x, z, y);
                const feld = this.worldFieldAt(x, z);
                // Die Höhe über dem Wasser: für das Ufer-Band (Schilf) über beiden Bezügen (`_waterLevelAt` → see · fluss ·
                // ufer, wie Strand und Schlick in `_bodenFarbeAt`: das Band über See/Meer und das über dem Fluss mit seiner
                // Kronen-Blende, das Maximum — stetig über die Krone), für jede andere Art über der EINEN Wahrheit am Körper
                // (`_koerperWasser`: nie im Wasser). Bis zur Gegenprüfung las die Streu das Maximum der Spiegel — an der
                // Krone sprang der Bezug auf den Meeresspiegel (der Kronen-Sprung, den 463c4fda in der Boden-Farbe heilte).
                const uf = { see: 0, fluss: null, ufer: 0 };
                this._waterLevelAt(x, z, uf);
                const u = {
                    licht: this._canopyLightAt(x, z, y, feucht),
                    feucht,
                    ufer: y - this._koerperWasser(x, z, y),
                    fels: feld ? feld.dichte : null,
                    hang: this._slopeAt(x, z, boden),
                };
                for (let a = 0; a < arten.length; a++) {
                    const A = arten[a];
                    const gw = this._nahStreuBodenGewicht(core, A.zeile, u, uf, y);
                    const lam = A.zeile.dichte * Z * Z * 0.01 * gw * last;
                    if (!(lam > 0)) continue;
                    let hs =
                        ((gi * 73856093) ^ (gj * 19349663) ^ ((a + 1) * 0x85ebca6b) ^ seedInt ^ 0x5eedb0de) >>> 0 || 1;
                    const w = () => {
                        hs = (hs + 0x6d2b79f5) >>> 0;
                        let t = hs;
                        t = Math.imul(t ^ (t >>> 15), t | 1);
                        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                    };
                    const anzahl = Math.floor(lam + w());
                    for (let i = 0; i < anzahl; i++) {
                        const px = x + (w() - 0.5) * Z;
                        const pz = z + (w() - 0.5) * Z;
                        const s = A.zeile.skala[0] + w() * (A.zeile.skala[1] - A.zeile.skala[0]);
                        const rot = w() * Math.PI * 2;
                        const same = (w() * 4294967296) >>> 0;
                        const ordnung = w();
                        const py = this._bodenSichtAt(px, pz);
                        if (py === null) continue;
                        if (!A.zeile.ufer && py < this._koerperWasser(px, pz, py) + 0.1) continue;
                        const it = { art: a, id: `${gi}|${gj}|${a}|${i}`, x: px, y: py, z: pz, rot, s, same, ordnung };
                        this._naturSetzen(null, it, null, () => items.push(it)); // die EINE Natur-Wand: nie im Haus
                    }
                }
            }
        }
        return { items, chunks, wasser: this._wasserKennungen(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K) };
    }

    // Die Senke einer (Art, Gestalt, Stufe, Teil): die DATEN des ganzen Rings — je Kachel ein Block (Matrizen = Ort ·
    // Drehung · Skala · Welt-Skala des Teils, die Tint-Farben, die Ernte-Identitäten). Sie zeichnet nie selbst: jeder Block
    // ist ein BEREICH im Satz ihres Stoffs (`_streuSatzArt`) — die Draw-Einheit der Nah-Streu ist ihr Stoff, nie ihre
    // Gestalt. Sie hält die Studio-Geometrie ihres Teils (`_liveRefs` der Cache-Gruppe), solange sie lebt — eine
    // LRU-Räumung zerstört sie nie (ein eintretender Block rechnet sich aus ihr). `wiegt`: die Art trägt weiches Gewebe —
    // jeder ihrer Teile zeichnet mit dem wiegenden Studio-Stoff (derselbe Bauer `_foundryTreeMaterial`; die Höhe über der
    // Wurzel in Metern reist im Satz als `aWiege`, `_satzBlock`).
    _streuNahSenke(art, v, stufe, p, lf, wiegt) {
        const ns = this.state.nahStreu;
        const key = `${art.id}:${v}:L${stufe}:${p}`;
        let a = ns.senken.get(key);
        if (a) return a;
        const u = lf.mat.userData || {};
        a = {
            key,
            name: "streuNah:" + key,
            preset: art.id,
            ernte: art.ernte,
            geo: lf.geom,
            mat: wiegt ? this._foundryTreeMaterial(u.foundryKind, u.foundryMp, true) : lf.mat,
            lokal: lf.localMatrix,
            wiegt: !!wiegt,
            leafKey: lf.leafKey,
            tint: u.useInstanceTint === true,
            quelle: lf._srcGroup || null,
            anzahl: 0,
            bloecke: new Map(),
            satz: null,
        };
        a.satz = this._streuSatzArt(a);
        if (a.quelle) a.quelle._liveRefs = (a.quelle._liveRefs || 0) + 1;
        ns.senken.set(key, a);
        return a;
    }

    // DER STREU-SATZ (W7): je Stoff der Nah-Streu EIN Satz (`streuSatz|<Stoff>`, die Pool-Mechanik des Chunk-Satzes), sein
    // Bereich ist der Block einer Kachel in einer Senke (`_streuNahSatz`), je Pflanze eine Zelle. Befund (echte GPU,
    // Mess-Wiese −900/−850, `werkbank band`): je Art × Gestalt × Stufe × Teil zeichnete eine InstancedMesh den ganzen Ring —
    // 15 Befehle und 46k Dreiecke im Hauptbild, auch hinter dem Blick (Haushalt 9 / 40k); der wiegende Stoff war je
    // Studio-Skala ein eigener (Blüte 0,27 und Farn-Wedel 1,0: zwei Stoffe gleicher Regler). Jetzt zeichnet je Stoff EIN
    // Befehl, und das Frustum jedes Passes wählt je Pflanze (`_chunkSatzPass`, der EINE Haken). Der wiegende Stoff trägt
    // keine Dither-Stempel (die Nah-Streu blendet nie, ihr Stufen-Wechsel ist die Armlänge): Position · Normale · Farbe ·
    // `aWiege`; ein stehender Stoff ist der Studio-Stoff (`lf.mat`) mit den Stempeln des Bau-Satzes. Fail-closed: ein Stoff,
    // der eine Karte liest (uv — der Blatt-Atlas), hat im Satz keine Quelle. DER WURF (1310-11): der stehende Stoff (Holz und
    // Stein — Geröll · Totstamm · Stumpf) wirft in die Kaskaden, der wiegende nie (Gras, Blüte, Farn bleiben schattenlos).
    _streuSatzArt(a) {
        const mat = a.mat;
        const u = mat.userData || {};
        if (mat.map || u.foundryKind === "foliageTex" || u.foundryKind === "schatten" || u.impostorBillboard === true)
            throw new Error(
                `_streuSatzArt(${a.name}): der Stoff liest eine Karte (uv) — der Streu-Satz trägt sie nicht`
            );
        const art = "streuSatz|" + mat.uuid;
        const st = this.state;
        if (!st.satzStoffe) st.satzStoffe = new Map();
        if (!st.satzStoffe.has(art))
            st.satzStoffe.set(art, {
                name: "streuSatz",
                mat,
                wurf: !a.wiegt,
                attr: a.wiegt ? AnazhRealm.STREU_SATZ_ATTR : AnazhRealm.BAU_SATZ_ATTR,
                kapazitaet: "streu",
                userData: { streuSatz: "streuSatz" },
            });
        return art;
    }

    // DIE SENKE der Nah-Wiese (neu oder gewachsen): je Vorlage × Stufe × Teil EINE InstancedMesh über der geteilten
    // Studio-Geometrie für den ganzen Ring. Sie wirft nicht (Budget schatten false) und cullt selbst (der Sicht-Satz legt je
    // Büschel und Pass ihre Instanzen, `_nahWieseSicht`); der Inhalt bis zur Anzahl reist mit, die alte verlässt Graph und
    // GPU (`_instanzAbschied`). `eltern` = der Knoten der Senke.
    _senkeMesh(a, kap, eltern) {
        if (!eltern) throw new Error(`_senkeMesh(${a.name}): kein Eltern-Knoten`);
        const alt = a.mesh;
        const m = AnazhRealm._instanzMesh(a.geo, a.mat, kap);
        m.name = a.name;
        m.castShadow = false;
        m.receiveShadow = true;
        m.frustumCulled = false;
        m.userData.leafKey = a.leafKey; // die Studio-Identität (Foundry-Leaf) für Inventur und Linsen
        if (alt) {
            m.instanceMatrix.array.set(alt.instanceMatrix.array.subarray(0, a.anzahl * 16));
            if (alt.parent) alt.parent.remove(alt);
            this._instanzAbschied(alt);
            a.wachse++;
        }
        AnazhRealm._instanzZahl(m, a.anzahl);
        a.mesh = m;
        a.kap = kap;
        eltern.add(m);
    }

    // Ein Kachel-Block tritt ein (Matrizen n×16, Farben n×3 bei Tint-Senken, die Ernte-Identität je Pflanze): die Senke
    // merkt ihn, der Satz ihres Stoffs trägt ihn als Bereich.
    _streuNahEin(a, kachelKey, matrizen, farben, ids) {
        if (a.bloecke.has(kachelKey)) this._streuNahAus(a, kachelKey);
        const n = matrizen.length / 16;
        if (a.tint && (!farben || farben.length !== n * 3))
            throw new Error(`_streuNahEin(${a.name}, ${kachelKey}): die Tint-Senke braucht n×3 Farben`);
        if (!ids || ids.length !== n)
            throw new Error(`_streuNahEin(${a.name}, ${kachelKey}): je Pflanze eine Ernte-Identität`);
        const b = { n, ids, matrizen, farben: a.tint ? farben : null };
        a.bloecke.set(kachelKey, b);
        a.anzahl += n;
        this._streuNahSatz(a, kachelKey, b);
    }

    // Ein Kachel-Block tritt aus: die Senke vergisst ihn, sein Bereich verlässt den Satz.
    _streuNahAus(a, kachelKey) {
        const b = a ? a.bloecke.get(kachelKey) : null;
        if (!b) return false;
        a.bloecke.delete(kachelKey);
        a.anzahl -= b.n;
        this._streuNahSatz(a, kachelKey, null);
        return true;
    }

    // Der Bereich eines Blocks im Satz seines Stoffs (Schlüssel `<Senke>@<Kachel>`): seine Pflanzen in Welt-Lage
    // (`_satzBlock`), je Pflanze eine Zelle; ein leerer Block verlässt den Satz.
    _streuNahSatz(a, kachelKey, b) {
        const key = a.key + "@" + kachelKey;
        if (!b || b.n === 0) {
            this._chunkSatzAus(a.satz, key);
            return;
        }
        const span = this._voxelChunkConfig().span;
        const attr = this.state.satzStoffe.get(a.satz).attr;
        this._chunkSatzEin(
            a.satz,
            key,
            this._satzBlock(a.geo, b.matrizen, b.farben, b.n, attr, a.name + "@" + kachelKey),
            Math.floor(b.matrizen[12] / span) + "," + Math.floor(b.matrizen[14] / span)
        );
    }

    // Die Ernte: n Pflanzen ab Block-Index i treten aus dem Block der Kachel aus — der Block schrumpft, sein Bereich legt
    // sich neu (eine geerntete Pflanze zeichnet nie). Der Kachel-Austritt (der ganze Block) geht über `_streuNahAus`.
    _streuNahLuecke(a, kachelKey, i, n) {
        const b = a.bloecke.get(kachelKey);
        const rest = b.n - n;
        const m = new Float32Array(rest * 16);
        m.set(b.matrizen.subarray(0, i * 16));
        m.set(b.matrizen.subarray((i + n) * 16), i * 16);
        b.matrizen = m;
        if (b.farben) {
            const f = new Float32Array(rest * 3);
            f.set(b.farben.subarray(0, i * 3));
            f.set(b.farben.subarray((i + n) * 3), i * 3);
            b.farben = f;
        }
        b.ids.splice(i, n);
        b.n = rest;
        a.anzahl -= n;
        this._streuNahSatz(a, kachelKey, b);
    }

    // Der Block einer Kachel in einer Senke (Ernte, Sonden): {satz, bereich, n, ids} oder null.
    _streuNahBereich(senkeKey, kachelKey) {
        const ns = this.state.nahStreu;
        const a = ns ? ns.senken.get(senkeKey) : null;
        const b = a ? a.bloecke.get(kachelKey) : null;
        return b ? { satz: a.satz, bereich: a.key + "@" + kachelKey, n: b.n, ids: b.ids } : null;
    }

    // Eine Kachel verlässt den Ring (oder baut neu): ihre Blöcke treten aus allen Senken aus.
    _nahStreuKachelEntsorgen(k) {
        const ns = this.state.nahStreu;
        for (const sk of k.senken) this._streuNahAus(ns.senken.get(sk), k.key);
        k.senken.clear();
        k.zustand = null;
    }

    // Je Takt (scatterDeco, prio 2): Kacheln im Ring um die KAMERA anlegen (nah zuerst, ≤ kachelnJeTakt Neubauten),
    // die Stufe je PFLANZE aus ihrer Distanz zur Kamera (die Armlänge `stufe0` trägt L0, sonst die leichteste
    // deklarierte Stufe — `_foundryDeclaredStage`, mit Hysterese, `_nahStreuArmlaenge`), das Rand-Band dünnt über die
    // Würfel-Ordnung (Viertel-Stufen), außerhalb
    // fällt die Kachel. Ein Chunk-Neubau (Edit) baut die betroffenen Kacheln neu, eine Ernte nimmt aus, das
    // Nachwachsen baut neu. Wartet eine Art auf ihr Studio-Asset, wartet die Kachel (die Anfrage läuft nah zuerst).
    // Rückgabe: Zahl der Neubauten (0 = der Ring steht).
    _tickNahStreu(deadline) {
        const st = this.state;
        if (!st.scene || !st.camera || typeof THREE === "undefined") return 0;
        const arten = this._nahStreuArten();
        if (!arten) return 0;
        const NS = AnazhRealm.NAH_STREU;
        if (!st.nahStreu) st.nahStreu = { kacheln: new Map(), senken: new Map(), offen: 0 };
        const ns = st.nahStreu;
        // DIE STAND-WACHE: stehen Auge, Chunks, Ernte und Buch, steht jede Kachel in ihrem Zustand — kein Gang.
        if (this._standRuht("nahStreu", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M })) return 0;
        let gefallen = 0;
        const cam = st.camera.position;
        const tcx = Math.floor(cam.x / NS.kachel);
        const tcz = Math.floor(cam.z / NS.kachel);
        const reichweite = Math.ceil(NS.radius / NS.kachel) + 1;
        // Chunk-Neubau oder neues gezeichnetes Wasser → die betroffenen Kacheln neu (ihre Pflanzen standen auf dem alten
        // Boden, am alten Ufer).
        for (const [key, k] of ns.kacheln) {
            if (!k.chunks) continue;
            let neu = !this._wasserKennungenGleich(k.wasser);
            for (const [ck, karte] of k.chunks) {
                if (neu) break;
                const e = st.voxelChunks && st.voxelChunks.get(ck);
                if (!e || e.surfMap !== karte) neu = true;
            }
            if (neu) {
                this._nahStreuKachelEntsorgen(k);
                ns.kacheln.delete(key);
                gefallen++;
            }
        }
        const wunsch = [];
        for (let dz = -reichweite; dz <= reichweite; dz++) {
            for (let dx = -reichweite; dx <= reichweite; dx++) {
                const tx = tcx + dx;
                const tz = tcz + dz;
                const d = Math.hypot((tx + 0.5) * NS.kachel - cam.x, (tz + 0.5) * NS.kachel - cam.z);
                if (d > NS.radius + NS.kachel * 0.71) continue;
                // die kürzeste Distanz Kamera → Kachel-Rechteck: reicht der Armlängen-Kreis hinein?
                const ex = Math.max(tx * NS.kachel - cam.x, 0, cam.x - (tx + 1) * NS.kachel);
                const ez = Math.max(tz * NS.kachel - cam.z, 0, cam.z - (tz + 1) * NS.kachel);
                wunsch.push({ key: `${tx},${tz}`, tx, tz, d, imKreis: Math.hypot(ex, ez) <= NS.stufe0 + 1 });
            }
        }
        const gewollt = new Set(wunsch.map((w) => w.key));
        for (const [key, k] of ns.kacheln) {
            if (gewollt.has(key)) continue;
            this._nahStreuKachelEntsorgen(k);
            ns.kacheln.delete(key);
            gefallen++;
        }
        wunsch.sort((a, b) => a.d - b.d);
        const geerntet = st.scatterHarvested;
        let gebaut = 0;
        ns.offen = 0;
        for (const w of wunsch) {
            let k = ns.kacheln.get(w.key);
            // Je Art ihr Rand-Band vor ihrer Weite (Viertel-Stufen der Würfel-Ordnung): kleine Arten dünnen früher aus.
            const anteile = arten.map(
                (A) => Math.ceil(Math.max(0, Math.min(1, (A.weite - w.d) / NS.rand + 0.5)) * 4) / 4
            );
            const rand = anteile.join(",");
            if (k && k.zustand === this._nahStreuArmlaenge(k, cam, w.imKreis) + "|" + rand) continue;
            if (gebaut >= NS.kachelnJeTakt || (deadline && performance.now() > deadline)) {
                ns.offen++;
                continue;
            }
            if (!k) {
                const satz = this._nahStreuKachel(w.tx, w.tz, arten);
                if (!satz) {
                    ns.offen++;
                    continue;
                }
                k = {
                    key: w.key,
                    items: satz.items,
                    chunks: satz.chunks,
                    wasser: satz.wasser,
                    senken: new Set(),
                    zustand: null,
                    nahZahl: 0,
                };
                ns.kacheln.set(w.key, k);
            }
            const zustand = this._nahStreuArmlaenge(k, cam, w.imKreis) + "|" + rand;
            // Je (Art, Gestalt, Stufe) die Studio-Teile — fehlt eines (Anfrage läuft), wartet die ganze Kachel; jede
            // fehlende Gruppe fragt im selben Lauf an (die Anfragen reisen parallel, nah zuerst).
            const gruppen = new Map();
            const fehlend = new Set();
            const ernte = geerntet ? geerntet.get(w.key) : null;
            let bereit = true;
            for (const it of k.items) {
                if (it.ordnung >= anteile[it.art]) continue;
                if (ernte && ernte.has(it.id)) continue;
                const art = arten[it.art];
                const v = this._foundryVariantFor(it.same, art.id);
                const stufe = this._foundryDeclaredStage(art.id, it.nah ? 0 : 2);
                const gk = `${it.art}:${v}:${stufe}`;
                if (fehlend.has(gk)) continue;
                let g = gruppen.get(gk);
                if (!g) {
                    // Der Ort reist mit: die Foundry-Schlange bedient nah zuerst (`_foundryAuftrag`).
                    const ort = { seed: it.same, position: { x: it.x, y: it.y, z: it.z } };
                    const flat = v == null ? null : this._foundryFlattenFor(ort, art.id, stufe);
                    if (flat === false) {
                        this._nahStreuKaputt(art.id, stufe); // das Studio kann die Stufe nicht: laut, benannt
                        fehlend.add(gk);
                        continue;
                    }
                    if (!flat || !Array.isArray(flat.leaves) || !flat.leaves.length) {
                        bereit = false;
                        fehlend.add(gk);
                        continue;
                    }
                    g = { art, v, stufe, flat, liste: [] };
                    gruppen.set(gk, g);
                }
                g.liste.push(it);
            }
            if (!bereit) {
                ns.offen++;
                continue;
            }
            this._nahStreuKachelEntsorgen(k);
            this._nahStreuBloecke(k, gruppen);
            k.zustand = zustand;
            gebaut++;
        }
        this._standMeldet("nahStreu", 1, gebaut + gefallen > 0, ns.offen > 0);
        return gebaut;
    }

    // DIE ARMLÄNGE JE PFLANZE (Integration 05.10.): L0 trägt jede Pflanze im Kreis `stufe0` um die Kamera (Eintritt
    // ≤ stufe0, Austritt > stufe0 + 0,75 m, horizontal), gleich in welcher Kachel sie steht. Bis 05.10. entschied die
    // Kachel-MITTE (4-m-Kachel, L0 erst ab ≤ 2,5 m Mitten-Distanz): die Nachbar-Kachel zeigte ihren Farn auf 0,1 m als
    // L1-Band (Prüfer Waldboden, Befund 5). Setzt `it.nah` und gibt die Signatur der L0-Pflanzen zurück — ändert sie
    // sich, baut die Kachel neu (der Zustand der Kachel trägt sie). Eine Kachel jenseits des Kreises ohne L0 kostet nichts.
    _nahStreuArmlaenge(k, cam, imKreis) {
        if (!imKreis && !k.nahZahl) return "";
        const NS = AnazhRealm.NAH_STREU;
        let sig = "";
        let n = 0;
        for (let i = 0; i < k.items.length; i++) {
            const it = k.items[i];
            const d = imKreis ? Math.hypot(it.x - cam.x, it.z - cam.z) : Infinity;
            it.nah = it.nah ? d <= NS.stufe0 + 0.75 : d <= NS.stufe0;
            if (it.nah) {
                sig += i + ",";
                n++;
            }
        }
        k.nahZahl = n;
        return sig;
    }

    // Eine Art, deren Stufe das Studio nicht bauen kann (leere Antwort), fehlt im Bild — LAUT: einmal je (Art, Stufe)
    // ein ERROR mit Namen und der Zähler `nahStreu.kaputt`, den die Wand liest; die übrigen Arten bauen weiter.
    _nahStreuKaputt(preset, stufe) {
        const ns = this.state.nahStreu;
        if (!ns.kaputt) ns.kaputt = new Set();
        const k = preset + ":L" + stufe;
        if (ns.kaputt.has(k)) return;
        ns.kaputt.add(k);
        this.log(`Nah-Streu: das Studio liefert ${k} leer — die Art fehlt im Bild`, "ERROR");
    }

    // Die Blöcke einer Kachel: je Gruppe × Studio-Teil EIN Block in seiner Senke (Matrix = Ort · Drehung · Skala ·
    // Welt-Skala des Teils), ein neutral-naher Tint je Instanz (±8 % Luminanz, ±3 % warm/kühl — aus einem eigenen
    // Hash-Strom, nie aus den Platzierungs-Würfen).
    _nahStreuBloecke(k, gruppen) {
        const m4 = this._tmpStreuM4 || (this._tmpStreuM4 = new THREE.Matrix4());
        const q = this._tmpStreuQ || (this._tmpStreuQ = new THREE.Quaternion());
        const pv = this._tmpStreuP || (this._tmpStreuP = new THREE.Vector3());
        const sv = this._tmpStreuS || (this._tmpStreuS = new THREE.Vector3());
        const up = this._tmpStreuUp || (this._tmpStreuUp = new THREE.Vector3(0, 1, 0));
        const tint = (same, achse) => {
            let h = Math.imul(same ^ ((achse + 1) * 0x9e3779b9), 0x85ebca6b) >>> 0;
            h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
            return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
        };
        // Weiches Gewebe (Laub · Blatt-Karte · Stiel — die Studio-Stoffe, die im Labor wiegen) macht die ganze Art
        // wiegend; Holz und Stein (Totstamm · Stumpf · Geröll) stehen.
        const weich = (lf) => {
            const k = lf && lf.mat && lf.mat.userData ? lf.mat.userData.foundryKind : null;
            return k === "foliage" || k === "foliageTex" || k === "stem";
        };
        for (const g of gruppen.values()) {
            const n = g.liste.length;
            const wiegt = g.flat.leaves.some(weich);
            for (let p = 0; p < g.flat.leaves.length; p++) {
                const lf = g.flat.leaves[p];
                if (!lf || !lf.geom || !lf.mat || lf.shadowTwin) continue;
                const a = this._streuNahSenke(g.art, g.v, g.stufe, p, lf, wiegt);
                const matrizen = new Float32Array(n * 16);
                const farben = a.tint ? new Float32Array(n * 3) : null;
                const ids = new Array(n);
                for (let i = 0; i < n; i++) {
                    const it = g.liste[i];
                    pv.set(it.x, it.y, it.z);
                    q.setFromAxisAngle(up, it.rot);
                    sv.set(it.s, it.s, it.s);
                    m4.compose(pv, q, sv).multiply(a.lokal);
                    m4.toArray(matrizen, i * 16);
                    ids[i] = it.id;
                    if (farben) {
                        const l = 0.92 + tint(it.same, 0) * 0.16;
                        const wk = (tint(it.same, 1) - 0.5) * 0.06;
                        farben[i * 3] = Math.min(1.08, l + wk);
                        farben[i * 3 + 1] = l;
                        farben[i * 3 + 2] = Math.min(1.08, Math.max(0, l - wk));
                    }
                }
                this._streuNahEin(a, k.key, matrizen, farben, ids);
                k.senken.add(a.key);
            }
        }
    }

    // Gras deferred (~34 ms/Chunk, der dominante Rebuild-Posten) → kein Aufschlag auf den Streaming-/Spawn-
    // Drain-Frame.
    _enqueueGrass(cx, cz) {
        if (!this.state.pendingGrass) this.state.pendingGrass = new Set();
        this.state.pendingGrass.add(`${cx},${cz}`);
    }

    // Per-Frame-Tick: baut ≤maxPerFrame Gras-Chunks, NAHE zuerst; ferne (Ring
    // > 2, der V16.1-Gras-Ring) aus der Queue werfen. maxPerFrame=1 (Default),
    // weil EIN Gras-Build ~34 ms kostet — nie zwei in einem Frame.
    _tickPendingGrass(maxPerFrame = 1) {
        const queue = this.state.pendingGrass;
        if (!queue || queue.size === 0) return 0;
        const lpc = this.state.lastPlayerVoxelChunk;
        // Gras nur im Band 0 der EINEN Kaskade (`DETAIL_CASCADE[0].maxRing`) — jenseits tragen Impostor-
        // Deko + Boden + Fog, Halme dort sind sub-pixel. Kein eigener Ring (Gesetz #0).
        const GRASS_RING = AnazhRealm.DETAIL_CASCADE[0].maxRing;
        let keys = [...queue];
        if (lpc) {
            const distOf = (k) => {
                const ci = k.indexOf(",");
                const kx = parseInt(k.slice(0, ci), 10);
                const kz = parseInt(k.slice(ci + 1), 10);
                return Math.max(Math.abs(kx - lpc.cx), Math.abs(kz - lpc.cz));
            };
            for (const k of keys) if (distOf(k) > GRASS_RING) queue.delete(k);
            keys = [...queue].sort((a, b) => distOf(a) - distOf(b));
        }
        let built = 0;
        for (const key of keys) {
            if (built >= maxPerFrame) break;
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            if (this.state.voxelChunkGrass && this.state.voxelChunkGrass.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkGrass(cx, cz);
            built++;
        }
        return built;
    }

    // ===== FORAGING: die Nah-Streu ist pflückbar =====
    // Kein Parallel-System: der PICK prüft die Pflanzen der Senken (die Daten, die der Satz zeichnet: je Block die
    // Matrizen — die Sonde trägt Geometrie und Stoff der Senke, die Pflanze ihre Matrix) und nennt die Ernte-Identität
    // `gi|gj|art|i` der nächsten getroffenen Pflanze, die ERNTE nimmt die Pflanze in allen Teilen aus ihren Blöcken und merkt
    // sie in `state.scatterHarvested` (Kachel → Identität → Zeit; der Kachel-Bau lässt sie weg), der REGROW-Tick lässt sie
    // nach FORAGE.regrowMs nachwachsen (die Kachel baut neu).
    _pickScatterAtCrosshair() {
        const ns = this.state.nahStreu;
        if (!ns || ns.senken.size === 0) return null;
        const F = this._fadenkreuzStrahl();
        if (!F) return null;
        if (!this._tmpRaycaster) this._tmpRaycaster = new THREE.Raycaster();
        const rc = this._tmpRaycaster;
        rc.set(F.o, F.d);
        rc.far = AnazhRealm.FORAGE.reach;
        const P =
            this._streuPick || (this._streuPick = { mesh: new THREE.Mesh(), kugel: new THREE.Sphere(), hits: [] });
        let best = null;
        for (const a of ns.senken.values()) {
            if (a.anzahl === 0 || !a.ernte) continue;
            if (!a.geo.boundingSphere) a.geo.computeBoundingSphere();
            P.mesh.geometry = a.geo;
            P.mesh.material = a.mat;
            for (const [key, b] of a.bloecke)
                for (let i = 0; i < b.n; i++) {
                    P.mesh.matrixWorld.fromArray(b.matrizen, i * 16);
                    P.kugel.copy(a.geo.boundingSphere).applyMatrix4(P.mesh.matrixWorld);
                    if (!rc.ray.intersectsSphere(P.kugel)) continue;
                    P.hits.length = 0;
                    P.mesh.raycast(rc, P.hits);
                    for (const h of P.hits)
                        if ((!best || h.distance < best.d) && this._durchsichtSteht(h))
                            best = { d: h.distance, key, senke: a.key, name: a.preset, id: b.ids[i], point: h.point };
                }
        }
        P.mesh.geometry = null;
        P.mesh.material = null;
        if (!best) return null;
        return { key: best.key, senke: best.senke, name: best.name, id: best.id, point: best.point };
    }

    _harvestScatterPick(pick) {
        if (!pick) return false;
        const ns = this.state.nahStreu;
        const a = ns ? ns.senken.get(pick.senke) : null;
        if (!a || !a.ernte) return false;
        const kachel = ns.kacheln.get(pick.key);
        if (!kachel || !kachel.items.some((it) => it.id === pick.id)) return false;
        // Session-Gedächtnis: Kachel → Identität → Ernte-Zeit (der Kachel-Bau + der Regrow-Tick lesen es). NICHT
        // persistiert (Flora wächst nach).
        if (!this.state.scatterHarvested) this.state.scatterHarvested = new Map();
        let jeKachel = this.state.scatterHarvested.get(pick.key);
        if (jeKachel && jeKachel.has(pick.id)) return false; // schon gepflückt (Doppel-Klick-Race)
        this._weltRegt(); // die Ernte ändert die Kachel: die Nah-Streu baut sie neu (der Weckruf vor jedem Schreiben)
        if (!jeKachel) {
            jeKachel = new Map();
            this.state.scatterHarvested.set(pick.key, jeKachel);
        }
        jeKachel.set(pick.id, performance.now());
        // Die Pflanze verschwindet SOFORT in jedem ihrer Teile (Stiel + Blüte, Rute + Laub): sie tritt aus dem Block
        // ihrer Kachel in jeder Senke aus, der Bereich im Satz legt sich neu (`_streuNahLuecke`).
        for (const sk of kachel.senken) {
            const s = ns.senken.get(sk);
            const b = s ? s.bloecke.get(pick.key) : null;
            const i = b ? b.ids.indexOf(pick.id) : -1;
            if (i < 0) continue;
            this._streuNahLuecke(s, pick.key, i, 1);
        }
        const got = this.addMaterialToInventory(a.ernte, 1);
        this.log(
            got ? `Gepflückt: ${a.preset} → 1× ${a.ernte}` : `Gepflückt: ${a.preset} — aber das Inventar ist voll`,
            "INFO"
        );
        // Die Tat prägt (V17.30-Substrat — sanft, wie das Sammeln).
        if (typeof this._feelAction === "function") this._feelAction("harvest");
        return true;
    }

    // Der Regrow-Tick (~0.1 Hz): abgelaufene Ernten fallen aus dem Gedächtnis, die Kachel baut neu (ihr Zustand
    // fällt, der Nah-Streu-Takt baut sie im nächsten Lauf) → die Flora steht wieder.
    _tickScatterRegrow(now) {
        const last = this._lastScatterRegrowCheck ?? -Infinity;
        if (now - last < 10000) return;
        this._lastScatterRegrowCheck = now;
        const sh = this.state.scatterHarvested;
        if (!sh || sh.size === 0) return;
        const ttl = AnazhRealm.FORAGE.regrowMs;
        const ns = this.state.nahStreu;
        for (const [key, jeKachel] of sh) {
            const alt = [];
            for (const [id, t] of jeKachel) if (now - t > ttl) alt.push(id);
            if (!alt.length) continue;
            this._weltRegt(); // die Flora wächst nach: die Nah-Streu baut die Kachel neu (der Weckruf vor jedem Schreiben)
            for (const id of alt) jeKachel.delete(id);
            if (jeKachel.size === 0) sh.delete(key);
            const k = ns ? ns.kacheln.get(key) : null;
            if (k) k.zustand = null;
        }
    }

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
            mesh.receiveShadow = false;
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
            // DIE FARB-SCHLANGE (`_fernRingFaerben`): je Vertex ein offenes Flag + seine Höhe; `farbMin` = der kleinste
            // offene Index (nah zuerst: Schale 0 innen → außen, dann die äußeren Schalen).
            farbOffen: new Uint8Array(off),
            farbLaw: new Float32Array(off),
            farbSchutt: new Float32Array(off), // je Punkt das Gewicht des Schutts aus demselben Höhen-Ruf (`aus.schutt`)
            nass: new Uint8Array(off), // je Punkt: trägt der Boden dort Wasser (`_fernNass`)
            farbN: 0,
            farbMin: off,
            refreshed: 0, // Budget-Zähler (Linse)
            ready: false,
        };
        return st.fernRing;
    }

    // DIE FERN-FARBE (V18.530): die Ferne trägt die Funktion — die Boden-Farbe (`_bodenFarbeAt`, dieselbe wie jeder
    // Chunk-Vertex) unter dem Kronendach des Waldes mit der Deckung, die der Wald-Generator würfelt (phyto-core
    // `forestGeburt` aus der Bestandsdichte); Wasser liegt flach auf dem Spiegel. Befund 04.10. (Blick-Tour, Luft
    // offen): eine eigene Höhen-Rampe (Gras-Grün 0,30/0,46/0,24 roh als linear) malte die Ferne hell-gelbgrün und
    // kahl, wo der Wald steht — der vereinfachte Fern-Zwilling ist gefallen.
    // DIE TEILE (Integration 05.10.): `out` = [Boden r, g, b · Kronendach r, g, b · Deckung] (linear). Das Kronendach
    // ist die Studio-Laubfarbe der Arten, die der Wald-Generator HIER würfelt (phyto-core `forestNische`: dieselben
    // Nischen-Gewichte wie planForestCell), × die Selbstbeschattung der Krone (`FERN_FARBE.kronenSchatten`) — die feste
    // Sommer-Konstante neben dem Studio-Laub (ohne Art, ohne Saison) ist gefallen. Die Saison legt der Leser auf.
    // `fuss` (optional, `_fernFarbeMasche`): die Masche, für die der Punkt steht — dann das Mittel über sie. `fussM` (die
    // Abtastung einer Masche): ihre Kante in Metern — die Nische trägt darunter das Mosaik-Mittel (phyto-core `forestNische`).
    // DAS WASSER DES FLUSSES (K16): die Masche (oder der Punkt ohne Abtastung) trägt den Anteil, den der Fluss deckt
    // (`_fernFlussDeckung`), als Wasser-Farbe ohne Krone — dieselbe Farbe, die ein nasser Ring-Punkt trägt.
    // DER SCHUTT (`schutt`, K17-2 Nachbesserung 1): das Gewicht des Schutthangs aus dem Höhen-Ruf, der `y` gab (`aus.schutt`
    // von `_terrainMacroSurfaceY`) — der Rufer zieht die Höhe ohnehin, das Gesetz läuft nie zweimal. Fehlt er (null: ein Leser
    // ohne eigenen Höhen-Ruf), zieht ihn `_fernSchuttAt` EINMAL je Punkt bzw. Masche (die Abtastungen der Masche teilen ihn
    // wie die Höhe `y`). Bis zur Nachbesserung zog `_fernSchutt` das ganze Höhen-Gesetz je Abtastung neu (je Masche 9 ×).
    _fernFarbeTeile(x, y, z, out, fuss, fussM, schutt) {
        if (schutt == null) schutt = this._fernSchuttAt(x, z);
        if (fuss)
            return this._fernFlussTeil(
                x,
                z,
                this._fernFarbeMasche(x, y, z, out, fuss, schutt),
                Math.max(fuss.ht, fuss.hr)
            );
        if (fussM === undefined)
            return this._fernFlussTeil(x, z, this._fernFarbeTeile(x, y, z, out, null, 0, schutt), 0);
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        if (
            !core ||
            typeof core.forestNische !== "function" ||
            typeof core.forestGeburt !== "function" ||
            typeof core.forestBestand !== "function" ||
            typeof core.forestKronenDeckung !== "function"
        )
            throw new Error(
                "Fern-Farbe: phyto-core forestNische/forestGeburt/forestBestand/forestKronenDeckung fehlen (KERN-PFLICHT)"
            );
        this._bodenFarbeAt(x, y, z, out, fussM);
        this._fernSchutt(schutt, out);
        const ctx =
            this._fernNischeCtx ||
            (this._fernNischeCtx = {
                F: AnazhRealm.FOREST,
                baseH: 0,
                fbm: (px, pz) => this._forestFbm(px, pz),
                // die Nische liest die Feuchte unter demselben Abdruck (`fussM`, `_flussAbdruck`)
                feuchteAt: (px, pz, sy) => this._feuchteAt(px, pz, sy, this._fernNischeCtx.fussM),
            });
        // Der Bestand unter dem Fußabdruck (phyto-core `forestBestand`: ohne fussM die Zahlen von forestStandDensity und
        // forestGeburt) — die feine Bestands-Oktave (λ 26 m) faltete die Deckung jeder Masche (Streifen-Index der Deckung 0,82–1,09).
        const B = core.forestBestand(ctx.fbm, x, z, fussM > 0 ? fussM : 0);
        const sd = B.sd;
        ctx.baseH = (this.state && this.state.terrainBaseHeight) || 0;
        ctx.fussM = fussM > 0 ? fussM : 0;
        const N = core.forestNische(x, z, y, sd, ctx);
        const L = this._fernLaubLinear();
        const w = [N.wF, N.wT, N.wE, N.wB, N.wW];
        // DIE DECKUNG IST DER GEPFLANZTE BESTAND (K16, die Naht): der Anteil unter Kronen, den der Wald-Generator mit seiner
        // Schüchternheit an diesem Ort stehen lässt (phyto-core `forestKronenDeckung` aus Geburt, Bestandsdichte und der
        // Arten-Mischung mit ihren Kronen, `FOREST.crown`) — bis K16 las das Dach die Geburt (0,90) als Deckung, der gepflanzte
        // Wald deckt 0,16: jenseits des Karten-Horizonts stand geschlossenes Grün vor offenem Wald (gate:fern-ring Band 11).
        const C = AnazhRealm.FOREST.crown;
        const kr =
            this._fernKronenTmp ||
            (this._fernKronenTmp = [
                [0, C.baum_kiefer],
                [0, C.baum_tanne],
                [0, C.baum_eiche],
                [0, C.baum_birke],
                [0, C.baum_erle],
            ]);
        for (let i = 0; i < 5; i++) kr[i][0] = w[i];
        out[6] = core.forestKronenDeckung(sd, B.geburt, kr, AnazhRealm.FOREST);
        const S = AnazhRealm.FERN_FARBE.kronenSchatten;
        let summe = 0;
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0; i < 5; i++) {
            summe += w[i];
            r += w[i] * L[i][0];
            g += w[i] * L[i][1];
            b += w[i] * L[i][2];
        }
        const k = summe > 0 ? S / summe : 0;
        out[3] = r * k;
        out[4] = g * k;
        out[5] = b * k;
        return out;
    }

    // DER SCHUTT DER FERNE (K17-2, nah = fern aus EINEM Gesetz): wo das Schicht-Gesetz den Schutthang legt (gelaende-core
    // `hoehe(…, aus).schutt`), trägt die Ferne das Mittel dessen, was der Chunk dort zeichnet — den Boden mit dem Gewicht
    // `TERRAIN_GEOLOGY.schutt` × Schutt zum Mittel des Fels-Stoffs gemischt (`FELS_STOFF.mittel`; im Chunk `felsStoff` je
    // Vertex) und × das Mittel des Gerölls (`schuttMittel`: es wirft Schatten in sich; im Chunk der Detail-Term mit dem Gewicht
    // des Schutts). Bis K17-2 trug die Ferne keinen Schutt (`_terrainGeologyAlbedo` liest `aSchutt` nur am Chunk): jenseits der
    // Bau-Kante lag der graue Schutthang in der Farbe der Säule. Ring, Kronen-Karte und Feld-Pass lesen ihn über die Fern-Farbe.
    // `s` = das Gewicht des Schutts am Punkt (`aus.schutt` des Höhen-Rufs; fehlt es, bricht die Ferne laut — nie still 0).
    _fernSchutt(s, out) {
        if (typeof s !== "number" || s !== s) throw new Error("_fernSchutt: das Gewicht des Schutts fehlt (" + s + ")");
        if (!(s > 0)) return out;
        const GK = globalThis.__gelaendeCore;
        const ws = AnazhRealm.TERRAIN_GEOLOGY.schutt * s;
        const M = AnazhRealm.FELS_STOFF.mittel;
        const k = 1 + (GK.schuttMittel() - 1) * s;
        for (let c = 0; c < 3; c++) out[c] = (out[c] + (M[c] - out[c]) * ws) * k;
        return out;
    }

    // Der Schutt am Punkt für einen Leser ohne eigenen Höhen-Ruf (die Kronen-Karte, Linsen): EIN Ruf des Höhen-Gesetzes.
    _fernSchuttAt(x, z) {
        const aus = this._fernSchuttAus || (this._fernSchuttAus = { hang: 0, schutt: 0 });
        this._terrainMacroSurfaceY(x, z, false, aus);
        return aus.schutt > 0 ? aus.schutt : 0;
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

    // Die zusammengesetzte Fern-Farbe (CPU-Leser, der Feld-Pass): Wasser flach, sonst der Boden unter dem Kronendach ×
    // die Saison (`saison` = `_saisonMul` der laufenden Phase — dieselbe Zahl, die `uSeasonMul` trägt) zur Deckung.
    // `out` = [r, g, b] (linear).
    _fernFarbeAt(x, y, z, wet, out, saison, fuss, schutt) {
        const R = this._fernWasserKoerper();
        if (wet) {
            out[0] = R[0];
            out[1] = R[1];
            out[2] = R[2];
            return out;
        }
        const t = this._fernFarbeTeile(
            x,
            y,
            z,
            this._fernTeileTmp || (this._fernTeileTmp = new Float32Array(8)),
            fuss,
            undefined,
            schutt
        );
        const c = t[7];
        out[0] = (t[0] + (t[3] * saison.r - t[0]) * t[6]) * (1 - c) + R[0] * c;
        out[1] = (t[1] + (t[4] * saison.g - t[1]) * t[6]) * (1 - c) + R[1] * c;
        out[2] = (t[2] + (t[5] * saison.b - t[2]) * t[6]) * (1 - c) + R[2] * c;
        return out;
    }

    // DER FUSSABDRUCK DER FERN-FARBE (K16): ein Ring-Punkt oder Feld-Texel steht für eine Masche (`fuss` = { ax, az, ht, hr }:
    // der Anker, die halbe Breite tangential und die halbe Tiefe radial in Metern) — seine Farbe ist das Mittel der Masche aus
    // 3 × 3 Abtastungen, nie der Punkt. Befund 11.10. (Makro-Blick, Vorschau): das Bestands-Mosaik des Wald-Generators
    // (phyto-core `forestNische`, patch λ ≈ 20 m) wechselte unter einer 11 × 34-m-Masche je Punkt die Art (Kronen-Grün
    // 0,035 … 0,128) — jede Masche zog als radialer Streifen um den Spieler. Das Mittel ist exakt für jede Saison s:
    // Deckung ā = ⟨a⟩, Krone k' = ⟨k·a⟩/ā, Boden c' = (⟨c⟩ − ⟨c·a⟩)/(1 − ā), also c' + (k'·s − c')·ā = ⟨c + (k·s − c)·a⟩.
    _fernFarbeMasche(x, y, z, out, fuss, schutt) {
        const t = this._fernMascheTmp || (this._fernMascheTmp = new Float32Array(8));
        const S = this._fernMascheSumme || (this._fernMascheSumme = new Float64Array(10));
        S.fill(0);
        const dx = x - fuss.ax;
        const dz = z - fuss.az;
        const d = Math.hypot(dx, dz) || 1;
        const rx = dx / d;
        const rz = dz / d;
        // Isotrop über die längere Maschen-Seite × 1,5: eine Box nur so breit wie die Masche liess das 20-m-Mosaik quer zur
        // 11-m-Teilung stehen (Werkbank 11.10., Makro 300 m: die Streifen blieben), die runde, weitere Box dämpft es (Rest im
        // Mittelfeld offen: 3 × 3 Abtastungen auf λ 20 m bleiben teils kohärent).
        const h = 1.5 * Math.max(fuss.ht, fuss.hr);
        // DAS MOSAIK IM KERN (K16): was die Masche nicht mehr auflöst (das Bestands-Mosaik λ 20 m, das Klima λ 83 m), trägt in
        // jeder Abtastung sein Mittel (phyto-core `forestNische` mit fussM = die längere Maschen-Kante) — neun Abtastungen auf
        // λ 20 m blieben kohärent (Streifen-Index 0,89, gate:fern-ring Band 10).
        const fussM = 2 * Math.max(fuss.ht, fuss.hr);
        const U = [-2 / 3, 0, 2 / 3];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                const ur = U[i] * h;
                const ut = U[j] * h;
                this._fernFarbeTeile(x + rx * ur - rz * ut, y, z + rz * ur + rx * ut, t, null, fussM, schutt);
                const a = t[6];
                for (let c = 0; c < 3; c++) {
                    S[c] += t[c];
                    S[3 + c] += t[c] * a;
                    S[6 + c] += t[3 + c] * a;
                }
                S[9] += a;
            }
        const a = S[9] / 9;
        const frei = 9 - S[9];
        for (let c = 0; c < 3; c++) {
            out[c] = frei > 1e-6 ? (S[c] - S[3 + c]) / frei : S[c] / 9;
            out[3 + c] = S[9] > 1e-6 ? S[6 + c] / S[9] : 0;
        }
        out[6] = a;
        return out;
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
        let anders = M.uZelle0.value.x !== i0 || M.uZelle0.value.y !== j0;
        for (let q = 0; q < M.n * M.n; q++)
            if (M.daten[q * 4] !== neu[q * 2] || M.daten[q * 4 + 1] !== neu[q * 2 + 1]) {
                M.daten[q * 4] = neu[q * 2];
                M.daten[q * 4 + 1] = neu[q * 2 + 1];
                anders = true;
            }
        if (!anders) return;
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
        const geo = fr.geos[0];
        const I = geo.index.array;
        const neu = T.neu || (T.neu = new Uint8Array(T.klasse.length));
        AnazhRealm._fernRingKlassen(M, this._voxelChunkConfig().span, geo.attributes.position.array, I, neu);
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
    static _fernRingKlassen(M, span, P, I, klasse) {
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
        for (let t = 0; t < klasse.length; t++) {
            const p = I[t * 3] * 3;
            const q = I[t * 3 + 1] * 3;
            const r = I[t * 3 + 2] * 3;
            const x0 = Math.min(P[p], P[q], P[r]);
            const x1 = Math.max(P[p], P[q], P[r]);
            const z0 = Math.min(P[p + 2], P[q + 2], P[r + 2]);
            const z1 = Math.max(P[p + 2], P[q + 2], P[r + 2]);
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
    }

    // DER EINE SETZ-HELFER (CPU und GPU schreiben durch DIESELBE Naht): Höhe →
    // Wasser-Klemme (waterLevel − wasserDrop) + Saum-Tauchkante (Reihe 0) +
    // Weich-Wand unter Gebautem + Farbrampe. Kein Parallelpfad.
    _fernRingSetzVertex(fr, p, law, wl, schutt) {
        const geo = fr.geos[p.s];
        const pos = geo.attributes.position;
        if (p.s === 0 && (pos.getX(p.li) !== p.x || pos.getZ(p.li) !== p.z)) fr.xzGen++; // die Teilung folgt der Lage
        const nass = this._fernRingNass || (this._fernRingNass = { y: 0, spiegel: 0 });
        pos.setXYZ(p.li, p.x, this._fernRingY(fr, p, law, wl, nass), p.z);
        const wet = nass.y < nass.spiegel;
        fr.nass[p.g] = wet ? 1 : 0;
        // DIE FARBE: ein gemerkter Schnapp-Punkt färbt sofort; ein neuer wartet im Fern-Farb-Budget (`_fernFarbTakt`,
        // nah zuerst) — ein Anker-Sprung rechnete die Farbe von ~8 000 neuen Punkten in EINEM Frame (gemessen 05.10.,
        // echte GPU: 10–18 ms Rückruf, auf 8× langsamerem Holz > 100 ms). Vor dem ersten Bild (!ready) rechnet die
        // Naht sofort — der Horizont erscheint nie schwarz.
        const g = p.g;
        fr.farbLaw[g] = law;
        // der Schutt aus dem Höhen-Ruf des Rufers; ein Rufer ohne ihn (Linsen) zieht ihn EINMAL hier
        fr.farbSchutt[g] = schutt = schutt == null ? this._fernSchuttAt(p.x, p.z) : schutt;
        const f = this._fernRingTeile(p.x, p.z, law, wet, !fr.ready, p.fuss, schutt);
        if (f) {
            AnazhRealm._fernRingSchreibe(geo, p.li, f);
            if (fr.farbOffen[g]) {
                fr.farbOffen[g] = 0;
                fr.farbN--;
            }
        } else if (!fr.farbOffen[g]) {
            fr.farbOffen[g] = 1;
            fr.farbN++;
            if (g < fr.farbMin) fr.farbMin = g;
        }
    }

    // Die Höhe EINES Ring-Punkts aus seinem Gesetz: unter Wasser flach unter dem Spiegel (`_fernRingWasserTiefe`), die
    // innerste Reihe jeder Schale taucht −saumDrop (die Saum-Tauchkante). DIE NAHT (K16, `_fernRingNaht`): wo ein gebauter
    // Chunk den Punkt oder einen Nachbarn trägt, liegt der Ring auf dem VOLLEN Gesetz (`vollY`, dieselbe Höhe wie der Chunk,
    // ohne die Loch-Senkung) — die Masche über die Chunk-Kante trägt draußen die Sehne des Gesetzes. Im Gebauten zeichnet er
    // nicht (die Masken-Karte, `_fernRingMaske`): bis 12.10. tauchte er dort 2 m, an der Naht 0,2 m, und das Gebaute deckte
    // ihn per Tiefe — über jeder Höhlen-Mündung lag er als Platte, an der Naht stach seine Sehne durch.
    // Das Wasser des Punkts ist das Wasser des Bodens (`_fernNass`: Kanal, See, Meer; `nass` trägt Fläche und Spiegel).
    _fernRingY(fr, p, law, wl, nass) {
        const F = AnazhRealm.FERN_RING;
        const rand = fr.teilung.randV;
        const f = p.s === 0 && rand && rand[p.li] ? fr.feldY[p.g] : NaN; // die Ecke eines Naht-Dreiecks: das Feld
        if (f === f) law = f;
        else if (this._fernRingNaht(fr, p)) {
            const v = fr.vollY[p.g];
            if (v === v) law = v;
        }
        const aus = nass || this._fernRingNass || (this._fernRingNass = { y: 0, spiegel: 0 });
        const wet = this._fernNass(p.x, p.z, law, wl, aus);
        let y = wet ? aus.spiegel - this._fernRingWasserTiefe() : aus.y;
        // DIE HÖHE DES FLUSSES (K16, die Naht des Wassers): der Punkt steht für seine Masche — wo ein Fluss sie zum Anteil c
        // deckt (`_fernFlussDeckung`, derselbe Kasten-Filter, der den Wasser-Anteil aNass trägt), liegt er auf dem Mittel der
        // sichtbaren Fläche: Boden × (1 − c) + der Spiegel des Flusses × c. Ein ganz getauchter Punkt riss Gruben in den Ring
        // (Werkbank 13.10.), ein nie getauchter trug den Fluss nur als Farbe auf der Bank (Prüfung 13.10.).
        if (!wet) {
            const fl = this._fernRingFluss || (this._fernRingFluss = { spiegel: NaN });
            const c = this._fernFlussDeckung(p.x, p.z, p.fuss ? Math.max(p.fuss.ht, p.fuss.hr) : 0, fl);
            if (c > 0 && fl.spiegel === fl.spiegel) y += (fl.spiegel - y) * c;
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

    // DER FLUSS IN DER MASCHE (K16, die Naht): der Anteil einer Masche (halbe Kante `hs` m; 0 = ein Punkt), den das Wasser
    // eines Flusses deckt — der Querschnitt als Kasten-Filter: die Überdeckung von [d − hs, d + hs] mit dem Wasser
    // [−halbe Breite, +halbe Breite] des nächsten Segments (`_hydroDistAt`).
    _fernFlussDeckung(x, z, hs, aus) {
        const fl = this._hydroDistAt(x, z);
        if (aus) aus.spiegel = fl.spiegel;
        if (!(fl.dist < Infinity)) return 0;
        const w = fl.halfW;
        if (!(hs > 0)) return fl.dist <= w ? 1 : 0;
        return Math.max(0, Math.min(fl.dist + hs, w) - Math.max(fl.dist - hs, -w)) / (2 * hs);
    }
    // Der Anteil des Wassers in die Teile (Slot 7): das Wasser trägt keine Krone; seine Farbe ist der Blick des Wassers im
    // Ring-Stoff (`_wasserBlick`) bzw. der Wasser-Körper im Feld-Pass (`_fernFarbeAt`), nie eine Fern-Konstante.
    _fernFlussTeil(x, z, out, hs) {
        const c = this._fernFlussDeckung(x, z, hs);
        out[7] = c;
        if (c > 0) out[6] *= 1 - c;
        return out;
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
    // die EINE Setz-Naht, mit dem Gesetz, das er dem Punkt zuletzt gab (`farbLaw`, kein neues Gesetz).
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
            this._fernRingSetzVertex(fr, p, fr.farbLaw[g], wl, fr.farbSchutt[g]);
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

    // Die Farb-TEILE EINES Ring-Punkts (Boden · Kronendach · Deckung, `_fernFarbeTeile`): Wasser flach (der Spiegel,
    // Deckung 0), trocken aus dem Gedächtnis — oder, mit `rechnen`, frisch und gemerkt. null = offen (das Budget färbt
    // ihn). Die Saison legt der Ring-Stoff auf (`uSeasonMul`), das Gedächtnis bleibt über das Jahr gültig.
    _fernRingTeile(x, z, law, wet, rechnen, fuss, schutt) {
        if (wet) {
            const w = this._fernWasserKoerper();
            return (
                this._fernWasserTeile || (this._fernWasserTeile = new Float32Array([w[0], w[1], w[2], 0, 0, 0, 0, 1]))
            );
        }
        // Schnapp-Punkte sind ganzzahlig, |x|, |z| < 2^21 m; die Maschen-Breite (Viertel-Oktaven) steht über 2^44 — eindeutig.
        // Ohne `fuss` steht der Punkt für sich (wie in `_fernFarbeTeile`): die Masche unter 1 m — die Nah-Fern-Linse ruft so
        // das Gesetz an der Stelle und brach seit dem Fußabdruck (K16) an `fuss.ht`.
        const key = x * 4194304 + z + Math.round(4 * Math.log2(Math.max(1, fuss ? fuss.ht : 0))) * 17592186044416;
        const m = this._fernFarbeMemo || (this._fernFarbeMemo = { neu: new Map(), alt: new Map() });
        let f = m.neu.get(key);
        if (f) return f;
        f = m.alt.get(key) || null;
        if (!f && !rechnen) return null;
        if (!f) f = this._fernFarbeTeile(x, law, z, new Float32Array(8), fuss, undefined, schutt);
        // ZWEI GENERATIONEN: ist `neu` voll, wird es `alt` (die jüngsten 2 × memo Punkte bleiben) — das alte clear()
        // leerte das Gedächtnis jeden zweiten Re-Anker ganz (9216 Punkte je Ring, Kappe 16384).
        if (m.neu.size >= AnazhRealm.FERN_FARBE.memo) {
            m.alt = m.neu;
            m.neu = new Map();
        }
        m.neu.set(key, f);
        return f;
    }

    // Die offenen Ring-Farben im Budget färben: Index-Folge ab `farbMin` (nah zuerst), bis die Frist `ende` steht —
    // mindestens `mindest` Punkte (nie verhungert). Liefert den Rest des Mindest-Kontingents.
    _fernRingFaerben(fr, ende, mindest) {
        if (!fr.farbN) return mindest;
        const dirty = [false, false, false];
        let n = 0;
        let g = fr.farbMin;
        for (; g < fr.totalVerts && fr.farbN > 0; g++) {
            if (!fr.farbOffen[g]) continue;
            const p = this._fernRingPunkt(fr, g);
            const f = this._fernRingTeile(p.x, p.z, fr.farbLaw[g], fr.nass[g] === 1, true, p.fuss, fr.farbSchutt[g]);
            AnazhRealm._fernRingSchreibe(fr.geos[p.s], p.li, f);
            dirty[p.s] = true;
            fr.farbOffen[g] = 0;
            fr.farbN--;
            n++;
            if ((n & 15) === 0 && n >= mindest && performance.now() > ende) {
                g++;
                break;
            }
        }
        fr.farbMin = fr.farbN > 0 ? g : fr.totalVerts;
        for (let s = 0; s < dirty.length; s++) if (dirty[s]) AnazhRealm._fernRingAttributeHoch(fr.geos[s]);
        fr.gefaerbt = (fr.gefaerbt || 0) + n; // Linse
        return Math.max(0, mindest - n);
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

    // DAS FERN-FARB-BUDGET (EIN Zeit-Budget je Takt, nah zuerst, Lehren 14/25): erst die Fern-Krone des nahen Bodens (das
    // Quadrat um den Spieler), dann die offenen Ring-Farben, dann der Farb-Job des Feld-Passes. Über dem Frame-Budget das
    // knappe Maß; nie null — die Krone und der Ring je mindestens `mindestJeTakt` Punkte. Als Letzte im Budget verhungerte die
    // Krone hinter dem Ring: nach dem Wechsel an die Wiese stand ihre Karte nach dem Einschwingen noch leer (`bereit` 0,
    // gemessen 11.10.).
    _fernFarbTakt(fr) {
        const K = AnazhRealm.FERN_FARBE;
        const ende = performance.now() + (this.state._frameOverBudget ? K.msKnapp : K.msJeTakt);
        this._fernKroneNahTakt(ende, K.mindestJeTakt);
        const rest = this._fernRingFaerben(fr, ende, K.mindestJeTakt);
        const fp = this.state.feldPass;
        if (fp && fp.farbJob) this._feldPassFaerben(fp, ende, rest);
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

    // Der Takt der Karte: Wald-Radius und Spieler je Takt; die Karte liegt auf dem Chunk-Quadrat — ihre Mitte ist die Mitte
    // des Chunks unter dem Spieler (die Mitte des Rings), ihre Größe (2·Ring + 1 + rand)·span: der Rand von rand/2 Chunks je
    // Seite trägt das neue Quadrat, solange sie nach einem Chunk-Wechsel neu füllt. Der Anker auf einem Raster von einem
    // Viertel der Karte lag bis 59 m neben der Mitte des Quadrats, weiter als sein Rand von 43 m: aus 420 m blieb am Rand des
    // Quadrats ein Streifen von 22 m blass (11.10.). Sie füllt sich, bis die Frist `ende` steht — mindestens `mindest` Punkte
    // je Takt.
    _fernKroneNahTakt(ende, mindest) {
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
        if (!k.job && (!a || a.x !== mx || a.z !== mz || a.groesse !== groesse)) k.job = { mx, mz, groesse, i: 0 };
        const j = k.job;
        if (!j) return;
        const N = k.N;
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const t = k.teile || (k.teile = new Float32Array(8));
        const sRGB = (c) => {
            const v = c <= 0 ? 0 : c >= 1 ? 1 : c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
            return Math.round(v * 255);
        };
        let n = 0;
        while (j.i < N * N && (n++ < mindest || performance.now() < ende)) {
            const ix = j.i % N;
            const iz = (j.i / N) | 0;
            const x = Math.round(j.mx - j.groesse / 2 + ((ix + 0.5) * j.groesse) / N);
            const z = Math.round(j.mz - j.groesse / 2 + ((iz + 0.5) * j.groesse) / N);
            const nass = k.nass || (k.nass = { y: 0, spiegel: 0 });
            const o = j.i * 4;
            // Wasser trägt keine Krone (der Ring: Deckung 0 auf dem Spiegel)
            const aus = k.aus || (k.aus = { hang: 0, schutt: 0 });
            if (this._fernNass(x, z, this._terrainMacroSurfaceY(x, z, false, aus), wl, nass))
                k.puffer[o] = k.puffer[o + 1] = k.puffer[o + 2] = k.puffer[o + 3] = 0;
            else {
                this._fernFarbeTeile(x, nass.y, z, t, undefined, undefined, aus.schutt > 0 ? aus.schutt : 0);
                k.puffer[o] = sRGB(t[3]);
                k.puffer[o + 1] = sRGB(t[4]);
                k.puffer[o + 2] = sRGB(t[5]);
                k.puffer[o + 3] = Math.round(Math.max(0, Math.min(1, t[6])) * 255);
            }
            j.i++;
        }
        if (j.i < N * N) return;
        k.daten.set(k.puffer);
        k.tex.needsUpdate = true;
        k.U.mitte.value.set(j.mx, j.mz);
        k.U.groesse.value = j.groesse;
        k.U.bereit.value = 1;
        k.anker = { x: j.mx, z: j.mz, groesse: j.groesse };
        k.job = null;
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

    // DIE EINE DECK-FORMEL (CPU-Refresh UND GPU-Maler mischen durch sie — kein
    // Zahlen-Zwilling): innerhalb der Zone volles Gesetz −0.3 gesenkt, ×1.35-
    // Blende auf Makro. Das Gate spiegelt exakt diese Formel.
    _fernRingDeckMisch(fr, rad, makro, voll) {
        if (!(rad <= fr.deckZoneRad * 1.35)) return makro;
        const w = rad <= fr.deckZoneRad ? 1 : (fr.deckZoneRad * 1.35 - rad) / (fr.deckZoneRad * 0.35);
        return makro + (voll - makro) * w - 0.3 * w;
    }

    // Budgetierter Höhen-Refresh (~`refreshVertsProTick` Vertices/Frame, nie synchron alles): Welt-XZ
    // aufs Snap-Gitter, Höhe = das EINE Gesetz (includeDetail=false), unter Wasser flach auf
    // waterLevel − wasserDrop. Die innerste Reihe jeder Schale taucht −saumDrop (Saum-Tauchkante).
    // Liefert die Zahl erneuerter Vertices.
    _fernRingRefresh(budget) {
        const fr = this.state.fernRing;
        if (!fr) return 0;
        if (fr.cursor >= fr.totalVerts) {
            this._fernRingDeckWache(fr);
            return 0;
        }
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        const dirty = [false, false, false];
        let done = 0;
        while (done < budget && fr.cursor < fr.totalVerts) {
            const p = this._fernRingPunkt(fr, fr.cursor);
            const aus = this._fernRingAus || (this._fernRingAus = { hang: 0, schutt: 0 });
            let law = this._terrainMacroSurfaceY(p.x, p.z, false, aus);
            const schutt = aus.schutt > 0 ? aus.schutt : 0;
            // Loch-Deckel + Naht-Veredelung, EINE Formel (_fernRingDeckMisch, geteilt mit dem GPU-Maler):
            // Schale-0-Reihen in der Chunk-Ziel-Zone tragen das VOLLE Gesetz (includeDetail), −0.3 gesenkt —
            // stehende Chunks decken sie per Depth, fehlende zeigen wahres Terrain statt der Wasser-Plane. In der Bau-Zone
            // merkt sich jeder Punkt das volle Gesetz (die Naht, `_fernRingY`).
            if (p.s === 0 && p.rad <= fr.bauZoneRad) {
                const voll = this._terrainMacroSurfaceY(p.x, p.z, true);
                fr.vollY[p.g] = voll;
                law = this._fernRingDeckMisch(fr, p.rad, law, voll);
            }
            this._fernRingSetzVertex(fr, p, law, wl, schutt);
            dirty[p.s] = true;
            fr.cursor++;
            done++;
        }
        this._fernRingHoch(fr, dirty);
        fr.refreshed += done;
        if (!fr.ready && fr.cursor >= fr.totalVerts) {
            fr.ready = true;
            for (const m of fr.meshes) m.visible = true; // erst voll, dann sichtbar (kein Null-Blob)
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
        // DAS GESETZ DES SAUMS, EINMAL JE ANKER: die gemischte Deck-Höhe (Makro + volles Gesetz, `_fernRingDeckMisch`)
        // eines Punkts ist eine reine Funktion seines Orts — vorher rechnete die Wache sie je Takt für 128 Punkte neu (256
        // Gesetz-Höhen, ~6 000 noise2D je Frame im Stand, gemessen 07.10.); jetzt einmal je Anker-Generation (`fr.gen`)
        // und Wasserspiegel (das Gesetz misst Tarn und Senke an ihm).
        if (!fr.deckLaw || fr.deckLawGen !== (fr.gen | 0) || fr.deckLawWl !== wl) {
            fr.deckLaw = new Float64Array(fr.zoneVerts).fill(NaN);
            fr.deckLawGen = fr.gen | 0;
            fr.deckLawWl = wl;
        }
        const pos = fr.geos[0].attributes.position;
        let neu = false;
        let feldMessungen = 0;
        let offen = false;
        for (let n = 0; n < 128; n++) {
            const i = fr.deckCursor % fr.zoneVerts;
            const p = this._fernRingPunkt(fr, i);
            let law = fr.deckLaw[i];
            if (law !== law) {
                const makro = this._terrainMacroSurfaceY(p.x, p.z, false);
                const voll = this._terrainMacroSurfaceY(p.x, p.z, true);
                fr.vollY[p.g] = voll;
                law = fr.deckLaw[i] = this._fernRingDeckMisch(fr, p.rad, makro, voll);
            }
            // DIE ECKE EINES NAHT-DREIECKS misst die Fläche des Feldes (gedeckelt je Takt: eine Spalten-Probe liest die
            // Dichte von der Garantie-Luft bis zum Boden)
            if (fr.feldY[p.g] !== fr.feldY[p.g] && fr.teilung.randV && fr.teilung.randV[p.li]) {
                if (feldMessungen < F.feldJeTakt) {
                    this._fernRingFeldY(fr, p);
                    feldMessungen++;
                } else offen = true;
            }
            if (Math.fround(this._fernRingY(fr, p, law, wl)) !== pos.getY(p.li)) {
                this._fernRingSetzVertex(fr, p, law, wl, fr.farbSchutt[p.g]);
                neu = true;
            }
            fr.deckCursor++;
        }
        this._standMeldet("deckWache", 128, neu, offen);
        if (!neu) return;
        this._fernRingHoch(fr, [true]);
    }

    // ===== DER FELD-ZEICHNER =====
    // Ein voller Fern-Ring-Refresh (Boot + Re-Anker) und der Feld-Pass lesen die Höhen der Ferne aus dem EINEN Gelände-
    // Gesetzbuch (gelaende-core `hoehe`, K16: das Flussnetz ist memoisierter Zustand je Saat — ein WGSL-Spiegel des
    // alten Rausch-Gesetzes malte die Ferne falsch und fiel). Zeitgeschnitten: je Makro-Task so viele Punkte, wie das
    // Takt-Budget des Streamings trägt (`_voxelStreamBudgetMs`, der Regler atmet es), mindestens 16 — nie eine feste Zahl
    // (bis K16 fest 1 500 je Task: bei 25 µs je Spalte 37 ms am Stück auf dem Haupt-Thread, Lehre 14).
    // `schutt` (optional, Float32Array n): je Punkt das Gewicht des Schutts aus DEMSELBEN Ruf (`aus.schutt`).
    _feldZeichnerHoehen(punkte, includeDetail, schutt) {
        const n = (punkte.length / 2) | 0;
        const werte = new Float32Array(n);
        const aus = schutt ? { hang: 0, schutt: 0 } : undefined;
        let k = 0;
        return new Promise((fertig) => {
            const scheibe = () => {
                const budget = this.state._voxelStreamBudgetMs;
                const frist = performance.now() + (Number.isFinite(budget) && budget > 0 ? budget : 4);
                const mindest = k + 16;
                for (; k < n; k++) {
                    werte[k] = this._terrainMacroSurfaceY(punkte[k * 2], punkte[k * 2 + 1], includeDetail, aus);
                    if (aus) schutt[k] = aus.schutt > 0 ? aus.schutt : 0;
                    if (k >= mindest && (k & 15) === 0 && performance.now() > frist) {
                        k++;
                        break;
                    }
                }
                if (k < n) setTimeout(scheibe, 0);
                else fertig(werte);
            };
            scheibe();
        });
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

    // Ring-Maler: alle Punkte des Ankers packen, EIN Feld-Lauf, Ergebnis durch dieselbe Setz-Naht wie
    // die CPU. Generations-Stempel verwirft überholte Flüge (Re-Anker/Dispose); fr.cursor bleibt.
    _fernRingGpuMal(fr) {
        if (fr.gpuFlug) return;
        const n = fr.totalVerts;
        const punkte = new Float32Array(n * 2);
        const pts = new Array(n);
        for (let g = 0; g < n; g++) {
            const p = this._fernRingPunkt(fr, g);
            pts[g] = p;
            punkte[g * 2] = p.x;
            punkte[g * 2 + 1] = p.z;
        }
        fr.gpuFlug = true;
        const gen = (fr.gen = (fr.gen || 0) + 1);
        // Mittel-Ring: in der Deck-Zone das VOLLE Gesetz (mit Detail). Zwei Flüge
        // (Makro für alle + VOLL für die Zonen-Vertices), gemischt über _fernRingDeckMisch → ab dem ersten
        // GPU-Anstrich wahr geformt, kein Makro→Voll-Sprung im Loch.
        const zonenIdx = [];
        for (let g = 0; g < n; g++) {
            const p = pts[g];
            if (p.s === 0 && p.rad <= fr.bauZoneRad) zonenIdx.push(g);
        }
        const zonenPunkte = new Float32Array(zonenIdx.length * 2);
        for (let k = 0; k < zonenIdx.length; k++) {
            zonenPunkte[k * 2] = punkte[zonenIdx[k] * 2];
            zonenPunkte[k * 2 + 1] = punkte[zonenIdx[k] * 2 + 1];
        }
        const ringSchutt = new Float32Array((punkte.length / 2) | 0);
        Promise.all([
            this._feldZeichnerHoehen(punkte, false, ringSchutt),
            zonenIdx.length ? this._feldZeichnerHoehen(zonenPunkte, true) : Promise.resolve(null),
        ])
            .then(([werte, vollWerte]) => {
                if (this.state.fernRing !== fr || fr.gen !== gen) return; // überholt (Re-Anker/Dispose)
                fr.gpuFlug = false;
                if (!werte) return; // kein Device/Fehler → die CPU zeichnet das Gesetz
                if (vollWerte) {
                    for (let k = 0; k < zonenIdx.length; k++) {
                        const g = zonenIdx[k];
                        fr.vollY[g] = vollWerte[k];
                        werte[g] = this._fernRingDeckMisch(fr, pts[g].rad, werte[g], vollWerte[k]);
                    }
                }
                const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
                // NUR ab dem Live-Cursor malen: Vertices davor hat die CPU schon
                // aufs f64-Gesetz verfeinert — f32 überschreibt nie exakter.
                for (let g = fr.cursor; g < n; g++) this._fernRingSetzVertex(fr, pts[g], werte[g], wl, ringSchutt[g]);
                this._fernRingHoch(fr, [true, true, true]);
                this._fernRingTeilung(fr); // die Ecken der Schale 0 stehen am neuen Anker: die Teilung folgt im selben Takt
                fr.gpuLaeufe = (fr.gpuLaeufe || 0) + 1;
                fr.gpuVerts = (fr.gpuVerts || 0) + n;
                if (!fr.ready) {
                    fr.ready = true;
                    for (const m of fr.meshes) m.visible = true; // das Feld malte — der Horizont steht JETZT
                }
            })
            .catch((e) => {
                if (this.state.fernRing === fr && fr.gen === gen) fr.gpuFlug = false;
                this._stoffBruch("der Fern-Ring (GPU-Malen)", e);
            });
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
    // Höhen aus _feldZeichnerHoehen als polares Höhen+Farb-Feld (RGBA-Textur); das Fragment liest nur Texturen (kein
    // Gesetz im Fragment → keine Drift). Ohne Device/TSL kein Pass, die Schalen tragen den Blick.
    _feldPassEnsure(fr) {
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
            // DAS LICHT DER WELT (_feldLichtSync): das Richt-Licht (Sonne/Mond), Ambient, Hemi und die
            // Himmels-Umgebung — dieselben Quellen und dieselbe BRDF wie jedes Mesh.
            l0d: TSL.uniform(new THREE.Vector3(0, 1, 0)),
            l0c: TSL.uniform(new THREE.Vector3()),
            ambientFarbe: TSL.uniform(new THREE.Vector3()),
            hemiOben: TSL.uniform(new THREE.Vector3()),
            hemiUnten: TSL.uniform(new THREE.Vector3()),
            envUnten: TSL.uniform(new THREE.Vector3()),
            envMitte: TSL.uniform(new THREE.Vector3()),
            envOben: TSL.uniform(new THREE.Vector3()),
        };
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
            "fn feldMarch(ndc: vec2<f32>, i: u32, camPos: vec3<f32>, invVP: mat4x4<f32>, nah: f32, fern: f32, fwd: vec3<f32>, l0d: vec3<f32>, l0c: vec3<f32>, ambientFarbe: vec3<f32>, hemiOben: vec3<f32>, hemiUnten: vec3<f32>, envUnten: vec3<f32>, envMitte: vec3<f32>, envOben: vec3<f32>, szeneTiefe: f32, schirm: vec2<f32>, ditherT: f32, saison: vec3<f32>, liste: texture_2d<f32>, kapseln: texture_2d<f32>) -> vec4<f32> {\n" +
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
                "    // DAS LICHT DER WELT: Richt-Licht + Ambient + Hemi über Lambert (albedo/π) plus die\n" +
                "    // Himmels-Irradianz (albedo·env) — die Formel des MeshStandard-Diffus, ohne Ton-Klemme:\n" +
                "    // die Belichtung macht die Ausgabe-Kette für Feld und Mesh gemeinsam.\n" +
                "    let nY = bestN.y;\n" +
                "    let direkt = l0c * max(dot(bestN, l0d), 0.0);\n" +
                "    let hemi = mix(hemiUnten, hemiOben, nY * 0.5 + 0.5);\n" +
                "    let env = select(mix(envMitte, envOben, nY), mix(envMitte, envUnten, -nY), nY < 0.0);\n" +
                "    let licht = (direkt + ambientFarbe + hemi) * (1.0 / PI) + env;\n" +
                "    return vec4<f32>(bestRgb * licht, bestT);\n" +
                "}",
            [sdEllipsoidRauFn, gradEllipsoidRauFn, sdKeilFn, gradKeilFn, kapselTexelFn] // der raue Ellipsoid, der Keil + die 2D-Kapsel-Liste
        );
        // DAS PANORAMA (Fragment): Richtung aus invVP → Azimut/Elevation → Panorama-Texel (quadratische Elevation-Umkehr)
        // → Farbe unter dem Licht der Welt; die Luft legt der Pass-Knoten auf. Rückgabe: rgb + Treffer-Distanz (0 =
        // Himmel → verworfen). textureDimensions braucht f32/i32-Casts (WGSL-Spec).
        const panorama = TSL.wgslFn(
            "fn feldPanorama(ndc: vec2<f32>, camPos: vec3<f32>, invVP: mat4x4<f32>, elevMax: f32, l0d: vec3<f32>, l0c: vec3<f32>, ambientFarbe: vec3<f32>, hemiOben: vec3<f32>, envOben: vec3<f32>, pano: texture_2d<f32>) -> vec4<f32> {\n" +
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
                "    // DAS LICHT DER WELT auf der Ferne: die Rampen-Farbe ist Albedo, das Gelände liegt flach\n" +
                "    // (Normale oben) — dieselbe Diffus-Formel wie der Feld-Treffer; die Luft legt der Pass-Knoten auf\n" +
                "    // (EINE Luft für Mesh, Feld und Panorama).\n" +
                "    return vec4<f32>(pT.rgb * ((l0c * max(l0d.y, 0.0) + ambientFarbe + hemiOben) * (1.0 / PI) + envOben), pT.a);\n" +
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
                return TSL.vec4(TSL.mix(ruf.rgb, luft.farbe(U.camPos, punkt), luft.faktor(U.camPos, punkt)), 1.0);
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
            l0d: U.l0d,
            l0c: U.l0c,
            ambientFarbe: U.ambientFarbe,
            hemiOben: U.hemiOben,
            hemiUnten: U.hemiUnten,
            envUnten: U.envUnten,
            envMitte: U.envMitte,
            envOben: U.envOben,
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
        matMarch.outputNode = imDunst(rufMarch);
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
        mat.outputNode = imDunst(
            panorama({
                ndc: ndcNode,
                camPos: U.camPos,
                invVP: U.invVP,
                elevMax: U.elevMax,
                l0d: U.l0d,
                l0c: U.l0c,
                ambientFarbe: U.ambientFarbe,
                hemiOben: U.hemiOben,
                envOben: U.envOben,
                pano: TSL.texture(panoTex),
            })
        );
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

    // Das Feld malt das polare Höhen+Farb-Feld: EIN Compute-Lauf des Zeichners über az×rad Polar-Punkte um den
    // Ring-Anker, die CPU packt Höhe (Wasser flach auf wl) + die EINE Fern-Farbe budgetiert in die RGBA-Textur
    // (`_feldPassFaerben`). Re-Anker → neu.
    _feldPassMal(fp, fr) {
        if (fp.flug) return;
        // Der Anker eines laufenden Farb-Jobs ist schon unterwegs — erst ein NEUER Anker malt neu.
        if (fp.farbJob && fp.farbJob.ankerX === fr.anchorX && fp.farbJob.ankerZ === fr.anchorZ) return;
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
        const feldSchutt = new Float32Array((punkte.length / 2) | 0);
        this._feldZeichnerHoehen(punkte, false, feldSchutt)
            .then((werte) => {
                if (this.state.feldPass !== fp || fp.gen !== gen) return;
                fp.flug = false;
                if (!werte) return; // kein Device → der Pass bleibt unsichtbar, die Schalen tragen
                // DIE FERN-FARBE kostet je Texel ~15 µs (az×rad Texel ≈ 0,1 s): sie malt budgetiert im Pass-Takt
                // (`_feldPassFaerben`), das alte Feld bleibt sichtbar, bis das neue steht.
                fp.farbJob = {
                    werte,
                    schutt: feldSchutt,
                    punkte,
                    k: 0,
                    n,
                    rMin,
                    ankerX,
                    ankerZ,
                    hMax: -Infinity,
                    daten: new Float32Array(n * 4),
                    saison,
                };
            })
            .catch(() => {
                if (this.state.feldPass === fp && fp.gen === gen) fp.flug = false;
            });
    }

    // Ist die Saison seit dem Bild des Feldes gewandert (je Kanal > `FERN_FARBE.saisonDrift`)? Ohne Bild nie.
    _feldSaisonDrift(fp) {
        if (!fp.saison || fp.farbJob || fp.flug) return false;
        const jetzt = this._fernSaison(this._feldSaisonTmp || (this._feldSaisonTmp = { r: 1, g: 1, b: 1 }));
        const d = AnazhRealm.FERN_FARBE.saisonDrift;
        return (
            Math.abs(jetzt.r - fp.saison.r) > d ||
            Math.abs(jetzt.g - fp.saison.g) > d ||
            Math.abs(jetzt.b - fp.saison.b) > d
        );
    }

    // Der Farb-Job des Feld-Malers: Texel durch die EINE Fern-Farbe (`_fernFarbeAt`) bis zur Frist `frist` des
    // Fern-Farb-Budgets (mindestens `mindest`), dann steht das neue Feld (Textur, Uniforms, Anker) und das Panorama
    // backt. Liefert die gemalten Texel. Die feste Zahl (768 je Takt) kostete auf jedem Holz dieselben Texel.
    _feldPassFaerben(fp, frist, mindest) {
        const job = fp.farbJob;
        if (!job) return 0;
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        const f = [0, 0, 0];
        const k0 = job.k;
        let ende = job.n;
        for (let k = job.k; k < ende; k++) {
            // die Masche des Texels (`_fernFarbeMasche`): Azimut-Breite am Radius, die radiale Zeile des Felds
            const P = AnazhRealm.FELD_PASS;
            const px = job.punkte[k * 2];
            const pz = job.punkte[k * 2 + 1];
            const nass = job.nass || (job.nass = { y: 0, spiegel: 0 });
            const wet = this._fernNass(px, pz, job.werte[k], wl, nass);
            const y = wet ? nass.spiegel : nass.y;
            const fuss = job.fuss || (job.fuss = { ax: job.ankerX, az: job.ankerZ, ht: 0, hr: 0 });
            fuss.ht = (Math.PI * Math.hypot(px - job.ankerX, pz - job.ankerZ)) / P.az;
            fuss.hr =
                (P.rMaxM - AnazhRealm.FERN_RING.schalen[AnazhRealm.FERN_RING.schalen.length - 1].aussen) / (2 * P.rad);
            this._fernFarbeAt(px, y, pz, wet, f, job.saison, fuss, job.schutt[k]);
            job.daten[k * 4] = y;
            job.daten[k * 4 + 1] = f[0];
            job.daten[k * 4 + 2] = f[1];
            job.daten[k * 4 + 3] = f[2];
            if (y > job.hMax) job.hMax = y;
            const n = k + 1 - k0;
            if ((n & 15) === 0 && n >= mindest && performance.now() > frist) ende = k + 1;
        }
        job.k = ende;
        if (job.k < job.n) return ende - k0;
        fp.farbJob = null;
        fp.daten.set(job.daten);
        fp.tex.needsUpdate = true;
        fp.U.rMin.value = job.rMin;
        fp.U.hMax.value = job.hMax + 5;
        fp.anchorX = job.ankerX;
        fp.anchorZ = job.ankerZ;
        fp.saison = job.saison;
        fp.laeufe++;
        // SCHATTIERUNGS-PERSISTENZ: sichtbar wird der Pass erst mit gebackenem Panorama (_feldPanoramaMal setzt
        // visible) — das Fragment liest NUR noch das Panorama, nie das rohe Feld.
        this._feldPanoramaMal(fp);
        return ende - k0;
    }
}
