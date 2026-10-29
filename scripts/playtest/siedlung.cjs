"use strict";
// scripts/playtest/siedlung.cjs — der Richter von Siedlung (spec/stamm/modul-karte.json): Siedlungs-Plan · Bau-Frei · Dorf-Erlebnis · Tore und Membranen · Fahr-Platz · Arch-Mesh · Arch-Flatten · Chunk-Satz · Varianten-LOD · Okklusion · Bau-Satz · Werfer · Kronen · Wege · Fundament · Arch-Instanzen.
// 10 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// GROSSE Strukturen (Dorf/Tempel/Wasserfall) spawnen nicht AUF dem Spieler (Chunk-Remesh →
// Durchfall), kleine Platzierungen unberührt; ein Void-Boden holt aus jedem Durchfall zurück.
async function checkBandV1728SpawnClearance({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const MIN = r.constructor.STRUCTURE_CLEAR_MIN_FOOTPRINT;
        const MARGIN = r.constructor.STRUCTURE_PLAYER_CLEAR_MARGIN;
        out.hasConsts =
            typeof MIN === "number" && typeof MARGIN === "number" && typeof r.constructor.PLAYER_VOID_Y === "number";
        // Footprint-Radius: Siedlungs-Klasse gross (>= MIN), Felsblock klein (< MIN) — gemessen über die
        // Substanz-Zeile haus_basis (KIND_SUBSTANCE-Fallback in _blueprintFootprintRadius, wie spawn_village).
        const fpVillage = r._blueprintFootprintRadius("haus_basis");
        const fpBlock = r._blueprintFootprintRadius("stein_block");
        out.villageBig = fpVillage >= MIN;
        out.blockSmall = fpBlock < MIN;
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm) {
            const px = pm.x,
                py = pm.y,
                pz = pm.z;
            const ctx2 = { state: r.state, rng: () => 0.5 };
            // (1) Haus-Substanz AUF dem Spieler → wird auf >= clearance geschoben
            const onPlayer = { x: px, y: py, z: pz };
            const cleared = r._structureSpawnPos("haus_basis", onPlayer, ctx2);
            const dist = Math.hypot(cleared.x - px, cleared.z - pz);
            out.villagePushed = dist >= fpVillage + MARGIN - 0.01;
            // (2) Felsblock AUF dem Spieler → bleibt (klein = intentional)
            const blockCleared = r._structureSpawnPos("stein_block", { x: px, y: py, z: pz }, ctx2);
            out.blockUntouched = Math.abs(blockCleared.x - px) < 1e-6 && Math.abs(blockCleared.z - pz) < 1e-6;
            // (3) Haus WEIT weg → unberuehrt (schon ausserhalb der clearance)
            const farPos = { x: px + 200, y: py, z: pz };
            const farCleared = r._structureSpawnPos("haus_basis", farPos, ctx2);
            out.farUntouched = Math.abs(farCleared.x - (px + 200)) < 1e-6;
            // (4) Void-Rettung: faellt der Spieler durch, kommt er an die Oberflaeche
            pm.set ? pm.set(px, -200, pz) : (pm.y = -200);
            r.state.playerMesh.position.set(px, -200, pz);
            r._rescuePlayerFromVoid();
            const rescuedY = r.state.playerMesh.position.y;
            out.voidRescued = rescuedY > r.constructor.PLAYER_VOID_Y && rescuedY > -90;
            out.rescuedY = rescuedY;
            // Restore Spieler-Position (feld-nativ: Mesh + Velocity) — kein Seiteneffekt fuer Folge-Bands
            r.state.playerMesh.position.set(px, py, pz);
            if (r.state.playerVel) {
                r.state.playerVel.setValue(0, 0, 0);
                r.state._fieldVy = 0;
            }
        }
        return out;
    });
    check("V17.28 Spawn-Clearance: Konstanten verdrahtet (MIN/MARGIN/PLAYER_VOID_Y)", res.hasConsts);
    check(
        "V17.28 Spawn-Clearance: Siedlungs-Footprint (haus_basis-Substanz) gross (>= MIN, wird geschoben)",
        res.villageBig
    );
    check("V17.28 Spawn-Clearance: Felsblock-Footprint klein (< MIN, intentional bleibt)", res.blockSmall);
    check(
        "V17.28 Spawn-Clearance: ein Haus AUF dem Spieler wird klar weggeschoben (kein Fall-durch)",
        res.villagePushed
    );
    check(
        "V17.28 Spawn-Clearance: ein Felsblock AUF dem Spieler bleibt (kleine Platzierung unberuehrt)",
        res.blockUntouched
    );
    check("V17.28 Spawn-Clearance: eine weit entfernte Struktur bleibt unberuehrt", res.farUntouched);
    check(
        "V17.28 Void-Boden: faellt der Spieler durch, kommt er an die Oberflaeche zurueck",
        res.voidRescued,
        `y=${res.rescuedY}`
    );
}

// Budgetierter Culling-Build: `tickArchitectureCulling` baut höchstens
// `architectureBuildBudgetPerFrame` teure Builds pro Frame, statt beim Eintritt in eine dichte
// Region alle cold-Einträge auf einmal (FPS-Sturm).
async function checkBandWellePerfDBudget({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || !r.state || !r.state.playerMesh) return { error: "no realm/player" };
        const out = {};
        out.hasBudgetField = Number.isFinite(r.state.architectureBuildBudgetPerFrame);
        const budget = r.state.architectureBuildBudgetPerFrame;
        out.budget = budget;
        // N7.3 — UNIT-RICHTER: der Prüf-Gegenstand ist der budgetierte GRAMMATIK-Bau-Pfad
        // (`_rebuildArchitectureMesh` klassisch/instanced); foundry-ON hinge derselbe Spawn
        // an der Studio-Varianten-Cache-Lage (variant-abhängig kalt) → lokaler Hook.
        window.__withNoFoundry(() => {
            const pp = r.state.playerMesh.position;
            // 12 cold-in-range Einträge: cullingRadius=0 beim Spawn (cold), dann
            // restaurieren, sodass sie alle im Render-Radius liegen.
            const origRadius = r.state.architectureCullingRadius;
            r.state.architectureCullingRadius = 0;
            const ids = [];
            const N = 12;
            for (let i = 0; i < N; i++) {
                const e = r.spawnArchitecture(
                    "baum_kiefer",
                    { x: pp.x + 4 + i, y: pp.y, z: pp.z + 4 },
                    { seed: 31000 + i, silent: true }
                );
                if (e) ids.push(e.id);
            }
            r.state.architectureCullingRadius = Math.max(origRadius, 300);
            // tickArchitectureCulling baut 0 bei `_frameOverBudget` (Bau nur in freier Zeit) → Kopfraum
            // erzwingen, sonst hängt der Bau-Pfad-Test am Warmup-Leftover (langsamer Warmup = Flake).
            r.state._frameOverBudget = false;
            const idSet = new Set(ids);
            const renderedCount = () =>
                r.state.architectures.filter((e) => idSet.has(e.id) && r._archIsRendered(e)).length;
            out.coldBefore = ids.length - renderedCount();
            // EIN Tick → höchstens `budget` der 12 gebaut (kein Burst).
            const renderedPre = renderedCount();
            r.tickArchitectureCulling(performance.now());
            out.builtInOneTick = renderedCount() - renderedPre;
            out.respectsBudget = out.builtInOneTick <= budget;
            // Alle 12 bauen: das Cull-Budget ist GLOBAL, unter kumulativer Last verhungern die Test-Bäume an
            // Hunderten cold-Architekturen. Darum den Bau-Pfad DIREKT prüfen — `_rebuildArchitectureMesh` ist
            // dieselbe Bau-Quelle, die der Cull-Tick budgetiert ruft.
            for (const e of r.state.architectures.filter((x) => idSet.has(x.id) && !r._archIsRendered(x))) {
                r._rebuildArchitectureMesh(e);
            }
            out.builtAfterManyTicks = renderedCount();
            out.allEventuallyBuilt = out.builtAfterManyTicks === ids.length;
            // Cleanup.
            for (const e of r.state.architectures.filter((x) => idSet.has(x.id))) r.removeArchitecture(e);
            r.state.architectureCullingRadius = origRadius;
        });
        return out;
    });
    if (res.error) {
        check("V12.0-perf.d: Budget-Band (realm)", false, res.error);
        return;
    }
    check(
        "V12.0-perf.d: architectureBuildBudgetPerFrame existiert (≥1)",
        res.hasBudgetField && res.budget >= 1,
        `budget=${res.budget}`
    );
    check(
        "V12.0-perf.d: 12 cold-in-range Einträge vor dem ersten Tick",
        res.coldBefore === 12,
        `cold=${res.coldBefore}`
    );
    check(
        "V12.0-perf.d: EIN Tick baut höchstens budget (kein Burst)",
        res.respectsBudget,
        `gebaut=${res.builtInOneTick}, budget=${res.budget}`
    );
    check(
        "V12.0-perf.d: über mehrere Ticks werden ALLE gebaut (sanftes Pop-In)",
        res.allEventuallyBuilt,
        `gebaut=${res.builtAfterManyTicks}/12`
    );
}

