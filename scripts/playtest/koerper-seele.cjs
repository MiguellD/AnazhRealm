"use strict";
// scripts/playtest/koerper-seele.cjs — der Richter von Koerper/seele (spec/stamm/modul-karte.json): Spieler-Seele · Stats · Boosts · Ausrüstung · Inventar.
// 15 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Der EINE „in der Hand“-Slot (Werkzeug + Waffe, kein Rollen-Schloss): equipHeld nimmt JEDEN
// Bauplan; das Gerät faltet über die Equip-Pipeline in die Kombat-Stats (kein eigener
// Waffen-Schaden-Pfad) UND treibt das Abbauen (_heldImplementBlueprint) — eine Pipeline.
async function checkBandV1757HeldSlot(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const savedHeld = p.equipped ? p.equipped.held : null;

        // (0) der held-Slot + HELD_STAT_WEIGHT
        out.slotExists = !!p.equipped && "held" in p.equipped;
        out.weightExists = r.constructor.HELD_STAT_WEIGHT > 0;

        // (1) ein hartes Gerät konstruieren (härteste Form × Material)
        const FTA = r.constructor.FORM_TAG_ACTIVATION;
        let hardShape = "box";
        let maxAct = 0;
        for (const s of Object.keys(FTA)) {
            const a = FTA[s].härte || 0;
            if (a > maxAct) {
                maxAct = a;
                hardShape = s;
            }
        }
        let hardMat = "stein";
        let maxH = 0;
        for (const m of Object.keys(r.state.materials)) {
            const h = (r.state.materials[m].tags && r.state.materials[m].tags.härte) || 0;
            if (h > maxH) {
                maxH = h;
                hardMat = m;
            }
        }
        const wName = "_t1757_impl";
        r.state.blueprints[wName] = r._deserializeBlueprint({
            name: wName,
            label: "Testgerät",
            parts: [
                { shape: hardShape, material: hardMat, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
            ],
            connections: [],
        });
        out.implHasHardness = (r.computeCompoundTags(r.state.blueprints[wName]).härte || 0) > 0;

        // (2) equipHeld nimmt JEDEN Bauplan — KEINE Markierung nötig (das Rollen-Schloss ist weg)
        const eqR = r.equipHeld(wName);
        out.equipNoRoleNeeded = eqR.ok && p.equipped.held === wName;

        // (3) equipHeld lehnt ab: ein unbekannter Bauplan + ein builtIn-Crafting-Tool (kein Welt-Gerät)
        out.rejectsUnknown = !r.equipHeld("nonexistent_bp_xyz").ok;
        out.rejectsBuiltinTool = !r.equipHeld("schmiede-hammer").ok; // builtIn-Crafting-Tool, kein Welt-Bauplan
        r.equipHeld(wName); // (die fehlgeschlagenen Versuche ändern nichts; sicherheitshalber neu setzen)

        // (4) KONSUM — das gehaltene harte Gerät HEBT das Kombat-Profil (Angriff-mit-jedem-Gerät)
        r.equipHeld(null);
        const base = r.computePlayerStats().stats;
        r.equipHeld(wName);
        const armed = r.computePlayerStats().stats;
        out.heldRaisesDamage = armed.damage > base.damage + 0.01; // härte → mehr Schaden
        // Welle L (K-D15): die Hand ist kein Panzer — das Gerät faltet nur in die Angriffs-Größen
        out.heldKeinPanzer = armed.defense === base.defense && armed.hpMax === base.hpMax;

        // (5) abnehmen → zurück auf die Baseline (kein Rest-Effekt)
        r.equipHeld(null);
        const bare = r.computePlayerStats().stats;
        out.unequipRestores = Math.abs(bare.damage - base.damage) < 1e-9;

        // (6) DASSELBE Gerät treibt das Abbauen (W1/W2) — _heldImplementBlueprint löst den held-Slot auf
        r.equipHeld(wName);
        out.heldDrivesHarvest = r._heldImplementBlueprint() === r.state.blueprints[wName];

        // (7) Persistenz: der held-Slot reist im Snapshot
        const snap = r.buildStateSnapshot();
        out.snapHasHeld = snap.playerEquipped && snap.playerEquipped.held === wName;

        // (8) UI: kein Rollen-Schloss — der gehaltene Bauplan geht durch den EINEN merged Pfad (wieldBlueprint),
        // keine getrennte Waffen-Zeile. V18.66 Ich-J2: der „In der Hand"-DROPDOWN ist geschnitten (Parallel-Pfad
        // zur Hotbar); das Wechseln läuft in der Hand (Hotbar) + Rezeptbuch (wieldBlueprint). Test wandert mit.
        out.heldDropdownCut = typeof r._equipAppendHeldRow !== "function";
        out.wieldMergedPath = typeof r.wieldBlueprint === "function";
        out.noWeaponRow = typeof r._equipAppendWeaponRow !== "function";

        // cleanup
        r.equipHeld(null);
        delete r.state.blueprints[wName];
        if (savedHeld) r.equipHeld(savedHeld);
        r.recomputePlayerStats();
        return out;
    });
    check("V17.57 W2-B: der held-Equip-Slot + HELD_STAT_WEIGHT existieren", res.slotExists && res.weightExists);
    check("V17.57 W2-B: das Test-Gerät trägt härte (die Substanz-Prämisse hält)", res.implHasHardness);
    check(
        "V17.57 W2-B: equipHeld nimmt JEDEN Bauplan — keine Markierung nötig (kein Rollen-Schloss)",
        res.equipNoRoleNeeded
    );
    check("V17.57 W2-B: equipHeld lehnt einen unbekannten Bauplan ab", res.rejectsUnknown);
    check("V17.57 W2-B: equipHeld lehnt ein builtIn-Crafting-Tool ab (kein Welt-Gerät)", res.rejectsBuiltinTool);
    check(
        "V17.57 W2-B: KONSUM — ein gehaltenes hartes Gerät HEBT den Schaden (Angriff-mit-jedem-Gerät, Substanz→Profil)",
        res.heldRaisesDamage
    );
    check(
        "Welle L K-D15: die Hand ist kein Panzer — das harte Gerät lässt Verteidigung und HP unberührt (nur Angriff)",
        res.heldKeinPanzer
    );
    check("V17.57 W2-B: Gerät abnehmen → zurück auf die Baseline (kein Rest-Effekt)", res.unequipRestores);
    check(
        "V17.57 W2-B: DASSELBE Gerät treibt das Abbauen (_heldImplementBlueprint löst den held-Slot auf)",
        res.heldDrivesHarvest
    );
    check("V17.57 W2-B: Persistenz — der held-Slot reist im Snapshot", res.snapHasHeld);
    check(
        "V18.66 Ich-J2: kein Rollen-Schloss — der EINE merged Halte-Pfad (wieldBlueprint), keine Waffen-Zeile; der redundante In-der-Hand-Dropdown ist geschnitten",
        res.wieldMergedPath && res.noWeaponRow && res.heldDropdownCut
    );
}

// V17.61 S3 (kampf-plan §11.7, §10-F2+F3) — das Gerät SCHMIEDEN: F2 die Präzision moduliert das Abbauen
// (die §4.3-Rekursion schließt), F3 der Werk-Akt forgeBlueprint (Material ziehen + Präzision einfrieren +
// ausrüsten — der Spiegel von bauen). KONSUM (nicht Existenz, V17.31).
async function checkBandV1761ForgeImplement(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;

        out.method = typeof r.forgeBlueprint === "function";

        // F2 — die Präzision moduliert die Welt-Kraft: gleiche Form/Materie, aber ein hoch-präziser
        // opChain ergibt ein stärkeres Gerät als ein grob-präziser (die Rekursion: besseres Crafting
        // → besseres Abbauen).
        blu.__f2_fine = {
            name: "__f2_fine",
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    size: { x: 0.8, y: 0.8, z: 0.8 },
                    position: { x: 0, y: 0, z: 0 },
                    opChain: [{ cap: 0.95, op: "polish", tool: "x" }],
                },
            ],
        };
        blu.__f2_rough = {
            name: "__f2_rough",
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    size: { x: 0.8, y: 0.8, z: 0.8 },
                    position: { x: 0, y: 0, z: 0 },
                    opChain: [{ cap: 0.4, op: "knap", tool: "x" }],
                },
            ],
        };
        const fineProf = r._implementProfileForBlueprint(blu.__f2_fine);
        const roughProf = r._implementProfileForBlueprint(blu.__f2_rough);
        out.precisionModulatesMine = fineProf.minePower > roughProf.minePower;

        // F3 — das Schmieden ZIEHT Material (pfad), schlägt ohne fehl
        blu.__forge_tool = {
            name: "__forge_tool",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.9, y: 0.9, z: 0.9 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        p.equipped.held = null;
        const forgeNoMat = r.forgeBlueprint("__forge_tool");
        out.pfadForgeRejectsWithoutMaterial = forgeNoMat.ok === false && forgeNoMat.reason === "not_enough_material";
        out.notEquippedAfterFail = p.equipped.held === null;

        // F3 — mit Material: schmiedet + KONSUMIERT + rüstet aus + friert die Präzision ein
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const forgeOk = r.forgeBlueprint("__forge_tool");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadForgeSucceeds = forgeOk.ok === true;
        out.pfadForgeConsumes = steinBefore > steinAfter;
        out.forgeEquips = p.equipped.held === "__forge_tool";
        out.forgeFreezesPrecision = Number.isFinite(blu.__forge_tool.forgedPrecision);

        // F3 — schöpfer schmiedet frei (ohne Material)
        r.setGameMode("schöpfer");
        p.inventory = new Array(27).fill(null);
        p.equipped.held = null;
        const forgeFree = r.forgeBlueprint("__forge_tool");
        out.schoepferForgesFree =
            forgeFree.ok === true && forgeFree.free === true && p.equipped.held === "__forge_tool";

        // cleanup
        delete blu.__f2_fine;
        delete blu.__f2_rough;
        delete blu.__forge_tool;
        p.equipped.held = savedHeld;
        p.inventory = new Array(27).fill(null);
        r.setGameMode(savedMode);
        return out;
    });
    check("V17.61 S3: forgeBlueprint (der Werk-Akt) existiert", res.method);
    check(
        "V17.61 S3: F2 — die Praezision moduliert die Abbau-Kraft (fein > grob, gleiche Form/Materie; die Rekursion schliesst)",
        res.precisionModulatesMine
    );
    check(
        "V17.61 S3: F3 — schmieden in pfad OHNE Material → abgelehnt (not_enough_material) + nicht ausgeruestet",
        res.pfadForgeRejectsWithoutMaterial && res.notEquippedAfterFail
    );
    check(
        "V17.61 S3: F3 KONSUM — schmieden in pfad MIT Material → erfolg + verbraucht Material + ausgeruestet",
        res.pfadForgeSucceeds && res.pfadForgeConsumes && res.forgeEquips
    );
    check("V17.61 S3: F3 — schmieden friert die Praezision ein (forgedPrecision gesetzt)", res.forgeFreezesPrecision);
    check("V17.61 S3: F3 — schoepfer schmiedet frei (ohne Material) + ruestet aus", res.schoepferForgesFree);
}

// V17.62 S3-B (kampf-plan §11.7) — der Schmiede-Akt wird BEDEUTSAM: der Spieler-Equip-Pfad (wieldBlueprint)
// geht durch das Schmieden — ein ungeschmiedetes Geraet in pfad/frieden kostet (schmieden), ein
// geschmiedetes (forgedPrecision, persistiert) ist frei in die Hand zu nehmen. Heilt den Gratis-Bypass.
async function checkBandV1762ForgeMeaningful(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;

        out.method = typeof r.wieldBlueprint === "function";

        // (2) Persistenz: forgedPrecision überlebt serialize → deserialize (geschmiedet bleibt geschmiedet)
        blu.__wield_persist = {
            name: "__wield_persist",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.8, y: 0.8, z: 0.8 }, position: { x: 0, y: 0, z: 0 } },
            ],
            forgedPrecision: 0.73,
        };
        const ser = r._serializeBlueprint(blu.__wield_persist);
        const deser = r._deserializeBlueprint(ser);
        out.forgedPrecisionPersists = !!deser && Math.abs((deser.forgedPrecision || 0) - 0.73) < 1e-6;

        // (3) wield UNgeschmiedet in pfad OHNE Material → not_enough_material (nicht ausgerüstet)
        blu.__wield_tool = {
            name: "__wield_tool",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.9, y: 0.9, z: 0.9 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        p.equipped.held = null;
        const wieldNoMat = r.wieldBlueprint("__wield_tool");
        out.pfadWieldRejectsUnforged =
            wieldNoMat.ok === false && wieldNoMat.reason === "not_enough_material" && p.equipped.held === null;

        // (4) wield UNgeschmiedet in pfad MIT Material → SCHMIEDET (zahlt + rüstet aus + friert ein)
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const wieldForges = r.wieldBlueprint("__wield_tool");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadWieldForgesUnforged =
            wieldForges.ok === true &&
            steinBefore > steinAfter &&
            p.equipped.held === "__wield_tool" &&
            Number.isFinite(blu.__wield_tool.forgedPrecision);

        // (5) wield GESCHMIEDET in pfad mit LEEREM Inventar → FREI (Gebrauch, kein Neu-Zahlen)
        p.equipped.held = null;
        p.inventory = new Array(27).fill(null);
        const wieldForged = r.wieldBlueprint("__wield_tool");
        out.pfadWieldForgedIsFree = wieldForged.ok === true && p.equipped.held === "__wield_tool";

        // (6) wield UNgeschmiedet in schöpfer → FREI (Gott-Modus, kein Schmieden nötig)
        delete blu.__wield_tool.forgedPrecision;
        r.setGameMode("schöpfer");
        p.equipped.held = null;
        p.inventory = new Array(27).fill(null);
        const wieldSchoepfer = r.wieldBlueprint("__wield_tool");
        out.schoepferWieldsFree =
            wieldSchoepfer.ok === true &&
            p.equipped.held === "__wield_tool" &&
            !Number.isFinite(blu.__wield_tool.forgedPrecision);

        // cleanup
        delete blu.__wield_persist;
        delete blu.__wield_tool;
        p.equipped.held = savedHeld;
        p.inventory = new Array(27).fill(null);
        r.setGameMode(savedMode);
        return out;
    });
    check("V17.62 S3-B: wieldBlueprint (der bedeutsame Spieler-Pfad) existiert", res.method);
    check(
        "V17.62 S3-B: forgedPrecision persistiert (serialize → deserialize; geschmiedet bleibt geschmiedet)",
        res.forgedPrecisionPersists
    );
    check(
        "V17.62 S3-B: DER HEAL — ein UNgeschmiedetes Geraet in pfad OHNE Material in die Hand → abgelehnt (schmieden noetig, nicht gratis)",
        res.pfadWieldRejectsUnforged
    );
    check(
        "V17.62 S3-B: KONSUM — ein ungeschmiedetes in pfad MIT Material in die Hand → SCHMIEDET (zahlt + ruestet aus + friert ein)",
        res.pfadWieldForgesUnforged
    );
    check(
        "V17.62 S3-B: GEBRAUCH frei — ein GESCHMIEDETES Geraet in die Hand nehmen kostet NICHTS (leeres Inventar, trotzdem ok)",
        res.pfadWieldForgedIsFree
    );
    check(
        "V17.62 S3-B: schoepfer nimmt ungeschmiedet frei in die Hand (Gott-Modus, kein Schmieden)",
        res.schoepferWieldsFree
    );
}

