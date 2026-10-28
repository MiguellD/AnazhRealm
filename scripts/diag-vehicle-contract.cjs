// diag-vehicle-contract.cjs — ASSET-VERTRAG v3 (Fahrzeuge): der Byte-Beweis
// für vehicle-core.js buildInstance (Studio-Vertrag B2, docs/studio-vertrag.md).
// Läuft DIREKT in Node (Gesetzbuch-Gate ohne Browser): vehicle-core braucht
// nur THREE-Geometrie/Material-Klassen — das vendorte r128-UMD lädt in Node,
// kein Browser, keine swiftshader-Fragilität.
//
// Fingerabdruck je Fall (rezeptId × seed × lod): sha256 über den kanonischen
// Byte-Strom der gebauten Gruppe in traverse-Reihenfolge — je Objekt mit
// Geometrie: Typ · matrixWorld (Float64-Bytes) · Material-Signatur (Farbe/
// roughness/metalness/opacity) · alle Attribute (Name sortiert, itemSize +
// rohe Puffer-Bytes) · Index. Ein einziges abweichendes Byte kippt den Hash.
//
// SEED-INVARIANZ (cv:3, dokumentiert in spec/asset-contract/v3/CONTRACT.md):
// das Garage-Studio trägt keinen stochastischen Term — derselbe Bauplan bei
// seed 7 und 12345 ist byte-gleich. Das wird hier ALS Invariante geprüft: wer
// Seed-Variation einführt, bricht bewusst die Goldens (Re-Mint-Entscheid).
//
// Goldens: spec/asset-contract/v3/golden/vehicles.json — EINGEFROREN
// (Taille-Disziplin), gemintet NUR wenn die Datei fehlt (oder MINT_FORCE=1).
// SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden.
// PLATTFORM-PROBE (Integration W5; S1 Wände: alle Transzendenten, scripts/lib/plattform-probe.cjs): Math.pow ±1 ULP
// kippt kein Byte — die Goldens tragen unter Node 22 (CI) und Node 24 (lokal) dieselben Bytes; sin/cos/atan2/hypot
// erreichen die Bytes (Float64-Matrizen, ungerastert) und stehen benannt in spec/asset-contract/plattform-ratsche.json.
//   node scripts/diag-vehicle-contract.cjs
const fs = require("fs");
const path = require("path");
const { probeWand, fingerabdruck: fingerprint, goldenVergleich: compare, goldenSelbsttest } = require("./lib/plattform-probe.cjs");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v3/golden");
const goldenFile = path.join(goldenDir, "vehicles.json");

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
const KERN = path.join(root, "vehicle-core.js");
require(KERN);
const VC = globalThis.__vehicleCore;

const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();

// ── Die eingefrorenen Fälle: Gattungen × Seeds × LODs (+ ov-Kultur-Kanal) ──
const GATTUNGEN = ["gt", "supersport", "limousine", "kompakt_fwd", "suv"];
const SEEDS = [7, 12345];
const LODS = [0]; // kindStages.vehicle = [0, 1] — die feine Stufe je Seed; die Stufe 1 trägt je Gattung EINEN Fall (unten)
const CASES = [];
for (const g of GATTUNGEN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: g, seed: s, lod: l });
// DIE STUFE 1 (K43-2, Vertrags-Akt: fünf Fälle neu, die zwölf alten byte-gleich): derselbe Bau unter FAHRZEUG_DETAIL_1
for (const g of GATTUNGEN) CASES.push({ rezeptId: g, seed: 7, lod: 1 });
// ov-Kanal (CULTURES als Parameter-Override) — friert auch die Merge-Semantik ein
CASES.push({ rezeptId: "gt", seed: 7, lod: 0, ovKultur: "toro" });
CASES.push({ rezeptId: "supersport", seed: 7, lod: 0, ovKultur: "cavallo" });

function buildCase(c) {
    const ov = c.ovKultur ? VC.CULTURES[c.ovKultur].fx : undefined;
    return VC.buildInstance(c.rezeptId, c.seed, c.lod, ov);
}
function caseKey(c) {
    return `${c.rezeptId}-s${c.seed}-L${c.lod}${c.ovKultur ? "-ov_" + c.ovKultur : ""}`;
}


(async function main() {
    console.log("=== ASSET-VERTRAG v3 — Fahrzeuge (vehicle-core.js buildInstance) ===");

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

    // 2) Seed-Semantik (cv:3): die GEOMETRIE ist seed-invariant.
    let seedInv = true;
    for (const g of GATTUNGEN)
        if (
            fingerprint(VC.buildInstance(g, 7, 0), true).sha256 !==
            fingerprint(VC.buildInstance(g, 12345, 0), true).sha256
        )
            seedInv = false;
    check("Seed-Invarianz der Geometrie: seed 7 == seed 12345 je Gattung (kein stochastischer Term)", seedInv);
    // 3) ov-Kanal wirkt (Kultur-Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Kultur-Override ändert den Bau (gt != gt+toro)",
        actual["gt-s7-L0"].sha256 !== actual["gt-s7-L0-ov_toro"].sha256
    );

    // 4) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    if (!fs.existsSync(goldenFile) || process.env.MINT_FORCE === "1") {
        fs.mkdirSync(goldenDir, { recursive: true });
        fs.writeFileSync(
            goldenFile,
            JSON.stringify(
                { cv: 3, minted: "buildInstance(rezeptId, seed, lod, ov?) — sha256 je Fall", cases: actual },
                null,
                2
            ) + "\n"
        );
        console.log(
            `  🧊 GOLDEN GEMINTET (${Object.keys(actual).length} Fälle) → ${path.relative(root, goldenFile)} — ab jetzt EINGEFROREN`
        );
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    check("Golden trägt cv:3 + alle Fälle", golden.cv === 3 && Object.keys(golden.cases).length === CASES.length);
    const diffs = compare(golden, actual);
    check(`Goldens byte-exakt (${Object.keys(golden.cases).length} Fälle)`, diffs.length === 0, diffs[0] || "");
    for (let i = 1; i < diffs.length; i++) console.log(`      ↳ ${diffs[i]}`);

    // 4b) PLATTFORM-PROBE: die Bytes hängen an keinem letzten Bit von Math.pow, die übrigen Transzendenten halten ihre
    //     Ratsche (je Lauf ein frisch geladener Kern — die Lack-Stoffe rechnen ihre Farbe beim ersten Bau). Alle Fälle:
    //     der Same wählt den Lack.
    await probeWand(
        "v3",
        {
            laden: () => {
                delete require.cache[require.resolve(KERN)];
                require(KERN);
                return globalThis.__vehicleCore;
            },
            bauen: (K) => {
                const r = {};
                for (const c of CASES)
                    r[caseKey(c)] = fingerprint(
                        K.buildInstance(c.rezeptId, c.seed, c.lod, c.ovKultur ? K.CULTURES[c.ovKultur].fx : undefined)
                    ).sha256;
                return r;
            },
        },
        check
    );
    globalThis.__vehicleCore = VC;

    // 5) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
    // gegen das Ist selbst (S1 Wände): der Selbst-Test misst auch auf einem roten Stand, was er misst
    goldenSelbsttest(actual, check);

    wandEnde(errs, "der Fahrzeug-Asset-Vertrag steht: buildInstance ist deterministisch, die Geometrie seed-invariant, der ov-Kanal wirkt, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert.");
})();
