// diag-m5-hud.cjs — M5-Mess-Werkzeug (meister-plan §2, Befunde 13–17 + 26):
// misst gegen einen LAUFENDEN save-server (Port 4312): (1) den Chat-Resize-Sprung
// (collapsed 105 px vs Drag-Clamp min 180), (2) die Ich-Emotion-Lesbarkeit (Shot),
// (3) die Boost-Chips (Live-Zählung?), (4) den Hof-Wesen-Mood (Text vs Balken).
//   node scripts/diag-m5-hud.cjs

const path = require("path");
const puppeteer = require("puppeteer");
const ART = path.resolve("artifacts");

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.player) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });

        // (1) RESIZE-SPRUNG: collapsed-Konsole + simulierter 1-px-Drag → springt die Höhe?
        const resize = await page.evaluate(() => {
            const consoleEl = document.getElementById("console");
            const handle = consoleEl && consoleEl.querySelector(".resize-handle");
            if (!consoleEl || !handle) return { missing: true };
            const before = consoleEl.getBoundingClientRect();
            const hr = handle.getBoundingClientRect();
            const mk = (type, x, y) =>
                new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
            handle.dispatchEvent(mk("mousedown", hr.x + 2, hr.y + 2));
            window.dispatchEvent(mk("mousemove", hr.x + 2, hr.y + 1)); // 1 px nach oben
            window.dispatchEvent(mk("mouseup", hr.x + 2, hr.y + 1));
            const after = consoleEl.getBoundingClientRect();
            // aufräumen (kein persistierter Test-Resize)
            consoleEl.style.height = "";
            consoleEl.style.width = "";
            try {
                localStorage.removeItem("anazh.resize.console");
            } catch (_e) {
                /* egal */
            }
            return {
                beforeH: Math.round(before.height),
                afterH: Math.round(after.height),
                sprung: Math.round(after.height - before.height),
            };
        });
        console.log("RESIZE-SPRUNG (1-px-Drag):", JSON.stringify(resize));

        // (2+3) ICH öffnen: Emotionen + Boosts (mit injiziertem Test-Boost) shooten.
        await page.evaluate(() => {
            const r = window.anazhRealm;
            // ein Test-Boost (45 s), damit die Chips sichtbar sind
            r.state.player.boosts = [
                {
                    source: "kristall_geode",
                    label: "Geoden-Segen",
                    tags: { magieleitung: 0.4 },
                    expiresAt: Date.now() + 45000,
                },
            ];
            const tab = document.querySelector('[data-tab="ich"]');
            if (tab) tab.click();
            if (typeof r.renderInventoryUI === "function") r.renderInventoryUI();
            if (typeof r.updateStatusPanel === "function") r.updateStatusPanel(1e9);
        });
        await new Promise((r) => setTimeout(r, 500));
        const ich = await page.evaluate(() => {
            const emo = document.getElementById("status-emotions");
            const chips = [...document.querySelectorAll(".ich-boost-chip")].map((c) => c.textContent);
            const rowCount = emo ? emo.querySelectorAll(".emotion").length : 0;
            const bar = emo && emo.querySelector(".emotion .bar");
            const cs = bar ? getComputedStyle(bar) : null;
            return { rowCount, barBg: cs ? cs.backgroundColor : null, chips };
        });
        console.log("ICH:", JSON.stringify(ich));
        const emoEl = await page.$(".ich-readout");
        try {
            if (emoEl) await emoEl.screenshot({ path: path.join(ART, "m5-ich-readout.png") });
        } catch (_e) {
            await page.screenshot({ path: path.join(ART, "m5-ich-readout.png") });
        }

        // Chips: zählt die Restzeit LIVE? (2 s warten, Text vergleichen — OHNE re-render)
        const chipA = await page.evaluate(() => {
            const c = document.querySelector(".ich-boost-chip");
            return c ? c.textContent : null;
        });
        await new Promise((r) => setTimeout(r, 2200));
        const chipB = await page.evaluate(() => {
            const c = document.querySelector(".ich-boost-chip");
            return c ? c.textContent : null;
        });
        console.log("BOOST-CHIP live?", JSON.stringify({ chipA, chipB, tickt: chipA !== chipB }));

        // (4) HOF: Wesen spawnen + die Karte shooten (Mood = Text oder Balken?)
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const pm = r.state.playerMesh.position;
            r.spawnCreatureAt(pm.x + 3, pm.y, pm.z, "happy", "wesen");
            const tab = document.querySelector('[data-tab="hof"]');
            if (tab) tab.click();
            if (typeof r._renderHofDOM === "function") r._renderHofDOM();
            else if (typeof r.renderCreaturesUI === "function") r.renderCreaturesUI();
        });
        await new Promise((r) => setTimeout(r, 600));
        const hof = await page.evaluate(() => {
            const mood = document.querySelector(".creature-mood");
            return {
                moodText: mood ? mood.textContent : null,
                hatBalken: !!document.querySelector(".hof-emotion-bar"),
            };
        });
        console.log("HOF:", JSON.stringify(hof));
        const hofEl = await page.$(".hof-spec-sheet");
        try {
            if (hofEl) await hofEl.screenshot({ path: path.join(ART, "m5-hof-sheet.png") });
            else await page.screenshot({ path: path.join(ART, "m5-hof-sheet.png") });
        } catch (_e) {
            await page.screenshot({ path: path.join(ART, "m5-hof-sheet.png") });
        }
        console.log("Shots: m5-ich-readout.png · m5-hof-sheet.png");
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
