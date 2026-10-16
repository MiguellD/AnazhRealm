"use strict";
// scripts/playtest/wasser.cjs — der Richter von Wasser (spec/stamm/modul-karte.json): Hydrosphäre · Flüsse · Seen · Wasserfälle · Pegel · die Wasser-Wahrheit · Wasser-Zellen · Sheet · Iso · Wasser-CA · Stau.
// 9 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { spawn } = require("child_process");
const { safeEvaluate } = require("../playtest.cjs");

// V9.52-c Sub-Welle c — Band-Funktion (Hydrosphäre — V9.43-a/b/c/c.2/d/e + V9.47 Erosion + V9.50-b Chunk-Wasser/Ufer-Schaum).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandHydrosphere(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Wasserfälle aus dem Hydrosphären-Netz ###
    // Wasserfälle entstehen, wo ein Fluss eine echte Voxel-Klippe kreuzt (`_hydroExtractWaterfalls`);
    // der per-Chunk-Zufalls-Spawner `_buildVoxelChunkWaterfalls` + seine State-Map sind gelöscht und
    // nicht mehr in `_ensureVoxelChunkAt`/`_disposeVoxelChunk` gehookt. Das Wasserfall-Material ohne Leser
    // (`_ensureWaterfallMaterial`, nur Tests riefen es) ist mit der Welle L gefallen (W-kD11).
    const voxelV943cAblation = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const ensureSrc = window.__codeOf(r._ensureVoxelChunkAt || function () {});
        const disposeSrc = window.__codeOf(r._disposeVoxelChunk || function () {});
        return {
            buildGone: typeof r._buildVoxelChunkWaterfalls !== "function",
            disposeGone: typeof r._disposeVoxelChunkWaterfalls !== "function",
            ensureNoHook: !/_buildVoxelChunkWaterfalls/.test(ensureSrc),
            disposeNoHook: !/_disposeVoxelChunkWaterfalls/.test(disposeSrc),
            stateMapGone: !("voxelChunkWaterfalls" in r.state),
            materialKept: typeof r._ensureWaterfallMaterial === "undefined" && !("waterfallUniforms" in r.state),
        };
    });

    if (voxelV943cAblation && !voxelV943cAblation.error) {
        check(
            "Voxel V9.43-c: _buildVoxelChunkWaterfalls ist gelöscht (per-Chunk-Spawner abgelöst)",
            voxelV943cAblation.buildGone
        );
        check("Voxel V9.43-c: _disposeVoxelChunkWaterfalls ist gelöscht", voxelV943cAblation.disposeGone);
        check(
            "Voxel V9.43-c: _ensureVoxelChunkAt hookt den Wasserfall-Spawner nicht mehr",
            voxelV943cAblation.ensureNoHook
        );
        check(
            "Voxel V9.43-c: _disposeVoxelChunk hookt den Wasserfall-Spawner nicht mehr",
            voxelV943cAblation.disposeNoHook
        );
        check("Voxel V9.43-c: state.voxelChunkWaterfalls-Map ist entfernt", voxelV943cAblation.stateMapGone);
        check(
            "Voxel V9.43-c → Welle L: das Wasserfall-Material ohne Leser ist gefallen (kein _ensureWaterfallMaterial, keine waterfallUniforms)",
            voxelV943cAblation.materialKept
        );
    }

    // ### Die Kachel-Erosion ist gefallen (K16) ###
    // Die Täler kommen aus dem Flussnetz des Gelände-Gesetzbuchs (gelaende-core), nicht aus einer nachträglichen
    // Stream-Power-Inzision je Kachel: kein `_computeErosion`, kein `state.erosion`, kein `erosionDelta` im Kern.
    const erosionTot = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        return {
            tot:
                typeof r._computeErosion === "undefined" &&
                typeof r._erosionIncisionPass === "undefined" &&
                !("erosion" in r.state) &&
                typeof window.__gelaendeCore.erosionDelta === "undefined" &&
                typeof window.__gelaendeCore.erosionFuer === "undefined",
        };
    });
    check(
        "K16: die Kachel-Erosion ist gefallen (kein _computeErosion, kein state.erosion, kein erosionDelta/erosionFuer)",
        !!(erosionTot && erosionTot.tot)
    );

    // ### Der Hydrosphären-Atlas ###
    // Deterministisches Drainage-Netz aus der Voxel-Surface: Priority-Flood (Senken → Seen) →
    // D8-Flow-Direction → Flow-Accumulation → Netz-Extraktion (Flüsse/Seen/Wasserfälle). Reine
    // Daten, headless-prüfbar.
    const voxelV943bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        out.methodExists = typeof r._computeHydrosphere === "function";
        out.stateDeclared = "hydrosphere" in r.state;
        if (!out.methodExists) return out;
        const t0 = performance.now();
        const h1 = r._computeHydrosphere();
        out.perfMs = performance.now() - t0;
        out.shape =
            !!h1 &&
            h1.ready === true &&
            Array.isArray(h1.rivers) &&
            Array.isArray(h1.lakes) &&
            Array.isArray(h1.waterfalls) &&
            typeof h1.dim === "number" &&
            typeof h1.cell === "number";
        out.riverCount = h1.rivers.length;
        out.lakeCount = h1.lakes.length;
        out.waterfallCount = h1.waterfalls.length;
        out.bettMin = h1.stats ? h1.stats.bettMin : null;
        out.riverMaxSlope = h1.stats ? h1.stats.riverMaxSlope : 0;
        out.riverMaxDrop = h1.stats ? h1.stats.riverMaxDrop : 0;
        out.riverLenMax = h1.stats ? h1.stats.riverLenMax : 0;
        out.riverPointsTotal = h1.stats ? h1.stats.riverPointsTotal : 0;
        out.lakeCellsMax = h1.stats ? h1.stats.lakeCellsMax : 0;
        out.lakeCells = h1.stats ? h1.stats.lakeCells : 0;
        // Determinismus — zwei Läufe, byte-identisches Netz
        const h2 = r._computeHydrosphere();
        out.deterministic =
            JSON.stringify(h1.rivers) === JSON.stringify(h2.rivers) &&
            JSON.stringify(h1.lakes) === JSON.stringify(h2.lakes) &&
            JSON.stringify(h1.waterfalls) === JSON.stringify(h2.waterfalls);
        // Jeder Fluss fällt STRIKT monoton: point.y ist die Sohle des Netzes (gelaende-core `knotenSohle`).
        out.riversDescend = h1.rivers.every((rv) => {
            for (let k = 0; k + 1 < rv.points.length; k++) {
                if (rv.points[k].y <= rv.points[k + 1].y) return false;
            }
            return true;
        });
        // Jeder Fluss endet am Meer, am Rand der Kachel, in einem See (K16: die Senke des Netzes ist ein benannter See) oder als
        // Zufluss auf der Rinne seines Hauptlaufs.
        out.riverMouths = h1.rivers.every((rv) => ["sea", "border", "see", "zufluss"].includes(rv.mouth));
        // K16 — ein Fluss mündet in den See des Wasser-Orts (Land → See), sein Spiegel endet auf dem des Sees — gemessen an
        // der Kachel des Wasser-Orts (`__wasserOrt`: die Heimat trägt seit K16 keinen See).
        const seeOrt = window.__wasserOrt("see");
        const meerOrt = window.__wasserOrt("meer");
        out.seeOrt = seeOrt ? `${Math.round(seeOrt.x)},${Math.round(seeOrt.z)}` : "keiner";
        out.meerOrt = meerOrt ? `${Math.round(meerOrt.x)},${Math.round(meerOrt.z)}` : "keiner";
        out.riverThroughLake =
            !!seeOrt && seeOrt.hydro.rivers.some((rv) => rv.mouth === "see" && rv.points.every((p) => !p.inLake));
        // Flow-Accumulation stromab monoton → Breite wächst
        out.widthGrows = h1.rivers.every((rv) => {
            for (let k = 0; k + 1 < rv.points.length; k++) {
                if (rv.points[k].width > rv.points[k + 1].width + 1e-6) return false;
            }
            return true;
        });
        // Jeder See: Füll-Level über dem Boden, unter (≈) der Rand-Höhe
        out.lakesValid = h1.lakes.every((lk) => lk.level > lk.floorY && lk.level <= lk.rimY + 1.5);
        // Worldgen-Verdrahtung — state.hydrosphere ist gesetzt
        out.wired = !!(r.state.hydrosphere && r.state.hydrosphere.ready);
        // Das vereinte Wasser-Feld je Region-Zelle: flacher Wasser-Spiegel (`waterY`) + Klassifikation
        // (`waterKind` 0 Land · 1 Ozean · 2 See). Ozean trägt `waterLevel`, See `lake.level`, trockene
        // Zelle den Meeresspiegel-Default — die Wahrheit, aus der EIN Höhenfeld-Mesh gebaut wird.
        const wf = h1.water;
        out.waterFieldShape =
            !!wf &&
            wf.waterY instanceof Float32Array &&
            wf.waterKind instanceof Uint8Array &&
            wf.waterY.length === h1.dim * h1.dim &&
            wf.waterKind.length === h1.dim * h1.dim;
        let kindOk = true;
        let finiteOk = true;
        let oceanCells = 0;
        let lakeFieldCells = 0;
        if (out.waterFieldShape) {
            for (let i = 0; i < wf.waterKind.length; i++) {
                const k = wf.waterKind[i];
                if (k > 2) kindOk = false;
                if (k === 1) oceanCells++;
                else if (k === 2) lakeFieldCells++;
                if (!Number.isFinite(wf.waterY[i])) finiteOk = false;
            }
        }
        out.waterKindValid = kindOk && finiteOk;
        // V9.49-e — alle Ozean-Zellen teilen EINEN flachen Spiegel (kein per-Zelle-filled mehr): gemessen an der Kachel
        // des Meer-Orts.
        let meerZellen = 0;
        let oceanY = null;
        let oceanFlat = true;
        const mw = meerOrt && meerOrt.hydro.water;
        if (mw) {
            for (let i = 0; i < mw.waterKind.length; i++) {
                if (mw.waterKind[i] !== 1) continue;
                meerZellen++;
                if (oceanY === null) oceanY = mw.waterY[i];
                else if (Math.abs(mw.waterY[i] - oceanY) > 1e-4) oceanFlat = false;
            }
        }
        out.waterFieldOceanFlat = oceanFlat && meerZellen > 0;
        out.waterFieldOceanCells = meerZellen;
        out.waterFieldLakeCells = lakeFieldCells;
        out.waterFieldHomeOceanCells = oceanCells;
        // das Feld IST das Netz: Ozean-/See-Zell-Zahl deckt sich mit
        // den Netz-Extraktions-Zählern (eine Quelle, keine Drift).
        out.waterFieldMatchesNet =
            !!h1.stats && oceanCells === h1.stats.seaCells && lakeFieldCells === h1.stats.lakeCells;
        // Determinismus — das Feld ist so deterministisch wie das Netz.
        out.waterFieldDeterministic =
            !!(h2.water && h2.water.waterKind) &&
            wf.waterKind.length === h2.water.waterKind.length &&
            wf.waterKind.every((v, i) => v === h2.water.waterKind[i]);
        // V9.50-a — das Wasser-Level-Feld `_waterLevelAt` an der ersten Ozean-Zelle der Meer-Kachel und der ersten
        // See-Zelle der See-Kachel (der Leser löst die Kachel selbst auf, `_hydroFor`).
        out.hasWaterLevelAt = typeof r._waterLevelAt === "function";
        out.hasRiverAt = typeof r._hydroRiverAt === "function";
        out.waterLevelOceanOk = false;
        out.waterLevelLakeOk = false;
        if (out.hasWaterLevelAt) {
            const wl = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
            const erste = (h, kind) => {
                const q = h.water.waterKind.indexOf(kind);
                if (q < 0) return null;
                return [h.originX + ((q % h.dim) + 0.5) * h.cell, h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell];
            };
            const m = meerOrt && erste(meerOrt.hydro, 1);
            if (m) {
                const lv = r._waterLevelAt(m[0], m[1]);
                out.waterLevelOceanOk = Number.isFinite(lv) && Math.abs(lv - wl) < 0.01;
            }
            const s = seeOrt && erste(seeOrt.hydro, 2);
            if (s) {
                const lv = r._waterLevelAt(s[0], s[1]);
                out.waterLevelLakeOk = Number.isFinite(lv) && lv >= wl;
            }
        }
        // K16 — die Seen sind die Senken des Flussnetzes (Ebene 0 auf Land, `benannteSeen` des Gelände-Gesetzbuchs); der
        // Tarn-Pass (V9.51) ist gefallen. Je Netz-Senke in der Kachel: trägt die Hydrosphäre um sie (± 3 Zellen) See-Zellen?
        out.tarnPassTot = typeof r._hydroSeedTarns !== "function" && !("tarns" in r.state);
        out.netzSeen = -1;
        out.netzSeenSee = 0;
        if (h1.water && globalThis.__gelaendeCore && typeof globalThis.__gelaendeCore.benannteSeen === "function") {
            const idx = globalThis.__gelaendeCore.benannteSeen(
                r._gelaende(),
                h1.originX + h1.cell / 2,
                h1.originZ + h1.cell / 2,
                h1.cell,
                h1.dim
            );
            out.netzSeen = idx.length;
            for (const k of idx) {
                const hi = k % h1.dim;
                const hj = (k / h1.dim) | 0;
                let see = 0;
                for (let dj = -3; dj <= 3; dj++)
                    for (let di = -3; di <= 3; di++) {
                        const ci = hi + di;
                        const cj = hj + dj;
                        if (ci < 0 || cj < 0 || ci >= h1.dim || cj >= h1.dim) continue;
                        if (h1.water.waterKind[ci + cj * h1.dim] === 2) see++;
                    }
                if (see >= 1) out.netzSeenSee++;
            }
        }
        return out;
    });

    if (voxelV943bResults && !voxelV943bResults.error) {
        const hb = voxelV943bResults;
        check("Voxel V9.43-b: _computeHydrosphere existiert", hb.methodExists);
        check("Voxel V9.43-b: state.hydrosphere ist im State deklariert", hb.stateDeclared);
        check("Voxel V9.43-b: liefert {ready, rivers[], lakes[], waterfalls[], dim, cell}", hb.shape);
        check(
            `Voxel V9.43-b: das Netz trägt Flüsse (${hb.riverCount} Flüsse, ${hb.lakeCount} Seen, ${hb.waterfallCount} Wasserfälle, Bett min ${hb.bettMin} m, längster Fluss ${hb.riverLenMax} Pkt / Σ ${hb.riverPointsTotal}, größter See ${hb.lakeCellsMax} / Σ ${hb.lakeCells} Zellen, steilstes Segment ${hb.riverMaxSlope})`,
            hb.riverCount > 0
        );
        check("Voxel V9.43-b: das Netz ist deterministisch (zwei Läufe byte-identisch)", hb.deterministic);
        check(
            "Voxel V9.43-b: jeder Fluss steigt strikt monoton ab (Quelle → Mündung, die Sohle des Netzes)",
            hb.riversDescend
        );
        check("Voxel V9.43-b: jeder Fluss endet an Meer, See, Hauptlauf oder Region-Rand", hb.riverMouths);
        check(
            "K16: ein Fluss des Netzes mündet in einen See (Land → See)",
            hb.riverThroughLake,
            `See-Ort ${hb.seeOrt}`
        );
        check("Voxel V9.43-b: Fluss-Breite wächst stromab (Einzugsgebiet des Netzes monoton)", hb.widthGrows);
        check("Voxel V9.43-b: jeder See — Füll-Level über dem Boden, unter der Rand-Höhe", hb.lakesValid);
        check(
            "Voxel V9.43-b: Berechnung im Perf-Budget (< 500 ms)",
            typeof hb.perfMs === "number" && hb.perfMs < 500,
            `perfMs=${Math.round(hb.perfMs || 0)} ms`
        );
        check("Voxel V9.43-b: state.hydrosphere ist nach Worldgen verdrahtet", hb.wired);
        check("Voxel V9.49-a: das vereinte Wasser-Feld {waterY, waterKind} hat dim²-Form", hb.waterFieldShape);
        check("Voxel V9.49-a: waterKind ∈ {0,1,2}, waterY je Zelle endlich", hb.waterKindValid);
        check(
            "Voxel V9.49-e: alle Ozean-Zellen teilen EINEN flachen Wasser-Spiegel",
            hb.waterFieldOceanFlat,
            `Meer-Ort ${hb.meerOrt}, ${hb.waterFieldOceanCells} Ozean-Zellen`
        );
        check(
            `Voxel V9.49-a: das Feld deckt sich mit dem Netz (${hb.waterFieldHomeOceanCells} Ozean- + ${hb.waterFieldLakeCells} See-Zellen = Netz-Zähler)`,
            hb.waterFieldMatchesNet
        );
        check("Voxel V9.49-a: das Wasser-Feld ist deterministisch", hb.waterFieldDeterministic);
        check(
            "Voxel V9.50-a: `_waterLevelAt` + `_hydroRiverAt` existieren (das Wasser-Level-Feld)",
            hb.hasWaterLevelAt && hb.hasRiverAt
        );
        check("Voxel V9.50-a: `_waterLevelAt` an einer Ozean-Zelle == waterLevel", hb.waterLevelOceanOk);
        check("Voxel V9.50-a: `_waterLevelAt` an einer See-Zelle ≥ waterLevel (der See-Spiegel)", hb.waterLevelLakeOk);
        check("K16: der Tarn-Pass ist gefallen (kein `_hydroSeedTarns`, kein state.tarns)", hb.tarnPassTot);
        check(
            `K16: jede Senke des Flussnetzes in der Kachel wird zum See (${hb.netzSeenSee}/${hb.netzSeen})`,
            hb.netzSeen >= 0 && hb.netzSeenSee === hb.netzSeen,
            `netzSeen=${hb.netzSeen} see=${hb.netzSeenSee}`
        );
    }

    // ### Das Wasser wird synergetisch ###
    // Fluss-Mündungen erreichen SICHTBAR ihr Wasser (Ribbon blendet auf `waterLevel` bzw. den
    // Ziel-See-Level), und der Spieler schwimmt im See wie im Meer — Quelle ist `_waterLevelAt`.
    const voxelV943c2 = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        out.hasWaterLevelAt = typeof r._waterLevelAt === "function";
        out.hydroReady = !!(r.state.hydrosphere && r.state.hydrosphere.ready);
        if (!out.hasWaterLevelAt || !out.hydroReady) return out;
        // _waterLevelAt: über einer GERENDERTEN See-Zelle → der See-Level, gemessen an der Kachel des See-Orts
        // (`__wasserOrt`). V9.45-c: absorbierte Seen (level ≤ waterLevel+2) zählen nicht — die Meeres-Plane vertritt sie.
        const seeOrt = window.__wasserOrt("see");
        const hydro = seeOrt ? seeOrt.hydro : r.state.hydrosphere;
        out.lakeLevelOk = false;
        out.ringFollowsPlane = false;
        const wlT = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
        const renderedLk = hydro.lakes.find((l) => l.level > wlT + 2 && Array.isArray(l.cells) && l.cells.length > 0);
        if (renderedLk) {
            const cellIdx = renderedLk.cells[0];
            const ci = cellIdx % hydro.dim;
            const cj = (cellIdx / hydro.dim) | 0;
            const wx = hydro.originX + (ci + 0.5) * hydro.cell;
            const wz = hydro.originZ + (cj + 0.5) * hydro.cell;
            out.lakeLevelOk = Math.abs(r._waterLevelAt(wx, wz) - renderedLk.level) < 0.01;
            // V9.45-c — der Auftrieb folgt der dilatierten See-Plane:
            // eine 1-Ring-Zelle (nicht selbst See-Zelle) liefert auch
            // einen See-Wasserspiegel, nicht den Meeresspiegel.
            const cellsSet = new Set(renderedLk.cells);
            let ringChecked = false;
            for (let dj = -1; dj <= 1 && !ringChecked; dj++) {
                for (let di = -1; di <= 1 && !ringChecked; di++) {
                    const ni = ci + di;
                    const nj = cj + dj;
                    if (ni < 0 || nj < 0 || ni >= hydro.dim || nj >= hydro.dim) continue;
                    if (cellsSet.has(ni + nj * hydro.dim)) continue;
                    const rx = hydro.originX + (ni + 0.5) * hydro.cell;
                    const rz = hydro.originZ + (nj + 0.5) * hydro.cell;
                    out.ringFollowsPlane = r._waterLevelAt(rx, rz) > wlT + 1.5;
                    ringChecked = true;
                }
            }
        }
        // Weit ausserhalb der Hydrosphären-Region → Meeresspiegel.
        out.seaFallbackOk = r._waterLevelAt(999999, 999999) === r.state.waterLevel;
        // Die Schwimm-/Wasser-Physik speist den effektiven Wasserspiegel aus der EINEN Wasser-Wahrheit am Körper
        // (`_koerperWasser`, Welle L wasser — vorher `_waterLevelAt`); sie lebt im feld-nativen Controller `_stepCharacter`
        // (`_loopPhysicsSync` dispatcht nur).
        out.physicsUsesEffWater =
            typeof r._stepCharacter === "function" && /_koerperWasser\(/.test(window.__codeOf(r._stepCharacter));
        return out;
    });

    if (voxelV943c2 && !voxelV943c2.error) {
        const h2 = voxelV943c2;
        check(
            "Voxel V9.43-c.2: _waterLevelAt existiert (war _hydroWaterLevelAt — V18.180-FIX §6.4)",
            h2.hasWaterLevelAt
        );
        check("Voxel V9.43-c.2: _waterLevelAt liefert über einer See-Zelle den See-Füllstand", h2.lakeLevelOk);
        check(
            "Voxel V9.45-c: der Auftrieb folgt der dilatierten See-Plane (1-Ring-Zelle = See-Spiegel)",
            h2.ringFollowsPlane
        );
        check(
            "Voxel V9.43-c.2: _waterLevelAt fällt ausserhalb der Region auf den Meeresspiegel zurück",
            h2.seaFallbackOk
        );
        check(
            "Voxel V9.43-c.2: die Schwimm-Physik speist den effektiven Wasserspiegel (Seen schwimmbar)",
            h2.physicsUsesEffWater
        );
    }

    // ### Die Flüsse carven echte Betten ###
    // `_terrainDensityAt` fragt die Hydrosphäre (Bucket-Index) und senkt die Dichte im Fluss-Kanal
    // + in See-Senken → echte Rinnen mit Ufern + Becken. Zirkel-frei über das `_hydroComputing`-
    // Suppress-Flag; ohne Hydrosphäre bit-identisch zum Feld ohne Carve.
    const voxelV943d = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        out.methodsExist = typeof r._hydrosphereCarveAt === "function" && typeof r._hydroBuildCarveIndex === "function";
        const hydro = r.state.hydrosphere;
        out.hydroReady = !!(hydro && hydro.ready);
        if (!out.methodsExist || !out.hydroReady) return out;
        if (r.state.worldMeta) r.state.worldMeta.voxelEdits = [];
        // (2) der Carve-Index ist an state.hydrosphere verdrahtet
        out.indexWired =
            Array.isArray(hydro.riverBuckets) &&
            hydro.lakeBedCell instanceof Float32Array &&
            hydro.lakeW instanceof Float32Array &&
            hydro.lakeNear instanceof Uint8Array &&
            typeof hydro.bucketSize === "number" &&
            typeof hydro.bucketsDim === "number";
        // Den Fluss-Mittelpunkt finden: der BREITESTE Punkt mit echter Flow-Richtung — NICHT in einem See (See-
        // Durchquerungen werden nicht gecarvt) und mit nicht-See-Nachbar, damit das Segment rp→next im Carve-Index liegt.
        // Der erste Punkt des ersten Flusses ist eine Quelle (Breite 1,2 m, Tiefe 0,4 m) — kein Fluss-Mittelpunkt.
        let rp = null;
        for (let ri = 0; ri < hydro.rivers.length; ri++) {
            const pts = hydro.rivers[ri].points;
            for (let k = 0; k + 1 < pts.length; k++) {
                if (pts[k].inLake || pts[k + 1].inLake) continue;
                if (Math.hypot(pts[k].flowX || 0, pts[k].flowZ || 0) <= 0.5) continue;
                if (!rp || (pts[k].width || 0) > (rp.width || 0)) rp = pts[k];
            }
        }
        out.foundRiverPoint = !!rp;
        if (rp) {
            const HC = r.constructor.HYDROSPHERE;
            const rx = rp.x;
            const rz = rp.z;
            // lakeNear neutralisieren: die Fluss-Sub-Tests messen den reinen Fluss-Carve, ohne dass ein
            // benachbarter See-Blend die Mess-Punkte verfälscht; am Blockende wiederhergestellt.
            const savedLN = hydro.lakeNear;
            hydro.lakeNear = new Uint8Array(savedLN.length);
            // (3) der Kanal formt den Fluss-Mittelpunkt (`_hydrosphereCarveAt` liefert { P, L, k } — P der Kanal: Flachboden
            // unter dem Spiegel), und das Bett liegt unter der Wasser-Fläche.
            const kanal = r._hydrosphereCarveAt(rx, rz);
            const rvM = r._hydroRiverAt(rx, rz);
            out.riverCenterCarved = !!(kanal && rvM && kanal.P < rvM.surfaceY - 0.5 && kanal.L >= kanal.P);
            // (4) das Bett liegt unter den Ufern: die Bank steigt von der Fluss-Mitte mit ihrer Neigung zur Krone (halbe
            // Breite + Tiefe / bankNeigung, die Tiefe aus `_flussTiefe`).
            const D = r.constructor._flussTiefe(rp);
            const halfW = rp.width * 0.5;
            const pX = -rp.flowZ;
            const pZ = rp.flowX;
            const midOff = halfW + (D / HC.bankNeigung) * 0.75;
            const kMid = r._hydrosphereCarveAt(rx + pX * midOff, rz + pZ * midOff);
            out.bedBelowBanks = !!(kanal && kMid && kanal.P < kMid.P);
            // (5) die Voxel-Fläche liegt AUF der Gestalt: die Fluss-Mitte trägt den Flachboden (auf die Scan-Körnung
            // von `_voxelSurfaceY`, 1,2 m).
            const sKanal = r._voxelSurfaceY(rx, rz);
            out.surfaceLowered = !!kanal && Number.isFinite(sKanal) && Math.abs(sKanal - kanal.P) < 1.3;
            // (8) der Kanal formt das Gelände: die _terrainDensityAt-Dichte mit Kanal === das weiche Minimum aus Kanal und
            // dem weichen Maximum aus Gelände (die Dichte ohne Kanal, das Suppress-Flag) und Damm.
            const y = (r.state.terrainBaseHeight || 0) + 10;
            const dCarve = r._terrainDensityAt(rx, y, rz);
            r._hydroComputing = true;
            const dSuppressed = r._terrainDensityAt(rx, y, rz);
            r._hydroComputing = false;
            let carveSoll = null;
            if (kanal) {
                const dL = kanal.L - y;
                let hk = Math.max(kanal.k - Math.abs(dSuppressed - dL), 0) / kanal.k;
                const damm = Math.max(dSuppressed, dL) + hk * hk * kanal.k * 0.25;
                const dP = kanal.P - y;
                hk = Math.max(kanal.k - Math.abs(damm - dP), 0) / kanal.k;
                carveSoll = Math.min(damm, dP) - hk * hk * kanal.k * 0.25;
            }
            out.carveIsSubtractive = carveSoll !== null && Math.abs(carveSoll - dCarve) < 0.001;
            // (9) ohne Hydrosphäre kein Kanal (bit-identisch zum Feld ohne Carve)
            const savedHydro = r.state.hydrosphere;
            r.state.hydrosphere = null;
            out.carveZeroWithoutHydro = r._hydrosphereCarveAt(rx, rz) === null;
            r.state.hydrosphere = savedHydro;
            // (10) der Chunk-Boden bleibt fest auf der Fluss-Mitte
            const base = r.state.terrainBaseHeight || 0;
            out.floorSolid = r._terrainDensityAt(rx, base - 56, rz) > 0;
            hydro.lakeNear = savedLN;
        }
        // (6+7) Ein See-Becken wird ein flacher, wasserdichter Topf: `_hydrosphereLakeAt` liefert bedY
        // über dem Meeresspiegel (Meeres-Plane verdeckt) und unter dem See-Spiegel; die Voxel-Surface
        // sitzt auf bedY, knapp darunter fester Grund.
        // Gemessen an der Kachel des See-Orts (`__wasserOrt`: die Heimat trägt seit K16 keinen See).
        out.lakeSculpted = false;
        out.lakeBedWatertight = false;
        const wl2 = typeof r.state.waterLevel === "number" ? r.state.waterLevel : -Infinity;
        const seeOrt = window.__wasserOrt("see");
        const seeH = seeOrt ? seeOrt.hydro : hydro;
        for (let li = 0; li < seeH.lakes.length && !out.lakeSculpted; li++) {
            const lk = seeH.lakes[li];
            if (!Array.isArray(lk.cells) || lk.cells.length === 0) continue;
            if (lk.level <= wl2 + 2) continue; // faktisch Meeresspiegel — nicht gesculptet
            const idx = lk.cells[(lk.cells.length / 2) | 0];
            const ci = idx % seeH.dim;
            const cj = (idx / seeH.dim) | 0;
            const wx = seeH.originX + (ci + 0.5) * seeH.cell;
            const wz = seeH.originZ + (cj + 0.5) * seeH.cell;
            const la = r._hydrosphereLakeAt(wx, wz);
            if (la && la.w > 0.5 && Number.isFinite(la.bedY)) {
                out.lakeSculpted = true;
                const bedOk = la.bedY > wl2 && la.bedY < lk.level;
                const solidBelow = r._terrainDensityAt(wx, la.bedY - 2, wz) > 0;
                const surfY = r._voxelSurfaceY(wx, wz);
                const surfOnBed = Number.isFinite(surfY) && Math.abs(surfY - la.bedY) < 2.5;
                out.lakeBedWatertight = bedOk && solidBelow && surfOnBed;
            }
        }
        // (11) Re-Compute ist zirkel-frei: das Suppress-Flag hält den
        // Carve aus der eigenen Berechnung — ein Re-Compute liefert
        // dasselbe Netz wie der un-gecarvte Worldgen-Compute.
        const reHydro = r._computeHydrosphere();
        out.recomputeStable = JSON.stringify(reHydro.rivers) === JSON.stringify(hydro.rivers);
        // (12) das Suppress-Flag ist nach dem Bau zurückgesetzt
        out.flagClean = !r._hydroComputing;
        // (13) Das Wasser-Cell-Feld fragt den ATLAS-STRIKTEN Spiegel (`_buildVoxelChunkWaterCells` ruft
        // `_atlasWaterLevelAt` je xz-Spalte), nicht das dilatierende `_waterLevelAt` — sonst
        // Wasserschatten an Hängen.
        out.unifiedQueriesRivers =
            typeof r._buildVoxelChunkWaterCells === "function" &&
            /_atlasWaterLevelAt/.test(window.__codeOf(r._buildVoxelChunkWaterCells));
        // (14) der Carve ist im Perf-Budget
        const t0 = performance.now();
        const span = hydro.size;
        for (let i = 0; i < 50000; i++) {
            r._hydrosphereCarveAt(
                hydro.originX + (i % 211) * (span / 211),
                hydro.originZ + ((i * 7) % 211) * (span / 211)
            );
        }
        out.carvePerfMs = performance.now() - t0;
        return out;
    });

    if (voxelV943d && !voxelV943d.error) {
        const d = voxelV943d;
        check("Voxel V9.43-d: _hydrosphereCarveAt + _hydroBuildCarveIndex existieren", d.methodsExist);
        check(
            "Voxel V9.43-d: der Carve-Index ist an state.hydrosphere verdrahtet (riverBuckets/lakeBedCell/lakeW/lakeNear)",
            d.indexWired
        );
        check(
            "Voxel V9.43-d → Welle L: der Kanal formt einen Fluss-Mittelpunkt (Flachboden unter dem Spiegel)",
            d.riverCenterCarved
        );
        check("Voxel V9.43-d: das Fluss-Bett liegt unter den Ufern (die Gestalt steigt zur Bank an)", d.bedBelowBanks);
        check("Voxel V9.43-d → Welle L: die Voxel-Fläche liegt auf dem Flachboden des Kanals", d.surfaceLowered);
        check(
            "Voxel V9.43-d → Welle L: der Kanal formt das Gelände (weiches Minimum aus Kanal und dem weichen Maximum aus Gelände und Damm — die Bank läuft ins Gelände aus)",
            d.carveIsSubtractive
        );
        check(
            "Voxel V9.43-d: ohne Hydrosphäre kein Kanal (bit-identisch zum Feld ohne Carve)",
            d.carveZeroWithoutHydro
        );
        check("Voxel V9.43-d: der Chunk-Boden bleibt fest auf einer Fluss-Mitte (V9.12-Garantie)", d.floorSolid);
        check("Voxel V9.45-b: ein See-Becken wird zu einem flachen Topf gesculptet", d.lakeSculpted);
        check(
            "Voxel V9.45-b: der See-Boden ist wasserdicht — über dem Meer, unter dem Spiegel, fester Grund",
            d.lakeBedWatertight
        );
        check(
            "Voxel V9.43-d: ein Re-Compute bleibt zirkel-frei (Suppress-Flag — gleiches Netz wie der Worldgen-Compute)",
            d.recomputeStable
        );
        check("Voxel V9.43-d: das _hydroComputing-Suppress-Flag ist nach dem Bau zurückgesetzt", d.flagClean);
        check(
            "Voxel V13.1: das Wasser-Cell-Feld fragt den Atlas-strikten Spiegel (`_atlasWaterLevelAt`)",
            d.unifiedQueriesRivers
        );
        check(
            "Voxel V9.43-d: der Carve ist im Perf-Budget (50k Aufrufe < 300 ms)",
            typeof d.carvePerfMs === "number" && d.carvePerfMs < 300,
            `carvePerfMs=${Math.round(d.carvePerfMs || 0)} ms`
        );
    }

    // ### Wasser-Klang (Welle 5 Klang) ###
    // Das Ohr hört das Wasser über den Hör-Ring (klang:UMWELT.ohr): je Punkt nass (Boden unter dem Spiegel) und
    // Strömung (`_waterFlowAt`); der Wasserfall der Region über `_hydroFor`. Die Mischung des Gesetzes macht daraus
    // Pegel — nah hörbar, 5 km fern stumm. Der Ring wird hier einmal ganz gefegt (der Takt fegt ohr.probenJeFrame).
    const voxelV943e = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        if (!r.state.symphony.enabled) {
            try {
                r.initSymphony();
            } catch (e) {
                void e;
            }
        }
        const s = r.state.symphony;
        out.symphonyOn = !!s.enabled && !!s.umwelt;
        const hydro = r.state.hydrosphere;
        out.hasHydro = !!(hydro && hydro.ready);
        if (out.symphonyOn && out.hasHydro && r.state.playerMesh) {
            const um = s.umwelt;
            const K = um.kern;
            const pm = r.state.playerMesh.position;
            const orig = { x: pm.x, z: pm.z };
            const fegen = (x, z) => {
                pm.x = x;
                pm.z = z;
                r._umweltRingProbe(um, x, z, um.ring.punkte.length);
                return K.umweltMischung(r._umweltLage());
            };
            let rp = null;
            for (const rv of hydro.rivers || []) {
                if (rv.points && rv.points.length > 2) {
                    rp = rv.points[Math.floor(rv.points.length / 2)];
                    break;
                }
            }
            out.hasRiver = !!rp;
            // −∞ reist über die Brücke als null (null > −64 ist wahr — Lehre 17): stumm heißt −999.
            const db = (v) => (Number.isFinite(v) ? v : -999);
            if (rp) {
                out.flussNah = db(fegen(rp.x, rp.z).fluss.db);
                out.flussFern = db(fegen(rp.x + 5000, rp.z + 5000).fluss.db);
            }
            // Der Wasserfall, wo das Gesetz ihn setzt (`__wasserOrt("fall")`): die Heimat-Kachel trug ihre Stürze an den
            // Gruben der Canyon-Maske (K16 gefallen) — der Lauf des Flussnetzes fällt dort nirgends 6 m steil.
            const wfOrt = window.__wasserOrt("fall");
            const wf = wfOrt ? wfOrt.fall : null;
            out.hasWaterfall = !!wf;
            if (wf) {
                out.fallNah = db(fegen(wf.x, wf.z).fall.db);
                out.fallFern = db(fegen(wf.x + 5000, wf.z + 5000).fall.db);
            }
            out.schwelle = K.UMWELT.hoerschwelleDb;
            fegen(orig.x, orig.z);
        }
        return out;
    });

    if (!voxelV943e || voxelV943e.error) {
        check(
            "Welle 5 Klang: Wasser-Klang-Snapshot erreichbar",
            false,
            (voxelV943e && voxelV943e.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        const e = voxelV943e;
        const zahl = (v) => (v > -900 ? v.toFixed(1) : "−∞");
        check("Welle 5 Klang: Symphonie + Klang-Welt aktiv (initSymphony headless)", e.symphonyOn);
        check(
            "Welle 5 Klang: der Hör-Ring hört den Fluss (nah über der Hörschwelle, 5 km fern stumm)",
            e.hasRiver === true && e.flussNah >= e.schwelle && e.flussFern < e.schwelle,
            `nah=${zahl(e.flussNah)} dB fern=${zahl(e.flussFern)} dB`
        );
        // Pflicht wie vor der Welle (V9.43-e): die Hydrosphäre der Standard-Saat trägt Wasserfälle (die Kacheln bis zum
        // zweiten Ring um den Ursprung) — fehlt einer, ist das ein Befund, kein stilles Auslassen.
        check(
            "Welle 5 Klang: der Wasserfall donnert nah, schweigt fern",
            e.hasWaterfall === true && e.fallNah >= e.schwelle && e.fallFern < e.schwelle,
            e.hasWaterfall
                ? `nah=${zahl(e.fallNah)} dB fern=${zahl(e.fallFern)} dB`
                : "kein Wasserfall in den Kacheln bis zum zweiten Ring"
        );
    }
}

// Wasser-Cell-Feld: CELL_STATE (eingefroren), `_buildVoxelChunkWaterCells`, Klassifikation und
// Determinismus an einem streaming-aktiven Chunk.
async function checkBandWelleC1WaterCells(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        // 1) Konstante CELL_STATE
        const STATE = r.constructor.CELL_STATE;
        out.hasCellState = !!STATE;
        out.cellStateAir = STATE && STATE.AIR;
        out.cellStateWater = STATE && STATE.WATER;
        out.cellStateSolid = STATE && STATE.SOLID;
        out.cellStateFrozen = STATE && Object.isFrozen(STATE);
        // 2) Methode `_buildVoxelChunkWaterCells` existiert
        out.hasMethod = typeof r._buildVoxelChunkWaterCells === "function";
        // 3) Streaming-aktiver Chunk hat waterCells (die LOD wandert pro Chunk — Entry-LOD lesen, nicht
        // den Default-`_voxelChunkConfig()`-Snapshot).
        if (!r.state.voxelChunks || r.state.voxelChunks.size === 0) {
            return { ...out, error: "no voxel chunks streamed" };
        }
        // Den ersten "filled" Chunk wählen (mit Mesh, nicht empty) — am Wasser-Ort des Gesetzes (`__wasserChunk`: die
        // Heimat trägt seit K16 keinen See; ohne Wasser-Zelle gibt es kein waterCells-Feld).
        out.wasserChunk = window.__wasserChunk("see");
        let testKey = null;
        let testEntry = null;
        for (const [key, entry] of r.state.voxelChunks.entries()) {
            if (entry && entry.mesh && entry.waterCells) {
                testKey = key;
                testEntry = entry;
                break;
            }
        }
        out.foundFilledChunk = !!testEntry;
        if (!testEntry) {
            return { ...out, foundFilledChunk: false };
        }
        out.testKey = testKey;
        // 4) Konfig + Erwartungen: Wasser-Cells leben IMMER auf LOD 0 (71424 Cells), unabhängig von
        // entry.lod — naht-frei per Konstruktion; nur das Terrain ist LOD-aware.
        const entryLod = Number.isFinite(testEntry.lod) ? testEntry.lod : 0;
        const cfg = r._voxelChunkConfig(0); // Wasser-Cells immer LOD 0
        const expectedLen = cfg.dim * cfg.dim * cfg.dimY;
        out.expectedLen = expectedLen;
        out.entryLod = entryLod;
        out.hasWaterCells = testEntry.waterCells instanceof Uint8Array;
        out.waterCellsLen = testEntry.waterCells.length;
        out.waterCellsLenCorrect = testEntry.waterCells.length === expectedLen;
        // 5) Klassifikations-Stichprobe: 64 Cells gegen die Cell-Klassifikations-Logik (globales Band +
        // Density-Regel): über dem Band AIR, darunter WATER, im Band Density+waterLevel-Check.
        const commaIdx = testKey.indexOf(",");
        const cx = parseInt(testKey.slice(0, commaIdx), 10);
        const cz = parseInt(testKey.slice(commaIdx + 1), 10);
        const span = cfg.span;
        const step = cfg.step;
        const base = r.state.terrainBaseHeight || 0;
        const oy = base - cfg.floorDrop;
        const ox = cx * span;
        const oz = cz * span;
        const band = r.state.hydroBand || { top: Infinity, bottom: -Infinity };
        let mismatches = 0;
        let solidCount = 0;
        let waterCount = 0;
        let airCount = 0;
        const SAMPLES = 64;
        for (let n = 0; n < SAMPLES; n++) {
            const i = (n * 17) % cfg.dim;
            const k = ((n * 19 + 5) | 0) % cfg.dim;
            const j = ((n * 23 + 11) | 0) % cfg.dimY;
            const idx = i + k * cfg.dim + j * cfg.dim * cfg.dim;
            const actual = testEntry.waterCells[idx];
            const cy = oy + (j + 0.5) * step;
            const cxw = ox + (i + 0.5) * step;
            const czw = oz + (k + 0.5) * step;
            // Die Klassifikation ist ein 3D-Flood-Fill (verbundenes Wasser), nicht billig nachrechenbar →
            // der Test prüft die Flood-INVARIANTEN: WATER ist NIE solide (Density ≤ 0) und NIE über dem
            // Hydro-Band (cy ≤ band.top). SOLID wird nicht geprüft (der Architektur-Stempel darf
            // nicht-solides Terrain SOLID setzen). 8-Corner-Avg-Density am Cell-Center wie der Build.
            let dSum = 0;
            for (let dj = 0; dj <= 1; dj++) {
                for (let dk = 0; dk <= 1; dk++) {
                    for (let di = 0; di <= 1; di++) {
                        dSum += r._terrainDensityAt(ox + (i + di) * step, oy + (j + dj) * step, oz + (k + dk) * step);
                    }
                }
            }
            const d = dSum / 8;
            if (actual === STATE.WATER && (d > 0 || cy > band.top + 0.01)) mismatches++;
            if (actual === STATE.SOLID) solidCount++;
            else if (actual === STATE.WATER) waterCount++;
            else airCount++;
        }
        out.mismatches = mismatches;
        // Geprüft via Main-`_terrainDensityAt`, gebaut evtl. vom Worker (transzendente Präzisions-Drift):
        // an Borderline-Cells (d≈0) flippen 1–2 Cells als Rauschen; ein echter Bug flippt Dutzende.
        out.classificationCorrect = mismatches <= 2;
        out.sampleSolidCount = solidCount;
        out.sampleWaterCount = waterCount;
        out.sampleAirCount = airCount;
        // 6) Determinismus: ein zweiter Build des SELBEN Chunks ergibt das gleiche Feld. Die dirty-Queue
        // vorher drainen, sonst trägt testEntry.waterCells einen alten Stempel-Stand und der zweite Build
        // den aktuellen (Stempel-Drift).
        if (typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        const refreshed = r.state.voxelChunks.get(testKey);
        const reference = refreshed && refreshed.waterCells ? refreshed.waterCells : testEntry.waterCells;
        const second = r._buildVoxelChunkWaterCells(ox, oy, oz, step, null, 0);
        out.secondLen = second.length;
        let driftCount = 0;
        for (let i = 0; i < expectedLen; i++) {
            if (reference[i] !== second[i]) driftCount++;
        }
        out.deterministic = driftCount === 0;
        out.driftCount = driftCount;
        // 7) Realismus-Check: über alle Cells hinweg gibt es überhaupt
        // Wasser-Cells (sonst ist die Welt komplett trocken — Bug)? Plus:
        // gibt es solid-Cells (sonst ist die Welt leer)?
        let totalSolid = 0;
        let totalWater = 0;
        let totalAir = 0;
        for (let i = 0; i < testEntry.waterCells.length; i++) {
            const s = testEntry.waterCells[i];
            if (s === STATE.SOLID) totalSolid++;
            else if (s === STATE.WATER) totalWater++;
            else totalAir++;
        }
        out.totalSolid = totalSolid;
        out.totalWater = totalWater;
        out.totalAir = totalAir;
        out.hasSolidCells = totalSolid > 0;
        // Wasser-Realismus: ein Küsten-Chunk sollte ≥ 1 water haben;
        // ein Hochland-Chunk darf 0 water haben. Wir verlangen NICHT
        // dass jeder Chunk Wasser hat — nur dass das Feld nicht-leer ist.
        out.hasMeaningfulField = totalSolid + totalWater + totalAir === testEntry.waterCells.length;
        return out;
    });
    if (res.error) {
        check("Welle C.1 V9.71: Cell-Feld-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle C.1 V9.71: CELL_STATE existiert + ist freezed", res.hasCellState && res.cellStateFrozen);
    check(
        "Welle C.1 V9.71: CELL_STATE.AIR=0, WATER=1, SOLID=2",
        res.cellStateAir === 0 && res.cellStateWater === 1 && res.cellStateSolid === 2
    );
    check("Welle C.1 V9.71: _buildVoxelChunkWaterCells existiert", res.hasMethod);
    check("Welle C.1 V9.71: streaming-aktiver gefüllter Chunk gefunden (Vorbedingung)", res.foundFilledChunk);
    if (!res.foundFilledChunk) return;
    check("Welle C.1 V9.71: entry.waterCells ist Uint8Array", res.hasWaterCells);
    check(
        "Welle C.1 V9.71: entry.waterCells.length = dim·dim·dimY",
        res.waterCellsLenCorrect,
        `len=${res.waterCellsLen}, expected=${res.expectedLen}`
    );
    check(
        "Welle C.1 V9.71: Klassifikations-Stichprobe (64 Cells) stimmt mit Density+waterLevel überein (≤2 Borderline-Drift toleriert)",
        res.classificationCorrect,
        `mismatches=${res.mismatches} (solid=${res.sampleSolidCount}, water=${res.sampleWaterCount}, air=${res.sampleAirCount})`
    );
    check(
        "Welle C.1 V9.71: Re-Build ergibt bit-identisches Feld (Determinismus)",
        res.deterministic,
        `drift=${res.driftCount}`
    );
    check(
        "Welle C.1 V9.71: Chunk hat solid-Cells (Welt nicht leer)",
        res.hasSolidCells,
        `totalSolid=${res.totalSolid}, totalWater=${res.totalWater}, totalAir=${res.totalAir}`
    );
    check("Welle C.1 V9.71: Cell-Summe stimmt mit Feld-Länge (kein unklassifizierter State)", res.hasMeaningfulField);
}

// Iso-Surface-Mesher ist der EINZIGE Wasser-Render-Pfad. Beweist: `state.voxelChunkWaterIso`-Map
// + Build/Dispose existieren, der Chunk-Finalize baut sie (Source-Probe), gefüllte Chunks tragen
// ein sichtbares Iso-Mesh (trockene null) mit geteiltem `hydroSurfaceMaterial`, und Bergsee-Cells
// über waterLevel werden als WATER erfasst.
async function checkBandWelleC2WaterIsoSurface(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        const STATE = r.constructor.CELL_STATE;
        // 1) State-Feld existiert (Map)
        out.hasIsoMap = r.state.voxelChunkWaterIso !== undefined;
        // V9.75 — Toggle ist weg, Iso-Mesh ist der EINZIGE Wasser-Mesh.
        out.toggleGone = typeof r._setVoxelWaterIsoVisible === "undefined";
        out.oldQuadStateGone = typeof r.state.voxelChunkWater === "undefined";
        // 2) Methoden existieren
        out.hasBuildMethod = typeof r._buildVoxelChunkWaterIsoSurface === "function";
        out.hasDisposeMethod = typeof r._disposeVoxelChunkWaterIso === "function";
        // V12.0-perf.h — die ausstehenden Wasser-Iso-Builds drainen, bevor wir
        // die Iso-Map prüfen (im Spiel baut der per-Frame-Tick ≤2/Frame).
        if (typeof r._drainPendingWaterIso === "function") r._drainPendingWaterIso();
        // 4) Nach Worldgen: prüfe alle streaming-aktiven Chunks. Die Map
        // sollte für jeden gefüllten Chunk einen Eintrag haben (Mesh oder
        // null, je nach Wasser-Existenz im Chunk).
        if (!r.state.voxelChunkWaterIso || !r.state.voxelChunks) {
            return { ...out, error: "iso map or chunks empty" };
        }
        let chunksWithIso = 0;
        let chunksWithoutIso = 0;
        let isoMeshCount = 0;
        let isoMeshVisibleCount = 0;
        let isoMeshGeomTotal = 0;
        let sampleMeshKey = null;
        for (const [key, entry] of r.state.voxelChunks.entries()) {
            if (!entry || !entry.mesh || !entry.waterCells) continue;
            const m = r.state.voxelChunkWaterIso.get(key);
            if (m === undefined) {
                chunksWithoutIso++;
                continue;
            }
            chunksWithIso++;
            if (m && m.geometry) {
                isoMeshCount++;
                isoMeshGeomTotal += m.geometry.getAttribute("position").count;
                if (m.visible) isoMeshVisibleCount++;
                if (!sampleMeshKey) sampleMeshKey = key;
            }
        }
        out.chunksWithIso = chunksWithIso;
        out.chunksWithoutIso = chunksWithoutIso;
        out.isoMeshCount = isoMeshCount;
        out.isoMeshGeomTotal = isoMeshGeomTotal;
        out.isoMeshVisibleCount = isoMeshVisibleCount;
        out.allChunksTracked = chunksWithoutIso === 0;
        // V9.75 — Iso-Meshes sind default sichtbar (kein Toggle mehr).
        out.allIsoVisible = isoMeshCount > 0 && isoMeshVisibleCount === isoMeshCount;
        // 7) Cell-Init erfasst Bergsee-Wasser über state.waterLevel: existieren Lake-Cells im
        // 16-m-Hydrosphäre-Atlas, MUSS in einem Chunk ihres Footprints mindestens eine water-Cell über
        // state.waterLevel stehen (sonst fehlen Bergseen im Iso-Mesh).
        const wlGlobal = r.state.waterLevel;
        let bergseeCellsFound = false;
        let bergseeCheckable = false;
        const hydro = r.state.hydrosphere;
        if (hydro && hydro.ready && hydro.water && hydro.water.waterKind) {
            // Suche eine Lake-Cell mit waterY > wlGlobal + 1 (klarer Bergsee)
            const wK = hydro.water.waterKind;
            const wY = hydro.water.waterY;
            for (let idx = 0; idx < wK.length; idx++) {
                if (wK[idx] === 2 && wY[idx] > wlGlobal + 1) {
                    bergseeCheckable = true;
                    break;
                }
            }
            if (bergseeCheckable) {
                // Scanne alle Chunk-Cells nach mind. einer water-Cell mit cy > wlGlobal
                const cfg = r._voxelChunkConfig();
                const base = r.state.terrainBaseHeight || 0;
                const ooy = base - cfg.floorDrop;
                for (const [, entry] of r.state.voxelChunks.entries()) {
                    if (!entry || !entry.waterCells) continue;
                    const cells = entry.waterCells;
                    for (let j = 0; j < cfg.dimY; j++) {
                        const cy = ooy + (j + 0.5) * cfg.step;
                        if (cy <= wlGlobal + 0.5) continue; // nur OBER globalem Spiegel
                        const baseJ = j * cfg.dim * cfg.dim;
                        let found = false;
                        for (let n = 0; n < cfg.dim * cfg.dim && !found; n++) {
                            if (cells[baseJ + n] === STATE.WATER) found = true;
                        }
                        if (found) {
                            bergseeCellsFound = true;
                            break;
                        }
                    }
                    if (bergseeCellsFound) break;
                }
            }
        }
        out.bergseeCheckable = bergseeCheckable;
        out.bergseeCellsFound = bergseeCellsFound;
        // 8) Material-Probe: Mesh nutzt das geteilte hydroSurfaceMaterial
        // (NICHT eigener Shader).
        if (sampleMeshKey) {
            // Deterministisch die STATISCHE Wasser-Form prüfen (flach auf L, kein Bank-Klettern): nach einem
            // Carve darf Wasser dynamisch bis +4 m über L fließen (surfY = L + caDelta, _caWaterTopDelta),
            // und ein früheres Band hinterlässt caDelta in waterLevelCells. Darum das CA leeren + die
            // sampleMesh frisch bauen (caDelta=0) — geprüft wird die ruhende Form, nicht der Live-Fluss.
            if (r.state.waterLevelCells && r.state.waterLevelCells.size > 0) {
                r.state.waterLevelCells.clear();
                const _sc = sampleMeshKey.split(",");
                r._buildVoxelChunkWaterIsoSurface(Number(_sc[0]), Number(_sc[1]));
            }
            const sampleMesh = r.state.voxelChunkWaterIso.get(sampleMeshKey);
            out.sampleMeshUsesHydroMat = sampleMesh.material === r.state.hydroSurfaceMaterial;
            // Der EINE Render-Pfad ist das Zell-Oberkanten-Sheet ("chunk-water-cellsheet"); der Debug-Zwilling
            // „Zell-Iso" ist gefallen (Welle L, W-kD7).
            out.sampleMeshUserData = !!sampleMesh.userData && sampleMesh.userData.hydroKind === "chunk-water-cellsheet";
            // Wasser ist eine FLÄCHE, kein Volumen: Material BackSide (von oben sichtbar, von unten
            // front-gecullt) + keine Unterseiten-Dreiecke (ny>0.2 am Build verworfen) — sonst „Wasser auf
            // der falschen Seite des Bodens“. Über ALLE Iso-Meshes gezählt.
            const BACK = window.THREE && window.THREE.BackSide !== undefined ? window.THREE.BackSide : 1;
            // Der Tauch-Pass macht das GETEILTE Material DoubleSide, solange die KAMERA unter Wasser liegt
            // (`_applyDayNightToScene` fragt `_koerperWasser` an der Kamera) — korrekt, aber nicht der
            // Oberflächen-Vertrag. Darum deterministisch den OBERFLÄCHEN-Zustand prüfen (überall trocken = BackSide),
            // zustands-neutral mit Restore — sonst kippt es mit der Kamera-Position.
            out.waterMatBackSide = (() => {
                if (!r.state.hydroSurfaceMaterial) return false;
                try {
                    r._koerperWasser = () => -Infinity;
                    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                    return r.state.hydroSurfaceMaterial.side === BACK;
                } finally {
                    delete r._koerperWasser;
                    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                }
            })();
            let undersideTris = 0;
            let topsTris = 0;
            for (const [, mm] of r.state.voxelChunkWaterIso) {
                if (!mm || !mm.geometry || !mm.geometry.attributes.position) continue;
                const pos = mm.geometry.attributes.position;
                const idx = mm.geometry.index ? mm.geometry.index.array : null;
                const tc = idx ? idx.length / 3 : Math.floor(pos.count / 3);
                for (let t = 0; t < tc; t++) {
                    const a = idx ? idx[t * 3] : t * 3;
                    const b = idx ? idx[t * 3 + 1] : t * 3 + 1;
                    const c = idx ? idx[t * 3 + 2] : t * 3 + 2;
                    const ax = pos.getX(a);
                    const ay = pos.getY(a);
                    const az = pos.getZ(a);
                    const e1x = pos.getX(b) - ax;
                    const e1y = pos.getY(b) - ay;
                    const e1z = pos.getZ(b) - az;
                    const e2x = pos.getX(c) - ax;
                    const e2y = pos.getY(c) - ay;
                    const e2z = pos.getZ(c) - az;
                    const nx = e1y * e2z - e1z * e2y;
                    const ny = e1z * e2x - e1x * e2z;
                    const nz = e1x * e2y - e1y * e2x;
                    const nl = Math.hypot(nx, ny, nz) || 1e-9;
                    const nyn = ny / nl;
                    // V18.4 W1: nur die Unterseite (ny>0.2) verworfen → undersideTris ≈ 0;
                    // Oberseite + Ufer/Fluss-Drops (fast-vertikal) bleiben (top-only reverted).
                    if (nyn > 0.2) undersideTris++;
                    else topsTris++;
                }
            }
            out.waterUndersideTris = undersideTris;
            out.waterTopsTris = topsTris;
            // Die Fläche IST das Feld L: jeder Vertex sitzt EXAKT auf `_atlasWaterLevelAt(x,z,-Inf)` (keine
            // ±1-m-Zell-Granularität). Nur im surface-Modus messbar (der iso-Modus baut die Zell-Iso).
            if (sampleMesh.userData && sampleMesh.userData.hydroKind === "chunk-water-cellsheet") {
                const sp = sampleMesh.geometry.attributes.position;
                const ad = sampleMesh.geometry.attributes.aDepth;
                // Der Wasser-KÖRPER (aDepth ≥ 1 Zelle = 1.8 m) sitzt FLACH auf L; die Über-Deckung (aDepth→0,
                // Rim/Ribbon) neigt sich auf das Terrain und darf < L sein, aber NIE über L
                // (`min(L,…)`-Garantie, kein Bank-Klettern).
                let mx = 0; // |Y−L| über das echte Wasser → muss ~0 (flach auf L)
                let mxAbove = 0; // max(Y−L) über ALLE Vertices → muss ~0 (nie über L)
                for (let v = 0; v < sp.count; v++) {
                    const vx = sp.getX(v);
                    const vz = sp.getZ(v);
                    const L = r._atlasWaterLevelAt(vx, vz, -Infinity);
                    if (!isFinite(L)) continue;
                    // FLACH messen: an Fluss-GEFÄLLEN weicht das glättende Zell-Sheet legitim von der lokalen L ab
                    // (Oberflächenspannung); der Wächter prüft Klettern auf flachen Körpern, nicht das Gefälle.
                    const l1 = r._atlasWaterLevelAt(vx + 2.7, vz, -Infinity);
                    const l2 = r._atlasWaterLevelAt(vx - 2.7, vz, -Infinity);
                    const l3 = r._atlasWaterLevelAt(vx, vz + 2.7, -Infinity);
                    const l4 = r._atlasWaterLevelAt(vx, vz - 2.7, -Infinity);
                    const flat =
                        isFinite(l1) &&
                        isFinite(l2) &&
                        isFinite(l3) &&
                        isFinite(l4) &&
                        Math.max(Math.abs(l1 - L), Math.abs(l2 - L), Math.abs(l3 - L), Math.abs(l4 - L)) < 0.05;
                    if (!flat) continue;
                    const dy = sp.getY(v) - L;
                    if (dy > mxAbove) mxAbove = dy;
                    const depthM = ad ? ad.getX(v) : 2;
                    if (depthM >= 1.8 && Math.abs(dy) > mx) mx = Math.abs(dy);
                }
                out.surfaceMaxLErr = mx;
                out.surfaceMaxAboveL = mxAbove;
            } else {
                out.surfaceMaxLErr = "skip — iso-Modus (A/B)";
            }
        } else {
            // Welt hatte keinen Iso-Mesh (z.B. alle Chunks im Hochland, kein
            // Wasser) — Test überspringen, aber als sanity-skip markieren.
            out.sampleMeshUsesHydroMat = "skip — kein Iso-Mesh in der Welt";
            out.sampleMeshUserData = "skip";
            out.waterMatBackSide = "skip";
            out.waterUndersideTris = "skip";
            out.waterTopsTris = "skip";
        }
        return out;
    });
    if (res.error) {
        check("Welle C.2 V9.72: Iso-Mesher-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle C.2 V9.72: state.voxelChunkWaterIso existiert", res.hasIsoMap);
    check("Welle C.2 V9.75: alter Quad-Mesh-Pfad (`state.voxelChunkWater`) ist gestrichen", res.oldQuadStateGone);
    check("Welle C.2 V9.75: Migration-Toggle (`_setVoxelWaterIsoVisible`) ist gestrichen", res.toggleGone);
    check("Welle C.2 V9.72: Build + Dispose Methoden existieren", res.hasBuildMethod && res.hasDisposeMethod);
    check(
        "Welle C.2 V9.72: alle gefüllten Voxel-Chunks haben einen Iso-Map-Eintrag",
        res.allChunksTracked,
        `mitIso=${res.chunksWithIso}, ohne=${res.chunksWithoutIso}, geomTotal=${res.isoMeshGeomTotal}, meshes=${res.isoMeshCount}`
    );
    if (res.isoMeshCount > 0) {
        check(
            "Welle C.2 V9.75: alle Iso-Meshes sind default sichtbar (einziger Wasser-Render-Pfad)",
            res.allIsoVisible,
            `visible=${res.isoMeshVisibleCount}/${res.isoMeshCount}`
        );
        check("Welle C.2 V9.72: Iso-Mesh nutzt das geteilte hydroSurfaceMaterial", res.sampleMeshUsesHydroMat === true);
        check(
            "V18.92 → Welle L: Wasser-Mesh trägt userData.hydroKind='chunk-water-cellsheet' (der EINE Render-Pfad)",
            res.sampleMeshUserData === true
        );
        check(
            "V18.1 W1: Wasser-Material ist BackSide (einseitige Flaeche, kein Volumen, kein Wasser-von-unten)",
            res.waterMatBackSide === true
        );
        check(
            "V18.4 W1: Wasser-Iso trägt KEINE Unterseiten-Dreiecke (ny>0.2 verworfen; Ufer/Fluss-Drops bleiben)",
            res.waterUndersideTris === 0,
            `Unterseite=${res.waterUndersideTris}, Oberseite=${res.waterTopsTris}`
        );
        check(
            "V18.3 W1: Wasser-Iso trägt Oberseiten-Dreiecke (von oben über die Rückseite sichtbar)",
            typeof res.waterTopsTris === "number" && res.waterTopsTris > 0,
            `Oberseite=${res.waterTopsTris}`
        );
        if (typeof res.surfaceMaxLErr === "number") {
            check(
                "V18.25/.92: Wasser-KÖRPER (flach + aDepth≥1 Zelle) sitzt auf L + klettert nicht über L (Zell-Sheet, Ruhe; Gefälle-Glättung ausgenommen)",
                res.surfaceMaxLErr <= 0.5 && res.surfaceMaxAboveL <= 0.5,
                `maxErr(Körper,flach)=${res.surfaceMaxLErr}, maxÜberL(flach)=${res.surfaceMaxAboveL}`
            );
        }
        if (res.bergseeCheckable) {
            check(
                "Welle C.2 V9.73 (Heilung): Bergsee-Cells über waterLevel sind als state=WATER im Feld",
                res.bergseeCellsFound,
                "Cells über globalem waterLevel müssen water tragen, wenn Bergsee im Hydrosphäre-Atlas vermerkt"
            );
        } else {
            check(
                "Welle C.2 V9.73 (Heilung): Bergsee-Cell-Init (Vorbedingung: ≥1 Lake mit waterY > waterLevel+1)",
                true,
                "skip — keine Bergseen in der Test-Welt (Seed-abhängig)"
            );
        }
    } else {
        check(
            "Welle C.2 V9.72: Iso-Mesh-Sichtbarkeits-Tests (Vorbedingung: ≥1 Iso-Mesh)",
            true,
            "skip — keine Wasser-Cells in den gestreamten Chunks (Worldgen-Seed-abhängig)"
        );
    }
}

