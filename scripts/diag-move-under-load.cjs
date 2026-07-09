#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-move-under-load.cjs — DIE BEWEGUNGS-GARANTIE UNTER LAST (P1, 09.07.2026)
//
// Schöpfer-Befund: ab Sekunde 1 nur ~3–13 FPS, nach 4 Minuten KEINE Bewegung
// möglich. Diese Linse macht die Garantie „die Bewegung verhungert NIE an der
// Last" (V18.282 STREAMING-IST-HEILIG + V18.355 Fixed-Timestep) erstmals
// MESSBAR — Linse VOR Hebel (nervensystem-plan M0). Headless, Null-Renderer,
// foundry-ON (KEIN __anazhGateNoFoundry — der Produktions-Pfad).
//
// DIE 3-FPS-SIMULATION: `_gameLoopTick(t)` wird mit künstlichen 330-ms-Zeit-
// sprüngen getrieben (t += 330 je Tick = die 3-FPS-Realität des Schöpfers).
// Der Fixed-Akkumulator klemmt korrekt auf FIXED_MAX_ACCUM (0,1 s/Frame) →
// die Sim läuft ~0,3× Echtzeit; 60 schwere Ticks = 6 s Sim-Zeit → bei Walk-
// Speed mehrere Meter. Assertiert wird konservativ > 1 m.
//
// DREI GARANTIEN:
//  (a) BEWEGUNG UNTER LAST — W gehalten, 60 × 330-ms-Frames: die Spieler-
//      Position MUSS sich horizontal > 1 m bewegen (der Fixed-Step ist
//      UNCONDITIONAL im Loop; `_frameOverBudget` darf nur Optik drosseln).
//  (b) BEWEGUNG OHNE GEBAUTEN SPIELER-CHUNK — die feld-native Kollision
//      (V18.331) liest das DICHTEFELD (reine Funktion), nie den Chunk-Mesh:
//      auch wenn der Spieler-Chunk NIE ankommt, MUSS die horizontale
//      Bewegung laufen. Simulation: ein GESTALLTER Worker (postMessage
//      verhallt — `voxelWorker=null` wäre falsch, denn null fällt auf den
//      Stufe-3-SYNC-Bau zurück und der Chunk wäre sofort da; der Stall ist
//      die echte „Mesh kommt nicht"-Realität einer erstickten Maschine).
//  (c) DIE BODEN-GARANTIE — der historische 1-s-Sync-Anker
//      `_ensurePlayerChunkBVH` (V18.274) ist seit V18.331 ENTFALLEN (Ammo
//      raus, kein BVH mehr); sein Nachfolger ist der Feld-Controller selbst:
//      während des GANZEN mesh-losen Laufs steckt der Körper NIE im Soliden
//      (`_fieldSolid` an der Körper-Mitte — die V18.329-Mess-Disziplin, NICHT
//      getTerrainHeightAt) und fällt NIE ins Void (y bleibt weit über dem
//      −120-Rescue). Erdung binnen 1 s ⇔ die Füße kleben am Feld ab Tick 1.
//
// --selftest: eine künstlich GEPINNTE Position (jeder Tick zurückgesetzt)
// MUSS Garantie (a) rot machen — beweist, dass die Linse feuert (nicht blind).
//   node scripts/diag-move-under-load.cjs [--selftest]   (npm run gate:move-under-load)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4421;
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
    const SELFTEST = process.argv.includes("--selftest");
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
        window.__anazhHeadlessNullRenderer = true; // GPU-frei; foundry bleibt AN (Produktions-Pfad)
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: die Welt settled pumpen (count-/plateau-basiert, die V18.273-Lehre).
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

        out = await page.evaluate(async (selftest) => {
            const r = window.anazhRealm,
                s = r.state;
            const mesh = s.playerMesh;
            if (!mesh || !s.playerVel) return { error: "kein Spieler" };
            if (typeof r._loopFixedStep !== "function") return { error: "Fixed-Timestep fehlt" };
            const span = r._voxelChunkConfig(0).span;

            // einen settled LAND-Spot finden (deterministisch, über Wasser) — nahe (Szenario a)
            const findLand = (x0, x1, zJit) => {
                for (let i = 0; i < 400; i++) {
                    const x = x0 + ((i * 53) % (x1 - x0));
                    const z = ((i * 31) % 120) - 60 + zJit;
                    const h = r.getTerrainHeightAt(x, z);
                    if (Number.isFinite(h) && r._isAboveWaterAt && r._isAboveWaterAt(x, z)) return { x, y: h + 1.5, z };
                }
                return null;
            };
            const nearSpot = findLand(-40, 40, 0) || { x: 0, y: r.getTerrainHeightAt(0, 0) + 1.5, z: 0 };
            // FERN-Spot (Szenario b): weit außerhalb des gebauten Rings — dort existiert kein Chunk.
            const farSpot = findLand(560, 720, 500) || { x: 600, y: r.getTerrainHeightAt(600, 500) + 1.5, z: 500 };

            const resetSim = (spot) => {
                mesh.position.set(spot.x, spot.y, spot.z);
                s.playerVel.setValue(0, 0, 0);
                s._fieldVy = 0;
                s._fieldWasGrounded = false;
                s._groundedCache = false;
                s.isInAir = false;
                s.isJumping = false;
                s.onSteepSlope = false;
                s._jumpPressedAt = -Infinity;
                s._spaceWasDown = false;
                s.yaw = 0;
                s.keys = { w: true }; // W gehalten (die Walk-Linsen-Simulation)
                s._fixedAccumulator = 0;
                s._fixedSimPos = null;
                s._fixedPrevPos = null;
                s._fixedSimTime = 0;
            };
            const simPos = () => {
                const p = s._fixedSimPos || mesh.position;
                return { x: p.x, y: p.y, z: p.z };
            };

            // DER SCHWERE LAUF: 60 Ticks à 330 ms (3 FPS). pin=true (Selbst-Test) setzt die
            // Position nach jedem Tick zurück — die Linse MUSS das als „keine Bewegung" sehen.
            const heavyRun = (spot, ticks, pin) => {
                resetSim(spot);
                let t = performance.now();
                try {
                    r._gameLoopTick(t); // Baseline-Tick (setzt lastTime im Loop-Closure)
                } catch (_e) {}
                resetSim(spot); // der Baseline-Tick darf die Messung nicht verschieben
                const start = simPos();
                let minY = start.y,
                    clipTicks = 0,
                    overBudgetSeen = false;
                for (let i = 0; i < ticks; i++) {
                    t += 330;
                    try {
                        r._gameLoopTick(t);
                    } catch (_e) {}
                    if (pin) {
                        mesh.position.set(spot.x, spot.y, spot.z);
                        if (s._fixedSimPos) s._fixedSimPos.set(spot.x, spot.y, spot.z);
                        if (s._fixedPrevPos) s._fixedPrevPos.set(spot.x, spot.y, spot.z);
                    }
                    const p = simPos();
                    if (p.y < minY) minY = p.y;
                    // Körper-Mitte im Soliden = geclippt (die V18.329-Disziplin: _fieldSolid,
                    // NICHT getTerrainHeightAt — letzteres lügt am Überhang).
                    if (r._fieldSolid(p.x, p.y + 0.9, p.z)) clipTicks++;
                    if (s._frameOverBudget) overBudgetSeen = true;
                }
                const end = simPos();
                return {
                    movedXZ: Math.hypot(end.x - start.x, end.z - start.z),
                    start,
                    end,
                    minY,
                    clipTicks,
                    overBudgetSeen,
                };
            };

            const o = {};

            // ── (a) BEWEGUNG UNTER LAST (gebaute Welt) ──
            o.a = heavyRun(nearSpot, 60, false);

            // ── SELBST-TEST: gepinnte Position → die Bewegungs-Garantie MUSS rot lesen ──
            if (selftest) o.pinned = heavyRun(nearSpot, 20, true);

            // ── (b)+(c) OHNE GEBAUTEN SPIELER-CHUNK: gestallter Worker + Fern-Teleport ──
            const savedWorker = s.voxelWorker;
            const stalled = { postMessage() {}, terminate() {} }; // schluckt jede Anfrage — der Mesh kommt NIE
            s.voxelWorker = stalled;
            const farKey = `${Math.floor(farSpot.x / span)},${Math.floor(farSpot.z / span)}`;
            // Prämisse sichern: dort steht KEIN Chunk (weit außerhalb des Rings)
            const preEntry = s.voxelChunks ? s.voxelChunks.get(farKey) : null;
            o.premiseNoChunk = !preEntry || !preEntry.mesh;
            o.b = heavyRun(farSpot, 60, false);
            const postEntry = s.voxelChunks ? s.voxelChunks.get(farKey) : null;
            // die Prämisse HIELT über den ganzen Lauf (der Stall wirkte — kein Sync-Leck)
            o.premiseHeld = !postEntry || !postEntry.mesh;
            o.pendingAfter = s.voxelMeshPending ? s.voxelMeshPending.size : 0;
            // WIEDERHERSTELLEN (die Gate-Hook-Lehre: sichern + restaurieren, nie löschen)
            s.voxelWorker = savedWorker;

            o.walkSpeed = s.speed || null;
            return o;
        }, SELFTEST);
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== P1 — DIE BEWEGUNGS-GARANTIE UNTER LAST (330-ms-Frames = 3 FPS) =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const a = out.a,
            b = out.b;
        console.log(
            `  (a) gebaute Welt:   bewegt ${a.movedXZ.toFixed(2)} m horizontal · minY ${a.minY.toFixed(1)} · Clip-Ticks ${a.clipTicks} · overBudget=${a.overBudgetSeen}`
        );
        console.log(
            `  (b) OHNE Chunk-Mesh: bewegt ${b.movedXZ.toFixed(2)} m horizontal · minY ${b.minY.toFixed(1)} · Clip-Ticks ${b.clipTicks} · pending=${out.pendingAfter}\n`
        );
        check(a.movedXZ > 1.0, `(a) BEWEGUNG UNTER LAST: > 1 m über 60 schwere Ticks (${a.movedXZ.toFixed(2)} m)`);
        check(
            a.overBudgetSeen,
            "(a) die Last war ECHT: _frameOverBudget stand während des Laufs (die 330-ms-Frames wirkten)"
        );
        check(
            out.premiseNoChunk && out.premiseHeld,
            "(b) PRÄMISSE: der Spieler-Chunk hatte NIE einen Mesh (Stall hielt)"
        );
        check(
            b.movedXZ > 1.0,
            `(b) BEWEGUNG OHNE CHUNK: die feld-native Kollision trägt die Bewegung mesh-frei (${b.movedXZ.toFixed(2)} m)`
        );
        check(
            b.clipTicks === 0 && b.minY > -60,
            `(c) BODEN-GARANTIE (der V18.331-Nachfolger des BVH-Ankers): nie im Soliden (${b.clipTicks} Clip-Ticks), nie Void (minY ${b.minY.toFixed(1)})`
        );
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
        if (SELFTEST) {
            const p = out.pinned;
            check(
                !!p && p.movedXZ <= 1.0,
                `SELBST-TEST: die gepinnte Position liest als KEINE Bewegung (${p ? p.movedXZ.toFixed(3) : "?"} m ≤ 1 m) — die Linse feuert`
            );
        }
    }
    console.log(
        `\n  ${ok ? "✅ BEWEGUNGS-GARANTIE BEWIESEN" : "❌ DIE BEWEGUNG KLEMMT UNTER LAST — das ist die Schöpfer-Wurzel"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
