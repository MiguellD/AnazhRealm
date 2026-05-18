const http = require("http");
const https = require("https");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

// V8.72 — W15 Phase 2: der GitHub-Fetch. Der `/api/vendor-world`-Endpunkt
// bekommt einen zweiten Eingang — statt eines hochgeladenen Bündels eine
// Repo-URL; der save-server holt die Dateien selbst (GitHub-Trees-API +
// Raw-Fetch, zero-dep über das https-Modul). Die Bases sind operator-
// konfigurierbar (GitHub Enterprise; der Offline-Smoke-Test zeigt sie auf
// ein lokales Fake-GitHub) — NICHT request-gesteuert: eine Browser-Seite
// kann nicht ändern, WOHIN der Server greift, nur welchen owner/repo. Die
// Sicherheit: die Repo-URL wird zu owner/repo/branch geparst (Regex-streng),
// die fertigen API-/Raw-URLs baut der Server selbst — kein SSRF, kein
// beliebiger Host. Datei-Pfade laufen durch dieselbe Phase-1-Wand.
const VENDOR_GH_API_BASE = (process.env.VENDOR_GH_API_BASE || "https://api.github.com").replace(/\/+$/, "");
const VENDOR_GH_RAW_BASE = (process.env.VENDOR_GH_RAW_BASE || "https://raw.githubusercontent.com").replace(/\/+$/, "");
const VENDOR_FETCH_TIMEOUT_MS = 30_000;

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

// W16 Phase 2 — der Content-Hash einer Welt: ein deterministischer sha256
// über die Datei-MENGE (sortierte Pfade, path\0content\0). Er gibt einer
// vendorten Welt eine peer-unabhängige Identität — zwei Spieler mit demselben
// Hash haben beweisbar dieselbe Welt. Der save-server ist die Hash-Autorität:
// er hat die Dateien (Schreib- UND Lese-Seite), der Browser muss den Hash
// nicht selbst rechnen (eine GitHub-vendorte Welt sieht der Client nie). Die
// Datei-id ist NICHT Teil des Hashs — die Identität ist der Inhalt, nicht der
// vom vendoernden Spieler gewählte Name.
function bundleContentHash(entries) {
    const h = crypto.createHash("sha256");
    const sorted = entries.slice().sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    for (const e of sorted) {
        h.update(e.path, "utf8");
        h.update("\0", "utf8");
        h.update(e.content, "utf8");
        h.update("\0", "utf8");
    }
    return h.digest("hex");
}

// Die Schreib-Seite (Phase 1): ein Bündel [{path,content}] validieren +
// nach worlds/<id>/ schreiben. worldId ist schon geprüft. Liefert
// {status, body} — der Caller sendet. BEIDE Eingänge (hochgeladenes
// Bündel + GitHub-Fetch) enden hier; W15 Phase 2 erbt diese Wand.
function applyVendorBundle(worldId, files) {
    if (!Array.isArray(files) || files.length === 0) {
        return { status: 400, body: { error: "No files in bundle" } };
    }
    if (files.length > VENDOR_MAX_FILES) {
        return { status: 400, body: { error: `Too many files (max ${VENDOR_MAX_FILES})` } };
    }
    const worldsRoot = path.join(PROJECT_ROOT, "worlds");
    const worldDir = path.join(worldsRoot, worldId);
    if (worldDir !== worldsRoot && !worldDir.startsWith(worldsRoot + path.sep)) {
        return { status: 403, body: { error: "Forbidden world directory" } };
    }
    const clean = [];
    let total = 0;
    let hasIndex = false;
    for (const f of files) {
        if (!f || typeof f !== "object") {
            return { status: 400, body: { error: "Bad file entry" } };
        }
        const rel = vendorSafeRelPath(f.path);
        if (!rel) {
            return { status: 400, body: { error: `Unsafe or unsupported file path: ${String(f.path).slice(0, 80)}` } };
        }
        if (typeof f.content !== "string") {
            return { status: 400, body: { error: `File ${rel} has no string content` } };
        }
        const bytes = Buffer.byteLength(f.content, "utf8");
        if (bytes > VENDOR_MAX_FILE_BYTES) {
            return { status: 413, body: { error: `File ${rel} exceeds per-file size cap` } };
        }
        total += bytes;
        if (total > VENDOR_MAX_TOTAL_BYTES) {
            return { status: 413, body: { error: "Bundle exceeds total size cap" } };
        }
        const target = path.join(worldDir, rel);
        if (target !== worldDir && !target.startsWith(worldDir + path.sep)) {
            return { status: 403, body: { error: `Path escapes world directory: ${rel}` } };
        }
        if (rel === "index.html") hasIndex = true;
        clean.push({ rel, content: f.content, target });
    }
    if (!hasIndex) {
        return { status: 400, body: { error: "Bundle must contain a root index.html (the world entry point)" } };
    }
    try {
        fs.mkdirSync(worldDir, { recursive: true });
        for (const c of clean) {
            fs.mkdirSync(path.dirname(c.target), { recursive: true });
            fs.writeFileSync(c.target, c.content, "utf8");
        }
    } catch (e) {
        return { status: 500, body: { error: "Vendor write failed", details: e.message } };
    }
    return {
        status: 200,
        body: {
            ok: true,
            worldId,
            fileCount: clean.length,
            totalBytes: total,
            dir: `worlds/${worldId}`,
            // W16 Phase 2 — die Content-Identität der Welt (für den Welt-Katalog).
            bundleHash: bundleContentHash(clean.map((c) => ({ path: c.rel, content: c.content }))),
        },
    };
}

