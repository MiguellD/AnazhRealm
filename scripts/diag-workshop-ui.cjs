// diag-workshop-ui.cjs — verifiziert die Werkstatt-UI-Detail-Lehren (P11-P13 + Step 1) MIT DEM AUGE.
// Ich bin beim UI nicht pixel-blind: der Screenshot rastert DOM/Layout/Kontrast treu.
//
// (Vorher dumpte dieser Diag das #workshop-editor-DOM — der Editor ist seit V17.91 ENTFERNT,
//  der Diag war tot. Jetzt verifiziert er die zwei Fälle, die ein Default-Screenshot NICHT zeigt:)
//   (1) ein EIGENER (geklonter, builtIn:false) Bauplan → die Mach-Zone (Werk-Heading →
//       Signatur → FERTIGEN) + die Synergie/Wachstum-Zeilen (P11-Kontrast auf dunklem Panel).
//   (2) das „?"-Popover BEI HOVER → portaliert nach body, opak, nicht geclippt (P12).
//
//   node scripts/diag-workshop-ui.cjs [save-server.js]
// Schreibt artifacts/wsui-*.png + einen Konsolen-Befund.

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
        // Werkstatt öffnen + einen EIGENEN Bauplan erzeugen (klonen) → das deckt die Mach-Zone
        // (Signatur + FERTIGEN) UND die Synergie/Wachstum-Zeilen auf, die ein built-in NICHT zeigt.
        const info = await page.evaluate(() => {
            const r = window.anazhRealm;
            const tab = document.querySelector('[data-tab="werkstatt"]');
            if (tab) tab.click();
            if (typeof r._workshopEnsurePreview === "function") {
                try {
                    r._workshopEnsurePreview();
                } catch (_e) {
                    /* egal */
                }
            }
            // NICHT schöpfer erzwingen — der NORMAL-Modus (wenige Werkzeuge) ist die echte
            // Spielersicht; so prüfe ich, ob MATERIALIEN·WERKZEUGE·WERK auf EINER Ebene passen.
            // Einen Bauplan mit Parts finden + klonen (Klon = builtIn:false → volle Mach-Zone).
            const src = Object.values(r.state.blueprints).find(
                (b) => b && Array.isArray(b.parts) && b.parts.length > 0
            );
            let cloneName = null;
            if (src) {
                cloneName = "_wsui_clone";
                if (typeof r.cloneBlueprint === "function") r.cloneBlueprint(src.name, cloneName);
                if (typeof r.selectBlueprintForEdit === "function") r.selectBlueprintForEdit(cloneName);
                if (typeof r._workshopRenderStatsPanel === "function") r._workshopRenderStatsPanel();
            }
            const clone = cloneName ? r.state.blueprints[cloneName] : null;
            return {
                srcName: src ? src.name : null,
                cloneBuiltIn: clone ? !!clone.builtIn : null,
                cloneRole: clone && typeof r._displayRole === "function" ? r._displayRole(clone) : null,
                hasWerkHeading: !!document.querySelector("#workshop-action-zone .workshop-werk-heading"),
                hasSigInMachZone: !!document.querySelector("#workshop-action-zone .workshop-sig-row"),
                hasFertigen: !!document.querySelector("#workshop-action-zone .workshop-fertigen"),
                hasSynergy: !!document.querySelector("#workshop-stats-panel .workshop-synergy-row"),
                hasGrowth: !!document.querySelector("#workshop-stats-panel .workshop-growth-row"),
            };
        });
        console.log("Klon-Befund:", JSON.stringify(info, null, 2));
        // WICHTIG: erst die Slide-Transition abwarten (V18.39-Mess-Falle: ohne Wartezeit misst
        // man den Drawer mid-slide off-screen), DANN die Frame-Rects messen.
        await new Promise((r) => setTimeout(r, 700));
        // Frame-Messung (Schöpfer „alle Achsen verfehlt"): wo sitzt der Drawer WIRKLICH?
        const frame = await page.evaluate(() => {
            const dr = document.querySelector('.drawer[data-drawer="werkstatt"]');
            const tb = document.getElementById("topbar");
            const rh = dr && dr.querySelector(".resize-handle");
            const ver = document.querySelector(".version");
            const r = (el) => {
                if (!el) return null;
                const b = el.getBoundingClientRect();
                return {
                    left: Math.round(b.left),
                    top: Math.round(b.top),
                    right: Math.round(b.right),
                    bottom: Math.round(b.bottom),
                    w: Math.round(b.width),
                    h: Math.round(b.height),
                };
            };
            return {
                vw: window.innerWidth,
                vh: window.innerHeight,
                drawer: r(dr),
                drawerInlineStyle: dr ? dr.getAttribute("style") : null,
                topbar: r(tb),
                topbarCoveredByDrawer:
                    dr && tb ? dr.getBoundingClientRect().top < tb.getBoundingClientRect().bottom : null,
                resizeHandle: r(rh),
                versionExists: !!ver,
                versionText: ver ? ver.textContent : null,
            };
        });
        console.log("Frame:", JSON.stringify(frame, null, 2));
        // Der Rahmen wie der Spieler ihn sieht (volles Viewport über der Welt).
        await page.screenshot({ path: path.join(ARTIFACTS, "wsui-frame.png"), fullPage: false });
        console.log("geschrieben: wsui-frame.png (Rahmen im Viewport)");

        // (A) die Ausgabe-Tabelle (P11/P13) — eigener Bauplan, Synergie/Wachstum sichtbar.
        const sp = await page.$("#workshop-stats-panel");
        if (sp) {
            await sp.screenshot({ path: path.join(ARTIFACTS, "wsui-stats-clone.png") });
            console.log("geschrieben: wsui-stats-clone.png (Ausgabe, eigener Bauplan)");
        }
        // (B) die Mach-Zone (Step 1) — Werk-Heading → Signatur → FERTIGEN.
        const az = await page.$("#workshop-side-palette-right");
        if (az) {
            await az.screenshot({ path: path.join(ARTIFACTS, "wsui-machzone-clone.png") });
            console.log("geschrieben: wsui-machzone-clone.png (Mach-Zone, eigener Bauplan)");
        }

        // (C) das „?"-Popover BEI HOVER (P12) — portaliert + opak + nicht geclippt.
        // Der Werkzeuge-„?" sitzt unten rechts (dot-right) → der gefährlichste Clip-Fall.
        const toolDot = await page.$('.drawer[data-drawer="werkstatt"] .help-dot.dot-right');
        if (toolDot) {
            await toolDot.hover();
            await new Promise((r) => setTimeout(r, 350));
            const popState = await page.evaluate(() => {
                const pop = [...document.querySelectorAll(".help-pop.help-pop-open")][0];
                if (!pop) return { open: false };
                const cs = getComputedStyle(pop);
                const rect = pop.getBoundingClientRect();
                return {
                    open: true,
                    parentIsBody: pop.parentElement === document.body,
                    position: cs.position,
                    zIndex: cs.zIndex,
                    inViewport:
                        rect.left >= 0 &&
                        rect.top >= 0 &&
                        rect.right <= window.innerWidth &&
                        rect.bottom <= window.innerHeight,
                    rect: {
                        left: Math.round(rect.left),
                        top: Math.round(rect.top),
                        w: Math.round(rect.width),
                        h: Math.round(rect.height),
                    },
                };
            });
            console.log("Popover (Werkzeuge-?):", JSON.stringify(popState));
            await page.screenshot({ path: path.join(ARTIFACTS, "wsui-help-tool.png"), fullPage: false });
            console.log("geschrieben: wsui-help-tool.png (volles Viewport, Popover offen)");
            // Das Popover DIREKT (Clip aus dem Rect, +Rand) — so SEHE ich, WIE die Hilfe anzeigt:
            // opak? lesbar? schimmert FERTIGEN durch? (Clip funktioniert für fixed-Elemente sicher.)
            if (popState.open && popState.rect && popState.rect.w > 0) {
                const m = 6;
                const rc = popState.rect;
                await page.screenshot({
                    path: path.join(ARTIFACTS, "wsui-help-pop.png"),
                    clip: {
                        x: Math.max(0, rc.left - m),
                        y: Math.max(0, rc.top - m),
                        width: rc.w + 2 * m,
                        height: rc.h + 2 * m,
                    },
                });
                console.log("geschrieben: wsui-help-pop.png (das Popover, geclippt)");
            }
        } else {
            console.log("Werkzeug-? nicht gefunden");
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
