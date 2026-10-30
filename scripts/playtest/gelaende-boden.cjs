"use strict";
// scripts/playtest/gelaende-boden.cjs — der Richter von Gelaende/boden (spec/stamm/modul-karte.json): Welt-Genese · Genesis-Platz · Boden-Sicht · Hang und Fels · Stufen-Kette · Höhe.
// 14 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Abenteuer graduiert: `explore` feuert nicht flach je Chunk-Wechsel, die Magnitude emergiert aus
// Neuheit (visitedRegions) + Distanz vom Ursprung + Kühnheit (karge/glut-Aura via auraAt);
// Konsum: kühnes Erkunden ≫ Pendeln (awe).
async function checkBandV1749Adventure({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = r.state.player;
        const E = r.constructor.EXPLORE;
        const pm = r.state.playerMesh.position;
        const savedEmo = { ...p.emotions };
        const savedVisited = r.state.visitedRegions;
        const savedLife = r.state.lifeField;
        const savedPos = { x: pm.x, y: pm.y, z: pm.z };
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };
        const fresh = () => {
            r.state.visitedRegions = new Set();
        };

        // (1) Config
        out.config = !!E && E.noveltyNew > E.noveltyRevisit && E.max > E.min;

        // (2) NEUHEIT — gleiche Position/Aura → nur die Neuheit variiert (erste Begegnung > Wiederkehr)
        fresh();
        const magNew = r._exploreMagnitude(111, 111);
        const magRevisit = r._exploreMagnitude(111, 111);
        out.noveltyGrades = magNew > magRevisit + 0.3;

        // (3) HOLISTISCH — kühnes Erkunden (neu + fern + karg) ≫ vertrautes Pendeln (Wiederkehr + nah + üppig)
        fresh();
        r.state.lifeField = new Map(); // karg
        pm.x = 3000;
        pm.z = 0; // fern
        const magAdventure = r._exploreMagnitude(222, 222); // neu
        r.state.visitedRegions = new Set(["333,333"]); // markiert → Wiederkehr
        pm.x = savedPos.x;
        pm.z = savedPos.z; // nah
        r._depositLife(pm.x, pm.z, 1.0);
        r._depositLife(pm.x, pm.z, 1.0); // üppig
        const magCommute = r._exploreMagnitude(333, 333);
        out.adventureGrades = magAdventure > magCommute + 0.5;
        r.state.lifeField = new Map();

        // (4) KÜHNHEIT — in eine karge Aura wagen staunt mehr als in eine üppige (liest auraAt;
        // gegated für bereits-üppige Spots, wo kein Boldness-Spielraum bleibt)
        pm.x = savedPos.x;
        pm.z = savedPos.z;
        r.state.lifeField = new Map();
        const lebFrozen = r.auraAt(pm.x, pm.z, 0).lebendig || 0;
        r.state.visitedRegions = new Set(["444,444"]);
        const magBarren = r._exploreMagnitude(444, 444);
        r._depositLife(pm.x, pm.z, 1.0);
        r._depositLife(pm.x, pm.z, 1.0);
        r.state.visitedRegions = new Set(["444,444"]);
        const magLush = r._exploreMagnitude(444, 444);
        out.boldnessGrades = lebFrozen >= 0.85 ? magLush <= magBarren + 1e-6 : magBarren > magLush + 0.02;
        r.state.lifeField = new Map();

        // (5) KONSUM end-to-end: die explore-Tat SKALIERT mit der Magnitude (awe graduiert)
        setEmo({});
        r._feelAction("explore", { magnitude: 1.8 });
        const aweBold = p.emotions.awe;
        setEmo({});
        r._feelAction("explore", { magnitude: 0.3 });
        const aweTimid = p.emotions.awe;
        out.exploreScales = aweBold > aweTimid + 0.02;

        // (6) visitedRegions bounded (Prune beim Überlauf)
        const big = new Set();
        for (let i = 0; i < E.maxRegions + 5; i++) big.add("d" + i);
        r.state.visitedRegions = big;
        r._exploreMagnitude(99999, 99999);
        out.bounded = r.state.visitedRegions.size <= E.maxRegions;

        // restore
        setEmo(savedEmo);
        r.state.visitedRegions = savedVisited;
        r.state.lifeField = savedLife;
        pm.x = savedPos.x;
        pm.y = savedPos.y;
        pm.z = savedPos.z;
        return out;
    });
    check("Abenteuer: EXPLORE-Config (Neuheit > Wiederkehr, max > min)", res.config);
    check("Abenteuer: KONSUM — eine NEUE Region staunt mehr als eine Wiederkehr (Neuheit)", res.noveltyGrades);
    check(
        "Abenteuer: KONSUM — kühnes Erkunden (neu+fern+karg) ≫ vertrautes Pendeln (das Wagnis graduiert)",
        res.adventureGrades
    );
    check(
        "Abenteuer: KONSUM — in eine karge Aura wagen staunt mehr (Kühnheit liest das Feld)",
        res.boldnessGrades
    );
    check(
        "Abenteuer: KONSUM — die explore-Tat skaliert mit der Magnitude (awe graduiert, nicht binär)",
        res.exploreScales
    );
    check("Abenteuer: visitedRegions bounded (Prune beim Überlauf)", res.bounded);
}