// W16 Phase 1 — die Lese-Seite zum Auto-Vendor: das Bündel einer vendorten
// Welt von der Platte zurücklesen. Spiegelt applyVendorBundle (die Schreib-
// Seite) — dieselbe Endung-Whitelist + dieselben Deckel. Der W16-Sender ruft
// das auf, um die Dateien einer Welt über das Mesh an einen Mitspieler zu
// reichen. Lesen ist streng weniger gefährlich als Schreiben; die op-förmige
// id + die Verzeichnis-Eingrenzung sind die Wand. Liefert {status, body}.
function readVendorBundle(worldId) {
    if (!/^[a-z0-9_-]{1,40}$/.test(worldId)) {
        return { status: 400, body: { error: "Invalid worldId (a-z 0-9 - _, 1-40 Zeichen)" } };
    }
    const worldsRoot = path.join(PROJECT_ROOT, "worlds");
    const worldDir = path.join(worldsRoot, worldId);
    if (worldDir === worldsRoot || !worldDir.startsWith(worldsRoot + path.sep)) {
        return { status: 403, body: { error: "Forbidden world directory" } };
    }
    if (!fs.existsSync(worldDir) || !fs.statSync(worldDir).isDirectory()) {
        return { status: 404, body: { error: "World not found" } };
    }
    const files = [];
    let total = 0;
    const walk = (dir, prefix) => {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
            const abs = path.join(dir, ent.name);
            const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
            if (ent.isDirectory()) {
                walk(abs, rel);
                continue;
            }
            if (!ent.isFile()) continue;
            // Nur Text-Endungen — Binär-Assets vendort W15 nicht (gleicher Rand).
            if (!VENDOR_ALLOWED_EXT.has(path.extname(ent.name).toLowerCase())) continue;
            if (files.length >= VENDOR_MAX_FILES) throw new Error("too many files");
            const content = fs.readFileSync(abs, "utf8");
            const bytes = Buffer.byteLength(content, "utf8");
            if (bytes > VENDOR_MAX_FILE_BYTES) throw new Error(`file ${rel} too large`);
            total += bytes;
            if (total > VENDOR_MAX_TOTAL_BYTES) throw new Error("bundle too large");
            files.push({ path: rel, content });
        }
    };
    try {
        walk(worldDir, "");
    } catch (e) {
        return { status: 413, body: { error: `Bundle read failed: ${e.message}` } };
    }
    if (!files.length) {
        return { status: 404, body: { error: "World has no readable text files" } };
    }
    return {
        status: 200,
        body: {
            ok: true,
            worldId,
            files,
            fileCount: files.length,
            totalBytes: total,
            // W16 Phase 2 — derselbe Content-Hash wie die Schreib-Seite: liest
            // ein save-server eine Welt zurück, die er einst schrieb, stimmt
            // der Hash überein (die zwei Code-Pfade müssen sich einig sein).
            bundleHash: bundleContentHash(files),
        },
    };
}

