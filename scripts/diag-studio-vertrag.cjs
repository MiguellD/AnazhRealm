// diag-studio-vertrag.cjs — DER MANIFEST-VALIDATOR (docs/studio-vertrag.md).
// Die USD-/Schema-Lehre: ein Kern, der den Vertrag verletzt, wird ROT beim
// Andocken — nicht stumm kaputt in der Welt. Statisch + vm (kein Browser, im
// `check`-Gate): jeder registrierte Studio-Kern wird in einem Node-vm-Kontext
// mit THREE-Proxy-Stub geladen (nur die Top-Level-Manifest-Blöcke werden
// ausgeführt, kein Render) und GEGEN den Vertrag validiert:
//   §3 B1 REZEPTE (MUSS): PRESETS-Objekt · jede rezeptId im Namensraum
//       [a-z0-9_-]+ · jedes Rezept trägt kind (string)
//   §3 B2 BUILD (MUSS): buildInstance ist eine Funktion (der Byte-Beweis der
//       Determinismus lebt separat in den frozen Goldens, gate:asset-contract)
//   §3 B3 PLACEMENT (SOLL, wenn vorhanden): scale-Werte > 0 · rarity ∈ (0,1]
//   §3 B4 PARAMS (SOLL, wenn vorhanden): id/lab/min/max/step · min < max
//   §3 B5 LEHREN (SOLL, wenn vorhanden): id + pass-Band [lo,hi]
//   §4 G4.1 must-ignore: der EINE Auto-Register-Chokepoint in anazhRealm.js
//       überspringt unbekannte kinds (continue-Filter), wirft nie
//   §4 G4.3 Version: der Kern deklariert STUDIO_VERTRAG = 1
//   + SELBST-TEST: eine injizierte Verletzung (Rezept ohne kind) wird erkannt
//     — das Gate ist nicht vakuös.
// Eine neue Domäne (vehicle-core/porta-core) trägt sich in CORES ein und wird
// automatisch mitvalidiert (§5 Andock-Sequenz Schritt 5).
//   node scripts/diag-studio-vertrag.cjs
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Die registrierten Studio-Kerne (wächst pro Domäne — §5 Schritt 5).
// `ns` = Namensraum-Kern (Vertrag v1.1 §7, Entscheid E-A): der ZWEIT-Kern einer
// Laufzeit trägt seine Manifest-Blöcke namensgleich unter EINEM Objekt
// (z. B. __vehicleCore.PRESETS) statt top-level — löst die const-Kollision mit
// foundry-core (STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS) ohne dessen Edit.
const CORES = [
    { file: "foundry-core.js", deps: ["phyto-core.js"] },
    { file: "vehicle-core.js", ns: "__vehicleCore" },
];

const REZEPT_ID = /^[a-z0-9_-]+$/;
// Registrierte + reservierte kinds (§3 B1). Ein UNBEKANNTER kind ist KEIN
// Fehler (must-ignore G4.1) — er wird hier nur informativ gelistet.
const KNOWN_KINDS = ["tree", "shrub", "flower", "grass", "rock", "vehicle", "gate", "building", "creature"];

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// Ein absorbierender Proxy: frisst jeden Konstruktor/jede Methode der
// Top-Level-Ausführung (THREE etc.) — nur die DATEN-Blöcke interessieren.
function absorber() {
    const a = new Proxy(function () {}, {
        get: () => a,
        apply: () => a,
        construct: () => a,
    });
    return a;
}

function loadCore(entry) {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    let code = "";
    for (const dep of entry.deps || []) code += fs.readFileSync(path.join(root, dep), "utf8") + "\n;";
    code += fs.readFileSync(path.join(root, entry.file), "utf8");
    if (entry.ns) {
        // v1.1-Namensraum-Kern: dieselben Block-Namen, gelesen unter entry.ns
        // (fehlt der Namensraum ganz, bleibt alles null → B1/B2/G4.3 werden rot).
        code +=
            "\n;__manifest = (function(){" +
            ` var N = typeof ${entry.ns} !== 'undefined' && ${entry.ns} ? ${entry.ns} : {};` +
            " return {" +
            " vertrag: 'STUDIO_VERTRAG' in N ? N.STUDIO_VERTRAG : null," +
            " presets: N.PRESETS || null," +
            " build: N.buildInstance || null," +
            " cfg: N.PORTAL_RENDER_CONFIG || null," +
            " params: N.PARAMS || null," +
            " lehren: N.LEHREN || null }; })();";
    } else {
        code +=
            "\n;__manifest = {" +
            " vertrag: typeof STUDIO_VERTRAG !== 'undefined' ? STUDIO_VERTRAG : null," +
            " presets: typeof PRESETS !== 'undefined' ? PRESETS : null," +
            " build: typeof buildInstance !== 'undefined' ? buildInstance : null," +
            " cfg: typeof PORTAL_RENDER_CONFIG !== 'undefined' ? PORTAL_RENDER_CONFIG : null," +
            " params: typeof PARAMS !== 'undefined' ? PARAMS : null," +
            " lehren: typeof LEHREN !== 'undefined' ? LEHREN : null };";
    }
    vm.runInContext(code, ctx, { timeout: 30000, filename: entry.file });
    return ctx.__manifest;
}

