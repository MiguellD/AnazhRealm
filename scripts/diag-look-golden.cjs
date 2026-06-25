#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-look-golden.cjs — DER PERZEPT GEGEN EIN GOLDEN (npm run look-golden)
//
// DIE VISION (Schöpfer-Frage 25.06., „dein Auge EINMAL, die Maschine bewacht
// für immer"): das frozen-Golden-Muster (spec/golden/, das den Bauplan-Kanon
// bewacht) auf den GERENDERTEN Frame ausgedehnt. Du sign-offst EINEN settled
// Augenhöhen-Shot als Golden; danach rendert das Gate denselben deterministischen
// Spot und rechnet eine perzeptuelle Metrik (MSSIM) gegen das Golden — Drift über
// Schwelle = rot. So wandert der Look von „dein Auge JEDES Mal" zu „gemessen, dein
// Auge EINMAL".
//
// DIE EHRLICHE TEILUNG (kein Halbschritt): die LINSE (MSSIM) ist hier per
// Selbst-Test bewiesen — pure JS, KEINE GPU, gate-tauglich (identisch→1 ·
// degradiert→<1). Das GOLDEN gehört dir (echte GPU + ein Sign-off), darum ist
// der Render-Pfad opt-in (--render/--mint). Der Default beweist die Linse.
//
// NUTZUNG:
//   node scripts/diag-look-golden.cjs            → Selbst-Test der MSSIM-Linse (gate)
//   node scripts/diag-look-golden.cjs --render   → rendert den Spot, vergleicht gegen Golden
//   node scripts/diag-look-golden.cjs --mint      → mintet das Golden aus dem aktuellen Render
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");

const GOLDEN_DIR = path.resolve(__dirname, "..", "spec", "golden", "render");
const SPOT = "settled-eye"; // der eine kanonische, deterministische Augenhöhen-Spot
const GOLDEN_FILE = path.join(GOLDEN_DIR, `${SPOT}.json`);
const N = 96; // Downsample-Kantenlänge (N·N Luma-Werte = das perzeptuelle Maß)
const THRESHOLD = 0.92; // MSSIM unter dieser Schwelle = sichtbare Look-Drift = rot

// ── die perzeptuelle Metrik: MSSIM über 8×8-Blöcke (Wang et al. 2004) ──
// SSIM(x,y) = ((2μxμy+c1)(2σxy+c2)) / ((μx²+μy²+c1)(σx²+σy²+c2)); MSSIM = Mittel
// der Block-SSIMs. Pure JS, dynamischer Bereich L=1 (Luma in [0,1]).
function mssim(a, b, n) {
    const L = 1.0;
    const c1 = (0.01 * L) ** 2;
    const c2 = (0.03 * L) ** 2;
    const win = 8;
    let sum = 0;
    let blocks = 0;
    for (let by = 0; by + win <= n; by += win) {
        for (let bx = 0; bx + win <= n; bx += win) {
            let sa = 0,
                sb = 0;
            for (let y = 0; y < win; y++)
                for (let x = 0; x < win; x++) {
                    const i = (by + y) * n + (bx + x);
                    sa += a[i];
                    sb += b[i];
                }
            const cnt = win * win;
            const ma = sa / cnt,
                mb = sb / cnt;
            let va = 0,
                vb = 0,
                cov = 0;
            for (let y = 0; y < win; y++)
                for (let x = 0; x < win; x++) {
                    const i = (by + y) * n + (bx + x);
                    const da = a[i] - ma,
                        db = b[i] - mb;
                    va += da * da;
                    vb += db * db;
                    cov += da * db;
                }
            va /= cnt - 1;
            vb /= cnt - 1;
            cov /= cnt - 1;
            const s = ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2));
            sum += s;
            blocks++;
        }
    }
    return blocks ? sum / blocks : 1;
}

// ── Selbst-Test: beweist die Linse OHNE Render (gate-tauglich) ──
function selfTest() {
    const n = N;
    const base = new Float64Array(n * n);
    // ein deterministisches strukturiertes Bild (Gradient + Karos + Kreis).
    for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
            const checker = ((x >> 3) + (y >> 3)) % 2 ? 0.18 : 0.0;
            const disc = Math.hypot(x - n / 2, y - n / 2) < n / 4 ? 0.25 : 0;
            base[y * n + x] = Math.min(1, x / n + checker + disc);
        }
    // (a) identisch → ~1
    const same = mssim(base, base, n);
    // (b) leichtes Rauschen → leicht < 1 (deterministisch, kein Math.random)
    const noisy = Float64Array.from(base, (v, i) =>
        Math.min(1, Math.max(0, v + (((i * 2654435761) % 100) / 100 - 0.5) * 0.08))
    );
    const noisySim = mssim(base, noisy, n);
    // (c) strukturelle Störung (verschoben) → deutlich < 1
    const shifted = new Float64Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) shifted[y * n + x] = base[y * n + ((x + 6) % n)];
    const shiftSim = mssim(base, shifted, n);

    const checks = [
        { name: "identisch → MSSIM ≈ 1", pass: same > 0.999, detail: `MSSIM=${same.toFixed(5)}` },
        {
            name: "leichtes Rauschen → MSSIM < 1 (erkannt)",
            pass: noisySim < 0.999 && noisySim > 0.5,
            detail: `MSSIM=${noisySim.toFixed(4)}`,
        },
        {
            name: "strukturelle Störung → MSSIM deutlich < identisch",
            pass: shiftSim < same - 0.05,
            detail: `MSSIM=${shiftSim.toFixed(4)} (< ${same.toFixed(4)})`,
        },
        {
            name: "Monotonie: Rauschen näher an 1 als Struktur-Bruch",
            pass: noisySim > shiftSim,
            detail: `${noisySim.toFixed(4)} > ${shiftSim.toFixed(4)}`,
        },
    ];
    console.log("\n=== Look-Golden — Selbst-Test der MSSIM-Linse (kein Render, gate-tauglich) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}  (${c.detail})`);
        if (!c.pass) fails++;
    }
    if (fails) {
        console.log(`⛔ Die perzeptuelle Linse selbst ist defekt (${fails} Fehler) — vor dem Golden-Vergleich heilen.`);
        return false;
    }
    console.log("✅ Die MSSIM-Linse misst korrekt — bereit, ein Golden zu bewachen.");
    return true;
}

