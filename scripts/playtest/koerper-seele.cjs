"use strict";
// scripts/playtest/koerper-seele.cjs — der Richter von Koerper/seele (spec/stamm/modul-karte.json): Spieler-Seele · Stats · Boosts · Ausrüstung · Inventar.
// 15 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, ohneWurf } = require("../playtest.cjs");

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
        // die Hand ist kein Panzer — das Gerät faltet nur in die Angriffs-Größen
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

        // cleanup
        r.equipHeld(null);
        delete r.state.blueprints[wName];
        if (savedHeld) r.equipHeld(savedHeld);
        r.recomputePlayerStats();
        return out;
    });
    check("das Test-Gerät trägt härte (die Substanz-Prämisse hält)", res.implHasHardness);
    check(
        "equipHeld nimmt JEDEN Bauplan — keine Markierung nötig (kein Rollen-Schloss)",
        res.equipNoRoleNeeded
    );
    check("equipHeld lehnt einen unbekannten Bauplan ab", res.rejectsUnknown);
    check("equipHeld lehnt ein builtIn-Crafting-Tool ab (kein Welt-Gerät)", res.rejectsBuiltinTool);
    check(
        "KONSUM — ein gehaltenes hartes Gerät HEBT den Schaden (Angriff-mit-jedem-Gerät, Substanz→Profil)",
        res.heldRaisesDamage
    );
    check(
        "Welle L K-D15: die Hand ist kein Panzer — das harte Gerät lässt Verteidigung und HP unberührt (nur Angriff)",
        res.heldKeinPanzer
    );
    check("Gerät abnehmen → zurück auf die Baseline (kein Rest-Effekt)", res.unequipRestores);
    check(
        "DASSELBE Gerät treibt das Abbauen (_heldImplementBlueprint löst den held-Slot auf)",
        res.heldDrivesHarvest
    );
    check("Persistenz — der held-Slot reist im Snapshot", res.snapHasHeld);
}

// das Gerät SCHMIEDEN: F2 die Präzision moduliert das Abbauen
// (die §4.3-Rekursion schließt), F3 der Werk-Akt forgeBlueprint (Material ziehen + Präzision einfrieren +
// ausrüsten — der Spiegel von bauen). KONSUM (nicht Existenz).
async function checkBandV1761ForgeImplement(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        // ein Ein-Teil-Bauplan `name`: das Teil im Ursprung, Maß sx/sy/sz (`extra` hängt Teil-Felder wie opChain an)
        const werk = (name, shape, material, sx, sy, sz, extra) =>
            (blu[name] = {
                name,
                parts: [{ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: 0, y: 0, z: 0 }, ...extra }],
            });
        // das Inventar leer (27 freie Plätze)
        const leer = () => (p.inventory = new Array(27).fill(null));
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;

        // F2 — die Präzision moduliert die Welt-Kraft: gleiche Form/Materie, aber ein hoch-präziser
        // opChain ergibt ein stärkeres Gerät als ein grob-präziser (die Rekursion: besseres Crafting
        // → besseres Abbauen).
        werk("__f2_fine", "box", "stein", 0.8, 0.8, 0.8, { opChain: [{ cap: 0.95, op: "polish", tool: "x" }] });
        werk("__f2_rough", "box", "stein", 0.8, 0.8, 0.8, { opChain: [{ cap: 0.4, op: "knap", tool: "x" }] });
        const fineProf = r._implementProfileForBlueprint(blu.__f2_fine);
        const roughProf = r._implementProfileForBlueprint(blu.__f2_rough);
        out.precisionModulatesMine = fineProf.minePower > roughProf.minePower;

        // F3 — das Schmieden ZIEHT Material (pfad), schlägt ohne fehl
        werk("__forge_tool", "box", "stein", 0.9, 0.9, 0.9);
        r.setGameMode("pfad");
        leer();
        p.equipped.held = null;
        const forgeNoMat = r.forgeBlueprint("__forge_tool");
        out.pfadForgeRejectsWithoutMaterial = forgeNoMat.ok === false && forgeNoMat.reason === "not_enough_material";
        out.notEquippedAfterFail = p.equipped.held === null;

        // F3 — mit Material: schmiedet + KONSUMIERT + rüstet aus + friert die Präzision ein
        leer();
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
        leer();
        p.equipped.held = null;
        const forgeFree = r.forgeBlueprint("__forge_tool");
        out.schoepferForgesFree =
            forgeFree.ok === true && forgeFree.free === true && p.equipped.held === "__forge_tool";

        // cleanup
        delete blu.__f2_fine;
        delete blu.__f2_rough;
        delete blu.__forge_tool;
        p.equipped.held = savedHeld;
        leer();
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "F2 — die Praezision moduliert die Abbau-Kraft (fein > grob, gleiche Form/Materie; die Rekursion schliesst)",
        res.precisionModulatesMine
    );
    check(
        "F3 — schmieden in pfad OHNE Material → abgelehnt (not_enough_material) + nicht ausgeruestet",
        res.pfadForgeRejectsWithoutMaterial && res.notEquippedAfterFail
    );
    check(
        "F3 KONSUM — schmieden in pfad MIT Material → erfolg + verbraucht Material + ausgeruestet",
        res.pfadForgeSucceeds && res.pfadForgeConsumes && res.forgeEquips
    );
    check("F3 — schmieden friert die Praezision ein (forgedPrecision gesetzt)", res.forgeFreezesPrecision);
    check("F3 — schoepfer schmiedet frei (ohne Material) + ruestet aus", res.schoepferForgesFree);
}

// der Schmiede-Akt wird BEDEUTSAM: der Spieler-Equip-Pfad (wieldBlueprint)
// geht durch das Schmieden — ein ungeschmiedetes Geraet in pfad/frieden kostet (schmieden), ein
// geschmiedetes (forgedPrecision, persistiert) ist frei in die Hand zu nehmen. Heilt den Gratis-Bypass.
async function checkBandV1762ForgeMeaningful(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        // das Inventar leer (27 freie Plätze)
        const leer = () => (p.inventory = new Array(27).fill(null));
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;

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
        leer();
        p.equipped.held = null;
        const wieldNoMat = r.wieldBlueprint("__wield_tool");
        out.pfadWieldRejectsUnforged =
            wieldNoMat.ok === false && wieldNoMat.reason === "not_enough_material" && p.equipped.held === null;

        // (4) wield UNgeschmiedet in pfad MIT Material → SCHMIEDET (zahlt + rüstet aus + friert ein)
        leer();
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
        leer();
        const wieldForged = r.wieldBlueprint("__wield_tool");
        out.pfadWieldForgedIsFree = wieldForged.ok === true && p.equipped.held === "__wield_tool";

        // (6) wield UNgeschmiedet in schöpfer → FREI (Gott-Modus, kein Schmieden nötig)
        delete blu.__wield_tool.forgedPrecision;
        r.setGameMode("schöpfer");
        p.equipped.held = null;
        leer();
        const wieldSchoepfer = r.wieldBlueprint("__wield_tool");
        out.schoepferWieldsFree =
            wieldSchoepfer.ok === true &&
            p.equipped.held === "__wield_tool" &&
            !Number.isFinite(blu.__wield_tool.forgedPrecision);

        // cleanup
        delete blu.__wield_persist;
        delete blu.__wield_tool;
        p.equipped.held = savedHeld;
        leer();
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "forgedPrecision persistiert (serialize → deserialize; geschmiedet bleibt geschmiedet)",
        res.forgedPrecisionPersists
    );
    check(
        "DER HEAL — ein UNgeschmiedetes Geraet in pfad OHNE Material in die Hand → abgelehnt (schmieden noetig, nicht gratis)",
        res.pfadWieldRejectsUnforged
    );
    check(
        "KONSUM — ein ungeschmiedetes in pfad MIT Material in die Hand → SCHMIEDET (zahlt + ruestet aus + friert ein)",
        res.pfadWieldForgesUnforged
    );
    check(
        "GEBRAUCH frei — ein GESCHMIEDETES Geraet in die Hand nehmen kostet NICHTS (leeres Inventar, trotzdem ok)",
        res.pfadWieldForgedIsFree
    );
    check(
        "schoepfer nimmt ungeschmiedet frei in die Hand (Gott-Modus, kein Schmieden)",
        res.schoepferWieldsFree
    );
}

