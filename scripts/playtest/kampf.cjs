"use strict";
// scripts/playtest/kampf.cjs — der Richter von Kampf (spec/stamm/modul-karte.json): Schwung · Sweep · Urteil · Bogen · Abbau.
// 7 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Abbauen kostet substanz-gebundene MÜHE; EINE Tauglichkeit (gehaltenes Ding vs Material) dirigiert
// Tempo/Stamina/Ertrag — viele Hiebe statt Instant, ein gutes Werkzeug bricht schneller + lootet.
async function checkBandV1755HarvestEffort(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const H = r.constructor.HARVEST;
        const savedTool = p.equipped ? p.equipped.held : null;
        const savedStam = p.stamina;
        const savedInv = p.inventory.slice();
        const savedMode = r.getGameMode();
        if (!p.equipped) p.equipped = {};
        const clearInv = () => {
            for (let i = 0; i < p.inventory.length; i++) p.inventory[i] = null;
        };
        const steinCount = () =>
            p.inventory.reduce(
                (n, sl) => n + (sl && sl.kind === "material" && sl.material === "stein" ? sl.count || 0 : 0),
                0
            );
        const strikeUntilGone = (a, cap) => {
            let s = 0;
            while (r.state.architectures.indexOf(a) !== -1 && s < cap) {
                r._strikeArchitecture(a);
                s++;
            }
            return s;
        };

        // (2) minePower: die bloße Faust schwach, ein hartes Werkzeug stark (das gehaltene Ding zählt)
        p.equipped.held = null;
        const handPower = r._heldMinePower();
        p.equipped.held = "stein_block";
        const toolPower = r._heldMinePower();
        out.toolBeatsHand = toolPower > handPower && handPower > 0;

        // (3) Widerstand: ein hartes Bauwerk widersteht mehr als die Basis (W2: {mineResist, cutResist})
        const hardRes = r._architectureResistance({ type: "stein_block" });
        out.hardResists = hardRes.mineResist > H.resistBase;

        // (4) die Tauglichkeit DIFFERENZIERT die vier Kanäle (gutes Werkzeug vs Faust auf HARTEM)
        p.equipped.held = "stein_block";
        const fitGood = r._harvestFitnessFromResist(hardRes);
        p.equipped.held = null;
        const fitHand = r._harvestFitnessFromResist(hardRes);
        out.fitnessDifferentiates =
            fitGood.progress > fitHand.progress && // TEMPO
            fitGood.yieldMult > fitHand.yieldMult && // ERTRAG
            fitGood.stamina < fitHand.stamina; // STAMINA (invers)
        // Ertrags-SOCKEL (yieldMin): wer den Bruch erarbeitet, erntet mindestens 1/3 — auch die Faust an
        // Hartem; Untauglichkeit bestraft über Tempo + Stamina (fitnessDifferentiates daneben).
        out.handYieldsNothingOnHard =
            fitHand.yieldMult >= (r.constructor.HARVEST.yieldMin || 0.34) - 1e-9 && fitHand.yieldMult < 0.5;

        // (5)+(6) KONSUM: Mühe (viele Hiebe) + gutes Werkzeug schneller + Ertrag skaliert.
        // In frieden (keine Stamina-Störung) den Hieb-Kern _strikeArchitecture direkt treiben.
        r.setGameMode("frieden");
        p.stamina = 1e6;
        clearInv();
        p.equipped.held = null;
        const aHand = r.spawnArchitecture("stein_block", { x: p.x + 8, y: p.y, z: p.z });
        const handStrikes = strikeUntilGone(aHand, 200);
        const steinHand = steinCount();
        clearInv();
        p.equipped.held = "stein_block";
        const aTool = r.spawnArchitecture("stein_block", { x: p.x + 12, y: p.y, z: p.z });
        const toolStrikes = strikeUntilGone(aTool, 200);
        const steinTool = steinCount();
        out.multiStrikeHand = handStrikes > 1; // die Faust: KEIN Instant
        out.brokeEventually =
            r.state.architectures.indexOf(aHand) === -1 && r.state.architectures.indexOf(aTool) === -1;
        out.toolFasterThanHand = toolStrikes >= 1 && toolStrikes < handStrikes;
        out.yieldScalesWithFitness = steinTool > steinHand && steinTool > 0;

        // (7) der Hold-Tick ist gegated (ohne die gehaltene Abbau-Aktion der Verb-Tafel → nichts)
        r.state.verbTafel.gehalten.break = false;
        const beforeTick = r.state.architectures.length;
        r._tickHarvest();
        out.tickGuarded = r.state.architectures.length === beforeTick;

        // (8) KONSUM Stamina: ein Hieb in pfad zieht Stamina (∝ invers zur Effizienz)
        r.setGameMode("pfad");
        p.equipped.held = null;
        p.stamina = 100;
        const aS = r.spawnArchitecture("stein_block", { x: p.x + 16, y: p.y, z: p.z });
        const stamBefore = p.stamina;
        r._strikeArchitecture(aS);
        out.staminaDrains = p.stamina < stamBefore;
        if (r.state.architectures.indexOf(aS) !== -1) r.removeArchitecture(aS);

        // cleanup
        for (const a of [aHand, aTool]) if (a && r.state.architectures.indexOf(a) !== -1) r.removeArchitecture(a);
        p.equipped.held = savedTool;
        p.stamina = savedStam;
        r.state.verbTafel.gehalten.break = false;
        clearInv();
        for (let i = 0; i < savedInv.length; i++) p.inventory[i] = savedInv[i];
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "minePower — ein hartes Werkzeug schlägt die bloße Faust (das gehaltene Ding bestimmt die Kraft)",
        res.toolBeatsHand
    );
    check("ein hartes Bauwerk leistet Widerstand (> Basis)", res.hardResists);
    check(
        "KONSUM — die Tauglichkeit DIFFERENZIERT die vier Kanäle (gutes Werkzeug: mehr Tempo+Ertrag, weniger Stamina)",
        res.fitnessDifferentiates
    );
    check(
        "W1/M6: die bloße Faust an HARTEM erntet den SOCKEL (yieldMin — Mühe wird bezahlt, das Werkzeug macht ergiebiger)",
        res.handYieldsNothingOnHard
    );
    check("KONSUM — Abbauen kostet MÜHE (die Faust braucht VIELE Hiebe, kein Instant)", res.multiStrikeHand);
    check("ein Bauwerk fällt schließlich (der Fortschritt vollendet sich)", res.brokeEventually);
    check(
        "KONSUM — ein gutes Werkzeug bricht SCHNELLER (weniger Hiebe als die Faust)",
        res.toolFasterThanHand
    );
    check(
        "KONSUM — der ERTRAG skaliert mit der Tauglichkeit (Werkzeug füllt das Inventar, die Faust ~nicht)",
        res.yieldScalesWithFitness
    );
    check("der Hold-Tick ist gegated (ohne gehaltenes Abbauen passiert nichts)", res.tickGuarded);
    check("KONSUM — ein Hieb zieht Stamina (pfad, ∝ invers zur Effizienz)", res.staminaDrains);
}

