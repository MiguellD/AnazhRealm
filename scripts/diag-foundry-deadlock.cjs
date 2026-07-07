// diag-foundry-deadlock.cjs — P4-BEWEIS: die Deadlock-Heilung. Unter erzwungenem ÜBER-Budget
// konvergieren die NAHEN Foundry-Bäume von KALT zu platziert (instFoundry) — vorher (bakeBudget=0
// über Budget) blieben sie ewig kalt = die kahle Nähe. Der Worker (P3a) bäckt off-thread, deshalb
// darf über Budget gebacken werden. Misst die Konvergenz mit einer Zahl.
//   node scripts/diag-foundry-deadlock.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.DEADLOCK_PORT || 4581);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
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
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true; // die Foundry im Gate-Kontext an (die echte Pipeline)
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });

    const S = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { ready: false, coldBefore: 0, foundryBefore: 0, foundryAfter: 0, ticks: 0, err: null };
        const isTree = (e) =>
            e && e.position && typeof r._foundryPresetForEntry === "function" && !!r._foundryPresetForEntry(e);
        try {
            // Foundry-Worker hochfahren + warten.
            const f = r._ensureAssetFoundry();
            const dl = performance.now() + 60000;
            while (f && !f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
            out.ready = !!(f && f.ready);
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }

            // Die Welt streamen lassen, damit Baum-Architekturen entstehen (als KALTE Foundry-Einträge).
            for (let i = 0; i < 120; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 0));
            }

            const archs = () => (Array.isArray(r.state.architectures) ? r.state.architectures : []);
            const cold = () => archs().filter((e) => isTree(e) && !e.instanced && !e.mesh).length;
            const foundry = () => archs().filter((e) => isTree(e) && e.instFoundry).length;
            out.coldBefore = cold();
            out.foundryBefore = foundry();

            // JETZT: ÜBER-Budget erzwingen + den Konvert-Tick pumpen. Vor der Heilung (bakeBudget=0)
            // würde KEIN kalter Baum konvergieren; mit der Heilung (bakeBudget=2) konvergieren sie.
            for (let i = 0; i < 400; i++) {
                r.state._frameOverBudget = true; // Dauer-Last simulieren
                r.state._frameChunksBuilt = false; // das terrain-first-Gate offen halten
                try {
                    r._foundryRewarmColdTrees();
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 0)); // dem Worker die Message-Runde geben
                out.ticks++;
            }
            out.foundryAfter = foundry();
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });

    await browser.close();
    server.close();

    console.log("=== P4 — DEADLOCK-HEILUNG (Konvergenz der Nähe unter ÜBER-Budget) ===");
    console.log(`  Worker ready: ${S.ready}`);
    console.log(`  Baum-Einträge kalt (vorher): ${S.coldBefore} · schon foundry: ${S.foundryBefore}`);
    console.log(`  nach ${S.ticks} Konvert-Ticks @ over-budget: foundry-platziert = ${S.foundryAfter}`);
    if (S.err) console.log(`  Fehler: ${S.err}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    const converged = S.foundryAfter - S.foundryBefore;
    const ok = S.ready && converged > 0;
    if (!ok) {
        console.error(
            `\n❌ ROT — unter Über-Budget konvergierte NICHTS (Δ=${converged}) → der Deadlock lebt (oder keine Baum-Einträge).`
        );
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — unter Dauer-Über-Budget konvergierten +${converged} Nah-Bäume von KALT zu Foundry (vorher: bakeBudget=0 → 0). Der Deadlock ist geheilt.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("Deadlock-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