// Rüstung schmieden/weben: derselbe WERK-Kern (_forgeMaterialAndFreeze) wie
// das Gerät, in den armor-Slot; wearArmor ist der Spieler-Pfad (forge-wenn-ungemacht), fertigeBlueprint
// routet nach Rolle. KONSUM (nicht Existenz).
async function checkBandV1763ForgeArmor(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        // ein Ein-Teil-Bauplan `name`: das Teil im Ursprung, Maß sx/sy/sz (`extra` hängt Teil-Felder wie opChain an)
        const werk = (name, shape, material, sx, sy, sz, extra) =>
            (blu[name] = {
                name,
                parts: [{ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: 0, y: 0, z: 0 }, ...extra }],
            });
        // das Inventar leer (27 freie Plätze)
        const leer = () => (p.inventory = new Array(27).fill(null));
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const savedHeld = p.equipped.held;
        const savedArmor = p.equipped.armor;

        // ein dichtes Rüstungs-Compound (stein → dichte+härte = Schutz)
        werk("__arm", "box", "stein", 1.2, 1.4, 0.4);

        // (2) forgeArmor verlangt role="armor"
        r.setGameMode("schöpfer");
        const armNoRole = r.forgeArmor("__arm");
        out.forgeArmorRequiresRole = armNoRole.ok === false && armNoRole.reason === "not_marked_as_armor";
        r.setBlueprintAsArmor("__arm");
        out.markedArmor = blu.__arm.role === "armor";

        // (3) forgeArmor in pfad OHNE Material → abgelehnt + nicht getragen
        r.setGameMode("pfad");
        leer();
        p.equipped.armor = null;
        const armNoMat = r.forgeArmor("__arm");
        out.pfadArmorRejectsWithoutMaterial =
            armNoMat.ok === false && armNoMat.reason === "not_enough_material" && p.equipped.armor === null;

        // (4) forgeArmor in pfad MIT Material → webt (zahlt + trägt + friert ein)
        leer();
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
        leer();
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
        werk("__geraet", "box", "stein", 0.15, 1.2, 0.15);
        const fertHeld = r.fertigeBlueprint("__geraet");
        out.fertigeGeraetToHeldSlot = fertHeld.ok === true && p.equipped.held === "__geraet";

        // (7) forgeBlueprint funktioniert nach dem Refactor noch (zahlt + held)
        r.setGameMode("pfad");
        leer();
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
        leer();
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "forgeArmor verlangt einen als Ruestung markierten Bauplan (sonst not_marked_as_armor)",
        res.forgeArmorRequiresRole && res.markedArmor
    );
    check(
        "forgeArmor in pfad OHNE Material → abgelehnt + nicht getragen",
        res.pfadArmorRejectsWithoutMaterial
    );
    check(
        "KONSUM — forgeArmor in pfad MIT Material → webt (zahlt + traegt + friert ein)",
        res.pfadArmorForges
    );
    check(
        "GEBRAUCH frei — eine gemachte Ruestung tragen kostet nichts (leeres Inventar)",
        res.wearMadeArmorFree
    );
    check(
        "fertigeBlueprint routet nach Rolle (Ruestung → armor-Slot, Geraet → held-Slot)",
        res.fertigeArmorToArmorSlot && res.fertigeGeraetToHeldSlot
    );
    check(
        "forgeBlueprint funktioniert nach dem Refactor noch (zahlt + in die Hand)",
        res.forgeBlueprintStillWorks
    );
}

