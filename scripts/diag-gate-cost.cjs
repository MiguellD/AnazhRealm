// diag-gate-cost.cjs — misst, WAS das Headless-Gate verlangsamt.
// Bootet render-gestubbt (wie das Gate), timet repräsentative teure Operationen
// (Avatar-Build via player_soul, Kreatur-Build), liest den JS-Heap pro Schritt
// → trennt „schwerer Build" (CPU) von „Leck" (Heap wächst monoton).
// SKIN_CAP=64 node scripts/diag-gate-cost.cjs  → mit dem Headless-Skin-Res-Cap
// (beweist den Speedup + dass der Cap schon beim Boot-Build greift, via Skin-Verts).
// Gefunden 18.06.2026: der ~270-Teil-Avatar-Isosurface baut bei res 128 ~19 s.
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 10000);
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--no-sandbox", "--disable-setuid-sandbox", "--js-flags=--expose-gc"],
        defaultViewport: { width: 800, height: 600 },
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(240000);
    // Cap VOR dem Laden seeden (wie das echte Gate) → der Boot-Build ist schon gedrosselt.
    const CAP_EARLY = Number(process.env.SKIN_CAP || 0);
    if (CAP_EARLY > 0) await page.evaluateOnNewDocument((c) => (window.__anazhHeadlessSkinResCap = c), CAP_EARLY);
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 20000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await new Promise((r) => setTimeout(r, 80));
        });
        // Render stubben (wie das Gate) + Skin-Res-Cap setzen (der Fix)
        const CAP = Number(process.env.SKIN_CAP || 0);
        await page.evaluate((cap) => {
            const r = window.anazhRealm;
            if (r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
            }
            r.state.postProcessingFailed = true;
            if (cap > 0) r.constructor.__HEADLESS_SKIN_RES_CAP = cap;
        }, CAP);
        const capCheck = await page.evaluate(() => window.anazhRealm.constructor.__HEADLESS_SKIN_RES_CAP | 0);
        console.log(`\n[SKIN_RES_CAP = ${CAP || "aus"}] capRead=${capCheck}`);

        const heap = () => page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1));
        const h0 = await heap();
        console.log(`\nHEAP nach Boot: ${h0} MB`);
        // BOOT-BUILD-CAP-BEWEIS: der Spieler-Avatar baut in init(); bei N=128 hat die Haut
        // ~14k Verts, bei N=64 ~3.5k. Wenig Verts ⇒ der frühe Seed griff schon beim Boot.
        const bootVerts = await page.evaluate(() => {
            const r = window.anazhRealm;
            const m = r.state.playerMesh;
            let sk = null;
            if (m) m.traverse((o) => o && o.isSkinnedMesh && (sk = o));
            const pos = sk && sk.geometry && sk.geometry.getAttribute("position");
            return pos ? pos.count : -1;
        });
        console.log(`Boot-Avatar Skin-Verts: ${bootVerts}  (≈14k = N128 uncapped · ≈3.5k = N64 capped)`);

        // (A) Avatar-Build timen (player_soul human) — der teure Isosurface-Build
        const avTimes = [];
        for (let i = 0; i < 2; i++) {
            const t = await page.evaluate(() => {
                const r = window.anazhRealm;
                const t0 = performance.now();
                try {
                    r.dslRun(["player_soul", "human"]);
                } catch (e) {
                    return { err: e.message };
                }
                return { ms: Math.round(performance.now() - t0) };
            });
            const h = await heap();
            avTimes.push(t.ms);
            console.log(`  Avatar-Build #${i + 1}: ${t.ms != null ? t.ms + " ms" : JSON.stringify(t)} · Heap ${h} MB`);
        }

        // (B) Kreatur-Build timen
        const crTime = await page.evaluate(() => {
            const r = window.anazhRealm;
            const t0 = performance.now();
            let parts = 0;
            try {
                const g = r._buildCreatureGroup ? r._buildCreatureGroup("wesen") : null;
                parts = g && g.children ? g.children.length : 0;
            } catch (e) {
                return { err: e.message };
            }
            return { ms: Math.round(performance.now() - t0), parts };
        });
        console.log(`\n  Kreatur 'wesen' Build: ${crTime.ms != null ? crTime.ms + " ms (" + crTime.parts + " Teile)" : JSON.stringify(crTime)}`);

        // (C) Avatar-Parts-Anzahl (wie komplex ist der Körper jetzt?)
        const avInfo = await page.evaluate(() => {
            const r = window.anazhRealm;
            const soul = r.state.playerSoul || (r.state.blueprints && r.state.blueprints.human);
            const bp = soul && soul.bodyParts ? soul.bodyParts : soul && soul.parts ? soul.parts : null;
            return { bodyParts: bp ? bp.length : -1 };
        });
        console.log(`  Avatar bodyParts-Anzahl: ${avInfo.bodyParts}`);

        const hEnd = await heap();
        console.log(`\nHEAP Ende: ${hEnd} MB (Δ seit Boot: ${hEnd - h0} MB über 6 Avatar-Builds + 1 Kreatur)`);
        const med = avTimes.filter((x) => x != null).sort((a, b) => a - b)[Math.floor(avTimes.length / 2)];
        console.log(`\nMEDIAN Avatar-Build: ${med} ms · (×6 im Gate ≈ ${(med * 6 / 1000).toFixed(1)} s nur für Avatar-Rebuilds)`);
    } catch (e) {
        console.error("FATAL:", e.message);
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(0);
})();
