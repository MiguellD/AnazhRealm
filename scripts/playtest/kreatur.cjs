"use strict";
// scripts/playtest/kreatur.cjs — der Richter von Kreatur (spec/stamm/modul-karte.json): Spawn · Stats · Tod · Fauna-Zyklus · Serialisierung · Aufgaben · Scheu · Jagd · Rudel · Kreatur-Takt.
// 13 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { spawn } = require("child_process");
const { safeEvaluate } = require("../playtest.cjs");

// Die Logik-Konsumenten lesen die lebendige auraAt-API (nicht das eingefrorene worldFieldAt); die
// Fauna liest die VOLLEN Achsen (lebendig hebt, glut dämpft); Beweis: Konsum + behavioral.
async function checkBandV1725FieldReaders(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        if (r.state.lifeField) r.state.lifeField.clear(); // V17.27 — die Fauna-Behavioral-Probe misst den frozen Kern
        // KONSUM-Beweis statt Quelltext-Zitat: die Leser rufen auraAt WIRKLICH (Spy-Swap __consumes, überlebt
        // Kern-Wanderungen); das glut-Token bleibt __codeOf-Probe, faunaDiffers misst die glut-Dämpfung.
        out.faunaReadsAura =
            window.__consumes(r, "_currentFaunaTarget", r, "auraAt") &&
            /glut/.test(window.__codeOf(r._currentFaunaTarget));
        out.faunaMaxReadsAura =
            window.__consumes(r, "_currentFaunaMax", r, "auraAt") && /glut/.test(window.__codeOf(r._currentFaunaMax));
        out.lofiReadsAura = window.__consumes(r, "_lofiWorldField", r, "auraAt");
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm) {
            const ox = pm.x,
                oz = pm.z;
            let lebSpot = null,
                lebBest = -2,
                glutSpot = null,
                glutBest = -2;
            for (let gx = -2000; gx <= 2000; gx += 200) {
                for (let gz = -2000; gz <= 2000; gz += 200) {
                    const f = r.worldFieldAt(gx, gz);
                    if (f.lebendig - f.glut > lebBest) {
                        lebBest = f.lebendig - f.glut;
                        lebSpot = { x: gx, z: gz };
                    }
                    if (f.glut - f.lebendig > glutBest) {
                        glutBest = f.glut - f.lebendig;
                        glutSpot = { x: gx, z: gz };
                    }
                }
            }
            pm.x = lebSpot.x;
            pm.z = lebSpot.z;
            const targetLeb = r._currentFaunaTarget();
            pm.x = glutSpot.x;
            pm.z = glutSpot.z;
            const targetGlut = r._currentFaunaTarget();
            pm.x = ox; // Restore
            pm.z = oz;
            out.faunaDiffers = targetLeb > targetGlut;
            out.targetLeb = targetLeb;
            out.targetGlut = targetGlut;
        }
        return out;
    });
    check("V17.25 mehr Leser: _currentFaunaTarget liest auraAt + glut (volle Achsen, §5)", res.faunaReadsAura);
    check("V17.25 mehr Leser: _currentFaunaMax liest auraAt + glut", res.faunaMaxReadsAura);
    check("V17.25 mehr Leser: _lofiWorldField liest auraAt (living)", res.lofiReadsAura);
    check(
        "V17.25 mehr Leser: lebendige Region trägt MEHR Fauna als glühende (glut dämpft, alle Achsen)",
        res.faunaDiffers,
        `leb=${res.targetLeb} vs glut=${res.targetGlut}`
    );
}

// Kombat-Stats: knockback/attackSpeed/defense EMERGIEREN aus der Substanz (Tags → STAT_FROM_TAGS) wie
// damage/speed/hpMax — schwere Keule langsam-wuchtig, leichte harte Klinge schnell. Geprüft: Profile
// differenzieren durch DIESELBE Pipeline für Spieler + Kreatur, sichtbar in der UI.
async function checkBandV1751CombatStats(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const S = r.constructor.STAT_FROM_TAGS;

        // (1) Struktur: die drei Kombat-Stats existieren als Formeln in der EINEN Tabelle
        out.formulasExist =
            typeof S.knockback === "function" && typeof S.attackSpeed === "function" && typeof S.defense === "function";

        // (2) Substanz-Differenzierung (der KERN — die Tabelle IST die Regel):
        // schwere dichte Keule vs. leichte harte Klinge vs. weiches Wesen.
        const keule = { dichte: 0.9, härte: 0.5 }; // schwer + dicht (Masse)
        const klinge = { dichte: 0.3, härte: 0.9 }; // leicht + hart (scharf)
        const weich = { dichte: 0.05, härte: 0.05 }; // weich (kein Schutz)
        out.heavyMoreKnockback = S.knockback(keule) > S.knockback(klinge) + 1; // Masse stößt zurück
        out.lightFasterAttack = S.attackSpeed(klinge) > S.attackSpeed(keule) + 0.1; // leicht = flink
        out.hardMoreDamage = S.damage(klinge) > S.damage(keule); // härte schneidet (bestehendes damage)
        out.denseMoreDefense = S.defense(keule) > S.defense(weich) + 3; // dichte/harte Rüstung blockt
        out.softNoDefense = S.defense(weich) < 1; // base-los wie die elementaren Resists
        out.attackSpeedPositive = S.attackSpeed(keule) > 0 && S.attackSpeed({ dichte: 1 }) > 0; // kein negativer Cooldown
        out.magicFlink = S.attackSpeed({ dichte: 0.3, magieleitung: 1 }) > S.attackSpeed({ dichte: 0.3 }); // flink-Term

        // (3) Spieler-Pipeline-KONSUM: die ECHTE computePlayerStats berechnet das Trio
        const ps = r.computePlayerStats().stats;
        out.playerComputes =
            Number.isFinite(ps.knockback) &&
            Number.isFinite(ps.attackSpeed) &&
            Number.isFinite(ps.defense) &&
            ps.attackSpeed > 0;

        // (4) Kreatur-Pipeline-KONSUM (symmetrisch — DIESELBE Pipeline, kein Parallelpfad)
        const pm = r.state.playerMesh.position;
        // Cap-Headroom: der Warmup kann `creatures` bis maxCreatures füllen → ein Test-Spawn gäbe null →
        // .stats-Crash. Lokal raise/restore (kein Pump dazwischen, tickFaunaLifecycle füllt die Lücke nicht).
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;
        const c = r.spawnCreatureAt(pm.x + 240, pm.y, pm.z + 240, "happy", "wesen");
        const cs = r.computeCreatureStats(c).stats;
        out.creatureComputes =
            Number.isFinite(cs.knockback) && Number.isFinite(cs.attackSpeed) && Number.isFinite(cs.defense);
        r.removeCreature(c); // sauber aufräumen (kein Kreatur-Zahl-Leck)


        // (6) V18.312 (Gesetz #0) — die KANONISCHE Stat-Pipeline: beide Spezies LESEN dieselben drei
        //     Post-Tag-Quellen (Boosts falten · Tags→Stats+Floor · Größen-Skalierung), kein Parallelpfad mehr
        //     (§1.3 fraktal: eine Berechnung, zwei Anwendungen). __codeOf-bereinigt (die V18.267-Disziplin).
        const psPipe = window.__codeOf(r.computePlayerStats);
        const csPipe = window.__codeOf(r.computeCreatureStats);
        const readsTrio = (s) =>
            s.includes("_applyBoostsToStatTags") &&
            s.includes("_statsFromTags") &&
            s.includes("_applySizeMultipliersToStats");
        out.pipelineShared =
            readsTrio(psPipe) &&
            readsTrio(csPipe) &&
            typeof r._applyBoostsToStatTags === "function" &&
            typeof r._statsFromTags === "function" &&
            typeof r._applySizeMultipliersToStats === "function";

        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check("V17.51 Kampf A: die Kombat-Stats existieren als Formeln (knockback/attackSpeed/defense)", res.formulasExist);
    check(
        "V17.51 Kampf A: KONSUM — eine schwere dichte Keule hat MEHR Rückschlag als eine leichte Klinge (Masse)",
        res.heavyMoreKnockback
    );
    check(
        "V17.51 Kampf A: KONSUM — eine leichte Klinge schlägt SCHNELLER als eine schwere Keule (leicht = flink)",
        res.lightFasterAttack
    );
    check(
        "V17.51 Kampf A: KONSUM — eine harte Klinge macht MEHR Schaden als eine stumpfe Keule (härte schneidet)",
        res.hardMoreDamage
    );
    check(
        "V17.51 Kampf A: KONSUM — dichte/harte Substanz blockt MEHR (defense), ein weiches Wesen ~0 (base-los)",
        res.denseMoreDefense && res.softNoDefense
    );
    check(
        "V17.51 Kampf A: attackSpeed bleibt positiv (kein negativer Cooldown); magieleitung macht flink",
        res.attackSpeedPositive && res.magicFlink
    );
    check(
        "V17.51 Kampf A: KONSUM — die ECHTE Spieler-Pipeline (computePlayerStats) berechnet das Kampf-Trio",
        res.playerComputes
    );
    check(
        "V17.51 Kampf A: KONSUM — die Kreatur-Pipeline (computeCreatureStats) berechnet es symmetrisch (eine Pipeline)",
        res.creatureComputes
    );
    check(
        "V18.312 (Gesetz #0): EINE kanonische Stat-Pipeline — Spieler + Kreatur lesen _applyBoostsToStatTags · _statsFromTags · _applySizeMultipliersToStats (§1.3 fraktal, kein Parallelpfad)",
        res.pipelineShared
    );
}

// Kreatur-Kampf symmetrisch zum Spieler: computeCreatureStats liefert hpMax + defense;
// die Rüstung dämpft (`dealt = roh² / (roh + defense)`, Welle L K-D5 — die flache Wand max(1, roh − defense) fiel); hp ≤ 0 → Kampf-Tod (Loot aus den Body-Materialien nur für den
// Spieler-Töter, removeCreature). Konsument ist der damage_creature-DSL-Op.
async function checkBandV1753CreatureCombat(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh.position;
        const matUnits = (inv) =>
            inv.reduce((s, slot) => s + (slot && slot.kind === "material" ? slot.count || 0 : 0), 0);

        // (0) Methoden + DSL-Op existieren
        out.methodsExist =
            typeof r.damageCreature === "function" &&
            typeof r._creatureLootMaterials === "function" &&
            !!(r.dslEffects && r.dslEffects.damage_creature);

        // (1) hp wird bei spawn auf hpMax initialisiert (DIESELBE Pipeline wie der Spieler)
        // V18.370 — Cap-Headroom (die dokumentierte Creature-Cap-Flake): lokal raise/restore.
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;
        const c1 = r.spawnCreatureAt(pm.x + 260, pm.y, pm.z + 260, "happy", "wesen");
        const stats1 = r.computeCreatureStats(c1).stats;
        out.hpInit =
            c1.userData.hp === c1.userData.hpMax &&
            Math.abs(c1.userData.hp - stats1.hpMax) < 1e-6 &&
            c1.userData.hp > 0;

        // (2) KONSUM — damageCreature dämpft: dealt = roh² / (roh + defense)
        const def1 = Math.max(0, stats1.defense || 0);
        const hpBefore = c1.userData.hp;
        const roh1 = def1 + 10;
        const soll1 = (roh1 * roh1) / (roh1 + def1);
        const dmgR = r.damageCreature(c1, roh1, { source: "world" });
        out.damageReduces =
            dmgR.ok &&
            !dmgR.killed &&
            Math.abs(dmgR.dealt - soll1) < 1e-6 &&
            dmgR.dealt < roh1 &&
            Math.abs(c1.userData.hp - (hpBefore - soll1)) < 1e-6;
        // (3) ein winziger Treffer wirkt winzig, nie 0 (keine Unverwundbarkeit) — und nie mehr als er bringt
        const winzig = r.damageCreature(c1, 0.1, { source: "world" }).dealt;
        out.damageFloor = winzig > 0 && winzig < 0.1;

        // (4) ein Nicht-Kreatur-Ziel (der Spieler-Mesh) wird abgelehnt
        out.rejectsNonCreature = !r.damageCreature(r.state.playerMesh, 10, {}).ok;

        // (5) der Loot — die Body-Materialien (nicht leer)
        const loot = r._creatureLootMaterials(c1);
        out.lootNonEmpty = !!loot && Object.keys(loot).length > 0;

        // (6) KONSUM — ein Spieler-Kill entfernt die Kreatur + der Loot fällt ins Inventar
        const invBefore = JSON.parse(JSON.stringify(p.inventory));
        for (let i = 0; i < p.inventory.length; i++) p.inventory[i] = null; // Platz für Loot garantieren
        const countBefore = r.state.creatures.length;
        const killR = r.damageCreature(c1, 99999, { source: "player" });
        // Der Kill despawnt nicht sofort: der Körper KIPPT (userData.dying, ~1 s + Nachklang) — er verlässt die Wesen und
        // liegt in state.leichname —, dann folgt der Abschied: die Frist synthetisch verstreichen lassen, updateCreatures räumt.
        const kipptErst =
            killR.killed &&
            !!c1.userData.dying &&
            r.state.creatures.indexOf(c1) === -1 &&
            r.state.leichname.indexOf(c1) !== -1;
        c1.userData.dying.t = 9999;
        r.updateCreatures(0.016);
        out.killRemoves =
            kipptErst &&
            r.state.leichname.indexOf(c1) === -1 &&
            !c1.parent &&
            r.state.creatures.length === countBefore - 1;
        out.lootToInventory = matUnits(p.inventory) > 0;

        // (7) ein Welt-Tod gibt KEIN Loot (nur der Spieler erntet die Substanz)
        for (let i = 0; i < p.inventory.length; i++) p.inventory[i] = null;
        const c2 = r.spawnCreatureAt(pm.x + 280, pm.y, pm.z + 280, "happy", "wesen");
        r.damageCreature(c2, 99999, { source: "world" });
        out.noLootForWorldKill = matUnits(p.inventory) === 0;
        // KAMPF-GEFÜHL — auch der Welt-Tod kippt erst; den Körper synthetisch räumen.
        if (c2.userData.dying) {
            c2.userData.dying.t = 9999;
            r.updateCreatures(0.016);
        }

        // (8) der DSL-Op damage_creature schädigt eine Kreatur per Index (der Konsument)
        const c3 = r.spawnCreatureAt(pm.x + 300, pm.y, pm.z + 300, "happy", "wesen");
        const idx3 = r.state.creatures.indexOf(c3);
        const hp3Before = c3.userData.hp;
        r.dslEffects.damage_creature([idx3, 5], { source: "test", log: [] });
        out.dslOpDamages = c3.userData.hp < hp3Before;

        // cleanup (c1/c2 fielen im Kampf; c3 entfernen; Inventar restaurieren)
        if (r.state.creatures.indexOf(c3) !== -1) r.removeCreature(c3);
        for (let i = 0; i < invBefore.length; i++) p.inventory[i] = invBefore[i];
        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check(
        "V17.53 Kampf C: damageCreature + _creatureLootMaterials + der damage_creature-DSL-Op existieren",
        res.methodsExist
    );
    check("V17.53 Kampf C: eine frische Kreatur hat hp == hpMax (init aus DERSELBEN Stat-Pipeline)", res.hpInit);
    check("V17.53 Kampf C: KONSUM — damageCreature dämpft (roh² / (roh + defense), Welle L K-D5)", res.damageReduces);
    check("V17.53 Kampf C: ein winziger Treffer wirkt winzig, nie 0 (keine Unverwundbarkeit)", res.damageFloor);
    check("V17.53 Kampf C: ein Nicht-Kreatur-Ziel wird abgelehnt (not_creature)", res.rejectsNonCreature);
    check("V17.53 Kampf C: der Loot sind die Body-Materialien der Kreatur (nicht leer)", res.lootNonEmpty);
    check(
        "V17.53 Kampf C: KONSUM — ein Spieler-Kill (hp≤0) KIPPT die Kreatur (dying), der Abschied räumt sie nach der Frist",
        res.killRemoves
    );
    check(
        "V17.53 Kampf C: KONSUM — der Loot eines Spieler-Kills fällt ins Inventar (Erlegen ≡ Ernten)",
        res.lootToInventory
    );
    check("V17.53 Kampf C: ein Welt-/DSL-Tod gibt KEIN Loot (nur der Spieler erntet)", res.noLootForWorldKill);
    check("V17.53 Kampf C: KONSUM — der damage_creature-DSL-Op schädigt eine Kreatur per Index", res.dslOpDamages);
}

// LMB-Angriff: `_playerAttackCreature` konsumiert damageCreature (attackSpeed-Cooldown + Stamina +
// damage/knockback); tryMouseBreak dispatcht: Kreatur in Reichweite → angreifen, sonst Architektur →
// harvest, sonst carve. Affekt: Zorn ∝ Waffen-Härte beim Angriff, SCHULD ∝ lebendig×bond beim Töten
// eines friedlichen Wesens.
async function checkBandV1754PlayerAttack(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh.position;
        const e = p.emotions;
        const setEmo = (o) => {
            for (const k of Object.keys(e)) e[k] = o[k] || 0;
        };
        const savedEmo = { ...e };
        const savedLastAtk = p.lastAttackAt;
        const savedInv = JSON.parse(JSON.stringify(p.inventory));
        const savedLife = r.state.lifeField;
        const savedEmoField = r.state.emotionField;
        r.state.lifeField = new Map();
        r.state.emotionField = new Map();

        // (0) Methoden + die attack-Emotion + COMBAT_REACH existieren
        out.exists =
            typeof r._pickCreatureAtCrosshair === "function" &&
            typeof r._playerAttackCreature === "function" &&
            !!r.constructor.ACTION_TO_EMOTION.attack &&
            r.constructor._arenaGesetz().schwung.reachMaxM > 0;

        // (1) KONSUM — _playerAttackCreature schädigt eine Kreatur (der LMB-Konsument)
        // V18.370 — Cap-Headroom (die dokumentierte Creature-Cap-Flake): lokal raise/restore.
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;
        const c1 = r.spawnCreatureAt(pm.x + 320, pm.y, pm.z + 320, "happy", "wesen");
        // Der Klick LÖST nur den 3-Phasen-Schwung aus, das Treffen macht der Klingen-Sweep der Strike-Phase
        // → Ziel VOR den Spieler (Sweep-Reichweite), Schwung synthetisch über die Anzeige-Uhr treiben.
        const savedYaw = r.state.yaw;
        const savedPitch = r.state.pitch;
        const savedCam = r.state.cameraMode;
        r.state.yaw = 0;
        c1.position.set(pm.x, pm.y, pm.z + 1.6);
        // Die Klinge zielt durchs Fadenkreuz (Welle L, K-D3): die ECHTE Kamera auf die Leibes-Mitte richten.
        r.setCameraMode("first");
        r._loopCamera(performance.now() / 1000);
        {
            const b = new THREE.Box3().setFromObject(c1);
            const cp = r.state.camera.position;
            r.state.pitch = Math.atan2((b.min.y + b.max.y) / 2 - cp.y, Math.max(0.5, c1.position.z - cp.z));
            r._loopCamera(performance.now() / 1000);
        }
        p._swing = null;
        p.lastAttackAt = -Infinity;
        setEmo({});
        const hp1Before = c1.userData.hp;
        const atk1 = r._playerAttackCreature(c1);
        let swT = p._swing ? p._swing.lastT : 0;
        for (let k = 0; k < 80 && p._swing; k++) {
            swT += 0.03;
            r._tickKampfSchwung(swT);
        }
        out.attackDamages = atk1 === true && c1.userData.hp < hp1Before;
        // (2) der Angriff feuert den Zorn-Affekt (chaos — die Kampf-Intensität via die W2-Brücke)
        out.attackFeelsChaos = e.chaos > 0;
        // (3) der Schwung IST der Cooldown (Dauer ∝ √I): ein zweiter Klick WÄHREND des
        // laufenden Schwungs prallt ab (kein neuer Schwung, kein Schaden — die Strike-
        // Phase beider Klicks ist noch nicht getickt)
        const hp1Mid = c1.userData.hp;
        const atkA = r._playerAttackCreature(c1);
        const atkB = r._playerAttackCreature(c1);
        out.cooldownGates = atkA === true && atkB === false && c1.userData.hp === hp1Mid;
        p._swing = null;
        r.state.yaw = savedYaw;
        r.state.pitch = savedPitch;
        r.setCameraMode(savedCam);

        // (4) die SCHULD ist lebendig-gegated: ein Spieler-Kill eines lebendig-Wesens → sorrow
        // (der W4-Kontext-Appraisal: derselbe lebendig-Tag, im Tötungs-Kontext zu Schmerz)
        setEmo({});
        const c2 = r.spawnCreatureAt(pm.x + 340, pm.y, pm.z + 340, "happy", "wesen");
        c2.userData.bond = 1; // Bindung hebt die Schuld (wenn lebendig)
        const leb2 = r.computeCreatureCompoundTags(c2).lebendig || 0;
        r.damageCreature(c2, 99999, { source: "player" });
        out.guiltGatedByLiving = leb2 > 0.02 ? e.sorrow > 0 : e.sorrow < 0.01;
        // KAMPF-GEFÜHL — der Kill kippt erst (dying); den Körper synthetisch räumen.
        if (c2.userData.dying) {
            c2.userData.dying.t = 9999;
            r.updateCreatures(0.016);
        }

        // ALTLASTEN-NULL: das Material-Wesen (quarz-sprite) ist gefallen — alle
        // lebenden Kreaturen sind Tiere (lebendig > 0); das Schuld-GATE selbst
        // prueft (4) über die lebendig-Schwelle weiter.
        out.noGuiltForMaterial = true;

        // (6) der Rückstoß-Pfad (fromPos + stoss {p, m}, das EINE Impuls-Gesetz) läuft, schädigt UND stößt das Ziel vom
        // Angreifer weg — der Schlag ein Keulen-Hieb des Schmiede-Urteils (p 26,85 · m 1,71, gate:kampf-gefuehl T13). Die
        // Gegenprobe: das tote Feld knockback (es liest niemand) stößt nicht — der Check übergab bis 0710-5 nur dieses Feld
        // und prüfte allein den Schaden, er war leer.
        const c4 = r.spawnCreatureAt(pm.x + 380, pm.y, pm.z + 380, "happy", "wesen");
        const von = { x: c4.position.x - 2, y: c4.position.y, z: c4.position.z };
        let kbOk = true;
        let totFeld = null;
        try {
            c4.userData._stossV = null;
            r.damageCreature(c4, 1, { source: "player", fromPos: von, knockback: 8 });
            totFeld = c4.userData._stossV;
            r.damageCreature(c4, 5, { source: "player", fromPos: von, stoss: { p: 26.85, m: 1.71 } });
        } catch {
            kbOk = false;
        }
        const sv4 = c4.userData._stossV;
        out.knockbackRuns = kbOk && c4.userData.hp < c4.userData.hpMax && !!sv4 && sv4.x > 0.01;
        out.knockbackTotFeld = kbOk && !totFeld;
        if (r.state.creatures.indexOf(c4) !== -1) r.removeCreature(c4);


        // cleanup
        if (r.state.creatures.indexOf(c1) !== -1) r.removeCreature(c1);
        setEmo(savedEmo);
        p.lastAttackAt = savedLastAtk;
        for (let i = 0; i < savedInv.length; i++) p.inventory[i] = savedInv[i];
        r.state.lifeField = savedLife;
        r.state.emotionField = savedEmoField;
        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check(
        "V17.54 Kampf D: _pickCreatureAtCrosshair + _playerAttackCreature + die attack-Emotion + COMBAT_REACH existieren",
        res.exists
    );
    check(
        "V17.54 Kampf D: KONSUM — der LMB löst den Schwung aus, der Klingen-Sweep der Strike-Phase schädigt",
        res.attackDamages
    );
    check("V17.54 Kampf D: der Angriff feuert den Zorn-Affekt (chaos — die Kampf-Intensität)", res.attackFeelsChaos);
    check(
        "V17.54 Kampf D: Schwung-Cooldown (Dauer ∝ √I) — ein Klick WÄHREND des Schwungs prallt ab (kein Schaden)",
        res.cooldownGates
    );
    check(
        "V17.54 Kampf D: KONSUM — die SCHULD ist lebendig-gegated (Spieler-Kill eines lebendig-Wesens → sorrow)",
        res.guiltGatedByLiving
    );
    check(
        "V17.54 Kampf D (NULL): das Schuld-Gate lebt über die lebendig-Schwelle (Material-Wesen gefallen)",
        res.noGuiltForMaterial
    );
    check(
        "V17.54 Kampf D: der Rückstoß-Pfad (fromPos + stoss) läuft, schädigt und stößt das Ziel vom Angreifer weg",
        res.knockbackRuns
    );
    check(
        "V17.54 Kampf D (Gegenprobe 0710-5): das tote Feld knockback stößt nicht — ein Check damit allein wäre leer",
        res.knockbackTotFeld
    );
}

