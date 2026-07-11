// diag-asset-contract.cjs — P1 DAUER-GATE: jeder Produzent, der den Asset-Vertrag v1 spricht,
// MUSS die eingefrorenen Goldens byte-genau treffen. Bootet den Studio-Generator als Worker
// (die EINE Harness), baut jeden Golden-Fall neu, fingerabdruckt die Puffer (sha256 je Attribut,
// die geteilte fingerprintMeshes) und vergleicht sha256 + Byte-Länge + prüft das Schema (cv,
// Pflichtfelder). Dazu die drei Daten-Kanäle (recipes/world-params/render-config) gegen ihre
// eingefrorenen JSONs. Der exakte Byte-Offset einer Divergenz kommt aus diag-foundry-parity.
//
// GRÜN ⇒ der Vertrag hält, kein stiller Drift möglich. ROT ⇒ die erste Divergenz mit Ort
// (Datei · Mesh · Attribut) — eine benannte Änderung, keine Meinung.
//
//   npm run gate:asset-contract
const fs = require("fs");
const path = require("path");
const { runWithWorker, fingerprintMeshes } = require("./lib/asset-worker-harness.cjs");

const PORT = Number(process.env.CONTRACT_PORT || 4542);
const DIR = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "golden");

function parseName(f) {
    // <preset>-s<seed>-L<lod>-<season>.json
    const m = f.match(/^(.+)-s(-?\d+)-L(\d+)-(\w+)\.json$/);
    if (!m) return null;
    return { presetId: m[1], seed: Number(m[2]), lod: Number(m[3]), season: m[4] };
}

const SCHEMA_ATTRS = ["position"]; // Pflicht-Attribut je Mesh
function schemaError(rec) {
    if (rec.cv !== 1) return "cv != 1";
    if (typeof rec.presetId !== "string") return "presetId fehlt";
    if (!Array.isArray(rec.meshes) || !rec.meshes.length) return "meshes leer";
    for (let i = 0; i < rec.meshes.length; i++) {
        const m = rec.meshes[i];
        if (typeof m.kind !== "string") return `Mesh${i}: kind fehlt`;
        if (!m.mat || typeof m.mat !== "object") return `Mesh${i}: mat fehlt`;
        if (!m.attrs) return `Mesh${i}: attrs fehlt`;
        for (const a of SCHEMA_ATTRS) if (!m.attrs[a] || !m.attrs[a].sha256) return `Mesh${i}: Attribut '${a}' fehlt`;
    }
    return null;
}

function meshDiff(tag, gold, live) {
    if (gold.length !== live.length) return `${tag}: Mesh-Zahl ${gold.length} vs ${live.length}`;
    for (let i = 0; i < gold.length; i++) {
        const a = gold[i],
            b = live[i];
        if (a.kind !== b.kind) return `${tag} Mesh${i}: kind ${a.kind} vs ${b.kind}`;
        if (JSON.stringify(a.mat || null) !== JSON.stringify(b.mat || null)) return `${tag} Mesh${i}: mat divergiert`;
        const keys = new Set([...Object.keys(a.attrs || {}), ...Object.keys(b.attrs || {})]);
        for (const k of keys) {
            const av = (a.attrs || {})[k],
                bv = (b.attrs || {})[k];
            if (!av || !bv) return `${tag} Mesh${i}: Attribut '${k}' nur auf einer Seite`;
            if (av.itemSize !== bv.itemSize) return `${tag} Mesh${i}.${k}: itemSize ${av.itemSize} vs ${bv.itemSize}`;
            if (av.bytes !== bv.bytes) return `${tag} Mesh${i}.${k}: Byte-Länge ${av.bytes} vs ${bv.bytes}`;
            if (av.sha256 !== bv.sha256)
                return `${tag} Mesh${i}.${k}: sha256-Divergenz (Byte-Offset via diag-foundry-parity)`;
        }
        if (((a.index || null) !== null) !== ((b.index || null) !== null))
            return `${tag} Mesh${i}: index nur auf einer Seite`;
        if (a.index && a.index.sha256 !== b.index.sha256) return `${tag} Mesh${i}.index: sha256-Divergenz`;
    }
    return null;
}

(async () => {
    if (!fs.existsSync(DIR)) {
        console.error(
            `❌ Keine Goldens in ${path.relative(process.cwd(), DIR)} — erst 'node scripts/mint-asset-goldens.cjs'.`
        );
        process.exit(1);
    }
    const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json") && parseName(f));
    if (!files.length) {
        console.error("❌ Keine Asset-Goldens gefunden.");
        process.exit(1);
    }
    const fails = [];
    let ok = 0;
    await runWithWorker(PORT, async ({ build, getData }) => {
        // Daten-Kanäle gegen die eingefrorenen JSONs.
        // SYNERGIE-WELLE — DER EINE UMSCHLAG (get-book): die drei Daten-Payloads reisen
        // in EINEM Reply; die eingefrorenen JSONs (recipes/world-params/render-config)
        // bleiben die BYTE-Wahrheit der Payloads (nur der Umschlag wechselte).
        const bookReply = await getData("get-book");
        for (const [key, field] of [
            ["recipes", "book"],
            ["world-params", "worldParams"],
            ["render-config", "renderConfig"],
        ]) {
            const goldPath = path.join(DIR, key + ".json");
            if (!fs.existsSync(goldPath)) continue;
            const gold = fs.readFileSync(goldPath, "utf8").trim();
            const live = JSON.stringify(bookReply[field]);
            if (live !== gold) fails.push(`${key}: divergiert vom eingefrorenen JSON`);
        }
        for (const f of files) {
            const c = parseName(f);
            const gold = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
            const a = await build(c);
            const rec = {
                cv: a.cv,
                presetId: a.presetId,
                seed: a.seed,
                lod: a.lod,
                meshes: fingerprintMeshes(a.meshes),
            };
            const se = schemaError(rec);
            if (se) {
                fails.push(`${f}: Schema — ${se}`);
                continue;
            }
            const de = meshDiff(f, gold.meshes, rec.meshes);
            if (de) fails.push(de);
            else ok++;
            if (fails.length >= 8) break;
        }
    });

    console.log("=== ASSET-VERTRAG v1 — Konformanz-Gate ===");
    console.log(`Goldens: ${files.length} · byte-gleich: ${ok}`);
    if (fails.length) {
        console.error("\n❌ ROT — erste Befunde:");
        for (const x of fails.slice(0, 8)) console.error("  • " + x);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Generator trifft die eingefrorenen Goldens byte-genau (cv:1). Kein stiller Drift.");
    process.exit(0);
})().catch((e) => {
    console.error("Gate-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
