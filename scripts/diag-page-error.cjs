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
    if (!filePath.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(filePath, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (err) => {
        console.log("\n=== PAGE-ERROR ===");
        console.log(err.stack || err.message);
        console.log("===\n");
    });
    page.on("console", (msg) => {
        if (msg.type() === "error") console.log("[CONSOLE-ERROR]", msg.text());
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));
    await browser.close();
    server.close();
})();