// V17.63 S4 (kampf-plan §11.7) — Rüstung schmieden/weben: derselbe WERK-Kern (_forgeMaterialAndFreeze) wie
// das Gerät, in den armor-Slot; wearArmor ist der Spieler-Pfad (forge-wenn-ungemacht), fertigeBlueprint
// routet nach Rolle. KONSUM (nicht Existenz, V17.31).
async function checkBandV1763ForgeArmor(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;
        const savedArmor = p.equipped.armor;

        out.methods = ["forgeArmor", "wearArmor", "fertigeBlueprint", "_forgeMaterialAndFreeze"].every(
            (m) => typeof r[m] === "function"
        );

        // ein dichtes Rüstungs-Compound (stein → dichte+härte = Schutz)
        blu.__arm = {
            name: "__arm",
            parts: [
                { shape: "box", material: "stein", size: { x: 1.2, y: 1.4, z: 0.4 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };

        // (2) forgeArmor verlangt role="armor"
        r.setGameMode("schöpfer");
        const armNoRole = r.forgeArmor("__arm");
        out.forgeArmorRequiresRole = armNoRole.ok === false && armNoRole.reason === "not_marked_as_armor";
        r.setBlueprintAsArmor("__arm");
        out.markedArmor = blu.__arm.role === "armor";

        // (3) forgeArmor in pfad OHNE Material → abgelehnt + nicht getragen
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        p.equipped.armor = null;
        const armNoMat = r.forgeArmor("__arm");
        out.pfadArmorRejectsWithoutMaterial =
            armNoMat.ok === false && armNoMat.reason === "not_enough_material" && p.equipped.armor === null;

        // (4) forgeArmor in pfad MIT Material → webt (zahlt + trägt + friert ein)
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const armForge = r.forgeArmor("__arm");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadArmorForges =
            armForge.ok === true &&
            steinBefore > steinAfter &&
            p.equipped.armor === "__arm" &&
            Number.isFinite(blu.__arm.forgedPrecision);

        // (5) wearArmor: eine gemachte Rüstung → frei tragen (leeres Inventar)
        p.equipped.armor = null;
        p.inventory = new Array(27).fill(null);
        const armWearMade = r.wearArmor("__arm");
        out.wearMadeArmorFree = armWearMade.ok === true && p.equipped.armor === "__arm";

        // (6) fertigeBlueprint routet nach Rolle: armor → armor-Slot, non-armor → held-Slot
        delete blu.__arm.forgedPrecision;
        p.equipped.armor = null;
        p.equipped.held = null;
        r.setGameMode("schöpfer");
        const fertArmor = r.fertigeBlueprint("__arm");
        out.fertigeArmorToArmorSlot =
            fertArmor.ok === true && p.equipped.armor === "__arm" && p.equipped.held !== "__arm";
        blu.__geraet = {
            name: "__geraet",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.15, y: 1.2, z: 0.15 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        const fertHeld = r.fertigeBlueprint("__geraet");
        out.fertigeGeraetToHeldSlot = fertHeld.ok === true && p.equipped.held === "__geraet";

        // (7) forgeBlueprint funktioniert nach dem Refactor noch (zahlt + held)
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        p.equipped.held = null;
        delete blu.__geraet.forgedPrecision;
        const heldBefore = p.inventory[0].count;
        const heldForge = r.forgeBlueprint("__geraet");
        const heldAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.forgeBlueprintStillWorks =
            heldForge.ok === true && heldBefore > heldAfter && p.equipped.held === "__geraet";

        // cleanup
        delete blu.__arm;
        delete blu.__geraet;
        p.equipped.held = savedHeld;
        p.equipped.armor = savedArmor;
        p.inventory = new Array(27).fill(null);
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "V17.63 S4: die Methoden (forgeArmor/wearArmor/fertigeBlueprint/_forgeMaterialAndFreeze) existieren",
        res.methods
    );
    check(
        "V17.63 S4: forgeArmor verlangt einen als Ruestung markierten Bauplan (sonst not_marked_as_armor)",
        res.forgeArmorRequiresRole && res.markedArmor
    );
    check(
        "V17.63 S4: forgeArmor in pfad OHNE Material → abgelehnt + nicht getragen",
        res.pfadArmorRejectsWithoutMaterial
    );
    check(
        "V17.63 S4: KONSUM — forgeArmor in pfad MIT Material → webt (zahlt + traegt + friert ein)",
        res.pfadArmorForges
    );
    check(
        "V17.63 S4: GEBRAUCH frei — eine gemachte Ruestung tragen kostet nichts (leeres Inventar)",
        res.wearMadeArmorFree
    );
    check(
        "V17.63 S4: fertigeBlueprint routet nach Rolle (Ruestung → armor-Slot, Geraet → held-Slot)",
        res.fertigeArmorToArmorSlot && res.fertigeGeraetToHeldSlot
    );
    check(
        "V17.63 S4: forgeBlueprint funktioniert nach dem Refactor noch (zahlt + in die Hand)",
        res.forgeBlueprintStillWorks
    );
}

// V17.65 S6 (kampf-plan §11.7, §11.3-Faden 6) — Trank brauen: der Werk-Akt zieht die Zutaten (die
// Material-Kosten des Konsumable-Bauplans) durchs Mach-Tor, dann wirkt der Trank. Heilt den ∞-Gratis-Boost.
// activateConsumable bleibt das freie Low-Level-Primitiv. KONSUM (nicht Existenz, V17.31).
async function checkBandV1765BrewConsumable(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();

        out.method = typeof r.brewConsumable === "function";

        blu.__trank = {
            name: "__trank",
            parts: [
                {
                    shape: "sphere",
                    material: "stein",
                    size: { x: 0.5, y: 0.5, z: 0.5 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        r.setBlueprintAsConsumable("__trank", 30, "Test-Trank", 0.2);
        out.markedConsumable = blu.__trank.role === "consumable";
        blu.__nottrank = {
            name: "__nottrank",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.5, y: 0.5, z: 0.5 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };

        // (2) brewConsumable verlangt role="consumable"
        r.setGameMode("schöpfer");
        const brewNoRole = r.brewConsumable("__nottrank");
        out.brewRequiresConsumable = brewNoRole.ok === false && brewNoRole.reason === "not_a_consumable";

        // (3) brewConsumable in pfad OHNE Zutaten → abgelehnt
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        const brewNoMat = r.brewConsumable("__trank");
        out.pfadBrewRejectsWithoutMaterial = brewNoMat.ok === false && brewNoMat.reason === "not_enough_material";

        // (4) brewConsumable in pfad MIT Zutaten → braut (zieht Material + der Trank wirkt)
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const brewOk = r.brewConsumable("__trank");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadBrewConsumesAndWorks = brewOk.ok === true && steinBefore > steinAfter;

        // (5) activateConsumable bleibt FREI (Low-Level): wirkt mit leerem Inventar (zieht kein Material)
        p.inventory = new Array(27).fill(null);
        const actDirect = r.activateConsumable("__trank");
        out.activateStillFree = actDirect.ok === true;

        // (6) brewConsumable frei in schöpfer
        r.setGameMode("schöpfer");
        p.inventory = new Array(27).fill(null);
        const brewSchoepfer = r.brewConsumable("__trank");
        out.schoepferBrewsFree = brewSchoepfer.ok === true && brewSchoepfer.free === true;

        // (7) fertigeBlueprint routet consumable → brewConsumable (Brau-Ablehnung, nicht Gerät-Schmieden)
        r.setGameMode("pfad");
        p.inventory = new Array(27).fill(null);
        const fertNoMat = r.fertigeBlueprint("__trank");
        out.fertigeRoutesConsumable = fertNoMat.ok === false && fertNoMat.reason === "not_enough_material";

        // cleanup
        delete blu.__trank;
        delete blu.__nottrank;
        p.inventory = new Array(27).fill(null);
        r.setGameMode(savedMode);
        return out;
    });
    check("V17.65 S6: brewConsumable existiert", res.method);
    check(
        "V17.65 S6: brewConsumable verlangt role=consumable (sonst not_a_consumable)",
        res.brewRequiresConsumable && res.markedConsumable
    );
    check("V17.65 S6: brauen in pfad OHNE Zutaten → abgelehnt (kein Trank)", res.pfadBrewRejectsWithoutMaterial);
    check(
        "V17.65 S6: KONSUM — brauen in pfad MIT Zutaten → zieht Material + der Trank wirkt",
        res.pfadBrewConsumesAndWorks
    );
    check(
        "V17.65 S6: activateConsumable bleibt das freie Low-Level-Primitiv (wirkt ohne Material)",
        res.activateStillFree
    );
    check("V17.65 S6: schoepfer braut frei (ohne Zutaten)", res.schoepferBrewsFree);
    check(
        "V17.65 S6: fertigeBlueprint routet consumable → brewConsumable (Brau-Ablehnung, nicht Geraet)",
        res.fertigeRoutesConsumable
    );
}

// Der EINE Fluss: FERTIGEN ist die Abschluss-Zeile der Stats-Tabelle (kein paralleler ⚒-Knopf),
// _workshopStationGate hängt end-to-end am Mach-Akt (nicht nur confirmBuild). Geprüft: das Gate
// lehnt ab/lässt durch, die FERTIGEN-Zeile rendert, die alten Knöpfe sind weg.
async function checkBandV1766FertigenFlow(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        const savedMode = r.getGameMode();
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const savedArch = r.state.architectures.slice();
        // FERTIGEN rüstet das geschmiedete Werk aus (equipped.held/armor) — sauber zurücksetzen, sonst
        // zeigt eine spätere Band einen baumelnden Held (gelöschter Bauplan).
        const savedEquipped = p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : null;

        // --- die Methoden da ---
        out.methods =
            typeof r._workshopAppendFertigenRow === "function" &&
            typeof r._makeStationGate === "function" &&
            typeof r._stationLabelForDomain === "function";

        // --- V17.91: der Detail-Editor (samt _workshopRenderActions) ist ENTFERNT → die alten parallelen
        // Mach-Knöpfe existieren definitiv nicht mehr; der EINE FERTIGEN-Akt lebt im Stats-Panel. ---
        out.oldButtonsGone = typeof r._workshopRenderActions !== "function";

        // === ein DOMAIN-tragendes forging-Geraet vorbereiten (schoepfer = kein Stamina-Zug). EIN
        // eisen-Part (Einzel-Material → die Kosten sind eindeutig eisen) + ein schmiede-hammer-Op
        // (forging-Domain). ===
        r.setGameMode("schöpfer");
        if (blu.__s7_forge) delete blu.__s7_forge;
        blu.__s7_forge = {
            name: "__s7_forge",
            parts: [
                { shape: "box", material: "eisen", size: { x: 0.2, y: 1.6, z: 0.2 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        // V17.88 — die Domain-Werkzeuge sind nicht mehr Starter (die Werkstatt ist der Prozess); für den
        // direkten applyOpToPart-Test (Domain-Logik) leihen wir das Werkzeug aus der Op-Bibliothek.
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        r.applyOpToPart("__s7_forge", 0, "schmiede-hammer");
        out.forgeHasDomain = r.computeBlueprintDomain(blu.__s7_forge) === "forging";

        // === (b) DAS MASCHINE-GATE — pfad + forging-domain + KEINE Esse → no_workshop_station ===
        r.setGameMode("pfad");
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("eisen", 400);
        const eisenStart = p.inventory[0].count;
        const noStation = r.fertigeBlueprint("__s7_forge");
        out.pfadNoStationRejects = noStation.ok === false && noStation.reason === "no_workshop_station";
        out.noStationReportsDomain = noStation.neededDomain === "forging";
        // das Tor schloss VOR den Kosten → Material bleibt unberuehrt
        out.noStationKeepsMaterial = p.inventory[0] && p.inventory[0].count === eisenStart;

        // === KONSUM: Esse beim Spieler → FERTIGEN gelingt + zieht Material ===
        r.state.architectures.push({ type: "esse", position: { x: pm.x, y: pm.y, z: pm.z }, id: "__s7_esse" });
        const eisenBefore = p.inventory[0].count;
        const withStation = r.fertigeBlueprint("__s7_forge");
        const eisenAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadWithStationMakes = withStation.ok === true && eisenBefore > eisenAfter;

        // === ein DOMAIN-LOSES Geraet braucht KEINE Station (das Gate ist transparent) ===
        delete blu.__s7_plain;
        blu.__s7_plain = {
            name: "__s7_plain",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.2, y: 1.8, z: 0.2 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
        p.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 400);
        const plainOk = r.fertigeBlueprint("__s7_plain");
        out.domainlessNeedsNoStation = plainOk.ok === true;

        // === frieden/schoepfer ueberspringen die Station (forging-domain, KEINE Esse) ===
        r.setGameMode("schöpfer");
        const schoepferNoStation = r.fertigeBlueprint("__s7_forge");
        out.schoepferSkipsStation = schoepferNoStation.ok === true;

        // === KONSUM (DOM): die FERTIGEN-Zeile rendert; eine Station-Rolle rendert KEINE (der Guard) ===
        const panel = document.createElement("div");
        r._workshopAppendFertigenRow(panel, blu.__s7_plain);
        out.domHasFertigenButton = !!panel.querySelector(".workshop-fertigen");
        const panel2 = document.createElement("div");
        r._workshopAppendFertigenRow(panel2, blu.esse); // esse = role workshop-station → wird gebaut, nicht gefertigt
        out.stationRoleNoFertigen = !panel2.querySelector(".workshop-fertigen");

        // cleanup
        delete blu.__s7_forge;
        delete blu.__s7_plain;
        r.state.architectures = savedArch;
        p.inventory = new Array(27).fill(null);
        p.equipped = savedEquipped;
        if (typeof r.recomputePlayerStats === "function") r.recomputePlayerStats();
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "V17.66 S7: die FERTIGEN-/Station-Methoden existieren (_workshopAppendFertigenRow/_makeStationGate/_stationLabelForDomain)",
        res.methods
    );
    check(
        "V17.66 S7: die alten parallelen Mach-Knoepfe (⚒/Seele) sind aus dem Detail-Editor ENTFERNT",
        res.oldButtonsGone
    );
    check("V17.66 S7: das forging-Geraet traegt die Domain (Voraussetzung fuers Maschine-Gate)", res.forgeHasDomain);
    check(
        "V17.66 S7: (b) DAS MASCHINE-GATE — pfad + forging ohne Esse → no_workshop_station (Domain gemeldet + Material bleibt)",
        res.pfadNoStationRejects && res.noStationReportsDomain && res.noStationKeepsMaterial
    );
    check(
        "V17.66 S7: KONSUM — Esse beim Spieler → FERTIGEN gelingt + zieht Material (end-to-end, nicht nur confirmBuild)",
        res.pfadWithStationMakes
    );
    check(
        "V17.66 S7: ein domain-loses Geraet braucht KEINE Station (das Gate ist transparent — darum brechen die S3-S6-Bands nicht)",
        res.domainlessNeedsNoStation
    );
    check("V17.66 S7: frieden/schoepfer ueberspringen die Station (forging ohne Esse → ok)", res.schoepferSkipsStation);
    check(
        "V17.66 S7: KONSUM — die FERTIGEN-Zeile rendert ins DOM; eine Station-Rolle (esse) rendert KEINE (Guard)",
        res.domHasFertigenButton && res.stationRoleNoFertigen
    );
}

// Werkstatt-Designation: ob etwas eine Werkstatt IST, emergiert nicht sauber (Esse ≈ dichtes
// Bauwerk) → Hand-Flag als Override (Intent); die bediente Domäne EMERGIERT. Ein eigener Apparat
// wird markiert und bedient seine emergente Domäne, das Gate findet ihn.
async function checkBandV1770WorkshopStationMark(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const savedArch = r.state.architectures.slice();
        const savedMode = r.getGameMode();

        out.method = typeof r.setBlueprintAsWorkshopStation === "function";

        // ein eigener Apparat: ein Quarz-Gefäß (durchsichtig → alchemy-Domäne, R1)
        if (blu.__ws_vessel) delete blu.__ws_vessel;
        blu.__ws_vessel = {
            name: "__ws_vessel",
            parts: [{ shape: "sphere", material: "quarz", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } }],
        };
        // VOR der Markierung: die Rolle ist NICHT workshop-station (emergiert nicht als Werkstatt)
        out.notStationBeforeMark = r.computeBlueprintRole(blu.__ws_vessel) !== "workshop-station";

        const mark = r.setBlueprintAsWorkshopStation("__ws_vessel");
        out.markSetsRole =
            mark.ok === true && blu.__ws_vessel.role === "workshop-station" && blu.__ws_vessel.roleManual === true;
        // KONSUM: die bediente Domäne EMERGIERT aus der Substanz (durchsichtiges Gefäß → alchemy), nicht deklariert
        out.domainEmerges = mark.domain === "alchemy" && r._computeWorkshopDomain(blu.__ws_vessel) === "alchemy";

        // Validierung: Built-in + unbekannt abgelehnt (die Built-in-Stationen sind deklarierte Saat)
        out.rejectsBuiltin = r.setBlueprintAsWorkshopStation("esse").ok === false;
        out.rejectsUnknown = r.setBlueprintAsWorkshopStation("__nonexist_xyz").ok === false;

        // (end-to-end) ein vom SPIELER gebauter, markierter forging-Apparat (eisen, dichte → forging) bedient das
        // Gate: ein forging-Werk passt zu ihm. (Forging, weil eisen+schmiede-hammer eine saubere Material-Op-
        // Kompatibilität hat — der Punkt ist „Spieler-Station bedient das Gate via emergenter Domäne", domain-agnostisch.)
        if (blu.__ws_forge) delete blu.__ws_forge;
        blu.__ws_forge = {
            name: "__ws_forge",
            parts: [{ shape: "box", material: "eisen", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } }],
        };
        r.setBlueprintAsWorkshopStation("__ws_forge");
        out.forgeStationDomain = r._computeWorkshopDomain(blu.__ws_forge) === "forging"; // eisen-Masse → forging (emergent)
        if (blu.__ws_work) delete blu.__ws_work;
        blu.__ws_work = {
            name: "__ws_work",
            parts: [
                { shape: "box", material: "eisen", size: { x: 0.8, y: 0.8, z: 0.8 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        r.setGameMode("schöpfer");
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer"); // V17.88 op-Bibliothek leihen
        r.applyOpToPart("__ws_work", 0, "schmiede-hammer"); // forging-Domäne (opChain)
        out.workIsForging = r.computeBlueprintDomain(blu.__ws_work) === "forging";
        r.setGameMode("pfad");
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "__ws_forge");
        r.state.architectures.push({ type: "__ws_forge", position: { x: pm.x, y: pm.y, z: pm.z }, id: "__ws_st" });
        const gate = r._workshopStationGate("__ws_work", { x: pm.x, y: pm.y, z: pm.z });
        out.playerStationServes = gate.ok === true && gate.found === "__ws_forge"; // ein SPIELER-Apparat bedient das Gate

        // der DSL-Op (Spiegel von set_armor_role)
        if (blu.__ws_dsl) delete blu.__ws_dsl;
        blu.__ws_dsl = {
            name: "__ws_dsl",
            parts: [{ shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } }],
        };
        r.dslRun(["set_workshop_station", "__ws_dsl"], { source: "test" });
        out.dslMarks = blu.__ws_dsl.role === "workshop-station";

        // cleanup
        delete blu.__ws_vessel;
        delete blu.__ws_forge;
        delete blu.__ws_work;
        delete blu.__ws_dsl;
        r.state.architectures = savedArch;
        r.setGameMode(savedMode);
        return out;
    });
    check("V17.70 R3-Schluss: setBlueprintAsWorkshopStation existiert", res.method);
    check(
        "V17.70 R3-Schluss: die Markierung setzt role=workshop-station + roleManual (der Intent-Override); vorher emergiert der Apparat NICHT als Werkstatt",
        res.markSetsRole && res.notStationBeforeMark
    );
    check(
        "V17.70 R3-Schluss: KONSUM — die bediente Domäne EMERGIERT aus der Substanz (Quarz-Gefäß → alchemy via R1), nicht deklariert",
        res.domainEmerges
    );
    check(
        "V17.70 R3-Schluss: Built-in (esse) + unbekannt werden abgelehnt (Saat unantastbar)",
        res.rejectsBuiltin && res.rejectsUnknown
    );
    check(
        "V17.70 R3-Schluss: end-to-end — ein vom SPIELER gebauter, markierter Apparat bedient das Werkstatt-Gate (ein alchemy-Werk passt zu ihm)",
        res.forgeStationDomain && res.workIsForging && res.playerStationServes
    );
    check("V17.70 R3-Schluss: der DSL-Op set_workshop_station markiert (Spiegel von set_armor_role)", res.dslMarks);
}

async function checkBandV1772Library(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;

        // AUSLÖSCHUNGS-WELLE — geraet_spitzhacke fiel als Blueprint; die Werkzeug-Substanz lebt
        // eingefroren in KIND_SUBSTANCE. Der Test registriert ein deterministisches Test-Blueprint
        // aus der Substanz-Zeile (foundry-unabhängig) und räumt es am Ende wieder auf.
        const KS72 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (blu._t_v1772) delete blu._t_v1772;
        blu._t_v1772 = { name: "_t_v1772", parts: JSON.parse(JSON.stringify(KS72.geraet_spitzhacke.parts)) };
        const G = blu._t_v1772;
        const A = blu.ruestung_brustpanzer;
        const T = blu.trank_lebenssaft;
        const V = blu.koerper_human;
        out.allExist = !!(KS72.geraet_spitzhacke && A && T && V) && A.builtIn && T.builtIn && V.builtIn;

        // (1) die deklarierten Rollen: Gerät rollenlos (gehalten, W2-B), die drei anderen deklariert.
        out.rolesDeclared = G.role === undefined && A.role === "armor" && T.role === "consumable" && V.role === "soul";

        // (2) SUBSTANZ-EHRLICH: computeBlueprintRole (liest NICHT bp.role) emergiert für Trank/Avatar zur
        // SELBEN Rolle; die Rüstung resoniert architecture (dichter+harter Intent-Zwilling → armor ist
        // deklarierter Override, kein Emergenz-Versagen).
        out.trankHonest = r.computeBlueprintRole(T) === "consumable";
        out.avatarHonest = r.computeBlueprintRole(V) === "soul" && r._isBodyShaped(V) === true;
        out.armorIsTwin = r.computeBlueprintRole(A) === "architecture"; // Platte (stumpf) → Bauwerk, armor-Rolle ist Intent
        out.geraetIsImplement = ["weapon", "tool"].includes(r.computeBlueprintRole(G)); // V17.83 U4: die Spitzhacke (spitz+gestreckt) → Gerät aus der Form

        // (3) das Role-GATE beißt: die rollen-spezifischen Mach-Akte lehnen das rollenlose Gerät ab.
        out.armorGate = r.forgeArmor("_t_v1772").reason === "not_marked_as_armor";
        out.brewGate = r.brewConsumable("_t_v1772").reason === "not_a_consumable";
        out.avatarGate = r.forgeAvatar("_t_v1772").reason === "blueprint_not_soul";

        // (4) kein Worldgen-Litter: deliberate Items (kein `instanced` → nicht in der Mass-Spawn-Bahn).
        out.noLitter = !G.instanced && !A.instanced && !T.instanced && !V.instanced;

        // (5) KONSUM — die vier Mach-Akte FEUERN rollen-gerecht (schöpfer = frei, kein Material/Station nötig).
        //     Snapshot des Player-States, danach restauriert (V17.66).
        const savedMode = r.getGameMode();
        const savedEquip = p && p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : { held: null, armor: null };
        const savedBoosts = p && Array.isArray(p.boosts) ? p.boosts.slice() : [];
        const savedSoul = (p && p.soul) || "mensch";
        if (typeof r.setGameMode === "function") r.setGameMode("schöpfer");
        else r.state.worldMeta.gameMode = "schöpfer";

        const fg = r.fertigeBlueprint("_t_v1772");
        out.geraetForged = fg.ok === true && p.equipped.held === "_t_v1772";
        const fa = r.fertigeBlueprint("ruestung_brustpanzer");
        out.armorForged = fa.ok === true && p.equipped.armor === "ruestung_brustpanzer";
        const ft = r.fertigeBlueprint("trank_lebenssaft");
        out.trankBrewed = ft.ok === true; // brewConsumable → activateConsumable → Boost
        const fv = r.fertigeBlueprint("koerper_human");
        out.avatarEmbodied = fv.ok === true;

        // restore — kein dangling Held/Soul/Boost für die nächsten Bands
        if (typeof r.setGameMode === "function") r.setGameMode(savedMode);
        else r.state.worldMeta.gameMode = savedMode;
        if (r.state.customSouls) delete r.state.customSouls["bp_koerper_human"]; // V17.74 — kein Soul-Leck für spätere Bands
        for (const bn of ["_t_v1772", "ruestung_brustpanzer", "trank_lebenssaft", "koerper_human"]) {
            if (r.state.blueprints[bn]) delete r.state.blueprints[bn].forgedPrecision; // V17.75 — kein forge-Leck (un-forged Default)
        }
        r.applyPlayerSoul(savedSoul);
        if (p) {
            p.equipped = savedEquip;
            p.boosts = savedBoosts;
        }
        delete blu._t_v1772; // Test-Blueprint aufräumen (kein Katalog-Leck)
        if (typeof r.recomputePlayerStats === "function") r.recomputePlayerStats();
        return out;
    });
    check(
        "V17.72 A1: die drei Bibliotheks-Built-ins (Rüstung/Trank/Avatar) + die Geräte-Substanz (KIND_SUBSTANCE) existieren",
        res.allExist
    );
    check(
        "V17.72 A1: die Rollen sind deklariert — Gerät rollenlos (gehalten, W2-B), Rüstung/Trank/Avatar = armor/consumable/soul",
        res.rolesDeclared
    );
    check(
        "V17.72 A1 SUBSTANZ-EHRLICH: der Trank resoniert consumable + der Avatar soul (body-shaped) — ein Spieler-Klon emergierte zur selben Rolle",
        res.trankHonest && res.avatarHonest
    );
    check(
        "V17.72 A1 / V17.83 U4: die Rüstungs-Platte (stumpf) → Bauwerk (armor-Rolle = Intent-Override, V17.70); die Spitzhacke (spitz+gestreckt) → Gerät AUS DER FORM (U4 trennt Klinge vom Bauwerk)",
        res.armorIsTwin && res.geraetIsImplement
    );
    check(
        "V17.72 A1: das Role-GATE beißt — forgeArmor/brewConsumable/forgeAvatar lehnen das rollenlose Gerät ab",
        res.armorGate && res.brewGate && res.avatarGate
    );
    check(
        "V17.72 A1: kein Worldgen-Litter — die vier sind deliberate Items (kein instanced-Flag, nicht in der Spawn-Kandidatenliste)",
        res.noLitter
    );
    check(
        "V17.72 A1 KONSUM: die vier Mach-Akte FEUERN rollen-gerecht — fertigeBlueprint schmiedet Gerät (held) + webt Rüstung (armor) + braut Trank + formt Avatar",
        res.geraetForged && res.armorForged && res.trankBrewed && res.avatarEmbodied
    );
}

// Gehaltenes Gerät SICHTBAR in der Hand — headless: Mesh erscheint beim Equip, skaliert, am Avatar
// geparentet, wechselt ohne Leak, verschwindet beim Ablegen, formloses builtIn-Tool abgelehnt,
// re-attached beim Körper-Wechsel (Optik/Pose headless blind). Player-State: Snapshot + Restore.
async function checkBandV1773HeldMesh(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh;
        out.hasPlayerMesh = !!pm;
        if (!pm) return out;

        // Snapshot — am Ende restauriert (kein dangling Held/Soul für die nächsten Bands).
        const savedEquip = p && p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : { held: null, armor: null };
        const savedSoul = (p && p.soul) || "mensch";

        // AUSLÖSCHUNGS-WELLE — geraet_spitzhacke fiel als Blueprint; Test-Blueprint aus der
        // eingefrorenen Werkzeug-Substanz (KIND_SUBSTANCE, foundry-unabhängig, am Ende geräumt).
        const KS73 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_v1773) delete r.state.blueprints._t_v1773;
        r.state.blueprints._t_v1773 = {
            name: "_t_v1773",
            parts: JSON.parse(JSON.stringify(KS73.geraet_spitzhacke.parts)),
        };

        // sauberer Start
        r.equipHeld(null);
        out.startNoMesh = !(pm.userData && pm.userData.heldMesh);

        // (1) ein echtes Geräte-Bauplan (Werkzeug-Substanz) → Mesh erscheint, am Avatar geparentet
        const eq1 = r.equipHeld("_t_v1773");
        const m1 = pm.userData && pm.userData.heldMesh;
        out.equipOk = eq1.ok === true && p.equipped.held === "_t_v1773";
        out.meshBuilt = !!m1 && Array.isArray(m1.children) && m1.children.length > 0;
        const parts = pm.userData && pm.userData.parts;
        const armAnchor = parts && (parts.rightArm || parts.rightWing);
        out.parented = !!m1 && (m1.parent === armAnchor || m1.parent === pm);
        // Der Mensch hat einen Arm → daran (schwingt mit); Custom-Seele → an die Wurzel
        out.onAnchor = !!m1 && (armAnchor ? m1.parent === armAnchor : m1.parent === pm);

        // (2) auf greifbare Hand-Größe skaliert (nicht roh) — in WELT-Metern (W5: die Hand teilt die Anker-Skala des
        //     Handgelenks heraus, lokal steht dort 1/0,27)
        let m1Welt = 0;
        if (m1) {
            m1.updateMatrixWorld(true);
            m1Welt = m1.getWorldScale(new THREE.Vector3()).x;
        }
        out.scaled = !!m1 && m1Welt > 0 && m1Welt <= r.constructor.HELD_MESH.maxScale;

        // (3) Equip-Wechsel: anderer Bauplan → das Mesh wechselt (neues Objekt) + das alte ist
        //     aus dem Graph (kein Leak). `waterfall` (große Struktur) testet zugleich die Skalierung.
        const m1uuid = m1 && m1.uuid;
        r.equipHeld("waterfall");
        const m2 = pm.userData && pm.userData.heldMesh;
        out.swapped = !!m2 && m2.uuid !== m1uuid;
        out.oldDetached = !m1 || m1.parent === null;

        // (4) ablegen → kein Mesh
        r.equipHeld(null);
        out.unequipNoMesh = !(pm.userData && pm.userData.heldMesh);

        // (5) ein formloses builtIn-Crafting-Tool (schmiede-hammer, kein Bauplan) → equipHeld lehnt ab, kein Mesh
        //     (die Werkstatt-Schicht state.tools bleibt getrennt vom Welt-Gerät)
        const eqTool = r.equipHeld("schmiede-hammer");
        out.toolRejected = eqTool.ok === false;
        out.toolNoMesh = !(pm.userData && pm.userData.heldMesh);

        // (6) KONSUM — KÖRPER-WECHSEL: Gerät halten, Seele wechseln → das Mesh re-attached am NEUEN
        //     Körper (Restore-/Seelen-sicher; deckt auch den loadState-Pfad).
        r.equipHeld("_t_v1773");
        r.applyPlayerSoul(savedSoul === "bp_koerper_wolf" ? "human" : "wolf");
        const pm2 = r.state.playerMesh;
        const m3 = pm2.userData && pm2.userData.heldMesh;
        out.reattached = !!m3 && m3.parent !== null;
        out.reattachedNewBody = !!m3 && pm2 !== pm;

        // restore — die Original-Seele + das Original-Equip wiederherstellen
        r.applyPlayerSoul(savedSoul);
        if (p) p.equipped = savedEquip;
        r.equipHeld(savedEquip && savedEquip.held ? savedEquip.held : null);
        delete r.state.blueprints._t_v1773; // Test-Blueprint aufräumen
        if (typeof r.recomputePlayerStats === "function") r.recomputePlayerStats();
        return out;
    });
    check(
        "V17.73 S9: Hand-Mesh — Spieler-Mesh da + sauberer Start (kein Held-Mesh nach equipHeld(null))",
        res.hasPlayerMesh && res.startNoMesh
    );
    check(
        "V17.73 S9: ein Geräte-Bauplan (Spitzhacken-Substanz aus KIND_SUBSTANCE) erzeugt ein Hand-Mesh, an den Avatar geparentet (Arm/Flügel/Wurzel)",
        res.equipOk && res.meshBuilt && res.parented && res.onAnchor
    );
    check("V17.73 S9: das Hand-Mesh ist auf greifbare Hand-Größe skaliert (0 < scale ≤ maxScale)", res.scaled);
    check(
        "V17.73 S9: Equip-Wechsel tauscht das Mesh (neues Objekt) + das alte ist aus dem Szenen-Graph (kein Leak)",
        res.swapped && res.oldDetached
    );
    check("V17.73 S9: ablegen (equipHeld(null)) entfernt das Hand-Mesh", res.unequipNoMesh);
    check(
        "V17.73 S9: ein formloses builtIn-Crafting-Tool (schmiede-hammer) wird abgelehnt → kein Hand-Mesh (die Werkstatt-Schicht bleibt getrennt)",
        res.toolRejected && res.toolNoMesh
    );
    check(
        "V17.73 S9 KONSUM: Körper-Wechsel (applyPlayerSoul) re-attached das Hand-Mesh am NEUEN Avatar (Restore-/Seelen-sicher)",
        res.reattached && res.reattachedNewBody
    );
}

// V17.84 U6 (resonanz-system §5) — die FORM in die WIRKUNG für den AVATAR: ein gut geformter Custom-
// Avatar (körper-förmig, symmetrisch) wirkt stärker als ein Klumpen (die soul-Resonanz liest die bodyParts-
// Form). NUR Custom-Avatare — die Built-in-Seele (human) bleibt neutral (kein Balance-Bruch).
async function checkBandV1784AvatarFormFit(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const round = (x) => Math.round((x || 0) * 1000) / 1000;
        const p = r.state.player;
        const out = {};
        const bodyParts = [
            { shape: "box", material: "fleisch", position: { x: 0, y: 1.2, z: 0 }, size: { x: 0.9, y: 1.6, z: 0.5 } },
            {
                shape: "cylinder",
                material: "fleisch",
                position: { x: -0.95, y: 1.1, z: 0 },
                size: { x: 0.3, y: 1.3, z: 0.3 },
            },
            {
                shape: "cylinder",
                material: "fleisch",
                position: { x: 0.95, y: 1.1, z: 0 },
                size: { x: 0.3, y: 1.3, z: 0.3 },
            },
            {
                shape: "cylinder",
                material: "fleisch",
                position: { x: -0.4, y: 0, z: 0 },
                size: { x: 0.35, y: 1.2, z: 0.35 },
            },
            {
                shape: "cylinder",
                material: "fleisch",
                position: { x: 0.4, y: 0, z: 0 },
                size: { x: 0.35, y: 1.2, z: 0.35 },
            },
        ];
        const blobParts = [
            { shape: "box", material: "fleisch", position: { x: 0, y: 0, z: 0 }, size: { x: 1.5, y: 1.5, z: 1.5 } },
        ];
        // (1) der Gate: Built-in-Seele → neutral (in playerSoulDefs), ein Custom-Name nicht
        out.builtinGate = !!r.playerSoulDefs["human"] && !r.playerSoulDefs["_av_body"];
        // (2) die soul-Passung diskriminiert über die FORM (gleiches Material fleisch)
        const fitBody = r._blueprintRoleFit({ parts: bodyParts }, "soul");
        const fitBlob = r._blueprintRoleFit({ parts: blobParts }, "soul");
        out.soulDiscriminates = fitBody > fitBlob;
        out.bodyShaped = r._isBodyShaped({ parts: bodyParts }) === true;
        out.soulVals = `Körper=${round(fitBody)} Klumpen=${round(fitBlob)}`;
        // (3) KONSUM: ein körper-förmiger Custom-Avatar hat höhere Basis-Stats als ein Klumpen (gleiches Material)
        const savedSoul = p.soul;
        const savedCustom = r.state.customSouls ? JSON.parse(JSON.stringify(r.state.customSouls)) : {};
        r.state.customSouls = r.state.customSouls || {};
        r.state.customSouls["_av_body"] = { label: "body", bodyParts: bodyParts };
        r.state.customSouls["_av_blob"] = { label: "blob", bodyParts: blobParts };
        p.soul = "_av_body";
        const sBody = r.computePlayerStats().stats;
        p.soul = "_av_blob";
        const sBlob = r.computePlayerStats().stats;
        out.konsum = sBody.hpMax > sBlob.hpMax;
        out.konsumVals = `Körper.hp=${Math.round(sBody.hpMax)} Klumpen.hp=${Math.round(sBlob.hpMax)}`;
        // restore
        p.soul = savedSoul;
        r.state.customSouls = savedCustom;
        if (typeof r.recomputePlayerStats === "function") r.recomputePlayerStats();
        return out;
    });
    check(
        "V17.84 U6: der Gate — eine Built-in-Seele bleibt neutral (in playerSoulDefs, soulFit 1.0), ein Custom-Avatar bekommt die Form-Passung",
        res.builtinGate
    );
    check(
        "V17.84 U6: die soul-Passung diskriminiert über die FORM — ein körper-förmiger Avatar > ein Klumpen (gleiches Material)",
        res.soulDiscriminates && res.bodyShaped,
        res.soulVals
    );
    check(
        "V17.84 U6 KONSUM: ein körper-förmiger Custom-Avatar hat höhere Basis-Stats als ein Klumpen-Avatar — die FORM erreicht die Avatar-Wirkung",
        res.konsum,
        res.konsumVals
    );
}

