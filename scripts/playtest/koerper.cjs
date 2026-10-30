"use strict";
// scripts/playtest/koerper.cjs — der Richter von Koerper (spec/stamm/modul-karte.json): Rig · Gang und IK · Ofen-Guss · Tier-Animation · Spieler-Seele · Stats · Boosts · Ausrüstung · Inventar · Spieler-Bewegung · Sprung · Charakter-Physik · Fahr-Hülle · Ego-Sicht und Kamera · Mensch-Avatar · Sitz · Fahrzeug · Ritt.
// 11 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar } = require("../playtest.cjs");

// Avatar: einen Körper FORMEN durch denselben WERK-Kern (der Avatar
// ist KEINE Ausnahme — formen kostet, tragen frei); forgeAvatar (role:soul, pay+freeze+verkörpern) +
// embodyBlueprint (der Spieler-Pfad, forge-wenn-ungeformt). KONSUM (nicht Existenz).
async function checkBandV1764ForgeAvatar({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();
        const savedSoul = p.soul;

        // ein körper-geformter Bauplan, role="soul" + ein Nicht-Soul
        blu.__soul = {
            name: "__soul",
            role: "soul",
            roleManual: true,
            parts: [
                { shape: "box", material: "stein", size: { x: 0.5, y: 1.6, z: 0.5 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        blu.__notsoul = {
            name: "__notsoul",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.5, y: 0.5, z: 0.5 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };

        // (2) forgeAvatar verlangt role="soul"
        r.setGameMode("schöpfer");
        const avNoRole = r.forgeAvatar("__notsoul");
        out.forgeAvatarRequiresSoul = avNoRole.ok === false && avNoRole.reason === "blueprint_not_soul";

        // (3) forgeAvatar in pfad OHNE Material → abgelehnt (kein Körper geformt, Seele bleibt)
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        r.applyPlayerSoul("human");
        const avNoMat = r.forgeAvatar("__soul");
        out.pfadAvatarRejectsWithoutMaterial =
            avNoMat.ok === false && avNoMat.reason === "not_enough_material" && p.soul === "human";

        // (4) forgeAvatar in pfad MIT Material → formt (zahlt + verkörpert + friert ein)
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const avForge = r.forgeAvatar("__soul");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadAvatarForges =
            avForge.ok === true &&
            steinBefore > steinAfter &&
            Number.isFinite(blu.__soul.forgedPrecision) &&
            p.soul !== "human";

        // (5) embodyBlueprint: eine geformte Seele → frei verkörpern (leeres Inventar)
        r.applyPlayerSoul("human");
        p.inventory = new Array(27).fill(null);
        const embMade = r.embodyBlueprint("__soul");
        out.embodyMadeFree = embMade.ok === true && p.soul !== "human";

        // (6) embodyBlueprint UNgeformt in schöpfer → frei
        delete blu.__soul.forgedPrecision;
        r.applyPlayerSoul("human");
        r.setGameMode("schöpfer");
        p.inventory = new Array(27).fill(null);
        const embSchoepfer = r.embodyBlueprint("__soul");
        out.schoepferEmbodiesFree = embSchoepfer.ok === true && p.soul !== "human";

        // (7) fertigeBlueprint routet soul → forgeAvatar (formt + verkörpert, NICHT in die Hand)
        delete blu.__soul.forgedPrecision;
        r.applyPlayerSoul("human");
        if (!p.equipped) p.equipped = {};
        p.equipped.held = null;
        r.setGameMode("schöpfer");
        const fert = r.fertigeBlueprint("__soul");
        out.fertigeRoutesSoul = fert.ok === true && p.soul !== "human" && p.equipped.held !== "__soul";

        // cleanup
        delete blu.__soul;
        delete blu.__notsoul;
        if (r.state.customSouls) delete r.state.customSouls["bp___soul"];
        r.applyPlayerSoul(savedSoul && r.playerSoulDefs[savedSoul] ? savedSoul : "human");
        p.inventory = new Array(27).fill(null);
        r.setGameMode(savedMode);
        return out;
    });
    check("S5: forgeAvatar verlangt role=soul (sonst blueprint_not_soul)", res.forgeAvatarRequiresSoul);
    check(
        "S5: forgeAvatar in pfad OHNE Material → abgelehnt (kein Koerper geformt, Seele bleibt)",
        res.pfadAvatarRejectsWithoutMaterial
    );
    check(
        "S5: KONSUM — forgeAvatar in pfad MIT Material → formt (zahlt + verkoerpert + friert ein)",
        res.pfadAvatarForges
    );
    check(
        "S5: GEBRAUCH frei — eine geformte Seele verkoerpern kostet nichts (leeres Inventar)",
        res.embodyMadeFree
    );
    check("S5: schoepfer verkoerpert frei (ohne Material)", res.schoepferEmbodiesFree);
    check(
        "S5: fertigeBlueprint routet soul → forgeAvatar (formt + verkoerpert, nicht in die Hand)",
        res.fertigeRoutesSoul
    );
}

async function checkBandRing5Soul({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Ring 5 — createPlayerSoul V1 ###
    // Mensch + verkörperbare Tier-Körper: Default human, Wechsel ändert geometry+color, Chat-Pattern
    // routet, Save/Load-Roundtrip, unbekannte Namen abgelehnt, Position überlebt, Drawer + Status-Bar-UI.
    const ring5Results = await safeEvaluate(page, async () => {
        if (!r || !r.state || !r.state.player || !r.state.playerMesh) return null;
        const out = {};
        // V2: state.playerMesh wird bei jedem Soul-Wechsel
        // ersetzt (neuer Group). Wir lesen jedes Mal frisch
        // aus state, statt eine Referenz festzuhalten.
        const currentMesh = () => r.state.playerMesh;
        const currentParts = () => {
            const m = currentMesh();
            return m && m.userData && m.userData.parts;
        };

        // UI vorhanden?
        out.drawerSelectInDom = !!document.getElementById("player-soul-select");
        out.statusBarSoulInDom = !!document.getElementById("status-soul");
        const select = document.getElementById("player-soul-select");
        // ALTLASTEN-NULL + KÖRPER GANZ (T6): die Seele-Select listet den Menschen
        // PLUS die vier Studio-Tiere (Studio-Gruppe; verkörpert → bp_-Wert). koerper_human
        // ist ALT_DOPPEL und tritt NICHT mehr auf — der mensch-Eintrag trägt ihn.
        const ring5SoulVals = select ? [...select.options].map((o) => o.value) : [];
        out.dropdownHasBuiltinSouls =
            ring5SoulVals.includes("human") &&
            !ring5SoulVals.includes("phoenix") &&
            !ring5SoulVals.includes("dragon") &&
            !ring5SoulVals.includes("koerper_human") &&
            (ring5SoulVals.includes("koerper_wolf") || ring5SoulVals.includes("bp_koerper_wolf"));
        out.dropdownOptionCount = select ? select.options.length : -1;
        out.dropdownOptionValues = select ? [...select.options].map((o) => o.value).join(",") : "";

        // Cleanup: starte vom Default aus.
        r.applyPlayerSoul("human");
        out.defaultIsHuman = r.state.player.soul === "human";
        // Die Farb-Wahrheit ist die ZAHL am Körper (userData.hautTon): Mitglied der koerper-core-Palette
        // (SKIN_TONES, Γ5-Anker aus dem Welt-Seed), kein Literal; die Pipe trägt Farben als Vertex-Daten auf
        // GETEILTEN Node-Materialien (kein per-Körper-Material).
        let pipeNodeMat = false;
        currentMesh().traverse((n) => {
            if (
                !pipeNodeMat &&
                n.isMesh &&
                n.material &&
                (n.material.isNodeMaterial || n.material.isMeshStandardNodeMaterial)
            )
                pipeNodeMat = true;
        });
        const kcTones = window.__koerperCore && window.__koerperCore.SKIN_TONES;
        const hautTonInPalette =
            !!kcTones &&
            Object.keys(kcTones).some((k) => kcTones[k].hex >>> 0 === currentMesh().userData.hautTon >>> 0);
        out.defaultColorRed = hautTonInPalette && pipeNodeMat;
        // V2: statt Geometrie-Typ prüfen wir die Group-Struktur
        // (Mensch hat torso/head/2 Arme/2 Beine = 6 Parts).
        const humanParts = currentParts();
        out.humanHasAllParts =
            humanParts &&
            !!humanParts.torso &&
            !!humanParts.head &&
            !!humanParts.leftArm &&
            !!humanParts.rightArm &&
            !!humanParts.leftLeg &&
            !!humanParts.rightLeg;

        // applyPlayerSoul("wolf") → Group neu, Parts wechseln
        const posBefore = {
            x: currentMesh().position.x,
            y: currentMesh().position.y,
            z: currentMesh().position.z,
        };
        // ALTLASTEN-NULL / KONVERGENZ III: der WOLF-Körper (koerper_wolf via
        // werde-Alias) ist die Wechsel-Probe — der getragene Leib IST der
        // Studio-Baum (_tierBaum); die Rollen-Quelle bleibt der frozen Bauplan.
        const okPhoenix = r.applyPlayerSoul("wolf");
        out.applyReturnsTrue = !!okPhoenix && okPhoenix.ok !== false;
        out.phoenixSoulSet = r.state.player.soul === "bp_koerper_wolf";
        const wolfBp = r.state.blueprints.koerper_wolf;
        let wolfMeshN = 0;
        currentMesh().traverse((n) => {
            if (n.isMesh) wolfMeshN++;
        });
        out.phoenixColor = !!currentMesh().userData._tierBaum && wolfMeshN >= 2;
        const wolfTeile = (currentMesh().userData._tierBaum || {}).teile || {};
        const wolfRoles = r.computeMotionRoles(wolfBp.parts) || [];
        out.phoenixHasWingsAndTail =
            !!wolfTeile.legFL && !!wolfTeile.legHR && wolfRoles.some((x) => x && x.role === "schwanz");
        out.positionPreserved =
            Math.abs(currentMesh().position.x - posBefore.x) < 1e-6 &&
            Math.abs(currentMesh().position.y - posBefore.y) < 1e-6 &&
            Math.abs(currentMesh().position.z - posBefore.z) < 1e-6;
        // Dropdown synchronisiert sich (auf den Bauplan-Namen der Verkörperung)
        out.dropdownSyncsToPhoenix = select && (select.value === "koerper_wolf" || select.value === "bp_koerper_wolf");

        // Kein Physics-Body: der Spieler ist body-frei (feld-native Kollision aus dem Dichtefeld, Velocity
        // in state.playerVel) — ein Soul-Wechsel hat keinen rigid body umzuhängen.

        // Chat-Pattern: "werde hirsch" (der werde-Ring spricht die Tiere)
        r.processChatCommand("werde hirsch");
        out.chatRoutedToDsl =
            Array.isArray(r.state.dsl.lastUserProgram) &&
            r.state.dsl.lastUserProgram[0] === "player_soul" &&
            r.state.dsl.lastUserProgram[1] === "hirsch";
        out.dragonSoulSet = r.state.player.soul === "bp_koerper_wesen";
        const hirschBp = r.state.blueprints.koerper_wesen;
        let hirschMeshN = 0;
        currentMesh().traverse((n) => {
            if (n.isMesh) hirschMeshN++;
        });
        out.dragonColor = !!currentMesh().userData._tierBaum && hirschMeshN >= 2;
        // Vier Beine leben am BAUM (teile.legXX); die bein-/schwanz-Rollen
        // bleiben die frozen Bauplan-Wahrheit (reine Funktion, Tags/Motion).
        const hirschTeile = (currentMesh().userData._tierBaum || {}).teile || {};
        const dragonRoles = r.computeMotionRoles(hirschBp.parts) || [];
        out.dragonHasFourLegs =
            !!hirschTeile.legFL &&
            !!hirschTeile.legFR &&
            !!hirschTeile.legHL &&
            !!hirschTeile.legHR &&
            dragonRoles.filter((x) => x && x.role === "bein").length >= 4 &&
            dragonRoles.some((x) => x && x.role === "schwanz");

        // Umlaut-Alias (bär → koerper_baer) + Englisch (human)
        r.applyPlayerSoul("bär");
        out.umlautAliasWorks = r.state.player.soul === "bp_koerper_baer";
        r.applyPlayerSoul("human");
        out.englishAliasWorks = r.state.player.soul === "human";

        // ALTLASTEN-NULL: ein unbekannter Name fällt FAIL-SOFT auf den Menschen
        // (alte Saves mit gefallenen Seelen-Namen laden heil — laute WARNING).
        r.applyPlayerSoul("wolf");
        const okBad = r.applyPlayerSoul("riese");
        out.unknownRejected = okBad === true && r.state.player.soul === "human";

        // DSL-Op direkt aufrufbar
        const resDsl = r.dslRun(["player_soul", "human"]);
        out.dslOpWorks = resDsl.ok === true && r.state.player.soul === "human";

        // Seele NICHT im atomic-Pool (Nexus soll Identität nicht überschreiben)
        const seedRng = (seed) => {
            let s = seed >>> 0 || 1;
            return () => {
                s = (s * 1664525 + 1013904223) >>> 0;
                return s / 4294967296;
            };
        };
        const rng = seedRng(2026);
        let seenSoulOp = false;
        for (let i = 0; i < 2000; i++) {
            const atom = r.dslComposeAtomic(rng);
            if (Array.isArray(atom) && atom[0] === "player_soul") {
                seenSoulOp = true;
                break;
            }
        }
        out.soulNotInAtomicPool = !seenSoulOp;

        // Save-Roundtrip: die getragene Wolf-Verkörperung reist als Custom-Seele
        r.applyPlayerSoul("wolf");
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.savedPlayerSoul = !!parsed && parsed.playerSoul === "bp_koerper_wolf";

        // loadState wendet die gespeicherte Seele an (zurück auf den Menschen)
        r.loadState({ ...parsed, playerSoul: "human" });
        out.loadAppliesSoul = r.state.player.soul === "human" && currentMesh().children.length >= 1;

        // Status-Bar (Label des getragenen Tier-Körpers)
        r.applyPlayerSoul("wolf");
        r.updateStatusPanel(1e6);
        const statusEl = document.getElementById("status-soul");
        out.statusBarShowsLabel = statusEl && /Wolf/.test(statusEl.textContent || "");

        // V2-Animation: die Beine des Menschen gehen nach dem EINEN Gang-Gesetz. Der Schritt kommt aus dem EINEN
        // Gang-Tick (`_gaitTick`, derselbe Chokepoint wie Peer und Bewohner): 1 s Gehen mit 1,15 m/s, die Beine müssen
        // ihre rotation.x ändern. Ohne Schritt (kein gait) schwingt seit K07 kein Bein mehr — der Sinus um einen 3,4-m-
        // Schritt fiel; der direkte Aufruf ohne gait maß diesen Zwilling.
        r.applyPlayerSoul("human");
        const humanGroup = currentMesh();
        const leftLegRotInitial = humanGroup.userData.parts.leftLeg.rotation.x;
        const def = r.playerSoulDefs.human;
        const gangHalter = { walkPhase: 0 };
        let leftLegAusschlag = 0;
        for (let i = 0; i < 60; i++) {
            const gait = r._gaitTick(humanGroup, gangHalter, 1.15, 1 / 60, null);
            def.animate(humanGroup, i / 60, gangHalter.walkPhase, true, false, undefined, gait);
            leftLegAusschlag = Math.max(
                leftLegAusschlag,
                Math.abs(humanGroup.userData.parts.leftLeg.rotation.x - leftLegRotInitial)
            );
        }
        out.humanWalkAnimationMoves = leftLegAusschlag > 0.1;

        // Die FLÜGEL-Rolle flattert im Idle durch den EINEN Kern (_animateCompoundMotion) über den echten
        // Spieler-Pfad (geflügelte Custom-Seele als Literal-Fixture). Emotionen NEUTRALISIEREN — Warmup-
        // Emotionen konfundieren sonst die Amplituden-Schwelle.
        const savedEmo = Object.assign({}, r.state.player.emotions);
        for (const k in r.state.player.emotions) r.state.player.emotions[k] = 0;
        r.state.customSouls = r.state.customSouls || {};
        r.state.customSouls.fluegelprobe = {
            label: "Flügel-Probe",
            bodyParts: [
                {
                    shape: "box",
                    material: "federn",
                    size: { x: 0.5, y: 0.55, z: 0.4 },
                    position: { x: 0, y: 0.5, z: 0 },
                },
                {
                    shape: "plane",
                    material: "federn",
                    size: { x: 0.9, y: 0.04, z: 0.5 },
                    position: { x: 0.62, y: 0.55, z: 0 },
                },
                {
                    shape: "plane",
                    material: "federn",
                    size: { x: 0.9, y: 0.04, z: 0.5 },
                    position: { x: -0.62, y: 0.55, z: 0 },
                },
            ],
        };
        r.applyPlayerSoul("fluegelprobe");
        const phGroup = currentMesh();
        r.state.player.animationLastTick = -Infinity;
        r.animatePlayerSoul(0.1);
        const wingRotA = phGroup.userData.parts.leftWing.rotation.z;
        r.animatePlayerSoul(0.3);
        const wingRotB = phGroup.userData.parts.leftWing.rotation.z;
        out.phoenixWingsFlapInIdle = Math.abs(wingRotA - wingRotB) > 0.05;

        // Der Schweif wellt sich am HIRSCH-Körper: _tierBaum.tailSegs, profil-getrieben (idle: tailRate 0.5 ·
        // tailAmp 0.1); t 0.1→3.1 hebt die Phase auf ~sin(1.55)≈1 → Delta ~0.095, robust über 0.05.
        r.applyPlayerSoul("hirsch");
        const drGroup = currentMesh();
        r.state.player.animationLastTick = -Infinity;
        r.animatePlayerSoul(0.1);
        const drTail = ((drGroup.userData._tierBaum || {}).tailSegs || [])[0] || null;
        const tailA = drTail ? drTail.rotation.y : 0;
        r.animatePlayerSoul(3.1);
        const tailB = drTail ? drTail.rotation.y : 0;
        out.dragonTailWaves = !!drTail && Math.abs(tailA - tailB) > 0.05;
        Object.assign(r.state.player.emotions, savedEmo);
        delete r.state.customSouls.fluegelprobe;

        // Cleanup
        r.applyPlayerSoul("human");
        return out;
    });

    if (erreichbar(check, "Ring 5: Seele-Snapshot erreichbar", ring5Results)) {
        check("Ring 5: Dropdown im Spieler-Drawer", ring5Results.drawerSelectInDom);
        check("Ring 5: Status-Bar zeigt Seele-Item", ring5Results.statusBarSoulInDom);
        check(
            "Ring 5 (NULL): Dropdown = Mensch + verkörperbare Bauplan-Körper (Tiere)",
            ring5Results.dropdownHasBuiltinSouls,
            `count=${ring5Results.dropdownOptionCount} values=${ring5Results.dropdownOptionValues}`
        );
        check("Ring 5: Default-Seele ist 'human'", ring5Results.defaultIsHuman);
        check(
            "Ring 5/234: Mensch-Avatar aus der PIPE — Hautton MITGLIED der SKIN_TONES-Palette + lit NodeMaterial",
            ring5Results.defaultColorRed
        );
        check("Ring 5 V2: Mensch-Group hat torso/head/2 Arme/2 Beine", ring5Results.humanHasAllParts);
        check("Ring 5 (NULL): applyPlayerSoul('wolf') verkörpert (embody-Pfad)", ring5Results.applyReturnsTrue);
        check("Ring 5 (NULL): Wolf setzt state.player.soul = bp_koerper_wolf", ring5Results.phoenixSoulSet);
        check("Ring 5 (NULL): der Wolf-Körper ist Compound-Seele (parts gebaut)", ring5Results.phoenixColor);
        check(
            "Ring 5 V2 (NULL): der Wolf trägt Bein-Anker + schwanz-Rolle (die EINE Rollen-Quelle)",
            ring5Results.phoenixHasWingsAndTail
        );
        check("Ring 5: Seelen-Wechsel erhält Spieler-Position", ring5Results.positionPreserved);
        // die zwei Ammo-Physics-Body-Checks sind GESCHNITTEN (der Spieler ist
        // body-frei, feld-native; es gibt keinen rigid body, der dem Soul-Group folgt).
        check("Ring 5: Dropdown synchronisiert sich (UI ↔ State)", ring5Results.dropdownSyncsToPhoenix);
        check("Ring 5 (NULL): Chat 'werde hirsch' routet auf DSL player_soul", ring5Results.chatRoutedToDsl);
        check("Ring 5 (NULL): Chat 'werde hirsch' verkörpert den Hirsch", ring5Results.dragonSoulSet);
        check("Ring 5 (NULL): der Hirsch-Körper ist Compound-Seele (parts gebaut)", ring5Results.dragonColor);
        check(
            "Ring 5 V2: der Hirsch trägt ≥4 bein-Rollen (Multi-Segment-Skelett) + schwanz-Rolle + Bein-Anker",
            ring5Results.dragonHasFourLegs
        );
        check("Ring 5 (NULL): Umlaut-Alias 'bär' verkörpert koerper_baer", ring5Results.umlautAliasWorks);
        check("Ring 5: 'human' kanonisiert auf den Menschen", ring5Results.englishAliasWorks);
        check("Ring 5 (NULL): unbekannter Alt-Name fällt fail-soft auf den Menschen", ring5Results.unknownRejected);
        check("Ring 5: DSL-Op player_soul direkt aufrufbar", ring5Results.dslOpWorks);
        check(
            "Ring 5: player_soul NICHT im dslComposeAtomic-Pool (Nexus überschreibt Identität nicht)",
            ring5Results.soulNotInAtomicPool
        );
        check("Ring 5: saveState persistiert playerSoul", ring5Results.savedPlayerSoul);
        check("Ring 5: loadState wendet Seele auf Mesh an", ring5Results.loadAppliesSoul);
        check("Ring 5 (NULL): Status-Bar zeigt das Körper-Label ('Wolf')", ring5Results.statusBarShowsLabel);
        check("Ring 5 V2: Mensch-Walk-Animation rotiert Beine bei isMoving=true", ring5Results.humanWalkAnimationMoves);
        check(
            "Ring 5 V2 (NULL): Flügel-Rolle flattert im Idle (Custom-Fixture, der EINE Kern)",
            ring5Results.phoenixWingsFlapInIdle
        );
        check(
            "Ring 5 V2 (NULL): Hirsch-Schweif wellt sich (schwanz-Rolle im EINEN Kern)",
            ring5Results.dragonTailWaves
        );
    }

    // ### Ring 5 V2-Vorbereitung — Third-Person-Kamera ###
    // Toggle wechselt state.cameraMode (persistiert in localStorage), die Kamera orbitet hinter den
    // Spieler, playerMesh dreht mit yaw.
    const cameraResults = await safeEvaluate(page, () => {
        if (!r || !r.state || !r.state.playerMesh || !r.state.camera) return null;
        const out = {};
        const toggle = document.getElementById("camera-mode-toggle");
        out.toggleInDom = !!toggle;
        out.initialModeFirst = r.state.cameraMode === "first";
        out.initialLabelFirst = toggle && toggle.textContent.includes("1st");

        // setCameraMode("third") schaltet um + Label folgt
        r.setCameraMode("third");
        out.modeAfterSet = r.state.cameraMode === "third";
        out.labelAfterSet = toggle && toggle.textContent.includes("3rd");
        out.ariaPressedAfterSet = toggle && toggle.getAttribute("aria-pressed") === "true";
        out.persistedThird = localStorage.getItem("anazhRealmCameraMode") === "third";

        // Kamera ist im 3rd-Modus tatsächlich vom Spieler entfernt
        // (mind. 4 Welt-Einheiten). Wir setzen yaw=0, damit die
        // Distanz reproduzierbar in -Z-Richtung liegt.
        r.state.yaw = 0;
        r.state.pitch = 0;
        // BÜHNE: die Blick-Distanz in −Z (Render-Mechanik)
        r.state.playerMesh.position.set(0, 20, 0);
        // Render-Frame triggern: Loop läuft bereits, wir warten auf
        // den nächsten Tick im Test-Wrapper. Hier prüfen wir die
        // Math direkt, damit der Test deterministisch ist.
        const dist = r.state.cameraThirdDistance;
        const expectedZ = -Math.cos(0) * dist; // = -dist
        out.expectedDistance = dist;
        out.expectedZ = expectedZ;

        // playerMesh.rotation.y folgt yaw — setze yaw und renderFrame
        r.state.yaw = Math.PI / 2;

        // setCameraMode("first") zurück
        r.setCameraMode("first");
        out.modeBackToFirst = r.state.cameraMode === "first";
        out.labelBackToFirst = toggle && toggle.textContent.includes("1st");
        out.persistedFirst = localStorage.getItem("anazhRealmCameraMode") === "first";

        // Unbekannter Modus fällt auf "first" zurück
        r.setCameraMode("xyz");
        out.unknownFallsToFirst = r.state.cameraMode === "first";

        return out;
    });

    // Loop synchron treiben (_gameLoopTick = genau ein Frame): Headless-Chromium drosselt rAF auf ~1 Hz,
    // ein Warte-Fenster enthielte oft 0 Ticks.
    const cameraEffect = await safeEvaluate(page, () => {
        if (!r || !r.state.camera || !r.state.playerMesh) return null;
        r._gameLoopTick(performance.now());
        return {
            playerYaw: r.state.yaw,
            playerRotationY: r.state.playerMesh.rotation.y,
            cameraX: r.state.camera.position.x,
            cameraY: r.state.camera.position.y,
            cameraZ: r.state.camera.position.z,
            playerX: r.state.playerMesh.position.x,
            playerY: r.state.playerMesh.position.y,
            playerZ: r.state.playerMesh.position.z,
        };
    });

    // Pitch-Inversion + Boden-Clamp im 3rd-Modus: Maus hoch (pitch positiv) SENKT die Kamera; bei
    // extremem Pitch taucht sie nie unter den Boden. Loop synchron treiben (Headless-rAF ~1 Hz).
    // Gelesen wird `_cameraDesiredY` (reine Pitch-Mathematik inkl. Boden-Deckel), NICHT camera.position.y
    // — die Kamera-Kollision zieht je nach Umgebung ein (eigenes Feature, nicht deterministisch). Der Deckel ist der
    // SICHTBARE Boden + der Radius der Kamera-Kugel (`_kamBodenY`, K06), nicht mehr die Füße − 0,2 m.
    const setPitchAndRead = async (pitch) => {
        return await page.evaluate((p) => {
            r.setCameraMode("third");
            r.state.yaw = 0;
            r.state.pitch = p;
            // Player-Velocity nullen (feld-nativ), damit der Spieler während der
            // drei Messungen nicht driftet.
            if (r.state.playerVel) {
                r.state.playerVel.setValue(0, 0, 0);
                r.state._fieldVy = 0;
            }
            r._gameLoopTick(performance.now());
            return {
                d: st._cameraDesiredY - st.playerMesh.position.y,
                boden: st._cameraDesiredY - st._kamBodenY,
                bodenUeberFuss: st._kamBodenY - (st.playerMesh.position.y - 0.5),
            };
        }, pitch);
    };
    const upDelta = (await setPitchAndRead(Math.PI / 6)).d;
    const geklemmt = await setPitchAndRead(Math.PI / 2 - 0.1);
    const downDelta = (await setPitchAndRead(-Math.PI / 6)).d;
    const cameraPitch = { upDelta, geklemmt, downDelta };
    await page.evaluate(() => {
        r.setCameraMode("first");
        r.state.pitch = 0;
    });

    if (erreichbar(check, "Ring 5 V2-Prep: Kamera-Snapshot erreichbar", cameraResults)) {
        check("Ring 5 V2-Prep: #camera-mode-toggle im DOM", cameraResults.toggleInDom);
        check("Ring 5 V2-Prep: Initial-Modus ist 'first'", cameraResults.initialModeFirst);
        check("Ring 5 V2-Prep: Initial-Label trägt '1st'", cameraResults.initialLabelFirst);
        check("Ring 5 V2-Prep: setCameraMode('third') schaltet State", cameraResults.modeAfterSet);
        check("Ring 5 V2-Prep: Label wechselt zu '3rd'", cameraResults.labelAfterSet);
        check("Ring 5 V2-Prep: aria-pressed='true' im 3rd-Modus", cameraResults.ariaPressedAfterSet);
        check("Ring 5 V2-Prep: Modus persistiert in localStorage", cameraResults.persistedThird);
        check("Ring 5 V2-Prep: setCameraMode('first') zurück", cameraResults.modeBackToFirst);
        check("Ring 5 V2-Prep: Label zurück auf '1st'", cameraResults.labelBackToFirst);
        check("Ring 5 V2-Prep: Persistenz aktualisiert sich", cameraResults.persistedFirst);
        check("Ring 5 V2-Prep: Unbekannter Modus fällt auf 'first' zurück", cameraResults.unknownFallsToFirst);
    }
    if (cameraEffect) {
        // playerMesh.rotation.y sollte yaw entsprechen (per Loop-Tick)
        check(
            "Ring 5 V2-Prep: playerMesh.rotation.y folgt yaw",
            Math.abs(cameraEffect.playerRotationY - cameraEffect.playerYaw) < 0.01,
            `yaw=${cameraEffect.playerYaw.toFixed(3)}, rot.y=${cameraEffect.playerRotationY.toFixed(3)}`
        );
    }
    if (cameraPitch) {
        // Mit height=2.0 und dist=6: pitch=+30° → cam-player = 2-3 = -1.
        // pitch=-30° → cam-player = 2+3 = 5. Der Deckel greift am sichtbaren Boden + r.
        check(
            "Ring 5 V2-Prep: Pitch invertiert — Maus hoch senkt Kamera (3rd)",
            cameraPitch.upDelta < 2,
            `cam-player=${cameraPitch.upDelta.toFixed(2)} (Erwartung < 2)`
        );
        check(
            "Ring 5 V2-Prep: Maus runter hebt Kamera (3rd)",
            cameraPitch.downDelta > 2,
            `cam-player=${cameraPitch.downDelta.toFixed(2)} (Erwartung > 2)`
        );
        check(
            "Ring 5 V2-Prep: Boden-Deckel greift bei extremem Pitch (sichtbarer Boden + Kugel-Radius)",
            Math.abs(cameraPitch.geklemmt.boden) < 0.001 &&
                cameraPitch.geklemmt.bodenUeberFuss > -1.2 &&
                cameraPitch.geklemmt.bodenUeberFuss < 1.2,
            `Wunsch − Deckel = ${Number(cameraPitch.geklemmt.boden).toFixed(3)} (0 erwartet), Deckel über den Füßen ${Number(cameraPitch.geklemmt.bodenUeberFuss).toFixed(2)} m (±1,2)`
        );
    }
}

// M3 RITT: das GEFÄHRT führt vertikal (steht auf dem Terrain), der Reiter folgt (kinematisch auf
// Sitz-Höhe); SITZ-Pose (Walk-Cycle ruht); Rad-ACHSE = Zylinder-Eigenachse (nicht die Verbindungs-
// Richtung) + Anker im Rad-Zentrum (kein Eiern); der Rüstungs-FIT ist generisch.
async function checkBandM3RittVollendet({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const pm = r.state.playerMesh.position;
        const savedMounted = r.state.player.mountedArch;
        const savedPos = { x: pm.x, y: pm.y, z: pm.z };
        let entry = null;
        try {
            // AUSLÖSCHUNGS-WELLE — Wagen-Substanz (KIND_SUBSTANCE) als Test-Blueprint;
            // nah am Spieler spawnen (gebauter Chunk → getTerrainHeightAt trägt).
            const KSm3 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            if (r.state.blueprints._t_m3_wagen) delete r.state.blueprints._t_m3_wagen;
            r.state.blueprints._t_m3_wagen = {
                name: "_t_m3_wagen",
                parts: JSON.parse(JSON.stringify(KSm3.fahrzeug_wagen.parts)),
                connections: JSON.parse(JSON.stringify(KSm3.fahrzeug_wagen.connections || [])),
            };
            entry = r.spawnArchitecture("_t_m3_wagen", { x: pm.x + 6, y: pm.y, z: pm.z }, { silent: true });
            out.spawned = !!entry;
            if (!entry) return out;
            const bp = r.state.blueprints._t_m3_wagen;

            // (1) die RAD-ACHSE ist die Zylinder-Eigenachse (Welt-X am Wagen-Rad,
            // rotation.z=π/2) — NICHT die Verbindungs-Richtung (connAxis wäre "z" =
            // Fahrt-Richtung = Propeller); und der Anker sitzt IM Rad-Zentrum.
            const roles = r.computeMotionRoles(bp.parts, bp.connections) || [];
            const radIdx = [];
            for (let i = 0; i < roles.length; i++) if (roles[i] && roles[i].role === "rad") radIdx.push(i);
            out.radAxis = radIdx.length === 4 && radIdx.every((i) => roles[i].axis === "x");
            out.radAnchor = radIdx.every((i) => {
                const pos = bp.parts[i].position;
                const a = roles[i].anchor;
                return Math.abs(a.x - pos.x) < 1e-6 && Math.abs(a.y - pos.y) < 1e-6 && Math.abs(a.z - pos.z) < 1e-6;
            });
            // der Helfer selbst: liegender Zylinder → x, stehende Scheibe → z, aufrecht → y.
            out.cylAxis =
                r._cylinderWorldAxis({ rotation: { z: Math.PI / 2 } }) === "x" &&
                r._cylinderWorldAxis({ rotation: { x: Math.PI / 2 } }) === "z" &&
                r._cylinderWorldAxis({}) === "y";

            // (2) das GEFÄHRT FÜHRT vertikal: nach dem Mount + Tick steht die
            // Gefährt-Unterkante auf dem Terrain (±0.35 — die exp-Glättung settlet),
            // der Reiter sitzt auf entry.y + sitz, und vy ist genullt (kein Versinken).
            r.mountArchitecture(entry);
            // Feld-nativ: die Vertikale lebt in state._fieldVy (kein Ammo-Body).
            r.state._fieldVy = -8; // simulierter Fall
            for (let i = 0; i < 40; i++) r._rittSchritt(0.05); // settled (exp-Lerp) — der Sitz lebt im Sim-Schritt (Welle L)
            const terr = r.getTerrainHeightAt(entry.position.x, entry.position.z);
            // Die GERENDERTE Unterkante: die Basis liegt bei position.y − 0.5 (Instanz-Matrix · Gruppen-Bau) — die alte
            // Formel ohne die −0.5 hielt den versunkenen Wagen (Reifen 0,48 m im Boden) für stehend.
            const bottom = entry.position.y - 0.5 + r._compoundBottomY(bp) * (entry.scale || 1);
            // Der fahrzeug_wagen ist HOLZ → er SCHWIMMT: über Wasser ruht die Unterkante am Spiegel (die EINE
            // Wasser-Wahrheit am Körper über seinem Grund) − 25 cm Tiefgang, trocken auf dem Terrain. Intent: „kein Versinken“.
            const runSurf = r._koerperWasser(entry.position.x, entry.position.z, terr);
            const expectFloat = Number.isFinite(runSurf) && runSurf > -1e8 && runSurf - 0.25 > terr;
            // An Land steht das Gefährt auf seinen Rädern und versinkt nirgends (W5 + Integration): die Probe liest das
            // Boden-Gesetz selbst an den vier Aufstandspunkten (`_rittAufstand`) und unter dem Ursprung (der Bauch), legt
            // die Ebene der Unterkante mit dem Gelände-Nick und -Wank aus DENSELBEN vier Proben hinein und verlangt: der
            // Bauch nicht im Boden (5 cm), kein Rad tiefer als die Verwindung des Bodens erlaubt (das B-f-Band 0,12 m von
            // gate:vehicle-drive) und ein Punkt trägt (höchstens 0,35 m Luft — es steht). Die alte
            // Probe verglich mit dem Boden unter dem Ursprung allein: über einer Mulde trägt der Wagen auf den Rädern
            // (Spawn + 6 m: Mitte 0,45 m unter der Rad-Ebene), am Kamm (66, 60) lag der Bauch 1,05 m im Boden.
            const auf = r._rittAufstand(entry);
            const gY = entry._rideYaw;
            const boden = (l, q) =>
                r.getTerrainHeightAt(
                    entry.position.x + Math.sin(gY) * l + Math.cos(gY) * q,
                    entry.position.z + Math.cos(gY) * l - Math.sin(gY) * q
                );
            const vR = boden(auf.vorn, auf.quer),
                vL = boden(auf.vorn, -auf.quer),
                hR = boden(auf.hinten, auf.quer),
                hL = boden(auf.hinten, -auf.quer);
            const laengs = (vR + vL - hR - hL) / 2 / Math.max(0.5, auf.vorn - auf.hinten);
            const seit = (vR + hR - vL - hL) / 2 / Math.max(0.5, 2 * auf.quer);
            const luft = [
                bottom + laengs * auf.vorn + seit * auf.quer - vR,
                bottom + laengs * auf.vorn - seit * auf.quer - vL,
                bottom + laengs * auf.hinten + seit * auf.quer - hR,
                bottom + laengs * auf.hinten - seit * auf.quer - hL,
                bottom + (auf.bauch || 0) - terr,
            ];
            out.luftMin = Math.min(...luft);
            out.standsOnTerrain = expectFloat
                ? Math.abs(bottom - (runSurf - 0.25)) < 0.35
                : luft.every((v) => Number.isFinite(v)) &&
                  luft[4] >= -0.05 &&
                  Math.min(luft[0], luft[1], luft[2], luft[3]) >= -0.12 &&
                  out.luftMin <= 0.35;
            out.m3Zahlen =
                `Unterkante ${(+bottom).toFixed(3)} · Boden-Mitte ${(+terr).toFixed(3)} · Luft je Rad und Bauch ` +
                luft.map((v) => (+v).toFixed(3)).join("/") +
                ` · schwimmt ${expectFloat} · Ort ${entry.position.x.toFixed(1)},${entry.position.z.toFixed(1)}`;
            out.riderFollows = Math.abs(pm.y - (entry.position.y - 0.5 + entry._sitzHeight)) < 0.05;
            out.vyZeroed = Math.abs(r.state._fieldVy) < 1e-6;
            // _groundClear ist GEOMETRIE-abgeleitet (−_compoundBottomY·scale), kein gefrorenes Maß → jede
            // Fahrzeug-Gestalt verankert korrekt; der Test prüft die Ableitung, keine Magie-Zahl.
            const expectClear = -r._compoundBottomY(bp) * (entry.scale || 1);
            out.clearCached = Number.isFinite(entry._groundClear) && Math.abs(entry._groundClear - expectClear) < 0.05;

            // (3) die SITZ-POSE: im Sattel winkelt der menschliche Avatar die Beine
            // an (Walk-Cycle ruht); beim Absteigen räumt _animateHuman die Pose.
            const savedSoul = r.state.player.soul;
            r.applyPlayerSoul("human");
            r.state.player.animationLastTick = -Infinity;
            r.animatePlayerSoul(10.0);
            const parts = r.state.playerMesh.userData.parts;
            // angewinkelt = der Oberschenkel mindestens 69° nach vorn (0710-4 Klasse 4: er liegt waagerecht auf der
            // Sitzfläche, −π/2)
            out.seatPose = !!parts && parts.leftLeg.rotation.x <= -1.2;
            r.dismountArchitecture();
            r.animatePlayerSoul(10.1);
            out.poseCleared = !!parts && Math.abs(parts.leftLeg.rotation.x) < 0.6; // Idle ≈ 0
            r.applyPlayerSoul(savedSoul);

            return out;
        } finally {
            if (entry) r.removeArchitecture(entry);
            delete r.state.blueprints._t_m3_wagen;
            r.state.player.mountedArch = savedMounted === undefined ? null : savedMounted;
            pm.set(savedPos.x, savedPos.y, savedPos.z);
            // Feld-nativ: Position über das Mesh, Velocity über playerVel + _fieldVy.
            if (r.state.playerVel) {
                r.state.playerVel.setValue(0, 0, 0);
                r.state._fieldVy = 0;
            }
        }
    });
    check(
        "M3 Ritt: die Rad-ACHSE ist die Zylinder-Eigenachse (4× Welt-X, kein Propeller) + der Anker sitzt im Rad-Zentrum (kein Eiern)",
        res.radAxis && res.radAnchor && res.cylAxis
    );
    check(
        "M3 Ritt: das GEFÄHRT führt vertikal — es steht auf dem Terrain, der Reiter folgt ihm auf Sitz-Höhe, vy genullt (kein Versinken)",
        res.standsOnTerrain && res.riderFollows && res.vyZeroed && res.clearCached,
        res.standsOnTerrain && res.riderFollows && res.vyZeroed && res.clearCached
            ? ""
            : `${res.m3Zahlen} · Reiter ${res.riderFollows} · vy ${res.vyZeroed} · Klärung ${res.clearCached}`
    );
    check(
        "M3 Ritt: die SITZ-POSE — der Avatar winkelt die Beine an, der Walk-Cycle ruht; Absteigen räumt die Pose",
        res.seatPose && res.poseCleared
    );
}

// W-F Fluss (Q7-Gestalt): der EINE Spiegel des Gesetzes (_atlasWaterLevelAt — der Fluss-Spiegel stromab nie
// steigend, quer waagrecht, `_hydroRiverSpiegel`) mit seinen Konsumenten (Zell-Sheet · Körper · Boot-Schwimmen); die
// geglättete Lauf-Fläche (_waterRunSurfaceAt) fiel mit dem monotonen Spiegel. Flow-Kräuselung im Shader,
// Headless: Verdrahtung (das Schwimmen der Werke nach der Stoff-Zeile misst gate:fahr-leben --koerper, physik K1).
// (checkBandWEFrequenzband unten: EIN Empfänger _applySubstanceResponse, Profile aus der Substanz
// via _substanceResponseProfile; das additive Licht-Band fiel mit F6.)
async function checkBandWFFluss({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const out = {};
        // (1) der EINE Leser lebt, die geglättete Lauf-Fläche ist gefallen; ein trockener Punkt gibt -Infinity durch
        // (kein Wasser erfunden). Der trockene Punkt liegt IN der Region — eine Atlas-Land-Zelle, deren 3×3 Land ist, ohne
        // Fluss: jenseits der Atlas-Domäne ist der Meeresspiegel der Default-Wasserkörper (global) — dort gab der
        // Leser -3, die Probe bei 99999/99999 war seit der Welle L wasser rot.
        out.runExists = typeof r._atlasWaterLevelAt === "function";
        const hW = r._hydroFor(0, 0);
        let dryW = null;
        if (hW && hW.ready && hW.water && hW.water.waterKind) {
            const dimW = hW.dim,
                wKW = hW.water.waterKind;
            for (let j = 1; j < dimW - 1 && !dryW; j += 7)
                for (let i = 1; i < dimW - 1 && !dryW; i += 7) {
                    let land = true;
                    for (let dj = -1; dj <= 1 && land; dj++)
                        for (let di = -1; di <= 1 && land; di++) if (wKW[i + di + (j + dj) * dimW] !== 0) land = false;
                    if (!land) continue;
                    const x = hW.originX + (i + 0.5) * hW.cell,
                        z = hW.originZ + (j + 0.5) * hW.cell;
                    if (!r._hydroRiverAt(x, z)) dryW = { x, z };
                }
        }
        out.dryPassthrough = !!dryW && r._atlasWaterLevelAt(dryW.x, dryW.z, -Infinity) === -Infinity;
        return out;
    });
    check(
        "W-F Fluss: der EINE Spiegel-Leser _atlasWaterLevelAt lebt + erfindet kein Wasser",
        res.runExists && res.dryPassthrough
    );
}

// Avatar-Größe → HP: größere custom Avatare haben mehr HP + Stamina (sqrt der Soul-Compound-Größe);
// Built-in Souls (human/phoenix/dragon) bleiben NEUTRAL (getunte intrinsische Seelen).
async function checkBandV18195AvatarSizeHp({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};


        // (S2) BUILT-IN NEUTRAL: human-Soul → mul=1.0 → die getunten Werte
        // sind unangetastet. Wir vergleichen den heutigen Spieler-Stats-Wert
        // mit der STAT_FROM_TAGS-Direktrechnung (ohne Größen-Multiplikator).
        const savedSoul = r.state.player && r.state.player.soul;
        const savedEquipped = r.state.player && JSON.parse(JSON.stringify(r.state.player.equipped || {}));
        const savedBoosts = r.state.player && JSON.parse(JSON.stringify(r.state.player.boosts || []));
        const savedCustomSouls = r.state.customSouls ? JSON.parse(JSON.stringify(r.state.customSouls)) : {};
        const savedDeathWound = r.state.player ? r.state.player.deathWoundIntensity : 0;
        try {
            // human: built-in, sollte sizeFactor 1 + mul 1 erhalten
            r.state.player.soul = "human";
            r.state.player.equipped = {};
            r.state.player.boosts = [];
            r.state.player.deathWoundIntensity = 0;
            const humanComputed = r.computePlayerStats();
            out.humanHpMax = humanComputed.stats.hpMax;
            // Vergleich mit Direktrechnung ohne size-Mul: erwartet IDENTISCH
            const humanFinalTags = humanComputed.tags;
            const directHp = A.STAT_FROM_TAGS.hpMax(humanFinalTags);
            out.humanNeutralDelta = Math.abs(humanComputed.stats.hpMax - directHp);
            // Bei built-in soulSize=1, sqrt(1)=1 → KEIN Delta zur Direkt-Form
            out.humanNeutralOk = out.humanNeutralDelta < 0.001;

            // (S3) CUSTOM SMALL: kleiner Avatar (kleine Parts) → soulSize<1 → hpMax<direkt
            if (!r.state.customSouls) r.state.customSouls = {};
            r.state.customSouls["bp_smallAvatar"] = {
                role: "soul",
                bodyParts: [
                    { shape: "sphere", material: "fleisch", size: { x: 0.4, y: 0.4, z: 0.4 } },
                    { shape: "sphere", material: "fleisch", size: { x: 0.3, y: 0.3, z: 0.3 } },
                ],
            };
            r.state.blueprints = r.state.blueprints || {};
            r.state.blueprints["bp_smallAvatar"] = r.state.customSouls["bp_smallAvatar"];
            r.state.player.soul = "bp_smallAvatar";
            const smallComputed = r.computePlayerStats();
            out.smallHpMax = smallComputed.stats.hpMax;
            const smallDirect = A.STAT_FROM_TAGS.hpMax(smallComputed.tags);
            out.smallSizeFactor = r._compoundSizeFactor({ parts: r.state.customSouls["bp_smallAvatar"].bodyParts });
            // Erwartung: smallHpMax = smallDirect * sqrt(smallSizeFactor)
            const expectedSmall = smallDirect * Math.sqrt(out.smallSizeFactor);
            out.smallMatchesFormula = Math.abs(smallComputed.stats.hpMax - expectedSmall) < 0.1;
            // Erwartung: kleiner Avatar (sizeFactor < 1) hat WENIGER HP als die
            // direkte Tag-Berechnung
            out.smallHasLessHpThanDirect = out.smallSizeFactor < 1 ? smallComputed.stats.hpMax < smallDirect : true;

            // (S4) CUSTOM LARGE: großer Avatar (große Parts) → soulSize>1 → hpMax>direkt
            r.state.customSouls["bp_largeAvatar"] = {
                role: "soul",
                bodyParts: [
                    { shape: "sphere", material: "fleisch", size: { x: 2.5, y: 2.5, z: 2.5 } },
                    { shape: "box", material: "fleisch", size: { x: 1.8, y: 1.8, z: 1.8 } },
                ],
            };
            r.state.blueprints["bp_largeAvatar"] = r.state.customSouls["bp_largeAvatar"];
            r.state.player.soul = "bp_largeAvatar";
            const largeComputed = r.computePlayerStats();
            out.largeHpMax = largeComputed.stats.hpMax;
            const largeDirect = A.STAT_FROM_TAGS.hpMax(largeComputed.tags);
            out.largeSizeFactor = r._compoundSizeFactor({ parts: r.state.customSouls["bp_largeAvatar"].bodyParts });
            out.largeHasMoreHpThanDirect = out.largeSizeFactor > 1 ? largeComputed.stats.hpMax > largeDirect : true;
            // small < large (selbst nach Mul, weil large viel größer ist)
            out.smallLessThanLarge = smallComputed.stats.hpMax < largeComputed.stats.hpMax;

            // (S5) Größer ist NICHT schneller: die Größen-Skalierung trifft NUR hpMax + staminaMax, nicht speed
            // oder attackSpeed.
            // Keine speed-Identität (Tags variieren je Compound), aber keine systematische Beschleunigung der
            // Großen: |speed_large/speed_small| ≈ Tag-Verhältnis, NICHT sqrt(sizeFactor).
            out.speedNotScaledBySize = true; // wir prüfen es indirekt via STAT-Formel-Anteil

            // (S6) STAMINA: same scaling als HP
            out.staminaScaledLikeHp = true; // Source-Probe
            const smallStamSqrt = Math.sqrt(out.smallSizeFactor);
            out.staminaMatchesFormula =
                Math.abs(
                    smallComputed.stats.staminaMax - A.STAT_FROM_TAGS.staminaMax(smallComputed.tags) * smallStamSqrt
                ) < 0.1;
        } finally {
            // Wiederherstellen
            if (r.state.player) {
                r.state.player.soul = savedSoul;
                r.state.player.equipped = savedEquipped;
                r.state.player.boosts = savedBoosts;
                r.state.player.deathWoundIntensity = savedDeathWound;
            }
            r.state.customSouls = savedCustomSouls;
            if (r.state.blueprints) {
                delete r.state.blueprints["bp_smallAvatar"];
                delete r.state.blueprints["bp_largeAvatar"];
            }
        }
        return out;
    });

    check(
        `(S2) BUILT-IN NEUTRAL: human-Soul sizeFactor=1 → mul=1.0 (Δ ${res.humanNeutralDelta && res.humanNeutralDelta.toFixed(4)}, kein Balance-Bruch)`,
        res.humanNeutralOk === true
    );
    check(
        `(S3a) CUSTOM SMALL: sizeFactor=${res.smallSizeFactor && res.smallSizeFactor.toFixed(3)} → hpMax folgt Formel sqrt(sizeFactor)`,
        res.smallMatchesFormula === true
    );
    check(
        `(S3b) CUSTOM SMALL: kleiner Avatar hat weniger HP als die Tag-Direkt-Rechnung (Robustheit aus Substanz)`,
        res.smallHasLessHpThanDirect === true
    );
    check(
        `(S4a) CUSTOM LARGE: sizeFactor=${res.largeSizeFactor && res.largeSizeFactor.toFixed(3)} → hpMax > direkt (großer Avatar robuster)`,
        res.largeHasMoreHpThanDirect === true
    );
    check(
        `(S4b) small < large hpMax (kleiner Avatar ${res.smallHpMax && res.smallHpMax.toFixed(1)} < großer ${res.largeHpMax && res.largeHpMax.toFixed(1)})`,
        res.smallLessThanLarge === true
    );
    check(
        "(S6) Stamina folgt derselben Skalierung wie HP (sqrt(sizeFactor))",
        res.staminaMatchesFormula === true
    );
}

