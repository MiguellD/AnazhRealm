// V8.01 Wave-6.B-Verifikations-Screenshots: Werkstatt-Drawer in zwei
// Größen (default + resized), mit eigenem Bauplan + selektiertem Part
// → Gizmo sichtbar. Prüft visuell: Resize-Handle bleibt in der Ecke,
// 3D-Vorschau skaliert mit Drawer-Breite, Background bleibt fest bei
// langem scrollbaren Inhalt.

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const TAG = process.argv[2] || "wave6b";
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
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
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });

        // Intro überspringen: localStorage-Flag VOR Page-Load setzen.
        // Trick: erst auf about:blank gehen, dann localStorage setzen,
        // dann reload.
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(() => {
            localStorage.setItem("anazh.ui.skipIntro", "true");
        });
        await page.reload({ waitUntil: "domcontentloaded" });
        await new Promise((r) => setTimeout(r, 8000));
        // Falls noch ein offenes Intro-Dialog drüberliegt, manuell schließen.
        await page.evaluate(() => {
            const dlg = document.getElementById("intro-dialog");
            if (dlg && typeof dlg.close === "function") dlg.close();
        });

        const shot = async (name) => {
            await new Promise((r) => setTimeout(r, 600));
            const filename = path.join(ARTIFACT_DIR, `${TAG}-${name}.png`);
            await page.screenshot({ path: filename, fullPage: false });
            console.log(`Screenshot: ${filename}`);
        };

        // Szene 1: Werkstatt-Drawer Default-Größe, Built-in (village) gewählt.
        // Read-only Banner + Mode-Bar disabled sichtbar.
        await page.evaluate(() => {
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            const r = window.anazhRealm;
            r.selectBlueprintForEdit("village");
        });
        await shot("01-builtin-readonly");

        // Szene 2: Werkstatt mit eigenem Bauplan + Gizmo sichtbar (Part 0 gewählt).
        await page.evaluate(() => {
            const r = window.anazhRealm;
            // Alten Klon-Test entfernen falls da
            if (r.state.blueprints["mein-test"]) r.deleteBlueprint("mein-test");
            r.cloneBlueprint("village", "mein-test");
            r.selectBlueprintForEdit("mein-test");
            r._workshopSetSelection(0);
        });
        await shot("02-custom-with-gizmo");

        // Szene 3: Werkstatt resized auf 600×800 (Schöpfer-Wunsch:
        // größere 3D-Vorschau). Canvas-Auto-Resize über ResizeObserver
        // sollte das mitziehen.
        const diag = await page.evaluate(() => {
            const werkstatt = document.querySelector('[data-drawer="werkstatt"]');
            if (!werkstatt) return { error: "no werkstatt" };
            werkstatt.style.width = "600px";
            werkstatt.style.height = "800px";
            werkstatt.style.maxHeight = "none";
            const rect = werkstatt.getBoundingClientRect();
            const canvas = document.getElementById("workshop-preview-canvas");
            const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
            return {
                drawerRect: { w: rect.width, h: rect.height, x: rect.x, y: rect.y },
                canvasRect: canvasRect
                    ? { w: canvasRect.width, h: canvasRect.height, x: canvasRect.x, y: canvasRect.y }
                    : null,
                canvasIntW: canvas ? canvas.width : null,
                canvasIntH: canvas ? canvas.height : null,
            };
        });
        console.log("DIAG resize:", JSON.stringify(diag));
        await new Promise((r) => setTimeout(r, 1500)); // ResizeObserver triggern lassen
        await shot("03-resized-large");

        // Szene 4: Lange Bauplan-Liste scrollen — Background + Resize-Handle
        // sollten am Container FEST bleiben.
        await page.evaluate(() => {
            const scroll = document.querySelector('[data-drawer="werkstatt"] .drawer-scroll');
            if (scroll) scroll.scrollTop = 400;
        });
        await shot("04-scrolled-bg-fixed");

        // Szene 5: Rotate-Modus aktiv (E-Taste-Äquivalent)
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.setWorkshopManipulatorMode("rotate");
        });
        await shot("05-rotate-mode");

        // Szene 6: Scale-Modus
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.setWorkshopManipulatorMode("scale");
        });
        await shot("06-scale-mode");

        // Szene 7: Shape-Palette sichtbar im Werkstatt — Phase 3a UI
        await page.evaluate(() => {
            const werkstatt = document.querySelector('[data-drawer="werkstatt"]');
            if (werkstatt) {
                werkstatt.style.width = "";
                werkstatt.style.height = "";
                werkstatt.style.maxHeight = "";
            }
            const r = window.anazhRealm;
            r.setWorkshopManipulatorMode("translate");
            // Scroll runter zur Shape-Palette
            const scroll = document.querySelector('[data-drawer="werkstatt"] .drawer-scroll');
            if (scroll) scroll.scrollTop = 350;
        });
        await shot("07-shape-palette");

        // Szene 8: Phase 3b — Connect-Modus mit gerendetem Popover.
        // Sammelt 2 Part-Klicks → Popover öffnet sich mit Connection-Types.
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.setWorkshopManipulatorMode("connect");
            // Klick auf Part 0 + Part 1 simulieren via _workshopHandleConnectClick
            r._workshopHandleConnectClick(0);
            r._workshopHandleConnectClick(1);
            // Scroll zurück nach oben damit Popover sichtbar ist
            const scroll = document.querySelector('[data-drawer="werkstatt"] .drawer-scroll');
            if (scroll) scroll.scrollTop = 0;
        });
        await shot("08-connect-popover");
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((err) => {
    console.error("Screenshot crash:", err);
    process.exit(1);
});