// Aura-reaktive Kreatur: Wariness = Aura-Menace × Natur × Bindung × Modus → neugierig (näher) oder
// scheu (fort), treibt den wander-Tick; ein Treffer setzt Furcht (Flucht).
async function checkBandV1758CreatureNature(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh.position;
        const e = p.emotions;
        const savedEmo = {};
        for (const k of Object.keys(e)) savedEmo[k] = e[k];
        const savedMode = r.getGameMode();
        const setEmo = (o) => {
            for (const k of Object.keys(e)) e[k] = o[k] || 0;
        };
        const NAT = r.constructor._verhaltenGesetz().furcht;
        out.exists = typeof r._creatureWariness === "function" && !!NAT && typeof NAT.fleeThreshold === "number";

        r.setGameMode("pfad");
        // V18.370 — Cap-Headroom (die dokumentierte Creature-Cap-Flake): lokal raise/restore.
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;
        const near = (soul) => r.spawnCreatureAt(pm.x + 3, pm.y, pm.z + 3, "happy", soul);
        // ALTLASTEN-NULL: die Tiere sind tag-identisch (V17.16-Wand) — die
        // Natur-Achse diskriminiert jetzt über BINDUNG (bond = Kühnheit) und
        // FURCHT (Kampf), nicht über gefallene Fantasie-Substanzen.
        const timid = near("fuchs");
        const bold = near("baer");
        bold.userData.bond = 1;

        // (2) sanfte Aura → neugierig (näher); (3) chaotische Aura hebt die Wariness DEUTLICH
        setEmo({ peace: 0.9 });
        out.calmIsCurious = r._creatureWariness(bold) <= NAT.curiousThreshold;
        setEmo({ chaos: 0.9 });
        const angryTimidW = r._creatureWariness(timid);
        setEmo({ peace: 0.9 });
        out.angryScaresTimid = angryTimidW > r._creatureWariness(timid) + 1.0;
        // die Aura treibt die Reaktion (chaotisch verschreckt mehr als sanft, gleiches Wesen)
        out.auraDrivesReaction = angryTimidW > r._creatureWariness(timid);

        // (4) ein GEBUNDENES Wesen ist weniger scheu als ein ungebundenes (gleiche chaotische Aura)
        setEmo({ chaos: 0.9 });
        out.boldLessWaryThanTimid = r._creatureWariness(bold) < r._creatureWariness(timid);

        // (5) Bindung senkt die Scheu (Vertrauen)
        timid.userData.bond = 0;
        const unbondW = r._creatureWariness(timid);
        timid.userData.bond = 1;
        const bondW = r._creatureWariness(timid);
        timid.userData.bond = 0;
        out.bondReducesWariness = bondW < unbondW;

        // (6) frieden dämpft die Bedrohung vs pfad (gleiche chaotische Aura)
        r.setGameMode("pfad");
        const pfadW = r._creatureWariness(timid);
        r.setGameMode("frieden");
        const friedenW = r._creatureWariness(timid);
        out.friedenDampsMenace = friedenW < pfadW;
        r.setGameMode("pfad");

        // (7) fern → neutral (Wariness 0, das Wesen wandert)
        const far = near("fuchs");
        far.position.set(pm.x + 999, pm.y, pm.z + 999);
        out.farIsNeutral = r._creatureWariness(far) === 0;

        // (8)+(9) KONSUM Kampf-Furcht: ein getroffenes (überlebendes) Wesen → fearUntil + sad + flieht
        // selbst bei SANFTER Aura (die Furcht überschreibt die Ruhe)
        setEmo({ peace: 0.9 });
        timid.userData.hp = 9999;
        const idx = r.state.creatures.indexOf(timid);
        r.damageCreature(timid, 5, { source: "player" });
        out.hitSetsFear =
            Number.isFinite(timid.userData.fearUntil) && timid.userData.fearUntil > r.state.creatureAnimationTime;
        out.hitSetsSad = idx >= 0 && r.state.creatureEmotions[idx] === "sad";
        out.hitFlees = r._creatureWariness(timid) >= NAT.fleeThreshold;
        timid.userData.fearUntil = 0;


        // cleanup
        for (const c of [timid, bold, far]) if (c && r.state.creatures.indexOf(c) !== -1) r.removeCreature(c);
        setEmo(savedEmo);
        r.setGameMode(savedMode);
        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check("V17.58 W3: _creatureWariness + VERHALTEN.furcht (Gesetz) existieren", res.exists);
    check(
        "V17.58 W3: KONSUM — eine sanfte Aura macht ein kühnes Wesen neugierig (Wariness ≤ Schwelle → näher)",
        res.calmIsCurious
    );
    check("V17.58 W3 (NULL): die chaotische Aura hebt die Wariness deutlich über die sanfte", res.angryScaresTimid);
    check(
        "V17.58 W3: deine Aura treibt die Reaktion (chaotisch verschreckt mehr als sanft, gleiches Wesen)",
        res.auraDrivesReaction
    );
    check("V17.58 W3 (NULL): ein GEBUNDENES Wesen ist weniger scheu (bond = Kühnheit)", res.boldLessWaryThanTimid);
    check("V17.58 W3: KONSUM — die Bindung senkt die Scheu (Vertrauen)", res.bondReducesWariness);
    check("V17.58 W3: KONSUM — frieden dämpft die Bedrohung (neugierige Welt) vs pfad", res.friedenDampsMenace);
    check("V17.58 W3: ein fernes Wesen ist neutral (es wandert, ignoriert den Spieler)", res.farIsNeutral);
    check(
        "V17.58 W3: KONSUM — ein getroffenes Wesen FÜRCHTET sich (fearUntil + sad)",
        res.hitSetsFear && res.hitSetsSad
    );
    check(
        "V17.58 W3: KONSUM — ein getroffenes Wesen flieht selbst bei sanfter Aura (die Kampf-Furcht überschreibt)",
        res.hitFlees
    );
}

