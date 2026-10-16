class AnazhRealm_Z17b {
    // ===== ATLAS §17b · ARCHITEKTUR-HISM — Block Siedlung =====
    // Bauplan flach in Leaf-Primitive auflösen (cached); nested Blueprints rekursiv mit komponierter
    // Lokal-Matrix. Nicht instanzierbar bei: water_wave-Part · Top-Level-connections · Tiefe > 4 oder
    // Zyklus. Rückgabe: { instanceable, reason, leaves:[{geom, mat, localMatrix}] }.
    _archFlattenBlueprint(name) {
        if (!this.state.archFlattenCache) this.state.archFlattenCache = new Map();
        const cache = this.state.archFlattenCache;
        if (cache.has(name)) return cache.get(name);
        const bp = this.state.blueprints && this.state.blueprints[name];
        const result = { instanceable: false, reason: "", leaves: [] };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) {
            result.reason = "no-parts";
            cache.set(name, result);
            return result;
        }
        // Primärer Gate: nur `instanced: true` (Worldgen-Massen-Vegetation) geht in die HISM-Registry; alle
        // anderen bleiben klassisch (Group + Interaktion via entry.mesh).
        if (bp.instanced !== true) {
            result.reason = "classic-intent";
            cache.set(name, result);
            return result;
        }
        if (Array.isArray(bp.connections) && bp.connections.length > 0) {
            result.reason = "connections";
            cache.set(name, result);
            return result;
        }
        // Affordances, die `entry.mesh` lesen, bleiben klassisch: `magnifying` (Raycast in
        // `_hasMagnifyingInSight`) + `moveable` (Mount-Follow setzt entry.mesh.position). Die übrigen lesen
        // entry.position + affordanceStrength → instancing-safe.
        const aff =
            typeof this.computeBlueprintAffordances === "function" ? this.computeBlueprintAffordances(bp) : null;
        if (aff && (aff.magnifying || aff.moveable)) {
            result.reason = "affordance-needs-mesh";
            cache.set(name, result);
            return result;
        }
        // SKELETON-Pfad: ein Bauplan mit `_skeleton` wird einmalig zu zwei organischen Geometries gebaut
        // (bark-Tube + foliage), ihr Stoff trägt den EINEN Wind-Term (`_baumWindStoff`). `bp.parts` bleibt UNVERÄNDERT
        // → computeCompoundTags + Snapshot-Re-Growth wie zuvor.
        if (bp._skeleton && Array.isArray(bp._skeleton.branches) && bp._skeleton.branches.length > 0) {
            if (!this.state.archMergedGeomCache) this.state.archMergedGeomCache = new Map();
            let skelEntry = this.state.archMergedGeomCache.get(name);
            if (!skelEntry) {
                skelEntry = this._buildTreeSkeletonLeaves(bp);
                if (skelEntry) this.state.archMergedGeomCache.set(name, skelEntry);
            }
            if (skelEntry && Array.isArray(skelEntry.leaves) && skelEntry.leaves.length > 0) {
                result.instanceable = true;
                result.leaves = skelEntry.leaves;
                result.merged = true; // Diagnose-Marker (kompatibel zu V18.213-Tests)
                result.skeleton = true; // V18.214-spezifischer Marker
                cache.set(name, result);
                return result;
            }
            // Skeleton-Bau fehlgeschlagen → Fallback auf V18.213 cylinder-merge.
        }
        // MERGE-Pfad: `_isMerged:true` → einmalig per Material gemerged (~2 Leaves holz+laub statt ~80
        // Per-Part). `bp.parts` bleibt unverändert → Tag-Neutralität + Snapshot-Re-Wachstum.
        if (bp._isMerged === true) {
            if (!this.state.archMergedGeomCache) this.state.archMergedGeomCache = new Map();
            let mergedEntry = this.state.archMergedGeomCache.get(name);
            if (!mergedEntry) {
                mergedEntry = this._mergeBlueprintByMaterial(bp);
                if (mergedEntry) this.state.archMergedGeomCache.set(name, mergedEntry);
            }
            if (mergedEntry && Array.isArray(mergedEntry.leaves) && mergedEntry.leaves.length > 0) {
                result.instanceable = true;
                result.leaves = mergedEntry.leaves;
                result.merged = true; // Diagnose-Marker
                cache.set(name, result);
                return result;
            }
            // Merge fehlgeschlagen (z.B. nested blueprint im Bauplan) →
            // fällt auf den Per-Part-Pfad zurück (defensive Wand).
        }
        const MAX_DEPTH = 4;
        const leaves = [];
        let blocked = null;
        // applyScale: nested Sub-Blueprints erben part.scale (wie `_buildFromBlueprint`); Leaf-Primitive NICHT
        // — der klassische Builder setzt mesh.scale nie (Größe aus part.size) → Bit-Gleichheit.
        const composePart = (part, applyScale) => {
            const pos = part.position || {};
            const tp = new THREE.Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
            const te = new THREE.Euler(
                part.rotation ? part.rotation.x || 0 : 0,
                part.rotation ? part.rotation.y || 0 : 0,
                part.rotation ? part.rotation.z || 0 : 0
            );
            const tq = new THREE.Quaternion().setFromEuler(te);
            let ts = new THREE.Vector3(1, 1, 1);
            if (applyScale) {
                const s = part.scale;
                if (typeof s === "number" && s > 0) ts.set(s, s, s);
                else if (s && typeof s === "object") ts.set(s.x || 1, s.y || 1, s.z || 1);
            }
            return new THREE.Matrix4().compose(tp, tq, ts);
        };
        const recurse = (blueprint, parentMatrix, depth, seen) => {
            if (blocked) return;
            if (depth > MAX_DEPTH) {
                blocked = "depth";
                return;
            }
            if (seen.has(blueprint.name)) {
                blocked = "cycle";
                return;
            }
            seen.add(blueprint.name);
            for (const part of blueprint.parts || []) {
                if (blocked) break;
                if (part.animate === "water_wave") {
                    blocked = "water_wave";
                    break;
                }
                if (part.shape === "blueprint" && typeof part.refName === "string") {
                    const ref = this.state.blueprints && this.state.blueprints[part.refName];
                    if (!ref) continue;
                    const childMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, composePart(part, true));
                    recurse(ref, childMatrix, depth + 1, seen);
                    continue;
                }
                const geom = this._makePartGeometry(part);
                geom.computeBoundingBox();
                const mat = this._archLeafMaterial(part);
                const localMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, composePart(part, false));
                const leaf = { geom, mat, localMatrix };
                // V18.475 — RENDER-DIÄT: trägt das geteilte Material den leafTint-
                // Marker (Farbe NICHT in der Signatur), reist die Part-Farbe als
                // Instanz-Farbe (der EINE Slot-Farb-Chokepoint _archSlotColor).
                if (mat.userData && mat.userData.leafTint) leaf.tint = this._archPartTintColor(part);
                // Welle B — Glut-Teile werfen nicht (Lichtquelle, _archTeilLeuchtet; aus beiden Kaskaden raus).
                if (this._archTeilLeuchtet(part)) leaf.castShadow = false;
                leaves.push(leaf);
            }
            seen.delete(blueprint.name);
        };
        recurse(bp, new THREE.Matrix4(), 0, new Set());
        // Welle B — DIE DRAW-EINHEIT IST MATERIAL × GEOMETRIE: LICHTQUELLEN-Teile (_archTeilLeuchtet; ihr Material
        // backt die Farbe, sie werfen nicht) verschmelzen je Material und Attribut-Form zu EINEM Leaf (Geometrie im
        // Bauplan-Raum, localMatrix = Identität) — dieselben Dreiecke, dasselbe Material, ein Befehl statt je Teil
        // einer (die Glut-Zungen einer Variante: 1–3 → 1). Jeder andere Teil bleibt je Teil (deckungsgleich zum
        // klassischen Bau). Der Foundry-Flat trägt dasselbe Gesetz (_foundryFlatVerschmelzen).
        if (!blocked && leaves.length > 1) leaves.splice(0, leaves.length, ...this._archLeavesVerschmelzen(leaves));
        if (blocked || leaves.length === 0) {
            // Unbenutzte Leaf-Ressourcen freigeben (nicht instancbar).
            for (const l of leaves) {
                if (l.geom && l.geom.dispose) l.geom.dispose();
                // V18.475 — geteilte Tag-Signatur-Materialien leben im
                // _foliageMatCache (viele Leser) → NIE disposen.
                if (l.mat && l.mat.dispose && !(l.mat.userData && l.mat.userData.sharedFoliage)) l.mat.dispose();
            }
            result.reason = blocked || "empty";
            cache.set(name, result);
            return result;
        }
        result.instanceable = true;
        result.leaves = leaves;
        cache.set(name, result);
        return result;
    }

    // Die Verschmelzung des Per-Teil-Flattens (Reihenfolge = erstes Vorkommen; ein Einzelner bleibt unberührt).
    _archLeavesVerschmelzen(leaves) {
        const sig = (lf) => {
            const g = lf.geom;
            if (!g || !g.attributes || !g.attributes.position || lf.tuer || lf.shadowTwin) return null;
            // nur Lichtquellen (castShadow false aus _archTeilLeuchtet) ohne Instanz-Farb-Kanal
            if (lf.castShadow !== false || lf.tint !== undefined) return null;
            if (g.groups && g.groups.length) return null;
            for (const k in g.attributes) if (g.attributes[k].isInterleavedBufferAttribute) return null;
            const a = Object.keys(g.attributes)
                .sort()
                .map((k) => k + ":" + g.attributes[k].itemSize + (g.attributes[k].normalized ? "n" : ""))
                .join(",");
            return [lf.mat.uuid, g.index ? "i" : "x", a].join("|");
        };
        const sippen = new Map();
        const aus = [];
        for (const lf of leaves) {
            const k = sig(lf);
            if (k === null) {
                aus.push(lf);
                continue;
            }
            let sp = sippen.get(k);
            if (!sp) {
                sp = [];
                sippen.set(k, sp);
                aus.push(sp); // Platzhalter an der Stelle des ersten Vorkommens
            }
            sp.push(lf);
        }
        return aus.map((x) => {
            if (!Array.isArray(x)) return x;
            if (x.length === 1) return x[0];
            // Attribut-treu (jedes Attribut der Sippe, Index mit Vertex-Versatz) — die Teile im Bauplan-Raum.
            const geoms = x.map((lf) => lf.geom.clone().applyMatrix4(lf.localMatrix));
            const merged = new THREE.BufferGeometry();
            let vSumme = 0;
            for (const g of geoms) vSumme += g.attributes.position.count;
            for (const name of Object.keys(geoms[0].attributes)) {
                const a0 = geoms[0].attributes[name];
                const arr = new a0.array.constructor(vSumme * a0.itemSize);
                let o = 0;
                for (const g of geoms) {
                    const a = g.attributes[name];
                    arr.set(a.array.subarray(0, a.count * a.itemSize), o);
                    o += a.count * a.itemSize;
                }
                merged.setAttribute(name, new THREE.BufferAttribute(arr, a0.itemSize, a0.normalized));
            }
            if (geoms[0].index) {
                let iSumme = 0;
                for (const g of geoms) iSumme += g.index.count;
                const idx = vSumme > 65535 ? new Uint32Array(iSumme) : new Uint16Array(iSumme);
                let o = 0,
                    v = 0;
                for (const g of geoms) {
                    const li = g.index.array;
                    for (let i = 0; i < g.index.count; i++) idx[o + i] = li[i] + v;
                    o += g.index.count;
                    v += g.attributes.position.count;
                }
                merged.setIndex(new THREE.BufferAttribute(idx, 1));
            }
            for (const g of geoms) g.dispose();
            for (const lf of x) lf.geom.dispose();
            merged.computeBoundingBox();
            const out = { geom: merged, mat: x[0].mat, localMatrix: new THREE.Matrix4() };
            if (x[0].castShadow === false) out.castShadow = false;
            return out;
        });
    }

    // === Instancing (HISM-Registry) ===
    // Eine InstancedMesh je (Bauplan, Leaf-Index); der Culling-Tick schreibt/löscht Per-Instance-Matrizen
    // statt Groups → Draw-Calls ~(Typen × Parts).

    _archIsRendered(entry) {
        return !!(entry && (entry.mesh || entry.instanced));
    }

    // SCHATTEN-DISTANZ in den LOD-Stufen: der Schatten-Pass ist ein zweiter Voll-Render, ferne Bäume
    // werfen nur winzige fog-verschleierte Schatten. Die LOD-Stufe steht IM Bauplan-Namen
    // (`grown_<art>_v<idx>_lod1/_lod2`) → der LOD-Tick (_switchArchitectureLOD) trägt die Entscheidung
    // mit. Bauten ohne `_lodN` werfen immer.
    _archGroupCastsShadow(name) {
        // L0 UND L1 werfen, nur die Fernstufe L2/Impostor nie (L1 beginnt schon bei ~20 m — sonst verlöre ein
        // Baum im Sichtfeld den Schatten). Kein Doppel-Schatten im Band: Shadow-Maps sind Tiefen-Tests.
        return !/_lod2$/.test(String(name || ""));
    }

    // GETEILTE Bewuchs-Materialien, per Opts-Signatur memoisiert: identische Configs teilen EIN Material
    // (die Art-Farbe läuft pro Instanz via useInstanceTint + setColorAt) — sonst je Baum eine eigene
    // Pipeline (Compile-Stutter + Pipeline-Switch je Draw). NIE disposed (archFlattenCache-Konvention:
    // _archDisposeAllInstanceGroups lässt g.mat stehen).
    _sharedFoliageMaterial(opts) {
        if (!this.state._foliageMatCache) this.state._foliageMatCache = new Map();
        const sig = JSON.stringify(opts);
        let mat = this.state._foliageMatCache.get(sig);
        if (!mat) {
            mat = this._buildToonNodeMaterial(opts);
            mat.userData.sharedFoliage = true;
            // OBSERVER-DIÄT: die sharedFoliage-Singletons hängen NUR an geteilten Sätzen (Atmo/LOD/Wind,
            // renderGroup) + Attributen + Instanz-Daten; die Wächter decken instanceMatrix/instanceColor.
            // Impostor-Materialien laufen auch hier durch — ihre Atlanten deckt der Textur-Wächter
            // (`_diaetVorTextur`).
            this._materialObserverDiaet(mat);
            this.state._foliageMatCache.set(sig, mat);
        }
        return mat;
    }

    // RENDERBUNDLES: EINE BundleGroup je Streu-/Platzier-Region; der statische Subbaum wird einmal
    // recorded und replayed (kein per-Frame-Encode je Draw). Dynamisches (Kreaturen/Wasser/Spieler) bleibt
    // DRAUSSEN: im Replay leben nur Uniform-/Textur-Bindings, Attribute wie instanceMatrix frieren ein. Die Bundles
    // sind der EINE Weg (04.10. in EINER Welt gegen den direkten Pfad gemessen, echte GPU, Mess-Wiese: Render-CPU p50
    // −1,1 ms im Stand, −0,3 ms im Gehen trotz ~0,8 Neuaufnahmen je Frame, +11 % gezeichnete Frames); ihre Wahrheit
    // (Aufnahme-Stapel, kein Bundle unter einem Override-Stoff) hält `_configureRenderer` am Chokepoint `_renderScene`,
    // die Klasse THREE.BundleGroup pinnt gate:vendor-anker.
    _archRegionBundleFor(regionKey) {
        if (regionKey == null) return null;
        // Nur das WebGPU-Backend implementiert die Bundle-API (beginBundle/finishBundle/addBundle) — auf dem
        // WebGL2-Rückfall wirft eine BundleGroup im Render-Loop. Klassen-Existenz ist blind; das Urteil fällt
        // am BACKEND. Headless: Bundles sind reine Gruppen-Knoten.
        {
            const _r = this.state.renderer;
            if (_r && !_r._isHeadlessNull && !(_r.backend && _r.backend.isWebGPUBackend === true)) return null;
        }
        const scene = this.state.scene;
        if (!scene) return null;
        let map = this.state._regionBundles;
        if (!map) map = this.state._regionBundles = new Map();
        let bg = map.get(regionKey);
        if (!bg) {
            bg = new THREE.BundleGroup();
            bg.name = "regionBundle:" + regionKey;
            bg.userData.regionKey = regionKey;
            // Analytische Region-Kugel für den Frame-Cull (ersetzt das im Replay eingefrorene three-Culling).
            // Keys: "x,z" · Super-Region "s:x,z". Über-Inklusion ist sicher (nur GPU-Preis), Unter-Inklusion
            // wäre ein Pop → großzügiger Höhen-/Überhang-Puffer.
            const m = /^(s:)?(-?\d+),(-?\d+)$/.exec(String(regionKey));
            if (m) {
                const S = m[1] ? AnazhRealm.SCATTER_FERN_SUPERREGION : 1;
                const R = AnazhRealm.ARCH_REGION_M * S;
                const cy = (Number.isFinite(this.state.terrainBaseHeight) ? this.state.terrainBaseHeight : 0) + 40;
                bg.userData.cullSphere = new THREE.Sphere(
                    new THREE.Vector3((Number(m[2]) + 0.5) * R, cy, (Number(m[3]) + 0.5) * R),
                    R * Math.SQRT1_2 + 140
                );
            }
            scene.add(bg);
            map.set(regionKey, bg);
            this._buendelReihe(scene);
        }
        return bg;
    }

    // DIE REIHE DER BÜNDEL (1310-1): r184 zeichnet die Region-Bündel in der Reihenfolge der Szene und vor jedem losen
    // Objekt — wer zuerst zeichnet, schreibt die Tiefe, hinter der die übrigen ihre Fragmente verwerfen. Die Verdecker
    // zuerst: @global (die gesetzten Gruppen ohne Wahl), dann die Regionen, @wahl zuletzt (Pflanzen-Stufen, Atlas-Karten,
    // Zwillinge — Ausschnitt je Fragment). Bis 1310-1 entschied die Ankunft beim Boot: am Genesis-Ring legte der Tor-
    // Zwilling @wahl vor @global an — bei gleichen Befehlen in EINER Sitzung gpu-bank +1,6 ms und 47,5 statt 50,1 fps unter
    // Regler voll (OMEN, GTX 1060). Jedes neue Bündel stellt die Reihe neu (stabil im Rang); die Plätze der übrigen Kinder
    // der Szene bleiben, nur die Bündel tauschen ihre Plätze untereinander.
    // DIE REIHE IM BÜNDEL (1310-8): auch die Gruppen EINES Bündels zeichnen in seiner Kinder-Folge — bis 1310-8 die Ankunft ihrer
    // Assets beim Boot. Die nahe Stufe zuerst (L0 vor L1 vor der Atlas-Karte), im Gleichstand der Schlüssel: wer nah steht,
    // schreibt die Tiefe, hinter der die fernen Stufen ihre Fragmente verwerfen. Gemessen an der Mess-Wiese (OMEN, GTX 1060,
    // EINE Sitzung, Gier 0, alle Bäume an/aus): der Baum-Preis in der Ankunft 5,02/5,25 ms, nach Stufe aufsteigend 3,46/3,33,
    // absteigend 7,26 — gpu-bank 14,1 → 12,4 ms. Jede Aufnahme eines Kinds stellt die Reihe neu (`_archInstanceGroupFor`, das
    // Wachsen der Gruppe); das Bündel nimmt danach ohnehin neu auf.
    // DIE REIHE NACH ABSTAND (1310-9): trägt der Ruf das Auge (`_buendelAuge`, der Anker der Reihe), zeichnet innerhalb einer
    // Stufe die Gruppe zuerst, deren nächste Instanz dem Auge am nächsten steht (vorn schreibt die Tiefe); ohne Auge der Schlüssel.
    static _buendelKinderReihe(bundle, auge) {
        const rang = (c) => (c.userData && Number.isFinite(c.userData.buendelStufe) ? c.userData.buendelStufe : 0);
        const key = (c) => String((c.userData && c.userData.archInstanceKey) || "");
        const nah = new Map();
        if (auge)
            for (const c of bundle.children) {
                let m = 1e30;
                const a = c.instanceMatrix && c.instanceMatrix.array;
                const n = c.count | 0;
                if (a)
                    for (let i = 0; i < n; i++) {
                        const dx = a[i * 16 + 12] - auge.x;
                        const dz = a[i * 16 + 14] - auge.z;
                        const d = dx * dx + dz * dz;
                        if (d < m) m = d;
                    }
                nah.set(c, m);
            }
        bundle.children.sort(
            (a, b) =>
                rang(a) - rang(b) ||
                (auge ? nah.get(a) - nah.get(b) : 0) ||
                (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
        );
    }
    // DER ANKER DER REIHE (1310-9): die Augen-Lage, an der die Bündel ihre Kinder zuletzt nach Abstand stellten. Je Frame nur
    // dieser Vergleich; erst wenn das Auge BUENDEL_ANKER_M weiter steht, stellt jedes Region-Bündel seine Reihe neu und nimmt
    // EINMAL neu auf — die Kosten folgen der Bewegung, nie dem Frame (Gebot 7). Stufen-Wechsel stellen die Reihe über die
    // Aufnahme (`_archInstanceGroupFor`).
    _buendelAnkerPruefen(pos) {
        const a = this._buendelAuge;
        const R = AnazhRealm.BUENDEL_ANKER_M;
        if (a && (pos.x - a.x) * (pos.x - a.x) + (pos.z - a.z) * (pos.z - a.z) <= R * R) return false;
        this._buendelAuge = { x: pos.x, z: pos.z };
        const sc = this.state.scene;
        if (sc)
            for (const c of sc.children)
                if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                    AnazhRealm._buendelKinderReihe(c, this._buendelAuge);
                    c.needsUpdate = true;
                }
        return true;
    }
    // DIE ZEICHEN-REIHE DER WELT (T3): EIN Gesetz für alles Opake, die Bündel und jedes lose Objekt — wer vorn steht, zeichnet
    // zuerst und schreibt die Tiefe, hinter der die Übrigen ihre Fragmente verwerfen. Die Schichten vorn → hinten: die Bündel
    // (r184 und die BUNDLE-REIHENFOLGE führen jedes vor jedem losen Draw aus) @global · die Regionen · @wahl, dann lose, was
    // auf dem Boden steht (Bau-Satz, jede lose Senke, Tor, Membran, Leib — ohne Marke), der Boden, der Fern-Ring, der Himmel
    // (im Unendlichen zahlt er zuletzt nur seine eigenen Pixel). Ein Erzeuger nennt seine Schicht als Laufzeit-Marke
    // (`userData.zeichenSchicht`). Bis T3 sortierte r184 die losen Opaken nach renderOrder · Tiefe · Objekt-id, die Satz-Hülle
    // liegt am Ursprung (gleiche Tiefe): die Boot-Ankunft entschied, der Himmel (id 20) zeichnete vor Boden und Bau. Gemessen
    // (Radeon 890M, EINE Welt, gpu-bank-Median): Genesis Ego 28,25 → 23,38 ms, Dorf Ego 27,27 → 22,05 ms, Wiese 22,02 → 21,78.
    static _zeichenRang(o) {
        const u = (o && o.userData) || {};
        if (o && o.isBundleGroup === true) return u.regionKey === "@global" ? 0 : u.regionKey === "@wahl" ? 2 : 1;
        const s = u.zeichenSchicht;
        return s === "boden" ? 4 : s === "fern" ? 5 : s === "himmel" ? 6 : 3;
    }
    // Die Folge der losen Opaken in JEDEM Render (`setOpaqueSort`, `_configureRenderer`): r184s Schlüssel (Gruppe · renderOrder,
    // die erklärte Folge wie der Feld-Pass zuletzt) und darin die Schicht vor Tiefe und id.
    static _zeichenFolge(a, b) {
        return (
            a.groupOrder - b.groupOrder ||
            a.renderOrder - b.renderOrder ||
            AnazhRealm._zeichenRang(a.object) - AnazhRealm._zeichenRang(b.object) ||
            a.z - b.z ||
            a.id - b.id
        );
    }
    _buendelReihe(scene) {
        const kinder = scene.children;
        const plaetze = [];
        const buendel = [];
        for (let i = 0; i < kinder.length; i++) {
            const c = kinder[i];
            if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                plaetze.push(i);
                buendel.push(c);
            }
        }
        const rang = AnazhRealm._zeichenRang;
        const reihe = buendel.map((b, k) => ({ b, k })).sort((x, y) => rang(x.b) - rang(y.b) || x.k - y.k);
        for (let k = 0; k < plaetze.length; k++) kinder[plaetze[k]] = reihe[k].b;
    }

    // Bundle-Invalidierung für ein MESH in einer Region-BundleGroup: jede Mutation seiner Draw-Wahrheit
    // (Slot-Alloc/-Free · instanceMatrix/instanceColor · Fassade · count) muss hierher; sonst No-op.
    _archMeshBundleTouch(mesh) {
        const p = mesh ? mesh.parent : null;
        if (p && p.isBundleGroup) p.needsUpdate = true;
        // Welle 6 — eine Satz-Gruppe zeichnet als Bereich im Satz ihres Stoffs: der Bereich legt sich neu.
        else if (mesh && mesh.userData.bauSatz)
            this._bauSatzMarke(mesh.userData.archInstanceKey, mesh.userData.bauSatz);
    }

    // Parent-bewusstes Entfernen (die scene.remove-Falle: remove() wirkt nur auf
    // DIREKTE Kinder — eine Gruppe in der BundleGroup bliebe sonst hängen = Leck).
    // Leere Bundles verlassen die Szene mit (Region weggestreamt).
    _archBundleSceneRemove(mesh) {
        const p = mesh ? mesh.parent : null;
        if (!p) return;
        p.remove(mesh);
        if (p.isBundleGroup) {
            p.needsUpdate = true;
            if (p.children.length === 0) {
                if (p.parent) p.parent.remove(p);
                this._bundleQueryProxyTod(p); // ④ — der Query-Proxy fällt mit dem Bundle
                if (this.state._regionBundles) this.state._regionBundles.delete(p.userData.regionKey);
            }
        }
    }

    // ═══ DER SATZ (Welle B) ═══
    // Die Draw-Einheit ist Material × Geometrie über den ganzen Ring, nie Chunk × Material. Befund (Inventur der
    // echten GPU, Mess-Wiese): 78 Chunk-Böden zeichneten in JEDEM Pass einzeln — 234 GPU-Befehle, weil der Vendor
    // den Bundle-Replay je (Bundle, Kamera) zieht und seine Mitglieder nie cullt. Je Satz-Art (Boden · Wasser · je Stoff
    // des gesetzten Baus) lebt EIN Szenen-Mesh mit Pool-Puffern; ein Chunk (bzw. sein Stitch-Band, eine Bau-Gruppe) ist ein
    // BEREICH darin. Die Vertex-Bereiche vergibt First-Fit aus einer Freiliste, lebende Bereiche wandern nie: die
    // Chunk-Geometrie trägt subarray-Views auf den Satz (jeder CPU-Leser bleibt byte-gleich, der Geomorph schreibt hinein und
    // markiert seinen Bereich). Ein Bereich zerfällt in ZELLEN (Boden/Wasser: Viertel um die Mitte seiner Lage; Bau: je
    // Instanz), je Zelle ein Index-Lauf und eine Hülle; der Index (Uint32 — writeBuffer verlangt 4-Byte-Ausrichtung) trägt je
    // PASS einen ABSCHNITT: die Zellen, deren Hülle das Frustum der Pass-Kamera schneidet (`_chunkSatzPass` im Haken jedes
    // Passes), Boden nah → fern (Early-Z, wie three's Objekt-Sortierung), Wasser fern → nah (transparent). Befund 05.10.
    // (echte GPU, Mess-Wiese): der Satz zeichnete den ganzen Ring in JEDEM Pass — Hauptbild, Kaskade 0 und Kaskade 1 je
    // 245 696 Dreiecke, auch hinter dem Blick und jenseits jeder Kaskaden-Box. Jeder Schreibvorgang ist ein Teil-Upload
    // (`_chunkSatzSchreib` → addUpdateRange → queue.writeBuffer(offset)); ein Wachsen (Vertices ×1,5, Indizes ×1,25 oder
    // auf die Summe der Abschnitte) baut eine frische Geometrie und zeigt die Views neu.
    _chunkSatzArt(art) {
        if (art === "boden")
            return {
                name: "bodenSatz",
                // DIE VERTEX-FORM (K44): die Normale trägt snorm8x4, die Farbe float16x4 (`_satzPacke`), der Chunk behält seine
                // Float32-Arrays für jeden CPU-Leser. DER GEOMORPH DER STUFE (K51-2) bringt Normale und Stoff-Farbe des Ziels
                // (`aNormalZiel` snorm8x4, `aFarbeZiel` float16x4); die vierte Komponente trägt je einen Skalar des Chunks
                // (Morph-Code in der Farbe, Himmels-Sicht im Normal-Ziel, Schutt im Farb-Ziel) — 48 B je Vertex wie zuvor
                attr: [
                    ["position", 3],
                    ["normal", 3, "snorm8"],
                    ["color", 3, "half", "aMorphWeight"],
                    ["aMorphTarget", 3],
                    ["aNormalZiel", 3, "snorm8", "aHimmel"],
                    ["aFarbeZiel", 3, "half", "aSchutt"],
                ],
                mat: this._getVoxelChunkMaterial(),
                schatten: true, // der Boden wirft (Hang auf Tal) — je Kaskade 1 Befehl, ihr Abschnitt
                empfang: true,
                renderOrder: 0,
                richtung: 1, // nah → fern
                userData: { chunkSatz: "boden", inventar: "boden-satz", zeichenSchicht: "boden" },
            };
        if (art === "wasser")
            return {
                name: "wasserSatz",
                attr: [
                    ["position", 3],
                    ["aFlow", 2],
                    ["aWave", 1],
                    ["aDepth", 1],
                    ["aSlope", 1],
                ],
                mat: this._ensureHydroSurfaceMaterial(),
                schatten: false,
                empfang: false,
                renderOrder: 1, // transparent — nach den opaken Objekten
                richtung: -1, // fern → nah (transparent: der Maler-Algorithmus innerhalb des Satzes)
                hub: AnazhRealm._wasserHubM(), // der Shader hebt und senkt die Fläche (die Zellen-Hülle trägt es)
                userData: { chunkSatz: "wasser", isHydrosphere: true, hydroKind: "chunk-water-satz" },
            };
        // DER STOFF-SATZ: je Familie × Stoff × Wurf ein Satz — sein Stoff ist der geteilte Studio-Stoff. Der Bau-Satz
        // (`_bauSatzArt`): ein Bereich ist eine Instanz-Gruppe (alle ihre Instanzen in Welt-Lage, `_bauSatzBlock`). Der
        // Streu-Satz (`_streuSatzArt`, W7): ein Bereich ist der Block einer Kachel in einer Senke der Nah-Streu, seine Attribute
        // trägt der Eintrag (der wiegende Stoff dazu `aWiege`), seine Kapazität ist die der Streu.
        const bau = this.state.satzStoffe ? this.state.satzStoffe.get(art) : null;
        // Ein NUR-WURF-Satz (`bauWurf`, S3) liegt NUR auf SHADOW_TWIN_LAYER (die Kaskaden-Kameras sehen ihn, das Hauptbild
        // nie — `_chunkSatzPass` wählt dort nichts) und empfängt nichts.
        if (bau)
            return {
                name: bau.name,
                attr: bau.attr || AnazhRealm.BAU_SATZ_ATTR,
                mat: bau.mat,
                schatten: bau.wurf,
                empfang: bau.nurWurf !== true,
                nurWurf: bau.nurWurf === true,
                renderOrder: 0,
                richtung: bau.mat.transparent === true ? -1 : 1, // ein durchscheinender Stoff fern → nah
                userData: bau.userData || { bauSatz: bau.name },
                kapazitaet: bau.kapazitaet || "bau",
            };
        throw new Error(`_chunkSatzArt: unbekannte Satz-Art „${art}"`);
    }

    // Der Satz einer Art (lazy): EIN Szenen-Kind, frustumCulled=false (die Wahl je Pass trifft der Abschnitt).
    _chunkSatz(art) {
        const st = this.state;
        if (!st.chunkSaetze) st.chunkSaetze = new Map();
        let s = st.chunkSaetze.get(art);
        if (s) return s;
        if (!st.scene) throw new Error(`_chunkSatz(${art}): keine Szene`);
        const spec = this._chunkSatzArt(art);
        const C = AnazhRealm.CHUNK_SATZ[spec.kapazitaet || art];
        if (!C) throw new Error(`_chunkSatz: keine Start-Kapazität für „${art}" (CHUNK_SATZ)`);
        s = {
            art,
            spec,
            attrNamen: spec.attr.map((a) => a[0]),
            // je Attribut die Vertex-Form auf der GPU (`_satzForm`): `gis` = die Breite im Satz-Array (gepackt 4)
            // `w`: der Name eines Skalars des Chunks, den die vierte Komponente trägt (ohne Float16Array: Float32 × 4, `voll4`)
            attr: spec.attr.map(([name, is, form, w]) => {
                const f = this._satzForm(form) || (w ? "voll4" : null);
                return { name, is, form: f, gis: f ? 4 : is, w: w || null };
            }),
            geom: null,
            mesh: null,
            vKap: 0,
            iKap: 0,
            vEnde: 0,
            vFrei: [],
            bloecke: new Map(),
            ordnung: [],
            // je Pass-Schlüssel (haupt · k<i> · anders) sein Abschnitt im Index: { start, kap, n, liste, takt }
            abschnitte: new Map(),
            iEnde: 0, // Hochwasser der Abschnitte im Index
            iSumme: 0, // Indizes aller Bereiche (der ganze Ring)
            takt: 0, // Render-Takt (_tickChunkSatz) — ein Abschnitt, den kein Pass mehr fragt, fällt beim Umlegen
            vInhalt: 0, // die Vertices aller Bereiche (der Inhalt, den `_chunkSatzVerdichten` misst)
            ueberSeit: -1, // der Takt, seit dem die Kapazität über `schwelle` × Ziel liegt (-1 = sie liegt darunter)
            ueberHoch: 0, // das Hochwasser des Inhalts seit `ueberSeit`
            ueberStart: 0, // der Inhalt zu Beginn der Frist (wächst er um mehr als `stetig`, beginnt sie neu)
            schmutzig: false,
            anker: null,
            verborgen: false,
            grundAlt: false,
            wachse: 0,
            // DER STAND (Welle C): jede neue Hülle und jede neue Ordnung zählt — ein Abschnitt, gewählt in einem älteren Stand,
            // wählt neu (`_satzAbschnittSteht`)
            stand: 0,
            // DIE NEUSCHREIB-LINSE: Index-Bytes je „Verursacher>Abschnitt" (ein Pass, der den Abschnitt eines anderen
            // schreibt, steht beim Namen) — kumulativ, die Linsen lesen die Differenz je Frame
            schreiben: {},
        };
        this._chunkSatzGeometrie(s, C.v, C.i);
        const mesh = this._chunkSatzMesh(s); // unsichtbar, bis der erste Bereich liegt
        st.chunkSaetze.set(art, s);
        st.scene.add(mesh);
        return s;
    }

    // Die Pool-Geometrie (neu oder gewachsen): die Vertex-Attribute bis zum Hochwasser, der Index bis zum Hochwasser der
    // Abschnitte kopiert, die Views aller Bereiche neu gezeigt, die alte Geometrie geht in die verzögerte Entsorgung. Ein
    // Wachsen mitten im Frame (ein Schatten-Pass, dessen Abschnitt keinen Platz findet) ist richtig: der Mesh trägt ab
    // sofort die neue Geometrie, die den Abschnitt des Hauptbilds an seiner Stelle trägt (`_chunkSatzUmlegen` lässt ihn
    // liegen); was der Haupt-Pass schon aufzeichnete, liest die alte, die bis zur Abgabe lebt.
    _chunkSatzGeometrie(s, vKap, iKap) {
        const alt = s.geom;
        const waechst = vKap > s.vKap || iKap > s.iKap; // `wachse` zählt das Wachsen, nie das Schrumpfen (`_chunkSatzVerdichten`)
        const g = new THREE.BufferGeometry();
        for (const { name, form, gis } of s.attr) {
            const arr =
                form === "snorm8"
                    ? new Int8Array(vKap * 4)
                    : form === "half"
                      ? new globalThis.Float16Array(vKap * 4)
                      : new Float32Array(vKap * gis);
            if (alt) arr.set(alt.attributes[name].array.subarray(0, s.vEnde * gis));
            g.setAttribute(name, new THREE.BufferAttribute(arr, gis, form === "snorm8"));
        }
        const idx = new Uint32Array(iKap);
        const iN = alt ? Math.min(s.iEnde, alt.index.array.length, iKap) : 0;
        if (iN > 0) idx.set(alt.index.array.subarray(0, iN));
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        if (alt) g.setDrawRange(alt.drawRange.start, alt.drawRange.count);
        else g.setDrawRange(0, 0);
        // frustumCulled=false: eine ehrliche „überall"-Kugel statt eines Laufs über die ganze Kapazität. Ihre Mitte liest
        // r184 nur als Sortier-Tiefe — die Reihe trägt `_zeichenRang` (T3; die Inhalts-Mitte gemessen: Genesis Ego +4,4 ms)
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
        s.geom = g;
        s.vKap = vKap;
        s.iKap = iKap;
        for (const b of s.bloecke.values()) this._chunkSatzViews(s, b);
        // Ein Wachsen tauscht die Geometrie am SELBEN Mesh: seine Render-Objekte sehen den Tausch beim nächsten Zeichnen
        // (r184 `needsGeometryUpdate` → `setGeometry`). Die Falle des Tauschs — r184 hängt den Entsorgungs-Hörer einer
        // Geometrie an ihr ERSTES Render-Objekt und liest dessen Attribute erst beim Entsorgen, nach dem Tausch die der neuen
        // (Welle 6, echte GPU: die Normale des werfenden Bau-Satzes ohne Puffer, „Vertex buffer slot 5 … was not set") —
        // fällt an der Wurzel, für jede Geometrie: `_renderObjektRegister` nimmt den Hörer heraus, die alten Puffer verlassen
        // die GPU über den Kehraus (`_gpuKehraus`). Ein frischer Mesh je Wachsen ließe seine alten Render-Objekte am geteilten
        // Stoff hängen (sein dispose-Hörer hält sie).
        if (s.mesh) s.mesh.geometry = g;
        if (alt) {
            if (waechst) s.wachse++;
            this._queueGeometryDispose(alt);
        }
    }

    // DER SATZ FOLGT SEINEM INHALT (W7): die Kapazität eines Satzes folgte seiner Geschichte — er wuchs (×1,5) und schrumpfte
    // nie, ein leerer kehrte nur auf die Start-Kapazität zurück. Befund (echte GPU, Mess-Wiese, Puffer-Linse): in Ruhe hielt
    // der Wasser-Satz 3,25 MB für 0,33 MB Inhalt (9 745 von 65 536 Vertices), drei Bau-Sätze je 0,44 MB für 48 bis 1 464
    // Vertices; nach drei Wander-Schleifen à 1,2 km hielt der Boden-Satz 24,9 statt 16,4 MB und die Bau-Sätze 12,0 statt
    // 1,3 MB. Je Render-Takt misst der Satz sein Ziel: das Hochwasser seines Inhalts (die Vertices seiner Bereiche) über die
    // Frist × `luft`, die Indizes aus dem Hochwasser der Abschnitte, die ein Pass noch fragt, mindestens vMin/iMin. Liegt die
    // Kapazität `ruheTakte` Takte lang über `schwelle` × Ziel (die Schwelle über dem Wachs-Schritt hält ihn ruhig), schrumpft
    // er auf das Ziel — ohne auf eine Ruhe seiner Bereiche zu warten (die Wasser-Bereiche treten fast je Takt neu ein), aber
    // nie, solange er füllt: wächst sein Inhalt um mehr als `stetig` über den Stand zu Beginn der Frist (der Ring im Boot,
    // ein Dorf, das einströmt), beginnt die Frist neu. Dann ziehen die Bereiche dicht nach vorn (jeder Index-Lauf um die
    // Verschiebung seines Bereichs, Zellen und Hüllen bleiben), die Abschnitte fallen und jeder Pass legt seinen im nächsten
    // Frame neu, die Geometrie tauscht am SELBEN Mesh, die Views der Chunks zeigen auf die neuen Arrays (jeder CPU-Leser
    // bleibt byte-gleich). Ein leerer Satz ist der Fall „Inhalt 0". Die alten Puffer verlassen die GPU hier, vor dem Zeichnen
    // des Frames (`_loopRender`): ein Render-Objekt, das die alte Geometrie las, tauscht beim nächsten Zeichnen, und der
    // Kehraus hielte die Puffer eines unsichtbaren Satzes für gezeichnet (W6: Bau-Sätze 38,3 → 31,4 statt 45,2 MB).
    _chunkSatzVerdichten(s) {
        const V = AnazhRealm.CHUNK_SATZ_VERDICHTEN;
        const R = AnazhRealm.CHUNK_SATZ_ABSCHNITT.ruheTakte;
        let iBedarf = 0;
        for (const a of s.abschnitte.values()) if (s.takt - a.takt <= R) iBedarf += this._chunkSatzKap(a.hoch);
        const hoch = s.ueberSeit < 0 ? s.vInhalt : Math.max(s.ueberHoch, s.vInhalt);
        const vZiel = Math.max(V.vMin, Math.ceil(hoch * V.luft));
        const iZiel = Math.max(V.iMin, Math.ceil(iBedarf * V.luft));
        const vNeu = s.vKap > vZiel * V.schwelle ? vZiel : s.vKap;
        const iNeu = s.iKap > iZiel * V.schwelle ? iZiel : s.iKap;
        if (vNeu === s.vKap && iNeu === s.iKap) {
            s.ueberSeit = -1;
            return false;
        }
        if (s.ueberSeit < 0 || s.vInhalt > s.ueberStart * V.stetig) {
            s.ueberSeit = s.takt;
            s.ueberStart = s.vInhalt;
        }
        s.ueberHoch = hoch;
        if (s.takt - s.ueberSeit <= R) return false;
        s.ueberSeit = -1;
        if (vNeu < s.vKap) {
            // dicht nach vorn, in Lage-Folge: jedes Ziel liegt vor seiner Quelle, kein Bereich überschreibt einen ungezogenen
            const folge = Array.from(s.bloecke.values()).sort((x, y) => x.vStart - y.vStart);
            let pos = 0;
            for (const b of folge) {
                const d = pos - b.vStart;
                if (d !== 0) {
                    for (const { name, gis } of s.attr)
                        s.geom.attributes[name].array.copyWithin(
                            pos * gis,
                            b.vStart * gis,
                            (b.vStart + b.vAnzahl) * gis
                        );
                    const idx = b.idx;
                    for (let i = 0; i < idx.length; i++) idx[i] += d;
                    b.vStart = pos;
                }
                pos += b.vAnzahl;
            }
            s.vEnde = pos;
            s.vFrei.length = 0;
        }
        s.abschnitte.clear();
        s.iEnde = 0;
        const alt = s.geom;
        this._chunkSatzGeometrie(s, vNeu, iNeu);
        s.geom.setDrawRange(0, 0); // der Index ist leer, bis jeder Pass seinen Abschnitt legt
        s.verdichtet = (s.verdichtet || 0) + 1;
        for (const k in alt.attributes) this._gpuAbschied(alt.attributes[k]);
        if (alt.index) this._gpuAbschied(alt.index);
        return true;
    }

    // Der EINE Mesh eines Satzes über seiner Pool-Geometrie (ein Wachsen tauscht nur die Geometrie).
    _chunkSatzMesh(s) {
        const spec = s.spec;
        const mesh = new THREE.Mesh(s.geom, spec.mat);
        mesh.name = spec.name;
        mesh.frustumCulled = false;
        mesh.castShadow = spec.schatten;
        mesh.receiveShadow = spec.empfang;
        mesh.renderOrder = spec.renderOrder;
        mesh.visible = s.grundAlt = this._chunkSatzGrund(s);
        Object.assign(mesh.userData, spec.userData);
        if (spec.nurWurf) mesh.layers.disable(0); // der Wurf-Satz: nur die Kaskaden (sein Wurf ist die Wurf-Ebene, K72)
        s.mesh = mesh;
        return mesh;
    }

    // Die Views eines Bereichs: jedes Float32-Attribut des Chunks zeigt in den Satz; ein gepacktes (`form`) behält der Chunk
    // als eigenes Float32-Array — der CPU-Leser liest den Wert des Gesetzes, die GPU seine Vertex-Form.
    _chunkSatzViews(s, b) {
        for (const { name, form, is } of s.attr)
            if (!form)
                b.geom.attributes[name].array = s.geom.attributes[name].array.subarray(
                    b.vStart * is,
                    (b.vStart + b.vAnzahl) * is
                );
    }

    // DIE VERTEX-FORM des Satzes (K44, gemessen 14.10. Radeon, Genesis third: der Boden-Satz 14,6 von 40,1 MB Puffer, 60 B je
    // Vertex, Normale und Farbe 24 B davon in Float32): die Normale (Einheitsvektor, |n| ≤ 1) reist als snorm8x4 (4 B, ≤ 0,45°
    // — die Form der Profi-Engines für Vertex-Normalen), die Farbe als float16x4 (8 B, 11 Bit Mantisse, Werte über 1 bleiben;
    // unorm hätte die Glut-Farben über 1 gekappt). Die vierte Komponente: Normale 0, Farbe 1 (Alpha). Rückgabe: die Form oder
    // null (Float32). Ohne Float16Array (vor Chrome 135) bleibt die Farbe Float32 — laut, einmal je Welt.
    _satzForm(form) {
        if (!form) return null;
        if (form === "snorm8") return form;
        if (form === "half") {
            if (typeof globalThis.Float16Array === "function") return form;
            if (!this._satzFormLaut) {
                this._satzFormLaut = true;
                this.log(
                    "VERTEX-FORM: Float16Array fehlt (Browser vor Chrome 135) — die Satz-Farbe bleibt Float32",
                    "ERROR"
                );
            }
            return null;
        }
        throw new Error(`_satzForm: unbekannte Vertex-Form „${form}"`);
    }

    // Packt `n` Vertices (Breite `is`, aus `src` ab Vertex 0) in die Vertex-Form `form` nach `dst` ab Vertex `ab` (Breite 4).
    // EINE Quelle für Satz und Linse (gate:chunk-satz (f) prüft den Bereich gegen genau diese Packung).
    // `w` (optional): ein Skalar je Vertex für die vierte Komponente (snorm8: −1…1, sonst roh; ohne: Normale 0, Farbe 1).
    static _satzPacke(form, src, is, dst, ab, n, w) {
        const o0 = ab * 4;
        if (form === "snorm8")
            for (let v = 0; v < n; v++) {
                const q = v * is,
                    o = o0 + v * 4;
                for (let k = 0; k < 3; k++) {
                    const x = src[q + k];
                    dst[o + k] = Math.round((x > 1 ? 1 : x < -1 ? -1 : x) * 127);
                }
                const x = w ? w[v] : 0;
                dst[o + 3] = Math.round((x > 1 ? 1 : x < -1 ? -1 : x) * 127);
            }
        else
            for (let v = 0; v < n; v++) {
                const q = v * is,
                    o = o0 + v * 4;
                dst[o] = src[q];
                dst[o + 1] = src[q + 1];
                dst[o + 2] = src[q + 2];
                dst[o + 3] = w ? w[v] : 1;
            }
    }

    // DER VERGLEICHENDE SCHREIBER der Sätze (K71): legt `quelle` (ein Array derselben Art, oder EIN Wert für `n` Plätze) ab
    // `ab` in `ziel` und schreibt nur den Lauf, der sich dort ändert — `lauf` trägt ihn danach als [von, bis) relativ zu `ab`;
    // Rückgabe false, wenn jedes Element schon so lag. Ein Satz-Schreiber hebt die Version seines Puffers nur über diesen
    // Lauf: eine gehobene Version ohne neue Bytes frischte jedes Render-Objekt des Satzes in jedem Pass voll auf (Genesis
    // Third in Ruhe: ein Bau-Bereich, dessen letzte Instanz der Cull nahm, trat mit denselben Bytes am selben Ort neu ein).
    static _satzSetze(ziel, ab, quelle, n, lauf) {
        const wert = typeof quelle === "number";
        if (!wert) n = quelle.length;
        let von = 0;
        if (wert) while (von < n && ziel[ab + von] === quelle) von++;
        else while (von < n && ziel[ab + von] === quelle[von]) von++;
        if (von === n) return false;
        let bis = n;
        if (wert) while (ziel[ab + bis - 1] === quelle) bis--;
        else while (ziel[ab + bis - 1] === quelle[bis - 1]) bis--;
        if (wert) ziel.fill(quelle, ab + von, ab + bis);
        else ziel.set(von === 0 && bis === n ? quelle : quelle.subarray(von, bis), ab + von);
        lauf[0] = von;
        lauf[1] = bis;
        return true;
    }

    // DIE FREILISTE des Satzes — EINE Mechanik für seine Vertex-Bereiche und die Zellen-Plätze seiner Abschnitte: Läufe
    // [start, länge], nach Start sortiert, Nachbarn verschmolzen. `_satzFreiNimm` nimmt First-Fit den ersten Lauf, der
    // reicht (−1: keiner); `_satzFreiGib` legt einen Lauf zurück und gibt das neue Hochwasser zurück (ein Lauf, der das
    // Hochwasser `ende` berührt, senkt es).
    _satzFreiNimm(frei, n) {
        for (let i = 0; i < frei.length; i++) {
            const f = frei[i];
            if (f[1] < n) continue;
            const start = f[0];
            if (f[1] === n) frei.splice(i, 1);
            else {
                f[0] += n;
                f[1] -= n;
            }
            return start;
        }
        return -1;
    }

    _satzFreiGib(frei, start, n, ende) {
        let i = 0;
        while (i < frei.length && frei[i][0] < start) i++;
        frei.splice(i, 0, [start, n]);
        if (i + 1 < frei.length && frei[i][0] + frei[i][1] === frei[i + 1][0]) {
            frei[i][1] += frei[i + 1][1];
            frei.splice(i + 1, 1);
        }
        if (i > 0 && frei[i - 1][0] + frei[i - 1][1] === frei[i][0]) {
            frei[i - 1][1] += frei[i][1];
            frei.splice(i, 1);
        }
        const letzt = frei[frei.length - 1];
        if (letzt && letzt[0] + letzt[1] === ende) {
            frei.pop();
            return letzt[0];
        }
        return ende;
    }

    // Ein Vertex-Bereich: First-Fit aus der Freiliste, sonst am Hochwasser; reicht die Kapazität nicht, wächst der Satz.
    _chunkSatzVAlloc(s, n) {
        const frei = this._satzFreiNimm(s.vFrei, n);
        if (frei >= 0) return frei;
        if (s.vEnde + n > s.vKap) this._chunkSatzGeometrie(s, Math.max(s.vEnde + n, Math.ceil(s.vKap * 1.5)), s.iKap);
        const start = s.vEnde;
        s.vEnde += n;
        return start;
    }

    // Ein Vertex-Bereich zurück in die Freiliste.
    _chunkSatzVFrei(s, start, n) {
        s.vEnde = this._satzFreiGib(s.vFrei, start, n, s.vEnde);
    }

    // DER EINE EINTRITT eines Chunk-Bürgers in die Szene: `key` ist der Bereichs-Name (Chunk-Key oder
    // `stitch:<chunk>`), `chunkKey` sein Chunk (für die Nah-fern-Ordnung). Fail-closed: jedes Satz-Attribut muss
    // mit seiner Breite vorliegen, ein Index muss da sein — ein fehlender Wert ist ein lauter Bruch.
    _chunkSatzEin(art, key, geom, chunkKey) {
        const s = this._chunkSatz(art);
        const alt = s.bloecke.get(key);
        if (alt) this._chunkSatzAus(art, key);
        const n = geom && geom.attributes && geom.attributes.position ? geom.attributes.position.count : 0;
        for (const [name, is, , w] of s.spec.attr)
            for (const [nm, b] of w
                ? [
                      [name, is],
                      [w, 1],
                  ]
                : [[name, is]]) {
                const a = geom && geom.attributes ? geom.attributes[nm] : null;
                if (!a || a.itemSize !== b || a.count !== n)
                    throw new Error(
                        `_chunkSatzEin(${art}, ${key}): Attribut ${nm} fehlt oder passt nicht (${n} Vertices)`
                    );
            }
        if (!geom.index || !geom.index.array) throw new Error(`_chunkSatzEin(${art}, ${key}): kein Index`);
        const vStart = this._chunkSatzVAlloc(s, n);
        const g = s.geom; // nach dem Alloc: ein Wachsen tauscht die Geometrie
        // Jedes Attribut lädt nur den Lauf, der sich ändert (K71, `_satzSetze`): ein Bereich, der am selben Ort neu eintritt
        // (der Cull nahm die letzte Instanz einer Bau-Gruppe), trägt dort meist dieselben Bytes. Ein gepacktes Attribut packt
        // dann erst in einen Vorrat und vergleicht; an einem fremden Ort packt es direkt.
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        const amOrt = !!alt && alt.vStart === vStart;
        for (const { name, is, form, gis, w } of s.attr) {
            const ga = g.attributes[name];
            let quelle = geom.attributes[name].array;
            if (form && amOrt) {
                const V = this._satzVorrat || (this._satzVorrat = new Map());
                let vr = V.get(ga.array.constructor);
                if (!vr || vr.length < n * gis)
                    V.set(ga.array.constructor, (vr = new ga.array.constructor(n * gis * 2)));
                AnazhRealm._satzPacke(form, quelle, is, vr, 0, n, w && geom.attributes[w].array);
                quelle = vr.subarray(0, n * gis);
            } else if (form) {
                AnazhRealm._satzPacke(form, quelle, is, ga.array, vStart, n, w && geom.attributes[w].array);
                ga.addUpdateRange(vStart * gis, n * gis);
                ga.needsUpdate = true;
                continue;
            }
            if (!AnazhRealm._satzSetze(ga.array, vStart * gis, quelle, 0, L)) continue;
            // in ganzen Vertices: ein gepacktes Element trägt 1 oder 2 Bytes, `writeBuffer` verlangt Vielfache von 4
            const v0 = Math.floor(L[0] / gis),
                v1 = Math.ceil(L[1] / gis);
            ga.addUpdateRange((vStart + v0) * gis, (v1 - v0) * gis);
            ga.needsUpdate = true;
        }
        const li = geom.index.array;
        const ck = String(chunkKey);
        const komma = ck.indexOf(",");
        const b = {
            key,
            chunkKey: ck,
            cx: Number(ck.slice(0, komma)),
            cz: Number(ck.slice(komma + 1)),
            geom,
            vStart,
            vAnzahl: n,
            idx: null,
            iAnzahl: li.length,
            zellen: null,
            huelle: null,
        };
        s.bloecke.set(key, b);
        s.vInhalt += n;
        this._chunkSatzViews(s, b);
        // Ein Boden-Chunk bringt seinen Höhlen-Graph (Welle 7): seine Zellen werden Knoten, verknüpft mit den Nachbarn
        if (geom.hoehle) this._hoehlenKnoten(s, b, geom.hoehle);
        this._chunkSatzZellen(b, li, vStart, geom.zellen || null, geom.hoehle || null);
        this._chunkSatzHuelle(s, b);
        if (b.hoehle) this._hoehlenVerknuepfe(s, b);
        // EIN FLÜCHTIGER BLOCK (K69, `_satzBlock`): seine Arrays sind Views der Werkbank — der Bereich hält keine davon (die
        // nächste Rechnung überschreibt sie), nur die Views in den Satz; wer die Werte braucht, rechnet sie aus `quelle` nach.
        if (geom.fluechtig) {
            for (const { name, form } of s.attr) if (form) geom.attributes[name].array = null;
            geom.index = null;
            geom.zellen = null;
        }
        s.iSumme += b.iAnzahl;
        s.schmutzig = true;
        return b;
    }

    // DIE ZELLEN eines Bereichs — die Einheit, die ein Pass wählt: der Bereichs-Index (um den Bereichs-Anfang verschoben)
    // legt sie als zusammenhängende Läufe hintereinander, je Zelle eine Hülle. Ein Bau-Bereich bringt seine Läufe mit
    // (`grenzen`: Index-Offsets, je Instanz einer — `_bauSatzBlock`; vorher zog die Kaskade den Lauf vom ersten bis zum letzten
    // Bereich im Frustum, k1 fast den ganzen Fels-Satz); ein Boden-/Wasser-Bereich zerfällt in VIERTEL (`_chunkSatzViertel`).
    // Fail-closed: Grenzen, die den Index nicht lückenlos in ganzen Dreiecken teilen, sind ein lauter Bruch.
    _chunkSatzZellen(b, li, vStart, grenzen, hoehle) {
        if (!grenzen) return this._chunkSatzViertel(b, li, vStart, hoehle);
        const ende = grenzen.length - 1;
        if (ende < 1 || grenzen[0] !== 0 || grenzen[ende] !== li.length)
            throw new Error(`_chunkSatzZellen(${b.key}): die Grenzen teilen den Index nicht (${li.length} Indizes)`);
        const idx = new Uint32Array(li.length);
        for (let i = 0; i < li.length; i++) idx[i] = li[i] + vStart;
        b.idx = idx;
        b.iAnzahl = idx.length;
        b.zellen = [];
        for (let z = 0; z < ende; z++) {
            const a = grenzen[z],
                e = grenzen[z + 1];
            if (e < a || a % 3 !== 0 || e % 3 !== 0)
                throw new Error(`_chunkSatzZellen(${b.key}): Grenze ${z} [${a}, ${e}) teilt kein ganzes Dreieck`);
            if (e > a) b.zellen.push({ bereich: b, idx: idx.subarray(a, e), huelle: new THREE.Box3() });
        }
    }

    // DIE VIERTEL eines Boden-/Wasser-Bereichs: jedes Dreieck nach seinem Schwerpunkt (xz) in eine von 2×2 Zellen um die
    // Mitte der Lage des Bereichs (Werkbank 05.10., Mess-Wiese, Mittag, ein Blick: ganze Chunks 337k Dreiecke über drei
    // Pässe, Viertel 282k, Sechzehntel 263k). Ein Boden-Chunk mit Höhlen-Graph (Welle 7) legt die Dreiecke der HIMMELS-Luft
    // in die Viertel und jedes Dreieck der Höhlen-Luft in die Zelle seines Knotens (`knoten`: nur sie wählt die Höhlen-Sicht).
    _chunkSatzViertel(b, li, vStart, hoehle) {
        const P = b.geom.attributes.position.array;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let k = 0; k < P.length; k += 3) {
            if (P[k] < x0) x0 = P[k];
            if (P[k] > x1) x1 = P[k];
            if (P[k + 2] < z0) z0 = P[k + 2];
            if (P[k + 2] > z1) z1 = P[k + 2];
        }
        // gegen die Schwerpunkt-SUMME (drei Ecken) verglichen: die Mitte × 3
        const mx3 = 1.5 * (x0 + x1),
            mz3 = 1.5 * (z0 + z1);
        const nT = (li.length / 3) | 0;
        // Zellen 0…3 die Viertel der Himmels-Luft, 4 + k der Höhlen-Knoten k
        const H = hoehle ? hoehle.tri : null;
        if (H && H.length !== nT)
            throw new Error(`_chunkSatzViertel(${b.key}): ${H.length} Höhlen-Zellen für ${nT} Dreiecke`);
        const nZ = 4 + (hoehle ? hoehle.n : 0);
        const zelle = new Int32Array(nT);
        const zahl = new Int32Array(nZ);
        for (let t = 0, i = 0; t < nT; t++, i += 3) {
            let z;
            if (H && H[t] >= 0) z = 4 + H[t];
            else {
                const a = li[i] * 3,
                    c = li[i + 1] * 3,
                    d = li[i + 2] * 3;
                z = (P[a] + P[c] + P[d] > mx3 ? 1 : 0) + (P[a + 2] + P[c + 2] + P[d + 2] > mz3 ? 2 : 0);
            }
            zelle[t] = z;
            zahl[z]++;
        }
        const start = new Int32Array(nZ);
        for (let z = 1; z < nZ; z++) start[z] = start[z - 1] + zahl[z - 1] * 3;
        const idx = new Uint32Array(nT * 3);
        const pos = start.slice();
        for (let t = 0, i = 0; t < nT; t++, i += 3) {
            const p = pos[zelle[t]];
            idx[p] = li[i] + vStart;
            idx[p + 1] = li[i + 1] + vStart;
            idx[p + 2] = li[i + 2] + vStart;
            pos[zelle[t]] = p + 3;
        }
        b.idx = idx;
        b.iAnzahl = idx.length;
        b.zellen = [];
        for (let z = 0; z < nZ; z++)
            if (zahl[z] > 0) {
                const zl = {
                    bereich: b,
                    idx: idx.subarray(start[z], start[z] + zahl[z] * 3),
                    huelle: new THREE.Box3(),
                };
                if (z >= 4) {
                    zl.knoten = b.hoehle.knoten[z - 4];
                    zl.knoten.zelle = zl;
                }
                b.zellen.push(zl);
            }
    }

    // DIE HÜLLE eines Bereichs und seiner Zellen (Welt-AABB + `randM`): der Satz lebt außerhalb jedes Bundles (EIN
    // Szenen-Mesh), jeder Pass wählt seine Zellen über ihre Hülle (`_chunkSatzAbschnitt`); die Kaskaden-Box liest die
    // Bereichs-Hülle jedes werfenden Satzes als Empfänger-Band (der Boden unter der Scheibe empfängt) und als Werfer (ein
    // Hang zur Sonne hin wirft über die nahe Ebene). Der Boden-Shader zeichnet zwischen Position und Morph-Ziel; das Ziel
    // zählt nur, wo sein Gewicht greift (ungewichtete Ziele tragen keine Lage). Ein Satz, dessen Stoff die Fläche senkrecht
    // hebt (das Wasser, `spec.hub` = `_wasserHubM`), trägt den Hub oben und unten.
    _chunkSatzHuelle(s, b) {
        s.stand++;
        const h = b.huelle || (b.huelle = new THREE.Box3());
        h.makeEmpty();
        const A = b.geom.attributes;
        const P = A.position.array,
            Z = A.aMorphTarget ? A.aMorphTarget.array : null;
        const vs = b.vStart;
        const rand = AnazhRealm.SCHATTEN_KASKADE.randM;
        const hub = s.spec.hub || 0;
        for (const zelle of b.zellen) {
            const I = zelle.idx;
            let x0 = Infinity,
                y0 = Infinity,
                z0 = Infinity,
                x1 = -Infinity,
                y1 = -Infinity,
                z1 = -Infinity;
            const dazu = (q, k) => {
                const x = q[k],
                    y = q[k + 1],
                    z = q[k + 2];
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
                if (z < z0) z0 = z;
                if (z > z1) z1 = z;
            };
            for (let i = 0; i < I.length; i++) {
                const v = I[i] - vs;
                dazu(P, v * 3);
                // das Morph-Ziel trägt Lage, sobald der Geomorph greift — Naht wie Stufe (K51-2: das Stufen-Gewicht folgt dem
                // Auge, jedes Ziel kann ganz gezeichnet werden)
                if (Z) dazu(Z, v * 3);
            }
            const zh = zelle.huelle;
            zh.makeEmpty();
            if (x1 >= x0) {
                zh.min.set(x0, y0, z0);
                zh.max.set(x1, y1, z1);
                zh.expandByScalar(rand);
                zh.min.y -= hub;
                zh.max.y += hub;
                h.union(zh);
            }
        }
    }

    // Der Austritt: die Chunk-Geometrie behält ihre Daten als EIGENE Kopie (ihr Bereich wird frei und neu
    // vergeben), jeder Abschnitt legt sich in seinem nächsten Pass neu.
    _chunkSatzAus(art, key) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        const b = s ? s.bloecke.get(key) : null;
        if (!b) return false;
        // ein flüchtiger Block (`_satzBlock`) hat keinen Eigner, der seine Daten behielte — keine Kopie
        if (!b.geom.fluechtig)
            for (const { name, form } of s.attr) {
                const a = b.geom.attributes[name];
                if (a && !form) a.array = a.array.slice(); // ein gepacktes trägt der Chunk ohnehin selbst
            }
        if (b.hoehle) this._hoehlenLoese(s, b);
        this._chunkSatzVFrei(s, b.vStart, b.vAnzahl);
        s.bloecke.delete(key);
        s.vInhalt -= b.vAnzahl;
        s.iSumme -= b.iAnzahl;
        s.schmutzig = true;
        return true;
    }

    // Ein CPU-Schreiber (Geomorph) hat Attribute seines Bereichs geändert → genau dieser Bereich lädt hoch.
    _chunkSatzMarke(art, key, namen) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        const b = s ? s.bloecke.get(key) : null;
        if (!b) throw new Error(`_chunkSatzMarke(${art}, ${key}): kein Bereich im Satz`);
        if (b.geom.fluechtig)
            throw new Error(
                `_chunkSatzMarke(${art}, ${key}): ein flüchtiger Block trägt keinen CPU-Schreiber (_satzBlock)`
            );
        // je geschriebenem Namen das Satz-Attribut, das ihn trägt — selbst oder in seiner vierten Komponente (`w`)
        for (const fa of s.attr) {
            if (!namen.includes(fa.name) && !(fa.w && namen.includes(fa.w))) continue;
            const ga = s.geom.attributes[fa.name];
            // ein gepacktes Attribut liest der Schreiber im Chunk (Float32) — der Satz packt es neu
            if (fa.form)
                AnazhRealm._satzPacke(
                    fa.form,
                    b.geom.attributes[fa.name].array,
                    fa.is,
                    ga.array,
                    b.vStart,
                    b.vAnzahl,
                    fa.w && b.geom.attributes[fa.w].array
                );
            ga.addUpdateRange(b.vStart * ga.itemSize, b.vAnzahl * ga.itemSize);
            ga.needsUpdate = true;
        }
        this._chunkSatzHuelle(s, b); // der Geomorph legt neue Ziele — die Hülle folgt
        // und der Horizont (`_hoehlenHorizont`) liest sie neu — jede gemerkte Sperre misst ihn neu (`H.boden`)
        if (b.hoehle) {
            b.hoehle.horizont = null;
            s.hoehle.boden++;
        }
    }

    // Die Grund-Sicht des Satzes (außerhalb jedes Passes): nicht verborgen und ein Bereich da.
    _chunkSatzGrund(s) {
        return !s.verborgen && s.iSumme > 0;
    }

    _chunkSatzSichtbar(art, sichtbar) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        if (!s) return;
        s.verborgen = !sichtbar;
        s.grundAlt = this._chunkSatzGrund(s);
        s.mesh.visible = s.grundAlt;
    }

    // Je Render (vor dem Zeichnen): jeder geänderte Satz ordnet seine Bereiche neu (ein Spieler-Chunk-Wechsel: Ring-
    // Distanz); die Abschnitte legt jeder Pass in seinem Haken.
    _tickChunkSatz() {
        this._tickBauSatz();
        const saetze = this.state.chunkSaetze;
        if (!saetze || saetze.size === 0) return;
        for (const s of saetze.values()) {
            s.takt++;
            this._chunkSatzBereit(s);
            this._chunkSatzVerdichten(s);
        }
    }

    _chunkSatzBereit(s) {
        const lpc = this.state.lastPlayerVoxelChunk;
        const anker = lpc ? lpc.cx + "," + lpc.cz : "";
        if (s.schmutzig || s.anker !== anker) this._chunkSatzOrdnen(s, lpc, anker);
    }

    _chunkSatzOrdnen(s, lpc, anker) {
        const pcx = lpc ? lpc.cx : 0,
            pcz = lpc ? lpc.cz : 0;
        const r = s.spec.richtung;
        const neu = Array.from(s.bloecke.values());
        for (const b of neu) b._d = lpc ? Math.max(Math.abs(b.cx - pcx), Math.abs(b.cz - pcz)) : 0;
        neu.sort((a, b) => (a._d - b._d) * r || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
        s.ordnung = neu;
        s.stand++;
        // die Grund-Sicht schreibt der Satz nur, wenn sie kippt (erster Bereich, letzter fort) — ein Werkzeug, das ihn
        // verbirgt, bleibt Herr seiner Sicht
        const grund = this._chunkSatzGrund(s);
        if (grund !== s.grundAlt) {
            s.mesh.visible = grund;
            s.grundAlt = grund;
        }
        s.schmutzig = false;
        s.anker = anker;
    }

    // DER SATZ JE PASS (aus `_passSicht`, dem Haken jedes Renders, mit der Lage des Passes in `S.lage`): jeder Satz zeichnet
    // in diesem Pass seinen Abschnitt — die Zellen, deren Hülle das EINE Gesetz der Pass-Wahl trifft (`_passTrifftBox`). Das
    // Hauptbild wählt mit dem Frustum der Haupt-Kamera, jede Kaskade (`k` ≥ 0) mit ihrer Box (die Kaskaden-Kamera samt
    // Werfer-Raum zum Licht: ein Hang hinter dem Blick, der in die nahe Scheibe wirft, wirft) UND der Licht-Kapsel gegen ihre
    // Scheibe (eine Zelle, deren Schatten keinen Empfänger der Scheibe trifft, wirft dort nicht), jede andere Kamera mit ihrem
    // Frustum; ein Satz, der nicht wirft, ruht im Schatten-Pass (three zieht ihn dort nie). Nach jedem Pass zeigt der Satz
    // wieder den Abschnitt des Hauptbilds — ein Schatten-Pass läuft mitten im Haupt-Pass. STEHT die Lage des Passes und der
    // Stand des Satzes (`_satzAbschnittSteht`, Welle C), zeichnet der Abschnitt, wie er liegt: keine Höhlen-Sicht, keine
    // Prüfung, kein Byte — nach jedem Pass, auch dem Nachher-Haken, rechnet nichts neu.
    _chunkSatzPass(kamera, nach, k, S) {
        const saetze = this.state.chunkSaetze;
        if (!saetze || saetze.size === 0) return;
        const haupt = !nach && kamera === this.state.camera;
        const key = nach || haupt ? "haupt" : k >= 0 ? "k" + k : "anders";
        for (const s of saetze.values()) {
            if (nach) {
                this._chunkSatzZeige(s, s.abschnitte.get("haupt"), null);
                continue;
            }
            if (k >= 0 && s.spec.schatten !== true) continue;
            this._chunkSatzBereit(s);
            // Das Hauptbild läuft vor jedem Zeichnen des Frames: hier legt der Satz seine Abschnitte dicht neu, sobald der
            // Verschnitt (die verlassenen Läufe umgezogener Abschnitte) wächst.
            if (haupt) {
                let belegt = 0;
                for (const a of s.abschnitte.values()) belegt += a.kap;
                if (s.iEnde - belegt > s.iKap * AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt)
                    this._chunkSatzUmlegen(s, null, 0, key);
            }
            // DER WURF-SATZ (S3, `nurWurf`) zeichnet nur in den Kaskaden: das Hauptbild legt seine Abschnitte dicht (oben),
            // wählt keine Zelle und zieht keinen Befehl
            if (k < 0 && s.spec.nurWurf === true) {
                this._chunkSatzZeige(s, null, null);
                continue;
            }
            let a = s.abschnitte.get(key);
            if (this._satzAbschnittSteht(s, a, S.lage, kamera)) {
                this._chunkSatzRuht(s, a, key);
                // die Höhlen-Sicht dieses Passes prüfte keine Mündung frisch
                if (s.hoehle && s.hoehle.offen && kamera.isPerspectiveCamera === true) s.hoehle.offen.length = 0;
            } else {
                // Die Höhlen-Schicht (Welle 7): welche Höhlen-Zelle die Pass-Kamera durch Luft erreicht
                if (s.hoehle) this._hoehlenSicht(s, kamera, S, haupt);
                a = this._chunkSatzAbschnitt(s, key, S.lage, haupt);
                this._satzAbschnittMerke(s, a, S.lage, kamera);
            }
            this._chunkSatzZeige(s, a, S.ab);
        }
    }

    // STEHT der Abschnitt eines Passes (Welle C)? Er wurde in derselben Lage gewählt (`L.gen`, `_passLageGen`), der Satz hat
    // seither keinen Bereich, keine Hülle und keine Ordnung geändert (`s.stand`), und seine Höhlen-Sicht gilt noch: derselbe
    // Boden (`H.boden`); perspektivisch trug sie jede Mündung im Bild mit ihrer Horizont-Sperre (`voll` — eine Mündung ohne
    // frische Probe galt als offen, die nächste Wahl schneidet weiter), die Kaskade las dieselben Empfänger des Hauptbilds
    // (`H.sichtGen`). Und der Abschnitt trägt noch die Zellen seiner Wahl (dieselbe Liste — wer ihn leert oder neu legt,
    // legt eine neue).
    _satzAbschnittSteht(s, a, L, kamera) {
        const w = a && a.wahl;
        if (!w || w.gen !== L.gen || w.stand !== s.stand || w.liste !== a.liste) return false;
        const H = s.hoehle;
        if (!H) return true;
        if (w.boden !== H.boden) return false;
        return kamera.isPerspectiveCamera === true ? w.voll === true : w.empfang === H.sichtGen;
    }

    _satzAbschnittMerke(s, a, L, kamera) {
        const w = a.wahl || (a.wahl = { gen: 0, stand: 0, boden: 0, voll: false, empfang: 0, liste: null });
        const H = s.hoehle;
        w.gen = L.gen;
        w.liste = a.liste;
        w.stand = s.stand;
        w.boden = H ? H.boden : 0;
        w.voll = H ? kamera.isPerspectiveCamera === true && H.voll === true : true;
        w.empfang = H ? H.sichtGen : 0;
    }

    // Ein Abschnitt, dessen Wahl ruht: er lebt (`takt`), und nach `dichtNach` ruhigen Pässen legt sich ein Lauf mit Lücken
    // oder fremder Folge einmal dicht in Satz-Ordnung (ein Pass, der beim Drehen nur einen Frame stillsteht, verdichtet nicht).
    _chunkSatzRuht(s, a, key) {
        a.takt = s.takt;
        if (!a.dicht && ++a.ruhe >= AnazhRealm.CHUNK_SATZ_ABSCHNITT.dichtNach)
            this._chunkSatzDicht(s, a, a.liste, a.n, key, false);
        return a;
    }

    // Der Abschnitt wird der Zeichen-Bereich [start, start + ende) — seine Zellen und die entarteten Lücken zwischen ihnen;
    // ein Abschnitt ohne Zelle ruht diesen Pass (`ab` merkt den Satz für die Rückkehr am Anfang des nächsten Hakens, wie die
    // abgewählten Werfer) — sonst bleibt die Sicht, wie sie ist (Grund-Sicht, Werkzeug).
    _chunkSatzZeige(s, a, ab) {
        const n = a ? a.n : 0;
        s.geom.setDrawRange(a ? a.start : 0, n > 0 ? a.ende : 0);
        if (ab && n === 0 && s.mesh.visible) {
            s.mesh.visible = false;
            ab.push(s.mesh);
        }
    }

    // DER ABSCHNITT eines Passes: die Zellen in Satz-Ordnung, deren Hülle das Gesetz der Pass-Wahl in der Lage L trifft
    // (erst der Bereich, dann seine Zellen — jede Zelle liegt in der Hülle ihres Bereichs), in EINEM Lauf des Index
    // (`start`, Kapazität `kap`, Hochwasser `ende`); jede Zelle hat dort ihren PLATZ. Dieselben Zellen wie im letzten Pass
    // schreiben nichts. Ändert sich die Wahl, schreibt der Pass nur die Änderung (`_chunkSatzTausch`): eine Zelle, die geht,
    // hinterlässt eine entartete Lücke (drei gleiche Ecken zeichnen nichts), eine, die kommt, nimmt First-Fit eine Lücke
    // oder hängt an — Befund 06.10. (echte GPU, Mess-Wiese, Drehen 1°/Frame): der Pass schrieb ab dem ersten Unterschied
    // neu, 0,5–0,7 MB je Pass und Frame. Ein Satz, der seine Ordnung braucht (das durchscheinende Wasser, fern → nah),
    // schreibt dicht ab dem ersten Unterschied. Dicht in Satz-Ordnung (das Early-Z der Nah-fern-Folge, exakt) legt der Pass
    // neu, wenn die Wahl ruht, die Lücken `verschnitt` des Laufs übersteigen oder eine Zelle keinen Platz findet. Passt die
    // Zahl der Indizes nicht in die Kapazität, zieht der Abschnitt um: hinten an, wo Platz ist, sonst legt
    // `_chunkSatzUmlegen` alle Abschnitte dicht neu (`umlegen`: das Hauptbild, vor jedem Zeichnen des Frames). Kein Pass
    // nimmt einem anderen seinen Lauf (vorher verdrängten die Kaskaden einander: 32 Verdrängungen in 36 Frames, 2,2 MB je
    // Frame für k0 + k1); reicht der Index nicht, wächst er.
    _chunkSatzAbschnitt(s, key, L, umlegen) {
        const liste = [];
        let n = 0;
        // eine Höhlen-Zelle (Welle 7) zeichnet nur, wenn die Höhlen-Sicht dieses Passes sie erreicht hat
        const stempel = s.hoehle ? s.hoehle.stempel : 0;
        for (const b of s.ordnung) {
            if (!b.huelle || b.huelle.isEmpty() || !this._passTrifftBox(L, b.huelle, 0)) continue;
            for (const z of b.zellen)
                if (
                    (z.knoten === undefined || z.knoten.sicht === stempel) &&
                    !z.huelle.isEmpty() &&
                    this._passTrifftBox(L, z.huelle, 0)
                ) {
                    liste.push(z);
                    n += z.idx.length;
                }
        }
        let a = s.abschnitte.get(key);
        if (a) {
            a.takt = s.takt;
            // die Wahl ruht (dieselben Zellen in derselben Folge)
            if (this._satzListeGleich(a.liste, liste)) return this._chunkSatzRuht(s, a, key);
            a.ruhe = 0;
            if (n > a.hoch) a.hoch = n;
        } else {
            a = {
                key,
                start: 0,
                kap: 0,
                n: 0,
                ende: 0,
                liste: [],
                platz: new Map(),
                frei: [],
                dicht: true,
                ruhe: 0,
                hoch: n,
                takt: s.takt,
            };
            s.abschnitte.set(key, a);
        }
        if (n > a.kap) {
            const kap = this._chunkSatzKap(a.hoch);
            this._chunkSatzLeer(a);
            if (umlegen || s.iEnde + kap > s.iKap) this._chunkSatzUmlegen(s, a, kap, key);
            else {
                a.start = s.iEnde;
                a.kap = kap;
                s.iEnde += kap;
            }
            this._chunkSatzDicht(s, a, liste, n, key, false);
        } else if (s.spec.richtung < 0 || a.liste.length === 0) this._chunkSatzDicht(s, a, liste, n, key, true);
        else this._chunkSatzTausch(s, a, liste, n, key);
        return a;
    }

    _satzListeGleich(x, y) {
        if (x.length !== y.length) return false;
        for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
        return true;
    }

    // Ein Abschnitt ohne Inhalt (vor einem Umzug, ohne Zelle).
    _chunkSatzLeer(a) {
        a.liste = [];
        a.n = 0;
        a.ende = 0;
        a.platz.clear();
        a.frei.length = 0;
        a.dicht = true;
    }

    // DICHT: die Zellen der Wahl in Satz-Ordnung hintereinander ab `start`; `abUnterschied` (der Lauf liegt schon dicht in
    // Satz-Ordnung) schreibt erst ab der ersten Zelle, die sich unterscheidet.
    _chunkSatzDicht(s, a, liste, n, wer, abUnterschied) {
        const index = s.geom.index.array;
        let p = 0;
        if (abUnterschied && a.dicht) {
            const alt = a.liste;
            while (p < alt.length && p < liste.length && alt[p] === liste[p]) p++;
        }
        a.platz.clear();
        a.frei.length = 0;
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        let o = 0,
            von = -1,
            bis = -1;
        for (let i = 0; i < liste.length; i++) {
            const z = liste[i];
            a.platz.set(z, o);
            // eine Zelle, die mit denselben Indizes am selben Platz liegt (ein Bereich, der neu eintrat), lädt nichts
            if (i >= p && AnazhRealm._satzSetze(index, a.start + o, z.idx, 0, L)) {
                if (von < 0) von = o + L[0];
                bis = o + L[1];
            }
            o += z.idx.length;
        }
        if (von >= 0) this._chunkSatzSchreib(s, wer, a.key, a.start + von, bis - von);
        a.ende = o;
        a.n = n;
        a.liste = liste;
        a.dicht = true;
    }

    // DER TAUSCH: nur die Änderung der Wahl — jede Zelle, die geht, wird eine entartete Lücke (ihr erster Index für jede
    // Ecke: ein Dreieck ohne Fläche zeichnet nichts) oder fällt am Hochwasser ab; jede, die kommt, nimmt First-Fit eine
    // Lücke (dieselbe Freiliste wie die Vertex-Bereiche) oder hängt an. Findet sie keinen Platz oder übersteigen die Lücken
    // `verschnitt` des Laufs, rafft der Pass (`_chunkSatzRaffen`). Die Plätze, die gehen, werden erst NACH dem Einzug entartet,
    // und nur, wo keine kommende Zelle sie belegt (Welle C — beim Drehen geht auf der einen Seite, was auf der anderen kommt:
    // vorher schrieb der Pass jeden frei gewordenen Platz zweimal, entartet und neu belegt).
    _chunkSatzTausch(s, a, liste, n, wer) {
        const index = s.geom.index.array;
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        const neu = new Set(liste);
        const offen = []; // die frei gewordenen Plätze: Anfang, Länge, der Index ihrer Entartung
        for (const [z, off] of a.platz)
            if (!neu.has(z)) {
                const len = z.idx.length;
                a.platz.delete(z);
                a.ende = this._satzFreiGib(a.frei, off, len, a.ende);
                offen.push(off, len, z.idx[0]);
            }
        const belegt = []; // die Plätze der kommenden Zellen: Anfang, Ende
        for (const z of liste)
            if (!a.platz.has(z)) {
                const len = z.idx.length;
                let off = this._satzFreiNimm(a.frei, len);
                if (off < 0) {
                    if (a.ende + len > a.kap) return this._chunkSatzDicht(s, a, liste, n, wer, false);
                    off = a.ende;
                    a.ende += len;
                }
                if (AnazhRealm._satzSetze(index, a.start + off, z.idx, 0, L))
                    this._chunkSatzSchreib(s, wer, a.key, a.start + off + L[0], L[1] - L[0]);
                a.platz.set(z, off);
                belegt.push([off, off + len]);
            }
        // die frei gewordenen Plätze unter dem Hochwasser, die keine kommende Zelle belegt: entartet
        belegt.sort((x, y) => x[0] - y[0]);
        for (let k = 0; k < offen.length; k += 3) {
            const o = offen[k],
                e = Math.min(offen[k] + offen[k + 1], a.ende),
                w = offen[k + 2];
            let lo = 0,
                hi = belegt.length;
            while (lo < hi) {
                const m = (lo + hi) >> 1;
                if (belegt[m][1] <= o) lo = m + 1;
                else hi = m;
            }
            let cur = o;
            for (let i = lo; i < belegt.length && belegt[i][0] < e && cur < e; i++) {
                if (belegt[i][0] > cur && AnazhRealm._satzSetze(index, a.start + cur, w, belegt[i][0] - cur, L))
                    this._chunkSatzSchreib(s, wer, a.key, a.start + cur + L[0], L[1] - L[0]);
                if (belegt[i][1] > cur) cur = belegt[i][1];
            }
            if (cur < e && AnazhRealm._satzSetze(index, a.start + cur, w, e - cur, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + cur + L[0], L[1] - L[0]);
        }
        a.n = n;
        a.liste = liste;
        a.dicht = false;
        if (a.ende - n > a.ende * AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt)
            this._chunkSatzRaffen(s, a, liste, n, wer);
    }

    // DAS RAFFEN (Welle C): übersteigen die Lücken eines getauschten Abschnitts `verschnitt` seines Laufs, rücken seine
    // HINTERSTEN Zellen in die vordersten Lücken, die sie fassen (First-Fit vor ihrem Platz), bis die Lücken unter die halbe
    // Schwelle fallen — geschrieben wird nur, was umzieht; eine Zelle am Hochwasser senkt es. Bis hier legte der Pass den
    // ganzen Abschnitt dicht neu (beim Drehen 360 × 1° an der Mess-Wiese: die Kaskaden je Neulegung 0,5–0,9 MB, gut ein
    // Drittel aller Index-Bytes). Fasst keine Lücke eine Zelle und bleibt der Verschnitt, legt der Pass dicht neu.
    _chunkSatzRaffen(s, a, liste, n, wer) {
        const V = AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt;
        const index = s.geom.index.array;
        const hinten = Array.from(a.platz).sort((x, y) => y[1] - x[1]);
        for (let k = 0; k < hinten.length && a.ende - n > a.ende * V * 0.5; k++) {
            const [z, off] = hinten[k];
            const len = z.idx.length;
            // die vorderste Lücke, die die Zelle ganz vor ihrem Platz fasst
            const frei = a.frei;
            let neu = -1;
            for (let i = 0; i < frei.length && frei[i][0] + len <= off; i++) {
                const f = frei[i];
                if (f[1] < len) continue;
                neu = f[0];
                if (f[1] === len) frei.splice(i, 1);
                else {
                    f[0] += len;
                    f[1] -= len;
                }
                break;
            }
            if (neu < 0) continue;
            const L = this._satzLauf || (this._satzLauf = [0, 0]);
            if (AnazhRealm._satzSetze(index, a.start + neu, z.idx, 0, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + neu + L[0], L[1] - L[0]);
            a.platz.set(z, neu);
            a.ende = this._satzFreiGib(a.frei, off, len, a.ende);
            if (off < a.ende && AnazhRealm._satzSetze(index, a.start + off, z.idx[0], len, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + off + L[0], L[1] - L[0]);
        }
        if (a.ende - n > a.ende * V) this._chunkSatzDicht(s, a, liste, n, wer, false);
    }

    // Die Kapazität eines Abschnitts: das Hochwasser seiner Länge (`hoch`, die größte Wahl seines Passes) mit Luft — er
    // wächst, ohne umzuziehen; ein Umzug zieht die anderen Abschnitte mit (Befund 06.10., echte GPU, Mess-Wiese, Drehen
    // 1°/Frame: mit der Kapazität aus der LETZTEN Länge zogen die Kaskaden beim Drehen je Frame im Mittel 0,18 MB fremd um).
    // Auf 3072 Indizes gerundet.
    _chunkSatzKap(n) {
        return n > 0 ? Math.ceil((n * AnazhRealm.CHUNK_SATZ_ABSCHNITT.luft) / 3072) * 3072 : 0;
    }

    // DAS UMLEGEN: alle Abschnitte dicht ab 0, das Hauptbild zuerst (ein Abschnitt, den seit `ruheTakte` Takten kein Pass
    // fragte, fällt), jeder mit frischer Luft; `neu` (der Abschnitt, der nicht passte) bekommt `kapNeu` und schreibt der
    // Aufrufer, jeder andere zieht MIT seinem Inhalt um; reicht der Index nicht, wächst er (×1,25 oder auf die Summe). Das
    // Hauptbild liegt immer bei 0 — ein Umlegen mitten im Frame (ein anderer Pass, `wer`) lässt seinen Lauf unberührt, den
    // der schon aufgezeichnete Befehl des Haupt-Passes liest; ein dichter Abschnitt, der an seiner Stelle bleibt, schreibt
    // nichts.
    _chunkSatzUmlegen(s, neu, kapNeu, wer) {
        const R = AnazhRealm.CHUNK_SATZ_ABSCHNITT.ruheTakte;
        for (const [k, a] of s.abschnitte) if (a !== neu && s.takt - a.takt > R) s.abschnitte.delete(k);
        const h = s.abschnitte.get("haupt");
        const hauptFest = !!h && h !== neu && wer !== "haupt";
        const folge = h ? [h] : [];
        for (const a of s.abschnitte.values()) if (a !== h) folge.push(a);
        let summe = 0;
        for (const a of folge) {
            if (a === neu) a.kap = kapNeu;
            else if (!(a === h && hauptFest)) a.kap = this._chunkSatzKap(a.hoch);
            summe += a.kap;
        }
        if (summe > s.iKap) this._chunkSatzGeometrie(s, s.vKap, Math.max(summe, Math.ceil(s.iKap * 1.25)));
        let pos = 0;
        for (const a of folge) {
            const vorher = a.start;
            a.start = pos;
            pos += a.kap;
            if (a === neu || (a === h && hauptFest)) continue;
            if (a.n === 0) this._chunkSatzLeer(a);
            else if (a.start !== vorher || !a.dicht) this._chunkSatzDicht(s, a, a.liste, a.n, wer, false);
        }
        s.iEnde = pos;
    }

    // Der EINE Index-Schreiber (Teil-Upload ab `ab`, `n` Indizes — der Lauf, den `_satzSetze` änderte); die Neuschreib-Linse bucht die Bytes auf
    // „Verursacher>Abschnitt" — `wer` ≠ `wen` heißt: ein Pass schrieb den Abschnitt eines anderen.
    _chunkSatzSchreib(s, wer, wen, ab, n) {
        const index = s.geom.index;
        index.addUpdateRange(ab, n);
        index.needsUpdate = true;
        const k = wer + ">" + wen;
        s.schreiben[k] = (s.schreiben[k] || 0) + 4 * n;
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
