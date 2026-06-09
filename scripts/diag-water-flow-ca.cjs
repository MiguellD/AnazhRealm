// Diagnose T4 (terrain-t4-wasser-ca-plan §3) — der KERN des Wasser-Automaten, BEWIESEN.
// `_tickWaterCA` ist eine reine Funktion über (level, cells, dim, dimY). Wir prüfen die zwei
// fundamentalen Garantien eines Fluid-Automaten — headless, deterministisch, NICHT pixel-blind:
//   (1) ERHALTUNG: Wasser wird nie erzeugt/vernichtet (Σ level über die Ticks konstant).
//   (2) FLUSS: ein hoher Blob FÄLLT (Gravität); eine hohe Säule SUCHT IHR NIVEAU (lateral).
// Das ist die Wurzel-Antwort auf „Wasser fliesst nicht nach" (wasser-plan §3) — das Modell, BEVOR
// es in die Welt verdrahtet wird (T4a-2+). Exit 1, wenn die Erhaltung bricht ODER kein Fluss.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4367;
const root = path.resolve(__dirname, "..");
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // nur das Realm-Objekt + die Methode brauchen wir (kein Welt-Warmup nötig)
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 20000) {
            if (window.anazhRealm && typeof window.anazhRealm._tickWaterCA === "function") return;
            await new Promise((res) => setTimeout(res, 50));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const SOLID = r.constructor.CELL_STATE.SOLID;
        const AIR = r.constructor.CELL_STATE.AIR;
        const sum = (a) => {
            let s = 0;
            for (let i = 0; i < a.length; i++) s += a[i];
            return s;
        };
        // Schwerpunkt-Höhe (Σ level·j / Σ level) — fällt, wenn Wasser sinkt.
        const comJ = (level, dim, dimY) => {
            const dimSq = dim * dim;
            let s = 0,
                w = 0;
            for (let j = 0; j < dimY; j++)
                for (let c = 0; c < dimSq; c++) {
                    const v = level[j * dimSq + c];
                    s += v * j;
                    w += v;
                }
            return w > 0 ? s / w : 0;
        };
        // nasse Grundfläche (Spalten mit Σ_j level > 0.05) — wächst, wenn Wasser sich spreizt.
        const footprint = (level, dim, dimY) => {
            const dimSq = dim * dim;
            let n = 0;
            for (let c = 0; c < dimSq; c++) {
                let col = 0;
                for (let j = 0; j < dimY; j++) col += level[j * dimSq + c];
                if (col > 0.05) n++;
            }
            return n;
        };

        // === TEST A — GRAVITÄT + ERHALTUNG: ein hoher Blob fällt auf den Boden ===
        const dimA = 4,
            dimYA = 12;
        const cellsA = new Uint8Array(dimA * dimA * dimYA).fill(AIR);
        for (let c = 0; c < dimA * dimA; c++) cellsA[c] = SOLID; // j=0 Boden
        const levelA = new Float64Array(dimA * dimA * dimYA);
        const colA = 1 + 1 * dimA; // Spalte (i=1,k=1)
        levelA[10 * dimA * dimA + colA] = 1.0; // ein Blob bei j=10
        const sumA0 = sum(levelA);
        const comA0 = comJ(levelA, dimA, dimYA);
        let movedA = 0;
        for (let t = 0; t < 40; t++) movedA += r._tickWaterCA(levelA, cellsA, dimA, dimYA);
        const sumA1 = sum(levelA);
        const comA1 = comJ(levelA, dimA, dimYA);
        // das Wasser fällt UND nivelliert über den Boden → die ganze Boden-SCHICHT (j=1) trägt es
        let bottomA = 0;
        for (let c = 0; c < dimA * dimA; c++) bottomA += levelA[1 * dimA * dimA + c];

        // === TEST B — NIVEAU SUCHEN + ERHALTUNG: eine hohe Säule spreizt zur flachen Lache ===
        const dimB = 8,
            dimYB = 8;
        const cellsB = new Uint8Array(dimB * dimB * dimYB).fill(AIR);
        for (let c = 0; c < dimB * dimB; c++) cellsB[c] = SOLID; // Boden
        const levelB = new Float64Array(dimB * dimB * dimYB);
        const colB = 3 + 3 * dimB; // Mitte
        for (let j = 1; j <= 5; j++) levelB[j * dimB * dimB + colB] = 1.0; // 5 Einheiten gestapelt
        const sumB0 = sum(levelB);
        const fpB0 = footprint(levelB, dimB, dimYB);
        let maxColB0 = 0;
        for (let j = 0; j < dimYB; j++) maxColB0 += levelB[j * dimB * dimB + colB];
        let movedB = 0;
        for (let t = 0; t < 120; t++) movedB += r._tickWaterCA(levelB, cellsB, dimB, dimYB);
        const sumB1 = sum(levelB);
        const fpB1 = footprint(levelB, dimB, dimYB);
        let maxColB1 = 0; // Wasser in der Ursprungs-Spalte (sollte stark sinken — es floss weg)
        for (let j = 0; j < dimYB; j++) maxColB1 += levelB[j * dimB * dimB + colB];

        return {
            A: {
                sum0: +sumA0.toFixed(6),
                sum1: +sumA1.toFixed(6),
                com0: +comA0.toFixed(2),
                com1: +comA1.toFixed(2),
                bottom: +bottomA.toFixed(3),
                moved: movedA,
            },
            B: {
                sum0: +sumB0.toFixed(6),
                sum1: +sumB1.toFixed(6),
                fp0: fpB0,
                fp1: fpB1,
                col0: +maxColB0.toFixed(2),
                col1: +maxColB1.toFixed(2),
                moved: movedB,
            },
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== T4 — WASSER-AUTOMAT-KERN (`_tickWaterCA`, headless beweisbar) ===\n");
    const A = out.A,
        B = out.B;
    console.log("TEST A — GRAVITÄT + ERHALTUNG (ein Blob @j=10 fällt auf den Boden):");
    console.log(
        `  Σ Wasser: ${A.sum0} → ${A.sum1}   (Erhaltung: ${Math.abs(A.sum1 - A.sum0) < 1e-4 ? "✓ exakt" : "✗ GEBROCHEN"})`
    );
    console.log(
        `  Schwerpunkt-Höhe j: ${A.com0} → ${A.com1}   (gefallen: ${A.com1 < A.com0 - 1 ? "✓" : "✗"})   ·   Boden-SCHICHT j=1 trägt: ${A.bottom} von ${A.sum0} (am Boden: ${A.bottom > 0.9 * A.sum0 ? "✓" : "✗"})\n`
    );
    console.log("TEST B — NIVEAU SUCHEN + ERHALTUNG (5er-Säule spreizt zur Lache):");
    console.log(
        `  Σ Wasser: ${B.sum0} → ${B.sum1}   (Erhaltung: ${Math.abs(B.sum1 - B.sum0) < 1e-4 ? "✓ exakt" : "✗ GEBROCHEN"})`
    );
    console.log(
        `  nasse Grundfläche: ${B.fp0} → ${B.fp1} Spalten   (gespreizt: ${B.fp1 > B.fp0 ? "✓" : "✗"})   ·   Ursprungs-Säule: ${B.col0} → ${B.col1} (abgeflossen: ${B.col1 < B.col0 - 1 ? "✓" : "✗"})\n`
    );

    const consOk = Math.abs(A.sum1 - A.sum0) < 1e-4 && Math.abs(B.sum1 - B.sum0) < 1e-4;
    const flowOk = A.com1 < A.com0 - 1 && A.bottom > 0.9 * A.sum0 && B.fp1 > B.fp0 && B.col1 < B.col0 - 1;
    if (consOk && flowOk) {
        console.log("GRÜN — der Automat ERHÄLT das Wasser exakt UND es FLIESST (fällt + sucht sein Niveau).");
        console.log(
            "  → die Wurzel von ‚Wasser fliesst nicht nach‘ ist im Modell gelöst; nächster Schritt: in die Welt-Zellen verdrahten (T4a-2..4) + Render (T4b, Browser).\n"
        );
        process.exit(0);
    } else {
        console.log(`ROT — Erhaltung ${consOk ? "ok" : "GEBROCHEN"}, Fluss ${flowOk ? "ok" : "FEHLT"}.\n`);
        process.exit(1);
    }
})();
