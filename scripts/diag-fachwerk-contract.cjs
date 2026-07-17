// diag-fachwerk-contract.cjs — ASSET-VERTRAG v6 (Häuser): der Byte-Beweis für
// fachwerk-core.js buildInstance (Studio-Vertrag B2, docs/studio-vertrag.md).
// Läuft DIREKT in Node (die v2/v3/v4/v5-Klasse): fachwerk-core braucht nur
// THREE-Geometrie/Material-Klassen — das vendorte r128-UMD lädt in Node,
// kein Browser, keine swiftshader-Fragilität (die Canvas-Textur-Bäcker sind
// document-gegated und backen in Node kartenlos — exakt wie im Worker).
//
// Fingerabdruck je Fall (rezeptId × seed × lod): sha256 über den kanonischen
// Byte-Strom der gebauten Gruppe in traverse-Reihenfolge — je Objekt mit
// Geometrie: Typ · matrixWorld (Float64-Bytes) · Material-Signatur (Farbe/
// roughness/metalness/opacity) · alle Attribute (Name sortiert, itemSize +
// rohe Puffer-Bytes) · Index. Ein einziges abweichendes Byte kippt den Hash.
//
// SEED-GETRIEBEN (cv:6, dokumentiert in spec/asset-contract/v6/CONTRACT.md):
// der Haus-Bau würfelt aus P.seed (Fenstertakt · OG-Material · Giebel-Verband ·
// Gauben · Fenster-Schlaf) — anders als Fahrzeug/Tor/Klinge ist derselbe
// Bauplan bei seed 7 und 12345 NICHT byte-gleich (die Goldens frieren beide
// Seeds je Stufe ein; stochastik-freie Stil-Familien dürfen seed-stabil sein).
//
// SPLIT-PARITÄT (aktiv, je Lauf, Stichproben-Rezepte × alle 3 Stufen): der
// Vertrags-Pfad buildInstance(id, seed, L) == die SHELL-KOMPOSITION derselben
// Kern-Primitive (kulturParams(name, LAB_SEED) frisch → stapelBau/HAUS.build/
// bakeLOD/fragFuer/mischeGeoms — wörtlich der promoteBauen-/LOD-Sonden-Pfad
// des Labs) — Kern-Vertrags-Pfad und Lab-Pfad bleiben EIN Bau, und die
// eingefrorene PRESETS-Ableitung drift-wacht gegen die lebende Kultur-Quelle.
//
// STUFEN-WAHRHEIT (kindStages.haus = [0,1,2], die erste Mehr-Stufen-Domäne
// außerhalb der Bäume): jede Stufe baut eine ANDERE Geometrie (L0 voll ·
// L1 Hülle · L2 Destillat+Fernkörper) — aktiv geprüft; die lod-Klemme faltet
// lod 9 → 2 und lod −1 → 0 (Flatten-Chokepoint-Semantik).
//
// Goldens: spec/asset-contract/v6/golden/haeuser.json — EINGEFROREN
// (Taille-Disziplin), gemintet NUR wenn die Datei fehlt (oder MINT_FORCE=1).
// SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden.
//   node scripts/diag-fachwerk-contract.cjs
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v6/golden");
const goldenFile = path.join(goldenDir, "haeuser.json");

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "fachwerk-core.js"));
const FC = globalThis.__fachwerkCore;

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── Der kanonische Fingerabdruck einer gebauten Gruppe (exakt die v3/v4/v5-Form) ──
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

// Wegwerf-Bau sauber entsorgen (194 Häuser in einem Node-Prozess).
function disposeGroup(g) {
    if (!g) return;
    g.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
    });
}

// ── Die eingefrorenen Fälle: Kulturen × Seeds × die drei deklarierten Stufen ──
const KULTUREN = Object.keys(FC.PRESETS); // alle 32 Kultur-Archetypen
const SEEDS = [7, 12345];
const LODS = FC.PORTAL_RENDER_CONFIG.lod.kindStages.haus; // [0, 1, 2] — die B2-Stufen-Wahrheit
const CASES = [];
for (const k of KULTUREN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: k, seed: s, lod: l });
// ov-Kanal (Parameter-Override) — friert auch die Merge-Semantik ein.
CASES.push({ rezeptId: "alemannisch", seed: 7, lod: 0, ov: { storeys: 3, turm: 1 } });
CASES.push({ rezeptId: "hochhaus", seed: 7, lod: 2, ov: { W: 12 } });

