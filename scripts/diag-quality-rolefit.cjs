// diag-quality-rolefit.cjs — MISST die Synergie-Lücke (V17.79-Frage des Schöpfers): heute ist
// computeBlueprintQuality = NUR die Präzision (Handwerk); die Rolle-PASSUNG (wie gut die FORM zur Rolle
// passt — scharf für Waffe, Körper-Form für Seele) fehlt. Diese Sonde misst für Archetypen: die Rolle,
// die aktuelle Quality (Präzision), den Produkt-Vektor + die Resonanz gegen vorgeschlagene Rolle-Passung-
// Signaturen (die die FORM-Achsen pointedFraction/bodyShape lesen, die STAT_FROM_TAGS NICHT sieht).
//
//   node scripts/diag-quality-rolefit.cjs <pfad/zu/save-server.js>

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
            const round = (x) => Math.round((x || 0) * 1000) / 1000;
            // vorgeschlagene Rolle-Passung-Signaturen — lesen die FORM-Achsen (pointedFraction/bodyShape/
            // portalShape), die STAT_FROM_TAGS nicht sieht; + die Material-Achsen, die zur Rolle passen.
            const FIT = {
                weapon: { pointedFraction: 2.0, härte: 0.8 },
                tool: { pointedFraction: 1.5, härte: 0.8 },
                armor: { dichte: 1.0, härte: 1.0 },
                soul: { bodyShape: 2.0, lebendig: 0.5 },
                consumable: { lebendig: 1.5, härte: -0.8 },
                portal: { portalShape: 2.0 },
                architecture: { dichte: 1.0, härte: 0.8 },
            };
            const reson = (v, sig) => {
                let s = 0;
                for (const a in sig) s += (v[a] || 0) * sig[a];
                return s;
            };
            const measure = (bp) => {
                if (!bp) return "MISSING";
                const v = r._blueprintProductVector(bp);
                const role = r.computeBlueprintRole(bp);
                const fits = {};
                for (const rl in FIT) fits[rl] = round(reson(v, FIT[rl]));
                return {
                    role,
                    quality_precision: round(r.computeBlueprintQuality(bp)),
                    pointedFraction: round(v.pointedFraction),
                    bodyShape: v.bodyShape,
                    dichte: round(v.dichte),
                    härte: round(v.härte),
                    lebendig: round(v.lebendig),
                    roleFit_forOwnRole: round(fits[role]),
                    allFits: fits,
                };
            };
            const out = {};
            // (1) die Bibliothek + Built-in-Seelen
            for (const n of ["geraet_spitzhacke", "ruestung_brustpanzer", "trank_lebenssaft", "avatar_waechter"]) {
                out[n] = measure(r.state.blueprints[n]);
            }
            // (2) Synthetik: eine scharfe Eisen-Klinge (Waffe) vs ein stumpfer Eisen-Klotz (gleiche Materie!)
            const blade = {
                name: "_blade",
                parts: [
                    { shape: "box", material: "eisen", position: { x: 0, y: 0, z: 0 }, size: { x: 0.2, y: 0.1, z: 1.6 } },
                    { shape: "cone", material: "eisen", position: { x: 0, y: 0, z: 1.2 }, size: { x: 0.2, y: 0.1, z: 0.6 } },
                ],
            };
            const block = {
                name: "_block",
                parts: [
                    { shape: "box", material: "eisen", position: { x: 0, y: 0, z: 0 }, size: { x: 1.2, y: 1.2, z: 1.2 } },
                ],
            };
            out["KLINGE (eisen, scharf)"] = measure(blade);
            out["KLOTZ (eisen, stumpf)"] = measure(block);
            return out;
        });
        console.log("=== Rolle · Quality(Präzision) · Form-Achsen · Rolle-Passung (Resonanz) ===\n");
        console.log(JSON.stringify(dump, null, 2));
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
