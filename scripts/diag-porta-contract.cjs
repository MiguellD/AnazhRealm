// diag-porta-contract.cjs — ASSET-VERTRAG v4 (Tore): der Byte-Beweis für
// porta-core.js buildInstance (Studio-Vertrag B2, docs/studio-vertrag.md).
// Läuft DIREKT in Node (die v2/v3-Klasse): porta-core braucht nur
// THREE-Geometrie/Material-Klassen — das vendorte r128-UMD lädt in Node,
// kein Browser, keine swiftshader-Fragilität.
//
// Fingerabdruck je Fall (rezeptId × seed × lod): sha256 über den kanonischen
// Byte-Strom der gebauten Gruppe in traverse-Reihenfolge — je Objekt mit
// Geometrie: Typ · matrixWorld (Float64-Bytes) · Material-Signatur (Farbe/
// roughness/metalness/opacity) · alle Attribute (Name sortiert, itemSize +
// rohe Puffer-Bytes) · Index. Ein einziges abweichendes Byte kippt den Hash.
//
// SEED-INVARIANZ (cv:4, dokumentiert in spec/asset-contract/v4/CONTRACT.md):
// der Bau zieht aus dem LAB-FESTEN Strom mulberry32(0x50FA) (byte-treu zur
// Vorlage) — derselbe Bauplan bei seed 7 und 12345 ist byte-gleich. Das wird
// hier ALS Invariante geprüft: wer Seed-Variation einführt, bricht bewusst
// die Goldens (Re-Mint-Entscheid).
//
// Goldens: spec/asset-contract/v4/golden/gates.json — EINGEFROREN
// (Taille-Disziplin), gemintet NUR wenn die Datei fehlt (oder MINT_FORCE=1).
// SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden.
//   node scripts/diag-porta-contract.cjs
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v4/golden");
const goldenFile = path.join(goldenDir, "gates.json");

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── Der kanonische Fingerabdruck einer gebauten Gruppe (exakt die v3-Form) ──
function fingerprint(group) {
    const h = crypto.createHash("sha256");
    let objects = 0;
    let vertices = 0;
    group.updateMatrixWorld(true);
    group.traverse((o) => {
        const geo = o.geometry;
        if (!geo || !geo.attributes || !geo.attributes.position) return;
        objects++;
        vertices += geo.attributes.position.count;
        h.update(String(o.type));
        h.update(Buffer.from(new Float64Array(o.matrixWorld.elements).buffer));
        const m = o.material;
        if (m) {
            h.update(
                JSON.stringify({
                    c: m.color ? m.color.getHex() : null,
                    e: m.emissive ? m.emissive.getHex() : null,
                    r: typeof m.roughness === "number" ? m.roughness : null,
                    mt: typeof m.metalness === "number" ? m.metalness : null,
                    o: typeof m.opacity === "number" ? m.opacity : null,
                    t: !!m.transparent,
                })
            );
        }
        for (const name of Object.keys(geo.attributes).sort()) {
            const a = geo.attributes[name];
            const arr = a.array;
            h.update(name);
            h.update(String(a.itemSize));
            h.update(Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
        }
        if (geo.index) {
            const ia = geo.index.array;
            h.update("index");
            h.update(Buffer.from(ia.buffer, ia.byteOffset, ia.byteLength));
        }
    });
    return { objects, vertices, sha256: h.digest("hex") };
}

// ── Die eingefrorenen Fälle: Ordnungen × Seeds × LODs (+ ov-Override-Kanal) ──
const ORDNUNGEN = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor"];
const SEEDS = [7, 12345];
const LODS = [0]; // kindStages.gate = [0] — die einzige getragene Stufe
const CASES = [];
for (const g of ORDNUNGEN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: g, seed: s, lod: l });
// ov-Kanal (Parameter-Override) — friert auch die Merge-Semantik ein.
CASES.push({ rezeptId: "drachentor", seed: 7, lod: 0, ov: { mass: 0.95 } });
CASES.push({ rezeptId: "kathedrale", seed: 7, lod: 0, ov: { orders: 2, glow: 0.9 } });

function buildCase(c) {
    return PC.buildInstance(c.rezeptId, c.seed, c.lod, c.ov || undefined);
}
function caseKey(c) {
    return `${c.rezeptId}-s${c.seed}-L${c.lod}${c.ov ? "-ov_" + Object.keys(c.ov).sort().join("_") : ""}`;
}

