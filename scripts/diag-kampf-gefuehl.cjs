#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kampf-gefuehl.cjs — DIE GERECHNETE SCHWUNGPHYSIK ERREICHT DEN KAMPF
// (npm run gate:kampf-gefuehl; Orakel Tier-1 #5).
//
// Die Linse hält fünf Kampf-Gesetze am ECHTEN Chokepoint (_beginPlayerSwing /
// _tickKampfSchwung / _kampfSweepTick / damageCreature / updateCreatures),
// headless/Null-Renderer:
//
//  (A) DAUER ∝ √I: die Schwung-Dauer zweier Waffen (echte _swingDynamics-
//      Trägheiten zweier Blueprints, beide UNGEKLEMMT im [min,max]-Band)
//      verhält sich wie √(I2/I1) ± 5 % — die EINE Quelle; die attackSpeed-
//      Parallel-Wahrheit ist für den Spieler-Schwung gefallen (Source-Proben:
//      Cooldown/HUD/Werkstatt lesen _swingDauer*, _playerAttackCreature liest
//      KEIN attackSpeed und schädigt NICHT selbst — der Klick löst nur aus).
//  (B) KLINGEN-SWEEP: ein Ziel NEBEN dem Crosshair (0.9 m seitlich der Blick-
//      Linie, innerhalb der Klingen-Kapsel) wird in der Strike-Phase getroffen,
//      GENAU EINMAL je Schwung (Dedup); ein Ziel HINTER dem Rücken NIE.
//      Treffer-Juice: Hit-Stop-Fenster gesetzt + Kamera-Impuls über den
//      BESTEHENDEN Landungs-Dip (_landImpactPending) + Klang-One-Shot über die
//      EXISTIERENDE Maschine (Stimme-aus → stumm, kein zweiter AudioContext).
//  (C) HIT-STOP ≠ SIM: während des Hit-Stops steht die ANZEIGE-Uhr (walkPhase
//      + Schwung-Phase frieren), aber die FIXE SIM läuft weiter — die Fixed-
//      Akku-Probe (_loopFixedStep steppt, _fixedSimTime wächst) beweist es;
//      Source-Probe: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE.
//  (D) TOD-KIPPEN: ein Kill despawnt NICHT sofort — der Körper kippt (die
//      Rotation WÄCHST über die Ticks, Richtung aus _fieldGradient), das
//      sterbende Wesen ist inert (damageCreature-Wand), der Despawn kommt
//      erst NACH der Frist (kippDauer + Nachklang).
//  (E) OBERKÖRPER-LAYER: der Schwung ist ein WEITERER additiver Posen-Layer
//      über der Lokomotion (rechter Arm/Rumpf bewegen sich, die BEINE bleiben
//      byte-gleich); nach dem Schwung ist die Pose rückstandsfrei byte-alt.
//  (S) SELBST-TESTS (die Linse feuert): (S1) _hitStopFactor ≡ 1 gestubbt →
//      die Anzeige-Uhr läuft trotz Hit-Stop — die Freeze-Messung misst den
//      echten Faktor. (S2) _segSegDistSq ≡ ∞ gestubbt → der Sweep trifft
//      nichts — die Treffer-Messung fließt durch die echte Kapsel-Mathe.
//      Beide Stubs restauriert (Gate-Hook-Lehre).
//
//   node scripts/diag-kampf-gefuehl.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4451;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei, Produktions-Boot
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: die Welt settled pumpen (plateau-basiert, die V18.273-Lehre).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 40) break;
                if (ticks % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });

        // SYNCHRON messen (keine awaits — der rAF-Loop kann nicht dazwischenfunken).
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            for (const fn of [
                "_swingDynamics",
                "_swingDauerFuerBlueprint",
                "_playerSwingDauer",
                "_beginPlayerSwing",
                "_playerAttackCreature",
                "_tickKampfSchwung",
                "_kampfSweepTick",
                "_kampfBladeReach",
                "_segSegDistSq",
                "_hitStopFactor",
                "_kampfHitJuice",
                "_playKampfOneShot",
                "_applyKampfSchwungPose",
                "damageCreature",
                "_creatureCombatDeath",
                "updateCreatures",
                "_loopFixedStep",
                "animatePlayerSoul",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            if (!A.SWING_LAWS) return { error: "SWING_LAWS fehlt" };
            const K = A.SWING_LAWS;
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");

            // ── KONSUM-Proben (Lehre 6): die EINE Quelle ist verdrahtet ──
            const atkSrc = codeOf(r._playerAttackCreature);
            o.checks.klickLoestNurAus =
                /_beginPlayerSwing/.test(atkSrc) && !/attackSpeed/.test(atkSrc) && !/damageCreature/.test(atkSrc);
            o.checks.cooldownLiestQuelle =
                /_playerSwingDauer/.test(codeOf(r._beginPlayerSwing)) && !/attackSpeed/.test(codeOf(r._beginPlayerSwing));
            o.checks.hudLiestQuelle = /_playerSwingDauer/.test(codeOf(r.tickStatsHud));
            o.checks.werkstattLiestQuelle = /_swingDauerFuerBlueprint/.test(codeOf(r._blueprintAbilityStats));
            o.checks.simLiestNieHitStop =
                !/_hitStopFactor/.test(codeOf(r._stepFixedSim)) && !/_hitStopFactor/.test(codeOf(r._loopFixedStep));
            o.checks.anzeigeLiestHitStop =
                /_hitStopFactor/.test(codeOf(r.animatePlayerSoul)) && /_hitStopFactor/.test(codeOf(r._tickKampfSchwung));
            o.checks.layerImRigPfad = /_applyKampfSchwungPose/.test(codeOf(r.animatePlayerSoul));
            const juiceSrc = codeOf(r._kampfHitJuice);
            o.checks.juiceKanaele = /_landImpactPending/.test(juiceSrc) && /_playKampfOneShot/.test(juiceSrc);
            const shotSrc = codeOf(r._playKampfOneShot);
            o.checks.klangEineMaschine =
                /masterGain/.test(shotSrc) && /enabled/.test(shotSrc) && !/new\s+AudioContext/.test(shotSrc);
            const deathSrc = codeOf(r._creatureCombatDeath);
            o.checks.todKipptStattDespawn =
                /_fieldGradient/.test(deathSrc) && /dying/.test(deathSrc) && !/removeCreature\(/.test(deathSrc);
            o.checks.abschiedNachFrist = /dying/.test(codeOf(r.updateCreatures)) && /removeCreature\(/.test(codeOf(r.updateCreatures));
            // Stimme-aus respektiert (headless: Symphonie nie aktiviert → stumm, kein Throw)
            o.checks.stimmeAusStumm = r._playKampfOneShot({ härte: 1 }) === false && !s.symphony.enabled;

            // ── (A) DAUER ∝ √I — zwei ECHTE Blueprints durch die ECHTE Quelle ──
            const box = (m, sz, p) => ({ shape: "box", material: m, size: sz, position: p || { x: 0, y: 0, z: 0 } });
            const blu = s.blueprints;
            const leicht = {
                name: "_kg_klinge",
                parts: [box("holz", { x: 0.15, y: 1.5, z: 0.15 }), box("eisen", { x: 0.6, y: 0.6, z: 0.6 }, { x: 0, y: 1.5, z: 0 })],
            };
            const schwer = {
                name: "_kg_hammer",
                parts: [box("holz", { x: 0.15, y: 2.0, z: 0.15 }), box("eisen", { x: 0.9, y: 0.9, z: 0.9 }, { x: 0, y: 2.0, z: 0 })],
            };
            const I1 = r._swingDynamics(leicht).swingInertia;
            const I2 = r._swingDynamics(schwer).swingInertia;
            const D1 = r._swingDauerFuerBlueprint(leicht);
            const D2 = r._swingDauerFuerBlueprint(schwer);
            o.dauer = { I1, I2, D1, D2 };
            const eps = 0.005;
            o.checks.aBeideUngeklemmt =
                I2 > I1 * 1.5 &&
                D1 > K.minDauerSec + eps &&
                D1 < K.maxDauerSec - eps &&
                D2 > K.minDauerSec + eps &&
                D2 < K.maxDauerSec - eps;
            o.dauerRatio = D1 > 0 ? D2 / D1 : 0;
            o.dauerSoll = I1 > 0 ? Math.sqrt(I2 / I1) : 0;
            o.checks.aVerhaeltnisWurzelI = o.dauerSoll > 0 && Math.abs(o.dauerRatio / o.dauerSoll - 1) <= 0.05;
            // die Faust hat eine endliche Dauer (kein Instant-Prügeln)
            o.checks.aFaustDauer = r._swingDauerFuerBlueprint(null) === K.handDauerSec && K.handDauerSec > 0.1;

            // ── Bühne für (B)/(C)/(E): Waffe in die Hand, bekannte Blickrichtung ──
            const p = s.player;
            const pm = s.playerMesh;
            if (!p || !pm) return { error: "kein Spieler" };
            const saved = {
                yaw: s.yaw,
                equipped: p.equipped,
                swing: p._swing,
                hitStop: p._hitStopUntil,
                landImpact: s._landImpactPending,
                lastAttackAt: p.lastAttackAt,
                maxCreatures: s.maxCreatures,
                vel: s.playerVel,
                uw: s.playerUnderwater,
                mounted: p.mountedArch,
                walkPhase: p.walkPhase,
                gaitW: p._gaitW,
                lastTick: p.animationLastTick,
                soul: p.soul,
            };
            blu._kg_klinge = leicht;
            p.equipped = { held: "_kg_klinge" };
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
            s.yaw = 0; // Blick nach +z (die _loopCamera-Konvention)
            p._hitStopUntil = 0;
            p._swing = null;

            const spawnBei = (dx, dz) => {
                const c = r.spawnCreatureAt(pm.position.x + 200, pm.position.y, pm.position.z + 200, "happy", "wesen");
                if (c) c.position.set(pm.position.x + dx, pm.position.y, pm.position.z + dz);
                return c;
            };
            const reach = r._kampfBladeReach();
            o.reach = reach;
            const cNeben = spawnBei(0.9, Math.min(1.8, reach - 0.4)); // NEBEN dem Crosshair, in der Kapsel
            const cRuecken = spawnBei(0, -2.0); // HINTER dem Rücken
            if (!cNeben || !cRuecken) return { error: "Kreatur-Spawn fehlgeschlagen (Cap?)" };

            const schwinge = (t0) => {
                // ein voller Schwung über die synthetische Anzeige-Uhr; zählt die
                // hp-Abfälle des Neben-Ziels (Dedup-Beweis) + merkt das Hit-Fenster.
                p._swing = null;
                const okStart = r._beginPlayerSwing();
                if (!okStart || !p._swing) return { okStart: false, hits: 0 };
                p._swing.lastT = t0;
                let hits = 0;
                let prevHp = cNeben.userData.hp;
                let t = t0;
                for (let k = 0; k < 200 && p._swing; k++) {
                    t += 0.02;
                    r._tickKampfSchwung(t);
                    if (cNeben.userData.hp < prevHp) {
                        hits++;
                        prevHp = cNeben.userData.hp;
                    }
                }
                return { okStart: true, hits, tEnd: t };
            };

            // ── (B) SWEEP: Neben-Ziel EINMAL, Rücken-Ziel NIE, Juice feuert ──
            const hpNeben0 = cNeben.userData.hp;
            const hpRueck0 = cRuecken.userData.hp;
            s._landImpactPending = 0;
            const lauf1 = schwinge(1000);
            o.sweep = lauf1;
            o.checks.bTrifftNeben = lauf1.okStart && cNeben.userData.hp < hpNeben0;
            o.checks.bDedupEinmal = lauf1.hits === 1;
            o.checks.bNieRuecken = cRuecken.userData.hp === hpRueck0 && !cRuecken.userData.dying;
            o.checks.bHitStopGesetzt = Number.isFinite(p._hitStopUntil) && p._hitStopUntil > 1000;
            o.checks.bKameraImpuls = (s._landImpactPending || 0) >= K.hitDipImpact - 1e-9;
            // ein zweiter Schwung trifft WIEDER (der Dedup gilt JE Schwung, nicht
            // global) — das Ziel re-pinnen (der Knockback schob es hinaus).
            const pinNeben = () =>
                cNeben.position.set(pm.position.x + 0.9, pm.position.y, pm.position.z + Math.min(1.8, reach - 0.4));
            p._hitStopUntil = 0;
            pinNeben();
            const hpNeben1 = cNeben.userData.hp;
            const lauf2 = schwinge(2000);
            o.checks.bZweiterSchwungTrifft = lauf2.okStart && cNeben.userData.hp < hpNeben1;

            // ── (S2) SELBST-TEST: Kapsel-Mathe gestubbt (∞) → kein Treffer ──
            p._hitStopUntil = 0;
            pinNeben();
            const savedSeg = r._segSegDistSq;
            r._segSegDistSq = () => Infinity;
            const hpNeben2 = cNeben.userData.hp;
            const laufStub = schwinge(3000);
            r._segSegDistSq = savedSeg; // restaurieren (Gate-Hook-Lehre)
            o.checks.s2LinseFeuert = laufStub.okStart && cNeben.userData.hp === hpNeben2;

            // ── (C) HIT-STOP ≠ SIM: Anzeige friert, die Fixed-Akku läuft weiter ──
            p._hitStopUntil = Number.MAX_SAFE_INTEGER; // Hit-Stop „ewig" (synthetisch)
            // (C1) die Schwung-Phase friert
            p._swing = null;
            r._beginPlayerSwing();
            const swC = p._swing;
            swC.lastT = 5000;
            for (let k = 1; k <= 20; k++) r._tickKampfSchwung(5000 + k * 0.02);
            o.checks.cSchwungFriert = !!p._swing && p._swing.t === 0;
            p._swing = null;
            // (C2) die Gang-Phase friert (echter Konsument animatePlayerSoul)
            if (!pm.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
            const mesh = s.playerMesh;
            if (!mesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            s.playerUnderwater = false;
            p.mountedArch = null;
            let vStub = 5;
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            const gehe = (t0, n) => {
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0);
                const ph0 = p.walkPhase;
                for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
                return p.walkPhase - ph0;
            };
            const dPhaseGestoppt = gehe(6000, 30);
            o.dPhaseGestoppt = dPhaseGestoppt;
            o.checks.cGangFriert = dPhaseGestoppt === 0;
            // (C3) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (Fixed-Akku-Probe)
            s.playerVel = saved.vel; // die Sim braucht den ECHTEN Body (kein Stub)
            const simT0 = s._fixedSimTime;
            const steps1 = r._loopFixedStep(0.05, performance.now() / 1000);
            const steps2 = r._loopFixedStep(0.05, performance.now() / 1000 + 0.05);
            o.simSteps = steps1 + steps2;
            o.simDelta = s._fixedSimTime - simT0;
            o.checks.cSimLaeuftWeiter = o.simSteps >= 2 && o.simDelta > 0;
            // (C4) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            p._hitStopUntil = 0;
            const dPhaseFrei = gehe(7000, 30);
            o.dPhaseFrei = dPhaseFrei;
            o.checks.cGegenprobeLaeuft = dPhaseFrei > 0;
            // (S1) SELBST-TEST: _hitStopFactor ≡ 1 gestubbt → trotz Hit-Stop läuft die Uhr
            const savedFactor = r._hitStopFactor;
            p._hitStopUntil = Number.MAX_SAFE_INTEGER;
            r._hitStopFactor = () => 1;
            const dPhaseStub = gehe(8000, 30);
            r._hitStopFactor = savedFactor; // restaurieren (Gate-Hook-Lehre)
            p._hitStopUntil = 0;
            o.dPhaseStub = dPhaseStub;
            o.checks.s1LinseFeuert = dPhaseStub > 0;

            // ── (E) OBERKÖRPER-LAYER additiv über der Lokomotion ──
            const rig = mesh.userData.rig;
            const poseBei = (swing) => {
                vStub = 0;
                p._gaitW = 0;
                p.walkPhase = 0;
                p._swing = swing || null;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(9000);
                r.animatePlayerSoul(9000); // dt=0 (Uhr steht) — deterministische Idle-Pose
                return {
                    armX: rig.armR.shoulder.rotation.x,
                    chestY: rig.chest ? rig.chest.rotation.y : 0,
                    legLHip: rig.legL.hip.rotation.x,
                    legRKnee: rig.legR.knee.rotation.x,
                };
            };
            const dauerE = r._playerSwingDauer();
            const mkSwing = (t) => ({
                t,
                dauer: dauerE,
                windupSec: dauerE * K.windupFrac,
                strikeSec: dauerE * K.strikeFrac,
                weapon: null,
                hits: new Set(),
                reach: 2,
                lastT: 0,
            });
            const pose0 = poseBei(null); // reine Lokomotion (Idle)
            const poseW = poseBei(mkSwing(dauerE * K.windupFrac * 0.6)); // mitten im Windup
            const poseEnd = poseBei(null); // nach dem Schwung: rückstandsfrei
            o.pose = { pose0, poseW };
            o.checks.eArmHebt = Math.abs(poseW.armX - pose0.armX) > 0.3 && Math.abs(poseW.chestY - pose0.chestY) > 0.05;
            o.checks.eBeineByteGleich =
                poseW.legLHip === pose0.legLHip && poseW.legRKnee === pose0.legRKnee;
            o.checks.eRueckstandsfrei =
                poseEnd.armX === pose0.armX && poseEnd.chestY === pose0.chestY;
            p._swing = null;

            // ── (D) TOD-KIPPEN: Rotation wächst, inert, Despawn erst nach Frist ──
            const cTod = spawnBei(60, 60); // weit weg — kein Sweep-/Spieler-Einfluss
            if (!cTod) return { error: "Tod-Kreatur-Spawn fehlgeschlagen" };
            // up·y der gedrehten Hochachse — reine Quaternion-Mathe (R(q)·(0,1,0)).y
            // = 1 − 2(qx² + qz²), kein THREE nötig.
            const upY = (c) => 1 - 2 * (c.quaternion.x * c.quaternion.x + c.quaternion.z * c.quaternion.z);
            const kill = r.damageCreature(cTod, 99999, { source: "world" });
            o.checks.dKillKipptErst =
                !!kill.killed && !!cTod.userData.dying && s.creatures.indexOf(cTod) !== -1;
            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) r.updateCreatures(dt);
            };
            const uy0 = upY(cTod);
            tick(2, 0.1); // t=0.2
            const uyA = upY(cTod);
            tick(3, 0.1); // t=0.5
            const uyB = upY(cTod);
            o.kipp = { uy0, uyA, uyB };
            o.checks.dRotationWaechst = uy0 > 0.95 && uyA < uy0 - 0.005 && uyB < uyA - 0.05;
            o.checks.dNochDa = s.creatures.indexOf(cTod) !== -1;
            const nachtreten = r.damageCreature(cTod, 10, { source: "world" });
            o.checks.dSterbendInert = nachtreten.ok === false && nachtreten.reason === "dying";
            tick(5, 0.1); // t=1.0 — der Kipp ist vollendet, der Nachklang läuft
            const uyC = upY(cTod);
            o.kipp.uyC = uyC;
            o.checks.dGekippt = uyC < 0.35 && s.creatures.indexOf(cTod) !== -1;
            tick(4, 0.1); // t=1.4 > kippDauer + Nachklang → der bestehende Abschied
            o.checks.dDespawnNachFrist = s.creatures.indexOf(cTod) === -1;

            // ── Bühne restaurieren ──
            for (const c of [cNeben, cRuecken]) {
                if (s.creatures.indexOf(c) !== -1) {
                    if (c.userData.dying) {
                        c.userData.dying.t = 9999;
                        r.updateCreatures(0.016);
                    } else r.removeCreature(c);
                }
            }
            delete blu._kg_klinge;
            s.yaw = saved.yaw;
            p.equipped = saved.equipped;
            p._swing = saved.swing;
            p._hitStopUntil = saved.hitStop;
            s._landImpactPending = saved.landImpact;
            p.lastAttackAt = saved.lastAttackAt;
            s.maxCreatures = saved.maxCreatures;
            s.playerVel = saved.vel;
            s.playerUnderwater = saved.uw;
            p.mountedArch = saved.mounted;
            p.walkPhase = saved.walkPhase;
            p._gaitW = saved.gaitW;
            p.animationLastTick = saved.lastTick;

            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== KAMPF-GEFÜHL — Dauer ∝ √I · Klingen-Sweep · Hit-Stop ≠ Sim · Tod-Kippen (gate:kampf-gefuehl) =====\n"
    );
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const c = out.checks;
        console.log(
            `  (A) I1=${out.dauer.I1.toFixed(3)} → ${out.dauer.D1.toFixed(3)} s · I2=${out.dauer.I2.toFixed(3)} → ${out.dauer.D2.toFixed(3)} s · Ratio ${out.dauerRatio.toFixed(3)} (soll √(I2/I1)=${out.dauerSoll.toFixed(3)})`
        );
        console.log(
            `  (B) Reichweite ${out.reach.toFixed(2)} m · Treffer je Schwung ${out.sweep.hits} · (C) Sim-Schritte im Hit-Stop ${out.simSteps} (Δt ${out.simDelta.toFixed(3)} s) · Phase gestoppt ${out.dPhaseGestoppt.toFixed(3)} / frei ${out.dPhaseFrei.toFixed(2)}`
        );
        console.log(
            `  (D) up·y: ${out.kipp.uy0.toFixed(2)} → ${out.kipp.uyA.toFixed(2)} → ${out.kipp.uyB.toFixed(2)} → ${out.kipp.uyC.toFixed(2)} · (E) Arm ${out.pose.pose0.armX.toFixed(2)} → ${out.pose.poseW.armX.toFixed(2)}\n`
        );
        check(c.klickLoestNurAus, "KONSUM: der Crosshair-Klick löst NUR aus (kein attackSpeed, kein Direkt-Schaden)");
        check(c.cooldownLiestQuelle, "KONSUM: der Cooldown IST die Schwung-Dauer (_playerSwingDauer — EINE Quelle)");
        check(c.hudLiestQuelle, "KONSUM: das Stats-HUD (Angriffstempo) liest die Schwung-Quelle");
        check(c.werkstattLiestQuelle, "KONSUM: die Werkstatt-Ablesung (Tempo) liest die Schwung-Quelle");
        check(c.aBeideUngeklemmt, "(A) beide Fixtures liegen UNGEKLEMMT im [min,max]-Band (der Test ist ehrlich)");
        check(
            c.aVerhaeltnisWurzelI,
            `(A) Schwung-Dauer-Verhältnis ∝ √(I2/I1) ± 5 % (${out.dauerRatio.toFixed(3)} vs ${out.dauerSoll.toFixed(3)})`
        );
        check(c.aFaustDauer, "(A) die leere Faust hat die endliche Hand-Dauer (kein Instant-Prügeln)");
        check(c.bTrifftNeben, "(B) der Sweep trifft ein Ziel NEBEN dem Crosshair (in der Klingen-Kapsel)");
        check(c.bDedupEinmal, `(B) dedupliziert je Schwung: GENAU EIN Treffer (${out.sweep.hits})`);
        check(c.bZweiterSchwungTrifft, "(B) ein zweiter Schwung trifft wieder (Dedup gilt JE Schwung)");
        check(c.bNieRuecken, "(B) NIE ein Ziel hinter dem Rücken (die Wand im Sweep-Chokepoint)");
        check(c.bHitStopGesetzt, "(B) der Treffer öffnet das Hit-Stop-Fenster (60–100 ms)");
        check(c.bKameraImpuls, "(B) Kamera-Impuls über den BESTEHENDEN Landungs-Dip (_landImpactPending)");
        check(c.juiceKanaele, "(B) Hit-Juice wired: Kamera-Dip + Klang-One-Shot in _kampfHitJuice");
        check(c.klangEineMaschine, "(B) Klang über die EXISTIERENDE Maschine (masterGain, kein zweiter AudioContext)");
        check(c.stimmeAusStumm, "(B) Stimme-aus respektiert: Symphonie aus → der Treffer bleibt stumm");
        check(c.s2LinseFeuert, "SELBST-TEST (S2): Kapsel-Mathe ≡ ∞ gestubbt → kein Treffer (die Messung ist nicht blind)");
        check(c.cSchwungFriert, "(C) HIT-STOP: die Schwung-Phase friert (t bleibt 0)");
        check(c.cGangFriert, "(C) HIT-STOP: die Gang-Phase friert (walkPhase Δ=0 am echten Konsumenten)");
        check(c.cSimLaeuftWeiter, `(C) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (${out.simSteps} Schritte, Fixed-Akku-Probe)`);
        check(c.cGegenprobeLaeuft, "(C) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder");
        check(c.simLiestNieHitStop, "(C) Source-Wand: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE");
        check(c.anzeigeLiestHitStop, "(C) und NUR die Anzeige-Uhr (animatePlayerSoul + Schwung-Tick) liest ihn");
        check(c.s1LinseFeuert, "SELBST-TEST (S1): _hitStopFactor ≡ 1 gestubbt → die Uhr läuft (die Freeze-Messung misst den Faktor)");
        check(c.dKillKipptErst, "(D) TOD: der Kill setzt dying — KEIN Sofort-Despawn");
        check(c.dRotationWaechst, "(D) der Körper KIPPT: die Rotation wächst über die Ticks (entlang _fieldGradient)");
        check(c.dSterbendInert, "(D) ein sterbendes Wesen ist inert (damageCreature-Wand: reason=dying)");
        check(c.dGekippt && c.dNochDa, "(D) gekippt (~83°) und noch DA während des Nachklangs");
        check(c.dDespawnNachFrist, "(D) der Despawn kommt erst NACH der Frist (Kipp + Nachklang)");
        check(c.todKipptStattDespawn, "(D) Source-Wand: _creatureCombatDeath kippt (_fieldGradient), despawnt nicht selbst");
        check(c.abschiedNachFrist, "(D) und updateCreatures trägt den Abschied (removeCreature nach der Frist)");
        check(c.eArmHebt, "(E) OBERKÖRPER-Layer: im Windup heben Arm + Rumpf (additiv über der Lokomotion)");
        check(c.eBeineByteGleich, "(E) die BEINE bleiben byte-gleich (der Layer ist NUR Oberkörper)");
        check(c.eRueckstandsfrei, "(E) nach dem Schwung ist die Pose rückstandsfrei byte-alt");
        check(c.layerImRigPfad, "(E) KONSUM: animatePlayerSoul wendet den Schwung-Layer an");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die gerechnete Schwungphysik erreicht den Kampf: √I führt · die Klinge trifft · die Sim steht nie" : "❌ ROT — das Kampf-Gefühl trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
