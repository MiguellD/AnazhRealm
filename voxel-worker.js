// =============================================================================
// voxel-worker.js — AnazhRealm Worker für Voxel-Density-Sampling
//
// V9.89 (Welle Perf-3.c Phase 1 — Worker-Foundation): mirror der Density-Pipeline
// aus `anazhRealm.js` für den Web-Worker-Kontext. Der Worker bekommt einen
// State-Snapshot per `init`-Message (Seed, Atlas, Erosion, Tarns, voxelEdits,
// baseHeight, waterLevel), Delta-Updates bei Welt-Mutationen, und beantwortet
// `density-grid`-Requests mit einem Float32Array via Transferable (zero-copy).
//
// Heilige Lektion gewahrt (`anazhRealm.js` bleibt der EINE Stamm): dies ist eine
// BAUSTELLE (separate Ausführungs-Umgebung), kein Domäne-Modul-Split. Die
// Funktions-Namen + Logik spiegeln 1:1 die Main-Thread-Implementierung — wer
// einen Algorithmus dort ändert, MUSS hier mit-wandern (Determinismus-Test im
// playtest verifiziert bit-identische Output bei jedem Lauf).
//
// Profi-Vorbild Subnautica/NMS/Astroneer: Welt-Density läuft in Workers parallel
// zum Main-Thread, dieser braucht nur noch Iso-Meshing + Collision-BVH (~30 ms).
//
// **Phase 1 Scope** (diese Datei jetzt): Worker spawnt, empfängt State, berechnet
// Density-Grids bit-identisch zum Main-Thread. KEIN Integration-Pfad — der
// Main-Thread baut weiterhin synchron, der Worker wird nur per Determinismus-
// Test angesteuert. Phase 2 (V9.90+): tatsächliche async Integration in
// `_buildVoxelChunkData`.
// =============================================================================

// Vendor-`simplex-noise.js` prüft `typeof window !== 'undefined'` für sein
// Global-Export; in Worker-Scope existiert das nicht. Shim VOR importScripts
// macht das Export auf `self.SimplexNoise` sichtbar (Worker-Standard-Pattern,
// bricht KEINE Vendor-Logik — die IIFE legt SimplexNoise auf window.X, und
// window === self in unserem Shim).
self.window = self;
importScripts("./vendor/simplex-noise.js");

// State-Container — wird per init-Message gesetzt + per state-update-Delta gepflegt.
const state = {
    seed: null,
    noise: null,
    baseHeight: 0,
    waterLevel: 0,
    hydrosphere: null, // { ready, originX, originZ, cell, dim, riverBuckets, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear, water:{waterY, waterKind} }
    hydroBand: null, // V9.91 — { top, bottom } für Cell-Klassifikation-Skip
    erosion: null, // { originX, originZ, cell, dim, delta }
    tarns: null, // Array of { x, z, d, reach2, twoSig2 }
    voxelEdits: [], // Array of { x, y, z, r, strength, mode }
    hydroComputing: false,
    carveBankSlope: 1.4, // Mirror AnazhRealm.HYDROSPHERE.carveBankSlope
};

self.onmessage = function (e) {
    const msg = e.data;
    if (!msg || !msg.type) return;
    try {
        if (msg.type === "init" || msg.type === "state-set") {
            applyStateSnapshot(msg.snapshot);
            self.postMessage({ type: "ack", op: msg.type, requestId: msg.requestId || null });
        } else if (msg.type === "state-update") {
            applyStateDelta(msg.delta);
            self.postMessage({ type: "ack", op: "state-update", requestId: msg.requestId || null });
        } else if (msg.type === "density-grid") {
            const { ox, oy, oz, dimX, dimY, dimZ, step, requestId } = msg;
            const density = computeDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step);
            self.postMessage({ type: "density-grid-result", requestId, density: density.buffer }, [density.buffer]);
        } else if (msg.type === "chunk-mesh") {
            // V9.91 (Phase 3): voller Chunk-Mesh-Build im Worker. Returns
            // {positions, normals, indices, colors, waterCells} via
            // Transferable. Main-Thread macht nur noch BufferGeometry-
            // Konstruktion + Architektur-Cell-Stempel + BVH-Collision +
            // Scene-Attach (~30 ms statt 100-150 ms).
            const { cx, cz, lod, requestId } = msg;
            const mesh = buildChunkMesh(cx, cz, lod);
            if (mesh.empty) {
                self.postMessage({ type: "chunk-mesh-result", requestId, empty: true, lod: lod | 0 });
            } else {
                self.postMessage(
                    {
                        type: "chunk-mesh-result",
                        requestId,
                        empty: false,
                        lod: lod | 0,
                        positions: mesh.positions.buffer,
                        normals: mesh.normals.buffer,
                        indices: mesh.indices.buffer,
                        colors: mesh.colors.buffer,
                        waterCells: mesh.waterCells.buffer,
                        vertCount: mesh.positions.length / 3,
                        indexCount: mesh.indices.length,
                    },
                    [
                        mesh.positions.buffer,
                        mesh.normals.buffer,
                        mesh.indices.buffer,
                        mesh.colors.buffer,
                        mesh.waterCells.buffer,
                    ]
                );
            }
        } else if (msg.type === "ping") {
            self.postMessage({ type: "pong", requestId: msg.requestId || null });
        }
    } catch (err) {
        self.postMessage({
            type: "error",
            op: msg.type,
            requestId: msg.requestId || null,
            message: String(err && err.message ? err.message : err),
        });
    }
};

function applyStateSnapshot(snap) {
    if (!snap) return;
    if (snap.seed && snap.seed !== state.seed) {
        state.seed = snap.seed;
        state.noise = new SimplexNoise(state.seed + ":voxel");
    }
    if (typeof snap.baseHeight === "number") state.baseHeight = snap.baseHeight;
    if (typeof snap.waterLevel === "number") state.waterLevel = snap.waterLevel;
    if (snap.hydrosphere !== undefined) state.hydrosphere = snap.hydrosphere;
    if (snap.hydroBand !== undefined) state.hydroBand = snap.hydroBand;
    if (snap.erosion !== undefined) state.erosion = snap.erosion;
    if (snap.tarns !== undefined) state.tarns = snap.tarns;
    if (snap.voxelEdits !== undefined) state.voxelEdits = snap.voxelEdits;
    if (typeof snap.hydroComputing === "boolean") state.hydroComputing = snap.hydroComputing;
    if (typeof snap.carveBankSlope === "number") state.carveBankSlope = snap.carveBankSlope;
}