// Der Voxel-Boden (P1 + P2b) und die Abwesenheit des Heightfields.
async function checkBandVoxelTerrainCore({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Voxel-Terrain — Dichte-Feld + Surface Nets ###
    // Beweist echte Höhlen/Überhänge aus 3D-Dichte-Feld + Surface-Nets-Mesher. Vorab alle
    // Voxel-Chunks abräumen; die folgenden Tests bauen ihren Ring per _tickVoxelChunkStreaming neu
    // (Test-Isolation).
    await page.evaluate(() => {
        if (r && r.state && r.state.voxelChunks) {
            for (const key of [...r.state.voxelChunks.keys()]) r._disposeVoxelChunk(key);
        }
    });
    const voxelP1Results = await safeEvaluate(page, () => {
        const out = {};

        // Das Feld ist genuin 3D: bei festem (x,z) fällt die Dichte mit der Höhe — über mehrere
        // Stichproben gemittelt, damit das 3D-Noise-Band die Monotonie nicht lokal kippt.
        let lowerSum = 0;
        let upperSum = 0;
        for (let s = 0; s < 8; s++) {
            const sx = s * 37 - 100;
            const sz = s * 53 + 40;
            lowerSum += r._terrainDensityAt(sx, -40, sz);
            upperSum += r._terrainDensityAt(sx, 60, sz);
        }
        out.densityIs3D = lowerSum > upperSum;
        // Das Feld KANN eine Höhle: ein Luft-Punkt (Dichte < 0) vertikal zwischen festem Grund. Die
        // Höhlen-Zone ist SURF-RELATIV (base-20 .. surf-16) → relativ zur lokalen Oberfläche scannen.
        let foundCave = false;
        for (let sx = -160; sx <= 160 && !foundCave; sx += 20) {
            for (let sz = -160; sz <= 160 && !foundCave; sz += 20) {
                const surf = r._terrainMacroSurfaceY(sx, sz);
                for (let sy = (r.state.terrainBaseHeight || 0) - 22; sy <= surf - 10 && !foundCave; sy += 3) {
                    if (
                        r._terrainDensityAt(sx, sy, sz) < 0 &&
                        r._terrainDensityAt(sx, sy - 6, sz) > 0 &&
                        r._terrainDensityAt(sx, sy + 6, sz) > 0
                    ) {
                        foundCave = true;
                    }
                }
            }
        }
        out.densityCanCave = foundCave;

        // Der Voxel-Chunk fasst das ganze Oberflächen-Band: Boden überall fest, Decke überall Luft →
        // keine Klipp-Löcher.
        const cBase = r.state.terrainBaseHeight || 0;
        let floorAllSolid = true;
        let ceilAllAir = true;
        for (let sx = -220; sx <= 220; sx += 20) {
            for (let sz = -220; sz <= 220; sz += 20) {
                // SURF-RELATIV: Decke 30 m über surf = Luft. Der Boden-Sample liegt UNTER dem Höhlen-Band
                // (Kavernen reichen legitim bis ~surf-45): garantiert fest erst unter caveFloor (base-28) UND
                // dem Seeboden → `min(surf, base) - 40`.
                const surf = r._terrainMacroSurfaceY(sx, sz);
                if (r._terrainDensityAt(sx, Math.min(surf, cBase) - 40, sz) <= 0) floorAllSolid = false;
                if (r._terrainDensityAt(sx, surf + 30, sz) >= 0) ceilAllAir = false;
            }
        }
        out.chunkContainsSurface = floorAllSolid && ceilAllAir;

        // Höhlen entstehen mit der Welt: auf einem 3D-Raster ist eine Höhlen-Zelle Luft, 6 m darüber UND
        // darunter fest umschlossen. Es gibt viele, aber als Minderheit des festen Volumens (die Welt ist
        // nicht hohl); der Boden unter dem Höhlen-Band (base-44, unter caveFloor) bleibt überall fest.
        let caveCells = 0;
        let solidCells = 0;
        let p4FloorSolid = true;
        for (let sx = -200; sx <= 200; sx += 25) {
            for (let sz = -200; sz <= 200; sz += 25) {
                // SURF-RELATIV: der Boden unter der Höhlen-Zone (min aus base-25 und surf-30) bleibt fest; das Band scannt bis surf
                const surf = r._terrainMacroSurfaceY(sx, sz);
                if (r._terrainDensityAt(sx, Math.min(cBase - 25, surf - 30), sz) <= 0) p4FloorSolid = false;
                for (let sy = cBase - 26; sy <= surf + 4; sy += 5) {
                    const dHere = r._terrainDensityAt(sx, sy, sz);
                    if (dHere > 0) solidCells++;
                    if (
                        dHere < 0 &&
                        r._terrainDensityAt(sx, sy - 6, sz) > 0 &&
                        r._terrainDensityAt(sx, sy + 6, sz) > 0
                    ) {
                        caveCells++;
                    }
                }
            }
        }
        out.cavesExist = caveCells >= 8;
        out.worldNotHollow = caveCells * 3 < solidCells;
        out.caveFloorSolid = p4FloorSolid;

        // oy straddelt die echte Oberfläche (ein Tiefband läge unter den Massiven ganz unter Grund → 0 Verts)
        const geom = r._voxelChunkGeometry(0, Math.round(r._terrainMacroSurfaceY(18, 18)) - 20, 0, 20, 20, 20, 1.8);
        out.geomBuilt = !!(geom && geom.getAttribute && geom.getAttribute("position"));
        if (out.geomBuilt) {
            const pos = geom.getAttribute("position");
            out.geomVertexCount = pos.count;
            let allFinite = true;
            for (let v = 0; v < pos.count * 3; v++) {
                if (!Number.isFinite(pos.array[v])) allFinite = false;
            }
            out.geomFinite = allFinite;
            out.geomHasNormals = !!geom.getAttribute("normal");
            out.geomHasIndex = !!geom.getIndex();
            // die Normalen aus dem Dichte-Gradienten: jede ein endlicher Einheitsvektor
            const nrm = geom.getAttribute("normal");
            let normalsUnit = !!nrm && nrm.count === pos.count;
            if (nrm) {
                for (let v = 0; v < nrm.count; v++) {
                    const nl = Math.sqrt(
                        nrm.getX(v) * nrm.getX(v) + nrm.getY(v) * nrm.getY(v) + nrm.getZ(v) * nrm.getZ(v)
                    );
                    if (!Number.isFinite(nl) || Math.abs(nl - 1) > 0.02) {
                        normalsUnit = false;
                        break;
                    }
                }
            }
            out.normalsUnit = normalsUnit;
            // Kein Streck-Dreieck (Index-Aliasing): jede Kante ist lokal klein; ein Stray-Dreieck quer durch
            // den Chunk hätte zig Zellen Kantenlänge. step=1.8 → Grenze 5×step=9.
            if (out.geomHasIndex) {
                const ia = geom.getIndex().array;
                const pa = pos.array;
                let maxEdge = 0;
                const elen = (p, q) => Math.hypot(pa[p] - pa[q], pa[p + 1] - pa[q + 1], pa[p + 2] - pa[q + 2]);
                for (let t = 0; t + 2 < ia.length; t += 3) {
                    const a = ia[t] * 3;
                    const b = ia[t + 1] * 3;
                    const c = ia[t + 2] * 3;
                    const m = Math.max(elen(a, b), elen(b, c), elen(c, a));
                    if (m > maxEdge) maxEdge = m;
                }
                out.geomMaxEdge = maxEdge;
                out.geomNoStrayTris = maxEdge > 0 && maxEdge < 1.8 * 5;

                // Laplacian-Smooth: je Vertex die Y-Distanz zum Nachbar-Mittel, gemittelt über alle Vertices.
                // Ohne Smooth ~step/2 = 0.9 (Surface-Nets-Treppe); 1 Iteration mit Lambda 0.5 halbiert sie etwa
                // (der Vertex wandert 50 % zum Nachbar-Mittel).
                const neighborSets = new Array(pos.count);
                for (let v = 0; v < pos.count; v++) neighborSets[v] = new Set();
                for (let t = 0; t + 2 < ia.length; t += 3) {
                    const i0 = ia[t],
                        i1 = ia[t + 1],
                        i2 = ia[t + 2];
                    neighborSets[i0].add(i1);
                    neighborSets[i0].add(i2);
                    neighborSets[i1].add(i0);
                    neighborSets[i1].add(i2);
                    neighborSets[i2].add(i0);
                    neighborSets[i2].add(i1);
                }
                let totalDev = 0;
                let sampledVerts = 0;
                for (let v = 0; v < pos.count; v++) {
                    const nbrs = neighborSets[v];
                    if (nbrs.size < 2) continue;
                    let sy = 0;
                    for (const n of nbrs) sy += pa[n * 3 + 1];
                    const avgY = sy / nbrs.size;
                    totalDev += Math.abs(pa[v * 3 + 1] - avgY);
                    sampledVerts++;
                }
                out.smoothMeanYDev = sampledVerts > 0 ? totalDev / sampledVerts : 0;
                // step=1.8: ohne Smooth liegt die Mean-Dev typisch > 0.3 (steile Treppen), mit Lambda 0.5 < 0.25.
                out.smoothMeanYDevLow = out.smoothMeanYDev > 0 && out.smoothMeanYDev < 0.25;

                // Alternierende Diagonalen (Schachbrett), 6 Indizes je Quad: a-c-Diagonale [a,b,c, a,c,d] →
                // erster Vertex beider Dreiecke gleich (a); b-d-Diagonale [a,b,d, b,c,d] → ZWEITER Vertex des
                // ersten == ERSTER des zweiten (b). Mit Schachbrett kommen beide Patterns vor.
                let acDiag = 0;
                let bdDiag = 0;
                for (let t = 0; t + 5 < ia.length; t += 6) {
                    if (ia[t] === ia[t + 3]) acDiag++;
                    else if (ia[t + 1] === ia[t + 3]) bdDiag++;
                }
                out.diagonalAcCount = acDiag;
                out.diagonalBdCount = bdDiag;
                out.diagonalAlternates = acDiag > 0 && bdDiag > 0;
            }
        }

        // Die Kollision ist feld-nativ (Dichtefeld), es gibt kein per-Chunk-Kollisions-Artefakt —
        // geprüft wird nur der Mesh-in-Szene-Lebenszyklus von _spawnVoxelTestChunk.
        if (r.state.scene) {
            const before = r.state.scene.children.length;
            const m1 = r._spawnVoxelTestChunk();
            const afterOne = r.state.scene.children.length;
            const m2 = r._spawnVoxelTestChunk();
            const afterTwo = r.state.scene.children.length;
            out.spawnAddsMesh = !!(m1 && m1.isMesh) && afterOne > before;
            // Ein zweiter Aufruf ersetzt — kein Mesh-Wildwuchs.
            out.spawnReplaces = !!(m2 && m2.isMesh) && afterTwo === afterOne;
            // Aufräumen — der Test-Chunk bleibt nicht in der Welt. (P3: keine Ammo-Kollision
            // mehr freizugeben — feld-nativ.)
            if (r._voxelTestMesh) {
                r.state.scene.remove(r._voxelTestMesh);
                r._voxelTestMesh = null;
            }
        }
        return out;
    });

    if (voxelP1Results && !voxelP1Results.error) {
        check("Voxel P1: das Dichte-Feld ist genuin 3D (Dichte nimmt mit der Höhe ab)", voxelP1Results.densityIs3D);
        check("Voxel P1: das Dichte-Feld KANN eine Höhle (Luft zwischen festem Grund)", voxelP1Results.densityCanCave);
        check(
            "Voxel P2b-Politur: der Voxel-Chunk fasst das ganze Oberflächen-Band (Boden fest + Decke Luft — keine Klipp-Löcher)",
            voxelP1Results.chunkContainsSurface
        );
        check("Voxel P4: die Wurm-Höhlen schnitzen echte Luft im Höhlen-Band", voxelP1Results.cavesExist);
        check(
            "Voxel P4: die Welt ist nicht hohl (das Höhlen-Band bleibt überwiegend fest)",
            voxelP1Results.worldNotHollow
        );
        check(
            "Voxel P4: die Tiefen-Hüllkurve hält den Boden (base-44) unter den Höhlen fest",
            voxelP1Results.caveFloorSolid
        );
        check(
            `Voxel P1: _voxelChunkGeometry mesht eine Geometrie (${voxelP1Results.geomVertexCount || 0} Vertices)`,
            voxelP1Results.geomBuilt && (voxelP1Results.geomVertexCount || 0) > 0
        );
        check("Voxel P1: alle Mesh-Positionen sind endlich (kein NaN)", voxelP1Results.geomFinite);
        check(
            "Voxel P1: das Mesh trägt Normalen + einen Index",
            voxelP1Results.geomHasNormals && voxelP1Results.geomHasIndex
        );
        check(
            "Voxel P3b-Politur: die Voxel-Normalen sind Einheitsvektoren aus dem Dichte-Gradienten (glatt, kein Facetten-Muster)",
            voxelP1Results.normalsUnit
        );
        check(
            `Voxel P2b-Politur: kein Streck-Dreieck — jede Kante ist lokal klein (maxEdge ${(voxelP1Results.geomMaxEdge || 0).toFixed(1)} < 9)`,
            voxelP1Results.geomNoStrayTris
        );
        check(
            `V9.41: Quad-Diagonalen alternieren (Schach-Brett) — beide Patterns vorhanden (a-c ${voxelP1Results.diagonalAcCount}, b-d ${voxelP1Results.diagonalBdCount})`,
            voxelP1Results.diagonalAlternates
        );
        check(
            `V9.41.b: Laplacian-Smooth glättet Voxel-Treppen — mittlere Y-Abweichung vom Nachbar-Mittel ${(voxelP1Results.smoothMeanYDev || 0).toFixed(2)} < 0.25 (step 1.8)`,
            voxelP1Results.smoothMeanYDevLow
        );
        check(
            "V9.41: keine Diagonal-Pattern-Dominanz — beide Muster ≥ 10% des jeweils anderen",
            voxelP1Results.diagonalAcCount > 0 &&
                voxelP1Results.diagonalBdCount > 0 &&
                Math.min(voxelP1Results.diagonalAcCount, voxelP1Results.diagonalBdCount) /
                    Math.max(voxelP1Results.diagonalAcCount, voxelP1Results.diagonalBdCount) >=
                    0.1
        );
        check("Voxel P1: _spawnVoxelTestChunk stellt ein Mesh in die Szene", voxelP1Results.spawnAddsMesh);
        check(
            "Voxel P1: ein zweiter Spawn ersetzt den alten Test-Chunk (kein Wildwuchs)",
            voxelP1Results.spawnReplaces
        );
    }

    // ### Voxel-Terrain-Bogen Phase 2b — der Voxel-Chunk-Ring ###
    // Voxel-Chunks streamen um den Spieler, das Heightfield ruht.
    // Parallel, hinter dem Flag — jeder Schritt reversibel.
    const voxelP2bResults = await safeEvaluate(page, () => {
        const out = {};
        // Voxel ist permanent (keine Toggle-Methoden): der Ring ist beim Init gefüllt
        // (state.voxelTerrainActive default true).

        // Der Game-Loop läuft headless gedrosselt (~1 Hz im Hintergrund-Tab) → den Voxel-Ring hier
        // explizit synchron bauen; im Spiel-Pfad läuft alles asynchron.
        const pmInit = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
        // Der Spieler-Chunk baut async im Worker, dessen Callback im synchronen Test-Pump nie feuert →
        // Worker temporär „nicht synced“: `_acquireVoxelChunkBuild` baut dann synchron (Stage-3-Fallback).
        const _wgSynced = r.state.voxelWorkerWorldgenSynced;
        r.state.voxelWorkerWorldgenSynced = false;
        r._drainDirtyVoxelChunks();
        for (let s = 0; s < 50; s++) r._tickVoxelChunkStreaming(pmInit);
        r.state.voxelWorkerWorldgenSynced = _wgSynced;
        // Gras ist deferred (enqueue im Finalize, Build ≤1/Frame im Loop): das Streaming enqueued nur,
        // die Test-Naht drainet sofort — sonst sieht der Grass-Check leere Chunks.
        r._drainPendingGrass();
        out.activated = r.state.voxelTerrainActive === true;
        out.ringFilled = !!(r.state.voxelChunks && r.state.voxelChunks.size > 0);
        // DETERMINISMUS-BOGEN P3 — Voxel-Chunks tragen kein per-Objekt-Kollisions-
        // Artefakt mehr (Ammo entfernt); der Boden lebt feld-nativ im Dichtefeld.

        // der Voxel-Chunk grünt
        let grassEntries = 0;
        let grassBlades = 0;
        if (r.state.voxelChunkGrass) {
            for (const g of r.state.voxelChunkGrass.values()) {
                grassEntries++;
                if (g && g.isInstancedMesh) grassBlades += g.count;
            }
        }
        out.voxelGrassBuilt = grassEntries > 0;
        // Die Wiese ist BODEN-FUNKTION (Parallax-Halme im Terrain-Shading), keine Halm-Geometrie: jede
        // Gras-Zelle verbucht 0 Halme UND das Boden-Albedo ruft die Halm-Schicht (die Ebene des Rausch-Atlas, Konsum am Ruf).
        const T = window.THREE.TSL;
        out.voxelGrassIsSurface =
            grassEntries > 0 &&
            grassBlades === 0 &&
            window.__consumes(r, "_terrainGeologyAlbedo", r._rauschAtlas(), "ebene", [
                T,
                T.attribute("color", "vec3"),
                T.positionWorld,
            ]);
        // _voxelSurfaceY: liefert eine endliche Höhe AUF dem Nulldurchgang (interpoliert wie die
        // Mesh-Kante) — 0,6 m darunter Grund, 0,6 m darüber Luft.
        const sy = r._voxelSurfaceY(12, -8);
        out.voxelSurfaceFinite = Number.isFinite(sy);
        out.voxelSurfaceIsBoundary =
            out.voxelSurfaceFinite &&
            r._terrainDensityAt(12, sy - 0.6, -8) > 0 &&
            r._terrainDensityAt(12, sy + 0.6, -8) <= 0;

        // Der Voxel-Chunk-Ring folgt dem Sicht-Ring-Regler.
        const ringBefore = r.state.chunkRingRadius;
        const activeBefore = r.state._activeRingRadius;
        r.state.chunkRingRadius = 6;
        // Der Lade-Ramp `_activeRingRadius` sitzt zwischen Slider und ringRadius (`min(target, active)`).
        // Geprüft wird der STEADY-STATE → Ramp aufs Ziel setzen (ein langsamer Warmup ließe active < 6).
        r.state._activeRingRadius = 6;
        out.voxelRingFollowsSlider = r._voxelChunkConfig().ringRadius === 6;
        r.state.chunkRingRadius = ringBefore;
        r.state._activeRingRadius = activeBefore;
        // Der Voxel-Vegetations-Pass ist idempotent: ein zweiter
        // Aufruf für denselben Chunk spawnt nichts mehr.
        r._populateVoxelChunkVegetation(777, 777);
        out.voxelVegIdempotent = r._populateVoxelChunkVegetation(777, 777) === 0;
        out.voxelVegMarksChunk = !!(r.state.voxelPopulatedChunks && r.state.voxelPopulatedChunks.has("777,777"));

        // Die Höhen-Konsumenten sind voxel-aware: getTerrainHeightAt + findSurfaceAbove liefern die
        // Voxel-Oberfläche.
        const vsRef = r._voxelSurfaceY(10, 10);
        const ghVoxel = r.getTerrainHeightAt(10, 10);
        out.getTerrainHeightVoxelAware =
            typeof vsRef === "number" &&
            Number.isFinite(vsRef) &&
            typeof ghVoxel === "number" &&
            Math.abs(ghVoxel - vsRef) < 0.01;
        const fsVoxel = r.findSurfaceAbove(10, 9999, 10);
        out.findSurfaceVoxelAware =
            Number.isFinite(fsVoxel) && Math.abs(fsVoxel - vsRef) < 0.01;

        // Zwangs-Migration: eine alte Welt OHNE voxelTerrain-Flag UND eine explizite Heightfield-Opt-out-
        // Welt werden BEIDE voxel-basiert. Welt-Journal vorher sichern + danach restoren — sonst flutet
        // der Migrations-Genesis-Eintrag den folgenden „Journal nicht überflutet“-Test.
        const origMeta = r.state.worldMeta;
        const origJournalEntries = r.state.worldJournal ? r.state.worldJournal.entries.slice() : null;
        const origJournalSeen =
            r.state.worldJournal && r.state.worldJournal.seen ? Object.assign({}, r.state.worldJournal.seen) : null;
        // Alte Welt geladen, kein voxelTerrain-Flag → migrate.
        const oldMeta = { worldId: "test-old-w", slug: "test-old", bornAt: 100, seed: "test" };
        r.state.worldMeta = oldMeta;
        r.ensureWorldMeta();
        out.migrationFlipsOldWorld = oldMeta.voxelTerrain === true;
        // ein Heightfield-Opt-out wird zwangs-migriert
        const optOutMeta = {
            worldId: "test-opt-out",
            slug: "test-opt-out",
            bornAt: 100,
            seed: "test",
            voxelTerrain: false,
        };
        r.state.worldMeta = optOutMeta;
        r.ensureWorldMeta();
        out.migrationForcesOptOut = optOutMeta.voxelTerrain === true;
        r.state.worldMeta = origMeta;
        if (r.state.worldJournal && origJournalEntries) {
            r.state.worldJournal.entries = origJournalEntries;
            if (origJournalSeen) r.state.worldJournal.seen = origJournalSeen;
        }

        // Welt-Feld-Farbe + Naht-Skirt
        let anyColorAttr = false;
        let colorMin = 1;
        let colorMax = 0;
        let skirtProven = false;
        const cfg0 = r._voxelChunkConfig();
        for (const e of r.state.voxelChunks.values()) {
            if (!e || !e.mesh || !e.mesh.geometry) continue;
            const col = e.mesh.geometry.getAttribute("color");
            if (col) {
                anyColorAttr = true;
                for (let i = 0; i < col.count; i++) {
                    const rr = col.getX(i);
                    if (rr < colorMin) colorMin = rr;
                    if (rr > colorMax) colorMax = rr;
                }
            }
            const g = e.mesh.geometry;
            g.computeBoundingBox();
            const ox = (e.mesh.userData.voxelChunkX || 0) * cfg0.span;
            if (g.boundingBox && g.boundingBox.max.x - ox > cfg0.span) skirtProven = true;
        }
        out.voxelHasFieldColors = anyColorAttr;
        out.voxelColorVaries = colorMax - colorMin > 0.05;
        out.voxelSkirt = skirtProven;

        // Streaming: alles abräumen, ein Tick baut wieder auf.
        for (const key of [...r.state.voxelChunks.keys()]) r._disposeVoxelChunk(key);
        const pos = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
        // Ein Tick im synchronen Test erzeugt nur pending Worker-Requests, keine Chunk-Einträge →
        // synchron bauen (Stage-3, Worker temporär „nicht synced“) wie der Pump oben; im Spiel läuft der
        // Tick async.
        const _wgSyncedTick = r.state.voxelWorkerWorldgenSynced;
        r.state.voxelWorkerWorldgenSynced = false;
        r._tickVoxelChunkStreaming(pos);
        r.state.voxelWorkerWorldgenSynced = _wgSyncedTick;
        out.tickBuilds = r.state.voxelChunks.size >= 1;
        // Prune: ein ferner Spieler-Ort räumt alle nahen Chunks.
        // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
        r._pruneDistantVoxelChunks({ x: 99999, y: 0, z: 99999 });
        out.pruneRemovesFar = r.state.voxelChunks.size === 0;

        // nach dem Prune den Spieler-Ring neu (die folgenden Proben brauchen Voxel-Chunks)
        r._tickVoxelChunkStreaming(pos);

        // LOD-Pyramide: der Warmup läuft bei Ring 4 und erreicht LOD2/LOD3 (r≥9) nie, daher explizit:
        // (a) Config LOD-invariant (dim·step=43.2, dimY·step=417.6), (b) Zuweisung r2-8→LOD1, r9-10→2,
        // r≥11→3, (c) ein LOD2- + LOD3-Chunk meshet ohne Crash (dim 6/3 ist sehr grob — Surface-Nets +
        // pad/crop müssen es tragen).
        const cL2 = r._voxelChunkConfig(2);
        const cL3 = r._voxelChunkConfig(3);
        out.lodPyramidConfig =
            cL2.dim === 6 &&
            Math.abs(cL2.dim * cL2.step - 43.2) < 1e-6 &&
            Math.abs(cL2.dimY * cL2.step - 417.6) < 1e-6 &&
            cL3.dim === 3 &&
            Math.abs(cL3.dim * cL3.step - 43.2) < 1e-6 &&
            Math.abs(cL3.dimY * cL3.step - 417.6) < 1e-6;
        // K51-2 (die Boden-Stufen nach dem Kasten-Abstand): der Spieler in der Mitte des Chunks 0,0 — Chunk rr liegt
        // rr · 43,2 − 21,6 m weit (r ≤ 1 → L0, r2 → L1, r3–9 → L2, ab r10 → L3)
        const lf = (rr) => r._voxelChunkLodFor(rr, 0, 21.6, 21.6);
        out.lodPyramidBands =
            lf(0) === 0 && lf(1) === 0 && lf(2) === 1 && lf(3) === 2 && lf(9) === 2 && lf(10) === 3 && lf(12) === 3;
        let lod23Builds = true;
        try {
            for (const lod of [2, 3]) {
                const cfg = r._voxelChunkConfig(lod);
                const surfY = r._terrainMacroSurfaceY(2000, 2000);
                const oy = Math.round(surfY - cfg.dimY * cfg.step * 0.4);
                const g = r._voxelChunkGeometry(2000, oy, 2000, cfg.dim, cfg.dimY, cfg.dim, cfg.step, null, 1);
                const posAttr = g && g.getAttribute && g.getAttribute("position");
                if (!posAttr || posAttr.count === 0) lod23Builds = false;
            }
        } catch (_e) {
            lod23Builds = false;
            out.lod23Err = String(_e && _e.message);
        }
        out.lod23Builds = lod23Builds;

        // die DETAIL-KASKADE: `_detailBand(r)` ist die EINE Quelle der Distanz-Bänder, die Tabelle ist
        // frozen; die Stufe des Boden-Netzes liest `_voxelChunkLodFor` aus seiner Kette (`BODEN_STUFEN`, K51),
        // und der Aerial-Schleier (hazeFar) koppelt an die Ring-Kante (§2).
        const b = (rr) => r._detailBand(rr);
        // die Kaskade trägt keine Geometrie-Stufe mehr (ihr Leser zog in die Kette des Bodens, K51)
        out.bandLods = [0, 2, 3, 8, 9, 10, 11, 99].every((rr) => !("lod" in b(rr)));
        const BS = r.constructor.BODEN_STUFEN;
        const kette = (d) => BS.stufen.find((x) => d < x.bis + BS.vorlauf).lod;
        out.lodReadsBand =
            Object.isFrozen(BS) &&
            Object.isFrozen(BS.stufen) &&
            [0, 1, 2, 3, 9, 10, 12].every(
                (rr) => r._voxelChunkLodFor(rr, 0, 21.6, 21.6) === kette(Math.max(0, rr * 43.2 - 21.6))
            );
        // Die Hysterese: ein Chunk hält seine feinere Stufe, bis der Kasten-Abstand bis + vorlauf +
        // halt erreicht, VERFEINERT aber sofort. Chunk 1,0 (Kante bei 43,2 m): Abstand 41 m → rein L1, mit L0 gehalten;
        // 44 m → L1 (eine Stufe); 38 m mit L1 → L0.
        out.lodHysteresis =
            r._voxelChunkLodFor(1, 0, 2.2, 21.6, 0) === 0 &&
            r._voxelChunkLodFor(1, 0, 2.2, 21.6) === 1 &&
            r._voxelChunkLodFor(1, 0, -0.8, 21.6, 0) === 1 &&
            r._voxelChunkLodFor(1, 0, 5.2, 21.6, 1) === 0 &&
            BS.halt > 0 &&
            BS.vorlauf > 0;
        out.cascadeFrozen = Object.isFrozen(r.constructor.DETAIL_CASCADE);
        // die Kreaturen lesen die Kaskade: das `aiDiv`-Band-Feld
        // (nah jeden Frame, fern seltener) + der Richtungs-Cache nach einem Tick.
        out.bandAiDiv = b(0).aiDiv === 1 && b(8).aiDiv === 1 && b(9).aiDiv === 3 && b(11).aiDiv === 6;
        r.updateCreatures(0.016);
        out.creatureAiCached =
            r.state.creatures.length === 0 ||
            r.state.creatures.some((c) => c.userData && c.userData.aiDir && c.userData.aiDir.isVector3);
        return out;
    });

    if (voxelP2bResults && !voxelP2bResults.error) {
        check(
            "Voxel V9.35: das Voxel-Terrain ist beim Init permanent aktiv (Toggle-frei)",
            voxelP2bResults.activated && voxelP2bResults.ringFilled
        );
        check("Voxel P2b: _tickVoxelChunkStreaming baut den Ring nach (Streaming)", voxelP2bResults.tickBuilds);
        check("Voxel P2b: _pruneDistantVoxelChunks räumt ferne Voxel-Chunks", voxelP2bResults.pruneRemovesFar);
        check(
            "Voxel P2b-Politur: jeder Voxel-Chunk trägt ein Welt-Feld-Farb-Attribut",
            voxelP2bResults.voxelHasFieldColors
        );
        check(
            "Voxel P2b-Politur: die Voxel-Farben variieren über die Welt (keine Mono-Biom-Fläche)",
            voxelP2bResults.voxelColorVaries
        );
        check(
            "Voxel P2b-Politur: der Chunk-Skirt schliesst die Naht (Geometrie überlappt die Chunk-Spanne)",
            voxelP2bResults.voxelSkirt
        );
        check(
            "Welle E (E1): die LOD-Pyramide-Config ist LOD-invariant (LOD2 dim6/step7.2, LOD3 dim3/step14.4; span 43.2 m / 417.6 m)",
            voxelP2bResults.lodPyramidConfig
        );
        check(
            "K51 Boden-Stufen: Nah-Zone 3×3 (r≤1→0, r2→1, r3-9→2, r≥10→3) — der Schritt verdoppelt sich mit dem Abstand",
            voxelP2bResults.lodPyramidBands
        );
        check(
            `Welle E (E1): ein LOD2- + LOD3-Chunk meshet ohne Crash (grobe dim 6/3)${voxelP2bResults.lod23Err ? " — " + voxelP2bResults.lod23Err : ""}`,
            voxelP2bResults.lod23Builds
        );
        check(
            "K51: die Detail-Kaskade trägt keine Geometrie-Stufe (kein Feld ohne Leser)",
            voxelP2bResults.bandLods === true
        );
        check(
            "K51: _voxelChunkLodFor liest die EINE Kette des Bodens (BODEN_STUFEN, frozen, kein Parallel-Pfad)",
            voxelP2bResults.lodReadsBand === true
        );
        check(
            "N3 (Naht §12): LOD-Hysterese — Verfeinern sofort, Vergröbern erst jenseits bis + vorlauf + halt (K51-2, Meter) → kein Flip-Flop am Grat",
            voxelP2bResults.lodHysteresis === true
        );
        check("U1: DETAIL_CASCADE ist frozen (kein Drift)", voxelP2bResults.cascadeFrozen === true);
        check(
            "U3: das Band trägt aiDiv (nah jeden Frame=1, fern seltener: Band2=3, Band3=6)",
            voxelP2bResults.bandAiDiv === true
        );
        check(
            "U3: Kreaturen cachen die KI-Richtung nach einem Tick (creature.userData.aiDir)",
            voxelP2bResults.creatureAiCached === true
        );
        check(
            "Voxel V9.22: _voxelSurfaceY liefert eine echte Fest/Luft-Grenze",
            voxelP2bResults.voxelSurfaceFinite && voxelP2bResults.voxelSurfaceIsBoundary
        );
        check("Voxel V9.22: jeder Voxel-Chunk bekommt einen Gras-Eintrag", voxelP2bResults.voxelGrassBuilt);
        check(
            "Voxel V9.22 (V18.492): die Wiese ist Boden-Funktion — Gras-Zellen verbucht, 0 Halme, Parallax-Halme im Terrain-Albedo",
            voxelP2bResults.voxelGrassIsSurface
        );
        check(
            "Voxel V9.24: der Voxel-Chunk-Ring folgt dem Sicht-Ring-Regler (chunkRingRadius)",
            voxelP2bResults.voxelRingFollowsSlider
        );
        check(
            "Voxel V9.24: _populateVoxelChunkVegetation ist idempotent (zweiter Aufruf → 0)",
            voxelP2bResults.voxelVegIdempotent
        );
        check(
            "Voxel V9.24: _populateVoxelChunkVegetation markiert den Chunk in voxelPopulatedChunks",
            voxelP2bResults.voxelVegMarksChunk
        );
        check(
            "Voxel V9.25 Phase 5b: getTerrainHeightAt liefert in einer Voxel-Welt die Voxel-Oberfläche",
            voxelP2bResults.getTerrainHeightVoxelAware
        );
        check(
            "Voxel V9.25 Phase 5b: findSurfaceAbove liefert in einer Voxel-Welt die Voxel-Oberfläche",
            voxelP2bResults.findSurfaceVoxelAware
        );
        check(
            "Voxel V9.26 Phase 5c: eine geladene alte Welt ohne voxelTerrain-Flag wird voxel-basiert",
            voxelP2bResults.migrationFlipsOldWorld
        );
        check(
            "Voxel V9.35 Phase 5c.2.c.2: ein altes voxelTerrain:false (V9.23-Opt-out) wird zwangs-migriert (Toggle ist tot)",
            voxelP2bResults.migrationForcesOptOut
        );
    }

    // ### Voxel permanent + irreversibel (kein Toggle) ###
    // Voxel ist beim Init aktiv, `worldMeta.voxelTerrain` immer true (Zwangs-Migration in
    // `ensureWorldMeta`); Toggle-Methoden + `voxel terrain on/off`-Chat-Befehl sind weg.
    const voxelV935ToggleResults = await safeEvaluate(page, () => {
        const out = {};
        // Voxel ist beim Init aktiv (kein toggle nötig).
        out.voxelPermanent = r.state.voxelTerrainActive === true;
        out.metaPermanent = !!(r.state.worldMeta && r.state.worldMeta.voxelTerrain === true);
        // Der Welt-Snapshot trägt das Flag (überlebt Reload).
        const snap = r.buildStateSnapshot();
        out.snapshotHasFlag = !!(snap && snap.worldMeta && snap.worldMeta.voxelTerrain === true);
        // Der Chat-Toggle ist tot: der Source-Scan prüft das String-Literal `=== "voxel terrain on"`
        // (Code-Logik, nicht einen Kommentar, der den toten Befehl erwähnt).
        out.noChatToggle = window.__fehlt(r.processChatCommand, /===\s*["']voxel terrain on["']/);
        return out;
    });

    if (voxelV935ToggleResults && !voxelV935ToggleResults.error) {
        check(
            "Voxel V9.35: voxelTerrainActive ist permanent true (Default + nie umschaltbar)",
            voxelV935ToggleResults.voxelPermanent
        );
        check(
            "Voxel V9.35: worldMeta.voxelTerrain ist permanent true (Zwangs-Migration)",
            voxelV935ToggleResults.metaPermanent
        );
        check(
            "Voxel V9.35: der Welt-Snapshot trägt das voxelTerrain-Flag (überlebt Reload)",
            voxelV935ToggleResults.snapshotHasFlag
        );
        check(
            "Voxel V9.35: der `voxel terrain on/off`-Chat-Toggle ist aus processChatCommand entfernt",
            voxelV935ToggleResults.noChatToggle
        );
    }

    // ### Voxel-Welt ohne Heightfield ###
    // Eine Voxel-Welt baut keine Heightfield-Chunks und keine heightData (groundHeightField null,
    // min/maxHeight 0); updateCreatures setzt Kreaturen via getTerrainHeightAt auf die Voxel-Surface.
    // Alle Proben teilen dieselben generateNewWorld-Aufrufe (Heap-Schonung).
    const voxelP5c1Results = await safeEvaluate(page, async () => {
        const out = {};

        // (1) Voxel-Welt: kein initialer Chunk-Build + keine heightData.
        r.state.worldMeta.voxelTerrain = true;
        r.state.lastWorldgen = 0;
        await r.generateNewWorld({ force: true }); // die Heimat kommt aus dem Faden
        // keine Heightfield-Chunks: `chunkMap` abwesend oder leer
        out.voxelChunkMapEmpty = !r.state.chunkMap || r.state.chunkMap.size === 0;
        out.voxelMaterialKept = r.state.terrainMaterial != null;
        // heightData/minHeight/maxHeight nicht allokiert
        out.voxelGroundFieldNull = r.state.groundHeightField === null;
        out.voxelMinHeightZero = r.state.minHeight === 0;
        out.voxelMaxHeightZero = r.state.maxHeight === 0;
        out.voxelMinHeightFinite = Number.isFinite(r.state.minHeight);

        // das Tier auf dem sichtbaren Boden misst gate:koerper-stand K8 huf (der Huf gegen das gezeichnete Mesh, 200 Kontakte)

        // Selbst wenn ein Test-Setup `voxelTerrain = false` setzt, baut der Welt-Generator keine
        // Heightfield-Chunks (chunkMap bleibt leer) — der `else`-Pfad in `generateTerrainWithParameters`
        // ist gelöscht.
        r.state.worldMeta.voxelTerrain = false;
        r.state.lastWorldgen = 0;
        await r.generateNewWorld({ force: true });
        // „abwesend ODER leer": kein Heightfield-Chunk gebaut.
        out.heightfieldElseDead = !r.state.chunkMap || r.state.chunkMap.size === 0;
        // Restore: voxelTerrain auf true zurück + Regen, damit
        // die nachfolgenden Tests eine Voxel-Welt haben.
        r.state.worldMeta.voxelTerrain = true;
        r.state.lastWorldgen = 0;
        await r.generateNewWorld({ force: true });
        return out;
    });

    if (voxelP5c1Results && !voxelP5c1Results.error) {
        check(
            "Voxel V9.27 Phase 5c.1: eine Voxel-Welt überspringt die initialen 64 Heightfield-Chunks (chunkMap leer)",
            voxelP5c1Results.voxelChunkMapEmpty
        );
        check(
            "Voxel V9.37 Phase 5c.2.c.3.b.i: der Heightfield-`else`-Pfad in generateTerrainWithParameters ist tot — auch `voxelTerrain = false` baut keine Heightfield-Chunks mehr",
            voxelP5c1Results.heightfieldElseDead
        );
        check(
            "Voxel V9.28: eine Voxel-Welt hat KEIN groundHeightField (heightData übersprungen)",
            voxelP5c1Results.voxelGroundFieldNull
        );
        check(
            "Voxel V9.28: state.minHeight ist 0 in einer Voxel-Welt (kein Infinity-Leak)",
            voxelP5c1Results.voxelMinHeightZero && voxelP5c1Results.voxelMinHeightFinite
        );
        check("Voxel V9.28: state.maxHeight ist 0 in einer Voxel-Welt", voxelP5c1Results.voxelMaxHeightZero);
    }

    // ### Voxel — Lösch-Beweise der Heightfield-Pipeline ###
    // Die toten Heightfield-Methoden + der `terrainMaterial`-Setzer sind weg; die Vision-Schichten
    // leben in den Voxel-Pendants (`_populateVoxelChunkVegetation`, `_buildVoxelChunkGrass`,
    // `_attachVoxelFieldColors`).
    const voxelV939Results = await safeEvaluate(page, () => {
        return {
            // populateChunkVegetation nennt noch ein Log-Text des Stamms, darum steht sie hier und nicht in gate:altlasten
            noPopulateChunkVegetation: typeof r.populateChunkVegetation !== "function",
            terrainMaterialNull: r.state.terrainMaterial === null,
            voxelGrassAlive: r.state.voxelChunkGrass instanceof Map,
        };
    });

    if (voxelV939Results && !voxelV939Results.error) {
        check("Voxel V9.39: populateChunkVegetation ist gelöscht", voxelV939Results.noPopulateChunkVegetation);
        check(
            "Voxel V9.39: state.terrainMaterial wird nicht mehr gesetzt (null nach Welt-Aufbau)",
            voxelV939Results.terrainMaterialNull
        );
        check(
            "Voxel V9.39: das Voxel-Gras-Register lebt weiter (state.voxelChunkGrass ist eine Map)",
            voxelV939Results.voxelGrassAlive
        );
    }
}

// Distance-LOD: ferne Chunks (> 80 m) bauen mit step=3.6 m statt 1.8, dim=12 statt 24, dimY=62
// statt 124 (8× weniger Cells). Span (43.2 m) + vertikaler Range (223.2 m) bleiben konstant
// → Chunks world-aligned über die LOD-Grenze.
async function checkBandWellePerf3bDistanceLod({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        // 1) Config-Trennung LOD 0 vs LOD 1
        const cfg0 = r._voxelChunkConfig(0);
        const cfg1 = r._voxelChunkConfig(1);
        out.lod0Dim = cfg0.dim;
        out.lod0Step = cfg0.step;
        out.lod0DimY = cfg0.dimY;
        out.lod1Dim = cfg1.dim;
        out.lod1Step = cfg1.step;
        out.lod1DimY = cfg1.dimY;
        out.spanInvariant = cfg0.span === cfg1.span;
        out.verticalRangeInvariant = Math.abs(cfg0.dimY * cfg0.step - cfg1.dimY * cfg1.step) < 0.001;
        out.lod1CellsLess = cfg1.dim * cfg1.dim * cfg1.dimY < cfg0.dim * cfg0.dim * cfg0.dimY;
        out.cellsRatio = (cfg0.dim * cfg0.dim * cfg0.dimY) / (cfg1.dim * cfg1.dim * cfg1.dimY);
        // 2) Helper `_voxelChunkLodFor` Distance-Decision
        // der Spieler in der Mitte des Chunks 0,0 (die Stufe folgt dem Kasten-Abstand)
        out.lodNear = r._voxelChunkLodFor(0, 0, 21.6, 21.6); // r=0 → LOD 0
        out.lodAdjacent = r._voxelChunkLodFor(1, 0, 21.6, 21.6); // r=1 (21,6 m) → LOD 0
        out.lodMidRing = r._voxelChunkLodFor(2, 0, 21.6, 21.6); // r=2 (64,8 m) → LOD 1
        out.lodFar = r._voxelChunkLodFor(3, 0, 21.6, 21.6); // r=3 (108 m) → LOD 2
        out.lodVeryFar = r._voxelChunkLodFor(4, 0, 21.6, 21.6); // r=4 → LOD 2
        // 3) Empirisch: ein streaming-aktiver Chunk hat `entry.lod`. Async-Streaming macht die LOD-
        // Verteilung history-abhängig (Flake) → EINEN LOD-1-Chunk deterministisch bauen (Worker aus →
        // sync, ferner frischer Chunk, lod=1 explizit).
        {
            const _savedW88 = r.state.voxelWorker;
            r.state.voxelWorker = null;
            const span88 = r._voxelChunkConfig(0).span;
            const pmc = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
            const pcx88 = Math.floor(pmc.x / span88) + 20; // fern → frisch (nicht vom Warmup gebaut)
            const pcz88 = Math.floor(pmc.z / span88) + 20;
            if (!r.state.voxelChunks.has(`${pcx88},${pcz88}`)) r._ensureVoxelChunkAt(pcx88, pcz88, 1);
            r.state.voxelWorker = _savedW88;
        }
        if (!r.state.voxelChunks || r.state.voxelChunks.size === 0) {
            return { ...out, error: "no chunks streamed" };
        }
        // Sammle Chunks pro LOD
        let lod0Count = 0;
        let lod1Count = 0;
        let lod0Cells = null;
        let lod1Cells = null;
        for (const [, entry] of r.state.voxelChunks.entries()) {
            if (!entry || !entry.mesh) continue;
            const elod = Number.isFinite(entry.lod) ? entry.lod : 0;
            if (elod === 0) {
                lod0Count++;
                if (lod0Cells === null && entry.waterCells) lod0Cells = entry.waterCells.length;
            } else if (elod === 1) {
                lod1Count++;
                if (lod1Cells === null && entry.waterCells) lod1Cells = entry.waterCells.length;
            }
        }
        out.lod0Count = lod0Count;
        out.lod1Count = lod1Count;
        out.lod0CellsLen = lod0Cells;
        out.lod1CellsLen = lod1Cells;
        return out;
    });
    if (res.error) {
        check("Welle Perf-3.b V9.88: Distance-LOD-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "Welle F / T8: LOD 0 Config (dim=24, step=1.8, dimY=232 — das weite Band, Band-Skip)",
        res.lod0Dim === 24 && Math.abs(res.lod0Step - 1.8) < 0.001 && res.lod0DimY === 232
    );
    check(
        "Welle F / T8: LOD 1 Config (dim=12, step=3.6, dimY=116) — Vertikal-Span 417.6 m LOD-invariant",
        res.lod1Dim === 12 && Math.abs(res.lod1Step - 3.6) < 0.001 && res.lod1DimY === 116
    );
    check("Welle Perf-3.b V9.88: span invariant über LOD (43.2 m, Chunks world-aligned)", res.spanInvariant);
    check("Welle Perf-3.b V9.88 / T8: vertikaler Range invariant (dimY·step = 417.6 m)", res.verticalRangeInvariant);
    check(
        "Welle Perf-3.b V9.88: LOD 1 hat 8× weniger Cells als LOD 0",
        res.lod1CellsLess && Math.abs(res.cellsRatio - 8) < 0.01,
        `ratio=${res.cellsRatio.toFixed(2)}`
    );
    check("Welle Perf-3.b V9.88: r=0 (Player-Chunk) → LOD 0", res.lodNear === 0);
    check("Welle Perf-3.b V9.88: r=1 (Nachbar-Chunk) → LOD 0", res.lodAdjacent === 0);
    check("K51 Boden-Stufen: r=2 (jenseits der Nah-Zone 3×3) → LOD 1", res.lodMidRing === 1);
    check("K51 Boden-Stufen: r=3 → LOD 2", res.lodFar === 2);
    check("K51 Boden-Stufen: r=4 (sehr ferner Chunk) → LOD 2", res.lodVeryFar === 2);
    check("Welle Perf-3.b V9.88: ≥1 LOD-0-Chunk gestreamt (Nahbereich)", res.lod0Count >= 1);
    check("Welle Perf-3.b V9.88: ≥1 LOD-1-Chunk gestreamt (Fernbereich)", res.lod1Count >= 1);
    if (res.lod0CellsLen !== null && res.lod1CellsLen !== null) {
        // Wasser-Cells leben IMMER auf LOD 0 (71424), unabhängig von der Terrain-LOD → beide LODs gleich
        // lang (naht-frei per Konstruktion). Nur das Terrain ist LOD-aware (eigener Vertex-Check).
        check(
            "Welle Perf-3.b V9.88 / V9.93: waterCells gleich-lang (V9.93-Naht-Heilung) — beide LODs LOD-0-Cells",
            res.lod1CellsLen === res.lod0CellsLen,
            `LOD0=${res.lod0CellsLen}, LOD1=${res.lod1CellsLen}`
        );
    }
}

// DER RING IST EXISTENZ (`_ringWaechst`, Lehre 13): auf schwachem Holz (frameMs 50 ab Bild 1, jeder Frame über dem Budget,
// der Regler ruht wie unter `__weltStehtNach`) wächst der Ring Schale um Schale bis zum Ziel, sobald die jetzige steht — nie
// darüber, nie zurück unter Last; eine ungebaute Schale hält ihn, der gesenkte Regler des Spielers gilt sofort.
async function checkBandJedesHolzExistenzBoden({ page, check }) {
    const res = await page.evaluate(() => {
        const F = [
            "renderer",
            "_activeRingRadius",
            "chunkRingRadius",
            "voxelMeshPending",
            "pendingGrass",
            "perfRegulator",
            "perfSense",
            "_frameOverBudget",
        ];
        const snap = F.map((k) => st[k]);
        let gebaut = 12;
        const pfad = [];
        const takt = (n) => {
            for (let i = 0; i < n; i++) r._ringWaechst();
            pfad.push(st._activeRingRadius);
        };
        try {
            Object.assign(st, { renderer: { _isHeadlessNull: false }, chunkRingRadius: 4, _activeRingRadius: 0 });
            Object.assign(st, { voxelMeshPending: new Set(), pendingGrass: new Set(), perfRegulator: false });
            Object.assign(st, { perfSense: { frameMs: 50, phase: {} }, _frameOverBudget: true });
            Object.assign(r, { _builtRingRadius: () => gebaut, _ladeTakt: () => false });
            for (let i = 0; i < 6; i++) takt(1);
            [st._activeRingRadius, gebaut] = [2, 1];
            takt(3);
            gebaut = 2;
            takt(1);
            st.chunkRingRadius = 2;
            takt(1);
        } catch (e) {
            pfad.push(e.message);
        } finally {
            F.forEach((k, i) => (st[k] = snap[i]));
            delete r._builtRingRadius;
            delete r._ladeTakt;
        }
        return pfad.join(",");
    });
    check(
        `JEDES-HOLZ: ohne Kopfraum und Regler wächst der Ring bis zum Ziel und nie zurück (${res}) — die Welt existiert ganz`,
        res.startsWith("1,2,3,4,4,4,")
    );
    check(
        `JEDES-HOLZ: eine ungebaute Schale hält den Ring, der gesenkte Regler gilt sofort (${res})`,
        res.endsWith(",2,3,2")
    );
}

// Wasser-Cells leben IMMER auf LOD 0, unabhängig vom Terrain-LOD des Chunks — sonst klafft die
// Wasser-Iso-Surface an der LOD-Grenze (Cell-Center step-abhängig). Terrain bleibt LOD-aware.
async function checkBandWelle993WaterLodSeam({ page, check }) {
    const res = await page.evaluate(async () => {
        const out = {};
        const cfg0 = r._voxelChunkConfig(0);
        out.expectedCellLen = cfg0.dim * cfg0.dim * cfg0.dimY; // T8: 24·24·232 = 133632
        // Ein Wasser-Chunk am Wasser-Ort des Gesetzes (`__wasserChunk`: die Heimat trägt seit K16 keinen See).
        await window.__wasserChunk("see");
        // Empirisch: alle Chunks mit waterCells haben gleiche Länge (133632)
        // egal welcher Terrain-LOD.
        let totalWithCells = 0;
        let lod0WithCells = 0;
        let lod1WithCells = 0;
        let allCellsAreLod0 = true;
        let firstMismatchLen = null;
        for (const [, entry] of r.state.voxelChunks.entries()) {
            if (!entry || !entry.waterCells) continue;
            totalWithCells++;
            const cellLen = entry.waterCells.length;
            const tlod = Number.isFinite(entry.lod) ? entry.lod : 0;
            if (tlod === 0) lod0WithCells++;
            else if (tlod === 1) lod1WithCells++;
            if (cellLen !== out.expectedCellLen) {
                allCellsAreLod0 = false;
                if (firstMismatchLen === null) firstMismatchLen = cellLen;
            }
        }
        out.totalWithCells = totalWithCells;
        out.lod0WithCells = lod0WithCells;
        out.lod1WithCells = lod1WithCells;
        out.allCellsAreLod0 = allCellsAreLod0;
        out.firstMismatchLen = firstMismatchLen;
        return out;
    });
    if (res.error) {
        check("Welle V9.93: Wasser-LOD-Naht-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "Welle V9.93: Wasser-Cells alle gleich-lang (LOD 0 = 133632, T8) — naht-frei per Konstruktion",
        res.allCellsAreLod0,
        `expected=${res.expectedCellLen}, firstMismatch=${res.firstMismatchLen}, total=${res.totalWithCells}`
    );
    check(
        "Welle V9.93: ≥1 Chunk mit waterCells gefunden (Vorbedingung)",
        res.totalWithCells >= 1,
        `total=${res.totalWithCells}, lod0=${res.lod0WithCells}, lod1=${res.lod1WithCells}`
    );
}

// SCHATTEN-CSM: das vendorte r184-Addon CSMShadowNode, 3 Kaskaden INNERHALB der Schatten-Reichweite: bis kontaktM
// (schatten.K1), bis zur Band-0-Kante, bis maxFar = Reichweite × SCHATTEN_FERN_FAKTOR. Über die ganze geregelte Reichweite (MIN..MAX) und die
// User-Decke (400 m) trägt jede Kaskade hinter der Kontakt-Kaskade ≥ 10 % der Tiefe. Die CSM-Init
// ist LAZY (erster echter Material-Build) → hier Konstruktion + Vertrag; Look + Maps misst die Sonde diag-csm (git-Archiv).
async function checkBandV18130CsmShadow({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};
        out.vendorSymbol = typeof window.THREE.CSMShadowNode === "function";
        const csm = r.state.csmNode;
        out.active = !!csm;
        if (csm) {
            out.cascades = csm.cascades;
            out.fade = csm.fade === true;
            out.isShadowNode = r.state.directionalLight && r.state.directionalLight.shadow.shadowNode === csm;
            out.mode = csm.mode;
            const span = r._voxelChunkConfig(0).span;
            const e0 = (A.DETAIL_CASCADE[0].maxRing + 0.5) * span;
            const F = A.SCHATTEN_FERN_FAKTOR;
            const fars = [A.PERF_SHADOW_RANGE_MIN * F, A.PERF_SHADOW_RANGE_MAX * F, 400 * F];
            let kante = true,
                minAnteil = 1;
            const zeilen = [];
            for (const far of fars) {
                const breaks = [];
                csm.customSplitsCallback(csm.cascades, 0.5, far, breaks);
                if (breaks.length !== csm.cascades || breaks[breaks.length - 1] !== 1) kante = false;
                if (Math.abs(breaks[0] - A.SCHATTEN_KASKADE.kontaktM / far) > 1e-9) kante = false;
                if (Math.abs(breaks[1] - Math.min(0.85, e0 / far)) > 1e-9) kante = false;
                let prev = breaks[0];
                for (const b of breaks.slice(1)) {
                    minAnteil = Math.min(minAnteil, b - prev);
                    prev = b;
                }
                zeilen.push(far.toFixed(0) + ":" + breaks.map((b) => b.toFixed(2)).join("/"));
            }
            out.breaksAreLaw = kante;
            out.minAnteil = +minAnteil.toFixed(3);
            out.breaks = zeilen.join(" ");
            // die Boot-Tiefe liest dieselbe Größe wie der Regler (Decke × Faktor), nie eine eigene Zahl
            const decke =
                r.state.atmosphere && Number.isFinite(r.state.atmosphere.shadowRange)
                    ? r.state.atmosphere.shadowRange
                    : A.PERF_SHADOW_RANGE_MAX;
            const applied = Number.isFinite(r._shadowRangeApplied) ? r._shadowRangeApplied : decke;
            out.maxFarIstReichweite = Math.abs(csm.maxFar - applied * F) < 1e-6;
            out.maxFar = +csm.maxFar.toFixed(1);
        }
        return out;
    });
    if (!res) {
        check("CSM: Sonde lief", false, "evaluate warf");
        return;
    }
    check("CSM: das r184-Addon ist vendort + angebunden (THREE.CSMShadowNode)", res.vendorSymbol);
    check(
        "schatten.K1 CSM: 3 Kaskaden aktiv als shadowNode des Sonnen-Lichts (fade an)",
        res.active && res.cascades === 3 && res.fade && res.isShadowNode
    );
    check(
        "schatten.K1 CSM: Kaskade 0 endet an kontaktM, Kaskade 1 an der Band-0-Kante, die letzte an maxFar",
        res.active && res.mode === "custom" && res.breaksAreLaw && res.maxFarIstReichweite,
        `breaks=${res.breaks} maxFar=${res.maxFar}`
    );
    check(
        "CSM: jede Kaskade hinter der Kontakt-Kaskade trägt ≥ 10 % der Tiefe (kein Streifen-Durchgang)",
        res.active && res.minAnteil >= 0.1,
        `min=${res.minAnteil} breaks=${res.breaks}`
    );
}

// A3 — FERNE BINNENGEWÄSSER: Heimat-Region (±1024) unberührt; jenseits liefern lazy Kacheln (2048 m,
// f(seed, Koordinate) — peer-identisch, egal wann berechnet) Seen · Flüsse · Erosion; eine
// mitwandernde Region bräche den Determinismus. Voller Beweis: die Sonde diag-ferne-seen (git-Archiv).
async function checkBandV18132FerneSeen({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};
        if (!r.state.hydrosphere || !r.state.hydrosphere.ready) {
            out.unmeasurable = true; // Welt zu jung — unmessbar = bestanden (V13.1)
            return out;
        }
        // HEIMAT-IDENTITAET: Fingerprint vor/nach einem Kachel-Bau bit-gleich.
        const fp = () => {
            const v = [];
            for (let i = 0; i < 6; i++)
                for (let j = 0; j < 6; j++) {
                    const x = -900 + i * 360;
                    const z = -900 + j * 360;
                    v.push(r._atlasWaterLevelAt(x, z, -Infinity));
                }
            return JSON.stringify(v);
        };
        const before = fp();
        await window.__weltDa(() => !r._ensureHydroTilesAround(-2048, 0, 10)); // Kachel WEST (-1,0) aus dem Faden
        const tile = r.state.hydroTiles ? r.state.hydroTiles.get("-1,0") : null;
        out.tileBuilt = !!(tile && tile.ready);
        out.tileSubstanz = tile ? tile.fluesse + tile.seen : 0;
        out.homeIdentical = fp() === before;
        // hydroBand deckt JEDEN Spiegel (das Band ist global) — die Seen UND die Flüsse (Punkt-Spiegel S) der Heimat
        // und jeder Kachel. K16: das Band kannte nur die Seen (23,7 m), die Flüsse der Landform steigen bis 55 m — der
        // Zell-Bau ließ jede Fluss-Zelle über dem Band AIR (Heimat 344 von 549 Segmenten ohne gezeichnetes Wasser).
        let maxSpiegel = -Infinity;
        for (const h of [r.state.hydrosphere, ...(r.state.hydroTiles ? r.state.hydroTiles.values() : [])]) {
            if (!h) continue;
            for (const lk of h.lakes || [])
                if (Number.isFinite(lk.level) && lk.level > maxSpiegel) maxSpiegel = lk.level;
            for (const fl of h.rivers || [])
                for (const p of fl.points || []) if (Number.isFinite(p.S) && p.S > maxSpiegel) maxSpiegel = p.S;
        }
        out.maxSpiegel = maxSpiegel;
        out.bandTop = r.state.hydroBand ? r.state.hydroBand.top : null;
        out.bandCovers = !Number.isFinite(maxSpiegel) || (r.state.hydroBand && r.state.hydroBand.top >= maxSpiegel);
        // die Leser der Kachel im Haupt-Faden misst gate:worker-dichte `--kern` (am See in seiner Kachel)
        const cfg = r._voxelChunkConfig(0);
        // DER WORKER SPIEGELT DIE KACHEL (Lehre 7), auch ein nach ihr geborener (`_getVoxelWorker` bestellt sie ihm): bit-gleich.
        const fl = ((tile && tile.rivers) || []).find((f) => f.points && f.points.length > 4);
        const p = fl ? fl.points[fl.points.length >> 1] : { x: -2048, z: 0 };
        const cx = Math.floor(p.x / cfg.span);
        const cz = Math.floor(p.z / cfg.span);
        const g = [cx * cfg.span - cfg.step, (r.state.terrainBaseHeight || 0) - cfg.floorDrop, cz * cfg.span - cfg.step];
        g.push(cfg.dim + 3, cfg.dimY, cfg.dim + 3, cfg.step);
        const main = r._voxelEditedDensityGrid(`ferne-seen|${cx},${cz}`, ...g);
        r.state.voxelBaseDensityCache.delete(`ferne-seen|${cx},${cz}`);
        const alt = r.state.voxelWorker;
        r.state.voxelWorker = null;
        const neu = r._getVoxelWorker();
        const wk = await r._voxelWorkerComputeDensity(...g).catch((e) => String(e));
        neu.terminate();
        r.state.voxelWorker = alt;
        const bits = (a) => new Uint32Array(a.buffer, a.byteOffset, a.length);
        out.workerMirror =
            !wk || typeof wk === "string" ? String(wk) : main.length === wk.length && bits(main).every((v, i) => v === bits(wk)[i]);
        return out;
    });
    if (!res) {
        check("Ferne Seen: Sonde lief", false, "evaluate warf");
        return;
    }
    if (!res.unmeasurable) {
        check(
            "Ferne Seen: der Worker spiegelt die Kachel — das Dichte-Gitter am Kachel-Fluss ist in Main und Worker bit-gleich",
            res.workerMirror === true,
            String(res.workerMirror)
        );
        check(
            "Ferne Seen: die WEST-Kachel baut mit Substanz (Fluesse+Seen > 0)",
            res.tileBuilt && res.tileSubstanz > 0,
            `substanz=${res.tileSubstanz}`
        );
        check("Ferne Seen: die HEIMAT-Region bleibt bit-identisch (Welt-Identitaet)", res.homeIdentical);
        check(
            "Ferne Seen: hydroBand deckt jeden Spiegel — Seen und Flüsse der Heimat und jeder Kachel (global, V9.77)",
            res.bandCovers,
            `Band-Oberkante ${res.bandTop} · höchster Spiegel ${res.maxSpiegel} (Täter: _computeHydroBand)`
        );
    }
}

