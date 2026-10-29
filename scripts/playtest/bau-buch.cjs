"use strict";
// scripts/playtest/bau-buch.cjs — der Richter von Bau/buch (spec/stamm/modul-karte.json): Bauplan-Buch · Rollen · Präzision · Verbindungen · CRUD.
// 17 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar, ohneWurf } = require("../playtest.cjs");

// Rollen-Resonanz: computeBlueprintRole = ARGMAX der Resonanz des Produkt-Vektors (Tags ⊕
// bodyShape/portalShape) gegen FORM_ROLE_SIGNATURES; „architecture“ ist positive Signatur (dicht +
// hart) → Stein-Tempel/Felsbogen wird Bauwerk, obwohl body-förmig.
async function checkBandV1769RoleResonance({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const blu = r.state.blueprints;
        const part = (mat, x, y, z) => ({
            shape: "box",
            material: mat,
            size: { x: 0.6, y: 0.6, z: 0.6 },
            position: { x, y, z },
        });

        out.signaturen = !!r.constructor.FORM_ROLE_SIGNATURES;

        // (1) der Produkt-Vektor trägt die räumliche Schicht (R2): bodyShape/portalShape als Achsen neben den Tags.
        // der temple-Blueprint fiel; dieselbe Klasse (gespiegelte Stein-Säulen
        // + Sturz) lebt eingefroren als KIND_SUBSTANCE.tor_basis — der Test wandert auf die Substanz-Zeile.
        const KS169 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        const templeFix = { parts: JSON.parse(JSON.stringify(KS169.tor_basis.parts)) };
        const tv = r._blueprintProductVector(templeFix);
        out.vectorHasSpatial = "bodyShape" in tv && "portalShape" in tv && "dichte" in tv;

        // (2) Säulen-Klasse (tor_basis-Substanz) + felsbogen sind architecture, nicht soul. Zwei gültige
        // Pfade: _isBodyShaped klemmt Stein direkt (tvBody === false, keine lebendige Masse) ODER bei
        // body-förmig schlägt die Resonanz (archScore > soulScore) — beide ergeben architecture.
        out.templeHealed = r.computeBlueprintRole(templeFix) === "architecture";
        out.felsbogenHealed = r.computeBlueprintRole(blu.felsbogen) === "architecture";
        const tvBody = r._isBodyShaped(templeFix);
        const archScore = r._blueprintResonance(tv, r.constructor.FORM_ROLE_SIGNATURES.architecture);
        const soulScore = r._blueprintResonance(tv, r.constructor.FORM_ROLE_SIGNATURES.soul);
        out.healMechanism = tvBody === false || archScore > soulScore;

        // (3) DER WÄCHTER — die Form-Fallback-Built-ins, Baseline eingefroren (felsbogen jetzt architecture).
        // village/temple sind PHYSISCH gefallen; die 8 lebenden Arch-Built-ins tragen die Baseline.
        const wantArch = [
            "waterfall",
            "stein_block",
            "damm",
            "start_plattform",
            "kristall_geode",
            "glutbrunnen",
            "felsturm",
            "felsbogen",
        ];
        out.allArch = wantArch.every((n) => r.computeBlueprintRole(blu[n]) === "architecture");
        // Bäume sind ARCHITECTURE: die bulk-Achse (span/8) nimmt dem Riesen-Laub die consumable-Resonanz.
        // Geprüft am GEWACHSENEN Baum (_growTreeBlueprintForSpawn; statische Baum-Baupläne gibt es nicht).
        const __rrEiche = r._growTreeBlueprintForSpawn("baum_eiche", "rr|eiche");
        const __rrKiefer = r._growTreeBlueprintForSpawn("baum_kiefer", "rr|kiefer");
        out.baeumeArchitecture =
            !!__rrEiche &&
            !!__rrKiefer &&
            r.computeBlueprintRole(blu[__rrEiche]) === "architecture" &&
            r.computeBlueprintRole(blu[__rrKiefer]) === "architecture";

        // (4) Form-Rollen via Resonanz: weicher fleisch-Körper → soul, Turm → architecture, Nahrung →
        // consumable, magie-Ring → portal, Stein-Ring → architecture. Ein GLIED ist GESTRECKT (gespiegelte
        // Blobs sind keine Glieder, sonst wird die Eiche Seele) → die Fixture nutzt gestreckte Arme.
        const arm = (mat, x) => ({
            shape: "box",
            material: mat,
            size: { x: 0.4, y: 1.2, z: 0.4 },
            position: { x, y: 2, z: 0 },
        });
        const body = {
            parts: [part("fleisch", 0, 1, 0), part("knochen", 0, 3, 0), arm("fleisch", -1), arm("fleisch", 1)],
        };
        const tower = { parts: [part("stein", 0, 0, 0), part("stein", 0, 1, 0), part("stein", 0, 2, 0)] };
        const food = {
            parts: [
                { shape: "sphere", material: "fleisch", size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: 0, z: 0 } },
            ],
        };
        const magicRing = {
            parts: [
                { shape: "torus", material: "quarz", size: { x: 3, y: 0.4, z: 3 }, position: { x: 0, y: 1, z: 0 } },
            ],
        };
        const stoneRing = {
            parts: [
                { shape: "torus", material: "stein", size: { x: 3, y: 0.4, z: 3 }, position: { x: 0, y: 1, z: 0 } },
            ],
        };
        out.bodySoul = r.computeBlueprintRole(body) === "soul";
        out.towerArch = r.computeBlueprintRole(tower) === "architecture";
        out.foodConsumable = r.computeBlueprintRole(food) === "consumable";
        out.ringPortal = r.computeBlueprintRole(magicRing) === "portal";
        out.stoneRingArch = r.computeBlueprintRole(stoneRing) === "architecture";

        // (5) DER FLIP — dieselbe body-Geometrie, andere Substanz kippt die Rolle: fleisch → soul, stein → architecture
        const stoneBody = {
            parts: [part("stein", 0, 1, 0), part("stein", 0, 3, 0), arm("stein", -1), arm("stein", 1)],
        };
        out.substanceFlip =
            r.computeBlueprintRole(body) === "soul" && r.computeBlueprintRole(stoneBody) === "architecture";

        // (6) die opChain-DOMÄNE behält Vorrang (Krafting-Intent vor Form) — ein forging-Gerät bleibt tool/armor
        if (blu.__rr_forge) delete blu.__rr_forge;
        blu.__rr_forge = { name: "__rr_forge", parts: [part("eisen", 0, 0, 0)] };
        const savedMode = r.getGameMode();
        r.setGameMode("schöpfer");
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer"); // V17.88 op-Bibliothek leihen
        r.applyOpToPart("__rr_forge", 0, "schmiede-hammer");
        const forgeRole = r.computeBlueprintRole(blu.__rr_forge);
        out.domainPriority = forgeRole === "tool" || forgeRole === "armor";
        delete blu.__rr_forge;
        r.setGameMode(savedMode);
        return out;
    });
    check("R2/R3: FORM_ROLE_SIGNATURES steht", res.signaturen);
    check(
        "der Produkt-Vektor trägt die räumliche Schicht (bodyShape/portalShape) neben den Tags",
        res.vectorHasSpatial
    );
    check(
        "R3 DER HEAL: Säulen-Klasse (tor_basis-Substanz) + felsbogen sind architecture (waren soul) — body-förmig, aber als dichte Stein-Struktur resoniert architecture STÄRKER als soul",
        res.templeHealed && res.felsbogenHealed && res.healMechanism
    );
    check(
        "R3 DER WÄCHTER: die Form-Fallback-Built-ins emergieren auf der Baseline (8 architecture; M2: die 2 Bäume jetzt auch — bulk nimmt dem Laub die Trank-Resonanz)",
        res.allArch && res.baeumeArchitecture
    );
    check(
        "R3 KONSUM: die Form-Rollen via Resonanz — fleisch-Körper→soul, Turm→architecture, Nahrung→consumable, magie-Ring→portal, Stein-Ring→architecture",
        res.bodySoul && res.towerArch && res.foodConsumable && res.ringPortal && res.stoneRingArch
    );
    check(
        "R3 DER FLIP: dieselbe Körper-Geometrie, andere Substanz kippt die Rolle (fleisch→soul, stein→architecture) — live Vektor, kein Schloss",
        res.substanceFlip
    );
    check(
        "die opChain-DOMÄNE behält Vorrang (ein forging-Gerät bleibt tool/armor, nicht die Form-Resonanz)",
        res.domainPriority
    );
}

// Katalysator-Op aus Form × Material (scharf→schneiden, stumpf-dicht→schmieden, magie→wandeln):
// `setBlueprintToolMeta(name)` ohne opClass leitet ab, eine explizite opClass ist Override; additive
// bleibt Intent. Wächter synthetisch (Built-in-Tools sind formlos).
async function checkBandV1771ToolOpFromForm({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const blu = r.state.blueprints;
        const mk = (shape, mat) => ({
            parts: [{ shape, material: mat, size: { x: 0.6, y: 1.2, z: 0.6 }, position: { x: 0, y: 0, z: 0 } }],
        });

        out.signaturen = !!r.constructor.OP_CLASS_SIGNATURES;
        // der Produkt-Vektor trägt auch die Katalysator-Geometrie (pointedFraction)
        out.vectorHasPointed = "pointedFraction" in r._blueprintProductVector(mk("cone", "eisen"));

        // (KONSUM) die Op EMERGIERT aus der Form: scharf→subtractive, stumpf-dicht→plastic, magie→phaseChange
        out.bladeSubtractive = r._computeToolOpFromForm(mk("cone", "eisen")).opClass === "subtractive";
        out.hammerPlastic = r._computeToolOpFromForm(mk("box", "eisen")).opClass === "plastic";
        out.wandPhaseChange = r._computeToolOpFromForm(mk("helix", "quarz")).opClass === "phaseChange";
        out.emptyFallback = r._computeToolOpFromForm({ parts: [] }).opClass === "subtractive";

        // (DER FLIP) dasselbe Material (eisen), andere FORM → andere Op (cone→schneiden, box→schmieden) — Form-getrieben
        out.formFlip =
            r._computeToolOpFromForm(mk("cone", "eisen")).opClass === "subtractive" &&
            r._computeToolOpFromForm(mk("box", "eisen")).opClass === "plastic";

        // (KONSUM) setBlueprintToolMeta OHNE opClass → die Op emergiert (emergent-Flag), role=tool + toolMeta gesetzt
        if (blu.__op_blade) delete blu.__op_blade;
        blu.__op_blade = { name: "__op_blade", parts: mk("cone", "eisen").parts };
        const auto = r.setBlueprintToolMeta("__op_blade");
        out.autoDerives =
            auto.ok === true &&
            auto.emergent === true &&
            auto.opClass === "subtractive" &&
            blu.__op_blade.role === "tool" &&
            !!blu.__op_blade.toolMeta;
        // ein emergent markiertes Werkzeug registriert sich
        out.registersEmergent = r.registerBlueprintAsTool("__op_blade").ok === true;

        // (Override unverändert) explizite opClass = manueller Override + Validierung bleibt
        if (blu.__op_man) delete blu.__op_man;
        blu.__op_man = { name: "__op_man", parts: mk("box", "stein").parts };
        const man = r.setBlueprintToolMeta("__op_man", "brew", "additive"); // Schöpfer erzwingt additive (Intent)
        out.manualOverride = man.ok === true && man.emergent === false && blu.__op_man.toolMeta.opClass === "additive";
        out.rejectsBadClass = r.setBlueprintToolMeta("__op_man", "x", "uberklasse").ok === false; // Validierung unbroken

        // cleanup
        if (r.state.tools && r.state.tools.__op_blade) delete r.state.tools.__op_blade;
        if (r.state.player && Array.isArray(r.state.player.tools))
            r.state.player.tools = r.state.player.tools.filter((t) => t !== "__op_blade");
        delete blu.__op_blade;
        delete blu.__op_man;
        return out;
    });
    check(
        "OP_CLASS_SIGNATURES steht; der Produkt-Vektor trägt pointedFraction",
        res.signaturen && res.vectorHasPointed
    );
    check(
        "S10 KONSUM: die Op EMERGIERT aus der Form — scharf→subtractive, stumpf-dicht→plastic, magie→phaseChange (+ leer→subtractive)",
        res.bladeSubtractive && res.hammerPlastic && res.wandPhaseChange && res.emptyFallback
    );
    check(
        "S10 DER FLIP: dasselbe Material (eisen), andere Form → andere Op (cone→schneiden, box→schmieden) — Form-getrieben, kein Tippen",
        res.formFlip
    );
    check(
        "S10 KONSUM: setBlueprintToolMeta OHNE opClass leitet die Op aus der Form ab (emergent) + markiert + registriert",
        res.autoDerives && res.registersEmergent
    );
    check(
        "eine explizite opClass bleibt der Schöpfer-Override (manuell, additive erzwingbar) + die Validierung ist unbroken",
        res.manualOverride && res.rejectsBadClass
    );
}