function buildCase(c) {
    return FC.buildInstance(c.rezeptId, c.seed, c.lod, c.ov || undefined);
}
function caseKey(c) {
    return `${c.rezeptId}-s${c.seed}-L${c.lod}${c.ov ? "-ov_" + Object.keys(c.ov).sort().join("_") : ""}`;
}

// ── DIE SHELL-KOMPOSITION (Split-Paritäts-Referenz): derselbe Bau aus den
//    Kern-PRIMITIVEN, wörtlich wie das Lab (promoteBauen · LOD-Sonde) — mit
//    FRISCHER kulturParams-Ableitung statt der eingefrorenen PRESETS (die
//    Probe drift-wacht beide Nähte: Stufen-Komposition UND Rezept-Ableitung). ──
function shellPfad(name, seed, stufe) {
    const kp = FC.kulturParams(name, FC.LAB_SEED);
    // ≡ hausParams-Basis: B4-Defaults + terrain:0, dann die Kultur-Felder (applyKultur → readParams).
    const p = { terrain: 0, seed: seed };
    for (const row of FC.PARAMS_BY_KIND.haus) p[row.id] = row.def;
    p.W = kp.W;
    p.D = kp.D;
    p.pitchDeg = kp.pitchDeg;
    p.storeys = kp.storeys;
    p.hip = kp.hip;
    p.roofCurve = kp.roofCurve;
    for (const b of [
        "treppgiebel",
        "kuppel",
        "portikus",
        "arkade",
        "turm",
        "zinnen",
        "veranda",
        "vorkragung",
        "pilotis",
        "terrasse",
    ])
        p[b] = kp[b];
    p.brace = kp.brace;
    p.stil = kp.stil;
    p.dachTyp = kp.dachTyp;
    p.bogenTyp = kp.bogenTyp;
    p.grundriss = kp.grundriss;
    if (kp.col) p.col = Object.assign({}, kp.col);
    p.place = { mode: "site", siteTag: "haus" }; // der fx-Daten-Passagier reist im Vertrags-Pfad mit — hier identisch
    FC.materials();
    const geoms = {};
    const turm = (p.storeys || 1) >= 6;
    if (stufe === 0) {
        // ≡ promoteBauen (Lab) + LÜCKENLOS-Bake:
        const hp2 = Object.assign({}, p, {
            nur: turm ? { moebel: false, innenwaende: false } : p.arm ? { moebel: false } : {},
        });
        const st =
            (p.storeys || 1) > 11
                ? FC.stapelBau(hp2, { gelaende: false })
                : (() => {
                      const H = FC.HAUS(THREE, FC.mat, hp2);
                      return { g: H.build({ gelaende: false }), H };
                  })();
        // DORF-ERLEBNIS (17.07.) — die TÜR-FLÜGEL-SEPARATION wandert mit dem
        // Kern (Lehre 6: Tests wandern mit dem Code): Tür-Blätter (userData.side)
        // werden JE Blatt eigen gebakt + als Scharnier-Wrap angehängt — wörtlich
        // der buildStufe-Pfad; der Rumpf bakt danach LÜCKENLOS wie zuvor.
        const fluegelL = [];
        st.g.updateMatrixWorld(true);
        st.g.traverse((o) => {
            if (o.userData && o.userData.door && typeof o.userData.side === "number") fluegelL.push(o);
        });
        const tuerWraps = [];
        for (const Lf of fluegelL) {
            const lg = {};
            FC.bakeLOD(Lf, p.col, lg, 0, true);
            const wg = FC.geomsZuGruppe(lg, p.col || null);
            if (!wg.children.length) continue;
            wg.position.set(Lf.position.x, 0, Lf.position.z);
            wg.userData = { side: Lf.userData.side, offen: Lf.userData.offen || 0 };
            if (Lf.parent) Lf.parent.remove(Lf);
            tuerWraps.push(wg);
        }
        if (tuerWraps.length) geoms.__tuerFluegel = tuerWraps;
        FC.bakeLOD(st.g, p.col, geoms, 0, true);
        disposeGroup(st.g);
    } else {
        // ≡ LOD-Sonde: MASS-BUILD → B, Warm-Pfad für Stufe 2, dann fragFuer.
        const mass = FC.stapelBau(Object.assign({}, p, { nur: FC.MASSNUR }), FC.LOD1F);
        const bx = new THREE.Box3().setFromObject(mass.g);
        const B = {
            p,
            q: { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0 } },
            lod: "chunk",
            dyn: false,
            ext: { x0: bx.min.x, x1: bx.max.x, z0: bx.min.z, z1: bx.max.z, y1: bx.max.y },
            dims: mass.H.dims,
            fp: FC.fpVon(mass.H),
            spawnL: { x: mass.H.spawn.x, z: mass.H.spawn.z },
            hofGap: 2.5,
            meshes: [],
        };
        disposeGroup(mass.g);
        if (stufe === 2 && !turm) {
            FC.fragFuer(B, 1);
            B.frag = null;
            B.fragStufe = undefined;
        }
        FC.mischeGeoms(geoms, FC.fragFuer(B, stufe === 1 ? 1 : 2));
        B.frag = null;
        B.fragStufe = undefined;
    }
    const g = FC.geomsZuGruppe(geoms, p.col || null);
    // DORF-ERLEBNIS — die separierten Tür-Flügel reisen wie in buildInstance mit.
    if (geoms.__tuerFluegel) for (const wg of geoms.__tuerFluegel) g.add(wg);
    g.userData = { kind: "haus", rezeptId: name, seed, lod: stufe };
    g.updateMatrixWorld(true);
    return g;
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
    console.log("=== ASSET-VERTRAG v6 — Häuser (fachwerk-core.js buildInstance) ===");
    check("fachwerk-core geladen (__fachwerkCore + buildInstance)", !!FC && typeof FC.buildInstance === "function");
    check(
        "alle 32 Kulturen im Rezept-Namensraum (PRESETS)",
        KULTUREN.length === 32 && KULTUREN.every((k) => /^[a-z0-9_-]+$/.test(k) && FC.PRESETS[k].kind === "haus")
    );
    check(
        "kindStages.haus == [0,1,2] (B2 — die erste Mehr-Stufen-Domäne außerhalb der Bäume)",
        JSON.stringify(LODS) === "[0,1,2]"
    );

    // 1) Alle Fälle bauen + fingerprinten.
    const actual = {};
    const t0 = Date.now();
    for (const c of CASES) {
        const g = buildCase(c);
        actual[caseKey(c)] = fingerprint(g);
        disposeGroup(g);
    }
    console.log(`      ↳ ${CASES.length} Fälle gebaut in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

    // 2) Determinismus: Stichproben-Fälle bauen doppelt byte-gleich (jede Stufe vertreten).
    let determin = true;
    for (const c of [
        { rezeptId: "alemannisch", seed: 7, lod: 0 },
        { rezeptId: "tudor", seed: 12345, lod: 1 },
        { rezeptId: "hochhaus", seed: 7, lod: 2 },
        { rezeptId: "marokkanisch", seed: 7, lod: 2 },
    ]) {
        const g2 = buildCase(c);
        if (fingerprint(g2).sha256 !== actual[caseKey(c)].sha256) determin = false;
        disposeGroup(g2);
    }
    check("Determinismus: Stichproben-Fälle (alle 3 Stufen) bauen doppelt byte-gleich", determin);

    // 3) SEED-GETRIEBEN (cv:6-Semantik — s. Kopf): der Fachwerk-Bau variiert mit dem Samen.
    check(
        "Seed-GETRIEBEN: alemannisch seed 7 != seed 12345 (L0 — Fenstertakt/Verband/Gauben aus P.seed)",
        actual["alemannisch-s7-L0"].sha256 !== actual["alemannisch-s12345-L0"].sha256
    );
    check(
        "Seed-GETRIEBEN: tudor seed 7 != seed 12345 (L1 — zusätzlich FENSTER-SCHLAF)",
        actual["tudor-s7-L1"].sha256 !== actual["tudor-s12345-L1"].sha256
    );

    // 4) Die Stufen sind ECHT verschieden (keine kollabierte Mehr-Stufen-Deklaration).
    let stufenEcht = true;
    for (const k of ["alemannisch", "hanseatisch", "japanisch"]) {
        if (
            actual[`${k}-s7-L0`].sha256 === actual[`${k}-s7-L1`].sha256 ||
            actual[`${k}-s7-L1`].sha256 === actual[`${k}-s7-L2`].sha256
        )
            stufenEcht = false;
    }
    check("Stufen-Wahrheit: L0 != L1 != L2 je Stichproben-Kultur (Voll · Hülle · Destillat)", stufenEcht);

    // 5) ov-Kanal wirkt (Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Parameter-Override ändert den Bau (alemannisch != alemannisch+storeys/turm)",
        actual["alemannisch-s7-L0"].sha256 !== actual["alemannisch-s7-L0-ov_storeys_turm"].sha256
    );
    check(
        "ov-Kanal: auch am Destillat (hochhaus L2 != hochhaus L2+W)",
        actual["hochhaus-s7-L2"].sha256 !== actual["hochhaus-s7-L2-ov_W"].sha256
    );

    // 6) lod-Klemme: die Wahl faltet auf die deklarierten Stufen (Flatten-Semantik).
    const l9 = buildCase({ rezeptId: "alemannisch", seed: 7, lod: 9 });
    const f9 = fingerprint(l9);
    disposeGroup(l9);
    const lm = buildCase({ rezeptId: "alemannisch", seed: 7, lod: -1 });
    const fm = fingerprint(lm);
    disposeGroup(lm);
    check("lod-Klemme: buildInstance(…, lod 9) == Stufe 2 (größte deklarierte ≤ Wahl)", f9.sha256 === actual["alemannisch-s7-L2"].sha256);
    check("lod-Klemme: buildInstance(…, lod −1) == Stufe 0 (fail-closed auf die kleinste)", fm.sha256 === actual["alemannisch-s7-L0"].sha256);

    // 7) SPLIT-PARITÄT: der Vertrags-Pfad == der Lab-Pfad (Kern-Primitive, frische Kultur-Ableitung).
    const PARITY = ["alemannisch", "hochhaus", "hanseatisch", "japanisch", "marokkanisch", "holzhuette"];
    let parity = 0;
    let parityN = 0;
    for (const k of PARITY) {
        for (const L of LODS) {
            parityN++;
            const g = shellPfad(k, 7, L);
            const fp = fingerprint(g);
            disposeGroup(g);
            if (fp.sha256 === actual[`${k}-s7-L${L}`].sha256) parity++;
        }
    }
    check(
        `Split-Parität: buildInstance == Shell-Komposition der Kern-Primitive (${parity}/${parityN} Rezept×Stufe)`,
        parity === parityN
    );

    // 8) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    if (!fs.existsSync(goldenFile) || process.env.MINT_FORCE === "1") {
        fs.mkdirSync(goldenDir, { recursive: true });
        fs.writeFileSync(
            goldenFile,
            JSON.stringify(
                { cv: 6, minted: "buildInstance(rezeptId, seed, lod, ov?) — sha256 je Fall", cases: actual },
                null,
                2
            ) + "\n"
        );
        console.log(
            `  🧊 GOLDEN GEMINTET (${Object.keys(actual).length} Fälle) → ${path.relative(root, goldenFile)} — ab jetzt EINGEFROREN`
        );
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    check("Golden trägt cv:6 + alle Fälle", golden.cv === 6 && Object.keys(golden.cases).length === CASES.length);
    const diffs = compare(golden, actual);
    check(`Goldens byte-exakt (${Object.keys(golden.cases).length} Fälle)`, diffs.length === 0, diffs[0] || "");
    for (let i = 1; i < diffs.length; i++) console.log(`      ↳ ${diffs[i]}`);

    // 9) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
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
        "\n✅ GRÜN — der Haus-Asset-Vertrag steht: buildInstance ist deterministisch + SEED-GETRIEBEN (cv:6), die drei deklarierten Stufen bauen echt verschieden, der ov-Kanal wirkt, die lod-Klemme hält, die Split-Parität buildInstance==Lab-Komposition steht je Rezept×Stufe, die Goldens sind byte-exakt, der Selbst-Test beweist die Linse feuert."
    );
    process.exit(0);
})();