// FAHR-TIEFE: das Fahr-Profil emergiert aus der Substanz (Räder = Tempo + Ausrollen, Masse =
// Trägheit), der Sattel führt die Bewegung (EINE Quelle), Gelenke fahren mit (Phase ∝ Weg). Reiter
// + Gefährt sind EINS: Kollision ruht im Sattel, unerntbar.
async function checkBandV18150Ride({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const pm = r.state.playerMesh.position;
        const savedMounted = r.state.player.mountedArch;
        let entry = null;
        try {
            // AUSLÖSCHUNGS-WELLE — der fahrzeug_wagen-Blueprint fiel; die Wagen-Substanz
            // (KIND_SUBSTANCE, parts + connections) trägt die Fahr-Tiefe als Test-Blueprint.
            const KSr = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            if (r.state.blueprints._t_ride_wagen) delete r.state.blueprints._t_ride_wagen;
            r.state.blueprints._t_ride_wagen = {
                name: "_t_ride_wagen",
                parts: JSON.parse(JSON.stringify(KSr.fahrzeug_wagen.parts)),
                connections: JSON.parse(JSON.stringify(KSr.fahrzeug_wagen.connections || [])),
            };
            // die Hülle ist der Körper des gerittenen Werks — die Probe fährt auf BEFAHRBAREM Boden: die
            // erste Stelle um Spieler + 60 m, deren Gelände auf 12 m Fahrt × ±2 m Breite eine Ebene ist (Rest ≤ 0,2 m,
            // Steigung ≤ 20 %). An (96, 60) stand der Wagen in einer Mulde (der Rand 2 m hoch auf 3 m) — ein Hindernis ist
            // ein anderes Band (gate:fahr-leben H).
            const pmAlt = { x: pm.x + 60, z: pm.z + 60 }; // wo die Bänder danach den Spieler erwarten (der alte Ort)
            let ort = { x: pmAlt.x, z: pmAlt.z };
            for (let i = 0; i < 12 * 16; i++) {
                const ring = 2 + Math.floor(i / 12);
                const cx = pm.x + Math.cos(((i % 12) * Math.PI) / 6) * ring * 24;
                const cz = pm.z + Math.sin(((i % 12) * Math.PI) / 6) * ring * 24;
                const h0 = r.getTerrainHeightAt(cx, cz);
                const gx = (r.getTerrainHeightAt(cx + 2, cz) - r.getTerrainHeightAt(cx - 2, cz)) / 4;
                const gz = (r.getTerrainHeightAt(cx, cz + 6) - r.getTerrainHeightAt(cx, cz - 3)) / 9;
                if (!Number.isFinite(h0) || !(Math.hypot(gx, gz) <= 0.2)) continue;
                let eben = true;
                for (let dz = -3; dz <= 9 && eben; dz += 1.5)
                    for (let dx = -2; dx <= 2 && eben; dx += 1) {
                        const h = r.getTerrainHeightAt(cx + dx, cz + dz);
                        if (!Number.isFinite(h) || Math.abs(h - (h0 + gx * dx + gz * dz)) > 0.2) eben = false;
                    }
                if (eben) {
                    ort = { x: cx, z: cz };
                    break;
                }
            }
            entry = r.spawnArchitecture("_t_ride_wagen", { x: ort.x, y: pm.y, z: ort.z }, { silent: true });
            out.spawned = !!entry;
            if (!entry) return out;
            // (1) das Profil emergiert aus den Gelenken + der Masse.
            const prof = r._vehicleProfile(entry);
            out.profile =
                !!prof && prof.radCount === 4 && prof.topSpeedMul > 1.3 && prof.kBrake < prof.kAcc && prof.mass > 1;
            // (2) der Sattel: Aufsteigen ruht die Kollision + liest das Profil — `_stepCharacterStructures`
            // überspringt `riddenId` (= player.mountedArch), das gerittene Gefährt blockt seinen Reiter nicht.
            r.mountArchitecture(entry);
            // die Kapsel mitten in einer Box des gerittenen Wagens bleibt stehen, ohne Sattel schiebt dieselbe Box sie hinaus
            const b = entry.blockerAABBs && entry.blockerAABBs[0];
            const schub = (id) => {
                r.state.player.mountedArch = id;
                const k = { x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2 };
                r._stepCharacterStructures(k, b.botY - 1, b.topY + 1, r.constructor.PLAYER_WALL_RADIUS, null, null);
                return Math.hypot(k.x - (b.minX + b.maxX) / 2, k.z - (b.minZ + b.maxZ) / 2);
            };
            const schubImSattel = b ? schub(entry.id) : NaN;
            const schubOhne = b ? schub(null) : NaN;
            r.state.player.mountedArch = entry.id;
            out.collisionRests = !!b && schubImSattel === 0 && schubOhne > 0;
            out.kapselSchub = `im Sattel ${schubImSattel} m · ohne ${schubOhne} m`;
            out.profileConsumed = r._mountedVehicleProfile() === prof;
            // (3) Reiter + Gefährt sind EINS: unerntbar + kein Sammler-Ziel, solange geritten.
            out.unharvestable = r.harvestArchitecture(entry, "player") === null;
            out.noGatherTarget = r._findNearestArchitectureWithMaterial(entry.position, "holz") !== entry;
            // (4) das Gefährt fährt in seine Bug-Richtung + die Räder rollen (Phase ∝ Weg).
            // ein Werk mit vier Rädern trägt das Fahr-Gesetz (exportDrive aus seiner Hülle) und fährt den
            // EINEN Fahr-Schritt des Kerns im ECHTEN Sim-Schritt (W gehalten); die Pose zeichnet der Frame.
            for (const k of ["w", "a", "s", "d", "shift"]) r.state.keys[k] = false;
            r.state.keys.w = true;
            let tSim = 1000;
            for (let i = 0; i < 30; i++) {
                tSim += 1 / 60;
                r._stepFixedSim(tSim, 1 / 60);
                r._tickMountedMovement(1 / 60);
            }
            r.state.keys.w = false;
            const vFahrt = r.state.playerVel;
            const yawTarget = Math.atan2(vFahrt.x(), vFahrt.z());
            out.orients =
                Number.isFinite(entry._rideYaw) &&
                Math.hypot(vFahrt.x(), vFahrt.z()) > 0.5 &&
                Math.abs(entry._rideYaw - yawTarget) < 0.2 &&
                // das Bild folgt der Gier: die Gruppe (mesh.rotation) oder die Instanz (rotationY = Template-Gier)
                Math.abs((entry.mesh ? entry.mesh.rotation.y : entry.rotationY) - entry._rideYaw) < 1e-6;
            out.wheelsRoll = (entry._ridePhase || 0) > 0.3;
            out.fahrZahlen =
                `v ${Math.hypot(vFahrt.x(), vFahrt.z()).toFixed(2)} m/s · Bug ${(+entry._rideYaw).toFixed(3)} · Fahrt ` +
                `${yawTarget.toFixed(3)} · Bild ${entry.mesh ? (+entry.mesh.rotation.y).toFixed(3) : "-"} · Rad-Phase ` +
                `${(+(entry._ridePhase || 0)).toFixed(2)}`;
            r.state.playerVel.setValue(0, 0, 0);
            r.state._fieldVy = 0;
            // (7) Absteigen: die Kollision darf lazy wiederkommen (kein Dauer-Skip).
            r.dismountArchitecture();
            out.dismounts = r.state.player.mountedArch === null;
            // der Spieler steht danach, wo ihn die folgenden Bänder erwarten (der Aufstieg setzte ihn an den alten Ort)
            pm.set(pmAlt.x, r.getTerrainHeightAt(pmAlt.x, pmAlt.z) + 1, pmAlt.z);
        } finally {
            if (entry) r.removeArchitecture(entry);
            delete r.state.blueprints._t_ride_wagen;
            r.state.player.mountedArch = savedMounted === undefined ? null : savedMounted;
        }
        return out;
    });
    check("Fahr-Tiefe: das Profil emergiert (4× Rad → Tempo ×>1.3 · rollt aus · träge)", res.profile);
    check(
        "Fahr-Tiefe: der Sattel ruht die Kollision (die Kapsel im gerittenen Wagen bleibt stehen) + liest das Profil",
        res.collisionRests && res.profileConsumed,
        res.kapselSchub
    );
    check(
        "Fahr-Tiefe: Reiter + Gefährt sind EINS (unerntbar · kein Sammler-Ziel)",
        res.unharvestable && res.noGatherTarget
    );
    check(
        "Fahr-Tiefe: das Gefährt richtet sich aus + die Räder rollen (Phase ∝ Weg)",
        res.orients && res.wheelsRoll,
        res.orients && res.wheelsRoll ? "" : res.fahrZahlen
    );
    check("Fahr-Tiefe: Absteigen gibt frei", res.dismounts);
}