// das FORM-bewusste Fähigkeits-Profil + alles-für-alles: DIESELBE
// harte Materie wird zur KLINGE (spitz → schneidet Weiches) ODER zur KEULE (stumpf → wuchtet Hartes),
// das Material wählt den Kanal, das richtige Gerät gewinnt; man erntet auch mit der Waffe. KONSUM.
async function checkBandV1755W2Profile(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const blu = r.state.blueprints;
        const savedTool = p.equipped ? p.equipped.held : null;
        const savedWeapon = p.equipped ? p.equipped.held : null;
        if (!p.equipped) p.equipped = {};
        // Konstruierte Geräte aus DERSELBEN harten Materie (stein), nur die FORM unterscheidet:
        // eine spitze KLINGE (octahedron) vs ein stumpfer KLOTZ (box).
        blu.__w2_blade = { parts: [{ shape: "octahedron", material: "stein", size: { x: 0.3, y: 1.4, z: 0.3 } }] };
        blu.__w2_maul = { parts: [{ shape: "box", material: "stein", size: { x: 0.9, y: 0.9, z: 0.9 } }] };

        // (2) die FORM treibt das Profil — gleiche Materie, andere Form → Klinge schneidet, Klotz wuchtet
        p.equipped.held = null;
        p.equipped.held = "__w2_blade";
        const bladeProf = r._implementProfile();
        p.equipped.held = "__w2_maul";
        const maulProf = r._implementProfile();
        out.formDrivesProfile = bladeProf.cutPower > maulProf.cutPower && maulProf.minePower > bladeProf.minePower;

        // (3) die Faust ist beides schwach
        p.equipped.held = null;
        const handProf = r._implementProfile();
        out.handWeakBoth = handProf.minePower < maulProf.minePower && handProf.cutPower < bladeProf.cutPower;

        // (4)+(5) das MATERIAL wählt den Kanal + das richtige Gerät gewinnt (synthetische Widerstände)
        const soft = { mineResist: 2.0, cutResist: 0.6 };
        const hard = { mineResist: 3.2, cutResist: 4.5 };
        p.equipped.held = "__w2_blade";
        const bladeSoft = r._harvestFitnessFromResist(soft);
        const bladeHard = r._harvestFitnessFromResist(hard);
        p.equipped.held = "__w2_maul";
        const maulSoft = r._harvestFitnessFromResist(soft);
        const maulHard = r._harvestFitnessFromResist(hard);
        out.bladeCutsSoft = bladeSoft.channel === "cut" && bladeSoft.fit > bladeHard.fit;
        out.maulMinesHard = maulHard.channel === "mine" && maulHard.fit > bladeHard.fit;
        out.rightToolWins = bladeSoft.fit > maulSoft.fit && maulHard.fit > bladeHard.fit;

        // (6) ALLES-FÜR-ALLES: eine ausgerüstete WAFFE (kein tool) ist das gehaltene Gerät → man erntet mit ihr
        p.equipped.held = null;
        p.equipped.held = "__w2_blade";
        out.weaponIsHeld = r._heldImplementBlueprint() === blu.__w2_blade;
        out.weaponHarvests = r._implementProfile().cutPower > handProf.cutPower;

        // (7) der W1-Bug behoben: ein echtes Werkzeug ist eine Instanz (sourceBlueprint), nicht direkt ein Bauplan
        p.equipped.held = null;
        const savedTools = r.state.tools;
        r.state.tools = Object.assign({}, savedTools || {}, { __w2_realtool: { sourceBlueprint: "__w2_maul" } });
        p.equipped.held = "__w2_realtool";
        out.toolInstanceResolves = r._heldImplementBlueprint() === blu.__w2_maul;
        r.state.tools = savedTools;

        // (8) END-TO-END am ECHTEN Bauwerk (stein_block = Fels): die Keule (Wucht) gewinnt KLAR über die
        // Klinge (Fels ist unschneidbar) — robuster Fit-Vergleich (keine Rundungs-Marge) + der Kanal ist mine.
        p.equipped.held = "__w2_maul";
        const maulRock = r._harvestFitness({ type: "stein_block" });
        p.equipped.held = "__w2_blade";
        const bladeRock = r._harvestFitness({ type: "stein_block" });
        out.maulBeatsBladeOnRock = maulRock.fit > bladeRock.fit && maulRock.channel === "mine";
        // + die Keule bricht das ECHTE Bauwerk tatsächlich (der ganze Pfad läuft end-to-end)
        const savedMode = r.getGameMode();
        r.setGameMode("frieden");
        p.stamina = 1e6;
        p.equipped.held = "__w2_maul";
        const aRock = r.spawnArchitecture("stein_block", { x: p.x + 8, y: p.y, z: p.z });
        let rs = 0;
        while (aRock && r.state.architectures.indexOf(aRock) !== -1 && rs < 300) {
            r._strikeArchitecture(aRock);
            rs++;
        }
        out.maulBreaksRock = rs >= 1 && (!aRock || r.state.architectures.indexOf(aRock) === -1);
        if (aRock && r.state.architectures.indexOf(aRock) !== -1) r.removeArchitecture(aRock);

        // cleanup
        delete blu.__w2_blade;
        delete blu.__w2_maul;
        p.equipped.held = savedTool;
        p.equipped.held = savedWeapon;
        p.stamina = 1e6;
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "die FORM treibt das Profil — DIESELBE Materie wird zur Klinge (schneidet) ODER zur Keule (wuchtet)",
        res.formDrivesProfile
    );
    check("die bloße Faust ist an beidem schwach (kein Gerät, kein Profil)", res.handWeakBoth);
    check(
        "KONSUM — die Klinge glänzt am Weichen (cut) + scheitert am Harten; das Material wählt den Kanal",
        res.bladeCutsSoft
    );
    check("KONSUM — die Keule wuchtet das Harte (mine) + schlägt dort die Klinge", res.maulMinesHard);
    check("jedes Gerät ist an SEINEM Material überlegen (das richtige Werkzeug zählt)", res.rightToolWins);
    check(
        "ALLES-FÜR-ALLES — eine ausgerüstete Waffe ist das gehaltene Gerät, man erntet mit ihr",
        res.weaponIsHeld && res.weaponHarvests
    );
    check(
        "der W1-Bug behoben — ein echtes Werkzeug (sourceBlueprint-Instanz) löst zu seinem Bauplan auf (nicht die Faust)",
        res.toolInstanceResolves
    );
    check(
        "KONSUM — am ECHTEN Fels gewinnt die Keule (Wucht) klar über die Klinge (Fels ist unschneidbar)",
        res.maulBeatsBladeOnRock
    );
    check("die Keule bricht das echte Bauwerk end-to-end (der ganze Abbau-Pfad läuft)", res.maulBreaksRock);
}

