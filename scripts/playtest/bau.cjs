"use strict";
// scripts/playtest/bau.cjs — der Richter von Bau (spec/stamm/modul-karte.json): Default-Bücher: Baupläne · Materialien · Werkzeuge · Bauplan-Buch · Rollen · Präzision · Verbindungen · CRUD · Teil-Geometrie · Varianten-Bauer · Affordanz · Validierung.
// 8 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar, ohneWurf } = require("../playtest.cjs");

async function checkBandWaves1to3(ctx) {
    const { page, check, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Welt-Journal ###
    const journalResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        out.genesisWritten = r.state.worldJournal.entries.some((e) => e.type === "genesis");
        out.bornAtSet = typeof r.state.worldMeta.bornAt === "number" && r.state.worldMeta.bornAt > 0;
        // journalAppend schreibt
        const before = r.state.worldJournal.entries.length;
        r.journalAppend("test", "Erinnerung-Test");
        out.appendIncreases = r.state.worldJournal.entries.length === before + 1;
        // Once-Variante schreibt nur ein Mal
        r.journalAppendOnce("uniq1", "test", "Einmaliger Eintrag");
        r.journalAppendOnce("uniq1", "test", "Doppelt-Versuch");
        const uniqCount = r.state.worldJournal.entries.filter((e) => e.text === "Einmaliger Eintrag").length;
        out.onceIsIdempotent = uniqCount === 1;
        // Auszug für LLM enthält Genesis
        const excerpt = r.journalForPrompt();
        out.excerptHasGenesis = /genesis/.test(excerpt);
        // LLM-System-Prompt erwähnt slug + worldId
        const sys = r.llmBuildSystemPrompt();
        out.systemPromptIdentity = sys.includes(r.state.worldMeta.slug) && sys.includes(r.state.worldMeta.worldId);
        out.systemPromptInventory = /Kreaturen.*Bauwerke.*Baupläne/.test(sys);
        out.systemPromptTendency = /Höhe.*Distanz.*Wetter.*Aktivität/.test(sys);
        out.systemPromptFirstPerson = /sprich.*ich|in erster Person/i.test(sys);
        return out;
    });

    if (erreichbar(check, "Welle 1 D: Journal-Snapshot erreichbar", journalResults)) {
        check("Welle 1 D: Genesis-Eintrag wurde beim ersten worldMeta-Init geschrieben", journalResults.genesisWritten);
        check("Welle 1 D: worldMeta.bornAt gesetzt", journalResults.bornAtSet);
        check("Welle 1 D: journalAppend hängt Eintrag an", journalResults.appendIncreases);
        check("Welle 1 D: journalAppendOnce ist idempotent", journalResults.onceIsIdempotent);
        check("Welle 1 D: journalForPrompt enthält Genesis", journalResults.excerptHasGenesis);
        check("Welle 1 A: LLM-Prompt trägt slug + worldId", journalResults.systemPromptIdentity);
        check("Welle 1 A: LLM-Prompt zählt Welt-Inventar", journalResults.systemPromptInventory);
        check("Welle 1 A: LLM-Prompt benennt Pfad-Tendenz", journalResults.systemPromptTendency);
        check("Welle 1 A: LLM-Prompt verlangt erste Person", journalResults.systemPromptFirstPerson);
    }

    // ### Fraktale Baupläne + Schöpfer-DSL-Ops ###
    const wave2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // C — Validation lehnt unbekannte Shape ab
        out.rejectsUnknownShape = !r.validateBlueprintParts([{ shape: "alien" }]).ok;
        out.rejectsEmpty = !r.validateBlueprintParts([]).ok;
        out.acceptsValid = r.validateBlueprintParts([{ shape: "box", color: 0x00ff00 }]).ok;
        // C — blueprint-Part validiert refName
        out.rejectsInvalidRef = !r.validateBlueprintParts([{ shape: "blueprint", refName: "../etc" }]).ok;
        // B — define_blueprint legt eigenen Bauplan an
        delete r.state.blueprints["wave2-test"];
        const res = r.dslRun(
            ["define_blueprint", "wave2-test", [{ shape: "box", color: 0xff0000, size: { x: 2, y: 2, z: 2 } }]],
            { source: "test" }
        );
        out.defineBlueprintWorks =
            res.ok && !!r.state.blueprints["wave2-test"] && !r.state.blueprints["wave2-test"].builtIn;
        // B — Built-in lässt sich nicht überschreiben (stein_block — lebendes builtIn)
        const builtInBefore = r.state.blueprints.stein_block && r.state.blueprints.stein_block.parts.length;
        r.dslRun(["define_blueprint", "stein_block", [{ shape: "box" }]], { source: "test" });
        out.builtInProtected =
            r.state.blueprints.stein_block && r.state.blueprints.stein_block.parts.length === builtInBefore;
        // C — Selbst-Referenz wird verboten
        delete r.state.blueprints["self-ref"];
        r.dslRun(["define_blueprint", "self-ref", [{ shape: "blueprint", refName: "self-ref" }]], {
            source: "test",
        });
        out.selfReferenceBlocked = !r.state.blueprints["self-ref"];
        // C — fraktale Verschachtelung baut Sub-Group
        delete r.state.blueprints["wave2-outer"];
        r.dslRun(
            [
                "define_blueprint",
                "wave2-outer",
                [
                    { shape: "box", color: 0x0000ff },
                    { shape: "blueprint", refName: "wave2-test", position: { x: 3, y: 0, z: 0 } },
                ],
            ],
            { source: "test" }
        );
        const outerGroup = r._buildFromBlueprint(r.state.blueprints["wave2-outer"]);
        out.nestedGroupHasSubgroup = outerGroup.children.length === 2 && outerGroup.children[1].type === "Group";
        // C — Tiefen-Cap greift (selbst wenn man programmatisch zyklisch konstruiert)
        r.state.blueprints["cycle-a"] = {
            name: "cycle-a",
            label: "a",
            builtIn: false,
            parts: [{ shape: "blueprint", refName: "cycle-b" }],
        };
        r.state.blueprints["cycle-b"] = {
            name: "cycle-b",
            label: "b",
            builtIn: false,
            parts: [{ shape: "blueprint", refName: "cycle-a" }],
        };
        const cycleGroup = r._buildFromBlueprint(r.state.blueprints["cycle-a"]);
        // Sollte nicht in Endlos-Rekursion gehen
        out.cycleHandled = !!cycleGroup;
        // B — define_ability mit verbotenem nested define_blueprint
        const abilNested = r.dslRun(["define_ability", "evil", ["define_blueprint", "x", [{ shape: "box" }]]], {
            source: "test",
        });
        out.nestedDefineBlocked = abilNested.log.some((e) => e.event === "ability_nested_define_forbidden");
        // B — define_ability legitim
        const abilOk = r.dslRun(["define_ability", "wave2-dance", ["weather", "rainy"]], {
            source: "test",
        });
        out.defineAbilityWorks = abilOk.ok && (r.state.dsl.abilities || []).some((a) => a.name === "wave2-dance");
        // Test-Artefakte sauber entfernen, damit nachfolgende
        // Workshop-Invarianten konsistent zählen.
        delete r.state.blueprints["wave2-test"];
        delete r.state.blueprints["wave2-outer"];
        delete r.state.blueprints["cycle-a"];
        delete r.state.blueprints["cycle-b"];
        r.state.dsl.abilities = (r.state.dsl.abilities || []).filter((a) => a.name !== "wave2-dance");
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 2: Snapshot erreichbar", wave2Results)) {
        check("Welle 2 C: Validation lehnt unbekannte Shape ab", wave2Results.rejectsUnknownShape);
        check("Welle 2 C: Validation lehnt leeren Parts-Array ab", wave2Results.rejectsEmpty);
        check("Welle 2 C: Validation akzeptiert gültige box-Parts", wave2Results.acceptsValid);
        check("Welle 2 C: refName mit Sonderzeichen abgelehnt", wave2Results.rejectsInvalidRef);
        check("Welle 2 B: define_blueprint legt eigenen Bauplan an", wave2Results.defineBlueprintWorks);
        check("Welle 2 B: Built-in bleibt vor Überschreiben geschützt", wave2Results.builtInProtected);
        check("Welle 2 C: Selbst-Referenz im blueprint-Part blockiert", wave2Results.selfReferenceBlocked);
        check("Welle 2 C: Verschachtelter Bauplan rendert Sub-Group", wave2Results.nestedGroupHasSubgroup);
        check("Welle 2 C: Cycle in blueprint-Refs läuft nicht endlos", wave2Results.cycleHandled);
        check("Welle 2 B: define_ability verbietet nested define_*", wave2Results.nestedDefineBlocked);
        check("Welle 2 B: define_ability legt neue Fähigkeit an", wave2Results.defineAbilityWorks);
    }

    // ### Welt-Initiative + Welt-Tor ###
    const wave3Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // E — neue Trigger im pool + triggers-Map
        out.hasJournalEventTrigger = !!r.state.grok.triggers.journalEvent;
        out.hasEmotionShiftTrigger = !!r.state.grok.triggers.emotionShift;
        out.hasJournalEventPool =
            Array.isArray(r.state.grok.pool.journalEvent) && r.state.grok.pool.journalEvent.length > 0;
        out.hasEmotionShiftPool =
            Array.isArray(r.state.grok.pool.emotionShift) && r.state.grok.pool.emotionShift.length > 0;
        // E — grokSpeakFromJournal existiert
        // F — die aktive Welt lebt als Insel in der BIBLIOTHEK (der Welt-Manager); die
        // Einstellungen tragen keine Welt-Akte mehr (Profi-Struktur). Die alte
        // #world-info-Box ist entfernt → die „Diese Welt"-Insel (#feed-active-ident) ist die Heimat.
        out.activeWorldIslandInDom = !!document.getElementById("feed-active-ident");
        // die Welt-VERWALTUNG (rein/raus) lebt im Welt-Manager: „Empfangen" (Snapshot ODER Manifest)
        // + „Welt-Datei exportieren" (in der Insel, id action-export-state wiederverwendet). Der Test
        // wandert mit: er prüft die Verortung, nicht den alten Ort.
        out.worldImportInBibliothek = !!document.getElementById("library-import");
        out.worldExportInBibliothek = !!document.getElementById("action-export-state");
        // F — updateWorldInfo treibt die Insel (kein #world-info mehr); sie zeigt den slug
        r.updateWorldInfo();
        const islandText = (document.getElementById("feed-active-ident") || {}).textContent || "";
        out.worldInfoShowsSlug = islandText.includes(r.state.worldMeta.slug);
        // Tagebuch: List-DOM + Count + Erinnerungs-Zeile
        out.journalListInDom = !!document.getElementById("world-journal-list");
        out.journalCountInDom = !!document.getElementById("world-journal-count");
        // Test-Eintrag und Re-Render forcieren (signature ändern)
        r.journalAppend("test", "Tagebuch-UI-Probe");
        document.getElementById("world-journal-list").dataset.signature = "";
        r.renderWorldJournal();
        const listEl = document.getElementById("world-journal-list");
        out.journalListHasEntries = listEl.querySelectorAll(".journal-entry").length > 0;
        out.journalListHasTypePill = !!listEl.querySelector(".journal-entry .journal-type");
        out.journalListHasAge = !!listEl.querySelector(".journal-entry .journal-age");
        out.journalCountReflectsEntries = /Erinnerung/.test(document.getElementById("world-journal-count").textContent);
        // Jüngste oben: erstes journal-entry enthält den eben
        // angehängten Text
        const firstEntry = listEl.querySelector(".journal-entry");
        out.journalNewestFirst = !!firstEntry && firstEntry.textContent.includes("Tagebuch-UI-Probe");
        // Render mit identischer Signature darf DOM nicht neu bauen
        const beforeChildren = listEl.children.length;
        r.renderWorldJournal();
        out.journalSignatureCachesRender = listEl.children.length === beforeChildren;
        // F — triggerStateDownload akzeptiert suggestedName
        let downloadedName = null;
        const origCreate = document.createElement;
        document.createElement = function (tag) {
            const el = origCreate.call(document, tag);
            if (tag === "a") {
                const origSetAttr = el.setAttribute.bind(el);
                el.setAttribute = (k, v) => {
                    if (k === "download") downloadedName = v;
                    origSetAttr(k, v);
                };
                el.click = () => {};
            }
            return el;
        };
        r.triggerStateDownload({ test: true }, "anazh-realm-test.json");
        document.createElement = origCreate;
        out.downloadCustomName = downloadedName === "anazh-realm-test.json";
        return out;
    });

    if (erreichbar(check, "Welle 3: Snapshot erreichbar", wave3Results)) {
        check("Welle 3 E: journalEvent-Trigger im Grok-State", wave3Results.hasJournalEventTrigger);
        check("Welle 3 E: emotionShift-Trigger im Grok-State", wave3Results.hasEmotionShiftTrigger);
        check("Welle 3 E: journalEvent-Pool gefüllt", wave3Results.hasJournalEventPool);
        check("Welle 3 E: emotionShift-Pool gefüllt", wave3Results.hasEmotionShiftPool);
        check("Welle 3 F: Diese-Welt-Insel (#feed-active-ident) im DOM", wave3Results.activeWorldIslandInDom);
        check(
            "Welle 3 F: Welt-Verwaltung im Welt-Manager (Bibliothek: Empfangen + Welt-Datei-Export)",
            wave3Results.worldImportInBibliothek && wave3Results.worldExportInBibliothek
        );
        check("Welle 3 F: Diese-Welt-Insel zeigt slug", wave3Results.worldInfoShowsSlug);
        check("Welle 3 F: triggerStateDownload nutzt suggestedName", wave3Results.downloadCustomName);
        check("Tagebuch: #world-journal-list im DOM", wave3Results.journalListInDom);
        check("Tagebuch: #world-journal-count im DOM", wave3Results.journalCountInDom);
        check("Tagebuch: Liste rendert Erinnerungen", wave3Results.journalListHasEntries);
        check("Tagebuch: Eintrag trägt Type-Pille", wave3Results.journalListHasTypePill);
        check("Tagebuch: Eintrag zeigt Alter", wave3Results.journalListHasAge);
        check("Tagebuch: Counter zeigt Erinnerungs-Anzahl", wave3Results.journalCountReflectsEntries);
        check("Tagebuch: Jüngster Eintrag steht oben", wave3Results.journalNewestFirst);
        check("Tagebuch: Signature-Cache verhindert Re-Render", wave3Results.journalSignatureCachesRender);
    }
}

