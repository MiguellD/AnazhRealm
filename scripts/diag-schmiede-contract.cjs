// diag-schmiede-contract.cjs — ASSET-VERTRAG v5 (Klingen & Werkzeuge): der Byte-Beweis
// für schmiede-core.js buildInstance (Studio-Vertrag B2, docs/studio-vertrag.md).
// Läuft DIREKT in Node (die v2/v3/v4-Klasse): schmiede-core braucht nur
// THREE-Geometrie/Material-Klassen — das vendorte r128-UMD lädt in Node,
// kein Browser, keine swiftshader-Fragilität.
//
// Fingerabdruck je Fall (rezeptId × seed × lod): sha256 über den kanonischen
// Byte-Strom der gebauten Gruppe in traverse-Reihenfolge — je Objekt mit
// Geometrie: Typ · matrixWorld (Float64-Bytes) · Material-Signatur (Farbe/
// roughness/metalness/opacity) · alle Attribute (Name sortiert, itemSize +
// rohe Puffer-Bytes) · Index. Ein einziges abweichendes Byte kippt den Hash.
//
// SEED-INVARIANZ (cv:5, dokumentiert in spec/asset-contract/v5/CONTRACT.md):
// der Waffen-Bau des Labs ist eine reine Funktion der Parameter (kein
// stochastischer Term) — derselbe Bauplan bei seed 7 und 12345 ist byte-
// gleich. Das wird hier ALS Invariante geprüft: wer Seed-Variation einführt,
// bricht bewusst die Goldens (Re-Mint-Entscheid).
//
// SPLIT-PARITÄT (aktiv, je Lauf): buildInstance(id,7,0) == buildWeaponModel
// (<Gattung>) je Gattung — der Waffenständer der Lab-Arena baut über
// buildWeaponModel; Kern-Vertrags-Pfad und Shell-Pfad bleiben EIN Bau.
//
// Goldens: spec/asset-contract/v5/golden/klingen.json — EINGEFROREN
// (Taille-Disziplin), gemintet NUR wenn die Datei fehlt (oder MINT_FORCE=1).
// SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden.
//
// PLATTFORM-PROBE (Integration W5, scripts/lib/plattform-probe.cjs): die Goldens tragen auf jedem V8
// dieselben Bytes — jeder Fall baut noch einmal mit Math.pow um ±1 ULP verschoben (gebrochene Exponenten) und muss
// byte-gleich bleiben; kippt einer, nennt die Probe die Aufrufstelle. Seit S1 Wände driften alle Transzendenten: pow
// bleibt hart 0, sin/cos/atan2/hypot stehen benannt in spec/asset-contract/plattform-ratsche.json (nur fallend).
//   node scripts/diag-schmiede-contract.cjs
const path = require("path");
const { probeWand, fingerabdruck: fingerprint, goldenSelbsttest, fallSchluessel: caseKey, vertragIst, goldenWand, frischerKern } = require("./lib/plattform-probe.cjs");

const root = path.resolve(__dirname, "..");

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
const KERN = path.join(root, "schmiede-core.js");
require(KERN);
const SC = globalThis.__schmiedeCore;

const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();

// ── Die eingefrorenen Fälle: Gattungen × Seeds × LODs (+ ov-Override-Kanal) ──
const GATTUNGEN = Object.keys(SC.REZEPT_ZU_GATTUNG); // alle 22 (Waffen UND Werkzeuge)
const SEEDS = [7, 12345];
const LODS = [0]; // kindStages.weapon = [0] — die einzige getragene Stufe
const CASES = [];
for (const g of GATTUNGEN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: g, seed: s, lod: l });
// ov-Kanal (Parameter-Override) — friert auch die Merge-Semantik ein.
CASES.push({ rezeptId: "langschwert", seed: 7, lod: 0, ov: { klinge: 1.15, fuller: 0.2 } });
CASES.push({ rezeptId: "spitzhacke", seed: 7, lod: 0, ov: { schaft: 0.9 } });

function buildCase(c) {
    return SC.buildInstance(c.rezeptId, c.seed, c.lod, c.ov || undefined);
}


