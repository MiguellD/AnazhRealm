// diag-archipel-last.cjs — Φ0 (V18.188): die LAST-SONDE des Welten-Netzes.
// Misst die drei Zahlen, die alle S-Entscheide des Archipel-Bogens füttern:
//   A  Snapshot-Größe der aktiven Welt (roh + brotli-Größe-Schätzung):
//      bestimmt das Mitträger-Budget (Φ5) + den Handoff-Kosten-Boden (Φ3).
//   B  Chunk-Build-Wand-Zeit (avg + p95 über N Chunks): bestimmt das
//      Worker-Budget je Frame + die Naht-Handoff-Spürbarkeit (Φ3).
//   C  hostInfo/worldAddress-Größen: das winzige p2p-Stück, das durch
//      jede Welt-Verbindung reist (sollte < 1 KiB sein — Vergleichs-Marke).
//   D  Empfehlung für Φ3-Konstanten (REGION_CHUNKS, MAX_PEERS_PER_BUBBLE)
//      auf Basis der gemessenen Snapshot-/Build-Kosten.
//
// Das Skript ist OFFLINE-tauglich (kein signaling-server nötig) — die Mesh-
// Kapazität-Kurve (ehrliches Voll-Mesh-Spam) braucht den Broker + N synth.
// Peers; das ist ein eigener Lauf (`smoke-multiuser` + Erweiterung). Hier:
// die KOSTEN-Seite (was reist, was kostet das?). Schreibt artifacts/
// archipel-last.json — inkrementell, ein gekillter Lauf hinterlässt Daten.
//
// Ein Lauf: `node scripts/diag-archipel-last.cjs` (~30 s).

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const zlib = require("zlib");