// Wasser-Iso deferred-Queue: der schwerste Main-Thread-Streaming-Posten (Wasser-Iso ~78 ms) läuft
// nicht im synchronen Chunk-Finalize, sondern per-Frame-budgetiert — der Chunk ist sofort fertig
// (Terrain+Boden), das Wasser baut ≤budget/Frame nach.
async function checkBandWellePerfHWaterIsoQueue(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.voxelChunks) return { error: "no realm/chunks" };
        const out = {};
        out.hasEnqueue = typeof r._enqueueWaterIso === "function";
        out.hasTick = typeof r._tickPendingWaterIso === "function";
        out.hasDrain = typeof r._drainPendingWaterIso === "function";
        if (!out.hasEnqueue || !out.hasTick || !out.hasDrain) return out;
        out.queueIsSet = r.state.pendingWaterIso === null || r.state.pendingWaterIso instanceof Set;
        // Mechanik: 3 echte Chunk-Keys enqueuen → tick(1) baut ≤1 → drain leert.
        if (!r.state.pendingWaterIso) r.state.pendingWaterIso = new Set();
        r.state.pendingWaterIso.clear();
        const keys = [...r.state.voxelChunks.keys()].slice(0, 3);
        for (const k of keys) {
            const comma = k.indexOf(",");
            r._enqueueWaterIso(parseInt(k.slice(0, comma), 10), parseInt(k.slice(comma + 1), 10));
        }
        out.enqueuedCount = r.state.pendingWaterIso.size;
        const builtTick = r._tickPendingWaterIso(1);
        out.tickRespectsBudget = builtTick <= 1;
        out.queueShrankAfterTick = r.state.pendingWaterIso.size < out.enqueuedCount;
        r._drainPendingWaterIso();
        out.drainEmptiesQueue = r.state.pendingWaterIso.size === 0;
        // ERST DIE LÜCKE (Integration 05.10.): ein Chunk ohne aufgelöstes Sheet baut vor der Auffrischung eines NÄHEREN
        // Chunks mit Sheet — sein leeres Seebett wäre sichtbar (kein Lade-Nebel deckt es), die Auffrischung behält ihr
        // altes Sheet. tick(1) baut genau den ersten der Ordnung.
        const wi = r.state.voxelChunkWaterIso || (r.state.voxelChunkWaterIso = new Map());
        const pm = r.state.playerMesh.position;
        const span = r._voxelChunkConfig(0).span;
        const pcx = Math.floor((pm.x + span / 2) / span);
        const pcz = Math.floor((pm.z + span / 2) / span);
        const ringW = (r.state.chunkRingRadius || 4) + 2;
        const distW = (k) => {
            const [kx, kz] = k.split(",").map(Number);
            return Math.max(Math.abs(kx - pcx), Math.abs(kz - pcz));
        };
        const alleW = [...r.state.voxelChunks.keys()]
            .filter((k) => distW(k) <= ringW)
            .sort((a, b) => distW(a) - distW(b));
        const ka = alleW.find((k) => wi.has(k));
        const kb = ka ? alleW.reverse().find((k) => k !== ka && distW(k) > distW(ka) && !wi.get(k)) : null;
        if (ka && kb) {
            wi.delete(kb);
            const q = r.state.pendingWaterIso;
            q.clear();
            for (const k of [ka, kb]) r._enqueueWaterIso(...k.split(",").map(Number));
            r._tickPendingWaterIso(1);
            out.lueckeZuerst = !q.has(kb) && q.has(ka);
            r._drainPendingWaterIso();
        } else out.lueckeZuerst = "keine Proben-Chunks (" + ka + "/" + kb + ")";
        return out;
    });
    if (res.error) {
        check("V12.0-perf.h: Wasser-Iso-Queue-Band (realm)", false, res.error);
        return;
    }
    check(
        "V12.0-perf.h: _enqueueWaterIso/_tickPendingWaterIso/_drainPendingWaterIso existieren",
        res.hasEnqueue && res.hasTick && res.hasDrain
    );
    check(
        "V18.530-Integration: die Wasser-Schlange baut erst die LÜCKE (ein fernerer Chunk ohne Sheet vor der Auffrischung eines näheren)",
        res.lueckeZuerst === true,
        String(res.lueckeZuerst)
    );
    check("V12.0-perf.h: 3 Keys enqueued", res.enqueuedCount === 3, `enqueued=${res.enqueuedCount}`);
    check(
        "V12.0-perf.h: tick baut ≤budget + verkleinert die Queue (kein Burst)",
        res.tickRespectsBudget && res.queueShrankAfterTick
    );
    check("V12.0-perf.h: drain leert die Queue (Test-Naht/Edit-Instant)", res.drainEmptiesQueue);
}