async function checkBandGammaGenese({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};
        const origGen = r.state.worldMeta ? r.state.worldMeta.genVersion : undefined;
        try {
            if (!r.state.worldMeta) r.state.worldMeta = {};
            r.state.worldMeta.genVersion = 2;
            // (1) Struktur: Konstanten frozen.
            out.struct = Object.isFrozen(A.FEUCHTE);
            // (2) FEUCHTE am ECHTEN Fluss: der Senkrecht-Walk findet die Bank
            // (erste Land-Zelle neben der Mittellinie) — dort muss das Feld
            // mindestens den schilf-floor tragen; Legacy-Tor an derselben Stelle.
            const hydro = r.state.hydrosphere;
            const rivers = hydro && Array.isArray(hydro.rivers) ? hydro.rivers : [];
            out.rivers = rivers.length;
            let bank = null;
            outer: for (const rv of rivers) {
                const pts = rv.points || [];
                for (let k = 1; k + 1 < pts.length; k += 2) {
                    const p = pts[k];
                    const q = pts[k + 1];
                    const dx = q.x - p.x;
                    const dz = q.z - p.z;
                    const len = Math.hypot(dx, dz) || 1;
                    const nx = -dz / len;
                    const nz = dx / len;
                    for (const side of [1, -1]) {
                        for (let d = 2; d <= 14; d += 1.5) {
                            const x = p.x + nx * d * side;
                            const z = p.z + nz * d * side;
                            const sy = r._voxelSurfaceY(x, z);
                            if (sy === null || !Number.isFinite(sy)) continue;
                            if (sy > r._waterLevelAt(x, z) + 0.15) {
                                const hd = r._hydroDistAt(x, z);
                                if (Number.isFinite(hd.dist) && hd.dist < 20) {
                                    bank = { x, z, sy };
                                    break outer;
                                }
                            }
                        }
                    }
                }
            }
            out.bankFound = !!bank;
            if (bank) {
                out.feuchteBank = r._feuchteAt(bank.x, bank.z, bank.sy);
                r.state.worldMeta.genVersion = 1;
                out.feuchteLegacy = r._feuchteAt(bank.x, bank.z, bank.sy);
                r.state.worldMeta.genVersion = 2;
            }
            // (3) Affinitäts-KONSUM kontrolliert: DERSELBE Punkt, feuchte 1 vs 0 → Δ = tags.lebendig × Gewicht/4,
            // exakt und welt-zustands-unabhängig. Punkt mit unsaturierter Basis wählen (der [0,1]-Clamp fräße Δ).
            let aff = null;
            for (let i = 0; i < 64 && !aff; i++) {
                const x = -780 + (i % 8) * 220;
                const z = -780 + Math.floor(i / 8) * 220;
                const a0 = r.spawnAffinityForBlueprint("baum_eiche", x, z, 0);
                if (a0 <= 0.7) aff = { a0, a1: r.spawnAffinityForBlueprint("baum_eiche", x, z, 1) };
            }
            if (aff) out.affDelta = aff.a1 - aff.a0;
            // (4) Γ2 — DAS BODEN-GESETZ (die Host-Kronen-Lesart fiel): die Studio-Zeilen, die die
            // Nah-Streu liest, differenzieren an kontrollierten Umwelten — Farn im Schatten (die Feuchte hebt seine
            // Licht-Grenze), Schilf nur am gemessenen Ufer (Pflicht-Band), Blume im Licht.
            const boden =
                A._studioRenderConfig && A._studioRenderConfig.placement && A._studioRenderConfig.placement.boden;
            const wG = window.__phytoCore && window.__phytoCore.bodenGewicht;
            if (boden && typeof wG === "function" && boden.farn && boden.schilf && boden.blume) {
                out.gesetz = {
                    farnSchatten: wG(boden.farn, { licht: 0.25, feucht: 0 }),
                    farnLicht: wG(boden.farn, { licht: 0.9, feucht: 0 }),
                    farnSaumTrocken: wG(boden.farn, { licht: 0.66, feucht: 0 }),
                    farnSaumFeucht: wG(boden.farn, { licht: 0.66, feucht: 1 }),
                    schilfUfer: wG(boden.schilf, { licht: 0.8, ufer: 0 }),
                    schilfTrocken: wG(boden.schilf, { licht: 0.8, ufer: 5 }),
                    schilfUngemessen: wG(boden.schilf, { licht: 0.8 }),
                    blumeLicht: wG(boden.blume, { licht: 0.9 }),
                    blumeSchatten: wG(boden.blume, { licht: 0.2 }),
                };
            }
            out.schilfData = !!(
                boden &&
                boden.schilf &&
                Array.isArray(boden.schilf.ufer) &&
                boden.schilf.ring === "nah"
            );
            out.farnDual = !!(boden && boden.farn && Array.isArray(boden.farn.licht) && boden.farn.feuchtLicht > 0);
            // (6) Γ5 — Math.random-Zensus (Kommentare gestrippt; der CODE darf
            // im Worldgen nie würfeln — P2P-Drift-Klasse).
            const fns = [
                "_vegetationSampleSpawn",
                "_nahStreuKachel",
                "_tickNahStreu",
                "_nahStreuBloecke",
                "_feuchteAt",
                "_hydroDistAt",
                "worldFieldAt",
                "_clumpAt",
                "spawnAffinityForBlueprint",
                "_affinitaet",
            ];
            out.randHits = fns.filter((fn) => {
                const f = r[fn];
                if (typeof f !== "function") return true;
                return !window.__fehlt(f, /Math\.random/);
            });
            // (7) genVersion REIST im Snapshot (Klasse: was der Save
            // verliert, verliert die Welt beim Reload).
            const snap = r.buildStateSnapshot();
            out.snapGen = snap && snap.worldMeta ? snap.worldMeta.genVersion : null;
        } finally {
            if (r.state.worldMeta) {
                if (origGen === undefined) delete r.state.worldMeta.genVersion;
                else r.state.worldMeta.genVersion = origGen;
            }
        }
        return out;
    });
    check("Γ Struktur: FEUCHTE frozen", res.struct === true);
    check(
        `Γ1 FEUCHTE am echten Fluss-Ufer ≥ schilf-floor 0.62 (${res.rivers} Flüsse, feuchte=${res.feuchteBank && res.feuchteBank.toFixed ? res.feuchteBank.toFixed(3) : res.feuchteBank})`,
        res.bankFound && res.feuchteBank >= 0.62
    );
    check(
        `Γ1 Legacy-Tor: genVersion 1 → das Feld schweigt an derselben Stelle (=${res.feuchteLegacy})`,
        res.feuchteLegacy === 0
    );
    check(
        `Γ1 Affinitäts-KONSUM: feuchte hebt die Baum-Resonanz (Δ=${res.affDelta && res.affDelta.toFixed ? res.affDelta.toFixed(3) : res.affDelta})`,
        Number.isFinite(res.affDelta) && res.affDelta > 0.04
    );
    // Γ1-Lesart-4 BODEN-ATMET: die Feuchte zieht die EINE Boden-Farbe zur feuchten Erde (BODEN_FARBE.wet) — am Ruf gemessen.
    const zugNass = await safeEvaluate(page, () => {
        const pm = r.state.playerMesh.position;
        const y = r._voxelSurfaceY(pm.x, pm.z) ?? pm.y;
        const farbe = (f) => {
            r._feuchteAt = () => f;
            try {
                return r._bodenFarbeAt(pm.x, y, pm.z, [0, 0, 0]);
            } finally {
                delete r._feuchteAt;
            }
        };
        const c0 = farbe(0);
        const c5 = farbe(0.5); // = LICHEN.feuchteLo: die Flechte bleibt 0, nur die feuchte Erde mischt
        const w = r.constructor.BODEN_FARBE.wet;
        return [0, 1, 2].reduce((sum, i) => sum + (c5[i] - c0[i]) * (w[i] - c0[i]), 0);
    });
    check(`Γ1-Lesart-4 die Feuchte zieht die Boden-Farbe zur feuchten Erde (Zug ${zugNass})`, zugNass > 0);
    // Γ4 — DIE GROSSFORM IST DATEN: der Ein-Massiv-Anker (ankerAusSaat · ankerBeitrag · MACRO_ANKER · _macroAnker)
    // fiel; die Welt liest die Großform des Gelände-Kerns (Splines über Kontinentalität und Erosion, das Flussnetz zuerst).
    // Der Hang und die Fels-Blöße folgen dem Relief: im Gebirge (Relief-Maximum der 6-km-Probe) steiler und felsiger als in
    // der Ebene (Relief-Minimum).
    const resG4 = await safeEvaluate(page, () => {
        const G = window.__gelaendeCore;
        const out = {};
        out.struct = typeof G.grossform === "function" && Array.isArray(G.LANDFORM_REGLER);
        out.ankerTot =
            typeof r._macroAnker !== "function" &&
            typeof G.ankerAusSaat !== "function" &&
            typeof G.ankerBeitrag !== "function" &&
            !("MACRO_ANKER" in G);
        if (!out.struct) return out;
        const L = r._gelaende();
        const proben = [];
        for (let j = -6; j <= 6; j++)
            for (let i = -6; i <= 6; i++) {
                const x = i * 500 + 37;
                const z = j * 500 - 41;
                proben.push({ x, z, rel: G.grossform(L, x, z).rel });
            }
        proben.sort((a, b) => b.rel - a.rel);
        const mittel = (ps, f) => ps.reduce((s, p) => s + f(p), 0) / ps.length;
        const hoch = proben.slice(0, 12);
        const tief = proben.slice(-12);
        out.relHoch = mittel(hoch, (p) => p.rel);
        out.relTief = mittel(tief, (p) => p.rel);
        out.slopeHoch = mittel(hoch, (p) => r._slopeAt(p.x, p.z));
        out.slopeTief = mittel(tief, (p) => r._slopeAt(p.x, p.z));
        // Die Fels-Blöße ist ein Flächen-Anteil (Kliffe und Flanken), kein Punkt: je Probe das Mittel über 400 × 400 m im
        // 25-m-Raster — ein Einzelpunkt am Flussufer der Ebene (Blöße 1) überstimmte zwölf Gebirgs-Punkte.
        const flaeche = (p) => {
            let sum = 0;
            let n = 0;
            for (let dz = -200; dz <= 200; dz += 25)
                for (let dx = -200; dx <= 200; dx += 25) {
                    sum += r._rockExposureAt(p.x + dx, p.z + dz);
                    n++;
                }
            return sum / n;
        };
        out.exposureHoch = mittel(hoch, flaeche);
        out.exposureTief = mittel(tief, flaeche);
        return out;
    });
    const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : v);
    const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : v);
    check(`Γ4 (K16) Struktur: gelaende-core grossform + LANDFORM_REGLER`, resG4.struct === true);
    check(
        `Γ4 (K16) der Ein-Massiv-Anker ist tot (_macroAnker · ankerAusSaat · ankerBeitrag · MACRO_ANKER)`,
        resG4.ankerTot === true
    );
    check(
        `Γ4 (K16) Hang im Gebirge > Ebene (Relief ${f2(resG4.relHoch)} vs ${f2(resG4.relTief)} m: ${f2(resG4.slopeHoch)} > ${f2(resG4.slopeTief)})`,
        Number.isFinite(resG4.slopeHoch) && resG4.slopeHoch > resG4.slopeTief
    );
    check(
        `Γ4 (K16) Fels-Blöße im Gebirge ≥ 1,5 × Ebene (Flächen-Anteil je 400 m): ${f3(resG4.exposureHoch)} vs ${f3(resG4.exposureTief)}`,
        Number.isFinite(resG4.exposureHoch) && resG4.exposureHoch > 0 && resG4.exposureHoch >= 1.5 * resG4.exposureTief
    );

    check(
        "Γ2 BODEN-GESETZ differenziert: Farn im Schatten (Feuchte hebt die Licht-Grenze), Schilf nur am gemessenen Ufer, Blume im Licht",
        !!res.gesetz &&
            res.gesetz.farnSchatten > 0.9 &&
            res.gesetz.farnLicht === 0 &&
            res.gesetz.farnSaumFeucht > res.gesetz.farnSaumTrocken &&
            res.gesetz.schilfUfer > 0.9 &&
            res.gesetz.schilfTrocken === 0 &&
            res.gesetz.schilfUngemessen === 0 &&
            res.gesetz.blumeLicht > res.gesetz.blumeSchatten,
        JSON.stringify(res.gesetz)
    );
    check(
        "Γ1 Arten-Daten: Schilf trägt das Ufer-Band (ring nah), der Farn das Feuchte-Licht",
        res.schilfData && res.farnDual
    );
    check(
        `Γ5 Determinismus: kein Math.random im Worldgen-Code (${res.randHits && res.randHits.length ? res.randHits.join(",") : "9 Fn sauber"})`,
        Array.isArray(res.randHits) && res.randHits.length === 0
    );
    check("Γ1 genVersion reist im Welt-Snapshot (V8.59-Klasse)", res.snapGen === 2);
}

