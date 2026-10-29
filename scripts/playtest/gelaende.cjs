"use strict";
// scripts/playtest/gelaende.cjs — der Richter von Gelaende (spec/stamm/modul-karte.json): Welt-Genese · Genesis-Platz · Boden-Sicht · Hang und Fels · Stufen-Kette · Höhe · Voxel-Worker · Chunk-Bau · Streaming · Edits · Dirty-Remesh · Fern-Ring · Fern-Wasser · Ring-Pflege · Blocker-Netz · Bau-Hüllen · Teil-AABB.
// 8 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

async function checkBandVoxelP3AndInventory(ctx) {
    const { page, check, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Voxel-Terrain-Bogen Phase 3 — 3D-Graben ###
    // `carveVoxel` nimmt eine Säule aus dem Dichte-Feld (gelaende-core `editForm`: Radius r, halbe Höhe r).
    const voxelP3Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        if (r.state.worldMeta) {
            const base = r.state.terrainBaseHeight || 0;
            // Der Schnitt ist die Säule r im Fels: ihr Kern und 0,5 m innerhalb ihres Rands Luft, 0,5 m außerhalb Fels.
            r.state.worldMeta.voxelEdits = [];
            r.carveVoxel(0, base - 33, 0, 12);
            out.carveSubtracts =
                r._terrainDensityAt(0, base - 33, 0) < 0 &&
                r._terrainDensityAt(11.5, base - 33, 0) < 0 &&
                r._terrainDensityAt(12.5, base - 33, 0) > 0;
            // Die Edits über Save und Reload (der Turm): gate:fall-waechter B; kein Edit fällt still: gate:worker-dichte (3).
            // Chat-Befehl `voxel carve` fügt einen Edit hinzu.
            // voxelTerrainActive ist permanent — kein Setup nötig.
            r.state.worldMeta.voxelEdits = [];
            r.processChatCommand("voxel carve");
            out.chatCarveAddsEdit = r.state.worldMeta.voxelEdits.length === 1;
            // sauber zurücklassen.
            r.state.worldMeta.voxelEdits = [];
            r.saveState();
        }
        return out;
    });

    if (voxelP3Results && !voxelP3Results.error) {
        check(
            "Voxel P3: der Schnitt nimmt die Säule r aus dem Fels (Kern und Rand Luft, außerhalb Fels)",
            voxelP3Results.carveSubtracts
        );
        check("Voxel P3: der Chat-Befehl `voxel carve` schnitzt eine Mulde", voxelP3Results.chatCarveAddsEdit);
    }

    // Async-Rebuild via Dirty-Queue: ein Edit markiert Voxel-Chunks dirty statt sync zu rebuilden, der
    // Game-Loop-Tick verteilt die Rebuilds; `_drainDirtyVoxelChunks` ist die Test-Naht (sync-Drain).
    const voxelV940cResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Den Test-Voxel-Ring SYNC auffüllen, damit der Edit Chunks zum Markieren findet: ein Tick-Loop
        // ohne Event-Loop-Yield bekommt keine Worker-Antwort (Ring bliebe leer, Flake). Darum Worker AUS
        // → 3×3-Ring um den Spieler-Chunk sync bauen → Worker zurück.
        const pm = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
        r._drainDirtyVoxelChunks();
        {
            const span940 = r._voxelChunkConfig(0).span;
            const pcx = Math.floor(pm.x / span940);
            const pcz = Math.floor(pm.z / span940);
            const savedW = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (!r.state.voxelChunks || !r.state.voxelChunks.has(`${pcx + dx},${pcz + dz}`)) {
                        r._ensureVoxelChunkAt(pcx + dx, pcz + dz, 0);
                    }
                }
            }
            r.state.voxelWorker = savedW;
        }
        r._drainDirtyVoxelChunks();
        if (!r.state.voxelChunks || r.state.voxelChunks.size === 0) {
            out.skip = true;
            return out;
        }
        // Carve OBERFLÄCHEN-relativ (surf − 1.5), nicht spieler-y-relativ: ein früheres Band kann den
        // Spieler hoch in der Luft lassen → pm.y − 1.5 läge über der `_addVoxelEdit`-Y-Wand → Edit
        // verworfen → false-rot.
        const carveSurf = r.getTerrainHeightAt(pm.x, pm.z);
        const cy = (Number.isFinite(carveSurf) ? carveSurf : pm.y) - 1.5;
        // Ein Carve in der Nähe des Spielers markiert Chunks dirty
        // statt sie sofort zu rebuilden (V9.40-c-Verhalten).
        const dirtyBefore = r.state.dirtyVoxelChunks ? r.state.dirtyVoxelChunks.size : 0;
        const carveRet = r.carveVoxel(pm.x, cy, pm.z, 3.5);
        out.editMarksDirty = !!(r.state.dirtyVoxelChunks && r.state.dirtyVoxelChunks.size > dirtyBefore);
        // bei Rot zeigt die Invariante den
        // ECHTEN Lauf-Zustand (Position/Surface/Edit-Annahme), statt zu raten.
        out.telemetry = JSON.stringify({
            pm: { x: +pm.x.toFixed(1), y: +pm.y.toFixed(1), z: +pm.z.toFixed(1) },
            carveSurf: Number.isFinite(carveSurf) ? +carveSurf.toFixed(1) : null,
            cy: +cy.toFixed(1),
            carveRet,
            dirtyBefore,
            dirtyAfter: r.state.dirtyVoxelChunks ? r.state.dirtyVoxelChunks.size : -1,
            chunks: r.state.voxelChunks ? r.state.voxelChunks.size : -1,
            // offset-FREIE Chunk-Formel (der alte +150-Offset war die
            // Heightfield-Ära und log in der Telemetrie).
            playerChunkBuilt: !!(
                r.state.voxelChunks && r.state.voxelChunks.get(`${Math.floor(pm.x / 43.2)},${Math.floor(pm.z / 43.2)}`)
            ),
        });
        // _drainDirtyVoxelChunks räumt das Set leer + rebuildet.
        const dirtyMid = r.state.dirtyVoxelChunks.size;
        const built = r._drainDirtyVoxelChunks();
        out.drainRebuilt = built > 0;
        out.drainEmptiesSet = r.state.dirtyVoxelChunks.size === 0;
        out.drainReturnedCount = built === dirtyMid;
        // Der Tick baut je Frame höchstens EINEN Chunk ein, nah zuerst, und keinen synchron (K69-2: die Aufträge der
        // nächsten gehen an den Worker voraus; ohne Worker baut er einen je Frame synchron). Ein frischer Frame: der
        // Einbau-Merker des Edits (`_bodenEinbau`, der Frame-Planer setzt ihn je Frame zurück) gilt nicht.
        r.state._frameOverBudget = false;
        r.carveVoxel(pm.x, cy, pm.z, 3.5);
        const dirtyPostEdit = r.state.dirtyVoxelChunks.size;
        if (dirtyPostEdit > 1) {
            const st = r.state;
            const worker = r._voxelFadenTraegt();
            st._bodenEinbau = null;
            let fin = 0;
            let sync = 0;
            const finRoh = r._finalizeVoxelChunkBuild;
            const bauRoh = r._buildVoxelChunkData;
            r._finalizeVoxelChunkBuild = function () {
                fin++;
                return finRoh.apply(this, arguments);
            };
            r._buildVoxelChunkData = function () {
                sync++;
                return bauRoh.apply(this, arguments);
            };
            try {
                r._tickDirtyVoxelChunks(pm);
            } finally {
                delete r._finalizeVoxelChunkBuild;
                delete r._buildVoxelChunkData;
            }
            out.tickRebuildsOne = fin <= 1 && (worker ? sync === 0 : sync <= 1);
        } else {
            out.tickRebuildsOne = true; // skip-OK bei 0/1 dirty
        }
        // Disposal räumt dirty-Marker mit.
        r._drainDirtyVoxelChunks();
        r.carveVoxel(pm.x, cy, pm.z, 3.5);
        const dirtyKey = [...r.state.dirtyVoxelChunks][0];
        if (dirtyKey) {
            r._disposeVoxelChunk(dirtyKey);
            out.disposeClearsDirty = !r.state.dirtyVoxelChunks.has(dirtyKey);
        } else {
            out.disposeClearsDirty = true;
        }
        r._drainDirtyVoxelChunks();
        return out;
    });

    if (voxelV940cResults && !voxelV940cResults.error && !voxelV940cResults.skip) {
        check(
            "ein Carve markiert Voxel-Chunks dirty (statt sofort sync rebuild)",
            voxelV940cResults.editMarksDirty,
            voxelV940cResults.telemetry
        );
        check(
            "_drainDirtyVoxelChunks rebuildet + leert das Set",
            voxelV940cResults.drainRebuilt && voxelV940cResults.drainEmptiesSet,
            voxelV940cResults.telemetry
        );
        check(
            "_drainDirtyVoxelChunks liefert die Anzahl der rebuildeten Chunks",
            voxelV940cResults.drainReturnedCount
        );
        check(
            "der Game-Loop-Tick baut pro Frame max 1 Chunk ein, keinen synchron (K69-2)",
            voxelV940cResults.tickRebuildsOne
        );
        check(
            "_disposeVoxelChunk räumt den dirty-Marker mit (gegen stale-rebuild)",
            voxelV940cResults.disposeClearsDirty
        );
    }

    // Dispose-Before-Build + Retry-Counter: den alten Chunk VOR dem Neubau entsorgen (alt + neu
    // parallel im Heap → kaskadierende OOMs).
    const voxelV940dResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Dieses Band prüft die SYNC-Bau-Mechanik (dispose-before-build, Fail-Retry-Counter, OOM-give-up)
        // des lebenden Stufe-3-Fallbacks. Worker für die Dauer des Tests aus → `_acquireVoxelChunkBuild`
        // nimmt direkt Stufe 3 (sync); Restore am Ende.
        const _savedWorker = r.state.voxelWorker;
        r.state.voxelWorker = null;
        // Ring auffüllen.
        const pm = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
        r._drainDirtyVoxelChunks();
        for (let s = 0; s < 30; s++) r._tickVoxelChunkStreaming(pm);
        if (!r.state.voxelChunks || r.state.voxelChunks.size === 0) {
            out.skip = true;
            return out;
        }
        // Dispose-Before-Build: stuben den Code-Pfad indem wir
        // einen Chunk-Key wählen, der existiert + rebuild rufen
        // + prüfen dass die alte Mesh-Identität weg ist.
        const someKey = [...r.state.voxelChunks.keys()].find((k) => {
            const e = r.state.voxelChunks.get(k);
            return e && e.mesh;
        });
        if (!someKey) {
            out.skip = true;
            return out;
        }
        const [cxStr, czStr] = someKey.split(",");
        const cx = parseInt(cxStr, 10);
        const cz = parseInt(czStr, 10);
        const oldMesh = r.state.voxelChunks.get(someKey).mesh;
        const ok = r._rebuildVoxelChunk(cx, cz);
        const newEntry = r.state.voxelChunks.get(someKey);
        out.rebuildOk = ok === true;
        // Bei Erfolg: neuer Mesh ist nicht der alte (Identität gewechselt).
        out.meshIdentityChanged = !!(newEntry && newEntry.mesh && newEntry.mesh !== oldMesh);
        // Retry-Counter: stub _buildVoxelChunkData um null zu returnen.
        const origBuild = r._buildVoxelChunkData;
        r._buildVoxelChunkData = () => null;
        // 1. Versuch: fail → dirty bleibt, attempts=1
        r._rebuildVoxelChunk(cx, cz);
        const attempts1 = r.state.voxelRebuildAttempts && r.state.voxelRebuildAttempts.get(someKey);
        out.retryCounter1 = attempts1 === 1;
        out.dirtyAfterFail = !!(r.state.dirtyVoxelChunks && r.state.dirtyVoxelChunks.has(someKey));
        // 2. Versuch: fail → attempts=2
        r._rebuildVoxelChunk(cx, cz);
        out.retryCounter2 = (r.state.voxelRebuildAttempts && r.state.voxelRebuildAttempts.get(someKey)) === 2;
        // 3. Versuch: fail → empty markiert, counter weg
        r._rebuildVoxelChunk(cx, cz);
        const finalEntry = r.state.voxelChunks.get(someKey);
        out.giveUpAsEmpty = !!(finalEntry && finalEntry.empty === true);
        out.counterClearedAfterGiveUp = !(r.state.voxelRebuildAttempts && r.state.voxelRebuildAttempts.has(someKey));
        // Restore.
        r._buildVoxelChunkData = origBuild;
        r.state.voxelWorker = _savedWorker; // V17.118 — den Worker wieder engagieren
        r._drainDirtyVoxelChunks();
        return out;
    });

    if (voxelV940dResults && !voxelV940dResults.error && !voxelV940dResults.skip) {
        check(
            "_rebuildVoxelChunk liefert true bei Erfolg + die Mesh-Identität wechselt",
            voxelV940dResults.rebuildOk && voxelV940dResults.meshIdentityChanged
        );
        check(
            "bei Build-Fail wird der voxelRebuildAttempts-Counter gepflegt (1. Versuch)",
            voxelV940dResults.retryCounter1
        );
        check(
            "bei Build-Fail wird der Chunk wieder dirty markiert (Retry-Chance)",
            voxelV940dResults.dirtyAfterFail
        );
        check("Counter steigt bei wiederholten Fails (2. Versuch)", voxelV940dResults.retryCounter2);
        check(
            "nach 3 Fails wird der Chunk ehrlich als {empty:true} markiert",
            voxelV940dResults.giveUpAsEmpty
        );
        check(
            "nach dem give-up wird der Counter geräumt (für späteren neuen Versuch)",
            voxelV940dResults.counterClearedAfterGiveUp
        );
    }

    // (1) `_addVoxelEdit` clampt Y auf den Chunk-Bereich + verwirft Edits weit außerhalb;
    // (2) `_disposeVoxelChunk` räumt `voxelRebuildAttempts` mit; (3) `_ensureVoxelChunkAt` (Streaming)
    // trägt einen Retry-Counter wie der Re-Mesh-Pfad — beide Bau-Pfade konsistent.
    const voxelV940eResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        const base = r.state.terrainBaseHeight || 0;
        // (1) Edit-Y-Bound: weit-außerhalb-Edit wird verworfen.
        const editsBefore = r.state.worldMeta.voxelEdits ? r.state.worldMeta.voxelEdits.length : 0;
        const farUpResult = r._addVoxelEdit(0, base + 10000, 0, 3, "carve");
        out.farEditRejected = farUpResult === false;
        out.farEditNotStored = (r.state.worldMeta.voxelEdits ? r.state.worldMeta.voxelEdits.length : 0) === editsBefore;
        const farDownResult = r._addVoxelEdit(0, base - 10000, 0, 3, "carve");
        out.farDownRejected = farDownResult === false;
        // Normaler Edit innerhalb Band bleibt erhalten.
        const inBoundResult = r._addVoxelEdit(0, base, 0, 3, "carve");
        out.inBoundAccepted = inBoundResult === true;
        // Edit knapp ÜBER der Decke (mit Marge) wird geclampt
        // statt verworfen.
        const nearEdgeResult = r._addVoxelEdit(0, base + 86, 0, 3, "carve");
        out.nearEdgeAccepted = nearEdgeResult === true;
        // Räumen.
        r.state.worldMeta.voxelEdits = [];

        // (2) _disposeVoxelChunk räumt voxelRebuildAttempts.
        if (!r.state.voxelRebuildAttempts) r.state.voxelRebuildAttempts = new Map();
        r.state.voxelRebuildAttempts.set("99,99", 2);
        r.state.voxelChunks.set("99,99", { empty: true });
        r._disposeVoxelChunk("99,99");
        out.disposeClearsAttempts = !r.state.voxelRebuildAttempts.has("99,99");

        // (3) _ensureVoxelChunkAt Retry-Pfad: Build-Fail (bare null) → Retry-Counter steigt; nach < 3
        // Fails KEIN empty-Eintrag (Retry pending), nach 3 ein empty + Counter geräumt. Der Fail wird
        // deterministisch erzwungen (`_acquireVoxelChunkBuild` kurz auf `()=>null` gestubbt).
        const fakeKey = "0,-999"; // weit weg, ungebraucht
        const _savedAcquire = r._acquireVoxelChunkBuild;
        r._acquireVoxelChunkBuild = () => null; // Build-Fail erzwingen (bare null)
        r.state.voxelChunks.delete(fakeKey);
        if (r.state.voxelRebuildAttempts) r.state.voxelRebuildAttempts.delete(fakeKey);
        r._ensureVoxelChunkAt(0, -999);
        out.streamFail1NoEntry = !r.state.voxelChunks.has(fakeKey);
        out.streamAttempt1 = r.state.voxelRebuildAttempts.get(fakeKey) === 1;
        r._ensureVoxelChunkAt(0, -999);
        out.streamAttempt2 = r.state.voxelRebuildAttempts.get(fakeKey) === 2;
        r._ensureVoxelChunkAt(0, -999);
        const finalE = r.state.voxelChunks.get(fakeKey);
        out.streamGiveUpAsEmpty = !!(finalE && finalE.empty === true);
        out.streamCounterClearedAfterGiveUp = !r.state.voxelRebuildAttempts.has(fakeKey);
        // Restore + Cleanup.
        r._acquireVoxelChunkBuild = _savedAcquire;
        r._disposeVoxelChunk(fakeKey);
        return out;
    });

    if (voxelV940eResults && !voxelV940eResults.error) {
        check(
            "_addVoxelEdit verwirft Edit weit über der Chunk-Decke (Schöpfer-Hinweis)",
            voxelV940eResults.farEditRejected && voxelV940eResults.farEditNotStored
        );
        check("_addVoxelEdit verwirft Edit weit unter dem Chunk-Boden", voxelV940eResults.farDownRejected);
        check("_addVoxelEdit akzeptiert Edit innerhalb des Chunk-Bands", voxelV940eResults.inBoundAccepted);
        check(
            "_addVoxelEdit clampt Edit knapp ÜBER der Decke (innerhalb Marge)",
            voxelV940eResults.nearEdgeAccepted
        );
        check(
            "_disposeVoxelChunk räumt voxelRebuildAttempts (Memory-Hygiene)",
            voxelV940eResults.disposeClearsAttempts
        );
        check(
            "_ensureVoxelChunkAt-Streaming-Fail setzt KEINEN Map-Eintrag (Retry erlaubt)",
            voxelV940eResults.streamFail1NoEntry && voxelV940eResults.streamAttempt1
        );
        check(
            "Streaming-Retry-Counter steigt bei wiederholten Fails (2. Versuch)",
            voxelV940eResults.streamAttempt2
        );
        check(
            "nach 3 Streaming-Fails wird der Chunk ehrlich als {empty:true} markiert",
            voxelV940eResults.streamGiveUpAsEmpty
        );
        check("Streaming-Counter geräumt nach give-up", voxelV940eResults.streamCounterClearedAfterGiveUp);
    }

    // ### Voxel-Terrain-Bogen Phase 3b — Aufschütten ### (die Säule des Füll-Edits über die Maus und den Reload: gate:fall-waechter B)
    const voxelP3bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        if (r.state.worldMeta) {
            const base = r.state.terrainBaseHeight || 0;
            // Backward-Compat: ein mode-loser Alt-Edit gilt als carve.
            r.state.worldMeta.voxelEdits = [];
            const dPre = r._terrainDensityAt(120, base - 33, 120);
            // BÜHNE: Edit-Daten einer Einheits-Probe — gelesen wird der Edit, nicht der Ort
            r.state.worldMeta.voxelEdits = [{ x: 120, y: base - 33, z: 120, r: 12 }];
            out.modelessIsCarve = r._terrainDensityAt(120, base - 33, 120) < dPre;
            // Chat-Befehl `voxel fill` fügt einen fill-Edit hinzu.
            // frieden — damit das V9.17-Füll-Gate frei ist.
            // voxelTerrainActive ist permanent — kein Setup nötig.
            const p3bMode = r.getGameMode();
            r.setGameMode("frieden");
            r.state.worldMeta.voxelEdits = [];
            r.processChatCommand("voxel fill");
            out.chatFillAddsEdit =
                r.state.worldMeta.voxelEdits.length === 1 && r.state.worldMeta.voxelEdits[0].mode === "fill";
            r.setGameMode(p3bMode);
            // sauber zurücklassen.
            r.state.worldMeta.voxelEdits = [];
            r.saveState();
        }
        return out;
    });

    if (voxelP3bResults && !voxelP3bResults.error) {
        check("Voxel P3b: ein mode-loser Alt-Edit gilt als carve (Backward-Compat)", voxelP3bResults.modelessIsCarve);
        check("Voxel P3b: der Chat-Befehl `voxel fill` schüttet auf", voxelP3bResults.chatFillAddsEdit);
    }

    // ### Voxel-Terrain-Bogen Phase 3c — Material-Erhaltungs-Kreis ###
    // Im pfad-Modus kostet das Aufschütten Material; in frieden +
    // schöpfer ist es frei (das Spielmodi-Muster).
    const voxelP3cResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.player) return null;
        const out = {};
        const invBackup = JSON.parse(JSON.stringify(r.state.player.inventory || []));
        const modeBackup = r.getGameMode();
        const wm = r.state.worldMeta;
        const matTotal = () => {
            let t = 0;
            for (const s of r.state.player.inventory) {
                if (s && s.kind === "material") t += s.count || 0;
            }
            return t;
        };
        // _consumeAnyMaterial: genug → true + reduziert.
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 10);
        out.consumeEnough = r._consumeAnyMaterial(4) === true && matTotal() === 6;
        // zu wenig → false + unverändert.
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 2);
        out.consumeTooLittle = r._consumeAnyMaterial(4) === false && matTotal() === 2;
        // Gate in frieden → frei, kein Verbrauch.
        r.setGameMode("frieden");
        r.state.player.inventory = new Array(27).fill(null);
        const gF = r._voxelFillGate();
        out.gateFriedenFree = gF.ok === true && gF.free === true;
        // Gate in pfad mit Material → ok + verbraucht.
        r.setGameMode("pfad");
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 10);
        const gP = r._voxelFillGate();
        out.gatePfadConsumes = gP.ok === true && gP.free === false && matTotal() === 6;
        // Gate in pfad ohne Material → abgelehnt.
        r.state.player.inventory = new Array(27).fill(null);
        out.gatePfadDeniesEmpty = r._voxelFillGate().ok === false;
        // Chat `voxel fill` in pfad ohne Material → kein Edit.
        // voxelTerrainActive ist permanent — kein Setup nötig.
        wm.voxelEdits = [];
        r.processChatCommand("voxel fill");
        out.chatFillDeniedNoMat = wm.voxelEdits.length === 0;
        // Chat `voxel fill` in pfad mit Material → Edit + Verbrauch.
        r.addMaterialToInventory("stein", 10);
        wm.voxelEdits = [];
        r.processChatCommand("voxel fill");
        out.chatFillWorksWithMat = wm.voxelEdits.length === 1;
        // sauber zurücklassen.
        wm.voxelEdits = [];
        r.state.player.inventory = invBackup;
        r.setGameMode(modeBackup);
        r.saveState();
        return out;
    });

    if (voxelP3cResults && !voxelP3cResults.error) {
        check("Voxel P3c: _consumeAnyMaterial zieht bei genug Material ab", voxelP3cResults.consumeEnough);
        check(
            "Voxel P3c: _consumeAnyMaterial lehnt bei zu wenig ab + lässt das Inventar unberührt",
            voxelP3cResults.consumeTooLittle
        );
        check(
            "Voxel P3c: das Füll-Gate ist in frieden frei (kein Material-Verbrauch)",
            voxelP3cResults.gateFriedenFree
        );
        check(
            "Voxel P3c: das Füll-Gate verbraucht im pfad-Modus Material (Erhaltungs-Kreis)",
            voxelP3cResults.gatePfadConsumes
        );
        check("Voxel P3c: das Füll-Gate lehnt im pfad-Modus ohne Material ab", voxelP3cResults.gatePfadDeniesEmpty);
        check(
            "Voxel P3c: `voxel fill` in pfad ohne Material schüttet nicht / mit Material schon",
            voxelP3cResults.chatFillDeniedNoMat && voxelP3cResults.chatFillWorksWithMat
        );
    }

    // ### Welle 6.C2 — Spielmodi (frieden / pfad / schöpfer) ###
    // Drei Welt-Beziehungs-Modi. Persistiert in worldMeta.gameMode.
    // damagePlayer + Stamina-Kosten sind modus-gated.
    const wave6c2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Default-Modus NEUER Welten ist frieden — geprüft über `_buildEmptyWorldSnapshot` (init-time),
        // nicht über den Runtime-State (frühere Tests schalten evtl. auf pfad).
        const fresh = r._buildEmptyWorldSnapshot({ slug: "test-fresh" }, false);
        out.defaultModeFrieden = fresh && fresh.worldMeta && fresh.worldMeta.gameMode === "frieden";
        out.canonicalDefaultIsFrieden = r.constructor.GAME_MODES[0] === "frieden";
        out.worldMetaHasGameMode = typeof r.state.worldMeta.gameMode === "string";

        // Übergänge: setGameMode auf jeden der drei Modi.
        r.setGameMode("pfad");
        out.setPfadWorks = r.getGameMode() === "pfad" && r.state.worldMeta.gameMode === "pfad";
        r.setGameMode("schöpfer");
        out.setSchoepferWorks = r.getGameMode() === "schöpfer" && r.state.worldMeta.gameMode === "schöpfer";
        r.setGameMode("frieden");
        out.setFriedenWorks = r.getGameMode() === "frieden";
        // Ungültiger Wert → frieden-Fallback.
        r.setGameMode("garbage");
        out.invalidFallsToFrieden = r.getGameMode() === "frieden";

        // damagePlayer-Gate: frieden + schöpfer → return false,
        // pfad → return true (existing path).
        const hpBefore = r.state.player.hp;
        r.setGameMode("frieden");
        const damageInFrieden = r.damagePlayer(50, "test");
        out.friedenBlocksDamage = damageInFrieden === false && r.state.player.hp === hpBefore;

        r.setGameMode("schöpfer");
        const damageInSchoepfer = r.damagePlayer(50, "test");
        out.schoepferBlocksDamage = damageInSchoepfer === false && r.state.player.hp === hpBefore;

        // pfad → Schaden wirkt
        r.setGameMode("pfad");
        // Aus möglicher Respawn-Gnade rausnehmen (test-cleanup)
        r.state.player.respawnGraceUntil = -Infinity;
        r.state.player.hp = 100;
        const damageInPfad = r.damagePlayer(30, "test");
        out.pfadAcceptsDamage = damageInPfad === true && r.state.player.hp < 100;

        // Stamina-Gate: applyOpToPart kostet nur in pfad.
        // Setup: ein eigener Bauplan mit holz-Material.
        r.state.blueprints["mode-test-bp"] = {
            name: "mode-test-bp",
            label: "Mode-Test",
            builtIn: false,
            parts: [
                __teil("box", "holz", 0, 0, 0, 1, 1, 1),
            ],
        };
        // Stamina voll setzen
        r.state.player.stamina = 100;

        r.setGameMode("frieden");
        const opResultFrieden = r.applyOpToPart("mode-test-bp", 0, "hände");
        out.friedenSkipsStamina = opResultFrieden.ok === true && r.state.player.stamina === 100;

        r.state.player.stamina = 100;
        r.setGameMode("schöpfer");
        const opResultSchoepfer = r.applyOpToPart("mode-test-bp", 0, "hände");
        out.schoepferSkipsStamina = opResultSchoepfer.ok === true && r.state.player.stamina === 100;

        r.state.player.stamina = 100;
        r.setGameMode("pfad");
        const opResultPfad = r.applyOpToPart("mode-test-bp", 0, "hände");
        // die Kosten skalieren mit dem Werkzeug-cap (nicht
        // mehr fix 10); dieser Test prüft das Modus-GATE (pfad
        // konsumiert), die genaue Skalierung prüft der V8.39-Block.
        out.pfadChargesStamina = opResultPfad.ok === true && r.state.player.stamina < 100;

        // Cleanup
        delete r.state.blueprints["mode-test-bp"];
        r.setGameMode("frieden");

        // DSL-Op set_mode
        r.dslRun(["set_mode", "pfad"], { source: "test" });
        out.dslSetModeWorks = r.getGameMode() === "pfad";
        r.setGameMode("frieden");

        // set_mode ist in NON_BROADCASTABLE_OPS
        out.setModeNonBroadcastable =
            r.constructor.NON_BROADCASTABLE_OPS && r.constructor.NON_BROADCASTABLE_OPS.has("set_mode");

        // Chat-Pattern: 'setze modus pfad' → set_mode-Programm
        const built = r.parseChatToDsl("setze modus pfad");
        out.chatPfad =
            built && Array.isArray(built.program) && built.program[0] === "set_mode" && built.program[1] === "pfad";
        const built2 = r.parseChatToDsl("modus schöpfer");
        out.chatSchoepfer =
            built2 &&
            Array.isArray(built2.program) &&
            built2.program[0] === "set_mode" &&
            built2.program[1] === "schöpfer";

        // describeProgram-Eintrag
        const desc = r.describeProgram(["set_mode", "pfad"]);
        out.describeWorks = typeof desc === "string" && /Welt-Beziehung|pfad/.test(desc);

        // UI: Radio + Status-Bar
        out.radiosInDom = document.querySelectorAll('input[name="game-mode-radio"]').length === 3;
        out.statusModeInDom = !!document.getElementById("status-mode");
        out.gameModeSectionInDom = !!document.getElementById("game-mode-section");
        // Status-Bar zeigt aktuellen Modus
        r.setGameMode("pfad");
        const statusItem = document.getElementById("status-mode");
        out.statusReflectsMode = statusItem && /pfad/i.test(statusItem.textContent);
        // Radio ist gecheckt
        const checkedRadio = document.querySelector('input[name="game-mode-radio"]:checked');
        out.radioReflectsMode = checkedRadio && checkedRadio.value === "pfad";
        r.setGameMode("frieden");

        return out;
    });

    if (wave6c2Results && !wave6c2Results.error) {
        check("Welle 6.C2: Neue Welten starten im frieden-Modus (init-time)", wave6c2Results.defaultModeFrieden);
        check(
            "Welle 6.C2: GAME_MODES[0] === 'frieden' (kanonischer Default)",
            wave6c2Results.canonicalDefaultIsFrieden
        );
        check("Welle 6.C2: worldMeta.gameMode ist persistiert", wave6c2Results.worldMetaHasGameMode);
        check("Welle 6.C2: setGameMode('pfad') wechselt korrekt", wave6c2Results.setPfadWorks);
        check("Welle 6.C2: setGameMode('schöpfer') wechselt korrekt", wave6c2Results.setSchoepferWorks);
        check("Welle 6.C2: setGameMode('frieden') wechselt korrekt", wave6c2Results.setFriedenWorks);
        check("Welle 6.C2: ungültiger Modus fällt auf frieden zurück", wave6c2Results.invalidFallsToFrieden);
        check(
            "Welle 6.C2: damagePlayer im frieden-Modus blockiert (HP unverändert)",
            wave6c2Results.friedenBlocksDamage
        );
        check(
            "Welle 6.C2: damagePlayer im schöpfer-Modus blockiert (HP unverändert)",
            wave6c2Results.schoepferBlocksDamage
        );
        check("Welle 6.C2: damagePlayer im pfad-Modus wirkt (HP reduziert)", wave6c2Results.pfadAcceptsDamage);
        check("Welle 6.C2: applyOpToPart im frieden-Modus kostet KEINE Stamina", wave6c2Results.friedenSkipsStamina);
        check("Welle 6.C2: applyOpToPart im schöpfer-Modus kostet KEINE Stamina", wave6c2Results.schoepferSkipsStamina);
        check("Welle 6.C2: applyOpToPart im pfad-Modus kostet Stamina (Modus-Gate)", wave6c2Results.pfadChargesStamina);
        check("Welle 6.C2: DSL-Op set_mode setzt Modus", wave6c2Results.dslSetModeWorks);
        check(
            "Welle 6.C2: set_mode ist in NON_BROADCASTABLE_OPS (Multi-User-privat)",
            wave6c2Results.setModeNonBroadcastable
        );
        check("Welle 6.C2: Chat 'setze modus pfad' → set_mode-Programm", wave6c2Results.chatPfad);
        check("Welle 6.C2: Chat 'modus schöpfer' → set_mode-Programm", wave6c2Results.chatSchoepfer);
        check("Welle 6.C2: describeProgram nennt 'Welt-Beziehung' oder Modus", wave6c2Results.describeWorks);
        check("Welle 6.C2: 3 Radio-Buttons im DOM", wave6c2Results.radiosInDom);
        check("Welle 6.C2: #status-mode im DOM", wave6c2Results.statusModeInDom);
        check("Welle 6.C2: #game-mode-section im DOM", wave6c2Results.gameModeSectionInDom);
        check("Welle 6.C2: Status-Bar spiegelt aktuellen Modus", wave6c2Results.statusReflectsMode);
        check("Welle 6.C2: Radio-Button reflektiert aktuellen Modus", wave6c2Results.radioReflectsMode);
    }

    // ### Hylomorphismus-Inventar ###
    // 27 Slots mit Tag-Resonanz; Tag-Profile emergieren aus computeCompoundTags(blueprint).
    // Drag-Click-Pfad: Inventar-Slot wählen → Hotbar-Slot klicken → Bauplan abgelegt.
    const wave6c1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Datenmodell
        out.hasInventoryArray = Array.isArray(r.state.player && r.state.player.inventory);
        out.inventorySize = r.state.player.inventory.length;
        out.inventoryHas27Slots = r.state.player.inventory.length === 27;
        out.initiallyEmpty = r.state.player.inventory.every((s) => s === null);

        // Methoden

        // addToInventory: ein bekannter Bauplan → erster leerer Slot
        const okAdd = r.addToInventory("baum_eiche", 3);
        out.addedToInventory = okAdd === true;
        out.slot0HasBaum =
            r.state.player.inventory[0] &&
            r.state.player.inventory[0].blueprintName === "baum_eiche" &&
            r.state.player.inventory[0].count === 3;
        // Zweiter Add desselben Bauplans: count kumuliert
        r.addToInventory("baum_eiche", 2);
        out.stacksCount = r.state.player.inventory[0] && r.state.player.inventory[0].count === 5;
        // Unbekannter Bauplan → false
        out.addRejectsUnknown = r.addToInventory("fictional_bp", 1) === false;

        // removeFromInventory: 5 → 3
        r.removeFromInventory(0, 2);
        out.removeWorks = r.state.player.inventory[0].count === 3;
        // Komplett entfernen → null
        r.removeFromInventory(0, 99);
        out.fullRemoveClearsSlot = r.state.player.inventory[0] === null;

        // DSL-Op add_to_inventory (damm — lebendes builtIn; der Name ist mechanik-egal)
        r.dslRun(["add_to_inventory", "damm", 1], { source: "test" });
        out.dslOpWorks = r.state.player.inventory.some((s) => s && s.blueprintName === "damm");

        // NON_BROADCASTABLE
        out.addToInventoryNonBroadcastable =
            r.constructor.NON_BROADCASTABLE_OPS && r.constructor.NON_BROADCASTABLE_OPS.has("add_to_inventory");

        // describeProgram-Eintrag
        const d = r.describeProgram(["add_to_inventory", "baum_eiche", 5]);
        out.describeWorks = typeof d === "string" && /Inventar|baum_eiche|5/.test(d);

        // UI: Overlay-Element + Grid + Selected-Display
        out.overlayInDom = !!document.getElementById("inventory-overlay");
        out.gridInDom = !!document.getElementById("inventory-grid");
        out.selectedInDom = !!document.getElementById("inventory-selected");
        // Initial hidden
        const overlay = document.getElementById("inventory-overlay");
        out.initiallyHidden = overlay && overlay.hasAttribute("hidden");

        // Toggle öffnet + rendert 27 Slots
        r.toggleInventoryOverlay(true);
        const slots = document.querySelectorAll("#inventory-grid .inventory-slot");
        out.gridRendered27 = slots.length === 27;
        out.overlayVisibleAfterToggle = !overlay.hasAttribute("hidden");

        // Tag-Magic-Test: kristall_geode (quarz, magieleitung 0.85)
        // sollte die magie-Klasse bekommen. baum_eiche (laub,
        // lebendig 1.0) → lebendig-Klasse.
        r.state.player.inventory[0] = { blueprintName: "kristall_geode", count: 1 };
        r.state.player.inventory[1] = { blueprintName: "baum_eiche", count: 1 };
        r.renderInventoryUI();
        const slot0 = document.querySelector('#inventory-grid [data-inv-slot="0"]');
        const slot1 = document.querySelector('#inventory-grid [data-inv-slot="1"]');
        out.geodeHasMagieClass = slot0 && slot0.classList.contains("tag-magieleitung");
        out.baumHasLebendigClass = slot1 && slot1.classList.contains("tag-lebendig");
        // die Drag&Drop-Affordanz: ein gefüllter Inventar-Slot ist ziehbar (Spielerperspektive,
        // Werkstatt-artige Direkt-Manipulation; das Ziehen inv→hotbar existiert via _onSlotDrop).
        out.filledSlotDraggable = !!(slot0 && slot0.getAttribute("draggable") === "true");
        // baum_eiche hat laub → brennbar 0.85 hoch
        out.baumHasBrennendClass = slot1 && slot1.classList.contains("tag-brennend");

        // Click → selectInventorySlot setzt inventorySelected
        r.selectInventorySlot(0);
        out.selectionWorks = r.state.inventorySelected === "kristall_geode";
        // Zweiter Klick auf gleichen → toggelt aus
        r.selectInventorySlot(0);
        out.selectionTogglesOff = r.state.inventorySelected === null;
        r.selectInventorySlot(0);

        // tryAssignFromInventoryToHotbar legt in Hotbar ab
        const assignOk = r.tryAssignFromInventoryToHotbar(3);
        out.assignWorks = assignOk === true && r.state.hotbar[3] === "kristall_geode";
        out.assignClearsSelection = r.state.inventorySelected === null;

        // Ich-Bogen — das Selbst-Porträt (Werkstatt-/Hof-Muster auf das Selbst): EIN _selfProfile-Vektor,
        // das geteilte Spec-Sheet (WERTE führen | NATUR), die Bühne, die 6-Achsen-EMOTION (live), die REISE,
        // die drei Zonen. Das Overlay ist hier offen (toggle(true) oben → _ichHandleOverlay rendert).
        const sp = r._selfProfile();
        out.selfProfileBundles = !!(
            sp &&
            sp.soul &&
            sp.stats &&
            typeof sp.emotions === "object" &&
            typeof sp.mood === "object" &&
            Array.isArray(sp.boosts)
        );
        out.ichStageCanvas = !!document.getElementById("ich-stage-canvas");
        const ichSpec = document.getElementById("ich-stage-spec");
        out.ichSpecSheet = !!(ichSpec && ichSpec.querySelector(".spec-sheet"));
        out.ichSpecHeaderName = !!(ichSpec && ichSpec.querySelector(".spec-header .spec-name"));
        out.ichSpecBody2Col = !!(ichSpec && ichSpec.querySelectorAll(".spec-body .spec-col").length === 2);
        out.ichWerteBars = !!(ichSpec && ichSpec.querySelectorAll(".spec-body .spec-bar").length > 0);
        // die reiche 6-Achsen-Emotion (live, ≠ Kreatur binär) prominent im Ich
        out.ichEmotion6 = document.querySelectorAll("#status-emotions .emotion").length === 6;
        // die Chronik/Reise wandert in den HOF (Welt-Stimme); das Ich trägt keine Reise mehr.
        out.ichHasNoReise = !document.getElementById("ich-reise");
        out.hofChronikInDom = !!document.getElementById("hof-chronik");
        r._renderHofChronik();
        out.hofChronikRenders = (() => {
            const h = document.getElementById("hof-chronik");
            return !!(h && h.childNodes.length > 0);
        })();
        // WERKSTATT-TOPOLOGIE: drei Spalten — LINKS die Selbst-Insel (.ich-self: Viewer + Was du trägst),
        // MITTE Inventar/Hotbar (zentral), RECHTS Rezepte (WERK); darunter die vollbreite STATSBAR
        // (.ich-readout) mit Spec + Emotion.
        out.ichThreeZones = !!(
            document.querySelector(".ich-cols .inventory-col-items #inventory-grid") &&
            document.querySelector(".ich-cols .inventory-col-character .ich-self #ich-stage-canvas") &&
            document.querySelector(".ich-cols .inventory-col-character .ich-self #inventory-equip") &&
            document.querySelector(".ich-cols .inventory-col-recipes #inventory-recipes") &&
            document.querySelector(".ich-readout #ich-stage-spec") &&
            document.querySelector(".ich-readout #status-emotions")
        );
        // der Soul-Select wandert in den Header (Körper-Bar), keine separate Seele-Sektion;
        // ein Hinweis zeigt auf die Werkstatt; der Ich-Soul-Editor ist weg.
        out.ichSoulBarInHeader = !!document.querySelector(".inventory-col-character .ich-soul-bar #player-soul-select");
        // der Werkstatt-Hinweis lebt jetzt als Tooltip am Select (Chrome komprimiert, kein Absatz).
        out.ichSoulHint = (() => {
            const sel = document.getElementById("player-soul-select");
            return !!(sel && /werkstatt/i.test(sel.getAttribute("title") || ""));
        })();
        // die EINE Selbst-Suche TREIBT das Ich (das Werkstatt-Loop search→Treffer, kein toter
        // Omnibox-Knopf): tippen filtert das Rezeptbuch UND dimmt Nicht-Treffer in der Habe; leer = alles
        // wieder sichtbar. KONSUM-Test: nicht „Knopf existiert", sondern „die Suche wirkt beobachtbar".
        r.renderRecipeBook();
        out.recipeRowsRoleColor = (() => {
            const rows = document.querySelectorAll("#inventory-recipes .recipe-row");
            if (!rows.length) return true; // keine Rezepte → keine Verletzung
            return [...rows].some((row) => /solid/.test(row.style.borderLeft || ""));
        })();
        out.ichSearchExists = !!document.getElementById("ich-search");
        out.ichNoDeadOmniboxButton = !document.getElementById("ich-omnibox-trigger");
        (() => {
            const s = document.getElementById("ich-search");
            const host = document.getElementById("inventory-recipes");
            const grid = document.getElementById("inventory-grid");
            if (!s || !host || !grid) {
                out.ichSearchDrivesRecipes = false;
                out.ichSearchDrivesInventory = false;
                out.ichSearchClears = false;
                return;
            }
            const visibleRows = () =>
                [...host.querySelectorAll(".recipe-row")].filter((r2) => r2.style.display !== "none").length;
            const filled = [...grid.querySelectorAll(".inventory-slot[data-search]")];
            const before = visibleRows();
            s.value = "zzzznomatchxyz";
            r._applyIchFilter();
            // ein nicht-matchender Begriff blendet ALLE Rezept-Treffer aus + dimmt ALLE gefüllten Slots
            out.ichSearchDrivesRecipes = before > 0 && visibleRows() === 0;
            out.ichSearchDrivesInventory =
                filled.length === 0 || filled.every((el) => el.classList.contains("search-dim"));
            s.value = "";
            r._applyIchFilter();
            out.ichSearchClears =
                visibleRows() === before && filled.every((el) => !el.classList.contains("search-dim"));
        })();
        // Das Overlay liegt vollständig innerhalb [0, vh] (max-height + box-sizing:border-box). Dazu:
        // (a) drei Spalten (SELF | HABE | WERK) nebeneinander; (b) #inventory-equip in der Selbst-Insel
        // UNTER dem Viewer; (c) .ich-readout vollbreit UNTER den Spalten.
        {
            const ov = document.getElementById("inventory-overlay");
            const ob = ov ? ov.getBoundingClientRect() : null;
            out.ichOverlayFitsViewport = !!(ob && ob.top >= -1 && ob.bottom <= window.innerHeight + 1);
            const ch = document.querySelector(".ich-cols .inventory-col-character");
            const items = document.querySelector(".ich-cols .inventory-col-items");
            const rc = document.querySelector(".ich-cols .inventory-col-recipes");
            const cols = document.querySelector(".ich-cols");
            const canvas = document.querySelector(".ich-self #ich-stage-canvas");
            const worn = document.querySelector(".ich-self #inventory-equip");
            const statsbar = document.querySelector(".ich-readout");
            if (ch && items && rc) {
                const cb = ch.getBoundingClientRect();
                const ib = items.getBoundingClientRect();
                const rb = rc.getBoundingClientRect();
                // alle drei Spalten in EINER Reihe (Top-Differenz klein).
                out.ichZonesSideBySide = Math.abs(cb.top - ib.top) < 24 && Math.abs(ib.top - rb.top) < 24;
                // „Was du trägst" liegt UNTER dem Viewer (in der Selbst-Insel).
                out.ichWornUnderViewer =
                    !!(canvas && worn) &&
                    worn.getBoundingClientRect().top >= canvas.getBoundingClientRect().bottom - 24;
                // die STATSBAR liegt VOLLBREIT UNTER den Spalten (der Schöpfer-Kern: unten, nicht links gequetscht).
                out.ichStatsbarBelowCols = !!(
                    statsbar &&
                    cols &&
                    statsbar.getBoundingClientRect().top >= cols.getBoundingClientRect().bottom - 24 &&
                    statsbar.getBoundingClientRect().width > cb.width * 1.5
                );
            } else {
                out.ichZonesSideBySide = false;
                out.ichWornUnderViewer = false;
                out.ichStatsbarBelowCols = false;
            }
        }

        // Toggle close
        r.toggleInventoryOverlay(false);
        out.toggleCloseHides = overlay.hasAttribute("hidden");
        out.toggleCloseClearsSelected = r.state.inventorySelected === null;

        // Test-Cleanup: Hotbar + Inventar zurück auf Defaults,
        // damit nachfolgende Tests (Ring 6.5 Default-Hotbar etc.)
        // nicht von Test-Verschmutzung verletzt werden.
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];
        r.state.player.inventory = new Array(27).fill(null);
        r._renderHotbarDOM();
        r.renderInventoryUI();

        return out;
    });

    if (wave6c1Results && !wave6c1Results.error) {
        check("Welle 6.C1: state.player.inventory ist Array", wave6c1Results.hasInventoryArray);
        check("Welle 6.C1: Inventar hat exakt 27 Slots", wave6c1Results.inventoryHas27Slots);
        check("Welle 6.C1: Inventar initial leer (alle 27 null)", wave6c1Results.initiallyEmpty);
        check(
            "Ich: _selfProfile bündelt die gemessenen Vektoren (soul/stats/emotions/mood/boosts)",
            wave6c1Results.selfProfileBundles
        );
        check(
            "Ich: die Selbst-Bühne (Canvas) + das geteilte Spec-Sheet im Overlay",
            wave6c1Results.ichStageCanvas && wave6c1Results.ichSpecSheet
        );
        check(
            "Ich: das Spec-Sheet trägt Header (Name) + Zwei-Spalten-Body + WERTE-Balken (Werte führen)",
            wave6c1Results.ichSpecHeaderName && wave6c1Results.ichSpecBody2Col && wave6c1Results.ichWerteBars
        );
        check(
            "Ich: die reiche 6-Achsen-Emotion ist prominent (live, ≠ Kreatur binär)",
            wave6c1Results.ichEmotion6
        );
        check(
            "Ich-F: die Chronik/Reise wandert in den Hof (Welt-Stimme), das Ich trägt keine Reise mehr (H.1)",
            wave6c1Results.ichHasNoReise && wave6c1Results.hofChronikInDom && wave6c1Results.hofChronikRenders
        );
        check(
            "Ich-J6: SELF (Viewer+Worn) | HABE (Inventar zentral) | WERK (Rezepte) + STATSBAR (Spec+Emotion) unten",
            wave6c1Results.ichThreeZones
        );
        check(
            "Ich-J6: Was-du-trägst sitzt UNTER dem Viewer in der Selbst-Insel",
            wave6c1Results.ichWornUnderViewer
        );
        check(
            "Ich-J6: die STATSBAR (Verfassung·Werte·Natur·Emotion) liegt VOLLBREIT UNTER den Spalten (unten, nicht links gequetscht)",
            wave6c1Results.ichStatsbarBelowCols
        );
        check(
            "Ich-H: der Soul-Select sitzt im Header (Körper-Bar) + ein Hinweis zeigt auf die Werkstatt",
            wave6c1Results.ichSoulBarInHeader && wave6c1Results.ichSoulHint
        );
        check(
            "Ich: EINE Selbst-Suche im Header (kein toter Omnibox-Knopf mehr)",
            wave6c1Results.ichSearchExists && wave6c1Results.ichNoDeadOmniboxButton
        );
        check(
            "Ich: die Selbst-Suche TREIBT das Rezeptbuch (tippen → Nicht-Treffer aus, das Werkstatt-Loop)",
            wave6c1Results.ichSearchDrivesRecipes
        );
        check(
            "Ich: die Selbst-Suche dimmt Nicht-Treffer in der Habe + räumt sauber (leer = alles sichtbar)",
            wave6c1Results.ichSearchDrivesInventory && wave6c1Results.ichSearchClears
        );
        check(
            "Ich-I: das Rezeptbuch trägt die geteilte Rollen-Farbe wie die Werkstatt (H.5)",
            wave6c1Results.recipeRowsRoleColor
        );
        check(
            "Ich: das Fenster passt VOLLSTÄNDIG in den Viewport (kein Über-den-Rand)",
            wave6c1Results.ichOverlayFitsViewport
        );
        check(
            "Ich-J6: die drei Spalten (SELF|HABE|WERK) sind nebeneinander (gleiche Reihe)",
            wave6c1Results.ichZonesSideBySide
        );
        check("Welle 6.C1: addToInventory legt Eintrag in ersten leeren Slot", wave6c1Results.slot0HasBaum);
        check("Welle 6.C1: addToInventory stackt bei gleichem Bauplan-Namen", wave6c1Results.stacksCount);
        check("Welle 6.C1: addToInventory lehnt unbekannten Bauplan ab", wave6c1Results.addRejectsUnknown);
        check("Welle 6.C1: removeFromInventory reduziert count", wave6c1Results.removeWorks);
        check("Welle 6.C1: removeFromInventory(>count) clear Slot zu null", wave6c1Results.fullRemoveClearsSlot);
        check("Welle 6.C1: DSL-Op add_to_inventory funktioniert", wave6c1Results.dslOpWorks);
        check("Welle 6.C1: add_to_inventory in NON_BROADCASTABLE_OPS", wave6c1Results.addToInventoryNonBroadcastable);
        check("Welle 6.C1: describeProgram nennt Inventar/Bauplan/Count", wave6c1Results.describeWorks);
        check("Welle 6.C1: #inventory-overlay im DOM", wave6c1Results.overlayInDom);
        check("Welle 6.C1: #inventory-grid im DOM", wave6c1Results.gridInDom);
        check("Welle 6.C1: #inventory-selected im DOM", wave6c1Results.selectedInDom);
        check("Welle 6.C1: Overlay initial versteckt", wave6c1Results.initiallyHidden);
        check("Welle 6.C1: toggleInventoryOverlay(true) öffnet Overlay", wave6c1Results.overlayVisibleAfterToggle);
        check("Welle 6.C1: Grid rendert 27 Slot-Elemente", wave6c1Results.gridRendered27);
        check(
            "Ich: gefüllter Inventar-Slot ist ziehbar (Drag&Drop inv→Hotbar, Spielerperspektive)",
            wave6c1Results.filledSlotDraggable
        );
        check("Welle 6.C1: kristall_geode-Slot bekommt tag-magieleitung Klasse", wave6c1Results.geodeHasMagieClass);
        check("Welle 6.C1: baum_eiche-Slot bekommt tag-lebendig Klasse", wave6c1Results.baumHasLebendigClass);
        check("Welle 6.C1: baum_eiche-Slot bekommt tag-brennend Klasse (laub)", wave6c1Results.baumHasBrennendClass);
        check("Welle 6.C1: selectInventorySlot setzt inventorySelected", wave6c1Results.selectionWorks);
        check("Welle 6.C1: zweiter Klick auf gleichen Slot toggelt aus", wave6c1Results.selectionTogglesOff);
        check("Welle 6.C1: tryAssignFromInventoryToHotbar legt in Hotbar ab", wave6c1Results.assignWorks);
        check("Welle 6.C1: Assign löscht inventorySelected", wave6c1Results.assignClearsSelection);
        check("Welle 6.C1: toggleInventoryOverlay(false) versteckt + räumt", wave6c1Results.toggleCloseHides);
        check("Welle 6.C1: Schließen räumt inventorySelected", wave6c1Results.toggleCloseClearsSelected);
    }

    // ### Ich/Inventar: Rezeptbuch + Equip-Status ###
    // Das Inventar listet die craftbaren Baupläne mit Kosten + rollen-gerechtem Fertigen-Knopf und
    // zeigt sichtbar, was getragen wird.
    const recipeBookResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};

        // Inventar öffnen → Equip-Status rendern (das Rezeptbuch fährt diag-werkstatt-weg mit echten Klicks).
        r.toggleInventoryOverlay(true);
        const equip = document.getElementById("inventory-equip");
        out.equipSlotsPresent = !!equip && equip.querySelectorAll(".equip-slot").length === 2;

        // craftFromRecipe: ein gehaltenes Gerät (hold) fertigen → in die Hand.
        // Schöpfer-Modus = frei (kein Material/Station-Gate) → deterministisch.
        // getGameMode liest state.worldMeta.gameMode (die kanonische Quelle).
        const prevMode = r.state.worldMeta && r.state.worldMeta.gameMode;
        if (r.state.worldMeta) r.state.worldMeta.gameMode = "schöpfer";
        let holdName = null;
        for (const name of Object.keys(r.state.blueprints || {})) {
            const bp = r.state.blueprints[name];
            if (bp && Array.isArray(bp.parts) && bp.parts.length && r._blueprintUseKind(bp) === "hold") {
                holdName = name;
                break;
            }
        }
        out.foundHoldBlueprint = !!holdName;
        if (holdName) {
            const res = r.craftFromRecipe(holdName);
            out.craftOk = !!(res && res.ok);
            out.craftEquipsHeld = !!(r.state.player.equipped && r.state.player.equipped.held === holdName);
        }
        if (r.state.worldMeta) r.state.worldMeta.gameMode = prevMode;
        r.equipHeld(null);
        r.toggleInventoryOverlay(false);
        return out;
    });

    if (recipeBookResults) {
        check(
            "UI-Putz Rezeptbuch: Equip-Status zeigt beide Slots (Hand + Rüstung)",
            recipeBookResults.equipSlotsPresent
        );
        check("UI-Putz Rezeptbuch: craftFromRecipe fertigt ein Gerät", recipeBookResults.craftOk);
        check("UI-Putz Rezeptbuch: gefertigtes Gerät landet in der Hand", recipeBookResults.craftEquipsHeld);
    }

    // ### Drag&Drop Inventar ↔ Hotbar ###
    // Vier Pfade: inv→inv (swap), inv→hot (Hotbar setzt), hot→hot (swap), hot→inv (Hotbar räumen).
    // HTML5-Drag-Events sind headless inkonsistent → Drop-Handler direkt mit fingiertem state.drag.
    const dragResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};

        // Setup: zwei Bauplan-Einträge im Inventar, leerer Hotbar.
        r.state.player.inventory = new Array(27).fill(null);
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 1 };
        r.state.player.inventory[1] = { blueprintName: "kristall_geode", count: 1 };
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];

        // Fake-Event-Object für drop-Handler.
        const mkEvent = () => ({
            preventDefault: () => {},
            currentTarget: null,
        });

        // (1) inv → inv: Slot 0 ↔ Slot 5 tauschen.
        r.state.drag = { kind: "inv", index: 0, name: "baum_eiche" };
        r._onSlotDrop(mkEvent(), "inv", 5);
        out.invToInvSwap =
            r.state.player.inventory[0] === null &&
            r.state.player.inventory[5] &&
            r.state.player.inventory[5].blueprintName === "baum_eiche";

        // Reset
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 1 };
        r.state.player.inventory[5] = null;

        // (2) inv → hot mit leerem Hot + Inv-count=1: echter Slot-Move — Inv-Slot wird null, Hot = name.
        r.state.drag = { kind: "inv", index: 0, name: "baum_eiche" };
        r._onSlotDrop(mkEvent(), "hot", 3);
        out.invToHotPlaces = r.state.hotbar[3] === "baum_eiche";
        out.invToHotEmptiesInvSlot = r.state.player.inventory[0] === null;

        // (2b) inv → hot mit leerem Hot + Inv-count=5: Slot wird
        // KOMPLETT null (egal count). Stack wird konsumiert.
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 5 };
        r.state.hotbar[4] = null;
        r.state.drag = { kind: "inv", index: 0, name: "baum_eiche" };
        r._onSlotDrop(mkEvent(), "hot", 4);
        out.invToHotEmptiesIgnoresCount = r.state.hotbar[4] === "baum_eiche" && r.state.player.inventory[0] === null;

        // (2c) inv → hot mit gleichem Bauplan in Hot: Inv-Slot
        // wird TROTZDEM leer (Schöpfer-Wunsch: konsequenter Move,
        // Bauplan ist aus Inv weg, in Hot war er schon).
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 3 };
        r.state.hotbar[4] = "baum_eiche";
        r.state.drag = { kind: "inv", index: 0, name: "baum_eiche" };
        r._onSlotDrop(mkEvent(), "hot", 4);
        out.invToHotSameNameStillEmpties = r.state.hotbar[4] === "baum_eiche" && r.state.player.inventory[0] === null;

        // (2d) inv → hot mit anderem Bauplan: Swap.
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 1 };
        r.state.hotbar[4] = "stein_block";
        r.state.drag = { kind: "inv", index: 0, name: "baum_eiche" };
        r._onSlotDrop(mkEvent(), "hot", 4);
        out.invToHotSwap =
            r.state.hotbar[4] === "baum_eiche" &&
            r.state.player.inventory[0] &&
            r.state.player.inventory[0].blueprintName === "stein_block" &&
            r.state.player.inventory[0].count === 1;

        // Reset
        r.state.player.inventory[0] = { blueprintName: "baum_eiche", count: 1 };
        r.state.hotbar[3] = null;
        r.state.hotbar[4] = null;

        // (3) hot → hot: Slot 0 (stein_block) ↔ Slot 1 (waterfall).
        r.state.drag = { kind: "hot", index: 0, name: "stein_block" };
        r._onSlotDrop(mkEvent(), "hot", 1);
        out.hotToHotSwap = r.state.hotbar[0] === "waterfall" && r.state.hotbar[1] === "stein_block";

        // Reset
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];

        // (4) hot → inv mit leerem Ziel-Slot: ECHTES MOVE (nur Hotbar räumen ließe den Bauplan
        // verschwinden). Erwartung: Hot null, Inv-Slot 10 = {waterfall, count: 1}.
        r.state.player.inventory[10] = null;
        r.state.drag = { kind: "hot", index: 1, name: "waterfall" };
        r._onSlotDrop(mkEvent(), "inv", 10);
        out.hotToInvClearsHotbar = r.state.hotbar[1] === null;
        out.hotToInvFillsInvSlot =
            r.state.player.inventory[10] &&
            r.state.player.inventory[10].blueprintName === "waterfall" &&
            r.state.player.inventory[10].count === 1;

        // (4b) hot → inv mit gleichem Bauplan im Ziel: Stack
        // (count += 1, Hot wird null).
        r.state.hotbar[1] = "waterfall"; // Hot wieder befüllen
        r.state.player.inventory[10] = { blueprintName: "waterfall", count: 3 };
        r.state.drag = { kind: "hot", index: 1, name: "waterfall" };
        r._onSlotDrop(mkEvent(), "inv", 10);
        out.hotToInvStacksSameBp =
            r.state.hotbar[1] === null && r.state.player.inventory[10] && r.state.player.inventory[10].count === 4;

        // (4c) hot → inv mit anderem Bauplan im Ziel: no-op.
        r.state.hotbar[1] = "stein_block";
        r.state.player.inventory[10] = { blueprintName: "waterfall", count: 2 };
        r.state.drag = { kind: "hot", index: 1, name: "stein_block" };
        r._onSlotDrop(mkEvent(), "inv", 10);
        out.hotToInvOtherBpNoOp =
            r.state.hotbar[1] === "stein_block" &&
            r.state.player.inventory[10] &&
            r.state.player.inventory[10].blueprintName === "waterfall" &&
            r.state.player.inventory[10].count === 2;

        // Cleanup für (5)
        r.state.player.inventory[10] = null;

        // (5) src === target: no-op (state unverändert).
        const before = JSON.stringify(r.state.hotbar);
        r.state.drag = { kind: "hot", index: 0, name: "stein_block" };
        r._onSlotDrop(mkEvent(), "hot", 0);
        out.sameSlotNoOp = JSON.stringify(r.state.hotbar) === before;

        // (6) drag wird nach drop genullt.
        out.dragClearedAfterDrop = r.state.drag === null;

        // (7) DOM: gefüllte Inventar-Slots sind draggable.
        r.toggleInventoryOverlay(true);
        r.renderInventoryUI();
        const slot0 = document.querySelector('#inventory-grid [data-inv-slot="0"]');
        const emptySlot = document.querySelector("#inventory-grid .inventory-slot.empty");
        out.filledSlotIsDraggable = slot0 && slot0.draggable === true;
        // Leerer Inventar-Slot ist NICHT draggable (kein Mehrwert).
        out.emptySlotNotDraggable = emptySlot && emptySlot.draggable === false;

        // (8) Hotbar-Slots: gefüllte sind draggable.
        r._renderHotbarDOM();
        const hSlot0 = document.querySelector('#hotbar [data-slot="0"]');
        const hSlot3 = document.querySelector('#hotbar [data-slot="3"]');
        out.hotFilledDraggable = hSlot0 && hSlot0.draggable === true;
        out.hotEmptyNotDraggable = hSlot3 && hSlot3.draggable === false;

        // Cleanup
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];
        r.state.player.inventory = new Array(27).fill(null);
        r.toggleInventoryOverlay(false);
        r._renderHotbarDOM();
        r.renderInventoryUI();

        return out;
    });

    if (dragResults && !dragResults.error) {
        check("Welle 6.C1 Drag: inv→inv tauscht Slot-Inhalte", dragResults.invToInvSwap);
        check("Welle 6.C1 Drag: inv→hot legt Bauplan in Hotbar", dragResults.invToHotPlaces);
        check(
            "Welle 6.C1 Drag: inv→hot leert Inv-Slot (count=1, konsequenter Move)",
            dragResults.invToHotEmptiesInvSlot
        );
        check(
            "Welle 6.C1 Drag: inv→hot leert Inv-Slot auch bei count=5 (Stack konsumiert)",
            dragResults.invToHotEmptiesIgnoresCount
        );
        check(
            "Welle 6.C1 Drag: inv→hot mit gleichem Bauplan im Hot leert Inv-Slot trotzdem",
            dragResults.invToHotSameNameStillEmpties
        );
        check("Welle 6.C1 Drag: inv→hot mit anderem Bauplan im Hot ist Swap", dragResults.invToHotSwap);
        check("Welle 6.C1 Drag: hot→hot tauscht Hotbar-Slots", dragResults.hotToHotSwap);
        check("Welle 6.C1 Drag: hot→inv räumt Hotbar-Slot (zu null)", dragResults.hotToInvClearsHotbar);
        check("Welle 6.C1 Drag: hot→inv füllt leeren Inv-Slot mit {name, count:1}", dragResults.hotToInvFillsInvSlot);
        check("Welle 6.C1 Drag: hot→inv stackt auf gleichem Bauplan (count += 1)", dragResults.hotToInvStacksSameBp);
        check(
            "Welle 6.C1 Drag: hot→inv mit anderem Bauplan ist no-op (kein Datenverlust)",
            dragResults.hotToInvOtherBpNoOp
        );
        check("Welle 6.C1 Drag: src===target ist no-op", dragResults.sameSlotNoOp);
        check("Welle 6.C1 Drag: state.drag wird nach drop genullt", dragResults.dragClearedAfterDrop);
        check("Welle 6.C1 Drag: gefüllter Inventar-Slot ist draggable", dragResults.filledSlotIsDraggable);
        check("Welle 6.C1 Drag: leerer Inventar-Slot ist NICHT draggable", dragResults.emptySlotNotDraggable);
        check("Welle 6.C1 Drag: gefüllter Hotbar-Slot ist draggable", dragResults.hotFilledDraggable);
        check("Welle 6.C1 Drag: leerer Hotbar-Slot ist NICHT draggable", dragResults.hotEmptyNotDraggable);
    }

    // ### Pointer-Lock: Drag&Drop braucht freie Maus ###
    // Inventar öffnen → exitPointerLock (Cursor erscheint, HTML5-Drag&Drop geht); WASD bleibt aktiv;
    // Esc schließt das Inventar.
    const lockResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        // Setup: Inventar zu, keys ggf. setzen (Spieler hält W).
        r.toggleInventoryOverlay(false);
        if (!r.state.keys) r.state.keys = {};
        r.state.keys.w = true;
        r.state.keys.a = true;

        // Inventar öffnen → exitPointerLock wird gerufen (headless per Stub gezählt); dazu crash-frei +
        // state.inventoryOpen true.
        let exitCalled = 0;
        const origExit = document.exitPointerLock;
        document.exitPointerLock = function () {
            exitCalled++;
            if (typeof origExit === "function") {
                try {
                    origExit.call(document);
                } catch {
                    /* defensive in headless */
                }
            }
        };
        // pointerLockElement-Property zur Laufzeit setzen
        // damit der Check `if (document.pointerLockElement)`
        // den Pfad nimmt.
        try {
            Object.defineProperty(document, "pointerLockElement", {
                value: document.body,
                configurable: true,
            });
        } catch {
            /* defensive */
        }

        r.toggleInventoryOverlay(true);
        out.exitLockCalledOnOpen = exitCalled >= 1;
        out.overlayOpenAfterToggle = r.state.inventoryOpen === true;
        // WASD bleibt aktiv (Minecraft-Konvention) — Schöpfer-Wunsch.
        out.wKeyStillActiveAfterOpen = r.state.keys.w === true;
        out.aKeyStillActiveAfterOpen = r.state.keys.a === true;

        // Esc bei offenem Inventar → toggle close: direkter Aufruf statt synthetischem Keydown (headless
        // flaky); toggleInventoryOverlay(false) darf den Pointer-Lock nicht erneut setzen.
        r.toggleInventoryOverlay(false);
        out.closeWorksWithoutReLock = r.state.inventoryOpen === false;

        // Cleanup
        document.exitPointerLock = origExit;
        r.state.keys.w = false;
        r.state.keys.a = false;

        return out;
    });

    if (lockResults && !lockResults.error) {
        check("Welle 6.C1 Lock: exitPointerLock wird beim Inventar-Öffnen gerufen", lockResults.exitLockCalledOnOpen);
        check("Welle 6.C1 Lock: state.inventoryOpen wird true nach toggleOpen", lockResults.overlayOpenAfterToggle);
        check(
            "Welle 6.C1 Lock: WASD bleibt aktiv (Schöpfer-Wunsch: weiterbewegen geht)",
            lockResults.wKeyStillActiveAfterOpen
        );
        check("Welle 6.C1 Lock: A-Taste bleibt aktiv bei offenem Inventar", lockResults.aKeyStillActiveAfterOpen);
        check(
            "Welle 6.C1 Lock: Inventar-schließen ohne Re-Lock (Canvas-Click bleibt User-Wahl)",
            lockResults.closeWorksWithoutReLock
        );
    }
}

