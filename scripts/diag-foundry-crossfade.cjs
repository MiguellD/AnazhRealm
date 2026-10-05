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
//   (5) DIE SCHATTEN-WAHRHEIT (V18.513): der Schattenpass liest, was das Auge sieht. r184 rendert ihn mit
//       der Kaskaden-Kamera (`cameraPosition` = Licht-Kamera, lightMargin 200 m → nahe Bäume lagen 145 m
//       „weit", die Maske verwarf ALLE ihre Schatten-Fragmente) und liest nur colorNode.a · map.a ·
//       maskShadowNode, nie opacityNode (die Nadel-Karten warfen Rechtecke). Statisch: jede LOD-Maske misst
//       vom Auge (`uLodAuge`, je Frame aus der Haupt-Kamera), kein werfender Foundry-Stoff schneidet über
//       opacityNode aus, der Schatten-Zwilling wirft mit der L0-gestempelten L1-Gestalt (`_foundrySchattenGeom`,
//       derselbe Stoff) und besitzt sie nicht. --selftest bricht jede Klasse einzeln.
// Teil (b) — W5.4, headless (Null-Renderer, foundry-ON wie diag-nervensystem-vehicle): die
// CPU-DOPPEL-MITGLIEDSCHAFT im lebenden System. Ein Foundry-Baum-Eintrag wird über die
// thresh01/thresh12-Schwellen geschoben (Spieler-Position + `_tickArchitectureLOD`):
//   IM Band [Schwelle−fade−M, Schwelle+M] hält er Slots in BEIDEN Stufen-Gruppen,
//   außerhalb in EXAKT einer, NIE 0 — und die SLOT-BILANZ über den ganzen Sweep ist dicht
//   (Σ liveCount zurück auf die Baseline · je Gruppe dicht: count == liveCount, Marke i trägt Slot i ·
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
        // DER STRAUCH (Art ohne L0, kindStages [1, 2]): seine L1 ist die einzige Nah-Stufe (aLodLevel 3) — sie blendet
        // nie ein, aber im L1/L2-Band zum Billboard aus. Eigener Ort, eigener Sweep.
        const sx = px + 400,
            sz = pz;
        const sy = r._voxelSurfaceY(sx, sz) || 1;
        const sKey = r._growTreeBlueprintForSpawn("busch_hazel", "w54-strauch-sweep");
        const sEntry = sKey ? r.spawnArchitecture(sKey, { x: sx, y: sy, z: sz }, { silent: true, seed: 3 }) : null;
        res.strauchPreset = sEntry ? r._foundryPresetForEntry(sEntry) : null;
        const sWarm = { 1: false, 2: false };
        const dlS = performance.now() + 120000;
        while (sEntry && performance.now() < dlS && !(sWarm[1] && sWarm[2])) {
            for (const lod of [1, 2]) {
                if (!sWarm[lod]) {
                    const fl = r._foundryFlattenFor(sEntry, res.strauchPreset, lod);
                    if (fl && fl.instanceable) sWarm[lod] = true;
                }
            }
            if (!(sWarm[1] && sWarm[2])) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(120);
            }
        }
        res.strauchWarm = { l1: sWarm[1], l2: sWarm[2] };
        // Der Strauch verlässt die Welt vor der Baseline (die Slot-Bilanz zählt nur den Proben-Baum); der Sweep pflanzt
        // ihn mit warmen Stufen neu und räumt ihn wieder.
        if (sEntry) r.removeArchitecture(sEntry);
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
            // Welle B: der platzierte Bau keyt nach Studio-Geometrie (`f:…`/`fimp:…` am Anfang), die Streu `typ#f:…`;
            // Welle A: der Koerper-Schluessel ist saisonfrei (`f:preset|v|lod:teil` oder `…|lod|ov:…`).
            // Der Schatten-Zwilling der L0 (`…#S`, wirft die L1-Gestalt, kamera-unsichtbar) ist keine Stufe — die L0
            // steht auch AUSSERHALB des Bandes, wo er sonst als L1 zählte.
            if (/#S$/.test(k)) return null;
            if (/(^|#)fimp:/.test(k)) return 2;
            const m = /(^|#)f:[^|]+\|\d+\|(\d)[|:]/.exec(k);
            return m ? +m[2] : null;
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
                    // Die Gruppe ist DICHT (`_archGroupFree` verdichtet): count == liveCount, jede Marke in [0, count)
                    // trägt ihren eigenen Slot, dahinter keine.
                    const n = g.liveCount || 0;
                    if (!g.mesh || g.mesh.count !== n || g.mesh.visible !== n > 0) inconsistent++;
                    for (let i = 0; i < g.slotRef.length; i++) {
                        const ref = g.slotRef[i];
                        if (i < n ? !ref || ref.slot !== i : !!ref) inconsistent++;
                    }
                    for (const se of g.slotEntry) if (se === entry) entryRefs++;
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
            // ════ DIE STUFEN-WAHRHEIT (04.10.): die CPU legt die Stufen nach DERSELBEN Distanz, die die Masken lesen.
            // Je Probe: die residenten Stufen (Primär + Band) mit IHREN Fassaden-Stempeln (aH0/aH0L je Slot), die
            // Masken-Distanz roh × Perf-Streck × min(lodRef/Stempel, 1), die Maske __phytoCore.lodCrossfadeMask über
            // 64 Dither-Werte je Rinde/Laub — ein Wert, den KEINE residente Stufe behält, ist ein LOCH (der Spieler
            // sieht durch den Baum: der gerasterte Geist). Gegenprobe im selben Lauf: der alte Leser (Sichthöhe 0)
            // MUSS Löcher zeigen, sonst ist die Probe blind.
            const core = window.__phytoCore;
            const lodRefLive = Number.isFinite(st.lodRef) && st.lodRef > 0 ? st.lodRef : cfg.lodRef;
            const cfgM = { d0: cfg.thresh01, d1: cfg.thresh12, fade: cfg.fade, fade0: cfg.fade0 };
            // Je residentem Slot: der Fassaden-Stempel (aH0/aH0L) und die Maske, die sein Stoff fährt — aLodLevel 1 =
            // L0-Formel · 2 = L1-Formel · 3 = die einzige Nah-Stufe (nur die Fern-Ausblendung f1o) · 0 = frei; das
            // Billboard (ohne aLodLevel) die fin-Formel mit SEINEM Stempel (seit 04.10. die Höhe der L1; seit dem
            // Karten-Atlas W6 reist er als |aKarte.w| in der EINEN Atlas-Gruppe).
            // Der Schatten-Zwilling (SHADOW_TWIN_LAYER) zählt nicht: die Kamera sieht ihn nie.
            const stempelVon = (ref) => {
                const g = st.archInstanceGroups && st.archInstanceGroups.get(ref.key);
                if (!g || !g.mesh || g.mesh.layers.mask === 1 << A.SHADOW_TWIN_LAYER) return null;
                const a = g.mesh.geometry && g.mesh.geometry.attributes;
                if (a && a.aKarte && a.aKarte.isInstancedBufferAttribute) {
                    const h = Math.abs(a.aKarte.array[ref.slot * 4 + 3]);
                    return { h, hL: h, modus: "fin" };
                }
                if (!a || !a.aH0 || !a.aH0L) return null;
                const al = a.aLodLevel ? a.aLodLevel.array[0] : null;
                const modus = al == null ? "fin" : al > 2.5 ? "l1e" : al > 1.5 ? "l1" : al > 0.5 ? "l0" : "frei";
                return { h: a.aH0.array[ref.slot], hL: a.aH0L.array[ref.slot], modus };
            };
            const MODUS_LOD = { l0: 0, l1: 1, l1e: 1, fin: 2 };
            const lochSweep = (fd, E) => {
                const e0 = E || { entry, px, py, pz };
                st._foliageDensityScale = fd;
                const k = r._lodPerfMul();
                const o = { perf: +k.toFixed(3), proben: 0, loecher: 0, stempelUngleich: 0, modi: {}, beispiel: null };
                for (const raw of [4, 7, 10, 13, 16, 19, 22, 25, 28, 32, 36, 42, 48, 55, 48, 42, 36, 32, 28, 25, 22, 19, 16, 13, 10, 7, 4]) {
                    st.playerMesh.position.set(e0.px - raw, e0.py, e0.pz);
                    r._archLODCursor = 0;
                    for (let i = 0; i < 4; i++) r._tickArchitectureLOD(99);
                    const stufen = new Map();
                    for (const list of [e0.entry.instSlots, e0.entry.instSlotsBand])
                        if (Array.isArray(list))
                            for (const ref of list) {
                                const sp = stempelVon(ref);
                                if (!sp) continue;
                                const e = stufen.get(sp.modus) || { h: 0, hL: Infinity };
                                e.h = Math.max(e.h, sp.h);
                                e.hL = Math.min(e.hL, sp.hL);
                                stufen.set(sp.modus, e);
                                o.modi[sp.modus] = (o.modi[sp.modus] || 0) + 1;
                            }
                    if (!stufen.size) continue;
                    o.proben++;
                    const visH = r._lodTreeVisHeight(e0.entry);
                    for (const [m, e] of stufen)
                        if (m !== "frei" && !(Math.abs(e.h - visH) <= 1e-3 * Math.max(1, visH))) o.stempelUngleich++;
                    for (const fol of [false, true])
                        for (let i = 0; i < 64; i++) {
                            const dh = (i + 0.5) / 64;
                            let behalten = false;
                            for (const [m, e] of stufen) {
                                if (m === "frei") {
                                    behalten = true;
                                    continue;
                                }
                                const dS = raw * k * Math.min(lodRefLive / Math.max(e.h, 1e-3), 1);
                                const dL = raw * k * Math.min(lodRefLive / Math.max(fol ? e.hL : e.h, 1e-3), 1);
                                const z = core.lodCrossfadeMask(dS, dh, cfgM, MODUS_LOD[m], fol, dL);
                                if (m === "l1e" ? z.f1o < dh : z.keep) behalten = true;
                            }
                            if (!behalten) {
                                o.loecher++;
                                if (!o.beispiel)
                                    o.beispiel = { raw, modi: [...stufen.keys()], visH: +visH.toFixed(2), stempel: [...stufen.values()].map((e) => +e.h.toFixed(2)), laub: fol };
                            }
                        }
                }
                return o;
            };
            const fdVor = st._foliageDensityScale;
            if (core && typeof core.lodCrossfadeMask === "function" && typeof r._lodPerfMul === "function") {
                const fdMin = A.PERF_FOLIAGE_DENSITY_MIN;
                res.stufenWahrheit = { voll: lochSweep(1), last: lochSweep(fdMin) };
                const s2 = sKey ? r.spawnArchitecture(sKey, { x: sx, y: sy, z: sz }, { silent: true, seed: 3 }) : null;
                if (s2) {
                    // Der Strauch im selben Gesetz: sein Sweep, voll und unter Last (eigene Architektur-Liste).
                    if (!s2.instanced) r._rebuildArchitectureMesh(s2);
                    st.architectures = [s2];
                    const E = { entry: s2, px: sx, py: sy, pz: sz };
                    res.stufenWahrheit.strauch = { voll: lochSweep(1, E), last: lochSweep(fdMin, E) };
                    r.removeArchitecture(s2); // räumt aus der Sweep-Liste (removeArchitecture sucht dort)
                    st.architectures = [entry];
                }
                const echt = r._lodTreeVisHeight;
                r._lodTreeVisHeight = () => 0; // die Gegenprobe: der Leser vor dem 04.10.
                // voll UND unter Last: der Perf-Streck verdeckt den rohen Leser teilweise (er rückt die Masken näher)
                const g1 = lochSweep(1);
                const g2 = lochSweep(fdMin);
                res.stufenWahrheit.gegenprobe = {
                    perf: g1.perf + "/" + g2.perf,
                    proben: g1.proben + g2.proben,
                    loecher: g1.loecher + g2.loecher,
                    stempelUngleich: g1.stempelUngleich + g2.stempelUngleich,
                    beispiel: g1.beispiel || g2.beispiel,
                };
                delete r._lodTreeVisHeight;
                if (r._lodTreeVisHeight !== echt) res.stufenWahrheit.err = "Leser nicht zurückgesetzt";
                lochSweep(1); // die Stufen auf den echten Leser zurück
            } else res.stufenWahrheit = { err: "__phytoCore.lodCrossfadeMask oder _lodPerfMul fehlt" };
            st._foliageDensityScale = fdVor;
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
        // Blatt-Kappe 24 (Studio): großer Baum (bh 36) bei dr 20 → dnL = 20·min(lodRef/24, 1).
        // Die Erwartung rechnet aus der LIVE-cfg (dasselbe Muster wie stageStudio oben) — die Welt liest die
        // Studio-Distanzen ohne Umweg (thresh01 = d0 = 12 → Kante 4.6, dnL 10 > 4.6 ⇒ Partner L1); der
        // Kappen-Beweis (leafVisCap == 24, NICHT an ref gekoppelt) bleibt hart.
        res.leafCapPartner = r._lodBandPartnerFor(20, 36, 0);
        res.leafCapValue = cfg.leafVisCap;
        {
            const lrLive = Number.isFinite(st.lodRef) && st.lodRef > 0 ? st.lodRef : cfg.lodRef;
            const dnLZ = 20 * Math.min(1, lrLive / Math.min(36, cfg.leafVisCap));
            const kanteZ =
                cfg.thresh01 - (cfg.fade0 || 4) - (Number.isFinite(cfg.hysteresis) ? cfg.hysteresis : 0);
            res.leafCapErwartet = dnLZ > kanteZ ? 1 : null;
            res.leafCapDnL = +dnLZ.toFixed(2);
            res.leafCapKante = +kanteZ.toFixed(2);
        }
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

    // ── ATTRIBUT-WAND (18.07., Schöpfer-Konsole: „Vertex attribute aH0/aH0L/aLodLevel
    // not found" im Dauer-Takt): JEDER Konsument eines Masken-Materials (userData.
    // foundryCrossfade) MUSS die Stempel-Attribute tragen — der Null-Stempel sitzt am
    // EINEN Konversions-Chokepoint (_foundryBuildMesh); der Gruppen-Bau überschreibt
    // mit echten Stufen. Vor der Wand: 957 ungestempelte Meshes (Kreatur-Ofen +
    // Direkt-Konsumenten) → three warnte je RenderObject. ──
    const attrWand = await page.evaluate(() => {
        const r = window.anazhRealm;
        let geprueft = 0,
            verstoesse = 0;
        r.state.scene.traverse((o) => {
            if (!o.geometry || !o.material) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
                if (!(m && m.userData && m.userData.foundryCrossfade === true)) continue;
                geprueft++;
                const a = o.geometry.attributes || {};
                if (!a.aLodLevel || !a.aH0 || !a.aH0L) verstoesse++;
            }
        });
        return { geprueft, verstoesse };
    });

    // ── DIE GNADENFRIST DES LEER-DISPOSE (18.07., zweiter Schöpfer-Trace: +366
    // Gruppen-Re-Mints in 176 s — Familien oszillieren um liveCount 0, der Sofort-
    // Reap machte jede Oszillation zum Voll-Dispose + Re-Mint). Vier Sätze:
    // headless reapt SOFORT (byte-alte Gates) · echt hält die Frist die Hülle ·
    // Realloc in der Frist mintet NICHT neu · der Reaper räumt nach Ablauf. ──
    const gnade = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const st = r.state;
        const o = {};
        let bpName = null;
        for (const n in st.blueprints) {
            const fl = r._archFlattenBlueprint(n);
            if (fl && fl.instanceable && fl.leaves && fl.leaves.length) {
                bpName = n;
                break;
            }
        }
        if (!bpName) return { err: "kein instanzierbarer Bauplan" };
        const mkSlots = () => r._scatterInstanceAdd(bpName, 5000, 10, 5000, 0, 1, null, "999,999");
        let slots = mkSlots();
        if (!slots || !slots.length) return { err: "kein Slot entstanden" };
        const keyA = slots[0].key;
        r._scatterFreeSlots(slots);
        o.hlSofortWeg = !st.archInstanceGroups.has(keyA);
        const _oH = st.renderer._isHeadlessNull;
        st.renderer._isHeadlessNull = false;
        slots = mkSlots();
        const keyB = slots[0].key;
        const mintsVor = r._archGruppenMints;
        r._scatterFreeSlots(slots);
        o.echtBleibt = st.archInstanceGroups.has(keyB);
        slots = mkSlots();
        o.reMintInFrist = r._archGruppenMints - mintsVor;
        r._archLeerReapT = 0;
        r._tickArchGruppenReaper(performance.now() + 2 * (r.constructor.ARCH_LEER_GNADE_MS || 10000));
        o.lebtNachReaper = st.archInstanceGroups.has(keyB);
        r._scatterFreeSlots(slots);
        const g2 = st.archInstanceGroups.get(keyB);
        if (g2) g2._leerSeit = performance.now() - 2 * (r.constructor.ARCH_LEER_GNADE_MS || 10000);
        r._archLeerReapT = 0;
        r._tickArchGruppenReaper(performance.now());
        o.reaperRaeumt = !st.archInstanceGroups.has(keyB);
        st.renderer._isHeadlessNull = _oH;
        return o;
    });

    await browser.close();
    server.close();
    return { out, pageErrors, attrWand, gnade };
}