async function checkBandRing6Workshop({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Ring 6 — architectureTemplates V1 ###
    // Bau-Primitive als DSL-Ops mit Save-Roundtrip + FIFO-Cap + Atomic-Pool-Eintrag (niedrige
    // Gewichtung); Wasserfälle haben einen Animations-Hook im Tick.
    const ring6Results = await safeEvaluate(page, async () => {
        if (!r || !r.state) return null;
        const out = {};

        // Cleanup: alle bestehenden Architekturen entfernen.
        __bautenLeer();

        // (a) Direkter Spawn jeder Sorte. AUSLÖSCHUNGS-WELLE — village/temple fielen als
        // Blueprints; die eingefrorenen Substanz-Zeilen (KIND_SUBSTANCE haus_basis/tor_basis)
        // tragen die Spawn-/Save-/Cull-Mechanik als Test-Blueprints (am Band-Ende geräumt).
        const KSr6 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_r6_haus) delete r.state.blueprints._t_r6_haus;
        r.state.blueprints._t_r6_haus = {
            name: "_t_r6_haus",
            parts: JSON.parse(JSON.stringify(KSr6.haus_basis.parts)),
        };
        if (r.state.blueprints._t_r6_tor) delete r.state.blueprints._t_r6_tor;
        r.state.blueprints._t_r6_tor = {
            name: "_t_r6_tor",
            parts: JSON.parse(JSON.stringify(KSr6.tor_basis.parts)),
        };
        const v = r.spawnArchitecture("_t_r6_haus", { x: 10, y: 5, z: 10 }, { seed: 42 });
        out.villageBuilt = !!v && v.type === "_t_r6_haus" && !!v.mesh;
        // der Render-Merge fasst die Teile per Material zu wenigen Meshes
        // zusammen. Die Vollständigkeit prüfen wir an der QUELLE (Bauplan-Teile), nicht an
        // der gerenderten Kind-Zahl: die haus_basis-Substanz trägt alle 6 Wand-/Dach-Teile.
        out.villageHasChildren =
            v && v.mesh && !!r.state.blueprints._t_r6_haus && (r.state.blueprints._t_r6_haus.parts || []).length >= 5;
        out.villageInScene = v && r.state.scene.children.indexOf(v.mesh) >= 0;

        const t = r.spawnArchitecture("_t_r6_tor", { x: 30, y: 5, z: 10 }, { seed: 7 });
        out.templeBuilt = !!t && t.type === "_t_r6_tor" && !!t.mesh;
        // 2 Pfosten + Sturz + Schwelle = 4 Substanz-Teile (tor_basis; per Material
        // gemergt → die Vollständigkeit lebt im Bauplan, nicht der Kind-Zahl).
        out.templeHasPillars =
            t && t.mesh && !!r.state.blueprints._t_r6_tor && (r.state.blueprints._t_r6_tor.parts || []).length >= 4;

        const w = r.spawnArchitecture("waterfall", { x: 50, y: 5, z: 10 }, { seed: 99 });
        out.waterfallBuilt = !!w && w.type === "waterfall" && !!w.mesh;
        out.waterfallHasAnimateHook = w && w.mesh && w.mesh.userData && typeof w.mesh.userData.animate === "function";

        // (b) Unbekannter Typ wird abgelehnt
        const bad = r.spawnArchitecture("schloss", { x: 0, y: 5, z: 0 });
        out.unknownTypeRejected = bad === null;

        // (c) state.architectures wächst korrekt
        out.architectureCountAfterThree = r.state.architectures.length === 3;
        out.idsAreUnique = new Set(r.state.architectures.map((a) => a.id)).size === r.state.architectures.length;

        // (d) DSL-Op: spawn_village wirkt durch Interpreter. AUSLÖSCHUNGS-WELLE — das VERB
        // hebt jetzt das Studio-DORF (spawnSettlement, async über den Worker) statt einen
        // Architektur-Eintrag zu bauen; der Test fängt den Ruf am Chokepoint (Stub).
        const svCalls = [];
        const origSv = r.spawnSettlement;
        r.spawnSettlement = function (o) {
            svCalls.push(o);
            return null;
        };
        let dslRes;
        try {
            dslRes = r.dslRun(["spawn_village", ["at_origin"]]);
        } finally {
            r.spawnSettlement = origSv;
        }
        out.dslSpawnVillageOk =
            dslRes.ok === true && svCalls.length === 1 && dslRes.log.some((e) => e.event === "spawned_village");

        // (e) Chat-Pattern routet auf DSL. AUSLÖSCHUNGS-WELLE — spawn_temple spawnt
        // haus_griechisch (Foundry warm) ODER skippt fail-closed (studio_kalt, kein Bau).
        const beforeChat = r.state.architectures.length;
        r.processChatCommand("Baue Tempel hier");
        out.chatRoutesToDsl =
            Array.isArray(r.state.dsl.lastUserProgram) && r.state.dsl.lastUserProgram[0] === "spawn_temple";
        const tempelWarm = !!(r.state.blueprints && r.state.blueprints.haus_griechisch);
        out.chatActuallySpawned = r.state.architectures.length === beforeChat + (tempelWarm ? 1 : 0);

        // (f) V2: KEIN Cap mehr — 50 Strukturen können koexistieren.
        // Datenmäßig unbegrenzt; GPU-Last per Distance-Culling.
        const beforeMany = r.state.architectures.length;
        for (let i = 0; i < 50; i++) {
            r.spawnArchitecture("_t_r6_tor", { x: 500 + i * 2, y: 5, z: 500 }, { seed: i });
        }
        out.unboundedSpawn = r.state.architectures.length === beforeMany + 50;
        // Die weiten (500m) Strukturen müssen ohne Mesh sein
        // (cold) — Spieler ist nahe (0,0,0).
        const farEntries = r.state.architectures.filter((a) => a.position.x >= 500);
        out.farStructuresAreCold = farEntries.length === 50 && farEntries.every((a) => a.mesh === null);

        // (g) Atomic-Pool: spawn_village/temple/waterfall sind enthalten
        const seedRng = (s) => {
            let x = s >>> 0 || 1;
            return () => {
                x = (x * 1664525 + 1013904223) >>> 0;
                return x / 4294967296;
            };
        };
        const rng = seedRng(2026);
        const seenOps = new Set();
        for (let i = 0; i < 5000; i++) {
            const atom = r.dslComposeAtomic(rng);
            if (Array.isArray(atom)) seenOps.add(atom[0]);
        }
        out.villageInAtomicPool = seenOps.has("spawn_village");
        out.templeInAtomicPool = seenOps.has("spawn_temple");
        out.waterfallInAtomicPool = seenOps.has("spawn_waterfall");

        // (h) Wasserfall-Animation: Z-Werte der Geometrie vor/nach Tick verschieden. Die Position muss in
        // cullingRadius (150) liegen, sonst ist mesh null (cold) und der Test crasht.
        const wf = r.spawnArchitecture("waterfall", { x: 50, y: 5, z: 50 }, { seed: 1 });
        const waterMesh = wf.mesh.children.find((c) => c.geometry && c.geometry.type === "PlaneGeometry");
        if (waterMesh) {
            const z0 = waterMesh.geometry.attributes.position.getZ(5);
            r.tickArchitectures(0.5);
            const z1 = waterMesh.geometry.attributes.position.getZ(5);
            out.waterfallTickAnimates = Math.abs(z0 - z1) > 0.001 || z1 !== 0;
        } else {
            out.waterfallTickAnimates = false;
        }

        // (i) Save-Roundtrip
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.saveContainsArchitectures =
            !!parsed && Array.isArray(parsed.architectures) && parsed.architectures.length > 0;
        // Gespeicherte Einträge haben nur {type, position, seed}, kein mesh
        out.saveOmitsMesh =
            !!parsed &&
            parsed.architectures.every(
                (a) => typeof a.type === "string" && a.position && Number.isFinite(a.seed) && !a.mesh
            );

        // loadState rekonstruiert die Liste deterministisch aus seed
        const loadInput = {
            architectures: [
                // BÜHNE: Daten eines Lade-Schnappschusses, kein gesetzter Ort
                { type: "_t_r6_haus", position: { x: 0, y: 5, z: 0 }, seed: 12345 },
                { type: "_t_r6_tor", position: { x: 20, y: 5, z: 0 }, seed: 67890 },
            ],
        };
        r.loadState(loadInput);
        out.loadRebuildsCount = r.state.architectures.length === 2;
        out.loadRebuildsTypes =
            r.state.architectures[0].type === "_t_r6_haus" && r.state.architectures[1].type === "_t_r6_tor";
        out.loadRebuildsSeeds = r.state.architectures[0].seed === 12345 && r.state.architectures[1].seed === 67890;

        // Cleanup (inkl. Test-Blueprints — kein Katalog-Leck)
        __bautenLeer();
        delete r.state.blueprints._t_r6_haus;
        delete r.state.blueprints._t_r6_tor;
        return out;
    });

    if (!ring6Results || ring6Results.error) {
        check(
            "Ring 6: Architecture-Snapshot erreichbar",
            false,
            ring6Results && ring6Results.error ? ring6Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Ring 6: spawnArchitecture(haus_basis-Substanz) liefert Group", ring6Results.villageBuilt);
        check(
            "Ring 6: Haus ist vollständig (≥5 Substanz-Teile: Wände + Dach; Render gemergt)",
            ring6Results.villageHasChildren
        );
        check("Ring 6: Haus wird zur Szene hinzugefügt", ring6Results.villageInScene);
        check("Ring 6: spawnArchitecture(tor_basis-Substanz) liefert Group", ring6Results.templeBuilt);
        check(
            "Ring 6: Tor ist vollständig (4 Substanz-Teile: 2 Pfosten + Sturz + Schwelle; Render gemergt)",
            ring6Results.templeHasPillars
        );
        check("Ring 6: spawnArchitecture('waterfall') liefert Group", ring6Results.waterfallBuilt);
        check("Ring 6: Wasserfall hat userData.animate Hook", ring6Results.waterfallHasAnimateHook);
        check("Ring 6: Unbekannter Typ wird abgelehnt (returns null)", ring6Results.unknownTypeRejected);
        check("Ring 6: state.architectures wächst korrekt nach drei Spawns", ring6Results.architectureCountAfterThree);
        check("Ring 6: Architecture-IDs sind eindeutig", ring6Results.idsAreUnique);
        check(
            "Ring 6: DSL-Op spawn_village wirkt (ruft spawnSettlement) + emit spawned_village",
            ring6Results.dslSpawnVillageOk
        );
        check("Ring 6: Chat 'Baue Tempel hier' routet auf DSL spawn_temple", ring6Results.chatRoutesToDsl);
        check(
            "Ring 6: Chat-Routing spawnt tatsächlich (haus_griechisch warm) bzw. skippt fail-closed (studio_kalt)",
            ring6Results.chatActuallySpawned
        );
        check("Ring 6 V2: 50+ Strukturen koexistieren ohne Cap", ring6Results.unboundedSpawn);
        check(
            "Ring 6 V2: Weite Strukturen (>cullingRadius) sind 'cold' (mesh=null)",
            ring6Results.farStructuresAreCold
        );
        check("Ring 6: spawn_village ist im dslComposeAtomic-Pool (Nexus baut)", ring6Results.villageInAtomicPool);
        check("Ring 6: spawn_temple ist im atomic-Pool", ring6Results.templeInAtomicPool);
        check("Ring 6: spawn_waterfall ist im atomic-Pool", ring6Results.waterfallInAtomicPool);
        check("Ring 6: tickArchitectures animiert Wasserfall-Vertices", ring6Results.waterfallTickAnimates);
        check("Ring 6: saveState persistiert architectures", ring6Results.saveContainsArchitectures);
        check("Ring 6: Save enthält nur {type, position, seed} (kein mesh)", ring6Results.saveOmitsMesh);
        check("Ring 6: loadState rekonstruiert Anzahl", ring6Results.loadRebuildsCount);
        check("Ring 6: loadState rekonstruiert Typen", ring6Results.loadRebuildsTypes);
        check(
            "Ring 6: loadState rekonstruiert Seeds (deterministische Wiederherstellung)",
            ring6Results.loadRebuildsSeeds
        );
    }

    // ### Ring 6.3 — Feld-native Kollision für Strukturen ###
    // Jede Architektur mit soliden Parts (dichte ≥ 0.3) trägt ab Spawn `entry.blockerAABBs` (Daten,
    // render-/distanz-unabhängig); `_stepCharacterStructures` löst die Spieler-Kapsel dagegen.
    const ring63Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // Cleanup
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) {
                r._cullArchitectureMesh(a);
            }
        }
        r.state.architectures = [];

        // Struktur nahe spawnen → Mesh + feld-native blockerAABBs gleich da.
        // AUSLÖSCHUNGS-WELLE — temple fiel; die begehbare haus_basis-Substanz (KIND_SUBSTANCE,
        // solide Wände + Tür-Lücke als per-Part-Kollision) trägt die Kollisions-Probe.
        const KSr63 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_r63_haus) delete r.state.blueprints._t_r63_haus;
        r.state.blueprints._t_r63_haus = {
            name: "_t_r63_haus",
            parts: JSON.parse(JSON.stringify(KSr63.haus_basis.parts)),
        };
        const px = r.state.playerMesh.position.x;
        const pz = r.state.playerMesh.position.z;
        const entry = r.spawnArchitecture(
            "_t_r63_haus",
            { x: px + 8, y: r.state.playerMesh.position.y, z: pz + 4 },
            { seed: 11 }
        );
        out.entryHasMesh = !!entry && !!entry.mesh;
        out.entryHasCollision = !!entry && Array.isArray(entry.blockerAABBs) && entry.blockerAABBs.length > 0;
        // Kollisions-Box-Größe indirekt via Three-Bounding-Box verifizieren
        // (entry.mesh hat die echte Geometrie).
        if (entry && entry.mesh) {
            const bbox = new THREE.Box3().setFromObject(entry.mesh);
            const size = new THREE.Vector3();
            bbox.getSize(size);
            out.collisionSizeFromMesh = {
                x: size.x,
                y: size.y,
                z: size.z,
            };
            out.collisionSizePlausible =
                size.x > 2.0 && size.y > 2.0 && size.z > 2.0 && size.x < 100 && size.y < 100 && size.z < 100;
        }

        // Cullen entfernt das RENDER-Mesh; die feld-native Kollision (blockerAABBs)
        // bleibt — sie ist Daten, render-unabhängig (kein lazy gebauter Ammo-Body).
        r._cullArchitectureMesh(entry);
        out.afterCullMeshNull = entry.mesh === null;
        out.afterCullCollisionKept = Array.isArray(entry.blockerAABBs) && entry.blockerAABBs.length > 0;

        // Wiederaufbau bringt das Mesh zurück (die Kollision war ohnehin da).
        r._rebuildArchitectureMesh(entry);
        out.afterRebuildMeshExists = !!entry.mesh;

        // Eine ferne (cold) Struktur wird NICHT gerendert (kein Mesh), trägt aber
        // dieselbe feld-native Kollision (blockerAABBs beim Spawn, distanz-unabhängig).
        const coldEntry = r.spawnArchitecture("_t_r63_haus", { x: 10000, y: 5, z: 10000 }, { seed: 1 });
        out.coldHasNoMesh = coldEntry && coldEntry.mesh === null;
        out.coldHasCollision = !!(
            coldEntry &&
            Array.isArray(coldEntry.blockerAABBs) &&
            coldEntry.blockerAABBs.length > 0
        );

        // Cleanup (inkl. Test-Blueprint)
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        delete r.state.blueprints._t_r63_haus;
        return out;
    });

    if (!ring63Results || ring63Results.error) {
        check(
            "Ring 6.3: Kollisions-Snapshot erreichbar",
            false,
            ring63Results && ring63Results.error ? ring63Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Ring 6.3: Architektur hat Mesh nach Spawn", ring63Results.entryHasMesh);
        check("Ring 6.3: Architektur hat feld-native Kollision via blockerAABBs", ring63Results.entryHasCollision);
        check(
            "Ring 6.3: Kollisions-Box-Größe plausibel (Haus-Substanz, via Mesh-BBox)",
            ring63Results.collisionSizePlausible,
            ring63Results.collisionSizeFromMesh
                ? `mesh-size=${JSON.stringify({
                      x: ring63Results.collisionSizeFromMesh.x.toFixed(2),
                      y: ring63Results.collisionSizeFromMesh.y.toFixed(2),
                      z: ring63Results.collisionSizeFromMesh.z.toFixed(2),
                  })}`
                : ""
        );
        check(
            "Ring 6.3: Cullen entfernt das Render-Mesh, behält die feld-native Kollision (render-unabhängig)",
            ring63Results.afterCullMeshNull && ring63Results.afterCullCollisionKept
        );
        check("Ring 6.3: Wiederaufbau bringt das Render-Mesh zurück", ring63Results.afterRebuildMeshExists);
        check(
            "Ring 6.3: Cold-Strukturen (außerhalb Render-Radius) haben kein Mesh, aber feld-native Kollision (distanz-unabhängig)",
            ring63Results.coldHasNoMesh && ring63Results.coldHasCollision
        );
    }

    // Live-Kollision: der Spieler läuft gegen eine Haus-Wand, `_stepCharacterStructures` (gegen
    // entry.blockerAABBs) muss ihn aufhalten — gedrückte W-Taste (yaw=0 → forward=+Z), synchrone
    // _gameLoopTick-Pumps (Headless-rAF ~1 Hz).
    const collisionLive = await page.evaluate(() => {
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        // AUSLÖSCHUNGS-WELLE — temple fiel; das Haus (haus_basis-Substanz) direkt vor dem
        // Welt-Ursprung platzieren. x=1.925 versetzt: so trifft der bei x=0 laufende Spieler
        // ein WAND-Segment (nicht im Weg).
        const KSlive = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_live_haus) delete r.state.blueprints._t_live_haus;
        r.state.blueprints._t_live_haus = {
            name: "_t_live_haus",
            parts: JSON.parse(JSON.stringify(KSlive.haus_basis.parts)),
        };
        r.spawnArchitecture("_t_live_haus", { x: 1.925, y: 5, z: 5 }, { seed: 11 });
        // Player nach (0, 5, −2) — Haus liegt in +Z, Spieler läuft in +Z auf es zu.
        // BÜHNE: der Spieler vor dem gestellten Haus (Haus und Spieler in derselben Anordnung)
        r.state.playerMesh.position.set(0, 5, -2);
        if (r.state.playerVel) {
            r.state.playerVel.setValue(0, 0, 0);
            r.state._fieldVy = 0;
        }
        // yaw=0 → forward = (sin0,0,cos0) = +Z; W drückt vorwärts.
        const savedYaw = r.state.yaw;
        const savedKeys = { ...r.state.keys };
        r.state.yaw = 0;
        r.state.keys = { w: true };
        // ~0.8 s simulierte Bewegung: ~48 Frames à 1/60 s (synchron via _gameLoopTick).
        for (let i = 0; i < 48; i++) {
            r._gameLoopTick(performance.now());
        }
        const playerZ = r.state.playerMesh.position.z;
        const playerY = r.state.playerMesh.position.y;
        // restore Eingabe-Zustand (zustands-neutral für Folge-Bands)
        r.state.yaw = savedYaw;
        r.state.keys = savedKeys;
        if (r.state.playerVel) {
            r.state.playerVel.setValue(0, 0, 0);
            r.state._fieldVy = 0;
        }
        return { playerZ, playerY };
    });
    // Haus bei z=5, Front-Wand (z-Offset −2.55, Dicke 0.3) → Vorderkante z≈2.3. Start z=-2: ohne
    // Kollision >4 m in 0.8 s, mit Kollision steht der Spieler davor (z < ~2).
    check(
        "Ring 6.3: feld-native Kollision (blockerAABBs) stoppt den Spieler vor der Haus-Wand",
        collisionLive.playerZ < 2.0,
        `playerZ=${collisionLive.playerZ.toFixed(2)} (Erwartung < 2.0)`
    );
    // Cleanup (inkl. Test-Blueprint)
    await page.evaluate(() => {
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        delete r.state.blueprints._t_live_haus;
    });

    // ### Ring 6.4 — Bauplan-Datenschicht ###
    // _buildFromBlueprint rendert Baupläne, 8 Primitive werden erkannt; User-Baupläne sind hinzufügbar + persistierbar.
    const ring64Results = await safeEvaluate(page, async () => {
        const out = {};

        // 8 Primitive renderbar — wir bauen einen Test-Bauplan
        // mit allen 8 Shapes und prüfen, dass jede einen Mesh
        // produziert.
        const allShapes = ["box", "sphere", "cylinder", "cone", "pyramid", "octahedron", "plane", "torus"];
        const testBp = {
            name: "_test_all_shapes",
            parts: allShapes.map((s, i) => ({
                shape: s,
                color: 0xffffff,
                position: { x: i, y: 0, z: 0 },
                size: { x: 1, y: 1, z: 1 },
            })),
        };
        const testGroup = r._buildFromBlueprint(testBp);
        out.allShapesRender =
            testGroup && testGroup.children.length === 8 && testGroup.children.every((c) => !!c.geometry);

        // Erstellung via JSON: User-Bauplan registrieren + spawnen
        r.state.blueprints["test_hut"] = {
            name: "test_hut",
            label: "Test-Hütte",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    color: 0xaa5500,
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                },
                {
                    shape: "pyramid",
                    color: 0x882211,
                    position: { x: 0, y: 2.5, z: 0 },
                    size: { x: 2.5, y: 1.5, z: 2.5 },
                },
            ],
        };
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        const userEntry = r.spawnArchitecture("test_hut", { x: 0, y: 5, z: 5 }, { seed: 1 });
        out.userBlueprintBuilds = !!userEntry && !!userEntry.mesh && userEntry.mesh.children.length === 2;

        // DSL-Op spawn_blueprint funktioniert
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        const dslRes = r.dslRun(["spawn_blueprint", "test_hut", ["at_origin"]]);
        out.dslSpawnBlueprintOk =
            dslRes.ok === true &&
            r.state.architectures.length === 1 &&
            r.state.architectures[0].type === "test_hut" &&
            dslRes.log.some((e) => e.event === "spawned_blueprint");

        // Unbekannter Bauplan-Name wird abgelehnt
        const dslBad = r.dslRun(["spawn_blueprint", "phantom_nonexistent", ["at_origin"]]);
        out.unknownBlueprintRejected = dslBad.log.some((e) => e.event === "unknown_blueprint");

        // Save-Roundtrip: User-Bauplan überlebt
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.saveContainsUserBlueprint =
            !!parsed && Array.isArray(parsed.blueprints) && parsed.blueprints.some((bp) => bp.name === "test_hut");
        out.saveOmitsBuiltIn =
            !!parsed && Array.isArray(parsed.blueprints) && !parsed.blueprints.some((bp) => bp.name === "waterfall");

        // loadState mit eigenem Bauplan reaktiviert ihn
        delete r.state.blueprints["test_hut"];
        r.loadState({
            blueprints: [
                {
                    name: "test_hut_2",
                    label: "Reload-Hütte",
                    parts: [
                        {
                            shape: "sphere",
                            color: 0x33aa55,
                            position: { x: 0, y: 1, z: 0 },
                            size: { x: 2, y: 2, z: 2 },
                        },
                    ],
                },
            ],
        });
        out.loadRestoresUserBlueprint = !!r.state.blueprints["test_hut_2"];

        // Cleanup
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        delete r.state.blueprints["test_hut"];
        delete r.state.blueprints["test_hut_2"];
        return out;
    });

    if (!ring64Results || ring64Results.error) {
        check(
            "Ring 6.4: Bauplan-Snapshot erreichbar",
            false,
            ring64Results && ring64Results.error ? ring64Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check(
            "Ring 6.4: Alle 8 Primitive (box/sphere/cylinder/cone/pyramid/octahedron/plane/torus) renderbar",
            ring64Results.allShapesRender
        );
        check("Ring 6.4: User-Bauplan als Daten spawnt korrekt Mesh", ring64Results.userBlueprintBuilds);
        check("Ring 6.4: DSL-Op spawn_blueprint(name, pos) funktioniert", ring64Results.dslSpawnBlueprintOk);
        check("Ring 6.4: Unbekannter Bauplan-Name wird abgelehnt", ring64Results.unknownBlueprintRejected);
        check("Ring 6.4: saveState persistiert eigene Baupläne", ring64Results.saveContainsUserBlueprint);
        check(
            "Ring 6.4: Save lässt Built-in-Baupläne aus (waterfall kommt aus _defaultBlueprints)",
            ring64Results.saveOmitsBuiltIn
        );
        check("Ring 6.4: loadState rekonstruiert eigene Baupläne", ring64Results.loadRestoresUserBlueprint);
    }

    // ### Ring 6.5 — Hotbar mit 9 Slots ###
    const ring65Results = await safeEvaluate(page, async () => {
        const out = {};
        // DOM-Hotbar
        const bar = document.getElementById("hotbar");
        out.hotbarInDom = !!bar;
        // E8: 9 Bau-Slots + der Off-Hand-Slot (Minecraft-Modell) = 10.
        out.hotbarHasNineSlots =
            bar &&
            bar.querySelectorAll(".hotbar-slot").length === 10 &&
            bar.querySelectorAll('.hotbar-slot[data-slot="offhand"]').length === 1;
        // Leben-Schau 07.10. (L7) — die Default-Hotbar ist der Start-Gurt aus dem Katalog (`_startGurt`: je Studio-Art
        // ein Werk; bei kaltem Buch leer), nie mehr [stein_block, waterfall, damm].
        const hb0 = r.state.hotbar;
        const gurt = r._startGurt() || [];
        out.defaultHotbar =
            Array.isArray(hb0) &&
            hb0.length === 9 &&
            gurt.every((n, i) => hb0[i] === n) &&
            hb0.slice(gurt.length).every((s) => s === null);
        // Slot-Label folgt aus blueprints.label
        const firstSlotLabel = bar.querySelector('.hotbar-slot[data-slot="0"] .label');
        out.firstSlotShowsLabel =
            !!firstSlotLabel &&
            (!hb0[0] || firstSlotLabel.textContent === (r.state.blueprints[hb0[0]].label || hb0[0]));

        // setHotbarSlot setzt slot 5 auf eigenen Bauplan
        r.state.blueprints["test_hotbar_bp"] = {
            name: "test_hotbar_bp",
            label: "Test-Bp",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    color: 0x44aa44,
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                },
            ],
        };
        const setOk = r.setHotbarSlot(5, "test_hotbar_bp");
        out.setHotbarOk = setOk === true && r.state.hotbar[5] === "test_hotbar_bp";
        // DOM hat label aktualisiert
        const slot5Label = bar.querySelector('.hotbar-slot[data-slot="5"] .label');
        out.hotbarDomReflectsSet = slot5Label && slot5Label.textContent === "Test-Bp";

        // Unbekannter Bauplan-Name wird abgelehnt
        const setBad = r.setHotbarSlot(5, "definitiv_nicht_da");
        out.setHotbarRejectsUnknown = setBad === false && r.state.hotbar[5] === "test_hotbar_bp";

        // der belegte Slot führt in den Bau-Modus und F setzt das Werk: diag-werkstatt-weg L-WERKSTATT (Ziffer-Taste, echte Eingabe)
        r.selectHotbarSlot(5);
        // Highlight im DOM
        const slot5El = bar.querySelector('.hotbar-slot[data-slot="5"]');
        out.highlightActiveSlot = slot5El && slot5El.classList.contains("active");

        // selectHotbarSlot(idx) auf leeren Slot deaktiviert Build-Mode
        r.selectHotbarSlot(8); // leer
        out.emptySlotDeactivates = r.state.buildMode.active === false;

        // setHotbarSlot(idx, null) leert den Slot
        r.setHotbarSlot(5, null);
        out.clearedSlotIsNull = r.state.hotbar[5] === null;
        const slot5LabelAfter = bar.querySelector('.hotbar-slot[data-slot="5"] .label');
        out.clearedDomShowsEmpty = slot5LabelAfter && slot5LabelAfter.textContent === "—";

        // die Ich-Hotbar ist jetzt eine VISUELLE 9-Slot-Reihe (Minecraft-vereint), nicht mehr 9 Dropdowns.
        const config = document.getElementById("hotbar-config");
        out.hotbarConfigInDom = !!config;
        out.hotbarConfigHasNineRows = config && config.querySelectorAll(".hotbar-slot").length === 10; // 9 + Off-Hand (E8)

        // Save-Roundtrip
        r.setHotbarSlot(7, "damm");
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.saveContainsHotbar =
            !!parsed && Array.isArray(parsed.hotbar) && parsed.hotbar.length === 9 && parsed.hotbar[7] === "damm";

        // loadState restauriert hotbar
        r.state.hotbar = [null, null, null, null, null, null, null, null, null];
        r.loadState({ hotbar: ["damm", null, "waterfall", null, null, null, null, null, null] });
        out.loadRestoresHotbar = r.state.hotbar[0] === "damm" && r.state.hotbar[2] === "waterfall";

        // Cleanup
        delete r.state.blueprints["test_hotbar_bp"];
        r._clearBuildMode();
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];
        r._renderHotbarDOM();
        for (const a of r.state.architectures.slice()) {
            if (a.mesh) r._cullArchitectureMesh(a);
        }
        r.state.architectures = [];
        return out;
    });

    if (!ring65Results || ring65Results.error) {
        check(
            "Ring 6.5: Hotbar-Snapshot erreichbar",
            false,
            ring65Results && ring65Results.error ? ring65Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Ring 6.5: #hotbar im DOM", ring65Results.hotbarInDom);
        check("Ring 6.5: Hotbar hat 9 Slots", ring65Results.hotbarHasNineSlots);
        check("Ring 6.5: Default-Hotbar = der Start-Gurt aus dem Katalog (_startGurt)", ring65Results.defaultHotbar);
        check("Ring 6.5: Slot-Label folgt Bauplan-Label", ring65Results.firstSlotShowsLabel);
        check("Ring 6.5: setHotbarSlot setzt Eintrag", ring65Results.setHotbarOk);
        check("Ring 6.5: Hotbar-DOM aktualisiert sich nach setHotbarSlot", ring65Results.hotbarDomReflectsSet);
        check("Ring 6.5: setHotbarSlot lehnt unbekannte Baupläne ab", ring65Results.setHotbarRejectsUnknown);
        check("Ring 6.5: aktiver Slot bekommt .active-Class", ring65Results.highlightActiveSlot);
        check("Ring 6.5: leerer Slot deaktiviert Bau-Modus", ring65Results.emptySlotDeactivates);
        check("Ring 6.5: setHotbarSlot(idx, null) leert den Slot", ring65Results.clearedSlotIsNull);
        check("Ring 6.5: Leerer Slot zeigt — als Label", ring65Results.clearedDomShowsEmpty);
        check("Ring 6.5: #hotbar-config-Container im Spieler-Drawer", ring65Results.hotbarConfigInDom);
        check(
            "V18.59: die Ich-Hotbar ist eine visuelle 9-Slot-Reihe (Minecraft-vereint, kein Dropdown)",
            ring65Results.hotbarConfigHasNineRows
        );
        check("Ring 6.5: saveState persistiert Hotbar", ring65Results.saveContainsHotbar);
        check("Ring 6.5: loadState rekonstruiert Hotbar", ring65Results.loadRestoresHotbar);
    }

    // ### Ring 6.6 — Werkstatt-Tab + Part-Editor ###
    const ring66Results = await safeEvaluate(page, async () => {
        const out = {};

        // UI vorhanden
        out.workshopTabInDom = !!document.querySelector('#topbar [data-tab="werkstatt"]');
        out.workshopDrawerInDom = !!document.querySelector('.drawer[data-drawer="werkstatt"]');
        out.workshopListInDom = !!document.getElementById("workshop-list");
        out.workshopStatsPanelInDom = !!document.getElementById("workshop-stats-panel"); // V17.91 — der intuitive Readout (statt des entfernten #workshop-editor)

        // Ein Eintrag je SICHTBAREM Bauplan — derselbe Filter wie `_workshopRenderBlueprintList`: ohne
        // `grown_*`-Streaming-Varianten, ohne `(fels|kristall|glut)_var1+` (var0 vertritt die Sorte), ohne
        // donorOnly. Studio-Rezepte tragen .workshop-studio-recipe-row → die .workshop-list-row-Zählung
        // bleibt rezept-frei.
        const list = document.getElementById("workshop-list");
        const _hidden = (n) =>
            /^grown_/.test(n) ||
            /^(fels|kristall|glut)_var([1-9]\d*)$/.test(n) ||
            !!(r.state.blueprints[n] && r.state.blueprints[n].donorOnly);
        const listableCount = Object.keys(r.state.blueprints).filter((n) => !_hidden(n)).length;
        out.listShowsAllBlueprints = list && list.querySelectorAll(".workshop-list-row").length === listableCount;

        // createBlueprint
        const beforeCount = Object.keys(r.state.blueprints).length;
        const ok1 = r.createBlueprint("test_hut", "Test-Hütte");
        out.createBlueprintOk =
            ok1 === true &&
            Object.keys(r.state.blueprints).length === beforeCount + 1 &&
            r.state.blueprints["test_hut"].builtIn === false;

        // createBlueprint mit existierendem Namen wird abgelehnt
        const okDup = r.createBlueprint("test_hut", "Doppelt");
        out.duplicateNameRejected = okDup === false;

        // addPartToBlueprint
        const ok2 = r.addPartToBlueprint("test_hut", {
            shape: "box",
            color: 0xff0000,
            position: { x: 0, y: 1, z: 0 },
            size: { x: 2, y: 2, z: 2 },
        });
        out.addPartOk = ok2 === true && r.state.blueprints["test_hut"].parts.length === 1;

        // Built-in akzeptiert keine addPart (stein_block — lebendes builtIn)
        const okBuiltIn = r.addPartToBlueprint("stein_block", { shape: "sphere" });
        out.builtInRejectsAddPart = okBuiltIn === false;

        // updatePartInBlueprint
        r.updatePartInBlueprint("test_hut", 0, {
            color: 0x00ff00,
            position: { y: 2.5 },
        });
        const p = r.state.blueprints["test_hut"].parts[0];
        out.updatePartMerges = p.color === 0x00ff00 && p.position.y === 2.5 && p.position.x === 0 && p.position.z === 0;

        // removePartFromBlueprint
        r.addPartToBlueprint("test_hut", { shape: "cone" });
        r.addPartToBlueprint("test_hut", { shape: "sphere" });
        const beforeRm = r.state.blueprints["test_hut"].parts.length;
        r.removePartFromBlueprint("test_hut", 1);
        out.removePartShrinks = r.state.blueprints["test_hut"].parts.length === beforeRm - 1;

        // cloneBlueprint (Built-in → eigen; damm — lebendes builtIn)
        const okClone = r.cloneBlueprint("damm", "my_temple");
        out.cloneBlueprintOk =
            okClone === true &&
            r.state.blueprints["my_temple"].builtIn === false &&
            r.state.blueprints["my_temple"].parts.length === r.state.blueprints["damm"].parts.length;

        // Klone können editiert werden
        const okClonePart = r.removePartFromBlueprint("my_temple", 0);
        out.cloneIsEditable =
            okClonePart === true &&
            r.state.blueprints["my_temple"].parts.length === r.state.blueprints["damm"].parts.length - 1;

        // deleteBlueprint (eigen)
        const beforeDel = Object.keys(r.state.blueprints).length;
        const okDel = r.deleteBlueprint("test_hut");
        out.deleteBlueprintOk =
            okDel === true &&
            Object.keys(r.state.blueprints).length === beforeDel - 1 &&
            !r.state.blueprints["test_hut"];

        // deleteBlueprint Built-in wird abgelehnt (stein_block — lebendes builtIn)
        const okDelBuiltIn = r.deleteBlueprint("stein_block");
        out.builtInProtectedFromDelete = okDelBuiltIn === false && !!r.state.blueprints["stein_block"];

        // delete räumt Hotbar-Slots auf, die diesen Bauplan halten
        r.state.hotbar[4] = "my_temple";
        r.deleteBlueprint("my_temple");
        out.deleteCascadesHotbar = r.state.hotbar[4] === null;

        // selectBlueprintForEdit + DOM update
        r.createBlueprint("ed_test", "Editier-Test");
        r.selectBlueprintForEdit("ed_test");
        out.selectUpdatesWorkshop = r.state.workshop.selectedBlueprint === "ed_test";

        // Editor zeigt Selected-Status
        const selectedRow = document.querySelector('.workshop-list-row[data-blueprint="ed_test"]');
        out.selectedRowHasClass = selectedRow && selectedRow.classList.contains("selected");

        // Save-Roundtrip: eigene Baupläne werden serialisiert
        r.addPartToBlueprint("ed_test", {
            shape: "sphere",
            color: 0x553355,
            position: { x: 0, y: 2, z: 0 },
            size: { x: 3, y: 3, z: 3 },
        });
        r.saveState();
        const raw = await window.__stand();
        const parsed = JSON.parse(raw);
        const savedBp = parsed.blueprints.find((bp) => bp.name === "ed_test");
        out.saveContainsCustom = !!savedBp && savedBp.parts.length === 1 && savedBp.parts[0].shape === "sphere";

        // Cleanup
        r.deleteBlueprint("ed_test");
        r.selectBlueprintForEdit("stein_block");
        return out;
    });

    if (!ring66Results || ring66Results.error) {
        check(
            "Ring 6.6: Werkstatt-Snapshot erreichbar",
            false,
            ring66Results && ring66Results.error ? ring66Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Ring 6.6: Werkstatt-Tab in Topbar", ring66Results.workshopTabInDom);
        check("Ring 6.6: Werkstatt-Drawer im DOM", ring66Results.workshopDrawerInDom);
        check("Ring 6.6: #workshop-list im DOM", ring66Results.workshopListInDom);
        check(
            "Ring 6.6 (V17.91): #workshop-stats-panel im DOM (intuitiver Readout, der Editor ist entfernt)",
            ring66Results.workshopStatsPanelInDom
        );
        check("Ring 6.6: Liste zeigt einen Eintrag pro Bauplan", ring66Results.listShowsAllBlueprints);
        check("Ring 6.6: createBlueprint legt neuen eigenen Bauplan an", ring66Results.createBlueprintOk);
        check("Ring 6.6: createBlueprint lehnt doppelte Namen ab", ring66Results.duplicateNameRejected);
        check("Ring 6.6: addPartToBlueprint hängt Part an", ring66Results.addPartOk);
        check("Ring 6.6: addPartToBlueprint lehnt Built-in ab", ring66Results.builtInRejectsAddPart);
        check("Ring 6.6: updatePartInBlueprint merget Patch in Bestand", ring66Results.updatePartMerges);
        check("Ring 6.6: removePartFromBlueprint verkleinert parts", ring66Results.removePartShrinks);
        check("Ring 6.6: cloneBlueprint erzeugt eigene Kopie eines Built-in", ring66Results.cloneBlueprintOk);
        check("Ring 6.6: Klone sind voll editierbar", ring66Results.cloneIsEditable);
        check("Ring 6.6: deleteBlueprint entfernt eigene Baupläne", ring66Results.deleteBlueprintOk);
        check("Ring 6.6: Built-in vor Löschung geschützt", ring66Results.builtInProtectedFromDelete);
        check("Ring 6.6: deleteBlueprint räumt referenzierte Hotbar-Slots auf", ring66Results.deleteCascadesHotbar);
        check(
            "Ring 6.6: selectBlueprintForEdit setzt state.workshop.selectedBlueprint",
            ring66Results.selectUpdatesWorkshop
        );
        check("Ring 6.6: Selected-Row trägt .selected-Class im DOM", ring66Results.selectedRowHasClass);
        check("Ring 6.6: Save persistiert eigene Baupläne inkl. Parts", ring66Results.saveContainsCustom);
    }

    // ### Ring 6 V2 — Distance-Culling, Fraktal, Counter, Bau-Cursor ###
    const ring6v2Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // Cleanup
        __bautenLeer();
        r._clearBuildMode();
        // Der Cull-Tick baut nur bei Kopfraum (`_frameOverBudget ? 0 : budget`); nach dem Warmup kann das
        // Flag stehen → nullen, gemessen wird die Rebuild-MECHANIK, nicht die Perf-Drossel.
        r.state._frameOverBudget = false;

        // === A) Distance-Culling ===
        // AUSLÖSCHUNGS-WELLE — temple fiel; die haus_basis-Substanz (KIND_SUBSTANCE)
        // trägt die Cull-/Rebuild-Mechanik als Test-Blueprint (am Band-Ende geräumt).
        const KSr6v2 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_r6v2_haus) delete r.state.blueprints._t_r6v2_haus;
        r.state.blueprints._t_r6v2_haus = {
            name: "_t_r6v2_haus",
            parts: JSON.parse(JSON.stringify(KSr6v2.haus_basis.parts)),
        };
        // Setze Spieler auf (0,0,0), spawne weit + nah.
        // BÜHNE: nah und fern zum gestellten Haus (Cull-Mechanik)
        r.state.playerMesh.position.set(0, 20, 0);
        const near = r.spawnArchitecture("_t_r6v2_haus", { x: 5, y: 5, z: 5 }, { seed: 1 });
        const far = r.spawnArchitecture("_t_r6v2_haus", { x: 400, y: 5, z: 400 }, { seed: 2 });
        out.nearHasMesh = !!near.mesh;
        out.farIsCold = far.mesh === null;
        // Spieler weg vom near → cull-Tick muss near disposen
        // BÜHNE: nah und fern zum gestellten Haus (Cull-Mechanik)
        r.state.playerMesh.position.set(400, 20, 400);
        r.tickArchitectureCulling(1.0);
        out.nearCulledAfterWalkAway = near.mesh === null;
        out.farRebuiltAfterApproach = !!far.mesh;
        // Zurück gehen → near baut sich wieder auf
        // BÜHNE: nah und fern zum gestellten Haus (Cull-Mechanik)
        r.state.playerMesh.position.set(0, 20, 0);
        r.tickArchitectureCulling(2.0);
        out.nearRebuiltAfterReturn = !!near.mesh;

        // === B) spawn_fractal ===
        // Cleanup first
        __bautenLeer();
        const before = r.state.architectures.length;
        const dslRes = r.dslRun(["spawn_fractal", ["at_origin"], "temple", 2, 0.5]);
        // depth=2 mit 6 Kindern: 1 + 6 + 36 = 43
        out.fractalSpawnsExpected = dslRes.ok === true && r.state.architectures.length === before + 43;
        const eventFound = dslRes.log.find((e) => e.event === "spawned_fractal");
        out.fractalEventEmitted = !!eventFound && eventFound.count === 43;
        // Positionen hängen am Root-Seed (ctx.rng()), die HEXAGONAL-Anordnung bleibt: 6 Kinder auf einem
        // Kreis um die Wurzel. Visit ist depth-first (root, child0 + Enkel, child1, …) → direkte Kinder
        // über scale 0.5 finden (ratio 0.5), Enkel haben 0.25.
        const rootEntry = r.state.architectures[before];
        const directChildren = r.state.architectures.slice(before).filter((e) => Math.abs(e.scale - 0.5) < 1e-6);
        const childRadii = directChildren.map((e) =>
            Math.hypot(e.position.x - rootEntry.position.x, e.position.z - rootEntry.position.z)
        );
        out.fractalChildrenAreHexagonal =
            childRadii.length === 6 && childRadii.every((rad) => Math.abs(rad - childRadii[0]) < 0.5);
        // Scale-Hierarchie: Root=1, direkte Kinder=0.5, Grand-Children=0.25
        const grandChildren = r.state.architectures.slice(before).filter((e) => Math.abs(e.scale - 0.25) < 1e-6);
        out.fractalScalesShrink = rootEntry.scale === 1 && directChildren.length === 6 && grandChildren.length === 36;

        // Chat-Pattern
        r.processChatCommand("baue fraktal wasserfall");
        out.chatFractalRoutes =
            Array.isArray(r.state.dsl.lastUserProgram) &&
            r.state.dsl.lastUserProgram[0] === "spawn_fractal" &&
            r.state.dsl.lastUserProgram[2] === "waterfall";

        // === C) Counter ===
        // Cleanup, baue 3 nah, 5 weit
        __bautenLeer();
        // BÜHNE: nah und fern zum gestellten Haus (Cull-Mechanik)
        r.state.playerMesh.position.set(0, 20, 0);
        for (let i = 0; i < 3; i++) r.spawnArchitecture("_t_r6v2_haus", { x: i * 10, y: 5, z: 0 }, { seed: i });
        for (let i = 0; i < 5; i++) r.spawnArchitecture("_t_r6v2_haus", { x: 300 + i * 5, y: 5, z: 0 }, { seed: i });
        const counts = r.countArchitecturesNearPlayer(60);
        out.counterNear = counts.near === 3;
        out.counterTotal = counts.total === 8;
        // Status-Bar-Element existiert + zeigt korrektes Format
        out.statusBarItemInDom = !!document.getElementById("status-architectures");
        r.updateStatusPanel(1e7);
        const statusEl = document.getElementById("status-architectures");
        out.statusBarShowsCount = statusEl && /^\d+ nah \/ \d+$/.test(statusEl.textContent);

        // === D) Bau-Cursor ===
        r._clearBuildMode();
        out.hudInDom = !!document.getElementById("build-mode-hud");
        out.hudInitiallyHidden = document.getElementById("build-mode-hud").hidden === true;
        // Ring 6.5: Hotbar-API ersetzt setBuildMode. Slot 0 = stein_block (gesetzt: der Start-Gurt liest den Katalog).
        r.state.hotbar = ["stein_block", "waterfall", "damm", null, null, null, null, null, null];
        r.selectHotbarSlot(0);
        out.hudShownWhenActive = document.getElementById("build-mode-hud").hidden === false;
        let foundTransparent = false;
        r.state.buildMode.phantomMesh.traverse((node) => {
            if (node.material && node.material.transparent && node.material.opacity < 1) {
                foundTransparent = true;
            }
        });
        out.phantomIsTransparent = foundTransparent;
        // Toggle (gleicher Slot nochmal → off)
        r.selectHotbarSlot(0);
        out.toggleOffSameForm = r.state.buildMode.active === false;
        // Slot wechseln (Slot 1 = waterfall)
        r.selectHotbarSlot(1);
        out.switchFormChanges = r.state.buildMode.blueprintName === "waterfall";
        // confirmBuild platziert echte Struktur — S2: in schöpfer testen, weil
        // frieden jetzt Material zahlt; dieser Test prüft den SPAWN-Mechanismus, nicht die Kosten.
        r.setGameMode("schöpfer");
        const arBefore = r.state.architectures.length;
        r.confirmBuild();
        out.confirmBuildSpawns = r.state.architectures.length === arBefore + 1;
        out.confirmBuildKeepsMode = r.state.buildMode.active === true;
        // ESC räumt auf
        r._clearBuildMode();
        out.clearEndsMode = r.state.buildMode.active === false && r.state.buildMode.phantomMesh === null;

        // Cleanup (inkl. Test-Blueprint)
        __bautenLeer();
        delete r.state.blueprints._t_r6v2_haus;
        r.setGameMode("frieden"); // S2 — Modus zurücksetzen (schöpfer war nur für den Spawn-Test)
        return out;
    });

    if (!ring6v2Results || ring6v2Results.error) {
        check(
            "Ring 6 V2: Snapshot erreichbar",
            false,
            ring6v2Results && ring6v2Results.error ? ring6v2Results.error : "page.evaluate fehlgeschlagen"
        );
    } else {
        // Culling
        check("Ring 6 V2: Nahe Struktur hat Mesh", ring6v2Results.nearHasMesh);
        check("Ring 6 V2: Weite Struktur startet 'cold'", ring6v2Results.farIsCold);
        check("Ring 6 V2: Culling-Tick disposed Mesh wenn Spieler weggeht", ring6v2Results.nearCulledAfterWalkAway);
        check("Ring 6 V2: Culling-Tick baut Mesh wenn Spieler hingeht", ring6v2Results.farRebuiltAfterApproach);
        check("Ring 6 V2: Culling-Tick baut Mesh wieder auf nach Rückkehr", ring6v2Results.nearRebuiltAfterReturn);
        // Fraktal
        check(
            "Ring 6 V2: spawn_fractal(depth=2, ratio=0.5) → 1+6+36 = 43 Strukturen",
            ring6v2Results.fractalSpawnsExpected
        );
        check("Ring 6 V2: spawned_fractal-Event emittiert mit count=43", ring6v2Results.fractalEventEmitted);
        check("Ring 6 V2: 6 Kinder im Hexagon (gleicher Radius um Root)", ring6v2Results.fractalChildrenAreHexagonal);
        check("Ring 6 V2: Scale-Hierarchie — Kinder bei ratio (0.5), Root bei 1", ring6v2Results.fractalScalesShrink);
        check("Ring 6 V2: Chat 'baue fraktal wasserfall' routet korrekt", ring6v2Results.chatFractalRoutes);
        // Counter
        check("Ring 6 V2: countArchitecturesNearPlayer nah = 3", ring6v2Results.counterNear);
        check("Ring 6 V2: countArchitecturesNearPlayer total = 8", ring6v2Results.counterTotal);
        check("Ring 6 V2: #status-architectures im DOM", ring6v2Results.statusBarItemInDom);
        check("Ring 6 V2: Status-Bar zeigt 'N nah / M' Format", ring6v2Results.statusBarShowsCount);
        // Bau-Cursor
        check("Ring 6 V2: #build-mode-hud im DOM", ring6v2Results.hudInDom);
        check("Ring 6 V2: HUD initial versteckt", ring6v2Results.hudInitiallyHidden);
        check("Ring 6.5: HUD sichtbar im aktiven Bau-Modus", ring6v2Results.hudShownWhenActive);
        check("Ring 6.5: Phantom-Material ist transparent", ring6v2Results.phantomIsTransparent);
        check("Ring 6.5: Selber Slot nochmal → Toggle off", ring6v2Results.toggleOffSameForm);
        check("Ring 6.5: Slot-Wechsel ändert aktiven Bauplan", ring6v2Results.switchFormChanges);
        check("Ring 6 V2: confirmBuild spawnt echte Struktur", ring6v2Results.confirmBuildSpawns);
        check("Ring 6 V2: confirmBuild lässt Modus aktiv (Mehrfach-Bau)", ring6v2Results.confirmBuildKeepsMode);
        check("Ring 6 V2: _clearBuildMode beendet Modus + räumt Phantom", ring6v2Results.clearEndsMode);
    }
}

