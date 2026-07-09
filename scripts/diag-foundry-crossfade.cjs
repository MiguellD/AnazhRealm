// diag-foundry-crossfade.cjs — DIE MASKEN-QUELLEN-LINSE (Paritäts-Vollendung W5.3, Teil (a)).
// Node-pur, OHNE Browser: beweist, dass die EINE geteilte Masken-Quelle
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
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
//   node scripts/diag-foundry-crossfade.cjs [--selftest]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
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

function main() {
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
    // EINEN Quellen (LOD_DISTANCES · uDitherT/uLodMaskOn) — statische Symbol-Wand:
    const anazhNC = stripComments(anazhSrc);
    const tslBody = fnBody(anazhNC, /_lodCrossfadeMaskNode\(T, opts\)\s*/) || "";
    check(
        "TSL-Hälfte (_lodCrossfadeMaskNode): dieselben IGN-Koeffizienten + die EINEN Quellen",
        tslBody.includes(P.dhA) &&
            tslBody.includes(P.dhBx) &&
            tslBody.includes(P.dhBy) &&
            /LOD_DISTANCES/.test(tslBody) &&
            /uDitherT/.test(tslBody) &&
            /uLodMaskOn/.test(tslBody)
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

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE EINE MASKEN-QUELLE STEHT: __phytoCore.lodCrossfadeMask übersetzt die Studio-Dither-Blende (FIX v37) byte-nah — Rinde exakte Partition, Laub überlappende Rampen ohne Loch, Impostor-fin-EINblendung; die Drift-Wand parst die GLSL-Konstanten und hält phyto-core + TSL-Hälfte auf denselben Zahlen."
    );
    process.exit(0);
}

try {
    main();
} catch (e) {
    console.error("Crossfade-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
}