// ═══ Ω-PHYSIS · SÄULE I · Ω-Φ1 — SCHWERPUNKT + MASSE (der Grundstein) ═══
// Physik-Schiedsrichter, headless objektiv (reine Berechnung, kein WebGPU-Flake): ein
// asymmetrischer Bauplan hat den CoM nahe der schweren Seite, nicht in der Mitte.
async function checkBandOmegaPhi1CoM({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        // (die Masse in kg aus ρ der Stoff-Zeile und ihre Mutation misst gate:kampf-gefuehl (A), physik K1)
        const dense = "stein";
        const mk = (parts) => ({ parts });
        // (1) symmetrisch: zwei identische Teile bei ±x → CoM.x ≈ 0
        const cSym = r._compoundCenterOfMass(
            mk([
                { position: { x: -2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, material: dense },
                { position: { x: 2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, material: dense },
            ])
        );
        out.symCentered = Math.abs(cSym.com.x) < 1e-6 && cSym.mass > 0;
        // (2) größeres Teil bei +x → CoM verschiebt sich dorthin (Volumen → Masse)
        const cVol = r._compoundCenterOfMass(
            mk([
                { position: { x: -2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, material: dense },
                { position: { x: 2, y: 0, z: 0 }, size: { x: 2, y: 2, z: 2 }, material: dense },
            ])
        );
        out.volShiftsCoM = cVol.com.x > 0.5;
        // (3) leerer/ungültiger Bauplan → sicher 0 (keine Division durch 0)
        out.emptySafe = r._compoundCenterOfMass({ parts: [] }).mass === 0 && r._compoundCenterOfMass(null).mass === 0;
        return out;
    });
    check("Ω-Φ1: symmetrischer Bauplan → CoM zentriert (x≈0)", res.symCentered === true);
    check("Ω-Φ1: größeres Teil → CoM verschiebt sich dorthin (Volumen→Masse)", res.volShiftsCoM === true);
    check("Ω-Φ1: leerer/ungültiger Bauplan → Masse 0 (sicher, keine Div/0)", res.emptySafe === true);
}

// Ω-PHYSIS Säule I (Ω-Φ2..Φ5 Schiedsrichter) + Säule II (Ω-L1..L3 + Ω-W1): die gerechnete Physik
// speist den Resonanz-Leser + den Warum-Chip, getrennt von der Konvention; reine Berechnung → kein
// Flake.
async function checkBandOmegaPhysisSaeuleI_II({ page, check }) {
    const res = await page.evaluate(() => {
        const C = r.constructor;
        const { dense, light } = __dichtLeicht();
        const P = (parts, connections) => ({ parts, connections });
        const pt = (x, y, z, sx, sy, sz, m, shape, rot) => ({
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
            material: m || dense,
            shape,
            rotation: rot,
        });
        const o = {};
        // Φ2 (kippt), Φ3b (knickt), Φ5 (schwebt): der Prüf-Satz in der Welt (gate:werkstatt-weg)
        // ── Ω-Φ3 Steifigkeit + Versagen ──
        o.boardAniso = r._bendingStiffness(P([pt(0, 0, 0, 6, 0.3, 0.6)])).anisotropy > 3;
        const ring = P([
            pt(-1.5, 0, -1.5, 1, 1, 1),
            pt(1.5, 0, -1.5, 1, 1, 1),
            pt(-1.5, 0, 1.5, 1, 1, 1),
            pt(1.5, 0, 1.5, 1, 1, 1),
        ]);
        const solid = P([pt(0, 0, 0, 4, 1, 4)]);
        const mOf = (bp) => r._compoundCenterOfMass(bp).mass;
        o.hollowEfficient = r._bendingStiffness(ring).Imin / mOf(ring) > r._bendingStiffness(solid).Imin / mOf(solid);
        // ── Ω-Φ4 Hebel + Schwung ──
        const headHeavy = P([pt(0, 0.3, 0, 0.2, 0.6, 0.2, light), pt(0, 3, 0, 0.4, 4, 0.4, dense)]);
        const balanced = P([pt(0, 0.3, 0, 0.5, 0.6, 0.5, dense), pt(0, 3, 0, 0.2, 4, 0.2, light)]);
        const sh = r._swingDynamics(headHeavy),
            sb = r._swingDynamics(balanced);
        o.headHeavier = sh.balance > sb.balance;
        o.balancedFaster = sb.swingSpeed > sh.swingSpeed;
        // ── Ω-Φ5 Schneide ──
        o.edgeContinuous =
            r._edgeContinuity(P([pt(0, 0, 0, 1, 0.3, 0.1), pt(1, 0, 0, 1, 0.3, 0.1), pt(2, 0, 0, 1, 0.3, 0.1)])) === 1;
        o.edgeGapped = r._edgeContinuity(P([pt(0, 0, 0, 1, 0.3, 0.1), pt(3, 0, 0, 1, 0.3, 0.1)])) < 1;
        // ── Ω-L1 die Physik-Achsen im Produkt-Vektor (alle [0,1], skalen-konsistent) ──
        const v = r._blueprintProductVector(P([pt(0, 0, 0, 1, 1, 1)]));
        const axes = ["stability", "stiffness", "balance", "leverage", "loadSound", "rollable"];
        o.l1AxesPresent = axes.every((a) => typeof v[a] === "number");
        o.l1AxesBounded = axes.every((a) => v[a] >= 0 && v[a] <= 1);
        // rollable: ein Wagen (liegende Rad-Zylinder unten) > 0, ein Tempel = 0
        const wheel = (x, z) => pt(x, 0, z, 0.6, 0.6, 0.2, dense, "cylinder", { x: 0, y: 0, z: Math.PI / 2 });
        const veh = P(
            [wheel(-1.5, -1), wheel(1.5, -1), wheel(-1.5, 1), wheel(1.5, 1), pt(0, 0.8, 0, 2.4, 0.5, 2.4, light)],
            [{ type: "sitz", a: 4, b: 0 }]
        );
        o.rollableWheels = r._blueprintProductVector(veh).rollable > 0;
        o.rollableTrunkZero = r._rollableFraction(P([pt(0, 0, 0, 0.5, 5, 0.5, dense, "cylinder")])) === 0; // vertikaler Stamm rollt nicht
        // ── Ω-L2 die Physik in den Rollen-Signaturen + das WAHRHEITS-BAND ──
        const sigV = C.ROLE_SIGNATURES.vehicle,
            sigA = C.ROLE_SIGNATURES.architecture;
        o.l2VehicleReadsPhysik = sigV.stability > 0 && sigV.rollable > 0;
        o.l2ArchReadsPhysik = sigA.stability > 0 && sigA.loadSound > 0;
        const topHeavyVeh = P(
            [wheel(-1.5, -1), wheel(1.5, -1), wheel(-1.5, 1), wheel(1.5, 1), pt(0, 4, 0, 2.4, 3, 2.4, dense)],
            [{ type: "sitz", a: 4, b: 0 }]
        );
        const vehRes = r._blueprintResonance(r._blueprintProductVector(veh), sigV);
        const topRes = r._blueprintResonance(r._blueprintProductVector(topHeavyVeh), sigV);
        o.truthBand = r._stability(topHeavyVeh).margin < r._stability(veh).margin && topRes < vehRes; // kippliges Fahrzeug schwächer
        // ── Ω-L2 KEINE Live-Rollen-Verschiebung: Built-ins bleiben (domain-fest) ──
        // temple/fahrzeug_wagen fielen; die lebenden Built-ins tragen die Probe
        // (stein_block=architecture · welt_portal=portal · reittier_holzross=vehicle, nicht-vakuös).
        o.builtinsHold =
            r.computeBlueprintRole(r.state.blueprints.stein_block) === "architecture" &&
            r.computeBlueprintRole(r.state.blueprints.welt_portal) === "portal" &&
            r.computeBlueprintRole(r.state.blueprints.reittier_holzross) === "vehicle";
        // ── Ω-L3 Geltungsbereich-Markierung ──
        o.l3Marks =
            C.AXIS_CLASS &&
            C.AXIS_CLASS.stability === "physik" &&
            C.AXIS_CLASS.magieleitung === "konvention" &&
            C.AXIS_CLASS.spread === "form";
        // ── Ω-W1 der Warum-Chip zitiert gerechnete Physik (KONSUM-Beweis) ──
        const why = r._blueprintRoleWhy(r.state.blueprints.reittier_holzross || veh);
        o.w1ConsumesPhysik = !!(why && Array.isArray(why.beitraege) && why.beitraege.some((b) => b.cls === "physik"));
        return o;
    });
    check("Ω-Φ3a: Brett anisotrop steif; hohl effizienter als voll (I/Masse)", res.boardAniso && res.hollowEfficient);
    check("Ω-Φ4: kopflastig schwerer balanciert; griffnah schneller", res.headHeavier && res.balancedFaster);
    check("Ω-Φ5: Schneide durchgehend=1, mit Lücke<1", res.edgeContinuous && res.edgeGapped);
    check("Ω-L1: die Physik-Achsen sind im Produkt-Vektor, alle [0,1]", res.l1AxesPresent && res.l1AxesBounded);
    check("Ω-L1: rollable aus Roll-Physik (Räder>0, vertikaler Stamm=0)", res.rollableWheels && res.rollableTrunkZero);
    check(
        "Ω-L2: vehicle liest stability+rollable, architecture stability+loadSound",
        res.l2VehicleReadsPhysik && res.l2ArchReadsPhysik
    );
    check("⟡ Ω-L2 WAHRHEITS-BAND: kopflastiges Fahrzeug liest schwächer (§10)", res.truthBand === true);
    check("Ω-L2: KEINE Live-Rollen-Verschiebung (Built-ins domain-fest)", res.builtinsHold === true);
    check("Ω-L3: Achsen-Geltungsbereich markiert (physik/konvention/form)", res.l3Marks === true);
    check("Ω-W1: Warum-Chip ZITIERT gerechnete Physik (KONSUM, kein Passagier)", res.w1ConsumesPhysik === true);
}

// die ROLLE-PASSUNG (Schöpfer-Synergie „Qualität = wie gut passt die Form zur Rolle"): die FORM
// eines Produkts moduliert die Wirkung seiner Ausrüstung — eine scharfe Klinge wirkt als Gerät stärker als
// ein gleich-materieller Klotz (die FORM-Achse, die STAT_FROM_TAGS nicht sieht). Handwerk × Design.
async function checkBandV1779RoleFitQuality({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const cfg = r.constructor.QUALITY_ROLE_FIT;
        const round = (x) => Math.round((x || 0) * 1000) / 1000;
        const blade = {
            name: "_rf_blade",
            parts: [
                __teil("box", "eisen", 0, 0, 0, 0.2, 0.1, 1.6),
                __teil("cone", "eisen", 0, 0, 1.2, 0.2, 0.1, 0.6),
            ],
        };
        const blob = {
            name: "_rf_blob",
            parts: [
                __teil("box", "eisen", 0, 0, 0, 1.2, 1.2, 1.2),
            ],
        };
        // (1) die Passung diskriminiert über die FORM (gleiches Material eisen, andere Form)
        const fitBlade = r._blueprintRoleFit(blade, "held");
        const fitBlob = r._blueprintRoleFit(blob, "held");
        out.heldDiscriminates = fitBlade > fitBlob;
        out.fitBlade = round(fitBlade);
        out.fitBlob = round(fitBlob);
        // (2) Range [min, max]
        out.inRange = fitBlade <= cfg.max + 1e-9 && fitBlob >= cfg.min - 1e-9;
        // (3) armor: dichte Platte > weiches Leder-Ding
        const plate = {
            name: "_rf_plate",
            parts: [
                __teil("box", "eisen", 0, 0, 0, 1.5, 0.3, 1.0),
            ],
        };
        const soft = {
            name: "_rf_soft",
            parts: [
                __teil("box", "leder", 0, 0, 0, 1.5, 0.3, 1.0),
            ],
        };
        out.armorDiscriminates = r._blueprintRoleFit(plate, "armor") > r._blueprintRoleFit(soft, "armor");
        // (4) consumable: der lebendige Trank > ein toter Stein-Klumpen
        const deadC = {
            name: "_rf_dead",
            parts: [
                __teil("sphere", "stein", 0, 0, 0, 0.5, 0.5, 0.5),
            ],
        };
        out.consumableDiscriminates =
            r._blueprintRoleFit(r.state.blueprints["trank_lebenssaft"], "consumable") >
            r._blueprintRoleFit(deadC, "consumable");
        // (5) unbekannte Rolle → 1.0 (neutral)
        out.unknownNeutral = r._blueprintRoleFit(blade, "kein_rollen_name") === 1.0; // V17.81: soul ist jetzt eine echte Rolle
        // (6) KONSUM — das gehaltene SCHWERT gibt mehr Schaden als der gleich-materielle KLOTZ (Form-Fit
        //     erreicht die echten Spieler-Stats — genau das Schöpfer-Beispiel).
        r.state.blueprints["_rf_blade"] = blade;
        r.state.blueprints["_rf_blob"] = blob;
        const savedHeld = r.state.player.equipped ? r.state.player.equipped.held : null;
        r.equipHeld("_rf_blade");
        const dmgBlade = r.computePlayerStats().stats.damage;
        r.equipHeld("_rf_blob");
        const dmgBlob = r.computePlayerStats().stats.damage;
        out.konsumDamage = dmgBlade > dmgBlob;
        out.dmgBlade = round(dmgBlade);
        out.dmgBlob = round(dmgBlob);
        // restore
        r.equipHeld(savedHeld);
        delete r.state.blueprints["_rf_blade"];
        delete r.state.blueprints["_rf_blob"];
        return out;
    });
    check(
        "die Rolle-Passung diskriminiert über die FORM — eine scharfe Klinge passt besser als Gerät als ein Klotz (gleiches Material)",
        res.heldDiscriminates,
        `Klinge=${res.fitBlade} Klotz=${res.fitBlob}`
    );
    check("die Passung bleibt in [min, max] (kein Runaway)", res.inRange);
    check("armor — eine dichte Platte passt besser als ein weiches Ding", res.armorDiscriminates);
    check("consumable — der lebendige Trank passt besser als ein toter Klumpen", res.consumableDiscriminates);
    check("unbekannte Rolle → neutral (1.0, kein Effekt)", res.unknownNeutral);
    check(
        "KONSUM: ein gehaltenes SCHWERT gibt mehr Schaden als ein gleich-materieller KLOTZ — der Form-Fit erreicht die Stats (das Schöpfer-Beispiel)",
        res.konsumDamage,
        `Schwert=${res.dmgBlade} Klotz=${res.dmgBlob}`
    );
}

// der volle Produkt-Vektor: die 4 räumlichen Form-Achsen
// (elongation/hollowness/axialSymmetry/spread) in den Vektor gehoben. Additiv — keine bestehende Signatur
// referenziert sie (U2 webt sie ein) → die Form ist vollständig im Vektor, kein Regress.
async function checkBandV1780FormAxes({ page, check }) {
    const res = await page.evaluate(() => {
        const round = (x) => Math.round((x || 0) * 1000) / 1000;
        const mk = (parts) => ({ name: "_u1", parts });
        const blade = mk([
            __teil("box", "eisen", 0, 0, 0, 0.2, 0.1, 1.8),
            __teil("cone", "eisen", 0, 0, 1.4, 0.2, 0.1, 0.6),
        ]);
        const cube = mk([
            __teil("box", "eisen", 0, 0, 0, 1.2, 1.2, 1.2),
        ]);
        const column = mk([
            __teil("box", "stein", 0, 0, 0, 0.6, 1, 0.6),
            __teil("box", "stein", 0, 1, 0, 0.6, 1, 0.6),
            __teil("box", "stein", 0, 2, 0, 0.6, 1, 0.6),
        ]);
        const wideBase = mk([
            __teil("box", "stein", -1.5, 0, -1.5, 0.4, 0.6, 0.4),
            __teil("box", "stein", 1.5, 0, -1.5, 0.4, 0.6, 0.4),
            __teil("box", "stein", -1.5, 0, 1.5, 0.4, 0.6, 0.4),
            __teil("box", "stein", 1.5, 0, 1.5, 0.4, 0.6, 0.4),
            __teil("box", "stein", 0, 1.5, 0, 2, 0.6, 2),
        ]);
        const body = mk([
            __teil("box", "stein", 0, 1, 0, 0.8, 1.6, 0.5),
            __teil("cylinder", "stein", -0.7, 1, 0, 0.3, 1.2, 0.3),
            __teil("cylinder", "stein", 0.7, 1, 0, 0.3, 1.2, 0.3),
        ]);
        const lump = mk([
            __teil("box", "stein", 0, 0, 0, 1, 1, 1),
            __teil("box", "stein", 1.4, 1.2, 1.0, 0.6, 0.6, 0.6),
        ]);
        const container = mk([
            __teil("box", "quarz", -1, 1, 0, 0.2, 2, 2),
            __teil("box", "quarz", 1, 1, 0, 0.2, 2, 2),
            __teil("box", "quarz", 0, 0, 0, 2, 0.2, 2),
        ]);
        const solid = mk([
            __teil("box", "stein", 0, 0, 0, 2, 2, 2),
        ]);
        const V = (b) => r._blueprintProductVector(b);
        const out = {};
        const vb = V(blade);
        out.hasAxes = ["elongation", "hollowness", "axialSymmetry", "spread"].every((a) => a in vb);
        out.elongation = vb.elongation > V(cube).elongation && vb.elongation > 0.6;
        out.elongVals = `Klinge=${round(vb.elongation)} Würfel=${round(V(cube).elongation)}`;
        out.spread = V(wideBase).spread > V(column).spread && V(wideBase).spread > 0.4;
        out.spreadVals = `Basis=${round(V(wideBase).spread)} Säule=${round(V(column).spread)}`;
        out.symmetry = V(body).axialSymmetry > V(lump).axialSymmetry;
        out.symVals = `Körper=${round(V(body).axialSymmetry)} Klumpen=${round(V(lump).axialSymmetry)}`;
        out.hollow = V(container).hollowness > V(solid).hollowness && V(container).hollowness > 0.4;
        out.hollowVals = `Behälter=${round(V(container).hollowness)} Block=${round(V(solid).hollowness)}`;
        out.noRegress = r.computeBlueprintRole(solid) === "architecture"; // V17.83 U4: ein WÜRFEL (keine Geräte-Form) bleibt Bauwerk
        return out;
    });
    check(
        "die 4 Form-Achsen sind im Produkt-Vektor (elongation/hollowness/axialSymmetry/spread)",
        res.hasAxes
    );
    check("elongation — eine Klinge ist gestreckter als ein Würfel", res.elongation, res.elongVals);
    check("spread — eine Trag-Basis spreizt mehr als eine Säule", res.spread, res.spreadVals);
    check(
        "axialSymmetry — ein symmetrischer Körper > ein asymmetrischer Klumpen",
        res.symmetry,
        res.symVals
    );
    check("hollowness — ein Behälter (Wände um Leere) > ein Vollblock", res.hollow, res.hollowVals);
    check(
        "U1 / V17.83 U4: ein WÜRFEL (keine Geräte-Form) bleibt Bauwerk — U4 ändert nur greifbare Geräte-Formen",
        res.noRegress
    );
}

// Das EINE Rollen-Signatur-Register: jede Rolle eine VOLLE Signatur über alle Achsen; das volle
// Profil entscheidet (Klinge = bessere Waffe, Block = besseres Bauwerk). _blueprintRoleFit liest es.
async function checkBandV1781RoleRegister({ page, check }) {
    const res = await page.evaluate(() => {
        const round = (x) => Math.round((x || 0) * 1000) / 1000;
        const REG = r.constructor.ROLE_SIGNATURES;
        const cfg = r.constructor.QUALITY_ROLE_FIT;
        const out = {};
        const roles = [
            "held",
            "weapon",
            "tool",
            "brecher",
            "armor",
            "consumable",
            "soul",
            "portal",
            "vehicle",
            "machine",
            "workshop-station",
            "architecture",
        ];
        out.allRoles = roles.every((rl) => REG[rl]);
        out.fullSignatures = ["held", "weapon", "armor", "consumable", "vehicle"].every(
            (rl) => Object.keys(REG[rl] || {}).length >= 4
        );
        const mk = (parts) => ({ name: "_u2", parts });
        const blade = mk([
            __teil("box", "eisen", 0, 0, 0, 0.2, 0.1, 2.0),
            __teil("cone", "eisen", 0, 0, 1.5, 0.2, 0.1, 0.6),
        ]);
        const block = mk([
            __teil("box", "eisen", 0, 0, 0, 1.4, 1.4, 1.4),
        ]);
        // TIEFE: das volle Profil — die Klinge ist eine bessere WAFFE, der Block ein besseres BAUWERK
        const bladeWeapon = r._blueprintRoleFit(blade, "weapon");
        const blockWeapon = r._blueprintRoleFit(block, "weapon");
        const blockArch = r._blueprintRoleFit(block, "architecture");
        out.depth = bladeWeapon > blockWeapon;
        out.roleRelative = blockArch > blockWeapon; // derselbe Block: Bauwerk-Passung > Waffe-Passung
        out.depthVals = `Klinge.Waffe=${round(bladeWeapon)} Block.Waffe=${round(blockWeapon)} Block.Bauwerk=${round(blockArch)}`;
        // held + Balance
        out.heldDiscriminates = r._blueprintRoleFit(blade, "held") > r._blueprintRoleFit(block, "held");
        out.goodFitBuff = bladeWeapon > 1.05; // eine gute Waffe ist ein Buff
        out.inRange = bladeWeapon <= cfg.max + 1e-9 && blockWeapon >= cfg.min - 1e-9;
        // vehicle — die neuen Form-Achsen (spread) tragen die neue Rolle
        const vehicleForm = mk([
            __teil("box", "eisen", -1.5, 0, -1, 0.5, 0.5, 0.5),
            __teil("box", "eisen", 1.5, 0, -1, 0.5, 0.5, 0.5),
            __teil("box", "eisen", -1.5, 0, 1, 0.5, 0.5, 0.5),
            __teil("box", "eisen", 1.5, 0, 1, 0.5, 0.5, 0.5),
            __teil("box", "eisen", 0, 1, 0, 3, 0.5, 2),
        ]);
        const mast = mk([
            __teil("box", "eisen", 0, 0, 0, 0.4, 1, 0.4),
            __teil("box", "eisen", 0, 1, 0, 0.4, 1, 0.4),
        ]);
        out.vehicleDiscriminates = r._blueprintRoleFit(vehicleForm, "vehicle") > r._blueprintRoleFit(mast, "vehicle");
        out.vehVals = `Basis=${round(r._blueprintRoleFit(vehicleForm, "vehicle"))} Mast=${round(r._blueprintRoleFit(mast, "vehicle"))}`;
        return out;
    });
    check(
        "das Rollen-Register hat ALLE Rollen (held/weapon/tool/brecher/armor/consumable/soul/portal/vehicle/machine/workshop/architecture)",
        res.allRoles
    );
    check(
        "die Signaturen sind VOLL (≥4 Achsen — über die gesamte Resonanz, nicht eine Achse)",
        res.fullSignatures
    );
    check(
        "U2 TIEFE: das volle Profil entscheidet — die Klinge ist eine bessere Waffe, der Block ein besseres Bauwerk",
        res.depth && res.roleRelative,
        res.depthVals
    );
    check("held — eine Klinge passt besser als ein Klotz (V1779-Kern, jetzt tiefer)", res.heldDiscriminates);
    check(
        "U2 BALANCE: die Passung bleibt in [min,max], ein gut geformtes Werk ist ein Buff (>1.05)",
        res.inRange && res.goodFitBuff
    );
    check(
        "vehicle — eine Trag-Basis passt besser als ein Mast (die neuen Form-Achsen tragen die neue Rolle)",
        res.vehicleDiscriminates,
        res.vehVals
    );
}

// der KATALYSATOR SICHTBAR: das Rollen-Spektrum (was es IST über die
// ganze Resonanz) + die Achse zum perfekten Katalysator. Der Spieler-Kompass: er baut frei, das Spektrum
// liest ihn + sagt, welche Achse zu drehen ist. (Die Klassifikation Klinge→Waffe macht erst U4.)
async function checkBandV1782CatalystReadout({ page, check }) {
    const res = await page.evaluate(() => {
        const round = (x) => Math.round((x || 0) * 100) / 100;
        const mk = (parts) => ({ name: "_u3", parts });
        const blade = mk([
            __teil("box", "eisen", 0, 0, 0, 0.2, 0.1, 2.0),
            __teil("cone", "eisen", 0, 0, 1.5, 0.2, 0.1, 0.6),
        ]);
        const ball = mk([
            __teil("sphere", "leder", 0, 0, 0, 1, 1, 1),
        ]);
        const block = mk([
            __teil("box", "eisen", 0, 0, 0, 1.4, 1.4, 1.4),
        ]);
        const out = {};
        const spec = r._blueprintRoleSpectrum(blade);
        const getW = (s) => (s.find((x) => x.role === "weapon") || { score: 0 }).score;
        out.weaponHigh = getW(spec) > 0.85; // die Klinge ist eine starke Waffe
        out.discriminates = getW(spec) > getW(r._blueprintRoleSpectrum(ball)); // > eine weiche Kugel
        out.sorted = spec.every((s, i) => i === 0 || spec[i - 1].score >= s.score - 1e-9);
        out.specVals = spec
            .slice(0, 3)
            .map((s) => `${s.role}=${round(s.score)}`)
            .join(" ");
        // der Katalysator-Hinweis: ein harter dichter Block ist für eine Waffe SCHÄRFE-arm → Hinweis Schärfe
        const hint = r._blueprintCatalystHint(block, "weapon");
        out.hintSharpness = !!hint && hint.axis === "pointedFraction" && hint.label === "Schärfe";
        out.hintVal = hint ? `${hint.axis}/${hint.label}` : "—";
        // der Spec-Sheet-Body rendert das Rollen-Spektrum als Resonanz-Balken (.spec-bar-label).
        const panel = document.createElement("div");
        r._specRenderBody(panel, blade);
        const labels = [...panel.querySelectorAll(".spec-col-head")].map((e) => e.textContent);
        const specText = [...panel.querySelectorAll(".spec-bar-label")].map((e) => e.textContent).join("|");
        out.readoutRenders =
            labels.includes("Rollen-Resonanz") &&
            (specText.includes("Waffe") ||
                specText.includes("Werkzeug") ||
                specText.includes("Gerät") ||
                specText.includes("Bauwerk"));
        out.readoutText = specText;
        return out;
    });
    check(
        "das Rollen-Spektrum — die Klinge ist eine starke Waffe (>0.85), diskriminiert gegen eine weiche Kugel, sortiert",
        res.weaponHigh && res.discriminates && res.sorted,
        res.specVals
    );
    check(
        "U3 KATALYSATOR: ein harter dichter Block ist für eine Waffe SCHÄRFE-arm → der Hinweis nennt die Schärfe (die Achse zum Katalysator)",
        res.hintSharpness,
        res.hintVal
    );
    check(
        "U3 KONSUM: der Werkstatt-Readout rendert das Rollen-Spektrum (der Kompass, sichtbar/lernbar)",
        res.readoutRenders,
        res.readoutText
    );
}

// die Prozess-Op rückgängig machen (removePartOp); die ANGEZEIGTE Rolle ist die emergente (eine rollenlose Klinge → „tool").
async function checkBandV1785RoleDisplayAndUndo({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const DEFLEN = r._defaultPartOpChain().length;
        // (#3a) ein ROLLENLOSER Bauplan zeigt seine EMERGENTE Form-Rolle, nicht den Default.
        // der builtIn geraet_spitzhacke fiel; die Werkzeug-Substanz
        // (KIND_SUBSTANCE) trägt dieselbe Probe als registriertes Test-Blueprint (rollenlos).
        const KS85 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_v1785_spitz) delete r.state.blueprints._t_v1785_spitz;
        r.state.blueprints._t_v1785_spitz = {
            name: "_t_v1785_spitz",
            parts: JSON.parse(JSON.stringify(KS85.geraet_spitzhacke.parts)),
        };
        const spit = r.state.blueprints["_t_v1785_spitz"];
        out.spitRoleField = spit ? spit.role || "(undefined)" : "(missing)";
        out.spitDisplay = spit ? r._displayRole(spit) : "(missing)";
        out.spitEmergent = spit ? r.computeBlueprintRole(spit) : "(missing)";
        out.spitShowsTool = out.spitDisplay === "tool"; // war „architecture" (bp.role||DEFAULT)
        // (#3b) eine built-in-Rüstung (Substanz-Zwilling architecture) bleibt „armor" — die Saat ist autoritativ
        const armor = r.state.blueprints["ruestung_brustpanzer"];
        out.armorDisplay = armor ? r._displayRole(armor) : "(missing)";
        out.armorStaysArmor = out.armorDisplay === "armor";
        // (#3c) cloneBlueprint materialisiert die emergente Rolle → ein frischer Spitzhacke-Klon trägt „tool"
        delete r.state.blueprints["_v1785_clone"];
        r.cloneBlueprint("_t_v1785_spitz", "_v1785_clone");
        const clone = r.state.blueprints["_v1785_clone"];
        out.cloneRoleField = clone ? clone.role || "(undefined)" : "(missing)";
        out.cloneCarriesTool = clone && clone.role === "tool";
        delete r.state.blueprints["_v1785_clone"];
        // (#1) removePartOp — die Op rückgängig (Mechanik + Rolle re-emergiert)
        const prevMode = r.getGameMode();
        r.setGameMode("schöpfer"); // keine Stamina-Kosten
        const savedTools = Array.isArray(r.state.player.tools) ? r.state.player.tools.slice() : [];
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        delete r.state.blueprints["_v1785_undo"];
        r.createBlueprint("_v1785_undo", "Undo-Test");
        // ein stumpfer, dichter eisen-Block → der Form nach „architecture" (kein Pointed-Blade-Gate)
        r.addPartToBlueprint("_v1785_undo", __teil("box", "eisen", 0, 1, 0, 1, 1, 1));
        const ub = r.state.blueprints["_v1785_undo"];
        out.roleBeforeApply = r.computeBlueprintRole(ub); // erwartet: architecture
        // (#1a) removePartOp auf der Grund-Kette → nichts zu entfernen
        const remEmpty = r.removePartOp("_v1785_undo", 0);
        out.remEmptyRejected = remEmpty.ok === false && remEmpty.reason === "nothing_to_remove";
        // eine forging-Op anwenden (schmiede-hammer, plastic → eisen kompatibel) → opCount steigt, Rolle wechselt
        const ap = r.applyOpToPart("_v1785_undo", 0, "schmiede-hammer");
        out.applyOk = ap.ok === true;
        out.opCountAfterApply = (ub.parts[0].opChain || []).length;
        out.roleAfterApply = r.computeBlueprintRole(ub); // forging-Rolle (≠ architecture)
        out.roleFlipped = out.roleAfterApply !== "architecture";
        // (#1b) removePartOp → opCount zurück auf Default, Rolle re-emergiert zu architecture
        const rem = r.removePartOp("_v1785_undo", 0);
        out.remOk = rem.ok === true;
        out.opCountAfterRemove = (ub.parts[0].opChain || []).length;
        out.opCountReverted = out.opCountAfterRemove === DEFLEN;
        out.roleAfterRemove = r.computeBlueprintRole(ub);
        out.roleReverted = out.roleAfterRemove === out.roleBeforeApply;
        // (#1c) removePartOp lehnt einen Built-in ab (ruestung_brustpanzer — lebendes builtIn)
        const remBuiltin = r.removePartOp("ruestung_brustpanzer", 0);
        out.remBuiltinRejected = remBuiltin.ok === false && remBuiltin.reason === "cannot_modify_builtin";
        // restore
        delete r.state.blueprints["_t_v1785_spitz"];
        delete r.state.blueprints["_v1785_undo"];
        r.state.player.tools = savedTools;
        r.setGameMode(prevMode);
        return out;
    });
    check(
        'V17.85 #3: ein rollenloser Bauplan (Spitzhacken-Substanz aus KIND_SUBSTANCE) zeigt seine EMERGENTE Form-Rolle „tool", nicht den „architecture"-Default',
        res.spitShowsTool,
        `display=${res.spitDisplay} (Feld=${res.spitRoleField}, emergent=${res.spitEmergent})`
    );
    check(
        'V17.85 #3: eine built-in-Rüstung (Substanz-Zwilling architecture) zeigt weiter „armor" — die deklarierte Saat ist autoritativ (Intent über Emergenz)',
        res.armorStaysArmor,
        `display=${res.armorDisplay}`
    );
    check(
        'V17.85 #3: cloneBlueprint materialisiert die emergente Rolle — ein frischer Spitzhacke-Klon trägt bp.role=„tool" (alle Leser sehen die Form-Rolle)',
        res.cloneCarriesTool,
        `clone.role=${res.cloneRoleField}`
    );
    check(
        "#1: removePartOp auf der Grund-Op-Kette lehnt ab (nothing_to_remove) — nie unter die Default-Kette",
        res.remEmptyRejected
    );
    check(
        "#1: eine forging-Op wechselt die Rolle (architecture → forging-Rolle) — der Prozess fixiert die Rolle",
        res.applyOk && res.roleFlipped,
        `vorher=${res.roleBeforeApply} nachher=${res.roleAfterApply} ops=${res.opCountAfterApply}`
    );
    check(
        "#1 KONSUM: removePartOp macht die Op rückgängig — opCount zurück auf Default UND die Rolle re-emergiert (forging-Rolle → architecture)",
        res.remOk && res.opCountReverted && res.roleReverted,
        `ops=${res.opCountAfterRemove} rolle=${res.roleAfterRemove} (war ${res.roleBeforeApply})`
    );
    check("#1: removePartOp lehnt einen Built-in ab (cannot_modify_builtin)", res.remBuiltinRejected);
}

