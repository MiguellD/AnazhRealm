// W17 Transport-Shim — End-to-End-Beweis (Phase A Injektion + Phase B Send).
//
// Der headless playtest prüft die DATEN-Schicht (multiplayer-Flag, der
// ?anazh-shim=1-Marker, der subworld-net-Broadcast, die Sub-Raum-Eingrenzung).
// Er kann aber nicht prüfen, ob der Shim in einem ECHTEN null-origin-iframe
// `window.WebSocket` wirklich ersetzt und ein `send()` über die Sandbox-
// Grenze als postMessage zu AnazhRealm fliesst. Dieser Test:
//   1. der save-server injiziert den Shim in eine Welt-index.html, wenn die
//      Anfrage `?anazh-shim=1` trägt — und NICHT ohne den Marker,
//   2. der echte Sende-Pfad: eine Test-Welt im echten Portal-iframe öffnet
//      einen Shim-`WebSocket`, sendet einen Ping; AnazhRealms echtes
//      _portalNetReceive macht daraus einen subworld-net-Mesh-Broadcast.
//
// W17 Phase B-Relay verteilt ein `ws-send` über das W7-Mesh — das Mesh IST
// der Server. Den Zwei-Browser-Durchlauf (A's ws-send erscheint bei B) prüft
// smoke-webrtc.cjs; dieser Test prüft die EINE Seite: iframe → Shim →
// _portalNetReceive → subworld-net-Broadcast.
//
// Voraussetzung: puppeteer als devDependency (`npm install`).
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const HOST_URL = "http://127.0.0.1:4312/index.html";
const TEST_ID = "_shimtest";
const TEST_DIR = path.join(ROOT, "worlds", TEST_ID);
const WORLD_PATH = `worlds/${TEST_ID}/index.html`;