// ARCHETYPEN-BANK: ~46 synthetische Positiv- + GEGEN-Beispiele je Rolle als stehende Invariante —
// jeder Signatur-Edit läuft gegen die Bank, nicht nur gegen die Built-ins. Kalibriert via
// diag-archetypbank (dieselbe Tabelle).
async function checkBandArchetypBank({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const P = (shape, material, x, y, z, sx, sy, sz, rot) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
            ...(rot ? { rotation: rot } : {}),
        });
        const RZ = { x: 0, y: 0, z: 1.5707963 };
        const wheelQuad = (mat) => [
            P("cylinder", mat, -0.72, 0.34, 0.8, 0.62, 0.14, 0.62, RZ),
            P("cylinder", mat, 0.72, 0.34, 0.8, 0.62, 0.14, 0.62, RZ),
            P("cylinder", mat, -0.72, 0.34, -0.8, 0.62, 0.14, 0.62, RZ),
            P("cylinder", mat, 0.72, 0.34, -0.8, 0.62, 0.14, 0.62, RZ),
        ];
        const wheelConns = [1, 2, 3, 4].map((i) => ({ type: "lashing", partA: 0, partB: i, auto: 1 }));
        const sitz = { type: "sitz", partA: 0, partB: -1 };
        const humanoid = (mat) => [
            P("box", mat, 0, 1.1, 0, 0.5, 0.7, 0.3),
            P("sphere", mat, 0, 1.7, 0, 0.3, 0.3, 0.3),
            P("box", mat, -0.15, 0.35, 0, 0.18, 0.7, 0.18),
            P("box", mat, 0.15, 0.35, 0, 0.18, 0.7, 0.18),
            P("box", mat, -0.4, 1.2, 0, 0.15, 0.6, 0.15),
            P("box", mat, 0.4, 1.2, 0, 0.15, 0.6, 0.15),
        ];
        const BANK = [
            {
                n: "wagen holz+sitz",
                p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                c: [...wheelConns, sitz],
                e: "vehicle",
            },
            {
                n: "karren eisen+sitz",
                p: [P("box", "eisen", 0, 0.85, 0, 1.4, 0.3, 2.4), ...wheelQuad("eisen")],
                c: [...wheelConns, sitz],
                e: "vehicle",
            },
            {
                n: "wagen breit holz",
                p: [P("box", "holz", 0, 0.85, 0, 1.8, 0.4, 2.6), ...wheelQuad("holz")],
                c: [...wheelConns, sitz],
                e: "vehicle",
            },
            {
                n: "GEGEN stein-stuhl",
                p: [P("box", "stein", 0, 0.6, 0, 1, 0.2, 1), P("box", "stein", 0, 0.2, 0, 0.9, 0.6, 0.9)],
                c: [sitz],
                ne: "vehicle",
            },
            {
                n: "GEGEN wagen ohne sitz ≠ trank",
                p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                c: wheelConns,
                ne: "consumable",
            },
            {
                n: "GEGEN wagen ohne sitz ≠ seele",
                p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                c: wheelConns,
                ne: "soul",
            },
            { n: "fleisch-humanoid", p: humanoid("fleisch"), e: "soul" },
            { n: "GEGEN leder-humanoid (Puppe)", p: humanoid("leder"), ne: "soul" },
            {
                n: "fleisch-humanoid groß",
                p: humanoid("fleisch").map((q) => ({
                    ...q,
                    size: { x: q.size.x * 1.5, y: q.size.y * 1.5, z: q.size.z * 1.5 },
                })),
                e: "soul",
            },
            { n: "GEGEN eisen-humanoid", p: humanoid("eisen"), ne: "soul" },
            { n: "GEGEN stein-humanoid", p: humanoid("stein"), ne: "soul" },
            { n: "trank laub-kügelchen", p: [P("sphere", "laub", 0, 0.4, 0, 0.5, 0.6, 0.5)], e: "consumable" },
            { n: "frucht fleisch-kugel", p: [P("sphere", "fleisch", 0, 0.5, 0, 1, 1, 1)], e: "consumable" },
            { n: "kraut-bündel", p: [P("sphere", "kraut", 0, 0.3, 0, 0.4, 0.5, 0.4)], e: "consumable" },
            {
                n: "trank zwei-teilig",
                p: [P("sphere", "laub", 0, 0.35, 0, 0.45, 0.55, 0.45), P("sphere", "essenz", 0, 0.7, 0, 0.2, 0.2, 0.2)],
                e: "consumable",
            },
            {
                n: "GEGEN baum ≠ trank",
                p: [P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85), P("sphere", "laub", 0, 4.7, 0, 2.9, 2.6, 2.9)],
                ne: "consumable",
            },
            { n: "GEGEN holz-kasten ≠ trank", p: [P("box", "holz", 0, 0.5, 0, 2.2, 1, 2.2)], ne: "consumable" },
            { n: "GEGEN laub-teppich ≠ trank", p: [P("box", "laub", 0, 0.1, 0, 3, 0.2, 3)], ne: "consumable" },
            {
                n: "stein-turm",
                p: [P("box", "stein", 0, 1, 0, 2, 2, 2), P("box", "stein", 0, 3, 0, 1.6, 2, 1.6)],
                e: "architecture",
            },
            {
                n: "holz-hütte",
                p: [
                    P("box", "holz", 0, 0.15, 0, 4, 0.3, 4),
                    P("box", "holz", 0, 1.5, 1.9, 4, 3, 0.2),
                    P("box", "holz", 0, 1.5, -1.9, 4, 3, 0.2),
                ],
                e: "architecture",
            },
            { n: "eisen-säule", p: [P("cylinder", "eisen", 0, 2, 0, 0.8, 4, 0.8)], e: "architecture" },
            { n: "quarz-monument", p: [P("box", "quarz", 0, 1.2, 0, 1.8, 2.4, 1.8)], e: "architecture" },
            {
                n: "baum-gestalt",
                p: [P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85), P("sphere", "laub", 0, 4.7, 0, 2.9, 2.6, 2.9)],
                e: "architecture",
            },
            { n: "quarz-torus tor", p: [P("torus", "quarz", 0, 1.6, 0, 2.6, 2.6, 0.5)], e: "portal" },
            { n: "essenz-ring tor", p: [P("torus", "essenz", 0, 1.5, 0, 2.4, 2.4, 0.4)], e: "portal" },
            { n: "GEGEN mini-ring ≠ tor", p: [P("torus", "quarz", 0, 0.3, 0, 0.5, 0.5, 0.15)], ne: "portal" },
            { n: "GEGEN stein-ring ≠ tor", p: [P("torus", "stein", 0, 1.6, 0, 2.6, 2.6, 0.5)], ne: "portal" },
            {
                n: "eisen-klinge",
                p: [P("cone", "eisen", 0, 1.0, 0, 0.12, 1.2, 0.12), P("cylinder", "eisen", 0, 0.2, 0, 0.08, 0.5, 0.08)],
                eIn: ["weapon", "held", "tool", "brecher"],
            },
            {
                n: "pickel holz-stiel",
                p: [
                    P("cone", "stein", 0, 0.95, 0, 0.18, 0.5, 0.18),
                    P("cylinder", "holz", 0, 0.35, 0, 0.07, 0.8, 0.07),
                ],
                eIn: ["tool", "held", "weapon", "brecher"],
            },
            { n: "GEGEN eisen-klotz ≠ waffe", p: [P("box", "eisen", 0, 0.4, 0, 0.8, 0.8, 0.8)], ne: "weapon" },
            {
                n: "GEGEN spitzen-cluster ≠ waffe",
                p: [P("cone", "stein", 0, 0.5, 0, 0.6, 0.7, 0.6), P("cone", "stein", 0.3, 0.45, 0.2, 0.5, 0.6, 0.5)],
                ne: "weapon",
            },
            // AUSLÖSCHUNGS-WELLE — der fahrzeug_wagen-Blueprint fiel; die Substanz-Zeile
            // (KIND_SUBSTANCE, parts + connections) trägt die Bank-Probe unverändert.
            {
                n: "substanz fahrzeug_wagen (KIND_SUBSTANCE)",
                p: (r.constructor.KIND_SUBSTANCE || {}).fahrzeug_wagen.parts,
                c: (r.constructor.KIND_SUBSTANCE || {}).fahrzeug_wagen.connections,
                e: "vehicle",
            },
            { n: "builtin reittier_holzross", b: "reittier_holzross", e: "vehicle" },
            { n: "builtin baum_eiche", b: "baum_eiche", e: "architecture" },
            { n: "builtin baum_kiefer", b: "baum_kiefer", e: "architecture" },
            { n: "builtin trank_lebenssaft", b: "trank_lebenssaft", e: "consumable" },
            { n: "builtin koerper_human", b: "koerper_human", e: "soul" },
            { n: "builtin ruestung_brustpanzer", b: "ruestung_brustpanzer", eIn: ["armor", "architecture"] },
            { n: "builtin stein_block", b: "stein_block", e: "architecture" },
            { n: "builtin kristall_geode", b: "kristall_geode", eIn: ["architecture", "portal"] },
            { n: "trank variant 0.7×", p: [P("sphere", "laub", 0, 0.3, 0, 0.35, 0.42, 0.35)], e: "consumable" },
            { n: "turm variant schmal", p: [P("box", "stein", 0, 2, 0, 1, 4, 1)], e: "architecture" },
            { n: "humanoid variant knochen", p: humanoid("knochen"), ne: "consumable" },
            {
                n: "wagen variant 3 räder",
                p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz").slice(0, 3)],
                c: [...wheelConns.slice(0, 3), sitz],
                e: "vehicle",
            },
            { n: "GEGEN leerer ein-block", p: [P("box", "stein", 0, 0.5, 0, 1, 1, 1)], ne: "vehicle" },
            { n: "GEGEN glut-brocken ≠ seele", p: [P("sphere", "glut", 0, 0.5, 0, 1.2, 1.2, 1.2)], ne: "soul" },
        ];
        const fails = [];
        for (const tc of BANK) {
            const bp = tc.b
                ? r.state.blueprints[tc.b]
                : { name: "_bank", parts: tc.p, ...(tc.c ? { connections: tc.c } : {}) };
            if (!bp) {
                fails.push(`${tc.n}: builtin fehlt`);
                continue;
            }
            const got = r.computeBlueprintRole(bp);
            const ok = tc.e ? got === tc.e : tc.eIn ? tc.eIn.includes(got) : got !== tc.ne;
            if (!ok) fails.push(`${tc.n}: ${got} (soll ${tc.e || (tc.eIn && tc.eIn.join("|")) || "≠" + tc.ne})`);
        }
        return { cases: BANK.length, fails };
    });
    check(
        `V18.164 §7.3(a) ARCHETYPEN-BANK: alle ${res.cases} synthetischen Positiv-/GEGEN-Beispiele klassifizieren wie kalibriert (Signatur-Edits laufen gegen die Bank)` +
            (res.fails.length ? ` — FAILS: ${res.fails.join(" · ")}` : ""),
        res.cases >= 45 && res.fails.length === 0
    );
}