function applyStateDelta(delta) {
    if (!delta) return;
    // Delta-Update: nur explizit gesetzte Felder werden ersetzt. voxelEdits kann
    // entweder vollständig ersetzt werden (full sync) oder via append (add).
    if (delta.voxelEditAppend) {
        if (!Array.isArray(state.voxelEdits)) state.voxelEdits = [];
        state.voxelEdits.push(delta.voxelEditAppend);
        return;
    }
    if (delta.voxelEditRemoveLast) {
        if (Array.isArray(state.voxelEdits) && state.voxelEdits.length) state.voxelEdits.pop();
        return;
    }
    applyStateSnapshot(delta);
}

// =============================================================================
// Density-Grid-Build
// =============================================================================

function computeDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step) {
    // Identische Indizierung wie `_voxelSampleDensityGrid` in anazhRealm.js:
    // Nx=dimX+1, Ny=dimY+1, Nz=dimZ+1 — wir samplen Vertices (Cell-Ecken).
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const Nz = dimZ + 1;
    const density = new Float32Array(Nx * Ny * Nz);
    for (let k = 0; k < Nz; k++) {
        for (let j = 0; j < Ny; j++) {
            for (let i = 0; i < Nx; i++) {
                density[i + j * Nx + k * Nx * Ny] = terrainDensityAt(ox + i * step, oy + j * step, oz + k * step);
            }
        }
    }
    return density;
}

// =============================================================================
// Mirror von `_terrainDensityAt` + Subroutinen aus anazhRealm.js
// Bei jeder Anpassung dort: hier mit-wandern (Determinismus-Test fängt Drift).
// =============================================================================

function terrainDensityAt(x, y, z) {
    if (!state.noise) return 0;
    const surf = terrainMacroSurfaceY(x, z, true);
    let d = surf - y;
    d += state.noise.noise3D(x * 0.05, y * 0.05, z * 0.05) * 7;
    d += state.noise.noise3D(x * 0.018, y * 0.022, z * 0.018) * 5;
    // Höhlen-Ridged-Hülle.
    const base = state.baseHeight || 0;
    const caveFloor = clamp01((y - (base - 28)) / 8);
    const caveCeil = clamp01((surf - 6 - y) / 8);
    const caveEnv = caveFloor * caveCeil;
    if (caveEnv > 0) {
        const ridge = 1 - Math.abs(state.noise.noise3D(x * 0.03, y * 0.034, z * 0.03));
        const cave = Math.max(0, (ridge - 0.7) / 0.3);
        d -= cave * caveEnv * 36;
    }
    // Hydrosphäre-Carve + See-Becken (nur wenn ready + nicht hydroComputing).
    const hydro = state.hydrosphere;
    if (hydro && hydro.ready && !state.hydroComputing) {
        d -= hydrosphereCarveAt(x, z);
        const lk = hydrosphereLakeAt(x, z);
        if (lk) {
            const flatD = lk.bedY - y;
            d = d * (1 - lk.w) + flatD * lk.w;
        }
    }
    // Voxel-Edits — Spieler-Wille gewinnt zuletzt.
    const edits = state.voxelEdits;
    if (edits && edits.length) {
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const dx = x - ed.x;
            const dy = y - ed.y;
            const dz = z - ed.z;
            const dist2 = dx * dx + dy * dy + dz * dz;
            const r = ed.r;
            if (dist2 < r * r) {
                const fall = 1 - Math.sqrt(dist2) / r;
                const amt = fall * (ed.strength || 48);
                if (ed.mode === "fill") d += amt;
                else d -= amt;
            }
        }
    }
    return d;
}

