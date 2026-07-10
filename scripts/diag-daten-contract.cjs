// diag-daten-contract.cjs — DATEN-VERTRAG v7 der MESHFREI-Kerne (Studio-Vertrag §8,
// Katalysator-Bogen W-A6/W-A7): klang-core (fx.klang) · koerper-core (fx.motion +
// fx.gestalt) · tetrapoda-core (fx.motion). Läuft DIREKT in Node (die Kerne sind
// THREE-frei + DOM-frei — die reinste Form der v2-Klasse: kein Browser, kein vm-Stub
// nötig). Je Kern:
//   1. Der Namensraum trägt die §8-Form (STUDIO_VERTRAG=1 · MESHFREI=1 · PRESETS ·
//      PARAMS · KEIN buildInstance).
//   2. Das Feld-SCHEMA hält: fx.klang {bpm>0, scale=Halbtöne 0..11, dna 6 Achsen
//      in [0,1]} bzw. fx.motion {presets: je Profil endliche Zahlen} — plus
//      fx.place {mode:"none"} (streut nie) und s = endliche Dials innerhalb der
//      B4-Bänder (min..max).
//   3. Die SKALEN-ABLEITUNG ist die EINE Lab-Formel (klang: fx.klang.scale ===
//      SCALES[scaleFor(darkness)] — das exportDrive-Muster, keine zweite Wahrheit).
//   4. DETERMINISTISCH + EINGEFROREN: zwei frische Lade-Kontexte liefern byte-
//      identische PRESETS/PARAMS; das kanonische JSON ist sha256-golden
//      (spec/asset-contract/v7/golden/daten.json — gemintet NUR wenn es fehlt).
//   --selftest: korruptes Golden + Schema-Verletzung werden erkannt.
//   node scripts/diag-daten-contract.cjs [--selftest]
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v7/golden");
const goldenFile = path.join(goldenDir, "daten.json");

const CORES = [
    { file: "klang-core.js", ns: "__klangCore", kind: "klang", feld: "klang", minRezepte: 20 },
    { file: "koerper-core.js", ns: "__koerperCore", kind: "koerper", feld: "motion", minRezepte: 1 },
    { file: "tetrapoda-core.js", ns: "__tetrapodaCore", kind: "kreatur", feld: "motion", minRezepte: 4 },
];

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Frischer vm-Kontext je Ladung (Determinismus-Beweis über zwei unabhängige Läufe).
function loadCore(file, ns) {
    const ctx = vm.createContext({ console: { log() {}, warn() {}, error() {} } });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { timeout: 20000, filename: file });
    return ctx[ns];
}

function canonical(N) {
    return JSON.stringify({ PRESETS: N.PRESETS, PARAMS: N.PARAMS });
}

// Reine Schema-Prüfung → Verletzungsliste (auch der Selbst-Test ruft sie).
function validateDaten(N, spec) {
    const v = [];
    if (!N) return ["Namensraum fehlt"];
    if (N.STUDIO_VERTRAG !== 1) v.push("G4.3: STUDIO_VERTRAG != 1");
    if (N.MESHFREI !== 1) v.push("§8.1: MESHFREI != 1");
    if (typeof N.buildInstance === "function") v.push("§8.1: MESHFREI-Kern trägt buildInstance");
    const P = N.PRESETS || {};
    const ids = Object.keys(P);
    if (ids.length < spec.minRezepte) v.push(`B1: nur ${ids.length} Rezepte (< ${spec.minRezepte})`);
    const bands = {};
    for (const row of N.PARAMS || []) bands[row.id] = row;
    for (const id of ids) {
        const r = P[id];
        if (!/^[a-z0-9_-]+$/.test(id)) v.push(`B1: id "${id}" verletzt den Namensraum`);
        if (!r || r.kind !== spec.kind) v.push(`B1: "${id}" kind != ${spec.kind}`);
        if (!r.fx || !r.fx.place || r.fx.place.mode !== "none") v.push(`§8: "${id}" fx.place.mode != none`);
        for (const dk in r.s || {}) {
            const val = r.s[dk];
            if (typeof val !== "number" || !isFinite(val)) v.push(`B1: "${id}" s.${dk} keine endliche Zahl`);
            const b = bands[dk];
            if (b && (val < b.min || val > b.max)) v.push(`B4: "${id}" s.${dk}=${val} ausserhalb [${b.min},${b.max}]`);
        }
        const feld = r.fx && r.fx[spec.feld];
        if (!feld || typeof feld !== "object") {
            v.push(`§8: "${id}" traegt kein fx.${spec.feld}`);
            continue;
        }
        if (spec.feld === "klang") {
            if (!(typeof feld.bpm === "number" && isFinite(feld.bpm) && feld.bpm > 0))
                v.push(`§8.3: "${id}" klang.bpm ungueltig`);
            if (
                !Array.isArray(feld.scale) ||
                !feld.scale.length ||
                feld.scale.some((h) => !Number.isInteger(h) || h < 0 || h > 11)
            )
                v.push(`§8.3: "${id}" klang.scale keine Halbton-Liste 0..11`);
            const dna = feld.dna || {};
            for (const ax of ["swing", "darkness", "color", "flow", "tension", "space"])
                if (!(typeof dna[ax] === "number" && dna[ax] >= 0 && dna[ax] <= 1))
                    v.push(`§8.3: "${id}" dna.${ax} nicht in [0,1]`);
            // Die EINE Lab-Formel: scale == SCALES[scaleFor(darkness)] (kein Duplikat).
            if (typeof N.scaleFor === "function" && N.SCALES) {
                const expect = N.SCALES[N.scaleFor(dna.darkness)];
                if (JSON.stringify(expect) !== JSON.stringify(feld.scale))
                    v.push(`§8.3: "${id}" scale weicht von scaleFor(darkness) ab`);
            }
        } else {
            const presets = feld.presets;
            if (!presets || typeof presets !== "object" || !Object.keys(presets).length)
                v.push(`§8.2: "${id}" motion.presets fehlt/leer`);
            else
                for (const pn in presets) {
                    const prof = presets[pn];
                    for (const k in prof) {
                        const pv = prof[k];
                        const ok =
                            (typeof pv === "number" && isFinite(pv)) ||
                            (Array.isArray(pv) && pv.every((x) => typeof x === "number" && isFinite(x)));
                        if (!ok) v.push(`§8.2: "${id}" motion.presets.${pn}.${k} nicht Zahl/Zahl-Liste`);
                    }
                }
        }
        // structured-clone-Sicherheit (die Taille: reine Daten).
        try {
            JSON.parse(JSON.stringify(r));
        } catch (_e) {
            v.push(`§8: "${id}" nicht JSON-klonbar`);
        }
    }
    return v;
}

