// platz.cjs — WEGWERF-SPIKE (w28-samen-lichtweg): fährt platz.html je Fall × Uhr headless (swiftshader), schreibt die Bilder
// (bild-<fall>-<uhr>.png) und die Zahlen (mess/platz.json). JEDE ms-Zahl ist swiftshader (CPU-Raster), keine Karten-Zeit.
//   node samen/lichtweg/platz.cjs [fall …]
"use strict";
const fs = require("fs");
const http = require("http");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const { softwareWebGpuArgs } = require(path.join(ROOT, "scripts", "lib", "software-gpu.cjs"));
const MIME = { ".js": "text/javascript", ".html": "text/html", ".json": "application/json" };
const FAELLE = process.argv.slice(2).filter((a) => !a.startsWith("--"));
// `pass-loch`: der Kandidat ohne die Ziel-Mischung (das Loch hinter Glas im Bild)
const faelle = FAELLE.length ? FAELLE : ["heute", "pool16", "pass", "pass-loch", "voll"];

(async () => {
    const srv = http.createServer((req, res) => {
        const p = decodeURIComponent(req.url.split("?")[0]);
        const f = path.join(ROOT, p);
        if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", MIME[path.extname(f)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(fs.readFileSync(f));
    });
    await new Promise((r) => srv.listen(0, "127.0.0.1", r));
    const port = srv.address().port;
    const browser = await require("puppeteer").launch({ headless: true, args: softwareWebGpuArgs(), protocolTimeout: 1200000, defaultViewport: { width: 960, height: 540 } });
    const datei = path.join(__dirname, "mess", "platz.json");
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    const alle = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : {};
    for (const fall of faelle)
        for (const [uhr, pose] of [["nacht", "auge"], ["nacht", "oben"], ["mittag", "auge"]]) {
            const name = `${fall}-${uhr}${pose === "oben" ? "-oben" : ""}`;
            const page = await browser.newPage();
            const fehler = [];
            page.on("pageerror", (e) => fehler.push(String(e).slice(0, 400)));
            page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && fehler.push(m.text().slice(0, 400)));
            const t0 = Date.now();
            await page.goto(`http://127.0.0.1:${port}/samen/lichtweg/platz.html?fall=${fall.split("-")[0]}&uhr=${uhr}&glas=${fall.endsWith("-loch") ? "loch" : "misch"}&pose=${pose}`, { waitUntil: "domcontentloaded" });
            try {
                await page.waitForFunction(() => window.__bereit === true, { timeout: 300000 });
                const m = await page.evaluate(() => window.__messen());
                fs.writeFileSync(path.join(__dirname, `bild-${name}.png`), Buffer.from(m.png.split(",")[1], "base64"));
                delete m.png;
                m.wandS = Math.round((Date.now() - t0) / 1000);
                m.fehler = fehler;
                alle[name] = m;
                const z = m.bildMsSwiftshader.slice().sort((a, b) => a - b);
                console.log(
                    `PLATZ ${name}: Programme ${m.programme.fragment} F / ${m.programme.vertex} V · Text ${((m.textBytes.fragment + m.textBytes.vertex) / 1024).toFixed(0)} KB (größtes Fragment ${(m.groesstesFragment / 1024).toFixed(1)} KB) · ` +
                        `Knoten-Bau ${m.knotenBau.n} Bauten ${m.knotenBau.ms.toFixed(0)} ms (${m.knotenBau.knoten} Knoten) · Quellen mit Platz ${m.quellenMitPlatz} · ` +
                        `Laternen mit Boden-Ring im Bild ${m.laternenMitRing}, davon beleuchtend ${m.beleuchtend} · Bild ${z[z.length >> 1].toFixed(0)} ms [swiftshader, CPU-Raster] · ${m.wandS} s` +
                        (fehler.length ? `\n   FEHLER: ${fehler.slice(0, 4).join("\n   ")}` : "")
                );
            } catch (e) {
                console.log(`PLATZ ${name}: ROT — ${String(e).slice(0, 300)}\n   ${fehler.slice(0, 6).join("\n   ")}`);
            }
            await page.close();
            fs.writeFileSync(datei, JSON.stringify(alle, null, 1));
        }
    await browser.close();
    srv.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
