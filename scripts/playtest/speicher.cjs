"use strict";
// scripts/playtest/speicher.cjs — der Richter von Speicher (spec/stamm/modul-karte.json): Snapshot · IndexedDB · Welt-Index · Manifest · Serialisierung · loadState-Kette · Welt-Tor · Fusion · Bibliothek.
// 7 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar } = require("../playtest.cjs");

// Regel-Persistenz: worldRules überleben den Reload (buildStateSnapshot/loadState: definierende
// Felder, frische Akkus, dedup, cap), fuseWorlds VEREINIGT die Regel-Sätze. Eine restaurierte Regel
// FEUERT; ein alter Save ohne worldRules → no-op.
async function checkBandV1738RulePersistence({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const now = () => performance.now() / 1000;

        const savedRules = st.worldRules.slice();
        const savedWeather = st.weather;

        // --- (1) buildStateSnapshot serialisiert worldRules (definierende Felder) ---
        st.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], { everySec: 3 }], { source: "human" });
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 3, ttlSec: 60 }], {
            source: "nexus",
        });
        const snap = r.buildStateSnapshot();
        out.snapSerializes =
            Array.isArray(snap.worldRules) &&
            snap.worldRules.length === 2 &&
            JSON.stringify(snap.worldRules[0].cond) === JSON.stringify(["weather_is", "rainy"]) &&
            snap.worldRules[0].source === "human" &&
            snap.worldRules[1].source === "nexus" &&
            // NUR definierende Felder, KEINE Laufzeit-Akkus
            snap.worldRules[0].fires === undefined &&
            snap.worldRules[0]._sig === undefined &&
            snap.worldRules[0].born === undefined;

        // --- (2) loadState-Restore: frische Akkus, korrekte Felder ---
        st.worldRules.length = 0;
        r._loadStateRestoreWorldRules(snap);
        const rr = st.worldRules;
        // die Gesetze des Gemüts stehen in jeder geladenen Welt (`_gemuetGesetze`, affekt.K2) — hinter den geladenen
        out.restoreWorks =
            rr.length === 2 + AnazhRealm.EMOTION_AXES.length &&
            rr.slice(2).every((g) => /^emotion:/.test(g.source) && g.pinned) &&
            JSON.stringify(rr[0].cond) === JSON.stringify(["weather_is", "rainy"]) &&
            rr[0].source === "human" &&
            rr[0].fires === 0 &&
            typeof rr[0]._sig === "string" &&
            now() - rr[0].born < 5 &&
            rr[0].ttlSec == null && // Mensch-Regel: permanent
            rr[1].ttlSec === 60; // Nexus-Regel: ttl erhalten

        // --- (3) eine RESTAURIERTE Regel feuert (sie ist voll funktional) ---
        // Isoliert auf die Mensch-Regel (rainy→sunny) — sonst überschriebe die
        // mit-restaurierte Nexus-Regel (random_chance→rainy) das Ergebnis im Tick.
        st.worldRules = [rr[0]];
        st.weather = "rainy";
        rr[0].lastFired = -Infinity;
        r._tickWorldRules(now());
        out.restoredFires = st.weather === "sunny";

        // --- (4) Dedup beim Restore (zweimal dieselbe Regel → ein Eintrag) ---
        const dupSnap = {
            worldRules: [
                {
                    cond: ["weather_is", "rainy"],
                    effect: ["weather", "sunny"],
                    everySec: 3,
                    source: "human",
                    ttlSec: null,
                },
                {
                    cond: ["weather_is", "rainy"],
                    effect: ["weather", "sunny"],
                    everySec: 3,
                    source: "human",
                    ttlSec: null,
                },
            ],
        };
        r._loadStateRestoreWorldRules(dupSnap);
        out.restoreDedup = st.worldRules.filter((g) => g.source === "human").length === 1;

        // --- (5) alter Save ohne worldRules → no-op (state bleibt) ---
        st.worldRules = [{ id: 999, cond: ["x"], effect: ["y"], source: "human" }];
        r._loadStateRestoreWorldRules({}); // kein worldRules-Feld
        out.oldSaveNoop = st.worldRules.length === 1 && st.worldRules[0].id === 999;

        // --- (6) fuseWorlds: die Regel-Saetze werden VEREINIGT (Union + Dedup) ---
        const ruleX = { cond: ["weather_is", "rainy"], effect: ["weather", "sunny"], everySec: 3, source: "human" };
        const ruleY = {
            cond: ["field_below", "lebendig", 0.3],
            effect: ["deposit_life", ["at_player"]],
            everySec: 3,
            source: "human",
        };
        const saveA = { worldRules: [ruleX] };
        const saveB = { worldRules: [ruleY, ruleX] }; // ruleX ist Duplikat
        const merged = r._fusionMergeWorldRules(saveA, saveB);
        out.mergeUnions =
            merged.length === 2 && // X + Y, das doppelte X dedupt
            merged.some((m) => JSON.stringify(m.cond) === JSON.stringify(["weather_is", "rainy"])) &&
            merged.some((m) => JSON.stringify(m.cond) === JSON.stringify(["field_below", "lebendig", 0.3]));

        // restore
        st.worldRules = savedRules;
        st.weather = savedWeather;
        return out;
    });

    check(
        "Persistenz: buildStateSnapshot serialisiert worldRules (nur definierende Felder, keine Akkus)",
        res.snapSerializes
    );
    check("Persistenz: loadState-Restore stellt die Regeln her (frische Akkus, ttl erhalten)", res.restoreWorks);
    check("Persistenz: eine RESTAURIERTE Regel ist voll funktional (feuert rainy → sunny)", res.restoredFires);
    check("Persistenz: der Restore dedupt (zweimal dieselbe Regel → ein Eintrag)", res.restoreDedup);
    check("Persistenz: ein alter Save OHNE worldRules → no-op (state bleibt)", res.oldSaveNoop);
    check(
        "Bibliothek: fuseWorlds VEREINIGT die Regel-Saetze (Union + Dedup — eine Welt IST ihr Regel-Satz)",
        res.mergeUnions
    );
}