// Die Werkstatt-Domäne EMERGIERT aus der Substanz (_computeWorkshopDomain, kein hardcoded
// `workshopDomain`; Vorbild _isPortalShaped). Geprüft: die fünf Built-in-Werkstätten treffen ihre
// Domäne (Tag-Drift-Wächter), die Regel diskriminiert nach Substanz, das Gate liest sie end-to-end.
async function checkBandV1767WorkshopDomainEmergent(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const blu = r.state.blueprints;
        const savedMode = r.getGameMode();
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const savedArch = r.state.architectures.slice();
        const mk = (mat, shape) => ({
            parts: [{ shape, material: mat, size: { x: 0.8, y: 0.8, z: 0.8 }, position: { x: 0, y: 0, z: 0 } }],
        });

        // R1 — die Domäne ist das ARGMAX einer VEKTOR-RESONANZ (kein Einzel-Signal), gegen die frozen
        // WORKSHOP_DOMAIN_SIGNATURES. Sanity: der Kern rechnet ein gewichtetes Skalarprodukt (Invers-Achse).
        out.resonanceKernel =
            r._blueprintResonance({ a: 2, b: 3 }, { a: 1, b: -1 }) === -1 &&
            r._blueprintResonance({ a: 2 }, { a: 0.5 }) === 1;

        // (1) DER WÄCHTER — die fünf Built-in-Werkstätten emergieren (per Resonanz-argmax) auf ihre Domäne (gegen Tag-Drift)
        out.esse = r._computeWorkshopDomain(blu.esse) === "forging";
        out.brennkolben = r._computeWorkshopDomain(blu.brennkolben) === "alchemy";
        out.webstuhl = r._computeWorkshopDomain(blu.webstuhl) === "textile";
        out.altar = r._computeWorkshopDomain(blu.seelenstein_altar) === "soulwork";
        out.drehbank = r._computeWorkshopDomain(blu.drehbank) === "mechanism";
        out.noHardcode = blu.esse.workshopDomain === undefined;

        // (2) SUBSTANZ statt NAME — verschiedene Form×Material → verschiedene Domänen-Resonanz, kein Lookup.
        // (Ein LONE Material-Block ist KEINE Werkstatt → null unter dem Floor; die Resonanz über-klassifiziert
        // nicht mehr wie die alte Einzel-Tag-Schwelle.)
        out.quarzSphereAlchemy = r._computeWorkshopDomain(mk("quarz", "sphere")) === "alchemy"; // durchsichtiges Gefäß
        out.steinBoxForging = r._computeWorkshopDomain(mk("stein", "box")) === "forging"; // dichte Masse
        out.holzBoxNull = r._computeWorkshopDomain(mk("holz", "box")) === null; // weicher Block, aber kein Webstuhl → null
        out.knochenBoxNull = r._computeWorkshopDomain(mk("knochen", "box")) === null; // kein klares Signal → keine Werkstatt

        // (3) DER FLIP — dieselbe Struktur, andere Substanz → andere Domäne (live Form×Material, kein Schloss)
        const flip = mk("stein", "box");
        const before = r._computeWorkshopDomain(flip);
        flip.parts.push({
            shape: "sphere",
            material: "quarz",
            size: { x: 1.0, y: 1.0, z: 1.0 },
            position: { x: 0, y: 1, z: 0 },
        });
        const after = r._computeWorkshopDomain(flip);
        out.substanceFlip = before === "forging" && after === "alchemy";

        // (4) DAS GATE liest die EMERGENTE Domäne end-to-end — ein forging-Werk passt zur Esse, NICHT zum Brennkolben
        r.setGameMode("schöpfer");
        delete blu.__wd_work;
        blu.__wd_work = mk("eisen", "box");
        blu.__wd_work.name = "__wd_work";
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer"); // V17.88 op-Bibliothek leihen
        r.applyOpToPart("__wd_work", 0, "schmiede-hammer"); // forging-Domain über die opChain
        out.workIsForging = r.computeBlueprintDomain(blu.__wd_work) === "forging";
        r.setGameMode("pfad");
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse" && e.type !== "brennkolben");
        r.state.architectures.push({ type: "esse", position: { x: pm.x, y: pm.y, z: pm.z }, id: "__wd_esse" });
        const gEsse = r._workshopStationGate("__wd_work", { x: pm.x, y: pm.y, z: pm.z });
        out.esseMatchesForging = gEsse.ok === true && gEsse.found === "esse";
        r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
        r.state.architectures.push({ type: "brennkolben", position: { x: pm.x, y: pm.y, z: pm.z }, id: "__wd_brk" });
        const gBrk = r._workshopStationGate("__wd_work", { x: pm.x, y: pm.y, z: pm.z });
        out.brennkolbenWrongDomain = gBrk.ok === false && gBrk.neededDomain === "forging";

        // cleanup
        delete blu.__wd_work;
        r.state.architectures = savedArch;
        r.setGameMode(savedMode);
        return out;
    });
    check(
        "R1: der Resonanz-Kern rechnet ein gewichtetes Skalarprodukt (mit Invers-Achse: {a:2,b:3}·{a:1,b:-1} = -1)",
        res.resonanceKernel
    );
    check(
        "S7-B: DER WÄCHTER — die 5 Built-in-Werkstätten emergieren (Resonanz-argmax) korrekt (esse→forging, brennkolben→alchemy, webstuhl→textile, altar→soulwork, drehbank→mechanism) + KEIN hardcoded Feld",
        res.esse && res.brennkolben && res.webstuhl && res.altar && res.drehbank && res.noHardcode
    );
    check(
        "S7-B: SUBSTANZ statt NAME — die Resonanz diskriminiert nach Form×Material (quarz-Gefäß→alchemy, dichte→forging, lone Block→null statt über-klassifiziert)",
        res.quarzSphereAlchemy && res.steinBoxForging && res.holzBoxNull && res.knochenBoxNull
    );
    check(
        "S7-B: DER FLIP — dieselbe Struktur + ein quarz-Gefäß → forging WIRD alchemy (live Form×Material, kein Schloss)",
        res.substanceFlip
    );
    check(
        "S7-B: DAS GATE liest die EMERGENTE Domäne end-to-end — ein forging-Werk passt zur Esse, NICHT zum Brennkolben (alchemy)",
        res.workIsForging && res.esseMatchesForging && res.brennkolbenWrongDomain
    );
}

