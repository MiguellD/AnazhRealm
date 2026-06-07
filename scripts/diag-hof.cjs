// diag-hof.cjs — spawnt Wesen, öffnet den Hof, screenshottet die Wesen-Liste mit inline-Befehlen.
//   node scripts/diag-hof.cjs [save-server.js]  → artifacts/hof-creatures.png

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
        const info = await page.evaluate(() => {
            const r = window.anazhRealm;
            const tab = document.querySelector('[data-tab="kreaturen"]');
            if (tab) tab.click();
            const p = r.state.player;
            const px = p.position ? p.position.x : 0,
                py = p.position ? p.position.y : 0,
                pz = p.position ? p.position.z : 0;
            ["sprite", "wesen", "geist"].forEach((s, i) => {
                if (typeof r.spawnCreatureAt === "function") r.spawnCreatureAt(px + 3 + i, py, pz + 3, "happy", s);
            });
            // einer auf follow setzen → der aktive Knopf hebt sich ab
            if (r.state.creatures[0] && typeof r.assignCreatureTask === "function")
                r.assignCreatureTask(r.state.creatures[0], "follow_player");
            r._renderCreatureListUI();
            // Hof-D — das ZWEITE Wesen fokussieren → die volle Spec-Card (Natur/Werte/Wachstum) klappt auf.
            if (r.state.creatures[1] && typeof r._toggleHofFocus === "function") {
                const prof = r._creatureProfile(r.state.creatures[1]);
                r._toggleHofFocus(prof.id);
            }
            const list = document.getElementById("creature-list");
            const row = list && list.querySelector(".creature-row");
            return {
                creatures: r.state.creatures.length,
                rows: list ? list.querySelectorAll(".creature-row").length : 0,
                inlineBtns: row ? row.querySelectorAll(".creature-action-btn").length : 0,
                moodGlyphs: list ? list.querySelectorAll(".creature-mood").length : 0,
                detailCards: list ? list.querySelectorAll(".creature-detail").length : 0,
                detailBars: list ? list.querySelectorAll(".creature-detail .spec-bar").length : 0,
                auftraegeGone: !document.getElementById("creature-task-actions"),
            };
        });
        console.log("Hof:", JSON.stringify(info));
        await new Promise((r) => setTimeout(r, 400));
        const focusState = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Re-Fokus auf ein LEBENDES Wesen (die Welt churnt Fauna — das Fokus-Wesen kann despawnen).
            if (r.state.creatures[1]) {
                const prof = r._creatureProfile(r.state.creatures[1]);
                r.state.hofFocusId = prof.id;
                r._renderCreatureListUI();
            }
            const list = document.getElementById("creature-list");
            return {
                hofFocusId: r.state.hofFocusId || null,
                detailCards: list ? list.querySelectorAll(".creature-detail").length : -1,
                detailBars: list ? list.querySelectorAll(".creature-detail .spec-bar").length : -1,
            };
        });
        console.log("vor Screenshot:", JSON.stringify(focusState));
        const list = await page.$("#creature-list");
        if (list) {
            await list.screenshot({ path: path.join(ARTIFACTS, "hof-creatures.png") });
            console.log("geschrieben: hof-creatures.png");
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