async function checkBandRing8({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Multi-Welt-Verwaltung ###
    // Daten-Plane: Index, Per-Welt-Key, createNewWorld, switchToWorld, deleteWorld, Migration,
    // Player-Übernahme — mit reload:false, damit alle Pfade in einer Session laufen (Reload = UI).
    const ring8Results = await safeEvaluate(page, () => {
        const out = {};

        // Schema-Version-Bump (Zeiger, Index, Platz und Legacy-Migration fährt gate:boot-rettung am echten Boot)
        out.schemaIsMultiworld = st.worldMeta.schemaVersion === "8.0-multiworld-v1";
        const activeId = st.worldMeta.worldId;

        // DIE GEBURT ERBT NICHTS (Positiv-Liste): die alte Welt trägt jedes Identitäts-Feld (Anker, Edits,
        // Dorf-Zellen, Ring- und Vorschau-Stempel, Erbgut, Saat, Rolle, Bann-Liste …) — der leere Snapshot der neuen Welt
        // darf davon keins tragen, nur die Wahl des Schöpfers (visibility, creator). Die alte Welt steht dafür nur
        // synchron in state.worldMeta (kein Takt dazwischen), danach wieder die echte.
        {
            const echt = st.worldMeta;
            st.worldMeta = Object.assign({}, echt, {
                macro: { massivC: { x: 1, z: 2 } },
                voxelEdits: [{ x: 1, y: 2, z: 3, r: 2, mode: "carve" }],
                settlementCells: { start: { x: 0, z: 0 } },
                genesisPortalRing: true,
                portalPreviewFachwerk: true,
                erbgut: { terme: [{ art: "wildnis" }] },
                saat: [{ dsl: "x" }],
                role: "host",
                hostInfo: { peerId: "p" },
                banList: { peerIds: ["p"], vibePassKeys: [] },
                guestRights: "frieden",
                worldAddress: "anazh://alt",
                regionsActive: true,
                currentRegionKey: "r0_0",
                visibility: "privat",
                creator: "local",
            });
            let leer = null;
            try {
                leer = r._buildEmptyWorldSnapshot(r._generateFreshWorldMeta("test-erbe"), false);
            } finally {
                st.worldMeta = echt;
            }
            const NEU = new Set(["worldId", "slug", "bornAt", "seed", "genVersion", "variantSeed"]);
            const SCHNAPPSCHUSS = new Set(["parentWorlds", "bauSame", "schemaVersion", "gameMode"]);
            const POSITIV = new Set(["visibility", "creator"]);
            const wmNeu = (leer && leer.worldMeta) || {};
            out.geborenGeerbt = Object.keys(wmNeu).filter(
                (k) => wmNeu[k] !== undefined && !NEU.has(k) && !SCHNAPPSCHUSS.has(k) && !POSITIV.has(k)
            );
            out.geborenPositiv = wmNeu.visibility === "privat" && wmNeu.creator === "local";
        }
        // DIE EMPFÄNGER-WAND DES ERBGUTS (docs/taille-spec.md §3): ohne Feld [wildnis]; eine unbekannte Term-Art, ein
        // Grund-Term nicht zuerst, eine fehlende Zahl werfen (fail-closed, nie still Wildnis).
        {
            const wirft = (roh) => {
                try {
                    window.__gelaendeCore.erbgutNormal(roh);
                    return "";
                } catch (e) {
                    return String(e.message);
                }
            };
            out.erbgutWand = {
                ohne: JSON.stringify(window.__gelaendeCore.erbgutNormal(undefined)) === '[{"art":"wildnis"}]',
                unbekannt: /unbekannte Term-Art/.test(wirft({ terme: [{ art: "vulkan" }] })),
                grundZuerst: /nur der erste Term/.test(
                    wirft({
                        terme: [
                            {
                                art: "rampe",
                                x: 0,
                                z: 0,
                                richtung: 0,
                                breite: 9,
                                lauf: 9,
                                krone: 1,
                                winkel: 9,
                                boeschung: 45,
                            },
                        ],
                    })
                ),
                zahl: /keine Zahl/.test(wirft({ terme: [{ art: "insel", x: 0 }] })),
            };
        }
        // DIE TÜREN DES ERBGUTS (`_erbgutEinlass`, Gegenprüfung 10.10.): eine Welt mit einer Term-Art, die dieser Build
        // nicht trägt, betritt den Speicher nie — weder über das Welt-Tor (daneben) noch als Einladung noch als
        // Snapshot eines Mitspielers; Index, Zeiger der aktiven Welt und die lebende Welt bleiben.
        {
            const fremd = () => ({
                worldMeta: {
                    worldId: "w-tuer-korridor",
                    slug: "tuer-korridor",
                    erbgut: { terme: [{ art: "korridor" }] },
                },
            });
            const index0 = r.worldsIndexLoad().length;
            const zeiger0 = r.activeWorldGet();
            const welt0 = st.worldMeta;
            const p2pRolle0 = st.p2p.role;
            const daneben = r.importWorldBeside(fremd());
            const gast = r._importGuestWorld(fremd(), { url: "ws://127.0.0.1:1", roomId: "w-tuer-korridor" }, null);
            st.p2p.pendingWorldSnapshot = true;
            const mitspieler = r._p2pApplyWorldSnapshot("tuer-peer", fremd());
            out.erbgutTueren = {
                daneben: daneben && daneben.ok === false && /unbekannte Term-Art/.test(daneben.reason),
                gast: gast === null,
                mitspieler: mitspieler && mitspieler.ok === false && /unbekannte Term-Art/.test(mitspieler.reason),
                index: r.worldsIndexLoad().length === index0,
                zeiger: r.activeWorldGet() === zeiger0,
                welt: st.worldMeta === welt0 && st.p2p.role === p2pRolle0,
                gespeichert: localStorage.getItem(r.worldStorageKey("w-tuer-korridor")) === null,
            };
            st.p2p.pendingWorldSnapshot = false;
        }

        // createNewWorld (ohne Reload) erzeugt eine neue Welt im Index.
        // Ziel: Ring-8-Invarianten ohne page-reload prüfbar.
        const beforeCount = r.worldsIndexLoad().length;
        const newId = r.createNewWorld({ slug: "test-zweite", inheritPlayer: false, reload: false });
        out.newWorldCreated = typeof newId === "string" && newId !== activeId;
        const idx2 = r.worldsIndexLoad();
        out.indexGrewByOne = idx2.length === beforeCount + 1;
        out.newWorldInIndex = !!idx2.find((e) => e.worldId === newId && e.slug === "test-zweite");
        // state.worldMeta bleibt auf der alten (kein Reload; den Zeiger prüft die Ablage selbst, `_weltAblegen`)
        out.stateWorldMetaUnchanged = st.worldMeta.worldId === activeId;

        // Slug-Unique: weitere Welt mit demselben Slug bekommt Suffix -2.
        const newId2 = r.createNewWorld({ slug: "test-zweite", inheritPlayer: false, reload: false });
        const idx3 = r.worldsIndexLoad();
        const newEntry2 = idx3.find((e) => e.worldId === newId2);
        out.slugUniqueWithSuffix =
            !!newEntry2 && /^test-zweite(-\d+)?$/.test(newEntry2.slug) && newEntry2.slug !== "test-zweite";

        // Player-Übernahme: aktueller Spieler-Soul + Tools wandern (ALTLASTEN-
        // NULL: der getragene Wolf-Körper — custom soul — reist mit).
        r.applyPlayerSoul("wolf");
        // Phantasy-eigenes Tool im player-Inventory damit Übernahme prüfbar
        if (!st.tools["übernahme-marker"]) {
            st.tools["übernahme-marker"] = {
                name: "übernahme-marker",
                label: "Übernahme-Marker",
                opClass: "schneiden",
                opName: "test",
                precisionCap: 0.6,
                builtIn: false,
                sourceBlueprint: null,
            };
            st.player.tools.push("übernahme-marker");
        }
        const inheritId = r.createNewWorld({ slug: "test-mit-person", inheritPlayer: true, reload: false });
        const inheritSave = JSON.parse(localStorage.getItem(r.worldStorageKey(inheritId)) || "{}");
        out.inheritCarriesPlayerSoul = inheritSave.playerSoul === "bp_koerper_wolf";
        out.inheritCarriesPlayerTools =
            Array.isArray(inheritSave.playerTools) && inheritSave.playerTools.includes("übernahme-marker");
        out.inheritCarriesOwnTools =
            Array.isArray(inheritSave.tools) && inheritSave.tools.some((t) => t && t.name === "übernahme-marker");
        // Frische Welt: keine Übernahme = leere Spieler-Tools (nur Starter beim Init aufgesetzt)
        const freshId = r.createNewWorld({ slug: "test-fresh", inheritPlayer: false, reload: false });
        const freshSave = JSON.parse(localStorage.getItem(r.worldStorageKey(freshId)) || "{}");
        out.freshNoInheritedSoul = freshSave.playerSoul === "human";
        out.freshNoInheritedTools = Array.isArray(freshSave.playerTools) && freshSave.playerTools.length === 0;

        // Voxel ist permanent + irreversibel: createNewWorld setzt worldMeta.voxelTerrain=true, auch ein
        // explizites voxelTerrain:false wird ignoriert (Parameter entfernt + Sanitizer-Zwang).
        const voxelId = r.createNewWorld({ slug: "test-voxel-welt", reload: false });
        const voxelSave = JSON.parse(localStorage.getItem(r.worldStorageKey(voxelId)) || "{}");
        out.voxelWorldFlagSet = !!(voxelSave.worldMeta && voxelSave.worldMeta.voxelTerrain === true);
        const classicId = r.createNewWorld({
            slug: "test-heightfield-welt",
            reload: false,
            voxelTerrain: false,
        });
        const classicSave = JSON.parse(localStorage.getItem(r.worldStorageKey(classicId)) || "{}");
        out.optOutForcedToVoxel = !!(classicSave.worldMeta && classicSave.worldMeta.voxelTerrain === true);

        // switchToWorld auf eine existierende Welt (der Wechsel samt Reload: gate:boot-rettung „mehrere")
        r.switchToWorld(newId, { reload: false });
        // Switch auf unbekannte Welt scheitert sauber
        out.switchToUnknownFails = r.switchToWorld("does-not-exist-123", { reload: false }) === false;
        // Switch auf aktive Welt ist noop = true
        out.switchToActiveIsNoop = r.switchToWorld(newId, { reload: false }) === true;

        // deleteWorld entfernt nur Nicht-Aktive
        // Stell sicher, dass die aktive Welt nicht freshId ist
        r.activeWorldSet(activeId);
        out.cantDeleteActive = r.deleteWorld(activeId) === false;
        const beforeDelete = r.worldsIndexLoad().length;
        const delOk = r.deleteWorld(freshId);
        out.deleteReturnedTrue = delOk === true;
        const afterDelete = r.worldsIndexLoad();
        out.indexShrunkByOne = afterDelete.length === beforeDelete - 1;
        out.deletedSaveGone = localStorage.getItem(r.worldStorageKey(freshId)) === null;

        // Aufräumen: alle Test-Welten weg, active zurück auf Original
        r.activeWorldSet(activeId);
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== activeId) r.deleteWorld(e.worldId);
        }

        return out;
    });
    if (erreichbar(check, "Ring 8: Snapshot erreichbar", ring8Results)) {
        check("Ring 8: Schema-Version ist 8.0-multiworld-v1", ring8Results.schemaIsMultiworld);
        check(
            "Ring 8: eine neue Welt erbt kein Identitäts-Feld der alten (Positiv-Liste visibility · creator)",
            Array.isArray(ring8Results.geborenGeerbt) && ring8Results.geborenGeerbt.length === 0,
            `geerbt: ${(ring8Results.geborenGeerbt || ["?"]).join(", ") || "—"}`
        );
        check("Ring 8: die Positiv-Liste reist (visibility, creator)", ring8Results.geborenPositiv === true);
        const ew = ring8Results.erbgutWand || {};
        check(
            "Erbgut: ohne Feld [wildnis]; unbekannte Term-Art, Grund nicht zuerst, fehlende Zahl werfen (fail-closed)",
            ew.ohne === true && ew.unbekannt === true && ew.grundZuerst === true && ew.zahl === true,
            JSON.stringify(ew)
        );
        const et = ring8Results.erbgutTueren || {};
        check(
            "Erbgut: keine Tür lässt ein fremdes Erbgut ein (Welt-Tor, Einladung, Mitspieler) — Index, Zeiger, Welt bleiben",
            ["daneben", "gast", "mitspieler", "index", "zeiger", "welt", "gespeichert"].every((k) => et[k] === true),
            JSON.stringify(et)
        );
        check("Ring 8: createNewWorld liefert neue worldId", ring8Results.newWorldCreated);
        check("Ring 8: Index wächst um eins nach createNewWorld", ring8Results.indexGrewByOne);
        check("Ring 8: Neue Welt im Index mit slug", ring8Results.newWorldInIndex);
        check("Ring 8: state.worldMeta bleibt bis Reload alt", ring8Results.stateWorldMetaUnchanged);
        check("Ring 8: Slug-Kollision bekommt -N Suffix", ring8Results.slugUniqueWithSuffix);
        check("Ring 8: Person-Übernahme transportiert Seele", ring8Results.inheritCarriesPlayerSoul);
        check("Ring 8: Person-Übernahme transportiert player.tools", ring8Results.inheritCarriesPlayerTools);
        check("Ring 8: Person-Übernahme transportiert eigene Tools", ring8Results.inheritCarriesOwnTools);
        check("Ring 8: Frische Welt hat default Spieler-Seele", ring8Results.freshNoInheritedSoul);
        check("Ring 8: Frische Welt hat leeres playerTools", ring8Results.freshNoInheritedTools);
        check("Voxel V9.23 Phase 5a: eine neue Welt ist per Default voxel-basiert", ring8Results.voxelWorldFlagSet);
        check(
            "Voxel V9.35 Phase 5c.2.c.2: voxelTerrain:false-Argument wird ignoriert (Opt-out ist tot, immer Voxel)",
            ring8Results.optOutForcedToVoxel
        );
        check("Ring 8: switchToWorld auf unbekannte ID scheitert sauber", ring8Results.switchToUnknownFails);
        check("Ring 8: switchToWorld auf aktive Welt ist noop=true", ring8Results.switchToActiveIsNoop);
        check("Ring 8: deleteWorld lehnt aktive Welt ab", ring8Results.cantDeleteActive);
        check("Ring 8: deleteWorld liefert true für andere", ring8Results.deleteReturnedTrue);
        check("Ring 8: Index schrumpft um eins nach delete", ring8Results.indexShrunkByOne);
        check("Ring 8: Per-Welt-Save nach delete weg", ring8Results.deletedSaveGone);
    }

    // ### Multi-Welt-Verwaltung: UI ###
    const ring8UiResults = await safeEvaluate(page, () => {
        const out = {};
        // die "Andere Welten" sind in den rechten Schöpfen-Block vereint (3er-Block + Picker-Liste),
        // die eigene #world-picker-section entfiel — der Picker lebt als #world-picker-list.
        out.pickerSectionInDom = !!document.querySelector(".feed-schoepfen #world-picker-list");
        out.newWorldBtnInDom = !!document.getElementById("world-new");
        // Rendern mit zwei Test-Welten und prüfen, dass UI sie zeigt
        r.createNewWorld({ slug: "test-ui-eins", inheritPlayer: false, reload: false });
        r.createNewWorld({ slug: "test-ui-zwei", inheritPlayer: false, reload: false });
        r.activeWorldSet(st.worldMeta.worldId);
        r._renderWorldPicker();
        const list = document.getElementById("world-picker-list");
        const rows = list ? list.querySelectorAll(".world-picker-row") : [];
        out.pickerRendersOthers = rows.length >= 2;
        let foundUiEins = false;
        let foundUiZwei = false;
        for (const row of rows) {
            const t = row.textContent || "";
            if (t.includes("test-ui-eins")) foundUiEins = true;
            if (t.includes("test-ui-zwei")) foundUiZwei = true;
        }
        out.pickerShowsBothSlugs = foundUiEins && foundUiZwei;
        // Aktive Welt ist NICHT in der „Andere Welten"-Liste
        out.pickerHidesActive = !Array.from(rows).some((row) => (row.textContent || "").includes(st.worldMeta.slug));
        // Cleanup
        const activeId = st.worldMeta.worldId;
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== activeId) r.deleteWorld(e.worldId);
        }
        return out;
    });
    if (erreichbar(check, "Ring 8 UI: Snapshot erreichbar", ring8UiResults)) {
        check("Ring 8 UI: der Welt-Picker lebt im rechten Schöpfen-Block (V18.73)", ring8UiResults.pickerSectionInDom);
        check("Ring 8 UI: #world-new Button im DOM", ring8UiResults.newWorldBtnInDom);
        check("Ring 8 UI: Picker rendert andere Welten als Zeilen", ring8UiResults.pickerRendersOthers);
        check("Ring 8 UI: Beide Slugs sichtbar", ring8UiResults.pickerShowsBothSlugs);
        check("Ring 8 UI: Aktive Welt nicht in Andere-Welten-Liste", ring8UiResults.pickerHidesActive);
    }

    // ### Per-Welt-Seed ###
    // Jede Welt trägt ihren Seed in worldMeta; SimplexNoise wird damit gefüttert → verschiedene Welten
    // liefern verschiedene Geometrie.
    const ring81Results = await safeEvaluate(page, () => {
        const out = {};

        const oldSeed = st.worldMeta.seed;
        out.activeHasSeed = typeof oldSeed === "string" && oldSeed.length > 0;

        // Zwei neue Welten parallel anlegen, ohne Reload, und ihre
        // gespeicherten Seeds aus dem Per-Welt-Save lesen.
        const aId = r.createNewWorld({ slug: "seed-a", inheritPlayer: false, reload: false });
        const bId = r.createNewWorld({ slug: "seed-b", inheritPlayer: false, reload: false });
        const aSave = JSON.parse(localStorage.getItem(r.worldStorageKey(aId)) || "{}");
        const bSave = JSON.parse(localStorage.getItem(r.worldStorageKey(bId)) || "{}");
        const seedA = aSave.worldMeta && aSave.worldMeta.seed;
        const seedB = bSave.worldMeta && bSave.worldMeta.seed;
        out.newWorldAHasSeed = typeof seedA === "string" && seedA.length > 0;
        out.newWorldBHasSeed = typeof seedB === "string" && seedB.length > 0;
        out.seedsAreDifferent = seedA !== seedB;
        out.newWorldsDifferFromActive = seedA !== oldSeed && seedB !== oldSeed;
        out.newWorldSeedShape = /^w-[a-z0-9]+-[a-z0-9]+$/.test(seedA || "");

        // parentWorlds bleibt leer (Ring 10 erst)
        out.newWorldHasNoParents =
            Array.isArray(aSave.worldMeta.parentWorlds) && aSave.worldMeta.parentWorlds.length === 0;

        // Genesis-Journal-Eintrag wurde beim Anlegen geschrieben
        out.newWorldHasGenesisJournal =
            aSave.worldJournal &&
            Array.isArray(aSave.worldJournal.entries) &&
            aSave.worldJournal.entries[0] &&
            aSave.worldJournal.entries[0].type === "genesis" &&
            aSave.worldJournal.entries[0].text &&
            aSave.worldJournal.entries[0].text.includes("seed-a");
        out.genesisCtxHasSeed =
            aSave.worldJournal.entries[0].ctx && typeof aSave.worldJournal.entries[0].ctx.seed === "string";

        // Architekturen sind im neuen Save leer (keine Übernahme!)
        out.newWorldArchitecturesEmpty = Array.isArray(aSave.architectures) && aSave.architectures.length === 0;
        out.newWorldCreaturesEmpty = Array.isArray(aSave.creatures) && aSave.creatures.length === 0;
        out.newWorldDslHistoryEmpty = Array.isArray(aSave.dslHistory) && aSave.dslHistory.length === 0;
        out.newWorldPathBucketsEmpty = aSave.playerPathBuckets === null;
        out.newWorldEmotionsZero = aSave.playerEmotions && Object.values(aSave.playerEmotions).every((v) => v === 0);

        // Über MEHRERE Sample-Punkte muss mindestens einer differieren; steepness/baseHeight sind gleich,
        // der Unterschied liegt NUR am Seed.
        if (typeof SimplexNoise === "function") {
            const nA = new SimplexNoise(seedA);
            const nB = new SimplexNoise(seedB);
            let anyDiffers = false;
            for (let i = 0; i < 8 && !anyDiffers; i++) {
                const x = (i + 1) * 3.7;
                const z = (i + 1) * 5.1;
                if (Math.abs(nA.noise2D(x, z) - nB.noise2D(x, z)) > 1e-6) anyDiffers = true;
            }
            out.noiseSamplesDiffer = anyDiffers;
        } else {
            out.noiseSamplesDiffer = "SimplexNoise nicht verfügbar";
        }

        // Aufräumen
        const keepId = st.worldMeta.worldId;
        r.activeWorldSet(keepId);
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== keepId) r.deleteWorld(e.worldId);
        }
        return out;
    });
    if (erreichbar(check, "Ring 8.1: Snapshot erreichbar", ring81Results)) {
        check("Ring 8.1: Aktive Welt trägt einen Seed", ring81Results.activeHasSeed);
        check("Ring 8.1: Neue Welt A hat eigenen Seed", ring81Results.newWorldAHasSeed);
        check("Ring 8.1: Neue Welt B hat eigenen Seed", ring81Results.newWorldBHasSeed);
        check("Ring 8.1: Zwei neue Welten haben verschiedene Seeds", ring81Results.seedsAreDifferent);
        check("Ring 8.1: Neue Welt-Seeds differieren vom aktiven", ring81Results.newWorldsDifferFromActive);
        check("Ring 8.1: Neuer Seed im Format w-<id>-<rand>", ring81Results.newWorldSeedShape);
        check("Ring 8.1: Neue Welt parentWorlds = []", ring81Results.newWorldHasNoParents);
        check("Ring 8.1: Neue Welt hat Genesis-Journal-Eintrag mit slug", ring81Results.newWorldHasGenesisJournal);
        check("Ring 8.1: Genesis-ctx trägt Seed", ring81Results.genesisCtxHasSeed);
        check("Ring 8.1: Neue Welt hat keine Architekturen", ring81Results.newWorldArchitecturesEmpty);
        check("Ring 8.1: Neue Welt hat keine Kreaturen", ring81Results.newWorldCreaturesEmpty);
        check("Ring 8.1: Neue Welt hat leere DSL-History", ring81Results.newWorldDslHistoryEmpty);
        check("Ring 8.1: Neue Welt hat keine Pfad-Buckets", ring81Results.newWorldPathBucketsEmpty);
        check("Ring 8.1: Neue Welt hat Emotionen auf 0", ring81Results.newWorldEmotionsZero);
        check(
            "Ring 8.1: SimplexNoise(seedA) ≠ SimplexNoise(seedB) (Terrain differiert)",
            ring81Results.noiseSamplesDiffer === true
        );
    }

    // ### Status-Bar-Welt + der Erst-Spawn ### (der Lage-Rundlauf über echte Boots: gate:persistence (T))
    const ring82Results = await safeEvaluate(page, () => {
        const out = {};

        // Ein leerer createNewWorld-Snapshot (playerPosition:null) zählt NICHT als generiert: das Flag bleibt
        // false, die Position unangetastet → der Reload fährt den Genesis-Erst-Spawn (offener Punkt +
        // Plattform).
        const emptySnap = r._buildEmptyWorldSnapshot(
            { worldId: "test-genesis-pre-spawn", slug: "test-genesis", bornAt: Date.now(), seed: "s-test" },
            false
        );
        out.emptySnapHasNoPosition = emptySnap.playerPosition === null;
        const savedPos = st.playerMesh ? st.playerMesh.position.clone() : null;
        st.terrainEverGenerated = false;
        // BÜHNE: der Reset-Wert vor dem Restore (Speicher-Mechanik)
        if (st.playerMesh) st.playerMesh.position.set(7, 8, 9);
        r._loadStateRestorePlayerPosition(emptySnap);
        out.emptySnapKeepsFirstSpawn = st.terrainEverGenerated === false;
        out.emptySnapKeepsPosition = st.playerMesh && Math.abs(st.playerMesh.position.x - 7) < 0.01;
        // Lauf-Zustand zurück: die Welt IST generiert + Position restauriert.
        st.terrainEverGenerated = true;
        if (savedPos && st.playerMesh) st.playerMesh.position.copy(savedPos);

        // Status-Bar zeigt aktuelle Welt
        const slugEl = document.getElementById("status-slug");
        out.statusSlugInDom = !!slugEl;
        // Label muss "Welt" sein (umbenannt von "Slug")
        const labelText = slugEl ? slugEl.previousElementSibling.textContent : "";
        out.statusLabelIsWelt = labelText === "Welt";
        // Tick den Status-Panel-Update
        r.updateStatusPanel(performance.now() / 1000);
        out.statusSlugShowsActiveWorld = slugEl && slugEl.textContent === (st.worldMeta.slug || "—");

        return out;
    });
    if (erreichbar(check, "Ring 8.2: Snapshot erreichbar", ring82Results)) {
        check("leerer Welt-Snapshot trägt playerPosition:null", ring82Results.emptySnapHasNoPosition);
        check(
            "Save ohne playerPosition lässt terrainEverGenerated false (Erst-Spawn-Pfad)",
            ring82Results.emptySnapKeepsFirstSpawn
        );
        check("Save ohne playerPosition bewegt den Spieler nicht", ring82Results.emptySnapKeepsPosition);
        check("Ring 8.2: #status-slug im DOM", ring82Results.statusSlugInDom);
        check("Ring 8.2: Status-Bar-Label heißt 'Welt'", ring82Results.statusLabelIsWelt);
        check("Ring 8.2: Status-Bar zeigt aktive Welt-Slug", ring82Results.statusSlugShowsActiveWorld);
    }
}

