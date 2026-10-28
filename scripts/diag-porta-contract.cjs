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
// Goldens: spec/asset-contract/v4/golden/gates.json — EINGEFROREN (Taille-Disziplin), gemintet NUR wenn die Datei fehlt
// (oder MINT_FORCE=1). SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden. PLATTFORM-PROBE (S1
// Wände, scripts/lib/plattform-probe.cjs): die Transzendenten von Math ±1 ULP kippen kein Byte — die Goldens tragen
// unter Node 22 (CI) und Node 24 (lokal) dieselben Bytes; kippt ein Fall, nennt die Probe Funktion und Aufrufstelle.
//   node scripts/diag-porta-contract.cjs
const path = require("path");
const { fingerabdruck: fingerprint, goldenSelbsttest, vertragIst, goldenWand, kernProbe } = require("./lib/plattform-probe.cjs");

const { studioKern, pruefer, ROOT: root } = require("./lib/welt-boot.cjs");
const { errs, check, wandEnde } = pruefer();
const PC = studioKern("porta-core.js", "__portaCore");

// ── Die eingefrorenen Fälle: Ordnungen × Seeds × LODs (+ ov-Override-Kanal) ──
const ORDNUNGEN = ["drachentor", "kathedrale", "maschine", "geisttor", "verkalkt", "ruine", "maurentor"];
const SEEDS = [7, 12345];
const LODS = [0]; // kindStages.gate = [0, 1, 2, 3] — die feine Stufe je Seed; die Stufe 1 und die NUR-WURF-Stufe 3 tragen je Ordnung EINEN Fall (unten)
const CASES = [];
for (const g of ORDNUNGEN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: g, seed: s, lod: l });
// ov-Kanal (Parameter-Override) — friert auch die Merge-Semantik ein.
CASES.push({ rezeptId: "drachentor", seed: 7, lod: 0, ov: { mass: 0.95 } });
CASES.push({ rezeptId: "kathedrale", seed: 7, lod: 0, ov: { orders: 2, glow: 0.9 } });
// die NUR-WURF-Stufe 3 (1110-9: die Hüllen-Liste des Tors als EIN Gitter im Schatten-Stoff) — additiv, je Ordnung EIN Fall
for (const g of ORDNUNGEN) CASES.push({ rezeptId: g, seed: 7, lod: 3 });
// die STUFE 1 (K43, Kosten ins Asset: derselbe Bau unter TOR_DETAIL_1, die Flügel fest) — additiv, je Ordnung EIN Fall; die 23
// Fälle davor blieben byte-gleich
for (const g of ORDNUNGEN) CASES.push({ rezeptId: g, seed: 7, lod: 1 });
// die STUFE 2 (K64, Kosten ins Asset: derselbe Bau unter TOR_DETAIL_2 — das Feine unter einem Szenen-Pixel fällt, das Geflecht
// trägt jeden zweiten Strang mit der Deckung aller) — additiv, je Ordnung EIN Fall; die 30 Fälle davor blieben byte-gleich
for (const g of ORDNUNGEN) CASES.push({ rezeptId: g, seed: 7, lod: 2 });

function buildCase(c) {
    return PC.buildInstance(c.rezeptId, c.seed, c.lod, c.ov || undefined);
}

