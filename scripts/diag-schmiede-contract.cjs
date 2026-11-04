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
const { fingerabdruck: fingerprint, goldenSelbsttest, vertragIst, goldenWand, kernProbe } = require("./lib/plattform-probe.cjs");

const { studioKern, pruefer, ROOT: root, path, jsonKlon } = require("./lib/welt-boot.cjs");
const { errs, check, wandEnde } = pruefer();
const SC = studioKern("schmiede-core.js", "__schmiedeCore");

// ── Die eingefrorenen Fälle: Gattungen × Seeds × LODs (+ ov-Override-Kanal) ──
const GATTUNGEN = Object.keys(SC.REZEPT_ZU_GATTUNG); // alle 23 (Waffen UND Werkzeuge; physik.K4: der Flegel kam additiv dazu)
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

// ── DIE ARENA (w4-arena-welt): Befund → Wände (Name, Täter) → Selbst-Test ──
// DIE ARENA (w4-arena-welt): die Klasse der Geräte als Gestalten des Kerns (EINE Art `arena`) — (A3) die Saat: kein
// Math.random in Kern und Hülle, die Wappen folgen dem Samen; (A4) die Hülle baut kein Gerät (jedes `new THREE.Mesh(` in einer
// Lehr-Ebene, der Bühne oder dem Arm — der Name der Funktion davor); (A6) der EINE Stoß: die Impuls-Formel lebt nur im Kern.
// Das Gesetz (jede bewegte Gestalt antwortet jedem vollen Hieb jeder Gattung und ruht ≤ 6 s), den Hieb am Pendel und den Ruf
// des Kerns misst gate:kampf-gefuehl Q16 in der Welt (der EINE Stoß des Wirts, der Spion an __schmiedeCore.stossImpuls).
// Eingefroren: je Hof seine Gestalten samt Gliedern in L0 · L1 · Wurf, dazu Saat und Regler (golden/arena.json). Stufen,
// Budget-Zeile, Reduktion, Stoffe und Fernform jeder Gestalt urteilt die Familie (gate:regler-wirkt über alle Rezepte der Art,
// gate:gegenstand-stoff, gate:studio-vertrag B2c, die Fern-Wand von gate:asset-contract). Der Selbst-Test verdirbt je Wand
// ihre Eingabe und sieht sie rot.
const fs = require("fs");
const stammLib = require("./lib/stamm.cjs");
const HUELLE = "worlds/schmiede/schmiede.js";
// wo die Hülle Meshes bauen darf: ihre Lehr-Ebenen, die Bühne und der Arm des Prüfstands — nie ein Gerät
const ERLAUBT = ["(Kopf)", "dot", "ringMesh", "buildLehrenOverlay", "buildSectionCard", "buildMassStrip", "buildGround", "buildViewModel", "addDummyScar", "ensureTrailMesh"];
// Der Befund: die Würfe in Kern und Hülle, die Saat der Wappen, der Ort (die Funktion davor) jedes Meshes der Hülle, die Formel
// des Stoßes in Stamm und Hülle.
function arenaBefund(K) {
    const fp = (id, s) => fingerprint(K.buildInstance(id, s, 0)).sha256;
    const code = stammLib.ohneKommentare(fs.readFileSync(path.join(root, "worlds/schmiede/schmiede.js"), "utf8"));
    const orte = [...code.matchAll(/new THREE\.Mesh\(/g)].map((m) => ([...code.slice(0, m.index).matchAll(/^function ([\w$]+)\(/gm)].pop() || [0, "(Kopf)"])[1]);
    const B = {
        zufall: ["schmiede-core.js", HUELLE].filter((datei) => !stammLib.fehlt(null, /Math\.random/, { datei })),
        saat: fp("ritter", 1) !== fp("ritter", 2) && fp("kampfbanner", 1) !== fp("kampfbanner", 5),
        meshe: orte.length,
        fremd: orte.filter((f) => !ERLAUBT.includes(f)),
        formel: [{}, { datei: HUELLE }].filter((o) => !stammLib.fehlt(null, /\(1 \+ e\) \* vRel/, o)).length,
    };
    return B;
}
function arenaWaende(B) {
    return [
        ["A3: kein Math.random in Kern und Hülle, die Wappen folgen dem Samen", B.saat ? B.zufall : B.zufall.concat("Saat")],
        [`A4: die Hülle baut kein Gerät (${B.meshe} Meshes in Lehr-Ebene, Bühne und Arm)`, B.fremd],
        ["A6: die Impuls-Formel lebt nur im Kern, nie in Stamm und Hülle", B.formel ? ["Formel " + B.formel + "×"] : []],
    ];
}
// die eingefrorenen Fälle: je Hof seine Gestalten (ein Glied bei seiner Art) in L0 · L1 · Wurf mit Same 1, dazu die Saat der
// Wappen und die Regler der Maße
function arenaFaelle(A) {
    const F = { saat: [["ritter", 2], ["ritter", 3], ["kampfbanner", 5], ["zielscheibe", 1, { radiusM: 0.2, hoeheM: 1.2 }], ["bambusrohr", 1, { hoeheM: 1.8 }], ["tatamirolle", 1, { rolleM: 0.5, seilM: 0 }]] };
    for (const id in A) (F[A[id].hof || A[A[id].glied].hof] ||= []).push([id, 1]);
    return Object.entries(F).map(([name, teile]) => ({ name, teile }));
}
function arenaFall(c) {
    const g = new THREE.Group();
    for (const [id, s, ov] of c.teile) for (const L of SC.ARENA_STUFEN) g.add(SC.buildInstance(id, s, L, ov));
    return g;
}

(async function main() {
    console.log("=== ASSET-VERTRAG v5 — Klingen & Werkzeuge (schmiede-core.js buildInstance) ===");
    check("schmiede-core geladen (__schmiedeCore + buildInstance)", !!SC && typeof SC.buildInstance === "function");
    check(
        `alle 23 Gattungen im Rezept-Namensraum (PRESETS)`,
        GATTUNGEN.length === 23 && GATTUNGEN.every((g) => /^[a-z0-9_-]+$/.test(g) && SC.PRESETS[g])
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
    await kernProbe("v5", "schmiede-core.js", "__schmiedeCore", CASES.filter((c) => c.seed === 7), check);

    // 7) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
    // gegen das Ist selbst (S1 Wände): der Selbst-Test misst auch auf einem roten Stand, was er misst
    goldenSelbsttest(actual, check);

    // ═══ DIE ARENA (w4-arena-welt) — die Klasse der Geräte als Gestalten des Kerns ═══
    console.log(`\n=== DIE ARENA — ${Object.keys(SC.ARENA_ARTEN).length} Gestalten der Art arena ===`);
    const B = arenaBefund(SC);
    const W = arenaWaende(B);
    for (const [name, taeter] of W) check(name, !taeter.length, taeter.slice(0, 6).join(" · "));
    const FAELLE = arenaFaelle(SC.ARENA_ARTEN);
    goldenWand(path.join(root, "spec/asset-contract/v5/golden/arena.json"), 5, vertragIst(FAELLE, arenaFall, check, (c) => c.name), check, FAELLE.length);
    // der Selbst-Test: je Wand ihre Eingabe verdorben — die Wand sieht den neuen Täter
    const verdirb = [(b) => b.zufall.push(0), (b) => b.fremd.push(0), (b) => b.formel++];
    const rot = verdirb.filter((f) => {
        const b = jsonKlon(B);
        f(b);
        return arenaWaende(b).some(([, t], i) => t.length > W[i][1].length);
    }).length;
    check(`SELBST-TEST A: jede Arena-Wand sieht ihre verdorbene Eingabe (${rot}/${verdirb.length})`, rot === verdirb.length);

    wandEnde(errs, "der Klingen-Asset-Vertrag steht: buildInstance ist deterministisch + seed-invariant (cv:5), der ov-Kanal wirkt, die lod-Klemme hält, die Split-Parität buildInstance==buildWeaponModel steht je Gattung, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert.");
})();