// Zero-dep HTTP(S)-GET mit Timeout + Byte-Deckel + einem Redirect-Hop.
// expectJson → JSON.parse. Liefert ein Promise (resolve: Body, reject: Error).
function vendorHttpGet(urlStr, opts) {
    const o = opts || {};
    return new Promise((resolve, reject) => {
        let u;
        try {
            u = new URL(urlStr);
        } catch {
            reject(new Error("invalid url"));
            return;
        }
        const lib = u.protocol === "https:" ? https : http;
        const req = lib.get(
            urlStr,
            {
                headers: {
                    "User-Agent": "AnazhRealm-AutoVendor",
                    Accept: o.expectJson ? "application/vnd.github+json" : "*/*",
                },
            },
            (resp) => {
                if ((resp.statusCode === 301 || resp.statusCode === 302) && resp.headers.location) {
                    resp.destroy();
                    vendorHttpGet(new URL(resp.headers.location, urlStr).toString(), o).then(resolve, reject);
                    return;
                }
                if (resp.statusCode !== 200) {
                    resp.destroy();
                    reject(new Error(`HTTP ${resp.statusCode}`));
                    return;
                }
                const cap = o.maxBytes || VENDOR_MAX_FILE_BYTES;
                let body = "";
                let bad = false;
                resp.on("data", (c) => {
                    if (bad) return;
                    body += c;
                    if (body.length > cap) {
                        bad = true;
                        resp.destroy();
                        reject(new Error("response too large"));
                    }
                });
                resp.on("end", () => {
                    if (bad) return;
                    if (!o.expectJson) {
                        resolve(body);
                        return;
                    }
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error(`bad JSON: ${e.message}`));
                    }
                });
                resp.on("error", reject);
            }
        );
        req.setTimeout(VENDOR_FETCH_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
        req.on("error", reject);
    });
}

// Eine github.com-Repo-URL → {owner, repo, branch?, subpath?}, oder null.
// Akzeptiert .../<owner>/<repo>, .../tree/<branch>, .../tree/<branch>/<sub>.
// owner/repo/branch streng Regex-geprüft — nur diese Stücke reisen in die
// vom Server gebauten API-/Raw-URLs (kein SSRF).
function parseGithubRepoUrl(url) {
    let u;
    try {
        u = new URL(String(url));
    } catch {
        return null;
    }
    if (!/^(www\.)?github\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!/^[\w.-]{1,64}$/.test(owner) || !/^[\w.-]{1,64}$/.test(repo)) return null;
    let branch = null;
    let subpath = "";
    if (parts[2] === "tree" && parts[3]) {
        branch = parts[3];
        subpath = parts.slice(4).join("/");
    }
    if (branch && !/^[\w./-]{1,80}$/.test(branch)) return null;
    if (subpath && (subpath.includes("..") || !/^[\w./-]{1,160}$/.test(subpath))) return null;
    return { owner, repo, branch, subpath };
}

