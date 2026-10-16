class AnazhRealm_Z17a {
    // ===== ATLAS §17 · ARCHITEKTUR-HISM — Instancing · Welt-Spawns · Culling =====
    // Die Welt-Matrix eines Architektur-Eintrags (ohne die Leaf-Lokal-
    // Matrix): T(pos.x, pos.y-0.5, pos.z) × S(scale). Spiegelt exakt, was
    // `_rebuildArchitectureMesh` der klassischen Group gibt (group.position
    // = baseY = pos.y-0.5, group.scale = scalar(scale), keine Rotation).
    // `ungefedert` (Welle L, Q13 F-D8): die Lage der RÄDER — Gelände-Nick und -Wank ja, die Aufbau-Federn (Nick, Kurven-
    // Wank, Hub) nein: beim Bremsen taucht der Aufbau, die Räder bleiben am Boden.
    _archEntryWorldMatrix(entry, out, ungefedert) {
        const m = out || new THREE.Matrix4();
        // HEAVE (N7-Rest, 19.07.) — der Squat des gerittenen Studio-Gefaehrts
        // reist in die Instanz-Matrix (0/undefined fuer alles Nicht-Gerittene =
        // byte-alte Matrix; dasselbe Muster wie rp/rr unten).
        const baseY =
            (Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0) +
            (!ungefedert && Number.isFinite(entry._rideHeave) ? entry._rideHeave : 0);
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        // PRO-INSTANZ-ROTATION: `entry.rotationY` (seed-gesetzt für Bäume/Felsen, default 0 = Bauwerke
        // unberührt) dreht die Instanz um die Hoch-Achse — sonst liest sich ein Wald als Klon-Feld. Reine
        // Instanz-Matrix; der Quadrat-AABB der Kollision überdeckt den gedrehten Stamm.
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        // Render-Nick des gerittenen Studio-Gefährts: kleiner R_x NACH R_y·S (Scale uniform → kommutiert);
        // entry._ridePitch setzt nur _tickMountedMovement (Feder-Rezept), sonst unveränderte Matrix. Gelände-
        // Nick addiert, Wank als R_z danach. NUR Optik — Kollisions-AABB/Blocker lesen rotationY allein.
        const rp =
            (!ungefedert && Number.isFinite(entry._ridePitch) ? entry._ridePitch : 0) +
            (Number.isFinite(entry._rideTerrainPitch) ? entry._rideTerrainPitch : 0);
        // ZENSUS-REST V18.488 — der Kurven-Wank addiert auf den Gelände-Wank
        // (derselbe R_z wie der Group-Pfad; 0 für Nicht-Gerittenes).
        const rr =
            (Number.isFinite(entry._rideRoll) ? entry._rideRoll : 0) +
            (!ungefedert && Number.isFinite(entry._rideKurvenRoll) ? entry._rideKurvenRoll : 0);
        if (ry !== 0) {
            const c = Math.cos(ry);
            const sn = Math.sin(ry);
            // T × R_y × S (Spalten-Major, Three.js): R_y skaliert mit s.
            m.set(
                c * s,
                0,
                sn * s,
                entry.position.x || 0,
                0,
                s,
                0,
                baseY,
                -sn * s,
                0,
                c * s,
                entry.position.z || 0,
                0,
                0,
                0,
                1
            );
            if (rp || rr) this._archRittNeigung(entry, m, rp, rr);
            return m;
        }
        // compose(T, R=identity, S) — direkt gesetzt (schneller als compose).
        m.makeScale(s, s, s);
        m.elements[12] = entry.position.x || 0;
        m.elements[13] = baseY;
        m.elements[14] = entry.position.z || 0;
        if (rp || rr) this._archRittNeigung(entry, m, rp, rr);
        return m;
    }

    // Nick (Bug ab = +) und Wank im KÖRPER des gerittenen Werks, nach R_y·S: längs z (Teile-Werk) Nick um x und Wank
    // um z; längs x (Studio-Fahrzeug, `_fahrAchseX`, Bug +x) Nick um z gegen den Sinn und Wank um x — derselbe
    // Rahmen wie `_rittMeshPose`. Vorher drehte der Nick des Studio-Fahrzeugs um seine LÄNGS-Achse (ein Wank).
    _archRittNeigung(entry, m, rp, rr) {
        const rx = this._archTmpRideRx || (this._archTmpRideRx = new THREE.Matrix4());
        const rz = this._archTmpRideRz || (this._archTmpRideRz = new THREE.Matrix4());
        if (entry._fahrAchseX) {
            if (rp) m.multiply(rz.makeRotationZ(-rp));
            if (rr) m.multiply(rx.makeRotationX(rr));
        } else {
            if (rp) m.multiply(rx.makeRotationX(rp));
            if (rr) m.multiply(rz.makeRotationZ(rr));
        }
    }

    // Die EINE Part-Farb-Quelle: baseColor aus part.color/Material-Substanz + Präzisions-Helligkeit
    // 0.6..1.0, 8-bit-gerundet — spiegelt EXAKT `_buildFromBlueprint` + die Per-Vertex-Formel in
    // `_mergeBlueprintByMaterial`. Konsumenten: _archLeafMaterial + _archFlattenBlueprint (leaf.tint).
    _archPartTintColor(part) {
        let baseColor = typeof part.color === "number" ? part.color : null;
        const partMatDef =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
            baseColor = partMatDef.color;
        }
        if (baseColor === null) baseColor = 0xffffff;
        const precision = this.computePartPrecision(part);
        const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
        const r8 = (baseColor >> 16) & 0xff;
        const g8 = (baseColor >> 8) & 0xff;
        const b8 = baseColor & 0xff;
        return (
            ((Math.round(r8 * brightness) & 0xff) << 16) |
            ((Math.round(g8 * brightness) & 0xff) << 8) |
            (Math.round(b8 * brightness) & 0xff)
        );
    }

    // Geteiltes Leaf-Material: EINES je TAG-SIGNATUR (_sharedFoliageMaterial); die Part-Farbe reist als
    // INSTANZ-Farbe (leaf.tint → _archSlotColor → setColorAt, neutral WEISS). Ein Material je Farbe
    // zersplitterte die Pipelines (je Farbe eine Material-Familie). AUSNAHME:
    // GLÜHENDE Substanz behält die Farbe in der Signatur (Emissiv liest opts.color; Spiegel der Klammer
    // `emissiv − 0.5 > 0.01`, gate:render-diaet). ARCH_LEAF_MAT_SHARED=false nur als Linsen-Beweis.
    _archLeafMaterial(part) {
        const tintedColor = this._archPartTintColor(part);
        const partMatDef =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        const matOpts = { color: tintedColor };
        // W-E (§8.3) — die Antenne IST die Substanz (Spiegel zu _buildFromBlueprint).
        if (partMatDef && partMatDef.tags) matOpts.tags = partMatDef.tags;
        // laub/fleisch-Materialien (waerme>0.5 im Substanz-Profil) bekommen den useInstanceTint-Marker:
        // _archInstanceAdd setzt setColorAt je Slot aus entry.tintH/S/V (Stein bleibt monochrom).
        if (partMatDef && partMatDef.tags) {
            const waerme = +partMatDef.tags.lebendig || 0;
            if (waerme > 0.5) matOpts.useInstanceTint = true;
        }
        if (Number.isFinite(part.opacity) && part.opacity < 1) {
            matOpts.transparent = true;
            matOpts.opacity = part.opacity;
        }
        if (AnazhRealm.ARCH_LEAF_MAT_SHARED === false) return this._buildToonNodeMaterial(matOpts); // A/B-Hebel (Linse)
        // Die Glüh-Frage über die EINE Profil-Quelle (_substanceResponseProfile;
        // tagless fällt wie im PBR-Bau auf defaults.werk → glüht → fail-closed
        // bleibt die Farbe gebacken).
        const profil = matOpts.tags
            ? this._substanceResponseProfile(matOpts.tags)
            : AnazhRealm.SUBSTANCE_RESPONSE.defaults.werk;
        const glueht = Math.max(0, (Number(profil && profil.emissiv) || 0) - 0.5) > 0.01;
        if (!glueht) {
            matOpts.color = 0xffffff; // die Farbe reist als Instanz-Kanal (leaf.tint)
            matOpts.leafTint = true; // Signatur-Marker — keine Kollision mit echt-weiß gebackenen Signaturen
        }
        const mat = this._sharedFoliageMaterial(matOpts);
        if (matOpts.leafTint && mat.userData) mat.userData.leafTint = true;
        return mat;
    }

    // Welle B — DIE LICHTQUELLE: ein Teil, dessen Genom das Leuchten trägt (`emissiveBoost`, das Glut-/Kristall-
    // Genom) UND dessen Substanz glimmt (dieselbe Klammer `emissiv − 0.5 > 0.01` wie _archLeafMaterial). Die Klammer
    // allein trifft auch Holz, Laub, Leder (ihr Glimmen ist ein Ton, kein Feuer) — erst die Genom-Deklaration macht
    // den Teil zum Licht. Eine Lichtquelle wirft keinen Schatten (Glut-Bett und -Zungen; das Becken wirft).
    _archTeilLeuchtet(part) {
        if (!part || !Number.isFinite(part.emissiveBoost)) return false;
        const def =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        const profil =
            def && def.tags ? this._substanceResponseProfile(def.tags) : AnazhRealm.SUBSTANCE_RESPONSE.defaults.werk;
        return Math.max(0, (Number(profil && profil.emissiv) || 0) - 0.5) > 0.01;
    }

    // Minimaler Geometrie-Merger (BufferGeometryUtils.mergeGeometries fehlt im vendored Bundle). Erwartet
    // IDENTISCHE Attribute (position, normal, color), Eingänge optional indexed; Ausgabe nicht-indiziert.
    _mergeGeometries(geometries) {
        if (!Array.isArray(geometries) || geometries.length === 0) return null;
        // 1. Totale Vertex-Anzahl (nicht-indizierte Output-Form).
        let totalVerts = 0;
        for (const g of geometries) {
            if (!g || !g.attributes || !g.attributes.position) return null;
            // Indexed → wir expandieren beim Lesen via index.
            const idx = g.index;
            totalVerts += idx ? idx.count : g.attributes.position.count;
        }
        if (totalVerts === 0) return null;
        const posOut = new Float32Array(totalVerts * 3);
        const norOut = new Float32Array(totalVerts * 3);
        const colOut = new Float32Array(totalVerts * 3);
        // 2. Pro Eingangs-Geometry: Vertices in den Output schreiben.
        let cursor = 0;
        for (const g of geometries) {
            const posIn = g.attributes.position.array;
            const norIn = g.attributes.normal ? g.attributes.normal.array : null;
            const colIn = g.attributes.color ? g.attributes.color.array : null;
            const idx = g.index ? g.index.array : null;
            const vCount = idx ? idx.length : g.attributes.position.count;
            for (let i = 0; i < vCount; i++) {
                const srcIdx = idx ? idx[i] : i;
                const o3 = (cursor + i) * 3;
                const s3 = srcIdx * 3;
                posOut[o3] = posIn[s3];
                posOut[o3 + 1] = posIn[s3 + 1];
                posOut[o3 + 2] = posIn[s3 + 2];
                if (norIn) {
                    norOut[o3] = norIn[s3];
                    norOut[o3 + 1] = norIn[s3 + 1];
                    norOut[o3 + 2] = norIn[s3 + 2];
                }
                if (colIn) {
                    colOut[o3] = colIn[s3];
                    colOut[o3 + 1] = colIn[s3 + 1];
                    colOut[o3 + 2] = colIn[s3 + 2];
                }
            }
            cursor += vCount;
        }
        const merged = new THREE.BufferGeometry();
        merged.setAttribute("position", new THREE.BufferAttribute(posOut, 3));
        merged.setAttribute("normal", new THREE.BufferAttribute(norOut, 3));
        merged.setAttribute("color", new THREE.BufferAttribute(colOut, 3));
        merged.computeBoundingBox();
        merged.computeBoundingSphere();
        return merged;
    }

    // Mergt einen Bauplan je Material-Schlüssel zu EINER geom + EINEM mat (Baum: ~80 Parts, 2 Materialien
    // → 2 Draw-Calls). Part-Farbe → Per-Vertex-Color, Part-Transform per applyMatrix4 gebacken; Leaves
    // tragen Identity-localMatrix (`_archInstanceAdd` schreibt die Entry-Matrix). TAG-NEUTRAL: bp.parts
    // bleibt unverändert (computeCompoundTags liest sie) — reine Render-Optimierung.
    _mergeBlueprintByMaterial(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        // Parts nach Material-Schlüssel gruppieren (ohne `material` → "_default"). Nested Baupläne
        // (shape:"blueprint") werden NICHT gemergt → unmergebar, Per-Part-Pfad.
        const groups = new Map();
        for (const part of bp.parts) {
            if (!part || part.shape === "blueprint") return null; // nested → unmergebar
            if (part.animate === "water_wave") return null; // V18.211-Bäume tragen das nie, aber defensive Wand
            const key = typeof part.material === "string" ? part.material : "_default";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(part);
        }
        if (groups.size === 0) return null;
        // Per-Material: Geometries + Per-Vertex-Color sammeln → mergen.
        const leaves = [];
        const tmpQuat = new THREE.Quaternion();
        const tmpVec = new THREE.Vector3();
        const tmpEuler = new THREE.Euler();
        const tmpMatrix = new THREE.Matrix4();
        for (const parts of groups.values()) {
            const geomsInGroup = [];
            for (const part of parts) {
                const geom = this._makePartGeometry(part);
                if (!geom || !geom.attributes || !geom.attributes.position) continue;
                // Per-Part-Transform auf die Vertices applyen (Position +
                // Rotation; size ist schon in _makePartGeometry gebaked).
                const pos = part.position || { x: 0, y: 0, z: 0 };
                tmpVec.set(pos.x || 0, pos.y || 0, pos.z || 0);
                if (part.rotation) {
                    tmpEuler.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
                    tmpQuat.setFromEuler(tmpEuler);
                } else {
                    tmpQuat.identity();
                }
                tmpMatrix.compose(tmpVec, tmpQuat, new THREE.Vector3(1, 1, 1));
                geom.applyMatrix4(tmpMatrix);
                // Sicherstellen, dass normal-Attribut existiert (für Toon-Lit).
                if (!geom.attributes.normal) geom.computeVertexNormals();
                // Per-Vertex-Color attachen (uniform pro Part, aus der berechneten
                // tintedColor — Spiegel zu _archLeafMaterial Brightness-Formel).
                let baseColor = typeof part.color === "number" ? part.color : null;
                const partMatDef =
                    typeof part.material === "string" && this.state.materials
                        ? this.state.materials[part.material]
                        : null;
                if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
                    baseColor = partMatDef.color;
                }
                if (baseColor === null) baseColor = 0xffffff;
                const precision = this.computePartPrecision(part);
                const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
                const r = (((baseColor >> 16) & 0xff) * brightness) / 255;
                const g = (((baseColor >> 8) & 0xff) * brightness) / 255;
                const b = ((baseColor & 0xff) * brightness) / 255;
                const vCount = geom.attributes.position.count;
                const colArr = new Float32Array(vCount * 3);
                for (let i = 0; i < vCount; i++) {
                    colArr[i * 3] = r;
                    colArr[i * 3 + 1] = g;
                    colArr[i * 3 + 2] = b;
                }
                geom.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
                geomsInGroup.push(geom);
            }
            if (geomsInGroup.length === 0) continue;
            const merged = this._mergeGeometries(geomsInGroup);
            // Per-Part-Geometries waren nur Zwischenträger → disposen.
            for (const g of geomsInGroup) {
                if (g && typeof g.dispose === "function") g.dispose();
            }
            if (!merged) continue;
            // Material: vertexColors-Variante mit dem Tag-Profil des ersten Parts (eine Gruppe teilt matKey →
            // gleiche Tags); useInstanceTint für lebendig>0.5 (Spiegel zu _archLeafMaterial).
            const refPart = parts[0];
            const refMatDef =
                typeof refPart.material === "string" && this.state.materials
                    ? this.state.materials[refPart.material]
                    : null;
            const matOpts = { vertexColors: true };
            if (refMatDef && refMatDef.tags) {
                matOpts.tags = refMatDef.tags;
                const waerme = +refMatDef.tags.lebendig || 0;
                if (waerme > 0.5) matOpts.useInstanceTint = true;
            }
            // Opts sind über alle Varianten identisch (globale holz/laub-Tags, Farbe per-Vertex) → das geteilte
            // Tag-Signatur-Material (_foliageMatCache-Konvention: NIE disposen).
            const mat = this._sharedFoliageMaterial(matOpts);
            leaves.push({ geom: merged, mat, localMatrix: new THREE.Matrix4() });
        }
        if (leaves.length === 0) return null;
        return { leaves };
    }

    // Platzierte Strukturen per Material zu wenigen Meshes verschmelzen (dieselbe
    // `_mergeBlueprintByMaterial`-Infra wie die Bäume): ~248 → ~2–5 Draw-Calls + Schatten-Caster,
    // Geometrie/Farben bit-gleich. Die Kollision liest `bp.parts` separat (entry.blockerAABBs).
    // Per-Teil-Fallback (`_buildFromBlueprint`): nested Baupläne · water_wave · connections · < 6 Teile.
    _buildArchMeshMerged(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 6) return this._buildFromBlueprint(bp);
        if (Array.isArray(bp.connections) && bp.connections.length > 0) return this._buildFromBlueprint(bp);
        // GEOMETRIE-CACHE: ein Bauplan ist je Spawn geometrisch identisch → EINMAL mergen (Tempel ~14 ms),
        // je Bauplan cachen (WeakMap → auto-GC), je Spawn nur die Geometrie KLONEN (~0,5 ms). Sicher, weil
        // _disposeSoulGroup NUR Geometrie disposed: Material geteilt, jeder Spawn besitzt seinen Klon.
        if (!this._archMergeCache) this._archMergeCache = new WeakMap();
        let leaves = this._archMergeCache.get(bp);
        if (!leaves) {
            let merged = null;
            try {
                merged = this._mergeBlueprintByMaterial(bp);
            } catch (_e) {
                throw this._stoffBruch("der Bauplan-Merge (Stoff-Gruppen)", _e);
            }
            if (!merged || !Array.isArray(merged.leaves) || merged.leaves.length === 0) {
                return this._buildFromBlueprint(bp); // nested/animate → Per-Teil-Wahrheit
            }
            leaves = merged.leaves;
            this._archMergeCache.set(bp, leaves);
        }
        const group = new THREE.Group();
        for (const leaf of leaves) {
            if (!leaf || !leaf.geom || !leaf.mat) continue;
            // Geometrie KLONEN (disposal-sicher), Material TEILEN (Singleton, nie disposed).
            const m = new THREE.Mesh(leaf.geom.clone(), leaf.mat);
            m.castShadow = true;
            m.receiveShadow = true;
            group.add(m);
        }
        if (group.children.length === 0) return this._buildFromBlueprint(bp); // defensive
        group.userData.archMerged = true;
        return group;
    }

    // Der Platzier-GHOST liest den GETEILTEN Merge-Cache (`_buildArchMeshMerged`) — derselbe Pfad wie die
    // platzierte Struktur. Transparenz über einen per-Material GECACHTEN Klon (`_ghostMaterialFor`), NIE
    // Mutation des geteilten Materials (sonst leckt „transparent" in platzierte Bauten + Recompile je
    // Auswahl); der Klon kompiliert einmal (Idle-Vorbacken).
    // Der Alpha-Test des Klons skaliert mit seiner Deckkraft (Welle L Folge, L-Rückmeldung „kein Phantom"): r184 multipliziert
    // die Alpha mit `opacity` VOR dem Test — jeder Studio-Stoff trägt alphaTest 0,5 (der Dither der LOD-Maske und die
    // Blatt-Kontur fallen in die Alpha), bei Deckkraft 0,4 fiel JEDES Fragment (0,4 < 0,5): das Phantom eines Baums, Hauses,
    // Tors war unsichtbar, der Spieler zielte ins Leere. Mit alphaTest × Deckkraft fällt genau, was das Werk selbst verwirft.
    // Die Tönung wirkt, wo der Stoff seine Farbe liest (Gegenprüfung 08.10.): ein Studio-Stoff liest colorNode (die Vertex-
    // Farbe), nie `material.color` — sein Geist mischt den EINEN Tönungs-Uniform (`_phantomTint`) zu 30 % in colorNode.rgb,
    // die Alpha (Blatt-Kontur, LOD-Dither) bleibt. Befund: das Phantom über der Lichtung stand grau, nur die HUD-Zeile rot.
    _ghostMaterialFor(mat) {
        if (!mat) return mat;
        if (!this._ghostMatCache) this._ghostMatCache = new WeakMap();
        let g = this._ghostMatCache.get(mat);
        if (!g) {
            g = mat.clone();
            g.transparent = true;
            g.opacity = 0.4;
            g.alphaTest = (Number.isFinite(mat.alphaTest) ? mat.alphaTest : 0) * g.opacity;
            g.depthWrite = false;
            const tint = mat.colorNode ? this._phantomTint() : null;
            if (tint) {
                const TSL = THREE.TSL;
                const farbe = TSL.vec4(mat.colorNode);
                g.colorNode = TSL.vec4(TSL.mix(farbe.rgb, tint, 0.3), farbe.a);
            }
            this._ghostMatCache.set(mat, g);
        }
        return g;
    }

    // DER EINE Tönungs-Uniform jedes Geist-Stoffs (linear, aus dem sRGB-Hex — das Farb-Gesetz): `_applyPhantomTint` setzt
    // ihn je Takt (grün: das Setzen trägt, rot: es wird abgelehnt). Es gibt nur ein Phantom zugleich.
    _phantomTint() {
        if (!this._phantomTintU) {
            const TSL = THREE.TSL;
            this._phantomTintU = TSL.uniform(new THREE.Color(0x88ff88));
        }
        return this._phantomTintU;
    }

    // Der Ghost IST der finale Eintrag (`_rebuildArchitectureMesh`: Foundry-Preset → `_foundryFlattenFor`, Stufe 0): derselbe
    // Same (`_werkSame` mit dem Bau-Modus — der Same des nächsten Setzens, `confirmBuild` setzt ihn) und derselbe Stempel
    // (`_studioStampFor` — die Prägung, die das Setzen mitgibt). Foundry aus/kalt → null: der Donor-Ghost bleibt,
    // `tickBuildMode` swappt, sobald das Asset dockt. Geteilte Studio-Geometrie ist sharedGeom-markiert + hält
    // `foundrySrcGroup` (`_disposeSoulGroup` lässt sie stehen); Material = der gecachte Klon (`_ghostMaterialFor`).
    // `wo` = der Ort des Phantoms (`_phantomWerk`): ein Baum zeigt die Gestalt dieses Orts, die Gruppe trägt sie
    // (`userData.studioGestalt`), `tickBuildMode` tauscht, sobald der Ort eine andere wählt.
    // DAS WERK DES PHANTOMS (K20): der Eintrag, den `confirmBuild` an diesem Ort stellt — der Same des nächsten Setzens
    // (`_werkSame` mit dem Bau-Modus), der Stempel (`_studioStampFor`) und der Ort (`wo`, der Spawn-Ort des Setzens: x, z
    // des Phantoms): ein Baum fragt die Gestalt seines Orts (`_foundryGestaltFor`) wie das gesetzte Werk. Befund: das
    // Phantom fragte ohne Ort den rohen Samen und zeigte den Solitär (eiche|3), an seinem Ort im Bestand stand eiche|2.
    _phantomWerk(bp, wo) {
        const werk = { seed: this._werkSame(bp, bp.name, this.state.buildMode), type: bp.name };
        const stempel = this._studioStampFor(bp.name);
        if (stempel) werk.studioOv = stempel;
        if (wo && Number.isFinite(wo.x) && Number.isFinite(wo.z)) werk.position = { x: wo.x, y: wo.y + 0.5, z: wo.z };
        return werk;
    }
    // Die Gestalt, die das Phantom am Ort `wo` zeigen muss (das Gedächtnis des Orts `_ortGestaltSame` merkt jeden Ort);
    // null = kein Studio-Werk oder der Ort wartet.
    _phantomGestalt(bp, wo) {
        const preset = this._foundryPresetForEntry({ type: bp.name });
        return preset ? this._foundryGestaltFor(this._phantomWerk(bp, wo), preset) : null;
    }
    _buildStudioPlacementGhost(bp, wo) {
        if (!bp || typeof bp.name !== "string") return null;
        if (typeof this._foundryEnabled !== "function" || !this._foundryEnabled()) return null;
        const preset = this._foundryPresetForEntry({ type: bp.name });
        if (!preset) return null;
        const werk = this._phantomWerk(bp, wo);
        const flat = this._foundryFlattenFor(werk, preset, 0);
        if (!flat || !flat.instanceable || !Array.isArray(flat.leaves) || !flat.leaves.length) {
            // null = lädt noch (die Anfrage ist unterwegs) → tickBuildMode heilt den Donor-
            // Ghost zur Studio-Gestalt; false = kann nicht → Donor-Ghost bleibt (fail-soft).
            if (flat === null && this.state.buildMode) this.state.buildMode.phantomStudioPending = bp.name;
            return null;
        }
        const grp = new THREE.Group();
        for (const leaf of flat.leaves) {
            if (!leaf.geom || !leaf.mat || leaf.shadowTwin) continue; // der Schatten-Zwilling ist kamera-unsichtbar
            const mesh = new THREE.Mesh(leaf.geom, this._ghostMaterialFor(leaf.mat));
            mesh.applyMatrix4(leaf.localMatrix);
            mesh.castShadow = false;
            mesh.userData.sharedGeom = true; // GETEILTE Studio-Geometrie — der Dispose lässt sie stehen
            // Der Tint-Anker liest die NIE-getintete Quell-Farbe (der geteilte Ghost-Klon
            // bliebe sonst nach einem Rot/Grün-Frame die „Original"-Basis → Drift).
            if (leaf.mat.color) mesh.userData._origColor = leaf.mat.color.getHex();
            grp.add(mesh);
        }
        if (!grp.children.length) return null;
        const src = flat.leaves[0]._srcGroup;
        if (src) {
            src._liveRefs = (src._liveRefs || 0) + 1;
            grp.userData.foundrySrcGroup = src;
        }
        grp.userData.studioGhost = true;
        grp.userData.studioGestalt = this._foundryGestaltFor(werk, preset);
        if (this.state.buildMode && this.state.buildMode.phantomStudioPending === bp.name) {
            this.state.buildMode.phantomStudioPending = null;
        }
        return grp;
    }

    // Platzier-Phantom: mergeable (≥6 Teile, keine connections) → gecachte Merge-Geometrie + gecachter
    // Ghost-Mat-Klon; sonst `_buildFromBlueprint` mit FRISCHEN Per-Teil-Materialien. castShadow aus.
    // ZUERST die Studio-Gestalt (Quelle des finalen Eintrags), sonst der Donor-Bau; `opts.donorOnly` =
    // Prebake-Pfad (Cache/Pipeline wärmen ohne Studio-Bake je Katalog-Bauplan); `opts.wo` = der Ort des Phantoms.
    _buildPlacementGhost(bp, opts) {
        if (!(opts && opts.donorOnly)) {
            const studio = this._buildStudioPlacementGhost(bp, opts && opts.wo);
            if (studio) return studio;
        }
        const group = this._buildArchMeshMerged(bp);
        const merged = !!(group.userData && group.userData.archMerged);
        group.traverse((node) => {
            if (node.material) {
                if (merged) {
                    // geteiltes Material → GECACHTER transparenter Klon (kein Leck in die platzierte Struktur).
                    node.material = this._ghostMaterialFor(node.material);
                } else {
                    // Fallback-Pfad: die Per-Teil-Materialien sind FRISCH (nicht geteilt) → Mutation sicher; der Alpha-
                    // Test skaliert mit der Deckkraft wie im Klon (`_ghostMaterialFor`).
                    node.material.transparent = true;
                    node.material.opacity = 0.4;
                    node.material.alphaTest =
                        (Number.isFinite(node.material.alphaTest) ? node.material.alphaTest : 0) * 0.4;
                    node.material.depthWrite = false;
                }
            }
            if (node.castShadow !== undefined) node.castShadow = false;
        });
        return group;
    }

    // Idle-Vorbacken: wärmt Merge-Cache + Ghost-Material-Klone, solange der Spieler steht und das
    // Chunk-Streaming nichts baut (gerufen aus `_tickScatterStreaming`). EINS je Idle-Tick (kein Spike) —
    // der Erst-Merge (~5–14 ms) passiert VOR der Auswahl. `_prebakedBlueprints` merkt die warmen Namen.
    _tickBlueprintPrebake() {
        const st = this.state;
        if (st._frameOverBudget) return; // erst die Frame-Zeit, dann vorausplanen (V18.282-Wand)
        // erst das Bild, dann vorausplanen (K60-2): kein Leser des ersten Weltbilds wählt einen Bauplan — unter dem Ladeschirm
        // (`_ladeTakt`, der kein Budget reißt) wärmte das Vorbacken Radeon kalt 0,71 s Geister vor dem Bild (K602/p1)
        if (this._ladeTakt()) return;
        if (!st.blueprints) return;
        if (!this._prebakedBlueprints) this._prebakedBlueprints = new Set();
        const done = this._prebakedBlueprints;
        // Das GANZE auswählbare Sortiment: die Hotbar ZUERST, dann der Rest der Bibliothek (Inventar/Menü).
        const names = (Array.isArray(st.hotbar) ? st.hotbar.filter(Boolean) : []).concat(Object.keys(st.blueprints));
        for (const name of names) {
            if (!name || done.has(name)) continue;
            const bp = st.blueprints && st.blueprints[name];
            if (!bp) {
                done.add(name);
                continue;
            }
            // nur PLATZIERBARE Baupläne bekommen ein Ghost-Phantom (Geräte/Rüstung/Seele/Trank nicht).
            if (!this._isPlaceableBlueprint(bp)) {
                done.add(name);
                continue;
            }
            try {
                // B1: donorOnly — der Prebake wärmt Merge-Cache + Ghost-Mat-Klone des Donor-Pfads;
                // Studio-Ghost-Assets zieht erst die ECHTE Auswahl (kein Katalog-weiter Bake-Sturm,
                // und das Freigeben darf hier nie geteilte Studio-Geometrie treffen). Die Pipeline des Geists
                // entsteht bei seiner ersten Zeichnung (die Erst-Zeichnung, `_configureRenderer`).
                this._disposeSoulGroup(this._buildPlacementGhost(bp, { donorOnly: true }));
            } catch (_e) {
                this._stoffBruch("das Vorbacken des Bauplans " + name, _e);
            }
            done.add(name);
            return; // EINS pro Idle-Tick
        }
    }

    // KERN-PFLICHT-WAND: fehlt ein Gesetzbuch (AnazhRealm.GESETZ_KERNE) auf dem Main-Thread, SCHREIT die
    // Welt (rotes Banner + ERROR-Log) statt still auf Fallback zu laufen. Einmal je Boot, im Loop
    // (defer-Scripts sind dann geladen).
    _kernPflichtWand() {
        if (this._kernWandGeprueft) return;
        this._kernWandGeprueft = true;
        const fehlt = [];
        for (const id in AnazhRealm.GESETZ_KERNE) {
            const nsName = AnazhRealm.GESETZ_KERNE[id];
            if (typeof globalThis === "undefined" || !globalThis[nsName]) fehlt.push(id);
        }
        if (!fehlt.length) return;
        const text = "KERN FEHLT (Gesetzbuch lädt nicht auf dem Main-Thread): " + fehlt.join(" · ");
        this.log(text, "ERROR");
        if (typeof document !== "undefined" && document.body && !document.getElementById("kern-pflicht-banner")) {
            const b = document.createElement("div");
            b.id = "kern-pflicht-banner";
            b.textContent = "⚠ " + text + " — jeder Gesetz-Leser bricht laut (KERN-PFLICHT), es gibt keine Ersatz-Welt";
            b.style.cssText =
                "position:fixed;top:0;left:0;right:0;z-index:99999;background:#7a1010;color:#fff;" +
                "font:14px monospace;padding:8px 12px;text-align:center";
            document.body.appendChild(b);
        }
    }

    // DIE BACKEND-WAND der WGSL-Konsumenten (Welt-March · Feld-Pass): sie urteilt am BACKEND — ohne Adapter fällt der
    // r184-Renderer STILL auf WebGL2, wo die TSL-Klassen weiter existieren (eine Existenz-Prüfung wäre blind).
    _gpuComputeFaehig() {
        const r = this.state.renderer;
        return !!(r && !r._isHeadlessNull && r.backend && r.backend.isWebGPUBackend === true);
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
        let fracht = this._blattAtlasBild || null;
        if (!fracht) {
            const core = globalThis.__phytoCore;
            if (!core || !core.bakeLeafAtlasBild || !core.blattAtlasFracht)
                throw new Error("KERN-PFLICHT: phyto-core bakeLeafAtlasBild/blattAtlasFracht fehlt");
            fracht = core.blattAtlasFracht(core.bakeLeafAtlasBild(document), bc);
        }
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
    // DIE KANTE (K68): `a` ist die Deckung als Kante von EINEM Pixel um die Schwelle `c` (`_laubKante`), `schwelle` der
    // Knoten, mit dem der Bild-Pass sie schneidet (`alphaTestNode`, `_laubSchwelle`); der Stoff setzt alphaTest 0,5.
    _blattAtlasProbe(T, c) {
        const tex = this._ensureFoliageClusterAtlas();
        if (!tex) return null;
        const uv = T.attribute("uv", "vec2");
        const s = T.texture(tex, uv).bias(T.float(AnazhRealm.BLATT_FARBE_OKTAVE));
        const deckung = T.texture(tex, uv);
        const w = tex.userData.wert;
        return {
            tex,
            rgb: s.rgb.div(s.a.max(T.float(1e-3))).mul(T.vec3(1 / w[0], 1 / w[1], 1 / w[2])),
            a: this._laubKante(T, deckung.a, c),
            schwelle: this._laubSchwelle(T),
        };
    }

    // DIE KANTE DES LAUBS (K68): der alphaTest schnitt jede Blatt-Karte binär an der Schwelle — die Nadel-Wedel standen im
    // Pixel-Takt als Raster aus Nadel und Himmel (Soll-Tafel laub, Maß zweiton: Täter f:tanne:L0, Radeon, Mess-Wiese).
    // Die Deckung um die Schwelle `c`, geteilt durch ihre Änderung je Pixel (fwidth), ist der Anteil des Pixels, der
    // deckt: die Kante ist auf jeder Stufe EIN Pixel breit (vergrößert keine Texel-Treppe, verkleinert kein Bit-Muster).
    // Der Bild-Pass vergleicht ihn mit dem Rauschen der zeitlichen Auflösung (`_laubSchwelle`), ihr Mittel ist die
    // geglättete Kante (Hashed Alpha unter TAA: Horizon Zero Dawn, GDC 2018). Der Schatten-Pass liest die ZAHL alphaTest
    // 0,5 (r184 `renderObject` setzt sie je Objekt, nie den Knoten): a' > 0,5 ⇔ a > c — der Wurf bleibt binär wie vorher.
    _laubKante(T, a, c) {
        const s = T.float(c == null ? 0.5 : c);
        return a
            .sub(s)
            .div(T.fwidth(a).max(T.float(1e-4)))
            .add(T.float(0.5))
            .clamp(0.0, 1.0);
    }

    // DIE SCHWELLE DER KANTE (K68): das Interleaved-Gradient-Rauschen über den gespiegelten Achsen (y, x) — unabhängig vom
    // Rauschen der Stufen-Blende und der Durchsicht (`__phytoCore.lodDitherIGN` über (x, y)) —, je Frame um 1/g (die
    // Plastik-Zahl, `uLaubKante.x`) gedreht: neben der Goldenen Drehung der Blende (`uDitherT`) ist das Paar je Pixel über
    // die Frames gleichverteilt, Blende und Kante multiplizieren ihre Deckung. Ohne zeitliche Auflösung (`uLaubKante.y` 0,
    // Holz kienspan) ist die Schwelle 0,5: der binäre Schnitt von vorher, kein stehendes Rauschen. EIN Knoten je Welt.
    // DIE ZAHL DES STOFFS TRÄGT DIE SCHWELLE (K68-N1, Prüfer K68: das Phantom klont den Knoten, `_ghostMaterialFor` senkt nur
    // die Zahl — bei Deckkraft 0,4 fiel unter kienspan jedes Laub-Fragment, das Baum-Phantom war wieder unsichtbar): die
    // Schwelle ist alphaTest × (1 | 2·Rauschen), gelesen je Objekt aus SEINEM Stoff (r184 `materialAlphaTest`, derselbe Leser
    // wie der Test ohne Knoten). Der Stoff mit 0,5 schneidet wie oben; jeder Klon, der die Zahl ändert, ändert den Schnitt mit.
    _laubSchwelle(T) {
        if (this._laubSchwelleKnoten) return this._laubSchwelleKnoten;
        const lu = this._ensureLodUniforms();
        if (!lu || !lu.uLaubKante) throw this._blendeBruch("der LOD-Uniform-Satz trägt keine uLaubKante");
        const fc = T.screenCoordinate;
        const h = T.fract(
            T.float(52.9829189)
                .mul(T.fract(fc.y.mul(0.06711056).add(fc.x.mul(0.00583715))))
                .add(lu.uLaubKante.x)
        );
        this._laubSchwelleKnoten = T.materialAlphaTest.mul(T.mix(T.float(1), h.mul(2), lu.uLaubKante.y));
        return this._laubSchwelleKnoten;
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
        this._leuchtStoff(m, null); // jeder beleuchtete Stoff trägt den Licht-Pool (K11)
        m.userData.shadowTwin = true;
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
            if (holzMat && holzMat.tags) barkMatOpts.tags = holzMat.tags;
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
            if (laubMat && laubMat.tags) foliageMatOpts.tags = laubMat.tags;
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
}