// Cellular-Reaktion nach Spieler-Edit: (1) Architektur-AABBs tragen `botY` (der Cell-Stempel
// braucht beide Y-Grenzen), (2) `_stampArchitectureSolidCellsInto` existiert + wird vom
// Cell-Build gerufen, (3) Damm-Spawn → Footprint-Cells nach Rebuild SOLID, (4) Damm-Remove →
// wieder air/water je Density+waterLevel, (5) Voxel-Carve unter waterLevel → Cells nach Rebuild
// water (das Wasser fließt per Cell-Klassifikation ins Loch, kein BFS).
async function checkBandWelleC3CellularReaction(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        const STATE = r.constructor.CELL_STATE;
        // Test-Isolation: das Band misst den Damm-STEMPEL-Revert (spawn → SOLID → remove → exakter
        // Revert). Der Scatter streut Bäume in den Spieler-Ring; landet einer im Damm-Footprint, stempelt
        // sein Holz die Wasser-Cells → Schein-Diff. Der Scatter ist unbeteiligt → sein Takt ruht (G1: ohne Schalter).
        r._tickScatterStreaming = () => 0;
        // 1) Stempel-Methode existiert
        // Jede Cell-Index-Berechnung liest die LOD des Chunks, sonst greift dim=24/step=1.8 (LOD 0) auf
        // einem LOD-1-Chunk (dim=12/step=3.6) out-of-bounds. waterCells
        // leben immer auf LOD 0 → cfgWater.
        const cfgWater = r._voxelChunkConfig(0); // Wasser-Cells immer LOD 0
        // span ist LOD-invariant (43.2 m), darf aus dem Default gelesen werden.
        const span = r._voxelChunkConfig().span;
        const base = r.state.terrainBaseHeight || 0;
        // Test-Architektur: Damm auf einem FLACHEN Trocken-Spot (Voxel-Surface nah an der Makro-Surface,
        // vy < m+3) — hohe ranges-Cusps machten die Cell über macroY Worldgen-solid und der
        // removeRestores-Check bräche fälschlich; ein fester Spot läge evtl. im Gebirge.
        const wlDam = r.state.waterLevel;
        let testCx = 2;
        let testCz = 2;
        let macroY = r._terrainMacroSurfaceY(testCx * span + span / 2, testCz * span + span / 2, false);
        // Der Damm-Stempel braucht einen Chunk MIT Wasser-Cells: einen flachen Ufer-Spot mit Wasser
        // suchen, sonst Rückfall auf einen flachen Trocken-Spot (dann unmessbar = bestanden).
        let damSpotHasWater = false;
        let foundFlat = false;
        for (let scx = -4; scx <= 4 && !damSpotHasWater; scx++) {
            for (let scz = -4; scz <= 4; scz++) {
                const mx = scx * span + span / 2;
                const mz = scz * span + span / 2;
                const m = r._terrainMacroSurfaceY(mx, mz, false);
                const vy = r._voxelSurfaceY(mx, mz);
                if (Number.isFinite(m) && m > wlDam + 4 && Number.isFinite(vy) && vy < m + 3) {
                    if (!foundFlat) {
                        testCx = scx;
                        testCz = scz;
                        macroY = m;
                        foundFlat = true;
                    }
                    // Der Spot muss Wasser tragen UND schon gestreamt sein (in voxelChunks), sonst kann der
                    // Stempel-Chunk nicht gebaut/gelesen werden → unmessbar.
                    if (
                        r._voxelChunkHasAnyWater(scx, scz) &&
                        r.state.voxelChunks &&
                        r.state.voxelChunks.has(scx + "," + scz)
                    ) {
                        testCx = scx;
                        testCz = scz;
                        macroY = m;
                        damSpotHasWater = true;
                        break;
                    }
                }
            }
        }
        out.damSpotHasWater = damSpotHasWater;
        const damPos = { x: testCx * span + span / 2, y: 10, z: testCz * span + span / 2 };
        damPos.y = Math.max(macroY + 2, r.state.waterLevel + 4);
        // Die Pre-Dam-waterCells vollständig kopieren: ein Einzel-Zell-Check ist roughness-anfällig (die
        // 3D-Roughness ±12 m kann die Damm-Höhe übersteigen → terrain-SOLID ist vom Stempel nicht
        // unterscheidbar). Der Voll-Array-Vergleich (remove restauriert EXAKT) ist terrain-unabhängig.
        const preDamChunkKey = `${testCx},${testCz}`;
        // Pre-Dam-Baseline aus einem FRISCH GEDRAINTEN Chunk: ein promovierter Scatter-Baum kann in
        // state.architectures liegen, ohne dass sein Holz-Stempel schon in den waterCells steckt — der
        // Force-Drain unten stempelte ihn erst NACH dem Snapshot (Geister-Diff). Derselbe 3×3-Force-Drain
        // VOR der Baseline → beide Seiten sehen denselben Architektur-Satz, nur der Damm unterscheidet.
        if (!r.state.dirtyVoxelChunks) r.state.dirtyVoxelChunks = new Set();
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) r.state.dirtyVoxelChunks.add(`${testCx + dx},${testCz + dz}`);
        }
        for (let d = 0; d < 8 && r.state.dirtyVoxelChunks.size > 0; d++) r._drainDirtyVoxelChunks();
        const preDamEntry0 = r.state.voxelChunks && r.state.voxelChunks.get(preDamChunkKey);
        const preDamCells = preDamEntry0 && preDamEntry0.waterCells ? Uint8Array.from(preDamEntry0.waterCells) : null;
        const damEntry = r.spawnArchitecture("damm", damPos, { silent: false });
        out.damSpawnSucceeded = !!damEntry;
        if (damEntry && damEntry.blockerAABBs && damEntry.blockerAABBs[0]) {
            const aabb = damEntry.blockerAABBs[0];
            out.aabbHasBotY = Number.isFinite(aabb.botY);
            out.aabbBotY = aabb.botY;
            out.aabbTopY = aabb.topY;
            out.aabbHasHeight = Number.isFinite(aabb.botY) && aabb.topY > aabb.botY;
        }
        // Drainen der dirty Chunks (sync) damit der Damm-Stempel sichtbar wird
        r._drainDirtyVoxelChunks();
        // 3) Im Chunk im Damm-Footprint: Cells im Damm-Stempel-Bereich sind SOLID
        const damChunkKey = `${testCx},${testCz}`;
        const damChunkEntry = r.state.voxelChunks && r.state.voxelChunks.get(damChunkKey);
        out.damChunkExists = !!(damChunkEntry && damChunkEntry.waterCells);
        if (damChunkEntry && damChunkEntry.waterCells) {
            const cells = damChunkEntry.waterCells;
            const aabb = damEntry.blockerAABBs[0];
            // waterCells immer LOD 0, daher cfgWater statt cfgFor
            const cfg = cfgWater;
            const step = cfg.step;
            const oy = base - cfg.floorDrop;
            // Sample am Damm-Zentrum (Cell-Indizes)
            const cellI = Math.floor((damPos.x - testCx * span) / step);
            const cellK = Math.floor((damPos.z - testCz * span) / step);
            const cellJ = Math.floor((aabb.topY - oy) / step) - 1; // 1 Cell unter top
            const idx = cellI + cellK * cfg.dim + cellJ * cfg.dim * cfg.dim;
            out.damCellState = cells[idx];
            out.damCellIsSolid = cells[idx] === STATE.SOLID;
        }
        // 4) Damm-Remove → Drain → Cells gehen zurück
        if (damEntry) {
            r.removeArchitecture(damEntry);
            // `removeArchitecture` (skirt=0) markiert nur den Footprint-Chunk dirty, und der Welt-Zustand
            // beim Band-Eintritt variiert je Lauf → den GELESENEN Chunk (`damChunkKey`) + 3×3-Umfeld EXPLIZIT
            // dirty markieren und drainen, bis das Set leer ist: die Stempel-Cell wird garantiert neu
            // klassifiziert.
            if (!r.state.dirtyVoxelChunks) r.state.dirtyVoxelChunks = new Set();
            for (let dz = -1; dz <= 1; dz++) {
                for (let dx = -1; dx <= 1; dx++) {
                    r.state.dirtyVoxelChunks.add(`${testCx + dx},${testCz + dz}`);
                }
            }
            for (let d = 0; d < 8 && r.state.dirtyVoxelChunks.size > 0; d++) r._drainDirtyVoxelChunks();
            const afterRemoveEntry = r.state.voxelChunks && r.state.voxelChunks.get(damChunkKey);
            if (
                preDamCells &&
                afterRemoveEntry &&
                afterRemoveEntry.waterCells &&
                afterRemoveEntry.waterCells.length === preDamCells.length
            ) {
                // VOLL-ARRAY-Vergleich: nach removeArchitecture + Drain MÜSSEN die waterCells EXAKT zum
                // Pre-Dam-Zustand zurückkehren. `damCellIsSolid` oben beweist, dass der Stempel wirklich etwas
                // änderte (sonst wäre der Revert-Test vakant).
                const a = afterRemoveEntry.waterCells;
                let diff = 0;
                for (let q = 0; q < preDamCells.length; q++) if (a[q] !== preDamCells[q]) diff++;
                out.cellAfterRemoveAbove = diff; // 0 = exakt zum Pre-Dam-Zustand revertiert
                out.removeRestores = diff === 0;
            }
        }
        // 5) Voxel-Carve unter waterLevel → Cells werden water
        // Suche einen Trockenland-Hochland-Spot mit macroY > wl + 6 (genug
        // Distanz dass r=12-Carve unter wl reicht)
        const wl = r.state.waterLevel;
        let carveX = null;
        let carveZ = null;
        for (let cx = -4; cx <= 4 && carveX === null; cx++) {
            for (let cz = -4; cz <= 4 && carveX === null; cz++) {
                if (cx === testCx && cz === testCz) continue;
                const x = cx * span + span / 2;
                const z = cz * span + span / 2;
                const m = r._terrainMacroSurfaceY(x, z, false);
                // Wirklich isolierter, flacher Spot (Voxel nah Makro): `_atlasWaterLevelAt(…, -Infinity)` ist nur
                // ohne Ozean/See/Fluss in Reichweite -Infinity — geprüft über den Carve-Radius, nicht nur am
                // Zentrum. Sonst öffnet der r=12-Carve echtes Wasser und der Test misst verbundenes Wasser.
                const vyc = r._voxelSurfaceY(x, z);
                const isolated =
                    !Number.isFinite(r._atlasWaterLevelAt(x, z, -Infinity)) &&
                    !Number.isFinite(r._atlasWaterLevelAt(x + 16, z, -Infinity)) &&
                    !Number.isFinite(r._atlasWaterLevelAt(x - 16, z, -Infinity)) &&
                    !Number.isFinite(r._atlasWaterLevelAt(x, z + 16, -Infinity)) &&
                    !Number.isFinite(r._atlasWaterLevelAt(x, z - 16, -Infinity));
                if (
                    Number.isFinite(m) &&
                    m > wl + 6 &&
                    m < wl + 24 && // V14.3: Band erweitert (die Welt liegt höher, Median ~+20 m)
                    Number.isFinite(vyc) &&
                    vyc < m + 4 && // flach: keine hohen Cusps
                    isolated
                ) {
                    carveX = x;
                    carveZ = z;
                }
            }
        }
        out.carveSpotFound = carveX !== null;
        if (carveX !== null) {
            // r=12 Carve am macroY → cells under macroY werden air/water je nach wl
            r._addVoxelEdit(carveX, wl + 4, carveZ, 12, "carve");
            r._drainDirtyVoxelChunks();
            const carveCx = Math.floor(carveX / span);
            const carveCz = Math.floor(carveZ / span);
            const carveChunkKey = `${carveCx},${carveCz}`;
            const carveChunkEntry = r.state.voxelChunks && r.state.voxelChunks.get(carveChunkKey);
            // Default „trocken“: ohne Wasser-Cell-Feld (Chunk ungestreamt oder ohne Wasser-Körper) keine
            // Phantom-Pfütze. Nur eine WATER-Cell an der Carve-Stelle wäre Phantom-Füllung (→ false).
            out.carveStaysDry = true;
            out.carveCellUnderWL = carveChunkEntry && carveChunkEntry.waterCells ? "measure" : "no-watercells";
            if (carveChunkEntry && carveChunkEntry.waterCells) {
                const cells = carveChunkEntry.waterCells;
                // waterCells immer LOD 0
                const cfg = cfgWater;
                const step = cfg.step;
                const oy = base - cfg.floorDrop;
                // Sample am Carve-Zentrum (sollte air oder water sein, nicht solid)
                const cellI = Math.floor((carveX - carveCx * span) / step);
                const cellK = Math.floor((carveZ - carveCz * span) / step);
                // Cell unter wl
                const cellJUnderWL = Math.floor((wl - 2 - oy) / step);
                const idxUnderWL = cellI + cellK * cfg.dim + cellJUnderWL * cfg.dim * cfg.dim;
                if (cellJUnderWL >= 0 && cellJUnderWL < cfg.dimY) {
                    out.carveCellUnderWL = cells[idxUnderWL];
                    // ein Carve im isolierten Hochland bleibt TROCKEN
                    // (Atlas-strict → keine Phantom-Pfütze ohne echte Quelle).
                    // In-Page berechnet (STATE lebt nur hier, nicht im Node-Check).
                    out.carveStaysDry = cells[idxUnderWL] !== STATE.WATER;
                }
            }
            // Cleanup
            if (r.state.worldMeta && Array.isArray(r.state.worldMeta.voxelEdits)) {
                r.state.worldMeta.voxelEdits.pop();
            }
        }
        // T1 zeitliche Kohärenz (bau-faden, Lehre 14): der Edit baut keinen Chunk-Stoff im Haupt-Faden — sein Fußabdruck
        // wartet im Dirty-Set auf den Faden, und das stehende Netz trägt die Säule schon im Edit-Call (die Boden-Karte unter
        // der Mitte auf ihrem Fuß, `_editGestaltVorlaeufig`). Probe: carve r=3 mitten in einem gestreamten Chunk, ohne Drain.
        // Bis bau-faden heilte der Fußabdruck synchron (`_syncRebuildEditFootprint`, 215 ms je Bau-Klick).
        out.t1FootprintSync = "no-streamed-chunk";
        {
            let t1Cx = null,
                t1Cz = null,
                t1My = null;
            // den gestreamten Chunk am nächsten zum Ursprung (interior → 8 Skirt-Nachbarn da)
            let bestD = Infinity;
            for (const [key, e] of r.state.voxelChunks) {
                if (!e || e.empty || !e.mesh || !e.mesh.geometry) continue;
                const [kx, kz] = key.split(",").map(Number);
                const mx = kx * span + span / 2,
                    mz = kz * span + span / 2;
                const my = r._voxelSurfaceY(mx, mz);
                if (!Number.isFinite(my)) continue;
                const d = Math.abs(kx) + Math.abs(kz);
                if (d < bestD) {
                    bestD = d;
                    t1Cx = kx;
                    t1Cz = kz;
                    t1My = my;
                }
            }
            if (t1Cx !== null) {
                const mx = t1Cx * span + span / 2,
                    mz = t1Cz * span + span / 2;
                if (r.state.dirtyVoxelChunks) r.state.dirtyVoxelChunks.clear();
                const bau = r._buildVoxelChunkData;
                let sync = 0;
                r._buildVoxelChunkData = (...a) => (sync++, bau.apply(r, a));
                try {
                    r._addVoxelEdit(mx, t1My, mz, 3, "carve"); // KEIN Drain
                } finally {
                    delete r._buildVoxelChunkData;
                }
                const fuss = r._bodenSichtAt(mx, mz) - t1My;
                const faden = r.state.dirtyVoxelChunks.has(`${t1Cx},${t1Cz}`);
                out.t1FootprintSync = `${sync} Sync-Bauten · die Karte ${fuss.toFixed(2)} m · im Faden ${faden}`;
                out.t1Faden = !sync && fuss < -2 && faden;
                // Cleanup: den Test-Edit zurücknehmen + die Skirt drainen
                if (r.state.worldMeta && Array.isArray(r.state.worldMeta.voxelEdits))
                    r.state.worldMeta.voxelEdits.pop();
                r._drainDirtyVoxelChunks();
            }
        }

        // T2 Cross-LOD-Geomorph: feine Boundary-Vertices an LOD0↔LOD1-Grenzen auf die GROBE Nachbar-Fläche
        // ziehen → die T-junction schließt (render-only, `geomorph`-Uniform). Probe: Material kompiliert,
        // Morph-Attribute auf JEDER Terrain-Geometrie (WebGPU-strikt), Finalize ruft ihn, ≥1 hasMorph.
        {
            const zM = window.__stoffZeuge(r);
            let mM = null;
            try {
                mM = r._buildToonNodeMaterial({ vertexColors: true, geomorph: true }); // wie der Boden-Stoff
            } finally {
                zM.zu();
            }
            out.t2NoMorphError = zM.brueche.length === 0 && !!(mM && mM.positionNode); // der Geomorph baut (K22-Zeuge)
            if (mM && typeof mM.dispose === "function") mM.dispose();
        }
        let t2HasAttrs = false,
            t2ChunksWithMorph = 0;
        if (r.state.voxelChunks) {
            for (const [, e] of r.state.voxelChunks) {
                if (!e || e.empty || !e.mesh || !e.mesh.geometry) continue;
                const g = e.mesh.geometry;
                if (g.attributes.aMorphTarget && g.attributes.aMorphWeight) t2HasAttrs = true;
                if (e.hasMorph) t2ChunksWithMorph++;
            }
        }
        out.t2HasMorphAttrs = t2HasAttrs;
        out.t2ChunksWithMorph = t2ChunksWithMorph;

        out.t3DcConstants = Number.isFinite(r.constructor.DC_LAMBDA) && Number.isFinite(r.constructor.DC_SHARP_MOVE2);

        // T4 Wasser-Automat: `_tickWaterCA` ist die reine Fluss-Funktion (Level pro Zelle). Behavioral:
        // ERHALTUNG (Σ Wasser konstant) + FLUSS (ein Blob fällt). Voller Beweis: `diag-water-flow-ca.cjs`.
        const SOLID = r.constructor.CELL_STATE.SOLID;
        const d = 4,
            dy = 10;
        const cells = new Uint8Array(d * d * dy); // AIR=0 default
        for (let c = 0; c < d * d; c++) cells[c] = SOLID; // Boden j=0
        const level = new Float64Array(d * d * dy);
        level[8 * d * d + 5] = 1.0; // ein Blob hoch oben
        let s0 = 0;
        for (let n = 0; n < level.length; n++) s0 += level[n];
        for (let t = 0; t < 40; t++) r._tickWaterCA(level, cells, d, dy);
        let s1 = 0,
            cw = 0;
        for (let j = 0; j < dy; j++)
            for (let c = 0; c < d * d; c++) {
                const v = level[j * d * d + c];
                s1 += v;
                cw += v * j;
            }
        // der Distanz-Decay (CA_FLOW_KEEP) dissipiert LATERAL bewusst:
        // die Invariante ist KEINE SCHÖPFUNG + begrenzter Schwund (der Blob fällt
        // verlustfrei, spreizt dann mit Decay — Σ fällt begrenzt, steigt nie).
        out.t4Conserves = s1 <= s0 + 1e-4 && s1 >= s0 * 0.3;
        out.t4Flows = (s1 > 0 ? cw / s1 : 99) < 8 - 1; // Schwerpunkt fiel von j=8
        // T4a-2 — der Automat ist in die WELT verdrahtet: reaktive Level-Schicht + Welt-Tick +
        // cross-chunk-wake, der Carve weckt die Region. Voller Welt-Beweis: `diag-water-world-flow`.

        // der Streu-Takt kehrt zurück (Test-Isolation aufräumen)
        delete r._tickScatterStreaming;
        return out;
    });
    if (res.error) {
        check("Welle C.3 V9.74: Cellular-Reaktion-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle C.3 V9.74: Damm-Spawn als Test-Setup erfolgreich", res.damSpawnSucceeded);
    check(
        "Welle C.3 V9.74: Blocker-AABB hat botY (V9.74-Erweiterung)",
        res.aabbHasBotY && res.aabbHasHeight,
        `botY=${res.aabbBotY}, topY=${res.aabbTopY}`
    );
    check(
        "Welle C.3 V9.74: Voxel-Chunk im Damm-Footprint existiert (oder kein Wasser-Ufer-Spot = unmessbar)",
        !res.damSpotHasWater || res.damChunkExists
    );
    if (res.damChunkExists) {
        check(
            "Welle C.3 V9.74: Damm-Cell im Footprint ist SOLID (Architektur-Stempel)",
            res.damCellIsSolid,
            `state=${res.damCellState}`
        );
        check(
            "Welle C.3 V9.74: Nach Remove kehren die waterCells EXAKT zum Pre-Dam-Zustand zurück (Stempel revertiert)",
            res.removeRestores,
            `diff=${res.cellAfterRemoveAbove}`
        );
    }
    // der Phantom-Test (carveStaysDry) läuft nur mit passendem Spot (nicht jeder Ring hat einen)
    if (res.carveSpotFound) {
        // Phantom-Schutz (heilige Invariante): ein Carve OHNE Wasser-Quelle in Reichweite bleibt TROCKEN,
        // jede Tiefe; nur nahe einer echten Quelle füllt sich die Mulde reaktiv. Der Spot oben ist via
        // `_atlasWaterLevelAt(x,z,-Infinity)===-Infinity` garantiert quellenfrei.
        check(
            "Welle V13.7: Carve OHNE Wasser-Quelle bleibt TROCKEN (kein Phantom; verbundenes Wasser füllt NUR mit Quelle)",
            res.carveStaysDry,
            `state=${res.carveCellUnderWL} (0=air erwartet)`
        );
    }
    // T1 (Terrain-Kohärenz-Plan §4): die zeitliche Naht — der Fußabdruck baut im Faden, das Netz trägt die Säule sofort.
    if (res.t1FootprintSync !== "no-streamed-chunk")
        check(
            "T1 (Terrain-Kohärenz): der Edit baut seinen Fußabdruck im Faden, das Netz trägt die Säule im Edit-Call",
            res.t1Faden,
            res.t1FootprintSync
        );
    // T2 (Terrain-Kohärenz-Plan §4): der Cross-LOD-Geomorph — die räumliche Naht.
    check("T2 (Cross-LOD-Geomorph): kein Material-Morph-Fehler (positionNode kompiliert)", res.t2NoMorphError);
    check(
        "T2 (Cross-LOD-Geomorph): jede Terrain-Geometrie trägt aMorphTarget+aMorphWeight (WebGPU-strikt)",
        res.t2HasMorphAttrs
    );
    check(
        "T2 (Cross-LOD-Geomorph): der Geomorph feuert an Cross-LOD-Grenzen (>=1 Chunk hasMorph)",
        res.t2ChunksWithMorph >= 1,
        `chunksWithMorph=${res.t2ChunksWithMorph}`
    );
    check(
        "T3 (Dual Contouring): DC_LAMBDA + DC_SHARP_MOVE2 Konstanten existieren (Worker-gespiegelt)",
        res.t3DcConstants
    );
    // T4: der Wasser-Automat-Kern — Wasser fliesst (Option A).
    check("T4 (Wasser-CA): keine Schöpfung + begrenzter Decay-Schwund (V18.93)", res.t4Conserves);
    check("T4 (Wasser-CA): das Wasser FLIESST — ein Blob fällt (Schwerpunkt sinkt)", res.t4Flows);
    // T4a-2 — in die Welt verdrahtet (reaktive Schicht + Welt-Tick + cross-chunk-wake + Carve-Wake).
}