// Globaler Ozean jenseits der ±1024-Region: `_atlasWaterLevelAt` + `_voxelChunkHasAnyWater` leiten
// ihn direkt aus state.waterLevel ab (in-region unberührt). Beweis: Ozean-Chunk trägt Wasser, Land
// bleibt trocken, Worker↔Main bauen bit-identische Wasser-Cells (kein Architektur-Stempel).
async function checkBandV17117FarWater(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const s = r.state;
        const h = s.hydrosphere;
        if (!h || !h.ready) return { error: "hydrosphere not ready" };
        const out = {};
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span;
        const base = s.terrainBaseHeight || 0;
        const oy = base - cfg.floorDrop;
        const WL = typeof s.waterLevel === "number" ? s.waterLevel : 0;
        const WATER = r.constructor.CELL_STATE.WATER;
        const regHalf = (h.dim * h.cell) / 2; // ±1024
        // Der Ozean-Chunk liegt am Meer-Ort des Gesetzes (`__wasserOrt`: das Meer liegt seit K16 jenseits des
        // Kontinents, nicht mehr im Ring um die Heimat); der Land-Chunk jenseits der Heimat über Chunk-Indizes
        // (selbst-konsistent: der Klassifikations-Punkt = der Chunk-Mittelpunkt), Hochland ohne Wasser des Gesetzes im
        // Fußabdruck + 64 m (die Fluss-Zelle des Index 32 m + die Ecke eines Segments): das Makro über Meer + 30 m und
        // kein Spiegel über dem Meer (`_atlasWaterLevelAt` als Existenz-Probe) — die Kacheln um die Heimat tragen das
        // Flussnetz auch im Hochland (K16), und ein Chunk am Fluss trägt zu Recht Wasser.
        const trocken = (ox, oz) => {
            for (let x = ox - 64; x <= ox + span + 64; x += 8)
                for (let z = oz - 64; z <= oz + span + 64; z += 8)
                    if (!(r._terrainMacroSurfaceY(x, z, true) > WL + 30) || r._atlasWaterLevelAt(x, z, Infinity) > WL)
                        return false;
            return true;
        };
        const meerOrt = window.__wasserOrt("meer");
        const oCx = meerOrt ? Math.floor(meerOrt.x / span) : null;
        const oCz = meerOrt ? Math.floor(meerOrt.z / span) : null;
        out.meerOrt = meerOrt ? `${Math.round(meerOrt.x)},${Math.round(meerOrt.z)}` : "keiner";
        let lCx = null,
            lCz = null;
        const cmax = Math.ceil((regHalf + 1400) / span);
        for (let cx = -cmax; cx <= cmax && lCx === null; cx++) {
            for (let cz = -cmax; cz <= cmax && lCx === null; cz++) {
                const mx = cx * span + span / 2;
                const mz = cz * span + span / 2;
                if (Math.max(Math.abs(mx), Math.abs(mz)) <= regHalf + span) continue; // ganz beyond
                if (r._terrainMacroSurfaceY(mx, mz, true) > WL + 30 && trocken(cx * span, cz * span)) {
                    lCx = cx;
                    lCz = cz;
                }
            }
        }
        out.foundOcean = oCx !== null;
        out.foundLand = lCx !== null;
        if (oCx === null) return { ...out, error: "kein Meer-Ort im Gesetz gefunden" };
        // (1) Main: Gate + Klassifikator am beyond-region Ozean.
        out.oceanGate = r._voxelChunkHasAnyWater(oCx, oCz);
        const ocCells = r._buildVoxelChunkWaterCells(oCx * span, oy, oCz * span, cfg.step, null, 0);
        let ocWater = 0;
        for (let i = 0; i < ocCells.length; i++) if (ocCells[i] === WATER) ocWater++;
        out.oceanWaterCells = ocWater;
        // (2) beyond-region Land: Gate false, keine Wasser-Cells.
        if (lCx !== null) {
            out.landGate = r._voxelChunkHasAnyWater(lCx, lCz);
            const lCells = r._buildVoxelChunkWaterCells(lCx * span, oy, lCz * span, cfg.step, null, 0);
            let lWater = 0;
            for (let i = 0; i < lCells.length; i++) if (lCells[i] === WATER) lWater++;
            out.landWaterCells = lWater;
        }
        // (3) Worker↔Main bit-identisch beyond-region (die Naht-Wand).
        try {
            await r._voxelWorkerSyncState({ op: "init" });
        } catch (e) {
            return { ...out, error: "worker init failed: " + e.message };
        }
        r._voxelWorkerSyncWorldgenState();
        await new Promise((resolve) => setTimeout(resolve, 80));
        let wm;
        try {
            wm = await r._voxelWorkerComputeChunkMesh(oCx, oCz, 0);
        } catch (e) {
            return { ...out, error: "worker mesh failed: " + e.message };
        }
        if (wm && wm.waterCells) {
            out.mainCellCount = ocCells.length;
            out.workerCellCount = wm.waterCells.length;
            let mism = 0;
            const len = Math.min(ocCells.length, wm.waterCells.length);
            for (let i = 0; i < len; i++) if (ocCells[i] !== wm.waterCells[i]) mism++;
            out.cellMismatches = mism;
            out.workerMainIdentical = mism === 0 && ocCells.length === wm.waterCells.length;
        } else {
            out.workerMainIdentical = false;
        }
        return out;
    });
    if (res.error) {
        check("V17.117 H3: Far-Water-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "V17.117 H3: beyond-region Ozean-Chunk gefunden (am Meer-Ort des Gesetzes)",
        res.foundOcean,
        `Meer-Ort ${res.meerOrt}`
    );
    check("V17.117 H3: beyond-region Ozean — Gate true", res.oceanGate === true);
    check(
        "V17.117 H3: beyond-region Ozean trägt Wasser-Cells (Heilung)",
        res.oceanWaterCells > 0,
        `cells=${res.oceanWaterCells}`
    );
    check("V17.117 H3: beyond-region Land-Chunk gefunden (Hochland ohne Wasser des Gesetzes)", res.foundLand === true);
    if (res.foundLand) {
        check("V17.117 H3: beyond-region Land — Gate false (kein Mehraufwand)", res.landGate === false);
        check(
            "V17.117 H3: beyond-region Land — keine Wasser-Cells",
            res.landWaterCells === 0,
            `cells=${res.landWaterCells}`
        );
    }
    check(
        "V17.117 H3: Worker<->Main Wasser-Cells bit-identisch beyond-region (Naht-Wand)",
        res.workerMainIdentical === true,
        `mism=${res.cellMismatches} count=${res.mainCellCount}/${res.workerCellCount}`
    );
}

