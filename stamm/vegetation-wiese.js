class AnazhRealm_vegetation_wiese {
    // ===== ATLAS · Vegetation/wiese — Nah-Wiese · Nah-Streu · Affinität · Boden-Material =====
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
    // Raster `understory.grassStep` in Welt-Koordinaten, Jitter ±0,34, Wurf gegen die Bodenschicht des Kerns
    // (terrain:groundCover, das Labor pflanzt danach) mit den Welt-Feldern (das Licht der stehenden
    // Kronen `_bodenLichtFeld`, Feuchte, Hang wie der Strauch-Teppich, Pfad dünnt) × dem Grün-Kanal der Boden-Karte (Büschel nur, wo
    // die Boden-Funktion Wiese zeichnet). Skala Studio: (0,7 + w·0,7) · (m > 0,8 ? 1,45 : 1), zwei Vorlagen. Jedes Büschel
    // trägt den Tint des Kerns (terrain:wiesenTint, `f`: der Faktor je Kanal, die Instanz-Farbe der Senke) — W1.
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
        const licht = this._bodenLichtFeld(x0 - 0.34, z0 - 0.34, x0 + NW.kachel + 0.34, z0 + NW.kachel + 0.34);
        const GC =
            AnazhRealm.Gesetz("terrain:groundCover", null) || AnazhRealm._kernPflichtBruch("terrain:groundCover");
        const WT = AnazhRealm.Gesetz("terrain:wiesenTint", null) || AnazhRealm._kernPflichtBruch("terrain:wiesenTint");
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
                // das Licht der STEHENDEN Kronen (dasselbe Register wie die Laub-Streu): in der Mitte einer Krone 0,43, an
                // ihrer Kante 0,67 — dort wächst die Narbe nach dem Labor-Gesetz auf 52 % bzw. 81 %
                const L = licht(x, z);
                const hang = this._slopeAt(x, z, boden);
                const rk = cl((hang - GS.lo) / (GS.hi - GS.lo));
                const pfad = this._pfadFeldAt(x, z, y);
                // der Pfad dünnt über sein Welt-Feld (der Labor-Abstand `td` zum Studio-Pfad trägt hier nicht)
                const p = GC(L, m, rk, Infinity).grass * (1 - pfad * 0.92) * gruen;
                if (wurf >= p) continue;
                const f = WT(x, z, L, m, [1, 1, 1], 0);
                out.push({ x, y, z, s: sk * (m > 0.8 ? 1.45 : 1), rot, vorlage, ordnung, f });
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
        if (this._standRuht("nahWiese", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M }, "karte"))
            return 0;
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
    // der Sicht-Satz an) und sein Tint (`farben`, n×3), die Hysterese der Stufe (`l1`) und die Kachel-Kugel ohne
    // Büschel-Radius (grober Cull vor dem Büschel-Test).
    _nahWieseKachelDaten(tx, tz, bueschel) {
        const K = AnazhRealm.NAH_WIESE.kachel;
        const n = bueschel.length;
        const basis = new Float32Array(n * 16);
        const farben = new Float32Array(n * 3);
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
            farben.set(b.f, i * 3);
            if (b.y < y0) y0 = b.y;
            if (b.y > y1) y1 = b.y;
            if (b.s > sMax) sMax = b.s;
        }
        return {
            bueschel,
            basis,
            farben,
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
                anders: false,
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
        // Jede Senke hebt ihre Version nur, wenn sich ihr Inhalt änderte (K71): eine neue Lage des Passes, die dieselben
        // Büschel wählt (der Spieler atmet in der Third-Sicht), schreibt dieselben Matrizen — eine gehobene Version frischte
        // jede Senke voll auf und lud ihren Puffer neu (an der Wiese in Ruhe vier Senken je vierten Frame).
        for (const a of nw.senken.values()) {
            a.anzahl = 0;
            a.anders = false;
        }
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
                    if (a.anzahl >= a.kap) {
                        this._senkeMesh(a, Math.ceil(a.kap * 1.5), this.state.scene);
                        a.anders = true;
                    }
                    const e = mw.multiplyMatrices(m4, a.lokal).elements;
                    const arr = a.mesh.instanceMatrix.array;
                    const o = a.anzahl * 16;
                    for (let j = 0; j < 16; j++) {
                        const alt = arr[o + j];
                        arr[o + j] = e[j];
                        if (arr[o + j] !== alt) a.anders = true;
                    }
                    // der Tint des Büschels (W1): ein anderer Tint im Slot ist ein anderes Büschel, also eine andere Matrix
                    const ca = a.mesh.instanceColor.array;
                    ca[a.anzahl * 3] = k.farben[i * 3];
                    ca[a.anzahl * 3 + 1] = k.farben[i * 3 + 1];
                    ca[a.anzahl * 3 + 2] = k.farben[i * 3 + 2];
                    a.anzahl++;
                }
            }
        }
        // Der Vergleich liest das CPU-Array als Spiegel der GPU: ein offener Bereich (geschrieben, noch nicht hochgeladen —
        // r184 leert die Bereiche erst nach dem Upload) fällt darum nie, der neue umfasst ihn (sonst lüde ein späterer Pass mit
        // denselben Bytes in den oberen Slots nichts, und die GPU hielte die Matrizen von vorher).
        for (const a of nw.senken.values()) {
            if (a.anders) {
                const im = a.mesh.instanceMatrix;
                let ende = a.anzahl * 16;
                for (const r of im.updateRanges) if (r.start + r.count > ende) ende = r.start + r.count;
                im.clearUpdateRanges();
                if (ende) im.addUpdateRange(0, ende);
                im.needsUpdate = true;
                // der Tint wandert im Gleichschritt mit der Matrix (je Slot 3 statt 16 Werte) — nur der Bereich, nie die Kapazität
                const ic = a.mesh.instanceColor;
                ic.clearUpdateRanges();
                if (ende) ic.addUpdateRange(0, (ende / 16) * 3);
                ic.needsUpdate = true;
            }
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

    // Die Pflanzen einer Kachel nach dem Boden-Gesetz: je Zelle (NAH_STREU.zelle) EINE Umwelt-Messung (das Licht der
    // stehenden Kronen `_bodenLichtFeld` · Feuchte · Höhe über dem Wasser · Steinigkeit · Hang, die Welt-Leser), je Art λ = dichte · Zellfläche ·
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
        const licht = this._bodenLichtFeld(tx * K, tz * K, (tx + 1) * K, (tz + 1) * K);
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
                    licht: licht(x, z), // das Licht der stehenden Kronen (Labor: `lightAt` der Bäume)
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
            mat: wiegt ? this._foundryTreeMaterial(u.foundryKind, u.foundryMp, true, null, u.krone === true) : lf.mat,
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
                attr: a.wiegt ? AnazhRealm.STREU_SATZ_ATTR : AnazhRealm.STREU_FEST_ATTR,
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
        // der Tint je Büschel (W1, terrain:wiesenTint): r184 multipliziert die Instanz-Farbe im Farb-Pfad, der Zeichner reicht
        // sie durch; sie fällt mit der Senke (`_instanzAbschied`)
        m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(kap * 3).fill(1), 3);
        if (alt) {
            m.instanceMatrix.array.set(alt.instanceMatrix.array.subarray(0, a.anzahl * 16));
            m.instanceColor.array.set(alt.instanceColor.array.subarray(0, a.anzahl * 3));
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
        if (this._standRuht("nahStreu", 1, { pos: st.camera.position, rand: AnazhRealm.STAND_RAND_M }, "karte"))
            return 0;
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
    // `frist` (optional, der Lade-Takt): baut, solange die Frist offen ist — mindestens einen.
    _tickPendingGrass(maxPerFrame = 1, frist) {
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
            if (built > 0 && Number.isFinite(frist) && performance.now() > frist) break;
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

    // Affinity = wie stark resonieren die Compound-Tags eines Bauplans mit
    // dem Welt-Feld an Position (x, z)? Dot-Product über die 4 Achsen des
    // Welt-Feldes. Resultat 0..1 (sum / 4 da MAX-aggregierte Tags ebenfalls
    // 0..1 nach computeCompoundTags + Felder 0..1). Bauplan-Tags > 1 bei
    // räumlicher Verstärkung würden das überschreiten — wir clampen final.
    spawnAffinityForBlueprint(name, x, z, feuchte) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return 0;
        const world = this.worldFieldAt(x, z);
        const tags = this.computeCompoundTags(bp);
        // Fünfte Stimme: feuchte resoniert mit lebendig (Bäume folgen Flüssen; brennbar resoniert nicht).
        // Der Populator reicht feuchte je Sample (kein Hot-Path-Bucket-Walk); fehlt sie, misst der seltene
        // Direkt-Aufrufer (Diag/UI) selbst. Legacy-Welten: _feuchteAt → 0.
        return this._affinitaet(tags, world, Number.isFinite(feuchte) ? feuchte : this._feuchteAt(x, z));
    }

    // DIE AFFINITÄT (die EINE Formel): Bauplan-Tags × Welt-Feld an einer Stelle × Feuchte. Der Populator rechnet das
    // Feld je Sample EINMAL und die Tags je Chunk EINMAL (`_vegetationSampleSpawn`) — bis Welle K rechnete jeder der
    // zwölf Kandidaten je Sample beides neu (sechs Rausch-Abfragen, alle Teile des Bauplans).
    _affinitaet(tags, world, fw) {
        if (!tags) return 0;
        let score = 0;
        // Vier Achsen × Tag-Wert. Wenn eine Welt-Achse hoch und der Bauplan
        // dort Material-Tag-Wert hoch hat → Resonanz.
        score += world.lebendig * (tags.lebendig || 0);
        score += world.dichte * (tags.dichte || 0);
        score += world.glut * (tags.brennbar || 0); // glut → brennbar (Material-Achse)
        score += world.magieleitung * (tags.magieleitung || 0);
        score += fw * (tags.lebendig || 0) * AnazhRealm.FEUCHTE.affinitaetGewicht;
        return Math.max(0, Math.min(1, score / 4));
    }

    // Der Boden ist Materie: liest DASSELBE Feld wie der Terrain-Shader (`worldFieldAt`); die dominante
    // der vier Achsen nennt das Material an (x,z). Keine Biom-Tabelle — was der Spieler SIEHT, bekommt
    // er beim Graben.
    _terrainMaterialAt(x, z, y) {
        const f = typeof this.worldFieldAt === "function" ? this.worldFieldAt(x, z) : null;
        if (!f) return "stein";
        // Γ1 (genese-plan, Lesart Boden): die FEUCHTE hebt die erde-Achse —
        // Ufer und Niederungen sind grabbar weich (erde schlägt stein), die
        // Farbe, die der Spieler sieht, bleibt das Material, das er bekommt.
        const fw = this._genVersion() >= 2 ? this._feuchteAt(x, z) : 0;
        const axes = [
            [(f.lebendig || 0) + fw * AnazhRealm.FEUCHTE.erdeGewicht, "erde"],
            [f.dichte || 0, "stein"],
            [f.glut || 0, "glut"],
            [f.magieleitung || 0, "quarz"],
        ];
        let best = axes[0];
        for (let i = 1; i < axes.length; i++) {
            if (axes[i][0] > best[0]) best = axes[i];
        }
        // STRATA: mit y schichtet das Material nach Tiefe — mehr als STRATA_STEIN_DEPTH unter `_voxelSurfaceY`
        // wird es "stein", auch wenn die erde-Achse gewinnt (erde/glut/quarz nur am obersten Band).
        // Ohne y bleibt das Verhalten bit-identisch.
        if (typeof y === "number" && Number.isFinite(y)) {
            const surfY = this._voxelSurfaceY ? this._voxelSurfaceY(x, z) : null;
            if (Number.isFinite(surfY)) {
                const depth = surfY - y;
                if (depth > AnazhRealm.STRATA_STEIN_DEPTH) {
                    // IRON-BANDS: tief (> IRON_BANDS.minDepth) und dichte-haltig (> dichteFloor) kann eine vertikale
                    // Eisen-Ader den Stein ersetzen.
                    if (depth > AnazhRealm.IRON_BANDS.minDepth && (f.dichte || 0) > AnazhRealm.IRON_BANDS.dichteFloor) {
                        const ironAder = this._eisenAderAt(x, z);
                        if (ironAder > AnazhRealm.IRON_BANDS.threshold) {
                            return "eisen";
                        }
                    }
                    return "stein";
                }
            }
        }
        return best[1];
    }

    // Ader-Sampler: Single-Octave-Ridge (1−|noise|)² auf (x,z) → vertikale Säulen in 3D, bewusst nicht
    // rotiert, [0,1]. Eigener Seed-Suffix `-iron-bands` (Γ5: re-rollt keinen anderen Welt-Stream).
    _eisenAderAt(x, z) {
        if (!this._ironBandsNoise) {
            const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._ironBandsNoise = new SimplexNoise(seed + "-iron-bands");
        }
        const n = this._ironBandsNoise;
        const SCALE = AnazhRealm.IRON_BANDS.scale;
        const v = n.noise2D(x * SCALE, z * SCALE);
        const nv = 1 - Math.abs(v);
        return nv * nv; // [0, 1] mit Konzentration an Graten
    }

    // Natur-Clumping: EIN seed-deterministisches Klump-Rauschen, zwei Leser auf zwei Skalen — Gras/
    // Büsche λ~28 m (Dickicht ↔ Lichtung), Bäume λ~170 m (Wald ↔ offen). clamp(1 + amp·noise, lo, hi)
    // ist mittelwert-neutral (≈1): die Gesamt-Dichte bleibt, nur die Verteilung ändert sich. Main-only
    // Deko, seed-gebunden (alle Peers gleich); tag-neutral (reiner chance-Skalar, diag-arch-tags wacht).
    _clumpAt(x, z, freq) {
        if (!this._clumpNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":clump";
            this._clumpNoise = new SimplexNoise(seed);
        }
        return this._clumpNoise.noise2D(x * freq, z * freq);
    }

    // STAND-Klumpung je Zweck (phytogenesis-standDensity): Γ5-Suffix ':forest' für Bäume λ~170 m,
    // ':meadow' für Unterwuchs λ~40 m. Main-only Deko, seed-gebunden (alle Peers gleich), tag-neutral
    // (reiner chance-Skalar, diag-arch-tags wacht).
    _placementStandAt(x, z, purpose) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const suffix = purpose === "meadow" ? ":meadow" : ":forest";
        if (!this._placementNoise) this._placementNoise = {};
        if (!this._placementNoise[suffix]) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + suffix;
            this._placementNoise[suffix] = new SimplexNoise(seed);
        }
        const freq = purpose === "meadow" ? P.meadowFreq : P.forestFreq;
        return this._placementNoise[suffix].noise2D(x * freq, z * freq);
    }

    // DIE EINE Quelle für „wo wächst wie viel": dicht wo feucht + flach + niedrig, licht an Steilhang +
    // Höhe. Achsen: (1) STAND-Klump `_placementStandAt` (mittelwert-neutral) · (2) SLOPE `_slopeAt`
    // (flach favorisiert, auf |∇h| kalibriert) · (3) FEUCHTE `_feuchteAt` (nass → dichter) · (4) HÖHE
    // über Terrain-Basis (hoch → licht). Perf: × `_foliageDensityScale` (headless 1 = voll).
    _placementDensityFactor(x, z, surfaceY, purpose) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // (1) STAND-Klumpung — Wald ↔ Lichtung / Dickicht ↔ magere Stelle.
        const stand = this._placementStandAt(x, z, purpose); // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        // (2) SLOPE-Gate — flach dicht, Steilwand kahl (die Vorlagen-Flach-Präferenz).
        const slope = typeof this._slopeAt === "function" ? this._slopeAt(x, z) : 0;
        const slopeF = 1 - ss(P.slopeLo, P.slopeHi, slope);
        // (3) FEUCHTE-Antrieb — nass → dichter, trocken → licht.
        let wet = typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, surfaceY) : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        // (4) HÖHE über Terrain-Basis — die Höhe lichtet (Vorlagen-`dry`).
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH);
        let f = clump * slopeF * wetF * highF;
        // (5) PERF — der EINE Qualitäts-Regler; headless (Null-Renderer) → 1 (voll).
        const fd = this.state && this.state._foliageDensityScale != null ? this.state._foliageDensityScale : 1;
        f *= fd;
        return f < 0 ? 0 : f;
    }

    // Das Kronenlicht-Feld der PLATZIERUNG, [0,1] (1 = Lichtung, →0 geschlossen): wo Kronen stehen DÜRFEN — der
    // Strauch-Teppich des Chunk-Streuers liest es (er wird mit dem Wald gepflanzt, vor dessen Kronen); das Licht der
    // STEHENDEN Kronen, das Nah-Wiese und Nah-Streu lesen, ist `_bodenLichtFeld`. Liest dieselben Treiber,
    // aus denen der Wald gepflanzt wird (`_placementStandAt("forest")` × wet × Höhe), statt Baum-
    // Positionen (der Wald streamt chunkweise); ohne Slope/Perf (Ökologie ist perf-unabhängig). Rein +
    // seed-gebunden (Γ5); `wetHint` spart den `_feuchteAt`-Zweitaufruf.
    _canopyLightAt(x, z, surfaceY, wetHint) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const U = AnazhRealm.UNDERGROWTH;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // Kronen-Deckung ≈ die P1-Wald-Dichte (DERSELBE forestStand × wet × Höhe wie
        // `_placementDensityFactor("forest")`, aber ohne Slope/Perf).
        const stand = typeof this._placementStandAt === "function" ? this._placementStandAt(x, z, "forest") : 0; // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        let wet = Number.isFinite(wetHint)
            ? wetHint
            : typeof this._feuchteAt === "function"
              ? this._feuchteAt(x, z, surfaceY)
              : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH); // hoch → weniger Kronen → mehr Bodenlicht
        let cover = clump * wetF * highF;
        if (cover < 0) cover = 0;
        const L = Math.exp(-cover * U.canopyK);
        return L < 0 ? 0 : L > 1 ? 1 : L;
    }

    // ─── DER WALD-GENERATOR (die phytogenesis-plantForest-Ökologie, übersetzt) ───
    // Variabel-radius Poisson-Disc (Kronen-Schüchternheit) + Arten-Nische + reverse-J-Größe + bimodaler
    // Dichte-Gradient + Mammut-Nische. ZELL-DETERMINISTISCH statt globaler Poisson: jede FOREST.cell-Zelle
    // trägt Darts (mulberry32 aus Zelle × Seed), ein Dart steht gegen die ±2-Nachbarzellen per reiner Wahl
    // (prio-Maximum im Konflikt-Radius, Positions-Tiebreak) → reihenfolge-unabhängig (Chunk A→B == B→A).

    // Die geteilte Wald-Noise (this._x, wie `_clumpNoise` — seed-gebunden, kein Snapshot; der Wald-Faden zieht dieselbe
    // Noise aus demselben Seed, `waldCtx` in voxel-worker.js, gate:worker-dichte Teil W). EIN Instanz, an verschiedenen Frequenzen/Offsets
    // gelesen (die Vorlage sampelt ihre `fbm2` genauso mehrkanalig). 2-Oktav-fbm → [0,1].
    _forestFbm(px, pz) {
        if (!this._forestNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":forest";
            this._forestNoise = new SimplexNoise(seed);
        }
        const n = this._forestNoise;
        const a = (n.noise2D(px, pz) + 1) * 0.5;
        const b = (n.noise2D(px * 2.7 + 11.3, pz * 2.7 - 5.9) + 1) * 0.5;
        return a * 0.65 + b * 0.35;
    }

    // ─── PLACE-POLICIES: place { mode, layer?, step?, density?, affinity?, siteTag?, seedSuffix? } ───
    // DIE EINE Auflösung: fx.place im Rezept FÜHRT, sonst KIND_POLICY (placeExtra "forest" → "forest",
    // sonst "none"). Unbekannte Felder reisen unangetastet mit; unbekannter/fehlender mode → GESCHLOSSEN
    // "none". Nicht-Buch-Arten (Basis-Nischen, Understory, Fels/Kiesel) leben bewusst außerhalb.
    _placePolicyFor(rec, kindPolicy) {
        const pol = kindPolicy !== undefined ? kindPolicy : rec && AnazhRealm.KIND_POLICY[rec.kind];
        const src = rec && rec.fx && rec.fx.place && typeof rec.fx.place === "object" ? rec.fx.place : null;
        if (src) {
            const out = Object.assign({}, src); // must-preserve: unbekannte Felder reisen unangetastet mit
            out.mode = AnazhRealm.PLACE_MODES[src.mode] === 1 ? src.mode : "none"; // fail-closed
            return out;
        }
        return { mode: pol && pol.placeExtra === "forest" ? "forest" : "none" };
    }
    // DER PLACE-DISPATCH-CHOKEPOINT: place.mode → Kanal-Name oder null (kein Worldgen); er BENENNT nur,
    // die bestehenden Systeme bauen. forest → Wald-Nische (_forestExtraSpecies → planForestCell; Auflösung
    // VOR den Darts, Γ5). scatter → benannt, noch ohne Konsument. hand/none/site → null (siteTag nur als
    // Daten). settlement → `spawnSettlement` (Seed-Stream ":stadt"); Worldgen streut es nicht automatisch.
    _placeDispatch(policy, _ctx) {
        const mode = policy && policy.mode;
        if (mode === "forest") return "forest";
        if (mode === "scatter") return "scatter"; // benannter Kanal — heute ohne Konsument (s. o.)
        if (mode === "settlement") return "settlement"; // N5.7 — deliberater Kanal (spawnSettlement)
        return null;
    }

    // Auto-Arten für den Wald-Generator: alle Wald-fähigen Presets des LIVE-Rezeptbuchs (Place-Auflösung →
    // "forest") ohne historische Nische; Patch-Zentrum + Grundgewicht per Namens-Hash (seed-frei —
    // der Name IST die Identität). Gecacht auf Buch-Identität, sortiert (deterministische Pick-Folge).
    _forestExtraSpecies() {
        const f = this._foundry;
        const book = f && f.recipes;
        if (!book) return [];
        if (this._forestExtraCache && this._forestExtraCacheBook === book) return this._forestExtraCache;
        const BASE = { eiche: 1, fichte: 1, tanne: 1, birke: 1, weide: 1, mammut: 1 };
        const out = [];
        const ids = Object.keys(book).sort();
        for (const id of ids) {
            const rec = book[id];
            // Wald-Fähigkeit aus der EINEN Place-Auflösung + Dispatch-Chokepoint, nie direkt aus placeExtra.
            // Der prefix bleibt Pflicht (fail-closed: ohne Namensregel keine Nische).
            const _pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
            if (!_pol || !_pol.prefix || BASE[id]) continue;
            if (this._placeDispatch(this._placePolicyFor(rec, _pol), { id }) !== "forest") continue;
            let h = 2166136261 >>> 0;
            for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
            out.push({
                species: _pol.prefix + id,
                w0: 0.18, // bescheidenes Grundgewicht — die neue Art mischt sich ein, dominiert nicht
                center: 0.05 + (h % 1000) / 1110, // Patch-Zentrum ∈ [0.05, 0.95] — eigene Haine
            });
        }
        this._forestExtraCache = out;
        this._forestExtraCacheBook = book;
        return out;
    }

    _forestStandDensity(x, z) {
        // „Drähte statt Kopien" (08.07.): die Formel lebt in phyto-core (forestStandDensity —
        // Studio-Modell: Mittel 0.72, Kontrast 1.35, dichte Kerne + gelichtete Säume); hier nur
        // der Draht mit AnazhRealms fbm. Diag-Linsen (diag-forest-*) lesen weiter diese Methode.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestStandDensity === "function")
            return core.forestStandDensity((px, pz) => this._forestFbm(px, pz), x, z);
        return 0;
    }

    // Der Welt-Seed als 32-bit-Int (fnv-1a, gecacht) — treibt die Zell-Hashes → alle
    // Peers/Reloads sehen denselben Wald (Γ5: seed-deterministisch, nie Math.random).
    _forestSeedInt() {
        const s = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        if (this._forestSeedStr === s && this._forestSeedVal != null) return this._forestSeedVal;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        this._forestSeedStr = s;
        this._forestSeedVal = h >>> 0;
        return this._forestSeedVal;
    }

    // Ein deterministischer mulberry32 pro Zelle (Hash aus Zell-Koord × Welt-Seed).
    _forestCellRng(cx, cz, seedInt) {
        // Draht zur EINEN Quelle (phyto-core.forestCellRng) — Diag-Linsen lesen weiter hier.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestCellRng === "function") return core.forestCellRng(cx, cz, seedInt);
        return () => 0;
    }

    // DIE WAHRHEIT DES WALDS (K20): die Darts lesen Boden, Wasser und Feuchte (`_voxelSurfaceY`, `_atlasWaterLevelAt`,
    // `_feuchteAt` — Erosion, Flüsse und Seen der Hydro-Kachel ihres Orts). Vor dem Worldgen (keine Heimat-Hydrosphäre)
    // gibt es sie nicht: jede Antwort des Walds ist dann vorläufig und wird nie gemerkt (`_forestCellDarts`), die Gestalt
    // des Orts wartet (`_foundryGestaltFor` → null, wie auf ein kaltes Buch).
    _forestGesetzWahr() {
        const h = this.state.hydrosphere;
        return !!(h && h.ready);
    }

    // DER STAND DES WALD-GESETZES (K20): die Darts sind eine Funktion von Welt-Same, Arten-Satz (die Arten des Buchs,
    // `_forestExtraSpecies`) und Hydrosphäre. Ein neuer Same, ein neues Buch, eine neue Hydrosphäre (der Welt-Regen) oder neue
    // Arten (`_foundryAutoRegisterSpecies` leert das Gedächtnis) legen ein neues Dart-Gedächtnis an — seine Nummer IST der
    // Stand. Wer eine Antwort des Walds merkt (die Gestalt des Orts `_foundryGestaltFor`, die Streu-Gestalt
    // `_scatterFoundrySeed`), merkt sie an diesem Stand, nie an der Reihenfolge: der Zweit-Boot fragte den gesetzten Baum,
    // bevor die Wasser-Wahrheit seines Orts stand, und seine Gestalt blieb die eines anderen Walds (A1-Eiche bei −740/−1190:
    // Gestalt 1 statt 2; gate:fernwald E).
    _forestDartStand(seedInt) {
        const buch = this._foundry ? this._foundry.recipes || null : null;
        const hydro = this.state.hydrosphere || null;
        if (
            !this._forestDartMemo ||
            this._forestDartMemoSeed !== seedInt ||
            this._forestDartMemoBuch !== buch ||
            this._forestDartMemoHydro !== hydro
        ) {
            this._forestDartMemo = new Map();
            this._forestDartMemoSeed = seedInt;
            this._forestDartMemoBuch = buch;
            this._forestDartMemoHydro = hydro;
            this._forestDartGen = (this._forestDartGen || 0) + 1;
        }
        return this._forestDartGen;
    }

    // DER WALD FÄLLT AM ORT (K69, Lehre 25): legt ein Ort seinen Erdbau über die Flächen im Kasten x0…x1 · z0…z1, ändern sich
    // die Darts nur in den Zellen, die der Kasten samt Böschung (`ERDBAU.reichweiteM`, dazu die Hang-Probe von 2 m) oder samt der
    // größten Krone (`KRONE_MAX_M`: `ortFrei` fragt die Krone gegen die Fläche) berührt. Nur sie fallen aus dem Dart-Gedächtnis
    // des Stands (der Stand bleibt), mit ihnen das Urteil jedes Darts, der sie als Nachbarn liest (±2 Zellen, `_forestDartSteht`),
    // die Freistand-Antwort jedes Orts, der diese Urteile liest (±4 Zellen darum, `_forestStehtFrei`), und die Gestalt des Orts
    // dort (`_ortSameFaellt`). Bis K69 fiel das Gedächtnis der ganzen Welt (`_forestDartMemo = null`, ein neuer Stand) — und mit
    // ihm jede Gestalt jedes Orts. → die Zahl der gefallenen Zellen.
    _forestDartsFallen(x0, z0, x1, z1) {
        const memo = this._forestDartMemo;
        if (!memo || !memo.size) return 0;
        const C = AnazhRealm.FOREST.cell;
        const R = Math.max(globalThis.__gelaendeCore.ERDBAU.reichweiteM + 2, AnazhRealm.KRONE_MAX_M);
        const ga = Math.floor((x0 - R) / C);
        const gb = Math.floor((x1 + R) / C);
        const ha = Math.floor((z0 - R) / C);
        const hb = Math.floor((z1 + R) / C);
        let n = 0;
        for (let gx = ga; gx <= gb; gx++) for (let gz = ha; gz <= hb; gz++) if (memo.delete(gx + "," + gz)) n++;
        const steht = this._forestStehtMemo;
        if (steht)
            for (let gx = ga - 2; gx <= gb + 2; gx++)
                for (let gz = ha - 2; gz <= hb + 2; gz++) {
                    const d = memo.get(gx + "," + gz);
                    if (d) for (const o of d) steht.delete(o);
                }
        const fm = this._freistandMemo;
        if (fm && fm.size && this._freistandMemoVon === memo)
            for (const k of fm.keys()) {
                const i = k.indexOf(",");
                const gx = Math.floor(Number(k.slice(0, i)) / C);
                const gz = Math.floor(Number(k.slice(i + 1, k.indexOf(",", i + 1))) / C);
                if (gx >= ga - 6 && gx <= gb + 6 && gz >= ha - 6 && gz <= hb + 6) fm.delete(k);
            }
        this._ortSameFaellt((ga - 6) * C, (ha - 6) * C, (gb + 7) * C, (hb + 7) * C);
        return n;
    }

    // BORN-Darts einer Zelle, reine Funktion von (cx,cz,seed): standDensity-Wurf → Boden/Wasser → Slope →
    // Arten-Nische → reverse-J-Größe → Mammut. Nur geborene Darts treten in die Kronen-Schüchternheit ein.
    _forestCellDarts(cx, cz, seedInt) {
        // Zell-Memo über Aufrufe: jeder Chunk liest ±2 Rand-Zellen (~4× Redundanz), und die Dart-Generierung
        // (`_voxelSurfaceY`-Scan + Slope + Feuchte) dominiert die Plant-Zeit. Seed-gebunden (Welt-Wechsel
        // leert), bounded (voll → clear); Instanz-Feld, kein state/Snapshot. Die Wahrheit zuerst (`_forestGesetzWahr`): wie
        // der Chunk-Bau (`_acquireVoxelChunkBuild`) steht die Hydro-Kachel der Zelle vor der Frage; vor dem Worldgen ist die
        // Antwort vorläufig (`vorlaeufig`) und kein Gedächtnis.
        const memoKey = cx + "," + cz;
        let memo = null;
        if (this._forestGesetzWahr()) {
            this._forestDartStand(seedInt);
            memo = this._forestDartMemo;
            const hit = memo.get(memoKey);
            if (hit) return hit;
            const C = AnazhRealm.FOREST.cell;
            this._ensureHydroTilesAround((cx + 0.5) * C, (cz + 0.5) * C, C);
        }
        // Die Pflanz-Logik lebt EINMAL in phyto-core (planForestCell); hier nur Memo + Welt-Reads als ctx-
        // Funktionen (Oberfläche · Wasser · Slope · Feuchte · fbm). Ohne Kern → leerer Wald.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        // Das Wasser eines Darts ist das Gesetz über SEINEM Boden (`_atlasWaterLevelAt`, die Hälfte von `_landAt`, aus der
        // das Bild wird): der Plan bleibt eine reine Funktion von Zelle und Same (jeder Peer, jede Lade-Reihenfolge derselbe
        // Wald) — das gezeichnete Wasser fragt die Natur-Wand beim Setzen (`_naturWand` → `_landAt`). Der Kern liest erst die
        // Oberfläche, dann das Wasser derselben Stelle — der Boden reist mit. Bis Schau-2 (09.10.) las der Wald den Bezug
        // der Ufer-Bänder (`_waterLevelAt`).
        let bodenX = NaN;
        let bodenZ = NaN;
        let bodenY = null;
        const out =
            core && typeof core.planForestCell === "function"
                ? core.planForestCell(cx, cz, seedInt, {
                      F: AnazhRealm.FOREST,
                      baseH: (this.state && this.state.terrainBaseHeight) || 0,
                      extras: this._forestExtraSpecies(),
                      fbm: (px, pz) => this._forestFbm(px, pz),
                      surfaceYAt: (x, z) => {
                          bodenX = x;
                          bodenZ = z;
                          bodenY = this._voxelSurfaceY(x, z);
                          return bodenY;
                      },
                      waterYAt: (x, z) =>
                          this._atlasWaterLevelAt(
                              x,
                              z,
                              x === bodenX && z === bodenZ ? bodenY : this._voxelSurfaceY(x, z)
                          ),
                      slopeAt: (x, z) =>
                          typeof this._slopeAt === "function"
                              ? this._slopeAt(x, z, (px, pz) => this.getTerrainHeightAt(px, pz), 2)
                              : 0,
                      feuchteAt: (x, z, sy) => (typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, sy) : 0),
                      // der Ort vor dem Wald (K10): keine Krone über dem Grund eines Orts (`_ortFrei`, der Erdbau)
                      ortFrei: (x, z, T) => this._ortFrei(x, z, T),
                  })
                : [];
        if (!memo) {
            out.vorlaeufig = true;
            return out;
        }
        if (memo.size > 8192) memo.clear(); // bounded — die Front ist lokal, ein Clear kostet nur Re-Compute
        memo.set(memoKey, out);
        return out;
    }

    // DER WALD PLANT IM TAKT (K69, Lehre 14 + 25): eine frische Wald-Zelle zu planen kostet 1–3 ms (`planForestCell`, ~160
    // Sichthöhen); die Gestalt EINES Baums in frischem Wald fragt bis zu 13 × 13 Zellen (der Freistand ±4, das Urteil jedes
    // Nachbarn ±2: `WALD_PLAN.reich`). Bis K69 plante der erste Frager am Stück — beim Gang ins Dorf die Ausstattung des Dorfs
    // 366 Zellen in EINER Aufgabe neben dem Takt (551 ms, Null-Renderer), ein Takt 113 Zellen (245 ms). Jetzt fragt die
    // Gestalt des Orts (`_ortGestaltSame`) hier: steht der Plan um (x, z), gilt ihr Urteil sofort; fehlen Zellen, bestellt sie
    // sie in der Schlange des Walds (`_tickWaldPlan`) und wartet — wie auf ein kaltes Buch, so warten ihre Leser schon (die
    // Hülle, die Streu, die Promotion, die Karte). Die Frage merkt ihre fehlenden Zellen je Zelle des Orts: jede weitere
    // kostet einen Blick, bis die letzte steht. Fiel eine bestellte Zelle aus der Schlange (ein neuer Stand, ein Erdbau),
    // bestellt die Frage neu.
    _waldPlanSteht(x, z) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const C = AnazhRealm.FOREST.cell;
        const gx = Math.floor(x / C);
        const gz = Math.floor(z / C);
        const bk = gx + "," + gz;
        if (!this._waldWarten || this._waldWarten.size > 4096) this._waldWarten = new Map();
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let fehlt = this._waldWarten.get(bk);
        if (fehlt) {
            while (fehlt.length && memo.has(fehlt[fehlt.length - 1])) fehlt.pop();
            if (fehlt.length) {
                if (!Q.has(fehlt[fehlt.length - 1]))
                    for (const k of fehlt) {
                        if (memo.has(k) || Q.has(k)) continue;
                        const i = k.indexOf(",");
                        Q.set(k, [Number(k.slice(0, i)), Number(k.slice(i + 1))]);
                    }
                return false;
            }
            this._waldWarten.delete(bk);
        }
        const R = AnazhRealm.WALD_PLAN.reich;
        fehlt = [];
        if (this._waldPlanKasten(gx - R, gz - R, gx + R, gz + R, fehlt)) return true;
        this._waldWarten.set(bk, fehlt);
        return false;
    }

    // Der Plan des Walds im Zell-Kasten ga…gb · ha…hb (inklusiv): true = jede Zelle steht im Dart-Gedächtnis des Stands;
    // sonst bestellt er die fehlenden in der Schlange des Walds (`_tickWaldPlan`), merkt sie in `fehlt` (optional) → false.
    _waldPlanKasten(ga, ha, gb, hb, fehlt) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let steht = true;
        for (let gx = ga; gx <= gb; gx++)
            for (let gz = ha; gz <= hb; gz++) {
                const k = gx + "," + gz;
                if (memo.has(k)) continue;
                steht = false;
                if (fehlt) fehlt.push(k);
                if (!Q.has(k)) Q.set(k, [gx, gz]);
            }
        return steht;
    }

    // Der Zell-Kasten, den der Pflanz-Gang eines Chunks liest: seine Zellen samt ±2 (das Urteil jedes Darts).
    _waldPflanzKasten(cx, cz) {
        const { span } = this._voxelChunkConfig();
        const C = AnazhRealm.FOREST.cell;
        const ox = cx * span;
        const oz = cz * span;
        return [
            Math.floor(ox / C) - 2,
            Math.floor(oz / C) - 2,
            Math.floor((ox + span) / C) + 2,
            Math.floor((oz + span) / C) + 2,
        ];
    }

    // DIE SCHLANGE DES WALDS (K69): der Takt-Planer (Job `waldPlan`, Welt-Substanz) nimmt die bestellten Zellen
    // (`_waldPlanSteht`) nah zuerst. IHR RECHNER IST DER WALD-FADEN (K60-3, `_waldFadenSchicken`): wo ein Voxel-Faden lebt,
    // plant der Haupt-Faden keine Zelle der Schlange — sie reisen in Aufträgen an den Wald-Faden und landen im Gedächtnis
    // (`_waldDartsAn`). Ohne Faden plant der Takt je Takt höchstens `WALD_PLAN.ms` (mindestens eine Zelle — nie verhungert;
    // der Lade-Takt gibt sein ganzes Budget). Bis zur Vereinigung K60-4 bestellte die Streu ihre Darts an der Schlange
    // vorbei beim Faden (`_waldDartsBestellen`), und jeder andere Leser plante im Haupt-Faden: zwei Wege an EIN Gedächtnis.
    // Ihre Regung (`_waldPlanGeplant`) weckt die Fege-Takte, deren Bäume auf ihre Zellen warten. → die Zahl der Zellen.
    _tickWaldPlan(ms) {
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        const P = this._waldPflanzWarten;
        if (!Q.size && !(P && P.size)) return 0;
        if (!this._forestGesetzWahr()) return 0;
        const seedInt = this._forestSeedInt();
        const t0 = performance.now();
        let n = 0;
        if (this._waldFadenLebt()) this._waldFadenSchicken(seedInt);
        else {
            this._forestDartStand(seedInt);
            const liste = this._waldPlanListe(null);
            const budget = Number.isFinite(ms) ? ms : Infinity;
            const frist = this._ladeTakt() ? budget : Math.min(budget, AnazhRealm.WALD_PLAN.ms);
            for (const [, k, g] of liste) {
                if (n > 0 && performance.now() - t0 >= frist) break;
                this._forestCellDarts(g[0], g[1], seedInt);
                Q.delete(k);
                n++;
            }
        }
        // die wartenden Pflanz-Gänge (`_forestPlantChunk`): steht der Plan ihres Chunks, pflanzt die Schlange ihn jetzt — auch
        // wenn sein Chunk inzwischen ging: die Pflanzung geschieht EINMAL je Chunk (`voxelPopulatedChunks` fällt nie), ein
        // verworfener Gang ließ seinen Wald für immer leer (K69-2: die Klang-Linse fand am Waldort 5 Bäume ≤ 15 m)
        if (P && P.size)
            for (const key of [...P]) {
                const i = key.indexOf(",");
                const cx = Number(key.slice(0, i));
                const cz = Number(key.slice(i + 1));
                if (this._waldPlanKasten(...this._waldPflanzKasten(cx, cz))) this._forestPlantChunk(cx, cz);
            }
        if (n > 0) this._waldPlanGeplant(t0);
        return n;
    }

    // Die offenen Zellen der Schlange nah zuerst ([d², Schlüssel, [gx, gz]]): was das Gedächtnis schon trägt, fällt aus ihr;
    // was im Flug ist (`flug`, optional), bleibt in ihr, aber nicht in der Liste.
    _waldPlanListe(flug) {
        const Q = this._waldPlanSchlange;
        const memo = this._forestDartMemo;
        const C = AnazhRealm.FOREST.cell;
        const liste = [];
        for (const [k, g] of Q) {
            if (memo.has(k)) Q.delete(k);
            else if (!flug || !flug.has(k)) liste.push([this._spielerD2((g[0] + 0.5) * C, (g[1] + 0.5) * C), k, g]);
        }
        liste.sort((a, b) => a[0] - b[0]);
        return liste;
    }

    // Zellen sind geplant (von welchem Rechner auch immer): die Regung (`_waldPlanRegung`) liest der Stand-Stempel — sie
    // weckt die Fege-Takte, wenn die Schlange leer ist, und solange sie plant, höchstens alle 250 ms.
    // DIE STREU WARTET AUF DEN WALD WIE AUF IHR ASSET (K69-2): eine Streu-Region, deren Bäume auf die Gestalt ihres Orts
    // warten (`_scatterFoundrySeed` → null), schiebt sich auf (`_deferredFoundry`) und wartet benannt auf die leere Schlange
    // (`_waldPlanZusage`, ihr Wecker `_streuWeckerSpannen`). Ohne Nachschub stand sie für immer: Null-Gang an der Mess-Wiese
    // 6 von 6 Regionen nach geleerter Schlange aufgeschoben (CI 38736568849). Ist die Schlange leer, steht jede bestellte
    // Zelle — die Region baut neu wie nach einer Lieferung.
    _waldPlanGeplant(t0) {
        const Q = this._waldPlanSchlange;
        const leer = !(Q && Q.size);
        if (leer || !(t0 < this._waldPlanWeckBis)) {
            this._waldPlanRegung = (this._waldPlanRegung | 0) + 1;
            this._waldPlanWeckBis = t0 + 250;
        }
        if (!leer) return;
        this._scatterRefillPending = true;
        const z = this._waldLeer;
        if (z) {
            this._waldLeer = null;
            z.loesen();
        }
    }

    // Die Zusage der leeren Schlange (der Wecker der Streu wartet auf sie, `_streuWartetAuf`): null, wenn nichts bestellt ist.
    _waldPlanZusage() {
        const Q = this._waldPlanSchlange;
        if (!Q || !Q.size) return null;
        if (!this._waldLeer) {
            let loesen = null;
            const z = new Promise((res) => {
                loesen = res;
            });
            z.loesen = loesen;
            this._waldLeer = z;
        }
        return this._waldLeer;
    }

    // Der Wald-Faden kann rechnen: ein Voxel-Faden lebt, und seine Quelle ist bekannt (`_voxelWorkerWaldDarts`).
    _waldFadenLebt() {
        return !!(this.state.voxelWorker && this._voxelFadenQuelle);
    }

    // DER STOFF DES WALDS IM FADEN (K60-3): die offenen Zellen der Schlange nah zuerst, je Auftrag `WALD_PLAN.faden` Zellen,
    // höchstens `WALD_PLAN.fadenFlug` Aufträge im Flug (der nächste geht mit der Ankunft des vorigen, nie erst im nächsten
    // Takt). Die Wahrheit jeder Zelle reist vor ihr (`_ensureHydroTilesAround`), der Zustand über den EINEN Sender. Bis K60-3
    // rechnete der Haupt-Faden jeden Dart der Streu selbst: Radeon kalt bis zum ersten Bild 1,6 von 2,2 s Streu (K602c/q2:
    // `_forestCellDarts` 1,9 s, davon die Oberfläche 1,5 s).
    _waldFadenSchicken(seedInt) {
        this._forestDartStand(seedInt);
        const memo = this._forestDartMemo;
        if (this._waldFlugVon !== memo || !this._waldFlug) {
            this._waldFlug = new Set(); // die Zellen im Flug gelten dem Gedächtnis, für das sie geschickt wurden
            this._waldFlugVon = memo;
            this._waldFlugAuftraege = 0;
        }
        const W = AnazhRealm.WALD_PLAN;
        if (this._waldFlugAuftraege >= W.fadenFlug) return;
        const flug = this._waldFlug;
        const liste = this._waldPlanListe(flug);
        const C = AnazhRealm.FOREST.cell;
        const extras = this._forestExtraSpecies();
        for (let a = 0; a < liste.length && this._waldFlugAuftraege < W.fadenFlug; a += W.faden) {
            const zellen = [];
            for (let b = a; b < Math.min(liste.length, a + W.faden); b++) {
                const g = liste[b][2];
                this._ensureHydroTilesAround((g[0] + 0.5) * C, (g[1] + 0.5) * C, C);
                flug.add(liste[b][1]);
                zellen.push(g[0], g[1]);
            }
            this._waldFlugAuftraege++;
            const erd = this._erdbauStand | 0;
            this._voxelWorkerWaldDarts(new Int32Array(zellen), seedInt, extras).then(
                (r) => this._waldDartsAn(memo, zellen, r, erd),
                (e) => {
                    this._waldDartsAn(memo, zellen, null, erd); // die Zellen bleiben in der Schlange, der Takt schickt neu
                    this._bruchMelden("WALD: der Faden rechnete die Darts nicht — " + (e && e.message ? e.message : e));
                }
            );
        }
    }

    // Die Darts des Fadens ins Gedächtnis ihres Stands: ein gewechselter Stand oder ein Erdbau seit dem Auftrag
    // (`_erdbauStand`, K69: der Faden rechnete am alten Grund) verwirft sie — die Zellen bleiben in der Schlange, ein neuer
    // Auftrag rechnet sie; eine inzwischen gerechnete Zelle behält ihre Darts (die Urteile der Nachbarn merken die Objekte).
    // Die Schranke des Gedächtnisses greift VOR der Lieferung, nie mitten in ihr (Prüfung K60-3-1).
    _waldDartsAn(memo, zellen, r, erd) {
        if (this._waldFlugVon === memo) {
            this._waldFlugAuftraege--;
            for (let i = 0; i < zellen.length; i += 2) this._waldFlug.delete(zellen[i] + "," + zellen[i + 1]);
        }
        const Q = this._waldPlanSchlange;
        let n = 0;
        if (r && this._forestDartMemo === memo && (this._erdbauStand | 0) === erd) {
            if (memo.size + zellen.length / 2 > 8192) memo.clear(); // bounded wie `_forestCellDarts`
            const alle = this._waldDartsEntpacken(r, zellen.length / 2);
            for (let i = 0; i < alle.length; i++) {
                const k = zellen[i * 2] + "," + zellen[i * 2 + 1];
                if (!memo.has(k)) memo.set(k, alle[i]);
                if (Q) Q.delete(k);
                n++;
            }
        }
        if (n > 0) this._waldPlanGeplant(performance.now());
        if (Q && Q.size && this._waldFadenLebt() && this._forestGesetzWahr())
            this._waldFadenSchicken(this._forestSeedInt());
    }

    // Die gepackten Darts des Fadens (je Zelle `anzahl`, je Dart 11 Werte, die Arten als Tafel) → je Zelle die Darts, wie
    // `_forestCellDarts` sie gibt (gate:worker-dichte Teil W vergleicht sie Wort für Wort).
    _waldDartsEntpacken(r, zellenZahl) {
        const w = r.werte;
        const alle = [];
        let j = 0;
        for (let i = 0; i < zellenZahl; i++) {
            const out = [];
            for (let m = r.anzahl[i]; m > 0; m--, j += 11)
                out.push({
                    x: w[j],
                    z: w[j + 1],
                    sp: r.arten[w[j + 2]],
                    s: w[j + 3],
                    T: w[j + 4],
                    prio: w[j + 5],
                    keep: w[j + 6],
                    totRoll: w[j + 7],
                    rotY: w[j + 8],
                    seed: w[j + 9],
                    surfaceY: Number.isNaN(w[j + 10]) ? null : w[j + 10],
                });
            alle.push(out);
        }
        return alle;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_vegetation_wiese]);

