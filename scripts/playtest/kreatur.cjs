"use strict";
// scripts/playtest/kreatur.cjs — der Richter von Kreatur (spec/stamm/modul-karte.json): Spawn · Stats · Tod · Fauna-Zyklus · Serialisierung · Aufgaben · Scheu · Jagd · Rudel · Kreatur-Takt.
// 9 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Die Logik-Konsumenten lesen die lebendige auraAt-API (nicht das eingefrorene worldFieldAt; den Bestand misst
// gate:kreatur-takt kaskade).
async function checkBandV1725FieldReaders({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        if (st.lifeField) st.lifeField.clear(); // V17.27 — die Fauna-Behavioral-Probe misst den frozen Kern
        out.lofiReadsAura = window.__consumes(r, "_lofiWorldField", r, "auraAt");
        return out;
    });
    check("mehr Leser: _lofiWorldField liest auraAt (living)", res.lofiReadsAura);
}

// Kombat-Stats: knockback/attackSpeed/defense EMERGIEREN aus der Substanz (Tags → STAT_FROM_TAGS) wie
// damage/speed/hpMax — schwere Keule langsam-wuchtig, leichte harte Klinge schnell. Geprüft: Profile
// differenzieren durch DIESELBE Pipeline für Spieler + Kreatur, sichtbar in der UI.
async function checkBandV1751CombatStats({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const S = AnazhRealm.STAT_FROM_TAGS;

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
        const pm = st.playerMesh.position;
        // Cap-Headroom: der Warmup kann `creatures` bis maxCreatures füllen → ein Test-Spawn gäbe null →
        // .stats-Crash. Lokal raise/restore (kein Pump dazwischen, tickFaunaLifecycle füllt die Lücke nicht).
        const _capG = st.maxCreatures;
        st.maxCreatures = (st.creatures ? st.creatures.length : 0) + 16;
        const c = r.spawnCreatureAt(pm.x + 240, pm.y, pm.z + 240, "happy", "wesen");
        const cs = r.computeCreatureStats(c).stats;
        out.creatureComputes =
            Number.isFinite(cs.knockback) && Number.isFinite(cs.attackSpeed) && Number.isFinite(cs.defense);
        // (6) V18.312 (Gesetz #0) — die KANONISCHE Stat-Pipeline: beide Spezies RUFEN dieselben drei Post-Tag-Quellen
        //     (Boosts falten · Tags→Stats+Floor · Größen-Skalierung), kein Parallelpfad (KONSUM am Ruf).
        const TRIO = ["_applyBoostsToStatTags", "_statsFromTags", "_applySizeMultipliersToStats"];
        out.pipelineShared =
            TRIO.every((k) => window.__consumes(r, "computePlayerStats", r, k)) &&
            !!c &&
            TRIO.every((k) => window.__consumes(r, "computeCreatureStats", r, k, [c]));
        r.removeCreature(c); // sauber aufräumen (kein Kreatur-Zahl-Leck)

        st.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check(
        "Kampf A: KONSUM — eine schwere dichte Keule hat MEHR Rückschlag als eine leichte Klinge (Masse)",
        res.heavyMoreKnockback
    );
    check(
        "Kampf A: KONSUM — eine leichte Klinge schlägt SCHNELLER als eine schwere Keule (leicht = flink)",
        res.lightFasterAttack
    );
    check(
        "Kampf A: KONSUM — eine harte Klinge macht MEHR Schaden als eine stumpfe Keule (härte schneidet)",
        res.hardMoreDamage
    );
    check(
        "Kampf A: KONSUM — dichte/harte Substanz blockt MEHR (defense), ein weiches Wesen ~0 (base-los)",
        res.denseMoreDefense && res.softNoDefense
    );
    check(
        "Kampf A: attackSpeed bleibt positiv (kein negativer Cooldown); magieleitung macht flink",
        res.attackSpeedPositive && res.magicFlink
    );
    check(
        "Kampf A: KONSUM — die ECHTE Spieler-Pipeline (computePlayerStats) berechnet das Kampf-Trio",
        res.playerComputes
    );
    check(
        "Kampf A: KONSUM — die Kreatur-Pipeline (computeCreatureStats) berechnet es symmetrisch (eine Pipeline)",
        res.creatureComputes
    );
    check(
        "(Gesetz #0): EINE kanonische Stat-Pipeline — Spieler + Kreatur rufen _applyBoostsToStatTags · _statsFromTags · _applySizeMultipliersToStats (§1.3 fraktal, kein Parallelpfad)",
        res.pipelineShared
    );
}

// Kreatur-Kampf symmetrisch zum Spieler: computeCreatureStats liefert hpMax + defense;
// die Rüstung dämpft (`dealt = roh² / (roh + defense)`, Welle L K-D5 — die flache Wand max(1, roh − defense) fiel); hp ≤ 0 → Kampf-Tod (Loot aus den Body-Materialien nur für den
// Spieler-Töter, removeCreature). Konsument ist der damage_creature-DSL-Op.
async function checkBandV1753CreatureCombat({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = st.player;
        const pm = st.playerMesh.position;
        const matUnits = (inv) =>
            inv.reduce((s, slot) => s + (slot && slot.kind === "material" ? slot.count || 0 : 0), 0);

        // (1) hp wird bei spawn auf hpMax initialisiert (DIESELBE Pipeline wie der Spieler)
        // Cap-Headroom (die dokumentierte Creature-Cap-Flake): lokal raise/restore.
        const _capG = st.maxCreatures;
        st.maxCreatures = (st.creatures ? st.creatures.length : 0) + 16;
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
        out.rejectsNonCreature = !r.damageCreature(st.playerMesh, 10, {}).ok;

        // (5) der Loot — die Body-Materialien (nicht leer)
        const loot = r._creatureLootMaterials(c1);
        out.lootNonEmpty = !!loot && Object.keys(loot).length > 0;

        // (6) KONSUM — ein Spieler-Kill entfernt die Kreatur + der Loot fällt ins Inventar
        const invBefore = JSON.parse(JSON.stringify(p.inventory));
        for (let i = 0; i < p.inventory.length; i++) p.inventory[i] = null; // Platz für Loot garantieren
        const countBefore = st.creatures.length;
        const killR = r.damageCreature(c1, 99999, { source: "player" });
        // Der Kill despawnt nicht sofort: der Körper KIPPT (userData.dying, ~1 s + Nachklang) — er verlässt die Wesen und
        // liegt in state.leichname —, dann folgt der Abschied: die Frist synthetisch verstreichen lassen, updateCreatures räumt.
        const kipptErst =
            killR.killed &&
            !!c1.userData.dying &&
            st.creatures.indexOf(c1) === -1 &&
            st.leichname.indexOf(c1) !== -1;
        c1.userData.dying.t = 9999;
        r.updateCreatures(0.016);
        out.killRemoves =
            kipptErst &&
            st.leichname.indexOf(c1) === -1 &&
            !c1.parent &&
            st.creatures.length === countBefore - 1;
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
        const idx3 = st.creatures.indexOf(c3);
        const hp3Before = c3.userData.hp;
        r.dslEffects.damage_creature([idx3, 5], { source: "test", log: [] });
        out.dslOpDamages = c3.userData.hp < hp3Before;

        // cleanup (c1/c2 fielen im Kampf; c3 entfernen; Inventar restaurieren)
        if (st.creatures.indexOf(c3) !== -1) r.removeCreature(c3);
        for (let i = 0; i < invBefore.length; i++) p.inventory[i] = invBefore[i];
        st.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check("Kampf C: eine frische Kreatur hat hp == hpMax (init aus DERSELBEN Stat-Pipeline)", res.hpInit);
    check("Kampf C: KONSUM — damageCreature dämpft (roh² / (roh + defense), Welle L K-D5)", res.damageReduces);
    check("Kampf C: ein winziger Treffer wirkt winzig, nie 0 (keine Unverwundbarkeit)", res.damageFloor);
    check("Kampf C: ein Nicht-Kreatur-Ziel wird abgelehnt (not_creature)", res.rejectsNonCreature);
    check("Kampf C: der Loot sind die Body-Materialien der Kreatur (nicht leer)", res.lootNonEmpty);
    check(
        "Kampf C: KONSUM — ein Spieler-Kill (hp≤0) KIPPT die Kreatur (dying), der Abschied räumt sie nach der Frist",
        res.killRemoves
    );
    check(
        "Kampf C: KONSUM — der Loot eines Spieler-Kills fällt ins Inventar (Erlegen ≡ Ernten)",
        res.lootToInventory
    );
    check("Kampf C: ein Welt-/DSL-Tod gibt KEIN Loot (nur der Spieler erntet)", res.noLootForWorldKill);
    check("Kampf C: KONSUM — der damage_creature-DSL-Op schädigt eine Kreatur per Index", res.dslOpDamages);
}

// LMB-Angriff: `_playerAttackCreature` konsumiert damageCreature (attackSpeed-Cooldown + Stamina +
// damage/knockback); tryMouseBreak dispatcht: Kreatur in Reichweite → angreifen, sonst Architektur →
// harvest, sonst carve. Affekt: Zorn ∝ Waffen-Härte beim Angriff, SCHULD ∝ lebendig×bond beim Töten
// eines friedlichen Wesens.
async function checkBandV1754PlayerAttack({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = st.player;
        const pm = st.playerMesh.position;
        const e = p.emotions;
        const setEmo = (o) => {
            for (const k of Object.keys(e)) e[k] = o[k] || 0;
        };
        const savedEmo = { ...e };
        const savedLastAtk = p.lastAttackAt;
        const savedInv = JSON.parse(JSON.stringify(p.inventory));
        const savedLife = st.lifeField;
        const savedEmoField = st.emotionField;
        st.lifeField = new Map();
        st.emotionField = new Map();

        // (1) KONSUM — _playerAttackCreature schädigt eine Kreatur (der LMB-Konsument)
        // Cap-Headroom (die dokumentierte Creature-Cap-Flake): lokal raise/restore.
        const _capG = st.maxCreatures;
        st.maxCreatures = (st.creatures ? st.creatures.length : 0) + 16;
        const c1 = r.spawnCreatureAt(pm.x + 320, pm.y, pm.z + 320, "happy", "wesen");
        // Der Klick LÖST nur den 3-Phasen-Schwung aus, das Treffen macht der Klingen-Sweep der Strike-Phase
        // → Ziel VOR den Spieler (Sweep-Reichweite), Schwung synthetisch über die Anzeige-Uhr treiben.
        const savedYaw = st.yaw;
        const savedPitch = st.pitch;
        const savedCam = st.cameraMode;
        st.yaw = 0;
        c1.position.set(pm.x, pm.y, pm.z + 1.6);
        // Die Klinge zielt durchs Fadenkreuz (K-D3): die ECHTE Kamera auf die Leibes-Mitte (`_leibMitte`) richten.
        r.setCameraMode("first");
        r._loopCamera(performance.now() / 1000);
        {
            const [m, cp] = [r._leibMitte(c1), st.camera.position];
            st.pitch = Math.atan2(m.y - cp.y, Math.max(0.5, m.z - cp.z));
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
        st.yaw = savedYaw;
        st.pitch = savedPitch;
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
        if (st.creatures.indexOf(c4) !== -1) r.removeCreature(c4);

        // cleanup
        if (st.creatures.indexOf(c1) !== -1) r.removeCreature(c1);
        setEmo(savedEmo);
        p.lastAttackAt = savedLastAtk;
        for (let i = 0; i < savedInv.length; i++) p.inventory[i] = savedInv[i];
        st.lifeField = savedLife;
        st.emotionField = savedEmoField;
        st.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });
    check(
        "Kampf D: KONSUM — der LMB löst den Schwung aus, der Klingen-Sweep der Strike-Phase schädigt",
        res.attackDamages
    );
    check("Kampf D: der Angriff feuert den Zorn-Affekt (chaos — die Kampf-Intensität)", res.attackFeelsChaos);
    check(
        "Kampf D: Schwung-Cooldown (Dauer ∝ √I) — ein Klick WÄHREND des Schwungs prallt ab (kein Schaden)",
        res.cooldownGates
    );
    check(
        "Kampf D: KONSUM — die SCHULD ist lebendig-gegated (Spieler-Kill eines lebendig-Wesens → sorrow)",
        res.guiltGatedByLiving
    );
    check(
        "Kampf D: der Rückstoß-Pfad (fromPos + stoss) läuft, schädigt und stößt das Ziel vom Angreifer weg",
        res.knockbackRuns
    );
    check(
        "Kampf D (Gegenprobe 0710-5): das tote Feld knockback stößt nicht — ein Check damit allein wäre leer",
        res.knockbackTotFeld
    );
}

async function checkBandWelle6HBuildAndPersist({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2B.2 — Kreatur baut Bauplan für Spieler ###
    // Umkehrung von gather: Phasen take (zum Spieler) → walk (weg) → spawn (Architektur am Kreatur-Ort);
    // _buildMaterialGate ist EINE Funktion für Spieler-confirmBuild und die Kreatur-take-Phase.
    const wave6hP2b2Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};

        // 1. Konstanten
        const Tasks = AnazhRealm.CREATURE_TASKS;
        const Hues = AnazhRealm.CREATURE_TASK_AURA_HUE;
        out.tasksHasBuild = Tasks.includes("build");
        out.auraHueBuild = Hues.build === 280;

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
            st.playerMesh.position.x + 50,
            st.playerMesh.position.y,
            st.playerMesh.position.z + 50,
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
        const player = st.playerMesh.position;
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
            sp > AnazhRealm.CREATURE_BUILD_SPEED * 0.5 && sp < AnazhRealm.CREATURE_BUILD_SPEED * 2.0;

        // 7. Take-Phase at handover, pfad ohne Material → ablehnt + memory + wander
        const origMode = r.getGameMode();
        r.setGameMode("pfad");
        st.player.inventory = new Array(27).fill(null);
        c0.position.set(player.x + 1.0, player.y, player.z); // innerhalb handover (2.0)
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const dirNoMat = r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.takeNoMatRejects = dirNoMat === null && r._getCreatureTask(c0).name === "wander";
        const memHasNoInv = (c0.userData.memory || []).some((m) => m.type === "no_inventory_for_build");
        out.memHasNoInv = memHasNoInv;

        // 8. Take-Phase at handover, pfad mit Material → carrying gesetzt + Material verbraucht
        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 200);
        const stoneBefore = st.player.inventory[0].count;
        c0.position.set(player.x + 1.0, player.y, player.z);
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.takeSetsCarrying = !!c0.userData.carrying && c0.userData.carrying.kind === "build";
        out.takeCarryingHasBp = c0.userData.carrying && c0.userData.carrying.blueprint === "stein_block";
        const stoneAfter = st.player.inventory[0] ? st.player.inventory[0].count : 0;
        out.takeConsumesPfad = stoneAfter < stoneBefore;
        const memHasTook = (c0.userData.memory || []).some((m) => m.type === "took_materials");
        out.memHasTook = memHasTook;

        // 9. Schöpfer/frieden: carrying wird mit symbolic cost gesetzt, Inventar bleibt leer
        r.setGameMode("schöpfer");
        st.player.inventory = new Array(27).fill(null);
        c0.position.set(player.x + 1.0, player.y, player.z);
        c0.userData.carrying = null;
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.schoepferCarrying = !!c0.userData.carrying;
        out.schoepferCarryingHasMaterials =
            c0.userData.carrying && c0.userData.carrying.materials && c0.userData.carrying.materials.stein > 0;
        out.schoepferCarryingFree = c0.userData.carrying && c0.userData.carrying.free === true;
        out.schoepferInventoryUntouched = st.player.inventory.every((s) => !s);

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
            ws > AnazhRealm.CREATURE_BUILD_SPEED * 0.5 && ws < AnazhRealm.CREATURE_BUILD_SPEED * 2.0;

        // 11. Spawn-Phase: bei placement_dist → spawnArchitecture + carrying null + memory + wander
        c0.position.set(player.x + 5.0, player.y + 1.0, player.z); // > placement (4.0)
        c0.userData.carrying = {
            kind: "build",
            materials: { stein: 8 },
            blueprint: "stein_block",
            since: 0,
        };
        r.assignCreatureTask(c0, "build", { blueprint: "stein_block" });
        const archBefore = st.architectures.length;
        r._tickCreatureTaskDirection(c0, c0.userData.task, "happy");
        out.spawnPhaseGrowsWorld = st.architectures.length > archBefore;
        out.spawnPhaseClearsCarrying = c0.userData.carrying === null;
        out.spawnPhaseFallsToWander = r._getCreatureTask(c0).name === "wander";
        const memHasBuilt = (c0.userData.memory || []).some((m) => m.type === "built");
        out.memHasBuilt = memHasBuilt;
        const journalHasBuilt = (st.worldJournal.entries || []).some(
            (e) => e.type === "growth" && /erschuf/.test(e.text)
        );
        out.journalHasBuilt = journalHasBuilt;

        // 12. DSL-Op routing
        r.dslRun(["creature_task_nearest", "build", "stein_block"], { source: "test" });
        // Finde irgendeine Kreatur mit build-Task
        const anyBuilding = st.creatures.some(
            (c) => r._getCreatureTask(c) && r._getCreatureTask(c).name === "build"
        );
        out.dslNearestSetsBuild = anyBuilding;

        // 13. NON_BROADCASTABLE_OPS — creature_task* sind schon drin (Phase 1).
        // Build wird über dieselben Ops gerufen, also automatisch privat.
        out.opsAreNonBroadcast =
            AnazhRealm.NON_BROADCASTABLE_OPS.has("creature_task_nearest") &&
            AnazhRealm.NON_BROADCASTABLE_OPS.has("creature_task_all") &&
            AnazhRealm.NON_BROADCASTABLE_OPS.has("creature_task");

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
        for (const c of st.creatures) {
            r.assignCreatureTask(c, "build", { blueprint: "stein_block" }, { silent: true });
        }
        r._renderTaskStatusUI();
        const statusEl = document.getElementById("status-tasks");
        out.statusShowsBauen = statusEl && /bauen/.test(statusEl.textContent);

        // 17. Liste zeigt 'baut stein_block' + .build CSS-Class
        r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const buildRow = listEl && listEl.querySelector(".creature-task.build");
        out.listHasBuildClass = !!buildRow;
        out.listShowsBaut = listEl && /baut stein_block/.test(listEl.textContent);

        // 18. UI (Hof-C): die Bau-Optionen leben im inline „Auftrag ▾"-Select am Wesen
        // (statt des globalen #creature-build-select, der der NÄCHSTEN Kreatur befahl).
        const buildSelect = listEl && listEl.querySelector(".creature-row .creature-order-select");
        out.uiBuildSelectExists = !!buildSelect;
        out.uiBuildSelectHasOptions = buildSelect
            ? [...buildSelect.querySelectorAll("option")].filter((o) => o.value.startsWith("build:")).length >= 3
            : false;
        out.uiBuildButtonsCount = !!(listEl && listEl.querySelector(".creature-row [data-task]"));

        // 19. Journal-Label "wird zur Schöpferin" beim build-Wechsel
        // (assignCreatureTask hat schon ein Journal geschrieben in #16, prüfen)
        const journalHasRel = (st.worldJournal.entries || []).some(
            (e) => e.type === "relationship" && /Schöpferin/.test(e.text)
        );
        out.journalHasSchoepferin = journalHasRel;

        // 20. Symbolic cost: free build hat trotzdem materials map (für Journal/Visual)
        r.setGameMode("schöpfer");
        st.player.inventory = new Array(27).fill(null);
        const cFree = r.spawnCreatureAt(player.x + 30, player.y, player.z + 30, "happy", "wesen");
        cFree.position.set(player.x + 1.0, player.y, player.z);
        cFree.userData.carrying = null;
        r.assignCreatureTask(cFree, "build", { blueprint: "baum_eiche" }, { silent: true });
        r._tickCreatureTaskDirection(cFree, cFree.userData.task, "happy");
        out.symbolicCostHasMultiple =
            cFree.userData.carrying && Object.keys(cFree.userData.carrying.materials).length >= 2; // baum_eiche = holz + laub

        // Cleanup für nachfolgende Tests
        r.setGameMode(origMode || "frieden");
        for (const c of st.creatures) {
            r.assignCreatureTask(c, "wander", {}, { silent: true });
        }
        return out;
    });

    if (wave6hP2b2Results && !wave6hP2b2Results.error) {
        check("CREATURE_TASKS enthält 'build'", wave6hP2b2Results.tasksHasBuild);
        check("AURA_HUE.build === 280 (violett)", wave6hP2b2Results.auraHueBuild);
        check(
            "_buildCreatureTaskArgs(build, string) → {blueprint}",
            wave6hP2b2Results.argsBuildString
        );
        check(
            "_buildCreatureTaskArgs(build, number) droppt arg",
            wave6hP2b2Results.argsBuildNumberDropped
        );
        check("_buildCreatureTaskArgs(build, '') droppt arg", wave6hP2b2Results.argsBuildEmptyDropped);
        check(
            "_describeCreatureTaskArg(build, X) zeigt 'Bauplan X'",
            wave6hP2b2Results.descBuildShowsBlueprint
        );
        check(
            "build ohne blueprint → null + Task fällt auf wander",
            wave6hP2b2Results.buildEmptyFallsToWander
        );
        check(
            "build mit unbekanntem Bauplan → wander + 'no_blueprint'-Erinnerung",
            wave6hP2b2Results.unknownBpFallsToWander && wave6hP2b2Results.memHasNoBlueprint
        );
        check(
            "take-Phase weit weg → Vektor zum Spieler hin",
            wave6hP2b2Results.takePhaseTowardsPlayer
        );
        check(
            "take-Phase Geschwindigkeit ~ CREATURE_BUILD_SPEED (body-moduliert P2F.1)",
            wave6hP2b2Results.takePhaseSpeed
        );
        check(
            "pfad ohne Material → take lehnt ab + 'no_inventory_for_build'-Memory",
            wave6hP2b2Results.takeNoMatRejects && wave6hP2b2Results.memHasNoInv
        );
        check(
            "pfad mit Material → carrying.kind='build' + blueprint gesetzt",
            wave6hP2b2Results.takeSetsCarrying && wave6hP2b2Results.takeCarryingHasBp
        );
        check(
            "pfad: Material wird aus Spieler-Inventar konsumiert",
            wave6hP2b2Results.takeConsumesPfad
        );
        check("'took_materials'-Erinnerung gespeichert", wave6hP2b2Results.memHasTook);
        check(
            "schöpfer setzt carrying mit symbolic cost (für Visual+Journal)",
            wave6hP2b2Results.schoepferCarrying &&
                wave6hP2b2Results.schoepferCarryingHasMaterials &&
                wave6hP2b2Results.schoepferCarryingFree
        );
        check(
            "schöpfer: Inventar bleibt unangetastet (kostenlos)",
            wave6hP2b2Results.schoepferInventoryUntouched
        );
        check(
            "walk-Phase mit carrying → Vektor WEG vom Spieler ~ BUILD_SPEED (body-moduliert P2F.1)",
            wave6hP2b2Results.walkPhaseAwayFromPlayer && wave6hP2b2Results.walkPhaseSpeed
        );
        check(
            "spawn-Phase bei placement_dist → Architektur entsteht",
            wave6hP2b2Results.spawnPhaseGrowsWorld
        );
        check(
            "spawn-Phase clearet carrying + fällt auf wander zurück",
            wave6hP2b2Results.spawnPhaseClearsCarrying && wave6hP2b2Results.spawnPhaseFallsToWander
        );
        check(
            "'built'-Memory + 'growth'-Journal-Eintrag (erschuf ...)",
            wave6hP2b2Results.memHasBuilt && wave6hP2b2Results.journalHasBuilt
        );
        check("DSL creature_task_nearest('build', bp) wirkt", wave6hP2b2Results.dslNearestSetsBuild);
        check(
            "build-Ops bleiben in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hP2b2Results.opsAreNonBroadcast
        );
        check("Chat 'baue X' → creature_task_nearest build X", wave6hP2b2Results.chatBauePattern);
        check(
            "Chat 'alle bauen X' → creature_task_all build X",
            wave6hP2b2Results.chatAlleBauenPattern
        );
        check("describeProgram zeigt 'Bauplan' + name", wave6hP2b2Results.describeProgramShowsBp);
        check("Status-Bar zeigt 'N bauen' bei build-Tasks", wave6hP2b2Results.statusShowsBauen);
        check(
            "Liste zeigt .build-Class + 'baut <bp>'",
            wave6hP2b2Results.listHasBuildClass && wave6hP2b2Results.listShowsBaut
        );
        check(
            "Hof-C: der inline Auftrag-Select am Wesen traegt >=3 Bau-Optionen + Task-Knoepfe",
            wave6hP2b2Results.uiBuildSelectExists &&
                wave6hP2b2Results.uiBuildSelectHasOptions &&
                wave6hP2b2Results.uiBuildButtonsCount
        );
        check(
            "Journal-Label (wird zur Schoepferin) beim build-Wechsel",
            wave6hP2b2Results.journalHasSchoepferin
        );
        check(
            "free-build trägt Multi-Material symbolic cost (baum_eiche=holz+laub)",
            wave6hP2b2Results.symbolicCostHasMultiple
        );
    } else if (wave6hP2b2Results && wave6hP2b2Results.error) {
        check(`Welle 6.H P2B.2: evaluate-Fehler — ${wave6hP2b2Results.error}`, false);
    }

    // ### Welle 6.H Phase 2D — Spezialisierung aus Memory ###
    // Memory-Erfolge (gathered/built) ergeben Skill-Levels (gather:material, build:blueprint): Speed-Bonus
    // je Level, Audio + Journal beim Level-Up, UI-Pills; Levels sind abgeleitet, nie separat gespeichert.
    const wave6hP2dResults = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};
        const Class = AnazhRealm;

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
        const player = st.playerMesh.position;
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
        const journalEntriesBefore = new Set(st.worldJournal.entries || []);
        // 3 gathered → L1, sollte LevelUp triggern — und das Tier ruft dazu (seine Stimme, genau einmal)
        const rufVor = st.symphony.tierRufe || 0;
        r._creatureRemember(cFollow, "gathered", { material: "quarz" });
        r._creatureRemember(cFollow, "gathered", { material: "quarz" });
        r._creatureRemember(cFollow, "gathered", { material: "quarz" }); // Level-Up hier
        out.levelUpRuft = (st.symphony.tierRufe || 0) - rufVor === 1;
        const lvlAfter = r._creatureSpecializationLevel(cFollow, "gather", "quarz");
        out.rememberTriggersLevel = lvlAfter === 1;
        // Ein NEUER growth-Eintrag (nicht im Vorher-Set) mit Sammler / "quarz" / "Stufe 1" beweist, dass
        // DIESER Level-Up ihn schrieb (kein Autonom-Lauf-Echo).
        const journalAfter = st.worldJournal.entries || [];
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
        const beforeFailureJournal = (st.worldJournal.entries || []).length;
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        r._creatureRemember(cFailure, "no_material", { material: "holz" });
        out.failureNoLevel = r._creatureSpecializationLevel(cFailure, "gather", "holz") === 0;
        // Journal-Wachstum sollte 0 sein (kein growth-Eintrag durch Failure)
        const failureJournalDiff = (st.worldJournal.entries || []).length - beforeFailureJournal;
        out.failureJournalUntouched = failureJournalDiff === 0;

        // 11. UI: .creature-specs span existiert nach Render
        r._renderCreatureListUI();
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
        r._renderCreatureListUI();
        // Wir können nicht direkt die spezifische Row finden, aber wir können prüfen dass die ANZAHL specsSpans = Anzahl Kreaturen mit ≥1 Spec
        let creaturesWithSpecs = 0;
        for (const cc of st.creatures) {
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
        check("skillKeyForMemory mappt gathered → gather:material", wave6hP2dResults.skillKeyGather);
        check(
            "der Aufstieg klingt mit der Stimme des Tiers (genau ein Ruf)",
            wave6hP2dResults.levelUpRuft
        );
        check("skillKeyForMemory mappt built → build:blueprint", wave6hP2dResults.skillKeyBuild);
        check(
            "skillKeyForMemory failures (no_material, delivered) → null",
            wave6hP2dResults.skillKeyFailureNull && wave6hP2dResults.skillKeyDeliveredNull
        );
        check("leere memory → leere specializations", wave6hP2dResults.emptyMemoryEmptySpecs);
        check(
            "computeSpecs zählt gathered nach material (holz=2, stein=1)",
            wave6hP2dResults.countsHolz && wave6hP2dResults.countsStein
        );
        check("computeSpecs zählt built nach blueprint", wave6hP2dResults.countsBuiltSteinBlock);
        check(
            "failures (no_material, no_blueprint) zählen NICHT in specs",
            wave6hP2dResults.failuresIgnored
        );
        check(
            "Level 0 für leeren Skill + Sub-Threshold (2<3)",
            wave6hP2dResults.level0Empty && wave6hP2dResults.level0Sub
        );
        check("3 Erfolge → Level 1", wave6hP2dResults.level1At3);
        check("6 Erfolge → Level 2", wave6hP2dResults.level2At6);
        check("100 Erfolge → Level 5 (Cap)", wave6hP2dResults.levelCappedAt5);
        check(
            "topSpecializations sortiert nach Level + limit",
            wave6hP2dResults.topReturnsArray &&
                wave6hP2dResults.topSortedByLevel &&
                wave6hP2dResults.topHasBuildAtTop &&
                wave6hP2dResults.topHasGatherSecond &&
                wave6hP2dResults.topLimit1
        );
        check("keine Skills → topSpecializations liefert leeres Array", wave6hP2dResults.topEmpty);
        check("speedMultiplier L0 → 1.0", wave6hP2dResults.mulL0 && wave6hP2dResults.mulBuildL0);
        check("speedMultiplier L5 → 1.75 (1 + 5*0.15)", wave6hP2dResults.mulL5);
        check(
            "speedMultiplier wander/null-args → 1.0",
            wave6hP2dResults.mulUnknownTask && wave6hP2dResults.mulNullArgs
        );
        check(
            "3. erfolgreicher gather → Level-Up im _creatureRemember",
            wave6hP2dResults.rememberTriggersLevel
        );
        check(
            "Level-Up schreibt growth-Journal-Eintrag mit Sammler/key/Stufe",
            wave6hP2dResults.journalHasLvlUp && wave6hP2dResults.journalGrew
        );
        check(
            "Failure-Memory triggert KEIN Level + KEIN Journal",
            wave6hP2dResults.failureNoLevel && wave6hP2dResults.failureJournalUntouched
        );
        check(
            "UI .creature-specs Spans existieren bei Kreaturen mit Specs",
            wave6hP2dResults.uiSpecsSpansExist
        );
        check(
            "UI .creature-spec.creature-spec-gather + .creature-spec-build Pills",
            wave6hP2dResults.uiHasGatherPills && wave6hP2dResults.uiHasBuildPills
        );
        check(
            "Pills zeigen Sammler/Bauer + Level (L1..L5)",
            wave6hP2dResults.uiPillTextOk && wave6hP2dResults.uiBuildPillTextOk
        );
        check(
            "Anzahl .creature-specs Spans = Anzahl Kreaturen mit Specs",
            wave6hP2dResults.uiSpansMatchSpecCount
        );
        check(
            "KEINE Persistenz im buildStateSnapshot (Vision §1.1)",
            wave6hP2dResults.snapshotHasNoSpecs
        );
        check(
            "KEIN specialization-DSL-Op in NON_BROADCASTABLE_OPS (kein Op nötig)",
            wave6hP2dResults.noSpecDslOp
        );
    } else if (wave6hP2dResults && wave6hP2dResults.error) {
        check(`Welle 6.H P2D: evaluate-Fehler — ${wave6hP2dResults.error}`, false);
    }

    // ### Welle 6.H Phase 2D.1 — Kreatur-Persistenz (Komponenten-Snapshot) ###
    // Kreatur-Identitäten überleben Reload: der Save trägt {name, soul, memory, position, bornAt} je
    // Kreatur (~1 KB), Memory-Cap 200; tote Kreaturen (removeCreature) fallen aus dem Save.
    const wave6hP2d1Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};

        // Cap-Headroom: der Warmup kann `creatures` bis maxCreatures füllen → ein Spawn obendrauf gäbe null.
        // Lokal anheben, vor `return out` restaurieren (kein _gameLoopTick dazwischen → deterministisch).
        const _capG = st.maxCreatures;
        st.maxCreatures = (st.creatures ? st.creatures.length : 0) + 16;

        // 3. Neu gespawnte Kreatur bekommt bornAt
        const player = st.playerMesh.position;
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
        c.userData.alterS = 770; // das Alter in Spiel-Zeit (der Lebenszyklus zählt es) reist mit
        const snap = r._serializeCreature(c);
        out.snapHasName = typeof snap.name === "string" && snap.name.length > 0;
        out.snapHasSoul = snap.soul === "wesen";
        out.snapHasMemory = Array.isArray(snap.memory) && snap.memory.length === 3;
        out.snapHasPosition = snap.position && Number.isFinite(snap.position.x);
        out.snapHasBornAt = Number.isFinite(snap.bornAt) && snap.alterS === 770;

        // 5. _restoreCreatureFromSnapshot baut Kreatur aus Snapshot
        const beforeCount = st.creatures.length;
        const restored = r._restoreCreatureFromSnapshot(snap, "happy");
        out.restoreReturnsCreature = !!restored;
        out.restoreGrowsList = st.creatures.length === beforeCount + 1;
        out.restoreNameOk = restored && restored.userData.name === snap.name;
        out.restoreSoulOk = restored && restored.userData.soul === "wesen";
        out.restoreMemoryOk =
            restored && Array.isArray(restored.userData.memory) && restored.userData.memory.length === 3;
        out.restorePositionOk =
            restored &&
            Math.abs(restored.position.x - snap.position.x) < 0.001 &&
            Math.abs(restored.position.z - snap.position.z) < 0.001;
        out.restoreBornAtOk = restored && restored.userData.bornAt === snap.bornAt && restored.userData.alterS === 770;

        // 6. Specs werden aus restoriertem memory korrekt re-derived
        const specs = r._computeCreatureSpecializations(restored);
        out.specsReDerived = specs.gather && specs.gather.holz === 2 && specs.build && specs.build.stein_block === 1;

        // 7. Round-Trip: buildStateSnapshot → loadState → Kreaturen sind da
        // Setze die aktuelle Welt auf einen bekannten Stand
        const beforeRoundTripCount = st.creatures.length;
        const fullSnap = r.buildStateSnapshot();
        out.snapshotHasFullCreatures =
            Array.isArray(fullSnap.creatures) &&
            fullSnap.creatures.length === beforeRoundTripCount &&
            fullSnap.creatures.every((c) => c && typeof c.name === "string" && typeof c.soul === "string");

        // 8. Tote Kreatur ist NICHT im Snapshot. Wir markieren den
        // konkreten Victim eindeutig mit einem Unique-Name damit
        // Name-Kollisionen im Pool nicht den Test verfälschen.
        const beforeAlive = st.creatures.length;
        const victim = st.creatures[0];
        const victimMark = `Victim_${Math.random().toString(36).slice(2, 10)}`;
        victim.userData.name = victimMark;
        r.removeCreature(victim);
        const afterSnap = r.buildStateSnapshot();
        const stillHasVictim = afterSnap.creatures.some((s) => s.name === victimMark);
        out.victimRemovedFromSnap = !stillHasVictim;
        out.aliveDecreasedBy1 = afterSnap.creatures.length === beforeAlive - 1;
        out._beforeAlive = beforeAlive;
        out._afterCount = afterSnap.creatures.length;
        out._stateCreaturesAfter = st.creatures.length;

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
        st._pendingCreatureSnapshots = persisted;
        st.creatureEmotions = ["happy", "happy"];
        r.spawnCreatures(10); // Sollte 2 restored ergeben statt 10 random
        out.restoredCount = st.creatures.length === 2;
        const restoredNames = st.creatures.map((cr) => cr.userData.name).sort();
        out.restoredNamesMatch = restoredNames[0] === "TestBauer" && restoredNames[1] === "TestSammler";
        out.pendingClearedAfterRestore = st._pendingCreatureSnapshots === null;
        // Specs aus 1 gathered holz → L0
        const sammler = st.creatures.find((cr) => cr.userData.name === "TestSammler");
        out.restoredCreatureHasMemory =
            sammler && Array.isArray(sammler.userData.memory) && sammler.userData.memory.length === 1;

        // 10. die Ruhe vor dem Deckel (die Legacy-Probe prüfte ein Literal gegen sich selbst, kein Spiel — sie fiel)
        st._pendingCreatureSnapshots = null;
        st.creatureEmotions = [];

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
        st.maxCreatures = _capG; // V18.370 — Cap-Headroom restore
        return out;
    });

    if (wave6hP2d1Results && !wave6hP2d1Results.error) {
        check("spawnCreatureAt setzt bornAt-Identitäts-Marker", wave6hP2d1Results.bornAtSet);
        check(
            "Snapshot enthält name + soul + memory + position + bornAt + alterS",
            wave6hP2d1Results.snapHasName &&
                wave6hP2d1Results.snapHasSoul &&
                wave6hP2d1Results.snapHasMemory &&
                wave6hP2d1Results.snapHasPosition &&
                wave6hP2d1Results.snapHasBornAt
        );
        check(
            "_restoreCreatureFromSnapshot rekonstruiert Kreatur + wächst Liste",
            wave6hP2d1Results.restoreReturnsCreature && wave6hP2d1Results.restoreGrowsList
        );
        check(
            "Restore übernimmt Name + Soul",
            wave6hP2d1Results.restoreNameOk && wave6hP2d1Results.restoreSoulOk
        );
        check("Restore übernimmt Memory (Länge + Inhalt)", wave6hP2d1Results.restoreMemoryOk);
        check("Restore übernimmt Position", wave6hP2d1Results.restorePositionOk);
        check("Restore übernimmt bornAt + alterS", wave6hP2d1Results.restoreBornAtOk);
        check("Specs aus restoriertem Memory korrekt re-derived", wave6hP2d1Results.specsReDerived);
        check(
            "buildStateSnapshot trägt volles Kreatur-Schema",
            wave6hP2d1Results.snapshotHasFullCreatures
        );
        check(
            "removeCreature entfernt aus state.creatures + Snapshot",
            wave6hP2d1Results.victimRemovedFromSnap &&
                wave6hP2d1Results.aliveDecreasedBy1 &&
                wave6hP2d1Results._stateCreaturesAfter === wave6hP2d1Results._beforeAlive - 1
        );
        check(
            "_pendingCreatureSnapshots-Pfad restored statt random-spawnen",
            wave6hP2d1Results.restoredCount &&
                wave6hP2d1Results.restoredNamesMatch &&
                wave6hP2d1Results.pendingClearedAfterRestore &&
                wave6hP2d1Results.restoredCreatureHasMemory
        );
        check(
            "Memory-Cap=200 wird durchgesetzt (FIFO bei 250 push)",
            wave6hP2d1Results.cap200Enforced
        );
        check(
            "Restore mit übergroßem memory wird auf 200 gekappt",
            wave6hP2d1Results.oversizedRestoredCappedAt200
        );
    } else if (wave6hP2d1Results && wave6hP2d1Results.error) {
        check(`Welle 6.H P2D.1: evaluate-Fehler — ${wave6hP2d1Results.error}`, false);
    }
}

