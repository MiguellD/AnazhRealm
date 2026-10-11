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
//   DER SPIELER-LEIB (K07): derselbe Aufsetz-Punkt, dieselbe Schwelle am Menschen (LEIB, unten), dazu Kadenz und Töne.
//   --selftest: das Gang-Gesetz gestubbt (fester Takt, feste Auslenkung — der Vor-Welle-Gang) → der Schlupf steigt
//   über die Schwelle, die Linse feuert.
//   node scripts/diag-tier-gang.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.TIER_GANG_PORT) || 4449;
const SELBST = process.argv.includes("--selftest");
// die Ratsche (K07): 0,2 → 0,05 — der Fuß im Stand steht (Gleiten < 5 %), Tier und Mensch an EINER Schwelle
const SCHWELLE = 0.05;
const KADENZ_GEHEN = 1.5; // Schritte/s bei 1,15 m/s (physio-pedia, Weidmann 1993)
const TON_TOLERANZ = 0.15; // Töne = 2·v·t/Λ ± 15 %
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
        core.gangSchritt = (v) => (v > 0.05 ? { omega: (Math.PI * v) / 3.4, S: 0.86, schritt: 6.8, tast: 0.5 } : { omega: 0, S: 0, schritt: 0, tast: 0.5 });
    }
    const gespeichert = { vel: s.playerVel, uw: s.playerUnderwater, arch: p.mountedArch, luft: s.isInAir, tr: s._kapselTraegerY, st: s._kapselStruktur };
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
    const beinM = typeof r._gaitBeinMass === "function" ? r._gaitBeinMass(rig).L : (rig.legL.knee.position.length() + rig.legL.ankle.position.length()) * (rig.legL.hip.getWorldScale(new T.Vector3()).y || 1);
    const zeilen = [];
    for (const [name, v] of [
        ["gehen (W)", 1.15],
        ["laufen (Shift)", 5.16],
    ]) {
        vx = v;
        const N = 180;
        const spur = [[], []],
            leib = [];
        const kl = s._schrittKlang;
        let ton0 = null,
            ph0 = null;
        for (let i = 0; i < N; i++) {
            mesh.position.x += v * dt;
            r.animatePlayerSoul((t += dt));
            mesh.updateMatrixWorld(true);
            if (i === 30) {
                ton0 = s._schrittKlang ? s._schrittKlang.schritte : 0;
                ph0 = p.walkPhase;
            }
            leib.push(mesh.position.x);
            knoechel.forEach((a, j) => spur[j].push(a.localToWorld(lokal[j].clone())));
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
            for (let i = 30; i < N; i++) ymin = Math.min(ymin, spur[j][i].y);
            for (let i = 31; i < N; i++) {
                const a = spur[j][i - 1],
                    b = spur[j][i];
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
        });
    }
    if (k.stub) core.gangSchritt = window.__gangEcht;
    s.playerVel = gespeichert.vel;
    s.playerUnderwater = gespeichert.uw;
    p.mountedArch = gespeichert.arch;
    s.isInAir = gespeichert.luft;
    s._kapselTraegerY = gespeichert.tr;
    s._kapselStruktur = gespeichert.st;
    mesh.position.copy(pos0);
    mesh.rotation.y = rot0;
    const taeter = typeof r._gaitGesetz === "function" ? "_gaitGesetz (fx.bewegung.gang)" : "_gaitSchrittLen (schritt.kalib)";
    return { zeilen, taeter };
};

(async () => {
    await new Promise((res) => server.listen(PORT, res));
    const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 300000, args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let rot = 0;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.waitForFunction(() => window.__tetrapodaCore && typeof window.__tetrapodaCore.gangSchritt === "function", {
            timeout: 60000,
        });
        const zeilen = [];
        for (const seele of ["wolf", "fuchs", "baer", "wesen"]) {
            for (const v of [0.8, 1.6, 3.0]) zeilen.push(await page.evaluate(LAUF, { seele, v, stub: SELBST }));
            // unter Last: 30 fps, die Raten-Leiter 1/4
            for (const v of [1.6, 3.0]) zeilen.push(await page.evaluate(LAUF, { seele, v, stub: SELBST, fps: 30, last: true }));
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
                const ton = z.soll > 0 && Math.abs(z.toene - z.soll) <= TON_TOLERANZ * z.soll;
                const ok = gleit && kad && ton;
                console.log(
                    `  ${ok ? "✅" : "❌"} mensch ${z.name} ${z.v.toFixed(2)} m/s · Bein ${z.beinM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf}${gleit ? "" : " (> " + SCHWELLE + ")"} · Kadenz ${z.kadenz} Schritte/s (${z.schrittM} m je Schritt)${kad ? "" : " < " + KADENZ_GEHEN} · Töne ${z.toene} / Soll ${z.soll}${ton ? "" : " (± 15 % verfehlt)"}${ok ? "" : " — Täter: " + leib.taeter}`
                );
                if (!ok) rot++;
            }
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
        console.log(`\n✅ SELBST-TEST GRÜN — der Vor-Welle-Gang gleitet (${rot} Läufe über ${SCHWELLE}).`);
        process.exit(0);
    }
    if (rot) {
        console.error(`\n❌ ROT — ${rot} Läufe gleiten (Schlupf > ${SCHWELLE}).`);
        process.exit(1);
    }
    console.log(`\n✅ GRÜN — jede Gattung setzt ihre Pfoten (Schlupf ≤ ${SCHWELLE}) bei Schritt, Trab und schnellem Trab; der Mensch geht und läuft nach demselben Gesetz (Kadenz ≥ ${KADENZ_GEHEN}, Töne ± 15 %).`);
    process.exit(0);
})().catch((e) => {
    console.error("GLEIT-LINSE-FEHLER:", e);
    process.exit(1);
});
