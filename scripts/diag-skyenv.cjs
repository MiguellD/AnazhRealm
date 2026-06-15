// diag-skyenv.cjs — Ω-OPSIS §7 (wahreranblick §8): die Sky-Env-Map-MECHANIK.
// BEWEIS (headless-fähig): scene.environment wird gesetzt (PBR-Metalle reflektieren
// den Himmel statt schwarz) — ohne Page-Error. Der LOOK selbst ist AUGEN-bound (Wand 1).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => /läuft/.test(c.toString()) && !ready && ((ready = true), clearTimeout(to), resolve(proc)));
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => (pageErr = e.message));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        // auf rendererReady warten + ein paar Frames pumpen (PMREM braucht den init'd Renderer)
        await page.evaluate(async () => {
            const d = performance.now() + 25000;
            while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.rendererReady) && performance.now() < d)
                await new Promise((r) => setTimeout(r, 100));
        });
        await new Promise((r) => setTimeout(r, 1500));
        const res = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const out = { rendererReady: !!st.rendererReady, hasPMREM: typeof THREE.PMREMGenerator === "function" };
            // den Env-Aufbau erzwingen (force) + den Zustand lesen
            out.ensured = typeof r._ensureSkyEnvironment === "function" ? r._ensureSkyEnvironment(true) : "no-method";
            out.envSet = !!(st.scene && st.scene.environment);
            out.envFailed = !!st._skyEnvFailed;
            out.envIsTexture = !!(st.scene && st.scene.environment && st.scene.environment.isTexture);
            return out;
        });
        console.log("\n=== Ω-OPSIS §7 — Sky-Env-Map-Mechanik (PBR-Metalle nicht mehr schwarz) ===");
        console.log("  rendererReady     :", res.rendererReady);
        console.log("  PMREMGenerator da :", res.hasPMREM);
        console.log("  _ensureSkyEnv()   :", res.ensured);
        console.log("  scene.environment :", res.envSet, res.envIsTexture ? "(Texture)" : "");
        console.log("  env-Fehlschlag    :", res.envFailed);
        console.log("  page-error        :", pageErr || "(keiner)");
        const ok = res.rendererReady && res.envSet && res.envIsTexture && !res.envFailed && !pageErr;
        console.log("\n  → " + (ok ? "OK — die Mechanik steht (LOOK = Schöpfer-Browser, Wand 1)" : "PRÜFEN — Mechanik nicht bestätigt"));
    } finally {
        await browser.close();
        server.kill();
    }
})();
