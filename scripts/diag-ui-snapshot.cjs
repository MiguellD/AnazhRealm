// diag-ui-snapshot.cjs — dumpt das ECHTE DOM ausgewählter UI-Panels (normalisiert) + Screenshot.
// Der Verifikations-Goldstandard für die UI-Builder-Verdichtung: das outerHTML VOR und NACH
// dem Refactor muss IDENTISCH sein (der _el-Builder erzeugt dasselbe DOM = verhaltensneutral).
//
//   node scripts/diag-ui-snapshot.cjs [save-server.js] [out-label]
//
// Schreibt artifacts/ui-snapshot-<label>.txt (das normalisierte DOM je Panel) + ui-<label>.png.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const LABEL = process.argv[3] || "snap";
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const ARTIFACTS = path.resolve(__dirname, "..", "artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 6000);
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
    if (!fs.existsSync(ARTIFACTS)) fs.mkdirSync(ARTIFACTS, { recursive: true });
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
    await page.setViewport({ width: 1280, height: 900 });
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.player ||
                    !window.anazhRealm.state.player.stats) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            // normalisiert outerHTML: Attribute pro Tag alphabetisch sortiert, damit
            // Attribut-Reihenfolge (Property- vs setAttribute-Setzung) den Vergleich nicht stört.
            const norm = (el) => {
                if (!el) return "(null)";
                const walk = (node, depth) => {
                    if (node.nodeType === 3) {
                        const t = node.textContent.replace(/\s+/g, " ").trim();
                        return t ? "  ".repeat(depth) + "#text:" + t + "\n" : "";
                    }
                    if (node.nodeType !== 1) return "";
                    const attrs = [...node.attributes]
                        .map((a) => `${a.name}=${JSON.stringify(a.value)}`)
                        .sort()
                        .join(" ");
                    let out =
                        "  ".repeat(depth) + "<" + node.tagName.toLowerCase() + (attrs ? " " + attrs : "") + ">\n";
                    for (const ch of node.childNodes) out += walk(ch, depth + 1);
                    return out;
                };
                return walk(el, 0);
            };
            const panels = {};
            // player-stats — renderPlayerStatsUI
            if (typeof r.renderPlayerStatsUI === "function") {
                r.renderPlayerStatsUI();
                panels["player-stats"] = norm(document.getElementById("player-stats"));
            }
            // creature-list — _renderCreatureListUI, mit DETERMINISTISCHER Test-Kreatur
            // (feste userData → byte-Vergleich vor/nach möglich; KEINE boosts, die sind
            // zeit-variabel und würden den Vergleich brechen).
            if (typeof r._renderCreatureListUI === "function" && document.getElementById("creature-list")) {
                const savedCreatures = r.state.creatures;
                try {
                    const fake = {
                        userData: {
                            name: "Prüfwesen",
                            soul: "wesen",
                            hp: 42,
                            equipped: { tool: "spitzhacke", armor: "panzer" },
                            specializations: { "gather:stein": { kind: "gather", key: "stein", level: 3, count: 7 } },
                        },
                    };
                    r.state.creatures = [fake];
                    r._renderCreatureListUI();
                    panels["creature-list"] = norm(document.getElementById("creature-list"));
                } finally {
                    r.state.creatures = savedCreatures;
                }
            }
            return panels;
        });
        let txt = `# UI-Snapshot [${LABEL}]\n`;
        for (const [id, html] of Object.entries(dump)) {
            txt += `\n===== #${id} =====\n${html}`;
        }
        const outPath = path.join(ARTIFACTS, `ui-snapshot-${LABEL}.txt`);
        fs.writeFileSync(outPath, txt);
        await page.screenshot({ path: path.join(ARTIFACTS, `ui-${LABEL}.png`), fullPage: false });
        console.log(`geschrieben: ${outPath}`);
        for (const [id, html] of Object.entries(dump)) {
            console.log(`  #${id}: ${html.split("\n").length} DOM-Zeilen`);
        }
    } finally {
        await browser.close();
        server.kill();
    }
})();