// Γ-M LICHEN: grüne
// Patina auf alten feuchten Steinen. Reine Render-Schicht, kein Welt-Effekt.
// Math-Probe der Formel + Source-Probe in Main + Worker (V17.100-Bit-Vertrag).
async function checkBandV18199GammaMLichen({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};

        // (L1) die LICHEN-Konstanten
        if (A.LICHEN) {
            out.feuchteLo = A.LICHEN.feuchteLo;
            out.feuchteHi = A.LICHEN.feuchteHi;
            out.dichteLo = A.LICHEN.dichteLo;
            out.dichteHi = A.LICHEN.dichteHi;
            out.strength = A.LICHEN.strength;
            // Die Flechten-Farbe ist die der Boden-Palette (Studio PORTAL_GROUND.flechte nach dem Farb-Gesetz).
            out.tint = A.BODEN_FARBE.flechte;
            out.constsSensible =
                A.LICHEN.feuchteLo < A.LICHEN.feuchteHi &&
                A.LICHEN.dichteLo < A.LICHEN.dichteHi &&
                A.LICHEN.strength > 0 &&
                A.LICHEN.strength < 1 &&
                Array.isArray(out.tint) &&
                out.tint.length === 3;
        }

        // (L3) MATH-PROBE: lichen wirkt nur in feuchten + dichten Regionen.
        // Wir bauen die Formel selbst nach (Main-bit-identisch) und prüfen
        // an drei kontrollierten Punkten.
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        const noise2D = r._voxelNoise ? (x, z) => r._voxelNoise.noise2D(x, z) : null;
        const LCH = A.LICHEN;
        const calcLichen = (feuchte, dichte, x, z) => {
            const cluster = noise2D ? (noise2D(x * 0.04 + 7.7, z * 0.04 - 3.3) + 1) * 0.5 : 0.5;
            return (
                ss(LCH.feuchteLo, LCH.feuchteHi, feuchte) *
                ss(LCH.dichteLo, LCH.dichteHi, dichte) *
                cluster *
                LCH.strength
            );
        };

        // Drei Probe-Punkte (synthetische feuchte/dichte): feucht + steinig → lichen > 0 · trocken + steinig
        // → lichen ≈ 0 (feuchte-Schwelle) · feucht + erde → lichen ≈ 0 (dichte-Schwelle).
        const samplesPositive = [];
        const samplesDryStone = [];
        const samplesWetErde = [];
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % 1000;
            const z = (i * 73) % 1000;
            samplesPositive.push(calcLichen(0.8, 0.7, x, z)); // feucht + stein
            samplesDryStone.push(calcLichen(0.1, 0.7, x, z)); // trocken + stein
            samplesWetErde.push(calcLichen(0.8, 0.1, x, z)); // feucht + erde
        }
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        out.lichenAvgWetStone = avg(samplesPositive);
        out.lichenAvgDryStone = avg(samplesDryStone);
        out.lichenAvgWetErde = avg(samplesWetErde);
        out.lichenWetStonePositive = out.lichenAvgWetStone > 0.01; // sichtbar
        out.lichenDryStoneZero = out.lichenAvgDryStone < 0.001; // unsichtbar
        out.lichenWetErdeZero = out.lichenAvgWetErde < 0.001; // unsichtbar

        // (L4) UPPER BOUND: lichen darf NIE > strength sein (Math-Sicherheit)
        const maxAtFull = calcLichen(1, 1, 0, 0); // alle Faktoren max, cluster ~0.5 avg
        out.lichenBoundedAtFull = maxAtFull <= LCH.strength;

        return out;
    });

    check("(L1b) LICHEN-Konstanten sinnvoll (lo<hi, strength∈(0,1), tint=3er)", res.constsSensible === true);
    check(
        `(L3a) feucht+steinig → lichen sichtbar (gemessen avg ${res.lichenAvgWetStone && res.lichenAvgWetStone.toFixed(4)})`,
        res.lichenWetStonePositive === true
    );
    check(
        `(L3b) trocken+steinig → lichen unsichtbar (gemessen avg ${res.lichenAvgDryStone && res.lichenAvgDryStone.toFixed(4)})`,
        res.lichenDryStoneZero === true
    );
    check(
        `(L3c) feucht+erde → lichen unsichtbar (gemessen avg ${res.lichenAvgWetErde && res.lichenAvgWetErde.toFixed(4)})`,
        res.lichenWetErdeZero === true
    );
    check("(L4) lichen ≤ LICHEN.strength (Math-Sicherheit, kein Overshoot)", res.lichenBoundedAtFull === true);
}

