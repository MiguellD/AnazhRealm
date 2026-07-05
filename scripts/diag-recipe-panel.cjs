// PRUEFT DIE PIPELINE-SICHTBARKEIT: erscheint in der Werkstatt bei einem gewachsenen Baum der
// REZEPT-REGLER (5 Studio-Slider + Saat-Wuerfel) unter den Farben, und fuettert er die EINE
// geteilte Pipeline live? Ein Dial-Zug + ein Wuerfel MUESSEN die Baum-Geometrie messbar aendern.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4468;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
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
    await page.setViewport({ width: 900, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const D = await page.evaluate(async () => {
        // Warmup (render gestubbt).
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm;
        const s = r.state;
        const out = {};

        // bbox eines Bauplans aus seinen parts (position +/- size/2).
        const bbox = (bp) => {
            let miny = 1e9,
                maxy = -1e9,
                maxr = 0,
                holz = 0,
                laub = 0;
            for (const p of bp.parts || []) {
                const pos = p.position || { x: 0, y: 0, z: 0 },
                    sz = p.size || { x: 0, y: 0, z: 0 };
                const y0 = pos.y - (sz.y || 0) / 2,
                    y1 = pos.y + (sz.y || 0) / 2;
                if (y0 < miny) miny = y0;
                if (y1 > maxy) maxy = y1;
                const rr = Math.hypot(pos.x, pos.z) + Math.max(sz.x || 0, sz.z || 0) / 2;
                if (rr > maxr) maxr = rr;
                if (p.material === "holz") holz++;
                else if (p.material === "laub") laub++;
            }
            return { h: +(maxy - miny).toFixed(2), w: +(maxr * 2).toFixed(2), holz, laub, n: (bp.parts || []).length };
        };

        // 1) Panel erscheint fuer baum_eiche (gewachsener Baum)?
        const ws = r._ensureWorkshopState();
        ws.selectedBlueprint = "baum_eiche";
        const eiche = s.blueprints.baum_eiche;
        r._workshopRenderRecipePanel(eiche);
        const panel = document.getElementById("workshop-recipe-panel");
        const sliders = panel ? panel.querySelectorAll('input[type="range"]') : [];
        const dice = panel ? panel.querySelector(".workshop-recipe-dice") : null;
        const reset = panel ? panel.querySelector(".workshop-recipe-reset") : null;
        out.panel = { sichtbar: !!(panel && !panel.hidden), regler: sliders.length, wuerfel: !!dice, reset: !!reset };

        // 2) Panel VERSTECKT fuer einen Nicht-Baum (z.B. temple)?
        const temple = s.blueprints.temple;
        if (temple) {
            r._workshopRenderRecipePanel(temple);
            out.nichtBaum_versteckt = !!(panel && panel.hidden);
        }

        // 3) DIAL-ZUG aendert die Geometrie? api 0.30 (Laub) -> 0.95 (Nadel-Kegel).
        r._workshopRenderRecipePanel(eiche);
        const base = bbox(eiche);
        const d1 = Object.assign(
            {},
            r._treeRecipeDials("baum_eiche", s.blueprints.baum_eiche._skeleton ? undefined : null) || {},
            r._treeRecipeDials("baum_eiche", null)
        );
        d1.api = 0.95;
        d1.slim = 0.72;
        d1.conifer = true;
        r._workshopRegrowRecipe(eiche, d1, "studio-test-a");
        const conif = bbox(eiche);
        out.dialZug = { basis: base, nach_nadel_api095: conif, geaendert: base.h !== conif.h || base.w !== conif.w };

        // 4) SAAT-WUERFEL wirft eine ANDERE Variante (gleiches Rezept, anderer Same)?
        r._workshopRegrowRecipe(eiche, d1, "studio-seed-1");
        const seedA = bbox(eiche);
        r._workshopRegrowRecipe(eiche, d1, "studio-seed-2");
        const seedB = bbox(eiche);
        out.saatWuerfel = {
            seedA,
            seedB,
            andereGestalt: seedA.h !== seedB.h || seedA.w !== seedB.w || seedA.holz !== seedB.holz,
        };

        // 5) RESET stellt das Vorlagen-Rezept wieder her?
        delete eiche._recipeDials;
        r._workshopRegrowRecipe(eiche, r._treeRecipeDials("baum_eiche", null), "baum_eiche-studio");
        out.reset = bbox(eiche);

        return out;
    });
    console.log(JSON.stringify(D, null, 1));
    const ok =
        D.panel &&
        D.panel.sichtbar &&
        D.panel.regler === 5 &&
        D.panel.wuerfel &&
        D.nichtBaum_versteckt &&
        D.dialZug &&
        D.dialZug.geaendert &&
        D.saatWuerfel &&
        D.saatWuerfel.andereGestalt;
    console.log(
        ok
            ? "\n✅ REZEPT-REGLER PRUEFBAR: Panel + 5 Regler + Wuerfel, Dial+Saat aendern die Geometrie live."
            : "\n❌ Etwas fehlt — siehe oben."
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