// Trank brauen: der Werk-Akt zieht die Zutaten (die
// Material-Kosten des Konsumable-Bauplans) durchs Mach-Tor, dann wirkt der Trank. Heilt den ∞-Gratis-Boost.
// activateConsumable bleibt das freie Low-Level-Primitiv. KONSUM (nicht Existenz).
async function checkBandV1765BrewConsumable(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const p = r.state.player;
        // ein Ein-Teil-Bauplan `name`: das Teil im Ursprung, Maß sx/sy/sz (`extra` hängt Teil-Felder wie opChain an)
        const werk = (name, shape, material, sx, sy, sz, extra) =>
            (blu[name] = {
                name,
                parts: [{ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: 0, y: 0, z: 0 }, ...extra }],
            });
        // das Inventar leer (27 freie Plätze)
        const leer = () => (p.inventory = new Array(27).fill(null));
        const savedMode = r.getGameMode();

        werk("__trank", "sphere", "stein", 0.5, 0.5, 0.5);
        r.setBlueprintAsConsumable("__trank", 30, "Test-Trank", 0.2);
        out.markedConsumable = blu.__trank.role === "consumable";
        werk("__nottrank", "box", "stein", 0.5, 0.5, 0.5);

        // (2) brewConsumable verlangt role="consumable"
        r.setGameMode("schöpfer");
        const brewNoRole = r.brewConsumable("__nottrank");
        out.brewRequiresConsumable = brewNoRole.ok === false && brewNoRole.reason === "not_a_consumable";

        // (3) brewConsumable in pfad OHNE Zutaten → abgelehnt
        r.setGameMode("pfad");
        leer();
        const brewNoMat = r.brewConsumable("__trank");
        out.pfadBrewRejectsWithoutMaterial = brewNoMat.ok === false && brewNoMat.reason === "not_enough_material";

        // (4) brewConsumable in pfad MIT Zutaten → braut (zieht Material + der Trank wirkt)
        leer();
        r.addMaterialToInventory("stein", 200);
        const steinBefore = p.inventory[0].count;
        const brewOk = r.brewConsumable("__trank");
        const steinAfter = p.inventory[0] ? p.inventory[0].count : 0;
        out.pfadBrewConsumesAndWorks = brewOk.ok === true && steinBefore > steinAfter;

        // (5) activateConsumable bleibt FREI (Low-Level): wirkt mit leerem Inventar (zieht kein Material)
        leer();
        const actDirect = r.activateConsumable("__trank");
        out.activateStillFree = actDirect.ok === true;

        // (6) brewConsumable frei in schöpfer
        r.setGameMode("schöpfer");
        leer();
        const brewSchoepfer = r.brewConsumable("__trank");
        out.schoepferBrewsFree = brewSchoepfer.ok === true && brewSchoepfer.free === true;

        // (7) fertigeBlueprint routet consumable → brewConsumable (Brau-Ablehnung, nicht Gerät-Schmieden)
        r.setGameMode("pfad");
        leer();
        const fertNoMat = r.fertigeBlueprint("__trank");
        out.fertigeRoutesConsumable = fertNoMat.ok === false && fertNoMat.reason === "not_enough_material";

        // cleanup
        delete blu.__trank;
        delete blu.__nottrank;
        leer();
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "brewConsumable verlangt role=consumable (sonst not_a_consumable)",
        res.brewRequiresConsumable && res.markedConsumable
    );
    check("brauen in pfad OHNE Zutaten → abgelehnt (kein Trank)", res.pfadBrewRejectsWithoutMaterial);
    check(
        "KONSUM — brauen in pfad MIT Zutaten → zieht Material + der Trank wirkt",
        res.pfadBrewConsumesAndWorks
    );
    check(
        "activateConsumable bleibt das freie Low-Level-Primitiv (wirkt ohne Material)",
        res.activateStillFree
    );
    check("schoepfer braut frei (ohne Zutaten)", res.schoepferBrewsFree);
    check(
        "fertigeBlueprint routet consumable → brewConsumable (Brau-Ablehnung, nicht Geraet)",
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
        // ein Ein-Teil-Bauplan `name`: das Teil im Ursprung, Maß sx/sy/sz (`extra` hängt Teil-Felder wie opChain an)
        const werk = (name, shape, material, sx, sy, sz, extra) =>
            (blu[name] = {
                name,
                parts: [{ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: 0, y: 0, z: 0 }, ...extra }],
            });
        // das Inventar leer (27 freie Plätze)
        const leer = () => (p.inventory = new Array(27).fill(null));
        const savedMode = r.getGameMode();
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const savedArch = r.state.architectures.slice();
        // FERTIGEN rüstet das geschmiedete Werk aus (equipped.held/armor) — sauber zurücksetzen, sonst
        // zeigt eine spätere Band einen baumelnden Held (gelöschter Bauplan).
        const savedEquipped = p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : null;


        // === ein DOMAIN-tragendes forging-Geraet vorbereiten (schoepfer = kein Stamina-Zug). EIN
        // eisen-Part (Einzel-Material → die Kosten sind eindeutig eisen) + ein schmiede-hammer-Op
        // (forging-Domain). ===
        r.setGameMode("schöpfer");
        if (blu.__s7_forge) delete blu.__s7_forge;
        werk("__s7_forge", "box", "eisen", 0.2, 1.6, 0.2);
        // die Domain-Werkzeuge sind nicht mehr Starter (die Werkstatt ist der Prozess); für den
        // direkten applyOpToPart-Test (Domain-Logik) leihen wir das Werkzeug aus der Op-Bibliothek.
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        r.applyOpToPart("__s7_forge", 0, "schmiede-hammer");
        out.forgeHasDomain = r.computeBlueprintDomain(blu.__s7_forge) === "forging";

        // === (b) DAS MASCHINE-GATE — pfad + forging-domain + KEINE Esse → no_workshop_station ===
        r.setGameMode("pfad");
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
        leer();
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
        werk("__s7_plain", "box", "stein", 0.2, 1.8, 0.2);
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
        leer();
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
        leer();
        p.equipped = savedEquipped;
        r.recomputePlayerStats();
        r.setGameMode(savedMode);
        return out;
    });
    check("das forging-Geraet traegt die Domain (Voraussetzung fuers Maschine-Gate)", res.forgeHasDomain);
    check(
        "(b) DAS MASCHINE-GATE — pfad + forging ohne Esse → no_workshop_station (Domain gemeldet + Material bleibt)",
        res.pfadNoStationRejects && res.noStationReportsDomain && res.noStationKeepsMaterial
    );
    check(
        "KONSUM — Esse beim Spieler → FERTIGEN gelingt + zieht Material (end-to-end, nicht nur confirmBuild)",
        res.pfadWithStationMakes
    );
    check(
        "ein domain-loses Geraet braucht KEINE Station (das Gate ist transparent — darum brechen die S3-S6-Bands nicht)",
        res.domainlessNeedsNoStation
    );
    check("frieden/schoepfer ueberspringen die Station (forging ohne Esse → ok)", res.schoepferSkipsStation);
    check(
        "KONSUM — die FERTIGEN-Zeile rendert ins DOM; eine Station-Rolle (esse) rendert KEINE (Guard)",
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
        // ein Ein-Teil-Bauplan `name`: das Teil im Ursprung, Maß sx/sy/sz (`extra` hängt Teil-Felder wie opChain an)
        const werk = (name, shape, material, sx, sy, sz, extra) =>
            (blu[name] = {
                name,
                parts: [{ shape, material, size: { x: sx, y: sy, z: sz }, position: { x: 0, y: 0, z: 0 }, ...extra }],
            });
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const savedArch = r.state.architectures.slice();
        const savedMode = r.getGameMode();

        // ein eigener Apparat: ein Quarz-Gefäß (durchsichtig → alchemy-Domäne, R1)
        if (blu.__ws_vessel) delete blu.__ws_vessel;
        werk("__ws_vessel", "sphere", "quarz", 1, 1, 1);
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
        werk("__ws_forge", "box", "eisen", 1, 1, 1);
        r.setBlueprintAsWorkshopStation("__ws_forge");
        out.forgeStationDomain = r._computeWorkshopDomain(blu.__ws_forge) === "forging"; // eisen-Masse → forging (emergent)
        if (blu.__ws_work) delete blu.__ws_work;
        werk("__ws_work", "box", "eisen", 0.8, 0.8, 0.8);
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
        werk("__ws_dsl", "box", "stein", 1, 1, 1);
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
    check(
        "die Markierung setzt role=workshop-station + roleManual (der Intent-Override); vorher emergiert der Apparat NICHT als Werkstatt",
        res.markSetsRole && res.notStationBeforeMark
    );
    check(
        "KONSUM — die bediente Domäne EMERGIERT aus der Substanz (Quarz-Gefäß → alchemy via R1), nicht deklariert",
        res.domainEmerges
    );
    check(
        "Built-in (esse) + unbekannt werden abgelehnt (Saat unantastbar)",
        res.rejectsBuiltin && res.rejectsUnknown
    );
    check(
        "end-to-end — ein vom SPIELER gebauter, markierter Apparat bedient das Werkstatt-Gate (ein alchemy-Werk passt zu ihm)",
        res.forgeStationDomain && res.workIsForging && res.playerStationServes
    );
    check("der DSL-Op set_workshop_station markiert (Spiegel von set_armor_role)", res.dslMarks);
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
        //     Snapshot des Player-States, danach restauriert.
        const savedMode = r.getGameMode();
        const savedEquip = p && p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : { held: null, armor: null };
        const savedBoosts = p && Array.isArray(p.boosts) ? p.boosts.slice() : [];
        const savedSoul = (p && p.soul) || "mensch";
        r.setGameMode("schöpfer");

        const fg = r.fertigeBlueprint("_t_v1772");
        out.geraetForged = fg.ok === true && p.equipped.held === "_t_v1772";
        const fa = r.fertigeBlueprint("ruestung_brustpanzer");
        out.armorForged = fa.ok === true && p.equipped.armor === "ruestung_brustpanzer";
        const ft = r.fertigeBlueprint("trank_lebenssaft");
        out.trankBrewed = ft.ok === true; // brewConsumable → activateConsumable → Boost
        const fv = r.fertigeBlueprint("koerper_human");
        out.avatarEmbodied = fv.ok === true;

        // restore — kein dangling Held/Soul/Boost für die nächsten Bands
        r.setGameMode(savedMode);
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
        r.recomputePlayerStats();
        return out;
    });
    check(
        "die drei Bibliotheks-Built-ins (Rüstung/Trank/Avatar) + die Geräte-Substanz (KIND_SUBSTANCE) existieren",
        res.allExist
    );
    check(
        "die Rollen sind deklariert — Gerät rollenlos (gehalten, W2-B), Rüstung/Trank/Avatar = armor/consumable/soul",
        res.rolesDeclared
    );
    check(
        "A1 SUBSTANZ-EHRLICH: der Trank resoniert consumable + der Avatar soul (body-shaped) — ein Spieler-Klon emergierte zur selben Rolle",
        res.trankHonest && res.avatarHonest
    );
    check(
        "A1 / V17.83 U4: die Rüstungs-Platte (stumpf) → Bauwerk (armor-Rolle = Intent-Override, V17.70); die Spitzhacke (spitz+gestreckt) → Gerät AUS DER FORM (U4 trennt Klinge vom Bauwerk)",
        res.armorIsTwin && res.geraetIsImplement
    );
    check(
        "das Role-GATE beißt — forgeArmor/brewConsumable/forgeAvatar lehnen das rollenlose Gerät ab",
        res.armorGate && res.brewGate && res.avatarGate
    );
    check(
        "kein Worldgen-Litter — die vier sind deliberate Items (kein instanced-Flag, nicht in der Spawn-Kandidatenliste)",
        res.noLitter
    );
    check(
        "A1 KONSUM: die vier Mach-Akte FEUERN rollen-gerecht — fertigeBlueprint schmiedet Gerät (held) + webt Rüstung (armor) + braut Trank + formt Avatar",
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
        r.recomputePlayerStats();
        return out;
    });
    check(
        "Hand-Mesh — Spieler-Mesh da + sauberer Start (kein Held-Mesh nach equipHeld(null))",
        res.hasPlayerMesh && res.startNoMesh
    );
    check(
        "ein Geräte-Bauplan (Spitzhacken-Substanz aus KIND_SUBSTANCE) erzeugt ein Hand-Mesh, an den Avatar geparentet (Arm/Flügel/Wurzel)",
        res.equipOk && res.meshBuilt && res.parented && res.onAnchor
    );
    check("das Hand-Mesh ist auf greifbare Hand-Größe skaliert (0 < scale ≤ maxScale)", res.scaled);
    check(
        "Equip-Wechsel tauscht das Mesh (neues Objekt) + das alte ist aus dem Szenen-Graph (kein Leak)",
        res.swapped && res.oldDetached
    );
    check("ablegen (equipHeld(null)) entfernt das Hand-Mesh", res.unequipNoMesh);
    check(
        "ein formloses builtIn-Crafting-Tool (schmiede-hammer) wird abgelehnt → kein Hand-Mesh (die Werkstatt-Schicht bleibt getrennt)",
        res.toolRejected && res.toolNoMesh
    );
    check(
        "S9 KONSUM: Körper-Wechsel (applyPlayerSoul) re-attached das Hand-Mesh am NEUEN Avatar (Restore-/Seelen-sicher)",
        res.reattached && res.reattachedNewBody
    );
}

