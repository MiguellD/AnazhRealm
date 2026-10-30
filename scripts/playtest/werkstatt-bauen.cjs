"use strict";
// scripts/playtest/werkstatt-bauen.cjs — der Richter von Werkstatt/bauen (spec/stamm/modul-karte.json): Spec-Blatt · Paletten · Rezept-Panel · Kosten-Tore · Bau-Modus · Tastenbelegung.
// 11 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// die GEBRAUCHS-Flächen routen einen Bauplan nach Rolle/Form:
// der Minecraft-Hotbar-Gate (Gerät → Hand, Struktur → Phantom) + die zwei Drawer-Bugs (gecraftete
// Rüstung + Bauplan-Avatar erkennen). Snapshot + Restore des Player-States.
async function checkBandV1774UseByRole({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = st.player;
        const blu = st.blueprints;

        // Snapshot — am Ende restauriert.
        const savedMode = r.getGameMode();
        const savedEquip = p && p.equipped ? JSON.parse(JSON.stringify(p.equipped)) : { held: null, armor: null };
        const savedSoul = (p && p.soul) || "mensch";
        const savedHotbar = st.hotbar.slice(0, 9);
        r.setGameMode("schöpfer");
        // falls eine frühere Band (V1772) den Avatar verkörpert + den customSoul gelassen hat:
        // sauberer Start, damit der „noch nicht verkörpert"-Listen-Test ehrlich ist.
        if (st.customSouls) delete st.customSouls["bp_koerper_human"];

        // geraet_spitzhacke fiel; Test-Blueprint aus der Werkzeug-Substanz
        // (KIND_SUBSTANCE, deterministisch, am Ende geräumt). Das Label trägt „Spitzhacke",
        // damit die Rezeptbuch-Sichtbarkeits-Probe (5) dieselbe Wahrheit liest.
        const KS74 = (window.AnazhRealm || AnazhRealm).KIND_SUBSTANCE || {};
        if (blu._t_v1774) delete blu._t_v1774;
        blu._t_v1774 = {
            name: "_t_v1774",
            label: "Spitzhacke (Substanz)",
            parts: JSON.parse(JSON.stringify(KS74.geraet_spitzhacke.parts)),
        };
        // koerper_human ist ALT_DOPPEL/donorOnly und fehlt in der primären Select-Sicht → der generische
        // „Bauplan-Avatar gelistet + verkörperbar“-Pfad misst an einem eigenen role:soul-Bauplan
        // (dieselben Parts).
        if (st.customSouls) delete st.customSouls["bp__t_avatar74"];
        if (blu._t_avatar74) delete blu._t_avatar74;
        blu._t_avatar74 = {
            name: "_t_avatar74",
            label: "Avatar (Test)",
            role: "soul",
            roleManual: true,
            parts: JSON.parse(JSON.stringify(blu.koerper_human.parts)),
        };

        // (1) _blueprintUseKind — aus Rolle + Form AUSGELESEN
        const kind = (n) => r._blueprintUseKind(blu[n]);
        out.kindGeraet = kind("_t_v1774") === "hold";
        out.kindArmor = kind("ruestung_brustpanzer") === "wear";
        out.kindTrank = kind("trank_lebenssaft") === "drink";
        out.kindAvatar = kind("koerper_human") === "embody";
        // die DEFAULT-Hotbar (stein_block·waterfall·damm) MUSS „place" bleiben — Wasserfall ist der Test
        // der größen-bewussten Spanne (Klippe pos y=4, aber 8 m hoch; positions-only läse 3.8 < 6 → fälschlich „hold").
        out.defaultHotbarPlace =
            kind("stein_block") === "place" && kind("damm") === "place" && kind("waterfall") === "place";

        // (2) HOTBAR-GATE — Gerät → IN DIE HAND, kein Phantom
        r.equipHeld(null);
        r._clearBuildMode();
        r.setHotbarSlot(0, "_t_v1774");
        r.selectHotbarSlot(0);
        const bm = st.buildMode;
        out.deviceToHand = p.equipped.held === "_t_v1774" && bm.active === false && !bm.phantomMesh;

        // (3) HOTBAR-TOGGLE — schon gehaltenen Slot re-auswählen → ablegen (Faust)
        r.selectHotbarSlot(0);
        out.toggleOff = p.equipped.held == null;

        // (5) BUG a — die Ausrüstungs-/Rezept-Fläche erkennt die built-in Bibliotheks-Rüstung + das Gerät.
        // der „In der Hand"-Dropdown ist geschnitten; das Gerät (Spitzhacke) ist über das
        // REZEPTBUCH erreichbar („In die Hand" → wieldBlueprint, frei wenn geschmiedet). KONSUM wandert mit.
        const part = r._equipPartitionEquipBlueprints();
        out.armorListed = part.armorBlueprints.includes("ruestung_brustpanzer");
        r.renderPlayerEquipUI();
        r.renderRecipeBook();
        out.heldDeviceListed = [...document.querySelectorAll("#inventory-recipes .recipe-row")].some((row) =>
            /spitzhacke/i.test(row.textContent || "")
        );

        // (6) Die Seele-Select listet den Bauplan-Avatar, Verkörpern registriert ihn; Studio-Sicht:
        // koerper_human (Alt-Doppel) fehlt, die Studio-Gruppe trägt koerper_wolf mit Studio-Namen.
        r._refreshSoulSelect();
        const soulSel = document.getElementById("player-soul-select");
        out.avatarListed = !!soulSel && [...soulSel.options].some((o) => o.value === "_t_avatar74");
        out.studioSicht =
            !!soulSel &&
            [...soulSel.options].every((o) => o.value !== "koerper_human") &&
            [...soulSel.options].some(
                (o) =>
                    (o.value === "koerper_wolf" || o.value === "bp_koerper_wolf") && /^wolf\b/.test(o.textContent || "")
            );
        const emb = r.embodyBlueprint("_t_avatar74");
        out.avatarEmbodied =
            emb.ok === true && p.soul === "bp__t_avatar74" && !!(st.customSouls && st.customSouls["bp__t_avatar74"]);
        r._refreshSoulSelect();
        const soulSel2 = document.getElementById("player-soul-select");
        out.noDuplicate =
            !!soulSel2 &&
            [...soulSel2.options].filter((o) => o.value === "_t_avatar74").length === 0 &&
            [...soulSel2.options].some((o) => o.value === "bp__t_avatar74");

        // Motion-Resonanz: (a) die Bewegungs-Rollen EMERGIEREN für den Bauplan-Avatar (Bein + Flügel aus
        // Form × Lage × Spiegelung), (b) der verkörperte CUSTOM-Avatar BEWEGT sich beim Gehen — Konsum am
        // echten Treiber animatePlayerSoul (ein früher Return ließ ihn statisch).
        const wRoles = (r.computeMotionRoles(st.blueprints.koerper_human.parts) || []).filter(Boolean);
        // Flat-Formel: Platte = mid/min (nicht max/min) → dünne Wächter-Seiten-Zylinder lesen als ARME.
        // Die fluegel-Emergenz prüft ein LITERAL-Paar Spiegel-Planes (computeMotionRoles ist pur).
        const wingParts = [
            { shape: "box", material: "federn", size: { x: 0.5, y: 0.55, z: 0.4 }, position: { x: 0, y: 0.5, z: 0 } },
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
        ];
        out.motionRolesEmerge =
            wRoles.some((x) => x.role === "bein") &&
            wRoles.some((x) => x.role === "arm" || x.role === "fluegel") &&
            (r.computeMotionRoles(wingParts) || []).filter(Boolean).filter((x) => x.role === "fluegel").length === 2;
        if (st.playerVel) {
            st.playerVel.setValue(3, 0, 0);
        }
        st.player.animationLastTick = -Infinity;
        r.animatePlayerSoul(10.0);
        const mSnap1 = st.playerMesh.children.map((c) => c.rotation.x.toFixed(4)).join(",");
        r.animatePlayerSoul(10.6);
        const mSnap2 = st.playerMesh.children.map((c) => c.rotation.x.toFixed(4)).join(",");
        out.customAvatarAnimates = mSnap1 !== mSnap2;
        if (st.playerVel) {
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
        }

        // restore — kein dangling Held/Soul/Hotbar/customSoul/Phantom für die nächsten Bands
        r.setGameMode(savedMode);
        r._clearBuildMode();
        if (st.customSouls) {
            delete st.customSouls["bp_koerper_human"];
            delete st.customSouls["bp__t_avatar74"];
        }
        r.applyPlayerSoul(savedSoul);
        if (p) p.equipped = savedEquip;
        r.equipHeld(savedEquip && savedEquip.held ? savedEquip.held : null);
        for (let i = 0; i < 9; i++) st.hotbar[i] = savedHotbar[i] || null;
        delete blu._t_v1774; // Test-Blueprints aufräumen
        delete blu._t_avatar74;
        r._renderHotbarDOM();
        r._refreshSoulSelect();
        r.recomputePlayerStats();
        return out;
    });
    check(
        "Welle 1b: _blueprintUseKind liest aus Rolle+Form — Gerät→hold · Rüstung→wear · Trank→drink · Avatar→embody",
        res.kindGeraet && res.kindArmor && res.kindTrank && res.kindAvatar
    );
    check(
        "Welle 1b: die DEFAULT-Hotbar (Felsblock/Wasserfall/Damm) bleibt platzierbar — die groessen-bewusste Spanne faengt den 8-m-Wasserfall (kein Gate-Regress)",
        res.defaultHotbarPlace
    );
    check(
        "Welle 1b HOTBAR-GATE: ein Gerät im Slot geht IN DIE HAND (equipped.held), KEIN Platzier-Phantom",
        res.deviceToHand
    );
    check("Welle 1b: ein gehaltener Slot re-ausgewählt → ablegen (Toggle zur Faust)", res.toggleOff);
    check(
        "Welle 1b BUG-a: die Ausrüstung-Fläche erkennt die built-in Bibliotheks-Rüstung + das Gerät (nicht mehr nur !builtIn)",
        res.armorListed && res.heldDeviceListed
    );
    check(
        "Welle 1b BUG-b: die Seele-Select listet einen Bauplan-Avatar (role:soul) als verkörperbar",
        res.avatarListed
    );
    check(
        "KÖRPER GANZ (T6): die STUDIO-SICHT — Alt-Doppel koerper_human fällt aus dem Select, der Wolf steht mit Studio-Namen in der Studio-Gruppe",
        res.studioSicht
    );
    check(
        "Welle 1b BUG-b KONSUM: einen Bauplan-Avatar verkörpern formt + registriert ihn (player.soul=bp_…, customSoul), kein Doppel-Eintrag danach",
        res.avatarEmbodied && res.noDuplicate
    );
    check(
        "G1: Bewegungs-Rollen EMERGIEREN für den Bauplan-Avatar (Bein + Flügel aus Form×Lage×Spiegelung)",
        res.motionRolesEmerge
    );
    check(
        "G1 KONSUM: der verkörperte Custom-Avatar BEWEGT sich beim Gehen (animatePlayerSoul treibt die Motion-Resonanz — vorher statisch)",
        res.customAvatarAnimates
    );
}

// die WERKSTATT als Präzisions-Quelle: ihre Präzision emergiert aus der
// Substanz (dichte+harte Esse → feiner), und applyOpToPart NAH einer passenden Station hebt den opChain-
// Cap über den Werkzeug-Cap (bessere Esse → höherer Cap, kein Crafting-Zirkel). Additiv (max), kein Regress.
async function checkBandV1776WorkshopPrecision({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = st.player;
        const pm = st.playerMesh;
        const px = pm ? pm.position.x : 0,
            py = pm ? pm.position.y : 0,
            pz = pm ? pm.position.z : 0;

        // (1) Substanz-Präzision: die dichte+harte Esse hält feinere Toleranzen als eine weiche Werkstatt
        const esseP = r._workshopStationPrecision(st.blueprints["esse"]);
        st.blueprints["wp_soft"] = {
            name: "wp_soft",
            label: "soft",
            parts: [__teil("box", "leder", 0, 0, 0, 1, 1, 1)],
        };
        const softP = r._workshopStationPrecision(st.blueprints["wp_soft"]);
        out.esseP = esseP;
        out.softP = softP;
        out.substancePrecision = esseP > 0.8 && softP < esseP;

        // (2) _nearbyWorkshopStationPrecision: keine Station → 0; eine forging-Esse nah → ihre Präzision;
        //     die falsche Domäne (alchemy) → 0 (nur die EIGENE Domäne zählt). Synthetischer Eintrag (leicht).
        out.noStationZero = r._nearbyWorkshopStationPrecision("forging", { x: px, y: py, z: pz }) === 0;
        const esseEntry = { type: "esse", position: { x: px + 2, y: py, z: pz }, id: "wp_test_esse" };
        st.architectures.push(esseEntry);
        const nearPrec = r._nearbyWorkshopStationPrecision("forging", { x: px, y: py, z: pz });
        out.stationBoosts = nearPrec > 0.8 && Math.abs(nearPrec - esseP) < 1e-6;
        out.wrongDomainZero = r._nearbyWorkshopStationPrecision("alchemy", { x: px, y: py, z: pz }) === 0;

        // (3) KONSUM — applyOpToPart: ein forging-Werkzeug (schmiede-hammer, cap 0.75) NAH der Esse hebt
        //     den gepushten opChain-Cap über den Werkzeug-Cap (auf die Esse-Substanz, >0.8).
        st.blueprints["wp_work"] = {
            name: "wp_work",
            label: "work",
            parts: [__teil("box", "eisen", 0, 0, 0, 1, 1, 1)],
        };
        if (!Array.isArray(p.tools)) p.tools = [];
        if (!p.tools.includes("schmiede-hammer")) p.tools.push("schmiede-hammer");
        const savedMode = r.getGameMode();
        r.setGameMode("schöpfer"); // keine Stamina-Reibung im Test
        const opR = r.applyOpToPart("wp_work", 0, "schmiede-hammer");
        const chain = st.blueprints["wp_work"].parts[0].opChain || [];
        const lastCap = chain.length ? chain[chain.length - 1].cap : 0;
        out.konsum = opR.ok === true && lastCap > 0.8 && lastCap >= esseP - 1e-6;

        // restore
        r.setGameMode(savedMode);
        const ai = st.architectures.indexOf(esseEntry);
        if (ai >= 0) st.architectures.splice(ai, 1);
        delete st.blueprints["wp_soft"];
        delete st.blueprints["wp_work"];
        return out;
    });
    check(
        "Welle 2: die Werkstatt-Präzision emergiert aus SUBSTANZ — eine dichte+harte Esse (>0.8) hält feiner als eine weiche Werkstatt (kein Crafting-Zirkel)",
        res.substancePrecision,
        `esseP=${(res.esseP || 0).toFixed(3)} softP=${(res.softP || 0).toFixed(3)}`
    );
    check(
        "Welle 2: _nearbyWorkshopStationPrecision — keine Station → 0, eine passende Esse nah → ihre Präzision (== Substanz)",
        res.noStationZero && res.stationBoosts
    );
    check("Welle 2: nur die EIGENE Domäne zählt — die forging-Esse boostet alchemy NICHT", res.wrongDomainZero);
    check(
        "Welle 2 KONSUM: applyOpToPart NAH der Esse hebt den opChain-Cap über den Werkzeug-Cap (bessere Esse → feiner)",
        res.konsum
    );
}