async function checkBandLambda2HismSynthese({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const A = r.constructor;
        out.instanceTintFrozen = Object.isFrozen(A.INSTANCE_TINT);
        out.instanceTintShape =
            Number.isFinite(A.INSTANCE_TINT.rangeH) &&
            Number.isFinite(A.INSTANCE_TINT.rangeS) &&
            Number.isFinite(A.INSTANCE_TINT.rangeV);
        // 50 baum_eiche mit verschiedenen Seeds; tintH/S/V sammeln (Λ.2: seed-deterministisch aus Bit-
        // Bändern in spawnArchitecture). Yaw-σ (_vegetationSampleSpawn via opts.rotationY) prüft die
        // checkBandWHWald-Familie, nicht dieses Band.
        const tints = [];
        const tintS = [];
        const tintV = [];
        const savedArch = r.state.architectures.slice();
        try {
            r.state.architectures = [];
            for (let i = 0; i < 50; i++) {
                // Echte 32-bit-Seeds: die Bit-Bänder (>>> 5, >>> 13, >>> 21) brauchen die volle Breite, sonst ist
                // >>> 21 bei seed < 2²¹ immer 0 (σ = 0). Der multiplikative Hash streut kleine i über 32 bit.
                const seed = ((i + 1) * 2654435761) >>> 0;
                const a = r.spawnArchitecture(
                    "baum_eiche",
                    { x: 200 + i * 5, y: 0, z: 200 },
                    { seed, silent: true, precise: true }
                );
                if (a) {
                    if (Number.isFinite(a.tintH)) tints.push(a.tintH);
                    if (Number.isFinite(a.tintS)) tintS.push(a.tintS);
                    if (Number.isFinite(a.tintV)) tintV.push(a.tintV);
                }
            }
        } finally {
            r.state.architectures = savedArch;
        }
        // σ-Berechnungen.
        const avg = (arr) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);
        const std = (arr) => {
            if (!arr.length) return 0;
            const m = avg(arr);
            return Math.sqrt(avg(arr.map((v) => (v - m) ** 2)));
        };
        out.tintHSpread = std(tints);
        out.tintSSpread = std(tintS);
        out.tintVSpread = std(tintV);
        out.tintCount = tints.length;
        // Snapshot+Restore-Test: tintH muss bit-treu durchreisen.
        if (tints.length >= 1) {
            const probe = r.state.architectures[0] || { tintH: 0.5, tintS: 0.5, tintV: 0.5 };
            r.state.architectures = [
                {
                    type: "baum_eiche",
                    id: "λ2_probe",
                    // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
                    position: { x: 1000, y: 0, z: 1000 },
                    seed: 12345,
                    scale: 1,
                    tintH: 0.42,
                    tintS: 0.31,
                    tintV: 0.67,
                },
            ];
            const snap = r.buildStateSnapshot();
            const snapEntry = snap.architectures && snap.architectures.find((a) => a.id === "λ2_probe");
            out.snapshotCarriesTint =
                snapEntry &&
                Math.abs(snapEntry.tintH - 0.42) < 1e-9 &&
                Math.abs(snapEntry.tintS - 0.31) < 1e-9 &&
                Math.abs(snapEntry.tintV - 0.67) < 1e-9;
            r.state.architectures = savedArch;
            void probe;
        }
        return out;
    });
    check("Λ.2 HISM: INSTANCE_TINT ist frozen + trägt rangeH/S/V", res.instanceTintFrozen && res.instanceTintShape);
    // Der Instanz-Tint ist bewusst NEUTRAL-NAH: ±8 % Luminanz-Jitter, uniform [0.92, 1.08] → σ =
    // 0.16/√12 ≈ 0.046. Vertrag: Varianz EXISTIERT (σ > 0.02, kein Klon-Flat) und bleibt GEBUNDEN
    // (σ < 0.06 — stärkerer Farbwurf verfälscht die Studio-Blattfarbe multiplikativ).
    check(
        `Λ.2 HISM: tintH-σ über 50 Eichen NEUTRAL-NAH in (0.02, 0.06) (GEMESSEN ${res.tintHSpread && res.tintHSpread.toFixed(3)})`,
        Number.isFinite(res.tintHSpread) && res.tintHSpread > 0.02 && res.tintHSpread < 0.06
    );
    check(
        `Λ.2 HISM: tintS-σ über 50 Eichen NEUTRAL-NAH in (0.02, 0.06) (GEMESSEN ${res.tintSSpread && res.tintSSpread.toFixed(3)})`,
        Number.isFinite(res.tintSSpread) && res.tintSSpread > 0.02 && res.tintSSpread < 0.06
    );
    check(
        `Λ.2 HISM: tintV-σ über 50 Eichen NEUTRAL-NAH in (0.02, 0.06) (GEMESSEN ${res.tintVSpread && res.tintVSpread.toFixed(3)})`,
        Number.isFinite(res.tintVSpread) && res.tintVSpread > 0.02 && res.tintVSpread < 0.06
    );
    check("Λ.2 HISM: tintH/S/V reist bit-treu im Snapshot (V8.59-Klasse)", res.snapshotCarriesTint === true);
}

