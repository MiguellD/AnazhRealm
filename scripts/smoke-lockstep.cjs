// LOCKSTEP-MP STUFE 2 — DER ZWEI-BROWSER-BEWEIS (V18.382, `npm run smoke:lockstep`).
// Browser A bewegt sich (skriptgesteuerte Tasten: laufen · drehen · springen); nur seine
// INPUTS reisen übers echte WebRTC-Mesh (seq · yaw · Bitmask). Browser B simuliert A's
// Charakter aus diesem Input-Band durch DENSELBEN deterministischen Schritt-Pfad
// (`_stepCharacter` + `_loopPlayerMovement(FIXED_DT)`, der Ghost-Swap). BEWEIS: A's
// authoritative per-seq-Positionen == B's Ghost-Positionen, seq-aligned, BIT-IDENTISCH
// (beide booten die seed-deterministische Default-Welt → identisches Dichtefeld).
// Plus: der Ghost treibt B's Peer-Avatar (glatt statt 30-Hz-Snaps), pos-Nachrichten sind
// zur Drift-Autorität umgeleitet, kein Ent-Seeden während des Laufs.
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const PAGE_URL = "http://127.0.0.1:4312/index.html";
const SIGNALING_URL = "ws://127.0.0.1:4313";
const ROOM = "smoke-lockstep-room";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function startProc(script, readyRe) {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, script)], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error(`${script} startete nicht innerhalb 6 s`));
        }, 6000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && readyRe.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

async function waitFor(page, evalFn, timeoutMs, label, ...args) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const ok = await page.evaluate(evalFn, ...args).catch(() => false);
        if (ok) return true;
        await sleep(200);
    }
    throw new Error(`Timeout: ${label}`);
}