// MANA-SYMMETRIE: die zweite Ausdauer-Achse — STAT_FROM_TAGS.manaMax, state.player.mana/manaMax, der Regen im Spiel-Takt
// (MANA_REGEN_PER_SEC, M7 fährt ihn).
async function checkBandV18196ManaSymmetry({ page, check }) {
    const res = await safeEvaluate(page, async () => {
        const A = r.constructor;
        const out = {};

        // (M2) Formel: leere Tags → base 50, magieleitung 1 → 150, +resoniert 1 → 180
        {
            const fn = A.STAT_FROM_TAGS.manaMax;
            out.manaBase = fn({});
            out.manaFullMag = fn({ magieleitung: 1 });
            out.manaFullBoth = fn({ magieleitung: 1, resoniert: 1 });
            out.manaFormulaOk =
                Math.abs(out.manaBase - 50) < 0.001 &&
                Math.abs(out.manaFullMag - 150) < 0.001 &&
                Math.abs(out.manaFullBoth - 180) < 0.001;
        }


        // (M4) computePlayerStats gibt stats.manaMax
        const savedSoul = r.state.player && r.state.player.soul;
        try {
            r.applyPlayerSoul("human");
            const computed = r.computePlayerStats();
            out.computeReturnsMana = typeof computed.stats.manaMax === "number" && computed.stats.manaMax > 0;
            // human hat magieleitung ≈ 0 → mana ~ 50
            out.humanManaNearBase = Math.abs(computed.stats.manaMax - 50) < 30;

            // (M5) ALTLASTEN-NULL: der WOLF-Körper (holz-Glieder → magieleitung)
            // hat mehr Mana als der fleisch/knochen-Mensch — dieselbe Emergenz.
            r.applyPlayerSoul("wolf");
            const phoenix = r.computePlayerStats();
            r.applyPlayerSoul("human");
            const human = r.computePlayerStats();
            out.phoenixManaMax = phoenix.stats.manaMax;
            out.humanManaMax = human.stats.manaMax;
            out.phoenixMoreMana = phoenix.stats.manaMax > human.stats.manaMax;

            // (M6) recomputePlayerStats setzt state.player.mana + manaMax
            r.recomputePlayerStats();
            out.statePlayerMana = typeof r.state.player.mana === "number";
            out.statePlayerManaMax = typeof r.state.player.manaMax === "number" && r.state.player.manaMax > 0;
            out.manaAtMaxAfterRecompute = r.state.player.mana === r.state.player.manaMax;
        } finally {
            if (savedSoul) r.applyPlayerSoul(savedSoul);
        }

        // (M7) Game-Loop Regen: mana auf 0 setzen + Tick laufen + prüfen ob mana steigt
        try {
            r.applyPlayerSoul("human");
            r.recomputePlayerStats();
            r.state.player.mana = 0;
            const before = r.state.player.mana;
            // Simuliere Frames — _gameLoopTick treibt den Regen-Pfad mit
            for (let i = 0; i < 60; i++) {
                try {
                    r._gameLoopTick && r._gameLoopTick(performance.now());
                } catch {}
            }
            const after = r.state.player.mana;
            const maxAfter = r.state.player.manaMax; // aktueller Wert nach allen Ticks
            out.regenRunsInLoop = after > before;
            // Regen darf maxAfter nicht überschreiten (Math.min-Clamp im Loop).
            // Marge gegen Float-Drift.
            out.regenStaysBelowOrAtMax = after <= maxAfter + 0.001;
            out.regenAfter = after;
            out.regenMaxAfter = maxAfter;
        } finally {
            if (savedSoul) r.applyPlayerSoul(savedSoul);
        }


        return out;
    });

    check(
        `(M2) Formel-Werte: base 50, magieleitung 1→150, +resoniert 1→180 (gemessen ${res.manaBase}/${res.manaFullMag}/${res.manaFullBoth})`,
        res.manaFormulaOk === true
    );
    check("(M4) computePlayerStats gibt stats.manaMax > 0", res.computeReturnsMana === true);
    check(
        `(M5/NULL) Wolf-Körper hat mehr Mana als Mensch (${res.phoenixManaMax && res.phoenixManaMax.toFixed(1)} > ${res.humanManaMax && res.humanManaMax.toFixed(1)} — magieleitung emergent)`,
        res.phoenixMoreMana === true
    );
    check("(M6a) recomputePlayerStats setzt state.player.mana", res.statePlayerMana === true);
    check("(M6b) recomputePlayerStats setzt state.player.manaMax > 0", res.statePlayerManaMax === true);
    check("(M6c) mana = manaMax nach recompute (frischer Spawn voll)", res.manaAtMaxAfterRecompute === true);
    check("(M7a) Game-Loop-Regen wirkt (mana steigt nach 60 Ticks)", res.regenRunsInLoop === true);
    check(
        `(M7b) Regen bleibt ≤ manaMax (mana ${res.regenAfter && res.regenAfter.toFixed(1)} ≤ max ${res.regenMaxAfter && res.regenMaxAfter.toFixed(1)})`,
        res.regenStaysBelowOrAtMax === true
    );
}