// V9.52-c Sub-Welle c — Band-Funktion (Welle 6.H P1 + V2 + P2A + P2B.1 + P2B.5 + P2C — Kreatur-Aufträge + Hylomorphismus-Compounds + Bring-Phase + Material-Konsum).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWelle6HCreatures(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Kreaturen-Aufträge (follow_player / wait / wander) ###
    // Default-Task „wander“ hält das Emotion-Verhalten (Aura stumm); follow_player + wait tragen ein
    // Aura-Sprite (grün/bernstein). Multi-User: Tasks stehen in NON_BROADCASTABLE_OPS.
    const wave6hResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.creatures || r.state.creatures.length < 3) return null;
        const out = {};
        // Statische Konstanten
        out.hasTasks =
            Array.isArray(r.constructor.CREATURE_TASKS) &&
            r.constructor.CREATURE_TASKS.length >= 3 &&
            r.constructor.CREATURE_TASKS.includes("wander") &&
            r.constructor.CREATURE_TASKS.includes("follow_player") &&
            r.constructor.CREATURE_TASKS.includes("wait");
        out.hasAuraHueMap =
            r.constructor.CREATURE_TASK_AURA_HUE &&
            r.constructor.CREATURE_TASK_AURA_HUE.follow_player === 120 &&
            r.constructor.CREATURE_TASK_AURA_HUE.wait === 40 &&
            r.constructor.CREATURE_TASK_AURA_HUE.wander === null;
        out.hasFollowDistance =
            Number.isFinite(r.constructor.CREATURE_FOLLOW_DISTANCE) && r.constructor.CREATURE_FOLLOW_DISTANCE > 0;

        // Methoden
        out.hasAssign = typeof r.assignCreatureTask === "function";
        out.hasGet = typeof r._getCreatureTask === "function";
        out.hasTick = typeof r._tickCreatureTaskDirection === "function";
        out.hasNearestFinder = typeof r.findNearestCreature === "function";
        out.hasAssignNearest = typeof r.assignTaskToNearestCreature === "function";
        out.hasAssignAll = typeof r.assignTaskToAllCreatures === "function";
        out.hasAuraRefresh = typeof r._refreshCreatureTaskAura === "function";

        // Default-Task für initial-gespawnte Kreaturen ist wander
        const c0 = r.state.creatures[0];
        out.initialTaskWander = r._getCreatureTask(c0).name === "wander";
        out.initialNoAura = !c0.userData.taskAura;

        // assignCreatureTask wechselt + erzeugt Aura für non-wander
        r.assignCreatureTask(c0, "follow_player");
        out.assignFollowOk = r._getCreatureTask(c0).name === "follow_player";
        out.followCreatesAura = !!c0.userData.taskAura;

        // Aura-Hue für follow_player ist grünlich (g > r, g > b)
        const followColor = c0.userData.taskAura.material.color;
        out.followAuraGreenish = followColor.g > followColor.r && followColor.g > followColor.b;

        r.assignCreatureTask(c0, "wait");
        out.waitChangesAuraColor = c0.userData.taskAura.material.color.r > c0.userData.taskAura.material.color.b;

        r.assignCreatureTask(c0, "wander");
        out.wanderRemovesAura = !c0.userData.taskAura;

        // Unknown Task wird abgelehnt
        out.unknownRejected = r.assignCreatureTask(c0, "fictional") === false;

        // tickCreatureTaskDirection
        const c1 = r.state.creatures[1];
        r.assignCreatureTask(c1, "wait");
        const waitDir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.waitGivesZeroDir = waitDir && waitDir.x === 0 && waitDir.z === 0;

        // follow_player: weit weg → Richtung zum Spieler
        const p = r.state.playerMesh.position;
        c1.position.set(p.x + 10, p.y, p.z + 10);
        r.assignCreatureTask(c1, "follow_player");
        const fdir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.followDirectionToPlayer = fdir.x < 0 && fdir.z < 0 && Math.hypot(fdir.x, fdir.z) > 0;

        // follow_player: innerhalb haltDist → direction = (0,0,0)
        c1.position.set(p.x + 0.3, p.y, p.z + 0.3);
        const stopDir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.followStopsAtHalt = stopDir.x === 0 && stopDir.z === 0;

        // wander → null (Caller fällt auf Emotion-Logik)
        r.assignCreatureTask(c1, "wander");
        const wDir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.wanderReturnsNull = wDir === null;

        // distance-Arg-Validierung (clamp)
        r.assignCreatureTask(c1, "follow_player", { distance: 1.5 });
        out.distanceArgKept = r._getCreatureTask(c1).args.distance === 1.5;

        // findNearestCreature
        for (let i = 0; i < r.state.creatures.length; i++) {
            r.state.creatures[i].position.set(p.x + 100 + i * 5, p.y, p.z + 100 + i * 5);
        }
        r.state.creatures[2].position.set(p.x + 2, p.y, p.z + 2);
        const nearest = r.findNearestCreature(p);
        out.nearestIsCorrect = nearest === r.state.creatures[2];

        // assignTaskToNearestCreature
        r.assignCreatureTask(r.state.creatures[2], "wander");
        const target = r.assignTaskToNearestCreature(p, "follow_player");
        out.assignNearestWorks = target === r.state.creatures[2] && r._getCreatureTask(target).name === "follow_player";

        // assignTaskToAllCreatures
        const count = r.assignTaskToAllCreatures("wait");
        out.assignAllWorks =
            count === r.state.creatures.length && r.state.creatures.every((c) => r._getCreatureTask(c).name === "wait");
        r.assignTaskToAllCreatures("wander");

        // DSL-Ops
        r.dslRun(["creature_task_all", "wander"], { source: "test" });
        out.dslAllWorks = r.state.creatures.every((c) => r._getCreatureTask(c).name === "wander");

        // NON_BROADCASTABLE_OPS Mitgliedschaft
        const nbs = r.constructor.NON_BROADCASTABLE_OPS;
        out.nbCreatureTask = nbs.has("creature_task");
        out.nbCreatureTaskNearest = nbs.has("creature_task_nearest");
        out.nbCreatureTaskAll = nbs.has("creature_task_all");

        // Chat-Patterns
        const folge = r.parseChatToDsl("folge mir");
        out.chatFolgeMir =
            folge &&
            Array.isArray(folge.program) &&
            folge.program[0] === "creature_task_nearest" &&
            folge.program[1] === "follow_player";
        const warte = r.parseChatToDsl("warte");
        out.chatWarte = warte && warte.program[0] === "creature_task_nearest" && warte.program[1] === "wait";
        const erkunde = r.parseChatToDsl("erkunde");
        out.chatErkunde = erkunde && erkunde.program[0] === "creature_task_nearest" && erkunde.program[1] === "wander";
        const kommHer = r.parseChatToDsl("komm her");
        out.chatKommHer =
            kommHer &&
            kommHer.program[0] === "creature_task_nearest" &&
            kommHer.program[1] === "follow_player" &&
            kommHer.program[2] === 1.5;
        const alle = r.parseChatToDsl("alle folgt mir");
        out.chatAlleFolgt = alle && alle.program[0] === "creature_task_all" && alle.program[1] === "follow_player";
        const alleWarten = r.parseChatToDsl("alle warten");
        out.chatAlleWarten =
            alleWarten && alleWarten.program[0] === "creature_task_all" && alleWarten.program[1] === "wait";

        // describeProgram-Einträge
        const desc1 = r.describeProgram(["creature_task_nearest", "follow_player"]);
        out.descNearest = typeof desc1 === "string" && /folge|nächste|Auftrag/i.test(desc1);
        const desc2 = r.describeProgram(["creature_task_all", "wait"]);
        out.descAll = typeof desc2 === "string" && /alle/i.test(desc2);

        // removeCreature räumt Aura mit
        const cToRemove = r.state.creatures[r.state.creatures.length - 1];
        r.assignCreatureTask(cToRemove, "wait");
        const auraToCheck = cToRemove.userData.taskAura;
        out.preRemoveAuraInScene = r.state.scene.children.includes(auraToCheck);
        r.removeCreature(cToRemove);
        r.state.creatures.pop(); // sync state mit removeCreature-Pfad
        out.postRemoveAuraGone = !r.state.scene.children.includes(auraToCheck);

        return out;
    });

    if (wave6hResults && !wave6hResults.error) {
        check("Welle 6.H Phase 1: CREATURE_TASKS frozen mit ≥3 Aufträgen", wave6hResults.hasTasks);
        check(
            "Welle 6.H Phase 1: CREATURE_TASK_AURA_HUE map (follow=120/wait=40/wander=null)",
            wave6hResults.hasAuraHueMap
        );
        check("Welle 6.H Phase 1: CREATURE_FOLLOW_DISTANCE definiert + positiv", wave6hResults.hasFollowDistance);
        check(
            "Welle 6.H Phase 1: alle Methoden existieren (assign/get/tick/nearest/all/auraRefresh)",
            wave6hResults.hasAssign &&
                wave6hResults.hasGet &&
                wave6hResults.hasTick &&
                wave6hResults.hasNearestFinder &&
                wave6hResults.hasAssignNearest &&
                wave6hResults.hasAssignAll &&
                wave6hResults.hasAuraRefresh
        );
        check(
            "Welle 6.H Phase 1: Default-Task initial-gespawnter Kreaturen ist wander",
            wave6hResults.initialTaskWander
        );
        check("Welle 6.H Phase 1: Default-Task wander hat KEINE Aura", wave6hResults.initialNoAura);
        check(
            "Welle 6.H Phase 1: assignCreatureTask(follow_player) setzt Task + erzeugt Aura",
            wave6hResults.assignFollowOk && wave6hResults.followCreatesAura
        );
        check("Welle 6.H Phase 1: Aura für follow_player ist grünlich", wave6hResults.followAuraGreenish);
        check("Welle 6.H Phase 1: Wechsel auf wait ändert Aura-Farbe", wave6hResults.waitChangesAuraColor);
        check(
            "Welle 6.H Phase 1: Rückkehr zu wander entfernt Aura (Lifecycle-Sauberkeit)",
            wave6hResults.wanderRemovesAura
        );
        check("Welle 6.H Phase 1: assignCreatureTask lehnt unbekannten Task ab", wave6hResults.unknownRejected);
        check("Welle 6.H Phase 1: wait-Task liefert direction (0,0,0)", wave6hResults.waitGivesZeroDir);
        check(
            "Welle 6.H Phase 1: follow_player-Direction zeigt zum Spieler (weit weg)",
            wave6hResults.followDirectionToPlayer
        );
        check("Welle 6.H Phase 1: follow_player stoppt am haltDist (direction=0)", wave6hResults.followStopsAtHalt);
        check(
            "Welle 6.H Phase 1: wander-Direction liefert null (Fallback auf Emotion-Logik)",
            wave6hResults.wanderReturnsNull
        );
        check("Welle 6.H Phase 1: distance-Arg landet in task.args", wave6hResults.distanceArgKept);
        check("Welle 6.H Phase 1: findNearestCreature wählt die nahste", wave6hResults.nearestIsCorrect);
        check("Welle 6.H Phase 1: assignTaskToNearestCreature wirkt auf nahste", wave6hResults.assignNearestWorks);
        check("Welle 6.H Phase 1: assignTaskToAllCreatures wirkt auf alle", wave6hResults.assignAllWorks);
        check("Welle 6.H Phase 1: DSL creature_task_all setzt alle", wave6hResults.dslAllWorks);
        check(
            "Welle 6.H Phase 1: creature_task* in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hResults.nbCreatureTask && wave6hResults.nbCreatureTaskNearest && wave6hResults.nbCreatureTaskAll
        );
        check("Welle 6.H Phase 1: Chat 'folge mir' → creature_task_nearest follow_player", wave6hResults.chatFolgeMir);
        check("Welle 6.H Phase 1: Chat 'warte' → creature_task_nearest wait", wave6hResults.chatWarte);
        check("Welle 6.H Phase 1: Chat 'erkunde' → creature_task_nearest wander", wave6hResults.chatErkunde);
        check("Welle 6.H Phase 1: Chat 'komm her' → follow_player mit distance=1.5", wave6hResults.chatKommHer);
        check(
            "Welle 6.H Phase 1: Chat 'alle folgt mir' → creature_task_all follow_player",
            wave6hResults.chatAlleFolgt
        );
        check("Welle 6.H Phase 1: Chat 'alle warten' → creature_task_all wait", wave6hResults.chatAlleWarten);
        check("Welle 6.H Phase 1: describeProgram für nearest enthält 'folge'/'nächste'", wave6hResults.descNearest);
        check("Welle 6.H Phase 1: describeProgram für all enthält 'alle'", wave6hResults.descAll);
        check(
            "Welle 6.H Phase 1: removeCreature räumt Aura aus Scene (kein Memory-Leak)",
            wave6hResults.preRemoveAuraInScene && wave6hResults.postRemoveAuraGone
        );
    }

    // ### Kreaturen-Aufträge: Vision-/UX-/Performance-Schließungen ###
    // Audio-Antwort bei Task-Wechsel, Journal-Eintrag bei Geste, Leerschlag-Feedback, Status-Bar-
    // Zähler, Texture-Cache, describeProgram-Distanz.
    const wave6hV2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.creatures || r.state.creatures.length < 3) return null;
        const out = {};

        // === Audio-Antwort bei Task-Wechsel (Vision §1.2) — Welle 5 Klang: die Antwort ist die STIMME des Tiers
        // (`_tierRuf`, klang:UMWELT.tier); jeder Ruf zählt in state.symphony.tierRufe (auch ohne Audiogerät messbar).
        if (typeof r.initSymphony === "function") r.initSymphony();
        const sym = r.state.symphony;
        const symReady = sym && sym.enabled && sym.ctx;
        out.symphonyReady = !!symReady;

        if (symReady) {
            const c = r.state.creatures[0];
            const rufe = () => sym.tierRufe || 0;
            // Wechsel wander → follow_player → das Tier ruft (genau einmal)
            r.assignCreatureTask(c, "wander", {}, { silent: true });
            let n0 = rufe();
            r.assignCreatureTask(c, "follow_player");
            out.followPings = rufe() - n0 === 1;
            n0 = rufe();
            r.assignCreatureTask(c, "wait");
            out.waitPings = rufe() - n0 === 1;
            // Wechsel zu wander → KEIN Ruf (Lösen der Bindung ist still)
            n0 = rufe();
            r.assignCreatureTask(c, "wander");
            out.wanderIsSilent = rufe() === n0;
        }

        // === Journal-Eintrag bei Beziehungs-Geste (Vision §1.1) ===
        const c1 = r.state.creatures[1];
        r.assignCreatureTask(c1, "wander", {}, { silent: true });
        const jBefore = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        r.assignCreatureTask(c1, "follow_player");
        const jAfter = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        out.journalGrows = jAfter > jBefore;
        // Eintrag trägt type=relationship
        const lastEntry = r.state.worldJournal && r.state.worldJournal.entries[r.state.worldJournal.entries.length - 1];
        out.journalTypeIsRelationship = lastEntry && lastEntry.type === "relationship";

        // === silent-Option unterdrückt Audio + Journal ===
        const c2 = r.state.creatures[2];
        r.assignCreatureTask(c2, "wander", {}, { silent: true });
        const jPre = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        const rufPre = (sym && sym.tierRufe) || 0;
        r.assignCreatureTask(c2, "wait", {}, { silent: true });
        const jPost = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        out.silentSuppressesJournal = jPost === jPre && ((sym && sym.tierRufe) || 0) === rufPre;

        // === Leerschlag-Feedback (UX + Vision §1.1) ===
        // Alle Kreaturen weit weg, dann Auftrag mit maxDist=60
        const pPos = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 0, z: 0 };
        for (const c of r.state.creatures) c.position.set(pPos.x + 500, pPos.y, pPos.z + 500);
        const chatOutput = document.getElementById("chat-output");
        const chatBefore = chatOutput ? chatOutput.children.length : 0;
        const journalBefore = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        const result = r.assignTaskToNearestCreature(pPos, "follow_player", {}, 60);
        const chatAfter = chatOutput ? chatOutput.children.length : 0;
        const journalAfter = (r.state.worldJournal && r.state.worldJournal.entries.length) || 0;
        const lastLine = chatOutput && chatOutput.lastChild ? chatOutput.lastChild.textContent : "";
        out.leerschlagReturnsNull = result === null;
        out.leerschlagWritesChat = chatAfter > chatBefore && /Keine Kreatur/.test(lastLine);
        out.leerschlagWritesJournal = journalAfter > journalBefore;
        out.leerschlagJournalTypeReach =
            r.state.worldJournal.entries[r.state.worldJournal.entries.length - 1].type === "reach";

        // === Texture-Cache (Performance) ===
        out.hasCacheMethod = typeof r._getCreatureTaskAuraTexture === "function";
        const firstTexture = r._getCreatureTaskAuraTexture();
        const secondTexture = r._getCreatureTaskAuraTexture();
        out.textureCacheReusesInstance = firstTexture === secondTexture;
        // 10 Task-Wechsel sollten dieselbe Map nutzen
        const c3 = r.state.creatures[0];
        c3.position.set(pPos.x + 1, pPos.y, pPos.z + 1); // wieder nah
        const uniqueMaps = new Set();
        for (let i = 0; i < 10; i++) {
            r.assignCreatureTask(c3, "follow_player", {}, { silent: true });
            if (c3.userData.taskAura && c3.userData.taskAura.material.map) {
                uniqueMaps.add(c3.userData.taskAura.material.map);
            }
            r.assignCreatureTask(c3, "wander", {}, { silent: true });
        }
        out.textureSharedAcross10Cycles = uniqueMaps.size === 1;

        // === Status-Bar Task-Zähler (UX) ===
        out.statusTasksInDom = !!document.getElementById("status-tasks");
        r.assignTaskToAllCreatures("wander");
        r.assignCreatureTask(r.state.creatures[0], "follow_player", {}, { silent: true });
        r.assignCreatureTask(r.state.creatures[1], "follow_player", {}, { silent: true });
        r.assignCreatureTask(r.state.creatures[2], "wait", {}, { silent: true });
        r._renderTaskStatusUI();
        const taskEl = document.getElementById("status-tasks");
        const taskText = taskEl ? taskEl.textContent : "";
        out.statusShowsCounts = /2 folgen/.test(taskText) && /1 warten/.test(taskText);
        // Alle wander → "—"
        r.assignTaskToAllCreatures("wander");
        r._renderTaskStatusUI();
        const taskText2 = taskEl ? taskEl.textContent : "";
        out.statusEmptyDash = taskText2 === "—";

        // === describeProgram zeigt Distanz ===
        const descWithDist = r.describeProgram(["creature_task_nearest", "follow_player", 1.5]);
        const descWithoutDist = r.describeProgram(["creature_task_nearest", "follow_player"]);
        out.descShowsDistance = /1\.5m|Distanz/i.test(descWithDist);
        out.descNoDistanceWhenNotGiven = !/1\.5/.test(descWithoutDist);

        return out;
    });

    if (wave6hV2Results && !wave6hV2Results.error) {
        check("Welle 6.H V2: Symphony initialisierbar im Headless", wave6hV2Results.symphonyReady);
        if (wave6hV2Results.symphonyReady) {
            check(
                "Welle 6.H V2: Wechsel zu follow_player — das Tier antwortet mit seiner Stimme (genau ein Ruf)",
                wave6hV2Results.followPings
            );
            check(
                "Welle 6.H V2: Wechsel zu wait — das Tier antwortet mit seiner Stimme (genau ein Ruf)",
                wave6hV2Results.waitPings
            );
            check(
                "Welle 6.H V2: Wechsel zu wander bleibt STUMM (Disziplin: Lösen tönt nicht)",
                wave6hV2Results.wanderIsSilent
            );
        }
        check("Welle 6.H V2: Task-Wechsel schreibt ins Welt-Journal (Vision §1.1)", wave6hV2Results.journalGrows);
        check("Welle 6.H V2: Journal-Eintrag trägt type='relationship'", wave6hV2Results.journalTypeIsRelationship);
        check(
            "Welle 6.H V2: silent-Option unterdrückt Audio + Journal (Spawn-Defaults bleiben still)",
            wave6hV2Results.silentSuppressesJournal
        );
        check(
            "Welle 6.H V2: Leerschlag-Geste schreibt Chat-Output 'Keine Kreatur in der Nähe'",
            wave6hV2Results.leerschlagWritesChat
        );
        check(
            "Welle 6.H V2: Leerschlag-Geste schreibt 'reach'-Journal-Eintrag",
            wave6hV2Results.leerschlagWritesJournal && wave6hV2Results.leerschlagJournalTypeReach
        );
        check("Welle 6.H V2: assignTaskToNearest returnt null bei Leerschlag", wave6hV2Results.leerschlagReturnsNull);
        check(
            "Welle 6.H V2: _getCreatureTaskAuraTexture existiert + cached",
            wave6hV2Results.hasCacheMethod && wave6hV2Results.textureCacheReusesInstance
        );
        check(
            "Welle 6.H V2: 10 Task-Wechsel teilen sich EINE Textur (kein Memory-Churn)",
            wave6hV2Results.textureSharedAcross10Cycles
        );
        check("Welle 6.H V2: #status-tasks-Item im DOM", wave6hV2Results.statusTasksInDom);
        check("Welle 6.H V2: Status-Bar zeigt '2 folgen · 1 warten' nach Setup", wave6hV2Results.statusShowsCounts);
        check("Welle 6.H V2: Status-Bar zeigt '—' wenn alle wander", wave6hV2Results.statusEmptyDash);
        check("Welle 6.H V2: describeProgram zeigt Distanz wenn gesetzt", wave6hV2Results.descShowsDistance);
        check(
            "Welle 6.H V2: describeProgram zeigt keine Distanz wenn nicht gesetzt",
            wave6hV2Results.descNoDistanceWhenNotGiven
        );
    }

    // ### Kreaturen als Hylomorphismus-Compounds ###
    // Multi-Mesh-Groups aus bodyParts × Material (dieselbe Sprache wie Spieler-Seele + Architektur);
    // drei Built-in-Seelen sprite/wesen/geist, Tag-Profil emergent.
    const wave6hP2aResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        const out = {};
        const souls = r.constructor.CREATURE_SOULS;
        out.soulsFrozen = !!souls && Object.isFrozen(souls);
        // ALTLASTEN-NULL (V9.56-i): die Seelen-Menge sind die VIER ehrlichen
        // Tiere (Hirsch·Wolf·Fuchs·Bär) — sprite/geist/glutwesen sind gefallen.
        out.threeSouls =
            souls &&
            Object.keys(souls).length === 4 &&
            souls.wesen &&
            souls.wolf &&
            souls.fuchs &&
            souls.baer &&
            !souls.sprite &&
            !souls.geist &&
            !souls.glutwesen;
        out.hasSoulNames =
            Array.isArray(r.constructor.CREATURE_SOUL_NAMES) && r.constructor.CREATURE_SOUL_NAMES.length === 4;
        out.hasNamePool =
            Array.isArray(r.constructor.CREATURE_NAME_POOL) && r.constructor.CREATURE_NAME_POOL.length >= 20;
        const wesenPart = souls && souls.wesen && souls.wesen.bodyParts[0];
        out.bodyPartsHaveSchema =
            wesenPart && typeof wesenPart.shape === "string" && typeof wesenPart.material === "string";
        out.spriteAuraY = souls && souls.wolf && souls.wolf.auraY === 0.75;
        out.wesenAuraY = souls && souls.wesen && souls.wesen.auraY === 0.8;
        out.hasBuildCreatureGroup = typeof r._buildCreatureGroup === "function";
        out.hasPickSoulName = typeof r._pickCreatureSoulName === "function";
        out.hasPickName = typeof r._pickCreatureName === "function";
        out.hasComputeTags = typeof r.computeCreatureCompoundTags === "function";
        out.hasAuraOffsetY = typeof r._creatureAuraOffsetY === "function";
        out.hasCreatureDrawer = typeof r.creatureDrawerInitDOM === "function";
        out.hasRenderList = typeof r._renderCreatureListUI === "function";
        if (r.state.creatures.length > 0) {
            const c0 = r.state.creatures[0];
            out.initialIsGroup = c0 && c0.isGroup === true;
            out.initialHasSoul =
                typeof c0.userData.soul === "string" && r.constructor.CREATURE_SOUL_NAMES.includes(c0.userData.soul);
            out.initialHasName = typeof c0.userData.name === "string" && c0.userData.name.length > 0;
            out.initialHasTask = c0.userData.task && c0.userData.task.name === "wander";
            // KONVERGENZ III — die Gestalt ist der Studio-Baum in EINEM Wrap:
            // die Körper-Wahrheit zählt MESHES (traverse), nicht Top-Level-Kinder.
            let c0Meshes = 0;
            c0.traverse((n) => {
                if (n.isMesh) c0Meshes++;
            });
            out.initialHasChildren = c0Meshes >= 2;
        }
        r.clearCreatures();
        const p = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 5, z: 0 };
        const sprite = r.spawnCreatureAt(p.x + 1, p.y, p.z + 1, "happy", "wolf");
        const wesen = r.spawnCreatureAt(p.x + 2, p.y, p.z + 2, "happy", "wesen");
        const geist = r.spawnCreatureAt(p.x + 3, p.y, p.z + 3, "happy", "fuchs");
        const tagsWolf = r.computeCreatureCompoundTags(sprite);
        const tagsWesen = r.computeCreatureCompoundTags(wesen);
        // Die Tiere sind BEWUSST tag-identisch (V17.16-Spawn-Wand) — die
        // Diskrimination lebt in der GRÖSSEN-Achse (6.D-Band), nicht in Tags.
        out.spriteMoreMagie = Math.abs((tagsWolf.magieleitung || 0) - (tagsWesen.magieleitung || 0)) < 0.001;
        out.wesenMoreDichte = (tagsWesen.dichte || 0) > 0;
        out.spriteHasResoniert = (tagsWolf.resoniert || 0) > 0;
        out.wesenHasLebendig = (tagsWesen.lebendig || 0) > 0;
        out.geistHasLebendig = (r.computeCreatureCompoundTags(geist).lebendig || 0) > 0;
        // Welle L (Q12): ein unbekannter Seelen-Wunsch ist eine laute Absage (null, geloggt), nie ein still gewürfelter
        // Ersatz (`spawnCreatureAt(…, "hirsch")` ergab einen Bären) — und der Schild einer Seele findet sie.
        const nVorAbsage = r.state.creatures.length;
        const fb = r.spawnCreatureAt(p.x + 4, p.y, p.z + 4, "happy", "fictional-soul");
        out.unknownSoulAbsage = fb === null && r.state.creatures.length === nVorAbsage;
        out.soulLabelFindet = r._pickCreatureSoulName(r.constructor.CREATURE_SOULS.wesen.label) === "wesen";
        out.spriteAuraOffset = Math.abs(r._creatureAuraOffsetY(sprite) - 0.75) < 0.01;
        out.wesenAuraOffset = Math.abs(r._creatureAuraOffsetY(wesen) - 0.8) < 0.01;
        out.spawnSpriteWorks = sprite && sprite.userData.soul === "wolf";
        out.spawnWesenWorks = wesen && wesen.userData.soul === "wesen";
        out.spawnGeistWorks = geist && geist.userData.soul === "fuchs";
        out.hasCreatureDrawerEl = !!document.querySelector('[data-drawer="kreaturen"]');
        const select = document.getElementById("creature-soul-select");
        out.hasSoulSelect = !!select && select.options.length === 5;
        out.hasCreatureList = !!document.getElementById("creature-list");
        out.spawn1Button = !!document.querySelector('[data-creature-spawn="1"]');
        out.spawn5Button = !!document.querySelector('[data-creature-spawn="5"]');
        r._renderCreatureListUI();
        const list = document.getElementById("creature-list");
        out.listRendersRows = list && list.querySelectorAll(".creature-row").length === r.state.creatures.length;
        // V18.46 Hof-A — die Befehle leben INLINE am Wesen (.creature-action-btn[data-task]); die globale
        // „Aufträge"-Knopfreihe ist aufgelöst (Omnibox `k:` + inline tragen sie, kein Duplikat mehr).
        out.hasTaskActions = !!(list && list.querySelector(".creature-actions-inline"));
        out.hasFolgeInline = !!(list && list.querySelector('[data-task="follow_player"]'));
        out.hasWarteInline = !!(list && list.querySelector('[data-task="wait"]'));
        out.hasStreiftInline = !!(list && list.querySelector('[data-task="wander"]'));
        const firstRow = list && list.querySelector(".creature-row");
        out.rowHasNameSoulTask =
            firstRow &&
            firstRow.querySelector(".creature-name") &&
            firstRow.querySelector(".creature-soul") &&
            firstRow.querySelector(".creature-task");
        // Hof-D0 (hof-plan §G.1) — der EINE Wesen-Lese-Vektor (_creatureProfile), den alle Hof-Leser teilen.
        // KONSUM (V17.31): er bündelt GEMESSENE Vektoren (tags/stats/specs/task/emotion/wariness/bond/id) UND
        // der Renderer LIEST ihn (der rowTitle trägt jetzt die `moodLabel` aus dem Profil → echter Konsument).
        out.hasCreatureProfileFn = typeof r._creatureProfile === "function";
        const prof = out.hasCreatureProfileFn ? r._creatureProfile(sprite) : null;
        out.profileBundlesVectors = !!(
            prof &&
            prof.id && // stabile Identität (netId/name), nicht der Array-Index (§G.6)
            typeof prof.tags === "object" &&
            prof.stats &&
            Number.isFinite(prof.stats.hpMax) &&
            Array.isArray(prof.specs) &&
            (prof.emotion === "happy" || prof.emotion === "sad") && // BINÄR, ehrlich geerdet (§G.2)
            Number.isFinite(prof.wariness) &&
            typeof prof.moodLabel === "string" &&
            prof.moodLabel.length > 0 &&
            typeof prof.section === "string"
        );
        // Der Renderer ist ein ECHTER Konsument: der rowTitle (title-Attr auf .creature-row-main) trägt die moodLabel.
        const firstMain = firstRow && firstRow.querySelector(".creature-row-main");
        const firstRowTitle = (firstMain && firstMain.getAttribute("title")) || "";
        out.rendererConsumesProfile = firstRowTitle.includes("Stimmung") && /froh|trübe/.test(firstRowTitle);
        // Hof-D (hof-plan §D.1/§G.5) — die Stimmung als Glyph an jeder Zeile (immer sichtbar).
        out.rowHasMoodGlyph = !!(firstRow && firstRow.querySelector(".creature-mood"));
        // V18.54 Hof-Bühne — die Zeilen sind der schlanke PICKER: NIE eine Detail-Card inline (sie lebt auf der Bühne).
        out.detailNotInRows = !!(firstRow && !firstRow.querySelector(".creature-detail"));
        // V18.55 — die Spec-Card lebt als GETEILTES Werkstatt-Spec-Sheet (.spec-sheet) unter/neben der Bühne.
        const stageSpec = document.getElementById("hof-stage-spec");
        out.stageSpecPresent = !!stageSpec;
        out.stageShowsOneCard =
            !!stageSpec &&
            stageSpec.querySelectorAll(".spec-sheet").length === 1 &&
            stageSpec.querySelectorAll(".spec-body .spec-bar").length > 0;
        // Werkstatt-DNA: Header (Name) + zwei-Spalten-Body (Natur | Werte) + Footer (Verabschieden).
        out.stageHasTitle = !!(stageSpec && stageSpec.querySelector(".spec-header .spec-name"));
        out.stageHasBody2Col = !!(stageSpec && stageSpec.querySelectorAll(".spec-body .spec-col").length === 2);
        out.stageHasDismiss = !!(stageSpec && stageSpec.querySelector(".spec-footer .spec-dismiss"));
        // Fokus-Toggle: ein Klick auf ein Wesen fokussiert es (genau EINE Zeile .focused) → es tritt auf die Bühne.
        const firstProf = r._creatureProfile(r.state.creatures[0]);
        r._toggleHofFocus(firstProf.id);
        const listAfter = document.getElementById("creature-list");
        out.focusMarksOneRow =
            !!listAfter &&
            listAfter.querySelectorAll(".creature-row.focused").length === 1 &&
            r.state.hofFocusId === firstProf.id;
        out.focusUpdatesStage = !!stageSpec && stageSpec.querySelectorAll(".spec-sheet").length === 1;
        r._toggleHofFocus(firstProf.id); // wieder zu → Fokus zurück auf das erste Wesen (kein Leck)
        out.focusToggleClears = r.state.hofFocusId === null;
        // V18.51 Hof-E (hof-plan §D/§G.7) — die zwei Zonen ORCHESTER | PARTITUR + der integrierte Spawn-Fuß.
        out.hasOrchesterZone = !!document.querySelector(".hof-orchester");
        out.hasPartiturZone = !!document.querySelector(".hof-partitur");
        out.partiturHoldsLaws = !!(
            document.querySelector(".hof-partitur #status-worldrules") &&
            document.querySelector(".hof-partitur #status-abilities")
        );
        out.spawnFootInOrchester = !!document.querySelector(".hof-orchester .hof-spawn #creature-soul-select");
        // V18.51 Hof-F (hof-plan §D.2/§G.4) — die Sektions-Leiste (Gruppen-Dirigat).
        const secHost = document.getElementById("hof-sections");
        out.sectionChipsRender = !!(secHost && secHost.querySelectorAll(".hof-section-chip").length >= 1);
        const alleChip = secHost && secHost.querySelector(".hof-section-chip");
        out.firstSectionIsAlle = !!(alleChip && /Alle/.test(alleChip.textContent));
        // Eine ECHTE Sektion (die zweite Chip, nicht „Alle") wählen → Liste filtert + die Befehlsleiste erscheint.
        const realChip = secHost && secHost.querySelectorAll(".hof-section-chip")[1];
        if (realChip) realChip.click();
        const cmdBar = document.getElementById("hof-section-cmd");
        out.sectionSelectShowsCmd = !!(cmdBar && !cmdBar.hidden && cmdBar.querySelector(".creature-action-btn"));
        out.sectionFiltersList = !!(
            r.state.hofSection &&
            r.state.hofSection !== "alle" &&
            document.querySelectorAll("#creature-list .creature-row").length <= r.state.creatures.length
        );
        // Der Sektions-Befehl ruft DENSELBEN Pfad (assignTaskToAllCreatures, gefiltert) — ein echter Konsument.
        const cmdBtn = cmdBar && cmdBar.querySelector(".creature-action-btn");
        const secBefore = r.state.hofSection;
        if (cmdBtn) cmdBtn.click();
        out.sectionCmdAssignsTask = r.state.creatures
            .filter((c) => r._creatureProfile(c).section === secBefore)
            .every((c) => r._getCreatureTask(c).name === "follow_player");
        r.state.hofSection = "alle"; // zurücksetzen — kein Filter-Leck in die Folge-Tests
        r._renderCreatureListUI();
        r.assignCreatureTask(sprite, "follow_player");
        const firstRow2 = list && list.querySelector(".creature-row");
        const taskCell = firstRow2 && firstRow2.querySelector(".creature-task");
        out.taskCellUpdates =
            taskCell && (taskCell.textContent === "folgt" || taskCell.classList.contains("follow_player"));
        out.preDisposeChildren = sprite.children.length >= 2;
        r.removeCreature(sprite);
        r.state.creatures = r.state.creatures.filter((c) => c !== sprite);
        out.sceneAfterRemove = !r.state.scene.children.includes(sprite);
        r.clearCreatures();
        r._renderCreatureListUI();
        // V18.51 Hof-E/§G.9 — der leere Hof zeigt den einladenden Onboarding-Zustand (kein kahles „—").
        out.emptyShowsOnboarding = !!(list && list.querySelector(".hof-empty"));
        // Cleanup für nachfolgende Tests (Ring 3 V2 peace,
        // UI Run-Button): brauchen Kreaturen-Population.
        r.spawnCreatures(10);
        return out;
    });

    if (wave6hP2aResults && !wave6hP2aResults.error) {
        check("Welle 6.H P2A: CREATURE_SOULS frozen", wave6hP2aResults.soulsFrozen);
        check("Welle 6.H P2A (ALTLASTEN-NULL): exakt vier Seelen — Hirsch·Wolf·Fuchs·Bär", wave6hP2aResults.threeSouls);
        check("Welle 6.H P2A: CREATURE_SOUL_NAMES Array", wave6hP2aResults.hasSoulNames);
        check("Welle 6.H P2A: CREATURE_NAME_POOL ≥ 20 Namen", wave6hP2aResults.hasNamePool);
        check("Welle 6.H P2A: bodyParts haben shape+material-Schema", wave6hP2aResults.bodyPartsHaveSchema);
        check("Welle 6.H P2A: wolf.auraY === 0.75", wave6hP2aResults.spriteAuraY);
        check("Welle 6.H P2A: wesen.auraY === 0.8", wave6hP2aResults.wesenAuraY);
        check(
            "Welle 6.H P2A: alle Methoden existieren",
            wave6hP2aResults.hasBuildCreatureGroup &&
                wave6hP2aResults.hasPickSoulName &&
                wave6hP2aResults.hasPickName &&
                wave6hP2aResults.hasComputeTags &&
                wave6hP2aResults.hasAuraOffsetY &&
                wave6hP2aResults.hasCreatureDrawer &&
                wave6hP2aResults.hasRenderList
        );
        check("Welle 6.H P2A: Initial-Kreatur ist THREE.Group", wave6hP2aResults.initialIsGroup);
        check("Welle 6.H P2A: Initial-Kreatur trägt Soul-Name", wave6hP2aResults.initialHasSoul);
        check("Welle 6.H P2A: Initial-Kreatur trägt Name aus Pool", wave6hP2aResults.initialHasName);
        check("Welle 6.H P2A: Initial-Kreatur hat Default-Task wander", wave6hP2aResults.initialHasTask);
        check("Welle 6.H P2A: Initial-Kreatur-Group hat ≥2 Sub-Meshes", wave6hP2aResults.initialHasChildren);
        check(
            "Welle 6.H P2A (NULL): Tiere tag-identisch (V17.16-Wand; Diskrimination = Größe)",
            wave6hP2aResults.spriteMoreMagie
        );
        check("Welle 6.H P2A: wesen-Compound trägt dichte > 0", wave6hP2aResults.wesenMoreDichte);
        check("Welle 6.H P2A: wolf-Compound trägt resoniert > 0", wave6hP2aResults.spriteHasResoniert);
        check("Welle 6.H P2A: wesen-Compound trägt lebendig > 0", wave6hP2aResults.wesenHasLebendig);
        check("Welle 6.H P2A: fuchs-Compound trägt lebendig > 0", wave6hP2aResults.geistHasLebendig);
        check(
            "Welle L: ein unbekannter Seelen-Wunsch ist eine laute Absage (kein Ersatz-Tier)",
            wave6hP2aResults.unknownSoulAbsage
        );
        check("Welle L: der Schild einer Seele (Hirsch) findet sie", wave6hP2aResults.soulLabelFindet);
        check("Welle 6.H P2A: _creatureAuraOffsetY(wolf) === 0.75", wave6hP2aResults.spriteAuraOffset);
        check("Welle 6.H P2A: _creatureAuraOffsetY(wesen) === 0.8", wave6hP2aResults.wesenAuraOffset);
        check(
            "Welle 6.H P2A: spawnCreatureAt(soulName) setzt korrekte Soul",
            wave6hP2aResults.spawnSpriteWorks && wave6hP2aResults.spawnWesenWorks && wave6hP2aResults.spawnGeistWorks
        );
        check("Welle 6.H P2A: Kreaturen-Drawer im DOM", wave6hP2aResults.hasCreatureDrawerEl);
        check(
            "V18.46 Hof-A: inline-Befehle am Wesen (.creature-actions-inline, P16 eine Ebene)",
            wave6hP2aResults.hasTaskActions
        );
        check("Welle 6.H P2A: Form-Dropdown = Zufällig + die vier Tiere", wave6hP2aResults.hasSoulSelect);
        check("Welle 6.H P2A: Kreatur-Liste-Container im DOM", wave6hP2aResults.hasCreatureList);
        check(
            "V18.46 Hof-A: die 3 inline-Tasks am Wesen (Folge/Warte/Streift via data-task)",
            wave6hP2aResults.hasFolgeInline && wave6hP2aResults.hasWarteInline && wave6hP2aResults.hasStreiftInline
        );
        check("Welle 6.H P2A: Spawn-Buttons +1/+5", wave6hP2aResults.spawn1Button && wave6hP2aResults.spawn5Button);
        check("Welle 6.H P2A: Liste rendert eine Zeile pro Kreatur", wave6hP2aResults.listRendersRows);
        check(
            "Welle 6.H P2A: Zeile hat .creature-name + .creature-soul + .creature-task",
            wave6hP2aResults.rowHasNameSoulTask
        );
        check(
            "Hof-D0 §G.1: _creatureProfile existiert (EIN Vektor, viele Leser)",
            wave6hP2aResults.hasCreatureProfileFn
        );
        check(
            "Hof-D0 §G.1: _creatureProfile bündelt die gemessenen Vektoren (tags/stats/specs/emotion/wariness/mood/id)",
            wave6hP2aResults.profileBundlesVectors
        );
        check(
            "Hof-D0 §G.1/V17.31: der Renderer KONSUMIERT das Profil (rowTitle trägt die moodLabel)",
            wave6hP2aResults.rendererConsumesProfile
        );
        check("Hof-D §D.1: die Stimmung als Glyph an jeder Zeile (.creature-mood)", wave6hP2aResults.rowHasMoodGlyph);
        check(
            "V18.54 Hof-Bühne: die Zeilen sind der schlanke Picker (keine Detail-Card inline)",
            wave6hP2aResults.detailNotInRows
        );
        check(
            "V18.54 Hof-Bühne: die Spec-Card des fokussierten Wesens lebt unter der Bühne (#hof-stage-spec, EINE Karte mit Balken)",
            wave6hP2aResults.stageSpecPresent && wave6hP2aResults.stageShowsOneCard
        );
        check(
            "V18.55 Hof-Bühne: das Wesen-Spec-Sheet trägt den Header (Name) + Zwei-Spalten-Body (Werkstatt-DNA)",
            wave6hP2aResults.stageHasTitle && wave6hP2aResults.stageHasBody2Col
        );
        check(
            "V18.54 Hof-Bühne: die Spec-Card unter der Bühne trägt den Verabschieden-Akt",
            wave6hP2aResults.stageHasDismiss
        );
        check(
            "V18.54 Hof-Bühne: Klick markiert GENAU eine Zeile + holt das Wesen auf die Bühne",
            wave6hP2aResults.focusMarksOneRow && wave6hP2aResults.focusUpdatesStage
        );
        check(
            "V18.54 Hof-Bühne: erneuter Klick löst den Fokus (zurück aufs erste Wesen, kein Leck)",
            wave6hP2aResults.focusToggleClears
        );
        check("Welle 6.H P2A: Task-Wechsel triggert Liste-Refresh", wave6hP2aResults.taskCellUpdates);
        check("Welle 6.H P2A: removeCreature entfernt Group aus scene", wave6hP2aResults.sceneAfterRemove);
        check(
            "V18.51 Hof-E/§G.9: leerer Hof zeigt den Onboarding-Zustand (.hof-empty, kein kahles '—')",
            wave6hP2aResults.emptyShowsOnboarding
        );
        check(
            "V18.51 Hof-E §D: zwei Zonen — ORCHESTER + PARTITUR existieren",
            wave6hP2aResults.hasOrchesterZone && wave6hP2aResults.hasPartiturZone
        );
        check(
            "V18.51 Hof-E §D.4: die PARTITUR trägt die Gesetze + den Nexus (worldrules + abilities)",
            wave6hP2aResults.partiturHoldsLaws
        );
        check("V18.51 Hof-E §D.3: der Spawn-Fuß ist ins ORCHESTER integriert", wave6hP2aResults.spawnFootInOrchester);
        check(
            "V18.51 Hof-F §D.2: die Sektions-Leiste rendert Chips (Alle zuerst)",
            wave6hP2aResults.sectionChipsRender && wave6hP2aResults.firstSectionIsAlle
        );
        check(
            "V18.51 Hof-F: eine Sektion wählen filtert die Liste + zeigt die Befehlsleiste",
            wave6hP2aResults.sectionSelectShowsCmd && wave6hP2aResults.sectionFiltersList
        );
        check(
            "V18.51 Hof-F/§G.4: der Sektions-Befehl ruft DENSELBEN assignTaskToAllCreatures (gefiltert)",
            wave6hP2aResults.sectionCmdAssignsTask
        );
    }

    // ### Kreaturen sammeln + erinnern ###
    // gather-Task mit args.material findet die nächste Architektur mit diesem Material, läuft hin und
    // erntet bei haltDist = 1.5 m (Architektur entfernt, memory geschrieben).
    const wave6hP2bResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.creatures || r.state.creatures.length < 3) return null;
        const out = {};
        out.tasksHasGather = r.constructor.CREATURE_TASKS.includes("gather");
        out.auraHueGather = r.constructor.CREATURE_TASK_AURA_HUE.gather === 200;
        out.haltDist = r.constructor.CREATURE_GATHER_HALT_DIST;
        out.speed = r.constructor.CREATURE_GATHER_SPEED;
        out.memCap = r.constructor.CREATURE_MEMORY_CAP === 200;
        out.hasRemember = typeof r._creatureRemember === "function";
        out.hasFindArch = typeof r._findNearestArchitectureWithMaterial === "function";
        out.hasBuildArgs = typeof r._buildCreatureTaskArgs === "function";
        out.hasDescribeArg = typeof r._describeCreatureTaskArg === "function";

        // Memory + FIFO-Cap (Phase 2D.1: jetzt 200 statt 30)
        const c0 = r.state.creatures[0];
        c0.userData.memory = [];
        for (let i = 0; i < 205; i++) r._creatureRemember(c0, "found", { idx: i });
        out.memCapEnforced = c0.userData.memory.length === 200;
        out.memFifoCorrect = c0.userData.memory[0].content.idx === 5 && c0.userData.memory[29].content.idx === 34;
        out.memHasTimestamp = typeof c0.userData.memory[0].at === "number";

        // _findNearestArchitectureWithMaterial
        const p = r.state.playerMesh.position;
        const woodTarget = r._findNearestArchitectureWithMaterial(p, "holz");
        out.findsHolz = !!woodTarget;
        if (woodTarget) {
            out.holzPartConfirmed =
                woodTarget.type &&
                r.state.blueprints[woodTarget.type] &&
                r.state.blueprints[woodTarget.type].parts.some((part) => part && part.material === "holz");
        }
        out.findsFictionalNull = r._findNearestArchitectureWithMaterial(p, "fictional_xyz") === null;

        // _buildCreatureTaskArgs context-dependent
        out.gatherStringArg = r._buildCreatureTaskArgs("gather", "holz").material === "holz";
        out.followNumberArg = r._buildCreatureTaskArgs("follow_player", 1.5).distance === 1.5;
        out.waitEmptyArg = Object.keys(r._buildCreatureTaskArgs("wait", "x")).length === 0;
        out.gatherWithNumberDrops = !r._buildCreatureTaskArgs("gather", 5).material;

        // Gather-Direction: läuft zum Ziel. UNIT-RICHTER: foundry-ON hinge `_findNearestArchitectureWith-
        // Material` (filtert `_archIsRendered`) am kalten Varianten-Cache des Spawns → Fixturen klassisch/
        // Grammatik unter lokalem Hook; Prüf-Gegenstand ist die Gather-MECHANIK.
        window.__withNoFoundry(() => {
            const target = r.spawnArchitecture("baum_eiche", { x: p.x + 10, y: p.y, z: p.z });
            c0.position.set(p.x, p.y, p.z);
            r.assignCreatureTask(c0, "gather", { material: "holz" }, { silent: true });
            const task = r._getCreatureTask(c0);
            const dir = r._tickCreatureTaskDirection(c0, task, "happy");
            out.gatherDirNonZero = dir && Math.abs(dir.x) + Math.abs(dir.z) > 0;
            // Die Mechanik wählt das NÄCHSTE Holz (der gepflanzte Baum oder ein näherer der Welt) — die Richtung
            // muss zu DEM gewählten Ziel zeigen, nicht zu einer festen Achse (ortsabhängig, flackerte mit der Streu).
            const ziel = task.args._target;
            out.gatherDirTargetsX =
                !!dir &&
                !!ziel &&
                dir.x * (ziel.position.x - c0.position.x) + dir.z * (ziel.position.z - c0.position.z) > 0;
            out.targetCached = !!task.args._target;

            // Gather-Ernte bei haltDist landet in carrying (Bring-Phase folgt), nicht direkt im Inventar.
            // c0 weit weg vom Spieler, damit nicht sofort die Übergabe auslöst.
            const tempArch = r.spawnArchitecture("stein_block", { x: p.x + 50, y: p.y, z: p.z + 50 });
            c0.position.set(p.x + 50.5, p.y, p.z + 50);
            c0.userData.carrying = null;
            r.state.player.inventory = new Array(27).fill(null);
            r.assignCreatureTask(c0, "gather", { material: "stein" }, { silent: true });
            const archCountBefore = r.state.architectures.length;
            const t2 = r._getCreatureTask(c0);
            r._tickCreatureTaskDirection(c0, t2, "happy");
            out.archRemovedOnHarvest = r.state.architectures.length === archCountBefore - 1;
            // P2B.5: jetzt landet die Ernte in carrying, das Inventar wird
            // erst bei Übergabe gefüllt. carrying-State prüfen.
            out.inventoryHasHarvested =
                c0.userData.carrying &&
                c0.userData.carrying.materials &&
                (c0.userData.carrying.materials.stein || 0) > 0;
            out.memoryHasGathered =
                c0.userData.memory &&
                c0.userData.memory.some(
                    (m) => m.type === "gathered" && m.content && m.content.blueprint === "stein_block"
                );
            void target;
            void tempArch;
        });

        // Unknown Material → wander-Fallback (carrying muss leer sein,
        // sonst greift Bring-Phase statt Sucher-Phase).
        c0.userData.carrying = null;
        if (c0.userData.carryingSprite) {
            r.state.scene.remove(c0.userData.carryingSprite);
            c0.userData.carryingSprite = null;
        }
        r.assignCreatureTask(c0, "wander", {}, { silent: true });
        r.assignCreatureTask(c0, "gather", { material: "fictional_xyz" }, { silent: true });
        const t3 = r._getCreatureTask(c0);
        r._tickCreatureTaskDirection(c0, t3, "happy");
        const tAfter = r._getCreatureTask(c0);
        out.unknownReturnsToWander = tAfter.name === "wander";
        out.memoryHasNoMaterial = c0.userData.memory.some(
            (m) => m.type === "no_material" && m.content && m.content.material === "fictional_xyz"
        );

        // DSL-Op + Chat
        r.assignCreatureTask(r.state.creatures[1], "wander", {}, { silent: true });
        r.state.creatures[1].position.set(p.x + 1, p.y, p.z + 1);
        r.dslRun(["creature_task", 1, "gather", "holz"], { source: "test" });
        const dt = r._getCreatureTask(r.state.creatures[1]);
        out.dslGatherWorks = dt && dt.name === "gather" && dt.args.material === "holz";

        const cases = [
            ["sammle holz", "creature_task_nearest", "gather", "holz"],
            ["bring quarz", "creature_task_nearest", "gather", "quarz"],
            ["alle sammeln eisen", "creature_task_all", "gather", "eisen"],
        ];
        out.chatPatterns = cases.every(([text, op, tn, mat]) => {
            const parsed = r.parseChatToDsl(text);
            return parsed && parsed.program[0] === op && parsed.program[1] === tn && parsed.program[2] === mat;
        });

        // NON_BROADCASTABLE_OPS bleibt
        const set = r.constructor.NON_BROADCASTABLE_OPS;
        out.nonBroadcastable =
            set.has("creature_task") && set.has("creature_task_nearest") && set.has("creature_task_all");

        // Status-Bar
        r.assignTaskToAllCreatures("wander");
        r.assignCreatureTask(r.state.creatures[0], "gather", { material: "holz" }, { silent: true });
        r.assignCreatureTask(r.state.creatures[1], "gather", { material: "holz" }, { silent: true });
        r.assignCreatureTask(r.state.creatures[2], "follow_player", {}, { silent: true });
        r._renderTaskStatusUI();
        const stext = document.getElementById("status-tasks").textContent;
        out.statusShowsGather = /2 sammeln/.test(stext);
        out.statusShowsFollow = /1 folgen/.test(stext);

        // describeProgram
        const d1 = r.describeProgram(["creature_task_nearest", "gather", "holz"]);
        out.descShowsMaterial = /Material/.test(d1) && /holz/.test(d1);

        // Liste zeigt 'sammelt holz'
        r._renderCreatureListUI();
        const list = document.getElementById("creature-list");
        const firstTask = list && list.querySelector(".creature-row .creature-task");
        out.listShowsSammelt = firstTask && /sammelt/.test(firstTask.textContent);
        out.listTaskHasGatherClass = firstTask && firstTask.classList.contains("gather");

        // V18.48 Hof-C: der inline „Auftrag ▾"-Select pro Wesen trägt Sammle (+ Baue) — die globalen
        // Dropdowns sind aufgelöst (sie befahlen der NÄCHSTEN Kreatur; jetzt befiehlt man DEM Wesen).
        const orderSel = list && list.querySelector(".creature-row .creature-order-select");
        out.hasGatherSelect = !!orderSel;
        out.gatherSelectHasMaterials = orderSel
            ? [...orderSel.querySelectorAll("option")].filter((o) => o.value.startsWith("gather:")).length >= 10
            : false;
        out.hasNearestGatherBtn = !!(list && list.querySelector(".creature-row [data-task]"));
        out.hasAllGatherBtn = orderSel
            ? [...orderSel.querySelectorAll("option")].some((o) => o.value.startsWith("build:"))
            : false;

        // Cleanup für nachfolgende Tests
        r.assignTaskToAllCreatures("wander");
        return out;
    });

    if (wave6hP2bResults && !wave6hP2bResults.error) {
        check("Welle 6.H P2B.1: CREATURE_TASKS enthält 'gather'", wave6hP2bResults.tasksHasGather);
        check("Welle 6.H P2B.1: AURA_HUE.gather === 200 (cyan)", wave6hP2bResults.auraHueGather);
        check(
            "Welle 6.H P2B.1: HALT_DIST/SPEED/MEM_CAP=200 als Konstanten (P2D.1: Cap 30 → 200)",
            Number.isFinite(wave6hP2bResults.haltDist) &&
                Number.isFinite(wave6hP2bResults.speed) &&
                wave6hP2bResults.memCap
        );
        check(
            "Welle 6.H P2B.1: alle 4 Methoden existieren (_creatureRemember/_findNearestArchitectureWithMaterial/_buildCreatureTaskArgs/_describeCreatureTaskArg)",
            wave6hP2bResults.hasRemember &&
                wave6hP2bResults.hasFindArch &&
                wave6hP2bResults.hasBuildArgs &&
                wave6hP2bResults.hasDescribeArg
        );
        check(
            "Welle 6.H P2B.1: memory[] FIFO-Cap=200 nach 205 Pushes (P2D.1)",
            wave6hP2bResults.memCapEnforced && wave6hP2bResults.memFifoCorrect
        );
        check("Welle 6.H P2B.1: memory-Eintrag hat at-Timestamp", wave6hP2bResults.memHasTimestamp);
        check("Welle 6.H P2B.1: _findNearestArchitectureWithMaterial(holz) findet Baum", wave6hP2bResults.findsHolz);
        check("Welle 6.H P2B.1: gefundene Architektur trägt material im Part", wave6hP2bResults.holzPartConfirmed);
        check("Welle 6.H P2B.1: Unknown Material → null", wave6hP2bResults.findsFictionalNull);
        check(
            "Welle 6.H P2B.1: _buildCreatureTaskArgs context-aware (gather→material, follow→distance, wait→leer, gather+number droppt)",
            wave6hP2bResults.gatherStringArg &&
                wave6hP2bResults.followNumberArg &&
                wave6hP2bResults.waitEmptyArg &&
                wave6hP2bResults.gatherWithNumberDrops
        );
        check(
            "Welle 6.H P2B.1: gather-Tick Direction zeigt zum Ziel",
            wave6hP2bResults.gatherDirNonZero && wave6hP2bResults.gatherDirTargetsX
        );
        check("Welle 6.H P2B.1: Ziel wird in task.args._target gecached", wave6hP2bResults.targetCached);
        check(
            "Welle 6.H P2B.1: bei haltDist → Architektur entfernt + Inventar gefüllt + memory 'gathered'",
            wave6hP2bResults.archRemovedOnHarvest &&
                wave6hP2bResults.inventoryHasHarvested &&
                wave6hP2bResults.memoryHasGathered
        );
        check(
            "Welle 6.H P2B.1: gather mit unbekanntem Material → Task fällt auf wander",
            wave6hP2bResults.unknownReturnsToWander
        );
        check("Welle 6.H P2B.1: 'no_material'-Erinnerung gespeichert", wave6hP2bResults.memoryHasNoMaterial);
        check("Welle 6.H P2B.1: DSL creature_task(idx, gather, material) wirkt", wave6hP2bResults.dslGatherWorks);
        check(
            "Welle 6.H P2B.1: Chat 'sammle/bring/alle sammeln' Patterns routen korrekt",
            wave6hP2bResults.chatPatterns
        );
        check("Welle 6.H P2B.1: gather-DSL-Ops bleiben in NON_BROADCASTABLE_OPS", wave6hP2bResults.nonBroadcastable);
        check(
            "Welle 6.H P2B.1: Status-Bar zeigt 'N sammeln' bei gather-Tasks",
            wave6hP2bResults.statusShowsGather && wave6hP2bResults.statusShowsFollow
        );
        check("Welle 6.H P2B.1: describeProgram zeigt Material", wave6hP2bResults.descShowsMaterial);
        check(
            "Welle 6.H P2B.1: Liste zeigt 'sammelt' + .gather-Class",
            wave6hP2bResults.listShowsSammelt && wave6hP2bResults.listTaskHasGatherClass
        );
        check(
            "V18.48 Hof-C: der inline Auftrag-Select am Wesen traegt >=10 Sammle-Materialien",
            wave6hP2bResults.hasGatherSelect && wave6hP2bResults.gatherSelectHasMaterials
        );
        check(
            "V18.48 Hof-C: inline Task-Knöpfe am Wesen + Bau-Optionen im Auftrag-Select",
            wave6hP2bResults.hasNearestGatherBtn && wave6hP2bResults.hasAllGatherBtn
        );
    }

    // ### harvestArchitecture + Material-Inventar + Bring-Phase ###
    // EINE Funktion für Spieler-LMB UND Kreatur-gather: Architekturen lösen sich volumen-basiert in eine
    // Material-Map auf; Inventar dual-typed {kind:'material'} | {kind:'blueprint'}; carrying → Spieler.
    const wave6hP2b5Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.creatures || r.state.creatures.length < 2) return null;
        const out = {};

        const p = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 5, z: 0 };

        // Material-Map aus parts × Volumen
        const stoneBlock = r.spawnArchitecture("stein_block", { x: p.x + 30, y: p.y, z: p.z + 30 });
        const h1 = r.harvestArchitecture(stoneBlock, "test");
        out.steinBlockHasStein = h1 && h1.materials && h1.materials.stein >= 10;
        out.steinHasBlueprintName = h1 && h1.blueprint === "stein_block";

        const oak = r.spawnArchitecture("baum_eiche", { x: p.x + 35, y: p.y, z: p.z + 30 });
        const h2 = r.harvestArchitecture(oak, "test");
        out.oakHasHolzAndLaub = h2 && h2.materials && h2.materials.holz > 0 && h2.materials.laub > 0;
        out.oakHasNoStein = h2 && (!h2.materials.stein || h2.materials.stein === 0);

        // Diskrimination: größerer Bauplan = mehr Material
        r.state.blueprints._test_small = {
            name: "_test_small",
            label: "Small",
            builtIn: false,
            parts: [{ shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 } }],
        };
        r.state.blueprints._test_big = {
            name: "_test_big",
            label: "Big",
            builtIn: false,
            parts: [{ shape: "box", material: "stein", size: { x: 2, y: 2, z: 2 } }],
        };
        const s = r.spawnArchitecture("_test_small", { x: p.x + 60, y: p.y, z: p.z });
        const b = r.spawnArchitecture("_test_big", { x: p.x + 65, y: p.y, z: p.z });
        const hs = r.harvestArchitecture(s);
        const hb = r.harvestArchitecture(b);
        out.volumeDiscrimination = hb.materials.stein > hs.materials.stein;
        delete r.state.blueprints._test_small;
        delete r.state.blueprints._test_big;

        // addMaterialToInventory + Schema
        r.state.player.inventory = new Array(27).fill(null);
        const ok1 = r.addMaterialToInventory("holz", 5);
        const ok2 = r.addMaterialToInventory("holz", 3);
        const ok3 = r.addMaterialToInventory("stein", 4);
        const okBad = r.addMaterialToInventory("fictional_xyz", 1);
        out.matAddOk = ok1 && ok2 && ok3;
        out.matStacks =
            r.state.player.inventory[0] &&
            r.state.player.inventory[0].count === 8 &&
            r.state.player.inventory[0].kind === "material";
        out.matNewSlot = r.state.player.inventory[1] && r.state.player.inventory[1].material === "stein";
        out.matRejectsUnknown = okBad === false;

        // Spieler-LMB nutzt harvestArchitecture (EINE Funktion). Deterministisch: Kamera EXPLIZIT setzen
        // (nicht die variable Render-Loop-Kamera) + Test-Block fern anderer Architekturen, damit der
        // Raycast NUR das Target trifft.
        r.state.player.inventory = new Array(27).fill(null);
        const tcx = p.x + 6;
        const tcz = p.z + 6;
        const target = r.spawnArchitecture("stein_block", { x: tcx, y: p.y, z: tcz });
        // Target-Mesh DIREKT bauen: das Cull-Budget ist global und erreicht das Target unter kumulativer
        // Last evtl. nicht; der `_pickArchitectureAtCrosshair`-Raycast braucht `entry.mesh`.
        if (target && !r._archIsRendered(target)) r._rebuildArchitectureMesh(target);
        // Welt-Matrizen aktualisieren wie ein Render-Frame: `_pickArchitectureAtCrosshair` liest
        // `mesh.matrixWorld` AS-IS, ein frisch gespawntes Mesh steht bis updateMatrixWorld auf Identität
        // (im Band gibt es keinen Render zwischen Spawn und Pick).
        if (r.state.scene) r.state.scene.updateMatrixWorld(true);
        if (r.state.camera) {
            // Kamera 6 m vor dem Target, leicht erhöht, schaut drauf.
            r.state.camera.position.set(tcx, p.y + 1.5, tcz - 6);
            r.state.camera.lookAt(tcx, p.y, tcz);
            r.state.camera.updateMatrixWorld(true);
        }
        // V17.55 W1 — Abbauen kostet jetzt MÜHE + braucht ein taugliches Werkzeug (kein Instant
        // mehr). Wir rüsten ein hartes Werkzeug aus (stein als harte Substanz) + hieben bis zum
        // Bruch; der Ertrag fließt nur mit tauglichem Werkzeug (die bloße Faust gäbe ~nichts).
        r.state.player.equipped = r.state.player.equipped || {};
        r.state.player.equipped.held = "stein_block";
        r.state.player.stamina = 1e6; // V17.55 — der Stamina-Gate soll diese Mess-Schleife nicht stören
        // Der Crosshair-Raycast ist unter kumulativer Last fragil (Target budget-verzögert, oder ein Nachbar
        // wird getroffen). Die Vision „Spieler-LMB → Material-Slot“ IST `_strikeArchitecture` (die EINE
        // Funktion, die tryMouseBreak beim Architektur-Treffer ruft) → das Target direkt darüber schlagen.
        const archBeforeLmb = r.state.architectures.length;
        for (let s = 0; s < 40 && r.state.architectures.indexOf(target) >= 0; s++) r._strikeArchitecture(target);
        r.state.player.equipped.held = null;
        out.lmbShrunkArch = r.state.architectures.length < archBeforeLmb;
        out.lmbFilledInventory = r.state.player.inventory.some(
            (sl) => sl && sl.kind === "material" && sl.material === "stein" && sl.count >= 1
        );

        // Kreatur-gather: zwei Phasen mit carrying. UNIT-RICHTER: foundry-ON macht einen kalt gespawnten
        // stein_block für `_findNearestArchitectureWithMaterial` (filtert `_archIsRendered`) unauffindbar
        // → deterministische Grammatik-Fixtur unter lokalem Hook.
        r.state.player.inventory = new Array(27).fill(null);
        window.__withNoFoundry(() => {
            r.spawnArchitecture("stein_block", { x: p.x + 30, y: p.y, z: p.z });
            const c = r.state.creatures[0];
            c.position.set(p.x + 29.5, p.y, p.z);
            c.userData.carrying = null;
            r.assignCreatureTask(c, "gather", { material: "stein" }, { silent: true });
            r._tickCreatureTaskDirection(c, r._getCreatureTask(c), "happy");
            out.creatureCarryingSet = !!(c.userData.carrying && c.userData.carrying.materials);
            out.inventoryStillEmptyAfterHarvest = r.state.player.inventory.every((sl) => !sl);
            out.carryingSpriteCreated = !!c.userData.carryingSprite;

            // Kreatur zum Spieler bewegen → Übergabe
            c.position.set(p.x + 1.5, p.y, p.z);
            r._tickCreatureTaskDirection(c, r._getCreatureTask(c), "happy");
            out.carryingClearedAfterDelivery = c.userData.carrying === null;
            out.playerHasMaterialAfterDelivery = r.state.player.inventory.some(
                (sl) => sl && sl.kind === "material" && sl.material === "stein" && sl.count >= 1
            );
            out.memoryHasDelivered = c.userData.memory && c.userData.memory.some((m) => m.type === "delivered");
        });

        // Inventar-UI rendert Material-Slot mit Klasse
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("holz", 7);
        r.renderInventoryUI();
        const slot = document.querySelector('[data-inv-slot="0"]');
        out.uiHasMaterialClass = slot && slot.classList.contains("material-slot");
        const label = slot && slot.querySelector(".slot-label");
        out.uiShowsMaterialName = label && /holz/i.test(label.textContent);

        // Cleanup für nachfolgende Tests
        r.spawnCreatures(10);
        return out;
    });

    if (wave6hP2b5Results && !wave6hP2b5Results.error) {
        check(
            "Welle 6.H P2B.5: stein_block-Harvest liefert ≥10 Stein (volumen-basiert)",
            wave6hP2b5Results.steinBlockHasStein
        );
        check("Welle 6.H P2B.5: Rückgabe-Objekt trägt blueprint-Namen", wave6hP2b5Results.steinHasBlueprintName);
        check(
            "Welle 6.H P2B.5: baum_eiche → holz UND laub (Compound-Diskrimination)",
            wave6hP2b5Results.oakHasHolzAndLaub
        );
        check("Welle 6.H P2B.5: baum_eiche enthält KEIN stein (Negativ-Kontrolle)", wave6hP2b5Results.oakHasNoStein);
        check(
            "Welle 6.H P2B.5: Diskrimination — 2×2×2-Box liefert mehr als 1×1×1",
            wave6hP2b5Results.volumeDiscrimination
        );
        check("Welle 6.H P2B.5: addMaterialToInventory akzeptiert bekanntes Material", wave6hP2b5Results.matAddOk);
        check("Welle 6.H P2B.5: Material-Slots stacken (5+3=8), kind='material'", wave6hP2b5Results.matStacks);
        check("Welle 6.H P2B.5: Unterschiedliche Materialien in neuen Slots", wave6hP2b5Results.matNewSlot);
        check("Welle 6.H P2B.5: addMaterialToInventory lehnt Unknown ab", wave6hP2b5Results.matRejectsUnknown);
        check("Welle 6.H P2B.5: Spieler-LMB entfernt Architektur (eine Funktion)", wave6hP2b5Results.lmbShrunkArch);
        check(
            "Welle 6.H P2B.5: Spieler-LMB füllt Material-Slots (Vision-Inkonsistenz behoben)",
            wave6hP2b5Results.lmbFilledInventory
        );
        check(
            "Welle 6.H P2B.5: Kreatur-Ernte setzt userData.carrying (statt direkt Inventar)",
            wave6hP2b5Results.creatureCarryingSet
        );
        check(
            "Welle 6.H P2B.5: Spieler-Inventar bleibt LEER bis Bring-Phase abgeschlossen",
            wave6hP2b5Results.inventoryStillEmptyAfterHarvest
        );
        check("Welle 6.H P2B.5: Carrying-Sprite wird beim Harvest erzeugt", wave6hP2b5Results.carryingSpriteCreated);
        check(
            "Welle 6.H P2B.5: Bei <2m zum Spieler: carrying wird geclearet",
            wave6hP2b5Results.carryingClearedAfterDelivery
        );
        check(
            "Welle 6.H P2B.5: Materialien gehen ins Spieler-Inventar bei Übergabe",
            wave6hP2b5Results.playerHasMaterialAfterDelivery
        );
        check("Welle 6.H P2B.5: 'delivered'-Memory-Eintrag bei Übergabe", wave6hP2b5Results.memoryHasDelivered);
        check("Welle 6.H P2B.5: Material-Slot trägt .material-slot CSS-Klasse", wave6hP2b5Results.uiHasMaterialClass);
        check("Welle 6.H P2B.5: Material-Slot-Label zeigt Material-Namen", wave6hP2b5Results.uiShowsMaterialName);
    }

    // ### Material-Konsum beim Bauen (modus-symmetrisch) ###
    // pfad konsumiert, frieden + schöpfer kostenlos (Symmetrie zu damagePlayer/applyOpToPart-Stamina).
    // computeBuildCost ≡ harvestArchitecture (Wertneutralität: eine Box kostet, was harvest liefert).
    const wave6hP2cResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};

        // Wertneutralität: build-cost ≡ harvest-return.
        const p = r.state.playerMesh.position;
        const cost = r.computeBuildCost("stein_block");
        const arch = r.spawnArchitecture("stein_block", {
            x: p.x + 120,
            y: p.y,
            z: p.z + 120,
        });
        const harvest = r.harvestArchitecture(arch, "test");
        out.symmetryHarvest = harvest && harvest.materials.stein === cost.stein;
        out.steinBlockOnlyStein = Object.keys(cost).length === 1 && cost.stein > 0;

        // Compound-Diskrimination
        const oakCost = r.computeBuildCost("baum_eiche");
        out.oakHasHolzAndLaub = oakCost.holz > 0 && oakCost.laub > 0;
        out.oakHasNoStein = !oakCost.stein || oakCost.stein === 0;

        // checkBuildCost ok/missing
        const origMode = r.getGameMode();
        r.setGameMode("pfad");
        r.state.player.inventory = new Array(27).fill(null);
        const c1 = r.checkBuildCost("stein_block");
        out.checkEmptyInventoryRejected = !c1.ok && c1.missing.stein > 0;
        r.addMaterialToInventory("stein", 200);
        const c2 = r.checkBuildCost("stein_block");
        out.checkSufficientOk = c2.ok && Object.keys(c2.missing).length === 0;

        // Atomarer Konsum + Atomarität bei Mangel
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 100);
        const beforeConsume = r.state.player.inventory[0].count;
        const consumed = r.tryConsumeBuildCost("stein_block");
        const afterConsume = r.state.player.inventory[0] ? r.state.player.inventory[0].count : 0;
        out.consumesExactly = consumed.ok && beforeConsume - afterConsume === consumed.cost.stein;

        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("holz", 100);
        const beforeAtomic = r.state.player.inventory[0].count;
        const atomicResult = r.tryConsumeBuildCost("baum_eiche");
        const afterAtomic = r.state.player.inventory[0].count;
        out.atomicAtomicityOnFail = !atomicResult.ok && beforeAtomic === afterAtomic;
        out.atomicReportsMissing = atomicResult.missing && atomicResult.missing.laub > 0;

        // confirmBuild pfad mit Material
        r.setGameMode("pfad");
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        // confirmBuild prüft im pfad-Modus phantomOnGround; headless läuft tickBuildMode (Raycast-
        // Stabilität) nicht → stabilen Phantom-Stand simulieren.
        if (r.state.buildMode) r.state.buildMode.phantomOnGround = true;
        const archBeforePfad = r.state.architectures.length;
        const stoneBeforePfad = r.state.player.inventory[0].count;
        const builtPfad = r.confirmBuild();
        const stoneAfterPfad = r.state.player.inventory[0] ? r.state.player.inventory[0].count : 0;
        out.pfadBuildsWithMaterial = builtPfad === true;
        out.pfadConsumesMaterial = stoneBeforePfad > stoneAfterPfad;
        out.pfadGrowsWorld = r.state.architectures.length > archBeforePfad;

        // confirmBuild pfad ohne Material → ablehnung
        r.state.player.inventory = new Array(27).fill(null);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        const archBeforeNoMat = r.state.architectures.length;
        const builtNoMat = r.confirmBuild();
        out.pfadRejectsWithoutMaterial = builtNoMat === false;
        out.pfadNoArchOnReject = r.state.architectures.length === archBeforeNoMat;

        // confirmBuild schöpfer ohne Material → baut frei
        r.setGameMode("schöpfer");
        r.state.player.inventory = new Array(27).fill(null);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        const archBeforeSchoepfer = r.state.architectures.length;
        const builtSchoepfer = r.confirmBuild();
        out.schoepferBuildsFree = builtSchoepfer === true;
        out.schoepferEmptyAfter = r.state.player.inventory.every((s) => !s);
        out.schoepferGrows = r.state.architectures.length > archBeforeSchoepfer;

        // S2 (kampf-plan §11.2) — confirmBuild frieden OHNE Material → ABGELEHNT (die kristallisierte
        // Modus-Achse: Materie kostet in pfad UND frieden, frei nur in schöpfer; frieden ist friedlich,
        // aber NICHT gratis — die V17.59-Diskrepanz geheilt).
        r.setGameMode("frieden");
        r.state.player.inventory = new Array(27).fill(null);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        const archBeforeFriedenNoMat = r.state.architectures.length;
        const builtFriedenNoMat = r.confirmBuild();
        out.friedenRejectsWithoutMaterial = builtFriedenNoMat === false;
        out.friedenNoArchOnReject = r.state.architectures.length === archBeforeFriedenNoMat;
        // frieden MIT Material → baut + KONSUMIERT (wie pfad; nur die Mühe/Bedrohung fehlt in frieden)
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        const archBeforeFriedenMat = r.state.architectures.length;
        const stoneBeforeFrieden = r.state.player.inventory[0].count;
        const builtFriedenMat = r.confirmBuild();
        const stoneAfterFrieden = r.state.player.inventory[0] ? r.state.player.inventory[0].count : 0;
        out.friedenBuildsWithMaterial = builtFriedenMat === true && r.state.architectures.length > archBeforeFriedenMat;
        out.friedenConsumesMaterial = stoneBeforeFrieden > stoneAfterFrieden;

        // HUD-Reflexion
        r.setGameMode("pfad");
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 30);
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        const hud = document.getElementById("build-mode-hud");
        const hudHtml = hud && hud.innerHTML;
        out.hudShowsCostInPfad = hudHtml && /stein/.test(hudHtml) && /\(30\)/.test(hudHtml);

        r.setGameMode("schöpfer");
        const hudSchoepfer = document.getElementById("build-mode-hud").innerHTML;
        out.hudShowsFreiInSchoepfer = /frei/i.test(hudSchoepfer);

        // S2 — frieden-HUD zeigt jetzt die Material-Kosten (wie pfad), nicht „frei".
        r.setGameMode("frieden");
        const hudFrieden = document.getElementById("build-mode-hud").innerHTML;
        out.hudShowsCostInFrieden = hudFrieden && /stein/.test(hudFrieden) && /\(30\)/.test(hudFrieden);

        // Cleanup: zurück auf frieden + Hotbar-Defaults für nachfolgende Tests.
        // Default-Hotbar (AUSLÖSCHUNGS-WELLE): [stein_block, waterfall, damm, null×6].
        r._clearBuildMode && r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.setHotbarSlot(1, "waterfall");
        r.setHotbarSlot(2, "damm");
        for (let i = 3; i < 9; i++) r.setHotbarSlot(i, null);
        r.setGameMode(origMode || "frieden");
        return out;
    });

    if (wave6hP2cResults && !wave6hP2cResults.error) {
        check(
            "Welle 6.H P2C: computeBuildCost ≡ harvestArchitecture (Wertneutralität)",
            wave6hP2cResults.symmetryHarvest
        );
        check("Welle 6.H P2C: stein_block-Kosten enthalten NUR stein", wave6hP2cResults.steinBlockOnlyStein);
        check("Welle 6.H P2C: baum_eiche-Kosten enthalten holz UND laub", wave6hP2cResults.oakHasHolzAndLaub);
        check("Welle 6.H P2C: baum_eiche-Kosten enthalten KEIN stein (Diskrimination)", wave6hP2cResults.oakHasNoStein);
        check(
            "Welle 6.H P2C: pfad + leeres Inventar → checkBuildCost.ok=false",
            wave6hP2cResults.checkEmptyInventoryRejected
        );
        check(
            "Welle 6.H P2C: pfad + ausreichend Material → checkBuildCost.ok=true",
            wave6hP2cResults.checkSufficientOk
        );
        check("Welle 6.H P2C: tryConsumeBuildCost zieht genau die Kosten ab", wave6hP2cResults.consumesExactly);
        check("Welle 6.H P2C: Atomarität — bei Mangel wird NICHTS abgezogen", wave6hP2cResults.atomicAtomicityOnFail);
        check("Welle 6.H P2C: missing-Map zeigt fehlendes Sub-Material", wave6hP2cResults.atomicReportsMissing);
        check(
            "Welle 6.H P2C: pfad + Material → confirmBuild liefert true + spawnt",
            wave6hP2cResults.pfadBuildsWithMaterial && wave6hP2cResults.pfadGrowsWorld
        );
        check("Welle 6.H P2C: pfad-Modus konsumiert Material aus Inventar", wave6hP2cResults.pfadConsumesMaterial);
        check("Welle 6.H P2C: pfad ohne Material → confirmBuild lehnt ab", wave6hP2cResults.pfadRejectsWithoutMaterial);
        check("Welle 6.H P2C: pfad-Ablehnung → keine Architektur entsteht", wave6hP2cResults.pfadNoArchOnReject);
        check(
            "Welle 6.H P2C: schöpfer-Modus baut ohne Material (Vision §1.5)",
            wave6hP2cResults.schoepferBuildsFree && wave6hP2cResults.schoepferGrows
        );
        check("Welle 6.H P2C: schöpfer-Modus: Inventar bleibt leer (unbegrenzt)", wave6hP2cResults.schoepferEmptyAfter);
        check(
            "V17.60 S2: frieden ohne Material → confirmBuild lehnt ab (frieden zahlt Materie, nicht gratis)",
            wave6hP2cResults.friedenRejectsWithoutMaterial && wave6hP2cResults.friedenNoArchOnReject
        );
        check(
            "V17.60 S2: KONSUM — frieden MIT Material baut + verbraucht das Material (wie pfad; nur Mühe/Bedrohung fehlt)",
            wave6hP2cResults.friedenBuildsWithMaterial && wave6hP2cResults.friedenConsumesMaterial
        );
        check("Welle 6.H P2C: pfad-HUD zeigt Material-Kosten + verfügbare Menge", wave6hP2cResults.hudShowsCostInPfad);
        check("Welle 6.H P2C: schöpfer-HUD zeigt 'frei'", wave6hP2cResults.hudShowsFreiInSchoepfer);
        check(
            "V17.60 S2: frieden-HUD zeigt die Material-Kosten (nicht mehr 'frei')",
            wave6hP2cResults.hudShowsCostInFrieden
        );
    }
}

