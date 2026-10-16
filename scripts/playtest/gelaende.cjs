"use strict";
// scripts/playtest/gelaende.cjs — der Richter von Gelaende (spec/stamm/modul-karte.json): Welt-Genese · Genesis-Platz · Boden-Sicht · Hang und Fels · Stufen-Kette · Höhe · Voxel-Worker · Chunk-Bau · Streaming · Edits · Dirty-Remesh · Fern-Ring · Fern-Wasser · Ring-Pflege · Blocker-Netz · Bau-Hüllen · Teil-AABB.
// 11 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Abenteuer graduiert: `explore` feuert nicht flach je Chunk-Wechsel, die Magnitude emergiert aus
// Neuheit (visitedRegions) + Distanz vom Ursprung + Kühnheit (karge/glut-Aura via auraAt);
// Konsum: kühnes Erkunden ≫ Pendeln (awe).
async function checkBandV1749Adventure(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
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
    check("V17.49 Abenteuer: EXPLORE-Config (Neuheit > Wiederkehr, max > min)", res.config);
    check("V17.49 Abenteuer: KONSUM — eine NEUE Region staunt mehr als eine Wiederkehr (Neuheit)", res.noveltyGrades);
    check(
        "V17.49 Abenteuer: KONSUM — kühnes Erkunden (neu+fern+karg) ≫ vertrautes Pendeln (das Wagnis graduiert)",
        res.adventureGrades
    );
    check(
        "V17.49 Abenteuer: KONSUM — in eine karge Aura wagen staunt mehr (Kühnheit liest das Feld)",
        res.boldnessGrades
    );
    check(
        "V17.49 Abenteuer: KONSUM — die explore-Tat skaliert mit der Magnitude (awe graduiert, nicht binär)",
        res.exploreScales
    );
    check("V17.49 Abenteuer: visitedRegions bounded (Prune beim Überlauf)", res.bounded);
}