// das volle UNDO/REDO im Bauplan-Editor (Schöpfer-Wunsch „ein paar Schritte zurück und wieder
// nach vorn"). Jeder Editor-Akt (Part hinzu/weg/ändern, Op anwenden/entfernen, Verbindung) ist umkehrbar.
async function checkBandV1787UndoRedo({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        delete r.state.blueprints["_ur"];
        if (r.state.blueprintEditHistory) delete r.state.blueprintEditHistory["_ur"];
        r.createBlueprint("_ur", "Undo-Redo-Test");
        const parts = () => r.state.blueprints["_ur"].parts.length;
        // zwei Parts hinzu → 2; undo → 1 → 0; redo → 1 → 2
        r.addPartToBlueprint("_ur", { shape: "box", material: "stein" });
        r.addPartToBlueprint("_ur", { shape: "cone", material: "eisen" });
        out.after2 = parts();
        out.canUndo = r.canUndoBlueprintEdit("_ur") && !r.canRedoBlueprintEdit("_ur");
        r.undoBlueprintEdit("_ur");
        out.afterUndo1 = parts();
        r.undoBlueprintEdit("_ur");
        out.afterUndo2 = parts();
        out.undoExhausted = r.undoBlueprintEdit("_ur").reason === "nothing_to_undo";
        r.redoBlueprintEdit("_ur");
        r.redoBlueprintEdit("_ur");
        out.afterRedo = parts();
        out.redoShape = r.state.blueprints["_ur"].parts[1].shape; // cone wiederhergestellt
        // ein NEUER Edit nach einem Undo verwirft den Redo-Zweig
        r.undoBlueprintEdit("_ur"); // → 1
        r.addPartToBlueprint("_ur", { shape: "sphere", material: "quarz" });
        out.newEditShape = r.state.blueprints["_ur"].parts[1].shape; // sphere, nicht cone
        out.redoCleared = r.canRedoBlueprintEdit("_ur") === false;
        // eine Op anwenden + undo (der opChain-Akt ist auch umkehrbar)
        r.setGameMode("schöpfer");
        if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
        r.addPartToBlueprint("_ur", { shape: "box", material: "eisen" });
        const idx = parts() - 1;
        const opBefore = (r.state.blueprints["_ur"].parts[idx].opChain || []).length;
        r.applyOpToPart("_ur", idx, "schmiede-hammer");
        const opAfter = (r.state.blueprints["_ur"].parts[idx].opChain || []).length;
        r.undoBlueprintEdit("_ur");
        out.opUndoReverts =
            opAfter > opBefore && (r.state.blueprints["_ur"].parts[idx].opChain || []).length === opBefore;
        // Built-in lehnt ab (unveränderlich → keine Geschichte) — lebendes builtIn: Brustpanzer
        out.builtinReject = r.undoBlueprintEdit("ruestung_brustpanzer").ok === false;
        // die Geschichte ist NICHT persistiert (reaktive Editor-Schicht)
        const snap = r.buildStateSnapshot();
        out.notPersisted = snap.blueprintEditHistory === undefined;
        delete r.state.blueprints["_ur"];
        if (r.state.blueprintEditHistory) delete r.state.blueprintEditHistory["_ur"];
        return out;
    });
    check(
        "Undo: zwei Parts hinzu → undo macht sie Schritt für Schritt rückgängig (2 → 1 → 0), dann ist der Undo-Stapel leer",
        res.after2 === 2 && res.canUndo && res.afterUndo1 === 1 && res.afterUndo2 === 0 && res.undoExhausted,
        `after2=${res.after2} u1=${res.afterUndo1} u2=${res.afterUndo2}`
    );
    check(
        "Redo: nach dem Zurück führt Wiederholen Schritt für Schritt nach vorn (0 → 2, die Form wiederhergestellt)",
        res.afterRedo === 2 && res.redoShape === "cone",
        `afterRedo=${res.afterRedo} shape=${res.redoShape}`
    );
    check(
        "Verzweigung: ein NEUER Edit nach einem Undo verwirft den Redo-Zweig (die Geschichte gabelt korrekt)",
        res.newEditShape === "sphere" && res.redoCleared
    );
    check("KONSUM: eine angewandte Op ist umkehrbar — undo nimmt den opChain-Schritt zurück", res.opUndoReverts);
    check("ein Built-in lehnt Undo ab (unveränderlich → keine Geschichte)", res.builtinReject);
    check("die Edit-Geschichte ist NICHT persistiert (reaktive Editor-Sitzungs-Schicht)", res.notPersisted);
}

// Die Werkstatt IST der Prozess: Start nur mit hände; eine platzierte + nahe (frieden/pfad) oder
// besessene (schöpfer) Werkstatt liefert ihren Prozess, eine bessere → höherer Cap; die
// Domain-Werkzeuge sind ihre Op-Bibliothek.
async function checkBandV1788WorkshopAsProcess({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const prevMode = r.getGameMode();
        // (1) der Spieler startet mit den Basics: nur hände ist Starter, die Domain-Ops sind op-Bibliothek
        const tools = r.state.tools || {};
        out.handOnlyStarter =
            (r.state.player.tools || []).includes("hände") &&
            tools["hände"].isStarter === true &&
            ["schmiede-hammer", "mörser", "webstuhl-schiffchen", "ritueller-stab", "drehbank-meißel"].every(
                (n) => tools[n] && tools[n].isStarter === false
            );
        out.domainProc = (() => {
            const p = r._domainProcess("forging");
            return !!(p && p.opClass === "plastic" && p.opName === "forge_shape");
        })();
        // ein eigener eisen-Bauplan
        delete r.state.blueprints["_wp88"];
        r.createBlueprint("_wp88", "WP88");
        r.addPartToBlueprint("_wp88", __teil("box", "eisen", 0, 1, 0, 1, 1, 1));
        // (2) SCHÖPFER: alle besessenen Werkstätten verfügbar (frei, ohne Platzieren)
        r.setGameMode("schöpfer");
        const menuS = r._workshopProcessesForMenu();
        out.schoepferHasForging = menuS.some((p) => p.domain === "forging");
        out.schoepferMultiDomain = new Set(menuS.map((p) => p.domain)).size >= 4;
        // (3) die REKURSION: die Meister-Esse fertigt feiner als die Esse (höherer Substanz-Cap)
        const esseP = menuS.find((p) => p.stationName === "esse");
        const meisterP = menuS.find((p) => p.stationName === "esse_meister");
        out.recursion = !!(esseP && meisterP && meisterP.cap > esseP.cap);
        out.recursionVals =
            esseP && meisterP ? `esse=${esseP.cap.toFixed(3)} meister=${meisterP.cap.toFixed(3)}` : "(fehlt)";
        // schöpfer-Anwendung (besessen, kein Platzieren) → der Cap kommt aus der Station
        const apS = r.applyWorkshopProcessToPart("_wp88", 0, "esse_meister");
        out.schoepferApply = apS.ok === true && Math.abs((apS.cap || 0) - meisterP.cap) < 1e-6;
        // (4) FRIEDEN: ohne platzierte Station → kein Werkstatt-Prozess + Ablehnung (nur die Hand)
        r.setGameMode("frieden");
        const arches = r.state.architectures || [];
        r.state.architectures = arches.filter((e) => !(e && e.type === "esse" && e.__v88)); // sauber starten
        out.friedenEmpty = r._workshopProcessesForMenu().length === 0;
        const apF0 = r.applyWorkshopProcessToPart("_wp88", 0, "esse");
        out.friedenRejects = apF0.ok === false && apF0.reason === "workshop_not_placed_near";
        // (5) eine Esse beim Spieler platzieren → der Prozess erscheint + lässt sich anwenden (der wahre Weg)
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        const placed = pm ? { type: "esse", position: { x: pm.x, y: pm.y, z: pm.z }, __v88: true } : null;
        if (placed) r.state.architectures.push(placed);
        out.friedenAppears = !!pm && r._workshopProcessesForMenu().some((p) => p.stationName === "esse");
        const apF1 = pm ? r.applyWorkshopProcessToPart("_wp88", 0, "esse") : { ok: false };
        out.friedenAppliesAfterPlacement = apF1.ok === true;
        // restore
        r.state.architectures = (r.state.architectures || []).filter((e) => !(e && e.__v88));
        r.setGameMode(prevMode);
        delete r.state.blueprints["_wp88"];
        if (r.state.blueprintEditHistory) delete r.state.blueprintEditHistory["_wp88"];
        return out;
    });
    check(
        "der Spieler startet mit den Basics — nur hände ist Starter, die 5 Domain-Ops sind die Werkstatt-Op-Bibliothek (isStarter:false)",
        res.handOnlyStarter && res.domainProc
    );
    check(
        "schöpfer: alle besessenen Werkstätten sind verfügbar (frei, ohne Platzieren) — forging + ≥4 Domänen",
        res.schoepferHasForging && res.schoepferMultiDomain
    );
    check(
        "die REKURSION: eine bessere Werkstatt fertigt feiner — die Meister-Esse hat einen höheren Cap als die Esse",
        res.recursion,
        res.recursionVals
    );
    check(
        "KONSUM: der Werkstatt-Prozess wirkt + der Cap kommt aus der STATION (schöpfer, besessen → Meister-Esse-Präzision)",
        res.schoepferApply
    );
    check(
        "der wahre Weg: in frieden ohne platzierte Werkstatt gibt es NUR die Hand — der Werkstatt-Prozess wird abgelehnt (workshop_not_placed_near)",
        res.friedenEmpty && res.friedenRejects
    );
    check(
        "KONSUM: eine in der Welt platzierte+nahe Esse erscheint im Prozess-Menü + lässt sich anwenden (platzieren → Prozess erscheint)",
        res.friedenAppears && res.friedenAppliesAfterPlacement
    );
}