// DIE SCHATTEN-WAHRHEIT (statisch, auf der kommentar-gestrippten Quelle) → Liste der Verstöße mit Namen.
function schattenWahrheit(srcNC) {
    const v = [];
    const maske = fnBody(srcNC, /_lodCrossfadeMaskNode\(T, opts\)\s*/) || "";
    if (!maske) v.push("_lodCrossfadeMaskNode fehlt");
    else {
        if (/cameraPosition/.test(maske)) v.push("die Foundry-Maske misst von cameraPosition (im Schattenpass die Licht-Kamera)");
        if (!/_lu\.uLodAuge/.test(maske)) v.push("die Foundry-Maske liest das Auge (uLodAuge) nicht");
    }
    if (!/const _cam = _lu\.uLodAuge;/.test(srcNC)) v.push("die Grammatik-Blattmaske misst nicht vom Auge");
    if (!/uLodAuge: _T\.uniform\(/.test(srcNC) || !/camera\.getWorldPosition\(_lu\.uLodAuge\.value\)/.test(srcNC))
        v.push("uLodAuge fehlt im Uniform-Satz oder im Frame-Spiegel aus der Haupt-Kamera");
    const stoff = fnBody(srcNC, /_foundryTreeMaterial\(kind, mp, wiegen\)\s*/) || "";
    if (!stoff) v.push("_foundryTreeMaterial(kind, mp, wiegen) fehlt");
    else {
        const erlaubt = new Set(["TSL.max(haar, wolle)", "mat.opacityNode.mul(_keepX)"]); // Fell-Schale wirft nicht
        for (const m of stoff.matchAll(/mat\.opacityNode = ([^;]+);/g))
            if (!erlaubt.has(m[1].trim())) v.push("werfender Stoff schneidet über opacityNode aus: " + m[1].trim());
    }
    const flat = fnBody(srcNC, /_foundryFlattenFor\(entry, preset, lodOverride\)\s*/) || "";
    if (!/geom: this\._foundrySchattenGeom\(lf\)/.test(flat))
        v.push("der Schatten-Zwilling wirft mit der L1-Gestalt (L1-Stempel: blendet nah aus)");
    const gestalt = fnBody(srcNC, /_foundrySchattenGeom\(lf\)\s*/) || "";
    if (!/setAttribute\(\s*"aLodLevel",\s*new THREE\.BufferAttribute\(new Float32Array\([^)]*\)\.fill\(1\), 1\)\s*\)/.test(gestalt))
        v.push("die Zwillings-Gestalt trägt nicht den L0-Stempel (aLodLevel 1)");
    const weg = fnBody(srcNC, /_disposeFoundryGroupGeom\(g\)\s*/) || "";
    if (!/lf\._schattenGeom\.dispose\(\)/.test(weg)) v.push("die Zwillings-Gestalt fällt nicht mit ihrem L1-Leaf (Leck)");
    if (!/shadowTwin: true,\s*_eigen: false/.test(flat))
        v.push("der Schatten-Zwilling erbt das Eigentum der L1-Geometrie (der L0-Dispose zerstört sie)");
    return v;
}