function terrainMacroSurfaceY(x, z, includeDetail) {
    if (!state.noise) return state.baseHeight || 0;
    const n = state.noise;
    const base = state.baseHeight || 0;
    const warpX = n.noise2D(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70;
    const warpZ = n.noise2D(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70;
    const wx = x + warpX;
    const wz = z + warpZ;
    const tect = n.noise2D(wx * 0.00088, wz * 0.00088) * 35;
    const cont = n.noise2D(wx * 0.0058, wz * 0.0058) * 34;
    const ero = n.noise2D(x * 0.0014, z * 0.0014) * 0.5 + 0.5;
    let mtn = 1 - ero;
    if (mtn < 0) mtn = 0;
    mtn *= mtn;
    const ridgeAmp = 12 + 55 * mtn;
    const rN = n.noise2D(wx * 0.013, wz * 0.013);
    const ranges = (1 - Math.abs(rN)) * (1 - Math.abs(rN)) * ridgeAmp;
    const rN2 = n.noise2D(wx * 0.026 + 5.7, wz * 0.026 - 2.3);
    const ranges2 = (1 - Math.abs(rN2)) * (1 - Math.abs(rN2)) * ridgeAmp * 0.5;
    const detail = includeDetail ? n.noise2D(x * 0.045, z * 0.045) * 4 : 0;
    const withoutTarn = base + tect + cont + ranges + ranges2 + detail + erosionDeltaAt(x, z);
    const waterRefSub = Number.isFinite(state.waterLevel) ? state.waterLevel : base + 4;
    const depthBelow = waterRefSub - withoutTarn;
    let withoutTarnFinal = withoutTarn;
    if (depthBelow > 1.5) {
        const subMask = Math.min(1, Math.max(0, (depthBelow - 3) / 6));
        const slope = Math.max(0, depthBelow - 4);
        const slopeDrop = -slope * 0.6;
        const subA = n.noise2D(x * 0.019, z * 0.019 + 31) * (3 + slope * 0.3);
        const rBN = n.noise2D(x * 0.026 + 17, z * 0.026 + 9);
        const subRidge = ((1 - Math.abs(rBN)) * (1 - Math.abs(rBN)) - 0.3) * (3 + slope * 0.25);
        const subC = n.noise2D(x * 0.062 - 17, z * 0.062 + 8) * 1.0;
        withoutTarnFinal += slopeDrop + (subA + subRidge + subC) * subMask;
    }
    const td = tarnDeltaAt(x, z);
    if (td === 0) return withoutTarnFinal;
    const waterRef = Number.isFinite(state.waterLevel) ? state.waterLevel : base + 4;
    return Math.max(withoutTarnFinal + td, waterRef + 1);
}

function erosionDeltaAt(x, z) {
    const e = state.erosion;
    if (!e) return 0;
    const fx = (x - e.originX) / e.cell;
    const fz = (z - e.originZ) / e.cell;
    if (fx < 0 || fz < 0 || fx >= e.dim - 1 || fz >= e.dim - 1) return 0;
    const i0 = fx | 0;
    const j0 = fz | 0;
    const tx = fx - i0;
    const tz = fz - j0;
    const d = e.delta;
    const dim = e.dim;
    const a = i0 + j0 * dim;
    return (d[a] * (1 - tx) + d[a + 1] * tx) * (1 - tz) + (d[a + dim] * (1 - tx) + d[a + dim + 1] * tx) * tz;
}

function tarnDeltaAt(x, z) {
    const tarns = state.tarns;
    if (!tarns || !tarns.length) return 0;
    let delta = 0;
    for (let i = 0; i < tarns.length; i++) {
        const t = tarns[i];
        const dx = x - t.x;
        const dz = z - t.z;
        const d2 = dx * dx + dz * dz;
        if (d2 > t.reach2) continue;
        delta -= t.d * Math.exp(-d2 / t.twoSig2);
    }
    return delta;
}

function hydrosphereCarveAt(x, z) {
    const h = state.hydrosphere;
    if (!h || !h.ready) return 0;
    let cut = 0;
    const rb = h.riverBuckets;
    if (rb) {
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi >= 0 && bj >= 0 && bi < bd && bj < bd) {
            const list = rb[bj * bd + bi];
            if (list) {
                const bankSlope = state.carveBankSlope;
                for (let s = 0; s < list.length; s++) {
                    const seg = list[s];
                    const ex = seg.bx - seg.ax;
                    const ez = seg.bz - seg.az;
                    const len2 = ex * ex + ez * ez || 1;
                    let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                    const px = seg.ax + ex * t;
                    const pz = seg.az + ez * t;
                    const dist = Math.hypot(x - px, z - pz);
                    const halfW = seg.hwA + (seg.hwB - seg.hwA) * t;
                    const D = seg.dA + (seg.dB - seg.dA) * t;
                    const bankW = Math.max(2, D * bankSlope);
                    let rc = 0;
                    if (dist <= halfW) {
                        rc = D;
                    } else if (dist < halfW + bankW) {
                        const u = (dist - halfW) / bankW;
                        rc = D * (1 - u * u * (3 - 2 * u));
                    }
                    if (rc > cut) cut = rc;
                }
            }
        }
    }
    return cut;
}

function hydrosphereLakeAt(x, z) {
    const h = state.hydrosphere;
    if (!h || !h.ready) return null;
    const lw = h.lakeW;
    const lb = h.lakeBedCell;
    const ln = h.lakeNear;
    if (!lw || !lb || !ln) return null;
    const dim = h.dim;
    const cell = h.cell;
    const ci = Math.floor((x - h.originX) / cell);
    const cj = Math.floor((z - h.originZ) / cell);
    if (ci < 0 || cj < 0 || ci >= dim || cj >= dim || !ln[ci + cj * dim]) return null;
    const cf = (x - h.originX) / cell - 0.5;
    const gf = (z - h.originZ) / cell - 0.5;
    const i0 = Math.floor(cf);
    const j0 = Math.floor(gf);
    const tx = cf - i0;
    const tz = gf - j0;
    const cl = (v) => (v < 0 ? 0 : v >= dim ? dim - 1 : v);
    const i0c = cl(i0);
    const i1c = cl(i0 + 1);
    const r0 = cl(j0) * dim;
    const r1 = cl(j0 + 1) * dim;
    const w =
        (lw[i0c + r0] * (1 - tx) + lw[i1c + r0] * tx) * (1 - tz) + (lw[i0c + r1] * (1 - tx) + lw[i1c + r1] * tx) * tz;
    if (w <= 0) return null;
    const bedY =
        (lb[i0c + r0] * (1 - tx) + lb[i1c + r0] * tx) * (1 - tz) + (lb[i0c + r1] * (1 - tx) + lb[i1c + r1] * tx) * tz;
    return { bedY, w };
}

function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

// =============================================================================
// V9.91 (Welle Perf-3.c Phase 3 — voller Chunk-Mesh im Worker)
// Mirror der Meshing-Pipeline aus anazhRealm.js:
//   _voxelChunkConfig, _voxelExtractSurfaceVertices, _voxelEmitQuadIndices,
//   _voxelLaplacianSmoothPositions, _voxelCropPad, _voxelGradientNormals,
//   _buildVoxelChunkWaterCells (OHNE Architektur-Stempel — Main-only),
//   _attachVoxelFieldColors (worldFieldAt + waterLevelAt), plus die
//   Hilfsfunktionen _waterLevelAt + _hydroRiverAt.
// Bei JEDER Anpassung dort: hier mit-wandern. Determinismus-Test fängt Drift.
// =============================================================================

const CELL_STATE = { AIR: 0, WATER: 1, SOLID: 2 };

function voxelChunkConfig(lod) {
    if ((lod | 0) >= 1) return { dim: 12, step: 3.6, span: 43.2, dimY: 62, floorDrop: 90, lod: 1 };
    return { dim: 24, step: 1.8, span: 43.2, dimY: 124, floorDrop: 90, lod: 0 };
}

// Lazy-Init der 5 worldField-Noises (separate Seeds für unkorrelierte Kanäle).
// Gleiche Konstruktion wie `worldFieldAt` in anazhRealm.js — Determinismus
// ist seed-abhängig, alle 5 leben vom worldMeta.seed.
let worldField = null;
function ensureWorldField() {
    if (worldField && worldField.seed === state.seed) return worldField;
    if (!state.seed) return null;
    worldField = {
        seed: state.seed,
        lebendigNoise: new SimplexNoise(state.seed + "-veg-lebendig"),
        dichteNoise: new SimplexNoise(state.seed + "-veg-dichte"),
        glutNoise: new SimplexNoise(state.seed + "-veg-glut"),
        magieNoise: new SimplexNoise(state.seed + "-veg-magie"),
        rngNoise: new SimplexNoise(state.seed + "-veg-rng"),
    };
    return worldField;
}

function worldFieldAt(x, z) {
    const f = ensureWorldField();
    if (!f) return { lebendig: 0, dichte: 0, glut: 0, magieleitung: 0 };
    const s = 0.005;
    const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2));
    return {
        lebendig: n01(f.lebendigNoise.noise2D(x * s, z * s)),
        dichte: n01(f.dichteNoise.noise2D(x * s + 100, z * s - 200)),
        glut: n01(f.glutNoise.noise2D(x * s + 500, z * s + 700)),
        magieleitung: n01(f.magieNoise.noise2D(x * s - 333, z * s + 999)),
    };
}