// Ω-PHYSIS Säule III — Bauplan-Grammatik: Ω-B1 Tempel nach DORISCHER ORDNUNG (Entasis + Kanneluren
// [flutedColumn], Echinus, Triglyphen, Giebel), Ω-B2 Schwert als OAKESHOTT-Typ (bladeProfile:
// Verjüngung + Hohlkehle). Physik-Garant: Tempel steht, 1:7-Säulen knicken nicht, Balance gerechnet.
async function checkBandOmegaGrammatik(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm,
            C = r.constructor;
        const o = {};
        // ── Ω-B1/B4 der klassische Tempel — AUSLÖSCHUNGS-WELLE: der temple-Blueprint + der
        // _classicalTempleVariant-Seed-Roller sind gefallen; die LEBENDE Grammatik-Maschine
        // (_buildClassicalTemple + CLASSICAL_ORDERS) bleibt und wird DIREKT geprobt.
        const temple = { parts: r._buildClassicalTemple("dorisch") };
        o.templeOk = !!(temple && Array.isArray(temple.parts) && temple.parts.length > 80);
        const fluteSet = [C.CLASSICAL_ORDERS.dorisch.flutes, C.CLASSICAL_ORDERS.ionisch.flutes];
        const shafts = temple.parts.filter((p) => p.shape === "flutedColumn");
        o.doricShafts = shafts.length > 10 && shafts.every((p) => p.size.z < p.size.x && fluteSet.includes(p.flutes));
        o.pediment =
            temple.parts.filter((p) => p.shape === "box" && p.rotation && Math.abs(p.rotation.z) > 0.05).length === 2;
        o.tympanon = temple.parts.filter((p) => p.shape === "gableTriangle").length === 2; // geschlossener Giebel
        o.orders = !!(C.CLASSICAL_ORDERS && C.CLASSICAL_ORDERS.dorisch && C.CLASSICAL_ORDERS.ionisch);
        // Ω-B4 GENERATIV: N Ordnungen×Parameter → N verschiedene Tempel, ALLE physik-garant.
        // (Der _classicalTempleVariant-Seed-Roller fiel; die Grammatik selbst — Ordnung ×
        // columnsFront — spannt den Varianten-Raum, jede Ausprägung bleibt physik-garant.)
        const sigs = new Set();
        let varStand = true;
        for (const [ordName, nFront] of [
            ["dorisch", 6],
            ["ionisch", 6],
            ["dorisch", 4],
            ["ionisch", 8],
            ["dorisch", 8],
        ]) {
            const bp = { parts: r._buildClassicalTemple(ordName, { columnsFront: nFront }) };
            const sh = bp.parts.filter((p) => p.shape === "flutedColumn");
            sigs.add(bp.parts.length + ":" + (sh.length ? sh[0].flutes : 0));
            if (r._stability(bp).inside !== true || r._failsUnderLoad(bp).buckles !== false) varStand = false;
        }
        o.variantsDistinct = sigs.size >= 4 && varStand; // verschiedene + alle physik-garant
        // die flutedColumn-Geometrie baut (Entasis + Kanneluren in EINER Mesh)
        try {
            const g = r._makePartGeometry({
                shape: "flutedColumn",
                size: { x: 1, y: 7, z: 0.82 },
                flutes: 20,
                entasis: 0.05,
            });
            o.flutedGeo = !!(g && g.getAttribute("position") && g.getAttribute("position").count > 100);
        } catch {
            o.flutedGeo = false;
        }
        // PHYSIK-GARANT: steht, knickt nicht, Lastpfad schließt
        o.templeStands = r._stability(temple).inside === true && r._stability(temple).margin > 0;
        o.templeRole = r.computeBlueprintRole(temple) === "architecture";
        o.doricNoBuckle = r._failsUnderLoad(temple).buckles === false;
        const small = { parts: r._buildClassicalTemple("dorisch", { columnsFront: 4, columnsSide: 5 }) };
        o.loadCloses = r._loadPath(small).intact === true && r._loadPath(small).floatingParts.length === 0;
        // KONTRAST: über-schlank knickt
        o.overSlenderBuckles =
            r._failsUnderLoad({
                parts: [
                    {
                        shape: "flutedColumn",
                        material: "stein",
                        size: { x: 0.2, y: 6, z: 0.164 },
                        position: { x: 0, y: 3, z: 0 },
                    },
                ],
            }).buckles === true;
        // die WAND-Verfeinerung: eine breite tragende Wand knickt NICHT (keine freie Säule)
        o.wallNoBuckle =
            r._failsUnderLoad({
                parts: [
                    { shape: "box", material: "stein", size: { x: 8, y: 6, z: 0.34 }, position: { x: 0, y: 3, z: 0 } },
                ],
            }).buckles === false;
        // ── Ω-B2 die Oakeshott-Klinge — AUSLÖSCHUNGS-WELLE: der geraet_schwert-Blueprint fiel;
        // seine Judge-Substanz lebt eingefroren in KIND_SUBSTANCE.geraet_schwert (bladeProfile
        // mit Verjüngung + Hohlkehle) — der Test liest die Substanz-Zeile.
        const KSog = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        const sword = KSog.geraet_schwert ? { parts: JSON.parse(JSON.stringify(KSog.geraet_schwert.parts)) } : null;
        o.swordOk = !!(sword && Array.isArray(sword.parts));
        const blades = o.swordOk ? sword.parts.filter((p) => p.shape === "bladeProfile") : [];
        o.realBlade = blades.length === 1 && blades[0].tipWidth < 1 && typeof blades[0].fuller === "number"; // distale Verjüngung + Hohlkehle
        o.oakeshott = !!(C.OAKESHOTT_TYPES && C.OAKESHOTT_TYPES.XII && C.OAKESHOTT_TYPES.XV);
        o.swordImplement = o.swordOk && r._isGraspableBladeForm(sword) === true; // gestreckt + spitz → Klinge
        try {
            const bg = r._makePartGeometry({
                shape: "bladeProfile",
                size: { x: 0.2, y: 1.4, z: 0.06 },
                tipWidth: 0.34,
                fuller: 0.5,
            });
            o.bladeGeo = !!(bg && bg.getAttribute("position") && bg.getAttribute("position").count > 50);
        } catch {
            o.bladeGeo = false;
        }
        // die Balance (Ω-Φ4) ist gerechnet + typ-abhängig (großes Schwert kopflastiger)
        o.balanceTyped =
            r._swingDynamics({ parts: r._buildBladedWeapon("XIIIa") }).balance >
            r._swingDynamics({ parts: r._buildBladedWeapon("XV") }).balance;
        return o;
    });
    check(
        "Ω-B1: der Tempel folgt der dorischen Ordnung (kannelierte Schäfte + Entasis)",
        res.templeOk && res.doricShafts
    );
    check("Ω-B1: Giebel-Dach + TYMPANON (geschlossen) + zwei Ordnungen", res.pediment && res.tympanon && res.orders);
    check(
        "⟡ Ω-B4 GENERATIV: N Ordnungen×Parameter → N verschiedene Tempel, alle physik-garant",
        res.variantsDistinct === true
    );
    check("Ω-B1: die flutedColumn-Geometrie baut (Entasis + Kanneluren, EINE Mesh)", res.flutedGeo === true);
    check("⟡ Ω-B1 PHYSIK-GARANT: der Tempel steht + liest als Bauwerk", res.templeStands && res.templeRole);
    check(
        "⟡ Ω-B1 PHYSIK-GARANT: die 1:7-Säulen knicken nicht, der Lastpfad schließt",
        res.doricNoBuckle && res.loadCloses
    );
    check(
        "Ω-B1 KONTRAST: über-schlank knickt; eine breite Wand knickt NICHT (V18.242)",
        res.overSlenderBuckles && res.wallNoBuckle
    );
    check(
        "Ω-B2: die Schwert-Substanz (KIND_SUBSTANCE) ist eine echte Klinge (bladeProfile: Verjüngung + Hohlkehle)",
        res.realBlade && res.oakeshott
    );
    check("Ω-B2: die Klingen-Geometrie baut; liest als gehaltene Klinge", res.bladeGeo && res.swordImplement);
    check("⟡ Ω-B2 PHYSIK: die Balance ist GERECHNET (Ω-Φ4), typ-abhängig", res.balanceTyped === true);
}