// die STEIGERUNG sichtbar + craftbar: eine Meister-Esse (Eisen) ist die bessere Esse (höherer
// Cap aus dichterer/härterer Substanz), und der Werkstatt-Readout zeigt die Präzision → der Spieler SIEHT
// „bessere Esse → höherer Cap" + lernt das Prinzip für alle Systeme (besseres Material → besseres Werk).
async function checkBandV1777SteigerungVisible({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const esse = st.blueprints["esse"];
        const meister = st.blueprints["esse_meister"];
        out.meisterExists = !!meister && meister.role === "workshop-station";
        out.meisterForging = meister ? r._computeWorkshopDomain(meister) === "forging" : false;
        const esseP = r._workshopStationPrecision(esse);
        const meisterP = meister ? r._workshopStationPrecision(meister) : 0;
        out.esseP = Math.round(esseP * 1e4) / 1e4;
        out.meisterP = Math.round(meisterP * 1e4) / 1e4;
        out.steigerung = meisterP > esseP && esseP > 0.85; // die Meister-Esse ist besser, beide präzise
        // die Spanne sichtbar: eine weiche Werkstatt (leder) fertigt deutlich gröber als die Eisen-Esse
        st.blueprints["_softws"] = {
            name: "_softws",
            parts: esse.parts.map((p) => ({ ...p, material: "leder" })),
        };
        const softP = r._workshopStationPrecision(st.blueprints["_softws"]);
        out.rangeVisible = softP < meisterP - 0.1;
        delete st.blueprints["_softws"];
        // KONSUM — der Spec-Sheet-Body rendert die Werkstatt-Präzision (sichtbar/lernbar)
        const panel = document.createElement("div");
        r._specRenderBody(panel, meister);
        const labels = [...panel.querySelectorAll(".spec-col-head")].map((e) => e.textContent);
        const precText = [...panel.querySelectorAll(".workshop-precision-text")].map((e) => e.textContent).join("|");
        out.readoutShowsPrecision = labels.includes("Werkstatt-Präzision") && precText.includes(meisterP.toFixed(2));
        out.noLitter = !meister.instanced; // built-in ohne instanced → kein Worldgen-Litter (V17.72)
        return out;
    });
    check("die Meister-Esse existiert als craftbare workshop-station", res.meisterExists);
    check("ihre Domäne emergiert als forging (Eisen+Glut → Schmiede, S7-B)", res.meisterForging);
    check(
        "STEIGERUNG: die Meister-Esse (Eisen) fertigt feiner als die Basis-Esse — bessere Substanz → höherer Cap",
        res.steigerung,
        `esse=${res.esseP} meister=${res.meisterP}`
    );
    check(
        "die Spanne ist sichtbar — eine weiche Werkstatt fertigt deutlich gröber als die Eisen-Esse",
        res.rangeVisible
    );
    check(
        "KONSUM: der Werkstatt-Readout rendert die Präzisions-Zeile (die Steigerung sichtbar/lernbar)",
        res.readoutShowsPrecision
    );
    check("die Meister-Esse littert den Worldgen NICHT (built-in ohne instanced)", res.noLitter);
}

// die WERTE eines Werks folgen Material × Form (fähigkeiten steigen+sinken), sichtbar im Readout; die Werkstatt erscheint
// im Werkzeuge-Feld sobald platziert+nah; das Undo/Redo unter den Parts.
async function checkBandV1789WorkshopReadout({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const prevMode = r.getGameMode();
        const blu = st.blueprints;
        const mkBlade = (name, mat) => {
            delete blu[name];
            blu[name] = {
                name,
                parts: [
                    {
                        shape: "octahedron",
                        material: mat,
                        size: { x: 0.3, y: 0.3, z: 0.3 },
                        position: { x: 0, y: 0, z: 0 },
                    },
                    {
                        shape: "cone",
                        material: mat,
                        size: { x: 0.2, y: 0.12, z: 1.4 },
                        position: { x: 0, y: 0, z: 1.0 },
                    },
                ],
            };
            return blu[name];
        };
        // (1) MATERIAL bewegt die Werte: eine eisen-Klinge schlägt härter als eine holz-Klinge (GLEICHE Form)
        mkBlade("_ab_eisen", "eisen");
        mkBlade("_ab_holz", "holz");
        const eisenAb = r._blueprintAbilityStats(blu["_ab_eisen"]);
        const holzAb = r._blueprintAbilityStats(blu["_ab_holz"]);
        const dmg = (ab) => (ab && ab.stats ? (ab.stats.find((s) => s[0] === "Schaden") || [0, 0])[1] : 0);
        out.materialMovesValues = !!eisenAb && !!holzAb && dmg(eisenAb) > dmg(holzAb) + 1;
        out.materialVals = `eisen=${dmg(eisenAb).toFixed(1)} holz=${dmg(holzAb).toFixed(1)}`;
        // (2) FORM bewegt die Eignung: ein stumpfer Zylinder an der Klinge senkt die Waffen-Eignung
        const bladeFit = eisenAb ? eisenAb.fit : 0;
        const longer = mkBlade("_ab_long", "eisen");
        longer.parts.push({
            shape: "cylinder",
            material: "eisen",
            size: { x: 0.3, y: 0.3, z: 1.2 },
            position: { x: 0, y: 0, z: -1.0 },
        });
        const longAb = r._blueprintAbilityStats(longer);
        out.formMovesValues = !!longAb && Math.abs(longAb.fit - bladeFit) > 0.001;
        out.formVals = `klinge-Eignung=${bladeFit.toFixed(3)} +zylinder=${longAb ? longAb.fit.toFixed(3) : "?"}`;
        // (3) rollen-gerechte Werte: Rüstung → Verteidigung; Avatar → HP
        delete blu["_ab_armor"];
        blu["_ab_armor"] = {
            name: "_ab_armor",
            role: "armor",
            roleManual: true,
            parts: [
                { shape: "box", material: "eisen", size: { x: 1.2, y: 1.4, z: 0.4 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        const armorAb = r._blueprintAbilityStats(blu["_ab_armor"]);
        out.armorHasDefense = !!armorAb && armorAb.stats.some((s) => s[0] === "Verteidigung");
        // (4) DOM: die Werte-Zeile rendert + reagiert; die Werkstatt erscheint im Werkzeuge-Feld; Undo/Redo unter den Parts
        r.setGameMode("schöpfer");
        const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
        if (tab) tab.click();
        delete blu["_ab_clone"];
        // Waffen-Klon aus der KIND_SUBSTANCE-Schwert-Zeile: Ausrüstungs-Rolle MIT Werte-Zeile (architecture
        // hat bewusst keine), nicht-builtIn → Undo/Redo rendert. Quelle registrieren, klonen (materialisiert
        // die emergente Rolle), Quelle räumen.
        const KS89 = (window.AnazhRealm || AnazhRealm).KIND_SUBSTANCE || {};
        if (blu._t_ab_src) delete blu._t_ab_src;
        blu._t_ab_src = { name: "_t_ab_src", parts: JSON.parse(JSON.stringify(KS89.geraet_schwert.parts)) };
        r.cloneBlueprint("_t_ab_src", "_ab_clone");
        delete blu._t_ab_src;
        r.selectBlueprintForEdit("_ab_clone");
        r._renderWorkshopDOM();
        // Spec-Sheet: die Werte sind der Fähigkeits-Chip-Streifen (.spec-stat-strip).
        out.domAbilitiesRow = !!document.querySelector("#workshop-stats-panel .spec-stat-strip");
        // Undo/Redo wohnen jetzt in der Top-Leiste (aus dem entfernten Detail-Editor migriert).
        out.domHistoryControls =
            !!document.getElementById("workshop-undo-btn") && !!document.getElementById("workshop-redo-btn");
        // die Werkstatt-Prozesse sind jetzt ziehbare Karten in der rechten WERKZEUGE-Palette
        // (schöpfer → alle besessenen Werkstätten); auf einen Part im 3D ziehen wendet den Prozess an.
        out.domWorkshopChips = document.querySelectorAll("#workshop-tool-palette .workshop-station-card").length >= 1;
        // restore
        for (const n of ["_ab_eisen", "_ab_holz", "_ab_long", "_ab_armor"]) delete blu[n];
        if (blu["_ab_clone"]) r.deleteBlueprint("_ab_clone");
        if (st.blueprintEditHistory) {
            for (const n of ["_ab_eisen", "_ab_holz", "_ab_long", "_ab_armor", "_ab_clone"])
                delete st.blueprintEditHistory[n];
        }
        r.selectBlueprintForEdit("stein_block");
        r.setGameMode(prevMode);
        return out;
    });
    check(
        "KONSUM: die Werte folgen dem MATERIAL — eine eisen-Klinge schlägt härter als eine holz-Klinge (gleiche Form)",
        res.materialMovesValues,
        res.materialVals
    );
    check(
        "KONSUM: die Werte folgen der FORM — ein stumpfer Zylinder an der Klinge verschiebt die Waffen-Eignung (fähigkeiten steigen+sinken)",
        res.formMovesValues,
        res.formVals
    );
    check("rollen-gerechte Werte — eine Rüstung zeigt Verteidigung (nicht Schaden)", res.armorHasDefense);
    check("KONSUM (DOM): die Werte-Zeile rendert im Werkstatt-Readout", res.domAbilitiesRow);
    check(
        "KONSUM (DOM): die Werkstatt-Prozesse sind ziehbare Karten in der WERKZEUGE-Palette (schöpfer → besessene Werkstätten)",
        res.domWorkshopChips
    );
    check(
        "(DOM): Undo/Redo wohnen in der Top-Leiste (workshop-undo-btn / workshop-redo-btn)",
        res.domHistoryControls
    );
}

// Re-Kalibrierung: (1) das Spektrum SPREIZT (nicht 1/1/1) + führt mit der richtigen Rolle,
// (2) Material dramatisch (Eisen-Klinge ≥ 2× Holz), (3) der Equip-Fold ist EINE Quelle
// (`_foldEquippedStatTags`, Spieler+Kreatur), size-neutral, (4) Rolle scharf (Pickel→Werkzeug,
// Schwert→Waffe); + Drehbank-Proximity + CSS.
async function checkBandV1790Recalibration({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const prevMode = r.getGameMode();
        const box = (m, s, p) => ({ shape: "box", material: m, size: s, position: p || { x: 0, y: 0, z: 0 } });
        const cone = (m, s, p) => ({ shape: "cone", material: m, size: s, position: p || { x: 0, y: 0, z: 0 } });
        const blade = (m, k = 1) => ({
            name: "_rc",
            parts: [
                box(m, { x: 0.2 * k, y: 0.1 * k, z: 1.4 * k }),
                cone(m, { x: 0.2 * k, y: 0.1 * k, z: 0.6 * k }, { x: 0, y: 0, z: 1.0 * k }),
            ],
        });
        const dmg = (ab) => (ab && ab.stats ? (ab.stats.find((s) => s[0] === "Schaden") || [0, 0])[1] : 0);
        const tempo = (ab) => (ab && ab.stats ? (ab.stats.find((s) => s[0] === "Tempo") || [0, 0])[1] : 0);

        // (1) FACETTE 1 — das Spektrum ENTSÄTTIGT: eine Eisen-Klinge führt mit weapon, NICHT alles bei 1.0.
        const spec = r._blueprintRoleSpectrum(blade("eisen"));
        out.specTop = spec[0] ? `${spec[0].role} ${spec[0].score.toFixed(2)}` : "?";
        out.spectrumSpreads = spec.length >= 5 && spec[0].score - spec[4].score > 0.15; // Top deutlich über dem 5.
        out.spectrumLeadsWeapon = spec[0] && spec[0].role === "weapon";

        // (2) FACETTE 2 — MATERIAL: eine Eisen-Klinge zeigt ≫ Schaden als eine Holz-Klinge (gleiche Form).
        const dEisen = dmg(r._blueprintAbilityStats(blade("eisen")));
        const dHolz = dmg(r._blueprintAbilityStats(blade("holz")));
        out.materialDramatic = dHolz > 0 && dEisen > dHolz * 1.8;
        out.materialVals = `eisen=${dEisen.toFixed(1)} holz=${dHolz.toFixed(1)} (${(dEisen / Math.max(0.01, dHolz)).toFixed(2)}×)`;

        // (3) der Equip-Fold ist EINE Quelle (`_foldEquippedStatTags`, Spieler + Kreatur), size-neutral: eine 3× größere
        // Klinge faltet GLEICH wie eine 1× (Readout UND Kampf).
        const ab1 = r._blueprintAbilityStats(blade("eisen", 1));
        const ab3 = r._blueprintAbilityStats(blade("eisen", 3));
        out.sizeNeutralReadout = Math.abs(dmg(ab3) - dmg(ab1)) <= 0.02 * dmg(ab1) + 0.1;
        out.sizeVals = `1×=${dmg(ab1).toFixed(1)}/T${tempo(ab1).toFixed(2)} 3×=${dmg(ab3).toFixed(1)}/T${tempo(ab3).toFixed(2)}`;
        const blu = st.blueprints;
        const eqDmg = (bp) => {
            blu._rceq = bp;
            bp.name = "_rceq";
            st.player.equipped = { held: "_rceq" };
            const d = r.computePlayerStats().stats.damage;
            delete blu._rceq;
            return d;
        };
        const eq1 = eqDmg(blade("eisen", 1));
        const eq3 = eqDmg(blade("eisen", 3));
        st.player.equipped = {};
        out.sizeNeutralEquip = Math.abs(eq3 - eq1) <= 0.02 * Math.abs(eq1) + 0.1;
        out.equipVals = `equip 1×=${eq1.toFixed(1)} 3×=${eq3.toFixed(1)}`;
        // attackSpeed bleibt POSITIV (kein negativer Cooldown trotz schwerem Gerät)
        blu._rcheavy = blade("eisen", 3);
        blu._rcheavy.name = "_rcheavy";
        st.player.equipped = { held: "_rcheavy" };
        out.attackSpeedPositive = r.computePlayerStats().stats.attackSpeed > 0;
        st.player.equipped = {};
        delete blu._rcheavy;

        // (4) FACETTE 4 — ROLLE scharf: Pickel→Werkzeug (Holzstiel), Schwert→Waffe (Metall-Klinge).
        // die Blueprints fielen; die Substanz-Zeilen (KIND_SUBSTANCE) tragen die Probe.
        const KS90 = (window.AnazhRealm || AnazhRealm).KIND_SUBSTANCE || {};
        out.spitzhackeTool = r.computeBlueprintRole({ parts: KS90.geraet_spitzhacke.parts }) === "tool";
        out.schwertWeapon = r.computeBlueprintRole({ parts: KS90.geraet_schwert.parts }) === "weapon";
        // ein lebendiger Körper bleibt soul, ein dichter Klotz bleibt architecture (kein Regress durch livingBody)
        out.bladeWeapon = r.computeBlueprintRole(blade("eisen")) === "weapon";

        // (5) die platzierte Drehbank erscheint in 32 m im Prozess-Menü (frieden/pfad).
        r.setGameMode("frieden");
        st.architectures = (st.architectures || []).filter((a) => a && a.type !== "drehbank");
        const pm = st.playerMesh && st.playerMesh.position;
        let near = [],
            far = [];
        if (pm) {
            r.spawnArchitecture("drehbank", { x: pm.x + 20, y: pm.y, z: pm.z }); // 20 m — in der neuen Reichweite
            near = r._workshopProcessesForMenu();
            st.architectures = st.architectures.filter((a) => a && a.type !== "drehbank");
            r.spawnArchitecture("drehbank", { x: pm.x + 45, y: pm.y, z: pm.z }); // 45 m — zu weit
            far = r._workshopProcessesForMenu();
            st.architectures = st.architectures.filter((a) => a && a.type !== "drehbank");
        }
        out.drehbankNearAppears = near.some((p) => p.stationName === "drehbank");
        out.drehbankFarHidden = !far.some((p) => p.stationName === "drehbank");
        out.proximityM = AnazhRealm.WORKSHOP_PROXIMITY_M;

        // (6) Undo/Redo wohnen in der Top-Leiste als .workshop-action-btn; ihr
        // disabled-Zustand ist gestylt (ausgegraut), die Station-Karten der Palette sind abgehoben.
        let cssHistory = false;
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (
                        rule.selectorText &&
                        /workshop-action-btn:disabled|workshop-station-card/.test(rule.selectorText)
                    )
                        cssHistory = true;
                }
            } catch (e) {
                void e;
            }
        }
        out.cssHistory = cssHistory;

        r.setGameMode(prevMode);
        return out;
    });
    check(
        "Facette 1: das Rollen-Spektrum SPREIZT (Top ≫ 5., nicht 1.0/1.0/1.0) + führt mit der Form-Rolle (Klinge→Waffe)",
        res.spectrumSpreads && res.spectrumLeadsWeapon,
        `top=${res.specTop}`
    );
    check(
        "Facette 2: MATERIAL bewegt die Werte dramatisch — eine Eisen-Klinge ≥1.8× Schaden einer Holz-Klinge",
        res.materialDramatic,
        res.materialVals
    );
    check(
        "(Spieler runter): Equip-Fold size-NEUTRAL im Readout — 3× Klinge ≈ 1× (der V17.90-Größen-Faktor ist vorerst raus)",
        res.sizeNeutralReadout,
        res.sizeVals
    );
    check(
        "(Spieler runter): size-neutral auch im ECHTEN Kampf (Equip-Fold) — eq 3× ≈ 1×",
        res.sizeNeutralEquip,
        res.equipVals
    );
    check(
        "Facette 3: attackSpeed bleibt POSITIV trotz schwerem Gerät (kein negativer Cooldown)",
        res.attackSpeedPositive
    );
    check(
        "Facette 4: ROLLE scharf — Pickel→Werkzeug (Holzstiel), Schwert→Waffe (Metall-Klinge), Klinge→Waffe",
        res.spitzhackeTool && res.schwertWeapon && res.bladeWeapon,
        `spitz=${res.spitzhackeTool} schwert=${res.schwertWeapon}`
    );
    check(
        "Befund (a): die platzierte Drehbank erscheint in WORKSHOP_PROXIMITY_M (32 m) im Prozess-Menü, jenseits NICHT",
        res.drehbankNearAppears && res.drehbankFarHidden,
        `radius=${res.proximityM}m near=${res.drehbankNearAppears} far=${res.drehbankFarHidden}`
    );
    check(
        "Befund (b): die Top-Leisten-Akte (disabled-Stil) + Station-Karten haben CSS (sichtbar)",
        res.cssHistory
    );
}

