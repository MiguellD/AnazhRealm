// Diagnose Welle F — der Band-Skip MUSS sign-identisch zum vollen Sample sein
// (Vorzeichen bestimmen die Surface-Nets-Geometrie). Vergleicht für eine NORMALE
// Region UND eine TIEFSEE-Rinne (surf < base-40, wo der V17.96-Band-Boden-Bug
// saß) das band-geskippte Grid gegen ein voll gesampeltes. 0 Sign-Mismatches.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4325,
    root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
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
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto("http://127.0.0.1:" + PORT + "/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const s = performance.now();
        while (performance.now() - s < 15000) {
            const r = window.anazhRealm;
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                if (r.state && r.state.playerMesh) break;
            }
            await new Promise((z) => setTimeout(z, 16));
        }
    });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm,
            base = r.state.terrainBaseHeight || 0;
        const { dim, dimY, step, floorDrop } = r._voxelChunkConfig(0);
        const oy = base - floorDrop;
        const sample = (x, y, z) => r._terrainBaseDensityAt(x, y, z);
        // Eine TIEFSEE-Rinne suchen (surf < base-40).
        let deep = null,
            normal = { ox: 0, oz: 0 };
        for (let d = 200; d <= 5000 && !deep; d += 200) {
            for (let a = 0; a < 6.28 && !deep; a += 0.4) {
                const ox = Math.cos(a) * d,
                    oz = Math.sin(a) * d;
                if (r._terrainMacroSurfaceY(ox + 20, oz + 20) < base - 40) deep = { ox, oz };
            }
        }
        const cmp = (ox, oz) => {
            const Nx = dim + 1,
                Ny = dimY + 1,
                Nz = dim + 1;
            const banded = r._voxelSampleDensityGrid(ox, oy, oz, dim, dimY, dim, step, sample);
            let mism = 0,
                air = 0;
            for (let k = 0; k < Nz; k++)
                for (let j = 0; j < Ny; j++)
                    for (let i = 0; i < Nx; i++) {
                        const full = sample(ox + i * step, oy + j * step, oz + k * step);
                        const b = banded[i + j * Nx + k * Nx * Ny];
                        if (full > 0 !== b > 0) mism++;
                        if (full < 0) air++;
                    }
            return { mism, air };
        };
        const n = cmp(normal.ox, normal.oz);
        const dres = deep ? cmp(deep.ox, deep.oz) : null;
        return {
            normalMism: n.mism,
            deepFound: !!deep,
            deep,
            deepMism: dres ? dres.mism : -1,
            deepSurf: deep ? r._terrainMacroSurfaceY(deep.ox + 20, deep.oz + 20) : null,
        };
    });
    await browser.close();
    server.close();
    console.log("\n===== WELLE F — BAND-SKIP SIGN-KORREKTHEIT =====\n");
    const line = (l, ok, extra) =>
        console.log("  [" + (ok ? "OK" : "XX") + "] " + l + (extra ? "  (" + extra + ")" : ""));
    line(
        "NORMALE Region: Band-Skip sign-identisch zum vollen Sample",
        rep.normalMism === 0,
        rep.normalMism + " Mismatches"
    );
    line(
        "TIEFSEE-Rinne gefunden",
        rep.deepFound,
        rep.deepFound ? "surf=" + rep.deepSurf.toFixed(0) + "m" : "keine bis 5km"
    );
    if (rep.deepFound)
        line(
            "TIEFSEE: Band-Skip sign-identisch (V17.96-Boden-Bug geheilt)",
            rep.deepMism === 0,
            rep.deepMism + " Mismatches"
        );
    const ok = rep.normalMism === 0 && (!rep.deepFound || rep.deepMism === 0);
    console.log(
        "\n  VERDIKT:",
        ok
            ? "GRÜN — der Band-Skip ist überall sign-identisch zum vollen Sample (bit-identische Geometrie)."
            : "ROT — der Band-Skip verfälscht die Geometrie."
    );
    console.log("\n================================================\n");
})();
