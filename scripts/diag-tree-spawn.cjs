// diag-tree-spawn.cjs — A/B-Reproducer für die V17.16-Baum-Spawn-Regression.
//
// Der Playtest-Warmup schluckt per-Tick-Fehler STILL (playtest.cjs Z32861-66:
// `try { _gameLoopTick() } catch(_e) {}`) — der Kommentar "pageerror fängt ihn
// auf" ist FALSCH für synchron gefangene Fehler. Darum war der V17.16-Wurf
// unsichtbar (n=0 ohne erkennbaren Grund). Dieser Reproducer pumpt den Game-
// Loop, fängt den Fehler AN der Aufrufstelle (msg+stack+frame), und zählt die
// Worldgen-Bäume + alle Architektur-Typen.
//
// Aufruf:
//   node scripts/diag-tree-spawn.cjs <pfad/zu/save-server.js> [sekunden]
//   (PROJECT_ROOT = save-server __dirname → serviert genau jenen Baum)

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const SECONDS = Number(process.argv[3] || 15);
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.stderr.on("data", (c) => process.stderr.write("[srv] " + c));
        proc.on("error", reject);
    });
}

(async () => {
    console.log(`=== diag-tree-spawn — server=${SERVER_JS} budget=${SECONDS}s ===`);
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const pageErrors = [];
    const consoleErrs = [];
    page.on("pageerror", (err) => pageErrors.push({ text: err.message, stack: err.stack }));
    page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
            consoleErrs.push({ type: msg.type(), text: msg.text() });
        }
    });
    page.on("requestfailed", (req) =>
        consoleErrs.push({ type: "requestfailed", text: req.url() + " :: " + (req.failure()?.errorText || "") })
    );

    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Auf den Game-Loop warten (Init dauert 200-1500 ms im Headless).
        await page.evaluate(async () => {
            const deadline = performance.now() + 8000;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < deadline
            ) {
                await new Promise((r) => setTimeout(r, 50));
            }
        });

        // Pumpen — wie der Playtest-Warmup, ABER den per-Tick-Fehler SAMMELN
        // (msg+stack+frame), statt ihn still zu schlucken.
        const budgetMs = SECONDS * 1000;
        const tickErrors = [];
        let totalTicks = 0;
        const startReal = Date.now();
        while (Date.now() - startReal < budgetMs) {
            const batch = await page.evaluate((TICKS) => {
                const r = window.anazhRealm;
                if (!r || typeof r._gameLoopTick !== "function") return { ran: 0, errs: [] };
                const errs = [];
                let ran = 0;
                for (let i = 0; i < TICKS; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (e) {
                        errs.push({ msg: String(e && e.message), stack: String(e && e.stack).slice(0, 1200) });
                    }
                    ran++;
                }
                return { ran, errs };
            }, 30);
            totalTicks += batch.ran;
            for (const e of batch.errs) tickErrors.push(e);
            // Yield außerhalb evaluate → Worker-onmessage / Promise-Ketten flushen.
            await new Promise((r) => setTimeout(r, 5));
        }

        // Messung: Architektur-Typen zählen.
        const snap = await page.evaluate(() => {
            const r = window.anazhRealm;
            const archs = Array.isArray(r.state.architectures) ? r.state.architectures : [];
            const typeCounts = {};
            for (const a of archs) if (a) typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
            const trees = (typeCounts.baum_eiche || 0) + (typeCounts.baum_kiefer || 0);
            return {
                version: window.AnazhRealm && window.AnazhRealm.VERSION,
                totalArchs: archs.length,
                typeCounts,
                trees,
                voxelChunks: (r.state.voxelChunks && r.state.voxelChunks.size) || 0,
                pendingVegSpawns: (r.state.pendingVegSpawns && r.state.pendingVegSpawns.length) || 0,
                worldFieldReady: !!r.state.worldField,
                hydroReady: !!(r.state.hydrosphere && r.state.hydrosphere.ready),
            };
        });

        console.log(`\n--- ERGEBNIS (version=${snap.version}, ticks=${totalTicks}) ---`);
        console.log(
            `voxelChunks=${snap.voxelChunks}  pendingVegSpawns=${snap.pendingVegSpawns}  worldFieldReady=${snap.worldFieldReady}  hydroReady=${snap.hydroReady}`
        );
        console.log(`Architektur-Typen: ${JSON.stringify(snap.typeCounts)}`);
        console.log(`>>> WORLDGEN-BÄUME n=${snap.trees}   (Gesamt-Architekturen=${snap.totalArchs})`);

        // Tick-Fehler dedupliziert nach msg.
        const dedup = new Map();
        for (const e of tickErrors) {
            if (!dedup.has(e.msg)) dedup.set(e.msg, { count: 0, stack: e.stack });
            dedup.get(e.msg).count++;
        }
        console.log(`\n--- GEFANGENE TICK-FEHLER (${tickErrors.length} total, ${dedup.size} unique) ---`);
        for (const [msg, info] of dedup) {
            console.log(`\n[${info.count}×] ${msg}`);
            console.log(info.stack);
        }
        if (dedup.size === 0) console.log("(keine)");

        console.log(`\n--- PAGE-ERRORS (${pageErrors.length}) ---`);
        for (const e of pageErrors.slice(0, 8)) console.log(`${e.text}\n${String(e.stack).slice(0, 600)}\n`);

        console.log(`\n--- CONSOLE error/warning (${consoleErrs.length}, erste 15) ---`);
        for (const e of consoleErrs.slice(0, 15)) console.log(`[${e.type}] ${e.text.slice(0, 240)}`);
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    process.exit(1);
});