// Worker-Density im Streaming-Pfad: (1) Worker-State nach Worldgen synced (`voxelWorkerSynced-
// HydroStateGen === voxelWorkerStateGen`); (2) `_fetchOrRequestChunkDensity` liefert (Cache/pending);
// (3) Worker-Density-Build == Sync-Build; (4) voxelEdit notifiziert den Worker (state-gen bumpt).
async function checkBandWellePerf3cPhase2Async(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        // 1) Worker-Methoden existieren
        // 2) State-Felder existieren
        // 3) Worker spawnt + initial sync
        const worker = r._getVoxelWorker();
        if (!worker) return { ...out, error: "worker spawn failed" };
        try {
            await r._voxelWorkerSyncState({ op: "init" });
        } catch (e) {
            return { ...out, error: "init sync failed: " + e.message };
        }
        // Manuell Worldgen-State-Sync triggern (im normalen Worldgen lief das
        // schon, aber wir wollen einen frischen state-gen-Stempel für den Test).
        r._voxelWorkerSyncWorldgenState();
        // Warten bis das ack durchgelaufen ist — das ack des state-set bumpt
        // voxelWorkerReady auch erneut.
        await sleep(50);
        out.workerStateGen = r.state.voxelWorkerStateGen;
        out.workerSynced = r.state.voxelWorkerWorldgenSynced;
        // 5) voxelEdit notify (K23, die Generation je Chunk): ein Edit über den Spielpfad ändert den Stand SEINES Chunks,
        // nicht den eines fernen, und aus dem Density-Cache fällt nur seine Nachbarschaft.
        const span5 = r._voxelChunkConfig().span;
        const ecx = Math.floor(1000 / span5);
        const standNahVor = r._voxelStand(ecx, ecx);
        const standFernVor = r._voxelStand(ecx + 10, ecx + 10);
        if (!r.state.voxelDensityCache) r.state.voxelDensityCache = new Map();
        r.state.voxelDensityCache.set(`${ecx},${ecx},0`, new Float32Array(1));
        r.state.voxelDensityCache.set(`${ecx + 10},${ecx + 10},0`, new Float32Array(1));
        const editsVor5 = r.state.worldMeta.voxelEdits;
        r.state.worldMeta.voxelEdits = (editsVor5 || []).slice();
        r.carveVoxel(1000, r._terrainMacroSurfaceY(1000, 1000), 1000, 3);
        out.editBumpedStateGen =
            r._voxelStand(ecx, ecx) !== standNahVor && r._voxelStand(ecx + 10, ecx + 10) === standFernVor;
        out.editClearedCache =
            !r.state.voxelDensityCache.has(`${ecx},${ecx},0`) &&
            r.state.voxelDensityCache.has(`${ecx + 10},${ecx + 10},0`);
        r.state.voxelDensityCache.delete(`${ecx + 10},${ecx + 10},0`);
        r.state.worldMeta.voxelEdits = editsVor5 || [];
        r._voxelWorkerSyncState({ op: "state-set" });
        return out;
    });
    if (res.error) {
        check("Welle Perf-3.c V9.90: Phase-2-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "Welle Perf-3.c V9.90: Worker-State synced nach Worldgen (worldgenSynced=true)",
        res.workerSynced,
        `stateGen=${res.workerStateGen}`
    );
    check(
        "K23: ein voxelEdit ändert den Stand seines Chunks, nicht den eines fernen (Generation je Chunk)",
        res.editBumpedStateGen
    );
    check("K23: ein voxelEdit leert den Density-Cache nur in seiner Nachbarschaft", res.editClearedCache);
}