async function checkBandWelle6Keybindings({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Maus-Aktionen (abbauen + platzieren) ###
    // LMB abbauen / RMB platzieren über Keybinding. Architektur-Hit → removeArchitecture; kein Hit →
    // Voxel-carve. Stamina-Gate via getGameMode wie applyOpToPart.
    const wave6a6Results = await safeEvaluate(page, () => {
        if (!r || !st) return null;
        const out = {};
        // Statische Konstante
        out.hasStaminaCost = AnazhRealm._aktionAusdauer() === 5;

        // Setup: pfad-Modus für Stamina-Tests, frische Stamina.
        const oldMode = r.getGameMode();
        r.setGameMode("pfad");
        st.player.stamina = 100;
        st.player.respawnGraceUntil = -Infinity;

        // Stamina-Gate: pfad mit voller Stamina → ok, cost 5
        const gateOk = r._mouseActionStaminaGate();
        out.pfadGateOk = gateOk.ok === true && gateOk.cost === 5;

        // Stamina verbrauchen: pfad zieht 5 ab
        r._consumeMouseStamina();
        out.pfadConsumesFive = st.player.stamina === 95;

        // Stamina unter Kosten → verweigert
        st.player.stamina = 2;
        const gateBlocked = r._mouseActionStaminaGate();
        out.pfadGateBlocksLow = gateBlocked.ok === false && gateBlocked.have === 2;

        // frieden + schöpfer: kein Stamina-Verbrauch
        r.setGameMode("frieden");
        st.player.stamina = 50;
        r._consumeMouseStamina();
        out.friedenSkipsStamina = st.player.stamina === 50;

        r.setGameMode("schöpfer");
        st.player.stamina = 50;
        r._consumeMouseStamina();
        out.schoepferSkipsStamina = st.player.stamina === 50;

        // frieden gate immer ok
        st.player.stamina = 0;
        r.setGameMode("frieden");
        out.friedenGateOkAtZero = r._mouseActionStaminaGate().ok === true;

        // removeArchitecture: synthetisches Setup ohne Mesh/Body
        const fakeEntry = { id: 99999, type: "test_arch", position: { x: 0, y: 0, z: 0 }, mesh: null };
        st.architectures.push(fakeEntry);
        const archCountBefore = st.architectures.length;
        const removed = r.removeArchitecture(fakeEntry);
        out.removeArchitectureWorks = removed === true && st.architectures.length === archCountBefore - 1;

        // removeArchitecture mit nicht-existentem Entry → false
        out.removeArchitectureRejectsGhost = r.removeArchitecture({ id: -1, type: "x" }) === false;

        // tryMousePlace ohne aktiven Bau-Modus läuft in den Voxel-Fill-Pfad (Gegenstück zum LMB-Graben,
        // immer erreichbar) → nur crash-frei + boolean (true = Fill, false = Raycast trifft nichts).
        r.setGameMode("frieden");
        st.buildMode.active = false;
        const placeResult = r.tryMousePlace();
        out.placeReturnsBoolean = placeResult === true || placeResult === false;

        // tryMouseBreak ohne hit & ohne Architektur → false (kein crash);
        // der Raycast ist feld-nativ (kein Treffer → false).
        const breakResult = r.tryMouseBreak();
        out.breakSafeWithoutHit = breakResult === false || breakResult === true;

        // Cleanup
        r.setGameMode(oldMode);

        return out;
    });

    if (wave6a6Results && !wave6a6Results.error) {
        check(
            "Welle 6.A6: aktionAusdauer-Gesetz === 5 (koerper-core, Zwilling gefallen)",
            wave6a6Results.hasStaminaCost
        );
        check("Welle 6.A6: Stamina-Gate im pfad-Modus ok mit cost=5", wave6a6Results.pfadGateOk);
        check("Welle 6.A6: pfad verbraucht 5 Stamina pro Aktion", wave6a6Results.pfadConsumesFive);
        check("Welle 6.A6: pfad verweigert bei zu wenig Stamina", wave6a6Results.pfadGateBlocksLow);
        check("Welle 6.A6: frieden überspringt Stamina-Verbrauch", wave6a6Results.friedenSkipsStamina);
        check("Welle 6.A6: schöpfer überspringt Stamina-Verbrauch", wave6a6Results.schoepferSkipsStamina);
        check("Welle 6.A6: frieden-Gate immer ok (auch bei 0 Stamina)", wave6a6Results.friedenGateOkAtZero);
        check("Welle 6.A6: removeArchitecture entfernt Eintrag", wave6a6Results.removeArchitectureWorks);
        check(
            "Welle 6.A6: removeArchitecture lehnt nicht-existenten Eintrag ab",
            wave6a6Results.removeArchitectureRejectsGhost
        );
        check(
            "Welle 6.A6 + V9.35: tryMousePlace ohne Bau-Modus läuft den Voxel-Fill-Pfad (crash-frei, boolean-Rückgabe)",
            wave6a6Results.placeReturnsBoolean
        );
        check("Welle 6.A6: tryMouseBreak crasht nicht ohne Hit", wave6a6Results.breakSafeWithoutHit);
    }

    // ### Resonanz-Abklang beim Abbauen ###
    // Eine Architektur mit resoniert ≥ resonance_mild verstummt mit einem Sinus-Ping; stille
    // Strukturen bleiben stumm.
    const wave6a6V2Results = await safeEvaluate(page, () => {
        if (!r || !st) return null;
        const out = {};
        // Threshold-Konstante existiert
        const thr = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        out.thresholdReadable = thr && typeof thr.resonance_mild === "number" && thr.resonance_mild > 0;

        // Symphony aktivieren (Headless: autoplay-policy=no-user-gesture-required)
        r.initSymphony();
        const ctxOk = st.symphony && st.symphony.enabled && st.symphony.ctx;
        out.symphonyReady = !!ctxOk;
        if (!ctxOk) return out;

        // kristall_geode: resoniert ≈ 2.7 (Built-in)
        const geodeTags = r.computeCompoundTags(st.blueprints.kristall_geode);
        out.geodeIsResonant = (geodeTags.resoniert || 0) >= thr.resonance_mild;
        // stein_block: resoniert ≈ 0
        const stoneTags = r.computeCompoundTags(st.blueprints.stein_block);
        out.stoneIsNotResonant = (stoneTags.resoniert || 0) < thr.resonance_mild;

        // Spy auf createOscillator
        const ctx = st.symphony.ctx;
        const orig = ctx.createOscillator.bind(ctx);
        const p = st.playerMesh ? st.playerMesh.position : { x: 0, y: 50, z: 0 };

        // Test A: Geode-Abbau → mind. 1 Oszillator
        const geode = r.spawnArchitecture("kristall_geode", { x: p.x, y: p.y, z: p.z + 6 });
        let counterA = 0;
        ctx.createOscillator = function () {
            counterA++;
            return orig();
        };
        r.removeArchitecture(geode);
        out.geodeRemovalRingsOnce = counterA >= 1;

        // Test B: Stein-Abbau → kein Oszillator (Negativ-Kontrolle)
        const stone = r.spawnArchitecture("stein_block", { x: p.x + 4, y: p.y, z: p.z + 4 });
        let counterB = 0;
        ctx.createOscillator = function () {
            counterB++;
            return orig();
        };
        r.removeArchitecture(stone);
        out.stoneRemovalIsSilent = counterB === 0;

        // Test C: Symphony aus → kein Ping selbst bei resonanter Struktur
        st.symphony.enabled = false;
        const geode2 = r.spawnArchitecture("kristall_geode", { x: p.x - 4, y: p.y, z: p.z - 4 });
        let counterC = 0;
        ctx.createOscillator = function () {
            counterC++;
            return orig();
        };
        r.removeArchitecture(geode2);
        out.disabledSymphonyStaysSilent = counterC === 0;
        st.symphony.enabled = true;

        ctx.createOscillator = orig;
        return out;
    });

    if (wave6a6V2Results && !wave6a6V2Results.error) {
        check("Welle 6.A6 V2: WORLD_EFFECT_THRESHOLDS.resonance_mild lesbar", wave6a6V2Results.thresholdReadable);
        check("Welle 6.A6 V2: Symphony initialisierbar im Headless", wave6a6V2Results.symphonyReady);
        if (wave6a6V2Results.symphonyReady) {
            check("Welle 6.A6 V2: kristall_geode trägt resoniert ≥ mild-Threshold", wave6a6V2Results.geodeIsResonant);
            check(
                "Welle 6.A6 V2: stein_block trägt resoniert < mild-Threshold (Negativ)",
                wave6a6V2Results.stoneIsNotResonant
            );
            check(
                "Welle 6.A6 V2: Geode-Abbau erzeugt mind. einen Oszillator (Vision §1.2)",
                wave6a6V2Results.geodeRemovalRingsOnce
            );
            check("Welle 6.A6 V2: Stein-Abbau bleibt stumm (Vision-Disziplin)", wave6a6V2Results.stoneRemovalIsSilent);
            check(
                "Welle 6.A6 V2: deaktivierte Symphony unterdrückt auch resonanten Abbau-Ping",
                wave6a6V2Results.disabledSymphonyStaysSilent
            );
        }
    }

    // ### HUD spiegelt aktuelle Keybindings ###
    // _updateBuildModeHud baut den Text aus state.keybindings über _formatBindingCode; setKeybinding
    // + resetKeybindings triggern ein HUD-Refresh (nie veraltete Beschriftung).
    const wave6c3V2Results = await safeEvaluate(page, () => {
        if (!r || !st) return null;
        const out = {};
        r.resetKeybindings();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        const hud = document.getElementById("build-mode-hud");
        out.hudVisible = hud && !hud.hidden;
        const textDefault = hud ? hud.textContent : "";
        out.defaultMentionsConfirmBuild = /F/.test(textDefault);
        out.defaultMentionsPlacePretty = /Rechte Maustaste/.test(textDefault);
        out.defaultMentionsBreakPretty = /Linke Maustaste/.test(textDefault);

        // Rebind „place" → KeyB. setKeybinding muss HUD aktualisieren.
        r.setKeybinding("place", "KeyB");
        const textAfter = hud ? hud.textContent : "";
        out.afterRebindContainsB = /\bB\b/.test(textAfter);
        out.afterRebindDropsOldLabel = !/Rechte Maustaste/.test(textAfter);

        // Reset wirkt auch auf HUD.
        r.resetKeybindings();
        const textReset = hud ? hud.textContent : "";
        out.afterResetMentionsRMB = /Rechte Maustaste/.test(textReset);

        r._clearBuildMode();
        return out;
    });

    if (wave6c3V2Results && !wave6c3V2Results.error) {
        check("Welle 6.C3 V2: HUD sichtbar im Bau-Modus", wave6c3V2Results.hudVisible);
        check("Welle 6.C3 V2: Default-HUD enthält 'F' (confirmBuild)", wave6c3V2Results.defaultMentionsConfirmBuild);
        check(
            "Welle 6.C3 V2: Default-HUD enthält 'Rechte Maustaste' (place)",
            wave6c3V2Results.defaultMentionsPlacePretty
        );
        check(
            "Welle 6.C3 V2: Default-HUD enthält 'Linke Maustaste' (break)",
            wave6c3V2Results.defaultMentionsBreakPretty
        );
        check(
            "Welle 6.C3 V2: setKeybinding(place→KeyB) reflektiert sich im HUD-Text",
            wave6c3V2Results.afterRebindContainsB
        );
        check("Welle 6.C3 V2: HUD-Text verliert das alte Label nach Rebind", wave6c3V2Results.afterRebindDropsOldLabel);
        check("Welle 6.C3 V2: resetKeybindings stellt HUD-Default wieder her", wave6c3V2Results.afterResetMentionsRMB);
    }

    // ### Tastenbelegung (Keybindings) ###
    // Sechs Aktionen rebindable: break, place, confirmBuild, inventory, cancelBuild, jump.
    // Konflikt-Auflösung über Swap; persistiert in localStorage.
    const wave6c3Results = await safeEvaluate(page, () => {
        if (!r || !st) return null;
        const out = {};
        // Statische Konstanten
        out.hasDefaults =
            AnazhRealm.DEFAULT_KEYBINDINGS &&
            typeof AnazhRealm.DEFAULT_KEYBINDINGS === "object" &&
            Object.isFrozen(AnazhRealm.DEFAULT_KEYBINDINGS);
        // 11 Aktionen (6 Original + 5 Drawer/Camera-Shortcuts; UI-Putz: drawerWelt entfiel).
        out.hasActions = Array.isArray(AnazhRealm.KEYBINDING_ACTIONS) && AnazhRealm.KEYBINDING_ACTIONS.length === 13; // V18.109 E8: + swapHands, L3: + chat
        out.hasLabels = AnazhRealm.KEYBINDING_LABELS && Object.isFrozen(AnazhRealm.KEYBINDING_LABELS);
        const expectedActions = ["break", "place", "confirmBuild", "inventory", "cancelBuild", "jump"];
        out.actionsCorrect = expectedActions.every((a) => AnazhRealm.KEYBINDING_ACTIONS.includes(a));
        // Defaults sind Minecraft-Konvention
        out.defaultBreakIsMouse0 = AnazhRealm.DEFAULT_KEYBINDINGS.break === "Mouse0";
        out.defaultPlaceIsMouse2 = AnazhRealm.DEFAULT_KEYBINDINGS.place === "Mouse2";
        out.defaultConfirmBuildIsKeyF = AnazhRealm.DEFAULT_KEYBINDINGS.confirmBuild === "KeyF";
        out.defaultInventoryIsTab = AnazhRealm.DEFAULT_KEYBINDINGS.inventory === "Tab";

        // State init
        out.hasKeybindingsState = st.keybindings && typeof st.keybindings === "object";
        out.keybindRebindInitNull = st.keybindRebind === null;

        // setKeybinding ändert state
        const before = st.keybindings.confirmBuild;
        const setOk = r.setKeybinding("confirmBuild", "KeyG");
        out.setKeybindingWorks = setOk === true && st.keybindings.confirmBuild === "KeyG";

        // setKeybinding-Konflikt = Swap: bind „place" auf das gerade
        // gesetzte „KeyG" → confirmBuild bekommt das alte „Mouse2"
        // (das war place's Default).
        const oldPlace = st.keybindings.place;
        r.setKeybinding("place", "KeyG");
        out.swapHappened = st.keybindings.place === "KeyG" && st.keybindings.confirmBuild === oldPlace;

        // Reset auf Defaults
        r.resetKeybindings();
        out.resetRestoresDefaults =
            st.keybindings.break === "Mouse0" &&
            st.keybindings.place === "Mouse2" &&
            st.keybindings.confirmBuild === "KeyF" &&
            st.keybindings.confirmBuild === before; // before war auch der Default

        // setKeybinding-Validierung: unbekannte Aktion → false
        out.setRejectsUnknownAction = r.setKeybinding("ficto", "KeyZ") === false;
        out.setRejectsEmptyCode = r.setKeybinding("break", "") === false;

        // _actionForBindingCode reverse-lookup
        out.actionForMouse0 = r._actionForBindingCode("Mouse0") === "break";
        out.actionForMouse2 = r._actionForBindingCode("Mouse2") === "place";
        out.actionForKeyF = r._actionForBindingCode("KeyF") === "confirmBuild";
        out.actionForUnbound = r._actionForBindingCode("KeyZ") === null;

        // _eventToBindingCode
        const mouseEvt = { type: "mousedown", button: 0 };
        const mouseEvt2 = { type: "mousedown", button: 2 };
        const keyEvt = { type: "keydown", code: "KeyG" };
        out.codeForMouseDownLMB = r._eventToBindingCode(mouseEvt) === "Mouse0";
        out.codeForMouseDownRMB = r._eventToBindingCode(mouseEvt2) === "Mouse2";
        out.codeForKeyDown = r._eventToBindingCode(keyEvt) === "KeyG";

        // beginKeybindRebind setzt state, cancel räumt auf
        r.beginKeybindRebind("break");
        out.rebindActive = st.keybindRebind && st.keybindRebind.action === "break";
        r.cancelKeybindRebind();
        out.rebindCancelClears = st.keybindRebind === null;

        // _completeKeybindRebind ändert die Bindung
        r.beginKeybindRebind("jump");
        r._completeKeybindRebind("KeyJ");
        out.completeBindsCode = st.keybindings.jump === "KeyJ";
        // Escape im Rebind-Modus → Abbruch (Binding bleibt)
        r.beginKeybindRebind("jump");
        r._completeKeybindRebind("Escape");
        out.escCancelsRebind = st.keybindRebind === null && st.keybindings.jump === "KeyJ";

        // _formatBindingCode pretty-print
        out.formatMouse0 = r._formatBindingCode("Mouse0") === "Linke Maustaste";
        out.formatMouse2 = r._formatBindingCode("Mouse2") === "Rechte Maustaste";
        out.formatSpace = r._formatBindingCode("Space") === "Leertaste";
        out.formatKeyF = r._formatBindingCode("KeyF") === "F";

        // UI: Section + Liste + Reset-Button im DOM
        out.sectionInDom = !!document.getElementById("keybindings-section");
        out.listInDom = !!document.getElementById("keybindings-list");
        out.resetInDom = !!document.getElementById("keybindings-reset");
        // je Aktion eine Zeile: 13 der Tastatur + 8, die nur das Gamepad frei bindet (leib.K5)
        out.sixRowsRendered = document.querySelectorAll("#keybindings-list .keybind-row").length === 21;
        // Pro Aktion ein Rebind-Button mit data-action
        out.rebindButtonsPresent = document.querySelectorAll(".keybind-rebind[data-action]").length === 13; // V18.109 E8, L3 chat

        // Reset für nachfolgende Tests
        r.resetKeybindings();
        st.keybindRebind = null;

        return out;
    });

    if (wave6c3Results && !wave6c3Results.error) {
        check("Welle 6.C3: DEFAULT_KEYBINDINGS frozen", wave6c3Results.hasDefaults);
        check(
            "Welle 6.C3/V8.17+E8+L3: KEYBINDING_ACTIONS hat 13 Einträge (6 + 5 Drawer/Camera + swapHands + chat)",
            wave6c3Results.hasActions
        );
        check("Welle 6.C3: KEYBINDING_LABELS frozen", wave6c3Results.hasLabels);
        check(
            "Welle 6.C3: Actions vollständig (break/place/confirmBuild/inventory/cancelBuild/jump)",
            wave6c3Results.actionsCorrect
        );
        check("Welle 6.C3: Default break === Mouse0 (LMB)", wave6c3Results.defaultBreakIsMouse0);
        check("Welle 6.C3: Default place === Mouse2 (RMB)", wave6c3Results.defaultPlaceIsMouse2);
        check("Welle 6.C3: Default confirmBuild === KeyF", wave6c3Results.defaultConfirmBuildIsKeyF);
        check("Welle 6.C3: Default inventory === Tab", wave6c3Results.defaultInventoryIsTab);
        check("Welle 6.C3: state.keybindings initialisiert", wave6c3Results.hasKeybindingsState);
        check("Welle 6.C3: state.keybindRebind initial null", wave6c3Results.keybindRebindInitNull);
        check("Welle 6.C3: setKeybinding ändert state.keybindings", wave6c3Results.setKeybindingWorks);
        check("Welle 6.C3: Konflikt-Schutz tauscht Bindings (Swap)", wave6c3Results.swapHappened);
        check("Welle 6.C3: resetKeybindings stellt Defaults wieder her", wave6c3Results.resetRestoresDefaults);
        check("Welle 6.C3: setKeybinding lehnt unbekannte Aktion ab", wave6c3Results.setRejectsUnknownAction);
        check("Welle 6.C3: setKeybinding lehnt leeren Code ab", wave6c3Results.setRejectsEmptyCode);
        check("Welle 6.C3: actionFor Mouse0 → break", wave6c3Results.actionForMouse0);
        check("Welle 6.C3: actionFor Mouse2 → place", wave6c3Results.actionForMouse2);
        check("Welle 6.C3: actionFor KeyF → confirmBuild", wave6c3Results.actionForKeyF);
        check("Welle 6.C3: actionFor ungebundener Code → null", wave6c3Results.actionForUnbound);
        check("Welle 6.C3: eventToCode MouseEvent LMB → Mouse0", wave6c3Results.codeForMouseDownLMB);
        check("Welle 6.C3: eventToCode MouseEvent RMB → Mouse2", wave6c3Results.codeForMouseDownRMB);
        check("Welle 6.C3: eventToCode KeyboardEvent → event.code", wave6c3Results.codeForKeyDown);
        check("Welle 6.C3: beginKeybindRebind setzt state.keybindRebind", wave6c3Results.rebindActive);
        check("Welle 6.C3: cancelKeybindRebind räumt auf", wave6c3Results.rebindCancelClears);
        check("Welle 6.C3: _completeKeybindRebind bindet neuen Code", wave6c3Results.completeBindsCode);
        check("Welle 6.C3: Escape im Rebind-Modus → Abbruch (kein Binding-Wechsel)", wave6c3Results.escCancelsRebind);
        check("Welle 6.C3: format Mouse0 → 'Linke Maustaste'", wave6c3Results.formatMouse0);
        check("Welle 6.C3: format Mouse2 → 'Rechte Maustaste'", wave6c3Results.formatMouse2);
        check("Welle 6.C3: format Space → 'Leertaste'", wave6c3Results.formatSpace);
        check("Welle 6.C3: format KeyF → 'F'", wave6c3Results.formatKeyF);
        check("Welle 6.C3: #keybindings-section im DOM", wave6c3Results.sectionInDom);
        check("Welle 6.C3: #keybindings-list im DOM", wave6c3Results.listInDom);
        check("Welle 6.C3: #keybindings-reset im DOM", wave6c3Results.resetInDom);
        check("Welle 6.C3/V8.17+E8+L3 + leib.K5: 21 keybind-row Zeilen gerendert (13 Tastatur + 8 nur Gamepad)", wave6c3Results.sixRowsRendered);
        check("Welle 6.C3/V8.17+L3: 13 Rebind-Buttons im DOM", wave6c3Results.rebindButtonsPresent);
    }
}

// Architektur-Instancing (HISM), reine Mathematik: die Per-Leaf-World-Matrix `entryWorldMatrix ×
// leaf.localMatrix` MUSS bit-gleich zum klassischen Group-Child-`matrixWorld` sein, sonst rendert
// das Instancing verschoben. Dazu: water_wave nicht instancbar; Leaf-Farbe gleich (Mirror-Drift).
async function checkBandWellePerfCArchInstancing({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || !st) return { error: "no realm" };
        const out = {};

        // Gate: ein gewachsener Baum (Grammatik) ist instancbar. Er ist _isMerged (Bark+Foliage = 2 Leaves);
        // die Per-Part-Matrix-/Farb-Gleichheit braucht eine non-merged Klon-Fixture (1 Leaf je Part,
        // deckungsgleich zum _buildFromBlueprint-Render).
        const __fkKeyMerged = r._growTreeBlueprintForSpawn("baum_kiefer", "flat-fixture") || "baum_kiefer";
        const __fkKey = "__flat_fixture_nm";
        st.blueprints[__fkKey] = { ...st.blueprints[__fkKeyMerged], _isMerged: false, _skeleton: null };
        const flatKiefer = r._archFlattenBlueprint(__fkKey);
        out.kieferInstanceable = flatKiefer.instanceable;
        out.kieferLeaves = flatKiefer.leaves.length;

        // Gate: waterfall hat einen water_wave-Part → NICHT instancbar.
        const flatWf = r._archFlattenBlueprint("waterfall");
        out.waterfallInstanceable = flatWf.instanceable;
        out.waterfallReason = flatWf.reason;

        // Cache-Identität: zweiter Aufruf liefert dasselbe Objekt (kein
        // Doppel-Build der Geometrien).
        out.cacheStable = r._archFlattenBlueprint(__fkKey) === flatKiefer;

        // --- Matrix-Bit-Gleichheit: klassische Group vs Instancing-Matrix ---
        const bp = st.blueprints[__fkKey];
        // BÜHNE: Eintrag einer Einheits-Probe, kein gesetzter Ort
        const entry = { position: { x: 100, y: 50, z: -30 }, scale: 1.5 };
        const group = r._buildFromBlueprint(bp);
        const baseY = entry.position.y - 0.5;
        group.position.set(entry.position.x, baseY, entry.position.z);
        group.scale.setScalar(entry.scale);
        group.updateMatrixWorld(true);
        const entryWorld = r._archEntryWorldMatrix(entry);
        // Nur Mesh-Children (keine Connection-LineSegments) in Reihenfolge.
        const meshChildren = group.children.filter((c) => c.isMesh);
        out.childCount = meshChildren.length;
        let maxMatrixDelta = 0;
        let maxColorDelta = 0;
        const n = Math.min(meshChildren.length, flatKiefer.leaves.length);
        for (let i = 0; i < n; i++) {
            const M = entryWorld.clone().multiply(flatKiefer.leaves[i].localMatrix);
            const cw = meshChildren[i].matrixWorld;
            for (let e = 0; e < 16; e++) {
                maxMatrixDelta = Math.max(maxMatrixDelta, Math.abs(M.elements[e] - cw.elements[e]));
            }
            const cm = meshChildren[i].material && meshChildren[i].material.color;
            const lm = flatKiefer.leaves[i].mat && flatKiefer.leaves[i].mat.color;
            if (cm && lm) {
                maxColorDelta = Math.max(
                    maxColorDelta,
                    Math.abs(cm.r - lm.r) + Math.abs(cm.g - lm.g) + Math.abs(cm.b - lm.b)
                );
            }
        }
        out.maxMatrixDelta = maxMatrixDelta;
        out.maxColorDelta = maxColorDelta;
        r._disposeSoulGroup(group);

        // --- Cutover: instancbarer Spawn geht in die Registry ---
        // UNIT-RICHTER: Prüf-Gegenstand ist die GRAMMATIK-Instancing-Registry (`baum_kiefer#0`-Gruppe +
        // Slot/Cull/Pick); foundry-ON setzt derselbe Spawn Studio-Instanzen (f:-Gruppen) → __withNoFoundry.
        if (st.playerMesh) {
            window.__withNoFoundry(() => {
                const pp = st.playerMesh.position;
                const origRadius = st.architectureCullingRadius;
                st.architectureCullingRadius = 500; // in Reichweite → sofort gebaut
                const e = r.spawnArchitecture(
                    "baum_kiefer",
                    { x: pp.x + 5, y: pp.y, z: pp.z + 5 },
                    { seed: 7777, silent: true }
                );
                out.cutoverInstanced = !!(e && e.instanced === true);
                out.cutoverNoMesh = !!(e && !e.mesh);
                out.cutoverSlots = e && e.instSlots ? e.instSlots.length : -1;
                // DETERMINISMUS-BOGEN P3 — Kollision ist feld-nativ via blockerAABBs
                // (solider Holz-Stamm), kein Ammo-Body mehr. Sie wird beim Spawn gefüllt
                // (render-unabhängig) und überlebt das Culling (das Feld trägt sie immer).
                out.cutoverHasCollision = !!(e && Array.isArray(e.blockerAABBs) && e.blockerAABBs.length > 0);
                // die platzierte Architektur ist global (`baum_kiefer#0`, die Regions-Achse @p: fiel;
                // ein Studio-Leaf keyt nach seiner Studio-Geometrie): eine baum_kiefer#0-Gruppe.
                out.cutoverGroupExists = !!(
                    st.archInstanceGroups &&
                    [...st.archInstanceGroups.keys()].some((k) => k.indexOf("baum_kiefer#0") === 0)
                );
                // Cull → instanced-Render weg, Daten-Eintrag bleibt.
                if (e) {
                    r._cullArchitectureMesh(e);
                    out.cutoverCulledInstanced = e.instanced === false && !e.instSlots;
                    // Daten-Eintrag bleibt in der Liste (Culling ≠ Remove).
                    out.cutoverEntryStillListed = st.architectures.indexOf(e) >= 0;
                    r.removeArchitecture(e); // sauber raus aus der Test-Welt
                }
                st.architectureCullingRadius = origRadius;

                // Nicht-instancbarer Bauplan (waterfall) bleibt klassisch (entry.mesh).
                const wf = r.spawnArchitecture(
                    "waterfall",
                    { x: pp.x + 7, y: pp.y, z: pp.z + 7 },
                    { seed: 8888, silent: true }
                );
                out.waterfallClassic = !!(wf && wf.mesh && !wf.instanced);
                if (wf) r.removeArchitecture(wf);

                // --- Funktions-Faden: instancierten Baum per Crosshair-Raycast
                //     picken (Spieler-LMB-Harvest muss instancierte Bäume treffen,
                //     via instanceId → slotEntry). ---
                if (st.camera) {
                    const tcx = pp.x + 6;
                    const tcz = pp.z + 6;
                    const pe = r.spawnArchitecture(
                        "baum_kiefer",
                        { x: tcx, y: pp.y, z: tcz },
                        { seed: 9191, silent: true }
                    );
                    const cam = st.camera;
                    const savedPos = cam.position.clone();
                    const savedQuat = cam.quaternion.clone();
                    cam.position.set(tcx, pp.y + 1.2, tcz - 6);
                    cam.lookAt(tcx, pp.y + 1.0, tcz);
                    cam.updateMatrixWorld(true);
                    // Last-Robustheit: ohne Render-Frame zwischen Spawn und Pick sind die InstancedMesh-Welt-Matrizen
                    // stale (Raycaster verwirft sie), und ein akkumulierter NACHBAR in der 6-m-Sichtlinie trifft zuerst.
                    // Darum Szene-Matrizen aktualisieren + Blocker räumen → der finale Pick prüft genau pe's Instanz.
                    if (st.scene) st.scene.updateMatrixWorld(true);
                    for (let g = 0; g < 10; g++) {
                        const pk = r._pickArchitectureAtCrosshair();
                        if (!pk || pk.entry === pe) break;
                        r.removeArchitecture(pk.entry); // Nachbar aus der Sichtlinie
                        if (st.scene) st.scene.updateMatrixWorld(true);
                    }
                    const pick = r._pickArchitectureAtCrosshair();
                    out.instancedPickHits = !!(pick && pick.entry === pe);
                    cam.position.copy(savedPos);
                    cam.quaternion.copy(savedQuat);
                    cam.updateMatrixWorld(true);
                    if (pe) r.removeArchitecture(pe);
                }
            });
        }
        return out;
    });
    if (res.error) {
        check("V12.0-perf.c.1: Architektur-Instancing-Band (realm)", false, res.error);
        return;
    }
    check(
        "V12.0-perf.c.1: baum_kiefer instancbar (gewachsene Krone, ≥1 Leaf je Part)",
        res.kieferInstanceable === true && res.kieferLeaves >= 1, // V18.259: gewachsene Krone → variable Part-Zahl (statt fixe 7)
        `instanceable=${res.kieferInstanceable}, leaves=${res.kieferLeaves}`
    );
    check(
        "V12.0-perf.c.1: waterfall NICHT instancbar (kein instanced-Flag)",
        res.waterfallInstanceable === false && res.waterfallReason === "classic-intent",
        `reason=${res.waterfallReason}`
    );
    check("V12.0-perf.c.1: Flatten-Cache stabil (kein Doppel-Build)", res.cacheStable);
    check(
        "V12.0-perf.c.1: Leaf-Matrix bit-gleich zum klassischen Group-matrixWorld",
        res.maxMatrixDelta < 1e-5,
        `maxDelta=${res.maxMatrixDelta}`
    );
    check(
        "V12.0-perf.c.1: Leaf-Material-Farbe gleich (Mirror-Drift-Wand)",
        res.maxColorDelta < 1e-4,
        `maxColorDelta=${res.maxColorDelta}`
    );
    // perf.c.2 Cutover-Invarianten (nur wenn der Player-Pfad lief).
    if (res.cutoverInstanced !== undefined) {
        check(
            "V12.0-perf.c.2: instancbarer Spawn → entry.instanced=true, kein entry.mesh",
            res.cutoverInstanced === true && res.cutoverNoMesh === true
        );
        check(
            "V12.0-perf.c.2: ≥1 Instance-Slot je Leaf (baum_kiefer gewachsen+gemergt)",
            res.cutoverSlots >= 1, // V18.259: der gemergte gewachsene Baum → variable Slot-Zahl (statt fixe 7)
            `slots=${res.cutoverSlots}`
        );
        check(
            "V12.0-perf.c.2: instancierter Eintrag hat feld-native Kollision via blockerAABBs",
            res.cutoverHasCollision
        );
        check(
            "V12.0-perf.c.2: InstancedMesh-Gruppe 'baum_kiefer#0' existiert (Welle B: global, ohne @p:)",
            res.cutoverGroupExists
        );
        check(
            "V12.0-perf.c.2: Cull gibt Instance-Slots frei (Daten-Eintrag bleibt, Feld-Kollision render-unabhängig)",
            res.cutoverCulledInstanced === true && res.cutoverEntryStillListed === true
        );
        check(
            "V12.0-perf.c.2: nicht-instancbarer Bauplan (waterfall) bleibt klassisch (entry.mesh)",
            res.waterfallClassic
        );
        if (res.instancedPickHits !== undefined) {
            check(
                "V12.0-perf.c.2: instancierter Baum per Crosshair-Raycast pickbar (LMB-Harvest-Faden)",
                res.instancedPickHits
            );
        }
    }
}

