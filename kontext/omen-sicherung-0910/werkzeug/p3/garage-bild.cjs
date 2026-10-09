// Bild der Garage-Probefahrt (Ausgabe der Seite selbst): Start, 1,2 s Gas, Schuss.   WT=<worktree> node garage-bild.cjs <port> <datei>
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.WT || "welle-m-fahren");
const puppeteer = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren/node_modules/puppeteer");
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = Number(process.argv[2]), DATEI = process.argv[3];
const root = path.resolve(WT);
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    const fp = path.join(root, p);
    fs.readFile(fp, (err, data) => { if (err) return ((res.statusCode = 404), res.end()); res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`http://127.0.0.1:${PORT}/worlds/garage/index.html`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => typeof window.__vehicleCore === "object" && document.querySelector("canvas"), { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 600));
    await page.click("#start");
    await page.keyboard.down("KeyW");
    await page.waitForFunction(() => Math.abs(car.speed) > 4, { timeout: 60000, polling: 100 }).catch(() => {});
    await page.keyboard.up("KeyW");
    await new Promise((r) => setTimeout(r, 400));
    const namen = await page.evaluate(() => { const n = []; vehicle.traverseVisible((o) => { if (o.isSprite) n.push(o.name || "Schild"); }); return n; });
    await page.screenshot({ path: DATEI });
    console.log(DATEI, "Schilder:", namen.length, namen.join(" | "));
    await browser.close();
    server.close();
})();