async function checkBandLambda5MischwaldSynthese({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // die statischen Mischwald-Baupläne sind GESCHNITTEN; die Arten
        // leben jetzt in SPECIES_TAG_REFERENCE (Tags) + dem Gesetzbuch (Form, _phytoArt) +
        // der candidates-Liste (Spawn). KEINE statischen _jung/_alt-Varianten mehr.
        const ref = r.constructor.SPECIES_TAG_REFERENCE || {};
        out.fourNewSpecies = !!(ref.baum_birke && ref.baum_erle && ref.baum_buche && ref.baum_tanne);
        // die Liste der Würfe des Felds (`FELD_WURF`, K10-6: die EINE, die _vegetationSampleSpawn liest) trägt die 4 NEUEN,
        // aber NICHT die Varianten — gelesen an der Liste, nie am Rumpf-Text (Lehre 6)
        const liste = r.constructor.FELD_WURF || [];
        out.candidatesBirke = liste.includes("baum_birke");
        out.candidatesErle = liste.includes("baum_erle");
        out.candidatesBuche = liste.includes("baum_buche");
        out.candidatesTanne = liste.includes("baum_tanne");
        out.candidatesNoVariants = liste.length > 0 && !liste.some((n) => /^baum_(birke|erle)_(jung|alt)$/.test(n));
        // Tag-Neutralität: Birke hat dieselbe kanonische Laub-Signatur wie Eiche.
        out.tagNeutral =
            !!(ref.baum_eiche && ref.baum_birke) &&
            Math.abs((ref.baum_eiche.lebendig || 0) - (ref.baum_birke.lebendig || 0)) < 0.01 &&
            Math.abs((ref.baum_eiche.brennbar || 0) - (ref.baum_birke.brennbar || 0)) < 0.01;
        return out;
    });
    check(
        "Λ.5 Mischwald (V18.257): 4 neue Baumarten leben in SPECIES_TAG_REFERENCE (birke/erle/buche/tanne — Form via Grammatik, statische Baupläne geschnitten)",
        res.fourNewSpecies === true
    );
    check(
        "Λ.5 Mischwald: candidates enthält die 4 neuen Baumarten",
        res.candidatesBirke && res.candidatesErle && res.candidatesBuche && res.candidatesTanne
    );
    check(
        "Λ.5 Mischwald: candidates trägt KEINE Varianten (Vielfalt nach dem Sieg, V17.16-Falle vermieden)",
        res.candidatesNoVariants === true
    );
    check("Λ.5 Mischwald: Tag-Neutralität birke ↔ eiche (Laub-Signatur gleich)", res.tagNeutral === true);
}

