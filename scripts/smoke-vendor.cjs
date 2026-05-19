// V8.71/V8.72 — W15: End-to-End-Beweis des Auto-Vendor-Pfads.
//
// Der headless playtest prüft die DATEN-Schicht (Bündel-Sanitizer, die
// customWorlds-Registrierung) mit gestubbten Netz-Schritten. Er kann aber
// nicht prüfen, ob der save-server-Endpunkt /api/vendor-world Bündel
// WIRKLICH nach worlds/<id>/ schreibt, ob die Sicherheits-Wand hält, ob
// eine vendorte Welt betretbar ist UND ob der GitHub-Fetch funktioniert.
//
// Teil A — der save-server-Round-Trip, Bündel-Pfad (reines HTTP).
// Teil B — die vendorte Welt LÄUFT (echter Browser, null-origin-iframe).
// Teil C — der GitHub-Fetch (W15 Phase 2): ein lokales Fake-GitHub liefert
//   Trees-API + Raw-Dateien; der save-server (mit VENDOR_GH_*-Bases auf das
//   Fake gezeigt) holt das Repo selbst. So bleibt der Test offline +
//   deterministisch — kein echtes GitHub, keine Rate-Limits.
//
// Räumt die Test-Verzeichnisse worlds/smoke-vendor-test/ + worlds/
// smoke-vendor-gh/ am Ende weg.
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.join(__dirname, "..");
const TEST_ID = "smoke-vendor-test";
const GH_ID = "smoke-vendor-gh";
const GH_SLASH_ID = "smoke-vendor-gh-slash";
const TEST_DIR = path.join(ROOT, "worlds", TEST_ID);
const GH_DIR = path.join(ROOT, "worlds", GH_ID);
const GH_SLASH_DIR = path.join(ROOT, "worlds", GH_SLASH_ID);
const HOST_URL = "http://127.0.0.1:4312/index.html";

// Die Test-Welt: eine self-contained HTML-Datei (klassisches Inline-Skript —
// ein null-origin-Document kann keine same-origin-Module laden). Sie meldet
// sich beim Laden und führt einen Sandbox-Selbsttest aus.
const TEST_WORLD_HTML = [
    "<!doctype html><meta charset=utf-8><title>Smoke-Vendor-Welt</title>",
    "<style>html,body{margin:0;background:#0a1018;color:#8fe;font:14px monospace}</style>",
    "<body><h1 id=h>vendorte Welt erwacht</h1><script>",
    "(function(){",
    "  function send(t,x){try{parent.postMessage({type:t,text:x},'*');}catch(e){}}",
    "  var isolated=false;",
    "  try{void window.parent.localStorage.length;void window.parent.document.title;}",
    "  catch(e){isolated=true;}",
    "  document.getElementById('h').textContent=isolated?'vendorte Welt: isoliert':'vendorte Welt: WAND DURCHLAESSIG';",
    "  send('ready');",
    "  window.addEventListener('message',function(ev){",
    "    var m=ev.data;",
    "    if(m&&m.type==='enter'){",
    "      send('event','Die vendorte Welt laeuft.');",
    "      send('event',isolated?'Sandbox-Wand haelt.':'WARNUNG durchlaessig');",
    "    }",
    "  });",
    "})();",
    "</script></body>",
].join("\n");

const GH_ENGINE_JS = "// eine kleine fremde Engine, aus dem Repo geholt\nconsole.log('repo-engine');";

