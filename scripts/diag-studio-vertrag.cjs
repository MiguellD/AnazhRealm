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

// Die registrierten Studio-Kerne — N2 (Nervensystem-Plan, „Runtime = Validator"): die Liste
// kommt aus cores.manifest.json, der EINEN Kern-Quelle (Worker-Boot `_ensureAssetFoundry` +
// IDB-Stempel `_foundryIdbInit` + dieser Validator lesen sie). Je Eintrag: file = `vertrag`
// (das Skript, das die Manifest-Blöcke trägt), deps = die übrigen scripts davor (z. B.
// phyto-core vor foundry-core), ns = Namensraum-Kern (Vertrag v1.1 §7, Entscheid E-A): der
// ZWEIT-Kern einer Laufzeit trägt seine Manifest-Blöcke namensgleich unter EINEM Objekt
// statt top-level — löst die const-Kollision mit foundry-core
// (STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS) ohne dessen Edit.
const MANIFEST = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8"));
const CORES = MANIFEST.map((c) => ({
    file: c.vertrag,
    deps: (Array.isArray(c.scripts) ? c.scripts : []).filter((s) => s !== c.vertrag),
    ns: c.ns || undefined,
}));

const REZEPT_ID = /^[a-z0-9_-]+$/;
// Registrierte + reservierte kinds (§3 B1). Ein UNBEKANNTER kind ist KEIN
// Fehler (must-ignore G4.1) — er wird hier nur informativ gelistet.
const KNOWN_KINDS = [
    "tree",
    "shrub",
    "flower",
    "grass",
    "rock",
    "vehicle",
    "gate",
    "weapon",
    "haus",
    "building",
    "creature",
    // W-A6/W-A7 (v1.1 §8, components-only-Domänen): Klang-Genres + Körper-/Kreatur-Gestalt-Daten.
    "klang",
    "koerper",
    "kreatur",
];

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
            " meshfrei: N.MESHFREI === 1," + // v1.1 §8 — components-only-Kern (B2 N/A)
            " cfg: N.PORTAL_RENDER_CONFIG || null," +
            " paramsByKind: N.PARAMS_BY_KIND || null," +
            " arena: N.ARENA || null," + // V18.486 — Gefühls-Blöcke sind Vertrag
            " fahr: N.FAHR || null," +
            " exportDrive: N.exportDrive || null," +
            " verhalten: N.VERHALTEN || null," +
            " lehren: N.LEHREN || null }; })();";
    } else {
        code +=
            "\n;__manifest = {" +
            " vertrag: typeof STUDIO_VERTRAG !== 'undefined' ? STUDIO_VERTRAG : null," +
            " presets: typeof PRESETS !== 'undefined' ? PRESETS : null," +
            " build: typeof buildInstance !== 'undefined' ? buildInstance : null," +
            " meshfrei: typeof MESHFREI !== 'undefined' && MESHFREI === 1," +
            " cfg: typeof PORTAL_RENDER_CONFIG !== 'undefined' ? PORTAL_RENDER_CONFIG : null," +
            " paramsByKind: typeof PARAMS_BY_KIND !== 'undefined' ? PARAMS_BY_KIND : null," +
            " arena: typeof ARENA !== 'undefined' ? ARENA : null," + // V18.486
            " fahr: typeof FAHR !== 'undefined' ? FAHR : null," +
            " exportDrive: typeof exportDrive !== 'undefined' ? exportDrive : null," +
            " verhalten: typeof VERHALTEN !== 'undefined' ? VERHALTEN : null," +
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
    // v1.1 §8 — MESHFREI (components-only): ein nicht-geometrischer Kern (klang/koerper/
    // tetrapoda) deklariert MESHFREI = 1 → B2 ist N/A (er liefert DATEN, keine Gestalt;
    // der build-asset-Dispatch der Brücke überspringt ihn strukturell am typeof-Guard).
    // Ein MESHFREI-Kern, der TROTZDEM buildInstance trägt, ist widersprüchlich → rot.
    if (m.meshfrei) {
        if (typeof m.build === "function") v.push("B2/§8: MESHFREI-Kern trägt buildInstance (widersprüchlich)");
    } else if (typeof m.build !== "function") v.push("B2: buildInstance fehlt (keine Funktion)");
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
    // SYNERGIE-WELLE (v1.2) — DIE EINE B4-FORM: die Regler-Tabellen reisen als MAP
    // PARAMS_BY_KIND ({ <kind>: rows }) — auch Ein-Kind-Kerne. Das flache PARAMS ist
    // GEFALLEN (ein Kern, der es noch truege, wuerde schlicht nicht validiert —
    // must-ignore; die Werkstatt saehe keine Regler → der Bau-Fehler wird sichtbar).
    if (m.paramsByKind) {
        if (typeof m.paramsByKind !== "object" || Array.isArray(m.paramsByKind))
            v.push("B4: PARAMS_BY_KIND ist keine Map { kind: rows[] }");
        else
            for (const kind in m.paramsByKind) {
                const rows = m.paramsByKind[kind];
                if (!Array.isArray(rows)) {
                    v.push(`B4: PARAMS_BY_KIND.${kind} ist kein Array`);
                    continue;
                }
                for (const p of rows) {
                    if (!p || typeof p.id !== "string" || typeof p.lab !== "string")
                        v.push(`B4: PARAMS_BY_KIND.${kind}-Eintrag ohne id/lab`);
                    else if (!(typeof p.min === "number" && typeof p.max === "number" && p.min < p.max))
                        v.push(`B4: PARAMS_BY_KIND.${kind} "${p.id}" min/max ungültig`);
                }
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
    // V18.486 — DIE GEFÜHLS-BLÖCKE (V18.483/485) sind VERTRAG, nicht mehr nur
    // must-ignore-„darf": trägt ein Kern sie, MUSS die Struktur stimmen
    // (SOLL-Validierung; die PFLICHT je Kern prüft der Haupt-Lauf).
    const fxB =
        m.presets && m.presets.mensch && m.presets.mensch.fx && m.presets.mensch.fx.bewegung
            ? m.presets.mensch.fx.bewegung
            : null;
    if (fxB) {
        const s = fxB.schwimmen;
        if (
            !s ||
            !Number.isFinite(s.tauchV) ||
            !Number.isFinite(s.drag) ||
            !s.lean ||
            !s.pose ||
            !Number.isFinite(s.ausdauerProS)
        )
            v.push("§8.2+ fx.bewegung.schwimmen unvollständig (tauchV/drag/lean/pose/ausdauerProS)");
        const p = fxB.parkour;
        if (!p || !Number.isFinite(p.kletterV) || !Number.isFinite(p.wandAbstoss) || !Number.isFinite(p.slideTempoMul))
            v.push("§8.2+ fx.bewegung.parkour unvollständig (kletterV/wandAbstoss/slideTempoMul)");
        else if (!p.slidePose || !Number.isFinite(p.slidePose.lehne))
            v.push("§8.2+ parkour.slidePose unvollständig (lehne fehlt)");
    }
    if (m.arena) {
        const a = m.arena;
        // SPIEGEL-ZENSUS 17.07. — die gereisten Zensus-Zeilen sind Vertrag:
        // je Block deckt EIN Wander-Feld mit (windupFrac = Hieb-Geometrie,
        // stossCap = Knockback-Wucht, muendungM = Pfeil-Flug — dieselben
        // Felder, die die _arenaGesetz-Gültigkeits-Wand des Wirts prüft).
        if (
            !a.schwung ||
            !Number.isFinite(a.schwung.dauerProSqrtI) ||
            !Number.isFinite(a.schwung.windupFrac) ||
            !a.gefuehl ||
            !Number.isFinite(a.gefuehl.keRefJ) ||
            !Number.isFinite(a.gefuehl.stossCap) ||
            !a.bogen ||
            !Number.isFinite(a.bogen.mArrow) ||
            !Number.isFinite(a.bogen.muendungM)
        )
            v.push(
                "§B6+ ARENA unvollständig (schwung.dauerProSqrtI/windupFrac · gefuehl.keRefJ/stossCap · bogen.mArrow/muendungM)"
            );
    }
    if (m.fahr) {
        const L = m.fahr.lenkung;
        if (
            !L ||
            !Number.isFinite(L.sfK) ||
            !Number.isFinite(L.gripK) ||
            !Number.isFinite(L.driftGripMul) ||
            !Number.isFinite(L.kehrV)
        )
            v.push("§B6+ FAHR.lenkung unvollständig (sfK/gripK/driftGripMul/kehrV)");
    }
    if (m.verhalten) {
        const V = m.verhalten;
        const aOk = V.aktionen && typeof V.aktionen === "object" && Object.keys(V.aktionen).length >= 8;
        const sOk =
            V.stimmung &&
            typeof V.stimmung === "object" &&
            Object.values(V.stimmung).every(
                (st) => st && Array.isArray(st.aktionen) && Array.isArray(st.alle) && st.alle.length === 2
            );
        if (!aOk || !sOk) v.push("§B6+ VERHALTEN unvollständig (aktionen ≥8 / stimmung{aktionen,alle[2]})");
        else {
            for (const k in V.stimmung)
                for (const an of V.stimmung[k].aktionen)
                    if (!V.aktionen[an]) v.push(`§B6+ VERHALTEN: Stimmung "${k}" nennt unbekannte Aktion "${an}"`);
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

    // N2 — das Kern-Manifest selbst ist gültig (die eine Quelle, aus der CORES abgeleitet ist).
    check(
        "cores.manifest.json ist ein gültiger Kern-Satz (id + scripts + vertrag je Eintrag)",
        Array.isArray(MANIFEST) &&
            MANIFEST.length >= 1 &&
            MANIFEST.every(
                (c) =>
                    c &&
                    typeof c.id === "string" &&
                    Array.isArray(c.scripts) &&
                    c.scripts.length >= 1 &&
                    typeof c.vertrag === "string" &&
                    c.scripts.includes(c.vertrag)
            ),
        `${MANIFEST.length} Kern(e): ${MANIFEST.map((c) => c && c.id).join(", ")}`
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
        check(
            `${entry.file}: B1+B2 MUSS erfüllt (Rezepte + build | MESHFREI §8)`,
            n >= 1 && (typeof m.build === "function" || m.meshfrei === true)
        );
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
        // N1-migriert (V9.56-i): der kind-Filter ist die KIND_POLICY-Tabelle — ein
        // unbekannter kind hat keine Policy-Zeile und wird uebersprungen (must-ignore).
        "G4.1: der Auto-Register-Chokepoint filtert per Policy (must-ignore, wirft nie)",
        !!reg && /KP\[rec\.kind\]/.test(reg[0]) && /if \(!pol\) continue/.test(reg[0])
    );

    // V18.486 — DIE PFLICHT JE KERN: die Gefühls-Blöcke der V18.483/485-Wellen
    // sind Vertrag. Fehlt der Block im tragenden Kern, ist das ROT (vorher war
    // alles nur must-ignore-„darf" — unbewacht, konnte still fallen).
    const pflicht = {
        "koerper-core.js": (m) =>
            !!(
                m.presets &&
                m.presets.mensch &&
                m.presets.mensch.fx &&
                m.presets.mensch.fx.bewegung &&
                m.presets.mensch.fx.bewegung.schwimmen &&
                m.presets.mensch.fx.bewegung.parkour &&
                m.presets.mensch.fx.bewegung.parkour.slidePose
            ),
        "schmiede-core.js": (m) => !!(m.arena && m.arena.schwung && m.arena.gefuehl && m.arena.bogen),
        "vehicle-core.js": (m) => !!(m.fahr && m.fahr.lenkung && typeof m.exportDrive === "function"),
        "tetrapoda-core.js": (m) => !!(m.verhalten && m.verhalten.aktionen && m.verhalten.stimmung),
    };
    for (const entry of CORES) {
        if (!pflicht[entry.file]) continue;
        let m = null;
        try {
            m = loadCore(entry);
        } catch (_e) {}
        check(
            `PFLICHT ${entry.file}: trägt seinen Gefühls-Block (fx.bewegung/ARENA/FAHR.lenkung/VERHALTEN)`,
            !!m && pflicht[entry.file](m)
        );
    }
    // V18.486 — DIE SCHWIMM-PARITÄTS-WAND: der Stamm-Fallback (byte-alte Welt
    // bei kaltem Kern) MUSS dem Kern-Gesetz zahlen-gleich sein — sonst driftet
    // die Welt still, sobald jemand nur EINE Quelle editiert (die Gleichheit
    // war bisher eine reine Hand-Invariante).
    (function schwimmParitaet() {
        let kern = null;
        try {
            const kc = CORES.find((c) => c.file === "koerper-core.js");
            const m = loadCore(kc);
            kern = m.presets.mensch.fx.bewegung.schwimmen;
        } catch (_e) {}
        let stamm = null;
        try {
            const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
            const i = src.indexOf("AnazhRealm.SCHWIMM_FALLBACK =");
            const j = src.indexOf("\n});", i);
            const block = src.slice(src.indexOf("=", i) + 1, j + 3);
            stamm = vm.runInNewContext("(" + block + ")", { Object }, { timeout: 5000 });
        } catch (_e) {}
        const diffs = [];
        const tief = (a, b, pfad) => {
            if (typeof a === "number" || typeof b === "number") {
                if (a !== b) diffs.push(`${pfad}: Kern=${a} Stamm=${b}`);
                return;
            }
            if (!a || !b || typeof a !== "object" || typeof b !== "object") {
                if (String(a) !== String(b)) diffs.push(`${pfad}: Typ-Drift`);
                return;
            }
            for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) tief(a[k], b[k], pfad + "." + k);
        };
        if (kern && stamm) tief(kern, stamm, "schwimmen");
        check(
            "SCHWIMM-PARITÄT: SCHWIMM_FALLBACK (Stamm) == fx.bewegung.schwimmen (Kern), zahlen-gleich",
            !!kern && !!stamm && diffs.length === 0,
            diffs[0] ||
                (!kern
                    ? "Kern unlesbar"
                    : !stamm
                      ? "Stamm-Fallback unlesbar"
                      : `${Object.keys(kern).length} Felder gleich`)
        );
    })();

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
    // §8 — ein MESHFREI-Kern mit buildInstance ist widersprüchlich (die Linse feuert).
    const bvMesh = validateManifest({
        vertrag: 1,
        presets: { a: { kind: "klang" } },
        build: function () {},
        meshfrei: true,
    });
    // V18.486 — auch die Gefühls-Block-Prüfungen feuern auf Injektion:
    const bvFx = validateManifest({
        vertrag: 1,
        presets: {
            mensch: { kind: "koerper", fx: { bewegung: { schwimmen: { tauchV: 1 }, parkour: { kletterV: 1 } } } },
        },
        build: function () {},
        arena: { schwung: {} },
        fahr: { lenkung: { sfK: 0.05 } },
        verhalten: { aktionen: { a: {} }, stimmung: { x: { aktionen: ["fremd"], alle: [1, 2] } } },
    });
    check(
        "SELBST-TEST: injizierte Verletzungen werden erkannt (kein-kind · Namensraum · rarity · kindStages · Version · MESHFREI-Widerspruch · Gefühls-Blöcke)",
        bv.some((s) => s.includes("kein kind")) &&
            bv.some((s) => s.includes("Namensraum")) &&
            bv.some((s) => s.includes("rarity")) &&
            bv.some((s) => s.includes("kindStages.kaputt")) &&
            bv.some((s) => s.includes("kindStages.falschrum")) &&
            bvVer.some((s) => s.includes("G4.3")) &&
            bvMesh.some((s) => s.includes("MESHFREI")) &&
            bvFx.some((s) => s.includes("schwimmen unvollständig")) &&
            bvFx.some((s) => s.includes("parkour unvollständig")) &&
            bvFx.some((s) => s.includes("ARENA unvollständig")) &&
            bvFx.some((s) => s.includes("FAHR.lenkung unvollständig")) &&
            bvFx.some((s) => s.includes("VERHALTEN unvollständig")),
        `${bv.length + bvVer.length + bvMesh.length + bvFx.length} erkannt`
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