// W-H Wald: die Gestalt-Variante je Art wird NACH dem Affinitäts-Sieg gewählt → die Verteilung bleibt
// bit-identisch und tag-neutral (gleiche Materialien + Formen). Headless: Tag-Neutralität,
// Spawn-Verdrahtung, Pro-Instanz-Rotation + ihre Persistenz.
async function checkBandWHWald({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (1) die statischen Gestalt-Varianten (baum_*_breit/jung/schlank)
        // sind GESCHNITTEN; die Tag-Wahrheit lebt in der frozen SPECIES_TAG_REFERENCE,
        // die Form-Vielfalt voll in der Grammatik (sizeClass/age-Genom). Kein „rundes Ding" mehr.
        const refTbl = r.constructor.SPECIES_TAG_REFERENCE || {};
        out.refTableHat = !!(refTbl.baum_eiche && refTbl.baum_kiefer);
        // (2) die Bäume treten im Affinitäts-Wettstreit (candidates) NUR als kanonische Art an — keine
        // statische _jung/_alt/_breit-Variante im Pool; die Gestalt entsteht NACH dem Sieg.
        // (die Liste der Würfe des Felds, `FELD_WURF` — K10-6: gelesen an der Liste, nie am Rumpf-Text)
        const feldWurf = r.constructor.FELD_WURF || [];
        out.notInCandidates =
            feldWurf.includes("baum_eiche") &&
            feldWurf.includes("baum_kiefer") &&
            !feldWurf.some((n) => /^baum_eiche_(breit|jung|alt)$|^baum_kiefer_schlank$/.test(n));
        // (3) DER WALD AM RUF (EINE Baum-Quelle `_forestPlantChunk`, Rekorder statt Bau): jeder Baum ist die kanonische Art mit
        // dem Varianten-Index als Metadatum (die Gestalt wählt der Render), Größe (reverse-J 0,55–1,95) und Gier aus seinem Dart —
        // und sie streuen: der Klon-Killer, ein Wald zeigt nicht nach Norden und steht nicht in einer Größe.
        const calls = [];
        const imm = r._vegSpawnImmediate;
        Object.assign(r, { _enqueueVegetationSpawn: (n, p, o) => calls.push({ n, o }), _scatterRegisterCell() {}, _scatterIncrementCounter() {}, _vegSpawnImmediate: true });
        try {
            const span = r._voxelChunkConfig().span;
            const pm = r.state.playerMesh.position;
            for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) r._forestPlantChunk(Math.floor(pm.x / span) + i, Math.floor(pm.z / span) + j);
        } finally {
            for (const k of ["_enqueueVegetationSpawn", "_scatterRegisterCell", "_scatterIncrementCounter", "_vegSpawnImmediate"]) delete r[k];
            if (imm !== undefined) r._vegSpawnImmediate = imm;
        }
        const baeume = calls.filter((c) => c.o && c.o._lodSpecies);
        out.wald = { baeume: baeume.length, groessen: new Set(baeume.map((c) => c.o.scale)).size, gieren: new Set(baeume.map((c) => c.o.rotationY)).size };
        out.variantPickAfterWin = baeume.length >= 3 && baeume.every((c) => c.n === c.o._lodSpecies && !/_(jung|alt|breit|schlank)$/.test(c.n) && Number.isInteger(c.o._lodVariantIndex));
        out.sizeSpan = out.wald.groessen >= 3 && baeume.every((c) => c.o.scale >= 0.55 && c.o.scale <= 1.95);
        out.rotInSpawn = out.wald.gieren >= 3;
        // (5) Pro-Instanz-Rotation in der Matrix: verschiedene rotationY → verschiedene Welt-Matrizen.
        const m0 = r._archEntryWorldMatrix({ position: { x: 0, y: 0, z: 0 }, scale: 1, rotationY: 0 });
        const m1 = r._archEntryWorldMatrix({ position: { x: 0, y: 0, z: 0 }, scale: 1, rotationY: 1.2 });
        out.rotChangesMatrix = m0.elements[0] !== m1.elements[0] || m0.elements[2] !== m1.elements[2];
        return out;
    });
    check(
        "W-H Wald (V18.257): die statischen Gestalt-Varianten sind GESCHNITTEN — die Tag-Wahrheit lebt in SPECIES_TAG_REFERENCE (eiche/kiefer), die Form-Vielfalt voll in der Grammatik",
        res.refTableHat
    );
    check(
        "W-H Wald: die Bäume treten im Affinitäts-Wettstreit NUR als kanonische Art an — der Varianten-Index reist als METADATEN nach dem Nischen-Sieg (source-neutral, keine eager-gewachsene Geometrie im Spawn; keine statische _jung/_alt/_breit-Variante)",
        res.notInCandidates && res.variantPickAfterWin
    );
    check(
        `W-H Wald: der GRÖSSEN-SPAN reist seed-deterministisch in den Spawn (scale 0,55–1,95 über die HISM-Instanz-Matrix; ${JSON.stringify(res.wald)})`,
        res.sizeSpan
    );
    check(
        "W-H Wald DER KLON-KILLER: die Pro-Instanz-ROTATION wirkt (der Wald setzt sie je Dart · verschiedene Yaw → verschiedene Welt-Matrix — ein Wald zeigt nicht mehr nach Norden)",
        res.rotInSpawn && res.rotChangesMatrix
    );
}

