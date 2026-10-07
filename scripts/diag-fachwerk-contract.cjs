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
// DIE AUSSTATTUNG (Architektur-Welle 05.10.): Feuerstelle · Marktstand · Brunnen — dasselbe Gesetzbuch, eigene Goldens.
const goldenAusFile = path.join(goldenDir, "ausstattung.json");

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
const KULTUREN = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "haus"); // alle 32 Kultur-Archetypen
// Die Ausstattung: jedes Rezept × jede Gestalt der Welt (Samen 1..V) × jede Stufe, dazu ein ov-Fall.
const AUS = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "ausstattung");
const AUS_LODS = FC.PORTAL_RENDER_CONFIG.lod.kindStages.ausstattung || [];
const AUS_CASES = [];
for (const k of AUS)
    for (let s = 1; s <= FC.PORTAL_RENDER_CONFIG.lod.budget.gestalten[k]; s++)
        for (const l of AUS_LODS) AUS_CASES.push({ rezeptId: k, seed: s, lod: l });
AUS_CASES.push({ rezeptId: "feuerstelle", seed: 1, lod: 0, ov: { fuelle: 0.2 } });
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
    // gegen das Ist selbst (S1 Wände): der Selbst-Test misst auch auf einem roten Stand, was er misst
    const tampered = JSON.parse(JSON.stringify({ cases: actual }));
    const k0 = Object.keys(tampered.cases)[0];
    tampered.cases[k0].sha256 = tampered.cases[k0].sha256.replace(
        /^./,
        tampered.cases[k0].sha256[0] === "0" ? "1" : "0"
    );
    const t1 = compare(tampered, actual);
    const actual2 = JSON.parse(JSON.stringify(actual));
    actual2[k0].objects += 1;
    const t2 = compare({ cases: actual }, actual2);
    check(
        "SELBST-TEST: korruptes Golden (sha256) wird erkannt",
        t1.some((s) => s.includes("sha256"))
    );
    check(
        "SELBST-TEST: objects-Drift wird erkannt",
        t2.some((s) => s.includes("objects"))
    );

    // 9b) DAS FARB-GESETZ DER HÄUSER (Architektur-Welle 05.10.) — die Linse der Täter-Klasse „Hex roh als linear": bis
    //     05.10. legte der Bake (`_colFor`) das Paletten-Hex roh in den Vertex, die Welt las es linear — Putz 0,82, Holz
    //     0,30, ganze Häuser 0,35–0,57 (das weiße Haus mit blassem Fachwerk). Gemessen wird, was die Welt liest: je Kultur
    //     (alle 32, Stufe 1 — die Flächen-Stufe, die das Auge am längsten sieht) die flächengewichtete lineare Albedo der
    //     Vertex-Farbe × Stoff-Farbe, je Rolle und gesamt, gegen das Band der Natur (diag-albedo-zensus): Holz-Klasse
    //     (holz · stamm · blockholz · lattung · boden) ≤ 0,25 · Kalk und Lehm (putz · gefach · lehm) ≤ 0,85 · jeder andere
    //     Stoff ≤ 0,45 · das ganze Haus ≤ 0,50. SELBST-TEST: dieselben Häuser mit roh gelesener Farbe (linear → sRGB
    //     zurück) MÜSSEN rot werden.
    {
        console.log("\n=== DAS FARB-GESETZ DER HÄUSER — die Albedo, die die Welt liest ===");
        const rolleVon = (m) => {
            for (const k in FC._MM) if (FC._MM[k] === m) return k;
            return null;
        };
        const HOLZ = new Set(["holz", "stamm", "blockholz", "lattung", "boden"]);
        const KALK = new Set(["putz", "gefach", "lehm"]);
        const decke = (r) => (HOLZ.has(r) ? 0.25 : KALK.has(r) ? 0.85 : 0.45);
        const roh = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
        // je Haus: { gesamt, rollen: { rolle: Y } } — `farbe` liest die Vertex-Farbe (die Welt) oder ihr Roh-Zwilling (vorher)
        const albedoHaus = (g, farbe) => {
            const proRolle = {};
            let A = 0,
                Y = 0;
            g.traverse((o) => {
                if (!o.isMesh || !o.geometry.attributes.color) return;
                const seh = o.material.userData && o.material.userData.__seh;
                if (seh === "glas" || seh === "glut") return; // Glas spiegelt, Glut leuchtet — keine Albedo des Stoffs
                const r = rolleVon(o.material) || "?";
                const P = o.geometry.attributes.position.array,
                    C = o.geometry.attributes.color.array,
                    I = o.geometry.index ? o.geometry.index.array : null,
                    mc = o.material.color;
                const n = I ? I.length : P.length / 3;
                let a = 0,
                    y = 0;
                for (let i = 0; i < n; i += 3) {
                    const q = I ? [I[i], I[i + 1], I[i + 2]] : [i, i + 1, i + 2];
                    const [p0, p1, p2] = q.map((v) => v * 3);
                    const ux = P[p1] - P[p0],
                        uy = P[p1 + 1] - P[p0 + 1],
                        uz = P[p1 + 2] - P[p0 + 2],
                        vx = P[p2] - P[p0],
                        vy = P[p2 + 1] - P[p0 + 1],
                        vz = P[p2 + 2] - P[p0 + 2];
                    const ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
                    let l = 0;
                    for (const v of q)
                        l +=
                            (0.2126 * farbe(C[v * 3]) * mc.r +
                                0.7152 * farbe(C[v * 3 + 1]) * mc.g +
                                0.0722 * farbe(C[v * 3 + 2]) * mc.b) /
                            3;
                    a += ar;
                    y += ar * l;
                }
                if (!(a > 0)) return;
                const e = proRolle[r] || (proRolle[r] = { a: 0, y: 0 });
                e.a += a;
                e.y += y;
                A += a;
                Y += y;
            });
            const rollen = {};
            for (const r in proRolle) rollen[r] = proRolle[r].y / proRolle[r].a;
            return { gesamt: A > 0 ? Y / A : 0, rollen };
        };
        const urteil = (mess) => {
            const bruch = [];
            for (const [k, m] of mess) {
                if (m.gesamt > 0.5) bruch.push(`${k} gesamt ${m.gesamt.toFixed(3)} > 0,50`);
                for (const r in m.rollen)
                    if (m.rollen[r] > decke(r)) bruch.push(`${k} ${r} ${m.rollen[r].toFixed(3)} > ${decke(r)}`);
            }
            return bruch;
        };
        const welt = [],
            vorher = [];
        const maxRolle = {};
        for (const k of KULTUREN) {
            const g = FC.buildInstance(k, 7, 1);
            const m = albedoHaus(g, (c) => c);
            welt.push([k, m]);
            vorher.push([k, albedoHaus(g, roh)]);
            for (const r in m.rollen) if (!maxRolle[r] || m.rollen[r] > maxRolle[r][0]) maxRolle[r] = [m.rollen[r], k];
            disposeGroup(g);
        }
        const gesamt = welt.map(([, m]) => m.gesamt);
        const bruch = urteil(welt);
        check(
            `Albedo der Häuser im Band der Natur (${KULTUREN.length} Kulturen, L1): gesamt ${Math.min(...gesamt).toFixed(2)}–${Math.max(...gesamt).toFixed(2)} · ` +
                ["holz", "putz", "ziegel", "backstein", "stein"]
                    .filter((r) => maxRolle[r])
                    .map((r) => `${r} ≤ ${maxRolle[r][0].toFixed(2)}`)
                    .join(" · "),
            bruch.length === 0,
            bruch.slice(0, 3).join(" | ")
        );
        const bruchRoh = urteil(vorher);
        check(
            `SELBST-TEST: roh gelesene Farbe (der Bake vor dem FARB-GESETZ) wird rot (${bruchRoh.length} Brüche)`,
            bruchRoh.length > 0,
            bruchRoh.length > 0 ? "" : "die Linse misst nichts"
        );
    }

    // 10) DIE AUSSTATTUNG (Architektur-Welle 05.10.) — die Linse der Täter-Klasse „Host-Part-Look": was der Wirt aus
    //     eigenen Teilen baute (Glut-Zylinder, Brett-Tisch, Brunnen-Zylinder), baut jetzt das Gesetzbuch. Die Gestalt hält:
    //     Stufen echt verschieden UND deckungsgleich (L1 ersetzt L0 ohne Sprung: Hülle ± 8 cm), Boden-Anschluss (jedes
    //     Stück taucht unter y = 0), die Glut leuchtet und wirft nie, jede Zahl auf dem Raster 2^-12 (plattformgleich:
    //     V8 rundet sin/cos auf Linux und Windows verschieden — das Raster macht die Bytes gleich), Determinismus, Goldens.
    console.log("\n=== DIE AUSSTATTUNG — Feuerstelle · Marktstand · Brunnen (dasselbe Gesetzbuch) ===");
    check(
        `drei Ausstattungs-Rezepte (kind ausstattung) mit Stufen [0,1] und Gestalten (${AUS.join(", ")})`,
        AUS.length === 3 && JSON.stringify(AUS_LODS) === "[0,1]" && AUS_CASES.length >= 12
    );
    const ausIst = {};
    const huelle = {};
    let glutOk = true,
        glutDa = false,
        bodenOk = true,
        rasterOk = true,
        rasterBeispiel = "",
        albedoOk = true,
        albedoBeispiel = "";
    const albedo = {};
    for (const c of AUS_CASES) {
        const g = buildCase(c);
        ausIst[caseKey(c)] = fingerprint(g);
        const bb = new THREE.Box3().setFromObject(g);
        huelle[caseKey(c)] = bb;
        if (!(bb.min.y < -0.02)) bodenOk = false;
        g.traverse((o) => {
            if (!o.isMesh) return;
            const em = o.material && o.material.emissive;
            // DIE ALBEDO-LINSE (kartenlos trägt der Vertex): je Stoff die mittlere Luminanz der Vertex-Farbe × Stoff-Farbe —
            // ein Stoff im Band der Natur (0,08–0,45: Holz, Stein, Tuch, Asche nach Kontakt-AO und Erdsaum — schwarz und Creme sind rot), die Glut dunkel
            // (≤ 0,30 — sie leuchtet durch ihren Stoff, eine helle Glut bleicht in der Sonne zu Creme). Glas misst nicht.
            const seh = o.material.userData && o.material.userData.__seh;
            const col = o.geometry.attributes.color;
            if (col && seh !== "glas") {
                const mc = o.material.color;
                let s = 0;
                for (let i = 0; i < col.count; i++)
                    s += 0.2126 * col.array[i * 3] * mc.r + 0.7152 * col.array[i * 3 + 1] * mc.g + 0.0722 * col.array[i * 3 + 2] * mc.b;
                const Y = s / col.count;
                const k = `${c.rezeptId}:${seh}`;
                albedo[k] = Math.max(albedo[k] || 0, Y);
                const ok = seh === "glut" ? Y <= 0.3 : Y >= 0.08 && Y <= 0.45;
                if (!ok) {
                    albedoOk = false;
                    albedoBeispiel = albedoBeispiel || `${caseKey(c)} ${seh}: Y ${Y.toFixed(3)}`;
                }
            }
            if (em && em.getHex() !== 0) {
                if (c.rezeptId === "feuerstelle") glutDa = true;
                if (o.castShadow !== false || (o.material.userData && o.material.userData.__seh) !== "glut") glutOk = false;
            }
            for (const name of Object.keys(o.geometry.attributes)) {
                const q = name === "normal" ? 16384 : 4096;
                const arr = o.geometry.attributes[name].array;
                for (let i = 0; i < arr.length; i++)
                    if (arr[i] * q !== Math.round(arr[i] * q) || Object.is(arr[i], -0)) {
                        rasterOk = false;
                        rasterBeispiel = rasterBeispiel || `${caseKey(c)} ${name}[${i}] = ${arr[i]}`;
                        break;
                    }
            }
        });
        disposeGroup(g);
    }
    let stufenAus = true,
        deckung = true,
        deckBeispiel = "";
    for (const k of AUS)
        for (let s = 1; s <= FC.PORTAL_RENDER_CONFIG.lod.budget.gestalten[k]; s++) {
            const a = `${k}-s${s}-L0`,
                b = `${k}-s${s}-L1`;
            if (ausIst[a].sha256 === ausIst[b].sha256) stufenAus = false;
            const A = huelle[a],
                B = huelle[b];
            const d = Math.max(
                Math.abs(A.min.x - B.min.x),
                Math.abs(A.max.x - B.max.x),
                Math.abs(A.max.y - B.max.y),
                Math.abs(A.min.z - B.min.z),
                Math.abs(A.max.z - B.max.z)
            );
            if (d > 0.08) {
                deckung = false;
                deckBeispiel = deckBeispiel || `${k} s${s}: L0↔L1 Hülle ${d.toFixed(3)} m`;
            }
        }
    check("Stufen-Wahrheit: L0 != L1 je Rezept × Gestalt (nah fein · mittel grob)", stufenAus);
    check("Deckungsgleich: die L1-Hülle liegt auf der L0-Hülle (± 8 cm — kein Sprung beim Stufen-Wechsel)", deckung, deckBeispiel);
    check("Boden-Anschluss: jedes Stück taucht unter y = 0 (Steine, Pfosten, Kranz im Boden — kein Schweben am Hang)", bodenOk);
    check("Die Glut leuchtet und wirft nie (emissive ⇒ Seh-Klasse glut, castShadow false; die Feuerstelle trägt sie)", glutOk && glutDa);
    check(
        `Albedo im Band (kartenlos, je Stoff: Stoff 0,08–0,45 · Glut ≤ 0,30) — ${Object.entries(albedo)
            .map(([k, v]) => k + " " + v.toFixed(2))
            .join(" · ")}`,
        albedoOk,
        albedoBeispiel
    );
    check("Plattformgleich: jede Zahl auf dem Raster 2^-12 (Normalen 2^-14), kein −0", rasterOk, rasterBeispiel);
    {
        const g1 = buildCase(AUS_CASES[0]),
            g2 = buildCase(AUS_CASES[0]);
        check("Determinismus: die Ausstattung baut doppelt byte-gleich", fingerprint(g1).sha256 === fingerprint(g2).sha256);
        disposeGroup(g1);
        disposeGroup(g2);
    }
    check(
        "ov-Kanal der Ausstattung: fuelle 0,2 baut eine andere Feuerstelle (weniger Scheite, kleinere Flamme)",
        ausIst["feuerstelle-s1-L0"].sha256 !== ausIst["feuerstelle-s1-L0-ov_fuelle"].sha256
    );
    if (!fs.existsSync(goldenAusFile) || process.env.MINT_FORCE === "1") {
        fs.writeFileSync(
            goldenAusFile,
            JSON.stringify(
                {
                    cv: 6,
                    minted: "buildInstance(ausstattung, seed, lod, ov?) — sha256 je Fall (Architektur-Welle 05.10.)",
                    cases: ausIst,
                },
                null,
                2
            ) + "\n"
        );
        console.log(`  🧊 GOLDEN GEMINTET (${Object.keys(ausIst).length} Fälle) → ${path.relative(root, goldenAusFile)}`);
    }
    const goldenAus = JSON.parse(fs.readFileSync(goldenAusFile, "utf8"));
    const diffsAus = compare(goldenAus, ausIst);
    check(
        `Ausstattungs-Goldens byte-exakt (${Object.keys(goldenAus.cases).length} Fälle)`,
        diffsAus.length === 0 && Object.keys(goldenAus.cases).length === AUS_CASES.length,
        diffsAus[0] || ""
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
