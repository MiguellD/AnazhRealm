#!/usr/bin/env node
// diag-tier-gang.cjs — DIE GLEIT-LINSE DER TIERE (Welle 5, „Gang ohne Gleiten"; npm run gate:tier-gang).
// Am ECHTEN Chokepoint (_animateCompoundMotion → _animateTierBaum, headless Null-Renderer, Produktions-Boot): jede
// Gattung läuft geradeaus mit fester Geschwindigkeit (0,8 · 1,6 · 3,0 m/s), je Takt wird der Aufsetz-Punkt jeder Pfote
// (der Boden-Punkt unter der Handwurzel in der Ruhe-Pose, im Gelenk-Raum der Pfote mitgeführt) gemessen. Im STAND
// (der Punkt liegt in den untersten 2,5 % der Beinlänge) darf er nicht mit dem Leib wandern: der SCHLUPF = Weg des
// Stand-Fußes / Weg des Leibs in denselben Takten. Soll ≤ 0,05 (eine Pfote, die mit dem Leib gleitet, hat 1).
// UNTER LAST (Integration W5-Körper): das Zielgerät läuft 30 fps, das Wesen steht im 1/4-Band der Anim-Raten-Leiter
// (_creatureAnimDiv auf 0,8 × Fern-Distanz, mit dem Takt des Gangs) — gemessen wird zwischen zwei Auswertungen (der
// Leib zieht jeden Frame weiter). Vorher deckelte der Takt seinen Schritt auf 0,1 s (die Phase blieb 25 % hinter dem
// Weg, Schlupf 0,27) und die Leiter tastete den schnellen Fuchs-Trab unter seinem Takt ab (Schlupf 1,33).
//   DER SPIELER-LEIB (K07): derselbe Aufsetz-Punkt, dieselbe Schwelle am Menschen (LEIB, unten), dazu Kadenz und Töne,
//   das BECKEN (Hub und Tiefe unter der Ruhe, in Beinlängen: Gehen ≤ 0,07 / 0,15, Laufen ≤ 0,12 / 0,25 — Gard 2004,
//   Cavagna 1976, Lee & Farley 1998) und die LOCK-LÖSER im Stand-Fenster (Soll 0: der stehende Fuß löst nie an der
//   Reichweite, die das Gesetz ihm selbst gibt).
//   DAS KÖRPER-STUDIO (K07): derselbe Schlupf am Menschen des Labors im Spiel-Modus (STUDIO, unten) — geduckt, gehen, Sprint.
//   DIE SCHWERE (K07): Mensch und Tier gehen nach der Schwere der Welt, Schritt und Becken aus EINER Zeile (SCHWERE, unten).
//   --selftest: das Gang-Gesetz gestubbt (fester Takt, feste Auslenkung — der Vor-Welle-Gang) → der Schlupf steigt
//   über die Schwelle, die Linse feuert; die Zeile ohne die Schwere der Welt → die Schwere-Wand feuert.
//   node scripts/diag-tier-gang.cjs [--selftest]
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.TIER_GANG_PORT) || 4449;
const SELBST = process.argv.includes("--selftest");
// TIER_GANG_TEIL=studio: nur das Labor (der Entwicklungs-Lauf; das Gate fährt beide)
const NUR_STUDIO = process.env.TIER_GANG_TEIL === "studio";
// die Ratsche (K07): 0,2 → 0,05 — der Fuß im Stand steht (Gleiten < 5 %), Tier und Mensch an EINER Schwelle
const SCHWELLE = 0.05;
const KADENZ_GEHEN = 1.5; // Schritte/s bei 1,15 m/s (physio-pedia, Weidmann 1993)
const TON_TOLERANZ = 0.15; // Töne = 2·v·t/Λ ± 15 %
// das Becken in Beinlängen (Hub = höchste − tiefste Lage, Tiefe = Ruhe − tiefste Lage): Gehen (Gard 2004: 4–5 cm bei
// 0,9 m Bein) und Laufen (Cavagna 1976, Lee & Farley 1998: Hub 6–10 cm, das Bein federt um 10–15 %). Die Tiefe des
// Gehens als Ratsche 0,15 → 0,08 (K07, das Abrollen des Fußes): mit flachem Fuß sank das Becken um 0,137 L, das Knie
// knickte tief ein (Bild k07n2-mensch-folge).
const BECKEN = { gehen: { hub: 0.07, tief: 0.08 }, laufen: { hub: 0.12, tief: 0.25 } };
const server = statikServer();