function hydroRiverAt(x, z) {
    const h = state.hydrosphere;
    if (!h || !h.ready || !h.riverBuckets) return null;
    const bs = h.bucketSize;
    const bd = h.bucketsDim;
    const bi = Math.floor((x - h.originX) / bs);
    const bj = Math.floor((z - h.originZ) / bs);
    if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return null;
    const list = h.riverBuckets[bj * bd + bi];
    if (!list) return null;
    const bankSlope = state.carveBankSlope;
    let bestD = Infinity;
    let depth = 0;
    for (let s = 0; s < list.length; s++) {
        const seg = list[s];
        const ex = seg.bx - seg.ax;
        const ez = seg.bz - seg.az;
        const len2 = ex * ex + ez * ez || 1;
        let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const px = seg.ax + ex * t;
        const pz = seg.az + ez * t;
        const dist = Math.hypot(x - px, z - pz);
        const halfW = seg.hwA + (seg.hwB - seg.hwA) * t;
        const D = seg.dA + (seg.dB - seg.dA) * t;
        const bankW = Math.max(2, D * bankSlope);
        if (dist <= halfW + bankW && dist < bestD) {
            bestD = dist;
            depth = D;
        }
    }
    if (bestD === Infinity) return null;
    return { depth, surfaceY: terrainMacroSurfaceY(x, z, true) - depth * 0.4 };
}

function waterLevelAt(x, z) {
    let level = typeof state.waterLevel === "number" ? state.waterLevel : 0;
    const h = state.hydrosphere;
    if (h && h.ready && h.water && h.water.waterKind) {
        const dim = h.dim;
        const cell = h.cell;
        const ci = Math.floor((x - h.originX) / cell);
        const cj = Math.floor((z - h.originZ) / cell);
        const wK = h.water.waterKind;
        const wY = h.water.waterY;
        for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
                const ni = ci + di;
                const nj = cj + dj;
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const idx = ni + nj * dim;
                if (wK[idx] === 2 && wY[idx] > level) level = wY[idx];
            }
        }
    }
    const river = hydroRiverAt(x, z);
    if (river && river.surfaceY > level) level = river.surfaceY;
    return level;
}

// V13.1 — Mirror von `_atlasWaterLevelAt`: Atlas-strikter Wasser-Spiegel +
// Rand-Tiefen-Gate (statt des 16-m-See-Dilatations-Bleeds). exact-Ozean/See →
// voller Spiegel; Atlas-Land im 3×3-Rand → Spiegel nur wenn Terrain ≤ BAND
// darunter (flacher Ufer-Rand); sonst -Infinity (Hang-Schatten weg). Muss 1:1
// mit der Main-Thread-Methode wandern (Determinismus-Test ist die Wand).
function atlasWaterLevelAt(x, z, terrainTopY) {
    let level = -Infinity;
    const h = state.hydrosphere;
    if (h && h.ready && h.water && h.water.waterKind) {
        const dim = h.dim;
        const cell = h.cell;
        const ci = Math.floor((x - h.originX) / cell);
        const cj = Math.floor((z - h.originZ) / cell);
        if (ci >= 0 && cj >= 0 && ci < dim && cj < dim) {
            const wK = h.water.waterKind;
            const wY = h.water.waterY;
            const here = wK[ci + cj * dim];
            if (here === 1 || here === 2) {
                level = wY[ci + cj * dim];
            } else {
                let rim = -Infinity;
                for (let dj = -1; dj <= 1; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        const ni = ci + di;
                        const nj = cj + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        const nk = wK[ni + nj * dim];
                        if ((nk === 1 || nk === 2) && wY[ni + nj * dim] > rim) rim = wY[ni + nj * dim];
                    }
                }
                // V13.7 — verbundenes Wasser (Mirror von `_atlasWaterLevelAt`): fülle
                // bis zum Body-Spiegel, wenn Terrain UNTER dem Spiegel liegt (jede
                // Tiefe, kein 3,6-m-Cap mehr). Heilt die vertikalen Ufer-Wände; kein
                // Hang-Schatten (Terrain über Spiegel bleibt abgelehnt), kein Phantom.
                if (rim > -Infinity && terrainTopY < rim) {
                    level = rim;
                }
            }
        }
    }
    const river = hydroRiverAt(x, z);
    if (river && river.surfaceY > level) level = river.surfaceY;
    return level;
}

// =============================================================================
// Surface-Nets-Meshing (Mirror der `_voxelChunkGeometry`-Subroutinen)
// =============================================================================

const EDGES = [
    [0, 1],
    [0, 2],
    [0, 4],
    [1, 3],
    [1, 5],
    [2, 3],
    [2, 6],
    [3, 7],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
];

function extractSurfaceVertices(density, ox, oy, oz, dimX, dimY, dimZ, step) {
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
    const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
    const solid = (v) => v > 0;
    const cellVert = new Int32Array(dimX * dimY * dimZ).fill(-1);
    const positions = [];
    const vertCells = [];
    for (let k = 0; k < dimZ; k++) {
        for (let j = 0; j < dimY; j++) {
            for (let i = 0; i < dimX; i++) {
                const corner = new Array(8);
                let mask = 0;
                for (let c = 0; c < 8; c++) {
                    const cx = i + (c & 1);
                    const cy = j + ((c >> 1) & 1);
                    const cz = k + ((c >> 2) & 1);
                    corner[c] = density[gi(cx, cy, cz)];
                    if (solid(corner[c])) mask |= 1 << c;
                }
                if (mask === 0 || mask === 0xff) continue;
                let vx = 0;
                let vy = 0;
                let vz = 0;
                let count = 0;
                for (const [a, b] of EDGES) {
                    if (solid(corner[a]) === solid(corner[b])) continue;
                    const da = corner[a];
                    const db = corner[b];
                    const denom = da - db;
                    const t = Math.abs(denom) > 1e-9 ? da / denom : 0.5;
                    const ax = a & 1;
                    const ay = (a >> 1) & 1;
                    const az = (a >> 2) & 1;
                    const bx = b & 1;
                    const by = (b >> 1) & 1;
                    const bz = (b >> 2) & 1;
                    vx += ax + (bx - ax) * t;
                    vy += ay + (by - ay) * t;
                    vz += az + (bz - az) * t;
                    count++;
                }
                if (count === 0) continue;
                const s = 1 / count;
                cellVert[ci(i, j, k)] = positions.length / 3;
                vertCells.push(i, j, k);
                positions.push(ox + (i + vx * s) * step, oy + (j + vy * s) * step, oz + (k + vz * s) * step);
            }
        }
    }
    return { positions, vertCells, cellVert };
}

