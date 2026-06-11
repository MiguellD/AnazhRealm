// diag-m1-connect.cjs — M1-Mess-Werkzeug (meister-plan §2): der Verbindungs-Dialog
// mit dem eigenen Auge (Befund 1: „11 Text-Zeilen, nicht intuitiv"). Öffnet die
// Werkstatt, klont einen 2-Part-Bauplan, öffnet das Connect-Popover, screenshottet
// (VORHER/NACHHER-Vergleich) + dumpt die Struktur (Gruppen/Kacheln/Vorschlag).
//   node scripts/diag-m1-connect.cjs <shot-suffix>

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const ART = path.resolve("artifacts");
const SUFFIX = process.argv[2] || "now";

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
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
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
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 12000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Werkstatt öffnen + einen eigenen 2-Part-Bauplan (eisen+eisen) wählen.
            if (r.state.blueprints.__m1probe) delete r.state.blueprints.__m1probe;
            r.state.blueprints.__m1probe = {
                name: "__m1probe",
                builtIn: false,
                parts: [
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 0, y: 0.5, z: 0 },
                        size: { x: 1, y: 1, z: 1 },
                    },
                    {
                        shape: "box",
                        material: "eisen",
                        position: { x: 1.0, y: 0.5, z: 0 },
                        size: { x: 1, y: 1, z: 1 },
                    },
                ],
            };
            if (typeof r.toggleInventoryUI === "function") r.toggleInventoryUI(true);
            const tab = document.querySelector('[data-tab="werkstatt"]');
            if (tab) tab.click();
            if (typeof r._workshopEnsurePreview === "function") {
                try {
                    r._workshopEnsurePreview();
                } catch (_e) {
                    /* egal */
                }
            }
            r.selectBlueprintForEdit("__m1probe");
            // den Connect-Popover direkt öffnen (der Klick-Klick-Pfad ist getestet).
            r._workshopOpenConnectPopover(0, 1);
            const ov = document.getElementById("workshop-connect-overlay");
            if (!ov) return { ok: false };
            const rect = ov.getBoundingClientRect();
            return {
                ok: true,
                buttons: ov.querySelectorAll("button").length,
                tiles: ov.querySelectorAll(".conn-tile").length,
                groups: [...ov.querySelectorAll(".conn-group-label")].map((g) => g.textContent),
                suggested: [...ov.querySelectorAll(".conn-tile.suggested")].map(
                    (t) => t.getAttribute("data-conn-type") || t.textContent.trim().slice(0, 20)
                ),
                size: { w: Math.round(rect.width), h: Math.round(rect.height) },
                texts: [...ov.querySelectorAll("button")].slice(0, 3).map((b) => b.textContent.trim().slice(0, 60)),
            };
        });
        console.log("DIALOG:", JSON.stringify(dump, null, 2));
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({ path: path.join(ART, `m1-connect-${SUFFIX}.png`) });
        console.log(`Shot: artifacts/m1-connect-${SUFFIX}.png`);
        // Element-Zoom: nur das Overlay (für die Detail-Prüfung mit dem Auge).
        const ov = await page.$("#workshop-connect-overlay");
        if (ov) {
            await ov.screenshot({ path: path.join(ART, `m1-connect-${SUFFIX}-zoom.png`) });
            console.log(`Zoom: artifacts/m1-connect-${SUFFIX}-zoom.png`);
        }
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
