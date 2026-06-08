// diag-ich.cjs — öffnet das „Ich"-Overlay, gibt dem Spieler etwas Geschichte, wartet auf die Selbst-Bühne
// (WebGPU async), screenshottet das ganze Overlay.  node scripts/diag-ich.cjs [save-server.js] → artifacts/ich.png
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
    await page.setViewport({ width: 1440, height: 980, deviceScaleFactor: 2 });
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
        const info = await page.evaluate(() => {
            const r = window.anazhRealm;
            // etwas Emotion + Reise, damit die Felder gefüllt sind
            const e = r.state.player.emotions;
            e.joy = 0.7;
            e.awe = 0.4;
            e.hope = 0.55;
            e.peace = 0.3;
            e.sorrow = 0.15;
            e.chaos = 0.1;
            if (r.state.worldJournal && Array.isArray(r.state.worldJournal.entries)) {
                r.journalAppend("genesis", "Ich erwache in dieser Welt.");
                r.journalAppend("creatures", "Die erste Kreatur regte sich.");
                r.journalAppend("architecture", "Das erste Bauwerk entstand: Turm.");
                r.journalAppend("weather", "Der erste Regen begann.");
            }
            // ein paar Items + Hotbar-Belegung, damit Inventar + Hotbar gefüllt sichtbar sind
            if (Array.isArray(r.state.player.inventory)) {
                r.state.player.inventory[0] = { blueprintName: "kristall_geode", count: 3 };
                r.state.player.inventory[1] = { blueprintName: "baum_eiche", count: 5 };
                r.state.player.inventory[2] = { blueprintName: "stein_block", count: 12 };
            }
            r.toggleInventoryOverlay(true);
            const spec = document.getElementById("ich-stage-spec");
            const emo = document.getElementById("status-emotions");
            return {
                overlayOpen: !document.getElementById("inventory-overlay").hasAttribute("hidden"),
                stageCanvas: !!document.getElementById("ich-stage-canvas"),
                specSheets: spec ? spec.querySelectorAll(".spec-sheet").length : -1,
                specBars: spec ? spec.querySelectorAll(".spec-body .spec-bar").length : -1,
                emotionRows: emo ? emo.querySelectorAll(".emotion").length : -1,
                reiseRows: document.querySelectorAll("#ich-reise .ich-reise-row").length,
                habe: !!document.querySelector(".ich-readout #inventory-equip"),
                soul: r.state.player.soul,
            };
        });
        console.log("Ich:", JSON.stringify(info));
        await new Promise((r) => setTimeout(r, 1000));
        const st = await page.evaluate(() => {
            const s = window.anazhRealm.state.ichStage;
            return { stageReady: !!(s && s.rendererReady), stageHasPivot: !!(s && s.pivot) };
        });
        console.log("Bühne:", JSON.stringify(st));
        await new Promise((r) => setTimeout(r, 500));
        const el = await page.$("#inventory-overlay");
        if (el) {
            await el.screenshot({ path: path.join(ARTIFACTS, "ich.png") });
            console.log("geschrieben: ich.png");
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
