// diag-spitzhacke-role.cjs — MISST den Schöpfer-Browser-Befund: eine Kopie der Spitzhacke + Schmiede-Hammer
// → bleibt die Rolle „Bauwerk" (Daten-Bug?) oder wird sie tool/armor (dann ist es ein UI-Refresh-Bug)?
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const d = performance.now() + 8000;
            while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) && performance.now() < d)
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            const G = r.state.blueprints["geraet_spitzhacke"];
            out.spitzhacke_parts = G ? G.parts.map((p) => ({ shape: p.shape, material: p.material })) : null;
            out.spitzhacke_roleEmergent = r.computeBlueprintRole(G);
            out.spitzhacke_isBlade = r._isGraspableBladeForm(G);
            out.spitzhacke_pointed = r._blueprintPointedFraction(G);
            out.spitzhacke_visualExtent = r._compoundVisualExtent(G);
            // jetzt: klonen + schmiede-hammer anwenden
            r.cloneBlueprint("geraet_spitzhacke", "_pk");
            if (!r.state.player.tools.includes("schmiede-hammer")) r.state.player.tools.push("schmiede-hammer");
            const prevMode = r.getGameMode();
            if (typeof r.setGameMode === "function") r.setGameMode("schöpfer");
            const C = r.state.blueprints["_pk"];
            out.clone_builtIn = C.builtIn;
            out.clone_roleBeforeOp = r.computeBlueprintRole(C);
            const ap = r.applyOpToPart("_pk", 0, "schmiede-hammer");
            out.applyResult = { ok: ap.ok, reason: ap.reason };
            out.clone_roleAfterOp_data = C.role; // was _refreshBlueprintRoleEmergent gesetzt hat
            out.clone_roleAfterOp_computed = r.computeBlueprintRole(C);
            out.clone_domainAfterOp = r.computeBlueprintDomain(C);
            out.clone_opChains = C.parts.map((p) => (p.opChain || []).map((o) => ({ tool: o.tool, domain: r.state.tools[o.tool] ? r.state.tools[o.tool].domain : "?" })));
            if (typeof r.setGameMode === "function") r.setGameMode(prevMode);
            delete r.state.blueprints["_pk"];
            return out;
        });
        console.log(JSON.stringify(dump, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
