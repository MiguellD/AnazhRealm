// diag-workshop-render.cjs — MISST, was der Werkstatt-Readout WIRKLICH rendert für die Spitzhacke +
// die Esse: die Rolle-Chip-Texte, die Affordanz-Chips (vergrößernd/strahlend), die Fähigkeit-Zeile.
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
            const renderFor = (name) => {
                const ws = r._ensureWorkshopState();
                ws.selectedBlueprint = name;
                r._workshopRenderStatsPanel();
                const panel = document.getElementById("workshop-stats-panel");
                if (!panel) return { error: "no panel" };
                const o = { displayRole: r._displayRole(r.state.blueprints[name]), emergent: r.computeBlueprintRole(r.state.blueprints[name]) };
                o.roleChip = (panel.querySelector(".role-chip") || {}).textContent || "(none)";
                o.affordanceChips = Array.from(panel.querySelectorAll(".affordance-chip:not(.capability-chip)")).map((c) => c.textContent);
                o.capabilityChips = Array.from(panel.querySelectorAll(".capability-chip")).map((c) => c.textContent);
                // alle stat-label → text Paare
                o.rows = Array.from(panel.querySelectorAll(".stat-row")).map((row) => {
                    const lab = (row.querySelector(".stat-label") || {}).textContent || "?";
                    const rest = Array.from(row.children).filter((c) => !c.classList.contains("stat-label")).map((c) => c.textContent).join(" | ");
                    return `${lab}: ${rest}`;
                });
                return o;
            };
            out.spitzhacke = renderFor("geraet_spitzhacke");
            out.schwert = r.state.blueprints["geraet_schwert"] ? renderFor("geraet_schwert") : "(schwert fehlt)";
            out.esse = r.state.blueprints["esse"] ? renderFor("esse") : "(esse fehlt)";
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
