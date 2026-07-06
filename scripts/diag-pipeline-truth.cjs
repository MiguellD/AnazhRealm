// DIE PIPELINE-WAHRHEIT — nur ZAHLEN, kein Rendern (Schöpfer „wo ist die pipeline, es scheint nicht zu
// klappen, das wetter"). Der swiftshader-Container haengt an AnazhRealms echtem WebGPU-Welt-Render → der
// LOOK braucht die echte GPU. Aber ob die Pipeline WIRKT, beweist eine ZAHL: fliesst der Studio-Welt-Kanal
// (Boden/Himmel)? traegt der Boden Geologie (Wiese/Moos/Sand/Fels)? spawnen Felsen? UND: aendert das Wetter
// wirklich die Welt (Wolken/Nebel/Licht) — oder ist es tot? So sehe ich schwarz auf weiss, was wirkt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4527;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
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
    // Null-Renderer? NEIN — dann laedt die Foundry-iframe nicht (_foundryEnabled braucht !isHeadlessNull).
    // Echter swiftshader-Renderer, aber wir RENDERN nie (nur Zahlen) → kein Haenger.
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 200000,
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
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                r._bootWarmDone = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const A = r.constructor;
        const res = {};
        // 1) FLIESST DER STUDIO-WELT-KANAL? (get-world-params)
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && (!f.ready || !r.state.studioWorldParams) && performance.now() - t0 < 30000) await sleep(100);
        res.kanal = {
            foundryReady: !!(f && f.ready),
            worldParamsEmpfangen: !!r.state.studioWorldParams,
            studioGroundGesetzt: !!A._studioGround,
            studioSkyGesetzt: !!A._studioSky,
            rohParams: r.state.studioWorldParams ? Object.keys(r.state.studioWorldParams) : null,
        };
        // 2) TRAEGT DER BODEN GEOLOGIE? TERRAIN_GEOLOGY + MEADOW_GREEN lesen (die Getter, die der Boden-Shader liest)
        const fmt = (a) => (Array.isArray(a) ? a.map((v) => +v.toFixed(3)) : a);
        try {
            const G = A.TERRAIN_GEOLOGY || {};
            res.boden = {
                MEADOW_GREEN: fmt(A.MEADOW_GREEN),
                litTint: fmt(G.litTint || G.lit),
                rock: fmt(G.rock || G.rockTint),
                wet: fmt(G.wet || G.wetTint),
                sand: fmt(G.sand || G.sandTint),
                quelle: A._studioGround ? "STUDIO (live)" : "Fallback (hardcode)",
            };
        } catch (e) {
            res.boden = { err: e.message };
        }
        // 3) SPAWNEN FELSEN? Architektur mit fels/noiserock/stein zaehlen (nah beim Spieler)
        const pm = r.state.playerMesh;
        const px = pm ? pm.position.x : 0,
            pz = pm ? pm.position.z : 0;
        let felsAll = 0,
            felsNah = 0,
            baumAll = 0,
            baumFoundry = 0;
        for (const e of r.state.architectures || []) {
            const sp = ((e._lodSpecies || e.type || "") + "").toLowerCase();
            if (/fels|noiserock|stein|findling|kristall/.test(sp)) {
                felsAll++;
                if (e.position && Math.hypot(e.position.x - px, e.position.z - pz) < 80) felsNah++;
            }
            if (/baum/.test(sp)) {
                baumAll++;
                if (e.instFoundry) baumFoundry++;
            }
        }
        res.felsen = { gesamt: felsAll, nah80m: felsNah, baeume: baumAll, baeumeFoundry: baumFoundry };
        // 4) WIRKT DAS WETTER? WICHTIG: _setWeather startet einen ~45s-CROSS-FADE (weatherTransition.progress);
        // wer sofort die Uniforms liest, misst das ALTE Wetter. Und _applyDayNightToScene rendert die Sky-Env
        // (PMREM) → swiftshader-Haenger. Also REIN RECHNERISCH: Wetter setzen, progress=1 zwingen (Endzustand),
        // dann die EXAKTEN Formeln lesen, die die Uniforms speisen (`_weatherBlendedValue`, Zeile ~75034/75380/79797).
        const wx = {};
        for (const w of ["sunny", "rainy", "stormy"]) {
            try {
                if (typeof r._setWeather === "function") r._setWeather(w);
                if (r.state.weatherTransition) r.state.weatherTransition.progress = 1;
            } catch (_e) {}
            const bv = (a, b) => {
                try {
                    return +r._weatherBlendedValue(a, b).toFixed(3);
                } catch (_e) {
                    return null;
                }
            };
            wx[w] = {
                weather: r.state.weather,
                intensitaet: A.WEATHER_INTENSITY ? A.WEATHER_INTENSITY[w] : null,
                cloudCover: bv(0.12, 0.9), // die Wolken-Deckung (Zeile 75034)
                nebelDichte: bv(0, 1), // der Nebel zieht dichter (Zeile 75380)
                windStaerke: bv(0.12, 0.26), // der Wind blaest kraeftiger (Zeile 79797)
                nass: typeof r._weatherIsWet === "function" ? r._weatherIsWet(w) : null,
            };
        }
        res.wetter = wx;
        const sig = (o) => JSON.stringify([o.cloudCover, o.nebelDichte, o.windStaerke]);
        res.wetterWirkt = {
            sunnyVsRainy: sig(wx.sunny) !== sig(wx.rainy),
            sunnyVsStormy: sig(wx.sunny) !== sig(wx.stormy),
            cloudDelta_sunny_rainy:
                wx.sunny.cloudCover != null && wx.rainy.cloudCover != null
                    ? +(wx.rainy.cloudCover - wx.sunny.cloudCover).toFixed(3)
                    : null,
        };
        // Fliesst Wetter durch den Studio-Kanal? (Erwartung: NEIN — eigenes System)
        res.wetterImKanal = !!(
            r.state.studioWorldParams &&
            (r.state.studioWorldParams.weather || r.state.studioWorldParams.wx || r.state.studioWorldParams.clouds)
        );
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    process.exit(0);
})();