// Reine Validierungs-Funktion (auch der Selbst-Test ruft sie) → Verletzungsliste.
function validateManifest(m) {
    const v = [];
    if (m.vertrag !== 1) v.push(`G4.3: STUDIO_VERTRAG fehlt oder != 1 (ist: ${m.vertrag})`);
    if (!m.presets || typeof m.presets !== "object" || Object.keys(m.presets).length < 1)
        v.push("B1: PRESETS fehlt oder leer");
    else {
        for (const id in m.presets) {
            const r = m.presets[id];
            if (!REZEPT_ID.test(id)) v.push(`B1: rezeptId "${id}" verletzt den Namensraum [a-z0-9_-]+`);
            if (!r || typeof r.kind !== "string" || !r.kind) v.push(`B1: Rezept "${id}" trägt kein kind`);
            if (r && r.s && typeof r.s === "object")
                for (const dk in r.s)
                    if (typeof r.s[dk] !== "number" || !isFinite(r.s[dk]))
                        v.push(`B1: Rezept "${id}" Dial s.${dk} ist keine endliche Zahl`);
        }
    }
    if (typeof m.build !== "function") v.push("B2: buildInstance fehlt (keine Funktion)");
    // B2 (LOD-WURZEL 08.07.) — kindStages: die Stufen-Wahrheit je Art als Daten (SOLL, wenn
    // vorhanden): nicht-leere, aufsteigende Arrays aus Stufen 0..2.
    const lodC = m.cfg && m.cfg.lod;
    if (lodC && lodC.kindStages) {
        for (const k in lodC.kindStages) {
            const s = lodC.kindStages[k];
            if (!Array.isArray(s) || !s.length || s.some((x) => !Number.isInteger(x) || x < 0 || x > 2)) {
                v.push(`B2: lod.kindStages.${k} muss ein nicht-leeres Array aus Stufen 0..2 sein`);
            } else {
                for (let i = 1; i < s.length; i++)
                    if (s[i] <= s[i - 1]) v.push(`B2: lod.kindStages.${k} muss strikt aufsteigend sein`);
            }
        }
    }
    const pl = m.cfg && m.cfg.placement;
    if (pl) {
        if (pl.scale)
            for (const k in pl.scale)
                if (!(typeof pl.scale[k] === "number" && pl.scale[k] > 0))
                    v.push(`B3: placement.scale.${k} muss Zahl > 0 sein`);
        if (pl.rarity)
            for (const k in pl.rarity)
                if (!(typeof pl.rarity[k] === "number" && pl.rarity[k] > 0 && pl.rarity[k] <= 1))
                    v.push(`B3: placement.rarity.${k} muss in (0,1] liegen`);
    }
    if (m.params) {
        if (!Array.isArray(m.params)) v.push("B4: PARAMS ist kein Array");
        else
            for (const p of m.params) {
                if (!p || typeof p.id !== "string" || typeof p.lab !== "string")
                    v.push("B4: PARAMS-Eintrag ohne id/lab");
                else if (!(typeof p.min === "number" && typeof p.max === "number" && p.min < p.max))
                    v.push(`B4: PARAMS "${p.id}" min/max ungültig`);
            }
    }
    if (m.lehren) {
        if (!Array.isArray(m.lehren)) v.push("B5: LEHREN ist kein Array");
        else
            for (const l of m.lehren) {
                if (!l || typeof l.id !== "string") v.push("B5: LEHREN-Eintrag ohne id");
                else if (!(Array.isArray(l.pass) && l.pass.length === 2 && l.pass[0] < l.pass[1]))
                    v.push(`B5: Lehre "${l.id}" pass-Band [lo,hi] ungültig`);
            }
    }
    return v;
}

