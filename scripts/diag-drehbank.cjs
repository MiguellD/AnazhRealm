// diag-drehbank.cjs — reproduziert den Schöpfer-Befund: "die platzierte Drehbank in der Nähe erscheint
// NICHT im Prozessfeld zum Anwenden auf die Baugruppe (Rolle fixen), in frieden/pfad". Misst den ganzen
// Fluss: frieden → Drehbank platziert + Spieler nah → erscheint sie in _workshopProcessesForMenu + im
// per-Part-Apply-Select?
//
//   node scripts/diag-drehbank.cjs <pfad/zu/save-server.js>

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
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 8000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.scene) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = {};
            r.setGameMode && r.setGameMode("frieden");
            out.mode = r.getGameMode();

            // Spieler-Position lesen
            const pm = r.state.playerMesh && r.state.playerMesh.position;
            out.playerPos = pm ? { x: Math.round(pm.x), y: Math.round(pm.y), z: Math.round(pm.z) } : null;

            // Drehbank-Bauplan vorhanden + Domäne?
            const drehbank = r.state.blueprints["drehbank"];
            out.drehbankRole = drehbank ? drehbank.role : "FEHLT";
            out.drehbankDomain = drehbank ? r._computeWorkshopDomain(drehbank) : null;
            out.domainProcess = out.drehbankDomain ? r._domainProcess(out.drehbankDomain) : null;
            out.proximityRadius = r.constructor.WORKSHOP_PROXIMITY_M;

            // Drehbank GENAU beim Spieler platzieren (so nah wie möglich)
            if (pm) {
                const entry = r.spawnArchitecture("drehbank", { x: pm.x + 2, y: pm.y, z: pm.z });
                out.spawned = !!entry;
                out.spawnedType = entry ? entry.type : null;
            }
            out.architectureCount = (r.state.architectures || []).length;
            out.drehbankEntriesNear = (r.state.architectures || []).filter((a) => a && a.type === "drehbank").length;

            // Erkennt _isWorkshopStationPlacedNear sie?
            out.placedNear = r._isWorkshopStationPlacedNear("drehbank");

            // Erscheint sie im Prozess-Menü (frieden)?
            out.processesForMenu = r._workshopProcessesForMenu().map((p) => `${p.label} · ${p.opName} (${p.cap.toFixed(2)})`);

            // Klon erstellen + per-Part-Apply-Select prüfen
            r.cloneBlueprint("geraet_schwert", "schwert_fix");
            r.selectBlueprintForEdit("schwert_fix");
            r._renderWorkshopDOM();
            const ed = document.getElementById("workshop-editor");
            const selects = [...ed.querySelectorAll(".workshop-op-tool")];
            out.perPartApplyOptions = selects.length ? [...selects[0].options].map((o) => o.textContent.trim()) : "(keine)";

            return out;
        });
        console.log("=== Drehbank-Prozess-Fluss (frieden, platziert + nah) ===\n");
        console.log(JSON.stringify(dump, null, 2));
        console.log("");
        console.log(`FAZIT: Drehbank im Prozess-Menü? ${dump.processesForMenu.length ? "JA — " + dump.processesForMenu.join(", ") : "NEIN ✗"}`);
        console.log(`       placedNear erkannt? ${dump.placedNear ? "JA" : "NEIN ✗"}`);
        console.log(`       Domäne der Drehbank: ${dump.drehbankDomain || "NULL ✗ (= kein Prozess!)"}`);
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