// die Werkstatt erkennt JEDE Lesart: der emergente Fähigkeits-Readout
// (Klinge/Brecher/Gerät · Schutz · Wesen · Tor · Wirkung) aus Form × Material, rollen-unabhängig.
// Heilt den „nur Bauwerk"-Befund. KONSUM (nicht Existenz): die Werkstatt-Rollen-Zeile rendert es.
async function checkBandV1759CapabilityReadout(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        // greifbare Klinge (octahedron) vs greifbarer Brecher (box), DIESELBE Materie stein, eine Position (span 0)
        blu.__cap_blade = {
            name: "__cap_blade",
            parts: [
                {
                    shape: "octahedron",
                    material: "stein",
                    size: { x: 0.3, y: 1.4, z: 0.3 },
                    position: { x: 0, y: 0, z: 0 },
                },
            ],
        };
        blu.__cap_maul = {
            name: "__cap_maul",
            parts: [
                { shape: "box", material: "stein", size: { x: 0.9, y: 0.9, z: 0.9 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        // ein großes Bauwerk: Parts über >6 m gespreizt → KEINE in-der-Hand-Lesart
        blu.__cap_struct = {
            name: "__cap_struct",
            parts: [
                { shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
                { shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 }, position: { x: 10, y: 0, z: 0 } },
            ],
        };

        const bladeHints = r._blueprintCapabilityHints(blu.__cap_blade);
        const maulHints = r._blueprintCapabilityHints(blu.__cap_maul);
        const structHints = r._blueprintCapabilityHints(blu.__cap_struct);
        out.bladeKlinge = bladeHints.some((h) => h.indexOf("Klinge") === 0);
        out.maulBrecher = maulHints.some((h) => h.indexOf("Brecher") === 0);

        // DER HEAL: der Brecher-Bauplan hat die abstrakte Rolle „architecture" (kein Domain-Op),
        // ZEIGT aber die Geräte-Fähigkeit „Brecher" — der Readout ist rollen-unabhängig.
        out.maulRoleArchitecture = r.computeBlueprintRole(blu.__cap_maul) === "architecture";
        out.healNurBauwerk = out.maulRoleArchitecture && out.maulBrecher;

        // große Struktur → KEINE in-der-Hand-Lesart (kein „Brecher" auf einem Dorf)
        out.structNoImplement = !structHints.some(
            (h) => h.indexOf("Klinge") === 0 || h.indexOf("Brecher") === 0 || h.indexOf("Gerät") === 0
        );

        // KONSUM (DOM): V18.44 — der Spec-Sheet-Header rendert die Fähigkeiten als .spec-cap-chips.
        const panel = document.createElement("div");
        r._specRenderHeader(panel, blu.__cap_maul);
        const chips = Array.prototype.slice
            .call(panel.querySelectorAll(".spec-cap-chip"))
            .map((c) => c.textContent || "");
        out.domShowsCapability = chips.some((txt) => txt.indexOf("Brecher") !== -1);

        delete blu.__cap_blade;
        delete blu.__cap_maul;
        delete blu.__cap_struct;
        return out;
    });
    check("ein greifbares spitzes Geraet liest Klinge (schneidet)", res.bladeKlinge);
    check("ein greifbarer stumpfer Klotz liest Brecher (wuchtet)", res.maulBrecher);
    check(
        "DER HEAL — ein Bauplan der Rolle Bauwerk (architecture) zeigt TROTZDEM die Geraete-Faehigkeit Brecher (rollen-unabhaengig)",
        res.healNurBauwerk
    );
    check(
        "eine grosse Struktur (>6 m gespreizt) zeigt KEINE in-der-Hand-Lesart (kein Brecher auf einem Dorf)",
        res.structNoImplement
    );
    check(
        "KONSUM — _workshopAppendRoleRow rendert die Faehigkeit-Zeile mit der Brecher-Lesart ins DOM",
        res.domShowsCapability
    );
}

// die MATERIAL-Sichtbarkeit für die Mach-Akte (der Avatar-Bug: stiller Fehlschlag bei fehlendem
// Material). Das Fehlende sticht am Dropdown-Eintrag heraus (✗ fehlt …) + ein gescheitertes Verkörpern
// setzt das Select zurück, statt eine falsche Seele zu zeigen. Snapshot + Restore (Mode/Soul/Inventar).
async function checkBandV1775MakeActCost(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const setMode = (m) => {
            r.setGameMode(m);
        };

        // Snapshot
        const savedMode = r.getGameMode();
        const savedSoul = (p && p.soul) || "mensch";
        const savedInv = Array.isArray(p.inventory) ? JSON.parse(JSON.stringify(p.inventory)) : [];
        const savedEquip = p && p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : { held: null, armor: null };
        const invLen = Array.isArray(p.inventory) ? p.inventory.length : 27;
        if (r.state.customSouls) delete r.state.customSouls["bp_koerper_human"];
        if (r.state.blueprints["koerper_human"]) delete r.state.blueprints["koerper_human"].forgedPrecision;

        // (1) schöpfer (Gott-Modus) → kein Kosten-Marker (frei)
        setMode("schöpfer");
        out.schoepferFree = r._makeActCostSuffix("koerper_human") === "";

        // (2) pfad ohne Material → das Fehlende sticht heraus (✗ fehlt …)
        setMode("pfad");
        p.inventory = new Array(invLen).fill(null);
        const sufEmpty = r._makeActCostSuffix("koerper_human");
        out.pfadMissing = sufEmpty.includes("fehlt") && sufEmpty.includes("✗");

        // (3) pfad MIT Material → bereit (· ✓)
        const cost = r.computeBuildCost("koerper_human");
        let si = 0;
        for (const mat of Object.keys(cost)) {
            p.inventory[si++] = { kind: "material", material: mat, count: cost[mat] };
        }
        out.pfadReady = r._makeActCostSuffix("koerper_human") === " · ✓";

        // (4) KERN — embody in pfad OHNE Material schlägt fehl + die Seele bleibt der alte Avatar
        p.inventory = new Array(invLen).fill(null);
        r.applyPlayerSoul("human");
        const emb = r.embodyBlueprint("koerper_human");
        out.embodyFailsClean = emb.ok === false && p.soul === "human";

        // (5) das Select RENDERT den Mangel sichtbar im Option-Text (kein stiller Fehlschlag).
        // KÖRPER GANZ (T6): koerper_human ist aus der Sicht (Alt-Doppel) — der Marker wird
        // am STUDIO-Eintrag gemessen (koerper_wolf, un-verkörpert → Kosten-Suffix am Namen).
        if (r.state.customSouls) delete r.state.customSouls["bp_koerper_wolf"];
        r._refreshSoulSelect();
        const soulSel = document.getElementById("player-soul-select");
        const avatarOpt = soulSel ? [...soulSel.options].find((o) => o.value === "koerper_wolf") : null;
        out.optionShowsMissing = !!avatarOpt && avatarOpt.textContent.includes("fehlt");

        // (6) ein GESCHMIEDETES Gerät → kein Marker (der Gebrauch ist frei).
        // AUSLÖSCHUNGS-WELLE — Test-Blueprint aus der Werkzeug-Substanz (KIND_SUBSTANCE).
        const KS75 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_v1775) delete r.state.blueprints._t_v1775;
        r.state.blueprints._t_v1775 = {
            name: "_t_v1775",
            parts: JSON.parse(JSON.stringify(KS75.geraet_spitzhacke.parts)),
        };
        const tb = r.state.blueprints["_t_v1775"];
        tb.forgedPrecision = 0.8;
        out.forgedFree = r._makeActCostSuffix("_t_v1775") === "";
        delete r.state.blueprints._t_v1775;

        // restore
        setMode(savedMode);
        if (r.state.customSouls) delete r.state.customSouls["bp_koerper_human"];
        r.applyPlayerSoul(savedSoul);
        if (p) {
            p.inventory = savedInv;
            p.equipped = savedEquip;
        }
        r.equipHeld(savedEquip && savedEquip.held ? savedEquip.held : null);
        r._refreshSoulSelect();
        r.renderInventoryUI();
        r.recomputePlayerStats();
        return out;
    });
    check("_makeActCostSuffix — schöpfer (Gott-Modus) zeigt keinen Kosten-Marker (frei)", res.schoepferFree);
    check("pfad ohne Material → das Fehlende STICHT heraus (✗ fehlt …) am Dropdown-Eintrag", res.pfadMissing);
    check("pfad MIT Material → bereit-Marker (· ✓)", res.pfadReady);
    check(
        "KERN: ein gescheitertes Verkörpern (kein Material) ändert die Seele NICHT (player.soul bleibt) — der Avatar-Bug",
        res.embodyFailsClean
    );
    check(
        "die Seele-Select RENDERT den Material-Mangel sichtbar im Option-Text (kein stiller Fehlschlag)",
        res.optionShowsMissing
    );
    check("ein geschmiedetes Gerät zeigt keinen Kosten-Marker (der Gebrauch ist frei)", res.forgedFree);
}

