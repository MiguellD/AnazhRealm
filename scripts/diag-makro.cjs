// diag-makro.cjs — Γ4 (genese-plan §4) Beweis-Werkzeug für den Makro-Anker.
//
// Drei Beweise:
//   A — STRUKTUR: _makeMacroAnker/_macroAnker/_macroSurfaceContribution leben +
//       MACRO_ANKER frozen + neue Welt trägt genVersion 3
//   B — GEOMETRIE: an einer frischen Welt
//       (1) das Massiv-Zentrum trägt eine messbare Höhen-Erhebung
//       (2) das Becken-Zentrum trägt eine messbare Höhen-Senke
//       (3) die Tal-Polyline-Mitte ist NIEDRIGER als ihr Senkrechtes (5 m + breite)
//       (4) das Becken ist KEINE geschlossene Schüssel (Abfluss-Invariante:
//           der Spillpunkt am Becken-Rand zeigt zum Tal-Endpunkt)
//   C — LEGACY-TOR: dieselbe Welt mit genVersion=2 zeigt die Geographie NICHT
//       (Höhen-Differenz Massiv-Zentrum vs Massiv-Rand schrumpft, d. h. das
//       designte Massiv ist NUR im Genese-3-Pfad sichtbar)
//
//   node scripts/diag-makro.cjs

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");

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
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    let fails = 0;
    const check = (ok, label, detail) => {
        console.log(`${ok ? "  ✓" : "  ✗"} ${label}${detail ? " — " + detail : ""}`);
        if (!ok) fails++;
    };

    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 25000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.playerMesh ||
                    !window.anazhRealm.state.hydrosphere ||
                    !window.anazhRealm.state.hydrosphere.ready) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 100));
        });

        // ---- A — STRUKTUR ----------------------------------------------
        console.log("A — STRUKTUR");
        const a = await page.evaluate(() => {
            const r = window.anazhRealm;
            const A = r.constructor;
            return {
                makeFn: typeof r._makeMacroAnker === "function",
                ankerFn: typeof r._macroAnker === "function",
                contribFn: typeof r._macroSurfaceContribution === "function",
                frozen: Object.isFrozen(A.MACRO_ANKER),
                gen: r._genVersion(),
                ankerExists: r._macroAnker() !== null,
            };
        });
        check(a.makeFn && a.ankerFn && a.contribFn, "drei Helper leben (_makeMacroAnker · _macroAnker · _macroSurfaceContribution)");
        check(a.frozen, "AnazhRealm.MACRO_ANKER frozen");
        check(a.gen === 3, "frische Welt trägt genVersion 3", `_genVersion()=${a.gen}`);
        check(a.ankerExists, "_macroAnker() liefert eine Anker-Struktur");

        // ---- B — GEOMETRIE ----------------------------------------------
        console.log("\nB — GEOMETRIE");
        const b = await page.evaluate(() => {
            const r = window.anazhRealm;
            const anker = r._macroAnker();
            if (!anker) return { error: "kein Anker" };

            // (1) Massiv: Höhe AM Zentrum vs am Rand
            const mC = anker.massivC;
            const surfAt = (x, z) => r._terrainMacroSurfaceY(x, z, false);
            const hCenter = surfAt(mC.x, mC.z);
            // Rand: in vier Richtungen 1.4 × Radius weg
            const R = anker.massivR * 1.4;
            const hRand = [
                surfAt(mC.x + R, mC.z),
                surfAt(mC.x - R, mC.z),
                surfAt(mC.x, mC.z + R),
                surfAt(mC.x, mC.z - R),
            ];
            const hRandMean = hRand.reduce((a, b) => a + b, 0) / hRand.length;
            const massivLift = hCenter - hRandMean;

            // (2) Becken: Höhe AM Zentrum vs am Rand
            const bC = anker.beckenC;
            const hBC = surfAt(bC.x, bC.z);
            const BR = anker.beckenR * 1.4;
            const hBRand = [
                surfAt(bC.x + BR, bC.z),
                surfAt(bC.x - BR, bC.z),
                surfAt(bC.x, bC.z + BR),
                surfAt(bC.x, bC.z - BR),
            ];
            const hBRandMean = hBRand.reduce((a, b) => a + b, 0) / hBRand.length;
            const beckenDip = hBRandMean - hBC;

            // (3) Tal-Mitte vs senkrecht: Mid-Vertex der Polyline
            const vts = anker.talVertices;
            const midIdx = Math.floor(vts.length / 2);
            const M = vts[midIdx];
            // Senkrechte: nimm die Tal-Richtung am Mid-Punkt
            const prev = vts[Math.max(0, midIdx - 1)];
            const next = vts[Math.min(vts.length - 1, midIdx + 1)];
            const tdx = next.x - prev.x;
            const tdz = next.z - prev.z;
            const tlen = Math.hypot(tdx, tdz) || 1;
            const pnx = -tdz / tlen;
            const pnz = tdx / tlen;
            const hTal = surfAt(M.x, M.z);
            const dPerp = anker.talBreite + 30;
            const hTalSide1 = surfAt(M.x + pnx * dPerp, M.z + pnz * dPerp);
            const hTalSide2 = surfAt(M.x - pnx * dPerp, M.z - pnz * dPerp);
            const hTalSideMean = (hTalSide1 + hTalSide2) / 2;
            const talDip = hTalSideMean - hTal;

            // (4) Abfluss-Invariante: der Spillpunkt zum Tal-Endpunkt muss
            // den niedrigsten Becken-Rand bilden. Sample den Becken-Rand
            // ringsum (16 Punkte), finde das Minimum, prüfe ob es Richtung
            // Tal-Endpunkt zeigt (Tal-Endpunkt = vts[last]).
            const tEnd = vts[vts.length - 1];
            const dirToTalAng = Math.atan2(tEnd.z - bC.z, tEnd.x - bC.x);
            let minH = Infinity;
            let minAng = 0;
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2;
                const sx = bC.x + Math.cos(a) * anker.beckenR;
                const sz = bC.z + Math.sin(a) * anker.beckenR;
                const sh = surfAt(sx, sz);
                if (sh < minH) {
                    minH = sh;
                    minAng = a;
                }
            }
            // Winkel-Differenz zwischen Spill und Tal-Richtung; muss < 60° sein
            let angDiff = Math.abs(minAng - dirToTalAng);
            while (angDiff > Math.PI) angDiff -= Math.PI * 2;
            angDiff = Math.abs(angDiff);

            return {
                massivLift,
                hCenter,
                hRandMean,
                beckenDip,
                hBC,
                hBRandMean,
                talDip,
                hTal,
                hTalSideMean,
                angDiff: (angDiff * 180) / Math.PI,
                anker: {
                    massivC: mC,
                    massivR: anker.massivR,
                    massivH: anker.massivH,
                    beckenC: bC,
                    beckenR: anker.beckenR,
                    beckenD: anker.beckenD,
                    talBreite: anker.talBreite,
                    talVertN: vts.length,
                },
            };
        });
        if (b.error) {
            check(false, b.error);
        } else {
            console.log(
                `    Massiv: C=(${b.anker.massivC.x.toFixed(0)}, ${b.anker.massivC.z.toFixed(0)}) R=${b.anker.massivR.toFixed(0)} H=${b.anker.massivH.toFixed(0)}`
            );
            console.log(
                `    Becken: C=(${b.anker.beckenC.x.toFixed(0)}, ${b.anker.beckenC.z.toFixed(0)}) R=${b.anker.beckenR.toFixed(0)} D=${b.anker.beckenD.toFixed(0)}`
            );
            console.log(`    Tal: ${b.anker.talVertN} Vertices, halbe Breite ${b.anker.talBreite.toFixed(0)}`);
            console.log(
                `    Massiv-Höhe: Zentrum ${b.hCenter.toFixed(1)} m vs Rand ${b.hRandMean.toFixed(1)} m → Lift ${b.massivLift.toFixed(1)} m`
            );
            console.log(
                `    Becken-Tiefe: Zentrum ${b.hBC.toFixed(1)} m vs Rand ${b.hBRandMean.toFixed(1)} m → Dip ${b.beckenDip.toFixed(1)} m`
            );
            console.log(
                `    Tal-Senke: Mitte ${b.hTal.toFixed(1)} m vs Senkrecht ${b.hTalSideMean.toFixed(1)} m → Dip ${b.talDip.toFixed(1)} m`
            );
            console.log(`    Abfluss-Spill vs Tal-Richtung: Δ=${b.angDiff.toFixed(1)}°`);
            check(b.massivLift > 30, "Massiv hebt das Terrain um ≥ 30 m", `${b.massivLift.toFixed(1)} m`);
            check(b.beckenDip > 5, "Becken senkt das Terrain um ≥ 5 m", `${b.beckenDip.toFixed(1)} m`);
            check(b.talDip > 5, "Tal-Mitte ≥ 5 m unter senkrechtem Boden", `${b.talDip.toFixed(1)} m`);
            check(b.angDiff < 60, "Abfluss-Spill zeigt Richtung Tal-Endpunkt (Δ < 60°)", `${b.angDiff.toFixed(1)}°`);
        }

        // ---- C — LEGACY-TOR: same-position-A/B über genVersion-Schleuse ---
        // Der absolute Lift gen 1 kann hoch sein (cont0/tect-Glück). Der
        // ehrliche Test ist die DIFFERENZ Massiv-Zentrum h(gen3) − h(gen1):
        // sie misst PUR die Welle-Wirkung.
        console.log("\nC — LEGACY-TOR (Same-Position-A/B über genVersion)");
        const c = await page.evaluate(() => {
            const r = window.anazhRealm;
            const anker = r._macroAnker();
            if (!anker) return { error: "kein Anker" };
            const orig = r.state.worldMeta.genVersion;
            const mC = anker.massivC;
            const bC = anker.beckenC;
            // gen 3 (Standard)
            r.state.worldMeta.genVersion = 3;
            r._macroAnkerCache = null;
            const h3M = r._terrainMacroSurfaceY(mC.x, mC.z, false);
            const h3B = r._terrainMacroSurfaceY(bC.x, bC.z, false);
            // gen 1 (Legacy)
            r.state.worldMeta.genVersion = 1;
            r._macroAnkerCache = null;
            const ankerGen1 = r._macroAnker();
            const h1M = r._terrainMacroSurfaceY(mC.x, mC.z, false);
            const h1B = r._terrainMacroSurfaceY(bC.x, bC.z, false);
            r.state.worldMeta.genVersion = orig;
            r._macroAnkerCache = null;
            return {
                ankerGen1Null: ankerGen1 === null,
                dHmassiv: h3M - h1M, // > 0 = Welle HEBT Massiv
                dHbecken: h3B - h1B, // < 0 = Welle SENKT Becken
                h3M,
                h1M,
                h3B,
                h1B,
            };
        });
        if (c.error) {
            check(false, c.error);
        } else {
            console.log(
                `    Massiv-Zentrum: gen3 ${c.h3M.toFixed(1)} m vs gen1 ${c.h1M.toFixed(1)} m → ΔH ${c.dHmassiv.toFixed(1)} m`
            );
            console.log(
                `    Becken-Zentrum: gen3 ${c.h3B.toFixed(1)} m vs gen1 ${c.h1B.toFixed(1)} m → ΔH ${c.dHbecken.toFixed(1)} m`
            );
            check(c.ankerGen1Null, "_macroAnker() returnt NULL bei genVersion 1");
            check(c.dHmassiv > 30, "A/B: Welle HEBT Massiv-Zentrum um > 30 m", `${c.dHmassiv.toFixed(1)} m`);
            check(c.dHbecken < -5, "A/B: Welle SENKT Becken-Zentrum um > 5 m", `${c.dHbecken.toFixed(1)} m`);
        }
        // ---- E — Γ4½ SLOPE + ROCK-EXPOSURE als Felder --------------------
        console.log("\nE — Γ4½ SLOPE-FELD (Vertiefung §3)");
        const e = await page.evaluate(() => {
            const r = window.anazhRealm;
            const anker = r._macroAnker();
            if (!anker) return { error: "kein Anker" };
            // Probe-Punkte: Massiv-Rand (steil) vs Massiv-Zentrum-FERN (flach)
            const mC = anker.massivC;
            const R = anker.massivR;
            // 8 Punkte am Massiv-Rand (mittlerer Hang), 8 Punkte 2×R+200 weg (flach)
            const samp = (n, dist) => {
                const ga = Math.PI * (3 - Math.sqrt(5));
                const out = [];
                for (let i = 0; i < n; i++) {
                    const a = i * ga;
                    const x = mC.x + Math.cos(a) * dist;
                    const z = mC.z + Math.sin(a) * dist;
                    const s = r._slopeAt(x, z);
                    const ex = r._rockExposureAt(x, z);
                    if (Number.isFinite(s)) out.push({ s, ex });
                }
                return out;
            };
            const rand = samp(12, R * 0.85);
            const fern = samp(12, R * 2.5 + 200);
            const mean = (arr, key) => (arr.length ? arr.reduce((a, b) => a + b[key], 0) / arr.length : 0);
            return {
                struct: typeof r._slopeAt === "function" && typeof r._rockExposureAt === "function",
                slopeRand: mean(rand, "s"),
                slopeFern: mean(fern, "s"),
                exposureRand: mean(rand, "ex"),
                exposureFern: mean(fern, "ex"),
            };
        });
        if (e.error) {
            check(false, e.error);
        } else {
            console.log(
                `    Slope: Rand ${e.slopeRand.toFixed(3)} m/m vs Fern ${e.slopeFern.toFixed(3)} m/m (Rand soll deutlich steiler)`
            );
            console.log(
                `    Exposure: Rand ${e.exposureRand.toFixed(3)} vs Fern ${e.exposureFern.toFixed(3)} (Rand soll höher — Massiv-Bias 0.18)`
            );
            check(e.struct, "_slopeAt + _rockExposureAt leben");
            check(e.slopeRand > e.slopeFern, "Slope am Massiv-Rand > Slope fern", `${e.slopeRand.toFixed(3)} > ${e.slopeFern.toFixed(3)}`);
            check(
                e.exposureRand > e.exposureFern + 0.1,
                "Rock-Exposure am Massiv > Exposure fern",
                `${e.exposureRand.toFixed(3)} > ${e.exposureFern.toFixed(3)} (Δ ≥ 0.1)`
            );
        }

        // ---- D — BOOKMARK-SHOTS: Massiv-Vista + Tal/Becken-Vista ----------
        console.log("\nD — BOOKMARK-SHOTS (Schein-Beweis im Browser)");
        try {
            const fs = require("fs");
            if (!fs.existsSync("artifacts")) fs.mkdirSync("artifacts");
            const anker = await page.evaluate(() => {
                const r = window.anazhRealm;
                const a = r._macroAnker();
                if (!a) return null;
                return {
                    massivC: a.massivC,
                    massivR: a.massivR,
                    massivH: a.massivH,
                    beckenC: a.beckenC,
                    beckenR: a.beckenR,
                    talVertices: a.talVertices,
                };
            });
            if (!anker) {
                console.log("  ✗ kein Anker");
            } else {
                const shootShot = async (filename, standX, standZ, yawDeg, pitchDeg) => {
                    await page.evaluate(
                        (cx, cz, yd, pd) => {
                            const ar = window.anazhRealm;
                            if (typeof ar.setTimeOfDay === "function") ar.setTimeOfDay(0.5);
                            if (ar.state.playerBody) {
                                const tr = ar.state.playerBody.getWorldTransform();
                                const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                                tr.getOrigin().setValue(cx, (Number.isFinite(ground) ? ground : 0) + 1.7, cz);
                                ar.state.playerBody.setWorldTransform(tr);
                                try {
                                    if (ar.state.tmpVec1 && typeof ar.setVec === "function") {
                                        ar.state.playerBody.setLinearVelocity(
                                            ar.setVec(ar.state.tmpVec1, 0, 0, 0)
                                        );
                                    }
                                } catch (_e) {}
                                ar.state.playerBody.activate(true);
                            }
                            if (ar.state.player) {
                                ar.state.player.yaw = (yd * Math.PI) / 180;
                                ar.state.player.pitch = (pd * Math.PI) / 180;
                            }
                        },
                        standX,
                        standZ,
                        yawDeg,
                        pitchDeg
                    );
                    // LANGER Settle (Streaming + Build des riesigen Massiv-Footprints)
                    for (let s = 0; s < 18; s++) {
                        await page.evaluate(() => {
                            const ar = window.anazhRealm;
                            for (let i = 0; i < 6; i++)
                                if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                        });
                        await new Promise((r) => setTimeout(r, 80));
                    }
                    await page.screenshot({ path: filename, timeout: 60000 });
                };

                // Massiv-Vista: 600 m vom Massiv-Zentrum weg, Pitch nach oben
                const mC = anker.massivC;
                const massivStandDist = anker.massivR + 350;
                const massivAng = Math.atan2(mC.x, mC.z); // Standpunkt-Richtung
                const standX = mC.x - Math.sin(massivAng) * massivStandDist;
                const standZ = mC.z - Math.cos(massivAng) * massivStandDist;
                const yawMassiv = (Math.atan2(mC.x - standX, mC.z - standZ) * 180) / Math.PI;
                await shootShot(path.resolve("artifacts/makro-massiv-vista.png"), standX, standZ, yawMassiv, 8);
                console.log(`  ✓ Massiv-Vista @ (${standX.toFixed(0)}, ${standZ.toFixed(0)}) → artifacts/makro-massiv-vista.png`);

                // Tal/Becken-Vista: am mittleren Tal-Vertex stehend, Blick zum Becken
                const vts = anker.talVertices;
                const midV = vts[Math.floor(vts.length / 2)];
                const yawTal = (Math.atan2(anker.beckenC.x - midV.x, anker.beckenC.z - midV.z) * 180) / Math.PI;
                await shootShot(path.resolve("artifacts/makro-tal-vista.png"), midV.x, midV.z, yawTal, -8);
                console.log(`  ✓ Tal-Vista @ (${midV.x.toFixed(0)}, ${midV.z.toFixed(0)}) → artifacts/makro-tal-vista.png`);
            }
        } catch (err) {
            console.log("  ✗ Bookmark-Shots fehlgeschlagen: " + err.message);
        }
    } catch (err) {
        console.error("ERROR:", err.message);
        fails++;
    } finally {
        await browser.close();
        server.kill();
    }

    console.log(`\n${fails === 0 ? "✓ Γ4: DIE WELT WIRD KOMPOSITION — Beweis grün" : `✗ ${fails} Fehler`}`);
    process.exit(fails === 0 ? 0 : 1);
})();