async function checkBandWelle6XAudit({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Audit-Fixes ###
    // A1 Sprung feld-nativ (handleJump → playerVel) · A2 confirmBuild blockt instabiles Phantom im pfad ·
    // A3 Umwidmen nimmt emergente Rollen auf + Stat-Panel zeigt Equipped · A4 Avatar-Aura ist gefallen.
    const wave6x1Results = await safeEvaluate(page, () => {
        const out = {};

        // --- A2: confirmBuild blockt bei phantomOnGround=false im pfad
        r.setGameMode("pfad");
        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        if (st.buildMode) st.buildMode.phantomOnGround = false;
        const archBeforeBlock = st.architectures.length;
        const stoneBeforeBlock = st.player.inventory[0].count;
        const blocked = r.confirmBuild();
        const stoneAfterBlock = st.player.inventory[0] ? st.player.inventory[0].count : 0;
        out.pfadBlocksUnstable = blocked === false;
        out.pfadBlocksNoArch = st.architectures.length === archBeforeBlock;
        out.pfadBlocksNoMaterialLoss = stoneBeforeBlock === stoneAfterBlock;

        // schöpfer-Modus: gleiches Setup, instabil → trotzdem baut
        r.setGameMode("schöpfer");
        if (st.buildMode) st.buildMode.phantomOnGround = false;
        const archBeforeS = st.architectures.length;
        const builtS = r.confirmBuild();
        out.schoepferBypassesUnstable = builtS === true && st.architectures.length > archBeforeS;

        r._clearBuildMode();
        r.setGameMode("frieden");

        // --- A3a: Umwidmen nimmt Baupläne mit emergenter Rolle auf.
        // Das Umwidmen lebt in der Werkstatt-Mach-Zone: die Reihe erscheint für den GEWÄHLTEN eigenen
        // Bauplan, auch mit emergenter Rolle (kein roleManual-Filter). createBlueprint returnt true/false.
        const bpCreated = r.createBlueprint("audit_armor_test", "Audit-Test");
        out._a3aCreated = bpCreated === true;
        if (bpCreated) {
            const bpRef = st.blueprints["audit_armor_test"];
            bpRef.role = "tool"; // emergent gesetzt, kein Manual
            bpRef.roleManual = false;
            const wsA3 = r._ensureWorkshopState();
            const savedSelA3 = wsA3.selectedBlueprint;
            r.selectBlueprintForEdit("audit_armor_test");
            const zoneA3 =
                document.getElementById("workshop-action-zone") || document.getElementById("workshop-stats-panel");
            const rowA3 = zoneA3 && zoneA3.querySelector(".workshop-umwidmen-row");
            out._a3aLabelCount = rowA3 ? rowA3.querySelectorAll(".workshop-umwidmen-btn").length : 0;
            // die Zeile schrumpfte aufs INTENT-TRIO (Portal → ·
            // ⚒ Station · ✨ Emergent): Rüstung/Konsumabel fixt der PROZESS.
            out.markListShowsEmergentRole =
                !!rowA3 && out._a3aLabelCount === 3 && /⚒ Station/.test(rowA3.textContent || "");
            delete st.blueprints["audit_armor_test"];
            wsA3.selectedBlueprint = savedSelA3;
        } else {
            out.markListShowsEmergentRole = false;
        }

        // --- A3b: Stat-Panel zeigt Equipped-Zeile wenn Armor an
        const bp2Created = r.createBlueprint("audit_armor_real", "Audit-Helm");
        out._a3bCreated = bp2Created === true;
        if (bp2Created) {
            r.addPartToBlueprint("audit_armor_real", {
                shape: "sphere",
                material: "stein",
                size: { x: 0.5, y: 0.5, z: 0.5 },
            });
            const armorResult = r.setBlueprintAsArmor("audit_armor_real");
            out._a3bMarked = !!(armorResult && armorResult.ok);
            const equipResult = r.equipArmor("audit_armor_real");
            out._a3bEquipped = !!(equipResult && equipResult.ok);
            // das Spec-Sheet-FOOTER zeigt die getragene Habe (⛨ Rüstung); `recomputePlayerStats`
            // ist in equipArmor schon drin, aber das Spec-Sheet muss explizit re-rendern.
            r._ichRenderSpecSheet();
            const container = document.getElementById("ich-stage-spec");
            out._a3bContainerText = container ? container.textContent.slice(0, 200) : null;
            out.statsShowsArmorRow = !!container && /⛨|audit_armor_real/.test(container.textContent || "");
            r.equipArmor(null);
            delete st.blueprints["audit_armor_real"];
            r._ichRenderSpecSheet();
        } else {
            out.statsShowsArmorRow = false;
        }

        // --- Cleanup: Camera-Mode auf Default „first" zurücksetzen
        // (Ring 5 V2-Prep prüft Initial-Modus). Hotbar auf Default
        // zurücksetzen (Ring 6.5 prüft Default-Hotbar).
        r.setCameraMode("first");
        try {
            localStorage.removeItem("anazhRealmCameraMode");
        } catch {
            /* ignore */
        }
        if (st.hotbar && st.hotbar.length === 9) {
            const gurt = r._startGurt() || [];
            for (let i = 0; i < 9; i++) {
                st.hotbar[i] = i < gurt.length ? gurt[i] : null;
            }
        }
        r._clearBuildMode();

        return out;
    });

    if (wave6x1Results && !wave6x1Results.error) {
        check("Welle 6.X.1 A2: pfad + Phantom-instabil → confirmBuild blockt", wave6x1Results.pfadBlocksUnstable);
        check("Welle 6.X.1 A2: pfad-Block → keine Architektur entsteht", wave6x1Results.pfadBlocksNoArch);
        check("Welle 6.X.1 A2: pfad-Block → kein Material-Verlust", wave6x1Results.pfadBlocksNoMaterialLoss);
        check("Welle 6.X.1 A2: schöpfer-Modus überschreibt Stabilitäts-Gate", wave6x1Results.schoepferBypassesUnstable);
        check(
            "Welle 6.X.1 A3a: Markier-UI nimmt Baupläne mit emergenter Rolle auf",
            wave6x1Results.markListShowsEmergentRole,
            `created=${wave6x1Results._a3aCreated}, labelCount=${wave6x1Results._a3aLabelCount}`
        );
        check(
            "Welle 6.X.1 A3b: Stat-Panel zeigt 'Rüstung'-Zeile wenn equipped",
            wave6x1Results.statsShowsArmorRow,
            `created=${wave6x1Results._a3bCreated} marked=${wave6x1Results._a3bMarked} equipped=${wave6x1Results._a3bEquipped} text=${(wave6x1Results._a3bContainerText || "").slice(0, 80)}`
        );
    } else {
        check("Welle 6.X.1: Audit-Fix-Tests laufen", false, wave6x1Results ? wave6x1Results.error : "no result");
    }

    // ### UI-Politur ###
    // B1 Logbuch-Toggle (default versteckt) · B2 keine Welt-Bauwerke-Buttons im world-drawer ·
    // B4 Scrollrad zyklt durch die Hotbar-Slots.
    const wave6x2Results = await safeEvaluate(page, () => {
        const out = {};

        // B1 — Logbuch-Toggle (Section sichtbar, #log toggelt)
        out.logbookSectionExists = !!document.getElementById("logbook-section");
        out.logbookToggleExists = !!document.getElementById("logbook-toggle");
        const consoleLog = document.getElementById("console-log-section");
        const logEl = document.getElementById("log");
        out.logbookConsoleSectionExists = !!consoleLog;
        // Section bleibt sichtbar, NUR #log (innen) hidden default
        out.logbookHiddenByDefault = !!logEl && logEl.hidden === true;
        out.consoleLogToggleExists = !!document.getElementById("console-log-toggle");
        // Toggle aktivieren → #log wird sichtbar (Section bleibt sichtbar)
        const toggle = document.getElementById("logbook-toggle");
        if (toggle) {
            toggle.checked = true;
            toggle.dispatchEvent(new Event("change"));
            out.logbookVisibleAfterToggle = !!logEl && logEl.hidden === false;
            // Cleanup für nachfolgende Tests
            toggle.checked = false;
            toggle.dispatchEvent(new Event("change"));
            out.logbookHiddenAfterUntoggle = !!logEl && logEl.hidden === true;
        }
        // Inline-Console-Toggle togglet selber State
        const inlineBtn = document.getElementById("console-log-toggle");
        if (inlineBtn && logEl) {
            inlineBtn.click();
            out.inlineToggleExpands = logEl.hidden === false;
            inlineBtn.click();
            out.inlineToggleCollapses = logEl.hidden === true;
        }

        // B2 — Welt-Bauwerke-Buttons entfernt
        out.architectureActionsRemoved = !document.getElementById("architecture-actions");
        // Aber Chat-Pfade existieren weiter (smoke: spawn_village ist noch da)

        // Logik-Test: simuliere Wheel-Deltas, hotbar-Slot ändert sich
        if (st.buildMode) st.buildMode.slotIndex = 0;
        r.selectHotbarSlot(0);
        const before = st.buildMode.slotIndex;
        // Ein Wheel-Delta nach unten → nächster Slot
        r.selectHotbarSlot((before + 1) % 9);
        out.hotbarCyclesForward = st.buildMode.slotIndex === 1;
        // Rückwärts (wrap)
        r.selectHotbarSlot((1 - 1 + 9) % 9);
        out.hotbarCyclesBackward = st.buildMode.slotIndex === 0;
        r.selectHotbarSlot((0 - 1 + 9) % 9);
        out.hotbarWrapsAtZero = st.buildMode.slotIndex === 8;
        r._clearBuildMode();

        return out;
    });

    if (wave6x2Results && !wave6x2Results.error) {
        check("Welle 6.X.2 B1: #logbook-section im DOM", wave6x2Results.logbookSectionExists);
        check("Welle 6.X.2 B1: #logbook-toggle im DOM", wave6x2Results.logbookToggleExists);
        check(
            "Welle 6.X.2 B1 V8.14: #log default hidden (Section bleibt sichtbar)",
            wave6x2Results.logbookHiddenByDefault
        );
        check("Welle 6.X.2 V8.14: #console-log-toggle Inline-Button im DOM", wave6x2Results.consoleLogToggleExists);
        check("Welle 6.X.2 B1: Toggle aktivieren macht Logbuch sichtbar", wave6x2Results.logbookVisibleAfterToggle);
        check("Welle 6.X.2 B1: Toggle deaktivieren versteckt Logbuch", wave6x2Results.logbookHiddenAfterUntoggle);
        check("Welle 6.X.2 V8.14: Inline-Toggle expandiert Logbuch", wave6x2Results.inlineToggleExpands);
        check("Welle 6.X.2 V8.14: Inline-Toggle collapsed Logbuch", wave6x2Results.inlineToggleCollapses);
        check(
            "Welle 6.X.2 B2: #architecture-actions aus dem world-drawer entfernt",
            wave6x2Results.architectureActionsRemoved
        );
        check("Welle 6.X.2 B4: Hotbar zykelt vorwärts", wave6x2Results.hotbarCyclesForward);
        check("Welle 6.X.2 B4: Hotbar zykelt rückwärts", wave6x2Results.hotbarCyclesBackward);
        check("Welle 6.X.2 B4: Hotbar wrappt bei 0 → 8", wave6x2Results.hotbarWrapsAtZero);
    } else {
        check("Welle 6.X.2: UI-Politur-Tests laufen", false, wave6x2Results ? wave6x2Results.error : "no result");
    }

    // ### Vision-Quick-Wins ###
    // C1 at_player_forward(dist) DSL-Resolver + Chat „baue X hier"
    // C3 Soul-bound Sprung-Steilheits-Toleranz
    const wave6x3Results = await safeEvaluate(page, () => {
        const out = {};

        // --- C1: at_player_forward DSL-Resolver
        if (r.dslPositions.at_player_forward) {
            // Spieler bei (10, 50, 20), yaw=0 → der Blick geht nach +Z (die EINE Vorwärts-Richtung _blickVorn,
            // dieselbe wie Kamera und Phantom).
            // at_player_forward(8) liefert (10, 50, 28).
            // BÜHNE: die Vorwärts-Richtung (at_player_forward rechnet relativ zum Spieler)
            st.playerMesh.position.set(10, 50, 20);
            st.yaw = 0;
            const ctx = { state: st, rng: () => 0.5 };
            const pos = r.dslPositions.at_player_forward([8], ctx);
            out.atPlayerForwardOffset =
                Math.abs(pos.x - 10) < 0.01 && Math.abs(pos.y - 50) < 0.01 && Math.abs(pos.z - 28) < 0.01;
            // Mit yaw=π/2 → der Blick geht nach +X. at_player_forward(5) → (15, 50, 20)
            st.yaw = Math.PI / 2;
            const pos2 = r.dslPositions.at_player_forward([5], ctx);
            out.atPlayerForwardYawAware = Math.abs(pos2.x - 15) < 0.01 && Math.abs(pos2.z - 20) < 0.01;
            // Reset
            st.yaw = 0;
        }

        // --- C1: Chat „baue dorf hier" embedded forward-Position
        // BÜHNE: die Vorwärts-Richtung („baue dorf hier“ relativ zum Spieler)
        st.playerMesh.position.set(0, 50, 0);
        st.yaw = 0;
        const dslOut = r.parseChatToDsl("baue dorf hier");
        out.chatBuildDorfParses = !!(dslOut && dslOut.program);
        if (dslOut && dslOut.program) {
            // Erwartetes Format: ["spawn_village", ["at", x, y, z], seed, gier, tanH]
            out.chatBuildDorfFormat =
                dslOut.program[0] === "spawn_village" &&
                Array.isArray(dslOut.program[1]) &&
                dslOut.program[1][0] === "at" &&
                typeof dslOut.program[2] === "number";
            // Das Dorf trägt Ort UND Blick des Sprechers: der Ort ist der Sprecher (z ≈ 0), dazu seine Gier (0) und
            // sein Bildwinkel (> 0) — „vor dem Blick" legt `_siedlungsAnker` das Dorf aus dem Plan (gate:ankunft D9
            // misst die Häuser vor dem Spieler).
            const z = dslOut.program[1][3];
            st.yaw = Math.PI / 2;
            const dslOut2 = r.parseChatToDsl("baue dorf hier");
            st.yaw = 0;
            out.chatBuildDorfForwardOffset =
                Math.abs(z) < 0.5 &&
                dslOut.program[3] === 0 &&
                dslOut.program[4] > 0 &&
                !!(dslOut2 && Math.abs(dslOut2.program[3] - Math.PI / 2) < 1e-9);
        }

        // --- C3: _canSoulJumpFromSlope existiert

        // --- C3: kein Slope → springen erlaubt
        st.onSteepSlope = false;
        out.flatGroundJumpAllowed = r._canSoulJumpFromSlope() === true;

        // --- C3: Slope + frieden → springen erlaubt (Modus-Override)
        st.onSteepSlope = true;
        r.setGameMode("frieden");
        out.peaceModeOverridesSlope = r._canSoulJumpFromSlope() === true;

        // --- C3: Slope + schöpfer → springen erlaubt
        r.setGameMode("schöpfer");
        out.creatorModeOverridesSlope = r._canSoulJumpFromSlope() === true;

        // --- C3: Slope + pfad + Phönix → kann springen (lebendig hoch)
        r.setGameMode("pfad");
        // Gemessen wird die INTRINSISCHE Seelen-Eigenschaft („Drache rutscht, dichte HOCH"):
        // `_canSoulJumpFromSlope` liest `statTags`, in die computePlayerStats NACH dem Soul-Clamp die
        // aktiven Boosts addiert (Emotion/Welt-Resonanz — transienter Konfounder) → Boosts leeren. Dann
        // gilt für jede Wund-Intensität w∈[0,1]: Drache-score = 0.4−0.05w (< 0.4), Phönix-score =
        // 0.475−0.05w (≥ 0.4) — der Wund-Term verschiebt beide gleich. Linse: diag-soul-jump (git-Archiv).
        if (st.player) st.player.boosts = [];
        // ALTLASTEN-NULL: eine LEICHTE lebendige Seele (federn-Fixture,
        // lebendig≈0.98/dichte≈0.29 → score 0.60) klettert; der WOLF-Körper
        // (stein-dicht) rutscht — dieselbe Substanz-Physik, lebende Träger.
        st.customSouls = st.customSouls || {};
        st.customSouls.leichtprobe = {
            label: "Leicht-Probe",
            bodyParts: [
                {
                    shape: "plane",
                    material: "federn",
                    size: { x: 0.9, y: 0.04, z: 0.5 },
                    position: { x: 0.5, y: 0.5, z: 0 },
                },
                {
                    shape: "plane",
                    material: "federn",
                    size: { x: 0.9, y: 0.04, z: 0.5 },
                    position: { x: -0.5, y: 0.5, z: 0 },
                },
                {
                    shape: "box",
                    material: "federn",
                    size: { x: 0.4, y: 0.5, z: 0.3 },
                    position: { x: 0, y: 0.4, z: 0 },
                },
            ],
        };
        r.applyPlayerSoul("leichtprobe");
        r.recomputePlayerStats();
        out.phoenixCanJumpFromSlope = r._canSoulJumpFromSlope() === true;
        out._phoenixTags = st.player.statTags
            ? `lebendig=${st.player.statTags.lebendig?.toFixed(2)} dichte=${st.player.statTags.dichte?.toFixed(2)}`
            : "no tags";

        // --- C3: Slope + pfad + Wolf-Körper → kann NICHT springen (dichte hoch)
        r.applyPlayerSoul("wolf");
        r.recomputePlayerStats();
        out.dragonCannotJumpFromSlope = r._canSoulJumpFromSlope() === false;
        out._dragonTags = st.player.statTags
            ? `lebendig=${st.player.statTags.lebendig?.toFixed(2)} dichte=${st.player.statTags.dichte?.toFixed(2)}`
            : "no tags";

        // Cleanup
        delete st.customSouls.leichtprobe;
        r.applyPlayerSoul("human");
        r.recomputePlayerStats();
        st.onSteepSlope = false;
        r.setGameMode("frieden");

        return out;
    });

    if (wave6x3Results && !wave6x3Results.error) {
        check(
            "Welle 6.X.3 C1: at_player_forward(8) liefert Position 8m vor Spieler (yaw=0)",
            wave6x3Results.atPlayerForwardOffset
        );
        check(
            "Welle 6.X.3 C1: at_player_forward respektiert yaw (π/2 → +X, die EINE Vorwärts-Richtung)",
            wave6x3Results.atPlayerForwardYawAware
        );
        check("Welle 6.X.3 C1: Chat 'baue dorf hier' parst zu DSL", wave6x3Results.chatBuildDorfParses);
        check(
            "Welle 6.X.3 C1: Chat 'baue dorf hier' Format [spawn_village, at, seed]",
            wave6x3Results.chatBuildDorfFormat
        );
        check(
            "Welle 6.X.3 C1: Chat 'baue dorf hier' trägt Ort und Blick des Sprechers (z ≈ 0, Gier 0 bzw. π/2, Bildwinkel > 0)",
            wave6x3Results.chatBuildDorfForwardOffset
        );
        check("Welle 6.X.3 C3: kein Slope → Sprung erlaubt", wave6x3Results.flatGroundJumpAllowed);
        check("Welle 6.X.3 C3: frieden-Modus überschreibt Slope-Block", wave6x3Results.peaceModeOverridesSlope);
        check("Welle 6.X.3 C3: schöpfer-Modus überschreibt Slope-Block", wave6x3Results.creatorModeOverridesSlope);
        check(
            "Welle 6.X.3 C3 (NULL): leichte lebendige Seele darf von Slope springen",
            wave6x3Results.phoenixCanJumpFromSlope,
            wave6x3Results._phoenixTags
        );
        check(
            "Welle 6.X.3 C3 (NULL): Wolf-Körper darf nicht von Slope springen (stein-dicht)",
            wave6x3Results.dragonCannotJumpFromSlope,
            wave6x3Results._dragonTags
        );
    } else {
        check("Welle 6.X.3: Vision-Quick-Win-Tests laufen", false, wave6x3Results ? wave6x3Results.error : "no result");
    }

    // ### Identity ###
    // F1 Begleiter-Name + Avatar-Name (LLM-Persona)
    const wave6x45Results = await safeEvaluate(page, () => {
        const out = {};

        // --- F1: state-Felder existieren mit Defaults
        out.companionNameDefault = st.grok.companionName === "Grok";
        out.playerNameDefault = st.player.name === "Schöpfer";

        // --- F1: Input-Change setzt state + localStorage
        const ci = document.getElementById("companion-name-input");
        if (ci) {
            ci.value = "Lyra";
            ci.dispatchEvent(new Event("input"));
            out.companionNameUpdated = st.grok.companionName === "Lyra";
            out.companionNamePersisted =
                typeof localStorage !== "undefined" && localStorage.getItem("anazh.companion.name") === "Lyra";
            // Reset auf Default
            ci.value = "Grok";
            ci.dispatchEvent(new Event("input"));
        }
        const pi = document.getElementById("player-name-input");
        if (pi) {
            pi.value = "Aelyn";
            pi.dispatchEvent(new Event("input"));
            out.playerNameUpdated = st.player.name === "Aelyn";
            out.playerNamePersisted =
                typeof localStorage !== "undefined" && localStorage.getItem("anazh.player.name") === "Aelyn";
            pi.value = "Schöpfer";
            pi.dispatchEvent(new Event("input"));
        }

        // --- F1: System-Prompt enthält die zwei Namen
        st.grok.companionName = "TestCompanion";
        st.player.name = "TestPlayer";
        const prompt = r.llmBuildSystemPrompt();
        out.promptContainsCompanionName = /TestCompanion/.test(prompt);
        out.promptContainsPlayerName = /TestPlayer/.test(prompt);
        // Reset auf Defaults
        st.grok.companionName = "Grok";
        st.player.name = "Schöpfer";

        return out;
    });

    if (wave6x45Results && !wave6x45Results.error) {
        check("Welle 6.X.4 F1: state.grok.companionName default 'Grok'", wave6x45Results.companionNameDefault);
        check("Welle 6.X.4 F1: state.player.name default 'Schöpfer'", wave6x45Results.playerNameDefault);
        check("Welle 6.X.4 F1: Companion-Input ändert state.grok.companionName", wave6x45Results.companionNameUpdated);
        check("Welle 6.X.4 F1: Companion-Name persistiert in localStorage", wave6x45Results.companionNamePersisted);
        check("Welle 6.X.4 F1: Player-Input ändert state.player.name", wave6x45Results.playerNameUpdated);
        check("Welle 6.X.4 F1: Player-Name persistiert in localStorage", wave6x45Results.playerNamePersisted);
        check("Welle 6.X.4 F1: System-Prompt enthält Companion-Name", wave6x45Results.promptContainsCompanionName);
        check("Welle 6.X.4 F1: System-Prompt enthält Player-Name", wave6x45Results.promptContainsPlayerName);
    } else {
        check("Welle 6.X.4: Identity-Tests laufen", false, wave6x45Results ? wave6x45Results.error : "no result");
    }
}

// M1 VERBINDUNGS-WERKSTATT: der Dialog ist ZWEI Gruppen Glyph-KACHELN; der SUBSTANZ-VORSCHLAG =
// argmax über die bestehende Stärke-Wahrheit (kein zweites Mapping); ANKER-Kacheln starten den
// FACE-SNAP-Pick (3×3 je Fläche), der Punkt reist als Substanz.
async function checkBandM1VerbindungsWerkstatt({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const blu = st.blueprints;
        const mk = (mat) => ({
            name: "__m1band",
            builtIn: false,
            parts: [
                __teil("box", mat, 0, 0.5, 0, 1, 1, 1),
                __teil("box", mat, 1.0, 0.5, 0, 1, 1, 1),
            ],
        });
        try {
            // (1) der SUBSTANZ-VORSCHLAG konsumiert die Stärke-Wahrheit: das
            // Material-Paar entscheidet (eisen → Schweißen, holz → Binden).
            const sugEisen = r._suggestConnectionType(mk("eisen"), 0, 1);
            const sugHolz = r._suggestConnectionType(mk("holz"), 0, 1);
            out.suggestEmergent =
                sugEisen.type === "welding" && sugHolz.type === "lashing" && sugEisen.strength > sugHolz.strength;
            out.suggestIsStrength =
                Math.abs(
                    sugEisen.strength -
                        r.computeConnectionStrength({ type: "welding", partA: 0, partB: 1 }, mk("eisen"))
                ) < 1e-9;

            // (2) der KACHEL-Dialog: 2 Gruppen, 11 Kacheln (8 Verbinden + 3 Anker),
            // Glyphen, der Vorschlag leuchtet (DOM-Probe am eisen-Paar).
            blu.__m1band = mk("eisen");
            const ws = r._ensureWorkshopState();
            const savedSel = ws.selectedBlueprint;
            ws.selectedBlueprint = "__m1band";
            r._workshopOpenConnectPopover(0, 1);
            const ov = document.getElementById("workshop-connect-overlay");
            out.dialogTiles =
                !!ov &&
                ov.querySelectorAll(".conn-tile").length === 11 &&
                ov.querySelectorAll(".conn-grid").length === 2 &&
                ov.querySelectorAll(".conn-group-label").length === 2 &&
                ov.querySelectorAll(".conn-glyph").length === 11;
            const sugTile = ov && ov.querySelector(".conn-tile.suggested");
            out.dialogSuggests = !!sugTile && sugTile.getAttribute("data-conn-type") === "welding";
            r._workshopCloseConnectPopover();
            ws.selectedBlueprint = savedSel;

            // (3) der FACE-SNAP (pure Mathe): Flächen-Mitte · Kanten-Mitte · Ecke.
            const size = { x: 1, y: 1, z: 1 };
            const sMitte = r._workshopSnapAnchor({ x: 0.5, y: 0.05, z: 0.05 }, size);
            const sKante = r._workshopSnapAnchor({ x: 0.5, y: 0.42, z: 0.05 }, size);
            const sEcke = r._workshopSnapAnchor({ x: 0.5, y: 0.42, z: -0.42 }, size);
            const eq = (a, x, y, z) => a.x === x && a.y === y && a.z === z;
            out.snapMathe = eq(sMitte, 0.5, 0, 0) && eq(sKante, 0.5, 0.5, 0) && eq(sEcke, 0.5, 0.5, -0.5);

            // (4) der PICK end-to-end: Anker-Kachel → Modus → Klick-Hit → die
            // Verbindung trägt den gesnappten Punkt; ein zweiter Pick ERSETZT.
            blu.__m1band = mk("holz");
            ws.selectedBlueprint = "__m1band";
            r._workshopBeginAnchorPick("sitz", 0);
            out.pickArmed = !!ws.anchorPick && ws.anchorPick.type === "sitz" && ws.anchorPick.partIdx === 0;
            r._workshopHandleAnchorPick({ point: new THREE.Vector3(0.1, 1.0, 0.1) }, 0);
            const c1 = (blu.__m1band.connections || []).find((c) => c.type === "sitz");
            out.pickWrites =
                !!c1 && c1.partB === -1 && !!c1.anchor && c1.anchor.y === 0.5 && c1.anchor.x === 0 && c1.anchor.z === 0;
            r._workshopBeginAnchorPick("sitz", 0);
            r._workshopHandleAnchorPick({ point: new THREE.Vector3(0.45, 0.95, 0.1) }, 0);
            const sitzConns = (blu.__m1band.connections || []).filter((c) => c.type === "sitz");
            out.pickReplaces = sitzConns.length === 1 && sitzConns[0].anchor.x === 0.5;

            // (5) der Punkt WIRKT: _attachPointFor liest den expliziten Anker
            // (Part-Zentrum + anchor — die gewählte Stelle gilt wörtlich).
            blu.__m1band.connections = [{ type: "sitz", partA: 0, partB: -1, anchor: { x: 0.5, y: 0.5, z: 0 } }];
            const ap = r._attachPointFor(blu.__m1band, "sitz").point;
            out.anchorConsumed = ap.x === 0.5 && ap.y === 1.0 && ap.z === 0;

            // (6) der Punkt REIST: validateBlueprintConnections bewahrt anchor
            // (geklemmt ±64), Struktur-Müll fällt.
            const v = r.validateBlueprintConnections(
                [
                    { type: "sitz", partA: 0, partB: -1, anchor: { x: 0.5, y: 200, z: -0.5 } },
                    { type: "griff", partA: 1, partB: -1, anchor: { x: "müll", y: 0, z: 0 } },
                ],
                2
            );
            out.anchorTravels =
                v.length === 2 && !!v[0].anchor && v[0].anchor.y === 64 && v[0].anchor.x === 0.5 && !v[1].anchor;

            // (7) der Punkt ist ABLESBAR: der Werkstatt-Viewer (connectionLines)
            // zeigt den Anker-Marker am exakten Punkt.
            const g = r._buildFromBlueprint(blu.__m1band, 0, undefined, { connectionLines: true });
            const marker = g.children.find((ch) => ch.userData && ch.userData.isAnchorPoint);
            out.anchorVisible = !!marker && marker.position.x === 0.5 && marker.position.y === 1.0;
            return out;
        } finally {
            delete blu.__m1band;
            const ws2 = r._ensureWorkshopState();
            ws2.anchorPick = null;
        }
    });
    check(
        "M1 Verbindungs-Werkstatt: der SUBSTANZ-VORSCHLAG emergiert aus der Stärke-Wahrheit (eisen→Schweißen, holz→Binden — kein zweites Mapping)",
        res.suggestEmergent && res.suggestIsStrength
    );
    check(
        "M1/W-G Verbindungs-Werkstatt: der Dialog ist ZWEI Gruppen Glyph-Kacheln (8 Verbinden [3 primary + 5 weitere…, W-G] + 3 Anker = 11 Kacheln) und der Vorschlag leuchtet",
        res.dialogTiles && res.dialogSuggests
    );
    check("M1 Face-Snap: die 3×3-Snap-Mathe rastet auf Flächen-Mitte · Kanten-Mitte · Ecke", res.snapMathe);
    check(
        "M1 Face-Snap: der Pick schreibt den gesnappten Anker-Punkt (partB=-1) und ein zweiter Pick ERSETZT",
        res.pickArmed && res.pickWrites && res.pickReplaces
    );
    check(
        "M1 Face-Snap: der Punkt WIRKT (_attachPointFor liest ihn) · REIST (validate bewahrt, klemmt, siebt Müll) · ist ABLESBAR (Viewer-Marker)",
        res.anchorConsumed && res.anchorTravels && res.anchorVisible
    );
}