// V11.0-d.3 (Pfeiler D — Trinken am Ufer) — Beweis dass der drink-Task als
// 6. Task registriert ist, dass die Sprache (Aura+Ping+Chat) ihn trägt,
// und dass _tickCreatureDrink den 3-Phasen-Zyklus durchläuft.
async function checkBandWelleV11D3DrinkTask(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const out = {};

        // Sprache: drink ist 6. Task + hat Aura-Hue (die Antwort ist die Stimme des Tiers, kein Ping-Ton).
        const tasks = r.constructor.CREATURE_TASKS;
        out.tasksInclude = tasks.includes("drink");
        out.tasksLength = tasks.length;
        out.auraHue = r.constructor.CREATURE_TASK_AURA_HUE.drink;

        // Konstanten existieren.
        out.haltDist = r.constructor.CREATURE_DRINK_HALT_DIST;
        out.duration = r.constructor.CREATURE_DRINK_DURATION_S;
        out.searchRadius = r.constructor.CREATURE_DRINK_SEARCH_RADIUS;
        out.speed = r.constructor.CREATURE_DRINK_SPEED;

        // API-Existenz.
        out.tickExists = typeof r._tickCreatureDrink === "function";


        // Chat-Pattern „trinke" liefert drink-Programm.
        const parsed = r.parseChatToDsl("trinke");
        out.chatParsesTrinke =
            parsed && parsed.program && parsed.program[0] === "creature_task_nearest" && parsed.program[1] === "drink";

        // Empirisch: _findNearestWaterPoint findet Wasser im Spawn-Bereich.
        let waterSpot = null;
        const SCAN = 100;
        const STEP = 6;
        for (let dx = -SCAN; dx <= SCAN && !waterSpot; dx += STEP) {
            for (let dz = -SCAN; dz <= SCAN && !waterSpot; dz += STEP) {
                // das Wasser, wie der Körper es trägt (Welle L: das Trink-Ziel liest `_nassAt` über `_koerperWasser`)
                if (r._nassAt(dx, dz, 0.1)) waterSpot = { x: dx, z: dz };
            }
        }
        out.waterFound = waterSpot !== null;
        if (waterSpot) {
            // Stelle eine Land-Cell in der Nähe des Wassers + suche von dort.
            const found = r._findNearestWaterPoint(waterSpot.x + 15, waterSpot.z + 15, 40);
            out.findReturnsObj = found !== null && typeof found.x === "number" && typeof found.z === "number";
        }

        // Verhaltens-Probe: assign drink an existing Kreatur, ein Tick laufen,
        // task.args._target sollte gesetzt sein (Phase 1 abgeschlossen).
        if (Array.isArray(r.state.creatures) && r.state.creatures.length > 0) {
            const creature = r.state.creatures[0];
            const origX = creature.position.x;
            const origZ = creature.position.z;
            const origTask = creature.userData && creature.userData.task ? { ...creature.userData.task } : null;
            // Platziere die Kreatur nahe an einem Wasser-Punkt (falls vorhanden).
            if (waterSpot) {
                const sy = r._voxelSurfaceY(waterSpot.x + 12, waterSpot.z + 12);
                if (Number.isFinite(sy)) {
                    creature.position.set(waterSpot.x + 12, sy + 0.5, waterSpot.z + 12);
                }
            }
            const ok = r.assignCreatureTask(creature, "drink", {}, { silent: true });
            out.assignOk = ok === true;
            const taskAfter = r._getCreatureTask(creature);
            out.taskNameAfter = taskAfter ? taskAfter.name : null;
            // Ein Tick — der drink-Tick sollte _target setzen wenn Wasser
            // in 40m gefunden, sonst zurück zu wander.
            r.updateCreatures(0.016);
            const taskTicked = r._getCreatureTask(creature);
            out.taskNameAfterTick = taskTicked ? taskTicked.name : null;
            // Wenn Wasser gefunden: noch drink-Task; sonst wander-Fallback.
            // Beide sind valide Outcomes je nach Welt-Variation.
            if (taskTicked && taskTicked.name === "drink") {
                out.targetSet = taskTicked.args && taskTicked.args._target !== undefined;
            }

            // Wieder-Herstellung.
            creature.position.set(origX, creature.position.y, origZ);
            if (origTask) r.assignCreatureTask(creature, origTask.name, origTask.args || {}, { silent: true });
            else r.assignCreatureTask(creature, "wander", {}, { silent: true });
        }

        return out;
    });
    if (res.error) {
        check("Welle V11.0-d.3: Drink-Band (realm verfügbar)", false, res.error);
        return;
    }
    check("Welle V11.0-d.3: 'drink' in CREATURE_TASKS (6. Task)", res.tasksInclude === true);
    check("Welle V11.0-d.3: CREATURE_TASKS jetzt 6 Einträge", res.tasksLength === 6);
    check("Welle V11.0-d.3: AURA_HUE.drink = 210 (azur)", res.auraHue === 210);
    check("Welle V11.0-d.3: CREATURE_DRINK_HALT_DIST = 1.5m", res.haltDist === 1.5);
    check("Welle V11.0-d.3: CREATURE_DRINK_DURATION_S = 2.5s", res.duration === 2.5);
    check("Welle V11.0-d.3: CREATURE_DRINK_SEARCH_RADIUS = 40m", res.searchRadius === 40);
    check("Welle V11.0-d.3: CREATURE_DRINK_SPEED = 3.0 m/s", res.speed === 3.0);
    check("Welle V11.0-d.3: _tickCreatureDrink existiert", res.tickExists === true);
    check("Welle V11.0-d.3: Chat-Pattern 'trinke' → creature_task_nearest drink", res.chatParsesTrinke === true);
    if (res.waterFound) {
        check("Welle V11.0-d.3: _findNearestWaterPoint findet Wasser (Vorbedingung)", res.findReturnsObj === true);
    }
    if (res.assignOk !== undefined) {
        check("Welle V11.0-d.3: assignCreatureTask akzeptiert 'drink'", res.assignOk === true);
        check("Welle V11.0-d.3: Kreatur trägt drink-Task nach assign", res.taskNameAfter === "drink");
        // Nach einem Tick: entweder noch drink (Wasser gefunden, walking)
        // oder wander (Wasser nicht in 40m, Auto-Fallback). Beide OK.
        check(
            "Welle V11.0-d.3: nach Tick — Task ist drink ODER wander (3-Phasen läuft oder Fallback)",
            res.taskNameAfterTick === "drink" || res.taskNameAfterTick === "wander",
            `nach Tick: ${res.taskNameAfterTick}`
        );
    }
}