// Im Seiten-Kontext: eine Gattung läuft, je Takt die Aufsetz-Punkte.
const LAUF = (k) => {
    const r = window.anazhRealm,
        s = r.state;
    const T = window.THREE;
    const core = window.__tetrapodaCore;
    if (k.stub) {
        window.__gangEcht = core.gangSchritt;
        core.gangSchritt = () => ({ omega: 3.2, S: 0.06, schritt: 0.12 });
    }
    const pm = s.playerMesh.position;
    const x0 = pm.x + 40,
        z0 = pm.z + 40;
    const saveMax = s.maxCreatures;
    s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 4);
    const cr = r.spawnCreatureAt(x0, 30, z0, "happy", k.seele, { precise: true, bodySize: 1 });
    s.maxCreatures = saveMax;
    if (!cr) return { fehler: "Spawn " + k.seele };
    cr.userData.task = { name: "wait", args: {}, since: 0 };
    cr.userData.emotions = null;
    cr.rotation.set(0, Math.PI / 2, 0); // Blick +x, der Lauf geht +x
    cr.position.set(x0, 0, z0);
    const tb = cr.userData._tierBaum;
    const roles = r._motionRolesForSoul(cr.userData.soul);
    const Tt = tb.teile;
    const pfoten = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
    // Kalibrieren: Ruhe-Pose, Boden-Punkt unter der Handwurzel → Pfoten-Raum
    r._tierBaumNeutralStance(cr);
    cr.updateMatrixWorld(true);
    const boden = cr.position.y;
    const lokal = pfoten.map((p) => {
        const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
        w.y = boden;
        return p.worldToLocal(w.clone());
    });
    const hueft = new T.Vector3().setFromMatrixPosition(Tt.legHL.matrixWorld).y - boden;
    // Frame-Takt und Raten-Leiter: je Frame zieht der Leib weiter, ausgewertet (und gemessen) wird, wenn die ECHTE
    // Leiter (_creatureAnimDiv mit dem Takt des Gangs) es will — im Band ihrer Stufe 1/4 (0,8 × Fern-Distanz).
    const dt = 1 / (k.fps || 60),
        N = 360;
    const fernDist = window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * (cr.scale.x || 1);
    const stufe = () => (k.last ? r._creatureAnimDiv(0.8 * fernDist, fernDist, tb._gang ? tb._gang.omega : 0, dt) : 1);
    let maxDiv = 1,
        auswertungen = 0;
    let t = 0,
        phase = 0;
    const spur = pfoten.map(() => []);
    const leib = [];
    cr.userData._animFade = 1;
    for (let i = 0; auswertungen < N; i++) {
        cr.position.x += k.v * dt;
        t += dt;
        phase += dt * 5.0;
        const div = stufe();
        if (i % div !== 0) continue;
        maxDiv = Math.max(maxDiv, auswertungen > 60 ? div : 1);
        auswertungen++;
        r._animateCompoundMotion(cr, roles, t, phase, true, null);
        cr.updateMatrixWorld(true);
        leib.push(cr.position.x);
        pfoten.forEach((p, j) => spur[j].push(p.localToWorld(lokal[j].clone())));
    }
    if (k.stub) core.gangSchritt = window.__gangEcht;
    r.removeCreature(cr);
    // Schlupf je Pfote über die Stand-Takte (nach 60 Takten Einschwingen)
    let wegFuss = 0,
        wegLeib = 0,
        standTakte = 0;
    const drift = [];
    for (let j = 0; j < 4; j++) {
        let ymin = Infinity,
            dj = 0,
            lj = 0;
        for (let i = 60; i < N; i++) ymin = Math.min(ymin, spur[j][i].y);
        for (let i = 61; i < N; i++) {
            const a = spur[j][i - 1],
                b = spur[j][i];
            if (a.y > ymin + 0.05 * hueft || b.y > ymin + 0.05 * hueft) continue;
            standTakte++;
            wegFuss += Math.hypot(b.x - a.x, b.z - a.z);
            wegLeib += Math.abs(leib[i] - leib[i - 1]);
            dj += b.x - a.x;
            lj += leib[i] - leib[i - 1];
        }
        drift.push(lj > 0 ? +(dj / lj).toFixed(2) : null);
    }
    return {
        seele: k.seele,
        v: k.v,
        last: k.last ? `${k.fps} fps · Leiter 1/${maxDiv}` : "",
        hueftM: +hueft.toFixed(3),
        standAnteil: +(standTakte / (4 * (N - 61))).toFixed(2),
        schlupf: wegLeib > 0 ? +(wegFuss / wegLeib).toFixed(3) : null,
        drift,
    };
};

