"use strict";
// scripts/playtest/wasser.cjs — der Richter von Wasser (spec/stamm/modul-karte.json): Hydrosphäre · Flüsse · Seen · Wasserfälle · Pegel · die Wasser-Wahrheit · Wasser-Zellen · Sheet · Iso · Wasser-CA · Stau.
// 12 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// Band-Funktion der Hydrosphäre (Erosion, Chunk-Wasser, Ufer-Schaum).
async function checkBandHydrosphere({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Die Kachel-Erosion ist gefallen ###
    // Die Täler kommen aus dem Flussnetz des Gelände-Gesetzbuchs (gelaende-core), nicht aus einer nachträglichen
    // Stream-Power-Inzision je Kachel: kein `_computeErosion`, kein `state.erosion`, kein `erosionDelta` im Kern.
    const erosionTot = await safeEvaluate(page, () => {
        if (!r || !r.state) return null;
        return {
            tot:
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
    // Die Hydrosphäre entsteht im Faden (Karte hydro-faden): h1 die der Weltgen, h2 ein zweiter Lauf des Fadens.
    const voxelV943bResults = await safeEvaluate(page, async () => {
        if (!r || !r.state) return null;
        const out = {};
        const h1 = r.state.hydrosphere;
        await window.__weltDa(() => !r.state.voxelWorkerPending.size); // die Uhr misst die Rechnung, nie die Schlange davor
        const t0 = performance.now();
        const h2 = (await r._voxelFadenAuftrag(r.state.voxelWorker, { type: "hydro", key: "heim", origin: null })).region;
        out.perfMs = performance.now() - t0;
        // dass Heimat und Kacheln Flüsse tragen, die der Stamm liest, misst gate:wasser-leben K4 LÄUFE
        // Determinismus — zwei Läufe, byte-identisches Netz
        out.deterministic =
            JSON.stringify(h1.rivers) === JSON.stringify(h2.rivers) &&
            JSON.stringify(h1.lakes) === JSON.stringify(h2.lakes) &&
            JSON.stringify(h1.waterfalls) === JSON.stringify(h2.waterfalls);
        // das Ende jedes Laufs, das Wasser jeder Senke und das Gefälle von Sohle und Spiegel misst gate:wasser-leben K4 LÄUFE
        const meerOrt = await window.__wasserOrt("meer");
        out.meerOrt = meerOrt ? `${Math.round(meerOrt.x)},${Math.round(meerOrt.z)}` : "keiner";
        // Flow-Accumulation stromab monoton → Breite wächst
        out.widthGrows = h1.rivers.every((rv) => {
            for (let k = 0; k + 1 < rv.points.length; k++) {
                if (rv.points[k].width > rv.points[k + 1].width + 1e-6) return false;
            }
            return true;
        });
        // Jeder See: Füll-Level über dem Boden, unter (≈) der Rand-Höhe
        out.lakesValid = h1.lakes.every((lk) => lk.level > lk.floorY && lk.level <= lk.rimY + 1.5);
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
        // alle Ozean-Zellen teilen EINEN flachen Spiegel: gemessen an der Kachel des Meer-Orts.
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
        // das Wasser-Level-Feld `_waterLevelAt` an der ersten Ozean-Zelle der Meer-Kachel (der Leser löst die Kachel selbst
        // auf, `_hydroFor`); an der See-Zelle misst V9.43-c.2 den Füllstand
        const [h, q] = meerOrt ? [meerOrt.hydro, meerOrt.hydro.water.waterKind.indexOf(1)] : [null, -1];
        const lv = q >= 0 ? r._waterLevelAt(h.originX + ((q % h.dim) + 0.5) * h.cell, h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell) : NaN;
        out.waterLevelOceanOk = Number.isFinite(lv) && Math.abs(lv - (r.state.waterLevel || 0)) < 0.01;
        return out;
    });

    if (voxelV943bResults && !voxelV943bResults.error) {
        const hb = voxelV943bResults;
        check("Voxel V9.43-b: das Netz ist deterministisch (zwei Läufe byte-identisch)", hb.deterministic);
        check("Voxel V9.43-b: Fluss-Breite wächst stromab (Einzugsgebiet des Netzes monoton)", hb.widthGrows);
        check("Voxel V9.43-b: jeder See — Füll-Level über dem Boden, unter der Rand-Höhe", hb.lakesValid);
        check(
            "Voxel V9.43-b: Berechnung im Perf-Budget (< 500 ms)",
            typeof hb.perfMs === "number" && hb.perfMs < 500,
            `perfMs=${Math.round(hb.perfMs || 0)} ms`
        );
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
        check("Voxel V9.50-a: `_waterLevelAt` an einer Ozean-Zelle == waterLevel", hb.waterLevelOceanOk);
    }

    // ### Das Wasser wird synergetisch ###
    // Fluss-Mündungen erreichen SICHTBAR ihr Wasser (Ribbon blendet auf `waterLevel` bzw. den
    // Ziel-See-Level), und der Spieler schwimmt im See wie im Meer — Quelle ist `_waterLevelAt`.
    const voxelV943c2 = await safeEvaluate(page, async () => {
        if (!r || !r.state) return null;
        const out = {};
        out.hydroReady = !!(r.state.hydrosphere && r.state.hydrosphere.ready);
        if (!out.hydroReady) return out;
        // _waterLevelAt: über einer GERENDERTEN See-Zelle → der See-Level, gemessen an der Kachel des See-Orts
        // (`__wasserOrt`); absorbierte Seen (level ≤ waterLevel+2) zählen nicht — die Meeres-Plane vertritt sie.
        const seeOrt = await window.__wasserOrt("see");
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
            // der Füllstand trägt den Pegel des Sees (Schmelze und Regen, gelaende-core `pegelHub`, wetter.K3)
            const hub = window.__gelaendeCore.pegelHub(r._gelaende(), renderedLk.level);
            out.lakeLevelOk = Math.abs(r._waterLevelAt(wx, wz) - renderedLk.level - hub) < 0.01;
            // eine 1-Ring-Zelle (nicht selbst See-Zelle) liefert den See-Wasserspiegel, nicht den Meeresspiegel.
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
        return out;
    });

    if (voxelV943c2 && !voxelV943c2.error) {
        const h2 = voxelV943c2;
        check("Voxel V9.43-c.2: _waterLevelAt liefert über einer See-Zelle den See-Füllstand", h2.lakeLevelOk);
        check(
            "Voxel V9.45-c: der Auftrieb folgt der dilatierten See-Plane (1-Ring-Zelle = See-Spiegel)",
            h2.ringFollowsPlane
        );
        check(
            "Voxel V9.43-c.2: _waterLevelAt fällt ausserhalb der Region auf den Meeresspiegel zurück",
            h2.seaFallbackOk
        );
    }

    // ### Die Flüsse carven echte Betten ###
    // `_terrainDensityAt` fragt die Hydrosphäre (Bucket-Index) und senkt die Dichte im Fluss-Kanal
    // + in See-Senken → echte Rinnen mit Ufern + Becken. Zirkel-frei (der Faden hält den Carve aus seiner Rechnung); ohne
    // Hydrosphäre bit-identisch zum Feld ohne Carve.
    const voxelV943d = await safeEvaluate(page, async () => {
        if (!r || !r.state) return null;
        const out = {};
        const hydro = r.state.hydrosphere;
        out.hydroReady = !!(hydro && hydro.ready);
        if (!out.hydroReady) return out;
        if (r.state.worldMeta) r.state.worldMeta.voxelEdits = [];
        // (2) den Carve-Index liest der Kern (gate:worker-dichte `--kern`)
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
            // (8) die Form des Kanals ist EIN Gesetz des Kerns (`gewaesserForm`, gate:worker-dichte `--kern`)
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
        // Gemessen an der Kachel des See-Orts (`__wasserOrt`).
        out.lakeSculpted = false;
        out.lakeBedWatertight = false;
        const wl2 = typeof r.state.waterLevel === "number" ? r.state.waterLevel : -Infinity;
        const seeOrt = await window.__wasserOrt("see");
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
        // (11) den zweiten Lauf im Faden (zirkel-frei: dasselbe Netz) misst V9.43-b „deterministisch“
        // (13) Das Wasser-Cell-Feld fragt den ATLAS-STRIKTEN Spiegel (`_buildVoxelChunkWaterCells` ruft
        // `_atlasWaterLevelAt` je xz-Spalte), nicht das dilatierende `_waterLevelAt` — sonst
        // Wasserschatten an Hängen.
        const cfgW = r._voxelChunkConfig(0);
        const aW = [0, (r.state.terrainBaseHeight || 0) - cfgW.floorDrop, 0, cfgW.step, null, 0];
        out.unifiedQueriesRivers =
            window.__consumes(r, "_buildVoxelChunkWaterCells", r, "_atlasWaterLevelAt", aW) &&
            !window.__consumes(r, "_buildVoxelChunkWaterCells", r, "_waterLevelAt", aW);
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
        check(
            "Voxel V9.43-d → Welle L: der Kanal formt einen Fluss-Mittelpunkt (Flachboden unter dem Spiegel)",
            d.riverCenterCarved
        );
        check("Voxel V9.43-d: das Fluss-Bett liegt unter den Ufern (die Gestalt steigt zur Bank an)", d.bedBelowBanks);
        check("Voxel V9.43-d → Welle L: die Voxel-Fläche liegt auf dem Flachboden des Kanals", d.surfaceLowered);
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
            "Voxel V13.1: das Wasser-Cell-Feld ruft den Atlas-strikten Spiegel (`_atlasWaterLevelAt`), nie das dilatierende `_waterLevelAt`",
            d.unifiedQueriesRivers
        );
        check(
            "Voxel V9.43-d: der Carve ist im Perf-Budget (50k Aufrufe < 300 ms)",
            typeof d.carvePerfMs === "number" && d.carvePerfMs < 300,
            `carvePerfMs=${Math.round(d.carvePerfMs || 0)} ms`
        );
    }

    // ### Wasser-Klang ###
    // Das Ohr hört das stille Wasser über den Hör-Ring (klang:UMWELT.ohr: je Punkt nass, Boden unter dem Spiegel), den Fluss
    // aus dem Kanal (`_hydroDistAt` + `_waterFlowAt`); der Wasserfall der Region über `_hydroFor`. Die Mischung des Gesetzes macht daraus
    // Pegel — nah hörbar, 5 km fern stumm. Der Ring wird hier einmal ganz gefegt (der Takt fegt ohr.probenJeFrame).
    const voxelV943e = await safeEvaluate(page, async () => {
        if (!r || !r.state) return null;
        const out = {};
        if (!r.state.symphony.enabled) {
            try {
                r.initSymphony();
            } catch {
                /* */
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
            const wfOrt = await window.__wasserOrt("fall");
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
            "Welle 5 Klang: das Ohr hört den Fluss (nah über der Hörschwelle, 5 km fern stumm)",
            e.hasRiver === true && e.flussNah >= e.schwelle && e.flussFern < e.schwelle,
            `nah=${zahl(e.flussNah)} dB fern=${zahl(e.flussFern)} dB`
        );
        // Die Hydrosphäre der Standard-Saat trägt Wasserfälle (die Kacheln bis zum zweiten Ring um den Ursprung) — fehlt
        // einer, ist das ein Befund, kein stilles Auslassen.
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
async function checkBandWelleC1WaterCells({ page, check }) {
    const res = await page.evaluate(async () => {
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        // 1) Konstante CELL_STATE
        const STATE = r.constructor.CELL_STATE;
        out.cellStateAir = STATE && STATE.AIR;
        out.cellStateWater = STATE && STATE.WATER;
        out.cellStateSolid = STATE && STATE.SOLID;
        out.cellStateFrozen = STATE && Object.isFrozen(STATE);
        // 3) Streaming-aktiver Chunk hat waterCells (die LOD wandert pro Chunk — Entry-LOD lesen, nicht
        // den Default-`_voxelChunkConfig()`-Snapshot).
        if (!r.state.voxelChunks || r.state.voxelChunks.size === 0) {
            return { ...out, error: "no voxel chunks streamed" };
        }
        // Den ersten "filled" Chunk wählen (mit Mesh, nicht empty) — am Wasser-Ort des Gesetzes (`__wasserChunk`: ohne
        // Wasser-Zelle gibt es kein waterCells-Feld).
        out.wasserChunk = await window.__wasserChunk("see");
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
        r._drainDirtyVoxelChunks();
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
    check("Welle C.1 V9.71: CELL_STATE ist freezed", res.cellStateFrozen === true);
    check(
        "Welle C.1 V9.71: CELL_STATE.AIR=0, WATER=1, SOLID=2",
        res.cellStateAir === 0 && res.cellStateWater === 1 && res.cellStateSolid === 2
    );
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
async function checkBandWelleC2WaterIsoSurface({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        const STATE = r.constructor.CELL_STATE;
        // 1) State-Feld existiert (Map)
        // das Iso-Mesh ist der EINZIGE Wasser-Mesh.
        out.oldQuadStateGone = typeof r.state.voxelChunkWater === "undefined";
        // die ausstehenden Wasser-Iso-Builds drainen, bevor wir
        // die Iso-Map prüfen (im Spiel baut der per-Frame-Tick ≤2/Frame).
        r._drainPendingWaterIso();
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
        // Iso-Meshes sind sichtbar.
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
            const sampleMesh = r.state.voxelChunkWaterIso.get(sampleMeshKey);
            out.sampleMeshUsesHydroMat = sampleMesh.material === r.state.hydroSurfaceMaterial;
            // Der EINE Render-Pfad ist das Zell-Oberkanten-Sheet ("chunk-water-cellsheet"); der Debug-Zwilling
            // „Zell-Iso" ist gefallen (W-kD7).
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
                    r._applyDayNightToScene();
                    return r.state.hydroSurfaceMaterial.side === BACK;
                } finally {
                    delete r._koerperWasser;
                    r._applyDayNightToScene();
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
                    // nur die Unterseite (ny>0.2) verworfen → undersideTris ≈ 0;
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
    check("Welle C.2 V9.75: alter Quad-Mesh-Pfad (`state.voxelChunkWater`) ist gestrichen", res.oldQuadStateGone);
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
            "→ Welle L: Wasser-Mesh trägt userData.hydroKind='chunk-water-cellsheet' (der EINE Render-Pfad)",
            res.sampleMeshUserData === true
        );
        check(
            "W1: Wasser-Material ist BackSide (einseitige Flaeche, kein Volumen, kein Wasser-von-unten)",
            res.waterMatBackSide === true
        );
        check(
            "W1: Wasser-Iso trägt KEINE Unterseiten-Dreiecke (ny>0.2 verworfen; Ufer/Fluss-Drops bleiben)",
            res.waterUndersideTris === 0,
            `Unterseite=${res.waterUndersideTris}, Oberseite=${res.waterTopsTris}`
        );
        check(
            "W1: Wasser-Iso trägt Oberseiten-Dreiecke (von oben über die Rückseite sichtbar)",
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
async function checkBandWellePerfHWaterIsoQueue({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || !r.state || !r.state.voxelChunks) return { error: "no realm/chunks" };
        const out = {};
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
        // ERST DIE LÜCKE: ein Chunk ohne aufgelöstes Sheet baut vor der Auffrischung eines NÄHEREN
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
async function checkBandV17117FarWater({ page, check }) {
    const res = await page.evaluate(async () => {
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
        // Der Ozean-Chunk liegt am Meer-Ort des Gesetzes (`__wasserOrt`: jenseits des Kontinents); der Land-Chunk jenseits der Heimat über Chunk-Indizes
        // (selbst-konsistent: der Klassifikations-Punkt = der Chunk-Mittelpunkt), Hochland ohne Wasser des Gesetzes im
        // Fußabdruck + 64 m (die Fluss-Zelle des Index 32 m + die Ecke eines Segments): das Makro über Meer + 30 m und
        // kein Spiegel über dem Meer (`_atlasWaterLevelAt` als Existenz-Probe) — die Kacheln um die Heimat tragen das
        // Flussnetz auch im Hochland, und ein Chunk am Fluss trägt zu Recht Wasser.
        const trocken = (ox, oz) => {
            for (let x = ox - 64; x <= ox + span + 64; x += 8)
                for (let z = oz - 64; z <= oz + span + 64; z += 8)
                    if (!(r._terrainMacroSurfaceY(x, z, true) > WL + 30) || r._atlasWaterLevelAt(x, z, Infinity) > WL)
                        return false;
            return true;
        };
        const meerOrt = await window.__wasserOrt("meer");
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
        await sleep(80);
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
        check("H3: Far-Water-Band (realm verfügbar)", false, res.error);
        return;
    }
    check(
        "H3: beyond-region Ozean-Chunk gefunden (am Meer-Ort des Gesetzes)",
        res.foundOcean,
        `Meer-Ort ${res.meerOrt}`
    );
    check("H3: beyond-region Ozean — Gate true", res.oceanGate === true);
    check(
        "H3: beyond-region Ozean trägt Wasser-Cells (Heilung)",
        res.oceanWaterCells > 0,
        `cells=${res.oceanWaterCells}`
    );
    check("H3: beyond-region Land-Chunk gefunden (Hochland ohne Wasser des Gesetzes)", res.foundLand === true);
    if (res.foundLand) {
        check("H3: beyond-region Land — Gate false (kein Mehraufwand)", res.landGate === false);
        check(
            "H3: beyond-region Land — keine Wasser-Cells",
            res.landWaterCells === 0,
            `cells=${res.landWaterCells}`
        );
    }
    check(
        "H3: Worker<->Main Wasser-Cells bit-identisch beyond-region (Naht-Wand)",
        res.workerMainIdentical === true,
        `mism=${res.cellMismatches} count=${res.mainCellCount}/${res.workerCellCount}`
    );
}

// V11.0-d.1 (Pfeiler D — Wasser ↔ Kreaturen): die Kosten und Quellen des Wasser-Kontext-Helpers, der Boden-Cache des Tiers.
async function checkBandWelleV11D1WaterContext({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || !r.state) return { error: "no realm" };
        const THREE = window.THREE;
        const out = {};

        // Ob der Helper der EINEN Wahrheit folgt (inWater, Tiefe), prüft die Mutation am Verhalten (gate:wasser-leben K12 M);
        // hier seine Kosten und seine Quellen. Performance-Probe: 200 Calls am Spawn (Land).
        const probe = { position: new THREE.Vector3(0, 5, 0) };
        // Der Wasser-Kontext bekommt die Boden-Höhe als Param (im Frame-Loop via _creatureGroundY gecacht)
        // → die Probe reicht eine vorberechnete Surface = realistische Frame-Kosten.
        const psy = r._voxelSurfaceY(probe.position.x, probe.position.z);
        const t0 = performance.now();
        for (let i = 0; i < 200; i++) r._creatureWaterContextAt(probe, psy);
        out.perfMs = performance.now() - t0;

        // Source-Probe der Wahrheits-Quellen: `_creatureGroundY` liest den Boden UNTER dem Körper (`_koerperBodenUnter`:
        // der Feld-Scan ab der Körper-Höhe, `_voxelSurfaceY` nur ohne Fels im Band — Welle L, Höhle); der Helper liest die
        // EINE Wasser-Wahrheit am Körper (`_koerperWasser`) — Tiefe UND Ufer-Suche —, nie mehr das 3×3-gedehnte
        // `_waterLevelAt` / `_isAboveWaterAt` (die zweite Wahrheit der Ufer-Scheu).
        out.ohneZweiteWahrheit = window.__fehlt(r._creatureWaterContextAt, /_waterLevelAt\(|_isAboveWaterAt\(/);

        // BODEN-CACHE: die teuren `_voxelSurfaceY`-Scans sind pro Frame per Budget gedeckelt, nicht 1–2×
        // pro Kreatur. Das Budget dekrementiert je echtem Scan → hier als Scan-Zähler gelesen.
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

        return out;
    });
    if (res.error) {
        check("Welle V11.0-d.1: Wasser-Kontext-Band (realm verfügbar)", false, res.error);
        return;
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
    check("erster Boden-Zugriff scannt (Budget dekrementiert)", res.gFirstScan === true);
    check("gleiche Position → Cache-Hit (kein Scan)", res.gCacheHit === true);
    check("Bewegung < 0.5 m → Cache-Hit (kein Scan)", res.gCacheNear === true);
    check("Bewegung > 0.5 m → Refresh (ein Scan)", res.gRefreshOnMove === true);
    check(
        "Budget erschöpft → die Gewanderte trägt ihr Cache, nur die Frische scannt einmal (FPS-Bound, Welle L)",
        res.gBudgetBound === true
    );
}

// Tiefen-Scheue + Schwimm-Surface: der wander-Loop konsumiert `_creatureWaterContextAt`, biast die
// Richtung zum Ufer und hebt Y auf die Schwimm-Surface. Probe: Kreatur in eine Wasser-Spalte
// teleportieren, `updateCreatures(0.016)` ticken, Y prüfen.
async function checkBandWelleV11D2WaterBias({ page, check }) {
    const res = await page.evaluate(async () => {
        if (!r || !r.state) return { error: "no realm" };
        const out = {};

        // Empirisch — finde eine Wasser-Spalte im Spawn-Bereich.
        let waterSpot = null;
        const SCAN_RANGE = 120;
        const SCAN_STEP = 6;
        // Die Suche läuft um das Ufer des Sees des Gesetzes (`__wasserOrt`): die
        // erste See-Zelle mit einem Land-Nachbarn. Ein tiefer Punkt zählt, wenn auf einer Achse binnen 9 m Land über dem
        // Spiegel steht — die Probe will den Uferweg der Kreatur (der See ist 600 m breit, seine Mitte hat kein Ufer).
        // Tiefe und Land sind die EINE Wahrheit, die der Helfer liest (`_creatureWaterContextAt`): das Wasser am Körper
        // (`_koerperWasser` über dem Grund, mit dem Pegel des Sees) und das Ufer, wo der Grund nicht nass ist (`_nassAt`,
        // Marge 0,1 m). Bis wetter.K3 las die Suche das 3×3-gedehnte `_waterLevelAt` + 0,5 m: hob der Regen den See um seinen
        // Hub (0,2 m), fand sie an der Ufer-Bank kein Land mehr, das der Helfer als Land las.
        const seeOrt = await window.__wasserOrt("see");
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
            return ly !== null && Number.isFinite(ly) && !r._nassAt(x, z, 0.1, ly);
        };
        for (let dx = -SCAN_RANGE; dx <= SCAN_RANGE && !waterSpot; dx += SCAN_STEP) {
            for (let dz = -SCAN_RANGE; dz <= SCAN_RANGE && !waterSpot; dz += SCAN_STEP) {
                const x = mx + dx;
                const z = mz + dz;
                const sy = r._voxelSurfaceY(x, z);
                if (sy === null || !Number.isFinite(sy)) continue;
                const wy = r._koerperWasser(x, z, sy);
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

// DAS HOCH-BECKEN (Stau-Spiegel): ein Spieler-Werk (Fill/solide Architektur) hält den Pegel seines bounded Spill-Scans
// (Priority-Flood) als Gesetz des Spiegels (`_stauFelder`). Hier nur PURE Beweise; der Welt-Beweis am echten Fluss ist
// gate:wasser-leben G6 · G7 und am Bau der Prüfbühne gate:werk-im-wasser D.
async function checkBandV18129HochBecken({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const C = r.constructor.CA_STAU;
        out.config =
            !!C &&
            Object.isFrozen(C) &&
            [C.REACH, C.WIN_MAX, C.CLUSTER_GAP, C.MIN_EXTENT].every(Number.isFinite);
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
        const fillClosed = globalThis.__gelaendeCore.stauUeberlauf(closed.barrier, w, w, closed.init);
        out.basinHolds = Math.abs(fillClosed[5 + 5 * w] - 10) < 1e-9; // Zentrum hält bis Wand-Krone
        out.outsideOpen = Math.abs(fillClosed[1 + 1 * w] - 1) < 1e-9; // außerhalb: Außenwelt-Pegel
        const gapped = mkGrid(true);
        const fillGap = globalThis.__gelaendeCore.stauUeberlauf(gapped.barrier, w, w, gapped.init);
        out.gapDrains = Math.abs(fillGap[5 + 5 * w] - 1) < 1e-9; // ein Loch → kein Stau
        return out;
    });
    if (!res) {
        check("Hoch-Becken: Sonde lief", false, "evaluate warf");
        return;
    }
    check("Hoch-Becken: CA_STAU-Konfiguration steht (frozen, vollständig)", res.config);
    check("Hoch-Becken: der Spill-Scan hält das GESCHLOSSENE Becken (Krone-Pegel)", res.basinHolds);
    check("Hoch-Becken: außerhalb der Wand gilt der Außenwelt-Pegel (keine Badewanne)", res.outsideOpen);
    check("Hoch-Becken: EIN Loch im Ring → kein Stau (der Damm/Pfeiler-Diskriminator)", res.gapDrains);
}

// Γ6 — stehende Wände gegen geheilte visuelle Narben: (G2) chunk-seam per Pad+Crop (Source-Wand) · (G3) false-swim via
// `_koerperWasser` (die EINE Wahrheit am Körper) · (G4) arch-water-solid via blockerAABBs. KEINE mutativen Spawns — Source-
// Proben + Welt nach Warmup. (G1, das Schneeband, misst seit stoffe.K3-2 die Schmelze der Wasser-Wand: der Boden-Leser trägt
// die Grenze des Pegels übers Jahr, im Sommer schneefrei am Ufer — gate:wasser-leben S2.)
async function checkBandV18194Gamma6Befoerderung({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const s = r.state;
        const out = {};

        // (G3) FALSE-SWIM: der Körper liest EINE Wasser-Wahrheit (`_koerperWasser`, Welle L Q6), und sie kennt die DECKE
        // die Zellen halten Höhlen unter und neben Seen trocken (caveDry, `_skyOpenWaterFilter`). Die Probe sucht
        // in den geladenen Wasser-Chunks jede erste LUFT-Zelle über FEST, deren Mitte unter dem Spiegel des Gesetzes liegt
        // und über der eine FEST-Zelle steht (eine trockene Höhle), und stellt einen Körper auf ihren Boden: er liest dort
        // nie Wasser.
        // Plus: Worker-Mirror baut waterCells via Flood (Vertikal-Open).
        const hoehle = { unter: 0, neben: 0, nassUnter: 0, nassNeben: 0 };
        // Der Höhlen-Chunk unter dem See des Gesetzes (`__wasserChunk("hoehle")`: die Heimat trägt seit K16 keinen See).
        out.hoehlenChunk = await window.__wasserChunk("hoehle");
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
        out.hoehle = hoehle;
        // Worker-Snapshot trägt hydroBand mit (Cells-Klassifikations-
        // Skip ausserhalb [bottom..top]) → das CELL-MODELL ist tragend
        const wsnap = r._voxelWorkerSnapshotState();
        out.hydroBandPresent = !!wsnap.hydroBand && typeof wsnap.hydroBand.top === "number";

        // (G4) ARCH-WATER-SOLID: nach Warmup existiert Architektur, und die Stein-/Architektur-Bauten
        // tragen `blockerAABBs`.
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
        return out;
    });

    // (G3) FALSE-SWIM
    const hh = res.hoehle || {};
    check(
        `Γ6 (G3b) FALSE-SWIM: die trockene Höhle UNTER dem See bleibt für den Körper trocken (Decke, D11: ${hh.nassUnter} von ${hh.unter} nass)`,
        hh.unter + hh.neben > 0 && hh.nassUnter === 0
    );
    check(
        `Γ6 (G3c) FALSE-SWIM: die trockene Höhle NEBEN dem See bleibt für den Körper trocken (Rand-Spiegel, D11: ${hh.nassNeben} von ${hh.neben} nass)`,
        hh.unter + hh.neben > 0 && hh.nassNeben === 0
    );
    check("Γ6 (G3e) Worker-Snapshot trägt hydroBand (Cell-Klassifikations-Skip)", res.hydroBandPresent === true);
    // (G4) ARCH-WATER-SOLID
    check(
        `Γ6 (G4a) ARCH-SOLIDITY: Architekturen mit blockerAABBs (${res.archWithBlockers}/${res.archSeen} ≥ 30 %, V13.10)`,
        res.archMostlyHaveBlockers === true || res.archMostlyHaveBlockers === "skipped-no-archs"
    );
}

// Die Wasser-Wahrheits-Linse — die stehende Linse der Schöpfer-Browser-Symptome: F1 „Wasser kriecht Wände hoch" (das Höhen-Gate der Zell-Dächer) · F2 „spiegelnder Filter über Terrain" (die Rim-Wand
// bei −Infinity) · F4 die Stau-Qualifikation · F5 der Ruhe-Fixpunkt (auch nach dem Schnitt, F3 Graben am Fluss) · F6 die
// geleerte Spalte · F7 das Netz trägt seine Bytes; der Selbsttest an der Naht der Welt (F4 · F5 · F7), nie am Quelltext.
async function checkBandWasserWahrheit({ page, check }) {
    await safeEvaluate(page, async () => {
        await window.__weltDa((r) => !!(r.state.hydrosphere && r.state.hydrosphere.ready));
    });
    const out = (await safeEvaluate(page, async () => {
        const AR = r.constructor;
        const o = { fails: [] };
        const fail = (msg) => o.fails.push(msg);
        // DER WELT-TICK AM SCHEIN-CHUNK (Konsum am Ruf, F5): ein ruhender Chunk 0,0 ohne Bewegung; der Spion zählt, ob
        // `_tickWorldWaterCA` den benannten Versorger ruft, der Automat merkt sich die Kappe, die er bekommt.
        const capS = new Int16Array(64).fill(6);
        const eS = { lod: 0, waterCells: new Uint8Array(1024) };
        const ws = Object.create(r);
        let kappe = null;
        ws._voxelChunkConfig = () => ({ dim: 8, dimY: 16, step: 1.8, span: 14.4, floorDrop: 0 });
        ws._ensureWaterCALevel = () => new Float64Array(1024);
        ws._tickWaterCA = (...a) => ((kappe = a[7]), 0);
        const weltTick = (versorger) => {
            ws.state = { waterCAActive: new Set(["0,0"]), voxelChunks: new Map([["0,0", eS]]), waterCapJ: new Map([["0,0", capS]]) };
            return window.__consumes(ws, "_tickWorldWaterCA", ws, versorger, []);
        };

        // ── FIXTURE 1 (F1) — DIE KLIPPE: kein geglättetes Dach > Flut-Dach + K·step ──
        const cfg0 = r._voxelChunkConfig(0);
        const dim = cfg0.dim, // 24
            dimY = cfg0.dimY, // 232
            step = cfg0.step; // 1.8
        const K = 2;
        const runCliff = (computeFn) => {
            const SOLID = AR.CELL_STATE.SOLID;
            const WATER = AR.CELL_STATE.WATER;
            const cells = new Uint8Array(dim * dim * dimY);
            const dimSq = dim * dim;
            // Plateau (i ≤ 11): SOLID ≤ 39, WATER @40 (Lauf). Tal (i ≥ 12): SOLID ≤ 7,
            // WATER @8..9 (Pool). Direkt benachbart = die 56-m-Klippe der Forensik.
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    const c = i + k * dim;
                    const jSolid = i <= 11 ? 39 : 7;
                    for (let j = 0; j <= jSolid; j++) cells[c + j * dimSq] = SOLID;
                    if (i <= 11) cells[c + 40 * dimSq] = WATER;
                    else {
                        cells[c + 8 * dimSq] = WATER;
                        cells[c + 9 * dimSq] = WATER;
                    }
                }
            }
            const shim = Object.create(r);
            shim.state = { terrainBaseHeight: 0, waterLevel: 0 };
            shim._atlasWaterLevelAt = () => -Infinity; // top = faceY exakt (pur)
            shim._hydroRiverAt = () => null;
            shim._hydrosphereLakeAt = () => false;
            const ctx = {
                smoothPasses: 4,
                getCells: (ncx, ncz) => (ncx === 0 && ncz === 0 ? cells : null),
                getDach: () => undefined,
            };
            const data = computeFn.call(shim, 0, 0, ctx);
            if (!data) return { built: false };
            const oy = 0 - cfg0.floorDrop;
            const valleyFace = oy + 10 * step; // Flut-Dach des Tals (floodTopJ=9 → +10·step)
            let maxYInterior = -Infinity;
            let curtainVerts = 0;
            const pos = data.positions;
            const aSlope = data.aSlope;
            for (let v = 0; v < pos.length / 3; v++) {
                const ix = Math.round(pos[v * 3] / step); // Jitter < step/2 → round sicher
                const y = pos[v * 3 + 1];
                if (ix >= 14 && y > maxYInterior) maxYInterior = y;
                if (aSlope[v] === 4) curtainVerts++;
            }
            return { built: true, valleyFace, maxYInterior, rise: maxYInterior - valleyFace, curtainVerts };
        };
        const cliff = runCliff(r._computeWaterSheetData);
        o.cliff = cliff;
        if (!cliff.built) fail("F1: Klippen-Fixture baute kein Sheet");
        else {
            if (!(cliff.rise <= K * step + 1e-6))
                fail(
                    `F1: geglättetes Tal-Dach kletterte die Wand hoch (rise=${cliff.rise.toFixed(2)} m > ${K * step} m)`
                );
            if (!(cliff.curtainVerts > 0))
                fail("F1: kein Lippe+Vorhang an der Klippe (der ECHTE Wasserfall muss weiterleben)");
            if (!(cliff.maxYInterior > -Infinity)) fail("F1: kein Tal-Vertex (ix ≥ 14) — die Linse ist blind");
        }
    
        // ── FIXTURE 2 (F2) — DIE RIM-WAND: −Inf liefert an Land neben Wasser KEIN Wasser ──
        // Echte Region: eine atlas-LAND-Spalte mit Wasser-Körper im 3×3, ohne Fluss. Seit K16 sind die Seen die
        // benannten Senken des Flussnetzes (selten): die Heimat-Kachel trägt nicht immer ein Ufer — gesucht wird in den
        // Kacheln bis zum zweiten Ring, die nahen zuerst (wie Klang-Zensus und `__wasserOrt`).
        let shore = null;
        const kachel = AR.HYDROSPHERE.regionSize;
        const ringe = [];
        for (let rx = -2; rx <= 2; rx++) for (let rz = -2; rz <= 2; rz++) ringe.push([rx, rz]);
        ringe.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
        const gesehen = new Set();
        for (const [rx, rz] of ringe) {
            if (shore) break;
            await window.__weltDa(() => !r._ensureHydroTilesAround(rx * kachel, rz * kachel, 0));
            const h = r._hydroFor(rx * kachel, rz * kachel);
            if (!h || gesehen.has(h)) continue;
            gesehen.add(h);
            if (h && h.ready && h.water && h.water.waterKind) {
                const wK = h.water.waterKind;
                // der Spiegel der Zelle wie im Kern (`koerperY`): der See trägt den Pegel (Schmelze und Regen, wetter.K3)
                const wY = Array.from(h.water.waterY, (y, i) => (wK[i] === 2 ? y + window.__gelaendeCore.pegelHub(r._gelaende(), y) : y));
                const hd = h.dim;
                outer: for (let cj = 1; cj < hd - 1; cj++) {
                    for (let ci = 1; ci < hd - 1; ci++) {
                        const here = wK[ci + cj * hd];
                        if (here === 1 || here === 2) continue;
                        let rim = -Infinity;
                        for (let dj = -1; dj <= 1; dj++)
                            for (let di = -1; di <= 1; di++) {
                                const nk = wK[ci + di + (cj + dj) * hd];
                                if ((nk === 1 || nk === 2) && wY[ci + di + (cj + dj) * hd] > rim)
                                    rim = wY[ci + di + (cj + dj) * hd];
                            }
                        if (!(rim > -Infinity)) continue;
                        const px = h.originX + (ci + 0.5) * h.cell;
                        const pz = h.originZ + (cj + 0.5) * h.cell;
                        if (r._hydroRiverAt(px, pz)) continue; // Rim-Pfad isolieren
                        shore = { px, pz, rim };
                        break outer;
                    }
                }
            }
        }
        o.shore = shore;
        if (!shore) fail("F2: keine Rim-Ufer-Spalte in den Kacheln bis Ring 2 gefunden (Welt ohne Ufer?)");
        else {
            const lInf = r._atlasWaterLevelAt(shore.px, shore.pz, -Infinity);
            const lUnder = r._atlasWaterLevelAt(shore.px, shore.pz, shore.rim - 5);
            const lOver = r._atlasWaterLevelAt(shore.px, shore.pz, shore.rim + 5);
            o.shoreLevels = { lInf, lUnder, lOver, rim: shore.rim };
            // terrainTopY −Inf liefert an der Land-Spalte kein Wasser, ein endliches topY UNTER rim behält die Rim-Füllung (echte
            // Ufer bleiben), eins ÜBER rim bleibt trocken
            if (lInf !== -Infinity || lUnder !== shore.rim || lOver !== -Infinity)
                fail(`F2 RIM-WAND: ${JSON.stringify(o.shoreLevels)}`);
        }
        // Fluss-Wand: Bank-Punkt (centerness=0, kein Körper im 3×3) vs Kern-Punkt.
        let bank = null;
        let core = null;
        {
            const h = r._hydroFor(0, 0);
            if (h && h.ready && h.water && h.water.waterKind) {
                const wK = h.water.waterKind;
                const hd = h.dim;
                const bodyNear = (x, z) => {
                    const ci = Math.floor((x - h.originX) / h.cell);
                    const cj = Math.floor((z - h.originZ) / h.cell);
                    for (let dj = -1; dj <= 1; dj++)
                        for (let di = -1; di <= 1; di++) {
                            const ni = ci + di,
                                nj = cj + dj;
                            if (ni < 0 || nj < 0 || ni >= hd || nj >= hd) continue;
                            const nk = wK[ni + nj * hd];
                            if (nk === 1 || nk === 2) return true;
                        }
                    return false;
                };
                const sz = h.dim * h.cell;
                for (let z = h.originZ + 8; z < h.originZ + sz && !(bank && core); z += 8) {
                    for (let x = h.originX + 8; x < h.originX + sz && !(bank && core); x += 8) {
                        const rv = r._hydroRiverAt(x, z);
                        if (!rv || bodyNear(x, z)) continue;
                        if (!core && rv.centerness > 0.3) core = { x, z, s: rv.surfaceY };
                        if (!bank && rv.centerness === 0) bank = { x, z, s: rv.surfaceY };
                    }
                }
            }
        }
        o.bank = bank;
        o.core = core;
        if (bank) {
            const lb = r._atlasWaterLevelAt(bank.x, bank.z, -Infinity);
            const le = r._atlasWaterLevelAt(bank.x, bank.z, Infinity);
            o.bankLevels = { lb, le };
            if (lb !== -Infinity) fail(`F2: Fluss-BANK zählt bei −Inf nass (L=${lb}) — die Rampe ist kein Kern`);
            if (!(le > -Infinity))
                fail("F2: +Inf-Existenz-Probe verlor die volle Carve-Breite (colSrc/CA-Quellen!)");
        }
        if (core) {
            const lc = r._atlasWaterLevelAt(core.x, core.z, -Infinity);
            o.coreLevel = lc;
            if (!(lc > -Infinity)) fail("F2: Fluss-KERN verlor sein Fern-Wasser (centerness>0 muss zählen)");
        }
        if (!bank && !core)
            o.riverNote = "kein isolierter Fluss-Punkt gefunden — Fluss-Wand unmessbar (Rim-Kern grün)";

        // ── FIXTURE 4 (F4) — DIE STAU-QUALIFIKATION: geerdet + geschlossen ──
        const runStau = (clusterFn, naht) => {
            const shim = Object.create(r);
            shim.state = {
                worldMeta: { voxelEdits: [] },
                architectures: [
                    // (a) Pfosten: geerdet, aber 0.4 m dünn → staut NICHT
                    { blockerAABBs: [{ minX: 0, maxX: 0.4, minZ: 0, maxZ: 0.4, topY: 12, botY: 10 }] },
                    // (b) geerdeter, geschlossener Damm (4×2 m, Basis 10.5 ≤ Terrain 10 + 1.8) → staut
                    { blockerAABBs: [{ minX: 40, maxX: 44, minZ: 40, maxZ: 42, topY: 14, botY: 10.5 }] },
                    // (c) schwebendes AABB (Basis 14 > Terrain 10 + 1.8) → staut NICHT
                    { blockerAABBs: [{ minX: 80, maxX: 84, minZ: 80, maxZ: 84, topY: 18, botY: 14 }] },
                ],
            };
            shim._stauClusterCache = null; // NIE den echten Cache des Realms lesen
            shim._terrainMacroSurfaceY = () => 10;
            shim._atlasWaterLevelAt = () => -Infinity; // fern jedes Wassers → Krone-Check neutral
            Object.assign(shim, naht);
            return clusterFn.call(shim);
        };
        const clusters = runStau(r._stauWorkClusters);
        o.stauClusters = clusters.map((c) => ({ minX: c.minX, maxX: c.maxX, topY: c.topY }));
        const damOnly =
            clusters.length === 1 &&
            Math.abs(clusters[0].minX - 40) < 1e-6 &&
            Math.abs(clusters[0].maxX - 44) < 1e-6 &&
            Math.abs(clusters[0].topY - 14) < 1e-6;
        if (!damOnly)
            fail(
                `F4: Stau-Qualifikation falsch — erwartet NUR der geerdete geschlossene Damm, bekam ${clusters.length} Werk(e): ${JSON.stringify(o.stauClusters)}`
            );
        // Selbst-Test F4 an den Nähten der Welt: die Zelle 0,3 m (der 0,4-m-Pfosten gilt als geschlossen) und ein Gelände ohne
        // Höhe (der Schweber gilt als geerdet) → Pfosten + Damm + Schweber werden Werke (3 Cluster).
        {
            const bc = runStau(r._stauWorkClusters, {
                _voxelChunkConfig: (l) => Object.assign({}, r._voxelChunkConfig(l), { step: 0.3 }),
                _terrainMacroSurfaceY: () => NaN,
            });
            o.stauBroken = bc.length;
            if (bc.length !== 3) fail(`F4-Selbsttest: die gelockerte Qualifikation ergab ${bc.length} statt 3 Werke`);
        }
    
        // ── FIXTURE 5 (F5) — DIE RUHE IST DER FIXPUNKT: der erwachte Automat bewegt ruhendes Wasser nicht ──
        // K37: jede Werk-Setzung am Ufer weckt den Automaten — die Deck-Zelle (4b) fließt nie in die Zeile über dem See.
        // Bühne: See (i ≤ 3, Flut j 4..6, Quelle), Deck-Spalte (i = 4, Boden j ≤ 6, Deck-Zelle j 7), Land (i ≥ 5, Boden
        // j ≤ 6). Gezählt: Spalten, deren Live-Dach nach 200 Takten vom Flut-Dach abweicht (> 0,6 Zelle oder leer/fremd).
        // F3 (Graben am Fluss): ein Schnitt liegt in der Region, und das Level trägt den Stand von vorher (eine Zunge
        // auf dem Land, j 7) — die Kappe des Gesetzes öffnet dem Land keine Haut, über ihr steht kein Wasser mehr.
        const runRuhe = (capFn, kappeHoch) => {
            const SOLID = AR.CELL_STATE.SOLID;
            const WATER = AR.CELL_STATE.WATER;
            const d = 8,
                dy = 16,
                dSq = d * d,
                st5 = 1.8;
            const cells = new Uint8Array(dSq * dy);
            const L5 = 7 * st5 + 0.2; // Mitte j 6 (11,7) ≤ L < Mitte j 7 (13,5): Flut-Dach j 6
            for (let k = 0; k < d; k++)
                for (let i = 0; i < d; i++) {
                    const c = i + k * d;
                    const boden = i <= 3 ? 3 : 6;
                    for (let j = 0; j <= boden; j++) cells[c + j * dSq] = SOLID;
                    if (i <= 3) for (let j = 4; j <= 6; j++) cells[c + j * dSq] = WATER;
                    if (i === 4) cells[c + 7 * dSq] = WATER; // die Deck-Zelle
                }
            const shim = Object.create(r);
            shim.state = { voxelChunks: new Map([["0,0", { waterCells: cells }]]), terrainBaseHeight: 0 };
            shim._voxelChunkConfig = () => ({ dim: d, dimY: dy, step: st5, span: d * st5, floorDrop: 0 });
            shim._atlasWaterLevelAt = (x, z, t) => {
                if (x < 4 * st5) return L5; // See: Quelle
                if (x < 5 * st5) return Number.isFinite(t) && t < L5 ? L5 : -Infinity; // Rand über flachem Grund
                return -Infinity;
            };
            const vorher = new Float64Array(dSq * dy);
            for (let c = 0; c < cells.length; c++) if (cells[c] === WATER) vorher[c] = 1;
            vorher[6 + 7 * dSq] = 0.9; // die Zunge auf dem Land
            shim.state.waterLevelCells = new Map([["0,0", vorher]]);
            shim._chunkRegionHasCarve = () => true;
            const level = capFn.call(shim, 0, 0);
            const cap = shim.state.waterCapJ.get("0,0");
            if (kappeHoch) for (let c = 0; c < cap.length; c++) if (cap[c] >= 0) cap[c]++; // der K37-Täter: eine Zeile über der Ruhe
            const src = shim.state.waterSourceCols.get("0,0");
            for (let t = 0; t < 200; t++) {
                for (let c = 0; c < dSq; c++)
                    if (src[c])
                        for (let j = 0; j < dy; j++) if (cells[c + j * dSq] === WATER) level[c + j * dSq] = 1;
                r._tickWaterCA(level, cells, d, dy, 0.25, null, null, cap);
            }
            let gerissen = 0;
            for (let c = 0; c < dSq; c++) {
                const sc = r._caColumnScan(cells, level, c, dSq, dy);
                const fl = sc.floodTopJ >= 0 ? sc.floodTopJ + 1 : -1;
                const li = sc.liveTopJ >= 0 ? sc.liveTopJ + sc.liveFrac : -1;
                if (fl < 0 && li < 0) continue;
                if (fl < 0 || li < 0 || Math.abs(li - fl) > 0.6) gerissen++;
            }
            return { gerissen, capDeck: cap[4], capSee: cap[0], capLand: cap[5] };
        };
        const f5 = runRuhe(r._ensureWaterCALevel);
        o.ruhe = f5;
        if (f5.gerissen !== 0) fail(`F5: der erwachte Automat riss ${f5.gerissen} ruhende Spalte(n) (Soll 0)`);
        // KONSUM am Ruf: der Welt-Tick holt das Level über diesen Chokepoint und reicht dessen Kappe an den Automaten.
        kappe = null;
        if (!weltTick("_ensureWaterCALevel") || kappe !== capS)
            fail(
                "F5: _tickWorldWaterCA holt das Level nicht über _ensureWaterCALevel oder reicht dessen Kappe nicht weiter"
            );
        // Selbst-Test F5: die Kappe eine Zeile über der Ruhe (der alte Raum) → die Deck-Spalte MUSS reißen.
        o.ruheBroken = runRuhe(r._ensureWaterCALevel, true).gerissen;
        if (!(o.ruheBroken > 0)) fail("F5-Selbsttest: die alte Kappe ließ die Ruhe stehen (Linse blind)");
    
        // ── FIXTURE 6 (F6) — DIE GELEERTE SPALTE IST TROCKEN: nie ein Dach 14 m unter dem Spiegel ──
        // Ein See (Flut-Dach j 40) mit Live-Dach überall gleich, nur EINE Spalte hat der Automat geleert (−1): das Sheet
        // zeichnet sie nie als Grube unter dem Spiegel.
        const runLeer = (computeFn) => {
            const WATER = AR.CELL_STATE.WATER;
            const SOLID = AR.CELL_STATE.SOLID;
            const dimSq = dim * dim;
            const cells = new Uint8Array(dimSq * dimY);
            for (let c = 0; c < dimSq; c++) {
                for (let j = 0; j <= 30; j++) cells[c + j * dimSq] = SOLID;
                for (let j = 31; j <= 40; j++) cells[c + j * dimSq] = WATER;
            }
            const dach = new Float64Array(dimSq).fill(41);
            dach[12 + 12 * dim] = -1; // die geleerte Spalte
            const shim = Object.create(r);
            shim.state = { terrainBaseHeight: 0, waterLevel: 0 };
            shim._atlasWaterLevelAt = () => -Infinity;
            shim._hydroRiverAt = () => null;
            shim._hydrosphereLakeAt = () => false;
            const ctx = {
                smoothPasses: 4,
                getCells: (ncx, ncz) => (ncx === 0 && ncz === 0 ? cells : null),
                getDach: (ncx, ncz) => (ncx === 0 && ncz === 0 ? dach : undefined),
            };
            const data = computeFn.call(shim, 0, 0, ctx);
            const faceY = 0 - cfg0.floorDrop + 41 * step;
            let minY = Infinity;
            const pos = data ? data.positions : [];
            // nur das Innere (der Rand des Sheets taucht als Anker unter, s. F1)
            for (let v = 0; v < pos.length / 3; v++) {
                const x = pos[v * 3],
                    z = pos[v * 3 + 2];
                if (x < 4 * step || z < 4 * step || x > (dim - 4) * step || z > (dim - 4) * step) continue;
                if (pos[v * 3 + 1] < minY) minY = pos[v * 3 + 1];
            }
            return { grube: +(faceY - minY).toFixed(3) };
        };
        {
            const f6 = runLeer(r._computeWaterSheetData);
            o.leer = f6;
            if (!(f6.grube < 0.05))
                fail(`F6: die geleerte Spalte liegt ${f6.grube} m unter dem Spiegel (Soll trocken, < 0,05)`);
            if (!Number.isFinite(f6.grube)) fail("F6: kein innerer Vertex — die Linse ist blind");
        }
    
        // ── FIXTURE 7 (F7) — DAS NETZ TRÄGT SEINE BYTES: das gezeichnete Wasser überlebt das Verdichten des Satzes ──
        // Das Sheet eines Chunks ist ein View in den Puffer des Wasser-Satzes; verdichtet sich der Satz, schiebt er die
        // Bereiche im alten Puffer nach vorn (copyWithin) und zeigt neue Views. Ein Netz (`_wasserNetz`), das den alten
        // View hielt, las danach die Bytes eines anderen Bereichs (am Damm im Tal 26/−120: 285–1 309 nasse Punkte weg).
        // Bühne: ein Quad bei y 8 (Bereich 2 eines Satzes), dahinter ein fremder Bereich bei y 2 weit weg; das Netz wird
        // gefragt, der Satz verdichtet (fremd rückt in den alten Bereich, der View zeigt neu), das Netz erneut gefragt.
        const runNetz = (netzFn, haeltView) => {
            const quad = (x0, z0, y) => [x0, y, z0, x0 + 9, y, z0, x0, y, z0 + 9, x0 + 9, y, z0 + 9];
            const alt = new Float32Array(24);
            alt.set(quad(30, 30, 2), 0); // Bereich 1 (fremd)
            alt.set(quad(1, 1, 8), 12); // Bereich 2 (das Sheet des Chunks 0,0)
            const mesh = {
                geometry: {
                    attributes: { position: { array: alt.subarray(12, 24) } },
                    index: { array: new Uint32Array([0, 2, 1, 1, 2, 3]) },
                },
            };
            const entry = { waterCells: new Uint8Array(1) };
            const shim = Object.create(r);
            shim.state = {
                voxelChunks: new Map([["0,0", entry]]),
                voxelChunkWaterIso: new Map([["0,0", mesh]]),
            };
            // der Täter an der Naht: das Netz bekommt den View des Satzes statt seiner Kopie
            if (haeltView) shim._wasserNetzBau = (cx, cz, pos, idx) => r._wasserNetzBau.call(shim, cx, cz, mesh.geometry.attributes.position.array, idx);
            const h0 = AR._wasserNetzHoehe(netzFn.call(shim, 0, 0), 5, 5);
            // das Verdichten: Bereich 2 rückt nach vorn, ein dritter Bereich (fremd, y 2) zieht in seinen alten Platz
            alt.copyWithin(0, 12, 24);
            alt.set(quad(30, 30, 2), 12);
            const neu = new Float32Array(12);
            neu.set(alt.subarray(0, 12));
            mesh.geometry.attributes.position.array = neu.subarray(0, 12);
            const h1 = AR._wasserNetzHoehe(netzFn.call(shim, 0, 0), 5, 5);
            return { h0, h1 };
        };
        const f7 = runNetz(r._wasserNetz);
        o.netz = f7;
        if (!(f7.h0 === 8 && f7.h1 === 8))
            fail(`F7: das gezeichnete Wasser nach dem Verdichten des Satzes ${f7.h1} statt ${f7.h0} (Soll 8)`);
        // KONSUM am Ruf: das gezeichnete Wasser (`_wasserBildAt`) liest das Netz.
        const pm = r.state.playerMesh.position;
        if (!window.__consumes(r, "_wasserBildAt", r, "_wasserNetz", [pm.x, pm.z]))
            fail("F7: _wasserBildAt liest das Netz nicht");
        o.netzBroken = runNetz(r._wasserNetz, true).h1;
        if (o.netzBroken === 8) fail("F7-Selbsttest: mit dem gehaltenen View blieb das Netz richtig — Linse blind");
        return o;
    })) || { fails: ["keine Antwort der Seite"] };
    check("Wasser-Wahrheit: F1 Höhen-Gate · F2 Rim-Wand · F4 Stau · F5 Ruhe-Fixpunkt auch nach dem Schnitt · F6 geleerte Spalte · F7 Netz, Selbsttest an den Nähten F4 · F5 · F7", out.fails.length === 0, out.fails.join(" · ").slice(0, 400));
}

// B1 der Wasser-Sheet-Worker-Spiegel ist BYTE-IDENTISCH — eingefaltet aus gate:worker-watersheet: der Worker baut den
// Wasser-Zell-Oberkanten-Sheet OFF-THREAD (`buildWaterSheetGeometry`) und MUSS bit-identisch zum Main-Sync-Pfad
// (`_computeWaterSheetData`) sein, sonst lebt das Wasser auf zwei Wahrheiten (Lehre 7). Am nächsten Wasser der Welt (`__wasserOrte`):
// je CA-freiem Wasser-Chunk Main gegen Worker-Round-Trip, positions/indices/aFlow/aWave/aDepth/aSlope byte-für-byte, maxDiff 0.
async function checkBandWasserSheetSpiegel({ page, check }) {
    await safeEvaluate(page, require(path.join(SKRIPTE, "lib", "wasser-linse.cjs")).WASSER_INSTALL);
    const steer = await safeEvaluate(page, async () => {
        const s = r.state;
        if (!s || !s.playerMesh) return { err: "kein Spieler" };
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;
        const O = (await window.__wasserOrte({ mess: [px, pz] }));
        // DAS NÄCHSTE WASSER: See ODER Fluss, was näher liegt — das Gelände des Kerns füllt keine Mulden mehr (Senken
        // ≤ 1/km²), der nächste benannte See lag 5 km weit, und der Strom baute dort in der Frist keinen Chunk (0 verglichen)
        const kand = [];
        if (O && O.see) kand.push({ x: O.see.x, z: O.see.z, L: O.see.level });
        if (O && O.fluss) kand.push({ x: O.fluss.x, z: O.fluss.z, L: r._atlasWaterLevelAt(O.fluss.x, O.fluss.z, -Infinity) });
        const spot = kand
            .filter((k) => Number.isFinite(k.L))
            .sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz))[0];
        if (!spot) return { err: "kein See und kein Fluss in der Welt (`__wasserOrte`)" };
        // Spieler ans Wasser (Body-frei seit V18.331 — nur die Mesh-Position treibt das Streaming).
        s.playerMesh.position.set(spot.x, spot.L + 3, spot.z);
        // Streaming-Pump: der Worker baut die Chunks um den Spieler + liefert waterCells.
        // bis der Ort steht: Chunks um den Spieler mit Wasser-Zellen (das EINE Warten, welt-boot `__gebautNach`), mindestens 280 Takte
        const steht = () => {
            let n = 0;
            for (const e of s.voxelChunks.values()) if (e && e.waterCells && e.waterCells.length) n++;
            return s.voxelChunks.size > 8 && n > 0;
        };
        const pumpe = async (i) => {
            try {
                r._tickVoxelChunkStreaming();
                r._gameLoopTick(performance.now());
                r._drainPendingWaterIso();
            } catch {
                /* */
            }
            if (i % 6 === 0) await sleep(12);
        };
        for (let i = 0; i < 280; i++) await pumpe(i);
        await window.__gebautNach("Chunks mit Wasser-Zellen am Ort", { fertig: steht, takt: pumpe, max: 4000 });
        return { x: +spot.x.toFixed(1), z: +spot.z.toFixed(1), L: +spot.L.toFixed(1), chunks: s.voxelChunks.size };
    });
    const report = (await safeEvaluate(page, async () => {
        const out = {
            ok: true,
            msgs: [],
            compared: 0,
            zwei: 0,
            maxDiff: 0,
            mismatches: [],
        };
        if (!r || !r.state || !r.state.voxelChunks) {
            out.ok = false;
            out.msgs.push("keine Welt/voxelChunks");
            return out;
        }
        if (!r.state.voxelWorker || !r.state.voxelWorkerReady) {
            out.ok = false;
            out.msgs.push("Worker nicht bereit");
            return out;
        }
        // Welt EINFRIEREN: der rAF-Loop würde sonst streamen. `_gameLoopTick` →no-op. Dann `waterCAActive`
        // LEEREN (nichts fliesst → der `waterCAActive`-Gate lässt alle durch). Das Sheet liest den Live-Pegel
        // nie (das GEZEICHNETE Dach, `entry._caDach`); ein Chunk mit Dach im 3×3 baut der Main
        // (`_waterSheetCaFree` false) — verglichen wird genau die Worker-Route: dachlos = Flood = identisch.
        r._gameLoopTick = () => {};
        if (r.state.waterCAActive) r.state.waterCAActive.clear();
        // Kandidaten: CA-freie Chunks, deren Main-Sheet NICHT null ist (also Wasser tragen).
        const keys = [...r.state.voxelChunks.keys()];
        const cand = [];
        for (const key of keys) {
            const ci = key.indexOf(",");
            const cx = parseInt(key.slice(0, ci), 10);
            const cz = parseInt(key.slice(ci + 1), 10);
            const entry = r.state.voxelChunks.get(key);
            if (!entry || !entry.waterCells || entry.waterCells.length === 0) continue;
            if (!r._waterSheetCaFree(cx, cz)) continue;
            let mainData = null;
            try {
                mainData = r._computeWaterSheetData(cx, cz, r._mainWaterSheetCtx(cx, cz, entry));
            } catch (e) {
                out.msgs.push(`main-compute-throw ${key}: ${e.message}`);
                continue;
            }
            if (!mainData) continue; // kein Wasser-Sheet in diesem Chunk
            cand.push({ cx, cz, key, mainData });
            if (cand.length >= 24) break;
        }
        if (cand.length === 0) {
            out.ok = false;
            out.msgs.push("KEIN CA-freier Wasser-Chunk gefunden (Welt ohne Wasser im Ring?)");
            return out;
        }
    
        const f32 = (a) => (a instanceof Float32Array ? a : new Float32Array(a));
        const u32 = (a) => (a instanceof Uint32Array ? a : new Uint32Array(a));
        const cmpF = (label, a, b, ctx) => {
            const A = f32(a);
            const B = f32(b);
            if (A.length !== B.length) {
                out.ok = false;
                out.mismatches.push(`${ctx} ${label} LEN ${A.length}≠${B.length}`);
                return;
            }
            for (let i = 0; i < A.length; i++) {
                const d = Math.abs(A[i] - B[i]);
                if (d > out.maxDiff) out.maxDiff = d;
                if (d !== 0) {
                    out.ok = false;
                    if (out.mismatches.length < 12)
                        out.mismatches.push(`${ctx} ${label}[${i}] ${A[i]}≠${B[i]} (Δ${d})`);
                }
            }
        };
        const cmpU = (label, a, b, ctx) => {
            const A = u32(a);
            const B = u32(b);
            if (A.length !== B.length) {
                out.ok = false;
                out.mismatches.push(`${ctx} ${label} LEN ${A.length}≠${B.length}`);
                return;
            }
            for (let i = 0; i < A.length; i++) {
                if (A[i] !== B[i]) {
                    out.ok = false;
                    if (out.mismatches.length < 12) out.mismatches.push(`${ctx} ${label}[${i}] ${A[i]}≠${B[i]}`);
                    if (1 > out.maxDiff) out.maxDiff = 1;
                }
            }
        };
    
        // ZWEI FEHLRUNDEN (streaming.K5): je Blatt verfehlt in den ersten zwei Runden ein Verweis den Faden
        let n = 0;
        r._voxelFadenAuftrag = function (w, m) {
            if (n < 2 && m.zids && m.zids.some((z, i) => z && (m.zids[i] = 1e9))) n++;
            return r.constructor.prototype._voxelFadenAuftrag.apply(this, arguments);
        };
        for (const c of cand) {
            let wd = null;
            n = 0;
            try {
                wd = await r._workerBuildWaterSheet(c.cx, c.cz);
                out.zwei += n > 1;
            } catch (e) {
                out.ok = false;
                out.msgs.push(`worker-throw ${c.key}: ${e.message}`);
                continue;
            }
            if (!wd || wd.empty) {
                out.ok = false;
                out.mismatches.push(`${c.key}: Worker EMPTY, Main hatte ${c.mainData.positions.length / 3} Verts`);
                continue;
            }
            cmpF("position", c.mainData.positions, wd.positions, c.key);
            cmpU("index", c.mainData.indices, wd.indices, c.key);
            cmpF("aFlow", c.mainData.aFlow, wd.aFlow, c.key);
            cmpF("aWave", c.mainData.aWave, wd.aWave, c.key);
            cmpF("aDepth", c.mainData.aDepth, wd.aDepth, c.key);
            cmpF("aSlope", c.mainData.aSlope, wd.aSlope, c.key);
            out.compared++;
        }
        delete r._voxelFadenAuftrag;
        return out;
    })) || { ok: false, msgs: ["keine Antwort der Seite"], mismatches: [] };
    check(
        `Wasser-Sheet-Spiegel: Worker == Main byte-identisch (maxDiff ${report.maxDiff}) über ${report.compared} CA-freie Wasser-Chunks am Wasser ${steer && !steer.err ? `(${steer.x}, ${steer.z})` : ""}, ${report.zwei} nach zwei Fehlrunden`,
        !!steer && !steer.err && report.ok && report.compared > 0 && report.maxDiff === 0 && report.zwei > 0,
        [steer && steer.err, ...report.msgs, ...report.mismatches].filter(Boolean).join(" · ").slice(0, 300)
    );
}

module.exports = {
    checkBandHydrosphere, checkBandWelleC1WaterCells, checkBandWelleC2WaterIsoSurface,
    checkBandWellePerfHWaterIsoQueue, checkBandV17117FarWater, checkBandWelleV11D1WaterContext,
    checkBandWelleV11D2WaterBias, checkBandV18129HochBecken, checkBandV18194Gamma6Befoerderung,
    checkBandWasserWahrheit, checkBandWasserSheetSpiegel,
};