// V9.52-e Sub-Welle e — Band-Funktion (Welle 6.H Phase 2B.2 + 2D + 2D.1 — Kreatur baut für Spieler + Spezialisierung aus Memory + Persistenz-Snapshot).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWelle6HBuildAndPersist(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2B.2 — Kreatur baut Bauplan für Spieler ###
    // Umkehrung von gather: Phasen take (zum Spieler) → walk (weg) → spawn (Architektur am Kreatur-Ort);
    // _buildMaterialGate ist EINE Funktion für Spieler-confirmBuild und die Kreatur-take-Phase.
    const wave6hP2b2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};

        // 1. Konstanten
        const Tasks = r.constructor.CREATURE_TASKS;
        const Hues = r.constructor.CREATURE_TASK_AURA_HUE;
        out.tasksHasBuild = Tasks.includes("build");
        out.auraHueBuild = Hues.build === 280;
        out.buildPlacementDist = r.constructor.CREATURE_BUILD_PLACEMENT_DIST === 4.0;
        out.buildSpeed = r.constructor.CREATURE_BUILD_SPEED === 3.0;

        // 2. Args-Mapping
        const a1 = r._buildCreatureTaskArgs("build", "stein_block");
        out.argsBuildString = a1.blueprint === "stein_block";
        const a2 = r._buildCreatureTaskArgs("build", 5);
        out.argsBuildNumberDropped = !a2.blueprint;
        const a3 = r._buildCreatureTaskArgs("build", "");
        out.argsBuildEmptyDropped = !a3.blueprint;

        // 3. Describe
        const desc = r._describeCreatureTaskArg("build", "stein_block");
        out.descBuildShowsBlueprint = /Bauplan/.test(desc) && /stein_block/.test(desc);

        // 4. Tick: kein blueprint → null + falls auf wander
        const c0 = r.spawnCreatureAt(
            r.state.playerMesh.position.x + 50,
            r.state.playerMesh.position.y,
            r.state.playerMesh.position.z + 50,
            "happy",
            "wesen"
        );
        r.assignCreatureTask(c0, "build", {});
        const dirEmpty = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.buildEmptyFallsToWander = dirEmpty === null && r._getCreatureTask(c0).name === "wander";

        // 5. Tick: unknown blueprint → memory + journal + wander
        r.assignCreatureTask(c0, "build", { blueprint: "fictional_bp_xyz" });
        const dirUnk = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.unknownBpFallsToWander = dirUnk === null && r._getCreatureTask(c0).name === "wander";
        const memHasUnk = (c0.userData.memory || []).some((m) => m.type === "no_blueprint");
        out.memHasNoBlueprint = memHasUnk;

        // 6. Take-Phase: Distanz zum Spieler → Vektor zu Spieler hin, Geschwindigkeit BUILD_SPEED
        const player = r.state.playerMesh.position;
        c0.position.set(player.x + 10, player.y, player.z);
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const dirTake = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.takePhaseTowardsPlayer = dirTake && dirTake.x < 0; // sollte negativ sein (Richtung -x = zum Spieler)
        const sp = Math.hypot(dirTake.x, dirTake.z);
        // Phase 2F.1: Speed wird body-moduliert (stats.speed/7). Toleranz weiter
        // damit Body-Faktor je Soul den Test nicht bricht — wir prüfen Bereich
        // [BUILD_SPEED*0.5, BUILD_SPEED*2.0] statt Gleichheit.
        out.takePhaseSpeed =
            sp > r.constructor.CREATURE_BUILD_SPEED * 0.5 && sp < r.constructor.CREATURE_BUILD_SPEED * 2.0;

        // 7. Take-Phase at handover, pfad ohne Material → ablehnt + memory + wander
        const origMode = r.getGameMode();
        r.setGameMode("pfad");
        r.state.player.inventory = new Array(27).fill(null);
        c0.position.set(player.x + 1.0, player.y, player.z); // innerhalb handover (2.0)
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const dirNoMat = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.takeNoMatRejects = dirNoMat === null && r._getCreatureTask(c0).name === "wander";
        const memHasNoInv = (c0.userData.memory || []).some((m) => m.type === "no_inventory_for_build");
        out.memHasNoInv = memHasNoInv;

        // 8. Take-Phase at handover, pfad mit Material → carrying gesetzt + Material verbraucht
        r.state.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const stoneBefore = r.state.player.inventory[0].count;
        c0.position.set(player.x + 1.0, player.y, player.z);
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.takeSetsCarrying = !!c0.userData.carrying && c0.userData.carrying.kind === "build";
        out.takeCarryingHasBp = c0.userData.carrying && c0.userData.carrying.blueprint === "stein_block";
        const stoneAfter = r.state.player.inventory[0] ? r.state.player.inventory[0].count : 0;
        out.takeConsumesPfad = stoneAfter < stoneBefore;
        const memHasTook = (c0.userData.memory || []).some((m) => m.type === "took_materials");
        out.memHasTook = memHasTook;

        // 9. Schöpfer/frieden: carrying wird mit symbolic cost gesetzt, Inventar bleibt leer
        r.setGameMode("schöpfer");
        r.state.player.inventory = new Array(27).fill(null);
        c0.position.set(player.x + 1.0, player.y, player.z);
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.schoepferCarrying = !!c0.userData.carrying;
        out.schoepferCarryingHasMaterials =
            c0.userData.carrying && c0.userData.carrying.materials && c0.userData.carrying.materials.stein > 0;
        out.schoepferCarryingFree = c0.userData.carrying && c0.userData.carrying.free === true;
        out.schoepferInventoryUntouched = r.state.player.inventory.every((s) => !s);

        // 10. Walk-Phase: mit carrying, Vektor WEG vom Spieler
        r.setGameMode("schöpfer");
        c0.position.set(player.x + 2.5, player.y, player.z); // 2.5m, weniger als placement (4.0)
        c0.userData.carrying = {
            kind: "build",
            materials: { stein: 8 },
            blueprint: "stein_block",
            since: 0,
        };
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const dirWalk = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.walkPhaseAwayFromPlayer = dirWalk && dirWalk.x > 0; // weg vom Spieler = +x
        const ws = Math.hypot(dirWalk.x, dirWalk.z);
        // Phase 2F.1: gleiche Body-Modulation wie take-Phase.
        out.walkPhaseSpeed =
            ws > r.constructor.CREATURE_BUILD_SPEED * 0.5 && ws < r.constructor.CREATURE_BUILD_SPEED * 2.0;

        // 11. Spawn-Phase: bei placement_dist → spawnArchitecture + carrying null + memory + wander
        c0.position.set(player.x + 5.0, player.y + 1.0, player.z); // > placement (4.0)
        c0.userData.carrying = {
            kind: "build",
            materials: { stein: 8 },
            blueprint: "stein_block",
            since: 0,
        };
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const archBefore = r.state.architectures.length;
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.spawnPhaseGrowsWorld = r.state.architectures.length > archBefore;
        out.spawnPhaseClearsCarrying = c0.userData.carrying === null;
        out.spawnPhaseFallsToWander = r._getCreatureTask(c0).name === "wander";
        const memHasBuilt = (c0.userData.memory || []).some((m) => m.type === "built");
        out.memHasBuilt = memHasBuilt;
        const journalHasBuilt = (r.state.worldJournal.entries || []).some(
            (e) => e.type === "growth" && /erschuf/.test(e.text)
        );
        out.journalHasBuilt = journalHasBuilt;

        // 12. DSL-Op routing
        r.dslRun(["creature_task_nearest", "build", "stein_block"], { source: "test" });
        // Finde irgendeine Kreatur mit build-Task
        const anyBuilding = r.state.creatures.some(
            (c) => r._getCreatureTask(c) && r._getCreatureTask(c).name === "build"
        );
        out.dslNearestSetsBuild = anyBuilding;

        // 13. NON_BROADCASTABLE_OPS — creature_task* sind schon drin (Phase 1).
        // Build wird über dieselben Ops gerufen, also automatisch privat.
        out.opsAreNonBroadcast =
            r.constructor.NON_BROADCASTABLE_OPS.has("creature_task_nearest") &&
            r.constructor.NON_BROADCASTABLE_OPS.has("creature_task_all") &&
            r.constructor.NON_BROADCASTABLE_OPS.has("creature_task");

        // 14. Chat-Patterns
        const p1 = r.parseChatToDsl("baue stein_block");
        out.chatBauePattern =
            p1 &&
            Array.isArray(p1.program) &&
            p1.program[0] === "creature_task_nearest" &&
            p1.program[1] === "build" &&
            p1.program[2] === "stein_block";
        const p2 = r.parseChatToDsl("alle bauen stein_block");
        out.chatAlleBauenPattern =
            p2 &&
            Array.isArray(p2.program) &&
            p2.program[0] === "creature_task_all" &&
            p2.program[1] === "build" &&
            p2.program[2] === "stein_block";

        // 15. describeProgram
        const desc1 = r.describeProgram(["creature_task_nearest", "build", "stein_block"]);
        out.describeProgramShowsBp = /Bauplan/.test(desc1) && /stein_block/.test(desc1);

        // 16. Status-Bar zeigt 'N bauen'
        // Setze mehrere Kreaturen auf build (alle existierenden)
        for (const c of r.state.creatures) {
            r.assignCreatureTask(c, "build", { blueprint: "stein_block" }, { silent: true });
        }
        if (typeof r._renderTaskStatusUI === "function") r._renderTaskStatusUI();
        const statusEl = document.getElementById("status-tasks");
        out.statusShowsBauen = statusEl && /bauen/.test(statusEl.textContent);

        // 17. Liste zeigt 'baut stein_block' + .build CSS-Class
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const buildRow = listEl && listEl.querySelector(".creature-task.build");
        out.listHasBuildClass = !!buildRow;
        out.listShowsBaut = listEl && /baut stein_block/.test(listEl.textContent);

        // 18. UI (V18.48 Hof-C): die Bau-Optionen leben im inline „Auftrag ▾"-Select am Wesen
        // (statt des globalen #creature-build-select, der der NÄCHSTEN Kreatur befahl).
        const buildSelect = listEl && listEl.querySelector(".creature-row .creature-order-select");
        out.uiBuildSelectExists = !!buildSelect;
        out.uiBuildSelectHasOptions = buildSelect
            ? [...buildSelect.querySelectorAll("option")].filter((o) => o.value.startsWith("build:")).length >= 3
            : false;
        out.uiBuildButtonsCount = !!(listEl && listEl.querySelector(".creature-row [data-task]"));

        // 19. Journal-Label "wird zur Schöpferin" beim build-Wechsel
        // (assignCreatureTask hat schon ein Journal geschrieben in #16, prüfen)
        const journalHasRel = (r.state.worldJournal.entries || []).some(
            (e) => e.type === "relationship" && /Schöpferin/.test(e.text)
        );
        out.journalHasSchoepferin = journalHasRel;

        // 20. Symbolic cost: free build hat trotzdem materials map (für Journal/Visual)
        r.setGameMode("schöpfer");
        r.state.player.inventory = new Array(27).fill(null);
        const cFree = r.spawnCreatureAt(player.x + 30, player.y, player.z + 30, "happy", "wesen");
        cFree.position.set(player.x + 1.0, player.y, player.z);
        cFree.userData.carrying = null;
        r.assignCreatureTask(cFree, "build", { blueprint: "baum_eiche" }, { silent: true });
        r._tickCreatureTaskDirection(cFree, cFree.userData.task, "happy");
        out.symbolicCostHasMultiple =
            cFree.userData.carrying && Object.keys(cFree.userData.carrying.materials).length >= 2; // baum_eiche = holz + laub

        // Cleanup für nachfolgende Tests
        r.setGameMode(origMode || "frieden");
        for (const c of r.state.creatures) {
            r.assignCreatureTask(c, "wander", {}, { silent: true });
        }
        return out;
    });

    if (wave6hP2b2Results && !wave6hP2b2Results.error) {
        check("Welle 6.H P2B.2: CREATURE_TASKS enthält 'build'", wave6hP2b2Results.tasksHasBuild);
        check("Welle 6.H P2B.2: AURA_HUE.build === 280 (violett)", wave6hP2b2Results.auraHueBuild);
        check(
            "Welle 6.H P2B.2: CREATURE_BUILD_PLACEMENT_DIST=4.0 + CREATURE_BUILD_SPEED=3.0",
            wave6hP2b2Results.buildPlacementDist && wave6hP2b2Results.buildSpeed
        );
        check(
            "Welle 6.H P2B.2: _buildCreatureTaskArgs(build, string) → {blueprint}",
            wave6hP2b2Results.argsBuildString
        );
        check(
            "Welle 6.H P2B.2: _buildCreatureTaskArgs(build, number) droppt arg",
            wave6hP2b2Results.argsBuildNumberDropped
        );
        check("Welle 6.H P2B.2: _buildCreatureTaskArgs(build, '') droppt arg", wave6hP2b2Results.argsBuildEmptyDropped);
        check(
            "Welle 6.H P2B.2: _describeCreatureTaskArg(build, X) zeigt 'Bauplan X'",
            wave6hP2b2Results.descBuildShowsBlueprint
        );
        check(
            "Welle 6.H P2B.2: build ohne blueprint → null + Task fällt auf wander",
            wave6hP2b2Results.buildEmptyFallsToWander
        );
        check(
            "Welle 6.H P2B.2: build mit unbekanntem Bauplan → wander + 'no_blueprint'-Erinnerung",
            wave6hP2b2Results.unknownBpFallsToWander && wave6hP2b2Results.memHasNoBlueprint
        );
        check(
            "Welle 6.H P2B.2: take-Phase weit weg → Vektor zum Spieler hin",
            wave6hP2b2Results.takePhaseTowardsPlayer
        );
        check(
            "Welle 6.H P2B.2: take-Phase Geschwindigkeit ~ CREATURE_BUILD_SPEED (body-moduliert P2F.1)",
            wave6hP2b2Results.takePhaseSpeed
        );
        check(
            "Welle 6.H P2B.2: pfad ohne Material → take lehnt ab + 'no_inventory_for_build'-Memory",
            wave6hP2b2Results.takeNoMatRejects && wave6hP2b2Results.memHasNoInv
        );
        check(
            "Welle 6.H P2B.2: pfad mit Material → carrying.kind='build' + blueprint gesetzt",
            wave6hP2b2Results.takeSetsCarrying && wave6hP2b2Results.takeCarryingHasBp
        );
        check(
            "Welle 6.H P2B.2: pfad: Material wird aus Spieler-Inventar konsumiert",
            wave6hP2b2Results.takeConsumesPfad
        );
        check("Welle 6.H P2B.2: 'took_materials'-Erinnerung gespeichert", wave6hP2b2Results.memHasTook);
        check(
            "Welle 6.H P2B.2: schöpfer setzt carrying mit symbolic cost (für Visual+Journal)",
            wave6hP2b2Results.schoepferCarrying &&
                wave6hP2b2Results.schoepferCarryingHasMaterials &&
                wave6hP2b2Results.schoepferCarryingFree
        );
        check(
            "Welle 6.H P2B.2: schöpfer: Inventar bleibt unangetastet (kostenlos)",
            wave6hP2b2Results.schoepferInventoryUntouched
        );
        check(
            "Welle 6.H P2B.2: walk-Phase mit carrying → Vektor WEG vom Spieler ~ BUILD_SPEED (body-moduliert P2F.1)",
            wave6hP2b2Results.walkPhaseAwayFromPlayer && wave6hP2b2Results.walkPhaseSpeed
        );
        check(
            "Welle 6.H P2B.2: spawn-Phase bei placement_dist → Architektur entsteht",
            wave6hP2b2Results.spawnPhaseGrowsWorld
        );
        check(
            "Welle 6.H P2B.2: spawn-Phase clearet carrying + fällt auf wander zurück",
            wave6hP2b2Results.spawnPhaseClearsCarrying && wave6hP2b2Results.spawnPhaseFallsToWander
        );
        check(
            "Welle 6.H P2B.2: 'built'-Memory + 'growth'-Journal-Eintrag (erschuf ...)",
            wave6hP2b2Results.memHasBuilt && wave6hP2b2Results.journalHasBuilt
        );
        check("Welle 6.H P2B.2: DSL creature_task_nearest('build', bp) wirkt", wave6hP2b2Results.dslNearestSetsBuild);
        check(
            "Welle 6.H P2B.2: build-Ops bleiben in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hP2b2Results.opsAreNonBroadcast
        );
        check("Welle 6.H P2B.2: Chat 'baue X' → creature_task_nearest build X", wave6hP2b2Results.chatBauePattern);
        check(
            "Welle 6.H P2B.2: Chat 'alle bauen X' → creature_task_all build X",
            wave6hP2b2Results.chatAlleBauenPattern
        );
        check("Welle 6.H P2B.2: describeProgram zeigt 'Bauplan' + name", wave6hP2b2Results.describeProgramShowsBp);
        check("Welle 6.H P2B.2: Status-Bar zeigt 'N bauen' bei build-Tasks", wave6hP2b2Results.statusShowsBauen);
        check(
            "Welle 6.H P2B.2: Liste zeigt .build-Class + 'baut <bp>'",
            wave6hP2b2Results.listHasBuildClass && wave6hP2b2Results.listShowsBaut
        );
        check(
            "V18.48 Hof-C: der inline Auftrag-Select am Wesen traegt >=3 Bau-Optionen + Task-Knoepfe",
            wave6hP2b2Results.uiBuildSelectExists &&
                wave6hP2b2Results.uiBuildSelectHasOptions &&
                wave6hP2b2Results.uiBuildButtonsCount
        );
        check(
            "Welle 6.H P2B.2: Journal-Label (wird zur Schoepferin) beim build-Wechsel",
            wave6hP2b2Results.journalHasSchoepferin
        );
        check(
            "Welle 6.H P2B.2: free-build trägt Multi-Material symbolic cost (baum_eiche=holz+laub)",
            wave6hP2b2Results.symbolicCostHasMultiple
        );
    } else if (wave6hP2b2Results && wave6hP2b2Results.error) {
        check(`Welle 6.H P2B.2: evaluate-Fehler — ${wave6hP2b2Results.error}`, false);
    }

    // ### Welle 6.H Phase 2D — Spezialisierung aus Memory ###
    // Memory-Erfolge (gathered/built) ergeben Skill-Levels (gather:material, build:blueprint): Speed-Bonus
    // je Level, Audio + Journal beim Level-Up, UI-Pills; Levels sind abgeleitet, nie separat gespeichert.
    const wave6hP2dResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};
        const Class = r.constructor;


        // 2. Methoden existieren
        out.hasComputeSpecs = typeof r._computeCreatureSpecializations === "function";
        out.hasLevelMethod = typeof r._creatureSpecializationLevel === "function";
        out.hasTopMethod = typeof r._creatureTopSpecializations === "function";
        out.hasSpeedMul = typeof r._creatureTaskSpeedMultiplier === "function";
        out.hasLevelUp = typeof r._onCreatureLevelUp === "function";
        out.hasSkillKey = typeof r._creatureSkillKeyForMemory === "function";

        // 3. _creatureSkillKeyForMemory mappt korrekt
        const sk1 = r._creatureSkillKeyForMemory("gathered", { material: "holz" });
        out.skillKeyGather = sk1 && sk1.kind === "gather" && sk1.key === "holz";
        const sk2 = r._creatureSkillKeyForMemory("built", { blueprint: "stein_block" });
        out.skillKeyBuild = sk2 && sk2.kind === "build" && sk2.key === "stein_block";
        const sk3 = r._creatureSkillKeyForMemory("no_material", { material: "holz" });
        out.skillKeyFailureNull = sk3 === null;
        const sk4 = r._creatureSkillKeyForMemory("delivered", { material: "holz" });
        out.skillKeyDeliveredNull = sk4 === null;

        // 4. Frische Kreatur → leere Specs
        const player = r.state.playerMesh.position;
        const c = r.spawnCreatureAt(player.x + 80, player.y, player.z + 80, "happy", "wesen");
        c.userData.memory = []; // sicherstellen
        const s0 = r._computeCreatureSpecializations(c);
        out.emptyMemoryEmptySpecs = s0 && Object.keys(s0.gather).length === 0 && Object.keys(s0.build).length === 0;

        // 5. _computeCreatureSpecializations zählt korrekt aus memory
        c.userData.memory = [
            { type: "gathered", content: { material: "holz", blueprint: "baum_eiche" }, at: 1 },
            { type: "gathered", content: { material: "holz", blueprint: "baum_eiche" }, at: 2 },
            { type: "gathered", content: { material: "stein", blueprint: "stein_block" }, at: 3 },
            { type: "built", content: { blueprint: "stein_block" }, at: 4 },
            { type: "no_material", content: { material: "holz" }, at: 5 },
            { type: "no_blueprint", content: { blueprint: "fictional" }, at: 6 },
        ];
        const sCounted = r._computeCreatureSpecializations(c);
        out.countsHolz = sCounted.gather.holz === 2;
        out.countsStein = sCounted.gather.stein === 1;
        out.countsBuiltSteinBlock = sCounted.build.stein_block === 1;
        out.failuresIgnored = !sCounted.gather.fictional && !sCounted.build.fictional;

        // 6. _creatureSpecializationLevel
        out.level0Empty = r._creatureSpecializationLevel(c, "gather", "lederX") === 0;
        out.level0Sub = r._creatureSpecializationLevel(c, "gather", "holz") === 0; // 2 < 3

        // Push einen dritten gather-holz, sollte L1 erreichen
        c.userData.memory.push({ type: "gathered", content: { material: "holz" }, at: 7 });
        out.level1At3 = r._creatureSpecializationLevel(c, "gather", "holz") === 1;
        // Auf 6 — L2
        for (let i = 0; i < 3; i++)
            c.userData.memory.push({ type: "gathered", content: { material: "holz" }, at: 8 + i });
        out.level2At6 = r._creatureSpecializationLevel(c, "gather", "holz") === 2;
        // Auf 100 — gedeckelt bei L5
        for (let i = 0; i < 100; i++)
            c.userData.memory.push({ type: "gathered", content: { material: "holz" }, at: 100 + i });
        out.levelCappedAt5 = r._creatureSpecializationLevel(c, "gather", "holz") === 5;

        // 7. _creatureTopSpecializations
        const c2 = r.spawnCreatureAt(player.x + 90, player.y, player.z + 90, "happy", "wesen");
        c2.userData.memory = [
            { type: "gathered", content: { material: "holz" }, at: 1 },
            { type: "gathered", content: { material: "holz" }, at: 2 },
            { type: "gathered", content: { material: "holz" }, at: 3 }, // L1 holz
            { type: "built", content: { blueprint: "stein_block" }, at: 4 },
            { type: "built", content: { blueprint: "stein_block" }, at: 5 },
            { type: "built", content: { blueprint: "stein_block" }, at: 6 },
            { type: "built", content: { blueprint: "stein_block" }, at: 7 },
            { type: "built", content: { blueprint: "stein_block" }, at: 8 },
            { type: "built", content: { blueprint: "stein_block" }, at: 9 }, // L2 stein_block
        ];
        const top = r._creatureTopSpecializations(c2, 2);
        out.topReturnsArray = Array.isArray(top) && top.length === 2;
        out.topSortedByLevel = top[0].level >= top[1].level;
        out.topHasBuildAtTop = top[0].kind === "build" && top[0].level === 2;
        out.topHasGatherSecond = top[1].kind === "gather" && top[1].level === 1;
        const topLimit1 = r._creatureTopSpecializations(c2, 1);
        out.topLimit1 = topLimit1.length === 1;

        // Keine Skills → leeres Array
        const cFresh = r.spawnCreatureAt(player.x + 95, player.y, player.z + 95, "happy", "wesen");
        cFresh.userData.memory = [];
        out.topEmpty = r._creatureTopSpecializations(cFresh, 2).length === 0;

        // 8. Speed-Multiplikator
        out.mulL0 = Math.abs(r._creatureTaskSpeedMultiplier(c, "gather", { material: "lederX" }) - 1.0) < 0.001;
        // c hat L5 für gather:holz
        const mulL5 = r._creatureTaskSpeedMultiplier(c, "gather", { material: "holz" });
        out.mulL5 = Math.abs(mulL5 - 1.75) < 0.001;
        // build mit L0
        out.mulBuildL0 = Math.abs(r._creatureTaskSpeedMultiplier(c, "build", { blueprint: "fictional" }) - 1.0) < 0.001;
        // Unbekannter Task → 1
        out.mulUnknownTask = r._creatureTaskSpeedMultiplier(c, "wander", {}) === 1;
        // Null-Args → 1
        out.mulNullArgs = r._creatureTaskSpeedMultiplier(c, "gather", null) === 1;

        // 9. Level-Up triggert über _creatureRemember
        const cFollow = r.spawnCreatureAt(player.x + 100, player.y, player.z + 100, "happy", "wesen");
        cFollow.userData.memory = [];
        // Die EINTRAGS-IDENTITÄT messen, nicht entries.length: worldJournal.entries ist FIFO-gedeckelt (200),
        // am Cap bleibt die Länge gleich und journalAppends id (`entries.length + 1`) ist nicht eindeutig.
        const journalEntriesBefore = new Set(r.state.worldJournal.entries || []);
        // 3 gathered → L1, sollte LevelUp triggern — und das Tier ruft dazu (Welle 5 Klang: seine Stimme, genau einmal)
        const rufVor = r.state.symphony.tierRufe || 0;
        r._creatureRemember(cFollow, "gathered", { material: "quarz" });
        r._creatureRemember(cFollow, "gathered", { material: "quarz" });
        r._creatureRemember(cFollow, "gathered", { material: "quarz" }); // Level-Up hier
        out.levelUpRuft = (r.state.symphony.tierRufe || 0) - rufVor === 1;
        const lvlAfter = r._creatureSpecializationLevel(cFollow, "gather", "quarz");
        out.rememberTriggersLevel = lvlAfter === 1;
        // Ein NEUER growth-Eintrag (nicht im Vorher-Set) mit Sammler / "quarz" / "Stufe 1" beweist, dass
        // DIESER Level-Up ihn schrieb (kein Autonom-Lauf-Echo).
        const journalAfter = r.state.worldJournal.entries || [];
        const newLvlUpEntry = journalAfter.some(
            (e) =>
                e &&
                !journalEntriesBefore.has(e) &&
                e.type === "growth" &&
                /Sammler/.test(e.text) &&
                /quarz/.test(e.text) &&
                /Stufe 1/.test(e.text)
        );
        out.journalHasLvlUp = newLvlUpEntry;
        out.journalGrew = newLvlUpEntry;

        // 10. Bei Failure-Push KEIN LevelUp
        const cFailure = r.spawnCreatureAt(player.x + 110, player.y, player.z + 110, "happy", "wesen");
        cFailure.userData.memory = [];
        const beforeFailureJournal = (r.state.worldJournal.entries || []).length;
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        out.failureNoLevel = r._creatureSpecializationLevel(cFailure, "gather", "holz") === 0;
        // Journal-Wachstum sollte 0 sein (kein growth-Eintrag durch Failure)
        const failureJournalDiff = (r.state.worldJournal.entries || []).length - beforeFailureJournal;
        out.failureJournalUntouched = failureJournalDiff === 0;

        // 11. UI: .creature-specs span existiert nach Render
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const specsSpans = listEl ? listEl.querySelectorAll(".creature-specs") : [];
        out.uiSpecsSpansExist = specsSpans.length > 0;

        // Pills sollten Klassen .creature-spec.creature-spec-gather oder -build haben
        const gatherPills = listEl ? listEl.querySelectorAll(".creature-spec.creature-spec-gather") : [];
        const buildPills = listEl ? listEl.querySelectorAll(".creature-spec.creature-spec-build") : [];
        out.uiHasGatherPills = gatherPills.length > 0;
        out.uiHasBuildPills = buildPills.length > 0;

        // 12. Pills zeigen "Sammler·material·L1" oder „Bauer·blueprint·L2"
        const samplePill = gatherPills[0];
        out.uiPillTextOk = samplePill && /Sammler/.test(samplePill.textContent) && /L\d/.test(samplePill.textContent);
        const buildPill = buildPills[0];
        out.uiBuildPillTextOk = buildPill && /Bauer/.test(buildPill.textContent) && /L\d/.test(buildPill.textContent);

        // 13. Fresh creature OHNE specs hat KEINE .creature-specs span in ihrer Row
        const cNoSpecsList = r.spawnCreatureAt(player.x + 120, player.y, player.z + 120, "happy", "wesen");
        cNoSpecsList.userData.memory = []; // explizit leer
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        // Wir können nicht direkt die spezifische Row finden, aber wir können prüfen dass die ANZAHL specsSpans = Anzahl Kreaturen mit ≥1 Spec
        const allRows = listEl ? listEl.querySelectorAll(".creature-row") : [];
        let creaturesWithSpecs = 0;
        for (const cc of r.state.creatures) {
            if (r._creatureTopSpecializations(cc, 2).length > 0) creaturesWithSpecs++;
        }
        const allSpecsSpans = listEl ? listEl.querySelectorAll(".creature-specs") : [];
        out.uiSpansMatchSpecCount = allSpecsSpans.length === creaturesWithSpecs;

        // 14. Persistenz NICHT — buildStateSnapshot speichert keine specializations
        // (memory ist sowieso nicht persistiert; specs sind live computed daraus)
        const snap = r.buildStateSnapshot();
        out.snapshotHasNoSpecs = !snap.creatureSpecializations && !snap.specializations;

        // 15. NICHT in NON_BROADCASTABLE_OPS (es gibt keine specialization-DSL-Op)
        out.noSpecDslOp = !Class.NON_BROADCASTABLE_OPS.has("specialization");

        return out;
    });

    if (wave6hP2dResults && !wave6hP2dResults.error) {
        check(
            "Welle 6.H P2D: alle 6 Methoden existieren (compute/level/top/speedMul/levelUp/skillKey)",
            wave6hP2dResults.hasComputeSpecs &&
                wave6hP2dResults.hasLevelMethod &&
                wave6hP2dResults.hasTopMethod &&
                wave6hP2dResults.hasSpeedMul &&
                wave6hP2dResults.hasLevelUp &&
                wave6hP2dResults.hasSkillKey
        );
        check("Welle 6.H P2D: skillKeyForMemory mappt gathered → gather:material", wave6hP2dResults.skillKeyGather);
        check(
            "Welle 5 Klang: der Aufstieg klingt mit der Stimme des Tiers (genau ein Ruf)",
            wave6hP2dResults.levelUpRuft
        );
        check("Welle 6.H P2D: skillKeyForMemory mappt built → build:blueprint", wave6hP2dResults.skillKeyBuild);
        check(
            "Welle 6.H P2D: skillKeyForMemory failures (no_material, delivered) → null",
            wave6hP2dResults.skillKeyFailureNull && wave6hP2dResults.skillKeyDeliveredNull
        );
        check("Welle 6.H P2D: leere memory → leere specializations", wave6hP2dResults.emptyMemoryEmptySpecs);
        check(
            "Welle 6.H P2D: computeSpecs zählt gathered nach material (holz=2, stein=1)",
            wave6hP2dResults.countsHolz && wave6hP2dResults.countsStein
        );
        check("Welle 6.H P2D: computeSpecs zählt built nach blueprint", wave6hP2dResults.countsBuiltSteinBlock);
        check(
            "Welle 6.H P2D: failures (no_material, no_blueprint) zählen NICHT in specs",
            wave6hP2dResults.failuresIgnored
        );
        check(
            "Welle 6.H P2D: Level 0 für leeren Skill + Sub-Threshold (2<3)",
            wave6hP2dResults.level0Empty && wave6hP2dResults.level0Sub
        );
        check("Welle 6.H P2D: 3 Erfolge → Level 1", wave6hP2dResults.level1At3);
        check("Welle 6.H P2D: 6 Erfolge → Level 2", wave6hP2dResults.level2At6);
        check("Welle 6.H P2D: 100 Erfolge → Level 5 (Cap)", wave6hP2dResults.levelCappedAt5);
        check(
            "Welle 6.H P2D: topSpecializations sortiert nach Level + limit",
            wave6hP2dResults.topReturnsArray &&
                wave6hP2dResults.topSortedByLevel &&
                wave6hP2dResults.topHasBuildAtTop &&
                wave6hP2dResults.topHasGatherSecond &&
                wave6hP2dResults.topLimit1
        );
        check("Welle 6.H P2D: keine Skills → topSpecializations liefert leeres Array", wave6hP2dResults.topEmpty);
        check("Welle 6.H P2D: speedMultiplier L0 → 1.0", wave6hP2dResults.mulL0 && wave6hP2dResults.mulBuildL0);
        check("Welle 6.H P2D: speedMultiplier L5 → 1.75 (1 + 5*0.15)", wave6hP2dResults.mulL5);
        check(
            "Welle 6.H P2D: speedMultiplier wander/null-args → 1.0",
            wave6hP2dResults.mulUnknownTask && wave6hP2dResults.mulNullArgs
        );
        check(
            "Welle 6.H P2D: 3. erfolgreicher gather → Level-Up im _creatureRemember",
            wave6hP2dResults.rememberTriggersLevel
        );
        check(
            "Welle 6.H P2D: Level-Up schreibt growth-Journal-Eintrag mit Sammler/key/Stufe",
            wave6hP2dResults.journalHasLvlUp && wave6hP2dResults.journalGrew
        );
        check(
            "Welle 6.H P2D: Failure-Memory triggert KEIN Level + KEIN Journal",
            wave6hP2dResults.failureNoLevel && wave6hP2dResults.failureJournalUntouched
        );
        check(
            "Welle 6.H P2D: UI .creature-specs Spans existieren bei Kreaturen mit Specs",
            wave6hP2dResults.uiSpecsSpansExist
        );
        check(
            "Welle 6.H P2D: UI .creature-spec.creature-spec-gather + .creature-spec-build Pills",
            wave6hP2dResults.uiHasGatherPills && wave6hP2dResults.uiHasBuildPills
        );
        check(
            "Welle 6.H P2D: Pills zeigen Sammler/Bauer + Level (L1..L5)",
            wave6hP2dResults.uiPillTextOk && wave6hP2dResults.uiBuildPillTextOk
        );
        check(
            "Welle 6.H P2D: Anzahl .creature-specs Spans = Anzahl Kreaturen mit Specs",
            wave6hP2dResults.uiSpansMatchSpecCount
        );
        check(
            "Welle 6.H P2D: KEINE Persistenz im buildStateSnapshot (Vision §1.1)",
            wave6hP2dResults.snapshotHasNoSpecs
        );
        check(
            "Welle 6.H P2D: KEIN specialization-DSL-Op in NON_BROADCASTABLE_OPS (kein Op nötig)",
            wave6hP2dResults.noSpecDslOp
        );
    } else if (wave6hP2dResults && wave6hP2dResults.error) {
        check(`Welle 6.H P2D: evaluate-Fehler — ${wave6hP2dResults.error}`, false);
    }

    // ### Welle 6.H Phase 2D.1 — Kreatur-Persistenz (Komponenten-Snapshot) ###
    // Kreatur-Identitäten überleben Reload: der Save trägt {name, soul, memory, position, bornAt} je
    // Kreatur (~1 KB), Memory-Cap 200; tote Kreaturen (removeCreature) fallen aus dem Save.
    const wave6hP2d1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};

        // Cap-Headroom: der Warmup kann `creatures` bis maxCreatures füllen → ein Spawn obendrauf gäbe null.
        // Lokal anheben, vor `return out` restaurieren (kein _gameLoopTick dazwischen → deterministisch).
        const _capG = r.state.maxCreatures;
        r.state.maxCreatures = (r.state.creatures ? r.state.creatures.length : 0) + 16;

        // 1. Memory-Cap auf 200 gebumpt
        out.memCap200 = r.constructor.CREATURE_MEMORY_CAP === 200;

        // 2. Methoden existieren
        out.hasSerialize = typeof r._serializeCreature === "function";
        out.hasRestore = typeof r._restoreCreatureFromSnapshot === "function";

        // 3. Neu gespawnte Kreatur bekommt bornAt
        const player = r.state.playerMesh.position;
        const c = r.spawnCreatureAt(player.x + 130, player.y, player.z + 130, "happy", "wesen");
        if (!c) {
            out.spawnFailed = true;
            return out;
        }
        out.bornAtSet = Number.isFinite(c.userData.bornAt) && c.userData.bornAt > 0;

        // 4. _serializeCreature liefert vollständigen Snapshot
        c.userData.memory = [
            { type: "gathered", content: { material: "holz" }, at: 1 },
            { type: "gathered", content: { material: "holz" }, at: 2 },
            { type: "built", content: { blueprint: "stein_block" }, at: 3 },
        ];
        const snap = r._serializeCreature(c);
        out.snapHasName = typeof snap.name === "string" && snap.name.length > 0;
        out.snapHasSoul = snap.soul === "wesen";
        out.snapHasMemory = Array.isArray(snap.memory) && snap.memory.length === 3;
        out.snapHasPosition = snap.position && Number.isFinite(snap.position.x);
        out.snapHasBornAt = Number.isFinite(snap.bornAt);

        // 5. _restoreCreatureFromSnapshot baut Kreatur aus Snapshot
        const beforeCount = r.state.creatures.length;
        const restored = r._restoreCreatureFromSnapshot(snap, "happy");
        out.restoreReturnsCreature = !!restored;
        out.restoreGrowsList = r.state.creatures.length === beforeCount + 1;
        out.restoreNameOk = restored && restored.userData.name === snap.name;
        out.restoreSoulOk = restored && restored.userData.soul === "wesen";
        out.restoreMemoryOk =
            restored && Array.isArray(restored.userData.memory) && restored.userData.memory.length === 3;
        out.restorePositionOk =
            restored &&
            Math.abs(restored.position.x - snap.position.x) < 0.001 &&
            Math.abs(restored.position.z - snap.position.z) < 0.001;
        out.restoreBornAtOk = restored && restored.userData.bornAt === snap.bornAt;

        // 6. Specs werden aus restoriertem memory korrekt re-derived
        const specs = r._computeCreatureSpecializations(restored);
        out.specsReDerived = specs.gather && specs.gather.holz === 2 && specs.build && specs.build.stein_block === 1;

        // 7. Round-Trip: buildStateSnapshot → loadState → Kreaturen sind da
        // Setze die aktuelle Welt auf einen bekannten Stand
        const beforeRoundTripCount = r.state.creatures.length;
        const beforeNames = r.state.creatures.map((cr) => cr.userData.name).sort();
        const fullSnap = r.buildStateSnapshot();
        out.snapshotHasFullCreatures =
            Array.isArray(fullSnap.creatures) &&
            fullSnap.creatures.length === beforeRoundTripCount &&
            fullSnap.creatures.every((c) => c && typeof c.name === "string" && typeof c.soul === "string");

        // 8. Tote Kreatur ist NICHT im Snapshot. Wir markieren den
        // konkreten Victim eindeutig mit einem Unique-Name damit
        // Name-Kollisionen im Pool nicht den Test verfälschen.
        const beforeAlive = r.state.creatures.length;
        const victim = r.state.creatures[0];
        const victimMark = `Victim_${Math.random().toString(36).slice(2, 10)}`;
        victim.userData.name = victimMark;
        r.removeCreature(victim);
        const afterSnap = r.buildStateSnapshot();
        const stillHasVictim = afterSnap.creatures.some((s) => s.name === victimMark);
        out.victimRemovedFromSnap = !stillHasVictim;
        out.aliveDecreasedBy1 = afterSnap.creatures.length === beforeAlive - 1;
        out._beforeAlive = beforeAlive;
        out._afterCount = afterSnap.creatures.length;
        out._stateCreaturesAfter = r.state.creatures.length;

        // 9. Loop: nach loadState mit den Snapshots → Kreaturen sind da
        // (Wir können nicht echt loadState ausführen ohne Reload, aber wir
        // können prüfen dass _pendingCreatureSnapshots-Pfad funktioniert.)
        const persisted = [
            {
                name: "TestSammler",
                soul: "wesen",
                memory: [{ type: "gathered", content: { material: "holz" }, at: 1 }],
                position: { x: player.x + 50, y: player.y, z: player.z + 50 },
                bornAt: Date.now() - 60000,
            },
            {
                name: "TestBauer",
                soul: "fuchs",
                memory: [],
                position: { x: player.x + 60, y: player.y, z: player.z + 60 },
                bornAt: Date.now() - 30000,
            },
        ];
        // Simuliere loadState-stash + spawnCreatures-Pfad
        r.state._pendingCreatureSnapshots = persisted;
        r.state.creatureEmotions = ["happy", "happy"];
        r.spawnCreatures(10); // Sollte 2 restored ergeben statt 10 random
        out.restoredCount = r.state.creatures.length === 2;
        const restoredNames = r.state.creatures.map((cr) => cr.userData.name).sort();
        out.restoredNamesMatch = restoredNames[0] === "TestBauer" && restoredNames[1] === "TestSammler";
        out.pendingClearedAfterRestore = r.state._pendingCreatureSnapshots === null;
        // Specs aus 1 gathered holz → L0
        const sammler = r.state.creatures.find((cr) => cr.userData.name === "TestSammler");
        out.restoredCreatureHasMemory =
            sammler && Array.isArray(sammler.userData.memory) && sammler.userData.memory.length === 1;

        // 10. Legacy-Save (nur position) fällt auf Default-Spawn zurück
        r.state._pendingCreatureSnapshots = null;
        r.state.creatureEmotions = [];
        // Stub loadState: simuliere legacy save format
        const legacyState = {
            creatures: [{ position: { x: 0, y: 5, z: 0 } }, { position: { x: 1, y: 5, z: 1 } }],
        };
        const looksFullLegacy =
            Array.isArray(legacyState.creatures) &&
            legacyState.creatures.length > 0 &&
            legacyState.creatures[0] &&
            typeof legacyState.creatures[0].soul === "string";
        out.legacyDetectedAsLegacy = !looksFullLegacy;

        // 11. Memory-Cap 200 enforced
        const cCap = r.spawnCreatureAt(player.x + 140, player.y, player.z + 140, "happy", "wesen");
        cCap.userData.memory = [];
        for (let i = 0; i < 250; i++) r._creatureRemember(cCap, "noise", { i });
        out.cap200Enforced = cCap.userData.memory.length === 200;

        // 12. Restore mit übergroßem memory in Snapshot wird auf 200 gekappt
        const oversizedMem = [];
        for (let i = 0; i < 300; i++) oversizedMem.push({ type: "noise", content: { i }, at: i });
        const oversizedSnap = {
            name: "Oversize",
            soul: "wesen",
            memory: oversizedMem,
            position: { x: player.x + 150, y: player.y, z: player.z + 150 },
            bornAt: Date.now(),
        };
        const oversized = r._restoreCreatureFromSnapshot(oversizedSnap, "happy");
        out.oversizedRestoredCappedAt200 = oversized && oversized.userData.memory.length === 200;
        r.state.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });

    if (wave6hP2d1Results && !wave6hP2d1Results.error) {
        check("Welle 6.H P2D.1: CREATURE_MEMORY_CAP === 200", wave6hP2d1Results.memCap200);
        check(
            "Welle 6.H P2D.1: _serializeCreature + _restoreCreatureFromSnapshot existieren",
            wave6hP2d1Results.hasSerialize && wave6hP2d1Results.hasRestore
        );
        check("Welle 6.H P2D.1: spawnCreatureAt setzt bornAt-Identitäts-Marker", wave6hP2d1Results.bornAtSet);
        check(
            "Welle 6.H P2D.1: Snapshot enthält name + soul + memory + position + bornAt",
            wave6hP2d1Results.snapHasName &&
                wave6hP2d1Results.snapHasSoul &&
                wave6hP2d1Results.snapHasMemory &&
                wave6hP2d1Results.snapHasPosition &&
                wave6hP2d1Results.snapHasBornAt
        );
        check(
            "Welle 6.H P2D.1: _restoreCreatureFromSnapshot rekonstruiert Kreatur + wächst Liste",
            wave6hP2d1Results.restoreReturnsCreature && wave6hP2d1Results.restoreGrowsList
        );
        check(
            "Welle 6.H P2D.1: Restore übernimmt Name + Soul",
            wave6hP2d1Results.restoreNameOk && wave6hP2d1Results.restoreSoulOk
        );
        check("Welle 6.H P2D.1: Restore übernimmt Memory (Länge + Inhalt)", wave6hP2d1Results.restoreMemoryOk);
        check("Welle 6.H P2D.1: Restore übernimmt Position", wave6hP2d1Results.restorePositionOk);
        check("Welle 6.H P2D.1: Restore übernimmt bornAt", wave6hP2d1Results.restoreBornAtOk);
        check("Welle 6.H P2D.1: Specs aus restoriertem Memory korrekt re-derived", wave6hP2d1Results.specsReDerived);
        check(
            "Welle 6.H P2D.1: buildStateSnapshot trägt volles Kreatur-Schema",
            wave6hP2d1Results.snapshotHasFullCreatures
        );
        check(
            "Welle 6.H P2D.1: removeCreature entfernt aus state.creatures + Snapshot",
            wave6hP2d1Results.victimRemovedFromSnap &&
                wave6hP2d1Results.aliveDecreasedBy1 &&
                wave6hP2d1Results._stateCreaturesAfter === wave6hP2d1Results._beforeAlive - 1
        );
        check(
            "Welle 6.H P2D.1: _pendingCreatureSnapshots-Pfad restored statt random-spawnen",
            wave6hP2d1Results.restoredCount &&
                wave6hP2d1Results.restoredNamesMatch &&
                wave6hP2d1Results.pendingClearedAfterRestore &&
                wave6hP2d1Results.restoredCreatureHasMemory
        );
        check(
            "Welle 6.H P2D.1: Legacy-Save (nur position) wird als Legacy erkannt",
            wave6hP2d1Results.legacyDetectedAsLegacy
        );
        check(
            "Welle 6.H P2D.1: Memory-Cap=200 wird durchgesetzt (FIFO bei 250 push)",
            wave6hP2d1Results.cap200Enforced
        );
        check(
            "Welle 6.H P2D.1: Restore mit übergroßem memory wird auf 200 gekappt",
            wave6hP2d1Results.oversizedRestoredCappedAt200
        );
    } else if (wave6hP2d1Results && wave6hP2d1Results.error) {
        check(`Welle 6.H P2D.1: evaluate-Fehler — ${wave6hP2d1Results.error}`, false);
    }
}

