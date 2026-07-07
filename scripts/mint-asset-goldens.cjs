// mint-asset-goldens.cjs — P1: die Goldens des Asset-Vertrags v1 EINMALIG münzen (im Browser,
// die Produktions-Laufzeit ist die Wahrheit — node-V8 kann in Transzendenten abweichen).
// Die Goldens sind ab dem Münzen EINGEFROREN (Taille-Disziplin `spec/golden/v1`): dieses Skript
// VERWEIGERT das Überschreiben. Nur wenn der golden/-Ordner fehlt/leer ist, mintet es.
//
//   node scripts/mint-asset-goldens.cjs           # mintet, wenn leer
//   MINT_FORCE=1 node scripts/mint-asset-goldens.cjs   # bewusster Re-Mint (nur mit Absicht)
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { runWithWorker, fingerprintMeshes } = require("./lib/asset-worker-harness.cjs");

const PORT = Number(process.env.MINT_PORT || 4541);
const DIR = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "golden");

// Die kuratierte Fall-Liste (Playbook P1): 6 Baum-Presets über die Matrix + je 1 Nicht-Baum.
const TREES = ["eiche", "fichte", "birke", "weide", "mammut", "tanne"];
const T_SEEDS = [7, 12345];
const T_LODS = [0, 2];
const T_SEASONS = ["summer", "winter"];
const OTHERS = ["findling", "kristalle", "blume", "strauch"]; // je 1 Fall, seed 7 / L0 / summer

function cases() {
    const out = [];
    for (const season of T_SEASONS)
        for (const presetId of TREES)
            for (const seed of T_SEEDS) for (const lod of T_LODS) out.push({ presetId, seed, lod, season });
    for (const presetId of OTHERS) out.push({ presetId, seed: 7, lod: 0, season: "summer" });
    return out;
}
const fileFor = (c) => `${c.presetId}-s${c.seed}-L${c.lod}-${c.season}.json`;

(async () => {
    fs.mkdirSync(DIR, { recursive: true });
    const existing = fs.readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "manifest.json");
    if (existing.length && !process.env.MINT_FORCE) {
        console.error(`❌ ${existing.length} Goldens existieren bereits in ${path.relative(process.cwd(), DIR)}.`);
        console.error("   Die Goldens sind EINGEFROREN (NIE regenerieren). MINT_FORCE=1 nur mit Absicht.");
        process.exit(1);
    }
    const CASES = cases();
    console.log(`Münze ${CASES.length} Goldens (Browser-Worker, swiftshader) …`);
    const manifest = { cv: 1, mintedCases: CASES.length, files: {} };
    await runWithWorker(PORT, async ({ build, getData }) => {
        // Die drei Daten-Kanäle einfrieren (reine Daten, JSON — der Vertrag normiert sie).
        for (const [type, key] of [
            ["get-recipes", "recipes"],
            ["get-world-params", "world-params"],
            ["get-render-config", "render-config"],
        ]) {
            const d = await getData(type);
            const body = key === "recipes" ? d.book : d.params || d.config;
            const json = JSON.stringify(body);
            fs.writeFileSync(path.join(DIR, key + ".json"), json + "\n");
            manifest.files[key + ".json"] = crypto.createHash("sha256").update(json).digest("hex");
        }
        for (const c of CASES) {
            const a = await build(c);
            if (!a.meshes || !a.meshes.length) throw new Error(`0 Meshes: ${fileFor(c)}`);
            const meshes = fingerprintMeshes(a.meshes); // byte-exakter Fingerabdruck (sha256/Puffer), nicht die Rohdaten
            const rec = { cv: 1, presetId: a.presetId, seed: a.seed, lod: a.lod, meshes };
            const json = JSON.stringify(rec);
            const f = fileFor(c);
            fs.writeFileSync(path.join(DIR, f), json + "\n");
            manifest.files[f] = crypto.createHash("sha256").update(json).digest("hex");
            const verts = meshes.reduce((s, m) => s + (m.attrs.position ? (m.attrs.position.bytes / 12) | 0 : 0), 0);
            console.log(`  ✔ ${f}  (${meshes.length} Meshes, ~${verts} Verts)`);
        }
    });
    fs.writeFileSync(path.join(DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(
        `✅ ${CASES.length} Goldens + 3 Daten-Kanäle + manifest.json gemünzt → ${path.relative(process.cwd(), DIR)}`
    );
    console.log("   EINGEFROREN. Ab jetzt richtet gate:asset-contract gegen diese Bytes.");
    process.exit(0);
})().catch((e) => {
    console.error("Mint-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