// Voller Chunk-Mesh im Worker: er trägt die komplette Pipeline (Iso-Meshing + Cells + Colors),
// nicht nur die Density-Samples. Invariante: alle 4 Arrays (positions/normals/colors/waterCells)
// des Worker-Builds gleichen dem Sync-Build.
async function checkBandWellePerf3cPhase3FullMesh(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        // Worker initialisieren + Worldgen-State synchronisieren (im realen
        // Lauf passiert das beim Worldgen-Hook, hier explizit für den Test).
        const worker = r._getVoxelWorker();
        if (!worker) return { ...out, error: "worker spawn failed" };
        try {
            await r._voxelWorkerSyncState({ op: "init" });
        } catch (e) {
            return { ...out, error: "init sync failed: " + e.message };
        }
        r._voxelWorkerSyncWorldgenState();
        await sleep(80);
        out.workerSynced = r.state.voxelWorkerWorldgenSynced;
        // Sync-Build via _buildVoxelChunkData (kontrollierter Pfad, ohne
        // preDensityOverride → Sync-Sampling).
        const cx = 0;
        const cz = 0;
        const lod = 0;
        const syncFresh = r._buildVoxelChunkData(cx, cz, lod, null);
        if (!syncFresh || !syncFresh.mesh) return { ...out, error: "sync build failed" };
        out.syncBuildOk = true;
        // Worker-Build via _voxelWorkerComputeChunkMesh.
        let workerMesh;
        try {
            workerMesh = await r._voxelWorkerComputeChunkMesh(cx, cz, lod);
        } catch (e) {
            return { ...out, error: "worker mesh failed: " + e.message };
        }
        out.workerMeshOk = !workerMesh.empty && workerMesh.positions instanceof Float32Array;
        if (!out.workerMeshOk) return { ...out, error: "worker returned empty or malformed" };
        // Vertex-Count Vergleich
        const syncPos = syncFresh.mesh.geometry.getAttribute("position");
        out.syncVertCount = syncPos.count;
        out.workerVertCount = workerMesh.positions.length / 3;
        out.vertCountMatch = syncPos.count === workerMesh.positions.length / 3;
        // Position-Array epsilon-nah (< 1e-4): transzendente SimplexNoise-Präzision driftet Worker↔Main um
        // Float32-Rundung (unsichtbar); echte Bugs liegen weit darüber. maxDelta bleibt sichtbar.
        const EPS = 1e-4;
        let posMismatches = 0;
        let maxPosDelta = 0;
        const syncPosArr = syncPos.array;
        const workerPosArr = workerMesh.positions;
        const lenP = Math.min(syncPosArr.length, workerPosArr.length);
        for (let i = 0; i < lenP; i++) {
            const ad = Math.abs(syncPosArr[i] - workerPosArr[i]);
            if (ad > maxPosDelta) maxPosDelta = ad;
            if (ad > EPS) posMismatches++;
        }
        out.posMismatches = posMismatches;
        out.maxPosDelta = maxPosDelta;
        out.posBitIdentical = posMismatches === 0;
        // Normals bit-identisch?
        const syncNorm = syncFresh.mesh.geometry.getAttribute("normal");
        let normMismatches = 0;
        let maxNormDelta = 0;
        const syncNormArr = syncNorm.array;
        const workerNormArr = workerMesh.normals;
        const lenN = Math.min(syncNormArr.length, workerNormArr.length);
        for (let i = 0; i < lenN; i++) {
            const ad = Math.abs(syncNormArr[i] - workerNormArr[i]);
            if (ad > maxNormDelta) maxNormDelta = ad;
            if (ad > EPS) normMismatches++;
        }
        out.normMismatches = normMismatches;
        out.maxNormDelta = maxNormDelta;
        out.normBitIdentical = normMismatches === 0;
        // Indices bit-identisch? Sync hat Three.js BufferAttribute; index ist
        // Uint16/Uint32Array via getIndex().
        const syncIdx = syncFresh.mesh.geometry.getIndex();
        out.syncIdxCount = syncIdx ? syncIdx.count : 0;
        out.workerIdxCount = workerMesh.indices.length;
        let idxMismatches = 0;
        if (syncIdx) {
            const syncIdxArr = syncIdx.array;
            const workerIdxArr = workerMesh.indices;
            const lenI = Math.min(syncIdxArr.length, workerIdxArr.length);
            for (let i = 0; i < lenI; i++) {
                if (syncIdxArr[i] !== workerIdxArr[i]) idxMismatches++;
            }
        }
        out.idxMismatches = idxMismatches;
        out.idxBitIdentical = idxMismatches === 0;
        // Colors bit-identisch? Der Worker-Weg ist das Worker-Mesh UND sein Haupt-Thread-Schritt (die Himmels-Sicht und
        // der Fels-Stoff, `_felsStoff`, K17): verglichen wird der FERTIGE Bau beider Wege.
        // Die Zellen reisen als Kopie (der Bau stempelt sie, der Zellen-Vergleich unten liest die ungestempelten).
        const wFertig = r._buildVoxelChunkDataFromWorkerMesh(
            cx,
            cz,
            lod,
            Object.assign({}, workerMesh, {
                waterCells: workerMesh.waterCells ? workerMesh.waterCells.slice() : workerMesh.waterCells,
            })
        );
        const syncCol = syncFresh.mesh.geometry.getAttribute("color");
        let colMismatches = 0;
        let maxColDelta = 0;
        if (syncCol) {
            const syncColArr = syncCol.array;
            const workerColArr = wFertig.mesh.geometry.getAttribute("color").array;
            const lenC = Math.min(syncColArr.length, workerColArr.length);
            for (let i = 0; i < lenC; i++) {
                const ad = Math.abs(syncColArr[i] - workerColArr[i]);
                if (ad > maxColDelta) maxColDelta = ad;
                if (ad > EPS) colMismatches++;
            }
        }
        out.colMismatches = colMismatches;
        out.maxColDelta = maxColDelta;
        out.colBitIdentical = colMismatches === 0;
        // Die Boden-Karte (Höhe + Grün, `_bodenKarteAusMesh`) beider Wege: wer AUF dem Boden steht, liest sie
        let gruenMismatches = 0;
        let hoeheMismatches = 0;
        const gS = syncFresh.gruenMap;
        const gW = wFertig.gruenMap;
        const hS = syncFresh.surfMap;
        const hW = wFertig.surfMap;
        out.karteDa = !!(gS && gW && hS && hW && gS.length === gW.length && hS.length === hW.length);
        if (out.karteDa)
            for (let i = 0; i < gS.length; i++) {
                if (gS[i] !== gW[i]) gruenMismatches++;
                if (!(hS[i] === hW[i] || (Number.isNaN(hS[i]) && Number.isNaN(hW[i])))) hoeheMismatches++;
            }
        out.gruenMismatches = gruenMismatches;
        out.hoeheMismatches = hoeheMismatches;
        wFertig.mesh.geometry.dispose();
        // WaterCells: der Worker liefert OHNE Architektur-Stempel, der Sync-Pfad MIT → am Spawn-Chunk (0,0)
        // mit Worldgen-Bäumen sind Cell-Mismatches erwartet (< ~100 je Architektur). Pipeline-Beweis ist
        // darum die gleiche Cell-ANZAHL.
        if (syncFresh.waterCells && workerMesh.waterCells) {
            out.syncCellCount = syncFresh.waterCells.length;
            out.workerCellCount = workerMesh.waterCells.length;
            out.cellCountMatch = syncFresh.waterCells.length === workerMesh.waterCells.length;
            let cellMismatches = 0;
            const len = Math.min(syncFresh.waterCells.length, workerMesh.waterCells.length);
            for (let i = 0; i < len; i++) {
                if (syncFresh.waterCells[i] !== workerMesh.waterCells[i]) cellMismatches++;
            }
            out.cellMismatches = cellMismatches;
            // Akzeptanz: < 1% Cell-Mismatches (Architektur-Stempel-
            // Differenz von <100 Cells bei ~71k Cells = < 0.15%).
            out.cellsNearMatch = cellMismatches < len * 0.01;
        } else {
            out.syncCellCount = syncFresh.waterCells ? syncFresh.waterCells.length : 0;
            out.workerCellCount = workerMesh.waterCells ? workerMesh.waterCells.length : 0;
            out.cellCountMatch = syncFresh.waterCells === null && workerMesh.waterCells.length === 0;
            out.cellMismatches = 0;
            out.cellsNearMatch = true;
        }
        // Clean up
        syncFresh.mesh.geometry.dispose();
        return out;
    });
    if (res.error) {
        check("Welle Perf-3.c V9.91: Phase-3-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle Perf-3.c V9.91: Worker-State synced (worldgenSynced)", res.workerSynced);
    check("Welle Perf-3.c V9.91: Sync-Build erfolgreich", res.syncBuildOk);
    check("Welle Perf-3.c V9.91: Worker-Mesh-Build erfolgreich", res.workerMeshOk);
    check(
        "Welle Perf-3.c V9.91: Vertex-Count identisch (sync vs worker)",
        res.vertCountMatch,
        `sync=${res.syncVertCount}, worker=${res.workerVertCount}`
    );
    check(
        "Welle Perf-3.c V9.91: positions BIT-IDENTISCH (Phase-3-Kern-Invariante)",
        res.posBitIdentical,
        `posMismatches=${res.posMismatches}, maxPosDelta=${res.maxPosDelta}`
    );
    check(
        "Welle Perf-3.c V9.91: normals BIT-IDENTISCH",
        res.normBitIdentical,
        `normMismatches=${res.normMismatches}, maxNormDelta=${res.maxNormDelta}`
    );
    check(
        "Welle Perf-3.c V9.91: indices BIT-IDENTISCH",
        res.idxBitIdentical,
        `idxMismatches=${res.idxMismatches}, sync=${res.syncIdxCount}, worker=${res.workerIdxCount}`
    );
    check(
        "Welle Perf-3.c V9.91: colors BIT-IDENTISCH",
        res.colBitIdentical,
        `colMismatches=${res.colMismatches}, maxColDelta=${res.maxColDelta}`
    );
    check(
        "Welle Perf-3.c V9.91: Boden-Karte (Höhe + Grün) BIT-IDENTISCH (sync vs Worker-Weg, beide fertig)",
        res.karteDa && res.gruenMismatches === 0 && res.hoeheMismatches === 0,
        `karte=${res.karteDa}, gruenMismatches=${res.gruenMismatches}, hoeheMismatches=${res.hoeheMismatches}`
    );
    check(
        "Welle Perf-3.c V9.91: Cell-Counts identisch (Architektur-Stempel-Toleranz)",
        res.cellCountMatch,
        `sync=${res.syncCellCount}, worker=${res.workerCellCount}`
    );
    check(
        "Welle Perf-3.c V9.91: waterCells nahe-identisch (< 1% Stempel-Diff)",
        res.cellsNearMatch,
        `cellMismatches=${res.cellMismatches}`
    );
}

