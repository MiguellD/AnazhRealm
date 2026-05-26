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
    hydrosphere: null, // { ready, originX, originZ, cell, dim, riverBuckets, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear }
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