(async function main() {
    console.log("=== ASSET-VERTRAG v5 — Klingen & Werkzeuge (schmiede-core.js buildInstance) ===");
    check("schmiede-core geladen (__schmiedeCore + buildInstance)", !!SC && typeof SC.buildInstance === "function");
    check(
        `alle 22 Gattungen im Rezept-Namensraum (PRESETS)`,
        GATTUNGEN.length === 22 && GATTUNGEN.every((g) => /^[a-z0-9_-]+$/.test(g) && SC.PRESETS[g])
    );

    // ── ULTRAGUSS U6d — das Wirts-Schnitt-Gesetz wohnt im Kern (die EINE Formel-Quelle
    //    des Stamm-bladeProfile; der Stamm delegiert fail-closed, OAKESHOTT_TYPES ist
    //    Stamm-seitig ein Getter-Delegat). Eingefrorene Referenz-Werte (Mint 11.07.2026,
    //    Gitter-Beweis alt==neu 0 Abweichungen) — eine Formel-Drift ist ein Vertrags-Akt.
    const kp = typeof SC.klingenProfil === "function" ? SC.klingenProfil : null;
    check("U6d: klingenProfil exportiert (reine Profil-Funktion)", !!kp);
    if (kp) {
        const specXII = { baseHalfW: 0.1, maxThick: 0.06, tipWidth: 0.34, fuller: 0.5 };
        const p1 = kp(specXII, 0.5, -0.25); // Hohlkehle greift (|w|<fullerW-Band)
        const p2 = kp(specXII, 0.96, 1); // Spitzen-Klemme (t>0.92) an der Schneide
        const p3 = kp({ baseHalfW: 0.1, maxThick: 0.06 }, 0.5, 0); // Defaults tipFrac .18 / fuller 0
        check(
            "U6d: Referenz-Werte eingefroren (Verjüngung t^1.3 · Linse · Hohlkehle · Spitzen-Klemme)",
            p1.w === -0.01829891773006106 &&
                p1.h === 0.021542483263434557 &&
                p2.w === 0.018705606234187114 &&
                p2.h === 0 &&
                p3.w === 0 &&
                p3.h === 0.041999999999999996,
            `${p1.w}/${p1.h}/${p2.w}/${p2.h}/${p3.w}/${p3.h}`
        );
    }
    const OT = SC.OAKESHOTT_TYPES;
    check(
        "U6d: OAKESHOTT_TYPES wohnt im Kern (XII/XV/XIIIa, Werte eingefroren)",
        !!OT &&
            Object.keys(OT).length === 3 &&
            OT.XII.bladeLen === 1.45 &&
            OT.XII.tipWidth === 0.34 &&
            OT.XV.fuller === 0 &&
            OT.XV.bladeBaseW === 0.17 &&
            OT.XIIIa.bladeLen === 1.9 &&
            OT.XIIIa.gripLen === 0.46
    );

    // 1) Alle Fälle bauen + fingerprinten (und Determinismus im Lauf: doppelt bauen).
    const actual = vertragIst(CASES, buildCase, check);

    // 2) Seed-Invarianz (cv:5-Semantik — s. Kopf).
    let seedInv = true;
    for (const g of GATTUNGEN) if (actual[`${g}-s7-L0`].sha256 !== actual[`${g}-s12345-L0`].sha256) seedInv = false;
    check("Seed-Invarianz: seed 7 == seed 12345 je Gattung (reiner Parameter-Bau)", seedInv);

    // 3) ov-Kanal wirkt (Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Parameter-Override ändert den Bau (langschwert != langschwert+klinge/fuller)",
        actual["langschwert-s7-L0"].sha256 !== actual["langschwert-s7-L0-ov_fuller_klinge"].sha256
    );
    check(
        "ov-Kanal: auch am Wucht-Schaft (spitzhacke != spitzhacke+schaft)",
        actual["spitzhacke-s7-L0"].sha256 !== actual["spitzhacke-s7-L0-ov_schaft"].sha256
    );

    // 4) lod-Klemme: jede Stufe wird auf 0 geklemmt (kindStages.weapon = [0]).
    const l2 = fingerprint(SC.buildInstance("langschwert", 7, 2));
    check(
        "lod-Klemme: buildInstance(…, lod 2) == Stufe 0 (kindStages.weapon=[0])",
        l2.sha256 === actual["langschwert-s7-L0"].sha256
    );

    // 5) SPLIT-PARITÄT: der Vertrags-Pfad == der Lab-Waffenständer-Pfad, je Gattung.
    let parity = 0;
    for (const g of GATTUNGEN) {
        const fw = fingerprint(SC.buildWeaponModel(SC.REZEPT_ZU_GATTUNG[g]));
        if (fw.sha256 === actual[`${g}-s7-L0`].sha256) parity++;
    }
    check(
        `Split-Parität: buildInstance == buildWeaponModel je Gattung (${parity}/${GATTUNGEN.length})`,
        parity === GATTUNGEN.length
    );

    // 6) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    goldenWand(path.join(root, "spec/asset-contract/v5/golden/klingen.json"), 5, actual, check, CASES.length);

    // 6b) PLATTFORM-PROBE: die Bytes hängen an keinem letzten Bit von Math.pow, die übrigen Transzendenten halten ihre
    //     Ratsche (je Lauf ein frisch geladener Kern — die Stoffe rechnen ihre Farbe beim ersten Bau). Die Fälle ohne
    //     Seed-Dopplung (seed-invariant, s. Kopf).
    await probeWand(
        "v5",
        {
            laden: frischerKern(KERN, "__schmiedeCore"),
            bauen: (K) => {
                const r = {};
                for (const c of CASES)
                    if (c.seed === 7) r[caseKey(c)] = fingerprint(K.buildInstance(c.rezeptId, c.seed, c.lod, c.ov)).sha256;
                return r;
            },
        },
        check
    );
    globalThis.__schmiedeCore = SC;

    // 7) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
    // gegen das Ist selbst (S1 Wände): der Selbst-Test misst auch auf einem roten Stand, was er misst
    goldenSelbsttest(actual, check);

    wandEnde(errs, "der Klingen-Asset-Vertrag steht: buildInstance ist deterministisch + seed-invariant (cv:5), der ov-Kanal wirkt, die lod-Klemme hält, die Split-Parität buildInstance==buildWeaponModel steht je Gattung, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert.");
})();
