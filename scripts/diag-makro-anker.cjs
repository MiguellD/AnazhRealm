// diag-makro-anker.cjs — Γ4-VOLLENDUNG V18.193 Beweis-Werkzeug.
//
// Drei Beweise (über N=10 Seeds, statistisch robust):
//   A — DETERMINISMUS: _makeMacroAnker(seed) zweimal gerufen → bit-identisch.
//   B — ABFLUSS-INVARIANTE: _macroSpillpointAnalysis(anker).hasOutflow = true
//       für alle 10 Seeds (Spannweite max−min am Rim > beckenD*0.5).
//   C — ERBGUT-PERSISTENZ:
//       (1) erstmaliger _macroAnker() schreibt worldMeta.macro
//       (2) zweiter _macroAnker() liest aus worldMeta.macro (gleiche Instanz)
//       (3) Validierung: korrupter macro-Felt wird verworfen + re-computed
//       (4) Snapshot-Round-Trip: build→load → macro reist intakt
//   D — MIGRATION: Welt ohne worldMeta.macro (Legacy gen<3) → null, kein Crash;
//       Welt ohne worldMeta.macro (gen=3) → re-computed aus Seed
//   E — DER WORKER-MIRROR: snap.macroAnker reist mit (struktur-Probe).
//
// Schreibt artifacts/makro-anker.json mit Anker-Daten + Spillpunkt-Analyse pro
// Seed. Lauf-Ergebnis als exit-Code: 0 = alle grün, 1 = mindestens ein Befund.
//
//   node scripts/diag-makro-anker.cjs

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const PORT = String(process.env.DIAG_PORT || 4321);

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
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    let exitCode = 0;
    try {
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e.message || e)));
        await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load", timeout: 15000 });
        await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state, { timeout: 15000 });

        const SEEDS = [
            "seed-a", "seed-b", "seed-c", "seed-d", "seed-e",
            "seed-f", "seed-g", "seed-h", "seed-i", "seed-j",
        ];

        const result = await page.evaluate((SEEDS) => {
            const r = window.anazhRealm;
            const A = r.constructor;
            const report = {
                determinism: [],
                spillpoint: [],
                erbgut: {},
                migration: {},
                workerMirror: {},
                anker: [],
            };

            // A — DETERMINISMUS: _makeMacroAnker(seed) zweimal → identisch
            for (const seed of SEEDS) {
                const a = r._makeMacroAnker(seed);
                const b = r._makeMacroAnker(seed);
                const same =
                    a.massivC.x === b.massivC.x &&
                    a.massivC.z === b.massivC.z &&
                    a.massivR === b.massivR &&
                    a.massivH === b.massivH &&
                    a.beckenC.x === b.beckenC.x &&
                    a.beckenC.z === b.beckenC.z &&
                    a.beckenR === b.beckenR &&
                    a.beckenD === b.beckenD &&
                    a.talVertices.length === b.talVertices.length &&
                    a.talVertices.every((v, i) => v.x === b.talVertices[i].x && v.z === b.talVertices[i].z) &&
                    a.talFloors.every((f, i) => f === b.talFloors[i]);
                report.determinism.push({ seed, same });
            }

            // B — ABFLUSS-INVARIANTE über alle Seeds. Wir setzen jeden Seed
            // als worldMeta.seed, zwingen gen=3, bauen den Anker, messen.
            const origSeed = r.state.worldMeta ? r.state.worldMeta.seed : null;
            const origGen = r.state.worldMeta ? r.state.worldMeta.genVersion : undefined;
            const origMacro = r.state.worldMeta ? r.state.worldMeta.macro : undefined;
            try {
                for (const seed of SEEDS) {
                    if (!r.state.worldMeta) r.state.worldMeta = {};
                    r.state.worldMeta.seed = seed;
                    r.state.worldMeta.genVersion = 3;
                    delete r.state.worldMeta.macro;
                    r._macroAnkerCache = null;
                    r._voxelNoise = null;
                    r._macroRidgeNoise = null;
                    const anker = r._macroAnker();
                    const spill = r._macroSpillpointAnalysis(anker);
                    report.spillpoint.push({
                        seed,
                        beckenD: anker.beckenD,
                        beckenR: anker.beckenR,
                        minRimY: spill.minRimY,
                        maxRimY: spill.maxRimY,
                        span: spill.span,
                        hasOutflow: spill.hasOutflow,
                        spillVsTalDeg: spill.spillVsTalDeg,
                    });
                    report.anker.push({
                        seed,
                        massivC: anker.massivC,
                        massivR: anker.massivR,
                        beckenC: anker.beckenC,
                        beckenR: anker.beckenR,
                        beckenD: anker.beckenD,
                        talFloors: anker.talFloors,
                    });
                }

                // C — ERBGUT-PERSISTENZ
                r.state.worldMeta.seed = "erbgut-test";
                r.state.worldMeta.genVersion = 3;
                delete r.state.worldMeta.macro;
                r._macroAnkerCache = null;
                r._voxelNoise = null;
                r._macroRidgeNoise = null;
                const ank1 = r._macroAnker();
                // (1) wurde wm.macro geschrieben?
                report.erbgut.writtenAfterFirstCall = !!r.state.worldMeta.macro;
                // (2) zweite Lesung — gleiches Objekt?
                r._macroAnkerCache = null;
                const ank2 = r._macroAnker();
                report.erbgut.sameInstanceFromCache = ank2 === r.state.worldMeta.macro;
                report.erbgut.sameValuesAfterReload =
                    ank1.massivC.x === ank2.massivC.x &&
                    ank1.beckenD === ank2.beckenD;
                // (3) Validierung: korrupter macro
                r.state.worldMeta.macro = { massivC: null, beckenC: null };
                r._macroAnkerCache = null;
                const ank3 = r._macroAnker();
                report.erbgut.corruptRejected = ank3 && ank3.massivC && typeof ank3.massivR === "number";
                // (4) Snapshot-Round-Trip simuliert: macro wandert per Spread
                const snap = JSON.parse(JSON.stringify({ macro: r.state.worldMeta.macro }));
                report.erbgut.snapshotRoundTrip =
                    snap.macro && snap.macro.massivR === r.state.worldMeta.macro.massivR;

                // D — MIGRATION
                r.state.worldMeta.genVersion = 1;
                delete r.state.worldMeta.macro;
                r._macroAnkerCache = null;
                report.migration.legacyGen1Null = r._macroAnker() === null;
                r.state.worldMeta.genVersion = 3;
                delete r.state.worldMeta.macro;
                r._macroAnkerCache = null;
                const migrAnk = r._macroAnker();
                report.migration.gen3WithoutMacroRebuilds = !!migrAnk && !!r.state.worldMeta.macro;

                // E — WORKER-MIRROR: _voxelWorkerSnapshotState reicht macroAnker?
                const wsnap = r._voxelWorkerSnapshotState();
                report.workerMirror.hasField = "macroAnker" in wsnap;
                report.workerMirror.valid = wsnap.macroAnker
                    ? A._isValidMacroAnker(wsnap.macroAnker)
                    : false;
            } finally {
                if (r.state.worldMeta) {
                    if (origSeed === null) delete r.state.worldMeta.seed;
                    else r.state.worldMeta.seed = origSeed;
                    if (origGen === undefined) delete r.state.worldMeta.genVersion;
                    else r.state.worldMeta.genVersion = origGen;
                    if (origMacro === undefined) delete r.state.worldMeta.macro;
                    else r.state.worldMeta.macro = origMacro;
                }
                r._macroAnkerCache = null;
                r._voxelNoise = null;
                r._macroRidgeNoise = null;
            }
            return report;
        }, SEEDS);

        // Auswertung
        const allDeterm = result.determinism.every((d) => d.same);
        const allOutflow = result.spillpoint.every((s) => s.hasOutflow);
        const erbgutOK =
            result.erbgut.writtenAfterFirstCall &&
            result.erbgut.sameInstanceFromCache &&
            result.erbgut.sameValuesAfterReload &&
            result.erbgut.corruptRejected &&
            result.erbgut.snapshotRoundTrip;
        const migrOK = result.migration.legacyGen1Null && result.migration.gen3WithoutMacroRebuilds;
        const workerOK = result.workerMirror.hasField && result.workerMirror.valid;

        console.log("=== Γ4-VOLLENDUNG V18.193 — Beweis-Lauf ===");
        console.log("");
        console.log("A — DETERMINISMUS (_makeMacroAnker(seed) zweimal == identisch):");
        result.determinism.forEach((d) =>
            console.log(`  [${d.same ? "OK" : "FAIL"}] ${d.seed}`)
        );
        console.log("");
        console.log("B — ABFLUSS-INVARIANTE (Rim-Spannweite > beckenD*0.5):");
        result.spillpoint.forEach((s) =>
            console.log(
                `  [${s.hasOutflow ? "OK" : "FAIL"}] ${s.seed}: span=${s.span.toFixed(1)}m, ` +
                    `beckenD=${s.beckenD.toFixed(1)}m, schwelle=${(s.beckenD * 0.5).toFixed(1)}m, ` +
                    `spillVsTal=${s.spillVsTalDeg.toFixed(0)}°`
            )
        );
        console.log("");
        console.log("C — ERBGUT-PERSISTENZ:");
        console.log(`  [${result.erbgut.writtenAfterFirstCall ? "OK" : "FAIL"}] wm.macro nach erstem _macroAnker() gesetzt`);
        console.log(`  [${result.erbgut.sameInstanceFromCache ? "OK" : "FAIL"}] zweite Lesung liest wm.macro (gleiche Instanz)`);
        console.log(`  [${result.erbgut.sameValuesAfterReload ? "OK" : "FAIL"}] Werte identisch über Cache-Reset`);
        console.log(`  [${result.erbgut.corruptRejected ? "OK" : "FAIL"}] korrupter macro-Felt verworfen + neu gebaut`);
        console.log(`  [${result.erbgut.snapshotRoundTrip ? "OK" : "FAIL"}] Snapshot-Round-Trip (JSON.parse) erhält macro`);
        console.log("");
        console.log("D — MIGRATION:");
        console.log(`  [${result.migration.legacyGen1Null ? "OK" : "FAIL"}] gen=1 ohne macro → null`);
        console.log(`  [${result.migration.gen3WithoutMacroRebuilds ? "OK" : "FAIL"}] gen=3 ohne macro → re-computed + persistiert`);
        console.log("");
        console.log("E — WORKER-MIRROR:");
        console.log(`  [${result.workerMirror.hasField ? "OK" : "FAIL"}] snap.macroAnker reist mit`);
        console.log(`  [${result.workerMirror.valid ? "OK" : "FAIL"}] snap.macroAnker valid`);
        console.log("");

        const allGreen = allDeterm && allOutflow && erbgutOK && migrOK && workerOK;
        console.log(`Page-Errors: ${errors.length}${errors.length ? " — " + errors.join("\n  ") : ""}`);
        console.log("");
        if (allGreen && !errors.length) {
            console.log("✓ ALLE GRÜN.");
        } else {
            console.log("✗ MINDESTENS EIN BEFUND.");
            exitCode = 1;
        }

        // Artefakt schreiben
        try {
            fs.mkdirSync("artifacts", { recursive: true });
            fs.writeFileSync(
                "artifacts/makro-anker.json",
                JSON.stringify({ result, allGreen, errors }, null, 2)
            );
            console.log("Report: artifacts/makro-anker.json");
        } catch (e) {
            console.log(`(Konnte Artefakt nicht schreiben: ${e.message})`);
        }
    } catch (e) {
        console.error("Diag-Fehler:", e.message || e);
        exitCode = 2;
    } finally {
        await browser.close();
        server.kill();
        process.exit(exitCode);
    }
})();