// W15 Phase 2 — ein GitHub-Repo holen: Default-Branch auflösen, den Baum
// per Trees-API lesen, die Text-Dateien (Endung-Whitelist, Größen-Deckel)
// roh fetchen. Liefert {ok, files:[{path,content}], branch} oder
// {ok:false, status, error}. NIE wird etwas ausgeführt — nur gelesen.
async function vendorFromGithub(worldId, repoUrl) {
    const gh = parseGithubRepoUrl(repoUrl);
    if (!gh) return { ok: false, status: 400, error: "Not a valid github.com repo URL" };
    try {
        let branch = gh.branch;
        if (!branch) {
            const meta = await vendorHttpGet(`${VENDOR_GH_API_BASE}/repos/${gh.owner}/${gh.repo}`, {
                expectJson: true,
                maxBytes: 1 << 20,
            });
            branch =
                meta && typeof meta.default_branch === "string" && /^[\w./-]{1,80}$/.test(meta.default_branch)
                    ? meta.default_branch
                    : "main";
        }
        const tree = await vendorHttpGet(
            `${VENDOR_GH_API_BASE}/repos/${gh.owner}/${gh.repo}/git/trees/${branch}?recursive=1`,
            { expectJson: true, maxBytes: 4 << 20 }
        );
        if (!tree || !Array.isArray(tree.tree)) {
            return { ok: false, status: 502, error: "GitHub tree response unreadable" };
        }
        const prefix = gh.subpath ? gh.subpath.replace(/\/+$/, "") + "/" : "";
        const picked = [];
        for (const entry of tree.tree) {
            if (!entry || entry.type !== "blob" || typeof entry.path !== "string") continue;
            let rel = entry.path;
            if (prefix) {
                if (!rel.startsWith(prefix)) continue;
                rel = rel.slice(prefix.length);
            }
            if (!rel || !VENDOR_ALLOWED_EXT.has(path.extname(rel).toLowerCase())) continue;
            if (typeof entry.size === "number" && entry.size > VENDOR_MAX_FILE_BYTES) {
                return { ok: false, status: 413, error: `File ${rel} too large` };
            }
            picked.push({ rel, ghPath: entry.path });
            if (picked.length > VENDOR_MAX_FILES) {
                return { ok: false, status: 400, error: `Repo has more than ${VENDOR_MAX_FILES} text files` };
            }
        }
        if (!picked.length) {
            return { ok: false, status: 400, error: "No text files found in the repo (at that path)" };
        }
        const files = [];
        let total = 0;
        for (const p of picked) {
            const rawUrl = `${VENDOR_GH_RAW_BASE}/${gh.owner}/${gh.repo}/${branch}/${p.ghPath
                .split("/")
                .map(encodeURIComponent)
                .join("/")}`;
            let content;
            try {
                content = await vendorHttpGet(rawUrl, { maxBytes: VENDOR_MAX_FILE_BYTES });
            } catch (e) {
                return { ok: false, status: 502, error: `Raw fetch failed for ${p.rel}: ${e.message}` };
            }
            total += Buffer.byteLength(content, "utf8");
            if (total > VENDOR_MAX_TOTAL_BYTES) {
                return { ok: false, status: 413, error: "Repo bundle exceeds total size cap" };
            }
            files.push({ path: p.rel, content });
        }
        return { ok: true, files, branch };
    } catch (e) {
        return { ok: false, status: 502, error: `GitHub fetch failed: ${e.message}` };
    }
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
        // W15 Phase 2 — der GitHub-Fetch-Eingang: eine Repo-URL statt eines
        // hochgeladenen Bündels. Der Server holt die Dateien selbst und
        // reicht sie an dieselbe Schreib-Seite (applyVendorBundle).
        if (typeof parsed.repoUrl === "string" && parsed.repoUrl.trim()) {
            vendorFromGithub(worldId, parsed.repoUrl.trim())
                .then((r) => {
                    if (!r.ok) {
                        sendJson(res, r.status || 502, { error: r.error });
                        return;
                    }
                    const out = applyVendorBundle(worldId, r.files);
                    if (out.body && out.body.ok) out.body.branch = r.branch;
                    sendJson(res, out.status, out.body);
                })
                .catch((e) => sendJson(res, 502, { error: "Vendor fetch crashed", details: e.message }));
            return;
        }
        const out = applyVendorBundle(worldId, parsed.files);
        sendJson(res, out.status, out.body);
    });
    req.on("error", (err) => {
        if (!aborted) sendJson(res, 400, { error: "Request stream error", details: err.message });
    });
}

// W16 Phase 1 — GET /api/vendor-bundle?worldId=<id>: das Bündel einer
// vendorten Welt zurückgeben. Der W16-Sender holt es so von der Platte und
// reicht es über das Mesh weiter.
function handleVendorBundleRead(req, res) {
    let worldId = "";
    try {
        worldId = (new URL(req.url, "http://localhost").searchParams.get("worldId") || "").trim().toLowerCase();
    } catch {
        worldId = "";
    }
    const out = readVendorBundle(worldId);
    sendJson(res, out.status, out.body);
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

    // W16 Phase 1 — Mesh-Welt-Verteilung: die Lese-Seite. Der W16-Sender holt
    // ein vendortes Welt-Bündel von der Platte zurück, um es über das Mesh an
    // einen Mitspieler zu reichen.
    if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/vendor-bundle") {
        handleVendorBundleRead(req, res);
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