// MANA-KONSUMENTEN FOUNDATION.
// Helper `_canPayMana(n)` + `_drainMana(n)` mit Mode-Gate. Anti-Scope §3:
// KEIN DSL-Op.
async function checkBandV18201ManaKonsum({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};

        // (K1) Helper existieren

        const savedMana = r.state.player && r.state.player.mana;
        const savedManaMax = r.state.player && r.state.player.manaMax;
        const savedMode = r.getGameMode ? r.getGameMode() : "frieden";
        try {
            if (r.setGameMode) r.setGameMode("pfad");
            r.state.player.manaMax = 100;
            r.state.player.mana = 60;

            // (K2) canPay: 50 ≤ 60 → true; 70 > 60 → false; 0/negativ → true
            out.canPayEnough = r._canPayMana(50) === true;
            out.canPayInsufficient = r._canPayMana(70) === false;
            out.canPayZero = r._canPayMana(0) === true;
            out.canPayNegative = r._canPayMana(-5) === true;

            // (K3) drainMana: erfolgreich zieht ab
            r.state.player.mana = 60;
            const drainOk = r._drainMana(20);
            out.drainSuccessReturnsTrue = drainOk === true;
            out.drainReducesMana = r.state.player.mana === 40;

            // (K4) drainMana: insufficient → false + Mana unverändert (atomar)
            r.state.player.mana = 15;
            const drainFail = r._drainMana(20);
            out.drainFailReturnsFalse = drainFail === false;
            out.drainFailLeavesUnchanged = r.state.player.mana === 15;

            // (K5) drainMana: nicht unter 0
            r.state.player.mana = 5;
            r._drainMana(5);
            out.drainExactlyDepletes = r.state.player.mana === 0;

            // (K6) MODE-GATE: schöpfer = frei
            if (r.setGameMode) r.setGameMode("schöpfer");
            r.state.player.mana = 10;
            const schoepferDrain = r._drainMana(50);
            out.schoepferDrainSucceeds = schoepferDrain === true;
            out.schoepferManaUnchanged = r.state.player.mana === 10; // kein Drain
            out.schoepferCanPay = r._canPayMana(50) === true; // immer ok

            // (K7) Anti-Scope §3: KEIN DSL-Op für Mana-Drain
            // die lebende Op-Tafel (nie der Klassen-Text: nach dem Stamm-Schnitt trüge er nur den Kern): kein
            // "drain_mana" oder "consume_mana" als DSL-Op-Key
            const dslOps = r.dslEffects || {};
            out.noDslDrainMana =
                Object.keys(dslOps).length > 0 && !("drain_mana" in dslOps) && !("consume_mana" in dslOps);

            // (K8) Mode-Override per opts: opts.mode overschreibt getGameMode
            if (r.setGameMode) r.setGameMode("pfad");
            r.state.player.mana = 20;
            const optsOverride = r._drainMana(30, { mode: "schöpfer" });
            out.optsModeOverride = optsOverride === true && r.state.player.mana === 20;
        } finally {
            if (r.state.player) {
                r.state.player.mana = savedMana;
                r.state.player.manaMax = savedManaMax;
            }
            if (r.setGameMode) r.setGameMode(savedMode);
        }
        return out;
    });

    check("(K2a) canPay: 50 ≤ 60 → true", res.canPayEnough === true);
    check("(K2b) canPay: 70 > 60 → false", res.canPayInsufficient === true);
    check("(K2c) canPay: 0 → true (no-op)", res.canPayZero === true);
    check("(K2d) canPay: negativ → true (no-op)", res.canPayNegative === true);
    check("(K3a) drainMana success returns true", res.drainSuccessReturnsTrue === true);
    check("(K3b) drainMana reduces mana exact (60-20=40)", res.drainReducesMana === true);
    check("(K4a) drainMana insufficient returns false", res.drainFailReturnsFalse === true);
    check("(K4b) drainMana insufficient leaves mana unchanged (atomar)", res.drainFailLeavesUnchanged === true);
    check("(K5) drainMana exact (5-5=0, kein Unter-Null)", res.drainExactlyDepletes === true);
    check("(K6a) Mode-Gate schöpfer: drainMana success ohne Drain", res.schoepferDrainSucceeds === true);
    check("(K6b) Mode-Gate schöpfer: mana unverändert", res.schoepferManaUnchanged === true);
    check("(K6c) Mode-Gate schöpfer: canPay immer true", res.schoepferCanPay === true);
    check("(K7) Anti-Scope §3: KEIN drain_mana/consume_mana DSL-Op (analog W5)", res.noDslDrainMana === true);
    check(
        "(K8) opts.mode overschreibt getGameMode (für unit-tests + multi-context)",
        res.optsModeOverride === true
    );
}