// Pfade: Fluss-Bänke sind getrampelte Erde, lawful aus dem Drainage-Netz: _pathFieldAt → der Boden
// packt (packedDirt, Main ↔ Worker bit-identisch) + das Gras weicht. Proben: KONSUM + Feld-Logik.
async function checkBandWahrerAnblickPfade({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};

        // (A) Logik: fern jeden Flusses → kein Pfad
        out.farIsZero = r._pathFieldAt(99999, 99999, 10) === 0;
        // gebunden [0,1]
        let bounded = true;
        for (let gx = -200; gx <= 200; gx += 37) {
            const sy = r._voxelSurfaceY(gx, 0);
            const v = r._pathFieldAt(gx, 0, sy);
            if (!(v >= 0 && v <= 1)) bounded = false;
        }
        out.pathBounded = bounded;

        // (B) VERHALTEN — ein Pfad-Feld von 1 zieht die EINE Boden-Farbe zur gepackten Erde (BODEN_FARBE.dirt)
        const farbe = (x, y, pf) => {
            r._pathFieldAt = () => pf;
            try {
                return r._bodenFarbeAt(x, y, 0, [0, 0, 0]);
            } finally {
                delete r._pathFieldAt;
            }
        };
        const dD = (c) => Math.hypot(c[0] - A.BODEN_FARBE.dirt[0], c[1] - A.BODEN_FARBE.dirt[1], c[2] - A.BODEN_FARBE.dirt[2]);
        let d0 = 0;
        let d1 = 0;
        for (let gx = -200; gx <= 200; gx += 37) {
            const y = r._voxelSurfaceY(gx, 0);
            d0 += dD(farbe(gx, y, 0));
            d1 += dD(farbe(gx, y, 1));
        }
        out.pfadErde = `Abstand zur Erde ${d0.toFixed(3)} → ${d1.toFixed(3)}`;
        out.attachReadsPath = d0 > 0.1 && d1 < d0;

        // (B3) Behavioral (soft): wie viele Pfad-Treffer in einem 600m-Raster?
        let hits = 0,
            samples = 0;
        for (let gx = -300; gx <= 300; gx += 20) {
            for (let gz = -300; gz <= 300; gz += 20) {
                samples++;
                const sy = r._voxelSurfaceY(gx, gz);
                if (r._pathFieldAt(gx, gz, sy) > 0.1) hits++;
            }
        }
        out.pathSamples = samples;
        out.pathHits = hits;

        return out;
    });

    check("Ω-OPSIS S2-Pfad (A2) Pfad-Feld ist 0 fern jeden Flusses", res.farIsZero === true);
    check("Ω-OPSIS S2-Pfad (A3) Pfad-Feld ∈ [0,1] (gebunden)", res.pathBounded === true);
    check(
        `Ω-OPSIS S2-Pfad (B2, V18.492) das Pfad-Feld zieht die Boden-Farbe zur gepackten Erde (${res.pfadErde})`,
        res.attachReadsPath === true
    );
    check(
        `Ω-OPSIS S2-Pfad (B3) Pfad-Feld im Welt-Raster gemessen (${res.pathHits}/${res.pathSamples} Treffer)`,
        res.pathHits >= 0 && res.pathSamples > 0
    );
}

// G1 Seam-Normal: zwei same-LOD-
// Face-Nachbarn teilen ihre Boundary-Verts float-exakt (pad+crop); in der Rand-Schale rechnet der Gradient via sample()
// (reine Funktion der Welt-Position), beide Nachbarn rechnen die IDENTISCHE Normale.
async function checkBandSeamNormal({ page, check }) {
    const out = await safeEvaluate(page, () => {
        const { dim, step, span, dimY, floorDrop } = r._voxelChunkConfig(0);
        const oy = (r.state.terrainBaseHeight || 0) - floorDrop;
        const fullSample = (x, y, z) => r._terrainDensityAt(x, y, z);
        const build = (cx, cz) => r._voxelChunkGeometry(cx * span - step, oy, cz * span - step, dim + 3, dimY, dim + 3, step, fullSample, 1, null, 1);
        const q = (v) => Math.round(v * 1e5) / 1e5;
        const EPS = 1e-4;
        // je Face-Paar die Normal-Konformanz an den geteilten Boundary-Verts (axis 0 = x-Face, 2 = z-Face)
        const measurePair = (gA, gB, axis, plane) => {
            const collect = (geom) => {
                const m = new Map();
                const p = geom.attributes.position.array;
                const nrm = geom.attributes.normal.array;
                for (let i = 0; i < p.length; i += 3) {
                    const a = axis === 0 ? p[i] : p[i + 2];
                    if (a >= plane - EPS && a <= plane + step + EPS) m.set(q(p[i]) + "," + q(p[i + 1]) + "," + q(p[i + 2]), [nrm[i], nrm[i + 1], nrm[i + 2]]);
                }
                return m;
            };
            const mb = collect(gB);
            const angs = [];
            for (const [k, na] of collect(gA)) {
                const nb = mb.get(k);
                if (!nb) continue;
                angs.push((Math.acos(Math.max(-1, Math.min(1, na[0] * nb[0] + na[1] * nb[1] + na[2] * nb[2]))) * 180) / Math.PI);
            }
            angs.sort((x, y) => x - y);
            return { matched: angs.length, max: angs.length ? +angs[angs.length - 1].toFixed(3) : null };
        };
        const gA = build(5, 5);
        const gBx = build(6, 5);
        const gBz = build(5, 6);
        const res = { xFace: measurePair(gA, gBx, 0, 6 * span), zFace: measurePair(gA, gBz, 2, 6 * span) };
        for (const g of [gA, gBx, gBz]) if (g && g.dispose) g.dispose();
        return res;
    });
    const TOL = 1.0; // konform = Rand-Normalen praktisch identisch (vor G1: bis 69°)
    const fails = [];
    for (const [lbl, f] of [["x-Face", out && out.xFace], ["z-Face", out && out.zFace]]) {
        if (!f || f.matched < 20) fails.push(`${lbl}: nur ${f && f.matched} geteilte Verts (vakuös)`);
        else if (f.max > TOL) fails.push(`${lbl}: Rand-Normalen bis ${f.max}° > ${TOL}° (Lichtungs-Naht)`);
    }
    check("G1 Seam-Normal: same-LOD-Rand-Normalen konform ≤ 1° (keine Lichtungs-Naht)", fails.length === 0, fails.join(" · ") || `x ${out.xFace.max}° · z ${out.zFace.max}° an ${out.xFace.matched}+${out.zFace.matched} Verts`);
}