(async () => {
    const failures = [];
    function check(name, ok, detail = "") {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    console.log("Starte save-server + signaling-server ...");
    const saveServer = await startProc("save-server.js", /läuft/);
    const signaling = await startProc("signaling-server.js", /lauscht/);

    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
            // ZWEI Seiten in EINEM Browser: die Hintergrund-Seite wird sonst gedrosselt
            // (rAF suspendiert, Timer 1 Hz) → Loop/Sim/ICE sterben auf der Nicht-Fokus-Seite.
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
        ],
    });

    try {
        const pageA = await browser.newPage();
        const pageB = await browser.newPage();
        await pageA.setViewport({ width: 800, height: 500 });
        await pageB.setViewport({ width: 800, height: 500 });
        console.log("Lade beide Spielseiten ...");
        await pageA.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await pageB.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await waitFor(
            pageA,
            () => !!window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function",
            60000,
            "Seite A bereit"
        );
        await waitFor(
            pageB,
            () => !!window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function",
            60000,
            "Seite B bereit"
        );
        // Der swiftshader-Render (Sekunden/Frame bei ZWEI Seiten) verhungert den Event-Loop →
        // die WebRTC-ICE-Consent-Keepalives timen aus → der Kanal stirbt (Baseline smoke-webrtc
        // zeigt dasselbe). Dieser Beweis braucht TRANSPORT + DETERMINISMUS, keine Pixel → der
        // Render wird gestubbt (das etablierte Playtest-Muster), der Loop + die Fixed-Sim laufen voll.
        const stubRender = () => {
            const r = window.anazhRealm;
            if (r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
            }
            r.state.postProcessingFailed = true;
        };
        await pageA.evaluate(stubRender);
        await pageB.evaluate(stubRender);
        // Headless-rAF kriecht (~1 Hz) trotz Anti-Throttling-Flags → die Chunks bauen nie.
        // Der Pump treibt den EINEN echten Loop zeit-korrekt weiter (loop(time) rechnet
        // delta aus wall-clock; der Fixed-Akkumulator partitioniert sauber — Doppel-Ticks
        // neben dem rAF sind harmlos). Das etablierte Playtest-Muster, nur kontinuierlich.
        const startPump = () => {
            const r = window.anazhRealm;
            window.__lsPump = setInterval(() => {
                try {
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    /* Boot-Randfälle — der Loop hat seine eigene Error-Boundary */
                }
            }, 16);
        };
        await pageA.evaluate(startPump);
        await pageB.evaluate(startPump);

        const joinRoom = (wsUrl, room) => {
            const r = window.anazhRealm;
            r.state.p2p.url = wsUrl;
            r.state.p2p.roomOverride = room;
            r.state.p2p.enabled = true;
            r.state.p2p.lockstepDebug = true; // Traces AN, bevor Frames fliessen
            r.initP2PSync(null);
            return r.state.p2p.peerId;
        };
        const peerIdA = await pageA.evaluate(joinRoom, SIGNALING_URL, ROOM);
        const peerIdB = await pageB.evaluate(joinRoom, SIGNALING_URL, ROOM);
        console.log(`Seite A peerId=${peerIdA}, Seite B peerId=${peerIdB}`);
        await waitFor(pageA, () => window.anazhRealm.state.p2p.meshActive === true, 30000, "Mesh auf A aktiv");
        await waitFor(pageB, () => window.anazhRealm.state.p2p.meshActive === true, 30000, "Mesh auf B aktiv");
        check("WebRTC-Mesh aktiv (A+B)", true);

        // A settlen lassen (Welt warm + Position stabil — kein Rescue/Fall während des Laufs;
        // Stehen auf der Start-Plattform zählt: Struktur-AABBs sind in beiden Welten identisch).
        await waitFor(
            pageA,
            () => {
                const r = window.anazhRealm;
                return !!(r.state.voxelChunks && r.state.voxelChunks.size >= 9);
            },
            90000,
            "A: Welt warm (≥9 Chunks)"
        );
        await waitFor(
            pageA,
            () => {
                const r = window.anazhRealm;
                const y = r.state.playerMesh.position.y;
                const prev = window.__lsPrevY;
                window.__lsPrevY = y;
                return prev !== undefined && Math.abs(y - prev) < 0.02; // Höhe stabil ≈ gesettelt
            },
            30000,
            "A: Position gesettelt"
        );
        await sleep(1200);

        // A bewegt sich: laufen → drehen → springen → stoppen (echte Tasten-Flags,
        // der echte Loop steppt die Fixed-Sim, die Inputs reisen automatisch).
        console.log("A läuft (Inputs fliessen übers Mesh) ...");
        const startPos = await pageA.evaluate(() => {
            const m = window.anazhRealm.state.playerMesh.position;
            return { x: m.x, y: m.y, z: m.z };
        });
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys.w = true;
        });
        await sleep(1500);
        await pageA.evaluate(() => {
            window.anazhRealm.state.yaw = 0.9; // drehen im Lauf
        });
        await sleep(900);
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys[" "] = true; // Sprung
        });
        await sleep(350);
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys[" "] = false;
        });
        await sleep(900);
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys.w = false;
        });
        await sleep(700);

        // B: der Ghost muss ein ordentliches Stück des Input-Bands verbraucht haben.
        try {
            await waitFor(
                pageB,
                (pidA) => {
                    const e = window.anazhRealm.state.p2p.peers.get(pidA);
                    return !!(e && e.lockstep && e.lockstep.seeded && e.lockstep.doneSeq > 90);
                },
                30000,
                "B: Ghost simuliert A (doneSeq > 90)",
                peerIdA
            );
        } catch (err) {
            // Diagnose-Dump: WO reisst das Band? (A sendet? B puffert? Ghost seeded?)
            const dbgA = await pageA
                .evaluate(() => {
                    const p = window.anazhRealm.state.p2p;
                    return {
                        seq: p._lockstepSeq,
                        outLen: p._lockstepOut ? p._lockstepOut.length : null,
                        lastFlush: p._lockstepLastFlush,
                        meshActive: p.meshActive,
                        rtcPeers: p.rtcPeers ? p.rtcPeers.size : null,
                        traceLen: p._lockstepTrace ? p._lockstepTrace.length : null,
                        lockstep: p.lockstep,
                    };
                })
                .catch((e) => String(e));
            const dbgB = await pageB
                .evaluate((pidA) => {
                    const p = window.anazhRealm.state.p2p;
                    const e = p.peers.get(pidA);
                    const ls = e && e.lockstep;
                    return {
                        hasEntry: !!e,
                        hasLs: !!ls,
                        seeded: ls ? ls.seeded : null,
                        bufStart: ls ? ls.bufStart : null,
                        bufLen: ls ? ls.buf.length : null,
                        doneSeq: ls ? ls.doneSeq : null,
                        anchor: ls ? !!ls.anchor : null,
                        lockstep: p.lockstep,
                        peerKeys: Array.from(p.peers.keys()),
                    };
                }, peerIdA)
                .catch((e) => String(e));
            console.log("  DEBUG A:", JSON.stringify(dbgA));
            console.log("  DEBUG B:", JSON.stringify(dbgB));
            throw err;
        }

        // Die Traces ziehen: A's authoritative per-seq-Positionen vs B's Ghost.
        const traceA = await pageA.evaluate(() => window.anazhRealm.state.p2p._lockstepTrace || []);
        const ghost = await pageB.evaluate((pidA) => {
            const e = window.anazhRealm.state.p2p.peers.get(pidA);
            const ls = e && e.lockstep;
            return ls
                ? {
                      trace: ls.trace || [],
                      seeded: ls.seeded,
                      doneSeq: ls.doneSeq,
                      authFinite: Number.isFinite(ls.authX),
                      entry: { x: e.x, y: e.y, z: e.z },
                      ghostPos: { x: ls.x, y: ls.y, z: ls.z },
                  }
                : null;
        }, peerIdA);
        check(
            "B: Ghost existiert + seeded",
            !!(ghost && ghost.seeded),
            ghost ? `doneSeq=${ghost.doneSeq}` : "kein Ghost"
        );

        const mapA = new Map(traceA.map((p) => [p.q, p]));
        let shared = 0,
            maxD = 0,
            exact = 0;
        for (const g of ghost ? ghost.trace : []) {
            const a = mapA.get(g.q);
            if (!a) continue;
            shared++;
            const d = Math.max(Math.abs(a.x - g.x), Math.abs(a.y - g.y), Math.abs(a.z - g.z));
            if (d > maxD) maxD = d;
            if (d === 0) exact++;
        }
        const endA = traceA.length ? traceA[traceA.length - 1] : null;
        const movedA = endA ? Math.hypot(endA.x - startPos.x, endA.z - startPos.z) : 0;
        console.log(
            `  Trace: ${shared} geteilte seqs · maxΔ=${maxD} · bit-exakt=${exact}/${shared} · A lief ${movedA.toFixed(2)} m`
        );
        check(
            "Vergleich nicht-trivial (A lief > 3 m, > 90 geteilte seqs)",
            movedA > 3 && shared > 90,
            `moved=${movedA.toFixed(2)} shared=${shared}`
        );
        check(
            "LOCKSTEP BIT-TREU: B's Ghost == A's Sim (maxΔ < 1e-9 über alle geteilten seqs)",
            maxD < 1e-9,
            `maxΔ=${maxD}`
        );
        check(
            "pos-Nachrichten zur Drift-Autorität umgeleitet (authX gesetzt) + KEIN Ent-Seeden im Lauf",
            !!(ghost && ghost.authFinite && ghost.seeded),
            ghost ? `auth=${ghost.authFinite}` : ""
        );
        check(
            "B's Peer-Avatar folgt dem Ghost (entry == ghostPos)",
            !!(
                ghost &&
                ghost.entry.x === ghost.ghostPos.x &&
                ghost.entry.y === ghost.ghostPos.y &&
                ghost.entry.z === ghost.ghostPos.z
            )
        );

        // Gegenprobe: Lockstep AUS auf B → pos-Snaps übernehmen wieder (graziöser Fallback).
        await pageB.evaluate((pidA) => {
            const r = window.anazhRealm;
            r.state.p2p.lockstep = false;
            const e = r.state.p2p.peers.get(pidA);
            if (e && e.lockstep) e.lockstep.seeded = false;
        }, peerIdA);
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys.w = true;
        });
        await sleep(900);
        await pageA.evaluate(() => {
            window.anazhRealm.state.keys.w = false;
        });
        const posA = await pageA.evaluate(() => {
            const m = window.anazhRealm.state.playerMesh.position;
            return { x: m.x, z: m.z };
        });
        await sleep(500);
        const fallback = await pageB.evaluate((pidA) => {
            const e = window.anazhRealm.state.p2p.peers.get(pidA);
            return e ? { x: e.x, z: e.z } : null;
        }, peerIdA);
        const fbD = fallback ? Math.hypot(fallback.x - posA.x, fallback.z - posA.z) : Infinity;
        check(
            "Fallback: lockstep=false → pos-Snaps führen wieder (Peer nahe A's Position)",
            fbD < 1.5,
            `Δ=${fbD.toFixed(3)} m`
        );
    } catch (err) {
        console.error("SMOKE-FEHLER:", err && err.message);
        failures.push("harness");
    } finally {
        await browser.close().catch(() => {});
        saveServer.kill();
        signaling.kill();
    }
    console.log(
        failures.length
            ? `\n❌ ${failures.length} Fehler: ${failures.join(", ")}`
            : "\n✅ LOCKSTEP STUFE 2 BEWIESEN: nur Inputs übers Netz, der Fremd-Charakter bit-treu simuliert."
    );
    process.exit(failures.length);
})();