(function main() {
    console.log("=== DER STUDIO-VERTRAG — Manifest-Validator (docs/studio-vertrag.md) ===");

    // §0 — das Vertrags-Dokument selbst steht + trägt die sechs Blöcke.
    const docPath = path.join(root, "docs/studio-vertrag.md");
    const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";
    check("Vertrag existiert (docs/studio-vertrag.md)", doc.length > 0);
    check(
        "Vertrag trägt die sechs Blöcke B1–B6 + die Empfänger-Gesetze",
        [
            "B1 — REZEPTE",
            "B2 — BUILD",
            "B3 — PLACEMENT",
            "B4 — PARAMS",
            "B5 — LEHREN",
            "B6 — VERHALTEN",
            "must-ignore",
            "fail-closed",
            "Ü1 — LICHT-INTENSITÄTEN × π",
            "Ü2 — AUTOREN-FARBEN RAW-ALS-LINEAR",
        ].every((s) => doc.includes(s))
    );

    // §3/§4 — jeder registrierte Kern erfüllt den Vertrag.
    for (const entry of CORES) {
        console.log(`\n--- Kern: ${entry.file} ---`);
        let m = null;
        try {
            m = loadCore(entry);
        } catch (e) {
            check(`${entry.file}: lädt im vm (THREE-Stub)`, false, (e && e.message) || String(e));
            continue;
        }
        const viol = validateManifest(m);
        check(`${entry.file}: 0 Vertrags-Verletzungen`, viol.length === 0, viol[0] || "");
        for (let i = 1; i < viol.length; i++) console.log(`      ↳ ${viol[i]}`);
        const n = m.presets ? Object.keys(m.presets).length : 0;
        const kinds = m.presets ? [...new Set(Object.values(m.presets).map((r) => r && r.kind))] : [];
        const unknown = kinds.filter((k) => !KNOWN_KINDS.includes(k));
        console.log(
            `      ${n} Rezepte · kinds: ${kinds.join(", ")}${unknown.length ? ` · unbekannt (must-ignore): ${unknown.join(", ")}` : ""}`
        );
        check(`${entry.file}: B1+B2 MUSS erfüllt (Rezepte + build)`, n >= 1 && typeof m.build === "function");
    }

    // §4b Ü1 — die Licht-Übersetzungs-Konstante existiert im Code (die Regel ist Struktur).
    check(
        "Ü1: AnazhRealm.LEGACY_LICHT = Math.PI existiert (r155-Migrations-Regel)",
        /LEGACY_LICHT\s*=\s*Math\.PI/.test(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"))
    );

    // §4 G4.1 — must-ignore am EINEN Auto-Register-Chokepoint: unbekannte
    // kinds werden ÜBERSPRUNGEN (continue-Filter), nie geworfen. Kommentare
    // gestrippt (die V18.267-Falle).
    const realm = fs
        .readFileSync(path.join(root, "anazhRealm.js"), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
    const reg = realm.match(/_foundryAutoRegisterSpecies\(book\)\s*\{[\s\S]{0,2500}/);
    check(
        "G4.1: der Auto-Register-Chokepoint filtert per kind (must-ignore, wirft nie)",
        !!reg && /rec\.kind\s*!==\s*"tree"\)\s*continue/.test(reg[0])
    );

    // SELBST-TEST — das Gate ist nicht vakuös: eine injizierte Verletzung
    // (Rezept ohne kind + kaputte rarity) MUSS erkannt werden.
    const broken = {
        vertrag: 1,
        presets: { testkaputt: { s: { a: 0.5 } }, "BÖSE ID": { kind: "tree" } },
        build: function () {},
        cfg: { placement: { rarity: { x: 7 } }, lod: { kindStages: { kaputt: [9], falschrum: [2, 1] } } },
        params: null,
        lehren: null,
    };
    const bv = validateManifest(broken);
    const bvVer = validateManifest({ vertrag: null, presets: { a: { kind: "tree" } }, build: function () {} });
    check(
        "SELBST-TEST: injizierte Verletzungen werden erkannt (kein-kind · Namensraum · rarity · kindStages · Version)",
        bv.some((s) => s.includes("kein kind")) &&
            bv.some((s) => s.includes("Namensraum")) &&
            bv.some((s) => s.includes("rarity")) &&
            bv.some((s) => s.includes("kindStages.kaputt")) &&
            bv.some((s) => s.includes("kindStages.falschrum")) &&
            bvVer.some((s) => s.includes("G4.3")),
        `${bv.length + bvVer.length} erkannt`
    );

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Vertrags-Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Studio-Vertrag steht als Struktur: jeder registrierte Kern erfüllt die MUSS-Blöcke, die SOLL-Blöcke validieren wo vorhanden, must-ignore ist am Chokepoint verankert, und der Selbst-Test beweist die Linse feuert."
    );
    process.exit(0);
})();