// V9.52-c Sub-Welle c — Band-Funktion (Welle 6.D Etappen 1, 2, 3a, 3b, 1.6, 1.7 + Reflexions-Fixes — Soul/Stats/Equipment/Avatar-Editor).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWelle6DSoul(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Soul-Tags + STAT_FROM_TAGS + Stat-Berechnung ###
    // Der Spieler ist ein Compound im selben Hylomorphismus-System wie Architekturen: die 10
    // MATERIAL_TAG_KEYS sind die EINE Achsen-Sprache für Soul- und Material-Tags. STAT_FROM_TAGS sind
    // reine Funktionen → Diskriminations-Tests prüfen Verhältnisse (Fuchs schneller, Bär mehr HP).
    const wave6dResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        // AnazhRealm-Klasse ist global im Script-Scope; page.evaluate
        // sieht sie direkt (kein window-Prefix nötig).
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        if (!C || !C.STAT_FROM_TAGS) return null;
        const out = {};
        out.hasStatMatrix = typeof C.STAT_FROM_TAGS === "object";
        out.statKeys = Object.keys(C.STAT_FROM_TAGS).sort().join(",");
        // V18.61 Ich-F — die flache renderPlayerStatsUI ist durch das Daten-Viz-Spec-Sheet ersetzt.

        // Welle 6.D Etappe 1.5 — Seele = Bauplan aus Körper-Teilen
        const defs = r.playerSoulDefs;
        // ALTLASTEN-NULL: die Built-in-Def-Menge ist der Mensch; die Tier-Körper
        // leben als koerper_-Baupläne (derselbe bodyParts-Vertrag).
        const koerperBps = ["koerper_wesen", "koerper_wolf", "koerper_fuchs", "koerper_baer"].map(
            (n) => r.state.blueprints[n]
        );
        out.allSoulsHaveBodyParts =
            defs.human &&
            Array.isArray(defs.human.bodyParts) &&
            defs.human.bodyParts.length >= 3 &&
            koerperBps.every((b) => b && Array.isArray(b.parts) && b.parts.length >= 10);
        out.bodyPartsHaveShapeMaterial = defs.human.bodyParts
            .concat(...koerperBps.map((b) => b.parts))
            .every((p) => typeof p.shape === "string" && typeof p.material === "string");
        // Tag-Aggregation: bodyParts liefern Compound-Tags via dieselbe
        // MAX-Aggregation wie Architekturen (computeCompoundTags).
        const humanCompoundTags = r.computeSoulCompoundTags(defs.human);
        out.humanCompoundTagsAreObject = humanCompoundTags && typeof humanCompoundTags === "object";
        // Aggregierte Tags sollten echte MATERIAL_TAG_KEYS sein
        out.compoundUsesMaterialKeys = Object.keys(humanCompoundTags).every((k) => C.MATERIAL_TAG_KEYS.includes(k));
        // Body-Materialien müssen in state.materials existieren
        out.bodyMaterialsExist =
            !!r.state.materials.knochen &&
            !!r.state.materials.fleisch &&
            !!r.state.materials.federn &&
            !!r.state.materials.schuppen &&
            !!r.state.materials.glut;
        out.bodyMaterialsAreLebendig =
            (r.state.materials.knochen.tags.lebendig || 0) > 0.9 &&
            (r.state.materials.fleisch.tags.lebendig || 0) > 0.9 &&
            (r.state.materials.federn.tags.lebendig || 0) > 0.9 &&
            (r.state.materials.schuppen.tags.lebendig || 0) > 0.9;

        // computePlayerStats — gibt {tags, stats} zurück
        const computed = r.computePlayerStats();
        out.computedHasTags = computed && typeof computed.tags === "object";
        out.computedHasStats = computed && typeof computed.stats === "object";
        out.computedStatsHasAll =
            computed &&
            computed.stats &&
            // V17.51 Kampf Phase A — das Kampf-Trio fließt durch DIESELBE Pipeline.
            [
                "hpMax",
                "damage",
                "speed",
                "jumpPower",
                "staminaMax",
                "precision",
                "magicResist",
                "heatResist",
                "knockback",
                "attackSpeed",
                "defense",
            ].every((k) => typeof computed.stats[k] === "number" && Number.isFinite(computed.stats[k]));

        // ALTLASTEN-NULL Diskriminations-Test: drei TIER-KÖRPER → drei Profile
        // aus der GRÖSSEN-Achse (die eine Fold-Quelle): Fuchs flink, Bär tank,
        // Wolf dazwischen — Eigenschaften AUS dem Körper, gemessen.
        const savedSoul = r.state.player.soul;
        const embodyStats = (k) => {
            r.applyPlayerSoulFromBlueprint(k);
            return r.computePlayerStats().stats;
        };
        r.applyPlayerSoul("human");
        const humanStats = r.computePlayerStats().stats;
        const fuchsStats = embodyStats("koerper_fuchs");
        const wolfStats = embodyStats("koerper_wolf");
        const baerStats = embodyStats("koerper_baer");

        out.humanStats = humanStats;
        out.fuchsStats = fuchsStats;
        out.baerStats = baerStats;

        out.fuchsFasterThanBaer = fuchsStats.speed > baerStats.speed;
        out.fuchsJumpsHigherThanBaer = fuchsStats.jumpPower > baerStats.jumpPower;
        out.baerHasMoreHpThanFuchs = baerStats.hpMax > fuchsStats.hpMax;
        out.hpOrderBaerWolfFuchs = baerStats.hpMax > wolfStats.hpMax && wolfStats.hpMax > fuchsStats.hpMax;
        out.speedOrderFuchsWolfBaer = fuchsStats.speed > wolfStats.speed && wolfStats.speed > baerStats.speed;
        // Wolf trägt holz-Glieder (magieleitung 0.3) → mehr Mana-Kanal als der
        // fleisch/knochen-Mensch (die V18.196-Emergenz, lebend weitergeprobt).
        out.wolfHasMoreManaThanHuman = (wolfStats.manaMax || 0) > (humanStats.manaMax || 0);
        // Der Mensch (fleisch/knochen, GEMESSEN 134 HP) trägt sein EIGENES
        // Profil — distinkt von jedem Tier (die Substanz unterscheidet ihn).
        out.humanHpBetweenFuchsAndBaer =
            humanStats.hpMax > 0 &&
            Math.abs(humanStats.hpMax - fuchsStats.hpMax) > 1 &&
            Math.abs(humanStats.hpMax - wolfStats.hpMax) > 1 &&
            Math.abs(humanStats.hpMax - baerStats.hpMax) > 1;

        // recomputePlayerStats — applies to state (am Menschen geprobt)
        r.applyPlayerSoul("human");
        r.recomputePlayerStats();
        out.stateSpeedMatches = Math.abs(r.state.speed - humanStats.speed) < 0.001;
        out.stateJumpPowerMatches = Math.abs(r.state.jumpPower - humanStats.jumpPower) < 0.001;
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal: der
        // Sprint-Faktor wohnt im koerper-Gesetz (fx.bewegung.sprintMul,
        // Fallback 2 = byte-alt bei kaltem Kern), nicht mehr fix ×2.
        const bewGesetz6d =
            (globalThis.__koerperCore &&
                globalThis.__koerperCore.PRESETS &&
                globalThis.__koerperCore.PRESETS.mensch &&
                globalThis.__koerperCore.PRESETS.mensch.fx &&
                globalThis.__koerperCore.PRESETS.mensch.fx.bewegung) ||
            null;
        const sprintMul6d =
            bewGesetz6d && Number.isFinite(bewGesetz6d.sprintMul) && bewGesetz6d.sprintMul > 0
                ? bewGesetz6d.sprintMul
                : 2;
        out.stateSprintIsDoubleSpeed = Math.abs(r.state.sprintSpeed - humanStats.speed * sprintMul6d) < 1e-9;
        out.statePlayerStatsCached = r.state.player.stats && r.state.player.stats.hpMax === humanStats.hpMax;
        // K27 — die Lebenswerte sind ZUSTAND: die Wandlung (applyPlayerSoul) füllt sie, eine Neuberechnung klemmt nur
        // (verwundet bleibt verwundet; gate:kampf-gefuehl T27 geht jeden Rufer im Modus pfad).
        const pl6d = r.state.player;
        const vollNachWandlung =
            typeof pl6d.hp === "number" &&
            typeof pl6d.hpMax === "number" &&
            typeof pl6d.stamina === "number" &&
            typeof pl6d.staminaMax === "number" &&
            pl6d.hp === pl6d.hpMax &&
            pl6d.stamina === pl6d.staminaMax;
        pl6d.hp = 0.5 * pl6d.hpMax;
        pl6d.stamina = 0.25 * pl6d.staminaMax;
        r.recomputePlayerStats();
        out.statePlayerHasHpAndStamina =
            vollNachWandlung && pl6d.hp === 0.5 * pl6d.hpMax && pl6d.stamina === 0.25 * pl6d.staminaMax;
        // Restore
        r.applyPlayerSoul(savedSoul);
        r.recomputePlayerStats();


        // UI im DOM (V18.61 Ich-F — das Selbst-Spec-Sheet #ich-stage-spec ersetzt die flache #player-stats-Liste)
        out.statsContainerInDom = !!document.getElementById("ich-stage-spec");
        // Spec-Sheet-Render arbeitet ohne Crash
        let renderOk = false;
        try {
            r._ichRenderSpecSheet();
            renderOk = true;
        } catch (e) {
            out.renderError = String(e);
        }
        out.renderOk = renderOk;
        if (renderOk) {
            const dom = document.getElementById("ich-stage-spec");
            // Werte-Balken (HP + Schaden/Tempo/Ausdauer/Abwehr/Präzision) + NATUR-Balken
            out.statRowsCount = dom ? dom.querySelectorAll(".spec-bar").length : 0;
            out.hasTagLine = dom ? !!dom.querySelector(".spec-col-head") : false;
        }
        return out;
    });

    // ### Reflexions-Fixes ###
    // (1) WASD-Mapping · (2) „damage X“ als Chat-Pattern · (3) Aura-Absenz · (4) Tod-Wunde persistent
    // + linear regenerierend · (5) Werkzeug-Anwendung kostet Stamina · (6) Konsumables aus Compound-Tags.
    const reflexResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};


        // (2) Chat-Pattern für damage
        const dmgPattern = r.parseChatToDsl("schade mir 42");
        out.damageChatParses =
            dmgPattern && dmgPattern.program && dmgPattern.program[0] === "damage" && dmgPattern.program[1] === 42;
        const trinkPattern = r.parseChatToDsl("trink trank_lichts");
        out.trinkChatParses = trinkPattern && trinkPattern.program[0] === "apply_boost";
        const ruestePattern = r.parseChatToDsl("rüste werkzeug hammer");
        out.ruesteChatParses = ruestePattern && ruestePattern.program[0] === "equip_tool";

        // (3) Die Avatar-Aura ist gefallen: Probe auf ABWESENHEIT (Tick, Haut-Shells, Hue-Map,
        // Loop-Aufruf, p2p-Senden). Der p2p-Empfangs-Stub bleibt must-ignore-tolerant (Alt-Peers senden
        // aura weiter).
        r.applyPlayerSoul("human");
        const sub = r.state.playerMesh.children[0];
        out.subMeshExists = !!sub && !!sub.material;
        out.auraTickGone = typeof r.tickPlayerAura !== "function";
        out.auraShellsGone = typeof r._ensureAuraSkinShells !== "function";
        out.auraMapGone = !(window.AnazhRealm || r.constructor).AURA_TAG_HUE;
        out.auraLoopGone = !/tickPlayerAura/.test(window.__codeOf(r.startEternalLoop));
        out.auraSendGone = typeof r._p2pBroadcastAura !== "function";
        // ALTLASTEN-NULL: der dedizierte Stub ist GANZ gefallen — eine aura-
        // Nachricht ist ein UNBEKANNTER Typ und wird vom Dispatcher generisch
        // still verworfen (kein Crash, kein Handler, kein State).
        out.auraStubTolerant = (() => {
            try {
                if (typeof r._p2pMsgAura === "function") return false;
                r.p2pHandleMessage(JSON.stringify({ type: "aura", peerId: "fremd-alt-peer", hue: 12, intensity: 1 }));
                return true;
            } catch (_e) {
                return false;
            }
        })();
        out.boundsRingRemoved = !r.state.playerAura || !r.state.scene.children.includes(r.state.playerAura);
        out.glowSpriteGone = !r.state.playerAuraGlow;

        // Drache: Kopf in +Z (Forward), Kopf-Box bei +0.85 Z — kein Inner-π-Flip (der spiegelte ihn in
        // 3rd-Person zum Spieler hin).
        r.applyPlayerSoul("wolf");
        const dragonGroup = r.state.playerMesh;
        let dragonHasInnerFlip = false;
        if (dragonGroup && dragonGroup.children.length > 0) {
            // Prüfen: KEIN Child mit rotation.y ≈ π existiert.
            for (const c of dragonGroup.children) {
                if (c && c.isGroup && Math.abs((c.rotation.y || 0) - Math.PI) < 0.01) {
                    dragonHasInnerFlip = true;
                    break;
                }
            }
        }
        out.dragonNoInnerFlip = !dragonHasInnerFlip;
        r.applyPlayerSoul("human"); // restore

        // player_speed-DSL-Op setzt sprintSpeed mit (= 2× speed) — sonst machte Shift den Spieler LANGSAMER.
        const beforeSprintBug = r.state.sprintSpeed;
        r.dslRun(["player_speed", 20], { source: "test" });
        out.speedAfterDsl = r.state.speed;
        out.sprintAfterDsl = r.state.sprintSpeed;
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal: der
        // Sprint-Faktor kommt aus dem koerper-Gesetz (fx.bewegung.sprintMul,
        // Fallback 2 = byte-alt bei kaltem Kern), nicht mehr fix ×2.
        const bewGesetzReflex =
            (globalThis.__koerperCore &&
                globalThis.__koerperCore.PRESETS &&
                globalThis.__koerperCore.PRESETS.mensch &&
                globalThis.__koerperCore.PRESETS.mensch.fx &&
                globalThis.__koerperCore.PRESETS.mensch.fx.bewegung) ||
            null;
        const sprintMulReflex =
            bewGesetzReflex && Number.isFinite(bewGesetzReflex.sprintMul) && bewGesetzReflex.sprintMul > 0
                ? bewGesetzReflex.sprintMul
                : 2;
        out.sprintFollowsSpeed = Math.abs(r.state.sprintSpeed - r.state.speed * sprintMulReflex) < 1e-9;
        out.sprintActuallyFaster = r.state.sprintSpeed > r.state.speed;
        // Restore baseline mit explizitem Soul-Reset (frühere Tests
        // haben womöglich Boosts/Wunde/Custom-Soul-Reste hinterlassen)
        r.state.player.soul = "human";
        r.state.player.boosts = [];
        r.state.player.deathWoundIntensity = 0;
        r.state.player.equipped = { held: null, armor: null };
        r.recomputePlayerStats();
        const humanResult = r.computePlayerStats();
        out.humanSpeed = humanResult.stats.speed;
        out.humanTags = JSON.stringify(humanResult.tags);
        out.humanWound = r.state.player.deathWoundIntensity;
        out.humanBoostCount = r.state.player.boosts.length;
        // Mensch ist „balanced“ (niedrige magieleitung, dichte clamped auf 1) ⇒ speed ≥ LEBENDE
        // Gesetz-Base (fx.bewegung.speed.base; Fallback 7 bei kaltem Kern) — gesetz-relativ, kein
        // Arcade-Literal.
        const speedBaseReflex =
            bewGesetzReflex && bewGesetzReflex.speed && Number.isFinite(bewGesetzReflex.speed.base)
                ? bewGesetzReflex.speed.base
                : 7;
        out.humanSpeedBase = speedBaseReflex;
        out.humanSpeedRaised = humanResult.stats.speed >= speedBaseReflex - 1e-9;

        // (4) Tod-Wunde persistent + regeneriert
        out.hasWoundIntensity = "deathWoundIntensity" in r.state.player;
        out.hasWoundPenaltyConst = C.WOUND_TAG_PENALTY && typeof C.WOUND_TAG_PENALTY === "object";
        r.state.player.deathWoundIntensity = 0;
        r.state.player.respawnGraceUntil = -Infinity;
        r.state.player.hp = 1;
        r._playerDeathRespawn("test");
        // Der feld-native Tod (K27): die Rückkehr setzt die Lebenswerte voll — gemessen am Respawn selbst, bevor der
        // Vitals-Takt die Wunde heilt (er hebt hpMax, nie hp).
        out.respawnHpFull = r.state.player.hp === r.state.player.hpMax && r.state.player.hp > 1;
        out.woundSetAt1 = Math.abs(r.state.player.deathWoundIntensity - 1.0) < 0.001;
        // ALTLASTEN-NULL: die Wunde drückt die Tags — der ROHE Stat-Rechner
        // (computePlayerStats) zeigt sie; hp wurde vom Respawn voll gesetzt.
        const woundedHpMax = r.computePlayerStats().stats.hpMax;
        r.state.player.deathWoundIntensity = 0;
        const baselineHpMax = r.computePlayerStats().stats.hpMax;
        r.state.player.deathWoundIntensity = 1.0;
        out.woundReducesHp = woundedHpMax < baselineHpMax;
        // Regen-Tick (jetzt tickPlayerVitals): Wunde reduziert sich
        r.state.player.deathLastTick = -Infinity;
        r.tickPlayerVitals(performance.now() / 1000);
        out.woundRegens = r.state.player.deathWoundIntensity < 1.0;
        // Gnade steht + der Todesort trägt eine Lebens-Spur (das dritte Verb, KONSUM).
        out.respawnGraceSet = r.state.player.respawnGraceUntil > performance.now() / 1000;
        out.deathDepositsLife = !!(r.state.lifeField && r.state.lifeField.size > 0);
        r.state.player.respawnGraceUntil = -Infinity;

        // (5) Werkzeug-Kosten: applyOpToPart braucht Stamina
        r.state.player.deathWoundIntensity = 0;
        r.applyPlayerSoul("human"); // reset Stats inkl. Stamina-max
        out.hasStaminaCostConst = typeof C.TOOL_OP_STAMINA_COST === "number" && C.TOOL_OP_STAMINA_COST > 0;
        out.hasStaminaRegenConst = typeof C.STAMINA_REGEN_PER_SEC === "number";
        // Setup: einen eigenen Bauplan mit einem Part + Spieler besitzt hammer
        // Welle 6.C2: Stamina-Tests laufen im pfad-Modus
        // (Default frieden überspringt Stamina-Kosten).
        if (typeof r.setGameMode === "function") r.setGameMode("pfad");
        r.state.blueprints.wound_test_bp = {
            name: "wound_test_bp",
            label: "Test",
            builtIn: false,
            // eisen akzeptiert plastic-Op (hammer-Klasse); stein nur subtractive.
            parts: [
                {
                    shape: "box",
                    material: "eisen",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                },
            ],
        };
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        const staBefore = r.state.player.stamina;
        const applyOk = r.applyOpToPart("wound_test_bp", 0, "schmiede-hammer");
        out.applyOpResult = applyOk;
        out.staBefore = staBefore;
        out.staAfter = r.state.player.stamina;
        out.applyOpOkWithStamina = applyOk && applyOk.ok;
        out.staminaWasDeducted = r.state.player.stamina < staBefore;
        // Stamina auf 0 → applyOpToPart lehnt ab
        r.state.player.stamina = 1; // weniger als cost 10
        const applyFail = r.applyOpToPart("wound_test_bp", 0, "schmiede-hammer");
        out.applyOpRejectedNoStamina = !applyFail.ok && applyFail.reason === "not_enough_stamina";
        // Cleanup
        delete r.state.blueprints.wound_test_bp;
        r.state.player.stamina = r.state.player.staminaMax;

        // (6) Konsumables aus Compound-Tags
        // Setup: Bauplan aus quarz-Helix + glut-Sphere (sollte magieleitung + brennbar hoch)
        r.state.blueprints.wave6d_potion = {
            name: "wave6d_potion",
            label: "Magie-Trank",
            builtIn: false,
            parts: [
                {
                    shape: "helix",
                    material: "quarz",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 0.3, y: 0.5, z: 2 },
                },
                {
                    shape: "sphere",
                    material: "glut",
                    position: { x: 0, y: 0.5, z: 0 },
                    size: { x: 0.2, y: 0.2, z: 0.2 },
                },
            ],
        };
        const markRes = r.setBlueprintAsConsumable("wave6d_potion", 45, "Magie-Trank", 0.2);
        out.markConsumableOk = markRes && markRes.ok;
        out.blueprintGotRoleConsumable = r.state.blueprints.wave6d_potion.role === "consumable";
        out.blueprintHasConsumableMeta =
            r.state.blueprints.wave6d_potion.consumableMeta &&
            r.state.blueprints.wave6d_potion.consumableMeta.durationSeconds === 45;
        // Aktivieren → tagBonus aus Compound-Tags emergiert
        r.state.player.boosts = [];
        const drinkRes = r.activateConsumable("wave6d_potion");
        out.drinkOk = drinkRes && drinkRes.ok;
        const boost = r.state.player.boosts.find((b) => b.source === "consume:wave6d_potion");
        out.boostExists = !!boost;
        out.boostTagBonusFromCompound = boost && boost.tagDelta && (boost.tagDelta.magieleitung || 0) > 0.05;
        out.boostUsesBlueprintDuration = boost && Math.abs(boost.expiresAt - performance.now() / 1000 - 45) < 2;
        // Cleanup
        delete r.state.blueprints.wave6d_potion;
        r.state.player.boosts = [];

        return out;
    });

    if (reflexResults && !reflexResults.error) {
        // (2) Chat
        check("Reflex 2: 'schade mir 42' chat-pattern → DSL ['damage', 42, ...]", reflexResults.damageChatParses);
        check("Reflex 2: 'trink X' chat-pattern → DSL ['apply_boost', ...]", reflexResults.trinkChatParses);
        check("Reflex 2: 'rüste werkzeug X' chat-pattern → DSL ['equip_tool', ...]", reflexResults.ruesteChatParses);
        // (3) SYNERGIE-WELLE — die Avatar-Aura ist GEFALLEN (das Band wandert, V9.56-i):
        check("Reflex 3 SYNERGIE: tickPlayerAura ist PHYSISCH raus", reflexResults.auraTickGone);
        check("Reflex 3 SYNERGIE: die Fresnel-Haut-Shells sind PHYSISCH raus", reflexResults.auraShellsGone);
        check("Reflex 3 SYNERGIE: AURA_TAG_HUE-Map ist gefallen", reflexResults.auraMapGone);
        check("Reflex 3 SYNERGIE: der Loop ruft keine Aura mehr", reflexResults.auraLoopGone);
        check("Reflex 3 SYNERGIE: die p2p-Sende-Seite ist gefallen", reflexResults.auraSendGone);
        check(
            "Reflex 3 (NULL): aura ist dem Dispatcher unbekannt und wird still verworfen",
            reflexResults.auraStubTolerant
        );
        check("Reflex 3: Alter Boden-Torus-Ring entfernt", reflexResults.boundsRingRemoved);
        check("Reflex 3 V18.105: der Glow-Sprite ist GESCHNITTEN (Schöpfer-Sign-off)", reflexResults.glowSpriteGone);
        // Drache-Orientierung (Schöpfer-Korrektur 13.05.2026): KEIN
        // Inner-π-Flip — der Drache schaut wieder vom Spieler weg.
        check(
            "Compound-Körper: kein Inner-π-Flip (Avatar schaut vom Spieler weg in 3rd-Person)",
            reflexResults.dragonNoInnerFlip
        );
        // Sprint-Bug-Fix: player_speed setzt jetzt sprintSpeed mit
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal
        // (war „= 2× speed" bzw. „mind. 7"; jetzt sprintMul/speed.base aus dem Gesetz).
        check(
            "Welle 6.D Polish: player_speed-DSL-Op aktualisiert sprintSpeed = Gesetz-sprintMul × speed",
            reflexResults.sprintFollowsSpeed,
            `speed=${reflexResults.speedAfterDsl} sprint=${reflexResults.sprintAfterDsl}`
        );
        check(
            "Welle 6.D Polish: Sprint ist nach player_speed wirklich SCHNELLER als Walk",
            reflexResults.sprintActuallyFaster
        );
        check(
            "Welle 6.D Polish: Mensch-Speed mind. Gesetz-base (fx.bewegung.speed.base)",
            reflexResults.humanSpeedRaised,
            `speed=${(reflexResults.humanSpeed || 0).toFixed(2)} base=${(reflexResults.humanSpeedBase || 0).toFixed(2)}`
        );
        // (4) Wunde
        check("Reflex 4: state.player.deathWoundIntensity existiert", reflexResults.hasWoundIntensity);
        check("Reflex 4: AnazhRealm.WOUND_TAG_PENALTY-Konstante existiert", reflexResults.hasWoundPenaltyConst);
        check("Reflex 4: _playerDeathRespawn setzt deathWoundIntensity = 1.0", reflexResults.woundSetAt1);
        check("Reflex 4: Diskrimination — Wunde reduziert hpMax (dichte+härte-Penalty)", reflexResults.woundReducesHp);
        check("Reflex 4: tickPlayerVitals regeneriert Wunde linear", reflexResults.woundRegens);
        check(
            "Reflex 4 (ALTLASTEN-NULL): Respawn stellt HP voll + Gnade steht",
            reflexResults.respawnHpFull && reflexResults.respawnGraceSet
        );
        check(
            "Reflex 4 (ALTLASTEN-NULL): der Todesort trägt eine Lebens-Spur (das dritte Verb)",
            reflexResults.deathDepositsLife
        );
        // (5) Werkzeug-Kosten
        check("Reflex 5: TOOL_OP_STAMINA_COST-Konstante existiert", reflexResults.hasStaminaCostConst);
        check("Reflex 5: STAMINA_REGEN_PER_SEC-Konstante existiert", reflexResults.hasStaminaRegenConst);
        check(
            "Reflex 5: applyOpToPart läuft mit ausreichend Stamina",
            reflexResults.applyOpOkWithStamina,
            `result=${JSON.stringify(reflexResults.applyOpResult)} sta ${reflexResults.staBefore}→${reflexResults.staAfter}`
        );
        check("Reflex 5: applyOpToPart zieht Stamina ab", reflexResults.staminaWasDeducted);
        check("Reflex 5: applyOpToPart lehnt ab bei stamina<cost", reflexResults.applyOpRejectedNoStamina);
        // (6) Konsumables-Logik
        check("Reflex 6: setBlueprintAsConsumable liefert ok", reflexResults.markConsumableOk);
        check("Reflex 6: Bauplan bekommt role:'consumable'", reflexResults.blueprintGotRoleConsumable);
        check("Reflex 6: consumableMeta speichert durationSeconds", reflexResults.blueprintHasConsumableMeta);
        check(
            "Reflex 6: activateConsumable auf Bauplan emergiert Boost aus Compound-Tags",
            reflexResults.drinkOk && reflexResults.boostExists
        );
        check(
            "Reflex 6: Diskrimination — quarz+glut-Bauplan → magieleitung-Boost",
            reflexResults.boostTagBonusFromCompound
        );
        check("Reflex 6: Boost-Dauer aus consumableMeta.durationSeconds", reflexResults.boostUsesBlueprintDuration);
    } else if (reflexResults && reflexResults.error) {
        check("Reflex-Tests Block lief ohne Exception", false, reflexResults.error);
    }

    // ### Welle 6.D Etappe 3b — Equipment + Aura ###
    const wave6d3bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        // Konstanten + Methoden
        out.hasArmorWeight = typeof C.ARMOR_STAT_WEIGHT === "number";
        out.hasToolWeight = typeof C.TOOL_STAT_WEIGHT === "number";
        out.armorWeight03 = Math.abs(C.ARMOR_STAT_WEIGHT - 0.3) < 0.001;
        out.toolWeight015 = Math.abs(C.TOOL_STAT_WEIGHT - 0.15) < 0.001;
        out.hasEquipTool = typeof r.equipTool === "function";
        out.hasEquipArmor = typeof r.equipArmor === "function";
        out.hasEquippedState =
            r.state.player.equipped && "held" in r.state.player.equipped && "armor" in r.state.player.equipped;
        // SYNERGIE-WELLE — die Hue-Map ist mit der Avatar-Aura gefallen (Abwesenheit).
        out.hasAuraHueMap = !C.AURA_TAG_HUE;
        out.auraHueMapHasAllTags = !C.AURA_TAG_HUE;
        // NON_BROADCASTABLE
        out.equipNonBroadcast =
            C.NON_BROADCASTABLE_OPS.has("equip_tool") &&
            C.NON_BROADCASTABLE_OPS.has("equip_armor") &&
            C.NON_BROADCASTABLE_OPS.has("unequip");

        // Setup: Custom-Bauplan für Armor + Werkzeug
        const savedSoul = r.state.player.soul;
        r.applyPlayerSoul("human");
        const baselineStats = JSON.parse(JSON.stringify(r.state.player.stats));

        // Eisen-Rüstung-Bauplan
        r.state.blueprints.test_armor_eisen = {
            name: "test_armor_eisen",
            label: "Eisen-Plate",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    material: "eisen",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                },
                {
                    shape: "box",
                    material: "eisen",
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                },
            ],
        };
        // Markieren als Rüstung
        const markResult = r.setBlueprintAsArmor("test_armor_eisen");
        out.markArmorOk = markResult.ok;
        out.markArmorSetsRole = r.state.blueprints.test_armor_eisen.role === "armor";

        // Built-in schützen (stein_block — lebendes builtIn)
        const markBuiltinResult = r.setBlueprintAsArmor("stein_block");
        out.markBuiltinRejected = !markBuiltinResult.ok && markBuiltinResult.reason === "cannot_modify_builtin";

        // Equip Rüstung
        const equipResult = r.equipArmor("test_armor_eisen");
        out.equipArmorOk = equipResult.ok;
        out.equippedArmorIs = r.state.player.equipped.armor === "test_armor_eisen";
        // Stat-Diskrimination: eisen hat hohe dichte + härte → hpMax steigt
        const armoredStats = r.state.player.stats;
        out.armorIncreasesHp = armoredStats.hpMax > baselineStats.hpMax + 5;
        out.armorIncreasesDamage = armoredStats.damage > baselineStats.damage + 0.5;

        // Equip auf Rüstung ohne Marker → abgelehnt
        r.state.blueprints.test_plain = {
            name: "test_plain",
            label: "Unmarked",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                },
            ],
        };
        const equipUnmarkedResult = r.equipArmor("test_plain");
        out.unmarkedRejected = !equipUnmarkedResult.ok && equipUnmarkedResult.reason === "not_marked_as_armor";

        // Unequip
        r.equipArmor(null);
        out.unequippedRestoresStats = Math.abs(r.state.player.stats.hpMax - baselineStats.hpMax) < 0.01;
        out.equippedArmorNull = r.state.player.equipped.armor === null;

        // Equipped via DSL
        r.equipArmor("test_armor_eisen");
        r.dslRun(["unequip", "armor"], { source: "test" });
        out.dslUnequipWorks = r.state.player.equipped.armor === null;

        // V17.57 W2-B — ein builtIn-Crafting-Tool (schmiede-hammer) ist KEIN Welt-Gerät → equipHeld lehnt es
        // ab (kein Bauplan); ein eigener Bauplan IST haltbar (kein Rollen-Schloss) + faltet in die Stats.
        r.state.player.tools = r.state.player.tools || [];
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        out.equipBuiltinToolOk = !r.equipHeld("schmiede-hammer").ok; // builtIn-Tool → abgelehnt (kein Bauplan)
        out.equippedToolIs = !r.state.player.equipped.held; // nichts gehalten nach der Ablehnung
        const toolStats = r.state.player.stats;
        out.builtinToolNoStatChange = Math.abs(toolStats.hpMax - baselineStats.hpMax) < 0.01;

        // Save-Round-Trip — ein eigener Bauplan als gehaltenes Gerät (kein Rollen-Schloss) reist mit.
        r.equipArmor("test_armor_eisen");
        r.equipHeld("test_armor_eisen");
        const snap = r.buildStateSnapshot();
        out.snapHasEquipped =
            snap.playerEquipped &&
            snap.playerEquipped.armor === "test_armor_eisen" &&
            snap.playerEquipped.held === "test_armor_eisen";
        r.equipHeld(null);

        // SYNERGIE-WELLE — die Avatar-Aura ist GEFALLEN: kein Tick, kein Tint (V9.56-i).
        out.auraSubMeshTinted = typeof r.tickPlayerAura !== "function";

        // Cleanup
        r.equipArmor(null);
        r.equipTool(null);
        delete r.state.blueprints.test_armor_eisen;
        delete r.state.blueprints.test_plain;
        r.applyPlayerSoul(savedSoul);

        return out;
    });

    if (wave6d3bResults && !wave6d3bResults.error) {
        check("Welle 6.D Etappe 3b: ARMOR_STAT_WEIGHT-Konstante existiert", wave6d3bResults.hasArmorWeight);
        check("Welle 6.D Etappe 3b: TOOL_STAT_WEIGHT-Konstante existiert", wave6d3bResults.hasToolWeight);
        check("Welle 6.D Etappe 3b: ARMOR_STAT_WEIGHT == 0.3", wave6d3bResults.armorWeight03);
        check("Welle 6.D Etappe 3b: TOOL_STAT_WEIGHT == 0.15", wave6d3bResults.toolWeight015);
        check("Welle 6.D Etappe 3b: equipTool-Methode existiert", wave6d3bResults.hasEquipTool);
        check("Welle 6.D Etappe 3b: equipArmor-Methode existiert", wave6d3bResults.hasEquipArmor);
        check(
            "Welle 6.D Etappe 3b: state.player.equipped = {held, armor} (V17.57 W2-B)",
            wave6d3bResults.hasEquippedState
        );
        check("Welle 6.D 3b/SYNERGIE: AURA_TAG_HUE ist GEFALLEN (Avatar-Aura raus)", wave6d3bResults.hasAuraHueMap);
        check("Welle 6.D Etappe 3b: equip-Ops in NON_BROADCASTABLE_OPS (privat)", wave6d3bResults.equipNonBroadcast);
        check("Welle 6.D Etappe 3b: setBlueprintAsArmor liefert ok", wave6d3bResults.markArmorOk);
        check("Welle 6.D Etappe 3b: setBlueprintAsArmor setzt role:'armor'", wave6d3bResults.markArmorSetsRole);
        check(
            "Welle 6.D Etappe 3b: Built-in-Bauplan kann nicht als Rüstung markiert werden",
            wave6d3bResults.markBuiltinRejected
        );
        check("Welle 6.D Etappe 3b: equipArmor erfolgreich auf markiertem Bauplan", wave6d3bResults.equipArmorOk);
        check("Welle 6.D Etappe 3b: state.player.equipped.armor zeigt auf Rüstung", wave6d3bResults.equippedArmorIs);
        check(
            "Welle 6.D Etappe 3b: Diskrimination — Eisen-Rüstung erhöht hpMax (dichte + härte hoch)",
            wave6d3bResults.armorIncreasesHp
        );
        check(
            "Welle 6.D Etappe 3b: Diskrimination — Eisen-Rüstung erhöht damage",
            wave6d3bResults.armorIncreasesDamage
        );
        check("Welle 6.D Etappe 3b: Bauplan ohne role:'armor' wird abgelehnt", wave6d3bResults.unmarkedRejected);
        check("Welle 6.D Etappe 3b: unequip stellt baseline-Stats wieder her", wave6d3bResults.unequippedRestoresStats);
        check(
            "Welle 6.D Etappe 3b: state.player.equipped.armor == null nach unequip",
            wave6d3bResults.equippedArmorNull
        );
        check("Welle 6.D Etappe 3b: DSL-Op unequip(armor) entfernt Rüstung", wave6d3bResults.dslUnequipWorks);
        check(
            "V17.57 W2-B: equipHeld lehnt ein builtIn-Crafting-Tool ab (kein Welt-Gerät)",
            wave6d3bResults.equipBuiltinToolOk
        );
        check(
            "V17.57 W2-B: nach der Ablehnung ist nichts gehalten (equipped.held leer)",
            wave6d3bResults.equippedToolIs
        );
        check(
            "V17.57 W2-B: das abgelehnte builtIn-Tool ließ die Stats unberührt (ok)",
            wave6d3bResults.builtinToolNoStatChange
        );
        check(
            "Welle 6.D Etappe 3b: buildStateSnapshot persistiert playerEquipped (held)",
            wave6d3bResults.snapHasEquipped
        );
        check(
            "Welle 6.D 3b/SYNERGIE: der Aura-Tint ist mit der Avatar-Aura gefallen (kein Tick mehr)",
            wave6d3bResults.auraSubMeshTinted
        );
    } else if (wave6d3bResults && wave6d3bResults.error) {
        check("Welle 6.D Etappe 3b: Test-Block lief ohne Exception", false, wave6d3bResults.error);
    }

    // ### Welle 6.D Etappe 3a — Tod, Min-Regel-Hybrid, Konsumables ###
    const wave6d3aResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        // Welle 6.C2: Tests für Tod/Stamina/Phönix laufen im pfad-
        // Modus (Default frieden blockiert sonst Schaden + Stamina).
        if (typeof r.setGameMode === "function") r.setGameMode("pfad");

        // --- Tod-Behandlung (ALTLASTEN-NULL: feld-nativ) ---
        // U1 (V18.452) — Katalog-Existenz statt Namens-Wiederholung: der ANKER-
        // KATALOG (window.__anker) trägt die Symbolnamen; zieht das Symbol um,
        // wandert EINE Katalog-Zeile, nie N Proben.
        out.hasTriggerPhoenixMethod = typeof r[window.__anker.todRespawn] === "function";
        out.hasTickPhoenixMethod = typeof r[window.__anker.vitalsTick] === "function";
        out.hasPhoenixState = "respawnGraceUntil" in r.state.player && !("phoenixUntil" in r.state.player);
        out.damageOpInNonBroadcast = C.NON_BROADCASTABLE_OPS.has("damage");

        // Setup
        const savedSoul = r.state.player.soul;
        if (savedSoul !== "human") r.applyPlayerSoul("human");
        r.state.player.respawnGraceUntil = -Infinity;

        const hpMax = r.state.player.hpMax;
        const hpBefore = r.state.player.hp;
        r.damagePlayer(20, "test");
        out.hpDropped = r.state.player.hp === hpBefore - 20;
        // Heat-Quelle: heatResist (Mensch hat ~0.22) dämpft
        const hpAfterHeat = r.state.player.hp;
        r.damagePlayer(20, "fire-test");
        const hpDelta = hpAfterHeat - r.state.player.hp;
        out.heatResistReducesDamage = hpDelta < 20 - 1;

        // Tod-Trigger: derselbe Körper kehrt am Anker zurück (kein Gestalt-Tausch)
        const soulBefore = r.state.player.soul;
        r.damagePlayer(99999, "kill-test");
        out.killTriggersPhoenix = r.state.player.soul === soulBefore;
        out.phoenixUntilSet = r.state.player.respawnGraceUntil > performance.now() / 1000;
        // Rückkehr am Genesis-Anker (Start-Plattform-Nähe, x/z)
        const anchor = (r.state.architectures || []).find((a) => a && a.type === "start_plattform");
        const pm = r.state.playerMesh;
        out.preDeathSoulRemembered =
            !anchor ||
            (!!pm &&
                Math.abs(pm.position.x - anchor.position.x) < 2 &&
                Math.abs(pm.position.z - anchor.position.z) < 2);
        out.weltTrauerSorrow = r.state.player.emotions.sorrow > 0.25;
        out.weltTrauerAwe = r.state.player.emotions.awe > 0.15;
        out.hpRestoredAfterDeath = r.state.player.hp > 0;
        // Journal-Eintrag
        const journalEntries = r.state.worldJournal && r.state.worldJournal.entries;
        out.journalHasLossEntry =
            Array.isArray(journalEntries) && journalEntries.some((e) => e.type === "loss" && /fiel/.test(e.text || ""));

        // Doppelt-Tod-Schutz (Respawn-Gnade)
        const hpInPhoenix = r.state.player.hp;
        const beforeJournalCount = journalEntries.length;
        r.damagePlayer(99999, "kill-test-2");
        const afterJournalCount = journalEntries.length;
        out.deathDoubleProtected = afterJournalCount === beforeJournalCount;
        // (HP sollte nicht sinken, weil respawnGraceUntil > now den Schaden blockt)
        out.hpUntouchedDuringPhoenix = Math.abs(r.state.player.hp - hpInPhoenix) < 1;

        // tickPlayerVitals regeneriert Stamina (der HP-Timer fiel mit dem Phönix)
        r.state.player.stamina = 10;
        r.state.player.deathLastTick = -Infinity;
        r.tickPlayerVitals(performance.now() / 1000);
        out.tickRegenerates = r.state.player.stamina > 10;

        // Reset
        r.state.player.respawnGraceUntil = -Infinity;
        r.state.player.emotions.sorrow = 0;
        r.state.player.emotions.awe = 0;
        r.state.player.hp = r.state.player.hpMax;

        // --- Min-Regel-Hybrid ---
        // Beispiel aus wave-6-design §10.5
        const examplePart = {
            shape: "box",
            material: "stein",
            opChain: [
                { tool: "hand", op: "knap", cap: 0.4 },
                { tool: "hammer", op: "hammer", cap: 0.7 },
                { tool: "feile", op: "file", cap: 0.85 },
                { tool: "polierscheibe", op: "polish", cap: 0.97 },
            ],
        };
        const exPrec = r.computePartPrecision(examplePart);
        // Erwartung: 0.4 + (0.97-0.4) × 0.7^3 = 0.4 + 0.57 × 0.343 = ~0.595
        out.hybridExampleValue = exPrec;
        out.hybridMatchesDoc = Math.abs(exPrec - 0.595) < 0.01;
        // Edge: 1 Schritt → min (kein Hybrid-Effekt)
        const onePart = { shape: "box", material: "stein", opChain: [{ cap: 0.4 }] };
        out.oneStepReturnsMin = Math.abs(r.computePartPrecision(onePart) - 0.4) < 0.001;
        // Edge: leere Chain → 0.4
        const noChainPart = { shape: "box", material: "stein", opChain: [] };
        out.emptyChainReturnsDefault = Math.abs(r.computePartPrecision(noChainPart) - 0.4) < 0.001;
        // Diskrimination: Hybrid liefert STRIKT MEHR als reine min für ≥2 Schritte
        const twoPart = {
            shape: "box",
            material: "stein",
            opChain: [{ cap: 0.4 }, { cap: 0.9 }],
        };
        const twoPrec = r.computePartPrecision(twoPart);
        out.twoStepAboveMin = twoPrec > 0.4 && twoPrec < 0.9;

        // --- Konsumables ---
        out.hasConsumablesContainer = r.state.consumables && typeof r.state.consumables === "object";
        // define_consumable via DSL
        r.dslRun(
            ["define_consumable", "trank_des_lichts", { magieleitung: 0.3, resoniert: 0.2 }, 60, "Trank des Lichts"],
            { source: "test" }
        );
        const cn = r.state.consumables.trank_des_lichts;
        out.consumableDefined = !!cn;
        out.consumableTagBonus = cn && cn.tagBonus && Math.abs(cn.tagBonus.magieleitung - 0.3) < 0.001;
        out.consumableDuration = cn && cn.durationSeconds === 60;
        out.consumableLabel = cn && cn.label === "Trank des Lichts";

        // apply_boost via DSL → Boost im Array
        r.state.player.boosts = [];
        r.dslRun(["apply_boost", "trank_des_lichts"], { source: "test" });
        const b = r.state.player.boosts.find((x) => x.source === "consume:trank_des_lichts");
        out.applyBoostAddsBoost = !!b;
        out.boostTagBonus = b && Math.abs((b.tagDelta.magieleitung || 0) - 0.3) < 0.001;

        // Dedupe: zweimal apply_boost verlängert statt zu duplizieren
        r.dslRun(["apply_boost", "trank_des_lichts"], { source: "test" });
        const matching = r.state.player.boosts.filter((x) => x.source === "consume:trank_des_lichts");
        out.consumableDedupes = matching.length === 1;

        // Unknown name → kein Boost
        const beforeBoostCount = r.state.player.boosts.length;
        r.dslRun(["apply_boost", "nicht_da"], { source: "test" });
        out.unknownRejected = r.state.player.boosts.length === beforeBoostCount;

        // Non-broadcast: apply_boost ist in NON_BROADCASTABLE_OPS
        out.applyBoostNonBroadcast = C.NON_BROADCASTABLE_OPS.has("apply_boost");

        // Save-Round-Trip
        const snap = r.buildStateSnapshot();
        out.snapHasConsumables = !!(snap.consumables && snap.consumables.trank_des_lichts);

        // Cleanup
        r.state.consumables = {};
        r.state.player.boosts = [];
        r.applyPlayerSoul(savedSoul);
        r.state.player.respawnGraceUntil = -Infinity;

        return out;
    });

    if (wave6d3aResults && !wave6d3aResults.error) {
        // Tod-Behandlung
        check(
            "Welle 6.D Etappe 3a (NULL): _playerDeathRespawn existiert (Phönix-Maschine gefallen)",
            wave6d3aResults.hasTriggerPhoenixMethod
        );
        check("Welle 6.D Etappe 3a (NULL): tickPlayerVitals existiert", wave6d3aResults.hasTickPhoenixMethod);
        check(
            "Welle 6.D Etappe 3a (NULL): respawnGraceUntil trägt, phoenixUntil ist gefallen",
            wave6d3aResults.hasPhoenixState
        );
        check(
            "Welle 6.D Etappe 3a: damage-Op in NON_BROADCASTABLE_OPS (privat)",
            wave6d3aResults.damageOpInNonBroadcast
        );
        check("Welle 6.D Etappe 3a: damagePlayer reduziert HP", wave6d3aResults.hpDropped);
        check("Welle 6.D Etappe 3a: heatResist dämpft Feuer-Schaden", wave6d3aResults.heatResistReducesDamage);
        check(
            "Welle 6.D Etappe 3a (NULL): HP=0 → DERSELBE Körper (kein Gestalt-Tausch)",
            wave6d3aResults.killTriggersPhoenix
        );
        check("Welle 6.D Etappe 3a (NULL): respawnGraceUntil > now nach Tod", wave6d3aResults.phoenixUntilSet);
        check("Welle 6.D Etappe 3a (NULL): Rückkehr am Genesis-Anker (x/z)", wave6d3aResults.preDeathSoulRemembered);
        check("Welle 6.D Etappe 3a: Welt-Trauer — sorrow +0.3 nach Tod", wave6d3aResults.weltTrauerSorrow);
        check("Welle 6.D Etappe 3a: Welt-Trauer — awe +0.2 nach Tod", wave6d3aResults.weltTrauerAwe);
        check("Welle 6.D Etappe 3a (NULL): HP kehrt beim Respawn voll zurück", wave6d3aResults.hpRestoredAfterDeath);
        check("Welle 6.D Etappe 3a: Journal hat 'loss'-Eintrag mit 'fiel'", wave6d3aResults.journalHasLossEntry);
        check(
            "Welle 6.D Etappe 3a (NULL): Doppelt-Tod-Schutz — die Respawn-Gnade blockt",
            wave6d3aResults.deathDoubleProtected
        );
        check(
            "Welle 6.D Etappe 3a (NULL): HP unangetastet während der Gnade",
            wave6d3aResults.hpUntouchedDuringPhoenix
        );
        check("Welle 6.D Etappe 3a (NULL): tickPlayerVitals regeneriert Stamina", wave6d3aResults.tickRegenerates);
        // Min-Regel-Hybrid
        check(
            "Welle 6.D Etappe 3a: Hybrid-Beispiel aus Doc — 4 Stufen → ~0.595",
            wave6d3aResults.hybridMatchesDoc,
            `actual=${(wave6d3aResults.hybridExampleValue || 0).toFixed(3)}`
        );
        check("Welle 6.D Etappe 3a: 1 Schritt → reine min (kein Hybrid-Effekt)", wave6d3aResults.oneStepReturnsMin);
        check("Welle 6.D Etappe 3a: leere opChain → Default 0.4", wave6d3aResults.emptyChainReturnsDefault);
        check(
            "Welle 6.D Etappe 3a: Diskrimination — 2 Stufen liefern Wert zwischen min und max",
            wave6d3aResults.twoStepAboveMin
        );
        // Konsumables
        check("Welle 6.D Etappe 3a: state.consumables-Container existiert", wave6d3aResults.hasConsumablesContainer);
        check("Welle 6.D Etappe 3a: define_consumable DSL-Op legt Konsumabel an", wave6d3aResults.consumableDefined);
        check("Welle 6.D Etappe 3a: Konsumabel speichert tagBonus", wave6d3aResults.consumableTagBonus);
        check("Welle 6.D Etappe 3a: Konsumabel speichert durationSeconds", wave6d3aResults.consumableDuration);
        check("Welle 6.D Etappe 3a: Konsumabel speichert label", wave6d3aResults.consumableLabel);
        check("Welle 6.D Etappe 3a: apply_boost DSL-Op fügt Boost hinzu", wave6d3aResults.applyBoostAddsBoost);
        check("Welle 6.D Etappe 3a: aktiver Boost trägt Konsumabel-tagBonus", wave6d3aResults.boostTagBonus);
        check(
            "Welle 6.D Etappe 3a: zweimal apply_boost — Dedupe via consume:<name>",
            wave6d3aResults.consumableDedupes
        );
        check("Welle 6.D Etappe 3a: unbekannter Konsumabel-Name wird abgelehnt", wave6d3aResults.unknownRejected);
        check(
            "Welle 6.D Etappe 3a: apply_boost in NON_BROADCASTABLE_OPS (privat)",
            wave6d3aResults.applyBoostNonBroadcast
        );
        check("Welle 6.D Etappe 3a: buildStateSnapshot persistiert consumables", wave6d3aResults.snapHasConsumables);
    } else if (wave6d3aResults && wave6d3aResults.error) {
        check("Welle 6.D Etappe 3a: Test-Block lief ohne Exception", false, wave6d3aResults.error);
    }

    // ### Boosts (temporäre Tag-Deltas) ###
    // state.player.boosts ist ein Array; tickPlayerBoosts filtert Abgelaufene + triggert Emotion +
    // Resonance 1×/s; computePlayerStats addiert aktive Deltas vor der Stat-Berechnung.
    const wave6d2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        out.hasBoostsField = Array.isArray(r.state.player.boosts);
        out.hasEmotionMap = C.BOOST_EMOTION_TAG && typeof C.BOOST_EMOTION_TAG === "object";
        out.emotionAxisCount = C.BOOST_EMOTION_TAG ? Object.keys(C.BOOST_EMOTION_TAG).length : 0;
        out.hasResonanceConst = typeof C.BOOST_RESONANCE_DELTA === "number";

        // Setup: Save initial state für Vergleich
        r.state.player.boosts = [];
        r.recomputePlayerStats();
        const baselineStats = JSON.parse(JSON.stringify(r.state.player.stats));

        // Test 1: addPlayerBoost fügt einen Boost hinzu + Stats ändern sich
        const added = r.addPlayerBoost({
            source: "test:flame",
            tagDelta: { wärmeleitung: 0.3 },
            durationSeconds: 60,
            label: "Test-Flamme",
        });
        out.addReturnsTrue = added === true;
        out.boostsArrayHasOne = r.state.player.boosts.length === 1;
        out.boostHasTagDelta =
            r.state.player.boosts[0] && Math.abs(r.state.player.boosts[0].tagDelta.wärmeleitung - 0.3) < 0.001;

        // Stats reagieren auf das Boost — staminaMax steigt da
        // wärmeleitung in der Formel steht (× 40).
        const boostedStats = r.state.player.stats;
        out.staminaIncreased = boostedStats.staminaMax > baselineStats.staminaMax + 5;
        out.heatResistIncreased = boostedStats.heatResist > baselineStats.heatResist;

        // Duplikat-Source: zweiter Boost mit gleicher source verlängert nur
        r.addPlayerBoost({
            source: "test:flame",
            tagDelta: { wärmeleitung: 0.5 },
            durationSeconds: 120,
            label: "Test-Flamme stärker",
        });
        out.dedupesBySource = r.state.player.boosts.length === 1;
        out.dedupeReplacesDelta = Math.abs(r.state.player.boosts[0].tagDelta.wärmeleitung - 0.5) < 0.001;

        // tickPlayerBoosts entfernt abgelaufene Boosts: gezielt den test:flame-Boost prüfen, nicht
        // boosts.length===0 — tickPlayerBoosts darf zugleich einen world:resonance-Boost setzen (Spieler
        // nah an hochresonanter Architektur wie kristall_geode/quarz).
        r.state.player.boosts[0].expiresAt = -100; // bereits abgelaufen
        r.state.player.boostLastTick = -Infinity; // Throttle umgehen
        r.tickPlayerBoosts(performance.now() / 1000);
        out.expiredRemoved = !r.state.player.boosts.some((b) => b.source === "test:flame");

        // Emotion-Trigger: awe hoch → magieleitung-Boost
        r.state.player.emotions.awe = 0.9;
        r.state.player.boostLastTriggered["emotion:awe"] = -Infinity; // Refract umgehen
        r.state.player.boostLastTick = -Infinity;
        r.tickPlayerBoosts(performance.now() / 1000);
        const aweBoost = r.state.player.boosts.find((b) => b.source === "emotion:awe");
        out.emotionAweTriggered = !!aweBoost;
        out.aweBoostHasMagieleitung = aweBoost && aweBoost.tagDelta.magieleitung && aweBoost.tagDelta.magieleitung > 0;
        out.magicResistIncreased = aweBoost ? r.state.player.stats.magicResist > baselineStats.magicResist : false;

        // Welt-Resonanz-Trigger: spawne Bauplan mit hoher Resonanz nahe Spieler
        const vorArch = new Set(r.state.architectures);
        const savedPos = {
            x: r.state.playerMesh.position.x,
            y: r.state.playerMesh.position.y,
            z: r.state.playerMesh.position.z,
        };
        // BÜHNE: Boost-Reichweite relativ zum Spieler (die Bauten folgen ihm)
        r.state.playerMesh.position.set(80, 5, 80);
        // Custom-Bauplan mit Quarz-Helix-Array: vier helix-Parts EQUIDISTANT vom Schwerpunkt (0,0,0) — der
        // Resonance-Array-Detector verlangt gleiche Shape auf gleichem Radius ±12 %. Quarz (resoniert 0.9,
        // magieleitung 0.85) + helix + Array-Bonus heben das Compound über die signature-Schwelle (2.5).
        r.state.blueprints.wave6d2_resonator = {
            name: "wave6d2_resonator",
            label: "Resonator",
            builtIn: false,
            parts: [
                {
                    shape: "helix",
                    material: "quarz",
                    position: { x: 1, y: 0, z: 0 },
                    size: { x: 0.5, y: 1, z: 3 },
                },
                {
                    shape: "helix",
                    material: "quarz",
                    position: { x: 0, y: 0, z: 1 },
                    size: { x: 0.5, y: 1, z: 3 },
                },
                {
                    shape: "helix",
                    material: "quarz",
                    position: { x: -1, y: 0, z: 0 },
                    size: { x: 0.5, y: 1, z: 3 },
                },
                {
                    shape: "helix",
                    material: "quarz",
                    position: { x: 0, y: 0, z: -1 },
                    size: { x: 0.5, y: 1, z: 3 },
                },
            ],
        };
        r.spawnArchitecture("wave6d2_resonator", { x: 82, y: 0, z: 82 }, { seed: 1 });
        // Debug: tatsächlichen Spatial-Tag-Wert + Distanz ausgeben
        const sigTags = r.computeSpatialTags(r.state.blueprints.wave6d2_resonator);
        out.signatureResonierValue = sigTags.resoniert || 0;
        out.signatureThreshold = C.WORLD_EFFECT_THRESHOLDS.resonance_signature;
        out.distanceToSig = Math.hypot(82 - 80, 82 - 80);
        r.state.player.boosts = []; // Reset
        r.state.player.boostLastTick = -Infinity;
        r.tickPlayerBoosts(performance.now() / 1000);
        const resBoost = r.state.player.boosts.find((b) => b.source === "world:resonance");
        out.resonanceBoostTriggered = !!resBoost;
        out.resonanceHasResonierDelta = resBoost && resBoost.tagDelta.resoniert && resBoost.tagDelta.resoniert > 0;

        // Boost außerhalb Reichweite → kein Trigger
        // BÜHNE: außerhalb der Boost-Reichweite (nur der Abstand zählt)
        r.state.playerMesh.position.set(-200, 5, -200);
        r.state.player.boosts = [];
        r.state.player.boostLastTick = -Infinity;
        r.tickPlayerBoosts(performance.now() / 1000);
        const resBoost2 = r.state.player.boosts.find((b) => b.source === "world:resonance");
        out.resonanceNotTriggeredFar = !resBoost2;

        // Cleanup
        for (const e of r.state.architectures.filter((x) => !vorArch.has(x))) r.removeArchitecture(e);
        delete r.state.blueprints.wave6d2_resonator;
        r.state.playerMesh.position.set(savedPos.x, savedPos.y, savedPos.z);
        r.state.player.boosts = [];
        r.state.player.emotions.awe = 0;
        r.recomputePlayerStats();

        return out;
    });

    if (wave6d2Results && !wave6d2Results.error) {
        check("Welle 6.D Etappe 2: state.player.boosts ist Array", wave6d2Results.hasBoostsField);
        check(
            "Welle 6.D Etappe 2: BOOST_EMOTION_TAG-Map mit 6 Emotionen",
            wave6d2Results.hasEmotionMap && wave6d2Results.emotionAxisCount === 6
        );
        check("Welle 6.D Etappe 2: BOOST_RESONANCE_DELTA-Konstante existiert", wave6d2Results.hasResonanceConst);
        check("Welle 6.D Etappe 2: addPlayerBoost liefert true", wave6d2Results.addReturnsTrue);
        check("Welle 6.D Etappe 2: boost wird ins Array geschrieben", wave6d2Results.boostsArrayHasOne);
        check("Welle 6.D Etappe 2: boost trägt tagDelta + Wert", wave6d2Results.boostHasTagDelta);
        check(
            "Welle 6.D Etappe 2: Diskrimination — wärmeleitung-Boost erhöht staminaMax",
            wave6d2Results.staminaIncreased
        );
        check(
            "Welle 6.D Etappe 2: Diskrimination — wärmeleitung-Boost erhöht heatResist",
            wave6d2Results.heatResistIncreased
        );
        check("Welle 6.D Etappe 2: gleiche source dedupliziert (nur 1 Eintrag)", wave6d2Results.dedupesBySource);
        check("Welle 6.D Etappe 2: dedupe ersetzt tagDelta des bestehenden Boosts", wave6d2Results.dedupeReplacesDelta);
        check("Welle 6.D Etappe 2: tickPlayerBoosts entfernt abgelaufene Boosts", wave6d2Results.expiredRemoved);
        check(
            "Welle 6.D Etappe 2: Emotion-Trigger — awe>0.7 erzeugt magieleitung-Boost",
            wave6d2Results.emotionAweTriggered
        );
        check("Welle 6.D Etappe 2: Emotion-Boost trägt magieleitung-Delta > 0", wave6d2Results.aweBoostHasMagieleitung);
        check(
            "Welle 6.D Etappe 2: Diskrimination — magieleitung-Boost erhöht magicResist",
            wave6d2Results.magicResistIncreased
        );
        check(
            "Welle 6.D Etappe 2: Welt-Resonanz-Trigger — Nähe zu Signature-Struktur erzeugt resoniert-Boost",
            wave6d2Results.resonanceBoostTriggered,
            `sig.resoniert=${(wave6d2Results.signatureResonierValue || 0).toFixed(2)} thr=${wave6d2Results.signatureThreshold} dist=${(wave6d2Results.distanceToSig || 0).toFixed(2)}`
        );
        check(
            "Welle 6.D Etappe 2: Welt-Resonanz-Boost trägt resoniert-Delta > 0",
            wave6d2Results.resonanceHasResonierDelta
        );
        check(
            "Welle 6.D Etappe 2: Negativ-Kontrolle — außerhalb Reichweite KEIN Resonanz-Boost",
            wave6d2Results.resonanceNotTriggeredFar
        );
    } else if (wave6d2Results && wave6d2Results.error) {
        check("Welle 6.D Etappe 2: Test-Block lief ohne Exception", false, wave6d2Results.error);
    }

    // ### Custom-Seelen via DSL ###
    // define_soul(name, bodyParts) komponiert eigene Charaktere — Form × Material über dieselbe
    // Hylomorphismus-Pipe wie Bauwerke.
    const wave6d16Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        out.customSoulsContainerExists = r.state.customSouls && typeof r.state.customSouls === "object";

        // DSL-Op define_soul ist im Interpreter
        const ops = r._dslOps || (r.dslOps && r.dslOps()) || null;
        out.dslOpRegistered = ops ? typeof ops.define_soul === "function" : false;
        // Fallback: prüfen via dslRun
        const beforeCount = Object.keys(r.state.customSouls || {}).length;
        const testParts = [
            {
                shape: "box",
                material: "knochen",
                position: { x: 0, y: 0, z: 0 },
                size: { x: 0.5, y: 1.0, z: 0.4 },
            },
            {
                shape: "helix",
                material: "quarz",
                position: { x: 0, y: 0.6, z: 0 },
                size: { x: 0.3, y: 0.6, z: 2 },
            },
            {
                shape: "sphere",
                material: "glut",
                position: { x: 0, y: 0.3, z: 0 },
                size: { x: 0.25, y: 0.25, z: 0.25 },
            },
        ];
        r.dslRun(["define_soul", "kristall_geist", testParts], { source: "test" });
        const afterCount = Object.keys(r.state.customSouls || {}).length;
        out.customSoulAdded = afterCount === beforeCount + 1;
        const created = r.state.customSouls.kristall_geist;
        out.customHasBodyParts = !!(created && Array.isArray(created.bodyParts) && created.bodyParts.length === 3);
        out.customHasLabel = !!(created && typeof created.label === "string");

        // _getSoulDef findet die Custom-Seele
        const def = r._getSoulDef("kristall_geist");
        out.getSoulDefFindsCustom = !!def && def.name === "kristall_geist";

        // Built-in-Override verboten
        r.dslRun(["define_soul", "human", testParts], { source: "test" });
        out.builtinProtected = !!r.playerSoulDefs.human && Array.isArray(r.playerSoulDefs.human.bodyParts);

        // Compound-Tags der Custom-Seele unterscheiden sich von Built-ins
        const customTags = r.computeSoulCompoundTags(created);
        const humanTags = r.computeSoulCompoundTags(r.playerSoulDefs.human);
        out.customTagsExist = customTags && Object.keys(customTags).length > 0;
        // kristall_geist hat quarz+glut → hohe magieleitung
        out.customMagicHigh = (customTags.magieleitung || 0) > (humanTags.magieleitung || 0);

        // applyPlayerSoul auf Custom funktioniert
        const savedSoul = r.state.player.soul;
        const applied = r.applyPlayerSoul("kristall_geist");
        out.applyCustomReturnsTrue = applied === true;
        out.stateSoulIsCustom = r.state.player.soul === "kristall_geist";
        // Stats wurden für die Custom-Seele neu berechnet
        out.customStatsComputed = !!(r.state.player.stats && r.state.player.stats.hpMax > 0);
        out.customStatsDifferFromHuman = (() => {
            r.state.player.soul = "human";
            const humanStats = r.computePlayerStats().stats;
            r.state.player.soul = "kristall_geist";
            const customStats = r.computePlayerStats().stats;
            return Math.abs(customStats.magicResist - humanStats.magicResist) > 0.05;
        })();

        // UI-Dropdown enthält die neue Seele
        if (typeof r._refreshSoulSelect === "function") r._refreshSoulSelect();
        const select = document.getElementById("player-soul-select");
        out.dropdownContainsCustom = select && [...select.options].some((o) => o.value === "kristall_geist");

        // Cap-Test: 16 Custom-Seelen max
        let overflowResult = "ok";
        for (let i = 0; i < 20; i++) {
            const res = r.createOrUpdateSoulFromDsl(`spam_${i}`, testParts);
            if (!res.ok && res.reason === "too_many_souls") {
                overflowResult = "cap_hit";
                break;
            }
        }
        out.capHit = overflowResult === "cap_hit";

        // Save-Round-Trip vor dem finalen Cleanup
        r.state.customSouls = {
            save_test: {
                name: "save_test",
                label: "Save Test",
                bodyParts: testParts,
                createdAt: 0,
            },
        };
        const snap = r.buildStateSnapshot();
        out.snapshotHasCustomSouls = !!(snap.customSouls && snap.customSouls.save_test);

        // Cleanup — Custom-Seelen entfernen + Dropdown auffrischen,
        // damit nachfolgende Tests (Ring 5: Dropdown hat 3 Optionen)
        // wieder den Built-in-Standardzustand sehen.
        r.state.customSouls = {};
        r.state.player.soul = savedSoul;
        r.applyPlayerSoul(savedSoul);
        if (typeof r._refreshSoulSelect === "function") r._refreshSoulSelect();

        return out;
    });

    // ### Welle 6.D Etappe 1.7 — Visueller Avatar-Editor ###
    const wave6d17Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // V18.62 Ich-H — der Ich-Soul-Editor ist geschnitten; die Seelen-Schöpfung lebt in der Werkstatt
        // (die Seele IST ein Bauplan, soulToBlueprint + „Körper holen"). Die customSoul-CRUD bleibt als
        // Datenschicht (define_soul + die Brücke lesen sie).
        // Der parallele Ich-Soul-Editor existiert NICHT mehr (in die Werkstatt gewandert)
        out.ichSoulEditorGone = !document.getElementById("soul-editor");

        // Die BRÜCKE: eine Built-in-Seele als role:soul-Bauplan in die Werkstatt holen (Avatare-in-Werkstatt)
        r.state.customSouls = {};
        const s2b = r.soulToBlueprint("human");
        out.s2bOk = !!(s2b && s2b.ok);
        const s2bBp = s2b && s2b.ok ? r.state.blueprints[s2b.name] : null;
        // Der Mensch trägt POSITIONIERTE bodyParts: ALLE def-Teile reisen positioniert (nicht am Ursprung
        // gestapelt) — dynamisch gegen die def-Länge geprüft.
        const humanDefParts = r.playerSoulDefs.human.bodyParts.length;
        out.s2bIsSoulRole = !!(
            s2bBp &&
            s2bBp.role === "soul" &&
            Array.isArray(s2bBp.parts) &&
            s2bBp.parts.length === humanDefParts &&
            new Set(s2bBp.parts.map((p) => `${p.position.x},${p.position.y},${p.position.z}`)).size >= 5
        );
        if (s2b && s2b.ok) r.deleteBlueprint(s2b.name);

        // Klonen aus aktiver Seele (die customSoul-Datenschicht bleibt)
        const savedSoul = r.state.player.soul;
        r.state.player.soul = "human";
        const cloneResult = r.cloneSoulToCustom("human", "test_clone_a");
        out.cloneReturnsOk = cloneResult && cloneResult.ok;
        // V18.101 (Test wandert, V9.56-i): dynamisch gegen die def-Länge —
        // der Mensch trägt jetzt 6 positionierte Teile statt 4 Stat-Schatten.
        out.cloneHasBodyParts =
            r.state.customSouls.test_clone_a &&
            Array.isArray(r.state.customSouls.test_clone_a.bodyParts) &&
            r.state.customSouls.test_clone_a.bodyParts.length === r.playerSoulDefs.human.bodyParts.length;

        // Add part
        const beforeParts = r.state.customSouls.test_clone_a.bodyParts.length;
        const addResult = r.addPartToCustomSoul("test_clone_a", {
            shape: "torus",
            material: "quarz",
            position: { x: 0, y: 1, z: 0 },
            size: { x: 0.5, y: 0.2, z: 0.5 },
        });
        out.addReturnsOk = addResult && addResult.ok;
        out.addedPart = r.state.customSouls.test_clone_a.bodyParts.length === beforeParts + 1;

        // Update part
        const updateResult = r.updatePartInCustomSoul("test_clone_a", 0, {
            material: "schuppen",
        });
        out.updateReturnsOk = updateResult && updateResult.ok;
        out.updateApplied = r.state.customSouls.test_clone_a.bodyParts[0].material === "schuppen";

        // Remove part
        const beforeRm = r.state.customSouls.test_clone_a.bodyParts.length;
        const rmResult = r.removePartFromCustomSoul("test_clone_a", 0);
        out.removeReturnsOk = rmResult && rmResult.ok;
        out.removedPart = r.state.customSouls.test_clone_a.bodyParts.length === beforeRm - 1;

        // Mindestens-1-Schutz: alle bis auf eins entfernen → letztes lehnt ab
        while (r.state.customSouls.test_clone_a.bodyParts.length > 1) {
            r.removePartFromCustomSoul("test_clone_a", 0);
        }
        const lastRmResult = r.removePartFromCustomSoul("test_clone_a", 0);
        out.lastPartProtected = !lastRmResult.ok && lastRmResult.reason === "would_be_empty";

        // applyPlayerSoul auf Custom-Seele rendert tatsächlich ein Mesh
        r.applyPlayerSoul("test_clone_a");
        out.customSoulRendered =
            !!r.state.playerMesh && r.state.playerMesh.children && r.state.playerMesh.children.length > 0;

        // Delete: wenn aktive Seele gelöscht → fallback auf "human"
        const delResult = r.deleteCustomSoul("test_clone_a");
        out.deleteReturnsOk = delResult && delResult.ok;
        out.deletedFromMap = !r.state.customSouls.test_clone_a;
        out.fallbackToHuman = r.state.player.soul === "human";

        // Cleanup
        r.state.player.soul = savedSoul;
        r.applyPlayerSoul(savedSoul);

        return out;
    });

    if (wave6d17Results && !wave6d17Results.error) {
        check(
            "V18.62 Ich-H: der parallele Ich-Soul-Editor ist geschnitten (Schöpfung in der Werkstatt)",
            wave6d17Results.ichSoulEditorGone
        );
        check("V18.62 Ich-H: soulToBlueprint holt einen Built-in-Körper in die Werkstatt (ok)", wave6d17Results.s2bOk);
        check(
            "V18.62 Ich-H: der geholte Körper ist ein role:soul-Bauplan mit allen 4 Teilen (Avatare-in-Werkstatt)",
            wave6d17Results.s2bIsSoulRole
        );
        check("Welle 6.D Etappe 1.7: Klonen aus aktiver Seele liefert ok", wave6d17Results.cloneReturnsOk);
        check("Welle 6.D Etappe 1.7: Klon hat alle 4 Body-Parts vom Mensch", wave6d17Results.cloneHasBodyParts);
        check(
            "Welle 6.D Etappe 1.7: addPartToCustomSoul fügt Part hinzu",
            wave6d17Results.addReturnsOk && wave6d17Results.addedPart
        );
        check(
            "Welle 6.D Etappe 1.7: updatePartInCustomSoul wendet Patch an",
            wave6d17Results.updateReturnsOk && wave6d17Results.updateApplied
        );
        check(
            "Welle 6.D Etappe 1.7: removePartFromCustomSoul entfernt Part",
            wave6d17Results.removeReturnsOk && wave6d17Results.removedPart
        );
        check(
            "Welle 6.D Etappe 1.7: Mindestens-1-Schutz — letztes Part kann nicht gelöscht werden",
            wave6d17Results.lastPartProtected
        );
        check(
            "Welle 6.D Etappe 1.7: End-to-End — applyPlayerSoul auf Custom rendert Mesh",
            wave6d17Results.customSoulRendered
        );
        check(
            "Welle 6.D Etappe 1.7: deleteCustomSoul entfernt aus Map",
            wave6d17Results.deleteReturnsOk && wave6d17Results.deletedFromMap
        );
        check(
            "Welle 6.D Etappe 1.7: Löschen der aktiven Seele schaltet zurück auf 'human'",
            wave6d17Results.fallbackToHuman
        );
    } else if (wave6d17Results && wave6d17Results.error) {
        check("Welle 6.D Etappe 1.7: Test-Block lief ohne Exception", false, wave6d17Results.error);
    }

    if (wave6d16Results) {
        check(
            "Welle 6.D Etappe 1.6: state.customSouls-Container existiert",
            wave6d16Results.customSoulsContainerExists
        );
        check("Welle 6.D Etappe 1.6: define_soul DSL-Op fügt Custom-Seele hinzu", wave6d16Results.customSoulAdded);
        check("Welle 6.D Etappe 1.6: Custom-Seele hat bodyParts mit 3 Teilen", wave6d16Results.customHasBodyParts);
        check("Welle 6.D Etappe 1.6: Custom-Seele bekommt einen label", wave6d16Results.customHasLabel);
        check(
            "Welle 6.D Etappe 1.6: _getSoulDef findet Custom-Seele neben Built-ins",
            wave6d16Results.getSoulDefFindsCustom
        );
        check(
            "Welle 6.D Etappe 1.6: Built-in-Name geschützt (human nicht überschreibbar)",
            wave6d16Results.builtinProtected
        );
        check("Welle 6.D Etappe 1.6: Compound-Tags der Custom-Seele werden berechnet", wave6d16Results.customTagsExist);
        check(
            "Welle 6.D Etappe 1.6: Vision-Diskrimination — quarz+glut-Seele hat höhere magieleitung als Mensch",
            wave6d16Results.customMagicHigh
        );
        check("Welle 6.D Etappe 1.6: applyPlayerSoul akzeptiert Custom-Namen", wave6d16Results.applyCustomReturnsTrue);
        check(
            "Welle 6.D Etappe 1.6: state.player.soul ist die Custom-Seele nach apply",
            wave6d16Results.stateSoulIsCustom
        );
        check("Welle 6.D Etappe 1.6: Stats werden für Custom-Seele neu berechnet", wave6d16Results.customStatsComputed);
        check(
            "Welle 6.D Etappe 1.6: Custom-Stats unterscheiden sich von Built-in-Stats (Vision-Diskrimination)",
            wave6d16Results.customStatsDifferFromHuman
        );
        check("Welle 6.D Etappe 1.6: UI-Dropdown listet Custom-Seelen", wave6d16Results.dropdownContainsCustom);
        check("Welle 6.D Etappe 1.6: Cap 16 — überzählige werden abgelehnt", wave6d16Results.capHit);
        check(
            "Welle 6.D Etappe 1.6: buildStateSnapshot persistiert customSouls",
            wave6d16Results.snapshotHasCustomSouls
        );
    }

    if (wave6dResults) {
        check("Welle 6.D: AnazhRealm.STAT_FROM_TAGS-Matrix existiert", wave6dResults.hasStatMatrix);
        check(
            // V17.51 Kampf Phase A — STAT_FROM_TAGS wuchs um 3 Kombat-Stats (knockback,
            // attackSpeed, defense). V18.196 Mana-Symmetrie fügt manaMax hinzu.
            // Die feste Satz-Assertion wandert mit (V9.56-i).
            "Welle 6.D: STAT_FROM_TAGS hat 12 Stats (8 Basis + Kampf-Trio + V18.196 manaMax)",
            wave6dResults.statKeys ===
                "attackSpeed,damage,defense,heatResist,hpMax,jumpPower,knockback,magicResist,manaMax,precision,speed,staminaMax"
        );
        check(
            "Welle 6.D Etappe 1.5: Mensch-Def + vier Tier-Körper tragen bodyParts",
            wave6dResults.allSoulsHaveBodyParts
        );
        check("Welle 6.D Etappe 1.5: jedes bodyPart hat shape + material", wave6dResults.bodyPartsHaveShapeMaterial);
        check(
            "Welle 6.D Etappe 1.5: computeSoulCompoundTags liefert ein Tag-Objekt",
            wave6dResults.humanCompoundTagsAreObject
        );
        check(
            "Welle 6.D Etappe 1.5: Vision-Treue — aggregierte Tags nutzen MATERIAL_TAG_KEYS",
            wave6dResults.compoundUsesMaterialKeys
        );
        check(
            "Welle 6.D Etappe 1.5: 5 Körper-Materialien (knochen/fleisch/federn/schuppen/glut) sind in state.materials",
            wave6dResults.bodyMaterialsExist
        );
        check(
            "Welle 6.D Etappe 1.5: alle Körper-Materialien tragen lebendig > 0.9",
            wave6dResults.bodyMaterialsAreLebendig
        );
        check(
            "Welle 6.D: computePlayerStats liefert {tags, stats}",
            wave6dResults.computedHasTags && wave6dResults.computedHasStats
        );
        check(
            "Welle 6.D: computed.stats hat alle 11 Werte als finite Zahlen (8 Basis + Kampf-Trio, V17.51)",
            wave6dResults.computedStatsHasAll
        );
        // Vision-Diskrimination (ALTLASTEN-NULL: Eigenschaften AUS dem Körper)
        check("Welle 6.D: Diskrimination — Fuchs schneller als Bär (Größen-Achse)", wave6dResults.fuchsFasterThanBaer);
        check("Welle 6.D: Diskrimination — Fuchs springt höher als Bär", wave6dResults.fuchsJumpsHigherThanBaer);
        check("Welle 6.D: Diskrimination — Bär mehr HP als Fuchs (tank)", wave6dResults.baerHasMoreHpThanFuchs);
        check("Welle 6.D: HP-Ordnung Bär > Wolf > Fuchs (Skelett-Größe)", wave6dResults.hpOrderBaerWolfFuchs);
        check("Welle 6.D: Tempo-Ordnung Fuchs > Wolf > Bär (invers zur Masse)", wave6dResults.speedOrderFuchsWolfBaer);
        check(
            "Welle 6.D: Wolf mehr Mana als Mensch (holz-magieleitung emergent, V18.196 lebend)",
            wave6dResults.wolfHasMoreManaThanHuman
        );
        check(
            "Welle 6.D: Diskrimination — der Mensch trägt ein EIGENES HP-Profil (distinkt von jedem Tier)",
            wave6dResults.humanHpBetweenFuchsAndBaer
        );
        // State-Anwendung
        check("Welle 6.D: recomputePlayerStats setzt state.speed", wave6dResults.stateSpeedMatches);
        check("Welle 6.D: recomputePlayerStats setzt state.jumpPower", wave6dResults.stateJumpPowerMatches);
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal (war „= 2× speed").
        check("Welle 6.D: state.sprintSpeed = Gesetz-sprintMul × state.speed", wave6dResults.stateSprintIsDoubleSpeed);
        check("Welle 6.D: state.player.stats wird gecached", wave6dResults.statePlayerStatsCached);
        check(
            "Welle 6.D + K27: hp, hpMax, stamina, staminaMax existieren; die Wandlung füllt, die Neuberechnung heilt nicht",
            wave6dResults.statePlayerHasHpAndStamina
        );
        check("Welle 6.D: das Selbst-Spec-Sheet (#ich-stage-spec) im DOM", wave6dResults.statsContainerInDom);
        check("Welle 6.D: das Spec-Sheet rendert ohne Crash (V18.61 Ich-F)", wave6dResults.renderOk);
        if (wave6dResults.renderOk) {
            check(
                "Welle 6.D: das Spec-Sheet trägt Werte-Balken (HP + Stats + Natur, V18.44/.57)",
                wave6dResults.statRowsCount >= 6
            );
            check("Welle 6.D: das Spec-Sheet trägt Spalten-Köpfe (Werte/Natur)", wave6dResults.hasTagLine);
        }
    }
}