async function checkBandRing9to10({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welt-Tor (Drei-Wahl-Import-Dialog) ###
    // Reload-UI indirekt über Daten-Methoden: importWorldBeside (Index-Eintrag + Per-Welt-Save mit
    // parentWorlds-Spur), Dialog-Markup im DOM, _openWeltTorDialog setzt pendingImport, Esc/cancel räumt.
    const ring9Results = await safeEvaluate(page, () => {
        const out = {};

        // Dialog-Markup im DOM (der Fusion-Knopf: klickbar)
        out.domFehlt = ["dialog", "replace", "beside", "cancel", "summary"].filter(
            (n) => !document.getElementById("world-tor-" + n)
        );
        out.fuseBtnEnabled = document.getElementById("world-tor-fuse").disabled === false;

        // Daten-Pfad: importWorldBeside ohne Reload
        const originalSrcId = "src-world-aaaaaaaa";
        const importedSnapshot = {
            // BÜHNE: Daten eines Import-Schnappschusses, kein gesetzter Ort
            playerPosition: { x: 12, y: 7, z: 34 },
            worldMeta: {
                worldId: originalSrcId,
                slug: "test-fremd",
                bornAt: Date.now() - 86400000 * 3,
                seed: "fremd-seed-xyz",
                parentWorlds: [],
                schemaVersion: "8.0-multiworld-v1",
            },
            worldJournal: {
                entries: [{ id: 1, at: Date.now() - 86400000 * 3, tick: 0, type: "genesis", text: "Original" }],
                seen: { genesis: true },
            },
            architectures: [],
            blueprints: [],
            materials: [],
            tools: [],
            playerTools: [],
            playerSoul: "human",
        };
        const beforeCount = r.worldsIndexLoad().length;
        const result = r.importWorldBeside(importedSnapshot, { reload: false });
        out.besideReturnedOk = !!(result && result.ok);
        out.besideReturnedNewWorldId = result.worldId && result.worldId !== originalSrcId;
        out.besideReturnedSlug = result.slug === "test-fremd";
        out.indexGrewByOne = r.worldsIndexLoad().length === beforeCount + 1;
        // Per-Welt-Save geschrieben
        const newSave = JSON.parse(localStorage.getItem(r.worldStorageKey(result.worldId)) || "{}");
        out.newSaveHasOwnWorldId = newSave.worldMeta && newSave.worldMeta.worldId === result.worldId;
        out.newSaveKeepsSeed = newSave.worldMeta && newSave.worldMeta.seed === "fremd-seed-xyz";
        out.newSaveTracksParent =
            Array.isArray(newSave.worldMeta.parentWorlds) && newSave.worldMeta.parentWorlds.includes(originalSrcId);
        out.newSaveSchemaIsTor = newSave.worldMeta.schemaVersion === "9.0-tor-v1";
        // Journal hat den Witness-Eintrag
        const witnessEntry =
            newSave.worldJournal &&
            Array.isArray(newSave.worldJournal.entries) &&
            newSave.worldJournal.entries.find((e) => e.type === "witness");
        out.newSaveHasWitnessEntry = !!witnessEntry && /neben/.test(witnessEntry.text);
        out.witnessEntryHasProvenance =
            witnessEntry && witnessEntry.ctx && witnessEntry.ctx.fromWorldId === originalSrcId;
        // Aktive Welt wurde NICHT umgeleitet
        out.activeUnchanged = r.activeWorldGet() === st.worldMeta.worldId;
        out.activeNotImport = r.activeWorldGet() !== result.worldId;

        // Slug-Kollision: nochmal mit gleichem Slug importieren
        const result2 = r.importWorldBeside(importedSnapshot, { reload: false });
        out.collisionResolved = result2.ok && /^test-fremd(-\d+)?$/.test(result2.slug) && result2.slug !== "test-fremd";

        // _openWeltTorDialog setzt pendingImport
        r._openWeltTorDialog(importedSnapshot, { name: "test.json", size: 100 });
        out.pendingImportSet = !!(st.pendingImport && st.pendingImport.parsed);
        // Cancel räumt pendingImport
        r._closeWeltTorDialog();
        out.pendingClearedAfterCancel = st.pendingImport === null;

        // _weltTorImportBeside ohne pendingImport ist no-op (ein Wurf bräche die ganze Probe)
        st.pendingImport = null;
        r._weltTorImportBeside();

        // Eine importierte Welt OHNE worldJournal bekommt trotzdem einen Witness-Eintrag (nie still
        // überspringen, wenn cloned.worldJournal fehlt).
        const journalless = {
            worldMeta: { worldId: "no-journal-src", slug: "test-stumm", bornAt: Date.now() },
        };
        const journallessResult = r.importWorldBeside(journalless, { reload: false });
        if (journallessResult.ok) {
            const noJsSave = JSON.parse(localStorage.getItem(r.worldStorageKey(journallessResult.worldId)) || "{}");
            out.journallessGetsWitness =
                noJsSave.worldJournal &&
                Array.isArray(noJsSave.worldJournal.entries) &&
                noJsSave.worldJournal.entries.some((e) => e.type === "witness");
        } else {
            out.journallessGetsWitness = false;
        }

        // Aufräumen: alle Test-Welten weg
        const keepId = st.worldMeta.worldId;
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== keepId) r.deleteWorld(e.worldId);
        }
        return out;
    });
    if (erreichbar(check, "Ring 9: Snapshot erreichbar", ring9Results)) {
        check(
            "Ring 9: #world-tor-* Dialog, Knöpfe und Summary im DOM",
            !ring9Results.domFehlt.length,
            ring9Results.domFehlt
        );
        check("Ring 9: Fusion-Button ist klickbar (mit Ring 10)", ring9Results.fuseBtnEnabled);
        check("Ring 9: importWorldBeside liefert ok=true", ring9Results.besideReturnedOk);
        check("Ring 9: importWorldBeside vergibt neue worldId", ring9Results.besideReturnedNewWorldId);
        check("Ring 9: importWorldBeside behält slug (ohne Kollision)", ring9Results.besideReturnedSlug);
        check("Ring 9: Index wächst um eins nach besiding", ring9Results.indexGrewByOne);
        check("Ring 9: Per-Welt-Save hat neue worldId", ring9Results.newSaveHasOwnWorldId);
        check("Ring 9: Per-Welt-Save behält Source-Seed", ring9Results.newSaveKeepsSeed);
        check("Ring 9: parentWorlds trägt Original-ID", ring9Results.newSaveTracksParent);
        check("Ring 9: Save-Schema-Version 9.0-tor-v1", ring9Results.newSaveSchemaIsTor);
        check("Ring 9: Witness-Journal-Eintrag in importierter Welt", ring9Results.newSaveHasWitnessEntry);
        check("Ring 9: Witness-Eintrag hat Provenance im ctx", ring9Results.witnessEntryHasProvenance);
        check("Ring 9: Aktive Welt bleibt nach besiding aktiv", ring9Results.activeUnchanged);
        check("Ring 9: Importierte Welt ist nicht aktiv geworden", ring9Results.activeNotImport);
        check("Ring 9: Slug-Kollision wird via -N aufgelöst", ring9Results.collisionResolved);
        check("Ring 9: _openWeltTorDialog setzt pendingImport", ring9Results.pendingImportSet);
        check("Ring 9: Cancel räumt pendingImport auf", ring9Results.pendingClearedAfterCancel);
        check(
            "Ring 9: Import ohne worldJournal bekommt trotzdem Witness-Eintrag (Bugfix)",
            ring9Results.journallessGetsWitness
        );
    }

    // ### Welt-Fusion ###
    // Diskrimination: zwei Eltern mit JE einer eindeutigen Sache (Material, Bauplan, Emotion) — die
    // Fusion trägt beide, die drei Strategien zeigen unterscheidbare Emotion-Aggregation.
    const ring10Results = await safeEvaluate(page, () => {
        const out = {};

        // Dialog + Stammbaum-DOM (Dialog und Eltern-B-Dropdown liest die Dialog-Probe unten)
        out.fusionStrategyRadios = document.querySelectorAll('input[name="fusion-strategy"]').length === 3;
        out.domFehlt = ["world-fusion-confirm", "world-fuse-open"].filter((n) => !document.getElementById(n));
        // Bib: der Stammbaum-Samen blüht jetzt im "Diese Welt"-Eiland (.feed-self), nicht mehr
        // in einer eigenen #world-lineage-section (die wanderte ins Eiland; V9.56-i — Test wandert mit).
        out.lineageSectionInDom = !!document.querySelector(".feed-self #world-lineage");

        // Setup: zwei Eltern-Welten mit eindeutigen Inventaren bauen.
        const parentAId = r.createNewWorld({
            slug: "fusion-parent-a",
            inheritPlayer: false,
            reload: false,
        });
        const parentBId = r.createNewWorld({
            slug: "fusion-parent-b",
            inheritPlayer: false,
            reload: false,
        });
        // Direkt in die Per-Welt-Saves schreiben (ohne reload),
        // damit Parent-Saves spezifische Inhalte tragen.
        const saveA = JSON.parse(localStorage.getItem(r.worldStorageKey(parentAId)));
        saveA.materials = [{ name: "quarz-fein", label: "Quarz fein", color: "#fff", tags: { resoniert: 0.9 } }];
        saveA.playerEmotions = { joy: 0.9, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        saveA.dslHistory = [{ id: 1, fitness: 0.8, program: ["weather", "sunny"] }];
        localStorage.setItem(r.worldStorageKey(parentAId), JSON.stringify(saveA));
        const saveB = JSON.parse(localStorage.getItem(r.worldStorageKey(parentBId)));
        saveB.blueprints = [
            {
                name: "tempel-besonderer",
                label: "Tempel",
                parts: [
                    __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                ],
                connections: [],
            },
        ];
        saveB.playerEmotions = { joy: 0, awe: 0.9, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        saveB.dslHistory = [{ id: 1, fitness: 0.7, program: ["weather", "rainy"] }];
        localStorage.setItem(r.worldStorageKey(parentBId), JSON.stringify(saveB));

        // Strategie SEQUENZ
        const seqResult = r.fuseWorlds(parentAId, parentBId, "sequence", {
            slug: "test-seq",
            reload: false,
        });
        out.seqOk = seqResult.ok;
        const seqSave = seqResult.ok ? JSON.parse(localStorage.getItem(r.worldStorageKey(seqResult.worldId))) : null;
        out.seqHasBothInventories =
            !!seqSave &&
            seqSave.materials.some((m) => m.name === "quarz-fein") &&
            seqSave.blueprints.some((b) => b.name === "tempel-besonderer");
        out.seqEmotionFromA =
            !!seqSave && Math.abs(seqSave.playerEmotions.joy - 0.9) < 0.01 && seqSave.playerEmotions.awe === 0;
        out.seqHistoryConcatenated = !!seqSave && seqSave.dslHistory.length === 2;
        out.seqParentWorlds =
            !!seqSave &&
            Array.isArray(seqSave.worldMeta.parentWorlds) &&
            seqSave.worldMeta.parentWorlds.length === 2 &&
            seqSave.worldMeta.parentWorlds.includes(parentAId) &&
            seqSave.worldMeta.parentWorlds.includes(parentBId);
        out.seqSchemaFusion = !!seqSave && seqSave.worldMeta.schemaVersion === "10.0-fusion-v1";
        out.seqGenesisJournal =
            !!seqSave &&
            seqSave.worldJournal.entries[0] &&
            seqSave.worldJournal.entries[0].type === "genesis" &&
            /fusion-parent-a.*fusion-parent-b/.test(seqSave.worldJournal.entries[0].text);
        out.seqFusionStrategyInMeta = !!seqSave && seqSave.worldMeta.fusionStrategy === "sequence";

        // Strategie TAG-MERGE
        const tagResult = r.fuseWorlds(parentAId, parentBId, "tag-merge", {
            slug: "test-tag",
            reload: false,
        });
        const tagSave = tagResult.ok ? JSON.parse(localStorage.getItem(r.worldStorageKey(tagResult.worldId))) : null;
        out.tagEmotionUnion =
            !!tagSave &&
            Math.abs(tagSave.playerEmotions.joy - 0.9) < 0.01 &&
            Math.abs(tagSave.playerEmotions.awe - 0.9) < 0.01;
        out.tagHasBothInventories =
            !!tagSave &&
            tagSave.materials.some((m) => m.name === "quarz-fein") &&
            tagSave.blueprints.some((b) => b.name === "tempel-besonderer");

        // Strategie RANDOM-MIX
        const mixResult = r.fuseWorlds(parentAId, parentBId, "random-mix", {
            slug: "test-mix",
            reload: false,
        });
        const mixSave = mixResult.ok ? JSON.parse(localStorage.getItem(r.worldStorageKey(mixResult.worldId))) : null;
        out.mixEmotionAverage =
            !!mixSave &&
            Math.abs(mixSave.playerEmotions.joy - 0.45) < 0.01 &&
            Math.abs(mixSave.playerEmotions.awe - 0.45) < 0.01;

        // Fehlerpfade
        const sameId = r.fuseWorlds(parentAId, parentAId, "sequence", { reload: false });
        out.rejectsSameId = sameId.ok === false;
        const badStrategy = r.fuseWorlds(parentAId, parentBId, "nonsense", { reload: false });
        out.rejectsBadStrategy = badStrategy.ok === false;
        const missingId = r.fuseWorlds("does-not-exist", parentBId, "sequence", { reload: false });
        out.rejectsMissingParent = missingId.ok === false;

        // Stammbaum-Render-Pfad: aktive Welt hat keine parentWorlds,
        // also sollte _renderWorldLineage „eigenständig"-Hinweis zeigen.
        r._renderWorldLineage();
        const lineageNow = document.getElementById("world-lineage").textContent;
        out.lineageShowsStandalone = /eigenständig/.test(lineageNow);

        // _openWorldFusionDialog mit preselectB füllt Dropdown
        r._openWorldFusionDialog({ preselectB: parentBId });
        const sel = document.getElementById("world-fusion-parent-b");
        out.dialogOpen = document.getElementById("world-fusion-dialog").hasAttribute("open");
        out.parentBDropdownHasEntries = sel.options.length >= 2;
        out.parentBPreselected = Array.from(sel.options).some((o) => o.value === parentBId && o.selected);
        r._closeWorldFusionDialog();
        out.dialogClosed = !document.getElementById("world-fusion-dialog").hasAttribute("open");

        // ### Rename-Cascade-Regression ###
        // Beide Eltern haben Bauplan „kollidierer“; der von B wird „kollidierer-fusion“ — Tool.sourceBlueprint
        // und fractal.part.refName MÜSSEN mitumbenannt werden, sonst dangling.
        const cascadeAId = r.createNewWorld({ slug: "cascade-a", inheritPlayer: false, reload: false });
        const cascadeBId = r.createNewWorld({ slug: "cascade-b", inheritPlayer: false, reload: false });
        const cA = JSON.parse(localStorage.getItem(r.worldStorageKey(cascadeAId)));
        cA.blueprints = [
            {
                name: "kollidierer",
                label: "A-Version",
                parts: [
                    __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                ],
                connections: [],
            },
        ];
        localStorage.setItem(r.worldStorageKey(cascadeAId), JSON.stringify(cA));
        const cB = JSON.parse(localStorage.getItem(r.worldStorageKey(cascadeBId)));
        cB.blueprints = [
            {
                name: "kollidierer",
                label: "B-Version",
                parts: [
                    __teil("sphere", "quarz", 0, 0, 0, 1, 1, 1),
                ],
                connections: [],
                role: "tool",
                toolMeta: { opName: "B-Hammer", opClass: "form_geben" },
            },
            {
                name: "fraktal-B",
                label: "Fraktal",
                parts: [{ shape: "blueprint", refName: "kollidierer", position: { x: 0, y: 0, z: 0 } }],
                connections: [],
            },
        ];
        cB.tools = [
            {
                name: "b-hammer",
                label: "B-Hammer",
                opClass: "form_geben",
                opName: "smithing",
                precisionCap: 0.7,
                sourceBlueprint: "kollidierer",
            },
        ];
        localStorage.setItem(r.worldStorageKey(cascadeBId), JSON.stringify(cB));
        const cascadeResult = r.fuseWorlds(cascadeAId, cascadeBId, "sequence", { reload: false });
        const cascadeSave = cascadeResult.ok
            ? JSON.parse(localStorage.getItem(r.worldStorageKey(cascadeResult.worldId)))
            : null;
        out.cascadeFusionOk = !!cascadeResult.ok;
        out.cascadeKeepsAOriginal =
            !!cascadeSave && cascadeSave.blueprints.some((bp) => bp.name === "kollidierer" && bp.label === "A-Version");
        out.cascadeRenamesB =
            !!cascadeSave &&
            cascadeSave.blueprints.some((bp) => bp.name === "kollidierer-fusion" && bp.label === "B-Version");
        // CASCADE: B's Werkzeug muss jetzt auf "kollidierer-fusion" zeigen
        out.cascadeRewiredTool =
            !!cascadeSave &&
            cascadeSave.tools.some((t) => t.name === "b-hammer" && t.sourceBlueprint === "kollidierer-fusion");
        // CASCADE: B's fraktaler Bauplan muss refName upgedatet haben
        const fractal = cascadeSave && cascadeSave.blueprints.find((bp) => bp.name === "fraktal-B");
        out.cascadeRewiredRefName = !!fractal && fractal.parts.some((p) => p.refName === "kollidierer-fusion");

        // Cleanup
        const keepId = st.worldMeta.worldId;
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== keepId) r.deleteWorld(e.worldId);
        }
        return out;
    });
    if (erreichbar(check, "Ring 10: Snapshot erreichbar", ring10Results)) {
        check(
            "Ring 10: Verschmelzen-Knöpfe (Dialog, Bibliothek) im DOM",
            !ring10Results.domFehlt.length,
            ring10Results.domFehlt
        );
        check("Ring 10: Drei Strategie-Radios im DOM", ring10Results.fusionStrategyRadios);
        check(
            "Ring 10: Stammbaum-Samen blüht im 'Diese Welt'-Eiland (.feed-self, V18.71)",
            ring10Results.lineageSectionInDom
        );
        check("Ring 10: Sequenz-Fusion liefert ok=true", ring10Results.seqOk);
        check("Ring 10: Sequenz-Fusion vereint beide Inventare", ring10Results.seqHasBothInventories);
        check("Ring 10: Sequenz übernimmt Emotion aus A", ring10Results.seqEmotionFromA);
        check("Ring 10: Sequenz-History konkateniert A+B", ring10Results.seqHistoryConcatenated);
        check("Ring 10: parentWorlds = [A, B]", ring10Results.seqParentWorlds);
        check("Ring 10: Schema 10.0-fusion-v1", ring10Results.seqSchemaFusion);
        check("Ring 10: Genesis-Journal-Eintrag nennt beide Eltern", ring10Results.seqGenesisJournal);
        check("Ring 10: fusionStrategy in worldMeta gespeichert", ring10Results.seqFusionStrategyInMeta);
        check("Ring 10: Tag-Merge bildet Emotion-MAX (Vereinigung)", ring10Results.tagEmotionUnion);
        check("Ring 10: Tag-Merge vereint beide Inventare", ring10Results.tagHasBothInventories);
        check("Ring 10: Random-Mix bildet Emotion-Mittel (0.45)", ring10Results.mixEmotionAverage);
        check("Ring 10: gleiche Eltern-ID wird abgewiesen", ring10Results.rejectsSameId);
        check("Ring 10: unbekannte Strategie wird abgewiesen", ring10Results.rejectsBadStrategy);
        check("Ring 10: fehlende Eltern-Welt wird abgewiesen", ring10Results.rejectsMissingParent);
        check("Ring 10: Stammbaum zeigt 'eigenständig' wenn keine Eltern", ring10Results.lineageShowsStandalone);
        check("Ring 10: Fusion-Dialog öffnet via _open*", ring10Results.dialogOpen);
        check("Ring 10: Eltern-B-Dropdown hat Einträge", ring10Results.parentBDropdownHasEntries);
        check("Ring 10: preselectB markiert die richtige Option", ring10Results.parentBPreselected);
        check("Ring 10: Fusion-Dialog schließt via _close*", ring10Results.dialogClosed);
        check("Ring 10 Bugfix: Fusion mit Bauplan-Kollision läuft durch", ring10Results.cascadeFusionOk);
        check("Ring 10 Bugfix: A's Original-Bauplan behält Namen", ring10Results.cascadeKeepsAOriginal);
        check("Ring 10 Bugfix: B's Bauplan bekommt -fusion-Suffix", ring10Results.cascadeRenamesB);
        check(
            "Ring 10 Bugfix: Werkzeug.sourceBlueprint folgt Rename (kein dangling tool)",
            ring10Results.cascadeRewiredTool
        );
        check(
            "Ring 10 Bugfix: fraktaler Bauplan.part.refName folgt Rename (kein dangling fractal)",
            ring10Results.cascadeRewiredRefName
        );
    }

    // ### Rezepte aus anderer Welt holen (ohne Fusion) ###
    // `importRecipesFromWorld(sourceId)` kopiert Baupläne + Materialien + Werkzeuge der Quelle in die
    // aktive Welt; Konflikte bekommen `-import`-Suffix, Cross-Refs (sourceBlueprint, refName) folgen.
    const recipeResults = await safeEvaluate(page, () => {
        const out = {};

        const srcId = r.createNewWorld({ slug: "recipe-source", inheritPlayer: false, reload: false });
        const srcSave = JSON.parse(localStorage.getItem(r.worldStorageKey(srcId)));
        srcSave.blueprints = [
            {
                name: "fremder-altar",
                label: "Fremder Altar",
                parts: [
                    __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                ],
                connections: [],
            },
            {
                name: "fremder-hammer-bp",
                label: "Fremder Hammer (Bauplan)",
                parts: [
                    __teil("cylinder", "eisen", 0, 0, 0, 1, 1, 1),
                ],
                connections: [],
                role: "tool",
                // Der Import läuft durch dieselbe Wand wie der Save-Restore (TOOL_OP_CLASSES + opName-Pattern) →
                // das Test-Werkzeug braucht eine VALIDE opClass.
                toolMeta: { opName: "fremder-hammer", opClass: "plastic" },
            },
            {
                name: "fremder-fraktal",
                label: "Fremder Fraktal",
                parts: [{ shape: "blueprint", refName: "fremder-altar", position: { x: 2, y: 0, z: 0 } }],
                connections: [],
            },
        ];
        srcSave.materials = [{ name: "rosa-quarz", label: "Rosa Quarz", color: "#fbb", tags: { resoniert: 0.8 } }];
        srcSave.tools = [
            {
                name: "fremder-hammer",
                label: "Fremder Hammer",
                // Ω3: valide opClass (siehe toolMeta-Kommentar oben).
                opClass: "plastic",
                opName: "smithing",
                precisionCap: 0.85,
                sourceBlueprint: "fremder-hammer-bp",
            },
        ];
        localStorage.setItem(r.worldStorageKey(srcId), JSON.stringify(srcSave));

        const beforeBPCount = Object.keys(st.blueprints).length;
        const beforeMatCount = Object.keys(st.materials).length;
        const beforeToolCount = Object.keys(st.tools).length;

        const result = r.importRecipesFromWorld(srcId);
        out.importOk = result.ok === true;
        out.importCounts =
            result.ok && result.counts.blueprints === 3 && result.counts.materials === 1 && result.counts.tools === 1;
        out.bpAddedToState = !!st.blueprints["fremder-altar"];
        out.materialAdded = !!st.materials["rosa-quarz"];
        out.toolAdded = !!st.tools["fremder-hammer"];
        const altar = st.blueprints["fremder-altar"];
        out.bpContentPreserved = !!altar && altar.parts.length === 1 && altar.parts[0].shape === "box";
        out.activeWorldStillSame = st.worldMeta.worldId !== srcId && r.activeWorldGet() !== srcId;
        const j = st.worldJournal && st.worldJournal.entries;
        out.witnessEntryWritten =
            Array.isArray(j) &&
            j.some((e) => e.type === "witness" && e.text && e.text.includes("Rezepte aus „recipe-source"));
        out.bpStateGrew = Object.keys(st.blueprints).length - beforeBPCount === 3;
        out.matStateGrew = Object.keys(st.materials).length - beforeMatCount === 1;
        out.toolStateGrew = Object.keys(st.tools).length - beforeToolCount === 1;

        const result2 = r.importRecipesFromWorld(srcId);
        out.secondImportOk = result2.ok === true;
        out.collisionAddsImportSuffix = !!st.blueprints["fremder-altar-import"];
        const fraktalImport = st.blueprints["fremder-fraktal-import"];
        out.fractalRefRewired =
            !!fraktalImport &&
            fraktalImport.parts &&
            fraktalImport.parts.some((p) => p.refName === "fremder-altar-import");
        const hammerImport = st.tools["fremder-hammer-import"];
        out.toolRefRewired = !!hammerImport && hammerImport.sourceBlueprint === "fremder-hammer-bp-import";

        const noId = r.importRecipesFromWorld("");
        out.rejectsEmptyId = !noId.ok;
        const activeId = st.worldMeta.worldId;
        const selfImport = r.importRecipesFromWorld(activeId);
        out.rejectsSelfImport = !selfImport.ok;
        const ghostImport = r.importRecipesFromWorld("does-not-exist-xxx");
        out.rejectsGhostId = !ghostImport.ok;

        r._renderWorldPicker();
        const pickerRows = document.querySelectorAll("#world-picker-list .world-picker-row");
        let hasRecipesBtn = false;
        for (const row of pickerRows) {
            for (const b of row.querySelectorAll("button")) {
                if (b.textContent === "Rezepte holen") {
                    hasRecipesBtn = true;
                    break;
                }
            }
        }
        out.uiHasRecipesBtn = hasRecipesBtn;

        delete st.blueprints["fremder-altar"];
        delete st.blueprints["fremder-altar-import"];
        delete st.blueprints["fremder-hammer-bp"];
        delete st.blueprints["fremder-hammer-bp-import"];
        delete st.blueprints["fremder-fraktal"];
        delete st.blueprints["fremder-fraktal-import"];
        delete st.materials["rosa-quarz"];
        delete st.materials["rosa-quarz-import"];
        delete st.tools["fremder-hammer"];
        delete st.tools["fremder-hammer-import"];
        // Workshop-DOM neu rendern, damit nachfolgende Tests
        // keine Geister-Einträge sehen.
        r._renderWorkshopDOM();
        const keepId = st.worldMeta.worldId;
        for (const e of r.worldsIndexLoad()) {
            if (e.worldId !== keepId) r.deleteWorld(e.worldId);
        }
        return out;
    });
    if (erreichbar(check, "Ring 10.1: Snapshot erreichbar", recipeResults)) {
        check("Ring 10.1: importRecipesFromWorld liefert ok=true", recipeResults.importOk);
        check("Ring 10.1: counts = {3 Baupläne, 1 Material, 1 Werkzeug}", recipeResults.importCounts);
        check("Ring 10.1: Bauplan in aktiver Welt verfügbar", recipeResults.bpAddedToState);
        check("Ring 10.1: Material in aktiver Welt verfügbar", recipeResults.materialAdded);
        check("Ring 10.1: Werkzeug in aktiver Welt verfügbar", recipeResults.toolAdded);
        check("Ring 10.1: Bauplan-Inhalt 1:1 erhalten (keine Manipulation)", recipeResults.bpContentPreserved);
        check("Ring 10.1: Aktive Welt-Identität unverändert", recipeResults.activeWorldStillSame);
        check("Ring 10.1: Witness-Journal-Eintrag geschrieben", recipeResults.witnessEntryWritten);
        check("Ring 10.1: state.blueprints wächst um 3", recipeResults.bpStateGrew);
        check("Ring 10.1: state.materials wächst um 1", recipeResults.matStateGrew);
        check("Ring 10.1: state.tools wächst um 1", recipeResults.toolStateGrew);
        check("Ring 10.1: Konflikt bekommt -import-Suffix", recipeResults.collisionAddsImportSuffix);
        check("Ring 10.1: Fraktaler refName folgt Rename (kein dangling fractal)", recipeResults.fractalRefRewired);
        check("Ring 10.1: Werkzeug.sourceBlueprint folgt Rename (kein dangling tool)", recipeResults.toolRefRewired);
        check("Ring 10.1: leere ID wird abgewiesen", recipeResults.rejectsEmptyId);
        check("Ring 10.1: Self-Import wird abgewiesen", recipeResults.rejectsSelfImport);
        check("Ring 10.1: unbekannte Quell-ID wird abgewiesen", recipeResults.rejectsGhostId);
        check("Ring 10.1: 'Rezepte holen'-Button im Welt-Picker", recipeResults.uiHasRecipesBtn);
    }
}

