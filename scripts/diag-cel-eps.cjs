// Diagnose J4 — die Trapeze (Cel-Netz). MISST, welche Gradient-Normalen-eps die
// cel-relevante LICHT-Rauheit (wie schnell dot(N,L) über die Oberfläche springt)
// glättet. Mechanismus (gemessen, nicht geraten): die Surface-Roughness ist
// noise3D(x*0.05)*7 (λ~20 m) + noise3D(x*0.018)*5 (λ~55 m). eps=1.5 Zellen
// (~2.7 m) sampelt INNERHALB der 20-m-Beule → liest ihre Mikro-Neigung → das
// Cel quantisiert sie in feine Bänder (Trapeze). Ein grösseres eps liest die
// MAKRO-Neigung → grosse, gleichmässig licht-reaktive Cel-Regionen wie in 2.5D.
// Diese Sonde rechnet die Normalen auf einem regulären xz-Gitter für mehrere
// eps neu + misst die mittlere Nachbar-zu-Nachbar-|Δ dot(N,L)| (= Cel-Band-
// Feinheit; niedrig = grosse glatte Regionen) UND die Makro-Spanne (= bleibt der
// Berg/die Klippe sichtbar? darf NICHT auf 0 fallen).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4330,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
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
            { step } = r._voxelChunkConfig(0);
        const sample = (x, y, z) => r._terrainBaseDensityAt(x, y, z);
        // Sonnen-Richtung (Mittag-nah, seitlich) — wie das Spiel lit rechnet.
        const sun = (() => {
            const a = Math.PI * 0.32; // ~Vormittag
            const x = Math.cos(a),
                y = Math.sin(a),
                z = Math.sin(a * 0.5) * 0.4;
            const l = Math.hypot(x, y, z);
            return { x: x / l, y: y / l, z: z / l };
        })();
        // Reguläres xz-Gitter über eine 96-m-Region; Oberflächen-y pro Spalte.
        const N = 48,
            spanM = 96,
            gx0 = -spanM / 2,
            gz0 = -spanM / 2,
            d = spanM / (N - 1);
        const surfY = (x, z) => {
            // grob die Oberfläche finden (d wechselt Vorzeichen von + unten zu - oben)
            let lo = (r.state.terrainBaseHeight || 0) - 40,
                hi = (r.state.terrainBaseHeight || 0) + 80;
            // erst ein grober Scan, dann Bisektion
            let prev = sample(x, lo, z),
                cy = lo;
            for (let y = lo + 1; y <= hi; y += 1) {
                const cur = sample(x, y, z);
                if (prev > 0 && cur <= 0) {
                    cy = y - prev / (cur - prev); // lineare Iso
                    return cy;
                }
                prev = cur;
            }
            return null;
        };
        const normAt = (x, y, z, eps) => {
            const gx = sample(x + eps, y, z) - sample(x - eps, y, z);
            const gy = sample(x, y + eps, z) - sample(x, y - eps, z);
            const gz = sample(x, y, z + eps) - sample(x, y, z - eps);
            const L = Math.hypot(gx, gy, gz) || 1e-6;
            return { x: -gx / L, y: -gy / L, z: -gz / L };
        };
        // Oberflächen-y-Feld einmal berechnen.
        const ys = new Float32Array(N * N);
        for (let k = 0; k < N; k++)
            for (let i = 0; i < N; i++) {
                ys[i + k * N] = surfY(gx0 + i * d, gz0 + k * d);
            }
        const epsCells = [1.5, 3, 4.5, 6, 8];
        const out = [];
        for (const ec of epsCells) {
            const eps = step * ec;
            // lit-Feld
            const lit = new Float32Array(N * N);
            let valid = new Uint8Array(N * N);
            for (let k = 0; k < N; k++)
                for (let i = 0; i < N; i++) {
                    const yy = ys[i + k * N];
                    if (yy == null || !isFinite(yy)) continue;
                    const nrm = normAt(gx0 + i * d, yy, gz0 + k * d, eps);
                    // half-lambert wie MeshToon: dot*0.5+0.5
                    const dt = nrm.x * sun.x + nrm.y * sun.y + nrm.z * sun.z;
                    lit[i + k * N] = Math.max(0, Math.min(1, dt * 0.5 + 0.5));
                    valid[i + k * N] = 1;
                }
            // Nachbar-|Δlit| (Cel-Band-Feinheit) + globale Spanne (Makro-Relief).
            let sumLocal = 0,
                cnt = 0,
                mn = 1,
                mx = 0;
            for (let k = 0; k < N; k++)
                for (let i = 0; i < N; i++) {
                    if (!valid[i + k * N]) continue;
                    const v = lit[i + k * N];
                    mn = Math.min(mn, v);
                    mx = Math.max(mx, v);
                    if (i + 1 < N && valid[i + 1 + k * N]) {
                        sumLocal += Math.abs(v - lit[i + 1 + k * N]);
                        cnt++;
                    }
                    if (k + 1 < N && valid[i + (k + 1) * N]) {
                        sumLocal += Math.abs(v - lit[i + (k + 1) * N]);
                        cnt++;
                    }
                }
            out.push({
                epsCells: ec,
                epsM: +eps.toFixed(1),
                localLitDelta: +(sumLocal / Math.max(1, cnt)).toFixed(4), // niedrig = glatt/grosse Regionen
                macroSpan: +(mx - mn).toFixed(3), // hoch = Berg/Klippe bleibt sichtbar
            });
        }
        return { gridCols: N, gridSpanM: spanM, eps: out };
    });
    await browser.close();
    server.close();
    console.log("\n===== DIAGNOSE J4 — CEL-NORMALEN-eps-SWEEP =====\n");
    console.log("  Gitter " + rep.gridCols + "x" + rep.gridCols + " über " + rep.gridSpanM + " m, Sonne ~Vormittag.\n");
    console.log("  eps(Zellen)  eps(m)   lokale-Licht-Δ↓   Makro-Spanne↑");
    for (const e of rep.eps) {
        console.log(
            "   " +
                String(e.epsCells).padEnd(11) +
                String(e.epsM).padEnd(8) +
                String(e.localLitDelta).padEnd(18) +
                String(e.macroSpan)
        );
    }
    console.log("\n  DEUTUNG: lokale-Licht-Δ niedrig = grosse glatte Cel-Regionen (2.5D-Look,");
    console.log("  kein Trapez-Netz). Makro-Spanne darf NICHT auf ~0 fallen (sonst ist die");
    console.log("  Welt flach-gelitten, Berge/Klippen verschwinden). Das beste eps senkt die");
    console.log("  lokale Δ deutlich UND hält die Makro-Spanne hoch.");
    console.log("\n================================================\n");
})();
