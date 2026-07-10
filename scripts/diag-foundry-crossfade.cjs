// diag-foundry-crossfade.cjs — DIE MASKEN-QUELLEN-LINSE (Paritäts-Vollendung W5.3+W5.4).
// Teil (a) Node-pur, OHNE Browser: beweist, dass die EINE geteilte Masken-Quelle
// `__phytoCore.lodCrossfadeMask` (phyto-core.js) die Studio-Dither-Blende
// (foundry-core.js `injectWind`-Fragment, FIX v37 + phytogenesis `_impMat`-fin)
// EXAKT übersetzt:
//   (1) RINDE = exakte Partition: keepL0 XOR keepL1 == 1 an JEDEM Rasterpunkt × Distanz-
//       Sample im Partitions-Band (f1o == 0); im Fern-Band ist die Ausblendung BEWUSST
//       verzögert (Union L1∪Impostor, das Billboard liegt tiefen-versetzt — foundry-core-
//       Kommentar Z.232f) → dort Union-lückenlos statt XOR.
//   (2) LAUB = überlappende Rampen (FIX v37): Union-Deckung ≥ max(Einzel-Deckung) an jedem
//       Band-Punkt, kein Loch (Union == 100 %), Band-Anfang ~100 % L0, Band-Ende ~100 %
//       Impostor, monotoner Übergang — auch bei divergenter Blatt-Metrik (vLodDL ≠ vLodD).
//   (3) NUMERISCHE ÄQUIVALENZ / DRIFT-WAND: die GLSL-Konstanten (die `_dh`-IGN-Koeffizienten,
//       die Rampen-Struktur, die Branch-Zeilen, die `PORTAL_RENDER_CONFIG.lod`-Zahlen) werden
//       per Regex aus foundry-core.js/phytogenesis.js geparst (NUR LESEN) und ein Referenz-
//       Evaluator aus GENAU diesen geparsten Werten gebaut → phyto-core muss auf dem ganzen
//       Raster × Band numerisch identisch entscheiden. Ändert der Schöpfer das Studio-GLSL,
//       wird die Linse rot.
//   (4) --selftest: zwei verfälschte phyto-core-Kopien (IGN-Koeffizient · Rampen-Faktor)
//       via vm → die Äquivalenz-Checks MÜSSEN feuern (die Linse ist nicht vakuös).
// Teil (b) — W5.4, headless (Null-Renderer, foundry-ON wie diag-nervensystem-vehicle): die
// CPU-DOPPEL-MITGLIEDSCHAFT im lebenden System. Ein Foundry-Baum-Eintrag wird über die
// thresh01/thresh12-Schwellen geschoben (Spieler-Position + `_tickArchitectureLOD`):
//   IM Band [Schwelle−fade−M, Schwelle+M] hält er Slots in BEIDEN Stufen-Gruppen,
//   außerhalb in EXAKT einer, NIE 0 — und die SLOT-BILANZ über den ganzen Sweep ist dicht
//   (Σ liveCount zurück auf die Baseline · je Gruppe next − free.length == liveCount ·
//   kein slotEntry-Rest). Der Sweep läuft SYNCHRON in einem Block (keine async-Interleaves),
//   alle drei Stufen sind VOR der Baseline gewärmt (kein Rewarm-Störer).
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
//   node scripts/diag-foundry-crossfade.cjs [--selftest]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const http = require("http");
const puppeteer = require("puppeteer");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.CROSSFADE_PORT || 4418);
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
// Kommentare strippen (die V18.267-Falle: erklärende Kommentare zitieren die Formeln wörtlich).
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ===== TEIL 1: die Studio-GLSL-Wahrheit parsen (foundry-core.js + phytogenesis.js, NUR LESEN) =====
const foundrySrc = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
const phytogenSrc = fs.readFileSync(path.join(root, "worlds", "terrain", "phytogenesis.js"), "utf8");
const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
const coreSrcRaw = fs.readFileSync(path.join(root, "phyto-core.js"), "utf8");