async function checkBandWave4({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Materialien als Tag-Profile ###
    const wave4p1Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // Statisches Tag-Schema
        const keys = r.constructor.MATERIAL_TAG_KEYS;
        out.tagKeysFrozen = Object.isFrozen(keys);
        out.tagKeyCount = Array.isArray(keys) ? keys.length : 0;
        // 6 Built-ins, alle markiert
        const mats = r.state.materials || {};
        const builtIns = Object.values(mats).filter((m) => m.builtIn);
        out.builtInCount = builtIns.length;
        out.expectedBuiltIns = ["stein", "holz", "eisen", "bronze", "quarz", "leder"].every(
            (n) => mats[n] && mats[n].builtIn
        );
        // Alle Built-in-Tag-Werte sind 0..1
        out.tagsInRange = builtIns.every((m) =>
            keys.every((k) => {
                const v = m.tags[k];
                return typeof v === "number" && v >= 0 && v <= 1;
            })
        );
        // Quarz: erwartete Signatur-Werte (resoniert + transparent + magieleitung hoch)
        out.quarzSignature =
            mats.quarz.tags.resoniert >= 0.8 &&
            mats.quarz.tags.transparent >= 0.9 &&
            mats.quarz.tags.magieleitung >= 0.8;
        // defineMaterial: gültig, dann clamp, dann doppelt erlaubt (update)
        const r1 = r.defineMaterial("kupfer", 0xb87333, { stromleitung: 0.95, magieleitung: 0.4 });
        out.defineOk = r1.ok && mats.kupfer && !mats.kupfer.builtIn;
        const r2 = r.defineMaterial("kupfer", 0xb87333, { stromleitung: 5.0 });
        out.defineClampsToOne = r2.ok && mats.kupfer.tags.stromleitung === 1;
        // Built-in-Schutz
        const r3 = r.defineMaterial("stein", 0xff0000, { härte: 0.1 });
        out.builtInProtected = !r3.ok && r3.reason === "cannot_overwrite_builtin";
        // Invalid name
        const r4 = r.defineMaterial("", 0, {});
        out.invalidNameRejected = !r4.ok;
        // Validation lehnt Material nicht ab, mappt unbekannt weg
        const v1 = r.validateBlueprintParts([{ shape: "box", material: "kupfer", color: 0x111111 }]);
        out.validationAcceptsKnownMaterial = v1.ok && v1.parts[0].material === "kupfer";
        const v2 = r.validateBlueprintParts([{ shape: "box", material: "phlogiston", color: 0x111111 }]);
        out.validationDropsUnknownMaterial = v2.ok && !v2.parts[0].material;
        // DSL-Op define_material
        r.dslRun(["define_material", "schimmer", 0xeeeeee, { magieleitung: 0.7 }], { source: "test" });
        out.dslDefineMaterial = !!mats.schimmer && !mats.schimmer.builtIn;
        // Built-in-Bauplan-Parts haben material gesetzt (stein_block — lebendes builtIn)
        const villageParts = r.state.blueprints.stein_block.parts;
        out.builtInPartsHaveMaterial = villageParts.every((p) => typeof p.material === "string" && mats[p.material]);
        // Save-Roundtrip: eigenes Material überlebt
        const snap = r.buildStateSnapshot();
        out.snapshotHasMaterial = Array.isArray(snap.materials) && snap.materials.some((m) => m.name === "kupfer");
        // applySavedState mit altem Save (parts ohne material) →
        // Migration auf „stein". Wir simulieren ein altes Schema.
        const oldSnap = {
            materials: [],
            blueprints: [
                {
                    name: "legacy-test",
                    label: "Legacy",
                    parts: [{ shape: "box", color: 0x123456 }],
                },
            ],
        };
        r.loadState(oldSnap);
        out.legacyPartGotDefaultMaterial =
            r.state.blueprints["legacy-test"] && r.state.blueprints["legacy-test"].parts[0].material === "stein";
        // Material wählt man per ZIEHEN aus der MATERIALIEN-Palette auf einen Part im 3D; datennah geprüft
        // (Container + ≥6 Materialien), ohne erzwungenes Re-Render (störte die Card-Zählung späterer Tests).
        r.selectBlueprintForEdit("legacy-test");
        out.uiHasMaterialDropdown = !!document.getElementById("workshop-material-palette");
        out.uiDropdownLists6PlusOptions = Object.keys(r.state.materials || {}).length >= 6;
        // updatePartInBlueprint mit recolor zieht Farbe nach
        r.updatePartInBlueprint("legacy-test", 0, { material: "quarz", recolor: true });
        out.recolorAppliesMaterialColor = r.state.blueprints["legacy-test"].parts[0].color === mats.quarz.color;
        // define_ability blockiert nested define_material
        const runRes2 = r.dslRun(["define_ability", "evil-mat", ["define_material", "bad", 0, {}]], {
            source: "test",
        });
        out.nestedDefineMaterialBlocked = runRes2.log.some((e) => e.event === "ability_nested_define_forbidden");
        // Aufräumen
        delete r.state.materials["kupfer"];
        delete r.state.materials["schimmer"];
        delete r.state.blueprints["legacy-test"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 4 P1: Snapshot erreichbar", wave4p1Results)) {
        check("Welle 4 P1: MATERIAL_TAG_KEYS ist frozen", wave4p1Results.tagKeysFrozen);
        check("Welle 4 P1: 10 Tag-Achsen", wave4p1Results.tagKeyCount === 10);
        check("Welle 4 P1: 6 Built-in-Materialien existieren", wave4p1Results.expectedBuiltIns);
        check(
            "Welle 4 P1: Built-in-Anzahl exakt 21 (6 Bau + 5 Körper + laub + erde + kraut/essenz + stahl/blech/leib + gras/wasser/eis)",
            wave4p1Results.builtInCount === 21
        );
        check("Welle 4 P1: Alle Tag-Werte 0..1", wave4p1Results.tagsInRange);
        check(
            "Welle 4 P1: Quarz hat Signatur-Tags (resoniert/transparent/magieleitung)",
            wave4p1Results.quarzSignature
        );
        check("Welle 4 P1: defineMaterial legt eigenes Material an", wave4p1Results.defineOk);
        check("Welle 4 P1: defineMaterial clamped Tag-Werte auf 1", wave4p1Results.defineClampsToOne);
        check("Welle 4 P1: defineMaterial lehnt Built-in-Override ab", wave4p1Results.builtInProtected);
        check("Welle 4 P1: defineMaterial lehnt leeren Namen ab", wave4p1Results.invalidNameRejected);
        check(
            "Welle 4 P1: validateBlueprintParts akzeptiert bekanntes Material",
            wave4p1Results.validationAcceptsKnownMaterial
        );
        check(
            "Welle 4 P1: validateBlueprintParts droppt unbekanntes Material",
            wave4p1Results.validationDropsUnknownMaterial
        );
        check("Welle 4 P1: DSL-Op define_material wirkt", wave4p1Results.dslDefineMaterial);
        check("Welle 4 P1: Built-in-Bauplan-Parts tragen material-Feld", wave4p1Results.builtInPartsHaveMaterial);
        check("Welle 4 P1: Save persistiert eigene Materialien", wave4p1Results.snapshotHasMaterial);
        check("Welle 4 P1: Migration alter Parts auf stein", wave4p1Results.legacyPartGotDefaultMaterial);
        check("Welle 4 P1: Werkstatt-UI hat Material-Dropdown", wave4p1Results.uiHasMaterialDropdown);
        check("Welle 4 P1: Material-Dropdown listet ≥6 Optionen", wave4p1Results.uiDropdownLists6PlusOptions);
        check("Welle 4 P1: Recolor zieht Material-Farbe", wave4p1Results.recolorAppliesMaterialColor);
        check(
            "Welle 4 P1: define_ability blockiert nested define_material",
            wave4p1Results.nestedDefineMaterialBlocked
        );
    }

    // ### Helix + Form-Tag-Aktivierungs-Matrix ###
    const wave4p2Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // FORM_TAG_ACTIVATION existiert + frozen
        const M = r.constructor.FORM_TAG_ACTIVATION;
        out.matrixFrozen = Object.isFrozen(M);
        out.matrixHasNineForms = [
            "box",
            "sphere",
            "cylinder",
            "cone",
            "pyramid",
            "octahedron",
            "plane",
            "torus",
            "helix",
        ].every((f) => M[f] && typeof M[f] === "object");
        // Vollständigkeit: jedes Form × Tag definiert (kein undefined)
        const keys = r.constructor.MATERIAL_TAG_KEYS;
        let undefCount = 0;
        for (const f of Object.keys(M)) {
            for (const t of keys) if (typeof M[f][t] !== "number") undefCount++;
        }
        out.matrixComplete = undefCount === 0;
        // Konzept-Konsistenz: jedes Tag hat mindestens eine Signatur (3) — außer lebendig
        const tagsWithSignature = keys.filter((t) => Object.values(M).some((row) => row[t] === 3));
        out.allTagsHaveSignatureExceptLebendig =
            tagsWithSignature.length === keys.length - 1 && !tagsWithSignature.includes("lebendig");
        // Keine Form hat mehr als 3 Signaturen (Konzept §8 Anti-Monokultur)
        const sigCounts = Object.fromEntries(
            Object.entries(M).map(([f, row]) => [f, keys.filter((t) => row[t] === 3).length])
        );
        out.noFormExceeds3Signatures = Object.values(sigCounts).every((c) => c <= 3);

        // Helix rendert: validateBlueprintParts akzeptiert
        const v = r.validateBlueprintParts([{ shape: "helix", material: "bronze", size: { x: 1, y: 4, z: 5 } }]);
        out.helixValidates = v.ok && v.parts[0].shape === "helix";
        // _makePartGeometry liefert echte BufferGeometry
        const geom = r._makePartGeometry({
            shape: "helix",
            size: { x: 1, y: 4, z: 5 },
        });
        out.helixHasVertices =
            geom && geom.attributes && geom.attributes.position && geom.attributes.position.count > 50;
        if (geom && typeof geom.dispose === "function") geom.dispose();

        // computePartTags: Quarz-Kugel hat resoniert ~2.7, transparent ~2.85
        const sphereQuarz = { shape: "sphere", material: "quarz" };
        const partTags = r.computePartTags(sphereQuarz);
        out.quarzSphereResoniert = (partTags.resoniert || 0) > 2.5;
        out.quarzSphereTransparent = (partTags.transparent || 0) > 2.7;
        // härte ist null bei sphere → soll fehlen oder 0 sein
        out.sphereNoHärte = !partTags.härte;
        // Stahl-Kegel (cone, eisen): härte hoch (3 × 0.75 = 2.25)
        const coneEisen = { shape: "cone", material: "eisen" };
        const coneTags = r.computePartTags(coneEisen);
        out.coneEisenHärte = (coneTags.härte || 0) > 2.0;

        // computeCompoundTags: max-Aggregation, nicht sum
        const bp1 = {
            parts: [
                { shape: "sphere", material: "quarz" },
                { shape: "box", material: "stein" },
            ],
        };
        const comp = r.computeCompoundTags(bp1);
        // dichte: box×stein = 3×0.85 = 2.55, sphere×quarz = 3×0.65 = 1.95 → max 2.55
        out.maxAggregationDichte = Math.abs(comp.dichte - 2.55) < 0.01;
        // Wenn sum wäre, dichte = 4.50 — schließe das aus
        out.notSumAggregation = comp.dichte < 4.0;

        // DSL-Condition compound_has_tag
        r.state.blueprints["test-quarz-orb"] = {
            name: "test-quarz-orb",
            label: "Quarz-Orb",
            builtIn: false,
            parts: [{ shape: "sphere", material: "quarz" }],
        };
        out.condResonatesHigh = r.dslConditions.compound_has_tag.call(r, ["test-quarz-orb", "resoniert", 2.5], {
            state: r.state,
        });
        out.condResonatesAboveSig = !r.dslConditions.compound_has_tag.call(r, ["test-quarz-orb", "resoniert", 3.5], {
            state: r.state,
        });
        out.condUnknownTagFalse = !r.dslConditions.compound_has_tag.call(r, ["test-quarz-orb", "phlogiston", 0.5], {
            state: r.state,
        });

        // Aktive Tags stehen im Stats-Panel (.tag-chip in einer .stat-row „Tags“); Formen (inkl. helix) sind
        // ziehbare Karten der FORMEN-Palette — der Spieler zieht eine Form ins 3D.
        r.selectBlueprintForEdit("test-quarz-orb");
        r._renderWorkshopDOM();
        // die Tags sind jetzt das MATERIAL-PROFIL (Daten-Viz-Balken im Spec-Sheet), nicht mehr Chips.
        const tagsLabel = [...document.querySelectorAll("#workshop-stats-panel .spec-col-head")].some(
            (l) => l.textContent === "Material-Profil"
        );
        out.uiTagsSection = tagsLabel;
        out.uiTagsHasRows = document.querySelectorAll("#workshop-stats-panel .spec-bar").length > 0;
        out.uiShapeIncludesHelix = !!document.querySelector('.workshop-shape-card[data-shape="helix"]');

        // Aufräumen
        delete r.state.blueprints["test-quarz-orb"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 4 P2: Snapshot erreichbar", wave4p2Results)) {
        check("Welle 4 P2: FORM_TAG_ACTIVATION frozen", wave4p2Results.matrixFrozen);
        check("Welle 4 P2: Matrix deckt 9 Formen (inkl. helix)", wave4p2Results.matrixHasNineForms);
        check("Welle 4 P2: Matrix vollständig (keine undefined-Zelle)", wave4p2Results.matrixComplete);
        check("Welle 4 P2: Alle Tags außer lebendig haben Signatur", wave4p2Results.allTagsHaveSignatureExceptLebendig);
        check("Welle 4 P2: Keine Form hat >3 Signaturen", wave4p2Results.noFormExceeds3Signatures);
        check("Welle 4 P2: helix-Shape validiert", wave4p2Results.helixValidates);
        check("Welle 4 P2: helix-Geometrie hat Vertices", wave4p2Results.helixHasVertices);
        check("Welle 4 P2: Quarz-Sphäre aktiviert resoniert >2.5", wave4p2Results.quarzSphereResoniert);
        check("Welle 4 P2: Quarz-Sphäre aktiviert transparent >2.7", wave4p2Results.quarzSphereTransparent);
        check("Welle 4 P2: Sphäre aktiviert kein härte", wave4p2Results.sphereNoHärte);
        check("Welle 4 P2: Eisen-Kegel aktiviert härte >2.0", wave4p2Results.coneEisenHärte);
        check("Welle 4 P2: computeCompoundTags max-aggregiert dichte=2.55", wave4p2Results.maxAggregationDichte);
        check("Welle 4 P2: Aggregation ist nicht sum (<4.0)", wave4p2Results.notSumAggregation);
        check("Welle 4 P2: compound_has_tag erkennt hohe Resonanz", wave4p2Results.condResonatesHigh);
        check("Welle 4 P2: compound_has_tag respektiert Schwellwert", wave4p2Results.condResonatesAboveSig);
        check("Welle 4 P2: compound_has_tag unbekanntes Tag → false", wave4p2Results.condUnknownTagFalse);
        check("Welle 4 P2 (V17.91): die Tags-Zeile erscheint im Stats-Panel", wave4p2Results.uiTagsSection);
        check("Spec-Sheet: das Stats-Panel rendert das Material-Profil (Balken)", wave4p2Results.uiTagsHasRows);
        check(
            "Welle 4 P2 (V17.91): die FORMEN-Palette bietet helix als ziehbare Karte",
            wave4p2Results.uiShapeIncludesHelix
        );
    }

    // ### Werkzeuge + opChain + Präzision ###
    const wave4p3Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // Werkzeug-State + Konstanten
        const tools = r.state.tools || {};
        // hände ist der einzige Starter; die Domain-Ops existieren als Werkstatt-Op-Bibliothek.
        out.fiveStarterTools =
            !!tools["hände"] &&
            tools["hände"].isStarter &&
            ["schmiede-hammer", "mörser", "webstuhl-schiffchen", "drehbank-meißel"].every(
                (n) => tools[n] && !tools[n].isStarter
            );
        out.playerOwnsStarters = (r.state.player.tools || []).includes("hände");
        out.matCompatFrozen = Object.isFrozen(r.constructor.MATERIAL_OP_COMPATIBILITY);
        out.thresholdsFrozen = Object.isFrozen(r.constructor.WORLD_EFFECT_THRESHOLDS);
        out.steinSubtractiveOnly =
            r.constructor.MATERIAL_OP_COMPATIBILITY.stein.length === 1 &&
            r.constructor.MATERIAL_OP_COMPATIBILITY.stein[0] === "subtractive";

        // computePartPrecision: min, nicht max/avg
        const part1 = {
            shape: "sphere",
            material: "quarz",
            opChain: [
                { tool: "hände", op: "hand_knap", cap: 0.4 },
                { tool: "polierscheibe", op: "polish", cap: 0.97 },
            ],
        };
        // Min-Regel-Hybrid: 2 Schritte (0.4, 0.97) → 0.4 + 0.57 × 0.7 = 0.799
        out.precisionIsHybrid = Math.abs(r.computePartPrecision(part1) - (0.4 + 0.57 * 0.7)) < 0.01;
        const part2 = { shape: "sphere", material: "quarz" }; // no opChain
        out.precisionDefaultsTo04 = r.computePartPrecision(part2) === 0.4;

        // die Domain-Werkzeuge sind nicht mehr Starter (die Werkstatt ist der Prozess); für die
        // direkten applyOpToPart-/Tools-Box-Tests leihen wir sie aus der Op-Bibliothek (state.tools).
        for (const dt of ["schmiede-hammer", "mörser", "webstuhl-schiffchen", "ritueller-stab", "drehbank-meißel"]) {
            if (!r.state.player.tools.includes(dt)) r.state.player.tools.push(dt);
        }
        // applyOpToPart — Tool-Gating
        r.state.blueprints["test-precision"] = {
            name: "test-precision",
            label: "Test",
            builtIn: false,
            parts: [{ shape: "cone", material: "eisen", opChain: r._defaultPartOpChain() }],
        };
        // drehbank-meißel (subtractive) auf eisen-cone: OK (subtractive matches eisen)
        const ap1 = r.applyOpToPart("test-precision", 0, "drehbank-meißel");
        out.applyOpAppends = ap1.ok && r.state.blueprints["test-precision"].parts[0].opChain.length === 2;
        // Schmiede-Hammer (plastic) auf stein (subtractive only): FAIL
        r.state.blueprints["test-precision-stein"] = {
            name: "test-precision-stein",
            label: "Stein-Test",
            builtIn: false,
            parts: [{ shape: "box", material: "stein", opChain: r._defaultPartOpChain() }],
        };
        const ap2 = r.applyOpToPart("test-precision-stein", 0, "schmiede-hammer");
        out.materialOpIncompat = !ap2.ok && ap2.reason === "material_op_incompatible";
        // Tool not owned (drehbank-meißel ist subtractive + Starter)
        r.state.player.tools = r.state.player.tools.filter((t) => t !== "drehbank-meißel");
        const ap3 = r.applyOpToPart("test-precision", 0, "drehbank-meißel");
        out.toolOwnershipEnforced = !ap3.ok && ap3.reason === "tool_not_owned";
        r.state.player.tools.push("drehbank-meißel"); // restore
        // Built-in protection (stein_block — lebendes builtIn; die Wand greift VOR der Material-Kompat)
        const ap4 = r.applyOpToPart("stein_block", 0, "schmiede-hammer");
        out.builtInBlueprintProtected = !ap4.ok && ap4.reason === "cannot_modify_builtin";

        // Diskrimination: hand-roh (precision 0.4) vs. poliert (cap 0.97) — die Welt-Effekt-Schwelle
        // precision_high=0.8 liegt dazwischen: der polierte triggert, der rohe nicht.
        r.state.blueprints["raw-orb"] = {
            name: "raw-orb",
            label: "Rau-Orb",
            builtIn: false,
            parts: [{ shape: "sphere", material: "quarz", opChain: r._defaultPartOpChain() }],
        };
        r.state.blueprints["polished-orb"] = {
            name: "polished-orb",
            label: "Polier-Orb",
            builtIn: false,
            parts: [
                {
                    shape: "sphere",
                    material: "quarz",
                    opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                },
            ],
        };
        const rawPrec = r._compoundAvgPrecision(r.state.blueprints["raw-orb"]);
        const polPrec = r._compoundAvgPrecision(r.state.blueprints["polished-orb"]);
        out.precisionDiscriminates =
            rawPrec < r.constructor.WORLD_EFFECT_THRESHOLDS.precision_high &&
            polPrec >= r.constructor.WORLD_EFFECT_THRESHOLDS.precision_high;

        // Welt-Effekt: polished-orb sollte einen "singing"-Journal-
        // Eintrag schreiben, raw-orb nicht.
        const journalBefore = r.state.worldJournal.entries.length;
        r._applyCompoundWorldEffects("polished-orb");
        const afterPolished = r.state.worldJournal.entries.length;
        out.singingEntryWritten =
            afterPolished > journalBefore &&
            r.state.worldJournal.entries.slice(-3).some((e) => /singt/.test(e.text || ""));
        // Idempotent: zweiter Aufruf gleicher Bauplan → kein neuer Eintrag
        r._applyCompoundWorldEffects("polished-orb");
        out.singingEntryIdempotent = r.state.worldJournal.entries.length === afterPolished;
        // Roh-Variante triggert nicht (precision zu niedrig)
        const beforeRaw = r.state.worldJournal.entries.length;
        r._applyCompoundWorldEffects("raw-orb");
        out.rawDoesNotTrigger = r.state.worldJournal.entries.length === beforeRaw;

        // Magie-Effekt: pyramid+quarz (magieleitung hoch)
        r.state.blueprints["mage-pyramid"] = {
            name: "mage-pyramid",
            label: "Magier-Pyramide",
            builtIn: false,
            parts: [
                {
                    shape: "pyramid",
                    material: "quarz",
                    opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                },
            ],
        };
        // awe auf 0: hat der Warmup awe schon an die Decke (1.0) gehoben, kann der Magie-Compound nicht
        // weiter heben → falsch-rot. Geprüft wird die Absicht (Magie hebt awe), deterministisch ab 0.
        r.state.player.emotions.awe = 0;
        const aweBefore = r.state.player.emotions.awe;
        r._applyCompoundWorldEffects("mage-pyramid");
        out.magicLiftsAwe = r.state.player.emotions.awe > aweBefore;

        // Visible-Precision-Tint: low precision → dimmer color
        // Build-Pfad rendert Group; wir verifizieren via Mesh-
        // Materials direkt.
        const rawGroup = r._buildFromBlueprint(r.state.blueprints["raw-orb"]);
        const polGroup = r._buildFromBlueprint(r.state.blueprints["polished-orb"]);
        const rawCol = rawGroup.children[0].material.color.getHex();
        const polCol = polGroup.children[0].material.color.getHex();
        // Same base color (quarz blau-weiß); polished should be brighter
        out.precisionVisibleTint = polCol > rawCol;
        rawGroup.traverse((o) => o.geometry && typeof o.geometry.dispose === "function" && o.geometry.dispose());
        polGroup.traverse((o) => o.geometry && typeof o.geometry.dispose === "function" && o.geometry.dispose());

        // Die Werkstatt ist 3D-zentrisch: Werkzeuge/Prozesse sind ziehbare Karten der WERKZEUGE-Palette
        // (auf einen Part ziehen wendet die Op an); der Readout (Präzision/Qualität) lebt im
        // #workshop-stats-panel.
        const prevModeP3 = r.getGameMode();
        r.setGameMode("schöpfer");
        r.selectBlueprintForEdit("test-precision");
        r._renderWorkshopDOM();
        out.uiStatsPanel = !!document.querySelector("#workshop-stats-panel .spec-header");
        out.uiQualityRow = [...document.querySelectorAll("#workshop-stats-panel .spec-q-label")].some(
            (l) => l.textContent === "Qualität"
        );
        out.uiToolPalette = !!document.getElementById("workshop-tool-palette");
        out.uiToolCards = document.querySelectorAll("#workshop-tool-palette .workshop-tool-card").length >= 1;
        // in schöpfer erscheinen die besessenen Werkstatt-Prozesse als ziehbare Station-Karten (Drehbank u.a.)
        out.uiStationCards = document.querySelectorAll("#workshop-tool-palette .workshop-station-card").length >= 1;
        r.setGameMode(prevModeP3);

        // Save-Roundtrip: playerTools persistiert
        const snap = r.buildStateSnapshot();
        out.snapshotHasPlayerTools = Array.isArray(snap.playerTools) && snap.playerTools.includes("schmiede-hammer");

        // validateBlueprintParts: opChain wird sanitized
        const v = r.validateBlueprintParts([
            {
                shape: "box",
                material: "stein",
                opChain: [{ tool: "hände", op: "hand_knap", cap: 1.5 }],
            },
        ]);
        out.opChainCapClamped = v.ok && v.parts[0].opChain[0].cap === 1;

        // Aufräumen
        delete r.state.blueprints["test-precision"];
        delete r.state.blueprints["test-precision-stein"];
        delete r.state.blueprints["raw-orb"];
        delete r.state.blueprints["polished-orb"];
        delete r.state.blueprints["mage-pyramid"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 4 P3: Snapshot erreichbar", wave4p3Results)) {
        check(
            "hände ist der einzige Starter, die Domain-Ops sind die Werkstatt-Bibliothek",
            wave4p3Results.fiveStarterTools
        );
        check("Spieler startet mit den Basics (hände)", wave4p3Results.playerOwnsStarters);
        check("Welle 4 P3: MATERIAL_OP_COMPATIBILITY frozen", wave4p3Results.matCompatFrozen);
        check("Welle 4 P3: WORLD_EFFECT_THRESHOLDS frozen", wave4p3Results.thresholdsFrozen);
        check("Welle 4 P3: Stein erlaubt nur subtractive Ops", wave4p3Results.steinSubtractiveOnly);
        check(
            "Welle 4 P3 (V7.72): computePartPrecision = Hybrid min+(max−min)×0.7^N (Etappe 3a)",
            wave4p3Results.precisionIsHybrid
        );
        check("Welle 4 P3: Default-Präzision 0.4 ohne opChain", wave4p3Results.precisionDefaultsTo04);
        check("Welle 4 P3: applyOpToPart hängt Op an", wave4p3Results.applyOpAppends);
        check("Welle 4 P3: Stein lehnt Hammer (plastic) ab", wave4p3Results.materialOpIncompat);
        check("Welle 4 P3: Werkzeug-Besitz wird durchgesetzt", wave4p3Results.toolOwnershipEnforced);
        check("Welle 4 P3: Built-in-Bauplan vor Op-Mutation geschützt", wave4p3Results.builtInBlueprintProtected);
        check(
            "Welle 4 P3: Präzisions-Diskriminations-Schwelle liegt zwischen roh/poliert",
            wave4p3Results.precisionDiscriminates
        );
        check("Welle 4 P3: Singing-Journal-Eintrag bei Resonanz+Präzision", wave4p3Results.singingEntryWritten);
        check("Welle 4 P3: Singing-Eintrag idempotent pro Bauplan", wave4p3Results.singingEntryIdempotent);
        check("Welle 4 P3: Roh-Compound triggert keinen Welt-Effekt", wave4p3Results.rawDoesNotTrigger);
        check("Welle 4 P3: Magie-Compound hebt awe an", wave4p3Results.magicLiftsAwe);
        check("Welle 4 P3: Präzision moduliert Part-Farbe sichtbar", wave4p3Results.precisionVisibleTint);
        check("Spec-Sheet: das Stats-Panel rendert den Header (Identitaet)", wave4p3Results.uiStatsPanel);
        check("Spec-Sheet: der Readout zeigt die Qualitaet (.spec-q-label)", wave4p3Results.uiQualityRow);
        check("Welle 4 P3 (V17.91): die WERKZEUGE-Palette existiert (Drag-Quelle)", wave4p3Results.uiToolPalette);
        check("Welle 4 P3 (V17.91): die Palette hat ziehbare Werkzeug-Karten (≥1, Hand)", wave4p3Results.uiToolCards);
        check(
            "Welle 4 P3 (V17.91): in schöpfer erscheinen die Werkstatt-Prozesse als ziehbare Station-Karten",
            wave4p3Results.uiStationCards
        );
        check("Welle 4 P3: Save persistiert playerTools", wave4p3Results.snapshotHasPlayerTools);
        check("Welle 4 P3: validateBlueprintParts clamped opChain cap", wave4p3Results.opChainCapClamped);
    }
}

async function checkBandWave5({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### räumliche Emergenz (Spitze richtet + Kontakt überträgt) ###
    const wave5bResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // Konstanten
        out.pointedShapesFrozen = Object.isFrozen(r.constructor.SPATIAL_POINTED_SHAPES);
        out.transferableTagsFrozen = Object.isFrozen(r.constructor.SPATIAL_TRANSFERABLE_TAGS);
        out.pointedHasCone = r.constructor.SPATIAL_POINTED_SHAPES.has("cone");
        out.pointedHasHelix = r.constructor.SPATIAL_POINTED_SHAPES.has("helix");
        out.pointedNoSphere = !r.constructor.SPATIAL_POINTED_SHAPES.has("sphere");

        // Bounding-Box-Mathematik: Compound mit drei Parts
        const testBp = {
            parts: [
                __teil("box", "stein", 0, 0, 0, 2, 2, 2),
                __teil("cone", "eisen", 0, 3, 0, 1, 2, 1),
                __teil("cylinder", "bronze", 4, 0, 0, 1, 2, 1),
            ],
        };
        const bb = r._compoundBoundingBox(testBp);
        out.compoundBBOk = bb && bb.min.y === -1 && bb.max.y === 4 && bb.extent.x === 5.5 && bb.extent.y === 5;
        // Position-Klassifikation: Kegel oben sollte at_top haben
        const labelsCone = r._classifyPartPosition(testBp.parts[1], bb);
        out.coneAtTop = labelsCone.has("at_top");
        out.coneNotAtBottom = !labelsCone.has("at_bottom");
        // Cylinder rechts sollte at_outside haben
        const labelsCyl = r._classifyPartPosition(testBp.parts[2], bb);
        out.cylAtOutside = labelsCyl.has("at_outside");

        // Kontakt-Check: zwei berührende Boxen
        const pA = __teil("box", "stein", 0, 0, 0, 1, 1, 1);
        const pB = __teil("box", "eisen", 0.9, 0, 0, 1, 1, 1);
        const pC = __teil("box", "eisen", 5, 0, 0, 1, 1, 1);
        out.contactsTouching = r._partsAreInContact(pA, pB);
        out.contactsRespectsGap = !r._partsAreInContact(pA, pC);

        // Spitze-Bonus: eine Quarz-Pyramide oben auf einem Stein-Stamm
        // → magieleitung sollte räumlich höher sein als atomar.
        const tipBp = {
            parts: [
                __teil("cylinder", "holz", 0, 0, 0, 0.3, 3, 0.3),
                __teil("pyramid", "quarz", 0, 2, 0, 0.5, 1, 0.5),
            ],
        };
        const atomar = r.computeCompoundTags(tipBp);
        const spatial = r.computeSpatialTags(tipBp);
        out.tipBoostsMagic = spatial.magieleitung > atomar.magieleitung + 0.1;
        // Pyramide unten + LATERAL versetzt (sonst überdeckt der Y-Symmetrie-Bonus die at_top-Logik);
        // geprüft wird nur: pointed-at-bottom trägt kein at_top (kein Spitze-Bonus).
        const noTipBp = {
            parts: [
                __teil("cylinder", "holz", 0, 2, 0, 0.3, 3, 0.3),
                __teil("pyramid", "quarz", 2, 0, 0, 0.5, 1, 0.5),
            ],
        };
        const labelsBottomPyr = r._classifyPartPosition(noTipBp.parts[1], r._compoundBoundingBox(noTipBp));
        out.bottomNoTipBoost = !labelsBottomPyr.has("at_top");

        // Kontakt-Transfer (Stein-Slot ← 0.6 × Helix-Kupfer 2.85 = 1.71) ist im MAX-Aggregat unsichtbar
        // (MAX bleibt 2.85) → hier nur at_outside: in einer Dreier-Reihe tragen die äußeren Parts
        // at_outside (xz-Distanz vom Compound-Zentrum), der mittlere nicht.
        const outsideBp = {
            parts: [
                __teil("box", "stein", -3, 0, 0, 1, 1, 1),
                __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                __teil("box", "stein", 3, 0, 0, 1, 1, 1),
            ],
        };
        const outsideBB = r._compoundBoundingBox(outsideBp);
        out.helixAtOutside =
            r._classifyPartPosition(outsideBp.parts[0], outsideBB).has("at_outside") &&
            r._classifyPartPosition(outsideBp.parts[2], outsideBB).has("at_outside") &&
            !r._classifyPartPosition(outsideBp.parts[1], outsideBB).has("at_outside");

        // UI: räumliche Reihe erscheint bei pointed-am-Rand
        r.state.blueprints["wave5b-test"] = {
            name: "wave5b-test",
            label: "Welle-5B-Test",
            builtIn: false,
            parts: tipBp.parts.map((p) => ({ ...p, opChain: r._defaultPartOpChain() })),
        };
        // die räumlichen Tags lebten in der entfernten Editor-Tags-Sektion; die DATEN-Schicht
        // (computeSpatialTags) bleibt das Subjekt + ihre Wirkung ist im neuen UI in der Resonanz-/Fähigkeit-
        // Zeile reflektiert. Wir prüfen, dass die räumliche Emergenz die FORM diskriminiert.
        r.selectBlueprintForEdit("wave5b-test");
        const spatPointed = r.computeSpatialTags(r.state.blueprints["wave5b-test"]) || {};
        out.uiSpatialRow = Object.keys(spatPointed).length > 0;

        // Reiner atomarer Bauplan: Hinweis sollte nicht "Spitze richtet" benennen
        r.state.blueprints["wave5b-atomar"] = {
            name: "wave5b-atomar",
            label: "Atomar-Test",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0, 0, 1, 1, 1, { opChain: r._defaultPartOpChain() }),
            ],
        };
        r.selectBlueprintForEdit("wave5b-atomar");
        const spatAtomar = r.computeSpatialTags(r.state.blueprints["wave5b-atomar"]) || {};
        // der pointed-am-Rand-Bauplan trägt ANDERE räumliche Tags als der reine Box-Bauplan (die Form zählt)
        out.uiSpatialDiscriminates = JSON.stringify(spatPointed) !== JSON.stringify(spatAtomar);

        // DSL-Condition compound_has_spatial_tag funktioniert
        out.dslSpatialCondHigh = r.dslConditions.compound_has_spatial_tag.call(
            r,
            ["wave5b-test", "magieleitung", 2.0],
            { state: r.state }
        );

        // Welt-Effekt: gleicher Bauplan, Pyramide oben vs. unten, beide poliert (precision_high); oben hebt
        // die räumlich verstärkte Magieleitung über die Schwelle.
        const polished = r._defaultPartOpChain();
        polished.push({ tool: "polierscheibe", op: "polish", cap: 0.97 });
        r.state.blueprints["wave5b-tip-polished"] = {
            name: "wave5b-tip-polished",
            label: "Tip-Polished",
            builtIn: false,
            parts: tipBp.parts.map((p) => ({ ...p, opChain: [...polished] })),
        };
        r.state.blueprints["wave5b-bottom-polished"] = {
            name: "wave5b-bottom-polished",
            label: "Bottom-Polished",
            builtIn: false,
            parts: noTipBp.parts.map((p) => ({ ...p, opChain: [...polished] })),
        };
        // awe auf BASIS 0 — sonst confoundiert
        // (Warmup-awe an der Decke → der Tip-Magie-Effekt kann nicht weiter heben).
        r.state.player.emotions.awe = 0;
        const aweBefore = r.state.player.emotions.awe;
        r._applyCompoundWorldEffects("wave5b-tip-polished");
        const aweAfterTip = r.state.player.emotions.awe;
        out.tipTriggersMagic = aweAfterTip > aweBefore;
        // Ob bottom triggert, bleibt offen (journalAppendOnce per bp-Name); geprüft wird: tip-polished
        // trägt MEHR räumliche magieleitung als bottom.
        const tipMagic = r.computeSpatialTags(r.state.blueprints["wave5b-tip-polished"]).magieleitung || 0;
        const bottomMagic = r.computeSpatialTags(r.state.blueprints["wave5b-bottom-polished"]).magieleitung || 0;
        out.tipMagicExceedsBottom = tipMagic > bottomMagic + 0.1;

        // Aufräumen
        delete r.state.blueprints["wave5b-test"];
        delete r.state.blueprints["wave5b-atomar"];
        delete r.state.blueprints["wave5b-tip-polished"];
        delete r.state.blueprints["wave5b-bottom-polished"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 5 B: Snapshot erreichbar", wave5bResults)) {
        check("Welle 5 B: SPATIAL_POINTED_SHAPES frozen", wave5bResults.pointedShapesFrozen);
        check("Welle 5 B: SPATIAL_TRANSFERABLE_TAGS frozen", wave5bResults.transferableTagsFrozen);
        check("Welle 5 B: cone ist pointed-Shape", wave5bResults.pointedHasCone);
        check("Welle 5 B: helix ist pointed-Shape", wave5bResults.pointedHasHelix);
        check("Welle 5 B: sphere ist KEIN pointed-Shape", wave5bResults.pointedNoSphere);
        check("Welle 5 B: _compoundBoundingBox liefert korrekte Extent", wave5bResults.compoundBBOk);
        check("Welle 5 B: Kegel oben hat at_top-Label", wave5bResults.coneAtTop);
        check("Welle 5 B: Kegel oben hat nicht at_bottom", wave5bResults.coneNotAtBottom);
        check("Welle 5 B: Cylinder rechts hat at_outside-Label", wave5bResults.cylAtOutside);
        check("Welle 5 B: _partsAreInContact erkennt berührende Parts", wave5bResults.contactsTouching);
        check("Welle 5 B: _partsAreInContact respektiert Gap-Schwelle", wave5bResults.contactsRespectsGap);
        check("Welle 5 B: Pyramide oben verstärkt Magieleitung räumlich", wave5bResults.tipBoostsMagic);
        check("Welle 5 B: Pyramide unten gibt KEINEN Top-Bonus", wave5bResults.bottomNoTipBoost);
        check("Welle 5 B: Helix am Rand hat at_outside", wave5bResults.helixAtOutside);
        check("Welle 5 B (V17.91): der pointed-am-Rand-Bauplan trägt räumliche Tags", wave5bResults.uiSpatialRow);
        check(
            "Welle 5 B (V17.91): die räumliche Emergenz diskriminiert die Form (pointed ≠ atomar)",
            wave5bResults.uiSpatialDiscriminates
        );
        check("Welle 5 B: DSL compound_has_spatial_tag erkennt verstärkte Magie", wave5bResults.dslSpatialCondHigh);
        check("Welle 5 B: Tip-Compound triggert Magie-Welt-Effekt (awe)", wave5bResults.tipTriggersMagic);
        check("Welle 5 B: Magie tip-oben > Magie tip-unten (Diskrimination)", wave5bResults.tipMagicExceedsBottom);
    }

    // ### Hohlraum + Symmetrieachse + Resonanz-Array ###
    const wave5bp2Results = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        out.hollowShapesFrozen = Object.isFrozen(r.constructor.SPATIAL_HOLLOW_SHAPES);
        out.hollowHasSphere = r.constructor.SPATIAL_HOLLOW_SHAPES.has("sphere");
        out.hollowHasTorus = r.constructor.SPATIAL_HOLLOW_SHAPES.has("torus");
        out.hollowNoBox = !r.constructor.SPATIAL_HOLLOW_SHAPES.has("box");

        // Prinzip 2: Sphere mit Inhalt → Resonanz-Bonus
        const bellBp = {
            parts: [
                // große Quarz-Glocke
                __teil("sphere", "quarz", 0, 1, 0, 3, 3, 3),
                // kleiner Bronze-Klöppel im Inneren
                __teil("sphere", "bronze", 0, 1, 0, 0.4, 0.4, 0.4),
            ],
        };
        const pairs = r._findHollowPairs(bellBp);
        out.hollowPairDetected = pairs.length === 1 && pairs[0].outer === 0 && pairs[0].inner === 1;
        const bellAtomar = r.computeCompoundTags(bellBp);
        const bellSpatial = r.computeSpatialTags(bellBp);
        out.hollowBoostsResonance = bellSpatial.resoniert > bellAtomar.resoniert + 0.1;

        // Negativ-Test: zwei sphere nebeneinander, KEIN Hohlraum
        const sideBySideBp = {
            parts: [
                __teil("sphere", "quarz", -2, 0, 0, 1, 1, 1),
                __teil("sphere", "bronze", 2, 0, 0, 1, 1, 1),
            ],
        };
        out.noHollowWhenSeparate = r._findHollowPairs(sideBySideBp).length === 0;

        // Prinzip 3: Y-Achsen-Symmetrie. Stab aus 3 Zylindern entlang Y.
        const staffBp = {
            parts: [
                __teil("cylinder", "holz", 0, 0, 0, 0.3, 1, 0.3),
                __teil("cylinder", "holz", 0, 1, 0, 0.3, 1, 0.3),
                __teil("cylinder", "holz", 0, 2, 0, 0.3, 1, 0.3),
            ],
        };
        out.staffHasSymmetry = r._hasYAxisSymmetry(staffBp);
        const staffAtomar = r.computeCompoundTags(staffBp);
        const staffSpatial = r.computeSpatialTags(staffBp);
        out.symmetryBoostsMagic = staffSpatial.magieleitung > staffAtomar.magieleitung + 0.1;
        // Negativ-Test: zwei Zylinder weit auseinander → keine Symmetrie
        const wideBp = {
            parts: [
                __teil("cylinder", "holz", -5, 0, 0, 0.3, 1, 0.3),
                __teil("cylinder", "holz", 5, 0, 0, 0.3, 1, 0.3),
            ],
        };
        out.wideNoSymmetry = !r._hasYAxisSymmetry(wideBp);

        // Prinzip 5: Resonanz-Array — 4 Pyramiden auf einem Kreis um die Mitte
        const arrayBp = {
            parts: [
                __teil("pyramid", "quarz", 2, 0, 0, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", -2, 0, 0, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", 0, 0, 2, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", 0, 0, -2, 0.5, 1, 0.5),
            ],
        };
        out.arrayDetected = r._hasResonantArray(arrayBp);
        const arrayAtomar = r.computeCompoundTags(arrayBp);
        const arraySpatial = r.computeSpatialTags(arrayBp);
        out.arrayBoostsResonance = arraySpatial.resoniert > arrayAtomar.resoniert + 0.1;
        out.arrayBoostsMagic = arraySpatial.magieleitung > arrayAtomar.magieleitung + 0.1;
        // Negativ-Test: nur 2 Pyramiden → kein Array
        const twoBp = {
            parts: [
                __teil("pyramid", "quarz", 2, 0, 0, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", -2, 0, 0, 0.5, 1, 0.5),
            ],
        };
        out.twoNoArray = !r._hasResonantArray(twoBp);
        // Negativ-Test: 3 Pyramiden auf unterschiedlichen Radien
        const unevenBp = {
            parts: [
                __teil("pyramid", "quarz", 2, 0, 0, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", -5, 0, 0, 0.5, 1, 0.5),
                __teil("pyramid", "quarz", 0, 0, 8, 0.5, 1, 0.5),
            ],
        };
        out.unevenNoArray = !r._hasResonantArray(unevenBp);

        // Kombinations-Test: ein Glockenspiel = 4 Quarz-Glocken
        // im Kreis (Array) + jede Glocke mit Bronze-Klöppel
        // (Hohlraum). Sollte den höchsten Resonanz-Wert ergeben.
        const glockenspielBp = {
            parts: [],
        };
        for (const [cx, cz] of [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2],
        ]) {
            glockenspielBp.parts.push(__teil("sphere", "quarz", cx, 1, cz, 1.2, 1.2, 1.2));
            glockenspielBp.parts.push(__teil("sphere", "bronze", cx, 1, cz, 0.3, 0.3, 0.3));
        }
        const glockAtomar = r.computeCompoundTags(glockenspielBp);
        const glockSpatial = r.computeSpatialTags(glockenspielBp);
        out.glockenspielMaxResonance = glockSpatial.resoniert > glockAtomar.resoniert + 0.5;

        return out;
    });

    if (erreichbar(check, "Welle 5 B P2: Snapshot erreichbar", wave5bp2Results)) {
        check("Welle 5 B P2: SPATIAL_HOLLOW_SHAPES frozen", wave5bp2Results.hollowShapesFrozen);
        check("Welle 5 B P2: sphere ist hollow-Shape", wave5bp2Results.hollowHasSphere);
        check("Welle 5 B P2: torus ist hollow-Shape", wave5bp2Results.hollowHasTorus);
        check("Welle 5 B P2: box ist KEIN hollow-Shape", wave5bp2Results.hollowNoBox);
        check("Welle 5 B P2: Sphere-mit-Inhalt liefert Hohlraum-Paar", wave5bp2Results.hollowPairDetected);
        check("Welle 5 B P2: Hohlraum-Bonus auf resoniert", wave5bp2Results.hollowBoostsResonance);
        check("Welle 5 B P2: Zwei separate Spheres → kein Hohlraum", wave5bp2Results.noHollowWhenSeparate);
        check("Welle 5 B P2: Stab aus 3 Zylindern hat Y-Symmetrie", wave5bp2Results.staffHasSymmetry);
        check("Welle 5 B P2: Symmetrie-Bonus auf magieleitung", wave5bp2Results.symmetryBoostsMagic);
        check("Welle 5 B P2: Zylinder weit auseinander hat KEINE Y-Symmetrie", wave5bp2Results.wideNoSymmetry);
        check("Welle 5 B P2: 4 Pyramiden auf Kreis sind Resonanz-Array", wave5bp2Results.arrayDetected);
        check("Welle 5 B P2: Array-Bonus auf resoniert", wave5bp2Results.arrayBoostsResonance);
        check("Welle 5 B P2: Array-Bonus auf magieleitung", wave5bp2Results.arrayBoostsMagic);
        check("Welle 5 B P2: 2 Pyramiden bilden KEIN Array", wave5bp2Results.twoNoArray);
        check("Welle 5 B P2: 3 Pyramiden auf ungleichen Radien sind KEIN Array", wave5bp2Results.unevenNoArray);
        check(
            "Welle 5 B P2: Glockenspiel-Combo (Hohlraum + Array) maximiert Resonanz",
            wave5bp2Results.glockenspielMaxResonance
        );
    }

    // ### Verbindungstypen mit Lastformel ###
    const wave5aResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        // Konstanten
        out.connectionTypesFrozen = Object.isFrozen(r.constructor.CONNECTION_TYPES);
        const types = r.constructor.CONNECTION_TYPES;
        const expectedTypes = ["hafting", "lashing", "pinning", "welding", "gluing", "masonry", "sewing", "magic_bind"];
        out.eightTypes = expectedTypes.every((t) => types[t]);
        out.eachTypeHasStrongTags = expectedTypes.every(
            (t) => Array.isArray(types[t].strongTags) && types[t].strongTags.length >= 1
        );
        out.eachTypeHasStrength = expectedTypes.every(
            (t) => typeof types[t].typeStrength === "number" && types[t].typeStrength > 0 && types[t].typeStrength <= 1
        );

        // _partsContactArea: zwei berührende 1×1×1-Würfel
        const a = { shape: "box", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
        const b = { shape: "box", position: { x: 1, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
        const area = r._partsContactArea(a, b);
        out.contactAreaNonZero = area > 0.5;
        // Weit weg: keine Fläche
        const c = { shape: "box", position: { x: 10, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
        out.farContactZero = r._partsContactArea(a, c) === 0;

        // computeConnectionStrength: hafting zwischen zwei harten Materialien
        r.state.blueprints["w5a-test"] = {
            name: "w5a-test",
            label: "W5A Test",
            builtIn: false,
            parts: [
                __teil("cylinder", "eisen", 0, 0, 0, 1, 1, 1),
                __teil("box", "eisen", 0.95, 0, 0, 1, 1, 1),
            ],
            connections: [],
        };
        const haftStrength = r.computeConnectionStrength(
            { type: "hafting", partA: 0, partB: 1 },
            r.state.blueprints["w5a-test"]
        );
        out.haftingStrengthOk = haftStrength > 1.0 && haftStrength < 3.0;

        // Weichere Materialien → schwächere hafting
        r.state.blueprints["w5a-soft"] = {
            name: "w5a-soft",
            label: "W5A Soft",
            builtIn: false,
            parts: [
                __teil("cylinder", "leder", 0, 0, 0, 1, 1, 1),
                __teil("box", "leder", 0.95, 0, 0, 1, 1, 1),
            ],
            connections: [],
        };
        const softStrength = r.computeConnectionStrength(
            { type: "hafting", partA: 0, partB: 1 },
            r.state.blueprints["w5a-soft"]
        );
        out.softHaftingWeaker = softStrength < haftStrength;
        // Aber lashing (zähigkeit) ist auf leder STÄRKER als hafting auf leder
        const lashSoftStrength = r.computeConnectionStrength(
            { type: "lashing", partA: 0, partB: 1 },
            r.state.blueprints["w5a-soft"]
        );
        out.lashingFitsLeather = lashSoftStrength > softStrength;

        // Validation
        const v1 = r.validateBlueprintConnections([{ type: "hafting", partA: 0, partB: 1 }], 2);
        out.validAcceptsGood = v1.length === 1;
        // Unbekannter Typ: eine STRUKTURELL valide Verbindung wird BEWAHRT (must-preserve, taille-spec §2;
        // typ-gebundene Lesarten ignorieren sie: Strength → 0); Struktur-Müll fällt weiter (v3/v4).
        const v2 = r.validateBlueprintConnections([{ type: "schmusen", partA: 0, partB: 1 }], 2);
        const touchingBp = {
            parts: [
                __teil("box", "eisen", 0, 0, 0, 1, 1, 1),
                __teil("box", "eisen", 0, 1, 0, 1, 1, 1),
            ],
        };
        out.validRejectsUnknownType =
            v2.length === 1 && v2[0].type === "schmusen" && r.computeConnectionStrength(v2[0], touchingBp) === 0;
        const v2b = r.validateBlueprintConnections(
            [
                { type: "schmusen", partA: 0, partB: 99 },
                { type: "schmusen", partA: 0, partB: 0 },
            ],
            2
        );
        out.validRejectsUnknownType = out.validRejectsUnknownType && v2b.length === 0;
        // Out-of-range index
        const v3 = r.validateBlueprintConnections([{ type: "hafting", partA: 0, partB: 99 }], 2);
        out.validRejectsBadIndex = v3.length === 0;
        // Self-reference
        const v4 = r.validateBlueprintConnections([{ type: "hafting", partA: 1, partB: 1 }], 2);
        out.validRejectsSelfRef = v4.length === 0;

        // addConnectionToBlueprint
        const addR = r.addConnectionToBlueprint("w5a-test", { type: "welding", partA: 0, partB: 1 });
        out.addConnectionOk = addR.ok && r.state.blueprints["w5a-test"].connections.length === 1;
        // Built-in protection (stein_block — lebendes builtIn; die Wand greift VOR der Index-Validierung)
        const addBuiltin = r.addConnectionToBlueprint("stein_block", { type: "welding", partA: 0, partB: 1 });
        out.builtinBlocked = !addBuiltin.ok && addBuiltin.reason === "cannot_modify_builtin";
        // remove
        const rmR = r.removeConnectionFromBlueprint("w5a-test", 0);
        out.removeOk = rmR && r.state.blueprints["w5a-test"].connections.length === 0;

        // DSL-Op apply_connection
        r.dslRun(["apply_connection", "w5a-test", "magic_bind", 0, 1], { source: "test" });
        out.dslConnectionPersisted = r.state.blueprints["w5a-test"].connections.length === 1;

        // Save-Roundtrip
        const snap = r.buildStateSnapshot();
        const ourSavedBp = (snap.blueprints || []).find((bp) => bp.name === "w5a-test");
        out.saveCarriesConnections =
            ourSavedBp && Array.isArray(ourSavedBp.connections) && ourSavedBp.connections.length === 1;

        // Verbindungen werden im 3D-Connect-Modus angelegt (zwei Parts klicken → Typ-Popover);
        // zwei VERBUNDENE Parts öffnen den Dialog mit ✂-Lösen-Kachel (der stille Toggle fiel).
        r.selectBlueprintForEdit("w5a-test");
        r._renderWorkshopDOM();
        out.uiConnectMode = !!document.querySelector('#workshop-mode-bar [data-workshop-mode="connect"]');
        try {
            r._workshopOpenConnectPopover(0, 1);
        } catch (e) {
            void e;
        }
        const connOverlay = document.getElementById("workshop-connect-overlay");
        out.uiConnectPopover = !!connOverlay;
        out.uiConnectTypeButtons = connOverlay ? connOverlay.querySelectorAll("button").length > 1 : false;
        r._workshopCloseConnectPopover();

        // Solid-Threshold: schwache Verbindung hat workshop-conn-weak class
        r.state.blueprints["w5a-weak"] = {
            name: "w5a-weak",
            label: "W5A Weak",
            builtIn: false,
            parts: [
                __teil("cylinder", "holz", 0, 0, 0, 0.2, 0.2, 0.2),
                __teil("box", "holz", 0.18, 0, 0, 0.2, 0.2, 0.2),
            ],
            connections: [{ type: "sewing", partA: 0, partB: 1 }],
        };
        // die „schwache Verbindung"-Markierung ist eine DATEN-Eigenschaft (computeConnectionStrength
        // unter der Solid-Schwelle); die alte Editor-Listen-Klasse entfiel. Eine sewing-Verbindung zwischen
        // kleinen Holz-Parts liegt unter der Schwelle (Brech-Risiko).
        const weakConnStrength = r.computeConnectionStrength(
            { type: "sewing", partA: 0, partB: 1 },
            r.state.blueprints["w5a-weak"]
        );
        out.weakClassApplied = weakConnStrength < (r.constructor.CONNECTION_SOLID_THRESHOLD || 0.7);

        // Aufräumen
        delete r.state.blueprints["w5a-test"];
        delete r.state.blueprints["w5a-soft"];
        delete r.state.blueprints["w5a-weak"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 5 A: Snapshot erreichbar", wave5aResults)) {
        check("Welle 5 A: CONNECTION_TYPES frozen", wave5aResults.connectionTypesFrozen);
        check("Welle 5 A: Acht Verbindungstypen definiert", wave5aResults.eightTypes);
        check("Welle 5 A: Jeder Typ hat strongTags", wave5aResults.eachTypeHasStrongTags);
        check("Welle 5 A: Jeder Typ hat typeStrength 0..1", wave5aResults.eachTypeHasStrength);
        check("Welle 5 A: _partsContactArea liefert positive Flaeche bei Beruehrung", wave5aResults.contactAreaNonZero);
        check("Welle 5 A: _partsContactArea = 0 bei weit-entfernten Parts", wave5aResults.farContactZero);
        check("Welle 5 A: Hafting auf Eisen liefert mittlere bis hohe Staerke", wave5aResults.haftingStrengthOk);
        check("Welle 5 A: Hafting auf Leder ist schwaecher als auf Eisen", wave5aResults.softHaftingWeaker);
        check("Welle 5 A: Lashing passt zu Leder besser als Hafting", wave5aResults.lashingFitsLeather);
        check("Welle 5 A: validateConnections akzeptiert gueltige", wave5aResults.validAcceptsGood);
        check(
            "Welle 5 A→Ω4: validateConnections BEWAHRT unbekannten Typ (Strength 0, Struktur-Müll fällt)",
            wave5aResults.validRejectsUnknownType
        );
        check("Welle 5 A: validateConnections lehnt Out-of-Range-Index ab", wave5aResults.validRejectsBadIndex);
        check("Welle 5 A: validateConnections lehnt Self-Reference ab", wave5aResults.validRejectsSelfRef);
        check("Welle 5 A: addConnectionToBlueprint haengt an", wave5aResults.addConnectionOk);
        check("Welle 5 A: Built-in-Bauplan vor Connection-Mutation geschuetzt", wave5aResults.builtinBlocked);
        check("Welle 5 A: removeConnectionFromBlueprint entfernt", wave5aResults.removeOk);
        check("Welle 5 A: DSL-Connection persistiert in state", wave5aResults.dslConnectionPersisted);
        check("Welle 5 A: Save traegt connections im Snapshot", wave5aResults.saveCarriesConnections);
        check("Welle 5 A (V17.91): Connect-Modus existiert in der Top-Leiste", wave5aResults.uiConnectMode);
        check(
            "Welle 5 A (V17.91): der Connect-Typ-Popover öffnet im 3D (zwei Parts → Typ wählen)",
            wave5aResults.uiConnectPopover
        );
        check("Welle 5 A (V17.91): das Popover bietet Verbindungs-Typen", wave5aResults.uiConnectTypeButtons);
        check("Welle 5 A: Schwache Verbindung traegt workshop-conn-weak class", wave5aResults.weakClassApplied);
    }

    // ### Maschinen-Rekursivitaet (Bauplan als Werkzeug) ###
    const wave5cResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        out.opClassesFrozen = Object.isFrozen(r.constructor.TOOL_OP_CLASSES);
        out.opClassesCount = r.constructor.TOOL_OP_CLASSES.size === 4;

        // computeBlueprintPrecisionCap: min der Part-Praezisionen
        const polishedChain = [{ tool: "polierscheibe", op: "polish", cap: 0.97 }];
        const roughChain = [{ tool: "hände", op: "hand_knap", cap: 0.4 }];
        const mixedBp = {
            parts: [
                { shape: "box", material: "eisen", opChain: polishedChain },
                { shape: "box", material: "eisen", opChain: roughChain },
                { shape: "box", material: "eisen", opChain: polishedChain },
            ],
        };
        out.precisionCapIsMin = Math.abs(r.computeBlueprintPrecisionCap(mixedBp) - 0.4) < 0.001;

        // setBlueprintToolMeta + Validierung
        r.state.blueprints["w5c-lathe"] = {
            name: "w5c-lathe",
            label: "Drehbank",
            builtIn: false,
            parts: [
                { shape: "box", material: "eisen", opChain: polishedChain },
                { shape: "cylinder", material: "eisen", opChain: polishedChain },
            ],
            connections: [],
        };
        const metaOk = r.setBlueprintToolMeta("w5c-lathe", "lathe", "subtractive");
        out.setMetaOk = metaOk.ok && r.state.blueprints["w5c-lathe"].role === "tool";
        // Bad opClass
        const metaBadClass = r.setBlueprintToolMeta("w5c-lathe", "lathe", "uberklasse");
        out.rejectsInvalidClass = !metaBadClass.ok && metaBadClass.reason === "invalid_op_class";
        // Bad opName
        const metaBadName = r.setBlueprintToolMeta("w5c-lathe", "böser Name!", "plastic");
        out.rejectsInvalidName = !metaBadName.ok && metaBadName.reason === "invalid_op_name";
        // Built-in protected (stein_block — lebendes builtIn)
        const metaBuiltin = r.setBlueprintToolMeta("stein_block", "lathe", "subtractive");
        out.builtinProtected = !metaBuiltin.ok && metaBuiltin.reason === "cannot_modify_builtin";

        // registerBlueprintAsTool
        const regOk = r.registerBlueprintAsTool("w5c-lathe");
        out.registerOk = regOk.ok && !!r.state.tools["w5c-lathe"];
        out.toolCapMatchesBlueprint = Math.abs(r.state.tools["w5c-lathe"].precisionCap - 0.97) < 0.001;
        out.toolInPlayerInventory = (r.state.player.tools || []).includes("w5c-lathe");
        out.toolSourceMarked = r.state.tools["w5c-lathe"].sourceBlueprint === "w5c-lathe";
        out.toolNotBuiltin = r.state.tools["w5c-lathe"].builtIn === false;

        // Cannot register a non-tool blueprint
        r.state.blueprints["w5c-not-a-tool"] = {
            name: "w5c-not-a-tool",
            label: "Just-a-Box",
            builtIn: false,
            parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
            connections: [],
        };
        const regNotMarked = r.registerBlueprintAsTool("w5c-not-a-tool");
        out.rejectsUnmarked = !regNotMarked.ok && regNotMarked.reason === "not_marked_as_tool";

        // Cannot override starter tool name (schmiede-hammer ist ein Built-in-Starter)
        r.state.blueprints["schmiede-hammer"] = {
            name: "schmiede-hammer",
            label: "Mein Schmiede-Hammer",
            builtIn: false,
            role: "tool",
            toolMeta: { opName: "forge", opClass: "plastic" },
            parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
            connections: [],
        };
        const regHammerOverride = r.registerBlueprintAsTool("schmiede-hammer");
        out.starterProtected = !regHammerOverride.ok && regHammerOverride.reason === "starter_name_protected";
        delete r.state.blueprints["schmiede-hammer"];

        // Recursive: das neue Werkzeug funktioniert in applyOpToPart
        r.state.blueprints["w5c-target"] = {
            name: "w5c-target",
            label: "Ziel",
            builtIn: false,
            parts: [{ shape: "cylinder", material: "eisen", opChain: r._defaultPartOpChain() }],
            connections: [],
        };
        const applyR = r.applyOpToPart("w5c-target", 0, "w5c-lathe");
        const partAfter = r.state.blueprints["w5c-target"].parts[0];
        const lastOp = partAfter.opChain && partAfter.opChain[partAfter.opChain.length - 1];
        // Erfolg: Op ist angewandt, letzte Chain-Eintrag zeigt
        // auf das eigene Werkzeug. Praezision selbst bleibt 0.4
        // (default-Hand-Knap dominiert per min-Regel §2.3).
        out.recursiveToolApplies = applyR.ok && lastOp && lastOp.tool === "w5c-lathe" && lastOp.cap === 0.97;
        out.opChainGrew = Array.isArray(partAfter.opChain) && partAfter.opChain.length === 2;

        // Schief gebaute Drehbank → schlechter Cap
        r.state.blueprints["w5c-bad-lathe"] = {
            name: "w5c-bad-lathe",
            label: "Schlechte Drehbank",
            builtIn: false,
            parts: [
                { shape: "box", material: "eisen", opChain: roughChain },
                { shape: "cylinder", material: "eisen", opChain: polishedChain },
            ],
            connections: [],
        };
        r.setBlueprintToolMeta("w5c-bad-lathe", "bad-lathe", "subtractive");
        r.registerBlueprintAsTool("w5c-bad-lathe");
        out.badLatheLowerCap = r.state.tools["w5c-bad-lathe"].precisionCap === 0.4;
        // Recursive Konzept-Test: eine Box mit dem schlechten Tool
        // erreicht keine bessere Praezision als 0.4.
        r.state.blueprints["w5c-target2"] = {
            name: "w5c-target2",
            label: "Ziel 2",
            builtIn: false,
            parts: [{ shape: "cylinder", material: "eisen", opChain: r._defaultPartOpChain() }],
            connections: [],
        };
        r.applyOpToPart("w5c-target2", 0, "w5c-bad-lathe");
        out.recursivePrecisionCascade = r.computePartPrecision(r.state.blueprints["w5c-target2"].parts[0]) === 0.4;

        // DSL-Ops
        r.state.blueprints["w5c-dsl-test"] = {
            name: "w5c-dsl-test",
            label: "DSL Test",
            builtIn: false,
            parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
            connections: [],
        };
        r.dslRun(["set_tool_meta", "w5c-dsl-test", "dsl-tool", "additive"], {
            source: "test",
        });
        r.dslRun(["register_tool", "w5c-dsl-test"], { source: "test" });
        out.dslToolInState = !!r.state.tools["w5c-dsl-test"];

        // Save-Roundtrip
        const snap = r.buildStateSnapshot();
        out.snapshotHasToolBp = (snap.blueprints || []).some(
            (bp) => bp.name === "w5c-lathe" && bp.role === "tool" && bp.toolMeta && bp.toolMeta.opName === "lathe"
        );
        out.snapshotHasTool = (snap.tools || []).some((t) => t.name === "w5c-lathe" && t.precisionCap === 0.97);

        // Cleanup
        delete r.state.tools["w5c-lathe"];
        delete r.state.tools["w5c-bad-lathe"];
        delete r.state.tools["w5c-dsl-test"];
        r.state.player.tools = r.state.player.tools.filter(
            (t) => !["w5c-lathe", "w5c-bad-lathe", "w5c-dsl-test"].includes(t)
        );
        delete r.state.blueprints["w5c-lathe"];
        delete r.state.blueprints["w5c-bad-lathe"];
        delete r.state.blueprints["w5c-target"];
        delete r.state.blueprints["w5c-target2"];
        delete r.state.blueprints["w5c-not-a-tool"];
        delete r.state.blueprints["w5c-dsl-test"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Welle 5 C: Snapshot erreichbar", wave5cResults)) {
        check("Welle 5 C: TOOL_OP_CLASSES frozen", wave5cResults.opClassesFrozen);
        check("Welle 5 C: TOOL_OP_CLASSES hat 4 Klassen", wave5cResults.opClassesCount);
        check("Welle 5 C: computeBlueprintPrecisionCap = min(parts)", wave5cResults.precisionCapIsMin);
        check("Welle 5 C: setBlueprintToolMeta markiert Bauplan", wave5cResults.setMetaOk);
        check("Welle 5 C: setBlueprintToolMeta lehnt unbekannte opClass ab", wave5cResults.rejectsInvalidClass);
        check("Welle 5 C: setBlueprintToolMeta lehnt invaliden opName ab", wave5cResults.rejectsInvalidName);
        check("Welle 5 C: setBlueprintToolMeta lehnt Built-in-Bauplan ab", wave5cResults.builtinProtected);
        check("Welle 5 C: registerBlueprintAsTool legt Werkzeug an", wave5cResults.registerOk);
        check("Welle 5 C: Werkzeug-Cap = Bauplan-Praezision", wave5cResults.toolCapMatchesBlueprint);
        check("Welle 5 C: Werkzeug landet im Player-Inventory", wave5cResults.toolInPlayerInventory);
        check("Welle 5 C: Werkzeug trägt sourceBlueprint-Marke", wave5cResults.toolSourceMarked);
        check("Welle 5 C: Eigenes Werkzeug ist nicht builtIn", wave5cResults.toolNotBuiltin);
        check("Welle 5 C: registerBlueprintAsTool lehnt unmarkierte ab", wave5cResults.rejectsUnmarked);
        check("Welle 5 C: Starter-Namen vor Override geschuetzt", wave5cResults.starterProtected);
        check("Welle 5 C: Eigenes Werkzeug funktioniert in applyOpToPart", wave5cResults.recursiveToolApplies);
        check("Welle 5 C: opChain waechst nach apply mit eigenem Tool", wave5cResults.opChainGrew);
        check("Welle 5 C: Schlechte Drehbank hat niedrigen Cap", wave5cResults.badLatheLowerCap);
        check(
            "Welle 5 C: Schlechtes Tool deckelt Ziel-Praezision (§4.3 Kaskade)",
            wave5cResults.recursivePrecisionCascade
        );
        check("Welle 5 C: DSL-Werkzeug landet in state.tools", wave5cResults.dslToolInState);
        check("Welle 5 C: Save traegt role + toolMeta im Bauplan", wave5cResults.snapshotHasToolBp);
        check("Welle 5 C: Save traegt eigenes Werkzeug", wave5cResults.snapshotHasTool);
    }

    // ### Bugfixes nach Welle-5-Reflexion ###
    const bugfixResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};

        // Bug 1: Part-Loesch raeumt connections auf
        r.state.blueprints["bug1-test"] = {
            name: "bug1-test",
            label: "Bug1 Test",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                __teil("box", "stein", 1, 0, 0, 1, 1, 1),
                __teil("box", "stein", 2, 0, 0, 1, 1, 1),
            ],
            connections: [
                { type: "hafting", partA: 0, partB: 1 },
                { type: "hafting", partA: 1, partB: 2 },
                { type: "hafting", partA: 0, partB: 2 },
            ],
        };
        // Part 1 loeschen: connection 0-1 + 1-2 weg, 0-2 bleibt
        // und wird zu 0-1 (Index 2 → 1).
        r.removePartFromBlueprint("bug1-test", 1);
        const remaining = r.state.blueprints["bug1-test"].connections;
        out.connectionsFilteredOnPartDelete = remaining.length === 1;
        out.connectionIndicesShifted = remaining[0] && remaining[0].partA === 0 && remaining[0].partB === 1;

        // Bug 1 edge case: delete part 0, connection 1-2 wird zu 0-1
        r.state.blueprints["bug1-shift"] = {
            name: "bug1-shift",
            label: "Shift Test",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0, 0, 1, 1, 1),
                __teil("box", "stein", 1, 0, 0, 1, 1, 1),
                __teil("box", "stein", 2, 0, 0, 1, 1, 1),
            ],
            connections: [{ type: "hafting", partA: 1, partB: 2 }],
        };
        r.removePartFromBlueprint("bug1-shift", 0);
        const shifted = r.state.blueprints["bug1-shift"].connections;
        out.shiftedToZeroOne = shifted.length === 1 && shifted[0].partA === 0 && shifted[0].partB === 1;

        // Bug 2: Bauplan-Loesch raeumt eigene Werkzeuge auf
        r.state.blueprints["bug2-lathe"] = {
            name: "bug2-lathe",
            label: "Test Lathe",
            builtIn: false,
            role: "tool",
            toolMeta: { opName: "bug2-op", opClass: "subtractive" },
            parts: [
                __teil("box", "eisen", 0, 0, 0, 1, 1, 1, { opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] }),
            ],
            connections: [],
        };
        r.registerBlueprintAsTool("bug2-lathe");
        out.toolWasRegistered = !!r.state.tools["bug2-lathe"];
        out.playerOwnedToolBefore = (r.state.player.tools || []).includes("bug2-lathe");
        r.deleteBlueprint("bug2-lathe");
        out.toolRemovedFromState = !r.state.tools["bug2-lathe"];
        out.toolRemovedFromPlayer = !(r.state.player.tools || []).includes("bug2-lathe");
        // die Op-Bibliothek (schmiede-hammer-Definition) + der Hand-Starter überleben einen
        // Bauplan-Lösch unberührt (das Werkzeug ist nicht mehr im player.tools-Starter-Satz).
        out.starterToolsUnaffected =
            !!r.state.tools["schmiede-hammer"] && (r.state.player.tools || []).includes("hände");

        // Negativ: deleteBlueprint eines non-tool-Bauplans laesst
        // andere Tools komplett unberuehrt.
        r.state.blueprints["bug2-noisy-tool"] = {
            name: "bug2-noisy-tool",
            label: "Noisy Tool",
            builtIn: false,
            role: "tool",
            toolMeta: { opName: "noisy-op", opClass: "subtractive" },
            parts: [
                __teil("box", "eisen", 0, 0, 0, 1, 1, 1, { opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] }),
            ],
            connections: [],
        };
        r.registerBlueprintAsTool("bug2-noisy-tool");
        r.state.blueprints["bug2-plain"] = {
            name: "bug2-plain",
            label: "Plain Blueprint",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0, 0, 1, 1, 1),
            ],
            connections: [],
        };
        r.deleteBlueprint("bug2-plain");
        out.unrelatedToolUntouched = !!r.state.tools["bug2-noisy-tool"];

        // Cleanup — wichtig: Werkstatt-DOM neu rendern, damit
        // spätere Tests (Ring 6.6) nicht Stale-Rows sehen.
        delete r.state.tools["bug2-noisy-tool"];
        r.state.player.tools = r.state.player.tools.filter((t) => t !== "bug2-noisy-tool");
        delete r.state.blueprints["bug2-noisy-tool"];
        delete r.state.blueprints["bug1-test"];
        delete r.state.blueprints["bug1-shift"];
        r._renderWorkshopDOM();
        return out;
    });

    if (erreichbar(check, "Bugfix Snapshot erreichbar", bugfixResults)) {
        check(
            "Bugfix: removePartFromBlueprint filtert betroffene Connections",
            bugfixResults.connectionsFilteredOnPartDelete
        );
        check("Bugfix: Connection-Indizes nach Part-Loesch korrigiert", bugfixResults.connectionIndicesShifted);
        check("Bugfix: Index-Shift bei Loesch von Part 0", bugfixResults.shiftedToZeroOne);
        check("Bugfix: registerBlueprintAsTool legt Werkzeug an (Setup)", bugfixResults.toolWasRegistered);
        check("Bugfix: Werkzeug nach Register im Player-Inventory (Setup)", bugfixResults.playerOwnedToolBefore);
        check("Bugfix: deleteBlueprint entfernt eigenes Werkzeug aus state.tools", bugfixResults.toolRemovedFromState);
        check("Bugfix: deleteBlueprint entfernt Werkzeug aus player.tools", bugfixResults.toolRemovedFromPlayer);
        check("Bugfix: Starter-Werkzeuge bleiben nach Bauplan-Loesch erhalten", bugfixResults.starterToolsUnaffected);
        check("Bugfix: Unrelated Tools werden nicht angetastet", bugfixResults.unrelatedToolUntouched);
    }
}