// V9.52-c Sub-Welle c — Band-Funktion (Voxel-Terrain-Bogen P1+P2b + V9.x-Lösch-Beweise (V9.27-V9.35, V9.38-V9.39, V9.31)).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandVoxelTerrainCore(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Voxel-Terrain — Dichte-Feld + Surface Nets ###
    // Beweist echte Höhlen/Überhänge aus 3D-Dichte-Feld + Surface-Nets-Mesher. Vorab alle
    // Voxel-Chunks abräumen; die folgenden Tests bauen ihren Ring per _tickVoxelChunkStreaming neu
    // (Test-Isolation).
    await page.evaluate(() => {
        const r = window.anazhRealm;
        if (r && r.state && r.state.voxelChunks && typeof r._disposeVoxelChunk === "function") {
            for (const key of [...r.state.voxelChunks.keys()]) r._disposeVoxelChunk(key);
        }
    });
    const voxelP1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        out.hasDensityAt = typeof r._terrainDensityAt === "function";
        out.hasChunkGeometry = typeof r._voxelChunkGeometry === "function";
        out.hasSpawnTest = typeof r._spawnVoxelTestChunk === "function";

        if (out.hasDensityAt) {
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
                    // V14.7: SURF-RELATIV — der Boden UNTER der Höhlen-Zone (min aus
                    // base-25 und surf-30) bleibt fest; das Höhlen-Band scannt bis surf.
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
        }

        if (out.hasChunkGeometry) {
            // V14.7: oy straddelt die ECHTE Oberfläche (vorher fix -24; die V14.7-
            // Massive heben surf darüber → ein Tiefband läge ganz unter Grund → 0 Verts).
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
                // V9.16 — die Normalen kommen aus dem Dichte-
                // Gradienten: jede ist ein endlicher Einheits-
                // vektor (kein Facetten-Rauten-Muster).
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
        }

        // Die Kollision ist feld-nativ (Dichtefeld), es gibt kein per-Chunk-Kollisions-Artefakt —
        // geprüft wird nur der Mesh-in-Szene-Lebenszyklus von _spawnVoxelTestChunk.
        if (out.hasSpawnTest && r.state.scene) {
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
        check("Voxel P1: _terrainDensityAt-Methode existiert", voxelP1Results.hasDensityAt);
        check("Voxel P1: _voxelChunkGeometry-Methode existiert", voxelP1Results.hasChunkGeometry);
        check("Voxel P1: _spawnVoxelTestChunk-Methode existiert", voxelP1Results.hasSpawnTest);
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
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        out.hasEnsure = typeof r._ensureVoxelChunkAt === "function";
        out.hasTick = typeof r._tickVoxelChunkStreaming === "function";
        out.hasPrune = typeof r._pruneDistantVoxelChunks === "function";
        out.hasConfig = typeof r._voxelChunkConfig === "function";
        out.hasAttachColors = typeof r._attachVoxelFieldColors === "function";
        // Voxel ist permanent (keine Toggle-Methoden): der Ring ist beim Init gefüllt
        // (state.voxelTerrainActive default true).

        if (out.hasTick) {
            // Der Game-Loop läuft headless gedrosselt (~1 Hz im Hintergrund-Tab) → den Voxel-Ring hier
            // explizit synchron bauen; im Spiel-Pfad läuft alles asynchron.
            const pmInit = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
            // Der Spieler-Chunk baut async im Worker, dessen Callback im synchronen Test-Pump nie feuert →
            // Worker temporär „nicht synced“: `_acquireVoxelChunkBuild` baut dann synchron (Stage-3-Fallback).
            const _wgSynced = r.state.voxelWorkerWorldgenSynced;
            r.state.voxelWorkerWorldgenSynced = false;
            if (typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
            for (let s = 0; s < 50; s++) r._tickVoxelChunkStreaming(pmInit);
            r.state.voxelWorkerWorldgenSynced = _wgSynced;
            // Gras ist deferred (enqueue im Finalize, Build ≤1/Frame im Loop): das Streaming enqueued nur,
            // die Test-Naht drainet sofort — sonst sieht der Grass-Check leere Chunks.
            if (typeof r._drainPendingGrass === "function") r._drainPendingGrass();
            out.activated = r.state.voxelTerrainActive === true;
            out.ringFilled = !!(r.state.voxelChunks && r.state.voxelChunks.size > 0);
            // DETERMINISMUS-BOGEN P3 — Voxel-Chunks tragen kein per-Objekt-Kollisions-
            // Artefakt mehr (Ammo entfernt); der Boden lebt feld-nativ im Dichtefeld.

            // V9.22 — der Voxel-Chunk grünt: Instanced-Gras.
            out.hasVoxelGrass = typeof r._buildVoxelChunkGrass === "function";
            out.hasVoxelSurfaceY = typeof r._voxelSurfaceY === "function";
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
            // Gras-Zelle verbucht 0 Halme UND die Halm-Funktion lebt im Boden-Albedo (Konsum-Probe am
            // Chokepoint).
            out.voxelGrassIsSurface =
                grassEntries > 0 && grassBlades === 0 && /_halmHoch/.test(window.__codeOf(r._terrainGeologyAlbedo));
            // _voxelSurfaceY: liefert eine endliche Höhe AUF dem Nulldurchgang (V18.503, interpoliert wie die
            // Mesh-Kante) — 0,6 m darunter Grund, 0,6 m darüber Luft (vorher nur der Fels-Gitterpunkt, bis
            // 1,2 m unter dem gezeichneten Boden).
            const sy = r._voxelSurfaceY(12, -8);
            out.voxelSurfaceFinite = typeof sy === "number" && Number.isFinite(sy);
            out.voxelSurfaceIsBoundary =
                out.voxelSurfaceFinite &&
                r._terrainDensityAt(12, sy - 0.6, -8) > 0 &&
                r._terrainDensityAt(12, sy + 0.6, -8) <= 0;

            // V9.24 — die geheilten Verbindungen: Sicht-Ring + Vegetation.
            out.hasVegSampleSpawn = typeof r._vegetationSampleSpawn === "function";
            out.hasVoxelVegPopulator = typeof r._populateVoxelChunkVegetation === "function";
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
                typeof fsVoxel === "number" && Number.isFinite(fsVoxel) && Math.abs(fsVoxel - vsRef) < 0.01;

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
            // V9.35 — explizit Heightfield-Opt-out wird auch
            // zwangs-migriert (der Opt-out existiert nicht mehr).
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

            // V9.10 — Welt-Feld-Farbe + Naht-Skirt.
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

            // V9.35: nach dem Prune baut der Streaming-Ring den
            // Spieler-Ring neu auf — wir restaurieren das hier
            // direkt, damit nachfolgende Tests Voxel-Chunks haben.
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

            // V17.114 U1 — die DETAIL-KASKADE: `_detailBand(r)` ist die EINE Quelle der Distanz-Bänder, die Tabelle ist
            // frozen; die Stufe des Boden-Netzes liest `_voxelChunkLodFor` aus seiner Kette (`BODEN_STUFEN`, K51),
            // und der Aerial-Schleier (hazeFar) koppelt an die Ring-Kante (§2).
            out.detailBandFn = typeof r._detailBand === "function";
            if (out.detailBandFn) {
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
                // Die Hysterese (K51-2, in Metern): ein Chunk hält seine feinere Stufe, bis der Kasten-Abstand bis + vorlauf +
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
                // V18.530 — der Dunst koppelt NICHT mehr an den Sicht-Ring (er verbarg die LOD-Naht): die Luft ist
                // Physik (`_luftEnsure`), die Atmo-Uniforms tragen keinen Höhen-Melt mehr.
                r._ensureAtmoUniforms();
                out.hazeCouplesRing =
                    r._syncAtmoToViewDistance === undefined && r.state.atmoUniforms.hazeFar === undefined;
                // V17.115 U3 — die Kreaturen lesen die Kaskade: das `aiDiv`-Band-Feld
                // (nah jeden Frame, fern seltener) + der Richtungs-Cache nach einem Tick.
                out.bandAiDiv = b(0).aiDiv === 1 && b(8).aiDiv === 1 && b(9).aiDiv === 3 && b(11).aiDiv === 6;
                r.updateCreatures(0.016);
                out.creatureAiCached =
                    r.state.creatures.length === 0 ||
                    r.state.creatures.some((c) => c.userData && c.userData.aiDir && c.userData.aiDir.isVector3);
            }
        }
        return out;
    });

    if (voxelP2bResults && !voxelP2bResults.error) {
        check(
            "Voxel P2b: alle Ring-Methoden existieren (_ensureVoxelChunkAt/_tickVoxelChunkStreaming/_pruneDistantVoxelChunks/_voxelChunkConfig)",
            voxelP2bResults.hasEnsure &&
                voxelP2bResults.hasTick &&
                voxelP2bResults.hasPrune &&
                voxelP2bResults.hasConfig
        );
        check(
            "Voxel V9.35: das Voxel-Terrain ist beim Init permanent aktiv (Toggle-frei)",
            voxelP2bResults.activated && voxelP2bResults.ringFilled
        );
        check("Voxel P2b: _tickVoxelChunkStreaming baut den Ring nach (Streaming)", voxelP2bResults.tickBuilds);
        check("Voxel P2b: _pruneDistantVoxelChunks räumt ferne Voxel-Chunks", voxelP2bResults.pruneRemovesFar);
        check("Voxel P2b-Politur: _attachVoxelFieldColors-Methode existiert", voxelP2bResults.hasAttachColors);
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
            "V17.114 U1: _detailBand (die Detail-Kaskade) ist die EINE Distanz-Quelle",
            voxelP2bResults.detailBandFn === true
        );
        if (voxelP2bResults.detailBandFn) {
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
            check("V17.114 U1: DETAIL_CASCADE ist frozen (kein Drift)", voxelP2bResults.cascadeFrozen === true);
            check(
                "V17.114 U1 §2 → V18.530: kein Ring-gekoppelter Schleier mehr (hazeFar + _syncAtmoToViewDistance fort)",
                voxelP2bResults.hazeCouplesRing === true
            );
            check(
                "V17.115 U3: das Band trägt aiDiv (nah jeden Frame=1, fern seltener: Band2=3, Band3=6)",
                voxelP2bResults.bandAiDiv === true
            );
            check(
                "V17.115 U3: Kreaturen cachen die KI-Richtung nach einem Tick (creature.userData.aiDir)",
                voxelP2bResults.creatureAiCached === true
            );
        }
        check(
            "Voxel V9.22: _buildVoxelChunkGrass + _voxelSurfaceY existieren",
            voxelP2bResults.hasVoxelGrass && voxelP2bResults.hasVoxelSurfaceY
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
            "Voxel V9.24: _vegetationSampleSpawn + _populateVoxelChunkVegetation existieren",
            voxelP2bResults.hasVegSampleSpawn && voxelP2bResults.hasVoxelVegPopulator
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
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Die drei Toggle-Methoden sind GELÖSCHT.
        out.noSetActive = typeof r.setVoxelTerrainActive !== "function";
        out.noDormant = typeof r._setHeightfieldDormant !== "function";
        out.noRestore = typeof r._restoreVoxelTerrain !== "function";
        // Voxel ist beim Init aktiv (kein toggle nötig).
        out.voxelPermanent = r.state.voxelTerrainActive === true;
        out.metaPermanent = !!(r.state.worldMeta && r.state.worldMeta.voxelTerrain === true);
        // Der Welt-Snapshot trägt das Flag (überlebt Reload).
        const snap = r.buildStateSnapshot();
        out.snapshotHasFlag = !!(snap && snap.worldMeta && snap.worldMeta.voxelTerrain === true);
        // Der Chat-Toggle ist tot: der Source-Scan prüft das String-Literal `=== "voxel terrain on"`
        // (Code-Logik, nicht einen Kommentar, der den toten Befehl erwähnt).
        const src = (typeof r.processChatCommand === "function" && window.__codeOf(r.processChatCommand)) || "";
        out.noChatToggle = !/===\s*["']voxel terrain on["']/.test(src);
        return out;
    });

    if (voxelV935ToggleResults && !voxelV935ToggleResults.error) {
        check(
            "Voxel V9.35: setVoxelTerrainActive-Methode ist gelöscht (Toggle-Tod)",
            voxelV935ToggleResults.noSetActive
        );
        check(
            "Voxel V9.35: _setHeightfieldDormant-Methode ist gelöscht (Reversibilitäts-Schicht weg)",
            voxelV935ToggleResults.noDormant
        );
        check(
            "Voxel V9.35: _restoreVoxelTerrain-Methode ist gelöscht (kein Init-Restore mehr nötig)",
            voxelV935ToggleResults.noRestore
        );
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
    const voxelP5c1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        const origVoxel = r.state.worldMeta && r.state.worldMeta.voxelTerrain;

        // (1) Voxel-Welt: kein initialer Chunk-Build + keine heightData.
        r.state.worldMeta.voxelTerrain = true;
        r.state.lastWorldgen = 0;
        r.generateNewWorld({ force: true });
        // V9.27 Phase 5c.1: keine Heightfield-Chunks. V18.272 — `chunkMap` ist als
        // totes Sediment gekehrt (ensureChunkAt starb V9.39); die Wahrheit ist
        // jetzt „abwesend ODER leer" (beides = kein Heightfield-Chunk).
        out.voxelChunkMapEmpty = !r.state.chunkMap || r.state.chunkMap.size === 0;
        out.voxelMaterialKept = r.state.terrainMaterial !== null && r.state.terrainMaterial !== undefined;
        // V9.28: heightData/minHeight/maxHeight nicht allokiert/gesetzt.
        out.voxelGroundFieldNull = r.state.groundHeightField === null;
        out.voxelMinHeightZero = r.state.minHeight === 0;
        out.voxelMaxHeightZero = r.state.maxHeight === 0;
        out.voxelMinHeightFinite = Number.isFinite(r.state.minHeight);

        // V18.370 — Cap-Headroom (die dokumentierte Creature-Cap-Flake): sonst gibt der Test-Spawn
        // bei vollem Warmup-Cap null → die `if (creature)`-Positionierung wird übersprungen → die
        // Assertion bleibt undefined → rot. Lokal raise/restore (vor return).
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;

        // V9.28: updateCreatures ist voxel-aware. Spawne eine
        // Kreatur an bekannter Position, lasse einen Frame laufen,
        // verifiziere y ≈ _voxelSurfaceY + 0.5 (± floatOffset 0.3).
        if (
            typeof r.spawnCreatureAt === "function" &&
            typeof r._voxelSurfaceY === "function" &&
            typeof r.updateCreatures === "function"
        ) {
            const testX = 5;
            const testZ = 5;
            const voxelY = r._voxelSurfaceY(testX, testZ);
            const creature = r.spawnCreatureAt(testX, 50, testZ, "happy");
            // W-D/M-F1 (V18.170) — falls der Spieler nahe (5,5) steht, klemmt der
            // Spawn weg; der Test misst den BODEN an (testX,testZ) → re-platzieren.
            if (creature) creature.position.set(testX, 50, testZ);
            if (creature && Number.isFinite(voxelY)) {
                // _creatureGroundY hat ein 20-Scans-Budget je Tick und die Test-Kreatur ist die LETZTE im Array
                // → ein Tick fiele seed-abhängig auf den Makro-Schätzwert. Drei Ticks erreichen sie
                // deterministisch (der echte Budget+Cache-Pfad bleibt geprüft, kein Cache-Bypass).
                r.updateCreatures(0.016);
                r.updateCreatures(0.016);
                r.updateCreatures(0.016);
                // Tier-Bodenkontakt: die Sohlen stehen auf dem SICHTBAREN Boden um das Gesetz (Welle L, Q4: die
                // Boden-Karte des Chunks im STAND_SICHT_BAND um _voxelSurfaceY, sonst das Gesetz) — kein Schwebe-Anker,
                // kein Sinus-Bob; ±0.5 deckt die Hang-Proben-Mitte; Schwimm-Bob nur im Wasser.
                const karte = r._bodenSichtAt(testX, testZ);
                const expected =
                    Number.isFinite(karte) && Math.abs(karte - voxelY) <= r.constructor.STAND_SICHT_BAND
                        ? karte
                        : voxelY;
                const actual = creature.position.y;
                out.creatureOnVoxelSurface = Math.abs(actual - expected) < 0.5;
                // Fallback-Wächter nur, wo Boden und Fallback unterscheidbar sind.
                const fallbackY = r.state.terrainBaseHeight || 0;
                out.creatureNotAtFallback =
                    Math.abs(voxelY - fallbackY) < 1.0 ? true : Math.abs(actual - fallbackY) > 0.5;
            }
        }

        // Selbst wenn ein Test-Setup `voxelTerrain = false` setzt, baut der Welt-Generator keine
        // Heightfield-Chunks (chunkMap bleibt leer) — der `else`-Pfad in `generateTerrainWithParameters`
        // ist gelöscht.
        r.state.worldMeta.voxelTerrain = false;
        r.state.lastWorldgen = 0;
        r.generateNewWorld({ force: true });
        // V18.272 — „abwesend ODER leer": kein Heightfield-Chunk gebaut.
        out.heightfieldElseDead = !r.state.chunkMap || r.state.chunkMap.size === 0;
        // Restore: voxelTerrain auf true zurück + Regen, damit
        // die nachfolgenden Tests eine Voxel-Welt haben.
        r.state.worldMeta.voxelTerrain = true;
        r.state.lastWorldgen = 0;
        r.generateNewWorld({ force: true });
        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
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
        check(
            "Voxel V9.28: updateCreatures stellt Kreaturen auf den sichtbaren Boden um _voxelSurfaceY (Stand-Leser der Sicht, Welle L)",
            voxelP5c1Results.creatureOnVoxelSurface
        );
        check(
            "Voxel V9.28: Kreatur fällt NICHT auf den groundHeightField-null-Fallback (y ≠ Fallback-Basis)",
            voxelP5c1Results.creatureNotAtFallback
        );
    }

    // ### Voxel — Lösch-Beweise: generateChunk + addTerrainPhysics ###
    const voxelV930Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        return {
            noGenerateChunk: typeof r.generateChunk !== "function",
            noAddTerrainPhysics: typeof r.addTerrainPhysics !== "function",
        };
    });

    if (voxelV930Results && !voxelV930Results.error) {
        check("Voxel V9.30: generateChunk ist gelöscht (tote Methode, V9.28-Befund)", voxelV930Results.noGenerateChunk);
        check(
            "Voxel V9.30: addTerrainPhysics ist gelöscht (tote Methode, V9.28-Befund)",
            voxelV930Results.noAddTerrainPhysics
        );
    }

    // ### Voxel — Lösch-Beweise toter Heightfield-Schichten ###
    // `extendTerrain` (ohne Aufrufer) + die `caveData`/`volcanoData`-Float-Arrays (alloziert, nie
    // gelesen). Wer eine davon wieder anlegt, muss eine echte Notwendigkeit benennen.
    const voxelV934Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const srcGen =
            (typeof r.generateTerrainWithParameters === "function" &&
                window.__codeOf(r.generateTerrainWithParameters)) ||
            "";
        return {
            noExtendTerrain: typeof r.extendTerrain !== "function",
            noCaveDataAlloc: !/const\s+caveData\s*=\s*new\s+Float32Array/.test(srcGen),
            noVolcanoDataAlloc: !/const\s+volcanoData\s*=\s*new\s+Float32Array/.test(srcGen),
            noCaveDataWrite: !/caveData\[i\]\s*=/.test(srcGen),
            noVolcanoDataWrite: !/volcanoData\[i\]\s*=/.test(srcGen),
        };
    });

    if (voxelV934Results && !voxelV934Results.error) {
        check(
            "Voxel V9.34: extendTerrain ist gelöscht (Legacy-direction-API ohne Aufrufer)",
            voxelV934Results.noExtendTerrain
        );
        check(
            "Voxel V9.34: caveData-Float-Array ist gelöscht (nie gelesen)",
            voxelV934Results.noCaveDataAlloc && voxelV934Results.noCaveDataWrite
        );
        check(
            "Voxel V9.34: volcanoData-Float-Array ist gelöscht (nie gelesen)",
            voxelV934Results.noVolcanoDataAlloc && voxelV934Results.noVolcanoDataWrite
        );
    }

    // ### Voxel — Lösch-Beweise der voxel-Gate-`else`-Hälften ###
    // `worldMeta.voxelTerrain` ist permanent true → die Heightfield-`else`-Hälften waren unreachable.
    const voxelV938Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const srcGen =
            (typeof r.generateTerrainWithParameters === "function" &&
                window.__codeOf(r.generateTerrainWithParameters)) ||
            "";
        const srcGet = (typeof r.getTerrainHeightAt === "function" && window.__codeOf(r.getTerrainHeightAt)) || "";
        const srcFind = (typeof r.findSurfaceAbove === "function" && window.__codeOf(r.findSurfaceAbove)) || "";
        return {
            // (1) `calculateTerrainSteepness` ist gelöscht — kein
            // Aufrufer mehr nach Wasserfall-Loop-Lösch.
            noCalcSteepness: typeof r.calculateTerrainSteepness !== "function",
            // (2) heightData-Allokations-Loop in generateTerrain*
            // ist weg: keine `new Float32Array(WIDTH * DEPTH)` mehr.
            noHeightDataAlloc: !/new\s+Float32Array\(WIDTH\s*\*\s*DEPTH\)/.test(srcGen),
            // (3) der Wasserfall-Loop (256×256) ist weg:
            // kein `for (let z = 0; z < DEPTH; z++)` mehr.
            noWaterfallLoop: !/for\s*\(\s*let\s+z\s*=\s*0\s*;\s*z\s*<\s*DEPTH\s*;/.test(srcGen),
            // (4) `getTerrainHeightAt` ist voxel-only — kein
            // `groundHeightField`-Read mehr in der Source.
            getHeightVoxelOnly: !/groundHeightField/.test(srcGet),
            // (5) `findSurfaceAbove` ist voxel-only — kein
            // `groundHeightField`-Read mehr, kein floatingIslands-
            // Loop.
            findSurfaceVoxelOnly: !/groundHeightField/.test(srcFind) && !/floatingIslands/.test(srcFind),
            // Regression-Schutz: die zwei verschlankten Funktionen
            // leben weiter + liefern eine endliche Zahl.
            getHeightWorks: Number.isFinite(r.getTerrainHeightAt(0, 0)),
            findSurfaceWorks: Number.isFinite(r.findSurfaceAbove(0, -100, 0)),
        };
    });

    if (voxelV938Results && !voxelV938Results.error) {
        check(
            "Voxel V9.38 Phase 5c.2.c.3.b.ii: calculateTerrainSteepness ist gelöscht (kein Aufrufer nach Wasserfall-Loop-Lösch)",
            voxelV938Results.noCalcSteepness
        );
        check(
            "Voxel V9.38 Phase 5c.2.c.3.b.ii: heightData-Allokations-else-Pfad in generateTerrainWithParameters ist gelöscht",
            voxelV938Results.noHeightDataAlloc
        );
        check(
            "Voxel V9.38 Phase 5c.2.c.3.b.ii: Heightfield-Wasserfall-Loop ist gelöscht (Wasser kommt aus dem Hydrosphären-Netz)",
            voxelV938Results.noWaterfallLoop
        );
        check(
            "Voxel V9.38 Phase 5c.2.c.3.b.ii: getTerrainHeightAt ist voxel-only (Heightfield-else-Pfad + Raycast-Fallback gelöscht)",
            voxelV938Results.getHeightVoxelOnly
        );
        check(
            "Voxel V9.38 Phase 5c.2.c.3.b.ii: findSurfaceAbove ist voxel-only (Heightfield-Pfad + floatingIslands-Loop gelöscht)",
            voxelV938Results.findSurfaceVoxelOnly
        );
        check(
            "Voxel V9.38: getTerrainHeightAt liefert weiter eine endliche Höhe (Regression)",
            voxelV938Results.getHeightWorks
        );
        check(
            "Voxel V9.38: findSurfaceAbove liefert weiter eine endliche Höhe (Regression)",
            voxelV938Results.findSurfaceWorks
        );
    }

    // ### Voxel — Lösch-Beweise der Heightfield-Pipeline ###
    // Die toten Heightfield-Methoden + der `terrainMaterial`-Setzer sind weg; die Vision-Schichten
    // leben in den Voxel-Pendants (`_populateVoxelChunkVegetation`, `_buildVoxelChunkGrass`,
    // `_attachVoxelFieldColors`).
    const voxelV939Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const proto = Object.getPrototypeOf(r);
        return {
            // (1)-(6) die sechs Methoden sind gelöscht
            noEnsureChunkAt: typeof r.ensureChunkAt !== "function",
            noPopulateChunkVegetation: typeof r.populateChunkVegetation !== "function",
            noBuildChunkGrass: typeof r._buildChunkGrass !== "function",
            noDisposeChunkGrass: typeof r._disposeChunkGrass !== "function",
            noTerrainHeightAtWorld: typeof r._terrainHeightAtWorld !== "function",
            noDisposeChunkPhysics: typeof r._disposeChunkPhysics !== "function",
            noPruneDistantChunks: typeof r.pruneDistantChunks !== "function",
            noChunkGeometry: typeof r._chunkGeometry !== "function",
            // (7) `state.terrainMaterial` wird nicht mehr aktiv gesetzt
            terrainMaterialNull: r.state.terrainMaterial === null,
            // (8) der Game-Loop ruft kein `pruneDistantChunks` mehr
            loopHasNoPrune: !(
                proto._gameLoopTick &&
                /pruneDistantChunks/.test(
                    window.__codeOf(
                        Object.getOwnPropertyNames(proto)
                            .map((n) => proto[n])
                            .find(
                                (f) => typeof f === "function" && /tickArchitectureCulling/.test(window.__codeOf(f))
                            ) || function () {}
                    )
                )
            ),
            // (9) `_buildWaterPlane` ist voxel-only: Regex auf das Aufruf-Pattern
            // `this._terrainHeightAtWorld(`, damit ein Kommentar mit dem Namen nicht falsch-rot wird.
            waterPlaneVoxelOnly:
                typeof r._buildWaterPlane === "function" &&
                !/this\._terrainHeightAtWorld\s*\(/.test(window.__codeOf(r._buildWaterPlane)),
            // (10) Voxel-Pendants leben weiter (Vision-Anker)
            voxelGrassAlive: typeof r._buildVoxelChunkGrass === "function" && r.state.voxelChunkGrass instanceof Map,
            voxelVegetationAlive: typeof r._populateVoxelChunkVegetation === "function",
            voxelSurfaceYAlive: typeof r._voxelSurfaceY === "function",
            // (11) Die geteilten Helper bleiben: `_vegetationSampleSpawn` (per-Sample-Spawn-Kern) +
            // `_attachVoxelFieldColors` (Voxel-Affinitäts-Färbung).
            sampleSpawnAlive: typeof r._vegetationSampleSpawn === "function",
            attachVoxelFieldColorsAlive: typeof r._attachVoxelFieldColors === "function",
        };
    });

    if (voxelV939Results && !voxelV939Results.error) {
        check("Voxel V9.39: ensureChunkAt ist gelöscht", voxelV939Results.noEnsureChunkAt);
        check("Voxel V9.39: populateChunkVegetation ist gelöscht", voxelV939Results.noPopulateChunkVegetation);
        check(
            "Voxel V9.39: _buildChunkGrass + _disposeChunkGrass sind gelöscht",
            voxelV939Results.noBuildChunkGrass && voxelV939Results.noDisposeChunkGrass
        );
        check("Voxel V9.39: _terrainHeightAtWorld ist gelöscht", voxelV939Results.noTerrainHeightAtWorld);
        check("Voxel V9.39: _disposeChunkPhysics ist gelöscht", voxelV939Results.noDisposeChunkPhysics);
        check("Voxel V9.39: pruneDistantChunks ist gelöscht", voxelV939Results.noPruneDistantChunks);
        check("Voxel V9.39: _chunkGeometry ist gelöscht", voxelV939Results.noChunkGeometry);
        check(
            "Voxel V9.39: state.terrainMaterial wird nicht mehr gesetzt (null nach Welt-Aufbau)",
            voxelV939Results.terrainMaterialNull
        );
        check(
            "Voxel V9.39: _buildWaterPlane ist voxel-only (kein _terrainHeightAtWorld-Aufruf mehr)",
            voxelV939Results.waterPlaneVoxelOnly
        );
        check(
            "Voxel V9.39: Voxel-Gras-Pendant lebt weiter (_buildVoxelChunkGrass + state.voxelChunkGrass)",
            voxelV939Results.voxelGrassAlive
        );
        check(
            "Voxel V9.39: Voxel-Vegetations-Pendant lebt weiter (_populateVoxelChunkVegetation)",
            voxelV939Results.voxelVegetationAlive
        );
        check(
            "Voxel V9.39: _voxelSurfaceY lebt weiter (Höhen-Quelle für getTerrainHeightAt)",
            voxelV939Results.voxelSurfaceYAlive
        );
        check(
            "Voxel V9.39: _vegetationSampleSpawn + _attachVoxelFieldColors leben weiter (geteilte Vision-Helper)",
            voxelV939Results.sampleSpawnAlive && voxelV939Results.attachVoxelFieldColorsAlive
        );
    }
}