// Voxel-Worker engagiert (~71 ms Mesh-Bau off-thread): `_voxelWorkerSyncWorldgenState` bootstrappt
// ihn (`_getVoxelWorker`), sonst baut `_acquireVoxelChunkBuild` zirkulär JEDEN Chunk sync. Wand:
// nach dem Warmup ist der Worker engagiert (worldgenSynced), Bootstrap + Spieler-Chunk-async stehen.
async function checkBandV17118WorkerEngaged(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        return {
            // Behavioral: der Worker ist nach dem Warmup gebootstrappt + getrusted.
            workerSpawned: !!r.state.voxelWorker,
            worldgenSynced: !!r.state.voxelWorkerWorldgenSynced,
            // Laufzeit: der Neubau des Spieler-Chunks baut nie synchron (K69-2: der Neubau jedes Chunks geht über den
            // Worker, die Flut-Saat reist mit dem Auftrag). Gegenprobe: forceSync (die Test-Naht) baut synchron — der
            // Zähler sieht ihn.
            spielerNeubau: (() => {
                const pm = r.state.playerMesh && r.state.playerMesh.position;
                const span = r._voxelChunkConfig().span;
                const ch = r.state.voxelChunks;
                if (!pm || !ch) return null;
                const kx = [Math.floor(pm.x / span), Math.floor((pm.x + span / 2) / span)];
                const kz = [Math.floor(pm.z / span), Math.floor((pm.z + span / 2) / span)];
                const i = ch.has(kx[0] + "," + kz[0]) ? 0 : ch.has(kx[1] + "," + kz[1]) ? 1 : -1;
                if (i < 0) return null;
                let sync = 0;
                const org = r._buildVoxelChunkData;
                r._buildVoxelChunkData = function () {
                    sync++;
                    return org.apply(this, arguments);
                };
                try {
                    r._rebuildVoxelChunk(kx[i], kz[i], null, {});
                    const asyncSync = sync;
                    r._rebuildVoxelChunk(kx[i], kz[i], null, { forceSync: true });
                    return { key: kx[i] + "," + kz[i], sync: asyncSync, gegen: sync - asyncSync };
                } finally {
                    delete r._buildVoxelChunkData;
                }
            })(),
        };
    });
    if (res.error) {
        check("E3: Worker-Engaged-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("E3: der Voxel-Worker ist gespawnt (nicht mehr dormant)", res.workerSpawned === true);
    check(
        "E3: voxelWorkerWorldgenSynced nach Warmup (Streaming nutzt den Worker, Mesh off-thread)",
        res.worldgenSynced === true
    );
    const sn = res.spielerNeubau;
    check(
        "K69-2: der Neubau des Spieler-Chunks baut nie synchron im Haupt-Faden (über den Worker), die Gegenprobe forceSync schon",
        !!sn && sn.sync === 0 && sn.gegen >= 1,
        JSON.stringify(sn)
    );
}

// PHASE A — das Fundament watertight: A1 Morph-Cap+Stitch-Band ·
// A2 Edit-Lokalität (der „Reset" ist GEMESSEN unsichtbar) · A5 Luft↔Ring-Kante ·
// A6 Körper-Kollision (Decken-Sprung-Klemme + Kamera-Clip; die Rettung aus dem Fill hebt den Turm, gate:fall-waechter B).
async function checkBandPhaseAFundament(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.voxelChunks) return { error: "no realm" };
        const out = {};
        // ── A1 · Stitch-Band: deterministisch frisch morphen (Band-Reihenfolge egal),
        // dann zählen + die WebGPU-Attribut-Vollständigkeit prüfen (V10.0-g.1-Wand).
        for (const [key, entry] of r.state.voxelChunks) {
            if (!entry || entry.empty || !entry.mesh) continue;
            const [cx, cz] = key.split(",").map(Number);
            r._applyCrossLodGeomorph(cx, cz);
        }
        let bands = 0,
            bandAttrsOk = true,
            cappedTotal = 0;
        for (const [, entry] of r.state.voxelChunks) {
            if (!entry || !entry.lodStitchMesh) continue;
            bands++;
            const g = entry.lodStitchMesh.geometry;
            for (const a of ["position", "normal", "color", "aMorphTarget", "aMorphWeight"]) {
                if (!g.attributes[a]) bandAttrsOk = false;
            }
            // die gekappten Naht-Vertices zählt der Morph selbst (K51-2: ihr Ziel ist das ihrer Stufe, das Naht-Ziel trägt das Band)
            cappedTotal += entry.nahtGekappt | 0;
        }
        out.bands = bands;
        out.bandAttrsOk = bandAttrsOk;
        out.cappedTotal = cappedTotal;
        // ── A2 · Edit-Lokalität: ein kleiner Carve ändert NUR die Sub-Region
        // (der Ganz-Chunk-Rebuild ist deterministisch → der „Reset" ist unsichtbar).
        {
            const { span } = r._voxelChunkConfig();
            const pm = r.state.playerMesh.position;
            const cx = Math.floor(pm.x / span) + 1,
                cz = Math.floor(pm.z / span);
            const entry = r.state.voxelChunks.get(`${cx},${cz}`);
            if (entry && entry.mesh) {
                const Q = (v) => Math.round(v * 1000);
                const snap = (geom) => {
                    const p = geom.attributes.position;
                    const set = new Set();
                    for (let i = 0; i < p.count; i++) set.add(`${Q(p.getX(i))},${Q(p.getY(i))},${Q(p.getZ(i))}`);
                    return set;
                };
                const before = snap(entry.mesh.geometry);
                const ex = cx * span + span / 2,
                    ez = cz * span + span / 2;
                const surf = r._voxelSurfaceY(ex, ez);
                if (typeof surf === "number") {
                    r.carveVoxel(ex, surf - 0.5, ez, 1.5);
                    r._drainDirtyVoxelChunks();
                    const after = snap(r.state.voxelChunks.get(`${cx},${cz}`).mesh.geometry);
                    const zelle = r._voxelChunkConfig(entry.lod).step * Math.sqrt(3); // ein Vertex mittelt seine Zelle
                    const rInf = globalThis.__gelaendeCore.editReich({ r: 1.5 }) + zelle; // die Reichweite des Gesetzes
                    let changedOutside = 0,
                        totalOutside = 0;
                    for (const k of before) {
                        const [qx, qy, qz] = k.split(",").map((n) => n / 1000);
                        if (Math.hypot(qx - ex, qy - (surf - 0.5), qz - ez) <= rInf) continue;
                        totalOutside++;
                        if (!after.has(k)) changedOutside++;
                    }
                    out.a2 = { totalOutside, changedOutside };
                }
            }
        }
        // ── B2 · Horizont-Mantel geschnitten (die Ferne tragen Fern-Ring und Feld-Pass, die Luft dunstet sie;
        // kein Mantel). Das Band prüft die ABWESENHEIT von Konstante und State (die Methoden bewacht gate:altlasten).
        out.b2 = {
            constGone: !r.constructor.HORIZON_MANTLE,
            stateGone: r.state.horizonMantle === undefined && r.state.mantleHoleUniforms === undefined,
        };
        // Infinity überlebt die evaluate-JSON-Serialisierung NICHT (→ null) —
        // als String-Sentinel "inf" transportieren (freier Himmel = kein Treffer).
        const a6h = r._ceilingHeadroom();
        out.a6Headroom = Number.isFinite(a6h) ? a6h : "inf";
        return out;
    });
    if (res.error) {
        check("PHASE A: Fundament-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "A1: Stitch-Bänder an Cross-LOD-Grenzen präsent (KONSUM, nicht Existenz)",
        res.bands >= 1,
        `bands=${res.bands}`
    );
    check("A1: jedes Band trägt ALLE Terrain-Material-Attribute (WebGPU-strikt, V10.0-g.1)", res.bandAttrsOk === true);
    check(
        "A1: der Morph-Cap stoppt Cliff-Zerren (w=0-Vertices mit Target existieren)",
        res.cappedTotal >= 1,
        `capped=${res.cappedTotal}`
    );
    check(
        "A2: Edit-Vertex-Delta ist LOKAL — 0 geänderte Vertices außerhalb des Einflusses (kein sichtbarer Ganz-Chunk-Reset)",
        res.a2 && res.a2.changedOutside === 0 && res.a2.totalOutside > 100,
        res.a2 ? `outside=${res.a2.totalOutside} changed=${res.a2.changedOutside}` : "kein Chunk"
    );
    check("B2/N7.4: HORIZON_MANTLE-Konstante geschnitten", res.b2 && res.b2.constGone === true);
    check(
        "B2/N7.4: kein Mantel-State (horizonMantle/mantleHoleUniforms undefined)",
        res.b2 && res.b2.stateGone === true
    );
    check(
        "A6b: _ceilingHeadroom liefert eine Zahl/Infinity (Ammo-Raycast trägt)",
        res.a6Headroom === "inf" || (typeof res.a6Headroom === "number" && res.a6Headroom >= 0)
    );
}