// PHASEN B–F (gigant-plan §5, V18.104) — die Kern-KONSUM-Beweise des Phasen-Zugs.
async function checkBandPhasenBF(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};
        // C1 — Gelenke: ein synthetischer 2-Part-Bauplan mit Verbindung → Joint-Rolle mit Anker.
        const roles = r.computeMotionRoles(
            [
                { shape: "box", size: { x: 2, y: 2, z: 2 }, position: { x: 0, y: 1, z: 0 } },
                { shape: "cylinder", size: { x: 0.6, y: 1.4, z: 0.6 }, position: { x: 1.6, y: 0.7, z: 0 } },
            ],
            [{ type: "weld", partA: 0, partB: 1 }]
        );
        const joint = roles && roles.find((x) => x && x.joint);
        out.c1Joint = !!(joint && joint.anchor && typeof joint.anchor.x === "number" && joint.axis);
        // SYNERGIE-WELLE — die Avatar-Aura ist GEFALLEN: C6 wandert auf die Abwesenheit.
        out.c6Src = typeof r.tickPlayerAura !== "function" && typeof r._ensureAuraSkinShells !== "function";
        // D4 — DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10.): die Tiere sind tag-gleich (Lehre 8), das Gemüt kommt aus
        // Ernährung der Gattung und der EINEN Masse des Leibs (tetrapoda temperamentDerGattung, `_leibMasse` in kg) — Hirsch
        // scheu, Wolf wild, Bär wehrhaft, Fuchs scheu; die Größe verschiebt es (ein Koloss-Hirsch wehrt sich, ein kleiner Bär
        // ist sanft). Die Substanz-Signaturen fielen (vorher: Hirsch, Fuchs und Bär „wehrhaft"). Gefragt wird ein
        // gegossener Leib (die Masse ist das Volumen seiner Gestalt), fern des Spielers, danach entfernt.
        out.d4Temperament = (() => {
            const pp = r.state.playerMesh.position;
            const t = (soul, bodySize) => {
                const c = r.spawnCreatureAt(pp.x + 200, pp.y, pp.z + 200, "happy", soul, { precise: true, bodySize });
                if (!c) return null;
                try {
                    return r._creatureTemperament(c);
                } finally {
                    r.removeCreature(c);
                }
            };
            return (
                t("wesen", 1) === "scheu" &&
                t("wolf", 1) === "wild" &&
                t("baer", 1) === "wehrhaft" &&
                t("fuchs", 1) === "scheu" &&
                t("wesen", 2.5) === "wehrhaft" &&
                t("baer", 0.7) === "sanft"
            );
        })();
        // KONSUM: die Gegenwehr liest das Profil (strikeCap/fleeMul im Treffer-Pfad); sanft/scheu haben strike 0.
        out.d4Konsum =
            /_creatureTemperament/.test(window.__codeOf(r.damageCreature)) &&
            /fleeMul/.test(window.__codeOf(r.damageCreature)) &&
            AnazhRealm._verhaltenGesetz().temperament.profile.sanft.strike === 0 &&
            AnazhRealm._verhaltenGesetz().temperament.profile.scheu.strike === 0 &&
            AnazhRealm._verhaltenGesetz().temperament.profile.wehrhaft.strike > 0;
        // E2 — der Kosten-Walker zahlt die Substanz-Wahrheit.
        out.e2VillageCost = r._dslProgramWirkCost(["spawn_village", ["at", 0, 0, 0], 1]) === 20;
        // E2 — der REGELKREIS: ruhige Emotion → Faktor 1, stark gekippt (chaos dominant) → < 0.5. KONSUM:
        // Outcome-Regen, Idle-Tropf, Kosten-Tor + proaktive Stimmen lesen DENSELBEN _emotionBalanceFactor.
        out.e2Balance = (() => {
            const p = r.state.player;
            const save = { ...p.emotions };
            try {
                for (const k in p.emotions) p.emotions[k] = 0;
                const calm = r._emotionBalanceFactor();
                p.emotions.chaos = 0.9;
                const tipped = r._emotionBalanceFactor();
                return calm === 1 && tipped < 0.5;
            } finally {
                Object.assign(p.emotions, save);
            }
        })();
        out.f2Turn = Array.isArray(r.state.p2p && r.state.p2p.iceServers) && r.state.p2p.iceServers.length >= 1;
        // B8 — prüft nur das LEBENDE Struktur-Licht: die rimStrength-Uniform (PBR-Rim); die Struktur-LUT
        // (`_ensureStructureGradient`) ist mit dem Cel-System gefallen, kein Shader liest sie.
        out.b8Rim = !!(r.state.atmoUniforms && r.state.atmoUniforms.rimStrength);
        // V18.109 — E8 ZWEI-HAND: swapHands tauscht über den EINEN equipHeld-
        // Pfad (KONSUM: Roundtrip Hand→Off-Hand→Hand) + der Off-Hand-Slot
        // steht neben der Hotbar + der Tausch-Key ist gebunden.
        out.e8Swap = (() => {
            const eq = (r.state.player.equipped = r.state.player.equipped || {
                held: null,
                offhand: null,
                armor: null,
            });
            const save = { held: eq.held || null, offhand: eq.offhand || null };
            try {
                // AUSLÖSCHUNGS-WELLE — geraet_spitzhacke fiel; das foundry-Werkzeug klinge_spitzhacke
                // (wenn ingested) oder stein_block trägt die Swap-Probe (der Name ist mechanik-egal).
                const name = r.state.blueprints.klinge_spitzhacke ? "klinge_spitzhacke" : "stein_block";
                r.equipHeld(name); // equipHeld ist das freie Low-Level-Primitiv (GEBRAUCH)
                const s1 = r.swapHands();
                const okA = !!(s1.ok && s1.offhand === name && !s1.held);
                const s2 = r.swapHands();
                const okB = !!(s2.ok && s2.held === name && !s2.offhand);
                return okA && okB;
            } finally {
                eq.held = save.held;
                eq.offhand = save.offhand;
                r.recomputePlayerStats();
                if (typeof r._refreshHeldMesh === "function") r._refreshHeldMesh();
            }
        })();
        out.e8Dom = !!document.querySelector('#hotbar .hotbar-slot[data-slot="offhand"]');
        out.e8Key = (r.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS).swapHands === "KeyG";
        // C7 ATTACHMENT-PUNKTE: (1) sitz validiert ohne partB; (2) die getragene Rüstung sitzt am TORSO
        // (Masse-Zentrum 0.18, am echten _wornArmorMesh); (3) Fahrzeug-/Reittier-Saat ist per Substanz
        // moveable + trägt sitz-Punkte; (4) die Built-in-Körper liegen automatisch als Blueprints.
        out.c7Validate = (() => {
            const v = r.validateBlueprintConnections([{ type: "sitz", partA: 0 }], 3);
            return v.length === 1 && v[0].partB === -1;
        })();
        out.c7ArmorSitz = (() => {
            const p = r.state.player;
            const savedArmor = (p.equipped && p.equipped.armor) || null;
            try {
                r.equipArmor("ruestung_brustpanzer");
                r._tickWornArmorVisual();
                const g = r.state.playerMesh && r.state.playerMesh.userData._wornArmorMesh;
                if (!g) return false;
                // matrixWorld ist außerhalb des Render-Loops STALE (Physik setzt
                // nur .position) → erst aktualisieren, sonst misst die Box lokal
                // gegen Welt (GEMESSEN: −18.9 statt 0.14 — die Probe lag, nicht der Code).
                r.state.playerMesh.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(g);
                const pmY = r.state.playerMesh.position.y;
                const centerLocalY = (box.min.y + box.max.y) / 2 - pmY;
                // Masse-Zentrum nahe dem Torso-Anker 0.18 (±0.45) — NICHT ~0.9 (Kopf).
                return Math.abs(centerLocalY - 0.18) < 0.45;
            } finally {
                r.equipArmor(savedArmor);
                r._tickWornArmorVisual();
            }
        })();
        out.c7Seeds = (() => {
            // AUSLÖSCHUNGS-WELLE — der fahrzeug_wagen-Blueprint fiel; seine Substanz (inkl.
            // sitz-connection auf Part 0) lebt eingefroren in KIND_SUBSTANCE.fahrzeug_wagen.
            const KSc7 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            const w = KSc7.fahrzeug_wagen
                ? {
                      parts: JSON.parse(JSON.stringify(KSc7.fahrzeug_wagen.parts)),
                      connections: JSON.parse(JSON.stringify(KSc7.fahrzeug_wagen.connections || [])),
                  }
                : null;
            const h = r.state.blueprints.reittier_holzross;
            if (!w || !h) return false;
            const wMv = r._isMoveable(w);
            const hMv = r._isMoveable(h);
            const wSitz = r._attachPointFor(w, "sitz").point;
            return wMv && hMv && Math.abs(wSitz.y - 1.025) < 0.01 && w.connections.some((c) => c.type === "sitz");
        })();
        out.c7Bodies =
            !!(r.state.blueprints.koerper_human && r.state.blueprints.koerper_human.role === "soul") &&
            !!r.state.blueprints.koerper_wolf &&
            !!r.state.blueprints.koerper_baer &&
            !r.state.blueprints.koerper_phoenix &&
            !r.state.blueprints.koerper_dragon &&
            !document.getElementById("workshop-import-soul-btn");
        // A4 — die Wasserfall-PLANE ist geschnitten (Builder weg; die Abwärts-Material-Saat ohne Leser fiel mit der
        // Welle L); der STEIL-SPLIT formt vertikales Wasser im Zell-Sheet (Lippe + Vorhang).
        out.a4PlaneCut =
            typeof r._buildHydroWaterfall === "undefined" &&
            typeof r._buildHydroWaterfallPool === "undefined" &&
            typeof r._waterfallIsRealWall === "undefined" &&
            typeof r._ensureWaterfallMaterial === "undefined" &&
            typeof r.setWaterfallSteep === "undefined";
        // A4 — aWave (Ozean-Wellen-Anteil) ist ART-gedämpft: die Fluss-Abdeckung (riverness, dieselbe
        // smoothstep-Rampe wie die Shader-Strähnen) nimmt die Wogen aus dem Fluss, ein See ist still.
        // Source-Probe; der behaviorale Wächter ist diag-mouth.cjs.
        out.a4MouthWave = (() => {
            const src = window.__codeOf(r._computeWaterSheetData);
            return (
                /riverness/.test(src) && /heightRamp \* \(1 - riverness\)/.test(src) && /_hydrosphereLakeAt/.test(src)
            );
        })();
        // WASSER-SHEET-ANTI-STARVATION: reine Distanz-Priorität + Dauer-Nachschub naher Keys ließe FERNE
        // Einträge nie drankommen (Löcher im fernen Wasser) → der Tick trägt einen FIFO-Slot (ältester).
        // Behavioral: ein ferner Key wird trotz frischer naher Keys binnen weniger Ticks gezogen.
        out.waterIsoNoStarve = (() => {
            const s = r.state;
            const savedQ = s.pendingWaterIso;
            try {
                const lpc = s.lastPlayerVoxelChunk || { cx: 0, cz: 0 };
                // echte gestreamte Chunk-Keys: einer NAH am Spieler, einer FERN.
                let nearKey = null;
                let farKey = null;
                let farDist = -1;
                for (const k of s.voxelChunks.keys()) {
                    const ci = k.indexOf(",");
                    const kx = parseInt(k.slice(0, ci), 10);
                    const kz = parseInt(k.slice(ci + 1), 10);
                    const d = Math.max(Math.abs(kx - lpc.cx), Math.abs(kz - lpc.cz));
                    if (d <= 1 && !nearKey) nearKey = k;
                    if (d > farDist && d <= 4) {
                        farDist = d;
                        farKey = k;
                    }
                }
                if (!nearKey || !farKey || nearKey === farKey) return null; // Welt zu klein → skip
                s.pendingWaterIso = new Set([farKey]);
                let drawn = false;
                for (let t = 0; t < 12 && !drawn; t++) {
                    // Dauer-Nachschub: jede Runde kommt der nahe Key frisch dazu
                    // (das CA-Wake-Muster) — er gewinnt jeden Distanz-Slot.
                    s.pendingWaterIso.add(nearKey);
                    r._tickPendingWaterIso(2); // 1 Distanz-Slot + 1 FIFO-Slot
                    if (!s.pendingWaterIso.has(farKey)) drawn = true;
                }
                return drawn;
            } finally {
                s.pendingWaterIso = savedQ;
            }
        })();
        // E3-MANA-HUD: pfad → dritte Stats-Row sichtbar, Wert folgt p.mana; frieden → hidden (dort ist
        // Mana keine Währung).
        out.e3ManaHud = (() => {
            const row = document.getElementById("stats-hud-mana-row");
            if (!row) return false;
            const savedMode = typeof r.getGameMode === "function" ? r.getGameMode() : r.state.gameMode;
            const savedMana = r.state.player.mana;
            try {
                if (typeof r.setGameMode === "function") r.setGameMode("pfad");
                else r.state.gameMode = "pfad";
                r.state.player.mana = 7;
                r.state._statsHudLastTick = 0;
                r.tickStatsHud(1e9);
                const visOk = !row.hidden;
                const txt = document.getElementById("stats-hud-mana-text").textContent;
                if (typeof r.setGameMode === "function") r.setGameMode("frieden");
                else r.state.gameMode = "frieden";
                r.state._statsHudLastTick = 0;
                r.tickStatsHud(2e9);
                return visOk && /^7\//.test(txt) && row.hidden === true;
            } finally {
                if (typeof r.setGameMode === "function") r.setGameMode(savedMode);
                else r.state.gameMode = savedMode;
                r.state.player.mana = savedMana;
            }
        })();
        // C1-GELENK-READOUT (eine Wahrheit für Animation UND Panel): der Readout ruft computeMotionRoles
        // MIT bp.connections wie die Animation (ohne → Lage-Fallback, falsche Gelenke). KONSUM: der Wagen
        // (Eisen-Räder) klassifiziert als rad; die Panel-Quelle trägt connections-Call + Gelenk-Labels.
        out.c1JointReadout = (() => {
            // AUSLÖSCHUNGS-WELLE — die Wagen-Substanz (KIND_SUBSTANCE) trägt die rad-Klassifikation.
            const KSc1 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            const bp = KSc1.fahrzeug_wagen;
            if (!bp) return false;
            const roles = r.computeMotionRoles(bp.parts, bp.connections) || [];
            const hasRad = roles.some((x) => x && x.role === "rad");
            const src = r._specRenderBody ? window.__codeOf(r._specRenderBody) : "";
            return hasRad && /computeMotionRoles\(bp\.parts, bp\.connections\)/.test(src) && /Rad an Achse/.test(src);
        })();
        // B5-UNTERWASSER-PASS: Konsument des Kamera-Mediums (neben der Unterwasser-Luft) — liegt die KAMERA unter
        // dem Spiegel (`_koerperWasser` an der Kamera, Welle L Q6), ist das geteilte Wasser-Material DoubleSide (Decke von
        // unten sichtbar), darüber BackSide. Behavioral mit Restore (zustands-neutral): der Spiegel wird einmal über,
        // einmal unter die Kamera gelegt.
        out.b5Underwater = (() => {
            if (typeof r._ensureHydroSurfaceMaterial !== "function") return false;
            const mat = r._ensureHydroSurfaceMaterial();
            if (!mat) return false;
            try {
                r._koerperWasser = () => Infinity;
                r._applyDayNightToScene();
                const diveSide = mat.side;
                r._koerperWasser = () => -Infinity;
                r._applyDayNightToScene();
                const surfSide = mat.side;
                return diveSide === THREE.DoubleSide && surfSide === THREE.BackSide;
            } finally {
                delete r._koerperWasser;
                r._applyDayNightToScene();
            }
        })();
        // B6: DACH-GATE des Wasser-Re-Mesh — es entscheidet die SICHTBARE Spalten-Dach-Änderung, nicht
        // Brutto-moved (ein stationärer Fluss re-meshte sonst jeden Frame). Behavioral: erster Call true ·
        // unverändert false · sichtbare Änderung true · danach false; + KONSUM (Welt-Tick ruft es).
        out.b6RoofGate = (() => {
            const key = "__fp_test__";
            const saved = r.state.voxelChunks.get(key);
            try {
                r.state.voxelChunks.set(key, {});
                const dim = 4;
                const dimY = 8;
                const dimSq = dim * dim;
                const level = new Float64Array(dimSq * dimY);
                for (let c = 0; c < dimSq; c++) level[3 * dimSq + c] = 0.8;
                // Zellen: Luft (0) — die Entscheidung legt das Dach als WUNSCH ab (`_caDachNeu`, j + Füllgrad, offen),
                // gezeichnet wird es erst mit dem eigenen Bau (`_buildVoxelChunkWaterCellSheet`).
                const cells = new Uint8Array(dimSq * dimY);
                const a = { key, level, cells, band: { jMin: 0, jMax: dimY - 1 } };
                const e = r.state.voxelChunks.get(key);
                const first = r._caRoofChanged(a, dim, dimY);
                const dachNachErst = e._caDachNeu ? e._caDachNeu[0] : null;
                const offenNachErst = e._caDachOffen === true && !e._caDach;
                const second = r._caRoofChanged(a, dim, dimY);
                level[4 * dimSq] = 0.9;
                const zwischen = e._caDachNeu[0]; // ohne Entscheidung: der Wunsch bleibt
                const third = r._caRoofChanged(a, dim, dimY);
                const fourth = r._caRoofChanged(a, dim, dimY);
                const dachNachDritt = e._caDachNeu[0];
                const src = r._tickWorldWaterCA ? window.__codeOf(r._tickWorldWaterCA) : "";
                const dachOk =
                    offenNachErst &&
                    Math.abs(dachNachErst - 3.8) < 1e-6 &&
                    Math.abs(zwischen - 3.8) < 1e-6 &&
                    Math.abs(dachNachDritt - 4.9) < 1e-6;
                return first && !second && third && !fourth && dachOk && /_caRoofChanged/.test(src);
            } finally {
                if (saved === undefined) r.state.voxelChunks.delete(key);
                else r.state.voxelChunks.set(key, saved);
            }
        })();
        // E4-KRISTALL + E5: eine wiederholt bewährte Geste (3 finalisierte Läufe, deposit_life, sorrow)
        // kristallisiert zur Regel — Bedingung aus der Emotions-Signatur (field_above sorrow), Effekt =
        // bester Lauf, Registrierung über die Nexus-Queue (zahlt am Wirk-Tor). Behavioral + KONSUM.
        out.e45Crystal = (() => {
            const dsl = r.state.dsl;
            const saved = {
                hist: dsl.history,
                q: r.state.nexusEvolutionQueue,
                last: dsl.lastCrystallizeAt,
                sig: dsl.lastCrystalSig,
            };
            try {
                const mk = (f, sorrow) => ({
                    id: "t_crystal",
                    program: ["deposit_life", ["at_player"]],
                    at: 0,
                    ok: true,
                    finalized: true,
                    fitness: f,
                    outcome: { emotionsBefore: { joy: 0, awe: 0, sorrow, hope: 0, peace: 0, chaos: 0 } },
                });
                dsl.history = [mk(0.8, 0.7), mk(0.75, 0.6), mk(0.9, 0.8)];
                dsl.lastCrystallizeAt = -Infinity;
                dsl.lastCrystalSig = null;
                r.state.nexusEvolutionQueue = [];
                const prog = r._crystallizeGestureRule(performance.now() / 1000);
                const q = r.state.nexusEvolutionQueue[0];
                return (
                    !!prog &&
                    prog[0] === "rule" &&
                    Array.isArray(prog[1]) &&
                    prog[1][0] === "field_above" &&
                    prog[1][1] === "sorrow" &&
                    Array.isArray(prog[2]) &&
                    prog[2][0] === "deposit_life" &&
                    !!q &&
                    /kristall/.test(q.name)
                );
            } finally {
                dsl.history = saved.hist;
                r.state.nexusEvolutionQueue = saved.q;
                dsl.lastCrystallizeAt = saved.last;
                dsl.lastCrystalSig = saved.sig;
            }
        })();
        // Wächter: eine UNSICHERE Geste (spawn_village = frozen-Welt-Op) kristallisiert NIE.
        out.e45Guard = (() => {
            const dsl = r.state.dsl;
            const saved = { hist: dsl.history, q: r.state.nexusEvolutionQueue, last: dsl.lastCrystallizeAt };
            try {
                const bad = {
                    id: "t_bad",
                    program: ["spawn_village", ["at", 0, 0, 0], 1],
                    at: 0,
                    ok: true,
                    finalized: true,
                    fitness: 0.9,
                    outcome: { emotionsBefore: { joy: 0.8, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 } },
                };
                dsl.history = [bad, { ...bad }, { ...bad }];
                dsl.lastCrystallizeAt = -Infinity;
                r.state.nexusEvolutionQueue = [];
                const prog = r._crystallizeGestureRule(performance.now() / 1000);
                return prog === null && r.state.nexusEvolutionQueue.length === 0;
            } finally {
                dsl.history = saved.hist;
                r.state.nexusEvolutionQueue = saved.q;
                dsl.lastCrystallizeAt = saved.last;
            }
        })();
        // E1: das EINE Dispatch-Tor — der Dispatch läuft über die chatSystemPatterns-Tabelle (keine
        // if-else-Handler); behavioral: „liste welten“ läuft durch die Tabelle; KONSUM: chatSuggest liest
        // BEIDE Tabellen (der Tippfehler „speichre zustand“ bekommt den System-Vorschlag).
        out.e1OneGate = (() => {
            const oldHandlersGone =
                typeof r._chatTryWorldCommand !== "function" &&
                typeof r._chatTrySystemCommand !== "function" &&
                typeof r._chatTryAbilityCommand !== "function" &&
                typeof r._chatTryPersistenceCommand !== "function";
            if (!oldHandlersGone) return "alte if-else-Handler leben noch";
            if (!/chatSystemPatterns/.test(window.__codeOf(r._chatDispatchLegacyCommand)))
                return "Dispatch liest die Tabelle nicht";
            const out0 = document.getElementById("chat-output");
            const before = out0 ? out0.children.length : 0;
            r.processChatCommand("liste welten");
            const after = out0 ? out0.children.length : 0;
            let listed = false;
            for (let i = before; i < after; i++) {
                const txt = out0.children[i].textContent || "";
                if (/Welten im Speicher|Nur diese eine Welt/.test(txt)) listed = true;
            }
            if (!listed) return "liste welten lief nicht über die Tabelle";
            const sugg = r.chatSuggest("speichre zustand");
            if (sugg !== "speichere zustand") return `Suggest las die System-Tabelle nicht (${sugg})`;
            return true;
        })();
        // D5a Wetter-INTENSITÄTS-ACHSE: (a) die Achse extrapoliert (stormy > rainy im Blend-Lerp);
        // (b) Vokabular-Gate (stormy ja, xyz nein); (c) das Innenleben unterscheidet die Worte (Sturm
        // fühlt chaos+awe, nicht sorrow); (d) EIN Schreiber: DSL-Op + Auto-Zug rufen _setWeather (Fade).
        out.d5aWeather = (() => {
            const saved = {
                w: r.state.weather,
                wt: r.state.weatherTransition,
                wet: r.state.weatherEffectTime,
                creatures: r.state.creatures,
                ce: r.state.creatureEmotions,
            };
            // Wer fühlt, zieht der Fauna-Strom des Gefühls (Γ5, Welle L) — die Probe setzt den Strom, nie Math.random.
            const hatteStrom = Object.prototype.hasOwnProperty.call(r, "_faunaRng");
            try {
                r.state.weatherTransition = null;
                r.state.weather = "rainy";
                const vRainy = r._weatherBlendedValue(0, 1);
                r.state.weather = "stormy";
                const vStormy = r._weatherBlendedValue(0, 1);
                if (!(Math.abs(vRainy - 1) < 1e-9 && vStormy > 1)) return `Achse: rainy=${vRainy} stormy=${vStormy}`;
                if (!r.requestWeatherTransition("sunny")) return "Gate: sunny abgelehnt";
                r.state.weatherTransition = null;
                if (r.requestWeatherTransition("xyz")) return "Gate: xyz angenommen";
                const fake = {
                    userData: { emotions: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 } },
                };
                r.state.creatures = [fake];
                r.state.creatureEmotions = ["happy"];
                r._faunaRng = (zweck) => (zweck === "gefuehl" ? () => 0.05 : () => 0.99);
                r.state.weather = "stormy";
                r.updateCreatureEmotions();
                const em = fake.userData.emotions;
                if (!(em.chaos > 0.1 && em.awe > 0.05 && em.sorrow === 0))
                    return `Innenleben: chaos=${em.chaos} awe=${em.awe} sorrow=${em.sorrow}`;
                if (!/_setWeather/.test(window.__codeOf(r._loopWeatherAndGrowth)))
                    return "Auto-Zug ruft _setWeather nicht";
                if (!/requestWeatherTransition/.test(window.__codeOf(r._setWeather))) return "_setWeather fadet nicht";
                return true;
            } finally {
                if (!hatteStrom) delete r._faunaRng;
                r.state.weather = saved.w;
                r.state.weatherTransition = saved.wt;
                r.state.weatherEffectTime = saved.wet;
                r.state.creatures = saved.creatures;
                r.state.creatureEmotions = saved.ce;
            }
        })();
        // N7.4 — der Horizont-Mantel ist GESCHNITTEN (Vor-Studio-Kulisse): die V18.113-
        // Material-Probe wandert zur Abwesenheit (der Schnitt bleibt geschnitten).
        out.b3Mantle = typeof r._ensureHorizonMantle === "undefined";
        // A4-SCHELF, KÜSTEN-AQUIFER — synthetisch auf präpariertem preDensity-Grid (atlas-frei, in-region):
        // (a) die himmel-offene Senke unter dem Wassertisch trägt WASSER; (b) Land über dem Spiegel bleibt
        // trocken; (c) die GEDECKELTE Höhle unter dem Spiegel bleibt trocken (_skyOpenWaterFilter trennt).
        out.a4ShelfAquifer = (() => {
            const cfg = r._voxelChunkConfig(0);
            const { dim, dimY, step, span, floorDrop } = cfg;
            const base = r.state.terrainBaseHeight || 0;
            const wl = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
            // atlas-freien In-Region-Chunk finden (deterministisch: erster Treffer)
            let ox = null,
                oz = null;
            outer: for (let ccx = 2; ccx < 18; ccx += 2) {
                for (let ccz = 2; ccz < 18; ccz += 2) {
                    const tx = ccx * span,
                        tz = ccz * span;
                    if (tx + span > 1000 || tz + span > 1000) continue;
                    let clean = true;
                    for (let g = 0; g <= 4 && clean; g++) {
                        for (let q = 0; q <= 4 && clean; q++) {
                            const sx = tx + (g / 4) * span,
                                sz = tz + (q / 4) * span;
                            if (r._atlasWaterLevelAt(sx, sz, Infinity) > -Infinity) clean = false;
                        }
                    }
                    if (!clean) continue;
                    const arch = (r.state.architectures || []).some(
                        (a) =>
                            a &&
                            a.position &&
                            a.position.x > tx - 8 &&
                            a.position.x < tx + span + 8 &&
                            a.position.z > tz - 8 &&
                            a.position.z < tz + span + 8
                    );
                    if (arch) continue;
                    ox = tx;
                    oz = tz;
                    break outer;
                }
            }
            if (ox === null) return "kein atlas-freier Ort";
            const oy = base - floorDrop;
            // synthetisches Terrain: Senke (Spalten 4..9) terr=wl−6 · Land terr=wl+8 ·
            // Höhle (Spalten 14..17): Land MIT Hohlraum y∈[wl−5,wl−2] unter Deckel.
            const inSenke = (x, z) => x - ox >= 7.2 && x - ox <= 18 && z - oz >= 7.2 && z - oz <= 18;
            const inHoehle = (x, z) => x - ox >= 25.2 && x - ox <= 32.4 && z - oz >= 25.2 && z - oz <= 32.4;
            const Nx = dim + 4,
                Ny = dimY + 1,
                Nz = dim + 4;
            const density = new Float32Array(Nx * Ny * Nz);
            for (let vk = 0; vk < Nz; vk++) {
                const z = oz - step + vk * step;
                for (let vj = 0; vj < Ny; vj++) {
                    const y = oy + vj * step;
                    for (let vi = 0; vi < Nx; vi++) {
                        const x = ox - step + vi * step;
                        const terr = inSenke(x, z) ? wl - 6 : wl + 8;
                        let d = terr - y;
                        if (inHoehle(x, z) && y > wl - 5 && y < wl - 2) d = -1;
                        density[vi + vj * Nx + vk * Nx * Ny] = d;
                    }
                }
            }
            const cells = r._buildVoxelChunkWaterCells(ox, oy, oz, step, density, 0);
            const dimSq = dim * dim;
            const jCount = Math.floor(cells.length / dimSq);
            let senkeWater = 0,
                landWater = 0,
                hoehleWater = 0;
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    const cx = ox + (i + 0.5) * step,
                        cz2 = oz + (k + 0.5) * step;
                    const senke = inSenke(cx, cz2),
                        hoehle = inHoehle(cx, cz2);
                    for (let j = 0; j < jCount; j++) {
                        if (cells[i + k * dim + j * dimSq] !== 1) continue;
                        const cy = oy + (j + 0.5) * step;
                        if (senke) senkeWater++;
                        else if (hoehle && cy < wl - 1.5) hoehleWater++;
                        else if (!hoehle) landWater++;
                    }
                }
            }
            return senkeWater > 0 && landWater === 0 && hoehleWater === 0
                ? true
                : `senke=${senkeWater} land=${landWater} hoehle=${hoehleWater}`;
        })();
        return out;
    });
    if (res.error) {
        check("PHASEN B–F: Band (realm verfügbar)", false, res.error);
        return;
    }
    check("C1: Verbindung → Gelenk-Rolle mit Anker+Achse (computeMotionRoles, KONSUM)", res.c1Joint);
    check("C6/SYNERGIE: die Avatar-Aura (Tick + Haut-Shells) ist PHYSISCH gefallen", res.c6Src);
    check(
        "D4-VOLL: Temperament aus Gattung und Größe (Hirsch scheu · Wolf wild · Bär wehrhaft · Fuchs scheu · Koloss-Hirsch wehrhaft · kleiner Bär sanft)",
        res.d4Temperament
    );
    check("D4-VOLL: die Gegenwehr KONSUMIERT das Temperament-Profil (strike/fleeMul)", res.d4Konsum);
    check("E2: _dslProgramWirkCost zahlt die Substanz (spawn_village = 20)", res.e2VillageCost);
    check("E2-VOLL: der Balance-Faktor liest die Emotion (ruhig=1, chaos-gekippt<0.5)", res.e2Balance);
    check("F2: iceServers konfigurierbar präsent", res.f2Turn);
    check("E8: swapHands tauscht Hand↔Off-Hand im Roundtrip (KONSUM via equipHeld)", res.e8Swap);
    check("E8: der Off-Hand-Slot steht neben der Hotbar (data-slot=offhand)", res.e8Dom);
    check("E8: der Hand-Tausch ist als Key G gebunden (rebindable)", res.e8Key);
    check("C7: ein Attachment-Punkt (sitz) validiert ohne partB", res.c7Validate);
    check("C7: die getragene Rüstung sitzt am TORSO, nicht auf dem Kopf (GEMESSEN ±0.45)", res.c7ArmorSitz);
    check("C7: Wagen+Holzross-Saat sind moveable + tragen sitz-Punkte (GEMESSEN)", res.c7Seeds);
    check("C7: Built-in-Körper liegen automatisch als Blueprints (Button gefallen)", res.c7Bodies);
    check("A4 → Welle L: die Wasserfall-Plane und die Saat ohne Leser sind gefallen", res.a4PlaneCut);
    check("A4: aWave ist ART-gedämpft (Fluss-riverness + See still — die Mündungs-Synergie)", res.a4MouthWave);
    check(
        "V18.117: Wasser-Sheet-Queue verhungert nicht (FIFO-Slot zieht ferne Keys trotz Dauer-Nachschub)",
        res.waterIsoNoStarve !== false
    );
    check("E3/V18.119: Mana-HUD — pfad zeigt die Währung (Wert folgt), frieden blendet aus", res.e3ManaHud);
    check(
        "C1/V18.119: das Werkstatt-Panel liest die GELENKE (connections → Rad an Achse, eine Wahrheit mit der Animation)",
        res.c1JointReadout
    );
    check(
        "B5/V18.120: der Taucher sieht die Wasserdecke (eyesUnderwater → DoubleSide, auftauchen → BackSide)",
        res.b5Underwater
    );
    check(
        "B6/V18.121: das Wasser-Re-Mesh folgt der SICHTBAREN Dach-Änderung (Fingerprint-Gate, kein Durchfluss-Churn)",
        res.b6RoofGate
    );
    check("E4+E5: die bewährte Geste kristallisiert zum Gesetz, die Emotion gebiert die Bedingung", res.e45Crystal);
    check("E4+E5: eine frozen-Welt-Geste kristallisiert NIE (die EINE Effekt-Whitelist)", res.e45Guard);
    check("B3/N7.4: der Horizont-Mantel ist geschnitten (kein Mantel-Material-Pfad mehr)", res.b3Mantle);
    check("B8: rimStrength-Uniform verdrahtet (Struktur-LUT mit Toon gepurged → PBR-Rim)", res.b8Rim);
    check(
        "A4/V18.125: der KÜSTEN-AQUIFER — offene Senke unterm Wassertisch trägt Wasser, Land + gedeckelte Höhle bleiben trocken",
        res.a4ShelfAquifer === true,
        typeof res.a4ShelfAquifer === "string" ? res.a4ShelfAquifer : undefined
    );
    check(
        "E1/V18.127: das EINE Dispatch-Tor — System-Befehle laufen über die Tabelle, chatSuggest liest beide",
        res.e1OneGate === true,
        typeof res.e1OneGate === "string" ? res.e1OneGate : undefined
    );
    check(
        "D5a/V18.128: die Wetter-ACHSE — stormy extrapoliert, das Vokabular gated, der Sturm fühlt chaos, EIN Schreiber fadet",
        res.d5aWeather === true,
        typeof res.d5aWeather === "string" ? res.d5aWeather : undefined
    );
}