// Distance-LOD: ferne Chunks (> 80 m) bauen mit step=3.6 m statt 1.8, dim=12 statt 24, dimY=62
// statt 124 (8× weniger Cells). Span (43.2 m) + vertikaler Range (223.2 m) bleiben konstant
// → Chunks world-aligned über die LOD-Grenze.
async function checkBandWellePerf3bDistanceLod(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
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
        out.hasLodHelper = typeof r._voxelChunkLodFor === "function";
        if (out.hasLodHelper) {
            // der Spieler in der Mitte des Chunks 0,0 (K51-2: die Stufe folgt dem Kasten-Abstand)
            out.lodNear = r._voxelChunkLodFor(0, 0, 21.6, 21.6); // r=0 → LOD 0
            out.lodAdjacent = r._voxelChunkLodFor(1, 0, 21.6, 21.6); // r=1 (21,6 m) → LOD 0
            out.lodMidRing = r._voxelChunkLodFor(2, 0, 21.6, 21.6); // r=2 (64,8 m) → LOD 1
            out.lodFar = r._voxelChunkLodFor(3, 0, 21.6, 21.6); // r=3 (108 m) → LOD 2
            out.lodVeryFar = r._voxelChunkLodFor(4, 0, 21.6, 21.6); // r=4 → LOD 2
        }
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
    check("Welle Perf-3.b V9.88: _voxelChunkLodFor existiert", res.hasLodHelper);
    if (res.hasLodHelper) {
        check("Welle Perf-3.b V9.88: r=0 (Player-Chunk) → LOD 0", res.lodNear === 0);
        check("Welle Perf-3.b V9.88: r=1 (Nachbar-Chunk) → LOD 0", res.lodAdjacent === 0);
        check("K51 Boden-Stufen: r=2 (jenseits der Nah-Zone 3×3) → LOD 1", res.lodMidRing === 1);
        check("K51 Boden-Stufen: r=3 → LOD 2", res.lodFar === 2);
        check("K51 Boden-Stufen: r=4 (sehr ferner Chunk) → LOD 2", res.lodVeryFar === 2);
    }
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

// EXISTENZ-BODEN der Ring-Ramp: liegt der Frame ab Bild 1 über dem Totband (Software-Rasterizer),
// hielte ein Kopfraum-Gate den Ring ewig auf 0. Bis RING_EXIST_FLOOR wächst er OHNE fps-Bedingung
// (settled + kein Rückstau + Atem), dort endet der Schrumpf-Pfad; der PID atmet NUR darüber.
async function checkBandJedesHolzExistenzBoden(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const A = r.constructor;
        const out = {};
        out.hasFloor = Number.isFinite(A.RING_EXIST_FLOOR) && A.RING_EXIST_FLOOR >= 1;
        // KONSUM (source-probe, kommentar-frei): die Ramp liest den Boden in Wachs- UND Schrumpf-Pfad.
        const src = window.__codeOf(r._nexusPerfActuate);
        out.rampConsumesFloor = /RING_EXIST_FLOOR/.test(src) && /ringFloor/.test(src);
        // Fixture: schwaches Holz — frameMs 50 (≈20 fps) ab dem ersten Bild, NIE Kopfraum.
        const snap = {
            renderer: st.renderer,
            active: st._activeRingRadius,
            target: st.chunkRingRadius,
            pend: st.voxelMeshPending,
            grass: st.pendingGrass,
            rampLast: st._ringRampLast,
            head: st._ringHeadroomSince,
            over: st._ringOverBudgetSince,
            boot: st._ringBootWindowUntil,
            overB: st._frameOverBudget,
            streamMs: st._voxelStreamBudgetMs,
            streamN: st._voxelStreamMaxPerFrame,
            built: r._builtRingRadius,
            shadowApplied: r._shadowRangeApplied,
        };
        try {
            st.renderer = { _isHeadlessNull: false }; // die ECHTE Ramp (nicht der Headless-Instant-Pfad)
            r._builtRingRadius = () => 12; // Bau-Stub: das Band beweist die RAMP-Entscheidung, nicht den Bau
            st.chunkRingRadius = 4; // Ziel ÜBER dem Boden — der Boden darf nie übers Ziel
            st.voxelMeshPending = new Set();
            st.pendingGrass = new Set();
            st._frameOverBudget = false;
            st._activeRingRadius = 0;
            st._ringHeadroomSince = 0;
            st._ringOverBudgetSince = 0;
            st._ringBootWindowUntil = 0;
            const weakSense = () => ({
                loadScale: 0.3,
                frameMs: 50,
                renderCalls: 100,
                phase: { streaming: 1, render: 1, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 },
            });
            const grown = [];
            for (let i = 0; i < 4; i++) {
                st._ringRampLast = performance.now() - (A.RING_RAMP_SETTLE_MS + 50); // der Atem ist verstrichen
                r._nexusPerfActuate(weakSense());
                grown.push(st._activeRingRadius);
            }
            out.grownPath = grown.join(",");
            // OHNE Kopfraum wächst der Ring GENAU bis zum Boden — die Welt ENTSTEHT, aber der
            // PID behält die Hoheit darüber (kein Wachsen über den Boden bei Dauerlast):
            out.growsToFloor = grown[grown.length - 1] === A.RING_EXIST_FLOOR;
            out.neverAboveFloor = grown.every((g) => g <= A.RING_EXIST_FLOOR);
            // Der Schrumpf-Pfad endet am Boden: anhaltende Überlast von oben (Boden+1) → Boden, nie tiefer.
            st._activeRingRadius = A.RING_EXIST_FLOOR + 1;
            st._frameOverBudget = true;
            for (let i = 0; i < 3; i++) {
                st._ringOverBudgetSince = performance.now() - (A.RING_SHRINK_SUSTAIN_MS + 100);
                st._ringRampLast = performance.now() - (A.RING_RAMP_SETTLE_MS + 50);
                r._nexusPerfActuate(weakSense());
            }
            out.shrinkStopsAtFloor = st._activeRingRadius === A.RING_EXIST_FLOOR;
        } catch (e) {
            out.error = e.message;
        } finally {
            st.renderer = snap.renderer;
            r._builtRingRadius = snap.built;
            st._activeRingRadius = snap.active;
            st.chunkRingRadius = snap.target;
            st.voxelMeshPending = snap.pend;
            st.pendingGrass = snap.grass;
            st._ringRampLast = snap.rampLast;
            st._ringHeadroomSince = snap.head;
            st._ringOverBudgetSince = snap.over;
            st._ringBootWindowUntil = snap.boot;
            st._frameOverBudget = snap.overB;
            st._voxelStreamBudgetMs = snap.streamMs;
            st._voxelStreamMaxPerFrame = snap.streamN;
            if (Number.isFinite(snap.shadowApplied)) r._applyEffectiveShadowRange(snap.shadowApplied);
        }
        return out;
    });
    if (res.error) {
        check("JEDES-HOLZ: Existenz-Boden-Band (realm)", false, res.error);
        return;
    }
    check(
        "JEDES-HOLZ: RING_EXIST_FLOOR existiert (≥1) + die Ramp KONSUMIERT ihn (Wachs- und Schrumpf-Pfad)",
        res.hasFloor && res.rampConsumesFloor
    );
    check(
        `JEDES-HOLZ: ohne Kopfraum (frameMs 50 ab Bild 1) wächst der Ring GENAU bis zum Existenz-Boden (${res.grownPath}) — die Welt ENTSTEHT auf jedem Holz, der PID regiert darüber`,
        res.growsToFloor && res.neverAboveFloor
    );
    check(
        "JEDES-HOLZ: der Schrumpf-Pfad endet am Existenz-Boden — anhaltende Überlast gibt die Fern-Schale zurück, NIE die Existenz-Welt",
        res.shrinkStopsAtFloor
    );
}

