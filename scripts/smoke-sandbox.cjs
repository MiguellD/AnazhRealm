// V8.70 — End-to-End-Beweis des Untrusted-Welt-Tors.
//
// Der headless playtest prüft die DATEN-Schicht (Vertrauensstufe durch
// portalMeta, der sandbox-Attribut-Schalter). Er kann aber nicht prüfen,
// ob eine echte fremde Engine in einem ECHTEN null-origin-iframe laeuft
// UND dabei AnazhRealm nicht beruehren kann. Dieser Test laedt eine
// Host-Seite, spannt darin ein iframe mit sandbox="allow-scripts" (ohne
// allow-same-origin → null-origin) auf, laedt die Schwarm-Welt hinein
// und prueft:
//   1. die fremde Engine laeuft (sie meldet ready + rendert),
//   2. sie ist ISOLIERT — ihr eigener Sandbox-Selbsttest meldet, dass die
//      Wand haelt (AnazhRealm ist von ihr aus unerreichbar),
//   3. ein DSL-Befehl an die Welt wirkt + wirft keinen Fehler.
//
// Die Freiheit (volle fremde Engine) und die Sicherheit (null Reichweite)
// kommen aus DEMSELBEN Mechanismus — das beweist dieser Test.
//
// Voraussetzung: puppeteer als devDependency (`npm install`).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const HOST_URL = "http://127.0.0.1:4312/index.html";
const WORLD_PATH = "worlds/schwarm/index.html";

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

    console.log("Starte save-server ...");
    const saveServer = await startProc("save-server.js", /läuft/);

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
        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 640 });

        console.log("Lade die Host-Seite ...");
        await page.goto(HOST_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(600);
        // Den Intro-Dialog der Host-Seite schliessen — er liegt im Top-Layer
        // und verdeckte sonst den Screenshot der Sub-Welt.
        await page.evaluate(() => {
            document.querySelectorAll("dialog[open]").forEach((d) => {
                try {
                    d.close();
                } catch (e) {
                    /* egal */
                }
            });
        });

        // Ein iframe mit sandbox="allow-scripts" (KEIN allow-same-origin) →
        // die Schwarm-Welt bekommt eine opake (null) Herkunft. Auf ready
        // schickt der Harness den enter-Handshake.
        await page.evaluate((worldPath) => {
            const ifr = document.createElement("iframe");
            ifr.setAttribute("sandbox", "allow-scripts");
            ifr.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:99999;background:#05060c";
            ifr.src = worldPath;
            window.__schwarm = { ready: false, events: [] };
            window.addEventListener("message", (e) => {
                if (e.source !== ifr.contentWindow) return;
                const m = e.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready") {
                    window.__schwarm.ready = true;
                    ifr.contentWindow.postMessage({ type: "enter", avatar: { name: "Schöpfer" } }, "*");
                } else if (m.type === "event") {
                    window.__schwarm.events.push(String(m.text || ""));
                }
            });
            document.body.appendChild(ifr);
            window.__schwarmIframe = ifr;
        }, WORLD_PATH);

        await sleep(2200);
        const afterEnter = await page.evaluate(() => window.__schwarm);
        const ev = afterEnter.events;

        check("Die fremde Engine läuft (ready-Handshake)", afterEnter.ready === true);
        check(
            "Die fremde Engine rendert ihren Schwarm",
            ev.some((t) => /Wesen|schwärmen|erwachte/.test(t)),
            ev.find((t) => /Wesen|erwachte/.test(t)) || "(kein Render-Ereignis)"
        );
        const isoEvent = ev.find((t) => /Sandbox-Wand hält/.test(t));
        check("Die Sandbox-Wand hält — AnazhRealm ist von der fremden Welt unerreichbar", !!isoEvent, isoEvent || "");
        check(
            "Kein Wand-Durchbruch gemeldet",
            !ev.some((t) => /WARNUNG|durchlässig/.test(t)),
            ev.find((t) => /WARNUNG|durchlässig/.test(t)) || ""
        );

        // Einen DSL-Befehl an die Welt schicken.
        await page.evaluate(() => {
            window.__schwarm.events.length = 0;
            window.__schwarmIframe.contentWindow.postMessage({ type: "dsl", program: ["sturm"] }, "*");
        });
        await sleep(700);
        const afterDsl = await page.evaluate(() => window.__schwarm.events);
        check(
            "DSL-Befehl 'sturm' wirkt in der fremden Welt + wirft keinen Fehler",
            afterDsl.some((t) => /Sturm fuhr durch/.test(t)),
            afterDsl[0] || "(kein Sturm-Ereignis)"
        );

        await page.screenshot({ path: path.join(ROOT, "artifacts", "smoke-sandbox.png") }).catch(() => {});
        console.log("Screenshot: artifacts/smoke-sandbox.png");
    } finally {
        await browser.close();
        saveServer.kill();
    }

    if (failures.length) {
        console.log(`\n❌ ${failures.length} Smoke-Check(s) fehlgeschlagen.`);
        process.exit(1);
    }
    console.log("\n✅ Untrusted-Welt-Tor: die fremde Engine läuft frei und doch eingeschlossen.");
})().catch((err) => {
    console.error("smoke-sandbox abgebrochen:", err && err.message);
    process.exit(1);
});