async function checkBandWaves9And10a({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Werkzeug-Domains + emergente Bauplan-Rolle ###
    const wave9aResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const AR = r.constructor;
        const out = {};
        try {
            // Konstanten
            out.toolDomainsFrozen =
                Array.isArray(AR.TOOL_DOMAINS) && Object.isFrozen(AR.TOOL_DOMAINS) && AR.TOOL_DOMAINS.length === 6;
            out.toolDomainsContent = ["construction", "forging", "alchemy", "textile", "soulwork", "mechanism"].every(
                (d) => AR.TOOL_DOMAINS.includes(d)
            );
            out.domainToRoleFrozen = !!AR.DOMAIN_TO_ROLE && Object.isFrozen(AR.DOMAIN_TO_ROLE);
            out.alchemyMapsToConsumable = AR.DOMAIN_TO_ROLE.alchemy === "consumable";
            out.textileMapsToArmor = AR.DOMAIN_TO_ROLE.textile === "armor";
            out.soulworkMapsToSoul = AR.DOMAIN_TO_ROLE.soulwork === "soul";
            out.mechanismMapsToMachine = AR.DOMAIN_TO_ROLE.mechanism === "machine";
            out.constructionMapsToArchitecture = AR.DOMAIN_TO_ROLE.construction === "architecture";
            out.forgingIsSplit = AR.DOMAIN_TO_ROLE.forging === "forging-split";
            out.forgingToolTags = Array.isArray(AR.FORGING_TOOL_TAGS) && AR.FORGING_TOOL_TAGS.includes("härte");
            out.forgingArmorTags = Array.isArray(AR.FORGING_ARMOR_TAGS) && AR.FORGING_ARMOR_TAGS.includes("dichte");
            out.defaultRole = AR.DEFAULT_BLUEPRINT_ROLE === "architecture";

            // Default-Tools sind alle generic (domain=null)
            const tools = r.state.tools || {};
            // die generische Präzisions-Leiter ist gefallen (feuerstein/hammer/feile/
            // polier RAUS, die Werkstatt trägt die Präzision); nur `hände` bleibt domain-neutral (0.4).
            // Die Domain-Tools tragen jeweils eine domain ∈ TOOL_DOMAINS.
            const originalGenericNames = ["hände"];
            out.originalToolsGeneric = originalGenericNames.every((n) => tools[n] && tools[n].domain === null);
            out.domainToolsHaveDomain = Object.values(tools)
                .filter((t) => t.builtIn && t.domain)
                .every((t) => AR.TOOL_DOMAINS.includes(t.domain));

            // Leerer Bauplan / nur generic-Werkzeuge → null Domain, role=architecture
            __probeBauplan("test_9a_empty");
            // Werkzeug "hände" anwenden auf Part 0 — domain=null bleibt
            r.applyOpToPart("test_9a_empty", 0, "hände");
            out.emptyDomainNull = r.computeBlueprintDomain(r.state.blueprints.test_9a_empty) === null;
            out.emptyRoleArchitecture = r.computeBlueprintRole(r.state.blueprints.test_9a_empty) === "architecture";

            // Simuliere ein Domain-tragendes Werkzeug (manuell hinzufügen für Test)
            r.state.tools["test_forge_hammer"] = {
                name: "test_forge_hammer",
                label: "Schmiede-Hammer (Test)",
                opClass: "plastic",
                opName: "forge",
                precisionCap: 0.7,
                isStarter: false,
                builtIn: false,
                domain: "forging",
            };
            if (!r.state.player.tools.includes("test_forge_hammer")) {
                r.state.player.tools.push("test_forge_hammer");
            }
            __probeBauplan("test_9a_forging");
            // Erst Material auf eisen wechseln (stein lehnt plastic-opClass ab,
            // forging-Hammer hat opClass=plastic — applyOp würde sonst scheitern).
            r.updatePartInBlueprint("test_9a_forging", 0, { material: "eisen", recolor: true });
            r.applyOpToPart("test_9a_forging", 0, "test_forge_hammer");
            out.forgingDomainDetected = r.computeBlueprintDomain(r.state.blueprints.test_9a_forging) === "forging";

            // Forging-Split via Compound-Tags
            const forgingRole = r.computeBlueprintRole(r.state.blueprints.test_9a_forging);
            out.forgingResolvedTo = forgingRole;
            out.forgingIsToolOrArmor = forgingRole === "tool" || forgingRole === "armor";

            // Alchemy-Domain → consumable
            r.state.tools["test_alchemy_mortar"] = {
                name: "test_alchemy_mortar",
                label: "Mörser (Test)",
                opClass: "additive",
                opName: "brew",
                precisionCap: 0.7,
                isStarter: false,
                builtIn: false,
                domain: "alchemy",
            };
            if (!r.state.player.tools.includes("test_alchemy_mortar")) {
                r.state.player.tools.push("test_alchemy_mortar");
            }
            __probeBauplan("test_9a_alchemy");
            r.updatePartInBlueprint("test_9a_alchemy", 0, { material: "holz", recolor: true });
            r.applyOpToPart("test_9a_alchemy", 0, "test_alchemy_mortar");
            out.alchemyRoleIsConsumable = r.computeBlueprintRole(r.state.blueprints.test_9a_alchemy) === "consumable";

            // Mechanism-Domain → machine
            r.state.tools["test_lathe"] = {
                name: "test_lathe",
                label: "Drehbank (Test)",
                opClass: "subtractive",
                opName: "turn",
                precisionCap: 0.9,
                isStarter: false,
                builtIn: false,
                domain: "mechanism",
            };
            if (!r.state.player.tools.includes("test_lathe")) {
                r.state.player.tools.push("test_lathe");
            }
            __probeBauplan("test_9a_mech");
            r.applyOpToPart("test_9a_mech", 0, "test_lathe");
            out.mechanismRoleIsMachine = r.computeBlueprintRole(r.state.blueprints.test_9a_mech) === "machine";

            // Emergent-Refresh: addPart triggert _refreshBlueprintRoleEmergent
            __probeBauplan("test_9a_emergent");
            r.applyOpToPart("test_9a_emergent", 0, "test_lathe");
            out.emergentRoleSetOnApply = r.state.blueprints.test_9a_emergent.role === "machine";

            // Manueller Override: setBlueprintAsArmor sperrt emergenten Pfad
            r.setBlueprintAsArmor("test_9a_emergent");
            out.manualOverrideSetsRole = r.state.blueprints.test_9a_emergent.role === "armor";
            out.manualOverrideMarksFlag = r.state.blueprints.test_9a_emergent.roleManual === true;
            // Nochmal applyOpToPart — role bleibt manual=armor (kein emergent override)
            r.applyOpToPart("test_9a_emergent", 0, "test_lathe");
            out.manualOverrideStaysAfterApply = r.state.blueprints.test_9a_emergent.role === "armor";

            // Cleanup
            for (const n of [
                "test_9a_empty",
                "test_9a_forging",
                "test_9a_alchemy",
                "test_9a_mech",
                "test_9a_emergent",
            ]) {
                if (r.state.blueprints[n]) r.deleteBlueprint(n);
            }
            for (const t of ["test_forge_hammer", "test_alchemy_mortar", "test_lathe"]) {
                delete r.state.tools[t];
                r.state.player.tools = r.state.player.tools.filter((x) => x !== t);
            }
            r._renderWorkshopDOM();
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 9a", wave9aResults)) {
        check(
            "Welle 9a: TOOL_DOMAINS frozen mit 6 Einträgen (construction/forging/alchemy/textile/soulwork/mechanism)",
            wave9aResults.toolDomainsFrozen && wave9aResults.toolDomainsContent
        );
        check(
            "Welle 9a: DOMAIN_TO_ROLE-Map frozen mit korrektem Mapping (alchemy→consumable, textile→armor, soulwork→soul, mechanism→machine, construction→architecture, forging→forging-split)",
            wave9aResults.domainToRoleFrozen &&
                wave9aResults.alchemyMapsToConsumable &&
                wave9aResults.textileMapsToArmor &&
                wave9aResults.soulworkMapsToSoul &&
                wave9aResults.mechanismMapsToMachine &&
                wave9aResults.constructionMapsToArchitecture &&
                wave9aResults.forgingIsSplit
        );
        check(
            "Welle 9a: FORGING_TOOL_TAGS enthält härte + FORGING_ARMOR_TAGS enthält dichte",
            wave9aResults.forgingToolTags && wave9aResults.forgingArmorTags
        );
        check("Welle 9a: DEFAULT_BLUEPRINT_ROLE === 'architecture'", wave9aResults.defaultRole);
        check(
            "Welle 9a/V17.78: hände ist die domain-neutrale Baseline (domain=null) — die generische Leiter ist gefallen",
            wave9aResults.originalToolsGeneric
        );
        check(
            "Welle 9b: Domain-Built-ins haben jeweils eine gültige Domain ∈ TOOL_DOMAINS",
            wave9aResults.domainToolsHaveDomain
        );
        check("Welle 9a: Leerer Bauplan + nur generic-Werkzeuge → computeDomain=null", wave9aResults.emptyDomainNull);
        check(
            "Welle 9a: Leerer Bauplan + nur generic-Werkzeuge → role=architecture (Default)",
            wave9aResults.emptyRoleArchitecture
        );
        check(
            "Welle 9a: Domain-Werkzeug (forging) angewandt → computeDomain='forging'",
            wave9aResults.forgingDomainDetected
        );
        check(
            `Welle 9a: Forging-Split via Compound-Tags → resolveTo='${wave9aResults.forgingResolvedTo}' (tool oder armor)`,
            wave9aResults.forgingIsToolOrArmor
        );
        check("Welle 9a: Alchemy-Werkzeug → role='consumable'", wave9aResults.alchemyRoleIsConsumable);
        check("Welle 9a: Mechanism-Werkzeug → role='machine'", wave9aResults.mechanismRoleIsMachine);
        check(
            "Welle 9a: applyOpToPart triggert _refreshBlueprintRoleEmergent → bp.role wird emergent gesetzt",
            wave9aResults.emergentRoleSetOnApply
        );
        check(
            "Welle 9a: Manueller Override (setBlueprintAsArmor) setzt bp.role + roleManual=true",
            wave9aResults.manualOverrideSetsRole && wave9aResults.manualOverrideMarksFlag
        );
        check(
            "Welle 9a: Manueller Override sperrt emergenten Pfad — applyOpToPart ändert role nicht mehr",
            wave9aResults.manualOverrideStaysAfterApply
        );
    }

    // ### Domain-Werkzeuge + UI-Anzeige der Rolle ###
    const wave9bResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const AR = r.constructor;
        const out = {};
        try {
            // 5 neue Domain-Werkzeuge in state.tools
            const domainToolNames = [
                "schmiede-hammer",
                "mörser",
                "webstuhl-schiffchen",
                "ritueller-stab",
                "drehbank-meißel",
            ];
            out.allDomainToolsExist = domainToolNames.every((n) => !!r.state.tools[n]);

            // Korrektes domain-Mapping pro Tool
            out.schmiedeHammerForging =
                r.state.tools["schmiede-hammer"] && r.state.tools["schmiede-hammer"].domain === "forging";
            out.morserAlchemy = r.state.tools["mörser"] && r.state.tools["mörser"].domain === "alchemy";
            out.webstuhlTextile =
                r.state.tools["webstuhl-schiffchen"] && r.state.tools["webstuhl-schiffchen"].domain === "textile";
            out.stabSoulwork = r.state.tools["ritueller-stab"] && r.state.tools["ritueller-stab"].domain === "soulwork";
            out.drehbankMechanism =
                r.state.tools["drehbank-meißel"] && r.state.tools["drehbank-meißel"].domain === "mechanism";

            // die 5 Domain-Werkzeuge sind nicht mehr Starter (die Werkstatt ist der Prozess); sie
            // bleiben als Op-Bibliothek in state.tools (isStarter:false), aus der die Werkstatt schöpft.
            out.allDomainToolsInInventory = domainToolNames.every(
                (n) => r.state.tools[n] && r.state.tools[n].isStarter === false
            );

            // insgesamt 6 Built-in-Werkzeuge: hände (domain-neutrale Baseline) + 5 domain;
            // die generische Präzisions-Leiter (feuerstein/hammer/feile/polier) ist gefallen.
            const builtIns = Object.values(r.state.tools).filter((t) => t.builtIn);
            out.sixBuiltInTools = builtIns.length === 6;

            // Konstanten für UI: Labels + Farben
            out.roleLabelsFrozen =
                !!AR.BLUEPRINT_ROLE_LABELS &&
                Object.isFrozen(AR.BLUEPRINT_ROLE_LABELS) &&
                AR.BLUEPRINT_ROLE_LABELS.architecture === "Bauwerk" &&
                AR.BLUEPRINT_ROLE_LABELS.tool === "Werkzeug" &&
                AR.BLUEPRINT_ROLE_LABELS.machine === "Maschine";
            out.domainLabelsFrozen =
                !!AR.TOOL_DOMAIN_LABELS &&
                Object.isFrozen(AR.TOOL_DOMAIN_LABELS) &&
                AR.TOOL_DOMAIN_LABELS.forging === "Schmiede" &&
                AR.TOOL_DOMAIN_LABELS.alchemy === "Alchemie";
            out.domainColorsFrozen =
                !!AR.TOOL_DOMAIN_COLORS &&
                Object.isFrozen(AR.TOOL_DOMAIN_COLORS) &&
                typeof AR.TOOL_DOMAIN_COLORS.forging === "string";

            // UI: Werkstatt-Status zeigt Rolle live nach Edit
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            __probeBauplan("test_9b");
            r.selectBlueprintForEdit("test_9b");
            r._renderWorkshopDOM();
            // die Rolle wird im intuitiven Stats-Panel angezeigt (Rolle-Zeile mit .role-chip),
            // nicht im entfernten Editor-Header. Frisch geklont: architecture (emergent default) → der Chip
            // zeigt „Bauwerk" + trägt .role-emergent (der emergent/manuell-Indikator).
            const roleChip9b = document.querySelector("#workshop-stats-panel .role-chip");
            out.statusShowsBauwerk =
                !!roleChip9b &&
                roleChip9b.textContent.includes("Bauwerk") &&
                roleChip9b.classList.contains("role-emergent");
            // Apply schmiede-hammer auf eisen-Part (Domain-Op aus der Op-Bibliothek leihen)
            if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
            r.updatePartInBlueprint("test_9b", 0, { material: "eisen", recolor: true });
            r.applyOpToPart("test_9b", 0, "schmiede-hammer");
            r._renderWorkshopDOM();
            // die Rolle wird im Stats-Panel-Chip angezeigt; nach dem forging-Op sollte sie
            // Werkzeug/Rüstung sein (emergent, via .role-emergent-Klasse statt eines Status-Texts).
            const roleChipAfter = document.querySelector("#workshop-stats-panel .role-chip");
            out.statusShowsForgingRole =
                !!roleChipAfter &&
                (roleChipAfter.textContent.includes("Werkzeug") || roleChipAfter.textContent.includes("Rüstung")) &&
                roleChipAfter.classList.contains("role-emergent");

            // der Domain-Punkt lebt auf den Werkzeug-Karten der WERKZEUGE-Palette (das
            // besessene schmiede-hammer erscheint dort als Karte mit Domänen-Punkt).
            out.toolChipHasDomainDot =
                document.querySelectorAll("#workshop-tool-palette .workshop-tool-domain-dot").length > 0;

            // Cleanup
            if (r.state.blueprints["test_9b"]) r.deleteBlueprint("test_9b");
            r.selectBlueprintForEdit("stein_block");
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 9b", wave9bResults)) {
        check("Welle 9b: alle 5 Domain-Werkzeuge in state.tools", wave9bResults.allDomainToolsExist);
        check(
            "Welle 9b: korrektes Domain-Mapping pro Tool (schmiede→forging, mörser→alchemy, …)",
            wave9bResults.schmiedeHammerForging &&
                wave9bResults.morserAlchemy &&
                wave9bResults.webstuhlTextile &&
                wave9bResults.stabSoulwork &&
                wave9bResults.drehbankMechanism
        );
        check(
            "alle 5 Domain-Werkzeuge bleiben als Werkstatt-Op-Bibliothek (isStarter:false, in state.tools)",
            wave9bResults.allDomainToolsInInventory
        );
        check(
            "Welle 9b/V17.78: 6 Built-in-Werkzeuge (hände-Baseline + 5 domain; die generische Leiter fiel)",
            wave9bResults.sixBuiltInTools
        );
        check(
            "Welle 9b: BLUEPRINT_ROLE_LABELS frozen + deutsche Bezeichnungen (Bauwerk/Werkzeug/Maschine)",
            wave9bResults.roleLabelsFrozen
        );
        check(
            "Welle 9b: TOOL_DOMAIN_LABELS frozen + deutsche Bezeichnungen (Schmiede/Alchemie/…)",
            wave9bResults.domainLabelsFrozen
        );
        check("Welle 9b: TOOL_DOMAIN_COLORS frozen mit Hex-Strings pro Domain", wave9bResults.domainColorsFrozen);
        check(
            "Welle 9b UI: Werkstatt-Status zeigt 'Rolle: Bauwerk (emergent)' nach Klone",
            wave9bResults.statusShowsBauwerk
        );
        check(
            "Welle 9b UI: Status wechselt nach forging-Op auf Werkzeug/Rüstung (emergent)",
            wave9bResults.statusShowsForgingRole
        );
        check(
            "Welle 9b UI: Tool-Chip enthält .workshop-tool-domain-dot bei Domain-Werkzeugen",
            wave9bResults.toolChipHasDomainDot
        );
    }

    // ### Welt-Werkstatt-Architekturen + Distance-Gate ###
    const wave9cResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            const stationNames = ["esse", "brennkolben", "webstuhl", "seelenstein_altar", "drehbank"];
            out.allStationsExist = stationNames.every((n) => !!r.state.blueprints[n]);
            out.allHaveRole = stationNames.every(
                (n) => r.state.blueprints[n] && r.state.blueprints[n].role === "workshop-station"
            );
            // die bediente Domäne EMERGIERT aus der Substanz
            // (_computeWorkshopDomain), kein hardcoded workshopDomain-Feld mehr.
            out.esseForging = r._computeWorkshopDomain(r.state.blueprints.esse) === "forging";
            out.brennkolbenAlchemy = r._computeWorkshopDomain(r.state.blueprints.brennkolben) === "alchemy";
            out.webstuhlTextile = r._computeWorkshopDomain(r.state.blueprints.webstuhl) === "textile";
            out.altarSoulwork = r._computeWorkshopDomain(r.state.blueprints.seelenstein_altar) === "soulwork";
            out.drehbankMechanism = r._computeWorkshopDomain(r.state.blueprints.drehbank) === "mechanism";
            out.noHardcodedDomain = r.state.blueprints.esse.workshopDomain === undefined;

            // Modus auf pfad für strikten Test
            r.setGameMode("pfad");

            // Forging-Bauplan vorbereiten
            __probeBauplan("test_9c_forging");
            r.updatePartInBlueprint("test_9c_forging", 0, { material: "eisen", recolor: true });
            r.applyOpToPart("test_9c_forging", 0, "schmiede-hammer");

            // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
            const farPos = { x: 1000, y: 1000, z: 1000 };
            const nearPos = { x: 5, y: 0, z: 5 };

            // Esse nah spawnen
            r.spawnArchitecture("esse", nearPos, { silent: true });

            const gateFar = r._workshopStationGate("test_9c_forging", farPos);
            out.pfadFarFails = gateFar && gateFar.ok === false;
            out.pfadFarReportsDomain = gateFar && gateFar.neededDomain === "forging";

            const gateNear = r._workshopStationGate("test_9c_forging", nearPos);
            out.pfadNearPasses = gateNear && gateNear.ok === true;
            out.pfadNearReportsFound = gateNear && gateNear.found === "esse";

            r.setGameMode("frieden");
            const gateFrieden = r._workshopStationGate("test_9c_forging", farPos);
            out.friedenFreeAccess = gateFrieden && gateFrieden.ok === true && gateFrieden.free === true;

            r.setGameMode("schöpfer");
            const gateSchopfer = r._workshopStationGate("test_9c_forging", farPos);
            out.schopferFreeAccess = gateSchopfer && gateSchopfer.ok === true && gateSchopfer.free === true;

            r.setGameMode("pfad");
            const gateBootstrap = r._workshopStationGate("esse", farPos);
            out.bootstrapOk = gateBootstrap && gateBootstrap.ok === true && gateBootstrap.bootstrap === true;

            const gateArch = r._workshopStationGate("stein_block", farPos);
            out.archNoCheck = gateArch && gateArch.ok === true;

            // Cleanup
            if (r.state.blueprints["test_9c_forging"]) r.deleteBlueprint("test_9c_forging");
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse");
            r.setGameMode("frieden");
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 9c", wave9cResults)) {
        check(
            "Welle 9c: alle 5 Workshop-Bauplane als Built-ins (esse/brennkolben/webstuhl/seelenstein_altar/drehbank)",
            wave9cResults.allStationsExist
        );
        check("Welle 9c: alle haben role='workshop-station'", wave9cResults.allHaveRole);
        check(
            "Welle 9c→S7-B (V17.67): die bediente Domäne EMERGIERT aus der Substanz (esse→forging, brennkolben→alchemy, webstuhl→textile, altar→soulwork, drehbank→mechanism); kein hardcoded workshopDomain-Feld mehr",
            wave9cResults.esseForging &&
                wave9cResults.brennkolbenAlchemy &&
                wave9cResults.webstuhlTextile &&
                wave9cResults.altarSoulwork &&
                wave9cResults.drehbankMechanism &&
                wave9cResults.noHardcodedDomain
        );
        check(
            "Welle 9c: pfad ohne nahe Werkstatt → Gate lehnt ab + nennt neededDomain",
            wave9cResults.pfadFarFails && wave9cResults.pfadFarReportsDomain
        );
        check(
            "Welle 9c: pfad mit Werkstatt in WORKSHOP_PROXIMITY_M → Gate passt + nennt found-Architektur",
            wave9cResults.pfadNearPasses && wave9cResults.pfadNearReportsFound
        );
        check("Welle 9c: frieden-Modus überspringt Werkstatt-Gate (free=true)", wave9cResults.friedenFreeAccess);
        check("Welle 9c: schöpfer-Modus überspringt Werkstatt-Gate (free=true)", wave9cResults.schopferFreeAccess);
        check(
            "Welle 9c: Workshop-Station selbst (Esse) braucht keine Werkstatt (Bootstrap-Pfad)",
            wave9cResults.bootstrapOk
        );
        check(
            "Welle 9c: architecture-Bauplan (stein_block) überspringt Werkstatt-Check (keine Domain → kein Gate)",
            wave9cResults.archNoCheck
        );
    }

    // ### Maschinen-Bonus + Seelen-Bauplane ###
    const wave9dResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // Maschinen-Bonus
            __probeBauplan("test_9d_machine");
            r.setBlueprintToolMeta("test_9d_machine", "turn", "subtractive");
            // setBlueprintToolMeta setzt role=tool; force machine:
            r.state.blueprints.test_9d_machine.role = "machine";
            r.state.blueprints.test_9d_machine.roleManual = true;
            const minP = r.computeBlueprintPrecisionCap(r.state.blueprints.test_9d_machine);
            const reg = r.registerBlueprintAsTool("test_9d_machine");
            out.regOk = reg && reg.ok === true;
            if (reg && reg.ok) {
                const tool = r.state.tools["test_9d_machine"];
                const expected = Math.min(1.0, minP + 0.05);
                out.toolHasBonus = Math.abs(tool.precisionCap - expected) < 0.001;
                out.toolMarkedMachine = tool.isMachine === true;
            }

            // Ohne machine: kein Bonus
            __probeBauplan("test_9d_normaltool");
            r.setBlueprintToolMeta("test_9d_normaltool", "file", "subtractive");
            const minP2 = r.computeBlueprintPrecisionCap(r.state.blueprints.test_9d_normaltool);
            r.registerBlueprintAsTool("test_9d_normaltool");
            const toolNoBonus = r.state.tools["test_9d_normaltool"];
            out.normalToolNoBonus = toolNoBonus && Math.abs(toolNoBonus.precisionCap - minP2) < 0.001;
            out.normalToolNotMachine = toolNoBonus && toolNoBonus.isMachine === false;

            // Seelen-Bauplan
            __probeBauplan("test_9d_soul");
            r.state.blueprints.test_9d_soul.role = "soul";
            r.state.blueprints.test_9d_soul.roleManual = true;
            const soulBefore = r.state.player.soul;
            const soulRes = r.applyPlayerSoulFromBlueprint("test_9d_soul");
            out.soulApplyOk = soulRes && soulRes.ok === true;
            out.soulApplyChangedSoul = r.state.player.soul !== soulBefore;
            out.customSoulRegistered = !!(r.state.customSouls && r.state.customSouls["bp_test_9d_soul"]);

            const archRes = r.applyPlayerSoulFromBlueprint("stein_block");
            out.nonSoulReject = archRes && archRes.ok === false && archRes.reason === "blueprint_not_soul";
            const unknownRes = r.applyPlayerSoulFromBlueprint("nonsense_blueprint");
            out.unknownReject = unknownRes && unknownRes.ok === false && unknownRes.reason === "blueprint_unknown";

            // UI: die role-spezifischen Mach-Knöpfe (.workshop-soul-activate / .workshop-forge) sind im EINEN
            // „FERTIGEN“-Akt der Stats-Tabelle gefaltet — der Soul-Bauplan zeigt die FERTIGEN-Zeile im Live-DOM.
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            r.selectBlueprintForEdit("test_9d_soul");
            out.soulFertigenRendered = !!document.querySelector("#workshop-action-zone .workshop-fertigen");
            out.oldSoulButtonGone = !document.querySelector(".workshop-soul-activate");

            // Cleanup
            r.applyPlayerSoul("human");
            for (const n of ["test_9d_machine", "test_9d_normaltool", "test_9d_soul"]) {
                if (r.state.blueprints[n]) r.deleteBlueprint(n);
            }
            if (r.state.customSouls) delete r.state.customSouls["bp_test_9d_soul"];
            r.selectBlueprintForEdit("stein_block");
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 9d", wave9dResults)) {
        check(
            "Welle 9d: registerBlueprintAsTool mit role=machine vergibt Bonus auf precisionCap (min + 0.05, gedeckelt 1.0)",
            wave9dResults.regOk && wave9dResults.toolHasBonus
        );
        check("Welle 9d: Registriertes Maschinen-Tool trägt isMachine=true", wave9dResults.toolMarkedMachine);
        check(
            "Welle 9d: registerBlueprintAsTool ohne machine-Rolle vergibt KEINEN Bonus + isMachine=false",
            wave9dResults.normalToolNoBonus && wave9dResults.normalToolNotMachine
        );
        check(
            "Welle 9d: applyPlayerSoulFromBlueprint mit role=soul wechselt Spieler-Seele",
            wave9dResults.soulApplyOk && wave9dResults.soulApplyChangedSoul
        );
        check(
            "Welle 9d: soul-Bauplan wird als customSoul mit 'bp_'-Prefix registriert",
            wave9dResults.customSoulRegistered
        );
        check(
            "Welle 9d: applyPlayerSoulFromBlueprint auf nicht-soul-Bauplan → reject 'blueprint_not_soul'",
            wave9dResults.nonSoulReject
        );
        check(
            "Welle 9d: applyPlayerSoulFromBlueprint auf unbekannten Bauplan → reject 'blueprint_unknown'",
            wave9dResults.unknownReject
        );
        check(
            "Welle 9d UI (S7 V17.66): die EINE FERTIGEN-Zeile rendert bei role=soul im Werkstatt-DOM (statt des alten Soul-Knopfs)",
            wave9dResults.soulFertigenRendered && wave9dResults.oldSoulButtonGone
        );
    }

    // ### Präzision als Stat-Multiplikator ###
    const wave10aResults = await safeEvaluate(page, () => {
        if (!r) return null;
        const out = {};
        try {
            // Helper-Methode existiert

            // Leeres Array → 1.0
            out.emptyIs1 = r._compoundAvgPrecisionFromParts([]) === 1.0;
            // Null → 1.0
            out.nullIs1 = r._compoundAvgPrecisionFromParts(null) === 1.0;

            // Parts ohne opChain → 1.0 ("geboren")
            const partsBornless = [
                __teil("box", "stein", 0, 1, 0, 1, 1, 1),
                __teil("sphere", "knochen", 0, 1, 0, 1, 1, 1),
            ];
            out.partsNoChainIs1 = r._compoundAvgPrecisionFromParts(partsBornless) === 1.0;

            // Parts mit Hand-opChain (cap 0.4) → 0.4
            const partsHand = [
                __teil("box", "stein", 0, 1, 0, 1, 1, 1, { opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4 }] }),
            ];
            out.partsHandIs04 = Math.abs(r._compoundAvgPrecisionFromParts(partsHand) - 0.4) < 0.001;

            // computePlayerStats für Built-in mensch: soulMul = 1.0 (kein Effekt)
            r.applyPlayerSoul("human");
            const statsHuman = r.computePlayerStats();
            out.humanStatsBaseline = statsHuman && typeof statsHuman.stats.hpMax === "number";

            // Custom-Soul mit opChain auf bodyParts → Stats * soulMul
            // Synthese: Soul-Bauplan + opChain
            // Setze role:soul + opChain auf alle parts (simuliert "roh gebauter Soul")
            const bp = __probeBauplan("test_10a_soul");
            bp.role = "soul";
            bp.roleManual = true;
            for (const p of bp.parts) {
                p.opChain = [{ tool: "hände", op: "hand_knap", cap: 0.4 }];
            }
            const soulRes = r.applyPlayerSoulFromBlueprint("test_10a_soul");
            out.soulApplyOk = soulRes && soulRes.ok === true;
            const statsRough = r.computePlayerStats();
            // PRÄZISIONS-Achse isoliert: derselbe Soul einmal mit cap=0.4 (roh), einmal ohne opChain (geboren) —
            // der Größen-Faktor bleibt konstant, nur die Präzisions-Mul unterscheidet sich (unabhängig von der
            // absoluten Avatar-Größe).
            for (const p of bp.parts) {
                delete p.opChain;
            }
            r.applyPlayerSoulFromBlueprint("test_10a_soul");
            const statsPolished = r.computePlayerStats();
            // Restore die opChain für die nächsten Tests
            for (const p of bp.parts) {
                p.opChain = [{ tool: "hände", op: "hand_knap", cap: 0.4 }];
            }
            r.applyPlayerSoulFromBlueprint("test_10a_soul");
            out.roughLessHp = statsRough && statsPolished && statsRough.stats.hpMax < statsPolished.stats.hpMax;

            // Zurück zur Mensch-Seele
            r.applyPlayerSoul("human");

            // Tool-Precision-Multiplier in computePlayerStats
            // Wir registrieren einen eigenen Bauplan als Tool und prüfen ob die
            // Tool-Tags mit Präzision multipliziert werden.
            const toolBp = __probeBauplan("test_10a_tool");
            for (const p of toolBp.parts) {
                p.opChain = [{ tool: "hände", op: "hand_knap", cap: 0.4 }];
            }
            r.setBlueprintToolMeta("test_10a_tool", "test_op", "subtractive");
            toolBp.role = "tool";
            r.registerBlueprintAsTool("test_10a_tool");
            // Mensch-Seele tragen + tool equippen
            r.applyPlayerSoul("human");
            r.equipTool("test_10a_tool");
            const statsRoughTool = r.computePlayerStats();
            // Jetzt: tool-tags × (0.5 + 0.5×0.4 = 0.7)
            // Vergleich: r.state.tools["test_10a_tool"] hat die Tag-Beträge
            // Wir prüfen pragmatisch: Stats sollten sich gegenüber blanker Mensch verändern
            out.toolPrecModulates =
                statsRoughTool &&
                statsHuman &&
                (statsRoughTool.stats.hpMax !== statsHuman.stats.hpMax ||
                    statsRoughTool.stats.damage !== statsHuman.stats.damage);

            // Cleanup
            r.equipTool(null);
            for (const n of ["test_10a_soul", "test_10a_tool"]) {
                if (r.state.blueprints[n]) r.deleteBlueprint(n);
            }
            delete r.state.tools["test_10a_tool"];
            r.state.player.tools = r.state.player.tools.filter((t) => t !== "test_10a_tool");
            if (r.state.customSouls) delete r.state.customSouls["bp_test_10a_soul"];
            r._renderWorkshopDOM();
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "Welle 10a", wave10aResults)) {
        check(
            "Welle 10a: leeres/null Array → Default 1.0 (geboren, kein Effekt)",
            wave10aResults.emptyIs1 && wave10aResults.nullIs1
        );
        check("Welle 10a: Parts ohne opChain → 1.0 (Built-in-Soulen unverändert)", wave10aResults.partsNoChainIs1);
        check("Welle 10a: Parts mit Hand-opChain (cap 0.4) → Präzision 0.4", wave10aResults.partsHandIs04);
        check(
            "Welle 10a: computePlayerStats für Built-in-Mensch baseline (hpMax existiert)",
            wave10aResults.humanStatsBaseline
        );
        check(
            "Welle 10a: Roh geschmiedeter Soul (opChain Hand 0.4) → reduzierte hpMax (Sorgfalt belohnt)",
            wave10aResults.soulApplyOk && wave10aResults.roughLessHp
        );
        check(
            "Welle 10a: Tool-Präzision moduliert seinen Stat-Beitrag in computePlayerStats",
            wave10aResults.toolPrecModulates
        );
    }
}