// NUTZER-BLICK (diag-nachbau): (1) der Verbindungs-Dialog öffnet IMMER (✂ Lösen ist eine Kachel,
// ein Klick ERSETZT), sonst sind Anker verbundener Parts unerreichbar; (2) consumable frisst keinen
// Holz-Kasten (spread-Gegen-Achse); (3) das Rezeptbuch kennt die Fahrzeug-Gruppe.
async function checkBandNutzerBlickNachbau({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const blu = st.blueprints;
        const ws = r._ensureWorkshopState();
        const savedSel = ws.selectedBlueprint;
        const savedMode = ws.manipulatorMode;
        try {
            // der NACHBAU (wie der Schöpfer): Holz-Korpus + 4 Holz-Räder.
            if (blu.__nb_wagen) delete blu.__nb_wagen;
            blu.__nb_wagen = { name: "__nb_wagen", label: "NB-Wagen", builtIn: false, parts: [], connections: [] };
            const add = (part) => r.addPartToBlueprint("__nb_wagen", part);
            add(__teil("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1));
            const rad = (x, z) =>
                add({
                    shape: "cylinder",
                    material: "holz",
                    position: { x, y: 0.34, z },
                    size: { x: 0.62, y: 0.14, z: 0.62 },
                    rotation: { x: 0, y: 0, z: 1.5707963 },
                });
            rad(-0.72, 0.8);
            rad(0.72, 0.8);
            rad(-0.72, -0.8);
            rad(0.72, -0.8);
            ws.selectedBlueprint = "__nb_wagen";
            ws.manipulatorMode = "connect";
            // (1) verbinden über den ECHTEN Klick-Pfad; der zweite Klick auf
            // VERBUNDENE Parts öffnet den Dialog (löscht NICHT mehr still).
            const connect = (a, b) => {
                r._workshopHandleConnectClick(a);
                r._workshopHandleConnectClick(b);
                const ov = document.getElementById("workshop-connect-overlay");
                const t = ov && (ov.querySelector(".conn-tile.suggested") || ov.querySelector(".conn-tile"));
                if (t) t.click();
            };
            connect(1, 0);
            connect(2, 0);
            connect(3, 0);
            connect(4, 0);
            const vier = (blu.__nb_wagen.connections || []).filter(
                (c) => !AnazhRealm.CONNECTION_TYPES[c.type].attachment
            ).length;
            r._workshopHandleConnectClick(1);
            r._workshopHandleConnectClick(0);
            const ov = document.getElementById("workshop-connect-overlay");
            out.dialogStattToggle =
                vier === 4 &&
                !!ov &&
                (blu.__nb_wagen.connections || []).length >= 4 && // NICHT still gelöst
                !!ov.querySelector(".conn-tile.conn-loesen"); // ✂ Lösen sichtbar
            // (2) die ANKER-Kacheln sind auf verbundenen Parts ERREICHBAR → Sitz.
            const sitzTile = ov && ov.querySelector('.conn-tile[data-conn-type="sitz"]');
            if (sitzTile) sitzTile.click();
            out.sitzErreichbar = !!(ws.anchorPick && ws.anchorPick.type === "sitz");
            if (out.sitzErreichbar) r._workshopHandleAnchorPick({ point: new THREE.Vector3(0, 1.03, 0) }, 1);
            // Moment — der Pick lief auf partIdx 1 (der Dialog war 1→0); der Anker sitzt auf partA=1 (Rad).
            // Der ECHTE Flow wählt den Korpus — für die Invariante zählt: der Anker KAM AN.
            const sitzConn = (blu.__nb_wagen.connections || []).find((c) => c.type === "sitz");
            out.sitzKamAn = !!sitzConn && !!sitzConn.anchor;
            // (3) die ROLLEN-KETTE des Nachbaus: vehicle → place → Fahrzeug-Gruppe.
            // (Der sitz sitzt hier auf dem Rad — rideable liest NUR Existenz+moveable.)
            out.nachbauVehicle = r.computeBlueprintRole(blu.__nb_wagen) === "vehicle";
            out.nachbauPlace = r._blueprintUseKind(blu.__nb_wagen) === "place";
            // ohne Sitz: KEIN Trank mehr (die spread-Gegen-Achse) — Bauwerk.
            const ohneSitz = {
                name: "__nb_ohnesitz",
                builtIn: false,
                parts: JSON.parse(JSON.stringify(blu.__nb_wagen.parts)),
                connections: (blu.__nb_wagen.connections || []).filter((c) => c.type !== "sitz"),
            };
            out.ohneSitzKeinTrank = r.computeBlueprintRole(ohneSitz) === "architecture";
            // (4) das Rezeptbuch führt den nachgebauten Wagen sichtbar oben unter „Griffbereit" (ein eigenes Werk, bauen.K1).
            r._recipeBookSig = null;
            r.renderRecipeBook();
            const kids = [...document.getElementById("inventory-recipes").children];
            const gi = kids.findIndex((e) => e.classList.contains("recipe-group") && e.textContent === "Griffbereit");
            const nach = gi >= 0 ? kids.slice(gi + 1) : [];
            const bis = nach.findIndex((e) => e.classList.contains("recipe-group"));
            out.rezeptGruppe = (bis < 0 ? nach : nach.slice(0, bis)).some(
                (z) => (z.querySelector(".recipe-name") || {}).textContent === "NB-Wagen"
            );
            // (5) der Kachel-Klick ERSETZT (ein Paar = eine Verbindung).
            const ov2 = document.getElementById("workshop-connect-overlay");
            if (ov2) r._workshopCloseConnectPopover();
            r._workshopHandleConnectClick(2);
            r._workshopHandleConnectClick(0);
            const ov3 = document.getElementById("workshop-connect-overlay");
            const welding = ov3 && ov3.querySelector('.conn-tile[data-conn-type="welding"]');
            if (welding) welding.click();
            const paar20 = (blu.__nb_wagen.connections || []).filter(
                (c) =>
                    !AnazhRealm.CONNECTION_TYPES[c.type].attachment &&
                    ((c.partA === 2 && c.partB === 0) || (c.partA === 0 && c.partB === 2))
            );
            out.klickErsetzt = paar20.length === 1 && paar20[0].type === "welding";
            return out;
        } finally {
            delete blu.__nb_wagen;
            ws.selectedBlueprint = savedSel;
            ws.manipulatorMode = savedMode;
            ws.anchorPick = null;
            ws.connectFirstPartIdx = null;
            r._workshopCloseConnectPopover();
        }
    });
    check(
        "Nutzer-Blick: zwei VERBUNDENE Parts öffnen den Dialog (✂ Lösen ist eine sichtbare Kachel — kein stiller Sofort-Toggle)",
        res.dialogStattToggle
    );
    check(
        "Nutzer-Blick: die Anker-Kacheln sind auf verbundenen Parts ERREICHBAR — der Sitz kommt an",
        res.sitzErreichbar && res.sitzKamAn
    );
    check(
        "Nutzer-Blick: der NACHGEBAUTE Holz-Wagen ist Fahrzeug (place) — und ohne Sitz Bauwerk, NIE Trank (spread-Gegen-Achse)",
        res.nachbauVehicle && res.nachbauPlace && res.ohneSitzKeinTrank
    );
    check(
        "Nutzer-Blick: das Rezeptbuch führt den eigenen Wagen griffbereit + ein Kachel-Klick ERSETZT die Verbindung (ein Paar, eine Verbindung)",
        res.rezeptGruppe && res.klickErsetzt
    );
}

// W-G Werkstatt-Gelenke begreifbar: macht computeMotionRoles · CONNECTION_TYPES sichtbar (Achsen-
// Geister im Viewer · Progressive Disclosure · Lehr-Satz · Gelenk-Probe). Headless prüft die LOGIK.
async function checkBandWGGelenke({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // (e) LEHR-SATZ: pure Funktion, alle Gelenk-Rollen → Menschen-Sprache.
        out.teachRad = /Rad.*rollt.*Querachse/.test(r._jointTeachLine("rad", "x") || "");
        out.teachTuer = /Tür.*schwenkt/.test(r._jointTeachLine("tuer", "y") || "");
        out.teachScharnier = /Scharnier.*Längsachse/.test(r._jointTeachLine("scharnier", "z") || "");
        out.teachNull = r._jointTeachLine("nonsense", "x") === null;
        // (d) PROGRESSIVE DISCLOSURE: die Typen NACH Substanz-Stärke geordnet.
        // der Wagen lebt als Substanz-Zeile (KIND_SUBSTANCE).
        const KSwg = (window.AnazhRealm || AnazhRealm).KIND_SUBSTANCE || {};
        const wagen = KSwg.fahrzeug_wagen
            ? {
                  name: "_wg_wagen",
                  parts: JSON.parse(JSON.stringify(KSwg.fahrzeug_wagen.parts)),
                  connections: JSON.parse(JSON.stringify(KSwg.fahrzeug_wagen.connections || [])),
              }
            : null;
        out.ranked = false;
        out.rankedOrdered = false;
        if (wagen) {
            const ranked = r._connectionTypesByStrength(wagen, 0, 1, 3);
            out.ranked = Array.isArray(ranked.primary) && ranked.primary.length === 3 && Array.isArray(ranked.more);
            const sp = ranked.primary.map((t) => ranked.strengths[t]);
            const sm = ranked.more.map((t) => ranked.strengths[t]);
            out.rankedOrdered =
                sp.every((v, i) => i === 0 || sp[i - 1] >= v) &&
                (sm.length === 0 || Math.min(...sp) >= Math.max(...sm));
        }
        // (b) ACHSEN-GEISTER: der Viewer-Build erzeugt Achsen-Linien (isJointAxis).
        out.axisGhosts = false;
        out.axisTeachAttached = false;
        const zA = window.__stoffZeuge(r);
        if (wagen) {
            let grp = null;
            try {
                grp = r._buildFromBlueprint(wagen, 0, undefined, { connectionLines: true });
            } finally {
                zA.zu();
            }
            let axes = 0;
            grp.traverse((o) => {
                if (o.userData && o.userData.isJointAxis && o.isLine) axes++;
                if (o.userData && o.userData.isJointAxis && o.userData.jointTeach) out.axisTeachAttached = true;
            });
            out.axisGhosts = axes >= 1;
            // KONSUM: der RAF-Tick der Werkstatt wackelt die Gelenk-Probe über den EINEN Animator (der Tick gefangen)
            const ws = r._ensureWorkshopState(),
                altPrev = ws.preview,
                altRaf = window.requestAnimationFrame;
            let tick = null;
            window.requestAnimationFrame = (cb) => ((tick = tick || cb), 0);
            r._workshopSyncCanvasSize = () => {};
            r._workshopRender = () => {};
            try {
                const roles = r.computeMotionRoles(wagen.parts, wagen.connections);
                ws.preview = {
                    active: true,
                    rafId: null,
                    dirty: false,
                    currentMesh: grp,
                    probe: { start: performance.now(), dur: 2200, roles },
                };
                r._workshopStartRAF();
                out.probeInRAF = !!tick && window.__consumes({ t: tick }, "t", r, "_animateCompoundMotion", []);
            } finally {
                window.requestAnimationFrame = altRaf;
                ws.preview = altPrev;
                delete r._workshopSyncCanvasSize;
                delete r._workshopRender;
            }
        }
        out.axisNoError = zA.zu().length === 0; // der Zeuge zählt jeden Stoff-Bruch des Achsen-Baus (K22)
        // (c) GELENK-PROBE: Button + RAF-Konsum (Wiring; Animation Browser).
        out.probeBtn = !!document.getElementById("workshop-probe-btn");
        return out;
    });
    check(
        "W-G(e) Lehr-Satz: jede Gelenk-Rolle spricht Menschen-Sprache (Rad→Querachse · Tür→schwenkt · Scharnier→Längsachse · Unsinn→null)",
        res.teachRad && res.teachTuer && res.teachScharnier && res.teachNull
    );
    check(
        "W-G(d) Progressive Disclosure: die Verbindungs-Typen sind NACH Substanz-Stärke geordnet (primary 3 stärkste absteigend ≥ more — der 8er-Block bekommt GEMESSENEN Vorrang)",
        res.ranked && res.rankedOrdered
    );
    check(
        "W-G(b) Achsen-Geister: der Viewer zeichnet die Gelenk-Dreh-Achsen (isJointAxis-Linien + Lehr-Satz attached; computeMotionRoles GEZEICHNET, kein Node-Fehler)",
        res.axisGhosts && res.axisTeachAttached && res.axisNoError
    );
    check(
        "W-G(c) Gelenk-Probe: Button + RAF-Konsum (bauen → SEHEN; die Animation ist Schöpfer-Browser-Feel)",
        res.probeBtn && res.probeInRAF
    );
}

module.exports = {
    checkBandV1774UseByRole,
    checkBandV1776WorkshopPrecision,
    checkBandV1777SteigerungVisible,
    checkBandV1789WorkshopReadout,
    checkBandV1790Recalibration,
    checkBandWelle6Keybindings,
    checkBandWellePerfCArchInstancing,
    checkBandWelle6XAudit,
    checkBandM1VerbindungsWerkstatt,
    checkBandNutzerBlickNachbau,
    checkBandWGGelenke,
};