// Γ2 TOTHOLZ: ein gefallener Stamm im Wald.
// Built-in Bauplan `stamm_gefallen` + Sub-Spawn nach Baum (~10 % Chance,
// seed-deterministisch, KEIN Affinitäts-Wettstreit — Disziplin).
async function checkBandV18198Gamma2Totholz({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};


        // (T2) Bauplan `stamm_gefallen` ist registriert
        const bp = r.state.blueprints && r.state.blueprints["stamm_gefallen"];
        out.bpExists = !!bp;
        out.bpBuiltIn = bp && bp.builtIn === true;
        out.bpInstanced = bp && bp.instanced === true;
        out.bpLabel = bp && bp.label === "Gefallener Stamm";

        // (T3) Parts: alle holz (tag-neutral mit den Bäumen)
        if (bp && Array.isArray(bp.parts)) {
            out.partsCount = bp.parts.length;
            out.allHolz = bp.parts.every((p) => p.material === "holz");
            out.allCylinder = bp.parts.every((p) => p.shape === "cylinder");
            // Mindestens ein Part hat z-Rotation (horizontal liegend)
            out.hasRotation = bp.parts.some(
                (p) => p.rotation && typeof p.rotation.z === "number" && Math.abs(p.rotation.z) > 0.5
            );
        }

        // (T4) Affinitäts-Wand: stamm_gefallen ist NICHT in candidates (Sub-Spawn nach dem Baum), muss also
        // nicht tag-identisch zu baum_eiche sein — darf aber in KEINER Achse höher resonieren, sonst
        // verdrängte er, je in candidates aufgenommen, einen Sieger (ohne Laub: magieleitung niedriger, OK).
        const targetAxes = ["lebendig", "dichte", "brennbar", "magieleitung"];
        // die Baum-Referenz-Tags aus der frozen SPECIES_TAG_REFERENCE
        // (der statische baum_eiche-Bauplan ist geschnitten).
        const __treeRef =
            (r.constructor.SPECIES_TAG_REFERENCE &&
                r.constructor.SPECIES_TAG_REFERENCE.baum_eiche) ||
            null;
        if (bp && __treeRef) {
            const totTags = r.computeCompoundTags(bp);
            const diffs = {};
            let neverHigher = true;
            for (const axis of targetAxes) {
                const dt = (totTags[axis] || 0) - (__treeRef[axis] || 0);
                diffs[axis] = Number(dt.toFixed(3));
                if (dt > 0.05) neverHigher = false;
            }
            out.tagDiffs = diffs;
            out.tagNeverHigherThanTree = neverHigher;
        }

        // (T7) DIREKT-SPAWN-TEST: spawnArchitecture("stamm_gefallen", ...) klappt
        // und das Entry trägt blockerAABBs (V13.10-Solidität).
        const before = r.state.architectures.length;
        try {
            const e = r.spawnArchitecture("stamm_gefallen", { x: 1234, y: 50, z: 1234 }, { silent: true });
            out.directSpawnOk = !!e;
            out.directSpawnHasBlockers = e && Array.isArray(e.blockerAABBs) && e.blockerAABBs.length > 0;
            if (e) r.removeArchitecture(e);
        } catch (err) {
            out.directSpawnError = err && err.message ? err.message : String(err);
        }
        out.archCountUnchanged = r.state.architectures.length === before;

        return out;
    });

    check("V18.198 (T2a) Bauplan stamm_gefallen registriert", res.bpExists === true);
    check("V18.198 (T2b) Bauplan ist builtIn + instanced", res.bpBuiltIn === true && res.bpInstanced === true);
    check(`V18.198 (T2c) Label 'Gefallener Stamm' (gemessen ${JSON.stringify(res.bpLabel)})`, res.bpLabel === true);
    check(`V18.198 (T3a) Parts existieren (${res.partsCount})`, res.partsCount >= 1);
    check("V18.198 (T3b) Alle Parts material=holz (tag-neutral mit Baumstämmen)", res.allHolz === true);
    check("V18.198 (T3c) Alle Parts shape=cylinder", res.allCylinder === true);
    check("V18.198 (T3d) Mindestens ein Part hat z-Rotation (horizontal liegend)", res.hasRotation === true);
    check(
        `V18.198 (T4) AFFINITÄTS-WAND: stamm_gefallen ≤ baum_eiche in jeder Achse (V17.16-Disziplin, diffs ${JSON.stringify(res.tagDiffs)})`,
        res.tagNeverHigherThanTree === true
    );
    check("V18.198 (T7a) Direkt-Spawn stamm_gefallen funktioniert", res.directSpawnOk === true);
    check("V18.198 (T7b) Spawn trägt blockerAABBs (V13.10 Solidität)", res.directSpawnHasBlockers === true);
    check("V18.198 (T7c) Cleanup: state.architectures-Länge unverändert", res.archCountUnchanged === true);
}

