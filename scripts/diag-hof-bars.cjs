// diag-hof-bars.cjs — M-B1 (meister-plan W-B): WELCHE CSS-Regel verliert?
// Misst die .hof-spec-sheet .spec-bar-Füllung im ECHTEN Hof-Drawer (offen,
// Wesen fokussiert): Geometrie (offsetWidth) + getComputedStyle der Füllung
// + des Tracks + der Labels. Reine Messung, keine Code-Änderung.
//   node scripts/diag-hof-bars.cjs
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
    await page.setViewport({ width: 1366, height: 768 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
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
        // Der ECHTE UI-Pfad (§8.7 Prozess-Wand): der Hof-Tab wird GEKLICKT.
        await page.click('#topbar .tab[data-tab="kreaturen"]');
        // Die Rects NACH der Slide-Transition messen (V18.39-Falle) — im Headless
        // läuft die CSS-Transition rAF-träge (~1 Hz): POLLEN bis transform ≈ 0.
        await page.evaluate(async () => {
            const d = document.querySelector('.drawer[data-drawer="kreaturen"]');
            const dl = performance.now() + 8000;
            for (;;) {
                const t = window.getComputedStyle(d).transform;
                const tx = t.startsWith("matrix") ? Math.abs(parseFloat(t.split(",")[4])) : 0;
                if (tx < 2 || performance.now() > dl) break;
                await new Promise((r) => setTimeout(r, 120));
            }
        });
        const res = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            const pm = r.state.playerMesh.position;
            const c = r.spawnCreatureAt(pm.x + 4, pm.y, pm.z, "happy", "wesen");
            if (!c) return { fehler: "kein Spawn" };
            c.userData.emotions = { joy: 0.8, sorrow: 0, awe: 0.1, fear: 0, curiosity: 0.2, calm: 0.1 };
            const prof = r._creatureProfile(c);
            r.state.hofFocusId = prof.id;
            if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
            // NUR das Sheet im KREATUREN-Drawer (das Ich-Sheet teilt die Klasse!).
            const sheet = document.querySelector('.drawer[data-drawer="kreaturen"] .hof-spec-sheet');
            if (!sheet) return { fehler: "kein Sheet im Kreaturen-Drawer" };
            out.sheetRect = sheet.getBoundingClientRect().toJSON();
            const bars = sheet.querySelectorAll(".spec-bar");
            out.barCount = bars.length;
            out.bars = [];
            for (const bar of Array.from(bars).slice(0, 4)) {
                const label = bar.querySelector(".spec-bar-label");
                const track = bar.querySelector(".spec-bar-track");
                const fill = bar.querySelector(".spec-bar-fill");
                const gs = (el, p) => (el ? window.getComputedStyle(el).getPropertyValue(p) : "—");
                out.bars.push({
                    label: label ? label.textContent : "—",
                    barDisplay: gs(bar, "display"),
                    barRect: bar.getBoundingClientRect().toJSON(),
                    labelColor: gs(label, "color"),
                    labelFontSize: gs(label, "font-size"),
                    trackW: track ? track.getBoundingClientRect().width : -1,
                    trackBg: gs(track, "background-color"),
                    fillW: fill ? fill.getBoundingClientRect().width : -1,
                    fillStyleWidth: fill ? fill.style.width : "—",
                    fillBg: gs(fill, "background-color"),
                    fillBgImage: gs(fill, "background-image").slice(0, 60),
                    fillDisplay: gs(fill, "display"),
                });
            }
            // Der Drawer-Kontext: ist der Hof-Drawer offen (hidden=false) + im Viewport?
            const drawer = sheet.closest(".drawer");
            out.drawerHidden = drawer ? drawer.hidden : null;
            out.drawerName = drawer ? drawer.getAttribute("data-drawer") : "—";
            out.viewportW = window.innerWidth;
            out.sheetImViewport = sheet.getBoundingClientRect().left < window.innerWidth - 40;
            // Die GANZE Ketten-Geometrie: Drawer → Stage → Spec-Host (wo bricht es raus?).
            const kette = {};
            const probe = (sel) => {
                const el = sel === "drawer" ? drawer : document.querySelector(sel);
                if (!el) return null;
                const cs = window.getComputedStyle(el);
                const rc = el.getBoundingClientRect();
                return {
                    x: Math.round(rc.x),
                    w: Math.round(rc.width),
                    transform: cs.transform,
                    position: cs.position,
                    inlineStyle: el.getAttribute("style") || "",
                };
            };
            kette.drawer = probe("drawer");
            kette.scroll = probe('.drawer[data-drawer="kreaturen"] .drawer-scroll');
            kette.stage = probe('.drawer[data-drawer="kreaturen"] .hof-stage');
            kette.spec = probe("#hof-stage-spec");
            out.kette = kette;
            // Auch: die Emotion-Bar (das M5-Destillat) zum Vergleich.
            const ebar = sheet.querySelector(".hof-emotion-bar");
            out.emotionBar = ebar ? ebar.getBoundingClientRect().toJSON() : null;
            r.removeCreature(c);
            return out;
        });
        console.log(JSON.stringify(res, null, 2));
        // Der Augen-Beweis: der offene Hof mit fokussiertem Wesen als Shot.
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const pm = r.state.playerMesh.position;
            const c = r.spawnCreatureAt(pm.x + 4, pm.y, pm.z, "happy", "wesen");
            if (c) {
                c.userData.emotions = { joy: 0.8, sorrow: 0, awe: 0.1, fear: 0, curiosity: 0.2, calm: 0.1 };
                r.state.hofFocusId = r._creatureProfile(c).id;
                r._renderCreatureListUI();
            }
        });
        await page.screenshot({ path: "artifacts/hof-bars.png" });
        console.log("Shot: artifacts/hof-bars.png");
    } finally {
        await browser.close();
        server.kill();
    }
})();