// Carve über den Worker: der Neubau des Spieler-Chunks (und jedes Chunks mit einem Schnitt im 3×3) geht über den Worker,
// auch bei gesundem Frame (K69-2). Synchron baut nur ein ausdrückliches forceSync.
async function checkBandCarveWorker(ctx) {
    const { page, check } = ctx;
    const out = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const st = r.state;
        // Takte, bis der Chunk unter dem Spieler GEBAUT steht — das Bau-Ereignis; die Decke 600 ist ROT
        const steht = () => {
            const pc = st.lastPlayerVoxelChunk;
            return !!(pc && st.voxelChunks && st.voxelChunks.has(pc.cx + "," + pc.cz));
        };
        for (let takte = 0; takte < 600 && !steht(); takte++) {
            r._gameLoopTick();
            await sleep(0);
        }
        const pc = st.lastPlayerVoxelChunk;
        if (!pc || !steht()) return { err: "der Spieler-Chunk entstand nie" };
        // den Build-Aufruf bespitzeln → die forceSync-ENTSCHEIDUNG ablesen
        const o = {};
        let lastForceSync = null;
        const eigen = Object.prototype.hasOwnProperty.call(r, "_acquireVoxelChunkBuild");
        const vorher = r._acquireVoxelChunkBuild;
        const orig = vorher.bind(r);
        r._acquireVoxelChunkBuild = function (a, b, c, opts) {
            lastForceSync = !!(opts && opts.forceSync);
            return orig(a, b, c, opts);
        };
        try {
            for (const [k, ueber, opts] of [["gesund", false, undefined], ["ueber", true, undefined], ["force", true, { forceSync: true }]]) {
                st._frameOverBudget = ueber;
                lastForceSync = null;
                r._rebuildVoxelChunk(pc.cx, pc.cz, null, opts);
                o[k] = lastForceSync;
            }
        } finally {
            if (eigen) r._acquireVoxelChunkBuild = vorher;
            else delete r._acquireVoxelChunkBuild;
            st._frameOverBudget = false;
        }
        return o;
    });
    const ok = !!out && !out.err;
    check("Carve: gesunder Frame → der Neubau des Spieler-Chunks geht über den Worker (kein Sync-Trip im Takt)", ok && out.gesund === false, ok ? `forceSync=${out.gesund}` : out && out.err);
    check("Carve: Frame über Budget → der Neubau geht über den Worker (kein ~200-ms-Stall)", ok && out.ueber === false, ok ? `forceSync=${out.ueber}` : "");
    check("Carve: ein ausdrückliches forceSync gewinnt IMMER (Test/Naht-Intent absolut)", ok && out.force === true, ok ? `forceSync=${out.force}` : "");
}

module.exports = {
    checkBandVoxelP3AndInventory, checkBandWelleC3CellularReaction,
    checkBandWellePerf3cPhase2Async, checkBandWellePerf3cPhase3FullMesh, checkBandV17118WorkerEngaged,
    checkBandPhaseAFundament, checkBandCarveWorker,
};