// Die Test-Welt: sie öffnet einen WebSocket, sendet einen Ping und meldet
// über den `event`-Rückkanal, ob der Shim installiert ist + dass sie
// gesendet hat. KEIN echter Server existiert — der Shim trägt den Verkehr
// als subworld-net über AnazhRealms Mesh.
const TEST_WORLD_HTML = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>W17 Shim-Test-Welt</title></head>
<body>
<p>W17 Transport-Shim — Test-Welt</p>
<script>
(function () {
  function note(t) { try { parent.postMessage({ type: "event", text: String(t) }, "*"); } catch (e) {} }
  note(window.__anazhShim === true ? "shim-installed" : "shim-missing");
  try {
    var ws = new WebSocket("ws://anazh-subworld-test/");
    ws.addEventListener("open", function () { ws.send("shim-ping"); note("shim-sent"); });
    ws.addEventListener("message", function (ev) { note("shim-recv:" + ev.data); });
    ws.addEventListener("error", function () { note("shim-ws-error"); });
  } catch (e) { note("shim-ws-throw:" + (e && e.message)); }
})();
</script>
</body>
</html>
`;

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function startProc(script, readyRe) {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [path.join(ROOT, script)], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error(`${script} startete nicht innerhalb 6 s`));
        }, 6000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && readyRe.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const failures = [];
    function check(name, ok, detail) {
        console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    // Die Test-Welt anlegen (direkt auf die Platte — der Shim wird zur
    // Serve-Zeit injiziert, unabhängig davon wie die Datei dorthin kam).
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.writeFileSync(path.join(TEST_DIR, "index.html"), TEST_WORLD_HTML, "utf8");

    console.log("Starte save-server ...");
    const saveServer = await startProc("save-server.js", /läuft/);

    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 640 });

        // ── Teil A — die Serve-Zeit-Injektion ──
        // Mit dem Marker: der Shim ist injiziert. Ohne: die Datei ist rein.
        await page.goto(HOST_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Shim-exklusiver Marker: `window.WebSocket=Shim` schreibt nur der
        // injizierte Shim — die Test-Welt referenziert `__anazhShim` selbst,
        // also wäre der untauglich.
        const SHIM_MARK = "window.WebSocket=Shim";
        const withMarker = await page.evaluate(
            (w) => fetch(w + "?anazh-shim=1").then((r) => r.text()),
            WORLD_PATH
        );
        check(
            "Shim-Injektion: ?anazh-shim=1 liefert die index.html MIT dem Transport-Shim",
            withMarker.includes(SHIM_MARK) && withMarker.includes("<head><script>"),
            withMarker.includes(SHIM_MARK) ? "" : "(Shim fehlt)"
        );
        const withoutMarker = await page.evaluate((w) => fetch(w).then((r) => r.text()), WORLD_PATH);
        check(
            "Shim-Injektion: ohne Marker bleibt die index.html unberührt (Welt-Datei rein)",
            !withoutMarker.includes(SHIM_MARK),
            withoutMarker.includes(SHIM_MARK) ? "(Shim fälschlich injiziert)" : ""
        );

        // ── Teil B — der echte Sende-Pfad (Phase B-Relay) ──
        // Auf AnazhRealms Boot warten, p2pSend hooken (im Ein-Seiten-Test
        // steht kein Mesh — der Hook IST der Empfänger), dann das echte
        // Portal-Overlay bauen: _buildPortalOverlay → echtes sandboxed iframe
        // → der Shim → _portalNetReceive → subworld-net-Broadcast.
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.worldJournal,
            { timeout: 30000 }
        );
        await page.evaluate(() => {
            window.__subnetOut = [];
            const r = window.anazhRealm;
            const orig = r.p2pSend.bind(r);
            r.p2pSend = (obj) => {
                if (obj && obj.type === "subworld-net") window.__subnetOut.push(obj);
                return orig(obj);
            };
        });
        await page.evaluate((world) => {
            window.anazhRealm._buildPortalOverlay({
                world,
                label: "Shim-Test-Welt",
                multiplayer: true,
                trust: "sandboxed",
            });
        }, WORLD_PATH);
        await sleep(3000);

        const portalState = await page.evaluate(() => {
            const r = window.anazhRealm;
            const po = r._portalOverlay;
            const journal = (r.state.worldJournal.entries || []).map((e) => String(e.text || ""));
            return {
                multiplayer: !!(po && po.multiplayer),
                src: po && po.iframe ? po.iframe.getAttribute("src") : "",
                netChannels: po ? po.netChannels.size : 0,
                journal,
                subnetOut: window.__subnetOut || [],
            };
        });

        check(
            "Das Portal-Overlay trägt die Multiplayer-Marke + lädt mit ?anazh-shim=1",
            portalState.multiplayer === true && /\?anazh-shim=1$/.test(portalState.src || ""),
            "src=" + portalState.src
        );
        check(
            "Die Test-Welt sieht den injizierten Shim (window.__anazhShim)",
            portalState.journal.some((t) => t.includes("shim-installed")),
            portalState.journal.find((t) => t.includes("shim-")) || "(keine Shim-Meldung)"
        );
        check(
            "Der Shim meldet ws-open → _portalOverlay verfolgt den WebSocket-Kanal",
            portalState.netChannels >= 1,
            "netChannels=" + portalState.netChannels
        );
        check(
            "ws.send() der Sub-Welt → _portalNetReceive macht einen subworld-net-Mesh-Broadcast",
            portalState.subnetOut.some((m) => m && m.data === "shim-ping" && typeof m.worldId === "string"),
            JSON.stringify(portalState.subnetOut)
        );

        await page.evaluate(() => window.anazhRealm._disposePortalOverlay());
        await page.screenshot({ path: path.join(ROOT, "artifacts", "smoke-shim.png") }).catch(() => {});
    } finally {
        await browser.close();
        saveServer.kill();
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }

    if (failures.length) {
        console.log(`\n❌ ${failures.length} Smoke-Check(s) fehlgeschlagen.`);
        process.exit(1);
    }
    console.log("\n✅ W17 Phase B-Relay: ein Sub-Welt-ws-send wird ein subworld-net-Mesh-Broadcast.");
})().catch((err) => {
    console.error("smoke-shim abgebrochen:", err && err.message);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    process.exit(1);
});