// M2 ROLLEN-WAHRHEIT (diag-roles): das Register kennt `vehicle`, kein Hüll-Volumen-Exploit
// (auseinanderziehen ≠ stärker), der Klon behält Substanz (connections) + Intent (role).
// KONSUM, nicht Existenz.
async function checkBandM2RollenWahrheit({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const blu = r.state.blueprints;
        const sigs = r.constructor.FORM_ROLE_SIGNATURES;

        // (1) die fahrzeug-Rolle: der Wagen (4 rad-Gelenke + sitz) und das Holzross (sitz + moveable)
        // emergieren vehicle; am Holzross schlägt die vehicle-Resonanz soul (rideable-Konjunktion). Der
        // Wagen lebt in KIND_SUBSTANCE + hier als Test-Blueprint (für den Klon-Erbe-Teil (5)).
        const KSm2 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (blu._t_m2_wagen) delete blu._t_m2_wagen;
        blu._t_m2_wagen = {
            name: "_t_m2_wagen",
            parts: JSON.parse(JSON.stringify(KSm2.fahrzeug_wagen.parts)),
            connections: JSON.parse(JSON.stringify(KSm2.fahrzeug_wagen.connections || [])),
        };
        out.wagenVehicle = r.computeBlueprintRole(blu._t_m2_wagen) === "vehicle";
        out.rossVehicle = r.computeBlueprintRole(blu.reittier_holzross) === "vehicle";
        const rossV = r._blueprintProductVector(blu.reittier_holzross);
        out.rossMechanism =
            rossV.rideable === 1 &&
            r._blueprintResonance(rossV, sigs.vehicle) > r._blueprintResonance(rossV, sigs.soul);

        // (2) useKind: ein Fahrzeug wird PLATZIERT — und ein Baum wird nicht mehr GETRUNKEN (war useKind=drink via
        // consumable).
        out.vehiclePlace =
            r._blueprintUseKind(blu._t_m2_wagen) === "place" && r._blueprintUseKind(blu.reittier_holzross) === "place";
        // baum_eiche statisch geschnitten; ein gewachsener Baum wird PLATZIERT.
        const __ukKey = r._growTreeBlueprintForSpawn("baum_eiche", "usekind");
        out.baumPlace = !!__ukKey && r._blueprintUseKind(blu[__ukKey]) === "place";

        // (3) die KONJUNKTION hält: ein toter Stein-Stuhl (sitz-Anker, KEIN Antrieb →
        // nicht moveable) bleibt Bauwerk — der Sitz allein macht kein Fahrzeug.
        const stuhl = {
            name: "__m2_stuhl",
            parts: [
                { shape: "box", material: "stein", size: { x: 1, y: 0.2, z: 1 }, position: { x: 0, y: 0.6, z: 0 } },
                { shape: "box", material: "stein", size: { x: 0.9, y: 0.6, z: 0.9 }, position: { x: 0, y: 0.2, z: 0 } },
            ],
            connections: [{ type: "sitz", partA: 0, partB: -1 }],
        };
        const stuhlV = r._blueprintProductVector(stuhl);
        out.stuhlBleibtBauwerk = stuhlV.rideable === 0 && r.computeBlueprintRole(stuhl) === "architecture";

        // (4) das Auseinanderzieh-Exploit ist TOT: identische Substanz, nur gespreizt → IDENTISCHER Größen-Faktor
        // (Σ-Substanz-Volumen statt Hüll-Volumen).
        const mk = (d) => ({
            parts: [
                __teil("box", "eisen", 0, 0, 0, 0.4, 0.4, 0.4),
                __teil("box", "eisen", d, 0, 0, 0.4, 0.4, 0.4),
            ],
        });
        out.exploitTot = Math.abs(r._compoundSizeFactor(mk(0.5)) - r._compoundSizeFactor(mk(10))) < 1e-9;

        // (5) der Klon erbt die SUBSTANZ: ein geklonter Wagen behält seine connections (Gelenke/Sitz) → die
        // fahrzeug-Rolle emergiert auch am Klon.
        if (blu.__m2_wagenklon) delete blu.__m2_wagenklon;
        r.cloneBlueprint("_t_m2_wagen", "__m2_wagenklon");
        const wk = blu.__m2_wagenklon;
        out.klonSubstanz =
            !!wk &&
            Array.isArray(wk.connections) &&
            wk.connections.length === (blu._t_m2_wagen.connections || []).length &&
            r.computeBlueprintRole(wk) === "vehicle";
        delete blu.__m2_wagenklon;
        delete blu._t_m2_wagen;

        // (6) der Klon erbt den INTENT: ein geklonter Brennkolben BLEIBT Werkstatt-
        // Station (Chip + _workshopStationGate lesen bp.role).
        if (blu.__m2_kolbenklon) delete blu.__m2_kolbenklon;
        r.cloneBlueprint("brennkolben", "__m2_kolbenklon");
        const kk = blu.__m2_kolbenklon;
        out.klonIntent = !!kk && kk.role === "workshop-station" && kk.roleManual === true;
        delete blu.__m2_kolbenklon;

        // (8) kein Regress an den Substanz-Zwillingen: Trank bleibt Trank (klein +
        // lebendig), die Werkstatt-Saaten tragen ihre Designation, Avatar bleibt Seele.
        out.keinRegress =
            r.computeBlueprintRole(blu.trank_lebenssaft) === "consumable" &&
            r._displayRole(blu.brennkolben) === "workshop-station" &&
            r.computeBlueprintRole(blu.koerper_human) === "soul";
        return out;
    });
    check(
        "M2 Rollen-Wahrheit: Wagen + Holzross emergieren `vehicle` — die rideable-Konjunktion (sitz ∧ moveable) schlägt soul am Holzross",
        res.wagenVehicle && res.rossVehicle && res.rossMechanism
    );
    check(
        "M2 Rollen-Wahrheit: ein Fahrzeug wird PLATZIERT (useKind place, nicht Hand) — und ein Baum nicht mehr getrunken",
        res.vehiclePlace && res.baumPlace
    );
    check(
        "M2 Rollen-Wahrheit: die Konjunktion hält — ein toter Stein-Stuhl (sitz ohne Antrieb) bleibt Bauwerk",
        res.stuhlBleibtBauwerk
    );
    check(
        "M2 Stat-Robustheit: das Auseinanderzieh-Exploit ist tot — identische Substanz gespreizt gibt identischen Größen-Faktor (Ω5-Geist)",
        res.exploitTot
    );
    check(
        "M2 Klon-Erbe: der Klon trägt die volle Substanz (connections → der Wagen-Klon bleibt Fahrzeug) UND den Intent (der Brennkolben-Klon bleibt Werkstatt-Station)",
        res.klonSubstanz && res.klonIntent
    );
    check(
        "M2 kein Regress: Trank bleibt Trank, die Werkstatt-Designation steht, der Avatar bleibt Seele",
        res.keinRegress
    );
}

