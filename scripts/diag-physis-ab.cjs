// diag-physis-ab.cjs — die WAHRHEITS-BAND-Messung (wahrerbauplan §10) + die Drift-Wand.
// (A) Welche Built-ins verschiebt Ω-L2 (vehicle/architecture mit Physik) gegen die
//     ALT-Signatur? (B) Liest ein kopflastiges/kippliges Schein-Fahrzeug schwächer als
//     ein stabiles? Beides in EINEM Page-Load über _blueprintResonance(v, sig).
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => /läuft/.test(c.toString()) && !ready && ((ready = true), clearTimeout(to), resolve(proc)));
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const d = performance.now() + 10000;
            while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) && performance.now() < d)
                await new Promise((r) => setTimeout(r, 50));
        });
        const res = await page.evaluate(() => {
            const r = window.anazhRealm,
                C = r.constructor;
            const NEW = C.ROLE_SIGNATURES;
            // ALT-Signaturen (vor Ω-L2): vehicle/architecture ohne die Physik-Achsen.
            // Den ECHTEN Klassifikator (computeBlueprintRole) gegen beide laufen lassen,
            // indem wir die frozen Signatur-Tabelle kurz austauschen (faithful A/B).
            const OLD = Object.assign({}, NEW, {
                vehicle: { rideable: 1.0, spread: 1.4, zähigkeit: 1.0, elongation: 0.4, magieleitung: 0.4, stromleitung: 0.4, dichte: 0.2, lebendig: -0.4 },
                architecture: { dichte: 1.2, härte: 0.7, spread: 0.4, pointedFraction: -0.6 },
            });
            const roleOf = (bp) => {
                const sp = r._blueprintRoleSpectrum(bp);
                return sp && sp.length ? sp[0].role : null;
            };
            const flips = [];
            for (const name in r.state.blueprints) {
                const bp = r.state.blueprints[name];
                if (!bp || !bp.builtIn) continue;
                C.ROLE_SIGNATURES = OLD;
                const a = roleOf(bp);
                C.ROLE_SIGNATURES = NEW;
                const b = roleOf(bp);
                if (a !== b) flips.push(name + ": " + a + " → " + b);
            }
            C.ROLE_SIGNATURES = NEW;
            // (B) WAHRHEITS-BAND: stabiles vs kippliges Fahrzeug (gleiche Teile, Last verschoben)
            const dense = r.state.materials.eisen ? "eisen" : Object.keys(r.state.materials)[0];
            const wood = r.state.materials.holz ? "holz" : dense;
            const wheel = (x, z) => ({ position: { x, y: 0, z }, size: { x: 0.6, y: 0.6, z: 0.2 }, shape: "cylinder", material: dense, rotation: { x: 0, y: 0, z: Math.PI / 2 } });
            const stableVeh = {
                parts: [wheel(-1.5, -1), wheel(1.5, -1), wheel(-1.5, 1), wheel(1.5, 1), { position: { x: 0, y: 0.8, z: 0 }, size: { x: 2.4, y: 0.5, z: 2.4 }, material: wood }],
                connections: [{ type: "sitz", a: 4, b: 0 }],
            };
            const topHeavyVeh = {
                parts: [wheel(-1.5, -1), wheel(1.5, -1), wheel(-1.5, 1), wheel(1.5, 1), { position: { x: 0, y: 4, z: 0 }, size: { x: 2.4, y: 3, z: 2.4 }, material: dense }],
                connections: [{ type: "sitz", a: 4, b: 0 }],
            };
            const vehRaw = (bp) => Math.round(r._blueprintResonance(r._blueprintProductVector(bp), NEW.vehicle) * 1000) / 1000;
            const stab = (bp) => Math.round(r._stability(bp).margin * 1000) / 1000;
            return {
                flips,
                stableRaw: vehRaw(stableVeh),
                topHeavyRaw: vehRaw(topHeavyVeh),
                stableStab: stab(stableVeh),
                topHeavyStab: stab(topHeavyVeh),
                stableRole: roleOf(stableVeh),
                topHeavyRole: roleOf(topHeavyVeh),
            };
        });
        console.log("\n=== Ω-L2 Drift-Wand: Built-ins, die Ω-L2 gegen ALT verschiebt ===");
        if (!res.flips.length) console.log("  KEINE — alle Built-in-Rollen halten (kein Sprung).");
        else res.flips.forEach((f) => console.log("  FLIP  " + f));
        console.log("\n=== ⟡ WAHRHEITS-BAND (§10): kopflastiges Fahrzeug liest schwächer? ===");
        console.log("  stabiles Fahrzeug:   stability=" + res.stableStab + "  vehicle-Resonanz=" + res.stableRaw + "  Rolle=" + res.stableRole);
        console.log("  kopflastiges:        stability=" + res.topHeavyStab + "  vehicle-Resonanz=" + res.topHeavyRaw + "  Rolle=" + res.topHeavyRole);
        console.log(
            "  → " +
                (res.topHeavyStab < res.stableStab && res.topHeavyRaw < res.stableRaw
                    ? "OK — die Physik fängt die Attrappe (kippliges Fahrzeug schwächer in Standfestigkeit + Fahrzeug-Resonanz)"
                    : "FAIL — die Attrappe nicht gefangen")
        );
    } finally {
        await browser.close();
        server.kill();
    }
})();