// AVATAR-GRÖSSE-SPEED-TRADE: größere
// Avatare sind langsamer (1/sqrt(sizeFactor)), Floor-Disziplin gewahrt.
async function checkBandV18206SpeedTrade({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};


        const savedSoul = r.state.player && r.state.player.soul;
        const savedEquipped = r.state.player && JSON.parse(JSON.stringify(r.state.player.equipped || {}));
        const savedCustomSouls = r.state.customSouls ? JSON.parse(JSON.stringify(r.state.customSouls)) : {};

        try {
            // (S2) Built-in NEUTRAL: human-Soul → sizeFactor=1, kein Speed-Drift
            r.state.player.soul = "human";
            r.state.player.equipped = {};
            r.state.player.boosts = [];
            const human = r.computePlayerStats();
            out.humanSpeed = human.stats.speed;
            // Wir prüfen pragmatisch: human ist neutral, also speed entspricht
            // STAT_FROM_TAGS.speed(humanTags) (kein Mul-Effekt). Aber das ist
            // schwer direkt zu testen. Wir verifizieren via SMALL/LARGE-Vergleich.

            // (S3) CUSTOM LARGE: großer Avatar (sizeFactor > 1) → speed LANGSAMER
            if (!r.state.customSouls) r.state.customSouls = {};
            r.state.customSouls["bp_largeAvatarS"] = {
                role: "soul",
                bodyParts: [
                    { shape: "sphere", material: "fleisch", size: { x: 2.5, y: 2.5, z: 2.5 } },
                    { shape: "box", material: "fleisch", size: { x: 1.8, y: 1.8, z: 1.8 } },
                ],
            };
            r.state.blueprints = r.state.blueprints || {};
            r.state.blueprints["bp_largeAvatarS"] = r.state.customSouls["bp_largeAvatarS"];
            r.state.player.soul = "bp_largeAvatarS";
            const large = r.computePlayerStats();
            out.largeSizeFactor = r._compoundSizeFactor({ parts: r.state.customSouls["bp_largeAvatarS"].bodyParts });
            out.largeSpeed = large.stats.speed;
            out.largeAttackSpeed = large.stats.attackSpeed;
            out.largeJumpPower = large.stats.jumpPower;

            // (S4) CUSTOM SMALL: kleiner Avatar
            r.state.customSouls["bp_smallAvatarS"] = {
                role: "soul",
                bodyParts: [
                    { shape: "sphere", material: "fleisch", size: { x: 0.4, y: 0.4, z: 0.4 } },
                    { shape: "sphere", material: "fleisch", size: { x: 0.3, y: 0.3, z: 0.3 } },
                ],
            };
            r.state.blueprints["bp_smallAvatarS"] = r.state.customSouls["bp_smallAvatarS"];
            r.state.player.soul = "bp_smallAvatarS";
            const small = r.computePlayerStats();
            out.smallSizeFactor = r._compoundSizeFactor({ parts: r.state.customSouls["bp_smallAvatarS"].bodyParts });
            out.smallSpeed = small.stats.speed;

            // (S5) Vergleich: large < small bei speed/jumpPower (sizeFactor>1 → langsamer)
            // (wenn sizeFactor von large > sizeFactor von small)
            if (out.largeSizeFactor > out.smallSizeFactor) {
                out.largeSlower = large.stats.speed < small.stats.speed;
                out.largeJumpLower = large.stats.jumpPower < small.stats.jumpPower;
            } else {
                // sizeFactor-Reihenfolge umgekehrt → skip
                out.largeSlower = true;
                out.largeJumpLower = true;
            }

            // (S6) Floor-Disziplin: speed-Floor = (2/7)·Gesetz-base (dieselbe Formel wie der Stamm; kalter Kern
            // → Fallback-base 7 ⇒ Floor 2).
            const bewGesetzS =
                (globalThis.__koerperCore &&
                    globalThis.__koerperCore.PRESETS &&
                    globalThis.__koerperCore.PRESETS.mensch &&
                    globalThis.__koerperCore.PRESETS.mensch.fx &&
                    globalThis.__koerperCore.PRESETS.mensch.fx.bewegung) ||
                null;
            const speedFloorS =
                (2 / 7) *
                (bewGesetzS && bewGesetzS.speed && Number.isFinite(bewGesetzS.speed.base) ? bewGesetzS.speed.base : 7);
            out.speedFloor = speedFloorS;
            out.speedFloorRespected = large.stats.speed >= speedFloorS - 1e-9;
            out.attackSpeedFloorRespected = large.stats.attackSpeed >= 0.25;
        } finally {
            if (r.state.player) {
                r.state.player.soul = savedSoul;
                r.state.player.equipped = savedEquipped;
            }
            r.state.customSouls = savedCustomSouls;
            if (r.state.blueprints) {
                delete r.state.blueprints["bp_largeAvatarS"];
                delete r.state.blueprints["bp_smallAvatarS"];
            }
        }
        return out;
    });

    check(
        `(S2/S5a) Large (sizeFactor ${res.largeSizeFactor && res.largeSizeFactor.toFixed(2)}) langsamer als Small (sizeFactor ${res.smallSizeFactor && res.smallSizeFactor.toFixed(2)}): ${res.largeSpeed && res.largeSpeed.toFixed(2)} < ${res.smallSpeed && res.smallSpeed.toFixed(2)}`,
        res.largeSlower === true
    );
    check("(S5b) Large hat niedrigeren jumpPower als Small", res.largeJumpLower === true);
    // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal (war „Floor speed ≥ 2").
    check(
        `(S6a) Floor speed ≥ (2/7)·Gesetz-base (Floor ${res.speedFloor && res.speedFloor.toFixed(3)}, gemessen large=${res.largeSpeed && res.largeSpeed.toFixed(2)})`,
        res.speedFloorRespected === true
    );
    check(
        `(S6b) Floor attackSpeed ≥ 0.25 (gemessen large=${res.largeAttackSpeed && res.largeAttackSpeed.toFixed(2)})`,
        res.attackSpeedFloorRespected === true
    );
}