// die FORM in die WIRKUNG für den AVATAR: ein gut geformter Custom-
// Avatar (körper-förmig, symmetrisch) wirkt stärker als ein Klumpen (die soul-Resonanz liest die bodyParts-
// Form). NUR Custom-Avatare — die Built-in-Seele (human) bleibt neutral (kein Balance-Bruch).
async function checkBandV1784AvatarFormFit(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        // ein Teil-Literal: Form, Stoff, Lage x/y/z, Maß x/y/z — dieselbe Feld-Folge, je Ruf ein frisches Objekt
        const teil = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        const round = (x) => Math.round((x || 0) * 1000) / 1000;
        const p = r.state.player;
        const out = {};
        const bodyParts = [
            teil("box", "fleisch", 0, 1.2, 0, 0.9, 1.6, 0.5),
            teil("cylinder", "fleisch", -0.95, 1.1, 0, 0.3, 1.3, 0.3),
            teil("cylinder", "fleisch", 0.95, 1.1, 0, 0.3, 1.3, 0.3),
            teil("cylinder", "fleisch", -0.4, 0, 0, 0.35, 1.2, 0.35),
            teil("cylinder", "fleisch", 0.4, 0, 0, 0.35, 1.2, 0.35),
        ];
        const blobParts = [teil("box", "fleisch", 0, 0, 0, 1.5, 1.5, 1.5)];
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
        r.recomputePlayerStats();
        return out;
    });
    check(
        "der Gate — eine Built-in-Seele bleibt neutral (in playerSoulDefs, soulFit 1.0), ein Custom-Avatar bekommt die Form-Passung",
        res.builtinGate
    );
    check(
        "die soul-Passung diskriminiert über die FORM — ein körper-förmiger Avatar > ein Klumpen (gleiches Material)",
        res.soulDiscriminates && res.bodyShaped,
        res.soulVals
    );
    check(
        "U6 KONSUM: ein körper-förmiger Custom-Avatar hat höhere Basis-Stats als ein Klumpen-Avatar — die FORM erreicht die Avatar-Wirkung",
        res.konsum,
        res.konsumVals
    );
}

