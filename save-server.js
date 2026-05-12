const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 4312;
const PROJECT_ROOT = __dirname;
const ALLOWED_STATE_FILES = new Set(["anazhRealmState.json"]);

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".wasm": "application/wasm",
    ".md": "text/markdown; charset=utf-8",
};

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end(JSON.stringify(data));
}

function sendStaticFile(req, res) {
    const reqPath = req.url === "/" ? "/index.html" : req.url;
    const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(PROJECT_ROOT, safePath);

    if (!filePath.startsWith(PROJECT_ROOT)) {
        sendJson(res, 403, { error: "Forbidden path" });
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            sendJson(res, 404, { error: "File not found" });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
        });
        res.end(content);
    });
}

function handleSaveState(req, res) {
    let rawBody = "";
    req.on("data", (chunk) => {
        rawBody += chunk;
    });
    req.on("end", () => {
        try {
            const parsed = JSON.parse(rawBody || "{}");
            const fileName = typeof parsed.fileName === "string" ? parsed.fileName : "anazhRealmState.json";
            const state = parsed.state;
            if (!state || typeof state !== "object") {
                sendJson(res, 400, { error: "Missing state object" });
                return;
            }

            if (!ALLOWED_STATE_FILES.has(fileName)) {
                sendJson(res, 403, { error: "Filename not in allowlist", allowed: [...ALLOWED_STATE_FILES] });
                return;
            }

            const targetPath = path.join(PROJECT_ROOT, fileName);
            if (path.dirname(targetPath) !== PROJECT_ROOT) {
                sendJson(res, 403, { error: "Forbidden target path" });
                return;
            }

            fs.writeFile(targetPath, JSON.stringify(state, null, 2), "utf8", (err) => {
                if (err) {
                    sendJson(res, 500, { error: "Write failed", details: err.message });
                    return;
                }
                sendJson(res, 200, { ok: true, path: targetPath });
            });
        } catch (error) {
            sendJson(res, 400, { error: "Invalid JSON", details: error.message });
        }
    });
}

const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/api/save-state") {
        handleSaveState(req, res);
        return;
    }

    if (req.method === "GET") {
        sendStaticFile(req, res);
        return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
    console.log(`Anazh Save-Server läuft: http://${HOST}:${PORT}`);
    console.log("Öffne das Spiel über diese URL, damit direkt in den Spielordner gespeichert wird.");
});
