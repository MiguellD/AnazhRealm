// diag-workshop-ui.cjs — DUMPT das echte Werkstatt-DOM: was sieht der Schöpfer wirklich?
// Prüft die zwei "im Kreis"-Befunde: (b) Undo/Redo sichtbar? (a) Drehbank im Prozess-Feld + per-Part anwendbar?
//
//   node scripts/diag-workshop-ui.cjs <pfad/zu/save-server.js>

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
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const inspect = (label) => {
                r._renderWorkshopDOM();
                const ed = document.getElementById("workshop-editor");
                const hist = ed.querySelector(".workshop-history");
                const toolChips = [...ed.querySelectorAll(".workshop-tools .workshop-tool-chip")].map((c) =>
                    c.textContent.trim(),
                );
                const stationChips = [...ed.querySelectorAll(".workshop-station-chip")].map((c) => c.textContent.trim());
                const applySelects = [...ed.querySelectorAll(".workshop-op-tool")].map((sel) =>
                    [...sel.options].map((o) => o.textContent.trim()),
                );
                return {
                    label,
                    undoRedoPresent: !!hist,
                    undoRedoHTML: hist ? hist.outerHTML.slice(0, 200) : "(fehlt)",
                    toolsBoxChips: toolChips,
                    stationChipsInToolsBox: stationChips,
                    perPartApplyOptions: applySelects.length ? applySelects[0] : "(keine apply-Selects — built-in?)",
                };
            };
            const out = {};
            // CSS-Check: gibt es eine Regel für .workshop-history?
            let cssFound = false;
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.selectorText && /workshop-history|workshop-undo|workshop-redo/.test(rule.selectorText))
                            cssFound = true;
                    }
                } catch (e) {}
            }
            out.cssForHistory = cssFound;

            // Modus schöpfer (alle besessenen Werkstätten erscheinen)
            r.setGameMode && r.setGameMode("schöpfer");

            // (1) Built-in Bibliotheks-Werk (was der Schöpfer natürlich anklickt)
            r.selectBlueprintForEdit("geraet_schwert");
            out.builtin_schwert = inspect("geraet_schwert (built-in)");

            // (2) Klon → editierbar
            r.cloneBlueprint && r.cloneBlueprint("geraet_schwert", "schwert_test");
            const cloneName = Object.keys(r.state.blueprints).find((n) => !r.state.blueprints[n].builtIn);
            if (cloneName) {
                r.selectBlueprintForEdit(cloneName);
                out.clone = inspect(`${cloneName} (Klon, editierbar)`);
            } else {
                out.clone = "KEIN Klon erzeugt";
            }
            return out;
        });
        console.log("=== WERKSTATT-DOM: was der Schöpfer WIRKLICH sieht ===\n");
        console.log(`CSS-Regel für .workshop-history vorhanden? ${dump.cssForHistory ? "JA" : "NEIN ✗"}\n`);
        for (const key of ["builtin_schwert", "clone"]) {
            const m = dump[key];
            if (typeof m === "string") {
                console.log(`● ${key}: ${m}\n`);
                continue;
            }
            console.log(`● ${m.label}`);
            console.log(`    Undo/Redo gerendert?  ${m.undoRedoPresent ? "JA" : "NEIN ✗"}`);
            console.log(`    Tools-Box Chips:      ${JSON.stringify(m.toolsBoxChips)}`);
            console.log(`    Werkstatt-Chips:      ${JSON.stringify(m.stationChipsInToolsBox)}`);
            console.log(`    Per-Part anwenden:    ${JSON.stringify(m.perPartApplyOptions)}`);
            console.log("");
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