const SERVER_JS = path.resolve("save-server.js");
const ARTIFACTS_DIR = path.resolve("artifacts");
const REPORT_PATH = path.join(ARTIFACTS_DIR, "archipel-last.json");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], {
            stdio: ["ignore", "pipe", "pipe"],
            env: { ...process.env, PORT: "4318" }, // Diag-Port — parallel zu Playtest 4312
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

function ensureArtifacts() {
    if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

function writeReport(report) {
    ensureArtifacts();
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

function percentile(sortedArr, p) {
    if (!sortedArr.length) return 0;
    const idx = Math.min(sortedArr.length - 1, Math.floor((p / 100) * sortedArr.length));
    return sortedArr[idx];
}

(async () => {
    const report = { startedAt: new Date().toISOString(), version: null, measurements: {} };
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
        await page.goto("http://127.0.0.1:4318/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 30000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.playerMesh ||
                    !window.anazhRealm.state.voxelChunks ||
                    window.anazhRealm.state.voxelChunks.size < 6) &&
                performance.now() < dl
            ) {
                if (window.anazhRealm && window.anazhRealm._gameLoopTick) {
                    window.anazhRealm._gameLoopTick(performance.now());
                }
                await new Promise((r) => setTimeout(r, 50));
            }
        });
        console.log("\nΦ0 LAST-SONDE — die Kosten-Seite des Welten-Netzes\n");

        // ────────────────────────── A: Snapshot-Größen ──────────────────────────
        const snapshotJson = await page.evaluate(() => {
            const r = window.anazhRealm;
            return JSON.stringify(r.buildStateSnapshot());
        });
        const rawBytes = Buffer.byteLength(snapshotJson, "utf8");
        const brotliBytes = zlib.brotliCompressSync(snapshotJson).length;
        const gzipBytes = zlib.gzipSync(snapshotJson).length;
        report.measurements.snapshot = {
            rawBytes,
            rawKiB: +(rawBytes / 1024).toFixed(1),
            gzipBytes,
            gzipKiB: +(gzipBytes / 1024).toFixed(1),
            brotliBytes,
            brotliKiB: +(brotliBytes / 1024).toFixed(1),
            compressionRatio: +(rawBytes / brotliBytes).toFixed(2),
        };
        console.log("A — Snapshot der aktiven Welt:");
        console.log(`  roh:    ${report.measurements.snapshot.rawKiB} KiB`);
        console.log(`  gzip:   ${report.measurements.snapshot.gzipKiB} KiB`);
        console.log(
            `  brotli: ${report.measurements.snapshot.brotliKiB} KiB (Faktor ${report.measurements.snapshot.compressionRatio}×)`
        );
        writeReport(report);

        // ────────────────────────── B: Chunk-Build-Wand ──────────────────────────
        // Wir messen N Chunk-Builds via der DIREKTEN Pfad-Methode `_buildVoxelChunkData`
        // (V9.82-Verdichtung — sie ist der Stamm-Build, der Worker-Mirror spiegelt sie).
        // Ein _ensureVoxelChunkAt würde den Build durch den Streaming-Tick routen, das
        // ist asynchron + verschluckt das Mess-Fenster. Der direkte Pfad gibt die ehrliche
        // CPU-Wand-Kosten (was der Naht-Handoff in Φ3 unter dem Spieler kosten würde).
        const buildStats = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const samples = [];
            const N = 12;
            const playerPos = r.state.playerMesh.position;
            const baseCx = Math.floor((playerPos.x + 150) / 43.2);
            const baseCz = Math.floor((playerPos.z + 150) / 43.2);
            for (let i = 0; i < N; i++) {
                // weit genug von gebauten Chunks, damit kein Cache-Treffer
                const cx = baseCx + 16 + (i % 4);
                const cz = baseCz + 16 + Math.floor(i / 4);
                const t0 = performance.now();
                // _buildVoxelChunkData ist der direkte Stamm-Build (kein Streaming-Tick)
                if (typeof r._buildVoxelChunkData === "function") {
                    const result = r._buildVoxelChunkData(cx, cz, 0);
                    // disposen, sonst füllen wir den Heap
                    if (result && result.mesh && typeof result.mesh.geometry === "object") {
                        try {
                            result.mesh.geometry.dispose();
                            if (result.mesh.material && result.mesh.material.dispose) {
                                result.mesh.material.dispose();
                            }
                        } catch {
                            /* defensive */
                        }
                    }
                }
                const t1 = performance.now();
                samples.push(t1 - t0);
            }
            return samples;
        });
        const sorted = [...buildStats].sort((a, b) => a - b);
        const avg = buildStats.reduce((a, b) => a + b, 0) / buildStats.length;
        report.measurements.chunkBuild = {
            samples: buildStats.length,
            avgMs: +avg.toFixed(2),
            p50Ms: +percentile(sorted, 50).toFixed(2),
            p95Ms: +percentile(sorted, 95).toFixed(2),
            maxMs: +sorted[sorted.length - 1].toFixed(2),
        };
        console.log("\nB — Chunk-Build-Wand (sync-Pfad, N=12 nahe Chunks):");
        console.log(
            `  avg: ${report.measurements.chunkBuild.avgMs} ms · p50: ${report.measurements.chunkBuild.p50Ms} ms · p95: ${report.measurements.chunkBuild.p95Ms} ms · max: ${report.measurements.chunkBuild.maxMs} ms`
        );
        writeReport(report);

        // ────────────────────────── C: Adress-Größen ──────────────────────────
        const addrStats = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const subst = r._buildWorldAddressSubstance({});
            const canonical = subst ? r._canonicalWorldAddress(subst) : "";
            let signed = null;
            try {
                const res = await r.signWorldAddress({ skipConfirm: true });
                if (res && res.ok) signed = res.address;
            } catch (e) {
                /* defensive */
            }
            return {
                hostInfoBytes:
                    r.state.worldMeta && r.state.worldMeta.hostInfo
                        ? JSON.stringify(r.state.worldMeta.hostInfo).length
                        : 0,
                canonicalBytes: canonical.length,
                signedBytes: signed ? JSON.stringify(signed).length : 0,
                signedFields: signed ? Object.keys(signed) : [],
            };
        });
        report.measurements.address = addrStats;
        console.log("\nC — Welt-Adresse (was durchs Portal/p2p reist):");
        console.log(`  hostInfo (Legacy): ${addrStats.hostInfoBytes} B`);
        console.log(`  canonical:         ${addrStats.canonicalBytes} B (signierter Kern)`);
        console.log(`  signiert komplett: ${addrStats.signedBytes} B (mit ed25519-sig + hülle)`);
        writeReport(report);

        // ────────────────────────── D: Empfehlung Φ3 ──────────────────────────
        // Erst-Wurf-Heuristiken (Plan §2 Φ3 / §6-Korrektur 1+2):
        //   REGION_CHUNKS: 8×8 = 346 m Kante; bei Weltenring max ≥13 (~540m
        //   Sichtkante). Wir nehmen die kleinere Zahl, wenn die Snapshot-Last
        //   nicht zu groß wird (Handoff-Budget ≤ 200 ms bei brotli + 1 MB/s).
        //   MAX_PEERS_PER_BUBBLE: 12 ist der Plan-Default (Lichtkegel).
        const snapBudgetMs = (report.measurements.snapshot.brotliBytes / (1024 * 1024)) * 1000; // bei 1 MB/s
        const fitsHandoff200 = snapBudgetMs <= 200;
        report.measurements.recommendation = {
            REGION_CHUNKS: fitsHandoff200 ? 8 : 13,
            REGION_CHUNKS_reason: fitsHandoff200
                ? "Snapshot-Brotli passt in 200ms@1MBps — 8×8≈346m Kante (Erst-Wurf)"
                : "Snapshot zu groß für 8er-Region → 13×13≈562m (deckt Sichtkante 540m)",
            MAX_PEERS_PER_BUBBLE: 12,
            MAX_PEERS_PER_BUBBLE_reason: "Lichtkegel-Default (Plan §0 Gesetz 1)",
            snapHandoffEstMs: +snapBudgetMs.toFixed(0),
            handoffEstNote: "bei 1 MB/s WebRTC-Bandbreite, brotli-komprimiert",
        };
        console.log("\nD — Empfehlung für Φ3-Konstanten:");
        console.log(
            `  REGION_CHUNKS = ${report.measurements.recommendation.REGION_CHUNKS}  (${report.measurements.recommendation.REGION_CHUNKS_reason})`
        );
        console.log(
            `  MAX_PEERS_PER_BUBBLE = ${report.measurements.recommendation.MAX_PEERS_PER_BUBBLE}  (${report.measurements.recommendation.MAX_PEERS_PER_BUBBLE_reason})`
        );
        console.log(
            `  geschätzter Snapshot-Handoff: ${report.measurements.recommendation.snapHandoffEstMs} ms ${report.measurements.recommendation.handoffEstNote}`
        );

        report.version = await page.evaluate(() => {
            const r = window.anazhRealm;
            return r.constructor && r.constructor.VERSION ? r.constructor.VERSION : "?";
        });
        report.endedAt = new Date().toISOString();
        writeReport(report);
        console.log(`\nReport geschrieben: ${REPORT_PATH}`);
    } catch (err) {
        console.error("DIAG-FEHLER:", err.message);
        report.error = err.message;
        writeReport(report);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
