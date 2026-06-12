// diag-hud-overlap.cjs — der SPIEL-Zustand (kein Drawer): alle sichtbaren
// HUD-Elemente + paarweise Überlappungs-Messung (der Schöpfer: „dinge überschneiden").
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
    await page.setViewport({ width: 1600, height: 900 });
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 15000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.playerMesh) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            // SPIEL-Zustand: kein Drawer offen.
            const r = window.anazhRealm;
            if (typeof r.closeAllDrawers === "function") r.closeAllDrawers();
            const sel = [
                "#console",
                "#statusbar",
                "#topbar",
                "#stats-hud",
                ".hotbar",
                "#hotbar",
                "#chat-feed",
                "#offhand-slot",
                "#emotion-vignette",
                "#emotion-label",
            ];
            const els = [];
            for (const s of sel) {
                for (const el of document.querySelectorAll(s)) {
                    const rect = el.getBoundingClientRect();
                    const cs = getComputedStyle(el);
                    if (rect.width < 2 || rect.height < 2 || cs.display === "none" || cs.visibility === "hidden")
                        continue;
                    els.push({
                        sel: s,
                        id: el.id || el.className.split(" ")[0],
                        x: Math.round(rect.x),
                        y: Math.round(rect.y),
                        w: Math.round(rect.width),
                        h: Math.round(rect.height),
                    });
                }
            }
            // paarweise Überlappung
            const overlaps = [];
            for (let i = 0; i < els.length; i++)
                for (let j = i + 1; j < els.length; j++) {
                    const a = els[i],
                        b = els[j];
                    const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
                    const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
                    if (ox > 4 && oy > 4) overlaps.push(`${a.id} × ${b.id}: ${ox}×${oy}px`);
                }
            return { els, overlaps };
        });
        console.log("HUD-ELEMENTE:", JSON.stringify(out.els, null, 1));
        console.log("ÜBERLAPPUNGEN:", JSON.stringify(out.overlaps, null, 1));
        await page.screenshot({ path: path.join("artifacts", "hud-spielzustand.png") });
        console.log("Shot: artifacts/hud-spielzustand.png");
    } finally {
        await browser.close();
        server.kill();
    }
})();
