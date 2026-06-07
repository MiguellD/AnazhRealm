// diag-workshop-frame.cjs — misst den Werkstatt-RAHMEN + den KLON-Zustand holistisch:
// Frame links/rechts/unten vs Header, Viewer-/Paletten-Höhen, Lücke Viewer→Ausgabe.
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const URL = "http://127.0.0.1:4312/index.html";
const ART = path.resolve(__dirname, "..", "artifacts");
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
        await page.setViewport({ width: 1600, height: 900 });
        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 12000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 50));
        });
        // Öffnen + Klonen ZUERST, dann die Drawer-Transition (0.32s) abwarten — sonst misst man
        // den Drawer MID-SLIDE (translateX 110%, off-screen) → falscher Überlauf (V18.39-Lehre).
        await page.evaluate(() => {
            const r = window.anazhRealm;
            document.querySelector('#topbar [data-tab="werkstatt"]').click();
            r.cloneBlueprint("village", "diag_frame");
            r.selectBlueprintForEdit("diag_frame");
        });
        await new Promise((r) => setTimeout(r, 700));
        const out = await page.evaluate(() => {
            const vw = window.innerWidth,
                vh = window.innerHeight;
            const rect = (sel) => {
                const e = document.querySelector(sel);
                if (!e) return null;
                const b = e.getBoundingClientRect();
                return {
                    l: Math.round(b.left),
                    r: Math.round(vw - b.right),
                    t: Math.round(b.top),
                    bot: Math.round(vh - b.bottom),
                    w: Math.round(b.width),
                    h: Math.round(b.height),
                };
            };
            // Überlauf-Diagnose: welche Elemente ragen rechts über den Viewport?
            const overflow = [];
            for (const e of document.querySelectorAll(".drawer[data-drawer='werkstatt'] *")) {
                const b = e.getBoundingClientRect();
                if (b.right > vw + 2 && b.width > 0)
                    overflow.push(
                        `${e.id || e.className || e.tagName}: right=${Math.round(b.right)} w=${Math.round(b.width)}`
                    );
            }
            return {
                vw,
                vh,
                bodyScrollW: document.body.scrollWidth,
                docScrollW: document.documentElement.scrollWidth,
                overflowElems: overflow.slice(0, 8),
                topbar: rect("#topbar"),
                drawer: rect('.drawer[data-drawer="werkstatt"]'),
                viewer: rect("#workshop-preview-canvas"),
                leftPal: rect("#workshop-side-palette"),
                rightPal: rect("#workshop-side-palette-right"),
                wrapper: rect("#workshop-preview-wrapper"),
                stats: rect("#workshop-stats-panel"),
            };
        });
        console.log(JSON.stringify(out, null, 1));
        // gap viewer-wrapper bottom -> stats top
        if (out.wrapper && out.stats)
            console.log("gap wrapper→stats:", out.stats.t - (out.wrapper.t + out.wrapper.h), "px");
        await page.screenshot({ path: path.join(ART, "room-werkstatt-cloned.png") });
        console.log("geschrieben: artifacts/room-werkstatt-cloned.png (KLON-Zustand, Werkzeuge sichtbar)");
        await page.evaluate(() => window.anazhRealm.deleteBlueprint && window.anazhRealm.deleteBlueprint("diag_frame"));
    } finally {
        await browser.close();
        server.kill();
    }
})();