(async function main() {
    console.log("=== ASSET-VERTRAG v4 — Tore (porta-core.js buildInstance) ===");
    check("porta-core geladen (__portaCore + buildInstance)", !!PC && typeof PC.buildInstance === "function");

    // 1) Alle Fälle bauen + fingerprinten (und Determinismus im Lauf: doppelt bauen).
    const actual = vertragIst(CASES, buildCase, check);

    // 2) Seed-Invarianz (cv:4-Semantik — s. Kopf).
    let seedInv = true;
    for (const g of ORDNUNGEN) if (actual[`${g}-s7-L0`].sha256 !== actual[`${g}-s12345-L0`].sha256) seedInv = false;
    check("Seed-Invarianz: seed 7 == seed 12345 je Ordnung (Lab-fester rng-Strom)", seedInv);

    // 3) ov-Kanal wirkt (Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Parameter-Override ändert den Bau (drachentor != drachentor+mass)",
        actual["drachentor-s7-L0"].sha256 !== actual["drachentor-s7-L0-ov_mass"].sha256
    );

    // 4) lod-Klemme: jede Stufe klemmt auf die größte deklarierte ≤ lod (kindStages.gate = [0, 1, 2, 3]): 5 → 3, und die Stufe 2
    //    ist eine eigene (nicht die Stufe 1).
    const l2 = fingerprint(PC.buildInstance("drachentor", 7, 2));
    const l5 = fingerprint(PC.buildInstance("drachentor", 7, 5));
    check(
        "lod-Klemme: buildInstance(…, lod 2) == Stufe 2 != Stufe 1, lod 5 == Stufe 3 (kindStages.gate=[0,1,2,3])",
        l2.sha256 === actual["drachentor-s7-L2"].sha256 &&
            l2.sha256 !== actual["drachentor-s7-L1"].sha256 &&
            l5.sha256 === actual["drachentor-s7-L3"].sha256
    );

    // 5) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    goldenWand(path.join(root, "spec/asset-contract/v4/golden/gates.json"), 4, actual, check, CASES.length);

    // 5b) PLATTFORM-PROBE: die Bytes hängen an keinem letzten Bit einer Transzendenten — das Byte-Raster am Ausgang
    //     (porta-core ausRaster) hält die Ratsche auf 0 (je Lauf ein frisch geladener Kern). Die Fälle ohne
    //     Seed-Dopplung (seed-invariant, s. Kopf).
    await kernProbe("v4", "porta-core.js", "__portaCore", CASES.filter((c) => c.seed === 7), check);

    // 5c) DIE TOR-HÜLLE: die gemintete Tafel `TOR_HUELLE`, mit der der Wirt jedes Tor
    //     stoßen lässt, IST die gebaute Gestalt — je Rezept und Zahl deckt die Tafel das Gemessene und liegt höchstens 1 cm
    //     darüber (scripts/lib/tor-huelle.cjs). Bis dahin baute der Wirt die Gestalt beim ersten Spawn synchron auf dem
    //     Haupt-Thread nach; ändert sich der Bau, nennt die Linse die Zahl beim Namen. `MINT_TOR_HUELLE=1` druckt die Tafel.
    const { torHuelleMessen, torHuelleTafel, torHuelleTreue } = require("./lib/tor-huelle.cjs");
    const gemessen = {};
    for (const id of Object.keys(PC.PRESETS)) {
        const m = torHuelleMessen(PC, global.THREE, id);
        if (m) gemessen[id] = m;
    }
    if (process.env.MINT_TOR_HUELLE === "1") {
        console.log("  TOR_HUELLE (gemintet, für porta-core.js):");
        for (const [id, z] of Object.entries(torHuelleTafel(PC, global.THREE)))
            console.log(
                `        ${id}: { seiten: ${JSON.stringify(z.seiten).replace(/,/g, ", ")}, oberkante: ${z.oberkante} },`
            );
    }
    const treue = torHuelleTreue(PC.TOR_HUELLE, gemessen);
    check(
        `Tor-Hülle: TOR_HUELLE ist die gebaute Gestalt (${Object.keys(gemessen).length} Rezepte, je 9 Zahlen, ≤ 1 cm darüber)`,
        Object.keys(gemessen).length === ORDNUNGEN.length && treue.length === 0,
        treue[0] || ""
    );
    for (let i = 1; i < treue.length; i++) console.log(`      ↳ ${treue[i]}`);
    {
        // der eingeschmuggelte Täter: eine Pfosten-Kante 20 cm innerhalb des Bilds, eine fehlende Zeile
        const schmal = JSON.parse(JSON.stringify(PC.TOR_HUELLE));
        schmal.ruine.seiten[1][0] -= 0.2;
        delete schmal.geisttor;
        const t = torHuelleTreue(schmal, gemessen);
        check(
            "SELBST-TEST: eine zu schmale Tor-Hülle und eine fehlende Zeile werden beim Namen genannt",
            t.some((s) => /^ruine\.seiten\[1\]\.pfostenX: Tafel 5\.09/.test(s)) &&
                t.some((s) => /^geisttor: keine Zeile/.test(s)),
            t.join(" · ")
        );
    }

    // 6) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot (gegen das Ist selbst, damit der
    //    Selbst-Test auch auf einem roten Stand misst, was er misst).
    goldenSelbsttest(actual, check);

    wandEnde(errs, "der Tor-Asset-Vertrag steht: buildInstance ist deterministisch + seed-invariant (cv:4), der ov-Kanal wirkt, die lod-Klemme hält, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert.");
})();