// Rollen-Klassifikation an der Wurzel: eine greifbare Geräte-Form (spitz/griff-elongiert) wird über
// die FORM Waffe/Werkzeug statt Bauwerk (trennt den Substanz-Zwilling Klinge/Bauwerk); Würfel,
// große Strukturen, Körper und Tore bleiben unverändert.
async function checkBandV1783ImplementClassification(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const mk = (parts) => ({ name: "_u4", parts });
        const spike = mk([
            __teil("cone", "eisen", 0, 0, 0, 0.3, 0.3, 1.8),
        ]);
        const handle = mk([
            __teil("cylinder", "eisen", 0, 0, 0, 0.25, 1.6, 0.25),
        ]);
        const largeBlock = mk([
            __teil("box", "stein", 0, 0, 0, 8, 8, 8),
        ]);
        const smallCube = mk([
            __teil("box", "stein", 0, 0, 0, 1, 1, 1),
        ]);
        const body = mk([
            __teil("box", "fleisch", 0, 1, 0, 0.8, 1.6, 0.5),
            __teil("cylinder", "fleisch", -0.7, 1, 0, 0.3, 1.2, 0.3),
            __teil("cylinder", "fleisch", 0.7, 1, 0, 0.3, 1.2, 0.3),
        ]);
        const out = {};
        out.spikeRole = r.computeBlueprintRole(spike);
        out.handleRole = r.computeBlueprintRole(handle);
        out.largeRole = r.computeBlueprintRole(largeBlock);
        out.cubeRole = r.computeBlueprintRole(smallCube);
        out.bodyRole = r.computeBlueprintRole(r.state.blueprints["koerper_human"]); // ein echter körper-förmiger Soul-Bauplan
        void body;
        // (1) der KERN-FIX: ein spitzes greifbares Gerät → Waffe (NICHT mehr architecture)
        out.spikeWeapon = out.spikeRole === "weapon";
        // (2) ein STUMPFES griff-elongiertes Ding ist form-mehrdeutig (Stab vs Säule) → bleibt Bauwerk (konservativ)
        out.handleArch = out.handleRole === "architecture";
        // (3) eine große Struktur (nicht greifbar) → Bauwerk (unverändert)
        out.largeArch = out.largeRole === "architecture";
        // (4) ein Würfel (greifbar, aber keine Geräte-Form) → Bauwerk (unverändert)
        out.cubeArch = out.cubeRole === "architecture";
        // (5) ein Körper → Seele (die Form-Rollen unverändert)
        out.bodySoul = out.bodyRole === "soul";
        // (6) die Greifbar-Erkennung selbst
        out.graspDetect =
            r._isGraspableImplementForm(spike) &&
            r._isGraspableImplementForm(handle) &&
            !r._isGraspableImplementForm(largeBlock) &&
            !r._isGraspableImplementForm(smallCube);
        return out;
    });
    check(
        "U4 KERN: ein spitzes greifbares Gerät → Waffe (die scharfe Klinge ist KEIN Bauwerk mehr — das Schöpfer-Beispiel an der Wurzel)",
        res.spikeWeapon,
        `spike=${res.spikeRole}`
    );
    check(
        "ein STUMPFES griff-elongiertes Ding bleibt Bauwerk (form-mehrdeutig — nur eine SPITZE ist eindeutig ein Gerät, konservativ)",
        res.handleArch,
        `handle=${res.handleRole}`
    );
    check(
        "eine große Struktur (nicht greifbar) → Bauwerk (unverändert)",
        res.largeArch,
        `large=${res.largeRole}`
    );
    check(
        "ein Würfel (greifbar, aber keine Geräte-Form) → Bauwerk — U4 ändert NUR Geräte-Formen",
        res.cubeArch,
        `cube=${res.cubeRole}`
    );
    check(
        "ein Körper → Seele (die Form-Rollen soul/portal/consumable unverändert)",
        res.bodySoul,
        `body=${res.bodyRole}`
    );
    check(
        "die Greifbar-Implement-Erkennung (spitz/elongiert + klein vs großer Block/Würfel)",
        res.graspDetect
    );
}

