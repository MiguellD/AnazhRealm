// Verifikations-Screenshot-Tool. Startet die Welt im Headless-Browser,
// stellt verschiedene Szenen (3rd-Person, Strukturen, UI) ein und macht
// nummerierte Screenshots in artifacts/. Wird von mir (Claude) zwischen
// Commits aufgerufen, um Dimensionen + Look visuell zu prüfen.
//
// Aufruf: node scripts/screenshot.cjs [tag]
//   tag wird ins Dateinamen-Prefix eingebaut, z. B. "commit-6.1".

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const TAG = process.argv[2] || "shot";
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
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

(async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
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
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Welt-Bootstrap: warten bis Welt + Terrain + Spieler-Landung
        // abgeschlossen sind. 8s ist konservativ — Spieler braucht ~3s zum
        // Fallen, plus Initial-Worldgen ~2s.
        await new Promise((r) => setTimeout(r, 8000));

        // Hilfs-Setup vor jeder Szene: Konsole klein, Drawer zu, yaw/pitch
        // weich auf bekannte Werte (das ist nur visueller State, kein Physik-
        // Touch — der Spieler wird NICHT teleportiert, sonst fällt er durch
        // den Boden, weil setWorldTransform den Body nicht reaktiviert).
        const resetScene = async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                if (typeof r.closeAllDrawers === "function") r.closeAllDrawers();
                const consolePanel = document.getElementById("console");
                if (consolePanel) consolePanel.classList.add("collapsed");
                r.state.yaw = 0;
                r.state.pitch = -0.15;
            });
            await new Promise((r) => setTimeout(r, 350));
        };

        const shot = async (name, prep) => {
            if (prep) await prep();
            await new Promise((r) => setTimeout(r, 700));
            const filename = path.join(ARTIFACT_DIR, `${TAG}-${name}.png`);
            await page.screenshot({ path: filename, fullPage: false });
            console.log(`Screenshot: ${filename}`);
        };

        // Szene 1: Spieler in 3rd-Person, Mensch-Default, leere Welt.
        await resetScene();
        await shot("01-third-empty", async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("third");
                r.applyPlayerSoul("human");
            });
        });

        // Szene 2: Drei Strukturen in +Z vor dem Spieler.
        await resetScene();
        await shot("02-third-architectures", async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("third");
                r.applyPlayerSoul("human");
                // Bestehende Strukturen entfernen für sauberen Test.
                for (const a of r.state.architectures.slice()) {
                    if (a.mesh) r._cullArchitectureMesh(a);
                }
                r.state.architectures = [];
                // Strukturen an einer bekannten Welt-Stelle (0, 8, 20-25)
                // platzieren — kein Bezug zur (instabilen) Spieler-Y. Dann
                // Spieler an (0, 12, 5) teleportieren mit v=0; er fällt auf
                // den Tempel (mass=0 statische Kollision hält ihn).
                r.spawnArchitecture("village", { x: -14, y: 8, z: 22 }, { seed: 7 });
                r.spawnArchitecture("temple", { x: 0, y: 8, z: 22 }, { seed: 11 });
                r.spawnArchitecture("waterfall", { x: 14, y: 8, z: 22 }, { seed: 3 });
                if (r.state.playerBody && r.state.tmpTransform && r.state.tmpVec1) {
                    const t = r.state.tmpTransform;
                    t.setIdentity();
                    t.setOrigin(r.setVec(r.state.tmpVec1, 0, 12, 8));
                    r.state.playerBody.setWorldTransform(t);
                    r.state.playerBody.activate(true);
                    r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
                }
            });
            // Mehr Wartezeit, damit der Spieler auf den Strukturen landet.
            await new Promise((r) => setTimeout(r, 1500));
        });

        // Szene 3: Spieler-Drache von hinten — Mesh-Detail-Sicht.
        await resetScene();
        await shot("03-third-dragon", async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("third");
                r.applyPlayerSoul("dragon");
            });
        });

        // Szene 4: Phönix von hinten.
        await resetScene();
        await shot("04-third-phoenix", async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("third");
                r.applyPlayerSoul("phoenix");
            });
        });

        // Szene 5: 1st-Person nah am Tempel — Größen-Verhältnis.
        await resetScene();
        await shot("05-first-near-temple", async () => {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("first");
                for (const a of r.state.architectures.slice()) {
                    if (a.mesh) {
                        r.state.scene.remove(a.mesh);
                        r._disposeSoulGroup(a.mesh);
                    }
                }
                r.state.architectures = [];
                const px = r.state.playerMesh.position.x;
                const py = r.state.playerMesh.position.y;
                const pz = r.state.playerMesh.position.z;
                r.spawnArchitecture("temple", { x: px, y: py, z: pz + 10 }, { seed: 11 });
                // Pitch hoch, damit man auch das Tempel-Dach sieht.
                r.state.pitch = 0.05;
            });
        });

        // Szene 6: Welt-Drawer mit Quick-Actions + Bauwerke.
        await resetScene();
        await shot("06-drawer-welt", async () => {
            await page.evaluate(() => {
                const tab = document.querySelector('#topbar [data-tab="welt"]');
                if (tab) tab.click();
            });
        });

        // Szene 7: Spieler-Drawer mit Seele + Emotionen.
        await resetScene();
        await shot("07-drawer-spieler", async () => {
            await page.evaluate(() => {
                const tab = document.querySelector('#topbar [data-tab="spieler"]');
                if (tab) tab.click();
            });
        });
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((err) => {
    console.error("Screenshot crash:", err);
    process.exit(1);
});
