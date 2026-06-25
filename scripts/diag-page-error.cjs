// Diagnose-Script für V10.0-g — fängt alle Page-Errors mit vollem Stack
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4313;
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

// V18.359 — der Page-Error-Wächter ist jetzt ein GATE: er sammelt jeden
// Runtime-Throw + Console-Error und EXITET NON-ZERO, wenn die Wurzel rot ist.
// So fängt der pre-push-/CI-Gate einen `is not a function`-Boot-Tod (die
// V17.20-Klasse) an der WURZEL — mit klarem Stack — BEVOR der Playtest in
// Folge-Fehlern ertrinkt. (Headless-Null-Renderer: GPU-frei, wie das Gate.)
const pageErrors = [];
const consoleErrors = [];

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    page.on("pageerror", (err) => {
        const s = err.stack || err.message;
        pageErrors.push(s);
        console.log("\n=== PAGE-ERROR ===");
        console.log(s);
        console.log("===\n");
    });
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            consoleErrors.push(msg.text());
            console.log("[CONSOLE-ERROR]", msg.text());
        }
    });
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await new Promise((r) => setTimeout(r, 5000));
    } catch (e) {
        pageErrors.push(`NAV: ${(e && e.message) || e}`);
    }
    await browser.close();
    server.close();

    // Console-Errors, die KEINE echten Bugs sind (erwartete Netz-/Asset-Skips
    // im headless Kontext) — ausgefiltert, damit der Wächter ein scharfes
    // Signal behält. Page-Errors (Runtime-Throws) zählen IMMER.
    const benign = /favicon|net::ERR|Failed to load resource|save-server|localhost:|127\.0\.0\.1:\d+\/api/i;
    const realConsole = consoleErrors.filter((t) => !benign.test(t));

    console.log("\n=== Page-Error-Wächter ===");
    console.log(`  Page-Errors (Runtime-Throws): ${pageErrors.length}`);
    console.log(`  Console-Errors (echt):        ${realConsole.length}`);
    if (pageErrors.length === 0 && realConsole.length === 0) {
        console.log("✅ Boot-Wurzel sauber — kein Runtime-Throw, keine echten Console-Errors.");
        process.exit(0);
    }
    console.log("⛔ Boot-Wurzel ROT — die obigen Stacks zeigen die Wurzel (vor dem Playtest heilen).");
    process.exit(1);
})();