async function checkBandTranslatorAndUntrusted({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### KI-Übersetzer Phase 1 — fremde Welt → Portal-Manifest ###
    const translatorResults = await safeEvaluate(page, async () => {
        const out = {};
        st.customWorlds = {};
        // _buildTranslatorPrompt nennt das Manifest-Schema.
        const prompt = r._buildTranslatorPrompt();
        out.promptNamesSchema =
            typeof prompt === "string" &&
            prompt.includes('"id"') &&
            prompt.includes('"label"') &&
            prompt.includes('"dsl"');
        // _parseManifestResponse — REIN DATEN, kein LLM nötig.
        const p1 = r._parseManifestResponse('{"id":"voxelwelt","label":"Voxel","dsl":["place_block"]}');
        out.parseClean = !!p1 && p1.id === "voxelwelt";
        const p2 = r._parseManifestResponse('```json\n{"id":"x","label":"X"}\n```');
        out.parseFenced = !!p2 && p2.id === "x";
        const p3 = r._parseManifestResponse('<think>ich überlege ...</think>{"id":"y","label":"Y"}');
        out.parseThink = !!p3 && p3.id === "y";
        out.parseGarbage = r._parseManifestResponse("ich bin kein json") === null;
        out.parseArray = r._parseManifestResponse("[1,2,3]") === null;
        // translateWorldManifest — llmCall stubben (kein API-Key im Headless).
        const origLlm = r.llmCall;
        try {
            r.llmCall = async () => ({
                say: "",
                program: null,
                raw: JSON.stringify({
                    id: "voxel-traum",
                    label: "Voxel-Traum",
                    desc: "Eine Voxel-Sandbox mit Wetter.",
                    dsl: ["place_block", "set_weather"],
                }),
            });
            // Zu kurze Beschreibung → vor dem LLM abgelehnt.
            const tooShort = await r.translateWorldManifest("kurz");
            out.rejectsTooShort = tooShort.ok === false && tooShort.reason === "description_too_short";
            // Gültige Übersetzung → sanitiertes Vorschau-Manifest.
            const tr = await r.translateWorldManifest("Eine Voxel-Sandbox mit Wetter und Block-Bauen.");
            out.translateOk =
                tr.ok === true &&
                !!tr.manifest &&
                tr.manifest.id === "voxel-traum" &&
                /^worlds\//.test(tr.manifest.world || "");
            // Übersetzer-UI-Pfad: _runTranslator füllt #translator-review.
            const inp = document.getElementById("translator-input");
            if (inp) inp.value = "Eine Voxel-Sandbox mit Wetter und Block-Bauen.";
            await r._runTranslator();
            const review = document.getElementById("translator-review");
            out.runTranslatorRendersReview =
                !!review && review.hidden === false && !!review.querySelector(".translator-review-title");
            // Übersetztes Manifest, das eine Built-in-id wählt → abgelehnt.
            r.llmCall = async () => ({ raw: JSON.stringify({ id: "fluid", label: "X" }) });
            const builtinId = await r.translateWorldManifest("Eine Welt namens fluid.");
            out.rejectsBuiltinId = builtinId.ok === false && builtinId.reason === "id_is_builtin";
            // LLM-Antwort ohne Manifest → no_manifest_in_response.
            r.llmCall = async () => ({ raw: "Tut mir leid, ich weiss es nicht." });
            const noManifest = await r.translateWorldManifest("Eine vage Welt ohne Form.");
            out.rejectsNoManifest = noManifest.ok === false && noManifest.reason === "no_manifest_in_response";
        } finally {
            r.llmCall = origLlm;
        }
        // acceptTranslatedManifest — committet in customWorlds.
        const acc = r.acceptTranslatedManifest({
            id: "voxel-traum",
            label: "Voxel-Traum",
            desc: "Eine Voxel-Sandbox.",
            dsl: ["place_block"],
        });
        const stored = st.customWorlds && st.customWorlds["voxel-traum"];
        out.acceptCommits =
            acc.ok === true &&
            acc.id === "voxel-traum" &&
            !!stored &&
            stored.translated === true &&
            stored.reachable === false;
        // _sanitizeImportedManifest bewahrt das translated-Feld.
        const reSan = r._sanitizeImportedManifest(stored);
        out.sanitizePreservesTranslated = !!reSan && reSan.translated === true;
        // localStorage-Rundlauf — die übersetzte Welt überlebt.
        const reloaded = r._loadCustomWorlds();
        out.roundtripKeepsTranslated = !!reloaded["voxel-traum"] && reloaded["voxel-traum"].translated === true;
        // _worldEntry + _libraryWorlds umfassen die übersetzte Welt.
        out.worldEntryMerged = !!r._worldEntry("voxel-traum") && r._libraryWorlds().some((w) => w.id === "voxel-traum");
        // obtainPortalForWorld verweigert die übersetzte Welt (kein totes Portal).
        const ob = r.obtainPortalForWorld("voxel-traum");
        out.obtainRefusesTranslated = ob.ok === false && ob.reason === "world_unreachable";
        // renderLibraryUI rendert eine „KI-übersetzt"-Karte.
        r.renderLibraryUI();
        out.uiTranslatedCard =
            !!document.querySelector("#library-list .library-card-translated") &&
            !!document.querySelector("#library-list .library-translated-mark");
        // UI: Übersetzer-Sektion im DOM.
        out.uiTranslatorSection =
            !!document.getElementById("translator-input") &&
            !!document.getElementById("translator-run") &&
            !!document.getElementById("translator-review");
        // Aufräumen.
        st.customWorlds = {};
        r._saveCustomWorlds();
        const cleanReview = document.getElementById("translator-review");
        if (cleanReview) {
            cleanReview.hidden = true;
            cleanReview.innerHTML = "";
        }
        const cleanInput = document.getElementById("translator-input");
        if (cleanInput) cleanInput.value = "";
        r.renderLibraryUI();
        return out;
    });

    if (erreichbar(check, "KI-Übersetzer: Phase-1-Tests laufen", translatorResults)) {
        check(
            "KI-Übersetzer: _buildTranslatorPrompt nennt das Manifest-Schema (id/label/dsl)",
            translatorResults.promptNamesSchema
        );
        check("KI-Übersetzer: _parseManifestResponse liest sauberes JSON", translatorResults.parseClean);
        check(
            "KI-Übersetzer: _parseManifestResponse liest JSON aus einem Markdown-Fence",
            translatorResults.parseFenced
        );
        check(
            "KI-Übersetzer: _parseManifestResponse strippt <think>-Reasoning + liest das JSON danach",
            translatorResults.parseThink
        );
        check(
            "KI-Übersetzer: _parseManifestResponse liefert null bei Müll (kein JSON)",
            translatorResults.parseGarbage
        );
        check(
            "KI-Übersetzer: _parseManifestResponse liefert null bei einem JSON-Array (kein Objekt)",
            translatorResults.parseArray
        );
        check(
            "KI-Übersetzer: translateWorldManifest lehnt eine zu kurze Beschreibung ab",
            translatorResults.rejectsTooShort
        );
        check(
            "KI-Übersetzer: translateWorldManifest liefert ein sanitiertes Vorschau-Manifest",
            translatorResults.translateOk
        );
        check(
            "KI-Übersetzer: _runTranslator rendert den KI-Vorschlag im Review-Bereich",
            translatorResults.runTranslatorRendersReview
        );
        check("KI-Übersetzer: translateWorldManifest lehnt eine Built-in-id ab", translatorResults.rejectsBuiltinId);
        check(
            "KI-Übersetzer: translateWorldManifest meldet no_manifest_in_response bei einer LLM-Antwort ohne Manifest",
            translatorResults.rejectsNoManifest
        );
        check(
            "KI-Übersetzer: acceptTranslatedManifest committet in customWorlds (translated:true, reachable:false)",
            translatorResults.acceptCommits
        );
        check(
            "KI-Übersetzer: _sanitizeImportedManifest bewahrt das translated-Feld",
            translatorResults.sanitizePreservesTranslated
        );
        check(
            "KI-Übersetzer: eine übersetzte Welt überlebt den localStorage-Rundlauf",
            translatorResults.roundtripKeepsTranslated
        );
        check(
            "KI-Übersetzer: _worldEntry + _libraryWorlds umfassen die übersetzte Welt",
            translatorResults.worldEntryMerged
        );
        check(
            "KI-Übersetzer: obtainPortalForWorld verweigert eine übersetzte Welt (kein totes Portal)",
            translatorResults.obtainRefusesTranslated
        );
        check("KI-Übersetzer: renderLibraryUI rendert eine 'KI-übersetzt'-Karte", translatorResults.uiTranslatedCard);
        check(
            "KI-Übersetzer: Übersetzer-Sektion (Eingabe + Knopf + Review) im DOM",
            translatorResults.uiTranslatorSection
        );
    }

    // ### KI-Übersetzer Phase 2 — die Welt bekommt einen Körper ###
    const transl2Results = await safeEvaluate(page, async () => {
        const out = {};
        out.constant = AnazhRealm.PORTAL_TRANSLATED_WORLD === "worlds/translated/index.html";
        st.customWorlds = {};
        // _buildSceneTranslatorPrompt nennt das Szenen-Schema.
        const prompt = r._buildSceneTranslatorPrompt();
        out.promptNamesSchema =
            typeof prompt === "string" &&
            prompt.includes('"sky"') &&
            prompt.includes('"ground"') &&
            prompt.includes('"objects"') &&
            prompt.includes('"dslEffects"');
        // _sanitizeWorldScene — IMMER eine gültige Szene, REIN DATEN.
        const empty = r._sanitizeWorldScene({});
        out.sanitizeDefault =
            !!empty &&
            /^#[0-9a-f]{6}$/.test(empty.sky.top) &&
            ["flat", "hills", "water", "void"].indexOf(empty.ground.style) >= 0 &&
            Array.isArray(empty.objects);
        out.sanitizeGarbage = !!r._sanitizeWorldScene("kaputt") && !!r._sanitizeWorldScene(null);
        // Clamps: schlechte Farbe → Default-Hex, Objekte gedeckelt, Licht geklemmt.
        const big = [];
        for (let i = 0; i < 100; i++) big.push({ shape: "box", color: "#112233" });
        const clamped = r._sanitizeWorldScene({
            sky: { top: "keinhex", bottom: "#ff0000" },
            light: { intensity: 99 },
            objects: big,
        });
        out.sanitizeClamps =
            clamped.sky.top === "#2a3a6a" &&
            clamped.sky.bottom === "#ff0000" &&
            clamped.light.intensity === 2 &&
            clamped.objects.length === 14;
        // dslEffects: op-förmige Schlüssel bleiben, Müll-Schlüssel fallen.
        const eff = r._sanitizeWorldScene({
            dslEffects: { good_op: { burst: 5 }, "BAD OP": { burst: 5 } },
        });
        out.sanitizeDslEffects = !!eff.dslEffects.good_op && eff.dslEffects["BAD OP"] === undefined;
        // translateWorldScene — llmCall stubben.
        const origLlm = r.llmCall;
        try {
            r.llmCall = async () => ({
                raw: JSON.stringify({
                    sky: { top: "#102040", bottom: "#88aacc" },
                    fog: "#aabbcc",
                    ground: { color: "#3a7a3a", style: "hills" },
                    light: { color: "#ffffff", intensity: 1.2 },
                    objects: [{ shape: "box", color: "#8a6a3a", count: 30, area: 50, size: 3, spin: true }],
                    ambient: { kind: "motes", color: "#ffffff" },
                    dslEffects: { set_weather: { sky: "#222244", fogShift: 0.4, burst: 10 } },
                }),
            });
            const ts = await r.translateWorldScene({
                id: "x",
                label: "Voxel-Bau",
                desc: "Eine Voxel-Welt.",
                dsl: ["set_weather"],
            });
            out.translateSceneOk = ts.ok === true && !!ts.scene && ts.scene.ground.style === "hills";
            // buildTranslatedWorld — eine übersetzte Welt aufbauen.
            r.acceptTranslatedManifest({
                id: "voxel-bau",
                label: "Voxel-Bau",
                desc: "Eine Voxel-Welt mit Wetter.",
                dsl: ["set_weather", "place_block"],
            });
            out.beforeBuildNotReachable = st.customWorlds["voxel-bau"].reachable === false;
            const bw = await r.buildTranslatedWorld("voxel-bau");
            const built = st.customWorlds["voxel-bau"];
            out.buildAttachesScene =
                bw.ok === true &&
                !!built.scene &&
                built.reachable === true &&
                built.world === "worlds/translated/index.html";
            out.buildUnknownRejected = (await r.buildTranslatedWorld("nirgendwo")).reason === "world_unknown";
            // Eine nicht-übersetzte Welt lässt sich nicht aufbauen.
            st.customWorlds["plain-w"] = {
                id: "plain-w",
                label: "Plain",
                world: "worlds/skeleton/index.html",
                dsl: [],
                reachable: true,
            };
            out.buildNonTranslatedRejected = (await r.buildTranslatedWorld("plain-w")).reason === "not_translated";
            delete st.customWorlds["plain-w"];
            // translateWorldScene → no_scene_in_response bei Müll.
            r.llmCall = async () => ({ raw: "ich weiss es nicht" });
            out.translateSceneNoScene =
                (await r.translateWorldScene({ id: "x", label: "X", desc: "egal egal" })).reason ===
                "no_scene_in_response";
        } finally {
            r.llmCall = origLlm;
        }
        // _sanitizeImportedManifest bewahrt die Szene.
        const reSan = r._sanitizeImportedManifest(st.customWorlds["voxel-bau"]);
        out.sanitizeKeepsScene = !!reSan && !!reSan.scene && reSan.scene.ground.style === "hills";
        // localStorage-Rundlauf — die aufgebaute Welt überlebt.
        const reloaded = r._loadCustomWorlds();
        out.roundtripKeepsScene =
            !!reloaded["voxel-bau"] && !!reloaded["voxel-bau"].scene && reloaded["voxel-bau"].reachable === true;
        // obtainPortalForWorld holt jetzt die AUFGEBAUTE übersetzte Welt.
        const ob = r.obtainPortalForWorld("voxel-bau");
        const portalBp = st.blueprints["portal_voxel-bau"];
        out.obtainBuilt =
            ob.ok === true &&
            !!portalBp &&
            !!portalBp.portalMeta &&
            portalBp.portalMeta.world === "worlds/translated/index.html" &&
            portalBp.portalMeta.translatedWorldId === "voxel-bau";
        // _sanitizePortalMeta bewahrt translatedWorldId.
        const sm = r._sanitizePortalMeta(
            { world: "worlds/translated/index.html", label: "X", translatedWorldId: "voxel-bau" },
            "X"
        );
        out.portalMetaKeepsId = sm.translatedWorldId === "voxel-bau";
        // buildStateSnapshot/loadState — translatedWorldId überlebt.
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b && b.name === "portal_voxel-bau");
        out.snapKeepsId = !!snapBp && !!snapBp.portalMeta && snapBp.portalMeta.translatedWorldId === "voxel-bau";
        delete st.blueprints["portal_voxel-bau"];
        r.loadState({ blueprints: snapBp ? [snapBp] : [] });
        const reBp = st.blueprints["portal_voxel-bau"];
        out.loadKeepsId = !!reBp && !!reBp.portalMeta && reBp.portalMeta.translatedWorldId === "voxel-bau";
        // _portalSendEnter trägt die Szene mit (Fake-Overlay).
        const savedPo = r._portalOverlay;
        let captured = null;
        r._portalOverlay = {
            translatedWorldId: "voxel-bau",
            iframe: { contentWindow: { postMessage: (m) => (captured = m) } },
        };
        r._portalSendEnter();
        r._portalOverlay = savedPo;
        out.enterCarriesScene = !!captured && captured.type === "enter" && !!captured.scene && !!captured.scene.ground;
        // renderLibraryUI: aufgebaute Welt → aktiver „Portal holen" + „neu aufbauen".
        r.renderLibraryUI();
        const builtCard = Array.from(document.querySelectorAll("#library-list .library-card")).find((c) =>
            /Voxel-Bau/.test(c.textContent)
        );
        out.uiBuiltCard =
            !!builtCard &&
            !!builtCard.querySelector(".library-rebuild") &&
            !builtCard.querySelector(".library-get[disabled]") &&
            !builtCard.querySelector(".library-build");
        // Eine NOCH NICHT aufgebaute übersetzte Welt → „Welt aufbauen".
        r.acceptTranslatedManifest({ id: "voxel-roh", label: "Voxel-Roh", desc: "Roh.", dsl: [] });
        r.renderLibraryUI();
        const rohCard = Array.from(document.querySelectorAll("#library-list .library-card")).find((c) =>
            /Voxel-Roh/.test(c.textContent)
        );
        out.uiBuildButton = !!rohCard && !!rohCard.querySelector(".library-build");
        // Aufräumen.
        st.customWorlds = {};
        r._saveCustomWorlds();
        delete st.blueprints["portal_voxel-bau"];
        for (let i = 0; i < st.player.inventory.length; i++) {
            const s = st.player.inventory[i];
            if (s && typeof s.blueprintName === "string" && s.blueprintName.indexOf("portal_voxel") === 0) {
                st.player.inventory[i] = null;
            }
        }
        r.renderLibraryUI();
        return out;
    });

    if (erreichbar(check, "KI-Übersetzer P2: Phase-2-Tests laufen", transl2Results)) {
        check("KI-Übersetzer P2: PORTAL_TRANSLATED_WORLD-Konstante", transl2Results.constant);
        check(
            "KI-Übersetzer P2: _buildSceneTranslatorPrompt nennt das Szenen-Schema",
            transl2Results.promptNamesSchema
        );
        check(
            "KI-Übersetzer P2: _sanitizeWorldScene liefert aus {} eine gültige Szene",
            transl2Results.sanitizeDefault
        );
        check("KI-Übersetzer P2: _sanitizeWorldScene ist crash-frei bei Müll/null", transl2Results.sanitizeGarbage);
        check(
            "KI-Übersetzer P2: _sanitizeWorldScene clampt Farbe + Objekt-Zahl + Licht",
            transl2Results.sanitizeClamps
        );
        check("KI-Übersetzer P2: _sanitizeWorldScene filtert dslEffects-Schlüssel", transl2Results.sanitizeDslEffects);
        check("KI-Übersetzer P2: translateWorldScene liefert eine sanitierte Szene", transl2Results.translateSceneOk);
        check(
            "KI-Übersetzer P2: translateWorldScene meldet no_scene_in_response bei Müll",
            transl2Results.translateSceneNoScene
        );
        check(
            "KI-Übersetzer P2: eine übersetzte Welt ist vor dem Aufbau nicht erreichbar",
            transl2Results.beforeBuildNotReachable
        );
        check(
            "KI-Übersetzer P2: buildTranslatedWorld heftet die Szene an + macht die Welt betretbar",
            transl2Results.buildAttachesScene
        );
        check(
            "KI-Übersetzer P2: buildTranslatedWorld lehnt eine unbekannte Welt ab",
            transl2Results.buildUnknownRejected
        );
        check(
            "KI-Übersetzer P2: buildTranslatedWorld lehnt eine nicht-übersetzte Welt ab",
            transl2Results.buildNonTranslatedRejected
        );
        check("KI-Übersetzer P2: _sanitizeImportedManifest bewahrt die Szene", transl2Results.sanitizeKeepsScene);
        check(
            "KI-Übersetzer P2: eine aufgebaute Welt überlebt den localStorage-Rundlauf",
            transl2Results.roundtripKeepsScene
        );
        check(
            "KI-Übersetzer P2: obtainPortalForWorld holt eine aufgebaute übersetzte Welt (Portal mit translatedWorldId)",
            transl2Results.obtainBuilt
        );
        check("KI-Übersetzer P2: _sanitizePortalMeta bewahrt translatedWorldId", transl2Results.portalMetaKeepsId);
        check(
            "KI-Übersetzer P2: translatedWorldId überlebt den buildStateSnapshot/loadState-Rundlauf",
            transl2Results.snapKeepsId && transl2Results.loadKeepsId
        );
        check(
            "KI-Übersetzer P2: _portalSendEnter trägt die deklarative Szene in die Sub-Welt",
            transl2Results.enterCarriesScene
        );
        check(
            "KI-Übersetzer P2: renderLibraryUI rendert 'Welt aufbauen' bzw. nach dem Aufbau 'Portal holen' + 'neu aufbauen'",
            transl2Results.uiBuildButton && transl2Results.uiBuiltCard
        );
    }

    // ### Untrusted-Welt-Tor: echte fremde Engine, null-origin ###
    const sandboxResults = await safeEvaluate(page, async () => {
        const out = {};
        const REG = AnazhRealm.WORLD_REGISTRY;
        // schwarm in der Registry, als sandboxed markiert.
        out.registryEntry =
            !!REG.schwarm &&
            REG.schwarm.trust === "sandboxed" &&
            typeof REG.schwarm.desc === "string" &&
            Array.isArray(REG.schwarm.dsl) &&
            REG.schwarm.dsl.length > 0;
        // Built-in-Welten bleiben trusted (kein sandboxed).
        out.builtinsTrusted =
            REG.skeleton.trust !== "sandboxed" && REG.fluid.trust !== "sandboxed" && REG.terrain.trust !== "sandboxed";
        // _sanitizePortalMeta: default trusted, bewahrt sandboxed, Müll → trusted.
        out.sanitizeTrust =
            r._sanitizePortalMeta({ world: "worlds/skeleton/index.html" }, "X").trust === "trusted" &&
            r._sanitizePortalMeta({ world: "worlds/schwarm/index.html", trust: "sandboxed" }, "X").trust ===
                "sandboxed" &&
            r._sanitizePortalMeta({ world: "worlds/skeleton/index.html", trust: "BÖSE" }, "X").trust === "trusted";
        // aimBlueprintAtWorld trägt die Vertrauensstufe in den Bauplan.
        r.cloneBlueprint("welt_portal", "_t_sb");
        r.aimBlueprintAtWorld("_t_sb", "schwarm");
        r.cloneBlueprint("welt_portal", "_t_tr");
        r.aimBlueprintAtWorld("_t_tr", "terrain");
        out.aimCarriesTrust =
            st.blueprints["_t_sb"].portalMeta.trust === "sandboxed" &&
            st.blueprints["_t_tr"].portalMeta.trust === "trusted";
        delete st.blueprints["_t_sb"];
        delete st.blueprints["_t_tr"];
        // obtainPortalForWorld holt die Schwarm-Welt.
        const ob = r.obtainPortalForWorld("schwarm");
        const pbp = st.blueprints["portal_schwarm"];
        out.obtainSchwarm =
            ob.ok === true &&
            !!pbp &&
            pbp.portalMeta.world === "worlds/schwarm/index.html" &&
            pbp.portalMeta.trust === "sandboxed";
        // _buildPortalOverlay: sandboxed → allow-scripts ALLEIN.
        r._buildPortalOverlay({
            world: "worlds/schwarm/index.html",
            label: "S",
            dsl: ["sturm"],
            trust: "sandboxed",
        });
        out.overlaySandboxAttr = r._portalOverlay.iframe.getAttribute("sandbox") === "allow-scripts";
        out.overlayTrustField = r._portalOverlay.trust === "sandboxed";
        r._disposePortalOverlay();
        // trusted → mit allow-same-origin + allow-pointer-lock (die
        // begehbare Welt fängt den Zeiger; sandboxed bleibt OHNE beides).
        r._buildPortalOverlay({ world: "worlds/skeleton/index.html", label: "T", dsl: null });
        out.overlayTrustedAttr = /allow-same-origin/.test(r._portalOverlay.iframe.getAttribute("sandbox"));
        out.overlayTrustedPointerLock = /allow-pointer-lock/.test(r._portalOverlay.iframe.getAttribute("sandbox"));
        r._disposePortalOverlay();
        // _portalSendEnter / _portalForwardDsl: targetOrigin "*" für null-origin.
        const savedPo = r._portalOverlay;
        let capEnter = null;
        let capDsl = null;
        r._portalOverlay = {
            trust: "sandboxed",
            iframe: { contentWindow: { postMessage: (m, o) => (capEnter = { m: m, o: o }) } },
        };
        r._portalSendEnter();
        r._portalOverlay.iframe.contentWindow.postMessage = (m, o) => (capDsl = { m: m, o: o });
        r._portalForwardDsl(["sturm"]);
        out.starForSandbox =
            !!capEnter && capEnter.o === "*" && capEnter.m.type === "enter" && !!capDsl && capDsl.o === "*";
        let capTrusted = null;
        r._portalOverlay = {
            trust: "trusted",
            iframe: { contentWindow: { postMessage: (m, o) => (capTrusted = { m: m, o: o }) } },
        };
        r._portalSendEnter();
        out.originForTrusted = !!capTrusted && capTrusted.o === window.location.origin;
        r._portalOverlay = savedPo;
        // buildStateSnapshot/loadState — trust überlebt den Rundlauf.
        const snap = r.buildStateSnapshot();
        const snapBp = (snap.blueprints || []).find((b) => b && b.name === "portal_schwarm");
        delete st.blueprints["portal_schwarm"];
        r.loadState({ blueprints: snapBp ? [snapBp] : [] });
        const reBp = st.blueprints["portal_schwarm"];
        out.trustRoundtrip =
            !!snapBp &&
            snapBp.portalMeta &&
            snapBp.portalMeta.trust === "sandboxed" &&
            !!reBp &&
            reBp.portalMeta &&
            reBp.portalMeta.trust === "sandboxed";
        // renderLibraryUI rendert eine Schwarm-Welt-Karte.
        r.renderLibraryUI();
        out.uiSchwarmCard = Array.from(document.querySelectorAll("#library-list .library-card")).some((c) =>
            /Schwarm-Welt/.test(c.textContent)
        );
        // Aufräumen.
        delete st.blueprints["portal_schwarm"];
        for (let i = 0; i < st.player.inventory.length; i++) {
            const s = st.player.inventory[i];
            if (s && typeof s.blueprintName === "string" && s.blueprintName.indexOf("portal_schwarm") === 0) {
                st.player.inventory[i] = null;
            }
        }
        r.renderLibraryUI();
        return out;
    });

    if (erreichbar(check, "Untrusted-Tor: V8.70-Tests laufen", sandboxResults)) {
        check(
            "Untrusted-Tor: WORLD_REGISTRY.schwarm existiert + trust:sandboxed + desc + dsl",
            sandboxResults.registryEntry
        );
        check(
            "Untrusted-Tor: Built-in-Welten (skeleton/fluid/terrain) bleiben trusted",
            sandboxResults.builtinsTrusted
        );
        check(
            "Untrusted-Tor: _sanitizePortalMeta — default trusted, bewahrt sandboxed, Müll-trust → trusted",
            sandboxResults.sanitizeTrust
        );
        check(
            "Untrusted-Tor: aimBlueprintAtWorld trägt die Vertrauensstufe (schwarm→sandboxed, terrain→trusted)",
            sandboxResults.aimCarriesTrust
        );
        check(
            "Untrusted-Tor: obtainPortalForWorld holt die Schwarm-Welt (Portal trägt trust:sandboxed)",
            sandboxResults.obtainSchwarm
        );
        check(
            "Untrusted-Tor: _buildPortalOverlay — sandboxed → iframe-sandbox ist 'allow-scripts' ALLEIN",
            sandboxResults.overlaySandboxAttr
        );
        check(
            "Untrusted-Tor: _buildPortalOverlay — trusted → iframe-sandbox enthält allow-same-origin",
            sandboxResults.overlayTrustedAttr
        );
        check(
            "Untrusted-Tor: _buildPortalOverlay — trusted → iframe-sandbox enthält allow-pointer-lock (V18.384)",
            sandboxResults.overlayTrustedPointerLock
        );
        check("Untrusted-Tor: _portalOverlay trägt die trust-Stufe", sandboxResults.overlayTrustField);
        check(
            "Untrusted-Tor: _portalSendEnter + _portalForwardDsl posten mit '*' an eine null-origin-Welt",
            sandboxResults.starForSandbox
        );
        check(
            "Untrusted-Tor: _portalSendEnter postet mit dem Seiten-Origin an eine trusted Welt",
            sandboxResults.originForTrusted
        );
        check("Untrusted-Tor: trust überlebt den buildStateSnapshot/loadState-Rundlauf", sandboxResults.trustRoundtrip);
        check("Untrusted-Tor: renderLibraryUI rendert eine Schwarm-Welt-Karte", sandboxResults.uiSchwarmCard);
    }

    // ### der Auto-Vendor-Pfad ###
    // _vendorPostBundle (der einzige Netz-Schritt) wird gestubbt —
    // der echte save-server-Round-Trip lebt in der Sonde smoke-vendor (git-Archiv).
    const vendorResults = await safeEvaluate(page, async () => {
        const out = {};
        st.customWorlds = {};
        const okBundle = [{ path: "index.html", content: "<!doctype html><title>x</title>" }];
        // _vendorSanitizeBundle — REIN, kein Netz.
        const s1 = r._vendorSanitizeBundle("voxel-fremd", okBundle);
        out.sanitizeOk = s1.ok === true && s1.worldId === "voxel-fremd" && s1.files.length === 1;
        out.rejectsBadId = r._vendorSanitizeBundle("Bad ID!", okBundle).reason === "invalid_world_id";
        out.rejectsReservedId = r._vendorSanitizeBundle("fluid", okBundle).reason === "reserved_world_id";
        out.rejectsTranslatedId = r._vendorSanitizeBundle("translated", okBundle).reason === "reserved_world_id";
        out.rejectsTraversal =
            r._vendorSanitizeBundle("w", [{ path: "../evil.js", content: "x" }].concat(okBundle)).reason ===
            "bad_file_path";
        out.rejectsBackslash =
            r._vendorSanitizeBundle("w", [{ path: "lib\\x.js", content: "x" }].concat(okBundle)).reason ===
            "bad_file_path";
        out.rejectsBadExt =
            r._vendorSanitizeBundle("w", [{ path: "evil.sh", content: "x" }].concat(okBundle)).reason ===
            "bad_file_ext";
        out.rejectsNoIndex =
            r._vendorSanitizeBundle("w", [{ path: "main.js", content: "x" }]).reason === "no_index_html";
        out.rejectsNoFiles = r._vendorSanitizeBundle("w", []).reason === "no_files";
        out.rejectsFileTooLarge =
            r._vendorSanitizeBundle("w", [{ path: "index.html", content: "x".repeat(5 * 1024 * 1024) }]).reason ===
            "file_too_large";
        // vendorWorldBundle — _vendorPostBundle stubben (kein echter Schreib).
        const origPost = r._vendorPostBundle;
        try {
            r._vendorPostBundle = async () => ({ ok: true, fileCount: 1, totalBytes: 31 });
            const v = await r.vendorWorldBundle({
                worldId: "vendor-test",
                label: "Vendor-Test",
                desc: "Eine angedockte Test-Welt.",
                dsl: ["sturm"],
                files: okBundle,
            });
            const stored = st.customWorlds && st.customWorlds["vendor-test"];
            out.vendorRegisters =
                v.ok === true &&
                !!stored &&
                stored.vendored === true &&
                stored.trust === "sandboxed" &&
                stored.reachable === true &&
                stored.world === "worlds/vendor-test/index.html";
            // Sanitize-Fehler durchgereicht (Bad id → nicht registriert).
            const vBad = await r.vendorWorldBundle({ worldId: "Bad ID!", files: okBundle });
            out.vendorPropagatesSanitizeFail = vBad.ok === false && vBad.reason === "invalid_world_id";
            // Post-Fehler durchgereicht (save-server weg → nicht registriert).
            r._vendorPostBundle = async () => ({ ok: false, reason: "save_server_unreachable" });
            const vUnreach = await r.vendorWorldBundle({
                worldId: "vendor-test-2",
                label: "X",
                files: okBundle,
            });
            out.vendorPropagatesPostFail =
                vUnreach.ok === false &&
                vUnreach.reason === "save_server_unreachable" &&
                !(st.customWorlds && st.customWorlds["vendor-test-2"]);
        } finally {
            r._vendorPostBundle = origPost;
        }
        // _sanitizeImportedManifest bewahrt trust + vendored.
        const reSan = r._sanitizeImportedManifest(st.customWorlds["vendor-test"]);
        out.sanitizeKeepsTrustVendored = !!reSan && reSan.trust === "sandboxed" && reSan.vendored === true;
        // vendored erzwingt trust:"sandboxed", auch bei trust:"trusted".
        const forced = r._sanitizeImportedManifest({
            id: "forced-test",
            label: "X",
            world: "worlds/forced-test/index.html",
            vendored: true,
            trust: "trusted",
        });
        out.vendoredForcesSandbox = !!forced && forced.trust === "sandboxed";
        // localStorage-Rundlauf — trust + vendored überleben.
        const reloaded = r._loadCustomWorlds();
        out.roundtripKeepsTrust =
            !!reloaded["vendor-test"] &&
            reloaded["vendor-test"].trust === "sandboxed" &&
            reloaded["vendor-test"].vendored === true;
        // obtainPortalForWorld — der Portal-Bauplan trägt trust:"sandboxed".
        const ob = r.obtainPortalForWorld("vendor-test");
        const portalBp = st.blueprints && st.blueprints["portal_vendor-test"];
        out.portalCarriesSandbox =
            ob.ok === true && !!portalBp && !!portalBp.portalMeta && portalBp.portalMeta.trust === "sandboxed";
        // renderLibraryUI rendert eine „angedockt"-Karte.
        r.renderLibraryUI();
        out.uiVendoredCard =
            !!document.querySelector("#library-list .library-card-vendored") &&
            !!document.querySelector("#library-list .library-vendored-mark");
        // UI: Andocken-Sektion im DOM.
        out.uiVendorSection =
            !!document.getElementById("vendor-id") &&
            !!document.getElementById("vendor-files") &&
            !!document.getElementById("vendor-dock");
        // Aufräumen.
        if (st.blueprints) delete st.blueprints["portal_vendor-test"];
        if (st.player && Array.isArray(st.player.inventory)) {
            st.player.inventory.forEach((sl, i) => {
                if (sl && sl.blueprintName === "portal_vendor-test") st.player.inventory[i] = null;
            });
        }
        st.customWorlds = {};
        r._saveCustomWorlds();
        r.saveState();
        r.renderLibraryUI();
        return out;
    });

    if (erreichbar(check, "W15 Auto-Vendor: Phase-1-Tests laufen", vendorResults)) {
        check("W15 Auto-Vendor: _vendorSanitizeBundle akzeptiert ein sauberes Bündel", vendorResults.sanitizeOk);
        check("W15 Auto-Vendor: _vendorSanitizeBundle lehnt eine ungültige Welt-id ab", vendorResults.rejectsBadId);
        check(
            "W15 Auto-Vendor: _vendorSanitizeBundle lehnt eine Built-in-id (fluid) ab",
            vendorResults.rejectsReservedId
        );
        check("W15 Auto-Vendor: _vendorSanitizeBundle lehnt die translated-id ab", vendorResults.rejectsTranslatedId);
        check(
            "W15 Auto-Vendor: _vendorSanitizeBundle lehnt einen Pfad-Ausbruch (../) ab",
            vendorResults.rejectsTraversal
        );
        check("W15 Auto-Vendor: _vendorSanitizeBundle lehnt einen Backslash-Pfad ab", vendorResults.rejectsBackslash);
        check(
            "W15 Auto-Vendor: _vendorSanitizeBundle lehnt eine verbotene Datei-Endung (.sh) ab",
            vendorResults.rejectsBadExt
        );
        check(
            "W15 Auto-Vendor: _vendorSanitizeBundle lehnt ein Bündel ohne index.html ab",
            vendorResults.rejectsNoIndex
        );
        check("W15 Auto-Vendor: _vendorSanitizeBundle lehnt ein leeres Bündel ab", vendorResults.rejectsNoFiles);
        check("W15 Auto-Vendor: _vendorSanitizeBundle lehnt eine zu große Datei ab", vendorResults.rejectsFileTooLarge);
        check(
            "W15 Auto-Vendor: vendorWorldBundle registriert einen customWorlds-Eintrag (trust:sandboxed, vendored, reachable, worlds/<id>/index.html)",
            vendorResults.vendorRegisters
        );
        check(
            "W15 Auto-Vendor: vendorWorldBundle reicht einen Sanitize-Fehler durch (id → nicht registriert)",
            vendorResults.vendorPropagatesSanitizeFail
        );
        check(
            "W15 Auto-Vendor: vendorWorldBundle reicht einen Post-Fehler durch (save_server_unreachable → nicht registriert)",
            vendorResults.vendorPropagatesPostFail
        );
        check(
            "W15 Auto-Vendor: _sanitizeImportedManifest bewahrt trust + vendored",
            vendorResults.sanitizeKeepsTrustVendored
        );
        check(
            "W15 Auto-Vendor: vendored erzwingt trust:sandboxed (auch bei trust:trusted)",
            vendorResults.vendoredForcesSandbox
        );
        check(
            "W15 Auto-Vendor: trust + vendored überleben den localStorage-Rundlauf",
            vendorResults.roundtripKeepsTrust
        );
        check(
            "W15 Auto-Vendor: obtainPortalForWorld holt ein Portal — es trägt trust:sandboxed",
            vendorResults.portalCarriesSandbox
        );
        check("W15 Auto-Vendor: renderLibraryUI rendert eine 'angedockt'-Karte", vendorResults.uiVendoredCard);
        check(
            "W15 Auto-Vendor: die 'Welt andocken'-Sektion (id + Ordner-Picker + Knopf) im DOM",
            vendorResults.uiVendorSection
        );
    }

    // ### der GitHub-Fetch ###
    // _vendorPostRepo (der Netz-Schritt) wird gestubbt; der echte GitHub-Round-Trip lebt offline +
    // deterministisch in der Sonde smoke-vendor (git-Archiv) (lokales Fake-GitHub).
    const vendor2Results = await safeEvaluate(page, async () => {
        const out = {};
        st.customWorlds = {};
        const origRepo = r._vendorPostRepo;
        const origBundle = r._vendorPostBundle;
        try {
            // Eingangs-Prüfungen — vor dem Netz-Schritt.
            const badId = await r.vendorWorldFromRepo({
                worldId: "Bad ID!",
                repoUrl: "https://github.com/a/b",
            });
            out.rejectsBadId = badId.ok === false && badId.reason === "invalid_world_id";
            const reservedId = await r.vendorWorldFromRepo({
                worldId: "fluid",
                repoUrl: "https://github.com/a/b",
            });
            out.rejectsReservedId = reservedId.ok === false && reservedId.reason === "reserved_world_id";
            const nonGh = await r.vendorWorldFromRepo({
                worldId: "gh-test",
                repoUrl: "https://evil.example.com/a/b",
            });
            out.rejectsNonGithub = nonGh.ok === false && nonGh.reason === "not_a_github_url";
            const emptyUrl = await r.vendorWorldFromRepo({ worldId: "gh-test", repoUrl: "" });
            out.rejectsEmptyUrl = emptyUrl.ok === false && emptyUrl.reason === "not_a_github_url";
            // Mit gestubbtem _vendorPostRepo → registriert die Welt.
            r._vendorPostRepo = async () => ({ ok: true, fileCount: 5, branch: "main" });
            const v = await r.vendorWorldFromRepo({
                worldId: "gh-test",
                repoUrl: "https://github.com/owner/repo",
                label: "GitHub-Test",
                desc: "Aus einem Repo geholt.",
                dsl: ["sturm"],
            });
            const stored = st.customWorlds && st.customWorlds["gh-test"];
            out.registersOnSuccess =
                v.ok === true &&
                v.fileCount === 5 &&
                v.branch === "main" &&
                !!stored &&
                stored.vendored === true &&
                stored.trust === "sandboxed" &&
                stored.reachable === true &&
                stored.world === "worlds/gh-test/index.html";
            // Eine /tree/<branch>-URL besteht die Client-URL-Prüfung.
            const treeUrl = await r.vendorWorldFromRepo({
                worldId: "gh-tree",
                repoUrl: "https://github.com/owner/repo/tree/dev",
                label: "Tree",
            });
            out.acceptsTreeUrl = treeUrl.ok === true;
            // Post-Fehler (GitHub 404 o.ä.) wird durchgereicht.
            r._vendorPostRepo = async () => ({ ok: false, reason: "GitHub fetch failed: HTTP 404" });
            const vFail = await r.vendorWorldFromRepo({
                worldId: "gh-missing",
                repoUrl: "https://github.com/owner/nope",
            });
            out.propagatesPostFail =
                vFail.ok === false && /404/.test(vFail.reason) && !(st.customWorlds && st.customWorlds["gh-missing"]);
            // _vendorRegisterWorld direkt — sandgesichert + vendored.
            const reg = r._vendorRegisterWorld("reg-test", { label: "Reg" });
            const regStored = st.customWorlds && st.customWorlds["reg-test"];
            out.registerWorldDirect =
                reg.ok === true &&
                !!regStored &&
                regStored.trust === "sandboxed" &&
                regStored.vendored === true &&
                regStored.world === "worlds/reg-test/index.html";
            // Regression: der Bündel-Pfad (Phase 1) läuft nach dem Refactor.
            r._vendorPostBundle = async () => ({ ok: true, fileCount: 1 });
            const vb = await r.vendorWorldBundle({
                worldId: "bundle-regress",
                label: "B",
                files: [{ path: "index.html", content: "<!doctype html><title>x</title>" }],
            });
            out.bundlePathStillWorks =
                vb.ok === true &&
                !!(st.customWorlds && st.customWorlds["bundle-regress"]) &&
                st.customWorlds["bundle-regress"].trust === "sandboxed";
        } finally {
            r._vendorPostRepo = origRepo;
            r._vendorPostBundle = origBundle;
        }
        // localStorage-Rundlauf — die repo-vendorte Welt überlebt.
        const reloaded = r._loadCustomWorlds();
        out.roundtripKeepsTrust =
            !!reloaded["gh-test"] && reloaded["gh-test"].trust === "sandboxed" && reloaded["gh-test"].vendored === true;
        // UI: die GitHub-Holen-Sektion im DOM.
        // Aufräumen.
        st.customWorlds = {};
        r._saveCustomWorlds();
        r.saveState();
        r.renderLibraryUI();
        return out;
    });

    if (erreichbar(check, "W15 GitHub-Fetch: Phase-2-Tests laufen", vendor2Results)) {
        check("W15 GitHub-Fetch: vendorWorldFromRepo lehnt eine ungültige Welt-id ab", vendor2Results.rejectsBadId);
        check("W15 GitHub-Fetch: vendorWorldFromRepo lehnt eine Built-in-id ab", vendor2Results.rejectsReservedId);
        check(
            "W15 GitHub-Fetch: vendorWorldFromRepo lehnt eine Nicht-github.com-URL ab",
            vendor2Results.rejectsNonGithub
        );
        check("W15 GitHub-Fetch: vendorWorldFromRepo lehnt eine leere URL ab", vendor2Results.rejectsEmptyUrl);
        check(
            "W15 GitHub-Fetch: vendorWorldFromRepo registriert die Welt (trust:sandboxed, vendored, reachable, worlds/<id>/index.html)",
            vendor2Results.registersOnSuccess
        );
        check(
            "W15 GitHub-Fetch: eine /tree/<branch>-URL besteht die Client-URL-Prüfung",
            vendor2Results.acceptsTreeUrl
        );
        check(
            "W15 GitHub-Fetch: vendorWorldFromRepo reicht einen Fetch-Fehler durch (404 → nicht registriert)",
            vendor2Results.propagatesPostFail
        );
        check(
            "W15 GitHub-Fetch: _vendorRegisterWorld registriert sandgesichert + vendored",
            vendor2Results.registerWorldDirect
        );
        check(
            "W15 GitHub-Fetch: der Bündel-Pfad (Phase 1) läuft nach dem Refactor weiter",
            vendor2Results.bundlePathStillWorks
        );
        check(
            "W15 GitHub-Fetch: die repo-vendorte Welt überlebt den localStorage-Rundlauf",
            vendor2Results.roundtripKeepsTrust
        );
    }
}