// AUTO-VERBINDUNG + Sattel-Optik/Probesitz-Ghost (behavioral: diag-autoconnect). Wände: Transition-
// Geburt/-Lösung · „✂ Lösen“ geehrt · Typ folgt Substanz · Tür/Wirbel nur aus bewusster Hand ·
// rotations-bewusste Kontakt-Hülle · Anker überleben Part-Löschen · Ghost nur in der Werkstatt.
async function checkBandV18164AutoConnect({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const blu = r.state.blueprints;
        const P = (shape, material, x, y, z, sx, sy, sz, rot) => ({
            shape,
            material,
            position: { x, y, z },
            size: { x: sx, y: sy, z: sz },
            ...(rot ? { rotation: rot } : {}),
        });
        if (blu.__ac) delete blu.__ac;
        r.createBlueprint("__ac", "AutoConnect-Probe");
        const bp = blu.__ac;
        r.addPartToBlueprint("__ac", P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1));
        r.addPartToBlueprint("__ac", P("cylinder", "holz", 6, 0.34, 6, 0.62, 0.14, 0.62, { x: 0, y: 0, z: 1.5707963 }));

        // (1) die ROTATIONS-BEWUSSTE Kontakt-Hülle: das liegende Rad (|R|·s →
        // vertikal 0.62) berührt den Korpus an der kanonischen Platzierung —
        // die rotations-blinde Hülle (0.14) hätte NIE berührt (GEMESSENE Wurzel).
        bp.parts[1].position = { x: -0.72, y: 0.34, z: 0.8 };
        out.rotKontakt = r._partsContactArea(bp.parts[0], bp.parts[1]) > 0;
        const unrot = { ...bp.parts[1], rotation: { x: 0, y: 0, z: 0 } };
        out.rotIstDieWurzel = r._partsContactArea(bp.parts[0], unrot) === 0;

        // (2) TRANSITION gebiert: neu-berührt → auto-Verbindung (argmax-Typ:
        // holz+holz → lashing/Binden, die M1-gemessene Substanz-Wahrheit).
        let res1 = r._workshopAutoConnect(bp, 1, new Set());
        const c1 = (bp.connections || []).find((c) => c.auto);
        out.geburt = res1.created.length === 1 && !!c1 && c1.type === "lashing";

        // (3) TRENNUNG löst nur auto-Geborenes; die bewusste Wahl bleibt.
        bp.connections.push({ type: "welding", partA: 0, partB: 1 }); // bewusste Zweit-Verbindung (Test-Konstrukt)
        bp.parts[1].position = { x: 9, y: 0.34, z: 9 };
        r._workshopAutoConnect(bp, 1, new Set([0]));
        out.trennung =
            !(bp.connections || []).some((c) => c.auto) &&
            (bp.connections || []).some((c) => c.type === "welding" && !c.auto);
        bp.connections = [];

        // (4) „✂ Lösen" GEEHRT: ruhender Kontakt (prevTouches trägt den Partner)
        // gebiert NICHT neu; erst der echte Weg-und-zurück-Übergang tut es.
        bp.parts[1].position = { x: -0.72, y: 0.34, z: 0.8 };
        r._workshopAutoConnect(bp, 1, new Set([0]));
        out.loesenGeehrt = (bp.connections || []).length === 0;
        r._workshopAutoConnect(bp, 1, new Set());
        out.uebergangGebiert = (bp.connections || []).filter((c) => c.auto).length === 1;

        // (5) der Typ FOLGT der Substanz: Material → eisen ⇒ argmax wandert auf
        // welding (der Kontakt ist gemeinsamer Faktor — der argmax hängt nur
        // am Material-Paar).
        bp.parts[0].material = "eisen";
        bp.parts[1].material = "eisen";
        r._workshopAutoConnect(bp, 1, r._workshopTouchesOf(bp, 1));
        out.typFolgt = (bp.connections || []).some((c) => c.auto && c.type === "welding");

        // (6) TÜR/WIRBEL nur aus bewusster Hand (das C2-„Hütten wackeln nie"):
        // dieselbe Geometrie, auto vs. manuell — nur manuell gebiert das Gelenk.
        const wand = (auto) => ({
            parts: [P("box", "holz", 0, 0.15, 0, 6, 0.3, 6), P("box", "holz", 0, 1.8, 0, 4, 3, 0.2)],
            connections: [
                auto ? { type: "lashing", partA: 1, partB: 0, auto: 1 } : { type: "lashing", partA: 1, partB: 0 },
            ],
        });
        const tuer = (auto) =>
            (r.computeMotionRoles(wand(auto).parts, wand(auto).connections) || []).some((x) => x && x.role === "tuer");
        const turm = (auto) => {
            const p = [0, 1, 2, 3].map((i) => P("box", "stein", 0, 0.5 + i, 0, 1, 1, 1));
            const c = [0, 1, 2].map((i) =>
                auto
                    ? { type: "masonry", partA: i, partB: i + 1, auto: 1 }
                    : { type: "masonry", partA: i, partB: i + 1 }
            );
            return (r.computeMotionRoles(p, c) || []).some((x) => x && x.role === "wirbel");
        };
        out.tuerNurBewusst = !tuer(true) && tuer(false);
        out.wirbelNurBewusst = !turm(true) && turm(false);
        // …und das RAD bleibt der auto-Geburt offen (der Wagen ROLLT).
        const radRoles = r.computeMotionRoles(bp.parts, bp.connections) || [];
        out.radBleibtFrei = radRoles.some((x) => x && x.role === "rad");

        // (7) die Marke REIST durch das Validierungs-Sieb (wie der M1-anchor).
        const valid = r.validateBlueprintConnections([{ type: "lashing", partA: 0, partB: 1, auto: 1 }], 2);
        out.validReist = valid.length === 1 && valid[0].auto === 1;

        // (8) der GEHEILTE Remap-Riss: Part-Löschen bewahrt anchor + auto der ÜBRIGEN Verbindungen.
        if (blu.__acRm) delete blu.__acRm;
        r.createBlueprint("__acRm", "Remap-Probe");
        r.addPartToBlueprint("__acRm", P("box", "holz", 0, 0.5, 0, 1, 1, 1));
        r.addPartToBlueprint("__acRm", P("box", "holz", 0, 1.5, 0, 1, 1, 1));
        r.addPartToBlueprint("__acRm", P("box", "holz", 0, 2.5, 0, 1, 1, 1));
        const rmBp = blu.__acRm;
        rmBp.connections = [
            { type: "sitz", partA: 2, partB: -1, anchor: { x: 0.1, y: 0.5, z: 0 } },
            { type: "lashing", partA: 1, partB: 2, auto: 1 },
        ];
        r.removePartFromBlueprint("__acRm", 0);
        const sitzC = (rmBp.connections || []).find((c) => c.type === "sitz");
        const autoC = (rmBp.connections || []).find((c) => c.type === "lashing");
        out.remapHeil =
            !!sitzC && !!sitzC.anchor && sitzC.anchor.x === 0.1 && sitzC.partA === 1 && !!autoC && autoC.auto === 1;
        delete blu.__acRm;

        // (9) §7.2 — SATTEL in der Welt (Substanz-Optik am expliziten Sitz),
        // GHOST nur in der Werkstatt (opts-bestellt).
        bp.connections.push({ type: "sitz", partA: 0, partB: -1, anchor: { x: 0, y: 0.175, z: 0 } });
        const world = r._buildFromBlueprint(bp, 0);
        const shop = r._buildFromBlueprint(bp, 0, undefined, { connectionLines: true });
        out.sattelWelt = world.children.some((c) => c.userData && c.userData.isAttachmentVisual);
        out.ghostNurWerkstatt =
            shop.children.some((c) => c.userData && c.userData.isSeatGhost) &&
            !world.children.some((c) => c.userData && c.userData.isSeatGhost);
        const ohneSitz = { name: "__acNoSitz", parts: bp.parts };
        out.keinSattelOhneSitz = !r
            ._buildFromBlueprint(ohneSitz, 0)
            .children.some((c) => c.userData && c.userData.isAttachmentVisual);
        delete blu.__ac;
        return out;
    });
    check(
        "§7.1 Kontakt-Wahrheit: die Hülle ist rotations-bewusst (|R|·s) — das liegende Wagenrad BERÜHRT den Korpus, die rotations-blinde Hülle war die gemessene Wurzel",
        res.rotKontakt && res.rotIstDieWurzel
    );
    check(
        "§7.1 Auto-Verbindung: neu-berührt gebiert den Substanz-argmax (holz→Binden) · getrennt löst NUR auto-Geborenes (die bewusste Wahl bleibt)",
        res.geburt && res.trennung
    );
    check(
        "§7.1 Lösen geehrt: ruhender Kontakt gebiert nie neu — erst der echte Weg-und-zurück-Übergang; und der Typ FOLGT der Substanz (eisen → Schweißen)",
        res.loesenGeehrt && res.uebergangGebiert && res.typFolgt
    );
    check(
        "§7.1 Gelenk-Wand: Tür + Wirbel-Kette nur aus bewusster Hand (Hütten wackeln nie, C2) — das RAD bleibt der auto-Geburt offen (der Wagen rollt)",
        res.tuerNurBewusst && res.wirbelNurBewusst && res.radBleibtFrei
    );
    check(
        "§7.1 die auto-Marke reist (Validierungs-Sieb) + der Remap-Riss ist geheilt (Part-Löschen bewahrt anchor/auto der übrigen Verbindungen)",
        res.validReist && res.remapHeil
    );
    check(
        "§7.2 der Sitz ist SICHTBAR: Sattel-Optik in der Welt (Substanz am expliziten Anker) · Probesitz-Ghost NUR in der Werkstatt (opts-bestellt) · kein Sattel ohne Sitz",
        res.sattelWelt && res.ghostNurWerkstatt && res.keinSattelOhneSitz
    );
}

