// diag-workshop-process.cjs — verifiziert V17.88: die Werkstatt IST der Prozess (schöpfer: besessen frei;
// frieden/pfad: platziert+nah nötig); die Meister-Esse gibt höheren Cap; player startet nur mit hände.
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";
function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) { ready = true; clearTimeout(to); resolve(proc); }
        });
        proc.on("error", reject);
    });
}
(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const d = performance.now() + 12000;
            const ready = () => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.blueprints && window.anazhRealm.state.playerMesh && window.anazhRealm.state.playerMesh.position;
            while (!ready() && performance.now() < d) {
                try { window.anazhRealm && window.anazhRealm._gameLoopTick && window.anazhRealm._gameLoopTick(performance.now()); } catch (_e) {}
                await new Promise((r) => setTimeout(r, 30));
            }
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            // player startet nur mit hände
            out.playerTools = (r.state.player.tools || []).slice();
            out.domainProcess_forging = r._domainProcess("forging");
            // ein eigener eisen-Bauplan
            delete r.state.blueprints["_wp"];
            r.createBlueprint("_wp", "WP");
            r.addPartToBlueprint("_wp", { shape: "box", material: "eisen", position: { x: 0, y: 1, z: 0 }, size: { x: 1, y: 1, z: 1 } });
            // SCHÖPFER: alle besessenen Werkstätten verfügbar (frei, ohne Platzieren)
            r.setGameMode("schöpfer");
            const menuS = r._workshopProcessesForMenu();
            out.schoepfer_menuCount = menuS.length;
            out.schoepfer_hasForging = menuS.some((p) => p.domain === "forging");
            out.schoepfer_domains = Array.from(new Set(menuS.map((p) => p.domain))).sort();
            // esse vs meister-esse cap
            const esseProc = menuS.find((p) => p.stationName === "esse");
            const meisterProc = menuS.find((p) => p.stationName === "esse_meister");
            out.esseCap = esseProc ? esseProc.cap : null;
            out.meisterCap = meisterProc ? meisterProc.cap : null;
            out.meisterFiner = meisterProc && esseProc && meisterProc.cap > esseProc.cap;
            // anwenden in schöpfer (besessen, kein Platzieren)
            const apS = r.applyWorkshopProcessToPart("_wp", 0, "esse_meister");
            out.schoepfer_apply = { ok: apS.ok, cap: apS.cap, domain: apS.domain };
            // FRIEDEN: ohne platzierte Station → leer + Ablehnung
            r.setGameMode("frieden");
            const menuF0 = r._workshopProcessesForMenu();
            out.frieden_emptyWithoutPlacement = menuF0.length === 0;
            const apF0 = r.applyWorkshopProcessToPart("_wp", 0, "esse");
            out.frieden_rejectWithoutPlacement = apF0.ok === false && apF0.reason === "workshop_not_placed_near";
            // eine Esse beim Spieler platzieren
            const pm = r.state.playerMesh && r.state.playerMesh.position;
            r.state.architectures = r.state.architectures || [];
            r.state.architectures.push({ type: "esse", position: { x: pm.x, y: pm.y, z: pm.z } });
            const menuF1 = r._workshopProcessesForMenu();
            out.frieden_appearsAfterPlacement = menuF1.some((p) => p.stationName === "esse");
            const apF1 = r.applyWorkshopProcessToPart("_wp", 0, "esse");
            out.frieden_applyAfterPlacement = { ok: apF1.ok, cap: apF1.cap };
            // cleanup
            r.state.architectures = r.state.architectures.filter((e) => e.type !== "esse" || e.position.x !== pm.x);
            r.setGameMode("schöpfer");
            delete r.state.blueprints["_wp"];
            if (r.state.blueprintEditHistory) delete r.state.blueprintEditHistory["_wp"];
            return out;
        });
        console.log(JSON.stringify(dump, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => { console.error("FEHLER:", e); process.exit(1); });