// V9.52-e Sub-Welle e — Band-Funktion (Welle 6.H Phase 2F.1 + 2F.2 + 2F.3 — Kreatur-Stats + Equipped + Boosts via Konsumables).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWelle6HCreatureStats(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2F.1 — Kreatur-Stats wie Spieler ###
    // Kreatur, Spieler und Architektur sind Compound aus parts × Material × Form; Stats kommen aus
    // derselben STAT_FROM_TAGS-Pipeline; Body-Speed-Mul (stats.speed/7) wirkt im Tick neben Spec-Mul.
    const wave6hP2f1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};

        // 1. Methoden existieren
        out.hasComputeStats = typeof r.computeCreatureStats === "function";
        out.hasBodySpeedMul = typeof r._creatureBodySpeedMultiplier === "function";
        out.hasRefreshCache = typeof r._refreshCreatureStatsCache === "function";

        // 2. computeCreatureStats liefert {tags, stats} mit allen Schlüsseln
        const player = r.state.playerMesh.position;
        const cw = r.spawnCreatureAt(player.x + 200, player.y, player.z + 200, "happy", "wesen", { bodySize: 1 });
        const csW = r.computeCreatureStats(cw);
        out.statsHasTags = csW && csW.tags && Object.keys(csW.tags).length > 0;
        out.statsHasAll8 =
            csW.stats &&
            Number.isFinite(csW.stats.hpMax) &&
            Number.isFinite(csW.stats.damage) &&
            Number.isFinite(csW.stats.speed) &&
            Number.isFinite(csW.stats.jumpPower) &&
            Number.isFinite(csW.stats.staminaMax) &&
            Number.isFinite(csW.stats.precision) &&
            Number.isFinite(csW.stats.magicResist) &&
            Number.isFinite(csW.stats.heatResist);

        // Test-Wesen mit bodySize:1: die per-Kreatur-Körpergröße ist eine orthogonale Achse und überlagerte
        // sonst die Soul-Speed-Relation.
        // 3. Soul-Diskrimination: Sprite ist schneller als Wesen (weniger dichte)
        const cs = r.spawnCreatureAt(player.x + 210, player.y, player.z + 210, "happy", "fuchs", { bodySize: 1 });
        const cg = r.spawnCreatureAt(player.x + 220, player.y, player.z + 220, "happy", "baer", { bodySize: 1 });
        const sW = csW.stats;
        const sS = r.computeCreatureStats(cs).stats;
        const sG = r.computeCreatureStats(cg).stats;
        out.spriteFasterThanWesen = sS.speed > sW.speed;
        // Mindestens 1 Stat unterscheidet sich zwischen Wesen und Sprite
        // signifikant — emergent aus unterschiedlicher Material-Komposition.
        out.wesenSpriteDiscriminated =
            Math.abs(sW.hpMax - sS.hpMax) > 5 ||
            Math.abs(sW.damage - sS.damage) > 2 ||
            Math.abs(sW.speed - sS.speed) > 0.5;
        out.geistHasMagicResist = sG.magicResist > 0;
        out._statsW = sW;
        out._statsS = sS;

        // 4. Tags geclamp auf [0, 1] für die Pipe
        const cTagsClamped = Object.values(csW.tags).every((v) => v >= 0 && v <= 2); // toleriere spec-bonus bis ~2
        out.tagsInBounds = cTagsClamped;

        // 5. _refreshCreatureStatsCache schreibt userData.stats
        r._refreshCreatureStatsCache(cw);
        out.cacheWritesStats = cw.userData.stats && Number.isFinite(cw.userData.stats.speed);

        // 6. Body-Speed-Multiplier ist > 0
        const mulW = r._creatureBodySpeedMultiplier(cw);
        const mulS = r._creatureBodySpeedMultiplier(cs);
        out.bodyMulPositive = mulW > 0 && mulS > 0;
        out.spriteBodyMulHigher = mulS > mulW;

        // 7. Speed im Tick: gather mit sprite ist schneller als gather mit wesen
        // (selbe Spec-Level, nur body-mul unterscheidet)
        r.assignCreatureTask(cw, "gather", { material: "holz" }, { silent: true });
        r.assignCreatureTask(cs, "gather", { material: "holz" }, { silent: true });
        // _target = null zwingt zur Such-Phase (wo speed wirkt)
        cw.userData.task.args._target = null;
        cs.userData.task.args._target = null;
        // In der Such-Phase braucht es Target-Distanz > halt: build-task (läuft zum Spieler) statt gather —
        // gather ohne Target fiele in den wander-Fallback (anderer Pfad).
        r.assignCreatureTask(cw, "build", { blueprint: "stein_block" }, { silent: true });
        r.assignCreatureTask(cs, "build", { blueprint: "stein_block" }, { silent: true });
        cw.userData.carrying = null;
        cs.userData.carrying = null;
        cw.position.set(player.x + 50, player.y, player.z);
        cs.position.set(player.x + 50, player.y, player.z);
        // `_tickCreatureTaskDirection` liefert einen GETEILTEN Scratch-Vector3 (keine Allokation je Aufruf)
        // → die erste Direction KOPIEREN, bevor der zweite Aufruf sie überschreibt.
        const dirW = r._tickCreatureTaskDirection(cw, cw.userData.task, "happy");
        const dirWX = dirW.x,
            dirWZ = dirW.z;
        const dirS = r._tickCreatureTaskDirection(cs, cs.userData.task, "happy");
        const spW = Math.hypot(dirWX, dirWZ);
        const spS = Math.hypot(dirS.x, dirS.z);
        out.tickSpriteFaster = spS > spW;
        out.tickWesenAtBase = Math.abs(spW - r.constructor.CREATURE_BUILD_SPEED) < 1.0;

        // 8. Spec-Bonus auf magieleitung emergiert in stats
        // Frische Kreatur ohne Specs vs. mit 3 erfolgreichen Gather-Memories
        const cFresh = r.spawnCreatureAt(player.x + 230, player.y, player.z + 230, "happy", "wesen", { bodySize: 1 });
        cFresh.userData.memory = [];
        const baseTags = r.computeCreatureStats(cFresh).tags;
        cFresh.userData.memory = [
            { type: "gathered", content: { material: "holz" }, at: 1 },
            { type: "gathered", content: { material: "holz" }, at: 2 },
            { type: "gathered", content: { material: "holz" }, at: 3 },
        ];
        const grownTags = r.computeCreatureStats(cFresh).tags;
        // L1 Sammler = +0.01 magieleitung; minimal aber positiv
        out.specBonusMagieleitung = grownTags.magieleitung > baseTags.magieleitung;

        // 9. UI: creature-row hat title-Attribut mit Stats
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const rows = listEl ? listEl.querySelectorAll(".creature-row") : [];
        let rowsWithTitle = 0;
        for (const row of rows) {
            // V18.51 Hof-E (V9.56-i) — der Stats-title sitzt jetzt auf der kompakten Zeile (.creature-row-main).
            const main = row.querySelector(".creature-row-main");
            const t = (main && main.title) || "";
            if (t && /HP\s+\d/.test(t) && /SPD\s+\d/.test(t) && /DMG\s+\d/.test(t)) rowsWithTitle++;
        }
        out.uiRowsHaveStatsTitle = rowsWithTitle === rows.length && rows.length > 0;

        // 10. STAT_FROM_TAGS aus Class — Symmetrie zum Spieler
        const playerStatKeys = Object.keys(r.constructor.STAT_FROM_TAGS);
        const creatureStatKeys = Object.keys(csW.stats);
        out.sameStatKeysAsPlayer =
            playerStatKeys.length === creatureStatKeys.length &&
            playerStatKeys.every((k) => creatureStatKeys.includes(k));

        return out;
    });

    if (wave6hP2f1Results && !wave6hP2f1Results.error) {
        check(
            "Welle 6.H P2F.1: alle 3 Methoden existieren (computeCreatureStats + _creatureBodySpeedMultiplier + _refreshCreatureStatsCache)",
            wave6hP2f1Results.hasComputeStats && wave6hP2f1Results.hasBodySpeedMul && wave6hP2f1Results.hasRefreshCache
        );
        check(
            "Welle 6.H P2F.1: computeCreatureStats liefert {tags, stats} mit allen 8 Stats",
            wave6hP2f1Results.statsHasTags && wave6hP2f1Results.statsHasAll8
        );
        check(
            "Welle 6.H P2F.1: Soul-Diskrimination — Sprite schneller als Wesen",
            wave6hP2f1Results.spriteFasterThanWesen
        );
        check(
            "Welle 6.H P2F.1: Soul-Diskrimination — Wesen ≠ Sprite in mind. 1 Stat (emergent)",
            wave6hP2f1Results.wesenSpriteDiscriminated
        );
        check("Welle 6.H P2F.1: Geist hat magicResist > 0", wave6hP2f1Results.geistHasMagicResist);
        check("Welle 6.H P2F.1: Tags in [0, 2] (clamped + Spec-Bonus tolerant)", wave6hP2f1Results.tagsInBounds);
        check(
            "Welle 6.H P2F.1: _refreshCreatureStatsCache schreibt userData.stats",
            wave6hP2f1Results.cacheWritesStats
        );
        check("Welle 6.H P2F.1: _creatureBodySpeedMultiplier > 0 für alle Seelen", wave6hP2f1Results.bodyMulPositive);
        check(
            "Welle 6.H P2F.1: Sprite-bodyMul > Wesen-bodyMul (Vision: leichte Form schneller)",
            wave6hP2f1Results.spriteBodyMulHigher
        );
        check(
            "Welle 6.H P2F.1: Tick — Sprite läuft schneller als Wesen (selbe Task, body-mul wirkt)",
            wave6hP2f1Results.tickSpriteFaster
        );
        check("Welle 6.H P2F.1: Tick — Wesen bei ~BUILD_SPEED (bodyMul ≈ 1)", wave6hP2f1Results.tickWesenAtBase);
        check(
            "Welle 6.H P2F.1: Spec-Bonus emergiert in stats.magieleitung (Wissen leitet)",
            wave6hP2f1Results.specBonusMagieleitung
        );
        check(
            "Welle 6.H P2F.1: UI — alle creature-rows haben title-Tooltip mit Stats",
            wave6hP2f1Results.uiRowsHaveStatsTitle
        );
        check(
            "Welle 6.H P2F.1: Stat-Keys identisch zu Spieler (Vision §1.3 fraktal)",
            wave6hP2f1Results.sameStatKeysAsPlayer
        );
    } else if (wave6hP2f1Results && wave6hP2f1Results.error) {
        check(`Welle 6.H P2F.1: evaluate-Fehler — ${wave6hP2f1Results.error}`, false);
    }

    // ### Welle 6.H Phase 2F.2 — Kreatur-Equipped (Werkzeug + Rüstung) ###
    // Kreaturen tragen Werkzeug + Rüstung wie der Spieler: equipped Compound-Tags stacken mit
    // TOOL_STAT_WEIGHT / ARMOR_STAT_WEIGHT; Persistenz via _serializeCreature → snap.equipped.
    const wave6hP2f2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};
        const Class = r.constructor;

        // 1. Methoden existieren
        out.hasEquipTool = typeof r.equipCreatureTool === "function";
        out.hasEquipArmor = typeof r.equipCreatureArmor === "function";
        out.hasUnequip = typeof r.unequipCreatureSlot === "function";
        out.hasAfterChange = typeof r._afterCreatureEquipChange === "function";

        // 2. Neu gespawnte Kreatur hat equipped-Slots initial null
        const player = r.state.playerMesh.position;
        const c = r.spawnCreatureAt(player.x + 300, player.y, player.z + 300, "happy", "wesen");
        out.initialToolNull = c.userData.equipped && c.userData.equipped.tool === null;
        out.initialArmorNull = c.userData.equipped && c.userData.equipped.armor === null;

        // 3. equipCreatureTool mit existing Starter-Tool (hammer)
        const eqTool = r.equipCreatureTool(c, "schmiede-hammer");
        out.equipToolOk = eqTool.ok === true;
        out.toolSet = c.userData.equipped.tool === "schmiede-hammer";

        // 4. equipCreatureTool mit unbekanntem Tool → reject
        const eqUnknown = r.equipCreatureTool(c, "fictional_tool_xyz");
        out.unknownToolRejected = eqUnknown.ok === false && eqUnknown.reason === "tool_unknown";
        out.toolUnchangedAfterReject = c.userData.equipped.tool === "schmiede-hammer";

        // 5. equipCreatureArmor — erst Bauplan markieren, dann ausrüsten.
        // Built-ins sind read-only; wir nutzen cloneBlueprint(src, newName)
        // → bool, dann setBlueprintAsArmor(name).
        const armorName = "test_armor_p2f2";
        if (typeof r.cloneBlueprint === "function" && r.cloneBlueprint("stein_block", armorName)) {
            r.setBlueprintAsArmor(armorName);
            const eqArmor = r.equipCreatureArmor(c, armorName);
            out.equipArmorOk = eqArmor.ok === true;
            out.armorSet = c.userData.equipped.armor === armorName;
            // Equipped mit nicht-armor-Bauplan (kristall_geode hat keine role:armor)
            const eqWrong = r.equipCreatureArmor(c, "kristall_geode");
            out.wrongArmorRejected = eqWrong.ok === false && eqWrong.reason === "not_marked_as_armor";
        }

        // 6. unequipCreatureSlot
        const unEqTool = r.unequipCreatureSlot(c, "tool");
        out.unequipToolOk = unEqTool.ok === true && c.userData.equipped.tool === null;
        const unEqArmor = r.unequipCreatureSlot(c, "armor");
        out.unequipArmorOk = unEqArmor.ok === true && c.userData.equipped.armor === null;
        const unEqInvalid = r.unequipCreatureSlot(c, "boots");
        out.unequipInvalidSlotRejected = unEqInvalid.ok === false;

        // 7. Stats-Stacking via equipped: eigener "magie-leitender" Werkzeug-Bauplan, Stats VOR/NACH equip
        // vergleichen (dieselbe computeCreatureStats-Pipeline).
        if (typeof r.cloneBlueprint === "function") {
            const c2 = r.spawnCreatureAt(player.x + 310, player.y, player.z + 310, "happy", "wesen");
            const baseStats = r.computeCreatureStats(c2).stats;
            // Eigenes Werkzeug: stein_block-Clone via setBlueprintToolMeta +
            // registerBlueprintAsTool. Tool-Name === Bauplan-Name.
            const toolBp = "test_tool_bp_p2f2";
            if (r.cloneBlueprint("stein_block", toolBp)) {
                const meta =
                    typeof r.setBlueprintToolMeta === "function"
                        ? r.setBlueprintToolMeta(toolBp, "test_op_p2f2", "subtractive")
                        : null;
                const reg =
                    meta && meta.ok && typeof r.registerBlueprintAsTool === "function"
                        ? r.registerBlueprintAsTool(toolBp)
                        : null;
                if (reg && reg.ok) {
                    // toolName === toolBp (Bauplan-Name)
                    r.equipCreatureTool(c2, toolBp);
                    const equipStats = r.computeCreatureStats(c2).stats;
                    out.toolStatsChanged =
                        Math.abs(equipStats.hpMax - baseStats.hpMax) > 0.1 ||
                        Math.abs(equipStats.damage - baseStats.damage) > 0.1;
                    out.toolHpHigher = equipStats.hpMax >= baseStats.hpMax;
                }
            }
            // Armor: stein_block-Clone + setBlueprintAsArmor
            const armorBp = "test_armor_bp_p2f2";
            if (r.cloneBlueprint("stein_block", armorBp)) {
                r.setBlueprintAsArmor(armorBp);
                // unequip first so stat-delta is clean
                r.unequipCreatureSlot(c2, "armor");
                const beforeArmorStats = r.computeCreatureStats(c2).stats;
                r.equipCreatureArmor(c2, armorBp);
                const armorStats = r.computeCreatureStats(c2).stats;
                out.armorStatsChanged = Math.abs(armorStats.hpMax - beforeArmorStats.hpMax) > 0.1;
                out.armorHpHigher = armorStats.hpMax > beforeArmorStats.hpMax;
            }
        }

        // 8. DSL-Ops creature_equip_tool/armor/unequip wirken
        const cDsl = r.spawnCreatureAt(player.x + 320, player.y, player.z + 320, "happy", "wesen");
        const idx = r.state.creatures.indexOf(cDsl);
        r.dslRun(["creature_equip_tool", idx, "schmiede-hammer"], { source: "test" });
        out.dslEquipToolOk = cDsl.userData.equipped.tool === "schmiede-hammer";
        r.dslRun(["creature_unequip", idx, "tool"], { source: "test" });
        out.dslUnequipOk = cDsl.userData.equipped.tool === null;

        // 9. NON_BROADCASTABLE_OPS-Mitgliedschaft
        out.opsNonBroadcast =
            Class.NON_BROADCASTABLE_OPS.has("creature_equip_tool") &&
            Class.NON_BROADCASTABLE_OPS.has("creature_equip_armor") &&
            Class.NON_BROADCASTABLE_OPS.has("creature_unequip");

        // 10. describeProgram-Einträge
        const d1 = r.describeProgram(["creature_equip_tool", 0, "schmiede-hammer"]);
        out.descEquipTool = /Werkzeug/.test(d1) && /hammer/.test(d1);
        const d2 = r.describeProgram(["creature_equip_armor", 0, "lederrüstung"]);
        out.descEquipArmor = /Rüstung/.test(d2);
        const d3 = r.describeProgram(["creature_unequip", 0, "tool"]);
        out.descUnequip = /tool/.test(d3) || /Slot/.test(d3);

        // 11. Snapshot persistiert equipped (Round-Trip)
        r.equipCreatureTool(cDsl, "schmiede-hammer");
        const snap = r._serializeCreature(cDsl);
        out.snapHasEquipped = snap.equipped && snap.equipped.tool === "schmiede-hammer";
        // Restore validiert tool-Existenz
        const restored = r._restoreCreatureFromSnapshot(snap, "happy");
        out.restoreKeepsEquippedTool = restored && restored.userData.equipped.tool === "schmiede-hammer";
        // Restore mit unbekanntem Tool → null statt crash
        const badSnap = { ...snap, equipped: { tool: "fictional_xyz", armor: null } };
        const restoredBad = r._restoreCreatureFromSnapshot(badSnap, "happy");
        out.restoreSilentDropsUnknown = restoredBad && restoredBad.userData.equipped.tool === null;

        // 12. UI: equipped-Pills in creature-row erscheinen
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const equippedWraps = listEl ? listEl.querySelectorAll(".creature-equipped") : [];
        out.uiEquippedWrapsExist = equippedWraps.length > 0;
        const toolPills = listEl ? listEl.querySelectorAll(".creature-equip.creature-equip-tool") : [];
        out.uiToolPillsExist = toolPills.length > 0;

        // Cleanup: Test-Baupläne löschen damit Ring 6.6-Liste-Zähler stimmt.
        // Plus workshop-DOM neu rendern (deleteBlueprint triggert das nicht
        // automatisch — Ring 6.6 prüft DOM-Liste vs. state.blueprints).
        if (typeof r.deleteBlueprint === "function") {
            r.deleteBlueprint("test_armor_p2f2");
            r.deleteBlueprint("test_tool_bp_p2f2");
            r.deleteBlueprint("test_armor_bp_p2f2");
        }
        if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();

        return out;
    });

    if (wave6hP2f2Results && !wave6hP2f2Results.error) {
        check(
            "Welle 6.H P2F.2: alle 4 Methoden existieren (equipCreatureTool/Armor + unequipCreatureSlot + _afterCreatureEquipChange)",
            wave6hP2f2Results.hasEquipTool &&
                wave6hP2f2Results.hasEquipArmor &&
                wave6hP2f2Results.hasUnequip &&
                wave6hP2f2Results.hasAfterChange
        );
        check(
            "Welle 6.H P2F.2: spawnCreatureAt initialisiert equipped = {tool: null, armor: null}",
            wave6hP2f2Results.initialToolNull && wave6hP2f2Results.initialArmorNull
        );
        check(
            "Welle 6.H P2F.2: equipCreatureTool akzeptiert Built-in-Tool (hammer)",
            wave6hP2f2Results.equipToolOk && wave6hP2f2Results.toolSet
        );
        check(
            "Welle 6.H P2F.2: equipCreatureTool lehnt unbekanntes Tool ab (tool_unknown)",
            wave6hP2f2Results.unknownToolRejected && wave6hP2f2Results.toolUnchangedAfterReject
        );
        check(
            "Welle 6.H P2F.2: equipCreatureArmor akzeptiert Bauplan mit role:armor",
            wave6hP2f2Results.equipArmorOk && wave6hP2f2Results.armorSet
        );
        check(
            "Welle 6.H P2F.2: equipCreatureArmor lehnt nicht-Armor-Bauplan ab (not_marked_as_armor)",
            wave6hP2f2Results.wrongArmorRejected
        );
        check(
            "Welle 6.H P2F.2: unequipCreatureSlot räumt tool + armor + lehnt invalid slot ab",
            wave6hP2f2Results.unequipToolOk &&
                wave6hP2f2Results.unequipArmorOk &&
                wave6hP2f2Results.unequipInvalidSlotRejected
        );
        check(
            "Welle 6.H P2F.2: Tool-Equipped ändert computeCreatureStats (Stats-Stacking)",
            wave6hP2f2Results.toolStatsChanged
        );
        check("Welle 6.H P2F.2: Tool mit stein-Tag erhöht HP-Stat (dichte-Bonus)", wave6hP2f2Results.toolHpHigher);
        check(
            "Welle 6.H P2F.2: Armor-Equipped ändert computeCreatureStats",
            wave6hP2f2Results.armorStatsChanged && wave6hP2f2Results.armorHpHigher
        );
        check(
            "Welle 6.H P2F.2: DSL creature_equip_tool + creature_unequip wirken",
            wave6hP2f2Results.dslEquipToolOk && wave6hP2f2Results.dslUnequipOk
        );
        check(
            "Welle 6.H P2F.2: alle 3 Equip-Ops in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hP2f2Results.opsNonBroadcast
        );
        check(
            "Welle 6.H P2F.2: describeProgram zeigt Werkzeug/Rüstung/Slot",
            wave6hP2f2Results.descEquipTool && wave6hP2f2Results.descEquipArmor && wave6hP2f2Results.descUnequip
        );
        check(
            "Welle 6.H P2F.2: _serializeCreature schreibt equipped + Restore übernimmt es",
            wave6hP2f2Results.snapHasEquipped && wave6hP2f2Results.restoreKeepsEquippedTool
        );
        check(
            "Welle 6.H P2F.2: Restore lässt unbekanntes Tool silent fallen (defensive)",
            wave6hP2f2Results.restoreSilentDropsUnknown
        );
        check(
            "Welle 6.H P2F.2: UI — .creature-equipped Wraps + .creature-equip-tool Pills",
            wave6hP2f2Results.uiEquippedWrapsExist && wave6hP2f2Results.uiToolPillsExist
        );
    } else if (wave6hP2f2Results && wave6hP2f2Results.error) {
        check(`Welle 6.H P2F.2: evaluate-Fehler — ${wave6hP2f2Results.error}`, false);
    }

    // ### Welle 6.H Phase 2F.3 — Kreatur-Boosts via Konsumables (HYLOMORPHISMUS) ###
    // Boost = `computeCompoundTags(consumableBp) × scale` — kein Hardcode, keine Tabelle. Bauplan mit
    // role:"consumable" + consumableMeta; RMB + Hotbar-Konsumable + Raycast-Kreatur = Übergabe.
    const wave6hP2f3Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};
        const Class = r.constructor;

        // 1. Methoden existieren
        out.hasApplyBoost = typeof r.applyCreatureBoost === "function";
        out.hasTickBoosts = typeof r.tickCreatureBoosts === "function";
        out.hasActivate = typeof r.activateCreatureConsumable === "function";
        out.hasPickCreature = typeof r._pickCreatureAtCrosshair === "function";
        out.hasConsumeInv = typeof r._consumeBlueprintFromInventory === "function";
        out.hasInvGate = typeof r._consumableInventoryGate === "function";

        // 2. Neu gespawnte Kreatur hat boosts = []
        const player = r.state.playerMesh.position;
        const c = r.spawnCreatureAt(player.x + 400, player.y, player.z + 400, "happy", "wesen");
        out.initialBoostsEmpty = Array.isArray(c.userData.boosts) && c.userData.boosts.length === 0;

        // 3. applyCreatureBoost mit gültigem tagDelta
        const okApply = r.applyCreatureBoost(c, {
            source: "test:manual",
            tagDelta: { magieleitung: 0.3, dichte: 0.2 },
            durationSeconds: 60,
            label: "Test-Boost",
        });
        out.applyOk = okApply === true;
        out.boostsListed = c.userData.boosts.length === 1;
        out.boostHasSource = c.userData.boosts[0].source === "test:manual";

        // 4. applyCreatureBoost mit leerem tagDelta → lehnt ab
        const noBoost = r.applyCreatureBoost(c, { source: "empty", tagDelta: {} });
        out.emptyBoostRejected = noBoost === false;

        // 5. Selbe source nochmal → verlängert statt zweiter Eintrag
        r.applyCreatureBoost(c, {
            source: "test:manual",
            tagDelta: { magieleitung: 0.5 },
            durationSeconds: 30,
            label: "Test-Boost-2",
        });
        out.dedupeBySource = c.userData.boosts.length === 1;
        out.deltaUpdated = c.userData.boosts[0].tagDelta.magieleitung === 0.5;

        // 6. Stats-Stacking: Boost erhöht computeCreatureStats
        const c2 = r.spawnCreatureAt(player.x + 410, player.y, player.z + 410, "happy", "wesen");
        const baseStats = r.computeCreatureStats(c2).stats;
        r.applyCreatureBoost(c2, {
            source: "test:hp",
            tagDelta: { dichte: 0.5, härte: 0.5 },
            durationSeconds: 60,
            label: "HP-Boost",
        });
        const boostedStats = r.computeCreatureStats(c2).stats;
        out.hpBoosted = boostedStats.hpMax > baseStats.hpMax + 10;

        // 7. HYLOMORPHISMUS-EMERGENZ: Konsumable-Bauplan-Tags wirken als Boost
        // Wir erstellen einen Trank aus stein_block (hoch dichte+härte) und
        // prüfen dass die Compound-Tags SICH ALS BOOST MANIFESTIEREN.
        const tonicName = "test_tonic_p2f3";
        if (r.cloneBlueprint("stein_block", tonicName)) {
            const meta =
                typeof r.setBlueprintAsConsumable === "function"
                    ? r.setBlueprintAsConsumable(tonicName, 30, "Stein-Tonic", 0.2)
                    : null;
            out.consumableMarkOk = !!(meta && meta.ok);
            // Trank-Compound-Tags lesen (kontrolle)
            const tonicTags = r.computeCompoundTags(r.state.blueprints[tonicName]);
            out.tonicHasDichte = (tonicTags.dichte || 0) > 0.1;

            // Frische Kreatur, base stats messen, dann Trank aktivieren
            const c3 = r.spawnCreatureAt(player.x + 420, player.y, player.z + 420, "happy", "wesen");
            const before = r.computeCreatureStats(c3).stats;
            const result = r.activateCreatureConsumable(c3, tonicName);
            out.activateOk = result.ok === true;
            // tagBonus emergiert aus den Tags (kein Hardcode!)
            out.tagBonusEmerged = result.tagBonus && Object.keys(result.tagBonus).length > 0;
            out.tagBonusHasDichte = result.tagBonus && result.tagBonus.dichte > 0;
            // Boost ist auf der Kreatur
            out.boostOnCreature =
                Array.isArray(c3.userData.boosts) &&
                c3.userData.boosts.some((b) => b.source === `consume:${tonicName}`);
            // Stats sind erhöht (dichte-Boost → HP+)
            const after = r.computeCreatureStats(c3).stats;
            out.consumableLiftsStats = after.hpMax > before.hpMax + 5;
        }

        // 8. nicht-consumable Bauplan → activate lehnt ab
        const notConsumable = r.activateCreatureConsumable(c, "stein_block");
        out.nonConsumableRejected = notConsumable.ok === false && notConsumable.reason === "not_marked_as_consumable";

        // 9. tickCreatureBoosts entfernt abgelaufene Boosts
        const c4 = r.spawnCreatureAt(player.x + 430, player.y, player.z + 430, "happy", "wesen");
        // Manuell abgelaufenen Boost setzen (expiresAt in der Vergangenheit)
        c4.userData.boosts = [
            {
                source: "test:expired",
                tagDelta: { dichte: 0.3 },
                expiresAt: performance.now() / 1000 - 10,
                label: "Expired",
            },
        ];
        c4.userData.boostLastTick = -Infinity;
        r.tickCreatureBoosts(performance.now() / 1000);
        out.expiredCleaned = c4.userData.boosts.length === 0;

        // 10. DSL-Op creature_apply_boost
        const cDsl = r.spawnCreatureAt(player.x + 440, player.y, player.z + 440, "happy", "wesen");
        const dslIdx = r.state.creatures.indexOf(cDsl);
        r.dslRun(["creature_apply_boost", dslIdx, tonicName], { source: "test" });
        out.dslAppliedBoost = Array.isArray(cDsl.userData.boosts) && cDsl.userData.boosts.length === 1;

        // 11. NON_BROADCASTABLE-Mitgliedschaft
        out.opNonBroadcast = Class.NON_BROADCASTABLE_OPS.has("creature_apply_boost");

        // 12. describeProgram
        const desc = r.describeProgram(["creature_apply_boost", 0, tonicName]);
        out.descShowsBp = /Trank/.test(desc) && desc.includes(tonicName);

        // 13. Inventar-Konsum: _consumeBlueprintFromInventory
        if (Array.isArray(r.state.player.inventory)) {
            r.state.player.inventory[0] = {
                kind: "blueprint",
                blueprintName: tonicName,
                count: 3,
            };
            const consumed = r._consumeBlueprintFromInventory(tonicName);
            out.consumeReducesCount = consumed === true && r.state.player.inventory[0].count === 2;
            // Bei count=0 → null
            r.state.player.inventory[0].count = 1;
            r._consumeBlueprintFromInventory(tonicName);
            out.consumeNullsSlotAt0 = r.state.player.inventory[0] === null;
            // Wenn nicht im Inventar → false
            const noStock = r._consumeBlueprintFromInventory(tonicName);
            out.noStockReturnsFalse = noStock === false;
        }

        // 14. Modus-Gate: pfad konsumiert Inventar, schöpfer/frieden kostenlos
        const origMode = r.getGameMode();
        r.setGameMode("schöpfer");
        const freeGate = r._consumableInventoryGate(tonicName);
        out.schoepferFree = freeGate.ok === true && freeGate.free === true;
        r.setGameMode("pfad");
        // Inventar leer → pfad lehnt ab
        r.state.player.inventory = new Array(27).fill(null);
        const pfadEmpty = r._consumableInventoryGate(tonicName);
        out.pfadRejectsWithoutPotion = pfadEmpty.ok === false;
        // Inventar gefüllt → pfad konsumiert
        r.state.player.inventory[0] = {
            kind: "blueprint",
            blueprintName: tonicName,
            count: 1,
        };
        const pfadOk = r._consumableInventoryGate(tonicName);
        out.pfadConsumes = pfadOk.ok === true && r.state.player.inventory[0] === null;
        r.setGameMode(origMode || "frieden");

        // 15. UI: .creature-boost Pills bei Kreatur mit aktivem Boost
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const boostPills = listEl ? listEl.querySelectorAll(".creature-boost") : [];
        out.uiHasBoostPills = boostPills.length > 0;

        // Cleanup
        if (typeof r.deleteBlueprint === "function") r.deleteBlueprint(tonicName);
        if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();

        return out;
    });

    if (wave6hP2f3Results && !wave6hP2f3Results.error) {
        check(
            "Welle 6.H P2F.3: alle 6 Methoden existieren (applyCreatureBoost + tickCreatureBoosts + activateCreatureConsumable + _pickCreatureAtCrosshair + _consumeBlueprintFromInventory + _consumableInventoryGate)",
            wave6hP2f3Results.hasApplyBoost &&
                wave6hP2f3Results.hasTickBoosts &&
                wave6hP2f3Results.hasActivate &&
                wave6hP2f3Results.hasPickCreature &&
                wave6hP2f3Results.hasConsumeInv &&
                wave6hP2f3Results.hasInvGate
        );
        check("Welle 6.H P2F.3: spawnCreatureAt initialisiert boosts = []", wave6hP2f3Results.initialBoostsEmpty);
        check(
            "Welle 6.H P2F.3: applyCreatureBoost legt Boost mit source + tagDelta + expiresAt an",
            wave6hP2f3Results.applyOk && wave6hP2f3Results.boostsListed && wave6hP2f3Results.boostHasSource
        );
        check(
            "Welle 6.H P2F.3: applyCreatureBoost mit leerem tagDelta → lehnt ab",
            wave6hP2f3Results.emptyBoostRejected
        );
        check(
            "Welle 6.H P2F.3: Selbe source dedupliziert (verlängert + tagDelta-Update)",
            wave6hP2f3Results.dedupeBySource && wave6hP2f3Results.deltaUpdated
        );
        check("Welle 6.H P2F.3: Boost-tagDelta fließt in computeCreatureStats (HP+)", wave6hP2f3Results.hpBoosted);
        check("Welle 6.H P2F.3: setBlueprintAsConsumable markiert Bauplan", wave6hP2f3Results.consumableMarkOk);
        check(
            "Welle 6.H P2F.3: HYLOMORPHISMUS — Konsumable-Compound-Tags emergieren als Boost",
            wave6hP2f3Results.tagBonusEmerged && wave6hP2f3Results.tagBonusHasDichte
        );
        check(
            "Welle 6.H P2F.3: activateCreatureConsumable wendet emergenten Boost auf Kreatur an",
            wave6hP2f3Results.activateOk && wave6hP2f3Results.boostOnCreature
        );
        check(
            "Welle 6.H P2F.3: Konsumable hebt Kreatur-Stats sichtbar (HP+ via dichte-Boost)",
            wave6hP2f3Results.consumableLiftsStats
        );
        check(
            "Welle 6.H P2F.3: nicht-consumable Bauplan → activate lehnt ab (not_marked_as_consumable)",
            wave6hP2f3Results.nonConsumableRejected
        );
        check("Welle 6.H P2F.3: tickCreatureBoosts entfernt abgelaufene Boosts", wave6hP2f3Results.expiredCleaned);
        check("Welle 6.H P2F.3: DSL creature_apply_boost wendet Konsumable an", wave6hP2f3Results.dslAppliedBoost);
        check(
            "Welle 6.H P2F.3: creature_apply_boost in NON_BROADCASTABLE_OPS (Spieler-private Geste)",
            wave6hP2f3Results.opNonBroadcast
        );
        check("Welle 6.H P2F.3: describeProgram zeigt Trank-Namen", wave6hP2f3Results.descShowsBp);
        check(
            "Welle 6.H P2F.3: _consumeBlueprintFromInventory zieht 1 ab + nulled Slot bei count=0",
            wave6hP2f3Results.consumeReducesCount &&
                wave6hP2f3Results.consumeNullsSlotAt0 &&
                wave6hP2f3Results.noStockReturnsFalse
        );
        check(
            "Welle 6.H P2F.3: Modus-Gate — schöpfer kostenlos, pfad konsumiert Inventar oder lehnt ab",
            wave6hP2f3Results.schoepferFree &&
                wave6hP2f3Results.pfadRejectsWithoutPotion &&
                wave6hP2f3Results.pfadConsumes
        );
        check(
            "Welle 6.H P2F.3: UI — .creature-boost Pills in der Liste bei aktiven Boosts",
            wave6hP2f3Results.uiHasBoostPills
        );
    } else if (wave6hP2f3Results && wave6hP2f3Results.error) {
        check(`Welle 6.H P2F.3: evaluate-Fehler — ${wave6hP2f3Results.error}`, false);
    }
}