// ===== ATLAS · Vegetation/wiese — Außen-Konstanten =====
// Die Attribute eines festen Streu-Satz-Bereichs (`_streuSatzArt`, der Stein der Nah-Streu): was der Studio-Stoff liest
// (Vertex-Farbe, die Stufen-Stempel der Dither-Blende) — `_satzBlock` rechnet Position und Normale in Welt-Lage.
AnazhRealm.STREU_FEST_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aLodLevel", 1]),
    Object.freeze(["aH0", 1]),
    Object.freeze(["aH0L", 1]),
]);
// Die Attribute eines wiegenden Streu-Satz-Bereichs (`_streuSatzArt`, W7): was der wiegende Stoff liest — Welt-Lage,
// Normale, Farbe × Tint und die Höhe über der Wurzel (`aWiege`, m); er blendet nie, Dither-Stempel trägt er keine.
AnazhRealm.STREU_SATZ_ATTR = Object.freeze([
    Object.freeze(["position", 3]),
    Object.freeze(["normal", 3]),
    Object.freeze(["color", 3]),
    Object.freeze(["aWiege", 1]),
]);
// Bekannte place.mode-Werte (Wörterbuch v1): `_placePolicyFor` liest fail-closed — ein unbekannter
// mode platziert nicht ("none"), crasht nicht (must-ignore). site hat noch keinen Worldgen-Kanal
// (`_placeDispatch` → null); settlement = spawnSettlement + Worldgen-Konsument `_tickAutoSettlement`.
AnazhRealm.PLACE_MODES = Object.freeze({ none: 1, hand: 1, scatter: 1, forest: 1, site: 1, settlement: 1 });