function emitQuadIndices(density, cellVert, dimX, dimY, dimZ) {
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
    const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
    const solid = (v) => v > 0;
    const cv = (i, j, k) => {
        if (i < 0 || j < 0 || k < 0 || i >= dimX || j >= dimY || k >= dimZ) return -1;
        return cellVert[ci(i, j, k)];
    };
    const indices = [];
    const quad = (a, b, c, d, parity) => {
        if (a < 0 || b < 0 || c < 0 || d < 0) return;
        if (parity & 1) {
            indices.push(a, b, d, b, c, d);
        } else {
            indices.push(a, b, c, a, c, d);
        }
    };
    for (let k = 0; k <= dimZ; k++) {
        for (let j = 0; j <= dimY; j++) {
            for (let i = 0; i <= dimX; i++) {
                const s0 = solid(density[gi(i, j, k)]);
                const parity = (i + j + k) & 1;
                if (i < dimX && j > 0 && k > 0 && s0 !== solid(density[gi(i + 1, j, k)])) {
                    quad(cv(i, j - 1, k - 1), cv(i, j, k - 1), cv(i, j, k), cv(i, j - 1, k), parity);
                }
                if (j < dimY && i > 0 && k > 0 && s0 !== solid(density[gi(i, j + 1, k)])) {
                    quad(cv(i - 1, j, k - 1), cv(i, j, k - 1), cv(i, j, k), cv(i - 1, j, k), parity);
                }
                if (k < dimZ && i > 0 && j > 0 && s0 !== solid(density[gi(i, j, k + 1)])) {
                    quad(cv(i - 1, j - 1, k), cv(i, j - 1, k), cv(i, j, k), cv(i - 1, j, k), parity);
                }
            }
        }
    }
    return indices;
}

function laplacianSmoothPositions(positions, indices) {
    if (indices.length < 3) return;
    const vertCount = positions.length / 3;
    const neighborSets = new Array(vertCount);
    for (let v = 0; v < vertCount; v++) neighborSets[v] = new Set();
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const ia = indices[t];
        const ib = indices[t + 1];
        const ic = indices[t + 2];
        neighborSets[ia].add(ib);
        neighborSets[ia].add(ic);
        neighborSets[ib].add(ia);
        neighborSets[ib].add(ic);
        neighborSets[ic].add(ia);
        neighborSets[ic].add(ib);
    }
    const lambda = 0.5;
    const smoothed = new Array(positions.length);
    for (let v = 0; v < vertCount; v++) {
        const nbrs = neighborSets[v];
        const cnt = nbrs.size;
        if (cnt === 0) {
            smoothed[v * 3] = positions[v * 3];
            smoothed[v * 3 + 1] = positions[v * 3 + 1];
            smoothed[v * 3 + 2] = positions[v * 3 + 2];
            continue;
        }
        let sx = 0;
        let sy = 0;
        let sz = 0;
        for (const n of nbrs) {
            sx += positions[n * 3];
            sy += positions[n * 3 + 1];
            sz += positions[n * 3 + 2];
        }
        const ax = sx / cnt;
        const ay = sy / cnt;
        const az = sz / cnt;
        smoothed[v * 3] = positions[v * 3] + lambda * (ax - positions[v * 3]);
        smoothed[v * 3 + 1] = positions[v * 3 + 1] + lambda * (ay - positions[v * 3 + 1]);
        smoothed[v * 3 + 2] = positions[v * 3 + 2] + lambda * (az - positions[v * 3 + 2]);
    }
    for (let i = 0; i < positions.length; i++) positions[i] = smoothed[i];
}

function cropPad(positions, indices, vertCells, dimX, dimZ, cropMargin) {
    if (cropMargin <= 0 || positions.length === 0) return;
    const vc = positions.length / 3;
    const remap = new Int32Array(vc).fill(-1);
    const keptPos = [];
    let kept = 0;
    for (let v = 0; v < vc; v++) {
        const ciV = vertCells[v * 3];
        const ckV = vertCells[v * 3 + 2];
        if (ciV < cropMargin || ciV >= dimX - cropMargin || ckV < cropMargin || ckV >= dimZ - cropMargin) {
            continue;
        }
        remap[v] = kept++;
        keptPos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    }
    const keptIdx = [];
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const a = remap[indices[t]];
        const b = remap[indices[t + 1]];
        const c = remap[indices[t + 2]];
        if (a >= 0 && b >= 0 && c >= 0) keptIdx.push(a, b, c);
    }
    positions.length = 0;
    for (let i = 0; i < keptPos.length; i++) positions.push(keptPos[i]);
    indices.length = 0;
    for (let i = 0; i < keptIdx.length; i++) indices.push(keptIdx[i]);
}

function gradientNormals(positions, density, ox, oy, oz, step, Nx, Ny, Nz) {
    const normals = new Float32Array(positions.length);
    const eps = step * 0.5;
    const NxNy = Nx * Ny;
    const NxMax = Nx - 1;
    const NyMax = Ny - 1;
    const NzMax = Nz - 1;
    const lookup = (x, y, z) => {
        const fx = (x - ox) / step;
        const fy = (y - oy) / step;
        const fz = (z - oz) / step;
        const i = Math.floor(fx);
        const j = Math.floor(fy);
        const k = Math.floor(fz);
        if (i < 0 || j < 0 || k < 0 || i >= NxMax || j >= NyMax || k >= NzMax) {
            // Fallback: synchron-Density (selten am Edge nach Crop+Smooth).
            return terrainDensityAt(x, y, z);
        }
        const tx = fx - i;
        const ty = fy - j;
        const tz = fz - k;
        const base = i + j * Nx + k * NxNy;
        const d000 = density[base];
        const d100 = density[base + 1];
        const d010 = density[base + Nx];
        const d110 = density[base + 1 + Nx];
        const d001 = density[base + NxNy];
        const d101 = density[base + 1 + NxNy];
        const d011 = density[base + Nx + NxNy];
        const d111 = density[base + 1 + Nx + NxNy];
        const d00 = d000 * (1 - tx) + d100 * tx;
        const d10 = d010 * (1 - tx) + d110 * tx;
        const d01 = d001 * (1 - tx) + d101 * tx;
        const d11 = d011 * (1 - tx) + d111 * tx;
        const d0 = d00 * (1 - ty) + d10 * ty;
        const d1 = d01 * (1 - ty) + d11 * ty;
        return d0 * (1 - tz) + d1 * tz;
    };
    for (let v = 0; v < positions.length; v += 3) {
        const px = positions[v];
        const py = positions[v + 1];
        const pz = positions[v + 2];
        const gx = lookup(px + eps, py, pz) - lookup(px - eps, py, pz);
        const gy = lookup(px, py + eps, pz) - lookup(px, py - eps, pz);
        const gz = lookup(px, py, pz + eps) - lookup(px, py, pz - eps);
        const len = Math.hypot(gx, gy, gz);
        if (len < 1e-6) {
            normals[v] = 0;
            normals[v + 1] = 1;
            normals[v + 2] = 0;
        } else {
            normals[v] = -gx / len;
            normals[v + 1] = -gy / len;
            normals[v + 2] = -gz / len;
        }
    }
    return normals;
}