// V11.0-d.1 (Pfeiler D — Wasser ↔ Kreaturen, Foundation) — Beweis dass der
// Wasser-Kontext-Helper deterministisch + korrekt arbeitet. D.2/D.3 bauen
// darauf auf, also MUSS die Foundation grün sein bevor sie geschnitten werden.
async function checkBandWelleV11D1WaterContext(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const THREE = window.THREE;
        const out = {};
        out.fnExists = typeof r._creatureWaterContextAt === "function";
        if (!out.fnExists) return out;

        // Mock-Kreatur ist EIN Objekt mit `position`-Vector3. Wir wandern es
        // im 20×20-Grid um Spawn herum und sammeln zwei Stichproben — eine
        // Land-Spalte (inWater=false), eine Wasser-Spalte (inWater=true).
        const probe = { position: new THREE.Vector3(0, 5, 0) };
        let landSample = null;
        let waterSample = null;
        const STEP = 8;
        const RANGE = 80;
        for (let dx = -RANGE; dx <= RANGE && !(landSample && waterSample); dx += STEP) {
            for (let dz = -RANGE; dz <= RANGE && !(landSample && waterSample); dz += STEP) {
                const sy = r._voxelSurfaceY(dx, dz);
                if (sy === null || !Number.isFinite(sy)) continue;
                probe.position.set(dx, sy + 0.5, dz);
                const ctx2 = r._creatureWaterContextAt(probe, sy);
                if (ctx2.inWater === false && !landSample) landSample = { dx, dz, ctx: ctx2 };
                else if (ctx2.inWater === true && !waterSample) waterSample = { dx, dz, ctx: ctx2 };
            }
        }
        out.foundLand = landSample !== null;
        out.foundWater = waterSample !== null;

        // Result-Form-Validierung (immer prüfbar wenn Helper existiert).
        if (landSample) {
            const c = landSample.ctx;
            out.landHasInWater = typeof c.inWater === "boolean";
            out.landHasDepthBelow = typeof c.depthBelow === "number";
            out.landHasSubmerged = typeof c.submerged === "boolean";
            out.landHasDistToShore = typeof c.distToShore === "number";
            out.landHasShoreDir = c.shoreDir === null;
            out.landInWaterFalse = c.inWater === false;
            out.landDistZero = c.distToShore === 0;
            out.landDepthNonPositive = c.depthBelow <= 0;
        }
        if (waterSample) {
            const c = waterSample.ctx;
            out.waterInWaterTrue = c.inWater === true;
            out.waterDepthPositive = c.depthBelow > 0;
            // shoreDir kann null sein (Mitte-Ozean) oder ein Vector3. Wenn
            // Vector3: Kardinal-Richtung (±1 oder 0 pro Komponente).
            out.waterShoreDirOk =
                c.shoreDir === null ||
                (c.shoreDir.isVector3 &&
                    Math.abs(c.shoreDir.x) <= 1 &&
                    Math.abs(c.shoreDir.z) <= 1 &&
                    c.shoreDir.y === 0);
            out.waterDistToShoreFinite = Number.isFinite(c.distToShore) || c.distToShore === Infinity;
        }

        // Performance-Probe: 200 Calls an der ersten Land-Position (sonst am Spawn).
        if (landSample) probe.position.set(landSample.dx, 5, landSample.dz);
        else probe.position.set(0, 5, 0);
        // Der Wasser-Kontext bekommt die Boden-Höhe als Param (im Frame-Loop via _creatureGroundY gecacht)
        // → die Probe reicht eine vorberechnete Surface = realistische Frame-Kosten.
        const psy = r._voxelSurfaceY(probe.position.x, probe.position.z);
        const t0 = performance.now();
        for (let i = 0; i < 200; i++) r._creatureWaterContextAt(probe, psy);
        out.perfMs = performance.now() - t0;

        // Source-Probe der Wahrheits-Quellen: `_creatureGroundY` liest den Boden UNTER dem Körper (`_koerperBodenUnter`:
        // der Feld-Scan ab der Körper-Höhe, `_voxelSurfaceY` nur ohne Fels im Band — Welle L, Höhle); der Helper liest die
        // EINE Wasser-Wahrheit am Körper (`_koerperWasser`, Welle L wasser) — Tiefe UND Ufer-Suche —, nie mehr das 3×3-gedehnte
        // `_waterLevelAt` / `_isAboveWaterAt` (die zweite Wahrheit der Ufer-Scheu).
        const helperSrc = window.__codeOf(r._creatureWaterContextAt);
        out.ohneZweiteWahrheit = !/_waterLevelAt\(|_isAboveWaterAt\(/.test(helperSrc);

        // BODEN-CACHE: die teuren `_voxelSurfaceY`-Scans sind pro Frame per Budget gedeckelt, nicht 1–2×
        // pro Kreatur. Das Budget dekrementiert je echtem Scan → hier als Scan-Zähler gelesen.
        out.groundCacheFn = typeof r._creatureGroundY === "function";
        if (out.groundCacheFn) {
            // der Leib trägt seine Gier (der Boden blickt längs ihr voraus, Leben-Schau 2) — eine Kreatur ist eine Group
            const mk = (x, z) => ({ position: new THREE.Vector3(x, 5, z), rotation: new THREE.Euler(), userData: {} });
            r._creatureGroundBudget = 5;
            const m = mk(12, 12);
            const g1 = r._creatureGroundY(m); // erster Scan: Budget 5→4
            out.gFirstScan = r._creatureGroundBudget === 4;
            const g2 = r._creatureGroundY(m); // gleiche Position → Cache-Hit (Budget bleibt 4)
            out.gCacheHit = r._creatureGroundBudget === 4 && g2 === g1;
            m.position.x += 0.3; // < 0.5 m bewegt → Cache-Hit
            const g3 = r._creatureGroundY(m);
            out.gCacheNear = r._creatureGroundBudget === 4 && g3 === g1;
            m.position.x += 1.0; // jetzt > 0.5 m vom Cache-Punkt → Refresh: Budget 4→3
            r._creatureGroundY(m);
            out.gRefreshOnMove = r._creatureGroundBudget === 3;
            r._creatureGroundBudget = 0; // Budget erschöpft
            m.position.x += 1.0; // eine bekannte Kreatur, > 0.5 m gewandert: ohne Budget trägt ihr Cache
            const gm = r._creatureGroundY(m);
            const fresh = mk(800, 800);
            const gf = r._creatureGroundY(fresh); // kein Budget + kein Cache → EIN Scan ohne Budget (Welle L, Höhle)
            out.gBudgetBound =
                r._creatureGroundBudget === 0 &&
                gm === m.userData.cachedGroundY &&
                typeof gf === "number" &&
                Number.isFinite(gf) &&
                fresh.userData.cachedGroundY === gf;
        }

        return out;
    });
    if (res.error) {
        check("Welle V11.0-d.1: Wasser-Kontext-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle V11.0-d.1: _creatureWaterContextAt existiert als Methode", res.fnExists);
    if (!res.fnExists) return;

    check(
        "Welle V11.0-d.1: Land-Stichprobe gefunden (≥1 Spalte mit inWater=false)",
        res.foundLand,
        "Test-Welt hatte keine Land-Spalte im ±80-m-Spawn-Grid — Spawn-Welt-Variation"
    );
    if (res.foundLand) {
        check("Welle V11.0-d.1: Result hat boolean inWater", res.landHasInWater === true);
        check("Welle V11.0-d.1: Result hat number depthBelow", res.landHasDepthBelow === true);
        check("Welle V11.0-d.1: Result hat boolean submerged", res.landHasSubmerged === true);
        check("Welle V11.0-d.1: Result hat number distToShore", res.landHasDistToShore === true);
        check("Welle V11.0-d.1: Land-Stichprobe: inWater=false", res.landInWaterFalse === true);
        check("Welle V11.0-d.1: Land-Stichprobe: distToShore=0", res.landDistZero === true);
        check(
            "Welle V11.0-d.1: Land-Stichprobe: depthBelow ≤ 0 (Boden über Wasser)",
            res.landDepthNonPositive === true
        );
        check("Welle V11.0-d.1: Land-Stichprobe: shoreDir = null (kein Bias nötig)", res.landHasShoreDir === true);
    }
    if (res.foundWater) {
        check("Welle V11.0-d.1: Wasser-Stichprobe: inWater=true", res.waterInWaterTrue === true);
        check("Welle V11.0-d.1: Wasser-Stichprobe: depthBelow > 0", res.waterDepthPositive === true);
        check("Welle V11.0-d.1: Wasser-Stichprobe: shoreDir null oder Kardinal-Vector3", res.waterShoreDirOk === true);
        check(
            "Welle V11.0-d.1: Wasser-Stichprobe: distToShore endlich oder Infinity",
            res.waterDistToShoreFinite === true
        );
    }
    check(
        // 200 ms: reine CPU-Timing-Messung, auf geteilten CI-Runnern stark schwankend (lokal ~5–15 ms).
        // Eine O(n²)-Regression wären SEKUNDEN für 200 Aufrufe — die Schwelle ist CI-robust und fängt sie.
        "Welle V11.0-d.1: 200 Aufrufe im Perf-Budget (< 200 ms, CI-robust gegen O(n²))",
        res.perfMs < 200,
        `200 calls in ${res.perfMs?.toFixed(1)} ms`
    );
    check(
        "Welle L: Helper liest keine zweite Wahrheit (_waterLevelAt / _isAboveWaterAt)",
        res.ohneZweiteWahrheit === true
    );
    check("V17.113 Kreatur-FPS-Dirigent: _creatureGroundY (Boden-Cache) existiert", res.groundCacheFn === true);
    if (res.groundCacheFn) {
        check("V17.113: erster Boden-Zugriff scannt (Budget dekrementiert)", res.gFirstScan === true);
        check("V17.113: gleiche Position → Cache-Hit (kein Scan)", res.gCacheHit === true);
        check("V17.113: Bewegung < 0.5 m → Cache-Hit (kein Scan)", res.gCacheNear === true);
        check("V17.113: Bewegung > 0.5 m → Refresh (ein Scan)", res.gRefreshOnMove === true);
        check(
            "V17.113: Budget erschöpft → die Gewanderte trägt ihr Cache, nur die Frische scannt einmal (FPS-Bound, Welle L)",
            res.gBudgetBound === true
        );
    }
}

// Tiefen-Scheue + Schwimm-Surface: der wander-Loop konsumiert `_creatureWaterContextAt`, biast die
// Richtung zum Ufer und hebt Y auf die Schwimm-Surface. Probe: Kreatur in eine Wasser-Spalte
// teleportieren, `updateCreatures(0.016)` ticken, Y prüfen.
async function checkBandWelleV11D2WaterBias(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};


        // Empirisch — finde eine Wasser-Spalte im Spawn-Bereich.
        let waterSpot = null;
        const SCAN_RANGE = 120;
        const SCAN_STEP = 6;
        // Die Suche läuft um das Ufer des Sees des Gesetzes (`__wasserOrt`: die Heimat trägt seit K16 keinen See): die
        // erste See-Zelle mit einem Land-Nachbarn. Ein tiefer Punkt zählt, wenn auf einer Achse binnen 9 m Land über dem
        // Spiegel steht — die Probe will den Uferweg der Kreatur (der See ist 600 m breit, seine Mitte hat kein Ufer).
        const seeOrt = window.__wasserOrt("see");
        let mx = 0;
        let mz = 0;
        if (seeOrt) {
            const h = seeOrt.hydro;
            const wK = h.water.waterKind;
            const q = seeOrt.lake.cells.find(
                (c) => wK[c - 1] === 0 || wK[c + 1] === 0 || wK[c - h.dim] === 0 || wK[c + h.dim] === 0
            );
            mx = Math.round(h.originX + ((q % h.dim) + 0.5) * h.cell);
            mz = Math.round(h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell);
        }
        const land = (x, z) => {
            const ly = r._voxelSurfaceY(x, z);
            return ly !== null && Number.isFinite(ly) && ly > r._waterLevelAt(x, z) + 0.5;
        };
        for (let dx = -SCAN_RANGE; dx <= SCAN_RANGE && !waterSpot; dx += SCAN_STEP) {
            for (let dz = -SCAN_RANGE; dz <= SCAN_RANGE && !waterSpot; dz += SCAN_STEP) {
                const x = mx + dx;
                const z = mz + dz;
                const sy = r._voxelSurfaceY(x, z);
                if (sy === null || !Number.isFinite(sy)) continue;
                const wy = r._waterLevelAt(x, z);
                // die Kreatur steht 0,5 m über dem Grund, der Helfer misst ab ihr: der Punkt braucht > 2 m Tiefe
                if (!(wy - sy > 2.5)) continue;
                if (land(x + 9, z) || land(x - 9, z) || land(x, z + 9) || land(x, z - 9)) waterSpot = { x, z, sy, wy };
            }
        }
        out.waterSpotFound = waterSpot !== null;
        if (!waterSpot) return out;
        out.spotDepth = waterSpot.wy - waterSpot.sy;

        // Brauchen eine Kreatur — wenn keine existiert, spawn eine.
        if (!Array.isArray(r.state.creatures) || r.state.creatures.length === 0) {
            out.error = "no creatures in world — D.2 nicht testbar";
            return out;
        }
        const creature = r.state.creatures[0];
        // Sichere wir ihren Original-Zustand für die Wieder-Herstellung.
        const origX = creature.position.x;
        const origY = creature.position.y;
        const origZ = creature.position.z;
        const origTask = creature.userData && creature.userData.task ? { ...creature.userData.task } : null;

        // Teleportiere die Kreatur in die Wasser-Spalte, auf Höhe des See-
        // Bodens (was die Welt heute machen würde, ohne D.2). Direkt am
        // Boden, damit der Y-Override-Effekt sichtbar wird.
        creature.position.set(waterSpot.x, waterSpot.sy + 0.5, waterSpot.z);
        // wander-Task sicherstellen damit der Direction-Bias greift.
        r.assignCreatureTask(creature, "wander", {}, { silent: true });

        // Spieler-nah platzieren — wir müssen <50m sein für die Distance-LOD.
        // (Der Spieler-Mesh ist die einzige andere Welt-Konstante hier.)
        const origPlayerX = r.state.playerMesh.position.x;
        const origPlayerZ = r.state.playerMesh.position.z;
        r.state.playerMesh.position.x = waterSpot.x + 10;
        r.state.playerMesh.position.z = waterSpot.z + 10;

        // Direkter Helper-Call (vor dem Tick) — prüft den Kontext-State.
        const wctx = r._creatureWaterContextAt(creature);
        out.helperSeesWater = wctx.inWater === true && wctx.depthBelow > 1.5;
        out.helperHasShoreDir = wctx.shoreDir !== null;

        // Einen synthetischen Tick laufen (16 ms).
        r.updateCreatures(0.016);
        out.yAfterTick = creature.position.y;
        out.yExpectedFloor = waterSpot.sy + 0.5; // alte Welt: am Boden
        // D.2: an der Surface — die Sohle hängt um die Wasserlinie des Tiers (am Schultergelenk, Welle L wasser D6: das
        // Literal −0,3 ± 0,2 m fiel) unter dem Spiegel der EINEN Wahrheit am Körper (`_koerperWasser` über seinem Grund).
        const linieW = creature.userData ? creature.userData._wasserlinie : NaN; // fehlt sie, ist die Probe rot
        out.wasserlinie = linieW;
        out.yExpectedSurface = r._koerperWasser(waterSpot.x, waterSpot.z, waterSpot.sy) - linieW;
        // Die Kreatur sollte JETZT an der Surface schwimmen (±0.4m). Sie war vorher am Boden.
        out.swimsAtSurface = Math.abs(creature.position.y - out.yExpectedSurface) < 0.4;
        out.notAtFloor = Math.abs(creature.position.y - out.yExpectedFloor) > 0.5;

        // Wieder-Herstellen damit der Rest der Suite nicht angefasst wird.
        creature.position.set(origX, origY, origZ);
        if (origTask) r.assignCreatureTask(creature, origTask.name, origTask.args || {}, { silent: true });
        r.state.playerMesh.position.x = origPlayerX;
        r.state.playerMesh.position.z = origPlayerZ;

        return out;
    });
    if (res.error) {
        check("Welle V11.0-d.2: Wasser-Bias-Band (realm verfügbar)", false, res.error);
        return;
    }
    if (!res.waterSpotFound) {
        // Wenn die Welt-Variation keinen tiefen Wasser-Spot in ±120m hat,
        // ist die empirische Probe nicht möglich — Source-Probes haben
        // dann den strukturellen Beweis getragen.
        check(
            "Welle V11.0-d.2: Wasser-Spalte gefunden (Vorbedingung für Y-Override-Test)",
            false,
            "Test-Welt hat keinen Spot mit depthBelow > 1.5 in ±120m — Welt-Variation"
        );
        return;
    }
    check(
        "Welle V11.0-d.2: Tiefer Wasser-Spot gefunden",
        true,
        `depth=${res.spotDepth?.toFixed(2)}m, expectedFloor=${res.yExpectedFloor?.toFixed(2)}, expectedSurface=${res.yExpectedSurface?.toFixed(2)}`
    );
    check("Welle V11.0-d.2: Helper erkennt depthBelow > 1.5", res.helperSeesWater === true);
    check("Welle V11.0-d.2: Helper hat shoreDir (Ufer in 12m Reichweite)", res.helperHasShoreDir === true);
    check(
        "Welle V11.0-d.2: Kreatur schwimmt an Surface nach einem Tick (Y-Override aktiv)",
        res.swimsAtSurface === true,
        `yAfterTick=${res.yAfterTick?.toFixed(2)}, expected=${res.yExpectedSurface?.toFixed(2)} (Wasserlinie ${res.wasserlinie})`
    );
    check(
        "Welle V11.0-d.2: Kreatur NICHT mehr am See-Boden (alte Welt-Position überschrieben)",
        res.notAtFloor === true,
        `yAfterTick=${res.yAfterTick?.toFixed(2)}, alterBoden=${res.yExpectedFloor?.toFixed(2)}`
    );
}