async function checkBandWave10b(ctx) {
    const { page, check, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Compound-Tag-Affordances (Erkennung + UI) ###
    const wave10bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const AR = r.constructor;
        const out = {};
        try {
            out.thresholdsFrozen = !!AR.AFFORDANCE_THRESHOLDS && Object.isFrozen(AR.AFFORDANCE_THRESHOLDS);
            // Vision-Korrektur 10b.2: Form-Whitelists (WHEEL/LENS/AXIS_SHAPES)
            // wurden ENTFERNT — Affordances emergieren räumlich + tag-basiert,
            // nicht aus shape-Listen.
            out.noShapeWhitelists =
                typeof AR.WHEEL_SHAPES === "undefined" &&
                typeof AR.LENS_SHAPES === "undefined" &&
                typeof AR.AXIS_SHAPES === "undefined";
            out.thresholdsAreSpatial =
                AR.AFFORDANCE_THRESHOLDS.moveable.minSupportParts === 2 &&
                AR.AFFORDANCE_THRESHOLDS.moveable.midlineFactor === 0.5 &&
                AR.AFFORDANCE_THRESHOLDS.moveable.dichteMin === 0.3 &&
                AR.AFFORDANCE_THRESHOLDS.magnifying.axialAlignmentMin === 0.6;
            out.affordanceLabelsExist = !!AR.AFFORDANCE_LABELS && AR.AFFORDANCE_LABELS.moveable === "fahrbar";

            out.emptyBpEmpty = Object.keys(r.computeBlueprintAffordances(null)).length === 0;
            out.bpNoParts = Object.keys(r.computeBlueprintAffordances({ parts: [] })).length === 0;
            // Die kein-Affordance-Kontrolle ist stein_block (Fels, gemessen leer): das Dorf bietet über seine
            // flachen Fundamente emergent `balancing` (form-, nicht tag-getrieben).
            out.steinNoAffordances =
                Object.keys(r.computeBlueprintAffordances(r.state.blueprints.stein_block)).length === 0;

            // moveable
            if (r.state.blueprints["test_10b_car"]) r.deleteBlueprint("test_10b_car");
            r.cloneBlueprint("stein_block", "test_10b_car");
            r.state.blueprints.test_10b_car.parts = [
                __teil("cylinder", "eisen", -1, 0.3, 0, 0.6, 0.4, 0.6),
                __teil("cylinder", "eisen", 1, 0.3, 0, 0.6, 0.4, 0.6),
                __teil("box", "quarz", 0, 1, 0, 1.2, 0.8, 0.6),
            ];
            out.carIsMoveable = r.computeBlueprintAffordances(r.state.blueprints.test_10b_car).moveable === true;

            // VISION-TEST: Box-Stützen (KEINE Cylinder/Torus) + Antrieb → moveable
            // Beweis dass die Form-Whitelist wirklich raus ist und räumliche
            // Konfiguration entscheidet.
            if (r.state.blueprints["test_10b_sled"]) r.deleteBlueprint("test_10b_sled");
            r.cloneBlueprint("stein_block", "test_10b_sled");
            r.state.blueprints.test_10b_sled.parts = [
                // Stein-Boxen als Stütze (NICHT cylinder, NICHT torus)
                __teil("box", "eisen", -1, 0.2, 0, 0.5, 0.4, 0.5),
                __teil("box", "eisen", 1, 0.2, 0, 0.5, 0.4, 0.5),
                // Quarz-Antrieb oben
                __teil("octahedron", "quarz", 0, 1.2, 0, 0.6, 0.6, 0.6),
            ];
            out.boxSledIsMoveable = r.computeBlueprintAffordances(r.state.blueprints.test_10b_sled).moveable === true;

            // ohne Antrieb → nicht moveable
            if (r.state.blueprints["test_10b_carless"]) r.deleteBlueprint("test_10b_carless");
            r.cloneBlueprint("stein_block", "test_10b_carless");
            r.state.blueprints.test_10b_carless.parts = [
                __teil("cylinder", "stein", -1, 0.3, 0, 0.6, 0.4, 0.6),
                __teil("cylinder", "stein", 1, 0.3, 0, 0.6, 0.4, 0.6),
            ];
            out.carlessNotMoveable = !r.computeBlueprintAffordances(r.state.blueprints.test_10b_carless).moveable;

            // magnifying
            if (r.state.blueprints["test_10b_scope"]) r.deleteBlueprint("test_10b_scope");
            r.cloneBlueprint("stein_block", "test_10b_scope");
            r.state.blueprints.test_10b_scope.parts = [
                __teil("sphere", "quarz", 0, 1, 0, 0.5, 0.5, 0.5),
                __teil("cylinder", "holz", 0, 1, -0.6, 0.4, 1.2, 0.4),
            ];
            out.scopeIsMagnifying =
                r.computeBlueprintAffordances(r.state.blueprints.test_10b_scope).magnifying === true;

            // ── W10 ext. — radiating (resonanz-strahlendes Compound) ──
            out.radiatingLabel = AR.AFFORDANCE_LABELS.radiating === "strahlend";
            out.radiatingThresholds =
                !!AR.AFFORDANCE_THRESHOLDS.radiating &&
                AR.AFFORDANCE_THRESHOLDS.radiating.minParts === 3 &&
                AR.AFFORDANCE_THRESHOLDS.radiating.resoniertMin === 1.5;
            // Ein radialer Quarz-Cluster (≥3 Parts, um einen Kern
            // gespreizt, NICHT auf einer Achse) strahlt.
            if (r.state.blueprints["test_10ext_radiator"]) r.deleteBlueprint("test_10ext_radiator");
            r.cloneBlueprint("stein_block", "test_10ext_radiator");
            r.state.blueprints.test_10ext_radiator.parts = [
                __teil("octahedron", "quarz", 1.2, 0.5, 0, 0.6, 0.6, 0.6),
                __teil("octahedron", "quarz", -1.2, 0.5, 0, 0.6, 0.6, 0.6),
                __teil("octahedron", "quarz", 0, 0.5, 1.2, 0.6, 0.6, 0.6),
                __teil("octahedron", "quarz", 0, 0.5, -1.2, 0.6, 0.6, 0.6),
            ];
            out.radiatorIsRadiating =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_radiator).radiating === true;
            // Ein Quarz-Mast (≥3 Parts auf der y-Achse) strahlt NICHT radial — das räumliche Gate greift trotz
            // hohem resoniert (die Konfiguration entscheidet, keine Form-Whitelist).
            if (r.state.blueprints["test_10ext_mast"]) r.deleteBlueprint("test_10ext_mast");
            r.cloneBlueprint("stein_block", "test_10ext_mast");
            r.state.blueprints.test_10ext_mast.parts = [
                __teil("octahedron", "quarz", 0, 0.3, 0, 0.6, 0.6, 0.6),
                __teil("octahedron", "quarz", 0, 0.9, 0, 0.6, 0.6, 0.6),
                __teil("octahedron", "quarz", 0, 1.5, 0, 0.6, 0.6, 0.6),
            ];
            out.mastNotRadiating = r.computeBlueprintAffordances(r.state.blueprints.test_10ext_mast).radiating !== true;
            // Welt-Reaktion: nahe einem Strahler steigen awe + peace.
            const emoR = r.state.player.emotions;
            const aweBefore0 = emoR.awe;
            const peaceBefore0 = emoR.peace;
            const chaosBefore0 = emoR.chaos;
            const radEntry = r.spawnArchitecture("test_10ext_radiator", { x: 60, y: 0, z: 60 }, { silent: true });
            out.radEntryAffordance = !!(radEntry && radEntry.affordances && radEntry.affordances.radiating === true);
            const pmR = r.state.playerMesh && r.state.playerMesh.position;
            const pmBefore = pmR ? { x: pmR.x, y: pmR.y, z: pmR.z } : null;
            if (pmR) {
                pmR.x = 60;
                pmR.y = 0;
                pmR.z = 62;
            }
            emoR.awe = 0.1;
            emoR.peace = 0.1;
            for (let i = 0; i < 30; i++) r.tickAffordances(0.1);
            out.radNearRaisesEmotion = emoR.awe > 0.1 && emoR.peace > 0.1;
            // Weit weg → keine Änderung.
            if (pmR) pmR.z = 400;
            const aweFar = emoR.awe;
            for (let i = 0; i < 10; i++) r.tickAffordances(0.1);
            out.radFarNoChange = Math.abs(emoR.awe - aweFar) < 0.0001;
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10ext_radiator");

            // ── W10 ext. — broadcasting (leitfähiger Relais-Mast) ──
            out.broadcastingLabel = AR.AFFORDANCE_LABELS.broadcasting === "sendend";
            out.broadcastingThresholds =
                !!AR.AFFORDANCE_THRESHOLDS.broadcasting &&
                AR.AFFORDANCE_THRESHOLDS.broadcasting.alignMin === 0.6 &&
                AR.AFFORDANCE_THRESHOLDS.broadcasting.leitfaehigMin === 0.4;
            // Der Quarz-Mast (aufrecht, axial, leitfähig) → broadcasting.
            out.mastIsBroadcasting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_mast).broadcasting === true;
            // Der radiale Cluster ist KEIN Mast → NICHT broadcasting.
            out.radiatorNotBroadcasting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_radiator).broadcasting !== true;
            // Eine waagrechte Eisen-Linie (leitfähig, aber Achse x,
            // nicht y) → NICHT broadcasting (ein Mast steht aufrecht).
            if (r.state.blueprints["test_10ext_bcline"]) r.deleteBlueprint("test_10ext_bcline");
            r.cloneBlueprint("stein_block", "test_10ext_bcline");
            r.state.blueprints.test_10ext_bcline.parts = [
                __teil("cylinder", "eisen", -1.5, 0, 0, 0.4, 0.4, 0.4),
                __teil("cylinder", "eisen", 0, 0, 0, 0.4, 0.4, 0.4),
                __teil("cylinder", "eisen", 1.5, 0, 0, 0.4, 0.4, 0.4),
            ];
            out.horizLineNotBroadcasting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_bcline).broadcasting !== true;
            // Relais: ein broadcasting-Mast nahe einem Strahler verstärkt dessen Reichweite — Spieler 22 m vom
            // Strahler: außerhalb der Basis (14 m), innerhalb der verstärkten (28 m).
            if (pmR) {
                pmR.x = 60;
                pmR.y = 0;
                pmR.z = 82;
            }
            // Cleanup natürlicher Strahler im Test-Bereich.
            r.state.architectures = r.state.architectures.filter((e) => {
                if (!e || !e.position || !e.affordances) return true;
                if (!e.affordances.radiating && !e.affordances.broadcasting) return true;
                const dx = e.position.x - 60;
                const dz = e.position.z - 82;
                // Sicherheits-Distanz > BROADCAST_RELAY_RANGE_M + RADIATING_RANGE_M.
                return dx * dx + dz * dz > 100 * 100;
            });
            const radE = r.spawnArchitecture("test_10ext_radiator", { x: 60, y: 0, z: 60 }, { silent: true });
            emoR.awe = 0.1;
            emoR.peace = 0.1;
            for (let i = 0; i < 20; i++) r.tickAffordances(0.1);
            out.relayOhneMastKeinEffekt = Math.abs(emoR.awe - 0.1) < 0.0001;
            // Jetzt einen broadcasting-Mast nahe den Strahler stellen.
            const mastE = r.spawnArchitecture("test_10ext_mast", { x: 65, y: 0, z: 60 }, { silent: true });
            out.relayMastAffordance = !!(mastE && mastE.affordances && mastE.affordances.broadcasting === true);
            for (let i = 0; i < 20; i++) r.tickAffordances(0.1);
            out.relayMitMastReicheWeiter = emoR.awe > 0.1;
            r.state.architectures = r.state.architectures.filter(
                (e) => e.type !== "test_10ext_radiator" && e.type !== "test_10ext_mast"
            );
            void radE;

            // ── W10 ext. Politur — die Affordance-Stärke skaliert ──
            out.strengthEmptyForNone =
                Object.keys(r.computeAffordanceStrength(r.state.blueprints.stein_block)).length === 0;
            // Ein Quarz-Sphären-Strahler (resoniert 2.7) ist STÄRKER
            // als der Quarz-Octahedron-Strahler (resoniert 1.8) —
            // dieselbe Substanz, andere Form, messbar bessere Antenne.
            if (r.state.blueprints["test_10ext_radstrong"]) r.deleteBlueprint("test_10ext_radstrong");
            r.cloneBlueprint("stein_block", "test_10ext_radstrong");
            r.state.blueprints.test_10ext_radstrong.parts = [
                __teil("sphere", "quarz", 1.2, 0.5, 0, 0.6, 0.6, 0.6),
                __teil("sphere", "quarz", -1.2, 0.5, 0, 0.6, 0.6, 0.6),
                __teil("sphere", "quarz", 0, 0.5, 1.2, 0.6, 0.6, 0.6),
                __teil("sphere", "quarz", 0, 0.5, -1.2, 0.6, 0.6, 0.6),
            ];
            const radWeakStr = r.computeAffordanceStrength(r.state.blueprints.test_10ext_radiator).radiating;
            const radStrongStr = r.computeAffordanceStrength(r.state.blueprints.test_10ext_radstrong).radiating;
            out.radStrengthScales = typeof radWeakStr === "number" && radStrongStr > radWeakStr && radStrongStr <= 1;
            // Ein Quarz-Mast ist eine STÄRKERE Antenne als ein Holz-Mast.
            if (r.state.blueprints["test_10ext_mastweak"]) r.deleteBlueprint("test_10ext_mastweak");
            r.cloneBlueprint("stein_block", "test_10ext_mastweak");
            r.state.blueprints.test_10ext_mastweak.parts = [
                __teil("cylinder", "holz", 0, 0, 0, 0.5, 1, 0.5),
                __teil("cylinder", "holz", 0, 1, 0, 0.5, 1, 0.5),
                __teil("cylinder", "holz", 0, 2, 0, 0.5, 1, 0.5),
            ];
            const mastWeakStr = r.computeAffordanceStrength(r.state.blueprints.test_10ext_mastweak).broadcasting;
            const mastStrongStr = r.computeAffordanceStrength(r.state.blueprints.test_10ext_mast).broadcasting;
            out.mastWeakIsBroadcasting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_mastweak).broadcasting === true;
            out.broadcastStrengthScales = typeof mastWeakStr === "number" && mastStrongStr > mastWeakStr;
            // spawnArchitecture friert die Stärke ein.
            const radSnap = r.spawnArchitecture("test_10ext_radiator", { x: 70, y: 0, z: 70 }, { silent: true });
            out.spawnFreezesStrength = !!(
                radSnap &&
                radSnap.affordanceStrength &&
                typeof radSnap.affordanceStrength.radiating === "number"
            );
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10ext_radiator");
            // Ein STARKER Mast relais-verstärkt weiter als ein SCHWACHER: Spieler 23 m vom Strahler, nur der
            // starke erreicht ihn. Natürliche Strahler/Sender im 100-m-Radius entfernen (sonst kontaminiert).
            if (pmR) {
                pmR.x = 60;
                pmR.y = 0;
                pmR.z = 83;
            }
            r.state.architectures = r.state.architectures.filter((e) => {
                if (!e || !e.position || !e.affordances) return true;
                if (!e.affordances.radiating && !e.affordances.broadcasting) return true;
                const dx = e.position.x - 60;
                const dz = e.position.z - 83;
                return dx * dx + dz * dz > 100 * 100;
            });
            r.spawnArchitecture("test_10ext_radiator", { x: 60, y: 0, z: 60 }, { silent: true });
            r.spawnArchitecture("test_10ext_mastweak", { x: 66, y: 0, z: 60 }, { silent: true });
            emoR.awe = 0.1;
            emoR.peace = 0.1;
            for (let i = 0; i < 20; i++) r.tickAffordances(0.1);
            out.weakMastTooWeak = Math.abs(emoR.awe - 0.1) < 0.0001;
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10ext_mastweak");
            r.spawnArchitecture("test_10ext_mast", { x: 66, y: 0, z: 60 }, { silent: true });
            for (let i = 0; i < 20; i++) r.tickAffordances(0.1);
            out.strongMastReachesFarther = emoR.awe > 0.1;
            r.state.architectures = r.state.architectures.filter(
                (e) => e.type !== "test_10ext_radiator" && e.type !== "test_10ext_mast"
            );

            // ── W10 ext. balancing (gründende Form) ──
            out.balancingLabel = AR.AFFORDANCE_LABELS.balancing === "gründend";
            out.balancingThresholds =
                !!AR.AFFORDANCE_THRESHOLDS.balancing &&
                AR.AFFORDANCE_THRESHOLDS.balancing.bottomHeavyMin === 0.6 &&
                AR.AFFORDANCE_THRESHOLDS.balancing.dichteMin === 1.5;
            // Eine breite, flache, schwere Stein-Box-Plattform gründet.
            if (r.state.blueprints["test_10ext_platform"]) r.deleteBlueprint("test_10ext_platform");
            r.cloneBlueprint("stein_block", "test_10ext_platform");
            r.state.blueprints.test_10ext_platform.parts = [
                __teil("box", "stein", 1.5, 0.2, 0, 1, 0.4, 1),
                __teil("box", "stein", -1.5, 0.2, 0, 1, 0.4, 1),
                __teil("box", "stein", 0, 0.2, 1.5, 1, 0.4, 1),
                __teil("box", "stein", 0, 0.2, -1.5, 1, 0.4, 1),
            ];
            out.platformIsBalancing =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_platform).balancing === true;
            // Ein aufrechter Mast ist hoch, nicht breit → NICHT balancing.
            out.mastNotBalancing = r.computeBlueprintAffordances(r.state.blueprints.test_10ext_mast).balancing !== true;
            // Der Quarz-Cluster ist breit + flach + bodenlastig, aber
            // zu LEICHT (dichte 1.3 < 1.5) → NICHT balancing (der
            // dichte-Gate beweist: nur genuin Schweres gründet).
            out.lightClusterNotBalancing =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_radiator).balancing !== true;
            // Stärke skaliert: eine Stein-Box-Plattform (dichte 2.55)
            // gründet stärker als eine Stein-Cylinder-Plattform (1.7).
            if (r.state.blueprints["test_10ext_platweak"]) r.deleteBlueprint("test_10ext_platweak");
            r.cloneBlueprint("stein_block", "test_10ext_platweak");
            r.state.blueprints.test_10ext_platweak.parts = [
                __teil("cylinder", "stein", 1.5, 0.2, 0, 1, 0.4, 1),
                __teil("cylinder", "stein", -1.5, 0.2, 0, 1, 0.4, 1),
                __teil("cylinder", "stein", 0, 0.2, 1.5, 1, 0.4, 1),
                __teil("cylinder", "stein", 0, 0.2, -1.5, 1, 0.4, 1),
            ];
            const balStrong = r.computeAffordanceStrength(r.state.blueprints.test_10ext_platform).balancing;
            const balWeak = r.computeAffordanceStrength(r.state.blueprints.test_10ext_platweak).balancing;
            out.balancingStrengthScales = typeof balWeak === "number" && balStrong > balWeak && balStrong <= 1;
            // die Welt-Reaktion: der Prüf-Satz (gate:werkstatt-weg)
            emoR.chaos = chaosBefore0;

            // ── W10 ext. lifting (Auftriebs-Feld) ──
            out.liftingLabel = AR.AFFORDANCE_LABELS.lifting === "hebend";
            out.liftingThresholds =
                !!AR.AFFORDANCE_THRESHOLDS.lifting &&
                AR.AFFORDANCE_THRESHOLDS.lifting.magieMin === 1.5 &&
                AR.AFFORDANCE_THRESHOLDS.lifting.dichteMax === 1.0;
            // Ein Quarz-Cone-Cluster (magie 1.7, dichte 0.65) hebt.
            if (r.state.blueprints["test_10ext_lifter"]) r.deleteBlueprint("test_10ext_lifter");
            r.cloneBlueprint("stein_block", "test_10ext_lifter");
            r.state.blueprints.test_10ext_lifter.parts = [
                __teil("cone", "quarz", 1, 0.5, 0, 0.6, 0.8, 0.6),
                __teil("cone", "quarz", -1, 0.5, 0, 0.6, 0.8, 0.6),
                __teil("cone", "quarz", 0, 0.5, 1, 0.6, 0.8, 0.6),
            ];
            out.lifterIsLifting = r.computeBlueprintAffordances(r.state.blueprints.test_10ext_lifter).lifting === true;
            // Eine schwere Stein-Plattform → NICHT lifting (magie zu tief).
            out.platformNotLifting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_platform).lifting !== true;
            // Der Quarz-Octahedron-Cluster ist magie-geladen, aber zu
            // DICHT (dichte 1.3 > 1.0) → NICHT lifting (der dichte-
            // Deckel beweist: Magie hebt kein Gewicht).
            out.denseClusterNotLifting =
                r.computeBlueprintAffordances(r.state.blueprints.test_10ext_radiator).lifting !== true;
            // _liftVerticalVelocity: dämpft den Fall + hebt sanft.
            out.liftCushionsFall = r._liftVerticalVelocity(-10, 1) > -10;
            out.liftDriftsUp = r._liftVerticalVelocity(0, 1) > 0;
            out.liftNoFieldNoEffect = r._liftVerticalVelocity(-10, 0) === -10;
            // Stärke skaliert: ein Quarz-Helix-Heber (magie 2.55) hebt
            // stärker als der Quarz-Cone-Heber (magie 1.7).
            if (r.state.blueprints["test_10ext_lifterstrong"]) r.deleteBlueprint("test_10ext_lifterstrong");
            r.cloneBlueprint("stein_block", "test_10ext_lifterstrong");
            r.state.blueprints.test_10ext_lifterstrong.parts = [
                __teil("helix", "quarz", 1, 0.5, 0, 0.6, 1, 2),
                __teil("helix", "quarz", -1, 0.5, 0, 0.6, 1, 2),
                __teil("helix", "quarz", 0, 0.5, 1, 0.6, 1, 2),
            ];
            const liftWeak = r.computeAffordanceStrength(r.state.blueprints.test_10ext_lifter).lifting;
            const liftStrong = r.computeAffordanceStrength(r.state.blueprints.test_10ext_lifterstrong).lifting;
            out.liftStrengthScales = typeof liftWeak === "number" && liftStrong > liftWeak && liftStrong <= 1;
            // Welt-Reaktion: _tickLiftingAffordances setzt das Feld-Flag.
            const liftE = r.spawnArchitecture("test_10ext_lifter", { x: 80, y: 0, z: 80 }, { silent: true });
            out.liftEntryAffordance = !!(
                liftE &&
                liftE.affordances &&
                liftE.affordances.lifting === true &&
                liftE.affordanceStrength &&
                typeof liftE.affordanceStrength.lifting === "number"
            );
            if (pmR) {
                pmR.x = 80;
                pmR.y = 0;
                pmR.z = 82;
            }
            r._tickLiftingAffordances();
            out.liftFieldActiveNear = !!(r.state.player.liftingField && r.state.player.liftingField.active);
            if (pmR) pmR.z = 400;
            r._tickLiftingAffordances();
            out.liftFieldInactiveFar = !(r.state.player.liftingField && r.state.player.liftingField.active);
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10ext_lifter");

            emoR.awe = aweBefore0;
            emoR.peace = peaceBefore0;
            // Spieler-Position wiederherstellen — nachfolgende Tests
            // erwarten ihn dort, wo der Autonom-Lauf ihn liess.
            if (pmR && pmBefore) {
                pmR.x = pmBefore.x;
                pmR.y = pmBefore.y;
                pmR.z = pmBefore.z;
            }

            // spawnArchitecture speichert affordances
            const entry = r.spawnArchitecture("test_10b_car", { x: 50, y: 0, z: 50 }, { silent: true });
            out.entryHasAffordances = !!(entry && entry.affordances && entry.affordances.moveable === true);

            // Cleanup spawned entry
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10b_car");

            // UI: Werkstatt-Status zeigt "fahrbar"
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            r.selectBlueprintForEdit("test_10b_car");
            r._renderWorkshopDOM();
            // die Affordanzen werden in der „Fähigkeit"-Zeile des intuitiven Stats-Panels
            // angezeigt, nicht im entfernten Editor-Header-Status.
            const spCar = document.getElementById("workshop-stats-panel");
            out.statusShowsAffordance = !!spCar && spCar.textContent.includes("fahrbar");

            // Cleanup
            for (const n of [
                "test_10b_car",
                "test_10b_carless",
                "test_10b_scope",
                "test_10b_sled",
                "test_10ext_radiator",
                "test_10ext_mast",
                "test_10ext_bcline",
                "test_10ext_radstrong",
                "test_10ext_mastweak",
                "test_10ext_platform",
                "test_10ext_platweak",
                "test_10ext_lifter",
                "test_10ext_lifterstrong",
            ]) {
                if (r.state.blueprints[n]) r.deleteBlueprint(n);
            }
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            if (r) r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 10b.1", wave10bResults)) {
        check(
            "Welle 10b.2: AFFORDANCE_THRESHOLDS + LABELS frozen, KEINE Form-Whitelists mehr (Vision-Korrektur)",
            wave10bResults.thresholdsFrozen && wave10bResults.noShapeWhitelists && wave10bResults.affordanceLabelsExist
        );
        check(
            "Welle 10b.2: Schwellen sind räumlich + tag-basiert (minSupportParts=2, midlineFactor=0.5, dichteMin=0.3, axialAlignmentMin=0.6)",
            wave10bResults.thresholdsAreSpatial
        );
        check(
            "Welle 10b.1: leerer/null Bauplan → leere Affordances",
            wave10bResults.emptyBpEmpty && wave10bResults.bpNoParts
        );
        check(
            "Welle 10b.1: affordance-freier Built-in (stein_block) erkennt keine Affordances — ehrlich",
            wave10bResults.steinNoAffordances
        );
        check(
            "Welle 10b.1: Fahrzeug-Compound (2 Cylinder-Stützen + quarz-Antrieb) → moveable=true",
            wave10bResults.carIsMoveable
        );
        check(
            "Welle 10b.2 VISION-TEST: Box-Stützen + Octahedron-Quarz-Antrieb → moveable=true (KEINE Form-Whitelist mehr)",
            wave10bResults.boxSledIsMoveable
        );
        check(
            "Welle 10b.1: Stützen OHNE Antriebs-Tag (nur stein) → NICHT moveable (Diskrimination)",
            wave10bResults.carlessNotMoveable
        );
        check(
            "Welle 10b.1: Teleskop-Compound (Quarz-Linse + Cylinder-Tubus) → magnifying=true",
            wave10bResults.scopeIsMagnifying
        );
        check(
            "Welle 10b.1: spawnArchitecture speichert affordances am entry-Objekt",
            wave10bResults.entryHasAffordances
        );
        check(
            "Welle 10b.1 UI: Werkstatt-Status zeigt erkannte Affordance ('fahrbar') beim Bauplan",
            wave10bResults.statusShowsAffordance
        );
        // ── W10 ext. — radiating ──
        check(
            "W10 ext.: radiating trägt Label + Schwellen",
            wave10bResults.radiatingLabel &&
                wave10bResults.radiatingThresholds
        );
        check(
            "W10 ext.: ein radialer Quarz-Cluster (≥3 Parts, gespreizt) → radiating=true",
            wave10bResults.radiatorIsRadiating
        );
        check(
            "W10 ext.: ein Quarz-Mast (alle Parts auf einer Achse) → NICHT radiating (räumliche Gate, kein Form-Whitelist)",
            wave10bResults.mastNotRadiating
        );
        check(
            "W10 ext.: spawnArchitecture speichert die radiating-Affordance am entry",
            wave10bResults.radEntryAffordance
        );
        check("W10 ext.: nahe einem Strahler steigen awe + peace (Welt-Reaktion)", wave10bResults.radNearRaisesEmotion);
        check(
            "W10 ext.: weit weg vom Strahler keine Emotion-Änderung (Reichweite-Gate)",
            wave10bResults.radFarNoChange
        );
        // ── W10 ext. broadcasting ──
        check(
            "W10 ext.: broadcasting trägt Label 'sendend' + Schwellen",
            wave10bResults.broadcastingLabel && wave10bResults.broadcastingThresholds
        );
        check("W10 ext.: ein aufrechter leitfähiger Quarz-Mast → broadcasting=true", wave10bResults.mastIsBroadcasting);
        check(
            "W10 ext.: ein radialer Cluster ist kein Mast → NICHT broadcasting (komplementär zu radiating)",
            wave10bResults.radiatorNotBroadcasting
        );
        check(
            "W10 ext.: eine waagrechte leitfähige Linie (Achse x, nicht y) → NICHT broadcasting",
            wave10bResults.horizLineNotBroadcasting
        );
        check(
            "W10 ext.: spawnArchitecture speichert die broadcasting-Affordance am entry",
            wave10bResults.relayMastAffordance
        );
        check(
            "W10 ext.: ohne Mast erreicht der Strahler den fernen Spieler NICHT (Basis-Reichweite)",
            wave10bResults.relayOhneMastKeinEffekt
        );
        check(
            "W10 ext.: ein broadcasting-Mast verstärkt als Relais die Strahler-Reichweite (Affordances komponieren)",
            wave10bResults.relayMitMastReicheWeiter
        );
        // ── W10 ext. Politur — die Affordance-Stärke skaliert ──
        check(
            "W10 ext. Politur: computeAffordanceStrength ist leer für ein Compound ohne Affordance",
            wave10bResults.strengthEmptyForNone
        );
        check(
            "W10 ext. Politur: ein resonanter Quarz-Sphären-Strahler ist STÄRKER als der Octahedron-Strahler",
            wave10bResults.radStrengthScales
        );
        check(
            "W10 ext. Politur: ein Holz-Mast ist broadcasting, aber SCHWÄCHER als ein Quarz-Mast",
            wave10bResults.mastWeakIsBroadcasting && wave10bResults.broadcastStrengthScales
        );
        check(
            "W10 ext. Politur: spawnArchitecture friert affordanceStrength am entry ein",
            wave10bResults.spawnFreezesStrength
        );
        check(
            "W10 ext. Politur: ein schwacher Mast relais-verstärkt NICHT bis zum 23-m-Spieler",
            wave10bResults.weakMastTooWeak
        );
        check(
            "W10 ext. Politur: ein starker Mast relais-verstärkt WEITER — er erreicht ihn (eine bessere Antenne)",
            wave10bResults.strongMastReachesFarther
        );
        // ── W10 ext. balancing ──
        check(
            "W10 ext.: balancing trägt Label 'gründend' + Schwellen",
            wave10bResults.balancingLabel &&
                wave10bResults.balancingThresholds
        );
        check(
            "W10 ext.: eine breite flache schwere Stein-Plattform → balancing=true",
            wave10bResults.platformIsBalancing
        );
        check("W10 ext.: ein aufrechter Mast (hoch, nicht breit) → NICHT balancing", wave10bResults.mastNotBalancing);
        check(
            "W10 ext.: ein breiter flacher aber LEICHTER Quarz-Cluster → NICHT balancing (dichte-Gate)",
            wave10bResults.lightClusterNotBalancing
        );
        check(
            "W10 ext.: eine dichtere Plattform gründet stärker (Stärke skaliert)",
            wave10bResults.balancingStrengthScales
        );
        // ── W10 ext. lifting ──
        check(
            "W10 ext.: lifting trägt Label 'hebend' + Schwellen",
            wave10bResults.liftingLabel &&
                wave10bResults.liftingThresholds
        );
        check(
            "W10 ext.: ein magie-geladener leichter Quarz-Cone-Cluster → lifting=true",
            wave10bResults.lifterIsLifting
        );
        check(
            "W10 ext.: eine schwere Stein-Plattform → NICHT lifting (magie zu tief)",
            wave10bResults.platformNotLifting
        );
        check(
            "W10 ext.: ein magie-geladener aber zu DICHTER Quarz-Cluster → NICHT lifting (dichte-Deckel)",
            wave10bResults.denseClusterNotLifting
        );
        check(
            "W10 ext.: _liftVerticalVelocity dämpft den Fall + hebt sanft, ohne Feld kein Effekt",
            wave10bResults.liftCushionsFall && wave10bResults.liftDriftsUp && wave10bResults.liftNoFieldNoEffect
        );
        check(
            "W10 ext.: ein Quarz-Helix-Heber hebt stärker als ein Cone-Heber (Stärke skaliert)",
            wave10bResults.liftStrengthScales
        );
        check(
            "W10 ext.: spawnArchitecture speichert lifting-Affordance + Stärke am entry",
            wave10bResults.liftEntryAffordance
        );
        check(
            "W10 ext.: _tickLiftingAffordances setzt das Auftriebs-Feld nahe einem Heber, löscht es fern (Reichweite-Gate)",
            wave10bResults.liftFieldActiveNear && wave10bResults.liftFieldInactiveFar
        );
    }

    // ### Welt-Reaktionen (die Mount-Absagen + zoom) ###
    const wave10b3Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        try {

            // der fahrbare Bauplan für die Reichweite (100 m fern)
            if (r.state.blueprints["test_10b3_far"]) r.deleteBlueprint("test_10b3_far");
            r.cloneBlueprint("stein_block", "test_10b3_far");
            r.state.blueprints.test_10b3_far.parts = [
                __teil("cylinder", "eisen", -1, 0.3, 0, 0.6, 0.4, 0.6),
                __teil("cylinder", "eisen", 1, 0.3, 0, 0.6, 0.4, 0.6),
                __teil("box", "quarz", 0, 1, 0, 1.2, 0.8, 0.6),
            ];
            // Aufsitzen, Fahren und Absteigen über die echte Taste am gesetzten Wagen trägt diag-werkstatt-weg (L-VERBEN)
            const ppos = r.state.playerMesh.position;
            const dummy = { affordances: { moveable: false } };
            const failRes = r.mountArchitecture(dummy);
            out.nonMoveableRejected = failRes && failRes.ok === false && failRes.reason === "not_moveable";

            // Mount-Range
            r.spawnArchitecture("test_10b3_far", { x: ppos.x + 100, y: ppos.y, z: ppos.z + 100 }, { silent: true });
            const farMountRes = r.toggleMountAtPlayer();
            out.farMountRejected = farMountRes && farMountRes.ok === false && farMountRes.reason === "none_in_range";
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "test_10b3_far");

            // Zoom-Test: _hasMagnifyingInSight raycastet gegen ALLE magnifying-Architekturen; eine autonom
            // gespawnte Geode im Strahl kippte die „kein Target“-Prüfung → Architektur-Liste kurz leeren.
            const initialFov = r.state.camera.fov;
            out.zoomInactiveInitial = !r.state._zoomActive;
            const zoomArchBackup = r.state.architectures;
            r.state.architectures = [];
            const noTargetRes = r.setZoomActive(true);
            r.state.architectures = zoomArchBackup;
            out.zoomFailsWithoutTarget =
                noTargetRes === false && !r.state._zoomActive && r.state.camera.fov === initialFov;

            // das Brennglas (Mittag, Nacht, Regen, Kühlung) trägt diag-werkstatt-weg BRENNGLAS: gebaut über den Bau-Weg
            r.deleteBlueprint("test_10b3_far");
            r._renderWorkshopDOM();
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 10b.3", wave10b3Results)) {
        check(
            "Welle 10b.3: mountArchitecture auf nicht-moveable lehnt ab (not_moveable)",
            wave10b3Results.nonMoveableRejected
        );
        check(
            "Welle 10b.3: Mount-Geste auf entfernte Architektur lehnt ab (none_in_range)",
            wave10b3Results.farMountRejected
        );
        check("Welle 10b.3 Zoom: initial inaktiv (kein _zoomActive)", wave10b3Results.zoomInactiveInitial);
        check(
            "Welle 10b.3 Zoom: setZoomActive(true) ohne magnifying-Target → false-Return + FOV unverändert",
            wave10b3Results.zoomFailsWithoutTarget
        );
    }
}