// Reine Vergleichs-Funktion (auch der Selbst-Test ruft sie) → Abweichungsliste.
function compare(golden, actual) {
    const bad = [];
    for (const k in golden.cases) {
        const g = golden.cases[k];
        const a = actual[k];
        if (!a) {
            bad.push(`${k}: fehlt im Ist`);
            continue;
        }
        if (g.sha256 !== a.sha256)
            bad.push(`${k}: sha256 weicht ab (${g.sha256.slice(0, 12)}… != ${a.sha256.slice(0, 12)}…)`);
        else if (g.objects !== a.objects || g.vertices !== a.vertices) bad.push(`${k}: objects/vertices weichen ab`);
    }
    return bad;
}

(function main() {
    console.log("=== ASSET-VERTRAG v4 — Tore (porta-core.js buildInstance) ===");
    check("porta-core geladen (__portaCore + buildInstance)", !!PC && typeof PC.buildInstance === "function");

    // 1) Alle Fälle bauen + fingerprinten (und Determinismus im Lauf: doppelt bauen).
    const actual = {};
    let determin = true;
    for (const c of CASES) {
        const f1 = fingerprint(buildCase(c));
        const f2 = fingerprint(buildCase(c));
        if (f1.sha256 !== f2.sha256) determin = false;
        actual[caseKey(c)] = f1;
    }
    check(`Determinismus: jeder der ${CASES.length} Fälle baut doppelt byte-gleich`, determin);

    // 2) Seed-Invarianz (cv:4-Semantik — s. Kopf).
    let seedInv = true;
    for (const g of ORDNUNGEN) if (actual[`${g}-s7-L0`].sha256 !== actual[`${g}-s12345-L0`].sha256) seedInv = false;
    check("Seed-Invarianz: seed 7 == seed 12345 je Ordnung (Lab-fester rng-Strom)", seedInv);

    // 3) ov-Kanal wirkt (Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Parameter-Override ändert den Bau (drachentor != drachentor+mass)",
        actual["drachentor-s7-L0"].sha256 !== actual["drachentor-s7-L0-ov_mass"].sha256
    );

    // 4) lod-Klemme: jede Stufe wird auf 0 geklemmt (kindStages.gate = [0]).
    const l2 = fingerprint(PC.buildInstance("drachentor", 7, 2));
    check("lod-Klemme: buildInstance(…, lod 2) == Stufe 0 (kindStages.gate=[0])", l2.sha256 === actual["drachentor-s7-L0"].sha256);

    // 5) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    if (!fs.existsSync(goldenFile) || process.env.MINT_FORCE === "1") {
        fs.mkdirSync(goldenDir, { recursive: true });
        fs.writeFileSync(
            goldenFile,
            JSON.stringify(
                { cv: 4, minted: "buildInstance(rezeptId, seed, lod, ov?) — sha256 je Fall", cases: actual },
                null,
                2
            ) + "\n"
        );
        console.log(
            `  🧊 GOLDEN GEMINTET (${Object.keys(actual).length} Fälle) → ${path.relative(root, goldenFile)} — ab jetzt EINGEFROREN`
        );
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    check("Golden trägt cv:4 + alle Fälle", golden.cv === 4 && Object.keys(golden.cases).length === CASES.length);
    const diffs = compare(golden, actual);
    check(`Goldens byte-exakt (${Object.keys(golden.cases).length} Fälle)`, diffs.length === 0, diffs[0] || "");
    for (let i = 1; i < diffs.length; i++) console.log(`      ↳ ${diffs[i]}`);

    // 6) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
    const tampered = JSON.parse(JSON.stringify(golden));
    const k0 = Object.keys(tampered.cases)[0];
    tampered.cases[k0].sha256 = tampered.cases[k0].sha256.replace(
        /^./,
        tampered.cases[k0].sha256[0] === "0" ? "1" : "0"
    );
    const t1 = compare(tampered, actual);
    const actual2 = JSON.parse(JSON.stringify(actual));
    actual2[k0].objects += 1;
    const t2 = compare(golden, actual2);
    check(
        "SELBST-TEST: korruptes Golden (sha256) wird erkannt",
        t1.some((s) => s.includes("sha256"))
    );
    check(
        "SELBST-TEST: objects-Drift wird erkannt",
        t2.some((s) => s.includes("objects"))
    );

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Vertrags-Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Tor-Asset-Vertrag steht: buildInstance ist deterministisch + seed-invariant (cv:4), der ov-Kanal wirkt, die lod-Klemme hält, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert."
    );
    process.exit(0);
})();