// Ω2 must-preserve als Gesetz: Unbekanntes überlebt jeden Serialize/Restore bit-gleich (EINE Quelle
// _carryUnknown), die R4-Herkunftskette überlebt den Save, die Sicherheits-Wände halten
// (Gegenproben), die Größen-Wand dämpft.
async function checkBandTailleOmega2({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const C = AnazhRealm;
        out.constants =
            Number.isFinite(C.TAILLE_UNKNOWN_FIELD_MAX) &&
            Object.isFrozen(C.BLUEPRINT_KNOWN_KEYS) &&
            Object.isFrozen(C.MATERIAL_KNOWN_KEYS) &&
            Object.isFrozen(C.TOOL_KNOWN_KEYS) &&
            Object.isFrozen(C.MANIFEST_KNOWN_KEYS);
        // (1) Blueprint-Zwilling: xZukunft + provenance überleben bit-gleich.
        const KA = "ab".repeat(32);
        const live = {
            name: "_omega2_bp",
            label: "Ω2",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0, 0, 1, 1, 1, { rotation: { x: 0, y: 0, z: 0 }, opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }] }),
            ],
            connections: [],
            xZukunft: { tief: [1, 2, { drei: true }] },
            provenance: [{ by: KA, at: 7 }],
        };
        const ser = r._serializeBlueprint(live);
        out.serCarries =
            JSON.stringify(ser.xZukunft) === JSON.stringify(live.xZukunft) &&
            Array.isArray(ser.provenance) &&
            ser.provenance[0].by === KA;
        const deser = r._deserializeBlueprint(JSON.parse(JSON.stringify(ser)));
        out.deserCarries =
            !!deser &&
            JSON.stringify(deser.xZukunft) === JSON.stringify(live.xZukunft) &&
            Array.isArray(deser.provenance) &&
            deser.provenance[0].by === KA;
        // (2) die Größen-Wand: ein >8-KiB-Feld fällt (Dämpfung, dokumentiert).
        const fat = r._serializeBlueprint({ ...live, xRiese: "y".repeat(C.TAILLE_UNKNOWN_FIELD_MAX + 10) });
        out.sizeWall = fat.xRiese === undefined && JSON.stringify(fat.xZukunft) === JSON.stringify(live.xZukunft);
        // (3) Manifest: Unbekanntes überlebt, die Sicherheits-Wand HÄLT weiter.
        const man = r._sanitizeImportedManifest({
            id: "omega2-welt",
            label: "Ω2",
            world: "https://evil.example/x.html",
            dsl: ["set_weather"],
            trust: "trusted",
            vendored: true,
            xZukunft: { d: 4 },
        });
        out.manifestCarries = !!man && man.xZukunft && man.xZukunft.d === 4;
        out.manifestWallHolds =
            !!man && !/evil\.example/.test(String(man.world)) && man.trust === "sandboxed" && man.vendored === true;
        const serMat = r._serializeMaterial({
            name: "_omega2_mat",
            label: "Ω2-Stoff",
            builtIn: false,
            color: 0x123456,
            tags: { härte: 0.5, "x:fremd": 0.7 },
            xZukunft: { e: 5 },
        });
        out.matCarries =
            serMat.label === "Ω2-Stoff" && serMat.tags["x:fremd"] === 0.7 && serMat.xZukunft && serMat.xZukunft.e === 5;
        const serTool = r._serializeTool({
            name: "_omega2_tool",
            label: "Ω2-Werk",
            builtIn: false,
            opClass: "plastic",
            opName: "schmieden",
            precisionCap: 0.7,
            sourceBlueprint: null,
            isMachine: true,
        });
        out.toolCarries = serTool.isMachine === true;
        // (5) Material-RESTORE ist substanz-treu (label + exakte Magnitude +
        // fremde Achse + Unbekanntes) — aber defineMaterial (die lokale
        // Geste/DSL) bleibt die strenge [0,1]-Whitelist-Wand.
        delete st.materials["_omega2_mat"];
        const beforeKeys = Object.keys(st.materials).length;
        r._loadStateRestoreCraftingInventory({
            materials: [
                {
                    name: "_omega2_mat",
                    label: "Ω2-Stoff",
                    color: 0x123456,
                    tags: { härte: 2.5, "x:fremd": 0.7 },
                    xZukunft: { e: 5 },
                },
            ],
        });
        const restored = st.materials["_omega2_mat"];
        out.matRestoreTrue =
            !!restored &&
            restored.label === "Ω2-Stoff" &&
            restored.tags["härte"] === 2.5 &&
            restored.tags["x:fremd"] === 0.7 &&
            restored.xZukunft &&
            restored.xZukunft.e === 5;
        const strict = r.defineMaterial("_omega2_strict", 0x111111, { härte: 9, "x:fremd": 0.5 });
        const strictEntry = strict.ok ? st.materials[strict.name] : null;
        out.gestureStaysStrict =
            !!strictEntry && strictEntry.tags["härte"] === 1 && strictEntry.tags["x:fremd"] === undefined;
        delete st.materials["_omega2_mat"];
        delete st.materials["_omega2_strict"];
        void beforeKeys;
        return out;
    });
    if (!res) {
        check("Ω2: must-preserve-Sonde lief", false, "evaluate warf");
        return;
    }
    check("Ω2: die Taille-Konstanten stehen frozen (Größen-Wand + vier known-Sätze)", res.constants);
    check("Ω2: der Bauplan-Zwilling bewahrt Unbekanntes + die R4-Herkunftskette (serialize)", res.serCarries);
    check("Ω2: der Bauplan-Zwilling bewahrt Unbekanntes + Kette (deserialize, bit-gleich)", res.deserCarries);
    check("Ω2: die Größen-Wand dämpft (>8 KiB fällt, kleine Zukunft lebt)", res.sizeWall);
    check(
        "Ω2: das Manifest bewahrt Unbekanntes — UND die Sicherheits-Wand hält (world/trust/vendored)",
        res.manifestCarries && res.manifestWallHolds
    );
    check(
        "Ω2: Material/Tool-Serialize tragen Substanz + Unbekanntes (x:-Tag · isMachine)",
        res.matCarries && res.toolCarries
    );
    check(
        "Ω2: der Material-Restore ist substanz-treu (exakte Magnitude · x:-Achse · label · Unbekanntes) — die lokale Geste bleibt streng",
        res.matRestoreTrue && res.gestureStaysStrict
    );
}

// R5 STRUKTUR-TEXTUR: Material-Mikro-Tiefe-Boost
// für werk-Profile. Default 1.0 = no-op, browser-justierbar wenn Strukturen
// platt wirken. Source-Probe + Konstante.
async function checkBandV18207R5StructureTexture({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = AnazhRealm;
        const out = {};

        // (R1) R5_STRUCTURE_TEXTURE
        if (A.R5_STRUCTURE_TEXTURE) {
            out.microBoostValue = A.R5_STRUCTURE_TEXTURE.microBoost;
            out.microBoostSensible =
                typeof A.R5_STRUCTURE_TEXTURE.microBoost === "number" &&
                A.R5_STRUCTURE_TEXTURE.microBoost > 0 &&
                A.R5_STRUCTURE_TEXTURE.microBoost < 5;
        }

        return out;
    });

    check(
        `(R1b) microBoost sinnvoll (>0, <5; gemessen ${res.microBoostValue})`,
        res.microBoostSensible === true
    );
}

module.exports = {
    checkBandV1738RulePersistence,
    checkBandRing8,
    checkBandRing9to10,
    checkBandTranslatorAndUntrusted,
    checkBandTailleOmega2,
    checkBandV18207R5StructureTexture,
};