// W5 Werkzeug-Abnutzung (Ω5-Perpetuum-Verbot am Werkzeug): ein gehaltenes Gerät trägt wear (0..1),
// jeder Hieb zehrt, an der Schwelle → kaputt + Repair; Repair zahlt Material (forge × REPAIR_FRACTION
// × Schaden) → wear=1. Migration-tolerant: ein Bauplan ohne wear-Feld liest 1.
async function checkBandW5Werkzeugabnutzung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        const AR = window.AnazhRealm || r.constructor;
        const out = {};

        // (W1) FROZEN-Konstanten existieren mit plausiblen Werten.
        out.constantsExist =
            typeof AR.WEAR_PER_STRIKE_BASE === "number" &&
            AR.WEAR_PER_STRIKE_BASE > 0 &&
            AR.WEAR_PER_STRIKE_BASE < 0.1 &&
            typeof AR.WEAR_KAPUTT_SCHWELLE === "number" &&
            AR.WEAR_KAPUTT_SCHWELLE > 0 &&
            AR.WEAR_KAPUTT_SCHWELLE < 1 &&
            typeof AR.REPAIR_COST_FRACTION === "number" &&
            AR.REPAIR_COST_FRACTION > 0 &&
            AR.REPAIR_COST_FRACTION <= 1;

        // (W2) MIGRATION: ein Bauplan ohne wear-Feld liest 1 (alte Welten
        // verlieren NICHTS — kein Funktions-Verlust beim Reload).
        const fakeBp = { name: "fake", parts: [] };
        out.migrationDefault = r._blueprintWear(fakeBp) === 1;
        out.migrationNullSafe = r._blueprintWear(null) === 1;

        // (W3) _setBlueprintWear clampt + schreibt korrekt (0..1).
        r._setBlueprintWear(fakeBp, 0.5);
        out.writeClampMid = fakeBp.wear === 0.5;
        r._setBlueprintWear(fakeBp, -0.3);
        out.writeClampNeg = fakeBp.wear === 0;
        r._setBlueprintWear(fakeBp, 1.5);
        out.writeClampOver = fakeBp.wear === 1;

        // (W4) _wearPerStrike: ein harter Bauplan (eisen) zehrt LANGSAMER als
        // ein weicher (holz). Die Härte-Skalierung lebt.
        const eisenBp = {
            name: "test_eisen",
            parts: [
                {
                    shape: "cylinder",
                    material: "eisen",
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 0.3, y: 1, z: 0.3 },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [],
                },
            ],
            connections: [],
        };
        const holzBp = {
            name: "test_holz",
            parts: [
                {
                    shape: "cylinder",
                    material: "holz",
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 0.3, y: 1, z: 0.3 },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [],
                },
            ],
            connections: [],
        };
        const wEisen = r._wearPerStrike(eisenBp);
        const wHolz = r._wearPerStrike(holzBp);
        out.eisenSlower = wEisen > 0 && wHolz > 0 && wEisen < wHolz;

        // (W5) _wearStatFactor: voll → 1.0, leer → FLOOR (≥0.3), 50 % → ~0.65.
        r._setBlueprintWear(fakeBp, 1);
        const factorFull = r._wearStatFactor(fakeBp);
        r._setBlueprintWear(fakeBp, 0);
        const factorEmpty = r._wearStatFactor(fakeBp);
        r._setBlueprintWear(fakeBp, 0.5);
        const factorMid = r._wearStatFactor(fakeBp);
        out.factorMonotonic =
            factorFull > 0.99 &&
            Math.abs(factorEmpty - AR.WEAR_STAT_FLOOR) < 0.001 &&
            factorMid > factorEmpty + 0.1 &&
            factorMid < factorFull;

        // (W6) FORGE setzt wear=1 (frisches Werkzeug startet voll). Test-Blueprint deterministisch aus der
        // Substanz-Zeile KIND_SUBSTANCE.geraet_spitzhacke, am Ende geräumt.
        const KSw5 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        const heldName = "_t_wear_spitz";
        if (r.state.blueprints._t_wear_spitz) delete r.state.blueprints._t_wear_spitz;
        if (KSw5.geraet_spitzhacke) {
            r.state.blueprints._t_wear_spitz = {
                name: "_t_wear_spitz",
                parts: JSON.parse(JSON.stringify(KSw5.geraet_spitzhacke.parts)),
            };
        }
        let heldBp = r.state.blueprints && r.state.blueprints[heldName];
        out.libraryHasSpitzhacke = !!heldBp;
        if (heldBp) {
            // wear bewusst niedrig setzen; im schöpfer-Modus ist forge gratis (_forgeMaterialAndFreeze ruft
            // _makeCostGate → free=true) — das deckt den frieden-Pfad mit ab.
            if (typeof r.setGameMode === "function") r.setGameMode("schöpfer");
            r._setBlueprintWear(heldBp, 0.3); // beschädigt
            const forgeRes = r.forgeBlueprint(heldName);
            out.forgeRefilled = !!(forgeRes && forgeRes.ok && r._blueprintWear(heldBp) > 0.99);
        }

        // (W7) STRIKE zehrt wear. Wir bauen einen Test-Architektur-Eintrag +
        // hauen drauf; wear muss messbar sinken.
        if (heldBp) {
            // Sicherstellen: Spieler hält das Gerät.
            const eqRes = r.equipHeld(heldName);
            out.equipOk = !!(eqRes && eqRes.ok);
            r._setBlueprintWear(heldBp, 1); // voll
            // Test-Architektur (klein, abbaubar) — wir nehmen einen Bauplan
            // mit Holz-Stamm; die existierenden Baupläne haben einen.
            const testArchType = r.state.blueprints["baum_eiche"] ? "baum_eiche" : Object.keys(r.state.blueprints)[0];
            const testEntry = r.spawnArchitecture(testArchType, { x: 800, y: 0, z: 800 }, { precise: true });
            if (testEntry) {
                const wearBefore = r._blueprintWear(heldBp);
                r._strikeArchitecture(testEntry);
                const wearAfter = r._blueprintWear(heldBp);
                out.strikeReducesWear = wearAfter < wearBefore && wearBefore - wearAfter < 0.1;
                // Aufräumen — die Test-Architektur entfernen.
                if (typeof r.removeArchitecture === "function") {
                    try {
                        r.removeArchitecture(testEntry);
                    } catch {
                        /* defensive */
                    }
                }
            } else {
                out.strikeReducesWear = false;
            }
        }

        // (W8) KAPUTT-WAND: ein verbrauchtes Werkzeug verweigert den Hieb.
        if (heldBp) {
            r._setBlueprintWear(heldBp, AR.WEAR_KAPUTT_SCHWELLE - 0.01); // unter der Schwelle
            const testArchType = r.state.blueprints["baum_eiche"] ? "baum_eiche" : Object.keys(r.state.blueprints)[0];
            const testEntry = r.spawnArchitecture(testArchType, { x: 900, y: 0, z: 900 }, { precise: true });
            if (testEntry) {
                const result = r._strikeArchitecture(testEntry);
                // _strikeArchitecture liefert false bei „verbraucht"; wear hat sich NICHT geändert
                const wearAfter = r._blueprintWear(heldBp);
                out.kaputtWand = result === false && wearAfter === AR.WEAR_KAPUTT_SCHWELLE - 0.01;
                // Aufräumen — das Bauwerk steht noch (wir konnten nicht hauen).
                if (typeof r.removeArchitecture === "function") {
                    try {
                        r.removeArchitecture(testEntry);
                    } catch {
                        /* defensive */
                    }
                }
            }
        }

        // (W9) REPAIR-Akt stellt wear voll her (im schöpfer-Modus frei).
        if (heldBp) {
            r._setBlueprintWear(heldBp, 0.3); // beschädigt
            // schöpfer-Modus für free-Repair (Material-Tor umgangen).
            if (typeof r.setGameMode === "function") r.setGameMode("schöpfer");
            const repRes = r.repairHeldDevice();
            out.repairOk = !!(repRes && repRes.ok && repRes.before === 0.3 && repRes.after === 1.0 && repRes.free);
            out.repairWearReset = r._blueprintWear(heldBp) === 1;
        }

        // (W10) REPAIR auf vollem Werkzeug lehnt ab (kein no-op-Wallpaper).
        if (heldBp) {
            r._setBlueprintWear(heldBp, 1);
            const repFullRes = r.repairHeldDevice();
            out.repairRejectsFull = !repFullRes.ok && repFullRes.reason === "already_full";
        }

        // (W11) REPAIR ohne gehaltenes Gerät lehnt ab.
        const oldHeld = r.state.player.equipped.held;
        r.state.player.equipped.held = null;
        const repNoHeld = r.repairHeldDevice();
        out.repairRejectsNoHeld = !repNoHeld.ok && repNoHeld.reason === "no_held_device";
        r.state.player.equipped.held = oldHeld;

        // (W12) MIGRATION über Snapshot: wear < 1 reist, wear === 1 NICHT (Größen-
        // Disziplin — die meisten Bauplane sind voll, ein Save trägt nur die echt
        // gebrauchten). Float-tolerant (Math.max/min kann minimal driften).
        if (heldBp) {
            // RE-FETCH (V18.180-Lehre, V9.82): zwischen W6-W11 wurde forge/strike/
            // repair gerufen — jeder Pfad MAG state.blueprints[heldName] durch
            // Restore/Snapshot-Tanz neu referenzieren. Frische Referenz holen.
            heldBp = r.state.blueprints[heldName];
            r._setBlueprintWear(heldBp, 0.42);
            const ser = r._serializeBlueprint(heldBp);
            const w12Partial = typeof ser.wear === "number" && Math.abs(ser.wear - 0.42) < 0.001;
            r._setBlueprintWear(heldBp, 1);
            const serFull = r._serializeBlueprint(heldBp);
            const w12Omitted = !("wear" in serFull);
            r._setBlueprintWear(heldBp, 0.42);
            const ser2 = r._serializeBlueprint(heldBp);
            const restored = r._deserializeBlueprint({ ...ser2 });
            const w12RoundTrip = !!restored && Math.abs(r._blueprintWear(restored) - 0.42) < 0.001;
            // DIAG für die Wand-Diagnose: alle drei Sub-Werte einzeln.
            out.w12Partial = w12Partial;
            out.w12Omitted = w12Omitted;
            out.w12RoundTrip = w12RoundTrip;
            out.w12_serWear = ser.wear;
            out.w12_serFullHasWear = "wear" in serFull;
            out.w12_serFullKeys = Object.keys(serFull).join(",");
            out.wearSerializedWhenPartial = w12Partial;
            out.wearOmittedWhenFull = w12Omitted;
            out.wearRoundTrip = w12RoundTrip;
        }

        // (W13) R2-DISJUNKTHEIT strukturell: weder repair_held noch wear-Setter
        // sind DSL-Ops (kein Skript kann automatisch reparieren oder die Mühe-
        // Senke umgehen — Ω5 lebt nur durch echte Spieler-Akte).
        const dslRunSrc = window.__codeOf(r.dslRun);
        out.noRepairOp = !/op\s*===\s*["']repair_held["']/.test(dslRunSrc);
        out.noSetWearOp = !/op\s*===\s*["']set_wear["']/.test(dslRunSrc);

        // Aufräumen — Modus zurück, Hand leer + Test-Blueprint geräumt (kein dangling Held).
        if (heldBp) r._setBlueprintWear(heldBp, 1);
        r.equipHeld(null);
        delete r.state.blueprints._t_wear_spitz;
        if (typeof r.setGameMode === "function") r.setGameMode("frieden");

        return out;
    });

    check(
        "W5 (W1): FROZEN-Konstanten existieren mit plausiblen Werten (WEAR_PER_STRIKE_BASE · WEAR_KAPUTT_SCHWELLE · REPAIR_COST_FRACTION)",
        res.constantsExist
    );
    check(
        "W5 (W2): MIGRATION — ein Bauplan ohne wear-Feld liest 1 (alte Welten verlieren NICHTS) + null-safe",
        res.migrationDefault && res.migrationNullSafe
    );
    check(
        "W5 (W3): _setBlueprintWear clampt + schreibt korrekt (0..1; -0.3 → 0; 1.5 → 1)",
        res.writeClampMid && res.writeClampNeg && res.writeClampOver
    );
    check(
        "W5 (W4): _wearPerStrike — hartes Material (eisen) widersteht der Abnutzung > weiches (holz); Härte-Skalierung lebt",
        res.eisenSlower
    );
    check(
        "W5 (W5): _wearStatFactor monoton (voll → 1.0 · leer → WEAR_STAT_FLOOR ≥ 0.3 · 50 % → dazwischen) — die Equip-Stat-Modulation lebt",
        res.factorMonotonic
    );
    check(
        "W5 (W6): FORGE setzt wear=1 (frisches/repariertes Werkzeug startet voll) — die Spitzhacken-Substanz (KIND_SUBSTANCE) ist craftbar",
        res.libraryHasSpitzhacke && res.forgeRefilled
    );
    check(
        "W5 (W7): STRIKE zehrt wear (ein Hieb am Bauwerk sinkt wear messbar, klein) — die Mühe-Senke wirkt",
        res.equipOk && res.strikeReducesWear
    );
    check(
        "W5 (W8): KAPUTT-WAND — ein verbrauchtes Werkzeug (wear < WEAR_KAPUTT_SCHWELLE) verweigert den Hieb (return false, wear unverändert)",
        res.kaputtWand
    );
    check(
        "W5 (W9): REPAIR-Akt stellt wear voll her (im schöpfer-Modus frei + ok-Resultat trägt before/after/free)",
        res.repairOk && res.repairWearReset
    );
    check(
        "W5 (W10): REPAIR auf vollem Werkzeug lehnt ab (kein no-op-Wallpaper, reason=already_full)",
        res.repairRejectsFull
    );
    check("W5 (W11): REPAIR ohne gehaltenes Gerät lehnt ab (reason=no_held_device)", res.repairRejectsNoHeld);
    check(
        "W5 (W12 — must-preserve): wear < 1 reist im Snapshot (Round-Trip 0.42 ✓), wear === 1 wird OMITTED (Größen-Disziplin — die meisten Bauplane sind voll; BLUEPRINT_KNOWN_KEYS trägt 'wear' explizit, damit _carryUnknown sie nicht blind weiterreicht)",
        res.w12Partial && res.w12Omitted && res.w12RoundTrip
    );
    check(
        "W5 (W13 — R2-DISJUNKTHEIT): KEIN DSL-Op trägt repair_held/set_wear (kein Skript kann die Mühe-Senke umgehen — Ω5 lebt nur durch Spieler-Akte)",
        res.noRepairOp && res.noSetWearOp
    );
}

