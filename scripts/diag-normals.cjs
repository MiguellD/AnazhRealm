// Diagnose D — die Trapeze. Misst die Surface-Nets-Normalen-QUALITÄT: (1) ob
// der F-Band-Skip (Konstant-Füllung ±1) die Gradienten-Normalen verzerrt
// (Vergleich band-skip vs voll gesampelt → Winkel-Differenz), (2) wie viele
// Vertices die „default-up"-Fallback-Normale bekommen (len<1e-6 → reagieren
// alle gleich auf Licht = Trapeze), (3) die Normalen-Varianz.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4327,
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
            { dim, step, span, dimY, floorDrop } = r._voxelChunkConfig(0);
        const base = r.state.terrainBaseHeight || 0,
            oy = base - floorDrop;
        // Einen nahen, nicht-leeren Chunk wählen.
        let cx = 0,
            cz = 0;
        const ox = cx * span,
            oz = cz * span;
        const fullSample = (x, y, z) => r._terrainBaseDensityAt(x, y, z);
        // (A) Band-Skip-Grid (das echte) + (B) volles Grid.
        const Nx = dim + 1,
            Ny = dimY + 1,
            Nz = dim + 1;
        const banded = r._voxelSampleDensityGrid(ox, oy, oz, dim, dimY, dim, step, fullSample);
        const full = new Float32Array(Nx * Ny * Nz);
        for (let k = 0; k < Nz; k++)
            for (let j = 0; j < Ny; j++)
                for (let i = 0; i < Nx; i++)
                    full[i + j * Nx + k * Nx * Ny] = fullSample(ox + i * step, oy + j * step, oz + k * step);
        // Surface-Vertices aus dem Band-Grid extrahieren.
        const { positions } = r._voxelExtractSurfaceVertices(banded, ox, oy, oz, dim, dimY, dim, step);
        const mkGrid = (d) => ({ density: d, ox, oy, oz, step, Nx, Ny, Nz });
        const nB = r._voxelGradientNormals(positions, fullSample, step, mkGrid(banded));
        const nF = r._voxelGradientNormals(positions, fullSample, step, mkGrid(full));
        let maxAng = 0,
            meanAng = 0,
            defaultUp = 0,
            n = 0,
            nyFlat = 0;
        const RAD = 180 / Math.PI;
        for (let v = 0; v < positions.length; v += 3) {
            const bx = nB[v],
                by = nB[v + 1],
                bz = nB[v + 2],
                fx = nF[v],
                fy = nF[v + 1],
                fz = nF[v + 2];
            const dot = Math.max(-1, Math.min(1, bx * fx + by * fy + bz * fz));
            const ang = Math.acos(dot) * RAD;
            maxAng = Math.max(maxAng, ang);
            meanAng += ang;
            if (Math.abs(bx) < 1e-5 && Math.abs(by - 1) < 1e-5 && Math.abs(bz) < 1e-5) defaultUp++;
            if (by > 0.985) nyFlat++; // fast senkrecht-up = „reagiert kaum auf Seitenlicht"
            n++;
        }
        return {
            vertexCount: n,
            bandSkipVsFull_maxAngleDeg: +maxAng.toFixed(2),
            bandSkipVsFull_meanAngleDeg: +(meanAng / Math.max(1, n)).toFixed(3),
            defaultUpFrac: +(defaultUp / Math.max(1, n)).toFixed(3),
            nearlyFlatUpFrac: +(nyFlat / Math.max(1, n)).toFixed(3),
        };
    });
    await browser.close();
    server.close();
    console.log("\n===== DIAGNOSE D — SURFACE-NETS-NORMALEN =====\n");
    console.log("  Surface-Vertices:", rep.vertexCount);
    const line = (l, ok, extra) =>
        console.log("  [" + (ok ? "OK" : "!!") + "] " + l + (extra ? "  (" + extra + ")" : ""));
    line(
        "F-Band-Skip verzerrt die Normalen NICHT (vs voll gesampelt)",
        rep.bandSkipVsFull_maxAngleDeg < 1.0,
        "max " + rep.bandSkipVsFull_maxAngleDeg + "deg, mean " + rep.bandSkipVsFull_meanAngleDeg + "deg"
    );
    console.log("  default-up-Fallback (len<1e-6, reagieren alle gleich):", (rep.defaultUpFrac * 100).toFixed(1) + "%");
    console.log(
        "  fast-senkrecht-up (ny>0.985, kaum Seitenlicht-Reaktion):",
        (rep.nearlyFlatUpFrac * 100).toFixed(1) + "%"
    );
    console.log("\n  DEUTUNG: maxAngle gross → F verzerrt Normalen (mein Regress);");
    console.log("  default-up/flat-up hoch → grosse Flächen reagieren gleich = Trapeze.");
    console.log("\n==============================================\n");
})();
