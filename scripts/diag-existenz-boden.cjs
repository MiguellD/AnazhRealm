#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-existenz-boden.cjs — DER EXISTENZ-BODEN DES DISPATCHERS (V18.473).
// Schöpfer-Trace vom echten Holz (14.07.): render-gebundene Maschine →
// deferrable-Budget dauerhaft ≤ 0 → `break` ließ die Substanz-Queues
// (pendingWaterIso · pendingScatter · pendingGrass) monoton wachsen
// (Heap +1,6 MB/s) — Wasser trug Schwimm-Physik ohne sichtbare Oberfläche.
// Diese Linse hält die Lehre-13-Erweiterung: Existenz vor Framerate —
//   (a) bei LEEREM Budget läuft Welt-SUBSTANZ (prio 1: waterIso) trotzdem
//       JEDEN Frame (Zeit-Boden), Deko (prio ≥ 2) jeden 4. Frame;
//   (b) eine gefüllte pendingWaterIso-Queue SCHRUMPFT unter leerem Budget;
//   (c) SELBST-TEST: prio-2-Jobs laufen bei leerem Budget NICHT auf
//       Nicht-4er-Frames (der Boden ist ein Boden, keine Aufhebung).
//   node scripts/diag-existenz-boden.cjs   (npm run gate:existenz-boden)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4431;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            const res = {};
            // Settle (Plateau-Muster)
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 40) break;
                if (ticks % 10 === 0) await new Promise((res2) => setTimeout(res2, 0));
            }
            const pos = s.playerMesh.position;
            const leer = { remainingMs: () => 0 }; // die render-gebundene Maschine des Schöpfers
            // (a) Substanz läuft JEDEN Frame, Deko nur jeden 4.
            const gesehen = { waterIso: 0, deko: 0, laeufe: 0 };
            for (let i = 0; i < 8; i++) {
                const ran = r._dispatchFrameJobs(r._buildDeferrableJobs(pos), leer);
                gesehen.laeufe++;
                if (ran.includes("waterIso")) gesehen.waterIso++;
                if (ran.includes("scatterDeco") || ran.includes("grass")) gesehen.deko++;
            }
            res.substanzJedenFrame = gesehen.waterIso === gesehen.laeufe;
            res.dekoGedrosselt = gesehen.deko > 0 && gesehen.deko <= Math.ceil(gesehen.laeufe / 4) * 2;
            res.gesehen = gesehen;
            // (b) eine GEFÜLLTE Wasser-Queue schrumpft unter leerem Budget
            if (!s.pendingWaterIso) s.pendingWaterIso = new Set();
            for (const key of s.voxelChunks.keys()) {
                s.pendingWaterIso.add(key);
                if (s.pendingWaterIso.size >= 6) break;
            }
            const vor = s.pendingWaterIso.size;
            for (let i = 0; i < 30 && s.pendingWaterIso.size > 0; i++)
                r._dispatchFrameJobs(r._buildDeferrableJobs(pos), leer);
            res.queueVor = vor;
            res.queueNach = s.pendingWaterIso.size;
            // (c) SELBST-TEST: ein Sonde-Job prio 2 darf auf einem Nicht-4er-Frame NICHT laufen
            r._schedFrameNo = 1; // nächster Lauf = Frame 2 (kein 4er)
            let sondeLief = false;
            r._dispatchFrameJobs([{ name: "sonde", prio: 2, run: () => (sondeLief = true) }], leer);
            res.selbstTestBodenIstBoden = sondeLief === false;
            return res;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== V18.473 — DER EXISTENZ-BODEN (Substanz fließt auch bei leerem Budget) =====\n");
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    check(
        "(a) SUBSTANZ (waterIso) läuft JEDEN Frame trotz Budget 0",
        out.substanzJedenFrame,
        JSON.stringify(out.gesehen)
    );
    check("(a) DEKO läuft gedrosselt (jeden 4. Frame), nicht nie und nicht immer", out.dekoGedrosselt);
    check(
        `(b) die Wasser-Queue SCHRUMPFT unter leerem Budget (${out.queueVor} → ${out.queueNach})`,
        out.queueNach < out.queueVor
    );
    check("SELBST-TEST: prio-2 läuft NICHT auf Nicht-4er-Frames (der Boden ist ein Boden)", out.selbstTestBodenIstBoden);
    check("kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — Existenz vor Framerate gilt jetzt auch für die Substanz-Queues: Wasser/Scatter/Gras fließen auf jeder Maschine ab, der Regler atmet nur darüber."
    );
})();