// V18.202 — Γ1-LESART-5 Ψ2-NASE Foundation (genese-plan §Γ1 + aktiv-plan §4.A):
// das Geruch-Feld der Welt als FÜNFTE Welt-Stimme. _worldWindDirAt + _scentAt
// als reine Math-Helper, kein Welt-State-Mutation, kein Kreatur-KI-Hook noch.
async function checkBandV18202GeruchFeld(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (N1) SCENT frozen + helpers
        out.scentConstExists = !!A.SCENT && Object.isFrozen(A.SCENT);
        if (A.SCENT) {
            const S = A.SCENT;
            out.scentConstsSensible =
                typeof S.rangeM === "number" &&
                S.rangeM > 0 &&
                typeof S.windFactor === "number" &&
                S.windFactor >= 0 &&
                S.windFactor <= 1 &&
                typeof S.minDirectional === "number" &&
                S.minDirectional >= 0 &&
                S.minDirectional <= 1;
        }
        out.windHelperExists = typeof r._worldWindDirAt === "function";
        out.scentHelperExists = typeof r._scentAt === "function";

        // (N2) Wind-Vektor: normalisiert, deterministisch, variiert über Position
        if (r._worldWindDirAt) {
            const w1 = r._worldWindDirAt(0, 0, 0);
            const w2 = r._worldWindDirAt(0, 0, 0);
            out.windDeterministic = w1.x === w2.x && w1.z === w2.z;
            out.windNormalized = Math.abs(Math.hypot(w1.x, w1.z) - 1) < 1e-6;
            // Variiert über große Distanzen (1000m) — nicht-konstant
            const w3 = r._worldWindDirAt(2000, 0, 0);
            const dot13 = w1.x * w3.x + w1.z * w3.z;
            out.windVariesOverDistance = Math.abs(dot13) < 0.999; // < 1 → unterschiedliche Richtung
        }

        // (N3) Geruch: einzelne Quelle, Distanz-Decay
        if (r._scentAt) {
            const src = [{ x: 0, z: 0, strength: 1.0 }];
            // Verschiedene Distanzen — Geruch fällt monoton
            const g0 = r._scentAt(0.5, 0.5, src); // sehr nah
            const g20 = r._scentAt(20, 0, src);
            const g50 = r._scentAt(50, 0, src);
            const g100 = r._scentAt(100, 0, src);
            const g300 = r._scentAt(300, 0, src); // jenseits 4×range
            out.scentNearStrong = g0 > 0.3; // nah > 0.3 (rangeM=80, exp(-0)≈1, modifiziert von wind)
            out.scentDistantWeaker = g20 > g50 && g50 > g100;
            out.scentFarVanishes = g300 < 0.05;
        }

        // (N4) Geruch akkumuliert über mehrere Quellen
        if (r._scentAt) {
            const oneSource = [{ x: 0, z: 0, strength: 1 }];
            const twoSources = [
                { x: 0, z: 0, strength: 1 },
                { x: 5, z: 0, strength: 1 },
            ];
            const g1 = r._scentAt(10, 0, oneSource);
            const g2 = r._scentAt(10, 0, twoSources);
            out.scentAccumulates = g2 > g1;
        }

        // (N5) Wind-Modulation: downwind > upwind
        if (r._scentAt && r._worldWindDirAt) {
            // Such einen Punkt mit klarem Wind-Vektor
            // Test-Trick: konstruiere Wind via einer Source an einer fixen Position,
            // dann samplen wir EXAKT downwind und upwind
            const sx = 100,
                sz = 100;
            const wind = r._worldWindDirAt(sx, sz, 0);
            // Downwind = in Wind-Richtung von Source aus
            const dRecv = { x: sx + wind.x * 50, z: sz + wind.z * 50 };
            const uRecv = { x: sx - wind.x * 50, z: sz - wind.z * 50 };
            const src = [{ x: sx, z: sz, strength: 1 }];
            const downG = r._scentAt(dRecv.x, dRecv.z, src);
            const upG = r._scentAt(uRecv.x, uRecv.z, src);
            out.downwindStronger = downG > upG;
            out.upwindStillHasMinScent = upG > 0; // minDirectional > 0
            out.downwindMagnitude = downG;
            out.upwindMagnitude = upG;
        }

        // (N6) Empty/null sources → 0
        if (r._scentAt) {
            out.emptyArrayIsZero = r._scentAt(0, 0, []) === 0;
            out.nullSourcesIsZero = r._scentAt(0, 0, null) === 0;
            out.invalidSourceFiltered = r._scentAt(0, 0, [null, { x: 0, z: 0, strength: 1 }]) > 0;
        }

        // (N7) Negative/zero strength → ignoriert
        if (r._scentAt) {
            const ignoreSrc = [
                { x: 0, z: 0, strength: 0 },
                { x: 0, z: 0, strength: -1 },
            ];
            out.zeroNegStrengthIgnored = r._scentAt(1, 0, ignoreSrc) === 0;
        }

        return out;
    });

    check("V18.202 (N1a) AnazhRealm.SCENT frozen + Konstanten existieren", res.scentConstExists === true);
    check(
        "V18.202 (N1b) SCENT-Konstanten sinnvoll (rangeM>0, windFactor∈[0,1], minDirectional∈[0,1])",
        res.scentConstsSensible === true
    );
    check(
        "V18.202 (N1c) _worldWindDirAt + _scentAt Helper existieren",
        res.windHelperExists === true && res.scentHelperExists === true
    );
    check("V18.202 (N2a) Wind deterministisch (zwei Aufrufe gleich)", res.windDeterministic === true);
    check("V18.202 (N2b) Wind normalisiert (Länge ≈ 1)", res.windNormalized === true);
    check(
        "V18.202 (N2c) Wind variiert über 2000 m Distanz (kein konstanter Vektor)",
        res.windVariesOverDistance === true
    );
    check("V18.202 (N3a) Geruch nah > 0.3 (volle Stärke nahe Quelle)", res.scentNearStrong === true);
    check("V18.202 (N3b) Distanz-Decay monoton (20>50>100)", res.scentDistantWeaker === true);
    check("V18.202 (N3c) Bei 300 m: Geruch sehr schwach < 0.05 (decay × windMod)", res.scentFarVanishes === true);
    check("V18.202 (N4) Mehrere Quellen akkumulieren (2 sources > 1 source)", res.scentAccumulates === true);
    check(
        `V18.202 (N5a) Downwind stärker als upwind (down=${res.downwindMagnitude && res.downwindMagnitude.toFixed(3)} > up=${res.upwindMagnitude && res.upwindMagnitude.toFixed(3)})`,
        res.downwindStronger === true
    );
    check("V18.202 (N5b) Upwind hat Restduft > 0 (minDirectional-Schwelle)", res.upwindStillHasMinScent === true);
    check("V18.202 (N6a) Empty sources array → 0", res.emptyArrayIsZero === true);
    check("V18.202 (N6b) null sources → 0 (kein Crash)", res.nullSourcesIsZero === true);
    check("V18.202 (N6c) Ungültige Source-Einträge werden gefiltert", res.invalidSourceFiltered === true);
    check(
        "V18.202 (N7) 0/negative strength wird ignoriert (kein negativer Geruch)",
        res.zeroNegStrengthIgnored === true
    );
}

