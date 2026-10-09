#!/usr/bin/env node
// gate:worker-dichte — DER DICHTE-SPIEGEL Main ↔ voxel-worker ist BYTE-GENAU.
//
// Der Worker baut die Dichte-Gitter der Chunks OFF-THREAD (`computeDensityGrid`, Spiegel von
// `_voxelEditedDensityGrid`); der Main baut den Spieler-Chunk und jeden Edit-Rebuild selbst. Weichen beide ab,
// lebt der Boden auf zwei Wahrheiten (Naht, Kollision gegen ein anderes Bild). Bis zu dieser Linse zitierte der
// Kommentar an `_terrainDensityAt` zwei Linsen (diag-density-refactor, diag-worker-chunk), die es nicht mehr gab —
// der Dichte-Spiegel hatte KEINE Wand (Lehre 10).
//
// Je Welt (Standard: der Boot-Seed; Bühne: spec/pruefbuehne/welt.json, importiert wie im Spiel) und je Ort (die
// Messorte des Haushalts, ein Fluss-Chunk; auf der Bühne ihre Stationen) wird das Gitter jeder LOD-Stufe 0–3 im
// Main (`_voxelEditedDensityGrid`, frischer Cache-Schlüssel) und im Worker (`density-grid`) gebaut und Wort für
// Wort (Float32-Bitmuster) verglichen — zuerst ohne Edits, dann mit zwei Kugeln am ersten Ort: einer Schnitz-Kugel
// im Oberflächen-Band und einer FÜLL-KUGEL ÜBER dem Band (der Band-Befund des Richters 09.10.: der Main legt die
// Kugel auf jede Ecke ihres Kastens, der Worker übersprang über dem Band).
//
//   node scripts/diag-worker-dichte.cjs [--welten standard,buehne] [--json datei]
//   node scripts/diag-worker-dichte.cjs --selftest     ein verfälschter Worker-Term (terrainSteepness 1 → 1,0001,
//                                                      nur im Worker) MUSS rot werden; der saubere Lauf grün
//   node scripts/diag-worker-dichte.cjs --abdruck datei [--wurzel dir]
//                                                      der BYTE-ABDRUCK der Standard-Welt (SHA-256 je Gitter, Main
//                                                      UND Worker, und der Makro-Höhe auf einem 64×64-Gitter) — gegen
//                                                      einen anderen Stand (`--wurzel` = sein Baum) verglichen beweist er
//                                                      „byte-gleich"
// Port: WORKER_DICHTE_PORT (Default 4392). Exit 1 bei Drift, Längen-Mismatch, Page-Error oder rotem Selbsttest.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SELBSTTEST = argv.includes("--selftest");
const ABDRUCK = opt("--abdruck", null);
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.WORKER_DICHTE_PORT) || 4392;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const WELTEN = ABDRUCK ? ["standard"] : String(opt("--welten", "standard")).split(",").filter(Boolean);
const BUEHNE_DATEI = path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
    });
});

// Boot bis die Welt steht und der Worker den Worldgen-Stand trägt (der Null-Renderer wie im Playtest: die Probe
// braucht keinen Render, nur Main und Worker).
async function boote(page) {
    return page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* der Boot reift */
                }
                const s = r.state;
                if (s && s.voxelChunks && s.voxelChunks.size > 4 && s.voxelWorkerReady && s.voxelWorkerWorldgenSynced)
                    return { ok: true, ms: Math.round(performance.now() - start), seed: s.worldMeta.seed };
            }
            await new Promise((res) => setTimeout(res, 16));
        }
        return { ok: false };
    });
}

