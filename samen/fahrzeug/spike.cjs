// WEGWERF-SPIKE (w28-samen-fahrzeug) — der Treiber: ein kleiner Datei-Dienst am Repo-Kopf, Chromium auf swiftshader (WebGL2),
// je Fall die Zahlen und die Bilder im selben Licht.  node samen/fahrzeug/spike.cjs [faelle=a,b,c] [rezept] [seed]
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = __dirname;
const FAELLE = (process.argv[2] || "a,b,c").split(",");
const REZEPT = process.argv[3] || "kompakt_fwd";
const SEED = +(process.argv[4] || 5); // lackIndex(5) = 6 = Solargelb
const NUR = process.argv[5] ? process.argv[5].split(",") : null; // nur diese Blicke

const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };
const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404);
        return res.end();
    }
    res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(p).pipe(res);
});

// Die Blicke: [Name, Kamera(x,y,z), Ziel, Öffnung°, Licht-Azimut°, Licht-Höhe°] — der Wagen blickt nach +x, die Flanke rechts ist +z.
// Das Licht streift: es steht je Blick ~70–80° neben der Blick-Achse und 12–18° über dem Boden.
function blicke(m) {
    const fx = m.fAx,
        R = m.radR,
        bw = m.bw;
    return [
        ["vorn", [9.5, 1.05, 0.0], [0, 0.62, 0], 17, 78, 14],
        ["hinten", [-9.5, 1.05, 0.0], [0, 0.62, 0], 17, 102, 14],
        ["seite", [0, 0.95, 11.5], [0, 0.66, 0], 17, 12, 16],
        ["dreiviertel", [6.6, 2.0, 5.6], [0, 0.55, 0], 17, 16, 17],
        ["heck34", [-6.6, 2.0, 5.6], [0, 0.55, 0], 17, 164, 17],
        ["rad", [fx + 0.55, 0.62, bw + 2.1], [fx, R + 0.08, bw], 26, 14, 20],
    ];
}

(async () => {
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const port = server.address().port;
    const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--ignore-gpu-blocklist"] });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && console.log("[seite]", m.type(), m.text().slice(0, 300)));
    page.on("pageerror", (e) => console.log("[seite] FEHLER", e.message));
    await page.goto(`http://127.0.0.1:${port}/samen/fahrzeug/spike.html`);
    await page.waitForFunction("window.__bereit === true", null, { timeout: 120000 });
    const zahlen = {};
    for (const fall of FAELLE) {
        const m = await page.evaluate(([f, r, s]) => window.spike.setze(f, r, s), [fall, REZEPT, SEED]);
        const z = (zahlen[fall] = { tris: m.tris, meshes: m.meshes, teile: m.teile, jeStoff: m.jeStoff, info: m.info });
        if (!NUR) {
            z.bauMs = await page.evaluate(([f, r, s]) => window.spike.zeit(f, r, s, 15), [fall, REZEPT, SEED]);
            z.sichtbar = await page.evaluate(() => window.spike.sichtbar());
            z.kantenLack = await page.evaluate(() => window.spike.kanten(true));
            z.radlaufV = await page.evaluate(() => window.spike.radlauf("v"));
            z.radlaufH = await page.evaluate(() => window.spike.radlauf("h"));
        }
        for (const [name, cam, ziel, fov, az, el] of blicke(m)) {
            if (NUR && !NUR.includes(name)) continue;
            for (const modus of ["nackt", "lack"]) {
                const url = await page.evaluate(([mo, c, zi, f, a, e]) => window.spike.bild(mo, c, zi, f, a, e), [modus, cam, ziel, fov, az, el]);
                fs.writeFileSync(path.join(OUT, `${fall}-${name}-${modus}.png`), Buffer.from(url.split(",")[1], "base64"));
            }
        }
        console.log(fall, JSON.stringify(z));
    }
    if (!NUR) {
        const zf = path.join(OUT, "zahlen.json");
        const alt = fs.existsSync(zf) ? JSON.parse(fs.readFileSync(zf, "utf8")) : {};
        fs.writeFileSync(zf, JSON.stringify(Object.assign(alt, zahlen), null, 1));
    }
    await browser.close();
    server.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
