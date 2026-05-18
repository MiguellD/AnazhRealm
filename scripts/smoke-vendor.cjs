// V8.71 — W15 Phase 1: End-to-End-Beweis des Auto-Vendor-Pfads.
//
// Der headless playtest prüft die DATEN-Schicht (Bündel-Sanitizer, die
// customWorlds-Registrierung) mit einem gestubbten _vendorPostBundle. Er
// kann aber nicht prüfen, ob der save-server-Endpunkt /api/vendor-world
// ein Bündel WIRKLICH nach worlds/<id>/ schreibt, ob die Sicherheits-
// Wand hält UND ob eine so vendorte Welt danach betretbar ist.
//
// Teil A — der save-server-Round-Trip (reines HTTP):
//   1. ein gültiges Bündel landet auf der Platte (auch Unterverzeichnisse),
//   2. ein Pfad-Ausbruch (../) wird abgewiesen — nichts wird geschrieben,
//   3. eine Built-in-Welt-id (fluid) wird abgewiesen — kein Überschreiben,
//   4. eine verbotene Endung (.sh) wird abgewiesen,
//   5. ein Bündel ohne index.html wird abgewiesen,
//   6. eine ungültige Welt-id wird abgewiesen.
//
// Teil B — die vendorte Welt LÄUFT (echter Browser): die in Teil A
// geschriebene Welt wird in ein null-origin-iframe geladen — sie rendert
// + meldet sich + ihr Sandbox-Selbsttest bestätigt, dass die Wand hält.
// Damit ist die ganze Kette bewiesen: Bündel → save-server → Platte →
// sandgesichertes iframe, das die fremde Welt frei und doch eingeschlossen
// laufen lässt.
//
// Räumt das Test-Verzeichnis worlds/smoke-vendor-test/ am Ende weg.
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.join(__dirname, "..");
const TEST_ID = "smoke-vendor-test";
const TEST_DIR = path.join(ROOT, "worlds", TEST_ID);
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

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, "save-server.js")], { stdio: ["ignore", "pipe", "pipe"] });
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

    // Falls ein früherer Lauf abbrach: das Test-Verzeichnis vorab räumen.
    fs.rmSync(TEST_DIR, { recursive: true, force: true });

    console.log("Starte save-server ...");
    const server = await startSaveServer();
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
        // === Teil A — der save-server-Round-Trip ===
        const engineContent = "// eine kleine fremde Engine\nconsole.log('schwarm');";
        const valid = await postVendor({
            worldId: TEST_ID,
            files: [
                { path: "index.html", content: TEST_WORLD_HTML },
                { path: "lib/engine.js", content: engineContent },
            ],
        });
        check(
            "Ein gültiges Bündel wird angenommen (HTTP 200, ok)",
            valid.status === 200 && valid.body && valid.body.ok === true && valid.body.fileCount === 2,
            `status=${valid.status}`
        );
        const indexPath = path.join(TEST_DIR, "index.html");
        const enginePath = path.join(TEST_DIR, "lib", "engine.js");
        check(
            "Die index.html liegt in worlds/<id>/ mit dem richtigen Inhalt",
            fs.existsSync(indexPath) && fs.readFileSync(indexPath, "utf8") === TEST_WORLD_HTML
        );
        check(
            "Eine Datei im Unterverzeichnis (lib/engine.js) wird mit angelegt",
            fs.existsSync(enginePath) && fs.readFileSync(enginePath, "utf8") === engineContent
        );

        // Pfad-Ausbruch — ../ wird abgewiesen.
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
            "Ein Pfad-Ausbruch (../) wird abgewiesen (HTTP 4xx)",
            traversal.status >= 400 && traversal.status < 500,
            `status=${traversal.status}`
        );
        check("Der Ausbruch-Pfad wurde NICHT geschrieben", !fs.existsSync(escapeTarget));

        // Built-in-Welt-id — fluid darf nicht überschrieben werden.
        const fluidIndex = path.join(ROOT, "worlds", "fluid", "index.html");
        const fluidBefore = fs.existsSync(fluidIndex) ? fs.readFileSync(fluidIndex, "utf8") : null;
        const reserved = await postVendor({
            worldId: "fluid",
            files: [{ path: "index.html", content: "<!-- gekapert -->" }],
        });
        check(
            "Eine Built-in-Welt-id (fluid) wird abgewiesen (HTTP 403)",
            reserved.status === 403,
            `status=${reserved.status}`
        );
        check(
            "Die Built-in-Welt worlds/fluid/ blieb unberührt",
            fluidBefore !== null && fs.readFileSync(fluidIndex, "utf8") === fluidBefore
        );

        // Verbotene Datei-Endung.
        const badExt = await postVendor({
            worldId: TEST_ID,
            files: [
                { path: "index.html", content: TEST_WORLD_HTML },
                { path: "install.sh", content: "rm -rf /" },
            ],
        });
        check(
            "Eine verbotene Datei-Endung (.sh) wird abgewiesen (HTTP 4xx)",
            badExt.status >= 400 && badExt.status < 500,
            `status=${badExt.status}`
        );

        // Bündel ohne index.html.
        const noIndex = await postVendor({
            worldId: TEST_ID,
            files: [{ path: "main.js", content: "console.log(1);" }],
        });
        check(
            "Ein Bündel ohne index.html wird abgewiesen (HTTP 4xx)",
            noIndex.status >= 400 && noIndex.status < 500,
            `status=${noIndex.status}`
        );

        // Ungültige Welt-id.
        const badId = await postVendor({
            worldId: "Böse ID!",
            files: [{ path: "index.html", content: TEST_WORLD_HTML }],
        });
        check(
            "Eine ungültige Welt-id wird abgewiesen (HTTP 4xx)",
            badId.status >= 400 && badId.status < 500,
            `status=${badId.status}`
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
        // Die frisch vendorte Welt in ein null-origin-iframe laden.
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
            "Die vendorte Welt läuft (ihr Skript lief im sandgesicherten iframe)",
            vw.events.some((t) => /vendorte Welt laeuft/.test(t)),
            vw.events[0] || "(kein Lauf-Ereignis)"
        );
        const isoEv = vw.events.find((t) => /Sandbox-Wand haelt/.test(t));
        check("Die Sandbox-Wand hält — die vendorte Welt erreicht AnazhRealm nicht", !!isoEv, isoEv || "");
        check(
            "Kein Wand-Durchbruch gemeldet",
            !vw.events.some((t) => /WARNUNG|durchlaessig/.test(t)),
            vw.events.find((t) => /WARNUNG/.test(t)) || ""
        );
        await page.screenshot({ path: path.join(ROOT, "artifacts", "smoke-vendor.png") }).catch(() => {});
        console.log("Screenshot: artifacts/smoke-vendor.png");
    } finally {
        await browser.close();
        server.kill();
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
        fs.rmSync(path.join(ROOT, "worlds", "vendor-escape-proof.js"), { force: true });
    }

    if (failures.length) {
        console.log(`\n❌ ${failures.length} Smoke-Check(s) fehlgeschlagen.`);
        process.exit(1);
    }
    console.log("\n✅ Auto-Vendor: ein fremdes Bündel dockt an, läuft sandgesichert — die Wand hält.");
})().catch((err) => {
    console.error("smoke-vendor abgebrochen:", err && err.message);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    process.exit(1);
});
