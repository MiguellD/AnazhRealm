// diag-workshop-precision.cjs — MISST die Werkstatt-Präzision (V17.76 Welle 2): emergiert eine BESSERE
// Esse wirklich aus besserer Substanz, und macht das Sinn (denser/harder → feinere Toleranzen)? Klont die
// Built-in-Esse, tauscht das Material aller Parts, misst _workshopStationPrecision + die dichte/härte-Tags.
//
//   node scripts/diag-workshop-precision.cjs <pfad/zu/save-server.js>

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
            const round = (x) => Math.round((x || 0) * 1e4) / 1e4;
            const measure = (bp) => {
                const t = r.computeCompoundTags(bp) || {};
                return {
                    precision: round(r._workshopStationPrecision(bp)),
                    dichte: round(t.dichte),
                    härte: round(t.härte),
                    domain: typeof r._computeWorkshopDomain === "function" ? r._computeWorkshopDomain(bp) : null,
                };
            };
            const out = { builtinStations: {}, esseVariants: {} };
            // (1) die echten Built-in-Werkstätten
            for (const n of ["esse", "brennkolben", "webstuhl", "seelenstein_altar", "drehbank"]) {
                const bp = r.state.blueprints[n];
                if (bp) out.builtinStations[n] = measure(bp);
            }
            // (2) eine Esse aus verschiedenen Materialien (Klon, Material getauscht) — welche ist besser?
            const esse = r.state.blueprints["esse"];
            if (esse) {
                for (const mat of ["leder", "holz", "stein", "bronze", "eisen", "quarz", "knochen", "obsidian"]) {
                    if (!r.state.materials || !r.state.materials[mat]) continue;
                    const clone = {
                        name: "_probe",
                        parts: esse.parts.map((p) => ({ ...p, material: mat })),
                    };
                    out.esseVariants[mat] = measure(clone);
                }
            }
            out.WORKSHOP_PRECISION = r.constructor.WORKSHOP_PRECISION;
            return out;
        });
        console.log("=== WORKSHOP_PRECISION config ===");
        console.log(JSON.stringify(dump.WORKSHOP_PRECISION));
        console.log("\n=== Built-in-Werkstätten (precision aus Substanz) ===");
        console.log(JSON.stringify(dump.builtinStations, null, 2));
        console.log("\n=== Esse aus verschiedenen Materialien (welche ist die bessere Esse?) ===");
        console.log(JSON.stringify(dump.esseVariants, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
