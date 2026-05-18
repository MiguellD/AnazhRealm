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

// V8.71 — W15 Phase 1: der Auto-Vendor-Pfad. Der save-server schreibt ein
// fremdes Welt-Bündel nach worlds/<id>/, damit eine neue Welt ohne
// Handarbeit andockt. Wie der LLM-Proxy: der save-server läuft lokal auf
// 127.0.0.1, die Vendor-Geste ist ein Dev-Werkzeug; ein Mensch reviewt +
// committet das worlds/<id>/-Verzeichnis, danach hat es jeder (git ist die
// unzerstörbare Bibliothek).
//
// Sicherheits-Disziplin (der save-server schreibt sonst NUR die eine
// allowlistete anazhRealmState.json — dieser Endpunkt erweitert das auf
// worlds/<id>/, also ist die Wand streng):
//   - worldId: /^[a-z0-9_-]{1,40}$/, NICHT eine Built-in-Welt
//   - jeder Datei-Pfad relativ: kein "..", kein führender Slash, kein
//     Backslash, kein Doppelpunkt, kein Null-Byte; das Ziel MUSS in
//     worlds/<id>/ bleiben (path.join + startsWith-Prüfung)
//   - Endung-Whitelist (nur Text — html/js/css/json/...); kein .sh/.exe
//   - Deckel: Datei-Anzahl, je-Datei-Bytes, Gesamt-Bytes, roher Request
//   - NIE wird etwas ausgeführt — nur fs.writeFileSync (reines Schreiben)
// Die Limits müssen mit anazhRealm.js (AnazhRealm.VENDOR_LIMITS) übereinstimmen.
const VENDOR_MAX_FILES = 64;
const VENDOR_MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MiB je Datei
const VENDOR_MAX_TOTAL_BYTES = 12 * 1024 * 1024; // 12 MiB gesamt
const VENDOR_MAX_BODY_BYTES = 20 * 1024 * 1024; // 20 MiB roher Request (JSON-Overhead)
// Built-in-Welt-Verzeichnisse — ein Vendor darf sie NICHT überschreiben.
const VENDOR_RESERVED_IDS = new Set(["skeleton", "fluid", "terrain", "schwarm", "translated"]);
const VENDOR_ALLOWED_EXT = new Set([".html", ".htm", ".js", ".mjs", ".css", ".json", ".txt", ".md", ".glsl"]);

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

// Liefert den gesäuberten relativen Pfad einer Bündel-Datei — oder null,
// wenn er aus worlds/<id>/ ausbrechen könnte oder eine verbotene Endung
// trägt. posix.normalize + Segment-Prüfung: ein "../"-Ausbruch ist
// danach unmöglich, danach prüft handleVendorWorld noch per startsWith.
function vendorSafeRelPath(p) {
    if (typeof p !== "string" || !p || p.length > 200) return null;
    if (p.includes("\0") || p.includes("\\") || p.includes(":")) return null;
    const norm = path.posix.normalize(p.replace(/^\/+/, ""));
    if (!norm || norm === "." || norm.startsWith("..") || norm.includes("/../") || norm.startsWith("/")) {
        return null;
    }
    if (norm.split("/").some((s) => s === "" || s === "." || s === "..")) return null;
    if (!VENDOR_ALLOWED_EXT.has(path.extname(norm).toLowerCase())) return null;
    return norm;
}

function handleVendorWorld(req, res) {
    let rawBody = "";
    let aborted = false;
    req.on("data", (chunk) => {
        if (aborted) return;
        rawBody += chunk;
        if (rawBody.length > VENDOR_MAX_BODY_BYTES) {
            aborted = true;
            sendJson(res, 413, { error: "Bundle too large" });
            req.destroy();
        }
    });
    req.on("end", () => {
        if (aborted) return;
        let parsed;
        try {
            parsed = JSON.parse(rawBody || "{}");
        } catch (e) {
            sendJson(res, 400, { error: "Invalid JSON", details: e.message });
            return;
        }
        const worldId = String(parsed.worldId || "")
            .trim()
            .toLowerCase();
        if (!/^[a-z0-9_-]{1,40}$/.test(worldId)) {
            sendJson(res, 400, { error: "Invalid worldId (a-z 0-9 - _, 1-40 Zeichen)" });
            return;
        }
        if (VENDOR_RESERVED_IDS.has(worldId)) {
            sendJson(res, 403, { error: "worldId is reserved (built-in world)" });
            return;
        }
        const files = parsed.files;
        if (!Array.isArray(files) || files.length === 0) {
            sendJson(res, 400, { error: "No files in bundle" });
            return;
        }
        if (files.length > VENDOR_MAX_FILES) {
            sendJson(res, 400, { error: `Too many files (max ${VENDOR_MAX_FILES})` });
            return;
        }
        const worldsRoot = path.join(PROJECT_ROOT, "worlds");
        const worldDir = path.join(worldsRoot, worldId);
        if (worldDir !== worldsRoot && !worldDir.startsWith(worldsRoot + path.sep)) {
            sendJson(res, 403, { error: "Forbidden world directory" });
            return;
        }
        const clean = [];
        let total = 0;
        let hasIndex = false;
        for (const f of files) {
            if (!f || typeof f !== "object") {
                sendJson(res, 400, { error: "Bad file entry" });
                return;
            }
            const rel = vendorSafeRelPath(f.path);
            if (!rel) {
                sendJson(res, 400, { error: `Unsafe or unsupported file path: ${String(f.path).slice(0, 80)}` });
                return;
            }
            if (typeof f.content !== "string") {
                sendJson(res, 400, { error: `File ${rel} has no string content` });
                return;
            }
            const bytes = Buffer.byteLength(f.content, "utf8");
            if (bytes > VENDOR_MAX_FILE_BYTES) {
                sendJson(res, 413, { error: `File ${rel} exceeds per-file size cap` });
                return;
            }
            total += bytes;
            if (total > VENDOR_MAX_TOTAL_BYTES) {
                sendJson(res, 413, { error: "Bundle exceeds total size cap" });
                return;
            }
            const target = path.join(worldDir, rel);
            if (target !== worldDir && !target.startsWith(worldDir + path.sep)) {
                sendJson(res, 403, { error: `Path escapes world directory: ${rel}` });
                return;
            }
            if (rel === "index.html") hasIndex = true;
            clean.push({ rel, content: f.content, target });
        }
        if (!hasIndex) {
            sendJson(res, 400, { error: "Bundle must contain a root index.html (the world entry point)" });
            return;
        }
        try {
            fs.mkdirSync(worldDir, { recursive: true });
            for (const c of clean) {
                fs.mkdirSync(path.dirname(c.target), { recursive: true });
                fs.writeFileSync(c.target, c.content, "utf8");
            }
        } catch (e) {
            sendJson(res, 500, { error: "Vendor write failed", details: e.message });
            return;
        }
        sendJson(res, 200, {
            ok: true,
            worldId,
            fileCount: clean.length,
            totalBytes: total,
            dir: `worlds/${worldId}`,
        });
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

    // V8.71 — W15 Phase 1: Auto-Vendor. Browser → save-server → worlds/<id>/.
    // Ein fremdes Welt-Bündel landet auf der Platte, ohne dass jemand
    // anazhRealm.js anfasst. Strenge Pfad-/Größen-/Endung-Wand.
    if (req.method === "POST" && req.url === "/api/vendor-world") {
        handleVendorWorld(req, res);
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