// =============================================================================
// Per-Vertex-Field-Colors (Mirror von _attachVoxelFieldColors)
// =============================================================================

function attachFieldColors(positions) {
    const n = positions.length / 3;
    const colors = new Float32Array(n * 3);
    const ss = (e0, e1, x) => {
        let t = (x - e0) / (e1 - e0);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    };
    const stone = [0.42, 0.44, 0.49];
    const earth = [0.27, 0.49, 0.19];
    const lava = [0.46, 0.2, 0.11];
    const violet = [0.55, 0.36, 0.86];
    const snow = [0.92, 0.93, 1.0];
    const sed = [0.78, 0.72, 0.52];
    const sand = [0.87, 0.78, 0.55];
    const sandNoise = state.noise; // Mirror anazhRealm._voxelNoise (selber Seed)
    for (let i = 0; i < n; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        const f = worldFieldAt(x, z);
        const c = [stone[0], stone[1], stone[2]];
        const mix = (target, t) => {
            c[0] += (target[0] - c[0]) * t;
            c[1] += (target[1] - c[1]) * t;
            c[2] += (target[2] - c[2]) * t;
        };
        mix(earth, ss(0.25, 0.85, f.lebendig));
        mix(lava, ss(0.38, 0.92, f.glut));
        mix(violet, ss(0.55, 1.0, f.magieleitung) * 0.33);
        mix(snow, ss(12, 42, y));
        mix(sed, ss(-2, -14, y));
        const waterY = waterLevelAt(x, z);
        const aboveWater = y - waterY;
        if (aboveWater > -1.5 && aboveWater < 2.0 && sandNoise) {
            const widthNoise = (sandNoise.noise2D(x * 0.0018, z * 0.0018) + 1) * 0.5;
            const intenseNoise = (sandNoise.noise2D(x * 0.0034 + 17, z * 0.0034 - 9) + 1) * 0.5;
            if (widthNoise > 0.18) {
                const width = 0.5 + 1.4 * widthNoise;
                const intensity = 0.25 + 0.55 * intenseNoise;
                const shoreBlend = Math.max(0, 1 - Math.abs(aboveWater - 0.6) / width);
                mix(sand, shoreBlend * intensity);
            }
        }
        colors[i * 3] = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
    }
    return colors;
}

// =============================================================================
// Water-Cells (Mirror von _buildVoxelChunkWaterCells, OHNE Architektur-Stempel)
// =============================================================================

function buildChunkWaterCells(ox, oy, oz, step, lod, density) {
    const cfg = voxelChunkConfig(lod);
    const dim = cfg.dim;
    const dimY = cfg.dimY;
    const cells = new Uint8Array(dim * dim * dimY);
    const band = state.hydroBand;
    const bandTop = band ? band.top : Infinity;
    const Nx = dim + 4;
    const Ny = dimY + 1;
    const NxNy = Nx * Ny;
    // V13.8 — verbundenes Wasser via 3D-Flood-Fill (Mirror von `_buildVoxelChunk-
    // WaterCells`, V9.89-Disziplin). Ersetzt per-Spalten-Klassifikation + airAbove-
    // Pass: füllt NUR Zellen, die durch nicht-soliden Raum unter dem Body-Spiegel
    // mit einer echten Atlas-Quelle VERBUNDEN sind → kein Bergwand-Bluten, keine
    // Unterwasser-Luftblasen. Seeds aus dem globalen Atlas (in-chunk + OOB-Ring) →
    // seam-frei. Der Architektur-Stempel bleibt Main-only (kein State im Worker).
    const dimSq = dim * dim;
    const cellD = (i, j, k) => {
        const a = j * Nx + (k + 1) * NxNy;
        const b = (j + 1) * Nx + (k + 1) * NxNy;
        const c = j * Nx + (k + 2) * NxNy;
        const e = (j + 1) * Nx + (k + 2) * NxNy;
        const i1 = i + 1;
        const i2 = i + 2;
        return (
            (density[i1 + a] +
                density[i2 + a] +
                density[i1 + b] +
                density[i2 + b] +
                density[i1 + c] +
                density[i2 + c] +
                density[i1 + e] +
                density[i2 + e]) *
            0.125
        );
    };
    let jMax = Math.floor((bandTop - oy) / step);
    if (jMax >= dimY) jMax = dimY - 1;
    for (let j = 0; j <= jMax; j++) {
        const baseJ = j * dimSq;
        for (let k = 0; k < dim; k++) {
            const baseK = k * dim;
            for (let i = 0; i < dim; i++) {
                if (cellD(i, j, k) > 0) cells[i + baseK + baseJ] = CELL_STATE.SOLID;
            }
        }
    }
    const WATER = CELL_STATE.WATER;
    const AIR = CELL_STATE.AIR;
    const flLevel = new Float64Array(dimSq * dimY);
    const queue = [];
    const seedColumn = (i, k, lvl) => {
        if (!(lvl > -Infinity)) return;
        const baseK = k * dim;
        for (let j = 0; j <= jMax; j++) {
            const cy = oy + (j + 0.5) * step;
            if (cy > lvl) break;
            const cidx = i + baseK + j * dimSq;
            if (cells[cidx] === AIR) {
                cells[cidx] = WATER;
                flLevel[cidx] = lvl;
                queue.push(cidx);
            }
        }
    };
    for (let k = 0; k < dim; k++) {
        const cz = oz + (k + 0.5) * step;
        for (let i = 0; i < dim; i++) {
            seedColumn(i, k, atlasWaterLevelAt(ox + (i + 0.5) * step, cz, Infinity));
        }
    }
    for (let k = 0; k < dim; k++) {
        const cz = oz + (k + 0.5) * step;
        seedColumn(0, k, atlasWaterLevelAt(ox - 0.5 * step, cz, Infinity));
        seedColumn(dim - 1, k, atlasWaterLevelAt(ox + (dim + 0.5) * step, cz, Infinity));
    }
    for (let i = 0; i < dim; i++) {
        const cx = ox + (i + 0.5) * step;
        seedColumn(i, 0, atlasWaterLevelAt(cx, oz - 0.5 * step, Infinity));
        seedColumn(i, dim - 1, atlasWaterLevelAt(cx, oz + (dim + 0.5) * step, Infinity));
    }
    const pushN = (ni, nk, nj, lvl) => {
        if (ni < 0 || nk < 0 || ni >= dim || nk >= dim || nj < 0 || nj > jMax) return;
        if (oy + (nj + 0.5) * step > lvl) return;
        const nidx = ni + nk * dim + nj * dimSq;
        if (cells[nidx] === AIR) {
            cells[nidx] = WATER;
            flLevel[nidx] = lvl;
            queue.push(nidx);
        }
    };
    for (let qh = 0; qh < queue.length; qh++) {
        const cidx = queue[qh];
        const lvl = flLevel[cidx];
        const j = (cidx / dimSq) | 0;
        const rem = cidx - j * dimSq;
        const k = (rem / dim) | 0;
        const i = rem - k * dim;
        pushN(i + 1, k, j, lvl);
        pushN(i - 1, k, j, lvl);
        pushN(i, k + 1, j, lvl);
        pushN(i, k - 1, j, lvl);
        pushN(i, k, j + 1, lvl);
        pushN(i, k, j - 1, lvl);
    }
    // 5) ROBUSTE 3D-KONNEKTIVITÄT (V13.14, Mirror von `_skyOpenWaterFilter`):
    //    Wasser existiert nur, wo es durch Wasser mit der offenen Atmosphäre
    //    verbunden ist. Ersetzt den per-Spalten-Trocken-Pass (V13.12), der
    //    Überhang-Buchten fälschlich trocknete. MUSS bit-identisch zum Main
    //    sein (Determinismus → keine Naht worker/main).
    skyOpenWaterFilter(cells, dim, dimY, jMax);
    // ARCHITEKTUR-STEMPEL läuft NICHT im Worker — bleibt Main-only
    // (Architektur-State ist nicht im Worker-Snapshot, soll auch nicht sein).
    return cells;
}

