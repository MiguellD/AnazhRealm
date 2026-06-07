// diag-workshop-manip.cjs — misst, warum _workshopBeginManipulation den dragManipulator
// (nicht) setzt: Canvas-Rect, Backing-Store, selectedPartIdx, preview. Reproduziert den
// Playtest-Pfad (clone village → select → setSelection(0) → beginManipulation).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const URL = "http://127.0.0.1:4312/index.html";

function startServer() {
    return new Promise((res, rej) => {
        const p = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        const to = setTimeout(() => rej(new Error("timeout")), 6000);
        p.stdout.on("data", (c) => /läuft/.test(c.toString()) && (clearTimeout(to), res(p)));
        p.on("error", rej);
    });
}
(async () => {
    const server = await startServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 12000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 50));
        });
        for (const mode of ["visible", "forced-hidden"]) {
            const out = await page.evaluate((m) => {
                const r = window.anazhRealm;
                const drawer = document.querySelector('[data-drawer="werkstatt"]');
                if (m === "forced-hidden" && drawer) drawer.hidden = true;
                else if (drawer) {
                    drawer.hidden = false;
                    const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
                    if (tab) tab.click();
                }
                r.cloneBlueprint("village", "diag_test");
                r.selectBlueprintForEdit("diag_test");
                r._workshopSetSelection(0);
                r._workshopEnsurePreview();
                const p = r.state.workshop.preview;
                const canvas = document.getElementById("workshop-preview-canvas");
                const rect = canvas ? canvas.getBoundingClientRect() : null;
                let dragSet = null;
                if (p) {
                    r._workshopBeginManipulation("translate", "x", 100, 100);
                    dragSet = p.dragManipulator !== null;
                    r._workshopEndManipulation && r._workshopEndManipulation();
                }
                r.deleteBlueprint && r.deleteBlueprint("diag_test");
                return {
                    mode: m,
                    previewExists: !!p,
                    selectedPartIdx: r.state.workshop.selectedPartIdx,
                    rectW: rect && Math.round(rect.width),
                    rectH: rect && Math.round(rect.height),
                    canvasW: canvas && canvas.width,
                    canvasH: canvas && canvas.height,
                    dragSet,
                };
            }, mode);
            console.log(JSON.stringify(out));
        }
    } finally {
        await browser.close();
        server.kill();
    }
})();
