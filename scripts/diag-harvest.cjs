// diag-harvest.cjs — M6-Mess-Auftrag (meister-plan §6.2, Befund 18 „Baum/Deko-Abbau
// gibt KEINE Rohstoffe"): der Baum-LMB-Abbau END-TO-END je Modus — spawnt eine Eiche
// vor dem Spieler, richtet die Kamera, schlägt via tryMouseBreak bis zum Bruch und
// misst JEDEN Schritt (Pick-Treffer · Strike-Fortschritt · Bruch · Inventar-Loot).
//   node scripts/diag-harvest.cjs

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
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
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 15000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.playerMesh ||
                    !window.anazhRealm.state.camera) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const probe = await page.evaluate((mode) => {
            const r = window.anazhRealm;
            const out = { mode };
            const pm = r.state.playerMesh.position;
            const savedMode = r.getGameMode();
            const savedInv = JSON.parse(JSON.stringify(r.state.player.inventory));
            const savedStamina = r.state.player.stamina;
            try {
                r.setGameMode(mode);
                r.state.player.stamina = 100;
                // Eiche 5 m vor dem Spieler (instanced-Pfad!), Kamera draufrichten.
                const entry = r.spawnArchitecture(
                    "baum_eiche",
                    { x: pm.x + 5, y: pm.y, z: pm.z },
                    { silent: true, precise: true }
                );
                out.spawned = !!entry;
                out.instanced = !!(entry && entry.instanceKey) || !!(entry && !entry.mesh);
                out.entryHasMesh = !!(entry && entry.mesh);
                const cam = r.state.camera;
                cam.position.set(pm.x, pm.y + 1.2, pm.z);
                // auf den STAMM zielen (y+1 über Fuß).
                cam.lookAt(entry.position.x, entry.position.y + 1.2, entry.position.z);
                cam.updateMatrixWorld(true);
                const pick = r._pickArchitectureAtCrosshair();
                out.pickHits = !!pick && !!pick.entry && pick.entry.id === entry.id;
                if (!out.pickHits) {
                    out.pickGot = pick && pick.entry ? pick.entry.type : null;
                    return out;
                }
                // LMB-Hiebe bis Bruch (cap 40) — Stamina nachfüllen (wir messen Loot, nicht Stamina).
                let strikes = 0;
                let broke = false;
                for (; strikes < 40; strikes++) {
                    r.state.player.stamina = 100;
                    r.tryMouseBreak();
                    if (!(r.state.architectures || []).some((e) => e && e.id === entry.id)) {
                        broke = true;
                        break;
                    }
                }
                out.strikes = strikes + 1;
                out.broke = broke;
                // Loot: was kam ins Inventar (Differenz)?
                const loot = {};
                for (const s of r.state.player.inventory) {
                    if (!s || s.kind !== "material") continue;
                    loot[s.material] = (loot[s.material] || 0) + s.count;
                }
                for (const s of savedInv) {
                    if (!s || s.kind !== "material") continue;
                    loot[s.material] = (loot[s.material] || 0) - s.count;
                }
                out.loot = Object.fromEntries(Object.entries(loot).filter(([, v]) => v !== 0));
                return out;
            } finally {
                r.setGameMode(savedMode);
                r.state.player.inventory = savedInv;
                r.state.player.stamina = savedStamina;
            }
        }, process.env.MODE || "pfad");
        console.log("ERNTE:", JSON.stringify(probe, null, 2));
        // zweiter Lauf im frieden-Modus
        const probe2 = await page.evaluate((mode) => {
            const r = window.anazhRealm;
            const out = { mode };
            const pm = r.state.playerMesh.position;
            const savedMode = r.getGameMode();
            const savedInv = JSON.parse(JSON.stringify(r.state.player.inventory));
            try {
                r.setGameMode(mode);
                const entry = r.spawnArchitecture(
                    "baum_eiche",
                    { x: pm.x - 5, y: pm.y, z: pm.z },
                    { silent: true, precise: true }
                );
                const cam = r.state.camera;
                cam.position.set(pm.x, pm.y + 1.2, pm.z);
                cam.lookAt(entry.position.x, entry.position.y + 1.2, entry.position.z);
                cam.updateMatrixWorld(true);
                const pick = r._pickArchitectureAtCrosshair();
                out.pickHits = !!pick && !!pick.entry && pick.entry.id === entry.id;
                let strikes = 0;
                let broke = false;
                for (; strikes < 40; strikes++) {
                    r.tryMouseBreak();
                    if (!(r.state.architectures || []).some((e) => e && e.id === entry.id)) {
                        broke = true;
                        break;
                    }
                }
                out.strikes = strikes + 1;
                out.broke = broke;
                const loot = {};
                for (const s of r.state.player.inventory) {
                    if (!s || s.kind !== "material") continue;
                    loot[s.material] = (loot[s.material] || 0) + s.count;
                }
                for (const s of savedInv) {
                    if (!s || s.kind !== "material") continue;
                    loot[s.material] = (loot[s.material] || 0) - s.count;
                }
                out.loot = Object.fromEntries(Object.entries(loot).filter(([, v]) => v !== 0));
                return out;
            } finally {
                r.setGameMode(savedMode);
                r.state.player.inventory = savedInv;
            }
        }, "frieden");
        console.log("ERNTE:", JSON.stringify(probe2, null, 2));
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
