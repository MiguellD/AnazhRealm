// skin-contract.cjs — die geteilte Naht für den Kreatur-Vertrag v2 (P7): bake-core (die THREE-freie
// Skin-Isosurface, `__bakeSkinGeometry`) DIREKT in Node laden + die Skin-Geometrie einer FROZEN
// Kreatur-Spec (parts + opts) byte-genau fingerabdrucken. Mint UND Gate lesen DIESELBE Quelle
// (Gesetz #0) → kein Drift zwischen „münzen" und „prüfen".
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..", "..");

// bake-core ist ein IIFE, das `globalThis.__bakeSkinGeometry` setzt (root = self||globalThis).
// `require` führt die Datei aus → der Seiteneffekt legt die Funktion an (wie phyto-core im Parity-Gate).
function loadBakeCore() {
    require(path.join(ROOT, "bake-core.js"));
    const bake = globalThis.__bakeSkinGeometry;
    if (typeof bake !== "function") throw new Error("bake-core.js exportiert __bakeSkinGeometry nicht");
    return bake;
}

// Der KANONISCHE Contract-Opts-Satz: eine feste Auflösung (48 — schneller als das Live-96, aber die
// volle Isosurface-/smin-/Taubin-Mathematik läuft) + die bake-core-Defaults für den Rest. Ein bewusster
// Opts-Wechsel ist ein Re-Mint mit Begründung (wie die eingefrorenen Goldens).
const CONTRACT_OPTS = Object.freeze({ res: 48 });

// Ein Attribut-Puffer → { itemSize, bytes, sha256 } (byte-exakt; ein einziger abweichender Byte wird
// über den Hash sichtbar). bake-core gibt manche Attribute als typisiertes Array (positions/normals/
// colors → Float32Array), manche als PLAIN Array (indices) zurück → wir KANONISIEREN auf den frozen
// Typ (`Ctor`), damit der Byte-Fingerabdruck stabil ist, egal welchen Container bake-core intern wählt.
function fpBuffer(arr, itemSize, Ctor) {
    if (!arr || !arr.length) return null;
    const typed = arr.BYTES_PER_ELEMENT && arr.buffer ? arr : Ctor.from(arr);
    const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
    return { itemSize, bytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
}

// Die Skin-Geometrie einer Spec fingerabdrucken (positions/normals/colors PFLICHT-Fingerprint;
// indices wenn vorhanden). NULL, wenn bake-core nichts baute (leere Parts). Der KANON: Positions/
// Normals/Colors sind Float32, Indices sind Uint32 (die Draw-Wahrheit; bake-core liefert sie als
// plain Array, hier auf Uint32 kanonisiert).
function fingerprintSkin(g) {
    if (!g || !g.positions || !g.positions.length) return null;
    const out = {
        positions: fpBuffer(g.positions, 3, Float32Array),
        normals: g.normals ? fpBuffer(g.normals, 3, Float32Array) : null,
        colors: g.colors ? fpBuffer(g.colors, 3, Float32Array) : null,
        vertexCount: g.positions.length / 3,
    };
    if (g.indices && g.indices.length) out.index = fpBuffer(g.indices, 1, Uint32Array);
    return out;
}

// Eine Fixture-Spec ({ id, parts, opts? }) → der byte-exakte Fingerabdruck ihrer Skin-Geometrie.
function bakeAndFingerprint(bake, spec) {
    const opts = Object.assign({}, CONTRACT_OPTS, spec.opts || {});
    const g = bake(spec.parts, opts);
    return { cv: 2, id: spec.id, kind: spec.kind || "skin", opts, skin: fingerprintSkin(g) };
}

const V2_DIR = path.join(ROOT, "spec", "asset-contract", "v2");
const FIXTURE_PATH = path.join(V2_DIR, "fixtures", "skin-fixtures.json");
const GOLDEN_DIR = path.join(V2_DIR, "golden");

function loadFixtures() {
    if (!fs.existsSync(FIXTURE_PATH)) return null;
    return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

module.exports = {
    ROOT,
    V2_DIR,
    FIXTURE_PATH,
    GOLDEN_DIR,
    CONTRACT_OPTS,
    loadBakeCore,
    fingerprintSkin,
    bakeAndFingerprint,
    loadFixtures,
    fileFor: (id) => `${id}.json`,
};