// Ω6 Namensraum + Wachstumsregel: fremdes Vokabular (x:-präfixiert ODER künftige nackte Achsen)
// REIST (must-preserve) und beeinflusst KEINE Kern-Lesart (must-ignore, behavioral: bit-gleiche
// Rolle/Kosten/Tags/Vektor mit und ohne fremden Tag).
async function checkBandTailleOmega6(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const mkMat = (name, extraTags) => {
            r.state.materials[name] = {
                name,
                label: name,
                builtIn: false,
                color: 0x888888,
                tags: { ...r.constructor.MATERIAL_TAG_DEFAULTS, härte: 0.6, dichte: 0.7, ...extraTags },
            };
        };
        mkMat("_o6_rein", {});
        mkMat("_o6_fremd", { "x:v25:aether": 99, leuchtkraft: 42 });
        const mkBp = (material) => ({
            name: "_o6_bp_" + material,
            label: "Ω6",
            builtIn: false,
            parts: [
                {
                    shape: "cone",
                    material,
                    position: { x: 0, y: 1, z: 0 },
                    size: { x: 0.5, y: 1.2, z: 0.5 },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                },
            ],
            connections: [],
        });
        const a = mkBp("_o6_rein");
        const b = mkBp("_o6_fremd");
        r.state.blueprints[a.name] = a;
        r.state.blueprints[b.name] = b;
        // (1) must-ignore BEHAVIORAL: jede Kern-Lesart ist BIT-GLEICH —
        // das fremde Vokabular (x:-Tag 99 + unbekannte nackte Achse 42)
        // trägt zu KEINER Kern-Resonanz bei.
        out.tagsEqual = JSON.stringify(r.computeCompoundTags(a)) === JSON.stringify(r.computeCompoundTags(b));
        out.vectorEqual = JSON.stringify(r._blueprintProductVector(a)) === JSON.stringify(r._blueprintProductVector(b));
        out.roleEqual = r.computeBlueprintRole(a) === r.computeBlueprintRole(b);
        out.costEqual =
            JSON.stringify(r.computeBuildCost(a.name)).replace(/_o6_rein/g, "M") ===
            JSON.stringify(r.computeBuildCost(b.name)).replace(/_o6_fremd/g, "M");
        // (2) must-preserve: das fremde Vokabular REIST durch den Material-
        // Zwilling (Ω2) bit-gleich.
        const ser = r._serializeMaterial(r.state.materials["_o6_fremd"]);
        out.travels = ser.tags["x:v25:aether"] === 99 && ser.tags["leuchtkraft"] === 42;
        // (3) der KERN ist eingefroren + die Doktrin steht am Kern (frozen +
        // Kommentar-Anker ist Doku; hier der strukturelle Teil).
        out.coreFrozen =
            Object.isFrozen(r.constructor.MATERIAL_TAG_KEYS) && r.constructor.MATERIAL_TAG_KEYS.length === 10;
        // (4) die Wachstumsregel: eine NEUE Achse wäre additiv mit Default 0 —
        // MATERIAL_TAG_DEFAULTS trägt für jede Kern-Achse 0 (per Konstruktion).
        out.defaultsZero = r.constructor.MATERIAL_TAG_KEYS.every((k) => r.constructor.MATERIAL_TAG_DEFAULTS[k] === 0);
        delete r.state.blueprints[a.name];
        delete r.state.blueprints[b.name];
        delete r.state.materials["_o6_rein"];
        delete r.state.materials["_o6_fremd"];
        return out;
    });
    if (!res) {
        check("Ω6: Namensraum-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Ω6: must-ignore BEHAVIORAL — fremdes Vokabular ändert KEIN Kern-Bit (Tags · Vektor · Rolle · Kosten)",
        res.tagsEqual && res.vectorEqual && res.roleEqual && res.costEqual
    );
    check("Ω6: must-preserve — das fremde Vokabular reist bit-gleich (x:-Tag · künftige Achse)", res.travels);
    check("Ω6: der anazh-Kern ist eingefroren (10 Achsen, frozen, Doktrin am Kern verankert)", res.coreFrozen);
    check("Ω6: die Wachstumsregel steht (neue Achsen additiv, Default 0 per Konstruktion)", res.defaultsZero);
}