// Schöpfer-Browser-Befunde: die Werkstatt-Kohärenz (die Affordanzen sind Fähigkeiten, nicht
// Rollen) + der Schwert-Samen (eine Klinge, die SCHNEIDET). Rendert den echten Stats-Readout.
async function checkBandV1786WorkshopCoherence(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const renderFor = (name) => {
            const ws = r._ensureWorkshopState();
            ws.selectedBlueprint = name;
            r._workshopRenderStatsPanel();
            const panel = document.getElementById("workshop-stats-panel");
            if (!panel) return null;
            // Spec-Sheet: Rolle + Fähigkeiten leben im Header (.spec-id), visuell GETRENNT
            // (die .spec-role-chip zeigt NUR die Rolle; die Affordanzen sind separate .spec-cap-chips).
            const header = panel.querySelector(".spec-header");
            const roleChipEl = header && header.querySelector(".spec-role-chip");
            const capChipEls = header ? Array.from(header.querySelectorAll(".spec-cap-chip")) : [];
            const roleChipText = (roleChipEl || {}).textContent || "";
            return {
                roleChip: roleChipText,
                // die Rolle-Chip ist „rein": nur die Rolle, kein ✦-Affordanz-Marker.
                roleRowAffordances: roleChipText.includes("✦") ? 1 : 0,
                capRowChips: capChipEls.map((c) => c.textContent),
            };
        };
        // (1) der Schwert-Samen — AUSLÖSCHUNGS-WELLE: der Blueprint fiel, die Judge-Substanz lebt
        // eingefroren in KIND_SUBSTANCE.geraet_schwert (Klinge, schneidet, gehaltenes Implement).
        const KS86 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        const sw = KS86.geraet_schwert ? { parts: JSON.parse(JSON.stringify(KS86.geraet_schwert.parts)) } : null;
        out.schwertExists = !!(sw && Array.isArray(sw.parts) && sw.parts.length > 0);
        out.schwertRole = sw ? r.computeBlueprintRole(sw) : "(missing)";
        out.schwertHeld = out.schwertRole === "tool" || out.schwertRole === "weapon"; // ein Gerät in der Hand
        // (2) das Rolle-Label liest das VOLLE Register (Esse → „Werkstatt", nicht der rohe „workshop-station")
        const esse = r.state.blueprints["esse"];
        const esseRender = esse ? renderFor("esse") : null;
        out.esseRoleChip = esseRender ? esseRender.roleChip : "(keine esse)";
        out.esseLabeled = !esse || esseRender.roleChip === "Werkstatt";
        // (3) die Affordanzen sind in der FÄHIGKEIT-Zeile, NICHT in der Rolle-Zeile (der ungebundene Faden)
        out.esseRoleRowAffordances = esseRender ? esseRender.roleRowAffordances : -1;
        out.esseRoleRowClean = !esse || esseRender.roleRowAffordances === 0; // keine ✦ in der Rolle-Zeile
        out.esseCapRowHasAffordance =
            !esse || esseRender.capRowChips.some((c) => /sendend|strahlend|vergrößernd|bündelnd/.test(c));
        return out;
    });
    check(
        "Samen: die Schwert-Substanz (KIND_SUBSTANCE) existiert + emergiert als gehaltenes Gerät (tool/weapon aus der Klingen-Form)",
        res.schwertExists && res.schwertHeld,
        `role=${res.schwertRole}`
    );
    check(
        'V17.86 Kohärenz: die Rolle-Chip liest das volle ROLE_LABELS-Register — die Esse zeigt „Werkstatt", nicht den rohen „workshop-station"',
        res.esseLabeled,
        `chip=${res.esseRoleChip}`
    );
    check(
        "Kohärenz: die Affordanzen (vergrößernd/strahlend) sind NICHT mehr in der Rolle-Zeile — die Rolle-Zeile zeigt NUR die Rolle",
        res.esseRoleRowClean,
        `affordanzen in Rolle-Zeile=${res.esseRoleRowAffordances}`
    );
    check(
        "Kohärenz: die Affordanzen wandern in die FÄHIGKEIT-Zeile — alle Fähigkeiten an EINEM Ort (der gebundene Faden)",
        res.esseCapRowHasAffordance
    );
}

