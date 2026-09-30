// AnazhRealm — feld-wgsl.js: DER DRITTE SPIEGEL (docs/das-feld-zeichnet.md §3).
//
// SEH-SPIEGEL, NIE PHYSIK-WAHRHEIT: das Terrain-Makro-Gesetz
// `_terrainMacroSurfaceY(x, z, includeDetail=true)` reist ein drittes Mal —
// nach WGSL (f32). Kollision/Sim/Lockstep lesen weiterhin NUR die f64-Quelle
// (Main ↔ voxel-worker, bit-identisch); dieser Spiegel dient dem ZEICHNEN
// (Fern-Feld/GPU-Cull), seine Abweichung ist ein GEMESSENES Toleranz-Band
// (gate:dritter-spiegel), kein Versprechen.
//
// EINE QUELLE, KEIN ZAHLEN-ZWILLING (Gesetz #0): die Permutationstabellen
// kommen NICHT aus einer WGSL-Kopie der Seed-Ableitung (alea/masher bleibt
// f64-CPU-Arbeit), sondern `spiegelEingaben(realm)` liest die LEBENDEN
// Tabellen (`realm._voxelNoise.perm/permMod12`, `realm._macroRidgeNoise.perm`)
// und die lebenden Daten-Overlays (Erosions-Heimat-Grid, Tarns, Makro-Anker,
// Skalare) und packt sie als Buffer. Driftet das JS-Gesetz, wird die Linse
// rot (Selbsttest: eine injizierte Abweichung sprengt die Bänder).
//
// FORM: namespaced IIFE (Kern-Muster) → root.__feldWgsl = { VERSION,
// WGSL_MAKRO, spiegelEingaben }. Kein THREE, kein DOM — reine Daten + Text.
(function (root) {
    "use strict";

    const VERSION = 1;

    // ── Der WGSL-Compute-Shader: f32-Port von _terrainMacroSurfaceY ──────────
    //
    // Bind-Group 0 (Layout „auto", 1 Uniform + 8 Storage):
    //   @0 uniform  Skalare        (8×f32 + 4×u32, 48 Bytes — Reihenfolge unten)
    //   @1 storage  permV[512]     u32 — realm._voxelNoise.perm
    //   @2 storage  permMod12V[512] u32 — realm._voxelNoise.permMod12
    //   @3 storage  permR[512]     u32 — realm._macroRidgeNoise.perm
    //                                    (mod 12 rechnet der Shader: perm % 12)
    //   @4 storage  anker[]        f32 — Makro-Anker-Pack (Layout siehe
    //                                    spiegelEingaben; [14..] Tal-Vertices
    //                                    flach, dann Tal-Floors)
    //   @5 storage  eroGrid[]      f32 — Erosions-Delta (Heimat-Grid dim×dim)
    //   @6 storage  tarns[]        f32 — je Tarn 5 Werte: x·z·d·reach2·twoSig2
    //   @7 storage  punkte[]       f32 — Eingabe (x,z)-Paare
    //   @8 storage  ausgabe[]      f32 — Makro-Oberflächen-Höhe je Punkt
    //
    // f32-GRENZEN (bewusst, Doktrin §3): große Koordinaten × kleine Frequenzen
    // und die Simplex-Zellwahl (floor an Zellgrenzen) können in f32 anders
    // fallen als in f64 — der Noise ist stetig, darum bleiben die Abweichungen
    // klein; seltene Ausreißer (Branch-Flips an mesa-/canyon-Kanten) deckt das
    // max-Band der Linse. tanh-Argumente sind auf ±30 geklemmt (f32-sicher,
    // tanh(30) == 1.0 — numerisch identisch zur JS-f64-Sättigung).
    const WGSL_MAKRO = `// DER DRITTE SPIEGEL — SEH-SPIEGEL, nie Physik-Wahrheit (das-feld-zeichnet.md §3).
// f32-Port von anazhRealm.js _terrainMacroSurfaceY + _erosionDeltaAt + _tarnDeltaAt
// + _macroSurfaceContribution + _ridgeAnkerNoise + vendor/simplex-noise.js noise2D.

struct Skalare {
    base: f32,          // state.terrainBaseHeight || 0
    steilheit: f32,     // state.terrainSteepness || 1
    wasser: f32,        // Number.isFinite(state.waterLevel) ? waterLevel : base + 4
    includeDetail: f32, // 1 = Detail-Oktave an (Default des JS-Gesetzes)
    hatAnker: f32,      // 1 = _macroAnker() lieferte einen Anker
    eroOriginX: f32,
    eroOriginZ: f32,
    eroCell: f32,
    eroDim: u32,        // 0 = kein Erosions-Grid (Delta 0)
    nTarns: u32,
    nTal: u32,          // Anzahl Tal-Vertices im anker-Pack
    nPunkte: u32,
};

@group(0) @binding(0) var<uniform> S: Skalare;
@group(0) @binding(1) var<storage, read> permV: array<u32>;
@group(0) @binding(2) var<storage, read> permMod12V: array<u32>;
@group(0) @binding(3) var<storage, read> permR: array<u32>;
@group(0) @binding(4) var<storage, read> anker: array<f32>;
@group(0) @binding(5) var<storage, read> eroGrid: array<f32>;
@group(0) @binding(6) var<storage, read> tarns: array<f32>;
@group(0) @binding(7) var<storage, read> punkte: array<f32>;
@group(0) @binding(8) var<storage, read_write> ausgabe: array<f32>;

// F2/G2 zur LAUFZEIT aus sqrt(3.0) — exakter Struktur-Port der Vendor-Quelle
// (dort: F2 = 0.5 * (sqrt(3.0) - 1.0), G2 = (3.0 - sqrt(3.0)) / 6.0).
const F2: f32 = 0.5 * (sqrt(3.0) - 1.0);
const G2: f32 = (3.0 - sqrt(3.0)) / 6.0;

// grad3 (x,y je Triple — noise2D liest nur grad3[gi] und grad3[gi+1]).
var<private> GRAD2: array<vec2<f32>, 12> = array<vec2<f32>, 12>(
    vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, 0.0), vec2<f32>(-1.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(-1.0, 0.0),
    vec2<f32>(0.0, 1.0), vec2<f32>(0.0, -1.0), vec2<f32>(0.0, 1.0), vec2<f32>(0.0, -1.0)
);

// noise2D über den :voxel-Strom (perm/permMod12 aus den lebenden Tabellen).
fn noise2dV(xin: f32, yin: f32) -> f32 {
    let s = (xin + yin) * F2;
    let i = i32(floor(xin + s));
    let j = i32(floor(yin + s));
    let t = f32(i + j) * G2;
    let x0 = xin - (f32(i) - t);
    let y0 = yin - (f32(j) - t);
    var i1 = 0u;
    var j1 = 1u;
    if (x0 > y0) { i1 = 1u; j1 = 0u; }
    let x1 = x0 - f32(i1) + G2;
    let y1 = y0 - f32(j1) + G2;
    let x2 = x0 - 1.0 + 2.0 * G2;
    let y2 = y0 - 1.0 + 2.0 * G2;
    let ii = u32(i & 255); // i32-& wie JS (auch für negative i), Index <= 511
    let jj = u32(j & 255);
    var n0 = 0.0;
    var n1 = 0.0;
    var n2 = 0.0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0.0) {
        let g = GRAD2[permMod12V[ii + permV[jj]]];
        let t0q = t0 * t0;
        n0 = t0q * t0q * (g.x * x0 + g.y * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0.0) {
        let g = GRAD2[permMod12V[ii + i1 + permV[jj + j1]]];
        let t1q = t1 * t1;
        n1 = t1q * t1q * (g.x * x1 + g.y * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0.0) {
        let g = GRAD2[permMod12V[ii + 1u + permV[jj + 1u]]];
        let t2q = t2 * t2;
        n2 = t2q * t2q * (g.x * x2 + g.y * y2);
    }
    return 70.0 * (n0 + n1 + n2);
}

// noise2D über den -macro-ridge-Strom (EIGENE perm-Tabelle; permMod12 = perm % 12).
fn noise2dR(xin: f32, yin: f32) -> f32 {
    let s = (xin + yin) * F2;
    let i = i32(floor(xin + s));
    let j = i32(floor(yin + s));
    let t = f32(i + j) * G2;
    let x0 = xin - (f32(i) - t);
    let y0 = yin - (f32(j) - t);
    var i1 = 0u;
    var j1 = 1u;
    if (x0 > y0) { i1 = 1u; j1 = 0u; }
    let x1 = x0 - f32(i1) + G2;
    let y1 = y0 - f32(j1) + G2;
    let x2 = x0 - 1.0 + 2.0 * G2;
    let y2 = y0 - 1.0 + 2.0 * G2;
    let ii = u32(i & 255);
    let jj = u32(j & 255);
    var n0 = 0.0;
    var n1 = 0.0;
    var n2 = 0.0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0.0) {
        let g = GRAD2[permR[ii + permR[jj]] % 12u];
        let t0q = t0 * t0;
        n0 = t0q * t0q * (g.x * x0 + g.y * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0.0) {
        let g = GRAD2[permR[ii + i1 + permR[jj + j1]] % 12u];
        let t1q = t1 * t1;
        n1 = t1q * t1q * (g.x * x1 + g.y * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0.0) {
        let g = GRAD2[permR[ii + 1u + permR[jj + 1u]] % 12u];
        let t2q = t2 * t2;
        n2 = t2q * t2q * (g.x * x2 + g.y * y2);
    }
    return 70.0 * (n0 + n1 + n2);
}

// _erosionDeltaAt — bilinear über das EINE Heimat-Grid (Kacheln reisen nicht:
// der Seh-Spiegel v1 deckt die Heimat-Region; jenseits liefert er das rohe
// Makro-Gesetz, exakt wie das JS vor dem Kachel-Bau).
fn erosionDeltaAt(x: f32, z: f32) -> f32 {
    if (S.eroDim < 2u) { return 0.0; }
    let fx = (x - S.eroOriginX) / S.eroCell;
    let fz = (z - S.eroOriginZ) / S.eroCell;
    let grenze = f32(S.eroDim) - 1.0;
    if (fx < 0.0 || fz < 0.0 || fx >= grenze || fz >= grenze) { return 0.0; }
    let i0 = u32(fx); // fx >= 0 hier: Trunkierung == JS (fx | 0)
    let j0 = u32(fz);
    let tx = fx - f32(i0);
    let tz = fz - f32(j0);
    let dim = S.eroDim;
    let a = i0 + j0 * dim;
    return (eroGrid[a] * (1.0 - tx) + eroGrid[a + 1u] * tx) * (1.0 - tz)
        + (eroGrid[a + dim] * (1.0 - tx) + eroGrid[a + dim + 1u] * tx) * tz;
}

// _tarnDeltaAt — Gauss-Mulden-Liste mit reach2-Early-Out.
fn tarnDeltaAt(x: f32, z: f32) -> f32 {
    var delta = 0.0;
    for (var i = 0u; i < S.nTarns; i = i + 1u) {
        let o = i * 5u;
        let dx = x - tarns[o];
        let dz = z - tarns[o + 1u];
        let d2 = dx * dx + dz * dz;
        if (d2 > tarns[o + 3u]) { continue; }
        delta = delta - tarns[o + 2u] * exp(-d2 / tarns[o + 4u]);
    }
    return delta;
}

// _ridgeAnkerNoise — 7-Oktaven-ridged-FBM auf dem -macro-ridge-Strom
// (rotierte + anisotrop gestreckte Basis, amp 0.52er-Fall, freq 2.13er-Sprung).
fn ridgeAnkerNoise(x: f32, z: f32) -> f32 {
    let rxBase = (x + z) * 0.7071;
    let rzBase = (z - x) * 0.7071 * 1.65;
    var ridge = 0.0;
    var amp = 0.5;
    var freq = 1.0 / 600.0;
    var norm = 0.0;
    for (var i = 0; i < 7; i = i + 1) {
        let v = noise2dR(rxBase * freq + f32(i) * 7.31, rzBase * freq + f32(i) * 7.31);
        let nv = 1.0 - abs(v);
        ridge = ridge + nv * nv * amp;
        norm = norm + amp;
        amp = amp * 0.52;
        freq = freq * 2.13;
    }
    return ridge / norm;
}

struct MakroBeitrag {
    massiv: f32,
    becken: f32,
    tDist: f32,
    tFloor: f32,
    mShape: f32,
};

// _macroSurfaceContribution — Massiv (rotierte Ellipse × Ridge-Noise^1.5),
// Becken-Mulde, Tal-Polyline-Distanz + per-Segment-Floor-Lerp.
fn macroSurfaceContribution(x: f32, z: f32) -> MakroBeitrag {
    let ddx = x - anker[0];
    let ddz = z - anker[1];
    let cs = cos(anker[4]);
    let sn = sin(anker[4]);
    let rxA = ddx * cs - ddz * sn;
    let rzA = ddx * sn + ddz * cs;
    let ax = rxA / anker[5];
    let aDist = sqrt(ax * ax + rzA * rzA);
    let mT = max(0.0, min(1.0, 1.0 - aDist / anker[2]));
    let mShape = mT * mT * (3.0 - 2.0 * mT);
    let ridge = ridgeAnkerNoise(x, z);
    var ridgePow = 0.0;
    if (ridge > 0.0) { ridgePow = pow(ridge, 1.5); } // pow(0,·)-Wache (f32-sicher)
    let massiv = mShape * (ridgePow * anker[3] * 1.25 + mShape * anker[3] * 0.35);
    let bdx = x - anker[6];
    let bdz = z - anker[7];
    let bDist = sqrt(bdx * bdx + bdz * bdz);
    let bT = max(0.0, min(1.0, 1.0 - bDist / anker[8]));
    let becken = -bT * bT * (3.0 - 2.0 * bT) * anker[9];
    var tDist = 1e30; // Infinity-Ersatz — greift nie (nTal >= 2, wenn Anker da)
    var tFloor = 0.0;
    let floorBasis = 14u + S.nTal * 2u;
    for (var i = 0u; i + 1u < S.nTal; i = i + 1u) {
        let aX = anker[14u + i * 2u];
        let aZ = anker[14u + i * 2u + 1u];
        let bX = anker[14u + (i + 1u) * 2u];
        let bZ = anker[14u + (i + 1u) * 2u + 1u];
        let ex = bX - aX;
        let ez = bZ - aZ;
        var len2 = ex * ex + ez * ez;
        if (len2 == 0.0) { len2 = 1.0; } // JS: || 1
        var t = ((x - aX) * ex + (z - aZ) * ez) / len2;
        t = max(0.0, min(1.0, t));
        let dx = x - (aX + ex * t);
        let dz = z - (aZ + ez * t);
        let d = sqrt(dx * dx + dz * dz);
        if (d < tDist) {
            tDist = d;
            tFloor = anker[floorBasis + i] + (anker[floorBasis + i + 1u] - anker[floorBasis + i]) * t;
        }
    }
    return MakroBeitrag(massiv, becken, tDist, tFloor, mShape);
}

// mesa-sm() — Gradient der dominanten glatten Struktur (cont0 + tect).
fn mesaSm(sx: f32, sz: f32) -> f32 {
    let cB = noise2dV(sx * 0.00014 + 7.2, sz * 0.00014 + 3.8);
    return max(0.0, cB) * 130.0 + cB * 15.0 + noise2dV(sx * 0.00088, sz * 0.00088) * 45.0;
}

// _terrainMacroSurfaceY — die komplette §5-Formel, Term-Reihenfolge identisch.
fn macroSurfaceY(x: f32, z: f32) -> f32 {
    // (a) Domain-Warp
    let warpX = noise2dV(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70.0;
    let warpZ = noise2dV(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70.0;
    let wx = x + warpX;
    let wz = z + warpZ;
    // (0a) kontinentale Basis
    let cBase = noise2dV(wx * 0.00014 + 7.2, wz * 0.00014 + 3.8);
    let cont0 = max(0.0, cBase) * 130.0 + cBase * 15.0 + 12.0;
    // (0b) tektonische Oktave
    let tect = noise2dV(wx * 0.00088, wz * 0.00088) * 45.0;
    // (b) Ruggedness-Feld
    let eroN = noise2dV(x * 0.0005, z * 0.0005) * 0.5 + 0.5;
    var mtn = 1.0 - eroN;
    if (mtn < 0.0) { mtn = 0.0; }
    mtn = mtn * mtn;
    // (b2) regionale Masken (Relief/Stil) + upland
    let reliefN = noise2dV(wx * 0.00019 + 33.1, wz * 0.00019 + 71.7) * 0.5 + 0.5;
    var upliftMask = min(1.0, max(0.0, (reliefN - 0.42) / 0.2));
    upliftMask = upliftMask * upliftMask * (3.0 - 2.0 * upliftMask);
    let styleN = noise2dV(wx * 0.00022 + 91.3, wz * 0.00022 + 5.9) * 0.5 + 0.5;
    var chainW = min(1.0, max(0.0, (styleN - 0.46) / 0.16));
    chainW = chainW * chainW * (3.0 - 2.0 * chainW);
    let upBroad = max(0.0, noise2dV(wx * 0.00035 + 19.3, wz * 0.00035 + 7.1));
    let upWarpX = noise2dV(wx * 0.0002 + 51.7, wz * 0.0002 + 13.1) * 300.0;
    let upWarpZ = noise2dV(wx * 0.0002 + 27.3, wz * 0.0002 + 88.9) * 300.0;
    let upRidge = 1.0 - abs(noise2dV((wx + upWarpX) * 0.00028 + 19.3, (wz + upWarpZ) * 0.00028 + 7.1));
    let upland = upliftMask * ((1.0 - chainW) * upBroad * 105.0 + chainW * upRidge * upRidge * 115.0);
    // (1) kontinentale Oktave
    let cont = noise2dV(wx * 0.0016, wz * 0.0016) * (8.0 + 28.0 * mtn);
    // (2) ridged-Oktaven
    let ridgeAmp = (5.0 + 38.0 * mtn) * S.steilheit;
    let rN = noise2dV(wx * 0.003, wz * 0.003);
    let ranges = (1.0 - abs(rN)) * (1.0 - abs(rN)) * ridgeAmp;
    let rN2 = noise2dV(wx * 0.0075 + 5.7, wz * 0.0075 - 2.3);
    let ranges2 = (1.0 - abs(rN2)) * (1.0 - abs(rN2)) * ridgeAmp * 0.5;
    // (3) Detail-Oktave
    var detail = 0.0;
    if (S.includeDetail > 0.5) {
        detail = noise2dV(x * 0.045, z * 0.045) * (1.0 + 3.0 * mtn);
    }
    var withoutTarn = S.base + cont0 + upland + tect + cont + ranges + ranges2 + detail + erosionDeltaAt(x, z);
    // Γ4 — Makro-Anker: Massiv + Becken + Drainage-Vor-Neigung + Tal/Trench
    if (S.hatAnker > 0.5) {
        let m = macroSurfaceContribution(x, z);
        withoutTarn = withoutTarn + m.massiv + m.becken;
        let distOutsideTal = max(0.0, m.tDist - anker[10]);
        let drainageH = min(distOutsideTal * 0.06, 35.0);
        let bdx2 = x - anker[6];
        let bdz2 = z - anker[7];
        let distBecken = sqrt(bdx2 * bdx2 + bdz2 * bdz2);
        let beckenBlock = max(0.0, min(1.0, (distBecken - anker[8] * 0.6) / (anker[8] * 0.4)));
        withoutTarn = withoutTarn + drainageH * (1.0 - m.mShape) * beckenBlock;
        if (m.tDist < anker[10]) {
            let uT = m.tDist / anker[10];
            var uShape = 0.0;
            if (uT > 0.0) { uShape = pow(uT, anker[13]); } // pow(0,·)-Wache
            let ziel = S.base + m.tFloor;
            withoutTarn = withoutTarn + (ziel - withoutTarn) * (1.0 - uShape);
            if (m.tDist < anker[12]) {
                let iT = 1.0 - m.tDist / anker[12];
                let iShape = iT * iT * (3.0 - 2.0 * iT);
                withoutTarn = withoutTarn - iShape * anker[11];
            }
        }
    }
    // T6a — Canyons (ridged × Region-Maske, Floor base-65)
    let canyonRegion = max(0.0, min(1.0, (noise2dV(wx * 0.0003 + 61.1, wz * 0.0003 - 28.7) - 0.3) / 0.18));
    if (canyonRegion > 0.001) {
        let cR = 1.0 - abs(noise2dV(wx * 0.00105 + 8.3, wz * 0.00105 - 14.9));
        let cProfile = max(0.0, (cR - 0.6) / 0.4);
        withoutTarn = withoutTarn - cProfile * cProfile * canyonRegion * 150.0;
        let cFloor = S.base - 65.0;
        if (withoutTarn < cFloor) { withoutTarn = cFloor; }
    }
    // T7a — Mesa (slope-gated smooth terrace)
    let mesaRegion = max(0.0, min(1.0, (noise2dV(wx * 0.00034 + 13.7, wz * 0.00034 + 47.3) - 0.45) / 0.13));
    if (mesaRegion > 0.001) {
        let gd = 7.0;
        let dhx = mesaSm(wx + gd, wz) - mesaSm(wx - gd, wz);
        let dhz = mesaSm(wx, wz + gd) - mesaSm(wx, wz - gd);
        let slope = sqrt(dhx * dhx + dhz * dhz) / (2.0 * gd);
        var flach = 1.0 - min(1.0, slope / 0.35);
        flach = flach * flach * (3.0 - 2.0 * flach);
        let strength = mesaRegion * flach;
        if (strength > 0.001) {
            let stepH = 26.0;
            let f = withoutTarn / stepH;
            let fl = floor(f);
            let t = f - fl;
            let shaped = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
            let terraced = (fl + shaped) * stepH;
            withoutTarn = withoutTarn + (terraced - withoutTarn) * strength;
        }
    }
    // T8 — Decken-Backstop (255-tanh-Klemme); tanh-Arg auf 30 geklemmt (f32)
    if (withoutTarn > 255.0) {
        withoutTarn = 255.0 + 12.0 * tanh(min((withoutTarn - 255.0) / 12.0, 30.0));
    }
    // V9.60-c.2 — U-Boot-Terme (Shelf/Slope/Ridge/Sediment)
    let depthBelow = S.wasser - withoutTarn;
    var withoutTarnFinal = withoutTarn;
    if (depthBelow > 1.5) {
        let subMask = min(1.0, max(0.0, (depthBelow - 3.0) / 6.0));
        let slope2 = max(0.0, depthBelow - 4.0);
        let slopeDrop = -slope2 * 0.6;
        let subA = noise2dV(x * 0.019, z * 0.019 + 31.0) * (3.0 + slope2 * 0.3);
        let rBN = noise2dV(x * 0.026 + 17.0, z * 0.026 + 9.0);
        let subRidge = ((1.0 - abs(rBN)) * (1.0 - abs(rBN)) - 0.3) * (3.0 + slope2 * 0.25);
        let subC = noise2dV(x * 0.062 - 17.0, z * 0.062 + 8.0) * 1.0;
        withoutTarnFinal = withoutTarnFinal + slopeDrop + (subA + subRidge + subC) * subMask;
    }
    // T8 — Abyss-tanh-Klemme
    let abyssClamp = S.base - 112.0;
    if (withoutTarnFinal < abyssClamp) {
        withoutTarnFinal = abyssClamp - 8.0 * tanh(min((abyssClamp - withoutTarnFinal) / 8.0, 30.0));
    }
    // V9.51 — Tarn-Delta + waterRef-Klemme
    let tarnDelta = tarnDeltaAt(x, z);
    if (tarnDelta == 0.0) { return withoutTarnFinal; }
    return max(withoutTarnFinal + tarnDelta, S.wasser + 1.0);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let idx = gid.x;
    if (idx >= S.nPunkte) { return; }
    let x = punkte[idx * 2u];
    let z = punkte[idx * 2u + 1u];
    ausgabe[idx] = macroSurfaceY(x, z);
}
`;

    // ── spiegelEingaben(realm) — der JS-Packer der LEBENDEN Quellen ──────────
    // Liest ausschließlich die kanonischen Laufzeit-Größen (Gesetz #0, kein
    // Zahlen-Zwilling): die Noise-Tabellen der lebenden SimplexNoise-Instanzen,
    // die Skalare aus state, den persistierten Makro-Anker, das Erosions-
    // Heimat-Grid und die Tarn-Liste. Rückgabe: plain Objekt mit typed arrays
    // + Metadaten — 1:1 die Bind-Group-Inhalte für WGSL_MAKRO.
    function spiegelEingaben(realm) {
        if (!realm || typeof realm._terrainMacroSurfaceY !== "function") {
            throw new Error("__feldWgsl.spiegelEingaben: realm ohne _terrainMacroSurfaceY");
        }
        // Lazy-Init der lebenden Streams (ein Aufruf weckt _voxelNoise und —
        // wenn ein Anker existiert — _macroRidgeNoise über den Anker-Pfad).
        realm._terrainMacroSurfaceY(0, 0);
        if (!realm._macroRidgeNoise && typeof realm._ridgeAnkerNoise === "function") {
            realm._ridgeAnkerNoise(0, 0); // ankerlose Welt: Ridge-Strom direkt wecken
        }
        const vn = realm._voxelNoise;
        const rn = realm._macroRidgeNoise;
        if (!vn || !vn.perm || !vn.permMod12) {
            throw new Error("__feldWgsl.spiegelEingaben: _voxelNoise (perm/permMod12) fehlt");
        }
        if (!rn || !rn.perm) {
            throw new Error("__feldWgsl.spiegelEingaben: _macroRidgeNoise (perm) fehlt");
        }
        const st = realm.state || {};
        const base = st.terrainBaseHeight || 0;
        const steilheit = st.terrainSteepness || 1;
        const wasser = Number.isFinite(st.waterLevel) ? st.waterLevel : base + 4;

        // Makro-Anker (persistiertes Erbgut; gen<3 → null → hatAnker 0).
        const anker = typeof realm._macroAnker === "function" ? realm._macroAnker() : null;
        const nTal = anker && Array.isArray(anker.talVertices) ? anker.talVertices.length : 0;
        // Pack-Layout (Indices == WGSL-Leser):
        //   [0..1] massivC.x/z  [2] massivR  [3] massivH  [4] massivRot
        //   [5] massivAspect    [6..7] beckenC.x/z  [8] beckenR  [9] beckenD
        //   [10] talBreite [11] talTrenchTiefe [12] talTrenchBreite [13] talBlendExp
        //   [14 + 2i, 15 + 2i] talVertices[i].x/z · [14 + 2·nTal + i] talFloors[i]
        const ankerPack = new Float32Array(14 + Math.max(1, nTal * 3));
        if (anker) {
            ankerPack[0] = anker.massivC.x;
            ankerPack[1] = anker.massivC.z;
            ankerPack[2] = anker.massivR;
            ankerPack[3] = anker.massivH;
            ankerPack[4] = anker.massivRot;
            ankerPack[5] = anker.massivAspect;
            ankerPack[6] = anker.beckenC.x;
            ankerPack[7] = anker.beckenC.z;
            ankerPack[8] = anker.beckenR;
            ankerPack[9] = anker.beckenD;
            ankerPack[10] = anker.talBreite;
            ankerPack[11] = anker.talTrenchTiefe;
            ankerPack[12] = anker.talTrenchBreite;
            ankerPack[13] = anker.talBlendExp;
            for (let i = 0; i < nTal; i++) {
                ankerPack[14 + i * 2] = anker.talVertices[i].x;
                ankerPack[14 + i * 2 + 1] = anker.talVertices[i].z;
                ankerPack[14 + nTal * 2 + i] = anker.talFloors[i];
            }
        }

        // Erosions-HEIMAT-Grid (±1024 m; kann vor dem Worldgen null sein → dim 0).
        const ero = typeof realm._erosionFor === "function" ? realm._erosionFor(0, 0) : null;
        const eroDim = ero && ero.delta && ero.dim >= 2 ? ero.dim : 0;
        const erosionGrid = eroDim
            ? ero.delta instanceof Float32Array
                ? ero.delta
                : Float32Array.from(ero.delta)
            : new Float32Array(1);

        // Tarn-Liste (je 5 Werte — exakt die _tarnDeltaAt-Leser-Reihenfolge).
        const tarnListe = Array.isArray(st.tarns) ? st.tarns : [];
        const nTarns = tarnListe.length;
        const tarnPack = new Float32Array(Math.max(1, nTarns * 5));
        for (let i = 0; i < nTarns; i++) {
            const t = tarnListe[i];
            tarnPack[i * 5] = t.x;
            tarnPack[i * 5 + 1] = t.z;
            tarnPack[i * 5 + 2] = t.d;
            tarnPack[i * 5 + 3] = t.reach2;
            tarnPack[i * 5 + 4] = t.twoSig2;
        }

        return {
            // u32-Storage-Buffer (die lebenden Tabellen, Uint8 → Uint32)
            permVoxel: Uint32Array.from(vn.perm),
            permMod12Voxel: Uint32Array.from(vn.permMod12),
            permRidge: Uint32Array.from(rn.perm),
            // Skalare (Uniform-Reihenfolge: 8×f32, dann 4×u32)
            base: base,
            steilheit: steilheit,
            wasser: wasser,
            includeDetail: 1,
            hatAnker: anker ? 1 : 0,
            eroOriginX: eroDim ? ero.originX : 0,
            eroOriginZ: eroDim ? ero.originZ : 0,
            eroCell: eroDim ? ero.cell : 1,
            eroDim: eroDim,
            nTarns: nTarns,
            nTal: nTal,
            // f32-Storage-Buffer
            ankerPack: ankerPack,
            erosionGrid: erosionGrid,
            tarnPack: tarnPack,
        };
    }

    root.__feldWgsl = {
        VERSION: VERSION,
        WGSL_MAKRO: WGSL_MAKRO,
        spiegelEingaben: spiegelEingaben,
    };
})(typeof self !== "undefined" ? self : globalThis);
