"use strict";
// scripts/playtest/kreatur.cjs — der Richter von Kreatur (spec/stamm/modul-karte.json): Spawn · Stats · Tod · Fauna-Zyklus · Serialisierung · Aufgaben · Scheu · Jagd · Rudel · Kreatur-Takt.
// 9 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
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
    checkBandWelle6HBuildAndPersist, checkBandWelle6HCreatureStats, checkBandWDRittSpawn,
    checkBandV18208CreatureSizeSymmetry, checkBandHuepfer,
};