AnazhRealm.FORAGE = Object.freeze({
    reach: 6, // m — Pflueck-Reichweite
    regrowMs: 300000, // 5 min — die Flora kehrt zurueck
});

// Material-Strata: ab dieser Tiefe (m) unter der Oberfläche dominiert stein, auch wenn eine andere
// Achse gewänne. Wirkt NUR bei Aufrufern mit y-Argument (Aufrufe ohne y unverändert).
AnazhRealm.STRATA_STEIN_DEPTH = 12;

// IRON-BANDS: vertikale Eisenadern in tiefen Berg-Regionen (Ridge-Noise `1−|noise|`², unrotiert →
// vertikale Linien-Cluster). EISEN ersetzt STEIN in der Tiefe, wo der Aderwert hoch ist UND genug
// dichte besteht (nie in Erde/Lava). Sichtbar als dunklere Tönung; härtere Eisen-Werkzeuge.
AnazhRealm.IRON_BANDS = Object.freeze({
    // Tiefe, ab der Eisen-Adern auftreten können (über STRATA_STEIN_DEPTH
    // hinaus — Iron-Bands sind eine MIN-STEIN-DEPTH-TIEFE Subschicht).
    minDepth: 24,
    // Ridge-Schwelle: nur an Punkten mit Aderwert > threshold wird stein
    // → eisen umgewandelt. Erst-Wurf 0.7 → ~5-10 % der tiefen Stein-Region.
    threshold: 0.7,
    // Dichte-Floor: kein Eisen in nicht-stein-dominierten Regionen.
    dichteFloor: 0.4,
    // Skala der Ridge-Adern (Noise-Frequenz). 1/180 = ~180 m Adern-Wellenlänge,
    // genug für sichtbare aber nicht überall-präsente Linien.
    scale: 1 / 180,
});
// Platzierungs-Dichte: der Wald ist dicht, wo feucht+flach+niedrig, licht auf Hang+Höhe; alle Achsen
// mittelwert-nah (Gesamt-Baumzahl bleibt, die Verteilung wird Ökologie). Gelesen von
// `_placementStandAt` + `_placementDensityFactor` (EINE Quelle für Bäume + Unterwuchs).
AnazhRealm.PLACEMENT_DENSITY = Object.freeze({
    forestFreq: 0.006, // λ~170 m Wald-Stand (wie der Baum-Klump-Leser _clumpAt 0.006)
    meadowFreq: 0.025, // λ~40 m Unterwuchs: Dickicht ↔ magere Stelle
    clumpAmp: 1.6, // Stand-Amplitude (mittelwert-neutral um 1)
    clumpLo: 0.25, // offenes Land (Lichtung)
    clumpHi: 2.6, // geschlossener Wald-Kern
    slopeLo: 0.35, // ≤ so flach = voll (Wiese/Niederung); die Vorlagen-Flach-Präferenz
    slopeHi: 1.1, // ab so steil (|∇h|, AnazhRealm-Skala) = kahle Felswand
    wetBase: 0.7, // trockener Grund → licht
    wetGain: 0.9, // nass (moW→1) → ×1.6 (die Vorlagen-moW>0.8-Verdichtung)
    highAmp: 0.75, // Höhen-Lichtung-Stärke
    highLo: 12, // ab so hoch über Terrain-Basis beginnt das Lichten
    highHi: 45, // ab so hoch = kahler Grat (nur Rest-Dichte ×0.25)
});