// DIE PERF-WAHRHEIT (statisch): der Perf-Streck der Wahrnehmungs-Distanz hat ZWEI Leser und EINE Zahl — die CPU-
// Stufenwahl (_lodPerceptionDistance → _lodPerfMul) und jede Shader-Maske (Auge-Distanz × uLodPerf, je Frame aus
// _lodPerfMul gespiegelt). Liest nur die CPU ihn, legt sie unter Last eine Stufe um, die die Maske noch ausblendet.
// Dazu die Sichthöhe: die CPU liest den Foundry-Stempel (_foundrySichtHoehe), den die Maske liest.
function perfWahrheit(srcNC) {
    const v = [];
    const pd = fnBody(srcNC, /_lodPerceptionDistance\(rawDist, visHeight\)\s*/) || "";
    if (!/this\._lodPerfMul\(\)/.test(pd)) v.push("_lodPerceptionDistance liest den Perf-Streck nicht aus _lodPerfMul");
    if (!/_lu\.uLodPerf\.value = this\._lodPerfMul\(\);/.test(srcNC))
        v.push("uLodPerf wird nicht je Frame aus _lodPerfMul gespiegelt");
    const maske = fnBody(srcNC, /_lodCrossfadeMaskNode\(T, opts\)\s*/) || "";
    if (!/const _cd = T\.length\([\s\S]*?\)\.mul\(\s*_lu\.uLodPerf\s*\);/.test(maske))
        v.push("die Stufen-Maske misst die Auge-Distanz ohne uLodPerf");
    if (!/let _vCD = _dist\.mul\(_lu\.uLodPerf\);/.test(maske)) v.push("die Billboard-Maske misst ohne uLodPerf");
    // Der Sichthöhen-Zweig des Billboards rechnet AUF der gestreckten Distanz (bis 04.10. ersetzte er sie durch die rohe).
    if (!/_vCD = _vCD\.mul\(_k\);/.test(maske)) v.push("die Billboard-Maske ersetzt die gestreckte Distanz durch die rohe (Perf-Streck verloren)");
    // Das Billboard liest den Sichthöhen-Stempel seiner Instanz (|aKarte.w| = die Höhe der L1 × Instanz-Skala, dieselbe
    // Zahl wie der aH0-Stempel der L1), nie die Rahmen-Höhe des Bakes.
    if (!/visHeightNode: _karte\.w\.abs\(\),/.test(srcNC))
        v.push("das Billboard misst mit eigener Höhe statt dem Sichthöhen-Stempel der L1 (|aKarte.w|)");
    const flat = fnBody(srcNC, /\n {4}_foundryBuildImpostorFlat\(entry, preset\)\s*\{/) || "";
    if (!/const hz = this\._foundryBaumHoehe\(preset, entry\);/.test(flat) || !/this\._impostorLeaf\(z, this\._foundryWorldScaleMatrix\(preset\), hz\)/.test(flat))
        v.push("die Karte trägt nicht die Höhe der Höhen-Stufe (das Höhen-Buch) als Sichthöhe");
    const stempel = fnBody(srcNC, /\n {4}_lodSlotStamp\(g, slot, scale, occluded, leaf\)\s*\{/) || "";
    if (!/h = leaf\.sicht \* s;/.test(stempel)) v.push("der Slot-Stempel schreibt die Karten-Sichthöhe nicht als Vorlage × Instanz-Skala");
    // Die einzige Nah-Stufe (Strauch: keine L0) blendet zum Billboard aus (aLodLevel 3), nie ungemaskt.
    if (!/_foundryDeclaredStage\(stage\.preset, 0\) === 0\s*\?\s*2\s*:\s*3/.test(srcNC))
        v.push("die L1 einer Art ohne L0 (Strauch) ist ungemaskt — sie blendet nicht zum Billboard aus");
    if (!/_fadeIn\.max\(T\.step\(T\.float\(2\.5\), _aLod\)\)\.mul\(T\.step\(_f1o, _dh\)\)/.test(maske))
        v.push("die Maske kennt die einzige Nah-Stufe nicht (aLodLevel 3: nur die Fern-Ausblendung)");
    const hoehe = fnBody(srcNC, /\n {4}_lodTreeVisHeight\(entry\)\s*\{/) || "";
    if (!/_foundrySichtHoehe\(/.test(hoehe)) v.push("_lodTreeVisHeight liest den Foundry-Stempel nicht (_foundrySichtHoehe)");
    // Ohne bekannte Höhe KEIN Stufen-Urteil (null), nie still 0 (roh, ohne Perf — der alte Geist); die Höhe lebt im
    // Höhen-Buch, nicht im LRU der Geometrie.
    const sicht = fnBody(srcNC, /\n {4}_foundrySichtHoehe\(preset, entry, scale\)\s*\{/) || "";
    if (!/if \(h0 == null\) return null;/.test(sicht)) v.push("_foundrySichtHoehe fällt ohne Höhe still auf 0 (roh) zurück");
    const buch = fnBody(srcNC, /\n {4}_foundryBaumHoehe\(preset, entry\)\s*\{/) || "";
    if (!/f\.hoehen/.test(buch)) v.push("_foundryBaumHoehe liest nicht das Höhen-Buch");
    const satz = fnBody(srcNC, /\n {4}_foundryCacheSet\(key, v\)\s*\{/) || "";
    if (!/f\.hoehen = new Map\(\)\)\)\.set\(key, v\._hoehe\)/.test(satz)) v.push("der Cache-Chokepoint schreibt das Höhen-Buch nicht");
    // Die Blatt-Kappe der CPU gilt der VORLAGE wie der Stempel (aH0L = min(Vorlage, Kappe) × s; Studio phytogenesis
    // bhL = min(H0, Kappe) · sc), nie der skalierten Höhe — und jeder Aufrufer reicht seine Instanz-Skala.
    const partner = fnBody(srcNC, /\n {4}_lodBandPartnerFor\(dist, visH, cur, s\)\s*\{/) || "";
    if (!/Math\.min\(visH \/ sS, capL\) \* sS/.test(partner))
        v.push("die CPU-Blatt-Kappe kappt die skalierte Höhe (min(h·s, 24)) statt der Vorlage (min(h, 24)·s)");
    for (const m of srcNC.matchAll(/this\._lodBandPartnerFor\(([^)]*)\)/g))
        if (m[1].split(",").length < 4) v.push("ein Aufrufer von _lodBandPartnerFor reicht keine Instanz-Skala: " + m[1].trim());
    for (const [name, re] of [
        ["_tickArchitectureLOD", /\n {4}_tickArchitectureLOD\([^)]*\)\s*\{/],
        ["_tickScatterLod", /\n {4}_tickScatterLod\([^)]*\)\s*\{/],
    ]) {
        const b = fnBody(srcNC, re) || "";
        if (!/if \(visH === null\) continue;/.test(b)) v.push(name + " urteilt ohne bekannte Höhe (visH null)");
    }
    return v;
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
        // V3–V5: die drei Schatten-Klassen, je eine zurück in die Quelle → das Schatten-Gesetz MUSS sie nennen.
        const nc = stripComments(anazhSrc);
        const brueche = [
            ["Pass-Kamera", nc.replace("const _auge = _lu.uLodAuge;", "const _auge = T.cameraPosition;")],
            [
                // Der EINE Blatt-Atlas (Laub- und Nadel-Karten, Welle C) färbt mit der Saison-Laubfarbe (Welle A); W5 teilt
                // die Atlas-Farbe durch ihren `wert` — gesucht wird die Alpha-Stelle der Karten-colorNode, zeilenumbruch-fest.
                "Blatt-Alpha in opacityNode",
                // Ersetzer als Funktion: "$11.0$2" lebte von der Rückfall-Regel ($11 fehlt → $1 + "1"), zerbrechlich.
                nc.replace(/(\.mul\(laubFarbe\),\s*)texN\.a(\s*\);)/, (_m, a, b) => a + "1.0" + b + " mat.opacityNode = texN.a;"),
            ],
            ["Zwilling mit L1-Stempel", nc.replace("geom: this._foundrySchattenGeom(lf),", "")],
            ["Zwillings-Gestalt als L1 gestempelt", nc.replace("aLodLevel.count).fill(1), 1)", "aLodLevel.count).fill(2), 1)")],
            ["Zwillings-Gestalt leckt", nc.replace("lf._schattenGeom.dispose();", "")],
            ["Zwilling besitzt L1-Geometrie", nc.replace("_eigen: false,", "")],
        ];
        check("Selbst-Test 3: die echte Quelle hält das Schatten-Gesetz", schattenWahrheit(nc).length === 0, schattenWahrheit(nc).join(" · "));
        for (const [name, src] of brueche) {
            const v = schattenWahrheit(src);
            check(
                `Selbst-Test Schatten: „${name}" → das Gesetz nennt ihn`,
                src !== nc && v.length > 0,
                src === nc ? "ANKER FEHLT — die Injektion trifft die Quelle nicht (Probe nachziehen)" : v.join(" · ")
            );
        }
        check("Selbst-Test Perf: die echte Quelle hält die Perf-Wahrheit", perfWahrheit(nc).length === 0, perfWahrheit(nc).join(" · "));
        for (const [name, src] of [
            ["CPU ohne Perf-Helfer", nc.replace("return rawDist * heightFactor * this._lodPerfMul();", "return rawDist * heightFactor;")],
            ["kein Frame-Spiegel", nc.replace("_lu.uLodPerf.value = this._lodPerfMul();", "")],
            ["Maske ohne Perf", nc.replace(/const _cd = T\.length\(([\s\S]*?)\)\.mul\(\s*_lu\.uLodPerf\s*\);/, "const _cd = T.length($1);")],
            ["Billboard ohne Perf", nc.replace("let _vCD = _dist.mul(_lu.uLodPerf);", "let _vCD = _dist;")],
            ["Billboard-Höhe ersetzt den Streck", nc.replace("_vCD = _vCD.mul(_k);", "_vCD = _dist.mul(_k);")],
            ["Billboard mit Rahmen-Höhe", nc.replace("visHeightNode: _karte.w.abs(),", "visHeightNode: _rahmen.y.mul(_sInst),")],
            [
                "Karte ohne Höhen-Buch",
                nc.replace(
                    "this._impostorLeaf(z, this._foundryWorldScaleMatrix(preset), hz)",
                    "this._impostorLeaf(z, this._foundryWorldScaleMatrix(preset), z.frame.halfH * 2)"
                ),
            ],
            ["Karten-Stempel ohne Instanz-Skala", nc.replace("h = leaf.sicht * s;", "h = leaf.sicht;")],
            ["Strauch-L1 ungemaskt", nc.replace(/(_foundryDeclaredStage\(stage\.preset, 0\) === 0\s*\?\s*2\s*:\s*)3/, (_m, a) => a + "0")],
            ["Maske ohne einzige Nah-Stufe", nc.replace("_fadeIn.max(T.step(T.float(2.5), _aLod)).mul(T.step(_f1o, _dh))", "_fadeIn.mul(T.step(_f1o, _dh))")],
            ["Sichthöhe still 0", nc.replace("if (h0 == null) return null;", "if (h0 == null) return 0;")],
            ["Höhe nur im LRU", nc.replace("if (v && v._hoehe > 0) (f.hoehen || (f.hoehen = new Map())).set(key, v._hoehe);", "")],
            ["LOD-Takt urteilt ohne Höhe", nc.replace("if (visH === null) continue;", "")],
            ["CPU-Blatt-Kappe auf der skalierten Höhe", nc.replace("Math.min(visH / sS, capL) * sS", "Math.min(visH, capL)")],
            ["Streu-Partner ohne Skala", nc.replace("this._lodBandPartnerFor(dist, visH, _curLod, tf.scale)", "this._lodBandPartnerFor(dist, visH, _curLod)")],
            [
                "Sichthöhe aus dem Grammatik-Bauplan",
                nc.replace("return this._foundrySichtHoehe(preset, entry, s);", "return 0;"),
            ],
        ]) {
            const v = perfWahrheit(src);
            check(`Selbst-Test Perf: „${name}" → die Wahrheit nennt ihn`, src !== nc && v.length > 0, v.join(" · "));
        }
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Linse feuert auf jede Verfälschungs-Klasse.");
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
    // Die Config-Heimat-Parität: LOD_DISTANCES-Defaults == Studio-lod-Zahlen (W5, Lehre 19: die Welt liest
    // die Studio-Distanzen, kein Host-Umweg rechnet d0/d1 um — die Defaults gleichen dem Post-Ingest-Wert,
    // headless == live; gate:altlasten haelt den gefallenen Umweg fern).
    const mLD =
        /AnazhRealm\.LOD_DISTANCES = \{[\s\S]*?thresh01:\s*([\d.]+),[\s\S]*?thresh12:\s*([\d.]+),[\s\S]*?fade:\s*([\d.]+),[\s\S]*?fade0:\s*([\d.]+),/.exec(
            anazhSrc
        );
    check(
        "LOD_DISTANCES-Defaults == Studio-lod-Zahlen (thresh01 = d0 · thresh12 = d1 · fade/fade0)",
        !!mLD &&
            +mLD[1] === P.cfg.d0 &&
            +mLD[2] === P.cfg.d1 &&
            +mLD[3] === P.cfg.fade &&
            +mLD[4] === P.cfg.fade0,
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

    const pw = perfWahrheit(anazhNC);
    check("PERF-WAHRHEIT: CPU-Stufenwahl und jede Maske lesen denselben Perf-Streck und dieselbe Sichthöhe", pw.length === 0, pw.join(" · "));
    const sw = schattenWahrheit(anazhNC);
    check(
        "SCHATTEN-WAHRHEIT: Masken vom Auge · kein opacityNode-Ausschnitt an Werfern · Zwilling L0-gestempelt",
        sw.length === 0,
        sw.join(" · ")
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
    const { out, pageErrors, attrWand, gnade } = await runPartB();
    // Die Untergrenze ist die Nicht-Vakuität, nicht die Weltgröße: seit dem Budget-Gesetz (W8) faltet der Ofen die
    // Tier- und Mensch-Gestalt auf ihre Zeile (Tier 13 → 8, Mensch 16 → 8 Meshes) — dieselbe Probe-Welt trägt 69
    // statt 175 Masken-Meshes.
    check(
        "ATTRIBUT-WAND: kein Masken-Material auf ungestempelter Geometrie",
        attrWand && attrWand.verstoesse === 0 && attrWand.geprueft > 50,
        attrWand ? `geprüft=${attrWand.geprueft} · Verstöße=${attrWand.verstoesse}` : "Probe lief nicht"
    );
    check(
        "GNADENFRIST: headless sofort · echt hält die Hülle · Realloc mintet nicht neu · Reaper räumt nach Ablauf",
        gnade &&
            !gnade.err &&
            gnade.hlSofortWeg === true &&
            gnade.echtBleibt === true &&
            gnade.reMintInFrist === 0 &&
            gnade.lebtNachReaper === true &&
            gnade.reaperRaeumt === true,
        gnade ? JSON.stringify(gnade) : "Probe lief nicht"
    );
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
        check("SLOT-BILANZ: je Gruppe dicht (count == liveCount, Marke i trägt Slot i)", B.inconsistentAfter === 0);
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
            "Z: die Blatt-Kappe ist die Studio-24 (phytogenesis Z.2392) und der L1-Partner folgt dem LIVE-Formel-Zwilling",
            out.leafCapValue === 24 && out.leafCapPartner === out.leafCapErwartet,
            `cap=${out.leafCapValue} partner=${out.leafCapPartner} erwartet=${out.leafCapErwartet} (dnL=${out.leafCapDnL} Kante=${out.leafCapKante})`
        );
        check(
            "Z: die SSE-Sichthöhe ist UNGEDECKELT (foundry-core Z.196) — dn(100, 36) = 33.33 (der alte 15-m-Deckel gab 80)",
            Math.abs(out.stretchProbe - 100 * (12 / 36)) < 0.05,
            String(out.stretchProbe)
        );
    } else if (out && !out.err) {
        check("Z (Stufen-Zensus) lief", false, "zensus fehlt");
    }
    const SW = out && out.stufenWahrheit;
    if (SW && !SW.err) {
        const z = (o) => `${o.proben} Proben · Löcher ${o.loecher} · Stempel≠CPU ${o.stempelUngleich} · Perf ×${o.perf}${o.beispiel ? " · z. B. " + JSON.stringify(o.beispiel) : ""}`;
        check(
            "STUFEN-WAHRHEIT: die CPU-Sichthöhe IST der Fassaden-Stempel jeder residenten Stufe (L0 = L1 = Höhen-Stufe)",
            SW.voll.proben >= 8 && SW.voll.stempelUngleich === 0 && SW.last.stempelUngleich === 0,
            z(SW.voll)
        );
        check("STUFEN-WAHRHEIT: kein Loch über den Sweep (volle Leistung)", SW.voll.loecher === 0, z(SW.voll));
        check("STUFEN-WAHRHEIT: kein Loch unter Last (Perf-Streck in CPU UND Maske)", SW.last.proben >= 8 && SW.last.loecher === 0, z(SW.last));
        check(
            "STUFEN-WAHRHEIT Gegenprobe: der alte Leser (Sichthöhe 0) zeigt Löcher — die Probe sieht den Geist",
            SW.gegenprobe.loecher > 0,
            z(SW.gegenprobe)
        );
        check(
            "STUFEN-WAHRHEIT: das Billboard stand im Sweep mit SEINEM Stempel (= die Höhe der L1, kein Rahmen-Modell)",
            (SW.voll.modi.fin || 0) > 0 && (SW.last.modi.fin || 0) > 0,
            JSON.stringify({ voll: SW.voll.modi, last: SW.last.modi })
        );
        const ST = SW.strauch;
        check(
            "STRAUCH: Preset strauch, L1 und Billboard warm",
            out.strauchPreset === "strauch" && out.strauchWarm && out.strauchWarm.l1 && out.strauchWarm.l2,
            JSON.stringify({ preset: out.strauchPreset, warm: out.strauchWarm })
        );
        if (ST) {
            check(
                "STRAUCH: die L1 ist die einzige Nah-Stufe (aLodLevel 3) und trifft das Billboard im Band",
                (ST.voll.modi.l1e || 0) > 0 && (ST.voll.modi.fin || 0) > 0 && !ST.voll.modi.frei,
                JSON.stringify(ST.voll.modi)
            );
            check("STRAUCH: kein Loch, Stempel = CPU-Sichthöhe (volle Leistung)", ST.voll.loecher === 0 && ST.voll.stempelUngleich === 0, z(ST.voll));
            check("STRAUCH: kein Loch unter Last (Perf-Streck)", ST.last.proben >= 8 && ST.last.loecher === 0 && ST.last.stempelUngleich === 0, z(ST.last));
        } else check("STRAUCH-Sweep lief", false, "fehlt");
    } else check("STUFEN-WAHRHEIT lief", false, SW ? SW.err : "fehlt");
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