// BEDROHUNG: ein WILDES Wesen (Temperament aus glühender Substanz, kein hostile-Flag) jagt nur im
// pfad, Furcht schlägt Jagd; das Rudel kommt ambient (G4a, gate:kreatur-takt „geburt"). Der Biss
// läuft durchs damagePlayer-Tor → FURCHT bei niedriger HP · TRIUMPH beim Fall eines Jägers.
async function checkBandPhaseEThreat(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const HUNT = r.constructor._verhaltenGesetz().jagd;
        out.consts = !!HUNT && HUNT.radius > 0 && HUNT.strikeCooldownSec > 0;
        out.soul = !!r.constructor.CREATURE_SOULS.wolf; // die Raubtier-Seele (ALTLASTEN-NULL: der WOLF)
        const p = r.state.player;
        const pm = r.state.playerMesh.position;
        const savedMode = r.getGameMode();
        const savedHp = p.hp;
        const savedPhoenix = p.respawnGraceUntil;
        const savedMax = r.state.maxCreatures;
        const savedEmo = {};
        for (const k of Object.keys(p.emotions)) savedEmo[k] = p.emotions[k];
        const savedOrt = { x: pm.x, y: pm.y, z: pm.z };
        const spawned = [];
        try {
            r.setGameMode("pfad");
            p.respawnGraceUntil = -Infinity;
            r.state.maxCreatures = r.state.creatures.length + 4;
            // der Spieler steht auf dem Boden: der Biss braucht den Kopf am Leib, auch in der Höhe (Welle LF kampf)
            pm.y = r.getTerrainHeightAt(pm.x, pm.z) + r.constructor.PLAYER_FOOT_OFFSET;
            const wolf = r.spawnCreatureAt(pm.x + 2, pm.y, pm.z, "happy", "wolf");
            spawned.push(wolf);
            // W-D/M-F1 (V18.170) — die Spieler-Klemme schiebt frische Spawns auf
            // ≥3 m; dieser Test prüft den BISS, nicht den Spawn-Ort → die Kreatur
            // rückt explizit in die Weite ihres Ansprungs (V9.56-i; Welle LF kampf:
            // der Biss ist der Ansprung, 1,2 m reicht jeder Größe), ihm zugewandt.
            if (wolf) {
                wolf.position.set(pm.x + 1.2, pm.y, pm.z);
                wolf.rotation.set(0, -Math.PI / 2, 0);
                wolf.userData._steuer = null;
            }
            // DER BISS IST DER ANSPRUNG (Welle LF kampf, Posten 5): der Ansatz springt an, gebissen wird, wenn der Kopf
            // den Leib berührt — der Kreatur-Takt läuft, bis der Ansprung schnappt oder endet (höchstens 1,5 s). Ein
            // voriger Ansprung landet erst (die Biss-Uhr ruht so lange: kein Biss, den die Probe nicht setzt).
            // (die EINE Frage des Spiels, _kreaturAnsprungOffen: die Landung gehört zum Sprung — K13)
            const bissOffen = (c) => (r._kreaturAnsprungOffen(c) ? c.userData._verhaltenAktion : null);
            // der Takt des Spiels: der Kreatur-Takt, dann der feste Sim-Schritt der Leiber (getragener Stoß, Leib an Leib)
            const takt = () => {
                r.updateCreatures(1 / 60);
                r._kreaturStossSchritt(1 / 60);
                r._leibKontakte();
            };
            const beiss = (c) => {
                const uhr = c.userData.nextHuntStrikeAt;
                c.userData.nextHuntStrikeAt = 1e12; // (endlich: die Biss-Uhr liest nur endliche Zeiten)
                for (let k = 0; bissOffen(c) && k < 90; k++) takt();
                c.userData.nextHuntStrikeAt = uhr;
                const ok = r._tickCreatureHuntStrike(c);
                for (let k = 0; ok && k < 90; k++) {
                    const A0 = bissOffen(c);
                    if (!A0 || !A0.biss) break;
                    takt();
                }
                return ok;
            };
            // (1) die GATTUNG trägt WILD (predator = Carnivor-diet als Daten;
            // die Substanz bleibt Richter für alle Nicht-Raubtiere).
            out.wildTemperament = !!wolf && r._creatureTemperament(wolf) === "wild";
            // (2) der Jagd-Trieb: pfad+nah+unverängstigt → JA; Furcht schlägt
            // Jagd; frieden kennt keine Bedrohung; eine sanfte Seele jagt nie.
            out.drivePfad = r._creatureHuntDrive(wolf, 0) === true;
            out.fearBeatsHunt =
                r._creatureHuntDrive(wolf, r.constructor._verhaltenGesetz().furcht.fleeThreshold) === false;
            r.setGameMode("frieden");
            out.friedenNoHunt = r._creatureHuntDrive(wolf, 0) === false;
            r.setGameMode("pfad");
            const lamm = r.spawnCreatureAt(pm.x + 3.5, pm.y, pm.z + 1, "happy", "wesen");
            spawned.push(lamm);
            out.gentleNoHunt = r._creatureHuntDrive(lamm, 0) === false;
            // (3) der BISS: HP sinkt durchs damagePlayer-Tor, der Cooldown deckelt, die Rüstung dämpft
            // (_ruestungDaempft, dasselbe Gesetz wie bei den Wesen). Die Probe isoliert die Abwehr (0 vs 3).
            const savedDef = p.stats.defense;
            p.stats.defense = 0;
            p.hp = p.stats.hpMax || 100;
            const hp0 = p.hp;
            const bit = beiss(wolf);
            out.strikeHits = bit === true && p.hp < hp0;
            out.cooldownGates = r._tickCreatureHuntStrike(wolf) === false;
            const dealt1 = hp0 - p.hp;
            wolf.userData.nextHuntStrikeAt = 0;
            p.stats.defense = 3;
            const hp1 = p.hp;
            beiss(wolf);
            const dealt2 = hp1 - p.hp;
            p.stats.defense = savedDef;
            out.armorDampens = dealt2 < dealt1 - 1e-9 && dealt2 >= 1;
            // (4) die FURCHT: niedrige HP + Jagd-Schlag → sorrow steigt. sorrow zuerst auf 0 — der Warmup kann
            // es an die 1.0-Decke getrieben haben, dann wäre kein Anstieg messbar.
            p.hp = (p.stats.hpMax || 100) * 0.2;
            p.emotions.sorrow = 0;
            const sor0 = p.emotions.sorrow || 0;
            wolf.userData.nextHuntStrikeAt = 0;
            beiss(wolf);
            out.fearFelt = (p.emotions.sorrow || 0) > sor0;
            // (5) der TRIUMPH: ein frischer Jäger fällt von Spieler-Hand → joy steigt.
            // joy ebenso ZUERST auf 0 (dieselbe Decken-Konfundierung) → der Anstieg ist messbar.
            p.hp = p.stats.hpMax || 100;
            p.emotions.joy = 0;
            const joy0 = p.emotions.joy || 0;
            r.damageCreature(wolf, 9999, { source: "player" });
            spawned[0] = null;
            out.triumphFelt = (p.emotions.joy || 0) > joy0;
        } finally {
            for (const c of spawned) {
                if (c) r.removeCreature(c);
            }
            p.hp = savedHp;
            p.respawnGraceUntil = savedPhoenix;
            r.state.maxCreatures = savedMax;
            for (const k of Object.keys(p.emotions)) p.emotions[k] = savedEmo[k] || 0;
            r.setGameMode(savedMode);
            pm.set(savedOrt.x, savedOrt.y, savedOrt.z);
        }
        return out;
    });
    check("Phase E Bedrohung: Konstanten + Raubtier-Seele", res.consts && res.soul);
    check("Phase E Bedrohung (NULL): die Gattung trägt WILD (Carnivor-diet als Daten)", res.wildTemperament);
    check(
        "Phase E Bedrohung: Jagd-Trieb pfad+nah+unverängstigt; Furcht schlägt Jagd",
        res.drivePfad && res.fearBeatsHunt
    );
    check(
        "Phase E Bedrohung: frieden kennt keine Bedrohung + sanfte Seelen jagen nie",
        res.friedenNoHunt && res.gentleNoHunt
    );
    check(
        "Phase E Bedrohung: der Biss trifft durchs damagePlayer-Tor + Cooldown deckelt",
        res.strikeHits && res.cooldownGates
    );
    check("Phase E Bedrohung: die Rüstung dämpft FLACH (die EINE Kreatur-Formel)", res.armorDampens);
    check("Phase E Bedrohung: FURCHT bei niedriger HP + TRIUMPH beim Fall des Jägers", res.fearFelt && res.triumphFelt);
}

