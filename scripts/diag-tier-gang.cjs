#!/usr/bin/env node
// diag-tier-gang.cjs — DIE GLEIT-LINSE DER TIERE (Welle 5, „Gang ohne Gleiten"; npm run gate:tier-gang).
// Am ECHTEN Chokepoint (_animateCompoundMotion → _animateTierBaum, headless Null-Renderer, Produktions-Boot): jede
// Gattung läuft geradeaus mit fester Geschwindigkeit (0,8 · 1,6 · 3,0 m/s), je Takt wird der Aufsetz-Punkt jeder Pfote
// (der Boden-Punkt unter der Handwurzel in der Ruhe-Pose, im Gelenk-Raum der Pfote mitgeführt) gemessen. Im STAND
// (der Punkt liegt in den untersten 2,5 % der Beinlänge) darf er nicht mit dem Leib wandern: der SCHLUPF = Weg des
// Stand-Fußes / Weg des Leibs in denselben Takten. Soll ≤ 0,2 (eine Pfote, die mit dem Leib gleitet, hat 1).
//   --selftest: das Gang-Gesetz gestubbt (fester Takt, feste Auslenkung — der Vor-Welle-Gang) → der Schlupf steigt
//   über die Schwelle, die Linse feuert.
//   node scripts/diag-tier-gang.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4449;
const SELBST = process.argv.includes("--selftest");
const SCHWELLE = 0.2;
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
    const dt = 1 / 60,
        N = 360;
    let t = 0,
        phase = 0;
    const spur = pfoten.map(() => []);
    const leib = [];
    cr.userData._animFade = 1;
    for (let i = 0; i < N; i++) {
        cr.position.x += k.v * dt;
        t += dt;
        phase += dt * 5.0;
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
        hueftM: +hueft.toFixed(3),
        standAnteil: +(standTakte / (4 * (N - 61))).toFixed(2),
        schlupf: wegLeib > 0 ? +(wegFuss / wegLeib).toFixed(3) : null,
        drift,
    };
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
        for (const seele of ["wolf", "fuchs", "baer", "wesen"])
            for (const v of [0.8, 1.6, 3.0]) zeilen.push(await page.evaluate(LAUF, { seele, v, stub: SELBST }));
        for (const z of zeilen) {
            if (z.fehler) {
                console.log("  ❌", z.fehler);
                rot++;
                continue;
            }
            const ok = z.schlupf !== null && z.schlupf <= SCHWELLE;
            console.log(
                `  ${ok ? "✅" : "❌"} ${z.seele.padEnd(5)} ${z.v.toFixed(1)} m/s · Hüfte ${z.hueftM} m · Stand ${z.standAnteil} · Schlupf ${z.schlupf} · Drift je Pfote ${z.drift.join(" ")}`
            );
            if (!ok) rot++;
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
    console.log(`\n✅ GRÜN — jede Gattung setzt ihre Pfoten (Schlupf ≤ ${SCHWELLE}) bei Schritt, Trab und schnellem Trab.`);
    process.exit(0);
})().catch((e) => {
    console.error("GLEIT-LINSE-FEHLER:", e);
    process.exit(1);
});
