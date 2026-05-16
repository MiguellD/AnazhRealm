const http = require("http");
const https = require("https");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 4312;
const PROJECT_ROOT = __dirname;
// Ring 8 (Multi-Welt): localStorage hält pro Welt einen eigenen Key, der
// kanonische Multi-Welt-Speicher liegt also im Browser. Der save-server
// schreibt weiterhin EINE Datei `anazhRealmState.json` als Backup der
// AKTUELL AKTIVEN Welt — die Datei ist Komfort, nicht Single-Source. Welt-
// Wechsel überschreibt sie mit dem neuen aktiven Snapshot.
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
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    res.end(JSON.stringify(data));
}

// V7.96 — LLM-Proxy für Cloud-Provider die KEINE CORS-Header senden
// (z.B. ollama.com Cloud). Browser-Direct-Calls werden vom Browser
// geblockt — der save-server steht als loyaler Vermittler dazwischen.
//
// Sicherheits-Disziplin:
//   - Server bindet bereits auf 127.0.0.1 → kein LAN-Zugriff
//   - URL muss https:-Schema haben (kein arbitrary HTTP-Forward)
//   - Max URL-Länge 500 Zeichen
//   - Body-Cap 1 MB (request + response)
//   - Timeout 60 Sekunden
//   - Allowed methods: nur POST (LLMs sind POST)
//   - Forwarded headers gefiltert: nur application-content + authorization
//
// Wer den Proxy für andere Use-Cases nutzen will (z.B. Image-API): neue
// Route hinzufügen statt /proxy/llm zu generalisieren. Spezifische Routes
// bewahren die Sicherheits-Disziplin.
const PROXY_MAX_URL_LENGTH = 500;
const PROXY_MAX_BODY_BYTES = 1024 * 1024; // 1 MB
const PROXY_TIMEOUT_MS = 60_000;
const PROXY_ALLOWED_HEADER_PREFIXES = [
    "content-type",
    "authorization",
    "x-api-key",
    "anthropic-version",
    "anthropic-dangerous-direct-browser-access",
];

function handleLlmProxy(req, res) {
    let rawBody = "";
    let aborted = false;
    req.on("data", (chunk) => {
        if (aborted) return;
        rawBody += chunk;
        if (rawBody.length > PROXY_MAX_BODY_BYTES) {
            aborted = true;
            sendJson(res, 413, { error: "Request body too large" });
            req.destroy();
        }
    });
    req.on("end", () => {
        if (aborted) return;
        let parsed;
        try {
            parsed = JSON.parse(rawBody || "{}");
        } catch (e) {
            sendJson(res, 400, { error: "Invalid JSON envelope", details: e.message });
            return;
        }
        const targetUrl = parsed.url;
        const headersIn = parsed.headers || {};
        const bodyIn = parsed.body;
        if (typeof targetUrl !== "string" || targetUrl.length === 0) {
            sendJson(res, 400, { error: "Missing 'url' in proxy envelope" });
            return;
        }
        if (targetUrl.length > PROXY_MAX_URL_LENGTH) {
            sendJson(res, 400, { error: "URL too long" });
            return;
        }
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
        } catch {
            sendJson(res, 400, { error: "Invalid URL" });
            return;
        }
        if (parsedUrl.protocol !== "https:") {
            sendJson(res, 400, {
                error: "Only https: URLs allowed (HTTP-Forward blockt aus Sicherheit)",
            });
            return;
        }
        const safeHeaders = { "content-type": "application/json" };
        for (const key of Object.keys(headersIn)) {
            const lc = key.toLowerCase();
            if (PROXY_ALLOWED_HEADER_PREFIXES.some((allowed) => lc === allowed || lc.startsWith(allowed))) {
                safeHeaders[lc] = String(headersIn[key]);
            }
        }
        const bodyStr = typeof bodyIn === "string" ? bodyIn : JSON.stringify(bodyIn || {});
        if (bodyStr.length > PROXY_MAX_BODY_BYTES) {
            sendJson(res, 413, { error: "Forwarded body too large" });
            return;
        }
        const requestOptions = {
            method: "POST",
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                ...safeHeaders,
                "content-length": Buffer.byteLength(bodyStr),
            },
        };
        const proxyReq = https.request(requestOptions, (proxyRes) => {
            let respBody = "";
            let respAborted = false;
            proxyRes.on("data", (chunk) => {
                if (respAborted) return;
                respBody += chunk;
                if (respBody.length > PROXY_MAX_BODY_BYTES) {
                    respAborted = true;
                    proxyRes.destroy();
                }
            });
            proxyRes.on("end", () => {
                if (respAborted) {
                    sendJson(res, 502, { error: "Upstream response too large" });
                    return;
                }
                // Antwort weiterleiten — Status + Body, mit CORS-Headern für
                // den Browser. Content-Type vom Upstream wenn vorhanden.
                const contentType = proxyRes.headers["content-type"] || "application/json; charset=utf-8";
                res.writeHead(proxyRes.statusCode || 502, {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization",
                });
                res.end(respBody);
            });
            proxyRes.on("error", (err) => {
                sendJson(res, 502, { error: "Upstream stream error", details: err.message });
            });
        });
        proxyReq.setTimeout(PROXY_TIMEOUT_MS, () => {
            proxyReq.destroy(new Error("Upstream timeout"));
        });
        proxyReq.on("error", (err) => {
            sendJson(res, 502, { error: "Upstream request failed", details: err.message });
        });
        proxyReq.write(bodyStr);
        proxyReq.end();
    });
    req.on("error", (err) => {
        if (!aborted) sendJson(res, 400, { error: "Request stream error", details: err.message });
    });
}

function sendStaticFile(req, res) {
    // V8.41 — Query-String abschneiden (Cache-Buster anazhRealm.js?v=8.41).
    // Ein Webserver bedient statische Dateien anhand des Pfads; die Query
    // ist nur Cache-Schlüssel für Browser/CDN. Ohne dies 404 auf ?v=.
    const urlPath = (req.url || "/").split("?")[0];
    const reqPath = urlPath === "/" ? "/index.html" : urlPath;
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
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        });
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/api/save-state") {
        handleSaveState(req, res);
        return;
    }

    // V7.96 — Cloud-LLM-Proxy. Browser → save-server → Cloud-Endpoint.
    // CORS-Header werden vom save-server gesetzt (Browser akzeptiert),
    // Upstream-Response wird durchgereicht.
    if (req.method === "POST" && req.url === "/api/proxy/llm") {
        handleLlmProxy(req, res);
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