// Ψ0: paarweise Kosinus-Winkel aller Signaturen je Tabelle gegen die kalibrierte Baseline
// (diag-band-belegung) — ein Paar ENGER als die akzeptierte Geschwister-Nähe wird ROT. FORM_ROLE
// trägt zusätzlich eine harte Schranke (0.35): dort wird Übersprechen zur falschen ROLLE.
async function checkBandPsi0Winkel(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const A = window.anazhRealm.constructor;
        const cos = (a, b) => {
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            let dot = 0;
            let na = 0;
            let nb = 0;
            for (const k of keys) {
                const va = Number(a[k]) || 0;
                const vb = Number(b[k]) || 0;
                dot += va * vb;
                na += va * va;
                nb += vb * vb;
            }
            return na && nb ? dot / Math.sqrt(na * nb) : 0;
        };
        const maxCos = (table) => {
            const names = Object.keys(table || {}).filter((k) => table[k] && typeof table[k] === "object");
            let max = 0;
            let warn = 0;
            let top = "";
            for (let i = 0; i < names.length; i++) {
                for (let j = i + 1; j < names.length; j++) {
                    const num = (sig) => {
                        const o = {};
                        for (const k of Object.keys(sig)) if (Number.isFinite(Number(sig[k]))) o[k] = Number(sig[k]);
                        return o;
                    };
                    const c = cos(num(table[names[i]]), num(table[names[j]]));
                    if (c > 0.85) warn++;
                    if (c > max) {
                        max = c;
                        top = `${names[i]}↔${names[j]}`;
                    }
                }
            }
            return { max: Math.round(max * 1000) / 1000, warn, top };
        };
        return {
            role: maxCos(A.ROLE_SIGNATURES),
            form: maxCos(A.FORM_ROLE_SIGNATURES),
            motion: maxCos(A.MOTION_ROLE_SIGNATURES),
            workshop: maxCos(A.WORKSHOP_DOMAIN_SIGNATURES),
            op: maxCos(A.OP_CLASS_SIGNATURES),
        };
    });
    // FROZEN-Baseline: ROLE max 0.931 / 7 Paare > 0.85 (die bewusste
    // dichte-harte Familie brecher·armor·architecture·workshop-station + held·tool);
    // FORM 0.220 · MOTION 0.625 · WORKSHOP 0.056 · OP 0.023 (das Gemüt kommt aus Gattung und Größe).
    check(
        `Ψ0 Spektrum-Register: kein Signatur-Paar enger als die kalibrierte Baseline (max ${res.role.max} [${res.role.top}] ≤ 0.94 · >0.85-Paare ${res.role.warn} ≤ 7)`,
        res.role.max <= 0.94 && res.role.warn <= 7
    );
    check(
        `Ψ0 KLASSIFIKATOR bleibt orthogonal: FORM_ROLE max ${res.form.max} ≤ 0.35 (hart — hier wird Übersprechen zur falschen Rolle)`,
        res.form.max <= 0.35
    );
    check(
        `Ψ0 die übrigen Register unter Baseline: MOTION ${res.motion.max} ≤ 0.65 · WORKSHOP ${res.workshop.max} ≤ 0.07 · OP ${res.op.max} ≤ 0.04`,
        res.motion.max <= 0.65 && res.workshop.max <= 0.07 && res.op.max <= 0.04
    );

    // Ψ1 — das EINE argmax-Organ: die ~7 Inline-
    // Loops sind VERDICHTET. KONSUM aller Leser am Ruf + die Organ-
    // Semantik behavioral (floor strikt > · refs/refDefault-Norm · keys-Subset).
    const psi1 = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        // ein Werk aus zwei Parts (Eisen-Block + Holz-Stiel): jeder Leser ruft das Organ unbedingt
        const bpK = { name: "_psi1", connections: [], parts: [
            __teil("box", "eisen", 0, 0.5, 0, 1, 1, 1),
            __teil("cylinder", "holz", 0, 1.6, 0, 0.2, 1.2, 0.2),
        ] };
        const liest = (m, args) => window.__consumes(r, m, r, "_resonateArgmax", args);
        // das Temperament fiel aus dem Organ (Vertrags-Akt: temperamentDerGattung aus Ernährung × Masse — die
        // Tiere sind tag-gleich, Lehre 8; die Kreatur-Linse `temperament` hält es)
        out.leser =
            liest("_computeWorkshopDomain", [bpK]) &&
            liest("_blueprintRoleGapHint", [bpK, "weapon"]) &&
            liest("_computeFormRole", [bpK]) &&
            liest("_argmaxImplementRole", [bpK]) &&
            liest("_computeToolOpFromForm", [bpK]) &&
            liest("computeMotionRoles", [bpK.parts, bpK.connections]);
        // Behavioral: argmax + strikt-> floor + refs-Norm + keys-Subset.
        const tab = { x: { a: 2 }, y: { a: 3 }, z: { b: 9 } };
        const v = { a: 1 };
        out.argmax = r._resonateArgmax(v, tab).key === "y";
        out.floorStrikt = r._resonateArgmax(v, tab, { floor: 3 }).key === null; // 3 > 3 ist falsch
        out.refsNorm = r._resonateArgmax(v, tab, { refs: { y: 10 }, refDefault: 1 }).key === "x"; // 2/1 > 3/10
        out.subset = r._resonateArgmax(v, tab, { keys: ["x"] }).key === "x";
        return out;
    });
    check(
        "Ψ1 das EINE argmax-Organ: alle 6 Inline-Leser konsumieren _resonateArgmax (Domäne·GapHint·FormRolle·Implement·Op·Motion)",
        psi1.leser
    );
    check(
        "Ψ1 Organ-Semantik: argmax + strikt-über-floor + refs/refDefault-Norm + keys-Subset (bit-gleiche Inline-Form)",
        psi1.argmax && psi1.floorStrikt && psi1.refsNorm && psi1.subset
    );
}

