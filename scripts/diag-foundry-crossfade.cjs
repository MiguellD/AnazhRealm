// diag-foundry-crossfade.cjs — DIE BLENDE DER STUFEN: das EINE Masken-Gesetz
// `__phytoCore.lodCrossfadeMask` (phyto-core) gegen die Studio-Blende, das Fenster der Instanz-Wahl und die lebende Welt.
// Teil (a), Node an der GELADENEN Klasse (`stammLib.ladeKlasse`: die Kerne wie index.html, dann der Stamm) — nie ein
// Quelltext-Zitat:
//   (1) DIE STUDIO-BLENDE LÄUFT: der Fragment-Satz, den foundry-core `injectWind` dem Labor-Stoff einsetzt (Rinde und Laub,
//       mit der Bindung des Wirts aus `PORTAL_RENDER_CONFIG.lod` wie foundry-bruecke), läuft als JS auf dem 64×64-Raster
//       × Band × beiden Metriken (vLodDL = vLodD und 1,6·vLodD) × 2 uDitherT-Phasen: der Dither (`lodDitherIGN`) und jedes
//       keep der Stufen L0/L1 gleichen ihm, Abweichung 0. Ändert das Studio seine Blende, wird die Linse rot.
//   (2) DIE INVARIANTEN DES GESETZES: Rinde = exakte Partition im Partitions-Band (L1 ∪ Karte im Fern-Band, das Billboard
//       liegt tiefen-versetzt), Laub = überlappende Rampen (Union lückenlos, ≥ max der Einzel-Deckung, Band-Anfang
//       ~100 % L0, Band-Ende ~100 % Karte, monoton — auch bei divergenter Blatt-Metrik).
//   (3) DAS FENSTER DER INSTANZ-WAHL: die echten `AnazhRealm._blendeKanten` / `_blendeBehaelt` gegen das Gesetz, je
//       Stufe (L0 · L1 · einzige Nah-Stufe · Karte) × Laub/Rinde × Metrik-Verhältnis × Band-Satz × Distanz-Intervall,
//       Dither-Raster 256 — kein Loch; der Überschuss steht als Zahl.
//   (4) DIE STUFE OHNE BILD: das echte `_instanzFenster` über eine Birke und eine
//       Eiche, 0–60 m, je Stufe — keine Stufe wird gezeichnet, die das Gesetz an der Instanz-Distanz nicht behält, keine
//       fehlt, die es behält.
//   (5) DIE ABSENZEN DER BLENDE über den EINEN Helfer `stammLib.fehlt`: kein Maß von der Licht-Kamera, zum Fragment oder
//       Vertex, keine Stufen-Wahl vom Spieler, kein Ausschnitt über opacityNode, kein Fehler in einer Fenster-Variable,
//       keine Karte unter Wenn.
//   --selftest: ein verschobener Dither und eine verschobene Fern-Rampe des Gesetzes, jede Absenz zurück in ihr Glied,
//   Kanten 1 m nach innen, die Weite der Gestalt als Rand im Fenster — die Linse MUSS jede nennen.
// Teil (b), headless (Null-Renderer, foundry-ON): die CPU-DOPPEL-MITGLIEDSCHAFT im lebenden System — ein Foundry-Baum wird
// über die Schwellen geschoben: im Band hält er Slots in BEIDEN Stufen-Gruppen, außerhalb in EXAKT einer, nie 0, die
// Slot-Bilanz dicht; dazu die Stufen-Wahrheit (Stempel = CPU-Sichthöhe, kein Loch; kein Regler streckt sie, lod.K5), der Strauch, die
// Kette des Gesetzbuchs (Wagen, Tor), der Geister-Baum (Auge, Halt, Schatten-Zwilling, die Streu im Sprung), der Kehraus
// des Wurfs, die Attribut-Wand, die Gnadenfrist, der Spiegel der Blende (die Masken-Uniformen tragen je Bild das CPU-Band)
// und die laute Blende (ohne uLodD0 bricht der Stoff beim Namen).
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
//   node scripts/diag-foundry-crossfade.cjs [--selftest]
"use strict";
const { statikServer, ROOT: root, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");
const vm = require("vm");
const stammLib = require("./lib/stamm.cjs");

const { errs, check } = pruefer();

// ===== TEIL (a): die geladene Klasse, das Gesetz und die Studio-Blende =====
const KLASSE = stammLib.ladeKlasse(root);
const A = KLASSE.AnazhRealm;
const CORE = KLASSE.ctx.__phytoCore;
const CFG = vm.runInContext("PORTAL_RENDER_CONFIG.lod", KLASSE.ctx);
// Die Bindung des Wirts (foundry-bruecke: LOD_* aus PORTAL_RENDER_CONFIG.lod, die Uniform-Sätze), dann der Fragment-Satz,
// den `injectWind` einsetzt — die Blende vom `if(uLodMaskOn` bis zu ihrer Klammer als JS: [keep, _dh].
vm.runInContext(
    "var _lodU = {}, _folDepthU = {}, LOD_D0 = PORTAL_RENDER_CONFIG.lod.d0, LOD_D1 = PORTAL_RENDER_CONFIG.lod.d1, " +
        "LOD_FADE = PORTAL_RENDER_CONFIG.lod.fade, LOD_FADE0 = PORTAL_RENDER_CONFIG.lod.fade0;",
    KLASSE.ctx
);
function studioBlende(laub) {
    const mat = {};
    KLASSE.ctx.injectWind(mat, laub, false, false);
    const sh = { uniforms: {}, vertexShader: "#include <common>\n#include <begin_vertex>", fragmentShader: "void main() {" };
    mat.onBeforeCompile(sh);
    const kopf = /if\(uLodMaskOn[^)]*\)/;
    const block = stammLib.rumpf(sh.fragmentShader, kopf);
    if (!block) throw new Error("die Studio-Blende fehlt im Fragment-Satz von injectWind");
    const js = (sh.fragmentShader.match(kopf)[0] + block)
        .replace(/\bfloat\s+/g, "var ")
        .replace(/\bdiscard\b/g, "return [false, _dh]")
        .replace(/gl_FragCoord\.xy/g, "FC")
        .replace(/\bvec2\(/g, "V(");
    const glsl = "const uLodMaskOn = 1, V = (x, y) => [x, y], dot = (p, q) => p[0] * q[0] + p[1] * q[1], fract = (v) => v - Math.floor(v), ";
    const glsl2 = "clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi), min = Math.min, max = Math.max;\n";
    return new Function("FC", "uDitherT", "vLod", "vLodD", "vLodDL", glsl + glsl2 + js + "\nreturn [true, _dh];");
}
const STUDIO = { rinde: studioBlende(false), laub: studioBlende(true) };

// Das synthetische Dither-Raster: 64×64 Fragment-Zentren (gl_FragCoord = Pixel + 0.5), der Dither des Gesetzes gegen den des
// Studios.
const RAS = 64;
function buildRaster(core, t) {
    const dh = new Float64Array(RAS * RAS);
    let mismatch = 0;
    for (let py = 0; py < RAS; py++)
        for (let px = 0; px < RAS; px++) {
            const a = core.lodDitherIGN(px + 0.5, py + 0.5, t);
            if (a !== STUDIO.rinde([px + 0.5, py + 0.5], t, 1, 0, 0)[1]) mismatch++;
            dh[py * RAS + px] = a;
        }
    return { dh, t, mismatch };
}

// Der Band-Sweep: Distanz-Samples über das ganze Übergangs-Band (+ exakte Kanten).
function bandSamples(cfg) {
    const out = [];
    const lo = cfg.d0 - cfg.fade0 - 4;
    const hi = cfg.d1 + 6;
    for (let d = lo; d <= hi; d += 0.5) out.push(d);
    for (const e of [cfg.d0 - cfg.fade0, cfg.d0 - cfg.fade0 / 2, cfg.d0, cfg.d1 - cfg.fade, cfg.d1 - cfg.fade / 2, cfg.d1])
        if (!out.includes(e)) out.push(e);
    out.sort((a, b) => a - b);
    return out;
}

// Gesetz gegen Studio + Invarianten auf einem Raster: gibt Zähler zurück (für den Selbsttest wiederverwendbar). Die Stufe
// L0 ist im Studio vLod 1 (der vLod<1.5-Zweig), die L1 vLod 2.
function evaluate(core, cfg, raster) {
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
        const f1o = Math.max(0, Math.min(1, ((d - (cfg.d1 - cfg.fade)) / cfg.fade) * 2 - 1));
        const inPartition = f1o <= 0;
        if (inPartition) res.partitionSamples++;
        let c0 = 0,
            c1 = 0,
            c2 = 0,
            holeFol = 0;
        for (let i = 0; i < N; i++) {
            const dh = raster.dh[i];
            const FC = [(i % RAS) + 0.5, Math.floor(i / RAS) + 0.5];
            for (const foliage of [false, true]) {
                const studio = foliage ? STUDIO.laub : STUDIO.rinde;
                for (const dL of foliage ? [d, d * 1.6] : [d]) {
                    const k0 = core.lodCrossfadeMask(d, dh, cfg, 0, foliage, dL).keep;
                    const k1 = core.lodCrossfadeMask(d, dh, cfg, 1, foliage, dL).keep;
                    const k2 = core.lodCrossfadeMask(d, dh, cfg, 2, foliage, dL).keep;
                    if (k0 !== studio(FC, raster.t, 1, d, dL)[0]) res.keepMismatch++;
                    if (k1 !== studio(FC, raster.t, 2, d, dL)[0]) res.keepMismatch++;
                    if (!foliage) {
                        if (inPartition) {
                            if ((k0 ? 1 : 0) + (k1 ? 1 : 0) !== 1) res.barkXorFail++;
                        } else if (!k1 && !k2) res.barkFarHole++;
                        if (!k0 && !k1 && !k2) res.barkUnionHole++;
                    } else {
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
        const union = N - holeFol;
        if (union < Math.max(c0, c1, c2)) res.folUnionLtMax++;
        if (c0 > prevC0 || c2 < prevC2) res.folMonotonic = false;
        prevC0 = c0;
        prevC2 = c2;
        if (d === dists[0]) res.covL0Start = c0 / N;
        if (d === dists[dists.length - 1]) res.covL2End = c2 / N;
    }
    return res;
}

// ===== (3) DAS FENSTER DER INSTANZ-WAHL — die Kanten aus dem Gesetz, kein Loch je Stufe =====
// Die zwei reinen Methoden der Klasse (`static _blendeKanten`, `static _blendeBehaelt`); `verschiebe` fälscht die Kanten
// (Selbsttest).
// die Wahrheit an EINER Distanz: behält die Stufe dort ein Fragment (ein Dither-Wert des Rasters)?
function zeigt(gesetz, stufe, dS, dL, cfg, laub) {
    for (let k = 0; k < 256; k++) {
        const dh = (k + 0.5) / 256;
        if (stufe === 3) {
            if (gesetz(dS, dh, cfg, 1, laub, dL).f1o < dh) return true;
        } else if (gesetz(dS, dh, cfg, stufe === "karte" ? 2 : stufe - 1, laub, dL).keep) return true;
    }
    return false;
}
function fensterLinse(core, cfgs, verschiebe) {
    const gesetz = core.lodCrossfadeMask;
    const out = { proben: 0, loecher: 0, ueberschuss: 0, jeStufe: {}, beispiel: null };
    for (const cfg of cfgs) {
        const K = A._blendeKanten(gesetz, cfg.d0, cfg.d1, cfg.fade, cfg.fade0);
        if (verschiebe) verschiebe(K);
        const dMax = 1.6 * cfg.d1 + cfg.fade;
        for (const stufe of [1, 2, 3, "karte"])
            for (const laub of [true, false])
                for (const q of [1, 0.7, 1.4])
                    for (let a = 0; a <= dMax; a += cfg.d1 / 60)
                        for (const w of [0, 0.4, 2, 6]) {
                            const dSmin = a,
                                dSmax = a + w;
                            let wahr = false;
                            for (let j = 0; j <= 16 && !wahr; j++) {
                                const d = dSmin + ((dSmax - dSmin) * j) / 16;
                                wahr = zeigt(gesetz, stufe, d, q * d, cfg, laub);
                            }
                            const fenster = A._blendeBehaelt(K, stufe, dSmin, dSmax, q * dSmin, q * dSmax, false);
                            out.proben++;
                            const js = out.jeStufe[stufe] || (out.jeStufe[stufe] = { proben: 0, loecher: 0, ueberschuss: 0 });
                            js.proben++;
                            if (wahr && !fenster) {
                                out.loecher++;
                                js.loecher++;
                                if (!out.beispiel) out.beispiel = { stufe, laub, q, dSmin, dSmax, cfg };
                            }
                            if (!wahr && fenster) {
                                out.ueberschuss++;
                                js.ueberschuss++;
                            }
                        }
        // die verdeckte Karte blendet voll: ihr Fenster behält sie überall
        if (!A._blendeBehaelt(K, "karte", 0, 0, 0, 0, true)) out.loecher++;
    }
    return out;
}

// ===== (4) DIE STUFE OHNE BILD — das Fenster der Instanz-Wahl gegen das Gesetz an der Instanz-Distanz =====
// `fenster(g, i, L)` ist das echte `_instanzFenster` (im Selbsttest gewickelt); `this` trägt nur, was eine alte Fassung las
// (die Weite der Gestalt, die Krone der Birke 10 m).
const stumpf = { _instanzWeite: () => ({ r: 10.06, y: 0 }) };
function stufeOhneBildLinse(core, cfg, fenster = (g, i, L) => A.prototype._instanzFenster.call(stumpf, g, i, L)) {
    const gesetz = core.lodCrossfadeMask;
    const K = A._blendeKanten(gesetz, cfg.d0, cfg.d1, cfg.fade, cfg.fade0);
    const perf = 1.21,
        ref = 12;
    const L = { ex: 0, ez: 0, perf, ref, kanten: K, halt: 0 };
    // die Wahrheit an der Instanz-Distanz (`zeigt`, das Laub)
    const zeigtL = (stufe, dS, dL) => zeigt(gesetz, stufe, dS, dL, cfg, true);
    const out = { proben: 0, ohneBild: 0, loecher: 0, beispiel: null, loch: null, jeStufe: {} };
    for (const art of [
        { name: "birke", h: 15.19, s: 0.928 },
        { name: "eiche", h: 18.64, s: 1.147 },
    ])
        for (const stufe of [1, 2, 3, "karte"])
            for (let d = 0; d <= 60; d += 0.1) {
                const s = art.s;
                const hL = Math.min(art.h / s, 24) * s;
                const g = {
                    wahlStufe: stufe,
                    mesh: {
                        instanceMatrix: { array: [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, d, 1] },
                        matrixWorld: { elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                        geometry: {
                            attributes: { aH0: { array: [art.h] }, aH0L: { array: [hL] }, aKarte: { array: [0, 1.2, 4, art.h] } },
                        },
                    },
                };
                const dS = d * perf * Math.min(ref / art.h, 1),
                    dL = d * perf * Math.min(ref / hL, 1);
                const zeichnet = fenster(g, 0, L);
                const wahr = zeigtL(stufe, dS, dL);
                // die Kanten stehen per Bisektion auf 1 mm an der äußeren Grenze (`_blendeKanten`): 1 cm Wahrnehmungs-Distanz
                // um die Instanz ist die Toleranz des Gesetzes, kein Bild ohne Stufe
                const wahrNah = wahr || zeigtL(stufe, dS - 0.01, dL - 0.01) || zeigtL(stufe, dS + 0.01, dL + 0.01);
                out.proben++;
                if (zeichnet && !wahrNah) {
                    out.ohneBild++;
                    const b = { art: art.name, stufe, d: +d.toFixed(1), dL: +dL.toFixed(2) };
                    if (!out.beispiel) out.beispiel = b;
                    if (!out.jeStufe[stufe]) out.jeStufe[stufe] = b;
                }
                if (!zeichnet && wahr) {
                    out.loecher++;
                    if (!out.loch) out.loch = { art: art.name, stufe, d: +d.toFixed(1) };
                }
            }
    return out;
}

// ===== (5) DIE ABSENZEN DER BLENDE — [Name, Glied (null = der ganze Stamm), Anti-Muster, Täter für den Selbsttest] =====
const ABSENZEN = [
    ["SCHATTEN: die Foundry-Maske misst nie von cameraPosition (im Schattenpass die Licht-Kamera)", "_lodCrossfadeMaskNode", /cameraPosition/, "T.cameraPosition"],
    [
        "SCHATTEN: kein Foundry-Stoff schneidet über opacityNode aus (der r184-Schattenpass liest ihn nie; nur die Blende multipliziert)",
        "_foundryTreeMaterial",
        /mat\.opacityNode = (?!mat\.opacityNode\.mul\(_keepX\);)/,
        "mat.opacityNode = TSL.float(1)",
    ],
    ["MASS: die Foundry-Maske misst nie zum Fragment (positionWorld.x/z)", "_lodCrossfadeMaskNode", /positionWorld\.[xz]/, "T.positionWorld.x"],
    ["MASS: keine Blattmaske misst zum Vertex (_cam.x.sub(_pw.x))", null, /_cam\.x\.sub\(_pw\.x\)/, "_cam.x.sub(_pw.x)"],
    [
        "AUGE: keine Stufen-Wahl misst vom Spieler statt vom Auge der Maske",
        ["_tickArchitectureLOD", "_archStufeUrteil", "_switchArchitectureLOD", "_foundryLodForEntry", "_updateFoundryLodBand"],
        /playerMesh/,
        "this.state.playerMesh",
    ],
    ["LAUT: kein Fehler der Blende landet still in einer Fenster-Variable", null, /__foundryCrossfadeError|__lodCrossfadeError/, "window.__lodCrossfadeError = 1"],
    ["LAUT: die Karte zeichnet nie ohne Maske weiter (if (_keepFin))", null, /if \(_keepFin\)/, "if (_keepFin) {}"],
];
// der Täter am Kopf seines (ersten) Glieds — im ganzen Stamm am Kopf der Maske
function mitTaeter(glied, taeter) {
    const g = [].concat(glied || "_lodCrossfadeMaskNode")[0];
    return (t) => t.replace(new RegExp("(\\n {4}" + g + "\\([^)]*\\)\\s*\\{)"), "$1 " + taeter + ";");
}

// ===== TEIL (b) — W5.4: die CPU-Doppel-Mitgliedschaft im lebenden System (headless) =====
async function runPartB() {
    const server = statikServer();
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 240000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = { samples: [], err: null };
        // ── Boot + Foundry abwarten ──
        await window.__weltDa();
        const A = r.constructor;
        res.flagDefault = st.foundryCrossfade === true; // W5.4 — Maske+Band DEFAULT AN
        const D = A.LOD_DISTANCES; // K2: die Laufzeit-Marke der EINEN Distanz-Quelle (Bänder aus dem Kern, Schwellen aus dem Gesetz)
        res.lodLive = D ? [D.thresh01, D.thresh12, D.fade, D.fade0] : null;
        const lodRef0 = st.lodRef > 0 ? st.lodRef : D.lodRef;
        res.lodGesetz = [r._wechselAbstand("tree", 1, lodRef0), r._wechselAbstand("tree", 2, lodRef0)];
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready);
        // ── der Proben-Baum (gewachsener Bauplan, ferner Fix-Spot) ──
        const grownKey = r._growTreeBlueprintForSpawn("baum_eiche", "w54-band-sweep");
        const px = 12345,
            pz = 6789;
        const py = r._voxelSurfaceY(px, pz) || 1;
        const entry = r.spawnArchitecture(grownKey, { x: px, y: py, z: pz }, { silent: true, seed: 1 });
        if (!entry) return { err: "spawnArchitecture gab null" };
        const preset = r._foundryPresetForEntry(entry);
        res.preset = preset;
        // die Gestalt des Orts wartet auf den Plan seines Walds (K69: die Schlange des Walds plant im Takt) — die Probe
        // pumpt die Schlange, bis sie steht: die Wärme-Frist unten zählt dann nur Bauten, nie den Plan (Lehre 26)
        for (let i = 0; i < 2000 && r._foundryGestaltFor(entry, preset) == null; i++) {
            r._tickWaldPlan(Infinity);
            await sleep(0); // der Wald-Faden rechnet die Schlange (K60-4)
        }
        res.gestalt = r._foundryGestaltFor(entry, preset);
        // ── ALLE drei Stufen VOR der Baseline wärmen (kein Rewarm-Störer im Sweep):
        //    flatten(0/1/2) bis truthy; der Loop-Pump treibt Worker-Replies + Impostor-Bake. ──
        const warm = { 0: false, 1: false, 2: false };
        const loopTakt = async () => {
            try {
                r._gameLoopTick(performance.now());
            } catch {}
            await sleep(120);
        };
        const waerme = (name, e, preset, stufen, w) =>
            window
                .__gebautNach(name, {
                    fertig: () => {
                        for (const l of stufen)
                            if (!w[l]) {
                                const fl = r._foundryFlattenFor(e, preset, l);
                                w[l] = !!(fl && fl.instanceable);
                            }
                        return stufen.every((l) => w[l]);
                    },
                    takt: loopTakt,
                    max: 1000,
                });
        await waerme(`${preset} L0–L2`, entry, preset, [0, 1, 2], warm);
        res.warm = { l0: warm[0], l1: warm[1], l2: warm[2] };
        if (!(warm[0] && warm[1] && warm[2])) return res;
        // DIE STREU IM SPRUNG (F1 a, gemessen in (10)): die Geburt der Region vom Kopf des Spielers (der alte Ort der Wahl
        // von Stufe und Band), die Kamera 24 m näher an ihren ersten Reihen (die Schicht füllt ihr Maß von z = 0 an; sie
        // stehen 64–86 m vor dem Spieler, über der Karte ohne Partner). Stufen und Partner wärmen VOR der Baseline (die
        // Schleife backt, was die Geburt bestellt; eine kalte L1 serviert still die Karte); die Messung räumt die Region.
        const SC = A.SCATTER;
        const [srx, srz] = [Math.floor(px / SC.regionM), Math.floor(pz / SC.regionM)];
        const streuOrte = Array.from({ length: 12 }, (_, i) => srz * SC.regionM + 64 + 2 * i);
        const streuGeburt = (z, ohneHalt) => {
            st.playerMesh.position.set(px, py, z);
            st.camera.position.set(px, py + 3, z - 24);
            st.camera.updateMatrixWorld(true);
            r._lodAuge = function () {
                const p = this.state.playerMesh.position;
                return new window.THREE.Vector3(p.x, p.y + A.EGO_AUGE_M, p.z);
            };
            // der Selbsttest: kein Slot trägt den Halt (der Stand vor F1 a — die Zelle ohne Partner dithert ins Nichts)
            if (ohneHalt)
                r._scatterInstanceAdd = function (bp, x, y, z2, yaw, s, tint, rk, flat) {
                    return A.prototype._scatterInstanceAdd.call(this, bp, x, y, z2, yaw, s, tint, rk, flat, false);
                };
            try {
                r._disposeScatterRegion(`${srx},${srz}`);
                return r._scatterRegion(srx, srz, st.playerMesh.position);
            } finally {
                delete r._lodAuge;
                delete r._scatterInstanceAdd;
            }
        };
        const [streuCam, streuPm] = [st.camera.position.clone(), st.playerMesh.position.clone()];
        const streuZurueck = () => {
            r._disposeScatterRegion(`${srx},${srz}`);
            st.camera.position.copy(streuCam);
            st.camera.updateMatrixWorld(true);
            st.playerMesh.position.copy(streuPm);
        };
        await window
            .__gebautNach("die Streu-Zellen in L1 und L2", {
                fertig: () => {
                    let kalt = false;
                    for (const z of streuOrte) {
                        const reg = streuGeburt(z, false);
                        kalt = kalt || !reg || reg._deferredFoundry === true;
                        for (const c of (reg && reg.cells) || []) {
                            if (!Number.isFinite(c.dient)) continue;
                            const L = SC.layers.find((l) => l.name === c.layer);
                            const tf = r._scatterCellTransform(c.cellX, c.cellZ, c.cellM, L.scaleBase, L.scaleVar);
                            const wo = { seed: r._scatterFoundrySeed(c.cellX, c.cellZ, c.variantIndex, c.species, tf), wo: tf };
                            for (const l of [1, 2]) {
                                const fl = r._foundryFlattenFor(wo, r._foundryPresetFor(c.species), l);
                                kalt = kalt || !(fl && fl.instanceable);
                            }
                        }
                    }
                    streuZurueck();
                    return !kalt;
                },
                takt: async () => (r._tickWaldPlan(Infinity), await loopTakt()),
                max: 500,
            });
        // DER STRAUCH (kindStages [0, 1, 2], die Kette wie der Baum): Nah-Stufe L0 (aLodLevel 1), Mittel-Stufe L1
        // (aLodLevel 2) und das Billboard. Eigener Ort,
        // eigener Sweep.
        const sx = px + 400,
            sz = pz;
        const sy = r._voxelSurfaceY(sx, sz) || 1;
        const sKey = r._growTreeBlueprintForSpawn("busch_hazel", "w54-strauch-sweep");
        const sEntry = sKey ? r.spawnArchitecture(sKey, { x: sx, y: sy, z: sz }, { silent: true, seed: 3 }) : null;
        res.strauchPreset = sEntry ? r._foundryPresetForEntry(sEntry) : null;
        const sWarm = { 0: false, 1: false, 2: false };
        if (sEntry) await waerme(`${res.strauchPreset} L0–L2`, sEntry, res.strauchPreset, [0, 1, 2], sWarm);
        res.strauchWarm = { l0: sWarm[0], l1: sWarm[1], l2: sWarm[2] };
        // Der Strauch verlässt die Welt vor der Baseline (die Slot-Bilanz zählt nur den Proben-Baum); der Sweep pflanzt
        // ihn mit warmen Stufen neu und räumt ihn wieder.
        if (sEntry) r.removeArchitecture(sEntry);
        // DIE KETTE DES GESETZBUCHS: Wagen und Tor tragen ihre
        // Stufen-Kette im Gesetzbuch — der Wagen [0, 1] und die Karte (KIND_POLICY.impostor), das Tor [0, 1] nach den Grenzen
        // seines Kerns (B2c `ab`, keine Karte; die 3 ist NUR-WURF und wird nie gezeigt). Eigene Orte; JEDE gezeigte Stufe (und
        // die Karte der Karten-Art) wärmt hier, der Sweep pflanzt sie neu und räumt sie.
        res.kette = [];
        for (const [typ, dx] of [
            ["fahrzeug_gt", 800],
            ["tor_drachentor", 1200],
        ]) {
            const ox = px + dx,
                oz = pz;
            const oy = r._voxelSurfaceY(ox, oz) || 1;
            const oE = r.spawnArchitecture(typ, { x: ox, y: oy, z: oz }, { silent: true, seed: 5 });
            const oPreset = oE ? r._foundryPresetForEntry(oE) : null;
            const stufen = oPreset ? r._foundryKindStages(oPreset) : null;
            const gezeigt = (stufen || []).filter((s) => !r._foundryNurWurf(oPreset, s));
            const karte = !!oPreset && r._foundryPresetIsTree(oPreset);
            const ziel = gezeigt.concat(karte ? [2] : []);
            const warm = {};
            const alleWarm = () => ziel.length > 0 && ziel.every((s) => warm[s] === true);
            if (oE && oPreset) await waerme(`${oPreset} ${ziel.join("/")}`, oE, oPreset, ziel, warm);
            const rec = oPreset && f.recipes ? f.recipes[oPreset] : null;
            res.kette.push({
                typ,
                preset: oPreset,
                warm,
                alleWarm: alleWarm(),
                stufen,
                gezeigt,
                karte,
                satzArt: !!(rec && A.BAU_SATZ[rec.kind]),
                ort: { x: ox, y: oy, z: oz },
            });
            if (oE) r.removeArchitecture(oE);
        }
        // Quieszenz: keine offenen Worker-Anfragen mehr → keine async-Placements im Sweep.
        await window.__weltDa(() => !(f.pending && f.pending.size > 0));
        res.pendingAtSweep = f.pending ? f.pending.size : -1;

        // ════ AB HIER SYNCHRON (ein Block, kein await → keine Interleaves) ════
        const cfg = A.LOD_DISTANCES;
        const M = cfg.hysteresis;
        const visH = r._lodTreeVisHeight(entry);
        const capL = cfg.leafVisCap;
        const factor = r._lodPerceptionDistance(1000, visH) / 1000; // linear → skalierbar
        res.visH = visH;
        res.factor = factor;
        const stageOfKey = (k) => {
            // der platzierte Bau keyt nach Studio-Geometrie (`f:…`/`fimp:…` am Anfang), die Streu `typ#f:…`;
            // der Koerper-Schluessel ist saisonfrei (`f:preset|v|lod:teil` oder `…|lod|ov:…`).
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
                for (let k = 0; k < 4; k++) r._tickArchitectureLOD(99, st.playerMesh.position); // Switch + Band-Pflege (idempotent), das Auge = der Proben-Ort
                const dn = r._lodPerceptionDistance(raw, visH);
                const dnL = r._lodPerceptionDistance(raw, Math.min(visH, capL));
                const inB01 = dnL > cfg.thresh01 - cfg.fade0 - M && dn < cfg.thresh01 + M;
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
            // ════ DIE STUFEN-WAHRHEIT: die CPU legt die Stufen nach DERSELBEN Distanz, die die Masken lesen.
            // Je Probe: die residenten Stufen (Primär + Band) mit IHREN Fassaden-Stempeln (aH0/aH0L je Slot), die
            // Masken-Distanz roh × Streck der Ankunft × min(lodRef/Stempel, 1), die Maske __phytoCore.lodCrossfadeMask über
            // 64 Dither-Werte je Rinde/Laub — ein Wert, den KEINE residente Stufe behält, ist ein LOCH (der Spieler
            // sieht durch den Baum: der gerasterte Geist). Gegenprobe im selben Lauf: der alte Leser (Sichthöhe 0)
            // MUSS Löcher zeigen, sonst ist die Probe blind.
            const core = window.__phytoCore;
            const lodRefLive = Number.isFinite(st.lodRef) && st.lodRef > 0 ? st.lodRef : cfg.lodRef;
            const cfgM = { d0: cfg.thresh01, d1: cfg.thresh12, fade: cfg.fade, fade0: cfg.fade0 };
            // Je residentem Slot: der Fassaden-Stempel (aH0/aH0L) und die Maske, die sein Stoff fährt — aLodLevel 1 =
            // L0-Formel · 2 = L1-Formel · 3 = die einzige Nah-Stufe (nur die Fern-Ausblendung f1o) · 0 = frei; das
            // Billboard (ohne aLodLevel) die fin-Formel mit SEINEM Stempel (die Höhe der L1, als |aKarte.w| in der EINEN
            // Atlas-Gruppe).
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
            // Die Löcher einer Probe: je Rinde/Laub × 64 Dither-Werte einer, den KEINE gezeichnete Stufe behält (der Halt —
            // |aH0L| mit Vorzeichen — zeichnet voll, „frei" ist ungemaskt); ohne gezeichnete Stufe alle 128.
            const lochZahl = (stufen, raw, k) => {
                if (!stufen.size) return 128;
                let n = 0;
                for (const fol of [false, true])
                    for (let i = 0; i < 64; i++) {
                        const dh = (i + 0.5) / 64;
                        let behalten = false;
                        for (const [m, e] of stufen) {
                            if (m === "frei" || e.halt) {
                                behalten = true;
                                break;
                            }
                            const dS = raw * k * Math.min(lodRefLive / Math.max(e.h, 1e-3), 1);
                            const dL = raw * k * Math.min(lodRefLive / Math.max(fol ? e.hL : e.h, 1e-3), 1);
                            const z = core.lodCrossfadeMask(dS, dh, cfgM, MODUS_LOD[m], fol, dL);
                            if (m === "l1e" ? z.f1o < dh : z.keep) {
                                behalten = true;
                                break;
                            }
                        }
                        if (!behalten) n++;
                    }
                return n;
            };
            const lochSweep = (E) => {
                const e0 = E || { entry, px, py, pz };
                const k = r._ankunftsFerne(); // der Streck der Wahrnehmung (kein Regler, lod.K5)
                const o = { proben: 0, loecher: 0, stempelUngleich: 0, modi: {}, beispiel: null };
                for (const raw of [4, 7, 10, 13, 16, 19, 22, 25, 28, 32, 36, 42, 48, 55, 48, 42, 36, 32, 28, 25, 22, 19, 16, 13, 10, 7, 4]) {
                    st.playerMesh.position.set(e0.px - raw, e0.py, e0.pz);
                    r._archLODCursor = 0;
                    for (let i = 0; i < 4; i++) r._tickArchitectureLOD(99, st.playerMesh.position);
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
                    const n = lochZahl(stufen, raw, k);
                    o.loecher += n;
                    if (n && !o.beispiel) o.beispiel = { raw, modi: [...stufen.keys()], visH: +visH.toFixed(2), stempel: [...stufen.values()].map((e) => +e.h.toFixed(2)) };
                }
                return o;
            };
            if (core && typeof core.lodCrossfadeMask === "function") {
                res.stufenWahrheit = { voll: lochSweep() };
                const s2 = sKey ? r.spawnArchitecture(sKey, { x: sx, y: sy, z: sz }, { silent: true, seed: 3 }) : null;
                if (s2) {
                    // Der Strauch im selben Gesetz: sein Sweep (eigene Architektur-Liste).
                    if (!s2.instanced) r._rebuildArchitectureMesh(s2);
                    st.architectures = [s2];
                    const E = { entry: s2, px: sx, py: sy, pz: sz };
                    res.stufenWahrheit.strauch = { voll: lochSweep(E) };
                    r.removeArchitecture(s2); // räumt aus der Sweep-Liste (removeArchitecture sucht dort)
                    st.architectures = [entry];
                }
                // DIE KETTE DES GESETZBUCHS im selben Gesetz: je Probe die GEZEICHNETEN Stufen — eine Instanz-Gruppe mit
                // ihren Instanz-Stempeln, ein Bereich des Bau-Satzes mit den Stempeln JE ECKE seiner Zelle (die Satz-Gruppe
                // zeichnet nie: sie ist Slot-Wahrheit, gezeichnet wird ihr Bereich im Satz ihres Stoffs, `_bauSatzArt`). Eine
                // Zelle, die der Satz nicht trägt (Satz verborgen, Bereich oder Zelle fehlt, die Zelle liegt nicht an ihrer
                // Instanz), zeichnet nichts; eine Probe ohne gezeichnete Stufe ist ein Loch (die Gestalt fort — 1,5–55 m liegen vor
                // jeder Fernform; ab 1,5 m, weil der Wagen am Gesetz des Schirms schon ab 2,7 m seine L1 trägt, lod.K5). Der alte
                // Leser (nur die Gruppen-Stempel) rechnet daneben: die Gegenprobe, die er nicht sah.
                const satzStempel = (g, ref, o) => {
                    const S = st.chunkSaetze ? st.chunkSaetze.get(g.satz) : null;
                    const b = S ? S.bloecke.get(g.key) : null;
                    const z = b && b.zellen ? b.zellen[ref.slot] : null;
                    let anDerInstanz = false;
                    if (z && !z.huelle.isEmpty()) {
                        const T3 = window.THREE;
                        if (!g.geom.boundingBox) g.geom.computeBoundingBox();
                        const soll = g.geom.boundingBox
                            .clone()
                            .applyMatrix4(new T3.Matrix4().fromArray(g.mesh.instanceMatrix.array, ref.slot * 16));
                        anDerInstanz = soll.containsPoint(z.huelle.getCenter(new T3.Vector3()));
                    }
                    if (!S || S.verborgen || !b || !anDerInstanz) {
                        o.zelleFehlt++;
                        if (!o.fehltBeispiel)
                            o.fehltBeispiel = {
                                satz: String(g.satz).split("|")[0],
                                key: String(g.key).slice(0, 48),
                                slot: ref.slot,
                                bereich: !!b,
                                zellen: b && b.zellen ? b.zellen.length : 0,
                            };
                        return null;
                    }
                    o.satzZellen++;
                    const at = b.geom.attributes;
                    let al = null,
                        h = 0,
                        hL = 0;
                    for (let i = 0; i < z.idx.length; i++) {
                        const v = z.idx[i] - b.vStart;
                        const a = at.aLodLevel.array[v],
                            hh = at.aH0.array[v],
                            hl = at.aH0L.array[v];
                        if (al === null) {
                            al = a;
                            h = hh;
                            hL = hl;
                        } else if (a !== al || hh !== h || hl !== hL) {
                            o.eckeUngleich++;
                            break;
                        }
                    }
                    return { h, hL, modus: al > 2.5 ? "l1e" : al > 1.5 ? "l1" : al > 0.5 ? "l0" : "frei" };
                };
                const kettenSweep = (E) => {
                    const k = r._ankunftsFerne();
                    const o = {
                        proben: 0,
                        loecher: 0,
                        leer: 0,
                        altLoecher: 0,
                        satzZellen: 0,
                        zelleFehlt: 0,
                        eckeUngleich: 0,
                        stempelUngleich: 0,
                        modi: {},
                        stufen: {},
                        beispiel: null,
                        fehltBeispiel: null,
                    };
                    const dazu = (M, sp) => {
                        const e = M.get(sp.modus) || { h: 0, hL: Infinity, halt: false };
                        e.h = Math.max(e.h, sp.h);
                        e.hL = Math.min(e.hL, Math.abs(sp.hL));
                        e.halt = e.halt || sp.hL < 0;
                        M.set(sp.modus, e);
                    };
                    for (const raw of [1.5, 4, 7, 10, 13, 16, 19, 22, 25, 28, 32, 36, 42, 48, 55, 48, 42, 36, 32, 28, 25, 22, 19, 16, 13, 10, 7, 4, 1.5]) {
                        st.playerMesh.position.set(E.px - raw, E.py, E.pz);
                        r._archLODCursor = 0;
                        for (let i = 0; i < 4; i++) r._tickArchitectureLOD(99, st.playerMesh.position);
                        r._tickBauSatz(Infinity); // der Render legt die Bereiche vor dem Zeichnen (`_tickChunkSatz`), ohne Raten
                        const neu = new Map(),
                            alt = new Map();
                        for (const list of [E.entry.instSlots, E.entry.instSlotsBand])
                            if (Array.isArray(list))
                                for (const ref of list) {
                                    const g = st.archInstanceGroups && st.archInstanceGroups.get(ref.key);
                                    if (!g || !g.mesh || g.shadowTwin || g.mesh.layers.mask === 1 << A.SHADOW_TWIN_LAYER) continue;
                                    const spAlt = stempelVon(ref);
                                    if (spAlt) dazu(alt, spAlt);
                                    const sp = g.satz ? satzStempel(g, ref, o) : spAlt;
                                    if (!sp) continue;
                                    dazu(neu, sp);
                                    o.modi[sp.modus] = (o.modi[sp.modus] || 0) + 1;
                                    const s = stageOfKey(ref.key);
                                    if (s !== null) o.stufen[s] = (o.stufen[s] || 0) + 1;
                                }
                        o.proben++;
                        const visH = r._lodTreeVisHeight(E.entry);
                        for (const [m, e] of neu)
                            if (m !== "frei" && !(Math.abs(e.h - visH) <= 1e-3 * Math.max(1, visH))) o.stempelUngleich++;
                        const n = lochZahl(neu, raw, k);
                        if (!neu.size) o.leer++;
                        o.loecher += n;
                        o.altLoecher += lochZahl(alt, raw, k);
                        if (n > 0 && !o.beispiel)
                            o.beispiel = { raw, modi: [...neu.keys()], primaer: E.entry._lodLevel, band: Number.isFinite(E.entry._lodBandLevel) ? E.entry._lodBandLevel : null, loecher: n };
                    }
                    return o;
                };
                // Ein Lauf der Kette; `gegen` = der Täter des Selbsttests im selben Lauf: "partner" — die L1 lädt nie und die Stufe
                // hält nicht (der Stand vor K36: die L0 dithert zu einer Stufe, die es nicht gibt); "satz" — der Bau-Satz folgt der
                // Stufe nicht (die Marke `_bauSatzMarke` stumm: die Gruppe wechselt, ihr Bereich im Satz nie).
                // der Stand vor K36 (die Täter beider Selbsttests): keine Stufe hält, nur die verdeckte Karte blendet voll
                const ohneHaltVoll = function (e, band, bl = e._lodBandLevel) {
                    const karte = e._occluded === true || e._bruecke === true;
                    return band ? karte && bl === 2 : karte;
                };
                const kettenLauf = (op, gegen) => {
                    if (gegen === "satz") r._bauSatzMarke = function () {};
                    if (gegen === "partner") {
                        r._foundryFlattenFor = function (e, p, lod) {
                            return p === op.preset && lod === 1 ? null : A.prototype._foundryFlattenFor.call(this, e, p, lod);
                        };
                        r._lodSlotVoll = ohneHaltVoll;
                    }
                    let o2 = null;
                    try {
                        o2 = r.spawnArchitecture(op.typ, op.ort, { silent: true, seed: 5 });
                        if (!o2) return null;
                        if (!o2.instanced) r._rebuildArchitectureMesh(o2);
                        st.architectures = [o2];
                        const E = { entry: o2, px: op.ort.x, py: op.ort.y, pz: op.ort.z };
                        return gegen ? kettenSweep(E) : { voll: kettenSweep(E) };
                    } finally {
                        delete r._bauSatzMarke;
                        delete r._foundryFlattenFor;
                        delete r._lodSlotVoll;
                        if (o2) r.removeArchitecture(o2);
                        st.architectures = [entry];
                        // der Satz zurück auf die Wahrheit seiner Gruppen: jeder Bereich jeder Bau-Satz-Art und jede Satz-Gruppe
                        for (const [art, S] of st.chunkSaetze || [])
                            if (st.satzStoffe && st.satzStoffe.has(art)) for (const key of S.bloecke.keys()) r._bauSatzMarke(key, art);
                        for (const g of (st.archInstanceGroups || new Map()).values()) if (g.satz) r._bauSatzMarke(g.key, g.satz);
                        r._tickBauSatz(Infinity);
                    }
                };
                for (const op of res.kette || []) {
                    if (!op.alleWarm) continue;
                    const lauf = kettenLauf(op, null);
                    if (lauf) op.voll = lauf.voll;
                    op.gegenPartner = kettenLauf(op, "partner");
                    if (op.satzArt) op.gegenSatz = kettenLauf(op, "satz");
                }
                const echt = r._lodTreeVisHeight;
                r._lodTreeVisHeight = () => 0; // die Gegenprobe: der alte Leser
                res.stufenWahrheit.gegenprobe = lochSweep();
                delete r._lodTreeVisHeight;
                if (r._lodTreeVisHeight !== echt) res.stufenWahrheit.err = "Leser nicht zurückgesetzt";
                lochSweep(); // die Stufen auf den echten Leser zurück
                // ════ (10) DER GEISTER-BAUM: keine Instanz steht halb maskiert. Die DECKUNG je Klasse (Rinde, Laub;
                // die Karte deckt beide) = der Anteil der Dither-Werte, den eine gezeichnete Stufe behält — gelesen aus
                // den Stempeln wie die Maske (|aH0L|, sein Vorzeichen = der HALT; aKarte.w, negativ = voll), gemessen vom
                // AUGE. Sie ist 0 oder 1; dazwischen steht ein Geist (unter TRAA halb durchsichtig), 0 bei gezeichneten
                // Stufen ist ein Loch. Zwei Täter-Klassen: (a) der Partner LÄDT (die Karte bäckt — `_foundryFlattenFor`
                // reicht für sie null): die L1 wich dem Nichts; (b) das Auge steht NEBEN dem Spieler (die Verfolger-
                // Kamera, Arm 9,6 m): die Wahl maß vom Spieler, die Maske vom Auge. Selbsttest im selben Lauf: der Halt
                // fällt stumm (`_lodHaltSetzen`) bzw. die Wahl misst vom Spieler — die Linse MUSS Geister zählen.
                // DER SCHATTEN-ZWILLING (K36 N1) gehört zur Klasse: das Gesetz — die Karte wirft nicht, der Wurf folgt der
                // GEZEICHNETEN 3D-Gestalt: wo sie voll steht (auch im Halt), wirft der Zwilling voll, wo sie zur Karte
                // ausblendet, blendet sein Wurf mit (dieselbe f1o-Rampe), ohne 3D-Stufe wirft nichts. Ein SCHATTEN-GEIST =
                // die Deckung des Zwillings ≠ die Deckung der gezeichneten 3D-Stufen (der Halbschatten unter dem vollen Baum,
                // der Wurf eines Baums, der nicht steht). Selbsttest: der Zwilling ohne Halt im Stempel — die Linse MUSS ihn zählen.
                let zwBekannt = false;
                const deckungAm = (e0, auge) => {
                    const lu = st.lodUniforms;
                    const ref = lu && lu.uLodRef ? lu.uLodRef.value : lodRefLive;
                    const k = r._ankunftsFerne();
                    const teile = [];
                    for (const list of [e0.instSlots, e0.instSlotsBand]) {
                        if (!Array.isArray(list)) continue;
                        for (const s of list) {
                            const g = st.archInstanceGroups && st.archInstanceGroups.get(s.key);
                            if (!g || !g.mesh) continue;
                            const zwilling = !!(g.shadowTwin || g.mesh.layers.mask === 1 << A.SHADOW_TWIN_LAYER);
                            const a = g.mesh.geometry.attributes;
                            const i = s.slot;
                            const m = g.mesh.instanceMatrix.array;
                            const w = g.mesh.matrixWorld.elements;
                            const d = Math.hypot(auge.x - (m[i * 16 + 12] + w[12]), auge.z - (m[i * 16 + 14] + w[14]));
                            const ud = g.mat && g.mat.userData;
                            const laub = !!ud && ["foliage", "foliageTex", "grass"].includes(ud.foundryKind);
                            if (a.aKarte && a.aKarte.isInstancedBufferAttribute) {
                                const sicht = a.aKarte.array[i * 4 + 3];
                                const kk = Math.min(ref / Math.max(Math.abs(sicht), 1e-3), 1);
                                teile.push({
                                    karte: true,
                                    keep: (dh) => sicht < 0 || core.lodCrossfadeMask(d * k * kk, dh, cfgM, 2, false).keep,
                                });
                            } else if (a.aH0 && a.aH0L && a.aLodLevel && a.aLodLevel.array[0] >= 0.5) {
                                const al = a.aLodLevel.array[0];
                                const h0 = a.aH0.array[i];
                                const hL = a.aH0L.array[i];
                                const kS = Math.min(ref / Math.max(h0, 1e-3), 1);
                                const kL = Math.min(ref / Math.max(Math.abs(hL), 1e-3), 1);
                                teile.push({
                                    karte: false,
                                    zwilling,
                                    laub,
                                    keep: (dh) => {
                                        if (hL < 0) return true; // der Halt: die Stufe ohne Partner zeichnet voll
                                        const z = core.lodCrossfadeMask(d * k * kS, dh, cfgM, al > 1.5 ? 1 : 0, laub, d * k * kL);
                                        return al > 2.5 ? z.f1o < dh : z.keep;
                                    },
                                });
                            }
                        }
                    }
                    const deckung = (tk) => {
                        let n = 0;
                        for (let j = 0; j < 64; j++) {
                            const dh = (j + 0.5) / 64;
                            if (tk.some((t) => t.keep(dh))) n++;
                        }
                        return n / 64;
                    };
                    const D = {};
                    const bild = teile.filter((t) => !t.zwilling);
                    for (const klasse of ["rinde", "laub"]) {
                        const tk = bild.filter((t) => t.karte || t.laub === (klasse === "laub"));
                        if (tk.length) D[klasse] = deckung(tk);
                    }
                    const zw = teile.filter((t) => t.zwilling);
                    const d3 = bild.filter((t) => !t.karte);
                    if (zw.length) zwBekannt = true;
                    const S = { wurf: deckung(zw), gestalt: deckung(d3) };
                    const werte = Object.values(D);
                    return {
                        D,
                        S,
                        geist: werte.some((v) => v > 0 && v < 1),
                        loch: werte.length > 0 && werte.every((v) => v === 0),
                        schattenGeist: (zw.length > 0 || (d3.length > 0 && zwBekannt)) && S.wurf !== S.gestalt,
                        zwN: zw.length,
                    };
                };
                const geisterLauf = (art) => {
                    const o = { proben: 0, geister: 0, loecher: 0, schatten: 0, mitZwilling: 0, beispiel: null };
                    if (art.karteLaedt)
                        r._foundryFlattenFor = function (e, p, lod) {
                            return e === entry && lod === 2 ? null : A.prototype._foundryFlattenFor.call(this, e, p, lod);
                        };
                    // ohne Halt: VOLL kennt nur die Karte des Verdeckten und der Brücke (der Stand vor K36) — kein Stempel hält
                    if (art.ohneHalt)
                        r._lodSlotVoll = ohneHaltVoll;
                    // der Zwilling ohne Halt: sein Stempel trägt das VOLL nie (die gezeichnete Stufe hält, ihr Wurf blendet)
                    if (art.zwillingOhneHalt)
                        r._lodSlotStamp = function (g, slot, scale, voll, leaf) {
                            const tw = !!(g && (g.shadowTwin || (g.mesh && g.mesh.layers.mask === 1 << A.SHADOW_TWIN_LAYER)));
                            return A.prototype._lodSlotStamp.call(this, g, slot, scale, tw ? false : voll, leaf);
                        };
                    try {
                        for (const dnZiel of [6, 10, 14, 19, 22, 24, 27, 31, 40, 27, 24, 22, 14, 6]) {
                            const rawAuge = dnZiel / factor;
                            const auge = new window.THREE.Vector3(px - rawAuge, py + 1.6, pz);
                            st.playerMesh.position.set(px - Math.max(0, rawAuge - art.armM), py, pz);
                            r._archLODCursor = 0;
                            for (let i = 0; i < 4; i++)
                                r._tickArchitectureLOD(99, art.wahlVomSpieler ? st.playerMesh.position : auge);
                            const z = deckungAm(entry, auge);
                            o.proben++;
                            if (z.geist) o.geister++;
                            if (z.loch) o.loecher++;
                            if (z.schattenGeist) o.schatten++;
                            if (z.zwN > 0) o.mitZwilling++;
                            if ((z.geist || z.loch || z.schattenGeist) && !o.beispiel)
                                o.beispiel = {
                                    dn: dnZiel,
                                    D: z.D,
                                    S: z.S,
                                    primaer: entry._lodLevel,
                                    band: Number.isFinite(entry._lodBandLevel) ? entry._lodBandLevel : null,
                                    halt: entry._lodHalt === true,
                                };
                        }
                    } finally {
                        delete r._foundryFlattenFor;
                        delete r._lodSlotVoll;
                        delete r._lodSlotStamp;
                    }
                    return o;
                };
                const tGeist = performance.now();
                res.geisterBaum = {
                    normal: geisterLauf({ armM: 0 }),
                    karteLaedt: geisterLauf({ armM: 0, karteLaedt: true }),
                    auge: geisterLauf({ armM: 9.6, ohneHalt: true }),
                    sprung: geisterLauf({ armM: 9.6, wahlVomSpieler: true }),
                    gegenHalt: geisterLauf({ armM: 0, karteLaedt: true, ohneHalt: true }),
                    gegenAuge: geisterLauf({ armM: 9.6, wahlVomSpieler: true, ohneHalt: true }),
                    gegenSchatten: geisterLauf({ armM: 0, karteLaedt: true, zwillingOhneHalt: true }),
                };
                geisterLauf({ armM: 0 }); // die Stufen und der Halt zurück auf die gebackene Karte
                // ════ (10b) DAS AUGE VOR DER SETZUNG, IM SPRUNG, DER SONDE, BEI DER GEBURT (K36 N1): die Kalt-Wahl
                // (`_foundryLodForEntry`) und die Geburt der Streu (`_scatterPass`) messen vom Auge der Stufen. Ungesetzt (die
                // Kamera, wie geboren, fern vom Spieler — der kopflose Boot) steht es im Kopf des Spielers; nach der Setzung reist
                // es mit dem Sprung des Spielers, bis das Rig nachzieht; setzt eine Sonde die Kamera, IST sie das Auge; die Geburt
                // trägt die Distanz vom Auge (die Verfolger-Kamera 9,6 m hinter dem Spieler). Selbsttest im selben Lauf: das
                // Auge = die Kamera allein bzw. der Spieler — die Linse MUSS falsche Wahlen zählen.
                const augeLauf = (gegen) => {
                    const T3 = window.THREE;
                    const o = { proben: 0, falsch: 0, geburten: 0, geburtFalsch: 0, beispiel: [] };
                    const cam = st.camera;
                    const camVor = cam.position.clone();
                    const pmVor = st.playerMesh.position.clone();
                    const rVor = r._lodAugeR;
                    const setzeKam = (x, y, z) => {
                        cam.position.set(x, y, z);
                        cam.updateMatrixWorld(true);
                    };
                    const fall = (name, ist, soll) => {
                        o.proben++;
                        if (ist !== soll) {
                            o.falsch++;
                            if (o.beispiel.length < 4) o.beispiel.push({ name, ist, soll });
                        }
                    };
                    if (gegen === "kamera")
                        r._lodAuge = function () {
                            return this.state.camera.getWorldPosition(new T3.Vector3());
                        };
                    if (gegen === "spieler")
                        r._lodAuge = function () {
                            const p = this.state.playerMesh.position;
                            return new T3.Vector3(p.x, p.y + 1.6, p.z);
                        };
                    const key = `${Math.floor(px / A.SCATTER.regionM)},${Math.floor(pz / A.SCATTER.regionM)}`;
                    try {
                        // (i) ungesetzt: die Kamera, wie geboren, 200 m neben dem Spieler; der Spieler am Baum → L0
                        r._lodAugeR = null;
                        setzeKam(px - 200, py, pz);
                        st.playerMesh.position.set(px + 1, py, pz);
                        fall("ungesetzt", r._foundryLodForEntry(entry), 0);
                        // (ii) der Sprung: das Rig setzte das Auge 500 m vom Baum, der Spieler springt an den Baum → L0
                        st.playerMesh.position.set(px - 500, py, pz);
                        setzeKam(px - 509.6, py + 3, pz);
                        r._lodAugeGesetzt();
                        st.playerMesh.position.set(px + 1, py, pz);
                        fall("Sprung", r._foundryLodForEntry(entry), 0);
                        // (iii) die Sonde setzt die Kamera an den Baum, der Spieler steht 500 m fern → das Auge ist die Kamera: L0
                        st.playerMesh.position.set(px - 500, py, pz);
                        setzeKam(px + 1, py + 1.6, pz);
                        fall("Sonde", r._foundryLodForEntry(entry), 0);
                        // (iv) die Geburt der Streu: die Sonde setzt die Kamera 9,6 m hinter den Spieler (der Arm der Verfolger-
                        // Kamera); jede geborene Zelle trägt die Distanz vom Auge
                        st.playerMesh.position.set(px, py, pz);
                        setzeKam(px - 9.6, py + 3, pz);
                        const augeSoll = cam.getWorldPosition(new T3.Vector3());
                        r._disposeScatterRegion(key);
                        r._scatterMaterializeCell = function (region, layer, salt, cx, cz, cm, tf, dist, ...rest) {
                            o.geburten++;
                            const soll = Math.hypot(tf.x - augeSoll.x, tf.z - augeSoll.z);
                            if (!(Math.abs(dist - soll) < 1e-6)) {
                                o.geburtFalsch++;
                                if (o.beispiel.length < 4) o.beispiel.push({ name: "Geburt", ist: +dist.toFixed(2), soll: +soll.toFixed(2) });
                            }
                            return A.prototype._scatterMaterializeCell.call(this, region, layer, salt, cx, cz, cm, tf, dist, ...rest);
                        };
                        r._scatterRegion(Math.floor(px / A.SCATTER.regionM), Math.floor(pz / A.SCATTER.regionM), st.playerMesh.position);
                    } catch (e) {
                        o.err = String((e && e.message) || e);
                    } finally {
                        delete r._lodAuge;
                        delete r._scatterMaterializeCell;
                        r._disposeScatterRegion(key);
                        r._lodAugeR = rVor;
                        setzeKam(camVor.x, camVor.y, camVor.z);
                        st.playerMesh.position.copy(pmVor);
                    }
                    return o;
                };
                res.geisterBaum.augeGesetz = augeLauf(null);
                res.geisterBaum.gegenKamera = augeLauf("kamera");
                res.geisterBaum.gegenSpieler = augeLauf("spieler");
                // ════ (10c) DIE STREU IM SPRUNG (F1 a, ihre Hälfte): Geburt und Takt der Streu (`_scatterPass`,
                // `_tickScatterLod(auge)` je Bild, 160 Zellen und 4 Umbauten) wählen Stufe und Band vom alten Ort; die Maske misst
                // vom Auge. Besucht die Scheibe die Zelle spät (in voller Fahrt 24 m), dithert die Karte ohne verlangten Partner
                // ins Nichts, wo sie nicht HÄLT (`_scatterMaterializeCell` bandHalt). Ein Sicht-Wechsel allein (9,6 m) erreicht
                // sie in der Streu (ab 64 m) nie: die Karte weicht erst unter 22 m Wahrnehmung, die Wahl lässt sie ab 29 m ohne
                // Partner. Je Ort die Deckung jeder Foundry-Baum-Zelle am
                // Auge; geurteilt wird die Zelle ohne verlangten Partner, die Zelle mit Partner zählt mit.
                const streuLauf = (ohneHalt) => {
                    const o = { proben: 0, geister: 0, loecher: 0, orte: 0, mitPartner: 0, mitPartnerGeister: 0, beispiel: null };
                    const zwVor = zwBekannt;
                    try {
                        for (const z0 of streuOrte) {
                            const reg = streuGeburt(z0, ohneHalt);
                            const auge = st.camera.getWorldPosition(new window.THREE.Vector3());
                            o.orte++;
                            for (const c of (reg && reg.cells) || []) {
                                if (!Number.isFinite(c.dient) || !c.slots.length) continue;
                                zwBekannt = false; // der Wurf-Zwilling zählt je Zelle, nie aus dem gesetzten Baum
                                const z = deckungAm({ instSlots: c.slots }, auge);
                                if (c.bandWunsch != null) {
                                    o.mitPartner++;
                                    if (z.geist || z.loch) o.mitPartnerGeister++;
                                    continue;
                                }
                                o.proben++;
                                if (z.geist) o.geister++;
                                if (z.loch) o.loecher++;
                                if ((z.geist || z.loch) && !o.beispiel) {
                                    const dA = Math.hypot(c.x - auge.x, c.z - auge.z);
                                    o.beispiel = { dA: +dA.toFixed(1), D: z.D, dient: c.dient, halt: c.halt };
                                }
                            }
                        }
                    } finally {
                        zwBekannt = zwVor;
                        streuZurueck();
                    }
                    return o;
                };
                res.geisterBaum.sprungStreu = streuLauf(false);
                res.geisterBaum.gegenStreu = streuLauf(true);
                res.geisterBaum.ms = Math.round(performance.now() - tGeist);
            } else res.stufenWahrheit = { err: "__phytoCore.lodCrossfadeMask fehlt" };
        } finally {
            st.architectures = savedArchs;
            r._archLODCursor = savedCursor;
        }
        // ════ TEIL Z — DER STUFEN-ZENSUS: bei Studio-äquivalenten Distanzen serviert der HOST dieselbe Stufe wie der
        // Studio-Wald (dn = dr·min(HREF/bh, 1) ungedeckelt · Blatt-Kappe bh_L = min(bh, 24)), je Distanz-Band × Sichthöhe.
        res.zensus = [];
        const hrefZ = cfg.lodRef;
        const stageStudio = (dr, bh) => {
            const dnS = dr * Math.min(1, hrefZ / bh);
            return dnS < cfg.thresh01 ? 0 : dnS < cfg.thresh12 ? 1 : 2;
        };
        // Distanzen meiden EXAKTE Schwellen-Treffer (160·12/48 = 40.0 — Host-Hysterese
        // und Studio-`<` urteilen die Kante verschieden; die Kante ist kein Zensus-Fall).
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
            const kanteZ = cfg.thresh01 - cfg.fade0 - cfg.hysteresis;
            res.leafCapErwartet = dnLZ > kanteZ ? 1 : null;
            res.leafCapDnL = +dnLZ.toFixed(2);
            res.leafCapKante = +kanteZ.toFixed(2);
        }
        // visStretchMax UNGEDECKELT: dn(100, 36) = 100·12/36 = 33.33 (der alte Deckel gab 80).
        res.stretchProbe = +r._lodPerceptionDistance(100, 36).toFixed(2);
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

    // ── ATTRIBUT-WAND: JEDER Konsument eines Masken-Materials (userData.
    // foundryCrossfade) MUSS die Stempel-Attribute tragen — der Null-Stempel sitzt am
    // EINEN Konversions-Chokepoint (_foundryBuildMesh); der Gruppen-Bau überschreibt
    // mit echten Stufen. ──
    const attrWand = await page.evaluate(() => {
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

    // ── DIE GNADENFRIST DES LEER-DISPOSE (Familien oszillieren um liveCount 0). Vier Sätze:
    // headless reapt SOFORT (byte-alte Gates) · echt hält die Frist die Hülle ·
    // Realloc in der Frist mintet NICHT neu · der Reaper räumt nach Ablauf. ──
    const gnade = await page.evaluate(async () => {
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

    // ── DER KEHRAUS DES WURFS: die L0 trägt DIESELBEN Zwillings-Leaves wie ihre Wurf-Stufe
    // (L1) — räumt die L0-Gruppe, fällt keine Geometrie der lebenden L1 (r184 zerstörte sonst die GPU-Puffer des Wurfs
    // und lüde sie neu, der Dispose-Hörer wäre fort); räumt die L1-Gruppe, fällt jede Wurf-Gestalt genau einmal. Am
    // gewärmten Proben-Baum (Eiche, Cache warm), zuletzt (die Probe räumt zwei Cache-Gruppen). ──
    const kehraus = await page.evaluate(async () => {
        const key = r._growTreeBlueprintForSpawn("baum_eiche", "w54-band-sweep");
        const ex = 15345,
            ez = 6789;
        const e = r.spawnArchitecture(key, { x: ex, y: r._voxelSurfaceY(ex, ez) || 1, z: ez }, { silent: true, seed: 1 });
        if (!e) return { err: "spawnArchitecture gab null" };
        const preset = r._foundryPresetForEntry(e);
        // die Gestalt des Orts wartet auf den Plan seines Walds (K69: die Schlange des Walds plant im Takt) — die Probe
        // pumpt die Schlange, bis sie steht (Bau-Ereignisse, nie Wanduhr)
        for (let i = 0; i < 2000 && r._foundryGestaltFor(e, preset) == null; i++) {
            r._tickWaldPlan(Infinity);
            await sleep(0); // der Wald-Faden rechnet die Schlange (K60-4)
        }
        const fl0 = r._foundryFlattenFor(e, preset, 0),
            fl1 = r._foundryFlattenFor(e, preset, 1);
        if (!(fl0 && fl0.leaves && fl1 && fl1.leaves))
            return {
                err: "Stufen nicht warm",
                gestalt: r._foundryGestaltFor(e, preset),
                schlange: r._waldPlanSchlange ? r._waldPlanSchlange.size : null,
                l0: !!fl0,
                l1: !!fl1,
            };
        const tw1 = fl1.leaves.filter((l) => l.shadowTwin),
            tw0 = fl0.leaves.filter((l) => l.shadowTwin);
        const eigen0 = fl0.leaves.find((l) => !l.shadowTwin);
        const g0 = eigen0 && eigen0._srcGroup,
            g1 = tw1.length ? tw1[0]._srcGroup : null;
        const geoms = new Set();
        for (const l of tw1) for (const g of [l.geom, l._schattenGeom]) if (g) geoms.add(g);
        let n = 0;
        for (const g of geoms) g.addEventListener("dispose", () => n++);
        r.removeArchitecture(e);
        if (!g0 || !g1 || g0 === g1) return { err: "Gruppen nicht gefunden", tw0: tw0.length, tw1: tw1.length };
        r._disposeFoundryGroupGeom(g0);
        const nachL0 = n;
        r._disposeFoundryGroupGeom(g1);
        return {
            tw0: tw0.length,
            tw1: tw1.length,
            geteilt: tw0.length > 0 && tw0.every((l) => tw1.includes(l)),
            geoms: geoms.size,
            nachL0,
            nachL1: n,
        };
    });

    // (9) DIE LAUTE BLENDE in der Seite: der Uniform-Satz verliert uLodD0, ein Baum-Stoff wird frisch gebaut (der Cache der
    // Stoffe leer) — bricht er beim Namen, oder zeichnet er still ohne Maske? Danach steht alles wie vorher.
    const laut = await page.evaluate(() => {
        const res = {};
        const lu = r._ensureLodUniforms();
        const alt = st.lodUniforms;
        const mats = r._foundryMats;
        st.lodUniforms = Object.assign({}, lu, { uLodD0: null });
        r._foundryMats = {};
        try {
            const m = r._foundryTreeMaterial("bark", null);
            res.still = !!m;
            res.maske = !!(m && m.userData && m.userData.foundryCrossfade === true);
        } catch (e) {
            res.bruch = String((e && e.message) || e);
            res.blende = !!(e && e.blende === true);
        }
        st.lodUniforms = alt;
        r._foundryMats = mats;
        // DER SPIEGEL DER BLENDE (W5.4): die Masken-Uniformen tragen je Bild das EINE CPU-Band (LOD_DISTANCES) — eine Änderung
        // des Bands steht nach dem nächsten Bild (`_loopRender`) in der Maske, vorher nicht (die Gegenprobe im selben Lauf).
        const D = r.constructor.LOD_DISTANCES;
        const u = st.lodUniforms;
        const band = () => [u.uLodD0, u.uLodD1, u.uLodFade, u.uLodFade0].map((x) => x.value).join() === [D.thresh01, D.thresh12, D.fade, D.fade0].join();
        const d0 = D.thresh01;
        res.spiegel = { seed: band() };
        D.thresh01 = d0 + 1.5;
        res.spiegel.vorBild = band();
        r._loopRender();
        res.spiegel.nachBild = band();
        D.thresh01 = d0;
        r._loopRender();
        res.spiegel.zurueck = band();
        return res;
    });

    await browser.close();
    server.close();
    return { out, attrWand, gnade, kehraus, laut };
}


async function main() {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf jede Verfälschungs-Klasse ===");
        // V1: der Dither des Gesetzes verschoben (Phase + 1e-7) → die Dither-Äquivalenz MUSS feuern.
        const core1 = Object.assign({}, CORE, { lodDitherIGN: (x, y, t) => CORE.lodDitherIGN(x, y, t + 1e-7) });
        check("Selbst-Test 1: verschobener Dither des Gesetzes → Dither-Äquivalenz feuert", buildRaster(core1, 0).mismatch > 0);
        // V2: die Fern-Rampe des Gesetzes verschoben (fade × 1,25) → die Masken-Äquivalenz MUSS feuern.
        const core2 = Object.assign({}, CORE, {
            lodCrossfadeMask: (d, dh, cfg, lod, laub, dL) => CORE.lodCrossfadeMask(d, dh, Object.assign({}, cfg, { fade: cfg.fade * 1.25 }), lod, laub, dL),
        });
        check("Selbst-Test 2: verschobene Fern-Rampe → Masken-Äquivalenz feuert", evaluate(core2, CFG, buildRaster(core2, 0)).keepMismatch > 0);
        // V3: jede Absenz — die echte Quelle hält sie, ihr Täter zurück am Kopf seines Glieds wird beim Namen genannt.
        for (const [name, glied, re, taeter] of ABSENZEN) {
            const heil = stammLib.fehlt(glied, re);
            const rot = !stammLib.fehlt(glied, re, mitTaeter(glied, taeter));
            check(`Selbst-Test Absenz: „${taeter}" → ${name.split(":")[0]} nennt ihn`, heil && rot, stammLib.fehlt.wo || "");
        }
        // V4: verschobene Kanten des Fensters (je Stufe 1 m nach innen) — die Fenster-Linse MUSS Löcher nennen.
        for (const [name, fn] of [
            ["L0 aus", (K) => (K.l0Aus -= 1)],
            ["L1 ein", (K) => (K.l1Ein += 1)],
            ["L1 aus", (K) => (K.l1Aus -= 1)],
            ["Karte ein", (K) => (K.karteEin += 1)],
        ]) {
            const v = fensterLinse(CORE, [CFG], fn);
            check(`Selbst-Test Fenster: „${name}" 1 m nach innen → die Linse nennt Löcher`, v.loecher > 0, `${v.loecher} Löcher`);
        }
        // V5: die Weite der Gestalt (Krone 10,06 m) als Rand im Fenster — die L1 der nahen Birke wird genannt.
        const weit = (g, i, L) => A.prototype._instanzFenster.call(stumpf, g, i, Object.assign({}, L, { halt: L.halt + stumpf._instanzWeite().r }));
        const S8 = stufeOhneBildLinse(CORE, CFG, weit);
        check(
            "Selbst-Test Stufe ohne Bild: die Weite der Gestalt im Fenster → die L1 der nahen Birke wird genannt",
            !!S8.jeStufe[2] && S8.jeStufe[2].art === "birke" && S8.jeStufe[2].d < 8,
            `ohne Bild ${S8.ohneBild} · die L1: ${JSON.stringify(S8.jeStufe[2])}`
        );
        selbsttestEnde(errs, "die Linse feuert auf jede Verfälschungs-Klasse.");
        process.exit(0);
    }

    console.log("=== W5.3 — DAS GESETZ DER BLENDE (phyto-core) GEGEN DIE STUDIO-BLENDE (foundry-core injectWind, im Lauf) ===");
    check(
        "Gesetz und Studio-Blende geladen (lodCrossfadeMask · lodDitherIGN · der Fragment-Satz für Rinde und Laub)",
        typeof CORE.lodCrossfadeMask === "function" && typeof CORE.lodDitherIGN === "function",
        `lod d0=${CFG.d0} d1=${CFG.d1} fade=${CFG.fade} fade0=${CFG.fade0}`
    );
    let totalKeepMismatch = 0,
        totalDhMismatch = 0;
    let agg = null;
    for (const t of [0, 0.61803398875]) {
        const raster = buildRaster(CORE, t);
        totalDhMismatch += raster.mismatch;
        const r = evaluate(CORE, CFG, raster);
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
    check("Dither-Äquivalenz: lodDitherIGN == der _dh der Studio-Blende (2 uDitherT-Phasen)", totalDhMismatch === 0);
    check("Masken-Äquivalenz: keep L0/L1 == die Studio-Blende (Rinde und Laub, beide Metriken)", totalKeepMismatch === 0);
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
    // (3) — DAS FENSTER DER INSTANZ-WAHL: die Kanten stehen am Gesetz, kein Loch je Stufe
    {
        const cfgs = [
            CFG,
            { d0: 8, d1: 30, fade: 6, fade0: 3 },
            { d0: CFG.d0 * 1.5, d1: CFG.d1 * 1.5, fade: CFG.fade * 1.5, fade0: CFG.fade0 * 1.5 },
        ];
        const F6 = fensterLinse(CORE, cfgs, null);
        const t = Object.entries(F6.jeStufe)
            .map(([k, v]) => `${k}: ${v.loecher} Löcher · Überschuss ${v.ueberschuss}/${v.proben}`)
            .join(" · ");
        check(
            "FENSTER (W7): die Instanz-Wahl verwirft nie, was das Blend-Gesetz zeigt — je Stufe kein Loch",
            F6.proben > 1000 && F6.loecher === 0,
            `${F6.proben} Intervalle · ${t}${F6.beispiel ? " · z. B. " + JSON.stringify(F6.beispiel) : ""}`
        );
    }
    // (4) — DIE STUFE OHNE BILD: das echte _instanzFenster gegen das Gesetz an der Instanz-Distanz
    {
        const S8 = stufeOhneBildLinse(CORE, CFG);
        check(
            "STUFE OHNE BILD: keine Stufe wird gezeichnet, die das Gesetz an der Instanz-Distanz nicht behält (doppelt außerhalb des Fade-Fensters)",
            S8.proben > 4000 && S8.ohneBild === 0 && S8.loecher === 0,
            `${S8.proben} Proben · ohne Bild ${S8.ohneBild}${S8.beispiel ? " (z. B. " + JSON.stringify(S8.beispiel) + ")" : ""} · Löcher ${S8.loecher}${S8.loch ? " (" + JSON.stringify(S8.loch) + ")" : ""}`
        );
    }
    // (5) — DIE ABSENZEN DER BLENDE über den EINEN Helfer
    for (const [name, glied, re] of ABSENZEN) check(name, stammLib.fehlt(glied, re), stammLib.fehlt.wo || "");

    console.log("--- Teil (b) — W5.4: die Doppel-Mitgliedschaft im lebenden System (headless, foundry-ON) ---");
    const { out, attrWand, gnade, kehraus, laut } = await runPartB();
    check(
        "KEHRAUS DES WURFS: die L0 trägt die Zwillings-Leaves ihrer L1 · ihr Räumen lässt die Wurf-Gestalt der lebenden L1 stehen · das Räumen der L1 gibt jede genau einmal frei",
        kehraus &&
            !kehraus.err &&
            kehraus.tw1 > 0 &&
            kehraus.geteilt === true &&
            kehraus.nachL0 === 0 &&
            kehraus.nachL1 === kehraus.geoms,
        kehraus ? JSON.stringify(kehraus) : "Probe lief nicht"
    );
    // Die Untergrenze ist die Nicht-Vakuität, nicht die Weltgröße.
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
        // Die Config-Heimat (W5, Lehre 19, K2): die Welt LIEST die Bänder des Kerns (Gesetz terrain:PORTAL_RENDER_CONFIG.lod), die
        // Schwellen legt das Gesetz des Schirms (lod.K5) — keine Zahl im Stamm, live gemessen statt am Rumpf-Text.
        const lodKern = out.lodGesetz ? [...out.lodGesetz, CFG.fade, CFG.fade0] : null;
        check(
            "LOD_DISTANCES live == das Gesetz des Schirms (thresh01 · thresh12) und die Bänder des Kerns (fade/fade0)",
            JSON.stringify(out.lodLive) === JSON.stringify(lodKern),
            `live ${JSON.stringify(out.lodLive)} · Kern ${JSON.stringify(lodKern)}`
        );
        check("Preset aufgelöst", out.preset === "eiche", out.preset);
        check(
            "alle drei Stufen warm vor der Baseline (L0/L1/Impostor)",
            !!(out.warm && out.warm.l0 && out.warm.l1 && out.warm.l2),
            out.warm
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
    check(
        "DIE LAUTE BLENDE (Seite): ohne uLodD0 bricht der Baum-Stoff beim Namen, statt still ohne Maske zu zeichnen",
        !!laut && laut.blende === true && /uLodD0/.test(laut.bruch || ""),
        laut ? (laut.bruch ? laut.bruch : `der Stoff entstand still (Maske ${laut.maske ? "da" : "fehlt"})`) : "keine Antwort"
    );
    const sp = (laut && laut.spiegel) || {};
    check(
        "SPIEGEL DER BLENDE: die Masken-Uniformen tragen je Bild das CPU-Band (LOD_DISTANCES) — vor dem Bild alt, nach ihm neu",
        sp.seed === true && sp.vorBild === false && sp.nachBild === true && sp.zurueck === true,
        sp
    );

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
        const z = (o) => `${o.proben} Proben · Löcher ${o.loecher} · Stempel≠CPU ${o.stempelUngleich}${o.beispiel ? " · z. B. " + JSON.stringify(o.beispiel) : ""}`;
        check(
            "STUFEN-WAHRHEIT: die CPU-Sichthöhe IST der Fassaden-Stempel jeder residenten Stufe (L0 = L1 = Höhen-Stufe)",
            SW.voll.proben >= 8 && SW.voll.stempelUngleich === 0,
            z(SW.voll)
        );
        check("STUFEN-WAHRHEIT: kein Loch über den Sweep (volle Leistung)", SW.voll.loecher === 0, z(SW.voll));
        check(
            "STUFEN-WAHRHEIT Gegenprobe: der alte Leser (Sichthöhe 0) zeigt Löcher — die Probe sieht den Geist",
            SW.gegenprobe.loecher > 0,
            z(SW.gegenprobe)
        );
        check(
            "STUFEN-WAHRHEIT: das Billboard stand im Sweep mit SEINEM Stempel (= die Höhe der L1, kein Rahmen-Modell)",
            (SW.voll.modi.fin || 0) > 0,
            SW.voll.modi
        );
        const ST = SW.strauch;
        check(
            "STRAUCH: Preset strauch, L0, L1 und Billboard warm",
            out.strauchPreset === "strauch" &&
                out.strauchWarm &&
                out.strauchWarm.l0 &&
                out.strauchWarm.l1 &&
                out.strauchWarm.l2,
            { preset: out.strauchPreset, warm: out.strauchWarm }
        );
        if (ST) {
            check(
                "STRAUCH: die Kette wie der Baum — L0 (aLodLevel 1) und L1 (aLodLevel 2) im Sweep, das Billboard im Band",
                (ST.voll.modi.l0 || 0) > 0 &&
                    (ST.voll.modi.l1 || 0) > 0 &&
                    (ST.voll.modi.fin || 0) > 0 &&
                    !ST.voll.modi.l1e &&
                    !ST.voll.modi.frei,
                ST.voll.modi
            );
            check("STRAUCH: kein Loch, Stempel = CPU-Sichthöhe (volle Leistung)", ST.voll.loecher === 0 && ST.voll.stempelUngleich === 0, z(ST.voll));
        } else check("STRAUCH-Sweep lief", false, "fehlt");
        // DIE KETTE DES GESETZBUCHS: Wagen und Tor tragen ihre Stufen-Kette im Gesetzbuch — jede gezeigte Stufe hat
        // ihren Partner (L0 ↔ L1), beide stehen im Bild, und über den Sweep reißt kein Loch. Eine
        // Satz-Art (das Tor, `BAU_SATZ`) wird an ihren Satz-Zellen geprobt — die Stempel je Ecke, die der Satz zeichnet.
        const zk = (o) =>
            o
                ? `${o.proben} Proben · Löcher ${o.loecher} (leer ${o.leer}) · Satz-Zellen ${o.satzZellen} (fehlt ${o.zelleFehlt}, Ecke≠ ${o.eckeUngleich}) · Stempel≠CPU ${o.stempelUngleich} · Stufen ${JSON.stringify(o.stufen)} · alter Leser ${o.altLoecher} Löcher${o.beispiel ? " — z. B. " + JSON.stringify(o.beispiel) : ""}${o.fehltBeispiel ? " — Zelle fehlt z. B. " + JSON.stringify(o.fehltBeispiel) : ""}`
                : "fehlt";
        for (const op of out.kette || []) {
            // gezählt werden die GEZEIGTEN Stufen (eine NUR-WURF-Stufe ist kein Partner, `_foundryDeclaredStage`)
            const g = Array.isArray(op.gezeigt) ? op.gezeigt : [];
            const mitPartner = g.length >= 2 && g[0] === 0 && g.every((s, i) => i === 0 || s === g[i - 1] + 1);
            check(
                `KETTE DES GESETZBUCHS (${op.typ}): jede gezeigte Stufe hat ihren Partner (L0 ↔ L1), alle warm`,
                !!op.preset && mitPartner && op.alleWarm === true,
                { preset: op.preset, stufen: op.stufen, gezeigt: op.gezeigt, karte: op.karte, satz: op.satzArt, warm: op.warm }
            );
            if (!op.voll) {
                check(`KETTE DES GESETZBUCHS (${op.typ}): Sweep lief`, false, "fehlt");
                continue;
            }
            const ganz = (o) =>
                o.proben >= 8 && o.loecher === 0 && o.leer === 0 && o.zelleFehlt === 0 && o.eckeUngleich === 0 && o.stempelUngleich === 0;
            check(
                `KETTE DES GESETZBUCHS (${op.typ}): kein Loch über den Sweep`,
                ganz(op.voll),
                zk(op.voll)
            );
            check(
                `KETTE DES GESETZBUCHS (${op.typ}): der Partner steht im Bild — jede gezeigte Stufe zeichnet im Sweep`,
                g.length > 0 && g.every((s) => (op.voll.stufen[s] || 0) > 0),
                { stufen: op.voll.stufen, modi: op.voll.modi }
            );
            if (op.satzArt)
                check(
                    `KETTE DES GESETZBUCHS (${op.typ}): der Bau-Satz zeichnet — jede Probe liest die Stempel je Ecke ihrer Satz-Zellen`,
                    op.voll.satzZellen >= op.voll.proben,
                    `${op.voll.satzZellen} Zellen in ${op.voll.proben} Proben`
                );
            // Selbsttest im selben Lauf: die Linse MUSS den Täter beim Namen zählen.
            const GP = op.gegenPartner;
            if (op.karte)
                check(
                    `KETTE Selbsttest (${op.typ}): der Partner lädt nie und die Stufe hält nicht — die Linse zählt das Loch der L0, die zu nichts dithert`,
                    !!GP && GP.loecher > 0,
                    zk(GP)
                );
            check(
                `KETTE Selbsttest (${op.typ}): der Partner lädt nie — die Linse vermisst die L1 im Bild`,
                !!GP && GP.proben >= 8 && !((GP.stufen[1] || 0) > 0),
                zk(GP)
            );
            if (op.satzArt)
                check(
                    `KETTE Selbsttest (${op.typ}): der Satz folgt der Stufe nicht (die Marke stumm) — die Linse zählt die fehlende Satz-Zelle als Loch`,
                    !!op.gegenSatz && op.gegenSatz.zelleFehlt > 0 && op.gegenSatz.loecher > 0,
                    zk(op.gegenSatz)
                );
        }
        if (!(out.kette || []).length) check("KETTE DES GESETZBUCHS lief", false, "fehlt");
    } else check("STUFEN-WAHRHEIT lief", false, SW ? SW.err : "fehlt");
    // (10) DER GEISTER-BAUM: je Lauf 14 Augen-Orte (6–40 m Wahrnehmung, hin und zurück), die Deckung am Auge 0 oder 1.
    const GB = out && out.geisterBaum;
    if (GB) {
        const g = (o) =>
            `${o.geister} Geister · ${o.loecher} Löcher · ${o.schatten} Schatten-Geister in ${o.proben} Proben (${o.mitZwilling} mit Zwilling)${o.beispiel ? " — z. B. " + JSON.stringify(o.beispiel) : ""}`;
        const sauber = (o) => o.proben >= 14 && o.geister === 0 && o.loecher === 0 && o.schatten === 0 && o.mitZwilling > 0;
        check("GEISTER-BAUM: der Partner steht — keine Instanz halb maskiert (die Linse schweigt bei der Blende)", sauber(GB.normal), g(GB.normal));
        check("GEISTER-BAUM: die Karte bäckt — die L1 HÄLT voll statt dem Nichts zu weichen (der Täter: Stufe ohne Partner)", sauber(GB.karteLaedt), g(GB.karteLaedt));
        check("GEISTER-BAUM: das Auge 9,6 m hinter dem Spieler — die Wahl misst vom Auge der Maske, auch ohne Halt (der Täter: Wahl vom Spieler)", sauber(GB.auge), g(GB.auge));
        check("GEISTER-BAUM: die Wahl misst vom alten Ort (das Auge sprang, F1) — jede Stufe ohne gezeichneten Partner hält voll (der Täter: der Halt fällt, wo keiner verlangt ist)", sauber(GB.sprung), g(GB.sprung));
        const gs = (o) =>
            o
                ? `${o.geister} Geister · ${o.loecher} Löcher in ${o.proben} Streu-Zellen ohne verlangten Partner an ${o.orte} Orten (mit Partner ${o.mitPartnerGeister} Geister in ${o.mitPartner})${o.beispiel ? " — z. B. " + JSON.stringify(o.beispiel) : ""}`
                : "fehlt";
        const SS = GB.sprungStreu;
        check("GEISTER-BAUM sprung Streu: die Wahl vom alten Ort (die späte Scheibe, 24 m), die Maske vom Auge — jede Foundry-Streu-Zelle ohne verlangten Partner hält voll (der Täter: _scatterMaterializeCell ohne bandHalt)", !!SS && SS.proben >= 100 && SS.geister === 0 && SS.loecher === 0, gs(SS));
        check("GEISTER-BAUM Selbsttest Streu: trägt kein Streu-Slot den Halt, zählt die Linse den Geist der Karte ohne Partner", !!GB.gegenStreu && GB.gegenStreu.geister + GB.gegenStreu.loecher > 0, gs(GB.gegenStreu));
        check("GEISTER-BAUM Selbsttest: ohne Halt zählt die Linse den Geist vor der ungebackenen Karte", GB.gegenHalt.geister + GB.gegenHalt.loecher > 0, g(GB.gegenHalt));
        check("GEISTER-BAUM Selbsttest: misst die Wahl vom Spieler, ohne Halt, zählt die Linse den Geist der Verfolger-Kamera", GB.gegenAuge.geister + GB.gegenAuge.loecher > 0, g(GB.gegenAuge));
        check("GEISTER-BAUM Selbsttest: trägt der Zwilling den Halt nicht, zählt die Linse den Halbschatten unter dem vollen Baum", GB.gegenSchatten.schatten > 0, g(GB.gegenSchatten));
        // (10b) das Auge vor der Setzung, im Sprung, der Sonde und bei der Geburt der Streu
        const ga = (o) => `${o.falsch} falsche Wahlen in ${o.proben} Proben · ${o.geburtFalsch} von ${o.geburten} Geburten nicht vom Auge${o.err ? " — Fehler " + o.err : ""}${o.beispiel.length ? " — z. B. " + JSON.stringify(o.beispiel) : ""}`;
        const AG = GB.augeGesetz;
        check("GEISTER-BAUM Auge: ungesetzt, im Sprung und unter der Sonde wählt die Kalt-Wahl vom Auge der Stufen (der Täter: _lodAuge = die Kamera allein)", !!AG && !AG.err && AG.proben === 3 && AG.falsch === 0, ga(AG));
        check("GEISTER-BAUM Auge: jede Streu-Geburt trägt die Distanz vom Auge (der Täter: _scatterPass wählt vom Spieler)", !!AG && !AG.err && AG.geburten > 0 && AG.geburtFalsch === 0, ga(AG));
        check("GEISTER-BAUM Auge Selbsttest: das Auge = die Kamera allein — die Linse zählt die Wahl des ungesetzten Auges und des Sprungs", !!GB.gegenKamera && GB.gegenKamera.falsch >= 2, ga(GB.gegenKamera));
        check("GEISTER-BAUM Auge Selbsttest: das Auge = der Spieler — die Linse zählt die Sonde und jede Geburt", !!GB.gegenSpieler && GB.gegenSpieler.falsch >= 1 && GB.gegenSpieler.geburtFalsch > 0, ga(GB.gegenSpieler));
        console.log(`  (die Geister-Linse lief ${GB.ms} ms)`);
    } else check("GEISTER-BAUM lief", false, "fehlt");
    wandEnde(errs, "DIE STUDIO-BLENDE IST GANZ: __phytoCore.lodCrossfadeMask übersetzt die Dither-Maske byte-nah (Rinde Partition · Laub überlappend · Impostor-fin), und die CPU-Doppel-Mitgliedschaft hält im Band BEIDE Stufen resident (außerhalb exakt eine, nie 0, Slot-Bilanz dicht) — Maske + Band zusammen DEFAULT AN.");
}

hauptLauf(main);
