#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-erstarren.cjs — DIE ERSTARREN-LINSE (P0)
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
//   (c) DIE MEMBRAN-RECOMPILE-WAND:
//       ein Tor-Material wird GENAU EINMAL gebaut — den 180-m-Sichtring
//       verlassen + zurückkehren löst KEINEN Neu-Bau aus (vorher: TSL-Bau
//       + Pipeline-Compile je Wieder-Annäherung + Geometrie-Leck), der
//       Registry-Eintrag überlebt die Ferne (nur Fern-Schlaf: visible=false).
//
// SELBST-TEST (immer aktiv): ein injizierter ~300-ms-Busy-Block in einem
// Tick MUSS als Stall gezählt werden — die Uhr misst wirklich.
//   node scripts/diag-erstarren.cjs      (npm run gate:erstarren)
// ─────────────────────────────────────────────────────────────────────────

// Port über ERSTARREN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4427.
const { statikServer, warteAufWelt, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.ERSTARREN_PORT || 4427);
const server = statikServer();

const { errs, check } = pruefer();

(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 }); // GPU-frei; Foundry bleibt AN (Produktions-Pfad)
    page.setDefaultTimeout(280000);
    let out = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);

        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            const res = {};
            if (!s.playerMesh) return { error: "kein Spieler" };

            // ── Settle: die Welt plateau-pumpen ──
            {
                res.settleTicks = await window.__weltStehtNach(() => {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {}
                }); // die Welt steht (welt-boot)
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
                } catch {}
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
                if (i % 50 === 0) await sleep(0);
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
                // D8: das Fenster wartet auf sein Ziel — der erste Frager setzt den Auftrag in Gang (Platte oder die Welt selbst)
                r._torZielZeile(entry);
                const zw = r._torZielWelt(entry);
                const zr = r._torZielAtlas && zw ? r._torZielAtlas.welten.get(zw.world) : null;
                res.ziel = zr
                    ? { zeile: await zr.kommt, quelle: zr.quelle, fehler: zr.fehler }
                    : { fehler: "kein Auftrag" };
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
                // 0910-4: der Schlaf verlässt den Graphen (der Kehraus nimmt die Puffer), das Erwachen kehrt zurück
                const ausGraph = !!(recFern && recFern.mesh && recFern.mesh.parent === null);
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
                    ausGraph,
                    imGraph: !!(recZurueck && recZurueck.mesh && recZurueck.mesh.parent === s.scene),
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
    check(
        "(a) kein Todes-Spiral (Q4 < 3×Q1 + 5-ms-Boden)",
        L.q4 < Math.max(L.q1 * 3, L.q1 + 5),
        `Q1 ${L.q1} → Q4 ${L.q4}`
    );
    check(
        "(b) kein hartes Erstarren (kein Tick > 2 s, < 5 % > 250 ms)",
        L.max < 2000 && L.anteil < 0.05,
        `max ${L.max} ms · ${(L.anteil * 100).toFixed(1)} %`
    );
    const M = out.membran || {};
    const Zi = out.ziel || {};
    check(
        "(c) das Ziel des Tors steht (Zeile im Atlas der Ziele)",
        Number.isInteger(Zi.zeile),
        `${Zi.quelle || "—"} ${Zi.fehler || ""}`
    );
    check("(c) Membran gebaut (Tor vor dem Spieler)", out.torSpawned && M.gebaut === true);
    check(
        "(c) RECOMPILE-WAND: Sichtring verlassen+zurück = KEIN Neu-Bau, Eintrag überlebt, Fern-Schlaf + Rück-Wachen",
        M.keinRecompile === true && M.eintragUeberlebtFerne === true && M.fernSchlaf === true && M.wachZurueck === true,
        `Bauten ${M.bautenBeimBau}→${M.bautenNachZyklus} · schlaeft=${M.fernSchlaf} · wach=${M.wachZurueck}`
    );
    check(
        "(c) der Schlaf verlässt den Graphen (der Kehraus nimmt die Puffer), das Erwachen kehrt zurück",
        M.ausGraph === true && M.imGraph === true,
        `schlafend außerhalb=${M.ausGraph} · wach im Graphen=${M.imGraph}`
    );
    check(
        "SELBST-TEST: der injizierte 300-ms-Block wurde als Stall gesehen (die Uhr misst)",
        L.selbstTestGesehen === true
    );

    wandEnde(errs, "kein Todes-Spiral, kein hartes Erstarren im headless-Pfad, die Membran kompiliert genau einmal. (Was diese Linse NICHT sieht: GPU-seitige Freezes — dafür trägt der Flugschreiber anazhRealmPerf.json vom echten Holz.)");
})();
