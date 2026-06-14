// diag-sichtbar.cjs — Schöpfer-Frage 14.06.: "müssten die unterschiedlichen
// büsche, varianten der bäume, decor etc nicht schon zu sehen sein, fehlen
// die dinge noch (noch ausstehend) oder teile nur als passagier integriert?"
//
// Ehrliche Mess-Probe: was IST sichtbar in der aktuellen Welt, was ist
// gebaut aber Passagier, was fehlt?

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const PORT = String(process.env.DIAG_PORT || 4323);

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], {
            stdio: ["ignore", "pipe", "pipe"],
            env: { ...process.env, PORT },
        });
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load", timeout: 15000 });
        await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state, { timeout: 15000 });
        // Warmup: 30s Welt streamen
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const start = performance.now();
            while (performance.now() - start < 30000) {
                try { r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_) {}
            }
        });

        const r = await page.evaluate(() => {
            const r = window.anazhRealm;
            const A = r.constructor;
            const s = r.state;
            const out = {};

            // 1. genVersion der aktuellen Welt
            out.genVersion = (s.worldMeta && s.worldMeta.genVersion) || 1;
            out.worldSeed = s.worldMeta && s.worldMeta.seed;

            // 2. Aktuelle gespawnte Architekturen-Typen
            const archTypeCounts = {};
            for (const a of s.architectures || []) {
                if (!a) continue;
                const t = a.type || a.name || a.bp || "unknown";
                archTypeCounts[t] = (archTypeCounts[t] || 0) + 1;
            }
            out.archTypeCounts = archTypeCounts;
            out.totalArchs = (s.architectures || []).length;

            // 3. Baum-Varianten gespawnt?
            const treeVariants = Object.keys(archTypeCounts).filter((k) =>
                /^baum_/.test(k)
            );
            out.treeVariantsSpawned = treeVariants;
            out.treeVariantCount = treeVariants.length;

            // 4. Totholz gespawnt? (V18.198)
            out.totholzSpawned = archTypeCounts["stamm_gefallen"] || 0;

            // 5. Klein-Vegetation (Büsche/Farne/Blumen) — wie viele Arten in den Chunks?
            const veggieArten = new Set();
            let veggieInstances = 0;
            if (s.voxelChunks) {
                for (const [, entry] of s.voxelChunks) {
                    if (!entry) continue;
                    // KLEIN_VEGETATION instances werden in entry.scatterInstances o.ä. gespeichert
                    if (entry.scatterInstances) {
                        for (const sn of Object.keys(entry.scatterInstances)) {
                            veggieArten.add(sn);
                            const arr = entry.scatterInstances[sn];
                            if (Array.isArray(arr)) veggieInstances += arr.length;
                            else if (arr && typeof arr.count === "number") veggieInstances += arr.count;
                        }
                    }
                }
            }
            out.kleinVegArten = Array.from(veggieArten);
            out.kleinVegInstances = veggieInstances;

            // 6. Γ-M LICHEN — Source-Probe und Math
            const ss = (e0, e1, v) => {
                let t = (v - e0) / (e1 - e0);
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                return t * t * (3 - 2 * t);
            };
            const LCH = A.LICHEN;
            // Sample-Punkt mit Feuchte + Dichte hoch
            let lichenSamples = 0;
            let lichenSum = 0;
            let lichenMax = 0;
            if (r._voxelNoise && r._feuchteAt && r.worldFieldAt) {
                for (let i = 0; i < 200; i++) {
                    const x = (i * 17 + 31) % 600 - 300;
                    const z = (i * 23 + 7) % 600 - 300;
                    const y = r._terrainMacroSurfaceY(x, z, false);
                    const wY = r._waterLevelAt ? r._waterLevelAt(x, z) : -3;
                    if (y <= wY + 0.5) continue;
                    const feuchte = r._feuchteAt(x, z, y);
                    const f = r.worldFieldAt(x, z);
                    const cluster = (r._voxelNoise.noise2D(x * 0.04 + 7.7, z * 0.04 - 3.3) + 1) * 0.5;
                    const lichenMix =
                        ss(LCH.feuchteLo, LCH.feuchteHi, feuchte) *
                        ss(LCH.dichteLo, LCH.dichteHi, f.dichte || 0) *
                        cluster *
                        LCH.strength;
                    lichenSum += lichenMix;
                    lichenSamples++;
                    if (lichenMix > lichenMax) lichenMax = lichenMix;
                }
            }
            out.lichenAvg = lichenSamples ? lichenSum / lichenSamples : 0;
            out.lichenMax = lichenMax;
            out.lichenSamples = lichenSamples;

            // 7. Γ-M IRON-BANDS — gibt es eisen-Material an gegrabenen Positionen?
            let ironHits = 0;
            let probed = 0;
            for (let i = 0; i < 200; i++) {
                const x = (i * 73 + 5) % 800 - 400;
                const z = (i * 97 + 13) % 800 - 400;
                const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
                if (!Number.isFinite(surfY)) continue;
                const deepY = surfY - 40; // tief unter Oberfläche
                const mat = r._terrainMaterialAt(x, z, deepY);
                probed++;
                if (mat === "eisen") ironHits++;
            }
            out.ironHitsAtDepth40 = ironHits;
            out.ironProbed = probed;

            // 8. Γ-M STRATA — wirkt es?
            let steinDeep = 0, erdeShallow = 0;
            for (let i = 0; i < 100; i++) {
                const x = (i * 37) % 500 - 250;
                const z = (i * 41) % 500 - 250;
                const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
                if (!Number.isFinite(surfY)) continue;
                const surfMat = r._terrainMaterialAt(x, z, surfY); // Oberfläche
                const deepMat = r._terrainMaterialAt(x, z, surfY - 20); // tief
                if (deepMat === "stein") steinDeep++;
                if (surfMat === "erde") erdeShallow++;
            }
            out.strataActive = steinDeep > 50; // 50%+ tief = stein → STRATA wirkt

            // 9. Γ3 Feld-Charakter — aktiv?
            out.gamma3Active = out.genVersion >= 3;
            // Was sieht die Welt — Frequenz-Verteilung
            if (r.worldFieldAt) {
                const f1 = r.worldFieldAt(0, 0);
                const f2 = r.worldFieldAt(100, 100);
                out.worldFieldSample = { atOrigin: f1, at100: f2 };
            }

            // 10. _growTreeBlueprint — wird es VOM WORLDGEN gerufen?
            const vegSrc = r._vegetationSampleSpawn.toString();
            out.growTreeVerdrahtet = /_growTreeBlueprint/.test(vegSrc);

            // 11. _scentAt — Konsument im Kreatur-KI-Pfad?
            const creatureTickFns = [
                "_tickCreatureAI", "_tickCreature", "_creatureNextAction",
                "_tickAmbientFauna", "_creatureWaterContextAt",
            ];
            const scentConsumers = [];
            for (const fn of creatureTickFns) {
                if (typeof r[fn] === "function") {
                    const src = r[fn].toString();
                    if (/_scentAt|_worldWindDirAt/.test(src)) scentConsumers.push(fn);
                }
            }
            out.scentConsumers = scentConsumers;

            // 12. _drainMana — Konsumenten im Spiel-Code?
            // Naive Probe: scanne ein paar Tick-Pfade
            const checkFns = [
                "applyPlayerSoul", "dslRun", "applyOpToPart", "tryMouseBreak",
                "useToolOn", "applyBoost",
            ];
            const manaConsumers = [];
            for (const fn of checkFns) {
                if (typeof r[fn] === "function") {
                    const src = r[fn].toString();
                    if (/_drainMana|_canPayMana/.test(src)) manaConsumers.push(fn);
                }
            }
            out.manaConsumers = manaConsumers;

            // 13. R5 microBoost — aktiver Wert
            out.r5MicroBoost = A.R5_STRUCTURE_TEXTURE && A.R5_STRUCTURE_TEXTURE.microBoost;

            return out;
        });

        console.log("=== SICHTBARKEITS-AUDIT — Schöpfer-Frage 14.06. ===\n");
        console.log(`WELT: gen=${r.genVersion}, seed="${r.worldSeed}", ${r.totalArchs} Architekturen gespawnt\n`);

        console.log("--- 1. BAUM-VARIANTEN (V18.179+V18.181+V18.182) ---");
        console.log(`Verschiedene Baum-Arten im aktuellen Welt-Spawn: ${r.treeVariantCount}`);
        for (const t of r.treeVariantsSpawned) {
            console.log(`  ${t}: ${r.archTypeCounts[t]} Instanzen`);
        }
        console.log("");

        console.log("--- 2. TOTHOLZ stamm_gefallen (V18.198) ---");
        console.log(`stamm_gefallen Instanzen: ${r.totholzSpawned} ${r.totholzSpawned > 0 ? "✓ SICHTBAR" : "✗ nicht gespawnt"}\n`);

        console.log("--- 3. KLEIN-VEGETATION Büsche/Farne/Blumen ---");
        console.log(`${r.kleinVegArten.length} Arten gestreut, ~${r.kleinVegInstances} Instanzen`);
        for (const v of r.kleinVegArten) console.log(`  ${v}`);
        console.log("");

        console.log("--- 4. Γ-M LICHEN Render-Patina (V18.199) ---");
        console.log(`Avg lichen-Mix über ${r.lichenSamples} Boden-Samples: ${r.lichenAvg.toFixed(4)}`);
        console.log(`Max lichen-Mix: ${r.lichenMax.toFixed(4)}`);
        console.log(`→ ${r.lichenMax > 0.05 ? "✓ SICHTBAR an feuchten Steinen" : "≈ kaum sichtbar in dieser Region"}\n`);

        console.log("--- 5. Γ-M IRON-BANDS (V18.200) ---");
        console.log(`Eisen-Hits an y=surfY-40: ${r.ironHitsAtDepth40}/${r.ironProbed} (${(r.ironHitsAtDepth40 / r.ironProbed * 100).toFixed(1)}%)`);
        console.log(`→ ${r.ironHitsAtDepth40 > 0 ? "✓ SICHTBAR beim Graben (Spieler findet Eisen-Adern)" : "→ keine Adern in dieser Region"}\n`);

        console.log("--- 6. Γ-M STRATA (V18.197) ---");
        console.log(`→ ${r.strataActive ? "✓ SICHTBAR (tieferes Graben gibt Stein, kein Humus)" : "✗ nicht aktiv"}\n`);

        console.log("--- 7. Γ3 Feld-Charakter (V18.203+V18.204) ---");
        console.log(`gen >= 3? ${r.gamma3Active} (aktuelle gen=${r.genVersion})`);
        console.log(`→ ${r.gamma3Active ? "✓ AKTIV (Frequenz-Fächer + Domain-Warp wirken)" : "✗ LEGACY (gen<3, Γ3 nicht aktiv — alte Welt-Substanz)"}\n`);

        console.log("--- 8. Γ7 `_growTreeBlueprint` Worldgen-Verdrahtung (V18.205) ---");
        console.log(`→ ${r.growTreeVerdrahtet ? "✓ Worldgen ruft den Generator" : "✗ FOUNDATION-ONLY — Worldgen ruft ihn NICHT"}\n`);

        console.log("--- 9. Γ1-NASE Geruch-Feld Kreatur-KI (V18.202) ---");
        console.log(`Konsumenten: ${r.scentConsumers.length === 0 ? "KEINE" : r.scentConsumers.join(", ")}`);
        console.log(`→ ${r.scentConsumers.length > 0 ? "✓ verdrahtet" : "✗ FOUNDATION-ONLY"}\n`);

        console.log("--- 10. Mana-Konsumenten (V18.201) ---");
        console.log(`Konsumenten: ${r.manaConsumers.length === 0 ? "KEINE" : r.manaConsumers.join(", ")}`);
        console.log(`→ ${r.manaConsumers.length > 0 ? "✓ verdrahtet" : "✗ FOUNDATION-ONLY"}\n`);

        console.log("--- 11. R5 microBoost (V18.207) ---");
        console.log(`microBoost = ${r.r5MicroBoost} (Default 1.0 = no-op)`);
        console.log(`→ ${r.r5MicroBoost === 1.0 ? "✗ NO-OP (Default unverändert)" : "✓ aktiv"}\n`);

        // EHRLICHE BILANZ
        console.log("=== EHRLICHE BILANZ ===");
        const sichtbar = [];
        const passagier = [];

        if (r.treeVariantCount >= 3) sichtbar.push(`Baum-Varianten (${r.treeVariantCount} Arten)`);
        else if (r.treeVariantCount >= 1) sichtbar.push(`Baum-Varianten (${r.treeVariantCount}, gering)`);

        if (r.totholzSpawned > 0) sichtbar.push("Totholz stamm_gefallen");
        if (r.kleinVegArten.length >= 3) sichtbar.push(`Büsche/Farne/Blumen (${r.kleinVegArten.length} Arten)`);
        if (r.strataActive) sichtbar.push("STRATA beim Graben");
        if (r.lichenMax > 0.05) sichtbar.push("LICHEN-Patina an feuchten Steinen");
        if (r.ironHitsAtDepth40 > 0) sichtbar.push("IRON-BANDS beim Tiefgraben");
        if (r.gamma3Active) sichtbar.push("Γ3 Welt-Charakter aktiv");

        if (!r.growTreeVerdrahtet) passagier.push("V18.205 _growTreeBlueprint (Worldgen ruft ihn nicht)");
        if (r.scentConsumers.length === 0) passagier.push("V18.202 _scentAt (Kreatur-KI ignoriert ihn)");
        if (r.manaConsumers.length === 0) passagier.push("V18.201 _drainMana (kein Spiel-Akt zieht Mana)");
        if (r.r5MicroBoost === 1.0) passagier.push("V18.207 R5 microBoost (Default 1.0 = no-op)");
        if (!r.gamma3Active) passagier.push(`Γ3 Welt-Charakter (Welt ist gen=${r.genVersion}, gates auf gen>=3)`);

        console.log("\nSICHTBAR im aktuellen Spiel:");
        sichtbar.forEach((s) => console.log(`  ✓ ${s}`));
        console.log("\nPASSAGIER (gebaut aber kein Konsument / no-op / gen-Tor zu):");
        passagier.forEach((p) => console.log(`  ✗ ${p}`));
    } finally {
        await browser.close();
        server.kill();
    }
})();