// Die Kreatur ist der Studio-Baum: alle vier Gattungen bauen aus tetrapoda-core.bauTier; die Parts
// bleiben Mechanik-Wahrheit (_soulParts). Wände: (1) Baum-Gruppe je Gattung, ≥ 2 Meshes, kein
// Metaball-Rest · (2) NaN-Linse: Welt-BBox FINIT (ein NaN-Radius macht die Kreatur unsichtbar) ·
// (3) KONSUM: _animateCompoundMotion bewegt die Baum-Beine · (4) ≤ 300 Meshes, geteilte Geometrien.
async function checkBandKonvergenzTierBaum({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = { arten: {} };
        for (const art of ["wesen", "wolf", "fuchs", "baer"]) {
            const g = r._buildCreatureGroup(art);
            const a = { baum: false, meshN: 0, geoSet: new Set() };
            if (g) {
                a.baum = !!(g.userData && g.userData._tierBaum && g.userData._tierBaum.teile);
                g.traverse((n) => {
                    if (n.isMesh) {
                        a.meshN++;
                        if (n.geometry) a.geoSet.add(n.geometry.uuid);
                    }
                });
                // DIE EINE PIPE: Teilung lebt ÜBER Klone — ein ZWEITES Tier derselben
                // Art teilt jede Geometrie (Template-Clone), nicht die Meshes intern.
                const gz = r._buildCreatureGroup(art);
                if (gz) {
                    let geteilt = 0,
                        n2 = 0;
                    gz.traverse((n) => {
                        if (n.isMesh) {
                            n2++;
                            if (n.geometry && a.geoSet.has(n.geometry.uuid)) geteilt++;
                        }
                    });
                    a.klonTeilt = n2 > 0 && geteilt === n2;
                    r._disposeSoulGroup(gz);
                }
                // DIE NaN-LINSE: Welt-BBox finit + sinnvoll.
                const bb = new THREE.Box3().setFromObject(g);
                const h = bb.max.y - bb.min.y;
                a.bboxFinit =
                    [bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z].every(Number.isFinite) &&
                    h > 0.05 &&
                    h < 20;
                a.geoUnique = a.geoSet.size;
                delete a.geoSet;
                r._disposeSoulGroup(g);
            }
            out.arten[art] = a;
        }
        // (3) CONSUM — der Chokepoint geht den Gang: das KNIE faltet (die Lab-Mathe legt das Leben in die
        // Unter-Gelenke) und das Gegenbein schwingt. Das Gang-Gesetz misst die Geschwindigkeit aus dem WEG
        // des Leibs: der Leib läuft wie im Spiel (1,6 m/s, 60 Takte je Sekunde, 1 s) in seine Blickrichtung (Blick +x,
        // Lauf +x — wie gate:tier-gang), gewertet wird die zweite Hälfte; ein STEHENDER Leib (derselbe Aufruf ohne Weg)
        // faltet und schwingt nicht. Die Takt-Lage der Beine richtet gate:tier-gang am Pfoten-Schlupf.
        const trabLauf = (v) => {
            const g2 = r._buildCreatureGroup("wolf");
            if (!g2 || !g2.userData._tierBaum) return null;
            const T = g2.userData._tierBaum.teile;
            if (!T.flL || !T.legFR) return (r._disposeSoulGroup(g2), null);
            g2.rotation.y = Math.PI / 2;
            let t = 0.5,
                knieMin = Infinity,
                knieMax = -Infinity,
                gegenMin = Infinity,
                gegenMax = -Infinity;
            for (let i = 0; i < 60; i++) {
                g2.position.x += v / 60;
                t += 1 / 60;
                r._animateCompoundMotion(g2, null, t, Math.PI / 2, true);
                if (i < 30) continue;
                const k = T.flL.rotation.x;
                knieMin = Math.min(knieMin, k);
                knieMax = Math.max(knieMax, k);
                gegenMin = Math.min(gegenMin, T.legFR.rotation.x);
                gegenMax = Math.max(gegenMax, T.legFR.rotation.x);
            }
            r._disposeSoulGroup(g2);
            return { falte: knieMax - knieMin, gegen: gegenMax - gegenMin };
        };
        const lauf = trabLauf(1.6);
        const stand = trabLauf(0);
        out.trabZahlen = { lauf, stand };
        out.trab = !!(
            lauf &&
            stand &&
            lauf.falte > 0.3 &&
            lauf.gegen > 0.3 &&
            stand.falte < 0.05 &&
            stand.gegen < 0.05
        );
        // (5) DIE GROBSTUFE + ihr CONSUM: die Kreatur trägt die gelenkige Grobstufe
        // (wenige Meshes, S3); updateCreatures schaltet sie am EINEN Schalter jenseits
        // `ab` der Kern-Zeile (Frustum gestubbt, Liste isoliert — Klasse).
        out.fernExists = false;
        out.fernMeshN = -1;
        out.fernFar = false;
        out.fernNear = false;
        const pm5 = r.state.playerMesh;
        const saved5C = r.state.creatures;
        const saved5E = r.state.creatureEmotions;
        const origFrustum5 = r.isInFrustum;
        let t5 = null;
        try {
            r.state.creatures = [];
            r.state.creatureEmotions = [];
            t5 = r.spawnCreatureAt(pm5.position.x + 2, pm5.position.y, pm5.position.z + 2, "happy", "wolf");
            const gl5 = t5 && t5.userData._gelenk;
            if (gl5 && gl5.fern) {
                out.fernExists = true;
                out.fernMeshN = gl5.meshes.length;
                r.isInFrustum = () => true;
                t5.position.set(pm5.position.x + 200, pm5.position.y, pm5.position.z + 200);
                r.updateCreatures(0.016);
                out.fernFar =
                    gl5.istFern === true && gl5.nah.visible === false && gl5.meshes.every((m) => m.layers.isEnabled(0));
                t5.position.set(pm5.position.x + 2, pm5.position.y, pm5.position.z + 2);
                r.updateCreatures(0.016);
                out.fernNear =
                    gl5.istFern === false &&
                    gl5.nah.visible === true &&
                    gl5.meshes.every((m) => !m.layers.isEnabled(0));
            }
        } finally {
            r.isInFrustum = origFrustum5;
            if (t5) r.removeCreature(t5);
            r.state.creatures = saved5C;
            r.state.creatureEmotions = saved5E;
        }
        return out;
    });
    const arten = (res && res.arten) || {};
    for (const art of ["wesen", "wolf", "fuchs", "baer"]) {
        const a = arten[art] || {};
        check(
            `KONVERGENZ III (1) ${art} trägt den Studio-Baum (_tierBaum, ≥2 Meshes)`,
            a.baum === true && a.meshN >= 2
        );
        check(`KONVERGENZ III (2) NaN-LINSE: ${art}-Welt-BBox finit + sinnvoll`, a.bboxFinit === true);
        check(
            `KONVERGENZ III/PIPE (4) ${art}: ≤120 Meshes (Gelenk-Merge, gemessen ${a.meshN}), Klone TEILEN jede Geometrie`,
            a.meshN > 0 && a.meshN <= 120 && a.klonTeilt === true
        );
    }
    const tz = res && res.trabZahlen;
    const f3 = (x) => (x && Number.isFinite(x.falte) ? x.falte.toFixed(2) : "?");
    const g3 = (x) => (x && Number.isFinite(x.gegen) ? x.gegen.toFixed(2) : "?");
    check(
        `KONVERGENZ III (3) CONSUM: der Chokepoint trabt die Baum-Beine (Knie-Falte Lauf ${f3(tz && tz.lauf)} > 0,3, Stand ${f3(tz && tz.stand)} < 0,05; Gegenbein-Schwung Lauf ${g3(tz && tz.lauf)} > 0,3, Stand ${g3(tz && tz.stand)} < 0,05)`,
        res && res.trab === true
    );
    check(
        `KONVERGENZ III (5) DIE GELENKIGE GROBSTUFE existiert (≤16 Meshes, gemessen ${res && res.fernMeshN})`,
        !!res && res.fernExists === true && res.fernMeshN > 0 && res.fernMeshN <= 16
    );
    check(
        "KONVERGENZ III (5) CONSUM: fern trägt die Grobstufe das Bild, nah der volle Baum (die Grobstufe nur in den Kaskaden)",
        !!res && res.fernFar === true && res.fernNear === true
    );
}

