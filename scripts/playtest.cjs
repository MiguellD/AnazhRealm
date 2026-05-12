// Headless-Smoketest. Startet save-server.js, lädt das Spiel in Chromium,
// sammelt Console-Logs für N Sekunden, produziert eine Statistik.
//
// Aufruf: npm run playtest
//         PLAYTEST_SECONDS=60 npm run playtest
//
// Voraussetzungen: puppeteer als devDependency (`npm install`).
//
// Hinweis: kein CI-Schritt. Das ist ein manueller Performance-Probe-Tool.

const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const DURATION_MS = Number(process.env.PLAYTEST_SECONDS || 25) * 1000;
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    console.log(`Starte Save-Server ...`);
    const server = await startSaveServer();
    console.log(`Lade ${SERVER_URL} für ${DURATION_MS / 1000}s ...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            // ANGLE-Backend mit SwiftShader gibt unter headless die zuverlässigste
            // WebGL-Implementierung – plain --use-gl=swiftshader stürzt mit
            // „Could not get context for WebGL version 1" ab.
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const logs = [];
    const errors = [];
    page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text(), at: Date.now() }));
    page.on("pageerror", (err) => errors.push({ kind: "pageerror", text: err.message }));
    page.on("requestfailed", (req) =>
        errors.push({ kind: "requestfailed", url: req.url(), error: req.failure()?.errorText })
    );

    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await new Promise((r) => setTimeout(r, DURATION_MS));

        const fpsText = await page.$eval("#fps", (el) => el.innerText).catch(() => "?");

        // Analyse
        const fpsValues = [];
        const fpsRe = /\[INFO\] FPS: (\d+)/;
        for (const l of logs) {
            const m = l.text.match(fpsRe);
            if (m) fpsValues.push(Number(m[1]));
        }

        const histogram = new Map();
        for (const l of logs) {
            const generic = l.text
                .replace(/\(-?\d+\.?\d*,\s*-?\d+\.?\d*(,\s*-?\d+\.?\d*)?\)/g, "(…)")
                .replace(/-?\d+\.\d+/g, "N")
                .replace(/\b\d+\b/g, "N");
            histogram.set(generic, (histogram.get(generic) || 0) + 1);
        }
        const top = [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
        const errorTexts = logs.filter((l) => l.type === "error" || /\[ERROR\]/.test(l.text));

        console.log(`\n=== Smoketest-Ergebnis (${DURATION_MS / 1000}s) ===`);
        console.log(`Aktueller FPS-Div: "${fpsText}"`);
        console.log(`Total log-Einträge: ${logs.length}`);
        console.log(`Page-Errors: ${errors.length}`);
        console.log(`Console-Errors: ${errorTexts.length}`);

        if (fpsValues.length) {
            const sum = fpsValues.reduce((a, b) => a + b, 0);
            const min = Math.min(...fpsValues);
            const max = Math.max(...fpsValues);
            const avg = sum / fpsValues.length;
            const zeros = fpsValues.filter((f) => f === 0).length;
            console.log(`\nFPS-Statistik: min=${min}, max=${max}, avg=${avg.toFixed(1)}, samples=${fpsValues.length}`);
            console.log(`FPS=0 Frames: ${zeros}/${fpsValues.length}`);
            console.log(`FPS-Verlauf (erste 30): ${fpsValues.slice(0, 30).join(",")}`);
        } else {
            console.log(`\nKeine FPS-Logs erfasst (FPS-Logger feuert nur einmal pro Sekunde).`);
        }

        console.log(`\n=== Top-15 Log-Muster ===`);
        for (const [msg, count] of top) console.log(`${String(count).padStart(4)}× ${msg.slice(0, 140)}`);

        if (errors.length || errorTexts.length) {
            console.log(`\n=== Fehler-Beispiele ===`);
            for (const e of errors.slice(0, 5))
                console.log(`  [page] ${e.kind}: ${(e.text || e.url || "").slice(0, 200)}`);
            for (const e of errorTexts.slice(0, 5)) console.log(`  [console] ${e.text.slice(0, 200)}`);
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((err) => {
    console.error("Smoketest-Crash:", err);
    process.exit(1);
});
