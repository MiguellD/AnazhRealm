#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wasser-wahrheit.cjs — DIE WASSER-WAHRHEITS-LINSE (npm run gate:wasser-wahrheit)
//
// V18.475 — die stehende Linse der drei Schöpfer-Browser-Symptome vom 14.07.
// (Wasser-Forensik) + der Stau-Qualifikation (F4, Schöpfer-Entscheid):
//   F1 „Wasser kriecht Wände hoch": der wet-only Box-Blur der Zell-Dächer
//      (`_computeWaterSheetData` tops + `_smoothWetAttr`) mittelte Plateau- und
//      Tal-Dächer über die Klippe → +10 m hochgezogene Dächer, VERT_SPLIT formte
//      Phantom-Wasserfälle. Fix: HÖHEN-GATE |top_nb − top_roh| ≤ K·step (K=2).
//   F2 „spiegelnder Filter über Terrain": `_ensureFarWaterSheet` fragte
//      `_atlasWaterLevelAt` mit terrainTopY=−Infinity → der Rim-Pfad war
//      BEDINGUNGSLOS wahr → Land neben Wasser zählte nass. Fix: Rim nur bei
//      Number.isFinite(terrainTopY); der River-Override zählt bei −Inf nur den
//      Kanal-KERN (centerness > 0), nie die Bank-Rampe.
//   F3 „Blobs, die bleiben": der KEEP-Fixpunkt (EPS_FLOW) fror abgeklungene
//      Live-Zungen bei Level 0.5–0.9 ewig ein. Fix: `_caEvaporateSettled` —
//      settled Zungen über trockenem Grund verdunsten auf 0; Quell-Spalten nie.
//   F4 Stau-Qualifikation: ein Architektur-AABB dämmt NUR geerdet+geschlossen
//      (beide Achsen ≥ 1 Zelle, Basis ≤ 1 Zelle überm Terrain) — Pfosten/dünne
//      Wände/Schwebendes stauen nicht; echte Dämme stauen weiter.
//   F5 „Weißes Treppen-Band am Ufer" (K37, Auge 13.10., Solitär-Eiche): jede
//      Werk-Setzung am Ufer weckt den Automaten; seine Kappe lag eine Zeile
//      über der Flut-Ruhe, die Deck-Zelle floss ab, die flache Ufer-Spalte
//      leerte sich. Fix: die Kappe ist die oberste Flut-Zelle
//      (`_ensureWaterCALevel`), Raum nimmt nur ein Schnitt — Ruhe bleibt Ruhe.
//   F6 „Grube im See": eine vom Automaten geleerte Flut-Spalte zeichnete das
//      Sheet 14 m unter dem Spiegel (die Klemme des Live-Deltas). Fix: die
//      geleerte Spalte ist trocken (`_computeWaterSheetData`, Worker-Spiegel).
//   F7 „Der See verschwindet für die Welt" (K37, Damm im Tal 26/−120): das
//      Netz des gezeichneten Wassers (`_wasserNetz`, Leser `_nassAt`) hielt
//      einen View in den Puffer des Wasser-Satzes; das Verdichten schob fremde
//      Bytes darunter. Fix: das Netz kopiert seine Positionen.
//
// Jede Fixture ist PURE (synthetische Arrays / direkte Funktions-Fragen) und
// trägt ihren SELBST-TEST: der Fix wird per Quell-Patch künstlich deaktiviert
// (new Function auf der echten Quelle) — die Fixture MUSS dann rot sehen.
// Exit 1 bei jedem Fail; alle Zahlen explizit.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.WASSER_WAHRHEIT_PORT || 4406);
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function",
            { timeout: 120000 }
        );
        // kurzer Warm-Pump: Hydrosphäre bereit (Fixture 2 liest die echte Region).
        await page.waitForFunction(
            () => window.anazhRealm.state.hydrosphere && window.anazhRealm.state.hydrosphere.ready,
            { timeout: 120000 }
        );
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const AR = r.constructor;
            const o = { fails: [] };
            const fail = (msg) => o.fails.push(msg);
            // Quell-Patch-Helfer: Methoden-Shorthand → Funktion, mit AnazhRealm im Scope.
            const patchFn = (fn, name, from, to) => {
                const src = String(fn);
                if (!src.includes(from)) return null; // Marker weg → Patch unmöglich (selbst ein Fail)
                const patched = src.replace(from, to);
                return new Function("AnazhRealm", `return ({ ${patched} }).${name};`)(AR);
            };

            // ── FIXTURE 1 (F1) — DIE KLIPPE: kein geglättetes Dach > Flut-Dach + K·step ──
            const cfg0 = r._voxelChunkConfig(0);
            const dim = cfg0.dim, // 24
                dimY = cfg0.dimY, // 232
                step = cfg0.step; // 1.8
            const K = 2;
            const runCliff = (computeFn) => {
                const SOLID = AR.CELL_STATE.SOLID;
                const WATER = AR.CELL_STATE.WATER;
                const cells = new Uint8Array(dim * dim * dimY);
                const dimSq = dim * dim;
                // Plateau (i ≤ 11): SOLID ≤ 39, WATER @40 (Lauf). Tal (i ≥ 12): SOLID ≤ 7,
                // WATER @8..9 (Pool). Direkt benachbart = die 56-m-Klippe der Forensik.
                for (let k = 0; k < dim; k++) {
                    for (let i = 0; i < dim; i++) {
                        const c = i + k * dim;
                        const jSolid = i <= 11 ? 39 : 7;
                        for (let j = 0; j <= jSolid; j++) cells[c + j * dimSq] = SOLID;
                        if (i <= 11) cells[c + 40 * dimSq] = WATER;
                        else {
                            cells[c + 8 * dimSq] = WATER;
                            cells[c + 9 * dimSq] = WATER;
                        }
                    }
                }
                const shim = Object.create(r);
                shim.state = { terrainBaseHeight: 0, waterLevel: 0 };
                shim._atlasWaterLevelAt = () => -Infinity; // top = faceY exakt (pur)
                shim._hydroRiverAt = () => null;
                shim._hydrosphereLakeAt = () => false;
                const ctx = {
                    smoothPasses: 4,
                    getCells: (ncx, ncz) => (ncx === 0 && ncz === 0 ? cells : null),
                    getDach: () => undefined,
                };
                const data = computeFn.call(shim, 0, 0, ctx);
                if (!data) return { built: false };
                const oy = 0 - cfg0.floorDrop;
                const valleyFace = oy + 10 * step; // Flut-Dach des Tals (floodTopJ=9 → +10·step)
                let maxYInterior = -Infinity;
                let curtainVerts = 0;
                const pos = data.positions;
                const aSlope = data.aSlope;
                for (let v = 0; v < pos.length / 3; v++) {
                    const ix = Math.round(pos[v * 3] / step); // Jitter < step/2 → round sicher
                    const y = pos[v * 3 + 1];
                    if (ix >= 14 && y > maxYInterior) maxYInterior = y;
                    if (aSlope[v] === 4) curtainVerts++;
                }
                return { built: true, valleyFace, maxYInterior, rise: maxYInterior - valleyFace, curtainVerts };
            };
            const cliff = runCliff(r._computeWaterSheetData);
            o.cliff = cliff;
            if (!cliff.built) fail("F1: Klippen-Fixture baute kein Sheet");
            else {
                if (!(cliff.rise <= K * step + 1e-6))
                    fail(
                        `F1: geglättetes Tal-Dach kletterte die Wand hoch (rise=${cliff.rise.toFixed(2)} m > ${K * step} m)`
                    );
                if (!(cliff.curtainVerts > 0))
                    fail("F1: kein Lippe+Vorhang an der Klippe (der ECHTE Wasserfall muss weiterleben)");
            }
            // Selbst-Test F1: Gate deaktiviert (BLUR_GATE → riesig) → Phantom muss messbar sein.
            const brokenSheet = patchFn(
                r._computeWaterSheetData,
                "_computeWaterSheetData",
                "const BLUR_GATE = step * 2;",
                "const BLUR_GATE = step * 1e9;"
            );
            if (!brokenSheet) fail("F1-Selbsttest: BLUR_GATE-Marker nicht in der Quelle (Fix fehlt?)");
            else {
                const b = runCliff(brokenSheet);
                o.cliffBroken = b;
                if (!(b.built && b.rise > K * step))
                    fail(`F1-Selbsttest: deaktiviertes Gate blieb grün (rise=${b.built ? b.rise.toFixed(2) : "?"} m)`);
            }

            // ── FIXTURE 2 (F2) — DIE RIM-WAND: −Inf liefert an Land neben Wasser KEIN Wasser ──
            // Echte Region: eine atlas-LAND-Spalte mit Wasser-Körper im 3×3, ohne Fluss. Seit K16 sind die Seen die
            // benannten Senken des Flussnetzes (selten): die Heimat-Kachel trägt nicht immer ein Ufer — gesucht wird in den
            // Kacheln bis zum zweiten Ring, die nahen zuerst (wie Klang-Zensus und `__wasserOrt`).
            let shore = null;
            const kachel = AR.HYDROSPHERE.regionSize;
            const ringe = [];
            for (let rx = -2; rx <= 2; rx++) for (let rz = -2; rz <= 2; rz++) ringe.push([rx, rz]);
            ringe.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
            const gesehen = new Set();
            for (const [rx, rz] of ringe) {
                if (shore) break;
                r._ensureHydroTilesAround(rx * kachel, rz * kachel, 0);
                const h = r._hydroFor(rx * kachel, rz * kachel);
                if (!h || gesehen.has(h)) continue;
                gesehen.add(h);
                if (h && h.ready && h.water && h.water.waterKind) {
                    const wK = h.water.waterKind;
                    const wY = h.water.waterY;
                    const hd = h.dim;
                    outer: for (let cj = 1; cj < hd - 1; cj++) {
                        for (let ci = 1; ci < hd - 1; ci++) {
                            const here = wK[ci + cj * hd];
                            if (here === 1 || here === 2) continue;
                            let rim = -Infinity;
                            for (let dj = -1; dj <= 1; dj++)
                                for (let di = -1; di <= 1; di++) {
                                    const nk = wK[ci + di + (cj + dj) * hd];
                                    if ((nk === 1 || nk === 2) && wY[ci + di + (cj + dj) * hd] > rim)
                                        rim = wY[ci + di + (cj + dj) * hd];
                                }
                            if (!(rim > -Infinity)) continue;
                            const px = h.originX + (ci + 0.5) * h.cell;
                            const pz = h.originZ + (cj + 0.5) * h.cell;
                            if (r._hydroRiverAt(px, pz)) continue; // Rim-Pfad isolieren
                            shore = { px, pz, rim };
                            break outer;
                        }
                    }
                }
            }
            o.shore = shore;
            if (!shore) fail("F2: keine Rim-Ufer-Spalte in den Kacheln bis Ring 2 gefunden (Welt ohne Ufer?)");
            else {
                const lInf = r._atlasWaterLevelAt(shore.px, shore.pz, -Infinity);
                const lUnder = r._atlasWaterLevelAt(shore.px, shore.pz, shore.rim - 5);
                const lOver = r._atlasWaterLevelAt(shore.px, shore.pz, shore.rim + 5);
                o.shoreLevels = { lInf, lUnder, lOver, rim: shore.rim };
                if (lInf !== -Infinity) fail(`F2: terrainTopY=−Inf liefert Wasser an Land-Spalte (L=${lInf})`);
                if (lUnder !== shore.rim)
                    fail(
                        `F2: endliches topY UNTER rim verlor die Rim-Füllung (L=${lUnder}, rim=${shore.rim}) — echte Ufer müssen bleiben!`
                    );
                if (lOver !== -Infinity) fail(`F2: topY ÜBER rim wurde nass (L=${lOver})`);
            }
            // Fluss-Wand: Bank-Punkt (centerness=0, kein Körper im 3×3) vs Kern-Punkt.
            let bank = null;
            let core = null;
            {
                const h = r._hydroFor(0, 0);
                if (h && h.ready && h.water && h.water.waterKind) {
                    const wK = h.water.waterKind;
                    const hd = h.dim;
                    const bodyNear = (x, z) => {
                        const ci = Math.floor((x - h.originX) / h.cell);
                        const cj = Math.floor((z - h.originZ) / h.cell);
                        for (let dj = -1; dj <= 1; dj++)
                            for (let di = -1; di <= 1; di++) {
                                const ni = ci + di,
                                    nj = cj + dj;
                                if (ni < 0 || nj < 0 || ni >= hd || nj >= hd) continue;
                                const nk = wK[ni + nj * hd];
                                if (nk === 1 || nk === 2) return true;
                            }
                        return false;
                    };
                    const sz = h.dim * h.cell;
                    for (let z = h.originZ + 8; z < h.originZ + sz && !(bank && core); z += 8) {
                        for (let x = h.originX + 8; x < h.originX + sz && !(bank && core); x += 8) {
                            const rv = r._hydroRiverAt(x, z);
                            if (!rv || bodyNear(x, z)) continue;
                            if (!core && rv.centerness > 0.3) core = { x, z, s: rv.surfaceY };
                            if (!bank && rv.centerness === 0) bank = { x, z, s: rv.surfaceY };
                        }
                    }
                }
            }
            o.bank = bank;
            o.core = core;
            if (bank) {
                const lb = r._atlasWaterLevelAt(bank.x, bank.z, -Infinity);
                const le = r._atlasWaterLevelAt(bank.x, bank.z, Infinity);
                o.bankLevels = { lb, le };
                if (lb !== -Infinity) fail(`F2: Fluss-BANK zählt bei −Inf nass (L=${lb}) — die Rampe ist kein Kern`);
                if (!(le > -Infinity))
                    fail("F2: +Inf-Existenz-Probe verlor die volle Carve-Breite (colSrc/CA-Quellen!)");
            }
            if (core) {
                const lc = r._atlasWaterLevelAt(core.x, core.z, -Infinity);
                o.coreLevel = lc;
                if (!(lc > -Infinity)) fail("F2: Fluss-KERN verlor sein Fern-Wasser (centerness>0 muss zählen)");
            }
            if (!bank && !core)
                o.riverNote = "kein isolierter Fluss-Punkt gefunden — Fluss-Wand unmessbar (Rim-Kern grün)";
            // Selbst-Test F2: isFinite-Wand entfernt → Land-Spalte MUSS wieder nass werden.
            if (shore) {
                const brokenAtlas = patchFn(
                    r._atlasWaterLevelAt,
                    "_atlasWaterLevelAt",
                    "if (Number.isFinite(terrainTopY) && rim > -Infinity && terrainTopY < rim) {",
                    "if (rim > -Infinity && terrainTopY < rim) {"
                );
                if (!brokenAtlas) fail("F2-Selbsttest: isFinite-Marker nicht in der Quelle (Fix fehlt?)");
                else {
                    const lBroken = brokenAtlas.call(r, shore.px, shore.pz, -Infinity);
                    o.shoreBroken = lBroken;
                    if (lBroken !== shore.rim)
                        fail(
                            `F2-Selbsttest: deaktivierte Wand blieb trocken (L=${lBroken}, erwartet rim=${shore.rim})`
                        );
                }
            }

            // ── FIXTURE 3 (F3) — DIE VERDUNSTUNG: settled Zunge fällt, Quell-Zelle bleibt ──
            const runEvap = (evapFn, ticks) => {
                const SOLID = AR.CELL_STATE.SOLID;
                const WATER = AR.CELL_STATE.WATER;
                const d = 8,
                    dy = 16,
                    dSq = d * d;
                const cells = new Uint8Array(dSq * dy);
                for (let c = 0; c < dSq; c++) cells[c] = SOLID; // Boden j=0
                const src = new Uint8Array(dSq);
                cells[10 + 1 * dSq] = WATER; // Quell-Spalte: Flood-Wasser
                src[10] = 1;
                const level = new Float64Array(dSq * dy);
                level[10 + 1 * dSq] = 1.0;
                level[30 + 1 * dSq] = 0.6; // die abgeklungene Zunge: AIR-Zelle über trockenem Grund
                const band = { jMin: 0, jMax: 3 };
                const at = [];
                for (let t = 0; t < ticks; t++) {
                    evapFn.call(r, level, cells, src, d, dy, band);
                    at.push(level[30 + 1 * dSq]);
                }
                return { tongue: level[30 + 1 * dSq], src: level[10 + 1 * dSq], at10: at[9] };
            };
            const RENDER = 0.5; // die Render-Schwelle (`_caColumnScan`: level > 0.5)
            const RATE = AR.CA_EVAP ? AR.CA_EVAP.RATE : NaN;
            const N3 = Math.ceil((0.6 - RENDER) / RATE) + 1; // Ticks bis unter die Schwelle
            const evapOk = typeof r._caEvaporateSettled === "function";
            if (!evapOk) fail("F3: _caEvaporateSettled existiert nicht");
            else {
                const e1 = runEvap(r._caEvaporateSettled, N3);
                const e2 = runEvap(r._caEvaporateSettled, 120);
                o.evap = { N3, afterN: e1.tongue, srcAfterN: e1.src, after120: e2.tongue, srcAfter120: e2.src };
                if (!(e1.tongue < RENDER))
                    fail(
                        `F3: Zunge nach ${N3} Ticks nicht unter der Render-Schwelle (${e1.tongue.toFixed(3)} ≥ ${RENDER})`
                    );
                if (e2.tongue !== 0) fail(`F3: Zunge verdunstete nicht auf 0 (${e2.tongue})`);
                if (e1.src !== 1 || e2.src !== 1)
                    fail(`F3: QUELL-Zelle verdunstete (${e2.src} ≠ 1) — der Pin-Vertrag!`);
                // KONSUM (Lehre 5): der Welt-Tick ruft den Chokepoint + hält Verdunster aktiv.
                const wt = String(r._tickWorldWaterCA);
                o.evapWired = /_caEvaporateSettled/.test(wt) && /_caStillTicks/.test(wt) && /a\.evap > 0/.test(wt);
                if (!o.evapWired)
                    fail(
                        "F3: _tickWorldWaterCA konsumiert die Verdunstung nicht (Chokepoint/Ruhe-Zählung/Settle-Wächter)"
                    );
                // Selbst-Test F3: RATE genullt → Zunge MUSS stehenbleiben.
                const brokenEvap = patchFn(
                    r._caEvaporateSettled,
                    "_caEvaporateSettled",
                    "const nv = lv - CFG.RATE;",
                    "const nv = lv - CFG.RATE * 0;"
                );
                if (!brokenEvap) fail("F3-Selbsttest: RATE-Marker nicht in der Quelle (Fix fehlt?)");
                else {
                    const b = runEvap(brokenEvap, 120);
                    o.evapBroken = b.tongue;
                    if (b.tongue !== 0.6)
                        fail(`F3-Selbsttest: deaktivierte Verdunstung bewegte die Zunge (${b.tongue})`);
                }
            }

            // ── FIXTURE 4 (F4) — DIE STAU-QUALIFIKATION: geerdet + geschlossen ──
            const runStau = (clusterFn) => {
                const shim = Object.create(r);
                shim.state = {
                    worldMeta: { voxelEdits: [] },
                    architectures: [
                        // (a) Pfosten: geerdet, aber 0.4 m dünn → staut NICHT
                        { blockerAABBs: [{ minX: 0, maxX: 0.4, minZ: 0, maxZ: 0.4, topY: 12, botY: 10 }] },
                        // (b) geerdeter, geschlossener Damm (4×2 m, Basis 10.5 ≤ Terrain 10 + 1.8) → staut
                        { blockerAABBs: [{ minX: 40, maxX: 44, minZ: 40, maxZ: 42, topY: 14, botY: 10.5 }] },
                        // (c) schwebendes AABB (Basis 14 > Terrain 10 + 1.8) → staut NICHT
                        { blockerAABBs: [{ minX: 80, maxX: 84, minZ: 80, maxZ: 84, topY: 18, botY: 14 }] },
                    ],
                };
                shim._stauClusterCache = null; // NIE den echten Cache des Realms lesen
                shim._terrainMacroSurfaceY = () => 10;
                shim._atlasWaterLevelAt = () => -Infinity; // fern jedes Wassers → Krone-Check neutral
                return clusterFn.call(shim);
            };
            const clusters = runStau(r._stauWorkClusters);
            o.stauClusters = clusters.map((c) => ({ minX: c.minX, maxX: c.maxX, topY: c.topY }));
            const damOnly =
                clusters.length === 1 &&
                Math.abs(clusters[0].minX - 40) < 1e-6 &&
                Math.abs(clusters[0].maxX - 44) < 1e-6 &&
                Math.abs(clusters[0].topY - 14) < 1e-6;
            if (!damOnly)
                fail(
                    `F4: Stau-Qualifikation falsch — erwartet NUR der geerdete geschlossene Damm, bekam ${clusters.length} Werk(e): ${JSON.stringify(o.stauClusters)}`
                );
            // Selbst-Test F4: Qualifikation deaktiviert → Pfosten + Schweber werden Werke (3 Cluster).
            {
                const src = String(r._stauWorkClusters);
                const m1 = "if (Math.min(a.maxX - a.minX, a.maxZ - a.minZ) < CELL) continue;";
                const m2 = "if (Number.isFinite(terrY) && Number.isFinite(a.botY) && a.botY > terrY + CELL) continue;";
                if (!src.includes(m1) || !src.includes(m2)) {
                    fail("F4-Selbsttest: Qualifikations-Marker nicht in der Quelle (Fix fehlt?)");
                } else {
                    const patched = src.replace(m1, "if (false) continue;").replace(m2, "if (false) continue;");
                    const fullyBroken = new Function("AnazhRealm", `return ({ ${patched} })._stauWorkClusters;`)(AR);
                    const bc = runStau(fullyBroken);
                    o.stauBroken = bc.length;
                    if (bc.length !== 3)
                        fail(`F4-Selbsttest: deaktivierte Qualifikation ergab ${bc.length} statt 3 Werke`);
                }
            }

            // ── FIXTURE 5 (F5) — DIE RUHE IST DER FIXPUNKT: der erwachte Automat bewegt ruhendes Wasser nicht ──
            // K37 (Auge 13.10., Solitär-Eiche): jede Werk-Setzung am Ufer weckt den Automaten; die Kappe lag eine Zeile über
            // der Ruhe, die Deck-Zelle (4b) floss in die Zeile über dem See und aufs Land, die flache Ufer-Spalte leerte sich.
            // Bühne: See (i ≤ 3, Flut j 4..6, Quelle), Deck-Spalte (i = 4, Boden j ≤ 6, Deck-Zelle j 7), Land (i ≥ 5, Boden
            // j ≤ 6). Gezählt: Spalten, deren Live-Dach nach 200 Takten vom Flut-Dach abweicht (> 0,6 Zelle oder leer/fremd).
            const runRuhe = (capFn) => {
                const SOLID = AR.CELL_STATE.SOLID;
                const WATER = AR.CELL_STATE.WATER;
                const d = 8,
                    dy = 16,
                    dSq = d * d,
                    st5 = 1.8;
                const cells = new Uint8Array(dSq * dy);
                const L5 = 7 * st5 + 0.2; // Mitte j 6 (11,7) ≤ L < Mitte j 7 (13,5): Flut-Dach j 6
                for (let k = 0; k < d; k++)
                    for (let i = 0; i < d; i++) {
                        const c = i + k * d;
                        const boden = i <= 3 ? 3 : 6;
                        for (let j = 0; j <= boden; j++) cells[c + j * dSq] = SOLID;
                        if (i <= 3) for (let j = 4; j <= 6; j++) cells[c + j * dSq] = WATER;
                        if (i === 4) cells[c + 7 * dSq] = WATER; // die Deck-Zelle
                    }
                const shim = Object.create(r);
                shim.state = { voxelChunks: new Map([["0,0", { waterCells: cells }]]), terrainBaseHeight: 0 };
                shim._voxelChunkConfig = () => ({ dim: d, dimY: dy, step: st5, span: d * st5, floorDrop: 0 });
                shim._atlasWaterLevelAt = (x, z, t) => {
                    if (x < 4 * st5) return L5; // See: Quelle
                    if (x < 5 * st5) return Number.isFinite(t) && t < L5 ? L5 : -Infinity; // Rand über flachem Grund
                    return -Infinity;
                };
                shim._stauFieldsNear = () => null;
                shim._chunkRegionHasCarve = () => false;
                const level = capFn.call(shim, 0, 0);
                const cap = shim.state.waterCapJ.get("0,0");
                const src = shim.state.waterSourceCols.get("0,0");
                for (let t = 0; t < 200; t++) {
                    for (let c = 0; c < dSq; c++)
                        if (src[c])
                            for (let j = 0; j < dy; j++) if (cells[c + j * dSq] === WATER) level[c + j * dSq] = 1;
                    r._tickWaterCA(level, cells, d, dy, 0.25, null, null, cap);
                }
                let gerissen = 0;
                for (let c = 0; c < dSq; c++) {
                    const sc = r._caColumnScan(cells, level, c, dSq, dy);
                    const fl = sc.floodTopJ >= 0 ? sc.floodTopJ + 1 : -1;
                    const li = sc.liveTopJ >= 0 ? sc.liveTopJ + sc.liveFrac : -1;
                    if (fl < 0 && li < 0) continue;
                    if (fl < 0 || li < 0 || Math.abs(li - fl) > 0.6) gerissen++;
                }
                return { gerissen, capDeck: cap[4], capSee: cap[0], capLand: cap[5] };
            };
            if (typeof r._ensureWaterCALevel !== "function") fail("F5: _ensureWaterCALevel existiert nicht");
            else {
                const f5 = runRuhe(r._ensureWaterCALevel);
                o.ruhe = f5;
                if (f5.gerissen !== 0) fail(`F5: der erwachte Automat riss ${f5.gerissen} ruhende Spalte(n) (Soll 0)`);
                // KONSUM: der Welt-Tick liest die Kappe dieses Chokepoints (`_ensureWaterCALevel` → `waterCapJ`).
                if (
                    !/_ensureWaterCALevel/.test(String(r._tickWorldWaterCA)) ||
                    !/waterCapJ/.test(String(r._tickWorldWaterCA))
                )
                    fail("F5: _tickWorldWaterCA liest die Kappe des Chokepoints nicht");
                // Selbst-Test F5: die Kappe der Ruhe fällt (die Zeile über dem Spiegel) → die Deck-Spalte MUSS reißen.
                const broken5 = patchFn(
                    r._ensureWaterCALevel,
                    "_ensureWaterCALevel",
                    "cap[c] = flutJ >= 0 ? flutJ : raumOffen ? capRaum : -1;",
                    "cap[c] = capRaum;"
                );
                if (!broken5) fail("F5-Selbsttest: Ruhe-Marker nicht in der Quelle (Fix fehlt?)");
                else {
                    const b5 = runRuhe(broken5);
                    o.ruheBroken = b5.gerissen;
                    if (!(b5.gerissen > 0)) fail("F5-Selbsttest: die alte Kappe ließ die Ruhe stehen (Linse blind)");
                }
            }

            // ── FIXTURE 6 (F6) — DIE GELEERTE SPALTE IST TROCKEN: nie ein Dach 14 m unter dem Spiegel ──
            // Ein See (Flut-Dach j 40) mit Live-Dach überall gleich, nur EINE Spalte hat der Automat geleert (−1). Bis K37
            // zeichnete das Sheet sie 14 m unter dem Spiegel (die Klemme des Live-Deltas) — eine Grube mit weißen Wänden.
            const runLeer = (computeFn) => {
                const WATER = AR.CELL_STATE.WATER;
                const SOLID = AR.CELL_STATE.SOLID;
                const dimSq = dim * dim;
                const cells = new Uint8Array(dimSq * dimY);
                for (let c = 0; c < dimSq; c++) {
                    for (let j = 0; j <= 30; j++) cells[c + j * dimSq] = SOLID;
                    for (let j = 31; j <= 40; j++) cells[c + j * dimSq] = WATER;
                }
                const dach = new Float64Array(dimSq).fill(41);
                dach[12 + 12 * dim] = -1; // die geleerte Spalte
                const shim = Object.create(r);
                shim.state = { terrainBaseHeight: 0, waterLevel: 0 };
                shim._atlasWaterLevelAt = () => -Infinity;
                shim._hydroRiverAt = () => null;
                shim._hydrosphereLakeAt = () => false;
                const ctx = {
                    smoothPasses: 4,
                    getCells: (ncx, ncz) => (ncx === 0 && ncz === 0 ? cells : null),
                    getDach: (ncx, ncz) => (ncx === 0 && ncz === 0 ? dach : undefined),
                };
                const data = computeFn.call(shim, 0, 0, ctx);
                const faceY = 0 - cfg0.floorDrop + 41 * step;
                let minY = Infinity;
                const pos = data ? data.positions : [];
                // nur das Innere (der Rand des Sheets taucht als Anker unter, s. F1)
                for (let v = 0; v < pos.length / 3; v++) {
                    const x = pos[v * 3],
                        z = pos[v * 3 + 2];
                    if (x < 4 * step || z < 4 * step || x > (dim - 4) * step || z > (dim - 4) * step) continue;
                    if (pos[v * 3 + 1] < minY) minY = pos[v * 3 + 1];
                }
                return { grube: +(faceY - minY).toFixed(3) };
            };
            {
                const f6 = runLeer(r._computeWaterSheetData);
                o.leer = f6;
                if (!(f6.grube < 0.05))
                    fail(`F6: die geleerte Spalte liegt ${f6.grube} m unter dem Spiegel (Soll trocken, < 0,05)`);
                const broken6 = patchFn(
                    r._computeWaterSheetData,
                    "_computeWaterSheetData",
                    "if (dach && live < 0) continue;",
                    ""
                );
                if (!broken6) fail("F6-Selbsttest: Leer-Marker nicht in der Quelle (Fix fehlt?)");
                else {
                    const b6 = runLeer(broken6);
                    o.leerBroken = b6.grube;
                    if (!(b6.grube > 1))
                        fail(`F6-Selbsttest: ohne die Regel keine Grube (${b6.grube} m) — Linse blind`);
                }
            }

            // ── FIXTURE 7 (F7) — DAS NETZ TRÄGT SEINE BYTES: das gezeichnete Wasser überlebt das Verdichten des Satzes ──
            // Das Sheet eines Chunks ist ein View in den Puffer des Wasser-Satzes; verdichtet sich der Satz, schiebt er die
            // Bereiche im alten Puffer nach vorn (copyWithin) und zeigt neue Views. Ein Netz (`_wasserNetz`), das den alten
            // View hielt, las danach die Bytes eines anderen Bereichs (am Damm im Tal 26/−120: 285–1 309 nasse Punkte weg).
            // Bühne: ein Quad bei y 8 (Bereich 2 eines Satzes), dahinter ein fremder Bereich bei y 2 weit weg; das Netz wird
            // gefragt, der Satz verdichtet (fremd rückt in den alten Bereich, der View zeigt neu), das Netz erneut gefragt.
            const runNetz = (netzFn) => {
                const quad = (x0, z0, y) => [x0, y, z0, x0 + 9, y, z0, x0, y, z0 + 9, x0 + 9, y, z0 + 9];
                const alt = new Float32Array(24);
                alt.set(quad(30, 30, 2), 0); // Bereich 1 (fremd)
                alt.set(quad(1, 1, 8), 12); // Bereich 2 (das Sheet des Chunks 0,0)
                const mesh = {
                    geometry: {
                        attributes: { position: { array: alt.subarray(12, 24) } },
                        index: { array: new Uint32Array([0, 2, 1, 1, 2, 3]) },
                    },
                };
                const entry = { waterCells: new Uint8Array(1) };
                const shim = Object.create(r);
                shim.state = {
                    voxelChunks: new Map([["0,0", entry]]),
                    voxelChunkWaterIso: new Map([["0,0", mesh]]),
                };
                const h0 = AR._wasserNetzHoehe(netzFn.call(shim, 0, 0), 5, 5);
                // das Verdichten: Bereich 2 rückt nach vorn, ein dritter Bereich (fremd, y 2) zieht in seinen alten Platz
                alt.copyWithin(0, 12, 24);
                alt.set(quad(30, 30, 2), 12);
                const neu = new Float32Array(12);
                neu.set(alt.subarray(0, 12));
                mesh.geometry.attributes.position.array = neu.subarray(0, 12);
                const h1 = AR._wasserNetzHoehe(netzFn.call(shim, 0, 0), 5, 5);
                return { h0, h1 };
            };
            if (typeof r._wasserNetz !== "function") fail("F7: _wasserNetz existiert nicht");
            else {
                const f7 = runNetz(r._wasserNetz);
                o.netz = f7;
                if (!(f7.h0 === 8 && f7.h1 === 8))
                    fail(`F7: das gezeichnete Wasser nach dem Verdichten des Satzes ${f7.h1} statt ${f7.h0} (Soll 8)`);
                // KONSUM: `_nassAt` liest das gezeichnete Wasser über `_wasserBildAt` → `_wasserNetz`.
                if (!/_wasserBildAt/.test(String(r._nassAt)) || !/_wasserNetz/.test(String(r._wasserBildAt)))
                    fail("F7: _nassAt liest das Netz nicht (über _wasserBildAt)");
                const broken7 = patchFn(
                    r._wasserNetz,
                    "_wasserNetz",
                    "pos = Float32Array.from(quelle.geometry.attributes.position.array);",
                    "pos = quelle.geometry.attributes.position.array;"
                );
                if (!broken7) fail("F7-Selbsttest: Kopie-Marker nicht in der Quelle (Fix fehlt?)");
                else {
                    const b7 = runNetz(broken7);
                    o.netzBroken = b7.h1;
                    if (b7.h1 === 8)
                        fail("F7-Selbsttest: mit dem gehaltenen View blieb das Netz richtig — Linse blind");
                }
            }
            return o;
        });
    } catch (e) {
        out = { fails: [`Harness: ${e.message}`] };
    } finally {
        await browser.close();
        server.close();
    }
    if (pageErr) out.fails.push(`PAGE-ERROR: ${pageErr}`);
    console.log("── diag-wasser-wahrheit ──");
    console.log(
        `F1 Klippe: rise=${out.cliff ? out.cliff.rise.toFixed(3) : "?"} m (Gate ${(2 * 1.8).toFixed(1)} m), ` +
            `Vorhang-Verts=${out.cliff ? out.cliff.curtainVerts : "?"}; ` +
            `Selbsttest-rise=${out.cliffBroken ? out.cliffBroken.rise.toFixed(2) : "?"} m`
    );
    console.log(
        `F2 Rim: Ufer=${out.shore ? `(${out.shore.px.toFixed(0)},${out.shore.pz.toFixed(0)}) rim=${out.shore.rim.toFixed(2)}` : "—"} ` +
            `L(−Inf)=${out.shoreLevels ? out.shoreLevels.lInf : "?"} L(unter)=${out.shoreLevels ? out.shoreLevels.lUnder : "?"} ` +
            `L(über)=${out.shoreLevels ? out.shoreLevels.lOver : "?"}; Bank=${out.bank ? JSON.stringify(out.bankLevels) : "—"} ` +
            `Kern-L=${out.coreLevel !== undefined ? out.coreLevel : "—"}; Selbsttest-L=${out.shoreBroken !== undefined ? out.shoreBroken : "?"}` +
            (out.riverNote ? ` [${out.riverNote}]` : "")
    );
    console.log(
        `F3 Verdunstung: nach N=${out.evap ? out.evap.N3 : "?"} Ticks=${out.evap ? out.evap.afterN.toFixed(3) : "?"} ` +
            `(< 0.5), nach 120=${out.evap ? out.evap.after120 : "?"}, Quelle=${out.evap ? out.evap.srcAfter120 : "?"}; ` +
            `verdrahtet=${out.evapWired}; Selbsttest-Zunge=${out.evapBroken}`
    );
    console.log(`F4 Stau: Cluster=${JSON.stringify(out.stauClusters)}; Selbsttest-Cluster=${out.stauBroken}`);
    console.log(
        `F5 Ruhe: gerissen=${out.ruhe ? out.ruhe.gerissen : "?"} (Soll 0), Kappen See/Deck/Land=` +
            `${out.ruhe ? `${out.ruhe.capSee}/${out.ruhe.capDeck}/${out.ruhe.capLand}` : "?"}; Selbsttest-gerissen=${out.ruheBroken}`
    );
    console.log(
        `F6 geleerte Spalte: Grube=${out.leer ? out.leer.grube : "?"} m (Soll < 0,05); Selbsttest-Grube=${out.leerBroken} m`
    );
    console.log(
        `F7 Netz nach dem Verdichten: ${out.netz ? `${out.netz.h0} → ${out.netz.h1}` : "?"} (Soll 8 → 8); Selbsttest=${out.netzBroken}`
    );
    if (out.fails.length) {
        console.log(`\nROT — ${out.fails.length} Fail(s):`);
        for (const f of out.fails) console.log("  ✗ " + f);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — alle 7 Fixtures + Selbst-Tests OK (F1 Höhen-Gate · F2 Rim-Wand · F3 Verdunstung · F4 Stau-Qualifikation · " +
            "F5 Ruhe-Fixpunkt · F6 geleerte Spalte · F7 Netz trägt seine Bytes)."
    );
    process.exit(0);
})();
