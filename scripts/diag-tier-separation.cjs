#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-tier-separation.cjs — DIE TIERE ENTSTAPELN + DIFFERENZIEREN SICH
// (npm run gate:tier-separation; V18.472, Schöpfer 14.07.: „tiere staken
// sich aktuell, obwohl wir emotionen, unterschiedliches verhalten und
// charaktere sein sollten").
//
// Die Linse hält beide Hälften der Welle am ECHTEN Chokepoint (updateCreatures
// — der EINE Tick, der die Wander-/Jagd-Richtung setzt), headless/Null-Renderer:
//
//  (A) SEPARATION: zwei identische Wesen (gleiche Soul, gleiche bodySize,
//      geklonter netId → IDENTISCHER deterministischer Wander-Strom) auf
//      DENSELBEN Punkt gesetzt sind nach N Ticks > Körperradius getrennt —
//      NUR die Separations-Kraft kann sie trennen (der Wander-Strom ist
//      per Konstruktion deckungsgleich).
//  (B) CHARAKTER: verschiedene Stats → messbar verschiedene Bewegung.
//      (B1) die Größen-/Stat-Achse: kleines vs. gigantisches Wesen derselben
//           Soul → verschiedene speedMul (computeCreatureStats.speed KONSUMIERT,
//           nicht erfunden) → messbar verschiedene Weg-Länge über N Ticks.
//      (B2) die Radius-Achsen (Leine = fleeMul-Mut × bodySize-Größe; die Tiere
//           sind bewusst tag-identisch, Lehre 8 → die behaviorale Differenz
//           läuft über die GRÖSSEN-Achse): das Kitz (wesen 0.6, Leine ~16.8 m),
//           45 m vom Anker ausgesetzt, kehrt in die Leine ZURÜCK; der Gigant
//           (wesen 2.4, Leine ~67 m) bleibt frei draußen — verschiedene
//           Bewegungs-Radien um den Anker. Die Mut-Achse wird als Konsum-Wert
//           mitgemessen (Wolf-Basis-Leine < Hirsch).
//  (C) SELBST-TEST: mit künstlich genullter Separation (_applyCreatureSeparation
//      gestubbt, danach restauriert — die Gate-Hook-Lehre) bleibt das A-Paar
//      GESTAPELT (< 0.2 m) — die Linse feuert, sie ist nicht blind.
//
// Determinismus-Disziplin: alle Proben laufen 80–150 m vom Spieler — jenseits
// des Obstacle-Raycasts (70 m, einzige Math.random-Quelle des freien Pfads),
// jenseits noticeRadius (22 m, Wariness 0 → NEUTRAL-Zweig) und innerhalb
// Band 0/1 (aiDiv 1 → Richtungs-Recompute JEDEN Frame, kein Stagger-Drift).
//   node scripts/diag-tier-separation.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4433;
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

        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            const pm = s.playerMesh && s.playerMesh.position;
            if (!pm) return { error: "kein Spieler" };
            if (typeof r._applyCreatureSeparation !== "function") return { error: "_applyCreatureSeparation fehlt" };
            if (typeof r._creatureCharacterWander !== "function") return { error: "_creatureCharacterWander fehlt" };

            // Test-Spot: 80–150 m vom Spieler, über Wasser (Determinismus-Fenster, s. Kopf).
            const findSpot = (dist, ang) => {
                for (let i = 0; i < 200; i++) {
                    const d = dist + (i % 40);
                    const a = ang + Math.floor(i / 40) * 0.4;
                    const x = pm.x + Math.cos(a) * d;
                    const z = pm.z + Math.sin(a) * d;
                    if (!r._isAboveWaterAt || r._isAboveWaterAt(x, z)) {
                        const h = r.getTerrainHeightAt(x, z);
                        return { x, y: (Number.isFinite(h) ? h : 0) + 1, z };
                    }
                }
                return null;
            };
            const distXZ = (a, b) => Math.hypot(a.position.x - b.x, a.position.z - b.z);
            const gap = (a, b) => Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z);

            const saveMax = s.maxCreatures;
            s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 4);
            const spawn = (spot, soul, bodySize) =>
                r.spawnCreatureAt(spot.x, spot.y, spot.z, "happy", soul, { precise: true, bodySize });
            const cleanup = (list) => list.forEach((c) => c && r.removeCreature(c));
            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) r.updateCreatures(dt);
            };

            // ── (A) SEPARATION: identisches Paar auf DEMSELBEN Punkt ──
            const spotA = findSpot(100, 0.3);
            if (!spotA) return { error: "kein Land-Spot (A)" };
            const a1 = spawn(spotA, "wesen", 1);
            const a2 = spawn(spotA, "wesen", 1);
            if (!a1 || !a2) return { error: "Spawn (A) fehlgeschlagen" };
            a2.userData.netId = a1.userData.netId; // geklonter Wander-Strom — nur Separation kann trennen
            a2.position.copy(a1.position); // exakte Deckung (spawnCreatureAt precise → schon gleich)
            o.a0 = gap(a1, a2);
            tick(200, 0.05); // 10 s Sim
            o.aGap = gap(a1, a2);
            o.aBodyRadius = A.CREATURE_SEPARATION.radiusBaseM / 2; // Körperradius bei bodySize 1
            o.aPlayerDist = distXZ(a1, pm);
            o.checks.aStacked0 = o.a0 < 1e-6;
            o.checks.aSeparated = o.aGap > o.aBodyRadius;
            o.checks.aBounded = o.aGap < 30; // keine Explosions-Kraft

            // ── (C) SELBST-TEST: genullte Separation → das Paar BLEIBT gestapelt ──
            a1.position.set(spotA.x, spotA.y, spotA.z);
            a2.position.copy(a1.position);
            delete a1.userData._wanderSlot;
            delete a2.userData._wanderSlot;
            a1.userData.wanderAnchor = null;
            a2.userData.wanderAnchor = null;
            const savedSep = r._applyCreatureSeparation;
            r._applyCreatureSeparation = function () {};
            tick(200, 0.05);
            r._applyCreatureSeparation = savedSep; // restaurieren (Gate-Hook-Lehre)
            o.cGap = gap(a1, a2);
            o.checks.cLensFires = o.cGap < 0.2; // gestapelt → die (A)-Bedingung WÜRDE rot lesen
            cleanup([a1, a2]);

            // ── (B1) STAT-ACHSE: klein flink vs. Gigant träge (gleiche Soul) ──
            const spotB1a = findSpot(95, 1.8);
            const spotB1b = findSpot(95, -1.8);
            if (!spotB1a || !spotB1b) return { error: "kein Land-Spot (B1)" };
            const bSmall = spawn(spotB1a, "wesen", 0.6);
            const bBig = spawn(spotB1b, "wesen", 2.4);
            if (!bSmall || !bBig) return { error: "Spawn (B1) fehlgeschlagen" };
            o.b1MulSmall = r._creatureMoveCharacter(bSmall).speedMul;
            o.b1MulBig = r._creatureMoveCharacter(bBig).speedMul;
            let pathSmall = 0,
                pathBig = 0,
                px1 = bSmall.position.x,
                pz1 = bSmall.position.z,
                px2 = bBig.position.x,
                pz2 = bBig.position.z;
            for (let k = 0; k < 400; k++) {
                r.updateCreatures(0.05);
                pathSmall += Math.hypot(bSmall.position.x - px1, bSmall.position.z - pz1);
                pathBig += Math.hypot(bBig.position.x - px2, bBig.position.z - pz2);
                px1 = bSmall.position.x;
                pz1 = bSmall.position.z;
                px2 = bBig.position.x;
                pz2 = bBig.position.z;
            }
            o.b1PathSmall = pathSmall;
            o.b1PathBig = pathBig;
            o.checks.b1MulDiff = o.b1MulSmall > o.b1MulBig * 1.1; // die Stat-Achse trägt ≥ 10 %
            o.checks.b1PathDiff = pathSmall > pathBig * 1.1; // und sie IST Bewegung geworden
            cleanup([bSmall, bBig]);

            // ── (B2) RADIUS-ACHSEN: die Leine liest Mut (fleeMul) × GRÖSSE (bodySize).
            // Die Tiere sind bewusst tag-identisch (Lehre 8) → die behaviorale
            // Radius-Differenz läuft über die sanktionierte GRÖSSEN-Achse (Kitz
            // vs. Gigant derselben Soul); die Mut-Achse (wehrhaft 28 vs. wild
            // ~24.7 Basis) wird als Konsum-Wert am Wolf mitgemessen. ──
            const spotShy = findSpot(90, 2.9);
            const spotBold = findSpot(90, -2.9);
            if (!spotShy || !spotBold) return { error: "kein Land-Spot (B2)" };
            const shy = spawn(spotShy, "wesen", 0.6); // Kitz → Leine ~16.8 m
            const bold = spawn(spotBold, "wesen", 2.4); // Gigant → Leine ~67.2 m
            if (!shy || !bold) return { error: "Spawn (B2) fehlgeschlagen" };
            o.b2TempShy = r._creatureTemperament(shy);
            o.b2TempBold = r._creatureTemperament(bold);
            o.b2LeashShy = r._creatureMoveCharacter(shy).leashM;
            o.b2LeashBold = r._creatureMoveCharacter(bold).leashM;
            o.checks.b2LeashDiff = o.b2LeashBold - o.b2LeashShy >= 25;
            // Mut-Achsen-KONSUM: der Wolf (wild, fleeMul 0.7) hält eine kürzere
            // Basis-Leine als der wehrhafte Hirsch — fleeMul wird gelesen.
            const wolfProbe = spawn(spotShy, "wolf", 1);
            const deerProbe = spawn(spotBold, "wesen", 1);
            o.b2LeashWolf = wolfProbe ? r._creatureMoveCharacter(wolfProbe).leashM : null;
            o.b2LeashDeer = deerProbe ? r._creatureMoveCharacter(deerProbe).leashM : null;
            o.checks.b2MutConsumed =
                Number.isFinite(o.b2LeashWolf) && Number.isFinite(o.b2LeashDeer) && o.b2LeashDeer - o.b2LeashWolf >= 2;
            cleanup([wolfProbe, deerProbe]);
            tick(1, 0.05); // ein Tick → der Anker (Geburtsort) initialisiert lazy
            const anchShy = shy.userData.wanderAnchor;
            const anchBold = bold.userData.wanderAnchor;
            if (!anchShy || !anchBold) return { error: "Anker nicht initialisiert" };
            // beide 45 m vom Anker aussetzen (jenseits der Kitz-Leine 16.8, klar
            // innerhalb der Gigant-Leine 67.2) — RADIAL vom Spieler weg, damit die
            // Distanz nie unter das 70-m-Raycast-Fenster fällt (Kopf-Disziplin).
            const outDir = (anch) => {
                const dx = anch.x - pm.x,
                    dz = anch.z - pm.z,
                    d = Math.hypot(dx, dz) || 1;
                return { x: dx / d, z: dz / d };
            };
            const oS = outDir(anchShy),
                oB = outDir(anchBold);
            shy.position.set(anchShy.x + oS.x * 45, shy.position.y, anchShy.z + oS.z * 45);
            bold.position.set(anchBold.x + oB.x * 45, bold.position.y, anchBold.z + oB.z * 45);
            tick(400, 0.05); // 20 s Sim
            o.b2DistShy = distXZ(shy, anchShy);
            o.b2DistBold = distXZ(bold, anchBold);
            // harte Schranke der Leine: leash × (1 + wanderSpeedMul/anchorPull) ≈ 1.375× ≈ 23.1
            o.checks.b2ShyReturns = o.b2DistShy < 26;
            o.checks.b2BoldRoams = o.b2DistBold > 30 && o.b2DistBold > o.b2DistShy + 4; // frei — keine Leine unter 67 m
            cleanup([shy, bold]);

            s.maxCreatures = saveMax;
            o.creaturesAfter = s.creatures.length;
            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== V18.472 — DIE TIERE ENTSTAPELN + DIFFERENZIEREN SICH (gate:tier-separation) =====\n");
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
            `  (A) Paar-Deckung ${out.a0.toFixed(4)} m → nach 200 Ticks ${out.aGap.toFixed(2)} m (Körperradius ${out.aBodyRadius} m, Spieler-Distanz ${out.aPlayerDist.toFixed(0)} m)`
        );
        console.log(`  (C) Separation genullt: ${out.cGap.toFixed(4)} m nach 200 Ticks`);
        console.log(
            `  (B1) speedMul klein ${out.b1MulSmall.toFixed(3)} vs. Gigant ${out.b1MulBig.toFixed(3)} · Weg ${out.b1PathSmall.toFixed(1)} m vs. ${out.b1PathBig.toFixed(1)} m`
        );
        console.log(
            `  (B2) Kitz (${out.b2TempShy}, 0.6) Leine ${out.b2LeashShy.toFixed(1)} m vs. Gigant (${out.b2TempBold}, 2.4) ${out.b2LeashBold.toFixed(1)} m · Wolf-Basis ${out.b2LeashWolf && out.b2LeashWolf.toFixed(1)} m vs. Hirsch ${out.b2LeashDeer && out.b2LeashDeer.toFixed(1)} m · Anker-Distanz nach Aussetzen auf 45 m: ${out.b2DistShy.toFixed(1)} m vs. ${out.b2DistBold.toFixed(1)} m\n`
        );
        check(c.aStacked0, "(A) PRÄMISSE: das Paar startet in exakter Deckung (0 m)");
        check(c.aSeparated, `(A) SEPARATION: nach 200 Ticks > Körperradius getrennt (${out.aGap.toFixed(2)} m > ${out.aBodyRadius} m)`);
        check(c.aBounded, `(A) und beschränkt — keine Explosions-Kraft (${out.aGap.toFixed(2)} m < 30 m)`);
        check(
            c.cLensFires,
            `SELBST-TEST (C): mit genullter Separation bleibt das Paar GESTAPELT (${out.cGap.toFixed(4)} m < 0.2 m) — die Linse feuert`
        );
        check(
            c.b1MulDiff,
            `(B1) STAT-KONSUM: verschiedene Stats → verschiedene Charakter-Geschwindigkeit (${out.b1MulSmall.toFixed(3)} > ${out.b1MulBig.toFixed(3)} × 1.1)`
        );
        check(c.b1PathDiff, `(B1) und messbar verschiedene Weg-Länge (${out.b1PathSmall.toFixed(1)} m > ${out.b1PathBig.toFixed(1)} m × 1.1)`);
        check(
            c.b2LeashDiff,
            `(B2) GRÖSSEN-ACHSE: die Leinen differieren ≥ 25 m (${out.b2LeashShy.toFixed(1)} vs. ${out.b2LeashBold.toFixed(1)})`
        );
        check(
            c.b2MutConsumed,
            `(B2) MUT-ACHSE KONSUMIERT: Wolf-Basis-Leine < Hirsch (${out.b2LeashWolf && out.b2LeashWolf.toFixed(1)} < ${out.b2LeashDeer && out.b2LeashDeer.toFixed(1)}, fleeMul gelesen)`
        );
        check(c.b2ShyReturns, `(B2) das KITZ kehrt an seine kurze Leine zurück (${out.b2DistShy.toFixed(1)} m < 26 m)`);
        check(
            c.b2BoldRoams,
            `(B2) der GIGANT streift frei weiter draußen (${out.b2DistBold.toFixed(1)} m > 30 m und > Kitz + 4)`
        );
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die Tiere entstapeln sich und tragen Charakter (Separation + Stat-/Mut-Achsen KONSUMIERT)" : "❌ ROT — die Tiere stapeln sich oder der Charakter trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