// Ein lokales Fake-GitHub: spiegelt die Branches-API + die Trees-API + die
// Raw-Endpunkte in genau der von GitHub dokumentierten Form. So testet
// Teil C den echten save-server-Fetch-Code, ohne je das echte GitHub zu
// berühren. Zwei Repos: "fake/demo" (Default-Branch "main") und
// "fake/slashdemo" (eine Branch mit Slash, "feature/x" — W15-Politur).
function startFakeGithub() {
    const treeOf = (sha) => ({
        sha,
        truncated: false,
        tree: [
            { path: "lib", type: "tree" },
            { path: "index.html", type: "blob", size: Buffer.byteLength(TEST_WORLD_HTML) },
            { path: "lib/engine.js", type: "blob", size: Buffer.byteLength(GH_ENGINE_JS) },
            // Binär — muss von der Endung-Whitelist gefiltert werden.
            { path: "logo.png", type: "blob", size: 2048 },
        ],
    });
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            const u = (req.url || "").split("?")[0];
            const json = (obj) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(obj));
            };
            const text = (t) => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(t);
            };
            if (u === "/repos/fake/demo") {
                json({ default_branch: "main" });
            } else if (u === "/repos/fake/demo/branches/main") {
                json({ name: "main", commit: { sha: "deadbeef" } });
            } else if (u === "/repos/fake/demo/git/trees/deadbeef") {
                json(treeOf("deadbeef"));
            } else if (u === "/raw/fake/demo/deadbeef/index.html") {
                text(TEST_WORLD_HTML);
            } else if (u === "/raw/fake/demo/deadbeef/lib/engine.js") {
                text(GH_ENGINE_JS);
                // fake/slashdemo — die Branch "feature/x" trägt einen Slash.
                // Der save-server probiert die längste auflösbare Branch
                // zuerst: "feature/x" → 200, "feature" wird nie gefragt.
            } else if (u === "/repos/fake/slashdemo/branches/feature/x") {
                json({ name: "feature/x", commit: { sha: "cafe1234" } });
            } else if (u === "/repos/fake/slashdemo/git/trees/cafe1234") {
                json(treeOf("cafe1234"));
            } else if (u === "/raw/fake/slashdemo/cafe1234/index.html") {
                text(TEST_WORLD_HTML);
            } else if (u === "/raw/fake/slashdemo/cafe1234/lib/engine.js") {
                text(GH_ENGINE_JS);
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("not found");
            }
        });
        srv.listen(0, "127.0.0.1", () => resolve({ srv, port: srv.address().port }));
    });
}

function startSaveServer(extraEnv) {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, "save-server.js")], {
            stdio: ["ignore", "pipe", "pipe"],
            env: Object.assign({}, process.env, extraEnv || {}),
        });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("save-server startete nicht innerhalb 6 s"));
        }, 6000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

// POSTet einen JSON-Body an den save-server, liefert {status, body}.
function postVendor(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request(
            {
                host: "127.0.0.1",
                port: 4312,
                method: "POST",
                path: "/api/vendor-world",
                headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
            },
            (res) => {
                let body = "";
                res.on("data", (c) => (body += c));
                res.on("end", () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(body);
                    } catch {
                        parsed = null;
                    }
                    resolve({ status: res.statusCode, body: parsed });
                });
            }
        );
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

