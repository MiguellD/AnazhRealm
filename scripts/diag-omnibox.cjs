// diag-omnibox.cjs — öffnet die Omnibox (Ctrl/Cmd+K), tippt Queries + screenshottet sie.
// Ich bin beim UI nicht pixel-blind — der Screenshot rastert das Overlay treu.
//   node scripts/diag-omnibox.cjs [save-server.js]  → artifacts/omnibox-*.png

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
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
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.player) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const shoot = async (query, name) => {
            await page.evaluate((q) => {
                const r = window.anazhRealm;
                if (r._omniboxOpen) r._omniboxOpen();
                const input = document.getElementById("omnibox-input");
                if (input) {
                    input.value = q;
                    r._omniboxUpdate(q);
                }
            }, query);
            await new Promise((r) => setTimeout(r, 250));
            const info = await page.evaluate(() => {
                const list = document.getElementById("omnibox-results");
                return {
                    open: !document.getElementById("omnibox-overlay").hidden,
                    count: list ? list.querySelectorAll(".omnibox-item").length : 0,
                    first:
                        list && list.querySelector(".omnibox-item")
                            ? list.querySelector(".omnibox-item").textContent.trim()
                            : "—",
                };
            });
            console.log(`„${query}" → open=${info.open} treffer=${info.count} erster=[${info.first}]`);
            const panel = await page.$("#omnibox-panel");
            if (panel) await panel.screenshot({ path: path.join(ARTIFACTS, `omnibox-${name}.png`) });
            console.log(`geschrieben: omnibox-${name}.png`);
        };
        await shoot("", "leer");
        await shoot("c:baue", "cmd");
        await shoot("w:", "waffe");
        await shoot("geh:", "raum");
        await shoot("mach es nacht", "nexus");
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