// M6 Ernte/Spawn-Ehrlichkeit: (1) Ertrags-SOCKEL (yieldMult ≥ yieldMin — die Faust erntet den Baum),
// (2) EINE Mühe-Sprache fürs Terrain (Schlag-Zahl im pfad, Stamina anteilig), (3) die Spieler-Klemme
// an der WURZEL spawnArchitecture (kein Spawn-Pfad umgeht sie).
async function checkBandM6ErnteSpawn(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const pm = r.state.playerMesh.position;
        const savedMode = r.getGameMode();
        const savedInv = JSON.parse(JSON.stringify(r.state.player.inventory));
        const savedStamina = r.state.player.stamina;
        let baum = null;
        let clampSpawn = null;
        try {
            // (1) der ERTRAGS-SOCKEL: yieldMult ≥ yieldMin auch bei Faust-fit < floor; end-to-end: die Faust erntet den
            // Baum.
            const fitProbe = r._harvestFitnessFromResist({ mineResist: 3.0, cutResist: 3.0 });
            out.sockel = fitProbe.yieldMult >= (r.constructor.HARVEST.yieldMin || 0.34) - 1e-9;
            r.setGameMode("frieden");
            baum = r.spawnArchitecture(
                "baum_eiche",
                { x: pm.x + 7, y: pm.y, z: pm.z },
                { silent: true, precise: true }
            );
            const fitBaum = r._harvestFitness(baum);
            for (let i = 0; i < 40 && (r.state.architectures || []).some((e) => e === baum); i++) {
                r._strikeArchitecture(baum);
            }
            const holz = (r.state.player.inventory || []).reduce(
                (n, s) => n + (s && s.kind === "material" && s.material === "holz" ? s.count : 0),
                0
            );
            const holzVorher = savedInv.reduce(
                (n, s) => n + (s && s.kind === "material" && s.material === "holz" ? s.count : 0),
                0
            );
            out.faustErntet = fitBaum.yieldMult > 0 && holz > holzVorher;
            baum = null;

            // (2) die TERRAIN-Mühe (pfad): der erste Hieb gräbt NICHT (Fortschritt),
            // erst die Schlag-Zahl vollendet; die Stamina ist ANTEILIG (Σ ≈ alter
            // Ein-Hieb-Preis — die Faust KANN weiter graben); frieden bleibt instant.
            r.setGameMode("pfad");
            r.state.player.stamina = 100;
            const digFit = r._harvestFitnessFromResist({
                mineResist: r.constructor.HARVEST.terrainResist,
                cutResist: r.constructor.HARVEST.terrainCutResist,
            });
            out.terrainBrauchtSchlaege = digFit.progress < 1; // die Faust ein-hiebt NICHT
            const perStrike = digFit.stamina * Math.min(1, digFit.progress);
            out.staminaAnteilig = perStrike < digFit.stamina - 1e-9 && perStrike * (1 / digFit.progress) < 30;
            // …am echten Hieb (Ziel gestubbt, das Loch gefangen am EINEN Broadcast-Anker voxel_carve): der erste Hieb
            // gräbt nicht und zahlt anteilig, erst die Schlag-Zahl (dieselbe Summen-Folge) vollendet das Loch.
            const ziel = { hit: true, x: pm.x + 3, y: r._voxelSurfaceY(pm.x + 3, pm.z) ?? pm.y, z: pm.z };
            const loecher = [];
            const nix = () => null;
            const buehne = { _heldBogenRecipe: nix, _pickArchitectureAtCrosshair: nix, _pickCreatureAtCrosshair: nix,
                _pickScatterAtCrosshair: nix, _kampfKegelZiel: nix, _geraetGraebt: () => true, _raycastWorldHit: () => ziel,
                dslRun: (prog) => (prog[0] === "voxel_carve" && loecher.push(prog), true) };
            Object.assign(r, buehne);
            const mausVerb = r.state.player._mausVerb;
            try {
                r.state.player._dig = null;
                r.tryMouseBreak();
                const ersterHieb = loecher.length === 0 && Math.abs(r.state.player.stamina - (100 - perStrike)) < 1e-9;
                let acc = digFit.progress,
                    n = 1;
                while (acc < 1) (acc += digFit.progress), n++;
                for (let i = 2; i < n; i++) r.tryMouseBreak();
                const vorLetztem = loecher.length;
                r.tryMouseBreak();
                out.musyntax = ersterHieb && vorLetztem === 0 && loecher.length === 1 && loecher[0][1] === ziel.x;
            } finally {
                for (const k in buehne) delete r[k];
                if (mausVerb === undefined) delete r.state.player._mausVerb;
                else r.state.player._mausVerb = mausVerb;
            }

            // (3) die WURZEL-KLEMME: ein großer Spawn AUF dem Spieler (ohne Opt-out) weicht aus; precise/silent/
            // string-id bleiben EXAKT. Test-Blueprint: haus_basis-Substanz (KIND_SUBSTANCE, Footprint ≥ MIN).
            r.setGameMode("frieden");
            const KSm6 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            if (r.state.blueprints._t_m6_haus) delete r.state.blueprints._t_m6_haus;
            r.state.blueprints._t_m6_haus = {
                name: "_t_m6_haus",
                parts: JSON.parse(JSON.stringify(KSm6.haus_basis.parts)),
            };
            clampSpawn = r.spawnArchitecture("_t_m6_haus", { x: pm.x, y: pm.y, z: pm.z }, { seed: 7 });
            const d = clampSpawn ? Math.hypot(clampSpawn.position.x - pm.x, clampSpawn.position.z - pm.z) : 0;
            out.wurzelKlemmt = !!clampSpawn && d > 2.9;
            if (clampSpawn) r.removeArchitecture(clampSpawn);
            clampSpawn = r.spawnArchitecture("_t_m6_haus", { x: pm.x, y: pm.y, z: pm.z }, { seed: 7, precise: true });
            out.preciseExakt = !!clampSpawn && clampSpawn.position.x === pm.x && clampSpawn.position.z === pm.z;
            if (clampSpawn) r.removeArchitecture(clampSpawn);
            clampSpawn = r.spawnArchitecture("_t_m6_haus", { x: pm.x, y: pm.y, z: pm.z }, { seed: 7, id: "mu-sync-1" });
            out.idExakt = !!clampSpawn && clampSpawn.position.x === pm.x;
            if (clampSpawn) r.removeArchitecture(clampSpawn);
            clampSpawn = null;
            delete r.state.blueprints._t_m6_haus;
            return out;
        } finally {
            if (baum) r.removeArchitecture(baum);
            if (clampSpawn) r.removeArchitecture(clampSpawn);
            r.setGameMode(savedMode);
            r.state.player.inventory = savedInv;
            r.state.player.stamina = savedStamina;
            if (r.state.player._dig) r.state.player._dig.progress = 0;
        }
    });
    check(
        "M6 Ernte: der Ertrags-SOCKEL — wer den Bruch erarbeitet, erntet mindestens yieldMin (die Faust fällt den Baum UND bekommt Holz)",
        res.sockel && res.faustErntet
    );
    check(
        "M6 Mühe: das Terrain-Graben spricht die EINE Mühe-Sprache (Schlag-Zahl im pfad, Stamina anteilig — Σ ≈ alter Preis)",
        res.musyntax && res.terrainBrauchtSchlaege && res.staminaAnteilig
    );
    check(
        "M6 Spawn: die Spieler-Klemme sitzt an der WURZEL (großer Spawn weicht aus; precise/string-id bleiben bit-treu)",
        res.wurzelKlemmt && res.preciseExakt && res.idExakt
    );
}

module.exports = {
    checkBandV1755HarvestEffort, checkBandV1755W2Profile, checkBandV1759CapabilityReadout, checkBandV1775MakeActCost,
    checkBandV1783ImplementClassification, checkBandV1786WorkshopCoherence, checkBandM6ErnteSpawn,
};