// DER SPIELER-LEIB (K07, dieselbe Linse): der Mensch geht durch seinen ECHTEN Chokepoint (animatePlayerSoul — Gang-Tick,
// Pose, Fuß-IK, Schritt-Klang), erst 3 s Gehen (1,15 m/s, das Tempo von W im Modus pfad), dann 3 s Laufen (5,16 m/s,
// Shift); der Leib zieht je Takt um v·dt längs seiner Gier, der Boden ist eben (der Träger des Kapsel-Schritts). Gemessen
// wird derselbe Aufsetz-Punkt wie bei den Tieren (der Boden-Punkt unter dem Knöchel in der Ruhe-Pose, im Gelenk-Raum
// mitgeführt), dieselbe Stand-Schwelle (5 % der Beinlänge) und derselbe Schlupf; dazu die Kadenz (Halbzyklen der
// Gang-Phase je Sekunde, Soll ≥ 1,5 beim Gehen) und die Schritt-Töne (state._schrittKlang.schritte) gegen 2·v·t/Λ, Λ der
// Doppelschritt des Chokepoints (jeder Schritt klingt).
const LEIB = (k) => {
    const r = window.anazhRealm,
        s = r.state,
        A = r.constructor;
    const T = window.THREE;
    const core = window.__tetrapodaCore;
    const p = s.player;
    if (!s.playerMesh.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
    const mesh = s.playerMesh;
    const rig = mesh.userData.rig;
    if (!rig) return { fehler: "Spieler ohne Rig" };
    if (k.stub) {
        window.__gangEcht = core.gangSchritt;
        // der Vor-Wellen-Gang des Menschen: 3,4 m je Schritt, der Sinus-Schwung (±0,5 rad ≈ 0,86 m Fußweg)
        core.gangSchritt = (v) =>
            v > 0.05
                ? { omega: (Math.PI * v) / 3.4, S: 0.86, schritt: 6.8, tast: 0.5 }
                : { omega: 0, S: 0, schritt: 0, tast: 0.5 };
    }
    const gespeichert = {
        vel: s.playerVel,
        uw: s.playerUnderwater,
        arch: p.mountedArch,
        luft: s.isInAir,
        tr: s._kapselTraegerY,
        st: s._kapselStruktur,
    };
    const pos0 = mesh.position.clone(),
        rot0 = mesh.rotation.y;
    s.playerUnderwater = false;
    p.mountedArch = null;
    s.isInAir = false;
    let vx = 0;
    s.playerVel = { x: () => vx, z: () => 0, y: () => 0 };
    // ein ebener Ort fern jedes gebauten Chunks: der Stand-Leser trägt dort den Träger
    mesh.position.set(pos0.x + 4000, 50, pos0.z + 4000);
    mesh.rotation.y = Math.PI / 2; // Blick +x
    const sohle = () => mesh.position.y - A.PLAYER_FOOT_OFFSET;
    s._kapselTraegerY = sohle();
    s._kapselStruktur = false;
    let t = 1000;
    const dt = 1 / 60;
    p.animationLastTick = -Infinity;
    for (let i = 0; i < 90; i++) r.animatePlayerSoul((t += dt)); // Ruhe einschwingen
    mesh.updateMatrixWorld(true);
    const knoechel = [rig.legL.ankle, rig.legR.ankle];
    const lokal = knoechel.map((a) => {
        const w = new T.Vector3().setFromMatrixPosition(a.matrixWorld);
        w.y = sohle();
        return a.worldToLocal(w.clone());
    });
    // DER KONTAKT DES FUSSES (K07, das Abrollen): Ferse (die Sohle unter dem Knöchel) und Ballen (ballen × R davor, im
    // Gelenk-Maß des Knöchels) — der tiefere Punkt trägt. Rollt der Fuß über den Ballen, steht der Ballen; der Schlupf
    // misst ihn, nie die steigende Ferse. Ohne Abrollen in der Zeile liegt der Ballen auf der Ferse (die Messung von vorher).
    const zeileB = typeof r._gangZeile === "function" ? r._gangZeile(true) : null;
    const massB = typeof r._gaitBeinMass === "function" ? r._gaitBeinMass(rig) : null;
    const ballenL =
        zeileB && zeileB.ballen > 0 && massB && core.gangReich
            ? zeileB.ballen * core.gangReich(massB.l1 + massB.l2)
            : 0;
    const lokalB = lokal.map((v) => v.clone().add(new T.Vector3(0, 0, ballenL)));
    const beinM =
        typeof r._gaitBeinMass === "function"
            ? r._gaitBeinMass(rig).L
            : (rig.legL.knee.position.length() + rig.legL.ankle.position.length()) *
              (rig.legL.hip.getWorldScale(new T.Vector3()).y || 1);
    // die LOCK-LÖSER: je Takt und Bein, das im Stand-Fenster des Gesetzes geht (w ≥ 0,35) — trug es den Lock und
    // trägt es ihn danach nicht mehr, hat die Fuß-IK den stehenden Fuß gelöst
    const zaehl = { stand: 0, loeser: 0, wo: [], takt: 0 };
    const ikAlt = r._gaitLegIK;
    r._gaitLegIK = function (leg, ik, probe, lock, foot, imStand, w) {
        const vor = lock && lock.on;
        const out = ikAlt.apply(this, arguments);
        if (imStand && w >= 0.35) {
            zaehl.stand++;
            if (vor && !lock.on) {
                zaehl.loeser++;
                zaehl.wo.push(
                    +(window.anazhRealm.state.player.walkPhase % (2 * Math.PI)).toFixed(2) + "@" + zaehl.takt
                );
            }
        }
        return out;
    };
    const hw = new T.Vector3();
    const huefte = () => (rig.hips.getWorldPosition(hw), hw.y - sohle());
    const ruheH = huefte();
    const zeilen = [];
    for (const [name, v] of [
        ["gehen (W)", 1.15],
        ["laufen (Shift)", 5.16],
        ["Spitze", 6.75],
    ]) {
        zaehl.stand = zaehl.loeser = 0;
        zaehl.wo = [];
        // das Becken im eingeschwungenen Gang (ab Takt 60: der Anlauf-Schritt aus dem Stand liegt davor)
        let hMin = Infinity,
            hMax = -Infinity;
        vx = v;
        const N = 180;
        const spur = [[], []],
            leib = [];
        let ton0 = null,
            ph0 = null;
        for (let i = 0; i < N; i++) {
            mesh.position.x += v * dt;
            zaehl.takt = i;
            r.animatePlayerSoul((t += dt));
            mesh.updateMatrixWorld(true);
            if (i === 30) {
                ton0 = s._schrittKlang ? s._schrittKlang.schritte : 0;
                ph0 = p.walkPhase;
            }
            leib.push(mesh.position.x);
            knoechel.forEach((a, j) =>
                spur[j].push([a.localToWorld(lokal[j].clone()), a.localToWorld(lokalB[j].clone())])
            );
            if (i >= 60) {
                const h = huefte();
                hMin = Math.min(hMin, h);
                hMax = Math.max(hMax, h);
            }
        }
        const sek = (N - 1 - 30) * dt;
        const toene = (s._schrittKlang ? s._schrittKlang.schritte : 0) - ton0;
        const kadenz = (p.walkPhase - ph0) / Math.PI / sek;
        // Λ = der Doppelschritt, den der Chokepoint dem Leib gibt (vor K07: 2 × _gaitSchrittLen)
        const lam = typeof r._gaitGesetz === "function" ? r._gaitGesetz(rig, v).schritt : 2 * r._gaitSchrittLen(rig);
        const soll = (2 * v * sek) / lam;
        let wegFuss = 0,
            wegLeib = 0,
            standTakte = 0;
        for (let j = 0; j < 2; j++) {
            let ymin = Infinity;
            for (let i = 30; i < N; i++) ymin = Math.min(ymin, spur[j][i][0].y, spur[j][i][1].y);
            for (let i = 31; i < N; i++) {
                const k = spur[j][i][1].y < spur[j][i][0].y - 1e-4 ? 1 : 0;
                const a = spur[j][i - 1][k],
                    b = spur[j][i][k];
                if (a.y > ymin + 0.05 * beinM || b.y > ymin + 0.05 * beinM) continue;
                standTakte++;
                wegFuss += Math.hypot(b.x - a.x, b.z - a.z);
                wegLeib += Math.abs(leib[i] - leib[i - 1]);
            }
        }
        zeilen.push({
            name,
            v,
            beinM: +beinM.toFixed(3),
            standAnteil: +(standTakte / (2 * (N - 31))).toFixed(2),
            schlupf: wegLeib > 0 ? +(wegFuss / wegLeib).toFixed(3) : null,
            kadenz: +kadenz.toFixed(2),
            schrittM: kadenz > 0 ? +(v / kadenz).toFixed(2) : null,
            toene,
            soll: +soll.toFixed(1),
            beckenHub: +((hMax - hMin) / beinM).toFixed(3),
            beckenTief: +((ruheH - hMin) / beinM).toFixed(3),
            standTakte: zaehl.stand,
            loeser: zaehl.loeser,
            loeserWo: zaehl.wo.join(" "),
        });
    }
    r._gaitLegIK = ikAlt;
    if (k.stub) core.gangSchritt = window.__gangEcht;
    s.playerVel = gespeichert.vel;
    s.playerUnderwater = gespeichert.uw;
    p.mountedArch = gespeichert.arch;
    s.isInAir = gespeichert.luft;
    s._kapselTraegerY = gespeichert.tr;
    s._kapselStruktur = gespeichert.st;
    mesh.position.copy(pos0);
    mesh.rotation.y = rot0;
    const taeter =
        typeof r._gaitGesetz === "function" ? "_gaitGesetz (fx.bewegung.gang)" : "_gaitSchrittLen (schritt.kalib)";
    // der flache Fuß (K07): ohne das Abrollen über den Ballen (tetrapoda gangRolle, fx.bewegung.gang rollWinkel) sinkt das
    // Becken im Doppel-Stand so tief, wie ein flacher Fuß hinten und vorn die Kette verlangt — das Knie knickt ein
    const gangZ = r._gangZeile ? r._gangZeile(true) : null;
    const beckenTaeter =
        typeof core.gangBecken !== "function"
            ? "_animateHumanoidRig (Becken-Senke über beide Füße, der Schwung-Fuß zieht mit)"
            : gangZ && gangZ.rollWinkel > 0
              ? "tetrapoda gangBecken (das Becken des Gesetzes)"
              : "tetrapoda gangFuss/gangBecken (der flache Fuß, kein Abrollen über den Ballen: gangRolle)";
    const loeserTaeter = "_gaitLegIK (die Reichweiten-Wand löst den stehenden Fuß)";
    return { zeilen, taeter, beckenTaeter, loeserTaeter };
};

// DIE SCHWERE DES GANGS (K07, dieselbe Linse): Schritt und Becken lesen die Schwere der Welt (state.gravity, die DSL setzt
// sie) aus EINER Zeile, Mensch und Tier. Unter der Mond-Schwere (1,62 m/s²) gleicht der Takt des Menschen beim Laufen und
// der des Wolfs im Schritt gangSchritt mit dieser Schwere, das Becken des Menschen bekommt dieselbe Zeile (der Spion am
// Kern liest ihre Schwere), und kein Zwilling steht als Literal im Wirt (die Schwere als Zahl im Rig, ein Trab-Muster neben
// MOTION.phases im Tier-Gang). --selftest: die Zeile ohne die Schwere der Welt (der Vor-K07-Gang) → ROT.
const SCHWERE = (k) => {
    const r = window.anazhRealm,
        s = r.state,
        A = r.constructor;
    const core = window.__tetrapodaCore;
    const G_MOND = 1.62;
    const rig = s.playerMesh.userData.rig;
    if (!rig) return { fehler: "Spieler ohne Rig" };
    const block = A._bewegungsBlock("gang", A.GANG_FELDER);
    const zeileEcht = r._gangZeile;
    if (k.stub) r._gangZeile = (mensch) => (mensch ? block : undefined);
    const beckenEcht = core.gangBecken;
    const beckenG = [];
    core.gangBecken = function (...a) {
        const Z = a.find((x) => x && typeof x === "object");
        beckenG.push(Z && typeof Z.g === "number" ? Z.g : null);
        return beckenEcht.apply(this, a);
    };
    const g0 = s.gravity;
    const o = {};
    try {
        s.gravity = -G_MOND;
        const L = r._gaitBeinMass(rig).L;
        const gait = r._gaitGesetz(rig, 5.16);
        o.mensch = gait.omega / core.gangSchritt(5.16, L, Object.assign({}, block, { g: G_MOND })).omega;
        r._animateHumanoidRig(rig, 1000, 1, true, false, null, gait);
        o.becken = beckenG.length ? beckenG[beckenG.length - 1] : "nie gerufen";
        // der Wolf im Schritt (0,5 m/s — schneller deckelt der Bein-Winkel den Schritt bei jeder Schwere) durch seinen Chokepoint
        const pm = s.playerMesh.position;
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 4);
        const cr = r.spawnCreatureAt(pm.x + 40, 30, pm.z + 40, "happy", "wesen", { precise: true, bodySize: 1 });
        s.maxCreatures = saveMax;
        if (!cr || !cr.userData._tierBaum) o.tier = "kein Wolf";
        else {
            cr.userData.task = { name: "wait", args: {}, since: 0 };
            cr.rotation.set(0, Math.PI / 2, 0);
            cr.userData._animFade = 1;
            const roles = r._motionRolesForSoul(cr.userData.soul);
            for (let i = 0, t = 0; i < 90; i++) {
                cr.position.x += 0.5 / 60;
                r._animateCompoundMotion(cr, roles, (t += 1 / 60), 0, true, null);
            }
            const gg = cr.userData._tierBaum._gang;
            const soll = core.gangSchritt(gg.v, cr.userData._tierBaum.beinL * (cr.scale.x || 1), { g: G_MOND }).omega;
            o.tier = soll > 0 ? gg.omega / soll : "kein Takt";
            r.removeCreature(cr);
        }
    } finally {
        s.gravity = g0;
        core.gangBecken = beckenEcht;
        r._gangZeile = zeileEcht;
    }
    // die Zwillinge als Literal (kommentar-gestrippt, das __codeOf-Muster)
    const codeOf = (fn) =>
        String(fn)
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");
    o.zwillinge = [];
    if (/\b9\.81\b/.test(codeOf(r._animateHumanoidRig)) || /\b9\.81\b/.test(codeOf(r._gaitGesetz)))
        o.zwillinge.push("_animateHumanoidRig/_gaitGesetz: die Schwere als Zahl 9,81");
    if (/\[\s*0\s*,\s*Math\.PI\s*\*/.test(codeOf(r._animateTierBaum)))
        o.zwillinge.push("_animateTierBaum: ein Trab-Muster als Literal neben MOTION.phases");
    return o;
};

// DAS KÖRPER-STUDIO (K07): derselbe Mensch im Labor (worlds/koerperstudio, Spiel-Modus) — die Taste geht, playInput
// und playPhysics ziehen den Leib mit festem Takt 1/60 s über ebenen Boden (die Park-Boxen ruhen), je Takt das Fuß-
// gelenk beider Beine in der Welt. Derselbe Schlupf (Weg des Stand-Fußes / Weg des Leibs, Stand = unterste 5 % der
// Beinlänge), dazu die Kadenz aus der Phase. Vorher ging das Labor nach einem eigenen Modell (cad = sp·0,155).
const STUDIO = (k) => {
    /* eslint-disable no-undef */
    const core = window.__tetrapodaCore;
    if (k.stub && core) {
        window.__gangEcht = core.gangSchritt;
        core.gangSchritt = () => ({ omega: 3.2, S: 0.06, schritt: 0.12, tast: 0.5, hub: 0.1 });
    }
    if (!play.on) enterPlay();
    const boxen = parkBoxes.splice(0, parkBoxes.length);
    // ein ebener Boden ohne Hindernis (der Boden des Labors ist selbst eine Park-Box)
    parkBoxes.push({ cx: 0, cy: -0.45, cz: 0, sx: 4000, sy: 1, sz: 4000, maxY: 0.05, minY: -0.95, wall: false });
    const dt = 1 / 60,
        N = 300,
        EIN = 90;
    for (const c of Object.keys(keys)) delete keys[c];
    Object.assign(keys, k.tasten);
    play.yaw = 0;
    play.vx = play.vz = play.vy = 0;
    play.posY = play.smY = 0.05;
    play.onGround = true;
    play.slide = 0;
    // BÜHNE: die Gang-Bühne der Probe (eigene Ebene, kein Weltboden)
    character.position.set(0, 0.05, 0);
    const cs = character.scale.x || 1;
    const bein = (L1 + L2) * cs;
    const T = window.THREE;
    const w = new T.Vector3();
    const spur = [[], []],
        leib = [];
    let phase = 0,
        phPrev = play.gaitPhase;
    for (let i = 0; i < N; i++) {
        playInput(dt);
        playPhysics(dt);
        character.updateMatrixWorld(true);
        ["ankle1", "ankle-1"].forEach((n, j) => {
            // Ferse und Ballen (K07, wie in der Welt): die Sohle footBelowAnkle unter dem Knöchel, der Ballen ballen × R davor
            const ballenE = _GZ && _GZ.ballen > 0 && core && core.gangReich ? _GZ.ballen * core.gangReich(L1 + L2) : 0;
            const f = parts[n].localToWorld(w.set(0, -footBelowAnkle, 0)).clone();
            const b = parts[n].localToWorld(w.set(0, -footBelowAnkle, ballenE)).clone();
            spur[j].push([f, b]);
        });
        leib.push({ x: character.position.x, z: character.position.z, y: character.position.y });
        if (i >= EIN) phase += (play.gaitPhase - phPrev + 1) % 1;
        phPrev = play.gaitPhase;
    }
    for (const c of Object.keys(keys)) delete keys[c];
    parkBoxes.splice(0, parkBoxes.length, ...boxen);
    if (k.stub && core) core.gangSchritt = window.__gangEcht;
    let wegFuss = 0,
        wegLeib = 0,
        standTakte = 0;
    for (let j = 0; j < 2; j++) {
        let ymin = Infinity;
        for (let i = EIN; i < N; i++) ymin = Math.min(ymin, spur[j][i][0].y, spur[j][i][1].y);
        for (let i = EIN + 1; i < N; i++) {
            const k = spur[j][i][1].y < spur[j][i][0].y - 1e-4 ? 1 : 0;
            const a = spur[j][i - 1][k],
                b = spur[j][i][k];
            if (a.y > ymin + 0.05 * bein || b.y > ymin + 0.05 * bein) continue;
            standTakte++;
            wegFuss += Math.hypot(b.x - a.x, b.z - a.z);
            wegLeib += Math.hypot(leib[i].x - leib[i - 1].x, leib[i].z - leib[i - 1].z);
        }
    }
    let yMin = Infinity,
        yMax = -Infinity;
    for (let i = EIN; i < N; i++) {
        yMin = Math.min(yMin, leib[i].y);
        yMax = Math.max(yMax, leib[i].y);
    }
    const zeit = (N - EIN) * dt;
    const v = Math.hypot(leib[N - 1].x - leib[EIN].x, leib[N - 1].z - leib[EIN].z) / zeit;
    return {
        name: k.name,
        v: +v.toFixed(2),
        beinE: +bein.toFixed(3),
        standAnteil: +(standTakte / (2 * (N - EIN - 1))).toFixed(2),
        schlupf: wegLeib > 0 ? +(wegFuss / wegLeib).toFixed(3) : null,
        kadenz: +((2 * phase) / zeit).toFixed(2),
        beckenHub: +((yMax - yMin) / bein).toFixed(3),
        taeter:
            typeof gangGesetz === "function"
                ? "gangGesetz (tetrapoda gangSchritt/gangFuss)"
                : "playGait (cad = sp·0,155, eigenes Modell)",
    };
    /* eslint-enable no-undef */
};

(async () => {
    await new Promise((res) => server.listen(PORT, res));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let rot = 0;
    let schwereRot = false;
    try {
        if (!NUR_STUDIO) {
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
            await page.waitForFunction(
                () => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function",
                {
                    timeout: 120000,
                }
            );
            await page.waitForFunction(
                () => window.__tetrapodaCore && typeof window.__tetrapodaCore.gangSchritt === "function",
                {
                    timeout: 60000,
                }
            );
            const zeilen = [];
            for (const seele of ["wolf", "fuchs", "baer", "wesen"]) {
                for (const v of [0.8, 1.6, 3.0]) zeilen.push(await page.evaluate(LAUF, { seele, v, stub: SELBST }));
                // unter Last: 30 fps, die Raten-Leiter 1/4
                for (const v of [1.6, 3.0])
                    zeilen.push(await page.evaluate(LAUF, { seele, v, stub: SELBST, fps: 30, last: true }));
            }
            for (const z of zeilen) {
                if (z.fehler) {
                    console.log("  ❌", z.fehler);
                    rot++;
                    continue;
                }
                const ok = z.schlupf !== null && z.schlupf <= SCHWELLE;
                console.log(
                    `  ${ok ? "✅" : "❌"} ${z.seele.padEnd(5)} ${z.v.toFixed(1)} m/s${z.last ? " (" + z.last + ")" : ""} · Hüfte ${z.hueftM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf} · Drift je Pfote ${z.drift.join(" ")}`
                );
                if (!ok) rot++;
            }
            const leib = await page.evaluate(LEIB, { stub: SELBST });
            if (leib.fehler) {
                console.log("  ❌ Spieler-Leib:", leib.fehler);
                rot++;
            } else {
                for (const z of leib.zeilen) {
                    const gleit = z.schlupf !== null && z.schlupf <= SCHWELLE;
                    const kad = z.v > 2 || z.kadenz >= KADENZ_GEHEN;
                    const spitze = z.name === "Spitze";
                    const ton = spitze || (z.soll > 0 && Math.abs(z.toene - z.soll) <= TON_TOLERANZ * z.soll);
                    const B = z.v > 2 ? BECKEN.laufen : BECKEN.gehen;
                    const becken = z.beckenHub <= B.hub && z.beckenTief <= B.tief;
                    const lock = z.standTakte > 0 && z.loeser === 0;
                    const ok = gleit && kad && ton && becken && lock;
                    const taeter = [
                        !(gleit && kad && ton) ? leib.taeter : null,
                        becken ? null : leib.beckenTaeter,
                        lock ? null : leib.loeserTaeter,
                    ].filter(Boolean);
                    console.log(
                        `  ${ok ? "✅" : "❌"} mensch ${z.name} ${z.v.toFixed(2)} m/s · Bein ${z.beinM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf}${gleit ? "" : " (> " + SCHWELLE + ")"} · Kadenz ${z.kadenz} Schritte/s (${z.schrittM} m je Schritt)${kad ? "" : " < " + KADENZ_GEHEN} · Töne ${z.toene} / Soll ${z.soll}${ton ? "" : " (± 15 % verfehlt)"} · Becken Hub ${z.beckenHub} L / Tiefe ${z.beckenTief} L${becken ? "" : " (Soll ≤ " + B.hub + " / " + B.tief + ")"} · Lock-Löser ${z.loeser}${z.loeser ? " (Phase@Takt " + z.loeserWo + ")" : ""} in ${z.standTakte} Stand-Takten${ok ? "" : " — Täter: " + taeter.join(" · ")}`
                    );
                    if (!ok) rot++;
                }
            }
            const sw = await page.evaluate(SCHWERE, { stub: SELBST });
            if (sw.fehler) {
                console.log("  ❌ Schwere:", sw.fehler);
                rot++;
                schwereRot = true;
            } else {
                const gleich = (q) => typeof q === "number" && Math.abs(q - 1) <= 1e-6;
                const taeter = [
                    gleich(sw.mensch)
                        ? null
                        : "_gaitGesetz (der Schritt des Menschen liest nicht die Schwere der Welt)",
                    sw.becken === 1.62
                        ? null
                        : "_animateHumanoidRig (das Becken bekommt nicht die Zeile mit der Schwere der Welt)",
                    gleich(sw.tier)
                        ? null
                        : "_animateTierBaum (der Schritt des Tiers liest nicht die Schwere der Welt)",
                    ...sw.zwillinge,
                ].filter(Boolean);
                const fmt = (q) => (typeof q === "number" ? q.toFixed(4) : q);
                console.log(
                    `  ${taeter.length ? "❌" : "✅"} Schwere 1,62 m/s² · Takt Mensch ${fmt(sw.mensch)} × Gesetz · Becken-Zeile g ${sw.becken} · Takt Wolf ${fmt(sw.tier)} × Gesetz · Literal-Zwillinge ${sw.zwillinge.length}${taeter.length ? " — Täter: " + taeter.join(" · ") : ""}`
                );
                if (taeter.length) {
                    rot++;
                    schwereRot = true;
                }
            }
        }
        // das Labor braucht WebGL (r128): ein eigener Browser mit dem Software-Holz
        const sb = await starteBrowser({ art: "linse", frist: 300000 });
        try {
            const sp = await sb.newPage();
            sp.setDefaultTimeout(280000);
            sp.on("pageerror", (e) => console.log("[STUDIO-PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
            await sp.goto(`http://127.0.0.1:${PORT}/worlds/koerperstudio/index.html`, {
                waitUntil: "domcontentloaded",
                timeout: 240000,
            });
            // eslint-disable-next-line no-undef
            await sp.waitForFunction(
                () =>
                    typeof enterPlay === "function" &&
                    typeof playPhysics === "function" &&
                    typeof parkBoxes !== "undefined",
                {
                    timeout: 90000,
                }
            );
            for (const [name, tasten] of [
                ["geduckt", { KeyW: true, ControlLeft: true }],
                ["gehen", { KeyW: true }],
                ["sprint", { KeyW: true, ShiftLeft: true }],
            ]) {
                const z = await sp.evaluate(STUDIO, { name, tasten, stub: SELBST });
                // dasselbe Becken-Soll wie in der Welt (geduckt geht, gehen und Sprint laufen im Labor)
                const B = name === "geduckt" ? BECKEN.gehen : BECKEN.laufen;
                const ok = z.schlupf !== null && z.schlupf <= SCHWELLE && z.beckenHub <= B.hub;
                console.log(
                    `  ${ok ? "✅" : "❌"} studio ${z.name} ${z.v} E/s · Bein ${z.beinE} E · Stand ${z.standAnteil} · Schlupf ${z.schlupf} · Kadenz ${z.kadenz} Schritte/s · Becken Hub ${z.beckenHub} L (Soll ≤ ${B.hub}) · Täter ${z.taeter}`
                );
                if (!ok) rot++;
            }
        } finally {
            await sb.close();
        }
    } finally {
        await browser.close();
        server.close();
    }
    if (SELBST) {
        if (rot === 0) {
            console.error("\n❌ SELBST-TEST ROT — mit gestubbtem Gang-Gesetz glitt keine Pfote: die Linse ist vakuös.");
            process.exit(1);
        }
        if (!schwereRot && !NUR_STUDIO) {
            console.error(
                "\n❌ SELBST-TEST ROT — die Zeile ohne die Schwere der Welt blieb grün: die Schwere-Wand ist vakuös."
            );
            process.exit(1);
        }
        console.log(`\n✅ SELBST-TEST GRÜN — der Vor-Welle-Gang gleitet (${rot} Läufe über ${SCHWELLE}).`);
        process.exit(0);
    }
    if (rot) {
        console.error(
            `\n❌ ROT — ${rot} Läufe verletzt (Schlupf > ${SCHWELLE}, Kadenz, Töne, Becken oder Lock-Löser).`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — jede Gattung setzt ihre Pfoten (Schlupf ≤ ${SCHWELLE}) bei Schritt, Trab und schnellem Trab; der Mensch geht und läuft nach demselben Gesetz (Kadenz ≥ ${KADENZ_GEHEN}, Töne ± 15 %), in der Welt und im Körper-Studio.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("GLEIT-LINSE-FEHLER:", e);
    process.exit(1);
});