// V13.14 — Worker-Mirror von `_skyOpenWaterFilter` (bit-identisch). Siehe den
// ausführlichen Kommentar in anazhRealm.js. Zwei Floods: (A) Sky-Air vom Dach,
// (B) Keep = WATER an Sky-Air oder durch Wasser damit verbunden; Rest -> AIR.
function skyOpenWaterFilter(cells, dimC, dimYC, jMaxC) {
    const AIR = CELL_STATE.AIR;
    const WATER = CELL_STATE.WATER;
    const SOLID = CELL_STATE.SOLID;
    const dq = dimC * dimC;
    const topJ = dimYC - 1;
    const skyAir = new Uint8Array(dq * dimYC);
    const stack = [];
    for (let k = 0; k < dimC; k++) {
        for (let i = 0; i < dimC; i++) {
            const idx = i + k * dimC + topJ * dq;
            if (cells[idx] === AIR) {
                skyAir[idx] = 1;
                stack.push(idx);
            }
        }
    }
    const tryAir = (ni, nk, nj) => {
        if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj >= dimYC) return;
        const nidx = ni + nk * dimC + nj * dq;
        if (skyAir[nidx] || cells[nidx] !== AIR) return;
        skyAir[nidx] = 1;
        stack.push(nidx);
    };
    while (stack.length) {
        const idx = stack.pop();
        const j = (idx / dq) | 0;
        const rem = idx - j * dq;
        const k = (rem / dimC) | 0;
        const i = rem - k * dimC;
        tryAir(i + 1, k, j);
        tryAir(i - 1, k, j);
        tryAir(i, k + 1, j);
        tryAir(i, k - 1, j);
        tryAir(i, k, j + 1);
        tryAir(i, k, j - 1);
    }
    const keep = new Uint8Array(dq * dimYC);
    const wstack = [];
    const hasSkyNbr = (i, k, j, idx) =>
        (j < topJ && skyAir[idx + dq]) ||
        (j > 0 && skyAir[idx - dq]) ||
        (i + 1 < dimC && skyAir[idx + 1]) ||
        (i > 0 && skyAir[idx - 1]) ||
        (k + 1 < dimC && skyAir[idx + dimC]) ||
        (k > 0 && skyAir[idx - dimC]);
    for (let j = 0; j <= jMaxC; j++) {
        for (let k = 0; k < dimC; k++) {
            for (let i = 0; i < dimC; i++) {
                const idx = i + k * dimC + j * dq;
                if (cells[idx] === WATER && !keep[idx] && hasSkyNbr(i, k, j, idx)) {
                    keep[idx] = 1;
                    wstack.push(idx);
                }
            }
        }
    }
    const tryWater = (ni, nk, nj) => {
        if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj > jMaxC) return;
        const nidx = ni + nk * dimC + nj * dq;
        if (keep[nidx] || cells[nidx] !== WATER) return;
        keep[nidx] = 1;
        wstack.push(nidx);
    };
    while (wstack.length) {
        const idx = wstack.pop();
        const j = (idx / dq) | 0;
        const rem = idx - j * dq;
        const k = (rem / dimC) | 0;
        const i = rem - k * dimC;
        tryWater(i + 1, k, j);
        tryWater(i - 1, k, j);
        tryWater(i, k + 1, j);
        tryWater(i, k - 1, j);
        tryWater(i, k, j + 1);
        tryWater(i, k, j - 1);
    }
    for (let idx = 0; idx < cells.length; idx++) {
        if (cells[idx] === WATER && !keep[idx]) cells[idx] = AIR;
    }
    void SOLID;
}

