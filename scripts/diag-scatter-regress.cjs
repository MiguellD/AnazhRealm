// diag-scatter-regress.cjs — V18.224 Regress-Jagd: warum fehlt _variantIndex an
// grown-Blueprints nach Scatter-Last? Misst die ECHTEN Werte (CLAUDE.md „die
// Zahl führt"). node scripts/diag-scatter-regress.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");

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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 25000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.playerMesh) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 100));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const o = {};
            r._ensureVariantSeedPool();
            // 1) Fresh build via _growTreeBlueprintForSpawn (kein Scatter gelaufen)
            const k1 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
            const bp1 = k1 && r.state.blueprints[k1];
            o.k1 = k1;
            o.bp1_variantIndex = bp1 ? bp1._variantIndex : "NO-BP";
            o.bp1_grownSeed = bp1 ? bp1._grownSeed : "NO-BP";
            // 2) Jetzt Scatter eine Region laufen lassen (wie im Warmup)
            const pp = { x: 3000, y: 50, z: 3000 };
            r._scatterRegion(Math.floor(pp.x / 256), Math.floor(pp.z / 256), pp);
            // 3) Nochmal dieselbe Eiche-Variante abfragen (Cache-Hit nach Scatter)
            const k2 = r._growTreeBlueprintForSpawn("baum_eiche", "test-region-A-0");
            const bp2 = k2 && r.state.blueprints[k2];
            o.k2 = k2;
            o.bp2_variantIndex = bp2 ? bp2._variantIndex : "NO-BP";
            // 4) Ein Scatter-gebauter Eiche-Key direkt prüfen
            //    (scatter nutzt _buildVariantLODs)
            const keys = r._buildVariantLODs("baum_eiche", 3);
            const bpV = keys && r.state.blueprints[keys[0]];
            o.buildVariantLOD0Key = keys ? keys[0] : null;
            o.bpV_variantIndex = bpV ? bpV._variantIndex : "NO-BP";
            o.bpV_lodLevel = bpV ? bpV._lodLevel : "NO-BP";
            // 5) Ring-Größe + Eviction-Status
            o.ringSize = r._growTreeRing ? r._growTreeRing.length : -1;
            o.blueprintCount = Object.keys(r.state.blueprints).length;
            o.grownCount = Object.keys(r.state.blueprints).filter((k) => k.startsWith("grown_")).length;
            // 6) Restore-Pfad-Probe: setzt _loadStateRestoreGrownBlueprints _variantIndex?
            o.restoreSrcHasVariantIndex = /_variantIndex/.test(r._loadStateRestoreGrownBlueprints.toString());
            return o;
        });
        console.log(JSON.stringify(out, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})();
