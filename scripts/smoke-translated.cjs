// KI-Übersetzer Phase 2 — End-to-End-Test des generischen Translated-
// World-Renderers (worlds/translated/).
//
// Der headless playtest prüft die DATEN-Schicht (Szenen-Sanitizer,
// buildTranslatedWorld, das Portal-Zielen). Er kann aber nicht prüfen, ob
// der Renderer eine deklarative Szene WIRKLICH aufbaut, ohne an einer
// Three.js-API zu scheitern. Dieser Test öffnet worlds/translated/ in
// einem echten Browser, schickt ihm eine Beispiel-Szene per enter-
// Handshake und prüft:
//   1. der Renderer wirft keinen Fehler (Console / pageerror sauber),
//   2. die Szene wird aufgebaut (HUD meldet „gerendert"),
//   3. ein Canvas existiert mit echter Größe,
//   4. ein DSL-Befehl an die Welt wirft keinen Fehler.
//
// Voraussetzung: puppeteer als devDependency (`npm install`).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = "/home/user/AnazhRealm";
const PAGE_URL = "http://127.0.0.1:4312/worlds/translated/index.html";

// Eine repräsentative Szene — Lava-Welt: Objekte (Oktaeder + Zylinder als
// InstancedMesh), Hügel-Boden, Glut-Partikel, ein DSL-Effekt.
const SAMPLE_SCENE = {
    sky: { top: "#0d1330", bottom: "#e0a060" },
    fog: "#3a2a4a",
    ground: { color: "#6a3020", style: "hills" },
    light: { color: "#ffd0a0", intensity: 1.3 },
    objects: [
        { shape: "octahedron", color: "#ff5520", count: 40, area: 70, size: 4, height: 6, spin: true, float: true },
        { shape: "cylinder", color: "#3a2018", count: 18, area: 95, size: 8, height: 0 },
    ],
    ambient: { kind: "embers", color: "#ff8030" },
    dslEffects: { sturm: { sky: "#400010", fogShift: 0.5, lightShift: -0.4, burst: 20 } },
};

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
        const errors = [];
        page.on("pageerror", (err) => errors.push(String(err && err.message ? err.message : err)));
        page.on("console", (msg) => {
            if (msg.type() === "error") errors.push("console: " + msg.text());
        });

        console.log("Lade die übersetzte Welt ...");
        await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Three.js laden lassen.
        await page.waitForFunction(() => typeof window.THREE !== "undefined", { timeout: 15000 });
        await sleep(400);

        // Die deklarative Szene per enter-Handshake schicken. Direkt geöffnet
        // ist window.parent === window — der Handshake-Filter (event.source
        // === window.parent) lässt eine selbst gepostete Nachricht durch.
        await page.evaluate((scene) => {
            window.postMessage({ type: "enter", avatar: { name: "Schöpfer" }, scene: scene }, "*");
        }, SAMPLE_SCENE);
        await sleep(1600);

        const afterEnter = await page.evaluate(() => {
            const c = document.querySelector("canvas");
            const hud = document.getElementById("hud-line");
            return {
                hasCanvas: !!c && c.width > 0 && c.height > 0,
                hud: hud ? hud.textContent : "",
            };
        });
        check("Canvas existiert mit echter Größe", afterEnter.hasCanvas, afterEnter.hud);
        check(
            "Die Szene wurde aufgebaut (HUD meldet 'gerendert')",
            /gerendert/.test(afterEnter.hud),
            afterEnter.hud
        );
        check(
            "Kein Aufbau-Fehler im HUD (kein 'fehlgeschlagen' / 'nötig')",
            !/fehlgeschlagen|nötig|konnte nicht laden/.test(afterEnter.hud),
            afterEnter.hud
        );
        check("Renderer wirft keinen Fehler beim Szenen-Aufbau", errors.length === 0, errors.slice(0, 3).join(" | "));

        // Einen DSL-Befehl an die Welt schicken — der deklarative Effekt.
        const errCountBeforeDsl = errors.length;
        await page.evaluate(() => {
            window.postMessage({ type: "dsl", program: ["sturm"] }, "*");
        });
        await sleep(700);
        check(
            "DSL-Befehl an die übersetzte Welt wirft keinen Fehler",
            errors.length === errCountBeforeDsl,
            errors.slice(errCountBeforeDsl, errCountBeforeDsl + 2).join(" | ")
        );

        await page.screenshot({ path: path.join(ROOT, "artifacts", "smoke-translated.png") }).catch(() => {});
        console.log("Screenshot: artifacts/smoke-translated.png");
    } finally {
        await browser.close();
        saveServer.kill();
    }

    if (failures.length) {
        console.log(`\n❌ ${failures.length} Smoke-Check(s) fehlgeschlagen.`);
        process.exit(1);
    }
    console.log("\n✅ Translated-World-Renderer: alle Smoke-Checks grün.");
})().catch((err) => {
    console.error("smoke-translated abgebrochen:", err && err.message);
    process.exit(1);
});
