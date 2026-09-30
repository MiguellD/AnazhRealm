#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-koerper-bewegung.cjs — DER KÖRPER GEHT DEN WEG, NICHT DIE UHR
// (npm run gate:koerper-bewegung; Orakel Bogen 2 — die sichtbarste Qualität).
//
// Die Linse hält die vier Gang-Gesetze am ECHTEN Chokepoint (animatePlayerSoul
// / _animateHumanoidRig / updateCreatures), headless/Null-Renderer:
//
//  (A) WEG-PHASE (distance-matched): doppelte Geschwindigkeit ⇒ ~doppelte
//      Phasen-Rate UND konstante Schritt-DISTANZ (±10 %) — gemessen am
//      ECHTEN Konsumenten (animatePlayerSoul mit gestubbter playerVel),
//      nicht nur an der puren Formel. Der Sprint skatet nie mehr.
//  (B) ZWEI-KNOCHEN-IK pur: Ziel in Reichweite ⇒ Fußfehler < 1 cm
//      (FK-Rekonstruktion über ein Ziel-Raster); Ziel außer Reichweite /
//      im Hüftpunkt ⇒ gestreckt, knee=0, NIE NaN.
//  (C) POSEN-BLEND stetig: Δw ≤ 0.2 je Tick beim Schwellen-Sprung 0→6 m/s
//      und zurück — am Konsumenten gemessen (p._gaitW über echte Ticks).
//  (D) TIER-BODENKONTAKT: auf einem 30°-Hang (gestubbter Boden-Chokepoint
//      _voxelSurfaceY) folgt der Kreatur-Root-Pitch dem Hang (30° ± 5°,
//      Vorzeichen: vorn höher → Nase hebt) und die Kreatur steht GEERDET
//      (Sohlen an der Proben-Mitte — der +0.5-m-Schwebe-Anker ist tot).
//  (E) FUSS-IK-KONSUM: gesenkter Boden (gestubbter _gaitBodenY-Chokepoint)
//      ⇒ das Becken senkt sich; Abgrund ⇒ gestreckt ohne NaN.
//  (S) SELBST-TESTS (die Linse feuert): (S1) mit gestubbtem HARTEM Blend
//      (w springt 0↔1) sieht die Δw-Messung den Sprung — sie misst die
//      echte Glättung, nicht sich selbst. (S2) mit gestubbtem _slopePitch≡0
//      bleibt der Kreatur-Pitch am Hang flach — die Hang-Messung fließt
//      durch die EINE Formel. Beide Stubs restauriert (Gate-Hook-Lehre).
//
//   node scripts/diag-koerper-bewegung.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4448;
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
            for (const fn of [
                "_gaitPhaseRate",
                "_gaitSchrittLen",
                "_gaitBlendStep",
                "_twoBoneIK",
                "_slopePitch",
                "_gaitTick",
                "_gaitIKPrep",
                "_gaitApplyFussIK",
                "_creatureSlopeProben",
                "_creatureSlopeProbe",
                "animatePlayerSoul",
                "updateCreatures",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            // Struktur-KONSUM (Lehre 6): die Chokepoints lesen die Gang-Gesetze.
            // (kommentar-gestrippt — das __codeOf-Muster des Playtest-Harness, lokal)
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");
            o.checks.konsumSpieler = /_gaitTick\(/.test(codeOf(r.animatePlayerSoul));
            o.checks.konsumPeer = /_gaitTick\(/.test(codeOf(r._p2pUpdatePeer));
            o.checks.konsumTier = /_creatureSlopeProben\(/.test(codeOf(r.updateCreatures));
            o.checks.konsumRigIK = /_gaitApplyFussIK\(/.test(codeOf(r._animateHumanoidRig));

            // ── (B) ZWEI-KNOCHEN-IK pur — Fußfehler über ein Ziel-Raster ──
            {
                const l1 = 0.45,
                    l2 = 0.4;
                let maxErr = 0,
                    alleFinite = true;
                for (let a = -1.2; a <= 1.2; a += 0.15) {
                    for (let dFrac = 0.15; dFrac <= 0.97; dFrac += 0.1) {
                        const d = (l1 + l2) * dFrac;
                        const vor = Math.sin(a) * d;
                        const unten = Math.cos(a) * d;
                        if (unten <= 0.01) continue;
                        const res = r._twoBoneIK(l1, l2, vor, unten);
                        if (!Number.isFinite(res.hip) || !Number.isFinite(res.knee)) alleFinite = false;
                        if (d > Math.abs(l1 - l2) + 0.01 && res.reached) {
                            const a1 = -res.hip;
                            const a2 = a1 - res.knee;
                            const F = l1 * Math.sin(a1) + l2 * Math.sin(a2);
                            const U = l1 * Math.cos(a1) + l2 * Math.cos(a2);
                            maxErr = Math.max(maxErr, Math.hypot(F - vor, U - unten));
                        }
                    }
                }
                o.ikMaxErr = maxErr;
                o.checks.ikErreichbar = alleFinite && maxErr < 0.01; // Fußfehler < 1 cm
                const weit = r._twoBoneIK(l1, l2, 2, 2); // außer Reichweite
                const punkt = r._twoBoneIK(l1, l2, 0, 0); // Ziel = Hüftpunkt
                const nan = r._twoBoneIK(l1, l2, NaN, NaN);
                o.checks.ikGestreckt =
                    weit.reached === false &&
                    weit.knee === 0 &&
                    Number.isFinite(weit.hip) &&
                    Math.abs(-weit.hip - Math.atan2(2, 2)) < 1e-9; // gestreckt RICHTUNG Ziel
                o.checks.ikNaNWand =
                    punkt.hip === 0 && punkt.knee === 0 && Number.isFinite(nan.hip) && Number.isFinite(nan.knee);
            }
            // ── Hang-Formel pur: 30°-Hang ⇒ 30° ± 5°, Vorzeichen korrekt ──
            {
                const p30 = r._slopePitch(Math.tan(Math.PI / 6) * 2, 0, 2);
                o.pitchPurDeg = (p30 * 180) / Math.PI;
                o.checks.pitchPur = p30 < 0 && Math.abs(Math.abs(o.pitchPurDeg) - 30) <= 5;
                o.checks.pitchNaNWand = r._slopePitch(NaN, 0, 2) === 0 && r._slopePitch(1, 0, 0) === 0;
            }
            // ── Phasen-Rate pur: Proportionalität ──
            o.checks.ratePur =
                Math.abs(r._gaitPhaseRate(6, 3.4) / r._gaitPhaseRate(3, 3.4) - 2) < 1e-9 &&
                r._gaitPhaseRate(0, 3.4) === 0 &&
                r._gaitPhaseRate(NaN, 3.4) === 0;

            // ── Spieler-Konsumenten-Bühne: human-Rig + gestubbte Velocity ──
            const p = s.player;
            const mesh = s.playerMesh;
            if (!mesh || !mesh.userData) return { error: "kein Spieler-Mesh" };
            const savedSoul = p.soul;
            if (!mesh.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
            const pmesh = s.playerMesh;
            if (!pmesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            const savedVel = s.playerVel;
            const savedUw = s.playerUnderwater;
            const savedMounted = p.mountedArch;
            const savedPhase = p.walkPhase;
            const savedW = p._gaitW;
            const savedTick = p.animationLastTick;
            s.playerUnderwater = false;
            p.mountedArch = null;
            let vStub = 0;
            s.playerVel = { x: () => vStub, z: () => vStub * 0, y: () => 0 };
            const fahre = (v, sek, t0) => {
                vStub = v;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0);
                const ph0 = p.walkPhase;
                const n = Math.round(sek * 60);
                for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
                return p.walkPhase - ph0;
            };

            // ── (A) WEG-PHASE am ECHTEN Konsumenten ──
            const d1 = fahre(3, 1.0, 100);
            const d2 = fahre(6, 1.0, 200);
            o.phaseRate1 = d1;
            o.phaseRate2 = d2;
            o.rateRatio = d1 > 0 ? d2 / d1 : 0;
            o.checks.aRateVerdoppelt = o.rateRatio > 1.8 && o.rateRatio < 2.2;
            const sd1 = d1 > 0 ? 3 / (d1 / Math.PI) : 0; // Weg je Schritt bei v=3
            const sd2 = d2 > 0 ? 6 / (d2 / Math.PI) : 0; // Weg je Schritt bei v=6
            o.schritt1 = sd1;
            o.schritt2 = sd2;
            o.checks.aSchrittKonstant = sd1 > 0 && Math.abs(sd2 / sd1 - 1) <= 0.1;

            // ── (C) POSEN-BLEND stetig am Konsumenten (Schwellen-Sprung) ──
            const blendLauf = () => {
                let maxJump = 0;
                p._gaitW = 0;
                vStub = 0;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(300);
                vStub = 6; // der Schwellen-SPRUNG
                let wPrev = p._gaitW;
                for (let k = 1; k <= 90; k++) {
                    r.animatePlayerSoul(300 + k / 60);
                    maxJump = Math.max(maxJump, Math.abs(p._gaitW - wPrev));
                    wPrev = p._gaitW;
                }
                const wOben = p._gaitW;
                vStub = 0; // zurück unter die Schwelle
                for (let k = 91; k <= 180; k++) {
                    r.animatePlayerSoul(300 + k / 60);
                    maxJump = Math.max(maxJump, Math.abs(p._gaitW - wPrev));
                    wPrev = p._gaitW;
                }
                return { maxJump, wOben, wUnten: p._gaitW };
            };
            const bl = blendLauf();
            o.blend = bl;
            o.checks.cBlendStetig = bl.maxJump <= 0.2 + 1e-9;
            o.checks.cBlendKonvergiert = bl.wOben > 0.8 && bl.wUnten < 0.2;
            o.checks.cBlendNaNWand = Number.isFinite(r._gaitBlendStep(NaN, NaN, NaN));

            // ── (S1) SELBST-TEST: hartes Blend gestubbt → die Messung sieht den Sprung ──
            const savedBlend = r._gaitBlendStep;
            r._gaitBlendStep = function (_w, speed) {
                return Number.isFinite(speed) && speed > 0.4 ? 1 : 0;
            };
            const blStub = blendLauf();
            r._gaitBlendStep = savedBlend; // restaurieren (Gate-Hook-Lehre)
            o.s1MaxJump = blStub.maxJump;
            o.checks.s1LensFires = blStub.maxJump > 0.2;

            // ── (E) FUSS-IK-KONSUM: Becken senkt sich auf gesenktem Boden, Abgrund ohne NaN ──
            {
                const rig = pmesh.userData.rig;
                const soleY = pmesh.position.y - A.PLAYER_FOOT_OFFSET;
                const savedBoden = r._gaitBodenY;
                const probenFrisch = () => {
                    const ik = pmesh.userData._gaitIK;
                    if (ik) {
                        ik.probeL.g = NaN;
                        ik.probeR.g = NaN;
                    }
                };
                const tickeIdle = (t0) => {
                    vStub = 0;
                    p._gaitW = 0;
                    p.animationLastTick = -Infinity;
                    r.animatePlayerSoul(t0);
                    for (let k = 1; k <= 8; k++) r.animatePlayerSoul(t0 + k / 60);
                };
                r._gaitBodenY = () => soleY; // ebener Boden = Sohlen-Ebene
                probenFrisch();
                tickeIdle(500);
                const h0 = rig.hips.position.y;
                r._gaitBodenY = () => soleY - 0.25; // Boden 25 cm gesenkt
                probenFrisch();
                tickeIdle(510);
                const h1 = rig.hips.position.y;
                r._gaitBodenY = () => soleY - 50; // Abgrund
                probenFrisch();
                tickeIdle(520);
                let alleFinite = true;
                for (const leg of [rig.legL, rig.legR])
                    for (const kk of ["hip", "knee", "ankle"])
                        if (leg[kk] && !Number.isFinite(leg[kk].rotation.x)) alleFinite = false;
                if (!Number.isFinite(rig.hips.position.y)) alleFinite = false;
                r._gaitBodenY = savedBoden; // restaurieren
                probenFrisch();
                o.beckenFlach = h0;
                o.beckenGesenkt = h1;
                o.checks.eBeckenSenkt = Number.isFinite(h0) && Number.isFinite(h1) && h1 < h0 - 0.1;
                o.checks.eAbgrundOhneNaN = alleFinite;
            }

            // Spieler-Bühne restaurieren
            s.playerVel = savedVel;
            s.playerUnderwater = savedUw;
            p.mountedArch = savedMounted;
            p.walkPhase = savedPhase;
            p._gaitW = savedW;
            p.animationLastTick = savedTick;
            if (savedSoul !== p.soul && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul(savedSoul);

            // ── (D) TIER-BODENKONTAKT auf dem 30°-Hang (gestubbter Boden) ──
            {
                const pm = s.playerMesh.position;
                const saveMax = s.maxCreatures;
                s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 2);
                const steig = Math.tan(Math.PI / 6); // 30°
                const ebene = (x, z) => 10 + (z - pm.z) * steig;
                const dist = Math.sqrt(A.TIER_FERN_DIST_SQ) * 0.3; // sicher in der Voll-Zone
                const cx = pm.x + dist,
                    cz = pm.z;
                const c = r.spawnCreatureAt(cx, 30, cz, "happy", "wesen", { precise: true, bodySize: 1 });
                if (!c) return { error: "Tier-Spawn fehlgeschlagen" };
                const savedSurf = r._voxelSurfaceY;
                r._voxelSurfaceY = (x, z) => ebene(x, z);
                const tiere = (n) => {
                    for (let k = 0; k < n; k++) {
                        r.updateCreatures(0.02);
                        c.position.x = cx;
                        c.position.z = cz; // pinnen (Wander driftet sonst)
                    }
                };
                tiere(60);
                o.tierPitchDeg = (c.rotation.x * 180) / Math.PI;
                o.tierY = c.position.y;
                o.tierSollY = ebene(cx, cz);
                o.checks.dPitch30 = c.rotation.x < 0 && Math.abs(Math.abs(o.tierPitchDeg) - 30) <= 5;
                o.checks.dGeerdet = Math.abs(o.tierY - o.tierSollY) < 0.6; // Sohlen an der Proben-Mitte, kein +0.5-Anker
                // ── (S2) SELBST-TEST: _slopePitch ≡ 0 → der Hang-Pitch fällt zurück ──
                const savedPitch = r._slopePitch;
                r._slopePitch = function () {
                    return 0;
                };
                tiere(60);
                r._slopePitch = savedPitch; // restaurieren (Gate-Hook-Lehre)
                o.s2PitchDeg = (c.rotation.x * 180) / Math.PI;
                o.checks.s2LensFires = Math.abs(o.s2PitchDeg) < 3; // ohne Formel kein Hang-Folgen
                r._voxelSurfaceY = savedSurf; // restaurieren
                // Boden-Caches der Welt-Kreaturen entstubben (kein stale Hang-Boden)
                for (const cr of s.creatures) {
                    const ud = cr.userData || {};
                    delete ud.cachedGroundY;
                    if (ud._slopeProbeV) ud._slopeProbeV.g = NaN;
                    if (ud._slopeProbeH) ud._slopeProbeH.g = NaN;
                }
                r.removeCreature(c);
                s.maxCreatures = saveMax;
            }

            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== KÖRPER-BEWEGUNG — Weg-Phase · Posen-Blend · Fuß-IK · Tier-Bodenkontakt (gate:koerper-bewegung) =====\n"
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
            `  (A) Phase über 1 s: v=3 → ${out.phaseRate1.toFixed(2)} rad · v=6 → ${out.phaseRate2.toFixed(2)} rad (Ratio ${out.rateRatio.toFixed(2)}); Schritt ${out.schritt1.toFixed(2)} m → ${out.schritt2.toFixed(2)} m`
        );
        console.log(
            `  (B) IK-Fußfehler max ${(out.ikMaxErr * 100).toFixed(3)} cm · (C) max Δw/Tick ${out.blend.maxJump.toFixed(3)} (oben ${out.blend.wOben.toFixed(2)} / unten ${out.blend.wUnten.toFixed(2)})`
        );
        console.log(
            `  (D) Tier am 30°-Hang: Pitch ${out.tierPitchDeg.toFixed(1)}° · y ${out.tierY.toFixed(2)} (soll ${out.tierSollY.toFixed(2)}) · (E) Becken ${out.beckenFlach.toFixed(3)} → ${out.beckenGesenkt.toFixed(3)}\n`
        );
        check(c.konsumSpieler, "KONSUM: animatePlayerSoul liest den EINEN Gang-Tick (_gaitTick)");
        check(c.konsumPeer, "KONSUM: _p2pUpdatePeer liest denselben Gang-Tick (Peers gleiche Quelle)");
        check(c.konsumTier, "KONSUM: updateCreatures liest die Hang-Proben (_creatureSlopeProben)");
        check(c.konsumRigIK, "KONSUM: _animateHumanoidRig wendet das Fuß-IK an (_gaitApplyFussIK)");
        check(c.ratePur, "(A) Phasen-Rate ∝ Tempo (pur: 2× Tempo = exakt 2× Rate, NaN-Wand)");
        check(c.aRateVerdoppelt, `(A) KONSUM: doppelte Geschwindigkeit ⇒ ~doppelte Phasen-Rate (${out.rateRatio.toFixed(2)}×)`);
        check(c.aSchrittKonstant, "(A) KONSUM: die Schritt-DISTANZ bleibt konstant (±10 %) — kein Skating");
        check(c.ikErreichbar, `(B) IK: Ziel in Reichweite ⇒ Fußfehler < 1 cm (max ${(out.ikMaxErr * 100).toFixed(3)} cm)`);
        check(c.ikGestreckt, "(B) IK: außer Reichweite ⇒ gestreckt RICHTUNG Ziel (knee=0, finite)");
        check(c.ikNaNWand, "(B) IK: Ziel im Hüftpunkt / NaN-Eingabe ⇒ neutrale Zahlen, nie NaN");
        check(c.cBlendStetig, `(C) Blend stetig: Δw ≤ 0.2 je Tick beim Schwellen-Sprung (max ${out.blend.maxJump.toFixed(3)})`);
        check(c.cBlendKonvergiert, "(C) und w konvergiert (Gehen > 0.8 · Stand < 0.2)");
        check(c.cBlendNaNWand, "(C) NaN-Wand vor dem w-Gedächtnis");
        check(c.s1LensFires, `SELBST-TEST (S1): hartes Blend gestubbt → die Linse sieht den Sprung (Δw ${out.s1MaxJump.toFixed(2)})`);
        check(c.dPitch30, `(D) Tier-Root-Pitch folgt dem 30°-Hang (${out.tierPitchDeg.toFixed(1)}°, Nase hebt bergauf)`);
        check(c.dGeerdet, "(D) und die Kreatur steht GEERDET (Proben-Mitte, kein +0.5-m-Schwebe-Anker)");
        check(c.s2LensFires, `SELBST-TEST (S2): _slopePitch ≡ 0 gestubbt → kein Hang-Folgen (${out.s2PitchDeg.toFixed(1)}°) — die Messung fließt durch die EINE Formel`);
        check(c.pitchPur, `Hang-Formel pur: 30°-Hang ⇒ ${Math.abs(out.pitchPurDeg).toFixed(1)}° (±5°), Vorzeichen korrekt`);
        check(c.pitchNaNWand, "Hang-Formel: NaN-/Null-Spann-Wand ⇒ 0");
        check(c.eBeckenSenkt, "(E) FUSS-IK-KONSUM: gesenkter Boden ⇒ das Becken senkt sich aufs tiefere Bein");
        check(c.eAbgrundOhneNaN, "(E) Abgrund unter den Füßen ⇒ gestreckt, alle Gelenke finite (NaN-Wand)");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — der Körper geht den Weg: Phase ∝ Distanz · Blend ohne Plopp · Füße am Boden · Tier am Hang" : "❌ ROT — die Körper-Bewegung trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