// UNTERWUCHS: `canopyK` ist die EINE Dämpfung des Bodenlichts unter Kronen, L = exp(−canopyK · Deckung) (das Labor-
// Gesetz phytogenesis `canopyLight`). Das Licht der STEHENDEN Kronen (`_bodenLichtFeld`: je Krone des Registers
// exp(−d² / (kronenSigma · r)²) bis q < kronenQMax, wie das Labor) lesen Nah-Wiese und Nah-Streu; das Platzierungs-Feld
// (`_canopyLightAt`, Deckung aus den Treibern der Baum-Platzierung) liest der Strauch-Teppich, der mit dem Wald
// gepflanzt wird.
AnazhRealm.UNDERGROWTH = Object.freeze({
    canopyK: 0.85, // exp(-cover·canopyK): Dach-Dämpfung des Bodenlichts (1=Lichtung, →0 dichtes Dach)
    kronenSigma: 1.15, // der Schatten einer Krone: Gauß-Breite in Kronen-Radien (Labor `cr = T · 1,15`)
    kronenQMax: 6, // bis q = d² / (σ·r)² < 6 wirft eine Krone Schatten (Labor) — Reichweite 2,82 Kronen-Radien
});

// Wald-Generator (unten, Vorlage `plantForest`): variabel-radius Poisson-Disc mit
// Kronen-Schüchternheit + Arten-Nische. `crown` = Radius der gewachsenen Krone (m) bei Größe 1; `pack` = Zentren
// ≥ pack·(Ti+Tj); `dartsPerCell` = Kandidaten je Zelle; `slope*` = Boden-Grundierung für Klippen.
// Gelesen NUR von `_forestCellDarts`/`_forestPlantChunk`.
// Zell-Raster `cell` (Kronen-Schüchternheit liest ±2 Zellen) und Packung `pack` (echte Lichtkonkurrenz, kein
// Ineinanderwachsen) sind das Pflanz-Gesetz des Kerns (phyto-core FOREST_PACK) — EINE Quelle für Labor-Wald und Welt-Wald.
AnazhRealm._waldPack = function (k) {
    const FP = globalThis.__phytoCore && globalThis.__phytoCore.FOREST_PACK;
    if (!FP || !Number.isFinite(FP[k]))
        throw new Error("phyto-core fehlt: FOREST_PACK." + k + " (das Pflanz-Gesetz des Walds)");
    return FP[k];
};
AnazhRealm.FOREST = Object.freeze({
    cell: AnazhRealm._waldPack("cell"),
    pack: AnazhRealm._waldPack("pack"),
    // 36 Darts/Zelle (0.25/m²) sättigen den dichten Kern (~15 Born-Kandidaten/Zelle = die
    // Sättigungs-Schwelle); der Überschuss stirbt an der Kronen-Schüchternheit. 48 kostete +30 %
    // Plant-Zeit für +1 % Bäume. Die Dart-Generierung (Terrain-Gates) dominiert — getragen vom
    // Zell-Memo in `_forestCellDarts`.
    dartsPerCell: 36, // Kandidaten-Darts/Zelle (Poisson-Sättigung im dichten Kern, Vorlage ~55)
    slopeLo: 0.35, // ≤ so flach (|∇h|) = voller Grund; die AnazhRealm-Boden-Tauglichkeit
    slopeHi: 1.25, // ab so steil = kahle Felswand (kein Baum)
    dryScale: 40, // Höhen-Trockenheit relH/dryScale (Vorlage e/18 → AnazhRealm-Höhen-Skala)
    // DIE EINE Kronen-Tafel des Pflanz-Gesetzes (T2): phyto-core FOREST_PACK.crown (die gewachsene Krone je Art) unter den
    // Wirts-Namen (FOREST_SPECIES.labToHost, eine Auto-Art des Buchs unter dem Präfix ihrer Art) — kein zweiter Wert hier.
    crown: (() => {
        const core = globalThis.__phytoCore;
        if (!core || !core.FOREST_PACK)
            throw new Error("phyto-core fehlt: FOREST_PACK.crown (die Kronen-Tafel des Walds)");
        const out = {};
        for (const [id, r] of Object.entries(core.FOREST_PACK.crown))
            out[core.FOREST_SPECIES.labToHost[id] || AnazhRealm.KIND_POLICY.tree.prefix + id] = r;
        return Object.freeze(out);
    })(),
});
// Slope-Schwellen des Gras-Gates: voll bis `lo` (≈35°), weg bis `hi` (≈52°), sanfter Übergang.
// `hi` < rock-`SCATTER.slopeMax` (1.45) → Wiese → Mischhang → Geröll → Fels auf DERSELBEN
// `_slopeAt`-Achse.
AnazhRealm.GRASS_SLOPE = Object.freeze({ lo: 0.7, hi: 1.3 });
// Der Rand der Stand-Wache (m, `_standRuht`): erst wenn Spieler oder Auge so weit vom Anker eines Fege-Takts weg sind,
// gilt sein Ort als neu und er geht wieder. Das Zittern der Physik im Stand (gemessen 07.10., Mess-Wiese: bis 5 mm je
// Takt, nur in der Höhe) weckt nichts; die Stufen-Wahlen tragen eine Hysterese von Metern, die Nah-Streu ihre Armlänge
// mit 0,75 m Austritts-Rand. Der Cull urteilt erst ab der Mesh-Zone (Cull-Radius 100–150 m) und am Karten-Horizont
// (Totband 16 m): ihm genügt ein Meter (`STAND_RAND_FERN_M`) — beim Gehen geht er viermal seltener.
AnazhRealm.STAND_RAND_M = 0.25;
// DER WALD PLANT IM TAKT (K69, `_waldPlanSteht` · `_tickWaldPlan`): die Gestalt eines Baums liest die Wald-Zellen bis ±`reich`
// um seine Zelle (der Freistand ±4, das Urteil jedes Nachbarn ±2); ohne Wald-Faden plant der Takt frische Zellen höchstens
// `ms` lang, mit ihm reisen sie in Aufträgen von `faden` Zellen, höchstens `fadenFlug` im Flug (`_waldFadenSchicken`, K60-4).
AnazhRealm.WALD_PLAN = Object.freeze({ reich: 6, ms: 3, faden: 64, fadenFlug: 2 });