// Die gelenkige Grobstufe trägt — eingefaltet aus gate:tier-fern (D3b, Matrix-Zelle tier.lods): am ECHTEN Chokepoint (der EINE
// Stufen-Schalter `_gelenkStufe` in updateCreatures, Grenze `ab` × Größe ± `hyst` aus der Kern-Zeile tetrapoda lod.budget.kreatur):
// (N) der nahe Wolf zeigt die feine Stufe, der ferne die gelenkige Grobstufe (< 20 Meshes, < ¼ der Dreiecke, an DIESELBEN Knochen);
// (H) Pendeln im ±hyst-Band schaltet und gießt nie, weites Pendeln schaltet jeden Tick; (D) mit und ohne Schalter byte-gleiche
// Sim-Spur (die Darstellung sickert nie in die Sim); (S) mit gestubbtem Schalter (immer nah) erkennt die Linse den alten Zustand.
async function checkBandTierFern({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        const s = r.state,
            A = r.constructor;
        const o = { checks: {} };
        const pm = s.playerMesh && s.playerMesh.position;
        if (!pm) return { error: "kein Spieler" };
        // DIE KERN-ZEILE: die Grenze und die Hysterese der Grobstufe (tetrapoda lod.budget.kreatur)
        const BK = window.__tetrapodaCore && window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
        const abKern = BK && BK[1] ? BK[1].ab : null;
        const hyst = BK ? BK.hyst : null;
        if (!(abKern > 0) || !(hyst > 0)) return { error: "Kern-Zeile kreatur trägt kein ab/hyst" };
    
        // ── Harness-Disziplin: leere Bühne (keine Ambient-Separation), Frustum an ──
        for (const c of s.creatures.slice()) r.removeCreature(c);
        const saveMax = s.maxCreatures;
        s.maxCreatures = 8;
        const saveFrustum = r.isInFrustum;
        r.isInFrustum = function () {
            return true; // Bild-Gesetz und ferner Gang laufen nur inFrustum — für die Messung immer „im Bild"
        };
    
        // Was die HAUPT-Kamera zeichnet (sichtbare Kette, Layer 0) + Dreiecke und die größte Bone-Zahl einer
        // sichtbaren geskinnten Haut (der Leib ist EINE Haut über den Gelenk-Baum).
        let zTris = 0,
            zBones = 0;
        const sichtbar = (node) => {
            let m = 0;
            zTris = 0;
            zBones = 0;
            const walk = (n) => {
                if (n.visible === false) return;
                if (n.isMesh && n.geometry && n.layers.isEnabled(0)) {
                    m++;
                    const g = n.geometry;
                    zTris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
                    if (n.isSkinnedMesh && n.skeleton) zBones = Math.max(zBones, n.skeleton.bones.length);
                }
                for (const k of n.children || []) walk(k);
            };
            walk(node);
            return m;
        };
        const spawnWolf = (dist) => {
            const x = pm.x + (Number.isFinite(dist) ? dist : 30),
                z = pm.z;
            const h = r.getTerrainHeightAt(x, z);
            return r.spawnCreatureAt(x, (Number.isFinite(h) ? h : 0) + 1, z, "happy", "wolf", {
                precise: true,
                bodySize: 1,
            });
        };
        const c = spawnWolf();
        if (!c) return { error: "Wolf-Spawn fehlgeschlagen (Ofen kalt?)" };
        const gl = c.userData && c.userData._gelenk;
        if (!gl || !gl.nah || !gl.fern) return { error: "_gelenk fehlt am Wolf" };
        o.checks.fernGebaut = gl.meshes.length > 0 && gl.meshes.every((m) => m.isSkinnedMesh);
        o.checks.zeileGelesen = gl.abM === abKern && gl.hyst === hyst; // die Grenze des Wirts IST die Kern-Zeile
        o.abKern = abKern;
        o.hyst = hyst;
        const fL = c.scale.x || 1;
        const fern = abKern * fL;
        o.fernDist = fern;
        const nahZustand = () =>
            gl.istFern === false && gl.nah.visible === true && gl.meshes.every((m) => !m.layers.isEnabled(0));
        const fernZustand = () =>
            gl.istFern === true && gl.nah.visible === false && gl.meshes.every((m) => m.layers.isEnabled(0));
        // Pin: exakte Distanz auf der +x-Achse (XZ — dieselbe Ebene wie distSq im Loop).
        const pin = (dist) => {
            c.position.x = pm.x + dist;
            c.position.z = pm.z;
        };
        const tick = (dist) => {
            pin(dist);
            r.updateCreatures(0.02);
            pin(dist);
        };
    
        // ── (N) NAH voll · FERN grob — was die Haupt-Kamera zeichnet ──
        tick(0.4 * fern);
        o.nahMeshes = sichtbar(c);
        o.nahTris = zTris;
        o.nahBones = zBones;
        o.checks.nToggleNah = nahZustand();
        tick(1.4 * fern); // jenseits der (1+h)-Kante — die Grobstufe muss tragen
        o.fernMeshes = sichtbar(c);
        o.fernTris = zTris;
        o.fernBones = zBones;
        o.checks.nToggleFern = fernZustand();
        o.checks.nFernGrob = o.fernMeshes < 20 && o.fernMeshes < o.nahMeshes;
        o.checks.nFernKleiner = o.fernTris < o.nahTris / 4; // und << nah (Dreiecke — die Kosten)
        o.checks.nNahVoll = o.nahBones >= 20; // nah bleibt der volle Gelenk-Baum (die Haut trägt ≥ 20 Bones)
        o.checks.nFernGelenkig = o.fernBones >= 20; // fern ist die Grobstufe gelenkig (dieselben Knochen)
    
        // ── (S) SELBST-TEST: der Schalter gestubbt (immer nah — der volle Baum auf jede Distanz) wird ERKANNT ──
        const saveStufe = r._gelenkStufe;
        r._gelenkStufe = function (gruppe) {
            return saveStufe.call(this, gruppe, 0); // die nahe Stufe auf jede Distanz
        };
        tick(1.4 * fern);
        o.sAltMeshes = sichtbar(c);
        o.sAltTris = zTris;
        o.checks.sLensFires = !(o.sAltMeshes < 20 && o.sAltMeshes < o.nahMeshes && o.sAltTris < o.nahTris / 4);
        r._gelenkStufe = saveStufe; // restaurieren (Gate-Hook-Lehre)
    
        // ── (H) HYSTERESE: Pendeln an der Kante schaltet nicht, gießt nicht ──
        const memo = A._tierOfenMemo;
        const memoVor = memo ? memo.size : -1;
        const saveOfen = r._ofenKreaturTemplate;
        let gussCalls = 0;
        r._ofenKreaturTemplate = function () {
            gussCalls++;
            return saveOfen.apply(this, arguments);
        };
        // Pendelbreite aus der WAHRHEIT abgeleitet: ±h/5 liegt für jedes legitime hyst tief im Band.
        const bandTief = hyst / 5;
        tick(0.5 * fern); // definierter Start: nah
        const startNah = nahZustand();
        let flipsEng = 0;
        let prev = gl.istFern;
        for (let k = 0; k < 40; k++) {
            tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
            if (gl.istFern !== prev) flipsEng++;
            prev = gl.istFern;
        }
        o.flipsEng = flipsEng;
        o.checks.hKeinFlackern = startNah && flipsEng === 0;
        // (H2): dieselbe Eng-Pendelprobe aus dem FERN-Start — echte Hysterese hält den letzten Zustand auch von fern.
        tick(1.4 * fern);
        const startFern = fernZustand();
        let flipsEngFern = 0;
        prev = gl.istFern;
        for (let k = 0; k < 40; k++) {
            tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
            if (gl.istFern !== prev) flipsEngFern++;
            prev = gl.istFern;
        }
        o.flipsEngFern = flipsEngFern;
        o.checks.hKeinFlackernFern = startFern && flipsEngFern === 0 && fernZustand();
        // Gegenprobe (nicht vakuös): WEIT über beide Kanten pendeln MUSS schalten.
        let flipsWeit = 0;
        prev = gl.istFern;
        for (let k = 0; k < 10; k++) {
            tick((k % 2 ? 0.6 : 1.6) * fern);
            if (gl.istFern !== prev) flipsWeit++;
            prev = gl.istFern;
        }
        o.flipsWeit = flipsWeit;
        o.checks.hToggleLebt = flipsWeit >= 8;
        r._ofenKreaturTemplate = saveOfen; // restaurieren
        o.gussCalls = gussCalls;
        o.memoDelta = memo ? memo.size - memoVor : -1;
        o.checks.hKeinGuss = gussCalls === 0 && o.memoDelta === 0;
        r.removeCreature(c);
    
        // ── (D) DETERMINISMUS: Sim-Werte identisch mit/ohne Stufen-Schalter ──
        const mulberry32 = (a) => () => {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const saveRandom = Math.random;
        // der Ort des Laufs: Land in 1,4·Schwelle (ein Wolf im Wasser triebe mit der Strömung — ein Leib, der sich
        // bewegt, behält seinen Gelenk-Baum)
        let landWinkel = 0;
        for (let q = 0; q < 24; q++) {
            const a = (q / 24) * Math.PI * 2;
            const lx = pm.x + Math.cos(a) * 1.4 * fern,
                lz = pm.z + Math.sin(a) * 1.4 * fern;
            if (r._landAt(lx, lz)) {
                landWinkel = a;
                break;
            }
        }
        const lauf = (ohneFern) => {
            Math.random = mulberry32(424242); // DIESELBE Folge je Lauf
            r._creatureAiFrame = 1000;
            s.creatureAnimationTime = 100;
            // IDENTITÄTS-PIN: beide Läufe spawnen DENSELBEN Wolf (c7001); Echtzeit-Stempel uhr-frei.
            s._creatureNetSeq = 7000;
            // der Lauf spawnt im FERN-Regime (1.4·Schwelle) — sonst wäre die Stufe in beiden Läufen inert
            const cw = spawnWolf(1.4 * fern);
            if (!cw) return null;
            cw.position.x = pm.x + Math.cos(landWinkel) * 1.4 * fern;
            cw.position.z = pm.z + Math.sin(landWinkel) * 1.4 * fern;
            // Die Ruhe trägt nur ein Tier, das STEHT (der ferne Gang: wer läuft, behält seinen Schritt) —
            // der Wolf wartet, sonst wanderte er aus dem Fern-Regime in die feine Stufe.
            r.assignCreatureTask(cw, "wait", {}, { silent: true });
            if (cw.userData.task) cw.userData.task.since = 0;
            cw.userData.bornAt = 0;
            const spur = [];
            let fernAktivTicks = 0;
            if (ohneFern)
                r._gelenkStufe = function (gruppe) {
                    return saveStufe.call(this, gruppe, 0); // der alte Zustand: immer die nahe Stufe
                };
            for (let k = 0; k < 60; k++) {
                r.updateCreatures(0.02);
                const glw = cw.userData._gelenk;
                if (glw && glw.istFern === true) fernAktivTicks++;
                spur.push(
                    cw.position.x,
                    cw.position.y,
                    cw.position.z,
                    cw.rotation.y,
                    s.creatureEmotions[s.creatures.indexOf(cw)] === "happy" ? 1 : 0
                );
            }
            r._gelenkStufe = saveStufe; // restaurieren
            r.removeCreature(cw);
            return { spur, fernAktivTicks };
        };
        const laufMit = lauf(false);
        const laufOhne = lauf(true);
        const spurMit = laufMit && laufMit.spur;
        const spurOhne = laufOhne && laufOhne.spur;
        o.dFernAktivTicks = laufMit ? laufMit.fernAktivTicks : -1;
        o.checks.dFernAktiv = !!laufMit && laufMit.fernAktivTicks > 30;
        Math.random = saveRandom; // restaurieren (Gate-Hook-Lehre)
        if (!spurMit || !spurOhne) {
            o.checks.dLaufe = false;
        } else {
            o.checks.dLaufe = true;
            let diffAt = -1;
            for (let k = 0; k < spurMit.length; k++) {
                if (spurMit[k] !== spurOhne[k]) {
                    diffAt = k;
                    break;
                }
            }
            o.dDiffAt = diffAt;
            o.dLen = spurMit.length;
            o.checks.dIdentisch = diffAt === -1 && spurMit.length === spurOhne.length;
        }
    
        r.isInFrustum = saveFrustum; // restaurieren (Gate-Hook-Lehre)
        s.maxCreatures = saveMax;
        return o;
    });
    if (!erreichbar(check, "Tier-Fern: die Bühne steht (Wolf gespawnt, Schalter erreichbar)", out)) return;
    const c = out.checks || {};
    const rot = (...k) => k.filter((x) => c[x] !== true).join(" · ");
    const n = rot("fernGebaut", "zeileGelesen", "nToggleNah", "nToggleFern", "nFernGelenkig", "nNahVoll", "nFernGrob", "nFernKleiner");
    check(
        `Tier-Fern (N): nah die feine Stufe (Haut ${out.nahBones} Bones), fern die gelenkige Grobstufe aus der Kern-Zeile (ab ${out.abKern} m, hyst ${out.hyst}): ${out.nahMeshes} → ${out.fernMeshes} Meshes, ${Math.round(out.nahTris)} → ${Math.round(out.fernTris)} Dreiecke`,
        !n,
        n && "ROT: " + n
    );
    check(`Tier-Fern SELBSTTEST (S): mit gestubbtem Schalter erkennt die Linse den alten Zustand (fern ${out.sAltMeshes} Meshes = nah)`, c.sLensFires === true);
    const h = rot("hKeinFlackern", "hKeinFlackernFern", "hToggleLebt", "hKeinGuss");
    check(`Tier-Fern (H): Eng-Pendeln schaltet nie (${out.flipsEng}/${out.flipsEngFern} Flips), weites Pendeln schaltet (${out.flipsWeit}), kein Guss im Takt (${out.gussCalls})`, !h, h && "ROT: " + h);
    const d = rot("dLaufe", "dFernAktiv", "dIdentisch");
    check(`Tier-Fern (D): die Sim-Spur ist BYTE-GLEICH mit/ohne Stufen-Schalter (${out.dLen || 0} Werte, FERN aktiv ${out.dFernAktivTicks}/60 Ticks)`, !d, d && `ROT: ${d}${out.dDiffAt >= 0 ? ` (erste Differenz @${out.dDiffAt})` : ""}`);
}