// DAS HOCH-BECKEN (Stau-Spiegel): ein Spieler-Werk (Fill/solide Architektur) öffnet die Spiegel-Kappe
// LOKAL per bounded Spill-Scan (Priority-Flood); gepinnte Quell-Spalten tropfen den Pool voll. Hier
// nur PURE Beweise; der Welt-Beweis am echten Fluss ist die Sonde diag-stau (git-Archiv).
async function checkBandV18129HochBecken(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const C = r.constructor.CA_STAU;
        out.config =
            !!C &&
            Object.isFrozen(C) &&
            [C.REACH, C.MAX_CELLS, C.FEED, C.WIN_MAX, C.CLUSTER_GAP, C.MIN_EXTENT].every(Number.isFinite);
        // PURE Spill-Scan (Priority-Flood): das BECKEN hält, der PFEILER nicht —
        // der strukturelle Damm/Pfeiler-Diskriminator (die Physik filtert).
        const w = 11;
        const mkGrid = (gap) => {
            const barrier = new Float64Array(w * w); // Boden 0
            for (let k = 3; k <= 7; k++) {
                for (let i = 3; i <= 7; i++) {
                    if (i > 3 && i < 7 && k > 3 && k < 7) continue; // Ring bei |d|=2
                    barrier[i + k * w] = 10; // die Wand
                }
            }
            if (gap) barrier[5 + 3 * w] = 0; // EIN Loch im Ring = der „Pfeiler-Fall"
            const init = new Float64Array(w * w).fill(Infinity);
            for (let k = 0; k < w; k++)
                for (let i = 0; i < w; i++) if (i === 0 || k === 0 || i === w - 1 || k === w - 1) init[i + k * w] = 1;
            return { barrier, init };
        };
        const closed = mkGrid(false);
        const fillClosed = r._stauSpillLevels(closed.barrier, w, w, closed.init);
        out.basinHolds = Math.abs(fillClosed[5 + 5 * w] - 10) < 1e-9; // Zentrum hält bis Wand-Krone
        out.outsideOpen = Math.abs(fillClosed[1 + 1 * w] - 1) < 1e-9; // außerhalb: Außenwelt-Pegel
        const gapped = mkGrid(true);
        const fillGap = r._stauSpillLevels(gapped.barrier, w, w, gapped.init);
        out.gapDrains = Math.abs(fillGap[5 + 5 * w] - 1) < 1e-9; // ein Loch → kein Stau
        // PURE Empfänger-Kappe (V18.93-Semantik bleibt + trägt den Stau): Spalte A
        // voll bis j=6, Spalte B leer mit Kappe j=3 → B füllt NIE über die Kappe.
        const SOLID = r.constructor.CELL_STATE.SOLID;
        const d = 2;
        const dy = 8;
        const dimSq = d * d;
        const cells = new Uint8Array(dimSq * dy);
        for (let j = 0; j < dy; j++) {
            cells[2 + j * dimSq] = SOLID; // Spalten (0,1)+(1,1) ganz solide —
            cells[3 + j * dimSq] = SOLID; // nur das Paar c0↔c1 tauscht
        }
        cells[0] = SOLID; // Böden j=0
        cells[1] = SOLID;
        const level = new Float64Array(dimSq * dy);
        for (let j = 1; j <= 6; j++) level[0 + j * dimSq] = 1; // Säule A voll
        const cap = new Int16Array(dimSq);
        cap[0] = 7;
        cap[1] = 3;
        for (let t = 0; t < 120; t++) r._tickWaterCA(level, cells, d, dy, 0.25, null, null, cap);
        let overCap = 0;
        for (let j = 4; j < dy; j++) overCap += level[1 + j * dimSq];
        let underCap = 0;
        for (let j = 1; j <= 3; j++) underCap += level[1 + j * dimSq];
        out.capHolds = overCap < 1e-6;
        out.capFillsBelow = underCap > 0.5;
        out.overCap = overCap;
        return out;
    });
    if (!res) {
        check("V18.129 Hoch-Becken: Sonde lief", false, "evaluate warf");
        return;
    }
    check("V18.129 Hoch-Becken: CA_STAU-Konfiguration steht (frozen, vollständig)", res.config);
    check("V18.129 Hoch-Becken: der Spill-Scan hält das GESCHLOSSENE Becken (Krone-Pegel)", res.basinHolds);
    check("V18.129 Hoch-Becken: außerhalb der Wand gilt der Außenwelt-Pegel (keine Badewanne)", res.outsideOpen);
    check("V18.129 Hoch-Becken: EIN Loch im Ring → kein Stau (der Damm/Pfeiler-Diskriminator)", res.gapDrains);
    check(
        "V18.129 Hoch-Becken: die Empfänger-Kappe hält im Automaten (nichts über cap, darunter füllt es)",
        res.capHolds && res.capFillsBelow,
        `overCap=${res.overCap}`
    );
}