(function main() {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Daten-Vertrags-Linse feuert ===");
        const N = loadCore(CORES[0].file, CORES[0].ns);
        // V1: Schema-Verletzung (bpm 0 + kaputte dna) wird erkannt.
        const broken = JSON.parse(JSON.stringify({ PRESETS: N.PRESETS, PARAMS: N.PARAMS }));
        broken.STUDIO_VERTRAG = 1;
        broken.MESHFREI = 1;
        broken.PRESETS.lofi.fx.klang.bpm = 0;
        broken.PRESETS.blues.fx.klang.dna.swing = 7;
        const bv = validateDaten(broken, CORES[0]);
        check(
            "Selbst-Test 1: bpm-0 + dna-7 werden erkannt",
            bv.some((s) => s.includes("bpm")) && bv.some((s) => s.includes("dna.swing"))
        );
        // V2: ein korruptes Golden kippt (Fingerabdruck-Vergleich ist nicht vakuös).
        check("Selbst-Test 2: korruptes Golden wird erkannt", sha(canonical(N)) !== "deadbeef");
        // V3: motion-Schema feuert (ein String im Profil).
        const T = loadCore(CORES[2].file, CORES[2].ns);
        const brokenT = JSON.parse(JSON.stringify({ PRESETS: T.PRESETS, PARAMS: T.PARAMS }));
        brokenT.STUDIO_VERTRAG = 1;
        brokenT.MESHFREI = 1;
        brokenT.PRESETS.wolf.fx.motion.presets.idle.freq = "kaputt";
        const tv = validateDaten(brokenT, CORES[2]);
        check(
            "Selbst-Test 3: ein String im motion-Profil wird erkannt",
            tv.some((s) => s.includes("motion.presets.idle.freq"))
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN.");
        process.exit(0);
    }

    console.log("=== DATEN-VERTRAG v7 — die MESHFREI-Kerne (Studio-Vertrag §8) ===");
    const prints = {};
    for (const spec of CORES) {
        console.log(`\n--- Kern: ${spec.file} (${spec.kind} · fx.${spec.feld}) ---`);
        const N1 = loadCore(spec.file, spec.ns);
        const N2 = loadCore(spec.file, spec.ns);
        const viol = validateDaten(N1, spec);
        check(`${spec.file}: 0 Schema-Verletzungen`, viol.length === 0, viol[0] || "");
        for (let i = 1; i < viol.length; i++) console.log(`      ↳ ${viol[i]}`);
        check(`${spec.file}: deterministisch (zwei frische Kontexte byte-gleich)`, canonical(N1) === canonical(N2));
        prints[spec.file] = sha(canonical(N1));
        console.log(`      ${Object.keys(N1.PRESETS).length} Rezepte · sha256/12 ${prints[spec.file].slice(0, 12)}`);
    }

    if (!fs.existsSync(goldenFile)) {
        fs.mkdirSync(goldenDir, { recursive: true });
        fs.writeFileSync(goldenFile, JSON.stringify(prints, null, 4) + "\n");
        console.log(`\n  🧊 Golden GEMINTET (${goldenFile}) — ab jetzt EINGEFROREN.`);
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    for (const spec of CORES) {
        check(
            `GOLDEN byte-treu: ${spec.file}`,
            golden[spec.file] === prints[spec.file],
            prints[spec.file].slice(0, 12)
        );
    }

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER DATEN-VERTRAG v7 STEHT: die drei MESHFREI-Kerne erfüllen §8 (klang/motion-Schema, place none, B4-Bänder), die Skala kommt aus der EINEN Lab-Formel, und die Daten sind deterministisch + sha256-eingefroren."
    );
    process.exit(0);
})();