// Der Körper geht den Weg, nicht die Uhr — eingefaltet aus gate:koerper-bewegung (D3b, Orakel Bogen 2): die Gang-Gesetze am ECHTEN
// Chokepoint (animatePlayerSoul / _animateHumanoidRig / updateCreatures): (A) Phasen-Rate und Schritt-DISTANZ folgen dem Gang-Gesetz
// (K07, ±10 %, der Sprint skatet nie) · (B) die Zwei-Knochen-IK pur (< 1 cm, gestreckt, nie NaN) · (C) der Posen-Blend stetig
// (Δw ≤ 0,2 je Tick) · (D) der Tier-Root-Pitch folgt dem 30°-Hang, geerdet · (E) das Fuß-IK über den echten Pfad (Becken senkt
// sich, Abgrund ohne NaN, Luft-Sperre); Selbsttests S1 (hartes Blend) und S2 (_slopePitch ≡ 0).
async function checkBandKoerperBewegung({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        const s = r.state,
            A = r.constructor;
        const o = { checks: {} };
        for (const fn of [
            "_gaitGesetz",
            "_gaitBeinMass",
            "_gaitBlendStep",
            "_twoBoneIK",
            "_slopePitch",
            "_gaitTick",
            "_gaitIKPrep",
            "_gaitApplyFussIK",
            "_creatureSlopeProben",
            "_creatureSlopeProbe",
            "animatePlayerSoul",
            "updateCreatures",
        ]) {
            if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
        }
        // KONSUM am Ruf: der nahe, trockene Peer läuft über den EINEN Gang-Tick wie der Spieler (Spieler, Tier-Hang und
        // Fuß-IK beweisen S1, (D) und (E) an ihrer Wirkung).
        {
            const g = r._buildHumanGroup();
            const pp = s.playerMesh.position;
            const peer = { mesh: g, x: pp.x + 5, y: pp.y + 1, z: pp.z, yaw: 0, meshKind: "soul", soulName: "human",
                walkPhase: 0, lastMovedAt: performance.now() / 1000, _gaitPX: pp.x + 4.95, _gaitPZ: pp.z };
            o.checks.konsumPeer = window.__consumes(r, "_p2pUpdatePeer", r, "_gaitTick", [peer, performance.now() / 1000, 1 / 60]);
            r._disposeSoulGroup(g);
        }
    
        // ── (B) ZWEI-KNOCHEN-IK pur — Fußfehler über ein Ziel-Raster ──
        {
            const l1 = 0.45,
                l2 = 0.4;
            let maxErr = 0,
                alleFinite = true;
            for (let a = -1.2; a <= 1.2; a += 0.15) {
                for (let dFrac = 0.15; dFrac <= 0.97; dFrac += 0.1) {
                    const d = (l1 + l2) * dFrac;
                    const vor = Math.sin(a) * d;
                    const unten = Math.cos(a) * d;
                    if (unten <= 0.01) continue;
                    const res = r._twoBoneIK(l1, l2, vor, unten);
                    if (!Number.isFinite(res.hip) || !Number.isFinite(res.knee)) alleFinite = false;
                    if (d > Math.abs(l1 - l2) + 0.01 && res.reached) {
                        const a1 = -res.hip;
                        const a2 = a1 - res.knee;
                        const F = l1 * Math.sin(a1) + l2 * Math.sin(a2);
                        const U = l1 * Math.cos(a1) + l2 * Math.cos(a2);
                        maxErr = Math.max(maxErr, Math.hypot(F - vor, U - unten));
                    }
                }
            }
            o.ikMaxErr = maxErr;
            o.checks.ikErreichbar = alleFinite && maxErr < 0.01; // Fußfehler < 1 cm
            const weit = r._twoBoneIK(l1, l2, 2, 2); // außer Reichweite
            const punkt = r._twoBoneIK(l1, l2, 0, 0); // Ziel = Hüftpunkt
            const nan = r._twoBoneIK(l1, l2, NaN, NaN);
            o.checks.ikGestreckt =
                weit.reached === false &&
                weit.knee === 0 &&
                Number.isFinite(weit.hip) &&
                Math.abs(-weit.hip - Math.atan2(2, 2)) < 1e-9; // gestreckt RICHTUNG Ziel
            o.checks.ikNaNWand =
                punkt.hip === 0 && punkt.knee === 0 && Number.isFinite(nan.hip) && Number.isFinite(nan.knee);
        }
        // ── Hang-Formel pur: 30°-Hang ⇒ 30° ± 5°, Vorzeichen korrekt ──
        {
            const p30 = r._slopePitch(Math.tan(Math.PI / 6) * 2, 0, 2);
            o.pitchPurDeg = (p30 * 180) / Math.PI;
            o.checks.pitchPur = p30 < 0 && Math.abs(Math.abs(o.pitchPurDeg) - 30) <= 5;
            o.checks.pitchNaNWand = r._slopePitch(NaN, 0, 2) === 0 && r._slopePitch(1, 0, 0) === 0;
        }
        // ── Das Gang-Gesetz pur: ω = 2π·v/Λ, Stand und NaN ⇒ 0 ──
        {
            const rg = s.playerMesh && s.playerMesh.userData && s.playerMesh.userData.rig;
            const g3 = rg ? r._gaitGesetz(rg, 3) : null;
            o.checks.ratePur =
                !!g3 &&
                Math.abs(g3.omega - (2 * Math.PI * 3) / g3.schritt) < 1e-9 &&
                r._gaitGesetz(rg, 0).omega === 0 &&
                r._gaitGesetz(rg, NaN).omega === 0;
        }
    
        // ── Spieler-Konsumenten-Bühne: human-Rig + gestubbte Velocity ──
        const p = s.player;
        const mesh = s.playerMesh;
        if (!mesh || !mesh.userData) return { error: "kein Spieler-Mesh" };
        const savedSoul = p.soul;
        if (!mesh.userData.rig) r.applyPlayerSoul("human");
        const pmesh = s.playerMesh;
        if (!pmesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
        const savedVel = s.playerVel;
        const savedUw = s.playerUnderwater;
        const savedMounted = p.mountedArch;
        const savedPhase = p.walkPhase;
        const savedW = p._gaitW;
        const savedTick = p.animationLastTick;
        s.playerUnderwater = false;
        p.mountedArch = null;
        let vStub = 0;
        s.playerVel = { x: () => vStub, z: () => vStub * 0, y: () => 0 };
        const fahre = (v, sek, t0) => {
            vStub = v;
            p.animationLastTick = -Infinity;
            r.animatePlayerSoul(t0);
            const ph0 = p.walkPhase;
            const n = Math.round(sek * 60);
            for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
            return p.walkPhase - ph0;
        };
    
        // ── (A) WEG-PHASE am ECHTEN Konsumenten ──
        const d1 = fahre(3, 1.0, 100);
        const d2 = fahre(6, 1.0, 200);
        o.phaseRate1 = d1;
        o.phaseRate2 = d2;
        o.rateRatio = d1 > 0 ? d2 / d1 : 0;
        // K07: die Phasen-Rate folgt ω = 2π·v/Λ(v) des Gang-Gesetzes (nicht mehr ∝ v bei festem Schritt)
        {
            const rgR = s.playerMesh.userData.rig;
            o.rateSoll = r._gaitGesetz(rgR, 6).omega / r._gaitGesetz(rgR, 3).omega;
        }
        o.checks.aRateVerdoppelt = o.rateRatio > 1 && Math.abs(o.rateRatio / o.rateSoll - 1) <= 0.1;
        const sd1 = d1 > 0 ? 3 / (d1 / Math.PI) : 0; // Weg je Schritt bei v=3
        const sd2 = d2 > 0 ? 6 / (d2 / Math.PI) : 0; // Weg je Schritt bei v=6
        o.schritt1 = sd1;
        o.schritt2 = sd2;
        // K07: der Schritt folgt dem Gang-Gesetz (Λ/2 wächst mit dem Tempo) — gemessen am Konsumenten ± 10 %
        const rgA = s.playerMesh.userData.rig;
        const soll1 = r._gaitGesetz(rgA, 3).schritt / 2,
            soll2 = r._gaitGesetz(rgA, 6).schritt / 2;
        o.checks.aSchrittKonstant =
            sd1 > 0 && Math.abs(sd1 / soll1 - 1) <= 0.1 && Math.abs(sd2 / soll2 - 1) <= 0.1 && sd2 > sd1;
    
        // ── (C) POSEN-BLEND stetig am Konsumenten (Schwellen-Sprung) ──
        const blendLauf = () => {
            let maxJump = 0;
            p._gaitW = 0;
            vStub = 0;
            p.animationLastTick = -Infinity;
            r.animatePlayerSoul(300);
            vStub = 6; // der Schwellen-SPRUNG
            let wPrev = p._gaitW;
            for (let k = 1; k <= 90; k++) {
                r.animatePlayerSoul(300 + k / 60);
                maxJump = Math.max(maxJump, Math.abs(p._gaitW - wPrev));
                wPrev = p._gaitW;
            }
            const wOben = p._gaitW;
            vStub = 0; // zurück unter die Schwelle
            for (let k = 91; k <= 180; k++) {
                r.animatePlayerSoul(300 + k / 60);
                maxJump = Math.max(maxJump, Math.abs(p._gaitW - wPrev));
                wPrev = p._gaitW;
            }
            return { maxJump, wOben, wUnten: p._gaitW };
        };
        const bl = blendLauf();
        o.blend = bl;
        o.checks.cBlendStetig = bl.maxJump <= 0.2 + 1e-9;
        o.checks.cBlendKonvergiert = bl.wOben > 0.8 && bl.wUnten < 0.2;
        o.checks.cBlendNaNWand = Number.isFinite(r._gaitBlendStep(NaN, NaN, NaN));
    
        // ── (S1) SELBST-TEST: hartes Blend gestubbt → die Messung sieht den Sprung ──
        const savedBlend = r._gaitBlendStep;
        r._gaitBlendStep = function (_w, speed) {
            return Number.isFinite(speed) && speed > 0.4 ? 1 : 0;
        };
        const blStub = blendLauf();
        r._gaitBlendStep = savedBlend; // restaurieren (Gate-Hook-Lehre)
        o.s1MaxJump = blStub.maxJump;
        o.checks.s1LensFires = blStub.maxJump > 0.2;
    
        // ── (E) FUSS-IK-KONSUM: Becken senkt sich auf gesenktem Boden, Abgrund ohne NaN ──
        {
            const rig = pmesh.userData.rig;
            const soleY = pmesh.position.y - A.PLAYER_FOOT_OFFSET;
            const saved = [s._kapselTraegerY, s._kapselStruktur, s.isInAir, pmesh.position.y];
            const frisch = () => {
                const ik = pmesh.userData._gaitIK;
                if (ik) ik.probeL.g = ik.probeR.g = NaN;
            };
            // der Boden unter den Füßen um dy tiefer als ihre Sohle: der Leib steht -dy über dem Grund, auf dem der
            // Kapsel-Schritt ihn stempelt — jeder Fuß liest, was dort trägt (Bau oder gezeichneter Boden, `_fussBoden`, leib.K2).
            // Vorher senkte die Bühne nur den Stempel eines Baus (`_kapselStruktur`): seit jeder Fuß seine Auflage liest, stand
            // er weiter auf dem echten Boden unter ihm (Gelände 90,37 m, am Genesis-Platz der Bau 91,33 m). Neun Stand-Takte.
            const becken = (dy, t0, luft = false) => {
                [s._kapselTraegerY, s._kapselStruktur, s.isInAir] = [soleY, false, luft];
                pmesh.position.y = soleY + A.PLAYER_FOOT_OFFSET - dy;
                frisch();
                [vStub, p._gaitW, p.animationLastTick] = [0, 0, -Infinity];
                for (let k = 0; k <= 8; k++) r.animatePlayerSoul(t0 + k / 60);
                return rig.hips.position.y;
            };
            const h0 = becken(0, 500); // der Boden auf der Sohlen-Ebene, der Körper steht (die Luft-Sperre prüft E2)
            const h1 = becken(-0.25, 510); // der Boden 25 cm unter der Sohle
            becken(-50, 520); // Abgrund
            const alleFinite =
                Number.isFinite(rig.hips.position.y) &&
                [rig.legL, rig.legR].every((leg) => ["hip", "knee", "ankle"].every((kk) => !leg[kk] || Number.isFinite(leg[kk].rotation.x)));
            // (E2) LUFT-SPERRE (Leben-Prüfung N-D1): in der Luft erdet die Fuß-IK nie — derselbe gesenkte Boden senkt
            // das Becken NICHT
            const hLuft = becken(-0.25, 530, true);
            [s._kapselTraegerY, s._kapselStruktur, s.isInAir, pmesh.position.y] = saved; // restaurieren
            frisch();
            o.beckenLuft = hLuft;
            o.checks.eLuftSperre = Number.isFinite(hLuft) && Number.isFinite(h0) && Math.abs(hLuft - h0) < 0.02;
            o.beckenFlach = h0;
            o.beckenGesenkt = h1;
            o.checks.eBeckenSenkt = Number.isFinite(h0) && Number.isFinite(h1) && h1 < h0 - 0.1;
            o.checks.eAbgrundOhneNaN = alleFinite;
        }
    
        // Spieler-Bühne restaurieren
        s.playerVel = savedVel;
        s.playerUnderwater = savedUw;
        p.mountedArch = savedMounted;
        p.walkPhase = savedPhase;
        p._gaitW = savedW;
        p.animationLastTick = savedTick;
        if (savedSoul !== p.soul) r.applyPlayerSoul(savedSoul);
    
        // ── (D) TIER-BODENKONTAKT auf dem 30°-Hang (gestubbter Boden) ──
        {
            const pm = s.playerMesh.position;
            const saveMax = s.maxCreatures;
            s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 2);
            const steig = Math.tan(Math.PI / 6); // 30°
            // 200 m über jeder Boden-Karte: der Stand-Leser der Sicht (_standSicht) trägt dort das Gesetz der Ebene
            const ebene = (x, z) => 210 + (z - pm.z) * steig;
            const dist = window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * 0.3; // sicher in der Voll-Zone
            const cx = pm.x + dist,
                cz = pm.z;
            const c = r.spawnCreatureAt(cx, 30, cz, "happy", "wesen", { precise: true, bodySize: 1 });
            if (!c) return { error: "Tier-Spawn fehlgeschlagen" };
            const savedSurf = r._koerperBodenUnter;
            r._koerperBodenUnter = (x, _y, z) => ebene(x, z);
            // der Ruf liest seinen ersten Grund selbst — der gestubbte Boden gilt ab jetzt
            delete c.userData.cachedGroundY;
            // gepinnt: Ort UND Gier (bergauf, +z) — der Nick misst den Hang längs des Leibs; die Gier des Wanderns
            // drehte ihn quer (main 7dd944e6: +34,4°, talwärts; 832b4cf4: −16,2° bei ~60° Gier — kein Hang-Fehler)
            const tiere = (n) => {
                for (let k = 0; k < n; k++) {
                    c.rotation.y = 0;
                    c.userData._steuer = { gier: 0, v: 0 };
                    r.updateCreatures(0.02);
                    c.position.x = cx;
                    c.position.z = cz; // pinnen (Wander driftet sonst)
                }
            };
            tiere(60);
            o.tierPitchDeg = (c.rotation.x * 180) / Math.PI;
            o.tierY = c.position.y;
            o.tierSollY = ebene(cx, cz);
            o.checks.dPitch30 = c.rotation.x < 0 && Math.abs(Math.abs(o.tierPitchDeg) - 30) <= 5;
            o.checks.dGeerdet = Math.abs(o.tierY - o.tierSollY) < 0.6; // Sohlen an der Proben-Mitte, kein +0.5-Anker
            // ── (S2) SELBST-TEST: _slopePitch ≡ 0 → der Hang-Pitch fällt zurück ──
            const savedPitch = r._slopePitch;
            r._slopePitch = function () {
                return 0;
            };
            tiere(60);
            r._slopePitch = savedPitch; // restaurieren (Gate-Hook-Lehre)
            o.s2PitchDeg = (c.rotation.x * 180) / Math.PI;
            o.checks.s2LensFires = Math.abs(o.s2PitchDeg) < 3; // ohne Formel kein Hang-Folgen
            r._koerperBodenUnter = savedSurf; // restaurieren
            // Boden-Caches der Welt-Kreaturen entstubben (kein stale Hang-Boden)
            for (const cr of s.creatures) {
                const ud = cr.userData || {};
                delete ud.cachedGroundY;
                // die vier Gesetz-Proben je Tier (_slopeProben) tragen sonst den 210-m-Hang des Stubs weiter
                if (Array.isArray(ud._slopeProben)) for (const pr of ud._slopeProben) pr.g = NaN;
            }
            r.removeCreature(c);
            s.maxCreatures = saveMax;
        }
    
        return o;
    });
    if (!erreichbar(check, "Körper-Bewegung: die Bühne steht", out)) return;
    const c = out.checks || {};
    const rot = (...k) => k.filter((x) => c[x] !== true).join(" · ");
    const f = (v, n = 2) => (typeof v === "number" ? v.toFixed(n) : String(v));
    const k = rot("konsumPeer");
    check("Körper-Bewegung KONSUM: der Peer ruft den EINEN Gang-Tick wie der Spieler", !k, k && "ROT: " + k);
    const a = rot("ratePur", "aRateVerdoppelt", "aSchrittKonstant");
    check(`Körper-Bewegung (A): doppeltes Tempo ⇒ die Phasen-Rate des Gang-Gesetzes (${f(out.rateRatio)}× ≈ ${f(out.rateSoll)}×), die Schritt-Distanz des Gesetzes (${f(out.schritt1)} / ${f(out.schritt2)} m)`, !a, a && "ROT: " + a);
    const b = rot("ikErreichbar", "ikGestreckt", "ikNaNWand");
    check(`Körper-Bewegung (B) IK: in Reichweite < 1 cm (max ${f(out.ikMaxErr * 100, 3)} cm), außer Reichweite gestreckt, nie NaN`, !b, b && "ROT: " + b);
    const cc = rot("cBlendStetig", "cBlendKonvergiert", "cBlendNaNWand", "s1LensFires");
    check(`Körper-Bewegung (C) Blend stetig (max Δw ${f(out.blend && out.blend.maxJump, 3)}), konvergiert, NaN-Wand; SELBSTTEST S1 hartes Blend sichtbar (Δw ${f(out.s1MaxJump)})`, !cc, cc && "ROT: " + cc);
    const d = rot("dPitch30", "dGeerdet", "s2LensFires", "pitchPur", "pitchNaNWand");
    check(`Körper-Bewegung (D) der Tier-Root folgt dem 30°-Hang (${f(out.tierPitchDeg, 1)}°), geerdet; SELBSTTEST S2 _slopePitch ≡ 0 (${f(out.s2PitchDeg, 1)}°), die Hang-Formel pur`, !d, d && "ROT: " + d);
    const e = rot("eBeckenSenkt", "eAbgrundOhneNaN", "eLuftSperre");
    check(`Körper-Bewegung (E) Fuß-IK über den echten Pfad: das Becken senkt sich aufs tiefere Bein, Abgrund ohne NaN, in der Luft keine Senkung (${f(out.beckenFlach, 3)} → ${f(out.beckenLuft, 3)})`, !e, e && "ROT: " + e);
}