async function checkBandWelle6DSoul(ctx) {
    const { page, check, errors, finalState } = ctx;
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
        out.statKeys = Object.keys(C.STAT_FROM_TAGS).sort().join(",");
        // die flache renderPlayerStatsUI ist durch das Daten-Viz-Spec-Sheet ersetzt.

        // Seele = Bauplan aus Körper-Teilen
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
            // das Kampf-Trio fließt durch DIESELBE Pipeline.
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
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal: der Sprint-Faktor wohnt im koerper-Gesetz
        // (fx.bewegung.sprintMul); ein kalter Kern wirft laut — kein Literal fährt als Zwilling (das Spiel liest ihn
        // fail-closed, `_sprintMulGesetz`).
        const sprintMul6d = globalThis.__koerperCore.PRESETS.mensch.fx.bewegung.sprintMul;
        out.stateSprintIsDoubleSpeed = Math.abs(r.state.sprintSpeed - humanStats.speed * sprintMul6d) < 1e-9;
        out.statePlayerStatsCached = r.state.player.stats && r.state.player.stats.hpMax === humanStats.hpMax;
        // K27 — die Lebenswerte sind ZUSTAND: die Wandlung (applyPlayerSoul) füllt sie; dass eine Neuberechnung nur klemmt
        // (verwundet bleibt verwundet), urteilt gate:kampf-gefuehl T27 an jedem Rufer im Modus pfad (S11 die heilende Hülle).
        const pl6d = r.state.player;
        out.statePlayerHasHpAndStamina =
            typeof pl6d.hp === "number" &&
            typeof pl6d.hpMax === "number" &&
            typeof pl6d.stamina === "number" &&
            typeof pl6d.staminaMax === "number" &&
            pl6d.hp === pl6d.hpMax &&
            pl6d.stamina === pl6d.staminaMax;
        // Restore
        r.applyPlayerSoul(savedSoul);
        r.recomputePlayerStats();

        // UI im DOM (Ich-F — das Selbst-Spec-Sheet #ich-stage-spec ersetzt die flache #player-stats-Liste)
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
    // (1) WASD-Mapping · (2) „damage X“ als Chat-Pattern · (3) Aura-Absenz · (4) Tod und Wunde: gate:kampf-gefuehl Q13
    // · (5) Werkzeug-Anwendung kostet Stamina · (6) Konsumables aus Compound-Tags.
    const reflexResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        // ein Teil-Literal: Form, Stoff, Lage x/y/z, Maß x/y/z — dieselbe Feld-Folge, je Ruf ein frisches Objekt
        const teil = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        if (!r) return null;
        const out = {};

        // (2) Chat-Pattern für damage
        const dmgPattern = r.parseChatToDsl("schade mir 42");
        out.damageChatParses =
            dmgPattern && dmgPattern.program && dmgPattern.program[0] === "damage" && dmgPattern.program[1] === 42;
        const trinkPattern = r.parseChatToDsl("trink trank_lichts");
        out.trinkChatParses = trinkPattern && trinkPattern.program[0] === "apply_boost";
        const ruestePattern = r.parseChatToDsl("rüste werkzeug hammer");
        out.ruesteChatParses = ruestePattern && ruestePattern.program[0] === "equip_tool";

        // (3) Die Avatar-Aura ist gefallen (ihre Namen bewacht gate:altlasten): eine aura-Nachricht eines Alt-Peers ist
        // ein UNBEKANNTER Typ, der Dispatcher verwirft sie still (kein Crash, kein Handler, kein State).
        r.applyPlayerSoul("human");
        out.auraStubTolerant = (() => {
            try {
                r.p2pHandleMessage(JSON.stringify({ type: "aura", peerId: "fremd-alt-peer", hue: 12, intensity: 1 }));
                return true;
            } catch {
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
        r.dslRun(["player_speed", r._koerperGesetzBand("speed").max], { source: "test" });
        out.speedAfterDsl = r.state.speed;
        out.sprintAfterDsl = r.state.sprintSpeed;
        // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal: der Sprint-Faktor kommt aus dem koerper-Gesetz
        // (fx.bewegung.sprintMul); ein kalter Kern wirft laut, kein Literal fährt als Zwilling.
        const bewGesetzReflex = globalThis.__koerperCore.PRESETS.mensch.fx.bewegung;
        out.sprintFollowsSpeed = Math.abs(r.state.sprintSpeed - r.state.speed * bewGesetzReflex.sprintMul) < 1e-9;
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
        // Mensch ist „balanced“ (niedrige magieleitung, dichte clamped auf 1) ⇒ speed ≥ LEBENDE
        // Gesetz-Base (fx.bewegung.speed.base) — gesetz-relativ, kein Arcade-Literal.
        const speedBaseReflex = bewGesetzReflex.speed.base;
        out.humanSpeedBase = speedBaseReflex;
        out.humanSpeedRaised = humanResult.stats.speed >= speedBaseReflex - 1e-9;

        // (4) Tod und Wunde misst gate:kampf-gefuehl Q13 am Biss des Wolfs (Rückkehr, Gnade, Lebens-Spur, die Wunde senkt hpMax,
        // der Vitals-Takt heilt sie)

        // (5) Werkzeug-Kosten: applyOpToPart braucht Stamina
        r.state.player.deathWoundIntensity = 0;
        r.applyPlayerSoul("human"); // reset Stats inkl. Stamina-max
        // Setup: einen eigenen Bauplan mit einem Part + Spieler besitzt hammer
        // Stamina-Tests laufen im pfad-Modus
        // (Default frieden überspringt Stamina-Kosten).
        r.setGameMode("pfad");
        r.state.blueprints.wound_test_bp = {
            name: "wound_test_bp",
            label: "Test",
            builtIn: false,
            // eisen akzeptiert plastic-Op (hammer-Klasse); stein nur subtractive.
            parts: [teil("box", "eisen", 0, 0, 0, 1, 1, 1)],
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
                teil("helix", "quarz", 0, 0, 0, 0.3, 0.5, 2),
                teil("sphere", "glut", 0, 0.5, 0, 0.2, 0.2, 0.2),
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

    if (ohneWurf(check, "Reflex-Tests Block lief ohne Exception", reflexResults, true)) {
        // (2) Chat
        check("Reflex 2: 'schade mir 42' chat-pattern → DSL ['damage', 42, ...]", reflexResults.damageChatParses);
        check("Reflex 2: 'trink X' chat-pattern → DSL ['apply_boost', ...]", reflexResults.trinkChatParses);
        check("Reflex 2: 'rüste werkzeug X' chat-pattern → DSL ['equip_tool', ...]", reflexResults.ruesteChatParses);
        check(
            "Reflex 3 (NULL): aura ist dem Dispatcher unbekannt und wird still verworfen",
            reflexResults.auraStubTolerant
        );
        check("Reflex 3: Alter Boden-Torus-Ring entfernt", reflexResults.boundsRingRemoved);
        check("Reflex 3 V18.105: der Glow-Sprite ist GESCHNITTEN (Schöpfer-Sign-off)", reflexResults.glowSpriteGone);
        // Drache-Orientierung: KEIN
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
        // (5) Werkzeug-Kosten
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
    }

    // ### Welle 6.D Etappe 3b — Equipment + Aura ###
    const wave6d3bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        // ein Teil-Literal: Form, Stoff, Lage x/y/z, Maß x/y/z — dieselbe Feld-Folge, je Ruf ein frisches Objekt
        const teil = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        // Konstanten + Methoden
        out.armorWeight03 = Math.abs(C.ARMOR_STAT_WEIGHT - 0.3) < 0.001;
        out.toolWeight015 = Math.abs(C.TOOL_STAT_WEIGHT - 0.15) < 0.001;
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
                teil("box", "eisen", 0, 0, 0, 1, 1, 1),
                teil("box", "eisen", 0, 1, 0, 1, 1, 1),
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
            parts: [teil("box", "stein", 0, 0, 0, 1, 1, 1)],
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

        // ein builtIn-Crafting-Tool (schmiede-hammer) ist KEIN Welt-Gerät → equipHeld lehnt es
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

        // Cleanup
        r.equipArmor(null);
        r.equipTool(null);
        delete r.state.blueprints.test_armor_eisen;
        delete r.state.blueprints.test_plain;
        r.applyPlayerSoul(savedSoul);

        return out;
    });

    if (ohneWurf(check, "Welle 6.D Etappe 3b: Test-Block lief ohne Exception", wave6d3bResults, true)) {
        check("Welle 6.D Etappe 3b: ARMOR_STAT_WEIGHT == 0.3", wave6d3bResults.armorWeight03);
        check("Welle 6.D Etappe 3b: TOOL_STAT_WEIGHT == 0.15", wave6d3bResults.toolWeight015);
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
            "equipHeld lehnt ein builtIn-Crafting-Tool ab (kein Welt-Gerät)",
            wave6d3bResults.equipBuiltinToolOk
        );
        check(
            "nach der Ablehnung ist nichts gehalten (equipped.held leer)",
            wave6d3bResults.equippedToolIs
        );
        check(
            "das abgelehnte builtIn-Tool ließ die Stats unberührt (ok)",
            wave6d3bResults.builtinToolNoStatChange
        );
        check(
            "Welle 6.D Etappe 3b: buildStateSnapshot persistiert playerEquipped (held)",
            wave6d3bResults.snapHasEquipped
        );
    }

    // ### Welle 6.D Etappe 3a — Tod, Min-Regel-Hybrid, Konsumables ###
    const wave6d3aResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        // Tests für Tod/Stamina/Phönix laufen im pfad-
        // Modus (Default frieden blockiert sonst Schaden + Stamina).
        r.setGameMode("pfad");

        // --- Schaden (der Tod — Rückkehr am Anker, Gnade, Trauer, Journal, Doppelt-Tod-Schutz — misst gate:kampf-gefuehl Q13
        // am Biss des Wolfs) ---
        out.damageOpInNonBroadcast = C.NON_BROADCASTABLE_OPS.has("damage");

        // Setup
        const savedSoul = r.state.player.soul;
        if (savedSoul !== "human") r.applyPlayerSoul("human");
        r.state.player.respawnGraceUntil = -Infinity;

        // Heat-Quelle: heatResist (Mensch hat ~0.22) dämpft
        const hpAfterHeat = r.state.player.hp;
        r.damagePlayer(20, "fire-test");
        const hpDelta = hpAfterHeat - r.state.player.hp;
        out.heatResistReducesDamage = hpDelta < 20 - 1;

        // die Ausdauer im Vitals-Takt misst gate:kampf-gefuehl Q13 nach der Rückkehr

        // Reset
        r.state.player.respawnGraceUntil = -Infinity;
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

    if (ohneWurf(check, "Welle 6.D Etappe 3a: Test-Block lief ohne Exception", wave6d3aResults, true)) {
        // Schaden
        check(
            "Welle 6.D Etappe 3a: damage-Op in NON_BROADCASTABLE_OPS (privat)",
            wave6d3aResults.damageOpInNonBroadcast
        );
        check("Welle 6.D Etappe 3a: heatResist dämpft Feuer-Schaden", wave6d3aResults.heatResistReducesDamage);
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
    }

    // ### Boosts (temporäre Tag-Deltas) ###
    // state.player.boosts ist ein Array; tickPlayerBoosts filtert Abgelaufene + triggert Emotion +
    // Resonance 1×/s; computePlayerStats addiert aktive Deltas vor der Stat-Berechnung.
    const wave6d2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        // ein Teil-Literal: Form, Stoff, Lage x/y/z, Maß x/y/z — dieselbe Feld-Folge, je Ruf ein frisches Objekt
        const teil = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        if (!r) return null;
        const C = typeof AnazhRealm !== "undefined" ? AnazhRealm : r.constructor;
        const out = {};
        out.hasBoostsField = Array.isArray(r.state.player.boosts);
        out.hasEmotionMap = C.BOOST_EMOTION_TAG && typeof C.BOOST_EMOTION_TAG === "object";
        out.emotionAxisCount = C.BOOST_EMOTION_TAG ? Object.keys(C.BOOST_EMOTION_TAG).length : 0;

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
                teil("helix", "quarz", 1, 0, 0, 0.5, 1, 3),
                teil("helix", "quarz", 0, 0, 1, 0.5, 1, 3),
                teil("helix", "quarz", -1, 0, 0, 0.5, 1, 3),
                teil("helix", "quarz", 0, 0, -1, 0.5, 1, 3),
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

    if (ohneWurf(check, "Welle 6.D Etappe 2: Test-Block lief ohne Exception", wave6d2Results, true)) {
        check("Welle 6.D Etappe 2: state.player.boosts ist Array", wave6d2Results.hasBoostsField);
        check(
            "Welle 6.D Etappe 2: BOOST_EMOTION_TAG-Map mit 6 Emotionen",
            wave6d2Results.hasEmotionMap && wave6d2Results.emotionAxisCount === 6
        );
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
    }

    // ### Custom-Seelen via DSL ###
    // define_soul(name, bodyParts) komponiert eigene Charaktere — Form × Material über dieselbe
    // Hylomorphismus-Pipe wie Bauwerke.
    const wave6d16Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        // ein Teil-Literal: Form, Stoff, Lage x/y/z, Maß x/y/z — dieselbe Feld-Folge, je Ruf ein frisches Objekt
        const teil = (shape, material, x, y, z, sx, sy, sz) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
        });
        if (!r) return null;
        const out = {};
        out.customSoulsContainerExists = r.state.customSouls && typeof r.state.customSouls === "object";

        // define_soul über dslRun
        const beforeCount = Object.keys(r.state.customSouls || {}).length;
        const testParts = [
            teil("box", "knochen", 0, 0, 0, 0.5, 1.0, 0.4),
            teil("helix", "quarz", 0, 0.6, 0, 0.3, 0.6, 2),
            teil("sphere", "glut", 0, 0.3, 0, 0.25, 0.25, 0.25),
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
        r._refreshSoulSelect();
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
        r._refreshSoulSelect();

        return out;
    });

    // ### Welle 6.D Etappe 1.7 — Visueller Avatar-Editor ###
    const wave6d17Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // der Ich-Soul-Editor ist geschnitten; die Seelen-Schöpfung lebt in der Werkstatt
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
        // dynamisch gegen die def-Länge —
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

    if (ohneWurf(check, "Welle 6.D Etappe 1.7: Test-Block lief ohne Exception", wave6d17Results, true)) {
        check(
            "Ich-H: der parallele Ich-Soul-Editor ist geschnitten (Schöpfung in der Werkstatt)",
            wave6d17Results.ichSoulEditorGone
        );
        check("Ich-H: soulToBlueprint holt einen Built-in-Körper in die Werkstatt (ok)", wave6d17Results.s2bOk);
        check(
            "Ich-H: der geholte Körper ist ein role:soul-Bauplan mit allen 4 Teilen (Avatare-in-Werkstatt)",
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
        check(
            // STAT_FROM_TAGS wuchs um 3 Kombat-Stats (knockback,
            // attackSpeed, defense). V18.196 Mana-Symmetrie fügt manaMax hinzu.
            // Die feste Satz-Assertion wandert mit.
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
            "Welle 6.D + K27: hp, hpMax, stamina, staminaMax existieren; die Wandlung füllt",
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

// PHASEN B–F — die Kern-KONSUM-Beweise des Phasen-Zugs.
async function checkBandPhasenBF(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(async () => {
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
        // D4 — DAS TEMPERAMENT DER GATTUNG: die Tiere sind tag-gleich (Lehre 8), das Gemüt kommt aus Ernährung der
        // Gattung und der EINEN Masse des Leibs (tetrapoda temperamentDerGattung, `_leibMasse` in kg) — Hirsch scheu,
        // Wolf wild, Bär wehrhaft, Fuchs scheu; die Größe verschiebt es (ein Koloss-Hirsch wehrt sich, ein kleiner Bär
        // ist sanft). Die Substanz-Signaturen fielen. Gefragt wird ein gegossener Leib (die Masse ist das Volumen
        // seiner Gestalt), fern des Spielers, danach entfernt. Die Bühne hält Platz für je ein Probe-Wesen: die
        // Obergrenze, die die Bänder davor füllten, urteilt nie mit.
        const cap4 = r.state.maxCreatures;
        r.state.maxCreatures = r.state.creatures.length + 1;
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
        // KONSUM: der Treffer liest das Temperament (die Flucht-Dauer je fleeMul beweist gate:kreatur-leben am Verhalten);
        // sanft/scheu haben strike 0.
        const pp4 = r.state.playerMesh.position;
        const c4 = r.spawnCreatureAt(pp4.x + 200, pp4.y, pp4.z + 200, "happy", "baer", { precise: true, bodySize: 1 });
        r.state.maxCreatures = cap4;
        const liestTemperament = !!c4 && window.__consumes(r, "damageCreature", r, "_creatureTemperament", [c4, 0.01, {}]);
        if (c4) r.removeCreature(c4);
        out.d4Konsum =
            liestTemperament &&
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
        // E8 ZWEI-HAND: swapHands tauscht über den EINEN equipHeld-
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
                r._refreshHeldMesh();
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
        // A4 — aWave (Ozean-Wellen-Anteil) ist ART-gedämpft: die Fluss-Abdeckung (riverness, dieselbe
        // smoothstep-Rampe wie die Shader-Strähnen) nimmt die Wogen aus dem Fluss, ein See ist still.
        // Gebaut wird das Sheet eines Meeres-Chunks dreimal: ruhig (Wogen), unter voller Strömung (Fluss) und als See.
        out.a4MouthWave = await (async () => {
            const key = await window.__wasserChunk("meer");
            if (!key) return false;
            const [cx, cz] = key.split(",").map(Number);
            const wctx = r._mainWaterSheetCtx(cx, cz, r.state.voxelChunks.get(key));
            const bau = (fluss, see) => {
                r._hydroRiverAt = () => ({ flowX: fluss, flowZ: 0 });
                r._hydrosphereLakeAt = () => see;
                try {
                    const d = r._computeWaterSheetData(cx, cz, wctx);
                    return d ? d.aWave.filter((_, i) => d.aDepth[i] > 0) : [];
                } finally {
                    delete r._hydroRiverAt;
                    delete r._hydrosphereLakeAt;
                }
            };
            const meer = bau(0, false), fluss = bau(1, false), see = bau(0, true);
            return meer.some((v) => v > 0.5) && fluss.length > 0 && fluss.every((v) => v === 0) && see.every((v) => v === 0);
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
            const savedMode = r.getGameMode();
            const savedMana = r.state.player.mana;
            try {
                r.setGameMode("pfad");
                r.state.player.mana = 7;
                r.state._statsHudLastTick = 0;
                r.tickStatsHud(1e9);
                const visOk = !row.hidden;
                const txt = document.getElementById("stats-hud-mana-text").textContent;
                r.setGameMode("frieden");
                r.state._statsHudLastTick = 0;
                r.tickStatsHud(2e9);
                return visOk && /^7\//.test(txt) && row.hidden === true;
            } finally {
                r.setGameMode(savedMode);
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
            // das Panel liest dieselben Gelenke: „rad" entsteht nur aus den Verbindungen
            const wagen = JSON.parse(JSON.stringify({ name: "fahrzeug_wagen", parts: bp.parts, connections: bp.connections || [] }));
            const panel = document.createElement("div");
            r._specRenderBody(panel, wagen);
            const line = panel.querySelector(".spec-motion-line");
            return hasRad && !!line && /\d+× Rad an Achse \(rollt\)/.test(line.textContent);
        })();
        // B5-UNTERWASSER-PASS: Konsument des Kamera-Mediums (neben der Unterwasser-Luft) — liegt die KAMERA unter
        // dem Spiegel (`_koerperWasser` an der Kamera, Welle L Q6), ist das geteilte Wasser-Material DoubleSide (Decke von
        // unten sichtbar), darüber BackSide. Behavioral mit Restore (zustands-neutral): der Spiegel wird einmal über,
        // einmal unter die Kamera gelegt.
        out.b5Underwater = (() => {
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
        out.b6RoofGate = await (async () => {
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
                // KONSUM: der Welt-Tick eines bewegten See-Chunks fragt das Dach-Gate (der Stub macht moved > 0,5)
                const wk = await window.__wasserChunk("see");
                const we = wk && r.state.voxelChunks.get(wk);
                let tickRuft = false;
                if (we) {
                    const sv = { act: r.state.waterCAActive, tick: we._caRemeshTick };
                    r.state.waterCAActive = new Set([wk]);
                    delete we._caRemeshTick;
                    r._tickWaterCA = () => 1;
                    try {
                        tickRuft = window.__consumes(r, "_tickWorldWaterCA", r, "_caRoofChanged", []);
                    } finally {
                        delete r._tickWaterCA;
                        r.state.waterCAActive = sv.act;
                        if (sv.tick !== undefined) we._caRemeshTick = sv.tick;
                        else delete we._caRemeshTick;
                    }
                }
                const dachOk =
                    offenNachErst &&
                    Math.abs(dachNachErst - 3.8) < 1e-6 &&
                    Math.abs(zwischen - 3.8) < 1e-6 &&
                    Math.abs(dachNachDritt - 4.9) < 1e-6;
                return first && !second && third && !fourth && dachOk && tickRuft;
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
            const pLw = r.chatSystemPatterns.find((q) => q.re.test("liste welten"));
            if (!pLw) return "Tabelle trägt liste welten nicht";
            const out0 = document.getElementById("chat-output");
            const before = out0 ? out0.children.length : 0;
            if (!window.__consumes(r, "processChatCommand", pLw, "run", ["liste welten"]))
                return "Dispatch liest die Tabelle nicht";
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
        // D5a Wetter-INTENSITÄTS-ACHSE: (a) die Achse lerpt (sunny 0, halber Übergang 0,5) und extrapoliert (stormy > rainy);
        // (b) Vokabular-Gate (stormy ja, xyz nein); (c) das Innenleben unterscheidet die Worte (Sturm
        // fühlt chaos+awe, nicht sorrow).
        out.d5aWeather = (() => {
            const saved = {
                w: r.state.weather,
                wt: r.state.weatherTransition,
                creatures: r.state.creatures,
                ce: r.state.creatureEmotions,
            };
            // Wer fühlt, zieht der Fauna-Strom des Gefühls (Γ5) — die Probe setzt den Strom, nie Math.random.
            const hatteStrom = Object.prototype.hasOwnProperty.call(r, "_faunaRng");
            try {
                r.state.weatherTransition = null;
                r.state.weather = "rainy";
                const vRainy = r._weatherBlendedValue(0, 1);
                r.state.weather = "stormy";
                const vStormy = r._weatherBlendedValue(0, 1);
                r.state.weatherTransition = { from: "sunny", to: "rainy", progress: 0.5 };
                const vMitte = r._weatherBlendedValue(0, 1);
                r.state.weatherTransition = null;
                r.state.weather = "sunny";
                const vSunny = r._weatherBlendedValue(0, 1);
                if (!(vSunny === 0 && Math.abs(vMitte - 0.5) < 1e-3 && Math.abs(vRainy - 1) < 1e-9 && vStormy > 1))
                    return `Achse: sunny=${vSunny} mitte=${vMitte} rainy=${vRainy} stormy=${vStormy}`;
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
                r.state.creatures = saved.creatures;
                r.state.creatureEmotions = saved.ce;
                return true;
            } finally {
                if (!hatteStrom) delete r._faunaRng;
                r.state.weather = saved.w;
                r.state.weatherTransition = saved.wt;
                r.state.creatures = saved.creatures;
                r.state.creatureEmotions = saved.ce;
            }
        })();
        // N7.4 — der Horizont-Mantel ist GESCHNITTEN (Vor-Studio-Kulisse): die V18.113-
        // Material-Probe wandert zur Abwesenheit (der Schnitt bleibt geschnitten).
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
    check(
        "D4-VOLL: Temperament aus Gattung und Größe (Hirsch scheu · Wolf wild · Bär wehrhaft · Fuchs scheu · Koloss-Hirsch wehrhaft · kleiner Bär sanft)",
        res.d4Temperament
    );
    check("D4-VOLL: der Treffer KONSUMIERT das Temperament (strike-Profil)", res.d4Konsum);
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
    check("aWave ist ART-gedämpft (Fluss-riverness + See still — die Mündungs-Synergie)", res.a4MouthWave);
    check(
        "Wasser-Sheet-Queue verhungert nicht (FIFO-Slot zieht ferne Keys trotz Dauer-Nachschub)",
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
        "D5a/V18.128: die Wetter-ACHSE — der Übergang lerpt, stormy extrapoliert, das Vokabular gated, der Sturm fühlt chaos",
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
        const out = {};

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
        // derselbe Stiel (Zylinder 0,3 × 1 × 0,3) aus zwei Stoffen — je Ruf ein frischer Bauplan
        const stiel = (name, material) => ({
            name,
            parts: [
                {
                    shape: "cylinder",
                    material,
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 0.3, y: 1, z: 0.3 },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [],
                },
            ],
            connections: [],
        });
        const eisenBp = stiel("test_eisen", "eisen");
        const holzBp = stiel("test_holz", "holz");
        const wEisen = r._wearPerStrike(eisenBp);
        const wHolz = r._wearPerStrike(holzBp);
        out.eisenSlower = wEisen > 0 && wHolz > 0 && wEisen < wHolz;

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
            r.setGameMode("schöpfer");
            r._setBlueprintWear(heldBp, 0.3); // beschädigt
            const forgeRes = r.forgeBlueprint(heldName);
            out.forgeRefilled = !!(forgeRes && forgeRes.ok && r._blueprintWear(heldBp) > 0.99);
        }

        // W9 repariert das gehaltene Gerät (Zehren, Wand und Faktor misst der Werkzeug-Satz, gate:kampf-gefuehl Q11)
        if (heldBp) r.equipHeld(heldName);

        // (W9) REPAIR-Akt stellt wear voll her (im schöpfer-Modus frei).
        if (heldBp) {
            r._setBlueprintWear(heldBp, 0.3); // beschädigt
            // schöpfer-Modus für free-Repair (Material-Tor umgangen).
            r.setGameMode("schöpfer");
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
            // RE-FETCH (Lehre): zwischen W6-W11 wurde forge/strike/
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
        }

        // (W13) R2-DISJUNKTHEIT strukturell: weder repair_held noch wear-Setter
        // sind DSL-Ops (kein Skript kann automatisch reparieren oder die Mühe-
        // Senke umgehen — Ω5 lebt nur durch echte Spieler-Akte).
        if (heldBp) r._setBlueprintWear(heldBp, 0.42);
        const unbekannt = (prog) =>
            !Object.hasOwn(r.dslEffects, prog[0]) &&
            r.dslRun(prog, { seed: 1, programId: "probe-r2" }).log.some((e) => e.event === "unknown_op" && e.op === prog[0]) &&
            (!heldBp || Math.abs(r._blueprintWear(heldBp) - 0.42) < 1e-9);
        out.noRepairOp = unbekannt(["repair_held"]);
        out.noSetWearOp = unbekannt(["set_wear", "_t_wear_spitz", 1]);

        // Aufräumen — Modus zurück, Hand leer + Test-Blueprint geräumt (kein dangling Held).
        if (heldBp) r._setBlueprintWear(heldBp, 1);
        r.equipHeld(null);
        delete r.state.blueprints._t_wear_spitz;
        r.setGameMode("frieden");

        return out;
    });

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
        "W5 (W6): FORGE setzt wear=1 (frisches/repariertes Werkzeug startet voll) — die Spitzhacken-Substanz (KIND_SUBSTANCE) ist craftbar",
        res.libraryHasSpitzhacke && res.forgeRefilled
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

// das Geruch-Feld der Welt als FÜNFTE Welt-Stimme, sein Wind der EINE Wind am Ort (`_windAt`, gate:kopplung F3); ihr Konsum
// (Jagd, Kadaver) lebt in gate:kreatur-takt jagdkreis — hier das Gesetz von Wind und Abstand.
async function checkBandV18202GeruchFeld(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};

        // (N3) Geruch: einzelne Quelle, Distanz-Decay
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

        // (N5) Wind-Modulation: downwind > upwind — eine Quelle an fester Position, gesampelt EXAKT downwind und upwind
        const sx = 100,
            sz = 100;
        const wind = r._windAt(sx, sz, r.state._simZeit);
        // Downwind = in Wind-Richtung von Source aus
        const dRecv = { x: sx + wind.x * 50, z: sz + wind.z * 50 };
        const uRecv = { x: sx - wind.x * 50, z: sz - wind.z * 50 };
        const quelle = [{ x: sx, z: sz, strength: 1 }];
        const downG = r._scentAt(dRecv.x, dRecv.z, quelle);
        const upG = r._scentAt(uRecv.x, uRecv.z, quelle);
        out.downwindStronger = downG > upG;
        out.upwindStillHasMinScent = upG > 0; // minDirectional > 0
        out.downwindMagnitude = downG;
        out.upwindMagnitude = upG;

        return out;
    });

    check("(N3a) Geruch nah > 0.3 (volle Stärke nahe Quelle)", res.scentNearStrong === true);
    check("(N3b) Distanz-Decay monoton (20>50>100)", res.scentDistantWeaker === true);
    check("(N3c) Bei 300 m: Geruch sehr schwach < 0.05 (decay × windMod)", res.scentFarVanishes === true);
    check(
        `(N5a) Downwind stärker als upwind (down=${res.downwindMagnitude && res.downwindMagnitude.toFixed(3)} > up=${res.upwindMagnitude && res.upwindMagnitude.toFixed(3)})`,
        res.downwindStronger === true
    );
    check("(N5b) Upwind hat Restduft > 0 (minDirectional-Schwelle)", res.upwindStillHasMinScent === true);
}

module.exports = {
    checkBandV1757HeldSlot, checkBandV1761ForgeImplement, checkBandV1762ForgeMeaningful, checkBandV1763ForgeArmor,
    checkBandV1765BrewConsumable, checkBandV1766FertigenFlow, checkBandV1770WorkshopStationMark,
    checkBandV1772Library, checkBandV1773HeldMesh, checkBandV1784AvatarFormFit, checkBandWelle6DSoul,
    checkBandPhasenBF, checkBandW5Werkzeugabnutzung, checkBandV18202GeruchFeld,
};