async function checkBandWelle6HCreatureStats({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2F.1 — Kreatur-Stats wie Spieler ###
    // Kreatur, Spieler und Architektur sind Compound aus parts × Material × Form; Stats kommen aus
    // derselben STAT_FROM_TAGS-Pipeline; Body-Speed-Mul (stats.speed/7) wirkt im Tick neben Spec-Mul.
    const wave6hP2f1Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};

        // 2. computeCreatureStats liefert {tags, stats} mit allen Schlüsseln
        const player = st.playerMesh.position;
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
        out.tickWesenAtBase = Math.abs(spW - AnazhRealm.CREATURE_BUILD_SPEED) < 1.0;

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
        r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const rows = listEl ? listEl.querySelectorAll(".creature-row") : [];
        let rowsWithTitle = 0;
        for (const row of rows) {
            // Hof-E — der Stats-title sitzt jetzt auf der kompakten Zeile (.creature-row-main).
            const main = row.querySelector(".creature-row-main");
            const t = (main && main.title) || "";
            if (t && /HP\s+\d/.test(t) && /SPD\s+\d/.test(t) && /DMG\s+\d/.test(t)) rowsWithTitle++;
        }
        out.uiRowsHaveStatsTitle = rowsWithTitle === rows.length && rows.length > 0;

        // 10. STAT_FROM_TAGS aus Class — Symmetrie zum Spieler
        const playerStatKeys = Object.keys(AnazhRealm.STAT_FROM_TAGS);
        const creatureStatKeys = Object.keys(csW.stats);
        out.sameStatKeysAsPlayer =
            playerStatKeys.length === creatureStatKeys.length &&
            playerStatKeys.every((k) => creatureStatKeys.includes(k));

        return out;
    });

    if (wave6hP2f1Results && !wave6hP2f1Results.error) {
        check(
            "computeCreatureStats liefert {tags, stats} mit allen 8 Stats",
            wave6hP2f1Results.statsHasTags && wave6hP2f1Results.statsHasAll8
        );
        check(
            "Soul-Diskrimination — Sprite schneller als Wesen",
            wave6hP2f1Results.spriteFasterThanWesen
        );
        check(
            "Soul-Diskrimination — Wesen ≠ Sprite in mind. 1 Stat (emergent)",
            wave6hP2f1Results.wesenSpriteDiscriminated
        );
        check("Geist hat magicResist > 0", wave6hP2f1Results.geistHasMagicResist);
        check("Tags in [0, 2] (clamped + Spec-Bonus tolerant)", wave6hP2f1Results.tagsInBounds);
        check(
            "_refreshCreatureStatsCache schreibt userData.stats",
            wave6hP2f1Results.cacheWritesStats
        );
        check("_creatureBodySpeedMultiplier > 0 für alle Seelen", wave6hP2f1Results.bodyMulPositive);
        check(
            "Sprite-bodyMul > Wesen-bodyMul (Vision: leichte Form schneller)",
            wave6hP2f1Results.spriteBodyMulHigher
        );
        check(
            "Tick — Sprite läuft schneller als Wesen (selbe Task, body-mul wirkt)",
            wave6hP2f1Results.tickSpriteFaster
        );
        check("Tick — Wesen bei ~BUILD_SPEED (bodyMul ≈ 1)", wave6hP2f1Results.tickWesenAtBase);
        check(
            "Spec-Bonus emergiert in stats.magieleitung (Wissen leitet)",
            wave6hP2f1Results.specBonusMagieleitung
        );
        check(
            "UI — alle creature-rows haben title-Tooltip mit Stats",
            wave6hP2f1Results.uiRowsHaveStatsTitle
        );
        check(
            "Stat-Keys identisch zu Spieler (Vision §1.3 fraktal)",
            wave6hP2f1Results.sameStatKeysAsPlayer
        );
    } else if (wave6hP2f1Results && wave6hP2f1Results.error) {
        check(`Welle 6.H P2F.1: evaluate-Fehler — ${wave6hP2f1Results.error}`, false);
    }

    // ### Welle 6.H Phase 2F.2 — Kreatur-Equipped (Werkzeug + Rüstung) ###
    // Kreaturen tragen Werkzeug + Rüstung wie der Spieler: equipped Compound-Tags stacken mit
    // TOOL_STAT_WEIGHT / ARMOR_STAT_WEIGHT; Persistenz via _serializeCreature → snap.equipped.
    const wave6hP2f2Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};
        const Class = AnazhRealm;

        // 2. Neu gespawnte Kreatur hat equipped-Slots initial null
        const player = st.playerMesh.position;
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
        if (r.cloneBlueprint("stein_block", armorName)) {
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
        const c2 = r.spawnCreatureAt(player.x + 310, player.y, player.z + 310, "happy", "wesen");
        const baseStats = r.computeCreatureStats(c2).stats;
        // Eigenes Werkzeug: stein_block-Clone via setBlueprintToolMeta +
        // registerBlueprintAsTool. Tool-Name === Bauplan-Name.
        const toolBp = "test_tool_bp_p2f2";
        if (r.cloneBlueprint("stein_block", toolBp)) {
            const meta = r.setBlueprintToolMeta(toolBp, "test_op_p2f2", "subtractive");
            const reg = meta && meta.ok ? r.registerBlueprintAsTool(toolBp) : null;
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

        // 8. DSL-Ops creature_equip_tool/armor/unequip wirken
        const cDsl = r.spawnCreatureAt(player.x + 320, player.y, player.z + 320, "happy", "wesen");
        const idx = st.creatures.indexOf(cDsl);
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
        r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const equippedWraps = listEl ? listEl.querySelectorAll(".creature-equipped") : [];
        out.uiEquippedWrapsExist = equippedWraps.length > 0;
        const toolPills = listEl ? listEl.querySelectorAll(".creature-equip.creature-equip-tool") : [];
        out.uiToolPillsExist = toolPills.length > 0;

        // Cleanup: Test-Baupläne löschen damit Ring 6.6-Liste-Zähler stimmt.
        // Plus workshop-DOM neu rendern (deleteBlueprint triggert das nicht
        // automatisch — Ring 6.6 prüft DOM-Liste vs. state.blueprints).
        r.deleteBlueprint("test_armor_p2f2");
        r.deleteBlueprint("test_tool_bp_p2f2");
        r.deleteBlueprint("test_armor_bp_p2f2");
        r._renderWorkshopDOM();

        return out;
    });

    if (wave6hP2f2Results && !wave6hP2f2Results.error) {
        check(
            "spawnCreatureAt initialisiert equipped = {tool: null, armor: null}",
            wave6hP2f2Results.initialToolNull && wave6hP2f2Results.initialArmorNull
        );
        check(
            "equipCreatureTool akzeptiert Built-in-Tool (hammer)",
            wave6hP2f2Results.equipToolOk && wave6hP2f2Results.toolSet
        );
        check(
            "equipCreatureTool lehnt unbekanntes Tool ab (tool_unknown)",
            wave6hP2f2Results.unknownToolRejected && wave6hP2f2Results.toolUnchangedAfterReject
        );
        check(
            "equipCreatureArmor akzeptiert Bauplan mit role:armor",
            wave6hP2f2Results.equipArmorOk && wave6hP2f2Results.armorSet
        );
        check(
            "equipCreatureArmor lehnt nicht-Armor-Bauplan ab (not_marked_as_armor)",
            wave6hP2f2Results.wrongArmorRejected
        );
        check(
            "unequipCreatureSlot räumt tool + armor + lehnt invalid slot ab",
            wave6hP2f2Results.unequipToolOk &&
                wave6hP2f2Results.unequipArmorOk &&
                wave6hP2f2Results.unequipInvalidSlotRejected
        );
        check(
            "Tool-Equipped ändert computeCreatureStats (Stats-Stacking)",
            wave6hP2f2Results.toolStatsChanged
        );
        check("Tool mit stein-Tag erhöht HP-Stat (dichte-Bonus)", wave6hP2f2Results.toolHpHigher);
        check(
            "Armor-Equipped ändert computeCreatureStats",
            wave6hP2f2Results.armorStatsChanged && wave6hP2f2Results.armorHpHigher
        );
        check(
            "DSL creature_equip_tool + creature_unequip wirken",
            wave6hP2f2Results.dslEquipToolOk && wave6hP2f2Results.dslUnequipOk
        );
        check(
            "alle 3 Equip-Ops in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hP2f2Results.opsNonBroadcast
        );
        check(
            "describeProgram zeigt Werkzeug/Rüstung/Slot",
            wave6hP2f2Results.descEquipTool && wave6hP2f2Results.descEquipArmor && wave6hP2f2Results.descUnequip
        );
        check(
            "_serializeCreature schreibt equipped + Restore übernimmt es",
            wave6hP2f2Results.snapHasEquipped && wave6hP2f2Results.restoreKeepsEquippedTool
        );
        check(
            "Restore lässt unbekanntes Tool silent fallen (defensive)",
            wave6hP2f2Results.restoreSilentDropsUnknown
        );
        check(
            "UI — .creature-equipped Wraps + .creature-equip-tool Pills",
            wave6hP2f2Results.uiEquippedWrapsExist && wave6hP2f2Results.uiToolPillsExist
        );
    } else if (wave6hP2f2Results && wave6hP2f2Results.error) {
        check(`Welle 6.H P2F.2: evaluate-Fehler — ${wave6hP2f2Results.error}`, false);
    }

    // ### Welle 6.H Phase 2F.3 — Kreatur-Boosts via Konsumables (HYLOMORPHISMUS) ###
    // Boost = `computeCompoundTags(consumableBp) × scale` — kein Hardcode, keine Tabelle. Bauplan mit
    // role:"consumable" + consumableMeta; RMB + Hotbar-Konsumable + Raycast-Kreatur = Übergabe.
    const wave6hP2f3Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};
        const Class = AnazhRealm;

        // 2. Neu gespawnte Kreatur hat boosts = []
        const player = st.playerMesh.position;
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
            const meta = r.setBlueprintAsConsumable(tonicName, 30, "Stein-Tonic", 0.2);
            out.consumableMarkOk = !!(meta && meta.ok);
            // Trank-Compound-Tags lesen (kontrolle)
            const tonicTags = r.computeCompoundTags(st.blueprints[tonicName]);
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
        const dslIdx = st.creatures.indexOf(cDsl);
        r.dslRun(["creature_apply_boost", dslIdx, tonicName], { source: "test" });
        out.dslAppliedBoost = Array.isArray(cDsl.userData.boosts) && cDsl.userData.boosts.length === 1;

        // 11. NON_BROADCASTABLE-Mitgliedschaft
        out.opNonBroadcast = Class.NON_BROADCASTABLE_OPS.has("creature_apply_boost");

        // 12. describeProgram
        const desc = r.describeProgram(["creature_apply_boost", 0, tonicName]);
        out.descShowsBp = /Trank/.test(desc) && desc.includes(tonicName);

        // 13. Inventar-Konsum: _consumeBlueprintFromInventory
        if (Array.isArray(st.player.inventory)) {
            st.player.inventory[0] = {
                kind: "blueprint",
                blueprintName: tonicName,
                count: 3,
            };
            const consumed = r._consumeBlueprintFromInventory(tonicName);
            out.consumeReducesCount = consumed === true && st.player.inventory[0].count === 2;
            // Bei count=0 → null
            st.player.inventory[0].count = 1;
            r._consumeBlueprintFromInventory(tonicName);
            out.consumeNullsSlotAt0 = st.player.inventory[0] === null;
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
        st.player.inventory = new Array(27).fill(null);
        const pfadEmpty = r._consumableInventoryGate(tonicName);
        out.pfadRejectsWithoutPotion = pfadEmpty.ok === false;
        // Inventar gefüllt → pfad konsumiert
        st.player.inventory[0] = {
            kind: "blueprint",
            blueprintName: tonicName,
            count: 1,
        };
        const pfadOk = r._consumableInventoryGate(tonicName);
        out.pfadConsumes = pfadOk.ok === true && st.player.inventory[0] === null;
        r.setGameMode(origMode || "frieden");

        // 15. UI: .creature-boost Pills bei Kreatur mit aktivem Boost
        r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        const boostPills = listEl ? listEl.querySelectorAll(".creature-boost") : [];
        out.uiHasBoostPills = boostPills.length > 0;

        // Cleanup
        r.deleteBlueprint(tonicName);
        r._renderWorkshopDOM();

        return out;
    });

    if (wave6hP2f3Results && !wave6hP2f3Results.error) {
        check("spawnCreatureAt initialisiert boosts = []", wave6hP2f3Results.initialBoostsEmpty);
        check(
            "applyCreatureBoost legt Boost mit source + tagDelta + expiresAt an",
            wave6hP2f3Results.applyOk && wave6hP2f3Results.boostsListed && wave6hP2f3Results.boostHasSource
        );
        check(
            "applyCreatureBoost mit leerem tagDelta → lehnt ab",
            wave6hP2f3Results.emptyBoostRejected
        );
        check(
            "Selbe source dedupliziert (verlängert + tagDelta-Update)",
            wave6hP2f3Results.dedupeBySource && wave6hP2f3Results.deltaUpdated
        );
        check("Boost-tagDelta fließt in computeCreatureStats (HP+)", wave6hP2f3Results.hpBoosted);
        check("setBlueprintAsConsumable markiert Bauplan", wave6hP2f3Results.consumableMarkOk);
        check(
            "HYLOMORPHISMUS — Konsumable-Compound-Tags emergieren als Boost",
            wave6hP2f3Results.tagBonusEmerged && wave6hP2f3Results.tagBonusHasDichte
        );
        check(
            "activateCreatureConsumable wendet emergenten Boost auf Kreatur an",
            wave6hP2f3Results.activateOk && wave6hP2f3Results.boostOnCreature
        );
        check(
            "Konsumable hebt Kreatur-Stats sichtbar (HP+ via dichte-Boost)",
            wave6hP2f3Results.consumableLiftsStats
        );
        check(
            "nicht-consumable Bauplan → activate lehnt ab (not_marked_as_consumable)",
            wave6hP2f3Results.nonConsumableRejected
        );
        check("tickCreatureBoosts entfernt abgelaufene Boosts", wave6hP2f3Results.expiredCleaned);
        check("DSL creature_apply_boost wendet Konsumable an", wave6hP2f3Results.dslAppliedBoost);
        check(
            "creature_apply_boost in NON_BROADCASTABLE_OPS (Spieler-private Geste)",
            wave6hP2f3Results.opNonBroadcast
        );
        check("describeProgram zeigt Trank-Namen", wave6hP2f3Results.descShowsBp);
        check(
            "_consumeBlueprintFromInventory zieht 1 ab + nulled Slot bei count=0",
            wave6hP2f3Results.consumeReducesCount &&
                wave6hP2f3Results.consumeNullsSlotAt0 &&
                wave6hP2f3Results.noStockReturnsFalse
        );
        check(
            "Modus-Gate — schöpfer kostenlos, pfad konsumiert Inventar oder lehnt ab",
            wave6hP2f3Results.schoepferFree &&
                wave6hP2f3Results.pfadRejectsWithoutPotion &&
                wave6hP2f3Results.pfadConsumes
        );
        check(
            "UI — .creature-boost Pills in der Liste bei aktiven Boosts",
            wave6hP2f3Results.uiHasBoostPills
        );
    } else if (wave6hP2f3Results && wave6hP2f3Results.error) {
        check(`Welle 6.H P2F.3: evaluate-Fehler — ${wave6hP2f3Results.error}`, false);
    }
}

