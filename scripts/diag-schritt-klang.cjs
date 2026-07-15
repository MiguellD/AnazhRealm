#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-schritt-klang.cjs — DER FUSS SPIELT DEN BODEN, NICHT DIE UHR
// (npm run gate:schritt-klang; Orakel Tier-1 #7 — der konstanteste
// Feedback-Kanal eines 3D-Spiels).
//
// Die Linse hält die drei Schritt-Klang-Gesetze am ECHTEN Chokepoint
// (animatePlayerSoul → _schrittKlangTick), headless/Null-Renderer — Audio
// ist stumm, aber die EREIGNIS-Logik ist pur messbar:
//
//  (A) SCHRITT-TAKT: je Halbzyklus (π) der weg-getriebenen Gang-Phase EIN
//      Schritt — N Halbzyklen ⇒ N Ereignisse (±1), gemessen am echten
//      Konsumenten (animatePlayerSoul mit gestubbter playerVel) bei zwei
//      Geschwindigkeiten. Keine eigene Uhr: der Tick liest walkPhase.
//  (B) STAND/LUFT/SCHLEICHEN NIE: im Stand 0 Ereignisse; unter der
//      Tempo-Schwelle 0 (obwohl die Phase rückt); in der LUFT 0 (obwohl
//      die Phase rückt); beim Schwimmen 0.
//  (C) MATERIAL WÄHLT TIMBRE: zwei gestubbte Böden (erde/stein) ⇒
//      verschiedene Timbre-Parameter aus der EINEN Tabelle
//      (SCHRITT_KLANG); Wasser am Fuß ⇒ „wasser" (platschig); unbekanntes
//      Material fällt auf den Tabellen-Fallback.
//  (D) LANDUNG: nach einem Fall (Luft-Strecke mit Fall-Tempo, dann Boden)
//      GENAU EIN Lande-Ereignis, dessen Parameter STÄRKER (gain) und
//      TIEFER (freq) als der Schritt desselben Materials ist; unter der
//      EINEN Schwelle (LAND_DIP_MIN_SPEED) keine Landung; gainDeckel hält.
//  (E) STIMME-AUS-WAND: Symphonie aus ⇒ die Ereignisse ZÄHLEN, der
//      Klang-Aufruf (_playSchrittOneShot) unterbleibt; Symphonie an ⇒
//      genau EIN Aufruf je Ereignis.
//  (S) SELBST-TESTS (die Linse feuert): (S1) _gaitPhaseRate ≡ 0 gestubbt ⇒
//      trotz Tempo + Boden 0 Schritte — die Ereignisse hängen an der
//      PHASE, nicht an der Zeit (die „keine eigene Uhr"-Messung ist nicht
//      blind). (S2) Terrain ≡ stein gestubbt, aber Wasserspiegel über dem
//      Fuß ⇒ „wasser" — die Nass-Wand liegt im Chokepoint VOR dem
//      Terrain-Material. Alle Stubs restauriert (Gate-Hook-Lehre).
//
//   node scripts/diag-schritt-klang.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4452;
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
                "_schrittKlangTick",
                "_schrittKlangEreignis",
                "_schrittMaterialAt",
                "_schrittKlangParams",
                "_playSchrittOneShot",
                "_gaitPhaseRate",
                "_terrainMaterialAt",
                "_waterLevelAt",
                "animatePlayerSoul",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            if (!A.SCHRITT_KLANG) return { error: "SCHRITT_KLANG-Tabelle fehlt" };
            const T = A.SCHRITT_KLANG;
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");

            // ── KONSUM-/Source-Proben (Lehre 6): die EINE Quelle ist verdrahtet ──
            o.checks.konsumTick = /_schrittKlangTick\(/.test(codeOf(r.animatePlayerSoul));
            const tickSrc = codeOf(r._schrittKlangTick);
            o.checks.keineEigeneUhr =
                /walkPhase/.test(tickSrc) && !/performance\.now/.test(tickSrc) && !/Date\.now/.test(tickSrc);
            o.checks.eineSchwelle = /LAND_DIP_MIN_SPEED/.test(tickSrc); // kein Schwellen-Zwilling
            const matSrc = codeOf(r._schrittMaterialAt);
            o.checks.materialQuellen = /_terrainMaterialAt/.test(matSrc) && /_waterLevelAt/.test(matSrc);
            const shotSrc = codeOf(r._playSchrittOneShot);
            o.checks.klangEineMaschine =
                /masterGain/.test(shotSrc) && /enabled/.test(shotSrc) && !/new\s+AudioContext/.test(shotSrc);
            o.checks.simUnberuehrt =
                !/_schrittKlang/.test(codeOf(r._stepFixedSim)) &&
                !/_schrittKlang/.test(codeOf(r._loopFixedStep)) &&
                !/_schrittKlang/.test(codeOf(r._stepCharacter));
            // Stimme-aus fail-closed an der Stimme selbst (headless: nie aktiviert)
            o.checks.stimmeFailClosed = r._playSchrittOneShot({ gain: 0.05 }) === false && !s.symphony.enabled;

            // ── Bühne: human-Rig + gestubbte Velocity (das koerper-Linsen-Muster) ──
            const p = s.player;
            if (!p || !s.playerMesh) return { error: "kein Spieler" };
            const savedSoul = p.soul;
            if (!s.playerMesh.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
            const pmesh = s.playerMesh;
            if (!pmesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            const saved = {
                vel: s.playerVel,
                uw: s.playerUnderwater,
                mounted: p.mountedArch,
                walkPhase: p.walkPhase,
                gaitW: p._gaitW,
                lastTick: p.animationLastTick,
                isInAir: s.isInAir,
                fieldVy: s._fieldVy,
                schritt: s._schrittKlang,
                hitStop: p._hitStopUntil,
            };
            s.playerUnderwater = false;
            p.mountedArch = null;
            p._hitStopUntil = 0;
            s.isInAir = false;
            s._fieldVy = 0;
            let vStub = 0;
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            const z = () => s._schrittKlang || { schritte: 0, landungen: 0, letzter: null };
            const frisch = () => {
                s._schrittKlang = null;
            };
            // fährt sek Sekunden bei Tempo v; liefert Phase-Start (NACH dem
            // Anker-Tick bei t0) und Phase-Ende — die Soll-Schritte sind die
            // π-Grenz-Überquerungen dazwischen.
            const fahre = (v, sek, t0) => {
                vStub = v;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0); // dt=0 — ankert ohne Ereignis
                const ph0 = p.walkPhase;
                const n = Math.round(sek * 60);
                for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
                return { ph0, ph1: p.walkPhase };
            };
            const halbe = (lauf) => Math.floor(lauf.ph1 / Math.PI) - Math.floor(lauf.ph0 / Math.PI);

            // ── (A) SCHRITT-TAKT: N Halbzyklen ⇒ N Ereignisse (±1), zwei Tempi ──
            frisch();
            const lauf6 = fahre(6, 2.0, 100);
            const n6 = z().schritte;
            const soll6 = halbe(lauf6);
            frisch();
            const lauf3 = fahre(3, 2.0, 200);
            const n3 = z().schritte;
            const soll3 = halbe(lauf3);
            o.takt = { n6, soll6, n3, soll3 };
            o.checks.aTakt6 = soll6 >= 3 && Math.abs(n6 - soll6) <= 1;
            o.checks.aTakt3 = soll3 >= 1 && Math.abs(n3 - soll3) <= 1;

            // ── (B) STAND/SCHLEICHEN/LUFT/SCHWIMMEN: 0 Ereignisse ──
            frisch();
            fahre(0, 1.0, 300);
            o.checks.bStandNull = z().schritte === 0 && z().landungen === 0;
            frisch();
            const laufSchleich = fahre(0.5, 1.0, 400); // Phase rückt, Tempo unter der Schwelle
            o.schleichPhase = laufSchleich.ph1 - laufSchleich.ph0;
            o.checks.bSchleichNull = z().schritte === 0 && o.schleichPhase > 0;
            frisch();
            s.isInAir = true; // Luft: Phase rückt weiter, aber kein Boden-Kontakt
            const laufLuft = fahre(6, 1.0, 500);
            s.isInAir = false;
            o.luftPhase = laufLuft.ph1 - laufLuft.ph0;
            o.checks.bLuftNull = z().schritte === 0 && o.luftPhase > Math.PI;
            frisch();
            s.playerUnderwater = true; // Schwimmen: die Schwimm-Phase rückt, kein Schritt
            fahre(6, 1.0, 600);
            s.playerUnderwater = false;
            o.checks.bSchwimmNull = z().schritte === 0;

            // ── (C) MATERIAL WÄHLT TIMBRE — zwei Böden durch die ECHTE Pipe ──
            const savedTerr = r._terrainMaterialAt;
            const savedWl = r._waterLevelAt;
            r._waterLevelAt = () => -Infinity; // trocken (der Boden entscheidet)
            r._terrainMaterialAt = () => "erde";
            frisch();
            fahre(6, 1.5, 700);
            const pErde = z().letzter;
            r._terrainMaterialAt = () => "stein";
            frisch();
            fahre(6, 1.5, 800);
            const pStein = z().letzter;
            o.timbre = { erde: pErde, stein: pStein };
            o.checks.cZweiBoeden =
                !!pErde &&
                !!pStein &&
                pErde.material === "erde" &&
                pStein.material === "stein" &&
                (pErde.freq !== pStein.freq || pErde.filter !== pStein.filter);
            // (S2) SELBST-TEST: Nass schlägt fest — Wasser über dem Fuß gewinnt
            r._waterLevelAt = () => pmesh.position.y + 5;
            frisch();
            fahre(6, 1.0, 900);
            const pNass = z().letzter;
            r._terrainMaterialAt = savedTerr; // restaurieren (Gate-Hook-Lehre)
            r._waterLevelAt = savedWl;
            o.checks.s2NassSchlaegtFest = !!pNass && pNass.material === "wasser";
            // Tabelle pur: Fallback + Deckel
            o.checks.cFallback = r._schrittKlangParams("nebelkuchen", false, 0).material === T.fallback;
            o.checks.cDeckel = r._schrittKlangParams("stein", true, 1000).gain <= T.gainDeckel + 1e-12;

            // ── (D) LANDUNG: genau 1×, stärker + tiefer; unter der Schwelle nie ──
            const falle = (t0, fallTempo, frames) => {
                vStub = 0;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0); // geerdet ankern
                s.isInAir = true;
                for (let k = 0; k < frames; k++) {
                    s._fieldVy = -(fallTempo * (k + 1)) / frames; // wachsendes Fall-Tempo
                    r.animatePlayerSoul(t0 + 0.1 + k / 60);
                }
                s.isInAir = false;
                s._fieldVy = 0;
                r.animatePlayerSoul(t0 + 0.2 + frames / 60); // das Aufsetzen
            };
            frisch();
            falle(1000, 9, 30); // harter Fall (9 m/s ≫ LAND_DIP_MIN_SPEED)
            const landA = { landungen: z().landungen, letzter: z().letzter };
            for (let k = 1; k <= 30; k++) r.animatePlayerSoul(1002 + k / 60); // weitere Boden-Ticks
            o.land = landA;
            o.checks.dGenauEinmal = landA.landungen === 1 && z().landungen === 1 && z().schritte === 0;
            const schrittRef = landA.letzter ? r._schrittKlangParams(landA.letzter.material, false, 0) : null;
            o.checks.dStaerkerTiefer =
                !!landA.letzter &&
                landA.letzter.landung === true &&
                !!schrittRef &&
                landA.letzter.gain > schrittRef.gain &&
                landA.letzter.freq < schrittRef.freq;
            frisch();
            falle(1100, 1.0, 10); // Hopser (1 m/s < LAND_DIP_MIN_SPEED)
            o.checks.dSchwelleHaelt = z().landungen === 0;

            // ── (E) STIMME-AUS-WAND: Ereignis zählt, der Klang-Aufruf unterbleibt ──
            let calls = 0;
            const savedPlay = r._playSchrittOneShot;
            r._playSchrittOneShot = () => {
                calls++;
                return true;
            };
            const sym = s.symphony;
            const savedSym = { enabled: sym.enabled, ctx: sym.ctx, masterGain: sym.masterGain };
            sym.enabled = false;
            frisch();
            fahre(6, 1.0, 1200);
            o.stummSchritte = z().schritte;
            o.checks.eStummZaehlt = o.stummSchritte >= 1 && calls === 0;
            sym.enabled = true; // Stimme an (Fake-Naht — der Spy fängt VOR WebAudio)
            if (!sym.ctx) sym.ctx = { __fake: true };
            if (!sym.masterGain) sym.masterGain = { __fake: true };
            calls = 0;
            frisch();
            fahre(6, 1.0, 1300);
            o.anSchritte = z().schritte;
            o.anCalls = calls;
            o.checks.eAnRuft = o.anSchritte >= 1 && calls === o.anSchritte;
            r._playSchrittOneShot = savedPlay; // restaurieren (Gate-Hook-Lehre)
            sym.enabled = savedSym.enabled;
            sym.ctx = savedSym.ctx;
            sym.masterGain = savedSym.masterGain;

            // ── (S1) SELBST-TEST: Phasen-Rate ≡ 0 ⇒ trotz Tempo + Boden 0 Schritte ──
            const savedRate = r._gaitPhaseRate;
            r._gaitPhaseRate = () => 0;
            frisch();
            const laufStub = fahre(6, 1.0, 1400);
            r._gaitPhaseRate = savedRate; // restaurieren (Gate-Hook-Lehre)
            o.s1Phase = laufStub.ph1 - laufStub.ph0;
            o.checks.s1LinseFeuert = o.s1Phase === 0 && z().schritte === 0;

            // ── Bühne restaurieren ──
            s.playerVel = saved.vel;
            s.playerUnderwater = saved.uw;
            p.mountedArch = saved.mounted;
            p.walkPhase = saved.walkPhase;
            p._gaitW = saved.gaitW;
            p.animationLastTick = saved.lastTick;
            s.isInAir = saved.isInAir;
            s._fieldVy = saved.fieldVy;
            s._schrittKlang = saved.schritt;
            p._hitStopUntil = saved.hitStop;
            if (savedSoul !== p.soul && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul(savedSoul);

            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== SCHRITT-KLANG — Takt der Weg-Phase · Material wählt Timbre · Landung (gate:schritt-klang) =====\n"
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
            `  (A) v=6: ${out.takt.n6} Schritte (soll ${out.takt.soll6}) · v=3: ${out.takt.n3} (soll ${out.takt.soll3}) · (B) Luft-Phase ${out.luftPhase.toFixed(2)} rad bei 0 Schritten`
        );
        console.log(
            `  (C) erde ${out.timbre.erde ? out.timbre.erde.filter + "@" + out.timbre.erde.freq : "?"} · stein ${out.timbre.stein ? out.timbre.stein.filter + "@" + out.timbre.stein.freq : "?"} · (D) Landung gain ${out.land.letzter ? out.land.letzter.gain.toFixed(3) : "?"} (${out.land.landungen}×) · (E) an: ${out.anCalls} Aufrufe für ${out.anSchritte} Schritte\n`
        );
        check(c.konsumTick, "KONSUM: animatePlayerSoul ruft den EINEN Schritt-Tick (_schrittKlangTick)");
        check(c.keineEigeneUhr, "KONSUM: der Tick liest die Gang-Phase (walkPhase) — keine eigene Uhr");
        check(c.eineSchwelle, "KONSUM: die Lande-Schwelle IST LAND_DIP_MIN_SPEED (kein Zwilling)");
        check(c.materialQuellen, "KONSUM: das Fuß-Material liest _terrainMaterialAt + _waterLevelAt (die EINEN Quellen)");
        check(c.klangEineMaschine, "KONSUM: die Stimme läuft über masterGain + enabled-Wand (kein zweiter AudioContext)");
        check(c.simUnberuehrt, "WAND: die fixe Sim (_stepFixedSim/_loopFixedStep/_stepCharacter) kennt den Schritt-Klang NICHT");
        check(c.stimmeFailClosed, "WAND: die Stimme selbst ist fail-closed (Symphonie aus ⇒ false, kein Throw)");
        check(c.aTakt6, `(A) v=6: N Halbzyklen ⇒ N Ereignisse ±1 (${out.takt.n6} von ${out.takt.soll6})`);
        check(c.aTakt3, `(A) v=3: N Halbzyklen ⇒ N Ereignisse ±1 (${out.takt.n3} von ${out.takt.soll3})`);
        check(c.bStandNull, "(B) im STAND 0 Ereignisse");
        check(c.bSchleichNull, "(B) unter der Tempo-Schwelle 0 Ereignisse (obwohl die Phase rückt)");
        check(c.bLuftNull, "(B) in der LUFT 0 Ereignisse (obwohl die Phase rückt)");
        check(c.bSchwimmNull, "(B) beim Schwimmen 0 Ereignisse");
        check(c.cZweiBoeden, "(C) zwei Böden ⇒ verschiedene Timbre-Parameter aus der EINEN Tabelle");
        check(c.s2NassSchlaegtFest, "SELBST-TEST (S2): Wasser über dem Fuß ⇒ „wasser“ — die Nass-Wand liegt VOR dem Terrain-Material");
        check(c.cFallback, "(C) unbekanntes Material fällt auf den Tabellen-Fallback");
        check(c.cDeckel, "(C) der gainDeckel hält auch beim Extrem-Sturz");
        check(c.dGenauEinmal, `(D) die Landung feuert GENAU EINMAL (${out.land.landungen}×, keine Schritte in der Luft)`);
        check(c.dStaerkerTiefer, "(D) und ihr Parameter ist STÄRKER (gain) + TIEFER (freq) als der Schritt desselben Bodens");
        check(c.dSchwelleHaelt, "(D) unter LAND_DIP_MIN_SPEED keine Landung (der Hopser bleibt stumm)");
        check(c.eStummZaehlt, `(E) Stimme AUS: Ereignisse zählen (${out.stummSchritte}), der Klang-Aufruf unterbleibt (0 Aufrufe)`);
        check(c.eAnRuft, `(E) Stimme AN: genau EIN Aufruf je Ereignis (${out.anCalls}/${out.anSchritte})`);
        check(c.s1LinseFeuert, "SELBST-TEST (S1): _gaitPhaseRate ≡ 0 gestubbt ⇒ 0 Schritte — die Ereignisse hängen an der PHASE, nicht an der Zeit");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — der Fuß spielt den Boden: die Phase taktet · das Material klingt · die Landung wiegt den Fall" : "❌ ROT — der Schritt-Klang trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