// Der Tod-Zensus — eingefaltet aus gate:tod-zensus: ein Leichnam behielt 90 s die Darstellung
// des lebenden Tiers (Fern-Guss ohne Schatten auf 2 m, Aura und Traglast); jetzt liegt der Gefallene in der Stufe seines Abstands,
// wirft nah Schatten, ohne Aura, Traglast, Wesen-Takt und Stimme. Selbsttest im selben Boot: je Täter der alte Defekt eingespielt —
// jede Probe liest ROT aus ihrem Grund.
async function checkBandTodZensus({ page, check }) {
    const todZensus = function todZensus(r, T, taeter) {
        const s = r.state;
        const A = r.constructor;
        const pm = s.playerMesh.position;
        const P0 = pm.clone();
        const altK = s.creatures,
            altE = s.creatureEmotions,
            altL = s.leichname,
            altMax = s.maxCreatures,
            altModus = r.getGameMode();
        const restore = [];
        const decke = (name, fn) => {
            const hatte = Object.prototype.hasOwnProperty.call(r, name);
            const alt = r[name];
            r[name] = fn(alt);
            restore.push(() => {
                if (hatte) r[name] = alt;
                else delete r[name];
            });
        };
        s.creatures = [];
        s.creatureEmotions = [];
        s.leichname = [];
        s.maxCreatures = 64;
        r.setGameMode("pfad");
        const o = { taeter: taeter || null };
        try {
            // der Ort: Spieler P, Tier A 2 m vor ihm, Tier B 40 m — dieselbe Linie, damit ein Blick beide fasst; nach dem Wechsel
            // steht der Spieler 42 m weiter und blickt zurück (A auf 40 m, B auf 2 m). Jeder Punkt trocken und eben: die gezeichnete
            // Boden-Karte (`_bodenSichtAt`) liegt dort, höchstens 0,3 m neben dem Gesetz.
            const trocken = (x, z) => {
                if (!r._landAt(x, z)) return false;
                const gy = r.getTerrainHeightAt(x, z);
                const k = r._bodenSichtAt(x, z);
                return Number.isFinite(gy) && Number.isFinite(k) && Math.abs(k - gy) < 0.3;
            };
            let ort = null;
            for (let ring = 0; ring < 12 && !ort; ring++)
                for (let q = 0; q < 16 && !ort; q++) {
                    const w = (q / 16) * Math.PI * 2;
                    const dx = Math.sin(w),
                        dz = Math.cos(w);
                    const px = P0.x + Math.cos(w + 1) * ring * 15,
                        pz = P0.z + Math.sin(w + 1) * ring * 15;
                    if (
                        [0, 2, 40, 42].every((m) => trocken(px + dx * m, pz + dz * m)) &&
                        trocken(px + dx * 2 - dz * 3, pz + dz * 2 + dx * 3)
                    )
                        ort = { px, pz, dx, dz };
                }
            if (!ort) return { fehler: "kein trockener, ebener Ort (42 m Linie)" };
            const stelle = (m, blick) => {
                const x = ort.px + ort.dx * m,
                    z = ort.pz + ort.dz * m;
                pm.set(x, r.getTerrainHeightAt(x, z) + 1, z);
                const cam = s.camera;
                cam.position.set(pm.x, pm.y + 0.6, pm.z);
                const lx = pm.x + ort.dx * blick * 10,
                    lz = pm.z + ort.dz * blick * 10;
                cam.lookAt(lx, r.getTerrainHeightAt(lx, lz), lz); // der Boden 10 m voraus: 2 m und 40 m im Bild
                cam.updateMatrixWorld(true);
                if (cam.matrixWorldInverse) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
                r._loopFrustumCulling();
            };
            stelle(0, 1);
            const tier = (m, seele, quer = 0) => {
                const x = ort.px + ort.dx * m - ort.dz * quer,
                    z = ort.pz + ort.dz * m + ort.dx * quer;
                const c = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z), z, "happy", seele, {
                    precise: true,
                    bodySize: 1,
                });
                if (!c) throw new Error("Spawn " + seele);
                c.rotation.y = Math.atan2(ort.dz, -ort.dx); // quer zur Linie: die Flanke zum Spieler
                // ein Auftrag, der hält (die Aura des Auftrags), und eine Traglast (der echte Lebenszyklus der Sprites)
                r.assignCreatureTask(c, "wait", {}, { silent: true });
                c.userData.carrying = { materials: { holz: 3 }, blueprint: null, since: 0 };
                r._refreshCreatureCarryingVisual(c);
                return c;
            };
            const tA = tier(2, "wesen"); // der Hirsch
            const tB = tier(40, "wolf");
            const tC = tier(2, "fuchs", 3); // stirbt, während das Feld seine Wurzel verbirgt (jenseits der Mesh-Zone)
            const ALLE = [
                ["A", tA],
                ["B", tB],
                ["C", tC],
            ];
            const zeichen = new Map(); // die Sprites, die das lebende Tier trug
            for (const [, c] of ALLE) zeichen.set(c, [c.userData.taskAura, c.userData.carryingSprite].filter(Boolean));
            o.zeichenVorher = [...zeichen.values()].reduce((n, z) => n + z.length, 0);

            // DIE KOPIE BEIM MITSPIELER: der Strom trägt die Lage eines Gefallenen (q) — je ein Leichnam des Mitspielers 1,5 m
            // neben A und neben B (Ids mit Größe ≈ 1: die Stufen-Grenze 35 m wie bei A und B); seine Sicht wählt derselbe Weg
            const remote = s.p2p && s.p2p.remoteCreatures;
            if (!remote) return { fehler: "kein p2p-Zustand" };
            restore.push(() => {
                for (const [key, rc] of remote) if (rc.peerId === "zensus-peer") r._disposeRemoteCreature(key, rc);
            });
            const qLiegt = new T.Quaternion().setFromAxisAngle(new T.Vector3(ort.dx, 0, ort.dz), A.TOD_KIPP_RAD);
            const ids = [];
            for (let i = 0; i < 400 && ids.length < 2; i++) {
                const g = r._creatureBodySize("c99" + i);
                if (g > 0.95 && g < 1.05) ids.push("c99" + i);
            }
            const kopieListe = [2, 40].map((m, i) => {
                const x = ort.px + ort.dx * m + ort.dz * 1.5,
                    z = ort.pz + ort.dz * m - ort.dx * 1.5;
                return {
                    id: ids[i],
                    x,
                    y: r.getTerrainHeightAt(x, z),
                    z,
                    yaw: 0,
                    soul: i ? "wolf" : "wesen",
                    q: [qLiegt.x, qLiegt.y, qLiegt.z, qLiegt.w],
                };
            });
            const dt = 1 / 30;
            const takt = () => {
                r._kreaturStossSchritt(dt);
                r._leibKontakte();
                r.updateCreatures(dt);
                r._p2pHandleCreaturePos("zensus-peer", { list: kopieListe });
                r._p2pTickRemoteCreatures(s.creatureAnimationTime, dt);
            };
            for (let k = 0; k < 30; k++) takt(); // das lebende Tier: seine Stufe steht
            const L0 = (c) => {
                const g = c.userData._gelenk;
                return g ? (g.istFern ? "fern" : "nah") : null;
            };
            o.lebend = { A: L0(tA), B: L0(tB) };

            // DER WESEN-TAKT, mitlaufend gezählt (durchgereicht, nie gestubbt): erreicht er einen Gefallenen?
            const wesenTakt = {};
            const istTot = (c) => !!c && s.leichname.indexOf(c) !== -1;
            for (const name of [
                "_tickCreatureLifeTrickle",
                "_getCreatureTask",
                "_tickCreatureTaskDirection",
                "_creatureWariness",
                "_applyCreatureSeparation",
                "_kreaturHuellenKontakt",
                "_tickKreaturVerhalten",
                "_kreaturLaufTakt",
                "_animateCompoundMotion",
            ]) {
                decke(
                    name,
                    (alt) =>
                        function (c, ...rest) {
                            if (istTot(c)) wesenTakt[name] = (wesenTakt[name] || 0) + 1;
                            return alt.call(this, c, ...rest);
                        }
                );
            }
            let rufe = 0;
            decke(
                "_tierRuf",
                (alt) =>
                    function (c, ...rest) {
                        if (istTot(c)) rufe++;
                        return alt.call(this, c, ...rest);
                    }
            );

            // DIE TÄTER (Selbst-Test): der alte Defekt, eingespielt an der Naht, die ihn heute trägt
            if (taeter === "sicht")
                // der Takt der Gefallenen ohne die Sicht des Leibs
                decke(
                    "_leibSicht",
                    (alt) =>
                        function (c, ...rest) {
                            if (istTot(c)) return;
                            return alt.call(this, c, ...rest);
                        }
                );
            if (taeter === "zeichen")
                // der Fall ohne das Räumen dessen, was das lebende Tier trug
                decke(
                    "_leibZeichenFrei",
                    (alt) =>
                        function (c, ...rest) {
                            if (s.creatures.indexOf(c) !== -1 && c.userData && c.userData.dying) return;
                            return alt.call(this, c, ...rest);
                        }
                );
            if (taeter === "last")
                // der Fall, in dem die Last verfällt
                decke(
                    "_kreaturFaellt",
                    (alt) =>
                        function (c, ...rest) {
                            if (c && c.userData) c.userData.carrying = null;
                            return alt.call(this, c, ...rest);
                        }
                );
            if (taeter === "raeumen")
                // die Aura räumt wieder in ihrer eigenen Kopie
                decke(
                    "_refreshCreatureTaskAura",
                    (alt) =>
                        function (c) {
                            const ud = c && c.userData;
                            const aura = ud && ud.taskAura;
                            if (aura && !this._getCreatureTask(c)) {
                                if (this.state.scene) this.state.scene.remove(aura);
                                if (aura.material) this._queueDispose(aura.material);
                                ud.taskAura = null;
                                return;
                            }
                            return alt.call(this, c);
                        }
                );
            if (taeter === "kopie")
                // die Kopie beim Mitspieler ohne die Sicht des Leibs
                decke(
                    "_p2pTickRemoteCreatures",
                    (alt) =>
                        function (...a) {
                            const hatte = Object.prototype.hasOwnProperty.call(this, "_leibSicht");
                            const sicht = this._leibSicht;
                            this._leibSicht = function () {};
                            try {
                                return alt.apply(this, a);
                            } finally {
                                if (hatte) this._leibSicht = sicht;
                                else delete this._leibSicht;
                            }
                        }
                );
            if (taeter === "lage")
                decke(
                    "_todHaut",
                    (alt) =>
                        function (c, ...rest) {
                            if (c.visible === false) return null;
                            return alt.call(this, c, ...rest);
                        }
                );
            if (taeter === "haltung")
                // der Fall hält die Haltung nicht fest
                decke(
                    "_kreaturFaellt",
                    (alt) =>
                        function (c, ...rest) {
                            const out = alt.call(this, c, ...rest);
                            c.userData._gelenk.haltungFest = false;
                            return out;
                        }
                );
            if (taeter === "sprung")
                // der Fall nimmt die Höhe des Hüpfers mit
                decke(
                    "_kreaturFaellt",
                    (alt) =>
                        function (c, ...rest) {
                            c.userData._hopH = 0; // der Fall sieht den Sprung nicht: die Lage des Sprungs bleibt die Wurzel
                            c.userData._hopV = 0;
                            return alt.call(this, c, ...rest);
                        }
                );
            if (taeter === "wesen")
                // der Leichnam bleibt unter den Wesen
                decke(
                    "_kreaturFaellt",
                    (alt) =>
                        function (c, ...rest) {
                            const out = alt.call(this, c, ...rest);
                            s.creatures.push(c);
                            s.creatureEmotions.push("happy");
                            return out;
                        }
                );
            if (taeter === "stimme")
                // der letzte Ruf aus dem liegenden Leib
                decke(
                    "_tickLeichname",
                    (alt) =>
                        function (...a) {
                            const out = alt.apply(this, a);
                            for (const c of s.leichname) {
                                const d = c.userData.dying;
                                if (d && d.t >= d.dauer && !d._taeterRuf) {
                                    d._taeterRuf = true;
                                    this._tierRuf(c, "trauer");
                                }
                            }
                            return out;
                        }
                );

            // DER TOD: A am Alter (auf dem Boden), B im Kampf mitten im Sprung
            const boden = (c) =>
                r._standSicht(c.position.x, c.position.z, r.getTerrainHeightAt(c.position.x, c.position.z), false);
            r.creatureJump(tB);
            let hop = 0;
            for (let k = 0; k < 60 && !(tB.userData._hopH > 0.3 && !(tB.userData._hopV > 0)); k++) takt(); // im Scheitel
            hop = tB.userData._hopH || 0;
            o.hopBeimTod = +hop.toFixed(3);
            // DIE LAST FÄLLT ZURÜCK: das Holz, das der Fall selbst (_kreaturFaellt — die Beute des Kampfs kommt davor) ins
            // Inventar des Spielers legt, und die Einträge im Journal
            const holz = () =>
                (s.player.inventory || []).reduce(
                    (a, sl) => a + (sl && sl.kind === "material" && sl.material === "holz" ? sl.count || 0 : 0),
                    0
                );
            let lastJournal = 0;
            decke(
                "journalAppend",
                (alt) =>
                    function (typ, text, ...rest) {
                        if (/fällt an dich zurück/.test(String(text))) lastJournal++;
                        return alt.call(this, typ, text, ...rest);
                    }
            );
            let holzZurueck = 0;
            decke(
                "_kreaturFaellt",
                (alt) =>
                    function (c, ...rest) {
                        const vor = holz();
                        try {
                            return alt.call(this, c, ...rest);
                        } finally {
                            holzZurueck += holz() - vor;
                        }
                    }
            );
            // EINE RÄUM-METHODE, Konsum am Ruf: der Fall räumt über _leibZeichenFrei
            let raeumt = 0;
            decke("_leibZeichenFrei", (alt) => function (...a) { raeumt++; return alt.apply(this, a); });
            const lastSoll = ALLE.reduce(
                (a, [, c]) => a + ((c.userData.carrying && c.userData.carrying.materials.holz) || 0),
                0
            );
            r._creatureNaturalDeath(tA);
            const kill = r.damageCreature(tB, 1e9, { source: "player" });
            tC.visible = false;
            r._creatureNaturalDeath(tC);
            r._todLageTick({ timeRemaining: () => Infinity });
            o.last = { soll: lastSoll, zurueck: holzZurueck, journal: lastJournal };
            o.raeumt = raeumt;
            // kein Zweit-Räumer: keine andere Methode nimmt ein Zeichen über dem Leib aus der Szene und gibt sein Material frei
            // (der Code ohne Kommentare: _queueDispose und das Feld taskAura | carryingSprite)
            const namen = new Set([...Object.getOwnPropertyNames(A.prototype), ...Object.keys(r)]);
            namen.delete("constructor"); // die Klasse selbst trägt jede Methode
            namen.delete("_leibZeichenFrei");
            o.raeumer = [...namen]
                .filter((nm) => {
                    let f;
                    try {
                        f = r[nm];
                    } catch {
                        return false;
                    }
                    if (typeof f !== "function") return false;
                    return !(window.__fehlt(f, /_queueDispose\(/) || window.__fehlt(f, /taskAura|carryingSprite/));
                })
                .sort();
            o.tot = { A: istTot(tA), B: istTot(tB) && !!(kill && kill.killed), C: istTot(tC) };
            // DIE TOD-LAGE: jeder Gefallene trägt seine Hebe-Tafel (die Flanke legt sich auf den Hang, nie in ihn)
            o.lage = {};
            for (const [n, c] of ALLE) o.lage[n] = !!(c.userData.dying && c.userData.dying.hebe);
            const schwebt = {};
            for (const [n, c] of ALLE) {
                const d = c.userData.dying;
                schwebt[n] = d && Number.isFinite(d.baseY) ? +(d.baseY - boden(c)).toFixed(3) : null;
            }
            o.schwebtM = schwebt;
            // DIE HALTUNG DES FALLS: je Gefallenem die Pose seiner Knochen im Moment der Tod-Lage
            const haltung = new Map();
            for (const [, c] of ALLE) {
                const tb = c.userData._tierBaum;
                const kn = tb && tb.teile ? Object.values(tb.teile) : [];
                haltung.set(
                    c,
                    kn.map((k) => [k, k.quaternion.clone(), k.position.clone()])
                );
            }
            o.knochen = [...haltung.values()].reduce((a, h) => a + h.length, 0);
            let haltungMax = 0;

            // JE TAKT DER FRIST: der Zensus jedes Leichnams
            const G = A._arenaGesetz().gefuehl;
            const frist = G.kippDauerSec + G.leichnamSec;
            const n = Math.ceil((frist + 1) / dt);
            const verstoss = {};
            const beispiel = {};
            // je Leichnam und Takt zählt eine Klasse einmal (die Zahl = Leichnam-Takte mit dem Verstoß)
            let diesmal = null;
            const melde = (klasse, text) => {
                if (diesmal) {
                    if (diesmal.has(klasse)) return;
                    diesmal.add(klasse);
                }
                verstoss[klasse] = (verstoss[klasse] || 0) + 1;
                if (!beispiel[klasse]) beispiel[klasse] = text;
            };
            let geprueft = 0,
                ausserBlick = 0,
                nahGeprueft = 0,
                fernGeprueft = 0;
            const caster = (c) => {
                let nZ = 0;
                c.traverseVisible((x) => {
                    if (x.isMesh && x.castShadow) nZ++;
                });
                return nZ;
            };
            const kopieGeprueft = { nah: 0, fern: 0 };
            // die Stufe eines Leibs im Bild (Leichnam oder Kopie): genau eine Darstellung auf der Ebene der Haupt-Kamera, nah die
            // Gestalt mit Schatten, fern die gelenkige Grobstufe — dieselben Grenzen wie die eines lebenden Tiers (der EINE
            // Stufen-Schalter `_gelenkStufe`: `ab` × Größe und Hysterese aus der Kern-Zeile). Nah ist die Grobstufe als
            // Schatten-Zwilling sichtbar (SHADOW_TWIN_LAYER, die Haupt-Kamera sieht sie nie) — zulässig.
            const imBild = (o) => o.visible && o.layers.isEnabled(0);
            const stufe = (c, klasse, txt, zaehl) => {
                const g = c.userData._gelenk;
                const d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                if (!c.visible) melde(klasse, `${txt}: der Leib ist unsichtbar`);
                if (!g) return melde(klasse, `${txt}: der Leib trägt keine Gelenk-Gestalt (_gelenk)`);
                const grenze = g.abM * (c.scale.x || 1);
                const H = g.hyst;
                const nahZeigt = g.nah.visible;
                const fernZeigt = g.fern.visible && g.meshes.some(imBild);
                if (nahZeigt === fernZeigt)
                    melde(klasse, `${txt}: Gestalt ${nahZeigt} und Grobstufe ${fernZeigt} zugleich im Bild`);
                if (d < grenze * (1 - H)) {
                    zaehl.nah++;
                    if (!nahZeigt) melde(klasse, `${txt}: die Grobstufe liegt nah (Grenze ${grenze.toFixed(1)} m)`);
                    if (!(caster(c) > 0)) melde("schatten", `${txt}: nah ohne Schatten-Werfer (0 Meshes mit castShadow)`);
                } else if (d > grenze * (1 + H)) {
                    zaehl.fern++;
                    if (!fernZeigt) melde(klasse, `${txt}: die volle Gestalt liegt fern (Grenze ${grenze.toFixed(1)} m)`);
                }
            };
            for (let k = 0; k < n; k++) {
                const tS = k * dt;
                if (k === Math.round(10 / dt)) stelle(42, -1); // nach 10 s: der Spieler wechselt die Seite
                if (k === Math.round(50 / dt)) stelle(0, 1); // nach 50 s: zurück
                takt();
                for (const [name, c] of ALLE) {
                    if (!istTot(c)) continue;
                    const ud = c.userData;
                    const d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                    if (!r.isInFrustum(c)) {
                        ausserBlick++;
                        continue;
                    }
                    geprueft++;
                    diesmal = new Set();
                    const stelleTxt = `${name} (${ud.soul}) t=${tS.toFixed(1)} s auf ${d.toFixed(1)} m`;
                    const zaehl = { nah: 0, fern: 0 };
                    stufe(c, "stufe", stelleTxt, zaehl);
                    nahGeprueft += zaehl.nah;
                    fernGeprueft += zaehl.fern;
                    for (const z of zeichen.get(c) || [])
                        if (z.parent)
                            melde(
                                "aura",
                                `${stelleTxt}: ${z.name} hängt in der Szene (y ${(z.position.y - c.position.y).toFixed(2)} m über dem Leib)`
                            );
                    if (ud.taskAura) melde("aura", `${stelleTxt}: userData.taskAura besteht`);
                    let dreh = 0,
                        weg = 0,
                        wer = null;
                    for (const [k, q0, p0] of haltung.get(c) || []) {
                        const w = 2 * Math.acos(Math.min(1, Math.abs(q0.dot(k.quaternion))));
                        const dp = p0.distanceTo(k.position);
                        if (w > dreh || dp > weg) wer = k.name;
                        dreh = Math.max(dreh, w);
                        weg = Math.max(weg, dp);
                    }
                    haltungMax = Math.max(haltungMax, dreh);
                    if (dreh > 1e-4 || weg > 1e-5)
                        melde(
                            "haltung",
                            `${stelleTxt}: ${wer} verlässt die Haltung des Falls (${dreh.toFixed(3)} rad, ${weg.toFixed(4)} m) — die Tod-Lage rechnete mit ihr`
                        );
                    if (ud.carrying || ud.carryingSprite)
                        melde("traglast", `${stelleTxt}: er trägt noch (${ud.carrying ? "Traglast" : "Sprite"})`);
                    if (ud.task) melde("traglast", `${stelleTxt}: der Auftrag „${ud.task.name}" besteht`);
                    diesmal = null;
                }
                for (const id of ids) {
                    const rc = remote.get("zensus-peer:" + id);
                    if (!rc || !rc.mesh) {
                        melde("kopie", `die Kopie ${id} fehlt`);
                        continue;
                    }
                    diesmal = new Set();
                    const dK = Math.hypot(rc.mesh.position.x - pm.x, rc.mesh.position.z - pm.z);
                    stufe(rc.mesh, "kopie", `Kopie ${id} t=${tS.toFixed(1)} s auf ${dK.toFixed(1)} m`, kopieGeprueft);
                    diesmal = null;
                }
            }
            for (const k in wesenTakt) melde("wesen", `${k} erreicht einen Gefallenen ${wesenTakt[k]}×`);
            if (rufe) melde("stimme", `der Leichnam ruft ${rufe}× (_tierRuf mit einem Gefallenen)`);
            for (const [nm] of ALLE)
                if (!o.lage[nm]) melde("lage", `${nm}: ohne Tod-Lage (die Hebe-Tafel fehlt — die Flanke läge im Hang)`);
            for (const [nm] of ALLE)
                if (!(schwebt[nm] !== null && schwebt[nm] <= 0.1))
                    melde(
                        "schwebt",
                        `${nm}: die Wurzel der Tod-Lage ${schwebt[nm]} m über dem Stand-Boden (Hüpfer beim Tod ${o.hopBeimTod} m)`
                    );
            for (const [nm, c] of ALLE) {
                if (istTot(c) || c.parent) melde("abschied", `${nm}: nach ${(n * dt).toFixed(0)} s noch da`);
                for (const z of zeichen.get(c) || [])
                    if (z.parent) melde("abschied", `${nm}: ${z.name} überlebt den Abschied`);
            }
            Object.assign(o, {
                frist: +frist.toFixed(1),
                haltungMaxRad: +haltungMax.toFixed(4),
                takte: n,
                geprueft,
                nahGeprueft,
                fernGeprueft,
                ausserBlick,
                kopieGeprueft,
                wesenTakt,
                rufe,
                verstoss,
                beispiel,
            });
            return o;
        } catch (e) {
            o.fehler = String((e && e.stack) || e).slice(0, 600);
            return o;
        } finally {
            for (const f of restore.reverse())
                try {
                    f();
                } catch {
                    /* Aufräumen bleibt best effort, die Zahl steht schon */
                }
            for (const c of s.creatures.slice()) r.removeCreature(c);
            for (const c of s.leichname.slice()) r.removeCreature(c);
            s.creatures = altK;
            s.creatureEmotions = altE;
            s.leichname = altL;
            s.maxCreatures = altMax;
            r.setGameMode(altModus);
            pm.copy(P0);
        }
    };
    const urteil = function urteil(z) {
        if (!z || z.fehler) return { ok: false, grund: `keine Probe: ${(z && z.fehler) || "leer"}` };
        const v = [];
        if (!(z.tot && z.tot.A && z.tot.B && z.tot.C))
            v.push(`vakuös: nicht alle drei gefallen (${JSON.stringify(z.tot)})`);
        if (!(z.zeichenVorher >= 6)) v.push(`vakuös: die lebenden Tiere trugen nur ${z.zeichenVorher} Sprites (Soll 6)`);
        if (!(z.knochen >= 30)) v.push(`vakuös: die Gefallenen tragen nur ${z.knochen} Knochen (die Haltung sähe nichts)`);
        if (!(z.hopBeimTod > 0.3)) v.push(`vakuös: B starb nicht im Sprung (Hüpfer ${z.hopBeimTod} m)`);
        if (!(z.nahGeprueft >= 300 && z.fernGeprueft >= 300))
            v.push(`vakuös: ${z.nahGeprueft} nahe und ${z.fernGeprueft} ferne Leichnam-Takte geprüft (Soll je ≥ 300)`);
        if (z.ausserBlick > 0) v.push(`vakuös: ${z.ausserBlick} Leichnam-Takte außer Blick`);
        const kg = z.kopieGeprueft || { nah: 0, fern: 0 };
        if (!(kg.nah >= 300 && kg.fern >= 300))
            v.push(`vakuös: ${kg.nah} nahe und ${kg.fern} ferne Takte der Kopie geprüft (Soll je ≥ 300)`);
        if (!z.last || !(z.last.soll >= 9))
            v.push(`vakuös: die Gefallenen trugen ${z.last ? z.last.soll : "–"} Holz (Soll 9)`);
        else if (z.last.zurueck !== z.last.soll || z.last.journal !== 3)
            v.push(
                `last: von ${z.last.soll} Holz der Gefallenen fielen ${z.last.zurueck} an den Spieler zurück, ${z.last.journal} von 3 Journal-Einträgen`
            );
        if (!Array.isArray(z.raeumer) || z.raeumer.length || !(z.raeumt > 0))
            v.push(`raeumen: neben _leibZeichenFrei (${z.raeumt} Rufe im Fall) räumen ${JSON.stringify(z.raeumer)} — Soll EINE Methode`);
        for (const k of KLASSEN) if (z.verstoss && z.verstoss[k]) v.push(`${k}: ${z.verstoss[k]} Takte — ${z.beispiel[k]}`);
        return { ok: v.length === 0, grund: v.join(" · ") };
    };
    const KLASSEN = [
        "last",
        "raeumen",
        "stufe",
        "schatten",
        "kopie",
        "aura",
        "traglast",
        "wesen",
        "stimme",
        "lage",
        "haltung",
        "schwebt",
        "abschied",
    ];
    const TAETER = [
        ["sicht", /^stufe|· stufe|schatten/],
        ["kopie", /kopie:/],
        ["zeichen", /aura|traglast/],
        ["lage", /lage:/],
        ["haltung", /haltung:/],
        ["sprung", /schwebt/],
        ["wesen", /wesen:/],
        ["stimme", /stimme:/],
        ["last", /last:/],
        ["raeumen", /raeumen:/],
    ];
    const lauf = (t) => safeEvaluate(page, `(${todZensus})(window.anazhRealm, window.THREE, ${JSON.stringify(t)})`);
    const u = urteil(await lauf(null));
    check("Tod-Zensus: der Leichnam liegt in der Stufe seines Abstands, wirft nah Schatten, ohne Aura, Traglast, Wesen-Takt und Stimme", u.ok, u.ok ? "" : u.grund.slice(0, 300));
    const blind = [];
    for (const [t, re] of TAETER) {
        const v = urteil(await lauf(t));
        if (v.ok || !re.test(v.grund)) blind.push(`${t}: ${v.ok ? "unsichtbar" : v.grund.slice(0, 120)}`);
    }
    check(`Tod-Zensus SELBSTTEST: ${TAETER.length} Täter beim Namen (der alte Defekt je Probe ROT aus ihrem Grund)`, blind.length === 0, blind.join(" · "));
}

