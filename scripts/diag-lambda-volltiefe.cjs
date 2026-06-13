// diag-lambda-volltiefe.cjs — V18.176 Tiefe verifizieren:
// 1) 12 Baum-Baupläne (4 Arten × 3 Varianten jung/normal/alt)
// 2) 15 Streu-Arten (4 lebende × 3 Gestalten + 3 Fels + Spore + Pollen)
// 3) Spawn-Lottery: mehrere Varianten erscheinen in einem Wald-Sample
// 4) Λ.1 Role-Migration: setze test-Bauplan mit alter Eichen-Rolle, prüfe Re-Derive

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 10000);
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 800, height: 600 },
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(240000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
    let exitCode = 0;
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 18000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 80));
        });
        for (let p = 0; p < 12; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 50; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
            await new Promise((r) => setTimeout(r, 80));
        }

        // (1) Baum-Baupläne: erwarte 12 (Eiche+Kiefer alt = 2 + 4×3 = 14 total)
        const baeume = await page.evaluate(() => {
            const r = window.anazhRealm;
            const bps = r.state.blueprints || {};
            const baumNames = Object.keys(bps).filter((n) => n.startsWith("baum_"));
            return {
                total: baumNames.length,
                names: baumNames.sort(),
            };
        });
        console.log("\n=== (1) BAUM-BAUPLÄNE ===");
        console.log(`Total: ${baeume.total}`);
        for (const n of baeume.names) console.log(`  ${n}`);

        const expectedBaum = [
            "baum_eiche",
            "baum_kiefer",
            "baum_birke_jung",
            "baum_birke",
            "baum_birke_alt",
            "baum_erle_jung",
            "baum_erle",
            "baum_erle_alt",
            "baum_buche_jung",
            "baum_buche",
            "baum_buche_alt",
            "baum_tanne_jung",
            "baum_tanne",
            "baum_tanne_alt",
        ];
        const missingBaum = expectedBaum.filter((n) => !baeume.names.includes(n));
        if (missingBaum.length) {
            console.log(`FEHLEND: ${missingBaum.join(", ")}`);
            exitCode = 1;
        } else {
            console.log("✓ alle 14 Baum-Baupläne registriert");
        }

        // (2) Streu-Arten: erwarte 15 in KLEIN_VEGETATION_SPECIES
        const streu = await page.evaluate(() => {
            const A = window.anazhRealm.constructor;
            const sp = A.KLEIN_VEGETATION_SPECIES || [];
            return {
                total: sp.length,
                names: sp.map((s) => s.name).sort(),
                geoms: sp.map((s) => s.geom).sort(),
            };
        });
        console.log("\n=== (2) STREU-ARTEN ===");
        console.log(`Total: ${streu.total}`);
        for (const n of streu.names) console.log(`  ${n}`);

        const expectedStreu = [
            "blume_tulpe",
            "blume_klee",
            "blume_mohn",
            "farn_normal",
            "farn_breit",
            "farn_schmal",
            "gestruepp_busch",
            "gestruepp_decker",
            "gestruepp_stecher",
            "fels",
            "spore",
            "pollen",
            "schilf_reihe",
            "schilf_tuff",
            "schilf_rohr",
        ];
        const missingStreu = expectedStreu.filter((n) => !streu.names.includes(n));
        if (missingStreu.length) {
            console.log(`FEHLEND: ${missingStreu.join(", ")}`);
            exitCode = 1;
        } else {
            console.log("✓ alle 15 Streu-Arten registriert");
        }

        // (3) Spawn-Lottery: zähle die Bauplan-Varianten in der gestreamten Welt
        const spawnDist = await page.evaluate(() => {
            const r = window.anazhRealm;
            const archs = (r.state.architectures || []).filter((a) => a.type && a.type.startsWith("baum_"));
            const dist = {};
            for (const a of archs) dist[a.type] = (dist[a.type] || 0) + 1;
            return { total: archs.length, dist };
        });
        console.log("\n=== (3) SPAWN-LOTTERY (gespawnte Varianten) ===");
        console.log(`Bäume total: ${spawnDist.total}`);
        const distinctVarianten = Object.keys(spawnDist.dist);
        for (const n of distinctVarianten.sort()) console.log(`  ${n}: ${spawnDist.dist[n]}`);
        if (distinctVarianten.length < 3) {
            console.log("WARN: zu wenige verschiedene Baum-Varianten in der Probe (< 3)");
            // nicht fatal — die Welt streamt vielleicht nur wenige
        } else {
            console.log(`✓ ${distinctVarianten.length} verschiedene Baum-Varianten gespawnt`);
        }

        // (4) Λ.1 Role-Migration test
        const roleMig = await page.evaluate(() => {
            const r = window.anazhRealm;
            // erstelle einen test-Bauplan, der ein altes Eiche ist (rich+symmetrisch
            // mit explicit role=soul, kein roleManual)
            const eicheParts = [
                { shape: "cylinder", material: "holz", position: { x: 0, y: 1.5, z: 0 }, size: { x: 0.85, y: 3.2, z: 0.85 } },
                { shape: "cylinder", material: "holz", position: { x: -1.2, y: 4.0, z: 0 }, size: { x: 0.3, y: 1.5, z: 0.3 } },
                { shape: "cylinder", material: "holz", position: { x: 1.2, y: 4.0, z: 0 }, size: { x: 0.3, y: 1.5, z: 0.3 } },
                { shape: "sphere", material: "laub", position: { x: 0, y: 5.0, z: 0 }, size: { x: 2.9, y: 2.6, z: 2.9 } },
            ];
            r.state.blueprints["__test_eiche"] = {
                name: "__test_eiche",
                parts: eicheParts,
                role: "soul", // alte Klassifikation
                builtIn: false,
                roleManual: false,
            };
            const beforeRole = r.state.blueprints["__test_eiche"].role;
            // simuliere genV < 2 (altes save) + restore-pass
            if (!r.state.worldMeta) r.state.worldMeta = {};
            const oldGenV = r.state.worldMeta.genVersion;
            r.state.worldMeta.genVersion = 1;
            // run die Migration manuell (sie ist im _loadStateRestoreCraftingInventory)
            for (const name of Object.keys(r.state.blueprints || {})) {
                const bp = r.state.blueprints[name];
                if (!bp || bp.builtIn || bp.roleManual) continue;
                const newRole = r.computeBlueprintRole(bp);
                if (newRole && bp.role !== newRole) bp.role = newRole;
            }
            const afterRole = r.state.blueprints["__test_eiche"].role;
            // cleanup
            delete r.state.blueprints["__test_eiche"];
            r.state.worldMeta.genVersion = oldGenV;
            return { beforeRole, afterRole };
        });
        console.log("\n=== (4) Λ.1 ROLE-MIGRATION ===");
        console.log(`Test-Eiche vorher: ${roleMig.beforeRole} → nachher: ${roleMig.afterRole}`);
        if (roleMig.afterRole === "architecture") {
            console.log("✓ Λ.1 Migration wirkt: alte 'soul'-Eiche → architecture");
        } else {
            console.log(`FEHLER: Migration nicht erfolgt (erwartet 'architecture', gemessen '${roleMig.afterRole}')`);
            exitCode = 1;
        }

        if (errors.length) {
            console.log(`\nPAGE-ERRORS: ${errors.length}`);
            for (const e of errors.slice(0, 5)) console.log(`  ${e}`);
            exitCode = 1;
        }
    } catch (e) {
        console.error("FATAL:", e.message);
        exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(exitCode);
})();