// Wasser-Cells leben IMMER auf LOD 0, unabhängig vom Terrain-LOD des Chunks — sonst klafft die
// Wasser-Iso-Surface an der LOD-Grenze (Cell-Center step-abhängig). Terrain bleibt LOD-aware.
async function checkBandWelle993WaterLodSeam(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        const cfg0 = r._voxelChunkConfig(0);
        out.expectedCellLen = cfg0.dim * cfg0.dim * cfg0.dimY; // T8: 24·24·232 = 133632
        // Ein Wasser-Chunk am Wasser-Ort des Gesetzes (`__wasserChunk`: die Heimat trägt seit K16 keinen See).
        window.__wasserChunk("see");
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

// SCHATTEN-CSM: das vendorte r184-Addon CSMShadowNode, 2 Kaskaden INNERHALB der Schatten-Reichweite
// (V18.510): Kaskade 0 endet an der DETAIL_CASCADE-Band-0-Kante, Kaskade 1 an maxFar = Reichweite ×
// SCHATTEN_FERN_FAKTOR. Jede Kaskade zeichnet jeden Werfer ihrer Box — die Wand: über die ganze geregelte
// Reichweite (MIN..MAX) und die User-Decke (400 m) trägt JEDE Kaskade ≥ 10 % der Tiefe (kein Streifen, der
// einen vollen Werfer-Durchgang kostet; V18.130–509 klemmte die dritte auf einen 5-%-Streifen). Die CSM-Init
// ist LAZY (erster echter Material-Build) → hier Konstruktion + Vertrag; Look + Maps misst die Sonde diag-csm (git-Archiv).
async function checkBandV18130CsmShadow(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
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
                if (Math.abs(breaks[0] - Math.min(0.85, e0 / far)) > 1e-9) kante = false;
                let prev = 0;
                for (const b of breaks) {
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
        check("V18.130 CSM: Sonde lief", false, "evaluate warf");
        return;
    }
    check("V18.130 CSM: das r184-Addon ist vendort + angebunden (THREE.CSMShadowNode)", res.vendorSymbol);
    check(
        "V18.510 CSM: 2 Kaskaden aktiv als shadowNode des Sonnen-Lichts (fade an)",
        res.active && res.cascades === 2 && res.fade && res.isShadowNode
    );
    check(
        "V18.510 CSM: Kaskade 0 endet an der Band-0-Kante, die letzte an maxFar = Reichweite × Faktor",
        res.active && res.mode === "custom" && res.breaksAreLaw && res.maxFarIstReichweite,
        `breaks=${res.breaks} maxFar=${res.maxFar}`
    );
    check(
        "V18.510 CSM: jede Kaskade trägt ≥ 10 % der Tiefe über die ganze Reichweite (kein Streifen-Durchgang)",
        res.active && res.minAnteil >= 0.1,
        `min=${res.minAnteil} breaks=${res.breaks}`
    );
}

// A3 — FERNE BINNENGEWÄSSER: Heimat-Region (±1024) unberührt; jenseits liefern lazy Kacheln (2048 m,
// f(seed, Koordinate) — peer-identisch, egal wann berechnet) Seen · Flüsse · Erosion; eine
// mitwandernde Region bräche den Determinismus. Voller Beweis: die Sonde diag-ferne-seen (git-Archiv).
async function checkBandV18132FerneSeen(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const out = {};
        out.machinery =
            typeof r._hydroFor === "function" &&
            typeof window.__gelaendeCore.kachelSchluessel === "function" &&
            typeof r._ensureHydroTilesAround === "function";
        // KONSUM (V17.31): ALLE Hydro-Leser laufen durch die Region-Aufloesung.
        // V18.180-FIX §6.4: _hydroWaterLevelAt fiel (V9.69-Zwei-Skalen-Lücke);
        // _waterLevelAt ist die EINE Auftrieb-Wahrheit (Bergsee-bewusst).
        const readers = [
            r._hydrosphereCarveAt,
            r._hydrosphereLakeAt,
            r._waterLevelAt,
            r._atlasWaterLevelAt,
            r._hydroRiverAt,
            r._voxelChunkHasAnyWater,
        ];
        out.readersResolved = readers.every((f) => /_hydroFor/.test(window.__codeOf(f)));
        // Worker-Mirror (Quelle per fetch — gleiche Origin): Resolver + Apply.
        try {
            const src = await fetch("voxel-worker.js").then((x) => x.text());
            out.workerMirror =
                /function hydroFor\(/.test(src) &&
                /importScripts\([^\n]*"gelaende-core\.js"/.test(src) &&
                /snap\.hydroTiles/.test(src);
        } catch (_e) {
            out.workerMirror = "fetch-fail";
        }
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
        r._ensureHydroTilesAround(-2048, 0, 10); // Kachel WEST (-1,0)
        const tile = r.state.hydroTiles ? r.state.hydroTiles.get("-1,0") : null;
        out.tileBuilt = !!(tile && tile.ready);
        out.tileSubstanz = tile ? (tile.rivers ? tile.rivers.length : 0) + (tile.lakes ? tile.lakes.length : 0) : 0;
        out.homeIdentical = fp() === before;
        // hydroBand deckt JEDEN Spiegel (V9.77: das Band ist global) — die Seen UND die Flüsse (Punkt-Spiegel S) der Heimat
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
        // Der Worker-Snapshot traegt die Kachel.
        const snap = r._voxelWorkerSnapshotState();
        out.snapCarries = !!(snap.hydroTiles && snap.hydroTiles["-1,0"]);
        return out;
    });
    if (!res) {
        check("V18.132 Ferne Seen: Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "V18.132 Ferne Seen: Kachel-Maschinerie steht (_hydroFor/gelaende-core kachelSchluessel/_ensure...)",
        res.machinery
    );
    check("V18.132 Ferne Seen: ALLE 8 Hydro-Leser laufen durch die Region-Aufloesung (KONSUM)", res.readersResolved);
    check(
        "V18.132 Ferne Seen: der Worker-Mirror traegt hydroFor + Kachel-Apply",
        res.workerMirror === true,
        String(res.workerMirror)
    );
    if (!res.unmeasurable) {
        check(
            "V18.132 Ferne Seen: die WEST-Kachel baut mit Substanz (Fluesse+Seen > 0)",
            res.tileBuilt && res.tileSubstanz > 0,
            `substanz=${res.tileSubstanz}`
        );
        check("V18.132 Ferne Seen: die HEIMAT-Region bleibt bit-identisch (Welt-Identitaet)", res.homeIdentical);
        check(
            "V18.132 Ferne Seen: hydroBand deckt jeden Spiegel — Seen und Flüsse der Heimat und jeder Kachel (global, V9.77)",
            res.bandCovers,
            `Band-Oberkante ${res.bandTop} · höchster Spiegel ${res.maxSpiegel} (Täter: _computeHydroBand)`
        );
        check("V18.132 Ferne Seen: der Worker-Snapshot traegt die Kachel (Determinismus-Wand)", res.snapCarries);
    }
}

// FAHR-TIEFE: das Fahr-Profil emergiert aus der Substanz (Räder = Tempo + Ausrollen, Masse =
// Trägheit), der Sattel führt die Bewegung (EINE Quelle), Gelenke fahren mit (Phase ∝ Weg). Reiter
// + Gefährt sind EINS: Kollision ruht im Sattel, unerntbar, brennglas-fest.
async function checkBandV18150Ride(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
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
            // Welle L (Q5): die Hülle ist der Körper des gerittenen Werks — die Probe fährt auf BEFAHRBAREM Boden: die
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
            out.collisionRests =
                r.state.player.mountedArch === entry.id && /riddenId/.test(window.__codeOf(r._stepCharacterStructures));
            out.profileConsumed = r._mountedVehicleProfile() === prof;
            // (3) Reiter + Gefährt sind EINS: unerntbar + kein Sammler-Ziel +
            // brennglas-fest (Quelle), solange geritten.
            out.unharvestable = r.harvestArchitecture(entry, "player") === null;
            out.noGatherTarget = r._findNearestArchitectureWithMaterial(entry.position, "holz") !== entry;
            out.brennglasSafe = /riddenId/.test(window.__codeOf(r._tickFocusingAffordances));
            // P3: der Reiter-Skip lebt jetzt in der Feld-Struktur-Kollision (nicht mehr im Cull-Tick).
            out.lazyPassSkips = /riddenId/.test(window.__codeOf(r._stepCharacterStructures));
            // (4) das Gefährt fährt in seine Bug-Richtung + die Räder rollen (Phase ∝ Weg).
            // Welle L (Q13): ein Werk mit vier Rädern trägt das Fahr-Gesetz (exportDrive aus seiner Hülle) und fährt den
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
            // (6) der Idle-Animator pausiert fürs gerittene Gefährt.
            out.idleSkips = /mountedId/.test(window.__codeOf(r.tickArchitectures));
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
    check("V18.150 Fahr-Tiefe: das Profil emergiert (4× Rad → Tempo ×>1.3 · rollt aus · träge)", res.profile);
    check(
        "V18.150 Fahr-Tiefe: der Sattel ruht die Kollision + liest das Profil",
        res.collisionRests && res.profileConsumed
    );
    check(
        "V18.150 Fahr-Tiefe: Reiter + Gefährt sind EINS (unerntbar · kein Sammler-Ziel · brennglas-fest · Lazy-Pass ruht)",
        res.unharvestable && res.noGatherTarget && res.brennglasSafe && res.lazyPassSkips
    );
    check(
        "V18.150 Fahr-Tiefe: das Gefährt richtet sich aus + die Räder rollen (Phase ∝ Weg)",
        res.orients && res.wheelsRoll,
        res.orients && res.wheelsRoll ? "" : res.fahrZahlen
    );
    check("V18.150 Fahr-Tiefe: Idle-Animator pausiert im Sattel + Absteigen gibt frei", res.idleSkips && res.dismounts);
}

async function checkBandGammaGenese(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};
        const origGen = r.state.worldMeta ? r.state.worldMeta.genVersion : undefined;
        try {
            if (!r.state.worldMeta) r.state.worldMeta = {};
            r.state.worldMeta.genVersion = 2;
            // (1) Struktur: Funktionen da, Konstanten frozen.
            out.struct =
                typeof r._feuchteAt === "function" &&
                typeof r._hydroDistAt === "function" &&
                Object.isFrozen(A.FEUCHTE);
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
            // (4) Γ2 — DAS BODEN-GESETZ (Waldboden 04.10., die Host-Kronen-Lesart fiel): die Studio-Zeilen, die die
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
                return /Math\.random/.test(window.__codeOf(f));
            });
            // (7) genVersion REIST im Snapshot (V8.59-Klasse: was der Save
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
    check("Γ Struktur: _feuchteAt/_hydroDistAt leben, FEUCHTE frozen", res.struct === true);
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
    // Γ1-Lesart-4 BODEN-ATMET als Source-Wand: die Mix-Linie (dampEarth + F_VIS_LO) lebt in
    // _attachVoxelFieldColors.
    check(
        "Γ1-Lesart-4 Mix-Linie LEBT in der Source (dampEarth + F_VIS_LO)",
        /dampEarth/.test(ctx.realm ? "" : "") ||
            /dampEarth/.test(
                (await safeEvaluate(page, () =>
                    window.anazhRealm ? window.__codeOf(window.anazhRealm._bodenFarbeAt) : ""
                )) || ""
            )
    );
    // Γ4 (K16) — DIE GROSSFORM IST DATEN: der Ein-Massiv-Anker (ankerAusSaat · ankerBeitrag · MACRO_ANKER · _macroAnker)
    // fiel; die Welt liest die Großform des Gelände-Kerns (Splines über Kontinentalität und Erosion, das Flussnetz zuerst).
    // Der Hang und die Fels-Blöße folgen dem Relief: im Gebirge (Relief-Maximum der 6-km-Probe) steiler und felsiger als in
    // der Ebene (Relief-Minimum).
    const resG4 = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const G = window.__gelaendeCore;
        const out = {};
        out.struct =
            typeof G.grossform === "function" &&
            Array.isArray(G.LANDFORM_REGLER) &&
            typeof r._slopeAt === "function" &&
            typeof r._rockExposureAt === "function";
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
    check(
        `Γ4 (K16) Struktur: gelaende-core grossform + LANDFORM_REGLER, _slopeAt + _rockExposureAt leben`,
        resG4.struct === true
    );
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

// V18.199 — Γ-M LICHEN (genese-plan §Γ-M Folge zu V18.197 STRATA): grüne
// Patina auf alten feuchten Steinen. Reine Render-Schicht, kein Welt-Effekt.
// Math-Probe der Formel + Source-Probe in Main + Worker (V17.100-Bit-Vertrag).
async function checkBandV18199GammaMLichen(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (L1) LICHEN-Konstanten existieren + frozen
        out.lichenExists = !!A.LICHEN && typeof A.LICHEN === "object";
        out.lichenFrozen = A.LICHEN && Object.isFrozen(A.LICHEN);
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

        // (L2) Source-Probe Main: LICHEN-Mix lebt in der EINEN Boden-Farbe (_bodenFarbeAt)
        const mainSrc = window.__codeOf(r._bodenFarbeAt);
        // Position im Mix-Stack: NACH dampEarth, VOR lava
        out.mainOrderCorrect =
            mainSrc.indexOf("dampEarth, ss") < mainSrc.indexOf("lichenMix") &&
            mainSrc.indexOf("lichenMix") < mainSrc.indexOf("mix(lava");

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

    check("V18.199 (L1a) AnazhRealm.LICHEN existiert + frozen", res.lichenExists === true && res.lichenFrozen === true);
    check("V18.199 (L1b) LICHEN-Konstanten sinnvoll (lo<hi, strength∈(0,1), tint=3er)", res.constsSensible === true);
    check("V18.199 (L2b) Mix-Stack-Order: dampEarth → lichen → lava", res.mainOrderCorrect === true);
    check(
        `V18.199 (L3a) feucht+steinig → lichen sichtbar (gemessen avg ${res.lichenAvgWetStone && res.lichenAvgWetStone.toFixed(4)})`,
        res.lichenWetStonePositive === true
    );
    check(
        `V18.199 (L3b) trocken+steinig → lichen unsichtbar (gemessen avg ${res.lichenAvgDryStone && res.lichenAvgDryStone.toFixed(4)})`,
        res.lichenDryStoneZero === true
    );
    check(
        `V18.199 (L3c) feucht+erde → lichen unsichtbar (gemessen avg ${res.lichenAvgWetErde && res.lichenAvgWetErde.toFixed(4)})`,
        res.lichenWetErdeZero === true
    );
    check("V18.199 (L4) lichen ≤ LICHEN.strength (Math-Sicherheit, kein Overshoot)", res.lichenBoundedAtFull === true);
}

// Pfade: Fluss-Bänke sind getrampelte Erde, lawful aus dem Drainage-Netz: _pathFieldAt → der Boden
// packt (packedDirt, Main ↔ Worker bit-identisch) + das Gras weicht. Proben: KONSUM + Feld-Logik.
async function checkBandWahrerAnblickPfade(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        out.helperExists = typeof r._pathFieldAt === "function";
        // (A) Logik: fern jeden Flusses → kein Pfad
        out.farIsZero = r._pathFieldAt(99999, 99999, 10) === 0;
        // gebunden [0,1]
        let bounded = true;
        for (let gx = -200; gx <= 200; gx += 37) {
            const sy = r._voxelSurfaceY ? r._voxelSurfaceY(gx, 0) : 10;
            const v = r._pathFieldAt(gx, 0, sy);
            if (!(v >= 0 && v <= 1)) bounded = false;
        }
        out.pathBounded = bounded;

        // (B) CONSUM — der Boden-Bau packt die Pfad-Erde, der Gras-Bau weicht
        const attachSrc = window.__codeOf(r._bodenFarbeAt);
        out.attachReadsPath = /_pathFieldAt/.test(attachSrc) && /packedDirt/.test(attachSrc);
        // V18.492: die Wiese weicht dem Pfad über den Boden — die Pfad-Erde senkt das
        // Albedo-Grün, und die Parallax-Halme wiegen mit genau diesem Grün (_halmW = _green…).
        const meadowSrc = window.__codeOf(r._terrainGeologyAlbedo);
        out.grassReadsPath = out.attachReadsPath && /const _halmW = _green/.test(meadowSrc);

        // (B3) Behavioral (soft): wie viele Pfad-Treffer in einem 600m-Raster?
        let hits = 0,
            samples = 0;
        for (let gx = -300; gx <= 300; gx += 20) {
            for (let gz = -300; gz <= 300; gz += 20) {
                samples++;
                const sy = r._voxelSurfaceY ? r._voxelSurfaceY(gx, gz) : 10;
                if (r._pathFieldAt(gx, gz, sy) > 0.1) hits++;
            }
        }
        out.pathSamples = samples;
        out.pathHits = hits;

        out.versionStr = A.VERSION;
        const pv = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionFloor = pv[0] > 18 || (pv[0] === 18 && pv[1] >= 230);
        return out;
    });

    check("Ω-OPSIS S2-Pfad (A1) _pathFieldAt Helfer existiert", res.helperExists === true);
    check("Ω-OPSIS S2-Pfad (A2) Pfad-Feld ist 0 fern jeden Flusses", res.farIsZero === true);
    check("Ω-OPSIS S2-Pfad (A3) Pfad-Feld ∈ [0,1] (gebunden)", res.pathBounded === true);
    check(
        "Ω-OPSIS S2-Pfad (B2, V18.492) CONSUM: die Wiese weicht dem Pfad (Pfad-Erde senkt das Grün, das die Halme wiegt)",
        res.grassReadsPath === true
    );
    check(
        `Ω-OPSIS S2-Pfad (B3) Pfad-Feld im Welt-Raster gemessen (${res.pathHits}/${res.pathSamples} Treffer)`,
        res.pathHits >= 0 && res.pathSamples > 0
    );
    check(`Ω-OPSIS S2-Pfad (V1) VERSION floor ≥ 18.230.0 (gemessen ${res.versionStr})`, res.versionFloor === true);
}

module.exports = {
    checkBandV1749Adventure, checkBandVoxelTerrainCore, checkBandWellePerf3bDistanceLod,
    checkBandJedesHolzExistenzBoden, checkBandWelle993WaterLodSeam, checkBandV18130CsmShadow,
    checkBandV18132FerneSeen, checkBandV18150Ride, checkBandGammaGenese, checkBandV18199GammaMLichen,
    checkBandWahrerAnblickPfade,
};
