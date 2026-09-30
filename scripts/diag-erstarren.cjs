#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-erstarren.cjs — DIE ERSTARREN-LINSE (P0, Schöpfer-Browser-Befund 14.07.2026)
//
// Schöpfer: „es wird nach einem reset kurz spielbar, aber erstarrt jedes mal".
// Diese Linse macht das Szenario headless messbar — kalter Boot (frisches
// Browser-Profil = leere IDB = die Nach-Reset-Realität), Foundry AN
// (Produktions-Pfad), dann ein WANDER-LAUF: W gehalten, 60-fps-Sim-Zeit,
// jeder `_gameLoopTick` WALL-CLOCK-gemessen, die Tick-Phasen attribuiert
// (Shim um die UNGATED-Ticks + Streaming). Was sie hält:
//
//   (a) KEIN TODES-SPIRAL — das Mittel des letzten Lauf-Viertels bleibt
//       < 3× dem des ersten (+5-ms-Boden gegen Container-Rauschen): die
//       Frame-Kosten wachsen nicht monoton mit der Spielzeit.
//   (b) KEIN HARTES ERSTARREN — nach dem Settle kein einzelner Tick > 2 s
//       und < 5 % der Ticks > 250 ms (Container-GC-Rauschen erlaubt,
//       Freeze-Klassen nicht).
//   (c) DIE MEMBRAN-RECOMPILE-WAND (der V18.469-Fix als stehende Probe):
//       ein Tor-Material wird GENAU EINMAL gebaut — den 180-m-Sichtring
//       verlassen + zurückkehren löst KEINEN Neu-Bau aus (vorher: TSL-Bau
//       + Pipeline-Compile je Wieder-Annäherung + Geometrie-Leck), der
//       Registry-Eintrag überlebt die Ferne (nur Fern-Schlaf: visible=false).
//
// SELBST-TEST (immer aktiv): ein injizierter ~300-ms-Busy-Block in einem
// Tick MUSS als Stall gezählt werden — die Uhr misst wirklich.
//   node scripts/diag-erstarren.cjs      (npm run gate:erstarren)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4427;
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei; Foundry bleibt AN (Produktions-Pfad)
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });

        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            const res = {};
            if (!s.playerMesh) return { error: "kein Spieler" };

            // ── Settle: die Welt plateau-pumpen (V18.273-Lehre) ──
            {
                let lastSize = -1,
                    stable = 0,
                    ticks = 0;
                while (ticks < 3000) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    ticks++;
                    const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                    if (sz === lastSize) stable++;
                    else {
                        stable = 0;
                        lastSize = sz;
                    }
                    if (sz > 20 && stable > 40) break;
                    if (ticks % 10 === 0) await new Promise((res2) => setTimeout(res2, 0));
                }
                res.settleTicks = ticks;
            }

            // ── Phasen-Shim: die UNGATED-Ticks + Streaming wall-clock attribuieren ──
            const PHASEN = [
                "_tickScatterLod",
                "_tickArchitectureLOD",
                "_tickPendingVegSpawns",
                "_tickPortalMembranes",
                "_tickCanopyStreaming",
                "_tickWorldWaterCA",
                "_tickDirtyVoxelChunks",
                "_dispatchFrameJobs",
                "_loopVoxelStreaming",
                "_rebuildArchitectureMesh",
            ];
            const acc = {};
            const orig = {};
            for (const name of PHASEN) {
                if (typeof r[name] !== "function") continue;
                orig[name] = r[name];
                r[name] = function (...a) {
                    const t0 = performance.now();
                    try {
                        return orig[name].apply(this, a);
                    } finally {
                        acc[name] = (acc[name] || 0) + (performance.now() - t0);
                    }
                };
            }
            // Membran-Bau-Zähler (die Recompile-Wand liest ihn)
            let membranBauten = 0;
            const origMat = r._membranMaterialFor;
            r._membranMaterialFor = function (...a) {
                membranBauten++;
                return origMat.apply(this, a);
            };

            // ── (a)+(b) DER WANDER-LAUF: W gehalten, 60-fps-Sim, Kreis-Kurs ──
            s.keys = { w: true };
            const N = 2400; // 40 s Sim-Zeit ≈ 160 m Weg
            const STALL_MS = 250;
            let t = performance.now();
            const wall = new Float64Array(N);
            const stalls = [];
            let selbstTestTick = -1,
                selbstTestGesehen = false;
            for (let i = 0; i < N; i++) {
                if (i % 600 === 599) s.yaw = (s.yaw || 0) + Math.PI / 2; // Kreis-Kurs: bleibt in der Welt
                t += 33.4;
                for (const k of Object.keys(acc)) acc[k] = 0;
                const w0 = performance.now();
                // SELBST-TEST: ein injizierter Busy-Block MUSS als Stall lesen.
                if (i === 1200) {
                    selbstTestTick = i;
                    const bis = performance.now() + 300;
                    while (performance.now() < bis) {
                        /* busy */
                    }
                }
                try {
                    r._gameLoopTick(t);
                } catch (_e) {}
                const w = performance.now() - w0;
                wall[i] = w;
                if (w > STALL_MS) {
                    if (i === selbstTestTick) selbstTestGesehen = true;
                    else {
                        const top = Object.entries(acc)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([k, v]) => `${k}:${v.toFixed(0)}ms`);
                        if (stalls.length < 12) stalls.push({ i, ms: Math.round(w), top });
                    }
                }
                if (i % 50 === 0) await new Promise((res2) => setTimeout(res2, 0));
            }
            const quart = (a, b) => {
                let sum = 0;
                for (let i = a; i < b; i++) sum += wall[i];
                return sum / (b - a);
            };
            const q1 = quart(0, N >> 2);
            const q4 = quart(N - (N >> 2), N);
            let max = 0,
                ueber = 0;
            for (let i = 0; i < N; i++) {
                if (i === selbstTestTick) continue;
                if (wall[i] > max) max = wall[i];
                if (wall[i] > STALL_MS) ueber++;
            }
            res.lauf = {
                n: N,
                q1: +q1.toFixed(2),
                q4: +q4.toFixed(2),
                max: Math.round(max),
                ueber250: ueber,
                anteil: +(ueber / N).toFixed(4),
                stalls,
                selbstTestGesehen,
            };

            // ── (c) DIE MEMBRAN-RECOMPILE-WAND ──
            const p = s.playerMesh.position;
            const heim = { x: p.x, y: p.y, z: p.z };
            const entry = r.spawnArchitecture("welt_portal", { x: p.x + 10, y: p.y, z: p.z }, { precise: true });
            res.torSpawned = !!entry;
            if (entry) {
                // Bau-Tick (Scan-Fenster 1 Hz — zwei Ticks mit > 1 s Abstand)
                r._tickPortalMembranes(9001.0);
                r._tickPortalMembranes(9002.5);
                const reg = r._portalMembranes;
                const vorher = membranBauten;
                const rec0 = reg ? reg.get(entry.id) : null;
                // 250 m fort (jenseits SICHT=180) → Scan + Frame-Pass
                p.x = heim.x + 250;
                r._tickPortalMembranes(9004.0);
                const recFern = reg ? reg.get(entry.id) : null;
                const schlaeft = !!(recFern && recFern.mesh && recFern.mesh.visible === false);
                // zurück → Scan + Frame-Pass
                p.x = heim.x;
                r._tickPortalMembranes(9006.0);
                const recZurueck = reg ? reg.get(entry.id) : null;
                res.membran = {
                    gebaut: !!(rec0 && rec0.mesh),
                    bautenBeimBau: vorher,
                    eintragUeberlebtFerne: !!recFern,
                    fernSchlaf: schlaeft,
                    wachZurueck: !!(recZurueck && recZurueck.mesh && recZurueck.mesh.visible === true),
                    bautenNachZyklus: membranBauten,
                    keinRecompile: membranBauten === vorher,
                };
            }

            // Shims restaurieren (Gate-Hook-Lehre: sichern + restaurieren)
            for (const name of Object.keys(orig)) r[name] = orig[name];
            r._membranMaterialFor = origMat;
            return res;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== P0 — DIE ERSTARREN-LINSE (kalter Boot · Wander-Lauf · Membran-Wand) =====\n");
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const L = out.lauf;
    console.log(
        `  Lauf: ${L.n} Ticks · Q1-Mittel ${L.q1} ms · Q4-Mittel ${L.q4} ms · max ${L.max} ms · >250 ms: ${L.ueber250} (${(L.anteil * 100).toFixed(1)} %)`
    );
    for (const st of L.stalls) console.log(`    Stall @${st.i}: ${st.ms} ms — ${st.top.join(" · ")}`);
    check("(a) kein Todes-Spiral (Q4 < 3×Q1 + 5-ms-Boden)", L.q4 < Math.max(L.q1 * 3, L.q1 + 5), `Q1 ${L.q1} → Q4 ${L.q4}`);
    check("(b) kein hartes Erstarren (kein Tick > 2 s, < 5 % > 250 ms)", L.max < 2000 && L.anteil < 0.05, `max ${L.max} ms · ${(L.anteil * 100).toFixed(1)} %`);
    const M = out.membran || {};
    check("(c) Membran gebaut (Tor vor dem Spieler)", out.torSpawned && M.gebaut === true);
    check(
        "(c) RECOMPILE-WAND: Sichtring verlassen+zurück = KEIN Neu-Bau, Eintrag überlebt, Fern-Schlaf + Rück-Wachen",
        M.keinRecompile === true && M.eintragUeberlebtFerne === true && M.fernSchlaf === true && M.wachZurueck === true,
        `Bauten ${M.bautenBeimBau}→${M.bautenNachZyklus} · schlaeft=${M.fernSchlaf} · wach=${M.wachZurueck}`
    );
    check("SELBST-TEST: der injizierte 300-ms-Block wurde als Stall gesehen (die Uhr misst)", L.selbstTestGesehen === true);
    check("kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — kein Todes-Spiral, kein hartes Erstarren im headless-Pfad, die Membran kompiliert genau einmal. (Was diese Linse NICHT sieht: GPU-seitige Freezes — dafür trägt der Flugschreiber anazhRealmPerf.json vom echten Holz.)"
    );
})();
