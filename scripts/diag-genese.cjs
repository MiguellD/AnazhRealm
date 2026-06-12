// diag-genese.cjs — Γ-Bogen-Messgerät (genese-plan): vier Messungen am ECHTEN Boot.
//   A  genVersion der frischen Welt (ensureWorldMeta-Stempel → 2)
//   B  KRONEN-Kalibrierung: E[ss(c)], E[ss(−c)], E[gauss] über die Klump-Verteilung
//      → implizite Norm-Faktoren (1/E); B5+-Regel: Mittel-Multiplikator 1 ±10 %
//   C  FEUCHTE-Feld: Fluss-Ufer hoch (≥ schilf-floor) · trocken+hoch = 0 · Legacy = 0
//   D  UFER-LEBEN end-to-end: _buildVoxelChunkScatter am Fluss-Chunk → schilf > 0,
//      am trockenen Chunk → 0; Legacy (genVersion 1) → schilf 0 (minGen-Tor)
//   E  Math.random-ZENSUS in worldgen-erreichbaren Pfaden (Γ5-Verbot)
//   node scripts/diag-genese.cjs

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

        // ---- A: genVersion der frischen Welt --------------------------------
        const a = await page.evaluate(() => {
            const r = window.anazhRealm;
            return { gen: r._genVersion(), meta: (r.state.worldMeta && r.state.worldMeta.genVersion) || null };
        });
        console.log("A — GENESE-VERSION");
        check(a.gen === 2, `frische Welt trägt genVersion 2`, `_genVersion()=${a.gen}, worldMeta=${a.meta}`);

        // ---- B: KRONEN-Kalibrierung -----------------------------------------
        const b = await page.evaluate(() => {
            const r = window.anazhRealm;
            const K = r.constructor.KRONEN;
            const ss = (v) => {
                const t = Math.max(0, Math.min(1, (v - 0.05) / 0.5));
                return t * t * (3 - 2 * t);
            };
            let sU = 0;
            let sL = 0;
            let sR = 0;
            let n = 0;
            // 220×220 @ 7 m = 1540 m Spann ≈ 9 Wellenlängen des λ~167-m-Felds.
            for (let zi = 0; zi < 220; zi++) {
                for (let xi = 0; xi < 220; xi++) {
                    const c = r._clumpAt(-770 + xi * 7, -770 + zi * 7, 0.006);
                    sU += ss(c);
                    sL += ss(-c);
                    sR += Math.exp(-((c / 0.18) * (c / 0.18)));
                    n++;
                }
            }
            return {
                eU: sU / n,
                eL: sL / n,
                eR: sR / n,
                normU: K.unterNorm,
                normL: K.lichtungNorm,
                normR: K.randNorm,
            };
        });
        console.log("B — KRONEN-KALIBRIERUNG (Mittel-Multiplikator soll 1 ±10 %)");
        const mU = b.eU * b.normU;
        const mL = b.eL * b.normL;
        const mR = b.eR * b.normR;
        console.log(
            `    E[unter]=${b.eU.toFixed(4)} → Norm-Soll ${(1 / b.eU).toFixed(2)} (ist ${b.normU}) · Mittel ${mU.toFixed(3)}`
        );
        console.log(
            `    E[licht]=${b.eL.toFixed(4)} → Norm-Soll ${(1 / b.eL).toFixed(2)} (ist ${b.normL}) · Mittel ${mL.toFixed(3)}`
        );
        console.log(
            `    E[rand ]=${b.eR.toFixed(4)} → Norm-Soll ${(1 / b.eR).toFixed(2)} (ist ${b.normR}) · Mittel ${mR.toFixed(3)}`
        );
        check(Math.abs(mU - 1) <= 0.1, "unter mittelwert-neutral");
        check(Math.abs(mL - 1) <= 0.1, "lichtung mittelwert-neutral");
        check(Math.abs(mR - 1) <= 0.1, "rand mittelwert-neutral");

        // ---- C: FEUCHTE-Feld -------------------------------------------------
        const c = await page.evaluate(() => {
            const r = window.anazhRealm;
            const F = r.constructor.FEUCHTE;
            const out = { F };
            const hydro = r.state.hydrosphere;
            const rivers = Array.isArray(hydro.rivers) ? hydro.rivers : [];
            out.rivers = rivers.length;
            // UFER-Punkt: laufe von einem Fluss-Mittelpunkt senkrecht nach außen,
            // bis der Boden über Wasser liegt (die erste Land-Zelle = die Bank).
            let bank = null;
            for (const rv of rivers) {
                const pts = rv.points || [];
                for (let k = 1; k + 1 < pts.length && !bank; k += 2) {
                    const p = pts[k];
                    const q = pts[k + 1];
                    const dx = q.x - p.x;
                    const dz = q.z - p.z;
                    const len = Math.hypot(dx, dz) || 1;
                    const nx = -dz / len;
                    const nz = dx / len;
                    for (const side of [1, -1]) {
                        for (let d = 2; d <= 14 && !bank; d += 1.5) {
                            const x = p.x + nx * d * side;
                            const z = p.z + nz * d * side;
                            const sy = r._voxelSurfaceY(x, z);
                            if (sy === null || !Number.isFinite(sy)) continue;
                            if (sy > r._waterLevelAt(x, z) + 0.15) {
                                const hd = r._hydroDistAt(x, z);
                                if (Number.isFinite(hd.dist) && hd.dist < 20)
                                    bank = { x, z, sy, dist: hd.dist, halfW: hd.halfW };
                            }
                        }
                    }
                }
                if (bank) break;
            }
            out.bank = bank;
            if (bank) out.feuchteBank = r._feuchteAt(bank.x, bank.z, bank.sy);
            // TROCKEN-Punkt: Raster-Scan — Fluss-fern UND hoch überm Spiegel.
            let dry = null;
            for (let zi = -12; zi <= 12 && !dry; zi++) {
                for (let xi = -12; xi <= 12 && !dry; xi++) {
                    const x = xi * 80;
                    const z = zi * 80;
                    const hd = r._hydroDistAt(x, z);
                    if (Number.isFinite(hd.dist) && hd.dist < hd.halfW + F.flussReichweite + 10) continue;
                    const sy = r._voxelSurfaceY(x, z);
                    if (sy === null || !Number.isFinite(sy)) continue;
                    if (sy - r._waterLevelAt(x, z) <= F.hoeheFern + 3) continue;
                    // Infinity überlebt die evaluate-Serialisierung nicht → −1.
                    dry = { x, z, sy, dist: Number.isFinite(hd.dist) ? hd.dist : -1 };
                }
            }
            out.dry = dry;
            if (dry) out.feuchteDry = r._feuchteAt(dry.x, dry.z, dry.sy);
            // LEGACY-Schalter: genVersion 1 → das Feld schweigt; danach zurück.
            if (bank) {
                const orig = r.state.worldMeta.genVersion;
                r.state.worldMeta.genVersion = 1;
                out.feuchteLegacy = r._feuchteAt(bank.x, bank.z, bank.sy);
                r.state.worldMeta.genVersion = orig;
            }
            return out;
        });
        console.log(`C — FEUCHTE-FELD (${c.rivers} Flüsse)`);
        check(
            !!c.bank,
            "Ufer-Punkt gefunden",
            c.bank ? `(${c.bank.x.toFixed(0)},${c.bank.z.toFixed(0)}) dist=${c.bank.dist.toFixed(1)}` : ""
        );
        if (c.bank)
            check(c.feuchteBank >= 0.62, `feuchte am Ufer ≥ schilf-floor 0.62`, `feuchte=${c.feuchteBank.toFixed(3)}`);
        check(!!c.dry, "Trocken-Punkt gefunden", c.dry ? `(${c.dry.x},${c.dry.z}) dist=${c.dry.dist.toFixed(0)}` : "");
        if (c.dry) check(c.feuchteDry === 0, `feuchte trocken+hoch = 0`, `feuchte=${c.feuchteDry}`);
        if (c.bank) check(c.feuchteLegacy === 0, `Legacy (genVersion 1) → feuchte 0`, `=${c.feuchteLegacy}`);

        // ---- D: UFER-LEBEN end-to-end ---------------------------------------
        const d = await page.evaluate(() => {
            const r = window.anazhRealm;
            const span = r._voxelChunkConfig().span;
            const hydro = r.state.hydrosphere;
            const rivers = Array.isArray(hydro.rivers) ? hydro.rivers : [];
            // Kandidaten-Chunks: alle Chunks, die Fluss-Punkte tragen; bewerte
            // jeden über sein 8×8-Streu-Raster — zähle Zellen mit Land + feuchte
            // ≥ schilf-floor (exakt das, was der Streu-Pass sieht).
            const cand = new Map();
            for (const rv of rivers)
                for (const p of rv.points || []) cand.set(`${Math.floor(p.x / span)},${Math.floor(p.z / span)}`, true);
            const scoreChunk = (cx, cz) => {
                let n = 0;
                const step = span / 8;
                for (let zi = 0; zi < 8; zi++)
                    for (let xi = 0; xi < 8; xi++) {
                        const bx = cx * span + (xi + 0.5) * step;
                        const bz = cz * span + (zi + 0.5) * step;
                        const sy = r._voxelSurfaceY(bx, bz);
                        if (sy === null || !Number.isFinite(sy)) continue;
                        if (sy < r._waterLevelAt(bx, bz) + 0.1) continue;
                        if (r._feuchteAt(bx, bz, sy) >= 0.62) n++;
                    }
                return n;
            };
            let best = null;
            for (const key of cand.keys()) {
                const [cx, cz] = key.split(",").map(Number);
                const s = scoreChunk(cx, cz);
                if (!best || s > best.s) best = { cx, cz, s };
            }
            const out = { best };
            if (!best || best.s === 0) return out;
            const countOf = (key, name) => {
                const list = r.state.voxelChunkScatter && r.state.voxelChunkScatter.get(key);
                if (!list) return 0;
                const it = list.find((e) => e.name === name);
                return it && it.mesh ? it.mesh.count : 0;
            };
            const build = (cx, cz) => {
                const key = `${cx},${cz}`;
                r._disposeVoxelChunkScatter(key);
                const lpc = r.state.lastPlayerVoxelChunk;
                r.state.lastPlayerVoxelChunk = { cx, cz };
                r._buildVoxelChunkScatter(cx, cz);
                r.state.lastPlayerVoxelChunk = lpc;
                return key;
            };
            // Genese 2 am Fluss-Chunk:
            const keyR = build(best.cx, best.cz);
            out.schilfFluss = countOf(keyR, "schilf");
            out.farnFluss = countOf(keyR, "farn");
            // Trockener Chunk (aus C wiederverwendet — Raster-Scan):
            const F = r.constructor.FEUCHTE;
            let dry = null;
            for (let zi = -12; zi <= 12 && !dry; zi++)
                for (let xi = -12; xi <= 12 && !dry; xi++) {
                    const x = xi * 80;
                    const z = zi * 80;
                    const hd = r._hydroDistAt(x, z);
                    if (Number.isFinite(hd.dist) && hd.dist < hd.halfW + F.flussReichweite + 10) continue;
                    const sy = r._voxelSurfaceY(x, z);
                    if (sy === null || !Number.isFinite(sy)) continue;
                    if (sy - r._waterLevelAt(x, z) <= F.hoeheFern + 3) continue;
                    dry = { cx: Math.floor(x / span), cz: Math.floor(z / span) };
                }
            if (dry) {
                const keyD = build(dry.cx, dry.cz);
                out.schilfTrocken = countOf(keyD, "schilf");
                r._disposeVoxelChunkScatter(keyD);
            }
            // LEGACY am selben Fluss-Chunk: minGen-Tor → schilf 0.
            const orig = r.state.worldMeta.genVersion;
            r.state.worldMeta.genVersion = 1;
            build(best.cx, best.cz);
            out.schilfLegacy = countOf(keyR, "schilf");
            out.farnLegacy = countOf(keyR, "farn");
            r.state.worldMeta.genVersion = orig;
            r._disposeVoxelChunkScatter(keyR);
            return out;
        });
        console.log("D — UFER-LEBEN end-to-end");
        check(
            !!d.best && d.best.s > 0,
            "Fluss-Chunk mit Ufer-Band-Zellen gefunden",
            d.best ? `chunk(${d.best.cx},${d.best.cz}) bankCells=${d.best.s}` : ""
        );
        if (d.best && d.best.s > 0) {
            check(d.schilfFluss > 0, `schilf wächst am Ufer`, `n=${d.schilfFluss} (farn=${d.farnFluss})`);
            if (Number.isFinite(d.schilfTrocken))
                check(d.schilfTrocken === 0, `schilf bleibt der Trocknis fern`, `n=${d.schilfTrocken}`);
            check(d.schilfLegacy === 0, `Legacy-Welt: schilf ruht (minGen-Tor)`, `n=${d.schilfLegacy}`);
        }

        // ---- E: Math.random-Zensus (Γ5) -------------------------------------
        const e = await page.evaluate(() => {
            const r = window.anazhRealm;
            const fns = [
                "_vegetationSampleSpawn",
                "_buildVoxelChunkScatter",
                "_buildDekoFernfeldSpecies",
                "_kronenMult",
                "_feuchteAt",
                "_hydroDistAt",
                "worldFieldAt",
                "_clumpAt",
                "_terrainBaseDensityAt",
                "_computeHydrosphere",
                "_computeErosion",
                "spawnAffinityForBlueprint",
            ];
            const hits = [];
            for (const fn of fns) {
                const f = r[fn];
                if (typeof f !== "function") {
                    hits.push(fn + ":FEHLT");
                    continue;
                }
                // Kommentare strippen — die Γ5-Verbots-KOMMENTARE dürfen das
                // Wort tragen, der CODE nicht.
                const src = f.toString().replace(/\/\/[^\n]*/g, "");
                if (/Math\.random/.test(src)) hits.push(fn);
            }
            return hits;
        });
        console.log("E — Math.random-ZENSUS (worldgen)");
        check(e.length === 0, "kein Math.random in worldgen-Pfaden", e.length ? e.join(", ") : "12 Fn sauber");

        console.log(fails === 0 ? "\nDIAG-GENESE: alles grün" : `\nDIAG-GENESE: ${fails} ROT`);
        process.exitCode = fails === 0 ? 0 : 1;
    } catch (err) {
        console.error("DIAG-FEHLER:", err.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