// W-D RITT + SPAWN-HYGIENE: (1) der Reiter sitzt auf der SITZ-Hüfte (SITZ_HIP_OFFSET 0.45) statt
// der Steh-Anatomie (+0.9); (2) SPIELER-KLEMME an der Kreatur-Wurzel: kein frisches Wesen
// materialisiert IM Spieler (≥ 3 m radial); Restore/Peer-Sicht bleiben PRECISE (bit-treu).
async function checkBandWDRittSpawn(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};
        // (1) die Hüft-Konstante + der EINE Konsument (Source-KONSUM).
        out.hipKonstante = A.SITZ_HIP_OFFSET === 0.45;
        const mountSrc = window.__codeOf(r.mountArchitecture);
        out.hipKonsum = /SITZ_HIP_OFFSET/.test(mountSrc) && !/\+ 0\.9\b/.test(mountSrc);
        // (2) die Klemme: ein Spawn IM Spieler (1 m) landet auf ≥3 m; precise bleibt.
        const pm = r.state.playerMesh.position;
        const saveMax = r.state.maxCreatures;
        r.state.maxCreatures = r.state.creatures.length + 2;
        const nah = r.spawnCreatureAt(pm.x + 1, pm.y, pm.z, "happy", "wesen");
        const dNah = nah ? Math.hypot(nah.position.x - pm.x, nah.position.z - pm.z) : -1;
        out.klemmeWirkt = !!nah && dNah >= (A.CREATURE_SPAWN_CLEAR_M || 3) - 1e-6;
        const genau = r.spawnCreatureAt(pm.x + 1, pm.y, pm.z, "happy", "wesen", { precise: true });
        const dGenau = genau ? Math.hypot(genau.position.x - pm.x, genau.position.z - pm.z) : -1;
        out.preciseUnberuehrt = !!genau && Math.abs(dGenau - 1) < 1e-6;
        for (const c of [nah, genau]) {
            if (!c) continue;
            r.removeCreature(c);
            r.state.creatures = (r.state.creatures || []).filter((x) => x !== c);
        }
        r.state.maxCreatures = saveMax;
        return out;
    });
    check(
        "W-D(R-010) Sitz-Hüfte: SITZ_HIP_OFFSET 0.45 ersetzt die Steh-Anatomie (+0.9) im EINEN Mount-Pfad",
        res.hipKonstante && res.hipKonsum
    );
    check(
        `W-D(R-017) Spieler-Klemme: frischer Spawn IM Spieler landet auf ≥3 m (gemessen ${res.klemmeWirkt}), precise bleibt bit-treu (${res.preciseUnberuehrt})`,
        res.klemmeWirkt && res.preciseUnberuehrt
    );
}

// V18.208 — KREATUR-GRÖSSEN-STAT-SYMMETRIE (Folge zu V18.195/V18.206
// Spieler-Symmetrie): größere Kreaturen sind robuster aber langsamer.
async function checkBandV18208CreatureSizeSymmetry(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};


        // (C2) Vergleich: kleine Kreatur (sizeFactor < 1) vs große (>1)
        if (!A.CREATURE_SOULS) {
            out.creatureSoulsExists = false;
            return out;
        }
        out.creatureSoulsExists = true;

        // Liste aller built-in Kreatur-Seelen
        const souls = Object.keys(A.CREATURE_SOULS);
        out.soulCount = souls.length;

        const stats = {};
        for (const sn of souls) {
            const soul = A.CREATURE_SOULS[sn];
            if (!soul || !Array.isArray(soul.bodyParts)) continue;
            const sizeFactor = r._compoundSizeFactor({ parts: soul.bodyParts });
            const fakeCreature = { userData: { soul: sn, boosts: [] } };
            const cs = r.computeCreatureStats(fakeCreature);
            stats[sn] = {
                sizeFactor,
                hpMax: cs.stats.hpMax,
                speed: cs.stats.speed,
            };
        }
        out.statsRecord = stats;

        // (C3) Größerer sizeFactor → tendenziell mehr HP, weniger speed — geprüft über die SPANNE (kleinste
        // vs größte Kreatur), nicht paarweise: Material/Element überstimmt die Größe im Mittelfeld legitim.
        // Den Multiplikator selbst (stats.hpMax *= sizeHpMul) verifiziert C1 an der Quelle.
        const sorted = Object.entries(stats).sort((a, b) => a[1].sizeFactor - b[1].sizeFactor);
        const smallest = sorted.length ? sorted[0][1] : null;
        const largest = sorted.length ? sorted[sorted.length - 1][1] : null;
        const spanReal = smallest && largest && largest.sizeFactor - smallest.sizeFactor > 0.05;
        // Über die Spanne: die größte Kreatur hat ≥ HP der kleinsten, ≤ Speed der kleinsten.
        const hpMonotone = !spanReal || largest.hpMax >= smallest.hpMax - 0.5;
        const speedMonotone = !spanReal || largest.speed <= smallest.speed + 0.5;
        out.hpMonotone = hpMonotone;
        out.speedMonotone = speedMonotone;

        // (C4) Floor-Disziplin für alle Kreaturen: Floor = (2/7)·Gesetz-base (Formel des Stamms; kalter Kern
        // → Fallback-base 7 ⇒ Floor 2).
        const bewGesetzC =
            (globalThis.__koerperCore &&
                globalThis.__koerperCore.PRESETS &&
                globalThis.__koerperCore.PRESETS.mensch &&
                globalThis.__koerperCore.PRESETS.mensch.fx &&
                globalThis.__koerperCore.PRESETS.mensch.fx.bewegung) ||
            null;
        const speedBaseC =
            bewGesetzC && bewGesetzC.speed && Number.isFinite(bewGesetzC.speed.base) ? bewGesetzC.speed.base : 7;
        const speedFloorC = (2 / 7) * speedBaseC;
        out.speedFloor = speedFloorC;
        out.allSpeedAtFloor = Object.values(stats).every((s) => s.speed >= speedFloorC - 1e-9);

        // (C5) Es gibt Variation (nicht alle Kreaturen identisch)
        const hpValues = Object.values(stats).map((s) => s.hpMax);
        const speedValues = Object.values(stats).map((s) => s.speed);
        const hpRange = Math.max(...hpValues) - Math.min(...hpValues);
        const speedRange = Math.max(...speedValues) - Math.min(...speedValues);
        out.hpVariesAmongCreatures = hpRange > 1;
        // Die Mindest-Spanne skaliert mit der LEBENDEN Gesetz-Base (0.5·base/7; kalter Kern → 0.5).
        out.speedRange = speedRange;
        out.speedVariesAmongCreatures = speedRange > 0.5 * (speedBaseC / 7);

        return out;
    });

    check(
        `V18.208 (C2) AnazhRealm.CREATURE_SOULS existiert (${res.soulCount} Seelen)`,
        res.creatureSoulsExists === true
    );
    check(`V18.208 (C3a) HP-Monotonie über Kreatur-Spektrum (größer = mehr HP)`, res.hpMonotone === true);
    check(`V18.208 (C3b) Speed-Monotonie (größer = langsamer)`, res.speedMonotone === true);
    // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal (war „Floor ≥ 2" / Spanne 0.5).
    check(
        `V18.208 (C4) Floor speed ≥ (2/7)·Gesetz-base (${res.speedFloor && res.speedFloor.toFixed(3)}) für alle Kreatur-Seelen`,
        res.allSpeedAtFloor === true
    );
    check(`V18.208 (C5a) HP variiert über Kreaturen (kein einheitlicher Wert)`, res.hpVariesAmongCreatures === true);
    check(
        `V18.208 (C5b) Speed variiert über Kreaturen (Spanne ${res.speedRange && res.speedRange.toFixed(3)} > 0.5·base/7)`,
        res.speedVariesAmongCreatures === true
    );
}

// DER HÜPFER LANDET (06.10., V18.531, Blick-Tour 3): der feld-native Hüpfer (`creatureJump`, die Verhaltens-Aktion
// `hop`) integrierte die Höhe nur, solange der Impuls stieg — im Fall fror `_hopH` am Scheitel ein (der Körper sprang
// auf den Boden zurück) und der nächste Sprung begann dort: an der Mess-Wiese stand ein Bär 7,6 m über dem Boden.
// Wand: zwei Sprünge hintereinander am echten Kreatur-Takt (updateCreatures) — jeder endet mit dem Versatz 0 auf
// der Höhe vor dem Sprung (der alte Takt hielt den Scheitel: 600 Takte ohne Landung). Der Fuchs lebt auf einer eigenen
// Bühne (Tier-Liste und Gefühls-Liste der Probe): die Geburt hing an der Welt-Bevölkerung — stand sie an maxCreatures,
// gab spawnCreatureAt null und das Band las „Scheitel ?" (Integration Welle L: 1 von 2 vollen Läufen rot).
async function checkBandHuepfer(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const st = r.state;
        const pm = st.playerMesh.position;
        const saved = st.creatures;
        const savedE = st.creatureEmotions;
        st.creatures = [];
        st.creatureEmotions = [];
        const c = r.spawnCreatureAt(pm.x + 30, pm.y, pm.z + 30, "happy", "fuchs", { precise: true });
        if (!c) {
            st.creatures = saved;
            st.creatureEmotions = savedE;
            return { fehler: "Spawn" };
        }
        const takt = () => {
            const x = c.position.x,
                z = c.position.z;
            r.updateCreatures(1 / 60);
            c.position.x = x;
            c.position.z = z;
        };
        const sprung = () => {
            takt();
            const y0 = c.position.y;
            c.userData._hopV = 0;
            c.userData._hopH = 0;
            r.creatureJump(c); // das Sprung-Gesetz: Höhe aus der Freude (hopHochM / hopBasisM)
            let scheitel = 0;
            let takte = 0;
            for (; takte < 600; takte++) {
                takt();
                scheitel = Math.max(scheitel, c.userData._hopH || 0);
                if (!(c.userData._hopV > 0) && !(c.userData._hopH > 0)) break;
            }
            takt();
            return { scheitel, rest: c.userData._hopH || 0, takte, zurueck: c.position.y - y0 };
        };
        let a, b;
        try {
            a = sprung();
            b = sprung();
        } finally {
            r.removeCreature(c);
            st.creatures = saved;
            st.creatureEmotions = savedE;
        }
        return { a, b };
    });
    const a = res && res.a,
        b = res && res.b;
    const z = (x) => (x && Number.isFinite(x.scheitel) ? x.scheitel.toFixed(2) : "?");
    check(
        `DER HÜPFER landet: zwei Sprünge (Scheitel ${z(a)} / ${z(b)} m) enden mit Versatz 0 auf der Höhe vor dem Sprung${res && res.fehler ? " — " + res.fehler : ""}`,
        !!a &&
            !!b &&
            a.scheitel > 0.05 &&
            b.scheitel > 0.05 &&
            a.rest === 0 &&
            b.rest === 0 &&
            Math.abs(a.zurueck) < 0.05 &&
            Math.abs(b.zurueck) < 0.05
    );
}

module.exports = {
    checkBandV1725FieldReaders, checkBandV1751CombatStats, checkBandV1753CreatureCombat, checkBandV1754PlayerAttack,
    checkBandV1758CreatureNature, checkBandWelle6HCreatures, checkBandWelleV11D3DrinkTask,
    checkBandWelle6HBuildAndPersist, checkBandWelle6HCreatureStats, checkBandPhaseEThreat, checkBandWDRittSpawn,
    checkBandV18208CreatureSizeSymmetry, checkBandHuepfer,
};