// Die Probe in der Seite: Orte × LOD 0–3, Main gegen Worker, Bitmuster je Wort.
async function probe(page, welt, mitAbdruck) {
    return page.evaluate(
        async (welt, mitAbdruck) => {
            const r = window.anazhRealm;
            const s = r.state;
            r._gameLoopTick = () => {}; // die Welt steht still: kein Stream, kein Takt zwischen Main und Worker
            const out = {
                welt,
                seed: s.worldMeta.seed,
                orte: [],
                gitter: 0,
                worte: 0,
                abweichend: 0,
                maxDiff: 0,
                befunde: [],
            };
            const hex = async (arr) => {
                const d = await crypto.subtle.digest(
                    "SHA-256",
                    arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
                );
                return Array.from(new Uint8Array(d))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            };
            const warteAck = (nachricht) =>
                new Promise((res, rej) => {
                    const id = s.voxelWorkerNextRequestId++;
                    s.voxelWorkerPending.set(id, { resolve: res, reject: rej });
                    s.voxelWorker.postMessage(Object.assign({}, nachricht, { requestId: id }));
                });
            // Die Orte: Standard = die Messorte des Haushalts + ein Fluss-Chunk; Bühne = ihre Stationen.
            const orte = [];
            if (welt === "standard") {
                orte.push({ id: "wiese", x: -900, z: -850 }, { id: "genesis", x: 36, z: 0 });
                const h = s.hydrosphere;
                const fl =
                    h && Array.isArray(h.rivers) ? h.rivers.find((f) => f && f.points && f.points.length > 4) : null;
                if (fl) {
                    const p = fl.points[Math.floor(fl.points.length / 2)];
                    orte.push({ id: "fluss", x: p.x, z: p.z });
                } else out.befunde.push("kein Fluss in der Heimat-Region — der Fluss-Ort fehlt");
            } else {
                for (const st of welt.stationen || []) orte.push({ id: st.id, x: st.x, z: st.z });
            }
            const base = s.terrainBaseHeight || 0;
            const vergleiche = async (ort, lod, tag) => {
                const cfg = r._voxelChunkConfig(lod);
                const cx = Math.floor(ort.x / cfg.span);
                const cz = Math.floor(ort.z / cfg.span);
                const ox = cx * cfg.span - cfg.step;
                const oz = cz * cfg.span - cfg.step;
                const oy = base - cfg.floorDrop;
                const dX = cfg.dim + 3;
                const dY = cfg.dimY;
                const dZ = cfg.dim + 3;
                const key = `linse-dichte|${cx},${cz},${lod}|${tag}`;
                const main = r._voxelEditedDensityGrid(key, ox, oy, oz, dX, dY, dZ, cfg.step);
                s.voxelBaseDensityCache.delete(key);
                const worker = await r._voxelWorkerComputeDensity(ox, oy, oz, dX, dY, dZ, cfg.step);
                const z = { ort: ort.id, lod, tag, cx, cz, n: main.length, abweichend: 0, maxDiff: 0, erste: null };
                out.gitter++;
                if (main.length !== worker.length) {
                    z.laenge = `${main.length}≠${worker.length}`;
                    out.befunde.push(`${ort.id} L${lod} ${tag}: LÄNGE ${z.laenge}`);
                    out.abweichend++;
                    return z;
                }
                const mu = new Uint32Array(main.buffer, main.byteOffset, main.length);
                const wu = new Uint32Array(worker.buffer, worker.byteOffset, worker.length);
                const Nx = dX + 1;
                const Ny = dY + 1;
                for (let i = 0; i < mu.length; i++) {
                    out.worte++;
                    if (mu[i] === wu[i]) continue;
                    z.abweichend++;
                    const d = Math.abs(main[i] - worker[i]);
                    if (!(d <= z.maxDiff)) z.maxDiff = d;
                    if (!z.erste) {
                        const ii = i % Nx;
                        const jj = Math.floor(i / Nx) % Ny;
                        const kk = Math.floor(i / (Nx * Ny));
                        z.erste = {
                            x: +(ox + ii * cfg.step).toFixed(2),
                            y: +(oy + jj * cfg.step).toFixed(2),
                            z: +(oz + kk * cfg.step).toFixed(2),
                            main: main[i],
                            worker: worker[i],
                        };
                    }
                }
                out.abweichend += z.abweichend;
                if (!(z.maxDiff <= out.maxDiff)) out.maxDiff = z.maxDiff;
                if (mitAbdruck) {
                    z.shaMain = await hex(main);
                    z.shaWorker = await hex(worker);
                }
                return z;
            };
            // (1) ohne Edits
            const editsVorher = s.worldMeta.voxelEdits;
            s.worldMeta.voxelEdits = [];
            await r._voxelWorkerSyncState({ op: "state-set" });
            for (const ort of orte) {
                const zeilen = [];
                for (let lod = 0; lod <= 3; lod++) zeilen.push(await vergleiche(ort, lod, "rein"));
                out.orte.push({ id: ort.id, x: ort.x, z: ort.z, zeilen });
            }
            // (2) mit Edits am ersten Ort: Schnitz-Kugel im Band, Füll-Kugel ÜBER dem Band (Band-Oberkante LOD 0 =
            // Makro + 12 + 4 · 1,8 = +19,2 m; die Kugel liegt von +25 bis +35 m)
            const o0 = orte[0];
            const surf = r._terrainMacroSurfaceY(o0.x, o0.z);
            s.worldMeta.voxelEdits = [
                { x: o0.x + 3, y: surf, z: o0.z + 2, r: 4, strength: 48, mode: "carve" },
                { x: o0.x - 4, y: surf + 30, z: o0.z - 3, r: 5, strength: 48, mode: "fill" },
            ];
            await r._voxelWorkerSyncState({ op: "state-set" });
            const zeilenEdit = [];
            for (let lod = 0; lod <= 3; lod++) zeilenEdit.push(await vergleiche(o0, lod, "edits"));
            out.orte.push({ id: o0.id + "+edits", x: o0.x, z: o0.z, zeilen: zeilenEdit });
            s.worldMeta.voxelEdits = editsVorher;
            await r._voxelWorkerSyncState({ op: "state-set" });
            // Der Abdruck der Makro-Höhe (64×64, ±852 m, Schritt 27 m — ganzzahlig, f32-exakt) für den Byte-Beweis.
            if (mitAbdruck) {
                const h = new Float64Array(64 * 64 * 2);
                let q = 0;
                for (let j = 0; j < 64; j++)
                    for (let i = 0; i < 64; i++) {
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, true);
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, false);
                    }
                out.shaMakro = await hex(h);
            }
            out.warteAck = typeof warteAck === "function";
            return out;
        },
        welt,
        mitAbdruck
    );
}

