// diag-room.cjs — öffnet EINEN UI-Raum (Tab/Inventar) + screenshottet ihn für die
// Design-Analyse (Symmetrie/Balance/Einheit). Die UI rastert headless TREU.
//
//   node scripts/diag-room.cjs <save-server.js> <raum>
//   raum: welt|kreaturen|spieler|werkstatt|bibliothek|einstellungen  (spieler -> Inventar)
//
// Schreibt artifacts/room-<raum>.png.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const ROOM = process.argv[3] || "welt";
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
    await page.setViewport({ width: 1440, height: 900 });
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
        const containerSel = await page.evaluate((room) => {
            const r = window.anazhRealm;
            const tab = document.querySelector(`[data-tab="${room}"]`);
            if (tab) tab.click();
            // Den Werkstatt-Vorschau-Loop + die Render-Methoden anstoßen, damit der Raum
            // gefüllt ist (sonst leere Panels beim ersten Frame).
            if (room === "werkstatt" && typeof r._workshopEnsurePreview === "function") {
                try {
                    r._workshopEnsurePreview();
                } catch (_e) {
                    /* egal */
                }
            }
            // Welchen Container screenshotten wir? Ich -> das zentrierte Inventar-Overlay,
            // sonst der gerade offene Seiten-Drawer (Drawer tragen data-drawer, kein id).
            if (room === "spieler") return "#inventory-overlay";
            const dr = document.querySelector(".drawer:not([hidden])");
            const dn = dr && dr.getAttribute("data-drawer");
            return dn ? `.drawer[data-drawer="${dn}"]` : null;
        }, ROOM);
        await new Promise((r) => setTimeout(r, 1200));
        const handle = containerSel ? await page.$(containerSel) : null;
        // (1) Das ECHTE Bild — wie der Spieler es sieht, mit allen 60vh-Kappungen +
        // inneren Scrolls (für das Balance-Urteil: sind die Spalten gleich hoch?).
        const outReal = path.join(ARTIFACTS, `room-${ROOM}.png`);
        if (handle) await handle.screenshot({ path: outReal });
        else await page.screenshot({ path: outReal, fullPage: false });
        // (2) Das VOLLE Bild — der Tipp des Schöpfers: nichts unter der Falz übersehen. Alle
        // inneren Scroll-Behälter aufklappen, dann ein Element-Screenshot über die ganze Höhe.
        if (handle) {
            await page.evaluate((sel) => {
                const root = document.querySelector(sel);
                if (!root) return;
                for (const el of [root, ...root.querySelectorAll("*")]) {
                    const cs = getComputedStyle(el);
                    if (/(auto|scroll)/.test(cs.overflowY) || /(auto|scroll)/.test(cs.overflow)) {
                        el.style.maxHeight = "none";
                        el.style.overflow = "visible";
                    }
                }
                root.style.maxHeight = "none";
            }, containerSel);
            await new Promise((r) => setTimeout(r, 250));
            await handle.screenshot({ path: path.join(ARTIFACTS, `room-${ROOM}-full.png`) });
        }
        console.log(`geschrieben: artifacts/room-${ROOM}.png (echt) + room-${ROOM}-full.png (voll, ${containerSel})`);
    } finally {
        await browser.close();
        server.kill();
    }
})();