// Trocken-Gate-Mirror (Atlas-Strict, V9.87). Wenn false → keine Cells nötig.
function chunkHasAnyWater(cx, cz, lod) {
    const cfg = voxelChunkConfig(lod);
    const span = cfg.span;
    const ox = cx * span;
    const oz = cz * span;
    const waterLevel = typeof state.waterLevel === "number" ? state.waterLevel : 0;
    const edits = state.voxelEdits;
    if (Array.isArray(edits) && edits.length) {
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed || ed.mode !== "carve") continue;
            const r = ed.r;
            if (!Number.isFinite(r) || r <= 0) continue;
            if (ed.y - r >= waterLevel) continue;
            if (ed.x + r < ox || ed.x - r > ox + span) continue;
            if (ed.z + r < oz || ed.z - r > oz + span) continue;
            return true;
        }
    }
    const h = state.hydrosphere;
    if (!h || !h.ready) return false;
    if (h.water && h.water.waterKind) {
        const c0i = Math.floor((ox - h.originX) / h.cell) - 1;
        const c1i = Math.floor((ox + span - h.originX) / h.cell) + 1;
        const c0j = Math.floor((oz - h.originZ) / h.cell) - 1;
        const c1j = Math.floor((oz + span - h.originZ) / h.cell) + 1;
        const wK = h.water.waterKind;
        for (let cj = c0j; cj <= c1j; cj++) {
            for (let ci = c0i; ci <= c1i; ci++) {
                if (ci < 0 || cj < 0 || ci >= h.dim || cj >= h.dim) continue;
                const kind = wK[ci + cj * h.dim];
                if (kind === 1 || kind === 2) return true;
            }
        }
    }
    if (h.riverBuckets) {
        const b0i = Math.floor((ox - h.originX) / h.bucketSize);
        const b1i = Math.floor((ox + span - h.originX) / h.bucketSize);
        const b0j = Math.floor((oz - h.originZ) / h.bucketSize);
        const b1j = Math.floor((oz + span - h.originZ) / h.bucketSize);
        for (let bj = b0j; bj <= b1j; bj++) {
            for (let bi = b0i; bi <= b1i; bi++) {
                if (bi < 0 || bj < 0 || bi >= h.bucketsDim || bj >= h.bucketsDim) continue;
                const list = h.riverBuckets[bi + bj * h.bucketsDim];
                if (list && list.length) return true;
            }
        }
    }
    return false;
}

// =============================================================================
// Voller Chunk-Build (Iso-Mesh + Cells + Colors)
// =============================================================================

function buildChunkMesh(cx, cz, lod) {
    const cfg = voxelChunkConfig(lod);
    const { dim, step, span, dimY, floorDrop } = cfg;
    const base = state.baseHeight || 0;
    const ox = cx * span;
    const oz = cz * span;
    const oy = base - floorDrop;
    // Pad+Crop: sample bei (ox-step, oz-step), dim+3, cropMargin=1.
    const sampleOx = ox - step;
    const sampleOz = oz - step;
    const sampleDimX = dim + 3;
    const sampleDimY = dimY;
    const sampleDimZ = dim + 3;
    const Nx = sampleDimX + 1;
    const Ny = sampleDimY + 1;
    const Nz = sampleDimZ + 1;
    // Density-Grid einmal samplen (~91k Calls bei LOD 0, ~14k bei LOD 1).
    const density = new Float32Array(Nx * Ny * Nz);
    for (let k = 0; k < Nz; k++) {
        for (let j = 0; j < Ny; j++) {
            for (let i = 0; i < Nx; i++) {
                density[i + j * Nx + k * Nx * Ny] = terrainDensityAt(
                    sampleOx + i * step,
                    oy + j * step,
                    sampleOz + k * step
                );
            }
        }
    }
    // Surface-Nets-Mesh aufbauen.
    const { positions, vertCells, cellVert } = extractSurfaceVertices(
        density,
        sampleOx,
        oy,
        sampleOz,
        sampleDimX,
        sampleDimY,
        sampleDimZ,
        step
    );
    if (positions.length === 0) return { empty: true };
    const indices = emitQuadIndices(density, cellVert, sampleDimX, sampleDimY, sampleDimZ);
    laplacianSmoothPositions(positions, indices);
    cropPad(positions, indices, vertCells, sampleDimX, sampleDimZ, 1);
    if (positions.length === 0) return { empty: true };
    const normals = gradientNormals(positions, density, sampleOx, oy, sampleOz, step, Nx, Ny, Nz);
    // V9.91 — positions VOR colors zu Float32 konvertieren. Sonst rechnet
    // `attachFieldColors` mit Float64-Werten, Main hat aber Float32 (via
    // THREE.Float32BufferAttribute) — sub-pixel Float-Drift bei colors
    // (maxDelta ~1.19e-7, der Float32-Epsilon). Float32-First erzwingt
    // identische Eingangs-Werte für die Color-Mix-Pipeline.
    const positionsF32 = new Float32Array(positions);
    const colors = attachFieldColors(positionsF32);
    // V9.93 (Wasser-LOD-Naht-Heilung): Wasser-Cells IMMER LOD 0 für naht-
    // freie Wasseroberflächen über LOD-Boundaries hinweg. Für LOD-0-Chunks
    // teilen wir die schon gesampelte `density` (V9.81-Sharing wirkt). Für
    // LOD-1-Chunks samplen wir ein zweites Density-Grid bei LOD 0 (98k
    // Vertices statt 16k) — Mehrkosten bounded durch V9.87-Atlas-Strict-
    // Gate (Hochland-LOD-1-Chunks haben kein Wasser, kein Mehraufwand).
    let waterCells;
    if (chunkHasAnyWater(cx, cz, lod)) {
        if (lod === 0) {
            waterCells = buildChunkWaterCells(ox, oy, oz, step, 0, density);
        } else {
            const lod0Cfg = voxelChunkConfig(0);
            const lod0SampleDimX = lod0Cfg.dim + 3;
            const lod0SampleDimY = lod0Cfg.dimY;
            const lod0SampleDimZ = lod0Cfg.dim + 3;
            const lod0Nx = lod0SampleDimX + 1;
            const lod0Ny = lod0SampleDimY + 1;
            const lod0Nz = lod0SampleDimZ + 1;
            const lod0Density = new Float32Array(lod0Nx * lod0Ny * lod0Nz);
            const lod0Ox = ox - lod0Cfg.step;
            const lod0Oz = oz - lod0Cfg.step;
            for (let k = 0; k < lod0Nz; k++) {
                for (let j = 0; j < lod0Ny; j++) {
                    for (let i = 0; i < lod0Nx; i++) {
                        lod0Density[i + j * lod0Nx + k * lod0Nx * lod0Ny] = terrainDensityAt(
                            lod0Ox + i * lod0Cfg.step,
                            oy + j * lod0Cfg.step,
                            lod0Oz + k * lod0Cfg.step
                        );
                    }
                }
            }
            waterCells = buildChunkWaterCells(ox, oy, oz, lod0Cfg.step, 0, lod0Density);
        }
    } else {
        waterCells = new Uint8Array(0); // sentinel: chunk has no water
    }
    return {
        empty: false,
        positions: positionsF32,
        indices: new Uint32Array(indices),
        normals,
        colors,
        waterCells,
    };
}