// Der Selbsttest: EIN Term nur im Worker verfälscht (terrainSteepness skaliert die ridged-Amplitude im Spiegel
// `terrainMacroSurfaceY`) — die Linse MUSS das beim Ort und Gitter nennen.
async function verfaelsche(page, an) {
    return page.evaluate(async (an) => {
        const r = window.anazhRealm;
        const s = r.state;
        if (!an) return r._voxelWorkerSyncState({ op: "state-set" });
        return new Promise((res, rej) => {
            const id = s.voxelWorkerNextRequestId++;
            s.voxelWorkerPending.set(id, { resolve: res, reject: rej });
            s.voxelWorker.postMessage({ type: "state-update", delta: { terrainSteepness: 1.0001 }, requestId: id });
        });
    }, an);
}

// Ein Lauf mit verfälschtem Worker: dieselbe Probe, nur der Worker-Zustand ist nach dem state-set verfälscht.
async function probeVerfaelscht(page) {
    // Die Probe synct den Worker vor jedem Teil neu (state-set) — darum verfälscht dieser Lauf den Spiegel in der
    // Seite: _voxelWorkerSyncState hängt die Verfälschung an jeden Snapshot.
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const orig = r._voxelWorkerSnapshotState;
        r.__dichteOrig = orig;
        r._voxelWorkerSnapshotState = function () {
            const snap = orig.call(this);
            snap.terrainSteepness = 1.0001;
            return snap;
        };
    });
    await verfaelsche(page, true);
    const rep = await probe(page, "standard", false);
    await page.evaluate(() => {
        const r = window.anazhRealm;
        r._voxelWorkerSnapshotState = r.__dichteOrig;
        delete r.__dichteOrig;
    });
    await verfaelsche(page, false);
    return rep;
}