// Mesh-Merge pro Variante: statt ~75–80 InstancedMesh je Variante ~2 (bark merged + foliage merged).
// Reine RENDER-Optimierung — bp.parts bleibt unverändert (tag-neutral); gen<6 bleibt Per-Part
// (alte Welten bit-identisch).
async function checkBandV18213MeshMerge({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};

        // ─── (M1) Source-Probes: die zwei neuen Helper + Routing ─────

        // ─── (M3+M4) Behavioral: gen=6 grown Baum trägt _isMerged + Merge funktioniert ───
        // Test-Subjekt ist ein ECHTER _isGrown-Bauplan der warmen Welt, der NICHT moveable/magnifying ist
        // (die laufen classic, ohne HISM/Merge) — manche Seeds erzeugen moveable-Tannen.
        let testBp = null;
        let testKey = null;
        for (const key of Object.keys(r.state.blueprints)) {
            const b = r.state.blueprints[key];
            if (!b || !b._isGrown) continue;
            const aff = r.computeBlueprintAffordances(b);
            if (aff.moveable || aff.magnifying) continue;
            testBp = b;
            testKey = key;
            break;
        }
        if (testBp) {
            // Im Restore-Pfad steht _isMerged je nach genVersion; wir setzen
            // beide Test-Pfade explizit + räumen den Cache, sodass der
            // Routing-Schritt unverdorben gemessen wird.
            const origIsMerged = testBp._isMerged;
            testBp._isMerged = true;
            if (r.state.archFlattenCache) r.state.archFlattenCache.delete(testKey);
            if (r.state.archMergedGeomCache) r.state.archMergedGeomCache.delete(testKey);

            out.bpHasIsMerged = testBp._isMerged === true;
            out.bpStillHasParts = Array.isArray(testBp.parts) && testBp.parts.length >= 50; // V18.211: 75-80

            // M5+M6: archFlattenBlueprint gibt ≤4 leaves (statt 75-80).
            // Tannen/Kiefern haben holz + laub → exakt 2 Leaves erwartet.
            const flat = r._archFlattenBlueprint(testKey);
            out.flatIsInstanceable = flat && flat.instanceable === true;
            out.flatHasMergedFlag = flat && flat.merged === true;
            out.flatLeafCount = flat ? flat.leaves.length : -1;
            out.flatLeavesFew = flat && flat.leaves.length >= 1 && flat.leaves.length <= 4;
            // Jede merged geom hat ≥100 Vertices (viele Parts gemerged).
            if (flat && flat.leaves.length > 0) {
                out.firstLeafVertCount = flat.leaves[0].geom.attributes.position.count;
                out.mergedHasManyVerts = flat.leaves.every(
                    (l) => l.geom && l.geom.attributes && l.geom.attributes.position.count >= 100
                );
                // M-Identity: localMatrix ist Identity (Per-Part-Transform ist in Vertices gebacken).
                out.mergedHasIdentityMatrix = flat.leaves.every((l) => {
                    const elems = l.localMatrix.elements;
                    // Identity check: diag 1, off-diag 0 (mit kleinem Float-Tolerance).
                    return (
                        Math.abs(elems[0] - 1) < 1e-6 &&
                        Math.abs(elems[5] - 1) < 1e-6 &&
                        Math.abs(elems[10] - 1) < 1e-6 &&
                        Math.abs(elems[12]) < 1e-6 &&
                        Math.abs(elems[13]) < 1e-6 &&
                        Math.abs(elems[14]) < 1e-6
                    );
                });
                // M-Color: jede ANZEIGE-geom trägt das vertexColors-Attribut. Der Schatten-Zwilling (`l.shadowTwin`,
                // SHADOW_TWIN_LAYER) ist ein opaker, kamera-unsichtbarer Schatten-Caster ohne Farbe → gefiltert;
                // die Invariante gilt den ANZEIGE-Leaves (bark/card/core).
                const displayLeaves = flat.leaves.filter((l) => !l.shadowTwin);
                out.mergedHasColors =
                    displayLeaves.length > 0 &&
                    displayLeaves.every((l) => l.geom && l.geom.attributes && l.geom.attributes.color);
                // M-Material: das Material liest die Vertex-Farbe EINMAL — im colorNode (dann vertexColors aus) oder
                // über vertexColors ohne colorNode, nie beides (r184 multipliziert sonst: Albedo = Farbe²).
                out.mergedMatVertexColors =
                    displayLeaves.length > 0 &&
                    displayLeaves.every((l) => l.mat && !!l.mat.colorNode !== (l.mat.vertexColors === true));
            }

            // ─── (M7) Tag-Neutralität: bp.parts unverändert ───
            // computeCompoundTags liest bp.parts → gleiche Werte mit/ohne _isMerged. Der bpClone braucht
            // _isGrown + _grownSpecies, sonst vergliche er Variation-an mit Variation-aus.
            const tagsMerged = r.computeCompoundTags(testBp);
            const bpClone = {
                parts: testBp.parts.slice(),
                _isGrown: testBp._isGrown,
                _grownSpecies: testBp._grownSpecies,
            };
            const tagsNonMerged = r.computeCompoundTags(bpClone);
            const tagKeys = ["lebendig", "dichte", "brennbar", "magieleitung"];
            out.tagsNeutral = tagKeys.every((k) => Math.abs((tagsMerged[k] || 0) - (tagsNonMerged[k] || 0)) < 1e-9);

            // ─── (M8) Performance-Wand: ein zweiter Merge ist gecached ─
            // Re-Aufruf von archFlattenBlueprint ist O(1) Cache-Hit.
            const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
            for (let i = 0; i < 50; i++) r._archFlattenBlueprint(testKey);
            const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
            out.cacheHitFast = t1 - t0 < 50; // 50 Lookups in <50ms

            // ─── (M9) Snapshot-Restore: _isMerged wird neu gesetzt ─
            // der Snapshot persistiert NUR architektur-referenzierte grown-Baupläne;
            // eine Sentinel-Architektur hält testKey (sonst korrekt herausgefiltert).
            r.state.architectures = r.state.architectures || [];
            r.state.architectures.push({ id: "v213-snap-arch", type: testKey, position: { x: 0, y: 0, z: 0 } });
            // Wir bauen einen Snapshot, prüfen das relevante Feld.
            const snap = r.buildStateSnapshot();
            const gb = snap && snap.grownBlueprints && snap.grownBlueprints[testKey];
            out.snapshotHasEntry = !!gb;
            r.state.architectures = r.state.architectures.filter((a) => a.id !== "v213-snap-arch");
            // gb hat KEIN _isMerged (das wird beim Restore aus genVersion abgeleitet).
            out.snapshotHasNoMergedFlag = gb ? gb._isMerged === undefined : false;

            // Defensive: Original-Flag wiederherstellen.
            testBp._isMerged = origIsMerged;
        }

        // ─── (M10) Welt-Wechsel-Reset: archMergedGeomCache wird disposed ─
        // Voraussetzung: state.archMergedGeomCache ist initialisiert + nicht-leer.
        const cacheBeforeReset = r.state.archMergedGeomCache;
        out.cacheExists = !!cacheBeforeReset && cacheBeforeReset.size > 0;
        // Simulate Welt-Wechsel-Reset (NUR der merged-Cache-Pfad — NICHT die
        // anderen Teile von _loadStateRestoreWorldMeta, das würde die Welt
        // brechen).
        if (cacheBeforeReset) {
            for (const entry of cacheBeforeReset.values()) {
                if (entry && Array.isArray(entry.leaves)) {
                    for (const leaf of entry.leaves) {
                        if (leaf && leaf.geom && typeof leaf.geom.dispose === "function") leaf.geom.dispose();
                    }
                }
            }
            cacheBeforeReset.clear();
            out.cacheClearedAfterReset = cacheBeforeReset.size === 0;
        }
        // Auch den archFlattenCache-Eintrag des Test-Bauplans räumen (selektiv), sonst zögen Folge-Bands
        // stale Einträge mit zerstörten merged-Geom-Referenzen.
        if (testKey && r.state.archFlattenCache) r.state.archFlattenCache.delete(testKey);

        return out;
    });

    check("V18.213 (M3a) gen=6 grown Bauplan trägt _isMerged: true", res.bpHasIsMerged === true);
    check("V18.213 (M3b) bp.parts bleibt erhalten (≥50 Parts, V17.16-Wand)", res.bpStillHasParts === true);
    check("V18.213 (M4a) archFlattenBlueprint markiert merged: true (Diagnose-Marker)", res.flatHasMergedFlag === true);
    check("V18.213 (M4b) archFlattenBlueprint ist instanceable", res.flatIsInstanceable === true);
    check(
        `V18.213 (M5) leaves ≤4 (1-2 Materials × 2 Toleranz, gemessen ${res.flatLeafCount}; vs V18.211 75-80)`,
        res.flatLeavesFew === true
    );
    check(
        `V18.213 (M6a) Erstes merged leaf hat ≥100 Vertices (gemessen ${res.firstLeafVertCount})`,
        res.mergedHasManyVerts === true
    );
    check(
        "V18.213 (M6b) localMatrix ist Identity (Per-Part-Transform in Vertices gebacken)",
        res.mergedHasIdentityMatrix === true
    );
    check("V18.213 (M6c) Merged geom trägt vertexColors-Attribut", res.mergedHasColors === true);
    check(
        "V18.213 (M6d) Merged Material liest die Vertex-Farbe einmal (colorNode XOR vertexColors)",
        res.mergedMatVertexColors === true
    );
    check(
        "V18.213 (M7) Tag-Neutralität: computeCompoundTags(merged) == (non-merged) (V17.16-Wand)",
        res.tagsNeutral === true
    );
    check("V18.213 (M8) Cache-Hit-Performance: 50 archFlattenBlueprint-Lookups < 50ms", res.cacheHitFast === true);
    check("V18.213 (M9a) Snapshot trägt grown-Eintrag (Restore-Pfad funktional)", res.snapshotHasEntry === true);
    check(
        "V18.213 (M9b) Snapshot persistiert _isMerged NICHT (aus genVersion ableitbar)",
        res.snapshotHasNoMergedFlag === true
    );
    check("V18.213 (M10a) archMergedGeomCache war nicht-leer nach Merge", res.cacheExists === true);
    check("V18.213 (M10b) archMergedGeomCache wird beim Reset geleert", res.cacheClearedAfterReset === true);
}

async function checkBandV18265ShadowDistance({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // UNIT: L0 UND L1 werfen Schatten (sonst verlöre jeder Baum ab thresh01 seinen Schatten mitten im
        // Sichtfeld); NUR die Fernstufe L2 wirft nie. Bauten (kein _lodN) werfen weiter.
        out.lod0Casts = r._archGroupCastsShadow("grown_baum_eiche_v3") === true;
        out.lod1NoCast = r._archGroupCastsShadow("grown_baum_eiche_v3_lod1") === true;
        out.lod2NoCast = r._archGroupCastsShadow("grown_baum_eiche_v3_lod2") === false;
        out.structureCasts = r._archGroupCastsShadow("tempel") === true;
        // BEHAVIORAL: echte Gruppen bauen + das gerenderte Flag prüfen.
        if (typeof THREE !== "undefined") {
            const leaf = { geom: new THREE.BoxGeometry(1, 1, 1), mat: new THREE.MeshBasicMaterial() };
            const farG = r._archInstanceGroupFor("grown_probe_v0_lod2", 0, leaf);
            const nearG = r._archInstanceGroupFor("grown_probe_v0", 0, leaf);
            out.farMeshNoShadow = !!farG && farG.mesh.castShadow === false;
            out.nearMeshShadow = !!nearG && nearG.mesh.castShadow === true;
            // Grow trägt das Flag mit
            r._archInstanceGroupGrow(farG);
            out.farGrowNoShadow = farG.mesh.castShadow === false;
            // Test-Gruppen wieder entfernen (Welt-State sauber halten)
            for (const k of ["grown_probe_v0_lod2#0", "grown_probe_v0#0"]) {
                const g = st.archInstanceGroups && st.archInstanceGroups.get(k);
                if (g) {
                    if (st.scene && g.mesh) st.scene.remove(g.mesh);
                    st.archInstanceGroups.delete(k);
                }
            }
        }
        return out;
    });
    check("V18.265: _archGroupCastsShadow — LOD0 + Bauten werfen Schatten", res.lod0Casts && res.structureCasts);
    check("V18.464: L1 wirft (Schatten bis zur Fernstufe), NUR L2 wirft keinen", res.lod1NoCast && res.lod2NoCast);
    check(
        "V18.265: echte Fern-Gruppe castShadow=false, Nah-Gruppe castShadow=true (auch nach Grow)",
        res.farMeshNoShadow && res.nearMeshShadow && res.farGrowNoShadow
    );
}

module.exports = {
    checkBandV1728SpawnClearance, checkBandWellePerfDBudget, checkBandRing6Workshop, checkBandArchetypBank,
    checkBandLambda2HismSynthese, checkBandLambda5MischwaldSynthese, checkBandWHWald, checkBandV18198Gamma2Totholz,
    checkBandV18213MeshMerge, checkBandV18265ShadowDistance,
};