(async () => {
    const failures = [];
    function check(name, ok, detail) {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    // Falls ein früherer Lauf abbrach: die Test-Verzeichnisse vorab räumen.
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    fs.rmSync(GH_DIR, { recursive: true, force: true });
    fs.rmSync(GH_SLASH_DIR, { recursive: true, force: true });

    console.log("Starte Fake-GitHub + save-server ...");
    const fake = await startFakeGithub();
    const server = await startSaveServer({
        VENDOR_GH_API_BASE: `http://127.0.0.1:${fake.port}`,
        VENDOR_GH_RAW_BASE: `http://127.0.0.1:${fake.port}/raw`,
    });
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });

    try {
        // === Teil A — der save-server-Round-Trip (Bündel-Pfad) ===
        const valid = await postVendor({
            worldId: TEST_ID,
            files: [
                { path: "index.html", content: TEST_WORLD_HTML },
                { path: "lib/engine.js", content: GH_ENGINE_JS },
            ],
        });
        check(
            "Bündel-Pfad: ein gültiges Bündel wird angenommen (HTTP 200, ok)",
            valid.status === 200 && valid.body && valid.body.ok === true && valid.body.fileCount === 2,
            `status=${valid.status}`
        );
        const indexPath = path.join(TEST_DIR, "index.html");
        check(
            "Bündel-Pfad: index.html + Unterverzeichnis-Datei liegen in worlds/<id>/",
            fs.existsSync(indexPath) &&
                fs.readFileSync(indexPath, "utf8") === TEST_WORLD_HTML &&
                fs.existsSync(path.join(TEST_DIR, "lib", "engine.js"))
        );

        const escapeTarget = path.join(ROOT, "worlds", "vendor-escape-proof.js");
        fs.rmSync(escapeTarget, { force: true });
        const traversal = await postVendor({
            worldId: TEST_ID,
            files: [
                { path: "index.html", content: TEST_WORLD_HTML },
                { path: "../vendor-escape-proof.js", content: "/* sollte nie geschrieben werden */" },
            ],
        });
        check(
            "Bündel-Pfad: ein Pfad-Ausbruch (../) wird abgewiesen + nichts geschrieben",
            traversal.status >= 400 && traversal.status < 500 && !fs.existsSync(escapeTarget),
            `status=${traversal.status}`
        );

        const fluidIndex = path.join(ROOT, "worlds", "fluid", "index.html");
        const fluidBefore = fs.existsSync(fluidIndex) ? fs.readFileSync(fluidIndex, "utf8") : null;
        const reserved = await postVendor({
            worldId: "fluid",
            files: [{ path: "index.html", content: "<!-- gekapert -->" }],
        });
        check(
            "Bündel-Pfad: eine Built-in-Welt-id (fluid) wird abgewiesen (HTTP 403), worlds/fluid/ unberührt",
            reserved.status === 403 && fluidBefore !== null && fs.readFileSync(fluidIndex, "utf8") === fluidBefore
        );

        const badExt = await postVendor({
            worldId: TEST_ID,
            files: [
                { path: "index.html", content: TEST_WORLD_HTML },
                { path: "install.sh", content: "rm -rf /" },
            ],
        });
        check(
            "Bündel-Pfad: eine verbotene Endung (.sh) wird abgewiesen (HTTP 4xx)",
            badExt.status >= 400 && badExt.status < 500
        );

        const noIndex = await postVendor({ worldId: TEST_ID, files: [{ path: "main.js", content: "x" }] });
        check(
            "Bündel-Pfad: ein Bündel ohne index.html wird abgewiesen (HTTP 4xx)",
            noIndex.status >= 400 && noIndex.status < 500
        );

        // === Teil B — die vendorte Welt läuft sandgesichert ===
        const page = await browser.newPage();
        await page.setViewport({ width: 900, height: 560 });
        await page.goto(HOST_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(500);
        await page.evaluate(() => {
            document.querySelectorAll("dialog[open]").forEach((d) => {
                try {
                    d.close();
                } catch (e) {
                    /* egal */
                }
            });
        });
        await page.evaluate((worldPath) => {
            const ifr = document.createElement("iframe");
            ifr.setAttribute("sandbox", "allow-scripts");
            ifr.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:99999";
            window.__vendor = { ready: false, events: [] };
            window.addEventListener("message", (e) => {
                if (e.source !== ifr.contentWindow) return;
                const m = e.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready") {
                    window.__vendor.ready = true;
                    ifr.contentWindow.postMessage({ type: "enter", avatar: { name: "Schöpfer" } }, "*");
                } else if (m.type === "event") {
                    window.__vendor.events.push(String(m.text || ""));
                }
            });
            ifr.src = worldPath;
            document.body.appendChild(ifr);
        }, `worlds/${TEST_ID}/index.html`);
        await sleep(1800);
        const vw = await page.evaluate(() => window.__vendor);
        check("Die vendorte Welt lädt + meldet sich (ready-Handshake)", vw.ready === true);
        check(
            "Die vendorte Welt läuft + ihre Sandbox-Wand hält",
            vw.events.some((t) => /vendorte Welt laeuft/.test(t)) &&
                vw.events.some((t) => /Sandbox-Wand haelt/.test(t)) &&
                !vw.events.some((t) => /WARNUNG|durchlaessig/.test(t)),
            vw.events.join(" | ") || "(keine Ereignisse)"
        );
        await page.screenshot({ path: path.join(ROOT, "artifacts", "smoke-vendor.png") }).catch(() => {});

        // === Teil C — der GitHub-Fetch (W15 Phase 2) ===
        // Eine echte github.com-URL — der save-server holt die Dateien aber
        // vom Fake-GitHub (VENDOR_GH_*-Bases). Repo "fake/demo": index.html
        // + lib/engine.js (Text) + logo.png (Binär, muss gefiltert werden).
        const gh = await postVendor({ worldId: GH_ID, repoUrl: "https://github.com/fake/demo" });
        check(
            "GitHub-Fetch: ein Repo wird geholt + geschrieben (HTTP 200, branch main)",
            gh.status === 200 && gh.body && gh.body.ok === true && gh.body.branch === "main",
            `status=${gh.status} fileCount=${gh.body && gh.body.fileCount}`
        );
        check(
            "GitHub-Fetch: die Text-Dateien landen in worlds/<id>/ (index.html + lib/engine.js)",
            fs.existsSync(path.join(GH_DIR, "index.html")) &&
                fs.readFileSync(path.join(GH_DIR, "index.html"), "utf8") === TEST_WORLD_HTML &&
                fs.existsSync(path.join(GH_DIR, "lib", "engine.js"))
        );
        check(
            "GitHub-Fetch: die Binär-Datei (logo.png) wird von der Endung-Whitelist gefiltert",
            !fs.existsSync(path.join(GH_DIR, "logo.png")) && gh.body && gh.body.fileCount === 2
        );
        const nonGh = await postVendor({ worldId: "smoke-vendor-evil", repoUrl: "https://evil.example.com/a/b" });
        check(
            "GitHub-Fetch: eine Nicht-github.com-URL wird abgewiesen (HTTP 4xx)",
            nonGh.status >= 400 && nonGh.status < 500,
            `status=${nonGh.status}`
        );
        // W15-Politur — eine /tree/feature/x-URL: die Branch trägt einen
        // Slash. Vor V9.02 wurde sie als Branch "feature" + Pfad "x"
        // fehlinterpretiert (Trees-API 404). Jetzt löst der save-server die
        // echte Branch "feature/x" auf + holt gegen ihre Commit-SHA.
        const ghSlash = await postVendor({
            worldId: GH_SLASH_ID,
            repoUrl: "https://github.com/fake/slashdemo/tree/feature/x",
        });
        check(
            "GitHub-Fetch: ein Slash-Branch (feature/x) wird korrekt aufgelöst (HTTP 200, branch feature/x)",
            ghSlash.status === 200 &&
                ghSlash.body &&
                ghSlash.body.ok === true &&
                ghSlash.body.branch === "feature/x",
            `status=${ghSlash.status} branch=${ghSlash.body && ghSlash.body.branch}`
        );
        check(
            "GitHub-Fetch: die Slash-Branch-Welt landet in worlds/<id>/ (index.html geschrieben)",
            fs.existsSync(path.join(GH_SLASH_DIR, "index.html")) &&
                fs.readFileSync(path.join(GH_SLASH_DIR, "index.html"), "utf8") === TEST_WORLD_HTML
        );
        console.log("Screenshot: artifacts/smoke-vendor.png");
    } finally {
        await browser.close();
        server.kill();
        fake.srv.close();
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
        fs.rmSync(GH_DIR, { recursive: true, force: true });
        fs.rmSync(GH_SLASH_DIR, { recursive: true, force: true });
        fs.rmSync(path.join(ROOT, "worlds", "vendor-escape-proof.js"), { force: true });
    }

    if (failures.length) {
        console.log(`\n❌ ${failures.length} Smoke-Check(s) fehlgeschlagen.`);
        process.exit(1);
    }
    console.log("\n✅ Auto-Vendor: ein Bündel UND ein GitHub-Repo docken an — sandgesichert, die Wand hält.");
})().catch((err) => {
    console.error("smoke-vendor abgebrochen:", err && err.message);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    fs.rmSync(GH_DIR, { recursive: true, force: true });
    process.exit(1);
});