// Γ6 — vier stehende Wände gegen geheilte visuelle Narben: (G1) Schneeband auf PROMINENZ ·
// (G2) chunk-seam per Pad+Crop (Source-Wand) · (G3) false-swim via `_koerperWasser` (die EINE Wahrheit am Körper) ·
// (G4) arch-water-solid via blockerAABBs. KEINE mutativen Spawns — Source-Proben + Welt nach Warmup.
async function checkBandV18194Gamma6Befoerderung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const s = r.state;
        const out = {};

        // (G1) DIE SCHNEEGRENZE ist Gesetz (K16): die Boden-Farbe ruft gelaende-core `schnee` (die Höhe über dem Meer), die
        // Prominenz über einer Basis (V17.105) ist gefallen, die alte ss(12,42,y) fehlt.
        const attachSrc = window.__codeOf(r._bodenFarbeAt);
        // ALTE absolute Form ss(12,42,y) darf NICHT als Code (mix(snow,…))
        // erscheinen — im Kommentar erlaubt. Engere regex auf den Code-Stil.
        out.snowOldAbsoluteGone = !/mix\(snow,\s*ss\(12,\s*42,\s*y\)\)/.test(attachSrc);

        // Die Probe misst am Gesetz (gelaende-core `schnee`), nie an einer Kopie.
        const schneeAt = (y, x, z) => window.__gelaendeCore.schnee(r._gelaende(), y, x, z); // der Ort trägt die Zungen der Grenze
        let snowSum = 0;
        let nSamples = 0;
        const base = s.terrainBaseHeight || 0;
        let hash = 2166136261;
        const seedStr = (s.worldMeta && s.worldMeta.seed) || "g6";
        for (let i = 0; i < seedStr.length; i++) hash = ((hash ^ seedStr.charCodeAt(i)) * 16777619) >>> 0;
        let lcg = hash || 1;
        const rng = () => {
            lcg = (lcg * 1664525 + 1013904223) >>> 0;
            return lcg / 4294967296;
        };
        // Nur TIEFLAND messen (prominence ≤ 30 m): das Fehlerbild war Schnee am flachen Boden; an echten
        // Erhebungen ist Schnee korrekt.
        let lowProminSnowSum = 0;
        let lowProminN = 0;
        for (let i = 0; i < 1500; i++) {
            const x = (rng() - 0.5) * 800;
            const z = (rng() - 0.5) * 800;
            const y = r._terrainMacroSurfaceY(x, z, false);
            const wY = r._waterLevelAt ? r._waterLevelAt(x, z) : -3;
            if (y <= wY + 0.5) continue;
            const sn = schneeAt(y, x, z);
            snowSum += sn;
            nSamples++;
            // Tiefland-Klasse: ≤ 100 m über dem Meer (klar unter der Schneegrenze, K16 — der 85-m-Spawn-Hügel war weiß)
            if (y - (Number.isFinite(s.waterLevel) ? s.waterLevel : base - 3) <= 100) {
                lowProminSnowSum += sn;
                lowProminN++;
            }
        }
        out.snowMeanNear = nSamples ? snowSum / nSamples : 1;
        out.snowLowProminMean = lowProminN ? lowProminSnowSum / lowProminN : 0;
        out.snowLowProminN = lowProminN;
        // Im Tiefland (≤ 100 m über dem Meer) MUSS Schnee ≈ 0 sein (die Schneegrenze beginnt bei SCHNEE.start).
        out.snowLowProminOk = out.snowLowProminMean < 0.02;


        // (G3) FALSE-SWIM: der Körper liest EINE Wasser-Wahrheit (`_koerperWasser`, Welle L Q6) — der Zell-Leser
        // `_waterCellAt` (eine zweite Wahrheit, nur noch von dieser Probe gerufen) ist gefallen — und sie kennt die DECKE
        // (D11): die Zellen halten Höhlen unter und neben Seen trocken (caveDry, `_skyOpenWaterFilter`). Die Probe sucht
        // in den geladenen Wasser-Chunks jede erste LUFT-Zelle über FEST, deren Mitte unter dem Spiegel des Gesetzes liegt
        // und über der eine FEST-Zelle steht (eine trockene Höhle), und stellt einen Körper auf ihren Boden: er liest dort
        // nie Wasser. Bis 8f09227d las er den Spiegel ohne Decke (3511 von 3511 Höhlen-Proben am See der Mess-Wiese nass).
        // Plus: Worker-Mirror baut waterCells via Flood (V13.12 Vertikal-Open).
        let waterCellAtWorks = false;
        const hoehle = { unter: 0, neben: 0, nassUnter: 0, nassNeben: 0 };
        if (typeof r._koerperWasser === "function" && typeof r._waterCellAt === "undefined") {
            waterCellAtWorks = true;
            // Der Höhlen-Chunk unter dem See des Gesetzes (`__wasserChunk("hoehle")`: die Heimat trägt seit K16 keinen See).
            out.hoehlenChunk = window.__wasserChunk("hoehle");
            const cfg = r._voxelChunkConfig(0);
            const oy = (s.terrainBaseHeight || 0) - cfg.floorDrop;
            const ZS = r.constructor.CELL_STATE;
            const dq = cfg.dim * cfg.dim;
            for (const [key, e] of s.voxelChunks || []) {
                if (!e || !e.waterCells) continue;
                const c = e.waterCells;
                const [kx, kz] = key.split(",").map(Number);
                for (let k = 0; k < cfg.dim; k++)
                    for (let i = 0; i < cfg.dim; i++) {
                        const b = i + k * cfg.dim;
                        const x = kx * cfg.span + (i + 0.5) * cfg.step;
                        const z = kz * cfg.span + (k + 0.5) * cfg.step;
                        const L = r._atlasWaterLevelAt(x, z, -1e9);
                        if (!(L > -Infinity)) continue;
                        for (let j = 1; j < cfg.dimY; j++) {
                            const cy = oy + (j + 0.5) * cfg.step;
                            if (cy > L) break;
                            if (c[b + j * dq] !== ZS.AIR || c[b + (j - 1) * dq] !== ZS.SOLID) continue;
                            let decke = false,
                                wasser = false;
                            for (let jj = j + 1; jj < cfg.dimY && oy + jj * cfg.step < L; jj++) {
                                if (c[b + jj * dq] === ZS.SOLID) decke = true;
                                else if (decke && c[b + jj * dq] === ZS.WATER) wasser = true;
                            }
                            if (!decke) continue;
                            const boden = r._fieldSurfaceBelow(x, cy, z, 3);
                            if (!Number.isFinite(boden) || !(boden < L - 0.2)) break;
                            const nass = r._koerperWasser(x, z, boden) > boden + 0.1;
                            if (wasser) {
                                hoehle.unter++;
                                if (nass) hoehle.nassUnter++;
                            } else {
                                hoehle.neben++;
                                if (nass) hoehle.nassNeben++;
                            }
                            break;
                        }
                    }
            }
        }
        out.waterCellAtExists = waterCellAtWorks;
        out.hoehle = hoehle;
        // Source-Probe für die V13.12-Heilung in der Cell-Build-Funktion
        const cellsSrc = r._buildVoxelChunkWaterCells ? window.__codeOf(r._buildVoxelChunkWaterCells) : "";
        out.cellsBuildHasFlood = cellsSrc.length > 200;
        // Worker-Snapshot trägt hydroBand mit (V9.91 — Cells-Klassifikations-
        // Skip ausserhalb [bottom..top]) → das CELL-MODELL ist tragend
        const wsnap = r._voxelWorkerSnapshotState();
        out.hydroBandPresent = !!wsnap.hydroBand && typeof wsnap.hydroBand.top === "number";

        // (G4) ARCH-WATER-SOLID: nach Warmup existiert Architektur, und die Stein-/Architektur-Bauten
        // tragen `blockerAABBs` aus _blockerComputePartAABB.
        let archSeen = 0;
        let archWithBlockers = 0;
        let archStoneSolid = 0;
        for (const a of s.architectures || []) {
            if (!a) continue;
            archSeen++;
            if (Array.isArray(a.blockerAABBs) && a.blockerAABBs.length > 0) {
                archWithBlockers++;
                // Stein-haltige Architekturen müssen SOLID sein (felsbogen, felsturm)
                if (
                    /fels|stein|tempel|geode|plattform/i.test(a.type || a.name || "") ||
                    /fels|stein|tempel/i.test(a.bp || "")
                ) {
                    archStoneSolid++;
                }
            }
        }
        out.archSeen = archSeen;
        out.archWithBlockers = archWithBlockers;
        out.archStoneSolid = archStoneSolid;
        // ≥ 30 % der gestreamten Architekturen tragen blockerAABBs (Bäume: Stamm-Blocker, Stein: Multi-Part;
        // reine Optik-Bauten ohne soliden Part keine). Ohne Architektur (schneller Runner) → "skipped";
        // dann hält die _blockerComputePartAABB-Source-Wand.
        out.archMostlyHaveBlockers =
            archSeen < 3 ? "skipped-no-archs" : archWithBlockers / Math.max(1, archSeen) >= 0.3;
        // Source-Probe: _blockerComputePartAABB (die Solidität-Quelle, V9.65-
        // Lehre: Material-Tag dichte ≥ 0.3 macht den Part SOLID).
        const blockerSrc = r._blockerComputePartAABB ? window.__codeOf(r._blockerComputePartAABB) : "";
        out.blockerComputeExists = blockerSrc.length > 50;

        return out;
    });

    check("Γ6 (G1b) ALTE absolute Schnee-Zeile ss(12,42,y) GESTRICHEN", res.snowOldAbsoluteGone === true);
    check(
        `Γ6 (G1c) Tiefland-Schnee (≤ 100 m über dem Meer) < 0.02 (gemessen ${res.snowLowProminMean.toFixed(4)} an ${res.snowLowProminN} Samples — K16)`,
        res.snowLowProminOk === true
    );
    // (G3) FALSE-SWIM
    check(
        "Γ6 (G3a) FALSE-SWIM: der Körper liest EINE Wasser-Wahrheit (_koerperWasser; der Zell-Leser _waterCellAt fiel)",
        res.waterCellAtExists === true
    );
    const hh = res.hoehle || {};
    check(
        `Γ6 (G3b) FALSE-SWIM: die trockene Höhle UNTER dem See bleibt für den Körper trocken (Decke, D11: ${hh.nassUnter} von ${hh.unter} nass)`,
        hh.unter + hh.neben > 0 && hh.nassUnter === 0
    );
    check(
        `Γ6 (G3c) FALSE-SWIM: die trockene Höhle NEBEN dem See bleibt für den Körper trocken (Rand-Spiegel, D11: ${hh.nassNeben} von ${hh.neben} nass)`,
        hh.unter + hh.neben > 0 && hh.nassNeben === 0
    );
    check("Γ6 (G3d) Cell-Build-Funktion vorhanden (V13.12 Vertikal-Open-Foundation)", res.cellsBuildHasFlood === true);
    check("Γ6 (G3e) Worker-Snapshot trägt hydroBand (Cell-Klassifikations-Skip)", res.hydroBandPresent === true);
    // (G4) ARCH-WATER-SOLID
    check(
        `Γ6 (G4a) ARCH-SOLIDITY: Architekturen mit blockerAABBs (${res.archWithBlockers}/${res.archSeen} ≥ 30 %, V13.10)`,
        res.archMostlyHaveBlockers === true || res.archMostlyHaveBlockers === "skipped-no-archs"
    );
    check(
        "Γ6 (G4b) _blockerComputePartAABB als Solidität-Quelle vorhanden (V9.65 dichte≥0.3-Regel)",
        res.blockerComputeExists === true
    );
}

module.exports = {
    checkBandHydrosphere, checkBandWelleC1WaterCells, checkBandWelleC2WaterIsoSurface,
    checkBandWellePerfHWaterIsoQueue, checkBandV17117FarWater, checkBandWelleV11D1WaterContext,
    checkBandWelleV11D2WaterBias, checkBandV18129HochBecken, checkBandV18194Gamma6Befoerderung,
};