function parseStudio() {
    const out = { ok: true, why: [] };
    // die _dh-IGN-Koeffizienten (Jimenez interleaved gradient noise):
    const mDh =
        /_dh=fract\((\d+\.\d+)\*fract\(dot\(gl_FragCoord\.xy,vec2\((\d+\.\d+),(\d+\.\d+)\)\)\)\+uDitherT\)/.exec(
            foundrySrc
        );
    if (mDh) {
        out.dhA = mDh[1];
        out.dhBx = mDh[2];
        out.dhBy = mDh[3];
    } else {
        out.ok = false;
        out.why.push("_dh-Formel nicht gefunden");
    }
    // die Rampen-Struktur (_f1 aus vLodD über LOD_D1−LOD_FADE / LOD_FADE · _f0 aus vLodDL / FADE0):
    out.rampF1 =
        /_f1=clamp\(\(vLodD-"\s*\+\s*\(LOD_D1 - LOD_FADE\)\.toFixed\(1\)\s*\+\s*"\)\/"\s*\+\s*LOD_FADE\.toFixed\(1\)/.test(
            foundrySrc
        );
    out.rampF0 =
        /_f0=clamp\(\(vLodDL-"\s*\+\s*\(LOD_D0 - LOD_FADE0\)\.toFixed\(1\)\s*\+\s*"\)\/"\s*\+\s*LOD_FADE0\.toFixed\(1\)/.test(
            foundrySrc
        );
    out.rampF1o = /_f1o=clamp\(_f1\*2\.0-1\.0,0\.0,1\.0\);/.test(foundrySrc);
    // die Branch-Zeilen (Laub überlappend · Rinde Partition) EXAKT:
    out.branchFol =
        foundrySrc.indexOf(
            "if(vLod<1.5){ if(clamp(_f0*2.0-1.0,0.0,1.0)>=_dh)discard; } else { if(min(_f0*2.0,1.0)<_dh)discard; if(_f1o>=_dh)discard; } }"
        ) >= 0;
    out.branchBark =
        foundrySrc.indexOf(
            "if(vLod<1.5){ if(_f0>=_dh)discard; } else { if(_f0<_dh)discard; if(_f1o>=_dh)discard; } }"
        ) >= 0;
    // die Config-Zahlen (PORTAL_RENDER_CONFIG.lod — DIESELBEN Zahlen, aus denen der GLSL seine
    // Konstanten ableitet):
    const mLod = /lod:\s*\{\s*d0:\s*([\d.]+),\s*d1:\s*([\d.]+),\s*fade:\s*([\d.]+),\s*fade0:\s*([\d.]+),/.exec(
        foundrySrc
    );
    if (mLod) {
        out.cfg = { d0: +mLod[1], d1: +mLod[2], fade: +mLod[3], fade0: +mLod[4] };
    } else {
        out.ok = false;
        out.why.push("PORTAL_RENDER_CONFIG.lod nicht gefunden");
    }
    // die fin-EINblendung des Billboards (phytogenesis _impMat-Fragment):
    out.finRamp = /fin=clamp\(\(vCD-\(uD1-uFade\)\)\/uFade,0\.0,1\.0\)/.test(phytogenSrc);
    out.finBranch = /if\(max\(min\(fin\*2\.0,1\.0\),vOcc\)<_dh\)discard/.test(phytogenSrc);
    return out;
}

// ===== TEIL 2: der Referenz-Evaluator — aus GENAU den geparsten GLSL-Werten gebaut =====
function refIGN(P, x, y, t) {
    const fr = (v) => v - Math.floor(v);
    return fr(+P.dhA * fr(x * +P.dhBx + y * +P.dhBy) + t);
}
// stage: 0 = Stufe L0 (GLSL vLod<1.5-Zweig) · 1 = Stufe L1 (else) · 2 = Impostor (fin).
function refKeep(P, stage, foliage, dS, dL, dh) {
    const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const f1 = c01((dS - (P.cfg.d1 - P.cfg.fade)) / P.cfg.fade);
    const f0 = c01((dL - (P.cfg.d0 - P.cfg.fade0)) / P.cfg.fade0);
    const f1o = c01(f1 * 2.0 - 1.0);
    if (stage === 2) return Math.min(f1 * 2.0, 1.0) >= dh; // fin (vOcc = 0)
    if (stage === 0) return foliage ? c01(f0 * 2.0 - 1.0) < dh : f0 < dh;
    const fin = foliage ? Math.min(f0 * 2.0, 1.0) >= dh : f0 >= dh;
    return fin && f1o < dh;
}

// Das synthetische Dither-Raster: 64×64 Fragment-Zentren (gl_FragCoord = Pixel + 0.5).
const RAS = 64;
function buildRaster(core, P, t) {
    const N = RAS * RAS;
    const dh = new Float64Array(N);
    let mismatch = 0;
    for (let py = 0; py < RAS; py++)
        for (let px = 0; px < RAS; px++) {
            const x = px + 0.5,
                y = py + 0.5;
            const a = core.lodDitherIGN(x, y, t);
            const b = refIGN(P, x, y, t);
            if (a !== b) mismatch++;
            dh[py * RAS + px] = a;
        }
    return { dh, mismatch };
}

// Der Band-Sweep: Distanz-Samples über das ganze Übergangs-Band (+ exakte Kanten).
function bandSamples(cfg) {
    const out = [];
    const lo = cfg.d0 - cfg.fade0 - 4;
    const hi = cfg.d1 + 6;
    for (let d = lo; d <= hi; d += 0.5) out.push(d);
    for (const e of [
        cfg.d0 - cfg.fade0,
        cfg.d0 - cfg.fade0 / 2,
        cfg.d0,
        cfg.d1 - cfg.fade,
        cfg.d1 - cfg.fade / 2,
        cfg.d1,
    ])
        if (!out.includes(e)) out.push(e);
    out.sort((a, b) => a - b);
    return out;
}

// Kern-Vergleich + Invarianten auf einem Raster: gibt Zähler zurück (für Selbst-Test wiederverwendbar).
function evaluate(core, P, raster) {
    const cfg = P.cfg;
    const dists = bandSamples(cfg);
    const N = raster.dh.length;
    const res = {
        keepMismatch: 0,
        barkXorFail: 0,
        barkFarHole: 0,
        barkUnionHole: 0,
        folHole: 0,
        folHoleSplit: 0,
        folUnionLtMax: 0,
        folMonotonic: true,
        covL0Start: 0,
        covL2End: 0,
        partitionSamples: 0,
    };
    let prevC0 = Infinity,
        prevC2 = -Infinity;
    for (const d of dists) {
        // RINDE (aH0L == aH0 → dL == dS) + Impostor auf derselben Skelett-Metrik:
        const f1o = Math.max(0, Math.min(1, ((d - (cfg.d1 - cfg.fade)) / cfg.fade) * 2 - 1));
        const inPartition = f1o <= 0;
        if (inPartition) res.partitionSamples++;
        // LAUB-Deckungs-Zähler (dL == dS) + per-Distanz-Loch-Zähler:
        let c0 = 0,
            c1 = 0,
            c2 = 0,
            holeFol = 0;
        for (let i = 0; i < N; i++) {
            const dh = raster.dh[i];
            // beide Metriken: gleich (Rinde/kleiner Baum) + divergent (Blatt-Kappung, dL = 1.6·dS)
            for (const foliage of [false, true]) {
                for (const dL of foliage ? [d, d * 1.6] : [d]) {
                    const k0 = core.lodCrossfadeMask(d, dh, cfg, 0, foliage, dL).keep;
                    const k1 = core.lodCrossfadeMask(d, dh, cfg, 1, foliage, dL).keep;
                    const k2 = core.lodCrossfadeMask(d, dh, cfg, 2, foliage, dL).keep;
                    if (k0 !== refKeep(P, 0, foliage, d, dL, dh)) res.keepMismatch++;
                    if (k1 !== refKeep(P, 1, foliage, d, dL, dh)) res.keepMismatch++;
                    if (k2 !== refKeep(P, 2, foliage, d, dL, dh)) res.keepMismatch++;
                    if (!foliage) {
                        // (1) RINDE: exakte Partition im Partitions-Band, Union im Fern-Band.
                        if (inPartition) {
                            if ((k0 ? 1 : 0) + (k1 ? 1 : 0) !== 1) res.barkXorFail++;
                        } else if (!k1 && !k2) res.barkFarHole++;
                        if (!k0 && !k1 && !k2) res.barkUnionHole++;
                    } else {
                        // (2) LAUB: Union lückenlos (überlappende Rampen — FIX v37).
                        if (!k0 && !k1 && !k2) {
                            if (dL === d) {
                                res.folHole++;
                                holeFol++;
                            } else res.folHoleSplit++;
                        }
                        if (dL === d) {
                            if (k0) c0++;
                            if (k1) c1++;
                            if (k2) c2++;
                        }
                    }
                }
            }
        }
        // Union ≥ max(Einzel-Deckung) an DIESEM Band-Punkt (per-Distanz, nicht akkumuliert).
        const union = N - holeFol;
        if (union < Math.max(c0, c1, c2)) res.folUnionLtMax++;
        // Monotonie: L0-Deckung fällt, Impostor-Deckung steigt (exakt, integer-zählbar).
        if (c0 > prevC0 || c2 < prevC2) res.folMonotonic = false;
        prevC0 = c0;
        prevC2 = c2;
        if (d === dists[0]) res.covL0Start = c0 / N;
        if (d === dists[dists.length - 1]) res.covL2End = c2 / N;
    }
    return res;
}

function loadCore(src, label) {
    const sandbox = {};
    sandbox.self = sandbox;
    vm.runInContext(src, vm.createContext(sandbox), { filename: label });
    return sandbox.self.__phytoCore;
}

// ===== TEIL (b) — W5.4: die CPU-Doppel-Mitgliedschaft im lebenden System (headless) =====
async function runPartB() {
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { samples: [], err: null };
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        // ── Boot + Foundry abwarten ──
        const dl0 = performance.now() + 60000;
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { err: "anazhRealm nicht gebootet" };
        const st = r.state;
        const A = r.constructor;
        res.flagDefault = st.foundryCrossfade === true; // W5.4 — Maske+Band DEFAULT AN
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 50000;
        while (!(f && f.ready) && performance.now() < dl1) await sleep(80);
        res.foundryReady = !!(f && f.ready);
        if (!res.foundryReady) return res;
        // ── der Proben-Baum (das V18.218.1-Band-Muster: gewachsener Bauplan, ferner Fix-Spot) ──
        const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "w54-band-sweep");
        const px = 12345,
            pz = 6789;
        const py = r._voxelSurfaceY(px, pz) || 1;
        const entry = r.spawnArchitecture(grownKey, { x: px, y: py, z: pz }, { silent: true, seed: 1 });
        if (!entry) return { err: "spawnArchitecture gab null" };
        const preset = r._foundryPresetForEntry(entry);
        res.preset = preset;
        // ── ALLE drei Stufen VOR der Baseline wärmen (kein Rewarm-Störer im Sweep):
        //    flatten(0/1/2) bis truthy; der Loop-Pump treibt Worker-Replies + Impostor-Bake. ──
        const warm = { 0: false, 1: false, 2: false };
        const dl2 = performance.now() + 120000;
        while (performance.now() < dl2 && !(warm[0] && warm[1] && warm[2])) {
            for (const lod of [0, 1, 2]) {
                if (!warm[lod]) {
                    const fl = r._foundryFlattenFor(entry, preset, lod);
                    if (fl && fl.instanceable) warm[lod] = true;
                }
            }
            if (!(warm[0] && warm[1] && warm[2])) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(120);
            }
        }
        res.warm = { l0: warm[0], l1: warm[1], l2: warm[2] };
        if (!(warm[0] && warm[1] && warm[2])) return res;
        // Quieszenz: keine offenen Worker-Anfragen mehr → keine async-Placements im Sweep.
        const dl3 = performance.now() + 20000;
        while (f.pending && f.pending.size > 0 && performance.now() < dl3) await sleep(100);
        res.pendingAtSweep = f.pending ? f.pending.size : -1;

        // ════ AB HIER SYNCHRON (ein Block, kein await → keine Interleaves) ════
        const cfg = A.LOD_DISTANCES;
        const M = cfg.hysteresis || 0;
        const visH = r._lodTreeVisHeight(entry);
        const capL = Number.isFinite(cfg.leafVisCap) && cfg.leafVisCap > 0 ? cfg.leafVisCap : 12;
        const factor = r._lodPerceptionDistance(1000, visH) / 1000; // linear → skalierbar
        res.visH = visH;
        res.factor = factor;
        const stageOfKey = (k) => {
            if (/#fimp:/.test(k)) return 2;
            const m = /#f:[^|]+\|\d+\|(\d)\|/.exec(k);
            return m ? +m[1] : null;
        };
        const stagesOf = (e) => {
            const s = new Set();
            for (const list of [e.instSlots, e.instSlotsBand])
                if (Array.isArray(list)) for (const { key } of list) s.add(stageOfKey(key));
            s.delete(null);
            return Array.from(s).sort();
        };
        const balance = () => {
            let live = 0;
            const perKey = {};
            let inconsistent = 0,
                entryRefs = 0;
            if (st.archInstanceGroups)
                for (const [k, g] of st.archInstanceGroups) {
                    live += g.liveCount || 0;
                    perKey[k] = g.liveCount || 0;
                    if (g.kind !== "batch" && Array.isArray(g.free)) {
                        if ((g.next || 0) - g.free.length !== (g.liveCount || 0)) inconsistent++;
                    }
                    if (Array.isArray(g.slotEntry)) for (const se of g.slotEntry) if (se === entry) entryRefs++;
                }
            return { live, perKey, inconsistent, entryRefs };
        };
        // Spieler an die erste Probe-Position, DANN Baseline (vor der Erst-Platzierung).
        const dnTargets = [6, 14, 18, 22, 26, 31, 36, 42, 55, 36, 26, 18, 6];
        const place = (dn) => {
            const raw = dn / factor;
            st.playerMesh.position.set(px - raw, py, pz);
            return raw;
        };
        place(dnTargets[0]);
        const before = balance();
        r._rebuildArchitectureMesh(entry); // Erst-Platzierung (Assets warm → sofort instanced)
        res.placed = entry.instanced === true;
        const savedArchs = st.architectures;
        const savedCursor = r._archLODCursor;
        try {
            st.architectures = [entry]; // SICHERN+WIEDERHERSTELLEN (Gate-Hook-Lehre)
            for (const target of dnTargets) {
                const raw = place(target);
                r._archLODCursor = 0;
                for (let k = 0; k < 4; k++) r._tickArchitectureLOD(99); // Switch + Band-Pflege (idempotent)
                const dn = r._lodPerceptionDistance(raw, visH);
                const dnL = r._lodPerceptionDistance(raw, Math.min(visH, capL));
                const inB01 = dnL > cfg.thresh01 - (cfg.fade0 || 4) - M && dn < cfg.thresh01 + M;
                const inB12 = dn > cfg.thresh12 - (cfg.fade || 8) - M && dn < cfg.thresh12 + M;
                res.samples.push({
                    target,
                    dn: +dn.toFixed(2),
                    dnL: +dnL.toFixed(2),
                    inB01,
                    inB12,
                    stages: stagesOf(entry),
                    primary: entry._lodLevel,
                    band: Number.isFinite(entry._lodBandLevel) ? entry._lodBandLevel : null,
                });
            }
        } finally {
            st.architectures = savedArchs;
            r._archLODCursor = savedCursor;
        }
        // ════ TEIL Z (AUSLÖSCHUNGS-WELLE, Feld B) — DER STUFEN-ZENSUS: bei Studio-
        // äquivalenten Distanzen serviert der HOST dieselbe Stufe wie der Studio-Wald.
        // Studio-CPU-Formel (phytogenesis Z.2739-2750): dn = dr·min(HREF/bh, 1)
        // UNGEDECKELT (kein visStretchMax) · Blatt-Kappe bh_L = min(bh, 24) (Z.2392) —
        // der Host-`_lodPerceptionDistance`/-Partner MUSS dieselben Zahlen liefern
        // (Zahl je Distanz-Band × Sichthöhe; vor der Kalibrierung: Deckel 15 m +
        // Kappe 12 m = doppelt so frühe Demotion, der „nicht wie in der Vorlage"-Riss).
        res.zensus = [];
        const hrefZ = cfg.lodRef;
        const stageStudio = (dr, bh) => {
            const dnS = dr * Math.min(1, hrefZ / bh);
            return dnS < cfg.thresh01 ? 0 : dnS < cfg.thresh12 ? 1 : 2;
        };
        // Distanzen meiden EXAKTE Schwellen-Treffer (160·12/48 = 40.0 — Host-Hysterese
        // und Studio-`<` urteilen die Kante verschieden; die Kante ist kein Zensus-Fall).
        const fdPrev = st._foliageDensityScale;
        st._foliageDensityScale = 1; // perfMul neutral — der Zensus misst die METRIK, nicht den Regler
        for (const bh of [8, 12, 24, 36, 48]) {
            for (const dr of [10, 18, 30, 45, 70, 110, 165]) {
                const host = r._chooseLODForDistance(dr, undefined, bh);
                const studio = stageStudio(dr, bh);
                res.zensus.push({ bh, dr, host, studio, ok: host === studio });
            }
        }
        // Blatt-Kappe 24 (Studio) statt 12: großer Baum (bh 36) bei dr 20 → dnL = 20·(12/24) = 10
        // ≤ D0−FADE0−M (12.6) → KEIN L1-Partner (das Laub lebt noch voll in L0; mit Kappe 12
        // wäre dnL = 20 > 12.6 → Partner — die alte, halbierte Laub-Sichthöhe).
        res.leafCapPartner = r._lodBandPartnerFor(20, 36, 0);
        res.leafCapValue = cfg.leafVisCap;
        // visStretchMax UNGEDECKELT: dn(100, 36) = 100·12/36 = 33.33 (der alte Deckel gab 80).
        res.stretchProbe = +r._lodPerceptionDistance(100, 36).toFixed(2);
        st._foliageDensityScale = fdPrev;
        r.removeArchitecture(entry); // Default-Remove räumt Primär + Band
        const after = balance();
        res.balance = {
            liveBefore: before.live,
            liveAfter: after.live,
            inconsistentAfter: after.inconsistent,
            entryRefsAfter: after.entryRefs,
            slotsAfter: !!entry.instSlots,
            bandAfter: !!entry.instSlotsBand,
        };
        return res;
    });

    await browser.close();
    server.close();
    return { out, pageErrors };
}

