// diag-arch-tags.cjs — dumpt die Compound-Tags + Spawn-Affinität der spawnbaren
// Architekturen. Misst die WAHRHEIT (statt zu raten), damit der Affinitäts-
// Wächter (Test) gegen gemessene Baseline-Werte prüft. Kein Warmup nötig —
// computeCompoundTags ist rein, direkt nach Init verfügbar.
//
//   node scripts/diag-arch-tags.cjs <pfad/zu/save-server.js>

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
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
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 8000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const names = [
                "baum_eiche",
                "baum_kiefer",
                "stein_block",
                "kristall_geode",
                "glutbrunnen",
                "felsbogen",
                "felsturm",
            ];
            const AXES = ["lebendig", "dichte", "brennbar", "magieleitung"];
            const out = {};
            for (const n of names) {
                const bp = r.state.blueprints[n];
                if (!bp) {
                    out[n] = "MISSING";
                    continue;
                }
                const tags = r.computeCompoundTags(bp) || {};
                const aff = {};
                for (const a of AXES) aff[a] = Math.round((tags[a] || 0) * 1e4) / 1e4;
                const moveable = typeof r._isMoveable === "function" ? r._isMoveable(bp) : null;
                // Volle Affordanz-Liste (was tut die Architektur?) — broadcasting/
                // moveable/magnifying/radiating/... So sieht man auf einen Blick, ob
                // eine Material-/Geometrie-Änderung eine Affordanz kippt (V17.18).
                const affordances =
                    typeof r.computeBlueprintAffordances === "function" ? r.computeBlueprintAffordances(bp) : null;
                out[n] = {
                    parts: bp.parts.length,
                    instanced: !!bp.instanced,
                    affinityTags: aff,
                    resoniert: Math.round((tags.resoniert || 0) * 1e4) / 1e4,
                    moveable,
                    affordances,
                };
            }
            return out;
        });
        console.log("=== Compound-Affinitäts-Tags (4 Achsen) je spawnbarer Architektur ===");
        console.log(JSON.stringify(dump, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