function zeige(rep) {
    console.log(`\n  Welt ${rep.welt === "standard" ? "standard" : "bühne"} (Seed ${rep.seed}):`);
    for (const o of rep.orte) {
        const teile = o.zeilen.map((z) => `L${z.lod} ${z.abweichend ? "✗" + z.abweichend : "="}`);
        console.log(`    ${o.id.padEnd(16)} (${Math.round(o.x)}|${Math.round(o.z)})  ${teile.join("  ")}`);
        for (const z of o.zeilen)
            if (z.erste)
                console.log(
                    `      ✗ L${z.lod}: ${z.abweichend} Ecken, maxDiff ${z.maxDiff} — erste bei (${z.erste.x}|${z.erste.y}|${z.erste.z}) Main ${z.erste.main} ≠ Worker ${z.erste.worker}`
                );
    }
    for (const b of rep.befunde) console.log("    •", b);
    console.log(
        `    ${rep.gitter} Gitter · ${rep.worte} Ecken · abweichend ${rep.abweichend} · maxDiff ${rep.maxDiff}`
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const url = `http://127.0.0.1:${PORT}/index.html`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // Frische Standard-Welt (der Boot-Seed): kein Rest einer früheren Welt im Profil.
    await page.evaluate(() => {
        try {
            localStorage.clear();
        } catch (_e) {
            /* */
        }
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("\n========= DER DICHTE-SPIEGEL — Main _voxelEditedDensityGrid == Worker computeDensityGrid =========");
    const berichte = [];
    let rot = false;
    let selbst = null;
    for (const welt of WELTEN) {
        let weltArg = welt;
        if (welt === "buehne") {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            const stationen = JSON.parse(
                fs.readFileSync(path.resolve(path.dirname(BUEHNE_DATEI), "stationen.json"), "utf8")
            ).stationen;
            // Geboren wie im Spiel: importWorldBeside (Welt-Tor) + aktiv + Reload.
            const id = await page.evaluate((json) => {
                const r = window.anazhRealm;
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r.activeWorldSet(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
            weltArg = { stationen };
        }
        const b = await boote(page);
        if (!b.ok) {
            console.log(`  ⛔ Welt ${welt}: Boot nicht bereit nach 120 s`);
            rot = true;
            continue;
        }
        console.log(`  Boot ${welt}: ${b.ms} ms (Seed ${b.seed})`);
        const rep = await probe(page, weltArg, !!ABDRUCK);
        rep.welt = welt;
        rep.bootMs = b.ms;
        zeige(rep);
        berichte.push(rep);
        if (rep.abweichend > 0 || rep.befunde.length) rot = true;
        if (SELBSTTEST && welt === "standard") {
            const v = await probeVerfaelscht(page);
            selbst = { abweichend: v.abweichend, maxDiff: v.maxDiff, gitter: v.gitter };
            console.log(
                `\n  SELBSTTEST (terrainSteepness 1 → 1,0001 nur im Worker): ${v.abweichend} abweichende Ecken in ${v.gitter} Gittern, maxDiff ${v.maxDiff}`
            );
        }
    }
    if (ABDRUCK) {
        const abdruck = {
            wurzel: root,
            seed: berichte[0] && berichte[0].seed,
            makro: berichte[0] && berichte[0].shaMakro,
            gitter: [],
        };
        for (const o of (berichte[0] && berichte[0].orte) || [])
            for (const z of o.zeilen)
                abdruck.gitter.push({ ort: o.id, lod: z.lod, main: z.shaMain, worker: z.shaWorker });
        fs.writeFileSync(ABDRUCK, JSON.stringify(abdruck, null, 1));
        console.log(
            `\n  Abdruck: ${ABDRUCK} (${abdruck.gitter.length} Gitter + Makro ${String(abdruck.makro).slice(0, 12)}…)`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ berichte, selbst }, null, 1));
    if (pageErr) rot = true;
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.abweichend > 0;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: der saubere Spiegel ist byte-gleich, der verfälschte Worker-Term fällt rot" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "die Verfälschung blieb unentdeckt (die Linse ist blind)")}\n`
        );
    } else {
        pass = !rot && berichte.length === WELTEN.length;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? "Dichte-Spiegel Main == Worker, byte-genau (maxDiff 0) in " + WELTEN.join(" + ") : "DRIFT / FEHLER"}\n`
        );
    }
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("⛔", e && e.stack ? e.stack : e);
    process.exit(1);
});
