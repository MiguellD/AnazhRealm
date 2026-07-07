// diag-creature-contract.cjs — P7-GATE: der Kreatur-Vertrag v2. Lädt die FROZEN Fixtures (reale
// Kreatur-Specs) + die eingefrorenen Goldens, bäckt jede Spec über bake-core (`__bakeSkinGeometry`)
// NEU in reinem Node und prüft den byte-exakten Fingerabdruck (sha256 + Byte-Länge je Attribut) +
// das Schema (cv:2, Pflicht-Fingerprints). Kein Browser, kein Renderer — die Skin-Isosurface ist
// THREE-frei + deterministisch → die erste Nicht-Pflanzen-Asset-Klasse ist drift-bewacht wie die
// Pflanzen (P1). Ein Drift in bake-core (smin/Displace/Taubin/Isosurface) fliegt hier byte-genau auf.
//   node scripts/diag-creature-contract.cjs
const fs = require("fs");
const path = require("path");
const L = require("./lib/skin-contract.cjs");

function fpEqual(a, b) {
    if (!a || !b) return a === b;
    return a.itemSize === b.itemSize && a.bytes === b.bytes && a.sha256 === b.sha256;
}

(function () {
    const fixtures = L.loadFixtures();
    if (!fixtures || !Array.isArray(fixtures.specs) || !fixtures.specs.length) {
        console.error("❌ keine Fixture (spec/asset-contract/v2/fixtures/skin-fixtures.json) — erst münzen: node scripts/mint-creature-goldens.cjs");
        process.exit(1);
    }
    if (!fs.existsSync(L.GOLDEN_DIR)) {
        console.error("❌ kein golden/ (spec/asset-contract/v2/golden) — erst münzen.");
        process.exit(1);
    }
    const bake = L.loadBakeCore();
    let checks = 0,
        fails = 0;
    const fail = (m) => {
        fails++;
        console.error("  ❌ " + m);
    };

    console.log("=== P7 — KREATUR-VERTRAG v2 (bake-core Skin, byte-exakt gegen die Goldens) ===");
    for (const spec of fixtures.specs) {
        const file = L.fileFor(spec.id);
        const gp = path.join(L.GOLDEN_DIR, file);
        if (!fs.existsSync(gp)) {
            fail(`${spec.id}: kein Golden (${file})`);
            continue;
        }
        const golden = JSON.parse(fs.readFileSync(gp, "utf8"));
        const rec = L.bakeAndFingerprint(bake, spec);

        // Schema.
        checks++;
        if (rec.cv !== 2) fail(`${spec.id}: cv ${rec.cv} != 2`);
        checks++;
        if (!rec.skin) {
            fail(`${spec.id}: bake-core lieferte KEINE Geometrie (leere Skin)`);
            continue;
        }
        // Byte-exakte Fingerprints je Attribut.
        for (const attr of ["positions", "normals", "colors", "index"]) {
            const g = golden.skin ? golden.skin[attr] : null;
            const c = rec.skin[attr];
            if (!g && !c) continue; // beide fehlen → ok
            checks++;
            if (!fpEqual(g, c)) {
                fail(
                    `${spec.id}.${attr}: Fingerabdruck weicht ab — golden ${g ? g.sha256.slice(0, 12) : "∅"} (${g ? g.bytes : 0}B) vs jetzt ${c ? c.sha256.slice(0, 12) : "∅"} (${c ? c.bytes : 0}B)`
                );
            }
        }
        // Vert-Zahl (Sanity, redundant zum pos-Hash aber lesbar).
        checks++;
        if (golden.skin.vertexCount !== rec.skin.vertexCount)
            fail(`${spec.id}: vertexCount ${rec.skin.vertexCount} != golden ${golden.skin.vertexCount}`);
        if (fails === 0 || rec.skin) {
            const ok = golden.skin && fpEqual(golden.skin.positions, rec.skin.positions);
            console.log(`  ${ok ? "✅" : "  "} ${spec.id}: ${rec.skin.vertexCount} Verts · pos ${rec.skin.positions.sha256.slice(0, 12)}…`);
        }
    }

    // Manifest-Konsistenz (die Golden-Dateien selbst byte-stabil).
    const mp = path.join(L.GOLDEN_DIR, "manifest.json");
    if (fs.existsSync(mp)) {
        const man = JSON.parse(fs.readFileSync(mp, "utf8"));
        checks++;
        if (man.cv !== 2) fail(`manifest cv ${man.cv} != 2`);
    }

    console.log(`\n${checks} Prüfungen, ${fails} Abweichung(en).`);
    if (fails) {
        console.error("❌ ROT — der Kreatur-Skin driftet gegen die eingefrorenen Goldens (bake-core-Mathematik geändert?). Bewusster Re-Mint: MINT_FORCE=1 node scripts/mint-creature-goldens.cjs mit Begründung.");
        process.exit(1);
    }
    console.log("✅ GRÜN — bake-core trifft die eingefrorenen Kreatur-Skin-Goldens byte-genau (cv:2). Die erste Nicht-Pflanzen-Asset-Klasse ist am Vertrag angedockt, kein stiller Drift.");
    process.exit(0);
})();