// Konsolidierungs-Band: Version-Floor · die vier Foundations leben (Mana-Drain · Geruch ·
// Baum-Grammatik · R5) · alle Γ-Wellen-Anker · Avatar-Größen-Familie · Mana-Symmetrie.
async function checkBandV18209Konsolidierung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // (K1) VERSION-SYNC: AnazhRealm.VERSION = "18.216.0"
        out.versionStr = A.VERSION;
        // V18.217 — Floor (semver-Form): die Wand wandert mit jeder Welle,
        // muss aber nicht jedes Mal hier verschoben werden (Drift-Schutz).
        const vparts = String(A.VERSION || "0.0.0")
            .split(".")
            .map((s) => parseInt(s, 10) || 0);
        out.versionMatches = vparts[0] > 18 || (vparts[0] === 18 && vparts[1] >= 217);

        // (K2) Vier Foundation-Konstanten/-Helper existieren — kein Schaden
        // beim Konsolidieren (alles bleibt lauffähig):
        out.manaDrainExists = typeof r._drainMana === "function" && typeof r._canPayMana === "function";
        out.scentExists = typeof r._scentAt === "function" && typeof r._worldWindDirAt === "function";
        out.growTreeExists = typeof r._growTreeBlueprint === "function";
        out.r5Exists = !!A.R5_STRUCTURE_TEXTURE && typeof A.R5_STRUCTURE_TEXTURE.microBoost === "number";
        out.allFoundationsAlive = out.manaDrainExists && out.scentExists && out.growTreeExists && out.r5Exists;

        // (K3) Γ-BOGEN 2 KOMPLETT-Probe (alle 8 Γ-Wellen-Anker existieren):
        out.gamma4Anker = typeof window.__gelaendeCore.grossform === "function"; // K16: die Großform des Kerns (der Anker fiel)
        out.gamma6Snowband =
            typeof r._attachVoxelFieldColors === "function" &&
            /__gelaendeCore\.schnee\(/.test(window.__codeOf(r._bodenFarbeAt));
        out.gammaMStrata = typeof A.STRATA_STEIN_DEPTH === "number";
        out.gammaMLichen = !!A.LICHEN;
        out.gammaMIronBands = !!A.IRON_BANDS;
        out.gamma2Totholz = !!(r.state.blueprints && r.state.blueprints["stamm_gefallen"]);
        out.gamma1Nose = typeof r._scentAt === "function";
        out.gamma3Char = !!A.FIELD_CHARACTER;
        out.gamma7Grammar = typeof r._growTreeBlueprint === "function";
        out.gammaBogenKomplett =
            out.gamma4Anker &&
            out.gamma6Snowband &&
            out.gammaMStrata &&
            out.gammaMLichen &&
            out.gammaMIronBands &&
            out.gamma2Totholz &&
            out.gamma1Nose &&
            out.gamma3Char &&
            out.gamma7Grammar;

        // (K4) AVATAR-GRÖSSEN-Familie: die Größen-Mul (sizeHpMul/sizeSpeedMul) lebt in der EINEN Quelle
        // _applySizeMultipliersToStats; `_compoundSizeFactor`/`creatureSize` bleiben in compute*Stats →
        // beide Source-Proben lesen die geteilte Quelle mit.
        const _sizeMulSrc = window.__codeOf(r._applySizeMultipliersToStats);
        const srcCompPlayer = window.__codeOf(r.computePlayerStats) + _sizeMulSrc;
        const srcCompCreature = window.__codeOf(r.computeCreatureStats) + _sizeMulSrc;
        out.playerHpStaminaMana = /sizeHpMul/.test(srcCompPlayer);
        out.playerSpeedTrade = /sizeSpeedMul/.test(srcCompPlayer);
        out.creatureSizeSymmetry = /creatureSize/.test(srcCompCreature) && /sizeHpMul/.test(srcCompCreature);
        out.avatarFamilyKomplett = out.playerHpStaminaMana && out.playerSpeedTrade && out.creatureSizeSymmetry;

        // (K5) MANA-SYMMETRIE Foundation:
        out.manaMaxFn = typeof A.STAT_FROM_TAGS.manaMax === "function";
        out.manaRegenConst = typeof A.MANA_REGEN_PER_SEC === "number" && A.MANA_REGEN_PER_SEC > 0;

        return out;
    });

    check(`V18.209 (K1) VERSION floor ≥ 18.217.0 (gemessen ${res.versionStr})`, res.versionMatches === true);
    check(
        "V18.209 (K2) Alle vier Foundations am Leben (Mana-Drain · Geruch · Baum-Grammatik · R5)",
        res.allFoundationsAlive === true
    );
    check("V18.209 (K3) §4.A Γ-BOGEN 2 KOMPLETT (alle 8 Γ-Wellen-Anker existieren)", res.gammaBogenKomplett === true);
    check(
        "V18.209 (K4) §4.D Avatar-Größen-Familie KOMPLETT (Spieler HP/Stamina/Mana/Speed-Trade + Kreatur-Symmetrie)",
        res.avatarFamilyKomplett === true
    );
    check(
        "V18.209 (K5) §4.E Mana-Symmetrie Foundation (manaMax + MANA_REGEN_PER_SEC)",
        res.manaMaxFn && res.manaRegenConst
    );
}

module.exports = {
    checkBandV1757HeldSlot, checkBandV1761ForgeImplement, checkBandV1762ForgeMeaningful, checkBandV1763ForgeArmor,
    checkBandV1765BrewConsumable, checkBandV1766FertigenFlow, checkBandV1770WorkshopStationMark,
    checkBandV1772Library, checkBandV1773HeldMesh, checkBandV1784AvatarFormFit, checkBandWelle6DSoul,
    checkBandPhasenBF, checkBandW5Werkzeugabnutzung, checkBandV18202GeruchFeld, checkBandV18209Konsolidierung,
};