// Die Λ-Bänder (checkBandLambda* + checkBandV18177AAA) sind eigenständige Mess-Wände — eine
// Regression wird als Λ-Klassifikation rot, nicht versteckt in fremden Source-Probes.
// Λ.1: ein humanoider Körper (lebendige Masse mittig) ist body-shaped, ein Stein-Tempel nicht.
async function checkBandLambda1LivingCenter(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        // Humanoid Body — anatomisch (Kopf/Rumpf oben, Beine unten, fleisch).
        const humanoid = {
            parts: [
                __teil("box", "fleisch", 0, 1.2, 0, 0.9, 1.6, 0.5),
                __teil("cylinder", "fleisch", -0.95, 1.1, 0, 0.3, 1.3, 0.3),
                __teil("cylinder", "fleisch", 0.95, 1.1, 0, 0.3, 1.3, 0.3),
                __teil("cylinder", "fleisch", -0.4, 0, 0, 0.35, 1.2, 0.35),
                __teil("cylinder", "fleisch", 0.4, 0, 0, 0.35, 1.2, 0.35),
            ],
        };
        // Stein-Tempel — symmetrisch + vertikal, aber NICHT lebendig → !_isBodyShaped.
        const steinTempel = {
            parts: [
                __teil("box", "stein", 0, 3, 0, 4, 2, 4),
                __teil("cylinder", "stein", -1.5, 1, -1.5, 0.6, 2, 0.6),
                __teil("cylinder", "stein", 1.5, 1, -1.5, 0.6, 2, 0.6),
                __teil("cylinder", "stein", -1.5, 1, 1.5, 0.6, 2, 0.6),
                __teil("cylinder", "stein", 1.5, 1, 1.5, 0.6, 2, 0.6),
            ],
        };
        out.humanoidBody = r._isBodyShaped(humanoid);
        out.steinTempelNotBody = !r._isBodyShaped(steinTempel);
        // SUBSTANCE_ROLE_THRESHOLDS.body trägt die drei Λ.1-Felder.
        const T = r.constructor.SUBSTANCE_ROLE_THRESHOLDS.body;
        out.thresholdsExist =
            Number.isFinite(T.livingMassMin) &&
            Number.isFinite(T.livingCenterMinY) &&
            Number.isFinite(T.livingCenterMaxY);
        return out;
    });
    check(
        "Λ.1 LivingCenter: humanoide Body (fleisch, lebendig-Masse mittig) ist body-shaped",
        res.humanoidBody === true
    );
    check(
        "Λ.1 LivingCenter: Stein-Tempel (symmetrisch+vertikal aber lebendig=0) ist NICHT body-shaped",
        res.steinTempelNotBody === true
    );
    check(
        "Λ.1 LivingCenter: SUBSTANCE_ROLE_THRESHOLDS.body trägt livingMassMin + livingCenterMinY + livingCenterMaxY",
        res.thresholdsExist === true
    );
}