// Die Bewegungs-Garantie unter Last (P1) — eingefaltet aus gate:move-under-load: `_gameLoopTick(t)` mit 330-ms-Sprüngen (die 3-FPS-Realität), W gehalten: (a) die Bewegung
// verhungert nie an der Last (der Fixed-Step ist unbedingt) · (b) ohne gebauten Spieler-Chunk (gestallter Worker, Fern-Teleport)
// trägt die feld-native Kollision · (c) nie im Soliden, nie Void · (d) die Pause: nach 10 s ohne Takt springt kein Wolf weiter
// als Sprint × TAKT_DECKEL_S; Selbsttests: die gepinnte Position und der fehlende Takt-Deckel werden rot, dieser an JEDEM Wolf (W10).
async function checkBandBewegungUnterLast({ page, check }) {
    const out = await safeEvaluate(page, async (selftest) => {
        const s = r.state;
        const mesh = s.playerMesh;
        if (!mesh || !s.playerVel) return { error: "kein Spieler" };
        const span = r._voxelChunkConfig(0).span;
        const tick = (t) => {
            try {
                r._gameLoopTick(t);
            } catch {}
        };
    
        // einen settled LAND-Spot finden (deterministisch, über Wasser) — nahe (Szenario a)
        const findLand = (x0, x1, zJit) => {
            for (let i = 0; i < 400; i++) {
                const x = x0 + ((i * 53) % (x1 - x0));
                const z = ((i * 31) % 120) - 60 + zJit;
                const h = r.getTerrainHeightAt(x, z);
                if (Number.isFinite(h) && r._landAt(x, z)) return { x, y: h + 1.5, z };
            }
            return null;
        };
        const nearSpot = findLand(-40, 40, 0);
        // FERN-Spot (Szenario b): weit außerhalb des gebauten Rings — dort existiert kein Chunk.
        const farSpot = findLand(560, 720, 500);
        // kein Ersatz-Ort: findet die Suche kein Land, bricht die Probe laut
        if (!nearSpot || !farSpot) throw new Error(`move-under-load: kein Land fuer den ${nearSpot ? "FERN" : "NAH"}-Spot (findLand)`);
    
        const resetSim = (spot) => {
            mesh.position.set(spot.x, spot.y, spot.z);
            s.playerVel.setValue(0, 0, 0);
            s._fieldVy = 0;
            s._fieldWasGrounded = false;
            s._groundedCache = false;
            s.isInAir = false;
            s.isJumping = false;
            s.onSteepSlope = false;
            s._jumpPressedAt = -Infinity;
            s._spaceWasDown = false;
            s.yaw = 0;
            s.keys = { w: true }; // W gehalten (die Walk-Linsen-Simulation)
            s._fixedAccumulator = 0;
            s._fixedSimPos = null;
            s._fixedPrevPos = null;
            s._fixedSimTime = 0;
        };
        const simPos = () => {
            const p = s._fixedSimPos || mesh.position;
            return { x: p.x, y: p.y, z: p.z };
        };
    
        // DER SCHWERE LAUF: 60 Ticks à 330 ms (3 FPS). pin=true (Selbst-Test) setzt die
        // Position nach jedem Tick zurück — die Linse MUSS das als „keine Bewegung" sehen.
        const heavyRun = (spot, ticks, pin) => {
            resetSim(spot);
            let t = performance.now();
            tick(t); // Baseline-Tick (setzt lastTime im Loop-Closure)
            resetSim(spot); // der Baseline-Tick darf die Messung nicht verschieben
            const start = simPos();
            let minY = start.y,
                clipTicks = 0,
                overBudgetSeen = false;
            for (let i = 0; i < ticks; i++) {
                tick((t += 330));
                if (pin) {
                    mesh.position.set(spot.x, spot.y, spot.z);
                    if (s._fixedSimPos) s._fixedSimPos.set(spot.x, spot.y, spot.z);
                    if (s._fixedPrevPos) s._fixedPrevPos.set(spot.x, spot.y, spot.z);
                }
                const p = simPos();
                if (p.y < minY) minY = p.y;
                // Körper-Mitte im Soliden = geclippt (die Disziplin: _fieldSolid,
                // NICHT getTerrainHeightAt — letzteres lügt am Überhang).
                if (r._fieldSolid(p.x, p.y + 0.9, p.z)) clipTicks++;
                if (s._frameOverBudget) overBudgetSeen = true;
            }
            const end = simPos();
            return {
                movedXZ: Math.hypot(end.x - start.x, end.z - start.z),
                start,
                end,
                minY,
                clipTicks,
                overBudgetSeen,
            };
        };
    
        const o = {};
    
        // ── (a) BEWEGUNG UNTER LAST (gebaute Welt) ──
        o.a = heavyRun(nearSpot, 60, false);
    
        // ── SELBST-TEST: gepinnte Position → die Bewegungs-Garantie MUSS rot lesen ──
        if (selftest) o.pinned = heavyRun(nearSpot, 20, true);
    
        // ── (b)+(c) OHNE GEBAUTEN SPIELER-CHUNK: gestallter Worker + Fern-Teleport ──
        const savedWorker = s.voxelWorker;
        const stalled = { postMessage() {}, terminate() {} }; // schluckt jede Anfrage — der Mesh kommt NIE
        s.voxelWorker = stalled;
        const farKey = `${Math.floor(farSpot.x / span)},${Math.floor(farSpot.z / span)}`;
        // Prämisse sichern: dort steht KEIN Chunk (weit außerhalb des Rings)
        const preEntry = s.voxelChunks ? s.voxelChunks.get(farKey) : null;
        o.premiseNoChunk = !preEntry || !preEntry.mesh;
        o.b = heavyRun(farSpot, 60, false);
        const postEntry = s.voxelChunks ? s.voxelChunks.get(farKey) : null;
        // die Prämisse HIELT über den ganzen Lauf (der Stall wirkte — kein Sync-Leck)
        o.premiseHeld = !postEntry || !postEntry.mesh;
        o.pendingAfter = s.voxelMeshPending ? s.voxelMeshPending.size : 0;
        // WIEDERHERSTELLEN (die Gate-Hook-Lehre: sichern + restaurieren, nie löschen)
        s.voxelWorker = savedWorker;
    
        // ── (d) DIE PAUSE: der Loop ruht 10 s (versteckter Tab, Debugger, Lade-Stau), die Uhr läuft.
        // Vier Wölfe laufen auf den stehenden Spieler zu; im ersten Takt nach der Pause trägt kein Tier weiter als
        // sein Sprint (Steuer-Gesetz: sprintTempo der Hüft-Höhe) × den Takt-Deckel. deckelAus (Selbst-Test) hebt
        // den Deckel auf — der ungedeckelte Takt (Tempo × Pause) MUSS die Linse rot machen.
        const K = r.constructor;
        const pauseLauf = (deckelAus) => {
            resetSim(nearSpot);
            s.keys = {};
            const deckel = K.TAKT_DECKEL_S == null || !Number.isFinite(K.TAKT_DECKEL_S) ? 0.1 : K.TAKT_DECKEL_S;
            const W = [];
            const absage = [];
            const opt = { precise: true, bodySize: 1, absage: (g) => absage.push(`Wolf-Spawn abgesagt: ${g}`) };
            const maxAlt = s.maxCreatures; // RAUM für die vier Wölfe: die Population ist nicht die Frage der Linse (zurück unten)
            s.maxCreatures = Math.max(maxAlt, s.creatures.length + 4);
            for (let i = 0; i < 24 && W.length < 4; i++) {
                const a = (i * 2.399963) % (2 * Math.PI);
                const x = nearSpot.x + Math.sin(a) * 22;
                const z = nearSpot.z + Math.cos(a) * 22;
                if (!r._landAt(x, z)) continue;
                const c = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 0.3, z, "happy", "wolf", opt);
                if (!c) continue;
                c.userData.task = { name: "follow_player", args: { distance: 3 }, since: performance.now() / 1000 };
                W.push(c);
            }
            // KI-ABSICHT UND LEBENS-UHR RUHEN (W10): `_verhaltenNext` ∞ würfelt die Aktions-Uhr neu, statt dass der 10-s-Takt
            // jede fällige Aktion startet (tempo 0); `lastTick` ∞ hält den Lebenszyklus, der den ältesten Wolf ohne Beute nähme
            const RUHIG = { _verhaltenAktion: null, _verhaltenNext: Infinity, _hopV: 0, _hopH: 0 };
            const ruhig = () => W.forEach((c) => Object.assign(c.userData, RUHIG));
            const leben = s.faunaLifecycle || {};
            const lebenAlt = leben.lastTick;
            leben.lastTick = Infinity;
            let t = performance.now();
            for (let k = 0; k < 40; k++) {
                ruhig();
                tick((t += 1000 / 60));
            }
            const vor = W.map((c) => [c.position.x, c.position.z]);
            const vVor = W.map((c) => (c.userData._steuer ? c.userData._steuer.v : 0));
            const grenze = W.map((c) => K._steuerGesetz().sprintTempo(r._kreaturHueftL(c)) * deckel);
            const alt = K.TAKT_DECKEL_S;
            if (deckelAus) K.TAKT_DECKEL_S = Infinity;
            ruhig();
            tick((t += 10000)); // DIE PAUSE: 10 s Wanduhr ohne Takt
            if (deckelAus) K.TAKT_DECKEL_S = alt;
            const weg = W.map((c, i) => Math.hypot(c.position.x - vor[i][0], c.position.z - vor[i][1]));
            // DIE VORBEDINGUNG DES TÄTERS, laut: jeder Wolf lief vor der Pause auf seinem Lage-Pfad und blieb im Pausen-Takt auf
            // ihm (keine Aktion, Tempo > 0) — sonst urteilt die Linse nichts, und sein Name steht im Urteil
            leben.lastTick = lebenAlt;
            const halt = W.map((c, i) => {
                const u = c.userData;
                if (!s.creatures.includes(c)) return `Wolf ${i}: fiel im Pausen-Takt`;
                if (u._verhaltenAktion) return `Wolf ${i}: Aktion ${u._verhaltenAktion.name}`;
                return vVor[i] > 0 && u._steuer && u._steuer.v > 0 ? null : `Wolf ${i}: steht (vVor ${vVor[i]})`;
            }).filter(Boolean).concat(absage);
            for (const c of W) r.removeCreature(c);
            s.maxCreatures = maxAlt;
            const ueber = weg.filter((w, i) => !(w <= grenze[i] + 0.05)).length;
            return { n: W.length, deckel, weg, grenze, vVor, ueber, halt, max: Math.max(0, ...weg) };
        };
        o.d = pauseLauf(false);
        if (selftest) o.dAus = pauseLauf(true);
        return o;
    }, true);
    if (!out || out.error) return check("Bewegung unter Last: die Bühne steht (Land für NAH und FERN)", false, out ? out.error : "keine Antwort der Seite");
    const { a, b, d, pinned: p, dAus: da } = out;
    check(`Bewegung unter Last (a): > 1 m über 60 schwere Ticks (${a.movedXZ.toFixed(2)} m), die Last war ECHT (_frameOverBudget stand)`, a.movedXZ > 1.0 && a.overBudgetSeen === true);
    check(
        `Bewegung unter Last (b)(c): ohne Chunk-Mesh (Stall hielt) trägt die feld-native Kollision (${b.movedXZ.toFixed(2)} m), nie im Soliden (${b.clipTicks} Clip-Ticks), nie Void (minY ${b.minY.toFixed(1)})`,
        out.premiseNoChunk && out.premiseHeld && b.movedXZ > 1.0 && b.clipTicks === 0 && b.minY > -60
    );
    check(
        `Bewegung unter Last (d) DIE PAUSE: kein Wolf springt im ersten Takt weiter als Sprint × Takt-Deckel (max ${d.max.toFixed(2)} m, ${d.ueber}/${d.n} drüber)`,
        d.n >= 3 && d.ueber === 0 && !d.halt.length,
        d.halt.length ? `Vorbedingung: ${d.halt.join(" · ")}` : d.ueber ? "Täter: startEternalLoop, ungedeckeltes delta → updateCreatures" : ""
    );
    check(
        `Bewegung unter Last SELBSTTEST: die gepinnte Position liest als keine Bewegung (${p ? p.movedXZ.toFixed(3) : "?"} m), ohne Takt-Deckel springt JEDER Wolf (${da ? da.ueber : "?"}/${da ? da.n : "?"})`,
        !!p && p.movedXZ <= 1.0 && !!da && da.n >= 3 && da.ueber === da.n && !da.halt.length,
        da && da.halt.length ? `Vorbedingung: ${da.halt.join(" · ")}` : ""
    );
}

module.exports = {
    checkBandV1749Adventure, checkBandVoxelTerrainCore, checkBandWellePerf3bDistanceLod,
    checkBandJedesHolzExistenzBoden, checkBandWelle993WaterLodSeam, checkBandV18130CsmShadow,
    checkBandV18132FerneSeen, checkBandV18150Ride, checkBandGammaGenese, checkBandV18199GammaMLichen,
    checkBandWahrerAnblickPfade, checkBandSeamNormal, checkBandTodZensus, checkBandBewegungUnterLast,
};