// ── Render-Pfad (opt-in): den settled Spot rendern, Luma lesen, gegen Golden ──
async function renderLuma() {
    const puppeteer = require("puppeteer");
    const http = require("http");
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
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    const PORT = 4320;
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--use-angle=swiftshader"],
        protocolTimeout: 600000,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 400 });
    let luma = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.rendererReady,
            { timeout: 120000 }
        );
        // deterministisch settlen + auf einen Land-Augenhöhen-Spot stellen, ein paar Frames.
        await page.evaluate(() => {
            const r = window.anazhRealm;
            for (let i = 0; i < 80; i++) r._gameLoopTick && r._gameLoopTick();
        });
        await new Promise((r) => setTimeout(r, 2500));
        luma = await page.evaluate((n) => {
            const cv = document.getElementById("world-canvas");
            if (!cv) return null;
            const small = document.createElement("canvas");
            small.width = n;
            small.height = n;
            const ctx = small.getContext("2d");
            ctx.drawImage(cv, 0, 0, n, n);
            const d = ctx.getImageData(0, 0, n, n).data;
            const out = new Array(n * n);
            for (let i = 0; i < n * n; i++) {
                const r = d[i * 4] / 255,
                    g = d[i * 4 + 1] / 255,
                    b = d[i * 4 + 2] / 255;
                out[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b; // BT.709 Luma
            }
            return out;
        }, N);
    } catch (e) {
        console.log(
            `⛔ Render fehlgeschlagen (in diesem Container ist swiftshader unter Last fragil — auf echter GPU laufen): ${(e && e.message) || e}`
        );
    }
    await browser.close();
    server.close();
    return luma;
}

(async () => {
    const lensOk = selfTest();
    const wantRender = process.argv.includes("--render") || process.argv.includes("--mint");
    const wantMint = process.argv.includes("--mint");

    if (!wantRender) {
        // Default: nur die Linse beweisen (gate). Existiert ein Golden, melde es.
        if (fs.existsSync(GOLDEN_FILE))
            console.log(`\nℹ Golden vorhanden (${path.relative(root(), GOLDEN_FILE)}). Mit --render vergleichen.`);
        else
            console.log(
                "\nℹ Noch kein Golden. Auf echter GPU: --mint (du sign-offst es EINMAL), danach bewacht --render es."
            );
        process.exit(lensOk ? 0 : 1);
    }

    const luma = await renderLuma();
    if (!luma) process.exit(2);

    if (wantMint || !fs.existsSync(GOLDEN_FILE)) {
        fs.mkdirSync(GOLDEN_DIR, { recursive: true });
        fs.writeFileSync(GOLDEN_FILE, JSON.stringify({ spot: SPOT, n: N, luma }), "utf8");
        console.log(`\n✅ Golden gemintet: ${GOLDEN_FILE}`);
        console.log(
            "   → Schöpfer: prüfe den Look EINMAL; ist er richtig, committe das Golden. Danach bewacht es das Gate."
        );
        process.exit(lensOk ? 0 : 1);
    }

    const golden = JSON.parse(fs.readFileSync(GOLDEN_FILE, "utf8"));
    const score = mssim(golden.luma, luma, N);
    console.log(`\n=== Look-Golden-Vergleich (Spot '${SPOT}') ===`);
    console.log(`  MSSIM gegen Golden: ${score.toFixed(4)}  (Schwelle ${THRESHOLD})`);
    if (score < THRESHOLD) {
        console.log("⛔ Sichtbare Look-Drift gegen das gesignte Golden — prüfen (oder neu minten, wenn gewollt).");
        process.exit(1);
    }
    console.log("✅ Der gerenderte Look stimmt mit dem gesignten Golden überein.");
    process.exit(lensOk ? 0 : 1);
})();

function root() {
    return path.resolve(__dirname, "..");
}