// W-D RITT + SPAWN-HYGIENE: (1) der Reiter sitzt auf der SITZ-Hüfte (SITZ_HIP_OFFSET 0.45) statt
// der Steh-Anatomie (+0.9); (2) SPIELER-KLEMME an der Kreatur-Wurzel: kein frisches Wesen
// materialisiert IM Spieler (≥ 3 m radial); Restore/Peer-Sicht bleiben PRECISE (bit-treu).
async function checkBandWDRittSpawn({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = AnazhRealm;
        const out = {};
        // (1) die Sitz-Hüfte beweist gate:vehicle-drive am Aufsitzen (sitzKern); (2) die Klemme: ein Spawn IM Spieler (1 m) landet auf ≥3 m; precise bleibt.
        const pm = st.playerMesh.position;
        const saveMax = st.maxCreatures;
        st.maxCreatures = st.creatures.length + 2;
        const nah = r.spawnCreatureAt(pm.x + 1, pm.y, pm.z, "happy", "wesen");
        const dNah = nah ? Math.hypot(nah.position.x - pm.x, nah.position.z - pm.z) : -1;
        out.klemmeWirkt = !!nah && dNah >= (A.CREATURE_SPAWN_CLEAR_M || 3) - 1e-6;
        const genau = r.spawnCreatureAt(pm.x + 1, pm.y, pm.z, "happy", "wesen", { precise: true });
        const dGenau = genau ? Math.hypot(genau.position.x - pm.x, genau.position.z - pm.z) : -1;
        out.preciseUnberuehrt = !!genau && Math.abs(dGenau - 1) < 1e-6;
        for (const c of [nah, genau]) {
            if (!c) continue;
            r.removeCreature(c);
            st.creatures = (st.creatures || []).filter((x) => x !== c);
        }
        st.maxCreatures = saveMax;
        return out;
    });
    check(
        `W-D(R-017) Spieler-Klemme: frischer Spawn IM Spieler landet auf ≥3 m (gemessen ${res.klemmeWirkt}), precise bleibt bit-treu (${res.preciseUnberuehrt})`,
        res.klemmeWirkt && res.preciseUnberuehrt
    );
}