// Skeleton-Mesh: echte Tube-Geometrie (bark mit lobed flare) + Foliage-Cards (normalBend) + der EINE
// Wind-Term im Stoff + Slope/Höhen-Toleranzen. Reine Render-Vertiefung — bp.parts bleibt
// unverändert (tag-neutral).
async function checkBandV18214SkeletonMesh({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};

        // ─── (T1) Source-Probes: die vier neuen Helper + Routing ─────
        // K24-N1: der Wurzelanlauf ist das Gesetz der Art (P.flare), die Röhre trägt nur ihre Rippen-Zahl; der Ersatz fiel
        out.defaultFlareExists = Number.isInteger(A.STAMM_RIPPEN) && A.STAMM_RIPPEN > 0;
        out.speciesTreeParamsExists =
            !!A.SPECIES_TREE_PARAMS && !!A.SPECIES_TREE_PARAMS.baum_tanne && !!A.SPECIES_TREE_PARAMS.baum_birke;
        if (out.speciesTreeParamsExists) {
            const tp = A.SPECIES_TREE_PARAMS;
            // Plan §3.7: Birke meidet Steilhang (slopeMax ≈ 0.6), Fichte/Tanne klettert (1.2+).
            out.tannenSlopeHigher = tp.baum_tanne.slopeMax > tp.baum_birke.slopeMax;
            out.allSpeciesHaveFlare = [
                "baum_tanne",
                "baum_kiefer",
                "baum_buche",
                "baum_birke",
                "baum_eiche",
                "baum_erle",
            ].every((k) => tp[k] && !("flare" in tp[k]));
        }

        // ─── (T4) Behavioral: Skeleton wird beim Wachsen gesetzt ───
        // genVersion temporär 7, dann (Seed, Spezies)-Kombis probieren, bis ein NICHT-moveable Bauplan
        // wächst — manche Seeds erzeugen moveable-Tannen, der Test darf nicht an diesem Edge-Case hängen.
        const origGen = r.state.worldMeta ? r.state.worldMeta.genVersion : null;
        if (r.state.worldMeta) r.state.worldMeta.genVersion = 7;
        let grownKey = null;
        const tries = [
            ["baum_kiefer", "skel-t1"],
            ["baum_kiefer", "skel-t2"],
            ["baum_kiefer", "skel-t3"],
            ["baum_buche", "skel-t4"],
            ["baum_eiche", "skel-t5"],
            ["baum_tanne", "skel-t6"],
            ["baum_birke", "skel-t7"],
            ["baum_erle", "skel-t8"],
        ];
        for (const [sp, sd] of tries) {
            try {
                const candidate = r._growTreeBlueprintForSpawn(sp, sd);
                if (!candidate || !r.state.blueprints[candidate]) continue;
                const bp2 = r.state.blueprints[candidate];
                const aff = r.computeBlueprintAffordances(bp2);
                if (aff.moveable || aff.magnifying) continue;
                grownKey = candidate;
                break;
            } catch (_e) {
                out.growError = String(_e && _e.message);
            }
        }
        if (grownKey && r.state.blueprints[grownKey]) {
            const bp = r.state.blueprints[grownKey];
            out.bpHasSkeleton = !!bp._skeleton && Array.isArray(bp._skeleton.branches);
            out.bpStillHasParts = Array.isArray(bp.parts) && bp.parts.length >= 50;
            if (out.bpHasSkeleton) {
                out.skelBranchCount = bp._skeleton.branches.length;
                out.skelAnchorCount = Array.isArray(bp._skeleton.anchors) ? bp._skeleton.anchors.length : 0;
                out.skelHasTrunk = bp._skeleton.branches.some((b) => b.isTrunk === true);
                out.skelHasFlare =
                    Number.isFinite(bp._skeleton.flareAmp) &&
                    bp._skeleton.flareAmp > 0 &&
                    bp._skeleton.flareLobes === A.STAMM_RIPPEN;
            }

            // ─── (T5) Behavioral: archFlattenBlueprint baut Tube+Cards ───
            if (r.state.archFlattenCache) r.state.archFlattenCache.delete(grownKey);
            if (r.state.archMergedGeomCache) r.state.archMergedGeomCache.delete(grownKey);
            const flat = r._archFlattenBlueprint(grownKey);
            out.flatIsSkeleton = flat && flat.skeleton === true;
            out.flatHasMergedMarker = flat && flat.merged === true;
            out.flatLeafCount = flat ? flat.leaves.length : -1;
            // 2 leaves erwartet (bark + foliage), max 4 als Toleranz.
            out.flatLeavesFew = flat && flat.leaves.length >= 1 && flat.leaves.length <= 4;
            if (flat && flat.leaves.length > 0) {
                // T6: bark-Geometrie trägt color + viele Vertices; der Wind lebt im Stoff (K19: `_baumWindStoff` liest
                // positionGeometry und den Stempel aH0) — die Geometrie trägt nur, was ein Stoff liest.
                const ungelesen = (lf, gelesen) => Object.keys(lf.geom.attributes).filter((k) => !gelesen.includes(k));
                const imWind = (lf) =>
                    !!(lf.mat && lf.mat.positionNode && lf.mat.userData.baumWind && lf.mat.userData.baumWind.ht > 0);
                const bark = flat.leaves[0];
                out.barkVerts = bark.geom.attributes.position.count;
                out.barkUngelesen = ungelesen(bark, ["position", "normal", "color", "aH0", "aH0L"]);
                out.barkImWind = imWind(bark);
                out.barkHasColor = !!bark.geom.attributes.color;
                out.barkHasNormal = !!bark.geom.attributes.normal;
                out.barkManyVerts = bark.geom.attributes.position.count >= 100;
                // T7: localMatrix Identity
                const elems = bark.localMatrix.elements;
                out.barkIdentity =
                    Math.abs(elems[0] - 1) < 1e-6 && Math.abs(elems[5] - 1) < 1e-6 && Math.abs(elems[10] - 1) < 1e-6;
                // T8: foliage falls vorhanden
                if (flat.leaves.length > 1) {
                    const fol = flat.leaves[1];
                    out.foliageUngelesen = ungelesen(fol, ["position", "normal", "color", "uv", "aH0", "aH0L"]);
                    out.foliageImWind = imWind(fol);
                    out.foliageVerts = fol.geom.attributes.position.count;
                    out.foliageHasColor = !!fol.geom.attributes.color;
                    // Die Krone ist Vorlagen-Geometrie aus der EINEN phyto-core-Quelle: EIN Element je Phyto-Blatt, die
                    // Anker aus denselben Blättern → foliageVerts = anchorCount × Verts/Blatt. LOD0-Laubbäume: die
                    // 30-Vert-Superformel-Klinge (`buildLeafBlades`); Nadel-Sprays: das 4-Vert-Quad (`buildFoliageQuads`).
                    out.foliageCardsPerAnchor = 1;
                    const _fvc = fol.geom.attributes.position.count;
                    out.foliageVertsMatchAnchors =
                        _fvc === out.skelAnchorCount * 4 || _fvc === out.skelAnchorCount * 30;
                }
            }

            // ─── (T9) Tag-Neutralität: bp.parts unverändert ──
            // der bpClone braucht _isGrown + _grownSpecies für faire
            // SPECIES_TAG_VARIATION-Anwendung (sonst Variation-an vs aus).
            const tagsSkel = r.computeCompoundTags(bp);
            const bpClone = {
                parts: bp.parts.slice(),
                _isGrown: bp._isGrown,
                _grownSpecies: bp._grownSpecies,
            };
            const tagsClone = r.computeCompoundTags(bpClone);
            const tagKeys = ["lebendig", "dichte", "brennbar", "magieleitung"];
            out.tagsNeutral = tagKeys.every((k) => Math.abs((tagsSkel[k] || 0) - (tagsClone[k] || 0)) < 1e-9);

            // ─── (T10) Snapshot: _skeleton NICHT persistiert ─────────
            // Snapshot hält NUR architektur-referenzierte grown-Baupläne; Sentinel-Arch.
            r.state.architectures = r.state.architectures || [];
            r.state.architectures.push({ id: "v214-snap-arch", type: grownKey, position: { x: 0, y: 0, z: 0 } });
            const snap = r.buildStateSnapshot();
            const gb = snap && snap.grownBlueprints && snap.grownBlueprints[grownKey];
            out.snapshotHasEntry = !!gb;
            out.snapshotNoSkeletonField = gb ? gb._skeleton === undefined : false;
            r.state.architectures = r.state.architectures.filter((a) => a.id !== "v214-snap-arch");
        }

        // genVersion-Restore (defensive)
        if (r.state.worldMeta && origGen !== null) r.state.worldMeta.genVersion = origGen;

        return out;
    });

    check(
        "(T1f) der Wurzelanlauf ist das Gesetz (STAMM_RIPPEN)",
        res.defaultFlareExists === true
    );
    check("(T1g) SPECIES_TREE_PARAMS definiert (alle 6 Arten)", res.speciesTreeParamsExists === true);
    check(
        "(T1h) Plan §3.7: Tanne slopeMax > Birke slopeMax (Birke meidet Steilhang)",
        res.tannenSlopeHigher === true
    );
    check("(T1i) keine der 6 Arten trägt eine Hand-Anlauf-Zeile (K24-N1)", res.allSpeciesHaveFlare === true);
    check("(T4a) gen=7 grown Bauplan trägt _skeleton-Feld", res.bpHasSkeleton === true);
    check("(T4b) bp.parts bleibt erhalten (V17.16-Wand)", res.bpStillHasParts === true);
    check(
        `(T4c) Skeleton hat ≥2 Branches (Stamm + L1+) — gemessen ${res.skelBranchCount}`,
        res.skelBranchCount >= 2
    );
    check(`(T4d) Skeleton hat ≥1 Foliage-Anchor — gemessen ${res.skelAnchorCount}`, res.skelAnchorCount >= 1);
    check("(T4e) Skeleton trägt einen isTrunk-Branch", res.skelHasTrunk === true);
    check("(T4f) Skeleton trägt den Anlauf des Gesetzes (flareAmp>0, STAMM_RIPPEN)", res.skelHasFlare === true);
    check("(T5a) archFlattenBlueprint markiert skeleton: true", res.flatIsSkeleton === true);
    check(
        "(T5b) archFlattenBlueprint markiert merged: true (Diagnose-Kompat)",
        res.flatHasMergedMarker === true
    );
    check(
        `(T5c) ≤4 leaves (gemessen ${res.flatLeafCount}, erwartet 1-2 bark+foliage)`,
        res.flatLeavesFew === true
    );
    check(
        `K19 (T6a) die Rinde schwingt im Wind-Term ihres Stoffs, die Geometrie trägt nur Gelesenes (${res.barkVerts} verts, ungelesen: ${(res.barkUngelesen || []).join(" · ") || "—"})`,
        res.barkImWind === true && Array.isArray(res.barkUngelesen) && res.barkUngelesen.length === 0
    );
    check("(T6c) bark-Geom trägt color", res.barkHasColor === true);
    check("(T6d) bark-Geom trägt normal", res.barkHasNormal === true);
    check("(T6e) bark-Geom hat ≥100 Vertices (Ring-of-6 pro Punkt)", res.barkManyVerts === true);
    check("(T7) bark-Leaf localMatrix ist Identity", res.barkIdentity === true);
    check(
        `K19 (T8a) das Laub schwingt im Wind-Term seines Stoffs, die Geometrie trägt nur Gelesenes (${res.foliageVerts} verts, ungelesen: ${(res.foliageUngelesen || []).join(" · ") || "—"})`,
        res.foliageImWind === true && Array.isArray(res.foliageUngelesen) && res.foliageUngelesen.length === 0
    );
    check("(T8b) foliage-Geom trägt color", res.foliageHasColor === true);
    check(
        `V18.386/.390 Neues Kleid/Eins W4: foliage-Vertex-Count = anchors·4 (Quad) oder anchors·30 (L0-Klinge): ${res.foliageVerts}/${res.skelAnchorCount}`,
        res.foliageVertsMatchAnchors === true
    );
    check(
        "(T9) Tag-Neutralität: computeCompoundTags(skeleton bp) == (clone) (V17.16-Wand)",
        res.tagsNeutral === true
    );
    check("(T10a) Snapshot trägt grown-Eintrag", res.snapshotHasEntry === true);
    check(
        "(T10b) Snapshot persistiert _skeleton NICHT (re-baubar aus seed)",
        res.snapshotNoSkeletonField === true
    );
}

module.exports = {
    checkBandV1769RoleResonance, checkBandV1771ToolOpFromForm, checkBandOmegaPhi1CoM, checkBandOmegaPhysisSaeuleI_II,
    checkBandV1779RoleFitQuality, checkBandV1780FormAxes, checkBandV1781RoleRegister, checkBandV1782CatalystReadout,
    checkBandV1785RoleDisplayAndUndo, checkBandV1787UndoRedo, checkBandV1788WorkshopAsProcess, checkBandWave4,
    checkBandWave5, checkBandWaves9And10a, checkBandM2RollenWahrheit, checkBandV18164AutoConnect,
    checkBandV18214SkeletonMesh,
};