async function main() {
    const P = parseStudio();
    if (!P.ok) {
        console.error("❌ Studio-GLSL nicht parsbar: " + P.why.join(", "));
        process.exit(1);
    }

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf verfälschte Kopien ===");
        // V1: der IGN-Koeffizient verfälscht → die Dither-Äquivalenz MUSS feuern.
        const bad1 = coreSrcRaw.split("52.9829189").join("52.9829188");
        const core1 = loadCore(bad1, "phyto-core(bad-ign)");
        const r1 = buildRaster(core1, P, 0);
        check("Selbst-Test 1: verfälschter IGN-Koeffizient → Dither-Äquivalenz feuert", r1.mismatch > 0);
        // V2: der f1o-Rampen-Faktor verfälscht → die Masken-Äquivalenz MUSS feuern.
        const bad2 = coreSrcRaw.replace("c01(f1 * 2.0 - 1.0)", "c01(f1 * 2.0 - 0.5)");
        const core2 = loadCore(bad2, "phyto-core(bad-ramp)");
        const ras2 = buildRaster(core2, P, 0);
        const r2 = evaluate(core2, P, ras2);
        check("Selbst-Test 2: verfälschte f1o-Rampe → Masken-Äquivalenz feuert", r2.keepMismatch > 0);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Linse feuert auf beide Verfälschungs-Klassen.");
        process.exit(0);
    }

    console.log("=== W5.3 — DIE GETEILTE MASKEN-QUELLE (phyto-core ↔ Studio-GLSL) ===");
    console.log("--- Teil 3: die Drift-Wand (Studio-GLSL-Struktur + Konstanten geparst) ---");
    check("GLSL: _dh-IGN-Koeffizienten geparst", !!P.dhA, `${P.dhA} · ${P.dhBx} · ${P.dhBy}`);
    check("GLSL: _f1-Rampe = (vLodD − (LOD_D1−LOD_FADE)) / LOD_FADE", P.rampF1);
    check("GLSL: _f0-Rampe = (vLodDL − (LOD_D0−LOD_FADE0)) / LOD_FADE0", P.rampF0);
    check("GLSL: _f1o = clamp(_f1·2 − 1, 0, 1) (verzögerte Fern-Ausblendung)", P.rampF1o);
    check("GLSL: der Laub-Branch (überlappende Rampen, FIX v37) steht wörtlich", P.branchFol);
    check("GLSL: der Rinden-Branch (exakte Partition) steht wörtlich", P.branchBark);
    check(
        "GLSL: PORTAL_RENDER_CONFIG.lod geparst",
        !!P.cfg,
        P.cfg ? `d0=${P.cfg.d0} d1=${P.cfg.d1} fade=${P.cfg.fade} fade0=${P.cfg.fade0}` : ""
    );
    check("GLSL: die fin-EINblendung des Billboards (phytogenesis _impMat)", P.finRamp && P.finBranch);
    // Die Config-Heimat-Parität: LOD_DISTANCES-Defaults == Studio-lod-Zahlen (beide Häuser, eine Zahl).
    const mLD =
        /AnazhRealm\.LOD_DISTANCES = \{[\s\S]*?thresh01:\s*([\d.]+),[\s\S]*?thresh12:\s*([\d.]+),[\s\S]*?fade:\s*([\d.]+),[\s\S]*?fade0:\s*([\d.]+),/.exec(
            anazhSrc
        );
    check(
        "LOD_DISTANCES-Defaults == Studio-lod-Zahlen (thresh01/thresh12/fade/fade0)",
        !!mLD && +mLD[1] === P.cfg.d0 && +mLD[2] === P.cfg.d1 && +mLD[3] === P.cfg.fade && +mLD[4] === P.cfg.fade0,
        mLD ? `${mLD[1]}/${mLD[2]}/${mLD[3]}/${mLD[4]}` : "LOD_DISTANCES nicht geparst"
    );
    // phyto-core trägt DIESELBEN IGN-Koeffizienten im CODE (kommentar-gestrippte Quelle):
    const coreNC = stripComments(coreSrcRaw);
    const ignBody = fnBody(coreNC, /function lodDitherIGN\(/) || "";
    check(
        "phyto-core lodDitherIGN trägt die GEPARSTEN Koeffizienten wörtlich",
        ignBody.includes(P.dhA) && ignBody.includes(P.dhBx) && ignBody.includes(P.dhBy)
    );
    // die TSL-Hälfte (anazhRealm._lodCrossfadeMaskNode) mappt DIESELBEN Koeffizienten + die
    // EINEN Quellen — statische Symbol-Wand. W5.4 (Schritt 3, der Test wandert mit dem Code,
    // V9.56-i): die Band-Zahlen leben jetzt als LIVE-Uniforms uLodD0/uLodD1/uLodFade/uLodFade0
    // (der Helfer liest sie statt gefalteter Floats); ihr Seed kommt aus LOD_DISTANCES in
    // `_ensureLodUniforms`, der Frame-Spiegel (`uLodD0.value = _D.thresh01`) hält sie live.
    const anazhNC = stripComments(anazhSrc);
    const tslBody = fnBody(anazhNC, /_lodCrossfadeMaskNode\(T, opts\)\s*/) || "";
    check(
        "TSL-Hälfte (_lodCrossfadeMaskNode): dieselben IGN-Koeffizienten + die Uniform-Quellen",
        tslBody.includes(P.dhA) &&
            tslBody.includes(P.dhBx) &&
            tslBody.includes(P.dhBy) &&
            /uLodD0/.test(tslBody) &&
            /uLodD1/.test(tslBody) &&
            /uLodFade\b/.test(tslBody) &&
            /uLodFade0/.test(tslBody) &&
            /uDitherT/.test(tslBody) &&
            /uLodMaskOn/.test(tslBody)
    );
    const ensureBody = fnBody(anazhNC, /_ensureLodUniforms\(\)\s*/) || "";
    check(
        "Uniform-Seed + Live-Spiegel: uLodD0..Fade0 aus LOD_DISTANCES (thresh01/thresh12/fade/fade0)",
        /uLodD0/.test(ensureBody) &&
            /thresh01/.test(ensureBody) &&
            /thresh12/.test(ensureBody) &&
            /uLodD0\.value = _D\.thresh01/.test(anazhNC)
    );

    console.log("--- Teil 1+2: die Masken-Invarianten auf dem 64×64-Raster übers Band ---");
    require("../phyto-core.js");
    const core = globalThis.__phytoCore;
    check(
        "phyto-core exportiert lodCrossfadeMask + lodDitherIGN",
        core && typeof core.lodCrossfadeMask === "function" && typeof core.lodDitherIGN === "function"
    );
    let totalKeepMismatch = 0,
        totalDhMismatch = 0;
    let agg = null;
    for (const t of [0, 0.61803398875]) {
        const raster = buildRaster(core, P, t);
        totalDhMismatch += raster.mismatch;
        const r = evaluate(core, P, raster);
        totalKeepMismatch += r.keepMismatch;
        if (!agg) agg = r;
        else {
            agg.barkXorFail += r.barkXorFail;
            agg.barkFarHole += r.barkFarHole;
            agg.barkUnionHole += r.barkUnionHole;
            agg.folHole += r.folHole;
            agg.folHoleSplit += r.folHoleSplit;
            agg.folUnionLtMax += r.folUnionLtMax;
            agg.folMonotonic = agg.folMonotonic && r.folMonotonic;
            agg.covL0Start = Math.min(agg.covL0Start, r.covL0Start);
            agg.covL2End = Math.min(agg.covL2End, r.covL2End);
        }
    }
    check("Dither-Äquivalenz: lodDitherIGN == geparste GLSL-IGN (2 uDitherT-Phasen)", totalDhMismatch === 0);
    check("Masken-Äquivalenz: keep == Referenz aus den geparsten Konstanten (alle Stufen)", totalKeepMismatch === 0);
    check(
        "RINDE: keepL0 XOR keepL1 == 1 an jedem Rasterpunkt × Sample im Partitions-Band",
        agg.barkXorFail === 0 && agg.partitionSamples > 20,
        `Samples=${agg.partitionSamples}`
    );
    check("RINDE: Fern-Band lückenlos (L1 ∪ Impostor — verzögerte Ausblendung)", agg.barkFarHole === 0);
    check("RINDE: Voll-Band lückenlos (L0 ∪ L1 ∪ Impostor)", agg.barkUnionHole === 0);
    check("LAUB: Union lückenlos an jedem Band-Punkt (überlappende Rampen)", agg.folHole === 0);
    check("LAUB: Union lückenlos auch bei divergenter Blatt-Metrik (vLodDL = 1.6·vLodD)", agg.folHoleSplit === 0);
    check("LAUB: Union-Deckung ≥ max(Einzel-Deckung) an jedem Band-Punkt", agg.folUnionLtMax === 0);
    check("LAUB: Band-Anfang ~100 % L0", agg.covL0Start >= 0.999, (agg.covL0Start * 100).toFixed(2) + " %");
    check("LAUB: Band-Ende ~100 % Impostor", agg.covL2End >= 0.999, (agg.covL2End * 100).toFixed(2) + " %");
    check("LAUB: monotoner Übergang (L0 fällt, Impostor steigt)", agg.folMonotonic === true);
    // Statische Scope-Wand der CPU-Hälfte: Band nur für Foundry-BAUM-Einträge (dieselbe
    // Wand wie der aLodLevel-Stempel), Add/Remove nur durch die Slot-Chokepoints.
    const bandBody = fnBody(anazhNC, /_updateFoundryLodBand\(entry, dist, presetOpt\)\s*/) || "";
    check(
        "CPU-Band-Pflege: Baum-Wand + Chokepoint-Disziplin (_updateFoundryLodBand)",
        /_foundryPresetIsTree/.test(bandBody) &&
            /instFoundry/.test(bandBody) &&
            /_archInstanceAdd/.test(bandBody) &&
            /_archInstanceRemove/.test(bandBody)
    );

    console.log("--- Teil (b) — W5.4: die Doppel-Mitgliedschaft im lebenden System (headless, foundry-ON) ---");
    const { out, pageErrors } = await runPartB();
    if (out.err) check("Teil (b) lief", false, out.err);
    else {
        check("W5.4: foundryCrossfade ist DEFAULT AN", out.flagDefault === true);
        check("Foundry ready + Preset aufgelöst", out.foundryReady === true && out.preset === "eiche", out.preset);
        check(
            "alle drei Stufen warm vor der Baseline (L0/L1/Impostor)",
            !!(out.warm && out.warm.l0 && out.warm.l1 && out.warm.l2),
            JSON.stringify(out.warm)
        );
        check("der Proben-Baum platziert (instanced)", out.placed === true);
        let holes = 0,
            b01Fail = 0,
            b12Fail = 0,
            outsideFail = 0;
        for (const s of out.samples || []) {
            const set = JSON.stringify(s.stages);
            if (!s.stages.length) holes++;
            if (s.inB01 && !s.inB12 && set !== "[0,1]") b01Fail++;
            if (s.inB12 && set !== "[1,2]") b12Fail++;
            if (!s.inB01 && !s.inB12 && s.stages.length !== 1) outsideFail++;
        }
        check(`Sweep gelaufen (${(out.samples || []).length} Proben, hin + zurück)`, (out.samples || []).length >= 10);
        check("NIE 0 Stufen resident", holes === 0);
        check("IM L0/L1-Band: Slots in BEIDEN Stufen-Gruppen ({0,1})", b01Fail === 0);
        check("IM L1/L2-Band: Slots in BEIDEN Stufen-Gruppen ({1,2})", b12Fail === 0);
        check("AUSSERHALB der Bänder: exakt EINE Stufe", outsideFail === 0);
        const B = out.balance || {};
        check(
            "SLOT-BILANZ: Σ liveCount zurück auf die Baseline (kein Leck)",
            B.liveBefore === B.liveAfter,
            `${B.liveBefore} → ${B.liveAfter}`
        );
        check("SLOT-BILANZ: je Gruppe next − free == liveCount (konsistent)", B.inconsistentAfter === 0);
        check(
            "SLOT-BILANZ: kein slotEntry-/Feld-Rest (Remove räumt Primär + Band)",
            B.entryRefsAfter === 0 && B.slotsAfter === false && B.bandAfter === false
        );
        if ((out.samples || []).length) {
            console.log(
                "   Sweep: " +
                    out.samples.map((s) => `${s.dn}m→[${s.stages}]${s.inB01 ? "B01" : s.inB12 ? "B12" : ""}`).join(" ")
            );
        }
    }
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (out && Array.isArray(out.zensus)) {
        const bad = out.zensus.filter((z) => !z.ok);
        check(
            "Z (Stufen-Zensus): der Host serviert bei Studio-äquivalenten Distanzen DIESELBE Stufe (5 Sichthöhen × 7 Distanzen)",
            out.zensus.length === 35 && bad.length === 0,
            bad.length ? JSON.stringify(bad.slice(0, 4)) : "35/35"
        );
        check(
            "Z: die Blatt-Kappe ist die Studio-24 (phytogenesis Z.2392) — großer Baum (36 m) bei 20 m trägt KEINEN L1-Partner",
            out.leafCapValue === 24 && out.leafCapPartner === null,
            `cap=${out.leafCapValue} partner=${out.leafCapPartner}`
        );
        check(
            "Z: die SSE-Sichthöhe ist UNGEDECKELT (foundry-core Z.196) — dn(100, 36) = 33.33 (der alte 15-m-Deckel gab 80)",
            Math.abs(out.stretchProbe - 100 * (12 / 36)) < 0.05,
            String(out.stretchProbe)
        );
    } else if (out && !out.err) {
        check("Z (Stufen-Zensus) lief", false, "zensus fehlt");
    }
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE STUDIO-BLENDE IST GANZ: __phytoCore.lodCrossfadeMask übersetzt die Dither-Maske byte-nah (Rinde Partition · Laub überlappend · Impostor-fin), und die CPU-Doppel-Mitgliedschaft hält im Band BEIDE Stufen resident (außerhalb exakt eine, nie 0, Slot-Bilanz dicht) — Maske + Band zusammen DEFAULT AN."
    );
    process.exit(0);
}

main().catch((e) => {
    console.error("Crossfade-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