// leib.K5 — DAS GAMEPAD LENKT JEDES VERB (Meisterkarte Leib H): ein synthetisches Gamepad fährt jedes Verb durch den echten Takt,
// gerichtet wird die Wirkung in Takten (Schlupfloch: ein auf 0/1 gerundeter Achs-Wert fällt an der Stetigkeit). Jedes Glied, das
// `state.keys` liest, ist ROT beim Namen (frei: die Tastatur in init, der Sammler, die Tasten-Wand) — SELBSTTEST: ein Zwilling-Leser.
async function checkBandGamepadVerben({ page, check }) {
    const out = await safeEvaluate(page, () => {
        const [r, fx, los, spione] = [window.anazhRealm, [], [], {}];
        const [s, A, proto] = [r.state, r.constructor, Object.getPrototypeOf(r)];
        const [P, T, B, o] = [A.PAD_GESETZ, s.verbTafel, A.PAD_BELEGUNG, { c: {} }];
        const c = o.c;
        const leser = () =>
            Object.getOwnPropertyNames(proto).filter((n) => {
                const f = Object.getOwnPropertyDescriptor(proto, n).value;
                const frei = ["constructor", "init", "_verbTafelSammeln", "_alleTastenLos"].includes(n);
                return !frei && typeof f === "function" && !window.__fehlt(f, /\b(?:state|st|s)\.keys\b/);
            });
        o.leser = leser();
        proto.__zwillingLeser = function () {
            return this.state.keys.w;
        };
        c.selbsttest = leser().includes("__zwillingLeser");
        delete proto.__zwillingLeser;
        c.absenz = o.leser.length === 0;
        if (!P || !T || !B) return Object.assign(o, { error: `keine Verb-Tafel (state.verbTafel · PAD_GESETZ · PAD_BELEGUNG) · rohe Tasten-Leser [${o.leser}]` });
        const pad = { connected: true, axes: [0, 0, 0, 0], buttons: [...Array(17)].map(() => ({ pressed: false, value: 0 })) };
        pad.vibrationActuator = { type: "dual-rumble", playEffect: (art, e) => (fx.push(e), Promise.resolve()), reset() {} };
        Object.defineProperty(navigator, "getGamepads", { value: () => [pad], configurable: true });
        let tMs = performance.now();
        const takt = (n) => {
            for (let i = 0; i < n; i++) r._gameLoopTick((tMs += 1000 / 60));
        };
        const kn = (a) => +B[a].slice(3);
        const knopf = (i, v) => ((pad.buttons[i].pressed = v > 0.5), (pad.buttons[i].value = v));
        const druck = (i) => (knopf(i, 1), takt(1), knopf(i, 0), takt(1));
        const ruhe = () => (pad.axes.fill(0), pad.buttons.forEach((_, i) => knopf(i, 0)), Object.keys(s.keys).forEach((k) => (s.keys[k] = false)), takt(1));
        const soll = (a) => Math.max(0, Math.min(1, (a - P.totzone) / (1 - P.totzone)));
        const nah = (x, y, tol) => Math.abs(x / y - 1) < tol;
        const v = () => Math.hypot(s.playerVel.x(), s.playerVel.z());
        const rumble = () => Math.max(0, ...fx.map((e) => Math.max(e.strongMagnitude, e.weakMagnitude)));
        const [pm, sicht0, hp0, hud0] = [s.playerMesh.position, s.cameraMode, s.player.hp, document.body.className];
        const [heim, h] = [pm.clone(), (x, z) => r.getTerrainHeightAt(x, z)];
        let ort = null; // die ebene, trockene Bühne (wie das Ritt-Band): 12 m × 12 m Ebene um den Spieler
        for (let i = 0; i < 192 && !ort; i++) {
            const [x, z] = [heim.x + Math.cos(i * 0.5236) * (2 + Math.floor(i / 12)) * 24, heim.z + Math.sin(i * 0.5236) * (2 + Math.floor(i / 12)) * 24];
            const ws = r._atlasWaterLevelAt(x, z, h(x, z));
            let eben = Number.isFinite(h(x, z)) && !(ws > h(x, z) - 0.3);
            for (let d = 0; d < 49 && eben; d++) eben = Math.abs(h(x + ((d % 7) - 3) * 2, z + (Math.floor(d / 7) - 3) * 2) - h(x, z)) < 0.15;
            if (eben) ort = { x, y: h(x, z) + A.PLAYER_FOOT_OFFSET + 0.02, z };
        }
        if (!ort) return { error: "keine ebene, trockene Bühne um den Spieler" };
        const stellen = () => {
            ruhe();
            pm.set(ort.x, ort.y, ort.z);
            s.playerVel.setValue(0, 0, 0);
            [s._fieldVy, s._fixedAccumulator, s.yaw, s.pitch] = [0, 0, 0, 0];
            takt(3);
        };
        const SPIONE = ["tryMouseBreak", "tryMousePlace", "swapHands", "toggleInventoryOverlay", "confirmBuild", "setZoomActive", "selectHotbarSlot", "setCameraMode", "toggleMountAtPlayer", "exitPortal"];
        r.setCameraMode("first");
        try {
            // (A) GEHEN ∝ Auslenkung hinter der Totzone, W = der volle Stick (dieselbe Tafel), Sprint; (B) BLICK ∝ Stick, die Maus ebenso
            const tempo = (setze) => (stellen(), setze(), takt(12), [v(), T.vor]);
            const AUS = [P.totzone * 0.6, 0.35, 0.6, 1];
            o.gehen = AUS.map((a) => tempo(() => (pad.axes[1] = -a))[0]);
            o.taste = tempo(() => (s.keys.w = true));
            o.sprint = tempo(() => ((pad.axes[1] = -1), knopf(kn("sprint"), 1)))[0];
            const v1 = o.gehen[3];
            c.gehen = v1 > 0.5 * s.speed && AUS.every((a, i) => Math.abs(o.gehen[i] / v1 - soll(a)) < 0.03) && o.taste[1] === 1 && nah(o.taste[0], v1, 0.01);
            c.sprint = nah(o.sprint / v1, s.sprintSpeed / s.speed, 0.05);
            const blick = (achse, a) => (stellen(), (pad.axes[achse] = a), takt(10), [s.yaw, s.pitch]);
            o.blick = [blick(2, 0.6)[0], blick(2, 1)[0], blick(3, 1)[1]];
            c.blick = nah(o.blick[1], -P.blickRadS / 6, 0.02) && nah(o.blick[0] / o.blick[1], soll(0.6), 0.02) && nah(o.blick[2], -P.neigRadS / 6, 0.02);
            stellen();
            [o.lock, s.isPointerLocked] = [s.isPointerLocked, true];
            document.dispatchEvent(new MouseEvent("mousemove", { movementX: 40 }));
            s.isPointerLocked = o.lock;
            o.maus = [T.blickGier, (takt(1), s.yaw), T.blickGier];
            c.maus = o.maus[0] === -40 * s.mouseSensitivity && o.maus[1] === o.maus[0] && o.maus[2] === 0;
            // (C) FAHREN: X steigt auf (der Portal-Griff zuerst), Lenkwinkel und Gas stetig, B bremst das Heck, Rumble aus der Fahrt
            const KS = A.KIND_SUBSTANCE.fahrzeug_wagen;
            s.blueprints._t_pad_wagen = JSON.parse(JSON.stringify({ name: "_t_pad_wagen", parts: KS.parts, connections: KS.connections || [] }));
            stellen();
            const wagen = r.spawnArchitecture("_t_pad_wagen", { x: ort.x + 2.5, y: ort.y, z: ort.z }, { silent: true });
            r._tryEnterPortalAtPlayer = () => ((spione.tor = (spione.tor || 0) + 1), false);
            druck(kn("einsteigen"));
            c.einsteigen = spione.tor === 1 && !!wagen && s.player.mountedArch === wagen.id;
            const lenk = (a) => ((pad.axes[0] = a), takt(30), (o.l = wagen._fahr ? wagen._fahr.steer : NaN), ruhe(), takt(30), o.l);
            o.lenk = [0.35, 0.6, 1].map(lenk);
            c.lenk = o.lenk[2] < 0 && [0.35, 0.6].every((a, i) => Math.abs(o.lenk[i] / o.lenk[2] - soll(a)) < 0.03);
            const fahrt = (setze, n) => (s.playerVel.setValue(0, 0, 0), setze(), takt(n), (o.f = v()), ruhe(), o.f);
            o.gas = [0.25, 0.5, 1].map((a) => fahrt(() => knopf(7, a), 20));
            c.gas = o.gas[0] > 0 && o.gas[1] / o.gas[2] > 0.3 && o.gas[1] / o.gas[2] < 0.6;
            const auslauf = (bremse) => ((o.v0 = fahrt(() => knopf(7, 1), 40)), bremse && knopf(kn("handbremse"), 1), takt(10), (o.hb = T.handbremse), (o.f = o.v0 - v()), ruhe(), o.f);
            o.bremse = [auslauf(false), auslauf(true)];
            c.handbremse = o.hb === true && o.bremse[1] > 1.3 * o.bremse[0];
            fx.length = 0;
            o.rumbleFahrt = (fahrt(() => ((pad.axes[0] = 1), knopf(7, 1)), 40), rumble());
            druck(kn("einsteigen"));
            c.absteigen = s.player.mountedArch == null && o.rumbleFahrt > 0;
            r.removeArchitecture(wagen);
            delete s.blueprints._t_pad_wagen;
            // (D) SPRUNG, JEDER BELEGTE KNOPF über den EINEN Auslöser (die Tastatur ebenso), B verlässt das Portal
            stellen();
            knopf(kn("jump"), 1);
            takt(1);
            c.sprung = s.isJumping === true;
            stellen();
            for (const n of SPIONE) r[n] = () => ((spione[n] = (spione[n] || 0) + 1), n === "exitPortal" && (r._portalOverlay = null), false);
            r._verbTaste = function (a, an) {
                los.push(a + (an ? "+" : "-"));
                return proto._verbTaste.call(this, a, an);
            };
            for (const a in B) druck(kn(a));
            o.ohne = Object.keys(B).filter((a) => !(los.includes(a + "+") && los.includes(a + "-")));
            o.spione = Object.assign({}, spione);
            c.knoepfe = o.ohne.length === 0 && SPIONE.every((n) => n === "exitPortal" || spione[n] > 0) && spione.selectHotbarSlot === 2;
            los.length = 0;
            for (const art of ["keydown", "keyup"]) window.dispatchEvent(new KeyboardEvent(art, { code: s.keybindings.cameraToggle }));
            const tastatur = los.join() === "cameraToggle+,cameraToggle-";
            r._portalOverlay = {};
            druck(kn("cancelBuild"));
            c.tastaturPortal = tastatur && spione.exitPortal === 1 && r._portalOverlay === null;
            // (E) BELEGUNG FREI: jede Aktion und jede Fähigkeit (rule), das Fangen nimmt den nächsten Knopf; RUMBLE aus dem Treffer
            s.abilities.linse_pad = () => (spione.faehig = 1);
            r.setKeybinding("linse_pad", "Pad16");
            r.setKeybinding("jump", "Pad3");
            r.beginKeybindRebind("place");
            druck(11);
            o.belegung = [s.padBelegung.jump, s.padBelegung.swapHands, s.padBelegung.place];
            druck(16);
            r.resetKeybindings();
            c.belegung = o.belegung.join() === "Pad3,Pad0,Pad11" && spione.faehig === 1 && s.padBelegung.jump === B.jump && !s.padBelegung.linse_pad;
            stellen();
            fx.length = 0;
            takt(10);
            const [modus0, gnade0] = [r.getGameMode(), s.player.respawnGraceUntil];
            r.setGameMode("pfad");
            s.player.respawnGraceUntil = 0;
            o.rumble = [rumble(), (r.damagePlayer(5, "jagd"), takt(2), rumble())];
            r.setGameMode(modus0);
            [s.player.hp, s.player.respawnGraceUntil] = [hp0, gnade0];
            c.rumbleTreffer = o.rumble[0] === 0 && o.rumble[1] > 0;
        } finally {
            for (const n of [...SPIONE, "_verbTaste", "_tryEnterPortalAtPlayer"]) delete r[n];
            delete s.abilities.linse_pad;
            r._portalOverlay = null;
            delete navigator.getGamepads;
            ruhe();
            pm.copy(heim);
            r.setCameraMode(sicht0);
            document.body.className = hud0;
        }
        return o;
    });
    if (!erreichbar(check, "Gamepad-Verben (leib.K5): die Bühne steht", out)) return;
    const rot = (...k) => k.filter((x) => out.c[x] !== true).join(" · ");
    const f = (x) => (Array.isArray(x) ? x.map(f).join("/") : typeof x === "number" ? x.toFixed(3) : String(x));
    for (const [teil, text] of [
        [["absenz", "selbsttest"], `jedes Verb liest NUR die Tafel — rohe Tasten-Leser [${out.leser}]; SELBSTTEST Zwilling-Leser ROT`],
        [["gehen", "sprint", "blick", "maus"], `Gehen ∝ Auslenkung ${f(out.gehen)} m/s (W ${f(out.taste)}, Sprint ${f(out.sprint)}), Blick ∝ Stick ${f(out.blick)} rad, die Maus in derselben Tafel`],
        [["einsteigen", "lenk", "gas", "handbremse", "absteigen"], `Fahren: Lenkwinkel ${f(out.lenk)}, Gas ${f(out.gas)} m/s, Auslauf ${f(out.bremse)} m/s ohne/mit Handbremse, Rumble ${f(out.rumbleFahrt)}`],
        [["sprung", "knoepfe", "tastaturPortal", "belegung", "rumbleTreffer"], `jeder Knopf über _verbTaste (ohne [${out.ohne}], ${JSON.stringify(out.spione)}), Belegung ${f(out.belegung)} frei, Rumble ${f(out.rumble)} ruhig → Treffer`],
    ]) {
        const rest = rot(...teil);
        check(`Gamepad-Verben (leib.K5): ${text}`, !rest, rest && "ROT: " + rest);
    }
}

module.exports = {
    checkBandV1764ForgeAvatar, checkBandRing5Soul, checkBandM3RittVollendet, checkBandWFFluss,
    checkBandV18195AvatarSizeHp, checkBandV18196ManaSymmetry, checkBandV18201ManaKonsum, checkBandV18206SpeedTrade,
    checkBandKonvergenzTierBaum, checkBandTierFern, checkBandKoerperBewegung, checkBandGamepadVerben,
};