async function checkBandV18266RockDetail(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        if (typeof THREE === "undefined") return out;
        const triOf = (g) =>
            g && g.attributes && g.attributes.position
                ? g.index
                    ? g.index.count / 3
                    : g.attributes.position.count / 3
                : 0;
        // Kleiner Kiesel (<0.7 m) → det 0 (20-Flächen-Ikosaeder), grosser Brocken
        // (≥0.7 m) → det 1 (80 Flächen). Explizites noiseDetail bleibt Override.
        const small = r._makePartGeometry({ shape: "noiserock", material: "stein", size: { x: 0.5, y: 0.4, z: 0.5 } });
        const big = r._makePartGeometry({ shape: "noiserock", material: "stein", size: { x: 1.5, y: 1.2, z: 1.4 } });
        const override = r._makePartGeometry({
            shape: "noiserock",
            material: "stein",
            size: { x: 0.5, y: 0.4, z: 0.5 },
            noiseDetail: 1,
        });
        out.smallTris = triOf(small);
        out.bigTris = triOf(big);
        out.overrideTris = triOf(override);
        // det 0 = 20 Dreiecke, det 1 = 80 Dreiecke (IcosahedronGeometry).
        out.smallLow = out.smallTris > 0 && out.smallTris <= 24; // det 0
        out.bigHigher = out.bigTris >= 60; // det 1 (≥ 60, behält Facetten)
        out.smallCheaperThanBig = out.smallTris * 3 <= out.bigTris; // 4× billiger
        out.overrideHonored = out.overrideTris >= 60; // noiseDetail:1 erzwingt det 1 trotz kleiner Grösse
        return out;
    });
    check(`kleiner Kiesel ist low-poly (${res.smallTris} Dreiecke, det 0)`, res.smallLow === true);
    check(
        `grosser Brocken behält Facetten (${res.bigTris} Dreiecke) — nur kleine Steine schrumpfen`,
        res.bigHigher === true && res.smallCheaperThanBig === true
    );
    check(
        "explizites noiseDetail bleibt Intent-Override",
        res.overrideHonored === true
    );
}

module.exports = {
    checkBandWaves1to3, checkBandV1767WorkshopDomainEmergent, checkBandOmegaGrammatik, checkBandWave10b,
    checkBandTailleOmega6, checkBandPsi0Winkel, checkBandLambda1LivingCenter, checkBandV18266RockDetail,
};