// KREATUR-GRÖSSEN-STAT-SYMMETRIE (Folge zu V18.195/V18.206
// Spieler-Symmetrie): größere Kreaturen sind robuster aber langsamer.
async function checkBandV18208CreatureSizeSymmetry({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = AnazhRealm;
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
        `(C2) AnazhRealm.CREATURE_SOULS existiert (${res.soulCount} Seelen)`,
        res.creatureSoulsExists === true
    );
    check(`(C3a) HP-Monotonie über Kreatur-Spektrum (größer = mehr HP)`, res.hpMonotone === true);
    check(`(C3b) Speed-Monotonie (größer = langsamer)`, res.speedMonotone === true);
    // REALITÄTS-EICHUNG 17.07. — gesetz-relativ statt Arcade-Literal (war „Floor ≥ 2" / Spanne 0.5).
    check(
        `(C4) Floor speed ≥ (2/7)·Gesetz-base (${res.speedFloor && res.speedFloor.toFixed(3)}) für alle Kreatur-Seelen`,
        res.allSpeedAtFloor === true
    );
    check(`(C5a) HP variiert über Kreaturen (kein einheitlicher Wert)`, res.hpVariesAmongCreatures === true);
    check(
        `(C5b) Speed variiert über Kreaturen (Spanne ${res.speedRange && res.speedRange.toFixed(3)} > 0.5·base/7)`,
        res.speedVariesAmongCreatures === true
    );
}

module.exports = {
    checkBandV1725FieldReaders, checkBandV1751CombatStats, checkBandV1753CreatureCombat, checkBandV1754PlayerAttack,
    checkBandWelle6HBuildAndPersist, checkBandWelle6HCreatureStats, checkBandWDRittSpawn,
    checkBandV18208CreatureSizeSymmetry,
};
